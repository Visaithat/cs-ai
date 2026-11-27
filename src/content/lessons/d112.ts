import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D112 — Phase 4 / Block B28 (Review Day)
 * Review: Quiz + Build a Multi-Step Order & Policy Assistant with Routing + Evaluator-Optimizer Workflow
 */
export const d112: Lesson = defineLesson({
  day: 112,
  titleTh: "ทบทวน B28: สร้างผู้ช่วยตรวจสอบออเดอร์และนโยบายด้วย Routing + Safe Tools + Evaluator-Optimizer",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ทบทวน D109–D111 แล้วประกอบระบบ Routing Workflow ที่เรียก Strict Safe Tool และซ่อม Citation อัตโนมัติ",
  icon: "layers",
  visual: {
    id: "anthropic-workflows",
    title: "ทบทวน B28: ผสาน Routing + Safe Tool Registry + Evaluator-Optimizer",
    caption: "คัดแยกคำขอเข้าสาย Order Tool (Strict Pydantic + Idempotency) หรือสาย Policy RAG (Evaluator-Optimizer ซ่อม Citation ไม่เกิน 2 รอบ)",
    alt: "แผนภาพทบทวน Block B28 Routing และ Evaluator-Optimizer Workflow",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — Integration Lab รวม Strict Tool Calling + Safe Tool Runner + Workflow Patterns ด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "asyncio", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รวมพลัง Block B28: เมื่อ Workflow ถือพวงมาลัย และ Safe Tools เป็นเครื่องยนต์",
      body: "ตลอด Day 109–111 เราได้สร้างชิ้นส่วนสำคัญ 3 ชิ้น: Strict Pydantic Tool Schema (D109), Safe Idempotent & Timed Tool Runner (D110) และ Anthropic's 5 {{workflow-patterns}} (D111) — วันทบทวนนี้เราจะนำทั้งสามส่วนมาประกอบเป็นระบบผู้ช่วยลูกค้าจริง",
      lessonNote: "นี่คือต้นแบบของระบบที่แยกสายงานชัดเจนโดยไม่ต้องพึ่ง Autonomous Agent ที่คาดเดายาก",
    },
    {
      node: 3,
      heading: "สายที่ 1 (Order & Ticket Route): Strict Schema + Least Privilege + Idempotency",
      body: "เมื่อ Router พบว่าลูกค้าถามสถานะออเดอร์หรือขอเปิดทิกเก็ต ระบบจะส่งเข้า `SafeToolRunner` ที่ตรวจพารามิเตอร์ด้วย `ConfigDict(extra=\"forbid\", strict=True)`, ตรวจสิทธิ์ `allow_writes` และป้องกันการสร้างทิกเก็ตซ้ำด้วย {{idempotency}} key",
      lessonNote: "ทุกการเรียกเครื่องมือถูกจำกัดเวลาด้วย `asyncio.wait_for` เพื่อไม่ให้ระบบค้าง",
    },
    {
      node: 4,
      heading: "สายที่ 2 (Policy RAG Route): Evaluator-Optimizer ซ่อม Citation ไม่เกิน 2 รอบ",
      body: "เมื่อ Router พบว่าเป็นคำถามนโยบาย ระบบจะดึงหลักฐานและเข้าลูป **Evaluator-Optimizer** ที่ใช้ตัวตรวจ Citation จาก Block B27 หากคำตอบรอบแรกลืมใส่ป้าย `[doc_id#chunk]` ระบบจะสั่งซ่อมอัตโนมัติในรอบที่ 2 และหากยังไม่ผ่านจะตัดเข้า Safe {{abstention}} ทันที",
      lessonNote: "เป็นการเชื่อมความรู้ข้ามบล็อก (Interleaved Recall) ระหว่าง Block B27 (Groundedness) กับ Block B28 (Workflows & Tools)",
    },
    {
      node: 6,
      heading: "เตรียมพร้อมก่อนก้าวเข้าสู่มาตรฐาน Model Context Protocol (MCP) ใน Block B29",
      body: "เมื่อคุณสร้าง `ToolRegistry` และ `SafeToolRunner` ของตัวเองจนเข้าใจทุกรอยต่อแล้ว ในวันพรุ่งนี้ (Day 113) คุณจะเข้าใจทันทีว่าทำไมวงการ AI จึงสร้างมาตรฐาน {{mcp}} ขึ้นมาเพื่อเชื่อมต่อ Tools และ Resources ข้ามระบบด้วยหลักการเดียวกัน",
      lessonNote: "ทำควิซทบทวน 4 ข้อแบบไม่เปิดโพย แล้วลงมือเขียน `support_router.py` พร้อมชุดทดสอบ `pytest`",
    },
  ],

  objectives: [
    "**ทบทวนแบบสลับหัวข้อ (Interleaved Recall)** เนื้อหา Day 109–111 (Strict Pydantic Tool Schemas, Least Privilege Read/Write, Idempotency Key, Async Timeouts และ 5 Workflow Patterns) เชื่อมกับ Day 105–107 (Grounded Citations & ACL)",
    "**ประกอบระบบ Multi-Step Support Workflow** ที่ใช้ **Routing Pattern** แยกคำขอระหว่างสายเรียกเครื่องมือ (`order_lookup` / `create_ticket`) กับสายตอบนโยบาย (`policy_rag` ด้วย **Evaluator-Optimizer**)",
    "**เขียน Integration Test ด้วย {{pytest}}** เพื่อยืนยันครบทั้งการตรวจ Strict Schema, การบล็อก Write Tool เมื่อ `allow_writes=False`, การกันรันซ้ำด้วย Idempotency และการซ่อม Citation ภายใน `max_rounds=2`",
  ],

  prerequisites: [
    "ทบทวน Day 109 (Strict Tool Registry), Day 110 (Safe Tool Runner) และ Day 111 (5 Workflow Patterns)",
    "ทบทวน Day 105 (Inline Citation Format `[doc_id#chunk]`)",
    "ไม่ต้องใช้ API key — รัน Integration Lab และชุดทดสอบบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day112` ด้วย `uv` เพื่อประกอบโมดูล `support_router.py` ที่เชื่อม Routing, Strict Safe Tools และ Evaluator-Optimizer เข้าด้วยกันภายใน 30 นาที",
    commands: `uv init ai-day112 && cd ai-day112
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day112` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["ready", "ทำควิซทบทวน 4 ข้อ แล้วลงมือเขียน `support_router.py` และรัน `uv run pytest -v`"],
    ],
    note: "ลองตอบควิซทบทวน 4 ข้อด้วยตัวเองก่อนดูเฉลย เพื่อทดสอบความเข้าใจเชื่อมโยงทั้งบล็อก B28",
  },

  concepts: [
    {
      id: "composing-routing-and-safe-tools",
      title: "1 · ผสาน Routing Pattern เข้ากับ Strict & Safe Tool Execution",
      paragraphs: [
        "ในระบบผู้ช่วยลูกค้าจริง เราไม่ควรส่งเครื่องมือทั้งหมด 20 ตัวไปให้โมเดลเลือกในทุกคำถาม เพราะยิ่งส่ง Schema ของเครื่องมือไปมากเท่าไหร่ โมเดลก็ยิ่งสับสนและเปลือง Input Tokens มากขึ้นเท่านั้น",
        "การใช้ **Routing Pattern (D111)** เป็นด่านหน้าช่วยให้เราแยกเส้นทางได้อย่างสะอาด: (1) ถ้าเป็นคำถามเช็กสถานะออเดอร์ (`order_lookup`) เราเปิดเฉพาะ Read Tool `lookup_order` โดยตั้ง `allow_writes=False`, (2) ถ้าเป็นคำขอเปิดทิกเก็ต (`create_ticket`) เราตรวจพารามิเตอร์ด้วย Strict Schema (`extra=\"forbid\", strict=True` จาก **D109**) และรันผ่าน Idempotent Write Runner (**D110**), และ (3) ถ้าเป็นคำถามนโยบาย (`policy_rag`) เราไม่ต้องเปิด Tool ฝั่งฐานข้อมูลเลย แต่ส่งเข้าท่อ RAG โดยตรง",
        "สถาปัตยกรรมนี้ทำให้หลักการ **Least Privilege** เกิดขึ้นโดยธรรมชาติตั้งแต่ชั้น Router!",
      ],
      analogy:
        "เหมือนเคาน์เตอร์บริการลูกค้าในห้างสรรพสินค้าที่แยกช่องชัดเจน: ช่องที่ 1 สอบถามข้อมูลทั่วไป (มีแค่คู่มือนโยบาย ไม่มีลิ้นชักเก็บเงิน), ช่องที่ 2 เช็กสถานะพัสดุ (เปิดหน้าจออ่านฐานข้อมูลอย่างเดียว), ช่องที่ 3 รับเรื่องเคลมสินค้า (มีแบบฟอร์มเข้มงวดและประทับตราเลขที่รับเรื่องไม่ให้ซ้ำ)",
      bullets: [
        "**Route 1 (`order_lookup`)**: Strict `OrderLookupArgs` + Read-Only execution (`allow_writes=False`)",
        "**Route 2 (`create_ticket`)**: Strict `CreateTicketArgs` + Write guard (`allow_writes`) + Tenant-scoped `idempotency_key`",
        "**Route 3 (`policy_rag`)**: Grounded RAG + Bounded Evaluator-Optimizer (`max_rounds=2`)",
      ],
      whyTitle: "Why this matters — Router ที่ตัดแยกสายตั้งแต่ต้นช่วยลดโอกาสที่บอทจะเรียกเครื่องมือผิดประเภทเป็นศูนย์",
      whyParagraphs: [
        "เมื่อสาย `policy_rag` และสาย `order_lookup` ถูกบังคับ `allow_writes=False` ตั้งแต่ที่ Router ต่อให้เอกสารหรือข้อความแชตมี Prompt Injection สั่งให้สร้างทิกเก็ตปลอม ระบบในสายนั้นก็ไม่มีสิทธิ์เรียก Write Tool ได้เลย",
      ],
    },
    {
      id: "evaluator-optimizer-for-citation-repair",
      title: "2 · ใช้ Evaluator-Optimizer ซ่อมคำตอบที่ลืมใส่ Citation อัตโนมัติ",
      paragraphs: [
        "ใน Block B27 (Day 105 & Day 108) เราสร้างตัวตรวจ `verify_grounded_answer` ที่ตีตกคำตอบทันทีเมื่อโมเดลลืมใส่ป้าย `[doc_id#chunk]` แต่ในงานจริง บางครั้งโมเดลสรุปเนื้อหาถูกทั้งหมดแล้ว เพียงแค่เผลอลืมพิมพ์ป้าย `[policy-refund#c01]` ท้ายประโยคในรอบแรก",
        "แทนที่จะตัดเข้า Abstention ทันทีตั้งแต่รอบแรก เราสามารถนำแพตเทิร์น **Evaluator-Optimizer (D111)** มาครอบทับได้: ให้ตัวตรวจ Citation ทำหน้าที่เป็น **Deterministic Evaluator** หากพบว่าขาดป้ายอ้างอิงหรือมีรหัสที่ไม่อยู่ใน `allowed_chunks` ให้ส่ง `feedback` ที่ระบุรายชื่อ `allowed_chunk_ids` กลับไปให้ **Optimizer** ซ่อมคำตอบอีก 1 รอบ (`max_rounds=2`)",
        "หากซ่อมในรอบที่ 2 แล้วผ่านเกณฑ์ ผู้ใช้จะได้รับคำตอบที่ถูกต้องพร้อมป้ายอ้างอิงครบถ้วน แต่หากครบ 2 รอบแล้วยังไม่ผ่าน ระบบจึงตัดจบเป็น `abstain_unverified_answer` อย่างปลอดภัย",
      ],
      analogy:
        "เหมือนอาจารย์ที่ปรึกษาตรวจรายงานรอบแรกแล้วเห็นว่าเนื้อหาถูกต้องแต่ลืมใส่รายการอ้างอิงท้ายย่อหน้า จึงส่งกลับให้นักศึกษาเติมเลขหน้าจากหนังสือที่วางอยู่บนโต๊ะให้ครบภายใน 1 ครั้ง ถ้าเติมถูกก็ส่งผ่านได้เลย ไม่ต้องตีตกวิชาทันที",
      code: {
        language: "python",
        filename: "citation_repair_loop.py",
        code: `import re
from collections.abc import Callable

CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")


def verify_citations_against_allowed(text: str, allowed_ids: set[str]) -> tuple[bool, str]:
    cites = CITATION_RE.findall(text)
    if not cites:
        return False, f"missing_citation: must cite from {sorted(allowed_ids)}"
    invalid = [c for c in cites if c not in allowed_ids]
    if invalid:
        return False, f"phantom_citation: {invalid} not in {sorted(allowed_ids)}"
    return True, "verified"


def run_bounded_citation_repair(
    draft_fn: Callable[[int, str | None], str],
    allowed_ids: set[str],
    max_rounds: int = 2,
) -> tuple[bool, int, str]:
    feedback: str | None = None
    for round_idx in range(1, max_rounds + 1):
        candidate = draft_fn(round_idx, feedback)
        ok, reason = verify_citations_against_allowed(candidate, allowed_ids)
        if ok:
            return True, round_idx, candidate
        feedback = reason
    return False, max_rounds, "ขออภัย ไม่สามารถยืนยันแหล่งอ้างอิงของคำตอบได้"`,
        caption: "Deterministic Evaluator ตรวจป้ายอ้างอิงใน < 0.1 ms และส่ง feedback ที่ระบุรหัสที่อนุญาตกลับไปซ่อมได้ตรงจุด",
      },
      whyTitle: "Why this matters — Bounded Repair 1 ครั้งช่วยเพิ่มอัตราการตอบสำเร็จ (Answer Rate) โดยไม่ลดทอนความซื่อสัตย์ (Faithfulness = 1.0)",
      whyParagraphs: [
        "จากการวัดผลในระบบ Production การเปิดโอกาสให้ซ่อมป้ายอ้างอิง 1 รอบ (`max_rounds=2`) ด้วยหลักฐานชุดเดิม ช่วยกู้คืนคำตอบที่ลืมใส่แท็กได้มากกว่า 90% โดยที่ด่านสุดท้ายยังคงรับประกัน Faithfulness 100% เท่าเดิม",
      ],
    },
    {
      id: "b28-synthesis-checklist",
      title: "3 · สรุปเช็กลิสต์ B28 ก่อนก้าวสู่ Block B29 (Model Context Protocol — MCP)",
      paragraphs: [
        "ทบทวน 4 กฎเหล็กของ Block B28 ที่เราจะใช้ต่อไปตลอดครึ่งหลังของ Phase 4:",
        "1. **Strict Schema หน้าประตู Tool เสมอ (D109)**: `ConfigDict(extra=\"forbid\", strict=True)` + Allowlisted Registry ห้ามส่ง dict ดิบเข้าฟังก์ชันโดยตรง",
        "2. **Least Privilege & Idempotency (D110)**: แยก `read` vs `write` tools, บล็อก write เมื่อ `allow_writes=False` และแคชผลลัพธ์ของ write ด้วยคีย์ `tenant_id + tool_name + canonical_json(args)` เฉพาะเมื่อ `ok=True`",
        "3. **Bounded Timeouts (D110)**: ห่อทุก async tool call ด้วย `asyncio.wait_for(..., timeout=timeout_s)`",
        "4. **Workflows before Agents (D111)**: ใช้ Chaining, Routing, Parallelization, Orchestrator-Workers และ Bounded Evaluator-Optimizer (`max_rounds`) แทนการปล่อยลูปเปิดกว้าง",
      ],
      analogy:
        "ตอนนี้เรามีทั้ง 'คลังความรู้ที่ปลอดภัย' (B24–B27) และ 'ระบบเรียกเครื่องมือและเวิร์กโฟลว์ที่รัดกุม' (B28) พร้อมสำหรับการเชื่อมต่อมาตรฐานโลกอย่าง MCP ในวันพรุ่งนี้แล้ว",
      bullets: [
        "**D109**: Allowlist + `extra='forbid'` + `strict=True` + Structured `ToolExecutionResult`",
        "**D110**: `mode='read'|'write'` + Tenant-scoped Idempotency Key + `asyncio.wait_for`",
        "**D111**: 5 Anthropic Workflow Patterns + `max_rounds` Evaluator-Optimizer",
      ],
      whyTitle: "Why this matters — ใน Block B29 (MCP) และ Block B30 (LangGraph) เราจะนำเกราะทั้ง 4 ข้อนี้ไปห่อรอบ MCP Server และ StateGraph",
      whyParagraphs: [
        "ไม่ว่าเทคโนโลยีเชื่อมต่อเครื่องมือจะเปลี่ยนจาก Local Functions เป็น MCP Server หรือเปลี่ยนจาก Python Router เป็น LangGraph State Machine กฎความปลอดภัยทั้ง 4 ข้อนี้ยังคงเหมือนเดิมทุกประการ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Multi-Step Support Workflow กับ API Controller + Service Layer",
      body: [
        "สถาปัตยกรรมรวมของวันทบทวนนี้จับคู่กับระบบ Backend มาตรฐานได้ดังนี้:",
      ],
      table: [
        ["Intent Router (`order` / `ticket` / `policy`)", "API Router แยก `GET /orders`, `POST /tickets`, `POST /kb/ask`"],
        ["Strict Pydantic Tool Args", "Request DTO Validation (`extra='forbid'`, `strict=True`)"],
        ["Idempotent Ticket Creation", "`POST /tickets` พร้อม `Idempotency-Key` ผูกกับ `tenant_id`"],
        ["Evaluator-Optimizer Citation Repair", "Outbound Response Validator พร้อม Retry-with-Feedback 1 รอบ"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมการจำลอง `draft_generator` ด้วยฟังก์ชันที่รับ `(round_idx, feedback)` จึงทดสอบง่าย",
      body: [
        "ในชุดทดสอบ `pytest` เราสามารถส่ง `lambda round_idx, fb: ...` ที่แกล้งลืมใส่ป้ายอ้างอิงใน `round_idx == 1` แล้วพอได้รับ `fb` ใน `round_idx == 2` จึงเติมป้าย `[policy-refund#c01]` ให้ถูกต้อง",
        "เทคนิค Dependency Injection แบบนี้ช่วยให้เราพิสูจน์ได้ 100% ว่าลูป Evaluator-Optimizer ของเราส่ง `feedback` ไปซ่อมคำตอบในรอบที่ 2 จริง และหยุดทันทีเมื่อซ่อมเสร็จ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะประกอบ `SupportWorkflowAssistant` ที่มี 3 เส้นทาง: (1) `order_lookup` (Read Tool), (2) `create_ticket` (Idempotent Write Tool ที่ตรวจ `allow_writes`) และ (3) `policy_rag` (Evaluator-Optimizer ซ่อมป้ายอ้างอิงไม่เกิน 2 รอบ)",
    steps: [
      {
        title: "1 · นิยาม Strict Schemas สำหรับ Read/Write Tools และผลลัพธ์ของ Assistant",
        explain:
          "ใช้ `ConfigDict(extra=\"forbid\", strict=True)` กับทั้ง `OrderLookupArgs` และ `CreateTicketArgs`",
        code: {
          language: "python",
          filename: "worked_b28_review.py",
          code: `import hashlib
import json
import re
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, ValidationError, field_validator

ORDER_ID_RE = re.compile(r"^INV-\\d{4}-\\d{3}$")
CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")


class OrderLookupArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    order_id: str

    @field_validator("order_id")
    @classmethod
    def check_id(cls, v: str) -> str:
        if not ORDER_ID_RE.match(v):
            raise ValueError("Invalid order_id")
        return v


class CreateTicketArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    order_id: str
    issue: str
    amount_thb: int

    @field_validator("order_id")
    @classmethod
    def check_id(cls, v: str) -> str:
        if not ORDER_ID_RE.match(v):
            raise ValueError("Invalid order_id")
        return v


class WorkflowTurnResult(BaseModel):
    route: Literal["order_lookup", "create_ticket", "policy_rag"]
    status: Literal[
        "ok",
        "validation_error",
        "write_forbidden",
        "abstain_unverified",
    ]
    response_text: str
    from_idempotency_cache: bool = False
    rounds_used: int = 1`,
        },
      },
      {
        title: "2 · สร้าง `SupportWorkflowAssistant` ที่รวม Router + Safe Tools + Evaluator-Optimizer",
        explain:
          "แยกจัดการแต่ละ route อย่างรัดกุม: ตรวจ Strict Schema, บังคับ `allow_writes` และแคช Idempotency สำหรับการสร้างทิกเก็ต และรันลูปซ่อม Citation สำหรับคำถามนโยบาย",
        code: {
          language: "python",
          filename: "worked_b28_review.py",
          code: `class SupportWorkflowAssistant:
    def __init__(self) -> None:
        self._ticket_cache: dict[str, str] = {}
        self.ticket_write_count: int = 0

    def run_order_lookup(self, raw_args: dict[str, Any]) -> WorkflowTurnResult:
        try:
            args = OrderLookupArgs.model_validate(raw_args)
        except ValidationError:
            return WorkflowTurnResult(
                route="order_lookup",
                status="validation_error",
                response_text="รหัสคำสั่งซื้อไม่ถูกต้อง",
            )
        return WorkflowTurnResult(
            route="order_lookup",
            status="ok",
            response_text=f"ออเดอร์ {args.order_id} สถานะ: จัดส่งแล้ว",
        )

    def run_create_ticket(
        self,
        tenant_id: str,
        raw_args: dict[str, Any],
        allow_writes: bool = False,
    ) -> WorkflowTurnResult:
        if not allow_writes:
            return WorkflowTurnResult(
                route="create_ticket",
                status="write_forbidden",
                response_text="ไม่อนุญาตให้สร้างทิกเก็ตในโหมดอ่านอย่างเดียว",
            )
        try:
            args = CreateTicketArgs.model_validate(raw_args)
        except ValidationError:
            return WorkflowTurnResult(
                route="create_ticket",
                status="validation_error",
                response_text="ข้อมูลการเปิดทิกเก็ตไม่ถูกต้อง",
            )
        canonical = json.dumps(args.model_dump(), sort_keys=True, ensure_ascii=False)
        idem_key = hashlib.sha256(f"{tenant_id}:create_ticket:{canonical}".encode()).hexdigest()[:20]
        if idem_key in self._ticket_cache:
            return WorkflowTurnResult(
                route="create_ticket",
                status="ok",
                response_text=self._ticket_cache[idem_key],
                from_idempotency_cache=True,
            )
        self.ticket_write_count += 1
        msg = f"สร้างทิกเก็ต TK-{self.ticket_write_count} สำหรับ {args.order_id} สำเร็จ"
        self._ticket_cache[idem_key] = msg
        return WorkflowTurnResult(route="create_ticket", status="ok", response_text=msg)

    def run_policy_rag(
        self,
        allowed_chunks: dict[str, str],
        draft_fn: Callable[[int, str | None], str],
        max_rounds: int = 2,
    ) -> WorkflowTurnResult:
        feedback: str | None = None
        for round_idx in range(1, max_rounds + 1):
            draft = draft_fn(round_idx, feedback)
            cites = CITATION_RE.findall(draft)
            if cites and all(cid in allowed_chunks for cid in cites):
                return WorkflowTurnResult(
                    route="policy_rag",
                    status="ok",
                    response_text=draft,
                    rounds_used=round_idx,
                )
            feedback = f"กรุณาอ้างอิงเฉพาะรหัสใน {sorted(allowed_chunks.keys())}"
        return WorkflowTurnResult(
            route="policy_rag",
            status="abstain_unverified",
            response_text="ขออภัย ไม่สามารถยืนยันคำตอบจากเอกสารนโยบายได้",
            rounds_used=max_rounds,
        )`,
        },
      },
      {
        title: "3 · ทดสอบทั้ง 3 สายงานบนเครื่อง",
        explain:
          "ดูการทำงานของการสร้างทิกเก็ตซ้ำที่ได้ผลจาก Idempotency Cache และการซ่อม Citation ในรอบที่ 2 ของ Evaluator-Optimizer",
        code: {
          language: "python",
          filename: "worked_b28_review.py",
          code: `bot = SupportWorkflowAssistant()

t1 = bot.run_create_ticket(
    "acme_th",
    {"order_id": "INV-2026-009", "issue": "กล่องบุบ", "amount_thb": 1200},
    allow_writes=True,
)
t2_dup = bot.run_create_ticket(
    "acme_th",
    {"order_id": "INV-2026-009", "issue": "กล่องบุบ", "amount_thb": 1200},
    allow_writes=True,
)
pol = bot.run_policy_rag(
    {"policy-refund#c01": "คืนเงินได้ภายใน 14 วัน"},
    draft_fn=lambda r, fb: "คืนเงินใน 14 วัน" if r == 1 else "คืนเงินใน 14 วัน [policy-refund#c01]",
)

print("Ticket 1:", t1.response_text, "| cached:", t1.from_idempotency_cache)
print("Ticket 2 (dup):", t2_dup.response_text, "| cached:", t2_dup.from_idempotency_cache, "| writes:", bot.ticket_write_count)
print("Policy RAG:", pol.status, "in round", pol.rounds_used, "->", pol.response_text)`,
        },
        output: `Ticket 1: สร้างทิกเก็ต TK-1 สำหรับ INV-2026-009 สำเร็จ | cached: False
Ticket 2 (dup): สร้างทิกเก็ต TK-1 สำหรับ INV-2026-009 สำเร็จ | cached: True | writes: 1
Policy RAG: ok in round 2 -> คืนเงินใน 14 วัน [policy-refund#c01]`,
      },
    ],
    gotcha:
      "สังเกตใน `run_create_ticket`: เราต้องตรวจ `if not allow_writes:` และตรวจ `CreateTicketArgs.model_validate(raw_args)` **ก่อน** คำนวณคีย์หรือแตะต้อง `_ticket_cache` เสมอ เพื่อให้คำขอที่ไม่ถูกต้องถูกปฏิเสธตั้งแต่หน้าประตู!",
  },

  practice: {
    intro:
      "ภารกิจทบทวน 15 นาที: สร้างโมดูล `support_router.py` ที่มี `SupportWorkflowAssistant` ครบทั้ง 3 เส้นทาง (`run_order_lookup`, `run_create_ticket`, `run_policy_rag`) พร้อมเขียนชุดทดสอบ `test_support_router.py`",
    requirements: [
      "ประกาศ `OrderLookupArgs` และ `CreateTicketArgs` ด้วย `ConfigDict(extra=\"forbid\", strict=True)` และตรวจรูปแบบ `order_id` (`^INV-\\d{4}-\\d{3}$`)",
      "ใน `run_order_lookup(raw_args)` ให้ตรวจ `OrderLookupArgs` หากไม่ผ่านให้คืน `status=\"validation_error\"` หากผ่านให้คืน `status=\"ok\"`",
      "ใน `run_create_ticket(tenant_id, raw_args, allow_writes=False)` ให้บล็อกด้วย `status=\"write_forbidden\"` เมื่อ `allow_writes=False`, ตรวจ `CreateTicketArgs`, และใช้ Idempotency Cache แยกตาม `tenant_id` เพื่อป้องกันการเพิ่ม `ticket_write_count` ซ้ำเมื่อส่งคำขอเดิม",
      "ใน `run_policy_rag(allowed_chunks, draft_fn, max_rounds=2)` ให้รันลูป Evaluator-Optimizer ตรวจว่าคำตอบมีป้าย `[doc_id#chunk]` ที่อยู่ใน `allowed_chunks` ทุกอันและตัวเลขในประโยค (หลังลบป้ายอ้างอิงแล้ว) ปรากฏในข้อความของ chunk ที่อ้าง หากครบ `max_rounds` แล้วยังไม่ผ่านให้คืน `status=\"abstain_unverified\"`",
      "เขียน `test_support_router.py` ทดสอบครบทั้ง 5 กรณี: (1) order lookup strict validation, (2) write forbidden guard, (3) idempotent ticket creation, (4) citation repair in round 2 และ (5) citation repair exhausted after max_rounds",
    ],
    starter: {
      language: "python",
      filename: "support_router.py",
      code: `import hashlib
import json
import re
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, ValidationError, field_validator

ORDER_ID_RE = re.compile(r"^INV-\\d{4}-\\d{3}$")
CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")
NUMBER_RE = re.compile(r"\\d+")


class OrderLookupArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    order_id: str

    @field_validator("order_id")
    @classmethod
    def check_id(cls, v: str) -> str:
        if not ORDER_ID_RE.match(v):
            raise ValueError("Invalid order_id format")
        return v


class CreateTicketArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    order_id: str
    issue: str
    amount_thb: int

    @field_validator("order_id")
    @classmethod
    def check_id(cls, v: str) -> str:
        if not ORDER_ID_RE.match(v):
            raise ValueError("Invalid order_id format")
        return v


class WorkflowTurnResult(BaseModel):
    route: Literal["order_lookup", "create_ticket", "policy_rag"]
    status: Literal[
        "ok",
        "validation_error",
        "write_forbidden",
        "abstain_unverified",
    ]
    response_text: str
    from_idempotency_cache: bool = False
    rounds_used: int = 1


class SupportWorkflowAssistant:
    def __init__(self) -> None:
        self._ticket_cache: dict[str, str] = {}
        self.ticket_write_count: int = 0

    def run_order_lookup(self, raw_args: dict[str, Any]) -> WorkflowTurnResult:
        # TODO: validate with OrderLookupArgs and return WorkflowTurnResult
        raise NotImplementedError

    def run_create_ticket(
        self,
        tenant_id: str,
        raw_args: dict[str, Any],
        allow_writes: bool = False,
    ) -> WorkflowTurnResult:
        # TODO: check allow_writes, validate CreateTicketArgs, enforce tenant-scoped idempotency cache
        raise NotImplementedError

    def run_policy_rag(
        self,
        allowed_chunks: dict[str, str],
        draft_fn: Callable[[int, str | None], str],
        max_rounds: int = 2,
    ) -> WorkflowTurnResult:
        # TODO: run bounded Evaluator-Optimizer verifying citations & numbers against allowed_chunks
        raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`CreateTicketArgs` ปฏิเสธเมื่อส่ง `amount_thb=\"1200\"` (เป็น string แทน int) หรือส่งฟิลด์เกินมาใช่หรือไม่?",
      "เมื่อเรียก `run_create_ticket` ซ้ำด้วยข้อมูลเดิมและ `tenant_id` เดิม ค่า `ticket_write_count` เพิ่มขึ้นเพียง 1 ครั้งและรอบที่สองได้ `from_idempotency_cache=True` ใช่หรือไม่?",
      "ใน `run_policy_rag` ลบป้าย `[doc_id#chunk]` ออกก่อนตรวจตัวเลขในประโยคเทียบกับข้อความใน `allowed_chunks` ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทั้ง 5 การทดสอบบูรณาการของ Block B28 และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ในการตรวจตัวเลขของ `run_policy_rag` หลังจากเช็กว่า `cites` ไม่ว่างและทุก `cid in allowed_chunks` แล้ว ให้ทำ `clean = CITATION_RE.sub(\"\", draft)` และ `evidence = \" \".join(allowed_chunks[cid] for cid in cites)` แล้วเช็ก `all(n in evidence for n in NUMBER_RE.findall(clean))`",
      },
      {
        body: "อย่าลืมนำ `tenant_id` มาผูกในคีย์ `_ticket_cache` เช่น `f\"{tenant_id}:{canonical_json}\"`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_support_router.py`:",
        code: {
          language: "python",
          filename: "test_support_router.py",
          code: `from support_router import SupportWorkflowAssistant


def test_order_lookup_strict_validation() -> None:
    bot = SupportWorkflowAssistant()
    ok = bot.run_order_lookup({"order_id": "INV-2026-009"})
    assert ok.status == "ok" and "INV-2026-009" in ok.response_text

    bad_extra = bot.run_order_lookup({"order_id": "INV-2026-009", "extra": 1})
    bad_fmt = bot.run_order_lookup({"order_id": "123"})
    assert bad_extra.status == "validation_error"
    assert bad_fmt.status == "validation_error"


def test_create_ticket_blocks_when_writes_disabled_or_invalid_type() -> None:
    bot = SupportWorkflowAssistant()
    payload = {"order_id": "INV-2026-009", "issue": "สินค้าชำรุด", "amount_thb": 1500}
    forbidden = bot.run_create_ticket("acme", payload, allow_writes=False)
    assert forbidden.status == "write_forbidden"
    assert bot.ticket_write_count == 0

    bad_type = bot.run_create_ticket(
        "acme",
        {"order_id": "INV-2026-009", "issue": "สินค้าชำรุด", "amount_thb": "1500"},
        allow_writes=True,
    )
    assert bad_type.status == "validation_error"
    assert bot.ticket_write_count == 0


def test_create_ticket_is_idempotent_per_tenant() -> None:
    bot = SupportWorkflowAssistant()
    payload = {"order_id": "INV-2026-009", "issue": "สินค้าชำรุด", "amount_thb": 1500}
    r1 = bot.run_create_ticket("acme", payload, allow_writes=True)
    r2 = bot.run_create_ticket("acme", payload, allow_writes=True)
    r_other = bot.run_create_ticket("beta", payload, allow_writes=True)

    assert r1.status == "ok" and r1.from_idempotency_cache is False
    assert r2.status == "ok" and r2.from_idempotency_cache is True
    assert r1.response_text == r2.response_text
    assert r_other.from_idempotency_cache is False
    assert bot.ticket_write_count == 2


def test_policy_rag_repairs_in_round_two_and_abstains_when_exhausted() -> None:
    bot = SupportWorkflowAssistant()
    chunks = {"policy-refund#c01": "คืนเงินได้ภายใน 14 วันทำการ"}

    repaired = bot.run_policy_rag(
        chunks,
        draft_fn=lambda r, fb: "คืนเงินได้ภายใน 14 วันทำการ"
        if r == 1
        else "คืนเงินได้ภายใน 14 วันทำการ [policy-refund#c01]",
        max_rounds=2,
    )
    assert repaired.status == "ok"
    assert repaired.rounds_used == 2

    failed = bot.run_policy_rag(
        chunks,
        draft_fn=lambda r, fb: "คืนเงินได้ภายใน 30 วัน [policy-refund#c01]",
        max_rounds=2,
    )
    assert failed.status == "abstain_unverified"
    assert failed.rounds_used == 2`,
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
      title: "ตรวจ Idempotency Cache ก่อนตรวจ `allow_writes`",
      symptom:
        "คำขอที่ส่งมาในโหมด `allow_writes=False` เผลอได้รับผลลัพธ์สำเร็จของคำขอสร้างทิกเก็ตก่อนหน้ากลับไปแทนที่จะถูกบล็อกด้วย `write_forbidden`",
      fix: "ตรวจสิทธิ์ (`if not allow_writes:`) และตรวจ Schema Validation ก่อนแตะต้อง Idempotency Cache เสมอ",
    },
    {
      title: "ใน Evaluator-Optimizer ซ่อมแต่ป้าย `[doc_id#chunk]` แต่ลืมตรวจตัวเลขในประโยคซ้ำหลังซ่อม",
      symptom:
        "โมเดลเติมป้าย `[policy-refund#c01]` ให้ในรอบที่ 2 แต่แอบเปลี่ยนตัวเลขจาก 14 วันเป็น 30 วัน แล้วหลุดผ่านด่านออกไป",
      fix: "ทุกครั้งที่ตรวจร่างคำตอบในแต่ละรอบ ต้องรันเกณฑ์ตรวจครบชุด (ทั้ง Citation ID และ Numeric Support Check) เสมอ",
    },
    {
      title: "ปล่อยให้โมเดลในสาย `policy_rag` มีสิทธิ์เรียก Write Tools ได้",
      symptom:
        "คำสั่งโจมตีในเอกสารนโยบายสามารถหลอกให้โมเดลสั่งสร้างทิกเก็ตหรือคืนเงินได้",
      fix: "ใช้ Routing Pattern แยกสาย `policy_rag` ออกจากการเรียก Write Tools อย่างเด็ดขาด",
    },
    {
      title: "ไม่ส่ง `feedback` ที่ระบุรหัส `allowed_chunks` กลับไปให้ฟังก์ชันซ่อมคำตอบในรอบที่ 2",
      symptom:
        "โมเดลรู้แค่ว่า 'ผิด' แต่ไม่รู้ว่าต้องแก้ไขเรื่องอะไรหรือมีรหัสใดที่อนุญาตให้อ้างอิงได้บ้าง จึงตอบผิดซ้ำเดิมในรอบที่ 2",
      fix: "ส่ง `feedback` ที่ระบุสาเหตุชัดเจน (เช่น `missing_citation` หรือ `numeric_mismatch` พร้อมรายชื่อรหัสที่อนุญาต)",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d112-q1",
        "ใน `run_create_ticket` ลำดับการตรวจสอบข้อใดถูกต้องและปลอดภัยที่สุด?",
        [
          ["ดึงจาก Idempotency Cache ก่อน → ค่อยตรวจ `allow_writes` → ค่อยตรวจ Pydantic Schema", "ผิด — ถ้า `allow_writes=False` ต้องปฏิเสธทันที ห้ามคืนค่าจากแคชของ write action"],
          ["ตรวจ `allow_writes` (Least Privilege) → ตรวจ Strict Pydantic Schema (`extra='forbid', strict=True`) → ตรวจ/บันทึก Tenant-Scoped Idempotency Cache", "ถูกต้อง — ต้องยืนยันสิทธิ์และความถูกต้องของพารามิเตอร์ก่อนแตะต้องแคชหรือรัน side effect เสมอ"],
          ["รันฟังก์ชันสร้างทิกเก็ตก่อน → ถ้าพารามิเตอร์ผิดค่อยลบทิกเก็ตทีหลัง", "อันตราย — เกิด side effect ไปแล้ว"],
          ["ตรวจเฉพาะความยาวของสตริงโดยไม่ต้องใช้ Pydantic", "ไม่ป้องกันชนิดข้อมูลผิดหรือฟิลด์เกิน"],
        ],
        "B",
        "ลำดับ Defense-in-Depth สำหรับ Write Tool คือ: Permission Gate (`allow_writes`) → Schema Gate (`model_validate`) → Idempotency Gate → Bounded Execution",
        "ลำดับด่านตรวจที่ถูกต้องก่อนรัน Write Tool คืออะไร?",
        "ตรวจสิทธิ์ `allow_writes` → ตรวจ Strict Pydantic Schema → ตรวจ Tenant-Scoped Idempotency Cache → รันฟังก์ชันจริง",
      ),
      mc(
        "d112-q2",
        "ในการผสาน Block B27 (Grounded Citations) เข้ากับ Block B28 (Evaluator-Optimizer) อะไรทำหน้าที่เป็น 'Evaluator' ในลูปซ่อมคำตอบของเรา?",
        [
          ["การสุ่มโยนเหรียญหัวก้อยใน Python", "ไม่สามารถตรวจความถูกต้องของคำตอบได้"],
          ["Deterministic Python Verifier ที่ตรวจว่าทุกประโยคมีป้าย `[doc_id#chunk]` ซึ่งอยู่ใน `allowed_chunks` ของรอบนั้น และตัวเลขทุกตัวในประโยคตรงกับเนื้อหาใน chunk", "ถูกต้อง — ได้ทั้งความเร็วระดับไมโครวินาที ฟรี และให้ feedback ที่แม่นยำ 100%"],
          ["การรอให้ลูกค้ากดรายงานคำตอบผิดในวันรุ่งขึ้น", "ช้าเกินไป คำตอบผิดหลุดถึงลูกค้าไปแล้ว"],
          ["การนับจำนวนตัวอักษรให้เกิน 500 ตัว", "ความยาวไม่ได้รับประกันความถูกต้องของแหล่งอ้างอิง"],
        ],
        "B",
        "การใช้โค้ดตรวจสอบแบบ Deterministic เป็น Evaluator ช่วยให้ลูป Evaluator-Optimizer ทำงานเร็ว แม่นยำ และไม่เสียค่าเรียก LLM ซ้อนเพื่อตรวจรูปแบบ",
        "อะไรคือ Evaluator ที่ดีที่สุดสำหรับการซ่อม Inline Citations ใน Evaluator-Optimizer Workflow?",
        "Deterministic Python Citation & Numeric Verifier ที่ตรวจเทียบกับ `allowed_chunks` ของรอบนั้น",
      ),
      mc(
        "d112-q3",
        "หากในรอบที่ 1 ของ `run_policy_rag` ร่างคำตอบคือ `'คืนเงินได้ภายใน 14 วัน'` (ลืมใส่ป้ายอ้างอิง) และในรอบที่ 2 ร่างที่ซ่อมแล้วคือ `'คืนเงินได้ภายใน 30 วัน [policy-refund#c01]'` (ใส่ป้ายถูกแต่เปลี่ยนเลข 14 เป็น 30) ผลลัพธ์เมื่อ `max_rounds=2` ควรเป็นอย่างไร?",
        [
          ["ผ่านเป็น `status=\"ok\"` เพราะรอบที่ 2 มีป้าย `[policy-refund#c01]` แล้ว", "ผิด — ตัวเลข 30 ไม่ตรงกับหลักฐาน (14 วัน) จึงเป็น Numeric Hallucination"],
          ["ตกเกณฑ์ในรอบที่ 2 เพราะตัวเลขไม่ตรงกับหลักฐาน และเนื่องจากครบ `max_rounds=2` แล้วจึงคืน `status=\"abstain_unverified\"` พร้อมข้อความปฏิเสธที่ปลอดภัย", "ถูกต้อง — ต้องตรวจครบทุกเกณฑ์ในทุกรอบ และตัดเข้า Safe Abstention เมื่อครบเพดานรอบ"],
          ["วนซ่อมต่อไปเรื่อย ๆ จนถึงรอบที่ 100", "ละเมิดเพดาน `max_rounds=2`"],
          ["ส่งร่างของรอบที่ 1 ให้ลูกค้าแทน", "ร่างรอบที่ 1 ก็ไม่มีป้ายอ้างอิง จึงไม่ผ่านเกณฑ์เช่นกัน"],
        ],
        "B",
        "การซ่อมคำตอบในรอบที่ 2 ต้องผ่านด่านตรวจครบทุกข้อเหมือนรอบแรก (ทั้ง Citation ID และ Numeric Support) หากยังไม่ผ่านเมื่อครบ `max_rounds` ต้อง Fail-Closed ทันที",
        "เมื่อซ่อมคำตอบครบ `max_rounds` แล้วยังไม่ผ่านเกณฑ์ Citation + Numeric Check ระบบต้องทำอย่างไร?",
        "หยุดวนลูปและคืนสถานะ `abstain_unverified` พร้อมข้อความปฏิเสธที่ปลอดภัย (Fail-Closed)",
      ),
      mc(
        "d112-q4",
        "การใช้ Routing Workflow แยกสาย `policy_rag` ออกจากสาย `create_ticket` ช่วยเสริมความปลอดภัยด้านใดโดยตรง?",
        [
          ["ทำให้สาย `policy_rag` ไม่มีสิทธิ์เข้าถึงหรือเรียกใช้ Write Tools (`allow_writes=False`) ตั้งแต่ระดับโครงสร้างโค้ด ป้องกันไม่ให้ Indirect Prompt Injection ในเอกสารสั่งสร้างทิกเก็ตหรือแก้ไขข้อมูลได้", "ถูกต้อง — แยกขอบเขตความสามารถ (Capability Isolation) ตามประเภทของงาน"],
          ["ทำให้ไม่ต้องตรวจสอบ Citation ในสาย `policy_rag` อีกต่อไป", "ยังต้องตรวจ Citation เสมอ"],
          ["ทำให้ไม่ต้องใช้ Pydantic ในสาย `create_ticket`", "ยังต้องใช้ Strict Pydantic Schema เสมอ"],
          ["ทำให้ฐานข้อมูลไม่ต้องใช้รหัสผ่าน", "ไม่เกี่ยวข้องกับรหัสผ่านฐานข้อมูล"],
        ],
        "A",
        "Routing Workflow ไม่ได้ช่วยแค่เรื่องความเร็วและความแม่นยำ แต่ยังเป็นขอบเขตจำกัดสิทธิ์ (Security Capability Boundary) ชั้นเยี่ยม",
        "Routing Workflow ช่วยจำกัดรัศมีความเสียหายจาก Indirect Prompt Injection ได้อย่างไร?",
        "โดยแยกสายอ่านเอกสาร (`policy_rag`) ออกจากสายเรียก Write Tools ทำให้เอกสารที่ปนเปื้อนไม่สามารถสั่งรัน Write Action ได้",
      ),
    ],
  },

  takeaways: [
    "การผสาน **Routing + Strict Safe Tools + Bounded Evaluator-Optimizer** ทำให้เราสร้างระบบผู้ช่วยลูกค้าที่ทั้งฉลาด ปลอดภัย และคาดเดาพฤติกรรมได้ 100%",
    "**Write Tools** ต้องผ่าน 3 ด่านเสมอ: `allow_writes` check → Strict Pydantic Schema (`extra='forbid', strict=True`) → Tenant-Scoped Idempotency Cache",
    "**Evaluator-Optimizer สำหรับ RAG** ช่วยซ่อมคำตอบที่ลืมใส่ป้ายอ้างอิงได้ภายใน `max_rounds=2` โดยยังคงมาตรฐาน Faithfulness = 1.0",
    "จบ Block B28 แล้ว! พรุ่งนี้ (Day 113 — Block B29) เราจะก้าวเข้าสู่มาตรฐาน **Model Context Protocol (MCP)** เพื่อเชื่อมต่อ Tools และ Resources ด้วยสถาปัตยกรรม Host / Client / Server มาตรฐานอุตสาหกรรม",
  ],

  reviewCards: [
    rc(
      "d112-rc1",
      "ทำไมจึงต้องตรวจ `allow_writes` และ `CreateTicketArgs.model_validate` ก่อนตรวจ Idempotency Cache?",
      "เพื่อไม่ให้คำขอที่ไม่มีสิทธิ์ (`allow_writes=False`) หรือพารามิเตอร์ผิดรูปแบบได้รับผลลัพธ์สำเร็จจากแคชกลับไปโดยผิดพลาด",
    ),
    rc(
      "d112-rc2",
      "ลูป Evaluator-Optimizer ใน `run_policy_rag` ช่วยแก้ปัญหาใดของระบบ RAG?",
      "ช่วยกู้คืนคำตอบที่โมเดลสรุปเนื้อหาถูกแต่เผลอลืมใส่ป้าย `[doc_id#chunk]` ในรอบแรก โดยส่ง feedback ให้ซ่อมภายใน `max_rounds` ก่อนตัดเข้า Abstention",
    ),
    rc(
      "d112-rc3",
      "ถ้าในรอบซ่อมคำตอบของ Evaluator-Optimizer โมเดลเติมป้าย `[doc_id#chunk]` ถูกต้อง แต่แอบเปลี่ยนตัวเลขในประโยค ด่านตรวจจะทำอย่างไร?",
      "ตีตกด้วย Numeric Support Check และหากครบ `max_rounds` แล้วจะตัดเข้าสถานะ `abstain_unverified` ทันที",
    ),
    rc(
      "d112-rc4",
      "การแยก Route `order_lookup`, `create_ticket` และ `policy_rag` ออกจากกันช่วยเรื่อง Least Privilege อย่างไร?",
      "แต่ละสายงานได้รับเฉพาะเครื่องมือและสิทธิ์ที่จำเป็นเท่านั้น (เช่น สายอ่านเอกสารและเช็กออเดอร์ถูกปิดสิทธิ์ `allow_writes=False` ถาวร)",
    ),
  ],

  sources: [
    {
      label: "Anthropic Research — Building Effective Agents (Routing & Evaluator-Optimizer)",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
    {
      label: "Pydantic v2 Documentation — Strict Mode & Validators",
      href: "https://docs.pydantic.dev/latest/concepts/strict_mode/",
    },
    {
      label: "OWASP Top 10 for LLM Applications — LLM06: Excessive Agency Mitigation",
      href: "https://genai.owasp.org/llmrisk/llm06-2025-excessive-agency/",
    },
  ],

  glossary: ["workflow-patterns", "tool-calling", "idempotency", "pydantic", "groundedness", "abstention", "pytest"],
});
