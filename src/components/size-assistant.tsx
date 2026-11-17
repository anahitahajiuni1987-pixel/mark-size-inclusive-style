import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { numberFa, type Product } from "@/lib/catalog";
import { isBottomProduct, sizeChartForProduct, type FitPreference, type SizeRecommendation } from "@/lib/sizing";
import { recommendProductSize } from "@/lib/size-recommendation.functions";

const initialFields = {
  height: "",
  weight: "",
  chest: "",
  waist: "",
  hip: "",
  garmentChest: "",
  garmentLength: "",
};

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : null;
}

export function SizeChart({ product }: { product: Product }) {
  const chart = sizeChartForProduct(product);
  const bottom = isBottomProduct(product);
  return (
    <div>
      <p className="text-sm leading-7 text-muted-foreground mb-5">
        تمام اندازه‌ها سانتی‌متر و صرفاً برای نمایش عملکرد راهنما هستند؛ جدول تأییدشدهٔ فروشگاه هنوز دریافت نشده است.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse" dir="ltr">
          <thead>
            <tr className="border-y border-border text-champagne">
              <th className="p-3">Size</th>
              {!bottom && <th className="p-3">دور سینه بدن</th>}
              <th className="p-3">دور کمر بدن</th>
              <th className="p-3">دور باسن بدن</th>
              <th className="p-3">{bottom ? "دور کمر لباس" : "دور سینه لباس"}</th>
              <th className="p-3">قد لباس</th>
            </tr>
          </thead>
          <tbody>
            {chart.map((row) => (
              <tr key={row.size} className="border-b border-border">
                <td className="p-3 font-medium">{row.size}</td>
                {!bottom && <td className="p-3" dir="rtl">{numberFa(row.chest[0])} تا {numberFa(row.chest[1])}</td>}
                <td className="p-3" dir="rtl">{numberFa(row.waist[0])} تا {numberFa(row.waist[1])}</td>
                <td className="p-3" dir="rtl">{numberFa(row.hip[0])} تا {numberFa(row.hip[1])}</td>
                <td className="p-3">{numberFa(row.garmentChest)}</td>
                <td className="p-3">{numberFa(row.garmentLength)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SizeAssistant({ product, onSelect }: { product: Product; onSelect: (size: string) => void }) {
  const [fields, setFields] = useState(initialFields);
  const [fit, setFit] = useState<FitPreference>("regular");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SizeRecommendation | null>(null);
  const recommend = useServerFn(recommendProductSize);
  const bottom = isBottomProduct(product);

  const update = (key: keyof typeof fields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await recommend({
        data: {
          slug: product.slug,
          measurements: {
            height: Number(fields.height),
            weight: optionalNumber(fields.weight),
            chest: bottom ? optionalNumber(fields.chest) : Number(fields.chest),
            waist: Number(fields.waist),
            hip: optionalNumber(fields.hip),
            garmentChest: optionalNumber(fields.garmentChest),
            garmentLength: optionalNumber(fields.garmentLength),
            fit,
          },
        },
      });
      if (response.ok) setResult(response.recommendation);
      else setError(response.error);
    } catch (cause) {
      setError(cause instanceof Error && cause.message.length < 180 ? cause.message : "ارتباط برقرار نشد؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const measurementField = (key: keyof typeof fields, label: string, required = false) => (
    <label key={key}>
      <span className="field-label">{label}{required ? " *" : ""}</span>
      <input
        className="field"
        dir="ltr"
        type="number"
        inputMode="decimal"
        min="1"
        step="0.5"
        required={required}
        value={fields[key]}
        onChange={(event) => update(key, event.target.value)}
        aria-label={label}
      />
    </label>
  );

  return (
    <div>
      <p className="text-sm leading-7 text-muted-foreground mb-5">
        اندازه‌های بدن و لباس راحت‌تان را وارد کنید تا پیشنهاد بر اساس جدول نمایشی {product.name} ساخته شود.
      </p>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        {measurementField("height", "قد (سانتی‌متر)", true)}
        {measurementField("weight", "وزن (کیلوگرم، اختیاری)")}
        {!bottom && measurementField("chest", "دور سینه (سانتی‌متر)", true)}
        {bottom && <input type="hidden" value={fields.chest} aria-hidden="true" />}
        {measurementField("waist", "دور کمر (سانتی‌متر)", true)}
        {measurementField("hip", "دور باسن (اختیاری)")}
        {measurementField("garmentChest", bottom ? "دور کمر لباس دلخواه" : "دور سینه لباس دلخواه")}
        {measurementField("garmentLength", "قد لباس دلخواه")}
        <label className="col-span-2">
          <span className="field-label">فرم دلخواه لباس</span>
          <select className="field" value={fit} onChange={(event) => setFit(event.target.value as FitPreference)} aria-label="فرم دلخواه لباس">
            <option value="slim">نزدیک به بدن، بدون فشار</option>
            <option value="regular">استاندارد و راحت</option>
            <option value="relaxed">آزادتر</option>
          </select>
        </label>
        <Button type="submit" variant="luxury" className="col-span-2" disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
          {loading ? "در حال بررسی جدول سایز…" : "دریافت پیشنهاد سایز"}
        </Button>
      </form>
      <p className="text-[11px] leading-6 text-muted-foreground mt-4">
        اندازه‌ها برای ذخیره در فروشگاه ارسال نمی‌شوند. این پیشنهاد نهایی یا تضمین اندازه‌گیری نیست و جدول واقعی فروشگاه باید جایگزین جدول نمایشی شود.
      </p>
      {error && <p role="alert" className="text-sm leading-7 text-destructive mt-5">{error}</p>}
      {result && (
        <section className="border border-champagne p-5 mt-6" aria-live="polite">
          <p className="eyebrow mb-4">پیشنهاد برای این محصول</p>
          <div className="flex items-center justify-between gap-4">
            <strong className="text-3xl" dir="ltr">{result.size}</strong>
            <Button variant="editorial" onClick={() => onSelect(result.size)}>
              <Check /> انتخاب سایز {result.size}
            </Button>
          </div>
          <p className="text-sm leading-7 mt-4">{result.reason}</p>
          {result.alternativeSize && (
            <p className="text-xs text-muted-foreground mt-3">سایز جایگزین برای مقایسه: <span dir="ltr">{result.alternativeSize}</span></p>
          )}
          <p className="text-xs leading-7 text-muted-foreground mt-3">{result.measurementNote}</p>
        </section>
      )}
    </div>
  );
}
