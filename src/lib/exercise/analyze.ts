/**
 * Static analyzer for learner-written Pydantic code.
 *
 * We cannot run Python in the browser without shipping a 10 MB runtime, so the exercise is
 * checked by (1) lightly parsing the learner's class into a `SchemaSpec` and (2) running the
 * same assertions as the real `test_day1.py` against the in-browser Pydantic simulation.
 * Several equivalent solutions are recognised (Field constraints, ConfigDict strip,
 * field_validator, Annotated[...]) but the reader is deliberately CONSERVATIVE: validator bodies
 * are interpreted statement by statement, in order, and any shape we do not fully understand is
 * reported in `Analysis.unsupported` rather than guessed at. An unreadable shape can never
 * count as a pass or award mastery.
 */
import type { FieldRule, SchemaSpec, ValidatorStep, ValueView } from "../pyschema";

/* -------------------------------- scanning -------------------------------- */

export interface Scanned {
  /** source with comments blanked (strings intact) */
  code: string;
  /** like `code`, but string *contents* are blanked too; same length/indices */
  masked: string;
  unterminated: boolean;
}

export function scanSource(src: string): Scanned {
  let code = "";
  let masked = "";
  let unterminated = false;
  let i = 0;
  const n = src.length;

  while (i < n) {
    const ch = src[i];
    if (ch === "#") {
      while (i < n && src[i] !== "\n") {
        code += " ";
        masked += " ";
        i += 1;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      const triple = src.startsWith(ch.repeat(3), i);
      const quote = triple ? ch.repeat(3) : ch;
      code += quote;
      masked += quote;
      i += quote.length;
      let closed = false;
      while (i < n) {
        if (src[i] === "\\" && i + 1 < n) {
          code += src.slice(i, i + 2);
          masked += "  ";
          i += 2;
          continue;
        }
        if (src.startsWith(quote, i)) {
          code += quote;
          masked += quote;
          i += quote.length;
          closed = true;
          break;
        }
        if (!triple && src[i] === "\n") break;
        code += src[i];
        masked += src[i] === "\n" ? "\n" : " ";
        i += 1;
      }
      if (!closed) unterminated = true;
      continue;
    }
    code += ch;
    masked += ch;
    i += 1;
  }
  return { code, masked, unterminated };
}

export interface LogicalLine {
  indent: number;
  code: string;
  masked: string;
  /** 1-based physical line where the statement starts */
  line: number;
}

function depthDelta(text: string): number {
  let depth = 0;
  for (const ch of text) {
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth -= 1;
  }
  return depth;
}

export function logicalLines(scanned: Scanned): LogicalLine[] {
  const codeLines = scanned.code.split("\n");
  const maskedLines = scanned.masked.split("\n");
  const out: LogicalLine[] = [];
  let i = 0;
  while (i < codeLines.length) {
    if (maskedLines[i].trim() === "") {
      i += 1;
      continue;
    }
    const start = i;
    let code = codeLines[i];
    let masked = maskedLines[i];
    let depth = depthDelta(masked);
    while (depth > 0 && i + 1 < codeLines.length) {
      i += 1;
      code += " " + codeLines[i].trim();
      masked += " " + maskedLines[i].trim();
      depth = depthDelta(masked);
    }
    const indent = masked.length - masked.trimStart().length;
    out.push({ indent, code: code.trim(), masked: masked.trim(), line: start + 1 });
    i += 1;
  }
  return out;
}

/** Split `masked` at top-level occurrences of `sep` (depth 0). Returns [start, end) ranges. */
function splitTop(masked: string, sep: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < masked.length; i += 1) {
    const ch = masked[i];
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth -= 1;
    else if (ch === sep && depth === 0) {
      ranges.push([start, i]);
      start = i + 1;
    }
  }
  ranges.push([start, masked.length]);
  return ranges.filter(([a, b]) => masked.slice(a, b).trim() !== "");
}

function findTopLevelAssign(masked: string): number {
  let depth = 0;
  for (let i = 0; i < masked.length; i += 1) {
    const ch = masked[i];
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth -= 1;
    else if (ch === "=" && depth === 0) {
      const prev = masked[i - 1] ?? "";
      const next = masked[i + 1] ?? "";
      if (!"<>!=".includes(prev) && next !== "=") return i;
    }
  }
  return -1;
}

/* -------------------------------- literals -------------------------------- */

function parseNumber(text: string): number | undefined {
  const t = text.trim();
  return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(t) ? Number(t) : undefined;
}

function parseString(text: string): string | undefined {
  const m = /^[rRuU]?(['"])([\s\S]*)\1$/.exec(text.trim());
  return m ? m[2] : undefined;
}

type Literalish = string | number | undefined;

function parseLiteral(text: string): Literalish {
  return parseString(text) ?? parseNumber(text);
}

/* ---------------------------- class / field parse --------------------------- */

interface ValidatorInfo {
  name: string;
  fields: string[];
  mode: "after" | "before" | "wrap" | "plain";
  /** name of the value parameter (second parameter after `cls`) */
  param: string | null;
  body: LogicalLine[];
  line: number;
}

export type ParseMode = "model_validate" | "constructor" | "not_implemented" | "wrong_return" | "no_return" | "missing";

export interface LintIssue {
  code: string;
  message: string;
  line?: number;
}

export interface Analysis {
  /** problems that make `import exercise_day1` fail (pytest collection error) */
  collectionErrors: string[];
  lint: LintIssue[];
  model: SchemaSpec | null;
  parseMode: ParseMode;
  /** friendly static observations (not failures by themselves) */
  notes: string[];
  /**
   * Code shapes the checker could not read. Anything listed here means the simulated result is
   * unreliable, so the run can never count as "passed" or award mastery.
   */
  unsupported: string[];
}

const BLOCK_KEYWORDS = /^(class|def|if|elif|else|for|while|try|except|finally|with)\b/;
const KNOWN_NAMES = ["BaseModel", "Field", "field_validator", "ConfigDict", "Literal", "Annotated", "ValidationError", "model_validator"];
const PYDANTIC_STAR = ["BaseModel", "Field", "field_validator", "ConfigDict", "ValidationError", "model_validator"];
const TYPING_STAR = ["Literal", "Annotated"];

/** `Field(...)` keywords that do not change validation of the values the exercise sends. */
const HARMLESS_FIELD_KEYS = new Set(["description", "title", "examples", "repr", "exclude", "frozen", "json_schema_extra", "deprecated"]);
/** `ConfigDict(...)` keywords that do not change how these payloads validate. */
const HARMLESS_CONFIG_KEYS = new Set(["extra", "frozen", "title", "populate_by_name"]);

function hasTopLevelColon(masked: string): boolean {
  return topLevelColon(masked) >= 0;
}

function topLevelColon(masked: string): number {
  let depth = 0;
  for (let i = 0; i < masked.length; i += 1) {
    const ch = masked[i];
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth -= 1;
    else if (ch === ":" && depth === 0) return i;
  }
  return -1;
}

function detectSyntax(scanned: Scanned, lines: LogicalLine[]): string[] {
  const errors: string[] = [];
  if (scanned.unterminated) errors.push("SyntaxError: unterminated string literal");
  if (depthDelta(scanned.masked) !== 0) errors.push("SyntaxError: วงเล็บ ( [ { ไม่ครบคู่");
  lines.forEach((line, index) => {
    if (BLOCK_KEYWORDS.test(line.masked) && !hasTopLevelColon(line.masked)) {
      errors.push(`SyntaxError (บรรทัด ${line.line}): expected ':'`);
      return;
    }
    if (BLOCK_KEYWORDS.test(line.masked) && line.masked.endsWith(":")) {
      const next = lines[index + 1];
      if (!next || next.indent <= line.indent) {
        errors.push(`IndentationError (บรรทัด ${line.line}): expected an indented block`);
      }
    }
  });
  return errors;
}

interface ImportInfo {
  names: Map<string, number>; // local name -> line
  stars: Array<{ module: string; line: number }>;
}

function collectImports(lines: LogicalLine[]): ImportInfo {
  const names = new Map<string, number>();
  const stars: ImportInfo["stars"] = [];
  for (const line of lines) {
    const from = /^from\s+([\w.]+)\s+import\s+(.+)$/.exec(line.masked);
    if (from) {
      const list = from[2].replace(/[()]/g, "");
      for (const part of list.split(",")) {
        const piece = part.trim();
        if (!piece) continue;
        if (piece === "*") {
          stars.push({ module: from[1], line: line.line });
          continue;
        }
        const alias = /^(\w+)\s+as\s+(\w+)$/.exec(piece);
        names.set(alias ? alias[2] : piece, line.line);
      }
      continue;
    }
    const plain = /^import\s+(.+)$/.exec(line.masked);
    if (plain) {
      for (const part of plain[1].split(",")) {
        const piece = part.trim();
        const alias = /^([\w.]+)\s+as\s+(\w+)$/.exec(piece);
        names.set(alias ? alias[2] : piece.split(".")[0], line.line);
      }
    }
  }
  return { names, stars };
}

function countWord(text: string, word: string): number {
  const re = new RegExp(`(?<![\\w.])${word}\\b`, "g");
  return (text.match(re) ?? []).length;
}

function isDocstring(masked: string): boolean {
  return /^(?:"""\s*"""|'''\s*'''|"\s*"|'\s*')$/.test(masked.trim());
}

/* ------------------------- validator body interpreter ------------------------ */

interface Interpreted {
  steps: ValidatorStep[];
  reasons: string[];
  /** `x = v.strip()` happened but a different (unstripped) value is returned */
  strippedButReturnedRaw: boolean;
  hasChecks: boolean;
  /** final output of the validator */
  output: ValueView | "none";
}

/** `raise ValueError("msg")` → message (empty string when it has no readable literal). `null` = not a ValueError raise. */
function parseRaise(masked: string, code: string): string | null {
  if (!/^raise\s+ValueError\s*\(.*\)$/.test(masked.trim())) return null;
  const m = /^raise\s+ValueError\s*\(\s*(?:[fF])?(['"])([\s\S]*?)\1/.exec(code.trim());
  return m ? m[2] : "";
}

/**
 * Parse a condition into the "reject when true" steps we understand. Anything else returns `null`
 * so the caller flags it as unreadable instead of guessing (the old matcher guessed, which let
 * inverted conditions and the wrong strip order through).
 */
function parseCondition(
  maskedCond: string,
  codeCond: string,
  env: Map<string, ValueView>,
  message: string,
): ValidatorStep[] | null {
  const mc = maskedCond.trim();
  const cc = codeCond.trim();

  // not v.startswith("X")  /  v.startswith("X")
  if (/^(?:not\s+)?\w+\.startswith\(/.test(mc)) {
    const shape = /^(not\s+)?(\w+)\.startswith\(\s*(['"])(.*)\3\s*\)$/s.exec(cc);
    const maskShape = /^(?:not\s+)?(\w+)\.startswith\(\s*(['"])\s*\2\s*\)$/.exec(mc);
    if (!shape || !maskShape) return null;
    const on = env.get(shape[2]);
    if (!on) return null;
    return [shape[1] ? { op: "require_prefix", on, prefix: shape[4], message } : { op: "reject_prefix", on, prefix: shape[4], message }];
  }

  // not v   (empty string is rejected)
  const empty = /^not\s+(\w+)$/.exec(mc);
  if (empty) {
    const on = env.get(empty[1]);
    return on ? [{ op: "reject_empty", on, message }] : null;
  }

  // not (A <= len(x) <= B)
  const chain = /^not\s*\(\s*(\d+)\s*(<=|<)\s*len\(\s*(\w+)\s*\)\s*(?:(<=|<)\s*(\d+)\s*)?\)$/.exec(mc);
  if (chain) {
    const on = env.get(chain[3]);
    if (!on) return null;
    const conds: Array<{ cmp: "<" | "<=" | ">" | ">="; n: number }> = [{ cmp: chain[2] === "<=" ? "<" : "<=", n: Number(chain[1]) }];
    if (chain[4] !== undefined) conds.push({ cmp: chain[4] === "<=" ? ">" : ">=", n: Number(chain[5]) });
    return [{ op: "reject_len", on, conds, message }];
  }

  // len(x) < A or len(x) > B   (one or more disjuncts on the same variable)
  const parts = mc.split(/\s+or\s+/);
  const conds: Array<{ cmp: "<" | "<=" | ">" | ">=" | "=="; n: number }> = [];
  let variable: string | null = null;
  for (const part of parts) {
    const m = /^len\(\s*(\w+)\s*\)\s*(<=|>=|==|<|>)\s*(\d+)$/.exec(part.trim());
    if (!m || (variable !== null && variable !== m[1])) return null;
    variable = m[1];
    conds.push({ cmp: m[2] as "<" | "<=" | ">" | ">=" | "==", n: Number(m[3]) });
  }
  const on = variable ? env.get(variable) : undefined;
  return on && conds.length > 0 ? [{ op: "reject_len", on, conds, message }] : null;
}

/**
 * Walk a validator body statement by statement. Only a small, fully understood set of statements
 * is accepted: strip assignment, alias, `if <known condition>: raise ValueError(...)`, one final
 * `return`. Everything else is reported in `reasons`.
 */
function interpretBody(body: LogicalLine[], param: string | null): Interpreted {
  const steps: ValidatorStep[] = [];
  const reasons: string[] = [];
  const out: Interpreted = { steps, reasons, strippedButReturnedRaw: false, hasChecks: false, output: "none" };
  if (!param) {
    reasons.push("ไม่พบพารามิเตอร์ค่าของ validator (ต้องเป็น `cls, v`)");
    return out;
  }
  if (body.length === 0) return out;

  const env = new Map<string, ValueView>([[param, "raw"]]);
  const base = Math.min(...body.map((l) => l.indent));
  let strippedSeen = false;
  let returned = false;

  for (let i = 0; i < body.length; i += 1) {
    const line = body[i];
    const text = line.masked;
    const where = `บรรทัด ${line.line}`;
    if (line.indent !== base) {
      reasons.push(`${where}: การเยื้องที่ตัวตรวจไม่เข้าใจ`);
      continue;
    }
    if (returned) {
      reasons.push(`${where}: มีโค้ดหลัง return`);
      continue;
    }
    if (isDocstring(text) || text === "pass") continue;

    const stripAssign = /^(\w+)\s*=\s*(\w+)\.strip\(\s*\)$/.exec(text);
    if (stripAssign) {
      if (!env.has(stripAssign[2])) reasons.push(`${where}: strip() จากตัวแปรที่ตัวตรวจไม่รู้จัก`);
      else {
        env.set(stripAssign[1], "stripped");
        strippedSeen = true;
      }
      continue;
    }

    const alias = /^(\w+)\s*=\s*(\w+)$/.exec(text);
    if (alias && env.has(alias[2])) {
      env.set(alias[1], env.get(alias[2])!);
      continue;
    }

    const ret = /^return\s+(.+)$/.exec(text);
    if (ret) {
      const expr = ret[1].trim();
      const named = /^(\w+)$/.exec(expr);
      const stripped = /^(\w+)\.strip\(\s*\)$/.exec(expr);
      if (named && env.has(named[1])) out.output = env.get(named[1])!;
      else if (stripped && env.has(stripped[1])) out.output = "stripped";
      else reasons.push(`${where}: \`return ${line.code.replace(/^return\s+/, "")}\` — ตัวตรวจอ่านค่าที่ return ไม่ได้`);
      returned = true;
      continue;
    }

    if (/^if\s/.test(text)) {
      const colon = topLevelColon(text);
      if (colon < 0) {
        reasons.push(`${where}: ${line.code}`);
        continue;
      }
      const condMasked = text.slice(2, colon);
      const condCode = line.code.slice(2, colon);
      const inline = text.slice(colon + 1).trim();
      let raiseMasked = inline;
      let raiseCode = line.code.slice(colon + 1).trim();
      if (!inline) {
        const block: LogicalLine[] = [];
        while (i + 1 < body.length && body[i + 1].indent > base) {
          block.push(body[i + 1]);
          i += 1;
        }
        if (block.length !== 1) {
          reasons.push(`${where}: if ที่ตัวตรวจอ่านได้ต้องมีแค่ \`raise ValueError(...)\` หนึ่งบรรทัด`);
          continue;
        }
        raiseMasked = block[0].masked;
        raiseCode = block[0].code;
      }
      const message = parseRaise(raiseMasked, raiseCode);
      if (message === null) {
        reasons.push(`${where}: ตัวตรวจอ่านได้เฉพาะ \`raise ValueError(...)\` ใน if`);
        continue;
      }
      const parsed = parseCondition(condMasked, condCode, env, message);
      if (!parsed) {
        reasons.push(`${where}: เงื่อนไข \`if ${condCode.trim()}\` อยู่นอกรูปแบบที่ตัวตรวจอ่านได้`);
        continue;
      }
      steps.push(...parsed);
      out.hasChecks = true;
      continue;
    }

    reasons.push(`${where}: \`${line.code}\``);
  }

  if (returned) {
    out.strippedButReturnedRaw = strippedSeen && out.output === "raw";
    steps.push({ op: "output", value: out.output });
  } else {
    out.output = "none";
    steps.push({ op: "output", value: "none" });
  }
  return out;
}

function applyValidator(rule: FieldRule, v: ValidatorInfo, notes: string[], unsupported: string[]): void {
  const label = `validator \`${v.name}\` ของ \`${rule.name}\``;
  if (v.mode === "wrap" || v.mode === "plain") {
    unsupported.push(`${label} ใช้ mode="${v.mode}" — ตัวตรวจจำลองรองรับเฉพาะ mode "after" และ "before"`);
    return;
  }
  const result = interpretBody(v.body, v.param);
  for (const reason of result.reasons) unsupported.push(`${label}: ${reason}`);
  if (result.reasons.length > 0) return;

  if (v.mode === "before") {
    if (result.hasChecks) {
      unsupported.push(`${label} เป็น mode="before" ที่มีเงื่อนไข raise — ตัวตรวจอ่านไม่ได้ (ใช้ mode "after" หรือ Field constraints)`);
      return;
    }
    if (result.output === "none") {
      notes.push(`${label} ไม่ได้ return ค่า → field จะกลายเป็น None`);
      unsupported.push(`${label} เป็น mode="before" ที่ไม่ return ค่า`);
      return;
    }
    if (result.output === "stripped") rule.stripBefore = true;
    return;
  }

  if (result.strippedButReturnedRaw) {
    notes.push(`validator ของ \`${rule.name}\` เรียก .strip() แต่ไม่ได้ return ค่าที่ตัดแล้ว`);
  }
  if (result.output === "none") {
    notes.push(`validator ของ \`${rule.name}\` ไม่ได้ return ค่า → field จะกลายเป็น None`);
  }
  rule.steps = [...(rule.steps ?? []), ...result.steps];
}

function parseFieldCall(
  rule: FieldRule,
  call: { code: string; masked: string },
  unsupported: string[],
): void {
  const open = call.masked.indexOf("(");
  const close = call.masked.lastIndexOf(")");
  if (open < 0 || close < open) return;
  const inner = { code: call.code.slice(open + 1, close), masked: call.masked.slice(open + 1, close) };
  const [first, ...others] = splitTop(inner.masked, ",");
  const args = first ? [first, ...others] : [];
  args.forEach(([a, b], index) => {
    const maskedArg = inner.masked.slice(a, b);
    const codeArg = inner.code.slice(a, b);
    const kw = /^\s*(\w+)\s*=(?!=)\s*/.exec(maskedArg);
    if (!kw) {
      if (index === 0 && maskedArg.trim() === "...") return;
      if (index === 0) {
        const value = parseLiteral(codeArg);
        if (value !== undefined) {
          rule.default = value;
          rule.required = false;
          return;
        }
      }
      unsupported.push(`\`${rule.name}\`: อาร์กิวเมนต์ใน Field(...) ที่ตัวตรวจอ่านไม่ได้ (\`${codeArg.trim()}\`)`);
      return;
    }
    const key = kw[1];
    const valueText = codeArg.slice(kw[0].length);
    const num = parseNumber(valueText);
    const unreadable = () => unsupported.push(`\`${rule.name}\`: ค่า ${key}=\`${valueText.trim()}\` ต้องเป็นตัวเลข/ข้อความคงที่ ตัวตรวจจึงอ่านไม่ได้`);
    switch (key) {
      case "default": {
        const value = parseLiteral(valueText);
        if (value !== undefined) {
          rule.default = value;
          rule.required = false;
        } else if (valueText.trim() !== "...") unreadable();
        break;
      }
      case "ge":
      case "le":
      case "gt":
      case "lt":
        if (num !== undefined) rule[key] = num;
        else unreadable();
        break;
      case "min_length":
        if (num !== undefined) rule.minLength = num;
        else unreadable();
        break;
      case "max_length":
        if (num !== undefined) rule.maxLength = num;
        else unreadable();
        break;
      case "pattern": {
        const text = parseString(valueText);
        if (text !== undefined) rule.pattern = text;
        else unreadable();
        break;
      }
      default:
        if (!HARMLESS_FIELD_KEYS.has(key)) {
          unsupported.push(`\`${rule.name}\`: Field(${key}=...) ยังไม่รองรับในตัวตรวจแบบจำลอง`);
        }
        break;
    }
  });
}

function parseAnnotation(
  rule: FieldRule,
  annotation: { code: string; masked: string },
  unsupported: string[],
): void {
  const mask = annotation.masked.trim();
  const code = annotation.code.trim();

  const annotated = /^(?:typing\.)?Annotated\s*\[/.exec(mask);
  if (annotated) {
    const innerStart = mask.indexOf("[") + 1;
    const innerEnd = mask.lastIndexOf("]");
    const inner = { code: code.slice(innerStart, innerEnd), masked: mask.slice(innerStart, innerEnd) };
    const parts = splitTop(inner.masked, ",");
    parts.forEach(([a, b], index) => {
      const piece = { code: inner.code.slice(a, b), masked: inner.masked.slice(a, b) };
      if (index === 0) parseAnnotation(rule, piece, unsupported);
      else if (/^\s*Field\s*\(/.test(piece.masked)) parseFieldCall(rule, piece, unsupported);
      else unsupported.push(`\`${rule.name}\`: metadata ใน Annotated[...] ที่ไม่ใช่ Field(...) (\`${piece.code.trim()}\`) — ตัวตรวจอ่านไม่ได้`);
    });
    return;
  }

  const literal = /^(?:typing\.)?Literal\s*\[/.exec(mask);
  if (literal) {
    rule.kind = "literal";
    const innerStart = mask.indexOf("[") + 1;
    const innerEnd = mask.lastIndexOf("]");
    const inner = { code: code.slice(innerStart, innerEnd), masked: mask.slice(innerStart, innerEnd) };
    const members = splitTop(inner.masked, ",").map(([a, b]) => parseString(inner.code.slice(a, b)));
    rule.literals = members.filter((v): v is string => v !== undefined);
    if (rule.literals.length !== members.length) unsupported.push(`\`${rule.name}\`: Literal[...] ที่มีสมาชิกไม่ใช่ข้อความ — ตัวตรวจอ่านไม่ได้`);
    return;
  }

  if (mask === "str" || mask === "int" || mask === "float") {
    rule.kind = mask;
    return;
  }
  unsupported.push(`type annotation ของ \`${rule.name}\` (${mask}) ยังไม่รองรับในตัวตรวจแบบจำลอง — ใช้ str / int / float / Literal`);
}

function parseModelConfig(line: LogicalLine, unsupported: string[]): boolean {
  const call = /^model_config\s*=\s*(?:ConfigDict\s*\(|\{)/.exec(line.masked);
  if (!call) {
    unsupported.push(`บรรทัด ${line.line}: model_config ที่ตัวตรวจอ่านไม่ได้ (ใช้ \`ConfigDict(...)\`)`);
    return false;
  }
  const isCall = call[0].includes("ConfigDict");
  const open = line.masked.indexOf(isCall ? "(" : "{");
  const close = line.masked.lastIndexOf(isCall ? ")" : "}");
  if (close < open) return false;
  const innerMasked = line.masked.slice(open + 1, close);
  const innerCode = line.code.slice(open + 1, close);
  let strip = false;
  for (const [a, b] of splitTop(innerMasked, ",")) {
    const maskedArg = innerMasked.slice(a, b);
    const codeArg = innerCode.slice(a, b);
    const kv = isCall ? /^\s*(\w+)\s*=(?!=)\s*([\s\S]*)$/.exec(codeArg) : /^\s*(['"])(\w+)\1\s*:\s*([\s\S]*)$/.exec(codeArg);
    if (!kv || !maskedArg.trim()) {
      unsupported.push(`บรรทัด ${line.line}: ตัวเลือกใน model_config ที่ตัวตรวจอ่านไม่ได้`);
      continue;
    }
    const key = isCall ? kv[1] : kv[2];
    const value = (isCall ? kv[2] : kv[3]).trim();
    if (key === "str_strip_whitespace") {
      if (value === "True") strip = true;
      else if (value !== "False") unsupported.push(`บรรทัด ${line.line}: str_strip_whitespace ต้องเป็น True หรือ False`);
    } else if (!HARMLESS_CONFIG_KEYS.has(key)) {
      unsupported.push(`บรรทัด ${line.line}: model_config \`${key}\` ยังไม่รองรับในตัวตรวจแบบจำลอง`);
    }
  }
  return strip;
}

function parseDefParams(code: string): string[] | null {
  const m = /^def\s+\w+\s*\(([\s\S]*)\)\s*(?:->[\s\S]*)?:$/.exec(code.trim());
  if (!m) return null;
  return splitTop(scanSource(m[1]).masked, ",").map(([a, b]) => {
    const piece = m[1].slice(a, b).trim();
    return /^(\w+)/.exec(piece)?.[1] ?? "";
  });
}

/**
 * A name bound in the class body. Python keeps only the LAST binding of each name, in the dict slot
 * of the first one; Pydantic collects decorators from that final namespace.
 */
type ClassBinding =
  | { kind: "validator"; info: ValidatorInfo }
  | { kind: "method"; line: number }
  | { kind: "field"; line: number };

function bindingLine(binding: ClassBinding): number {
  return binding.kind === "validator" ? binding.info.line : binding.line;
}

function parseClass(
  lines: LogicalLine[],
  startIndex: number,
  className: string,
  notes: string[],
  collectionErrors: string[],
  unsupported: string[],
): SchemaSpec | null {
  const header = lines[startIndex];
  if (!new RegExp(`^class\\s+${className}\\s*\\(`).test(header.masked)) return null;
  if (!/\(\s*(?:pydantic\.)?BaseModel\s*\)/.test(header.masked)) {
    notes.push(`\`${className}\` ควรสืบทอดจาก BaseModel`);
    unsupported.push(`\`${className}\` ไม่ได้สืบทอดจาก BaseModel โดยตรง — ตัวตรวจอ่านกฎจากคลาสแม่ไม่ได้`);
  }

  const body: LogicalLine[] = [];
  for (let i = startIndex + 1; i < lines.length && lines[i].indent > header.indent; i += 1) body.push(lines[i]);
  if (body.length === 0) return { name: className, fields: [] };

  const base = Math.min(...body.map((l) => l.indent));
  const fields: FieldRule[] = [];
  // Name -> final binding. `Map.set` on an existing key keeps the first insertion slot and swaps in
  // the last value, which mirrors the class namespace dict.
  const bindings = new Map<string, ClassBinding>();
  const bind = (name: string, next: ClassBinding) => {
    const previous = bindings.get(name);
    if (previous?.kind === "validator") {
      notes.push(`validator \`${name}\` (บรรทัด ${previous.info.line}) ถูกแทนที่ด้วยการประกาศชื่อเดียวกันภายหลัง (บรรทัด ${bindingLine(next)}) — Python เก็บเฉพาะตัวสุดท้าย`);
    } else if (previous && (previous.kind === "field" || next.kind === "field")) {
      unsupported.push(
        `ชื่อ \`${name}\` ถูกประกาศซ้ำภายในคลาส (บรรทัด ${bindingLine(previous)} และ ${bindingLine(next)}) — ตัวตรวจจำลองการทับชื่อของ field ไม่ได้`,
      );
    }
    bindings.set(name, next);
  };
  let stripWhitespace = false;
  let pending: string[] = [];

  for (let i = 0; i < body.length; i += 1) {
    const line = body[i];
    if (line.indent !== base) continue;

    if (line.masked.startsWith("@")) {
      pending.push(line.code);
      continue;
    }

    if (/^def\s/.test(line.masked)) {
      const fnBody: LogicalLine[] = [];
      for (let j = i + 1; j < body.length && body[j].indent > base; j += 1) fnBody.push(body[j]);
      const fnName = /^def\s+(\w+)/.exec(line.masked)?.[1] ?? "?";
      const deco = pending.find((d) => /^@\s*(?:pydantic\.)?field_validator\s*\(/.test(d));
      for (const d of pending) {
        if (!/^@\s*(?:pydantic\.)?field_validator\s*\(/.test(d) && !/^@\s*classmethod\s*$/.test(d)) {
          unsupported.push(`บรรทัด ${line.line}: decorator \`${d}\` ที่ตัวตรวจไม่รองรับ`);
        }
      }
      if (deco) {
        const open = deco.indexOf("(");
        const argsText = deco.slice(open + 1, deco.lastIndexOf(")"));
        const argMasked = scanSource(argsText).masked;
        const names: string[] = [];
        let mode: ValidatorInfo["mode"] = "after";
        for (const [a, b] of splitTop(argMasked, ",")) {
          const piece = argsText.slice(a, b).trim();
          const kw = /^(\w+)\s*=\s*(.*)$/s.exec(piece);
          if (kw) {
            if (kw[1] === "mode") {
              const m = parseString(kw[2]);
              if (m === "before" || m === "after" || m === "wrap" || m === "plain") mode = m;
              else unsupported.push(`validator \`${fnName}\`: mode ที่ตัวตรวจอ่านไม่ได้`);
            }
          } else {
            const s = parseString(piece);
            if (s) names.push(s);
          }
        }
        const params = parseDefParams(line.code);
        bind(fnName, {
          kind: "validator",
          info: {
            name: fnName,
            fields: names,
            mode,
            param: params && params.length >= 2 && params[1] ? params[1] : null,
            body: fnBody,
            line: line.line,
          },
        });
      } else {
        if (/^def\s+__/.test(line.masked)) {
          unsupported.push(`บรรทัด ${line.line}: เมธอด \`${fnName}\` อาจเปลี่ยนพฤติกรรมการ validate ที่ตัวตรวจจำลองไม่ได้`);
        }
        bind(fnName, { kind: "method", line: line.line });
      }
      pending = [];
      continue;
    }
    pending = [];

    if (/^model_config\s*=/.test(line.masked)) {
      if (parseModelConfig(line, unsupported)) stripWhitespace = true;
      continue;
    }
    if (isDocstring(line.masked) || line.masked === "pass") continue;

    const ann = /^(\w+)\s*:\s*(.+)$/s.exec(line.masked);
    if (!ann || /^(class|def|if|for|while|with|try|else|elif|return|pass)\b/.test(line.masked)) {
      unsupported.push(`บรรทัด ${line.line}: \`${line.code}\` ภายในคลาสที่ตัวตรวจไม่รู้จัก`);
      continue;
    }

    const name = ann[1];
    const restStart = line.masked.indexOf(":") + 1;
    const restMasked = line.masked.slice(restStart);
    const restCode = line.code.slice(restStart);
    const assign = findTopLevelAssign(restMasked);
    const annotation = assign >= 0 ? { code: restCode.slice(0, assign), masked: restMasked.slice(0, assign) } : { code: restCode, masked: restMasked };
    const rhs = assign >= 0 ? { code: restCode.slice(assign + 1).trim(), masked: restMasked.slice(assign + 1).trim() } : null;

    const rule: FieldRule = { name, kind: "str", required: true };
    parseAnnotation(rule, annotation, unsupported);
    if (rhs) {
      if (/^(?:pydantic\.)?Field\s*\(/.test(rhs.masked)) {
        parseFieldCall(rule, rhs, unsupported);
      } else {
        const value = parseLiteral(rhs.code);
        if (value !== undefined) {
          rule.default = value;
          rule.required = false;
        } else {
          unsupported.push(`default ของ \`${name}\` อ่านค่าไม่ได้ (ใช้ค่าคงที่ตรง ๆ)`);
        }
      }
    }
    fields.push(rule);
    bind(name, { kind: "field", line: line.line });
  }

  if (stripWhitespace) {
    for (const rule of fields) if (rule.kind === "str") rule.stripBefore = true;
  }

  for (const binding of bindings.values()) {
    if (binding.kind !== "validator") continue;
    const validator = binding.info;
    const targets: FieldRule[] = [];
    for (const fieldName of validator.fields) {
      if (fieldName === "*") {
        unsupported.push(`validator \`${validator.name}\` ใช้ "*" — ตัวตรวจจำลองไม่รองรับ`);
        continue;
      }
      const rule = fields.find((f) => f.name === fieldName);
      if (!rule) {
        collectionErrors.push(
          `PydanticUserError: Decorators defined with incorrect fields: ${className}.${validator.name} — ไม่มี field ชื่อ '${fieldName}' (บรรทัด ${validator.line})`,
        );
        continue;
      }
      targets.push(rule);
    }
    for (const rule of targets) applyValidator(rule, validator, notes, unsupported);
  }

  return { name: className, fields };
}

interface ParseFnResult {
  mode: ParseMode;
  unsupported: string[];
}

function analyzeParseFunction(lines: LogicalLine[], className: string): ParseFnResult {
  const binding = lastTopLevelBinding(lines, "parse_ai_request");
  if (!binding) return { mode: "missing", unsupported: [] };
  const idx = binding.index;
  if (!/^def\s+parse_ai_request\s*\(/.test(lines[idx].masked)) {
    return { mode: "missing", unsupported: ["`parse_ai_request` ถูกประกาศใหม่ในรูปแบบที่ตัวตรวจอ่านไม่ได้ (เช่น async def หรือ class)"] };
  }
  const body: LogicalLine[] = [];
  for (let i = idx + 1; i < lines.length && lines[i].indent > 0; i += 1) body.push(lines[i]);
  const text = body.map((l) => l.masked).join("\n");
  if (/raise\s+NotImplementedError/.test(text)) return { mode: "not_implemented", unsupported: [] };

  const param = parseDefParams(lines[idx].code)?.[0] || null;
  const reasons: string[] = [];
  const vars = new Map<string, ParseMode>();
  let mode: ParseMode = "no_return";
  let returned = false;
  const cls = className;
  const exprMode = (expr: string): ParseMode | "unknown" => {
    const mv = new RegExp(`^${cls}\\s*\\.\\s*model_validate\\s*\\(\\s*(\\w+)\\s*\\)$`).exec(expr);
    if (mv) return param && mv[1] === param ? "model_validate" : "unknown";
    const ctor = new RegExp(`^${cls}\\s*\\(\\s*\\*\\*\\s*(\\w+)\\s*\\)$`).exec(expr);
    if (ctor) return param && ctor[1] === param ? "constructor" : "unknown";
    return "unknown";
  };

  const base = body.length > 0 ? Math.min(...body.map((l) => l.indent)) : 0;
  for (const line of body) {
    const where = `parse_ai_request (บรรทัด ${line.line})`;
    if (line.indent !== base) {
      reasons.push(`${where}: การเยื้องที่ตัวตรวจไม่เข้าใจ`);
      continue;
    }
    if (returned) {
      reasons.push(`${where}: มีโค้ดหลัง return`);
      continue;
    }
    if (isDocstring(line.masked) || line.masked === "pass") continue;
    const assign = /^(\w+)\s*(?::\s*[\w.\[\], ]+)?=\s*(.+)$/.exec(line.code.trim());
    if (assign && !/^return\b/.test(line.masked)) {
      const m = exprMode(assign[2].trim());
      if (m === "unknown") reasons.push(`${where}: \`${line.code}\``);
      else vars.set(assign[1], m);
      continue;
    }
    const ret = /^return\s+(.+)$/.exec(line.code.trim());
    if (ret) {
      returned = true;
      const expr = ret[1].trim();
      const direct = exprMode(expr);
      if (direct !== "unknown") mode = direct;
      else if (vars.has(expr)) mode = vars.get(expr)!;
      else if (/^\w+$/.test(expr) && expr === param) mode = "wrong_return";
      else if (/^\{[\s\S]*\}$|^dict\(/.test(expr)) mode = "wrong_return";
      else if (new RegExp(`\\b${cls}\\b`).test(expr)) reasons.push(`${where}: \`return ${expr}\``);
      else mode = "wrong_return";
      continue;
    }
    reasons.push(`${where}: \`${line.code}\``);
  }
  return { mode, unsupported: reasons };
}

/**
 * The LAST top-level `class NAME` / `def NAME` wins, because Python rebinds the global each time and
 * the tests look the name up after the whole module has run. Earlier definitions are dead code.
 */
function lastTopLevelBinding(lines: LogicalLine[], name: string): { index: number; kind: "class" | "def" } | null {
  const re = new RegExp(`^(class|(?:async\\s+)?def)\\s+${name}\\b`);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].indent !== 0) continue;
    const m = re.exec(lines[i].masked);
    if (m) return { index: i, kind: m[1] === "class" ? "class" : "def" };
  }
  return null;
}

export function analyzeSource(source: string, className = "AIQueryRequest"): Analysis {
  const scanned = scanSource(source);
  const lines = logicalLines(scanned);
  const notes: string[] = [];
  const collectionErrors: string[] = [];
  const lint: LintIssue[] = [];
  const unsupported: string[] = [];

  const syntax = detectSyntax(scanned, lines);
  if (syntax.length > 0) {
    return {
      collectionErrors: syntax,
      lint: syntax.map((message) => ({ code: "E999", message })),
      model: null,
      parseMode: "missing",
      notes,
      unsupported,
    };
  }

  // imports, unused (F401), undefined (F821 / NameError), star imports (F403)
  const { names, stars } = collectImports(lines);
  const starDefined = new Set<string>();
  for (const star of stars) {
    if (star.module === "pydantic") PYDANTIC_STAR.forEach((n) => starDefined.add(n));
    else if (star.module === "typing") TYPING_STAR.forEach((n) => starDefined.add(n));
    else unsupported.push(`บรรทัด ${star.line}: \`from ${star.module} import *\` — ตัวตรวจไม่รู้ว่าชื่อใดถูกนำเข้า`);
    lint.push({ code: "F403", message: `\`from ${star.module} import *\` used; unable to detect undefined names`, line: star.line });
  }
  const nonImport = lines.filter((l) => !/^(from\s+[\w.]+\s+import|import)\s/.test(l.masked)).map((l) => l.masked).join("\n");
  for (const [name, line] of names) {
    if (countWord(nonImport, name) === 0) lint.push({ code: "F401", message: `\`${name}\` imported but unused`, line });
  }
  for (const known of KNOWN_NAMES) {
    if (!names.has(known) && !starDefined.has(known) && countWord(nonImport, known) > 0) {
      collectionErrors.push(`NameError: name '${known}' is not defined — เพิ่ม import ที่ด้านบนไฟล์`);
      lint.push({ code: "F821", message: `Undefined name \`${known}\`` });
    }
  }

  // module-level statements the checker cannot evaluate (they run when pytest imports the file)
  for (const line of lines) {
    if (line.indent !== 0) continue;
    if (/^(from\s+[\w.]+\s+import|import)\s/.test(line.masked)) continue;
    if (/^(class|def)\s/.test(line.masked) || isDocstring(line.masked) || line.masked === "pass") continue;
    if (/^if\s+__name__\s*==\s*(['"])__main__\1\s*:$/.test(line.code.trim())) continue;
    unsupported.push(`บรรทัด ${line.line}: \`${line.code.length > 60 ? `${line.code.slice(0, 57)}...` : line.code}\` ที่ระดับไฟล์ — ตัวตรวจไม่รันโค้ดนี้`);
  }

  // a later import can rebind the two names the tests look up
  for (const name of [className, "parse_ai_request"]) {
    const line = names.get(name);
    if (line !== undefined) unsupported.push(`บรรทัด ${line}: import ชื่อ \`${name}\` ซ้อนกับที่ประกาศในไฟล์ — ตัวตรวจไม่รู้ว่าชื่อไหนชนะ`);
  }

  const classBinding = lastTopLevelBinding(lines, className);
  let model: SchemaSpec | null = null;
  if (!classBinding) {
    collectionErrors.push(`ImportError: cannot import name '${className}' from 'exercise_day1'`);
  } else if (classBinding.kind !== "class") {
    unsupported.push(`\`${className}\` ถูกประกาศเป็นฟังก์ชันหลังคลาส — ตัวตรวจอ่านรูปแบบนี้ไม่ได้`);
  } else {
    model = parseClass(lines, classBinding.index, className, notes, collectionErrors, unsupported);
    if (!model) unsupported.push(`\`${className}\` ต้องประกาศเป็น class ${className}(BaseModel)`);
  }
  const parseFn = analyzeParseFunction(lines, className);
  if (parseFn.mode === "missing") {
    collectionErrors.push("ImportError: cannot import name 'parse_ai_request' from 'exercise_day1'");
  }
  unsupported.push(...parseFn.unsupported);

  return { collectionErrors, lint, model, parseMode: parseFn.mode, notes, unsupported: [...new Set(unsupported)] };
}
