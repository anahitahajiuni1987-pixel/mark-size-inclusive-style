import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShieldCheck, ArrowLeft, ShoppingBag, Trash2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/mark-store";
import { products, numberFa, productImageForColor, shippingToman, toman } from "@/lib/catalog";
import {
  createMellatOrder,
  mellatOrderStatusOptions,
  paymentAvailabilityOptions,
} from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { order?: string } => {
    if (typeof search["order"] !== "string") return {};
    return /^[0-9a-f-]{36}$/i.test(search["order"]) ? { order: search["order"] } : {};
  },
  loaderDeps: ({ search }) => ({ order: search.order }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(paymentAvailabilityOptions);
    if (deps.order) {
      await context.queryClient.ensureQueryData(mellatOrderStatusOptions(deps.order));
    }
  },
  head: () => ({
    meta: [
      { title: "بررسی سفارش و پرداخت | MARK" },
      {
        name: "description",
        content: "بررسی سبد خرید، اطلاعات ارسال و پرداخت امن بانک ملت در فروشگاه مارک.",
      },
      { property: "og:title", content: "بررسی سفارش | MARK" },
      { property: "og:description", content: "مرور سفارش و پرداخت بانک ملت در پوشاک مارک" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

function PaymentReceipt({ orderId }: { orderId: string }) {
  const { data: result } = useSuspenseQuery(mellatOrderStatusOptions(orderId));
  if (!result.found) {
    return (
      <section className="content-width section text-center">
        <AlertCircle className="mx-auto text-champagne" size={38} />
        <h1 className="section-title mt-5">رسید این سفارش در دسترس نیست</h1>
        <p className="text-muted-foreground mt-5">اعتبار دسترسی به رسید منقضی شده یا سفارش پیدا نشد.</p>
      </section>
    );
  }
  const paid = result.order.status === "paid";
  const pending = result.order.status === "pending";
  return (
    <main className="content-width section">
      <section className="max-w-2xl mx-auto border-y border-border py-12 text-center">
        {paid ? <Check className="mx-auto text-champagne" size={44} /> : <ShieldCheck className="mx-auto text-champagne" size={44} />}
        <p className="eyebrow mt-6">رسید سفارش مارک</p>
        <h1 className="section-title mt-4">
          {paid
            ? "پرداخت تأیید و سفارش ثبت شد"
            : pending
              ? "نتیجه پرداخت هنوز تأیید نهایی نشده"
              : result.order.status === "reversed"
                ? "تراکنش برگشت داده شد"
                : "پرداخت تأیید نشد"}
        </h1>
        <p className="text-muted-foreground leading-8 mt-5">
          {paid
            ? "تأیید و تسویه تراکنش مستقیماً از بانک ملت دریافت شده است."
            : pending
              ? "این وضعیت به معنی پرداخت موفق نیست. نتیجه نهایی باید از بانک بررسی شود."
              : "مبلغی به‌عنوان سفارش پرداخت‌شده ثبت نشده است."}
        </p>
        <dl className="grid grid-cols-2 gap-5 mt-8 text-sm">
          <div className="bg-surface p-5">
            <dt className="text-muted-foreground text-xs">شماره سفارش</dt>
            <dd className="mt-2">{numberFa(result.order.order_number)}</dd>
          </div>
          <div className="bg-surface p-5">
            <dt className="text-muted-foreground text-xs">مبلغ سفارش</dt>
            <dd className="mt-2">{toman(result.order.total_toman)}</dd>
          </div>
        </dl>
        <Button asChild variant="luxury" className="mt-8">
          <Link to="/" search={{}}>بازگشت به فروشگاه <ArrowLeft /></Link>
        </Button>
      </section>
    </main>
  );
}

function Checkout() {
  const { order } = Route.useSearch();
  const { items, remove } = useCart();
  const { data: availability } = useSuspenseQuery(paymentAvailabilityOptions);
  const [review, setReview] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (order) return <PaymentReceipt orderId={order} />;

  const allPriced = items.every((item) => products.find((product) => product.slug === item.slug)?.price);
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.slug === item.slug);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const startPayment = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await createMellatOrder({
        data: {
          customer: {
            name: values["name"] ?? "",
            mobile: values["mobile"] ?? "",
            province: values["province"] ?? "",
            city: values["city"] ?? "",
            address: values["address"] ?? "",
            postal: values["postal"] ?? "",
            notes: values["notes"] ?? "",
          },
          items,
        },
      });
      if (!result.ok) {
        setError(result.message);
        setSubmitting(false);
        return;
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.paymentUrl;
      const refId = document.createElement("input");
      refId.type = "hidden";
      refId.name = "RefId";
      refId.value = result.refId;
      form.appendChild(refId);
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("ثبت سفارش یا اتصال به بانک انجام نشد؛ هیچ پرداخت موفقی ثبت نشده است.");
      setSubmitting(false);
    }
  };

  return (
    <main className="content-width section">
      <p className="eyebrow">انتخاب شما، با اطمینان</p>
      <h1 className="section-title mt-4">{review ? "بررسی نهایی سفارش" : "تکمیل اطلاعات سفارش"}</h1>
      <div className="flex gap-5 items-center mt-6 mb-10 text-xs text-muted-foreground">
        <span className="text-champagne">۱. سبد خرید</span><span>—</span>
        <span className={!review ? "text-foreground" : ""}>۲. اطلاعات ارسال</span><span>—</span>
        <span className={review ? "text-foreground" : ""}>۳. بررسی و پرداخت</span>
      </div>
      {items.length === 0 ? (
        <section className="py-16 text-center border-y border-border">
          <ShoppingBag className="mx-auto text-champagne mb-5" size={40} />
          <h2 className="text-xl">سبد خرید شما خالی است</h2>
          <Button asChild variant="luxury" className="mt-8">
            <Link to="/" search={{}}>کشف محصولات مارک <ArrowLeft /></Link>
          </Button>
        </section>
      ) : (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <section>
            {!review ? (
              <form id="checkout-form" onSubmit={(event) => { event.preventDefault(); setReview(true); }}>
                <h2 className="text-xl mb-7">اطلاعات خریدار و ارسال</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    ["name", "نام و نام خانوادگی"], ["mobile", "شماره موبایل"],
                    ["province", "استان"], ["city", "شهر"],
                    ["address", "آدرس کامل"], ["postal", "کد پستی"],
                  ].map(([key = "", label = ""]) => (
                    <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                      <span className="field-label">{label}</span>
                      <input
                        className="field" required name={key} value={values[key] ?? ""}
                        onChange={(event) => setValues((old) => ({ ...old, [key]: event.target.value }))}
                        inputMode={key === "mobile" ? "tel" : key === "postal" ? "numeric" : "text"}
                        pattern={key === "mobile" ? "[0۰][9۹][0-9۰-۹]{9}" : key === "postal" ? "[0-9۰-۹]{10}" : undefined}
                        title={key === "mobile" ? "شماره موبایل ۱۱ رقمی با ۰۹" : key === "postal" ? "کد پستی ۱۰ رقمی" : undefined}
                        autoComplete={key === "name" ? "name" : key === "mobile" ? "tel" : key === "postal" ? "postal-code" : "off"}
                      />
                    </label>
                  ))}
                  <label className="sm:col-span-2">
                    <span className="field-label">توضیحات سفارش (اختیاری)</span>
                    <textarea className="field h-28" value={values["notes"] ?? ""}
                      onChange={(event) => setValues((old) => ({ ...old, notes: event.target.value }))} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground leading-7 mt-6">
                  اطلاعات فقط پس از تأیید نهایی برای ثبت سفارش ارسال و در فضای امن فروشگاه ذخیره می‌شود.
                </p>
                <Button variant="luxury" type="submit" className="mt-6">بررسی نهایی سفارش <ArrowLeft /></Button>
              </form>
            ) : (
              <div>
                <h2 className="text-xl mb-6 flex items-center gap-3"><Check className="text-champagne" /> مرور اطلاعات ارسال</h2>
                <dl className="space-y-5">
                  {[
                    ["name", "نام"], ["mobile", "موبایل"], ["province", "استان"],
                    ["city", "شهر"], ["address", "آدرس"], ["postal", "کد پستی"], ["notes", "توضیحات"],
                  ].map(([key = "", label = ""]) => values[key] && (
                    <div key={key} className="border-b border-border pb-4">
                      <dt className="text-xs text-muted-foreground mb-2">{label}</dt>
                      <dd className="text-sm break-words">{values[key]}</dd>
                    </div>
                  ))}
                </dl>
                <Button variant="editorial" className="mt-7" onClick={() => setReview(false)}>ویرایش اطلاعات</Button>
              </div>
            )}
          </section>
          <aside className="border-t border-border pt-6">
            <h2 className="text-xl mb-7">خلاصه سفارش {availability.missingPriceCount > 0 && <span className="text-xs text-muted-foreground">(نمایشی)</span>}</h2>
            {items.map((item, index) => {
              const product = products.find((candidate) => candidate.slug === item.slug);
              if (!product) return null;
              return (
                <div key={`${item.slug}-${item.option}-${item.color}`} className="flex gap-4 border-b border-border pb-6 mb-6">
                  <img src={productImageForColor(product, item.color)} alt={`${product.name}، ${item.color}`} className="w-20 h-24 object-cover" />
                  <div className="flex-1">
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="text-sm">{product.name}</Link>
                    <p className="text-xs text-muted-foreground mt-3">{item.color} / <bdi>{item.option}</bdi> / تعداد {numberFa(item.quantity)}</p>
                    <p className="text-xs text-champagne mt-3">قیمت واحد: {toman(product.price)}</p>
                    <p className="text-xs text-muted-foreground mt-2">قیمت کل: {product.price === null ? "نامشخص" : toman(product.price * item.quantity)}</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`حذف ${product.name}`} onClick={() => remove(index)}><Trash2 /></Button>
                </div>
              );
            })}
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">جمع محصولات</span><span>{allPriced ? toman(subtotal) : "در انتظار قیمت واقعی"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">هزینه ارسال</span><span>{shippingToman === null ? "هنوز مشخص نشده" : shippingToman === 0 ? "رایگان" : toman(shippingToman)}</span></div>
              <div className="flex justify-between border-t border-border pt-5"><span>مبلغ نهایی قابل پرداخت</span><span className="text-champagne">{allPriced && shippingToman !== null ? toman(subtotal + shippingToman) : "قابل محاسبه نیست"}</span></div>
            </div>
            <div className="bg-surface mt-8 p-5">
              <h3 className="flex gap-2 items-center text-sm"><ShieldCheck size={19} className="text-champagne" /> درگاه اینترنتی به‌پرداخت ملت</h3>
              {availability.available ? (
                <p className="text-xs leading-7 text-muted-foreground mt-3">پرداخت پس از ثبت سفارش به صفحه رسمی بانک ملت منتقل می‌شود و نتیجه از بانک تأیید خواهد شد.</p>
              ) : (
                <ul className="text-xs leading-7 text-muted-foreground mt-3 list-disc pr-4">
                  {availability.missingPriceCount > 0 && <li>قیمت واقعی {numberFa(availability.missingPriceCount)} محصول وارد نشده است.</li>}
                  {!availability.shippingConfigured && <li>هزینه ارسال مشخص نشده است.</li>}
                  {!availability.credentialsConfigured && <li>اطلاعات پذیرنده بانک ملت هنوز ثبت نشده است.</li>}
                </ul>
              )}
            </div>
            {error && <p role="alert" className="text-xs text-destructive leading-7 mt-4">{error}</p>}
            <Button variant="luxury" className="w-full mt-5" disabled={!review || !availability.available || submitting} onClick={startPayment}>
              {submitting ? "در حال ثبت سفارش و اتصال به بانک…" : availability.available ? "تأیید سفارش و پرداخت با بانک ملت" : "پرداخت بانک ملت — غیرفعال"}
            </Button>
          </aside>
        </div>
      )}
    </main>
  );
}
