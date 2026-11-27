/**
 * D001 exercise runner: mirrors `exercises/d001/test_day1.py` against the learner's code
 * (parsed by `analyze.ts`) and the in-browser Pydantic simulation.
 */
import { formatLoc, pyRepr, validatePayload, type ValidationIssue } from "../pyschema";
import { analyzeSource, type Analysis, type LintIssue } from "./analyze";

export interface TestOutcome {
  name: string;
  passed: boolean;
  /** pytest-style failure text */
  message?: string;
  /** learner-friendly next action in Thai */
  tip?: string;
}

export interface ProbeOutcome {
  label: string;
  passed: boolean;
  detail?: string;
}

export interface RunReport {
  /**
   * `error` = import/collection problem, nothing could run.
   * `unverified` = the simulated tests did not fail, but part of the code is in a shape the
   * checker cannot read, so it refuses to call it a pass (never counts as passed or mastered).
   */
  status: "passed" | "failed" | "error" | "unverified";
  collectionErrors: string[];
  /** code shapes the checker could not read; non-empty means the result is unreliable */
  unsupported: string[];
  tests: TestOutcome[];
  probes: ProbeOutcome[];
  lint: LintIssue[];
  notes: string[];
  mastered: boolean;
  summary: string;
}

type Outcome =
  | { kind: "ok"; data: Record<string, unknown> }
  | { kind: "validation_error"; errors: ValidationIssue[] }
  | { kind: "exception"; name: string }
  | { kind: "returned"; value: unknown };

const DID_NOT_RAISE = "Failed: DID NOT RAISE <class 'pydantic_core._pydantic_core.ValidationError'>";

function parseAiRequest(analysis: Analysis, payload: Record<string, unknown>): Outcome {
  switch (analysis.parseMode) {
    case "not_implemented":
      return { kind: "exception", name: "NotImplementedError" };
    case "no_return":
      return { kind: "returned", value: null };
    case "wrong_return":
      return { kind: "returned", value: payload };
    case "model_validate":
    case "constructor": {
      if (!analysis.model) return { kind: "exception", name: "NameError" };
      const result = validatePayload(analysis.model, payload);
      return result.ok ? { kind: "ok", data: result.data } : { kind: "validation_error", errors: result.errors };
    }
    default:
      return { kind: "exception", name: "ImportError" };
  }
}

function describeFailure(outcome: Outcome): string {
  switch (outcome.kind) {
    case "validation_error": {
      const lines = outcome.errors.map((e) => `  ${e.loc.join(".") || "(root)"}\n    ${e.msg} [type=${e.type}]`);
      return `pydantic_core._pydantic_core.ValidationError: ${outcome.errors.length} validation error${outcome.errors.length === 1 ? "" : "s"} for AIQueryRequest\n${lines.join("\n")}`;
    }
    case "exception":
      return outcome.name;
    case "returned":
      return `parse_ai_request returned ${outcome.value === null ? "None" : "a plain dict"}, not an AIQueryRequest instance`;
    default:
      return "";
  }
}

class Assertion extends Error {
  tip?: string;
  constructor(message: string, tip?: string) {
    super(message);
    this.tip = tip;
  }
}

function getAttr(data: Record<string, unknown>, name: string): unknown {
  if (!(name in data)) throw new Assertion(`AttributeError: 'AIQueryRequest' object has no attribute '${name}'`, `เพิ่ม field \`${name}\` ใน AIQueryRequest`);
  return data[name];
}

function expectOk(outcome: Outcome): Record<string, unknown> {
  if (outcome.kind === "ok") return outcome.data;
  if (outcome.kind === "returned") {
    throw new Assertion(`assert isinstance(req, AIQueryRequest)\n + where ${describeFailure(outcome)}`, "parse_ai_request ต้อง return instance ของ AIQueryRequest — ลอง `AIQueryRequest.model_validate(payload)`");
  }
  if (outcome.kind === "exception" && outcome.name === "NotImplementedError") {
    throw new Assertion("NotImplementedError", "แทนที่ `raise NotImplementedError` ใน parse_ai_request ด้วย `return AIQueryRequest.model_validate(payload)`");
  }
  throw new Assertion(describeFailure(outcome), "payload ที่ถูกต้องไม่ควรถูกปฏิเสธ — ตรวจกฎของ field ตามที่ error ระบุ");
}

function expectRaises(outcome: Outcome, tip: string): void {
  if (outcome.kind === "validation_error") return;
  if (outcome.kind === "exception" && outcome.name === "NotImplementedError") {
    throw new Assertion("NotImplementedError (ยังไม่ได้เขียน parse_ai_request)", "เติม `return AIQueryRequest.model_validate(payload)`");
  }
  throw new Assertion(DID_NOT_RAISE, tip);
}

function approx(a: unknown, b: number): boolean {
  return typeof a === "number" && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
}

const BASE = { user_id: "USR-101", query: "สวัสดี" };

interface TestCase {
  name: string;
  run: (analysis: Analysis) => void;
}

const TESTS: TestCase[] = [
  {
    name: "test_valid_defaults_and_stripping",
    run: (a) => {
      const data = expectOk(parseAiRequest(a, { user_id: "USR-101", query: "  ขอเช็ค status order ครับ  " }));
      const query = getAttr(data, "query");
      if (query !== "ขอเช็ค status order ครับ") {
        throw new Assertion(`assert ${pyRepr(query)} == 'ขอเช็ค status order ครับ'`, "ตัดช่องว่างหัวท้ายของ query ด้วย `.strip()` (หรือ `ConfigDict(str_strip_whitespace=True)`) และ return ค่าที่ตัดแล้ว");
      }
      const language = getAttr(data, "language");
      if (language !== "th") throw new Assertion(`assert ${pyRepr(language)} == 'th'`, 'ตั้ง `language: Literal["th", "en", "mixed"] = "th"`');
      const topK = getAttr(data, "top_k");
      if (topK !== 5) throw new Assertion(`assert ${pyRepr(topK)} == 5`, "ตั้ง `top_k: int = Field(default=5, ge=1, le=20)`");
      const temperature = getAttr(data, "temperature");
      if (!approx(temperature, 0.2)) throw new Assertion(`assert ${pyRepr(temperature)} == approx(0.2)`, "ตั้ง `temperature: float = Field(default=0.2, ge=0.0, le=1.0)`");
    },
  },
  {
    name: "test_reject_whitespace_only_query",
    run: (a) =>
      expectRaises(
        parseAiRequest(a, { ...BASE, query: "     " }),
        "ช่องว่างล้วนยาว 5 ตัวผ่าน min_length ได้ — ต้อง strip ก่อนแล้วค่อยเช็กความยาว 3–500 (ดู Hint 1)",
      ),
  },
  {
    name: "test_reject_invalid_user_id_prefix",
    run: (a) =>
      expectRaises(parseAiRequest(a, { user_id: "ADMIN-1", query: "สวัสดี" }), 'user_id ต้องขึ้นต้นด้วย "USR-" — ใช้ @field_validator("user_id") แล้ว raise ValueError ถ้า startswith ไม่ผ่าน'),
  },
  {
    name: "test_reject_out_of_bounds_params",
    run: (a) => {
      expectRaises(parseAiRequest(a, { ...BASE, top_k: 0 }), "top_k=0 ควรถูกปฏิเสธ — ใช้ `Field(default=5, ge=1, le=20)`");
      expectRaises(parseAiRequest(a, { ...BASE, temperature: 1.5 }), "temperature=1.5 ควรถูกปฏิเสธ — ใช้ `Field(default=0.2, ge=0.0, le=1.0)`");
    },
  },
  {
    name: "test_accept_mixed_language",
    run: (a) => {
      const data = expectOk(parseAiRequest(a, { user_id: "USR-999", query: "วิธี reset password", language: "mixed", top_k: 10, temperature: 0.0 }));
      const language = getAttr(data, "language");
      if (language !== "mixed") throw new Assertion(`assert ${pyRepr(language)} == 'mixed'`, 'เพิ่ม "mixed" ใน Literal["th", "en", "mixed"]');
      const topK = getAttr(data, "top_k");
      if (topK !== 10) throw new Assertion(`assert ${pyRepr(topK)} == 10`, "top_k ต้องรับค่า 1–20 (รวมปลายทาง)");
    },
  },
];

interface Probe {
  label: string;
  payload: Record<string, unknown>;
  expect: "ok" | "error";
}

const PROBES: Probe[] = [
  { label: 'user_id "USR-01" (ยาว 6) ผ่าน', payload: { ...BASE, user_id: "USR-01" }, expect: "ok" },
  { label: 'user_id "USR-0" (สั้นไป 5 ตัว) ถูกปฏิเสธ', payload: { ...BASE, user_id: "USR-0" }, expect: "error" },
  { label: 'query "  ab  " (หลัง strip เหลือ 2) ถูกปฏิเสธ', payload: { ...BASE, query: "  ab  " }, expect: "error" },
  { label: 'query "abc" (ยาว 3) ผ่าน', payload: { ...BASE, query: "abc" }, expect: "ok" },
  { label: "query ยาว 500 ผ่าน", payload: { ...BASE, query: "ก".repeat(500) }, expect: "ok" },
  { label: "query ยาว 501 ถูกปฏิเสธ", payload: { ...BASE, query: "ก".repeat(501) }, expect: "error" },
  { label: 'language "fr" ถูกปฏิเสธ', payload: { ...BASE, language: "fr" }, expect: "error" },
  { label: "top_k = 1 และ 20 ผ่าน (รวมปลายทาง)", payload: { ...BASE, top_k: 20 }, expect: "ok" },
  { label: "top_k = 21 ถูกปฏิเสธ", payload: { ...BASE, top_k: 21 }, expect: "error" },
  { label: "temperature = -0.1 ถูกปฏิเสธ", payload: { ...BASE, temperature: -0.1 }, expect: "error" },
  { label: "temperature = 1.0 ผ่าน (รวมปลายทาง)", payload: { ...BASE, temperature: 1.0 }, expect: "ok" },
  { label: 'top_k = "10" (string) ถูกแปลงเป็นตัวเลขตามโหมด lax', payload: { ...BASE, top_k: "10" }, expect: "ok" },
];

function runProbes(analysis: Analysis): ProbeOutcome[] {
  return PROBES.map((probe) => {
    const outcome = parseAiRequest(analysis, probe.payload);
    const got = outcome.kind === "ok" ? "ok" : "error";
    if (got === probe.expect) return { label: probe.label, passed: true };
    return {
      label: probe.label,
      passed: false,
      detail: probe.expect === "ok" ? `ถูกปฏิเสธโดยไม่ควร: ${outcome.kind === "validation_error" ? outcome.errors.map((e) => `${formatLoc(e.loc)} ${e.msg}`).join("; ") : describeFailure(outcome)}` : "ควรถูกปฏิเสธ แต่ผ่านได้",
    };
  });
}

export function runExercise(source: string): RunReport {
  const started = typeof performance !== "undefined" ? performance.now() : 0;
  const analysis = analyzeSource(source);

  if (analysis.collectionErrors.length > 0) {
    return {
      status: "error",
      collectionErrors: analysis.collectionErrors,
      unsupported: analysis.unsupported,
      tests: [],
      probes: [],
      lint: analysis.lint,
      notes: analysis.notes,
      mastered: false,
      summary: "1 error during collection — pytest ยังรันเทสต์ไม่ได้",
    };
  }

  const tests: TestOutcome[] = TESTS.map((test) => {
    try {
      test.run(analysis);
      return { name: test.name, passed: true };
    } catch (error) {
      if (error instanceof Assertion) return { name: test.name, passed: false, message: error.message, tip: error.tip };
      return { name: test.name, passed: false, message: String(error) };
    }
  });

  const probes = analysis.parseMode === "model_validate" || analysis.parseMode === "constructor" ? runProbes(analysis) : [];
  const failed = tests.filter((t) => !t.passed).length;
  const seconds = ((typeof performance !== "undefined" ? performance.now() : 0) - started) / 1000;
  const passed = tests.length - failed;
  const summary = failed === 0 ? `${passed} passed in ${seconds.toFixed(2)}s` : `${failed} failed, ${passed} passed in ${seconds.toFixed(2)}s`;
  const clean = analysis.lint.length === 0;
  const probesClean = probes.length > 0 && probes.every((p) => p.passed);
  const readable = analysis.unsupported.length === 0;

  // Conservative: only fully understood code can pass. Unreadable shapes stay "unverified".
  const status: RunReport["status"] = failed > 0 ? "failed" : readable ? "passed" : "unverified";

  return {
    status,
    collectionErrors: [],
    unsupported: analysis.unsupported,
    tests,
    probes,
    lint: analysis.lint,
    notes: analysis.notes,
    mastered: status === "passed" && clean && probesClean,
    summary:
      status === "unverified"
        ? `${summary} (จำลองแล้วไม่พบข้อผิดพลาด แต่อ่านโค้ดไม่ครบ — ยังไม่นับว่าผ่าน)`
        : summary,
  };
}
