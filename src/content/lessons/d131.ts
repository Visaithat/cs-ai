import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const triadFixture = `{
  "cases": [
    {
      "case_id": "return-window",
      "faithfulness": 1.0,
      "context_recall": 1.0,
      "context_precision": 1.0
    },
    {
      "case_id": "warranty-screen",
      "faithfulness": 0.9,
      "context_recall": 0.8,
      "context_precision": 0.75
    }
  ],
  "critical_cases": ["warranty-screen"]
}
`;

const gateModels = `import argparse
import json
from pathlib import Path
from statistics import mean
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator


THRESHOLDS = {
    "faithfulness": 0.85,
    "context_recall": 0.80,
    "context_precision": 0.75,
}
Score = Annotated[float, Field(ge=0.0, le=1.0, strict=True, allow_inf_nan=False)]


class TriadRow(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    case_id: str = Field(min_length=1)
    faithfulness: Score
    context_recall: Score
    context_precision: Score


class GateInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cases: list[TriadRow] = Field(min_length=1)
    critical_cases: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def verify_case_ids(self) -> "GateInput":
        ids = {row.case_id for row in self.cases}
        if len(ids) != len(self.cases):
            raise ValueError("case IDs must be unique")
        if len(set(self.critical_cases)) != len(self.critical_cases):
            raise ValueError("critical case IDs must be unique")
        if set(self.critical_cases) - ids:
            raise ValueError("critical case ID missing from cases")
        return self


def summarize(dataset: GateInput) -> dict:
    averages = {
        name: mean(getattr(row, name) for row in dataset.cases)
        for name in THRESHOLDS
    }
    failed_metrics = [
        name for name, floor in THRESHOLDS.items() if averages[name] < floor
    ]
    return {
        "cases_checked": len(dataset.cases),
        "case_ids": [row.case_id for row in dataset.cases],
        "means": averages,
        "thresholds": THRESHOLDS,
        "failed_metrics": failed_metrics,
    }
`;

const gateChecks = `def evaluate(dataset: GateInput) -> dict:
    report = summarize(dataset)
    critical_ids = set(dataset.critical_cases)
    failed_critical = [
        row.case_id
        for row in dataset.cases
        if row.case_id in critical_ids
        and row.faithfulness < THRESHOLDS["faithfulness"]
    ]
    return {
        **report,
        "failed_critical": failed_critical,
        "passed": not report["failed_metrics"] and not failed_critical,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("fixture", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    try:
        data = GateInput.model_validate_json(args.fixture.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, ValidationError):
        report = {"passed": False, "error": "missing or invalid triad fixture"}
        exit_code = 2
    else:
        report = evaluate(data)
        exit_code = 0 if report["passed"] else 1

    args.report.parent.mkdir(parents=True, exist_ok=True)
    output = json.dumps(report, ensure_ascii=False, indent=2)
    args.report.write_text(output + "\\n", encoding="utf-8")
    print(output)
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
`;

const tests = `import json
import subprocess
import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

from triad_ci import GateInput, THRESHOLDS, evaluate


def row(case_id="return-window", **scores):
    return {"case_id": case_id, **THRESHOLDS, **scores}


def test_exact_threshold_passes():
    assert evaluate(GateInput(cases=[row()]))["passed"]


def test_recall_failure_visible_under_good_other_scores():
    dataset = GateInput(cases=[
        row(faithfulness=1.0, context_recall=0.79, context_precision=1.0)
    ])
    report = evaluate(dataset)
    assert report["passed"] is False
    assert report["failed_metrics"] == ["context_recall"]


def test_critical_case_can_fail_when_mean_passes():
    dataset = GateInput(
        cases=[row(faithfulness=1.0), row("warranty-screen", faithfulness=0.8)],
        critical_cases=["warranty-screen"],
    )
    report = evaluate(dataset)
    assert report["means"]["faithfulness"] == pytest.approx(0.9)
    assert report["failed_metrics"] == []
    assert report["failed_critical"] == ["warranty-screen"]
    assert report["passed"] is False


@pytest.mark.parametrize("cases, critical", [
    ([], []),
    ([row(), row()], []),
    ([row()], ["warranty-screen"]),
    ([row(faithfulness=float("nan"))], []),
    ([row(context_precision=1.01)], []),
    ([row(context_recall="0.9")], []),
])
def test_rejects_missing_and_invalid_data(cases, critical):
    with pytest.raises(ValidationError):
        GateInput(cases=cases, critical_cases=critical)


@pytest.mark.parametrize("payload, expected_exit", [
    ({"cases": [row()]}, 0),
    ({"cases": [row(context_recall=0.79)]}, 1),
    ({"cases": []}, 2),
])
def test_cli_writes_json_even_when_red(tmp_path, payload, expected_exit):
    fixture = tmp_path / "fixture.json"
    output = tmp_path / "reports" / "triad.json"
    fixture.write_text(json.dumps(payload), encoding="utf-8")
    cli = Path(__file__).with_name("triad_ci.py")
    result = subprocess.run(
        [sys.executable, str(cli), str(fixture), "--report", str(output)],
        check=False,
    )
    assert result.returncode == expected_exit
    report = json.loads(output.read_text(encoding="utf-8"))
    assert report["passed"] == (expected_exit == 0)
`;

const baselineCommand = `uv run --locked npx --no-install promptfoo eval -c promptfooconfig.yaml --filter-providers '^baseline-grounded$' --no-cache -o reports/promptfoo.json`;

const workflow = `name: Thai RAG evaluations

on:
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: thai-rag-eval-\${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  eval:
    name: Thai RAG eval gate
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      PROMPTFOO_DISABLE_TELEMETRY: '1'
      PROMPTFOO_DISABLE_UPDATE: '1'
      PROMPTFOO_PASS_RATE_THRESHOLD: '100'
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: '22.22.0'
          cache: npm
          cache-dependency-path: package-lock.json

      - uses: astral-sh/setup-uv@v7
        with:
          version: '0.13.9'
          python-version: '3.12'
          enable-cache: true
          cache-dependency-glob: uv.lock

      - name: Install locked dependencies
        run: |
          uv sync --locked
          npm ci

      - name: Deterministic tests
        run: uv run --locked pytest -q

      - name: RAG Triad gate using mock scores
        run: uv run --locked python triad_ci.py triad_fixture.json --report reports/triad.json

      - name: Promptfoo baseline gate
        run: ${baselineCommand}

      - name: Upload eval reports
        if: \${{ always() }}
        uses: actions/upload-artifact@v4
        with:
          name: thai-rag-eval-reports
          path: reports/*.json
          if-no-files-found: ignore
          retention-days: 7
`;

const localRun = `uv sync --locked
npm ci
uv run --locked pytest -q
uv run --locked python triad_ci.py triad_fixture.json --report reports/triad.json
${baselineCommand}`;

export const d131: Lesson = defineLesson({
  day: 131,
  titleTh: "ตั้ง Automated Eval Gate ใน GitHub Actions CI",
  tagline: "30 นาที · แปลงเกณฑ์คุณภาพเป็น status check ที่หยุด Pull Request และเก็บรายงานไว้แก้ปัญหา",
  icon: "workflow",
  visual: {
    id: "ci-eval-gate",
    title: "GitHub Actions Eval Gate",
    caption: "ตามการไหลจาก Pull Request ผ่าน pytest, เกณฑ์ RAG Triad, Promptfoo และรายงานเมื่อ check แดง",
    alt: "แผนภาพ Pull Request เข้าสู่ชุดตรวจและตัดสินผล merge จาก required status check",
  },
  requiresApiKey: false,
  apiKeyNote: "ด่าน PR ใช้ fixture และ Python fake จาก D130 การติดตั้ง dependency ใช้เครือข่าย",
  tools: ["GitHub Actions", "Promptfoo", "Python 3.12", "uv", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ล็อกทั้งข้อมูลประเมินและสิ่งที่ติดตั้ง",
      body: "Thai Knowledge RAG/Agent ใช้ชุด {{golden-dataset}} จาก D125 และ fixture ของ D130 เก็บ `uv.lock` กับ `package-lock.json` ใน Git เพื่อให้ runner ใช้ dependency ชุดเดียวกับเครื่องเรา",
      lessonNote: "ชุด smoke ใช้ข้อมูลสังเคราะห์และผล Triad แบบ mock เพื่อให้ทีมทดสอบเครื่องมือและสายงาน CI ได้ในทุก PR",
    },
    {
      node: 3,
      heading: "เปลี่ยนความคาดหวังเป็นกติกาที่รันได้",
      body: "เริ่มจาก {{pytest}} แล้วตรวจเกณฑ์แยกสามแกนของ D129 และตรวจผลรายเคสด้วย {{promptfoo}} เฉพาะ baseline ที่ใช้งาน",
      lessonNote: "สคริปต์ส่ง exit code เพื่อให้ runner รู้ว่าต้องหยุด จากนั้นเก็บ JSON เพื่อให้คนอ่านว่าด่านไหนเสีย",
    },
    {
      node: 4,
      heading: "ให้ผลของ job มีผลต่อการ merge",
      body: "workflow ถูกเรียกเมื่อมี PR เข้า main ส่วนกฎของ branch ตั้งให้ `Thai RAG eval gate` ต้องผ่านก่อน merge",
      lessonNote: "ใน D132 จะทำให้ check แดงด้วยการแก้ prompt แล้วส่ง commit แก้ไขกลับมาจนเขียว",
    },
    {
      node: 6,
      heading: "ส่งข้อมูลกลับให้คนแก้ตรงจุด",
      body: "ใช้ชื่อ metric, case ID และผล assertion จาก artifact ที่ผูกกับ workflow run เพื่อเทียบก่อนและหลังการแก้ไข",
      lessonNote: "ผลประเมินก่อน merge เป็นส่วนหนึ่งของ Evaluated & Guarded AI Microservice v0.5.0 ใน D156 ส่วนข้อมูลจาก request จริงจะเริ่มใน D133",
    },
  ],

  objectives: [
    "สร้าง workflow ที่รัน pytest, เกณฑ์ Triad และ Promptfoo baseline บน Pull Request แล้วเก็บ JSON แม้ขั้นประเมินตก",
    "กำหนดเกณฑ์แยกตาม metric กับเคสสำคัญ และแยก exit code ของคุณภาพตกออกจาก fixture ที่ผิดรูป",
    "ตั้ง required status check ใช้ dependency cache ตาม lockfile และวาง API secrets ในงานที่รันจากโค้ดที่เชื่อถือได้",
  ],
  prerequisites: [
    "D124 มี Thai Knowledge RAG/Agent ที่จะยกระดับเป็นบริการพร้อมประเมิน",
    "D125–D126 มี golden dataset และ deterministic evals",
    "D127–D129 อ่านผล judge หลัง calibration และรู้ความหมายของสามแกน RAG Triad",
    "D130 มี prompt, provider, config และ test files ที่รัน baseline ผ่านแล้ว",
  ],

  setup: {
    intro: "เปิด root ของ `thai-rag-eval` จาก D130 และใช้ GitHub repository สำหรับแลบที่ branch เป้าหมายชื่อ main",
    commands: `uv sync --locked
npm ci
uv run --locked pytest -q
git status --short`,
    steps: [
      ["locks", "ตรวจว่ามี `uv.lock` และ `package-lock.json` และ commit คู่กับไฟล์ manifest"],
      ["fixture", "สร้าง `triad_fixture.json` จาก Concept 1 จากนั้นสร้าง `triad_ci.py` และ `test_triad_ci.py`"],
      ["workflow", "บันทึก workflow ที่ `.github/workflows/eval-gate.yml` และรวมเข้ากับ repo แลบ"],
    ],
    note: "ไฟล์ Python และ lockfiles อยู่ที่ root ตามตัวอย่าง หากใช้ monorepo ให้ตั้ง working directory ของ run steps และปรับ cache path กับ artifact path ให้ชี้ไปที่แล็บเดียวกัน",
  },

  concepts: [
    {
      id: "axis-thresholds",
      title: "1 · แยกค่าเฉลี่ยรายแกนกับข้อกำหนดรายเคส",
      paragraphs: [
        "D129 วัด Faithfulness, Context Recall และ Context Precision คนละด้าน เลือกขั้นต่ำ `0.85`, `0.80` และ `0.75` ตามลำดับสำหรับแลบนี้ เทียบ mean ของแต่ละแกนกับ threshold ของตัวเอง",
        "ถ้า Faithfulness ของเคสคืนสินค้าเป็น 1.0 และเคสจอแตกเป็น 0.8 ค่าเฉลี่ย 0.9 ผ่านเกณฑ์รวม แต่ความเสี่ยงจากคำสัญญาเรื่องประกันยังอยู่ เพิ่มเกณฑ์ Faithfulness รายเคสสำหรับ `warranty-screen` ให้ตกทันทีเมื่อค่าต่ำกว่า 0.85",
        "เคสไม่มีหลักฐานต้องตรวจการงดตอบใน Promptfoo เพราะ fixture Triad ชุดนี้จำลองเฉพาะเคสที่มีเอกสารจริง ขอบเขตของสองชุดประเมินต่างกันด้วยเหตุผลนี้",
      ],
      analogy: "เหมือนเช็กเวลาตอบ API เฉลี่ยพร้อมตั้ง timeout แยกสำหรับจ่ายเงิน เพราะ latency ต่ำของหน้าทั่วไปชดเชยการจ่ายเงินที่ค้างไม่ได้",
      code: {
        language: "json",
        filename: "triad_fixture.json",
        code: triadFixture,
        caption: "ตัวเลขกำหนดไว้สำหรับทดสอบตัวตัดสิน ในระบบจริงให้นำผลรายเคสที่คำนวณจากคำตอบของ commit ปัจจุบันเข้าสคีมานี้",
      },
      whyTitle: "รู้ว่าค่าใน artifact มาจากการรันแบบไหน",
      whyParagraphs: [
        "ผลในแลบนี้ทดสอบการอ่านและบังคับใช้ threshold จากตัวเลขสมมติ ส่วน Promptfoo เรียก adapter และ render prompt จากไฟล์จริงของรอบนั้น เมื่อเชื่อม {{ragas}} ให้สร้างแถวจากคำตอบที่ประเมินสดและผูกกับรุ่น dataset และ judge",
        "ก่อนใช้เกณฑ์จริง เก็บคะแนน baseline จากหลายรอบและเทียบกับเคสที่คนตรวจด้วยวิธี D128 ค่า threshold ในแลบช่วยสาธิตการหยุด PR และไม่ควรยกไปใช้ทุกบริการโดยไม่วัด",
      ],
    },
    {
      id: "exit-code-contract",
      title: "2 · ใช้ Exit Code ตัดสินผล ใช้ JSON บอกเหตุผล",
      paragraphs: [
        "คำว่า PASS หรือ FAIL บน stdout ไม่มีผลต่อ job status โดยตรง โปรแกรมต้องคืน 0 เมื่อผ่านและคืนค่าอื่นเมื่อมีปัญหา ตัวอย่างกำหนด 1 สำหรับคุณภาพต่ำกว่าเกณฑ์ และ 2 สำหรับ fixture ที่อ่านหรือ validate ไม่ได้",
        "ปฏิเสธ input ว่าง คะแนนที่เกินช่วง เคสที่มี ID ซ้ำ หรือ ID ของเคสสำคัญที่หายไปก่อนคำนวณ mean ให้ fail เมื่อขาดหลักฐานว่าตรวจครบ",
        "เทียบค่าจริงก่อนปัดเศษ เช่น 0.8499 ยังต่ำกว่า 0.85 ถึงแม้แสดงสองตำแหน่งแล้วได้ 0.85 เท่ากัน เก็บตัวเลขเดิมในรายงานเพื่อไล่ปัญหาขอบเขต",
      ],
      analogy: "เหมือน HTTP status code คู่กับ error payload ตัวระบบอ่านสถานะได้เร็ว และคนแก้ได้จากรายละเอียด",
      code: {
        language: "python",
        filename: "triad_ci.py (ส่วนแรก)",
        code: gateModels,
      },
      whyTitle: "ให้ด่านตรวจจับข้อมูลประเมินเสียได้ด้วย",
      whyParagraphs: [
        "ถ้าชื่อ field เปลี่ยนแล้วระบบแอบตั้งค่าที่หายเป็น 1.0 PR ที่ยังไม่ผ่านการตรวจจะดูเขียว การ validate ด้วย {{pydantic}} ทำให้ schema เปลี่ยนแล้วเห็นปัญหาทันที",
        "เก็บรายงานทั้งเมื่อผ่านและเมื่อ fail โดยเขียนไฟล์ก่อนคืน exit code หาก installer หรือ pytest ตกและยังไม่มีรายงาน ให้อ่าน log ของ step นั้น",
      ],
    },
    {
      id: "workflow-branch-rule",
      title: "3 · ใช้ job เดียวเป็น Required Status Check",
      paragraphs: [
        "`pull_request` บน main รันเมื่อเปิด PR หรือส่ง commit ใหม่ ส่วน `workflow_dispatch` ให้รันจากหน้า Actions เมื่อจำเป็น การตั้งชื่อ job แบบคงที่ช่วยให้เลือก check จาก branch rule ได้",
        "ให้ pytest ทำงานก่อนเพื่อจับความผิดพลาดของ Python และ fixture ที่ไม่ต้องรัน eval pipeline ส่วน Promptfoo รันเฉพาะ `baseline-grounded` และบังคับผ่านทุกเคสด้วย threshold 100 เปอร์เซ็นต์",
        "ถ้า step ใดได้ exit code ที่ไม่ใช่ศูนย์ job จะล้มเหลวตามปกติ `always()` ทำให้ขั้น upload ยังพยายามเก็บรายงานที่สร้างแล้ว ให้ผลของ job คงเป็น failure เพื่อให้กฎ branch ทำงาน",
      ],
      analogy: "เหมือนตั้ง test suite ให้เป็นเงื่อนไขอนุมัติ release โดยมีใบเหตุผลติดกับรอบตรวจที่ตก",
      code: {
        language: "yaml",
        filename: ".github/workflows/eval-gate.yml",
        code: workflow,
      },
      whyTitle: "แยกการรัน check ออกจากการบังคับที่ branch",
      whyParagraphs: [
        "หลังมี workflow run เลือก `Thai RAG eval gate` ใน ruleset หรือ branch protection ของ main เปิด require status checks แล้วทดสอบกับ PR ฝึกหัด ระวังชื่อ job ซ้ำกับ workflow อื่น",
        "ใช้ concurrency ให้ commit ใหม่ยกเลิกรอบเก่าของ PR เดียวกัน ตรวจ run ของ commit ล่าสุดทุกครั้ง และเปิด trigger ที่จำเป็นหากทีมใช้ merge queue ใน repo จริง",
      ],
    },
    {
      id: "dependencies-and-secrets",
      title: "4 · Cache dependency ได้และคำนวณ eval ใหม่ทุกครั้ง",
      paragraphs: [
        "`setup-node` เก็บ npm download cache ตาม `package-lock.json` และ `setup-uv` ใช้ `uv.lock` เป็นตัวกำหนด cache สำหรับ Python คำสั่ง `npm ci` กับ `uv sync --locked` อ่านผลจาก lockfiles แม้ cache ว่าง",
        "แยก {{caching}} ของแพ็กเกจออกจากผลตอบของ provider คำสั่ง `--no-cache` สั่งประเมิน prompt ใหม่ทุกครั้งเพื่อให้เห็นผลของโค้ดหรือคำสั่งที่เพิ่งแก้",
        "d131 ใช้ fake ทุก PR จึงทำงานได้ทั้ง branch ภายในและ fork เมื่อต้องใช้ LLM judge จริงให้แยกเป็นงานบน branch ที่เชื่อถือได้และใช้ environment protection ให้เฉพาะ step ที่เรียก judge ได้รับ secret",
      ],
      analogy: "เหมือนเอาหนังสือเดิมกลับมาใช้สอบได้ แต่ตรวจคำตอบที่ผู้เข้าสอบส่งใหม่ทุกครั้ง",
      code: {
        language: "yaml",
        filename: "trusted-env-example.yml (เฉพาะส่วน env ของ step)",
        code: `env:
  OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}`,
        caption: "วาง mapping นี้เฉพาะ step ของงาน judge จากโค้ดที่ผ่านการตรวจ และเก็บ secret ในการตั้งค่า GitHub",
      },
      whyTitle: "ลดเวลาติดตั้งและรักษาขอบเขตข้อมูลทดสอบ",
      whyParagraphs: [
        "GitHub โดยปกติไม่ส่ง repository secrets ให้ workflow แบบ pull_request จาก fork งานที่ต้องรันโค้ด PR ให้ใช้ permission ขั้นต่ำและ fake หลีกเลี่ยงการใช้ pull_request_target เพื่อรันโค้ดที่ผู้ส่ง PR ควบคุมพร้อม secrets",
        "รายงาน eval อาจมีคำถามกับคำตอบเต็ม ให้ใช้ข้อมูลสังเคราะห์ใน artifact สาธารณะ และคุมสิทธิ์กับอายุไฟล์เมื่อเชื่อมข้อมูลจริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · จาก Unit Test ถึง Merge Rule",
      body: [
        "Workflow ส่ง exit status เหมือน CI ของเว็บ จุดที่เพิ่มสำหรับ AI คือเกณฑ์ที่มาจากข้อมูลหลายเคส ต้องให้คนไล่จากเลข aggregate กลับไปถึงเคสและ prompt ได้",
      ],
      table: [
        ["Unit tests และ API contract tests", "pytest สำหรับ schema และ Promptfoo สำหรับสัญญาคำตอบ"],
        ["Service level objective", "threshold แยกเป็น faithfulness, recall, precision"],
        ["Build artifact", "JSON ที่แสดงแกนหรือเคสที่ตก"],
        ["Required check ก่อน merge", "job ชื่อคงที่บน branch ruleset"],
      ],
    },
    student: {
      title: "First-Year Note · เครื่องตัดสินต้องมีสัญญาณที่เครื่องอื่นอ่านได้",
      body: [
        "นึกถึงคะแนนที่อาจารย์เขียนในกระดาษคือรายงาน JSON ส่วนผ่านหรือไม่ผ่านที่ระบบทะเบียนอ่านคือ exit code ถ้าในกระดาษบอกตกแต่ส่งสถานะผ่าน ระบบทะเบียนจะยังให้ไปต่อ",
        "ลองตั้งคะแนนไว้เท่ากับ 0.85 แล้วลดลงเป็น 0.8499 เพื่อเห็นว่าเกณฑ์ของเราอ่านว่าตั้งแต่ 0.85 ไม่ใช่ประมาณ 0.85",
      ],
    },
  },

  workedExample: {
    intro: "ต่อ D129 และ D130 เป็นงาน CI เดียวสำหรับ Thai Knowledge RAG แล้วตรวจทั้งทางเดินผ่านและทางเดินตกโดยยังไม่เสียค่า API",
    steps: [
      {
        title: "1 · สรุปคะแนนและทำให้โปรแกรมคืนผลจริง",
        explain: "คัดลอก code ของ Concept 2 เป็นส่วนแรกของ `triad_ci.py` ต่อด้วยส่วนต่อไปนี้ แล้วรันด้วย fixture ของ Concept 1 ค่า 0 หรือ 1 มาจากผล evaluate ส่วน 2 หมายถึง input อ่านไม่ได้หรือตรวจไม่ผ่าน",
        code: {
          language: "python",
          filename: "triad_ci.py (ส่วนต่อท้าย)",
          code: gateChecks,
        },
        output: `uv run python triad_ci.py triad_fixture.json --report reports/triad.json
cases_checked: 2
means: faithfulness=0.95, context_recall=0.90, context_precision=0.875
failed_metrics: []
failed_critical: []
passed: true (exit 0)`,
      },
      {
        title: "2 · ทำให้ค่าเฉลี่ยผ่านแต่เคสประกันตก",
        explain: "สร้างสำเนา fixture แล้วลด Faithfulness ของ warranty-screen จาก 0.9 เป็น 0.8 ขั้นนี้ตั้งใจให้ exit 1 หลังเขียนรายงาน ใช้คำสั่งดูพฤติกรรมในเครื่องด้วย Python ตัวเดียวกับ workflow",
        code: {
          language: "python",
          filename: "make_bad_triad_fixture.py",
          code: `import json
from pathlib import Path

fixture = json.loads(Path("triad_fixture.json").read_text(encoding="utf-8"))
warranty = next(row for row in fixture["cases"] if row["case_id"] == "warranty-screen")
warranty["faithfulness"] = 0.8
Path("triad_bad.json").write_text(
    json.dumps(fixture, ensure_ascii=False, indent=2) + "\\n",
    encoding="utf-8",
)`,
        },
        output: `uv run python make_bad_triad_fixture.py
uv run python triad_ci.py triad_bad.json --report reports/triad-bad.json
means.faithfulness: 0.90
failed_metrics: []
failed_critical: ["warranty-screen"]
passed: false (exit 1)`,
      },
      {
        title: "3 · ตรวจคำสั่งเดียวกับ Actions แล้วตั้ง required check",
        explain: "บันทึก workflow ของ Concept 3 และไฟล์ทดสอบในส่วน Practice ตั้ง branch เป้าหมาย main หลัง workflow รันแล้วเลือกชื่อ job จากหน้า ruleset หรือ branch protection และเก็บ artifact ของ run นั้นไว้เทียบกับ D132",
        code: {
          language: "bash",
          filename: "terminal",
          code: localRun,
        },
        output: `Deterministic tests          PASS
RAG Triad mock scores        PASS
Promptfoo baseline           PASS
Artifact                     thai-rag-eval-reports`,
      },
    ],
    gotcha: "ตัวอย่าง step 2 เขียน triad-bad.json เพื่อฝึกในเครื่อง ส่วน workflow ใช้ triad_fixture.json ที่ดี ถ้า check ไม่ปรากฏใน branch settings ให้ดูว่าชื่อ job ตรงกับ run ที่เกิดขึ้นแล้วและ PR ชี้เข้า main",
  },

  practice: {
    intro: "เติมตัวตัดสินรายเคสและ CLI ให้ runner แยก quality regression จาก input ที่เสียได้ ใช้ fixture ของ Concept 1 และส่วน schema จาก Concept 2",
    requirements: [
      "เทียบค่าเฉลี่ยแต่ละแกนกับ THRESHOLDS และใช้ค่า Faithfulness ขั้นต่ำของเคส critical ควบคู่กัน",
      "บันทึก report แม้ fixture ไม่ผ่าน schema หรือคะแนนต่ำ โดยใช้ exit 0, 1 หรือ 2 ตามสัญญา",
      "ทดสอบกรณีเกณฑ์พอดี mean ผ่านแต่ critical case ตก เคสว่าง และข้อมูลคะแนนเสีย",
      "เพิ่ม workflow ใน repo ฝึกของคุณ รัน job แล้วให้ชื่อ `Thai RAG eval gate` เป็น required check บน main",
    ],
    starter: {
      language: "python",
      filename: "triad_ci.py (ต่อท้าย Concept 2)",
      code: `def evaluate(dataset: GateInput) -> dict:
    report = summarize(dataset)
    # TODO: ตรวจ faithfulness ของ critical cases และประกอบผลผ่าน/ตก
    raise NotImplementedError


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("fixture", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    # TODO: validate fixture, เขียน JSON report แล้วคืน exit code
    raise NotImplementedError


if __name__ == "__main__":
    raise SystemExit(main())`,
    },
    verification: {
      language: "python",
      filename: "test_triad_ci.py",
      code: tests,
    },
    selfCheck: [
      "ค่าที่เท่ากับ threshold ผ่านและค่า NaN, ค่าเกินหนึ่ง หรือจำนวนเคสศูนย์โดนปฏิเสธ",
      "JSON ระบุว่าเคส critical ใดตกแม้ค่าเฉลี่ยทั้งสามแกนผ่าน",
      "คำสั่งรัน bad fixture ได้ exit 1 และมีไฟล์รายงานให้เปิดดู",
      "ชื่อ required job ตรงกับ job ของ run จริงและ artifact อยู่คู่กับผลของ commit เดียวกัน",
    ],
    acceptance: "pytest ผ่าน 12 เคส workflow เขียวบน baseline และหลักฐานการทดสอบ bad fixture แสดง exit 1 พร้อม failed_critical",
    hints: [
      { body: "แยกผลรวมกับเงื่อนไขรายเคส เก็บคีย์ `failed_metrics` และ `failed_critical` เป็นคนละลิสต์ก่อนตัดสินผลรวม" },
      { body: "เรียก `GateInput.model_validate_json` ใน try block แล้วสร้าง report กับ exit code ตามแต่ละทาง ไม่ต้องคำนวณค่าเฉลี่ยเมื่อข้อมูลไม่ผ่าน" },
      {
        body: "เฉลยสี่ไฟล์ต่อจากโปรเจกต์ D130 แยกชื่อไฟล์จากหัวบรรทัดใน bundle ก่อนรัน",
        code: {
          language: "text",
          filename: "d131-solution.txt",
          code: `=== triad_fixture.json ===
${triadFixture}
=== triad_ci.py ===
${gateModels}

${gateChecks}
=== test_triad_ci.py ===
${tests}
=== .github/workflows/eval-gate.yml ===
${workflow}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: localRun,
    },
  },

  mistakes: [
    {
      title: "รวม metric สามแกนเป็นคะแนนเดียว",
      symptom: "faithfulness และ precision สูงกลบ recall ต่ำ ทำให้ดึงหลักฐานไม่ครบทั้งที่ PR เขียว",
      fix: "เช็ก floor ต่อ metric แล้วเพิ่มเกณฑ์รายเคสสำหรับเงื่อนไขที่ความผิดพลาดมีผลสูง",
    },
    {
      title: "พิมพ์ผล FAIL แล้วจบโปรแกรมด้วย 0",
      symptom: "log ขึ้น FAIL แต่หน้า PR ยังเขียว",
      fix: "ให้ Python ใช้ SystemExit และให้ shell ส่ง exit code ของ Promptfoo ต่อโดยไม่กลืนสถานะ",
    },
    {
      title: "ใช้ cache ผล eval ข้ามการแก้ provider",
      symptom: "แก้ Python fake แล้วผลเดิมยังโผล่โดยไม่ได้เรียก provider",
      fix: "เก็บ cache สำหรับ dependencies และใช้ `--no-cache` ให้ eval รันตามโค้ดปัจจุบัน",
    },
    {
      title: "ให้ PR จาก fork ต้องใช้ secret",
      symptom: "ภายในรันได้ แต่ PR ของผู้ร่วมงานจาก fork เข้าถึง key ไม่ได้",
      fix: "ให้ required workflow ใช้ชุด offline และจำกัดงานที่ต้องใช้ key ให้อยู่หลังการตรวจโค้ดบน trusted branch",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d131-threshold",
        "ค่าเฉลี่ยทั้งสามแกนผ่าน แต่ Faithfulness ของ warranty-screen ซึ่งเป็นเคส critical เท่ากับ 0.8 ควรได้ผลอะไร",
        [
          ["ผ่านเพราะเทียบเฉพาะ mean", "เงื่อนไข critical แยกตรวจรายเคส"],
          ["ตกเพราะต่ำกว่า floor 0.85 ของเคสสำคัญ", "รายงาน failed_critical จะบอก case ID"],
          ["ตกเพราะ Context Precision ต่ำ", "ค่าที่ระบุเป็น Faithfulness"],
          ["ข้ามเคสนี้เพราะค่าต่ำกว่าค่าเฉลี่ย", "การข้ามลบหลักฐานความเสียหาย"],
        ],
        "B",
        "ใช้เกณฑ์เฉลี่ยต่อแกนและเกณฑ์รายเคสควบคู่กันเพื่อจับทั้งแนวโน้มและความเสียหายเฉพาะจุด",
        "ค่าเฉลี่ยผ่านแต่ case critical ตก ผล gate เป็นอะไร",
        "ตก และบันทึก case ID ไว้ใน failed_critical",
      ),
      mc(
        "d131-failure",
        "pytest ผ่านและ Promptfoo คืน 100 ขั้น upload artifact ยังทำงานด้วย always() ผลของ job เป็นอย่างไร",
        [
          ["เขียวถ้า upload สำเร็จ", "upload สำเร็จไม่ล้างผลล้มเหลวของ step ก่อนหน้า"],
          ["เขียวเมื่อมี triad.json", "การมีรายงานไม่เปลี่ยน exit code"],
          ["แดง และรายงานที่สร้างแล้วถูกเก็บ", "status ใช้ตัดสิน ส่วน artifact ใช้แก้ปัญหา"],
          ["pending จนกว่าจะลบ artifact", "pending เกี่ยวกับ check ที่ยังไม่รายงานผล"],
        ],
        "C",
        "Promptfoo exit code ที่ไม่ใช่ศูนย์ทำให้ job fail การเก็บหลักฐานหลังจากนั้นยังทำได้",
        "always() บน upload เปลี่ยน job แดงให้เขียวไหม",
        "ผลของ step ที่ล้มเหลวยังคงทำให้ job แดง",
      ),
      mc(
        "d131-fork",
        "ทีมอยากได้ required check ที่รันได้บน PR จาก fork และอยากวัด Ragas ด้วย judge ที่ใช้ key ด้วย ควรวางอย่างไร",
        [
          ["offline gate สำหรับทุก PR และ judge job บน trusted ref", "PR ตรวจได้ครบโดยไม่ต้องใช้ secret ส่วน judge ได้สิทธิ์จำกัด"],
          ["commit key ไว้ใน YAML", "ทำให้ผู้เห็น repo อ่าน key ได้"],
          ["ใส่ key ใน artifact", "artifact ไม่ใช่ที่จัดเก็บ credentials"],
          ["ให้ fork PR เรียก workflow ที่รันโค้ด PR พร้อม secret", "โค้ดที่ผู้ส่ง PR แก้ได้ไม่ควรได้ key"],
        ],
        "A",
        "เส้นทาง required ใช้ fake และโค้ดที่ตรวจแล้วค่อยเรียก judge แบบแยกงาน",
        "งานแบบไหนควรรับ key สำหรับ judge",
        "งานบน trusted ref ที่เปิดสิทธิ์ให้เฉพาะ step ที่ต้องใช้",
      ),
      mc(
        "d131-cache",
        "อะไรควร cache ข้าม commit ใน workflow ตัวอย่าง",
        [
          ["คำตอบสุดท้ายของ prompt ทุกแถว", "อาจกดทับผลที่เกิดจาก prompt หรือ provider ที่เปลี่ยน"],
          ["ค่า pass ของ check ก่อนหน้า", "แต่ละ commit ต้องแสดงผลของการรันของตัวเอง"],
          ["ตัวเลข Ragas จาก production ทุกเคสพร้อมข้อมูลลูกค้า", "ข้อมูลจริงต้องมีขอบเขตสิทธิ์และอายุที่ชัด"],
          ["npm และ uv dependency caches โดยใช้ lockfiles", "ช่วยลดงานติดตั้งและให้ eval ประมวลผลใหม่ได้"],
        ],
        "D",
        "dependency cache ลดเวลาเตรียม runner ส่วนผล eval ต้องผูกกับ code และ prompt ของรอบปัจจุบัน",
        "lockfile กับ --no-cache รับผิดชอบอะไร",
        "lockfile ตรึง dependency ส่วน --no-cache ใช้ให้ Promptfoo เรียก provider ใหม่",
      ),
    ],
  },

  takeaways: [
    "ตั้ง threshold ต่อ metric เทียบก่อนปัดเศษ และกำหนดเคส critical แยกเมื่อมีเงื่อนไขที่ยอมให้เฉลี่ยกลบไม่ได้",
    "ส่ง exit code จากตัวตัดสินถึง runner แล้วเก็บ JSON ไว้สืบหาสาเหตุ",
    "cache ตาม lockfiles และแยกงาน judge ที่มี secrets จาก required PR gate",
    "D132 จะใช้ workflow เดิมซ้อมทำให้ prompt เสีย อ่านรายงาน แล้วพิสูจน์ว่าซ่อมแล้ว check เขียว",
  ],
  reviewCards: [
    rc("d131-rule", "ขั้นใดทำให้ job แดงและขั้นใดทำให้ PR merge ไม่ได้", "exit code ที่ไม่เป็นศูนย์ทำให้ job แดง ส่วน branch rule ที่ require check ใช้ผลนั้นบล็อก merge"),
    rc("d131-invalid", "ทำไม empty fixture ต้องทำให้ CI ตก", "การไม่มีข้อมูลไม่ให้หลักฐานว่าระบบผ่าน และค่าเฉลี่ยของชุดว่างไม่มีความหมาย"),
    rc("d131-cache", "ทำไมต้องปิด Promptfoo result cache ใน gate", "เพื่อประเมิน prompt กับ provider implementation ของ commit ปัจจุบัน"),
    rc("d131-critical", "เมื่อใดควรตรวจค่าแยกรายเคส", "เมื่อความผิดของเคสมีผลกระทบสูงจนยอมให้ค่าเฉลี่ยชุดข้อมูลกลบไม่ได้"),
  ],
  sources: [
    { label: "GitHub Docs · Workflow syntax", href: "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax" },
    { label: "GitHub Docs · Protected branches", href: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches" },
    { label: "GitHub Docs · Use secrets", href: "https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets" },
    { label: "uv · GitHub Actions integration", href: "https://docs.astral.sh/uv/guides/integration/github/" },
    { label: "Promptfoo · Command line and exit codes", href: "https://www.promptfoo.dev/docs/usage/command-line/" },
  ],
  glossary: ["rag", "golden-dataset", "pytest", "pydantic", "promptfoo", "ragas", "caching", "llm-as-a-judge"],
});
