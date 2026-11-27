import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D167 — Phase 6 / Block B42
 * Wire LangGraph Router (FAQ RAG vs Tool Lookup vs Escalation)
 */
export const d167: Lesson = defineLesson({
  day: 167,
  titleTh: "เชื่อม LangGraph Router แยกเส้นทาง FAQ RAG, Tool Lookup และ HITL Escalation",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ต่อสายพาน D165 + D166 เข้าด้วยกันด้วย Bounded StateGraph, max_steps <= 3 และ Checkpointer",
  icon: "route",
  visual: {
    id: "capstone-core-router",
    title: "LangGraph Router — 3 เส้นทางควบคุมแบบมีขอบเขต (max_steps <= 3)",
    caption: "คลิกดูเส้นทางที่ LangGraph Router เลือก: (1) FAQ RAG พร้อม Citations, (2) MCP Read Lookup, และ (3) Write Action / Escalation ที่หยุดรอ HITL",
    alt: "แผนภาพ LangGraph Router ที่มี input, 3 เส้นทางแยกตาม intent และ typed output",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ด้วย Bounded Router + In-Memory Checkpointer (ใช้โครงสร้าง State เดียวกับ LangGraph StateGraph)",
  tools: ["LangGraph", "Pydantic v2", "Checkpointer", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "เปลี่ยน Prompt เดียวทำทุกอย่าง เป็น Router ที่แยกงานตามเจตนา",
      body: "คำถามลูกค้ามี 3 ธรรมชาติที่ต่างกันสิ้นเชิง: ถามนโยบาย/FAQ, ถามสถานะออเดอร์/ทิกเก็ต, และขอแก้ไขข้อมูลหรือร้องเรียน การยัดทุกอย่างลง ReAct loop อิสระทำให้ช้า แพง และคาดเดายาก",
      lessonNote: "วันนี้เราใช้ {{workflow-patterns}} แบบ **Routing** บน {{langgraph}} เพื่อแยกส่งเข้าโหนดเฉพาะทางตั้งแต่วินาทีแรก",
    },
    {
      node: 2,
      heading: "เชื่อม D165 Grounded RAG และ D166 MCP Server เข้าใน State เดียว",
      body: "โหนดแต่ละตัวไม่ควรคุยกันด้วยข้อความดิบที่หลุดโครงสร้าง แต่ควรอ่านและเขียนผ่าน State Contract ที่ชัดเจน",
      lessonNote: "โหนด `faq_rag` เรียกตัวตอบแบบ Strict Citations (D165) ส่วนโหนด `mcp_lookup` และ `hitl_write` เรียก {{mcp}} Server (D166)",
    },
    {
      node: 4,
      heading: "คุมความปลอดภัยด้วย Bounded Steps (`max_steps <= 3`) และ HITL Interrupt",
      body: "Agent ใน Production ต้องมีเพดานจำนวนก้าวเสมอเพื่อกัน loop ไม่รู้จบ และต้องหยุดรอ {{hitl}} ก่อนทำ write action หรือเปิดทิกเก็ตส่งต่อเจ้าหน้าที่",
      lessonNote: "เราใช้ {{checkpointer}} จำสถานะของ `thread_id` เมื่อกราฟหยุดรอการยืนยัน แล้วกลับมาทำงานต่อ (resume) ได้ในรอบถัดไป",
    },
    {
      node: 5,
      heading: "เก็บ Route Trace และ Fallback ไป Escalation เมื่อระบบหลักไม่มั่นใจ",
      body: "ถ้าเส้นทาง `faq_rag` คืน `abstained` หรือ `mcp_lookup` เชื่อมต่อไม่ได้ ระบบต้องไม่จบด้วยหน้าจอว่างเปล่า",
      lessonNote: "Router ของเราจะเปลี่ยนเส้นทางไป `escalate` พร้อมบันทึก `route_history` สำหรับส่งเข้า {{structlog}} และ {{langfuse}} ใน B43",
    },
  ],

  objectives: [
    "**ออกแบบ StateGraph และ Router** ที่จำแนกคำขอเป็น `faq_rag`, `mcp_lookup`, `hitl_write`, หรือ `escalate` อย่างมีขอบเขต (`max_steps <= 3`)",
    "**ต่อโหนด D165 (Grounded RAG) และ D166 (MCP Read/Write)** เข้ากับ `Conditional Edges` พร้อมกลไก fallback สู่ `escalate` เมื่อ RAG ปฏิเสธหรือ Tool ล้มเหลว",
    "**จัดการ {{hitl}} Pause & Resume ผ่าน {{checkpointer}}** เพื่อหยุดกราฟรอคำตอบอนุมัติจากผู้ใช้ตาม `thread_id` แล้วทำงานต่อหรือยกเลิกอย่างปลอดภัย",
  ],

  prerequisites: [
    "สร้าง Grounded Answer Generator (D165) และ MCP Support Server (D166) แล้ว",
    "เข้าใจ {{langgraph}} StateGraph, Conditional Edges และ {{hitl}} Checkpoint (แนะนำ Day 116–118)",
    "เข้าใจ Anthropic {{workflow-patterns}} (Routing vs Autonomous Agent)",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "สร้างโมดูล Router หลักของ Capstone ใน `src/core_router.py` โดยออกแบบโครงสร้าง State และ Checkpoint ให้รันทดสอบได้ทันทีในเครื่องแบบ deterministic",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv add pydantic langgraph
uv add --dev pytest ruff
uv run python -c "import langgraph, pydantic; print('ok')"`,
    steps: [
      ["deps", "ติดตั้ง `langgraph` และ `pydantic` ในโปรเจกต์ `thai-enterprise-assistant/`"],
      ["import", "ตรวจว่า `import langgraph` ทำงานได้โดยไม่ต้องใช้ API key"],
      ["ready", "พร้อมเชื่อมโหนด FAQ RAG, MCP Lookup และ HITL Escalation เข้าด้วยกัน"],
    ],
    note: "แบบฝึกหัดใช้ Protocol/Callable สำหรับโหนด RAG, MCP และ Intent Classifier จึงรัน `pytest` ได้ 100% แบบ offline ในเสี้ยววินาที และสามารถคอมไพล์เป็น `StateGraph` ของ LangGraph จริงได้ด้วยสัญญาเดียวกัน",
  },

  concepts: [
    {
      id: "stategraph-and-bounded-routing",
      title: "1 · Bounded StateGraph: ทำไม Router + `max_steps <= 3` จึงดีกว่า Open-Ended Agent",
      paragraphs: [
        "ตามแนวทาง {{workflow-patterns|Building Effective Agents}} ของ Anthropic งานซัพพอร์ตองค์กรที่มีเส้นทางชัดเจนไม่ควรปล่อยเป็น Autonomous ReAct Agent ที่คิดวนเอง 10 รอบ เพราะทุกก้าวที่ LLM คิดเพิ่มหมายถึง {{ttft}} ที่ช้าลง ค่า token ที่พุ่งขึ้น และความเสี่ยงในการเรียก tool ผิดพลาด",
        "เราจึงออกแบบ {{langgraph}} **Bounded Router** ที่มี **State** ชัดเจน (`thread_id`, `query`, `route`, `step_count`, `answer_th`, `citations`, `pending_action`, `status`) และบังคับเพดาน **`max_steps <= 3`** ก้าว: (1) `classify_route` จำแนกเจตนา, (2) ทำงานในโหนดเฉพาะทาง (`faq_rag` / `mcp_lookup` / `hitl_write` / `escalate`), และ (3) `finalize` หรือ fallback เมื่อเกินงบก้าว",
        "การจำแนกเส้นทางใช้รูปแบบ **Hybrid Router**: กฎเร็ว (Fast Rule) จับรหัส `ORD-\\d{4}-\\d+` หรือ `TKT-\\d{4}-\\d+` เข้า `mcp_lookup` ทันทีใน < 1 ms และใช้ {{llm}} Structured Classifier (พร้อม fallback) เฉพาะคำถามที่ไม่มีรหัสชัดเจน",
      ],
      analogy:
        "เหมือนระบบตอบรับอัตโนมัติของโรงพยาบาลที่มีเคาน์เตอร์คัดกรองหน้าประตู (Router): ถ้าถือใบนัดมาส่งตรงช่องทะเบียน (Lookup), ถ้าถามเวลาทำการส่งช่องข้อมูล (RAG), ถ้าจะผ่าตัดหรือขอเคลมส่งห้องพยาบาลซักประวัติและเซ็นยินยอม (HITL) — ไม่ปล่อยคนไข้เดินวนหาห้องเอง 10 ชั้น",
      code: {
        language: "python",
        filename: "bounded_state.py",
        code: `from typing import Literal, TypedDict


class AssistantState(TypedDict):
    thread_id: str
    query: str
    route: Literal["faq_rag", "mcp_lookup", "hitl_write", "escalate"]
    step_count: int
    max_steps: int  # ล็อกเพดาน <= 3 เพื่อกัน infinite loop
    status: str
    answer_th: str
    trace_events: list[str]`,
        caption: "โครงสร้าง State สำหรับ LangGraph Router ที่คุมทั้งเส้นทาง เพดานจำนวนก้าว และร่องรอย trace_events ในออบเจกต์เดียว",
      },
      bullets: [
        "**`faq_rag`**: คำถามนโยบาย เงื่อนไขคืนสินค้า ค่าธรรมเนียม (เรียก D165 Grounded Generator)",
        "**`mcp_lookup`**: คำถามที่มีรหัส `ORD-...` หรือ `TKT-...` เพื่อเช็กสถานะ (เรียก D166 Read-Only Tool)",
        "**`hitl_write`**: คำร้องเปิดทิกเก็ตเคลม ขอแก้ไขข้อมูล (ต้องหยุดรอคนยืนยันก่อนเรียก D166 Write Gate)",
        "**`escalate`**: คำถามนอกขอบเขต คำร้องด่วน หรือกรณีที่ `faq_rag` ตอบว่า `abstained`",
      ],
      whyTitle: "Why this matters — ความคาดเดาได้ (Predictability) คือหัวใจของ Production AI",
      whyParagraphs: [
        "เมื่อเส้นทางถูกจำกัดด้วย `max_steps <= 3` และ Conditional Edges ที่ชัดเจน คุณสามารถเขียน unit test พิสูจน์ได้ทุกเส้นทางว่าไม่มีวันเกิด infinite loop และคุม P95 latency ให้อยู่ใต้ 3.5 วินาทีได้จริง",
        "และยังทำให้การทำ Evaluation แยกตามเส้นทางใน B43 ง่ายกว่าการไล่แกะ agent trajectory ยาว 15 ขั้นมาก",
      ],
    },
    {
      id: "three-routes-and-fallback",
      title: "2 · Conditional Routing & Graceful Fallback ข้ามเส้นทาง",
      paragraphs: [
        "จุดแข็งของการต่อท่อด้วย {{langgraph}} แทนการใช้ `if/else` แบบตายตัวคือ **การส่งต่อระหว่างโหนดเมื่อเกิดความไม่แน่นอน (Dynamic Fallback)**: ตัวอย่างเช่น ผู้ใช้ถามเรื่องนโยบายที่ไม่อยู่ในเอกสาร (`route = faq_rag`) เมื่อโหนด RAG ของ D165 คืน `status = \"abstained\"` แทนที่จะจบแค่นั้น Conditional Edge สามารถส่งต่อไปโหนด `escalate` เพื่อเสนอเปิดทิกเก็ตให้เจ้าหน้าที่ติดต่อกลับ",
        "ในทำนองเดียวกัน หากผู้ใช้ถามเช็กออเดอร์ (`route = mcp_lookup`) แต่ MCP Server คืน `timeout` หรือ `server_disconnected` Router ต้องจับสถานะความล้มเหลวแล้วคืนคำตอบแบบ Graceful Degradation (เช่น แจ้งสถานะขัดข้องชั่วคราวและเสนอส่งต่อเจ้าหน้าที่) แทนการปล่อย Exception พังทั้งกราฟ",
        "ทุกการเปลี่ยนโหนดควรถูกบันทึกไว้ใน `trace_events` (เช่น `[\"classify:faq_rag\", \"rag:abstained\", \"escalate:ready\"]`) เพื่อใช้ตรวจสอบย้อนหลังและทำ observability",
      ],
      analogy:
        "เหมือนสายการบินที่มีแผนสำรองชัดเจน: ถ้าช่องเช็กอินอัตโนมัติอ่านพาสปอร์ตไม่ออก (RAG abstained / Tool timeout) เครื่องจะส่งคุณไปช่องพนักงานตัวจริงทันที (Escalate) ไม่ใช่ค้างหน้าจอดำแล้วไล่กลับบ้าน",
      code: {
        language: "python",
        filename: "router_edges.py",
        code: `from typing import Literal

Route = Literal["faq_rag", "mcp_lookup", "hitl_write", "escalate"]


def next_after_rag(rag_status: str, step_count: int, max_steps: int = 3) -> str:
    if step_count >= max_steps:
        return "escalate"
    if rag_status == "answered":
        return "done"
    # เมื่อ RAG ปฏิเสธ (abstained) ให้ส่งต่อไปเส้นทาง Escalation
    return "escalate"


def next_after_lookup(tool_ok: bool, error_code: str | None) -> str:
    if tool_ok:
        return "done"
    if error_code in {"timeout", "server_disconnected"}:
        return "escalate"
    return "done"  # เช่น not_found คืนแจ้งผู้ใช้ได้เลยไม่ต้อง escalate`,
        caption: "Conditional Edges แยกกรณี 'ไม่พบเลขสั่งซื้อ' (แจ้งผู้ใช้ตรง ๆ) ออกจากกรณี 'ระบบล่ม/RAG ไม่พบข้อมูล' (ส่งต่อ Escalate)",
      },
      whyTitle: "Why this matters — เปลี่ยนความล้มเหลวของโหนดเดี่ยวให้เป็นประสบการณ์ที่ต่อเนื่อง",
      whyParagraphs: [
        "ในระบบจริง ไม่มีโมดูลไหนทำงานสำเร็จ 100% ตลอดเวลา — Retriever อาจไม่เจอเอกสาร หรือ Tool อาจ timeout",
        "การออกแบบ Conditional Fallback ให้ชัดเจนในระดับกราฟทำให้ระบบทั้งหมดทนทานและได้คะแนน Reliability สูงใน Capstone Rubric",
      ],
    },
    {
      id: "checkpointer-and-hitl-resume",
      title: "3 · Checkpointer & HITL Pause/Resume สำหรับ Write Action",
      paragraphs: [
        "เมื่อผู้ใช้พิมพ์ว่า *\"ช่วยเปิดทิกเก็ตเคลมให้ ORD-2026-104 หน่อย กล่องบุบ\"* Router จะจำแนกเป็น `hitl_write` (หรือ `escalate` ที่ต้องสร้างทิกเก็ต) กราฟจะสร้าง Draft Preview (`pending_action`) แล้ว **หยุดกราฟไว้กลางทาง (Interrupt)** พร้อมบันทึก state ทั้งหมดลง {{checkpointer}} ผูกกับ `thread_id`",
        "จังหวะนี้ API จะตอบกลับไปหาผู้ใช้ว่า *\"ยืนยันการเปิดทิกเก็ตสำหรับ ORD-2026-104: กล่องบุบ หรือไม่?\"* — ระหว่างรอคำตอบ ฐานข้อมูลยังไม่ถูกแก้ไข และโปรเซส Python ไม่ต้องนั่งรอค้าง (ไม่ต้องใช้ thread blocking)",
        "เมื่อผู้ใช้ส่งคำตอบกลับมาในเทิร์นถัดไปด้วย `thread_id` เดิม (`approve=True` หรือ `approve=False`) Router จะโหลด state จาก Checkpointer ขึ้นมาทำงานต่อ: ถ้า `approve=True` ระบบจะ inject `approval_token` ฝั่งแอปส่งให้ MCP Write Tool (D166) เพื่อบันทึกจริง แต่ถ้า `approve=False` จะเปลี่ยนสถานะเป็น `cancelled` อย่างสะอาด",
      ],
      analogy:
        "เหมือนการกด 'Save Game' ตรงหน้าห้องบอส (Checkpointer) เพื่อรอผู้เล่นกดปุ่ม Confirm ว่าจะเข้าสู้หรือไม่ — จะปิดเกมแล้วกลับมาเล่นพรุ่งนี้ก็ยังต่อจากจุดเดิมเป๊ะ ถ้ากดยกเลิกก็แค่ถอยออกโดยไม่มีอะไรเสียหาย",
      bullets: [
        "**ผูกกับ `thread_id`**: 1 ห้องแชต = 1 `thread_id` ทำให้ผู้ใช้หลายคนขออนุมัติพร้อมกันได้โดย state ไม่ตีกัน",
        "**แยก Cancel ออกจาก Error**: เมื่อผู้ใช้กดปฏิเสธ (`approved=False`) กราฟต้องจบอย่างสุภาพ (`status=\"cancelled\"`) ไม่ใช่โยน exception",
        "**No Double Commit**: เมื่อ resume และ commit สำเร็จแล้ว ต้องล้าง `pending_action` และใช้ `idempotency_key` ผูกกับ `thread_id` เสมอ",
      ],
      whyTitle: "Why this matters — พิสูจน์ได้ว่า HITL ทำงานจริงข้ามเทิร์นไม่ใช่แค่ mock ใน 1 ฟังก์ชัน",
      whyParagraphs: [
        "ในการสัมภาษณ์หรือ Demo วัน Milestone 3 กรรมการมักขอดูจังหวะที่บอตหยุดถามก่อนแก้ข้อมูลจริง แล้วกด Confirm เพื่อดูข้อมูลเข้า SQLite และกด Reject เพื่อดูว่าไม่เข้า SQLite",
        "การมี Checkpointer + `resume(thread_id, approved=...)` ที่สะอาดพร้อมใช้ ทำให้ FastAPI Endpoint ใน B44 ต่อเข้ากับกราฟนี้ได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — LangGraph Router เทียบกับ State Machine / Workflow Engine",
      body: [
        "หากคุณเคยใช้ XState, Temporal หรือเขียน Backend Step Function ในเว็บแอป โครงสร้าง LangGraph Router คือ State Machine ที่มี Persistence ประจำ `thread_id`:",
      ],
      table: [
        ["`AssistantState`", "State Machine Context (Typed Object ประจำ session)"],
        ["Conditional Edges (`route_intent`)", "Transition Function จาก current node + result -> next node"],
        ["LangGraph Checkpointer", "Session/Workflow Snapshot Store (Memory / SQLite / Postgres)"],
        ["`interrupt()` + `resume(approved)`", "Async Approval Webhook / Confirmation Step"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมต้องเก็บ `step_count` และ `max_steps` ใน State?",
      body: [
        "ในโปรแกรมที่มีการกระโดดข้ามโหนด (เช่น `faq_rag` → `escalate` หรือ retry) ถ้าเงื่อนไขผิดพลาดนิดเดียวอาจเกิดวงจรวนซ้ำ (`A -> B -> A -> B`) จนโปรแกรมค้างหรือกินโควตา API หมดภายในไม่กี่วินาที",
        "การเพิ่มตัวนับ `step_count += 1` ในทุกโหนดและเช็ก `if step_count >= max_steps` เป็นเกราะกันภัยง่าย ๆ ที่รับประกันทางคณิตศาสตร์ได้ว่าฟังก์ชันจะหยุดทำงานภายในไม่เกิน `max_steps` รอบแน่นอน",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองสร้างตัวควบคุมเส้นทาง `SupportRouter` ที่มี Checkpointer ในหน่วยความจำ, ตัวจำแนกเส้นทางแบบ Rule + Classifier, และเพดาน `max_steps <= 3` เพื่อลองรันครบทั้ง 3 เส้นทาง กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · นิยาม Router State Contract และตัวจำแนกเส้นทาง",
        explain:
          "ใช้ regex จับรหัส `ORD-...`/`TKT-...` เข้า `mcp_lookup` แบบ fast-path และคำขอเปิดทิกเก็ตเข้า `hitl_write` ส่วนคำถามนโยบายเข้า `faq_rag`",
        code: {
          language: "python",
          filename: "worked_router.py",
          code: `import re
from typing import Literal
from pydantic import BaseModel, Field

RouteName = Literal["faq_rag", "mcp_lookup", "hitl_write", "escalate"]


class RouterState(BaseModel):
    thread_id: str
    query: str
    route: RouteName | None = None
    status: Literal["completed", "awaiting_approval", "cancelled", "escalated"] = "completed"
    answer_th: str = ""
    step_count: int = 0
    trace_events: list[str] = Field(default_factory=list)


def classify_intent(query: str) -> RouteName:
    q = query.strip()
    if any(k in q for k in ("เปิดทิกเก็ต", "แจ้งเคลม", "create ticket")):
        return "hitl_write"
    if re.search(r"\\b(ORD|TKT)-\\d{4}-\\d{3,}\\b", q, re.IGNORECASE):
        return "mcp_lookup"
    if any(k in q for k in ("คุยกับคน", "ติดต่อเจ้าหน้าที่", "escalate")):
        return "escalate"
    return "faq_rag"`,
        },
      },
      {
        title: "2 · ต่อโหนดและ Checkpointer สำหรับ Pause / Resume",
        explain:
          "เมื่อเส้นทางเป็น `hitl_write` กราฟจะบันทึก `RouterState` ลงใน `self.checkpoints[thread_id]` แล้วหยุดที่ `awaiting_approval` จนกว่าจะมีการเรียก `resume()`",
        code: {
          language: "python",
          filename: "worked_router.py",
          code: `class MiniLangGraphRouter:
    def __init__(self, max_steps: int = 3) -> None:
        self.max_steps = max_steps
        self.checkpoints: dict[str, RouterState] = {}

    def invoke(self, thread_id: str, query: str) -> RouterState:
        state = RouterState(thread_id=thread_id, query=query)
        state.route = classify_intent(query)
        state.step_count += 1
        state.trace_events.append(f"route:{state.route}")

        if state.route == "hitl_write":
            state.status = "awaiting_approval"
            state.answer_th = "กรุณายืนยันการเปิดทิกเก็ตก่อนบันทึกลงระบบ"
            state.trace_events.append("hitl:interrupt")
            self.checkpoints[thread_id] = state
            return state

        state.step_count += 1
        if state.route == "mcp_lookup":
            state.answer_th = "พบสถานะจาก MCP Tool: shipped"
            state.trace_events.append("mcp:lookup_ok")
        elif state.route == "faq_rag":
            state.answer_th = "คืนสินค้าได้ภายใน 14 วัน [pol-refund#2]"
            state.trace_events.append("rag:answered")
        else:
            state.status = "escalated"
            state.answer_th = "กำลังส่งต่อคำขอไปยังเจ้าหน้าที่"
            state.trace_events.append("escalate:handoff")
        self.checkpoints[thread_id] = state
        return state

    def resume(self, thread_id: str, approved: bool) -> RouterState:
        state = self.checkpoints[thread_id]
        state.step_count += 1
        if approved and state.step_count <= self.max_steps:
            state.status = "completed"
            state.answer_th = "เปิดทิกเก็ต TKT-2026-002 สำเร็จแล้ว"
            state.trace_events.append("hitl:committed")
        else:
            state.status = "cancelled"
            state.answer_th = "ยกเลิกการเปิดทิกเก็ตตามคำขอ"
            state.trace_events.append("hitl:cancelled")
        return state`,
        },
      },
      {
        title: "3 · ทดสอบการ Routing ทั้ง 3 เส้นทาง + HITL Resume",
        explain:
          "รันทดสอบ 3 `thread_id`: FAQ RAG, MCP Order Lookup, และ HITL Write (Pause แล้ว Resume อนุมัติ) พร้อมเช็ก `step_count <= 3`",
        code: {
          language: "python",
          filename: "worked_router.py",
          code: `router = MiniLangGraphRouter(max_steps=3)
r1 = router.invoke("t1", "นโยบายคืนสินค้ากี่วัน")
r2 = router.invoke("t2", "เช็กสถานะ ORD-2026-104 ให้หน่อย")
r3_pause = router.invoke("t3", "เปิดทิกเก็ตเคลม ORD-2026-104")
r3_done = router.resume("t3", approved=True)

for label, res in [("FAQ", r1), ("MCP", r2), ("PAUSE", r3_pause), ("RESUME", r3_done)]:
    print(f"{label:6s} | status={res.status:17s} | steps={res.step_count} | trace={res.trace_events}")`,
        },
        output: `FAQ    | status=completed         | steps=2 | trace=['route:faq_rag', 'rag:answered']
MCP    | status=completed         | steps=2 | trace=['route:mcp_lookup', 'mcp:lookup_ok']
PAUSE  | status=awaiting_approval | steps=1 | trace=['route:hitl_write', 'hitl:interrupt']
RESUME | status=completed         | steps=2 | trace=['route:hitl_write', 'hitl:interrupt', 'hitl:committed']`,
      },
    ],
    gotcha:
      "จุดสังเกต: อย่าเผลอเช็กคำว่า `ORD-2026-104` ก่อนคำว่า `เปิดทิกเก็ต` ใน Router! เพราะคำถามแบบ *\"เปิดทิกเก็ตเคลมให้ ORD-2026-104 หน่อย\"* มีทั้งคำขอเปิดทิกเก็ตและรหัสออเดอร์อยู่ในประโยคเดียวกัน จึงต้องตรวจเจตนา Write/HITL (`hitl_write`) ให้สำคัญกว่า Read Lookup (`mcp_lookup`) เสมอ",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/core_router.py` เพื่อเชื่อมโหนด `faq_rag`, `mcp_lookup`, `hitl_write` และ `escalate` เข้าด้วยกัน พร้อม `Checkpointer`, `max_steps <= 3`, และ fallback เมื่อ RAG ปฏิเสธ",
    requirements: [
      "สร้าง `RouterResult(BaseModel)` มี `thread_id: str`, `route: Literal[\"faq_rag\", \"mcp_lookup\", \"hitl_write\", \"escalate\"]`, `status: Literal[\"completed\", \"awaiting_approval\", \"cancelled\", \"escalated\"]`, `answer_th: str`, `citations: list[str] = []`, `pending_action: dict | None = None`, `step_count: int`, และ `trace_events: list[str]`",
      "สร้าง `classify_route(query: str) -> Literal[\"faq_rag\", \"mcp_lookup\", \"hitl_write\", \"escalate\"]` โดยเรียงลำดับความสำคัญ: (1) คำขอสร้าง/เปิดทิกเก็ต (`เปิดทิกเก็ต`, `แจ้งเคลม`, `create ticket`) -> `hitl_write`, (2) คำขอคุยเจ้าหน้าที่ (`ติดต่อเจ้าหน้าที่`, `คุยกับคน`, `escalate`) -> `escalate`, (3) พบรหัส `ORD-\\d{4}-\\d{3,}` หรือ `TKT-\\d{4}-\\d{3,}` -> `mcp_lookup`, (4) อื่น ๆ -> `faq_rag`",
      "สร้าง `CoreRouter` ที่รับ `rag_fn: Callable[[str], dict]`, `lookup_fn: Callable[[str], dict]`, `write_fn: Callable[[dict, bool], dict]`, และ `max_steps: int = 3` (หาก `max_steps < 1 or max_steps > 5` โยน `ValueError`)",
      "เมธอด `invoke(thread_id: str, query: str) -> RouterResult`: (a) `faq_rag`: เรียก `rag_fn(query)` — ถ้า `res[\"status\"] == \"answered\"` คืน `status=\"completed\"` พร้อม `citations`; ถ้า `res[\"status\"] == \"abstained\"` ให้เปลี่ยนต่อไปเส้นทาง `escalate` (`status=\"escalated\"`) โดยไม่เกิน `max_steps`, (b) `mcp_lookup`: ดึงรหัส ID แรกแล้วเรียก `lookup_fn(entity_id)` — ถ้า `ok` เป็น `True` คืน `completed`, ถ้า `error_code` เป็น `\"timeout\"` หรือ `\"server_disconnected\"` ให้ fallback เป็น `status=\"escalated\"`, (c) `hitl_write`: หยุดรอ (`status=\"awaiting_approval\"`) โดยเก็บ `pending_action` ลง checkpointer (`self.checkpoints[thread_id]`) และ **ยังไม่เรียก** `write_fn`",
      "เมธอด `resume(thread_id: str, approved: bool) -> RouterResult`: โหลด state จาก `self.checkpoints` (ถ้าไม่มี `thread_id` หรือสถานะไม่ใช่ `awaiting_approval` โยน `ValueError`); ถ้า `approved=True` เรียก `write_fn(pending_action, True)` แล้วคืน `completed` (และเช็ก `step_count <= max_steps`); ถ้า `approved=False` คืน `status=\"cancelled\"` โดยไม่เรียก `write_fn`",
    ],
    starter: {
      language: "python",
      filename: "src/core_router.py",
      code: `from __future__ import annotations

import re
from typing import Any, Callable, Literal
from pydantic import BaseModel, Field

RouteName = Literal["faq_rag", "mcp_lookup", "hitl_write", "escalate"]
ID_PATTERN = re.compile(r"\\b((?:ORD|TKT)-\\d{4}-\\d{3,})\\b", re.IGNORECASE)


class RouterResult(BaseModel):
    thread_id: str
    route: RouteName
    status: Literal["completed", "awaiting_approval", "cancelled", "escalated"]
    answer_th: str
    citations: list[str] = Field(default_factory=list)
    pending_action: dict[str, Any] | None = None
    step_count: int = Field(ge=1)
    trace_events: list[str] = Field(default_factory=list)


def classify_route(query: str) -> RouteName:
    # TODO: แยกเส้นทางตามลำดับความสำคัญ hitl_write -> escalate -> mcp_lookup -> faq_rag
    raise NotImplementedError


class CoreRouter:
    def __init__(
        self,
        rag_fn: Callable[[str], dict[str, Any]],
        lookup_fn: Callable[[str], dict[str, Any]],
        write_fn: Callable[[dict[str, Any], bool], dict[str, Any]],
        *,
        max_steps: int = 3,
    ) -> None:
        # TODO: validate max_steps 1..5 และเตรียม self.checkpoints: dict[str, RouterResult]
        raise NotImplementedError

    def invoke(self, thread_id: str, query: str) -> RouterResult:
        # TODO: จำแนกเส้นทาง -> รันโหนด + fallback -> บันทึกลง checkpoints
        raise NotImplementedError

    def resume(self, thread_id: str, approved: bool) -> RouterResult:
        # TODO: โหลดจาก checkpoints -> approved=True เรียก write_fn, approved=False คืน cancelled
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_core_router.py",
      code: `import pytest
from src.core_router import CoreRouter, classify_route


def _build_router(*, rag_abstain: bool = False, lookup_timeout: bool = False):
    write_calls: list[tuple[dict, bool]] = []

    def rag_fn(_q: str) -> dict:
        if rag_abstain:
            return {"status": "abstained", "answer_th": "ไม่พบข้อมูล", "citations": []}
        return {"status": "answered", "answer_th": "คืนได้ภายใน 14 วัน [pol-refund#2]", "citations": ["pol-refund#2"]}

    def lookup_fn(entity_id: str) -> dict:
        if lookup_timeout:
            return {"ok": False, "error_code": "timeout", "message": "MCP timeout"}
        return {"ok": True, "data": {"id": entity_id, "status": "shipped"}, "message": "ok"}

    def write_fn(action: dict, approved: bool) -> dict:
        write_calls.append((action, approved))
        return {"ok": True, "ticket_id": "TKT-2026-009"}

    return CoreRouter(rag_fn, lookup_fn, write_fn, max_steps=3), write_calls


def test_faq_rag_answered_and_abstained_escalates():
    ok_router, _ = _build_router(rag_abstain=False)
    r_ok = ok_router.invoke("t-faq-1", "นโยบายคืนสินค้ากี่วัน")
    assert r_ok.route == "faq_rag"
    assert r_ok.status == "completed"
    assert r_ok.citations == ["pol-refund#2"]
    assert r_ok.step_count <= 3

    esc_router, _ = _build_router(rag_abstain=True)
    r_esc = esc_router.invoke("t-faq-2", "ถามโปรลับเดือนหน้า")
    assert r_esc.status == "escalated"
    assert r_esc.step_count <= 3


def test_mcp_lookup_and_timeout_fallback():
    router, _ = _build_router(lookup_timeout=False)
    res = router.invoke("t-ord-1", "เช็กสถานะ ORD-2026-104 หน่อย")
    assert res.route == "mcp_lookup"
    assert res.status == "completed"
    assert "ORD-2026-104" in res.answer_th or "shipped" in res.answer_th

    slow_router, _ = _build_router(lookup_timeout=True)
    res_slow = slow_router.invoke("t-ord-2", "เช็กสถานะ ORD-2026-104 หน่อย")
    assert res_slow.status == "escalated"


def test_hitl_write_interrupts_before_commit_and_resumes_safely():
    router, write_calls = _build_router()
    paused = router.invoke("t-hitl-1", "เปิดทิกเก็ตเคลม ORD-2026-104 กล่องบุบ")

    assert paused.route == "hitl_write"
    assert paused.status == "awaiting_approval"
    assert paused.pending_action is not None
    assert write_calls == []

    done = router.resume("t-hitl-1", approved=True)
    assert done.status == "completed"
    assert done.step_count <= 3
    assert len(write_calls) == 1
    assert "TKT-2026-009" in done.answer_th


def test_hitl_reject_cancels_without_calling_write_fn():
    router, write_calls = _build_router()
    router.invoke("t-hitl-2", "แจ้งเคลม ORD-2026-104")
    cancelled = router.resume("t-hitl-2", approved=False)

    assert cancelled.status == "cancelled"
    assert write_calls == []


def test_route_priority_and_invalid_resume_raise():
    assert classify_route("เปิดทิกเก็ตให้ ORD-2026-104") == "hitl_write"
    assert classify_route("เช็ก TKT-2026-001") == "mcp_lookup"
    assert classify_route("ขอคุยกับเจ้าหน้าที่") == "escalate"

    router, _ = _build_router()
    with pytest.raises(ValueError):
        router.resume("missing-thread", approved=True)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_core_router.py` แล้วผ่านครบทั้ง 5 test cases",
      "ตรวจว่า `classify_route` ให้ความสำคัญกับ `hitl_write` มากกว่า `mcp_lookup` เมื่อมีทั้งคำขอเปิดทิกเก็ตและ `ORD-...` ในประโยคเดียวกัน",
      "ตรวจว่าเมื่อ RAG ตอบ `abstained` หรือ MCP `timeout` ระบบ fallback ไปยัง `escalated` โดย `step_count <= 3`",
      "ตรวจว่า `hitl_write` หยุดรอที่ `awaiting_approval` และเรียก `write_fn` เฉพาะตอน `resume(..., approved=True)` เท่านั้น",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_core_router.py` และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "ใน `classify_route` ให้เช็กคำสำคัญของ `hitl_write` ก่อนเป็นอันดับแรก, ตามด้วย `escalate`, แล้วค่อยเช็ก `ID_PATTERN.search(query)` สำหรับ `mcp_lookup` เพื่อกันไม่ให้คำสั่งเปิดทิกเก็ตที่มีเลข `ORD-...` หลุดไปที่ lookup",
      },
      {
        body: "ใน `CoreRouter.invoke` ให้บันทึก `result` ลง `self.checkpoints[thread_id] = result` ก่อนคืนค่าเสมอ และใน `resume` ให้เช็ก `if thread_id not in self.checkpoints or self.checkpoints[thread_id].status != \"awaiting_approval\": raise ValueError(...)`",
      },
      {
        body: "โครงหลักของ `CoreRouter.invoke` และ `resume` — เติมรายละเอียดการแตกข้อความตอบและ `trace_events` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day167.py",
          code: `def invoke(self, thread_id: str, query: str) -> RouterResult:
    route = classify_route(query)
    events = [f"route:{route}"]
    steps = 1

    if route == "hitl_write":
        match = ID_PATTERN.search(query)
        action = {"order_id": match.group(1).upper() if match else None, "issue": query}
        res = RouterResult(
            thread_id=thread_id,
            route=route,
            status="awaiting_approval",
            answer_th="กรุณายืนยันการสร้างทิกเก็ตก่อนบันทึกลงระบบ",
            pending_action=action,
            step_count=steps,
            trace_events=[*events, "hitl:interrupt"],
        )
        self.checkpoints[thread_id] = res
        return res
    # TODO: จัดการ faq_rag (+ escalate fallback), mcp_lookup (+ timeout fallback), escalate`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_core_router.py
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "เช็ก Pattern รหัสออเดอร์ (`ORD-...`) ก่อนเช็กเจตนาเปิดทิกเก็ต (`hitl_write`)",
      symptom: "เมื่อผู้ใช้พิมพ์ *\"เปิดทิกเก็ตเคลม ORD-2026-104\"* ระบบกลับวิ่งไปที่ `mcp_lookup` แทนที่จะหยุดขออนุมัติเปิดทิกเก็ต",
      fix: "จัดลำดับความสำคัญใน Router ให้ตรวจสอบเจตนา Write/HITL และ Escalation ก่อน Fast-Path Read Lookup เสมอ",
    },
    {
      title: "ปล่อยให้ LangGraph วิ่งแบบไม่มี `max_steps` Guard",
      symptom: "เมื่อเกิด fallback หรือ tool error ซ้ำ ๆ กราฟวนเรียก LLM ไม่หยุดจน timeout และเปลืองค่า API",
      fix: "กำหนด `step_count` ใน State และบังคับเพดาน `max_steps <= 3` ที่ส่งเข้า `escalate` ทันทีเมื่อครบโควตา",
    },
    {
      title: "ไม่มี Checkpointer แยกตาม `thread_id` สำหรับจุดหยุด HITL",
      symptom: "เมื่อผู้ใช้ 2 คนขออนุมัติพร้อมกัน หรือปิดหน้าแชตแล้วเปิดใหม่ สถานะ `pending_action` หายหรือสลับกัน",
      fix: "ผูกสถานะกราฟกับ `thread_id` ใน {{checkpointer}} และล้าง `pending_action` หลัง commit หรือ cancel เสร็จ",
    },
    {
      title: "ปล่อยให้เส้นทาง `faq_rag` จบแบบเงียบ ๆ เมื่อ RAG คืน `abstained`",
      symptom: "ผู้ใช้ถามนอกเอกสารแล้วได้คำตอบห้วน ๆ โดยไม่มีทางเลือกส่งต่อเจ้าหน้าที่",
      fix: "เชื่อม Conditional Edge จาก `rag:abstained` ไปสู่ `escalate` เพื่อให้ประสบการณ์ผู้ใช้ต่อเนื่องและตรวจสอบได้",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d167-q1",
        "เหตุใดระบบ Enterprise AI Assistant ใน Capstone จึงเลือกใช้ **Bounded LangGraph Router (`max_steps <= 3`)** แทน Open-Ended ReAct Agent ที่คิดวนได้ไม่จำกัดรอบ?",
        [
          ["เพราะ LangGraph ไม่รองรับการเขียนลูปเกิน 3 รอบ", "LangGraph รองรับลูปหลายรอบได้ แต่เราตั้งใจจำกัดเพื่อการควบคุมใน Production"],
          ["เพื่อคุมความคาดเดาได้ คุม P95 latency ต้นทุน token และป้องกัน infinite loop ในงานที่มีเส้นทางชัดเจน", "ถูก — งานซัพพอร์ตมี 3 เส้นทางหลัก การใช้ Bounded Router เร็วกว่า ถูกกว่า และทดสอบซ้ำได้ 100%"],
          ["เพราะ Open-Ended Agent เรียกใช้ MCP Tool ไม่ได้", "Agent เรียก MCP Tool ได้ แต่มีความเสี่ยง loop และเรียกเกินขอบเขตสูงกว่า"],
          ["เพื่อไม่ต้องใช้ Pydantic validation ในแต่ละโหนด", "Bounded Router ยังคงใช้ Pydantic ตรวจสัญญาข้อมูลทุกจุด"],
        ],
        "B",
        "ตามหลัก Workflow Patterns งานที่มีเส้นทางชัดเจนอย่าง FAQ RAG, Lookup และ HITL Write เหมาะกับ Bounded Router ที่คุม latency และลดความเสี่ยง loop ได้ดีที่สุด",
        "ทำไม Capstone จึงใช้ Bounded Router (`max_steps <= 3`) แทน Autonomous ReAct Agent?",
        "เพราะคุม latency และต้นทุนได้แน่นอน ป้องกัน infinite loop และทดสอบทุกเส้นทางแบบ deterministic ได้ง่ายกว่า",
      ),
      mc(
        "d167-q2",
        "เมื่อผู้ใช้พิมพ์ว่า *\"ช่วยเปิดทิกเก็ตเคลมสินค้า ORD-2026-104 ให้หน่อย\"* ฟังก์ชัน `classify_route` ควรเลือกเส้นทางใดและเพราะอะไร?",
        [
          ["เลือก `mcp_lookup` เพราะตรวจพบรหัส `ORD-2026-104`", "ผิดเจตนาหลัก — ผู้ใช้ต้องการเปิดทิกเก็ตใหม่ ไม่ใช่แค่ถามสถานะ"],
          ["เลือก `hitl_write` เพราะมีเจตนาแก้ไข/สร้างข้อมูล ซึ่งต้องตรวจจับก่อน fast-path `mcp_lookup`", "ถูก — ลำดับความสำคัญของ Router ต้องตรวจ Write/HITL ก่อน Read Lookup เสมอ"],
          ["เลือก `faq_rag` เพื่ออธิบายขั้นตอนการเปิดทิกเก็ตอย่างเดียว", "ไม่ตอบสนองความต้องการลงมือเปิดทิกเก็ตของผู้ใช้"],
          ["ส่งเข้าทั้ง `mcp_lookup` และ `hitl_write` โดยให้ `write_fn` ทำงานทันทีไม่ต้องรอ", "ผิดหลัก Safe Write Gate — ห้ามข้าม HITL approval"],
        ],
        "B",
        "ประโยคที่มีทั้งรหัส `ORD-...` และเจตนา `เปิดทิกเก็ต/แจ้งเคลม` ต้องถูกส่งไป `hitl_write` ก่อนเสมอ เพื่อให้ผ่านด่านขออนุมัติจากมนุษย์",
        "ถ้าข้อความมีทั้งคำสั่ง 'เปิดทิกเก็ต' และรหัส 'ORD-2026-104' Router ต้องเลือกทางไหน?",
        "เลือก `hitl_write` โดยเช็กกฎ Write/HITL ก่อน fast-path `mcp_lookup` เสมอ",
      ),
      mc(
        "d167-q3",
        "บทบาทของ **Checkpointer** ร่วมกับ `thread_id` เมื่อกราฟเดินเข้าสู่โหนด `hitl_write` คืออะไร?",
        [
          ["บีบอัดไฟล์ PDF ในคลังความรู้ให้เล็กลง", "Checkpointer จัดการ state ของกราฟ ไม่ใช่การบีบอัดเอกสาร"],
          ["บันทึก state และ `pending_action` ณ จุดหยุด `awaiting_approval` ไว้เพื่อให้ `resume(thread_id, approved=...)` ทำงานต่อในเทิร์นถัดไปได้ตรง session", "ถูก — ทำให้หยุดรอมนุษย์ข้าม HTTP request ได้โดยไม่บล็อกเซิร์ฟเวอร์และ state ไม่ปนกัน"],
          ["ใช้แทนการทำ PDPA Redaction", "Checkpointer เก็บ state ไม่ได้ทำ PII masking"],
          ["เพิ่มค่า `Recall@5` ของ Vector Search", "Checkpointer เป็นส่วนควบคุม state ของ workflow ไม่เกี่ยวกับ retrieval"],
        ],
        "B",
        "Checkpointer ช่วยให้ workflow หยุดรอคำตอบจากมนุษย์ได้ข้ามรอบสนทนาและกลับมาทำงานต่อได้ตรงจุดเดิมตาม `thread_id`",
        "Checkpointer ช่วยให้ HITL Interrupt ใน LangGraph ทำงานข้ามเทิร์นได้อย่างไร?",
        "บันทึก state และ `pending_action` ผูกกับ `thread_id` ณ จุดหยุด `awaiting_approval` แล้วโหลดกลับมาทำต่อเมื่อเรียก `resume(thread_id, approved)`",
      ),
      mc(
        "d167-q4",
        "ในกรณีที่ผู้ใช้ถามนโยบาย (`faq_rag`) แล้วโหนด D165 คืน `status=\"abstained\"` Router ควรจัดการต่อไปอย่างไร?",
        [
          ["ปล่อยให้ LLM แต่งคำตอบใหม่โดยไม่ใส่ citation", "อันตราย — เป็นการสร้างคำตอบหลอน"],
          ["สลับเส้นทางผ่าน Conditional Edge ไปยัง `escalate` (ภายในงบ `max_steps`) เพื่อแจ้งผู้ใช้และเสนอทางส่งต่อเจ้าหน้าที่", "ถูก — เปลี่ยนความล้มเหลวของเอกสารให้เป็นการส่งต่อที่ชัดเจนและปลอดภัย"],
          ["สั่งเรียก `create_support_ticket` ลง SQLite อัตโนมัติทันทีโดยไม่ถามผู้ใช้", "ผิดกฎ HITL — ห้ามสร้างข้อมูลลงฐานข้อมูลโดยไม่ขออนุมัติ"],
          ["โยน `ValidationError` ให้เซิร์ฟเวอร์ตอบ HTTP 500", "Abstention เป็นพฤติกรรมปกติที่ต้องจัดการอย่างสง่างาม ไม่ใช่ system crash"],
        ],
        "B",
        "Conditional Edge จาก `rag:abstained` ไป `escalate` ช่วยให้ผู้ใช้ไม่เจอทางตันและระบบยังคงรักษาความซื่อสัตย์ของคำตอบไว้ได้",
        "เมื่อโหนด `faq_rag` คืน `abstained` Router ควรส่งต่อไปโหนดใด?",
        "ส่งต่อไปโหนด `escalate` ผ่าน Conditional Edge ภายในเพดาน `max_steps <= 3`",
      ),
    ],
  },

  takeaways: [
    "ใช้ **Bounded {{langgraph}} Router (`max_steps <= 3`)** แยกเส้นทาง `faq_rag`, `mcp_lookup`, `hitl_write` และ `escalate` เพื่อคุม latency และป้องกัน loop",
    "เรียงลำดับกฎการ route ให้จับ **`hitl_write` และ `escalate` ก่อน `mcp_lookup`** เพื่อไม่ให้คำสั่งเปิดทิกเก็ตที่มีรหัส `ORD-...` หลุดไปที่ lookup",
    "เชื่อม Conditional Fallback จาก `rag:abstained` และ `mcp:timeout` ไปยัง `escalate` เพื่อให้ระบบพังอย่างสง่างาม",
    "ใช้ **{{checkpointer}} ผูก `thread_id`** เพื่อหยุดกราฟรอ {{hitl}} และ `resume(approved=True/False)` ข้ามเทิร์นได้อย่างปลอดภัย",
  ],

  reviewCards: [
    rc(
      "d167-rc-1",
      "4 เส้นทางหลักของ LangGraph Router ในระบบ Capstone คืออะไรบ้าง?",
      "1) faq_rag (ตอบจากเอกสารพร้อม strict citations), 2) mcp_lookup (เช็กสถานะ read-only), 3) hitl_write (หยุดรออนุมัติก่อนแก้ข้อมูล), 4) escalate (ส่งต่อเจ้าหน้าที่ / fallback)",
    ),
    rc(
      "d167-rc-2",
      "ทำไมจึงต้องบังคับ `max_steps <= 3` และ `trace_events` ใน Router State?",
      "เพื่อการันตีว่ากราฟไม่มีวันวน loop ไม่รู้จบ คุม P95 latency/ต้นทุนได้ และมีเส้นทางเดินของคำขอชัดเจนสำหรับ debugging และ observability",
    ),
    rc(
      "d167-rc-3",
      "เมื่อ `resume(thread_id, approved=False)` ถูกเรียกบนกราฟที่รอ HITL อยู่ ผลลัพธ์ควรเป็นอย่างไร?",
      "กราฟต้องเปลี่ยนสถานะเป็น `cancelled` อย่างสุภาพและห้ามเรียก `write_fn` โดยเด็ดขาด",
    ),
  ],

  sources: [
    { label: "LangGraph Documentation — Routing & Human-in-the-Loop", href: "https://langchain-ai.github.io/langgraph/" },
    { label: "Anthropic — Building Effective Agents (Routing Workflow)", href: "https://www.anthropic.com/research/building-effective-agents" },
    { label: "LangGraph Persistence & Checkpointers", href: "https://langchain-ai.github.io/langgraph/concepts/persistence/" },
    { label: "Pydantic v2 Documentation", href: "https://docs.pydantic.dev/latest/" },
  ],

  glossary: ["langgraph", "workflow-patterns", "checkpointer", "hitl", "rag", "mcp", "tool-calling", "abstention", "guardrails", "pydantic"],
});
