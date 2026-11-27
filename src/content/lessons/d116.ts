import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D116 — Phase 4 / Block B29 (Review Day)
 * Review: Quiz + Expose internal SQLite/Knowledge lookup via MCP
 */
export const d116: Lesson = defineLesson({
  day: 116,
  titleTh: "ทบทวน B29: เปิด SQLite Order & Thai Knowledge Lookup ผ่าน MCP อย่างปลอดภัย",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ทบทวน D113–D115 + D26/D110 แล้วเชื่อม Parameterized SQLite + Thai KB Resource เข้า MCP พร้อม pytest",
  icon: "database",
  visual: {
    id: "mcp-server-client",
    title: "ทบทวน B29: เปิด SQLite Order & Thai KB Lookup ผ่าน MCP Server ที่ปลอดภัย",
    caption: "เชื่อม Parameterized SQLite (Phase 1) + Thai Hybrid KB + MCP Tools/Resources พร้อม integration test",
    alt: "แผนภาพการเปิด SQLite และ Knowledge lookup ผ่าน MCP",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — Integration Lab เชื่อม SQLite + Thai KB + Safe MCP Client ด้วย pytest",
  tools: ["MCP Python SDK", "SQLite", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รวมฐานข้อมูล SQLite จริงและคลังความรู้ไทยไว้ใต้ MCP เดียวกัน",
      body: "ในระบบผู้ช่วยลูกค้าจริง ข้อมูลสถานะออเดอร์อยู่ในฐานข้อมูลเชิงสัมพันธ์ ({{sqlite}}) ส่วนนโยบายและ FAQ อยู่ในคลังเอกสาร {{rag}} — {{mcp}} ช่วยเปิดเผยทั้งสองแหล่งผ่านสัญญาเดียวอย่างเป็นระเบียบ",
      lessonNote: "วันทบทวนนี้คุณจะเชื่อม Parameterized SQLite lookup (`lookup_order`) คู่กับ Policy Resource (`kb://policy/{slug}`)",
    },
    {
      node: 3,
      heading: "พิสูจน์ความปลอดภัยทุกชั้นด้วย Integration Test ใน pytest",
      body: "ความมั่นใจไม่ได้มาจากการลองพิมพ์ถาม 2–3 ครั้ง แต่มาจากการทดสอบอัตโนมัติทั้ง SQL Injection, การแยกสิทธิ์ข้ามผู้เช่า ({{acl}}), Allowlist และ `stdout` hygiene",
      lessonNote: "เราจะใช้ `tmp_path` และ `capsys` {{fixture}} ของ {{pytest}} เพื่อทดสอบฐานข้อมูล SQLite จริงแบบแยกอิสระ 100%",
    },
    {
      node: 4,
      heading: "วางรากฐาน MCP Integration ก่อนต่อเข้ากับ LangGraph ใน Block B30",
      body: "เมื่อชั้นข้อมูล (SQLite + KB) ถูกห่อเป็น MCP Server และ Safe Client เรียบร้อยแล้ว พรุ่งนี้ (Day 117) คุณจะเสียบเข้า Agent Loop ของ LangGraph ได้ทันทีโดยไม่ต้องรื้อโค้ดฐานข้อมูล",
      lessonNote: "นี่คือต้นแบบตรงของ Milestone 3 ใน Phase 6 Capstone (Order/Ticket Lookup + Thai KB)",
    },
    {
      node: 6,
      heading: "ทบทวนแบบ Interleaved Recall และจดจุดผิดพลาดลง Error Log",
      body: "การดึงความรู้เก่าจาก Phase 1 (Day 26 Parameterized SQL) และ Block B28 (Day 110 Safe Tools) มาผสานกับ B29 (Day 113–115) ช่วยให้ความรู้เชื่อมเป็นระบบเดียวกัน",
      lessonNote: "หลังจบควิซและ Integration Lab ให้บันทึกจุดที่ยังสับสนไว้ใน Error Log เพื่อทบทวนตามรอบ +3 / +8 / +16 วัน",
    },
  ],

  objectives: [
    "**ทบทวนแบบสลับหัวข้อ (Interleaved Recall)** เนื้อหา Day 113–115 (MCP Host/Client/Server, `stdio` hygiene, Allowlist/Timeout) เชื่อมโยงกับ Day 26 (Parameterized {{sqlite}}) และ Day 110 (Safe & Idempotent Tools)",
    "**เปิดเผย Read-Only SQLite Order Lookup + Thai Policy Resource** ผ่านโมดูล {{mcp}} Server ที่กัน SQL Injection, บังคับ {{acl}} ระดับ `tenant_id` และคืน {{structured-output}} ด้วย {{pydantic}}",
    "**เขียน Integration Test ครบวงจร** ใน {{pytest}} (ด้วย `tmp_path` และ `capsys`) ตรวจ Happy Path, SQL Injection, Cross-Tenant Isolation, Client Allowlist และความสะอาดของ `stdout`",
  ],

  prerequisites: [
    "ทบทวน Day 113 (MCP Architecture), Day 114 (Local MCP Server & stdio hygiene) และ Day 115 (Safe MCP Client)",
    "ทบทวน Day 26 (Parameterized Queries ใน {{sqlite}}) และ Day 110 (Safe Tool Design)",
    "ใช้งาน `pytest` กับ `tmp_path` และ `capsys` ได้",
    "ไม่ต้องใช้ API key — รันฐานข้อมูล SQLite จริงและ Integration Test บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "วันทบทวนนี้ใช้ `sqlite3` จาก Python standard library คู่กับ `pydantic` และ `pytest` เพื่อประกอบร่าง SQLite Order + Thai KB MCP Server และทดสอบ end-to-end ภายใน 30 นาที",
    commands: `uv init ai-day116 && cd ai-day116
uv add mcp pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day116` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `mcp`, `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["ready", "เริ่มทำควิซทบทวน 4 ข้อ แล้วลงมือสร้าง Integration Lab ด้วย SQLite + MCP"],
    ],
    note: "แนะนำให้ลองตอบควิซทบทวน 4 ข้อก่อนดูเฉลย (Retrieval Practice) แล้วจึงประกอบร่าง SQLite + Thai KB MCP Server ในส่วนฝึกปฏิบัติ",
  },

  concepts: [
    {
      id: "interleaved-b29-synthesis",
      title: "1 · ทบทวนเชื่อมโยง B29 + Phase 1: ภาพรวมสายโซ่ความปลอดภัยจาก LLM ถึง SQLite",
      paragraphs: [
        "ตลอด Block B29 (Day 113–115) เราได้สร้างเกราะป้องกันทีละชั้น และในวันทบทวนนี้เราจะเชื่อมมันเข้ากับความรู้พื้นฐานจาก **Day 26 (Parameterized SQLite)** และ **Day 110 (Idempotent & Safe Tools)** ให้กลายเป็นสายโซ่เดียว:",
        "เริ่มต้นจาก **ฝั่ง Host/Client (D113, D115)**: บังคับ Client-Side Allowlist, คุม timeout ด้วย `asyncio.wait_for` และคืน structured fallback เมื่อมีปัญหา → ส่งต่อผ่านโปรโตคอล JSON-RPC 2.0 (โดยรักษา `stdout` ให้สะอาดและ log ลง `stderr` ตาม **D114**) → เข้าสู่ **ฝั่ง MCP Server (D114, D110, D26)**: แยก Read-Only {{mcp-resource}} (`kb://policy/{slug}`) ออกจาก Read-Only Tool (`lookup_order`) ที่ validate input ด้วย {{pydantic}} และ query ฐานข้อมูลด้วย `?` placeholder เท่านั้น",
        "เมื่อทุกชั้นทำงานประสานกัน แม้เอกสารจากภายนอกจะพยายามทำ {{prompt-injection}} ให้โมเดลส่งคำสั่งลบตารางหรือขอดูออเดอร์ของลูกค้าบริษัทอื่น ระบบก็ยังปลอดภัยในทุกด่าน (Defense-in-Depth)",
      ],
      analogy:
        "เหมือนห้องนิรภัยธนาคาร 4 ชั้น: ประตูหน้าตรวจรายชื่อผู้มีสิทธิ์ (Allowlist), พนักงานรับคำร้องตรวจแบบฟอร์ม (Pydantic), ช่องรับเอกสารแยกจากช่องเบิกเงิน (Resource vs Tool) และตู้เซฟเปิดได้เฉพาะกล่องของเจ้าของบัญชี (Parameterized SQL + Tenant ACL)",
      bullets: [
        "**D26 (SQLite)**: ใช้ `?` parameter binding เสมอ ห้ามต่อ string SQL (`f\"...\"`) และเปิดโหมดอ่านอย่างเดียวเมื่อไม่จำเป็นต้องเขียน",
        "**D110 (Safe Tools)**: ออกแบบ lookup tool ให้มีสมบัติ {{idempotency}} และคืนข้อความผิดพลาดที่ชัดเจน (`found=False` vs `error_code`)",
        "**D113–D115 (MCP)**: แยก Host/Client/Server, ใช้ `kb://` Resource สำหรับนโยบาย, ห้าม `print()` ลง `stdout`, และบังคับ Allowlist + Timeout ฝั่ง Client",
      ],
      whyTitle: "Why this matters — ช่องโหว่จริงมักเกิดตรง 'รอยต่อ' ระหว่างส่วนประกอบ",
      whyParagraphs: [
        "MCP Server ที่เขียน `FastMCP` สวยงามแต่เผลอใช้ f-string ใน SQL ก็ยังโดน SQL Injection อยู่ดี หรือ SQL ที่ปลอดภัยแต่ไม่มี `tenant_id` filter ก็ยังทำข้อมูลรั่วข้ามลูกค้าได้",
        "วันทบทวนแบบ Integration Lab จึงสำคัญมาก เพราะบังคับให้เราตรวจสอบทุกรอยต่อพร้อมกันในระบบเดียว",
      ],
    },
    {
      id: "readonly-sqlite-acl-tool",
      title: "2 · Read-Only SQLite Order Lookup: Parameterized Query + Tenant ACL",
      paragraphs: [
        "กฎเหล็กของการเปิดฐานข้อมูล {{sqlite}} ให้ LLM เรียกผ่าน {{mcp}} คือ **ห้ามเปิด Tool แบบ `run_sql(query)` เด็ดขาด** ให้เปิดเฉพาะฟังก์ชันแคบ ๆ เช่น `lookup_order(order_id, tenant_id)` ที่ผูกคำสั่ง `SELECT` ตายตัวไว้ในโค้ด",
        "ในคำสั่ง SQL ต้องส่งตัวแปรผ่าน tuple parameter (`WHERE order_id = ? AND tenant_id = ?`) เสมอ หากมีผู้ไม่หวังดีหรือ Prompt Injection ส่ง `order_id = \"' OR '1'='1\"` ตัวขับ SQLite จะมองข้อความนั้นเป็นแค่ string ธรรมดา ไม่ได้ถูกตีความเป็นเงื่อนไข SQL จึงไม่มีทางดึงข้อมูลทั้งตารางออกมาได้",
        "นอกจากนี้ การส่ง `tenant_id` จาก session ของผู้ใช้ที่ยืนยันตัวตนแล้วฝั่ง Host (ไม่ใช่ให้ผู้ใช้พิมพ์เองในแชต) และบังคับใน `WHERE` clause ช่วยรับประกัน {{acl}} ระดับผู้เช่าเหมือนที่เรียนใน Day 107",
      ],
      analogy:
        "Parameterized Query เหมือนการกรอกชื่อลงในช่องสี่เหลี่ยมบนแบบฟอร์มพิมพ์ตายตัว: ต่อให้มีคนเขียนว่า `'หรือหยิบให้ทุกคน'` ลงในช่องชื่อ พนักงานก็เอาข้อความนั้นไปหาคนชื่อนั้นตรง ๆ ไม่ได้ทำตามคำสั่งที่เขียนแทรกมา",
      code: {
        language: "python",
        filename: "sqlite_mcp_lookup.py",
        code: `import sqlite3
from pathlib import Path
from pydantic import BaseModel


class OrderRecord(BaseModel):
    order_id: str
    found: bool
    status: str = "not_found"
    customer_name: str = ""
    amount_thb: int = 0


def query_order_readonly(db_path: Path, order_id: str, tenant_id: str) -> OrderRecord:
    """เปิด SQLite แบบ read-only URI และใช้ parameterized query เท่านั้น"""
    uri = f"file:{db_path.as_posix()}?mode=ro"
    with sqlite3.connect(uri, uri=True) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT order_id, status, customer_name, amount_thb "
            "FROM orders WHERE order_id = ? AND tenant_id = ?",
            (order_id, tenant_id),
        ).fetchone()
    if row is None:
        return OrderRecord(order_id=order_id, found=False)
    return OrderRecord(
        order_id=row["order_id"],
        found=True,
        status=row["status"],
        customer_name=row["customer_name"],
        amount_thb=row["amount_thb"],
    )`,
        caption: "ผสาน `mode=ro` ของ SQLite + `?` placeholder + `tenant_id` ACL + Pydantic `OrderRecord` ในฟังก์ชันเดียว",
      },
      whyTitle: "Why this matters — แยก Read-Only Connection ลดแรงกระแทกถึงระดับฐานข้อมูล",
      whyParagraphs: [
        "การเปิดการเชื่อมต่อด้วย `mode=ro` (read-only) เป็นการป้องกันซ้อนอีกชั้นที่ระดับ SQLite engine เอง ต่อให้เกิดบั๊กในโค้ดชั้นบน ฐานข้อมูลก็จะปฏิเสธคำสั่ง `INSERT`/`UPDATE`/`DELETE` ทันที",
        "ใน PostgreSQL ระดับ Production (Phase 5–6) แนวคิดนี้เทียบเท่าการสร้าง database role ที่ได้สิทธิ์เฉพาะ `SELECT` บนตารางที่อนุญาตเท่านั้น",
      ],
    },
    {
      id: "integration-testing-mcp",
      title: "3 · Integration Testing ครบวงจรด้วย pytest (`tmp_path` + `capsys`)",
      paragraphs: [
        "ก่อนนำ MCP Server ไปเสียบกับ LangGraph Agent (Block B30) เราควรมีชุด Integration Test ใน {{pytest}} ที่สร้างฐานข้อมูล SQLite ชั่วคราวจริง ๆ ด้วย `tmp_path` {{fixture}} เพื่อให้ทุกเทสต์ได้ไฟล์ฐานข้อมูลใหม่สะอาดและไม่ชนกัน",
        "ชุดทดสอบที่ดีสำหรับระบบ MCP + SQLite + Knowledge Lookup ต้องครอบคลุมอย่างน้อย **5 แกน**: (1) Happy path ค้นเจอออเดอร์ของ tenant ตัวเอง, (2) Cross-tenant ACL isolation, (3) SQL Injection payload ไม่สามารถดึงข้อมูลหรือทำลายตารางได้, (4) Client Allowlist บล็อก write/delete tool, และ (5) Policy Resource + `capsys` ยืนยันว่า `stdout` ว่างสนิท",
        "เมื่อชุดเทสต์นี้รันผ่านในเวลาไม่ถึง 1 วินาทีโดยไม่พึ่งอินเทอร์เน็ต คุณสามารถผูกมันเข้ากับ GitHub Actions CI ได้ทันทีเพื่อให้มั่นใจว่าการแก้โค้ดในอนาคตจะไม่เปิดช่องโหว่ย้อนหลัง",
      ],
      analogy:
        "Integration Test เหมือนการซ้อมหนีไฟและทดสอบระบบล็อกประตูจริงในอาคารจำลอง (`tmp_path`) ก่อนเปิดให้ลูกค้าเข้าใช้งานจริง",
      bullets: [
        "**`tmp_path` fixture**: สร้าง `tmp_path / \"orders.db\"` แยกต่อเทสต์ หมดปัญหาข้อมูลค้างจากรอบก่อน",
        "**Negative Security Tests**: ทดสอบทั้ง `' OR '1'='1`, `kb://policy/../secret` และเครื่องมือต้องห้าม `delete_order`",
        "**`capsys` fixture**: ยืนยันว่าไม่มี `print()` หลุดออก `stdout` และมี structured log ออกทาง `stderr`",
      ],
      whyTitle: "Why this matters — Security Test ที่รันอัตโนมัติคือประกันชีวิตของ AI Engineer",
      whyParagraphs: [
        "โค้ดป้องกันความปลอดภัยมักถูกเผลอลบหรือแก้พังตอน refactor ฟีเจอร์ใหม่ ถ้าไม่มีเทสต์ยิง SQL Injection และ cross-tenant check ไว้คอยจับ คุณจะไม่รู้ตัวเลยจนกว่าจะเกิดเหตุจริง",
        "ชุดเทสต์ลักษณะนี้จะถูกขยายต่อไปเป็น Eval & Red-Team Gate ใน Phase 5 (Block B38)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ SQLite + KB MCP Integration กับ Backend Service Layer",
      body: [
        "หากคุณเคยเขียน Backend API + Integration Tests สำหรับเว็บแอป นี่คือการจับคู่แบบ 1:1 กับงานวันนี้:",
      ],
      table: [
        ["Parameterized SQLite (`?`) + `mode=ro`", "Read-replica DB connection + Prisma/pg bound params"],
        ["`WHERE order_id = ? AND tenant_id = ?`", "Row-level tenant scoping ใน multi-tenant SaaS API"],
        ["`kb://policy/{slug}` MCP Resource", "Static Docs / CMS read-only GET endpoint"],
        ["`SafeMCPClient` Allowlist", "Service-to-service RBAC / API Gateway policy"],
        ["`pytest` `tmp_path` + `capsys`", "Isolated test DB container + stdout/log assertions"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม `tmp_path` ของ pytest จึงดีกว่าสร้างไฟล์ `.db` ไว้ในโฟลเดอร์โปรเจกต์",
      body: [
        "ถ้าคุณสร้างไฟล์ `test.db` ไว้ในโฟลเดอร์โปรเจกต์ตรง ๆ เทสต์แรกอาจเพิ่มแถวข้อมูลค้างไว้จนทำให้เทสต์ที่สองพัง หรือเผลอ commit ไฟล์ฐานข้อมูลขึ้น Git โดยไม่ได้ตั้งใจ",
        "เมื่อประกาศพารามิเตอร์ `def test_something(tmp_path):` ตัว `pytest` จะสร้างโฟลเดอร์ชั่วคราวใหม่เอี่ยม (`Path`) ให้เฉพาะเทสต์นั้นแล้วลบทิ้งเองหลังจบ ช่วยให้ทุกเทสต์อิสระต่อกัน 100%",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะเชื่อม SQLite ฐานข้อมูลออเดอร์ 2 บริษัท (`acme_th` และ `beta_th`) + คลังนโยบายภาษาไทยเข้าใน `InternalLookupMCPServer` แล้วเรียกผ่าน `SafeMCPClient` เพื่อดูผลลัพธ์ทั้งเคสปกติ, เคสข้าม tenant และเคสโจมตี SQL Injection",
    steps: [
      {
        title: "1 · สร้างฐานข้อมูล SQLite และเติมข้อมูลออเดอร์หลาย Tenant",
        explain:
          "ใช้ `sqlite3` สร้างตาราง `orders` และใช้ `executemany` แบบ `?` placeholder เพื่อเติมข้อมูลตัวอย่างของ 2 tenants",
        code: {
          language: "python",
          filename: "worked_b29_integration.py",
          code: `import sqlite3
from pathlib import Path


def seed_db(db_path: Path) -> None:
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                status TEXT NOT NULL,
                amount_thb INTEGER NOT NULL
            )
            """
        )
        conn.executemany(
            "INSERT OR REPLACE INTO orders VALUES (?, ?, ?, ?, ?)",
            [
                ("INV-2026-009", "acme_th", "สมชาย ใจดี", "paid", 1490),
                ("INV-2026-021", "beta_th", "สุดา รักเรียน", "pending_payment", 3200),
            ],
        )


db_file = Path("demo_orders.db")
seed_db(db_file)
print("Seeded:", db_file.name)`,
        },
        output: `Seeded: demo_orders.db`,
      },
      {
        title: "2 · เปิด Read-Only SQLite Lookup + Policy Resource ภายใต้ Server เดียว",
        explain:
          "เมธอด `lookup_order` ใช้ parameterized SQLite (`mode=ro`) พร้อม `tenant_id` filter ส่วน `read_resource` ตรวจ URI รูปแบบ `kb://policy/{slug}` และเขียน log ลง `sys.stderr` เท่านั้น",
        code: {
          language: "python",
          filename: "worked_b29_integration.py",
          code: `import json
import re
import sys
from typing import Any

POLICY_URI_RE = re.compile(r"^kb://policy/([a-z0-9-]+)$")


class InternalMCPServer:
    def __init__(self, db_path: Path, policies: dict[str, str]) -> None:
        self.db_path = db_path
        self.policies = policies

    def _log(self, event: str, **fields: Any) -> None:
        print(json.dumps({"event": event, **fields}, ensure_ascii=False), file=sys.stderr)

    def lookup_order(self, order_id: str, tenant_id: str) -> dict[str, Any]:
        uri = f"file:{self.db_path.as_posix()}?mode=ro"
        with sqlite3.connect(uri, uri=True) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT order_id, status, customer_name, amount_thb "
                "FROM orders WHERE order_id = ? AND tenant_id = ?",
                (order_id, tenant_id),
            ).fetchone()
        self._log("lookup_order", order_id=order_id, tenant_id=tenant_id, found=row is not None)
        if row is None:
            return {"order_id": order_id, "found": False, "status": "not_found"}
        return {"found": True, **dict(row)}

    def read_resource(self, uri: str) -> dict[str, str]:
        match = POLICY_URI_RE.fullmatch(uri)
        if not match:
            raise ValueError(f"Invalid policy URI: {uri!r}")
        slug = match.group(1)
        if slug not in self.policies:
            raise KeyError(f"Unknown policy: {slug}")
        self._log("read_resource", uri=uri)
        return {"uri": uri, "mime_type": "text/markdown", "text": self.policies[slug]}`,
        },
        output: `# Server พร้อมให้บริการ lookup_order (SQLite mode=ro) และ read_resource (kb://policy/*)`,
      },
      {
        title: "3 · ทดสอบ Happy Path, Cross-Tenant Isolation และ SQL Injection Payload",
        explain:
          "ลองเรียกดูออเดอร์ของตัวเอง, แอบดูออเดอร์ข้ามบริษัท และยิง payload `' OR '1'='1` เพื่อยืนยันว่าทุกด่านทำงานถูกต้อง",
        code: {
          language: "python",
          filename: "worked_b29_integration.py",
          code: `server = InternalMCPServer(
    db_file,
    policies={"refund": "คืนเงินได้ภายใน 7 วันหลังได้รับสินค้า"},
)

print("Own tenant   :", server.lookup_order("INV-2026-009", tenant_id="acme_th"))
print("Cross tenant :", server.lookup_order("INV-2026-009", tenant_id="beta_th"))
print("SQLi attempt :", server.lookup_order("' OR '1'='1", tenant_id="acme_th"))
print("Policy       :", server.read_resource("kb://policy/refund")["text"])`,
        },
        output: `Own tenant   : {'found': True, 'order_id': 'INV-2026-009', 'status': 'paid', 'customer_name': 'สมชาย ใจดี', 'amount_thb': 1490}
Cross tenant : {'order_id': 'INV-2026-009', 'found': False, 'status': 'not_found'}
SQLi attempt : {'order_id': "' OR '1'='1", 'found': False, 'status': 'not_found'}
Policy       : คืนเงินได้ภายใน 7 วันหลังได้รับสินค้า`,
      },
    ],
    gotcha:
      "จุดสังเกต: สังเกตว่าเราไม่ส่ง `tenant_id` ผ่านคำอธิบายให้ LLM กรอกเอง แต่ให้ชั้น **Host / SafeMCPClient** ผูก `tenant_id` จาก session ของผู้ใช้ที่ยืนยันตัวตนแล้วใส่เข้าไปในคำขอทุกครั้ง เพื่อกันไม่ให้ Prompt Injection สั่ง LLM เปลี่ยน `tenant_id` เป็นบริษัทอื่น",
  },

  practice: {
    intro:
      "โจทย์ทบทวน B29 (15 นาที): ประกอบร่างระบบ **SQLite Order + Thai Knowledge MCP Integration** (`exercise_day116.py`) ที่มีทั้ง Parameterized Read-Only SQLite Tool, Policy Resource (`kb://policy/{slug}`), Safe Client Allowlist + Tenant Scoping และผ่านชุด Integration Test ครบ 5 เคสใน `pytest`",
    requirements: [
      "สร้าง `init_order_db(db_path: Path) -> None` สร้างตาราง `orders(order_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, customer_name TEXT NOT NULL, status TEXT NOT NULL, amount_thb INTEGER NOT NULL)` และเติมข้อมูลอย่างน้อย 2 ออเดอร์จาก 2 tenants (`INV-2026-009` ของ `acme_th` และ `INV-2026-021` ของ `beta_th`)",
      "สร้าง `OrderLookupResult(BaseModel)` มี `order_id: str`, `found: bool`, `status: str = \"not_found\"`, `customer_name: str = \"\"`, `amount_thb: int = 0`",
      "สร้าง `InternalKnowledgeMCPServer(db_path: Path, policies: dict[str, str])` ที่มี `list_tools()`, `call_tool(name, arguments)` (รองรับ `lookup_order` ที่ใช้ SQLite `mode=ro` + `?` placeholder + `tenant_id` filter และคืน `OrderLookupResult.model_dump()`, ส่วน `delete_order` เป็น write tool), และ `read_resource(uri)` (รับเฉพาะ `kb://policy/{slug}` ที่ `slug` ตรง `^[a-z0-9-]+$`) โดยทุก log ต้องออก `sys.stderr` เท่านั้น",
      "สร้าง `SafeMCPClient(server: InternalKnowledgeMCPServer, allowed_tools: set[str], tenant_id: str)` ที่มีเมธอด `call_tool(name, arguments)` ซึ่ง: (1) ตรวจ allowlist ก่อน (ไม่อนุญาตคืน `{\"ok\": False, \"error\": \"tool_not_allowed\"}` โดยไม่เรียก server), (2) บังคับฉีด `tenant_id` ของ client ทับลงไปใน arguments เสมอ (กัน LLM แอบเปลี่ยน tenant), และ (3) คืน `{\"ok\": True, \"data\": ...}`",
      "เพิ่มเมธอด `SafeMCPClient.get_policy(slug: str) -> dict[str, str]` ที่เรียก `server.read_resource(f\"kb://policy/{slug}\")` และยืนยันด้วย `capsys` ว่าไม่มีข้อความใดออก `stdout`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day116.py",
      code: `from __future__ import annotations

import json
import re
import sqlite3
import sys
from pathlib import Path
from typing import Any
from pydantic import BaseModel

POLICY_URI_RE = re.compile(r"^kb://policy/([a-z0-9-]+)$")


class OrderLookupResult(BaseModel):
    order_id: str
    found: bool
    status: str = "not_found"
    customer_name: str = ""
    amount_thb: int = 0


def init_order_db(db_path: Path) -> None:
    """สร้างตาราง orders และเติมข้อมูลตัวอย่าง 2 tenants ด้วย parameterized SQL"""
    # TODO: สร้างตาราง orders และเติม INV-2026-009 (acme_th) และ INV-2026-021 (beta_th)
    raise NotImplementedError


class InternalKnowledgeMCPServer:
    def __init__(self, db_path: Path, policies: dict[str, str]) -> None:
        self.db_path = db_path
        self.policies = policies
        self.tool_call_count = 0

    def _log(self, event: str, **fields: Any) -> None:
        print(json.dumps({"event": event, **fields}, ensure_ascii=False), file=sys.stderr)

    def list_tools(self) -> list[dict[str, str]]:
        return [
            {"name": "lookup_order", "risk": "read"},
            {"name": "delete_order", "risk": "write"},
        ]

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        # TODO: เพิ่ม self.tool_call_count, รองรับ lookup_order ด้วย SQLite mode=ro + ? placeholder + tenant_id
        # TODO: log ลง stderr และคืน OrderLookupResult(...).model_dump()
        raise NotImplementedError

    def read_resource(self, uri: str) -> dict[str, str]:
        # TODO: validate uri ด้วย POLICY_URI_RE (ผิด -> ValueError), หาใน self.policies (ไม่พบ -> KeyError), log ลง stderr
        raise NotImplementedError


class SafeMCPClient:
    def __init__(
        self,
        server: InternalKnowledgeMCPServer,
        allowed_tools: set[str],
        *,
        tenant_id: str,
    ) -> None:
        self.server = server
        self.allowed_tools = set(allowed_tools)
        self.tenant_id = tenant_id

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        # TODO: 1) เช็ก allowlist (ถ้าไม่อยู่คืน {"ok": False, "error": "tool_not_allowed"} โดยไม่เรียก server)
        # TODO: 2) บังคับใส่ tenant_id=self.tenant_id ทับลงใน arguments copy แล้วเรียก self.server.call_tool(...)
        raise NotImplementedError

    def get_policy(self, slug: str) -> dict[str, str]:
        # TODO: เรียก self.server.read_resource(f"kb://policy/{slug}")
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day116.py",
      code: `import sqlite3
import pytest
from exercise_day116 import (
    InternalKnowledgeMCPServer,
    SafeMCPClient,
    init_order_db,
)

POLICIES = {
    "refund": "# นโยบายคืนเงิน\\nขอคืนเงินได้ภายใน 7 วันหลังได้รับสินค้า",
    "shipping": "# นโยบายจัดส่ง\\nจัดส่งภายใน 1-2 วันทำการ",
}


def test_lookup_order_happy_path_and_tenant_acl(tmp_path):
    db_path = tmp_path / "orders.db"
    init_order_db(db_path)
    server = InternalKnowledgeMCPServer(db_path, POLICIES)

    acme_client = SafeMCPClient(server, allowed_tools={"lookup_order"}, tenant_id="acme_th")
    beta_client = SafeMCPClient(server, allowed_tools={"lookup_order"}, tenant_id="beta_th")

    own = acme_client.call_tool("lookup_order", {"order_id": "INV-2026-009"})
    assert own["ok"] is True
    assert own["data"]["found"] is True
    assert own["data"]["status"] == "paid"

    # แม้พยายามส่ง tenant_id ของคนอื่นมาใน arguments Client ต้องบังคับใช้ tenant ของตัวเองเสมอ
    spoofed = beta_client.call_tool("lookup_order", {"order_id": "INV-2026-009", "tenant_id": "acme_th"})
    assert spoofed["ok"] is True
    assert spoofed["data"]["found"] is False


def test_sql_injection_payload_is_neutralized(tmp_path):
    db_path = tmp_path / "orders.db"
    init_order_db(db_path)
    server = InternalKnowledgeMCPServer(db_path, POLICIES)
    client = SafeMCPClient(server, allowed_tools={"lookup_order"}, tenant_id="acme_th")

    for payload in ["' OR '1'='1", "INV-2026-009'; DROP TABLE orders; --"]:
        res = client.call_tool("lookup_order", {"order_id": payload})
        assert res["ok"] is True
        assert res["data"]["found"] is False

    # ยืนยันว่าตาราง orders ยังอยู่ครบไม่ถูกทำลาย
    with sqlite3.connect(db_path) as conn:
        count = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    assert count >= 2


def test_allowlist_blocks_write_tool_before_reaching_server(tmp_path):
    db_path = tmp_path / "orders.db"
    init_order_db(db_path)
    server = InternalKnowledgeMCPServer(db_path, POLICIES)
    client = SafeMCPClient(server, allowed_tools={"lookup_order"}, tenant_id="acme_th")

    blocked = client.call_tool("delete_order", {"order_id": "INV-2026-009"})
    assert blocked == {"ok": False, "error": "tool_not_allowed"}
    assert server.tool_call_count == 0


def test_policy_resource_lookup_and_traversal_guard(tmp_path):
    db_path = tmp_path / "orders.db"
    init_order_db(db_path)
    server = InternalKnowledgeMCPServer(db_path, POLICIES)
    client = SafeMCPClient(server, allowed_tools={"lookup_order"}, tenant_id="acme_th")

    doc = client.get_policy("refund")
    assert doc["uri"] == "kb://policy/refund"
    assert "7 วัน" in doc["text"]

    with pytest.raises(ValueError):
        server.read_resource("kb://policy/../secret")
    with pytest.raises(KeyError):
        client.get_policy("nonexistent")


def test_stdio_hygiene_keeps_stdout_completely_clean(tmp_path, capsys):
    db_path = tmp_path / "orders.db"
    init_order_db(db_path)
    server = InternalKnowledgeMCPServer(db_path, POLICIES)
    client = SafeMCPClient(server, allowed_tools={"lookup_order"}, tenant_id="acme_th")

    client.call_tool("lookup_order", {"order_id": "INV-2026-009"})
    client.get_policy("shipping")

    captured = capsys.readouterr()
    assert captured.out == ""
    assert "lookup_order" in captured.err
    assert "read_resource" in captured.err
`,
    },
    selfCheck: [
      "`init_order_db` สร้างตารางและเติมข้อมูลด้วย parameterized SQL (`?` placeholder) และรันได้บน `tmp_path` ทุกครั้ง",
      "`lookup_order` เปิด SQLite ด้วย `mode=ro` และ filter ทั้ง `order_id = ? AND tenant_id = ?` กัน SQL Injection ได้ 100%",
      "`SafeMCPClient` บังคับทับ `tenant_id` ด้วยค่าจาก session ของ Client เอง (แม้ใน `arguments` จะพยายามปลอม `tenant_id`)",
      "`delete_order` ถูกบล็อกโดย Allowlist ของ Client (`server.tool_call_count == 0`)",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ (รวม `capsys` stdout hygiene check) และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 5 integration tests ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `SafeMCPClient.call_tool` ให้คัดลอก dict ก่อนแล้วทับค่า tenant: `scoped_args = {**arguments, \"tenant_id\": self.tenant_id}` เพื่อป้องกันไม่ให้ค่าที่ LLM ส่งมาแอบเปลี่ยน `tenant_id` ได้",
      },
      {
        body: "ใน `InternalKnowledgeMCPServer.call_tool` ใช้ `uri = f\"file:{self.db_path.as_posix()}?mode=ro\"` แล้วเปิดด้วย `sqlite3.connect(uri, uri=True)` (การใช้ `.as_posix()` ช่วยให้ใช้ได้ทั้งบน Windows, macOS และ Linux)",
      },
      {
        body: "โครงของ `init_order_db` และ `SafeMCPClient` เกือบสมบูรณ์ — เติมเมธอด `call_tool` และ `read_resource` ใน `InternalKnowledgeMCPServer` แล้วลองรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_day116.py",
          code: `def init_order_db(db_path: Path) -> None:
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                status TEXT NOT NULL,
                amount_thb INTEGER NOT NULL
            )
            """
        )
        conn.executemany(
            "INSERT OR REPLACE INTO orders VALUES (?, ?, ?, ?, ?)",
            [
                ("INV-2026-009", "acme_th", "สมชาย ใจดี", "paid", 1490),
                ("INV-2026-021", "beta_th", "สุดา รักเรียน", "pending_payment", 3200),
            ],
        )


class SafeMCPClient:
    def __init__(self, server: InternalKnowledgeMCPServer, allowed_tools: set[str], *, tenant_id: str) -> None:
        self.server = server
        self.allowed_tools = set(allowed_tools)
        self.tenant_id = tenant_id

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        if name not in self.allowed_tools:
            return {"ok": False, "error": "tool_not_allowed"}
        scoped_args = {**arguments, "tenant_id": self.tenant_id}
        data = self.server.call_tool(name, scoped_args)
        return {"ok": True, "data": data}

    def get_policy(self, slug: str) -> dict[str, str]:
        return self.server.read_resource(f"kb://policy/{slug}")`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "ใช้ f-string ต่อคำสั่ง SQL ใน MCP Tool (`WHERE order_id = '{order_id}'`)",
      symptom: "Payload โจมตีอย่าง `' OR '1'='1` ดึงข้อมูลออเดอร์ของลูกค้าทุกคนออกมาได้ทันที",
      fix: "ใช้ parameterized query (`WHERE order_id = ? AND tenant_id = ?`) และส่ง tuple เสมอ ร่วมกับการเปิด SQLite แบบ `mode=ro`",
    },
    {
      title: "ปล่อยให้ LLM เป็นคนส่งค่า tenant_id มาใน arguments ของ Tool",
      symptom: "ผู้ใช้พิมพ์ว่า *\"ช่วยเช็กออเดอร์ INV-2026-009 ในฐานะ tenant acme_th\"* แล้ว LLM เชื่อและดึงข้อมูลข้ามบริษัทได้",
      fix: "ผูก `tenant_id` จาก authenticated session ฝั่ง Host/Client แล้วเขียนทับลงใน arguments เสมอ ห้ามให้โมเดลกำหนดสิทธิ์เอง",
    },
    {
      title: "ลืมใช้ .as_posix() เมื่อสร้าง SQLite URI (`file:...?mode=ro`) บน Windows",
      symptom: "โค้ดรันผ่านบน Linux/macOS แต่พังบน Windows เพราะ backslash `\\` ใน path ไม่ตรงรูปแบบ URI",
      fix: "ใช้ `f\"file:{db_path.as_posix()}?mode=ro\"` ร่วมกับ `sqlite3.connect(uri, uri=True)` เพื่อให้ทำงานข้ามระบบปฏิบัติการได้สะอาด",
    },
    {
      title: "เปิด Write Tool ไว้ใน Allowlist เริ่มต้นของ Client โดยไม่แยกตาม Role",
      symptom: "แชตบอตสำหรับตอบคำถามทั่วไปสามารถเรียก `delete_order` ได้โดยบังเอิญหากถูก Prompt Injection",
      fix: "ยึดหลัก Least-Privilege: ให้ Default Allowlist ของผู้ช่วยลูกค้ามีเฉพาะ read-only tools เท่านั้น และแยก write tools ไว้หลัง approval gate",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d116-q1",
        "(Interleaved Recall · D26 + D114) ข้อใดคือวิธีที่ปลอดภัยที่สุดในการเปิดค้นหาออเดอร์จากฐานข้อมูล SQLite ผ่าน MCP Server?",
        [
          ["เปิด Tool `run_sql(query)` แล้วสั่งใน System Prompt ว่าห้ามรัน `DELETE`", "System Prompt ป้องกัน Prompt Injection ไม่ได้ 100% และละเมิด Least-Privilege"],
          ["ใช้ `f\"SELECT * FROM orders WHERE order_id = '{order_id}'\"` เพราะเรามี `SELECT` อย่างเดียว", "f-string ยังถูก SQL Injection (`' OR '1'='1`) ดึงข้อมูลทั้งตารางได้"],
          [
            "เปิดเฉพาะ Tool แคบ ๆ (`lookup_order`) ที่เชื่อมต่อ SQLite ด้วย `mode=ro` และใช้ parameterized query (`?`) พร้อมบังคับ `tenant_id`",
            "ถูก — ป้องกันซ้อนกัน 3 ชั้น: สิทธิ์ระดับ Tool, Parameterized SQL + Read-Only mode, และ Tenant ACL",
          ],
          ["แปลงฐานข้อมูลทั้งหมดเป็นข้อความแล้วยัดลง System Prompt ทุกครั้ง", "ไม่ปลอดภัยด้าน ACL, เปลือง token มหาศาล และข้อมูลไม่อัปเดต"],
        ],
        "C",
        "การผสมผสาน Narrow Tool + SQLite `mode=ro` + Parameterized Query (`?`) + `tenant_id` scoping คือมาตรฐาน Defense-in-Depth สำหรับฐานข้อมูลหลัง MCP",
        "องค์ประกอบ 3 อย่างที่ทำให้ SQLite Lookup Tool ใน MCP ปลอดภัยจาก SQL Injection และ Data Leakage คืออะไร?",
        "1) เปิดเฉพาะ Narrow Tool (ไม่เปิด raw SQL), 2) ใช้ SQLite `mode=ro` + Parameterized Query (`?`), 3) บังคับ `tenant_id` ACL จากฝั่ง Host/Client",
      ),
      mc(
        "d116-q2",
        "(Interleaved Recall · D107 + D115) ค่า `tenant_id` ที่ใช้กรองข้อมูลลูกค้าใน `lookup_order` ควรถูกกำหนดมาจากที่ใด?",
        [
          ["ให้ LLM อ่านจากข้อความแชตของผู้ใช้แล้วกรอกลง JSON arguments เอง", "อันตรายมาก — ผู้ใช้หรือ Prompt Injection แอบอ้างชื่อบริษัทอื่นได้ทันที"],
          [
            "ฝั่ง Host/Client ที่ยืนยันตัวตนผู้ใช้แล้วเป็นผู้ผูก `tenant_id` ใส่ให้ในโค้ด (และทับค่าที่ LLM อาจส่งมา)",
            "ถูก — ข้อมูลระบุตัวตนและขอบเขตสิทธิ์ (ACL) ต้องมาจากระบบ Auth ฝั่ง Host นอกเหนือการควบคุมของ LLM เสมอ",
          ],
          ["สุ่มเลือกจากฐานข้อมูลตอนเริ่มโปรแกรม", "จะทำให้ลูกค้าเห็นข้อมูลผิดบริษัท"],
          ["เก็บไว้ใน `description` ของ MCP Tool", "`description` เป็นข้อความสาธารณะสำหรับโมเดล ไม่ใช่กลไกบังคับสิทธิ์ต่อผู้ใช้"],
        ],
        "B",
        "เช่นเดียวกับ `approved` ใน HITL ค่า `tenant_id` เป็นขอบเขตความปลอดภัยที่ต้องควบคุมโดยโค้ดฝั่ง Host/Client เท่านั้น ห้ามปล่อยให้ LLM กำหนดเอง",
        "ทำไม `tenant_id` จึงต้องถูกฉีดจากฝั่ง Host/Client แทนที่จะให้ LLM ส่งมาใน arguments เอง?",
        "เพื่อป้องกันไม่ให้ผู้ใช้หรือ Prompt Injection สั่งให้โมเดลเปลี่ยน `tenant_id` เพื่อขโมยข้อมูลข้ามบริษัท",
      ),
      mc(
        "d116-q3",
        "(Interleaved Recall · D113 + D114) ในระบบผู้ช่วยลูกค้าที่มีทั้ง 'ค้นหาออเดอร์ตามรหัสใน SQLite' และ 'อ่านเอกสารนโยบายคืนเงินคงที่' การจับคู่ MCP Primitive ข้อใดเหมาะสมที่สุด?",
        [
          ["ทั้งคู่เป็น MCP Resource เพราะอ่านอย่างเดียวเหมือนกัน", "การค้นหาที่มีพารามิเตอร์ dynamic อย่าง `lookup_order` และ structured lookup เหมาะกับ Tool ส่วนเอกสารอ้างอิงคงที่เหมาะกับ Resource"],
          [
            "`lookup_order` เป็น **Tool** (read-only) และ `kb://policy/{slug}` เป็น **Resource** (read-only URI context)",
            "ถูก — แยกการค้นหาข้อมูลเชิงโครงสร้างแบบมีพารามิเตอร์ (Tool) ออกจากเอกสารอ้างอิงคงที่ที่อ้างอิงด้วย URI (Resource) ได้อย่างชัดเจน",
          ],
          ["`lookup_order` เป็น Prompt และนโยบายเป็น Write Tool", "กลับกันและไม่ตรงบทบาทของแต่ละ Primitive"],
          ["ทั้งคู่ต้องรันผ่าน `print()` ออก `stdout` เพื่อความเร็ว", "การ `print()` ออก `stdout` จะทำลายสตรีม JSON-RPC ในโหมด `stdio`"],
        ],
        "B",
        "การจับคู่ `lookup_order` เป็น Read-Only Tool และ `kb://policy/{slug}` เป็น Read-Only Resource ช่วยให้สถาปัตยกรรมสะอาด แคชเอกสารง่าย และแยก audit policy ชัดเจน",
        "ในระบบ Order + Thai KB ควรแบ่งอะไรเป็น MCP Tool และอะไรเป็น MCP Resource?",
        "ให้การค้นหาออเดอร์ (`lookup_order`) เป็น Read-Only Tool และให้เอกสารนโยบายคงที่ (`kb://policy/{slug}`) เป็น Read-Only Resource",
      ),
      mc(
        "d116-q4",
        "(Interleaved Recall · D114 + D115) ระหว่างการรัน Integration Test ของ MCP Server คุณควรใช้ `pytest` fixture คู่ใดเพื่อตรวจทั้งฐานข้อมูลแยกอิสระและความสะอาดของ `stdio`?",
        [
          ["`monkeypatch` สำหรับสร้างฐานข้อมูล และ `print` สำหรับตรวจ stdout", "`monkeypatch` ไม่ได้สร้างโฟลเดอร์ฐานข้อมูลชั่วคราว และ `print` ไม่ได้จับ stdout"],
          [
            "`tmp_path` (สร้างไฟล์ SQLite แยกอิสระต่อเทสต์) และ `capsys` (ตรวจว่า `captured.out == \"\"` และ log ออกเฉพาะ `captured.err`)",
            "ถูก — ทั้งสองเป็น built-in fixture ของ pytest ที่ทำให้ Integration Test สะอาด เร็ว และจับบั๊ก stdio hygiene ได้ทันที",
          ],
          ["`asyncio` และ `json` เป็น fixture หลักของ pytest", "ทั้งสองเป็นโมดูลมาตรฐานของ Python ไม่ใช่ pytest fixture"],
          ["ไม่ต้องใช้ fixture แต่ต่อเข้าฐานข้อมูล Production จริงเพื่อความสมจริง", "ห้ามรัน automated test กับฐานข้อมูล Production เด็ดขาด"],
        ],
        "B",
        "`tmp_path` ช่วยให้ฐานข้อมูล SQLite สะอาดใหม่เอี่ยมทุกเทสต์ และ `capsys` ช่วยการันตีว่าไม่มีข้อความใดเล็ดลอดออก `stdout` ของ MCP Server",
        "pytest built-in fixture สองตัวใดที่มีประโยชน์ที่สุดสำหรับทดสอบ Local SQLite MCP Server?",
        "`tmp_path` สำหรับสร้างไฟล์ฐานข้อมูล SQLite แยกอิสระในแต่ละเทสต์ และ `capsys` สำหรับตรวจสอบว่า `stdout` ว่างสนิทและ log ออกทาง `stderr` เท่านั้น",
      ),
    ],
  },

  takeaways: [
    "**Defense-in-Depth สำหรับ SQLite + MCP**: ผสาน Narrow Read-Only Tool + SQLite `mode=ro` + Parameterized Query (`?`) + `tenant_id` scoping จากฝั่ง Host/Client",
    "**แยก Primitive ให้ถูกงาน**: ใช้ `lookup_order` เป็น Read-Only Tool และใช้ `kb://policy/{slug}` เป็น Read-Only {{mcp-resource}} ที่ตรวจ URI pattern อย่างเข้มงวด",
    "**Client-Side Guardrails**: บังคับ Allowlist และฉีด `tenant_id` ฝั่ง Client เสมอ เพื่อกันทั้ง Server Drift, Write Tool ที่ไม่ได้รับอนุญาต และการปลอมตัวข้าม tenant",
    "**Integration Test ที่รันได้ทุกที่**: ใช้ `tmp_path` + `capsys` ใน {{pytest}} ทดสอบ SQL Injection, Tenant ACL, Allowlist และ `stdout` hygiene ในเสี้ยววินาที — พร้อมก้าวสู่ **LangGraph Agent Loops** ใน Block B30!",
  ],

  reviewCards: [
    rc(
      "d116-rc-1",
      "สรุป 4 ด่านความปลอดภัยเมื่อเปิดฐานข้อมูล SQLite ให้แอป AI ใช้งานผ่าน MCP",
      "1) Client Allowlist + Timeout, 2) Host-enforced tenant_id (ไม่ให้ LLM กรอกเอง), 3) Narrow Read-Only Tool + SQLite `mode=ro` + Parameterized `?`, 4) `stderr`-only logging (stdout สะอาด 100%)",
    ),
    rc(
      "d116-rc-2",
      "ทำไมจึงควรเปิด SQLite ด้วย `sqlite3.connect(f\"file:{db_path.as_posix()}?mode=ro\", uri=True)` ใน Read-Only MCP Tool?",
      "เพื่อบังคับสิทธิ์อ่านอย่างเดียวตั้งแต่ระดับ SQLite engine (ปฏิเสธคำสั่งแก้ไข/ลบข้อมูล) และใช้ `.as_posix()` ให้ URI ทำงานได้ทั้งบน Windows, macOS และ Linux",
    ),
    rc(
      "d116-rc-3",
      "Integration Test ของ SQLite + KB MCP Server ควรทดสอบ negative security cases ใดบ้างเป็นอย่างน้อย?",
      "1) SQL Injection (`' OR '1'='1`), 2) Cross-tenant ACL spoofing, 3) Write tool ที่ไม่อยู่ใน Client Allowlist, 4) URI path traversal (`../`), 5) `capsys` ตรวจ `stdout == \"\"`",
    ),
  ],

  sources: [
    { label: "Python Official Docs — sqlite3 (Parameterized Queries & URI mode=ro)", href: "https://docs.python.org/3/library/sqlite3.html" },
    { label: "MCP Concepts — Tools", href: "https://modelcontextprotocol.io/docs/concepts/tools" },
    { label: "MCP Concepts — Resources", href: "https://modelcontextprotocol.io/docs/concepts/resources" },
    { label: "OWASP SQL Injection Prevention Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
  ],

  glossary: ["mcp", "mcp-resource", "sqlite", "tool-calling", "acl", "pydantic", "pytest", "fixture"],
});
