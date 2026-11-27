import type { Lesson, LessonVisualId } from "../types";
import { defineLesson, mc, rc } from "./builder";

/** Day 127 · Phase 5 / Block B32 */
const judgeFixtureCode = `from collections.abc import Callable
from dataclasses import dataclass
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError


class Vote(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid", str_strip_whitespace=True)
    winner: Literal["A", "B", "tie"]
    reason: str = Field(min_length=1)


@dataclass(frozen=True)
class Candidate:
    id: str
    text: str


@dataclass(frozen=True)
class Item:
    query: str
    evidence: str
    required: str


ITEM = Item(
    "ขอคืนสินค้าได้ภายในกี่วันและเริ่มนับเมื่อไร",
    "[refund#1] แจ้งคืนได้ภายใน 7 วันนับจากวันที่รับสินค้า",
    "ต้องระบุ 7 วันและนับจากวันที่รับสินค้า",
)
SHORT = Candidate("short", "แจ้งคืนได้ภายใน 7 วันนับจากวันที่รับสินค้า [refund#1]")
LONG_EQUAL = Candidate(
    "long_equal",
    "สำหรับคำถามเรื่องการคืนสินค้า ขอแจ้งตามนโยบายดังนี้: "
    "แจ้งคืนได้ภายใน 7 วันนับจากวันที่รับสินค้า [refund#1] "
    "ขอบคุณที่สอบถามฝ่ายบริการลูกค้าค่ะ",
)
LONG_WRONG = Candidate(
    "long_wrong",
    "เพื่อให้วางแผนการคืนสินค้าได้อย่างครบถ้วน ทางร้านขอแนะนำให้ตรวจสอบว่า "
    "คุณชำระเงินเมื่อใด เพราะต้องแจ้งคืนภายใน 14 วันนับจากวันที่ชำระเงิน [refund#1] "
    "กรุณาจดบันทึกวันชำระเงินและติดต่อฝ่ายบริการลูกค้าหากมีคำถามเพิ่มเติม",
)

Judge = Callable[[Item, str, str], str]


def vote_json(winner: Literal["A", "B", "tie"], reason: str) -> str:
    return Vote(winner=winner, reason=reason).model_dump_json()


def position_fake(item: Item, a: str, b: str) -> str:
    return vote_json("A", "fixture: always chooses the first answer")


def verbosity_fake(item: Item, a: str, b: str) -> str:
    winner = "A" if len(a) > len(b) else "B" if len(b) > len(a) else "tie"
    return vote_json(winner, "fixture: compares character count")


def rubric_fake(item: Item, a: str, b: str) -> str:
    # Fixture เฉพาะสามคำตอบนี้ ใช้ทดสอบสายงานโดยไม่ส่งไปยังโมเดลจริง
    labels = {SHORT.text: True, LONG_EQUAL.text: True, LONG_WRONG.text: False}
    if item != ITEM:
        raise ValueError("unknown rubric fixture")
    a_ok, b_ok = labels[a], labels[b]
    winner = "tie" if a_ok == b_ok else "A" if a_ok else "B"
    return vote_json(winner, "fixture: checks the 7-day window and receipt date")`;

const pairCode = `@dataclass(frozen=True)
class PairResult:
    status: Literal["decided", "tie", "review"]
    candidate_id: str | None
    reasons: tuple[str, str]


def read_vote(judge: Judge, item: Item, a: Candidate, b: Candidate) -> tuple[Vote | None, str]:
    raw = judge(item, a.text, b.text)
    try:
        vote = Vote.model_validate_json(raw)
    except ValidationError:
        return None, "invalid judge output"
    return vote, vote.reason


def map_vote(vote: Vote, a: Candidate, b: Candidate) -> str | None:
    if vote.winner == "tie":
        return None
    return a.id if vote.winner == "A" else b.id


def compare(judge: Judge, item: Item, a: Candidate, b: Candidate) -> PairResult:
    if a.id == b.id:
        raise ValueError("candidate IDs must differ")
    forward, forward_reason = read_vote(judge, item, a, b)
    reverse, reverse_reason = read_vote(judge, item, b, a)
    reasons = (forward_reason, reverse_reason)
    if forward is None or reverse is None:
        return PairResult("review", None, reasons)

    first = map_vote(forward, a, b)
    second = map_vote(reverse, b, a)
    if first != second:
        return PairResult("review", None, reasons)
    if first is None:
        return PairResult("tie", None, reasons)
    return PairResult("decided", first, reasons)`;

const auditCode = `@dataclass(frozen=True)
class AuditCheck:
    name: str
    a: Candidate
    b: Candidate
    expected_status: Literal["decided", "tie"]
    expected_id: str | None


CHECKS = (
    AuditCheck("same_facts", SHORT, LONG_EQUAL, "tie", None),
    AuditCheck("unsupported_long", SHORT, LONG_WRONG, "decided", "short"),
)


def audit(judge: Judge) -> dict[str, tuple[PairResult, bool]]:
    scores = {}
    for check in CHECKS:
        result = compare(judge, ITEM, check.a, check.b)
        ok = (result.status, result.candidate_id) == (check.expected_status, check.expected_id)
        scores[check.name] = (result, ok)
    return scores`;

export const d127: Lesson = defineLesson({
  day: 127,
  titleTh: "LLM-as-a-Judge: เขียน Rubric และวัด Position กับ Verbosity Bias",
  tagline: "30 นาที · สลับตำแหน่งคำตอบและใช้คู่ควบคุมความยาวก่อนเชื่อผล Judge",
  icon: "scale",
  visual: {
    id: "llm-judge-bias" as LessonVisualId,
    title: "LLM Judge Bias — สลับตำแหน่งแล้วเทียบ winner",
    caption: "เปรียบเทียบ A/B กับ B/A และลองปรับความชอบคำตอบยาวในแผนภาพ แผนภาพใช้ตัวเลขนโยบายสมมติคนละชุดกับแลบ",
    alt: "แผนภาพจับคู่คำตอบสองลำดับ แปลงผลกลับเป็น candidate ID และตรวจด้วยคู่ความยาวต่างกัน",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ judge จำลองสามแบบที่ฉีดเป็นฟังก์ชัน Python เพื่อทดสอบ rubric และ pipeline บนเครื่อง",
  tools: ["Python 3.12", "uv", "Pydantic v2", "pytest", "JSONL"],
  bigPicture: [
    {
      node: 2,
      heading: "ข้อความมีหลายสำนวนที่ถูกตามหลักฐาน",
      body: "จาก Day 126 schema และ recall บอกได้ว่าโครงสร้างถูกและค้นเจอหลักฐาน แต่คำตอบยังอาจอ้าง 14 วันแทน 7 วัน หรือเปลี่ยนวันเริ่มนับ",
      lessonNote: "ให้ {{llm-as-a-judge}} ประเมิน claims เทียบข้อความจาก refund#1 โดยกำหนดเกณฑ์ความถูกต้องก่อนความลื่นไหล",
    },
    {
      node: 3,
      heading: "สลับลำดับเพื่อจับ position bias",
      body: "ใช้คำถามและหลักฐานเดียวกันเทียบคำตอบ A/B แล้ว B/A ตรวจว่า judge ตามตำแหน่งหรือตามสาระ",
      lessonNote: "แปลงคำตัดสินทั้งสองรอบกลับเป็น candidate ID ถ้าขัดกันหรือ parse ไม่ผ่าน ให้ส่ง review",
    },
    {
      node: 5,
      heading: "วัด verbosity bias ด้วยคู่ที่คุมข้อเท็จจริง",
      body: "คำตอบยาวอาจชนะทั้งสองลำดับ แม้มีข้อเท็จจริงเท่ากับคำตอบสั้น หรือกล่าวผิดว่าเริ่มนับหลังจ่ายเงิน",
      lessonNote: "สร้างคู่ที่ข้อเท็จจริงเท่ากันแต่ความยาวต่าง และคู่ยาวที่ขัดหลักฐาน แล้วตรวจผลกับ label ที่คนกำหนดไว้ก่อน",
    },
    {
      node: 6,
      heading: "เก็บ evidence และ rationale ไว้ปรับ rubric",
      body: "ขอ reason ที่อ้างถึงข้อความหลักฐานเพื่อตามรอยความผิดพลาด เก็บรุ่นของ rubric และ judge พร้อมผลทั้งสองลำดับ",
      lessonNote: "Day 128 จะให้คุณติดป้ายคำตอบรายชิ้นด้วย rubric ก่อนเปิดผล judge แล้ววัด agreement และ Cohen’s kappa",
    },
  ],
  objectives: [
    "เขียน rubric ที่ตรวจ {{groundedness}} กับข้อความหลักฐานและแยกจากความชอบสำนวน",
    "ตรวจ position bias ด้วย A/B, B/A และ map winner กลับสู่ candidate ID",
    "สร้าง verbosity probes สองชนิดและใช้ Pydantic/pytest ตรวจ tie, review และผลที่คงที่แต่ผิด",
  ],
  prerequisites: [
    "Day 122: ตรวจ citation และ fallback ของ Thai Knowledge RAG + Agent",
    "Day 125: สร้าง reference และ relevant chunk IDs จากนโยบายไทยสมมติ",
    "Day 126: ใช้ deterministic checks วัด JSON, tool selection และ retrieval",
  ],
  setup: {
    intro: "ใช้แลบจากสองวันก่อนหรือโฟลเดอร์ใหม่ เตรียมคำถามคืนสินค้าและ refund#1 จาก Day 125 แล้วใช้ Python fake judge เพื่อให้ทุก failure เกิดซ้ำได้",
    commands: `uv python install 3.12
uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest --version`,
    steps: [
      ["python", "ติดตั้ง Python 3.12 ผ่าน uv"],
      ["deps", "รันคำสั่งตรวจ pytest แล้วเห็นเลขเวอร์ชัน"],
      ["files", "สร้าง worked_judge.py สำหรับ Worked Example และ test_judge.py สำหรับแบบฝึก"],
    ],
    note: "วางโค้ดจาก Worked Example ทั้งสามขั้นต่อกันตามลำดับในไฟล์เดียว แล้วรัน uv run --no-project --python 3.12 --with 'pydantic>=2,<3' python worked_judge.py จากโฟลเดอร์เดียวกัน",
  },
  concepts: [
    {
      id: "rubric-grounding",
      title: "1 · แปลงความรู้สึกว่าคำตอบดีเป็น rubric ที่ชี้หลักฐานได้",
      paragraphs: [
        "สำหรับคำถามเรื่องระยะเวลาและจุดเริ่มนับ ให้เกณฑ์ผ่านเมื่อระบุ 7 วันและเริ่มนับจากวันที่รับสินค้าตาม refund#1 หากตอบขัดหลักฐานหรือแต่งเงื่อนไขเพิ่มให้ fail หากข้อความเหมือนกันแต่ภาษายาวสั้นต่างกันให้ tie ในงานเปรียบเทียบคู่นี้",
        "เวลาใช้โมเดลจริงให้ส่ง rubric เป็นคำสั่งคงที่ แยก query, retrieved context และ candidate เป็นข้อมูล ให้ judge อ้างช่วงข้อความที่ใช้ตัดสิน และตรวจ schema ตอนรับผล ระบุว่า evidence ไม่พอควรส่งให้คนตรวจ หาก premise ของคำถามไม่ตรงกับ evidence",
      ],
      analogy: "เหมือน code review ที่มี acceptance criteria อยู่ใน issue ผู้ตรวจชี้บรรทัดที่ผิดและให้เหตุผลที่ตรวจซ้ำได้",
      bullets: [
        "สำหรับ pairwise ให้ตัดสิน A, B หรือ tie และให้ reason สั้น",
        "ใช้ evidence ที่ระบบเห็นจริงเพื่อวัด faithfulness; reference ช่วยบอกข้อเท็จจริงที่ควรตอบ",
        "ซ่อนชื่อโมเดลและชื่อ build ใน prompt เพื่อให้เปรียบเทียบตามเนื้อหาที่แสดง",
      ],
      code: {
        language: "python",
        filename: "judge_input.py",
        code: `import json

rubric = [
    "ใช้เฉพาะข้อความหลักฐานที่ให้มา",
    "ต้องตอบว่า 7 วันและนับจากวันที่รับสินค้า",
    "ถ้าทั้งสองถูกครบ ให้ tie โดยไม่ให้แต้มกับความยาว",
]
payload = {
    "question": "ขอคืนได้เมื่อไร",
    "evidence": "[refund#1] แจ้งคืนได้ภายใน 7 วันนับจากวันที่รับสินค้า",
    "A": "7 วันจากวันที่รับสินค้า",
    "B": "14 วันจากวันชำระเงิน",
}
print(json.dumps({"rubric": rubric, "data": payload}, ensure_ascii=False))`,
      },
      whyTitle: "Why this matters — citation ที่หน้าตาถูกอาจอ้างเนื้อหาผิด",
      whyParagraphs: [
        "คำตอบ 14 วันอาจแนบ refund#1 ได้สมบูรณ์ตาม schema แต่ตัวเลขและจุดเริ่มนับขัดหลักฐาน Judge ต้องชี้ mismatch ที่ข้อความ ไม่ใช่ให้ผ่านเพราะเห็นป้ายอ้างอิง",
      ],
    },
    {
      id: "position-swap",
      title: "2 · สลับลำดับแล้วเทียบในพิกัดเดียวกัน",
      paragraphs: [
        "รอบแรกส่ง short เป็น A และ long เป็น B รอบสองส่ง long เป็น A และ short เป็น B ถ้าคำตอบสั้นชนะจริง judge จะคืน A แล้ว B เมื่อ map กลับ ทั้งสองรอบหมายถึง short",
        "ถ้า judge เลือก A ทั้งสองรอบ จะได้คนละ candidate ให้ตีเป็น review แม้รูปแบบ output ถูกต้อง ใช้ tie เมื่อทั้งสองรอบตอบ tie ถ้ารอบหนึ่ง tie แต่อีกรอบมีผู้ชนะให้ review",
      ],
      analogy: "เหมือนสุ่มลำดับตัวเลือกในข้อสอบ แล้วให้ระบบตรวจด้วยรหัสตัวเลือกเดิมแทนตำแหน่งที่เห็นบนจอ",
      bullets: [
        "คง rubric, evidence และคำตอบเท่าเดิมทั้งสองรอบ",
        "บันทึก invalid response และ disagreement แยกในผลจริง",
        "การเรียกสองรอบเพิ่มค่าใช้จ่าย ให้คำนวณงบก่อนนำไปใช้ทั้ง suite",
      ],
      code: {
        language: "python",
        filename: "position_mapping.py",
        code: `def stable_winner(forward: str, reverse: str) -> str:
    direct = {"A": "short", "B": "long", "tie": "tie"}
    flipped = {"A": "long", "B": "short", "tie": "tie"}
    if direct[forward] != flipped[reverse]:
        return "review"
    return direct[forward]


print(stable_winner("A", "B"))  # short
print(stable_winner("A", "A"))  # review
print(stable_winner("tie", "A"))  # review`,
      },
      whyTitle: "Why this matters — สัญญาณจากลำดับมองไม่เห็นในการรันรอบเดียว",
      whyParagraphs: [
        "ถ้ารายงานเลือกผู้ชนะจากรอบแรกอย่างเดียว A อาจดูชนะบ่อยเพราะทุกครั้งวางรุ่นใหม่ไว้ตำแหน่งแรก การสลับช่วยตรวจผลที่ขึ้นกับลำดับ แต่ยังต้องวัดเทียบคน",
      ],
    },
    {
      id: "verbosity-controls",
      title: "3 · ทดสอบความชอบคำตอบยาวด้วยคู่ควบคุม",
      paragraphs: [
        "คู่แรก short กับ long_equal มีตัวเลขและจุดเริ่มนับเดียวกัน ส่วนที่เพิ่มมีคำเกริ่นและคำขอบคุณ ผลตาม rubric นี้ควร tie คู่ที่สอง short กับ long_wrong ยาวกว่าแต่บอก 14 วันนับจากชำระเงิน จึงควรให้ short ชนะ",
        "ห้ามตัดทอนคำตอบจริงเพื่อบังคับให้เท่ากัน เพราะอาจตัดข้อยกเว้นหรือเงื่อนไขสำคัญออกไป ใช้คู่ที่คนตรวจแล้วและเก็บผลเป็น probe ถ้า judge ชอบคำตอบยาวทุกครั้งให้แก้ rubric และทดสอบกับคู่ใหม่",
      ],
      analogy: "เหมือนทดสอบ UI ด้วยสองหน้าที่ให้ข้อมูลเท่ากัน แต่เปลี่ยนขนาดตัวอักษรเท่านั้น เพื่อดูว่าผู้ใช้เลือกตามเนื้อหาหรือความเด่น",
      bullets: [
        "ความยาวในตัวอย่างวัดด้วยจำนวนอักขระเพื่อสร้าง fake ที่มีอคติชัดเจน",
        "ให้รางวัลกับความครบของข้อเท็จจริงที่โจทย์ต้องการ",
        "รายงานผล same-facts กับ unsupported-long แยกกัน แล้วเปิดตัวอย่างที่ judge ตัดสินผิด",
      ],
      code: {
        language: "python",
        filename: "length_probe.py",
        code: `pairs = [
    ("same_facts", "7 วันหลังรับของ", "ตามนโยบายร้าน แจ้งคืนได้ใน 7 วันหลังรับของ", "tie"),
    ("unsupported_long", "7 วันหลังรับของ", "ตามนโยบายร้าน แจ้งคืนภายใน 14 วันหลังชำระเงิน", "short"),
]
for name, short, long, expected in pairs:
    fake = "long" if len(long) > len(short) else "short"
    print(f"{name}: {fake=}, {expected=}, correct={fake == expected}")`,
      },
      whyTitle: "Why this matters — ความคงที่กับความถูกต้องวัดต่างกัน",
      whyParagraphs: [
        "verbosity fake อาจชนะทั้งสองลำดับโดยไม่มี disagreement เลย คู่ควบคุมที่มี label จากคนช่วยให้จับกรณีนี้ได้ ก่อนพึ่ง judge กับเคสจริงให้วัด agreement ตาม Day 128",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge — Judge เป็น dependency ที่ทดสอบแยกได้",
      body: [
        "ส่งฟังก์ชัน judge เข้า compare แล้วใช้ fake ที่ทำซ้ำได้เพื่อเทสต์ wrapper กับ JSON contract เหมือนแทนบริการ upstream ด้วย stub",
      ],
      table: [
        ["Dependency injection", "Callable ที่คืน JSON vote"],
        ["A/B order control", "สลับ input แล้วแปลงกลับเป็นรหัสคงที่"],
        ["Response schema", "Pydantic Vote + strict validation"],
        ["Manual review queue", "invalid vote หรือผลข้ามลำดับไม่ตรงกัน"],
      ],
    },
    student: {
      title: "First-Year Note — ลำดับไม่ใช่ตัวตนของคำตอบ",
      body: [
        "วางกระดาษ short ทางซ้ายและ long ทางขวา รอบสองสลับด้าน ถ้าผู้ตรวจชี้ซ้ายทั้งคู่จะชี้คนละแผ่น",
        "ลองขีดเส้นใต้ตัวเลขและวันเริ่มนับในคำตอบคู่ที่ยาวต่างกัน แล้วตัดสินจากข้อความที่ขีด เทียบผลกับตอนอ่านโดยไม่ขีด",
      ],
    },
  },
  workedExample: {
    intro: "ใช้ policy คืนสินค้าเดิมและคำตอบสามเวอร์ชัน ทดสอบด้วย judge จำลองที่ลำเอียงตามตำแหน่ง ตามความยาว และ fake ที่ใช้ human labels ของ fixture นี้",
    steps: [
      {
        title: "1 · นิยามคำตอบและ Judge API",
        explain: "กำหนด vote schema และสร้าง fake ที่คืน JSON ใน fixture แยกการเลือกผู้ชนะจากตัว orchestrator",
        code: {
          language: "python",
          filename: "worked_judge.py",
          code: judgeFixtureCode,
        },
        output: "3 คำตอบ × 3 พฤติกรรมของ judge",
      },
      {
        title: "2 · รวมผลจากสองลำดับ",
        explain: "map A/B กลับเป็น ID แยก tie ที่สองรอบเห็นตรงกันจาก review ที่ผลขัดกันหรือ JSON เสีย เก็บ reason ทั้งคู่เพื่อเปิดดูย้อนหลัง",
        code: {
          language: "python",
          filename: "worked_judge.py",
          code: pairCode,
        },
        output: "PairResult(status, candidate_id, reasons)",
      },
      {
        title: "3 · รันสองคู่ควบคุม",
        explain: "เปรียบเทียบผลกับ expected status และ candidate ID ของแต่ละคู่ ตัวอย่าง rubric fake ใช้ labels ที่กำหนดไว้ จึงแสดงตรรกะของเครื่องมือเท่านั้น",
        code: {
          language: "python",
          filename: "worked_judge.py",
          code: auditCode + `


if __name__ == "__main__":
    for name, judge in (
        ("position", position_fake),
        ("verbosity", verbosity_fake),
        ("rubric", rubric_fake),
    ):
        for case, (result, ok) in audit(judge).items():
            print(f"{name}/{case}: {result.status} {result.candidate_id} ok={ok}")`,
        },
        output: `position/same_facts: review None ok=False
position/unsupported_long: review None ok=False
verbosity/same_facts: decided long_equal ok=False
verbosity/unsupported_long: decided long_wrong ok=False
rubric/same_facts: tie None ok=True
rubric/unsupported_long: decided short ok=True`,
      },
    ],
    gotcha: "ถ้า judge ตอบ tie ทั้งสองรอบให้เก็บสถานะ tie แยกจาก review เพราะ review หมายถึงระบบตัดสินเองไม่ได้และยังรอคนตรวจ",
  },
  practice: {
    intro: "ทำ wrapper แบบสลับคำตอบและชุด bias probes ให้เสร็จใน 12 นาที แล้วลองเพิ่ม fake ที่คืน winner นอก schema เพื่อทดสอบว่าระบบส่งเข้า review จริง",
    requirements: [
      "รัน judge สองรอบโดยสลับเฉพาะข้อความ A/B และตรวจ Vote ด้วย Pydantic",
      "map ผู้ชนะกลับเป็น ID เดิมแล้วแยก decided, tie และ review",
      "ตรวจคู่ same_facts และ unsupported_long กับผลที่คนกำหนดไว้",
      "เขียน pytest ครอบคลุม position bias, verbosity bias, tie และ JSON ที่ผิดสัญญา",
    ],
    starter: {
      language: "python",
      filename: "test_judge.py",
      code: `import pytest

from worked_judge import ITEM, LONG_EQUAL, SHORT, Candidate, Item, Judge, PairResult, Vote, position_fake


def map_vote(vote: Vote, a: Candidate, b: Candidate) -> str | None:
    # TODO: แปลง A/B เป็น ID ของ candidate จริง แล้วคืน None สำหรับ tie
    raise NotImplementedError


def compare(judge: Judge, item: Item, a: Candidate, b: Candidate) -> PairResult:
    # TODO: validate ผลทั้งสองลำดับและหาว่าควรตัดสิน เสมอ หรือ review
    raise NotImplementedError


def test_position_fake_requires_review() -> None:
    result = compare(position_fake, ITEM, SHORT, LONG_EQUAL)
    assert result.status == "review"

# TODO: เพิ่ม audit และเทสต์กรณีความยาวลำเอียง ผลเสมอ และ output ผิด schema`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_judge.py",
    },
    selfCheck: [
      "always-A ให้ review เพราะ ID ผู้ชนะจากสองลำดับต่างกัน",
      "always-long มีผู้ชนะคงที่แต่แพ้ probe ทั้งสองคู่",
      "สองเสียงตอบ tie ได้ tie ส่วนเสียงไม่ตรงหรือ invalid vote ได้ review",
    ],
    acceptance: "pytest ผ่าน และอธิบายได้ว่าทำไมต้องตรวจทั้ง order consistency และความถูกต้องของ probe",
    hints: [
      {
        body: "เขียนฟังก์ชัน map_vote ที่รับ candidate ตามลำดับที่ส่งจริง แล้วค่อยเทียบสองผล",
      },
      {
        body: "ให้ audit เทียบคู่ของ status กับ candidate_id แทนการนับแค่ decided; ใช้ Pydantic ValidationError เพื่อจัด invalid JSON เป็น review",
      },
      {
        body: "แทนเนื้อหาทั้งไฟล์ test_judge.py ด้วยเฉลยด้านล่างแล้วรัน pytest จากโฟลเดอร์เดียวกัน",
        code: {
          language: "python",
          filename: "test_judge.py",
          code: [judgeFixtureCode, pairCode, auditCode, `import pytest


@pytest.mark.parametrize("other", [LONG_EQUAL, LONG_WRONG])
def test_fixed_position_requires_review(other) -> None:
    result = compare(position_fake, ITEM, SHORT, other)
    assert result.status == "review"
    assert result.candidate_id is None


def test_stable_winner_can_still_be_biased() -> None:
    scores = audit(verbosity_fake)
    long_result, long_ok = scores["unsupported_long"]
    assert long_result.status == "decided"
    assert long_result.candidate_id == LONG_WRONG.id
    assert long_ok is False
    assert scores["same_facts"][1] is False


def test_rubric_fixtures() -> None:
    scores = audit(rubric_fake)
    assert scores["same_facts"][0].status == "tie"
    assert scores["unsupported_long"][0].candidate_id == SHORT.id
    assert all(ok for _, ok in scores.values())


def test_invalid_json_requires_review() -> None:
    def invalid(item: Item, a: str, b: str) -> str:
        return '{"winner":"C","reason":"outside schema"}'

    row = compare(invalid, ITEM, SHORT, LONG_EQUAL)
    assert row.status == "review"
    assert row.reasons == ("invalid judge output", "invalid judge output")


def test_tie_and_preference_disagree() -> None:
    def mixed(item: Item, a: str, b: str) -> str:
        return vote_json("tie" if a == SHORT.text else "B", "mixed fixture")

    assert compare(mixed, ITEM, SHORT, LONG_EQUAL).status == "review"


def test_repeat_candidate_id_rejected() -> None:
    with pytest.raises(ValueError, match="IDs must differ"):
        compare(rubric_fake, ITEM, SHORT, SHORT)`].join("\n\n\n"),
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_judge.py",
    },
  },
  mistakes: [
    {
      title: "เทียบตัวอักษร A/B ตรง ๆ",
      symptom: "เห็น A สองครั้งแล้วสรุปว่าเสถียร",
      fix: "แปลงตำแหน่งเป็น candidate ID ในแต่ละรอบก่อนเทียบ",
    },
    {
      title: "เท่ากันทุกครั้งจึงถือว่าถูก",
      symptom: "verbosity fake ให้ long_wrong ชนะทั้งสองรอบ",
      fix: "เพิ่ม probe ที่คนติด label ไว้และวัด agreement",
    },
    {
      title: "บังคับให้เลือกผู้ชนะทุกคู่",
      symptom: "คู่ที่ข้อเท็จจริงเท่ากันถูกบิดเป็น win/loss",
      fix: "เปิด tie และกันเคส invalid/ผลขัดกันไว้ใน review",
    },
    {
      title: "ใช้ชื่อโมเดลหรือ build ใน prompt",
      symptom: "judge อาจให้คะแนนตามชื่อรุ่นหรือผู้สร้าง",
      fix: "ส่งข้อความโดยใช้ตำแหน่ง A/B เท่านั้น แล้ว map ด้วย ID ภายนอก prompt",
    },
  ],
  quiz: {
    intro: "ลองตอบทั้ง 4 ข้อก่อนเปิดเฉลย แล้วจดข้อที่ยังอธิบายด้วยตัวเองไม่ได้ลง Error Log",
    questions: [
      mc(
        "d127-q-1",
        "A/B แล้ว B/A ได้ A ทั้งสองรอบ แปลว่าอะไร?",
        [
          ["คำตอบแรกชนะทั้งคู่", "ตัวอักษร A หมายถึงคนละคำตอบในสองรอบ"],
          ["ควร review เพราะผู้ชนะเปลี่ยนตามตำแหน่ง", "ต้อง map ID แล้วจะเห็นผลขัดกัน"],
          ["ได้ tie", "ผลโหวตไม่ได้บอกเสมอ"],
          ["ใช้ผลรอบสองเสมอ", "ยังไม่มีเหตุผลเลือกรอบใดรอบหนึ่ง"],
        ],
        "B",
        "เทียบตัวตนของคำตอบหลังสลับลำดับ สองเสียงเลือกคนละคำตอบจึงควรส่งเข้าคิวตรวจ",
        "ทำไมต้อง map กลับสู่ ID?",
        "ตำแหน่ง A/B เปลี่ยนเมื่อสลับ แต่ ID ของคำตอบคงเดิม",
      ),
      mc(
        "d127-q-2",
        "long_wrong ชนะทั้งสองรอบแม้ขัดหลักฐาน พบอาการใด?",
        [
          ["ตำแหน่งคงที่", "คำตอบชนะทั้งสองตำแหน่ง"],
          ["JSON invalid", "โครงสร้างอาจถูกต้อง"],
          ["golden label ใช้ไม่ได้เสมอ", "ต้องย้อนดู evidence"],
          ["ความคงที่ยังอยู่ร่วมกับ verbosity bias ได้", "judge อาจให้คะแนนความยาวเหนือข้อเท็จจริง"],
        ],
        "D",
        "ผลคงที่ไม่รับประกันความถูกต้อง ใช้คู่ควบคุมความยาวและ human label ตรวจความคลาดเคลื่อน",
        "สลับลำดับจับอคติทุกแบบหรือไม่?",
        "ยังต้องใช้คู่ probe เพื่อจับอคติที่คงอยู่แม้สลับลำดับ",
      ),
      mc(
        "d127-q-3",
        "คู่สั้นยาวที่มีข้อเท็จจริงครบเหมือนกันควรให้ผลใดภายใต้ rubric นี้?",
        [
          ["tie", "ทั้งสองตอบตามหลักฐานและครบเท่ากัน"],
          ["เลือกยาวกว่า", "ไม่ได้เพิ่มข้อเท็จจริงที่โจทย์ถาม"],
          ["เลือกสั้นกว่าในทุกงาน", "เกณฑ์นี้ดูความถูกและความครบ"],
          ["review ทันที", "สองคำตอบประเมินได้ปกติ"],
        ],
        "A",
        "กำหนด tie ไว้ชัดเจนเพื่อวัดว่า judge ให้คะแนนตามสาระหรือความยาว",
        "สร้าง same-facts probe อย่างไร?",
        "คงข้อเท็จจริงและคำถาม แล้วเพิ่มเฉพาะถ้อยคำที่ไม่เพิ่มสาระ",
      ),
      mc(
        "d127-q-4",
        "ถ้า JSON จาก judge มี winner เป็น C ควรทำอย่างไร?",
        [
          ["map C เป็น B", "กฎนี้ไม่มีหลักฐาน"],
          ["นับเป็น tie", "tie ต้องมาจากผลที่ valid"],
          ["แจ้ง invalid และส่ง review", "รักษาความหมายของคะแนน"],
          ["นับเป็น A เพื่อกัน pipeline พัง", "ทำให้ผลเอนเอียงเพิ่ม"],
        ],
        "C",
        "เก็บเหตุผล validation failure แล้วให้คนตรวจ ค่าที่ผิด schema ตีความเป็นผู้ชนะหรือเสมอไม่ได้",
        "invalid vote กับ tie ต่างกันอย่างไร?",
        "invalid ไม่มี verdict ที่เชื่อถือได้ ส่วน tie เป็นคำตัดสินที่อยู่ในสัญญา",
      ),
    ],
  },
  takeaways: [
    "ใช้ rubric ที่ระบุข้อความหลักฐานและข้อเท็จจริงที่ต้องตรวจ",
    "สลับ A/B กับ B/A แล้ว map ผู้ชนะเป็น candidate ID",
    "ใช้คู่สั้นยาวที่เท่ากันและคู่ยาวที่กล่าวผิดเพื่อตรวจ verbosity bias",
    "Day 128 วัดว่า judge สอดคล้องกับป้ายที่คนติดเองแค่ไหน",
  ],
  reviewCards: [
    rc(
      "d127-rc-1",
      "เกณฑ์คืน tie ของ compare คืออะไร?",
      "สองลำดับให้ verdict ที่ valid และเป็น tie ทั้งคู่",
    ),
    rc(
      "d127-rc-2",
      "จับ verbosity bias ด้วยคู่แบบไหน?",
      "คู่สาระเท่ากันแต่ความยาวต่าง และคู่ยาวที่จงใจขัดหลักฐาน",
    ),
    rc(
      "d127-rc-3",
      "ทำไมเก็บ reason ทั้งสองลำดับ?",
      "ย้อนตรวจว่าผลต่างเกิดจากการตีความหลักฐานหรือจากข้อมูลและรูปแบบผลลัพธ์",
    ),
  ],
  sources: [
    {
      label: "Zheng et al. — Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena",
      href: "https://arxiv.org/abs/2306.05685",
    },
    {
      label: "Dubois et al. — Length-Controlled AlpacaEval",
      href: "https://arxiv.org/abs/2404.04475",
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
  glossary: ["llm-as-a-judge", "groundedness", "golden-dataset", "pydantic", "pytest", "fixture", "mocking"],
});
