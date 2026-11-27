import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D121 — Phase 4 / Block B31
 * Phase 4 Mini-Project: Integrating Thai Hybrid RAG + MCP Tool + Guarded LangGraph
 */
export const d121: Lesson = defineLesson({
  day: 121,
  titleTh: "Phase 4 Mini-Project: เชื่อม Thai Hybrid RAG + MCP Tool + Guarded LangGraph",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ประกอบระบบผู้ช่วยลูกค้าไทยครบวงจรที่รวม Pre-Retrieval ACL, RRF, MCP Lookup และ HITL State Machine",
  icon: "rocket",
  visual: {
    id: "phase4-rag-agent-arch",
    title: "สถาปัตยกรรม Phase 4: Thai Hybrid RAG + FastMCP + Guarded LangGraph",
    caption: "สลับดูเส้นทางการทำงานทั้ง 3 สาย: ค้นนโยบายด้วย Hybrid RAG, เรียก MCP Tool แบบผูกสิทธิ์ Tenant และหยุดรออนุมัติคืนเงินด้วย HITL",
    alt: "แผนภาพสถาปัตยกรรม Phase 4 Mini-Project",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้างระบบบูรณาการ Thai Hybrid RAG + MCP + Guarded LangGraph ทดสอบด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "FastMCP Concepts", "LangGraph Concepts", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "วันเริ่มประกอบร่าง Portfolio Milestone ชิ้นที่ 4 (`v0.4.0`)",
      body: "ตลอด 28 วันที่ผ่านมาของ Phase 4 (Day 93–120) เราสร้างทุกชิ้นส่วนแยกกันอย่างประณีต: Thai Hybrid Search ({{bm25}} + {{hnsw}} + {{rrf}}), Multi-Tenant {{acl}}, Grounded Citations, Safe {{tool-calling}}, {{mcp}} Server/Client และ Guarded {{langgraph}} + {{hitl}} — วันนี้เราจะนำทุกชิ้นมาต่อเป็นระบบเดียว",
      lessonNote: "โปรเจกต์นี้คือชิ้นงานหลักชิ้นที่ 4 ในพอร์ตโฟลิโอของคุณ ต่อจาก Typed Thai Document Extractor ใน Phase 3",
    },
    {
      node: 1,
      heading: "เส้นทางที่ 1: คำถามนโยบายภาษาไทย → Pre-Retrieval ACL + Hybrid RRF",
      body: "เมื่อลูกค้าถามเรื่องนโยบาย (เช่น การคืนเงิน การจัดส่ง หรือการรับประกัน) กราฟจะส่งต่อไปยังโหนด `retrieve_policy` ที่กรองเอกสารตาม `auth.tenant_id` ก่อนคำนวณอันดับ {{rrf}} แล้วสร้างคำตอบที่แนบป้าย `[doc_id#chunk_id]` เสมอ",
      lessonNote: "ห้ามดึงเอกสารของบริษัทอื่นเข้าสู่ RRF หรือ Context เด็ดขาด (Zero Cross-Tenant Leakage)",
    },
    {
      node: 4,
      heading: "เส้นทางที่ 2 & 3: เช็กออเดอร์ผ่าน MCP (`lookup_order`) และขอคืนเงินผ่านด่าน HITL",
      body: "เมื่อลูกค้าถามสถานะออเดอร์ กราฟจะเรียก {{mcp}} Tool `lookup_order(order_id, tenant_id)` โดยใช้ `tenant_id` จาก `AuthContext` ที่เชื่อถือได้ฝั่งเซิร์ฟเวอร์ และเมื่อลูกค้าขอคืนเงิน กราฟจะหยุดพักที่สถานะ `awaiting_approval` ({{hitl}}) ก่อนรันคำสั่งโอนเงินจริง",
      lessonNote: "หากคำถามอยู่นอกขอบเขตหรือเครื่องมือล้มเหลว กราฟจะเลี้ยวเข้าโหนด `abstain` อย่างปลอดภัยภายใต้เพดาน `max_steps`",
    },
    {
      node: 5,
      heading: "วางโครงสร้างหลักวันนี้ เพื่อต่อ Citation Gate (D122) และ 15-Query Benchmark (D123)",
      body: "โมดูล `thai_rag_agent.py` ที่คุณสร้างในวันนี้จะเป็นแกนกลางของทั้งสัปดาห์ Block B31 โดยพรุ่งนี้เราจะเพิ่มด่านซ่อม Citation อัตโนมัติ และมะรืนนี้จะรันทดสอบกับชุดคำถามลูกค้าภาษาไทย 15 สถานการณ์",
      lessonNote: "ออกแบบทุกฟังก์ชันให้รับข้อมูลจำลอง (Deterministic Fixtures) ได้ เพื่อให้รัน `pytest` ออฟไลน์ได้ 100%",
    },
  ],

  objectives: [
    "**ผสานท่อ Thai Hybrid RAG ที่มี Pre-Retrieval ACL** (`tenant_id`) เข้าเป็นโหนดหนึ่งใน State Machine โดยรวมอันดับ Lexical และ Vector ด้วย {{rrf}} และแนบป้ายอ้างอิง `[doc_id#chunk_id]`",
    "**เชื่อมต่อ MCP Order Lookup แบบผูกสิทธิ์ (`AuthContext`)** ที่ป้องกันการขอดูข้อมูลออเดอร์ข้ามบริษัทและจัดการกรณีเครื่องมือล้มเหลวด้วย Safe Fallback",
    "**ควบคุมเส้นทางทั้ง 4 สาย (`policy_rag`, `order_lookup`, `refund_hitl`, `out_of_scope`)** ด้วย Guarded State Machine ที่บังคับ `max_steps` และหยุดรออนุมัติก่อนคืนเงิน พร้อมทดสอบครบทุกสายด้วย {{pytest}}",
  ],

  prerequisites: [
    "ผ่าน Block B24–B27 (Thai Hybrid RAG, RRF, Citations, Multi-Tenant ACL)",
    "ผ่าน Block B28–B30 (Safe Tools, MCP Server/Client, Guarded LangGraph & HITL)",
    "ไม่ต้องใช้ API key — ประกอบและทดสอบระบบบูรณาการบนเครื่องด้วย `pytest` ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day121` ด้วย `uv` เพื่อสร้างแกนหลักของ Phase 4 Mini-Project ในไฟล์ `thai_rag_agent.py`",
    commands: `uv init ai-day121 && cd ai-day121
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day121` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เขียน `thai_rag_agent.py` และรัน `uv run pytest -v`"],
    ],
    note: "การแยก `AuthContext` ออกจาก `UserRequest` ในระดับ Type Signature ช่วยป้องกันบั๊กการเชื่อ `tenant_id` จากข้อความผู้ใช้ได้ตั้งแต่ตอนเขียนโค้ด",
  },

  concepts: [
    {
      id: "unified-state-and-intent-router",
      title: "1 · สถาปัตยกรรม 4 เส้นทางของ Controlled Thai Support Agent",
      paragraphs: [
        "ในระบบผู้ช่วยลูกค้าองค์กรจริง คำถามที่เข้ามาในช่องแชตเดียวกันมีความต้องการที่ต่างกันอย่างสิ้นเชิง การใช้ State Machine ของ {{langgraph}} ช่วยให้เราแยกการประมวลผลออกเป็น 4 เส้นทาง (Routes) ที่ชัดเจนตั้งแต่โหนดแรก (`route_intent`):",
        "1. **`policy_rag`**: คำถามเกี่ยวกับนโยบาย (เช่น `'คืนเงิน'`, `'จัดส่ง'`, `'รับประกัน'`) → วิ่งเข้าท่อ Pre-Retrieval {{acl}} + Hybrid {{rrf}} แล้วสร้างคำตอบพร้อมป้าย `[doc_id#chunk_id]`\n2. **`order_lookup`**: คำถามที่มีรหัสออเดอร์ `INV-YYYY-NNN` และไม่ได้ขอคืนเงิน → วิ่งเข้าโหนด {{mcp}} Read-Only Lookup ที่ผูก `auth.tenant_id`\n3. **`refund_hitl`**: คำขอที่มีคำว่า `'ขอคืนเงิน'` คู่กับรหัสออเดอร์ → วิ่งเข้าด่าน {{hitl}} หยุดพักที่ `status=\"awaiting_approval\"` รอผู้ดูแลอนุมัติก่อนโอนเงิน\n4. **`out_of_scope`**: คำถามนอกเรื่องหรือไม่มีหลักฐานรองรับ → วิ่งเข้าโหนด Safe {{abstention}} ทันที",
        "ทุกการเคลื่อนที่ระหว่างโหนดจะเพิ่ม `steps += 1` และถูกคุมด้วยเพดาน `max_steps` เสมอ",
      ],
      analogy:
        "เหมือนโถงต้อนรับของสำนักงานใหญ่ที่มีเคาน์เตอร์คัดกรองจุดเดียว: คำถามคู่มือส่งไปห้องสมุดของบริษัทนั้น, คำถามเช็กพัสดุส่งไปหน้าจอค้นฐานข้อมูล, คำขอเบิกเงินคืนส่งไปถาดรออนุมัติของผู้จัดการ และคำถามนอกเรื่องได้รับการปฏิเสธอย่างสุภาพตั้งแต่หน้าประตู",
      bullets: [
        "**Single Entry Point**: ทุกคำขอต้องแนบ `AuthContext(tenant_id, allowed_roles)` ที่เซิร์ฟเวอร์ยืนยันแล้ว",
        "**Route Isolation**: สาย `policy_rag` และ `order_lookup` ไม่มีสิทธิ์เรียกฟังก์ชันคืนเงินเด็ดขาด",
        "**Step Budget**: ทุกโหนดที่เดินผ่านถูกนับรวมใน `steps_taken <= max_steps`",
      ],
      whyTitle: "Why this matters — การแยก Route ชัดเจนทำให้เราเขียน Integration Test ตรวจแต่ละความเสี่ยงได้ 100%",
      whyParagraphs: [
        "เมื่อผลลัพธ์ของ Agent คืนทั้ง `route`, `status`, `citations` และ `steps_taken` เราสามารถเขียน `pytest` ยืนยันได้ทันทีว่าคำขอคืนเงินจะต้องได้ `route=\"refund_hitl\"` และ `status=\"awaiting_approval\"` เสมอ ไม่มีการเผลอโอนเงินเอง",
      ],
    },
    {
      id: "tenant-scoped-hybrid-rrf-and-mcp",
      title: "2 · ผูก `auth.tenant_id` ทั้งใน Hybrid RRF และใน MCP Order Lookup",
      paragraphs: [
        "จุดที่วิศวกรต้องระวังที่สุดเมื่อนำระบบ {{rag}} มาต่อกับระบบ {{mcp}} คือ **ความสม่ำเสมอของขอบเขตสิทธิ์ (`tenant_id`)**:",
        "บางทีมกรอง `tenant_id` ใน RAG เรียบร้อย แต่พอเขียนโหนดเรียก MCP `lookup_order(order_id)` กลับส่งแค่ `order_id` ที่สกัดได้จากข้อความแชตไปค้นในฐานข้อมูลโดยไม่ส่ง `auth.tenant_id` ไปเป็นเงื่อนไข `WHERE` ด้วย! ผลคือถ้าลูกค้าของบริษัท `acme_th` พิมพ์ถามว่า `'เช็กออเดอร์ INV-2026-021 ให้หน่อย'` (ซึ่งเป็นรหัสออเดอร์ของบริษัท `beta_th`) บอทก็จะดึงข้อมูลออเดอร์ของ `beta_th` มาตอบให้ทันที!",
        "ดังนั้นใน Mini-Project ของเรา ทั้งฟังก์ชัน `hybrid_retrieve_policy(corpus, auth)` และฟังก์ชัน `mcp_lookup_order(orders_db, order_id, auth)` ต้องรับ `auth: AuthContext` เข้าไปกรอง `record.tenant_id == auth.tenant_id` เสมอ หากรหัสออเดอร์นั้นเป็นของบริษัทอื่น ระบบต้องคืนผลว่า `found=False` (เสมือนไม่พบออเดอร์นั้น) โดยไม่เปิดเผยแม้แต่ว่ามีรหัสนี้อยู่ในบริษัทอื่น",
      ],
      analogy:
        "เหมือนพนักงานธนาคารที่เวลาลูกค้ายื่นเลขที่บัญชีมาขอดูยอด พนักงานต้องเช็กก่อนว่าเลขที่บัญชีนั้นเป็นของบริษัทที่ลูกค้าสังกัดอยู่หรือไม่ ถ้าเป็นบัญชีของบริษัทอื่น พนักงานต้องปฏิเสธทันที ไม่ใช่บอกยอดเงินหรือชื่อเจ้าของบัญชีนั้นออกไป",
      code: {
        language: "python",
        filename: "tenant_scoped_lookup.py",
        code: `from pydantic import BaseModel, ConfigDict


class AuthContext(BaseModel):
    model_config = ConfigDict(frozen=True)
    tenant_id: str


class OrderRecord(BaseModel):
    order_id: str
    tenant_id: str
    status: str
    amount_thb: int


def mcp_lookup_order(
    orders: list[OrderRecord],
    order_id: str,
    auth: AuthContext,
) -> OrderRecord | None:
    """ค้นหาออเดอร์โดยบังคับตรงทั้ง order_id และ auth.tenant_id เสมอ"""
    for rec in orders:
        if rec.order_id == order_id and rec.tenant_id == auth.tenant_id:
            return rec
    return None`,
        caption: "แม้ `order_id` จะมีอยู่ในระบบ แต่ถ้า `rec.tenant_id != auth.tenant_id` ฟังก์ชันจะคืน `None` เพื่อไม่ให้ข้อมูลรั่วข้ามบริษัท",
      },
      whyTitle: "Why this matters — ห้ามตอบว่า 'ออเดอร์นี้เป็นของบริษัท Beta คุณไม่มีสิทธิ์ดู' เพราะนั่นก็ถือเป็น Information Disclosure แล้ว!",
      whyParagraphs: [
        "ตามมาตรฐานความปลอดภัย OWASP การบอกให้ผู้โจมตีรู้ว่ารหัส `INV-2026-021` มีอยู่จริงและเป็นของบริษัทใดถือเป็นการรั่วไหลของข้อมูล (Enumeration Leak) วิธีที่ปลอดภัยที่สุดคือตอบเหมือนกรณีไม่พบรหัสคำสั่งซื้อในบัญชีของผู้ใช้นั้น",
      ],
    },
    {
      id: "graceful-tool-failure-and-hitl-pause",
      title: "3 · การรับมือเมื่อ MCP Tool ล้มเหลว และการหยุดรอ HITL ก่อนคืนเงิน",
      paragraphs: [
        "ในเส้นทาง `order_lookup` หากการเรียก {{mcp}} Server เกิดข้อผิดพลาด (เช่น ฐานข้อมูลล่มหรือ Timeout) กราฟต้องจับ Exception แล้วเปลี่ยนสถานะเป็น `status=\"fallback_tool_error\"` พร้อมคืนข้อความสุภาพให้ลูกค้าลองใหม่ภายหลัง โดยไม่ปล่อยให้กราฟแครชหรือแต่งสถานะออเดอร์ขึ้นมาเอง",
        "ส่วนในเส้นทาง `refund_hitl` เมื่อผู้ใช้พิมพ์ขอคืนเงินพร้อมรหัสออเดอร์ (เช่น `'ขอคืนเงินออเดอร์ INV-2026-009'`) กราฟจะตรวจก่อนว่าออเดอร์นั้นเป็นของ `auth.tenant_id` จริงหรือไม่ หากไม่พบออเดอร์ใน tenant นั้นให้ปฏิเสธทันที แต่หากพบออเดอร์ของตัวเอง กราฟจะหยุดพักที่ `status=\"awaiting_approval\"` โดยยังไม่เรียกฟังก์ชันโอนเงินจนกว่าผู้ดูแลจะอนุมัติ",
        "ด้วยการออกแบบนี้ ทุกเส้นทางจะจบภายใน `2–3` ก้าว (`steps_taken <= max_steps`) เสมอ",
      ],
      analogy:
        "เหมือนระบบตู้ ATM ที่ถ้าสายสัญญาณธนาคารขัดข้อง ตู้จะขึ้นหน้าจอแจ้งเหตุขัดข้องและคืนบัตรให้ลูกค้าทันที (Fallback) ไม่ใช่สุ่มจ่ายเงินหรือยึดบัตรค้างไว้",
      bullets: [
        "**Verify Ownership First**: ก่อนส่งคำขอคืนเงินเข้าคิว `awaiting_approval` ต้องเช็กก่อนว่าออเดอร์นั้นเป็นของ `auth.tenant_id` จริง",
        "**Tool Failure Fallback**: เมื่อ MCP lookup โยน Exception ให้คืน `status=\"fallback_tool_error\"`",
        "**Bounded Steps**: ถ้า `max_steps` ต่ำเกินไปจนเดินไม่จบ ให้ตัดเข้า `status=\"max_steps_reached\"`",
      ],
      whyTitle: "Why this matters — อย่าสร้างตั๋วรออนุมัติคืนเงินสำหรับออเดอร์ของบริษัทอื่น!",
      whyParagraphs: [
        "ถ้าเราไม่ตรวจ `order.tenant_id == auth.tenant_id` ก่อนหยุดรอ `awaiting_approval` ผู้ใช้จากบริษัท A จะสามารถสแปมสร้างคำขอคืนเงินของออเดอร์บริษัท B ไปรกหน้าจอแอดมินได้ การตรวจสิทธิ์ความเป็นเจ้าของออเดอร์ก่อนเข้าด่าน HITL จึงสำคัญมาก",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Phase 4 Mini-Project กับ B2B SaaS Support Microservice",
      body: [
        "สถาปัตยกรรมที่เราประกอบในวันนี้คือโครงสร้างเดียวกับระบบ AI Customer Support ในแพลตฟอร์ม SaaS สมัยใหม่:",
      ],
      table: [
        ["`AuthContext(tenant_id)`", "Verified JWT Tenant Claim จาก API Gateway"],
        ["`policy_rag` route (Pre-filter + RRF)", "Multi-tenant Search Service พร้อม Inline Citations `[doc#chunk]`"],
        ["`order_lookup` route (MCP)", "Read-Only RPC / Database Service ที่ล็อก `WHERE tenant_id = ?`"],
        ["`refund_hitl` route", "Approval Queue Service (`202 Accepted` รอ Supervisor Approve)"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีสกัดรหัสออเดอร์ `INV-YYYY-NNN` จากประโยคภาษาไทยด้วย Regex",
      body: [
        "ลูกค้ามักพิมพ์รหัสออเดอร์ปนอยู่ในประโยคภาษาไทย เช่น `'ช่วยเช็กออเดอร์ INV-2026-009 ให้หน่อยครับ'`",
        "เราสามารถใช้ `m = re.search(r\"INV-\\d{4}-\\d{3}\", query)` ของ Python ดึงรหัส `m.group(0)` (`\"INV-2026-009\"`) ออกมาส่งให้ MCP Tool ได้อย่างแม่นยำในบรรทัดเดียว!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะประกอบโมดูล `thai_rag_agent.py` ย่อส่วนที่มีคลังเอกสาร 2 บริษัท (`acme_th`, `beta_th`) และฐานข้อมูลออเดอร์จำลอง แล้วรันทดสอบทั้ง 4 เส้นทาง: (1) ถามนโยบายคืนเงิน, (2) เช็กสถานะออเดอร์ตัวเอง vs ข้ามบริษัท, (3) ขอคืนเงินออเดอร์ตัวเอง (หยุดรอ HITL) และ (4) ถามคำถามนอกขอบเขต",
    steps: [
      {
        title: "1 · นิยามโมเดลข้อมูลสำหรับ Corpus, Orders, AuthContext และ AgentResponse",
        explain:
          "แยกประเภท `route` และ `status` ด้วย `Literal` เพื่อให้ตรวจสอบผลลัพธ์ของแต่ละเส้นทางได้อย่างชัดเจน",
        code: {
          language: "python",
          filename: "worked_mini_project.py",
          code: `import re
from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

ORDER_ID_RE = re.compile(r"INV-\\d{4}-\\d{3}")

RouteType = Literal["policy_rag", "order_lookup", "refund_hitl", "out_of_scope"]
AgentStatus = Literal[
    "answered",
    "awaiting_approval",
    "abstain_no_evidence",
    "abstain_out_of_scope",
    "fallback_tool_error",
    "max_steps_reached",
]


class AuthContext(BaseModel):
    model_config = ConfigDict(frozen=True)
    tenant_id: str


class PolicyChunk(BaseModel):
    chunk_id: str
    tenant_id: str
    text: str
    lexical_score: float
    vector_score: float


class OrderRecord(BaseModel):
    order_id: str
    tenant_id: str
    status: str
    amount_thb: int


class AgentResponse(BaseModel):
    route: RouteType
    status: AgentStatus
    answer: str
    citations: list[str] = Field(default_factory=list)
    steps_taken: int = 0`,
        },
      },
      {
        title: "2 · เขียนฟังก์ชัน Pre-Retrieval ACL + Hybrid RRF และ State Machine 4 เส้นทาง",
        explain:
          "กรอง `tenant_id` ก่อนคำนวณ RRF ในสายนโยบาย, ตรวจ `tenant_id` ในสายออเดอร์และสายขอคืนเงิน และจำกัดจำนวนก้าวด้วย `max_steps`",
        code: {
          language: "python",
          filename: "worked_mini_project.py",
          code: `def retrieve_tenant_hybrid_rrf(
    corpus: list[PolicyChunk],
    auth: AuthContext,
    top_k: int = 2,
    rrf_k: int = 60,
) -> list[PolicyChunk]:
    allowed = [c for c in corpus if c.tenant_id == auth.tenant_id]
    if not allowed:
        return []
    lex_order = sorted(allowed, key=lambda c: c.lexical_score, reverse=True)
    vec_order = sorted(allowed, key=lambda c: c.vector_score, reverse=True)
    lex_rank = {c.chunk_id: i + 1 for i, c in enumerate(lex_order)}
    vec_rank = {c.chunk_id: i + 1 for i, c in enumerate(vec_order)}

    scored = sorted(
        allowed,
        key=lambda c: (1.0 / (rrf_k + lex_rank[c.chunk_id]))
        + (1.0 / (rrf_k + vec_rank[c.chunk_id])),
        reverse=True,
    )
    return scored[:top_k]


def run_thai_support_agent(
    query: str,
    auth: AuthContext,
    corpus: list[PolicyChunk],
    order_lookup_fn: Callable[[str, AuthContext], OrderRecord | None],
    max_steps: int = 4,
) -> AgentResponse:
    if max_steps < 2:
        return AgentResponse(
            route="out_of_scope",
            status="max_steps_reached",
            answer="ขออภัย จำนวนก้าวเกินเพดานที่กำหนด",
            steps_taken=max_steps,
        )

    order_match = ORDER_ID_RE.search(query)
    if order_match and "ขอคืนเงิน" in query:
        route: RouteType = "refund_hitl"
    elif order_match:
        route = "order_lookup"
    elif any(k in query for k in ("นโยบาย", "คืนเงิน", "จัดส่ง", "รับประกัน", "SLA")):
        route = "policy_rag"
    else:
        return AgentResponse(
            route="out_of_scope",
            status="abstain_out_of_scope",
            answer="ขออภัย คำถามนี้อยู่นอกขอบเขตบริการลูกค้า",
            steps_taken=2,
        )

    if route in ("order_lookup", "refund_hitl"):
        oid = order_match.group(0) if order_match else ""
        try:
            rec = order_lookup_fn(oid, auth)
        except Exception:
            return AgentResponse(
                route=route,
                status="fallback_tool_error",
                answer="ขออภัย ระบบค้นหาคำสั่งซื้อขัดข้องชั่วคราว",
                steps_taken=2,
            )
        if rec is None or rec.tenant_id != auth.tenant_id:
            return AgentResponse(
                route=route,
                status="abstain_no_evidence",
                answer=f"ไม่พบข้อมูลคำสั่งซื้อ {oid} ในบัญชีของท่าน",
                steps_taken=2,
            )
        if route == "refund_hitl":
            return AgentResponse(
                route="refund_hitl",
                status="awaiting_approval",
                answer=f"คำขอคืนเงินสำหรับ {rec.order_id} ยอด {rec.amount_thb} บาท อยู่ระหว่างรอผู้ดูแลอนุมัติ",
                steps_taken=3,
            )
        return AgentResponse(
            route="order_lookup",
            status="answered",
            answer=f"คำสั่งซื้อ {rec.order_id} สถานะ: {rec.status} ยอด {rec.amount_thb} บาท",
            steps_taken=2,
        )

    # policy_rag route
    top_chunks = retrieve_tenant_hybrid_rrf(corpus, auth, top_k=1)
    if not top_chunks:
        return AgentResponse(
            route="policy_rag",
            status="abstain_no_evidence",
            answer="ไม่พบเอกสารนโยบายที่เกี่ยวข้องในบัญชีของท่าน",
            steps_taken=2,
        )
    best = top_chunks[0]
    return AgentResponse(
        route="policy_rag",
        status="answered",
        answer=f"{best.text} [{best.chunk_id}]",
        citations=[best.chunk_id],
        steps_taken=2,
    )`,
        },
      },
      {
        title: "3 · ทดสอบทั้ง 4 เส้นทางและการกั้นข้อมูลข้าม Tenant",
        explain:
          "รันทดสอบด้วยผู้ใช้ `acme_th` เพื่อดูผลลัพธ์ของทั้งการถามนโยบาย, การเช็กออเดอร์ตัวเอง, การพยายามเช็กออเดอร์ของ `beta_th` และการขอคืนเงิน",
        code: {
          language: "python",
          filename: "worked_mini_project.py",
          code: `corpus = [
    PolicyChunk(chunk_id="beta-pol#c1", tenant_id="beta_th", text="คืนเงิน Beta ใน 60 วัน", lexical_score=0.99, vector_score=0.99),
    PolicyChunk(chunk_id="acme-pol#c1", tenant_id="acme_th", text="คืนเงิน Acme ภายใน 14 วัน", lexical_score=0.85, vector_score=0.88),
]
orders = [
    OrderRecord(order_id="INV-2026-009", tenant_id="acme_th", status="shipped", amount_thb=1490),
    OrderRecord(order_id="INV-2026-021", tenant_id="beta_th", status="paid", amount_thb=3200),
]
auth_acme = AuthContext(tenant_id="acme_th")


def lookup_fn(oid: str, auth: AuthContext) -> OrderRecord | None:
    return next((o for o in orders if o.order_id == oid and o.tenant_id == auth.tenant_id), None)


r_pol = run_thai_support_agent("สอบถามนโยบายคืนเงินครับ", auth_acme, corpus, lookup_fn)
r_ord = run_thai_support_agent("เช็กออเดอร์ INV-2026-009", auth_acme, corpus, lookup_fn)
r_cross = run_thai_support_agent("เช็กออเดอร์ INV-2026-021", auth_acme, corpus, lookup_fn)
r_ref = run_thai_support_agent("ขอคืนเงินออเดอร์ INV-2026-009", auth_acme, corpus, lookup_fn)

print("1. Policy RAG:", r_pol.status, r_pol.citations, "->", r_pol.answer)
print("2. Own Order:", r_ord.status, "->", r_ord.answer)
print("3. Cross-Tenant Order:", r_cross.status, "->", r_cross.answer)
print("4. Refund HITL:", r_ref.status, "->", r_ref.answer)`,
        },
        output: `1. Policy RAG: answered ['acme-pol#c1'] -> คืนเงิน Acme ภายใน 14 วัน [acme-pol#c1]
2. Own Order: answered -> คำสั่งซื้อ INV-2026-009 สถานะ: shipped ยอด 1490 บาท
3. Cross-Tenant Order: abstain_no_evidence -> ไม่พบข้อมูลคำสั่งซื้อ INV-2026-021 ในบัญชีของท่าน
4. Refund HITL: awaiting_approval -> คำขอคืนเงินสำหรับ INV-2026-009 ยอด 1490 บาท อยู่ระหว่างรอผู้ดูแลอนุมัติ`,
      },
    ],
    gotcha:
      "สังเกตใน `r_cross`: เมื่อผู้ใช้ `acme_th` พยายามถามถึง `INV-2026-021` ซึ่งเป็นของ `beta_th` ระบบคืน `abstain_no_evidence` โดยไม่หลุดข้อมูลเลยว่าออเดอร์นั้นมียอด 3,200 บาทหรือสถานะ `paid`!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `thai_rag_agent.py` ที่รวม Pre-Retrieval Tenant ACL + Hybrid RRF, MCP Order Lookup และ Guarded State Machine 4 เส้นทาง พร้อมเขียนชุดทดสอบ `test_thai_rag_agent.py`",
    requirements: [
      "เขียน `retrieve_tenant_hybrid_rrf(corpus, auth, top_k=2, rrf_k=60) -> list[PolicyChunk]` ที่กรองเฉพาะเอกสารของ `auth.tenant_id` ก่อนจัดอันดับทั้ง `lexical_score` และ `vector_score` แล้วรวมด้วย RRF",
      "เขียน `run_thai_support_agent(query, auth, corpus, order_lookup_fn, max_steps=4) -> AgentResponse` ที่แยก 4 เส้นทาง: `refund_hitl` (เมื่อมีรหัส `INV-YYYY-NNN` และคำว่า `'ขอคืนเงิน'`), `order_lookup` (เมื่อมีรหัส `INV-YYYY-NNN`), `policy_rag` (เมื่อมีคำสำคัญเรื่องนโยบาย/คืนเงิน/จัดส่ง/รับประกัน/SLA) และ `out_of_scope`",
      "ในสาย `order_lookup` และ `refund_hitl` ต้องตรวจว่าผลลัพธ์จาก `order_lookup_fn(oid, auth)` มีอยู่จริงและ `rec.tenant_id == auth.tenant_id` หากไม่พบหรือข้าม tenant ให้คืน `status=\"abstain_no_evidence\"` และหาก `order_lookup_fn` โยน Exception ให้คืน `status=\"fallback_tool_error\"`",
      "ในสาย `refund_hitl` เมื่อพบออเดอร์ของ tenant ตัวเอง ให้หยุดรอการอนุมัติด้วย `status=\"awaiting_approval\"` และหาก `max_steps < 2` ให้คืน `status=\"max_steps_reached\"` ทันที",
      "เขียน `test_thai_rag_agent.py` ทดสอบครบทั้งเส้นทางปกติ, การกั้นข้อมูลข้าม tenant ทั้งใน RAG และ Order Lookup, กรณี MCP tool ล้มเหลว, การหยุดรอ HITL ก่อนคืนเงิน และกรณีคำถามนอกขอบเขต",
    ],
    starter: {
      language: "python",
      filename: "thai_rag_agent.py",
      code: `import re
from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

ORDER_ID_RE = re.compile(r"INV-\\d{4}-\\d{3}")

RouteType = Literal["policy_rag", "order_lookup", "refund_hitl", "out_of_scope"]
AgentStatus = Literal[
    "answered",
    "awaiting_approval",
    "abstain_no_evidence",
    "abstain_out_of_scope",
    "fallback_tool_error",
    "max_steps_reached",
]


class AuthContext(BaseModel):
    model_config = ConfigDict(frozen=True)
    tenant_id: str


class PolicyChunk(BaseModel):
    chunk_id: str
    tenant_id: str
    text: str
    lexical_score: float
    vector_score: float


class OrderRecord(BaseModel):
    order_id: str
    tenant_id: str
    status: str
    amount_thb: int


class AgentResponse(BaseModel):
    route: RouteType
    status: AgentStatus
    answer: str
    citations: list[str] = Field(default_factory=list)
    steps_taken: int = 0


def retrieve_tenant_hybrid_rrf(
    corpus: list[PolicyChunk],
    auth: AuthContext,
    top_k: int = 2,
    rrf_k: int = 60,
) -> list[PolicyChunk]:
    """กรองเอกสารตาม auth.tenant_id ก่อนค้นทั้ง lexical และ vector แล้วรวมอันดับด้วย RRF"""
    # TODO: implement Pre-Retrieval Tenant Filter + Hybrid RRF
    raise NotImplementedError


def run_thai_support_agent(
    query: str,
    auth: AuthContext,
    corpus: list[PolicyChunk],
    order_lookup_fn: Callable[[str, AuthContext], OrderRecord | None],
    max_steps: int = 4,
) -> AgentResponse:
    """รัน State Machine 4 เส้นทาง: policy_rag, order_lookup, refund_hitl และ out_of_scope"""
    # TODO: implement 4-route guarded agent
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`retrieve_tenant_hybrid_rrf` คืนเฉพาะ chunks ของ `auth.tenant_id` เสมอ แม้เอกสารของ tenant อื่นจะมีคะแนน `0.99` ใช่หรือไม่?",
      "เมื่อผู้ใช้ของ `acme_th` พิมพ์ `'ขอคืนเงินออเดอร์ INV-2026-021'` (ซึ่งเป็นออเดอร์ของ `beta_th`) ระบบคืน `abstain_no_evidence` แทนการสร้างตั๋ว `awaiting_approval` ใช่หรือไม่?",
      "เมื่อ `order_lookup_fn` โยน `RuntimeError` ระบบคืน `status=\"fallback_tool_error\"` โดยไม่แครชใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทุกกรณี (hybrid RRF with tenant filter, order lookup, cross-tenant block on RAG/order/refund, tool failure fallback, HITL approval pause, out-of-scope abstention) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ตรวจเงื่อนไข `if order_match and \"ขอคืนเงิน\" in query:` ก่อน `elif order_match:` เสมอ เพื่อให้ประโยคที่มีทั้งคำว่า `'ขอคืนเงิน'` และรหัสออเดอร์ถูกส่งเข้าสาย `refund_hitl`",
      },
      {
        body: "ในสาย `policy_rag` อย่าลืมใส่ป้าย `[{best.chunk_id}]` ท้ายข้อความ `answer` และใส่ `[best.chunk_id]` ในลิสต์ `citations`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_thai_rag_agent.py`:",
        code: {
          language: "python",
          filename: "test_thai_rag_agent.py",
          code: `from thai_rag_agent import (
    AuthContext,
    OrderRecord,
    PolicyChunk,
    retrieve_tenant_hybrid_rrf,
    run_thai_support_agent,
)

CORPUS = [
    PolicyChunk(
        chunk_id="beta-pol#c1",
        tenant_id="beta_th",
        text="คืนเงินภายใน 60 วัน",
        lexical_score=0.99,
        vector_score=0.99,
    ),
    PolicyChunk(
        chunk_id="acme-pol#c1",
        tenant_id="acme_th",
        text="คืนเงินภายใน 14 วันทำการ",
        lexical_score=0.88,
        vector_score=0.82,
    ),
]
ORDERS = [
    OrderRecord(order_id="INV-2026-009", tenant_id="acme_th", status="shipped", amount_thb=1490),
    OrderRecord(order_id="INV-2026-021", tenant_id="beta_th", status="paid", amount_thb=3200),
]
AUTH_ACME = AuthContext(tenant_id="acme_th")


def mock_lookup(oid: str, auth: AuthContext) -> OrderRecord | None:
    return next((o for o in ORDERS if o.order_id == oid and o.tenant_id == auth.tenant_id), None)


def test_policy_rag_filters_tenant_and_cites_chunk() -> None:
    chunks = retrieve_tenant_hybrid_rrf(CORPUS, AUTH_ACME, top_k=2)
    assert [c.chunk_id for c in chunks] == ["acme-pol#c1"]

    res = run_thai_support_agent("สอบถามนโยบายคืนเงินครับ", AUTH_ACME, CORPUS, mock_lookup)
    assert res.route == "policy_rag"
    assert res.status == "answered"
    assert res.citations == ["acme-pol#c1"]
    assert "[acme-pol#c1]" in res.answer


def test_order_lookup_and_cross_tenant_isolation() -> None:
    own = run_thai_support_agent("เช็กสถานะ INV-2026-009", AUTH_ACME, CORPUS, mock_lookup)
    assert own.route == "order_lookup" and own.status == "answered"
    assert "shipped" in own.answer

    cross = run_thai_support_agent("เช็กสถานะ INV-2026-021", AUTH_ACME, CORPUS, mock_lookup)
    assert cross.status == "abstain_no_evidence"
    assert "3200" not in cross.answer


def test_refund_hitl_pauses_for_own_order_and_blocks_cross_tenant() -> None:
    own_refund = run_thai_support_agent("ขอคืนเงินออเดอร์ INV-2026-009", AUTH_ACME, CORPUS, mock_lookup)
    assert own_refund.route == "refund_hitl"
    assert own_refund.status == "awaiting_approval"

    cross_refund = run_thai_support_agent("ขอคืนเงินออเดอร์ INV-2026-021", AUTH_ACME, CORPUS, mock_lookup)
    assert cross_refund.status == "abstain_no_evidence"


def test_tool_failure_fallback_out_of_scope_and_max_steps() -> None:
    def failing_lookup(oid: str, auth: AuthContext) -> OrderRecord | None:
        raise RuntimeError("MCP server timeout")

    err = run_thai_support_agent("เช็กสถานะ INV-2026-009", AUTH_ACME, CORPUS, failing_lookup)
    assert err.status == "fallback_tool_error"

    oos = run_thai_support_agent("แนะนำร้านอาหารอร่อยหน่อย", AUTH_ACME, CORPUS, mock_lookup)
    assert oos.route == "out_of_scope" and oos.status == "abstain_out_of_scope"

    maxed = run_thai_support_agent("สอบถามนโยบาย", AUTH_ACME, CORPUS, mock_lookup, max_steps=1)
    assert maxed.status == "max_steps_reached"`,
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
      title: "ตรวจเงื่อนไข `if order_match:` ก่อน `if order_match and \"ขอคืนเงิน\" in query:`",
      symptom:
        "คำขอคืนเงินที่มีรหัสออเดอร์ถูกส่งเข้าสาย `order_lookup` ธรรมดาแทนที่จะเข้าด่าน `refund_hitl`",
      fix: "วางเงื่อนไขที่เฉพาะเจาะจงกว่า (`order_match and \"ขอคืนเงิน\" in query`) ไว้ก่อนเสมอ",
    },
    {
      title: "ส่งแค่ `order_id` เข้าฟังก์ชันค้นหาออเดอร์โดยไม่ตรวจ `rec.tenant_id == auth.tenant_id`",
      symptom:
        "ลูกค้าของบริษัท A สามารถพิมพ์รหัสออเดอร์ของบริษัท B เพื่อดูสถานะและยอดเงิน หรือสั่งสร้างตั๋วขอคืนเงินข้ามบริษัทได้",
      fix: "บังคับตรวจ `rec.tenant_id == auth.tenant_id` ทั้งในการค้นหาออเดอร์และก่อนเข้าด่าน `awaiting_approval` เสมอ",
    },
    {
      title: "คำนวณอันดับ RRF บนเอกสารทุกบริษัทรวมกันก่อนแล้วค่อยกรอง `tenant_id` ทีหลัง",
      symptom:
        "เกิดทั้งความเสี่ยงข้อมูลรั่วข้ามบริษัทและปัญหา Recall Starvation สำหรับผู้เช่ารายย่อย",
      fix: "กรอง `allowed = [c for c in corpus if c.tenant_id == auth.tenant_id]` เป็นบรรทัดแรกก่อนจัดอันดับ Lexical และ Vector เสมอ",
    },
    {
      title: "ปล่อยให้ Exception จาก `order_lookup_fn` ทะลุออกจาก Agent โดยไม่มี `fallback_tool_error`",
      symptom:
        "เมื่อ MCP Server ขัดข้องชั่วคราว ระบบล่มทั้งคำขอแทนที่จะตอบข้อความ Fallback ที่ปลอดภัย",
      fix: "ดัก `try/except` รอบการเรียกเครื่องมือและคืน `status=\"fallback_tool_error\"` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d121-q1",
        "ในระบบบูรณาการ Phase 4 เมื่อผู้ใช้ส่งข้อความว่า `'ขอคืนเงินออเดอร์ INV-2026-009'` เหตุใดระบบจึงต้องตรวจความเป็นเจ้าของออเดอร์ (`rec.tenant_id == auth.tenant_id`) ก่อนเปลี่ยนสถานะเป็น `awaiting_approval`?",
        [
          ["เพื่อป้องกันไม่ให้ผู้ใช้จากบริษัทอื่นสั่งสร้างคำขอรออนุมัติคืนเงินสำหรับออเดอร์ของบริษัทที่ไม่ใช่ของตัวเอง", "ถูกต้อง — ต้องยืนยันทั้งว่าออเดอร์มีอยู่จริงและเป็นของ `auth.tenant_id` นั้นก่อนส่งเข้าคิว HITL เสมอ"],
          ["เพื่อโอนเงินคืนให้ทันทีโดยไม่ต้องรอคนอนุมัติ", "ผิด — สาย `refund_hitl` ต้องหยุดรออนุมัติ"],
          ["เพื่อลบข้อมูลออเดอร์ออกจากฐานข้อมูล", "ไม่ได้ลบข้อมูลออเดอร์"],
          ["เพื่อเปลี่ยน `tenant_id` ของผู้ใช้เป็นบริษัทอื่น", "ห้ามเปลี่ยน `tenant_id`"],
        ],
        "A",
        "การตรวจสิทธิ์ `tenant_id` ต้องทำก่อนทุกการกระทำ ไม่ว่าจะเป็นการแสดงข้อมูลหรือการสร้างคำขอรออนุมัติ",
        "ทำไมต้องตรวจ `rec.tenant_id == auth.tenant_id` ก่อนหยุดรอ `awaiting_approval` ในสายคืนเงิน?",
        "เพื่อป้องกันไม่ให้ผู้ใช้สร้างคำขอคืนเงินสำหรับออเดอร์ของบริษัทอื่นและป้องกันการเปิดเผยยอดเงินข้ามบริษัท",
      ),
      mc(
        "d121-q2",
        "ในฟังก์ชัน `retrieve_tenant_hybrid_rrf` การกรอง `auth.tenant_id` ต้องทำที่ขั้นตอนใด?",
        [
          ["ทำหลังจากรวมคะแนน RRF และตัด Top-K เสร็จแล้ว", "ผิด — เสี่ยงเกิด Recall Starvation และข้อมูลรั่ว"],
          ["ทำเป็นขั้นตอนแรกสุด (Pre-Retrieval) ก่อนจัดอันดับทั้งฝั่ง Lexical และฝั่ง Vector เพื่อคำนวณ RRF เฉพาะบนเอกสารของ Tenant นั้น", "ถูกต้อง — รับประกันทั้ง Zero Cross-Tenant Leakage และไม่เกิด Recall Starvation"],
          ["ไม่ต้องกรองในโค้ด ให้เขียนบอกใน System Prompt แทน", "ไม่ปลอดภัย — ข้อมูลรั่วเข้า Context ไปแล้ว"],
          ["กรองเฉพาะฝั่ง Vector แต่ไม่ต้องกรองฝั่ง Lexical", "ผิด — ข้อมูลจะรั่วผ่านฝั่ง Lexical"],
        ],
        "B",
        "Pre-Retrieval Tenant Filtering ก่อนจัดอันดับทั้งสองขาของ Hybrid RRF คือมาตรฐานที่ปลอดภัยและแม่นยำที่สุด",
        "ควรกรอง `tenant_id` ตอนไหนในการคำนวณ Hybrid RRF?",
        "กรองตั้งแต่ต้นทาง (Pre-Retrieval) ก่อนนำเอกสารไปจัดอันดับ Lexical และ Vector",
      ),
      mc(
        "d121-q3",
        "เมื่อโหนดเรียก MCP Tool `order_lookup_fn` เกิดข้อผิดพลาด (เช่น โยน `RuntimeError` เพราะฐานข้อมูลล่ม) พฤติกรรมที่ถูกต้องของ Guarded Agent คือข้อใด?",
        [
          ["แต่งสถานะออเดอร์ขึ้นมาเองว่า 'จัดส่งสำเร็จแล้ว' เพื่อให้ลูกค้าสบายใจ", "อันตราย — นั่นคือ Hallucination ที่สร้างความเสียหายจริง"],
          ["จับ Exception แล้วเปลี่ยนสถานะเป็น `fallback_tool_error` พร้อมคืนข้อความแจ้งเหตุขัดข้องชั่วคราวอย่างสุภาพโดยไม่เปิดเผย Stack Trace", "ถูกต้อง — Graceful Fallback ป้องกันทั้งระบบล่มและการให้ข้อมูลเท็จ"],
          ["วนลูปเรียก `order_lookup_fn` ซ้ำอีก 1,000 รอบโดยไม่หยุด", "ทำให้เกิด Retry Storm"],
          ["ดึงออเดอร์ของบริษัทอื่นมาแสดงแทน", "ละเมิด ACL ร้ายแรง"],
        ],
        "B",
        "เมื่อเครื่องมือภายนอกล้มเหลว ระบบต้อง Fail-Closed เข้าโหนด Fallback อย่างสุภาพเสมอ",
        "เมื่อ MCP Order Lookup โยน Exception ระบบควรทำอย่างไร?",
        "จับ Exception แล้วคืนสถานะ `fallback_tool_error` พร้อมข้อความแจ้งผู้ใช้ที่ปลอดภัย",
      ),
      mc(
        "d121-q4",
        "เหตุใดในตัวคัดแยกเส้นทาง (`route_intent`) เราจึงต้องเช็กเงื่อนไข `order_match and \"ขอคืนเงิน\" in query` ก่อนเงื่อนไข `order_match` เฉย ๆ?",
        [
          ["เพราะคำขอคืนเงินส่วนใหญ่มีรหัสออเดอร์ `INV-YYYY-NNN` อยู่ด้วย หากเช็ก `order_match` เฉย ๆ ก่อน คำขอคืนเงินจะหลุดเข้าสาย `order_lookup` ธรรมดาแทนที่จะเข้าด่าน `refund_hitl`", "ถูกต้อง — ในการเขียน Rule/Intent Router ต้องเรียงเงื่อนไขที่เฉพาะเจาะจงกว่า (More Specific) ไว้ก่อนเสมอ"],
          ["เพราะ Python บังคับให้เรียงตามความยาวตัวอักษร", "Python ไม่ได้บังคับ"],
          ["เพื่อให้ไม่ต้องใช้ Regex", "ทั้งสองเงื่อนไขใช้ผลจาก Regex `order_match`"],
          ["เพื่อให้รันช้าลง", "ไม่เกี่ยวกับความเร็ว"],
        ],
        "A",
        "การจัดลำดับ Specificity ใน Router (ตรวจเคสที่มีทั้งรหัสออเดอร์ + คำขอคืนเงิน ก่อนเคสที่มีแต่รหัสออเดอร์) ป้องกันการเลี้ยวผิดสาย",
        "ทำไมต้องตรวจเงื่อนไข `refund_hitl` ก่อน `order_lookup`?",
        "เพราะคำขอคืนเงินก็มีรหัสออเดอร์ด้วย จึงต้องตรวจเงื่อนไขที่เจาะจงกว่าก่อนเพื่อไม่ให้หลุดเข้าสายเช็กสถานะธรรมดา",
      ),
    ],
  },

  takeaways: [
    "**Phase 4 Mini-Project Architecture** ผสาน 3 เสาหลักเข้าด้วยกัน: **Thai Hybrid RAG + Pre-Retrieval ACL**, **Tenant-Scoped MCP Lookup** และ **4-Route Guarded State Machine + HITL**",
    "**Zero Cross-Tenant Leakage**: ไม่ว่าจะเป็นการค้นนโยบาย การเช็กออเดอร์ หรือการขอคืนเงิน ต้องผูกกับ `auth.tenant_id` จากเซิร์ฟเวอร์เสมอ",
    "**Graceful Fallback**: เมื่อเครื่องมือล้มเหลว (`fallback_tool_error`) หรือคำถามนอกขอบเขต (`abstain_out_of_scope`) ระบบต้องจบการทำงานอย่างปลอดภัยภายใน `max_steps`",
    "พรุ่งนี้ (Day 122) เราจะเพิ่มความแข็งแกร่งให้ระบบนี้ด้วย **Citation Verification Gate & Bounded Repair** ก่อนส่งคำตอบถึงมือลูกค้า!",
  ],

  reviewCards: [
    rc(
      "d121-rc1",
      "4 เส้นทาง (Routes) ของ State Machine ใน Phase 4 Mini-Project มีอะไรบ้าง?",
      "1) `policy_rag` (ค้นนโยบายด้วย Hybrid RRF), 2) `order_lookup` (เช็กสถานะออเดอร์ผ่าน MCP), 3) `refund_hitl` (หยุดรอคนอนุมัติก่อนคืนเงิน), 4) `out_of_scope` (ปฏิเสธคำถามนอกขอบเขต)",
    ),
    rc(
      "d121-rc2",
      "เมื่อลูกค้าของบริษัท A พิมพ์รหัสออเดอร์ของบริษัท B เข้ามา ระบบควรตอบอย่างไร และทำไมห้ามบอกว่า 'ออเดอร์นี้เป็นของบริษัท B'?",
      "ควรตอบว่าไม่พบข้อมูลคำสั่งซื้อนั้นในบัญชีของท่าน (`abstain_no_evidence`) เพราะการบอกว่าเป็นของบริษัท B ถือเป็นการรั่วไหลของข้อมูลข้ามบริษัท (Enumeration Leak)",
    ),
    rc(
      "d121-rc3",
      "ในสาย `refund_hitl` ทำไมต้องเรียก `order_lookup_fn(oid, auth)` ก่อนหยุดที่ `awaiting_approval`?",
      "เพื่อยืนยันว่ามีคำสั่งซื้อนั้นอยู่จริงและเป็นของ `auth.tenant_id` นั้นจริง ก่อนจะสร้างรายการรออนุมัติคืนเงิน",
    ),
    rc(
      "d121-rc4",
      "สูตรการรวมคะแนน RRF จากอันดับ Lexical (`lex_rank`) และอันดับ Vector (`vec_rank`) คืออะไร?",
      "$\\text{RRF}(d) = \\frac{1}{k + \\text{lex\\_rank}(d)} + \\frac{1}{k + \\text{vec\\_rank}(d)}$ โดยปกติใช้ $k = 60$",
    ),
  ],

  sources: [
    {
      label: "LangGraph Documentation — StateGraph & Conditional Routing",
      href: "https://docs.langchain.com/oss/python/langgraph/overview",
    },
    {
      label: "Model Context Protocol (MCP) — Architecture & Security Principles",
      href: "https://modelcontextprotocol.io/specification/2025-06-18/basic",
    },
    {
      label: "Anthropic Research — Building Effective Agents",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
  ],

  glossary: ["rag", "rrf", "mcp", "langgraph", "acl", "guardrails"],
});
