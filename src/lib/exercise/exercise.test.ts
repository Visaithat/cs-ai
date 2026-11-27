import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runExercise } from "./d001";

const root = path.resolve(__dirname, "../../../exercises/d001");
const read = (file: string) => readFileSync(path.join(root, file), "utf-8").replace(/\r\n/g, "\n");

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

describe("exercise files stay in sync", () => {
  it("solution/test_day1.py equals test_day1.py", () => {
    expect(read("solution/test_day1.py")).toBe(read("test_day1.py"));
  });
});

describe("runExercise (browser simulation of test_day1.py)", () => {
  it("fails every test on the untouched starter, with a NotImplementedError hint", () => {
    const report = runExercise(read("exercise_day1.py"));
    expect(report.status).toBe("failed");
    expect(report.tests).toHaveLength(5);
    expect(report.tests.every((t) => !t.passed)).toBe(true);
    expect(report.tests[0].message).toContain("NotImplementedError");
    expect(report.lint.map((l) => l.code)).toContain("F401");
  });

  it("passes the reference solution file and is lint clean + mastered", () => {
    const report = runExercise(read("solution/exercise_day1.py"));
    expect(report.status).toBe("passed");
    expect(report.summary).toMatch(/^5 passed/);
    expect(report.lint).toEqual([]);
    expect(report.probes.every((p) => p.passed)).toBe(true);
    expect(report.mastered).toBe(true);
  });

  it("passes the Hint-3 listing as-is", () => {
    expect(runExercise(HINT3).status).toBe("passed");
  });

  it("accepts the ConfigDict(str_strip_whitespace=True) variant (Hint 2)", () => {
    const code = `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AIQueryRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    user_id: str = Field(min_length=6)
    query: str = Field(min_length=3, max_length=500)
    language: Literal["th", "en", "mixed"] = "th"
    top_k: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)

    @field_validator("user_id")
    @classmethod
    def check_prefix(cls, v: str) -> str:
        if not v.startswith("USR-"):
            raise ValueError("bad prefix")
        return v


def parse_ai_request(payload: dict) -> AIQueryRequest:
    return AIQueryRequest(**payload)
`;
    const report = runExercise(code);
    expect(report.status).toBe("passed");
    expect(report.mastered).toBe(true);
  });

  it("accepts Annotated[...] fields and a returned local variable", () => {
    const code = `from typing import Annotated, Literal
from pydantic import BaseModel, Field, field_validator


class AIQueryRequest(BaseModel):
    user_id: Annotated[str, Field(min_length=6)]
    query: str
    language: Literal["th", "en", "mixed"] = "th"
    top_k: Annotated[int, Field(ge=1, le=20)] = 5
    temperature: Annotated[float, Field(ge=0.0, le=1.0)] = 0.2

    @field_validator("user_id")
    @classmethod
    def v1(cls, v):
        if not v.startswith("USR-"):
            raise ValueError("no")
        return v

    @field_validator("query")
    @classmethod
    def v2(cls, v):
        v = v.strip()
        if len(v) < 3 or len(v) > 500:
            raise ValueError("no")
        return v


def parse_ai_request(payload: dict) -> AIQueryRequest:
    req = AIQueryRequest.model_validate(payload)
    return req
`;
    expect(runExercise(code).status).toBe("passed");
  });

  it("catches the whitespace-only gotcha when query is only min_length-checked", () => {
    const code = HINT3.replace(/    @field_validator\("query"\)[\s\S]*?return cleaned\n/, "").replace(
      "query: str\n",
      "query: str = Field(min_length=3, max_length=500)\n",
    );
    const report = runExercise(code);
    expect(report.status).toBe("failed");
    const failing = report.tests.filter((t) => !t.passed).map((t) => t.name);
    expect(failing).toContain("test_valid_defaults_and_stripping");
    expect(failing).toContain("test_reject_whitespace_only_query");
  });

  it("flags a validator that strips but returns the original value", () => {
    const report = runExercise(HINT3.replace("return cleaned", "return v"));
    expect(report.status).toBe("failed");
    expect(report.notes.join(" ")).toContain("ไม่ได้ return ค่าที่ตัดแล้ว");
  });

  it("detects wrong bounds via probes (le=10 for top_k) and withholds mastery", () => {
    const report = runExercise(HINT3.replace("le=20", "le=10"));
    expect(report.probes.some((p) => !p.passed)).toBe(true);
    expect(report.mastered).toBe(false);
  });

  it("reports NameError as a collection error instead of crashing", () => {
    const code = HINT3.replace("from pydantic import BaseModel, Field, field_validator", "from pydantic import BaseModel, field_validator");
    const report = runExercise(code);
    expect(report.status).toBe("error");
    expect(report.collectionErrors[0]).toContain("name 'Field' is not defined");
  });

  it("reports syntax errors", () => {
    const report = runExercise(HINT3.replace("class AIQueryRequest(BaseModel):", "class AIQueryRequest(BaseModel)"));
    expect(report.status).toBe("error");
    expect(report.collectionErrors[0]).toContain("expected ':'");
  });

  it("reports a missing class as ImportError", () => {
    const report = runExercise("def parse_ai_request(payload: dict):\n    return payload\n");
    expect(report.status).toBe("error");
    expect(report.collectionErrors.join(" ")).toContain("cannot import name 'AIQueryRequest'");
  });

  it("flags unused imports as ruff-style F401 without failing tests", () => {
    const report = runExercise(HINT3.replace("from typing import Literal", "from typing import Any, Literal"));
    expect(report.status).toBe("passed");
    expect(report.lint[0]).toMatchObject({ code: "F401" });
    expect(report.mastered).toBe(false);
  });

  it("does not crash on empty or garbage input", () => {
    expect(runExercise("").status).toBe("error");
    expect(runExercise("}{)(\n:::").status).toBe("error");
  });
});
