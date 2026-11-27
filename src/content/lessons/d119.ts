import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D119 — Phase 4 / Block B30
 * Persistent Memory & Human-in-the-Loop (HITL) Approval Checkpoints
 */
export const d119: Lesson = defineLesson({
  day: 119,
  titleTh: "Persistent Memory & Human-in-the-Loop (HITL) Approval Checkpoints",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · หยุดพักกราฟก่อนทำรายการคืนเงินด้วย Checkpointer + interrupt_before แล้ว Resume ตามผลอนุมัติแยกตาม thread_id",
  icon: "user-check",
  visual: {
    id: "hitl-checkpoint",
    title: "LangGraph Checkpointer & Human-in-the-Loop Approval Gate",
    caption: "จำลองการหยุดพักกราฟด้วย interrupt_before ก่อนรันคำสั่งคืนเงิน แล้ว Resume ต่อเมื่อผู้ดูแลกดอนุมัติหรือปฏิเสธ",
    alt: "แผนภาพ LangGraph Checkpointer และ Human-in-the-Loop Gate",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้าง Thread-Scoped Checkpointer & HITL Refund Gate ทดสอบด้วย pytest",
  tools: ["Python 3.12", "LangGraph Checkpointer", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "เมื่อการตัดสินใจมีมูลค่าทางการเงิน AI ต้อง 'เตรียมข้อมูลแล้วหยุดรอคนกดอนุมัติ'",
      body: "ต่อให้ระบบมี {{guardrails}} ครบทุกชั้น แต่สำหรับการโอนเงินคืนลูกค้า (Refund), การยกเลิกสัญญา หรือการส่งอีเมลหาลูกค้าหมื่นคน เราไม่ควรปล่อยให้ Agent รัน Write Action เองอัตโนมัติ 100% — ต้องมีด่าน **Human-in-the-Loop ({{hitl}})** เสมอ",
      lessonNote: "เกณฑ์ทั่วไปในงานจริง: ถ้ายอดคืนเงินเกินเพดาน (เช่น > 1,000 บาท) หรือเป็นทุกคำสั่งโอนเงินจริง กราฟต้องหยุดรอหัวหน้างานกด Approve ก่อน",
    },
    {
      node: 3,
      heading: "Checkpointer คือหัวใจที่ทำให้กราฟ 'หยุดพักข้ามชั่วโมง' แล้วกลับมาเดินต่อได้",
      body: "หัวหน้างานอาจไม่ได้กดอนุมัติภายใน 2 วินาที แต่อาจมากดอนุมัติในอีก 3 ชั่วโมงถัดไป ถ้าเก็บ State ไว้ในตัวแปรฟังก์ชันธรรมดา เธรดจะค้างหรือข้อมูลหายทันที — {{checkpointer}} ใน {{langgraph}} ช่วยบันทึก State ลงหน่วยความจำหรือ {{sqlite}} ผูกกับ `thread_id`",
      lessonNote: "เมื่อกราฟถึงจุด `interrupt_before=[\"issue_refund\"]` โปรเซส Python คืนการควบคุมทันทีโดยไม่ค้างเธรด แล้วค่อยโหลด State จาก `thread_id` เดิมมาเดินต่อเมื่อคนกดอนุมัติ",
    },
    {
      node: 4,
      heading: "แยก State ด้วย `thread_id` และตรวจ `approved is True` ซ้ำในโหนดปลายทาง",
      body: "ในขณะที่มีลูกค้า 50 คนรอการอนุมัติพร้อมกัน แต่ละคำขอต้องมี `thread_id` แยกอิสระ (เช่น `\"refund-INV-2026-009\"`) เพื่อไม่ให้การกดอนุมัติของเคสหนึ่งไปปลดล็อกอีกเคสหนึ่ง และภายในโหนด `issue_refund` ต้องตรวจ `state.approved is True` ซ้ำเสมอ (Defense-in-Depth)",
      lessonNote: "หากผู้ดูแลกด Reject (`approved=False`) กราฟที่ Resume จะข้ามการโอนเงินและบันทึกสถานะ `rejected_by_human` ทันที",
    },
    {
      node: 5,
      heading: "ชิ้นส่วนสุดท้ายของสถาปัตยกรรม Agent ก่อนลุย Mini-Project (D121–D124)",
      body: "เมื่อรวม Controlled Graph (D117) + Budgets & Cycle Detection (D118) + Checkpointer & {{hitl}} (D119) คุณก็มีองค์ประกอบครบทุกชิ้นสำหรับการสร้าง Controlled Enterprise Agent แล้ว",
      lessonNote: "ในวันพรุ่งนี้ (Day 120) เราจะทบทวน Block B30 ด้วยการผ่าตัดแก้บั๊กลูปไม่รู้จบและด่านอนุมัติคืนเงิน",
    },
  ],

  objectives: [
    "**อธิบายกลไกการทำงานของ {{checkpointer}} และ `thread_id`** ที่ช่วยให้กราฟของ {{langgraph}} บันทึกสถานะหยุดพัก (Pause/Interrupt) และกลับมาทำงานต่อ (Resume) ได้โดยไม่บล็อกเธรด",
    "**สร้างด่าน Human-in-the-Loop ({{hitl}}) Approval Gate** ที่หยุดรอการอนุมัติก่อนรัน Write Action (`issue_refund`) และอนุญาตให้ดำเนินการต่อเฉพาะเมื่อ `approved is True`",
    "**ทดสอบการทำงานแบบ Multi-Thread ด้วย {{pytest}}** เพื่อยืนยันครบทั้งกรณีรออนุมัติ (`awaiting_approval`), กรณีอนุมัติ (`approved`), กรณีปฏิเสธ (`rejected`) และการแยกสถานะระหว่างสอง `thread_id` ไม่ให้ปะปนกัน",
  ],

  prerequisites: [
    "ผ่าน Day 117–118 (LangGraph State Machine & Guarded Execution)",
    "ทบทวน Day 110 (Read vs Write Tools & Idempotency)",
    "ไม่ต้องใช้ API key — ทดสอบ Checkpointer & HITL Workflow บนเครื่องด้วย `pytest` ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day119` ด้วย `uv` เพื่อสร้างระบบ `hitl_checkpoint.py` ที่จำลองการหยุดพักและ Resume กราฟแยกตาม `thread_id`",
    commands: `uv init ai-day119 && cd ai-day119
uv add pydantic langgraph
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day119` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `langgraph`, `pytest` และ `ruff`"],
      ["verify", "เขียน `hitl_checkpoint.py` และรัน `uv run pytest -v`"],
    ],
    note: "สำหรับการพัฒนาและรัน `pytest` บนเครื่อง เราใช้ In-Memory Checkpointer (`MemorySaver` หรือ dict store ตาม `thread_id`) ส่วนใน Production จริงสามารถสลับเป็น `SqliteSaver` หรือ `PostgresSaver` ได้โดยไม่ต้องแก้โค้ดโหนดเลย",
  },

  concepts: [
    {
      id: "thread-scoped-checkpointer",
      title: "1 · Thread-Scoped Checkpointer: หยุดกราฟโดยไม่ค้างเธรด (Non-Blocking Pause)",
      paragraphs: [
        "ความเข้าใจผิดที่พบบ่อยเวลาทำระบบรออนุมัติโดยมนุษย์ ({{hitl}}) คือการใช้ `input()` หรือ `await asyncio.sleep()` ค้างไว้ในฟังก์ชันเพื่อรอให้แอดมินมากดปุ่ม — ในระบบเว็บจริง แอดมินอาจมากดอนุมัติในวันรุ่งขึ้น และถ้าเซิร์ฟเวอร์รีสตาร์ตหรือ timeout ระหว่างรอ ข้อมูลในหน่วยความจำก็จะหายไปทั้งหมด",
        "สถาปัตยกรรมของ {{langgraph}} แก้ปัญหานี้ด้วย **{{checkpointer}}**: ทุกครั้งที่กราฟเดินจบ 1 โหนด Checkpointer จะบันทึกสแนปชอตของ `State` ลงที่เก็บข้อมูลโดยผูกกับกุญแจ **`thread_id`** (เช่น `config = {\"configurable\": {\"thread_id\": \"ticket-109\"}}`)",
        "เมื่อกราฟเดินมาถึงโหนดที่ตั้ง `interrupt_before=[\"issue_refund\"]` กราฟจะ **เซฟ State ล่าสุดลง Checkpointer แล้วจบการทำงานรอบนั้นทันที** (คืนสถานะ `awaiting_approval` กลับให้ API) โดยไม่มีโปรเซสใด ๆ ค้างรออยู่เลย!",
      ],
      analogy:
        "เหมือนการกด 'Save Game' ในเกม RPG ก่อนเปิดประตูห้องบอสแล้วปิดเครื่องไปนอน: เกมไม่ได้เปิดเครื่องกินไฟรอทั้งคืน แต่บันทึกสถานะตัวละครลงสล็อตเซฟหมายเลข `thread_id` พอพรุ่งนี้เปิดเครื่องโหลดสล็อตเดิม ตัวละครก็ยืนอยู่หน้าประตูห้องบอสพร้อมเดินต่อทันที",
      bullets: [
        "**`thread_id` Isolation**: แต่ละคำขอหรือแต่ละทิกเก็ตมีสล็อตเซฟของตัวเอง ห้ามใช้ `thread_id` เดียวกันข้ามลูกค้า",
        "**Zero Idle Compute**: ระหว่างรอคนกดอนุมัติ ระบบใช้ CPU/RAM เป็นศูนย์ เพราะสถานะถูกเซฟไว้ใน Checkpointer แล้ว",
        "**Audit Snapshot**: ดูประวัติย้อนหลังได้ว่าก่อนถึงจุดหยุด กราฟค้นเจอหลักฐานอะไรและเตรียมพารามิเตอร์อะไรไว้",
      ],
      whyTitle: "Why this matters — ถ้าลืมส่งหรือใช้ `thread_id` ซ้ำกัน การกดอนุมัติของเคส A จะไปโอนเงินให้เคส B!",
      whyParagraphs: [
        "`thread_id` คือ Primary Key ของสถานะการทำงานใน Checkpointer ดังนั้นควรสร้าง `thread_id` ให้ผูกกับ `tenant_id` และรหัสคำขอที่ไม่ซ้ำกันเสมอ เช่น `f\"{tenant_id}:refund:{order_id}\"`",
      ],
    },
    {
      id: "hitl-interrupt-and-resume",
      title: "2 · วงจร 3 จังหวะของ HITL: Prepare & Interrupt → Update State → Resume",
      paragraphs: [
        "การทำงานของด่านอนุมัติ {{hitl}} แบ่งออกเป็น 3 จังหวะที่ชัดเจน:",
        "**จังหวะที่ 1 (Prepare & Interrupt)**: กราฟรันโหนดเตรียมข้อมูล (เช่น ตรวจออเดอร์และคำนวณยอดคืนเงิน) พอจะเข้าสู่โหนด `issue_refund` ระบบเห็นว่าเป็นจุด `interrupt_before` จึงหยุดพักที่สถานะ `status=\"awaiting_approval\"` โดยที่ฟังก์ชันโอนเงินจริงยังไม่ถูกเรียก (`refund_executed=False`)",
        "**จังหวะที่ 2 (Human Decision / Update State)**: เมื่อหัวหน้างานตรวจสอบข้อมูลบนหน้า Dashboard แล้วกดปุ่ม Approve หรือ Reject ระบบหลังบ้านจะอัปเดตสถานะของ `thread_id` นั้นใน Checkpointer เช่น `update_state(thread_id, approved=True, reviewer=\"mgr_somchai\")`",
        "**จังหวะที่ 3 (Resume Execution)**: ระบบสั่ง `resume(thread_id)` เพื่อเดินกราฟต่อจากจุดที่ค้างไว้ หาก `approved is True` โหนด `issue_refund` จะทำการโอนเงินและเปลี่ยนสถานะเป็น `\"refunded\"` แต่หาก `approved is False` กราฟจะเลี้ยวไปจบที่สถานะ `\"rejected\"` โดยไม่แตะต้องระบบโอนเงินเลย",
      ],
      analogy:
        "เหมือนระบบสั่งจ่ายเช็คของบริษัท: (1) พนักงานบัญชีเขียนเช็คและแนบใบเสร็จวางไว้ในถาด 'รอเซ็น', (2) ผู้จัดการเดินมาตรวจแล้วเซ็นอนุมัติหรือประทับตรา 'ไม่อนุมัติ' ลงบนเช็คใบนั้น และ (3) พนักงานนำเช็คที่เซ็นอนุมัติแล้วไปขึ้นเงินที่ธนาคาร",
      code: {
        language: "python",
        filename: "hitl_lifecycle.py",
        code: `from typing import Literal
from pydantic import BaseModel


class RefundThreadState(BaseModel):
    thread_id: str
    order_id: str
    amount_thb: int
    status: Literal["awaiting_approval", "refunded", "rejected"]
    approved: bool | None = None
    reviewer: str | None = None
    refund_tx_id: str | None = None`,
        caption: "`approved: bool | None = None` แยก 3 สถานะชัดเจน: `None` (ยังไม่ได้ตัดสินใจ), `True` (อนุมัติ), `False` (ปฏิเสธ)",
      },
      whyTitle: "Why this matters — ใช้ `approved: bool | None = None` แทน `bool = False` เพื่อให้แยกแยะ 'ยังไม่ตรวจ' กับ 'ตรวจแล้วไม่อนุมัติ' ได้",
      whyParagraphs: [
        "ถ้าตั้งค่าเริ่มต้นเป็น `False` เราจะไม่รู้เลยว่า `False` นั้นแปลว่า 'ยังไม่มีใครมากดดู' หรือ 'หัวหน้างานกดปฏิเสธแล้ว' การใช้ `None` สำหรับสถานะรอพิจารณาจึงชัดเจนและปลอดภัยกว่ามาก",
      ],
    },
    {
      id: "in-node-approval-assertion",
      title: "3 · Defense-in-Depth ภายในโหนด Write: ตรวจ `approved is True` ซ้ำก่อนรัน Side Effect",
      paragraphs: [
        "แม้เราจะตั้ง `interrupt_before` หรือวาง Conditional Router ไว้หน้าโหนด `issue_refund` แล้ว แต่หลักการวิศวกรรมความปลอดภัยที่ดีคือ **ภายในฟังก์ชัน `issue_refund` เองต้องมีบรรทัดตรวจ `if state.approved is not True:` ดักไว้อีกชั้นเสมอ**",
        "ทำไมต้องตรวจซ้ำ? เพราะถ้าในอนาคตมีใครแก้ไขเส้นเชื่อมในกราฟผิด หรือเผลอเรียก `resume(thread_id)` ทั้งที่ผู้ดูแลยังไม่ได้กดตัดสินใจ (`approved is None`) หรือกดปฏิเสธ (`approved is False`) ด่านตรวจภายในโหนดจะปฏิเสธการโอนเงินทันที",
        "นอกจากนี้ หากมีการเรียก `resume(thread_id)` ซ้ำในเธรดที่โอนเงินสำเร็จไปแล้ว (`status == \"refunded\"`) ตัว Checkpointer ต้องคืนสถานะเดิมโดยไม่รันฟังก์ชันโอนเงินซ้ำเป็นครั้งที่สอง ({{idempotency}})",
      ],
      analogy:
        "interrupt_before เหมือนประตูรั้วหน้าห้องนิรภัยที่หยุดให้ยามตรวจบัตร ส่วน `if state.approved is not True:` ภายในโหนด `issue_refund` เหมือนกุญแจตู้เซฟใบในสุดที่ต้องเสียบรหัสอนุมัติจริงถึงจะเปิดออก",
      bullets: [
        "**Explicit `is True` Check**: ใช้ `if state.approved is not True:` เพื่อกันทั้ง `False` และ `None`",
        "**Idempotent Resume**: ถ้า `state.status in (\"refunded\", \"rejected\")` แล้ว การเรียก `resume` ซ้ำต้องไม่รัน side effect ซ้ำ",
        "**Unknown Thread Guard**: ถ้าส่ง `thread_id` ที่ไม่มีใน Checkpointer เข้ามา ต้องโยน `KeyError` หรือ `ValueError` ทันที",
      ],
      whyTitle: "Why this matters — ป้องกันบั๊ก Double-Click บนปุ่ม Approve ของหน้าเว็บ Dashboard",
      whyParagraphs: [
        "เวลาแอดมินกดปุ่ม 'อนุมัติคืนเงิน' บนหน้าเว็บ บางครั้งเผลอคลิกซ้ำ 2 ครั้งติดกัน การตรวจว่าถ้า `status == \"refunded\"` แล้วให้คืนผลเดิมจาก Checkpoint ทันที ช่วยป้องกันการโอนเงินคืนซ้ำ 2 รอบได้อย่างเด็ดขาด",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ LangGraph HITL Checkpointer กับ Stateful Workflow Engines",
      body: [
        "หากคุณเคยทำระบบ Approval Workflow, Temporal หรือ Webhook Callback ในเว็บแอป นี่คือการจับคู่แนวคิดเดียวกัน:",
      ],
      table: [
        ["`thread_id` ใน Checkpointer", "`workflow_execution_id` ในตาราง `approval_workflows`"],
        ["`interrupt_before=['issue_refund']`", "พักสถานะเป็น `PENDING_APPROVAL` แล้วคืน HTTP 202 Accepted"],
        ["`record_decision(thread_id, approved)`", "`POST /api/approvals/:threadId/decision` จากหน้า Admin UI"],
        ["`resume(thread_id)`", "Worker โหลดสถานะจาก DB แล้วรันขั้นตอนถัดไปต่อจากจุดที่พักไว้"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมใน Python ถึงควรเขียน `if approved is True:` แทน `if approved:` เวลาตรวจสิทธิ์สำคัญ",
      body: [
        "ใน Python ถ้าใช้ `if approved:` ค่าอะไรก็ตามที่ไม่ว่างเปล่า เช่น สตริง `\"false\"` หรือตัวเลข `1` หรือลิสต์ `[0]` จะถูกมองเป็น `True` (Truthy) ทั้งหมด!",
        "การเขียน `if approved is True:` บังคับว่าจะต้องเป็นบูลีน `True` แท้ ๆ เท่านั้น ไม่ใช่ `None`, ไม่ใช่ `False` และไม่ใช่สตริงแปลกปลอม",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง `HitlRefundWorkflow` ที่มี Checkpointer เก็บสถานะแยกตาม `thread_id` โดยเมื่อส่งคำขอคืนเงินเข้ามา กราฟจะเตรียมข้อมูลและหยุดรอที่ `awaiting_approval` จนกว่าผู้ดูแลจะบันทึกผลตัดสินใจและสั่ง `resume`",
    steps: [
      {
        title: "1 · นิยามโมเดลสถานะ `RefundCheckpointState`",
        explain:
          "เก็บข้อมูลคำขอ, สถานะปัจจุบัน (`awaiting_approval`, `refunded`, `rejected`), ผลการอนุมัติ (`approved`) และรหัสธุรกรรมเมื่อโอนเงินสำเร็จ",
        code: {
          language: "python",
          filename: "worked_hitl.py",
          code: `from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel

WorkflowStatus = Literal["awaiting_approval", "refunded", "rejected"]


class RefundCheckpointState(BaseModel):
    thread_id: str
    order_id: str
    amount_thb: int
    status: WorkflowStatus = "awaiting_approval"
    approved: bool | None = None
    reviewer: str | None = None
    refund_tx_id: str | None = None`,
        },
      },
      {
        title: "2 · สร้างคลาส `HitlRefundWorkflow` พร้อม Thread-Scoped Checkpointer",
        explain:
          "`start_request` เตรียมสถานะและหยุดก่อนรัน `refund_executor`, `record_decision` บันทึกผลอนุมัติลง `thread_id` เดิม และ `resume` รันการคืนเงินเฉพาะเมื่อ `approved is True`",
        code: {
          language: "python",
          filename: "worked_hitl.py",
          code: `class HitlRefundWorkflow:
    def __init__(self, refund_executor: Callable[[str, int], str]) -> None:
        self._refund_executor = refund_executor
        self._checkpoints: dict[str, RefundCheckpointState] = {}

    def start_request(
        self,
        thread_id: str,
        order_id: str,
        amount_thb: int,
    ) -> RefundCheckpointState:
        """เริ่มกราฟและหยุดด้วย interrupt_before ก่อนโหนด issue_refund"""
        if not thread_id.strip():
            raise ValueError("thread_id must not be empty")
        if amount_thb <= 0:
            raise ValueError("amount_thb must be positive")
        state = RefundCheckpointState(
            thread_id=thread_id,
            order_id=order_id,
            amount_thb=amount_thb,
            status="awaiting_approval",
        )
        self._checkpoints[thread_id] = state
        return state.model_copy()

    def record_decision(
        self,
        thread_id: str,
        approved: bool,
        reviewer: str = "supervisor",
    ) -> RefundCheckpointState:
        """อัปเดตผลการตัดสินใจของมนุษย์ลงใน checkpoint ของ thread_id นั้น"""
        if thread_id not in self._checkpoints:
            raise KeyError(f"Unknown thread_id: {thread_id}")
        current = self._checkpoints[thread_id]
        updated = current.model_copy(
            update={"approved": approved, "reviewer": reviewer}
        )
        self._checkpoints[thread_id] = updated
        return updated.model_copy()

    def resume(self, thread_id: str) -> RefundCheckpointState:
        """เดินกราฟต่อจากจุดหยุด: รัน refund เฉพาะเมื่อ approved is True และยังไม่เคยรัน"""
        if thread_id not in self._checkpoints:
            raise KeyError(f"Unknown thread_id: {thread_id}")
        state = self._checkpoints[thread_id]

        # Idempotent guard: ถ้าจบไปแล้วให้คืนสถานะเดิมโดยไม่รันซ้ำ
        if state.status in ("refunded", "rejected"):
            return state.model_copy()

        if state.approved is None:
            return state.model_copy()

        if state.approved is True:
            tx_id = self._refund_executor(state.order_id, state.amount_thb)
            final_state = state.model_copy(
                update={"status": "refunded", "refund_tx_id": tx_id}
            )
        else:
            final_state = state.model_copy(
                update={"status": "rejected", "refund_tx_id": None}
            )

        self._checkpoints[thread_id] = final_state
        return final_state.model_copy()`,
        },
      },
      {
        title: "3 · ทดสอบการแยก 2 Threads พร้อมกัน (อนุมัติ 1 เคส และปฏิเสธ 1 เคส)",
        explain:
          "พิสูจน์ว่า `thread-1` และ `thread-2` ไม่ปะปนกัน และฟังก์ชันโอนเงินจริงถูกเรียกเฉพาะสำหรับเคสที่อนุมัติเท่านั้น",
        code: {
          language: "python",
          filename: "worked_hitl.py",
          code: `executed_refunds: list[tuple[str, int]] = []


def mock_bank_refund(order_id: str, amount: int) -> str:
    executed_refunds.append((order_id, amount))
    return f"TX-{order_id}"


wf = HitlRefundWorkflow(mock_bank_refund)

s1 = wf.start_request("th-01", "INV-2026-009", 2500)
s2 = wf.start_request("th-02", "INV-2026-015", 4800)
print("After start -> bank calls:", len(executed_refunds), "| s1:", s1.status, "| s2:", s2.status)

wf.record_decision("th-01", approved=True, reviewer="mgr_a")
wf.record_decision("th-02", approved=False, reviewer="mgr_b")

r1 = wf.resume("th-01")
r2 = wf.resume("th-02")
print("Resumed th-01:", r1.status, r1.refund_tx_id)
print("Resumed th-02:", r2.status, r2.refund_tx_id)
print("Total bank refund calls:", executed_refunds)`,
        },
        output: `After start -> bank calls: 0 | s1: awaiting_approval | s2: awaiting_approval
Resumed th-01: refunded TX-INV-2026-009
Resumed th-02: rejected None
Total bank refund calls: [('INV-2026-009', 2500)]`,
      },
    ],
    gotcha:
      "สังเกตว่าถ้าเผลอเรียก `wf.resume(\"th-01\")` ซ้ำเป็นครั้งที่สองหลังสถานะเป็น `\"refunded\"` ไปแล้ว บรรทัด `if state.status in (\"refunded\", \"rejected\"):` จะคืนสถานะเดิมทันที ทำให้ `executed_refunds` ไม่ถูกเรียกซ้ำเป็นครั้งที่สอง!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `hitl_checkpoint.py` ที่มี `HitlRefundWorkflow` พร้อม Checkpointer แยกตาม `thread_id` และเขียนชุดทดสอบ `test_hitl_checkpoint.py`",
    requirements: [
      "สร้าง `RefundCheckpointState` และ `HitlRefundWorkflow(refund_executor)` ที่เก็บสถานะใน checkpointer แยกตาม `thread_id`",
      "เมื่อเรียก `start_request(thread_id, order_id, amount_thb)` ให้หยุดพักก่อนรัน `refund_executor` ด้วย `status=\"awaiting_approval\"` และ `approved=None` (ห้ามเรียก `refund_executor` ในขั้นนี้)",
      "เมื่อเรียก `record_decision(thread_id, approved, reviewer=\"supervisor\")` ให้บันทึกค่า `approved` (`True` หรือ `False`) ลงใน state ของ `thread_id` เดิม (ถ้าไม่พบ `thread_id` ให้โยน `KeyError`)",
      "เมื่อเรียก `resume(thread_id)` ให้รัน `refund_executor` เฉพาะเมื่อ `approved is True` เท่านั้น (เปลี่ยนเป็น `status=\"refunded\"`), หาก `approved is False` ให้เปลี่ยนเป็น `status=\"rejected\"` โดยไม่เรียก `refund_executor`, และหากเรียก `resume` ซ้ำหลังจบแล้วต้องไม่รัน `refund_executor` ซ้ำ",
      "เขียน `test_hitl_checkpoint.py` ทดสอบครบทั้งกรณีหยุดรออนุมัติ, กรณีอนุมัติ, กรณีปฏิเสธ, กรณีเรียก `resume` ซ้ำ (idempotent) และการแยก state ระหว่าง 2 `thread_id`",
    ],
    starter: {
      language: "python",
      filename: "hitl_checkpoint.py",
      code: `from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel

WorkflowStatus = Literal["awaiting_approval", "refunded", "rejected"]


class RefundCheckpointState(BaseModel):
    thread_id: str
    order_id: str
    amount_thb: int
    status: WorkflowStatus = "awaiting_approval"
    approved: bool | None = None
    reviewer: str | None = None
    refund_tx_id: str | None = None


class HitlRefundWorkflow:
    def __init__(self, refund_executor: Callable[[str, int], str]) -> None:
        self._refund_executor = refund_executor
        self._checkpoints: dict[str, RefundCheckpointState] = {}

    def start_request(
        self,
        thread_id: str,
        order_id: str,
        amount_thb: int,
    ) -> RefundCheckpointState:
        """สร้าง checkpoint เริ่มต้นและหยุดรออนุมัติก่อนโหนด issue_refund"""
        # TODO: ตรวจ thread_id และ amount_thb > 0 แล้วบันทึก state เริ่มต้น
        raise NotImplementedError

    def record_decision(
        self,
        thread_id: str,
        approved: bool,
        reviewer: str = "supervisor",
    ) -> RefundCheckpointState:
        """บันทึกผลการอนุมัติหรือปฏิเสธลงใน thread_id ที่ระบุ"""
        # TODO: ถ้าไม่มี thread_id ให้ raise KeyError
        raise NotImplementedError

    def resume(self, thread_id: str) -> RefundCheckpointState:
        """เดินกราฟต่อตามผล approved ใน checkpoint ของ thread_id นั้น"""
        # TODO: รัน refund_executor เฉพาะเมื่อ approved is True และยังไม่เคยจบมาก่อน
        raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "ตอนเรียก `start_request` จำนวนครั้งที่ `refund_executor` ถูกเรียกยังคงเป็น `0` ใช่หรือไม่?",
      "ถ้าเรียก `resume` ตอนที่ `approved` ยังเป็น `None` สถานะยังคงเป็น `awaiting_approval` และ `refund_executor` ไม่ถูกเรียกใช่หรือไม่?",
      "ถ้าเรียก `resume` ซ้ำ 2 ครั้งบนเธรดที่ `approved=True` ตัว `refund_executor` ถูกเรียกเพียง 1 ครั้งใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทุกกรณี (interrupt pause, approve & resume, reject without side effect, idempotent resume, multi-thread isolation) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใช้ `.model_copy(update={...})` ของ Pydantic v2 เพื่อสร้าง state ใหม่ที่อัปเดตฟิลด์โดยไม่กลายพันธุ์อ็อบเจกต์เดิมกลางทาง",
      },
      {
        body: "ใน `resume` ตรวจ `if state.status in (\"refunded\", \"rejected\"): return state.model_copy()` เป็นบรรทัดแรกหลังดึง `state` เพื่อรับประกัน idempotency",
      },
      {
        body: "เฉลยชุดทดสอบ `test_hitl_checkpoint.py`:",
        code: {
          language: "python",
          filename: "test_hitl_checkpoint.py",
          code: `import pytest
from hitl_checkpoint import HitlRefundWorkflow


def test_pauses_before_refund_until_approved() -> None:
    calls: list[tuple[str, int]] = []
    wf = HitlRefundWorkflow(lambda oid, amt: (calls.append((oid, amt)) or f"TX-{oid}"))

    s0 = wf.start_request("t-1", "INV-2026-001", 1500)
    assert s0.status == "awaiting_approval"
    assert calls == []

    # Resume before decision keeps waiting
    s_still = wf.resume("t-1")
    assert s_still.status == "awaiting_approval"
    assert calls == []

    wf.record_decision("t-1", approved=True, reviewer="lead_1")
    s_done = wf.resume("t-1")
    assert s_done.status == "refunded"
    assert s_done.refund_tx_id == "TX-INV-2026-001"
    assert calls == [("INV-2026-001", 1500)]

    # Second resume is idempotent
    wf.resume("t-1")
    assert len(calls) == 1


def test_rejection_never_calls_refund_executor() -> None:
    calls: list[str] = []
    wf = HitlRefundWorkflow(lambda oid, amt: (calls.append(oid) or "TX"))

    wf.start_request("t-reject", "INV-2026-002", 3000)
    wf.record_decision("t-reject", approved=False, reviewer="lead_2")
    res = wf.resume("t-reject")
    assert res.status == "rejected"
    assert res.refund_tx_id is None
    assert calls == []


def test_isolates_two_concurrent_threads_and_validates_inputs() -> None:
    calls: list[str] = []
    wf = HitlRefundWorkflow(lambda oid, amt: (calls.append(oid) or f"TX-{oid}"))

    wf.start_request("thread-A", "INV-A", 1200)
    wf.start_request("thread-B", "INV-B", 2400)

    wf.record_decision("thread-A", approved=False)
    wf.record_decision("thread-B", approved=True)

    res_a = wf.resume("thread-A")
    res_b = wf.resume("thread-B")

    assert res_a.status == "rejected"
    assert res_b.status == "refunded"
    assert calls == ["INV-B"]

    with pytest.raises(KeyError):
        wf.resume("unknown-thread")`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v`,
    },
  },

  mistakes: [
    {
      title: "รันฟังก์ชันโอนเงินไปก่อนในโหนดแรก แล้วค่อยถามคนว่าจะยกเลิกทีหลังหรือเปล่า",
      symptom:
        "เงินถูกโอนออกจากบัญชีบริษัทไปแล้วตั้งแต่ก่อนที่หัวหน้างานจะทันเห็นรายการ",
      fix: "ใช้ `interrupt_before` หยุดพักกราฟ **ก่อน** โหนดที่มี Write Side Effect เสมอ",
    },
    {
      title: "ใช้ตัวแปร Global เดียวเก็บสถานะรออนุมัติโดยไม่แยกตาม `thread_id`",
      symptom:
        "เมื่อมีลูกค้า 2 คนขอคืนเงินพร้อมกัน ข้อมูลของคนที่สองเขียนทับคนแรก หรือการกดอนุมัติของคนแรกไปโอนเงินให้คนที่สอง",
      fix: "ผูกทุก Checkpoint เข้ากับ `thread_id` ที่ไม่ซ้ำกันใน `dict[str, State]` หรือฐานข้อมูล Checkpointer เสมอ",
    },
    {
      title: "ตั้งค่าเริ่มต้น `approved: bool = False` แทน `bool | None = None`",
      symptom:
        "โค้ดใน `resume` แยกไม่ออกว่าเธรดนั้น 'ยังไม่มีคนมากดตรวจ' หรือ 'คนกดปฏิเสธแล้ว' จนเผลอปิดทิกเก็ตเป็น `rejected` ทันทีที่เผลอเรียก `resume`",
      fix: "ใช้ `approved: bool | None = None` โดย `None` = ยังรอการตัดสินใจ, `True` = อนุมัติ, `False` = ปฏิเสธ",
    },
    {
      title: "ไม่ป้องกันการเรียก `resume(thread_id)` ซ้ำหลังจากสถานะเปลี่ยนเป็น `refunded` แล้ว",
      symptom:
        "แอดมินดับเบิลคลิกปุ่ม Approve บนหน้าเว็บแล้วระบบสั่งโอนเงินคืนให้ลูกค้าซ้ำ 2 รอบ",
      fix: "ตรวจ `if state.status in (\"refunded\", \"rejected\"): return state` ต้นฟังก์ชัน `resume` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d119-q1",
        "บทบาทของ `Checkpointer` คู่กับ `thread_id` ในการทำ Human-in-the-Loop (HITL) ของ LangGraph คือข้อใด?",
        [
          ["ช่วยบล็อกเธรดของเซิร์ฟเวอร์ให้ค้างรอด้วย `time.sleep(86400)` จนกว่าคนจะมากดปุ่ม", "ผิด — การค้างเธรดไว้ทำให้เซิร์ฟเวอร์รับคำขออื่นไม่ได้และข้อมูลหายเมื่อรีสตาร์ต"],
          ["บันทึกสแนปชอตของ State ผูกกับ `thread_id` แล้วหยุดพักกราฟทันทีโดยไม่ค้างเธรด เพื่อให้สามารถโหลด State เดิมกลับมาเดินต่อ (Resume) ได้ทุกเมื่อหลังมนุษย์ตัดสินใจ", "ถูกต้อง — Non-blocking persistence คือหัวใจของ HITL ระดับ Production"],
          ["ทำให้โมเดล LLM ตัดสินใจอนุมัติคืนเงินแทนมนุษย์ได้เองทั้งหมด", "ผิดวัตถุประสงค์ของ HITL"],
          ["ลบประวัติการสนทนาทั้งหมดทิ้งทุกครั้งที่หยุดพัก", "เราต้องการเก็บสถานะไว้เดินต่อ ไม่ใช่ลบทิ้ง"],
        ],
        "B",
        "Checkpointer แยก 'อายุของสถานะงาน' ออกจาก 'อายุของ HTTP request เดียว' ทำให้รอการอนุมัติข้ามชั่วโมงหรือข้ามวันได้อย่างปลอดภัย",
        "ทำไม HITL ใน LangGraph จึงต้องใช้ Checkpointer คู่กับ `thread_id`?",
        "เพื่อเซฟ State ผูกกับ `thread_id` แล้วหยุดพักโดยไม่ค้างเธรด และโหลดกลับมา Resume ต่อได้เมื่อคนกดอนุมัติ",
      ),
      mc(
        "d119-q2",
        "หากเราตั้ง `interrupt_before=[\"issue_refund\"]` ในขณะเริ่มต้นคำขอ (`start_request`) ฟังก์ชันโอนเงินจริงในโหนด `issue_refund` จะถูกเรียกไปแล้วกี่ครั้ง?",
        [
          ["0 ครั้ง — เพราะกราฟหยุดพักก่อนเข้าโหนด `issue_refund` และรออยู่ที่สถานะ `awaiting_approval`", "ถูกต้อง — ต้องยังไม่มี side effect ใด ๆ เกิดขึ้นจนกว่าจะได้รับการอนุมัติและสั่ง resume"],
          ["1 ครั้ง — โอนไปก่อนแล้วค่อยดึงเงินกลับถ้าไม่อนุมัติ", "อันตราย — เงินโอนออกไปแล้วดึงกลับอัตโนมัติไม่ได้"],
          ["2 ครั้ง — เพื่อทดสอบระบบธนาคาร", "ไม่ถูกต้อง"],
          ["ขึ้นอยู่กับค่า `temperature` ของ LLM", "ไม่เกี่ยวข้องกับ `temperature`"],
        ],
        "A",
        "กฎเหล็กของ HITL สำหรับ Write Action คือ Zero Side Effect before Approval",
        "ขณะกราฟหยุดรอที่ `interrupt_before=['issue_refund']` ฟังก์ชันโอนเงินถูกเรียกหรือยัง?",
        "ยังไม่ถูกเรียก (0 ครั้ง) จนกว่าจะบันทึก `approved=True` และสั่ง `resume`",
      ),
      mc(
        "d119-q3",
        "ทำไมในโหนด `issue_refund` (หรือในเมธอด `resume`) จึงควรตรวจเงื่อนไข `if state.approved is True:` ซ้ำเสมอ แทนที่จะเชื่อว่าใครก็ตามที่เรียก `resume` แปลว่าอนุมัติแล้ว?",
        [
          ["เพื่อเป็น Defense-in-Depth ป้องกันกรณีที่มีการเรียก `resume` ตอนที่ `approved` ยังเป็น `None` (ยังไม่ตัดสินใจ) หรือ `False` (กดปฏิเสธ) ไม่ให้เผลอรันคำสั่งโอนเงิน", "ถูกต้อง — โหนดที่มีผลข้างเคียงทางการเงินต้องยืนยันสถานะ `approved is True` ด้วยตัวเองเสมอ"],
          ["เพื่อให้โค้ดใช้หน่วยความจำมากขึ้น", "ไม่เกี่ยวกับการใช้หน่วยความจำ"],
          ["เพราะ Python ไม่รองรับค่า `False`", "Python รองรับ `False` ตามปกติ"],
          ["เพื่อบังคับให้ต้องโอนเงินทุกครั้งไม่ว่าผลจะเป็นอย่างไร", "ตรงข้ามกับสิ่งที่เราต้องการ"],
        ],
        "A",
        "การตรวจ `state.approved is True` ภายในโหนดปลายทางทำให้มั่นใจได้ว่าไม่มีเส้นทางลัดใดในกราฟที่จะสั่งโอนเงินโดยปราศจากการอนุมัติ",
        "ทำไมต้องตรวจ `state.approved is True` ซ้ำก่อนรันฟังก์ชันโอนเงินใน `resume`?",
        "เพื่อป้องกันไม่ให้การเรียก `resume` ตอนที่ `approved` เป็น `None` หรือ `False` เผลอรันคำสั่งโอนเงินจริง",
      ),
      mc(
        "d119-q4",
        "หากเธรด `th-01` ได้รับการอนุมัติและรัน `resume(\"th-01\")` จนสถานะเปลี่ยนเป็น `\"refunded\"` ไปแล้ว แต่แอดมินเผลอกดปุ่มซ้ำจนเกิดการเรียก `resume(\"th-01\")` อีกครั้ง ระบบควรทำอย่างไร?",
        [
          ["โอนเงินคืนให้ลูกค้าซ้ำเป็นรอบที่สองทันที", "ผิด — เกิด Double Refund เสียหายทางการเงิน"],
          ["เห็นว่าสถานะเป็น `\"refunded\"` แล้ว จึงคืน `RefundCheckpointState` เดิมจาก Checkpointer ทันทีโดยไม่เรียก `refund_executor` ซ้ำ (Idempotent Resume)", "ถูกต้อง — ป้องกันปัญหา Double-Click หรือ Webhook Retry ได้ 100%"],
          ["เปลี่ยนสถานะกลับเป็น `\"rejected\"`", "ผิด — เงินโอนไปแล้วในรอบแรก"],
          ["ลบข้อมูลของ `th-02` ทิ้ง", "ห้ามกระทบเธรดอื่น"],
        ],
        "B",
        "สถานะปลายทาง (`refunded` และ `rejected`) ต้องเป็น Terminal & Idempotent States ที่การเรียก `resume` ซ้ำไม่ก่อให้เกิดผลข้างเคียงเพิ่ม",
        "เมื่อเรียก `resume` ซ้ำบน `thread_id` ที่อยู่ในสถานะ `refunded` แล้ว ระบบต้องทำอย่างไร?",
        "คืนสถานะเดิมทันทีโดยไม่เรียก `refund_executor` ซ้ำ (Idempotent Resume)",
      ),
    ],
  },

  takeaways: [
    "**{{checkpointer}} + `thread_id`** ช่วยให้กราฟหยุดพักรอคนอนุมัติได้โดยไม่ค้างเธรด (Non-blocking pause) และแยกสถานะของแต่ละคำขอออกจากกัน 100%",
    "**`interrupt_before` Write Node**: หยุดก่อนโหนดที่มีผลข้างเคียงทางการเงินเสมอ (`refund_calls == 0` ขณะรอ)",
    "**In-Node Approval Guard & Idempotent Resume**: ตรวจ `state.approved is True` ก่อนโอนเงินจริง และไม่รันซ้ำหากเธรดนั้นอยู่ในสถานะ `refunded` หรือ `rejected` แล้ว",
    "พรุ่งนี้ (Day 120 — Review B30) เราจะนำความรู้ทั้ง D117, D118 และ D119 มาผ่าตัดแก้บั๊ก **Infinite Tool-Calling Loop** และติดด่านอนุมัติคืนเงินสำหรับยอดเกิน 1,000 บาท!",
  ],

  reviewCards: [
    rc(
      "d119-rc1",
      "3 จังหวะของวงจร Human-in-the-Loop (HITL) ด้วย Checkpointer มีอะไรบ้าง?",
      "1) Start & Interrupt (เตรียมข้อมูลแล้วหยุดพักที่ `awaiting_approval`), 2) Record Decision (อัปเดต `approved=True/False` ลง `thread_id` เดิม), 3) Resume (เดินกราฟต่อตามผลตัดสินใจ)",
    ),
    rc(
      "d119-rc2",
      "ทำไมจึงควรกำหนดชนิดของฟิลด์อนุมัติเป็น `approved: bool | None = None`?",
      "เพื่อแยกแยะ 3 สถานะออกจากกันอย่างชัดเจน: `None` (ยังรอผู้ดูแลตัดสินใจ), `True` (อนุมัติแล้ว), `False` (ปฏิเสธแล้ว)",
    ),
    rc(
      "d119-rc3",
      "ถ้ามีคำขอคืนเงิน 2 รายการเข้ามาพร้อมกัน อะไรคือตัวป้องกันไม่ให้การกดอนุมัติของรายการแรกไปโอนเงินให้รายการที่สอง?",
      "การแยกเก็บและโหลด Checkpoint ด้วย `thread_id` เฉพาะของแต่ละรายการ",
    ),
    rc(
      "d119-rc4",
      "ทำไมฟังก์ชัน `resume(thread_id)` จึงต้องมีคุณสมบัติ Idempotency เมื่อสถานะเป็น `refunded` หรือ `rejected` แล้ว?",
      "เพื่อป้องกันกรณีแอดมินกดปุ่มซ้ำ (Double-click) หรือเครือข่ายส่งคำสั่งซ้ำ ไม่ให้เกิดการโอนเงินซ้ำ 2 รอบ",
    ),
  ],

  sources: [
    {
      label: "LangGraph Documentation — Persistence & Checkpointers (thread_id)",
      href: "https://docs.langchain.com/oss/python/langgraph/persistence",
    },
    {
      label: "LangGraph Documentation — Human-in-the-Loop (interrupt_before & update_state)",
      href: "https://docs.langchain.com/oss/python/langgraph/interrupts",
    },
    {
      label: "Anthropic Research — Building Effective Agents (Human Oversight for High-Stakes Actions)",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
  ],

  glossary: ["checkpointer", "hitl", "langgraph", "idempotency", "sqlite", "pytest"],
});
