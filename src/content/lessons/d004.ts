import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D004 — Phase 1 / Block B01 (Review Day)
 * Interleaved recall of D1–D3 + Build validated Thai Support Ticket parser.
 */
export const d004: Lesson = defineLesson({
  day: 4,
  titleTh: "ทบทวนรอบแรก: สร้าง Thai Support Ticket Parser ที่ตรวจ schema ครบชุด",
  tagline: "30 นาที · รอบทบทวน D1–D3 · ร้อยต่อ uv, comprehension และ nested Pydantic เป็น batch parser ส่งออก JSONL",
  icon: "git-branch",
  visual: {
    id: "ticket-pipeline",
    title: "ท่อประมวลผล Thai Support Ticket (Raw → Clean → Validated JSONL)",
    caption: "กดดูทีละขั้นว่าทิกเก็ตลูกค้าที่เลอะเทอะถูกแปลงเป็นข้อมูลพร้อมใช้งานอย่างไร",
    alt: "แผนภาพท่อประมวลผลทิกเก็ตภาษาไทยทีละขั้น",
  },
  requiresApiKey: false,
  tools: ["uv", "Pydantic v2", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "กลั่นข้อมูลดิบจากหลายช่องทางให้เป็นมาตรฐานเดียว",
      body: "ทิกเก็ตลูกค้าจาก LINE OA, อีเมล และฟอร์มหน้าเว็บมักมาแบบเลอะเทอะ: ช่องว่างเกิน, แท็กซ้ำพิมพ์เล็ก-ใหญ่ปนกัน, ขาดรหัสลูกค้า หรือโครงสร้างซ้อนผิดรูป",
      lessonNote: "วันนี้เรารวมทักษะ D1–D3 สร้างท่อทำความสะอาดและตรวจ {{schema}} ทีละชุด ก่อนแปลงเป็น {{jsonl}} พร้อมใช้",
    },
    {
      node: 2,
      heading: "ส่งต่อข้อมูลที่ไว้ใจได้ให้โมเดลและ Pipeline ถัดไป",
      body: "ไม่ว่าจะส่งข้อความเข้าตัวจัดหมวดหมู่ ML ใน Phase 2 หรือให้ {{llm}} สรุปและตอบลูกค้าใน Phase 3 โมเดลต้องการข้อมูลที่ผ่าน {{data-contract}} เดียวกันเสมอ",
      lessonNote: "Nested {{basemodel}} (`CustomerInfo` + `SupportTicket`) ทำให้ส่วนปลายทางอ่าน field ได้ตรงชนิดโดยไม่ต้องเช็กซ้ำ",
    },
    {
      node: 3,
      heading: "วัดคุณภาพข้อมูลด้วยเกณฑ์เชิงกำหนด (Deterministic Gate)",
      body: "ก่อนวัดความแม่นยำของ AI ทีมต้องรู้ก่อนว่าข้อมูลที่ไหลเข้ามาผ่านกฎกี่เปอร์เซ็นต์ และติดข้อผิดพลาดอะไรบ้าง",
      lessonNote: "Batch parser ที่แยก `valid` กับ `errors` พร้อมเทสต์ `pytest` คือด่านตรวจคุณภาพข้อมูลอัตโนมัติตัวแรกของคุณ",
    },
    {
      node: 5,
      heading: "เก็บรายงานข้อผิดพลาดไว้สืบต้นเหตุภายหลัง",
      body: "เมื่อฟอร์มหน้าเว็บหรือ webhook ต้นทางเปลี่ยนรูปแบบโดยไม่แจ้ง ระบบที่แยก error report ไว้จะชี้ตำแหน่ง field ที่พังได้ทันที",
      lessonNote: "การบันทึก `loc` และ `msg` จาก {{validation-error}} เป็นจุดเริ่มต้นของ Error Log และ Monitoring ในอนาคต",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิม (Active Recall)** จาก D1–D3 มาประยุกต์ร่วมกัน: `uv` environment, {{comprehension}}/{{type-hint}}, และ Nested {{pydantic}} + {{field-validator}}",
    "**ออกแบบและสร้าง** Batch Parser สำหรับทิกเก็ตภาษาไทยที่ตรวจสอบข้อมูลซ้อนหลายชั้น ทำความสะอาดแท็ก และไม่พังทั้งชุดเมื่อเจอข้อมูลเสียบางรายการ",
    "**แยกและส่งออก** รายการที่ผ่านการตรวจเป็นรูปแบบ {{jsonl}} ด้วย {{serialization|model_dump_json()}} พร้อมสร้างรายงานข้อผิดพลาดที่ระบุตำแหน่ง field ชัดเจน",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D1 (`uv` + `BaseModel` พื้นฐาน), D2 (collections, comprehensions, type hints) และ D3 (nested models, validators, serialization)",
    "มี `uv`, `pydantic`, `pytest` และ `ruff` ติดตั้งในโปรเจกต์แล้ว",
    "ไม่ต้องใช้ API key — รันบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งานทบทวน Day 4 ด้วย {{uv}} หรือใช้โปรเจกต์เดิมจาก Block B01 ก็ได้ เช็กให้แน่ใจว่า `pydantic`, `pytest` และ `ruff` พร้อมใช้งาน",
    commands: `# สร้างโปรเจกต์สำหรับรอบทบทวน Day 4
uv init ai-day4-review && cd ai-day4-review
uv add pydantic
uv add --dev pytest ruff

# ตรวจสอบสภาพแวดล้อม
uv run python -c "import pydantic; print('Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์โปรเจกต์ที่มี `pyproject.toml` และ `uv.lock`"],
      ["deps", "ติดตั้ง `pydantic` และ dev tools (`pytest`, `ruff`) ผ่าน `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน Pydantic v2 ด้วย `uv run python` สำเร็จ"],
    ],
    note: "รอบทบทวน Day 4 ออกแบบตามจังหวะ 30 นาที: ทำควิซทบทวนก่อน 10 นาที แล้วลงมือสร้างและดีบัก Thai Support Ticket Parser 15 นาที จากนั้นจดจุดที่พลาดเข้า Error Log",
  },

  concepts: [
    {
      id: "review-b01-integration",
      title: "1 · ร้อยต่อจิ๊กซอว์ D1–D3 ให้เป็นท่อประมวลผลเดียว",
      paragraphs: [
        "สามวันที่ผ่านมาเราฝึกเครื่องมือแยกชิ้นกัน: วันแรกตั้งสภาพแวดล้อมที่ทำซ้ำได้ด้วย {{uv}} และวางด่าน {{pydantic}}, วันที่สองใช้ {{comprehension}} และ {{type-hint}} จัดการคอลเลกชันให้กระชับและอ่านง่าย, วันที่สามขยับสู่ nested models, {{field-validator}} และการส่งออก JSON",
        "ในงานจริง เครื่องมือทั้งสามไม่ได้แยกกันอยู่ แต่ทำงานต่อกันเป็น **ท่อประมวลผล (pipeline)**: รับข้อมูลดิบเป็น `list[dict]` → ทำความสะอาดและตรวจ {{schema}} → แยกของดีไป {{serialization|serialize}} เป็น {{jsonl}} และเก็บของเสียไว้ตรวจสอบ",
      ],
      analogy:
        "เหมือนสายพานคัดเกรดผลไม้ในโรงคัดบรรจุ — ชั่งล้างและคัดเศษ (comprehension) → ตรวจมาตรฐานทีละลูกพร้อมป้ายรับรอง (nested Pydantic) → แยกลงกล่องส่งออก (JSONL) กับตะกร้าคัดทิ้งที่มีใบแจ้งเหตุผล (error report)",
      bullets: [
        "**D1 (`uv` + `BaseModel`)** — รับประกัน {{reproducibility}} ด้วย {{lockfile|uv.lock}} และตรวจ {{payload}} ตั้งแต่ขอบระบบ",
        "**D2 (Collections + Comprehensions + Type Hints)** — แปลง/กรองลิสต์แท็กและข้อความสั้น กระชับ และสื่อความหมายชนิดข้อมูลชัดเจน",
        "**D3 (Nested Models + Validators + Serialization)** — แยกโครงสร้างซ้อนเป็น model ย่อย ทำความสะอาดด้วย `@field_validator` และส่งออก JSON มาตรฐาน",
      ],
      whyTitle: "Why this matters — ทำไมวันทบทวนต้องลงมือร้อยต่อโค้ด",
      whyParagraphs: [
        "งานวิจัยด้านการเรียนรู้ชี้ว่าการฝึกแบบ **Interleaving** (หยิบหลายทักษะมาใช้ปนกันในโจทย์เดียว) ช่วยให้สมองแยกแยะได้ว่าเมื่อไหร่ควรใช้ comprehension เมื่อไหร่ควรเขียน validator และเมื่อไหร่ควรแยก nested model",
        "ทิกเก็ตพาร์เซอร์ที่คุณสร้างวันนี้จะถูกนำกลับมาต่อยอดจริงใน Day 5 (อ่านเขียนไฟล์ JSONL ด้วย `pathlib`) และ Day 12 (เขียนชุดเทสต์ `pytest` ให้ครบ 90% coverage)",
      ],
    },
    {
      id: "nested-models-and-validators",
      title: "2 · Nested BaseModel และการทำความสะอาดข้อมูลแบบคงลำดับ",
      paragraphs: [
        "ทิกเก็ตลูกค้าจริงไม่ได้มีแค่ฟิลด์แบน ๆ ชั้นเดียว แต่มักมีออบเจกต์ลูกค้า (`customer`) ซ้อนอยู่ข้างใน การแยก `CustomerInfo` ออกเป็น {{basemodel}} ย่อยช่วยให้เรานำกลับมาใช้ซ้ำในระบบอื่นได้ และทำให้ข้อความ error บอกตำแหน่งชัดถึงชั้นใน เช่น `('customer', 'customer_id')`",
        "สำหรับฟิลด์ประเภทลิสต์อย่าง `tags` ที่ผู้ใช้หรือแอดมินมักกรอกซ้ำ เช่น `[\" Billing \", \"billing\", \"\", \"URGENT\"]` เรามักใช้ {{field-validator}} ร่วมกับ {{comprehension}} และ `dict.fromkeys(...)` เพื่อตัดช่องว่าง แปลงเป็นตัวพิมพ์เล็ก กรองค่าว่าง และตัดตัวซ้ำ **โดยรักษาลำดับเดิม**",
      ],
      analogy:
        "เหมือนแฟ้มเอกสารที่มีซองย่อยข้างใน — ซองลูกค้ามีกฎตรวจของตัวเอง ส่วนซองทิกเก็ตตรวจรายละเอียดปัญหา และมีคนจัดเรียงป้ายกำกับไม่ให้แปะซ้ำ",
      code: {
        language: "python",
        filename: "nested_ticket.py",
        code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CustomerInfo(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    customer_id: str = Field(min_length=7)
    tier: Literal["standard", "vip"] = "standard"

    @field_validator("customer_id")
    @classmethod
    def must_have_prefix(cls, value: str) -> str:
        if not value.startswith("CUS-"):
            raise ValueError("customer_id ต้องขึ้นต้นด้วย 'CUS-'")
        return value


class SupportTicket(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    channel: Literal["line", "email", "web"]
    message_th: str = Field(min_length=5, max_length=500)
    tags: list[str] = Field(default_factory=list)
    customer: CustomerInfo

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values: list[str]) -> list[str]:
        cleaned = [t.strip().lower() for t in values if t.strip()]
        return list(dict.fromkeys(cleaned))`,
        caption: "ใช้ `ConfigDict(str_strip_whitespace=True)` ตัดช่องว่างให้ทุก `str` ก่อนตรวจ `min_length` และใช้ `dict.fromkeys()` ตัดแท็กซ้ำแบบคงลำดับ",
      },
      whyTitle: "Why this matters — ทำไมไม่ใช้ `list(set(cleaned))` ตัดแท็กซ้ำ",
      whyParagraphs: [
        "`set` ใน Python ไม่รับประกันลำดับคงที่ข้ามรอบการรัน (hash randomization) ทำให้ผลลัพธ์ JSON หรือ unit test ใน CI แกว่งไปมาแบบสุ่ม",
        "ในทางกลับกัน `list(dict.fromkeys(cleaned))` ทำงานในเวลา $O(n)$ และรักษาลำดับที่ข้อมูลเข้ามาทุกครั้ง ซึ่งเป็นหัวใจของโค้ดที่ทดสอบซ้ำได้ (deterministic)",
      ],
    },
    {
      id: "batch-parsing-dead-letter",
      title: "3 · Batch Parsing แบบแยกของดี–ของเสีย แล้วส่งออก JSONL",
      paragraphs: [
        "เมื่อประมวลผลทิกเก็ตทีละ 500 รายการ กฎเหล็กของ data pipeline คือ **ห้ามให้ทิกเก็ตพัง 1 ใบทำลายงานอีก 499 ใบที่เหลือ** และในขณะเดียวกันก็ห้ามเงียบปล่อยข้อมูลเสียหลุดเข้าไป",
        "แนวทางมาตรฐานคือวนตรวจทีละรายการด้วย `try / except ValidationError` เก็บรายการที่ผ่านไว้ใน `valid: list[SupportTicket]` และเก็บรายการที่พังพร้อมดัชนีและข้อความ error ไว้ใน `errors: list[TicketError]` จากนั้นแปลงเฉพาะรายการที่ผ่านเป็น {{jsonl}} (JSON 1 ก้อนต่อ 1 บรรทัด) ด้วย `model_dump_json()`",
      ],
      analogy:
        "เหมือนจุดตรวจสัมภาระสนามบิน — ถ้ากระเป๋าใบที่ 12 มีของต้องห้าม เจ้าหน้าที่จะดึงใบนั้นไปโต๊ะตรวจสอบแยก ไม่ใช่สั่งยกเลิกเที่ยวบินของกระเป๋าอีก 200 ใบ",
      code: {
        language: "python",
        filename: "batch_export.py",
        code: `from pydantic import ValidationError


def format_errors(err: ValidationError) -> list[str]:
    return [
        f"{'.'.join(str(part) for part in item['loc'])}: {item['msg']}"
        for item in err.errors()
    ]


# แปลงรายการที่ผ่านการตรวจเป็นข้อความ JSONL (1 บรรทัด = 1 JSON)
# jsonl_text = "\\n".join(ticket.model_dump_json() for ticket in valid_tickets)`,
        caption: "ใน Pydantic v2 `model_dump_json()` เข้ารหัสภาษาไทยเป็น UTF-8 ตรง ๆ อ่านง่ายและขนาดเล็กกว่า JSON ที่ escape เป็น `\\u0e...`",
      },
      whyTitle: "Why this matters — ทำไมข้อมูล AI นิยมเก็บเป็น JSONL",
      whyParagraphs: [
        "ไฟล์ JSON ปกติที่เป็น array ใหญ่ `[ {...}, {...} ]` ต้องโหลดทั้งไฟล์เข้า RAM ก่อน parse หากมี 100,000 ทิกเก็ตหน่วยความจำอาจเต็มได้ง่าย",
        "{{jsonl}} แยก 1 record ต่อ 1 บรรทัด ทำให้ทั้ง pipeline ingestion (Day 5), Batch API ของผู้ให้บริการ LLM (Day 82) และ Golden Eval Dataset (Day 125) อ่าน-เขียนแบบ streaming ทีละบรรทัดได้อย่างปลอดภัย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Batch Parser กับฝั่ง JS/TS + Zod",
      body: [
        "โครงสร้างทั้งหมดนี้คือรูปแบบเดียวกับ `safeParse` ของ Zod ที่นำมาวนตรวจ array แล้วแยกผลลัพธ์ดีกับ error ออกเป็นสองฝั่ง:",
      ],
      table: [
        ["Nested `BaseModel` (`customer: CustomerInfo`)", "`z.object({ customer: CustomerSchema })`"],
        ["`try / except ValidationError` ต่อรายการ", "`schema.safeParse(item)` เช็ก `result.success`"],
        ["`list(dict.fromkeys(cleaned))`", "`[...new Set(cleaned)]` (JS Set คงลำดับเหมือน dict Python)"],
        ["`ticket.model_dump_json()` + `'\\n'.join(...)`", "`items.map(x => JSON.stringify(x)).join('\\n')` (NDJSON)"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมต้องแปลง `part` ใน `loc` เป็น `str(part)`",
      body: [
        "เวลา Pydantic รายงานตำแหน่ง error ใน `item['loc']` ค่าที่ได้เป็น tuple ของเส้นทาง เช่น `('customer', 'customer_id')` หรือถ้าผิดในสมาชิกตัวที่ 2 ของลิสต์จะเป็น `('tags', 1)` ซึ่งมี `int` ปนอยู่",
        "หากเรียก `'.'.join(item['loc'])` ตรง ๆ Python จะโยน `TypeError` เพราะ `join` รับเฉพาะ `str` การเขียน `'.'.join(str(part) for part in item['loc'])` จึงปลอดภัยกับทั้ง nested object และ list เสมอ",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองไล่ดูการทำงานจริงของท่อ Thai Support Ticket Parser กับชุดข้อมูลจำลองที่มีทั้งทิกเก็ตปกติ ทิกเก็ตที่ต้องทำความสะอาด และทิกเก็ตที่พังในระดับ nested field",
    steps: [
      {
        title: "1 · นิยาม Nested Schema และโมเดลรายงานผล",
        explain:
          "แยก `CustomerInfo` ออกจาก `SupportTicket` แล้วสร้าง `TicketError` กับ `BatchParseReport` เพื่อให้ฟังก์ชันคืนข้อมูลที่มี {{type-hint}} ครบทุกชั้น แทนการคืน `tuple` หรือ `dict` เปล่า",
        code: {
          language: "python",
          filename: "worked_d004.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class CustomerInfo(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    customer_id: str = Field(min_length=7)
    tier: Literal["standard", "vip"] = "standard"

    @field_validator("customer_id")
    @classmethod
    def check_customer_prefix(cls, v: str) -> str:
        if not v.startswith("CUS-"):
            raise ValueError("must start with 'CUS-'")
        return v


class SupportTicket(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    channel: Literal["line", "email", "web"]
    message_th: str = Field(min_length=5, max_length=500)
    tags: list[str] = Field(default_factory=list)
    customer: CustomerInfo

    @field_validator("ticket_id")
    @classmethod
    def check_ticket_prefix(cls, v: str) -> str:
        if not v.startswith("TKT-"):
            raise ValueError("must start with 'TKT-'")
        return v

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, v: list[str]) -> list[str]:
        cleaned = [tag.strip().lower() for tag in v if tag.strip()]
        return list(dict.fromkeys(cleaned))


class TicketError(BaseModel):
    index: int
    ticket_id: str | None = None
    messages: list[str]


class BatchParseReport(BaseModel):
    valid: list[SupportTicket]
    errors: list[TicketError]

    def to_jsonl(self) -> str:
        return "\\n".join(ticket.model_dump_json() for ticket in self.valid)`,
        },
        output: `# ประกาศโมเดลสำเร็จ — ยังไม่มี output จนกว่าจะเรียก parse`,
      },
      {
        title: "2 · เขียนฟังก์ชัน Batch Parser ที่แยกของดี–ของเสีย",
        explain:
          "ใช้ `enumerate(raw_items)` เพื่อรู้ลำดับแถวที่พัง ดัก {{validation-error}} ทีละใบ และบันทึก `ticket_id` ดิบ (ถ้ามี) ไว้ช่วยไล่หาต้นตอได้เร็วขึ้น",
        code: {
          language: "python",
          filename: "worked_d004.py",
          code: `def parse_ticket_batch(raw_items: list[dict]) -> BatchParseReport:
    valid: list[SupportTicket] = []
    errors: list[TicketError] = []

    for idx, raw in enumerate(raw_items):
        try:
            valid.append(SupportTicket.model_validate(raw))
        except ValidationError as err:
            msgs = [
                f"{'.'.join(str(p) for p in e['loc'])}: {e['msg']}"
                for e in err.errors()
            ]
            raw_tid = raw.get("ticket_id") if isinstance(raw, dict) else None
            errors.append(
                TicketError(
                    index=idx,
                    ticket_id=str(raw_tid) if raw_tid is not None else None,
                    messages=msgs,
                )
            )
    return BatchParseReport(valid=valid, errors=errors)`,
        },
        output: `# พร้อมประมวลผล raw_items โดยไม่พังทั้งชุดเมื่อเจอข้อมูลเสีย`,
      },
      {
        title: "3 · ทดสอบกับข้อมูลจริงที่มีทั้งของดีและของเสียแล้วส่งออก JSONL",
        explain:
          "แถวแรกมีช่องว่างและแท็กซ้ำแต่ผ่านการทำความสะอาด แถวสองมี `customer_id` ผิดและข้อความว่างล้วน จึงถูกจับแยกไปอยู่ใน `errors`",
        code: {
          language: "python",
          filename: "worked_d004.py",
          code: `sample_batch = [
    {
        "ticket_id": "  TKT-101  ",
        "channel": "line",
        "message_th": "  โอนเงินแล้วแต่สถานะยังไม่ปรับครับ  ",
        "tags": [" Billing ", "billing", "", "URGENT"],
        "customer": {"customer_id": "CUS-501", "tier": "vip"},
    },
    {
        "ticket_id": "TKT-102",
        "channel": "email",
        "message_th": "     ",
        "tags": ["general"],
        "customer": {"customer_id": "BAD-99"},
    },
]

report = parse_ticket_batch(sample_batch)
print(f"Valid: {len(report.valid)}, Errors: {len(report.errors)}")
print("JSONL:", report.to_jsonl())
for err in report.errors:
    print("ERR:", err.model_dump())`,
        },
        output: `Valid: 1, Errors: 1
JSONL: {"ticket_id":"TKT-101","channel":"line","message_th":"โอนเงินแล้วแต่สถานะยังไม่ปรับครับ","tags":["billing","urgent"],"customer":{"customer_id":"CUS-501","tier":"vip"}}
ERR: {'index': 1, 'ticket_id': 'TKT-102', 'messages': ['message_th: String should have at least 5 characters', "customer.customer_id: String should have at least 7 characters"]}`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมากในงาน batch: วาง `try/except ValidationError` ไว้ **นอก** `for` loop แทนที่จะวางข้างใน — ผลคือพอทิกเก็ตใบที่ 2 พัง ลูปจะหลุดออกทันทีและทิกเก็ตใบที่ 3 ถึง 1,000 ไม่ถูกประมวลผลเลย!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + Mini-Integration (15 นาที): สร้างโมดูล `thai_ticket_parser.py` ที่รับชุดทิกเก็ตภาษาไทยดิบ คัดกรองด้วย Nested Pydantic Schema ทำความสะอาดแท็ก แยกรายงานข้อผิดพลาด และส่งออกรายการที่ผ่านเป็น JSONL พร้อมคำนวณสรุปจำนวนทิกเก็ตตามช่องทาง (`channel_counts`)",
    requirements: [
      "สร้าง `CustomerInfo(BaseModel)` ที่มี `customer_id: str` (ตัดช่องว่างหัวท้าย, ยาว ≥ 7, ขึ้นต้นด้วย `\"CUS-\"`) และ `tier: Literal[\"standard\", \"vip\"] = \"standard\"`",
      "สร้าง `SupportTicket(BaseModel)` ที่มี `ticket_id: str` (ตัดช่องว่าง, ยาว ≥ 7, ขึ้นต้นด้วย `\"TKT-\"`), `channel: Literal[\"line\", \"email\", \"web\"]`, `message_th: str` (ตัดช่องว่างแล้วต้องยาว 5–500 ตัวอักษร), `tags: list[str]` (ค่าเริ่มต้นลิสต์ว่าง, strip + lowercase + กรองค่าว่าง + ตัดซ้ำแบบคงลำดับ), และ `customer: CustomerInfo`",
      "สร้าง `TicketError(BaseModel)` (`index: int`, `ticket_id: str | None = None`, `messages: list[str]`) และ `BatchParseReport(BaseModel)` (`valid: list[SupportTicket]`, `errors: list[TicketError]`)",
      "เพิ่มเมธอด `to_jsonl(self) -> str` (คืน JSONL 1 บรรทัดต่อ 1 ทิกเก็ตที่ผ่าน; ถ้าไม่มีรายการที่ผ่านคืน `\"\"`) และเมธอด `channel_counts(self) -> dict[str, int]` บน `BatchParseReport` (นับจำนวนทิกเก็ตที่ผ่านแยกตาม `channel`)",
      "สร้าง `parse_ticket_batch(raw_items: list[dict]) -> BatchParseReport` ที่ validate ทีละรายการอย่างอิสระ และจัดรูปแบบข้อความ error แต่ละข้อเป็น `\"<loc joined by '.'>: <msg>\"`",
    ],
    starter: {
      language: "python",
      filename: "thai_ticket_parser.py",
      code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class CustomerInfo(BaseModel):
    # TODO: กำหนด model_config, customer_id, tier และ validator ตรวจ prefix 'CUS-'
    pass


class SupportTicket(BaseModel):
    # TODO: กำหนด fields, validator ตรวจ prefix 'TKT-' และ normalize tags แบบคงลำดับ
    pass


class TicketError(BaseModel):
    index: int
    ticket_id: str | None = None
    messages: list[str]


class BatchParseReport(BaseModel):
    valid: list[SupportTicket]
    errors: list[TicketError]

    def to_jsonl(self) -> str:
        # TODO: แปลง self.valid เป็น JSONL string (1 บรรทัดต่อ 1 ticket)
        raise NotImplementedError

    def channel_counts(self) -> dict[str, int]:
        # TODO: นับจำนวนทิกเก็ตที่ผ่านแยกตาม channel เช่น {"line": 2, "web": 1}
        raise NotImplementedError


def parse_ticket_batch(raw_items: list[dict]) -> BatchParseReport:
    # TODO: วนตรวจทีละรายการ แยก valid กับ errors โดยไม่ให้ 1 ใบพังทำลายทั้งชุด
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_thai_ticket_parser.py",
      code: `import json
from thai_ticket_parser import BatchParseReport, parse_ticket_batch


def test_parse_valid_and_normalize_tags():
    raw = [
        {
            "ticket_id": "  TKT-001  ",
            "channel": "line",
            "message_th": "  ขอใบกำกับภาษีอิเล็กทรอนิกส์ครับ  ",
            "tags": [" Billing ", "billing", "  ", "VIP", "billing"],
            "customer": {"customer_id": " CUS-1001 ", "tier": "vip"},
        }
    ]
    report = parse_ticket_batch(raw)
    assert isinstance(report, BatchParseReport)
    assert len(report.valid) == 1
    assert len(report.errors) == 0

    ticket = report.valid[0]
    assert ticket.ticket_id == "TKT-001"
    assert ticket.message_th == "ขอใบกำกับภาษีอิเล็กทรอนิกส์ครับ"
    assert ticket.tags == ["billing", "vip"]
    assert ticket.customer.customer_id == "CUS-1001"


def test_batch_isolation_and_nested_error_location():
    raw = [
        {
            "ticket_id": "TKT-010",
            "channel": "web",
            "message_th": "ลืมรหัสผ่านเข้าใช้งานไม่ได้",
            "customer": {"customer_id": "CUS-2001"},
        },
        {
            "ticket_id": "TKT-011",
            "channel": "email",
            "message_th": "     ",
            "customer": {"customer_id": "INVALID-1"},
        },
        {
            "ticket_id": "TKT-012",
            "channel": "line",
            "message_th": "แอปเด้งออกตอนอัปโหลดสลิป",
            "tags": ["Bug", "mobile"],
            "customer": {"customer_id": "CUS-2002", "tier": "standard"},
        },
    ]
    report = parse_ticket_batch(raw)
    assert len(report.valid) == 2
    assert len(report.errors) == 1
    assert report.errors[0].index == 1
    assert report.errors[0].ticket_id == "TKT-011"
    joined = " | ".join(report.errors[0].messages)
    assert "message_th:" in joined
    assert "customer.customer_id:" in joined


def test_jsonl_export_and_channel_counts():
    raw = [
        {
            "ticket_id": "TKT-101",
            "channel": "line",
            "message_th": "สอบถามโปรโมชันรายปี",
            "customer": {"customer_id": "CUS-3001"},
        },
        {
            "ticket_id": "TKT-102",
            "channel": "line",
            "message_th": "ขอเปลี่ยนอีเมลรับใบเสร็จ",
            "customer": {"customer_id": "CUS-3002"},
        },
        {
            "ticket_id": "TKT-103",
            "channel": "web",
            "message_th": "หน้าชำระเงินโหลดช้ามาก",
            "customer": {"customer_id": "CUS-3003"},
        },
    ]
    report = parse_ticket_batch(raw)
    assert report.channel_counts() == {"line": 2, "web": 1}

    lines = report.to_jsonl().splitlines()
    assert len(lines) == 3
    parsed_first = json.loads(lines[0])
    assert parsed_first["ticket_id"] == "TKT-101"
    assert parsed_first["customer"]["tier"] == "standard"


def test_empty_batch():
    report = parse_ticket_batch([])
    assert report.valid == []
    assert report.errors == []
    assert report.to_jsonl() == ""
    assert report.channel_counts() == {}
`,
    },
    selfCheck: [
      "ทิกเก็ตที่มีช่องว่างล้วน (`\"     \"`) ใน `message_th` ถูกจับเป็น error ไม่หลุดเข้า `valid`",
      "แท็กซ้ำที่ต่างตัวพิมพ์ใหญ่-เล็ก เช่น `[\" Billing \", \"billing\", \"VIP\"]` กลายเป็น `[\"billing\", \"vip\"]` โดยคงลำดับเดิม",
      "เมื่อทิกเก็ตใบที่ 2 พัง ใบที่ 1 และใบที่ 3 ยังผ่านและถูกส่งออกตามปกติ พร้อมรายงานตำแหน่ง `customer.customer_id` ชัดเจน",
      "`report.to_jsonl()` คืนข้อความที่แยกทีละบรรทัดแล้วส่งเข้า `json.loads(...)` ได้ทุกบรรทัด และคืน `\"\"` เมื่อชุดข้อมูลว่าง",
      "รัน `uv run pytest -q` ผ่านครบ 4 ข้อ และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 กรณีด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "วาง `model_config = ConfigDict(str_strip_whitespace=True)` ในทั้ง `CustomerInfo` และ `SupportTicket` เพื่อให้ Pydantic ตัดช่องว่างก่อนตรวจ `min_length` และแยก `try/except ValidationError` ไว้ข้างในลูปของ `parse_ticket_batch`",
      },
      {
        body: "สำหรับ `normalize_tags` ให้ใช้ list comprehension `[t.strip().lower() for t in v if t.strip()]` แล้วครอบด้วย `list(dict.fromkeys(...))` ส่วน `channel_counts()` ใช้ `collections.Counter` หรือวนนับใน `dict[str, int]` ได้ตรง ๆ",
      },
      {
        body: "โครงหลักของโมเดลและเมธอดเกือบครบแล้ว — เติมลูปใน `parse_ticket_batch` ให้จับ `ValidationError` ทีละใบแล้วรัน `uv run pytest -q`",
        code: {
          language: "python",
          filename: "hint-d004-l3.py",
          code: `from collections import Counter
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class CustomerInfo(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    customer_id: str = Field(min_length=7)
    tier: Literal["standard", "vip"] = "standard"

    @field_validator("customer_id")
    @classmethod
    def check_customer_id(cls, v: str) -> str:
        if not v.startswith("CUS-"):
            raise ValueError("customer_id must start with 'CUS-'")
        return v


class SupportTicket(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    channel: Literal["line", "email", "web"]
    message_th: str = Field(min_length=5, max_length=500)
    tags: list[str] = Field(default_factory=list)
    customer: CustomerInfo

    @field_validator("ticket_id")
    @classmethod
    def check_ticket_id(cls, v: str) -> str:
        if not v.startswith("TKT-"):
            raise ValueError("ticket_id must start with 'TKT-'")
        return v

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, v: list[str]) -> list[str]:
        cleaned = [t.strip().lower() for t in v if t.strip()]
        return list(dict.fromkeys(cleaned))


class TicketError(BaseModel):
    index: int
    ticket_id: str | None = None
    messages: list[str]


class BatchParseReport(BaseModel):
    valid: list[SupportTicket]
    errors: list[TicketError]

    def to_jsonl(self) -> str:
        return "\\n".join(t.model_dump_json() for t in self.valid)

    def channel_counts(self) -> dict[str, int]:
        return dict(Counter(t.channel for t in self.valid))


def parse_ticket_batch(raw_items: list[dict]) -> BatchParseReport:
    # TODO: วน enumerate(raw_items), validate ทีละใบด้วย try/except ValidationError
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# วาง thai_ticket_parser.py และ test_thai_ticket_parser.py ในโฟลเดอร์โปรเจกต์
uv run pytest -q
uv run ruff check .`,
      caption: "ถ้าใช้ `uv run pytest -v` จะเห็นชื่อเทสต์ที่ผ่านทีละข้อชัดเจนขึ้น",
    },
  },

  mistakes: [
    {
      title: "วาง `try/except ValidationError` ไว้นอก `for` loop",
      symptom: "พอเจอทิกเก็ตใบที่พัง 1 ใบ โปรแกรมหยุดทันทีและไม่ประมวลผลใบที่เหลือทั้งหมด",
      fix: "วาง `try/except ValidationError` ไว้ **ข้างใน** ลูปต่อ 1 รายการ เพื่อแยกของเสียออกและประมวลผลของดีต่อไปจนจบชุด",
    },
    {
      title: "ใช้ `list(set(tags))` เพื่อตัดแท็กซ้ำ",
      symptom: "ลำดับแท็กเปลี่ยนไปมาในแต่ละรอบการรัน ทำให้ `assert ticket.tags == ['billing', 'vip']` เดี๋ยวผ่านเดี๋ยวพัง",
      fix: "ใช้ `list(dict.fromkeys(cleaned))` ซึ่งตัดซ้ำได้เร็วเท่ากันแต่รักษาลำดับเดิม 100%",
    },
    {
      title: "เรียก `'.'.join(e['loc'])` โดยไม่แปลงสมาชิกเป็น `str`",
      symptom: "เกิด `TypeError: sequence item 1: expected str instance, int found` เมื่อ error เกิดในสมาชิกของ `list` เช่น `('tags', 0)`",
      fix: "แปลงทุกชิ้นด้วย `'.'.join(str(part) for part in e['loc'])` เสมอ",
    },
    {
      title: "ส่งออก JSON ด้วย `str(ticket.model_dump())` แทน `model_dump_json()`",
      symptom: "ได้ single quote `'...'` แบบ Python dict ซึ่งไม่ใช่ JSON ที่ถูกต้อง — `json.loads()` จะพังทันที",
      fix: "ใช้ `ticket.model_dump_json()` เสมอเมื่อต้องการข้อความ JSON หรือ JSONL มาตรฐาน",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ จาก D1–D4) — ลองตอบจากความจำก่อนเช็กเฉลย ข้อที่พลาดจะถูกเก็บเข้าคิวทบทวนอัตโนมัติ",
    questions: [
      mc(
        "d004-q1",
        "[ทบทวน D1] ทีม AI กำลังตั้ง repo ใหม่ด้วย `uv` ข้อใดคือชุดไฟล์ที่ **ควร** commit เข้า Git เพื่อให้เพื่อนร่วมทีมและ CI ได้ environment ตรงกัน?",
        [
          ["`.venv/` และ `pyproject.toml`", "ไม่ควร commit `.venv/` เพราะไฟล์ใหญ่และผูกกับ OS ของเครื่องผู้สร้าง"],
          ["`pyproject.toml` และ `uv.lock`", "ถูก — `pyproject.toml` บอก dependency หลัก และ `uv.lock` ล็อกเวอร์ชันเป๊ะทุกตัวรวม transitive"],
          ["เฉพาะ `requirements.txt` ที่เขียนมือ", "เขียนมือเองอาจลืม transitive dependency และไม่เชื่อมกับ workflow ของ `uv`"],
          ["เฉพาะไฟล์ `.py` ไม่ต้อง commit ไฟล์ config", "ไม่มีไฟล์ระบุ dependency เพื่อนร่วมทีมจะไม่รู้ว่าต้องติดตั้งแพ็กเกจเวอร์ชันไหน"],
        ],
        "B",
        "การ commit `pyproject.toml` คู่กับ `uv.lock` (และใส่ `.venv/` ใน `.gitignore`) คือมาตรฐานที่รับประกัน reproducibility ในทุกเครื่องและ Docker build",
        "ไฟล์ใดของโปรเจกต์ `uv` ที่ต้อง commit เข้า Git และโฟลเดอร์ใดห้าม commit?",
        "Commit `pyproject.toml` + `uv.lock`; ห้าม commit `.venv/` (ใส่ไว้ใน `.gitignore`)",
      ),
      mc(
        "d004-q2",
        "[ทบทวน D2] ต้องการตัดช่องว่าง แปลงเป็นตัวพิมพ์เล็ก กรองค่าว่าง และตัดตัวซ้ำจาก `tags = [' Billing ', 'billing', '', 'VIP']` โดย **รักษาลำดับเดิม** ข้อใดถูกต้องที่สุด?",
        [
          ["`list(set(t.strip().lower() for t in tags))`", "ผิดสองจุด: ไม่ได้กรองค่าว่าง `''` และ `set` ไม่รักษาลำดับเดิม"],
          ["`[t.lower() for t in tags if t]`", "`'   '` ไม่เป็น falsy จึงไม่ถูกกรอง และไม่ได้ strip หรือตัดซ้ำ"],
          ["`list(dict.fromkeys(t.strip().lower() for t in tags if t.strip()))`", "ถูก — กรองสตริงว่างหลัง strip, normalize เป็นพิมพ์เล็ก และตัดซ้ำแบบคงลำดับด้วย `dict.fromkeys`"],
          ["`sorted(set(tags))`", "เรียงตามตัวอักษรใหม่แทนการคงลำดับเดิม และไม่ได้ strip/lowercase"],
        ],
        "C",
        "ตั้งแต่ Python 3.7 เป็นต้นมา `dict` รักษาลำดับการแทรกเสมอ ทำให้ `list(dict.fromkeys(...))` เป็นสำนวนมาตรฐานสำหรับการตัดซ้ำแบบ deterministic",
        "จะตัดสมาชิกซ้ำใน list โดยรักษาลำดับเดิมใน Python อย่างไร?",
        "ใช้ `list(dict.fromkeys(items))` แทน `list(set(items))` เพราะ dict คงลำดับการแทรก",
      ),
      mc(
        "d004-q3",
        "[ทบทวน D3] เมื่อ `SupportTicket` มีฟิลด์ `customer: CustomerInfo` และข้อมูลส่ง `customer.customer_id` ผิดกฎ ค่า `e['loc']` ใน `ValidationError.errors()` จะมีหน้าตาอย่างไร?",
        [
          ["`('customer_id',)`", "ไม่ใช่ — Pydantic จะใส่ชื่อฟิลด์แม่นำหน้าเสมอเมื่อเป็น nested model"],
          ["`('customer', 'customer_id')`", "ถูก — `loc` เป็น tuple ที่ไล่เส้นทางจากชั้นนอกเข้าสู่ชั้นใน ทำให้รู้ตำแหน่ง error แม่นยำ"],
          ["`'customer.customer_id'` (เป็น string อยู่แล้ว)", "`loc` เป็น `tuple` ของ `str | int` ไม่ใช่ string ต้อง join เองหากอยากพิมพ์เป็นจุด"],
          ["`None` เพราะ nested model ไม่รายงานตำแหน่ง", "Pydantic v2 รายงานเส้นทางครบทุกชั้นรวมถึงดัชนีใน list"],
        ],
        "B",
        "Pydantic เก็บเส้นทางข้อผิดพลาดเป็น tuple เช่น `('customer', 'customer_id')` หรือ `('items', 2, 'price')` จึงควรแปลงแต่ละชิ้นด้วย `str(p)` ก่อน join",
        "`e['loc']` ใน `ValidationError` ของ nested model มีโครงสร้างเป็นอะไร?",
        "เป็น `tuple` ของเส้นทางจากนอกเข้าใน เช่น `('customer', 'customer_id')` (อาจมี `int` ถ้าอยู่ใน list)",
      ),
      mc(
        "d004-q4",
        "[ทบทวน D4] ใน Batch Parser ที่อ่านทิกเก็ต 1,000 ใบแล้วส่งออกเป็น JSONL เหตุใดจึงควรเก็บรายการที่ validate ไม่ผ่านไว้ใน `errors` แทนที่จะปล่อยให้ `ValidationError` หลุดออกจากฟังก์ชัน?",
        [
          ["เพราะ Pydantic ไม่รองรับการโยน `ValidationError` ใน `for` loop", "Pydantic โยนได้ตามปกติ แต่การปล่อยหลุดจะหยุดลูปทันที"],
          ["เพื่อให้รายการที่ดีอีก 999 ใบยังถูกประมวลผลและส่งออกได้ พร้อมมีรายงาน error ชี้ตำแหน่งใบที่พัง", "ถูก — นี่คือรูปแบบ partial-failure / dead-letter ที่ใช้จริงใน data ingestion pipeline"],
          ["เพื่อให้รายการที่พังถูกเติมค่ามั่ว ๆ เข้าไปใน JSONL ด้วย", "ไม่ควรเดาหรือยัดของเสียลง JSONL — ของเสียต้องถูกแยกออกชัดเจน"],
          ["เพราะไฟล์ JSONL ห้ามมีเกิน 10 บรรทัด", "JSONL รองรับได้หลายล้านบรรทัดโดยอ่านทีละบรรทัด"],
        ],
        "B",
        "Batch pipeline ใน production ต้องทนต่อข้อมูลเสียบางแถว (fault isolation) โดยส่งออกเฉพาะข้อมูลที่ผ่านสัญญาและบันทึกแถวที่พังพร้อมเหตุผลไว้แก้ไข",
        "ใน Batch Ingestion ควรจัดการข้อมูลที่ validate ไม่ผ่านอย่างไร?",
        "ดัก `ValidationError` ต่อ 1 รายการ แยกเก็บใน error report/dead-letter เพื่อให้รายการที่ผ่านส่งออกเป็น JSONL ต่อได้โดยไม่พังทั้งชุด",
      ),
    ],
  },

  takeaways: [
    "งาน AI data pipeline จริงคือการร้อยต่อ `uv` (reproducible env) + comprehension (clean) + nested Pydantic (validate) + JSONL (portable output)",
    "ตั้ง `ConfigDict(str_strip_whitespace=True)` ช่วยลดบั๊กช่องว่างล้วนหลุดผ่าน `min_length` ได้ทั่วทั้ง model",
    "ใช้ `list(dict.fromkeys(...))` เมื่อต้องตัดตัวซ้ำแบบคงลำดับ เพื่อให้ผลลัพธ์และเทสต์นิ่งทุกครั้ง",
    "Batch parser ต้องจับ `ValidationError` **ภายใน** ลูปต่อรายการ แยกของดีออกเป็น `model_dump_json()` JSONL และเก็บของเสียพร้อมเส้นทาง `loc` ไว้ตรวจสอบ",
  ],

  reviewCards: [
    rc(
      "d004-rc-1",
      "ทำไมใน Batch Ticket Parser จึงควรใช้ `list(dict.fromkeys(...))` แทน `list(set(...))` สำหรับ deduplicate แท็ก?",
      "เพราะ `dict` รักษาลำดับเดิมแบบ deterministic ส่วน `set` ไม่รับประกันลำดับ ทำให้ผล JSON และ unit test ไม่นิ่ง",
    ),
    rc(
      "d004-rc-2",
      "โครงสร้าง `e['loc']` ของ Pydantic เมื่อ error เกิดใน nested model หรือ list หน้าตาเป็นอย่างไร และแปลงเป็น string อย่างปลอดภัยได้อย่างไร?",
      "เป็น tuple ของ `str | int` เช่น `('customer', 'customer_id')` หรือ `('tags', 0)` → แปลงด้วย `'.'.join(str(p) for p in e['loc'])`",
    ),
    rc(
      "d004-rc-3",
      "รูปแบบ JSONL ต่างจาก JSON array อย่างไร และทำไมจึงเหมาะกับงาน AI pipeline?",
      "JSONL เก็บ 1 JSON object ต่อ 1 บรรทัด (`model_dump_json()` คั่นด้วย `\\n`) จึงอ่าน-เขียนแบบ streaming ทีละบรรทัดได้โดยไม่ต้องโหลดทั้งไฟล์เข้า RAM",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Docs — Models & Nested Models", href: "https://docs.pydantic.dev/latest/concepts/models/" },
    { label: "Pydantic v2 Docs — Validators (`@field_validator`)", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
    { label: "Pydantic v2 Docs — Serialization (`model_dump_json`)", href: "https://docs.pydantic.dev/latest/concepts/serialization/" },
    { label: "uv Official Guide — Working on Projects", href: "https://docs.astral.sh/uv/guides/projects/" },
  ],

  glossary: [
    "uv",
    "pydantic",
    "comprehension",
    "type-hint",
    "field-validator",
    "validation-error",
    "serialization",
    "jsonl",
  ],
});
