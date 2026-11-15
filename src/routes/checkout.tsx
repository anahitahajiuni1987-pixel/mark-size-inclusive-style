import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ArrowLeft, ShoppingBag, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/mark-store";
import { products, numberFa, paymentConfigured } from "@/lib/catalog";
export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "بررسی سفارش و پرداخت | MARK" },
      {
        name: "description",
        content: "بررسی سبد خرید، اطلاعات ارسال و وضعیت پرداخت فروشگاه مارک.",
      },
      { property: "og:title", content: "بررسی سفارش | MARK" },
      { property: "og:description", content: "مرور سفارش و انتخاب‌های شما در پوشاک مارک" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});
function Checkout() {
  const { items, remove } = useCart();
  const [review, setReview] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <main className="content-width section">
      <p className="eyebrow">انتخاب شما، با اطمینان</p>
      <h1 className="section-title mt-4">{review ? "بررسی نهایی سفارش" : "تکمیل اطلاعات سفارش"}</h1>
      <div className="flex gap-5 items-center mt-6 mb-10 text-xs text-muted-foreground">
        <span className="text-champagne">۱. سبد خرید</span>
        <span>—</span>
        <span className={!review ? "text-foreground" : ""}>۲. اطلاعات ارسال</span>
        <span>—</span>
        <span className={review ? "text-foreground" : ""}>۳. بررسی و پرداخت</span>
      </div>
      {items.length === 0 ? (
        <section className="py-16 text-center border-y border-border">
          <ShoppingBag className="mx-auto text-champagne mb-5" size={40} />
          <h2 className="text-xl">سبد خرید شما خالی است</h2>
          <Button asChild variant="luxury" className="mt-8">
            <Link to="/" search={{}}>
              کشف محصولات مارک <ArrowLeft />
            </Link>
          </Button>
        </section>
      ) : (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <section>
            {!review ? (
              <form
                id="checkout-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setReview(true);
                }}
              >
                <h2 className="text-xl mb-7">اطلاعات خریدار و ارسال</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    ["name", "نام و نام خانوادگی"],
                    ["mobile", "شماره موبایل"],
                    ["province", "استان"],
                    ["city", "شهر"],
                    ["address", "آدرس کامل"],
                    ["postal", "کد پستی"],
                  ].map(([key = "", label = ""]) => (
                    <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                      <span className="field-label">{label}</span>
                      <input
                        className="field"
                        required
                        name={key}
                        value={values[key] ?? ""}
                        onChange={(e) => setValues((old) => ({ ...old, [key]: e.target.value }))}
                        inputMode={key === "mobile" ? "tel" : key === "postal" ? "numeric" : "text"}
                        pattern={
                          key === "mobile"
                            ? "[0۰][9۹][0-9۰-۹]{9}"
                            : key === "postal"
                              ? "[0-9۰-۹]{10}"
                              : undefined
                        }
                        title={
                          key === "mobile"
                            ? "شماره موبایل ۱۱ رقمی با ۰۹"
                            : key === "postal"
                              ? "کد پستی ۱۰ رقمی"
                              : undefined
                        }
                        autoComplete={
                          key === "name"
                            ? "name"
                            : key === "mobile"
                              ? "tel"
                              : key === "postal"
                                ? "postal-code"
                                : "off"
                        }
                      />
                    </label>
                  ))}
                  <label className="sm:col-span-2">
                    <span className="field-label">توضیحات سفارش (اختیاری)</span>
                    <textarea
                      className="field h-28"
                      value={values["notes"] ?? ""}
                      onChange={(e) => setValues((old) => ({ ...old, notes: e.target.value }))}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground leading-7 mt-6">
                  اطلاعات این فرم فقط برای مرور نمایشی استفاده می‌شود و به فروشگاه ارسال یا ذخیره
                  نمی‌شود.
                </p>
                <Button variant="luxury" type="submit" className="mt-6">
                  بررسی نهایی سفارش <ArrowLeft />
                </Button>
              </form>
            ) : (
              <div>
                <h2 className="text-xl mb-6 flex items-center gap-3">
                  <Check className="text-champagne" />
                  مرور اطلاعات ارسال
                </h2>
                <dl className="space-y-5">
                  {[
                    ["name", "نام"],
                    ["mobile", "موبایل"],
                    ["province", "استان"],
                    ["city", "شهر"],
                    ["address", "آدرس"],
                    ["postal", "کد پستی"],
                    ["notes", "توضیحات"],
                  ].map(
                    ([key = "", label = ""]) =>
                      values[key] && (
                        <div key={key} className="border-b border-border pb-4">
                          <dt className="text-xs text-muted-foreground mb-2">{label}</dt>
                          <dd className="text-sm break-words">{values[key]}</dd>
                        </div>
                      ),
                  )}
                </dl>
                <Button variant="editorial" className="mt-7" onClick={() => setReview(false)}>
                  ویرایش اطلاعات
                </Button>
              </div>
            )}
          </section>
          <aside className="border-t border-border pt-6">
            <h2 className="text-xl mb-7">
              خلاصه سفارش <span className="text-xs text-muted-foreground">(نمایشی)</span>
            </h2>
            {items.map((item, index) => {
              const p = products.find((p) => p.slug === item.slug);
              if (!p) return null;
              return (
                <div
                  key={`${item.slug}-${item.option}`}
                  className="flex gap-4 border-b border-border pb-6 mb-6"
                >
                  <img src={p.image} alt={p.name} className="w-20 h-24 object-cover" />
                  <div className="flex-1">
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="text-sm">
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-3">
                      {item.color} / <bdi>{item.option}</bdi> / تعداد {numberFa(item.quantity)}
                    </p>
                    <p className="text-xs text-champagne mt-3">قیمت واحد: اعلام نشده</p>
                    <p className="text-xs text-muted-foreground mt-2">قیمت کل: نامشخص</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`حذف ${p.name}`}
                    onClick={() => remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">جمع محصولات</span>
                <span>در انتظار قیمت واقعی</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">هزینه ارسال</span>
                <span>هنوز مشخص نشده</span>
              </div>
              <div className="flex justify-between border-t border-border pt-5">
                <span>مبلغ نهایی قابل پرداخت</span>
                <span className="text-champagne">قابل محاسبه نیست</span>
              </div>
            </div>
            <div className="bg-surface mt-8 p-5">
              <h3 className="flex gap-2 items-center text-sm">
                <ShieldCheck size={19} className="text-champagne" />
                وضعیت پرداخت
              </h3>
              <p className="text-xs leading-7 text-muted-foreground mt-3">
                درگاه پرداخت واقعی متصل نشده است. هیچ پرداخت، رزرو یا سفارش واقعی در این نسخه انجام
                نمی‌شود.
              </p>
            </div>
            <Button variant="luxury" className="w-full mt-5" disabled={!paymentConfigured}>
              تأیید سفارش و پرداخت — غیرفعال
            </Button>
          </aside>
        </div>
      )}
    </main>
  );
}
