import polo from "@/assets/mark-polo.jpg";
import inclusive from "@/assets/mark-inclusive.jpg";
import accessories from "@/assets/mark-accessories.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  image: string;
  kind: "clothing" | "shoes" | "accessory";
  options: string[];
  unavailable: string[];
  description: string;
  price: number | null;
};
export const products: Product[] = [
  {
    slug: "textured-polo",
    name: "پولوشرت بافت‌دار مشکی",
    category: "پولوشرت",
    image: polo,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: ["S", "5XL"],
    description:
      "بافت ظریف، یقه کلاسیک و فرمی آزاد؛ انتخابی مینیمال برای یک استایل روزمره متمایز. تصویر و گزینه‌های این محصول نمایشی هستند؛ جنس و اندازه‌های نهایی پس از اتصال اطلاعات فروشگاه مشخص می‌شوند.",
    price: null,
  },
  {
    slug: "relaxed-overshirt",
    name: "پیراهن آزاد مردانه",
    category: "سایز بزرگ",
    image: inclusive,
    kind: "clothing",
    options: ["L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: ["L"],
    description:
      "فرم آزاد و خطوط ساده برای استایلی راحت و باوقار در تمام سایزها. محصول و گزینه‌ها صرفاً نمونهٔ نمایشی هستند.",
    price: null,
  },
  {
    slug: "leather-loafers",
    name: "کفش کالج چرمی مشکی",
    category: "کفش",
    image: accessories,
    kind: "shoes",
    options: ["40", "41", "42", "43", "44", "45", "46"],
    unavailable: ["40", "46"],
    description:
      "انتخابی کلاسیک برای تکمیل استایل مردانه. تصویر کالکشن نمایشی است؛ مشخصات، قیمت و موجودی واقعی هنوز متصل نشده‌اند.",
    price: null,
  },
  {
    slug: "leather-belt",
    name: "کمربند با سگک نقره‌ای",
    category: "اکسسوری",
    image: accessories,
    kind: "accessory",
    options: ["۱۱۰ سانتی‌متر", "۱۲۰ سانتی‌متر", "۱۳۰ سانتی‌متر"],
    unavailable: [],
    description:
      "جزئیاتی ساده و ماندگار برای استایل شما. تصویر کالکشن و ابعاد نمایشی هستند و بیانگر موجودی فروشگاه نیستند.",
    price: null,
  },
];
export const canSelect = (product: Product, option: string) =>
  product.options.includes(option) && !product.unavailable.includes(option);
export const paymentConfigured = false;
export const toman = (value: number | null) =>
  value === null ? "قیمت اعلام نشده" : `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
export const numberFa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
export type CartItem = { slug: string; option: string; color: string; quantity: number };
