import polo from "@/assets/mark-polo.jpg";
import inclusive from "@/assets/mark-inclusive.jpg";
import teeBlack from "@/assets/crewneck-tee-black.jpg";
import teeOlive from "@/assets/crewneck-tee-olive.jpg";
import teeIvory from "@/assets/crewneck-tee-ivory.jpg";
import blazerBlack from "@/assets/tailored-blazer-black.jpg";
import blazerOlive from "@/assets/tailored-blazer-olive.jpg";
import blazerIvory from "@/assets/tailored-blazer-ivory.jpg";
import jacketBlack from "@/assets/puffer-jacket-black.jpg";
import jacketOlive from "@/assets/puffer-jacket-olive.jpg";
import jacketIvory from "@/assets/puffer-jacket-ivory.jpg";
import shirtBlack from "@/assets/classic-shirt-black.jpg";
import shirtOlive from "@/assets/classic-shirt-olive.jpg";
import shirtIvory from "@/assets/classic-shirt-ivory.jpg";
import raincoatBlack from "@/assets/raincoat-black.jpg";
import raincoatOlive from "@/assets/raincoat-olive.jpg";
import raincoatIvory from "@/assets/raincoat-ivory.jpg";
import sweatshirtBlack from "@/assets/zip-sweatshirt-black.jpg";
import sweatshirtOlive from "@/assets/zip-sweatshirt-olive.jpg";
import sweatshirtIvory from "@/assets/zip-sweatshirt-ivory.jpg";
import cap from "@/assets/baseball-cap.jpg";
import tie from "@/assets/neck-tie.jpg";
import perfume from "@/assets/perfume.jpg";
import socks from "@/assets/socks.jpg";
import bag from "@/assets/crossbody-bag.jpg";
import backpack from "@/assets/backpack.jpg";
import waistbag from "@/assets/waist-bag.jpg";
import belt from "@/assets/belt.jpg";
import loafers from "@/assets/loafers.jpg";
import poloBlack from "@/assets/polo-model-black.jpg";
import poloOlive from "@/assets/polo-model-olive.jpg";
import straightJeans from "@/assets/straight-jeans.jpg";
import tailoredTrousers from "@/assets/tailored-trousers.jpg";
import pulloverHoodie from "@/assets/pullover-hoodie.jpg";
import tailoredShorts from "@/assets/tailored-shorts.jpg";
import crewneckSweatshirt from "@/assets/crewneck-sweatshirt.jpg";
import leatherSneakers from "@/assets/leather-sneakers.jpg";
import desertBoots from "@/assets/desert-boots.jpg";
import sunglasses from "@/assets/sunglasses.jpg";

export type ProductColor = {
  id: "black" | "olive" | "ivory";
  name: string;
  image: string;
  gallery: string[];
};
export type Product = {
  slug: string;
  name: string;
  category: string;
  image: string;
  kind: "clothing" | "shoes" | "accessory";
  colors?: ProductColor[];
  optionLabel?: string;
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
    image: poloBlack,
    colors: [
      { id: "black", name: "مشکی", image: poloBlack, gallery: [poloBlack, polo] },
      { id: "olive", name: "زیتونی", image: poloOlive, gallery: [poloOlive] },
    ],
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
    category: "پیراهن",
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
    category: "کفش رسمی",
    image: loafers,
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
    image: belt,
    kind: "accessory",
    options: ["۱۱۰ سانتی‌متر", "۱۲۰ سانتی‌متر", "۱۳۰ سانتی‌متر"],
    unavailable: [],
    description:
      "جزئیاتی ساده و ماندگار برای استایل شما. تصویر کالکشن و ابعاد نمایشی هستند و بیانگر موجودی فروشگاه نیستند.",
    price: null,
  },
  {
    slug: "crewneck-tee",
    name: "تیشرت یقه گرد مردانه",
    category: "تیشرت",
    image: teeBlack,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی تیشرت یقه گرد مردانه؛ تصاویر رنگ‌های مختلف روی همان مدل تهیه شده‌اند. قیمت، جنس و موجودی واقعی پس از اتصال اطلاعات فروشگاه اعلام می‌شوند.",
    colors: [
      { id: "black", name: "مشکی", image: teeBlack, gallery: [teeBlack] },
      { id: "olive", name: "زیتونی", image: teeOlive, gallery: [teeOlive] },
      { id: "ivory", name: "استخوانی", image: teeIvory, gallery: [teeIvory] },
    ],
  },
  {
    slug: "tailored-blazer",
    name: "کت تک مردانه",
    category: "کت",
    image: blazerBlack,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی کت تک مردانه؛ تصاویر رنگ‌های مختلف روی همان مدل تهیه شده‌اند. قیمت، جنس و موجودی واقعی پس از اتصال اطلاعات فروشگاه اعلام می‌شوند.",
    colors: [
      { id: "black", name: "مشکی", image: blazerBlack, gallery: [blazerBlack] },
      { id: "olive", name: "زیتونی", image: blazerOlive, gallery: [blazerOlive] },
      { id: "ivory", name: "استخوانی", image: blazerIvory, gallery: [blazerIvory] },
    ],
  },
  {
    slug: "puffer-jacket",
    name: "کاپشن پفی مردانه",
    category: "کاپشن",
    image: jacketBlack,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی کاپشن پفی مردانه؛ تصاویر رنگ‌های مختلف روی همان مدل تهیه شده‌اند. قیمت، جنس و موجودی واقعی پس از اتصال اطلاعات فروشگاه اعلام می‌شوند.",
    colors: [
      { id: "black", name: "مشکی", image: jacketBlack, gallery: [jacketBlack] },
      { id: "olive", name: "زیتونی", image: jacketOlive, gallery: [jacketOlive] },
      { id: "ivory", name: "استخوانی", image: jacketIvory, gallery: [jacketIvory] },
    ],
  },
  {
    slug: "classic-shirt",
    name: "پیراهن کلاسیک مردانه",
    category: "پیراهن",
    image: shirtBlack,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی پیراهن کلاسیک مردانه؛ تصاویر رنگ‌های مختلف روی همان مدل تهیه شده‌اند. قیمت، جنس و موجودی واقعی پس از اتصال اطلاعات فروشگاه اعلام می‌شوند.",
    colors: [
      { id: "black", name: "مشکی", image: shirtBlack, gallery: [shirtBlack] },
      { id: "olive", name: "زیتونی", image: shirtOlive, gallery: [shirtOlive] },
      { id: "ivory", name: "استخوانی", image: shirtIvory, gallery: [shirtIvory] },
    ],
  },
  {
    slug: "raincoat",
    name: "بارانی مردانه",
    category: "بارانی",
    image: raincoatBlack,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی بارانی مردانه؛ تصاویر رنگ‌های مختلف روی همان مدل تهیه شده‌اند. قیمت، جنس و موجودی واقعی پس از اتصال اطلاعات فروشگاه اعلام می‌شوند.",
    colors: [
      { id: "black", name: "مشکی", image: raincoatBlack, gallery: [raincoatBlack] },
      { id: "olive", name: "زیتونی", image: raincoatOlive, gallery: [raincoatOlive] },
      { id: "ivory", name: "استخوانی", image: raincoatIvory, gallery: [raincoatIvory] },
    ],
  },
  {
    slug: "zip-sweatshirt",
    name: "سویشرت زیپ‌دار مردانه",
    category: "سویشرت زیپ‌دار",
    image: sweatshirtBlack,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی سویشرت زیپ‌دار مردانه؛ تصاویر رنگ‌های مختلف روی همان مدل تهیه شده‌اند. قیمت، جنس و موجودی واقعی پس از اتصال اطلاعات فروشگاه اعلام می‌شوند.",
    colors: [
      { id: "black", name: "مشکی", image: sweatshirtBlack, gallery: [sweatshirtBlack] },
      { id: "olive", name: "زیتونی", image: sweatshirtOlive, gallery: [sweatshirtOlive] },
      { id: "ivory", name: "استخوانی", image: sweatshirtIvory, gallery: [sweatshirtIvory] },
    ],
  },
  {
    slug: "baseball-cap",
    name: "کلاه کپ مردانه",
    category: "کلاه",
    image: cap,
    kind: "accessory",
    options: ["قابل تنظیم"],
    optionLabel: "اندازه",
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی کلاه کپ مردانه؛ تصاویر، ابعاد و گزینه‌ها نمایشی هستند و نشان‌دهندهٔ موجودی واقعی فروشگاه نیستند.",
  },
  {
    slug: "neck-tie",
    name: "کراوات کلاسیک مردانه",
    category: "کراوات",
    image: tie,
    kind: "accessory",
    options: ["استاندارد"],
    optionLabel: "اندازه",
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی کراوات کلاسیک مردانه؛ تصاویر، ابعاد و گزینه‌ها نمایشی هستند و نشان‌دهندهٔ موجودی واقعی فروشگاه نیستند.",
  },
  {
    slug: "perfume",
    name: "عطر مردانه",
    category: "عطر",
    image: perfume,
    kind: "accessory",
    options: ["۵۰ میلی‌لیتر", "۱۰۰ میلی‌لیتر"],
    optionLabel: "حجم",
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی عطر مردانه؛ تصاویر، ابعاد و گزینه‌ها نمایشی هستند و نشان‌دهندهٔ موجودی واقعی فروشگاه نیستند.",
  },
  {
    slug: "socks",
    name: "جوراب مردانه",
    category: "جوراب",
    image: socks,
    kind: "accessory",
    options: ["۳۹–۴۲", "۴۳–۴۶"],
    optionLabel: "سایز",
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی جوراب مردانه؛ تصاویر، ابعاد و گزینه‌ها نمایشی هستند و نشان‌دهندهٔ موجودی واقعی فروشگاه نیستند.",
  },
  {
    slug: "crossbody-bag",
    name: "کیف کوچک دوشی",
    category: "کیف",
    image: bag,
    kind: "accessory",
    options: ["کوچک"],
    optionLabel: "اندازه",
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی کیف کوچک دوشی؛ تصاویر، ابعاد و گزینه‌ها نمایشی هستند و نشان‌دهندهٔ موجودی واقعی فروشگاه نیستند.",
  },
  {
    slug: "backpack",
    name: "کوله‌پشتی مردانه",
    category: "کوله‌پشتی",
    image: backpack,
    kind: "accessory",
    options: ["استاندارد"],
    optionLabel: "اندازه",
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی کوله‌پشتی مردانه؛ تصاویر، ابعاد و گزینه‌ها نمایشی هستند و نشان‌دهندهٔ موجودی واقعی فروشگاه نیستند.",
  },
  {
    slug: "waist-bag",
    name: "کیف کمری مردانه",
    category: "کیف کمری",
    image: waistbag,
    kind: "accessory",
    options: ["بند قابل تنظیم"],
    optionLabel: "اندازه",
    unavailable: [],
    price: null,
    description:
      "نمونهٔ نمایشی کیف کمری مردانه؛ تصاویر، ابعاد و گزینه‌ها نمایشی هستند و نشان‌دهندهٔ موجودی واقعی فروشگاه نیستند.",
  },
  {
    slug: "straight-jeans",
    name: "شلوار جین راسته مردانه",
    category: "شلوار جین",
    image: straightJeans,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی شلوار جین با فرم راسته برای استایل روزمره؛ رنگ، جنس، قیمت و موجودی واقعی هنوز تأیید نشده‌اند.",
  },
  {
    slug: "tailored-trousers",
    name: "شلوار پارچه‌ای آزاد مردانه",
    category: "شلوار",
    image: tailoredTrousers,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی شلوار پارچه‌ای با فرم آزاد و خطوط ساده؛ اندازه‌ها و مشخصات واقعی پس از اتصال فروشگاه تأیید می‌شوند.",
  },
  {
    slug: "pullover-hoodie",
    name: "هودی ساده مردانه",
    category: "هودی",
    image: pulloverHoodie,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی هودی مردانه با فرم راحت؛ تصویر برای ارائهٔ کالکشن ساخته شده و مشخصات واقعی محصول نیست.",
  },
  {
    slug: "tailored-shorts",
    name: "شلوارک پارچه‌ای مردانه",
    category: "شلوارک",
    image: tailoredShorts,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی شلوارک پارچه‌ای تا زیر زانو؛ رنگ، جنس، اندازه و موجودی واقعی هنوز اعلام نشده‌اند.",
  },
  {
    slug: "crewneck-sweatshirt",
    name: "سویشرت یقه‌گرد مردانه",
    category: "سویشرت",
    image: crewneckSweatshirt,
    kind: "clothing",
    options: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی سویشرت یقه‌گرد مردانه برای استایل راحت؛ اطلاعات تجاری و موجودی واقعی متصل نشده‌اند.",
  },
  {
    slug: "leather-sneakers",
    name: "کفش اسپرت چرمی مشکی",
    category: "کفش اسپرت",
    image: leatherSneakers,
    kind: "shoes",
    options: ["40", "41", "42", "43", "44", "45", "46"],
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی کفش اسپرت چرمی مردانه؛ جنس، قیمت و سایزهای موجود واقعی هنوز تأیید نشده‌اند.",
  },
  {
    slug: "desert-boots",
    name: "نیم‌بوت جیر روزمره",
    category: "کفش روزمره",
    image: desertBoots,
    kind: "shoes",
    options: ["40", "41", "42", "43", "44", "45", "46"],
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی نیم‌بوت جیر مردانه برای استایل روزمره؛ مشخصات و موجودی واقعی اعلام نشده‌اند.",
  },
  {
    slug: "rectangular-sunglasses",
    name: "عینک آفتابی مستطیلی",
    category: "عینک",
    image: sunglasses,
    kind: "accessory",
    options: ["استاندارد"],
    optionLabel: "اندازه",
    unavailable: [],
    price: null,
    description: "نمونهٔ نمایشی عینک آفتابی مردانه؛ مشخصات فنی، ابعاد، قیمت و موجودی واقعی هنوز تأیید نشده‌اند.",
  },
];
export const productCategories = Array.from(new Set(products.map((product) => product.category)));

export function matchesCatalogCategory(product: Product, category?: string) {
  if (!category || category === "جدیدترین‌ها" || category === "تماس با ما") return true;
  if (category === "پوشاک مردانه") return product.kind === "clothing";
  if (category === "سایز بزرگ") return product.kind === "clothing" && product.options.includes("3XL");
  if (category === "کفش") return product.kind === "shoes";
  if (category === "اکسسوری") return product.kind === "accessory";
  if (category === "کاپشن و کت") return ["کت", "کاپشن"].includes(product.category);
  return product.category === category;
}

export const canSelect = (product: Product, option: string) =>
  product.options.includes(option) && !product.unavailable.includes(option);
export const paymentConfigured = false;
export const toman = (value: number | null) =>
  value === null ? "قیمت اعلام نشده" : `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
export const numberFa = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
export type CartItem = { slug: string; option: string; color: string; quantity: number };

export const selectedColor = (product: Product, colorId: string) =>
  product.colors?.find((c) => c.id === colorId) ?? product.colors?.[0];
export const productImageForColor = (product: Product, colorName: string) =>
  product.colors?.find((c) => c.name === colorName)?.image ?? product.image;
