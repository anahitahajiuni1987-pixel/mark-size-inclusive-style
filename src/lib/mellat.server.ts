import {
  MELLAT_SERVICE_URL,
  buildSoapEnvelope,
  mellatPayParameters,
  mellatVerificationParameters,
  parseMellatPayResponse,
  parseSoapReturn,
  type MellatCredentials,
  type MellatPaymentInput,
} from "./mellat";

type SoapMethod = "bpPayRequest" | "bpVerifyRequest" | "bpSettleRequest" | "bpReversalRequest";

export function hasMellatCredentials() {
  return Boolean(
    process.env["MELLAT_TERMINAL_ID"] &&
      process.env["MELLAT_USERNAME"] &&
      process.env["MELLAT_PASSWORD"],
  );
}

export function getMellatCredentials(): MellatCredentials {
  const terminalId = process.env["MELLAT_TERMINAL_ID"];
  const userName = process.env["MELLAT_USERNAME"];
  const userPassword = process.env["MELLAT_PASSWORD"];
  if (!terminalId || !userName || !userPassword) {
    throw new Error("اطلاعات پذیرنده بانک ملت هنوز کامل نشده است.");
  }
  if (!/^\d+$/.test(terminalId)) throw new Error("شماره ترمینال بانک ملت معتبر نیست.");
  return { terminalId, userName, userPassword };
}

async function callMellatSoap(method: SoapMethod, parameters: Record<string, string | number>) {
  const response = await fetch(MELLAT_SERVICE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "",
    },
    body: buildSoapEnvelope(method, parameters),
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error("ارتباط با سرویس بانک ملت برقرار نشد.");
  return parseSoapReturn(await response.text());
}

export async function requestMellatPayment(input: MellatPaymentInput) {
  const credentials = getMellatCredentials();
  const result = await callMellatSoap("bpPayRequest", mellatPayParameters(credentials, input));
  return parseMellatPayResponse(result);
}

export async function verifyMellatPayment(orderNumber: number, saleReferenceId: string) {
  return callMellatSoap(
    "bpVerifyRequest",
    mellatVerificationParameters(getMellatCredentials(), orderNumber, saleReferenceId),
  );
}

export async function settleMellatPayment(orderNumber: number, saleReferenceId: string) {
  return callMellatSoap(
    "bpSettleRequest",
    mellatVerificationParameters(getMellatCredentials(), orderNumber, saleReferenceId),
  );
}

export async function reverseMellatPayment(orderNumber: number, saleReferenceId: string) {
  return callMellatSoap(
    "bpReversalRequest",
    mellatVerificationParameters(getMellatCredentials(), orderNumber, saleReferenceId),
  );
}
