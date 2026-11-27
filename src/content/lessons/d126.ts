import type { Lesson, LessonVisualId } from "../types";
import { defineLesson, mc, rc } from "./builder";

/** Day 126 · Phase 5 / Block B32 */
const agentFixtureCode = `from dataclasses import dataclass
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError


Route = Literal["rag", "lookup_order", "abstain"]
Tool = Literal["lookup_order"]


class AgentOutput(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid", str_strip_whitespace=True)

    route: Route
    tool: Tool | None
    answer: str = Field(min_length=1)


@dataclass(frozen=True)
class EvalCase:
    case_id: str
    expected_route: Route
    relevant_chunk_ids: tuple[str, ...] = ()

    @property
    def expected_tool(self) -> Tool | None:
        return "lookup_order" if self.expected_route == "lookup_order" else None


@dataclass(frozen=True)
class Observation:
    raw: str
    ranked_chunk_ids: tuple[str, ...]


CASES = (
    EvalCase("TH-05-1", "rag", ("refund#1", "shipping#2")),
    EvalCase("TH-09-1", "lookup_order"),
    EvalCase("TH-07-1", "abstain"),
)
RUN = {
    "TH-05-1": Observation(
        '{"route":"rag","tool":null,"answer":"แจ้งคืนได้ภายใน 7 วัน"}',
        ("faq#2", "refund#1", "other#1"),
    ),
    "TH-09-1": Observation(
        '{"route":"lookup_order","tool":null,"answer":"กำลังตรวจสอบ"}',
        (),
    ),
    "TH-07-1": Observation(
        '{"route":"abstain","tool":null,"answer":["ไม่พบข้อมูล"]}',
        (),
    ),
}`;

const scoringCode = `def retrieval_scores(
    relevant: tuple[str, ...], ranked: tuple[str, ...], k: int
) -> tuple[float, float] | None:
    if k < 1:
        raise ValueError("k must be positive")
    truth = set(relevant)
    if not truth:
        return None

    top = ranked[:k]
    recall = len(truth.intersection(top)) / len(truth)
    rr = next(
        (1 / rank for rank, chunk in enumerate(top, start=1) if chunk in truth),
        0.0,
    )
    return recall, rr


@dataclass(frozen=True)
class CaseScore:
    schema_ok: bool
    route_ok: bool
    tool_ok: bool
    retrieval: tuple[float, float] | None


def score(case: EvalCase, run: Observation, k: int) -> CaseScore:
    retrieval = retrieval_scores(case.relevant_chunk_ids, run.ranked_chunk_ids, k)
    try:
        output = AgentOutput.model_validate_json(run.raw)
    except ValidationError:
        return CaseScore(False, False, False, retrieval)

    return CaseScore(
        schema_ok=True,
        route_ok=output.route == case.expected_route,
        tool_ok=output.tool == case.expected_tool,
        retrieval=retrieval,
    )`;

const reportCode = `def evaluate(
    cases: tuple[EvalCase, ...], observations: dict[str, Observation], k: int
) -> dict[str, CaseScore]:
    ids = {case.case_id for case in cases}
    if not ids:
        raise ValueError("empty eval suite")
    if len(ids) != len(cases):
        raise ValueError("duplicate case IDs")
    missing = ids - observations.keys()
    extra = observations.keys() - ids
    if missing or extra:
        raise ValueError(f"case IDs mismatch, missing={sorted(missing)} extra={sorted(extra)}")
    return {case.case_id: score(case, observations[case.case_id], k) for case in cases}


def summarize(rows: dict[str, CaseScore]) -> dict[str, int | float | None]:
    n = len(rows)
    if n == 0:
        raise ValueError("empty eval results")
    hits = [row.retrieval for row in rows.values() if row.retrieval is not None]
    return {
        "cases": n,
        "retrieval_cases": len(hits),
        "schema_rate": sum(row.schema_ok for row in rows.values()) / n,
        "route_rate": sum(row.route_ok for row in rows.values()) / n,
        "tool_rate": sum(row.tool_ok for row in rows.values()) / n,
        "mean_recall_at_k": sum(recall for recall, _ in hits) / len(hits) if hits else None,
        "mrr_at_k": sum(rr for _, rr in hits) / len(hits) if hits else None,
    }`;

export const d126: Lesson = defineLesson({
  day: 126,
  titleTh: "Deterministic Evals สำหรับ Schema, Tool Selection และ Retrieval",
  tagline: "30 นาที · แยกสัญญา API, การเลือกเครื่องมือ และอันดับหลักฐานใน pytest",
  icon: "flask-conical",
  visual: {
    id: "golden-dataset-evals" as LessonVisualId,
    title: "Golden Dataset → Deterministic Evals",
    caption: "ตาม ID เคสจาก JSONL ไปยังผลตรวจรายด่าน แล้วเทียบ Recall@k กับ MRR@k",
    alt: "แผนภาพจับคู่ expected route และ relevant chunk IDs กับ agent output และอันดับ chunk ที่ดึงจริง",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ output JSON และ ranked chunk IDs จาก fake run จึงไม่เรียกโมเดลหรือเครื่องมือจริง",
  tools: ["Python 3.12", "uv", "Pydantic v2", "pytest", "JSONL"],
  bigPicture: [
    {
      node: 1,
      heading: "เปลี่ยน labels เป็นข้อมูลเข้าเครื่องตรวจ",
      body: "จาก Day 125 เรามี expected route กับ relevant chunk IDs ที่ตรวจจากนโยบายสมมติ ขณะรันให้บันทึก raw response และลำดับ chunk ของระบบด้วย case ID เดียวกัน",
      lessonNote: "เก็บ output คนละไฟล์กับ {{golden-dataset}} เพื่อป้องกันการเขียนทับเฉลยและให้เปรียบเทียบระบบสองรุ่นได้",
    },
    {
      node: 3,
      heading: "ตรวจสิ่งที่มีกฎชัดเจนก่อน",
      body: "JSON รูปร่างผิด, route ผิด และส่ง tool ผิดตรวจผ่าน Pydantic กับการเปรียบเทียบค่าได้ทันที แม้ output เสียให้ใช้ข้อมูล retrieval ที่บันทึกแยกมาวัดได้",
      lessonNote: "รายงาน schema rate, route rate และ tool rate จากทุกแถว โดยแถว schema พังเป็นผลไม่ผ่านสำหรับ route/tool ด้วย พร้อมแสดงรายละเอียดรายเคส",
    },
    {
      node: 4,
      heading: "แยก retrieval coverage ออกจากอันดับแรก",
      body: "ถ้าคำถามคืนสินค้าต้องใช้เงื่อนไข 7 วันและใบส่งคืน แล้วค้นเจอเพียงข้อแรก Recall@3 ได้ครึ่งเดียว ส่วน {{mrr}} สนใจว่าเจอชิ้นแรกเร็วเพียงใด",
      lessonNote: "ใช้ชุดที่มี evidence เป็นตัวหารสำหรับ retrieval และรายงานจำนวนเคสที่ใช้คำนวณ แถว abstain และ tool-only ยังอยู่ในรายงาน route",
    },
    {
      node: 6,
      heading: "เอาคะแนนไปชี้งานแก้และส่งต่อให้ judge",
      body: "ถ้า route ถูกแต่ tool หาย ให้ตรวจ payload ที่ node เรียก MCP ถ้า recall ตกให้เปิด ranked IDs ตรวจ retriever ถ้าด่านโครงสร้างผ่านแต่คำตอบสรุปหลักฐานเกินจริง ให้เพิ่มตัวตรวจเชิงความหมาย",
      lessonNote: "Day 127 จะเขียน rubric ประเมินคำตอบกับหลักฐาน เพื่อครอบคลุมกรณีที่ตรวจด้วย exact match ยาก",
    },
  ],
  objectives: [
    "ตรวจ output JSON ด้วย Pydantic v2 แล้วแยก schema, route และ tool checks",
    "คำนวณ Recall@k และ reciprocal rank ต่อเคส แล้ว aggregate เป็น macro recall และ MRR@k",
    "ใช้ pytest ทดสอบเคสไม่พบหลักฐานซ้ำ ข้อมูลขาด และ schema พังโดยยังอ่านผล retrieval ได้",
  ],
  prerequisites: [
    "Day 121–122: รู้จัก flow RAG, tool call และการใช้ citation",
    "Day 123–125: เคยรัน integration tests และมี golden labels แยกตาม slice",
    "Day 9–10: เคยใช้ pytest และรันหลายชุด input ด้วย parametrize",
  ],
  setup: {
    intro: "ใช้โฟลเดอร์ Day 125 หรือโฟลเดอร์แลบว่าง Worked Example ย่อข้อมูลเป็น 3 เคสจาก golden labels แล้วจับกับ fake run ที่จงใจใส่ข้อผิดพลาด",
    commands: `uv python install 3.12
uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest --version`,
    steps: [
      ["python", "ติดตั้ง Python 3.12 ผ่าน uv"],
      ["deps", "รันคำสั่งตรวจ pytest แล้วเห็นเลขเวอร์ชัน"],
      ["files", "สร้าง worked_deterministic.py สำหรับ Worked Example และ test_deterministic.py สำหรับแบบฝึก"],
    ],
    note: "วางโค้ดจาก Worked Example ทั้งสามขั้นต่อกันตามลำดับในไฟล์เดียว แล้วรัน uv run --no-project --python 3.12 --with 'pydantic>=2,<3' python worked_deterministic.py จากโฟลเดอร์เดียวกัน",
  },
  concepts: [
    {
      id: "strict-contract",
      title: "1 · Schema, route และ tool คือคนละข้อกำหนด",
      paragraphs: [
        "AgentResponse มี route, tool และ answer ให้ Pydantic strict รับเฉพาะ JSON ที่มีชนิดตรงตาม contract ค่า tool เป็น null ได้ถ้าไม่เรียกเครื่องมือ ส่วน route ต้องอยู่ใน enum นี้",
        "สำหรับเคสสถานะออเดอร์ schema ยอมรับ route lookup_order คู่กับ tool null เพราะแยกข้อกำหนดโครงสร้างออกจากการเลือก tool แบบรายเคส เมื่อตรวจต่อ expected_tool จะ fail และชี้ว่าหายตรงไหน",
      ],
      analogy: "เหมือน HTTP integration test ที่เช็ก status, response schema และ side effect เป็น assertion คนละบรรทัด",
      bullets: [
        "strict ป้องกันการแก้ชนิดให้เองระหว่าง validation",
        "extra=forbid จับฟิลด์เกินจาก producer รุ่นใหม่",
        "ถ้าต้องวัด tool arguments ให้เก็บอาร์กิวเมนต์จากการเรียกจริงใน observation และเทียบกับค่าที่อนุญาต",
      ],
      code: {
        language: "python",
        filename: "schema_and_route.py",
        code: `from typing import Literal

from pydantic import BaseModel, ConfigDict


class Output(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    route: Literal["rag", "lookup_order", "abstain"]
    tool: Literal["lookup_order"] | None


output = Output.model_validate_json('{"route":"lookup_order","tool":null}')
print("schema_ok=True")
print(f"route_ok={output.route == 'lookup_order'}")
print(f"tool_ok={output.tool == 'lookup_order'}")`,
      },
      whyTitle: "Why this matters — รายงานบอกชั้นที่ต้องซ่อม",
      whyParagraphs: [
        "schema pass บอกว่าอ่าน payload ได้ route pass บอกว่า agent ตั้งใจเข้ากลุ่มงานที่ถูก ส่วน tool pass บอกว่าชื่อเครื่องมือตรงกับเคส ถ้า trace จริงมี tool call ให้ใช้ข้อมูลจาก trace ฝั่ง runner",
      ],
    },
    {
      id: "retrieval-cutoff",
      title: "2 · วัดหลักฐานที่ครบและอันดับแรกที่เจอ",
      paragraphs: [
        "Recall@k คือจำนวน relevant chunk ID ที่เจอใน k ตำแหน่งแรก หารด้วยจำนวน relevant ID ทั้งหมด ถ้าเฉลยมี refund#1 และ shipping#2 แต่เจอ refund#1 ที่อันดับ 2 เพียงชิ้นเดียว Recall@3 เท่ากับ 0.5",
        "Reciprocal Rank ที่ cutoff k เท่ากับหนึ่งหารด้วยอันดับของ relevant ชิ้นแรก ถ้าเจออันดับ 2 ได้ 0.5 ถ้าไม่เจอในช่วงได้ 0 แล้วนำ RR ของทุกคำถามที่วัดได้มาเฉลี่ยเป็น MRR@k",
      ],
      analogy: "เหมือนเปิดหนังสือค้นข้อสอบ คะแนนหนึ่งถามว่าเจอหน้าที่ต้องใช้ครบไหม อีกคะแนนถามว่าเปิดเจอหน้าที่เกี่ยวข้อแรกเร็วแค่ไหน",
      bullets: [
        "ตัดตามตำแหน่งจริงก่อนคำนวณ; ID ซ้ำกินตำแหน่งแต่ไม่นับเป็นหลักฐานเพิ่ม",
        "ถ้า relevant list ว่าง ให้คืน None สำหรับ retrieval แถวนี้",
        "ถ้ามีเฉลยแต่ retriever คืน list ว่าง ให้คะแนน 0 ทั้งสองตัว",
      ],
      code: {
        language: "python",
        filename: "cutoff_example.py",
        code: `truth = {"refund#1", "shipping#2"}
ranked = ["faq#2", "refund#1", "refund#1", "shipping#2"]
for k in (1, 3, 4):
    top = ranked[:k]
    recall = len(truth.intersection(top)) / len(truth)
    rr = next((1 / i for i, item in enumerate(top, 1) if item in truth), 0.0)
    print(f"k={k} recall={recall:.2f} rr={rr:.2f}")`,
      },
      whyTitle: "Why this matters — คะแนนสูงตัวเดียวอาจกลบหลักฐานที่ขาด",
      whyParagraphs: [
        "ถ้า relevant แรกขึ้นอันดับหนึ่งทุกครั้ง MRR@k จะเป็น 1 แม้ชิ้นที่สองหายทุกครั้ง หลาย policy ต้องใช้ทั้งเงื่อนไขและข้อยกเว้น จึงควรดู Recall@k คู่กัน",
      ],
    },
    {
      id: "report-contract",
      title: "3 · จับคู่ผลตาม ID และรายงานตัวหาร",
      paragraphs: [
        "จับคู่ผลจาก runtime กับ golden case ID ทีละแถว ตรวจว่าทุกเคสได้ observation ถ้าผลหาย ให้ถามว่า runner ข้ามเคสหรือ service timeout ถ้าตั้งใจเก็บ timeout ให้เขียน observation ที่ระบุ failure ชัดเจนตั้งแต่ adapter",
        "อัตราผ่าน schema, route และ tool ใช้จำนวนเคสทั้งหมด ส่วน macro Recall@k และ MRR@k เฉลี่ยต่อคำถามเฉพาะที่มี relevant IDs ให้รายงานจำนวน RAG, tool-only และ abstain แยก เพื่อเห็นว่าคะแนนเฉลี่ยเกิดจากอะไร",
      ],
      analogy: "เหมือน dashboard CI ที่แสดง passed, failed และ skipped พร้อมจำนวนเทสต์ในแต่ละกลุ่ม",
      bullets: [
        "ถ้าต้องการวัด tool routing ให้ดู slice tool แยก เพราะ null ที่ถูกต้องจาก RAG และ abstain อาจดัน tool rate รวม",
        "เทียบ baseline และ candidate ที่ corpus version, split และ k เดียวกัน",
        "ป้อน raw output กับ ranked IDs ที่บันทึกไว้ซ้ำได้เพื่อให้ตัว scorer deterministic แม้ build จริงมีความสุ่ม",
      ],
      code: {
        language: "python",
        filename: "project_golden_cases.py",
        code: `from pathlib import Path

from worked_deterministic import EvalCase
from worked_golden import load_cases


golden = load_cases(Path("golden.jsonl"))
dev = tuple(
    EvalCase(row.case_id, row.expected_route, tuple(row.relevant_chunk_ids))
    for row in golden
    if row.split == "dev"
)
print(f"dev={len(dev)} retrieval={sum(bool(row.relevant_chunk_ids) for row in dev)}")`,
      },
      whyTitle: "Why this matters — เทียบคะแนนได้เมื่อขอบเขตตรงกัน",
      whyParagraphs: [
        "ตัวอย่าง adapter ใช้ Day 125 ในโฟลเดอร์เดียวกัน ผลคือ dev 20 แถวในนั้น 12 แถวมีหลักฐาน สำหรับการวัดจริงให้จับคู่ dev เหล่านี้กับ observation จากรุ่นระบบที่ต้องการเทียบ",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge — แยก assertion ตามชั้นของ API",
      body: ["ใช้แนวคิด contract test, integration test และ ranking test พร้อม case ID เดียวเพื่อค้นผลย้อนหลัง"],
      table: [
        ["JSON contract", "AgentOutput.model_validate_json"],
        ["Controller routing", "expected_route เทียบ route ที่บันทึก"],
        ["Dependency call", "expected_tool เทียบชื่อเครื่องมือ"],
        ["Ranking regression", "Recall@k และ MRR@k"],
      ],
    },
    student: {
      title: "First-Year Note — ลองเรียงการ์ดเพื่อคิดอันดับ",
      body: [
        "เขียนการ์ด doc ชื่อ faq, refund และ shipping วางเรียงจากซ้ายไปขวา ซ้ายสุดนับหนึ่ง ขีดเส้นหลังตำแหน่ง k แล้วนับเฉพาะการ์ดทางซ้าย",
        "คำนวณด้วยมือก่อนรัน Python แล้วลองย้ายบัตร refund จากอันดับสองไปอันดับหนึ่ง Recall อาจอยู่เท่าเดิม ขณะที่ reciprocal rank สูงขึ้น",
      ],
    },
  },
  workedExample: {
    intro: "ลองตรวจ 3 เคสจาก Day 125 ด้วย fake observation โดยเคสคืนของเจอหลักฐานเพียงชิ้นเดียว เคสออเดอร์เลือก route ได้แต่ tool หาย และเคสข้อมูลไม่มีส่ง answer ผิดชนิด",
    steps: [
      {
        title: "1 · ตั้ง contract และข้อมูลก่อนรัน",
        explain: "วาง schema ที่ต้องการและ fixture แต่ละ case ID ไว้คู่กับ output ที่สังเกตได้ ตัวอย่างเก็บ tool ใน JSON เพื่อทดสอบ ก่อนนำไปใช้กับแอปให้ map จาก tool trace จริง",
        code: {
          language: "python",
          filename: "worked_deterministic.py",
          code: agentFixtureCode,
        },
        output: "3 cases, 3 observations",
      },
      {
        title: "2 · เขียน scorer ต่อเคส",
        explain: "วัด retrieval จาก ranked IDs ก่อน parse JSON เพื่อให้ผลค้นยังอยู่แม้ answer เสีย ตรวจ route และ tool ต่อเฉพาะ output ที่ parse ได้",
        code: {
          language: "python",
          filename: "worked_deterministic.py",
          code: scoringCode,
        },
        output: "TH-05-1: Recall@3=0.50, RR@3=0.50",
      },
      {
        title: "3 · ตรวจ ID ก่อนสรุป",
        explain: "รวมคะแนนพร้อมตัวหาร แยก None ออกจากค่า 0 แล้วพิมพ์ case ID ให้ย้อนดูสาเหตุได้",
        code: {
          language: "python",
          filename: "worked_deterministic.py",
          code: reportCode + `


if __name__ == "__main__":
    scores = evaluate(CASES, RUN, k=3)
    for case_id, row in scores.items():
        print(case_id, row)
    for key, value in summarize(scores).items():
        print(f"{key}={value:.3f}" if isinstance(value, float) else f"{key}={value}")`,
        },
        output: `TH-05-1 CaseScore(schema_ok=True, route_ok=True, tool_ok=True, retrieval=(0.5, 0.5))
TH-09-1 CaseScore(schema_ok=True, route_ok=True, tool_ok=False, retrieval=None)
TH-07-1 CaseScore(schema_ok=False, route_ok=False, tool_ok=False, retrieval=None)
cases=3
retrieval_cases=1
schema_rate=0.667
route_rate=0.667
tool_rate=0.333
mean_recall_at_k=0.500
mrr_at_k=0.500`,
      },
    ],
    gotcha: "อย่ารื้อรายการซ้ำก่อนตัด top k ใน scorer เพราะจะเลื่อน document อันดับสี่เข้ามาในช่องที่ผู้ใช้ยังไม่เห็น ถ้าต้องการ deduplicate ให้แก้ใน retriever แล้ววัดใหม่",
  },
  practice: {
    intro: "ใช้ 12 นาทีสร้าง scorer ให้เห็น failure คนละด่าน ทดลองย้ายตำแหน่ง refund#1 และเพิ่มกรณีข้อมูลหายเพื่อทดสอบการรายงานคะแนน",
    requirements: [
      "ทำ retrieval_scores ให้คืน recall และ reciprocal rank หรือ None เมื่อไม่มี labels",
      "ใช้ Pydantic v2 ตรวจ JSON และสะสมค่าสามด่านแบบแยกกัน",
      "ตรวจ case ID ที่ไม่ตรงกันและสรุปผลด้วยตัวหารที่กำหนด",
      "ใช้ pytest ทดสอบ ID ซ้ำในอันดับ ผล retrieval ว่าง k ผิด และ schema เสีย",
    ],
    starter: {
      language: "python",
      filename: "test_deterministic.py",
      code: `import pytest

from worked_deterministic import AgentOutput, CaseScore, EvalCase, Observation


def retrieval_scores(
    relevant: tuple[str, ...], ranked: tuple[str, ...], k: int
) -> tuple[float, float] | None:
    # TODO: ตัด top k แล้วคำนวณ recall และ RR หรือคืน None
    raise NotImplementedError


def score(case: EvalCase, run: Observation, k: int) -> CaseScore:
    # TODO: เก็บ retrieval score แล้ว validate raw JSON ด้วย AgentOutput
    raise NotImplementedError


def test_duplicate_ranked_id() -> None:
    truth = ("refund#1", "shipping#2")
    ranked = ("faq#2", "refund#1", "refund#1", "shipping#2")
    assert retrieval_scores(truth, ranked, 3) == (0.5, 0.5)


def test_invalid_cutoff() -> None:
    with pytest.raises(ValueError):
        retrieval_scores((), (), 0)

# TODO: เพิ่ม evaluate, summarize และเทสต์เมื่อ observation หายหรือ JSON เสีย`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_deterministic.py",
    },
    selfCheck: [
      "ranked IDs ซ้ำยังนับหลักฐานไม่เกินหนึ่งครั้งและใช้ตำแหน่งเดิม",
      "กรณี JSON เสียยังเก็บ retrieval score ที่คำนวณจาก observed IDs",
      "ถ้าไม่มี retrieval case ค่าเฉลี่ยเป็น None พร้อมตัวหาร 0",
    ],
    acceptance: "ชุดเทสต์ผ่านและคำอธิบายผลของสามเคสชี้ด่านที่ต้องแก้ได้",
    hints: [
      {
        body: "ใช้ set เฉพาะตอนนับหลักฐานและใช้ enumerate(..., start=1) บนลำดับจริงตอนหาอันดับ",
      },
      {
        body: "แยก parse error ออกจากคะแนน retrieval แล้วคำนวณสองกลุ่มตัวหารใน summarize",
      },
      {
        body: "แทนเนื้อหาทั้งไฟล์ test_deterministic.py ด้วยเฉลยด้านล่างแล้วรัน pytest จากโฟลเดอร์เดียวกัน",
        code: {
          language: "python",
          filename: "test_deterministic.py",
          code: [agentFixtureCode, scoringCode, reportCode, `import pytest


@pytest.mark.parametrize(
    "ranked,k,want",
    [
        (("faq#2", "refund#1", "shipping#2"), 3, (1.0, 0.5)),
        (("faq#2", "refund#1", "refund#1", "shipping#2"), 3, (0.5, 0.5)),
        (("faq#2", "refund#1"), 1, (0.0, 0.0)),
        ((), 3, (0.0, 0.0)),
    ],
)
def test_retrieval_scores(ranked, k, want) -> None:
    assert retrieval_scores(("refund#1", "shipping#2"), ranked, k) == want


def test_no_ground_truth_and_invalid_cutoff() -> None:
    assert retrieval_scores((), ("faq#2",), 3) is None
    with pytest.raises(ValueError, match="positive"):
        retrieval_scores((), (), 0)


def test_schema_route_and_tool_are_separate() -> None:
    scores = evaluate(CASES, RUN, k=3)
    assert scores["TH-09-1"] == CaseScore(True, True, False, None)
    assert scores["TH-07-1"] == CaseScore(False, False, False, None)
    report = summarize(scores)
    assert report["retrieval_cases"] == 1
    assert report["schema_rate"] == pytest.approx(2 / 3)
    assert report["tool_rate"] == pytest.approx(1 / 3)
    assert report["mrr_at_k"] == 0.5


def test_malformed_answer_keeps_independent_retrieval_observation() -> None:
    case = CASES[0]
    row = score(case, Observation("invalid JSON", ("refund#1",)), 3)
    assert row == CaseScore(False, False, False, (0.5, 1.0))


def test_suite_rejects_missing_runs() -> None:
    with pytest.raises(ValueError, match="missing"):
        evaluate(CASES, {}, k=3)


def test_no_retrieval_cases_has_no_retrieval_average() -> None:
    case = CASES[1]
    summary = summarize(evaluate((case,), {case.case_id: RUN[case.case_id]}, k=3))
    assert summary["retrieval_cases"] == 0
    assert summary["mean_recall_at_k"] is None
    assert summary["mrr_at_k"] is None`].join("\n\n\n"),
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_deterministic.py",
    },
  },
  mistakes: [
    {
      title: "ให้ schema pass เท่ากับผ่านทุกอย่าง",
      symptom: "route lookup_order มี tool null แต่เห็นเฉพาะ schema rate",
      fix: "ใช้ assertion สำหรับค่าที่คาดไว้แต่ละด่าน",
    },
    {
      title: "นับการดึงซ้ำเป็น hit เพิ่ม",
      symptom: "ได้ recall 1 ทั้งที่ดึง refund#1 สองครั้งและ shipping#2 ยังไม่มา",
      fix: "นับ set intersection หลังตัด top k",
    },
    {
      title: "แทน None ด้วย 0 ใน retrieval",
      symptom: "เคส abstain ทำให้ retrieval score ตกโดยไม่มีเหตุ",
      fix: "รายงานเฉพาะ label ที่ใช้วัดและแสดงตัวหาร",
    },
    {
      title: "หารด้วยจำนวน run ที่ส่งผลสำเร็จเท่านั้น",
      symptom: "timeout หายจากรายงานและคะแนนดูดีขึ้น",
      fix: "จับคู่ทุก ID แล้วบันทึก failure เป็น observation ที่ตรวจเจอได้",
    },
  ],
  quiz: {
    intro: "ลองตอบทั้ง 4 ข้อก่อนเปิดเฉลย แล้วจดข้อที่ยังอธิบายด้วยตัวเองไม่ได้ลง Error Log",
    questions: [
      mc(
        "d126-q-1",
        "เคสออเดอร์มี JSON ถูก schema, route ถูก แต่ tool เป็น null คะแนนไหนควร fail?",
        [
          ["schema เท่านั้น", "null อยู่ในสัญญา JSON"],
          ["tool เท่านั้น", "ชื่อเครื่องมือไม่ตรงกับ label"],
          ["route เท่านั้น", "route ตรงอยู่แล้ว"],
          ["ทุกด่านผ่าน", "ต้องตรวจ rule ของเคสด้วย"],
        ],
        "B",
        "Pydantic บอกว่าค่าอ่านได้ การเลือก tool ต้องเทียบความคาดหวังที่มาจากเคส",
        "schema ผ่านแล้วสรุป tool ถูกได้ไหม?",
        "ยังต้องเทียบชื่อเครื่องมือที่ trace บันทึกกับ expected_tool",
      ),
      mc(
        "d126-q-2",
        "เฉลยมี A และ B, top 3 คือ X, A, A ค่า Recall@3 และ RR@3 เท่าไร?",
        [
          ["1 และ 1", "ซ้ำนับครั้งเดียวและ hit แรกอยู่ลำดับสอง"],
          ["1 และ 0.5", "ยังไม่เจอ B"],
          ["0.5 และ 1", "hit แรกอยู่ลำดับสอง"],
          ["0.5 และ 0.5", "เจอหนึ่งจากสองและ hit แรกที่อันดับสอง"],
        ],
        "D",
        "ตัดตามอันดับจริงก่อนนับ distinct relevant IDs แล้วหา reciprocal rank จากตำแหน่งแรกที่เกี่ยวข้อง",
        "Recall กับ RR ต่างกันตรงไหน?",
        "Recall วัด coverage ส่วน RR วัดตำแหน่งแรกที่พบ",
      ),
      mc(
        "d126-q-3",
        "เคสไม่มีข้อมูลและ relevant_chunk_ids ว่าง ควรคำนวณ retrieval อย่างไร?",
        [
          ["คืน None และยังตรวจ route abstain", "ไม่มี denominator สำหรับ recall"],
          ["ให้ recall 0 ทุกครั้ง", "ลงโทษเคสที่ไม่ควรมีหลักฐาน"],
          ["ให้ recall 1 ทุกครั้ง", "ทำให้ค่าเฉลี่ยดีเกินจริง"],
          ["ลบออกจากรายงานทั้งหมด", "route ของเคสนี้ยังสำคัญ"],
        ],
        "A",
        "แยกเคสที่ metric ใช้ไม่ได้ออกจากเคสที่ค้นพลาดจริง และแสดงจำนวนที่เข้า retrieval average",
        "ไม่มี labels กับค้นไม่เจอต่างกันอย่างไร?",
        "ไม่มี labels เป็น N/A ส่วนมี labels แต่ไม่ hit ได้ 0",
      ),
      mc(
        "d126-q-4",
        "schema, tool และ recall ผ่าน แต่คำตอบเติมข้อยกเว้นที่ไม่มีในเอกสาร จะตรวจอย่างไรต่อ?",
        [
          ["เพิ่ม k จนคะแนนดี", "ค่า recall ไม่ตรวจคำกล่าวอ้าง"],
          ["ใช้ exact match ทุกคำ", "อาจลงโทษคำตอบถูกที่ใช้สำนวนอื่น"],
          ["ประเมิน groundedness ต่อ claim ด้วย rubric", "ตรวจความหมายเทียบหลักฐาน"],
          ["เชื่อ schema อย่างเดียว", "schema ตรวจรูปร่างข้อมูล"],
        ],
        "C",
        "ด่านเชิงความหมายตรวจว่าคำกล่าวอ้างรองรับด้วย retrieved context ซึ่งเป็นหัวข้อของ Day 127",
        "คะแนน structural ดีแล้วขาดอะไร?",
        "ยังต้องตรวจว่าคำตอบตรงกับหลักฐานและตอบโจทย์",
      ),
    ],
  },
  takeaways: [
    "ตรวจกฎที่ชัดเจนด้วย Pydantic และ assertions ก่อนใช้ judge",
    "Recall@k วัดหลักฐานครบ ส่วน MRR@k วัดความเร็วที่พบหลักฐานชิ้นแรก",
    "แสดงจำนวนเคสและ split คู่กับคะแนนทุกครั้ง",
    "Day 127 ใช้ rubric ตรวจว่า answer ตรงกับหลักฐานจริง",
  ],
  reviewCards: [
    rc(
      "d126-rc-1",
      "ถ้าเจอ relevant ชิ้นแรกอันดับสาม RR เท่าไร?",
      "1/3 ถ้า cutoff ถึงอันดับสาม มิฉะนั้นได้ 0",
    ),
    rc(
      "d126-rc-2",
      "จัดการ query ที่ไม่มี relevant ID อย่างไร?",
      "แสดง retrieval เป็น N/A และเก็บผล route/schema ตามเดิม",
    ),
    rc(
      "d126-rc-3",
      "ทำไมไม่จับคู่ด้วยลำดับแถว?",
      "runner อาจสลับหรือข้ามผล จับคู่ด้วย ID และตรวจผลหายได้ตรงกว่า",
    ),
  ],
  sources: [
    {
      label: "ir-measures — Recall and Reciprocal Rank",
      href: "https://ir-measur.es/en/latest/measures.html",
    },
    {
      label: "Pydantic v2 — Models",
      href: "https://docs.pydantic.dev/latest/concepts/models/",
    },
    {
      label: "pytest — Parametrizing tests",
      href: "https://docs.pytest.org/en/stable/how-to/parametrize.html",
    },
  ],
  glossary: ["golden-dataset", "pydantic", "pytest", "schema", "mrr", "parametrize", "precision-recall", "groundedness"],
});
