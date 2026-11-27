import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const promptVariable = (name: string) => `{{ ${name} }}`;

const policyPrompt = `ตอบคำถามภาษาไทยโดยยึดหลักฐานของร้าน
เมื่อไม่มีหลักฐาน ให้ตอบว่าไม่พบข้อมูล
คำถาม: ${promptVariable("question")}
หลักฐาน: ${promptVariable("evidence")}
รหัสอ้างอิง: ${promptVariable("citation")}
`;

const provider = `from typing import Literal

from pydantic import BaseModel, ConfigDict, ValidationError, model_validator


ABSTAIN = "ไม่พบข้อมูล"
ABSTAIN_RULE = "เมื่อไม่มีหลักฐาน ให้ตอบว่าไม่พบข้อมูล"


class FixtureInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    question: str
    evidence: str
    citation: str

    @model_validator(mode="after")
    def check_context_pair(self) -> "FixtureInput":
        if not self.question:
            raise ValueError("question is required")
        if bool(self.evidence) != bool(self.citation):
            raise ValueError("evidence and citation must be present together")
        return self


class RagReply(BaseModel):
    status: Literal["answered", "abstained"]
    answer: str
    citations: list[str]


def generate_reply(prompt: str, case: FixtureInput, model: str) -> RagReply:
    if model not in {"grounded", "eager"}:
        raise ValueError(f"unknown model: {model}")
    if case.evidence:
        return RagReply(
            status="answered",
            answer=case.evidence,
            citations=[case.citation],
        )

    # The fake inspects the rendered instruction above the question.
    policy = prompt.partition("\\nคำถาม:")[0]
    if model == "grounded" and ABSTAIN_RULE in policy.splitlines():
        return RagReply(status="abstained", answer=ABSTAIN, citations=[])

    return RagReply(status="answered", answer="เปลี่ยนฟรีทุกกรณี", citations=[])


def call_api(prompt: str, options: dict, context: dict) -> dict:
    try:
        variables = context.get("vars", {})
        case = FixtureInput.model_validate({
            name: variables.get(name)
            for name in ("question", "evidence", "citation")
        })
        model = options.get("config", {}).get("model", "grounded")
        reply = generate_reply(prompt, case, model)
    except (ValidationError, ValueError):
        return {"error": "invalid fixture or fake model configuration"}
    return {"output": reply.model_dump_json()}
`;

const exampleConfig = `description: Thai Knowledge RAG return and warranty regression
prompts:
  - file://rag_prompt.txt
providers:
  - id: file://rag_provider.py
    label: baseline-grounded
    config:
      model: grounded
  - id: file://rag_provider.py
    label: candidate-eager
    config:
      model: eager
defaultTest:
  assert:
    - type: is-json
      value:
        type: object
        additionalProperties: false
        required: [status, answer, citations]
        properties:
          status:
            enum: [answered, abstained]
          answer:
            type: string
            minLength: 1
          citations:
            type: array
            items:
              type: string
tests:
  - description: return-window
    vars:
      question: คืนสินค้าภายในกี่วัน
      evidence: คืนสินค้าได้ภายใน 7 วัน
      citation: '[returns#window]'
    assert:
      - type: equals
        value:
          status: answered
          answer: คืนสินค้าได้ภายใน 7 วัน
          citations: ['[returns#window]']
  - description: warranty-screen
    vars:
      question: ประกันครอบคลุมจอแตกไหม
      evidence: ประกันไม่ครอบคลุมจอแตกจากการตกหล่น
      citation: '[warranty#damage]'
    assert:
      - type: contains
        value: ประกันไม่ครอบคลุมจอแตกจากการตกหล่น
      - type: contains
        value: '[warranty#damage]'
      - type: not-contains
        value: เปลี่ยนฟรี
  - description: member-discount-unknown
    vars:
      question: สมาชิกใหม่ลดเพิ่มกี่เปอร์เซ็นต์
      evidence: ''
      citation: ''
    assert:
      - type: equals
        value:
          status: abstained
          answer: ไม่พบข้อมูล
          citations: []
`;

const practiceCase = `  - description: return-shipping-unknown
    vars:
      question: return สินค้าออนไลน์ต้องจ่ายค่าส่งไหม
      evidence: ''
      citation: ''
    assert:
      - type: equals
        value:
          status: abstained
          answer: ไม่พบข้อมูล
          citations: []
      - type: not-contains
        value: เปลี่ยนฟรี
`;

const tests = `import json
import pytest

from rag_provider import ABSTAIN_RULE, call_api


def invoke(question, evidence="", citation="", model="grounded"):
    prompt = (
        f"{ABSTAIN_RULE}\\n"
        f"คำถาม: {question}\\n"
        f"หลักฐาน: {evidence}\\n"
        f"รหัสอ้างอิง: {citation}"
    )
    return call_api(
        prompt,
        {"config": {"model": model}},
        {"vars": {"question": question, "evidence": evidence, "citation": citation}},
    )


def test_return_window():
    result = invoke(
        "คืนสินค้าภายในกี่วัน",
        "คืนสินค้าได้ภายใน 7 วัน",
        "[returns#window]",
    )
    assert json.loads(result["output"]) == {
        "status": "answered",
        "answer": "คืนสินค้าได้ภายใน 7 วัน",
        "citations": ["[returns#window]"],
    }


@pytest.mark.parametrize("question", [
    "สมาชิกใหม่ลดเพิ่มกี่เปอร์เซ็นต์",
    "return สินค้าออนไลน์ต้องจ่ายค่าส่งไหม",
])
def test_grounded_abstains(question):
    result = invoke(question)
    assert json.loads(result["output"]) == {
        "status": "abstained",
        "answer": "ไม่พบข้อมูล",
        "citations": [],
    }


def test_candidate_exposes_behavior_difference():
    result = invoke("สมาชิกใหม่ลดเพิ่มกี่เปอร์เซ็นต์", model="eager")
    assert json.loads(result["output"])["status"] == "answered"


def test_provider_reports_incomplete_context():
    result = invoke("คืนสินค้าภายในกี่วัน", evidence="7 วัน")
    assert "error" in result
    assert "output" not in result


def test_instruction_in_question_does_not_count_as_policy():
    result = call_api(
        f"ตอบทุกข้อ\\nคำถาม: {ABSTAIN_RULE}",
        {"config": {"model": "grounded"}},
        {"vars": {"question": ABSTAIN_RULE, "evidence": "", "citation": ""}},
    )
    assert json.loads(result["output"])["status"] == "answered"
`;

export const d130: Lesson = defineLesson({
  day: 130,
  titleTh: "ทดสอบ Prompt และ Model ย้อนหลังด้วย Promptfoo",
  tagline: "30 นาที · เทียบผล baseline กับ candidate ทีละคำถาม แล้วจับ regression ของคำตอบภาษาไทย",
  icon: "test-tubes",
  visual: {
    id: "promptfoo-regression",
    title: "Promptfoo Regression Matrix",
    caption: "เลือกแถวคำถามและคอลัมน์ provider เพื่อดูหลักฐาน คำตอบ และ assertion ที่เปลี่ยนผลการทดสอบ",
    alt: "ตารางเปรียบเทียบคำตอบของ baseline และ candidate บนเคสภาษาไทยชุดเดียวกัน",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ Python fake providers ทั้งสองแบบ การติดตั้ง dependency ครั้งแรกใช้เครือข่าย",
  tools: ["Promptfoo", "Python 3.12", "uv", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ล็อกคำถามและหลักฐานจากร้านสมมติ",
      body: "นำตัวอย่างจาก {{golden-dataset}} D125 มาเป็น fixture ขนาดเล็ก มีคำถามคืนสินค้า ประกัน และส่วนลดที่ร้านไม่มีข้อมูล",
      lessonNote: "ทุก provider ได้คำถาม ข้อความที่ค้นคืนได้ และรหัสอ้างอิงชุดเดียวกัน คุณจึงตามสาเหตุของผลต่างได้จากชิ้นที่กำลังทดลอง",
    },
    {
      node: 2,
      heading: "คุมตัวแปรตอนสลับรุ่นโมเดลหรือ prompt",
      body: "ใช้ prompt เดียวเปรียบเทียบ fake สองแบบ แบบ grounded ทำตามคำสั่งให้งดตอบเมื่อขาดหลักฐาน ส่วน eager ตอบเดาสำหรับเคสเดียวกัน",
      lessonNote: "ถ้าต้องการวัดผลการแก้ prompt ให้ถือ provider คงที่แล้วสลับไฟล์ prompt ใช้หลัก {{prompt-versioning}} จาก D91 เพื่อย้อนกลับได้",
    },
    {
      node: 3,
      heading: "แปลงสัญญาของคำตอบเป็น assertion ที่อ่านได้",
      body: "D129 ใช้ {{ragas}} แยก retrieval ออกจาก generation วันนี้ {{promptfoo}} เทียบพฤติกรรมตามเงื่อนไขรายเคส เช่น โครง JSON และการคืนค่าไม่พบข้อมูล",
      lessonNote: "เคสที่ไม่มีเอกสารจะผ่านเมื่อได้สถานะ abstained ข้อความตามสัญญา และ citations ว่างครบทุกข้อ",
    },
    {
      node: 6,
      heading: "เก็บหลักฐานก่อนเปลี่ยนค่าเริ่มต้นของบริการ",
      body: "อ่านผลรายแถวแล้วเก็บ JSON ไว้เปรียบเทียบในรอบถัดไป พรุ่งนี้จะเอา assertion ของ baseline ขึ้น PR gate ในโครงการ Thai Knowledge RAG/Agent",
      lessonNote: "เมื่อ candidate ตอบเดา เคสที่พังต้องยังอยู่ในชุด eval จนกว่าจะซ่อมและรันทวนได้",
    },
  ],

  objectives: [
    "เขียน `promptfooconfig.yaml` ที่ประกอบด้วย prompt, providers, vars และ assertions สำหรับ Thai Knowledge RAG ได้",
    "ต่อ Python provider เข้ากับ Promptfoo และตรวจสัญญา input/output ผ่าน {{pydantic}} กับ {{pytest}}",
    "เทียบ baseline กับ candidate ทีละเคส แยก assertion fail ออกจาก provider error และเลือกชุดรันสำหรับ CI วันถัดไป",
  ],
  prerequisites: [
    "D91 จัดเก็บ prompt เป็นไฟล์และติดตามเวอร์ชัน",
    "D105–D106 อ้างอิงหลักฐานและคืนคำตอบแบบ {{abstention}}",
    "D121–D124 ประกอบและทดสอบ Thai Knowledge RAG/Agent ด้วยคำถามภาษาไทย",
    "D125–D126 สร้าง golden dataset และ deterministic checks",
    "D127–D129 อ่านผล judge ที่ผ่าน calibration และแยกคะแนน RAG Triad",
  ],

  setup: {
    intro: "ใช้โฟลเดอร์ทดลอง `thai-rag-eval` กับ Python 3.12 และ Node.js 22.22 ขึ้นไปในสาย 22 เปิด terminal ที่ root เดียวกันสำหรับทุกคำสั่ง",
    commands: `uv init --python 3.12 thai-rag-eval
cd thai-rag-eval
uv add "pydantic>=2,<3"
uv add --dev pytest
npm init -y
npm install --save-dev --save-exact promptfoo@0.126.0
uv run python --version
node --version
npx --no-install promptfoo --version`,
    steps: [
      ["python", "มี `pyproject.toml`, `uv.lock` และ Python 3.12"],
      ["node", "มี `package.json` และ `package-lock.json` ที่ล็อก Promptfoo 0.126.0"],
      ["files", "บันทึก prompt, provider และ config จากตัวอย่างลง root เป็น UTF-8"],
    ],
    note: "ใช้ fixture สังเคราะห์และ commit lockfiles ทั้งคู่ คำสั่ง Promptfoo ใช้ uv run npx บน Bash หากใช้ PowerShell หรือ Command Prompt บน Windows ให้ใช้ uv run npx.cmd แทน",
  },

  concepts: [
    {
      id: "controlled-matrix",
      title: "1 · ตารางทดลองที่คุมตัวแปรได้",
      paragraphs: [
        "Promptfoo สร้างการรันจาก **prompt × provider × test case** ชื่อ provider ที่ชัดช่วยให้เห็นทันทีว่าเซลล์ที่ตกเป็นผลของโมเดลแบบไหน เคสสามแถวกับหนึ่ง prompt และสอง provider จึงได้หกผล",
        "D125 มีชุดข้อมูลหลักขนาดใหญ่กว่า ให้เลือกเคสตอบได้ เคสภาษาไทยผสมอังกฤษ และเคสที่ฐานความรู้ตอบไม่ได้มาทำชุด smoke ก่อน Field `evidence` ในแลบนี้เป็นผลค้นคืนที่ตรึงไว้ ส่วนคำตอบเฉลยอยู่ฝั่ง `assert`",
        "เคสคืนสินค้าครบทั้งนโยบายและ citation เคสจอแตกตรวจถ้อยคำเชิงปฏิเสธ และเคสส่วนลดทดสอบทางเบี่ยงที่ผู้ใช้ถามนอกคลังเอกสาร ทั้งสามแถวสะท้อนสัญญาระบบที่ต่างกัน",
      ],
      analogy: "เหมือนเปิด browser สองตัวบนหน้า checkout เดียวกัน ใช้ตะกร้าชุดเดียวแล้วดูว่า browser ไหนแสดงยอดผิด",
      code: {
        language: "text",
        filename: "rag_prompt.txt",
        code: policyPrompt,
        caption: "แยกคำสั่งจากข้อความหลักฐานให้เห็นชัด และ track ไฟล์ prompt ใน Git",
      },
      whyTitle: "เก็บเงื่อนไขการทดลองให้เทียบผลซ้ำได้",
      whyParagraphs: [
        "ถ้าเปลี่ยน prompt และ model พร้อมกับแก้ชุดข้อสอบ คะแนนที่ต่างกันจะบอกได้แค่ว่าทั้งระบบเปลี่ยน จัดรอบเทียบ prompt และรอบเทียบ model คนละชุด เก็บชื่อไฟล์ รุ่น provider และจำนวนแถวคู่กับรายงาน",
        "แลบนี้ตรึง evidence เพื่อมอง generation แบบเดี่ยว เมื่อต่อระบบจริง รัน retrieval eval ของ D126 และ RAG Triad ของ D129 คู่กันเพื่อเห็นว่าคำตอบเสียตั้งแต่ดึงเอกสารหรือซ่อมที่ prompt ได้",
      ],
    },
    {
      id: "python-provider-contract",
      title: "2 · Python provider ห่อเส้นทางตอบของ RAG",
      paragraphs: [
        "`call_api(prompt, options, context)` รับ prompt ที่แทนตัวแปรแล้ว รุ่น fake จาก `options.config.model` และ fixture จาก `context.vars` ผู้เรียนเปลี่ยนส่วน `generate_reply` ไปเรียก entry point ของ Thai Knowledge RAG ได้ในรอบต่อยอด",
        "เมื่อมีหลักฐาน fake ส่งข้อความนั้นกลับพร้อม citation เมื่อไม่มีหลักฐาน grounded จะคืน abstention ก็ต่อเมื่อพบบรรทัดคำสั่งตรงตามที่กำหนดเหนือส่วนคำถาม ส่วน eager จำลองพฤติกรรมตอบเดา",
        "ตอบกลับด้วย dict มี `output` เมื่อประมวลผลสำเร็จ และ `error` เมื่อ fixture หรือ provider config ผิด รูปแบบ JSON ของคำตอบจริงเป็น string ภายใน `output` เพื่อให้ Promptfoo ใช้ assertion แบบ JSON ได้",
      ],
      analogy: "เหมือน adapter สำหรับ payment sandbox ที่แปลง test request เป็นคำสั่งเรียก service และคืน response ตามสัญญาเดียวกับระบบจริง",
      code: {
        language: "python",
        filename: "rag_provider.py",
        code: provider,
      },
      whyTitle: "แยกความเสียหายของระบบออกจากข้อมูลทดสอบที่ผิดรูป",
      whyParagraphs: [
        "ถ้าส่ง evidence แต่ลืม citation ตัว validator จะให้ provider error ให้กลับไปซ่อม fixture ก่อน ค่า error ที่แยกชัดช่วยให้ทีมรู้ว่าคะแนนของแถวนั้นยังใช้ตัดสินการเปลี่ยนโมเดลไม่ได้",
        "pytest เรียกฟังก์ชันด้วย prompt fixture ที่กำหนดในเทสต์ได้โดยตรง ส่วน Promptfoo ตรวจการประกอบ YAML การ render ไฟล์ prompt ของ commit ปัจจุบัน และผลจาก provider ทั้งชุด",
      ],
    },
    {
      id: "assertion-design",
      title: "3 · เลือก assertion ให้ตรงกับความเสียหายที่ต้องจับ",
      paragraphs: [
        "`defaultTest.assert` ตรวจ JSON Schema ทุกแถว ส่วน `tests[].assert` เพิ่มเงื่อนไขเชิงธุรกิจ ใช้ `equals` กับ object เมื่อต้องการสัญญาคงที่ เช่น ข้อความ fallback และรายการ citation ว่าง",
        "`contains` ตรวจคำหลักหรือ citation ที่คาดไว้ในข้อความ JSON และ `not-contains` จับข้ออ้างที่ร้านไม่ได้ให้ไว้ สำหรับระบบจริงที่สำนวนยืดหยุ่น ควรแตก field และตรวจค่าที่จำเป็น เช่น รหัส citation ที่อยู่ใน retrieved set",
        "เกณฑ์ exact ของร้านตัวอย่างตั้งใจให้ fallback มีประโยคเดียว คำตอบจริงอาจกล่าวได้หลายแบบ อย่าเปลี่ยนทุกคำตอบภาษาไทยให้เป็น snapshot ยาว เพราะการปรับสำนวนจะทำให้ตกแทบทุกแถวแม้ข้อเท็จจริงยังถูก",
      ],
      analogy: "เหมือนทดสอบ response API โดยตรวจ field ที่ client ใช้งานจริง แล้วเพิ่มเคสเฉพาะสำหรับข้อความที่กระทบลูกค้า",
      code: {
        language: "yaml",
        filename: "promptfooconfig.yaml",
        code: exampleConfig,
      },
      whyTitle: "ตรวจภาษาไทยทั้งโครงสร้าง เงื่อนไข และความหมาย",
      whyParagraphs: [
        "แค่พบคำว่า เปลี่ยนฟรี ยังตัดสินความหมายไม่ได้ ประโยคที่มีคำปฏิเสธอาจกล่าวถึงคำนี้ได้ ตัวอย่างใช้ negative assertion เป็น guard เฉพาะ fixture และใช้ expected phrase เต็มที่เคสจอแตก",
        "เมื่อเลื่อนจาก smoke test ไปประเมินการสรุปหลายหลักฐาน ให้เติมผล {{llm-as-a-judge}} ที่ผ่านการปรับเทียบจาก D128 และอ่านคู่กับ case ID ที่ deterministic gate ตรวจได้ทันที",
      ],
    },
    {
      id: "compare-and-read",
      title: "4 · รันเปรียบเทียบและเลือก provider ที่จะ gate",
      paragraphs: [
        "รันทุก provider เมื่อต้องการเห็นการเทียบ A/B และ export รายงานไว้ในเครื่อง รันเฉพาะ `baseline-grounded` เมื่อต้องการตั้งด่านของค่าที่บริการใช้อยู่",
        "เมื่อแก้ template ให้รันด้วย provider เดิมแล้วใช้ชื่อรายงานคนละไฟล์ คำสั่งตัวอย่างใช้ `--no-cache` เพื่อเรียก Python ใหม่ทุกครั้ง แม้แก้ implementation ภายใต้ชื่อ provider เดิม",
      ],
      analogy: "เหมือน matrix builds ที่มี runtime รุ่นทดลองกับ runtime ที่ทีมรองรับ ให้ผลทั้งสองอยู่ในรายงานเดียวแล้วเลือกสถานะที่มีผลต่อ merge",
      code: {
        language: "bash",
        filename: "terminal",
        code: `uv run npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o comparison.json
uv run npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache --filter-providers "^baseline-grounded$" -o baseline.json`,
      },
      whyTitle: "candidate ที่ตกชี้งานที่ต้องซ่อมก่อนสลับค่าเริ่มต้น",
      whyParagraphs: [
        "ถ้า candidate ผ่านเคสคืนสินค้าและประกันแต่ตอบเดาส่วนลด ให้เปิดดู assertion ที่ตกและเทียบ output กับ baseline ในแถวเดียวกัน การเก็บชื่อเคสทำให้ rerun หลังซ่อมและอธิบายเหตุผลใน PR ได้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · จาก API Contract Test สู่ AI Regression Test",
      body: [
        "ทั้งสองระบบต้องยืนยันสัญญาที่ผู้ใช้พึ่งพา สำหรับ RAG ให้แยก response schema ออกจาก policy และตรวจเคสสำคัญที่ผู้ใช้ถามด้วยภาษาแบบงานจริง",
        "เมื่อเอาไปต่อกับบริการ Phase 4 ให้ provider เรียกเส้นทางที่บริการใช้งานจริง แล้ว stub ส่วนค้นคืนหรือ model เป็นจุด ๆ ตามสิ่งที่ต้องการวัด",
      ],
      table: [
        ["Fixture ของ endpoint", "คำถาม ข้อความหลักฐาน และรหัสเอกสารของเคส"],
        ["Contract test", "JSON Schema ตรวจ keys และชนิดของค่า"],
        ["Matrix ของ browser หรือ runtime", "Promptfoo matrix ของ prompt และ provider"],
        ["Approval ก่อนเปลี่ยน feature flag", "เทียบ case-level delta ก่อนย้าย candidate เป็น baseline"],
      ],
    },
    student: {
      title: "First-Year Note · เปลี่ยนทีละตัวแปรแล้วอ่านทีละแถว",
      body: [
        "ให้สองคนดูคำถามและหน้าคู่มือชุดเดียวกัน แล้วดูว่าทั้งคู่จัดการอย่างไรเมื่อหน้าที่ต้องใช้หายไป prompt คือกติกาในการสอบ provider คือคนที่ตอบ และ assertion คือเงื่อนไขของข้อสอบ",
        "ลองอ่านค่าจากแถวส่วนลดก่อน ถ้าได้ข้อความตอบอย่างมั่นใจทั้งที่ช่องหลักฐานว่าง คุณระบุปัญหาได้โดยยังไม่ต้องดูคะแนนเฉลี่ยทั้งชุด",
      ],
    },
  },

  workedExample: {
    intro: "เพิ่ม regression suite ของร้านตัวอย่างลงข้าง Thai Knowledge RAG แล้วพิสูจน์ว่าเคสส่วนลดแยก baseline ออกจาก candidate ได้",
    steps: [
      {
        title: "1 · เขียน prompt และต่อ provider เข้ากับ Python",
        explain: "คัดลอก `rag_prompt.txt` กับ `rag_provider.py` จาก Concept 1 และ 2 มาไว้ที่ root สั่งเรียก provider ตรง ๆ ด้วยหลักฐานว่างเพื่อดูกลไกของ fallback",
        code: {
          language: "python",
          filename: "check_provider.py",
          code: `from pathlib import Path

from rag_provider import call_api


case = {
    "question": "สมาชิกใหม่ลดเพิ่มกี่เปอร์เซ็นต์",
    "evidence": "",
    "citation": "",
}
prompt = Path("rag_prompt.txt").read_text(encoding="utf-8")
for key, value in case.items():
    prompt = prompt.replace("{{ " + key + " }}", value)
result = call_api(prompt, {"config": {"model": "grounded"}}, {"vars": case})
print(result["output"])`,
        },
        output: `{"status":"abstained","answer":"ไม่พบข้อมูล","citations":[]}`,
      },
      {
        title: "2 · รัน matrix แบบตั้งใจให้ candidate ตก",
        explain: "บันทึก YAML ของ Concept 3 เป็น `promptfooconfig.yaml` แล้วรันทุก provider ผลสรุปด้านล่างย่อจาก matrix ปกติ CLI คืน exit code 100 เพราะมีเคสที่ assertion ไม่ผ่าน",
        code: {
          language: "bash",
          filename: "terminal",
          code: `uv run npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o comparison.json`,
        },
        output: `case                     baseline-grounded   candidate-eager
return-window            PASS                PASS
warranty-screen          PASS                PASS
member-discount-unknown  PASS                FAIL
5 passed, 1 failed`,
      },
      {
        title: "3 · ตั้งคำสั่งรัน baseline สำหรับ CI",
        explain: "กรองด้วย label แบบตรงชื่อเพื่อได้สามแถวของ provider ที่เลือก สังเกตว่าผลยังทดสอบ fallback เหมือนเต็มชุด พรุ่งนี้จะใช้คำสั่งนี้ตรวจ PR",
        code: {
          language: "bash",
          filename: "terminal",
          code: `uv run npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache --filter-providers "^baseline-grounded$" -o baseline.json`,
        },
        output: `baseline-grounded · 3 passed, 0 failed, 0 errors · exit 0`,
      },
    ],
    gotcha: "เปิด `comparison.json` หรืออ่านตารางใน terminal แล้วแยก FAIL ที่มาจาก assertion กับ ERROR ที่มาจาก provider ถ้า ERROR ทุกแถว ให้เช็กว่า Promptfoo เรียก Python จาก venv ที่มี Pydantic และ YAML อยู่ข้างไฟล์ `rag_provider.py`",
  },

  practice: {
    intro: "เพิ่มคำถามไทยผสมอังกฤษเรื่องค่าส่งคืนสินค้าที่ไม่มีหลักฐาน แล้วพิสูจน์ว่า baseline คืนค่า abstention ทั้งใน pytest และใน Promptfoo",
    requirements: [
      "เพิ่ม test case `return-shipping-unknown` ใต้ `tests` ใช้ evidence และ citation เป็น string ว่าง",
      "เขียน assertion แบบ object ให้ตรวจ status, answer, citations และห้ามคำว่า เปลี่ยนฟรี ในเคสใหม่",
      "ยืนยัน provider ผ่าน pytest เมื่อได้คำถามดังกล่าว และให้ input ที่มี evidence คู่กับ citation ว่างเป็น error",
      "รัน matrix เต็มเพื่อเห็น candidate ตกสองเคส แล้วรัน baseline อย่างเดียวเพื่อเก็บผลก่อนขึ้น CI",
    ],
    starter: {
      language: "yaml",
      filename: "promptfooconfig.yaml (ต่อท้ายใต้ tests)",
      code: `  - description: return-shipping-unknown
    vars:
      question: return สินค้าออนไลน์ต้องจ่ายค่าส่งไหม
      # TODO: ใส่ evidence และ citation ที่แสดงว่าค้นข้อมูลไม่พบ
    assert:
      # TODO: ตรวจ abstention ทั้ง object และข้ออ้างต้องห้าม
`,
    },
    verification: {
      language: "python",
      filename: "test_rag_provider.py",
      code: tests,
    },
    selfCheck: [
      "pytest ตรวจ provider ด้วย prompt fixture ที่กำหนดไว้ในเทสต์ ส่วน Promptfoo render ไฟล์จริง",
      "เคสค่าส่งมีรหัสแยกจากเคสส่วนลด และทั้งคู่ตรวจ citations ว่าง",
      "matrix เต็มผ่าน 6 ตก 2 ส่วน baseline ผ่านครบ 4 แถว",
      "รู้ว่าข้อความคาดหวังหรือ provider error เป็นสาเหตุของแต่ละผลที่แดง",
    ],
    acceptance: "pytest ผ่าน 6 การทดสอบและ baseline ได้ 4 จาก 4 เคส ขณะที่ candidate ตกเมื่อเดาคำตอบทั้งสองเคสที่ไร้หลักฐาน",
    hints: [
      {
        body: "ถ้าหลักฐานว่าง contract ของร้านกำหนดให้ทั้งสถานะ ข้อความ และรายการอ้างอิงตรงกัน ลองเขียนผลคาดหวังเป็น object ก่อนเลือก assertion",
      },
      {
        body: "เพิ่มแถวระดับเดียวกับ `member-discount-unknown` และใช้ `equals` กับ YAML mapping จากนั้นเพิ่ม `not-contains` ใน assert ของแถวนั้นเอง",
      },
      {
        body: "เฉลยรวมสี่ไฟล์ แยกตามหัวบรรทัดชื่อไฟล์ก่อนบันทึก แล้วรันคำสั่งตรวจด้านล่าง",
        code: {
          language: "text",
          filename: "d130-solution.txt",
          code: `=== rag_prompt.txt ===
${policyPrompt}
=== rag_provider.py ===
${provider}
=== promptfooconfig.yaml ===
${exampleConfig}${practiceCase}
=== test_rag_provider.py ===
${tests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o comparison.json
uv run npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache --filter-providers "^baseline-grounded$" -o baseline.json`,
    },
  },

  mistakes: [
    {
      title: "ปล่อยให้ candidate เห็นหลักฐานคนละชุด",
      symptom: "candidate ดูตอบดีขึ้น แต่ fixture ของ baseline ขาดเอกสาร",
      fix: "ใช้ `vars` ชุดเดียวเทียบ prompt และ provider ให้ต่างเพียงแกนที่ตั้งใจทดลอง",
    },
    {
      title: "ใช้ JSON Schema รับรองว่าข้อเท็จจริงถูก",
      symptom: "candidate ตอบว่าเปลี่ยนฟรีทุกกรณีผ่าน schema เพราะมี field ครบ",
      fix: "เพิ่มข้อกำหนดระดับเคส เช่น fallback object และ citation ที่ตรงกับหลักฐาน",
    },
    {
      title: "สรุปจากคะแนนรวมของ matrix",
      symptom: "ห้าเซลล์ผ่านเลยคิดว่าความผิดพลาดหนึ่งเซลล์ไม่มีผล",
      fix: "อ่านผลทีละ case ID โดยเฉพาะคำถามที่ไม่มีหลักฐาน เพราะความผิดพลาดเดียวอาจสร้างคำสัญญาที่ร้านทำตามไม่ได้",
    },
    {
      title: "เรียกผิด Python environment",
      symptom: "ทุกแถวกลายเป็น ERROR เพราะ import pydantic ไม่สำเร็จ",
      fix: "รันผ่าน `uv run` จาก root แล้วตรวจ `PROMPTFOO_PYTHON` หากเคยตั้งไว้ให้ชี้ไป Python คนละชุด",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d130-matrix",
        "จะเปรียบเทียบโมเดลสองรุ่นสำหรับคำถามภาษาไทยให้ตามสาเหตุได้อย่างไร",
        [
          ["ใช้ prompt และ fixtures ชุดเดียวกัน แล้วเปลี่ยน provider", "ควบคุมตัวแปรแล้วเทียบทีละแถวได้"],
          ["เปลี่ยนทั้ง prompt และชุดคำถาม", "ความต่างอาจเกิดจากหลายชิ้นพร้อมกัน"],
          ["ให้ candidate เห็นเฉลยใน prompt", "เฉลยควรอยู่ฝั่ง assertion"],
          ["เลือกทดสอบเฉพาะเคสที่ทั้งคู่ตอบถูก", "ชุดทดสอบเสียความสามารถในการหา regression"],
        ],
        "A",
        "การถือ prompt และ evidence คงที่ทำให้ผลต่างสะท้อน provider บนเคสที่ใช้ร่วมกัน",
        "เมื่อเทียบ model สองรุ่นต้องตรึงอะไร",
        "Prompt, คำถาม, retrieved evidence และ assertions",
      ),
      mc(
        "d130-schema",
        "คำตอบเดาว่าเปลี่ยนฟรีทุกกรณีผ่าน is-json แต่ตก equals เพราะอะไร",
        [
          ["YAML อ่านภาษาไทยไม่ได้", "UTF-8 รองรับภาษาไทย"],
          ["Schema ตรวจรูปแบบ ส่วน equals ตรวจค่าตามสัญญาของเคส", "ทั้งสอง assertion จับความผิดพลาดคนละระดับ"],
          ["equals ใช้เฉพาะ string", "ตัวอย่างเปรียบเทียบกับ JSON object ได้"],
          ["Pydantic เปลี่ยนข้อความอัตโนมัติ", "แบบจำลองนี้คง answer ที่ส่งให้"],
        ],
        "B",
        "JSON ที่มีชนิดและฟิลด์ถูกยังบันทึกคำตอบผิดได้ ต้องตรวจเงื่อนไขของเคสด้วย",
        "is-json กับ equals มีหน้าที่ต่างกันอย่างไร",
        "ตรวจ schema และตรวจค่าคาดหวังตามลำดับ",
      ),
      mc(
        "d130-provider-error",
        "เมื่อ evidence มีข้อความแต่ citation ว่าง provider ควรส่งอะไร",
        [
          ["output ที่มี citation สมมติ", "fixture ผิดสัญญาและ citation ที่สร้างใหม่ไม่มีหลักฐาน"],
          ["output ที่คัดลอก expected answer", "การใช้เฉลยทำลายผลประเมิน"],
          ["error ของ fixture", "validator ยืนยันว่าหลักฐานและรหัสต้องมาเป็นคู่"],
          ["output ว่างที่นับผ่าน", "ไม่ควรตีผลรันข้อมูลเสียเป็นความสำเร็จ"],
        ],
        "C",
        "ส่ง error เพื่อให้คนแก้ที่ข้อมูลทดลองก่อนสรุปว่าโมเดล regression",
        "provider error ต่างจาก assertion fail อย่างไร",
        "error คือรัน provider ไม่สำเร็จ ส่วน fail คือได้ output แต่ไม่ตรงเงื่อนไข",
      ),
      mc(
        "d130-ci-selection",
        "จะรันแค่ baseline ที่ใช้ส่งขึ้น CI ด้วย config เดิมอย่างไร",
        [
          ["ลบเคส unknown ทั้งหมด", "ทำให้ด่านมองไม่เห็นปัญหา abstention"],
          ["ตั้งให้ทุก failure เป็น warning", "ลดความสามารถในการหยุด regression"],
          ["รันทุก provider แล้วละเว้น exit code", "กลบผลทั้งของ baseline และ candidate"],
          ["ใช้ filter-providers ให้ตรง label baseline-grounded", "เลือกคอลัมน์ได้โดยคงทุกเคส"],
        ],
        "D",
        "ใช้ชุดเคสเดียวกันต่อได้ ทั้งโหมดเปรียบเทียบและโหมด gate สำหรับ provider ที่ใช้งาน",
        "จะเลือกเฉพาะ baseline ใน Promptfoo อย่างไร",
        "ใช้ --filter-providers กับ regex ที่ตรง label baseline-grounded",
      ),
    ],
  },

  takeaways: [
    "Promptfoo matrix ช่วยเทียบพฤติกรรมรายเคสเมื่อควบคุม prompt, provider หรือข้อมูลให้ต่างทีละส่วน",
    "ให้ schema ตรวจโครง แล้วเพิ่ม assertion ที่ตรงกับสัญญาธุรกิจ เช่น fallback หรือ citation",
    "Python fake ทำให้ทดสอบ pipeline ซ้ำได้ในเครื่อง และต้องโดนเช็กทั้งทาง pytest และทาง Promptfoo",
    "D131 จะยก baseline suite ขึ้น GitHub Actions คู่กับเกณฑ์รายแกนของ D129 เพื่อเตรียม Evaluated & Guarded AI Microservice ใน D156",
  ],
  reviewCards: [
    rc("d130-controlled-run", "ถ้าเปลี่ยน prompt จะคุม provider และ fixtures อย่างไร", "ยึด provider ตัวเดิมและใช้ vars กับ assertions ชุดเดิมในสองรอบ"),
    rc("d130-asrt", "เคสที่ไม่มีหลักฐานควรตรวจฟิลด์อะไร", "status abstained, answer ไม่พบข้อมูล และ citations ว่าง"),
    rc("d130-python-adapter", "Python provider คืนค่าอะไรเมื่อรันสำเร็จ", "dict ที่มี output โดยตัวอย่างส่ง JSON string ของ RagReply"),
    rc("d130-report", "อ่านความต่างใน matrix จากจุดไหนก่อน", "เริ่มจาก case ID และ provider label แล้วอ่าน reason และ output ของเซลล์ที่ตก"),
  ],
  sources: [
    { label: "Promptfoo · Python provider", href: "https://www.promptfoo.dev/docs/providers/python/" },
    { label: "Promptfoo · Assertions and metrics", href: "https://www.promptfoo.dev/docs/configuration/expected-outputs/" },
    { label: "Promptfoo · Command line", href: "https://www.promptfoo.dev/docs/usage/command-line/" },
    { label: "Ragas · Available metrics", href: "https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/" },
  ],
  glossary: ["rag", "promptfoo", "golden-dataset", "prompt-versioning", "ragas", "pydantic", "pytest", "abstention", "llm-as-a-judge"],
});
