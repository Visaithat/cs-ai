import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D166 — Phase 6 / Block B42
 * Build MCP Server for Mock Order/Ticket Lookup (Read-only + Safe Write Gate)
 */
export const d166: Lesson = defineLesson({
  day: 166,
  titleTh: "สร้าง MCP Server สำหรับค้นหา Order/Ticket (Read-Only + Safe Write Gate)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · แยก Read-Only SQLite Lookup ออกจาก Write Tool ที่บังคับ Approval + Idempotency Key",
  icon: "plug",
  visual: {
    id: "capstone-core-router",
    title: "เส้นทางที่ 2 และ 3 — MCP Server: Read-Only Lookup vs Guarded Write Gate",
    caption: "ดูความต่างระหว่าง MCP Read-Only Tool (เช็กออเดอร์/ทิกเก็ตพร้อม PDPA masking) กับ Write Gate ที่สร้าง Draft รออนุมัติก่อนลง SQLite",
    alt: "แผนภาพ MCP Server ของระบบ Capstone ที่แยก Read-only Lookup ออกจาก Write Tool ที่มี Safe Write Gate",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ด้วย SQLite ในเครื่องและ Pydantic v2 (ลงทะเบียนเข้า FastMCP stdio server ได้ทันที)",
  tools: ["MCP Python SDK", "SQLite", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "แยกคำถาม 'ข้อมูลสดในระบบ' ออกจาก 'เอกสารนโยบาย'",
      body: "Hybrid {{rag}} ตอบได้ดีว่านโยบายคืนเงินคือกี่วัน แต่ตอบไม่ได้ว่า *\"ใบสั่งซื้อ ORD-2026-104 ของลูกค้าคนนี้จัดส่งถึงไหนแล้ว\"* เพราะข้อมูลนั้นเปลี่ยนตลอดเวลาอยู่ในฐานข้อมูลธุรกรรม",
      lessonNote: "วันนี้เราสร้าง {{mcp}} Server ที่เชื่อมต่อฐานข้อมูลจำลอง ({{sqlite}}) สำหรับค้นหาออเดอร์และทิกเก็ตแบบเรียลไทม์",
    },
    {
      node: 2,
      heading: "เปิดเฉพาะ Tool Schema ที่ปลอดภัยให้ LLM เรียกใช้งาน",
      body: "ตามหลัก Least Privilege (OWASP LLM06 Excessive Agency) เราต้องไม่เปิดประตูฐานข้อมูลให้โมเดลเขียน SQL อิสระ แต่เปิดผ่าน {{tool-calling}} ที่มี {{schema}} แน่นหนา",
      lessonNote: "ทุก tool รับอินพุตผ่าน {{pydantic}} (เช่น รูปแบบ `ORD-2026-104`) และคืนผลลัพธ์ที่ปิดบังข้อมูลส่วนบุคคลตาม {{pdpa}} แล้ว",
    },
    {
      node: 4,
      heading: "สร้าง Safe Write Gate แบบ Two-Phase สำหรับการเปิดทิกเก็ต",
      body: "หากปล่อยให้ {{llm}} สั่ง `INSERT` หรือ `UPDATE` ฐานข้อมูลทันทีเมื่อเข้าใจผิดหรือโดน {{prompt-injection}} ความเสียหายจะเกิดขึ้นจริงทันที",
      lessonNote: "Write Tool (`create_support_ticket`) จะสร้าง **Pending Draft** ก่อนเสมอ และบันทึกลง SQLite ได้ต่อเมื่อมี `approval_token` จาก {{hitl}} พร้อม {{idempotency}} key เท่านั้น",
    },
    {
      node: 5,
      heading: "บันทึก Audit & ป้องกันการสร้างทิกเก็ตซ้ำเมื่อ Retry",
      body: "ในระบบ Production การเรียก tool อาจเกิด timeout และถูก retry ซ้ำได้ หากไม่มีตัวกันซ้ำ ลูกค้าจะได้ทิกเก็ตเคลมเบิ้ล 2–3 ใบ",
      lessonNote: "เราใช้คอลัมน์ `UNIQUE(idempotency_key)` ใน SQLite เพื่อให้เรียกซ้ำด้วย key เดิมกี่ครั้งก็ได้ทิกเก็ตใบเดิมเสมอ",
    },
  ],

  objectives: [
    "**ออกแบบ {{mcp}} Server** ที่แยก Read-Only Tools (`lookup_order`, `get_ticket`) และ {{mcp-resource}} ออกจาก Write Tools ตามหลัก Least Privilege",
    "**ป้องกันการรั่วไหลและข้อมูลผิดรูป** ด้วย {{pydantic}} Input Validation และการปิดบังเบอร์โทร/อีเมลตาม {{pdpa}} ในผลลัพธ์ของ tool ก่อนส่งกลับเข้า LLM context",
    "**สร้าง Safe Write Gate แบบ Two-Phase** ที่คืน `pending_approval` เมื่อยังไม่อนุมัติ และบันทึกแบบ {{idempotency}} ลง {{sqlite}} เมื่อได้รับยืนยันจากมนุษย์",
  ],

  prerequisites: [
    "เข้าใจแนวคิด MCP Server/Client และ Safe Tool Bridge จาก Phase 4 (แนะนำ Day 113–115)",
    "ใช้งาน `sqlite3` พื้นฐานใน Python และ {{pydantic}} `BaseModel` ได้",
    "เข้าใจหลัก Least Privilege และ OWASP LLM06 (Excessive Agency) จาก Phase 5",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "เตรียมโฟลเดอร์ Capstone เพื่อสร้าง `src/mcp_support_server.py` ที่ใช้ `sqlite3` (built-in) และ `pydantic` โดยสามารถห่อเป็น MCP server ด้วยแพ็กเกจ `mcp` ได้ทันที",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv add pydantic mcp
uv add --dev pytest ruff
uv run python -c "import sqlite3, pydantic; print('ready')"`,
    steps: [
      ["deps", "ติดตั้ง `pydantic` และ `mcp` ในโปรเจกต์ `thai-enterprise-assistant/`"],
      ["sqlite", "ตรวจว่า Python `sqlite3` พร้อมใช้งานสำหรับฐานข้อมูลจำลองแบบ in-memory / file"],
      ["ready", "พร้อมสร้าง Read-only Lookup Tools และ Two-Phase Write Gate"],
    ],
    note: "โค้ดหลักของ Tool Handlers แยกเป็น Pure Python + SQLite ที่ทดสอบได้เร็วใน `pytest` (ไม่ค้างรอ stdio transport) แล้วค่อยติด decorator `@mcp.tool()` ของ `FastMCP` ครอบไว้ที่ชั้นนอกสุด",
  },

  concepts: [
    {
      id: "mcp-tools-vs-resources",
      title: "1 · แยก MCP Read-Only Tools, Resources และ PDPA Masking",
      paragraphs: [
        "ในโปรโตคอล {{mcp|Model Context Protocol (MCP)}} เราแยกความสามารถของ Server ออกเป็น **Tools** (ฟังก์ชันที่โมเดลสั่งเรียกพร้อมพารามิเตอร์ เช่น `lookup_order(order_id)`) และ **{{mcp-resource|Resources}}** (ข้อมูลอ้างอิงแบบอ่านอย่างเดียวผ่าน URI เช่น `support://sla-hours` ที่โหลดเข้า context ได้โดยไม่ต้องรันตรรกะ)",
        "สำหรับระบบ Capstone ของเรา ฝั่ง Read-Only Lookup (`lookup_order`, `get_ticket`) ต้อง **ห้ามรับ SQL query ดิบจาก LLM เด็ดขาด** ให้รับเฉพาะตัวระบุที่ผ่าน {{pydantic}} {{validation}} แล้ว (เช่น `ORD-\\d{4}-\\d{3,}` หรือ `TKT-\\d{4}-\\d{3,}`) และใช้ Parameterized SQL (`WHERE order_id = ?`) เพื่อกัน SQL Injection 100%",
        "ข้อสำคัญสำหรับองค์กรไทย: ข้อมูลลูกค้าในฐานข้อมูลมักมีเบอร์โทร (`0812345678`) หรืออีเมลเต็ม หาก tool คืนค่าดิบกลับไป ค่าเหล่านั้นจะถูกส่งต่อเข้า {{llm}} context และอาจหลุดไปใน log — จึงต้องทำ **{{pdpa}} Masking** (เช่น `081-xxx-5678`) ตั้งแต่ในชั้น MCP Server ก่อนส่งออก",
      ],
      analogy:
        "เหมือนเคาน์เตอร์สอบถามข้อมูลของธนาคาร: พนักงาน (MCP Server) รับเลขที่ใบเสร็จไปค้นในระบบให้คุณ แล้วบอกเฉพาะสถานะและเบอร์โทรที่ปิดบังเลขกลาง (`081-xxx-5678`) โดยไม่ยื่นคีย์บอร์ดฐานข้อมูลให้ลูกค้าพิมพ์คำสั่ง SQL เอง",
      code: {
        language: "python",
        filename: "mcp_readonly_surface.py",
        code: `# โครงสร้างการลงทะเบียน Tool และ Resource บน FastMCP
# @mcp.tool()
def lookup_order_tool(conn, order_id: str) -> dict:
    row = conn.execute(
        "SELECT order_id, status, phone FROM orders WHERE order_id = ?",
        (order_id,),  # Parameterized SQL กัน SQL Injection 100%
    ).fetchone()
    if row is None:
        return {"ok": False, "error_code": "not_found"}
    return {"ok": True, "order_id": row["order_id"], "status": row["status"], "phone": f"{row['phone'][:3]}-xxx-{row['phone'][-4:]}"}


# @mcp.resource("support://sla")
def get_support_sla_resource() -> str:
    return "เวลาทำการฝ่ายซัพพอร์ต: จันทร์-ศุกร์ 09:00-18:00 น. (SLA ตอบกลับทิกเก็ต <= 4 ชม.)"`,
        caption: "แยก MCP Tool (รับพารามิเตอร์ค้นข้อมูลพร้อม Parameterized SQL + PDPA Masking) ออกจาก MCP Resource (ข้อมูลอ้างอิงอ่านอย่างเดียว)",
      },
      bullets: [
        "**Parameterized Query เสมอ**: ห้ามต่อสตริง SQL (`f\"SELECT ... '{order_id}'\"`) ใช้ placeholder `?` ของ `sqlite3` เสมอ",
        "**PII Minimization ({{pdpa}})**: ส่งคืนเฉพาะฟิลด์ที่จำเป็นต่อการตอบคำถาม (สถานะ, ยอดรวม, วันที่จัดส่ง, เบอร์โทรแบบ masked)",
        "**Structured Not-Found**: เมื่อไม่พบรหัสออเดอร์ ให้คืน `ok=False, error_code=\"not_found\"` แทนการโยน exception ดิบ",
      ],
      whyTitle: "Why this matters — ป้องกันทั้ง SQL Injection และ PII Leak ในจุดเดียว",
      whyParagraphs: [
        "บ่อยครั้งที่เราติด {{pdpa}} Masking ที่ฝั่ง FastAPI ขาเข้าเท่านั้น แต่ลืมไปว่า **ผลลัพธ์จาก Database Tool ขากลับ** ก็มี PII ของลูกค้าอยู่เต็มไปหมดแล้วกำลังจะถูกส่งไปให้ external LLM",
        "การ mask ข้อมูลตั้งแต่ชั้น MCP Server ทำให้มั่นใจว่าไม่ว่า Agent ตัวไหนจะเรียก tool นี้ ก็ไม่มีข้อมูลดิบหลุดออกไปแน่นอน",
      ],
    },
    {
      id: "read-only-vs-safe-write-gate",
      title: "2 · Safe Write Gate แบบ Two-Phase (Draft Preview → HITL Approval)",
      paragraphs: [
        "ภัยคุกคามอันดับต้น ๆ ของ Agent คือ **OWASP LLM06: Excessive Agency** — การที่ระบบอนุญาตให้โมเดลแก้ไขข้อมูลจริงโดยไม่มีด่านกั้น เช่น ลูกค้าบ่นในแชตหรือเอกสารแอบฝัง {{prompt-injection}} แล้วโมเดลเผลอสั่งเปิดทิกเก็ตเคลมหรือคืนเงินซ้ำซ้อน",
        "เราจึงสร้าง **Safe Write Gate แบบ 2 ระยะ (Two-Phase Write Gate)** ให้กับเครื่องมือเขียนข้อมูลอย่าง `create_support_ticket`: **ระยะที่ 1 (Propose / Dry-Run)** เมื่อถูกเรียกโดยไม่มี `approval_token` ที่ถูกต้อง Tool จะ **ไม่แตะคำสั่ง `INSERT` เลย** แต่จะสร้างออบเจกต์ Draft ที่มีรายละเอียดคำร้องพร้อมสถานะ `pending_approval` ส่งกลับไปให้ {{langgraph}} หยุดรอ {{hitl|Human-in-the-Loop}}",
        "**ระยะที่ 2 (Commit)** เกิดขึ้นต่อเมื่อเจ้าหน้าที่หรือผู้ใช้กดยืนยันแล้ว ระบบส่ง `approved=True` คู่กับ `approval_token` ที่ฝั่งแอปออกให้ (ซึ่งโมเดลปลอมเองไม่ได้) กลับมาที่ Tool จึงจะอนุญาตให้เขียนลง {{sqlite}} จริง",
      ],
      analogy:
        "เหมือนการทำรายการโอนเงินหรือเบิกงบในบริษัท: พนักงานช่วยพิมพ์ใบเบิก (Draft Preview) ได้ทันที แต่จะตัดเงินจริงได้ต้องมีลายเซ็นอนุมัติของหัวหน้า (Approval Token) แนบมาก่อน",
      code: {
        language: "python",
        filename: "safe_write_gate.py",
        code: `from typing import Literal
from pydantic import BaseModel, Field


class WriteGateResult(BaseModel):
    status: Literal["pending_approval", "committed", "rejected"]
    ticket_id: str | None = None
    draft_summary: str
    requires_human_approval: bool


def guarded_create_ticket(
    order_id: str,
    reason: str,
    *,
    approved: bool = False,
    approval_token: str | None = None,
    expected_token: str = "HITL-OK",
) -> WriteGateResult:
    summary = f"เปิดทิกเก็ตสำหรับ {order_id}: {reason}"
    if not approved or approval_token != expected_token:
        return WriteGateResult(
            status="pending_approval",
            draft_summary=summary,
            requires_human_approval=True,
        )
    # ผ่านด่านอนุมัติแล้วจึงค่อย INSERT ลง SQLite
    return WriteGateResult(
        status="committed",
        ticket_id="TKT-2026-001",
        draft_summary=summary,
        requires_human_approval=False,
    )`,
        caption: "Two-Phase Write Gate: ถ้าไม่ผ่านทั้ง `approved=True` และ `approval_token` จะคืนแค่ Draft Preview โดยไม่เปลี่ยนสถานะฐานข้อมูล",
      },
      whyTitle: "Why this matters — แยกการ 'เสนอให้ทำ' ออกจากสิทธิ์ 'ลงมือทำจริง'",
      whyParagraphs: [
        "ต่อให้ {{llm}} ถูกหลอกด้วย Prompt Injection ให้เรียก `create_support_ticket` เอง ผลลัพธ์ที่ได้ก็เป็นเพียง Draft Preview ที่รอคนกดอนุมัติ — ไม่เกิดการเขียนข้อมูลจริงในฐานข้อมูล",
        "ใน Day 167 เราจะเชื่อมผลลัพธ์ `pending_approval` นี้เข้ากับจุดหยุด {{hitl}} ของ LangGraph Router ได้อย่างแนบเนียน",
      ],
    },
    {
      id: "idempotency-and-error-contracts",
      title: "3 · Idempotency Key และ Structured Error Contracts สำหรับ Tool",
      paragraphs: [
        "ลองจินตนาการว่าผู้ใช้กดยืนยันเปิดทิกเก็ตเคลมแล้ว แต่เครือข่ายสะดุดทำให้ Agent ไม่ได้รับคำตอบจาก MCP Server ในรอบแรก ระบบจึงสั่ง retry อีกรอบ หากฐานข้อมูลไม่รู้จักการกันซ้ำ ลูกค้าจะได้ทิกเก็ตใหม่ซ้ำกัน 2 ใบทันที",
        "ทางแก้มาตรฐานคือบังคับให้ Write Tool รับ **`idempotency_key`** (เช่น `f\"{thread_id}:{order_id}:{action}\"`) และตั้งคอลัมน์ `idempotency_key TEXT UNIQUE` ในตาราง `tickets` ของ {{sqlite}}: ก่อน `INSERT` ให้ตรวจว่ามี `idempotency_key` นี้อยู่แล้วหรือไม่ หากมีอยู่แล้วให้คืน `ticket_id` ใบเดิมพร้อมธง `deduplicated=True` แทนการสร้างแถวใหม่",
        "นอกจากนี้ ทุก Tool ใน MCP Server ควรคืน **{{data-contract}} มาตรฐานเดียวกัน** (`ok`, `status`, `data`, `error_code`, `message`) เพื่อไม่ให้ MCP Client ต้องคอยเดาโครงสร้าง error เวลาเกิด `validation_error`, `not_found`, หรือ `approval_required`",
      ],
      analogy:
        "Idempotency Key เหมือนเลขที่อ้างอิงใบเสร็จเวลาจ่ายเงินออนไลน์ — ต่อให้กดรีเฟรชส่งคำขอซ้ำ 3 รอบ ระบบจะเห็นเลขเดิมแล้วบอกว่า 'รายการนี้สำเร็จไปแล้ว เลขทิกเก็ตคือ TKT-2026-001' โดยไม่ตัดซ้ำ",
      bullets: [
        "**`UNIQUE(idempotency_key)`**: กัน race condition และป้องกันทิกเก็ตเบิ้ลในระดับฐานข้อมูล",
        "**Error Codes ที่ชัด**: `validation_error` (รูปแบบ ID ผิด), `not_found` (ไม่พบออเดอร์), `approval_required` (ยังไม่ผ่าน HITL)",
        "**FastMCP Wrapper**: เมื่อ handler ฝั่ง Python ผ่านเทสต์ทั้งหมดแล้ว การเอา `@mcp.tool()` มาห่อเพื่อรันบน `stdio` หรือ HTTP ใช้โค้ดเพิ่มไม่ถึง 15 บรรทัด",
      ],
      whyTitle: "Why this matters — เครื่องมือที่ปลอดภัยต้องทนทั้ง Human Error และ Network Retry",
      whyParagraphs: [
        "วิศวกรมือใหม่มักทดสอบเฉพาะกรณีที่เรียก tool แค่ครั้งเดียวแล้วสำเร็จ แต่ในโลกจริงการ retry เกิดขึ้นเป็นเรื่องปกติ",
        "การใส่ {{idempotency}} และ Error Contract ที่ชัดตั้งแต่วันนี้ ช่วยให้ระบบของ Day 168 และ Day 177 (Load & Failure Testing) ทนทานต่อความผิดพลาดจริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — MCP Server คือ REST/RPC Microservice ที่ LLM เป็นคนเรียก",
      body: [
        "ถ้าคุณเคยสร้าง Backend API สำหรับระบบ E-Commerce การออกแบบ MCP Server ใช้หลักวิศวกรรมเดียวกันทุกประการ ต่างกันแค่ผู้เรียกคือ LLM ผ่าน MCP Client:",
      ],
      table: [
        ["MCP Read-Only Tool (`lookup_order`)", "`GET /orders/:id` + Parameterized SQL + DTO masking"],
        ["MCP Write Gate (`create_support_ticket`)", "`POST /tickets` ที่บังคับ 2-Step Confirmation Token"],
        ["`idempotency_key` ใน SQLite", "`Idempotency-Key` HTTP Header กันสร้างรายการซ้ำ"],
        ["MCP Resource (`support://sla`)", "`GET /static/sla.json` ข้อมูลอ้างอิงแบบ Read-Only"],
      ],
    },
    student: {
      title: "First-Year Note — Parameterized SQL (`?`) กับการป้องกัน SQL Injection",
      body: [
        "เวลาค้นข้อมูลใน `sqlite3` อย่าใช้วิธีต่อข้อความแบบ `f\"SELECT * FROM orders WHERE order_id = '{order_id}'\"` เพราะถ้ามีคนส่งข้อความแปลก ๆ เข้ามา อาจเปลี่ยนคำสั่ง SQL ของเราให้ลบตารางหรือดึงข้อมูลคนอื่นได้",
        "ให้เขียน `cursor.execute(\"SELECT * FROM orders WHERE order_id = ?\", (order_id,))` เสมอ เครื่องหมาย `?` จะบอก SQLite ให้มองค่าที่ส่งเข้าไปเป็น 'ข้อมูลล้วน ๆ' ไม่มีสิทธิ์กลายเป็นคำสั่ง SQL โดยเด็ดขาด",
      ],
    },
  },

  workedExample: {
    intro:
      "มาสร้างฐานข้อมูล SQLite จำลองสำหรับ Capstone พร้อม Read-Only `lookup_order` (ที่มี PDPA masking) และ Two-Phase `create_support_ticket` (ที่มี Approval Gate + Idempotency Key) กด **ขั้นต่อไป** เพื่อดูการทำงานทีละขั้น",
    steps: [
      {
        title: "1 · สร้าง SQLite Schema และข้อมูลจำลอง Orders + Tickets",
        explain:
          "ใช้ `sqlite3.connect(\":memory:\")` เพื่อรันบนเครื่องได้ทันทีโดยไม่ทิ้งไฟล์ขยะ พร้อมตั้ง `idempotency_key TEXT UNIQUE` ที่ตาราง `tickets`",
        code: {
          language: "python",
          filename: "worked_mcp_server.py",
          code: `import sqlite3


def init_db() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(
        """
        CREATE TABLE orders (
            order_id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            status TEXT NOT NULL,
            total_thb REAL NOT NULL
        );
        CREATE TABLE tickets (
            ticket_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            issue TEXT NOT NULL,
            idempotency_key TEXT UNIQUE NOT NULL
        );
        INSERT INTO orders VALUES
            ('ORD-2026-104', 'สมชาย ใจดี', '0812345678', 'shipped', 2490.0);
        """
    )
    return conn`,
        },
      },
      {
        title: "2 · สร้าง Read-Only Lookup พร้อม PDPA Phone Masking",
        explain:
          "ตรวจรูปแบบ `order_id` ก่อนค้นด้วย Parameterized SQL และปิดบังเลขโทรศัพท์ให้เหลือแค่ 3 หลักหน้ากับ 4 หลักท้ายก่อนส่งคืน",
        code: {
          language: "python",
          filename: "worked_mcp_server.py",
          code: `import re


def mask_phone(phone: str) -> str:
    digits = re.sub(r"\\D", "", phone)
    if len(digits) < 7:
        return "***"
    return f"{digits[:3]}-xxx-{digits[-4:]}"


def lookup_order(conn: sqlite3.Connection, order_id: str) -> dict:
    if not re.fullmatch(r"ORD-\\d{4}-\\d{3,}", order_id):
        return {"ok": False, "error_code": "validation_error", "data": None}
    row = conn.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,)).fetchone()
    if row is None:
        return {"ok": False, "error_code": "not_found", "data": None}
    return {
        "ok": True,
        "error_code": None,
        "data": {
            "order_id": row["order_id"],
            "status": row["status"],
            "total_thb": row["total_thb"],
            "phone_masked": mask_phone(row["phone"]),
        },
    }`,
        },
      },
      {
        title: "3 · ทดสอบ Two-Phase Write Gate และ Idempotency บน SQLite",
        explain:
          "ลองเรียกเปิดทิกเก็ตครั้งแรกแบบยังไม่อนุมัติ (ต้องคืน `pending_approval` และไม่ลง DB) จากนั้นเรียกแบบอนุมัติแล้ว 2 ครั้งด้วย `idempotency_key` เดิม (ต้องได้ทิกเก็ตใบเดียวไม่เบิ้ล)",
        code: {
          language: "python",
          filename: "worked_mcp_server.py",
          code: `def create_ticket(
    conn: sqlite3.Connection,
    order_id: str,
    issue: str,
    idempotency_key: str,
    *,
    approved: bool = False,
) -> dict:
    if not approved:
        return {"ok": False, "status": "pending_approval", "ticket_id": None}
    existing = conn.execute(
        "SELECT ticket_id FROM tickets WHERE idempotency_key = ?", (idempotency_key,)
    ).fetchone()
    if existing:
        return {"ok": True, "status": "committed", "ticket_id": existing["ticket_id"], "deduplicated": True}
    count = conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0] + 1
    tid = f"TKT-2026-{count:03d}"
    conn.execute(
        "INSERT INTO tickets (ticket_id, order_id, issue, idempotency_key) VALUES (?, ?, ?, ?)",
        (tid, order_id, issue, idempotency_key),
    )
    conn.commit()
    return {"ok": True, "status": "committed", "ticket_id": tid, "deduplicated": False}


db = init_db()
print("Lookup :", lookup_order(db, "ORD-2026-104"))
print("Phase 1:", create_ticket(db, "ORD-2026-104", "สินค้าชำรุด", "req-01", approved=False))
print("Phase 2:", create_ticket(db, "ORD-2026-104", "สินค้าชำรุด", "req-01", approved=True))
print("Retry  :", create_ticket(db, "ORD-2026-104", "สินค้าชำรุด", "req-01", approved=True))`,
        },
        output: `Lookup : {'ok': True, 'error_code': None, 'data': {'order_id': 'ORD-2026-104', 'status': 'shipped', 'total_thb': 2490.0, 'phone_masked': '081-xxx-5678'}}
Phase 1: {'ok': False, 'status': 'pending_approval', 'ticket_id': None}
Phase 2: {'ok': True, 'status': 'committed', 'ticket_id': 'TKT-2026-001', 'deduplicated': False}
Retry  : {'ok': True, 'status': 'committed', 'ticket_id': 'TKT-2026-001', 'deduplicated': True}`,
      },
    ],
    gotcha:
      "จุดสังเกต: อย่าใช้ `approved: bool` อย่างเดียวโดยปล่อยให้ LLM ส่ง `approved=True` มาเองได้ใน schema! ในระบบจริง `approved` และ `approval_token` ต้องถูก inject จากฝั่ง Host/LangGraph Checkpoint เท่านั้น ไม่ใช่ฟิลด์ที่เปิดให้โมเดลกรอกเอง",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/mcp_support_server.py` เพื่อเป็น MCP Support Backend ของโปรเจกต์ Capstone พร้อม Read-Only Lookup (`lookup_order`, `get_ticket`) และ Safe Write Gate (`create_support_ticket`) ที่รองรับ FastMCP registration",
    requirements: [
      "สร้าง Pydantic schemas: `OrderLookupInput` (`order_id` ต้องตรง `^ORD-\\d{4}-\\d{3,}$`), `TicketLookupInput` (`ticket_id` ต้องตรง `^TKT-\\d{4}-\\d{3,}$`), `CreateTicketInput` (`order_id`, `issue` ยาว >= 5, `idempotency_key` ยาว >= 4), และ `ToolResponse(BaseModel)` (`ok: bool`, `status: str`, `data: dict | None = None`, `error_code: str | None = None`, `message: str`)",
      "สร้างคลาส `MockSupportMCPServer` ที่เปิด SQLite (`:memory:` หรือ path) พร้อมตาราง `orders` และ `tickets` (มี `idempotency_key UNIQUE`) และเมธอด `seed_sample_data()` ที่ใส่ `ORD-2026-104` (เบอร์ `0812345678`, สถานะ `shipped`) และ `TKT-2026-001`",
      "เมธอด `lookup_order(order_id: str) -> ToolResponse`: ตรวจ input ด้วย `OrderLookupInput`, ค้นด้วย Parameterized SQL, ปิดบังเบอร์โทรด้วย `mask_phone` (`081-xxx-5678`) และไม่ส่งชื่อเต็ม/เบอร์ดิบออก — ถ้าไม่พบคืน `ok=False, status=\"error\", error_code=\"not_found\"`; ถ้ารูปแบบผิดคืน `ok=False, status=\"error\", error_code=\"validation_error\"`",
      "เมธอด `get_ticket(ticket_id: str) -> ToolResponse`: ตรวจ `TicketLookupInput` และคืนข้อมูลทิกเก็ตแบบ read-only หรือ `not_found` / `validation_error`",
      "เมธอด `create_support_ticket(order_id: str, issue: str, idempotency_key: str, *, approval_token: str | None = None) -> ToolResponse`: ตรวจ `CreateTicketInput` และเช็กว่า `order_id` มีอยู่จริงก่อน; หาก `approval_token != self.valid_approval_token` ให้คืน `ok=False, status=\"pending_approval\", error_code=\"approval_required\"` พร้อม `data` ที่มี `draft_summary` โดย **ห้ามเขียนลงตาราง `tickets`**; หาก token ถูกต้องให้บันทึกแบบ idempotent (เรียกซ้ำด้วย `idempotency_key` เดิมต้องคืน `ticket_id` เดิมพร้อม `data[\"deduplicated\"] == True`)",
    ],
    starter: {
      language: "python",
      filename: "src/mcp_support_server.py",
      code: `from __future__ import annotations

import re
import sqlite3
from typing import Any
from pydantic import BaseModel, Field, ValidationError, field_validator


class OrderLookupInput(BaseModel):
    order_id: str

    @field_validator("order_id")
    @classmethod
    def check_order_id(cls, v: str) -> str:
        # TODO: ตรวจรูปแบบ ^ORD-\\d{4}-\\d{3,}$
        raise NotImplementedError


class TicketLookupInput(BaseModel):
    ticket_id: str

    @field_validator("ticket_id")
    @classmethod
    def check_ticket_id(cls, v: str) -> str:
        # TODO: ตรวจรูปแบบ ^TKT-\\d{4}-\\d{3,}$
        raise NotImplementedError


class CreateTicketInput(BaseModel):
    order_id: str
    issue: str = Field(min_length=5)
    idempotency_key: str = Field(min_length=4)

    # TODO: validate order_id รูปแบบเดียวกับ OrderLookupInput


class ToolResponse(BaseModel):
    ok: bool
    status: str
    data: dict[str, Any] | None = None
    error_code: str | None = None
    message: str


def mask_phone(phone: str) -> str:
    digits = re.sub(r"\\D", "", phone)
    if len(digits) < 7:
        return "***"
    return f"{digits[:3]}-xxx-{digits[-4:]}"


class MockSupportMCPServer:
    def __init__(self, db_path: str = ":memory:", valid_approval_token: str = "HITL-APPROVED-2026") -> None:
        self.valid_approval_token = valid_approval_token
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self) -> None:
        # TODO: สร้างตาราง orders และ tickets (idempotency_key UNIQUE)
        raise NotImplementedError

    def seed_sample_data(self) -> None:
        # TODO: ใส่ ORD-2026-104 (phone='0812345678', status='shipped') และ TKT-2026-001
        raise NotImplementedError

    def lookup_order(self, order_id: str) -> ToolResponse:
        raise NotImplementedError

    def get_ticket(self, ticket_id: str) -> ToolResponse:
        raise NotImplementedError

    def create_support_ticket(
        self,
        order_id: str,
        issue: str,
        idempotency_key: str,
        *,
        approval_token: str | None = None,
    ) -> ToolResponse:
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_mcp_support_server.py",
      code: `from src.mcp_support_server import MockSupportMCPServer


def _server() -> MockSupportMCPServer:
    srv = MockSupportMCPServer()
    srv.seed_sample_data()
    return srv


def test_lookup_order_returns_masked_pdpa_fields():
    srv = _server()
    res = srv.lookup_order("ORD-2026-104")
    assert res.ok is True
    assert res.status == "ok"
    assert res.data is not None
    assert res.data["order_id"] == "ORD-2026-104"
    assert res.data["phone_masked"] == "081-xxx-5678"
    assert "0812345678" not in str(res.data)


def test_lookup_invalid_id_and_not_found():
    srv = _server()
    bad = srv.lookup_order("ORD-123; DROP TABLE orders;")
    missing = srv.lookup_order("ORD-2026-999")

    assert bad.ok is False
    assert bad.error_code == "validation_error"
    assert missing.ok is False
    assert missing.error_code == "not_found"


def test_get_ticket_returns_seeded_ticket():
    srv = _server()
    res = srv.get_ticket("TKT-2026-001")
    assert res.ok is True
    assert res.data is not None
    assert res.data["ticket_id"] == "TKT-2026-001"


def test_write_gate_blocks_without_valid_token():
    srv = _server()
    res = srv.create_support_ticket(
        "ORD-2026-104",
        "กล่องสินค้าบุบจากการขนส่ง",
        "idem-001",
        approval_token=None,
    )
    assert res.ok is False
    assert res.status == "pending_approval"
    assert res.error_code == "approval_required"
    assert res.data is not None and "draft_summary" in res.data

    row = srv.conn.execute("SELECT * FROM tickets WHERE idempotency_key = ?", ("idem-001",)).fetchone()
    assert row is None


def test_write_gate_commits_with_token_and_is_idempotent():
    srv = _server()
    first = srv.create_support_ticket(
        "ORD-2026-104",
        "กล่องสินค้าบุบจากการขนส่ง",
        "idem-002",
        approval_token="HITL-APPROVED-2026",
    )
    second = srv.create_support_ticket(
        "ORD-2026-104",
        "กล่องสินค้าบุบจากการขนส่ง",
        "idem-002",
        approval_token="HITL-APPROVED-2026",
    )

    assert first.ok is True
    assert first.status == "committed"
    assert first.data is not None
    assert first.data["deduplicated"] is False

    assert second.ok is True
    assert second.data is not None
    assert second.data["ticket_id"] == first.data["ticket_id"]
    assert second.data["deduplicated"] is True

    total = srv.conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0]
    assert total == 2  # TKT-2026-001 (seeded) + 1 new ticket only
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_mcp_support_server.py` แล้วผ่านครบทั้ง 5 test cases",
      "ทดสอบว่า `lookup_order` ปิดบังเบอร์โทร (`081-xxx-5678`) และกัน SQL injection ด้วย input validation",
      "ทดสอบว่า `create_support_ticket` ไม่เขียนลง SQLite หากขาด `approval_token` ที่ถูกต้อง",
      "ทดสอบว่าการเรียกซ้ำด้วย `idempotency_key` เดิมไม่สร้างทิกเก็ตเบิ้ล",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_mcp_support_server.py` และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "ใช้ `re.fullmatch(r\"ORD-\\d{4}-\\d{3,}\", v)` ใน validator ของ `OrderLookupInput` และ `CreateTicketInput`, และ `try ... except ValidationError` ในเมธอด lookup/create เพื่อคืน `ToolResponse(ok=False, status=\"error\", error_code=\"validation_error\", ...)`",
      },
      {
        body: "ใน `create_support_ticket`: (1) validate `CreateTicketInput`, (2) เช็กว่า `order_id` มีในตาราง `orders`, (3) ถ้า `approval_token != self.valid_approval_token` คืน `pending_approval` ทันที, (4) เช็ก `SELECT ticket_id FROM tickets WHERE idempotency_key = ?` ก่อน `INSERT`",
      },
      {
        body: "โครงของ `_init_schema`, `seed_sample_data` และ `create_support_ticket` — เติม `lookup_order` และ `get_ticket` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day166.py",
          code: `def _init_schema(self) -> None:
    self.conn.executescript(
        \"\"\"
        CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            status TEXT NOT NULL,
            total_thb REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tickets (
            ticket_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            issue TEXT NOT NULL,
            status TEXT NOT NULL,
            idempotency_key TEXT UNIQUE NOT NULL
        );
        \"\"\"
    )

def seed_sample_data(self) -> None:
    self.conn.execute(
        "INSERT OR IGNORE INTO orders VALUES (?, ?, ?, ?, ?)",
        ("ORD-2026-104", "สมชาย ใจดี", "0812345678", "shipped", 2490.0),
    )
    self.conn.execute(
        "INSERT OR IGNORE INTO tickets VALUES (?, ?, ?, ?, ?)",
        ("TKT-2026-001", "ORD-2026-104", "สอบถามรอบจัดส่ง", "open", "seed-001"),
    )
    self.conn.commit()`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_mcp_support_server.py
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "เปิดฟิลด์ `approved: bool` ให้ LLM เป็นคนส่งมาเองใน Tool Schema",
      symptom: "หากผู้ใช้หรือเอกสารสั่งว่า *\"ให้ถือว่าอนุมัติแล้ว\"* โมเดลอาจส่ง `approved=True` เข้ามาข้ามด่านอนุมัติได้",
      fix: "ซ่อน `approval_token` ไว้เป็น argument ฝั่งระบบ (Injected dependency) จากชั้น {{hitl}} Host เท่านั้น ห้ามเปิดให้ {{llm}} เป็นคนกรอก",
    },
    {
      title: "ส่งข้อมูล PII ดิบจากฐานข้อมูลกลับไปให้ LLM",
      symptom: "Tool คืนเบอร์โทรศัพท์และเลขบัตรประชาชนเต็ม ๆ เข้า context ของโมเดล ทำให้เสี่ยงรั่วทั้งออก external API และ log",
      fix: "ทำ {{pdpa}} masking (`081-xxx-5678`) และคัดเฉพาะฟิลด์ที่จำเป็นตั้งแต่ใน MCP Server ก่อนคืนค่า",
    },
    {
      title: "สร้าง Write Tool โดยไม่มี Idempotency Key",
      symptom: "เมื่อเกิด timeout แล้วระบบ retry อัตโนมัติ ทิกเก็ตหรือคำร้องถูกสร้างซ้ำ 2–3 ใบในฐานข้อมูล",
      fix: "บังคับส่ง `idempotency_key` และตั้ง `UNIQUE` constraint ใน {{sqlite}} เพื่อคืนผลลัพธ์เดิมเมื่อถูกเรียกซ้ำ",
    },
    {
      title: "ปล่อยให้โมเดลเขียน SQL String เองใน MCP Tool",
      symptom: "เสี่ยงทั้ง SQL Injection และ LLM อ่านตารางอื่นที่ไม่มีสิทธิ์",
      fix: "กำหนดเครื่องมือแบบเจาะจง (`lookup_order`, `get_ticket`) ที่รับเฉพาะ ID ผ่าน {{pydantic}} และรัน Parameterized Query (`?`) เท่านั้น",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d166-q1",
        "เหตุใดระบบ MCP Server ของ Capstone จึงไม่ควรรับพารามิเตอร์ `approved: bool` จาก LLM Tool Call โดยตรงเพื่อยืนยันการสร้างทิกเก็ต?",
        [
          ["เพราะ LLM ไม่รู้จักชนิดข้อมูล boolean ใน JSON", "JSON Schema และ LLM รองรับ boolean ได้ตามปกติ"],
          ["เพราะโมเดลอาจถูก Prompt Injection หรือเข้าใจผิดแล้วส่ง `approved=True` มาข้ามด่าน HITL ได้เอง", "ถูก — การยืนยันสิทธิ์ต้องมาจากฝั่ง Host/Checkpoint ของมนุษย์ (เช่น approval_token ที่โมเดลไม่รู้) ไม่ใช่จากตัวโมเดลเอง"],
          ["เพราะ SQLite ไม่รองรับคอลัมน์ boolean", "SQLite เก็บ 0/1 แทน boolean ได้"],
          ["เพราะทำให้ MCP Resource อ่านไฟล์ช้าลง", "ไม่เกี่ยวกับความเร็วของ MCP Resource"],
        ],
        "B",
        "ตามหลัก Least Privilege และ OWASP LLM06 สิทธิ์อนุมัติการเขียนข้อมูลต้องควบคุมจากโค้ดฝั่ง Host/HITL Checkpoint เท่านั้น ห้ามเชื่อค่าที่ LLM กรอกให้ตัวเอง",
        "การส่งสัญญาณอนุมัติ (approval) ให้ MCP Write Tool ควรมาจากที่ใด?",
        "ต้องถูก inject จากฝั่ง Host / HITL Checkpoint ของแอป (เช่น approval_token จากมนุษย์) ห้ามเปิดให้ LLM ส่งค่าอนุมัติมาเองใน Tool Schema",
      ),
      mc(
        "d166-q2",
        "การตั้ง `idempotency_key` เป็น `UNIQUE` ในตาราง `tickets` ของ SQLite ช่วยแก้ปัญหาใดในระบบ AI Tool Calling?",
        [
          ["ช่วยให้ PyThaiNLP ตัดคำชื่อลูกค้าได้เร็วขึ้น", "Idempotency key ไม่เกี่ยวกับการตัดคำภาษาไทย"],
          ["ป้องกันการสร้างทิกเก็ตซ้ำเบิ้ลเมื่อการเรียก tool ถูก retry หลัง timeout หรือผู้ใช้กดซ้ำ", "ถูก — การเรียกซ้ำด้วย key เดิมจะคืนทิกเก็ตใบเดิมโดยไม่สร้างแถวใหม่"],
          ["ช่วยลดขนาดของ Embedding vector ใน pgvector", "ไม่เกี่ยวข้องกับขนาด vector"],
          ["ทำให้ไม่ต้องตรวจสอบรูปแบบของ `order_id`", "ยังคงต้อง validate `order_id` ด้วย Pydantic เสมอ"],
        ],
        "B",
        "Idempotency key รับประกันว่าเมื่อเกิด retry จาก network timeout หรือ agent loop คำสั่งเขียนเดิมจะไม่สร้างข้อมูลซ้ำซ้อนในฐานข้อมูล",
        "`idempotency_key` มีบทบาทอย่างไรใน `create_support_ticket`?",
        "ป้องกันการสร้างทิกเก็ตซ้ำเมื่อเกิด retry โดยตรวจว่ามี key นี้อยู่แล้วหรือไม่ ถ้ามีให้คืนทิกเก็ตเดิมกลับไปแทนการ INSERT ใหม่",
      ),
      mc(
        "d166-q3",
        "ในชั้น `lookup_order` เราควรทำ **PDPA Masking** (เช่น `081-xxx-5678`) ที่จุดใดจึงจะปลอดภัยที่สุด?",
        [
          ["ทำเฉพาะตอนแสดงผลบนหน้าจอเว็บ Frontend", "สายเกินไป — เพราะเบอร์โทรดิบถูกส่งไปให้ LLM ภายนอกและอาจลง trace log ไปแล้ว"],
          ["ทำตั้งแต่ใน MCP Server ก่อนคืน `ToolResponse` กลับเข้า LLM context", "ถูก — ข้อมูลที่ส่งกลับให้โมเดลและบันทึกใน Agent state จะถูก mask ตั้งแต่ต้นทาง"],
          ["ไม่ต้องทำเพราะข้อมูลมาจากฐานข้อมูลภายในบริษัท", "ผิด — ทันทีที่ส่งออกไปยัง external LLM API หรือเก็บ log ก็เข้าข่ายต้องคุ้มครองข้อมูลส่วนบุคคลตาม PDPA"],
          ["ให้ LLM เป็นคนช่วยเซนเซอร์เบอร์โทรเองใน prompt", "ไม่ปลอดภัย เพราะข้อมูลดิบได้ออกจากระบบไปแล้วก่อนโมเดลอ่าน"],
        ],
        "B",
        "การ mask ข้อมูลส่วนบุคคลตั้งแต่ใน Tool Output ก่อนคืนกลับเข้า LLM context ช่วยป้องกัน PII รั่วทั้งใน outbound LLM API และในระบบ tracing",
        "ทำไมต้องทำ PDPA Masking ตั้งแต่ใน MCP Server Output?",
        "เพื่อไม่ให้เบอร์โทร/อีเมลดิบของลูกค้าถูกส่งเข้าไปใน context ของ external LLM และไม่ให้หลุดไปใน trace logs",
      ),
      mc(
        "d166-q4",
        "ข้อใดแยกความแตกต่างระหว่าง **MCP Tool** กับ **MCP Resource** ได้ถูกต้องที่สุด?",
        [
          ["MCP Tool ใช้สำหรับปฏิบัติการหรือค้นข้อมูลที่มีพารามิเตอร์ (เช่น `lookup_order`) ส่วน MCP Resource ใช้เปิดข้อมูลอ้างอิงแบบอ่านอย่างเดียวผ่าน URI (เช่น `support://sla`)", "ถูก — Tool คือ action/query ที่มี schema ชัดเจน ส่วน Resource คือ static/read-only context ผ่าน URI"],
          ["MCP Resource ใช้สั่ง `DELETE` ฐานข้อมูล ส่วน MCP Tool ใช้เก็บ CSS", "กลับด้านและไม่ตรงนิยามของโปรโตคอล MCP"],
          ["MCP Tool ทำงานแบบ async ไม่ได้ แต่ MCP Resource ทำงานได้", "ทั้งคู่ทำงานแบบ async ได้ใน MCP Python SDK"],
          ["MCP Resource ใช้แทน LangGraph Checkpointer ได้โดยตรง", "MCP Resource เป็นเพียงจุดอ่านข้อมูล ไม่ใช่ตัวจัดการ state ของ workflow"],
        ],
        "A",
        "MCP แยก Tool (model-controlled execution) ออกจาก Resource (application-controlled read-only context via URI) เพื่อจัดโครงสร้างสิทธิ์และบริบทให้ชัดเจน",
        "MCP Tool ต่างจาก MCP Resource อย่างไร?",
        "MCP Tool คือฟังก์ชันรับพารามิเตอร์สำหรับเรียกใช้ (action/lookup) ส่วน MCP Resource คือแหล่งข้อมูลอ่านอย่างเดียวที่อ้างถึงด้วย URI",
      ),
    ],
  },

  takeaways: [
    "แยกสิทธิ์เครื่องมือชัดเจน: **Read-Only Lookup** (`lookup_order`, `get_ticket`) ออกจาก **Guarded Write Tool** (`create_support_ticket`)",
    "ป้องกัน Excessive Agency ด้วย **Two-Phase Write Gate**: ขาด `approval_token` คืนแค่ `pending_approval` Draft โดยห้ามแตะ `INSERT`",
    "บังคับ **Pydantic Input Validation + Parameterized SQL (`?`) + PDPA Masking** ใน MCP Server เพื่อลดความเสี่ยงทั้ง SQLi และ PII leak",
    "ใส่ **`idempotency_key` (`UNIQUE`)** ในตาราง `tickets` เพื่อให้ retry กี่ครั้งก็ไม่สร้างทิกเก็ตซ้ำ",
  ],

  reviewCards: [
    rc(
      "d166-rc-1",
      "Two-Phase Write Gate ใน MCP Server ทำงานอย่างไร?",
      "ระยะที่ 1: เมื่อไม่มี valid approval_token (จากมนุษย์/HITL) Tool จะคืน Draft Preview สถานะ pending_approval โดยไม่แก้ DB; ระยะที่ 2: เมื่อได้ token จึงบันทึกลง DB",
    ),
    rc(
      "d166-rc-2",
      "ทำไมจึงไม่ควรเปิดให้ LLM ส่ง SQL query ดิบหรือส่งฟิลด์ `approved=True` เข้ามาใน MCP Tool?",
      "เพื่อกัน SQL Injection, การเข้าถึงตารางนอกสิทธิ์ และกัน Prompt Injection ที่หลอกให้โมเดลอนุมัติ write action ด้วยตัวเอง",
    ),
    rc(
      "d166-rc-3",
      "การออกแบบ `ToolResponse` และ `idempotency_key` ช่วยเรื่อง Reliability ของ Agent อย่างไร?",
      "ToolResponse ทำให้ Router จัดการ error (not_found, validation_error, approval_required) ได้สม่ำเสมอ ส่วน idempotency_key กันทิกเก็ตซ้ำเมื่อเกิด retry",
    ),
  ],

  sources: [
    { label: "Model Context Protocol (MCP) — Tools & Resources", href: "https://modelcontextprotocol.io/docs/concepts/tools" },
    { label: "MCP Python SDK (GitHub)", href: "https://github.com/modelcontextprotocol/python-sdk" },
    { label: "OWASP LLM06 — Excessive Agency", href: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/" },
    { label: "Python sqlite3 Documentation", href: "https://docs.python.org/3/library/sqlite3.html" },
  ],

  glossary: ["mcp", "mcp-resource", "tool-calling", "sqlite", "pydantic", "schema", "idempotency", "pdpa", "hitl", "guardrails"],
});
