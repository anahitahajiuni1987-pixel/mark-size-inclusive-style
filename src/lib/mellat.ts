export const MELLAT_SERVICE_URL = "https://bpm.shaparak.ir/pgwchannel/services/pgw";
export const MELLAT_PAYMENT_URL = "https://bpm.shaparak.ir/pgwchannel/startpay.mellat";
export const MELLAT_CALLBACK_URL =
  "https://mark-size-inclusive-style.lovable.app/api/public/payments/mellat/callback";

export type MellatCredentials = {
  terminalId: string;
  userName: string;
  userPassword: string;
};

export type MellatPaymentInput = {
  orderNumber: number;
  amountToman: number;
  mobile: string;
  callbackUrl?: string;
};

export function escapeXml(value: string | number) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character] ?? character;
  });
}

export function buildSoapEnvelope(method: string, parameters: Record<string, string | number>) {
  const fields = Object.entries(parameters)
    .map(([name, value]) => `<${name}>${escapeXml(value)}</${name}>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:int="http://interfaces.core.sw.bps.com/"><soapenv:Header/><soapenv:Body><int:${method}>${fields}</int:${method}></soapenv:Body></soapenv:Envelope>`;
}

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function parseSoapReturn(xml: string) {
  const match = xml.match(/<(?:[\w-]+:)?return[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?return>/i);
  if (!match?.[1]) throw new Error("پاسخ معتبر از بانک ملت دریافت نشد.");
  return decodeXml(match[1]).trim();
}

export function parseMellatPayResponse(response: string) {
  const [code, refId, ...rest] = response.split(",");
  if (code !== "0" || !refId || rest.length > 0) {
    throw new Error(`درگاه بانک ملت درخواست پرداخت را نپذیرفت (کد ${code ?? "نامشخص"}).`);
  }
  return refId;
}

export function tomanToRial(amountToman: number) {
  if (!Number.isSafeInteger(amountToman) || amountToman <= 0) {
    throw new Error("مبلغ سفارش معتبر نیست.");
  }
  const amountRial = amountToman * 10;
  if (!Number.isSafeInteger(amountRial)) throw new Error("مبلغ سفارش برای درگاه معتبر نیست.");
  return amountRial;
}

export function mellatTimestamp(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    localDate: `${get("year")}${get("month")}${get("day")}`,
    localTime: `${get("hour")}${get("minute")}${get("second")}`,
  };
}

export function mellatPayParameters(
  credentials: MellatCredentials,
  input: MellatPaymentInput,
  now = new Date(),
) {
  return {
    terminalId: credentials.terminalId,
    userName: credentials.userName,
    userPassword: credentials.userPassword,
    orderId: input.orderNumber,
    amount: tomanToRial(input.amountToman),
    ...mellatTimestamp(now),
    additionalData: `MARK order ${input.orderNumber}`,
    callBackUrl: input.callbackUrl ?? MELLAT_CALLBACK_URL,
    payerId: 0,
    mobileNo: input.mobile,
    encPan: "",
    panHiddenMode: "",
    cartItem: "",
    enc: "",
  };
}

export function mellatCallbackMatches(orderRefId: string | null, callbackRefId: string) {
  return Boolean(orderRefId && callbackRefId && orderRefId === callbackRefId);
}

export function canMarkMellatPaid(verificationCode: string, settlementCode: string) {
  return verificationCode === "0" && settlementCode === "0";
}

export function mellatVerificationParameters(
  credentials: MellatCredentials,
  orderNumber: number,
  saleReferenceId: string,
) {
  return {
    terminalId: credentials.terminalId,
    userName: credentials.userName,
    userPassword: credentials.userPassword,
    orderId: orderNumber,
    saleOrderId: orderNumber,
    saleReferenceId,
  };
}
