import { describe, expect, it } from "vitest";
import {
  buildSoapEnvelope,
  canMarkMellatPaid,
  mellatCallbackMatches,
  mellatPayParameters,
  parseMellatPayResponse,
  parseSoapReturn,
  tomanToRial,
} from "./mellat";

const credentials = { terminalId: "12345678", userName: "merchant", userPassword: "private" };

describe("Bank Mellat payment safety", () => {
  it("converts Toman to Rial exactly", () => {
    expect(tomanToRial(125000)).toBe(1250000);
    expect(() => tomanToRial(0)).toThrow();
    expect(() => tomanToRial(1.5)).toThrow();
  });

  it("accepts only a successful bank payment-token response", () => {
    expect(parseMellatPayResponse("0,bank-reference")).toBe("bank-reference");
    expect(() => parseMellatPayResponse("21,bank-reference")).toThrow();
    expect(() => parseMellatPayResponse("0,")).toThrow();
  });

  it("escapes XML credentials and parses namespaced SOAP replies", () => {
    const envelope = buildSoapEnvelope("bpPayRequest", { userName: 'a<&"' });
    expect(envelope).toContain("a&lt;&amp;&quot;");
    expect(parseSoapReturn("<ns:return>0,reference</ns:return>")).toBe("0,reference");
  });

  it("uses the real callback and includes Rial amount without exposing card data", () => {
    const parameters = mellatPayParameters(credentials, {
      orderNumber: 42,
      amountToman: 200000,
      mobile: "09123456789",
    });
    expect(parameters.amount).toBe(2000000);
    expect(parameters.callBackUrl).toContain("/api/public/payments/mellat/callback");
    expect(parameters.encPan).toBe("");
    expect(parameters.enc).toBe("");
  });

  it("rejects callbacks that do not match the stored payment reference", () => {
    expect(mellatCallbackMatches("stored-reference", "stored-reference")).toBe(true);
    expect(mellatCallbackMatches("stored-reference", "forged-reference")).toBe(false);
    expect(mellatCallbackMatches(null, "forged-reference")).toBe(false);
  });

  it("requires both bank verification and settlement before marking an order paid", () => {
    expect(canMarkMellatPaid("0", "0")).toBe(true);
    expect(canMarkMellatPaid("21", "0")).toBe(false);
    expect(canMarkMellatPaid("0", "21")).toBe(false);
  });
});
