/** Tiny dependency-free syntax tokenizer for the languages used in lessons. */

export type TokenKind = "kw" | "str" | "num" | "com" | "fn" | "dec" | "plain";
export interface Token {
  kind: TokenKind;
  text: string;
}

const PY_KEYWORDS =
  "def|class|import|from|as|return|raise|if|else|elif|try|except|finally|for|in|not|and|or|with|pass|None|True|False|lambda|while|assert|is|yield|async|await";

const PY_RE = new RegExp(
  [
    "(#[^\\n]*)", // 1 comment
    "(\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|[rbfRBF]{0,2}\"(?:\\\\.|[^\"\\\\\\n])*\"|[rbfRBF]{0,2}'(?:\\\\.|[^'\\\\\\n])*')", // 2 string
    "(@\\w+)", // 3 decorator
    "\\b(\\d+(?:\\.\\d+)?)\\b", // 4 number
    `\\b(${PY_KEYWORDS})\\b`, // 5 keyword
    "\\b([A-Za-z_]\\w*)(?=\\()", // 6 call / def name
  ].join("|"),
  "g",
);

const SH_RE = /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|(--?[a-zA-Z][\w-]*)/g;
const JSON_RE = /("(?:\\.|[^"\\\n])*")|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g;

function run(code: string, re: RegExp, classify: (m: RegExpExecArray) => TokenKind): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  re.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    if (match[0] === "") {
      re.lastIndex += 1;
      continue;
    }
    if (match.index > last) tokens.push({ kind: "plain", text: code.slice(last, match.index) });
    tokens.push({ kind: classify(match), text: match[0] });
    last = match.index + match[0].length;
  }
  if (last < code.length) tokens.push({ kind: "plain", text: code.slice(last) });
  return tokens;
}

export function tokenize(code: string, language: string): Token[] {
  switch (language) {
    case "python":
      return run(code, PY_RE, (m) => (m[1] ? "com" : m[2] ? "str" : m[3] ? "dec" : m[4] ? "num" : m[5] ? "kw" : "fn"));
    case "bash":
      return run(code, SH_RE, (m) => (m[1] ? "com" : m[2] ? "str" : "fn"));
    case "json":
      return run(code, JSON_RE, (m) => (m[1] ? "str" : m[2] ? "num" : "kw"));
    default:
      return [{ kind: "plain", text: code }];
  }
}
