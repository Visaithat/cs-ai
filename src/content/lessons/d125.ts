import type { Lesson, LessonVisualId } from "../types";
import { defineLesson, mc, rc } from "./builder";

/** Day 125 · Phase 5 / Block B32 */
const goldenCaseCode = `from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator


Route = Literal["rag", "lookup_order", "abstain"]
Slice = Literal["policy", "code_switch", "multi_evidence", "unanswerable", "tool"]
Split = Literal["dev", "holdout"]


class GoldenCase(BaseModel):
    model_config = ConfigDict(
        strict=True, extra="forbid", str_strip_whitespace=True
    )

    case_id: str = Field(pattern=r"^TH-[0-9]{2}-[1-4]$")
    group_id: str = Field(min_length=1)
    corpus_version: Literal["thai-kb-v1"]
    split: Split
    slice: Slice
    query: str = Field(min_length=1)
    expected_route: Route
    relevant_chunk_ids: list[str]
    reference: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_expectations(self) -> Self:
        chunks = self.relevant_chunk_ids
        if any(not chunk.strip() for chunk in chunks):
            raise ValueError("blank chunk ID")
        if len(chunks) != len(set(chunks)):
            raise ValueError("duplicate chunk ID")
        if self.expected_route == "rag" and not chunks:
            raise ValueError("RAG cases need evidence")
        if self.expected_route != "rag" and chunks:
            raise ValueError("non-RAG cases must have no retrieval labels")
        if self.slice == "multi_evidence" and len(chunks) < 2:
            raise ValueError("multi-evidence cases need at least two chunks")
        if self.slice == "unanswerable" and self.expected_route != "abstain":
            raise ValueError("unanswerable cases must abstain")
        if self.slice == "tool" and self.expected_route != "lookup_order":
            raise ValueError("tool cases must route to lookup_order")
        return self`;

const intentBankCode = `from collections import Counter
from dataclasses import dataclass


@dataclass(frozen=True)
class Intent:
    group: str
    split: Split
    slice: Slice
    route: Route
    chunks: tuple[str, ...]
    reference: str
    queries: tuple[str, str, str, str]


# ตัวอย่างทั้งเอกสาร นโยบาย และเลขคำสั่งซื้อเป็นสมมติ
INTENTS = (
    Intent("refund-window", "dev", "policy", "rag", ("refund#1",),
           "แจ้งคืนได้ภายใน 7 วันนับจากวันที่รับสินค้า",
           ("คืนสินค้าได้ในกี่วัน", "รับของแล้วมีเวลาแจ้งคืนเท่าไร",
            "ขอคืนของต้องแจ้งภายในกี่วัน", "ระยะเวลาแจ้งคืนเริ่มนับเมื่อไร")),
    Intent("warranty-start", "holdout", "policy", "rag", ("warranty#1",),
           "ประกันเริ่มนับจากวันที่ซื้อในใบเสร็จ",
           ("ประกันเริ่มวันไหน", "เริ่มนับประกันจากวันรับของไหม",
            "ดูวันเริ่มประกันจากอะไร", "วันในใบเสร็จใช้เริ่มประกันหรือเปล่า")),
    Intent("delivery-fee", "dev", "code_switch", "rag", ("shipping#1",),
           "จัดส่งมาตรฐานฟรีเมื่อยอดถึง 500 บาท",
           ("Standard shipping ฟรีที่ยอดเท่าไหร่", "ขั้นต่ำ free delivery กี่บาท",
            "ยอด 500 ได้ free shipping ไหม", "Standard delivery มีขั้นต่ำส่งฟรีไหม")),
    Intent("pickup-hours", "holdout", "code_switch", "rag", ("pickup#1",),
           "รับสินค้าที่จุด pickup ได้เวลา 10:00–18:00",
           ("Pickup point เปิดกี่โมง", "ขอ opening hours จุดรับของ",
            "Pickup ได้ตั้งแต่กี่โมงถึงกี่โมง", "ช่วงเวลา click and collect คือ")),
    Intent("return-label", "dev", "multi_evidence", "rag",
           ("refund#1", "shipping#2"),
           "แจ้งคืนภายใน 7 วัน และแนบใบส่งคืนที่กล่อง",
           ("ขอคืนในกี่วันและต้องแปะอะไรที่กล่อง", "คืนสินค้าเมื่อไรและติดใบอะไร",
            "เวลาแจ้งคืนและเอกสารติดกล่องคืออะไร", "ต้องแจ้งคืนกี่วันและใช้ return label ไหม")),
    Intent("warranty-claim", "holdout", "multi_evidence", "rag",
           ("warranty#1", "claim#1"),
           "ประกันนับจากวันที่ซื้อในใบเสร็จ และยื่นเคลมด้วยใบเสร็จ",
           ("ประกันเริ่มเมื่อไรและใช้หลักฐานอะไรเคลม", "วันเริ่มประกันกับเอกสารเคลมคือ",
            "ขอวิธีนับประกันและหลักฐานยื่นเคลม", "วันเริ่มกับเอกสารเคลมดูจากอะไร")),
    Intent("holiday-hours", "dev", "unanswerable", "abstain", (),
           "ไม่พบข้อมูลเวลาเปิดในวันหยุดพิเศษ",
           ("จุดรับของเปิดวันสงกรานต์ไหม", "วันหยุดปีใหม่จุดรับของเปิดกี่โมง",
            "วันหยุดพิเศษจุดรับของปิดไหม", "มีตารางเปิดวันหยุดนักขัตฤกษ์ไหม")),
    Intent("repair-abroad", "holdout", "unanswerable", "abstain", (),
           "ไม่พบข้อมูลศูนย์บริการต่างประเทศ",
           ("มีศูนย์ซ่อมที่เวียงจันทน์ไหม", "ขอศูนย์เคลมที่สิงคโปร์",
            "ต่างประเทศส่งซ่อมที่ไหน", "มีจุดรับเคลมนอกไทยหรือเปล่า")),
    Intent("order-demo-001", "dev", "tool", "lookup_order", (),
           "เรียก lookup_order สำหรับ DEMO-001",
           ("ดูสถานะออเดอร์ DEMO-001", "DEMO-001 ส่งหรือยัง",
            "ช่วยเช็ก tracking ของ DEMO-001", "ขอตำแหน่งล่าสุดของ DEMO-001")),
    Intent("order-demo-002", "holdout", "tool", "lookup_order", (),
           "เรียก lookup_order สำหรับ DEMO-002",
           ("ถึงไหนแล้ว DEMO-002", "เช็กคำสั่งซื้อ DEMO-002 ให้หน่อย",
            "ขอ shipping status DEMO-002", "สถานะจัดส่งของ DEMO-002 คืออะไร")),
)


def build_cases() -> list[GoldenCase]:
    return [
        GoldenCase(
            case_id=f"TH-{index:02d}-{variant}",
            group_id=intent.group,
            corpus_version="thai-kb-v1",
            split=intent.split,
            slice=intent.slice,
            query=query,
            expected_route=intent.route,
            relevant_chunk_ids=list(intent.chunks),
            reference=intent.reference,
        )
        for index, intent in enumerate(INTENTS, start=1)
        for variant, query in enumerate(intent.queries, start=1)
    ]`;

const jsonlCode = `from pathlib import Path


def validate_suite(cases: list[GoldenCase]) -> None:
    if not 30 <= len(cases) <= 50:
        raise ValueError("expected 30–50 cases")
    if len({case.case_id for case in cases}) != len(cases):
        raise ValueError("duplicate case ID")
    normalized_queries = {" ".join(case.query.casefold().split()) for case in cases}
    if len(normalized_queries) != len(cases):
        raise ValueError("duplicate query")
    seen_split: dict[str, Split] = {}
    slice_counts = Counter((case.split, case.slice) for case in cases)
    for case in cases:
        if seen_split.setdefault(case.group_id, case.split) != case.split:
            raise ValueError(f"group crosses splits: {case.group_id}")
    slices = ("policy", "code_switch", "multi_evidence", "unanswerable", "tool")
    for split in ("dev", "holdout"):
        for name in slices:
            if slice_counts[split, name] == 0:
                raise ValueError(f"missing coverage: {split}/{name}")


def save_cases(path: Path, cases: list[GoldenCase]) -> None:
    validate_suite(cases)
    with path.open("w", encoding="utf-8", newline="\\n") as output:
        for case in cases:
            output.write(case.model_dump_json() + "\\n")


def load_cases(path: Path) -> list[GoldenCase]:
    with path.open(encoding="utf-8") as source:
        cases = []
        for lineno, line in enumerate(source, start=1):
            try:
                cases.append(GoldenCase.model_validate_json(line))
            except ValueError as error:
                raise ValueError(f"{path.name}:{lineno}: invalid case") from error
    validate_suite(cases)
    return cases`;

export const d125: Lesson = defineLesson({
  day: 125,
  titleTh: "เปิด Phase 5 ด้วย Eval-Driven Development และ Golden Dataset ภาษาไทย",
  tagline: "30 นาที · เปลี่ยนเคสจากระบบ v0.4.0 เป็นชุดประเมิน 40 ข้อที่ตรวจซ้ำได้",
  icon: "database",
  visual: {
    id: "golden-dataset-evals" as LessonVisualId,
    title: "Golden Dataset — จากคำถามจริงสู่เกณฑ์วัดผล",
    caption: "ตามลูกศรจากคำถามภาษาไทยไปยัง labels, JSONL และรายงานผล แล้วดูว่ากลุ่มเคสไหนยังขาด",
    alt: "แผนภาพคำถามและหลักฐานจากคลังความรู้เข้าสู่ชุดข้อมูล dev และ holdout ก่อนส่งเข้าเครื่องตรวจ",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้คลังนโยบายและรหัสออเดอร์สมมติ สร้างชุดข้อมูลและทดสอบผ่านไฟล์ในเครื่อง",
  tools: ["Python 3.12", "uv", "Pydantic v2", "pytest", "JSONL"],
  bigPicture: [
    {
      node: 0,
      heading: "จากเดโมสู่ข้อกำหนดที่ตรวจซ้ำได้",
      body: "Day 121 ต่อ Hybrid RAG, MCP และ LangGraph เข้าด้วยกัน Day 122 ตรวจ citation และ fallback Day 123 ใช้ 15 คำถามไทยทดสอบ และ Day 124 ปิดงานด้วยแท็ก v0.4.0 ระบบตอบและเรียกเครื่องมือตาม flow ได้แล้ว",
      lessonNote: "ก่อนแก้ prompt หรือ retriever ครั้งต่อไป ให้เก็บคำถามที่เคยพังไว้พร้อมผลที่ควรได้ เช่น ขอคืนสินค้านับวันจากวันรับของ และถามสถานะออเดอร์ต้องไปที่ tool",
    },
    {
      node: 1,
      heading: "ผูกคำถามกับหลักฐานและเวอร์ชัน",
      body: "{{golden-dataset}} เป็นชุดเคสที่คนตรวจหลักฐานและผลที่คาดไว้กับ corpus เวอร์ชันที่ระบุ คำถามหนึ่งข้อบอก route อ้างอิง คำตอบอ้างอิง และ ID ของ chunk ที่เกี่ยวข้องถ้ามี",
      lessonNote: "จัด 40 เคสเป็น 10 กลุ่ม intent กลุ่มละ 4 สำนวน ครอบคลุมนโยบายไทย คำถามปนอังกฤษ หลายหลักฐาน ข้อมูลไม่มี และเรียก tool",
    },
    {
      node: 3,
      heading: "เริ่มจากเคสที่พลาดแล้ววัดกับ baseline",
      body: "ถ้าแอปนับวันคืนสินค้าจากวันจ่ายเงิน ให้ตรึงคำถาม หลักฐาน และคำตอบที่ถูกก่อน แยก dev สำหรับแก้ระบบจาก holdout สำหรับวัดหลังหยุดปรับ",
      lessonNote: "เก็บผลก่อนและหลังโดยใช้ dataset และ corpus เดียวกัน รายงานทั้งภาพรวมและราย slice เพื่อเห็นว่าแก้เรื่องหนึ่งแล้วกระทบอีกเรื่องหรือเปล่า",
    },
    {
      node: 6,
      heading: "วางรากให้ Evaluated & Guarded AI Microservice",
      body: "Phase 5 จะต่อ deterministic metrics และ judge ไปยัง CI, tracing, FastAPI, Docker และ guardrails ก่อนตรวจรับ v0.5.0 ที่ Day 156",
      lessonNote: "ความผิดพลาดที่พบจากการใช้งานจะกลายเป็นเคส regression ที่คนตรวจแล้ว ใช้รูปแบบนี้ต่อใน Phase 6 เมื่อสร้างชุดประเมินสำหรับผู้ช่วยองค์กร",
    },
  ],
  objectives: [
    "สร้างชุด {{golden-dataset}} ภาษาไทยขนาด 30–50 เคสที่อ้างอิง corpus และระบุผลที่คาดไว้ได้",
    "แยก dev และ holdout เป็นกลุ่ม intent พร้อมตรวจ coverage ของทั้งห้า slice",
    "ใช้ {{pydantic}} และ {{pytest}} ตรวจ JSONL, case ID และ label ที่ขัดกันก่อนรัน eval",
  ],
  prerequisites: [
    "Day 121–122: รู้จักเส้นทาง RAG, MCP tool, citation และ fallback ของระบบที่จะประเมิน",
    "Day 123–124: มีตัวอย่างคำถามไทยและรู้เกณฑ์รับมอบ v0.4.0",
    "Day 1 และ Day 5: ใช้ Pydantic v2 และรู้รูปแบบ JSONL จากงานอ่านข้อมูล",
  ],
  setup: {
    intro: "ใช้โฟลเดอร์แลบว่าง ติดตั้ง Python 3.12 แล้วให้ uv โหลด Pydantic v2 กับ pytest แบบชั่วคราว ตัวอย่างจะสร้างไฟล์ golden.jsonl เมื่อรันขั้นสุดท้าย หากมีไฟล์ชื่อนี้ไว้ทำงานอยู่ ให้แยกโฟลเดอร์ก่อนรัน",
    commands: `uv python install 3.12
uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest --version`,
    steps: [
      ["python", "ติดตั้ง Python 3.12 ผ่าน uv"],
      ["deps", "รันคำสั่งตรวจ pytest แล้วเห็นเลขเวอร์ชัน"],
      ["files", "สร้าง worked_golden.py สำหรับ Worked Example และ test_golden.py สำหรับแบบฝึก"],
    ],
    note: "วางโค้ดจาก Worked Example ทั้งสามขั้นต่อกันตามลำดับในไฟล์เดียว แล้วรัน uv run --no-project --python 3.12 --with 'pydantic>=2,<3' python worked_golden.py จากโฟลเดอร์เดียวกัน",
  },
  concepts: [
    {
      id: "eval-driven",
      title: "1 · ให้ failure ที่สังเกตได้เป็นจุดเริ่มของการแก้ระบบ",
      paragraphs: [
        "เริ่มจากพฤติกรรมหนึ่งที่วัดได้ เช่น ผู้ใช้ถามคืนสินค้าต้องเปิดนโยบายคืนของและตอบ 7 วันนับจากวันรับสินค้า จด corpus version และเก็บผลจาก v0.4.0 ไว้ก่อนทดลองเปลี่ยน prompt",
        "ลำดับการทำงานคือเขียนเคสให้ fail เมื่อเจอบั๊ก แก้กลไกที่เกี่ยวข้อง รัน dev suite ทั้งชุด และวัดรอบ release ด้วย holdout ฉบับเดิม สำหรับคำตอบที่มีหลายสำนวน เก็บ reference เป็นข้อเท็จจริงสำหรับ rubric",
      ],
      analogy: "เหมือนเขียน acceptance criteria ให้ user story นักพัฒนากับคนตรวจรับเห็นผลลัพธ์ที่ต้องการตรงกัน",
      bullets: [
        "ด้าน routing ตรวจ route ที่ได้เทียบกับเส้นทางที่ตั้งใจไว้",
        "ด้าน retrieval ระบุ chunk ที่รองรับคำตอบตามเวอร์ชัน",
        "ด้าน generation จดข้อเท็จจริงสำคัญและกรณีที่ควรยอมรับว่าไม่มีข้อมูล",
      ],
      code: {
        language: "python",
        filename: "route_example.py",
        code: `expected = {"TH-01-1": "rag", "TH-09-1": "lookup_order"}
baseline = {"TH-01-1": "rag", "TH-09-1": "rag"}
candidate = {"TH-01-1": "rag", "TH-09-1": "lookup_order"}

for name, run in (("baseline", baseline), ("candidate", candidate)):
    wrong = [case_id for case_id, route in expected.items()
             if run.get(case_id) != route]
    print(name, wrong)
# baseline ['TH-09-1']
# candidate []`,
      },
      whyTitle: "Why this matters — เก็บร่องรอยการเปลี่ยนแปลง",
      whyParagraphs: [
        "ข้อมูลสองแถวนี้แสดงวิธีเปรียบเทียบ baseline กับ candidate โดยชี้ไปที่ case ID ได้ทันที เมื่อมี 40 แถวให้ใช้วิธีเดียวกันกับทุก slice และเก็บเวอร์ชัน build คู่กับผลรัน",
      ],
    },
    {
      id: "label-contract",
      title: "2 · เขียน label จากเอกสารสมมติที่ตรวจซ้ำได้",
      paragraphs: [
        "กำหนดหนึ่งแถวต่อคำถาม แยก query จาก reference และ relevant_chunk_ids สำหรับนโยบายคืนสินค้าให้ตรวจข้อความใน refund#1 แล้วเขียนช่วงเวลาและจุดเริ่มนับลง reference สำหรับเคสติดต่อศูนย์ซ่อมต่างประเทศ ให้ตรวจ corpus ที่ตรึงไว้ก่อนติดป้าย abstain",
        "เครื่องมือ lookup_order อ่านสถานะจากข้อมูลออเดอร์สมมติ จึงใช้ route เป็นสัญญาหลักและเก็บ chunk list ว่าง ถ้าจะวัด argument ให้เพิ่มช่อง expected arguments และข้อมูลตอบกลับของ fake tool เป็นอีกสัญญาหนึ่ง",
      ],
      analogy: "เหมือนแยก request, expected status และข้อมูลตั้งต้นของ integration test ออกจากกัน",
      bullets: [
        "ใช้ UTF-8 และหนึ่ง JSON object ต่อบรรทัด",
        "ใช้ stable case ID ในรายงานและเก็บ corpus version เพื่อหาเอกสารชุดเดิม",
        "เมื่อ corpus เปลี่ยน ให้ทบทวน reference และ chunk ID พร้อม bump รุ่นของ dataset แยกจากการจูนโมเดล",
      ],
      code: {
        language: "python",
        filename: "jsonl_example.py",
        code: `import json

row = {
    "case_id": "TH-01-1",
    "group_id": "refund-window",
    "corpus_version": "thai-kb-v1",
    "split": "dev",
    "slice": "policy",
    "query": "คืนสินค้าได้ในกี่วัน",
    "expected_route": "rag",
    "relevant_chunk_ids": ["refund#1"],
    "reference": "แจ้งคืนได้ภายใน 7 วันนับจากวันที่รับสินค้า",
}
line = json.dumps(row, ensure_ascii=False)
assert json.loads(line)["query"] == "คืนสินค้าได้ในกี่วัน"
print(line)`,
      },
      whyTitle: "Why this matters — คนตรวจย้อนข้อกำหนดได้",
      whyParagraphs: [
        "ถ้าเคสคืนสินค้ามี ID เดิมแต่ระบบเปลี่ยนวิธีแบ่ง chunk ให้ตรวจและย้าย label อย่างตั้งใจ ระหว่างนั้นเก็บผลคนละรุ่นเพื่อให้รู้ว่าความต่างมาจากข้อมูลหรือระบบ",
      ],
    },
    {
      id: "slices-and-splits",
      title: "3 · วาง coverage และแบ่งตามกลุ่ม intent",
      paragraphs: [
        "เริ่ม 10 กลุ่ม กลุ่มละ 4 สำนวน รวม 40 เคส โดยแต่ละ slice มีสองกลุ่ม เก็บหนึ่งกลุ่มไว้ใน dev และอีกหนึ่งไว้ใน holdout ตัวอย่างใช้ภาษาไทย ปนอังกฤษ และคำที่ผู้ใช้ใช้จริง เช่น เช็ก tracking และขอ opening hours",
        "จับคำถามที่แค่เปลี่ยนถ้อยคำให้อยู่กลุ่มเดียวกันก่อนแบ่ง ถ้าเป้าหมายคือทดสอบกับนโยบายหรือเอกสารที่ไม่เคยจูน ให้รวมกลุ่มที่ใช้หลักฐานเดียวกันเพิ่มด้วย ชุดฝึกวันนี้แบ่งตาม intent จึงอาจมี chunk ร่วมระหว่างกลุ่ม",
      ],
      analogy: "เหมือนแยกทั้งบทของข้อสอบไปเป็นชุดซ้อมหรือชุดตรวจจริง แทนการแจกข้อที่เปลี่ยนคำเดียวไปคนละชุด",
      bullets: [
        "40 คำถามในแลบมี 10 intent จึงให้รายงานทั้งจำนวนเคสและจำนวนกลุ่ม",
        "นโยบายคืนของและโจทย์หลายหลักฐานอาจใช้เอกสารชิ้นเดียวกัน ให้บันทึกขอบเขตการแบ่งไว้",
        "ใช้ holdout เมื่อพร้อมวัด ถ้าหยิบมาแก้ prompt ให้ย้ายเคสนั้นเข้า dev แล้วหากลุ่มใหม่มาทดแทน",
      ],
      code: {
        language: "python",
        filename: "split_example.py",
        code: `rows = [
    ("refund-window", "dev", "คืนได้กี่วัน"),
    ("refund-window", "dev", "ขอคืนภายในกี่วัน"),
    ("warranty-start", "holdout", "ประกันเริ่มวันไหน"),
]
dev_groups = {group for group, split, _ in rows if split == "dev"}
holdout_groups = {group for group, split, _ in rows if split == "holdout"}
assert dev_groups.isdisjoint(holdout_groups)
print(f"dev groups={len(dev_groups)}; holdout groups={len(holdout_groups)}")`,
      },
      whyTitle: "Why this matters — คะแนนสะท้อนคำถามประเภทไหน",
      whyParagraphs: [
        "ถ้าเก็บแต่ FAQ ง่าย ค่าเฉลี่ยจะกลบข้อผิดพลาดใน slice ข้อมูลไม่มี คำถามอย่างวันหยุดพิเศษจึงต้องมีป้าย abstain ที่ผ่านการตรวจ corpus แล้วและแสดงแยกในรายงาน",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge — dataset คือ input contract ของชุด regression",
      body: [
        "ใช้ fixture และ test report แบบที่ทีมเว็บคุ้นเคย เพิ่ม corpus version เพื่อให้คุณย้อนเอกสารตรงกับรอบที่วัดได้",
      ],
      table: [
        ["Acceptance criteria", "expected_route และข้อเท็จจริงใน reference"],
        ["Test fixture", "GoldenCase หนึ่ง object ต่อแถวใน JSONL"],
        ["Regression dashboard", "case ID, slice และคะแนนก่อน/หลัง"],
        ["Release validation", "holdout ที่ตรึงไว้ก่อนจูน"],
      ],
    },
    student: {
      title: "First-Year Note — หนึ่งแถวแทนหนึ่งข้อ",
      body: [
        "เริ่มจากแถวเดียว ลองอธิบายว่าเราเห็นอะไรในคำถาม รู้อะไรจากเอกสาร และคาดว่าโปรแกรมทำอะไร",
        "พอเขียนหนึ่งข้อได้แล้ว ลองคิดสำนวนอื่นที่ยังต้องตอบเรื่องเดิม สี่สำนวนทำให้ทดสอบภาษาได้กว้างขึ้น แต่ในรายงานก็ยังมาจาก intent เดียว",
      ],
    },
  },
  workedExample: {
    intro: "ลองต่อโค้ดทั้งสามขั้นเพื่อสร้าง golden.jsonl ฉบับฝึกตามระบบ Thai Knowledge RAG + Agent ตัวอย่างใช้ labels จากนโยบายสมมติที่ระบุใน INTENTS จึงรันได้โดยไม่ต้องเปิดฐานข้อมูลจริง",
    steps: [
      {
        title: "1 · นิยามสัญญาของหนึ่งเคส",
        explain: "Pydantic ตรวจชนิดและความสัมพันธ์ของ route กับหลักฐานตั้งแต่ขาเข้า โค้ดในขั้นนี้ประกาศโมเดล ยังไม่พิมพ์ผล",
        code: {
          language: "python",
          filename: "worked_golden.py",
          code: goldenCaseCode,
        },
        output: "GoldenCase พร้อมใช้",
      },
      {
        title: "2 · สร้าง 40 เคสจาก 10 intent",
        explain: "สำนวนใน intent เดียวกันใช้ group_id, reference และ split เดียวกัน โดยเลข ID คงที่ตราบใดที่คงลำดับ fixture ถ้านำไปทำ suite ระยะยาวให้เก็บ ID ลง JSONL แล้วเพิ่มแถวโดยไม่รันแจก ID เก่าใหม่",
        code: {
          language: "python",
          filename: "worked_golden.py",
          code: intentBankCode,
        },
        output: "10 กลุ่ม intent × 4 คำถาม",
      },
      {
        title: "3 · ตรวจ suite แล้วเขียนและอ่านกลับ",
        explain: "ตรวจครบทุก slice ทั้ง dev และ holdout ก่อนเขียน จากนั้นอ่านทุกบรรทัดกลับเข้าตัว validate ถ้าข้อมูลเสียให้ระบุเลขบรรทัด",
        code: {
          language: "python",
          filename: "worked_golden.py",
          code: jsonlCode + `


if __name__ == "__main__":
    out = Path("golden.jsonl")
    save_cases(out, build_cases())
    loaded = load_cases(out)
    print(f"{out.name}: {len(loaded)} cases, {len({c.group_id for c in loaded})} groups")
    for split in ("dev", "holdout"):
        counts = Counter(case.slice for case in loaded if case.split == split)
        print(f"{split}: {sum(counts.values())} {dict(counts)}")`,
        },
        output: `golden.jsonl: 40 cases, 10 groups
dev: 20 {'policy': 4, 'code_switch': 4, 'multi_evidence': 4, 'unanswerable': 4, 'tool': 4}
holdout: 20 {'policy': 4, 'code_switch': 4, 'multi_evidence': 4, 'unanswerable': 4, 'tool': 4}`,
      },
    ],
    gotcha: "หนึ่งแถวต่อคำถามและทุกบรรทัดต้องเป็น JSON ที่ถูกต้อง บรรทัดว่างกลางไฟล์ต้องแจ้งผิดพลาด ส่วน newline หลังแถวสุดท้ายเป็นรูปแบบปกติ",
  },
  practice: {
    intro: "จำลองการรับเคส regression เข้าคลัง ใน 12 นาทีเติมตัวตรวจชุดข้อมูลและเขียนเทสต์ที่ทำให้แถวนำเข้าที่ผิดติดแดงก่อนเข้ารอบประเมิน",
    requirements: [
      "ใช้ GoldenCase และ build_cases จาก Worked Example แล้วตรวจ duplicate case ID, duplicate query และกลุ่มข้าม split",
      "ตรวจว่าทั้ง dev และ holdout มีครบห้า slice และจำนวนรวมอยู่ในช่วง 30–50",
      "เขียนและอ่าน JSONL แบบ UTF-8 โดยรายงาน path และเลขบรรทัดเมื่อ parse ไม่ผ่าน",
      "เขียน pytest สำหรับ round-trip, label ที่ขัดกัน, กลุ่มปน split และไฟล์ว่าง/เสีย",
    ],
    starter: {
      language: "python",
      filename: "test_golden.py",
      code: `from pathlib import Path

import pytest
from worked_golden import GoldenCase, build_cases


def validate_suite(cases: list[GoldenCase]) -> None:
    # TODO: ตรวจจำนวน, ID, query, split ต่อ intent และ coverage
    raise NotImplementedError


def save_cases(path: Path, cases: list[GoldenCase]) -> None:
    # TODO: validate ก่อนเขียน UTF-8 JSONL
    raise NotImplementedError


def load_cases(path: Path) -> list[GoldenCase]:
    # TODO: parse ทีละบรรทัด พร้อมระบุเลขบรรทัดเมื่อผิด
    raise NotImplementedError


def test_round_trip(tmp_path: Path) -> None:
    # TODO: บันทึก อ่านกลับ และเทียบ list กับ input
    pytest.fail("เติม assertion สำหรับ round trip")`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_golden.py",
    },
    selfCheck: [
      "ได้ 40 เคสจาก 10 intent และ report เป็น 20/20",
      "แก้ split ของหนึ่งสำนวนในกลุ่มเดียวกันแล้ว validator จับได้",
      "รายงานเลขบรรทัดเมื่อใส่บรรทัดว่างกลางไฟล์",
    ],
    acceptance: "ชุดเทสต์ผ่านและ JSONL ที่ได้ยังอ่านภาษาไทยได้ พร้อมแยกกลุ่ม dev และ holdout โดยไม่มี intent ข้าม split",
    hints: [
      {
        body: "ลองใช้ set ของ case ID เทียบจำนวนกับจำนวนแถว และเก็บ split ที่เจอครั้งแรกของแต่ละ group ID",
      },
      {
        body: "ใช้ Counter ที่มี key เป็นคู่ split และ slice ส่วนการอ่านไฟล์ใช้ enumerate(source, start=1) แล้ว wrap ข้อผิดพลาดจาก model_validate_json",
      },
      {
        body: "แทนเนื้อหาทั้งไฟล์ test_golden.py ด้วยเฉลยด้านล่างแล้วรัน pytest จากโฟลเดอร์เดียวกัน",
        code: {
          language: "python",
          filename: "test_golden.py",
          code: [goldenCaseCode, intentBankCode, jsonlCode, `import pytest


def test_round_trip(tmp_path: Path) -> None:
    path = tmp_path / "golden.jsonl"
    original = build_cases()
    save_cases(path, original)
    assert load_cases(path) == original
    assert len(path.read_text(encoding="utf-8").splitlines()) == 40


@pytest.mark.parametrize(
    "index,field,value,message",
    [
        (0, "expected_route", "abstain", "non-RAG cases"),
        (4, "case_id", "TH-01-1", "duplicate case ID"),
        (0, "split", "holdout", "crosses splits"),
        (0, "relevant_chunk_ids", [], "need evidence"),
    ],
)
def test_reject_broken_labels(index, field, value, message) -> None:
    cases = build_cases()
    row = cases[index].model_dump()
    row[field] = value
    with pytest.raises(ValueError, match=message):
        cases[index] = GoldenCase.model_validate(row)
        validate_suite(cases)


def test_report_corrupt_line(tmp_path: Path) -> None:
    path = tmp_path / "broken.jsonl"
    path.write_text(build_cases()[0].model_dump_json() + "\\n\\n", encoding="utf-8")
    with pytest.raises(ValueError, match="broken.jsonl:2: invalid case"):
        load_cases(path)


def test_empty_suite_is_invalid() -> None:
    with pytest.raises(ValueError, match="expected 30–50"):
        validate_suite([])`].join("\n\n\n"),
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_golden.py",
    },
  },
  mistakes: [
    {
      title: "ใช้ output ปัจจุบันเป็น reference ทันที",
      symptom: "ทุกบั๊กใน output กลายเป็นพฤติกรรมที่เทสต์อนุมัติ",
      fix: "ตรวจเอกสารและเส้นทางกับคนก่อนตรึง label โดยเฉพาะตัวเลข วันเริ่มนับ และกรณีข้อมูลไม่พอ",
    },
    {
      title: "แบ่ง split แบบสุ่มทีละแถว",
      symptom: "สำนวนใกล้กันอยู่ทั้ง dev และ holdout ทำให้ผลประเมินดูดีเกินจริง",
      fix: "กำหนด group ID ก่อนแบ่งและตรวจว่าแต่ละกลุ่มมี split เดียว",
    },
    {
      title: "เก็บเฉพาะเคสที่ตอบได้",
      symptom: "โมเดลเดาเก่งขึ้นแต่รายงานไม่เห็นความเสียหายเมื่อไม่มีหลักฐาน",
      fix: "เพิ่ม slice unanswerable ที่มี label abstain และตรวจแยก",
    },
    {
      title: "เขียน JSON สวยหลายบรรทัดหรือใช้ encoding เริ่มต้น",
      symptom: "อ่านแบบทีละบรรทัดไม่ได้ หรือเปิดภาษาไทยข้ามเครื่องเพี้ยน",
      fix: "ใช้ model_dump_json หนึ่งครั้งต่อแถวและกำหนด encoding เป็น UTF-8",
    },
  ],
  quiz: {
    intro: "ลองตอบทั้ง 4 ข้อก่อนเปิดเฉลย แล้วจดข้อที่ยังอธิบายด้วยตัวเองไม่ได้ลง Error Log",
    questions: [
      mc(
        "d125-q-1",
        "ระบบตอบ ‘คืนได้ใน 7 วันหลังจ่ายเงิน’ แต่นโยบายนับจากวันรับของ ควรเริ่มแก้อย่างไร?",
        [
          ["เปลี่ยนโมเดลแล้วลองถามใหม่", "ยังไม่มีข้อมูลฐานเทียบ"],
          ["ยึด output เป็น reference", "ทำให้บั๊กผ่านเทสต์"],
          ["บันทึกเคสกับเอกสารและผลที่ควรได้ก่อนแก้", "มี regression case และ baseline"],
          ["ลบคำถามเพราะเป็นเคสเดียว", "ทิ้งสัญญาณความผิดพลาด"],
        ],
        "C",
        "ตรึงหลักฐานและผลคาดหวังก่อนแก้ จึงเปรียบเทียบผลหลังแก้และตรวจผลกระทบกับเคสอื่นได้",
        "Eval-driven เริ่มจากอะไร?",
        "พฤติกรรมที่วัดได้พร้อม input, label และหลักฐาน",
      ),
      mc(
        "d125-q-2",
        "สี่สำนวนของ intent เดียวกันควรอยู่ที่ไหน?",
        [
          ["อยู่ split เดียวกัน", "คงความเป็นอิสระระดับกลุ่ม"],
          ["แบ่งครึ่ง dev/holdout", "ทำให้สำนวนใกล้กันข้ามชุด"],
          ["ใส่ holdout หลังดูผลแล้วทุกครั้ง", "เกิดการเลือกเคสตามผล"],
          ["รันเฉพาะหนึ่งสำนวนและทิ้งตัวอื่น", "สูญเสียการทดสอบความหลากหลายของภาษา"],
        ],
        "A",
        "กลุ่มสำนวนใช้ความรู้และ reference เดียวกัน จึงแบ่งทั้งกลุ่มเพื่อให้ holdout ทดสอบกลุ่มที่ยังไม่ใช้จูน",
        "แบ่ง split ระดับไหน?",
        "แบ่งตาม intent หรือกลุ่มหลักฐานตามเป้าหมาย",
      ),
      mc(
        "d125-q-3",
        "เคสถามศูนย์บริการต่างประเทศและตรวจแล้วว่า corpus ไม่มี ควรติดป้ายใด?",
        [
          ["rag และเดา chunk ให้ครบ", "ไม่มีหลักฐานรองรับ"],
          ["lookup_order", "เป็นคนละหน้าที่"],
          ["rag พร้อม reference ว่าง", "อธิบายความคาดหวังไม่ครบ"],
          ["abstain พร้อม reference ที่แจ้งว่าไม่พบข้อมูล และรายการ chunk ว่าง", "สะท้อนผลที่ผู้ใช้ควรได้"],
        ],
        "D",
        "การมีเคส abstain ช่วยวัดว่าระบบยอมรับข้อจำกัดเมื่อไม่มีเอกสารรองรับ",
        "unanswerable เก็บ label อย่างไร?",
        "expected_route = abstain และไม่ระบุ chunk ที่เกี่ยวข้อง",
      ),
      mc(
        "d125-q-4",
        "หลังเปลี่ยน chunking จน ID เปลี่ยน ควรทำอะไรกับผล eval?",
        [
          ["แก้คะแนนเก่าให้เท่าคะแนนใหม่", "ทำลายหลักฐานการเปรียบเทียบ"],
          ["ทบทวน label ตาม corpus ใหม่และบันทึกรุ่นชุดประเมิน", "อ้างอิงหลักฐานได้และเปรียบเทียบอย่างมีเงื่อนไข"],
          ["เก็บ ID เก่าไว้แล้วตีความว่าค้นผิดทั้งหมด", "อาจเป็นแค่การย้าย ID"],
          ["ลบช่อง corpus_version", "ยิ่งตามหลักฐานยาก"],
        ],
        "B",
        "แยก version ของ dataset/corpus ออกจาก version ของระบบและตรวจหลักฐานใหม่ก่อนรายงานการเปลี่ยนแปลง",
        "เก็บ corpus version เพื่ออะไร?",
        "เพื่ออ้างกลับไปที่เอกสารและ chunk ชุดเดียวกับตอนติดป้าย",
      ),
    ],
  },
  takeaways: [
    "ตรึง expected behavior จากเอกสารสมมติหรือเอกสารที่ได้รับอนุญาตก่อนวัดระบบ",
    "ชุดฝึก 40 เคสครอบคลุมห้า slice โดยแบ่ง dev และ holdout ระดับ intent",
    "Pydantic ตรวจรายแถว ส่วน pytest ตรวจ invariant ระดับไฟล์และระดับชุดข้อมูล",
    "Day 126 ใช้ golden.jsonl ตรวจ schema, route และอันดับผลค้นคืนด้วยตัวเลข",
  ],
  reviewCards: [
    rc(
      "d125-rc-1",
      "Golden case หนึ่งแถวควรมีอะไร?",
      "ID, intent group, corpus version, split, slice, query, route, chunk ที่เกี่ยวข้อง และ reference",
    ),
    rc(
      "d125-rc-2",
      "ทำไมแบ่ง holdout ตามกลุ่ม?",
      "เพื่อไม่ให้สำนวนใกล้กันของ intent ที่ใช้จูนไปเพิ่มคะแนนฝั่งตรวจจริง",
    ),
    rc(
      "d125-rc-3",
      "ถ้าจะปรับ prompt ให้เริ่มจากอะไร?",
      "เก็บ baseline และเคสที่พลาดพร้อม evidence แล้วเทียบผลบน dev suite เดิม",
    ),
  ],
  sources: [
    {
      label: "JSON Lines — Format specification",
      href: "https://jsonlines.org/",
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
  glossary: ["golden-dataset", "jsonl", "pydantic", "pytest", "rag", "mcp", "langgraph", "abstention"],
});
