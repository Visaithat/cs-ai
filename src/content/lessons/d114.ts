import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D114 — Phase 4 / Block B29
 * Building a Local MCP Server (Tools & Resources in Python)
 */
export const d114: Lesson = defineLesson({
  day: 114,
  titleTh: "สร้าง Local MCP Server ด้วย Python: ประกาศ Tools, Resources และรักษาความสะอาด stdout",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · สร้าง MCP Server ด้วย FastMCP, แยก @mcp.tool() กับ @mcp.resource() และส่ง log ออก stderr เท่านั้น",
  icon: "server",
  visual: {
    id: "mcp-server-client",
    title: "Local MCP Server (Tools & Resources) & Safe Client Sandbox",
    caption: "สลับดูการประกาศ @mcp.tool() / @mcp.resource() ฝั่ง Server กับการเชื่อมแบบ Allowlist + Timeout ฝั่ง Client",
    alt: "แผนภาพ Local MCP Server และ Safe MCP Client",
  },
  requiresApiKey: false,
  tools: ["MCP Python SDK", "FastMCP", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ห่อแหล่งข้อมูลภายในเป็น Tools และ Resources มาตรฐาน",
      body: "แทนที่จะเขียนโค้ดดึงฐานข้อมูลและคลังนโยบายซ้ำในทุกแอป AI เราสร้าง Local {{mcp}} Server หนึ่งตัวที่เปิดเผยทั้งการค้นหาและเอกสารอ่านอย่างเดียวตามสเปกกลาง",
      lessonNote: "วันนี้คุณจะสร้าง Python MCP Server ด้วย `FastMCP` ที่แยก `@mcp.tool()` สำหรับ lookup และ `@mcp.resource(\"kb://...\")` สำหรับอ่านเอกสารคงที่",
    },
    {
      node: 2,
      heading: "ให้ Type Hints และ Pydantic สร้าง JSON Schema ให้โมเดลอัตโนมัติ",
      body: "LLM พึ่งพาชื่อเครื่องมือ คำอธิบาย และ JSON {{schema}} ในการตัดสินใจเรียก {{tool-calling}} หาก schema คลุมเครือหรือคืนสตริงดิบ โมเดลจะเดาพารามิเตอร์ผิดบ่อย",
      lessonNote: "การใช้ {{type-hint}} ชัดเจนและคืนค่าเป็น {{pydantic}} `BaseModel` ทำให้ได้ทั้ง {{validation}} และ {{structured-output}} ที่ตรวจสอบได้",
    },
    {
      node: 4,
      heading: "รัน Local Server ผ่าน stdio โดยไม่ทำลายช่องทาง JSON-RPC",
      body: "ในโหมด `stdio` ตัว Host จะอ่านข้อความ JSON-RPC จาก `stdout` ของโปรเซส Server ทุกไบต์ที่พิมพ์เกินออกมาจะทำให้การสื่อสารล่มทันที",
      lessonNote: "กฎเหล็กของวันนี้คือ **ห้าม `print()` ออก `stdout` เด็ดขาด** — ทุก log ของ Server ต้องไหลไปที่ `sys.stderr` เท่านั้น",
    },
    {
      node: 5,
      heading: "สังเกตการณ์และดีบัก Server ผ่าน Structured Log บน stderr",
      body: "เมื่อ Server ทำงานเป็น subprocess การดีบักต้องอาศัย structured log ที่มีชื่อ tool, URI และสถานะผลลัพธ์โดยไม่รบกวน protocol stream",
      lessonNote: "ในแบบฝึกหัดวันนี้ คุณจะใช้ `capsys` ใน {{pytest}} พิสูจน์ว่า `stdout` ว่างสนิทและ log ถูกส่งออก `stderr` ครบถ้วน",
    },
  ],

  objectives: [
    "**สร้าง Local {{mcp}} Server** ด้วย `FastMCP` จาก `mcp` Python SDK โดยประกาศ `@mcp.tool()` ที่มี {{type-hint}} และคืนค่าแบบ {{structured-output}} ผ่าน {{pydantic}}",
    "**ออกแบบ `@mcp.resource(\"kb://...\")`** สำหรับ {{mcp-resource}} แบบ read-only พร้อมตรวจ URI scheme และป้องกัน path traversal อย่างเคร่งครัด",
    "**บังคับวินัย `stdio` Hygiene** โดยไม่พิมพ์ข้อความใด ๆ ออก `stdout`, ส่ง log ทั้งหมดไปที่ `sys.stderr` และเขียน {{pytest}} ตรวจสอบได้อัตโนมัติ",
  ],

  prerequisites: [
    "เข้าใจบทบาท Host, Client, Server และ Tools vs Resources ของ {{mcp}} (แนะนำ Day 113)",
    "ใช้งาน {{pydantic}} `BaseModel` และ {{type-hint}} ใน Python (Day 1–3)",
    "ใช้งาน `logging` หรือ {{structlog}} พื้นฐาน และรัน `pytest` ได้ (Day 6, Day 9)",
    "ไม่ต้องใช้ API key — สร้างและทดสอบ Local MCP Server บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "ติดตั้ง `mcp` Python SDK (ซึ่งมาพร้อม `FastMCP`) และ `pydantic` สำหรับสร้าง Local MCP Server พร้อม `pytest` และ `ruff` สำหรับตรวจสอบโค้ด",
    commands: `uv init ai-day114 && cd ai-day114
uv add mcp pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day114` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `mcp`, `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["ready", "ตรวจว่า `uv run python -c \"from mcp.server.fastmcp import FastMCP; print('ok')\"` แสดง `ok`"],
    ],
    note: "โจทย์ฝึกปฏิบัติท้ายบทออกแบบให้รันทดสอบกับ `pytest` ได้ทันทีแบบ 100% ออฟไลน์โดยไม่ติดความต่างของเวอร์ชันย่อย และสามารถต่อยอดเปิดด้วย `FastMCP.run(transport=\"stdio\")` ได้ทันที",
  },

  concepts: [
    {
      id: "fastmcp-typed-tools",
      title: "1 · สร้าง MCP Server ด้วย FastMCP: จาก Python Function สู่ JSON Schema อัตโนมัติ",
      paragraphs: [
        "ใน `mcp` Python SDK อย่างเป็นทางการ คลาส **`FastMCP`** ช่วยให้คุณสร้าง {{mcp}} Server ได้ในไม่กี่บรรทัดคล้ายการเขียน route ใน FastAPI เพียงแปะ decorator `@mcp.tool()` บนฟังก์ชัน Python ที่มี {{type-hint}} และ docstring ที่ชัดเจน SDK จะสร้าง JSON {{schema}} สำหรับคำขอ `tools/list` และทำ input {{validation}} ให้โดยอัตโนมัติ",
        "นอกจาก input แล้ว **ค่าที่คืนกลับ (return value)** ก็สำคัญไม่แพ้กัน แทนที่จะคืนข้อความยาว ๆ แบบคละรูปแบบ การคืนค่าเป็น {{pydantic}} {{basemodel}} (หรือ `dict` ที่มีโครงสร้างคงที่) ช่วยให้ทั้งฝั่ง Client และ LLM อ่านฟิลด์สำคัญอย่าง `status`, `amount_thb` และ `found` ได้แม่นยำโดยไม่ต้องเดา",
        "หลักการออกแบบที่ดีคือแยก **ฟังก์ชันธุรกิจบริสุทธิ์ (pure domain functions)** ออกจากชั้น MCP Server wrapper เพื่อให้คุณยูนิตเทสต์ตรรกะการค้นหาและการตรวจสิทธิ์ด้วย {{pytest}} ได้ตรง ๆ โดยไม่ต้องเปิด subprocess ทุกครั้ง",
      ],
      analogy:
        "FastMCP เหมือนพนักงานต้อนรับที่หยิบเมนูอาหาร (type hints + docstring) ของเชฟไปพิมพ์เป็นแคตตาล็อกมาตรฐาน (JSON Schema) ให้ลูกค้าทุกโต๊ะอ่านเข้าใจตรงกันโดยเชฟไม่ต้องมานั่งแปลเอง",
      code: {
        language: "python",
        filename: "fastmcp_tool_demo.py",
        code: `from pydantic import BaseModel, Field
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("thai-support-server")


class OrderStatus(BaseModel):
    order_id: str = Field(description="รหัสคำสั่งซื้อ เช่น INV-2026-009")
    found: bool
    status: str
    amount_thb: int = 0


ORDERS = {
    "INV-2026-009": {"status": "pending_payment", "amount_thb": 1490},
}


@mcp.tool()
def lookup_order(order_id: str) -> OrderStatus:
    """ค้นหาสถานะคำสั่งซื้อแบบอ่านอย่างเดียวจากรหัสออเดอร์"""
    row = ORDERS.get(order_id.strip().upper())
    if row is None:
        return OrderStatus(order_id=order_id, found=False, status="not_found")
    return OrderStatus(order_id=order_id.strip().upper(), found=True, **row)`,
        caption: "`@mcp.tool()` อ่าน docstring และ type annotations ไปสร้าง JSON Schema พร้อมคืนโครงสร้างข้อมูลจาก Pydantic",
      },
      whyTitle: "Why this matters — Schema คมชัด = LLM เรียกเครื่องมือแม่นยำขึ้น",
      whyParagraphs: [
        "ในระบบ {{tool-calling}} จริง ข้อผิดพลาดส่วนใหญ่ไม่ได้เกิดจากตัวฐานข้อมูล แต่เกิดจากชื่อพารามิเตอร์กำกวมหรือ docstring ที่ไม่อธิบายรูปแบบข้อมูล (เช่น ไม่บอกว่ารหัสออเดอร์ต้องขึ้นต้นด้วย `INV-`)",
        "การคืนค่าแบบ {{structured-output}} ที่แยก `found: false` ออกจากข้อผิดพลาดระบบยังช่วยให้ LLM ตอบผู้ใช้ตรงไปตรงมาแทนการแต่งข้อมูลขึ้นเอง",
      ],
    },
    {
      id: "mcp-resources-readonly",
      title: "2 · ประกาศ @mcp.resource(\"kb://...\") สำหรับข้อมูลอ่านอย่างเดียว",
      paragraphs: [
        "เมื่อข้อมูลเป็นเอกสารอ้างอิง นโยบายองค์กร หรือคู่มือแบบ read-only ที่ระบุตำแหน่งได้ชัดเจนด้วย URI เราควรเปิดเผยเป็น **{{mcp-resource}}** ด้วย decorator `@mcp.resource(\"kb://policy/{slug}\")` แทนที่จะทำเป็น Tool",
        "ข้อดีของ URI Template เช่น `kb://policy/{slug}` คือ Host หรือผู้ใช้สามารถเลือกอ่านและแนบเอกสารเป็นบริบทให้โมเดลได้ตรง ๆ (`resources/read`) โดยไม่ก่อให้เกิด side effect และสามารถทำ cache ตาม URI ได้อย่างปลอดภัย",
        "อย่างไรก็ตาม ทุก URI ที่รับเข้ามายังถือเป็น **untrusted input** เสมอ ฝั่ง Server จึงต้องตรวจ scheme (`kb://policy/`), ปฏิเสธอักขระอันตรายอย่าง `..` หรือ `/` เพื่อกัน path traversal และจำกัดเฉพาะรายการที่อนุญาต (allowlist ของเอกสาร)",
      ],
      analogy:
        "Resource URI เหมือนเลขหมู่หนังสือในห้องสมุด (`kb://policy/refund`): ใครขอเลขหมู่ที่อยู่ในชั้นวางก็หยิบอ่านได้อย่างเดียว แต่ถ้าขอทางลัดออกไปหลังร้าน (`../secrets`) บรรณารักษ์จะปฏิเสธทันที",
      code: {
        language: "python",
        filename: "fastmcp_resource_demo.py",
        code: `import re
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("thai-kb-server")

POLICIES: dict[str, str] = {
    "refund": "# นโยบายคืนเงิน\\nขอคืนเงินได้ภายใน 7 วันหลังได้รับสินค้า พร้อมเลขคำสั่งซื้อ",
    "shipping": "# นโยบายจัดส่ง\\nจัดส่งภายใน 1–2 วันทำการในเขตกรุงเทพฯ และปริมณฑล",
}

SLUG_RE = re.compile(r"^[a-z0-9-]+$")


@mcp.resource("kb://policy/{slug}", mime_type="text/markdown")
def get_policy_doc(slug: str) -> str:
    """อ่านเอกสารนโยบายภาษาไทยแบบ read-only ตามชื่อ slug"""
    if not SLUG_RE.fullmatch(slug):
        raise ValueError(f"Invalid policy slug: {slug!r}")
    if slug not in POLICIES:
        raise KeyError(f"Policy not found: {slug}")
    return POLICIES[slug]`,
        caption: "ตรวจสอบ `slug` ด้วย regex แบบ {{fail-fast}} ก่อนค้นคืนเอกสาร เพื่อกัน path traversal และการส่ง URI ผิดรูปแบบ",
      },
      whyTitle: "Why this matters — แยกความเสี่ยงการอ่านข้อมูลออกจาก Action ที่เปลี่ยนสถานะ",
      whyParagraphs: [
        "การแยกเอกสารนโยบายออกมาเป็น {{mcp-resource}} ทำให้ทีมความปลอดภัยกำหนด policy ได้ง่าย: อนุญาต `resources/read` สำหรับ `kb://policy/*` โดยอัตโนมัติ ขณะที่ควบคุม `tools/call` เข้มงวดกว่า",
        "นอกจากนี้ Host ยังสามารถแสดงชื่อ URI แหล่งที่มาให้ผู้ใช้ตรวจสอบย้อนกลับได้ง่ายขึ้นเวลาอ้างอิงนโยบาย",
      ],
    },
    {
      id: "stdio-hygiene-stderr",
      title: "3 · กฎเหล็กของ stdio Transport: ห้าม print() ลง stdout — ส่ง Log ออก stderr เท่านั้น",
      paragraphs: [
        "ความผิดพลาดอันดับหนึ่งของนักพัฒนาที่เริ่มเขียน Local MCP Server ใน Python คือการเผลอใส่ `print(\"Server started!\")` หรือปล่อยให้ `logging` พิมพ์ออก `stdout` ในโหมด `stdio` เพราะ Host กับ Server สื่อสารข้อความ **JSON-RPC 2.0 ผ่าน `stdin`/`stdout` เท่านั้น**",
        "ทันทีที่มีตัวอักษรที่ไม่ใช่ JSON-RPC โผล่บน `stdout` แม้เพียงบรรทัดเดียว ตัว parser ฝั่ง MCP Client จะพังด้วย JSON decode error และตัดการเชื่อมต่อทันที วิธีที่ถูกต้องคือกำหนดให้ `logging` หรือ {{structlog}} เขียนลง **`sys.stderr`** เท่านั้น (และในกรณีจำเป็นจริง ๆ ให้ใช้ `print(..., file=sys.stderr)`)",
        "ระวังทางอ้อมด้วย: บางไลบรารี (เช่น ตัวดาวน์โหลดโมเดล หรือ progress bar) แอบพิมพ์ข้อความลง `stdout` ตอน import หรือตอนรัน ดังนั้นใน production server เราควรเขียน automated test ด้วย `capsys` ใน {{pytest}} เพื่อยืนยันว่าไม่มีไบต์ใดเล็ดลอดออก `stdout` เลย",
      ],
      analogy:
        "`stdout` เหมือนสายโทรศัพท์เฉพาะกิจที่คุยกันด้วยรหัสมอร์ส (JSON-RPC) เท่านั้น ถ้ามีคนแทรกตะโกนคุยเล่นลงสายเดียวกัน ผู้รับจะฟังรหัสผิดเพี้ยนทั้งประโยค — อยากจดบันทึกให้เขียนลงกระดาษอีกใบ (`stderr`) แทน",
      bullets: [
        "**ห้าม `print(...)` แบบไม่ระบุ `file=sys.stderr`** ในไฟล์ของ MCP Server ที่รันผ่าน `stdio`",
        "**ตั้งค่า `logging.StreamHandler(sys.stderr)`** (หรือ `structlog.PrintLoggerFactory(file=sys.stderr)`) ตั้งแต่บรรทัดแรกก่อนโหลดไลบรารีอื่น",
        "**คืน error แบบชัดเจน ไม่ปล่อยข้อมูลลับหลุด**: แปลงข้อผิดพลาดที่คาดเดาได้เป็น error message ที่สั้น ชัดเจน และบันทึกรายละเอียดเชิงเทคนิคลง `stderr` เท่านั้น",
      ],
      whyTitle: "Why this matters — บั๊ก stdio เป็นบั๊กที่ดีบักยากที่สุดถ้าไม่ตั้งวินัยตั้งแต่ Day 114",
      whyParagraphs: [
        "เมื่อ MCP Server ถูกเปิดเป็น subprocess ข้างหลัง IDE หรือ FastAPI Host ข้อความ `print()` จะไม่โผล่บนหน้าจอให้คุณเห็นตรง ๆ แต่จะกลายเป็น error ลึกลับว่า `Invalid JSON-RPC frame`",
        "การตั้งค่า `stderr`-only logger และเพิ่ม `capsys` test เพียง 5 บรรทัดช่วยกันปัญหานี้ขาดได้ตลอดทั้งโปรเจกต์",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ FastMCP กับการเขียน FastAPI / Express",
      body: [
        "โครงสร้างของ `FastMCP` ถูกออกแบบให้รู้สึกคุ้นเคยมากสำหรับคนที่เคยเขียน Backend Web API ด้วย FastAPI หรือ Express:",
      ],
      table: [
        ["@mcp.tool() + Pydantic return", "POST /rpc/... endpoint + typed JSON response"],
        ["@mcp.resource(\"kb://policy/{slug}\")", "GET /policies/:slug (read-only, cacheable)"],
        ["FastMCP(\"name\").run(transport=\"stdio\")", "app.listen() แต่รับ-ส่งผ่าน stdin/stdout แทน TCP port"],
        ["logging -> sys.stderr เท่านั้น", "แยก application logs ออกจากการส่ง response stream"],
      ],
    },
    student: {
      title: "First-Year Note — รู้จัก stdin, stdout และ stderr (Standard Streams)",
      body: [
        "ทุกโปรแกรมที่รันบนระบบปฏิบัติการ (Windows, macOS, Linux) มีช่องทางข้อความมาตรฐาน 3 ช่อง: **`stdin`** (ช่องรับข้อมูลเข้า), **`stdout`** (ช่องส่งผลลัพธ์หลัก — `print()` ปกติส่งออกช่องนี้) และ **`stderr`** (ช่องส่งข้อความแจ้งเตือนและ log)",
        "ในโหมด `stdio` ของ MCP ช่อง `stdout` ถูกจองไว้สำหรับข้อมูล JSON-RPC 100% ส่วน `stderr` แยกออกมาต่างหากเพื่อให้โปรแกรมแม่ (Host) แยกเก็บเป็นไฟล์ log หรือแสดงในหน้าต่างดีบักได้โดยไม่ชนกับข้อมูลหลัก",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง Local MCP Server สำหรับฝ่ายบริการลูกค้าภาษาไทย (`thai_support_server.py`) ที่มี 1 read-only Tool (`lookup_order`), 1 Policy Resource (`kb://policy/{slug}`), logger ที่ออก `stderr` เท่านั้น และโค้ดทดสอบว่า `stdout` สะอาด 100%",
    steps: [
      {
        title: "1 · ตั้งค่า stderr-only Logger และโครงสร้าง Structured Output ด้วย Pydantic",
        explain:
          "กำหนด logger ให้เขียน JSON log ลง `sys.stderr` เสมอ และสร้าง `OrderLookupResult` เป็น `BaseModel` เพื่อให้ผลลัพธ์ของ Tool มีโครงสร้างคงที่ทุกกรณี",
        code: {
          language: "python",
          filename: "thai_support_server.py",
          code: `import json
import sys
from typing import Any
from pydantic import BaseModel, Field


def log_stderr(event: str, **fields: Any) -> None:
    """เขียน structured log ลง stderr เท่านั้น ห้ามแตะ stdout"""
    record = {"event": event, **fields}
    print(json.dumps(record, ensure_ascii=False), file=sys.stderr)


class OrderLookupResult(BaseModel):
    order_id: str = Field(description="รหัสคำสั่งซื้อรูปแบบ INV-YYYY-NNN")
    found: bool
    status: str
    amount_thb: int = 0


log_stderr("server_init", name="thai-support-server")`,
        },
        output: `(stderr) {"event": "server_init", "name": "thai-support-server"}
(stdout) <empty>`,
      },
      {
        title: "2 · ประกาศ Tool และ Resource พร้อม Input Validation แบบ Fail-Fast",
        explain:
          "ตรวจรูปแบบ `order_id` และ `slug` ก่อนเข้าถึงข้อมูลจริง และเขียนฟังก์ชันให้สามารถลงทะเบียนเข้ากับ `FastMCP` หรือเรียกทดสอบตรง ๆ ใน `pytest` ได้",
        code: {
          language: "python",
          filename: "thai_support_server.py",
          code: `import re

ORDER_ID_RE = re.compile(r"^INV-\\d{4}-\\d{3}$")
SLUG_RE = re.compile(r"^[a-z0-9-]+$")

ORDERS = {
    "INV-2026-009": {"status": "paid", "amount_thb": 1490},
    "INV-2026-014": {"status": "shipped", "amount_thb": 890},
}

POLICIES = {
    "refund": "# นโยบายคืนเงิน\\nขอคืนเงินได้ภายใน 7 วันหลังได้รับสินค้า",
    "warranty": "# นโยบายรับประกัน\\nรับประกันสินค้าอิเล็กทรอนิกส์ 1 ปีเต็ม",
}


def lookup_order(order_id: str) -> OrderLookupResult:
    cleaned = order_id.strip().upper()
    if not ORDER_ID_RE.fullmatch(cleaned):
        log_stderr("tool_invalid_input", tool="lookup_order", order_id=order_id)
        raise ValueError("order_id must match INV-YYYY-NNN")

    row = ORDERS.get(cleaned)
    log_stderr("tool_called", tool="lookup_order", order_id=cleaned, found=row is not None)
    if row is None:
        return OrderLookupResult(order_id=cleaned, found=False, status="not_found")
    return OrderLookupResult(order_id=cleaned, found=True, **row)


def read_policy(slug: str) -> str:
    if not SLUG_RE.fullmatch(slug):
        raise ValueError("slug must contain only lowercase letters, digits, or hyphens")
    if slug not in POLICIES:
        raise KeyError(f"Unknown policy slug: {slug}")
    log_stderr("resource_read", uri=f"kb://policy/{slug}")
    return POLICIES[slug]`,
        },
        output: `(stderr) {"event": "tool_called", "tool": "lookup_order", "order_id": "INV-2026-009", "found": true}
(stderr) {"event": "resource_read", "uri": "kb://policy/refund"}`,
      },
      {
        title: "3 · ผูกฟังก์ชันเข้ากับ FastMCP และสั่งรันผ่าน stdio Transport",
        explain:
          "นำฟังก์ชันบริสุทธิ์มาลงทะเบียนกับ `FastMCP` ด้วย `mcp.tool()` และ `mcp.resource(...)` จากนั้นรันเฉพาะเมื่อเปิดไฟล์โดยตรงในบล็อก `if __name__ == \"__main__\":` เพื่อให้ import ไปเทสต์ได้โดยไม่ติด event loop",
        code: {
          language: "python",
          filename: "thai_support_server.py",
          code: `from mcp.server.fastmcp import FastMCP


def create_server() -> FastMCP:
    mcp = FastMCP("thai-support-server")
    mcp.tool()(lookup_order)
    mcp.resource("kb://policy/{slug}", mime_type="text/markdown")(read_policy)
    return mcp


if __name__ == "__main__":
    server = create_server()
    log_stderr("server_starting", transport="stdio")
    server.run(transport="stdio")`,
        },
        output: `(stderr) {"event": "server_starting", "transport": "stdio"}
# โปรเซสรอรับคำขอ JSON-RPC 2.0 ผ่าน stdin และตอบกลับผ่าน stdout เท่านั้น`,
      },
    ],
    gotcha:
      "จุดสังเกต: แยก `create_server()` ออกมาจาก `server.run(transport=\"stdio\")` เสมอ — ถ้าวาง `server.run(...)` ไว้ระดับบนสุดของไฟล์ การ `import` ไฟล์นั้นใน `pytest` จะทำให้เทสต์ค้างรอข้อมูลจาก `stdin` ทันที",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล Local MCP Server (`exercise_day114.py`) ที่รวม Pydantic structured output, `@mcp.tool()` handler, `kb://policy/{slug}` resource reader และระบบ log ลง `stderr` เท่านั้น พร้อมผ่านการตรวจ `stdio` hygiene ด้วย `capsys` ใน `pytest`",
    requirements: [
      "สร้าง `OrderInfo(BaseModel)` มีฟิลด์ `order_id: str`, `found: bool`, `status: str` และ `amount_thb: int = 0`",
      "สร้างฟังก์ชัน `log_event(event: str, **fields: Any) -> None` ที่พิมพ์ JSON 1 บรรทัดลง `sys.stderr` เท่านั้น (ห้ามเขียนออก `stdout` เด็ดขาด)",
      "สร้าง `lookup_order(order_id: str) -> OrderInfo` ที่ normalize ด้วย `.strip().upper()`, ตรวจรูปแบบ `^INV-\\d{4}-\\d{3}$` (ถ้าผิดโยน `ValueError`), คืน `OrderInfo` (พบ→ข้อมูลจริง, ไม่พบ→`found=False, status=\"not_found\"`) และบันทึก log ลง `stderr`",
      "สร้าง `read_policy_resource(uri: str) -> dict[str, str]` ที่รับเฉพาะ URI รูปแบบ `kb://policy/{slug}` โดย `slug` ต้องตรง `^[a-z0-9-]+$` (ถ้า scheme ผิดหรือมี `..` ให้โยน `ValueError`, ถ้าไม่พบ slug ในคลังให้โยน `KeyError`), คืน `{\"uri\": uri, \"mime_type\": \"text/markdown\", \"text\": ...}` และบันทึก log ลง `stderr`",
      "สร้าง `build_server_manifest() -> dict[str, list[str]]` คืน `{\"tools\": [\"lookup_order\"], \"resources\": [\"kb://policy/{slug}\"]}` และยืนยันว่าไม่มีฟังก์ชันใดพิมพ์ลง `stdout` เลย",
    ],
    starter: {
      language: "python",
      filename: "exercise_day114.py",
      code: `from __future__ import annotations

import json
import re
import sys
from typing import Any
from pydantic import BaseModel

ORDER_ID_RE = re.compile(r"^INV-\\d{4}-\\d{3}$")
POLICY_URI_RE = re.compile(r"^kb://policy/([a-z0-9-]+)$")

ORDERS: dict[str, dict[str, Any]] = {
    "INV-2026-009": {"status": "paid", "amount_thb": 1490},
    "INV-2026-015": {"status": "shipped", "amount_thb": 2590},
}

POLICIES: dict[str, str] = {
    "refund": "# นโยบายคืนเงิน\\nขอคืนเงินได้ภายใน 7 วันหลังได้รับสินค้า",
    "shipping": "# นโยบายจัดส่ง\\nจัดส่งภายใน 1-2 วันทำการ",
}


class OrderInfo(BaseModel):
    order_id: str
    found: bool
    status: str
    amount_thb: int = 0


def log_event(event: str, **fields: Any) -> None:
    """เขียน JSON structured log ลง sys.stderr เท่านั้น"""
    # TODO: พิมพ์ JSON ลง sys.stderr (ห้ามลง stdout)
    raise NotImplementedError


def lookup_order(order_id: str) -> OrderInfo:
    """Read-only MCP tool handler สำหรับค้นหาคำสั่งซื้อ"""
    # TODO: 1) strip + upper แล้ว validate ด้วย ORDER_ID_RE (ผิดรูปแบบ -> ValueError)
    # TODO: 2) ค้นหาใน ORDERS, log_event ลง stderr แล้วคืน OrderInfo
    raise NotImplementedError


def read_policy_resource(uri: str) -> dict[str, str]:
    """Read-only MCP resource handler สำหรับ URI รูปแบบ kb://policy/{slug}"""
    # TODO: 1) validate uri ด้วย POLICY_URI_RE (ผิดรูปแบบ/มี path traversal -> ValueError)
    # TODO: 2) ค้น slug ใน POLICIES (ไม่พบ -> KeyError), log_event ลง stderr แล้วคืน dict
    raise NotImplementedError


def build_server_manifest() -> dict[str, list[str]]:
    """คืนรายการ tools และ resource templates ที่ Server เปิดเผย"""
    # TODO: คืน {"tools": ["lookup_order"], "resources": ["kb://policy/{slug}"]}
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day114.py",
      code: `import json
import pytest
from exercise_day114 import (
    OrderInfo,
    build_server_manifest,
    lookup_order,
    read_policy_resource,
)


def test_lookup_order_found_and_not_found():
    found = lookup_order(" inv-2026-009 ")
    assert isinstance(found, OrderInfo)
    assert found.order_id == "INV-2026-009"
    assert found.found is True
    assert found.status == "paid"
    assert found.amount_thb == 1490

    missing = lookup_order("INV-2026-999")
    assert missing.found is False
    assert missing.status == "not_found"
    assert missing.amount_thb == 0


def test_lookup_order_rejects_malformed_id():
    with pytest.raises(ValueError):
        lookup_order("INV-26-9")
    with pytest.raises(ValueError):
        lookup_order("INV-2026-009; DROP TABLE orders")


def test_read_policy_resource_valid_and_security_guards():
    doc = read_policy_resource("kb://policy/refund")
    assert doc["uri"] == "kb://policy/refund"
    assert doc["mime_type"] == "text/markdown"
    assert "7 วัน" in doc["text"]

    with pytest.raises(ValueError):
        read_policy_resource("kb://policy/../secret")
    with pytest.raises(ValueError):
        read_policy_resource("file:///etc/passwd")
    with pytest.raises(KeyError):
        read_policy_resource("kb://policy/unknown-slug")


def test_stdio_hygiene_never_writes_to_stdout(capsys):
    lookup_order("INV-2026-009")
    read_policy_resource("kb://policy/shipping")

    captured = capsys.readouterr()
    assert captured.out == "", f"stdout must remain clean for JSON-RPC, got: {captured.out!r}"

    lines = [line for line in captured.err.strip().splitlines() if line]
    assert len(lines) >= 2
    parsed = [json.loads(line) for line in lines]
    assert any(item["event"] == "lookup_order" for item in parsed)
    assert any(item["event"] == "read_policy_resource" for item in parsed)


def test_manifest_lists_tool_and_resource():
    manifest = build_server_manifest()
    assert manifest == {
        "tools": ["lookup_order"],
        "resources": ["kb://policy/{slug}"],
    }
`,
    },
    selfCheck: [
      "`lookup_order` normalize ช่องว่าง/ตัวพิมพ์เล็ก และคืน `OrderInfo` ที่ผ่าน Pydantic validation ทั้งกรณีพบและไม่พบ",
      "`lookup_order` โยน `ValueError` ทันทีเมื่อรับ `order_id` ที่ไม่ตรงแพตเทิร์น `INV-YYYY-NNN`",
      "`read_policy_resource` ปฏิเสธ scheme อื่นและ path traversal (`../`) ด้วย `ValueError` และโยน `KeyError` เมื่อไม่พบ slug",
      "เทสต์ `test_stdio_hygiene_never_writes_to_stdout` ยืนยันว่า `captured.out == \"\"` และ `captured.err` เป็น JSON ถูกต้องทุกบรรทัด",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` (รวมถึง stdout hygiene check) และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `log_event` ใช้ `print(json.dumps({\"event\": event, **fields}, ensure_ascii=False), file=sys.stderr)` และตั้งชื่อ `event` ให้ตรงกับที่เทสต์ตรวจ (`\"lookup_order\"` และ `\"read_policy_resource\"`)",
      },
      {
        body: "ใน `read_policy_resource(uri)` ใช้ `match = POLICY_URI_RE.fullmatch(uri)` — ถ้า `match is None` โยน `ValueError` ทันที จากนั้นดึง `slug = match.group(1)` แล้วเช็กว่าอยู่ใน `POLICIES` หรือไม่ (ถ้าไม่อยู่โยน `KeyError`)",
      },
      {
        body: "โครงของ `log_event` และ `lookup_order` เกือบครบแล้ว — เติมส่วนคืนค่าเมื่อพบออเดอร์และเขียน `read_policy_resource` ต่อให้สมบูรณ์",
        code: {
          language: "python",
          filename: "hint_day114.py",
          code: `def log_event(event: str, **fields: Any) -> None:
    payload = {"event": event, **fields}
    print(json.dumps(payload, ensure_ascii=False), file=sys.stderr)


def lookup_order(order_id: str) -> OrderInfo:
    cleaned = order_id.strip().upper()
    if not ORDER_ID_RE.fullmatch(cleaned):
        raise ValueError(f"Invalid order_id: {order_id!r}")
    row = ORDERS.get(cleaned)
    log_event("lookup_order", order_id=cleaned, found=row is not None)
    if row is None:
        return OrderInfo(order_id=cleaned, found=False, status="not_found")
    # TODO: คืน OrderInfo ที่เติม status และ amount_thb จาก row
    raise NotImplementedError`,
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
      title: "เผลอใส่ print() ดีบักลง stdout ใน MCP Server แบบ stdio",
      symptom: "Client แจ้ง `JSONDecodeError` หรือปิด session ทันทีที่เปิด Server ทั้งที่โค้ดฟังก์ชันทำงานปกติ",
      fix: "ห้ามใช้ `print()` ออก `stdout` ในโปรเซส MCP Server เด็ดขาด ให้ส่ง log ทั้งหมดลง `sys.stderr` และเพิ่มเทสต์ `capsys` ตรวจ `captured.out == \"\"`",
    },
    {
      title: "รัน server.run(transport=\"stdio\") ไว้ระดับบนสุดของโมดูล",
      symptom: "แค่ `import` ไฟล์เพื่อรัน `pytest` โปรแกรมก็ค้างรอ `stdin` ไม่ยอมรันเทสต์",
      fix: "แยกฟังก์ชันธุรกิจและ `create_server()` ออกจากบล็อก `if __name__ == \"__main__\":` เพื่อให้ import ไปยูนิตเทสต์ได้สะอาด",
    },
    {
      title: "เชื่อว่าค่า `{slug}` ใน Resource URI ปลอดภัยเสมอโดยไม่ validate",
      symptom: "หากนำ `slug` ไปต่อเป็น path อ่านไฟล์จริงโดยตรงโดยไม่ตรวจ regex ผู้โจมตีอาจส่ง `../../.env` เพื่อล้วงความลับ",
      fix: "ตรวจสอบ URI และพารามิเตอร์ด้วย regex แบบ strict allowlist (เช่น `^[a-z0-9-]+$`) หรือจับคู่กับ dictionary คงที่ก่อนเปิดไฟล์",
    },
    {
      title: "คืนข้อความอิสระปะปนกันแทน Structured Output",
      symptom: "บางครั้งคืน `\"ไม่พบข้อมูล\"` บางครั้งคืน `\"จ่ายแล้ว 1490\"` ทำให้ฝั่ง Client หรือ LLM แยกสถานะ `found` กับ `error` ผิดพลาด",
      fix: "นิยาม {{pydantic}} `BaseModel` ที่มีฟิลด์ชัดเจน (`found`, `status`, `amount_thb`) เพื่อให้ได้สัญญาข้อมูลคงที่ทุกครั้ง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d114-q1",
        "ทำไมการใส่ `print(\"Server ready\")` ใน Local MCP Server ที่รันผ่าน `stdio` จึงทำให้การเชื่อมต่อกับ MCP Client พังทันที?",
        [
          ["เพราะ Python 3.12 ไม่อนุญาตให้ใช้ `print()` ในฟังก์ชันที่แปะ decorator", "Python ใช้ `print()` ได้ตามปกติ ปัญหาอยู่ที่ช่องทาง `stdout` ของโปรโตคอล"],
          [
            "เพราะในโหมด `stdio` ช่อง `stdout` ถูกใช้ส่งข้อความ JSON-RPC 2.0 เท่านั้น ข้อความอื่นที่ปนเข้ามาจะทำให้ฝั่ง Client parse JSON พัง",
            "ถูก — ทุกข้อความ log หรือดีบักต้องส่งไปที่ `sys.stderr` เท่านั้นเพื่อให้ `stdout` สะอาด 100%",
          ],
          ["เพราะ `print()` ทำให้ฐานข้อมูลถูกล็อก", "`print()` ไม่ได้ล็อกฐานข้อมูล แต่ทำลายเฟรมข้อมูล JSON-RPC บน `stdout`"],
          ["เพราะ FastMCP อนุญาตเฉพาะข้อความภาษาอังกฤษบน `stdout`", "ไม่ว่าภาษาใดก็ห้ามพิมพ์ข้อความนอกสเปก JSON-RPC ลง `stdout`"],
        ],
        "B",
        "ใน `stdio` transport ช่อง `stdin` และ `stdout` คือสายสื่อสาร JSON-RPC 2.0 โดยตรง ดังนั้น log ทั้งหมดต้องออก `sys.stderr` เท่านั้น",
        "กฎเหล็กด้าน stdout/stderr เมื่อเขียน Local MCP Server แบบ stdio คืออะไร?",
        "ห้ามพิมพ์ข้อความใด ๆ ออก stdout เพราะจะไปปนกับสตรีม JSON-RPC 2.0 — ให้ส่ง log ทั้งหมดไปที่ sys.stderr เท่านั้น",
      ),
      mc(
        "d114-q2",
        "ข้อใดคือประโยชน์หลักของการใส่ Python type hints, docstring และคืนค่าเป็น Pydantic `BaseModel` ใน `@mcp.tool()`?",
        [
          ["ทำให้ไม่ต้องตรวจสอบสิทธิ์ฝั่ง Host อีกต่อไป", "Type hints ช่วยเรื่อง schema และ validation แต่ยังต้องคุมสิทธิ์และ allowlist ฝั่ง Host เสมอ"],
          ["ทำให้ MCP Server ไม่ต้องใช้ JSON-RPC", "MCP ยังสื่อสารผ่าน JSON-RPC 2.0 เหมือนเดิม"],
          [
            "`FastMCP` ใช้ type hints/docstring สร้าง JSON Schema ให้ LLM อัตโนมัติ และได้โครงสร้างผลลัพธ์ (structured output) ที่ตรวจสอบได้แม่นยำ",
            "ถูก — ลดโอกาสที่ LLM เรียกพารามิเตอร์ผิดและลดความกำกวมตอนอ่านผลลัพธ์",
          ],
          ["ทำให้ฟังก์ชันทำงานแบบขนานบน GPU อัตโนมัติ", "Pydantic และ FastMCP ไม่ได้ย้ายฟังก์ชันไปรันบน GPU"],
        ],
        "C",
        "FastMCP แปลง Python type annotations และ docstring เป็น JSON Schema สำหรับ `tools/list` อัตโนมัติ และ Pydantic ช่วยรับประกันโครงสร้างผลลัพธ์",
        "ทำไม `@mcp.tool()` ใน FastMCP จึงควรมี type hints, docstring และคืน Pydantic model?",
        "เพื่อให้ FastMCP สร้าง JSON Schema ที่ชัดเจนให้ LLM อัตโนมัติ และได้ structured output ที่มีสัญญาข้อมูลคงที่ตรวจสอบได้",
      ),
      mc(
        "d114-q3",
        "เมื่อประกาศ `@mcp.resource(\"kb://policy/{slug}\")` เราควรป้องกันความเสี่ยงใดก่อนดึงเนื้อหาเอกสาร?",
        [
          ["ไม่ต้องป้องกันเพราะ Resource เป็นแบบอ่านอย่างเดียวจึงไม่มีความเสี่ยงใด ๆ", "แม้เป็น read-only แต่ถ้าเอา `slug` ไปเปิดไฟล์ตรง ๆ อาจถูก path traversal อ่านไฟล์ลับได้"],
          [
            "ตรวจสอบรูปแบบ `slug`/URI ด้วย strict pattern (เช่น `^[a-z0-9-]+$`) เพื่อกัน path traversal และ scheme ที่ไม่ได้รับอนุญาต",
            "ถูก — URI จากภายนอกคือ untrusted input เสมอ ต้อง validate แบบ fail-fast ก่อนเข้าถึงไฟล์หรือคลังเอกสาร",
          ],
          ["เปลี่ยนจาก Resource เป็น `run_shell` Tool แทน", "การเปิด `run_shell` ยิ่งเพิ่มความเสี่ยงรุนแรง (Excessive Agency)"],
          ["ปิดการใช้ `mime_type` เพื่อประหยัดแบนด์วิดท์", "`mime_type` ช่วยให้ Client รู้วิธีแสดงผลเนื้อหา เช่น `text/markdown` ไม่ได้เป็นช่องโหว่"],
        ],
        "B",
        "แม้ MCP Resource จะเป็น read-only แต่พารามิเตอร์ใน URI Template ต้องถูก validate แบบ fail-fast เพื่อป้องกันการอ้างอิงไฟล์นอกขอบเขต (path traversal)",
        "เหตุใด `@mcp.resource(\"kb://policy/{slug}\")` จึงยังต้อง validate ค่า `slug` ก่อนอ่านข้อมูล?",
        "เพื่อป้องกัน path traversal (เช่น `../.env`) และ URI scheme ที่ไม่ได้รับอนุญาต โดยบังคับ pattern แบบ strict allowlist",
      ),
      mc(
        "d114-q4",
        "ทำไมจึงควรแยก `create_server()` และฟังก์ชันธุรกิจออกจาก `server.run(transport=\"stdio\")` ที่อยู่ในบล็อก `if __name__ == \"__main__\":`?",
        [
          ["เพราะ Python ไม่อนุญาตให้เรียก `.run()` นอกบล็อก `if __name__ == \"__main__\":`", "Python เรียกได้ แต่จะทำให้เกิดปัญหาเมื่อ import ไฟล์ไปทดสอบ"],
          [
            "เพื่อให้ `pytest` สามารถ import ฟังก์ชันธุรกิจและตรวจ `capsys` ได้โดยไม่ติดบล็อกรออ่าน `stdin` ตลอดกาล",
            "ถูก — การแยก pure handlers ออกจาก entrypoint ทำให้เขียนยูนิตเทสต์ได้เร็วและ deterministic",
          ],
          ["เพราะ `FastMCP` จะไม่ลงทะเบียน `@mcp.tool()` หากไม่ได้อยู่ใน `create_server()`", "FastMCP ลงทะเบียนได้ทั้งสองแบบ แต่การแยก entrypoint ทำให้ทดสอบและบำรุงรักษาง่ายกว่ามาก"],
          ["เพื่อให้ `stdout` แปลงเป็น HTTP อัตโนมัติ", "โครงสร้าง entrypoint ไม่ได้เปลี่ยน transport จาก stdio เป็น HTTP"],
        ],
        "B",
        "การแยก pure handlers และ factory function ออกจาก `if __name__ == \"__main__\":` ทำให้รัน `pytest` ได้ทันทีโดยไม่ค้างรอ `stdin`",
        "ทำไมควรแยกฟังก์ชัน handler ออกจาก `server.run(transport=\"stdio\")` ในไฟล์ MCP Server?",
        "เพื่อให้ import มาทดสอบใน pytest (รวมถึงตรวจ stdout hygiene ด้วย capsys) ได้โดยไม่ติดบล็อกรออ่าน stdin",
      ),
    ],
  },

  takeaways: [
    "**`FastMCP`** แปลง Python function + {{type-hint}} + docstring เป็น MCP Tool/Resource พร้อม JSON {{schema}} โดยอัตโนมัติ",
    "แยก **`@mcp.tool()`** (ค้นหา/สั่งงานที่รับพารามิเตอร์และคืน {{pydantic}} {{structured-output}}) ออกจาก **`@mcp.resource(\"kb://...\")`** (เอกสารอ่านอย่างเดียวที่ตรวจ URI แบบ {{fail-fast}})",
    "**กฎเหล็ก `stdio` Hygiene**: ห้าม `print()` ออก `stdout` เด็ดขาด — ส่ง log ทั้งหมดไปที่ `sys.stderr` และยืนยันด้วย `capsys` ใน {{pytest}}",
    "แยกฟังก์ชันธุรกิจและ `create_server()` ออกจาก `if __name__ == \"__main__\":` เพื่อให้ทดสอบออฟไลน์ได้รวดเร็วและนำกลับมาใช้ซ้ำได้ง่าย",
  ],

  reviewCards: [
    rc(
      "d114-rc-1",
      "ใน `mcp` Python SDK เราใช้ decorator ใดสำหรับประกาศฟังก์ชันค้นหา/สั่งงาน กับเอกสารอ่านอย่างเดียว?",
      "ใช้ `@mcp.tool()` สำหรับฟังก์ชันที่ให้โมเดลเรียกพร้อมพารามิเตอร์ และใช้ `@mcp.resource(\"kb://...\")` สำหรับข้อมูล read-only ที่อ้างอิงด้วย URI",
    ),
    rc(
      "d114-rc-2",
      "วิธีตรวจสอบใน `pytest` ว่า Local MCP Server ไม่เผลอเขียนอะไรลง `stdout` ทำอย่างไร?",
      "ใช้ `capsys` fixture ของ pytest เรียก handler ของ Server แล้ว `assert capsys.readouterr().out == \"\"` พร้อมตรวจว่า log ออกทาง `.err` แทน",
    ),
    rc(
      "d114-rc-3",
      "ทำไมจึงควรคืน Pydantic `BaseModel` แทนข้อความสตริงอิสระจาก `@mcp.tool()`?",
      "เพื่อให้ได้สัญญาข้อมูลแบบ structured output ที่คงที่ (เช่น `found`, `status`, `amount_thb`) ช่วยให้ Client และ LLM แยกกรณีไม่พบข้อมูลออกจาก error ระบบได้แม่นยำ",
    ),
  ],

  sources: [
    { label: "MCP Official Quickstart — Build an MCP Server (Python)", href: "https://modelcontextprotocol.io/quickstart/server" },
    { label: "Official MCP Python SDK (FastMCP)", href: "https://github.com/modelcontextprotocol/python-sdk" },
    { label: "MCP Concepts — Resources & URI Templates", href: "https://modelcontextprotocol.io/docs/concepts/resources" },
    { label: "Pydantic v2 Documentation — Models & Validation", href: "https://docs.pydantic.dev/latest/" },
  ],

  glossary: ["mcp", "mcp-resource", "tool-calling", "pydantic", "schema", "structured-output", "structlog", "fail-fast"],
});
