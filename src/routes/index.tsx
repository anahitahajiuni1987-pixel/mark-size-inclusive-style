import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUpLeft,
  Ruler,
  Check,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { ProductCard, Benefits } from "@/components/mark-store";
import { products } from "@/lib/catalog";
import editorial from "@/assets/mark-editorial.jpg";
import inclusive from "@/assets/mark-inclusive.jpg";
import accessories from "@/assets/mark-accessories.jpg";
const EditorialScene = lazy(() => import("@/components/editorial-scene"));
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { category?: string | undefined } => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "MARK | استایل بزرگ، انتخاب بی‌نهایت" },
      {
        name: "description",
        content:
          "پوشاک مارک در اصفهان؛ پوشاک مردانه، سایز بزرگ، کفش و اکسسوری. استایل برای تمام سایزها.",
      },
      { property: "og:title", content: "MARK | استایل بزرگ، انتخاب بی‌نهایت" },
      {
        property: "og:description",
        content: "تخصص ما، انتخاب راحت‌تر شماست؛ پوشاک مردانه برای تمام سایزها.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
function Index() {
  const { category } = Route.useSearch();
  const [tab, setTab] = useState("جدیدترین محصولات");
  const [size, setSize] = useState("");
  const [collection, setCollection] = useState("");
  const [desktop, setDesktop] = useState(false);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    setDesktop(media.matches);
    const handler = () => setDesktop(media.matches);
    media.addEventListener("change", handler);
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        gsap.to(".hero-photo", {
          yPercent: 9,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
        });
    }, root);
    return () => {
      context.revert();
      media.removeEventListener("change", handler);
    };
  }, []);
  const shown = products.filter(
    (p) =>
      (!category ||
        !["کفش", "اکسسوری", "سایز بزرگ", "پوشاک مردانه"].includes(category) ||
        (category === "پوشاک مردانه"
          ? p.kind === "clothing"
          : category === "سایز بزرگ"
            ? p.kind === "clothing" && p.options.includes("3XL")
            : p.category === category)) &&
      (!collection ||
        (collection === "کاپشن و کت"
          ? ["کت", "کاپشن"].includes(p.category)
          : collection === "کیف"
            ? ["crossbody-bag", "backpack", "waist-bag"].includes(p.slug)
            : collection === "سویشرت"
              ? p.category === "سویشرت زیپ‌دار"
              : p.category === collection || p.name.includes(collection))) &&
      (!size || (p.options.includes(size) && !p.unavailable.includes(size))),
  );
  const browse = () => document.getElementById("products")?.scrollIntoView();
  return (
    <main ref={root}>
      <section className="hero">
        <img
          className="hero-photo"
          src={editorial}
          alt="استایل مردانه مارک با پولوشرت مشکی"
          width={1920}
          height={1024}
          fetchPriority="high"
        />
        {desktop && (
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <EditorialScene />
            </Suspense>
          </ClientOnly>
        )}
        <div className="content-width hero-content">
          <div className="eyebrow">
            کالکشن منتخب مارک <span className="mx-2 text-muted-foreground">/</span> استایل بدون مرز
          </div>
          <h1 className="hero-title">
            استایل بزرگ،
            <br />
            <span>انتخاب بی‌نهایت</span>
          </h1>
          <p className="hero-copy">
            پوشاک مردانه از سایزهای معمولی تا سایزهای بزرگ؛
            <br className="hidden md:block" /> با تنوعی که استایل شما شایسته آن است.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button variant="luxury" onClick={browse}>
              مشاهده محصولات <ArrowLeft />
            </Button>
            <Button variant="editorial" asChild>
              <Link
                to="/"
                search={{ category: "سایز بزرگ" }}
                onClick={() => setTimeout(browse, 100)}
              >
                کالکشن سایز بزرگ <ArrowUpLeft />
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-8">
            <span className="h-px w-7 bg-champagne" />
            از سایزهای معمولی تا 5XL و فراتر
          </div>
        </div>
        <div className="hero-bottom">
          <span className="flex gap-2 items-center">
            <MapPin size={13} />
            اصفهان، مجتمع پارک
          </span>
          <span className="hidden md:flex items-center gap-3">
            دنیای مارک را کشف کنید <ArrowDown size={15} />
          </span>
          <span dir="ltr" className="flex items-center gap-3">
            <span className="text-foreground">01</span>
            <span className="w-16 h-px bg-muted-foreground" />
            03
          </span>
        </div>
      </section>
      <Benefits />
      <section className="section content-width">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow mb-3">برای هر وجه از استایل شما</p>
            <h2 className="section-title">دنیای مارک را کشف کنید</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden md:block">
            انتخاب‌های ماندگار، جزئیات متمایز
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            ["پوشاک مردانه", editorial, "از روزمره تا رسمی"],
            ["سایز بزرگ", inclusive, "راحتی، بدون مرز"],
            ["کفش و اکسسوری", accessories, "جزئیاتی که تفاوت می‌سازند"],
          ].map(([name = "", image = "", caption = ""]) => (
            <Link
              key={name}
              to="/"
              search={{ category: name === "کفش و اکسسوری" ? "اکسسوری" : name }}
              onClick={() => setTimeout(browse, 100)}
              className="category-tile"
            >
              <img
                src={image}
                alt={name}
                width={1024}
                height={1280}
                loading="lazy"
                className={`category-image ${name === "پوشاک مردانه" ? "object-left" : ""}`}
              />
              <div className="category-label">
                <div>
                  <p className="text-xs text-champagne mb-2">{caption}</p>
                  <h3 className="text-2xl font-medium">{name}</h3>
                </div>
                <ArrowUpLeft />
              </div>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 mt-6">
          {[
            "تیشرت",
            "پولوشرت",
            "پیراهن",
            "شلوار",
            "شلوارک",
            "سویشرت",
            "هودی",
            "کاپشن و کت",
            "بارانی",
            "سویشرت زیپ‌دار",
            "عطر",
            "کمربند",
            "کیف",
            "کلاه",
            "جوراب",
            "کراوات",
            "کوله‌پشتی",
            "کیف کمری",
            "کفش رسمی",
            "کفش اسپرت",
            "کفش روزمره",
          ].map((n) => (
            <Button
              variant="link"
              className="p-0 text-xs text-muted-foreground h-auto"
              key={n}
              onClick={() => {
                setCollection(n);
                setTab("جدیدترین محصولات");
                browse();
              }}
            >
              {n}
            </Button>
          ))}
        </div>
      </section>
      <section className="inclusive">
        <div className="content-width grid md:grid-cols-2 items-center gap-10 md:gap-20">
          <div className="py-12 md:py-20">
            <p className="eyebrow">اندازه‌ها متفاوت‌اند. استایل، برای همه است.</p>
            <h2 className="section-title mt-6 text-[36px]">استایل برای تمام سایزها</h2>
            <p className="text-champagne mt-3 text-lg">تخصص ما، انتخاب راحت‌تر شماست.</p>
            <p className="text-sm leading-8 text-muted-foreground mt-6">
              در مارک، سایز بزرگ یک محدودیت نیست؛ فرصتی برای انتخاب بهتر است. پوشاک متناسب با اندام
              شما، با همان کیفیت و توجهی که شایسته‌اش هستید.
            </p>
            <div className="grid grid-cols-2 gap-5 text-xs mt-8">
              {[
                "تنوع سایزهای بزرگ مردانه",
                "راهنمای دقیق اندازه‌ها",
                "پوشاک مناسب اندام‌های درشت",
                "سایزهای معمولی و کوچک‌تر",
              ].map((n) => (
                <span key={n} className="flex gap-2 items-center">
                  <Check size={16} className="text-champagne" />
                  {n}
                </span>
              ))}
            </div>
            <Button className="mt-9" variant="luxury" asChild>
              <Link
                to="/"
                search={{ category: "سایز بزرگ" }}
                onClick={() => setTimeout(browse, 100)}
              >
                کشف کالکشن سایز بزرگ <ArrowLeft />
              </Link>
            </Button>
          </div>
          <img
            src={inclusive}
            alt="استایل آزاد مارک برای اندام‌های درشت"
            width={1024}
            height={1280}
            loading="lazy"
            className="inclusive-image"
          />
        </div>
      </section>
      <section id="products" className="section content-width scroll-mt-6">
        <div className="flex items-center justify-between gap-4 mb-7">
          <div>
            <p className="eyebrow mb-3">انتخاب امروز شما</p>
            <h2 className="section-title">
              {collection || (category && category !== "تماس با ما" ? category : "منتخب‌های مارک")}
            </h2>
          </div>
          <SlidersHorizontal size={20} className="text-champagne" />
        </div>
        {collection && (
          <Button variant="link" onClick={() => setCollection("")} className="mb-4 px-0">
            نمایش همهٔ محصولات
          </Button>
        )}
        <div className="flex flex-wrap justify-between gap-5 border-b border-border pb-5 mb-8">
          <div className="flex flex-wrap gap-5">
            {["جدیدترین محصولات", "پرفروش‌ترین‌ها", "پیشنهاد ویژه"].map((n) => (
              <Button
                key={n}
                variant="ghost"
                onClick={() => setTab(n)}
                className={`p-0 rounded-none text-xs ${tab === n ? "text-champagne" : "text-muted-foreground"}`}
              >
                {n}
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Ruler size={16} />
            سایز
            <select
              className="bg-background border border-border px-2 py-1"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              aria-label="فیلتر براساس سایز"
            >
              <option value="">همه سایزها</option>
              {["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          کالکشن نمایشی — قیمت، موجودی و رتبه‌بندی فروش هنوز از فروشگاه دریافت نشده‌اند.
        </p>
        {!["جدیدترین محصولات", "پرفروش‌ترین‌ها", "پیشنهاد ویژه"].includes(tab) ? (
          <div className="py-10 text-muted-foreground">
            اطلاعات محصولات «{tab}» هنوز متصل نشده است.{" "}
            <Button variant="link" onClick={() => setTab("جدیدترین محصولات")}>
              نمایش کالکشن نمونه
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-9">
            {(tab === "جدیدترین محصولات" ? shown : []).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
            {tab !== "جدیدترین محصولات" && (
              <p className="col-span-full py-10 text-muted-foreground">
                {tab === "پیشنهاد ویژه"
                  ? "تخفیف تأییدشده‌ای اعلام نشده است."
                  : "اطلاعات فروش واقعی هنوز متصل نشده است."}
              </p>
            )}
            {shown.length === 0 && tab === "جدیدترین محصولات" && (
              <p className="col-span-full py-10">محصول نمایشی با این سایز وجود ندارد.</p>
            )}
          </div>
        )}
      </section>
      <section id="store" className="section border-t border-border">
        <div className="content-width grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow">از نزدیک، متفاوت است</p>
            <h2 className="section-title mt-4">مارک؛ به اندازهٔ استایل شما</h2>
            <p className="text-muted-foreground text-sm leading-8 mt-4">
              در قلب اصفهان، مارک مقصدی برای انتخاب پوشاک مردانه و تخصصی سایز بزرگ است. برای دیدن
              جنس، پیدا کردن اندازهٔ مناسب و انتخاب استایل خود، به ما سر بزنید.
            </p>
            <p className="flex items-center gap-3 mt-6">
              <MapPin className="text-champagne" size={20} />
              اصفهان، مجتمع پارک، پوشاک مارک
            </p>
            <Button asChild variant="editorial" className="mt-7">
              <a
                href="https://www.google.com/maps/search/?api=1&query=اصفهان+مجتمع+پارک+پوشاک+مارک"
                target="_blank"
                rel="noreferrer"
              >
                مسیریابی فروشگاه <ArrowUpLeft />
              </a>
            </Button>
          </div>
          <div className="map-pattern h-72 flex flex-col gap-5 items-center justify-center border border-border">
            <MapPin size={38} className="text-champagne" />
            <span className="mark-logo" dir="ltr">
              MARK.
            </span>
            <span className="text-xs text-muted-foreground">اصفهان • مجتمع پارک</span>
            <span className="text-[10px] text-muted-foreground">
              موقعیت دقیق در نقشه با جستجوی نام فروشگاه
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
