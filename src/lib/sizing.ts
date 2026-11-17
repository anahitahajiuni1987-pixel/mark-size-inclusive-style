import { canSelect, type Product } from "./catalog";

export type SizeChartRow = {
  size: string;
  chest: [number, number];
  waist: [number, number];
  hip: [number, number];
  garmentChest: number;
  garmentLength: number;
};

export type FitPreference = "slim" | "regular" | "relaxed";
export type SizeMeasurements = {
  height: number;
  weight: number | null;
  chest: number | null;
  waist: number;
  hip: number | null;
  garmentChest: number | null;
  garmentLength: number | null;
  fit: FitPreference;
};

export type SizeRecommendation = {
  size: string;
  alternativeSize: string | null;
  confidence: "low" | "medium" | "high";
  reason: string;
  measurementNote: string;
};

const topRows: SizeChartRow[] = [
  { size: "S", chest: [86, 93], waist: [74, 81], hip: [88, 95], garmentChest: 102, garmentLength: 68 },
  { size: "M", chest: [94, 100], waist: [82, 88], hip: [96, 102], garmentChest: 108, garmentLength: 70 },
  { size: "L", chest: [101, 107], waist: [89, 96], hip: [103, 109], garmentChest: 114, garmentLength: 72 },
  { size: "XL", chest: [108, 115], waist: [97, 104], hip: [110, 117], garmentChest: 122, garmentLength: 74 },
  { size: "XXL", chest: [116, 123], waist: [105, 113], hip: [118, 125], garmentChest: 130, garmentLength: 76 },
  { size: "3XL", chest: [124, 132], waist: [114, 122], hip: [126, 134], garmentChest: 140, garmentLength: 78 },
  { size: "4XL", chest: [133, 142], waist: [123, 132], hip: [135, 144], garmentChest: 150, garmentLength: 80 },
  { size: "5XL", chest: [143, 153], waist: [133, 143], hip: [145, 155], garmentChest: 160, garmentLength: 82 },
];

const bottomRows: SizeChartRow[] = [
  { size: "S", chest: [86, 93], waist: [74, 81], hip: [88, 95], garmentChest: 82, garmentLength: 102 },
  { size: "M", chest: [94, 100], waist: [82, 88], hip: [96, 102], garmentChest: 89, garmentLength: 103 },
  { size: "L", chest: [101, 107], waist: [89, 96], hip: [103, 109], garmentChest: 97, garmentLength: 104 },
  { size: "XL", chest: [108, 115], waist: [97, 104], hip: [110, 117], garmentChest: 105, garmentLength: 105 },
  { size: "XXL", chest: [116, 123], waist: [105, 113], hip: [118, 125], garmentChest: 114, garmentLength: 106 },
  { size: "3XL", chest: [124, 132], waist: [114, 122], hip: [126, 134], garmentChest: 123, garmentLength: 107 },
  { size: "4XL", chest: [133, 142], waist: [123, 132], hip: [135, 144], garmentChest: 133, garmentLength: 108 },
  { size: "5XL", chest: [143, 153], waist: [133, 143], hip: [145, 155], garmentChest: 144, garmentLength: 109 },
];

export const isBottomProduct = (product: Product) =>
  ["شلوار", "شلوار جین", "شلوارک"].includes(product.category);

export function sizeChartForProduct(product: Product): SizeChartRow[] {
  if (product.kind !== "clothing") return [];
  const source = isBottomProduct(product) ? bottomRows : topRows;
  return source.filter((row) => product.options.includes(row.size));
}

export function recommendationIsUsable(product: Product, recommendation: SizeRecommendation) {
  return (
    canSelect(product, recommendation.size) &&
    (recommendation.alternativeSize === null || canSelect(product, recommendation.alternativeSize))
  );
}

export function createSizePrompt(
  product: Product,
  measurements: SizeMeasurements,
  chart: SizeChartRow[],
) {
  return JSON.stringify({
    task: "یک سایز قابل انتخاب از جدول همین محصول پیشنهاد بده و در صورت مرزی بودن، یک جایگزین قابل انتخاب معرفی کن.",
    product: { name: product.name, category: product.category, bottomGarment: isBottomProduct(product) },
    measurementsCentimeters: measurements,
    fitMeaning: {
      slim: "نزدیک‌تر به بدن بدون فشار",
      regular: "فرم استاندارد و راحت",
      relaxed: "آزادتر با فضای بیشتر",
    },
    demoSizeChart: chart,
  });
}
