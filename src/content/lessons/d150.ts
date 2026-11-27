import type { Lesson, LessonVisualId } from "../types";
import { defineLesson, mc, rc } from "./builder";

const inputGate = String.raw`import re
import unicodedata

from pydantic import BaseModel, ConfigDict, Field, ValidationError


class Question(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    text: str = Field(min_length=1, max_length=300)


# ตัวอย่าง fingerprint จาก fixture ภายในทีม
SCREEN = re.compile(
    r"ignore the test task|ข้ามโจทย์ทดสอบ",
    re.IGNORECASE,
)


def check_input(payload: dict) -> Question:
    question = Question.model_validate(payload)
    normalized = unicodedata.normalize("NFKC", question.text)
    normalized = " ".join(normalized.split())
    if not normalized or SCREEN.search(normalized):
        raise ValueError("input_review")
    return question
`;

const outputGate = String.raw`class Reply(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    answer: str = Field(min_length=1, max_length=500)
    citations: list[str] = Field(min_length=1, max_length=4)


def check_output(raw: dict, permitted_refs: frozenset[str]) -> Reply | None:
    try:
        reply = Reply.model_validate(raw)
    except ValidationError:
        return None
    if not set(reply.citations).issubset(permitted_refs):
        return None
    if "fixture_private" in reply.answer.casefold():
        return None
    return reply
`;

const toolGate = String.raw`from dataclasses import dataclass


@dataclass(frozen=True)
class Principal:
    user: str
    tenant: str
    scopes: frozenset[str]


class OrderArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, frozen=True)
    order_id: str = Field(pattern=r"^DEMO-[0-9]{2}$")


class NoteArgs(OrderArgs):
    text: str = Field(min_length=1, max_length=120)


TOOLS = {
    "lookup_order": ("orders:read", OrderArgs),
    "add_note": ("orders:write", NoteArgs),
}


@dataclass(frozen=True)
class Proposal:
    request_id: str
    actor: str
    tenant: str
    tool: str
    order_id: str
    text: str


class ToolSandbox:
    def __init__(self):
        self.orders = {("north", "DEMO-17"): "กำลังจัดส่ง"}
        self.approvals: dict[str, Proposal] = {}
        self.writes: dict[str, Proposal] = {}

    def dispatch(
        self,
        principal: Principal,
        request_id: str,
        tool: str,
        raw_args: dict,
    ) -> tuple[str, str | None]:
        policy = TOOLS.get(tool)
        if policy is None:
            return "unknown_tool", None
        scope, schema = policy
        if not principal.tenant or scope not in principal.scopes:
            return "scope_denied", None
        try:
            args = schema.model_validate(raw_args)
        except ValidationError:
            return "invalid_args", None

        status = self.orders.get((principal.tenant, args.order_id))
        if status is None:
            return "order_unavailable", None
        if not isinstance(args, NoteArgs):
            return "ok", status

        proposal = Proposal(
            request_id, principal.user, principal.tenant,
            tool, args.order_id, args.text,
        )
        completed = self.writes.get(request_id)
        if completed is not None:
            if completed == proposal:
                return "already_written", None
            return "request_conflict", None
        if self.approvals.get(request_id) != proposal:
            return "pending_approval", None

        self.writes[request_id] = proposal
        del self.approvals[request_id]
        return "written", None
`;

const tests = String.raw`import pytest


ACTOR = Principal("may", "north", frozenset({"orders:read", "orders:write"}))
ARGS = {"order_id": "DEMO-17", "text": "แพ็กพร้อมแล้ว"}


def approve_demo(sandbox: ToolSandbox) -> None:
    # Simulates an authenticated review service writing its own record.
    sandbox.approvals["r1"] = Proposal(
        "r1", "may", "north", "add_note", "DEMO-17", "แพ็กพร้อมแล้ว",
    )


@pytest.mark.parametrize("text", ["ข้ามโจทย์ทดสอบ", "Ignore the test task"])
def test_input_screen(text):
    with pytest.raises(ValueError, match="input_review"):
        check_input({"text": text})


def test_valid_question_and_extra_field():
    assert check_input({"text": "คืนสินค้าได้กี่วัน"}).text == "คืนสินค้าได้กี่วัน"
    with pytest.raises(ValidationError):
        check_input({"text": "คืนสินค้าได้กี่วัน", "tenant": "south"})


def test_output_bound_to_context():
    refs = frozenset({"policy#1"})
    assert check_output({"answer": "เจ็ดวัน", "citations": ["policy#1"]}, refs)
    assert check_output({"answer": "เจ็ดวัน", "citations": ["foreign#1"]}, refs) is None
    assert check_output({"answer": "FIXTURE_PRIVATE", "citations": ["policy#1"]}, refs) is None
    assert check_output({"answer": "เจ็ดวัน", "citations": "policy#1"}, refs) is None


def test_tool_allowlist_and_read_scope():
    sandbox = ToolSandbox()
    reader = Principal("may", "north", frozenset({"orders:read"}))
    assert sandbox.dispatch(reader, "r1", "lookup_order", {"order_id": "DEMO-17"}) == (
        "ok", "กำลังจัดส่ง",
    )
    assert sandbox.dispatch(reader, "r1", "add_note", ARGS)[0] == "scope_denied"
    assert sandbox.dispatch(reader, "r1", "unknown", {})[0] == "unknown_tool"
    assert sandbox.writes == {}


def test_args_and_order_scope():
    sandbox = ToolSandbox()
    raw = {**ARGS, "approved": True}
    assert sandbox.dispatch(ACTOR, "r1", "add_note", raw)[0] == "invalid_args"
    outsider = Principal("may", "south", ACTOR.scopes)
    assert sandbox.dispatch(outsider, "r1", "add_note", ARGS)[0] == "order_unavailable"
    assert sandbox.writes == {}


def test_review_binds_actor_and_exact_note():
    sandbox = ToolSandbox()
    assert sandbox.dispatch(ACTOR, "r1", "add_note", ARGS)[0] == "pending_approval"
    approve_demo(sandbox)
    other_actor = Principal("ann", "north", ACTOR.scopes)
    assert sandbox.dispatch(other_actor, "r1", "add_note", ARGS)[0] == "pending_approval"
    changed = {**ARGS, "text": "แก้ข้อความหลังตรวจ"}
    assert sandbox.dispatch(ACTOR, "r1", "add_note", changed)[0] == "pending_approval"
    assert sandbox.writes == {}
    assert sandbox.dispatch(ACTOR, "r1", "add_note", ARGS)[0] == "written"
    assert sandbox.approvals == {}
    assert sandbox.dispatch(ACTOR, "r1", "add_note", ARGS)[0] == "already_written"
    assert sandbox.dispatch(ACTOR, "r1", "add_note", changed)[0] == "request_conflict"
    assert len(sandbox.writes) == 1
`;

const modelDemo = String.raw`def fake_model(question: Question) -> dict:
    return {"answer": "คืนสินค้าได้ภายในเจ็ดวัน", "citations": ["policy#1"]}


question = check_input({"text": "คืนสินค้าได้กี่วัน"})
refs = frozenset({"policy#1"})
reply = check_output(fake_model(question), refs)
print("reply:", reply.answer if reply else "กรุณาติดต่อเจ้าหน้าที่")
print("invalid citation:", check_output(
    {"answer": "เจ็ดวัน", "citations": ["foreign#1"]}, refs,
))
`;

const toolDemo = String.raw`sandbox = ToolSandbox()
staff = Principal("may", "north", frozenset({"orders:write"}))
args = {"order_id": "DEMO-17", "text": "แพ็กพร้อมแล้ว"}
print("first:", sandbox.dispatch(staff, "r1", "add_note", args)[0])
print("writes before review:", len(sandbox.writes))

# ในแอปจริงคำสั่งนี้มาจาก review service ที่ยืนยันตัวผู้อนุมัติแล้ว
sandbox.approvals["r1"] = Proposal(
    "r1", "may", "north", "add_note", "DEMO-17", "แพ็กพร้อมแล้ว",
)
print("resumed:", sandbox.dispatch(staff, "r1", "add_note", args)[0])
print("retry:", sandbox.dispatch(staff, "r1", "add_note", args)[0])
print("writes:", len(sandbox.writes))
`;

export const d150: Lesson = defineLesson({
  day: 150,
  titleTh: "สร้าง Input และ Output Guardrails พร้อม Least-Privilege Tool Sandbox",
  tagline: "30 นาที · ตรวจ schema และหลักฐาน จำกัด scope และหยุดงานเขียนก่อนเกิดผลข้างเคียง",
  icon: "shield-check",
  visual: {
    id: "guardrail-sandbox" as LessonVisualId,
    title: "Guardrails จาก API ถึง MCP Executor",
    caption: "ตามเส้นทางคำถามผ่าน input gate และ output gate แล้วลองพิจารณาว่า read กับ write ต้องเจอด่านใด",
    alt: "แผนภาพ Pydantic และ regex หน้าโมเดล ตัวตรวจคำตอบ และ allowlist กับ scope และ human approval ก่อน MCP เขียนข้อมูล",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ Fake LLM และ Tool Sandbox แบบ in-memory รันบนเครื่อง",
  tools: ["Python 3.12", "uv", "Pydantic v2", "Python re", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รับเฉพาะข้อมูลที่ API รองรับ",
      body: "ข้อความจากผู้ใช้อยู่ใน request schema ส่วน principal มาจาก session ที่เซิร์ฟเวอร์ยืนยันเอง",
      lessonNote: "ใช้ Pydantic กำหนดขนาดและชนิด แล้วทำ regex screening บนข้อความที่ normalize แล้ว",
    },
    {
      node: 3,
      heading: "ตรวจคำตอบกับ context ที่อนุญาต",
      body: "ผลจากโมเดลอาจผิด schema หรืออ้างเอกสารที่ไม่ได้ส่งมา",
      lessonNote: "ใช้ citation allowlist และตรวจข้อมูลอ่อนไหวก่อนคืน response",
    },
    {
      node: 4,
      heading: "ให้เครื่องมือทำได้เท่าที่จำเป็น",
      body: "ข้อเสนอจาก {{langgraph}} เป็นข้อมูลนำเข้าของ executor ทุกครั้ง",
      lessonNote: "ตรวจชื่อ Tool, scope, args, tenant และ {{hitl}} สำหรับ write",
    },
    {
      node: 5,
      heading: "เห็นเหตุผลที่หยุดทำงานโดยไม่เก็บค่าดิบ",
      body: "รหัส invalid_args, scope_denied และ pending_approval บอกว่าควรตรวจด่านใด",
      lessonNote: "ใน Day 153 ส่งเฉพาะ decision code และ policy version เข้า trace ที่ผ่านการทำ masking",
    },
  ],
  objectives: [
    "ตรวจ input ด้วย schema และ regex พร้อมอธิบายขอบเขตของแต่ละชั้น",
    "ยืนยันรูปแบบ output, citation membership และข้อมูลสังเคราะห์ที่ต้องปิด",
    "สร้าง executor ที่แยก read/write scopes และผูก approval กับคำสั่งเขียนจริง",
  ],
  prerequisites: [
    "Day 77–78 · Pydantic แบบ strict และ fallback เมื่อโมเดลส่งข้อมูลผิด",
    "Day 107, Day 115 และ Day 119 · {{acl}}, การเชื่อม MCP อย่างปลอดภัย และ human approval",
    "Day 137 และ Day 149 · API dependency และ OWASP risk inventory",
  ],
  setup: {
    intro: "แยกโฟลเดอร์ฝึกสำหรับ API จำลอง ให้ใช้เฉพาะข้อความคืนสินค้าและออเดอร์ DEMO-17 ในหน่วยความจำ",
    commands: "mkdir b38-guardrails\ncd b38-guardrails\nuv run --python 3.12 --with 'pydantic>=2,<3' --with pytest python --version",
    steps: [
      ["deps", "ตรวจว่า uv ใช้ Python 3.12 และมี Pydantic รุ่น 2"],
      ["principal", "อ่าน Principal แล้วชี้ว่าค่าใดต้องมาจาก session หรือข้อมูลสิทธิ์ฝั่งเซิร์ฟเวอร์"],
      ["write", "เตรียมตัวนับ writes เพื่อยืนยันว่าไม่มีการเขียนก่อน approval"],
    ],
    note: "Tool Sandbox ในบทนี้คือขอบเขตบังคับนโยบายของโปรแกรมตัวอย่าง รันแทนเครื่องมือด้วย in-memory stub",
  },

  concepts: [
    {
      id: "strict-input",
      title: "1 · แยก schema validation กับการสแกนข้อความ",
      paragraphs: [
        "Pydantic รับเพียง text ยาว 1 ถึง 300 ตัวอักษร strict mode คุมชนิด และ extra forbid ปฏิเสธฟิลด์ที่ไม่อยู่ในสัญญา เช่น tenant หรือ approved",
        "normalize สำเนาเพื่อใช้ตรวจ โดยคงข้อความต้นฉบับไว้ให้ขั้นตอนที่ต้องใช้เนื้อแท้ Regex ตัวอย่างตรวจ fingerprint ของชุดฝึกได้ แต่ข้อความที่ไม่ตรง fingerprint ยังต้องผ่านทุก policy ต่อไป",
      ],
      analogy: "ใบสมัครตรวจได้ว่าช่องกรอกครบ และตรวจกฎพื้นฐานในข้อความ แต่ลายเซ็นผู้อนุมัติต้องมาจากอีกขั้นตอนหนึ่ง",
      bullets: [
        "ตั้งขนาด body ที่ HTTP ingress ก่อน parse และตั้งขนาด field เพิ่มใน schema",
        "ใช้ fingerprint ขนาดเล็กที่ทดสอบด้วยข้อมูลภาษาไทย ภาษาอังกฤษ และคำถามปกติ",
        "สำหรับ retrieved context ให้กรอง ACL ก่อน แล้วแยกเอกสารที่ถูก flag ออกไปตรวจ",
      ],
      code: {
        language: "python",
        filename: "guard_demo.py",
        code: inputGate,
      },
      whyTitle: "ผ่าน schema หมายถึงรูปแบบถูกต้อง",
      whyParagraphs: [
        "แยกความผิดรูปแบบออกจากการตรวจเนื้อหา เพื่อให้ metrics บอกตำแหน่งแก้ไข และไม่กระจาย raw payload ไปในข้อความ error หรือ trace",
      ],
    },
    {
      id: "validating-output",
      title: "2 · ตรวจผลโมเดลก่อนคืน API หรือส่งต่อ",
      paragraphs: [
        "ให้โมเดลคืน answer และ citations ด้วย schema จาก Day 77 แล้วเทียบ citation ทุกตัวกับ refs ที่ retriever อนุญาตสำหรับ request นี้",
        "ตรวจ sentinel ของข้อมูลสมมติก่อนส่ง response ตัวอย่างคืน None เมื่อไม่ผ่าน และแอปใช้ข้อความ fallback ที่คงที่ Day 151 เพิ่มการตรวจ PII ไทยก่อนส่งแต่ละปลายทาง",
        "การมี citation ในชุดที่อนุญาตยืนยันการเป็นสมาชิกเท่านั้น ความถูกต้องของคำอ้างยังต้องวัด {{groundedness}} ตาม Day 122 และ Day 129",
      ],
      analogy: "ตรวจว่าหมายเลขหน้าอยู่ในหนังสือที่ให้มา แล้วอ่านอีกครั้งว่าหน้านั้นรองรับข้อสรุปจริง",
      code: {
        language: "python",
        filename: "guard_demo.py",
        code: inputGate + "\n\n" + outputGate,
        caption: "ตรวจชนิดและที่มาแบบ deterministic ก่อนคืนข้อความ",
      },
      whyTitle: "จัดตำแหน่ง output gate ตามวิธีส่งคำตอบ",
      whyParagraphs: [
        "หาก API ใช้ SSE จาก Day 138 ให้ buffer ผลส่วนที่ต้องตรวจไว้ก่อนปล่อย event เพราะข้อมูลที่ส่งไปแล้วเก็บคืนจากผู้รับไม่ได้",
        "ฝั่ง Web ยังต้องใช้ output encoding ตามชนิดปลายทาง และฝั่ง Tool ใช้ schema ของ Tool โดยเฉพาะ",
      ],
    },
    {
      id: "policy-enforcement",
      title: "3 · จำกัด MCP Tools ด้วย allowlist, scope และ tenant",
      paragraphs: [
        "กำหนดให้ lookup_order ใช้ orders:read และ add_note ใช้ orders:write ฝั่ง agent เห็นเฉพาะเครื่องมือที่จำเป็น ส่วน executor ตรวจนโยบายจริงทุกรอบ",
        "Pydantic ตรวจ args หลังเลือก Tool แล้ว executor อ่านออเดอร์ผ่านคีย์ tenant และ order_id ตัวอย่างสมมติว่าพนักงานใน tenant ที่มี scope เข้าถึงออเดอร์ของ tenant ได้ งานจริงอาจต้องตรวจเจ้าของหรือ role เพิ่ม",
      ],
      analogy: "บัตรพนักงานเปิดได้เฉพาะชั้นที่ได้รับอนุญาต และระบบยังตรวจอีกครั้งว่าห้องที่ขออยู่ในขอบเขตงาน",
      code: {
        language: "python",
        filename: "guard_demo.py",
        code: inputGate + "\n\n" + toolGate,
      },
      whyTitle: "นำหลัก least privilege ไปถึง executor จริง",
      whyParagraphs: [
        "ในระบบจริงให้ MCP server หรือ API ปลายทางตรวจสิทธิ์ด้วย ใช้ credentials แบบ read-only สำหรับงานอ่าน และจำกัด filesystem/network ของ process ตามงาน",
      ],
    },
    {
      id: "approval-binding",
      title: "4 · หยุด write ที่ checkpoint แล้วตรวจรายการอีกครั้งเมื่อ resume",
      paragraphs: [
        "ต่อยอด Day 119 โดยแสดง Tool, order_id และข้อความ note ให้ผู้ตรวจเห็นจริง การอนุมัติผูก request ID, ผู้ขอ, tenant, Tool และ args ที่ผ่าน validation",
        "approval มาจากบริการผู้ตรวจที่ยืนยันตัวตนและสิทธิ์แล้ว ข้อมูลใน request หรือผลจากโมเดลเพิ่มสิทธิ์เองไม่ได้ เมื่อ resume ให้ตรวจ scope และออเดอร์ใหม่ก่อนเทียบรายการอนุมัติ",
      ],
      analogy: "ใบอนุมัติแก้บันทึกระบุทั้งเลขรายการและข้อความ เมื่อแก้เนื้อหาต้องขออนุมัติรายการใหม่",
      code: {
        language: "python",
        filename: "guard_demo.py",
        code: inputGate + "\n\n" + toolGate + "\n\n" + toolDemo,
        caption: "ก่อนตรวจไม่มี write และการ retry คำขอเดิมไม่มี write เพิ่ม",
      },
      whyTitle: "การ resume ต้องรับมือกับคำขอซ้ำและข้อมูลเปลี่ยน",
      whyParagraphs: [
        "ใน stub ใช้ dict และรันต่อเนื่องใน process เดียว เมื่อใช้หลาย worker ให้เก็บ approval อายุสั้นและบันทึก idempotency แบบ durable ใช้ transaction หรือ idempotency key ที่ระบบปลายทางรองรับ",
        "ถ้าแก้ args หลังอนุมัติ หรือ scope ถูกถอนระหว่างรอ ให้หยุดและส่งกลับตาม decision code ของด่านที่ขาด",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — ใช้หลักเดียวกับ API และ IAM",
      body: [
        "กำหนด trust boundary ก่อนต่อ LangGraph เช่น schema ที่ HTTP ingress, authorization ที่ service layer และ rendering policy ที่ response",
      ],
      table: [
        ["Request schema และ body limit", "ตรวจรูปแบบและขนาดก่อนเรียก LLM แล้วสแกน fingerprint ที่รู้จัก"],
        ["CSP และ output encoding", "จำกัดการรันเนื้อหาใน browser และตรวจ citation/PII ก่อนออก API"],
        ["IAM scopes และ row-level security", "ผูกสิทธิ์ต่อ Tool และค้นออเดอร์ด้วย tenant ของ session"],
        ["Transaction approval และ idempotency", "ตรวจรายการที่จะเขียนกับ approval ที่ผูกกับ args และบันทึกการทำงานซ้ำ"],
      ],
    },
    student: {
      title: "First-Year Note — ฟังก์ชันหนึ่งตรวจหนึ่งสัญญา",
      body: [
        "ลองเขียนตารางว่าการผ่านแต่ละด่านยืนยันอะไรได้ เช่น ค่าเป็นข้อความ อ้างเอกสารถูกชุด หรือเจ้าหน้าที่มีสิทธิ์เขียน แล้วหาตัวอย่างที่ผ่านเพียงบางด่าน",
        "ตั้งชื่อสถานะให้บอกด่านที่ปฏิเสธ จะใช้ตรวจใน pytest ได้แม้เปลี่ยนข้อความ UI ในภายหลัง",
      ],
    },
  },

  workedExample: {
    intro: "ประกอบ guard_demo.py สามขั้น รัน uv run --python 3.12 --with 'pydantic>=2,<3' python guard_demo.py หลังแต่ละขั้น",
    steps: [
      {
        title: "1 · ให้คำถามทั่วไปผ่าน input gate",
        explain: "วาง schema และ regex แล้วพิมพ์ผลชั่วคราว ลบ print นี้ก่อนต่อขั้นสอง",
        code: {
          language: "python",
          filename: "guard_demo.py",
          code: inputGate + '\nprint(check_input({"text": "คืนสินค้าได้กี่วัน"}).text)\n',
        },
        output: "คืนสินค้าได้กี่วัน",
      },
      {
        title: "2 · ให้ response ที่อ้างผิดชุดไป fallback",
        explain: "ต่อท้าย output gate และ Fake LLM ที่ตอบนโยบายคืนสินค้าจาก policy#1 คำตอบที่อ้าง foreign#1 จะได้ None ผู้เรียกสามารถคืนข้อความ fallback คงที่ได้",
        code: {
          language: "python",
          filename: "guard_demo.py",
          code: outputGate + "\n\n" + modelDemo,
        },
        output: "reply: คืนสินค้าได้ภายในเจ็ดวัน\ninvalid citation: None",
      },
      {
        title: "3 · หยุด add_note แล้ว resume จาก approval ของผู้ตรวจ",
        explain: "ต่อท้าย Tool Sandbox และ demo การเรียกแรกมี write scope แต่ยังหยุด ตรวจเทียบ request ที่อนุมัติแล้ว และลองส่งคำขอเดิมซ้ำ",
        code: {
          language: "python",
          filename: "guard_demo.py",
          code: toolGate + "\n\n" + toolDemo,
        },
        output: "reply: คืนสินค้าได้ภายในเจ็ดวัน\ninvalid citation: None\nfirst: pending_approval\nwrites before review: 0\nresumed: written\nretry: already_written\nwrites: 1",
      },
    ],
    gotcha: "policy ต้องทำงานก่อนเรียก MCP และก่อนปล่อย response จริง การใช้ route ไปโหนด approval ยังต้องมีด่านที่ executor เมื่อมีการ resume หรือเรียกซ้ำ",
  },

  practice: {
    intro: "ทำสามด่านให้ครบแล้วใช้ pytest พิสูจน์ว่า read ที่มีสิทธิ์ผ่าน ส่วน write ที่รออนุมัติไม่มี side effect",
    requirements: [
      "ใช้ check_input ตรวจ strict schema และสแกนสำเนาข้อความที่ normalize",
      "ใช้ check_output จำกัด refs และบล็อก sentinel ของฟิกซ์เจอร์ก่อนออก response",
      "ให้ dispatch ตรวจ allowlist, scope, args, tenant และ exact approval ก่อนเขียน แล้วรองรับ request เดิมที่เรียกซ้ำ",
    ],
    starter: {
      language: "python",
      filename: "guardrails.py",
      code: String.raw`from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field


class Question(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    text: str = Field(min_length=1, max_length=300)


class Reply(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    answer: str = Field(min_length=1, max_length=500)
    citations: list[str] = Field(min_length=1, max_length=4)


@dataclass(frozen=True)
class Principal:
    user: str
    tenant: str
    scopes: frozenset[str]


@dataclass(frozen=True)
class Proposal:
    request_id: str
    actor: str
    tenant: str
    tool: str
    order_id: str
    text: str


def check_input(payload: dict) -> Question:
    # TODO: ตรวจ schema, normalize และใช้ regex หา fingerprint
    raise NotImplementedError


def check_output(raw: dict, permitted_refs: frozenset[str]) -> Reply | None:
    # TODO: คืน None เมื่อ schema ผิด อ้างนอกชุด หรือเจอ sentinel
    raise NotImplementedError


class ToolSandbox:
    def __init__(self):
        self.orders = {("north", "DEMO-17"): "กำลังจัดส่ง"}
        self.approvals: dict[str, Proposal] = {}
        self.writes: dict[str, Proposal] = {}

    def dispatch(self, principal, request_id, tool, raw_args):
        # TODO: สร้าง schema แยกและ map scope แล้วตรวจตามลำดับ
        # TODO: ตรวจ approval ที่ผูกกับ args ก่อนเพิ่ม write
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_guardrails.py",
      code: "from guardrails import Principal, Proposal, ToolSandbox, check_input, check_output\nfrom pydantic import ValidationError\n\n" + tests,
    },
    selfCheck: [
      "ด่าน input ปฏิเสธฟิลด์ tenant ที่ client พยายามส่ง และเทสต์คำถามปกติยังผ่าน",
      "คำตอบที่ schema ถูกแต่อ้าง foreign#1 ได้ None",
      "ตรวจ writes หลังเปลี่ยน actor หรือ args และลอง retry รายการที่เขียนสำเร็จ",
    ],
    acceptance: "pytest ผ่าน 7 เคส และระบุได้ว่า scope กับ approval มาจากส่วนใดของเซิร์ฟเวอร์",
    hints: [
      { body: "เริ่มที่ test_input_screen แล้วแยกหน้าที่ check_output และ dispatch เพื่อหาว่าด่านใดทำให้เทสต์ล้ม" },
      { body: "ใช้ model_validate, set.issubset, dict.get และ Proposal แบบ frozen ให้เทียบค่าทั้งรายการได้" },
      {
        body: "ไฟล์เดียวมีทั้งด่านตรวจและ pytest เทสต์ approval ใช้ record สมมติแทนบริการผู้ตรวจ",
        code: {
          language: "python",
          filename: "test_guardrails_solution.py",
          code: inputGate + "\n\n" + outputGate + "\n\n" + toolGate + "\n\n" + tests,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: "uv run --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_guardrails_solution.py",
    },
  },

  mistakes: [
    {
      title: "ใช้ regex เป็นด่านตัดสินทั้งหมด",
      symptom: "ข้อความที่ไม่ตรงรูปแบบยังทำให้โมเดลเสนอ action ได้",
      fix: "ใช้ schema และ screening คู่กับ allowlist, scope, output checks และ human approval",
    },
    {
      title: "ให้โมเดลส่ง tenant หรือ approved",
      symptom: "ข้อมูลที่ควรมาจาก session หรือ review service ไปอยู่ใน Tool args",
      fix: "ปิด extra fields และส่ง principal กับ approval จากบริบทที่เซิร์ฟเวอร์ยืนยันแล้ว",
    },
    {
      title: "ตรวจ citation แค่ว่าเป็น string",
      symptom: "คำตอบอ้างเอกสารนอกชุดที่ retriever อนุญาต",
      fix: "เทียบ refs กับ context ของ request เดียวกันและใช้ fallback เมื่อไม่ผ่าน",
    },
    {
      title: "อนุมัติเฉพาะชื่อ Tool แล้วเปลี่ยน args หลัง resume",
      symptom: "ผู้ตรวจเห็นข้อความหนึ่ง แต่ Tool รับข้อความอีกชุด",
      fix: "เทียบ immutable proposal ก่อน execute แล้วบันทึกการใช้ approval กับ request ID",
    },
  ],
  quiz: {
    questions: [
      mc("d150-q1", "เมื่อ schema ผ่านและ regex ไม่พบ fingerprint ควรสรุปอย่างไร?",
        [["ข้าม scope check ได้", "scope ยังต้องตรวจ"], ["ข้อมูลผ่านด่านหน้า ให้ตรวจด่านถัดไป", "ทั้งสองชั้นรับรองเงื่อนไขที่กำหนดไว้"], ["ให้โมเดลเลือก tenant", "tenant มาจาก session"], ["คืน output ทันที", "output ต้องตรวจแยก"]],
        "B", "การผ่าน input gate ยืนยัน schema และ fingerprint ที่รู้จัก ให้คุมสิทธิ์และผลลัพธ์ต่อ", "หลัง input ผ่านยังต้องตรวจอะไร?", "ตรวจ citation และ output ก่อนเผยแพร่ และตรวจนโยบาย Tool ก่อน execute"),
      mc("d150-q2", "Citation รูปแบบถูกต้องแต่อยู่นอก permitted_refs ควรทำอย่างไร?",
        [["ส่งเลยเพราะ schema ผ่าน", "รูปแบบไม่ยืนยันสิทธิ์"], ["เติมเข้า refs อัตโนมัติ", "จะเปลี่ยนแหล่งที่แอปอนุญาต"], ["ส่งให้ browser ลบเอง", "ข้อมูลถูกส่งถึงผู้รับแล้ว"], ["คืน fallback", "response gate ตรวจไม่ผ่าน"]],
        "D", "ชุด refs สร้างจาก context ที่ได้รับอนุญาตของ request นั้น ใช้ fallback เมื่อโมเดลอ้างนอกชุด", "permitted_refs ควรมาจากไหน?", "มาจากผล retrieval ที่ตรวจสิทธิ์แล้วของ request ปัจจุบัน"),
      mc("d150-q3", "ผู้มี orders:write เปลี่ยนข้อความ note หลังอนุมัติ ระบบควรทำอย่างไร?",
        [["ขออนุมัติใหม่", "ข้อเสนอที่เปลี่ยนไม่ตรง record"], ["เขียนเลยเพราะ Tool เดิม", "ชื่อ Tool ไม่ครอบคลุม args"], ["เชื่อ approved จากโมเดล", "โมเดลออก approval ไม่ได้"], ["เขียนแล้วแจ้งผู้ตรวจ", "side effect เกิดก่อนตรวจ"]],
        "A", "approval ผูกกับข้อความที่จะเขียนและ actor/tenant ของคำขอนั้น", "เหตุใดต้องผูก approval กับ args?", "เพื่อให้สิ่งที่ execute ตรงกับสิ่งที่ผู้ตรวจอนุมัติ"),
      mc("d150-q4", "จะพิสูจน์ว่า pending_approval ไม่มีการเขียนด้วยอะไร?",
        [["ตรวจว่ามีคำว่า pending ใน UI", "คำตอบไม่บอกว่ามี side effect หรือไม่"], ["ตรวจ schema ของ response อย่างเดียว", "schema ไม่เห็น executor"], ["ตรวจ writes หรือ spy ของ executor", "ยืนยัน side effect ที่จุดทำงาน"], ["วัด latency อย่างเดียว", "เวลาไม่ยืนยันว่าหยุด write"]],
        "C", "ตรวจทั้ง decision code และจำนวน write เพื่อให้เห็นผลของด่านที่จุดทำงาน", "เทสต์ HITL ควรตรวจผลใดคู่กัน?", "สถานะ pending และจำนวนการเขียนเป็นศูนย์"),
    ],
  },
  takeaways: [
    "Input screening คัดรูปแบบที่รู้จัก และแต่ละ trust boundary ยังต้องมีนโยบายของตัวเอง",
    "Output gate คุม schema และ refs ก่อนเผยแพร่ ใช้ Day 151 เพิ่ม PII masking",
    "ประเมิน scope และ exact approval ที่ executor แล้วนำเหตุการณ์สรุปไป trace ใน Day 153",
  ],
  reviewCards: [
    rc("d150-r1", "ข้อจำกัดของ regex screening คืออะไร?", "ครอบคลุมเพียงรูปแบบที่ตั้งไว้ ต้องคุมข้อมูล สิทธิ์ และ side effect ต่อ"),
    rc("d150-r2", "ตัวตรวจ output ที่อ้างเอกสารควรตรวจอะไร?", "ตรวจ schema และ membership ใน refs ของ context ที่อนุญาต แล้ววัด groundedness แยก"),
    rc("d150-r3", "approval bind ค่าอะไร?", "request ID, ผู้ขอ, tenant, Tool และ args ที่ตรวจแล้ว"),
  ],
  sources: [
    { label: "OWASP Top 10 for LLM Applications 2025", href: "https://genai.owasp.org/llm-top-10/" },
    { label: "OWASP LLM Prompt Injection Prevention Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html" },
    { label: "OWASP Authorization Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" },
  ],
  glossary: ["guardrails", "acl", "groundedness", "tool-calling", "mcp", "langgraph", "hitl"],
});
