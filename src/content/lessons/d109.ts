import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D109 — Phase 4 / Block B28
 * Native Tool / Function Calling with Strict Pydantic Schemas
 */
export const d109: Lesson = defineLesson({
  day: 109,
  titleTh: "Native Tool / Function Calling ด้วย Strict Pydantic Schemas",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · สร้าง Allowlisted Tool Registry ที่ตรวจพารามิเตอร์ด้วย ConfigDict(extra='forbid', strict=True) ก่อนรันจริง",
  icon: "wrench",
  visual: {
    id: "tool-calling-safety",
    title: "Strict Tool Schema & Safe Execution Loop",
    caption: "เปรียบเทียบการเรียก Tool แบบมี Strict Pydantic Schema ดักพารามิเตอร์ตั้งแต่หน้าประตู กับการรับ dict ดิบที่เสี่ยงพัง",
    alt: "แผนภาพ Native Tool Calling ด้วย Strict Pydantic Schema",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้าง Strict Tool Dispatcher & Schema Validator ทดสอบด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "จากระบบที่ 'อ่านเอกสารได้อย่างเดียว' สู่ระบบที่ 'ลงมือเรียกฟังก์ชันได้'",
      body: "ใน Block B24–B27 ระบบ {{rag}} ของเราค้นเอกสารนโยบายมาตอบได้อย่างแม่นยำ แต่ถ้าลูกค้าถามว่า `'ออเดอร์ INV-2026-009 ส่งถึงไหนแล้ว?'` คำตอบไม่ได้อยู่ในไฟล์ PDF แต่อยู่ในระบบฐานข้อมูลสด — นี่คือจุดที่ต้องใช้ {{tool-calling}}",
      lessonNote: "ข้อควรจำ: LLM ไม่ได้เป็นคนรันฟังก์ชัน Python เอง แต่ LLM ส่ง 'ใบขอเรียกใช้เครื่องมือ' (JSON `{name, arguments}`) มาให้โค้ดของเรารัน",
    },
    {
      node: 3,
      heading: "Strict Pydantic Schema คือด่านตรวจพารามิเตอร์หน้าประตูฟังก์ชัน",
      body: "โมเดลอาจส่งพารามิเตอร์ผิดชนิด (ส่ง `\"100\"` เป็น string แทน `100` หรือส่งฟิลด์แปลกปลอม `is_admin=True` ที่เราไม่ได้เปิดรับ) การใช้ {{pydantic}} `BaseModel` พร้อม `ConfigDict(extra=\"forbid\", strict=True)` ช่วยบล็อกพารามิเตอร์ผิดรูปก่อนถึงฟังก์ชันจริง 100%",
      lessonNote: "เราต่อยอดความรู้ {{structured-output}} จาก Phase 1 (D5–D8) และ Phase 3 (D77–D78) มาใช้กับขาเข้าของ Tool",
    },
    {
      node: 4,
      heading: "Allowlisted Tool Registry ป้องกันการเรียกฟังก์ชันนอกเหนือที่อนุญาต",
      body: "ห้ามใช้ `getattr(module, tool_name)` หรือ `eval()` ตามชื่อฟังก์ชันที่ LLM ส่งมาเด็ดขาด! ต้องลงทะเบียนเฉพาะเครื่องมือที่อนุญาตไว้ใน `ToolRegistry` เท่านั้น",
      lessonNote: "หากโมเดลขอเรียกชื่อเครื่องมือที่ไม่อยู่ใน Registry ระบบจะคืน `error_code=\"unknown_tool\"` ทันทีโดยไม่รันโค้ดใด ๆ",
    },
    {
      node: 5,
      heading: "คืนผลลัพธ์และข้อผิดพลาดแบบมีโครงสร้าง (Structured Tool Result)",
      body: "เมื่อพารามิเตอร์ไม่ผ่าน {{validation}} เราไม่ปล่อยให้โปรแกรมแครชด้วย Unhandled Exception แต่จับ {{validation-error}} แล้วห่อเป็น JSON ที่มีโครงสร้างชัดเจน (`ok=False`, `error_code`, `message`) เพื่อให้ระบบหรือโมเดลแก้ไขพารามิเตอร์ในรอบถัดไปได้",
      lessonNote: "เป็นพื้นฐานสำคัญก่อนต่อเข้ากับ Safe Tools (D110), MCP Server (D113–D116) และ LangGraph (D117)",
    },
  ],

  objectives: [
    "**อธิบายวงจรการทำงานของ Native Tool Calling** ว่า LLM ทำหน้าที่เพียงผลิต JSON `{name, arguments}` ส่วนโค้ด Application เป็นผู้ตรวจสอบและตัดสินใจรันจริง",
    "**ประกาศ Strict Tool Input Schema ด้วย {{pydantic}}** โดยเปิด `ConfigDict(extra=\"forbid\", strict=True)` และ `@field_validator` เพื่อปฏิเสธฟิลด์เกินและชนิดข้อมูลที่ไม่ตรงสเปก",
    "**สร้าง `ToolRegistry` และ `dispatch_tool_call`** ที่อนุญาตเฉพาะชื่อเครื่องมือใน Allowlist, ตรวจพารามิเตอร์ก่อนรัน และคืนผลลัพธ์เป็น `ToolExecutionResult` ที่ทดสอบครบทุกกรณีด้วย {{pytest}}",
  ],

  prerequisites: [
    "ทบทวน Day 5–8 (Pydantic v2 `BaseModel`, `ConfigDict`, `ValidationError`)",
    "ผ่าน Block B27 (เข้าใจการไม่ไว้วางใจข้อมูลขาเข้าจาก LLM / Untrusted Input)",
    "ไม่ต้องใช้ API key — จำลองการส่ง Tool Call JSON และทดสอบ Dispatcher ด้วย `pytest` บนเครื่อง 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day109` ด้วย `uv` และติดตั้ง `pydantic` คู่กับ `pytest` เพื่อสร้างระบบ `tool_registry.py`",
    commands: `uv init ai-day109 && cd ai-day109
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day109` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เขียน `tool_registry.py` และรัน `uv run pytest -v`"],
    ],
    note: "ใน OpenAI, Anthropic และ Gemini SDK เราสามารถส่ง `Model.model_json_schema()` จาก Pydantic เข้าไปเป็นคำอธิบาย Tool Schema ให้โมเดลได้โดยตรง",
  },

  concepts: [
    {
      id: "how-tool-calling-actually-works",
      title: "1 · ความเข้าใจที่ถูกต้อง: LLM ไม่ได้รันโค้ด แต่ส่ง 'ใบคำร้อง JSON' มาให้เรารัน",
      paragraphs: [
        "ผู้เริ่มต้นหลายคนเข้าใจผิดว่าเวลาใช้ {{tool-calling}} โมเดล {{llm}} บนคลาวด์สามารถเข้ามารันฟังก์ชัน Python หรือต่อฐานข้อมูลในเครื่องเราได้เอง — ความจริงคือ **LLM ทำได้แค่สร้างข้อความ JSON** ที่ระบุว่าอยากเรียกเครื่องมือชื่ออะไรด้วยอาร์กิวเมนต์อะไร เช่น `{\"name\": \"get_order_status\", \"arguments\": {\"order_id\": \"INV-2026-009\"}}`",
        "โค้ด Python ฝั่งเรา (Application / Host) คือผู้มีอำนาจตัดสินใจทั้งหมด: (1) ชื่อเครื่องมือนี้อยู่ใน Allowlist ที่อนุญาตให้เรียกหรือไม่? (2) `arguments` ที่ส่งมาผ่านด่านตรวจ {{schema}} หรือไม่? และ (3) เมื่อรันฟังก์ชันเสร็จแล้ว จะส่งผลลัพธ์ส่วนไหนกลับไปให้โมเดลสรุปเป็นคำตอบภาษาไทย",
        "การมอง Tool Call เป็นเหมือน **Untrusted HTTP POST Request** ที่ยิงมาจากภายนอก ช่วยให้เราตระหนักทันทีว่าต้องมีทั้ง Allowlist Routing, Strict Schema Validation และ Structured Error Handling เสมอ",
      ],
      analogy:
        "LLM เหมือนพนักงานรับโทรศัพท์หน้าเคาน์เตอร์ที่เขียน 'ใบคำร้องขอเบิกของ' ส่งผ่านช่องกระจกเข้ามาในคลังสินค้า ส่วนโค้ด Python ของเราคือหัวหน้าคลังสินค้าที่ต้องตรวจทั้งรายชื่อรายการที่อนุญาตและตรวจความถูกต้องของแบบฟอร์มก่อนหยิบของจริง",
      bullets: [
        "**Step 1 (Schema Export)**: ส่ง JSON Schema ของเครื่องมือที่อนุญาตไปพร้อมกับคำถามผู้ใช้",
        "**Step 2 (Tool Call Proposal)**: โมเดลตอบกลับเป็น `tool_call(name, arguments)` แทนข้อความปกติ",
        "**Step 3 (Validate & Execute)**: โค้ด Python ตรวจ Allowlist + Pydantic Schema แล้วจึงเรียกฟังก์ชันจริง",
      ],
      whyTitle: "Why this matters — ห้ามใช้ `eval()` หรือ `globals()[tool_name]` กับชื่อฟังก์ชันที่โมเดลส่งมาเด็ดขาด!",
      whyParagraphs: [
        "หากผู้พัฒนาเขียน `globals()[call.name](**call.arguments)` ผู้โจมตีสามารถทำ Prompt Injection หลอกให้โมเดลส่งชื่อฟังก์ชันอันตรายที่มีอยู่ในโมดูลนั้นมาเรียกได้ทันที การใช้ Explicit Allowlist Dictionary จึงเป็นกฎเหล็กข้อแรกเสมอ",
      ],
    },
    {
      id: "strict-pydantic-tool-schemas",
      title: "2 · Strict Pydantic Tool Schemas: `extra='forbid'` และ `strict=True`",
      paragraphs: [
        "โดยค่าเริ่มต้น {{pydantic}} `BaseModel` จะพยายามแปลงชนิดข้อมูลให้อัตโนมัติ ({{coercion}}) และเพิกเฉยต่อฟิลด์ที่ส่งเกินมา (เช่น ส่ง `{\"order_id\": \"INV-001\", \"bypass_acl\": True}` แล้วฟิลด์ `bypass_acl` หายไปเงียบ ๆ) ซึ่งในงาน {{tool-calling}} พฤติกรรมตั้งต้นนี้อาจซ่อนอาการที่โมเดลกำลังสับสนหรือถูกโจมตี",
        "เมื่อเราตั้งค่า `model_config = ConfigDict(extra=\"forbid\", strict=True)` บน Schema ของเครื่องมือ เราจะได้เกราะป้องกัน 2 เรื่องทันที: (1) **`extra=\"forbid\"`** ปฏิเสธทุกฟิลด์แปลกปลอมที่ไม่ได้ประกาศไว้ในโมเดล และ (2) **`strict=True`** บังคับชนิดข้อมูลตรงตามประกาศเป๊ะ เช่น ฟิลด์ `limit: int` ต้องส่งเป็นจำนวนเต็ม `5` เท่านั้น หากส่ง `\"5\"` หรือ `True` จะถูกตีตกด้วย {{validation-error}} ทันที",
        "นอกจากนี้ เรายังเพิ่ม `Field(description=...)` และ `@field_validator` (เช่น บังคับรูปแบบรหัสออเดอร์ `^INV-\\d{4}-\\d{3}$`) เพื่อให้ทั้ง JSON Schema ที่ส่งให้ LLM และตัวตรวจฝั่ง Python ใช้กฎเดียวกัน 100%",
      ],
      analogy:
        "เหมือนช่องหยอดเหรียญอัตโนมัติที่วัดทั้งขนาดและน้ำหนักเหรียญ (`strict=True`) และไม่ยอมให้ยัดกระดาษโน้ตแนบมาพร้อมเหรียญ (`extra='forbid'`) ถ้าผิดสเปกแม้แต่นิดเดียวเครื่องจะดีดคืนทันที",
      code: {
        language: "python",
        filename: "strict_tool_schema.py",
        code: `import re
from pydantic import BaseModel, ConfigDict, Field, field_validator

ORDER_ID_RE = re.compile(r"^INV-\\d{4}-\\d{3}$")


class OrderLookupArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    order_id: str = Field(description="รหัสคำสั่งซื้อรูป INV-YYYY-NNN เช่น INV-2026-009")
    include_items: bool = Field(default=False, description="ดึงรายการสินค้าย่อยด้วยหรือไม่")

    @field_validator("order_id")
    @classmethod
    def validate_order_id_format(cls, v: str) -> str:
        cleaned = v.strip()
        if not ORDER_ID_RE.match(cleaned):
            raise ValueError("order_id must match INV-YYYY-NNN")
        return cleaned`,
        caption: "ผสาน `extra='forbid'`, `strict=True`, `Field(description=...)` และ Regex validator ในคลาสเดียว",
      },
      whyTitle: "Why this matters — `model_json_schema()` สร้างคู่มือให้ LLM อัตโนมัติจากโค้ดจริง",
      whyParagraphs: [
        "เมื่อใช้ `OrderLookupArgs.model_json_schema()` คำอธิบายใน `Field(description=...)` และ `additionalProperties: false` จะถูกส่งไปบอก LLM โดยอัตโนมัติ ช่วยลดความเสี่ยงที่คู่มือใน Prompt กับโค้ดจริงจะไม่อัปเดตตรงกัน",
      ],
    },
    {
      id: "structured-tool-execution-result",
      title: "3 · Structured Tool Execution Result: แปลง Exception ให้เป็นข้อมูลที่ตรวจสอบได้",
      paragraphs: [
        "เมื่อฟังก์ชัน `dispatch_tool_call` พบว่าชื่อเครื่องมือไม่อยู่ใน Allowlist หรือ `arguments` ตกด่าน {{validation}} เราไม่ควรปล่อยให้โปรแกรมโยน Exception ทะลุออกไปจนเธรดของบอทล่ม",
        "แนวทางมาตรฐานคือคืนอ็อบเจกต์ `ToolExecutionResult` ที่มีฟิลด์คงที่: `ok: bool`, `tool_name: str`, `data: dict | None`, `error_code: Literal[\"unknown_tool\", \"validation_error\", \"execution_error\"] | None` และ `error_message: str | None`",
        "การแยก `error_code` อย่างชัดเจนช่วยให้ชั้น Orchestrator (เช่น {{langgraph}} ใน Block B30) ตัดสินใจต่อได้อย่างฉลาด: ถ้าเป็น `validation_error` อาจส่งข้อความผิดพลาดสั้น ๆ กลับให้โมเดลแก้พารามิเตอร์ใหม่ได้ 1 ครั้ง แต่ถ้าเป็น `unknown_tool` ให้บล็อกและตัดเข้า fallback ทันที",
      ],
      analogy:
        "เหมือน HTTP API ที่ไม่ว่าข้างในจะเกิดอะไรขึ้น ก็ตอบกลับเป็น JSON `{ok, data, error_code, error_message}` ที่มีโครงสร้างสม่ำเสมอ ไม่ใช่พ่นหน้า HTML 500 Stack Trace ยาวเหยียดกลับไปหาไคลเอนต์",
      bullets: [
        "**`unknown_tool`**: ชื่อฟังก์ชันไม่อยู่ใน `ToolRegistry` — ห้ามรันและล็อกเหตุการณ์ไว้ตรวจสอบ",
        "**`validation_error`**: พารามิเตอร์ผิดชนิด มีฟิลด์เกิน หรือไม่ตรงรูปแบบ Regex",
        "**`ok=True`**: ฟังก์ชันทำงานสำเร็จ только เมื่อผ่านทั้ง Allowlist และ Strict Pydantic Schema แล้วเท่านั้น",
      ],
      whyTitle: "Why this matters — ป้องกัน Side Effect ทำงานครึ่ง ๆ กลาง ๆ ด้วยการ Validate ก่อน Execute 100%",
      whyParagraphs: [
        "เมื่อการตรวจ Schema แยกอยู่หน้าฟังก์ชันใน `dispatch_tool_call` หากอาร์กิวเมนต์ผิดแม้แต่ตัวเดียว ตัวฟังก์ชัน `handler` จริงจะไม่ถูกเรียกเลย (`call_count == 0`) รับประกันว่าไม่มีการยิง DB หรือ API ภายนอกโดยไม่จำเป็น",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Tool Registry & Strict Schema กับ RPC Router ในเว็บ",
      body: [
        "ถ้าคุณเคยใช้ tRPC, FastAPI หรือ Zod validation บน API endpoint โครงสร้างของ Tool Calling Dispatcher เหมือนกันแบบ 1:1:",
      ],
      table: [
        ["`ToolRegistry` Allowlist dict", "Explicit API Route Table (เฉพาะ endpoint ที่เปิดลงทะเบียน)"],
        ["`ConfigDict(extra='forbid', strict=True)`", "Zod `.strict()` / FastAPI strict request body validation"],
        ["`Model.model_json_schema()`", "OpenAPI / JSON Schema spec ที่ส่งให้ client รู้รูปแบบพารามิเตอร์"],
        ["`ToolExecutionResult(ok=False, error_code=...)`", "Structured 400/404 problem-details JSON response"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมใน Python `isinstance(True, int)` ถึงเป็น `True` และ `strict=True` ช่วยอย่างไร",
      body: [
        "เกร็ดสำคัญของภาษา Python: คลาส `bool` เป็นคลาสลูกของ `int` (`issubclass(bool, int) == True`)! ถ้าระบบตรวจแค่ชนิดข้อมูลแบบหลวม ๆ ค่า `True` อาจหลุดเข้าฟิลด์ตัวเลขกลายเป็นเลข `1` ได้",
        "Pydantic v2 ในโหมด `strict=True` จัดการปัญหานี้ให้เรียบร้อย: ถ้าฟิลด์ประกาศเป็น `int` แล้วมีคนส่ง `True` หรือ `\"123\"` เข้ามา Pydantic จะปฏิเสธทันทีโดยไม่ยอมแปลงค่ามั่ว",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง `ToolRegistry` ที่ลงทะเบียนเครื่องมือ `lookup_order` และ `calculate_refund_fee` พร้อม Strict Pydantic Schemas แล้วทดสอบการเรียกใช้งานทั้งเคสปกติ, เคสส่งฟิลด์เกิน (`extra='forbid'`), เคสส่งชนิดข้อมูลผิด (`strict=True`) และเคสเรียกเครื่องมือที่ไม่ได้ลงทะเบียน",
    steps: [
      {
        title: "1 · นิยาม Strict Input Schemas และผลลัพธ์ `ToolExecutionResult`",
        explain:
          "ใช้ `ConfigDict(extra=\"forbid\", strict=True)` บน Schema ของเครื่องมือทุกตัว เพื่อดักพารามิเตอร์ผิดตั้งแต่ก่อนเรียก handler",
        code: {
          language: "python",
          filename: "worked_tool_registry.py",
          code: `import re
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

ORDER_ID_RE = re.compile(r"^INV-\\d{4}-\\d{3}$")


class LookupOrderInput(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    order_id: str = Field(description="รหัสออเดอร์รูป INV-YYYY-NNN")
    include_history: bool = False

    @field_validator("order_id")
    @classmethod
    def check_order_id(cls, v: str) -> str:
        if not ORDER_ID_RE.match(v):
            raise ValueError("Invalid order_id format")
        return v


class ToolExecutionResult(BaseModel):
    ok: bool
    tool_name: str
    data: dict[str, Any] | None = None
    error_code: Literal["unknown_tool", "validation_error", "execution_error"] | None = None
    error_message: str | None = None`,
        },
      },
      {
        title: "2 · สร้างคลาส `ToolRegistry` ที่ผูก Schema เข้ากับ Handler",
        explain:
          "ตรวจว่า `tool_name` อยู่ใน registry หรือไม่ จากนั้นใช้ `schema_cls.model_validate(raw_args)` ตรวจพารามิเตอร์ก่อนส่งอ็อบเจกต์ที่ผ่านการตรวจแล้วเข้า `handler`",
        code: {
          language: "python",
          filename: "worked_tool_registry.py",
          code: `class RegisteredTool(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    name: str
    schema_cls: type[BaseModel]
    handler: Callable[[BaseModel], dict[str, Any]]


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, RegisteredTool] = {}

    def register(
        self,
        name: str,
        schema_cls: type[BaseModel],
        handler: Callable[[Any], dict[str, Any]],
    ) -> None:
        self._tools[name] = RegisteredTool(
            name=name, schema_cls=schema_cls, handler=handler
        )

    def dispatch(self, tool_name: str, raw_args: dict[str, Any]) -> ToolExecutionResult:
        tool = self._tools.get(tool_name)
        if tool is None:
            return ToolExecutionResult(
                ok=False,
                tool_name=tool_name,
                error_code="unknown_tool",
                error_message=f"Tool '{tool_name}' is not in the allowlist",
            )
        try:
            validated_args = tool.schema_cls.model_validate(raw_args)
        except ValidationError as exc:
            return ToolExecutionResult(
                ok=False,
                tool_name=tool_name,
                error_code="validation_error",
                error_message=f"{len(exc.errors())} validation error(s)",
            )
        try:
            output = tool.handler(validated_args)
            return ToolExecutionResult(ok=True, tool_name=tool_name, data=output)
        except Exception as exc:
            return ToolExecutionResult(
                ok=False,
                tool_name=tool_name,
                error_code="execution_error",
                error_message=str(exc),
            )`,
        },
      },
      {
        title: "3 · ทดสอบการเรียก Tool 4 สถานการณ์",
        explain:
          "เปรียบเทียบผลลัพธ์เมื่อส่งพารามิเตอร์ถูกต้อง, ส่งฟิลด์แอบแฝง `force_admin`, ส่งชนิดข้อมูลผิด (`\"true\"` เป็น string) และเรียกเครื่องมือที่ไม่มีในระบบ",
        code: {
          language: "python",
          filename: "worked_tool_registry.py",
          code: `registry = ToolRegistry()
registry.register(
    "lookup_order",
    LookupOrderInput,
    lambda args: {"order_id": args.order_id, "status": "shipped", "history": args.include_history},
)

r_ok = registry.dispatch("lookup_order", {"order_id": "INV-2026-009", "include_history": True})
r_extra = registry.dispatch("lookup_order", {"order_id": "INV-2026-009", "force_admin": True})
r_type = registry.dispatch("lookup_order", {"order_id": "INV-2026-009", "include_history": "yes"})
r_unknown = registry.dispatch("drop_database", {"confirm": True})

print("1. Valid:", r_ok.ok, r_ok.data)
print("2. Extra field:", r_extra.ok, r_extra.error_code)
print("3. Wrong type:", r_type.ok, r_type.error_code)
print("4. Unknown tool:", r_unknown.ok, r_unknown.error_code)`,
        },
        output: `1. Valid: True {'order_id': 'INV-2026-009', 'status': 'shipped', 'history': True}
2. Extra field: False validation_error
3. Wrong type: False validation_error
4. Unknown tool: False unknown_tool`,
      },
    ],
    gotcha:
      "ห้ามเรียก `tool.handler` ก่อนที่ `tool.schema_cls.model_validate(raw_args)` จะผ่านเด็ดขาด! ในชุดทดสอบเราควรมีตัวนับ `calls` เพื่อพิสูจน์ว่าเมื่อพารามิเตอร์ผิด `handler` จะไม่ถูกเรียกเลยแม้แต่ครั้งเดียว",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `tool_registry.py` ที่มี Strict Pydantic Schema (`LookupOrderArgs`), `ToolRegistry` และฟังก์ชันส่งออก JSON Schema พร้อมเขียน `test_tool_registry.py` ตรวจครบทุกเงื่อนไข",
    requirements: [
      "สร้าง `LookupOrderArgs(BaseModel)` ที่ตั้ง `ConfigDict(extra=\"forbid\", strict=True)` โดยมีฟิลด์ `order_id: str` (ต้องตรงรูปแบบ `^INV-\\d{4}-\\d{3}$`) และ `include_items: bool = False`",
      "สร้าง `ToolExecutionResult(BaseModel)` ที่มี `ok: bool`, `tool_name: str`, `data: dict[str, Any] | None = None`, `error_code: Literal[\"unknown_tool\", \"validation_error\", \"execution_error\"] | None = None` และ `error_message: str | None = None`",
      "สร้างคลาส `ToolRegistry` ที่มีเมธอด `register(name, schema_cls, handler)`, `export_schemas() -> dict[str, dict[str, Any]]` และ `dispatch(tool_name, raw_args) -> ToolExecutionResult`",
      "ยืนยันว่าเมื่อ `tool_name` ไม่อยู่ใน registry หรือ `raw_args` ไม่ผ่าน validation ฟังก์ชัน `handler` ต้องไม่ถูกรันเลย และผลลัพธ์ต้องแปลงเป็น JSON ด้วย `.model_dump_json()` ได้",
      "เขียน `test_tool_registry.py` ทดสอบครบทั้ง input ถูกต้อง, ฟิลด์เกิน (`extra='forbid'`), ชนิดข้อมูลผิด (`strict=True`), รหัสออเดอร์ผิดรูปแบบ และชื่อ tool ที่ไม่รู้จัก",
    ],
    starter: {
      language: "python",
      filename: "tool_registry.py",
      code: `import re
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

ORDER_ID_RE = re.compile(r"^INV-\\d{4}-\\d{3}$")


class LookupOrderArgs(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    order_id: str = Field(description="Order ID in format INV-YYYY-NNN")
    include_items: bool = Field(default=False, description="Include line items")

    @field_validator("order_id")
    @classmethod
    def validate_order_id(cls, v: str) -> str:
        # TODO: ตรวจรูปแบบ ORDER_ID_RE
        raise NotImplementedError


class ToolExecutionResult(BaseModel):
    ok: bool
    tool_name: str
    data: dict[str, Any] | None = None
    error_code: Literal["unknown_tool", "validation_error", "execution_error"] | None = None
    error_message: str | None = None


class ToolRegistry:
    def __init__(self) -> None:
        self._schemas: dict[str, type[BaseModel]] = {}
        self._handlers: dict[str, Callable[[Any], dict[str, Any]]] = {}

    def register(
        self,
        name: str,
        schema_cls: type[BaseModel],
        handler: Callable[[Any], dict[str, Any]],
    ) -> None:
        """ลงทะเบียน tool เข้า allowlist"""
        # TODO: เก็บ schema_cls และ handler
        raise NotImplementedError

    def export_schemas(self) -> dict[str, dict[str, Any]]:
        """คืน JSON Schema ของแต่ละ tool สำหรับส่งให้ LLM"""
        # TODO: ใช้ schema_cls.model_json_schema()
        raise NotImplementedError

    def dispatch(self, tool_name: str, raw_args: dict[str, Any]) -> ToolExecutionResult:
        """ตรวจ allowlist + strict schema ก่อนเรียก handler จริง"""
        # TODO: คืน unknown_tool, validation_error, execution_error หรือผลสำเร็จ
        raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`LookupOrderArgs` ปฏิเสธทั้งฟิลด์เกิน (เช่น `{\"order_id\": \"INV-2026-001\", \"role\": \"admin\"}`) และชนิดข้อมูลผิด (เช่น `include_items=\"true\"`) ใช่หรือไม่?",
      "เมื่อ `dispatch` คืน `validation_error` หรือ `unknown_tool` ฟังก์ชัน `handler` ไม่ถูกเรียกเลย (`call_count == 0`) ใช่หรือไม่?",
      "`export_schemas()[\"lookup_order\"][\"additionalProperties\"]` มีค่าเป็น `False` (ซึ่งเกิดจาก `extra=\"forbid\"`) ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบ 5 เทสต์ (valid dispatch, extra field forbidden, strict type check, unknown tool blocked, JSON schema export) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใน `validate_order_id` ให้ตรวจ `if not ORDER_ID_RE.match(v): raise ValueError(\"order_id must match INV-YYYY-NNN\")` แล้ว `return v`",
      },
      {
        body: "ใน `export_schemas` คืน `{name: cls.model_json_schema() for name, cls in self._schemas.items()}`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_tool_registry.py`:",
        code: {
          language: "python",
          filename: "test_tool_registry.py",
          code: `from tool_registry import LookupOrderArgs, ToolRegistry


def make_registry(call_log: list[str]) -> ToolRegistry:
    reg = ToolRegistry()

    def handle_lookup(args: LookupOrderArgs) -> dict[str, object]:
        call_log.append(args.order_id)
        return {"order_id": args.order_id, "include_items": args.include_items, "status": "paid"}

    reg.register("lookup_order", LookupOrderArgs, handle_lookup)
    return reg


def test_valid_dispatch_executes_handler() -> None:
    calls: list[str] = []
    reg = make_registry(calls)
    res = reg.dispatch("lookup_order", {"order_id": "INV-2026-009", "include_items": True})
    assert res.ok is True
    assert res.data == {"order_id": "INV-2026-009", "include_items": True, "status": "paid"}
    assert calls == ["INV-2026-009"]


def test_rejects_extra_fields_without_calling_handler() -> None:
    calls: list[str] = []
    reg = make_registry(calls)
    res = reg.dispatch(
        "lookup_order",
        {"order_id": "INV-2026-009", "bypass_security": True},
    )
    assert res.ok is False
    assert res.error_code == "validation_error"
    assert calls == []


def test_rejects_wrong_types_and_bad_format_strictly() -> None:
    calls: list[str] = []
    reg = make_registry(calls)
    res_type = reg.dispatch(
        "lookup_order",
        {"order_id": "INV-2026-009", "include_items": "true"},
    )
    res_fmt = reg.dispatch("lookup_order", {"order_id": "999"})
    assert res_type.ok is False and res_type.error_code == "validation_error"
    assert res_fmt.ok is False and res_fmt.error_code == "validation_error"
    assert calls == []


def test_blocks_unknown_tool_and_exports_strict_json_schema() -> None:
    calls: list[str] = []
    reg = make_registry(calls)
    res = reg.dispatch("delete_all_orders", {"order_id": "INV-2026-009"})
    assert res.ok is False
    assert res.error_code == "unknown_tool"
    assert calls == []

    schemas = reg.export_schemas()
    assert schemas["lookup_order"].get("additionalProperties") is False`,
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
      title: "รับ `raw_args: dict` จาก LLM แล้วส่ง `handler(**raw_args)` เข้าฟังก์ชัน Python โดยตรงโดยไม่ผ่าน Pydantic Schema",
      symptom:
        "เมื่อโมเดลส่งฟิลด์ผิดชื่อหรือผิดชนิด ฟังก์ชันแครชด้วย `TypeError` หรือทำงานผิดพลาดด้วยข้อมูลที่ถูกแปลงชนิดแบบไม่ตั้งใจ",
      fix: "บังคับ `schema_cls.model_validate(raw_args)` ด้วย `ConfigDict(extra=\"forbid\", strict=True)` ก่อนเรียก `handler` ทุกครั้ง",
    },
    {
      title: "ลืมตั้ง `extra=\"forbid\"` บน Tool Input Schema",
      symptom:
        "โมเดลแต่งชื่อพารามิเตอร์ที่ไม่มีอยู่จริง (Hallucinated Arguments เช่น `filter_date` หรือ `tenant_override`) แล้ว Pydantic ตัดทิ้งเงียบ ๆ จนฟังก์ชันทำงานโดยไม่ตรงกับความตั้งใจของโมเดล",
      fix: "เปิด `extra=\"forbid\"` เพื่อให้ Pydantic ตีกลับ `validation_error` ทันทีที่โมเดลส่งพารามิเตอร์ที่ไม่ได้อยู่ในสัญญา",
    },
    {
      title: "ใช้ `getattr(tools_module, tool_name)` แทน Explicit Allowlist Dictionary",
      symptom:
        "โมเดลสามารถเรียกฟังก์ชัน helper ภายในหรือฟังก์ชันอันตรายที่บังเอิญถูก import ไว้ในโมดูลนั้นได้",
      fix: "เก็บเฉพาะเครื่องมือที่อนุญาตใน `ToolRegistry` (`dict[str, RegisteredTool]`) เท่านั้น",
    },
    {
      title: "ปล่อยให้ `ValidationError` โยนทะลุออกจาก Dispatcher จนลูปสนทนาพัง",
      symptom:
        "แค่โมเดลสะกดรหัสออเดอร์ผิดรูปแบบครั้งเดียว ผู้ใช้ได้รับหน้า Error 500 ทันทีแทนข้อความอธิบาย",
      fix: "จับ `ValidationError` แล้วห่อเป็น `ToolExecutionResult(ok=False, error_code=\"validation_error\", ...)` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d109-q1",
        "ในสถาปัตยกรรม Native Tool / Function Calling บทบาทที่แท้จริงของโมเดล LLM คือข้อใด?",
        [
          ["LLM เปิดการเชื่อมต่อ TCP ไปยังฐานข้อมูลของบริษัทแล้วรันคำสั่ง SQL ด้วยตัวเอง", "ผิด — LLM บนคลาวด์ไม่ได้รันโค้ดหรือต่อ DB ของเราโดยตรง"],
          ["LLM สร้างโครงสร้างข้อมูล JSON `{name, arguments}` เพื่อเสนอขอเรียกเครื่องมือ ส่วนโค้ด Application ของเราเป็นผู้ตรวจ Allowlist, ตรวจ Schema และรันฟังก์ชันจริง", "ถูกต้อง — อำนาจการตรวจสอบและการรันจริงอยู่ที่โค้ด Python ของเรา 100%"],
          ["LLM คอมไพล์โค้ด Python ให้เป็นไฟล์ `.exe`", "ไม่เกี่ยวข้องกับการทำงานของ Tool Calling"],
          ["LLM แก้ไขไฟล์ `pyproject.toml` อัตโนมัติทุกครั้งที่ตอบคำถาม", "ไม่เป็นความจริง"],
        ],
        "B",
        "การเข้าใจว่า LLM เพียงแค่ส่ง 'ใบคำร้อง JSON' มาให้โค้ดของเรารัน คือหัวใจของการวางด่านความปลอดภัยใน Tool Calling",
        "ใครเป็นคนรันฟังก์ชันจริงในระบบ Tool Calling?",
        "LLM สร้างเพียง JSON `{name, arguments}` ส่วนโค้ด Application ของเราเป็นผู้ตรวจสอบและรันฟังก์ชันจริง",
      ),
      mc(
        "d109-q2",
        "การตั้งค่า `ConfigDict(extra=\"forbid\", strict=True)` บน Pydantic Tool Schema ช่วยป้องกันปัญหาใด?",
        [
          ["ป้องกันไม่ให้โมเดลส่งฟิลด์แปลกปลอมนอกเหนือจากที่ประกาศ (`extra='forbid'`) และป้องกันการส่งชนิดข้อมูลผิดโดยไม่ให้แปลงชนิดแบบคลุมเครือ (`strict=True`)", "ถูกต้อง — ดักทั้ง Hallucinated Arguments และ Type Confusion ตั้งแต่ก่อนรันฟังก์ชัน"],
          ["ทำให้ฟังก์ชันทำงานเร็วขึ้น 1,000 เท่าโดยไม่ต้องต่อฐานข้อมูล", "ไม่ได้ตัดการต่อฐานข้อมูล"],
          ["บังคับให้โมเดลตอบเป็นภาษาอังกฤษเท่านั้น", "ไม่เกี่ยวกับภาษาที่โมเดลใช้ตอบผู้ใช้"],
          ["ลบไฟล์ log อัตโนมัติเมื่อเกิดข้อผิดพลาด", "ไม่เกี่ยวกับการลบ log"],
        ],
        "A",
        "`extra='forbid'` ยังทำให้ JSON Schema ที่ส่งออกมี `additionalProperties: false` ซึ่งสอดคล้องกับโหมด Strict Tool Calling ของผู้ให้บริการ LLM",
        "ทำไมควรเปิด `extra='forbid'` และ `strict=True` บน Tool Schema?",
        "เพื่อปฏิเสธฟิลด์เกินที่โมเดลแต่งขึ้นเอง และบังคับชนิดข้อมูลให้ตรงตามสเปกโดยไม่แปลงค่าแบบเดาสุ่ม",
      ),
      mc(
        "d109-q3",
        "ทำไมจึงห้ามใช้ `getattr(module, tool_name)(**args)` เพื่อเรียกฟังก์ชันตามชื่อที่ LLM ส่งมา?",
        [
          ["เพราะ `getattr` ทำงานช้ากว่า dictionary lookup 10 วินาที", "ความเร็วไม่ใช่เหตุผลหลัก"],
          ["เพราะเปิดช่องโหว่ให้ Prompt Injection สั่งเรียกฟังก์ชันภายในหรือฟังก์ชันที่ไม่ได้รับอนุญาตซึ่งอยู่ในโมดูลเดียวกันได้ จึงต้องใช้ Explicit Allowlist ใน `ToolRegistry` เสมอ", "ถูกต้อง — ต้องอนุญาตเฉพาะเครื่องมือที่ลงทะเบียนใน Allowlist เท่านั้น"],
          ["เพราะ Python 3.12 ถอดฟังก์ชัน `getattr` ออกแล้ว", "Python ยังมี `getattr` ตามปกติ"],
          ["เพราะ `getattr` ไม่รองรับชื่อฟังก์ชันที่มีขีดล่าง `_`", "`getattr` รองรับชื่อฟังก์ชันทุกแบบ"],
        ],
        "B",
        "Explicit Allowlist Registry รับประกันว่าโมเดลมีสิทธิ์เสนอเรียกเฉพาะเครื่องมือที่เราคัดเลือกและผูก Schema ไว้แล้วเท่านั้น",
        "ทำไมต้องใช้ Allowlist `ToolRegistry` แทน `getattr`?",
        "เพื่อป้องกันไม่ให้โมเดลถูกหลอกให้เรียกฟังก์ชันอื่นในโมดูลที่ไม่ได้อนุญาตให้เปิดเป็น Tool",
      ),
      mc(
        "d109-q4",
        "เมื่อ `raw_args` ที่ LLM ส่งมาไม่ผ่าน `schema_cls.model_validate(raw_args)` พฤติกรรมที่ถูกต้องของ `dispatch` คือข้อใด?",
        [
          ["เรียก `handler` ไปก่อนด้วยค่า default แล้วค่อยแจ้งเตือนทีหลัง", "อันตราย — ห้ามรัน side effect เมื่อพารามิเตอร์ผิด"],
          ["ไม่เรียก `handler` เลย และคืน `ToolExecutionResult(ok=False, error_code=\"validation_error\", ...)` ที่มีโครงสร้างชัดเจน", "ถูกต้อง — ป้องกัน side effect 100% และคืนข้อมูลข้อผิดพลาดที่มีโครงสร้างให้ระบบจัดการต่อได้"],
          ["ปล่อยให้โปรแกรมแครชและปิดโปรเซสทันที", "ทำให้ระบบล่มทั้งเซิร์ฟเวอร์"],
          ["เปลี่ยนชื่อ `tool_name` เป็น `unknown_tool`", "ชื่อ tool ถูกแล้ว แต่พารามิเตอร์ผิด จึงต้องเป็น `validation_error`"],
        ],
        "B",
        "การแยก `validation_error` ออกจาก `unknown_tool` และ `execution_error` ช่วยให้ระบบตัดสินใจ retry หรือ fallback ได้อย่างแม่นยำ",
        "เมื่อ Tool Arguments ไม่ผ่าน Pydantic Validation ควรคืนผลลัพธ์อย่างไร?",
        "ห้ามเรียก handler และคืน `ToolExecutionResult(ok=False, error_code='validation_error')`",
      ),
    ],
  },

  takeaways: [
    "**LLM Proposes, Application Validates & Executes**: โมเดลทำหน้าที่แค่สร้าง JSON `{name, arguments}` ส่วนโค้ดของเราเป็นคนตรวจและรันจริง",
    "**Strict Pydantic Tool Schema**: ใช้ `ConfigDict(extra=\"forbid\", strict=True)` คู่กับ `@field_validator` เพื่อดักทั้งฟิลด์เกินและชนิดข้อมูลผิด",
    "**Allowlisted `ToolRegistry`**: อนุญาตเฉพาะชื่อเครื่องมือที่ลงทะเบียนไว้เท่านั้น ห้ามใช้ `eval` หรือ `getattr` แบบเปิดกว้าง",
    "คืนผลลัพธ์เป็น **`ToolExecutionResult`** เสมอ เพื่อให้ชั้น Workflow / Agent จัดการกรณี `unknown_tool` และ `validation_error` ได้โดยระบบไม่ล่ม",
  ],

  reviewCards: [
    rc(
      "d109-rc1",
      "ในระบบ Tool Calling ใครเป็นผู้รันโค้ดฟังก์ชัน Python จริง?",
      "โค้ดฝั่ง Application / Host ของเราเป็นผู้รันจริง (LLM ทำหน้าที่เพียงสร้าง JSON `{name, arguments}` เสนอขึ้นมาเท่านั้น)",
    ),
    rc(
      "d109-rc2",
      "`extra=\"forbid\"` บน Pydantic Tool Schema ช่วยป้องกันอาการใดของ LLM?",
      "ป้องกันอาการ Hallucinated Arguments ที่โมเดลแต่งชื่อฟิลด์พารามิเตอร์ซึ่งไม่มีอยู่ในสัญญาขึ้นมาเอง และสร้าง `additionalProperties: false` ใน JSON Schema",
    ),
    rc(
      "d109-rc3",
      "หากโมเดลส่ง `include_items=\"true\"` (เป็น string) เข้าฟิลด์ `include_items: bool` ที่เปิด `strict=True` ผลจะเป็นอย่างไร?",
      "Pydantic จะโยน `ValidationError` ทันทีโดยไม่แปลง string เป็น boolean แบบคลุมเครือ",
    ),
    rc(
      "d109-rc4",
      "ทำไม `ToolRegistry.dispatch` จึงควรคืน `ToolExecutionResult(ok=False, error_code=...)` แทนการปล่อยให้ Exception ทะลุออกไป?",
      "เพื่อให้ลูปของ Workflow/Agent ไม่ล่ม และสามารถแยกจัดการระหว่าง `unknown_tool`, `validation_error` และ `execution_error` ได้อย่างเป็นระบบ",
    ),
  ],

  sources: [
    {
      label: "Pydantic v2 Documentation — Strict Mode & JSON Schema Generation",
      href: "https://docs.pydantic.dev/latest/concepts/strict_mode/",
    },
    {
      label: "Anthropic Docs — Tool Use (Function Calling) Best Practices",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
    },
    {
      label: "OpenAI Platform Docs — Function Calling & Strict Structured Schemas",
      href: "https://platform.openai.com/docs/guides/function-calling",
    },
  ],

  glossary: ["tool-calling", "pydantic", "basemodel", "schema", "validation", "structured-output"],
});
