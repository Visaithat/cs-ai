/**
 * Regression tests for QA finding H1: the in-browser checker must never award "passed" or
 * mastery to code whose behaviour it cannot read, and must reject the documented traps
 * (inverted prefix condition, `len()` before `strip()`).
 *
 * Where a real-pytest result is quoted it comes from the QA report (real Pydantic 2.9.0).
 */
import { describe, expect, it } from "vitest";
import { pyStrip, validatePayload, type SchemaSpec } from "../pyschema";
import { analyzeSource } from "./analyze";
import { runExercise } from "./d001";

const HINT3 = `from typing import Literal
from pydantic import BaseModel, Field, field_validator


class AIQueryRequest(BaseModel):
    user_id: str = Field(min_length=6)
    query: str
    language: Literal["th", "en", "mixed"] = "th"
    top_k: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not v.startswith("USR-"):
            raise ValueError("user_id must start with 'USR-'")
        return v

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        cleaned = v.strip()
        if not (3 <= len(cleaned) <= 500):
            raise ValueError("query length must be between 3 and 500")
        return cleaned


def parse_ai_request(payload: dict) -> AIQueryRequest:
    return AIQueryRequest.model_validate(payload)
`;

const QUERY_VALIDATOR = /    @field_validator\("query"\)[\s\S]*?return cleaned\n/;

function withQueryValidator(body: string, decorator = '@field_validator("query")'): string {
  return HINT3.replace(
    QUERY_VALIDATOR,
    `    ${decorator}
    @classmethod
    def v_q(cls, v):
${body
  .split("\n")
  .map((line) => `        ${line}`)
  .join("\n")}
`,
  );
}

const failedTests = (code: string) =>
  runExercise(code)
    .tests.filter((t) => !t.passed)
    .map((t) => t.name);

describe("H1: the documented traps are rejected", () => {
  it("A) inverted prefix condition fails (real pytest: 2/5 passed) and withholds mastery", () => {
    const code = HINT3.replace('if not v.startswith("USR-"):', 'if v.startswith("USR-"):');
    const report = runExercise(code);
    expect(report.status).toBe("failed");
    expect(report.mastered).toBe(false);
    expect(report.tests.filter((t) => t.passed)).toHaveLength(2);
    expect(failedTests(code)).toEqual(
      expect.arrayContaining(["test_valid_defaults_and_stripping", "test_reject_invalid_user_id_prefix", "test_accept_mixed_language"]),
    );
  });

  it("B) len() checked BEFORE strip fails test_reject_whitespace_only_query", () => {
    const code = withQueryValidator('if len(v) < 3 or len(v) > 500:\n    raise ValueError("len")\nreturn v.strip()');
    const report = runExercise(code);
    expect(report.status).toBe("failed");
    expect(report.mastered).toBe(false);
    expect(failedTests(code)).toEqual(["test_reject_whitespace_only_query"]);
  });

  it("B') the same order mistake via a stripped copy that is returned but checked on the raw value", () => {
    const code = withQueryValidator('cleaned = v.strip()\nif len(v) < 3 or len(v) > 500:\n    raise ValueError("len")\nreturn cleaned');
    expect(failedTests(code)).toEqual(["test_reject_whitespace_only_query"]);
  });

  it("C) `if False and not v.startswith(...)` is not read as enforcing the prefix", () => {
    const code = HINT3.replace('if not v.startswith("USR-"):', 'if False and not v.startswith("USR-"):');
    const report = runExercise(code);
    expect(report.status).not.toBe("passed");
    expect(report.mastered).toBe(false);
    expect(report.unsupported.join(" ")).toContain("False and not");
  });

  it("the correct order still passes in each readable spelling", () => {
    const spellings = [
      'cleaned = v.strip()\nif not (3 <= len(cleaned) <= 500):\n    raise ValueError("len")\nreturn cleaned',
      'v = v.strip()\nif len(v) < 3 or len(v) > 500:\n    raise ValueError("len")\nreturn v',
      'cleaned = v.strip()\nif len(cleaned) < 3:\n    raise ValueError("short")\nif len(cleaned) > 500:\n    raise ValueError("long")\nreturn cleaned',
      'cleaned = v.strip()\nif len(cleaned) <= 2 or len(cleaned) >= 501: raise ValueError("len")\nreturn cleaned',
      'cleaned = v.strip()\nif not (3 <= len(cleaned) < 501):\n    raise ValueError("len")\nreturn cleaned',
    ];
    for (const body of spellings) {
      const report = runExercise(withQueryValidator(body));
      expect(report.unsupported, body).toEqual([]);
      expect(report.status, body).toBe("passed");
      expect(report.mastered, body).toBe(true);
    }
  });

  it("an empty-only check after strip does not enforce the 3-char minimum", () => {
    const code = withQueryValidator('cleaned = v.strip()\nif not cleaned:\n    raise ValueError("empty")\nreturn cleaned');
    const report = runExercise(code);
    // real pytest also passes 5/5 here (whitespace-only is rejected); the edge-case probes catch the missing 3-char minimum
    expect(report.status).toBe("passed");
    expect(report.probes.some((p) => !p.passed)).toBe(true);
    expect(report.mastered).toBe(false);
  });
});

describe("H1: unreadable shapes are flagged, never silently passed", () => {
  const notPassed = (code: string) => {
    const report = runExercise(code);
    expect(report.status === "passed" || report.mastered).toBe(false);
    return report;
  };

  it("extra conditions, early returns and non-ValueError raises", () => {
    notPassed(HINT3.replace('if not v.startswith("USR-"):', 'if not v.startswith("USR-") and len(v) > 100:'));
    notPassed(withQueryValidator('if v == "x":\n    return v\ncleaned = v.strip()\nif not (3 <= len(cleaned) <= 500):\n    raise ValueError("len")\nreturn cleaned'));
    const wrongRaise = notPassed(HINT3.replace('raise ValueError("user_id must start with \'USR-\'")', 'raise TypeError("bad")'));
    expect(wrongRaise.unsupported.length).toBeGreaterThan(0);
  });

  it("len(v.strip()) and other expressions we do not read", () => {
    const report = notPassed(withQueryValidator('if len(v.strip()) < 3 or len(v.strip()) > 500:\n    raise ValueError("len")\nreturn v.strip()'));
    expect(report.unsupported.length).toBeGreaterThan(0);
  });

  it("helper calls inside validators", () => {
    const report = notPassed(HINT3.replace("return cleaned", "return normalize(cleaned)"));
    expect(report.unsupported.join(" ")).toContain("normalize(cleaned)");
  });

  it("reports `unverified` (not passed) when the simulated tests are green but part of the code is unreadable", () => {
    const report = runExercise(HINT3.replace("user_id: str = Field(min_length=6)", "user_id: str = Field(min_length=6, strict=True)"));
    expect(report.tests.every((t) => t.passed)).toBe(true);
    expect(report.status).toBe("unverified");
    expect(report.mastered).toBe(false);
    expect(report.unsupported.join(" ")).toContain("strict");
    expect(report.summary).toContain("ยังไม่นับว่าผ่าน");
  });

  it("unreadable Field(...) values, unknown Field keywords and Annotated metadata", () => {
    notPassed(HINT3.replace("le=20", "le=MAX_TOP_K"));
    notPassed(HINT3.replace("ge=1, le=20", "ge=1, le=20, strict=True"));
    notPassed(
      HINT3.replace("user_id: str = Field(min_length=6)", "user_id: Annotated[str, StringConstraints(min_length=6)]").replace(
        "from typing import Literal",
        "from typing import Annotated, Literal",
      ),
    );
  });

  it("other base classes, model_config options and file-level statements", () => {
    notPassed(HINT3.replace("(BaseModel)", "(Base)"));
    notPassed(
      HINT3.replace("class AIQueryRequest(BaseModel):\n", "class AIQueryRequest(BaseModel):\n    model_config = ConfigDict(strict=True)\n").replace(
        "from pydantic import BaseModel, Field, field_validator",
        "from pydantic import BaseModel, ConfigDict, Field, field_validator",
      ),
    );
    notPassed(`${HINT3}\nAIQueryRequest.model_validate = lambda payload: payload\n`);
  });

  it("parse_ai_request that does not simply validate its payload", () => {
    notPassed(HINT3.replace("model_validate(payload)", "model_validate(payload, strict=True)"));
    notPassed(HINT3.replace("    return AIQueryRequest.model_validate(payload)", "    payload = {**payload}\n    return AIQueryRequest.model_validate(payload)"));
    notPassed(
      HINT3.replace(
        "    return AIQueryRequest.model_validate(payload)",
        "    try:\n        return AIQueryRequest.model_validate(payload)\n    except Exception:\n        return AIQueryRequest.model_construct(**payload)",
      ),
    );
  });

  it("validator modes and decorators it cannot model", () => {
    notPassed(HINT3.replace('@field_validator("user_id")', '@field_validator("user_id", mode="wrap")'));
    notPassed(HINT3.replace('    @field_validator("user_id")', '    @model_validator(mode="after")\n    @field_validator("user_id")'));
  });

  it("allows `if __name__ == \"__main__\":` blocks at file level", () => {
    const report = runExercise(`${HINT3}\n\nif __name__ == "__main__":\n    print(parse_ai_request({"user_id": "USR-1", "query": "สวัสดี"}))\n`);
    expect(report.status).toBe("passed");
  });
});

/**
 * R1: Python keeps only the LAST binding of a name. Real Pydantic 2.9.0 results are quoted from the
 * QA regression report (docs/qa-regression-review.md, cases c01 c02 c04 c05 c15 c16).
 */
describe("R1: last definition wins (duplicate classes, functions and validator names)", () => {
  const renameBoth = HINT3.replace("def validate_user_id", "def check").replace("def validate_query", "def check");
  const QUERY_FIRST = HINT3.replace(
    /    @field_validator\("user_id"\)[\s\S]*?return v\n\n/,
    "",
  ).replace(
    "\n\ndef parse_ai_request",
    `
    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not v.startswith("USR-"):
            raise ValueError("user_id must start with 'USR-'")
        return v


def parse_ai_request`,
  );

  const expectNeverCredited = (code: string, failing: string[]) => {
    const report = runExercise(code);
    expect(report.status).not.toBe("passed");
    expect(report.mastered).toBe(false);
    expect(report.tests.filter((t) => !t.passed).map((t) => t.name)).toEqual(expect.arrayContaining(failing));
    return report;
  };

  it("c01) both validators named `check`, user_id first: only the query validator survives (real: 4/5)", () => {
    const report = expectNeverCredited(renameBoth, ["test_reject_invalid_user_id_prefix"]);
    expect(report.tests.filter((t) => t.passed)).toHaveLength(4);
    expect(report.notes.join(" ")).toContain("ถูกแทนที่");
  });

  it("c02) both validators named `check`, query first: only the user_id validator survives (real: 3/5)", () => {
    const code = QUERY_FIRST.replace("def validate_user_id", "def check").replace("def validate_query", "def check");
    // sanity: the reordered source really has the query validator first
    expect(code.indexOf('"query"')).toBeLessThan(code.indexOf('"user_id"'));
    const report = expectNeverCredited(code, ["test_reject_whitespace_only_query"]);
    expect(report.tests.filter((t) => t.passed)).toHaveLength(3);
  });

  it("c15) a second `validate_query` that just returns v replaces the real one (real: 3/5)", () => {
    const code = HINT3.replace(
      "\n\ndef parse_ai_request",
      `
    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        return v


def parse_ai_request`,
    );
    const report = expectNeverCredited(code, ["test_reject_whitespace_only_query"]);
    expect(report.tests.filter((t) => t.passed)).toHaveLength(3);
  });

  it("the copy-paste mistake: user_id block duplicated for `query` but the method name is kept", () => {
    const code = HINT3.replace(/    @field_validator\("query"\)[\s\S]*?return cleaned\n/, '    @field_validator("query")\n    @classmethod\n    def validate_user_id(cls, v: str) -> str:\n        return v\n');
    expectNeverCredited(code, ["test_reject_invalid_user_id_prefix"]);
  });

  it("c16) a plain method with the validator's name removes the validator (real: 3/5)", () => {
    const code = HINT3.replace(
      "\n\ndef parse_ai_request",
      `
    def validate_query(self):
        return self


def parse_ai_request`,
    );
    const report = expectNeverCredited(code, ["test_reject_whitespace_only_query"]);
    expect(report.tests.filter((t) => t.passed)).toHaveLength(3);
  });

  it("c04) a second parse_ai_request that skips validation wins (real: 1/5)", () => {
    const code = `${HINT3}

def parse_ai_request(payload: dict) -> AIQueryRequest:
    return AIQueryRequest.model_construct(**payload)
`;
    const report = runExercise(code);
    expect(report.status).not.toBe("passed");
    expect(report.mastered).toBe(false);
    expect(report.unsupported.join(" ")).toContain("model_construct");
  });

  it("c04') the second parse_ai_request is the good one and the first is a stub: the last still decides", () => {
    const code = HINT3.replace(
      "def parse_ai_request(payload: dict) -> AIQueryRequest:",
      'def parse_ai_request(payload: dict) -> AIQueryRequest:\n    raise NotImplementedError("later")\n\n\ndef parse_ai_request(payload: dict) -> AIQueryRequest:',
    );
    expect(runExercise(code).status).toBe("passed");
  });

  it("c05) a second, unconstrained class AIQueryRequest replaces the real one (real: 1/5)", () => {
    const code = `${HINT3}

class AIQueryRequest(BaseModel):
    user_id: str
    query: str
    language: str = "th"
    top_k: int = 5
    temperature: float = 0.2
`;
    const report = runExercise(code);
    expect(report.status).not.toBe("passed");
    expect(report.mastered).toBe(false);
    expect(report.tests.filter((t) => t.passed).length).toBeLessThan(5);
  });

  it("c05') the constrained class is last: it is the one checked, and passes", () => {
    const code = `class AIQueryRequest(BaseModel):
    user_id: str
    query: str

${HINT3}`;
    const report = runExercise(code);
    expect(report.status).toBe("passed");
    expect(report.mastered).toBe(true);
  });

  it("a later `def AIQueryRequest` or an import of the tested names is never credited", () => {
    const asFunction = `${HINT3}\n\ndef AIQueryRequest(**kwargs):\n    return kwargs\n`;
    expect(runExercise(asFunction).status).not.toBe("passed");
    const reimported = `${HINT3}\nfrom elsewhere import parse_ai_request\n`;
    const report = runExercise(reimported);
    expect(report.status === "passed" || report.mastered).toBe(false);
  });

  it("a name reused between a field and a method is flagged, not guessed at", () => {
    const code = HINT3.replace("\n\ndef parse_ai_request", "\n    def query(self):\n        return 1\n\n\ndef parse_ai_request");
    const report = runExercise(code);
    expect(report.status === "passed" || report.mastered).toBe(false);
    expect(report.unsupported.join(" ")).toContain("ประกาศซ้ำ");
  });

  it("the reference solution and distinct validator names are unaffected", () => {
    expect(analyzeSource(HINT3).unsupported).toEqual([]);
    expect(analyzeSource(HINT3).notes).toEqual([]);
    expect(runExercise(HINT3).mastered).toBe(true);
  });
});

describe("H1/L5: imports", () => {
  it("`from pydantic import *` defines the pydantic names (no false NameError), reports F403 and withholds mastery", () => {
    const report = runExercise(HINT3.replace("from pydantic import BaseModel, Field, field_validator", "from pydantic import *"));
    expect(report.collectionErrors).toEqual([]);
    expect(report.status).toBe("passed");
    expect(report.lint.map((l) => l.code)).toContain("F403");
    expect(report.mastered).toBe(false);
  });

  it("star imports from unknown modules are flagged", () => {
    const report = runExercise(`from helpers import *\n${HINT3}`);
    expect(report.status).not.toBe("passed");
  });
});

describe("supported alternative spellings keep working", () => {
  it('mode="before" strip validator', () => {
    const code = withQueryValidator("return v.strip()", '@field_validator("query", mode="before")').replace("query: str\n", "query: str = Field(min_length=3, max_length=500)\n");
    const report = runExercise(code);
    expect(report.status).toBe("passed");
    expect(report.mastered).toBe(true);
  });

  it("two separate validators on one field run in definition order", () => {
    const code = withQueryValidator("return v.strip()") .replace(
      "\n\ndef parse_ai_request",
      `
    @field_validator("query")
    @classmethod
    def v_len(cls, v):
        if not (3 <= len(v) <= 500):
            raise ValueError("len")
        return v


def parse_ai_request`,
    );
    const report = runExercise(code);
    expect(report.unsupported).toEqual([]);
    expect(report.status).toBe("passed");
  });
});

describe("analyzer output", () => {
  it("lists no unsupported shapes for the reference solution shape", () => {
    expect(analyzeSource(HINT3).unsupported).toEqual([]);
  });
});

describe("pyschema: ordered validator steps", () => {
  const spec: SchemaSpec = {
    name: "X",
    fields: [
      {
        name: "q",
        kind: "str",
        required: true,
        steps: [
          { op: "reject_len", on: "raw", conds: [{ cmp: "<", n: 3 }], message: "raw too short" },
          { op: "output", value: "stripped" },
          { op: "reject_len", on: "raw", conds: [{ cmp: "<", n: 3 }], message: "stripped too short" },
          { op: "output", value: "raw" },
        ],
      },
    ],
  };

  it("applies each step to the value it was written against", () => {
    expect(validatePayload(spec, { q: "  a  " })).toMatchObject({ ok: false, errors: [{ msg: "Value error, stripped too short" }] });
    expect(validatePayload(spec, { q: "a" })).toMatchObject({ ok: false, errors: [{ msg: "Value error, raw too short" }] });
    expect(validatePayload(spec, { q: "  abc  " })).toMatchObject({ ok: true, data: { q: "abc" } });
  });

  it("pyStrip follows Python str.strip(): strips \\x1c-\\x1f and NBSP but not the BOM", () => {
    expect(pyStrip(" 　 x \x1f\n")).toBe("x");
    expect(pyStrip("﻿x﻿")).toBe("﻿x﻿");
  });
});
