import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D003 — Phase 1 / Block B01
 * Pydantic Validators, Nested Models & JSON Serialization.
 */
export const d003: Lesson = defineLesson({
  day: 3,
  titleTh: "ออกแบบ Nested Pydantic Models, @model_validator และ JSON Serialization",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% · ไม่ต้องมี API key · ตรวจกฎข้ามฟิลด์ในโมเดลซ้อนหลายชั้นและแปลง JSON ไป-กลับอย่างแม่นยำ",
  icon: "braces",
  visual: {
    id: "nested-schema",
    title: "Nested Pydantic Models, @model_validator & JSON Round-Trip",
    caption: "กดสลับระหว่างข้อมูล Nested ที่ผ่านกฎข้ามฟิลด์กับเคสที่ถูกจับโดย @model_validator",
    alt: "แผนภาพโครงสร้าง Nested Pydantic model และการแปลงไปกลับเป็น JSON",
  },
  requiresApiKey: false,
  tools: ["Pydantic v2", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ตรวจข้อมูลซ้อนหลายชั้นให้ครบจบตั้งแต่ขอบระบบ",
      body: "คำขอจริงในธุรกิจไม่ได้เป็น JSON แบน ๆ ชั้นเดียว แต่ซ้อนกันหลายระดับ เช่น ทิกเก็ต 1 ใบมีออบเจกต์ลูกค้า (`customer`) และรายการสินค้าที่เคลม (`items[]`) ซ้อนอยู่ข้างใน",
      lessonNote:
        "วันนี้คุณประกอบ Nested {{basemodel}} ที่ตรวจลึกทุกชั้นและรายงานตำแหน่ง error เป็น `loc` tuple ชัดเจน",
    },
    {
      node: 2,
      heading: "จับความขัดแย้งทางตรรกะใน Structured Output ของโมเดล",
      body: "แม้ {{llm}} จะสร้าง JSON ที่มีชนิดข้อมูลตรงทุกฟิลด์ แต่ยังอาจตอบข้อมูลที่ขัดแย้งกันเองได้ เช่น ยอดรวมไม่เท่ากับผลรวมรายการย่อย หรือระบุว่าเป็นงาน `urgent` แต่ไม่ใส่เหตุผล",
      lessonNote:
        "`@model_validator(mode=\"after\")` บังคับกฎข้ามฟิลด์แบบ {{fail-fast}} ก่อนที่ {{structured-output}} ที่ขัดแย้งจะหลุดเข้าสู่ระบบงานจริง",
    },
    {
      node: 3,
      heading: "ยืนยันความสมบูรณ์ของข้อมูลด้วย JSON Round-Trip",
      body: "เมื่อส่งออบเจกต์ข้าม API, บันทึกลงคิว หรือเก็บเป็นไฟล์ {{jsonl}} สำหรับประเมินผล ข้อมูลที่แปลงออกเป็น JSON แล้วแกะกลับต้องได้โครงสร้างและชนิดเดิมครบถ้วน",
      lessonNote:
        "ฝึกใช้ `model_dump_json()` และ `model_validate_json()` คู่กับเทสต์ {{pytest}} เพื่อการันตี round-trip ที่แม่นยำ",
    },
    {
      node: 4,
      heading: "คุมความเข้มงวดของสัญญาข้อมูลด้วย `ConfigDict`",
      body: "ในระบบ production แค่พิมพ์ชื่อฟิลด์ผิด 1 ตัว (`priorty` แทน `priority`) หรือปล่อยให้เกิด {{coercion}} โดยไม่ตั้งใจ อาจทำให้ทิกเก็ตด่วนตกหล่นเงียบ ๆ",
      lessonNote:
        "ตั้งค่า `ConfigDict(extra=\"forbid\")` และเลือกใช้ `strict=True` ให้ถูกจุดเพื่อปกป้อง {{data-contract}} ของแอป",
    },
  ],

  objectives: [
    "**ออกแบบ** Nested {{basemodel}} (`Customer` และ `list[TicketItem]` ภายใน `SupportTicket`) และอ่านเส้นทาง `loc` จาก {{validation-error}} ได้อย่างแม่นยำ",
    "**เขียน** กฎตรวจสอบข้ามฟิลด์ด้วย `@model_validator(mode=\"after\")` ร่วมกับ {{field-validator}} เพื่อดักความขัดแย้งทางธุรกิจก่อนข้อมูลเข้าสู่ระบบ",
    "**ใช้งาน** `model_dump()`, `model_dump_json()`, `model_validate_json()` สำหรับ JSON round-trip และเลือกตั้งค่า `ConfigDict(extra=\"forbid\", strict=...)` ให้เหมาะกับบริบท",
  ],

  prerequisites: [
    "ผ่าน Day 1 (`BaseModel`, `Field`, `Literal`, `@field_validator`) และ Day 2 (`list[...]`, `str | None`, comprehensions)",
    "มี `uv` พร้อมติดตั้ง `pydantic`, `pytest` และ `ruff` ในโปรเจกต์",
    "ไม่ต้องใช้ API key — รันบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์โปรเจกต์ Day 3 ด้วย {{uv}} และติดตั้ง {{pydantic}} v2 พร้อม `pytest` กับ `ruff` เพื่อฝึกสร้าง Nested Models และทดสอบ JSON Round-Trip",
    commands: `uv init ai-day3-pydantic && cd ai-day3-pydantic
uv add pydantic
uv add --dev pytest ruff

# ตรวจว่าได้ Pydantic v2
uv run python -c "import pydantic; print('Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day3-pydantic` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic` และ dev tools (`pytest`, `ruff`) ผ่าน `uv add`"],
      ["verify", "ตรวจเวอร์ชัน Pydantic v2 ด้วย `uv run python` สำเร็จ"],
    ],
    note: "โมเดลซ้อนและกติกาการ serialize ที่คุณเขียนวันนี้จะถูกนำไปต่อยอดสร้าง Batch Thai Support Ticket Parser ในรอบทบทวน Day 4 ทันที",
  },

  concepts: [
    {
      id: "nested-basemodel-composition",
      title: "1 · ประกอบ Nested BaseModel และอ่านเส้นทางข้อผิดพลาด `loc`",
      paragraphs: [
        "แทนที่จะยัด 15 ฟิลด์แบน ๆ ลงในคลาสเดียว เราควรแบ่งโมเดลย่อยตามความหมายทางธุรกิจ เช่น `Customer` และ `TicketItem` แล้วนำมาประกอบใน `SupportTicket` เป็น `customer: Customer` และ `items: list[TicketItem]` — {{pydantic}} จะทำการ {{validation}} ไล่ลึกทุกชั้นให้อัตโนมัติเมื่อรับ `dict` หรือ JSON ก้อนใหญ่เข้ามา",
        "ข้อดีมาก ๆ ของ Pydantic v2 คือเมื่อมีข้อผิดพลาดเกิดในชั้นในหรือในสมาชิกของลิสต์ {{validation-error}} จะรวมทุกจุดที่ผิดไว้ในครั้งเดียวพร้อมระบุเส้นทาง `loc` เป็น tuple เช่น `('customer', 'customer_id')` หรือ `('items', 1, 'unit_price')` ทำให้รู้ทันทีว่าพังที่แถวไหนและฟิลด์ใด",
      ],
      analogy:
        "เหมือนใบเคลมสินค้าที่มีหน้าปกข้อมูลลูกค้าและตารางรายการสินค้าแนบอยู่ — พนักงานตรวจรับไม่ได้แค่บอกว่า \"เอกสารผิด\" แต่ชี้ได้เลยว่า \"หน้าปกช่องรหัสลูกค้าผิด และตารางรายการบรรทัดที่ 2 ช่องราคาติดลบ\"",
      code: {
        language: "python",
        filename: "nested_models.py",
        code: `from typing import Literal
from pydantic import BaseModel, Field, ValidationError


class Customer(BaseModel):
    customer_id: str = Field(min_length=5)
    tier: Literal["standard", "vip"] = "standard"


class TicketItem(BaseModel):
    sku: str = Field(min_length=3)
    quantity: int = Field(ge=1)
    unit_price: int = Field(ge=0)


class SupportTicket(BaseModel):
    ticket_id: str = Field(min_length=5)
    customer: Customer
    items: list[TicketItem] = Field(min_length=1)


bad_payload = {
    "ticket_id": "TKT-901",
    "customer": {"customer_id": "C1"},
    "items": [
        {"sku": "BAG-01", "quantity": 1, "unit_price": 500},
        {"sku": "CAP-02", "quantity": 0, "unit_price": -50},
    ],
}

try:
    SupportTicket.model_validate(bad_payload)
except ValidationError as err:
    for e in err.errors():
        print(e["loc"], "->", e["msg"])`,
        caption: "Pydantic v2 ตรวจลึกทุกชั้นและรายงาน `loc` เช่น `('items', 1, 'quantity')` ครบทุกข้อในครั้งเดียว",
      },
      whyTitle: "Why this matters — รากฐานของ Structured Outputs และ Tool Calling",
      whyParagraphs: [
        "เมื่อเข้าสู่ Phase 3 (Day 77) และ Phase 4 (Day 109) คุณจะส่ง Nested `BaseModel` เหล่านี้ให้ {{llm}} API โดยตรง เพื่อแปลงเป็น JSON Schema และบังคับให้โมเดลตอบข้อมูลซ้อนหลายชั้นออกมาตรงตาม {{schema}} ทุกครั้ง",
        "การแยกโมเดลย่อยยังช่วยให้คุณนำ `Customer` หรือ `TicketItem` ไปใช้ซ้ำข้ามหลาย endpoint และเขียน unit test แยกทีละชิ้นได้สะอาดมาก",
      ],
    },
    {
      id: "model-validator-cross-field",
      title: "2 · ตรวจกฎข้ามฟิลด์ด้วย `@model_validator(mode=\"after\")`",
      paragraphs: [
        "{{field-validator}} เหมาะกับการตรวจหรือทำความสะอาด **ทีละฟิลด์เดี่ยว ๆ** (เช่น เช็กว่า `customer_id` ขึ้นต้นด้วย `CUS-`) แต่หลายกฎทางธุรกิจต้องดูความสัมพันธ์ระหว่าง **สองฟิลด์ขึ้นไปพร้อมกัน** เช่น `reported_total` ต้องเท่ากับผลรวม `quantity * unit_price` ของ `items` ทุกชิ้น หรือเมื่อ `priority == \"urgent\"` ฟิลด์ `escalation_reason` ห้ามว่าง",
        "สำหรับกฎข้ามฟิลด์ ให้ใช้ **`@model_validator(mode=\"after\")`** ซึ่งจะทำงาน *หลังจาก* ที่ทุกฟิลด์และ nested model ผ่านการตรวจพื้นฐานและแปลงชนิดเสร็จแล้ว จุดที่ต้องจำให้แม่นใน Pydantic v2 คือเมธอดนี้รับ **`self`** (ไม่ใช่ `@classmethod` + `cls`) และ **ต้อง `return self` เสมอ**",
      ],
      analogy:
        "`@field_validator` คือยามที่ตรวจเอกสารทีละช่อง (ช่องจำนวนเป็นเลขบวกไหม, ช่องราคาไม่ติดลบใช่ไหม) ส่วน `@model_validator(mode=\"after\")` คือหัวหน้างานที่เอาเครื่องคิดเลขมากดบวกทุกรายการเพื่อเช็กว่าตรงกับยอดสุทธิท้ายบิลหรือไม่",
      code: {
        language: "python",
        filename: "cross_field_validator.py",
        code: `from typing import Literal, Self
from pydantic import BaseModel, Field, ValidationError, model_validator


class TicketItem(BaseModel):
    sku: str = Field(min_length=3)
    quantity: int = Field(ge=1)
    unit_price: int = Field(ge=0)


class SupportTicket(BaseModel):
    ticket_id: str = Field(min_length=5)
    items: list[TicketItem] = Field(min_length=1)
    reported_total: int = Field(ge=0)
    priority: Literal["normal", "urgent"] = "normal"
    escalation_reason: str | None = None

    @model_validator(mode="after")
    def validate_business_rules(self) -> Self:
        expected = sum(item.quantity * item.unit_price for item in self.items)
        if self.reported_total != expected:
            raise ValueError(
                f"reported_total ({self.reported_total}) ไม่ตรงกับผลรวมรายการ ({expected})"
            )
        if self.priority == "urgent" and not (
            self.escalation_reason and self.escalation_reason.strip()
        ):
            raise ValueError("ทิกเก็ตระดับ urgent ต้องระบุ escalation_reason")
        return self


try:
    SupportTicket(
        ticket_id="TKT-500",
        items=[TicketItem(sku="MUG-01", quantity=2, unit_price=150)],
        reported_total=999,
        priority="urgent",
        escalation_reason=None,
    )
except ValidationError as err:
    print(err.errors()[0]["msg"])`,
        caption: "ภายใน `@model_validator(mode=\"after\")` เราเข้าถึง `self.items` และฟิลด์อื่นเป็นชนิดข้อมูลจริงที่ผ่านการตรวจแล้ว และต้อง `return self`",
      },
      whyTitle: "Why this matters — ป้องกันอาการโมเดลตอบ JSON ถูก Format แต่ผิดตรรกะ",
      whyParagraphs: [
        "ปัญหาคลาสสิกเวลาใช้ {{llm}} สกัดใบเสร็จหรือทิกเก็ตคือ JSON syntax ถูกต้อง 100% แต่ตัวเลขยอดรวมบวกผิดหรือไม่สอดคล้องกับรายละเอียดย่อย การวาง `@model_validator` ช่วยให้ระบบจับความผิดพลาดแบบ {{fail-fast}} แล้วส่งข้อความ error กลับไปให้โมเดลซ่อม (Validation-Repair Loop ใน Day 78)",
        "เพราะ `mode=\"after\"` รันหลังทุกฟิลด์ผ่านแล้ว คุณจึงไม่ต้องมานั่งเขียน `isinstance(...)` เช็กซ้ำว่า `self.items` เป็น `list` จริงหรือไม่ — โค้ดสั้น ปลอดภัย และอ่านง่ายกว่า `mode=\"before\"` มาก",
      ],
    },
    {
      id: "serialization-and-configdict",
      title: "3 · JSON Serialization (`model_dump_json` / `model_validate_json`) และ `ConfigDict`",
      paragraphs: [
        "Pydantic v2 แยกการแปลงข้อมูลออกเป็น 3 เมธอดหลักที่ควรจำให้ขึ้นใจ: `model_dump()` แปลงเป็น Python `dict`, **`model_dump_json()`** แปลงเป็นข้อความ JSON UTF-8 มาตรฐานโดยตรง (ภาษาไทยอ่านได้ทันทีไม่ถูก escape เป็น `\\u0e...`) และ **`model_validate_json(raw_json)`** อ่านสตริง JSON แล้ว validate ในขั้นตอนเดียวผ่านแกน Rust ซึ่งเร็วและปลอดภัยกว่าการทำ `json.loads()` แยกเอง",
        "นอกจากนี้ **`ConfigDict`** ช่วยคุมพฤติกรรมทั้งโมเดลอย่างเฉียบคม โดยเฉพาะ 2 ค่าสำคัญ: `extra=\"forbid\"` สั่งปฏิเสธทันทีหากมีฟิลด์แปลกปลอมหรือพิมพ์ชื่อคีย์ผิด (แทนที่จะเงียบทิ้งคีย์นั้นไปเหมือนค่าเริ่มต้น `extra=\"ignore\"`) และ `strict=True` ปิดการทำ {{coercion}} อัตโนมัติ (เช่น ไม่ยอมให้ `\"2\"` ถูกแปลงเป็น `2`)",
      ],
      analogy:
        "`extra=\"forbid\"` เหมือนเครื่องตรวจตั๋วที่ไม่ยอมให้แนบกระดาษแปลกปลอมเข้าซอง; `strict=True` เหมือนเครื่องรับเหรียญที่ไม่ยอมแปลงแบงก์ให้เอง; ส่วน `model_dump_json()` คู่กับ `model_validate_json()` คือกล่องมาตรฐานที่แพ็กส่งข้ามระบบแล้วแกะกลับออกมาได้สภาพเดิม 100%",
      bullets: [
        "**`ConfigDict(extra=\"forbid\")`**: เหมาะมากกับ API {{payload}} และผลลัพธ์จาก LLM เพื่อดัก typo เช่น `priorty` แทน `priority` ทันที",
        "**`ConfigDict(strict=True)`**: เหมาะกับข้อมูลการเงินหรือโมเดลภายในที่ไม่ยอมรับ implicit {{coercion}} (`\"100\"` → `100` หรือ `\"true\"` → `True`)",
        "**`model_dump(exclude_none=True)`**: ตัดฟิลด์ที่เป็น `None` ออกก่อนส่งต่อไปยัง API ปลายทางที่ไม่รับค่า `null`",
      ],
      code: {
        language: "python",
        filename: "serialization_config.py",
        code: `from pydantic import BaseModel, ConfigDict, ValidationError


class StrictItem(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    sku: str
    quantity: int
    unit_price: int


# 1) strict=True ปฏิเสธ "2" ที่เป็น str แทน int
try:
    StrictItem.model_validate({"sku": "TEA-01", "quantity": "2", "unit_price": 80})
except ValidationError as err:
    print("Strict caught:", err.errors()[0]["type"])

# 2) extra="forbid" ปฏิเสธคีย์แปลกปลอมหรือพิมพ์ผิด
try:
    StrictItem.model_validate({"sku": "TEA-01", "quantity": 2, "unit_price": 80, "note": "extra"})
except ValidationError as err:
    print("Extra caught:", err.errors()[0]["type"])

# 3) JSON Round-Trip
item = StrictItem(sku="TEA-01", quantity=2, unit_price=80)
raw_json = item.model_dump_json()
restored = StrictItem.model_validate_json(raw_json)
print("JSON:", raw_json)
print("Round-trip equal:", restored == item)`,
        caption: "`model_validate_json()` แปลงและตรวจ JSON ในรอบเดียว และ `restored == item` ยืนยันว่าข้อมูลกลับคืนครบทุกฟิลด์",
      },
      whyTitle: "Why this matters — เลือก `strict=True` vs default lax mode ให้ถูกที่",
      whyParagraphs: [
        "ไม่ได้แปลว่าทุกโมเดลต้องเปิด `strict=True` เสมอไป: หากรับค่าจาก query string ของเว็บหรือฟอร์ม CSV ที่ตัวเลขมักมาเป็นสตริง โหมดปกติ (`strict=False`) ที่ช่วย coerce `\"2\"` → `2` ให้มีประโยชน์มาก แต่สำหรับข้อมูลการเงิน, tool arguments หรือ {{data-contract}} ภายใน การเปิด `strict=True` และ `extra=\"forbid\"` ช่วยปิดช่องโหว่จากชนิดข้อมูลผิดพลาดได้เด็ดขาด",
        "สำหรับ {{serialization}} การใช้ `model_dump_json()` คู่กับ `model_validate_json()` คือพื้นฐานของการเก็บแคชใน SQLite (Day 27), การเขียนไฟล์ {{jsonl}} (Day 4–5) และการส่งข้อความผ่าน FastAPI (Phase 5)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Nested Pydantic v2 กับ Zod ใน TypeScript",
      body: [
        "ถ้าคุณเคยใช้ Zod ในฝั่ง TypeScript แนวคิดแทบทั้งหมดตรงกันแบบ 1 ต่อ 1 ต่างกันเพียงชื่อเมธอดและตำแหน่งของ config:",
      ],
      table: [
        ["Nested `BaseModel` (`customer: Customer`)", "`z.object({ customer: CustomerSchema })`"],
        ["`@model_validator(mode=\"after\")`", "`.superRefine((val, ctx) => ...)` / `.refine(...)`"],
        ["`ConfigDict(extra=\"forbid\")`", "`z.object(...).strict()` (ปฏิเสธ unknown keys)"],
        ["`ConfigDict(strict=True)`", "ค่าเริ่มต้นของ Zod ที่ไม่ coerce (ไม่ใช้ `z.coerce.*`)"],
        ["`model.model_dump_json()`", "`JSON.stringify(parsed)`"],
        ["`Model.model_validate_json(str)`", "`Schema.parse(JSON.parse(str))` (Pydantic ทำใน Rust รอบเดียว)"],
      ],
    },
    student: {
      title: "First-Year Note — Python `dict` ไม่ใช่ JSON String!",
      body: [
        "มือใหม่หลายคนสับสนระหว่าง `ticket.model_dump()` (ได้ Python `dict` ที่พิมพ์ออกมาเห็น single quote `'...'` และ `True`/`None`) กับ `ticket.model_dump_json()` (ได้ JSON `str` ที่มี double quote `\"...\"` และ `true`/`null`)",
        "ห้ามเขียน `str(ticket.model_dump())` เพื่อส่งออกเป็น JSON เด็ดขาด เพราะ `json.loads()` หรือระบบอื่นจะอ่านไม่ได้ — ใช้ `model_dump_json()` เสมอเมื่อต้องการข้อความ JSON เพื่อบันทึกลงไฟล์หรือส่งข้ามเครือข่าย",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองสร้างโมเดล `SupportTicket` สำหรับระบบเคลมสินค้าภาษาไทยแบบครบวงจร: ซ้อน `Customer` + `list[TicketItem]`, ตรวจยอดรวมและเหตุผลงานด่วนข้ามฟิลด์, ตั้งค่า `ConfigDict`, และทดสอบ JSON Round-Trip",
    steps: [
      {
        title: "1 · สร้าง Nested Models พร้อม `ConfigDict(extra=\"forbid\")` และ `strict=True`",
        explain:
          "ให้ `Customer` ตัดช่องว่างและตรวจคำนำหน้า `CUS-`, ส่วน `TicketItem` เปิด `strict=True` เพื่อกันไม่ให้จำนวนหรือราคามาเป็นสตริงโดยไม่ตั้งใจ",
        code: {
          language: "python",
          filename: "worked_d003.py",
          code: `from typing import Literal, Self
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class Customer(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    customer_id: str = Field(min_length=5)
    name: str = Field(min_length=2)
    tier: Literal["standard", "vip"] = "standard"

    @field_validator("customer_id")
    @classmethod
    def must_start_with_cus(cls, value: str) -> str:
        if not value.startswith("CUS-"):
            raise ValueError("customer_id ต้องขึ้นต้นด้วย 'CUS-'")
        return value


class TicketItem(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    sku: str = Field(min_length=3)
    quantity: int = Field(ge=1)
    unit_price: int = Field(ge=0)


c = Customer(customer_id=" CUS-101 ", name=" สมชาย ใจดี ", tier="vip")
item = TicketItem(sku="BAG-001", quantity=2, unit_price=350)
print(c.model_dump())
print(item.model_dump())`,
        },
        output: `{'customer_id': 'CUS-101', 'name': 'สมชาย ใจดี', 'tier': 'vip'}
{'sku': 'BAG-001', 'quantity': 2, 'unit_price': 350}`,
      },
      {
        title: "2 · เพิ่ม `@model_validator(mode=\"after\")` ตรวจยอดรวมและงานด่วนข้ามฟิลด์",
        explain:
          "ประกอบ `SupportTicket` แล้วเขียนกฎข้ามฟิลด์ 2 ข้อ: ยอด `reported_total` ต้องตรงกับผลรวมสินค้า และถ้า `priority == \"urgent\"` ต้องมี `escalation_reason` ที่ไม่ว่าง",
        code: {
          language: "python",
          filename: "worked_d003.py",
          code: `class SupportTicket(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    ticket_id: str = Field(min_length=5)
    customer: Customer
    items: list[TicketItem] = Field(min_length=1)
    reported_total: int = Field(ge=0)
    priority: Literal["normal", "urgent"] = "normal"
    escalation_reason: str | None = None

    @model_validator(mode="after")
    def check_ticket_consistency(self) -> Self:
        expected = sum(i.quantity * i.unit_price for i in self.items)
        if self.reported_total != expected:
            raise ValueError(f"reported_total ({self.reported_total}) != expected ({expected})")
        if self.priority == "urgent" and not (
            self.escalation_reason and self.escalation_reason.strip()
        ):
            raise ValueError("urgent ticket requires non-empty escalation_reason")
        return self


try:
    SupportTicket.model_validate(
        {
            "ticket_id": "TKT-201",
            "customer": {"customer_id": "CUS-101", "name": "สมชาย"},
            "items": [{"sku": "BAG-001", "quantity": 2, "unit_price": 350}],
            "reported_total": 500,
            "priority": "urgent",
        }
    )
except ValidationError as err:
    print("Validation failed:", err.errors()[0]["msg"])`,
        },
        output: `Validation failed: Value error, reported_total (500) != expected (700)`,
      },
      {
        title: "3 · ทดสอบ JSON Round-Trip ด้วย `model_dump_json()` และ `model_validate_json()`",
        explain:
          "เมื่อข้อมูลผ่านครบทุกกฎ แปลงออกเป็นสตริง JSON ด้วย `model_dump_json()` (จะเห็นภาษาไทยอ่านออกตรง ๆ) แล้วแกะกลับเป็นออบเจกต์ใหม่ด้วย `model_validate_json()`",
        code: {
          language: "python",
          filename: "worked_d003.py",
          code: `ticket = SupportTicket(
    ticket_id=" TKT-202 ",
    customer=Customer(customer_id="CUS-101", name="สมชาย ใจดี", tier="vip"),
    items=[
        TicketItem(sku="BAG-001", quantity=2, unit_price=350),
        TicketItem(sku="CAP-002", quantity=1, unit_price=200),
    ],
    reported_total=900,
    priority="urgent",
    escalation_reason="ลูกค้า VIP ขอเปลี่ยนสินค้าก่อนวันศุกร์",
)

payload_json = ticket.model_dump_json()
restored = SupportTicket.model_validate_json(payload_json)

print("JSON:", payload_json)
print("Equal after round-trip:", restored == ticket)
print("Customer tier:", restored.customer.tier)`,
        },
        output: `JSON: {"ticket_id":"TKT-202","customer":{"customer_id":"CUS-101","name":"สมชาย ใจดี","tier":"vip"},"items":[{"sku":"BAG-001","quantity":2,"unit_price":350},{"sku":"CAP-002","quantity":1,"unit_price":200}],"reported_total":900,"priority":"urgent","escalation_reason":"ลูกค้า VIP ขอเปลี่ยนสินค้าก่อนวันศุกร์"}
Equal after round-trip: True
Customer tier: vip`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมากใน Pydantic v2: ลืมเขียน `return self` ท้าย `@model_validator(mode=\"after\")` หรือเผลอใส่ `@classmethod` เหมือน `@field_validator` — จำง่าย ๆ ว่า `mode=\"after\"` เป็น instance method ที่รับ `self` และ **ต้อง `return self`** เสมอ",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `order_ticket.py` ที่มี Nested Pydantic Models สำหรับทิกเก็ตเคลมสินค้า ตรวจกฎข้ามฟิลด์ด้วย `@model_validator(mode=\"after\")`, บังคับ `extra=\"forbid\"` และ `strict=True`, พร้อมฟังก์ชัน JSON Round-Trip",
    requirements: [
      "สร้าง `Customer(BaseModel)` ที่มี `model_config = ConfigDict(extra=\"forbid\", str_strip_whitespace=True)`, `customer_id: str` (ยาว ≥ 5 และขึ้นต้นด้วย `\"CUS-\"` ผ่าน `@field_validator`), `name: str` (ยาว ≥ 2), และ `tier: Literal[\"standard\", \"vip\"] = \"standard\"`",
      "สร้าง `TicketItem(BaseModel)` ที่มี `model_config = ConfigDict(extra=\"forbid\", strict=True)`, `sku: str` (ยาว ≥ 3), `quantity: int` (`ge=1`), และ `unit_price: int` (`ge=0`)",
      "สร้าง `SupportTicket(BaseModel)` ที่มี `model_config = ConfigDict(extra=\"forbid\", str_strip_whitespace=True)`, `ticket_id: str` (ยาว ≥ 5), `customer: Customer`, `items: list[TicketItem]` (อย่างน้อย 1 รายการ), `reported_total: int` (`ge=0`), `priority: Literal[\"normal\", \"urgent\"] = \"normal\"`, และ `escalation_reason: str | None = None`",
      "เพิ่ม `@model_validator(mode=\"after\")` บน `SupportTicket` เพื่อตรวจ 2 กฎ: (1) `reported_total` ต้องเท่ากับ `sum(i.quantity * i.unit_price for i in self.items)` และ (2) ถ้า `priority == \"urgent\"` ต้องมี `escalation_reason` ที่ไม่ว่างหลัง strip (และต้อง `return self`)",
      "สร้าง `serialize_ticket(ticket: SupportTicket) -> str` (เรียก `ticket.model_dump_json()`) และ `deserialize_ticket(raw_json: str) -> SupportTicket` (เรียก `SupportTicket.model_validate_json(raw_json)`)",
    ],
    starter: {
      language: "python",
      filename: "order_ticket.py",
      code: `from typing import Literal, Self
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Customer(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid", str_strip_whitespace=True) และฟิลด์พร้อม validator 'CUS-'
    pass


class TicketItem(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid", strict=True) พร้อม sku, quantity (>=1), unit_price (>=0)
    pass


class SupportTicket(BaseModel):
    # TODO: ประกอบ Customer + list[TicketItem] และเขียน @model_validator(mode="after") ตรวจยอดรวม + urgent
    pass


def serialize_ticket(ticket: SupportTicket) -> str:
    # TODO: แปลง ticket เป็น JSON string ด้วย model_dump_json()
    raise NotImplementedError


def deserialize_ticket(raw_json: str) -> SupportTicket:
    # TODO: อ่านและ validate JSON string ด้วย SupportTicket.model_validate_json()
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_order_ticket.py",
      code: `import pytest
from pydantic import ValidationError
from order_ticket import (
    Customer,
    SupportTicket,
    TicketItem,
    deserialize_ticket,
    serialize_ticket,
)


def make_valid_payload() -> dict:
    return {
        "ticket_id": " TKT-301 ",
        "customer": {"customer_id": " CUS-1001 ", "name": " นภา ใจดี ", "tier": "vip"},
        "items": [
            {"sku": "BAG-01", "quantity": 2, "unit_price": 450},
            {"sku": "CAP-02", "quantity": 1, "unit_price": 150},
        ],
        "reported_total": 1050,
        "priority": "urgent",
        "escalation_reason": "ลูกค้าต้องการใช้สินค้าพรุ่งนี้",
    }


def test_valid_nested_ticket_and_json_round_trip():
    ticket = SupportTicket.model_validate(make_valid_payload())
    assert isinstance(ticket.customer, Customer)
    assert isinstance(ticket.items[0], TicketItem)
    assert ticket.ticket_id == "TKT-301"
    assert ticket.customer.customer_id == "CUS-1001"

    raw_json = serialize_ticket(ticket)
    assert "นภา ใจดี" in raw_json  # UTF-8 ภาษาไทยอ่านออกตรง ๆ
    restored = deserialize_ticket(raw_json)
    assert restored == ticket


def test_cross_field_total_mismatch_raises():
    payload = make_valid_payload()
    payload["reported_total"] = 999
    with pytest.raises(ValidationError):
        SupportTicket.model_validate(payload)


def test_urgent_requires_non_empty_reason():
    payload = make_valid_payload()
    payload["escalation_reason"] = "   "
    with pytest.raises(ValidationError):
        SupportTicket.model_validate(payload)

    payload["escalation_reason"] = None
    with pytest.raises(ValidationError):
        SupportTicket.model_validate(payload)


def test_extra_forbid_catches_typo_field():
    payload = make_valid_payload()
    payload["priorty"] = "urgent"  # พิมพ์ชื่อฟิลด์ผิด
    with pytest.raises(ValidationError) as exc_info:
        SupportTicket.model_validate(payload)
    assert exc_info.value.errors()[0]["type"] == "extra_forbidden"


def test_strict_item_rejects_string_quantity():
    payload = make_valid_payload()
    payload["items"][0]["quantity"] = "2"  # str ไม่ใช่ int
    with pytest.raises(ValidationError) as exc_info:
        SupportTicket.model_validate(payload)
    assert exc_info.value.errors()[0]["loc"] == ("items", 0, "quantity")
`,
    },
    selfCheck: [
      "`SupportTicket.model_validate(...)` ผ่านกับข้อมูลถูกต้อง และ `deserialize_ticket(serialize_ticket(ticket)) == ticket`",
      "หาก `reported_total` ไม่เท่ากับผลรวม `quantity * unit_price` ระบบโยน `ValidationError` ทันที",
      "หาก `priority == \"urgent\"` แต่ `escalation_reason` เป็น `None` หรือ `\"   \"` ระบบโยน `ValidationError`",
      "การส่งคีย์พิมพ์ผิดอย่าง `priorty` ถูกจับด้วย error type `extra_forbidden` ไม่ถูกทิ้งเงียบ ๆ",
      "การส่ง `\"quantity\": \"2\"` ใน `TicketItem` ถูกปฏิเสธที่ตำแหน่ง `('items', 0, 'quantity')` เพราะ `strict=True`",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 5 ข้อด้วย `uv run pytest -q` และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "วาง `model_config = ConfigDict(extra=\"forbid\", ...)` ไว้ในทุกคลาส (`Customer`, `TicketItem`, `SupportTicket`) โดยเปิด `strict=True` บน `TicketItem` เพื่อกันการ coerce สตริงเป็นตัวเลข",
      },
      {
        body: "ใน `@model_validator(mode=\"after\")` ไม่ต้องใส่ `@classmethod` — เขียนเป็น `def check_rules(self) -> Self:` ตรวจยอดรวมและเช็ก `priority == \"urgent\"` แล้วจบด้วย `return self`",
      },
      {
        body: "โครงของ `Customer`, `TicketItem` และ `SupportTicket` เกือบครบแล้ว — เติมเงื่อนไขใน `check_rules` และฟังก์ชัน `serialize_ticket` / `deserialize_ticket` แล้วรัน `uv run pytest -q`",
        code: {
          language: "python",
          filename: "hint-d003-l3.py",
          code: `from typing import Literal, Self
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Customer(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    customer_id: str = Field(min_length=5)
    name: str = Field(min_length=2)
    tier: Literal["standard", "vip"] = "standard"

    @field_validator("customer_id")
    @classmethod
    def check_prefix(cls, value: str) -> str:
        if not value.startswith("CUS-"):
            raise ValueError("customer_id must start with 'CUS-'")
        return value


class TicketItem(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    sku: str = Field(min_length=3)
    quantity: int = Field(ge=1)
    unit_price: int = Field(ge=0)


class SupportTicket(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    ticket_id: str = Field(min_length=5)
    customer: Customer
    items: list[TicketItem] = Field(min_length=1)
    reported_total: int = Field(ge=0)
    priority: Literal["normal", "urgent"] = "normal"
    escalation_reason: str | None = None

    @model_validator(mode="after")
    def check_rules(self) -> Self:
        # TODO: ตรวจ reported_total กับผลรวม items และตรวจ priority == "urgent"
        return self`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# วาง order_ticket.py และ test_order_ticket.py ในโฟลเดอร์โปรเจกต์
uv run pytest -q
uv run ruff check .`,
      caption: "ลองรัน `uv run pytest -v` เพื่อดูชื่อเคสทั้ง 5 ข้อที่ผ่านทีละข้อ",
    },
  },

  mistakes: [
    {
      title: "ลืม `return self` หรือใส่ `@classmethod` บน `@model_validator(mode=\"after\")`",
      symptom: "เกิด error แปลก ๆ ว่าได้ `None` กลับมา หรือ `TypeError` เรื่องพารามิเตอร์ `cls`/`self` ไม่ตรง",
      fix: "ใน Pydantic v2 `@model_validator(mode=\"after\")` เป็น instance method (`def check(self) -> Self:`) ไม่ใช้ `@classmethod` และ **ต้อง `return self`** เสมอ",
    },
    {
      title: "ไม่ตั้ง `extra=\"forbid\"` แล้วปล่อยให้ฟิลด์พิมพ์ผิดถูกทิ้งเงียบ ๆ",
      symptom: "ส่ง `{\"priorty\": \"urgent\"}` เข้ามาแล้วระบบไม่แจ้ง error แถมบันทึกทิกเก็ตเป็น `priority=\"normal\"` เฉย ๆ",
      fix: "ตั้ง `model_config = ConfigDict(extra=\"forbid\")` ในโมเดลที่รับ {{payload}} หรือผลลัพธ์จาก LLM เพื่อจับคีย์ผิดชื่อทันที",
    },
    {
      title: "ใช้ `str(ticket.model_dump())` แทน `ticket.model_dump_json()`",
      symptom: "ได้ข้อความที่มี single quote `'...'` และ `None` ซึ่งไม่ใช่ JSON มาตรฐาน ทำให้ `model_validate_json()` หรือระบบปลายทางพังทันที",
      fix: "ใช้ `ticket.model_dump_json()` สำหรับแปลงเป็น JSON string และใช้ `SupportTicket.model_validate_json(raw)` เพื่อแกะกลับ",
    },
    {
      title: "เปิด `strict=True` ทุกโมเดลโดยไม่ดูแหล่งที่มาของข้อมูล",
      symptom: "พาร์ส query parameter จาก URL หรือแถวจากไฟล์ CSV ไม่ผ่าน เพราะค่าตัวเลขจากแหล่งเหล่านั้นส่งมาเป็น `str` เสมอ",
      fix: "เปิด `strict=True` เฉพาะโมเดลที่ต้องการห้าม {{coercion}} อย่างเคร่งครัด (เช่น รายการเงินหรือ internal schema) และใช้โหมดปกติกับอินพุตจากฟอร์ม/CSV",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความเข้าใจเรื่อง Nested Models, `@model_validator`, `ConfigDict` และ JSON Round-Trip",
    questions: [
      mc(
        "d003-q1",
        "ต้องการตรวจว่า `reported_total` มีค่าเท่ากับผลรวม `quantity * unit_price` ของ `items` ทุกชิ้นใน `SupportTicket` ควรใช้เครื่องมือใดของ Pydantic v2?",
        [
          ["`@field_validator(\"reported_total\")` อย่างเดียวโดยไม่ดูฟิลด์อื่น", "`@field_validator` ออกแบบมาสำหรับตรวจฟิลด์เดี่ยว ไม่เหมาะกับกฎความสัมพันธ์ระดับทั้งโมเดล"],
          ["`@model_validator(mode=\"after\")` บน `SupportTicket` แล้ว `return self`", "ถูก — `mode=\"after\"` รันหลังทุกฟิลด์รวมถึง `self.items` ผ่านการตรวจแล้ว จึงคำนวณเทียบข้ามฟิลด์ได้สะอาดและปลอดภัย"],
          ["`Field(ge=0)` บน `reported_total`", "`Field(ge=0)` ตรวจได้แค่ไม่ติดลบ ไม่รู้ผลรวมของ `items`"],
          ["`ConfigDict(strict=True)`", "`strict=True` คุมเฉพาะการ coerce ชนิดข้อมูล ไม่ได้ตรวจความสัมพันธ์ทางธุรกิจข้ามฟิลด์"],
        ],
        "B",
        "กฎที่ต้องเปรียบเทียบหลายฟิลด์พร้อมกันควรวางไว้ใน `@model_validator(mode=\"after\")` เพราะมั่นใจได้ว่าทุกฟิลด์และ nested model ผ่านการแปลงชนิดแล้ว",
        "เมื่อไหร่ควรใช้ `@model_validator(mode=\"after\")` แทน `@field_validator`?",
        "เมื่อต้องตรวจความสอดคล้องข้ามตั้งแต่ 2 ฟิลด์ขึ้นไป (เช่น ยอดรวมตรงกับรายการย่อย หรือเงื่อนไขระหว่าง priority กับ reason) โดยรับ `self` และต้อง `return self`",
      ),
      mc(
        "d003-q2",
        "หาก `SupportTicket` **ไม่ได้** ตั้ง `ConfigDict(extra=\"forbid\")` (ใช้ค่าเริ่มต้นของ Pydantic) แล้วผู้เรียกส่ง `{\"priorty\": \"urgent\", ...}` ที่พิมพ์ชื่อฟิลด์ผิดเข้ามา จะเกิดอะไรขึ้น?",
        [
          ["Pydantic โยน `ValidationError` ทันทีว่าชื่อฟิลด์ผิด", "ไม่โยน — ค่าเริ่มต้นของ Pydantic คือ `extra=\"ignore\"`"],
          ["Pydantic แอบเดาและแก้ชื่อ `priorty` เป็น `priority` ให้เอง", "Pydantic ไม่แก้ชื่อคีย์ที่สะกดผิดให้อัตโนมัติ"],
          ["คีย์ `priorty` จะถูกเมินทิ้งเงียบ ๆ และ `priority` จะใช้ค่าเริ่มต้น `\"normal\"` แทน", "ถูก — นี่คือเหตุผลที่งาน API และ LLM schema นิยมตั้ง `ConfigDict(extra=\"forbid\")` เพื่อดัก typo ทันที"],
          ["โปรแกรมจะค้างและกินหน่วยความจำจนเต็ม", "ไม่ค้าง แต่จะเกิดบั๊กเงียบที่ไล่หายากมากใน production"],
        ],
        "C",
        "ค่าเริ่มต้นของ Pydantic v2 คือ `extra=\"ignore\"` ซึ่งอาจซ่อนบั๊กการพิมพ์ชื่อฟิลด์ผิด การตั้ง `extra=\"forbid\"` ทำให้ระบบ fail-fast ทันทีที่เจอคีย์แปลกปลอม",
        "ค่าเริ่มต้นของ `extra` ใน Pydantic v2 คืออะไร และทำไมจึงมักเปลี่ยนเป็น `extra=\"forbid\"`?",
        "ค่าเริ่มต้นคือ `extra=\"ignore\"` (ทิ้งคีย์แปลกปลอมเงียบ ๆ) การเปลี่ยนเป็น `extra=\"forbid\"` ช่วยจับ typo หรือ schema drift ได้ทันที",
      ),
      mc(
        "d003-q3",
        "เมื่อ `TicketItem` ตั้ง `model_config = ConfigDict(strict=True)` และมี `quantity: int` หากส่ง `{\"sku\": \"BAG-01\", \"quantity\": \"2\", \"unit_price\": 350}` เข้า `TicketItem.model_validate(...)` จะเกิดอะไรขึ้น?",
        [
          ["ผ่านปกติ โดยแปลง `\"2\"` เป็น `2` ให้อัตโนมัติ", "นั่นคือพฤติกรรมของโหมดปกติ (`strict=False`) แต่เมื่อเปิด `strict=True` จะไม่ coerce `str` เป็น `int`"],
          ["โยน `ValidationError` เพราะ `strict=True` ไม่อนุญาตให้แปลง `str` เป็น `int`", "ถูก — `strict=True` ปิด implicit coercion ทำให้รับเฉพาะ `int` แท้ ๆ เท่านั้น"],
          ["เก็บ `quantity` เป็นสตริง `\"2\"` ไว้ในออบเจกต์", "Pydantic ไม่มีวันเก็บค่าผิดชนิดไว้ในฟิลด์ `int`"],
          ["เปลี่ยน `quantity` เป็น `0` อัตโนมัติ", "Pydantic ไม่แทนค่าผิดชนิดด้วยค่าศูนย์"],
        ],
        "B",
        "`ConfigDict(strict=True)` ปิดการแปลงชนิดอัตโนมัติ (coercion) ทำให้ `\"2\"` ไม่สามารถผ่านเข้าฟิลด์ `int` ได้ เหมาะกับจุดที่ต้องการความแม่นยำของชนิดข้อมูลสูง",
        "`ConfigDict(strict=True)` เปลี่ยนพฤติกรรมของ Pydantic อย่างไร?",
        "ปิดการทำ implicit coercion (เช่น ไม่ยอมแปลง `\"2\"` เป็น `2` หรือ `\"true\"` เป็น `True`) และโยน `ValidationError` หากชนิดข้อมูลไม่ตรงเป๊ะ",
      ),
      mc(
        "d003-q4",
        "ต้องการแปลงออบเจกต์ `ticket: SupportTicket` เป็นสตริง JSON เพื่อส่งข้ามระบบ แล้วอีกฝั่งอ่านกลับมาเป็น `SupportTicket` คู่เมธอดใดที่แนะนำใน Pydantic v2?",
        [
          ["`str(ticket.model_dump())` และ `eval(...)`", "อันตรายและผิดมาตรฐาน! `str(dict)` ไม่ใช่ JSON และห้ามใช้ `eval` กับข้อมูลภายนอก"],
          ["`ticket.model_dump_json()` และ `SupportTicket.model_validate_json(raw_json)`", "ถูก — แปลงและตรวจ JSON โดยตรงในแกน Rust เร็ว ปลอดภัย และคงภาษาไทย UTF-8 อ่านออกได้ทันที"],
          ["`ticket.dict()` และ `SupportTicket.parse_obj(...)`", "เป็นเมธอดเก่าของ Pydantic v1 ที่ถูก deprecated ใน v2 แล้ว"],
          ["`repr(ticket)` และ `SupportTicket.model_validate(...)`", "`repr(ticket)` เป็นข้อความสำหรับดีบัก ไม่ใช่ JSON และส่งเข้า `model_validate` ไม่ได้"],
        ],
        "B",
        "ใน Pydantic v2 คู่มาตรฐานสำหรับ JSON round-trip คือ `model_dump_json()` และ `model_validate_json()` ซึ่งทำงานใน Rust core โดยตรง",
        "คู่เมธอดมาตรฐานของ Pydantic v2 สำหรับแปลงโมเดลเป็น JSON string และอ่านกลับมาเป็นโมเดลคืออะไร?",
        "`model_dump_json()` (serialize เป็น UTF-8 JSON) และ `Model.model_validate_json(raw_json)` (parse + validate ในขั้นตอนเดียว)",
      ),
    ],
  },

  takeaways: [
    "แยกโครงสร้างซ้อนเป็น Nested {{basemodel}} (`Customer`, `TicketItem` ใน `SupportTicket`) เพื่อนำกลับมาใช้ซ้ำได้และได้ตำแหน่ง error `loc` ที่แม่นยำถึงชั้นใน",
    "ใช้ `@model_validator(mode=\"after\")` สำหรับกฎข้ามฟิลด์ (รับ `self`, ไม่ใส่ `@classmethod` และ **ต้อง `return self`** เสมอ)",
    "คุมความเข้มงวดด้วย `ConfigDict(extra=\"forbid\")` เพื่อดักคีย์พิมพ์ผิด และเลือกใช้ `strict=True` ในจุดที่ไม่ยอมรับ implicit {{coercion}}",
    "ใช้ `model_dump_json()` คู่กับ `model_validate_json()` สำหรับ JSON round-trip ที่เร็ว ปลอดภัย และอ่านภาษาไทยออกตรง ๆ พร้อมต่อไปยัง Batch Parser ใน Day 4",
  ],

  reviewCards: [
    rc(
      "d003-rc-1",
      "ต่างกันอย่างไรระหว่าง `@field_validator` กับ `@model_validator(mode=\"after\")` ใน Pydantic v2?",
      "`@field_validator` ตรวจ/แปลงทีละฟิลด์เดี่ยว (ใช้ `@classmethod`), ส่วน `@model_validator(mode=\"after\")` รันหลังทุกฟิลด์ผ่านแล้วเพื่อตรวจกฎข้ามฟิลด์ (รับ `self` และต้อง `return self`)",
    ),
    rc(
      "d003-rc-2",
      "ความต่างระหว่าง `ConfigDict(extra=\"forbid\")` กับ `ConfigDict(strict=True)` คืออะไร?",
      "`extra=\"forbid\"` ปฏิเสธคีย์แปลกปลอมที่ไม่อยู่ใน schema (ดัก typo) ส่วน `strict=True` ปิดการ coerce ชนิดข้อมูลอัตโนมัติ (เช่น ไม่ยอมแปลง `\"2\"` เป็น `2`)",
    ),
    rc(
      "d003-rc-3",
      "ทำไมจึงควรใช้ `model_dump_json()` และ `model_validate_json()` แทน `str(model.model_dump())`?",
      "`str(dict)` ไม่ใช่ JSON มาตรฐาน (ใช้ single quote และ `None`/`True`) ขณะที่ `model_dump_json()` / `model_validate_json()` สร้างและตรวจ UTF-8 JSON มาตรฐานใน Rust core โดยตรง",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Docs — Models & Nested Models", href: "https://docs.pydantic.dev/latest/concepts/models/" },
    { label: "Pydantic v2 Docs — Model Validators (`@model_validator`)", href: "https://docs.pydantic.dev/latest/concepts/validators/#model-validators" },
    { label: "Pydantic v2 Docs — Serialization (`model_dump` & `model_dump_json`)", href: "https://docs.pydantic.dev/latest/concepts/serialization/" },
    { label: "Pydantic v2 Docs — Configuration (`ConfigDict`, `strict`, `extra`)", href: "https://docs.pydantic.dev/latest/api/config/" },
  ],

  glossary: [
    "pydantic",
    "basemodel",
    "schema",
    "field-validator",
    "validation-error",
    "coercion",
    "serialization",
    "data-contract",
  ],
});
