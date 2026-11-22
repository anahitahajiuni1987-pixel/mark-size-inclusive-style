import {
  canSelect,
  products,
  shippingToman,
  type CartItem,
  type Product,
} from "./catalog";

export type PricedOrderItem = {
  product_slug: string;
  product_name: string;
  color: string;
  option: string;
  quantity: number;
  unit_price_toman: number;
  line_total_toman: number;
};

export function priceOrder(
  items: CartItem[],
  catalog: Product[] = products,
  shipping: number | null = shippingToman,
) {
  if (items.length === 0) throw new Error("سبد خرید خالی است.");
  if (shipping === null || !Number.isSafeInteger(shipping) || shipping < 0) {
    throw new Error("هزینه ارسال هنوز مشخص نشده است.");
  }

  const pricedItems: PricedOrderItem[] = items.map((item) => {
    const product = catalog.find((candidate) => candidate.slug === item.slug);
    if (!product) throw new Error("یکی از محصولات سبد خرید پیدا نشد.");
    if (!canSelect(product, item.option)) throw new Error(`گزینه انتخاب‌شده برای ${product.name} معتبر نیست.`);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      throw new Error("تعداد محصول معتبر نیست.");
    }
    if (product.colors?.length) {
      if (!product.colors.some((color) => color.name === item.color)) {
        throw new Error(`رنگ انتخاب‌شده برای ${product.name} معتبر نیست.`);
      }
    } else if (item.color !== "تک‌رنگ") {
      throw new Error(`رنگ انتخاب‌شده برای ${product.name} معتبر نیست.`);
    }
    if (product.price === null || !Number.isSafeInteger(product.price) || product.price <= 0) {
      throw new Error(`قیمت واقعی ${product.name} هنوز وارد نشده است.`);
    }
    return {
      product_slug: product.slug,
      product_name: product.name,
      color: item.color,
      option: item.option,
      quantity: item.quantity,
      unit_price_toman: product.price,
      line_total_toman: product.price * item.quantity,
    };
  });

  const subtotal = pricedItems.reduce((sum, item) => sum + item.line_total_toman, 0);
  const total = subtotal + shipping;
  if (!Number.isSafeInteger(total) || total <= 0) throw new Error("مبلغ سفارش معتبر نیست.");
  return { items: pricedItems, subtotal, shipping, total };
}
