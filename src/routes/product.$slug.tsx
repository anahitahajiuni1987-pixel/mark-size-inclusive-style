import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Ruler, Minus, Plus, ShoppingBag, Check, ZoomIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, ProductCard, useCart } from "@/components/mark-store";
import { SizeAssistant, SizeChart } from "@/components/size-assistant";
import { products, canSelect, numberFa, selectedColor } from "@/lib/catalog";
export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const p = products.find((p) => p.slug === params.slug);
    const title = `${p?.name ?? "محصول یافت نشد"} | MARK`;
    return {
      meta: [
        { title },
        { name: "description", content: p?.description ?? "محصول موردنظر یافت نشد." },
        { property: "og:title", content: title },
        { property: "og:description", content: "انتخاب دقیق سایز و جزئیات پوشاک مارک" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});
function ProductPage() {
  const { slug } = Route.useParams();
  return <ProductDetails key={slug} slug={slug} />;
}
function ProductDetails({ slug }: { slug: string }) {
  const p = products.find((p) => p.slug === slug);
  const [option, setOption] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [modal, setModal] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [colorId, setColorId] = useState("black");
  const { add } = useCart();
  if (!p)
    return (
      <main className="content-width section">
        <h1 className="section-title">محصول یافت نشد</h1>
        <Button asChild variant="luxury" className="mt-6">
          <Link to="/" search={{}}>
            بازگشت به مارک
          </Link>
        </Button>
      </main>
    );
  const color = selectedColor(p, colorId);
  const images = color?.gallery ?? [p.image];
  const colorName = color?.name ?? "تک‌رنگ";
  const addItem = () => {
    if (!canSelect(p, option)) return;
    add({ slug: p.slug, option, quantity, color: colorName });
    setAdded(true);
  };
  return (
    <main className="content-width section">
      <div className="text-xs text-muted-foreground flex gap-3 mb-8">
        <Link to="/" search={{}}>
          صفحه اصلی
        </Link>
        <span>/</span>
        <span>{p.category}</span>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-10 lg:gap-20">
        <div>
          <div className="gallery-zoom relative" onClick={() => setModal("zoom")}>
            <img
              src={images[imageIndex]}
              alt={`${p.name}، رنگ ${colorName}${p.kind === "clothing" ? " روی مدل" : ""}`}
              data-testid="product-gallery-image"
              width={1024}
              height={1280}
              className="product-image"
            />
            <Button
              className="absolute bottom-4 left-4"
              variant="secondary"
              size="icon"
              aria-label="بزرگ‌نمایی تصویر"
              onClick={() => setModal("zoom")}
            >
              <ZoomIn />
            </Button>
          </div>
          <div className="flex gap-3 mt-4">
            {images.map((image, i) => (
              <Button
                key={i}
                variant="outline"
                className={`p-0 w-20 h-24 overflow-hidden ${i === imageIndex ? "border-champagne" : ""}`}
                aria-label={`تصویر ${numberFa(i + 1)}`}
                onClick={() => setImageIndex(i)}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            تصاویر ساخته‌شده برای نمایش کالکشن؛ عکس محصول واقعی نیستند.
          </p>
        </div>
        <div>
          <p className="eyebrow">کالکشن منتخب MARK</p>
          <h1 className="section-title mt-5">{p.name}</h1>
          <div className="border-b border-border pb-6 mt-5">
            <p className="text-xl text-champagne">قیمت اعلام نشده</p>
            <p className="text-xs text-muted-foreground mt-3">
              نمونهٔ نمایشی • موجودی واقعی هنوز متصل نشده است
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-8 mt-6">{p.description}</p>
          {p.colors && <div className="mt-7">
            <p className="text-sm mb-4">
              رنگ: {colorName} <span className="text-muted-foreground text-xs">(نمایشی)</span>
            </p>
            <div className="flex gap-3">
              {(p.colors ?? [{ id: "black", name: "مشکی" }]).map((c) => (
                <Button
                  key={c.id}
                  variant="outline"
                  size="icon"
                  title={c.name}
                  aria-label={`رنگ ${c.name}`}
                  aria-pressed={colorName === c.name}
                  className={colorName === c.name ? "border-champagne" : ""}
                  onClick={() => {
                    setColorId(c.id);
                    setImageIndex(0);
                    setAdded(false);
                  }}
                >
                  <span className={`swatch swatch-${c.id}`} />
                </Button>
              ))}
            </div>
          </div>}
          <div className="flex flex-wrap justify-between items-center gap-3 mt-6">
            <p className="text-sm">
              {p.optionLabel ?? (p.kind === "accessory" ? "ابعاد" : "انتخاب سایز")}
            </p>
            {p.kind === "clothing" && (
              <span className="flex flex-wrap gap-4">
                <Button
                  variant="link"
                  className="text-champagne px-0 text-xs"
                  onClick={() => setModal("size")}
                >
                  <Ruler /> جدول سایز
                </Button>
                <Button
                  variant="link"
                  className="text-champagne px-0 text-xs"
                  onClick={() => setModal("fit")}
                >
                  <Sparkles /> پیشنهاد سایز با AI
                </Button>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4" dir="ltr">
            {p.options.map((o) => (
              <Button
                key={o}
                variant={option === o ? "default" : "outline"}
                className="min-w-12 h-11"
                disabled={!canSelect(p, o)}
                aria-pressed={option === o}
                onClick={() => {
                  setOption(o);
                  setAdded(false);
                }}
              >
                {o}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            گزینه‌های غیرفعال قابل انتخاب نیستند؛ همهٔ اندازه‌ها در این نسخه نمایشی‌اند.
          </p>
          <div className="flex items-center justify-between mt-8">
            <span className="text-sm">تعداد</span>
            <div className="flex items-center border border-border">
              <Button
                variant="ghost"
                size="icon"
                aria-label="کاهش تعداد"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Minus />
              </Button>
              <span className="w-12 text-center" aria-label="تعداد محصول">
                {numberFa(quantity)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="افزایش تعداد"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus />
              </Button>
            </div>
          </div>
          <Button
            className="w-full mt-7"
            variant="luxury"
            disabled={!canSelect(p, option)}
            onClick={addItem}
          >
            {added ? <Check /> : <ShoppingBag />}
            {added ? "به سبد نمایشی اضافه شد" : "افزودن به سبد نمایشی"}
          </Button>
          {added && (
            <Button className="w-full mt-3" variant="editorial" asChild>
              <Link to="/checkout">
                بررسی سبد خرید <ArrowLeft />
              </Link>
            </Button>
          )}
          <Button className="w-full mt-3" variant="editorial" disabled>
            خرید اکنون — فعلاً غیرفعال
          </Button>
          <p className="text-xs text-muted-foreground leading-7 mt-5">
            هیچ خرید یا رزرو واقعی ثبت نمی‌شود. پرداخت پس از اتصال فروشگاه و تأیید قیمت و موجودی
            فعال خواهد شد.
          </p>
        </div>
      </div>
      <section className="mt-20">
        <h2 className="section-title mb-8">استایل خود را کامل کنید</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {products
            .filter((i) => i.slug !== slug)
            .slice(0, 3)
            .map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
        </div>
      </section>
      {modal && (
        <Modal
          title={modal === "size" ? "جدول سایز نمایشی" : modal === "fit" ? "دستیار پیشنهاد سایز" : "جزئیات تصویر"}
          close={() => setModal(null)}
        >
          {modal === "zoom" ? (
            <img src={images[imageIndex]} alt={`${p.name}، ${colorName}`} className="w-full" />
          ) : modal === "fit" ? (
            <SizeAssistant
              product={p}
              onSelect={(size) => {
                setOption(size);
                setAdded(false);
                setModal(null);
              }}
            />
          ) : (
            <SizeChart product={p} />
          )}
        </Modal>
      )}
    </main>
  );
}
