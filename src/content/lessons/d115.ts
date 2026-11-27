import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D115 — Phase 4 / Block B29
 * Connecting Your AI App to an MCP Server Safely
 */
export const d115: Lesson = defineLesson({
  day: 115,
  titleTh: "เชื่อมต่อแอป AI เข้ากับ MCP Server อย่างปลอดภัย: Allowlist, Timeout และ Schema Adapter",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ใช้ ClientSession เชื่อม MCP Server พร้อม Allowlist, Per-Call Timeout และ Graceful Fallback",
  icon: "plug",
  visual: {
    id: "mcp-server-client",
    title: "Safe MCP Client Integration — Allowlist, Timeout & Least-Privilege Bridge",
    caption: "ดูขั้นตอน Client discovery (`tools/list`), กรองเฉพาะเครื่องมือที่อนุญาต, ตรวจ schema และคุม timeout ทุกการเรียก",
    alt: "แผนภาพการเชื่อมต่อ MCP Client อย่างปลอดภัย",
  },
  requiresApiKey: false,
  tools: ["MCP Python SDK", "asyncio", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "คัดกรองและแปลง MCP Tool Schema ก่อนส่งเข้า LLM",
      body: "เมื่อแอป AI เชื่อมต่อกับ {{mcp}} Server ภายนอก เราไม่ควรส่งรายการ `tools/list` ทั้งหมดเข้าสู่ context ของโมเดลโดยตรง เพราะ Server อาจเพิ่มเครื่องมืออันตรายหรือซ่อนข้อความหลอกไว้ในคำอธิบาย",
      lessonNote: "วันนี้เราจะสร้าง Schema Adapter + Client-side Allowlist ที่แปลงเฉพาะเครื่องมือที่อนุญาตให้พร้อมใช้กับ {{tool-calling}} ของ LLM SDK",
    },
    {
      node: 3,
      heading: "ทดสอบโหมดล้มเหลวของ Server ด้วย Mock Async Session",
      body: "เราไม่ควรรอให้ MCP Server ล่มหรือค้างใน Production แล้วค่อยรู้ว่าแอปแครช การจำลอง session ด้วย {{mocking}} ใน {{pytest}} ช่วยพิสูจน์พฤติกรรมทุกขอบเขตได้ทันที",
      lessonNote: "แบบฝึกหัดวันนี้ทดสอบครบทั้งเครื่องมือที่ไม่อนุญาต, Server ช้าเกิน timeout และ Server ตัดการเชื่อมต่อกะทันหัน",
    },
    {
      node: 4,
      heading: "ห่อ ClientSession ด้วย Safe Bridge ที่คุม Lifecycle และ Timeout",
      body: "ทุกการเรียกข้ามโปรเซส (`stdio`) หรือข้ามเครือข่าย (`Streamable HTTP`) อาจค้างหรือหลุดได้ แอป AI ต้องจัดการ `async with` lifecycle และคุมเวลาด้วย `asyncio.wait_for` เสมอ",
      lessonNote: "คุณจะได้สร้างคลาส `SafeMCPBridge` ที่คืนผลลัพธ์แบบมีโครงสร้างแม้เกิด `TimeoutError` หรือ `ConnectionError`",
    },
    {
      node: 5,
      heading: "ป้องกัน Server Drift และเตรียม Circuit Breaker เมื่อเครื่องมือรวน",
      body: "MCP Server ที่เคยปลอดภัยวันนี้อาจถูกอัปเดตเพิ่มเครื่องมือใหม่ในวันพรุ่งนี้ การตรวจ allowlist และเก็บ error code เป็น {{guardrails}} ช่วยให้ทีมเห็นความผิดปกติทันที",
      lessonNote: "แนวคิด timeout + fallback วันนี้ต่อยอดจาก {{circuit-breaker}} ใน Phase 1 เพื่อให้ระบบ AI ลดระดับการทำงานได้อย่างนุ่มนวล",
    },
  ],

  objectives: [
    "**เชื่อมต่อ MCP Server อย่างถูกวิธี** ด้วย `stdio_client` + `ClientSession` ภายใต้ `async with` ของ {{asyncio}} เพื่อทำ `initialize()`, `list_tools()` และปิด subprocess อย่างสะอาด",
    "**บังคับ Client-Side Tool Allowlist และ Schema Adapter** เพื่อป้องกัน Server Drift / Tool Poisoning ({{prompt-injection}} ในคำอธิบายเครื่องมือ) ก่อนส่ง JSON {{schema}} เข้า LLM SDK",
    "**คุม Per-Call Timeout และ Graceful Fallback** ด้วย `asyncio.wait_for` เพื่อไม่ให้ Server ที่ช้าหรือหลุดการเชื่อมต่อทำทั้งแอป AI ค้างหรือ crash",
  ],

  prerequisites: [
    "เข้าใจการสร้าง Local MCP Server และ Tools/Resources (แนะนำ Day 113–114)",
    "เข้าใจ `async`/`await`, `asyncio.wait_for` และ context manager (แนะนำ Day 17–18)",
    "เข้าใจ {{tool-calling}} JSON Schema และ {{pydantic}} `BaseModel` (Day 1, Day 109)",
    "ไม่ต้องใช้ API key — ทดสอบ Safe MCP Client Bridge กับ Fake Async Session ได้ 100%",
  ],

  setup: {
    intro:
      "เตรียมสภาพแวดล้อมด้วย `mcp` Python SDK และ `pydantic` พร้อม `pytest` และ `ruff` สำหรับเขียนและทดสอบ Safe MCP Client Bridge",
    commands: `uv init ai-day115 && cd ai-day115
uv add mcp pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day115` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `mcp`, `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["ready", "ตรวจว่า `uv run python -c \"from mcp import ClientSession; print('ok')\"` แสดง `ok`"],
    ],
    note: "แบบฝึกหัดวันนี้ใช้ `asyncio.run(...)` ร่วมกับ `pytest` ธรรมดาโดยไม่ต้องติดตั้ง plugin เสริม เพื่อให้รันบนเครื่องได้ทันที 100%",
  },

  concepts: [
    {
      id: "client-session-lifecycle",
      title: "1 · วงจรชีวิต MCP ClientSession: Connect, Initialize และปิดให้สะอาด",
      paragraphs: [
        "ฝั่งแอป AI (Host) ใช้ `mcp` Python SDK เปิดการเชื่อมต่อกับ Server ผ่าน **Asynchronous Context Manager (`async with`)** สองชั้น: ชั้นนอกคือ Transport (เช่น `stdio_client(StdioServerParameters(...))` หรือ Streamable HTTP client) และชั้นในคือ `ClientSession(read, write)`",
        "หลังเปิด session ต้องเรียก **`await session.initialize()`** เสมอเพื่อทำ handshake แลกเปลี่ยนเวอร์ชันโปรโตคอลและความสามารถ จากนั้นจึงค่อยเรียก `await session.list_tools()`, `await session.read_resource(...)` หรือ `await session.call_tool(...)`",
        "การใช้ `async with` มีความสำคัญมากใน {{asyncio}} เพราะรับประกันว่าเมื่อจบงานหรือเกิด exception โปรเซสลูกของ `stdio` Server จะถูกปิดอย่างสะอาด ไม่ค้างเป็น zombie process กินแรมบนเครื่องหรือเซิร์ฟเวอร์",
      ],
      analogy:
        "`async with stdio_client(...)` เหมือนการเช่าห้องประชุมพร้อมระบบปิดไฟอัตโนมัติ: เข้าห้องแล้วทักทายกัน (`initialize`) ทำงานเสร็จหรือเกิดเหตุขัดข้อง ประตูและไฟก็ปิดเองทุกครั้งไม่มีลืมเปิดทิ้งไว้",
      code: {
        language: "python",
        filename: "mcp_client_connect.py",
        code: `import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def list_server_tools() -> list[str]:
    params = StdioServerParameters(
        command="uv",
        args=["run", "python", "thai_support_server.py"],
    )
    async with stdio_client(params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            result = await session.list_tools()
            return [tool.name for tool in result.tools]


if __name__ == "__main__":
    print(asyncio.run(list_server_tools()))`,
        caption: "โครงสร้างมาตรฐานการเปิด MCP Client แบบ `stdio` ด้วย `async with` สองชั้นและ `await session.initialize()`",
      },
      whyTitle: "Why this matters — ป้องกัน Resource Leak ในแอป AI ที่รันต่อเนื่อง",
      whyParagraphs: [
        "ถ้าแอปแชตหรือ API Backend ของคุณสร้าง subprocess MCP Server ใหม่โดยไม่ปิด stream ให้เรียบร้อย เพียงไม่กี่ร้อยคำขอเครื่องจะเต็มไปด้วยโปรเซสค้างจน out-of-memory",
        "ใน Production FastAPI (Phase 5) เราจะยึด pattern เดียวกันนี้ใน application lifespan หรือจัดการ connection pool ให้อยู่ภายใต้ context manager เสมอ",
      ],
    },
    {
      id: "allowlist-and-schema-adapter",
      title: "2 · Client-Side Allowlist & Schema Adapter: กัน Tool Drift และ Tool Poisoning",
      paragraphs: [
        "ข้อผิดพลาดด้านความปลอดภัยที่พบบ่อยคือการเอาผล `await session.list_tools()` ทั้งหมดจาก MCP Server ยัดให้ LLM ใช้งานทันที แนวคิดนี้เปราะบางมากต่อสองภัยคุกคาม: **(1) Server Drift** (Server ถูกอัปเดตเพิ่ม tool อันตรายอย่าง `delete_customer` โดยทีมฝั่งแอปไม่รู้ตัว) และ **(2) Tool Poisoning** (คำอธิบาย `description` ของ tool แอบฝังคำสั่ง {{prompt-injection}} ให้โมเดลขโมยข้อมูล)",
        "ทางแก้ระดับวิศวกรรมคือสร้าง **Client-Side Allowlist** (`allowed_tools: frozenset[str]`) เพื่อกรองทั้งตอน discovery (`list_tools`) และตรวจซ้ำอีกครั้งก่อนเรียกจริง (`call_tool`) แม้ Server จะประกาศเครื่องมือ 20 ตัว แอปของคุณก็จะเห็นและอนุญาตเรียกเฉพาะรายการที่ทีมอนุมัติไว้เท่านั้น",
        "เมื่อผ่าน allowlist แล้ว เราจะแปลงสเปกของ MCP Tool (`name`, `description`, `inputSchema`) เป็นรูปแบบ JSON {{schema}} ที่ LLM SDK ต้องการ (เช่น OpenAI/Anthropic function schema) พร้อมตัดความยาว `description` และทำความสะอาดข้อความเพื่อเป็น {{guardrails}} ขั้นต้น",
      ],
      analogy:
        "เหมือนร้านอาหารที่รับวัตถุดิบจากซัพพลายเออร์: แม้ซัพพลายเออร์จะส่งกล่องของแถมปริศนามาด้วย เชฟก็หยิบเข้าครัวเฉพาะรายการที่อยู่ในใบสั่งซื้อ (Allowlist) และตรวจป้ายฉลากก่อนปรุงทุกครั้ง",
      bullets: [
        "**Allowlist สองชั้น**: กรองตอน `discover` เพื่อไม่ให้ LLM เห็นเครื่องมือต้องห้าม และตรวจซ้ำก่อน `call_tool` เพื่อกันโมเดลเดาชื่อเครื่องมือเอง",
        "**Sanitize & Truncate Description**: จำกัดความยาว `description` (เช่นไม่เกิน 200–300 ตัวอักษร) และบันทึก log เมื่อ schema ของ Server เปลี่ยนจากเดิม",
        "**Schema Adapter แบบ Deterministic**: เรียงลำดับเครื่องมือตามชื่อ (`sorted`) เพื่อให้ prompt คงที่และได้ประโยชน์จาก Prompt Caching",
      ],
      whyTitle: "Why this matters — อย่าให้ความปลอดภัยของแอปขึ้นกับโค้ดของ Server ภายนอก",
      whyParagraphs: [
        "ในองค์กรจริง ทีมที่ดูแล MCP Server (เช่น ทีม CRM หรือทีมภายนอก) มักเป็นคนละทีมกับคนที่ดูแลแอป AI การมี Client-Side Allowlist ทำให้การเปลี่ยนแปลงฝั่ง Server ไม่สามารถขยายสิทธิ์ของแอป AI โดยพลการ",
        "นอกจากนี้ การเรียงชื่อเครื่องมือให้คงที่ทุกครั้งยังช่วยให้ระบบ evaluation และ test suite ทำซ้ำผลได้ 100%",
      ],
    },
    {
      id: "timeouts-and-graceful-fallback",
      title: "3 · Per-Call Timeout และ Graceful Fallback เมื่อ Server ช้าหรือหลุด",
      paragraphs: [
        "การเรียกเครื่องมือผ่าน MCP มีความไม่แน่นอนเหมือนการเรียก API ภายนอก ({{httpx}} ใน Phase 1): ฐานข้อมูลหลัง Server อาจถูกล็อก, เน็ตเวิร์กของ Streamable HTTP อาจกระตุก หรือ subprocess อาจ crash กลางคัน หากคุณ `await session.call_tool(...)` โดยไม่กำหนด timeout แอป AI อาจค้างรอผู้ใช้ไปตลอดกาล",
        "เราจึงต้องห่อทุกการเรียก `call_tool` ด้วย **`asyncio.wait_for(..., timeout=timeout_s)`** และจับข้อผิดพลาดหลักให้ครบ ได้แก่ `TimeoutError` (เกินเวลา) และ `ConnectionError` / `OSError` (Server หลุดหรือโปรเซสตาย)",
        "เมื่อเกิดข้อผิดพลาด แทนที่จะปล่อย exception พังทั้ง request ให้คืน **Structured Fallback Outcome** (เช่น `ok=False`, `error_code=\"timeout\"`, `message=\"ระบบค้นหาออเดอร์ตอบสนองช้ากว่ากำหนด กรุณาลองใหม่หรือส่งต่อเจ้าหน้าที่\"`) เพื่อให้ LLM อ่านแล้วสื่อสารกับผู้ใช้ได้อย่างสุภาพและไม่แต่งคำตอบมั่ว — และหากล้มเหลวติดกันหลายครั้งก็สามารถผูก {{circuit-breaker}} ตัดวงจรชั่วคราวได้",
      ],
      analogy:
        "เหมือนพนักงานคอลเซ็นเตอร์ที่โทรเช็กคลังสินค้า: ถ้ารอสายเกิน 5 วินาทีหรือสายหลุด พนักงานจะไม่ถือหูค้างเงียบไปครึ่งชั่วโมง แต่จะวางสายแล้วแจ้งลูกค้าอย่างสุภาพว่าระบบคลังขัดข้องชั่วคราว",
      code: {
        language: "python",
        filename: "safe_call_pattern.py",
        code: `import asyncio
from typing import Any


async def call_with_timeout(session: Any, name: str, args: dict[str, Any], timeout_s: float = 2.0) -> dict[str, Any]:
    try:
        data = await asyncio.wait_for(session.call_tool(name, args), timeout=timeout_s)
        return {"ok": True, "data": data, "error_code": None}
    except TimeoutError:
        return {"ok": False, "data": None, "error_code": "timeout"}
    except (ConnectionError, OSError):
        return {"ok": False, "data": None, "error_code": "server_disconnected"}`,
        caption: "`asyncio.wait_for` คุมเพดานเวลาทุกการเรียกเครื่องมือ และแปลงความล้มเหลวเป็นผลลัพธ์ที่มีโครงสร้าง",
      },
      whyTitle: "Why this matters — แอป AI ที่ดีต้องพังอย่างสง่างาม (Graceful Degradation)",
      whyParagraphs: [
        "ผู้ใช้ยอมรับได้ถ้าผู้ช่วยบอกว่า *\"ตอนนี้ระบบเช็กสถานะออเดอร์ขัดข้องชั่วคราว แต่ฉันช่วยตอบเรื่องนโยบายคืนเงินจากคลังเอกสารให้ได้ก่อน\"* แต่ผู้ใช้จะหมดความเชื่อถือทันทีถ้าแชตค้างหมุนตลอดไปหรือพ่น stack trace 500 ออกหน้าจอ",
        "การคืน `error_code` ที่ชัดเจนยังช่วยให้ชั้น Agent (LangGraph ใน Block B30) ตัดสินใจเส้นทางสำรองหรือส่งต่อเจ้าหน้าที่ได้อัตโนมัติ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Safe MCP Client Bridge กับ API Gateway / BFF Client",
      body: [
        "หากคุณเคยเขียน Backend-for-Frontend (BFF) หรือ HTTP service client ใน TypeScript/Node.js แนวคิดป้องกันทั้งหมดของวันนี้คือเรื่องเดียวกัน:",
      ],
      table: [
        ["stdio_client + ClientSession", "httpx.AsyncClient / gRPC managed client"],
        ["allowed_tools (Client Allowlist)", "API Gateway route allowlist / RBAC scope"],
        ["asyncio.wait_for(..., timeout=2.0)", "fetch(..., { signal: AbortSignal.timeout(2000) })"],
        ["MCP -> LLM Tool Schema Adapter", "DTO mapper แปลง external schema เป็น internal contract"],
        ["Structured Fallback Outcome", "Result<T, Err> pattern แทนการปล่อย uncaught exception"],
      ],
    },
    student: {
      title: "First-Year Note — `async with` และ `asyncio.wait_for` ทำงานร่วมกันอย่างไร",
      body: [
        "`async with` คือเวอร์ชัน asynchronous ของ `with open(...)` ที่ใช้เปิดและปิดทรัพยากรซึ่งต้องรอ I/O (เช่น การปิด subprocess หรือการปิดการเชื่อมต่อเครือข่าย) โดยการันตีว่าโค้ดทำความสะอาดจะทำงานเสมอแม้เกิด error กลางบล็อก",
        "ส่วน `asyncio.wait_for(coro, timeout=2.0)` จะตั้งนาฬิกาจับเวลา 2 วินาทีให้ coroutine หากครบเวลาแล้วยังไม่เสร็จ Python จะส่งสัญญาณยกเลิก (`CancelledError`) เข้าไปในงานนั้นแล้วโยน `TimeoutError` ออกมาให้เราจับจัดการต่อได้อย่างปลอดภัย",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: แอปผู้ช่วยลูกค้าเชื่อมต่อกับ MCP Server ที่มีเครื่องมือ 3 ตัว (`lookup_order`, `search_faq`, `drop_old_orders`) เราจะสร้าง Safe Bridge ที่อนุญาตเฉพาะ 2 เครื่องมือแรก แปลง schema สำหรับ LLM และทดสอบทั้งกรณีปกติ, กรณีช้าเกิน timeout และกรณี Server หลุด",
    steps: [
      {
        title: "1 · จำลอง MCP Tool Metadata และกรองด้วย Client-Side Allowlist",
        explain:
          "รับรายการ tool จาก `session.list_tools()` แล้วคัดเฉพาะชื่อที่อยู่ใน `allowed_tools` พร้อมเรียงลำดับตามชื่อและตัด `description` ให้สั้นกระชับ",
        code: {
          language: "python",
          filename: "worked_mcp_client.py",
          code: `from dataclasses import dataclass
from typing import Any


@dataclass
class MCPToolDef:
    name: str
    description: str
    input_schema: dict[str, Any]


def to_llm_tools(
    server_tools: list[MCPToolDef],
    allowed_tools: set[str],
    max_desc_chars: int = 120,
) -> list[dict[str, Any]]:
    adapted: list[dict[str, Any]] = []
    for tool in sorted(server_tools, key=lambda t: t.name):
        if tool.name not in allowed_tools:
            continue
        desc = " ".join(tool.description.split())[:max_desc_chars]
        adapted.append(
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": desc,
                    "parameters": tool.input_schema,
                },
            }
        )
    return adapted


raw_tools = [
    MCPToolDef("drop_old_orders", "ลบข้อมูลออเดอร์เก่าทั้งหมด", {"type": "object", "properties": {}}),
    MCPToolDef("lookup_order", "เช็กสถานะออเดอร์แบบอ่านอย่างเดียว", {"type": "object", "properties": {"order_id": {"type": "string"}}}),
]
print([t["function"]["name"] for t in to_llm_tools(raw_tools, {"lookup_order"})])`,
        },
        output: `['lookup_order']`,
      },
      {
        title: "2 · ห่อการเรียก Tool ด้วย Allowlist Guard + Timeout + Graceful Fallback",
        explain:
          "ก่อนเรียก `session.call_tool` ต้องตรวจ allowlist อีกรอบเสมอ จากนั้นใช้ `asyncio.wait_for` เพื่อคุมเวลาและคืนผลลัพธ์เป็น Pydantic `BaseModel`",
        code: {
          language: "python",
          filename: "worked_mcp_client.py",
          code: `import asyncio
from pydantic import BaseModel


class ToolOutcome(BaseModel):
    ok: bool
    tool_name: str
    data: dict[str, Any] | None = None
    error_code: str | None = None
    message: str


async def safe_invoke(
    session: Any,
    allowed_tools: set[str],
    name: str,
    arguments: dict[str, Any],
    timeout_s: float = 0.2,
) -> ToolOutcome:
    if name not in allowed_tools:
        return ToolOutcome(ok=False, tool_name=name, error_code="tool_not_allowed", message="เครื่องมือนี้ไม่อยู่ในรายการที่อนุญาต")
    try:
        res = await asyncio.wait_for(session.call_tool(name, arguments), timeout=timeout_s)
        return ToolOutcome(ok=True, tool_name=name, data=res, message="ok")
    except TimeoutError:
        return ToolOutcome(ok=False, tool_name=name, error_code="timeout", message="การเรียกเครื่องมือเกินเวลาที่กำหนด")
    except (ConnectionError, OSError):
        return ToolOutcome(ok=False, tool_name=name, error_code="server_disconnected", message="ไม่สามารถเชื่อมต่อ MCP Server ได้")`,
        },
        output: `# พร้อมคืน ToolOutcome แบบมีโครงสร้างทุกเส้นทาง ไม่ปล่อย exception หลุด`,
      },
      {
        title: "3 · ทดสอบทั้ง Happy Path, Allowlist Block และ Timeout ในเครื่อง",
        explain:
          "ใช้ Fake Async Session จำลองทั้งการตอบกลับปกติและการค้างเกิน timeout เพื่อยืนยันว่าแอปไม่แครช",
        code: {
          language: "python",
          filename: "worked_mcp_client.py",
          code: `class FakeSession:
    async def call_tool(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        if args.get("order_id") == "SLOW":
            await asyncio.sleep(0.5)
        return {"order_id": args["order_id"], "status": "paid"}


async def demo() -> None:
    session = FakeSession()
    allowed = {"lookup_order"}
    print("OK     :", (await safe_invoke(session, allowed, "lookup_order", {"order_id": "INV-2026-009"})).model_dump())
    print("BLOCKED:", (await safe_invoke(session, allowed, "drop_old_orders", {})).model_dump())
    print("TIMEOUT:", (await safe_invoke(session, allowed, "lookup_order", {"order_id": "SLOW"}, timeout_s=0.05)).model_dump())


asyncio.run(demo())`,
        },
        output: `OK     : {'ok': True, 'tool_name': 'lookup_order', 'data': {'order_id': 'INV-2026-009', 'status': 'paid'}, 'error_code': None, 'message': 'ok'}
BLOCKED: {'ok': False, 'tool_name': 'drop_old_orders', 'data': None, 'error_code': 'tool_not_allowed', 'message': 'เครื่องมือนี้ไม่อยู่ในรายการที่อนุญาต'}
TIMEOUT: {'ok': False, 'tool_name': 'lookup_order', 'data': None, 'error_code': 'timeout', 'message': 'การเรียกเครื่องมือเกินเวลาที่กำหนด'}`,
      },
    ],
    gotcha:
      "จุดสังเกต: การกรองแค่ใน `list_tools()` อย่างเดียวไม่พอ! หาก LLM เคยเห็นชื่อเครื่องมือจาก prompt หรือโดน Prompt Injection โมเดลอาจส่งคำขอ `tools/call` ไปยังชื่อที่ไม่ได้อยู่ในลิสต์ได้ ดังนั้น `safe_invoke` ต้องเช็ก `name in allowed_tools` ซ้ำอีกครั้งก่อนส่งถึง Server เสมอ",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างคลาส `SafeMCPBridge` สำหรับเชื่อมแอป AI เข้ากับ MCP Session อย่างปลอดภัย พร้อม Schema Adapter, Client-Side Allowlist, Per-Call Timeout และ Graceful Fallback เมื่อ Server หลุด",
    requirements: [
      "สร้าง `ToolCallOutcome(BaseModel)` มีฟิลด์ `ok: bool`, `tool_name: str`, `data: dict[str, Any] | None = None`, `error_code: str | None = None`, และ `message: str`",
      "สร้าง `SafeMCPBridge(session, allowed_tools: set[str], timeout_s: float = 1.0, max_desc_chars: int = 120)` โดยตรวจว่า `timeout_s > 0` และ `max_desc_chars > 0` (ไม่งั้นโยน `ValueError`)",
      "เมธอด `async def discover_llm_tools(self) -> list[dict[str, Any]]`: เรียก `await self.session.list_tools()`, กรองเฉพาะ tool ที่ชื่ออยู่ใน `allowed_tools`, เรียงตาม `name` จาก A→Z, ทำความสะอาดช่องว่างใน `description` และตัดไม่ให้เกิน `max_desc_chars`, แล้วคืนรายการในรูปแบบ `{\"type\": \"function\", \"function\": {\"name\": ..., \"description\": ..., \"parameters\": ...}}`",
      "เมธอด `async def invoke_tool(self, name: str, arguments: dict[str, Any]) -> ToolCallOutcome`: ถ้า `name` ไม่อยู่ใน `allowed_tools` ให้คืน `ok=False, error_code=\"tool_not_allowed\"` โดย **ไม่เรียก** `session.call_tool`",
      "เมื่อเรียก `await asyncio.wait_for(self.session.call_tool(name, arguments), timeout=self.timeout_s)`: สำเร็จคืน `ok=True, data=result`, เกินเวลาคืน `ok=False, error_code=\"timeout\"`, และถ้าเกิด `ConnectionError` หรือ `OSError` คืน `ok=False, error_code=\"server_disconnected\"`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day115.py",
      code: `from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Protocol
from pydantic import BaseModel


@dataclass
class MCPToolSpec:
    name: str
    description: str
    input_schema: dict[str, Any]


class MCPClientSessionLike(Protocol):
    async def list_tools(self) -> list[MCPToolSpec]: ...
    async def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]: ...


class ToolCallOutcome(BaseModel):
    ok: bool
    tool_name: str
    data: dict[str, Any] | None = None
    error_code: str | None = None
    message: str


class SafeMCPBridge:
    def __init__(
        self,
        session: MCPClientSessionLike,
        allowed_tools: set[str],
        *,
        timeout_s: float = 1.0,
        max_desc_chars: int = 120,
    ) -> None:
        # TODO: validate timeout_s > 0 และ max_desc_chars > 0 แล้วเก็บค่าไว้
        raise NotImplementedError

    async def discover_llm_tools(self) -> list[dict[str, Any]]:
        # TODO: เรียก list_tools(), กรอง allowlist, เรียงตามชื่อ, ตัด description แล้วแปลงเป็น LLM tool schema
        raise NotImplementedError

    async def invoke_tool(self, name: str, arguments: dict[str, Any]) -> ToolCallOutcome:
        # TODO: ตรวจ allowlist -> asyncio.wait_for(call_tool) -> จับ TimeoutError / ConnectionError / OSError
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day115.py",
      code: `import asyncio
from typing import Any
import pytest
from exercise_day115 import MCPToolSpec, SafeMCPBridge


class FakeMCPSession:
    def __init__(self, *, delay_s: float = 0.0, disconnected: bool = False) -> None:
        self.delay_s = delay_s
        self.disconnected = disconnected
        self.calls: list[tuple[str, dict[str, Any]]] = []

    async def list_tools(self) -> list[MCPToolSpec]:
        return [
            MCPToolSpec("delete_db", "ลบฐานข้อมูลทั้งหมด", {"type": "object", "properties": {}}),
            MCPToolSpec("search_faq", "   ค้นหาเอกสาร   FAQ   ภาษาไทย   " + ("x" * 200), {"type": "object", "properties": {"q": {"type": "string"}}}),
            MCPToolSpec("lookup_order", "ดูสถานะคำสั่งซื้อ", {"type": "object", "properties": {"order_id": {"type": "string"}}}),
        ]

    async def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        self.calls.append((name, arguments))
        if self.disconnected:
            raise ConnectionError("EOF on stdio pipe")
        if self.delay_s > 0:
            await asyncio.sleep(self.delay_s)
        return {"tool": name, "args": arguments, "status": "ok"}


def test_discover_filters_allowlist_sorts_and_truncates():
    session = FakeMCPSession()
    bridge = SafeMCPBridge(session, allowed_tools={"search_faq", "lookup_order"}, max_desc_chars=40)

    tools = asyncio.run(bridge.discover_llm_tools())
    assert [t["function"]["name"] for t in tools] == ["lookup_order", "search_faq"]
    assert len(tools[1]["function"]["description"]) <= 40
    assert "  " not in tools[1]["function"]["description"]
    assert tools[0]["function"]["parameters"]["type"] == "object"


def test_invoke_blocks_disallowed_tool_without_calling_server():
    session = FakeMCPSession()
    bridge = SafeMCPBridge(session, allowed_tools={"lookup_order"})

    outcome = asyncio.run(bridge.invoke_tool("delete_db", {}))
    assert outcome.ok is False
    assert outcome.error_code == "tool_not_allowed"
    assert session.calls == []


def test_invoke_success_and_timeout_fallback():
    fast_bridge = SafeMCPBridge(FakeMCPSession(), allowed_tools={"lookup_order"}, timeout_s=0.5)
    ok_res = asyncio.run(fast_bridge.invoke_tool("lookup_order", {"order_id": "INV-2026-009"}))
    assert ok_res.ok is True
    assert ok_res.data == {"tool": "lookup_order", "args": {"order_id": "INV-2026-009"}, "status": "ok"}

    slow_bridge = SafeMCPBridge(FakeMCPSession(delay_s=0.3), allowed_tools={"lookup_order"}, timeout_s=0.05)
    timeout_res = asyncio.run(slow_bridge.invoke_tool("lookup_order", {"order_id": "INV-2026-009"}))
    assert timeout_res.ok is False
    assert timeout_res.error_code == "timeout"


def test_invoke_handles_server_disconnect_gracefully():
    bridge = SafeMCPBridge(FakeMCPSession(disconnected=True), allowed_tools={"lookup_order"})
    res = asyncio.run(bridge.invoke_tool("lookup_order", {"order_id": "INV-2026-009"}))
    assert res.ok is False
    assert res.error_code == "server_disconnected"


def test_invalid_bridge_config_raises_value_error():
    with pytest.raises(ValueError):
        SafeMCPBridge(FakeMCPSession(), allowed_tools={"lookup_order"}, timeout_s=0)
    with pytest.raises(ValueError):
        SafeMCPBridge(FakeMCPSession(), allowed_tools={"lookup_order"}, max_desc_chars=0)
`,
    },
    selfCheck: [
      "`discover_llm_tools()` กรองเอาเฉพาะชื่อที่อยู่ใน `allowed_tools`, เรียงตามชื่อ A→Z และตัดความยาว `description` ไม่เกิน `max_desc_chars`",
      "`invoke_tool()` ปฏิเสธเครื่องมือที่ไม่อยู่ใน allowlist ด้วย `error_code=\"tool_not_allowed\"` โดยไม่เรียก `session.call_tool` (`session.calls == []`)",
      "กรณี Server ตอบช้าเกิน `timeout_s` คืน `ToolCallOutcome(ok=False, error_code=\"timeout\", ...)` ไม่ปล่อย `TimeoutError` หลุด",
      "กรณี Server หลุดการเชื่อมต่อ (`ConnectionError`/`OSError`) คืน `ToolCallOutcome(ok=False, error_code=\"server_disconnected\", ...)`",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `discover_llm_tools` ใช้ `sorted(tools, key=lambda t: t.name)` และทำความสะอาดช่องว่างด้วย `\" \".join(tool.description.split())[: self.max_desc_chars]` ก่อนสร้าง dict รูปแบบ OpenAI/LLM function schema",
      },
      {
        body: "ใน `invoke_tool` ตรวจ `if name not in self.allowed_tools:` ก่อนเป็นอันดับแรก แล้วค่อยใช้ `try: data = await asyncio.wait_for(self.session.call_tool(name, arguments), timeout=self.timeout_s)` พร้อมจับ `TimeoutError` และ `(ConnectionError, OSError)`",
      },
      {
        body: "โครงของ `SafeMCPBridge` เกือบสมบูรณ์ — เหลือเติมบล็อก `except` ใน `invoke_tool` ให้คืน `ToolCallOutcome` ที่ตรงตามสัญญา",
        code: {
          language: "python",
          filename: "hint_day115.py",
          code: `class SafeMCPBridge:
    def __init__(
        self,
        session: MCPClientSessionLike,
        allowed_tools: set[str],
        *,
        timeout_s: float = 1.0,
        max_desc_chars: int = 120,
    ) -> None:
        if timeout_s <= 0 or max_desc_chars <= 0:
            raise ValueError("timeout_s and max_desc_chars must be > 0")
        self.session = session
        self.allowed_tools = set(allowed_tools)
        self.timeout_s = timeout_s
        self.max_desc_chars = max_desc_chars

    async def discover_llm_tools(self) -> list[dict[str, Any]]:
        raw_tools = await self.session.list_tools()
        result: list[dict[str, Any]] = []
        for tool in sorted(raw_tools, key=lambda t: t.name):
            if tool.name not in self.allowed_tools:
                continue
            desc = " ".join(tool.description.split())[: self.max_desc_chars]
            result.append(
                {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": desc,
                        "parameters": tool.input_schema,
                    },
                }
            )
        return result

    async def invoke_tool(self, name: str, arguments: dict[str, Any]) -> ToolCallOutcome:
        if name not in self.allowed_tools:
            return ToolCallOutcome(ok=False, tool_name=name, error_code="tool_not_allowed", message="Tool not allowed")
        # TODO: await asyncio.wait_for(...) และจับ TimeoutError / (ConnectionError, OSError)
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
      title: "ส่งผล session.list_tools() ทั้งหมดให้ LLM โดยไม่มี Client-Side Allowlist",
      symptom: "เมื่อ MCP Server ภายนอกอัปเดตเพิ่ม tool ใหม่ที่มีสิทธิ์แก้ไขหรือลบข้อมูล แอป AI ของคุณจะมองเห็นและเรียกใช้ได้ทันทีโดยไม่ได้รับอนุญาต",
      fix: "บังคับ allowlist ทั้งตอน `discover_llm_tools()` และตรวจซ้ำใน `invoke_tool()` ก่อนส่งถึง Server เสมอ",
    },
    {
      title: "เรียก await session.call_tool(...) โดยไม่ใส่ Timeout",
      symptom: "เมื่อฐานข้อมูลหลัง Server ค้างหรือเน็ตเวิร์กสะดุด คำขอแชตของผู้ใช้ค้างหมุนตลอดกาลและกิน worker slot ของเซิร์ฟเวอร์จนเต็ม",
      fix: "ห่อทุกการเรียก `call_tool` ด้วย `asyncio.wait_for(..., timeout=...)` และคืน structured fallback เมื่อเกินเวลา",
    },
    {
      title: "เปิด stdio_client โดยไม่ใช้ async with จนเกิด Zombie Subprocess",
      symptom: "รันแอปไปสักพักหน่วยความจำเต็ม มีโปรเซส Python ของ MCP Server ค้างอยู่หลายสิบตัว",
      fix: "จัดการ `stdio_client(...)` และ `ClientSession(...)` ภายใน `async with` (หรือ `AsyncExitStack` ใน FastAPI lifespan) เพื่อปิด stream และ subprocess เสมอ",
    },
    {
      title: "ปล่อย ConnectionError หรือ TimeoutError พังทั้ง Agent Loop",
      symptom: "ผู้ใช้เห็น HTTP 500 หรือ stack trace ดิบ ทั้งที่แชตยังสามารถตอบคำถามส่วนอื่นจากคลังความรู้ได้",
      fix: "แปลง error ของ transport เป็น `ToolCallOutcome(ok=False, error_code=...)` เพื่อให้ LLM หรือ Router จัดการ fallback ได้อย่างนุ่มนวล",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d115-q1",
        "ทำไมฝั่ง MCP Client จึงควรบังคับ **Allowlist** ทั้งตอน `list_tools()` และตรวจซ้ำก่อน `call_tool()`?",
        [
          ["เพราะ MCP Server ไม่สามารถกรองชื่อเครื่องมือเองได้", "Server กรองได้ แต่ฝั่ง Client ต้องป้องกันแบบ Defense-in-Depth ด้วยตัวเอง"],
          [
            "เพื่อป้องกัน Server Drift (Server แอบเพิ่ม tool อันตรายภายหลัง) และกันกรณี LLM ถูกหลอกให้เรียกชื่อเครื่องมือนอกรายการที่อนุญาต",
            "ถูก — กรองตอน discovery เพื่อไม่ให้โมเดลเห็น และตรวจซ้ำตอน invoke เพื่อบังคับสิทธิ์จริงที่ระดับโค้ด",
          ],
          ["เพราะ LLM SDK รับ tool ได้ไม่เกิน 1 ตัวเท่านั้น", "LLM SDK รองรับหลาย tool ได้ แต่ต้องคัดกรองสิทธิ์ให้แคบที่สุด"],
          ["เพื่อให้ข้ามขั้นตอน `session.initialize()` ได้", "`session.initialize()` ยังจำเป็นต้องทำตอนเริ่ม session เสมอ"],
        ],
        "B",
        "Client-Side Allowlist เป็นด่านป้องกันฝั่ง Host ต่อทั้ง Server Drift และ Prompt Injection โดยต้องตรวจทั้งตอน discovery และก่อน execution จริง",
        "เหตุใด Client-Side Tool Allowlist จึงต้องตรวจทั้งตอน `list_tools` และก่อน `call_tool`?",
        "เพื่อป้องกัน Server Drift / Tool Poisoning ตอน discovery และป้องกันไม่ให้ LLM ที่โดน Prompt Injection เรียกชื่อเครื่องมือนอกสิทธิ์ตอน execution",
      ),
      mc(
        "d115-q2",
        "เมื่อ MCP Server ค้างไม่ตอบกลับภายใน 2 วินาที โค้ดฝั่ง AI App ควรจัดการอย่างไร?",
        [
          ["รอต่อไปเรื่อย ๆ จนกว่าจะตอบ เพราะเครื่องมืออาจกำลังทำงานสำคัญ", "การรอแบบไร้ขีดจำกัดจะทำให้แอปค้างและกินทรัพยากร worker จนระบบล่ม"],
          ["สั่งฆ่าโปรเซสของแอปหลัก (Host) แล้วเริ่มใหม่", "ไม่ควรทำให้แอปหลักล่มเพราะเครื่องมือภายนอกหนึ่งตัวช้า"],
          [
            "คุมเวลาด้วย `asyncio.wait_for(..., timeout=2.0)` แล้วจับ `TimeoutError` เพื่อคืน structured fallback outcome ให้แอปสื่อสารกับผู้ใช้หรือใช้แผนสำรอง",
            "ถูก — การคุม timeout และคืนผลลัพธ์แบบมีโครงสร้างช่วยให้แอป AI ทำงานต่อได้อย่างนุ่มนวล",
          ],
          ["เปลี่ยนจาก `asyncio` เป็น `time.sleep(2)` เพื่อรอให้ครบเวลา", "`time.sleep` บล็อก event loop และไม่ได้ยกเลิกคำขอที่ค้าง"],
        ],
        "C",
        "การใช้ `asyncio.wait_for` คู่กับ structured fallback (`error_code=\"timeout\"`) ป้องกันไม่ให้เครื่องมือที่ช้าทำทั้งแอป AI ค้างหรือแครช",
        "วิธีคุม timeout และ fallback เมื่อเรียก MCP Tool ผ่าน asyncio คืออะไร?",
        "ห่อ `session.call_tool(...)` ด้วย `asyncio.wait_for(..., timeout=...)` แล้วจับ `TimeoutError` เพื่อคืน structured fallback แทนการปล่อยให้ค้างหรือ crash",
      ),
      mc(
        "d115-q3",
        "ข้อใดคือความสำคัญของการใช้ `async with stdio_client(...)` และ `async with ClientSession(...)` ซ้อนกัน?",
        [
          ["ช่วยให้ไม่ต้องใส่ API key เมื่อเรียก LLM", "Context manager เกี่ยวกับการจัดการ lifecycle ของ transport/session ไม่ใช่เรื่อง API key"],
          [
            "รับประกันว่าเมื่อจบงานหรือเกิด exception ระบบจะปิด stream และโปรเซสลูกของ MCP Server อย่างสะอาด ไม่เกิด zombie process",
            "ถูก — การปิด subprocess และ pipe อย่างเป็นระบบป้องกัน memory/process leak ในระยะยาว",
          ],
          ["ทำให้แปลง `stdio` เป็น HTTPS โดยอัตโนมัติ", "`stdio_client` สื่อสารผ่าน stdin/stdout ของ subprocess เท่านั้น"],
          ["ทำให้ข้ามการตรวจ JSON Schema ได้", "ยังต้องตรวจ schema และ allowlist ตามปกติ"],
        ],
        "B",
        "`async with` การันตี cleanup ของทั้ง session และ subprocess transport แม้จะเกิดข้อผิดพลาดระหว่างทำงาน",
        "ทำไมการเชื่อมต่อ MCP Client แบบ stdio จึงต้องใช้ `async with` เสมอ?",
        "เพื่อรับประกันว่า stream และ subprocess ของ MCP Server จะถูกปิดอย่างสะอาดแม้เกิด exception ป้องกัน resource leak และ zombie process",
      ),
      mc(
        "d115-q4",
        "ความเสี่ยง **Tool Poisoning** ในระบบนิเวศ MCP คืออะไร?",
        [
          ["การที่ฐานข้อมูล SQLite มีข้อมูลซ้ำกันหลายแถว", "นั่นคือปัญหาข้อมูลซ้ำ ไม่ใช่ Tool Poisoning"],
          ["การที่สาย LAN หลุดระหว่างเชื่อมต่อ Streamable HTTP", "นั่นคือปัญหาการเชื่อมต่อเครือข่าย (`server_disconnected`)"],
          [
            "การที่คำอธิบาย (`description`) หรือ metadata ของ MCP Tool แอบฝังคำสั่ง Prompt Injection เพื่อหลอกให้ LLM ส่งข้อมูลลับหรือเรียกเครื่องมือผิดวัตถุประสงค์",
            "ถูก — จึงต้องใช้ allowlist, ตรวจ/จำกัดความยาว description และเชื่อเฉพาะ MCP Server ที่ตรวจสอบแล้วเท่านั้น",
          ],
          ["การตั้งชื่อฟังก์ชัน Python เป็นตัวพิมพ์เล็กทั้งหมด", "ตัวพิมพ์เล็ก (`snake_case`) เป็นมาตรฐานปกติของ Python"],
        ],
        "C",
        "Tool Poisoning อาศัยข้อความใน `description` ของ MCP Tool แฝงคำสั่งหลอก LLM ให้กระทำนอกเหนือเจตนาของผู้ใช้",
        "Tool Poisoning ใน MCP คืออะไร และฝั่ง Client ลดความเสี่ยงเบื้องต้นได้อย่างไร?",
        "คือการแอบฝัง Prompt Injection ไว้ใน description/metadata ของ Tool — ลดความเสี่ยงได้ด้วย Client-Side Allowlist, การคัดกรอง/จำกัด description และเชื่อมเฉพาะ Server ที่เชื่อถือได้",
      ),
    ],
  },

  takeaways: [
    "เชื่อมต่อ MCP Server ด้วย **`async with stdio_client(...)`** + **`async with ClientSession(...)`** และเรียก `await session.initialize()` เสมอเพื่อปิด subprocess อย่างสะอาด",
    "บังคับ **Client-Side Tool Allowlist สองชั้น** (ตอน `discover_llm_tools` และตอน `invoke_tool`) เพื่อกัน Server Drift และ Tool Poisoning ({{prompt-injection}})",
    "แปลง MCP Tool Schema ให้เป็นรูปแบบที่ LLM SDK ต้องการแบบ **deterministic** (เรียงตามชื่อ + ทำความสะอาดและจำกัดความยาว `description`)",
    "ห่อทุก `call_tool` ด้วย **`asyncio.wait_for`** และคืน **Structured Fallback Outcome** เมื่อเกิด `TimeoutError` หรือ `ConnectionError` เพื่อให้แอป AI พังอย่างสง่างาม",
  ],

  reviewCards: [
    rc(
      "d115-rc-1",
      "ลำดับขั้นตอนมาตรฐานในการเชื่อมต่อ MCP Client (Python SDK) แบบ `stdio` คืออะไร?",
      "เปิด `async with stdio_client(params)` → เปิด `async with ClientSession(read, write)` → เรียก `await session.initialize()` → ค้นพบด้วย `list_tools()` (กรอง allowlist) → เรียก `call_tool()` ภายใต้ timeout",
    ),
    rc(
      "d115-rc-2",
      "ทำไมจึงห้ามส่งผล `session.list_tools()` ทั้งหมดจาก MCP Server ภายนอกเข้า LLM โดยตรง?",
      "เพื่อป้องกัน Server Drift (เพิ่มเครื่องมืออันตรายภายหลัง) และ Tool Poisoning (ฝัง Prompt Injection ใน description) — ต้องกรองด้วย Client-Side Allowlist และตรวจซ้ำก่อนเรียกจริงเสมอ",
    ),
    rc(
      "d115-rc-3",
      "เมื่อ `session.call_tool()` ช้าเกินกำหนดหรือ Server หลุด ควรจัดการอย่างไรแทนการปล่อย exception หลุด?",
      "ใช้ `asyncio.wait_for(..., timeout=...)` แล้วจับ `TimeoutError` และ `ConnectionError`/`OSError` คืนเป็น structured fallback outcome (`ok=False`, `error_code`) ให้แอป AI ตอบกลับอย่างสุภาพ",
    ),
  ],

  sources: [
    { label: "MCP Official Quickstart — Build an MCP Client (Python)", href: "https://modelcontextprotocol.io/quickstart/client" },
    { label: "Official MCP Python SDK — ClientSession & Transports", href: "https://github.com/modelcontextprotocol/python-sdk" },
    { label: "MCP Specification — Security Best Practices", href: "https://modelcontextprotocol.io/specification/2025-03-26/basic/security_best_practices" },
    { label: "Python asyncio Documentation — Timeouts (asyncio.wait_for)", href: "https://docs.python.org/3/library/asyncio-task.html#timeouts" },
  ],

  glossary: ["mcp", "tool-calling", "asyncio", "schema", "guardrails", "prompt-injection", "circuit-breaker", "mocking"],
});
