import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D077 — Phase 3 / Block B20
 * Structured Outputs with Pydantic + Strict JSON Schema
 */
export const d077: Lesson = defineLesson({
  day: 77,
  titleTh: "บังคับผลลัพธ์ LLM ให้ตรงรูปเป๊ะด้วย Pydantic v2 และ Strict JSON Schema",
  tagline: "30 นาที · รองรับทั้ง LLM API จริงและโหมด mock บนเครื่อง · สกัดใบแจ้งหนี้และทิกเก็ตไทยแบบ type-safe",
  icon: "braces",
  visual: {
    id: "structured-output",
    title: "Constrained Decoding & Pydantic Structured Outputs",
    caption: "ดูเส้นทางจากคำถามไทย → JSON Schema บังคับรูปแบบ → Pydantic model_validate ที่พร้อมใช้งานต่อ",
    alt: "แผนภาพการบังคับรูปแบบผลลัพธ์ LLM ด้วย JSON Schema และ Pydantic",
  },
  requiresApiKey: true,
  apiKeyNote: "รองรับทั้ง LLM API จริงและโหมด mock JSON บนเครื่องเพื่อฝึก validation",
  tools: ["Pydantic v2", "Official LLM SDK", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "เปลี่ยนข้อความไทยไร้โครงสร้างให้เป็นสัญญาข้อมูลที่เข้มงวด",
      body: "ใบแจ้งหนี้ อีเมล หรือแชตลูกค้าไทยเต็มไปด้วยรูปแบบที่ไม่ตายตัว การกำหนด {{data-contract}} ด้วย {{pydantic}} ทำให้ทั้งทีมและโมเดลเห็นโครงสร้างเดียวกัน",
      lessonNote: "วันนี้เราสร้าง Strict JSON Schema จาก `BaseModel.model_json_schema()` พร้อม `extra=\"forbid\"` และคำอธิบายภาษาไทย",
    },
    {
      node: 2,
      heading: "Constrained Decoding บังคับรูปแบบตั้งแต่ขั้นตอนสุ่ม Token",
      body: "แทนที่จะขอร้องโมเดลใน prompt ว่า \"ช่วยตอบเป็น JSON\" เราส่ง {{schema}} ให้ {{llm}} API บังคับในชั้น decoding ทำให้ได้ {{structured-output}} ที่ไม่พังเรื่อง syntax",
      lessonNote: "เราจะดูวิธีต่อ Official SDK กับ Pydantic schema พร้อมโหมด mock เพื่อทดสอบบนเครื่องได้โดยไม่ต้องยิง API ทุกครั้ง",
    },
    {
      node: 3,
      heading: "Schema ผ่านไม่ได้แปลว่าตัวเลขหรือกฎธุรกิจถูก",
      body: "JSON ที่รูปแบบถูกต้องอาจยังมี `subtotal + vat != total` หรือมีค่าที่โมเดลแต่งขึ้น ({{hallucination}}) จึงต้องตรวจซ้ำด้วย validator และเทสต์แบบ {{mocking}}",
      lessonNote: "แบบฝึกหัดวันนี้ฝึกเขียน `@model_validator` เช็กกฎธุรกิจข้ามฟิลด์และทดสอบผ่าน `pytest` แบบ 100% ออฟไลน์",
    },
    {
      node: 4,
      heading: "ส่งออก Object ที่ผ่านด่านแล้วเข้าสู่ระบบบัญชีหรือทิกเก็ต",
      body: "โค้ดปลายทางรับ instance ของ {{basemodel}} ที่ type-safe แทน `dict` ดิบ ช่วยตัด `KeyError` และลดโค้ดเช็กซ้ำทั่วทั้งแอป",
      lessonNote: "รูปแบบนี้จะเป็นรากฐานของ Validation-Repair Loop (Day 78) และระบบ Tool Calling (Phase 4)",
    },
  ],

  objectives: [
    "**สร้าง** Strict JSON Schema จาก {{pydantic}} v2 (`ConfigDict(extra=\"forbid\")`, `Literal`, `Field(description=...)`, `model_json_schema()`) เพื่อใช้กับ {{structured-output}}",
    "**เชื่อมต่อ** พาร์เซอร์ผลลัพธ์จาก Official LLM SDK ที่รองรับทั้งการเรียก API จริงและโหมด mock JSON บนเครื่อง",
    "**แยกแยะและป้องกัน** ช่องโหว่ที่ JSON Schema ตรวจไม่ได้ ด้วย `@model_validator` สำหรับกฎธุรกิจข้ามฟิลด์และการอนุญาตค่า `None` เพื่อลด {{hallucination}}",
  ],

  prerequisites: [
    "{{pydantic}} v2 พื้นฐาน: `BaseModel`, `Field`, `Literal`, `ValidationError` (Days 1 & 3)",
    "การเรียก LLM API พื้นฐานและ `pytest` + {{mocking}} (Days 10 & 73)",
    "มีหรือไม่มี `OPENAI_API_KEY` ก็เรียนได้ — โหมด mock และ `pytest` รันบนเครื่องได้ 100%",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ด้วย `uv` พร้อม `pydantic` และ `openai` SDK (หากยังไม่มี API key สามารถรันตัวอย่างโหมด mock และทำแบบฝึกหัดทั้งหมดได้ครบ 100%)",
    commands: `uv init ai-day77 && cd ai-day77
uv add pydantic openai
uv add --dev pytest ruff
uv run python -c "import pydantic, openai; print('Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day77` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `openai` และ `pytest` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน Pydantic v2 สำเร็จ (ยังไม่ต้องตั้ง API key ก็ได้)"],
    ],
    note: "หากต้องการทดสอบกับ API จริงในขั้นสุดท้าย ให้ตั้งตัวแปร `OPENAI_API_KEY` ใน `.env` (และอย่าลืมใส่ `.env` ใน `.gitignore`) — ส่วนการฝึกและ `pytest` ทั้งหมดใช้โหมด mock ออฟไลน์",
  },

  concepts: [
    {
      id: "constrained-decoding",
      title: "1 · จาก \"ช่วยตอบเป็น JSON หน่อย\" สู่ Constrained Structured Outputs",
      paragraphs: [
        "ในยุคแรกของการใช้ {{llm}} นักพัฒนามักเขียนคำสั่งใน prompt ว่า *\"กรุณาตอบเป็น JSON เท่านั้น ห้ามอธิบายเพิ่ม\"* ผลคือโมเดลยังเผลอใส่ข้อความนำหน้า ใส่ markdown code fence ครอบ ลืมลูกน้ำ หรือเปลี่ยนชื่อ key เป็นภาษาไทย ทำให้ `json.loads()` พังกลาง production",
        "**{{structured-output}} แบบ Strict** แก้ปัญหานี้ที่ต้นเหตุด้วยเทคนิค **Constrained Decoding**: แพลตฟอร์มจะคอมไพล์ JSON Schema ของคุณเป็นกฎไวยากรณ์ (finite-state machine) แล้วในทุกจังหวะที่โมเดลจะเลือก token ถัดไป ระบบจะปิดโอกาส (mask probability เป็นศูนย์) ของทุก token ที่ทำให้ JSON ผิดรูปหรือมี key นอก {{schema}}",
        "ผลลัพธ์คือคุณได้ JSON ที่ตรงโครงสร้าง ตรงชนิดข้อมูล และตรงชุดตัวเลือก `Literal` เกือบ 100% โดยไม่ต้องเขียน regex ล้าง markdown fence เองอีกต่อไป",
      ],
      analogy: "การขอใน prompt เหมือนเขียนป้ายบอกลูกค้าว่า \"กรุณากรอกเบอร์โทรเป็นตัวเลขเท่านั้น\" แต่ Constrained Decoding เหมือนช่องกรอกฟอร์มบนเว็บที่ล็อกคีย์บอร์ดให้กดได้เฉพาะเลข 0–9 — พิมพ์ผิดรูปไม่ได้ตั้งแต่ต้น",
      whyTitle: "Why this matters — Reliability คือหัวใจของ AI ในองค์กร",
      whyParagraphs: [
        "ในระบบที่ต้องนำผลจาก LLM ไปบันทึกลงฐานข้อมูล ออกใบแจ้งหนี้ หรือสร้างทิกเก็ตอัตโนมัติ อัตราการพัง 5% จาก JSON ผิดรูปหมายถึงงานค้างวันละหลายร้อยรายการ",
        "Strict Structured Output ช่วยยกระดับความน่าเชื่อถือของโครงสร้างจาก ~90% ขึ้นไปใกล้ 100% ทำให้เราโฟกัสเวลาไปกับการตรวจความถูกต้องของเนื้อหาแทนการแก้ syntax error",
      ],
    },
    {
      id: "pydantic-strict-schema",
      title: "2 · สร้าง Strict JSON Schema จาก Pydantic v2 (`model_json_schema()`)",
      paragraphs: [
        "ข้อดีของการใช้ {{pydantic}} v2 คือเราประกาศ {{basemodel}} ครั้งเดียวเป็น **Single Source of Truth** แล้วสั่ง `Model.model_json_schema()` เพื่อสร้าง JSON Schema ส่งให้ LLM API และใช้ `Model.model_validate_json(raw)` ตรวจฝั่งแอปตอนรับกลับ",
        "สำหรับโหมด Strict ของ LLM API ส่วนใหญ่ (เช่น OpenAI Structured Outputs) มีข้อกำหนดสำคัญ 3 ข้อที่ควรทำจนติดเป็นนิสัย: (1) ตั้ง `model_config = ConfigDict(extra=\"forbid\")` เพื่อให้ schema มี `\"additionalProperties\": false`, (2) หลีกเลี่ยง `dict[str, Any]` ที่เปิดกว้างไร้โครงสร้าง, และ (3) เขียน `Field(description=...)` ให้ชัด เพราะโมเดลอ่าน `description` ใน schema เป็นคำใบ้ในการสกัดข้อมูลด้วย",
      ],
      analogy: "Pydantic `BaseModel` คือพิมพ์เขียวฉบับเดียวที่ส่งให้ทั้งโรงงานผลิต (LLM API) และทีม QC ตรวจรับของ (Python backend) — แก้ที่เดียวตรงกันทั้งสองฝั่ง",
      code: {
        language: "python",
        filename: "strict_schema.py",
        code: `import json
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class InvoiceSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    invoice_no: str | None = Field(
        description="เลขที่ใบแจ้งหนี้ เช่น INV-2026-009 หรือ null หากไม่พบในข้อความ"
    )
    currency: Literal["THB", "USD"] = Field(description="สกุลเงินหลักของเอกสาร")
    total_amount: float = Field(ge=0.0, description="ยอดรวมสุทธิหลังรวมภาษี")


schema = InvoiceSummary.model_json_schema()
print(json.dumps(schema, ensure_ascii=False, indent=2))`,
        caption: "`ConfigDict(extra='forbid')` สร้าง `\"additionalProperties\": false` อัตโนมัติ ซึ่งเป็นเงื่อนไขบังคับของ Strict JSON Schema",
      },
      whyTitle: "Why this matters — ช่อง `| None` คือเกราะกัน Hallucination",
      whyParagraphs: [
        "ข้อผิดพลาดที่พบบ่อยที่สุดเวลาออกแบบ Strict Schema คือบังคับให้ทุก field เป็น `str` ห้ามเป็น `None` — เมื่อเอกสารลูกค้าไม่ได้ระบุเลขที่ใบแจ้งหนี้ โมเดลที่ถูกบังคับให้ตอบ string จะ **แต่งเลขมั่ว ({{hallucination}})** ขึ้นมาเพื่อให้ผ่าน schema!",
        "การประกาศ `str | None` พร้อมระบุใน `description` ว่า *\"คืน `null` หากไม่พบในข้อความ\"* ช่วยลดการแต่งข้อมูลลงได้อย่างมหาศาล",
      ],
    },
    {
      id: "business-rules-and-mocking",
      title: "3 · Schema ผ่าน ≠ ข้อมูลถูก: กฎธุรกิจข้ามฟิลด์ + Offline Mock Testing",
      paragraphs: [
        "Strict JSON Schema บังคับได้เฉพาะโครงสร้างและชนิดข้อมูล แต่ไม่สามารถเช็กความสัมพันธ์เชิงธุรกิจข้ามฟิลด์ได้ เช่น ใบกำกับภาษีไทยที่ `subtotal = 1000.0`, `vat_amount = 70.0` แต่โมเดลสกัด `total_amount = 1700.0` — JSON นี้ผ่าน schema 100% แต่ตัวเลขผิดมหันต์",
        "สถาปัตยกรรมที่แข็งแรงจึงต้องซ้อนด่านตรวจ **2 ชั้น**: ชั้นแรกคือ Strict JSON Schema ที่ฝั่ง LLM API และชั้นที่สองคือ `model_validate_json()` + `@model_validator(mode=\"after\")` ที่ฝั่ง Python เพื่อให้ {{fail-fast}} ด้วย {{validation-error}} ทันทีที่กฎธุรกิจไม่ตรงกัน",
        "นอกจากนี้ ควรแยกฟังก์ชัน *\"เรียก LLM API\"* ออกจากฟังก์ชัน *\"parse & validate\"* เพื่อให้เขียน unit test ด้วย {{mocking}} JSON จำลองรันผ่าน `pytest` ได้ในเสี้ยววินาที โดยไม่เสียค่า API และผลทดสอบ {{reproducibility|ทำซ้ำได้}} ทุกครั้งใน CI",
      ],
      analogy: "Strict Schema เหมือนแบบฟอร์มที่บังคับให้กรอกเฉพาะตัวเลขในช่องราคา แต่ `@model_validator` คือเครื่องคิดเลขของฝ่ายบัญชีที่เช็กอีกทีว่า ยอดก่อนภาษี + VAT 7% ตรงกับยอดสุทธิจริงไหม",
      bullets: [
        "**ด่าน 1 (API / Decoding)**: รับประกัน JSON valid, ชื่อ key ถูกต้อง, ค่าอยู่ใน `Literal`",
        "**ด่าน 2 (Pydantic Validator)**: ตรวจสมการตัวเลข (`subtotal + vat == total`), รูปแบบเลขผู้เสียภาษี 13 หลัก, และเงื่อนไข escalation",
        "**Offline Testing**: ส่ง raw JSON string เข้า `parse_fn(raw_json)` เพื่อทดสอบทั้งเคสปกติ เคส `null` และเคสผิดกฎธุรกิจโดยไม่ต้องต่อเน็ต",
      ],
      whyTitle: "Why this matters — ปูทางสู่ Validation-Repair Loop ใน Day 78",
      whyParagraphs: [
        "เมื่อด่านที่ 2 โยน `ValidationError` พร้อมรายละเอียดว่าผิดตรง field ไหน (เช่น `total_amount != subtotal + vat_amount`) ในวันพรุ่งนี้ (Day 78) เราจะนำข้อความ error นั้นส่งกลับไปให้โมเดลซ่อมตัวเองอัตโนมัติ (Validation-Repair Loop) หรือสลับไป fallback",
        "ถ้าไม่มีด่านที่ 2 ข้อมูลที่เลขไม่ตรงจะไหลลงฐานข้อมูลเงียบ ๆ โดยไม่มีสัญญาณเตือนเลย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Pydantic Strict Schema ≈ TypeScript + Zod Response Format",
      body: [
        "ถ้าคุณเคยใช้ Zod (`zodResponseFormat`) กับ OpenAI Node SDK หรือสร้าง OpenAPI DTO ใน NestJS/Fastify แนวคิดเหมือนกันทุกประการ: นิยาม schema เป็นโค้ด, แปลงเป็น JSON Schema ส่งให้ LLM, แล้ว parse ผลลัพธ์กลับเข้า object ที่มี type ครบ",
        "ข้อต่างสำคัญที่ควรจำใน Pydantic v2 คือใช้ `model_validate_json(raw_str)` (รันด้วยแกน Rust โดยตรง เร็วกว่า `json.loads` + `model_validate`) และใช้ `ConfigDict(extra=\"forbid\")` แทน `.strict()` ของ Zod",
      ],
      table: [
        ["`BaseModel` + `ConfigDict(extra='forbid')`", "`z.object({...}).strict()`"],
        ["`Model.model_json_schema()`", "`zodToJsonSchema(schema)`"],
        ["`Model.model_validate_json(raw)`", "`schema.parse(JSON.parse(raw))`"],
        ["`@model_validator(mode='after')`", "`schema.superRefine(...)`"],
      ],
    },
    student: {
      title: "First-Year Note — JSON Schema คืออะไร และทำไมต้องใช้โหมด Mock ตอนเทสต์",
      body: [
        "**JSON Schema** คือไฟล์ JSON ที่ไม่ได้เก็บข้อมูลจริง แต่เก็บ *\"กฎ\"* ของข้อมูล เช่น ต้องมี key ชื่อ `currency` ที่เป็น string เฉพาะค่า `THB` หรือ `USD` เท่านั้น — Pydantic สามารถสร้างกฎนี้จาก class Python ให้เราอัตโนมัติ",
        "เวลาเขียนเทสต์ (`pytest`) เราไม่ควรยิงไปหา LLM API จริงทุกครั้ง เพราะทั้งช้า เสียเงิน และคำตอบอาจเปลี่ยนเล็กน้อยในแต่ละรอบ เราจึงจำลองข้อความ JSON ที่โมเดลน่าจะตอบกลับมา (Mock JSON) เพื่อทดสอบโค้ดฝั่งเราให้มั่นใจ 100% ก่อน",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: สกัดข้อมูลใบกำกับภาษีไทย (เลขเอกสาร, รายการสินค้า, ยอดก่อนภาษี, VAT 7%, ยอดสุทธิ) ด้วย Strict JSON Schema + กฎเช็กยอดรวม และทดสอบได้ทั้งโหมด API จริงและโหมด Mock บนเครื่อง",
    steps: [
      {
        title: "1 · นิยาม Pydantic Model พร้อม Cross-Field Validator สำหรับใบแจ้งหนี้ไทย",
        explain: "ตั้ง `extra=\"forbid\"` ทั้ง model หลักและ nested model พร้อม `@model_validator` เช็กว่า `subtotal + vat_amount` ตรงกับ `total_amount` (เผื่อทศนิยมปัดเศษ `0.02` บาท)",
        code: {
          language: "python",
          filename: "worked_day77.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator


class LineItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, description="ชื่อสินค้าหรือบริการ")
    amount: float = Field(ge=0.0, description="จำนวนเงินของรายการนี้")


class ThaiInvoiceExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    invoice_no: str | None = Field(description="เลขที่ใบแจ้งหนี้ หรือ null หากไม่ระบุ")
    currency: Literal["THB", "USD"] = Field(description="สกุลเงิน")
    items: list[LineItem] = Field(min_length=1, description="รายการสินค้าอย่างน้อย 1 รายการ")
    subtotal: float = Field(ge=0.0, description="ยอดรวมก่อนภาษี")
    vat_amount: float = Field(ge=0.0, description="ยอดภาษีมูลค่าเพิ่ม")
    total_amount: float = Field(ge=0.0, description="ยอดรวมสุทธิ")

    @model_validator(mode="after")
    def verify_invoice_math(self) -> "ThaiInvoiceExtraction":
        expected = round(self.subtotal + self.vat_amount, 2)
        if abs(expected - self.total_amount) > 0.02:
            raise ValueError(
                f"ยอดรวมไม่ตรง: subtotal({self.subtotal}) + vat({self.vat_amount}) != total({self.total_amount})"
            )
        return self


schema = ThaiInvoiceExtraction.model_json_schema()
print("Strict additionalProperties:", schema.get("additionalProperties"))
print("Required keys:", schema.get("required"))`,
        },
        output: `Strict additionalProperties: False
Required keys: ['invoice_no', 'currency', 'items', 'subtotal', 'vat_amount', 'total_amount']`,
      },
      {
        title: "2 · เขียน Extractor ที่รองรับทั้ง Official LLM SDK และโหมด Mock ออฟไลน์",
        explain: "แยกชั้นรับ JSON ดิบออกจากการเรียก API — เมื่อส่ง `mock_json` เข้ามาจะรันออฟไลน์ได้ทันที ส่วนตอนใช้จริงจะเรียก `client.chat.completions.parse(..., response_format=ThaiInvoiceExtraction)`",
        code: {
          language: "python",
          filename: "worked_day77.py",
          code: `def extract_thai_invoice(
    document_text: str,
    *,
    mock_json: str | None = None,
    client: object | None = None,
    model: str = "gpt-4o-mini",
) -> ThaiInvoiceExtraction:
    if mock_json is not None:
        return ThaiInvoiceExtraction.model_validate_json(mock_json)
    if client is None:
        raise ValueError("ต้องส่ง mock_json (โหมดออฟไลน์) หรือ OpenAI client (โหมด API จริง)")
    completion = client.chat.completions.parse(  # type: ignore[attr-defined]
        model=model,
        temperature=0.0,
        messages=[
            {"role": "system", "content": "สกัดข้อมูลใบแจ้งหนี้ตาม schema หากไม่มีข้อมูลให้ใส่ null ห้ามเดา"},
            {"role": "user", "content": document_text},
        ],
        response_format=ThaiInvoiceExtraction,
    )
    parsed = completion.choices[0].message.parsed
    if parsed is None:
        raise ValueError("Model refused or returned empty parsed payload")
    return parsed


good_mock = """
{
  "invoice_no": "INV-2026-009",
  "currency": "THB",
  "items": [{"name": "ค่าบริการ Cloud รายเดือน", "amount": 1000.0}],
  "subtotal": 1000.0,
  "vat_amount": 70.0,
  "total_amount": 1070.0
}
"""
inv = extract_thai_invoice("ใบแจ้งหนี้ INV-2026-009 ค่าบริการ 1,000 + VAT 70 รวม 1,070 บาท", mock_json=good_mock)
print("PARSED OK:", inv.invoice_no, inv.total_amount, inv.currency)`,
        },
        output: `PARSED OK: INV-2026-009 1070.0 THB`,
      },
      {
        title: "3 · ทดสอบเคสที่ JSON ถูกโครงสร้างแต่เลขบัญชีผิด (ด่านที่ 2 จับได้)",
        explain: "จำลองคำตอบจาก LLM ที่ผ่าน Strict Schema ทุก field แต่ `total_amount` เพี้ยนเป็น `1700.0` — `@model_validator` จะโยน `ValidationError` ทันที",
        code: {
          language: "python",
          filename: "worked_day77.py",
          code: `bad_math_mock = """
{
  "invoice_no": null,
  "currency": "THB",
  "items": [{"name": "ค่าบริการ Cloud รายเดือน", "amount": 1000.0}],
  "subtotal": 1000.0,
  "vat_amount": 70.0,
  "total_amount": 1700.0
}
"""
try:
    extract_thai_invoice("...", mock_json=bad_math_mock)
except ValidationError as err:
    for e in err.errors():
        print("CAUGHT:", e["type"], "->", e["msg"])`,
        },
        output: `CAUGHT: value_error -> Value error, ยอดรวมไม่ตรง: subtotal(1000.0) + vat(70.0) != total(1700.0)`,
      },
    ],
    gotcha: "จุดสังเกตสำคัญ: เมื่อใช้ Strict Schema กับ nested model อย่าง `LineItem` อย่าลืมใส่ `model_config = ConfigDict(extra=\"forbid\")` ใน **ทุก** sub-model ด้วย ไม่ใช่แค่ model นอกสุด มิฉะนั้น API บางเจ้าจะปฏิเสธ schema เพราะ `additionalProperties: false` ขาดหายไปใน `$defs`",
  },

  practice: {
    intro: "สร้างตัวสกัดทิกเก็ตแจ้งปัญหาลูกค้าภาษาไทยแบบ Strict Schema ใน `exercise_day77.py` พร้อมตัวสร้าง payload `response_format` และกฎธุรกิจบังคับส่งต่อเจ้าหน้าที่ (Human Review) สำหรับเคสด่วนยอดเงินสูง",
    requirements: [
      "สร้าง `ThaiTicketExtraction(BaseModel)` ที่ตั้ง `ConfigDict(extra=\"forbid\")` และมี field ดังนี้: `ticket_ref: str | None`, `category: Literal[\"billing\", \"shipping\", \"technical\", \"account\"]`, `urgency: Literal[\"low\", \"medium\", \"high\"]`, `amount_thb: float | None = Field(ge=0.0)` (อนุญาต `None` ได้), `summary_th: str` (strip ช่องว่างแล้วต้องยาว 5–160 ตัวอักษร), `needs_human_review: bool`",
      "เพิ่ม `@model_validator(mode=\"after\")` บังคับกฎธุรกิจ: หาก `urgency == \"high\"` และ `amount_thb is not None` และ `amount_thb >= 10000.0` แต่ `needs_human_review` เป็น `False` ให้ `raise ValueError(...)`",
      "สร้างฟังก์ชัน `build_strict_response_format(model_cls: type[BaseModel]) -> dict` ที่คืนโครงสร้าง `{\"type\": \"json_schema\", \"json_schema\": {\"name\": model_cls.__name__, \"strict\": True, \"schema\": schema}}` โดยต้องตรวจว่า `schema.get(\"additionalProperties\") is False` (ถ้าไม่ใช่ให้ `raise ValueError`)",
      "สร้างฟังก์ชัน `parse_ticket_json(raw_json: str) -> ThaiTicketExtraction` ที่ใช้ `ThaiTicketExtraction.model_validate_json(raw_json)`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day77.py",
      code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ThaiTicketExtraction(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid"), fields, field_validator และ model_validator
    pass


def build_strict_response_format(model_cls: type[BaseModel]) -> dict:
    # TODO: สร้าง dict response_format สำหรับ Strict JSON Schema และตรวจ additionalProperties is False
    raise NotImplementedError


def parse_ticket_json(raw_json: str) -> ThaiTicketExtraction:
    # TODO: parse raw JSON string ด้วย model_validate_json
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day77.py",
      code: `import json
import pytest
from pydantic import BaseModel, ValidationError
from exercise_day77 import (
    ThaiTicketExtraction,
    build_strict_response_format,
    parse_ticket_json,
)


def test_build_strict_response_format():
    fmt = build_strict_response_format(ThaiTicketExtraction)
    assert fmt["type"] == "json_schema"
    assert fmt["json_schema"]["name"] == "ThaiTicketExtraction"
    assert fmt["json_schema"]["strict"] is True
    assert fmt["json_schema"]["schema"]["additionalProperties"] is False

    class LooseModel(BaseModel):
        a: str

    with pytest.raises(ValueError):
        build_strict_response_format(LooseModel)


def test_parse_valid_nullable_ticket():
    raw = json.dumps({
        "ticket_ref": None,
        "category": "billing",
        "urgency": "medium",
        "amount_thb": None,
        "summary_th": "  ลูกค้าสอบถามวิธีขอใบกำกับภาษี  ",
        "needs_human_review": False,
    })
    res = parse_ticket_json(raw)
    assert res.ticket_ref is None
    assert res.amount_thb is None
    assert res.summary_th == "ลูกค้าสอบถามวิธีขอใบกำกับภาษี"


def test_reject_extra_unknown_key():
    raw = json.dumps({
        "ticket_ref": "INV-01",
        "category": "technical",
        "urgency": "low",
        "amount_thb": 0.0,
        "summary_th": "เข้าสู่ระบบไม่ได้หลังเปลี่ยนรหัส",
        "needs_human_review": False,
        "extra_guess": "should fail",
    })
    with pytest.raises(ValidationError):
        parse_ticket_json(raw)


def test_high_urgency_high_amount_requires_human_review():
    bad = json.dumps({
        "ticket_ref": "INV-2026-099",
        "category": "billing",
        "urgency": "high",
        "amount_thb": 15000.0,
        "summary_th": "ระบบตัดบัตรเครดิตซ้ำ 15,000 บาท",
        "needs_human_review": False,
    })
    with pytest.raises(ValidationError):
        parse_ticket_json(bad)

    good = bad.replace("false", "true")
    res = parse_ticket_json(good)
    assert res.needs_human_review is True
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases โดยไม่ต้องใช้ API key",
      "ตรวจว่า `build_strict_response_format` ปฏิเสธโมเดลที่ลืมตั้ง `extra=\"forbid\"`",
      "ตรวจว่า `ticket_ref=None` และ `amount_thb=None` ผ่านได้ (ช่วยลด hallucination เมื่อเอกสารไม่ระบุ)",
      "ตรวจว่าเคสด่วนยอด `>= 10,000` บาทที่ `needs_human_review=False` ถูกดักด้วย `ValidationError`",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day77.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "สำหรับ `amount_thb: float | None = Field(default=None, ge=0.0)` Pydantic v2 จะยอมรับทั้ง `None` และเลข `>= 0.0` แต่ปฏิเสธเลขติดลบ — และอย่าลืมใส่ `field_validator(\"summary_th\")` ที่ `strip()` ก่อนเช็กความยาว 5–160 ตัวอักษร",
      },
      {
        body: "ใน `@model_validator(mode=\"after\")` เมธอดจะเป็น instance method (`def check_escalation(self) -> \"ThaiTicketExtraction\":`) และต้อง `return self` ตอนท้ายเสมอ ส่วน `build_strict_response_format` ให้เรียก `schema = model_cls.model_json_schema()` แล้วเช็ก `schema.get(\"additionalProperties\") is not False`",
      },
      {
        body: "โครงของ `ThaiTicketExtraction` เกือบครบแล้ว — เติม `build_strict_response_format` และ `parse_ticket_json` แล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_day77.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ThaiTicketExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ticket_ref: str | None = None
    category: Literal["billing", "shipping", "technical", "account"]
    urgency: Literal["low", "medium", "high"]
    amount_thb: float | None = Field(default=None, ge=0.0)
    summary_th: str
    needs_human_review: bool

    @field_validator("summary_th")
    @classmethod
    def clean_summary(cls, v: str) -> str:
        cleaned = v.strip()
        if not (5 <= len(cleaned) <= 160):
            raise ValueError("summary_th must be 5..160 chars after strip")
        return cleaned

    @model_validator(mode="after")
    def enforce_high_value_escalation(self) -> "ThaiTicketExtraction":
        if self.urgency == "high" and self.amount_thb is not None and self.amount_thb >= 10000.0:
            if not self.needs_human_review:
                raise ValueError("High-urgency ticket >= 10,000 THB requires human review")
        return self`,
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
      title: "ไม่ยอมให้ field เป็น `None` เมื่อข้อมูลอาจไม่มีในเอกสาร",
      symptom: "ลูกค้าร้องเรียนโดยไม่ได้พิมพ์เลขใบแจ้งหนี้ แต่ schema บังคับ `invoice_no: str` โมเดลจึงแต่งเลข `\"INV-0001\"` ขึ้นมาเอง",
      fix: "ใช้ `str | None` พร้อมระบุใน `Field(description=...)` ให้คืน `null` หากไม่พบในข้อความต้นฉบับ",
    },
    {
      title: "ลืม `ConfigDict(extra=\"forbid\")` ใน Nested Model",
      symptom: "API คืน HTTP 400 แจ้งว่า `additionalProperties must be false` ใน `$defs` หรือโมเดลแอบส่ง key ส่วนเกินหลุดเข้ามา",
      fix: "ใส่ `model_config = ConfigDict(extra=\"forbid\")` ให้ทั้ง model หลักและ sub-model ทุกตัว (หรือสร้าง `StrictBaseModel` กลางให้ทุกคลาสสืบทอด)",
    },
    {
      title: "เชื่อใจข้อมูลทันทีแค่เพราะผ่าน Strict JSON Schema",
      symptom: "ยอด `subtotal + vat` ไม่เท่ากับ `total_amount` หรือวันที่ผิดตรรกะ หลุดเข้าฐานข้อมูลโดยไม่มีใครรู้",
      fix: "เพิ่ม `@model_validator(mode=\"after\")` ตรวจความสอดคล้องข้ามฟิลด์เสมอ และใช้ `ValidationError` เป็นสัญญาณทำ retry/escalation",
    },
    {
      title: "ยิง LLM API จริงในทุก Unit Test",
      symptom: "รัน `pytest` ช้า เสียเงินค่า API ทุกครั้งที่แก้โค้ด และ CI พังเมื่อเน็ตหลุดหรือ rate limit เต็ม",
      fix: "แยกฟังก์ชัน parse/validate ออกจาก HTTP client แล้วทดสอบด้วย mock JSON ใน unit test (ส่วนการทดสอบกับ API จริงแยกไปไว้ในชุด evals ของ Phase 5)",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d077-q1",
        "Strict Structured Outputs (Constrained Decoding) แตกต่างจากการเขียนใน prompt ว่า \"กรุณาตอบเป็น JSON\" อย่างไร?",
        [
          ["Constrained Decoding แค่เพิ่มคำว่า JSON ลงท้าย prompt ให้โดยอัตโนมัติ", "ไม่จริง — มันทำงานที่ชั้นการเลือก token ของโมเดล ไม่ใช่แค่การต่อข้อความใน prompt"],
          ["Constrained Decoding บังคับกฎ JSON Schema ตั้งแต่ขั้นตอนสุ่ม token (mask token ที่ผิดรูปออก) จึงรับประกันโครงสร้างและชนิดข้อมูลได้แทบ 100%", "ถูก — โมเดลไม่สามารถพ่น markdown fence, syntax พัง หรือ key นอก schema ออกมาได้"],
          ["Constrained Decoding ทำให้ LLM ไม่เกิด hallucination เชิงข้อเท็จจริงอีกเลย", "ไม่จริง — มันรับประกันแค่ *รูปแบบ/โครงสร้าง* ไม่ได้การันตีความจริงของเนื้อหา"],
          ["Constrained Decoding ใช้ได้เฉพาะกับข้อความภาษาอังกฤษ", "ไม่จริง — ค่าของ string ข้างใน JSON สามารถเป็นภาษาไทยได้เต็มที่"],
        ],
        "B",
        "Constrained Decoding คอมไพล์ JSON Schema เป็นข้อจำกัดตอนสุ่ม token ทำให้ได้ผลลัพธ์ตรงโครงสร้าง แต่เรายังต้องตรวจความถูกต้องเชิงเนื้อหาและกฎธุรกิจต่อ",
        "Constrained Structured Outputs รับประกันอะไรได้ และรับประกันอะไรไม่ได้?",
        "รับประกันโครงสร้าง JSON, ชื่อ key, ชนิดข้อมูล และค่าใน Literal ได้แทบ 100% — แต่ไม่รับประกันความถูกต้องเชิงข้อเท็จจริงหรือกฎธุรกิจข้ามฟิลด์",
      ),
      mc(
        "d077-q2",
        "เหตุใดการออกแบบ schema สกัดเอกสารไทยจึงควรประกาศฟิลด์ที่อาจไม่มีในต้นฉบับเป็น `str | None` แทน `str`?",
        [
          ["เพื่อลดขนาดไฟล์ Python ให้สั้นลง", "ความยาวโค้ดยาวขึ้นด้วยซ้ำ เป้าหมายคือคุณภาพข้อมูลไม่ใช่ความสั้น"],
          ["เพื่อให้โมเดลตอบ `null` ได้อย่างซื่อสัตย์เมื่อไม่มีข้อมูล แทนที่จะถูก schema บังคับให้แต่งค่า (hallucinate) ขึ้นมาเติม", "ถูก — ช่องทางออก `null` เป็นเทคนิคสำคัญที่สุดอย่างหนึ่งในการลด hallucination ในงาน extraction"],
          ["เพราะ Pydantic v2 ไม่รองรับ `str` แบบ required", "Pydantic v2 รองรับ `str` แบบ required เป็นค่าเริ่มต้น"],
          ["เพื่อให้ JSON ที่ได้มีจำนวน token มากขึ้น", "ไม่เกี่ยวกัน — `null` ใช้เพียง 1 token ด้วยซ้ำ"],
        ],
        "B",
        "หาก schema บังคับให้ field ที่อาจหายไปในเอกสารต้องมีค่า string เสมอ โมเดลจะจำใจเดาหรือแต่งข้อมูลขึ้นมาเพื่อให้ผ่านด่าน Constrained Decoding",
        "ทำไมฟิลด์ที่อาจไม่ปรากฏในเอกสารต้นฉบับควรเป็น `T | None` ใน Strict Schema?",
        "เพื่อเปิดทางให้โมเดลตอบ `null` ได้แทนการถูกบังคับให้แต่งข้อมูล (hallucinate) เพื่อให้ผ่าน schema",
      ),
      mc(
        "d077-q3",
        "การตั้ง `model_config = ConfigDict(extra=\"forbid\")` ใน Pydantic v2 มีผลสำคัญอย่างไรต่อ Strict JSON Schema?",
        [
          ["ลบ field ที่เป็นภาษาไทยออกทั้งหมดก่อนส่ง API", "ไม่ใช่ — มันควบคุมเฉพาะ key ส่วนเกินที่ไม่ได้ประกาศใน schema"],
          ["สร้าง `\"additionalProperties\": false` ใน JSON Schema และปฏิเสธ payload ที่มี key แปลกปลอมด้วย `ValidationError`", "ถูก — ตรงตามข้อกำหนดของ Strict Structured Outputs และป้องกัน key ที่โมเดลแถมมา"],
          ["ทำให้โมเดลตอบกลับเร็วขึ้น 10 เท่า", "ไม่ได้เร่งความเร็วโมเดล 10 เท่า แต่ช่วยให้สัญญาข้อมูลเข้มงวด"],
          ["ปิดการทำงานของ `@field_validator` ทั้งหมด", "ไม่จริง — validator ทุกตัวยังทำงานตามปกติ"],
        ],
        "B",
        "`ConfigDict(extra=\"forbid\")` ทำงานทั้งสองด้าน: ใส่ `\"additionalProperties\": false` ใน JSON Schema และโยน `ValidationError` หากมี key ส่วนเกิน",
        "`ConfigDict(extra=\"forbid\")` ช่วยอะไรใน Pydantic Strict Schema?",
        "สร้าง `\"additionalProperties\": false` ใน JSON Schema (ตามข้อกำหนด Strict API) และปฏิเสธ key ส่วนเกินที่ไม่รู้จักด้วย `ValidationError`",
      ),
      mc(
        "d077-q4",
        "LLM ตอบ JSON ใบแจ้งหนี้ที่ผ่าน Strict Schema ครบทุก field แต่ค่า `subtotal = 1000`, `vat_amount = 70`, `total_amount = 1700` เราควรป้องกันปัญหานี้ที่ชั้นใด?",
        [
          ["ปล่อยผ่านไปก่อนเพราะผ่าน Strict JSON Schema แล้วแสดงว่าถูก", "อันตรายมาก — ตัวเลขบัญชีผิดจะสร้างความเสียหายโดยตรงในระบบปลายทาง"],
          ["ใช้ `@model_validator(mode=\"after\")` ใน Pydantic ตรวจความสัมพันธ์ข้ามฟิลด์แล้วโยน `ValidationError` เพื่อส่งเข้า repair loop หรือให้คนตรวจ", "ถูก — ด่านที่ 2 ฝั่งแอปคือที่สำหรับกฎธุรกิจที่ JSON Schema แสดงออกไม่ได้"],
          ["เปลี่ยน `temperature` เป็น `2.0` เพื่อให้โมเดลคิดเลขเก่งขึ้น", "temperature สูงยิ่งทำให้คำตอบสุ่มและมั่วมากขึ้น งาน extraction ควรใช้ temperature ต่ำ (เช่น `0.0`)"],
          ["ตัด `total_amount` ออกจาก schema แล้วให้ลูกค้าคำนวณเอง", "การตรวจ cross-check ยอดที่สกัดได้กับผลรวมจริงคือสัญญาณตรวจจับความผิดพลาดที่ดีที่สุด"],
        ],
        "B",
        "JSON Schema ตรวจได้เฉพาะโครงสร้างและช่วงค่าเดี่ยว ๆ กฎความสัมพันธ์ข้ามฟิลด์ต้องตรวจด้วย `@model_validator` ใน Pydantic แล้วจัดการต่อด้วย retry หรือ human review",
        "เมื่อข้อมูลผ่าน Strict JSON Schema แล้ว แต่ความสัมพันธ์ระหว่างฟิลด์ผิด (เช่น `subtotal + vat != total`) ต้องจัดการอย่างไร?",
        "เขียน `@model_validator(mode='after')` ตรวจกฎธุรกิจข้ามฟิลด์ ให้ fail-fast ด้วย `ValidationError` แล้วค่อยส่งซ่อม (Day 78) หรือส่งคนตรวจ",
      ),
    ],
  },

  takeaways: [
    "ใช้ {{pydantic}} v2 (`ConfigDict(extra=\"forbid\")`, `Literal`, `Field(description=...)`) เป็น Single Source of Truth สร้างทั้ง Strict JSON Schema และตัวตรวจฝั่งแอป",
    "เปิดช่อง `| None` ให้ทุกฟิลด์ที่อาจไม่มีในเอกสารต้นฉบับ เพื่อไม่ให้ Strict Schema บังคับโมเดลให้แต่งข้อมูล ({{hallucination}})",
    "ซ้อนด่านตรวจ 2 ชั้นเสมอ: Constrained Decoding คุม *โครงสร้าง* + `@model_validator` คุม *กฎธุรกิจข้ามฟิลด์*",
    "แยกชั้นพาร์ส (`model_validate_json`) ออกจากชั้นเรียก LLM API เพื่อให้เขียน `pytest` แบบ {{mocking}} รันได้เร็ว ฟรี และทำซ้ำได้ทุกครั้ง",
  ],

  reviewCards: [
    rc(
      "d077-rc-1",
      "ต้องตั้งค่าใดใน Pydantic v2 เพื่อให้ `model_json_schema()` สร้าง `\"additionalProperties\": false` สำหรับ Strict Structured Outputs?",
      "ตั้ง `model_config = ConfigDict(extra=\"forbid\")` ในทั้ง model หลักและ nested sub-models ทุกตัว",
    ),
    rc(
      "d077-rc-2",
      "ทำไมการบังคับทุก field ห้ามเป็น `None` ในงานสกัดเอกสารจึงอันตราย?",
      "เพราะเมื่อเอกสารต้นฉบับไม่มีข้อมูลนั้น โมเดลที่ถูกบังคับด้วย Strict Schema จะแต่งข้อมูล (hallucinate) ขึ้นมาเติมเพื่อให้ผ่านรูปแบบ",
    ),
    rc(
      "d077-rc-3",
      "ข้อจำกัดของ Strict JSON Schema คืออะไร และเราอุดช่องโหว่นั้นอย่างไรใน Python?",
      "Strict JSON Schema ตรวจกฎข้ามฟิลด์ไม่ได้ (เช่น `subtotal + vat == total`) — ต้องซ้อนด่านที่ 2 ด้วย `@model_validator(mode=\"after\")` ใน Pydantic",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Docs — JSON Schema Generation", href: "https://docs.pydantic.dev/latest/concepts/json_schema/" },
    { label: "Pydantic v2 Docs — Field & Model Validators", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
    { label: "OpenAI API Docs — Structured Outputs Guide", href: "https://platform.openai.com/docs/guides/structured-outputs" },
    { label: "Pydantic AI Documentation", href: "https://pydantic.dev/docs/ai" },
  ],

  glossary: ["structured-output", "pydantic", "basemodel", "schema", "validation-error", "literal", "hallucination", "mocking"],
});
