/**
 * A tiny, honest re-implementation of the slice of Pydantic v2 (lax mode) used in Day 1.
 * It powers the Payload Lab and the in-browser exercise checker. It is NOT Python:
 * learners are told to run the real `pytest` locally for the final proof.
 */

export type FieldKind = "str" | "int" | "float" | "literal";

/**
 * One statement of an `@field_validator` body, in execution order. `on` says which value the
 * condition looks at: `raw` = the value the validator received, `stripped` = that value after
 * `.strip()`. Keeping the order and the variable explicit is what lets the simulation tell
 * `len(v)` before `v.strip()` apart from `len(v.strip())`.
 */
export type ValueView = "raw" | "stripped";
export type LenCmp = "<" | "<=" | ">" | ">=" | "==";

export type ValidatorStep =
  | { op: "require_prefix"; on: ValueView; prefix: string; message: string }
  | { op: "reject_prefix"; on: ValueView; prefix: string; message: string }
  | { op: "reject_len"; on: ValueView; conds: Array<{ cmp: LenCmp; n: number }>; message: string }
  | { op: "reject_empty"; on: ValueView; message: string }
  /** `return <value>`: becomes the input of the next validator (`none` = forgot to return) */
  | { op: "output"; value: ValueView | "none" };

export interface FieldRule {
  name: string;
  kind: FieldKind;
  required: boolean;
  default?: string | number;
  literals?: string[];
  minLength?: number;
  maxLength?: number;
  ge?: number;
  le?: number;
  gt?: number;
  lt?: number;
  pattern?: string;
  /** `ConfigDict(str_strip_whitespace=True)` or a `mode="before"` validator */
  stripBefore?: boolean;
  /** `field_validator` (after mode) that strips and returns the cleaned value */
  stripAfter?: boolean;
  /** after-validator rejects values that do not start with this prefix */
  prefix?: string;
  prefixMessage?: string;
  /** after-validator length bounds (checked after stripping) */
  postMinLength?: number;
  postMaxLength?: number;
  postMessage?: string;
  /** after-validator forgot to `return` -> the field silently becomes None */
  returnsNone?: boolean;
  /** ordered `field_validator` (after) statements, concatenated in definition order */
  steps?: ValidatorStep[];
}

export interface SchemaSpec {
  name: string;
  fields: FieldRule[];
}

export interface ValidationIssue {
  loc: string[];
  msg: string;
  type: string;
}

export type ValidationResult =
  | { ok: true; data: Record<string, unknown>; json: string }
  | { ok: false; errors: ValidationIssue[] };

/** Python `str.strip()` whitespace (differs from JS `trim()`: no BOM, but includes -). */
const PY_SPACE = "\t\n\v\f\r \x1c-\x1f\x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000";
const PY_STRIP = new RegExp(`^[${PY_SPACE}]+|[${PY_SPACE}]+$`, "g");

export function pyStrip(text: string): string {
  return text.replace(PY_STRIP, "");
}

function lenMatches(cmp: LenCmp, length: number, n: number): boolean {
  switch (cmp) {
    case "<":
      return length < n;
    case "<=":
      return length <= n;
    case ">":
      return length > n;
    case ">=":
      return length >= n;
    default:
      return length === n;
  }
}

function runSteps(rule: FieldRule, steps: ValidatorStep[], start: string): { value: string | null } | { issue: ValidationIssue } {
  const loc = [rule.name];
  const fail = (message: string): { issue: ValidationIssue } => ({ issue: { loc, msg: `Value error, ${message}`, type: "value_error" } });
  let input = start;
  for (const step of steps) {
    if (step.op === "output") {
      if (step.value === "none") return { value: null };
      input = step.value === "stripped" ? pyStrip(input) : input;
      continue;
    }
    const view = step.on === "stripped" ? pyStrip(input) : input;
    if (step.op === "require_prefix" && !view.startsWith(step.prefix)) return fail(step.message);
    if (step.op === "reject_prefix" && view.startsWith(step.prefix)) return fail(step.message);
    if (step.op === "reject_empty" && view.length === 0) return fail(step.message);
    if (step.op === "reject_len") {
      const length = [...view].length;
      if (step.conds.some((c) => lenMatches(c.cmp, length, c.n))) return fail(step.message);
    }
  }
  return { value: input };
}

function fmtNum(n: number): string {
  return String(n);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function quoteList(values: string[]): string {
  const quoted = values.map((v) => `'${v}'`);
  if (quoted.length <= 1) return quoted.join("");
  return `${quoted.slice(0, -1).join(", ")} or ${quoted[quoted.length - 1]}`;
}

/** Python-like `repr` for dict values, used in assertion messages. */
export function pyRepr(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`;
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function coerceNumber(kind: "int" | "float", value: unknown): { ok: true; value: number } | { ok: false; msg: string; type: string } {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (kind === "int" && !Number.isInteger(value)) {
      return { ok: false, msg: "Input should be a valid integer, got a number with a fractional part", type: "int_from_float" };
    }
    return { ok: true, value };
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(text)) {
      const num = Number(text);
      if (kind === "int" && !Number.isInteger(num)) {
        return { ok: false, msg: "Input should be a valid integer, unable to parse string as an integer", type: "int_parsing" };
      }
      return { ok: true, value: num };
    }
    return kind === "int"
      ? { ok: false, msg: "Input should be a valid integer, unable to parse string as an integer", type: "int_parsing" }
      : { ok: false, msg: "Input should be a valid number, unable to parse string as a number", type: "float_parsing" };
  }
  return kind === "int"
    ? { ok: false, msg: "Input should be a valid integer", type: "int_type" }
    : { ok: false, msg: "Input should be a valid number", type: "float_type" };
}

function checkNumberBounds(rule: FieldRule, n: number): ValidationIssue | null {
  const loc = [rule.name];
  if (rule.ge !== undefined && n < rule.ge) return { loc, msg: `Input should be greater than or equal to ${fmtNum(rule.ge)}`, type: "greater_than_equal" };
  if (rule.gt !== undefined && n <= rule.gt) return { loc, msg: `Input should be greater than ${fmtNum(rule.gt)}`, type: "greater_than" };
  if (rule.le !== undefined && n > rule.le) return { loc, msg: `Input should be less than or equal to ${fmtNum(rule.le)}`, type: "less_than_equal" };
  if (rule.lt !== undefined && n >= rule.lt) return { loc, msg: `Input should be less than ${fmtNum(rule.lt)}`, type: "less_than" };
  return null;
}

function checkStringBounds(rule: FieldRule, text: string): ValidationIssue | null {
  const loc = [rule.name];
  const length = [...text].length; // Python counts code points, not UTF-16 units
  if (rule.minLength !== undefined && length < rule.minLength) {
    return { loc, msg: `String should have at least ${plural(rule.minLength, "character")}`, type: "string_too_short" };
  }
  if (rule.maxLength !== undefined && length > rule.maxLength) {
    return { loc, msg: `String should have at most ${plural(rule.maxLength, "character")}`, type: "string_too_long" };
  }
  if (rule.pattern !== undefined) {
    try {
      if (!new RegExp(rule.pattern).test(text)) {
        return { loc, msg: `String should match pattern '${rule.pattern}'`, type: "string_pattern_mismatch" };
      }
    } catch {
      /* invalid pattern: ignore */
    }
  }
  return null;
}

/** Validate one value against a rule; returns the cleaned value or an issue. */
function validateField(rule: FieldRule, raw: unknown): { value: unknown; issue?: undefined } | { issue: ValidationIssue } {
  const loc = [rule.name];

  if (rule.kind === "literal") {
    const allowed = rule.literals ?? [];
    if (typeof raw !== "string" || !allowed.includes(raw)) {
      return { issue: { loc, msg: `Input should be ${quoteList(allowed)}`, type: "literal_error" } };
    }
    return { value: raw };
  }

  if (rule.kind === "int" || rule.kind === "float") {
    const coerced = coerceNumber(rule.kind, raw);
    if (!coerced.ok) return { issue: { loc, msg: coerced.msg, type: coerced.type } };
    const bound = checkNumberBounds(rule, coerced.value);
    return bound ? { issue: bound } : { value: coerced.value };
  }

  // str
  if (typeof raw !== "string") return { issue: { loc, msg: "Input should be a valid string", type: "string_type" } };
  let text = rule.stripBefore ? pyStrip(raw) : raw;
  const bound = checkStringBounds(rule, text);
  if (bound) return { issue: bound };

  // after-validators run only once Field constraints pass (Pydantic v2 ordering)
  if (rule.steps) {
    const outcome = runSteps(rule, rule.steps, text);
    if ("issue" in outcome) return outcome;
    if (outcome.value === null) return { value: null };
    text = outcome.value;
  }
  if (rule.stripAfter) text = pyStrip(text);
  if (rule.prefix !== undefined && !text.startsWith(rule.prefix)) {
    return { issue: { loc, msg: `Value error, ${rule.prefixMessage ?? `must start with '${rule.prefix}'`}`, type: "value_error" } };
  }
  const length = [...text].length;
  if (
    (rule.postMinLength !== undefined && length < rule.postMinLength) ||
    (rule.postMaxLength !== undefined && length > rule.postMaxLength)
  ) {
    return { issue: { loc, msg: `Value error, ${rule.postMessage ?? "invalid length"}`, type: "value_error" } };
  }
  if (rule.returnsNone) return { value: null };
  return { value: text };
}

export function serializeJson(spec: SchemaSpec, data: Record<string, unknown>): string {
  const parts = spec.fields.map((field) => {
    const value = data[field.name];
    let encoded: string;
    if (typeof value === "number" && field.kind === "float" && Number.isInteger(value)) encoded = `${value}.0`;
    else encoded = JSON.stringify(value ?? null);
    return `${JSON.stringify(field.name)}:${encoded}`;
  });
  return `{${parts.join(",")}}`;
}

export function validatePayload(spec: SchemaSpec, payload: unknown): ValidationResult {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: [{ loc: [], msg: "Input should be a valid dictionary or instance of " + spec.name, type: "model_type" }] };
  }
  const input = payload as Record<string, unknown>;
  const errors: ValidationIssue[] = [];
  const data: Record<string, unknown> = {};

  for (const rule of spec.fields) {
    if (!(rule.name in input)) {
      if (rule.required) errors.push({ loc: [rule.name], msg: "Field required", type: "missing" });
      else data[rule.name] = rule.default;
      continue;
    }
    const result = validateField(rule, input[rule.name]);
    if (result.issue) errors.push(result.issue);
    else data[rule.name] = result.value;
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data, json: serializeJson(spec, data) };
}

export function formatLoc(loc: string[]): string {
  if (loc.length === 0) return "()";
  return `(${loc.map((part) => `'${part}'`).join(", ")}${loc.length === 1 ? "," : ""})`;
}

/** Mimics the Day 1 print loop: `INVALID (3 errors):` + ` - ('field',) -> message`. */
export function formatErrors(errors: ValidationIssue[]): string {
  const lines = errors.map((e) => ` - ${formatLoc(e.loc)} -> ${e.msg}`);
  return [`INVALID (${errors.length} error${errors.length === 1 ? "" : "s"}):`, ...lines].join("\n");
}

/* ---------------------- reference model for the worked example ---------------------- */

export const TICKET_CLASSIFICATION: SchemaSpec = {
  name: "TicketClassification",
  fields: [
    { name: "ticket_id", kind: "str", required: true, minLength: 4 },
    { name: "category", kind: "literal", required: true, literals: ["billing", "technical", "general"] },
    { name: "confidence", kind: "float", required: true, ge: 0, le: 1 },
    {
      name: "summary_th",
      kind: "str",
      required: true,
      minLength: 5,
      maxLength: 200,
      stripAfter: true,
      postMinLength: 5,
      postMessage: "summary_th ต้องมีความยาวอย่างน้อย 5 ตัวอักษรหลังตัดช่องว่าง",
    },
  ],
};
