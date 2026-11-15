import { createContext, useContext, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpLeft,
  Search,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Ruler,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, numberFa, type CartItem, type Product } from "@/lib/catalog";

const CartContext = createContext<{
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (index: number) => void;
} | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  return (
    <CartContext.Provider
      value={{
        items,
        add: (item) =>
          setItems((old) => {
            const index = old.findIndex(
              (i) => i.slug === item.slug && i.option === item.option && i.color === item.color,
            );
            return index < 0
              ? [...old, item]
              : old.map((i, n) =>
                  n === index ? { ...i, quantity: i.quantity + item.quantity } : i,
                );
          }),
        remove: (index) => setItems((old) => old.filter((_, n) => n !== index)),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("StoreProvider required");
  return context;
}
export function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button size="icon" variant="ghost" aria-label="بستن" onClick={close}>
            <X />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
const nav = [
  "صفحه اصلی",
  "پوشاک مردانه",
  "سایز بزرگ",
  "کفش",
  "اکسسوری",
  "جدیدترین‌ها",
  "تماس با ما",
];
export function Header() {
  const [panel, setPanel] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { items } = useCart();
  const navigate = useNavigate();
  const go = (label: string) => {
    setPanel(null);
    void navigate({
      to: "/",
      search: { category: label === "صفحه اصلی" ? undefined : label },
    }).then(() => {
      if (label === "تماس با ما") document.getElementById("store")?.scrollIntoView();
      else if (label !== "صفحه اصلی") document.getElementById("products")?.scrollIntoView();
    });
  };
  return (
    <>
      <header className="site-header">
        <div className="content-width flex h-full items-center justify-between gap-6">
          <Link to="/" search={{}} aria-label="مارک، صفحه اصلی" className="flex flex-col gap-2">
            <span className="mark-logo" dir="ltr">
              MARK<span className="text-champagne">.</span>
            </span>
            <span className="text-[8px] text-muted-foreground">پوشاک مردانه • استایل بدون مرز</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-5" aria-label="منوی اصلی">
            {nav.map((n, i) => (
              <Button
                key={n}
                variant="ghost"
                onClick={() => go(n)}
                className={`px-0 text-xs rounded-none ${i === 0 ? "text-champagne" : "text-muted-foreground"}`}
              >
                {n}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Button
              title="جستجو"
              aria-label="جستجو"
              variant="ghost"
              size="icon"
              onClick={() => setPanel("search")}
            >
              <Search size={19} />
            </Button>
            <Button
              title="حساب کاربری"
              aria-label="حساب کاربری"
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => setPanel("account")}
            >
              <UserRound size={19} />
            </Button>
            <Button asChild variant="ghost" size="icon" title="سبد خرید" className="relative">
              <Link to="/checkout" aria-label="سبد خرید">
                <ShoppingBag size={19} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -left-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] grid place-items-center">
                    {numberFa(items.reduce((s, i) => s + i.quantity, 0))}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              aria-label="منو"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setPanel("menu")}
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>
      {panel && (
        <Modal
          title={
            panel === "search"
              ? "جستجوی محصولات"
              : panel === "menu"
                ? "مارک | استایل بدون مرز"
                : "حساب کاربری"
          }
          close={() => setPanel(null)}
        >
          {panel === "menu" ? (
            <nav className="flex flex-col items-stretch">
              {nav.map((n) => (
                <Button
                  className="justify-start h-12"
                  variant="ghost"
                  key={n}
                  onClick={() => go(n)}
                >
                  {n}
                  <ArrowLeft className="mr-auto" />
                </Button>
              ))}
              <Button variant="ghost" onClick={() => setPanel("account")}>
                حساب کاربری
              </Button>
            </nav>
          ) : panel === "account" ? (
            <p className="text-muted-foreground leading-8">
              ورود به حساب کاربری پس از اتصال فروشگاه فعال خواهد شد.
            </p>
          ) : (
            <>
              <input
                className="field"
                aria-label="نام محصول"
                placeholder="چه چیزی به استایل شما می‌آید؟"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className="mt-5 space-y-3">
                {products
                  .filter((p) => p.name.includes(query) || p.category.includes(query))
                  .map((p) => (
                    <Link
                      key={p.slug}
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={() => setPanel(null)}
                      className="flex items-center gap-4 p-2 hover:bg-accent"
                    >
                      <img src={p.image} alt="" className="w-14 h-16 object-cover" />
                      <span>{p.name}</span>
                      <ArrowUpLeft className="mr-auto w-4" />
                    </Link>
                  ))}
                {products.filter((p) => p.name.includes(query) || p.category.includes(query))
                  .length === 0 && (
                  <p className="py-6 text-muted-foreground">محصولی با این نام پیدا نشد.</p>
                )}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="content-width py-14 grid md:grid-cols-3 gap-10">
        <div>
          <span className="mark-logo" dir="ltr">
            MARK.
          </span>
          <p className="text-sm leading-8 text-muted-foreground mt-6 max-w-xs">
            استایل، به اندازهٔ شما.
            <br />
            پوشاک مردانه از سایزهای معمولی تا سایزهای بزرگ.
          </p>
        </div>
        <div>
          <h3 className="mb-5">دنیای مارک</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {["پوشاک مردانه", "سایز بزرگ", "کفش", "اکسسوری"].map((n) => (
              <Link key={n} to="/" search={{ category: n }}>
                {n}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-7">
            محصولات و تصاویر این نسخه نمایشی هستند.
          </p>
        </div>
        <div>
          <h3 className="mb-5">به مارک سر بزنید</h3>
          <p className="text-sm text-muted-foreground flex gap-2">
            <MapPin size={18} />
            اصفهان، مجتمع پارک، پوشاک مارک
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=%D8%A7%D8%B5%D9%81%D9%87%D8%A7%D9%86+%D9%85%D8%AC%D8%AA%D9%85%D8%B9+%D9%BE%D8%A7%D8%B1%DA%A9+%D9%BE%D9%88%D8%B4%D8%A7%DA%A9+%D9%85%D8%A7%D8%B1%DA%A9"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 text-champagne text-sm mt-5"
          >
            مسیریابی فروشگاه <ArrowUpLeft size={16} />
          </a>
        </div>
      </div>
      <div className="content-width border-t border-border py-6 flex justify-between text-[10px] text-muted-foreground">
        <span>تمام حقوق برای پوشاک مارک محفوظ است.</span>
        <span dir="ltr">MARK © 2026</span>
      </div>
    </footer>
  );
}
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group">
      <div className="overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1280}
          className="product-image transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 bg-background/80 text-foreground text-[10px] px-3 py-1">
          نمونهٔ نمایشی
        </span>
        <span className="absolute bottom-4 left-4 bg-background/80 p-2">
          <ArrowUpLeft size={18} />
        </span>
      </div>
      <p className="text-muted-foreground text-[10px] mt-5 mb-2">MARK / {product.category}</p>
      <h3 className="text-sm md:text-base">{product.name}</h3>
      <p className="text-xs text-muted-foreground mt-3">قیمت اعلام نشده</p>
    </Link>
  );
}
export function Benefits() {
  return (
    <div className="border-y border-border">
      <div className="content-width grid grid-cols-2 md:grid-cols-4 gap-5 py-7">
        {[
          [Ruler, "انتخاب دقیق سایز"],
          [PackageCheck, "تنوع برای تمام اندام‌ها"],
          [ShieldCheck, "انتخاب با اطمینان"],
          [MapPin, "خرید حضوری در اصفهان"],
        ].map(([Icon, text]) => {
          const I = Icon as typeof Ruler;
          return (
            <div
              key={String(text)}
              className="flex items-center justify-center gap-3 text-xs text-muted-foreground"
            >
              <I className="text-champagne w-5 h-5" />
              <span>{String(text)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
