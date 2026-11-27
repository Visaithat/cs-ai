import { describe, expect, it } from "vitest";
import { formatErrors, TICKET_CLASSIFICATION, validatePayload } from "./pyschema";

describe("TicketClassification reference model (matches real Pydantic output)", () => {
  it("coerces confidence string and strips summary — same JSON as worked_example.py", () => {
    const result = validatePayload(TICKET_CLASSIFICATION, {
      ticket_id: "TKT-2026",
      category: "billing",
      confidence: "0.92",
      summary_th: "  ลูกค้าสอบถามใบกำกับภาษีซ้ำซ้อน  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.json).toBe('{"ticket_id":"TKT-2026","category":"billing","confidence":0.92,"summary_th":"ลูกค้าสอบถามใบกำกับภาษีซ้ำซ้อน"}');
    }
  });

  it("reproduces the documented 3-error output", () => {
    const result = validatePayload(TICKET_CLASSIFICATION, { ticket_id: "TKT-2026", category: "refund", confidence: 1.4, summary_th: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(formatErrors(result.errors)).toBe(
        [
          "INVALID (3 errors):",
          " - ('category',) -> Input should be 'billing', 'technical' or 'general'",
          " - ('confidence',) -> Input should be less than or equal to 1",
          " - ('summary_th',) -> String should have at least 5 characters",
        ].join("\n"),
      );
    }
  });

  it("catches six spaces in the after-validator, not min_length", () => {
    const result = validatePayload(TICKET_CLASSIFICATION, { ticket_id: "TKT-2026", category: "general", confidence: 0.5, summary_th: "      " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].msg).toMatch(/^Value error, summary_th/);
  });

  it("reports missing fields and bad types", () => {
    const result = validatePayload(TICKET_CLASSIFICATION, { category: 3, confidence: "abc", summary_th: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const byField = Object.fromEntries(result.errors.map((e) => [e.loc[0], e.msg]));
      expect(byField.ticket_id).toBe("Field required");
      expect(byField.confidence).toContain("unable to parse string as a number");
      expect(byField.summary_th).toBe("Input should be a valid string");
    }
  });

  it("serialises whole-number floats like Python (1.0)", () => {
    const result = validatePayload(TICKET_CLASSIFICATION, { ticket_id: "TKT-1", category: "general", confidence: 1, summary_th: "ข้อความทดสอบ" });
    expect(result.ok && result.json).toContain('"confidence":1.0');
  });
});
