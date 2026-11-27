import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D113 — Phase 4 / Block B29
 * Model Context Protocol (MCP) Architecture (Host, Client, Server)
 */
export const d113: Lesson = defineLesson({
  day: 113,
  titleTh: "สถาปัตยกรรม Model Context Protocol (MCP): แยก Host, Client และ Server อย่างปลอดภัย",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · เข้าใจมาตรฐาน USB-C ของระบบ AI และการคุมสิทธิ์ Tools vs Resources",
  icon: "plug",
  visual: {
    id: "mcp-architecture",
    title: "สถาปัตยกรรม MCP — Host ↔ Client ↔ Server (USB-C ของระบบ AI)",
    caption: "กดเดินทีละขั้นเพื่อดูการค้นพบ Tools/Resources และการเรียกใช้งานผ่าน JSON-RPC อย่างปลอดภัย",
    alt: "แผนภาพสถาปัตยกรรม MCP แสดงการสื่อสารระหว่าง Host, Client และ Server",
  },
  requiresApiKey: false,
  tools: ["MCP Python SDK", "Pydantic v2", "JSON-RPC 2.0", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "เปิดแหล่งข้อมูลและเครื่องมือผ่านมาตรฐานเดียว",
      body: "ฐานข้อมูลออเดอร์ ระบบทิกเก็ต และคลังนโยบายมักกระจัดกระจาย หากเขียนโค้ดเชื่อมใหม่ทุกครั้งที่สร้างแอป AI จะเกิดปัญหา N×M integration",
      lessonNote: "{{mcp}} ห่อแหล่งข้อมูลและเครื่องมือเป็น **MCP Server** มาตรฐานเดียวที่หลายแอป AI เรียกใช้ร่วมกันได้",
    },
    {
      node: 2,
      heading: "โมเดลเห็นเฉพาะความสามารถที่ประกาศผ่าน Schema",
      body: "LLM ไม่ได้เชื่อมต่อฐานข้อมูลโดยตรง แต่ได้รับรายการ Tools พร้อม JSON {{schema}} จากขั้น discovery แล้วส่งคำขอแบบ {{tool-calling}}",
      lessonNote: "วันนี้เราจะดูว่าคำขอ JSON-RPC (`tools/list`, `tools/call`) เชื่อมโมเดลเข้ากับเครื่องมือจริงอย่างไร",
    },
    {
      node: 4,
      heading: "Host คุม Session, Transport และด่านอนุมัติ",
      body: "ตัวแอป AI (Host) สร้าง MCP Client แบบ 1:1 ต่อหนึ่ง Server เพื่อจัดการ lifecycle, transport (`stdio` หรือ `Streamable HTTP`) และขอบเขตสิทธิ์",
      lessonNote: "Host คือจุดบังคับนโยบายความปลอดภัยและจุดพัก {{hitl}} ก่อนอนุญาตให้รัน write tool",
    },
    {
      node: 5,
      heading: "Audit Log และ Least-Privilege ที่ขอบโปรโตคอล",
      body: "เมื่อทุกการอ่านข้อมูลและสั่งงานไหลผ่านข้อความ JSON-RPC โครงสร้างเดียวกัน เราบันทึก audit trail และตรวจจับความพยายาม {{prompt-injection}} ได้ครบทุกคำขอ",
      lessonNote: "ในแบบฝึกหัดวันนี้ คุณจะสร้าง Policy Gate ฝั่ง Client ที่บล็อก write tool และบันทึก audit log อัตโนมัติ",
    },
  ],

  objectives: [
    "**แยกบทบาท** ของ **Host**, **MCP Client** และ **MCP Server** ในสถาปัตยกรรม {{mcp}} พร้อมอธิบายการสื่อสารผ่าน JSON-RPC 2.0",
    "**เลือกใช้ Primitives** ของ MCP ได้ถูกต้องระหว่าง **Tools** (สั่งทำงาน), **Resources** (อ่านบริบทแบบ read-only) และ **Prompts** (เทมเพลตคำสั่ง)",
    "**ออกแบบขอบเขตสิทธิ์แบบ Least-Privilege** และเลือก Transport (`stdio` vs `Streamable HTTP`) ให้เหมาะกับทั้งการรันบนเครื่องและระบบ Production",
  ],

  prerequisites: [
    "เข้าใจ {{tool-calling}} และ JSON Schema (แนะนำ Day 109–110)",
    "ใช้งาน {{pydantic}} `BaseModel` สำหรับตรวจสอบ {{payload}} (Day 1, Day 3)",
    "เข้าใจพื้นฐาน JSON และโครงสร้าง Client–Server บน HTTP/CLI",
    "ไม่ต้องใช้ API key — จำลองโปรโตคอล JSON-RPC บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "บทเรียนนี้เน้นความเข้าใจสถาปัตยกรรมและจำลองสัญญา JSON-RPC 2.0 ด้วย `Pydantic v2` (และเตรียมติดตั้ง `mcp` Python SDK ไว้สำหรับสร้าง Server จริงใน Day 114)",
    commands: `uv init ai-day113 && cd ai-day113
uv add pydantic
uv add --dev pytest ruff
# เตรียมไว้สำหรับ Day 114–115 (ตัวเลือกเสริมสำหรับวันนี้)
uv add mcp`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day113` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["ready", "ตรวจสอบว่า `uv run python -c \"import pydantic; print(pydantic.__version__)\"` แสดงเวอร์ชัน 2.x"],
    ],
    note: "ตัวอย่างและแบบฝึกหัดวันนี้รันด้วย `pydantic` + `pytest` ได้ทันทีแม้ยังไม่ติดตั้ง `mcp` SDK — ใน Day 114 เราจะลงมือเขียน MCP Server จริงด้วย `FastMCP`",
  },

  concepts: [
    {
      id: "mcp-three-roles",
      title: "1 · สามบทบาทหลักของ MCP: Host, Client และ Server",
      paragraphs: [
        "ก่อนมี {{mcp}} ถ้าองค์กรมีแอป AI 3 ตัว (แชตเว็บ, IDE assistant, บอต Slack) และต้องต่อกับระบบภายใน 4 ตัว (SQLite ออเดอร์, ระบบทิกเก็ต, Notion, Slack) ทีมต้องเขียนโค้ดเชื่อมแยกถึง `3 × 4 = 12` คู่ พอเปลี่ยนรูปแบบ API ฝั่งหนึ่งก็ต้องไล่แก้ทุกแอป",
        "MCP แก้ปัญหา N×M นี้ให้เหลือ **N + M** ด้วยการแยกสถาปัตยกรรมออกเป็น 3 ชั้นชัดเจนที่สื่อสารกันด้วย **JSON-RPC 2.0**: **Host** (ตัวแอป AI ที่คุยกับผู้ใช้และคุม security policy), **MCP Client** (ตัวเชื่อมต่อที่อยู่ข้างใน Host โดยจับคู่แบบ **1:1** กับ Server หนึ่งตัว) และ **MCP Server** (โปรเซสขนาดเล็กที่ห่อฐานข้อมูลหรือ API ภายในแล้วเปิดเผยความสามารถตามสเปกกลาง)",
        "การแยก Client ออกจาก Server ทำให้ Server หนึ่งตัว (เช่น `order-mcp-server`) ถูกนำไปเสียบใช้งานได้ทั้งกับ FastAPI backend ของคุณ, CLI tool หรือ IDE โดยไม่ต้องแก้โค้ดฝั่ง Server เลย",
      ],
      analogy:
        "เหมือนมาตรฐาน USB-C: โน้ตบุ๊กคือ Host, ช่องพอร์ตควบคุมไฟและข้อมูลคือ Client (1 พอร์ตต่อ 1 อุปกรณ์), และแฟลชไดรฟ์/จอมอนิเตอร์คือ Server — ทำอุปกรณ์ครั้งเดียวเสียบใช้ได้กับทุกเครื่อง",
      bullets: [
        "**Host**: แอปหลัก (เช่น แชตผู้ช่วยลูกค้า, IDE, CLI) ถือ LLM, รวมบริบทจากหลาย Server และเป็นผู้ขออนุมัติจากผู้ใช้",
        "**MCP Client**: อยู่ใน Host ดูแล 1 session ต่อ 1 Server ทำ handshake (`initialize`), ค้นพบความสามารถ (`tools/list`) และส่งคำขอ",
        "**MCP Server**: บริการเฉพาะทางขนาดเล็ก (เช่น `orders-server`, `docs-server`) แยกสิทธิ์ขาดจากกัน ไม่เห็น prompt ทั้งหมดของแอป",
      ],
      whyTitle: "Why this matters — แยกความเสี่ยงและสลับส่วนประกอบได้โดยไม่รื้อระบบ",
      whyParagraphs: [
        "เพราะแต่ละ MCP Server ถูกแยกโปรเซสและแยกสิทธิ์ออกจากกัน Server ที่อ่านฐานข้อมูล FAQ จึงไม่จำเป็นต้องถือรหัสผ่านของระบบคืนเงิน และมองไม่เห็นประวัติแชตทั้งหมดของ Host",
        "ใน Phase 6 Capstone คุณจะสร้าง MCP Server แยกสำหรับ Order/Ticket Lookup เพื่อให้ทั้ง CLI ทดสอบและ FastAPI backend เรียกใช้ชุดเดียวกันได้ทันที",
      ],
    },
    {
      id: "mcp-primitives",
      title: "2 · Primitives ของ MCP: Tools vs Resources vs Prompts",
      paragraphs: [
        "ความสับสนที่เจอบ่อยที่สุดของมือใหม่คือยัดทุกอย่างเป็น Tool หมด แต่ {{mcp}} แบ่งความสามารถออกเป็น 3 ประเภทตาม **ผู้ควบคุม (who controls it)** และ **ผลข้างเคียง (side effects)**:",
        "**Resources** คือข้อมูลอ่านอย่างเดียว (read-only context) ที่อ้างอิงด้วย URI เช่น `policy://refund/th` หรือ `order://INV-2026-009` ควบคุมโดยแอป (Application-controlled) จึงปลอดภัยและแคชได้ง่าย ส่วน **Tools** คือฟังก์ชันที่ให้โมเดลร้องขอเรียกทำงาน (Model-controlled) เช่น `search_orders` หรือ `create_refund_ticket` ซึ่งอาจเกิดผลข้างเคียงจึงต้องมี JSON {{schema}} กำกับและผ่านด่านตรวจสิทธิ์เสมอ",
        "ส่วนที่สามคือ **Prompts** ซึ่งเป็นเทมเพลตคำสั่งมาตรฐานที่ผู้ใช้เลือกเรียกเอง (User-controlled) เช่นคำสั่ง `/summarize-incident` เพื่อช่วยให้ทีมใช้โครงสร้างคำสั่งเดียวกันทั้งองค์กร",
      ],
      analogy:
        "Resources เหมือน 'แฟ้มคู่มือบนโต๊ะ' ที่หยิบอ่านได้อย่างเดียว, Tools เหมือน 'ปุ่มกดสั่งงาน' ที่ต้องระวังสิทธิ์ก่อนกด, และ Prompts เหมือน 'แบบฟอร์มคำร้องสำเร็จรูป' ที่ผู้ใช้เลือกหยิบมาใช้",
      code: {
        language: "json",
        filename: "mcp_jsonrpc_trace.json",
        code: `{
  "discovery_request": {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  },
  "tool_call_request": {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_order_status",
      "arguments": { "order_id": "INV-2026-009" }
    }
  },
  "resource_read_request": {
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/read",
    "params": { "uri": "policy://refund/th" }
  }
}`,
        caption: "ข้อความมาตรฐาน JSON-RPC 2.0 ของ MCP แยกเมธอด `tools/list`, `tools/call` และ `resources/read` ออกจากกันอย่างชัดเจน",
      },
      whyTitle: "Why this matters — แยกการอ่านออกจากการเขียนตั้งแต่ระดับสเปก",
      whyParagraphs: [
        "หากแยกข้อมูลนโยบายหรือรายละเอียดเอกสารคงที่ออกมาเป็น **Resources** แทนที่จะเป็น **Tools** ระบบจะลดจำนวนรอบการเดาของ LLM และแยก audit policy ระหว่างการอ่านข้อมูลกับการแก้ไขข้อมูลได้ง่ายขึ้นมาก",
        "ทุก Tool ที่มีการแก้ไขสถานะ (write/delete/send) ควรถูกติดป้ายความเสี่ยงให้ Host บังคับ {{hitl}} approval ทุกครั้ง",
      ],
    },
    {
      id: "transports-and-least-privilege",
      title: "3 · Transport (`stdio` vs `Streamable HTTP`) และขอบเขตสิทธิ์ Least-Privilege",
      paragraphs: [
        "MCP แยกตัวโปรโตคอล (JSON-RPC 2.0) ออกจากช่องทางการส่งข้อมูล (Transport) โดยมีสองโหมดหลักให้เลือกตามสภาพแวดล้อม:",
        "**`stdio`** รัน MCP Server เป็น subprocess บนเครื่องเดียวกับ Host แล้วสื่อสารผ่าน `stdin`/`stdout` จึงเร็วมาก ไม่ต้องเปิดพอร์ตเครือข่าย และเหมาะกับ local dev, CLI หรือ Desktop AI Host ส่วน **`Streamable HTTP`** ส่งคำขอผ่าน HTTP POST (และรองรับ SSE streaming เมื่อต้องการส่งข้อมูลต่อเนื่อง) จึงเหมาะกับ MCP Server ที่โฮสต์แยกบนคลาวด์ให้หลายผู้ใช้เชื่อมต่อพร้อมกันภายใต้ HTTPS และ OAuth/Bearer token",
        "ด้านความปลอดภัย กฎเหล็กคือ **Least-Privilege Boundary**: ห้ามสร้าง Tool อเนกประสงค์อย่าง `run_raw_sql(query)` หรือ `shell_exec(cmd)` ให้ LLM เรียกเด็ดขาด ให้เปิดเฉพาะ Tool แคบ ๆ ที่ validate อาร์กิวเมนต์ด้วย {{pydantic}} (เช่น `order_id` ตาม pattern เท่านั้น) และให้ Host บังคับสิทธิ์ก่อนส่งคำสั่ง เพื่อลดความเสียหายหากเอกสารที่ดึงมาซ่อน {{prompt-injection}}",
      ],
      analogy:
        "`stdio` เหมือนต่อสายตรงในเครื่องเดียวกันโดยไม่เปิดประตูบ้าน ส่วน `Streamable HTTP` เหมือนเคาน์เตอร์บริการออนไลน์ที่ต้องตรวจบัตรประจำตัวและสิทธิ์ทุกครั้งก่อนทำรายการ",
      bullets: [
        "**`stdio`**: เหมาะกับ Local Server บนเครื่องเดียว — ระวังห้าม `print()` log ออก `stdout` เพราะจะไปปนกับข้อความ JSON-RPC (ให้เขียน log ลง `stderr` แทน)",
        "**`Streamable HTTP`**: เหมาะกับ Remote Multi-User Server — ต้องยืนยันตัวตน (Auth), ตรวจ Origin และบังคับสิทธิ์ระดับผู้ใช้ทุกคำขอ",
        "**Least-Privilege**: แยก read-only server กับ write tool, ตรวจ input ด้วย Pydantic และขอ {{hitl}} approval สำหรับ write action",
      ],
      whyTitle: "Why this matters — System Prompt กัน Prompt Injection ไม่ได้ 100%",
      whyParagraphs: [
        "ใน OWASP LLM Top 10 ปัญหา **Excessive Agency (LLM06)** เกิดจากการให้โมเดลถือเครื่องมือที่สิทธิ์กว้างเกินจำเป็น เมื่อโมเดลถูกหลอกด้วยเอกสารที่มีคำสั่งแฝง ระบบจึงทำลายข้อมูลได้ทันที",
        "ขอบเขตสิทธิ์ที่ระดับ MCP Client และ MCP Server คือด่านป้องกันเชิงโครงสร้างที่เชื่อถือได้จริง แม้โมเดลจะถูกหลอกก็ตาม",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — MCP เทียบกับสถาปัตยกรรม Web API ที่คุ้นเคย",
      body: [
        "หากคุณเคยออกแบบ Backend Microservices หรือใช้ OpenAPI/GraphQL คุณจะเข้าใจโครงสร้าง MCP ได้ในทันที:",
      ],
      table: [
        ["MCP Server", "Microservice ขนาดเล็กที่ประกาศความสามารถมาตรฐาน"],
        ["tools/list + JSON Schema", "OpenAPI / Swagger discovery endpoint"],
        ["Resources (URI read-only)", "GET endpoint สำหรับดึงข้อมูลอ้างอิงแบบไม่มี side effect"],
        ["Tools (actions)", "POST/PUT RPC endpoint ที่มี input validation"],
        ["stdio vs Streamable HTTP", "Local IPC child process vs Remote HTTPS/SSE API"],
      ],
    },
    student: {
      title: "First-Year Note — JSON-RPC 2.0 และ stdin/stdout คืออะไร",
      body: [
        "**JSON-RPC 2.0** คือรูปแบบข้อความ JSON มาตรฐานสำหรับสั่งเรียกฟังก์ชันข้ามโปรแกรม ทุกคำขอมี `jsonrpc: \"2.0\"`, `id` (เลขประจำคำขอไว้จับคู่คำตอบ), `method` (ชื่อคำสั่ง) และ `params` (ข้อมูลส่งไป)",
        "**`stdio`** ย่อมาจาก Standard Input/Output — เมื่อ Host รัน MCP Server แบบ local มันจะส่งข้อความ JSON เข้าทาง `stdin` แล้วอ่านคำตอบกลับจาก `stdout` ดังนั้นถ้าคุณเผลอ `print(\"debug\")` ออกทาง `stdout` ข้อความนั้นจะไปปนกับ JSON จน Client อ่านไม่รู้เรื่อง ต้องส่ง log ออกทาง `stderr` (`sys.stderr`) แทน",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะจำลองการสื่อสารครบวงจรระหว่าง **Host ↔ MCP Client ↔ MCP Server** ด้วย Pure Python + Pydantic v2 เพื่อดูขั้นตอน Discovery, การอ่าน Resource, การเรียก Read Tool และการบล็อก Write Tool เมื่อยังไม่มีการอนุมัติจากมนุษย์",
    steps: [
      {
        title: "1 · นิยามสัญญา JSON-RPC 2.0 และรายการ Tools/Resources ของ Server",
        explain:
          "ใช้ `Pydantic` บังคับโครงสร้างคำขอ/คำตอบ JSON-RPC 2.0 และแยกระดับความเสี่ยง (`read` vs `write`) ของแต่ละ Tool ไว้ชัดเจนใน Metadata ของ Server",
        code: {
          language: "python",
          filename: "worked_mcp.py",
          code: `from typing import Any, Literal
from pydantic import BaseModel, Field


class JsonRpcRequest(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: int
    method: Literal["tools/list", "resources/read", "tools/call"]
    params: dict[str, Any] = Field(default_factory=dict)


class ToolSpec(BaseModel):
    name: str
    description: str
    risk: Literal["read", "write"]


SERVER_TOOLS: dict[str, ToolSpec] = {
    "get_order_status": ToolSpec(
        name="get_order_status",
        description="ดูสถานะคำสั่งซื้อแบบอ่านอย่างเดียว",
        risk="read",
    ),
    "cancel_order": ToolSpec(
        name="cancel_order",
        description="ยกเลิกคำสั่งซื้อ (มีผลเปลี่ยนแปลงข้อมูล)",
        risk="write",
    ),
}

RESOURCES = {
    "policy://refund/th": "ลูกค้าขอคืนเงินได้ภายใน 7 วันหลังได้รับสินค้า พร้อมเลขคำสั่งซื้อ",
}

print("Registered tools:", list(SERVER_TOOLS.keys()))`,
        },
        output: `Registered tools: ['get_order_status', 'cancel_order']`,
      },
      {
        title: "2 · จำลอง MCP Server handler สำหรับ Discovery, Read Resource และ Tool Call",
        explain:
          "Server จัดการ 3 เมธอดมาตรฐาน: `tools/list`, `resources/read` และ `tools/call` พร้อมจำลองฐานข้อมูลออเดอร์ในหน่วยความจำ",
        code: {
          language: "python",
          filename: "worked_mcp.py",
          code: `ORDERS = {"INV-2026-009": {"status": "pending_payment", "amount_thb": 1490}}


def handle_server_request(req: JsonRpcRequest) -> dict[str, Any]:
    if req.method == "tools/list":
        return {"result": [t.model_dump() for t in SERVER_TOOLS.values()]}
    if req.method == "resources/read":
        uri = req.params.get("uri", "")
        if uri not in RESOURCES:
            return {"error": {"code": -32602, "message": f"Unknown resource: {uri}"}}
        return {"result": {"uri": uri, "text": RESOURCES[uri]}}
    if req.method == "tools/call":
        name = req.params.get("name", "")
        args = req.params.get("arguments", {})
        if name == "get_order_status":
            order = ORDERS.get(args.get("order_id", ""))
            return {"result": order or {"error": "order_not_found"}}
        if name == "cancel_order":
            return {"result": {"cancelled": args.get("order_id")}}
    return {"error": {"code": -32601, "message": "Method or tool not found"}}


res_policy = handle_server_request(
    JsonRpcRequest(id=1, method="resources/read", params={"uri": "policy://refund/th"})
)
res_order = handle_server_request(
    JsonRpcRequest(id=2, method="tools/call", params={"name": "get_order_status", "arguments": {"order_id": "INV-2026-009"}})
)
print("Resource:", res_policy["result"]["text"])
print("Order   :", res_order["result"])`,
        },
        output: `Resource: ลูกค้าขอคืนเงินได้ภายใน 7 วันหลังได้รับสินค้า พร้อมเลขคำสั่งซื้อ
Order   : {'status': 'pending_payment', 'amount_thb': 1490}`,
      },
      {
        title: "3 · ใส่ด่าน Least-Privilege ฝั่ง Host/Client ก่อนส่ง Write Tool",
        explain:
          "ก่อนส่งคำขอ `tools/call` ไปยัง Server ฝั่ง Client จะตรวจ metadata จาก `tools/list`: ถ้า `risk == \"write\"` และยังไม่มี `human_approved=True` จะปฏิเสธทันทีโดยไม่เรียก Server",
        code: {
          language: "python",
          filename: "worked_mcp.py",
          code: `def call_tool_with_policy(
    tool_name: str,
    arguments: dict[str, Any],
    *,
    human_approved: bool = False,
) -> dict[str, Any]:
    spec = SERVER_TOOLS.get(tool_name)
    if spec is None:
        return {"error": {"code": -32601, "message": f"Unknown tool: {tool_name}"}}
    if spec.risk == "write" and not human_approved:
        return {
            "error": {
                "code": -32001,
                "message": f"Approval required before executing write tool '{tool_name}'",
            }
        }
    req = JsonRpcRequest(
        id=3,
        method="tools/call",
        params={"name": tool_name, "arguments": arguments},
    )
    return handle_server_request(req)


print("Without approval:", call_tool_with_policy("cancel_order", {"order_id": "INV-2026-009"}))
print("With approval   :", call_tool_with_policy("cancel_order", {"order_id": "INV-2026-009"}, human_approved=True))`,
        },
        output: `Without approval: {'error': {'code': -32001, 'message': "Approval required before executing write tool 'cancel_order'"}}
With approval   : {'result': {'cancelled': 'INV-2026-009'}}`,
      },
    ],
    gotcha:
      "จุดสังเกต: การตรวจสิทธิ์ `human_approved` ต้องอยู่ฝั่งโค้ดของ Host/Client (และยืนยันซ้ำฝั่ง Server เมื่อเป็น remote) — ห้ามปล่อยให้ LLM ส่งฟิลด์ `\"human_approved\": true` มาเองใน `arguments` เพราะจะถูกเจาะได้ง่ายด้วย Prompt Injection",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างคลาส `MCPPolicyClient` ที่สื่อสารกับ `MockOrderMCPServer` ผ่าน JSON-RPC 2.0 พร้อมบังคับนโยบาย Least-Privilege (อนุญาต read resource / read tool อัตโนมัติ, บล็อก write tool ที่ยังไม่อนุมัติ) และบันทึก Audit Log ทุกคำขอ",
    requirements: [
      "สร้าง `AuditEntry(BaseModel)` เก็บ `method: str`, `target: str`, `decision: Literal[\"allowed\", \"denied\"]`, และ `reason: str`",
      "สร้าง `MCPPolicyClient(server: MockOrderMCPServer, allowed_tools: set[str])` ที่มีเมธอด `read_resource(uri: str)` และ `call_tool(name: str, arguments: dict, *, approved: bool = False)`",
      "เมธอด `read_resource(uri)` ส่ง JSON-RPC `resources/read` ไปยัง server และบันทึก `AuditEntry` (`allowed` เมื่อพบ resource, `denied` เมื่อไม่พบ)",
      "เมธอด `call_tool(name, arguments, approved=False)` ต้องตรวจ allowlist ก่อน (ไม่อยู่ใน `allowed_tools` → คืน error code `-32601` และบันทึก `denied`), จากนั้นตรวจ `risk` ของ tool จาก `tools/list`: ถ้า `risk == \"write\"` และ `approved` เป็น `False` ให้คืน error code `-32001` โดย **ไม่เรียก server** และบันทึก `denied`",
      "เมื่อผ่านเงื่อนไขทั้งหมด จึงส่งคำขอ `tools/call` ไปยัง server คืนผลลัพธ์ และบันทึก `AuditEntry` เป็น `allowed`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day113.py",
      code: `from __future__ import annotations
from typing import Any, Literal
from pydantic import BaseModel


class AuditEntry(BaseModel):
    method: str
    target: str
    decision: Literal["allowed", "denied"]
    reason: str


class MockOrderMCPServer:
    """เซิร์ฟเวอร์จำลองตามสัญญา JSON-RPC 2.0 ของ MCP"""

    def __init__(self) -> None:
        self.call_count = 0
        self._tools = {
            "get_order_status": {"name": "get_order_status", "risk": "read"},
            "issue_refund": {"name": "issue_refund", "risk": "write"},
        }
        self._resources = {
            "policy://refund-th": "คืนเงินได้ภายใน 7 วันเมื่อสินค้ายังไม่ถูกเปิดใช้งาน",
        }
        self._orders = {
            "INV-2026-009": {"order_id": "INV-2026-009", "status": "paid", "amount_thb": 1490},
        }

    def handle(self, request: dict[str, Any]) -> dict[str, Any]:
        method = request.get("method")
        params = request.get("params", {})
        if method == "tools/list":
            return {"jsonrpc": "2.0", "id": request["id"], "result": list(self._tools.values())}
        if method == "resources/read":
            uri = params.get("uri", "")
            if uri not in self._resources:
                return {"jsonrpc": "2.0", "id": request["id"], "error": {"code": -32602, "message": "Resource not found"}}
            return {"jsonrpc": "2.0", "id": request["id"], "result": {"uri": uri, "text": self._resources[uri]}}
        if method == "tools/call":
            self.call_count += 1
            name = params.get("name")
            args = params.get("arguments", {})
            if name == "get_order_status":
                order = self._orders.get(args.get("order_id", ""))
                return {"jsonrpc": "2.0", "id": request["id"], "result": order or {"status": "not_found"}}
            if name == "issue_refund":
                return {"jsonrpc": "2.0", "id": request["id"], "result": {"refunded": args.get("order_id")}}
        return {"jsonrpc": "2.0", "id": request.get("id", 0), "error": {"code": -32601, "message": "Unknown method/tool"}}


class MCPPolicyClient:
    def __init__(self, server: MockOrderMCPServer, allowed_tools: set[str]) -> None:
        self.server = server
        self.allowed_tools = allowed_tools
        self.audit_log: list[AuditEntry] = []
        self._next_id = 1
        # TODO: เรียก tools/list จาก server เพื่อเก็บ spec (ชื่อ -> risk)

    def read_resource(self, uri: str) -> dict[str, Any]:
        # TODO: เรียก resources/read และบันทึก AuditEntry
        raise NotImplementedError

    def call_tool(
        self,
        name: str,
        arguments: dict[str, Any],
        *,
        approved: bool = False,
    ) -> dict[str, Any]:
        # TODO: บังคับ allowlist + write-tool approval gate ก่อนส่งถึง server
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day113.py",
      code: `from exercise_day113 import MCPPolicyClient, MockOrderMCPServer


def test_read_resource_allowed_and_not_found():
    server = MockOrderMCPServer()
    client = MCPPolicyClient(server, allowed_tools={"get_order_status", "issue_refund"})

    ok = client.read_resource("policy://refund-th")
    assert "7 วัน" in ok["result"]["text"]
    assert client.audit_log[-1].decision == "allowed"

    missing = client.read_resource("policy://secret")
    assert "error" in missing
    assert client.audit_log[-1].decision == "denied"


def test_read_tool_runs_without_approval():
    server = MockOrderMCPServer()
    client = MCPPolicyClient(server, allowed_tools={"get_order_status", "issue_refund"})

    resp = client.call_tool("get_order_status", {"order_id": "INV-2026-009"})
    assert resp["result"]["status"] == "paid"
    assert server.call_count == 1
    assert client.audit_log[-1].decision == "allowed"


def test_write_tool_blocked_without_approval_and_server_not_called():
    server = MockOrderMCPServer()
    client = MCPPolicyClient(server, allowed_tools={"get_order_status", "issue_refund"})

    blocked = client.call_tool("issue_refund", {"order_id": "INV-2026-009"}, approved=False)
    assert blocked["error"]["code"] == -32001
    assert server.call_count == 0
    assert client.audit_log[-1].decision == "denied"

    allowed = client.call_tool("issue_refund", {"order_id": "INV-2026-009"}, approved=True)
    assert allowed["result"]["refunded"] == "INV-2026-009"
    assert server.call_count == 1
    assert client.audit_log[-1].decision == "allowed"


def test_tool_not_in_allowlist_is_denied():
    server = MockOrderMCPServer()
    client = MCPPolicyClient(server, allowed_tools={"get_order_status"})

    resp = client.call_tool("issue_refund", {"order_id": "INV-2026-009"}, approved=True)
    assert resp["error"]["code"] == -32601
    assert server.call_count == 0
    assert client.audit_log[-1].decision == "denied"
`,
    },
    selfCheck: [
      "Client เรียก `tools/list` ตอนเริ่มต้นเพื่อค้นพบ metadata ของเครื่องมือแทนการ hard-code risk ไว้ใน client",
      "`resources/read` ใช้งานได้โดยไม่ต้องผ่าน approval gate และบันทึก audit log ทั้งกรณีพบและไม่พบ",
      "`issue_refund` เมื่อ `approved=False` ถูกบล็อกก่อนถึง server (`server.call_count == 0`) และคืน error code `-32001`",
      "Tool ที่ไม่อยู่ใน `allowed_tools` ถูกปฏิเสธด้วย error code `-32601` แม้ส่ง `approved=True`",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `__init__` ให้ส่งคำขอ `{\"jsonrpc\": \"2.0\", \"id\": self._alloc_id(), \"method\": \"tools/list\", \"params\": {}}` ไปยัง `server.handle(...)` แล้วเก็บผลลัพธ์เป็น dict `self._tool_specs = {t[\"name\"]: t for t in resp[\"result\"]}`",
      },
      {
        body: "เขียน helper `_alloc_id(self) -> int` สำหรับนับเลขคำขอ JSON-RPC และ `_record(self, method, target, decision, reason)` เพื่อสร้าง `AuditEntry` ลง `self.audit_log` ให้สม่ำเสมอทุกเส้นทาง",
      },
      {
        body: "โครงของ `MCPPolicyClient` เกือบสมบูรณ์ — เหลือเติมเงื่อนไขตรวจ write tool และการส่งคำขอ `tools/call` ไปยัง `self.server.handle(...)`",
        code: {
          language: "python",
          filename: "hint_day113.py",
          code: `class MCPPolicyClient:
    def __init__(self, server: MockOrderMCPServer, allowed_tools: set[str]) -> None:
        self.server = server
        self.allowed_tools = allowed_tools
        self.audit_log: list[AuditEntry] = []
        self._next_id = 1
        discovery = self.server.handle(
            {"jsonrpc": "2.0", "id": self._alloc_id(), "method": "tools/list", "params": {}}
        )
        self._tool_specs = {item["name"]: item for item in discovery["result"]}

    def _alloc_id(self) -> int:
        req_id = self._next_id
        self._next_id += 1
        return req_id

    def read_resource(self, uri: str) -> dict[str, Any]:
        resp = self.server.handle(
            {"jsonrpc": "2.0", "id": self._alloc_id(), "method": "resources/read", "params": {"uri": uri}}
        )
        decision = "denied" if "error" in resp else "allowed"
        self.audit_log.append(AuditEntry(method="resources/read", target=uri, decision=decision, reason=decision))
        return resp

    def call_tool(self, name: str, arguments: dict[str, Any], *, approved: bool = False) -> dict[str, Any]:
        if name not in self.allowed_tools or name not in self._tool_specs:
            self.audit_log.append(AuditEntry(method="tools/call", target=name, decision="denied", reason="not_allowlisted"))
            return {"jsonrpc": "2.0", "id": self._alloc_id(), "error": {"code": -32601, "message": "Tool not allowed"}}
        # TODO: ถ้า risk == "write" และ not approved ให้บันทึก denied และคืน error code -32001
        # TODO: มิฉะนั้นเรียก self.server.handle(...) แล้วบันทึก allowed
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
      title: "พิมพ์ log ด้วย print() ออก stdout ใน MCP Server แบบ stdio",
      symptom: "MCP Client ฝั่ง Host แจ้ง JSON parse error ทันทีตอนเริ่มเชื่อมต่อ เพราะข้อความ debug ปนมากับสตรีม JSON-RPC",
      fix: "สำหรับ `stdio` transport ห้ามใช้ `print()` ออก `stdout` เด็ดขาด ให้ส่ง log ไปที่ `sys.stderr` หรือไฟล์ log แทน",
    },
    {
      title: "เปิด Tool สิทธิ์กว้างเกินจำเป็น เช่น execute_sql(raw_sql)",
      symptom: "หากเกิด {{prompt-injection}} ในเอกสารลูกค้า โมเดลอาจถูกหลอกให้รัน `DROP TABLE` หรือดึงข้อมูลลูกค้าคนอื่นออกมาทั้งหมด",
      fix: "ออกแบบ Tool แคบ ๆ ตามงานจริง (เช่น `get_order_status(order_id)`) พร้อมตรวจ {{payload}} ด้วย {{pydantic}} และแยกสิทธิ์ read vs write",
    },
    {
      title: "เอาข้อมูลอ่านอย่างเดียวทั้งหมดไปทำเป็น Tool แทน Resource",
      symptom: "โมเดลต้องเสียรอบเรียก tool ซ้ำ ๆ เพื่ออ่านคู่มือคงที่ และยากต่อการแยกนโยบายแคชหรือนโยบายความปลอดภัย",
      fix: "ใช้ **Resources** (URI) สำหรับบริบทอ่านอย่างเดียวที่ Host หยิบแนบได้ และเก็บ **Tools** ไว้สำหรับการค้นหาที่มีพารามิเตอร์หรือการสั่งงาน",
    },
    {
      title: "เชื่อฟิลด์ยืนยันจากอาร์กิวเมนต์ที่ LLM สร้างเอง",
      symptom: "ให้พารามิเตอร์ `approved: bool` อยู่ใน schema ของ Tool แล้ว LLM กรอก `true` มาให้เองโดยที่ผู้ใช้ยังไม่เห็น",
      fix: "สถานะการอนุมัติ ({{hitl}}) ต้องควบคุมโดยโค้ดฝั่ง Host/Client นอกเหนือการควบคุมของ LLM เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d113-q1",
        "ในสถาปัตยกรรม MCP ข้อใดจับคู่บทบาทของ **Host**, **Client** และ **Server** ได้ถูกต้องที่สุด?",
        [
          ["Host เก็บฐานข้อมูล, Client คือ LLM, Server คือหน้าเว็บ", "สลับบทบาทกัน — Host คือแอปหลักที่ถือ LLM ส่วน Server คือผู้เปิดเผยข้อมูล/เครื่องมือ"],
          [
            "Host คือแอป AI หลักที่คุม UX/สิทธิ์, Client อยู่ใน Host เชื่อมต่อแบบ 1:1 กับ Server หนึ่งตัว, และ Server ห่อเครื่องมือ/ข้อมูลตามสเปกกลาง",
            "ถูก — โครงสร้าง 3 ชั้นนี้ช่วยแยกความรับผิดชอบและทำให้ 1 MCP Server ใช้ซ้ำได้ในหลายแอป AI",
          ],
          ["Client 1 ตัวต้องคุยกับทุก Server ผ่านพอร์ตเดียวกันเสมอ", "MCP Client จับคู่ 1:1 กับ Server หนึ่งตัว (1 Host สร้างหลาย Client ได้)"],
          ["MCP Server เป็นตัวเรียก LLM API แทน Host ทั้งหมด", "Host เป็นผู้ประสานงานกับ LLM หลัก ไม่ใช่ Server"],
        ],
        "B",
        "Host จัดการแอปและนโยบายความปลอดภัย, Client จัดการ session แบบ 1:1 ต่อ Server, และ Server เปิดเผย Tools/Resources/Prompts ตามสเปก JSON-RPC 2.0",
        "บทบาทของ Host, MCP Client และ MCP Server ต่างกันอย่างไร?",
        "Host คือแอป AI หลักที่คุมสิทธิ์และ LLM, Client อยู่ใน Host ดูแลการเชื่อมต่อ 1:1 กับ Server, ส่วน Server คือตัวเปิดเผย Tools/Resources/Prompts",
      ),
      mc(
        "d113-q2",
        "ข้อมูลนโยบายการคืนสินค้าแบบอ่านอย่างเดียว (`policy://refund/th`) กับคำสั่งยกเลิกออเดอร์ (`cancel_order`) ควรออกแบบเป็น MCP Primitive ประเภทใดตามลำดับ?",
        [
          ["Tools ทั้งคู่ เพราะทุกอย่างใน MCP เป็น Tool", "การยัดข้อมูลคงที่เป็น Tool ทำให้แยกการอ่านกับ action ยากขึ้น"],
          ["Resources ทั้งคู่ เพื่อความปลอดภัย", "Resource มีไว้สำหรับอ่านอย่างเดียว (read-only) ไม่ใช่สำหรับสั่ง action ที่มี side effect"],
          [
            "นโยบายเป็น **Resource** (read-only context) ส่วนการยกเลิกออเดอร์เป็น **Tool** (action ที่มี side effect พร้อม approval policy)",
            "ถูก — แยก read-only context กับ executable action ชัดเจนตั้งแต่ระดับสเปก",
          ],
          ["นโยบายเป็น Prompt ส่วนการยกเลิกออเดอร์เป็น Resource", "Prompt คือเทมเพลตคำสั่งสำหรับผู้ใช้ ส่วน Resource ไม่ได้เอาไว้รันคำสั่งแก้ไขข้อมูล"],
        ],
        "C",
        "Resources เหมาะกับบริบทอ่านอย่างเดียวที่อ้างอิงด้วย URI ส่วน Tools เหมาะกับการทำงานที่รับพารามิเตอร์และอาจก่อให้เกิดผลข้างเคียง",
        "ความต่างระหว่าง MCP Resources กับ MCP Tools คืออะไร?",
        "Resources คือข้อมูลอ่านอย่างเดียว (read-only, URI-based, app-controlled) ส่วน Tools คือฟังก์ชันสั่งงาน (model-controlled, มี schema และอาจมี side effects)",
      ),
      mc(
        "d113-q3",
        "เมื่อไรควรเลือก Transport แบบ **`stdio`** และเมื่อไรควรเลือก **`Streamable HTTP`**?",
        [
          ["ใช้ `stdio` สำหรับเว็บหลายผู้ใช้บนคลาวด์ และ `Streamable HTTP` สำหรับสคริปต์ในเครื่อง", "กลับกัน — `stdio` ใช้กับ subprocess บนเครื่องเดียวกัน ส่วน `Streamable HTTP` ใช้กับ remote server"],
          [
            "ใช้ `stdio` เมื่อรัน Server เป็น subprocess บนเครื่องเดียวกับ Host และใช้ `Streamable HTTP` เมื่อโฮสต์ Server แยกบนเครือข่ายสำหรับหลายผู้ใช้พร้อมระบบ Auth",
            "ถูก — `stdio` เรียบง่ายและไม่เปิดพอร์ต ส่วน `Streamable HTTP` รองรับ remote deployment, auth และ SSE streaming",
          ],
          ["`stdio` ใช้ได้เฉพาะภาษา JavaScript ส่วน `Streamable HTTP` ใช้ได้เฉพาะ Python", "ทั้งสอง transport เป็นมาตรฐานกลาง ใช้ได้กับทุกภาษาที่มี MCP SDK"],
          ["ต้องใช้ทั้งสองแบบพร้อมกันใน Server เดียวเสมอ", "เลือก transport ให้เหมาะกับรูปแบบการ deploy ของระบบ"],
        ],
        "B",
        "Local tool/CLI/IDE มักเริ่มจาก `stdio` เพราะไม่ต้องตั้งเซิร์ฟเวอร์เครือข่าย ส่วนระบบองค์กรหลายผู้ใช้ใช้ `Streamable HTTP` ผ่าน HTTPS + Auth",
        "เกณฑ์เลือกระหว่าง MCP stdio กับ Streamable HTTP คืออะไร?",
        "stdio เหมาะกับ local subprocess บนเครื่องเดียวกับ Host (ห้าม print ลง stdout); Streamable HTTP เหมาะกับ remote multi-user server ผ่าน HTTPS + Auth",
      ),
      mc(
        "d113-q4",
        "เหตุใดเราจึงไม่ควรปล่อยให้ MCP Server เปิด Tool แบบ `run_sql(query: str)` ให้ LLM ใช้งานโดยตรง?",
        [
          ["เพราะ JSON-RPC ส่ง string ยาว ๆ ไม่ได้", "JSON-RPC ส่ง string ได้ แต่ปัญหาหลักคือความปลอดภัย (Excessive Agency)"],
          ["เพราะ SQLite ไม่รองรับคำสั่ง SELECT", "SQLite รองรับ SQL เต็มรูปแบบ"],
          [
            "เพราะละเมิดหลัก Least-Privilege ทำให้เมื่อเกิด Prompt Injection โมเดลอาจถูกหลอกให้ดึงข้อมูลลับข้ามสิทธิ์หรือลบข้อมูลได้",
            "ถูก — ควรเปิดเฉพาะ Tool แคบ ๆ ที่มี schema ชัดเจน เช่น `get_order_status(order_id)` และแยก write action ไว้หลังด่านอนุมัติ",
          ],
          ["เพราะ MCP ห้ามเชื่อมต่อกับฐานข้อมูลทุกชนิด", "MCP ใช้เชื่อมต่อฐานข้อมูลได้ แต่ต้องห่อด้วย Tool/Resource ที่จำกัดขอบเขตอย่างปลอดภัย"],
        ],
        "C",
        "หลัก Least-Privilege จำกัดความเสียหายแม้โมเดลจะถูกหลอกด้วย Prompt Injection โดยให้เปิดเฉพาะฟังก์ชันที่จำเป็นพร้อม Pydantic validation และสิทธิ์เท่าที่ใช้จริง",
        "ทำไมการออกแบบ MCP Tool จึงต้องยึดหลัก Least-Privilege?",
        "เพื่อจำกัดความเสียหายหาก LLM พลาดหรือโดน Prompt Injection — เปิดเฉพาะ tool แคบ ๆ พร้อม schema validation และแยก write action ไว้หลัง approval gate",
      ),
    ],
  },

  takeaways: [
    "**MCP แยก 3 บทบาท**: **Host** (แอปหลักคุมสิทธิ์/LLM) ↔ **Client** (1:1 session) ↔ **Server** (ผู้เปิดเผยความสามารถตามสเปก JSON-RPC 2.0)",
    "เลือก Primitive ให้ตรงงาน: **Resources** (อ่านอย่างเดียวด้วย URI), **Tools** (ฟังก์ชันสั่งงาน), **Prompts** (เทมเพลตคำสั่งผู้ใช้)",
    "เลือก **`stdio`** สำหรับ local subprocess (ระวังห้าม `print` ลง `stdout`) และ **`Streamable HTTP`** สำหรับ remote multi-user server",
    "บังคับ **Least-Privilege + Allowlist + HITL Approval** ในโค้ดฝั่ง Host/Client เสมอ อย่าฝากความปลอดภัยไว้กับ System Prompt อย่างเดียว",
  ],

  reviewCards: [
    rc(
      "d113-rc-1",
      "สรุปความสัมพันธ์ระหว่าง Host, MCP Client และ MCP Server ในสถาปัตยกรรม MCP",
      "Host คือแอป AI หลักที่ถือ LLM และ security policy; Host สร้าง MCP Client แบบ 1:1 เพื่อคุยกับแต่ละ MCP Server ผ่าน JSON-RPC 2.0",
    ),
    rc(
      "d113-rc-2",
      "แยกความต่างระหว่าง Tools, Resources และ Prompts ใน MCP",
      "Resources = ข้อมูล read-only อ้างอิงด้วย URI (app-controlled), Tools = ฟังก์ชันสั่งงานพร้อม schema (model-controlled), Prompts = เทมเพลตคำสั่ง (user-controlled)",
    ),
    rc(
      "d113-rc-3",
      "ข้อผิดพลาดยอดฮิตเมื่อเขียน MCP Server แบบ stdio ใน Python คืออะไร และแก้อย่างไร?",
      "เผลอใช้ print() ออก stdout จนไปปนกับข้อความ JSON-RPC ทำให้ Client parse พัง → ต้องส่ง log ไปที่ stderr แทน",
    ),
  ],

  sources: [
    { label: "Model Context Protocol (MCP) — Architecture Overview", href: "https://modelcontextprotocol.io/docs/concepts/architecture" },
    { label: "Model Context Protocol (MCP) Official Documentation", href: "https://modelcontextprotocol.io/" },
    { label: "Anthropic — Building Effective Agents", href: "https://www.anthropic.com/research/building-effective-agents" },
    { label: "OWASP Top 10 for LLM Applications (LLM06 Excessive Agency)", href: "https://genai.owasp.org/llm-top-10/" },
  ],

  glossary: ["mcp", "tool-calling", "schema", "payload", "pydantic", "hitl", "prompt-injection"],
});
