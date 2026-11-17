import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import { products } from "./catalog";
import {
  createSizePrompt,
  recommendationIsUsable,
  sizeChartForProduct,
  type SizeMeasurements,
  type SizeRecommendation,
} from "./sizing";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
} from "./ai-run-id.server";

export type SizeRecommendationInput = { slug: string; measurements: SizeMeasurements };
export type SizeRecommendationResult =
  | { ok: true; recommendation: SizeRecommendation }
  | { ok: false; error: string };

const outputSchema = z.object({
  size: z.string(),
  alternativeSize: z.string().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  reason: z.string(),
  measurementNote: z.string(),
});

function validMeasurements(value: SizeMeasurements) {
  const inRange = (n: number, min: number, max: number) =>
    Number.isFinite(n) && n >= min && n <= max;
  return (
    inRange(value.height, 130, 230) &&
    (value.weight === null || inRange(value.weight, 40, 300)) &&
    (value.chest === null || inRange(value.chest, 60, 200)) &&
    inRange(value.waist, 50, 200) &&
    (value.hip === null || inRange(value.hip, 60, 210)) &&
    (value.garmentChest === null || inRange(value.garmentChest, 60, 220)) &&
    (value.garmentLength === null || inRange(value.garmentLength, 35, 140)) &&
    ["slim", "regular", "relaxed"].includes(value.fit)
  );
}

function gatewayErrorMessage(error: APICallError) {
  try {
    const body = JSON.parse(error.responseBody ?? "{}") as { message?: unknown; error?: { message?: unknown } };
    const message = typeof body.message === "string" ? body.message : body.error?.message;
    if (typeof message === "string" && message.length < 500) return message;
  } catch {
    // Use the safe status-specific fallback below.
  }
  if (error.statusCode === 401) return "اتصال سرویس هوش مصنوعی تنظیم نشده است.";
  if (error.statusCode === 402) return "اعتبار سرویس هوش مصنوعی کافی نیست؛ لطفاً بعداً دوباره تلاش کنید.";
  if (error.statusCode === 403) return "دسترسی به سرویس پیشنهاد سایز در حال حاضر ممکن نیست.";
  if (error.statusCode === 429) return "سرویس پیشنهاد سایز موقتاً شلوغ است؛ چند لحظه بعد تلاش کنید.";
  return "سرویس پیشنهاد سایز در دسترس نیست؛ لطفاً بعداً دوباره تلاش کنید.";
}

export const recommendProductSize = createServerFn({ method: "POST" })
  .inputValidator((input: SizeRecommendationInput) => {
    if (!input || typeof input.slug !== "string" || !validMeasurements(input.measurements)) {
      throw new Error("اندازه‌های واردشده معتبر نیستند.");
    }
    return input;
  })
  .handler(async ({ data }): Promise<SizeRecommendationResult> => {
    const product = products.find((item) => item.slug === data.slug);
    const chart = product ? sizeChartForProduct(product) : [];
    if (!product || chart.length === 0) return { ok: false, error: "جدول سایز این محصول در دسترس نیست." };
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "اتصال سرویس هوش مصنوعی تنظیم نشده است." };

    const request = getRequest();
    const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        output: Output.object({ schema: outputSchema }),
        system:
          "تو مشاور سایز پوشاک مردانه مارک هستی. فقط از جدول سایز ارسالی و اندازه‌های مشتری استفاده کن. برای شلوار و شلوارک دور کمر و دور باسن و برای سایر لباس‌ها دور سینه و دور کمر اولویت دارند. قد، وزن و اندازه لباس دلخواه فقط شواهد کمکی‌اند. فرم دلخواه را لحاظ کن اما سایزی تنگ یا خارج از جدول پیشنهاد نده. اندازه اصلی و جایگزین باید دقیقاً یکی از سایزهای جدول باشند. اگر اطلاعات کافی نیست اطمینان low بده و در measurementNote اندازه‌گیری لازم را کوتاه توضیح بده. reason و measurementNote را فارسی، صریح و کوتاه بنویس. این جدول نمایشی است و آن را واقعی یا تضمینی معرفی نکن.",
        messages: [{ role: "user", content: createSizePrompt(product, data.measurements, chart) }],
        abortSignal: request.signal,
        maxRetries: 0,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const recommendation = await result.output;
      if (!recommendation || !recommendationIsUsable(product, recommendation)) {
        return { ok: false, error: "پیشنهاد معتبری از جدول این محصول دریافت نشد؛ اندازه‌ها را بررسی و دوباره تلاش کنید." };
      }
      return { ok: true, recommendation };
    } catch (error) {
      if (APICallError.isInstance(error)) return { ok: false, error: gatewayErrorMessage(error) };
      if (NoObjectGeneratedError.isInstance(error)) {
        return { ok: false, error: "پاسخ سرویس قابل استفاده نبود؛ لطفاً دوباره تلاش کنید." };
      }
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: false, error: "درخواست پیشنهاد سایز متوقف شد." };
      }
      console.error("Size recommendation failed", error);
      return { ok: false, error: "پیشنهاد سایز انجام نشد؛ لطفاً دوباره تلاش کنید." };
    }
  });
