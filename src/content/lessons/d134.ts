import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const setupCode = `from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass, field
from time import perf_counter_ns
from typing import Literal

from pydantic import BaseModel, Field


class Observation(BaseModel):
    id: int
    parent_id: int | None
    name: str
    kind: Literal["span", "generation"]
    start_ns: int
    end_ns: int | None = None
    metadata: dict[str, str | int | bool] = Field(default_factory=dict)


@dataclass
class MockLangfuse:
    rows: list[Observation] = field(default_factory=list)
    scores: list[tuple[int, str, float]] = field(default_factory=list)
    _stack: list[Observation] = field(default_factory=list)

    @contextmanager
    def observe(self, name: str, kind: Literal["span", "generation"] = "span"
                ) -> Iterator[Observation]:
        row = Observation(
            id=len(self.rows) + 1,
            parent_id=self._stack[-1].id if self._stack else None,
            name=name,
            kind=kind,
            start_ns=perf_counter_ns(),
        )
        self.rows.append(row)
        self._stack.append(row)
        try:
            yield row
        finally:
            row.end_ns = perf_counter_ns()
            self._stack.pop()

    def score_trace(self, name: str, value: float) -> None:
        if not self._stack:
            raise RuntimeError("score requires an active observation")
        if not 0 <= value <= 1:
            raise ValueError("score must be between zero and one")
        self.scores.append((self._stack[0].id, name, value))`;

const testCode = `import pytest

from rag_observations import MockLangfuse, instrumented_answer


@pytest.mark.parametrize(("label", "version"), [("production", 3), ("candidate", 4)])
def test_prompt_version_is_attached_to_generation(label, version):
    client = MockLangfuse()
    assert "[expense#03]" in instrumented_answer(client, label=label)
    root, retrieval, generation = client.rows
    assert root.parent_id is None
    assert retrieval.parent_id == generation.parent_id == root.id
    assert generation.kind == "generation"
    assert generation.metadata["prompt_version"] == version
    assert generation.metadata["input_tokens"] == 420
    assert client.scores == [(root.id, "citation_present", 1.0)]
    assert all(row.end_ns >= row.start_ns for row in client.rows)


def test_missing_evidence_abstains_without_generation_or_score():
    client = MockLangfuse()
    assert instrumented_answer(client, evidence=False) == "ไม่พบข้อมูลในเอกสาร"
    root, retrieval = client.rows
    assert root.metadata == {"abstained": True, "has_citation": False}
    assert retrieval.metadata["hits"] == 0
    assert retrieval.parent_id == root.id
    assert not client.scores
    assert root.end_ns is not None and retrieval.end_ns is not None


def test_later_request_has_its_own_root_and_score():
    client = MockLangfuse()
    instrumented_answer(client)
    instrumented_answer(client, label="candidate")
    roots = [row.id for row in client.rows if row.parent_id is None]
    assert len(roots) == 2
    assert [trace_id for trace_id, _, _ in client.scores] == roots`;

/** Day 134 · Phase 5 · Block B34 */
export const d134: Lesson = defineLesson({
  day: 134,
  titleTh: "ตามงาน LLM และ RAG จากต้นจนจบด้วย Langfuse",
  tagline: "30 นาที · อ่าน waterfall ผูก generation กับ prompt version และให้คะแนนใน trace เดียวกัน",
  icon: "workflow",
  visual: {
    id: "langfuse-trace-waterfall",
    title: "Langfuse Trace Waterfall",
    caption: "อ่านแนวนอนเพื่อดูเวลา และดูการเยื้องเพื่อหา parent จากนั้นเปิด generation เพื่อดู model, usage และ prompt version",
    alt: "Waterfall ของคำขอ Thai Knowledge RAG แสดง root และแถวย่อย retrieval กับ generation พร้อมข้อมูล prompt และ token",
  },
  requiresApiKey: false,
  apiKeyNote: "แลบหลักใช้ mock บนเครื่อง ส่วนตัวอย่าง Langfuse SDK ต้องเชื่อมโปรเจกต์และตั้ง credentials ของโปรเจกต์",
  tools: ["Python 3.12","uv","Langfuse Python SDK","Pydantic v2","pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "เกณฑ์ผ่านแล้ว แต่ผู้ใช้ยังตอบกลับว่าไม่ตรง",
      body: "D129–D132 รันวัดคุณภาพเป็นชุดก่อนปล่อย หลังปล่อยเราต้องย้อนให้ได้ว่าเคสค่าเดินทางใช้ prompt รุ่นใด",
      lessonNote: "Trace เก็บหลักฐานต่อคำขอเพื่อเลือกเคสกลับเข้า Golden Dataset",
    },
    {
      node: 2,
      heading: "เก็บ lineage ของ prompt",
      body: "Prompt ชื่อ expense-qa ผูก label production หรือ candidate เข้ากับ version ที่ต่างกันตามการ rollout",
      lessonNote: "บันทึก version ที่ใช้จริง ณ ตอนรัน เพราะ label ย้ายได้",
    },
    {
      node: 4,
      heading: "แยก observation ตามหน้าที่",
      body: "ให้ retrieval เป็น span และจัดการเรียก {{llm}} เป็น generation ที่มี model, token และ prompt version",
      lessonNote: "กัน metadata รั่วโดยใช้ค่า fixture ที่ไม่มีข้อมูลลูกค้า",
    },
    {
      node: 5,
      heading: "เก็บคะแนนระดับที่ตอบคำถาม",
      body: "คะแนนพบ citation ในคำตอบควรผูกกับ trace ของคำขอนั้น ส่วนเวลาของแต่ละ operation อยู่ในแถวของ observation",
      lessonNote: "ใน D135 จะรวมข้อมูลจากหลาย trace เป็น dashboard",
    },
  ],

  objectives: [
    "อ่าน trace, spans และ generations จาก waterfall ของ {{rag}} ได้",
    "เชื่อม prompt version ที่ใช้งานจริงกับ generation ผ่าน {{prompt-versioning}}",
    "ให้คะแนนระดับ trace และทดสอบกรณี abstain โดยไม่เรียกบริการภายนอก",
  ],

  prerequisites: [
    "D91 · แยก prompt เป็นไฟล์และเก็บ version",
    "D105–D106 · สร้าง citation จากหลักฐานและ abstain เมื่อไม่พบข้อมูล",
    "D129–D132 · ประเมิน groundedness และทำ CI gate, D133 · โครง parent-child และ GenAI token usage",
  ],

  setup: {
    intro: "สร้างร้านจำลองสำหรับเปลี่ยน prompt ระหว่าง production กับ candidate และบันทึกแต่ละ observation ไว้ใน list",
    commands: `uv init --python 3.12 b34-d134
cd b34-d134
uv add pydantic
uv add --dev pytest
uv run python --version`,
    steps: [
      ["python", "ตรวจว่า Python เป็นรุ่น 3.12"],
      ["deps", "ติดตั้ง pydantic และ pytest สำเร็จ"],
      ["files", "เตรียม rag_observations.py และ test_rag_observations.py ตามขั้นตอนของบทเรียน"],
    ],
    note: "Mock ในบทนี้รองรับคำขอแบบ synchronous เท่านั้น ตัวอย่างเสริมที่ใช้ Langfuse SDK อยู่ใน Concept 3 ใช้เมื่อมีโปรเจกต์ทดสอบและ prompt แบบ text ที่มีตัวแปร doc_id เท่านั้น",
  },

  concepts: [
    {
      id: "waterfall",
      title: "1 · Trace เป็นกลุ่มงาน ส่วน observation คือแถวใน timeline",
      paragraphs: [
        "{{langfuse}} แสดงชุด observations ใต้ trace หนึ่งรายการ ระบุ operation ด้วยชื่อและชนิด ค่าเริ่มและจบวางบนแกนเวลา คลิก root เพื่อดูบริบทคำขอ คลิก child เพื่อดูว่า retriever หรือโมเดลใช้เวลาที่ช่วงใด",
        "ในตัวอย่าง sequential นี้เริ่ม retrieval ก่อน generation ทั้งคู่อยู่ใต้ rag.answer การเยื้องบอก parent ส่วนแกนเวลาอาจแสดงงานซ้อนกัน ถ้า backend ค้น BM25 และ vector พร้อมกัน การหาจุดช้าต้องมองช่วงที่งาน downstream ต้องรอ",
        "Generation เป็น observation สำหรับการเรียกโมเดล จึงใส่ model, usage และ prompt ได้ ลำดับข้อความและผลจาก provider มีประโยชน์ตอน debug แต่เปิดเฉพาะในข้อมูลที่ได้รับอนุญาต แลบนี้เลือกส่ง metadata สังเคราะห์",
      ],
      analogy: "เหมือน DevTools Network waterfall ที่เพิ่มชื่อฟังก์ชันของระบบ RAG และเก็บข้อมูลรุ่นที่ใช้ทำงานไว้ในแต่ละแถว",
      bullets: [
        "Root ยาวเท่ากับระยะคำขอในแอปที่ถูก instrument",
        "Retriever มีจำนวนผลค้นคืนและเวลาค้น Generation มี input/output usage และรุ่นโมเดล",
        "ช่องว่างระหว่างแถวอาจเป็นงานที่ยังไม่ได้ instrument หรือรอก่อนเริ่มขั้นถัดไป",
      ],
      code: {
        language: "python",
        filename: "read_observations.py",
        code: `from rag_observations import MockLangfuse, instrumented_answer

client = MockLangfuse()
instrumented_answer(client)
rows = sorted(client.rows, key=lambda row: row.start_ns)
root = rows[0]
for row in rows:
    offset_ms = (row.start_ns - root.start_ns) / 1_000_000
    duration_ms = (row.end_ns - row.start_ns) / 1_000_000
    print(f"{offset_ms:.3f} ms +{duration_ms:.3f} ms", row.name)`,
        caption: "ใช้ไฟล์ตัวอย่างที่ประกอบเสร็จเพื่อพิมพ์แกนเวลา ช่วงเวลาของ fake LLM สั้นและขึ้นกับเครื่อง",
      },
      whyTitle: "แกะปัญหาที่หน้ารวม trace มองข้าม",
      whyParagraphs: [
        "Trace สำเร็จในมุมแอปยังอาจตอบไม่ตรง policy ใช้ score แยกผลคุณภาพจากสถานะการทำงาน",
        "การแยก retriever และ generation ช่วยไม่ให้จูน prompt ทั้งที่หลักฐานเข้ามาเป็นศูนย์",
      ],
    },
    {
      id: "prompt-lineage",
      title: "2 · ผูก Prompt Management กับ version ที่ถูกใช้จริง",
      paragraphs: [
        "ใน Langfuse Prompt Management ชื่อ prompt คงที่และแต่ละ revision มี version ของตัวเอง Label อย่าง production เป็นตัวชี้ที่เปลี่ยนได้ สมมติช่วงเช้า production ชี้ version สาม พอ rollout ช่วงบ่ายชี้ version สี่ ถ้าเก็บแค่ label เราจะย้อน reproduce ช่วงเช้าไม่ได้",
        "เมื่อสร้าง generation ส่ง object ที่ได้จาก get_prompt ผ่าน prompt=prompt แล้ว compile ด้วยค่าตัวแปรที่ application ควบคุม การผูกนี้ทำให้ผู้ตรวจเห็น version จริงที่ generation ใช้",
        "ใน mock ให้ version มาจากตาราง PROMPTS เพื่อสอนไอเดียโดยไม่ใช้ API เมื่อไปใช้งานจริงควรตรวจชื่อ ชนิด text หรือ chat และชุดตัวแปรในแต่ละ version ให้ตรงก่อนเปลี่ยน label",
      ],
      analogy: "เหมือน tag ที่ชี้ไปยัง build ล่าสุด ถ้าต้องย้อน incident ด้วย build ที่แน่นอน ให้เก็บ commit SHA หรือ build ID คู่กัน",
      bullets: [
        "ใช้ golden cases เดิมของ D129 ก่อนเปลี่ยน label เพื่อดู quality regression",
        "การมี prompt version กับ response model ช่วยควบคุมตัวแปรตอนเปรียบเทียบ แต่ยังต้องตรึงชุดคำถามและหลักฐาน",
        "ถ้าต้องการ reproduce ให้ pin version ใน experiment ส่วน production ใช้ label ตามกระบวนการปล่อยที่ทีมกำหนด",
      ],
      code: {
        language: "python",
        filename: "compare_prompts.py",
        code: `from rag_observations import MockLangfuse, instrumented_answer

client = MockLangfuse()
for label in ("production", "candidate"):
    instrumented_answer(client, label=label)

versions = [
    row.metadata["prompt_version"]
    for row in client.rows
    if row.kind == "generation"
]
assert versions == [3, 4]
print("prompt versions", versions)`,
        caption: "รันหลังประกอบ worked example เพื่อตรวจ lineage ของสองคำขอ",
      },
      whyTitle: "ตามผลหลัง rollout กลับมาหาสิ่งที่เปลี่ยน",
      whyParagraphs: [
        "จับคู่เวลาที่คุณภาพเริ่มตกกับ prompt version ที่พบใน trace แล้วเลือก sample มาอ่านคู่กับผล eval ก่อนตัดสินใจ",
        "ผลใน mock ไม่เปลี่ยนคุณภาพตาม prompt เพราะ fake LLM อิงเอกสารตัวเดียว จุดประสงค์คือยืนยันว่าข้อมูลรุ่นติดไปกับ generation",
      ],
    },
    {
      id: "sdk-and-score",
      title: "3 · ใช้ Langfuse SDK จริงและผูก Score กับ Trace",
      paragraphs: [
        "ตัวอย่างต่อไปใช้ Python SDK API start_as_current_observation และ as_type เพื่อสร้าง observation ใต้ context ที่ active ติดตั้งเสริมด้วย uv add langfuse ตั้ง LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY และ LANGFUSE_BASE_URL ผ่าน environment และสร้าง text prompt expense-qa ที่มีตัวแปร doc_id ในโปรเจกต์ทดสอบ",
        "คะแนน citation_present ในบทคือค่าศูนย์หรือหนึ่ง เช็กว่าข้อความมีป้ายอ้างอิง fixture ตรงหรือไม่ จึงเป็น deterministic check แบบ D126 คะแนนนี้วัดการมี citation ตามเงื่อนไขเท่านั้น การยืนยันข้ออ้างต้องใช้การตรวจแหล่งอ้างอิงหรือ eval แบบ D129",
        "เมื่อ feedback มาทีหลังให้ใช้ trace ID ที่เก็บไว้และ API สร้างคะแนนโดยระบุ trace ID ส่วนตัวอย่างให้คะแนนใน root context ทันทีด้วย score_current_trace แล้ว flush หลังออกจาก spans ทั้งหมดสำหรับสคริปต์ที่จบเร็ว",
      ],
      analogy: "เช่นระบบส่งแบบประเมินหลังดูใบเสร็จ ถ้าคะแนนเข้าทีหลังต้องมีเลขรายการเดิมเพื่อแนบคะแนนถูกใบ",
      bullets: [
        "usage_details ใช้คีย์ input และ output ใน Langfuse ตัวเลขในตัวอย่างเป็น fixture จาก mock ไม่ใช่บิลจริง",
        "ให้คะแนนระดับ trace เมื่อประเมินผลคำขอทั้งรอบ ให้คะแนนระดับ observation เมื่อประเมินขั้นเดียว เช่น retrieval relevance",
        "หลีกเลี่ยง flush ต่อ request ในระบบจริง ออกแบบ lifecycle ของ client และ flush ตอนปิดหรือเมื่อจบงาน batch",
      ],
      code: {
        language: "python",
        filename: "send_synthetic_trace.py",
        code: `from langfuse import get_client

from rag_observations import fake_generate


def report_example() -> str:
    client = get_client()
    prompt = client.get_prompt("expense-qa", label="production", type="text")
    with client.start_as_current_observation(name="rag.answer", as_type="span"):
        with client.start_as_current_observation(
            name="rag.retrieve", as_type="retriever"
        ) as retrieval:
            doc_id = "expense#03"
            retrieval.update(metadata={"hit_count": 1})

        with client.start_as_current_observation(
            name="rag.generate", as_type="generation",
            model="mock-thai-mini", prompt=prompt,
        ) as generation:
            answer = fake_generate(prompt.compile(doc_id=doc_id))
            generation.update(
                usage_details={"input": 420, "output": 38},
                metadata={"synthetic": True},
            )

        client.score_current_trace(
            name="citation_present",
            value=float(f"[{doc_id}]" in answer),
            data_type="NUMERIC",
        )
    client.flush()
    return answer


if __name__ == "__main__":
    print(report_example())`,
        caption: "ตัวอย่างเสริมที่ส่งข้อมูลสังเคราะห์ไปยัง Langfuse หลังตั้งค่าตามย่อหน้าแรก",
      },
      whyTitle: "ใช้คะแนนและข้อมูลเวลาในบริบทเดียวกัน",
      whyParagraphs: [
        "คะแนนที่หลุดไปผิด trace ทำให้ทีมสรุปว่าคำตอบรุ่นหนึ่งดีหรือแย่ผิดรุ่น ตรวจการเชื่อมด้วย trace ID และเวลาที่ score ถูกสร้าง",
        "ในกรณีไม่มีหลักฐาน โจทย์จะให้ abstain และเว้นคะแนน citation_present เพื่อคงนิยามของ metric เก็บอัตรา abstention แยกไว้เทียบคุณภาพ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Network waterfall สู่ trace ของ RAG",
      body: [
        "ใน DevTools แถบสีบอกช่วงรอและดาวน์โหลด ใน Langfuse แถวบอกขอบเขตงานของแอป เช่น ดึง policy และสร้างคำตอบ เวลาสั้นลงแล้วให้ดูคะแนนด้วยก่อนสรุปว่าปรับดีขึ้น",
      ],
      table: [
        ["Trace","หนึ่งคำขอจากหน้าแชต"],
        ["Span / retriever","ขั้นค้นข้อมูลภายใน backend"],
        ["Generation","การเรียกโมเดลที่มี usage และ prompt"],
        ["Score","ผลทดสอบคุณภาพที่ผูกกับคำขอ"],
      ],
    },
    student: {
      title: "First-Year Note — Stack ของ context managers",
      body: [
        "เมื่อเข้า with ซ้อน ให้คิดว่าเอา observation วางบน stack ตัวบนสุดคือ parent ของงานใหม่ ออกจาก with แล้วดึงตัวบนออก แม้เกิด exception ก็ต้องคืน stack ให้ถูกใน finally",
        "จดเวลาเริ่มและจบแยกจาก stack เวลาใช้วาด waterfall ส่วน stack บอกความสัมพันธ์",
      ],
    },
  },

  workedExample: {
    intro: "นำโจทย์ใบเสร็จค่าเดินทางจาก D133 มาวาด waterfall จาก mock และทำให้ trace บอกรุ่น prompt ที่ใช้จริง ให้ต่อโค้ด Python จากทั้งสามขั้นเรียงลงในไฟล์ rag_observations.py แล้วรันด้วย uv run python rag_observations.py ครับ",
    steps: [
      {
        title: "1 · ให้ mock สร้าง observation และเวลาที่ตรวจได้",
        explain: "ใช้ Pydantic เก็บข้อมูลที่ใช้แสดงผลและใช้ contextmanager จัด stack คำขอหนึ่ง แถวแรกคือ trace root ใน mock ซึ่งใช้เลขลำดับเฉพาะแลบแทน ID ของ SDK",
        code: {
          language: "python",
          filename: "rag_observations.py",
          code: setupCode,
        },
      },
      {
        title: "2 · ผูก prompt กับ generation และเพิ่มคะแนน",
        explain: "เลือก label ก่อน retrieval แล้ว compile ด้วย doc ID สังเคราะห์ ใส่ prompt_version เฉพาะ generation และให้คะแนนตอน root ยัง active ในแบบฝึกหัดจะเปลี่ยนกรณีเอกสารว่างให้ข้ามการเรียกโมเดล",
        code: {
          language: "python",
          filename: "rag_observations.py",
          code: `@dataclass(frozen=True)
class Prompt:
    version: int
    template: str

    def compile(self, doc_id: str) -> str:
        return self.template.format(doc_id=doc_id)


PROMPTS = {
    "production": Prompt(3, "อ้างอิงเอกสาร {doc_id} ตอบเรื่องเบิกค่าเดินทาง"),
    "candidate": Prompt(4, "สรุปขั้นตอนจาก {doc_id} และใส่อ้างอิง"),
}


def fake_generate(prompt_text: str) -> str:
    if "expense#03" in prompt_text:
        return "ส่งใบเสร็จภายใน 30 วัน [expense#03]"
    return "ไม่พบข้อมูลในเอกสาร"


def instrumented_answer(client: MockLangfuse, *, label: str = "production",
                        evidence: bool = True) -> str:
    with client.observe("rag.answer") as root:
        prompt = PROMPTS[label]
        with client.observe("rag.retrieve") as retrieval:
            doc_id = "expense#03" if evidence else None
            retrieval.metadata["hits"] = int(doc_id is not None)

        with client.observe("rag.generate", "generation") as generation:
            answer = fake_generate(prompt.compile(doc_id or "none"))
            generation.metadata.update(
                model="mock-thai-mini",
                prompt_version=prompt.version,
                input_tokens=420,
                output_tokens=38,
            )

        # A fixture-specific citation check, not a faithfulness judge.
        score = float(doc_id is not None and f"[{doc_id}]" in answer)
        client.score_trace("citation_present", score)
        root.metadata["has_citation"] = bool(score)
        return answer`,
        },
      },
      {
        title: "3 · ทดลอง candidate และตรวจ row ownership",
        explain: "ใส่ label candidate แล้วดูว่าแถว generation มี version สี่ และคะแนนอ้างถึง id หนึ่งของ root ตัวอย่างนี้พิมพ์ข้อมูลที่คงที่เพื่อเทียบง่าย ส่วนเวลาจริงอ่านด้วยสคริปต์ใน Concept 1",
        code: {
          language: "python",
          filename: "rag_observations.py",
          code: `def main() -> None:
    client = MockLangfuse()
    print(instrumented_answer(client, label="candidate"))
    for row in client.rows:
        parent = row.parent_id if row.parent_id is not None else "root"
        print(row.id, parent, row.kind, row.name, row.metadata)
    print(client.scores)


if __name__ == "__main__":
    main()`,
        },
        output: `ส่งใบเสร็จภายใน 30 วัน [expense#03]
1 root span rag.answer {'has_citation': True}
2 1 span rag.retrieve {'hits': 1}
3 1 generation rag.generate {'model': 'mock-thai-mini', 'prompt_version': 4, 'input_tokens': 420, 'output_tokens': 38}
[(1, 'citation_present', 1.0)]`,
      },
    ],
    gotcha: "Stack ของ mock ใช้ list เดียว จึงใช้กับ synchronous requests ทีละรายการตามแลบ ส่วน SDK จริงจัด active context ผ่าน OpenTelemetry",
  },

  practice: {
    intro: "เพิ่ม short-circuit สำหรับ retrieval ว่างหลังออกจาก child span และตรวจว่า trace ยังปิดครบโดยไม่มี generation หรือคะแนน citation_present สำหรับเคสนี้",
    requirements: [
      "คง root และ retrieval ในทุกกรณี ตั้ง hits เป็นศูนย์เมื่อไม่มีหลักฐาน",
      "ถ้าไม่มีหลักฐานให้ตั้ง abstained เป็นจริงและคืนคำตอบว่า ไม่พบข้อมูลในเอกสาร ทันที",
      "ถ้าพบหลักฐานให้ใช้ label, บันทึก prompt_version และ usage ของ generation เหมือนตัวอย่าง",
      "ให้คะแนน citation_present เฉพาะเส้นทางที่เรียกโมเดล และยืนยันว่า score ชี้ root ID",
    ],
    starter: {
      language: "python",
      filename: "rag_observations.py",
      code: `${setupCode}

@dataclass(frozen=True)
class Prompt:
    version: int
    template: str

    def compile(self, doc_id: str) -> str:
        return self.template.format(doc_id=doc_id)


PROMPTS = {
    "production": Prompt(3, "อ้างอิงเอกสาร {doc_id} ตอบเรื่องเบิกค่าเดินทาง"),
    "candidate": Prompt(4, "สรุปขั้นตอนจาก {doc_id} และใส่อ้างอิง"),
}


def fake_generate(prompt_text: str) -> str:
    if "expense#03" in prompt_text:
        return "ส่งใบเสร็จภายใน 30 วัน [expense#03]"
    return "ไม่พบข้อมูลในเอกสาร"


def instrumented_answer(client: MockLangfuse, *, label: str = "production",
                        evidence: bool = True) -> str:
    # TODO: always trace retrieval, branch on evidence, then score on root.
    raise NotImplementedError("add observations and handle empty retrieval")`,
    },
    verification: {
      language: "python",
      filename: "test_rag_observations.py",
      code: testCode,
    },
    selfCheck: [
      "กรณีมีหลักฐานได้สามแถวและ score หนึ่งรายการ",
      "กรณีไม่มีหลักฐานปิด spans สองแถวและไม่มี score ของ citation_present",
      "รันสองคำขอต่อกันแล้ว root ID แยกกัน",
    ],
    acceptance: "ผ่าน pytest ครบสี่เคสรวม label สองค่าและแยก trace ได้เมื่อใช้ client เดิม",
    hints: [
      { body: "หลังปิด retrieval span ให้ตัดสินใจจาก doc_id ถ้าไม่มีหลักฐานให้บันทึกผลที่ root และ return ภายในบล็อกนั้น" },
      { body: "ใช้ with client.observe ที่เป็น active root ครอบทั้งสอง child และเรียก score_trace หลังออกจาก generation เพื่ออ่านโค้ดตามลำดับงาน" },
      {
        body: "เฉลยเต็มรวมชุดทดสอบ แยกสองส่วนตามชื่อไฟล์ rag_observations.py และ test_rag_observations.py ก่อนรัน pytest",
        code: {
          language: "python",
          filename: "rag_observations.py / test_rag_observations.py",
          code: `# rag_observations.py
${setupCode}


@dataclass(frozen=True)
class Prompt:
    version: int
    template: str

    def compile(self, doc_id: str) -> str:
        return self.template.format(doc_id=doc_id)


PROMPTS = {
    "production": Prompt(3, "อ้างอิงเอกสาร {doc_id} ตอบเรื่องเบิกค่าเดินทาง"),
    "candidate": Prompt(4, "สรุปขั้นตอนจาก {doc_id} และใส่อ้างอิง"),
}


def fake_generate(prompt_text: str) -> str:
    if "expense#03" in prompt_text:
        return "ส่งใบเสร็จภายใน 30 วัน [expense#03]"
    return "ไม่พบข้อมูลในเอกสาร"


def instrumented_answer(client: MockLangfuse, *, label: str = "production",
                        evidence: bool = True) -> str:
    with client.observe("rag.answer") as root:
        prompt = PROMPTS[label]
        with client.observe("rag.retrieve") as retrieval:
            doc_id = "expense#03" if evidence else None
            retrieval.metadata["hits"] = int(doc_id is not None)

        if doc_id is None:
            root.metadata.update(abstained=True, has_citation=False)
            return "ไม่พบข้อมูลในเอกสาร"

        with client.observe("rag.generate", "generation") as generation:
            answer = fake_generate(prompt.compile(doc_id))
            generation.metadata.update(
                model="mock-thai-mini",
                prompt_version=prompt.version,
                input_tokens=420,
                output_tokens=38,
            )

        # A fixture-specific citation check, not a faithfulness judge.
        score = float(f"[{doc_id}]" in answer)
        client.score_trace("citation_present", score)
        root.metadata["has_citation"] = bool(score)
        return answer


def main() -> None:
    client = MockLangfuse()
    print(instrumented_answer(client, label="candidate"))
    for row in client.rows:
        parent = row.parent_id if row.parent_id is not None else "root"
        print(row.id, parent, row.kind, row.name, row.metadata)
    print(client.scores)


if __name__ == "__main__":
    main()

# test_rag_observations.py — copy the block below into its own file

${testCode}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run python rag_observations.py
uv run pytest -q`,
    },
  },

  mistakes: [
    {
      title: "เก็บเฉพาะ label",
      symptom: "เมื่อ production ย้ายแล้วตาม prompt ที่เคสเดิมใช้ไม่ได้",
      fix: "เก็บ version จริงหรือลิงก์ prompt object ที่ generation",
    },
    {
      title: "ใช้ span ทั่วไปแทน generation",
      symptom: "Dashboard แยก token กับรุ่นโมเดลตามชนิด observation ไม่ได้ตามที่ตั้งใจ",
      fix: "ใช้ as_type เป็น generation สำหรับงานเรียกโมเดล",
    },
    {
      title: "ให้คะแนนหลังออกจาก context",
      symptom: "score_current_trace ไม่มี active context ที่ควรผูก",
      fix: "ให้คะแนนใน root หรือส่ง trace ID เมื่อ feedback มาทีหลัง",
    },
    {
      title: "อิง citation marker แล้วสรุปว่า grounded",
      symptom: "คำตอบอาจอ้างถึงเอกสารที่ไม่ได้รองรับข้อความ",
      fix: "ใช้คะแนนนี้ตามนิยาม และเพิ่ม groundedness eval ตาม D129",
    },
  ],

  quiz: {
    intro: "ใช้ภาพ waterfall และ prompt labels ช่วยหาแหล่งที่มาของผลลัพธ์ก่อนเลือกคำตอบ",
    questions: [
      mc(
        "d134-q1",
        "ข้อมูลอะไรช่วยระบุ prompt ที่ request ใช้ได้แม้ label ถูกย้าย?",
        [
          ["เวลาที่เปิด dashboard","เวลาเปิด UI ไม่ระบุ revision"],
          ["ชื่อ service","Service หนึ่งใช้ prompt ได้หลาย revision"],
          ["Prompt version ใน generation","version บอก revision ที่ใช้จริง"],
          ["ชื่อ model อย่างเดียว","โมเดลเดียวรับได้หลาย prompt"],
        ],
        "C",
        "Label มีหน้าที่ routing รุ่นปัจจุบัน ส่วน version อธิบายประวัติที่เคยเกิดขึ้น",
        "ควรเก็บ prompt label กับ version เพื่ออะไร?",
        "Label ใช้ rollout และ version ใช้ย้อนดูรุ่นจริงของคำขอ",
      ),
      mc(
        "d134-q2",
        "Observation ชนิดใดเหมาะกับการอ่าน token usage ของการเรียกโมเดล?",
        [
          ["generation","มีฟิลด์ model และ usage ของ LLM call"],
          ["retriever","ใช้กับขั้นค้นเอกสาร"],
          ["trace score","เก็บผลประเมิน"],
          ["prompt label","ชี้ version"],
        ],
        "A",
        "Generation เป็นชนิดเฉพาะงานเรียกโมเดล ทำให้ค้นและวัด usage ได้ตามหน้าที่",
        "Generation มีข้อมูลใดเพิ่มจาก span ทั่วไป?",
        "Model, token usage และ prompt lineage ใช้กับการเรียกโมเดล",
      ),
      mc(
        "d134-q3",
        "คะแนน citation_present เท่ากับหนึ่งยืนยันอะไร?",
        [
          ["ผู้ใช้พอใจ","ยังไม่มี feedback"],
          ["ข้ออ้างทุกข้อได้รับการรองรับ","ยังไม่ได้ตรวจเนื้อหาของหลักฐาน"],
          ["Retrieval recall เท่ากับหนึ่ง","ยังไม่ได้เทียบรายการเฉลยทั้งหมด"],
          ["พบป้ายอ้างอิงที่ตรงกับ fixture","ตรงกับเงื่อนไขของ scorer ในบท"],
        ],
        "D",
        "Scorer ตรวจการมีป้ายตาม fixture ถ้าจะตรวจ claim ให้วัด faithfulness เพิ่ม",
        "คะแนน citation_present บอก groundedness ทั้งหมดหรือไม่?",
        "ตรวจการมีป้ายเท่านั้น ต้องประเมินเนื้อหาข้ออ้างแยก",
      ),
      mc(
        "d134-q4",
        "ถ้า feedback เข้ามาหลัง request จบ จะผูกกับคำขอเดิมอย่างไร?",
        [
          ["ให้คะแนน current trace ตัวใหม่","จะผูกผิดคำขอ"],
          ["ใช้ trace ID เดิมกับ API สร้าง score","ระบุปลายทางของคะแนนชัดเจน"],
          ["หา trace ล่าสุดของทั้งระบบ","อาจเป็นคำขอของคนอื่น"],
          ["ใช้ prompt version เป็น ID","version เดียวแชร์หลาย trace"],
        ],
        "B",
        "เก็บ trace ID เพื่อส่ง score แบบ asynchronous ภายหลัง",
        "คะแนนที่มาทีหลังต้องมีอะไร?",
        "Trace ID ของคำขอเดิม และอาจมี observation ID ถ้าให้คะแนนขั้นเดียว",
      ),
    ],
  },

  takeaways: [
    "อ่านแถวจาก root ไป child เพื่อหา operation แล้วใช้แกนเวลาอ่าน overlap",
    "เก็บ prompt version จริงเพื่อเชื่อม rollout และผลประเมิน",
    "ผูก score กับระดับที่วัดและเขียนนิยาม metric ให้ชัด",
    "D135 จะรวม latency, token และ cost จากหลายคำขอพร้อมกติกาแจ้งเตือน",
  ],

  reviewCards: [
    rc(
      "d134-rc1",
      "Langfuse generation ควรมีข้อมูลอะไร?",
      "รุ่นโมเดล token usage และ prompt version ที่สัมพันธ์กับการเรียก",
    ),
    rc(
      "d134-rc2",
      "ทำไมต้อง flush ใน CLI สั้น ๆ?",
      "เพื่อส่งข้อมูลที่อยู่ใน buffer ก่อน process จบ",
    ),
    rc(
      "d134-rc3",
      "กรณี abstain วัดอะไรได้บ้าง?",
      "เก็บสถานะ abstained และวัดความถูกต้องของ abstention ด้วยนิยามคะแนนเฉพาะ",
    ),
  ],

  sources: [
    {
      label: "Langfuse · Get Started with LLM Tracing",
      href: "https://langfuse.com/docs/observability/get-started",
    },
    {
      label: "Langfuse · Observation Types",
      href: "https://langfuse.com/docs/observability/features/observation-types",
    },
    {
      label: "Langfuse · Link Prompts to Traces",
      href: "https://langfuse.com/docs/prompt-management/features/link-to-traces",
    },
    {
      label: "Langfuse · Python API Reference",
      href: "https://python.reference.langfuse.com/langfuse",
    },
  ],

  glossary: [
    "langfuse",
    "rag",
    "llm",
    "otel",
    "prompt-versioning",
    "ragas",
  ],
});
