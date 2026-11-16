import { describe, it, expect } from "vitest";
import {
  products,
  canSelect,
  paymentConfigured,
  toman,
  selectedColor,
  productImageForColor,
} from "./catalog";
describe("MARK commercial rules", () => {
  it("unavailable clothing sizes cannot be selected", () => {
    const p = products[0];
    if (!p) throw new Error("missing sample");
    expect(canSelect(p, "S")).toBe(false);
    expect(canSelect(p, "5XL")).toBe(false);
    expect(canSelect(p, "3XL")).toBe(true);
  });
  it("unlisted sizes cannot be selected", () => {
    const p = products[0];
    if (!p) throw new Error("missing sample");
    expect(canSelect(p, "6XL")).toBe(false);
  });
  it("shoe choices exclude unavailable inventory options", () => {
    const p = products.find((p) => p.kind === "shoes");
    if (!p) throw new Error("missing shoe");
    expect(canSelect(p, "40")).toBe(false);
    expect(canSelect(p, "43")).toBe(true);
  });
  it("does not invent actual prices", () => {
    expect(products.every((p) => p.price === null)).toBe(true);
    expect(toman(null)).toBe("قیمت اعلام نشده");
  });
  it("does not enable an unconfigured payment gateway", () => {
    expect(paymentConfigured).toBe(false);
  });
  it("maps selected tee colors to the same garment's model photographs", () => {
    const p = products.find((p) => p.slug === "crewneck-tee");
    if (!p) throw new Error("missing tee");
    expect(selectedColor(p, "olive")?.name).toBe("زیتونی");
    expect(selectedColor(p, "olive")?.image).toContain("crewneck-tee-olive");
    expect(selectedColor(p, "ivory")?.image).toContain("crewneck-tee-ivory");
    expect(productImageForColor(p, "زیتونی")).toBe(selectedColor(p, "olive")?.image);
  });
  it("includes each requested outerwear sample with three matching color photos", () => {
    for (const slug of [
      "tailored-blazer",
      "puffer-jacket",
      "classic-shirt",
      "raincoat",
      "zip-sweatshirt",
    ]) {
      const p = products.find((p) => p.slug === slug);
      expect(p?.colors?.map((c) => c.id)).toEqual(["black", "olive", "ivory"]);
      expect(new Set(p?.colors?.map((c) => c.image)).size).toBe(3);
    }
  });
  it("includes requested accessory types and perfume volume options", () => {
    for (const slug of [
      "baseball-cap",
      "neck-tie",
      "perfume",
      "socks",
      "crossbody-bag",
      "backpack",
      "waist-bag",
    ])
      expect(products.find((p) => p.slug === slug)?.kind).toBe("accessory");
    expect(products.find((p) => p.slug === "perfume")?.options).toEqual([
      "۵۰ میلی‌لیتر",
      "۱۰۰ میلی‌لیتر",
    ]);
  });
});
