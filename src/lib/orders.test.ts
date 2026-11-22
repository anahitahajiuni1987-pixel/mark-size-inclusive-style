import { describe, expect, it } from "vitest";
import type { Product } from "./catalog";
import { priceOrder } from "./orders";

const product: Product = {
  slug: "real-product",
  name: "محصول واقعی",
  category: "پیراهن",
  image: "/product.jpg",
  kind: "clothing",
  options: ["M", "3XL"],
  unavailable: ["M"],
  description: "محصول آزمایشی",
  price: 250000,
};

describe("real order pricing", () => {
  it("calculates items and shipping from server-owned prices", () => {
    const result = priceOrder(
      [{ slug: "real-product", option: "3XL", color: "تک‌رنگ", quantity: 2 }],
      [product],
      80000,
    );
    expect(result.subtotal).toBe(500000);
    expect(result.shipping).toBe(80000);
    expect(result.total).toBe(580000);
  });

  it("rejects unavailable sizes even when a client submits them", () => {
    expect(() =>
      priceOrder(
        [{ slug: "real-product", option: "M", color: "تک‌رنگ", quantity: 1 }],
        [product],
        0,
      ),
    ).toThrow("معتبر نیست");
  });

  it("never creates a payable order with unknown prices or shipping", () => {
    expect(() =>
      priceOrder(
        [{ slug: "real-product", option: "3XL", color: "تک‌رنگ", quantity: 1 }],
        [{ ...product, price: null }],
        0,
      ),
    ).toThrow("قیمت واقعی");
    expect(() =>
      priceOrder(
        [{ slug: "real-product", option: "3XL", color: "تک‌رنگ", quantity: 1 }],
        [product],
        null,
      ),
    ).toThrow("هزینه ارسال");
  });
});
