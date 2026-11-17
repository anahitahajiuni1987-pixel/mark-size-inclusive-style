import { describe, expect, it } from "vitest";
import { matchesCatalogCategory, products } from "./catalog";
import { createSizePrompt, recommendationIsUsable, sizeChartForProduct } from "./sizing";

const validRecommendation = {
  size: "3XL",
  alternativeSize: "4XL",
  confidence: "high" as const,
  reason: "مطابق جدول",
  measurementNote: "اندازه‌گیری دقیق‌تر انجام شود.",
};

describe("product size guidance", () => {
  it("sends the selected product's actual demo chart to the recommendation model", () => {
    const product = products.find((item) => item.slug === "tailored-trousers");
    if (!product) throw new Error("missing trousers");
    const chart = sizeChartForProduct(product);
    const prompt = createSizePrompt(product, {
      height: 180,
      weight: 110,
      chest: null,
      waist: 118,
      hip: 128,
      garmentChest: null,
      garmentLength: 106,
      fit: "regular",
    }, chart);
    expect(prompt).toContain('"size":"3XL"');
    expect(prompt).toContain('"waist":[114,122]');
    expect(prompt).toContain('"bottomGarment":true');
  });

  it("rejects a recommended size that is unavailable for the product", () => {
    const product = products[0];
    if (!product) throw new Error("missing product");
    expect(recommendationIsUsable(product, { ...validRecommendation, size: "5XL" })).toBe(false);
    expect(recommendationIsUsable(product, validRecommendation)).toBe(true);
  });

  it("provides no clothing size chart for accessories", () => {
    const product = products.find((item) => item.slug === "perfume");
    if (!product) throw new Error("missing perfume");
    expect(sizeChartForProduct(product)).toEqual([]);
  });
});

describe("catalog categories", () => {
  it("keeps shoes and accessories in their own broad categories", () => {
    const shoes = products.find((item) => item.slug === "leather-sneakers");
    const accessory = products.find((item) => item.slug === "rectangular-sunglasses");
    if (!shoes || !accessory) throw new Error("missing new samples");
    expect(matchesCatalogCategory(shoes, "کفش")).toBe(true);
    expect(matchesCatalogCategory(shoes, "اکسسوری")).toBe(false);
    expect(matchesCatalogCategory(accessory, "اکسسوری")).toBe(true);
    expect(matchesCatalogCategory(accessory, "عینک")).toBe(true);
  });

  it("includes all eight newly photographed product samples", () => {
    const slugs = ["straight-jeans", "tailored-trousers", "pullover-hoodie", "tailored-shorts", "crewneck-sweatshirt", "leather-sneakers", "desert-boots", "rectangular-sunglasses"];
    expect(slugs.every((slug) => products.some((product) => product.slug === slug))).toBe(true);
  });
});
