import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D110 — Phase 4 / Block B28
 * Safe Tool Design: Idempotency, Timeouts, Least Privilege & Read vs Write Separation
 */
export const d110: Lesson = defineLesson({
  day: 110,
  titleTh: "การออกแบบ Safe Tools: Idempotency, Timeouts, Least Privilege และการแยก Read vs Write",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ป้องกันการรันคำสั่งซ้ำด้วย Idempotency Key, คุม Timeout ด้วย asyncio และกั้นสิทธิ์ Write Tools",
  icon: "shield-check",
  visual: {
    id: "tool-calling-safety",
    title: "Safe Tool Runner: Least Privilege + Timeout + Idempotency Cache",
    caption: "สลับดูการบล็อก Write Tool เมื่ออยู่ในโหมด Read-Only, การป้องกันการตัดเงินซ้ำด้วย Idempotency Key และการตัดจบเมื่อ Tool ค้างเกิน Timeout",
    alt: "แผนภาพการออกแบบ Safe Tools ด้วย Idempotency, Timeout และ Least Privilege",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้าง Async Safe Tool Runner ทดสอบด้วย pytest",
  tools: ["Python 3.12", "asyncio", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "Schema ถูกต้องไม่ได้แปลว่าปลอดภัย ถ้าระบบเผลอคืนเงินซ้ำ 3 รอบ",
      body: "เมื่อวาน (D109) เราตรวจรูปพารามิเตอร์ด้วย {{pydantic}} แล้ว แต่ในโลกจริง {{llm}} หรือเครือข่ายอาจ retry คำสั่งเดิมซ้ำ หากฟังก์ชัน `create_refund_ticket` ไม่มี {{idempotency}} ลูกค้าจะถูกสร้างใบคืนเงินซ้ำซ้อนทันที",
      lessonNote: "วันนี้เราต่อยอดความรู้เรื่อง {{idempotency}} และ {{asyncio}} จาก Phase 1 (D15, D17) มาห่อรอบระบบ {{tool-calling}}",
    },
    {
      node: 3,
      heading: "แยก Read Tools ออกจาก Write Tools (Principle of Least Privilege)",
      body: "เครื่องมืออ่านข้อมูล (`lookup_order`, `search_kb`) ไม่มีผลข้างเคียง (side effect) สามารถเปิดให้บอทเรียกอัตโนมัติได้ แต่เครื่องมือที่เปลี่ยนแปลงสถานะ (`create_ticket`, `issue_refund`) ต้องติดป้าย `is_write=True` และถูกกั้นด้วยสิทธิ์ `allow_writes` เสมอ",
      lessonNote: "ในโหมดตอบคำถามทั่วไป เราตั้ง `allow_writes=False` เพื่อบล็อก Write Tools ทั้งหมดตั้งแต่ชั้น Runner",
    },
    {
      node: 4,
      heading: "คุมเวลาทุก Tool ด้วย `asyncio.wait_for` เพื่อไม่ให้ทั้งระบบค้าง",
      body: "หาก API ภายนอกหรือฐานข้อมูลที่ Tool เรียกเกิดค้าง (hang) โดยไม่มี timeout เธรดของบอทจะค้างตามไปตลอดกาล การห่อทุกการเรียกด้วย `asyncio.wait_for(..., timeout=timeout_s)` ช่วยตัดจบและคืน `error_code=\"timeout\"` อย่างปลอดภัย",
      lessonNote: "เมื่อเกิด timeout โค้ดสามารถสลับไปตอบข้อความ fallback ที่สุภาพแทนการปล่อยให้ผู้ใช้รอนานผิดปกติ",
    },
    {
      node: 5,
      heading: "รากฐานตรงสู่ Safe MCP Client (D115) และ HITL Approval Gate (D119)",
      body: "แนวคิดการแยก Read/Write, การบังคับ Timeout และการผูก `idempotency_key` ในวันนี้ จะถูกนำไปใช้กับโปรโตคอล {{mcp}} ในสัปดาห์หน้า และเชื่อมกับด่านอนุมัติโดยมนุษย์ ({{hitl}}) ใน {{langgraph}}",
      lessonNote: "จำหลักการ 3 เสาหลักของ Safe Tool: Least Privilege (Read vs Write), Bounded Time (Timeout) และ Safe Retry (Idempotency)",
    },
  ],

  objectives: [
    "**แยกประเภทเครื่องมือแบบ Read-Only vs Write/Side-Effect** และบังคับหลักการ Least Privilege (`allow_writes=False` บล็อกทุกเครื่องมือที่มีผลข้างเคียงทันที)",
    "**ป้องกันการรัน Side Effect ซ้ำซ้อนด้วย {{idempotency}} Key Cache** สำหรับ Write Tools เพื่อให้การส่งคำขอซ้ำด้วยคีย์เดิมคืนผลลัพธ์เดิมจากแคชโดยไม่รันฟังก์ชันซ้ำ",
    "**ควบคุมเวลาการทำงานด้วย `asyncio.wait_for`** เพื่อดักจับ `TimeoutError` แล้วแปลงเป็น `SafeToolResult(ok=False, error_code=\"timeout\")` พร้อมทดสอบครบทุกกรณีด้วย {{pytest}}",
  ],

  prerequisites: [
    "ผ่าน Day 109 (Strict Pydantic Tool Schemas & Registry)",
    "ทบทวน Day 15 (Idempotency) และ Day 17 (`asyncio.wait_for` & Timeouts)",
    "ไม่ต้องใช้ API key — ทดสอบ Async Safe Tool Runner บนเครื่องด้วย `pytest` ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day110` ด้วย `uv` และติดตั้ง `pydantic` คู่กับ `pytest` เพื่อสร้างโมดูล `safe_tools.py`",
    commands: `uv init ai-day110 && cd ai-day110
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day110` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เขียน `safe_tools.py` และรัน `uv run pytest -v`"],
    ],
    note: "เราสามารถทดสอบฟังก์ชัน `async def` ใน `pytest` ได้ทันทีโดยใช้ `asyncio.run(...)` ภายในฟังก์ชันทดสอบโดยไม่ต้องลงปลั๊กอินเพิ่ม",
  },

  concepts: [
    {
      id: "read-vs-write-least-privilege",
      title: "1 · Read vs Write Separation & Least Privilege: อย่าเปิดปุ่มแก้ไขข้อมูลทิ้งไว้ถ้าไม่จำเป็น",
      paragraphs: [
        "ความเสี่ยงที่ใหญ่ที่สุดของระบบ {{tool-calling}} คือการเอาเครื่องมืออ่านข้อมูล (`get_order`, `list_faqs`) ไปปนกับเครื่องมือแก้ไขข้อมูล (`cancel_order`, `issue_refund`) ในระดับสิทธิ์เดียวกัน",
        "ตามหลักการ **Least Privilege (สิทธิ์เท่าที่จำเป็นขั้นต่ำ)** ทุกเครื่องมือที่ลงทะเบียนในระบบต้องระบุคุณสมบัติ `mode: Literal[\"read\", \"write\"]` อย่างชัดเจน โดยในบริบทการสนทนาปกติที่ไม่ใช่ขั้นตอนดำเนินการ (หรือเมื่อผู้ใช้ยังไม่ได้ยืนยันตัวตนระดับสูง) ตัวรันเครื่องมือจะถูกตั้งค่า `allow_writes=False`",
        "เมื่อ `allow_writes=False` หากโมเดล {{llm}} พยายามเรียกเครื่องมือที่เป็น `mode=\"write\"` (ไม่ว่าจะเพราะเข้าใจผิดหรือถูก {{prompt-injection}}) ตัว Runner จะปฏิเสธทันทีด้วย `error_code=\"write_forbidden\"` ก่อนที่ฟังก์ชันจริงจะถูกแตะต้อง",
      ],
      analogy:
        "เหมือนโหมด 'ดูยอดเงินอย่างเดียว' ในแอปธนาคารบนสมาร์ตวอตช์: คุณเปิดดูยอดคงเหลือและรายการเดินบัญชีได้ทันที (Read Tools) แต่ถ้าจะกดโอนเงิน (Write Tool) ระบบบนนาฬิกาจะล็อกไว้ไม่ให้ทำรายการจนกว่าจะเปิดโหมดทำธุรกรรมบนมือถือ",
      bullets: [
        "**`mode=\"read\"`**: อ่านข้อมูลอย่างเดียว ไม่มีผลข้างเคียง เรียกซ้ำได้อย่างปลอดภัย",
        "**`mode=\"write\"`**: สร้าง แก้ไข หรือลบข้อมูล ต้องได้รับอนุญาต (`allow_writes=True`) และต้องมี `idempotency_key` เสมอ",
        "**Fail-Closed Policy**: ค่าเริ่มต้นของระบบคือ `allow_writes=False` เสมอ",
      ],
      whyTitle: "Why this matters — แยก Read/Write ช่วยลดรัศมีความเสียหาย (Blast Radius) จาก Prompt Injection ลง 90%",
      whyParagraphs: [
        "ในการสนทนาตอบคำถามทั่วไปกว่า 85% ของทิกเก็ตลูกค้าต้องการเพียงการค้นนโยบายและเช็กสถานะออเดอร์ การปิด `allow_writes=False` ในเส้นทางเหล่านี้ตัดโอกาสที่บอทจะเผลอแก้ไขข้อมูลลูกค้าโดยไม่ตั้งใจได้อย่างเด็ดขาด",
      ],
    },
    {
      id: "idempotency-for-write-tools",
      title: "2 · Idempotency Key สำหรับ Write Tools: เรียกซ้ำกี่ครั้งก็เกิดผลข้างเคียงเพียงครั้งเดียว",
      paragraphs: [
        "ในระบบ Agent หรือ Workflow เมื่อเกิดความล่าช้าหรือโมเดลไม่แน่ใจว่าคำสั่งก่อนหน้าสำเร็จหรือยัง โมเดลมักส่ง Tool Call เดิมซ้ำอีกครั้ง เช่น เรียก `create_support_ticket(order_id=\"INV-2026-009\", reason=\"สินค้าชำรุด\")` ซ้ำ 2 รอบติดกัน",
        "สำหรับเครื่องมือ `mode=\"write\"` เราจึงบังคับให้ต้องมี **`idempotency_key: str`** เสมอ (อาจส่งมาโดยตรงหรือคำนวณแบบ deterministic จาก `sha256(tool_name + canonical_json(args))` ก็ได้) โดยตัว Runner จะเก็บตาราง `idempotency_store: dict[str, SafeToolResult]`",
        "เมื่อมีคำขอ Write Tool เข้ามาด้วย `idempotency_key` ที่เคยทำงานสำเร็จไปแล้ว ตัว Runner จะ **ไม่รันฟังก์ชัน `handler` ซ้ำ** แต่ดึงผลลัพธ์เดิมจากแคชมาคืนพร้อมติดธง `from_idempotency_cache=True` ทำให้มั่นใจได้ว่าทิกเก็ตหรือรายการคืนเงินจะถูกสร้างเพียง 1 ครั้งเท่านั้น",
      ],
      analogy:
        "เหมือนปุ่มกดลิฟต์: ต่อให้คนใจร้อนกดปุ่มชั้น 5 ซ้ำย้ำ ๆ 10 ครั้ง ลิฟต์ก็รับคำสั่งว่า 'จอดชั้น 5' เพียงครั้งเดียว ไม่ได้วิ่งขึ้นลงชั้น 5 ซ้ำ 10 รอบ",
      code: {
        language: "python",
        filename: "idempotency_key.py",
        code: `import hashlib
import json
from typing import Any


def make_tool_idempotency_key(
    tenant_id: str,
    tool_name: str,
    args: dict[str, Any],
) -> str:
    """สร้างคีย์ idempotency แบบ deterministic จาก tenant + ชื่อ tool + args ที่เรียง key แล้ว"""
    canonical_args = json.dumps(args, sort_keys=True, ensure_ascii=False)
    raw = f"{tenant_id}:{tool_name}:{canonical_args}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]`,
        caption: "ใช้ `json.dumps(..., sort_keys=True)` เพื่อให้ลำดับ key ใน dict ไม่ส่งผลต่อค่า SHA-256 hash",
      },
      whyTitle: "Why this matters — อย่าลืมรวม `tenant_id` เข้าไปใน Idempotency Key เสมอ!",
      whyParagraphs: [
        "หากไม่รวม `tenant_id` ในการสร้างคีย์ ถ้าบริษัท A และบริษัท B บังเอิญส่งพารามิเตอร์เหมือนกันเป๊ะ บริษัท B อาจได้ผลลัพธ์จากแคชของบริษัท A กลับไป! การผูก `tenant_id` เข้าใน hash จึงป้องกัน Cross-Tenant Cache Collision ได้ 100%",
      ],
    },
    {
      id: "async-timeout-boundary",
      title: "3 · Bounded Execution Time ด้วย `asyncio.wait_for`",
      paragraphs: [
        "เครื่องมือแต่ละตัวที่บอทเรียกอาจไปต่อกับบริการภายนอกที่ช้าไม่เท่ากัน เช่น ค้น SQLite ในเครื่องควรเสร็จใน `0.5` วินาที แต่ยิง API ขนส่งภายนอกอาจใช้เวลา `2.0` วินาที",
        "การกำหนด `timeout_s: float` รายเครื่องมือ แล้วห่อการเรียกด้วย `await asyncio.wait_for(handler(args), timeout=tool.timeout_s)` เป็นเกราะป้องกันไม่ให้เครื่องมือตัวเดียวที่ค้างดึงทั้งระบบให้ล่มตาม",
        "เมื่อเกิด `TimeoutError` เราจับไว้แล้วคืน `SafeToolResult(ok=False, error_code=\"timeout\")` เพื่อให้ชั้นควบคุมทราบว่าเครื่องมือนี้ตอบสนองไม่ทันเวลาและควรสลับไปใช้ข้อความ fallback ทันทีโดยไม่วนลูปรอไม่รู้จบ",
      ],
      analogy:
        "เหมือนการตั้งนาฬิกาจับเวลาตอนโทรถามคลังสินค้าให้ลูกค้าที่รอสายอยู่: ถ้าเกิน 3 วินาทีแล้วยังไม่มีคนรับสาย พนักงานจะวางสายคลังสินค้าแล้วบอกลูกค้าว่า 'เดี๋ยวเจ้าหน้าที่ตรวจสอบและแจ้งกลับทางข้อความนะครับ' แทนการปล่อยให้ลูกค้าถือสายรอเก้อ",
      bullets: [
        "**Per-Tool Timeout**: กำหนดเพดานเวลาที่เหมาะสมกับธรรมชาติของแต่ละเครื่องมือ",
        "**Structured Timeout Result**: คืน `ok=False, error_code=\"timeout\"` แทนการปล่อยให้เกิด Unhandled Exception",
        "**No Cache on Timeout**: หากเครื่องมือล้มเหลวด้วย `timeout` ห้ามเก็บผลล้มเหลวลง `idempotency_cache` เพื่อให้การลองใหม่ที่ถูกต้องยังทำงานได้",
      ],
      whyTitle: "Why this matters — เก็บเฉพาะผลลัพธ์ที่ `ok=True` ลง Idempotency Cache เท่านั้น",
      whyParagraphs: [
        "ถ้าเราเผลอแคชผลลัพธ์ที่ `ok=False` (เช่น เน็ตกระตุกจนเกิด `timeout` ในครั้งแรก) พอระบบลองใหม่ด้วยคีย์เดิม มันจะได้ผล `timeout` จากแคชกลับไปตลอดกาลแม้ปลายทางจะกลับมาปกติแล้วก็ตาม!",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Safe Tool Runner กับ Payment & API Gateway Patterns",
      body: [
        "3 เสาหลักของ Safe Tool Runner ในวันนี้ตรงกับแนวปฏิบัติมาตรฐานของระบบ API ระดับ Enterprise:",
      ],
      table: [
        ["`mode: 'read' | 'write'` + `allow_writes`", "OAuth Scopes (`orders:read` vs `orders:write`)"],
        ["Deterministic `idempotency_key` Cache", "Stripe `Idempotency-Key` header ป้องกันการตัดบัตรซ้ำ"],
        ["`asyncio.wait_for(..., timeout=timeout_s)`", "`AbortSignal.timeout(ms)` ใน `fetch()`"],
        ["Cache เฉพาะเมื่อ `ok=True`", "ไม่แคช HTTP 503/504 ลงใน Idempotency Store"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม `json.dumps(args, sort_keys=True)` ถึงจำเป็นตอนทำ Hash",
      body: [
        "ใน Python dict สองตัวที่มีข้อมูลเหมือนกัน เช่น `{\"a\": 1, \"b\": 2}` กับ `{\"b\": 2, \"a\": 1}` มีค่าเท่ากัน (`==`) แต่ถ้าแปลงเป็นสตริงโดยไม่เรียง key จะได้สตริงคนละตัวและได้ค่า SHA-256 คนละค่ากัน!",
        "การใส่ `sort_keys=True` บังคับให้เรียงชื่อ key ตามตัวอักษรเสมอก่อนทำ hash จึงได้คีย์ `idempotency` เดียวกัน 100%",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง `SafeToolRunner` ที่รองรับทั้ง Read Tool (`get_order`) และ Write Tool (`create_refund_request`) พร้อมทดสอบ: (1) บล็อก Write Tool เมื่อ `allow_writes=False`, (2) ป้องกันการสร้างคำขอคืนเงินซ้ำด้วย Idempotency Cache และ (3) ตัดจบเมื่อ Tool ทำงานช้าเกิน `timeout_s`",
    steps: [
      {
        title: "1 · นิยามโมเดล `ToolSpec` และ `SafeToolResult`",
        explain:
          "ระบุ `mode` (`read` หรือ `write`), `timeout_s` และธง `from_idempotency_cache` ในผลลัพธ์อย่างชัดเจน",
        code: {
          language: "python",
          filename: "worked_safe_tools.py",
          code: `import asyncio
import hashlib
import json
from collections.abc import Awaitable, Callable
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict

ToolMode = Literal["read", "write"]
ErrorCode = Literal["unknown_tool", "write_forbidden", "timeout", "execution_error"]


class SafeToolResult(BaseModel):
    ok: bool
    tool_name: str
    data: dict[str, Any] | None = None
    error_code: ErrorCode | None = None
    from_idempotency_cache: bool = False


class ToolSpec(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    name: str
    mode: ToolMode
    timeout_s: float = 1.0
    handler: Callable[[dict[str, Any]], Awaitable[dict[str, Any]]]`,
        },
      },
      {
        title: "2 · สร้าง `SafeToolRunner` ที่รวม Least Privilege + Idempotency + Timeout",
        explain:
          "ตรวจ `allow_writes` ก่อน จากนั้นถ้าเป็น `write` ให้ตรวจ `idempotency_cache` ก่อนรันจริงภายใต้ `asyncio.wait_for`",
        code: {
          language: "python",
          filename: "worked_safe_tools.py",
          code: `def build_idempotency_key(tenant_id: str, tool_name: str, args: dict[str, Any]) -> str:
    canonical = json.dumps(args, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(f"{tenant_id}:{tool_name}:{canonical}".encode()).hexdigest()[:24]


class SafeToolRunner:
    def __init__(self) -> None:
        self._specs: dict[str, ToolSpec] = {}
        self._idem_cache: dict[str, dict[str, Any]] = {}

    def register(self, spec: ToolSpec) -> None:
        self._specs[spec.name] = spec

    async def execute(
        self,
        tool_name: str,
        args: dict[str, Any],
        tenant_id: str,
        allow_writes: bool = False,
        idempotency_key: str | None = None,
    ) -> SafeToolResult:
        spec = self._specs.get(tool_name)
        if spec is None:
            return SafeToolResult(ok=False, tool_name=tool_name, error_code="unknown_tool")

        if spec.mode == "write" and not allow_writes:
            return SafeToolResult(ok=False, tool_name=tool_name, error_code="write_forbidden")

        idem_key: str | None = None
        if spec.mode == "write":
            raw_key = idempotency_key or build_idempotency_key(tenant_id, tool_name, args)
            idem_key = f"{tenant_id}:{tool_name}:{raw_key}"
            if idem_key in self._idem_cache:
                return SafeToolResult(
                    ok=True,
                    tool_name=tool_name,
                    data=self._idem_cache[idem_key],
                    from_idempotency_cache=True,
                )

        try:
            data = await asyncio.wait_for(spec.handler(args), timeout=spec.timeout_s)
        except TimeoutError:
            return SafeToolResult(ok=False, tool_name=tool_name, error_code="timeout")
        except Exception:
            return SafeToolResult(ok=False, tool_name=tool_name, error_code="execution_error")

        if idem_key is not None:
            self._idem_cache[idem_key] = data

        return SafeToolResult(ok=True, tool_name=tool_name, data=data)`,
        },
      },
      {
        title: "3 · ทดสอบการบล็อก Write, การกันรันซ้ำ และการตัด Timeout",
        explain:
          "รันสคริปต์เพื่อดูว่า `refund_calls` ถูกเรียกเพียง 1 ครั้งแม้จะยิงคำสั่งเดิมซ้ำ 2 รอบ และเครื่องมือที่ค้างเกินเวลาถูกตัดจบด้วย `timeout`",
        code: {
          language: "python",
          filename: "worked_safe_tools.py",
          code: `async def demo() -> None:
    runner = SafeToolRunner()
    refund_calls = 0

    async def issue_refund(args: dict[str, Any]) -> dict[str, Any]:
        nonlocal refund_calls
        refund_calls += 1
        return {"order_id": args["order_id"], "refund_tx": f"TX-{refund_calls}"}

    async def slow_shipping(args: dict[str, Any]) -> dict[str, Any]:
        await asyncio.sleep(0.2)
        return {"carrier": "TH-Post"}

    runner.register(ToolSpec(name="issue_refund", mode="write", timeout_s=1.0, handler=issue_refund))
    runner.register(ToolSpec(name="slow_shipping", mode="read", timeout_s=0.05, handler=slow_shipping))

    blocked = await runner.execute("issue_refund", {"order_id": "INV-01"}, tenant_id="acme", allow_writes=False)
    first = await runner.execute("issue_refund", {"order_id": "INV-01"}, tenant_id="acme", allow_writes=True)
    second = await runner.execute("issue_refund", {"order_id": "INV-01"}, tenant_id="acme", allow_writes=True)
    timed_out = await runner.execute("slow_shipping", {"order_id": "INV-01"}, tenant_id="acme")

    print("1. Write blocked:", blocked.error_code, "| calls:", refund_calls)
    print("2. First write:", first.data, "| cached:", first.from_idempotency_cache)
    print("3. Duplicate write:", second.data, "| cached:", second.from_idempotency_cache, "| calls:", refund_calls)
    print("4. Timeout caught:", timed_out.error_code)


asyncio.run(demo())`,
        },
        output: `1. Write blocked: write_forbidden | calls: 0
2. First write: {'order_id': 'INV-01', 'refund_tx': 'TX-1'} | cached: False
3. Duplicate write: {'order_id': 'INV-01', 'refund_tx': 'TX-1'} | cached: True | calls: 1
4. Timeout caught: timeout`,
      },
    ],
    gotcha:
      "สังเกตในบรรทัด `idem_key = f\"{tenant_id}:{tool_name}:{raw_key}\"`: แม้ผู้ใช้จะส่ง `idempotency_key=\"key-1\"` มาเอง เราก็ยังต้อง prefix ด้วย `tenant_id` และ `tool_name` เสมอ เพื่อไม่ให้คีย์ของผู้เช่ารายหนึ่งไปชนกับผู้เช่าอีกรายหนึ่ง!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `safe_tools.py` ที่มี `build_idempotency_key` และ `SafeToolRunner` พร้อมชุดทดสอบ `test_safe_tools.py`",
    requirements: [
      "เขียน `build_idempotency_key(tenant_id: str, tool_name: str, args: dict[str, Any]) -> str` ที่เรียง key ใน `args` ด้วย `json.dumps(..., sort_keys=True)` ก่อนทำ SHA-256 hash",
      "สร้าง `SafeToolRunner` ที่บังคับ Least Privilege: หาก `spec.mode == \"write\"` และ `allow_writes == False` ให้คืน `SafeToolResult(ok=False, error_code=\"write_forbidden\")` ทันทีโดยไม่เรียก `handler`",
      "สำหรับ `spec.mode == \"write\"` เมื่อ `allow_writes == True` ให้ตรวจแคช idempotency (แยกตาม `tenant_id` และ `tool_name`) หากเคยสำเร็จแล้วให้คืนผลเดิมพร้อม `from_idempotency_cache=True` โดยไม่รัน `handler` ซ้ำ",
      "ห่อการเรียก `spec.handler(args)` ด้วย `asyncio.wait_for(..., timeout=spec.timeout_s)` หากเกิด `TimeoutError` ให้คืน `error_code=\"timeout\"` และห้ามบันทึกผลที่ล้มเหลวลงใน idempotency cache",
      "เขียน `test_safe_tools.py` ทดสอบครบทั้งการบล็อก write tool, การกันรันซ้ำด้วย idempotency cache, การแยกแคชตาม tenant, และการตัดจบเมื่อเกิด timeout",
    ],
    starter: {
      language: "python",
      filename: "safe_tools.py",
      code: `import asyncio
import hashlib
import json
from collections.abc import Awaitable, Callable
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict

ToolMode = Literal["read", "write"]
ErrorCode = Literal["unknown_tool", "write_forbidden", "timeout", "execution_error"]


class SafeToolResult(BaseModel):
    ok: bool
    tool_name: str
    data: dict[str, Any] | None = None
    error_code: ErrorCode | None = None
    from_idempotency_cache: bool = False


class ToolSpec(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    name: str
    mode: ToolMode
    timeout_s: float = 1.0
    handler: Callable[[dict[str, Any]], Awaitable[dict[str, Any]]]


def build_idempotency_key(tenant_id: str, tool_name: str, args: dict[str, Any]) -> str:
    """สร้างคีย์ idempotency แบบ deterministic ที่ไม่ขึ้นกับลำดับ key ใน dict"""
    # TODO: ใช้ json.dumps(..., sort_keys=True) และ hashlib.sha256
    raise NotImplementedError


class SafeToolRunner:
    def __init__(self) -> None:
        self._specs: dict[str, ToolSpec] = {}
        self._idem_cache: dict[str, dict[str, Any]] = {}

    def register(self, spec: ToolSpec) -> None:
        self._specs[spec.name] = spec

    async def execute(
        self,
        tool_name: str,
        args: dict[str, Any],
        tenant_id: str,
        allow_writes: bool = False,
        idempotency_key: str | None = None,
    ) -> SafeToolResult:
        """ตรวจ allowlist, write privilege, idempotency cache และรันภายใต้ asyncio.wait_for"""
        # TODO: implement SafeToolRunner.execute
        raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`build_idempotency_key(\"acme\", \"t\", {\"a\": 1, \"b\": 2})` ให้ค่าตรงกับ `build_idempotency_key(\"acme\", \"t\", {\"b\": 2, \"a\": 1})` ใช่หรือไม่?",
      "เมื่อ Write Tool เกิด `timeout` ในครั้งแรก การเรียกซ้ำครั้งที่สองยังสามารถรัน `handler` ได้ตามปกติ (ไม่ได้แคชผลล้มเหลวไว้) ใช่หรือไม่?",
      "แคช idempotency ของ `tenant_id=\"acme\"` ไม่ปะปนกับ `tenant_id=\"beta\"` ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทุกกรณี (canonical key, write privilege guard, idempotent deduplication, tenant isolation, timeout guard) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใน `build_idempotency_key` ใช้ `canonical = json.dumps(args, sort_keys=True, ensure_ascii=False)` แล้วคืน `hashlib.sha256(f\"{tenant_id}:{tool_name}:{canonical}\".encode(\"utf-8\")).hexdigest()[:24]`",
      },
      {
        body: "บันทึก `self._idem_cache[idem_key] = data` หลังจากบรรทัด `await asyncio.wait_for(...)` ทำงานสำเร็จแล้วเท่านั้น",
      },
      {
        body: "เฉลยชุดทดสอบ `test_safe_tools.py`:",
        code: {
          language: "python",
          filename: "test_safe_tools.py",
          code: `import asyncio
from typing import Any
from safe_tools import SafeToolRunner, ToolSpec, build_idempotency_key


def test_build_idempotency_key_is_order_independent_and_tenant_scoped() -> None:
    k1 = build_idempotency_key("acme", "refund", {"a": 1, "b": 2})
    k2 = build_idempotency_key("acme", "refund", {"b": 2, "a": 1})
    k_other = build_idempotency_key("beta", "refund", {"a": 1, "b": 2})
    assert k1 == k2
    assert k1 != k_other


def test_blocks_write_tool_when_allow_writes_is_false() -> None:
    runner = SafeToolRunner()
    calls = 0

    async def create_ticket(args: dict[str, Any]) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        return {"ticket_id": "T-1"}

    runner.register(ToolSpec(name="create_ticket", mode="write", handler=create_ticket))
    res = asyncio.run(
        runner.execute("create_ticket", {"subject": "พัสดุล่าช้า"}, tenant_id="acme", allow_writes=False)
    )
    assert res.ok is False
    assert res.error_code == "write_forbidden"
    assert calls == 0


def test_idempotency_prevents_duplicate_write_per_tenant() -> None:
    runner = SafeToolRunner()
    calls = 0

    async def create_ticket(args: dict[str, Any]) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        return {"ticket_id": f"T-{calls}"}

    runner.register(ToolSpec(name="create_ticket", mode="write", handler=create_ticket))
    r1 = asyncio.run(
        runner.execute("create_ticket", {"order_id": "INV-1"}, tenant_id="acme", allow_writes=True)
    )
    r2 = asyncio.run(
        runner.execute("create_ticket", {"order_id": "INV-1"}, tenant_id="acme", allow_writes=True)
    )
    r_beta = asyncio.run(
        runner.execute("create_ticket", {"order_id": "INV-1"}, tenant_id="beta", allow_writes=True)
    )
    assert r1.ok is True and r1.from_idempotency_cache is False
    assert r2.ok is True and r2.from_idempotency_cache is True
    assert r1.data == r2.data == {"ticket_id": "T-1"}
    assert r_beta.data == {"ticket_id": "T-2"}
    assert calls == 2


def test_timeout_returns_structured_error_without_caching_failure() -> None:
    runner = SafeToolRunner()
    attempt = 0

    async def flaky_write(args: dict[str, Any]) -> dict[str, Any]:
        nonlocal attempt
        attempt += 1
        if attempt == 1:
            await asyncio.sleep(0.2)
        return {"attempt": attempt}

    runner.register(ToolSpec(name="flaky_write", mode="write", timeout_s=0.05, handler=flaky_write))
    r_timeout = asyncio.run(
        runner.execute("flaky_write", {"id": 1}, tenant_id="acme", allow_writes=True)
    )
    r_retry = asyncio.run(
        runner.execute("flaky_write", {"id": 1}, tenant_id="acme", allow_writes=True)
    )
    assert r_timeout.ok is False and r_timeout.error_code == "timeout"
    assert r_retry.ok is True and r_retry.data == {"attempt": 2}`,
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
      title: "เปิด Write Tools (`issue_refund`, `delete_ticket`) ให้เรียกได้ทุกโหมดโดยไม่มีธง `allow_writes`",
      symptom:
        "เมื่อผู้ใช้ถามคำถามทั่วไปที่แฝง Prompt Injection โมเดลสามารถสั่งรันเครื่องมือแก้ไขข้อมูลได้ทันที",
      fix: "แยก `mode: \"read\" | \"write\"` ทุกเครื่องมือ และตั้งค่าเริ่มต้น `allow_writes=False` เสมอ",
    },
    {
      title: "สร้าง Idempotency Key จาก `str(args)` โดยไม่เรียง key (`sort_keys=True`) และไม่ผูก `tenant_id`",
      symptom:
        "ลำดับ key ใน JSON สลับกันทำให้แคชพลาด (รันซ้ำ) หรือแย่กว่านั้นคือคีย์ของบริษัท A ชนกับบริษัท B จนข้อมูลรั่วข้ามผู้เช่า",
      fix: "ใช้ `json.dumps(args, sort_keys=True)` และนำ `tenant_id` กับ `tool_name` มารวมเป็น prefix เสมอ",
    },
    {
      title: "บันทึกผลลัพธ์ที่เกิด `timeout` หรือ `execution_error` ลงใน Idempotency Cache",
      symptom:
        "เมื่อระบบปลายทางกลับมาทำงานปกติ การ retry ด้วยคีย์เดิมยังคงได้ผลลัพธ์ล้มเหลวจากแคชค้างไว้ตลอดไป",
      fix: "บันทึกเข้า `_idem_cache` เฉพาะหลังจาก `handler` ทำงานสำเร็จ (`ok=True`) แล้วเท่านั้น",
    },
    {
      title: "เรียกเครื่องมือ I/O ภายนอกโดยไม่ห่อด้วย `asyncio.wait_for`",
      symptom:
        "เมื่อ API ภายนอกค้างเพียง 1 ระบบ เธรดของบอทค้างตามจนไม่สามารถตอบข้อความ fallback ให้ผู้ใช้ได้",
      fix: "กำหนด `timeout_s` ให้เหมาะสมกับทุกเครื่องมือและดัก `TimeoutError` แปลงเป็น `error_code=\"timeout\"`",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d110-q1",
        "ทำไมเราจึงต้องแยกเครื่องมือออกเป็น `mode=\"read\"` และ `mode=\"write\"` พร้อมตั้งค่าเริ่มต้น `allow_writes=False`?",
        [
          ["เพราะ Python รันฟังก์ชันอ่านและเขียนในไฟล์เดียวกันไม่ได้", "Python รันได้ตามปกติ"],
          ["เพื่อบังคับหลักการ Least Privilege: ในโหมดตอบคำถามทั่วไปที่ต้องการแค่ค้นข้อมูล ระบบจะบล็อกทุกเครื่องมือที่มีผลข้างเคียง (Side Effects) ได้ตั้งแต่ระดับ Runner แม้โมเดลจะถูกหลอกด้วย Prompt Injection", "ถูกต้อง — ลด Blast Radius โดยไม่เปิดสิทธิ์แก้ไขข้อมูลเมื่อไม่จำเป็น"],
          ["เพื่อให้โมเดลไม่ต้องส่งพารามิเตอร์ใด ๆ", "ยังต้องส่งพารามิเตอร์ตาม Schema"],
          ["เพื่อทำให้ Read Tools ทำงานช้าลงเท่ากับ Write Tools", "ไม่เป็นความจริง"],
        ],
        "B",
        "การแยก Read vs Write ที่ระดับ Runner คือเกราะป้องกันระดับสถาปัตยกรรมที่ไม่พึ่งพาการตัดสินใจของ LLM เพียงอย่างเดียว",
        "การแยก `mode='read'` กับ `mode='write'` ช่วยเพิ่มความปลอดภัยอย่างไร?",
        "ช่วยบล็อกเครื่องมือที่มีผลข้างเคียงทั้งหมดเมื่ออยู่ในโหมด `allow_writes=False` (Least Privilege)",
      ),
      mc(
        "d110-q2",
        "เหตุใดในการคำนวณ Deterministic Idempotency Key จาก `args: dict` จึงต้องใช้ `json.dumps(args, sort_keys=True)` และผูก `tenant_id` เข้าไปด้วย?",
        [
          ["เพื่อให้สตริงที่ได้มีความยาวเกิน 10,000 ตัวอักษร", "เราต้องการค่า hash ที่สั้นและคงที่"],
          ["`sort_keys=True` ทำให้พารามิเตอร์ชุดเดียวกันได้ hash เดียวกันไม่ว่าลำดับ key จะสลับกันอย่างไร ส่วน `tenant_id` ป้องกันไม่ให้คำขอของผู้เช่ารายหนึ่งไปดึงผลแคชของผู้เช่าอีกรายหนึ่ง", "ถูกต้อง — รับประกันทั้งความสม่ำเสมอของคีย์และการแยกข้อมูลข้ามบริษัท"],
          ["เพราะ `hashlib.sha256` รับเฉพาะภาษาไทยเท่านั้น", "`sha256` รับ bytes ของข้อความใดก็ได้"],
          ["เพื่อแปลงตัวเลขทั้งหมดให้เป็นศูนย์", "ไม่ได้แปลงตัวเลขเป็นศูนย์"],
        ],
        "B",
        "Canonical JSON serialization (`sort_keys=True`) + Tenant Prefix คือสูตรมาตรฐานของการทำ Idempotency Key ในระบบ Multi-Tenant",
        "ทำไมต้องใส่ `sort_keys=True` และ `tenant_id` ในการสร้าง Idempotency Key?",
        "เพื่อให้ได้ hash เดิมแม้ลำดับ key ใน dict สลับกัน และป้องกันแคชชนกันข้ามผู้เช่า (Cross-Tenant Collision)",
      ),
      mc(
        "d110-q3",
        "หากการเรียก Write Tool ครั้งแรกเกิด `TimeoutError` (ใช้เวลาเกิน `timeout_s`) ตัว `SafeToolRunner` ควรจัดการกับ Idempotency Cache อย่างไร?",
        [
          ["บันทึกผล `timeout` ลงในแคชทันที เพื่อที่ครั้งต่อไปจะได้ไม่ต้องเสียเวลารันอีก", "ผิด — จะทำให้การ retry ครั้งถัดไปล้มเหลวถาวรแม้ระบบปลายทางจะหายค้างแล้ว"],
          ["คืน `SafeToolResult(ok=False, error_code=\"timeout\")` และไม่บันทึกความล้มเหลวชั่วคราวนี้ลงใน `_idem_cache` เพื่อให้การ retry ครั้งถัดไปสามารถทำงานได้", "ถูกต้อง — แคชเฉพาะผลลัพธ์ที่ทำงานสำเร็จ (`ok=True`) เท่านั้น"],
          ["ลบข้อมูลของผู้เช่าทั้งหมดออกจากระบบ", "ไม่ควรทำ"],
          ["เปลี่ยน `timeout_s` เป็น 24 ชั่วโมงโดยอัตโนมัติ", "ยิ่งทำให้ระบบค้างหนักขึ้น"],
        ],
        "B",
        "ความล้มเหลวชั่วคราว (Transient Failure เช่น Timeout) ไม่ควรนำมาล็อกคีย์ idempotency ถาวร",
        "ทำไมจึงไม่ควรแคชผลลัพธ์ที่ล้มเหลวด้วย `timeout` ลงใน Idempotency Store?",
        "เพื่อให้การลองใหม่ (Retry) เมื่อระบบปลายทางกลับมาปกติสามารถรันฟังก์ชันสำเร็จได้",
      ),
      mc(
        "d110-q4",
        "เมื่อ Write Tool ทำงานสำเร็จในครั้งแรก และถูกเรียกซ้ำด้วย `tenant_id`, `tool_name` และ `args` เดิมในครั้งที่สอง พฤติกรรมที่ถูกต้องคือข้อใด?",
        [
          ["รัน `handler` ซ้ำเป็นครั้งที่สอง แล้วเอาผลลัพธ์สองรอบมาบวกกัน", "ผิด — เกิดการสร้างรายการซ้ำซ้อน (Duplicate Side Effect)"],
          ["ไม่รัน `handler` ซ้ำ แต่คืนผลลัพธ์เดิมจากแคชพร้อมตั้ง `ok=True` และ `from_idempotency_cache=True`", "ถูกต้อง — นี่คือนิยามของ Idempotency: ส่งคำขอซ้ำได้ผลลัพธ์เดิมโดยไม่เกิดผลข้างเคียงซ้ำ"],
          ["โยน `PermissionError` และแบนผู้ใช้ทันที", "การ retry จากเน็ตกระตุกไม่ใช่การละเมิดสิทธิ์"],
          ["คืนค่า `None` โดยไม่มีโครงสร้าง", "ทำให้โค้ดที่เรียกใช้พัง"],
        ],
        "B",
        "การคืนผลลัพธ์เดิมพร้อมธง `from_idempotency_cache=True` ช่วยให้ทั้งผู้เรียกได้ข้อมูลที่ต้องการและระบบ Audit ทราบว่าเป็นการตอบจากแคช",
        "ผลลัพธ์ของการเรียก Write Tool ซ้ำด้วย Idempotency Key เดิมที่สำเร็จไปแล้วคืออะไร?",
        "ไม่รัน handler ซ้ำ และคืนผลลัพธ์เดิมจากแคชพร้อม `from_idempotency_cache=True`",
      ),
    ],
  },

  takeaways: [
    "**Least Privilege (`mode: 'read' | 'write'`)**: แยกเครื่องมืออ่านออกจากเครื่องมือเขียน และตั้ง `allow_writes=False` เป็นค่าเริ่มต้นเสมอ",
    "**Idempotency for Writes**: ใช้คีย์ที่ผูก `tenant_id + tool_name + canonical_json(args)` เพื่อป้องกันการสร้างทิกเก็ตหรือคืนเงินซ้ำซ้อนเมื่อเกิดการ retry",
    "**Bounded Time (`asyncio.wait_for`)**: ทุกเครื่องมือต้องมีเพดาน `timeout_s` ที่ชัดเจน และไม่แคชผลล้มเหลวชั่วคราวลงใน Idempotency Store",
    "พรุ่งนี้ (Day 111) เราจะนำ Safe Tools เหล่านี้ไปจัดระเบียบด้วย **Anthropic's 5 Workflow Patterns** เพื่อดูว่าเมื่อไหร่ควรใช้ Workflow ที่คาดเดาได้แทน Autonomous Agent",
  ],

  reviewCards: [
    rc(
      "d110-rc1",
      "3 เสาหลักของการออกแบบ Safe Tool ใน Day 110 มีอะไรบ้าง?",
      "1) Least Privilege (แยก Read vs Write + `allow_writes` gate), 2) Idempotency Key Cache สำหรับ Write Tools และ 3) Bounded Timeout ด้วย `asyncio.wait_for`",
    ),
    rc(
      "d110-rc2",
      "ทำไมจึงต้องผูก `tenant_id` เข้าไปใน Idempotency Key เสมอ?",
      "เพื่อป้องกัน Cross-Tenant Cache Collision ที่ผู้เช่ารายหนึ่งส่งพารามิเตอร์ตรงกับผู้เช่าอีกรายแล้วได้รับผลลัพธ์จากแคชข้ามบริษัท",
    ),
    rc(
      "d110-rc3",
      "เมื่อเกิด `TimeoutError` จาก `asyncio.wait_for` ควรบันทึกผลลงใน `_idem_cache` หรือไม่ เพราะเหตุใด?",
      "ไม่ควรบันทึก เพราะ Timeout เป็นความล้มเหลวชั่วคราว หากแคชไว้ การ retry ครั้งถัดไปจะได้ผลล้มเหลวเดิมตลอดไป",
    ),
    rc(
      "d110-rc4",
      "การใช้ `json.dumps(args, sort_keys=True)` ก่อนทำ SHA-256 แก้ปัญหาอะไร?",
      "แก้ปัญหาลำดับ key ใน dict สลับกัน (เช่น `{\"a\":1,\"b\":2}` vs `{\"b\":2,\"a\":1}`) ให้ได้สตริงและค่า hash เดียวกันเสมอ",
    ),
  ],

  sources: [
    {
      label: "Stripe Engineering Blog — Designing Robust and Predictable APIs with Idempotency",
      href: "https://stripe.com/blog/idempotency",
    },
    {
      label: "Python Standard Library — asyncio.wait_for & Timeouts",
      href: "https://docs.python.org/3/library/asyncio-task.html#timeouts",
    },
    {
      label: "Anthropic Research — Building Effective Agents (Tool Design Principles)",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
  ],

  glossary: ["tool-calling", "idempotency", "asyncio", "pydantic", "guardrails", "fail-fast"],
});
