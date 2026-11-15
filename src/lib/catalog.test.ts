import { describe, it, expect } from "vitest";
import { products, canSelect, paymentConfigured, toman } from "./catalog";
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
});
