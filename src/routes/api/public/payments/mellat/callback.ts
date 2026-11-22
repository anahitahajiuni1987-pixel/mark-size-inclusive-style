import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { canMarkMellatPaid, mellatCallbackMatches } from "@/lib/mellat";

const callbackSchema = z.object({
  RefId: z.string().max(200).optional().default(""),
  ResCode: z.string().regex(/^\d+$/),
  SaleOrderId: z.string().regex(/^\d+$/),
  SaleReferenceId: z.string().max(200).optional().default(""),
});

function returnToCheckout(request: Request, orderId: string) {
  const location = new URL("/checkout", request.url);
  location.searchParams.set("order", orderId);
  return new Response(null, {
    status: 303,
    headers: { Location: location.toString(), "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/payments/mellat/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let orderId: string | undefined;
        try {
          const form = await request.formData();
          const parsed = callbackSchema.parse({
            RefId: form.get("RefId") ?? "",
            ResCode: form.get("ResCode"),
            SaleOrderId: form.get("SaleOrderId"),
            SaleReferenceId: form.get("SaleReferenceId") ?? "",
          });
          const orderNumber = Number(parsed.SaleOrderId);
          if (!Number.isSafeInteger(orderNumber)) return new Response("Invalid order", { status: 400 });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("id, order_number, provider_ref_id, status, sale_reference_id")
            .eq("order_number", orderNumber)
            .maybeSingle();
          if (!order) return new Response("Order not found", { status: 404 });
          orderId = order.id;

          if (!mellatCallbackMatches(order.provider_ref_id, parsed.RefId)) {
            return new Response("Payment reference mismatch", { status: 400 });
          }

          if (parsed.ResCode !== "0") {
            await supabaseAdmin
              .from("orders")
              .update({ status: "failed", failure_code: parsed.ResCode, updated_at: new Date().toISOString() })
              .eq("id", order.id)
              .in("status", ["pending", "failed"]);
            await supabaseAdmin.from("payment_events").insert({
              order_id: order.id,
              event: "callback_failed",
              response_code: parsed.ResCode,
            });
            return returnToCheckout(request, order.id);
          }

          if (!parsed.SaleReferenceId) {
            return new Response("Payment reference mismatch", { status: 400 });
          }
          if (order.status === "paid" && order.sale_reference_id === parsed.SaleReferenceId) {
            return returnToCheckout(request, order.id);
          }

          const { reverseMellatPayment, settleMellatPayment, verifyMellatPayment } = await import(
            "@/lib/mellat.server"
          );
          let verificationCode: string;
          try {
            verificationCode = await verifyMellatPayment(orderNumber, parsed.SaleReferenceId);
          } catch {
            await supabaseAdmin
              .from("orders")
              .update({ status: "pending", failure_code: "verification_unconfirmed", updated_at: new Date().toISOString() })
              .eq("id", order.id);
            await supabaseAdmin.from("payment_events").insert({
              order_id: order.id,
              event: "verification_failed",
              response_code: "verification_unconfirmed",
            });
            return returnToCheckout(request, order.id);
          }

          if (verificationCode !== "0") {
            let reversed = false;
            try {
              reversed = (await reverseMellatPayment(orderNumber, parsed.SaleReferenceId)) === "0";
            } catch {
              reversed = false;
            }
            await supabaseAdmin
              .from("orders")
              .update({
                status: reversed ? "reversed" : "failed",
                failure_code: verificationCode,
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id);
            await supabaseAdmin.from("payment_events").insert({
              order_id: order.id,
              event: reversed ? "reversed" : "verification_failed",
              response_code: verificationCode,
            });
            return returnToCheckout(request, order.id);
          }

          await supabaseAdmin.from("payment_events").insert({ order_id: order.id, event: "verified" });
          const settlementCode = await settleMellatPayment(orderNumber, parsed.SaleReferenceId);
          if (settlementCode !== "0") {
            await supabaseAdmin
              .from("orders")
              .update({ status: "pending", failure_code: "settlement_unconfirmed", updated_at: new Date().toISOString() })
              .eq("id", order.id);
            await supabaseAdmin.from("payment_events").insert({
              order_id: order.id,
              event: "verification_failed",
              response_code: settlementCode,
            });
            return returnToCheckout(request, order.id);
          }

          if (!canMarkMellatPaid(verificationCode, settlementCode)) {
            throw new Error("Bank verification and settlement are required");
          }
          const now = new Date().toISOString();
          await supabaseAdmin
            .from("orders")
            .update({
              status: "paid",
              sale_reference_id: parsed.SaleReferenceId,
              failure_code: null,
              paid_at: now,
              settled_at: now,
              updated_at: now,
            })
            .eq("id", order.id)
            .in("status", ["pending", "failed"]);
          await supabaseAdmin.from("payment_events").insert({
            order_id: order.id,
            event: "settled",
            response_code: "0",
          });
          return returnToCheckout(request, order.id);
        } catch {
          if (orderId) return returnToCheckout(request, orderId);
          return new Response("Invalid payment callback", { status: 400 });
        }
      },
    },
  },
});
