import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { products, shippingToman } from "./catalog";
import { priceOrder } from "./orders";
import { MELLAT_PAYMENT_URL } from "./mellat";

const normalizeDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));

const customerSchema = z.object({
  name: z.string().trim().min(3).max(100),
  mobile: z.string().transform(normalizeDigits).pipe(z.string().regex(/^09\d{9}$/)),
  province: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(10).max(500),
  postal: z.string().transform(normalizeDigits).pipe(z.string().regex(/^\d{10}$/)),
  notes: z.string().trim().max(1000).optional().default(""),
});

const checkoutSchema = z.object({
  customer: customerSchema,
  items: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/).max(80),
        option: z.string().trim().min(1).max(60),
        color: z.string().trim().min(1).max(60),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50),
});

async function hashAccessToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createAccessToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const getPaymentAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const { hasMellatCredentials } = await import("./mellat.server");
  const missingPriceCount = products.filter(
    (product) =>
      product.price === null || !Number.isSafeInteger(product.price) || product.price <= 0,
  ).length;
  const shippingConfigured =
    shippingToman !== null && Number.isSafeInteger(shippingToman) && shippingToman >= 0;
  const credentialsConfigured = hasMellatCredentials();
  return {
    available: missingPriceCount === 0 && shippingConfigured && credentialsConfigured,
    missingPriceCount,
    shippingConfigured,
    credentialsConfigured,
  };
});

export const paymentAvailabilityOptions = queryOptions({
  queryKey: ["mellat-payment-availability"],
  queryFn: () => getPaymentAvailability(),
  staleTime: 30_000,
});

export const createMellatOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const availability = await getPaymentAvailability();
      if (!availability.available) {
        return {
          ok: false as const,
          message: "پرداخت واقعی تا واردشدن قیمت کالاها، هزینه ارسال و اطلاعات پذیرنده بانک ملت فعال نمی‌شود.",
        };
      }
      const priced = priceOrder(data.items);
      const token = createAccessToken();
      const accessTokenHash = await hashAccessToken(token);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          access_token_hash: accessTokenHash,
          customer_name: data.customer.name,
          mobile: data.customer.mobile,
          province: data.customer.province,
          city: data.customer.city,
          address: data.customer.address,
          postal_code: data.customer.postal,
          notes: data.customer.notes || null,
          total_toman: priced.total,
          status: "pending",
        })
        .select("id, order_number")
        .single();
      if (orderError || !order) throw new Error("ثبت سفارش انجام نشد.");

      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(priced.items.map((item) => ({ ...item, order_id: order.id })));
      if (itemsError) {
        await supabaseAdmin.from("orders").delete().eq("id", order.id);
        throw new Error("ثبت اقلام سفارش انجام نشد.");
      }
      await supabaseAdmin.from("payment_events").insert({ order_id: order.id, event: "created" });

      const { requestMellatPayment } = await import("./mellat.server");
      let refId: string;
      try {
        refId = await requestMellatPayment({
          orderNumber: order.order_number,
          amountToman: priced.total,
          mobile: data.customer.mobile,
        });
      } catch {
        await supabaseAdmin
          .from("orders")
          .update({ status: "failed", failure_code: "payment_request_failed", updated_at: new Date().toISOString() })
          .eq("id", order.id);
        await supabaseAdmin.from("payment_events").insert({
          order_id: order.id,
          event: "callback_failed",
          response_code: "payment_request_failed",
        });
        return { ok: false as const, message: "اتصال به بانک ملت برقرار نشد؛ هیچ پرداختی انجام نشده است." };
      }

      await supabaseAdmin
        .from("orders")
        .update({ provider_ref_id: refId, updated_at: new Date().toISOString() })
        .eq("id", order.id);
      await supabaseAdmin.from("payment_events").insert({ order_id: order.id, event: "redirected" });

      setCookie("mark_order_access", `${order.id}.${token}`, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/checkout",
        maxAge: 60 * 60 * 24,
      });
      return { ok: true as const, orderId: order.id, refId, paymentUrl: MELLAT_PAYMENT_URL };
    } catch (error) {
      const message = error instanceof Error ? error.message : "ثبت سفارش انجام نشد.";
      return { ok: false as const, message };
    }
  });

export const getMellatOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const access = getCookie("mark_order_access") ?? "";
    const [cookieOrderId, token] = access.split(".");
    if (cookieOrderId !== data.orderId || !token) return { found: false as const };
    const accessTokenHash = await hashAccessToken(token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("order_number, status, total_toman")
      .eq("id", data.orderId)
      .eq("access_token_hash", accessTokenHash)
      .maybeSingle();
    if (!order) return { found: false as const };
    return { found: true as const, order };
  });

export const mellatOrderStatusOptions = (orderId: string) =>
  queryOptions({
    queryKey: ["mellat-order-status", orderId],
    queryFn: () => getMellatOrderStatus({ data: { orderId } }),
    staleTime: 0,
  });
