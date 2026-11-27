import type { Lesson } from "../types";

/**
 * D001 — Phase 1 / Block B01
 * Source of truth: docs/curriculum.md §5 (Day 1 Complete Chapter Content Outline).
 */
export const d001: Lesson = {
  id: "d001",
  day: 1,
  phase: { index: 1, title: "Modern Python & Async Engineering Foundation" },
  block: "B01",
  titleTh: "ตั้งค่า Python สมัยใหม่ด้วย uv และออกแบบ payload ที่ปลอดภัยด้วย Pydantic v2",
  titleEn: "Modern Python Setup (uv) & Type-Safe AI Payloads with Pydantic v2",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ไม่ต้องมี API key หรือบัตรเครดิต",
  minutes: 30,
  tools: ["uv", "Pydantic v2", "pytest", "Ruff"],
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  icon: "shield-check",
  coverImage: "/assets/illustrations/phase-1-python.jpg",
  visual: {
    id: "schema-gate",
    title: "ด่านตรวจ Schema Gate — ข้อมูลดิบผ่าน Pydantic BaseModel",
    caption: "กดสลับระหว่างข้อมูลดี (ถูก coerce & strip อัตโนมัติ) กับข้อมูลเสีย (ถูกจับทุกข้อผิดพร้อมกันด้วย ValidationError)",
    alt: "แผนภาพโต้ตอบแสดงข้อมูล JSON ไหลเข้าด่านตรวจ Pydantic BaseModel แล้วแยกออกเป็นผลลัพธ์ที่ผ่านการแปลงชนิดกับข้อความ ValidationError",
  },
  interactive: { payloadLab: true, browserChecker: true },
  schedule: [
    { from: 0, to: 5, label: "Orientation & setup check", anchor: "setup" },
    { from: 5, to: 13, label: "Core concepts + worked example", anchor: "concepts" },
    { from: 13, to: 25, label: "Interactive exercise", anchor: "try-it" },
    { from: 25, to: 30, label: "Micro-quiz + review queue", anchor: "quiz" },
  ],

  bigPicture: {
    alt: "แผนภาพวงจรวิศวกรรม AI: Problem → Data → Model → Evaluation → App → Monitor แล้ววนกลับไปจุดเริ่มต้นผ่านลูกศร feedback",
    caption: "วงจรวิศวกรรม AI — กดทีละขั้นเพื่อดูว่าแต่ละช่วงเกี่ยวกับสิ่งที่เรียนวันนี้อย่างไร",
    steps: [
      {
        node: 0,
        title: "Problem — เริ่มจากปัญหาจริง",
        body: "ลูกค้าถามเรื่องใบกำกับภาษีซ้ำซ้อน ระบบต้องรู้ว่า 'ตอบถูก' หน้าตาเป็นอย่างไร และถ้าผิดจะเสียอะไร ก่อนจะเลือกโมเดลหรือเครื่องมือใด ๆ",
        day1: "วันนี้เราตั้งต้นด้วยโปรเจกต์ที่ทำซ้ำได้ (`uv init`) เพราะทุกขั้นถัดไปต้องรันซ้ำได้ตรงกันบนทุกเครื่อง",
      },
      {
        node: 1,
        title: "Data — ข้อมูลเข้ามาเลอะ ๆ",
        body: "ข้อความผู้ใช้ metadata เอกสาร และ JSON ที่ LLM ตอบมา ล้วนคาดเดาไม่ได้: ช่องว่างเกิน, `\"100\"` แทน `100`, `confidence = 1.5`",
        day1: "ตรงนี้คือที่ตั้งของ **ด่านตรวจ schema**: {{pydantic}} ตรวจ {{payload}} ทุกชิ้นที่ข้ามขอบระบบ",
      },
      {
        node: 2,
        title: "Model — โมเดลตอบกลับ",
        body: "{{llm}} ตอบเป็น JSON ที่อาจผิดรูป เช่น category นอกชุดที่รองรับ ถ้าเอาไปใช้ต่อทันทีบั๊กจะโผล่ไกลจากต้นเหตุ",
        day1: "ใช้ {{literal}} + `Field(ge, le)` กำหนดรูปแบบที่ยอมรับ แล้วให้ {{fail-fast}} เมื่อโมเดลตอบนอกกรอบ",
      },
      {
        node: 3,
        title: "Evaluation — วัดว่าดีพอไหม",
        body: "ก่อนจะวัดความถูกต้องเชิงเนื้อหา ให้วัดสิ่งที่ถูกที่สุดก่อน: output ผ่าน schema กี่เปอร์เซ็นต์",
        day1: "เทสต์ `pytest` ของวันนี้คือ eval ตัวแรกของคุณ — ใน Phase 5 จะต่อยอดเป็น golden dataset และ LLM-as-a-judge",
      },
      {
        node: 4,
        title: "App — แอปใช้เฉพาะข้อมูลที่ผ่านด่าน",
        body: "ฟีเจอร์ปลายทาง เช่น สร้างทิกเก็ต เรียก tool หรือส่งต่อเข้า RAG รับเฉพาะ object ที่ผ่านการตรวจแล้ว จึงไม่ต้องเช็กซ้ำทุกชั้น",
        day1: "`parse_ai_request(payload)` ในแบบฝึกหัดคือประตูหน้าของแอปที่ปฏิเสธ request ที่เกินขอบเขต",
      },
      {
        node: 5,
        title: "Monitor — เฝ้าดูหลังปล่อยจริง",
        body: "นับจำนวน `ValidationError` ต่อวัน ดูว่า field ไหนพังบ่อย และคำขอแบบไหนที่ระบบยังรับมือไม่ได้",
        day1: "ข้อความ error ที่ระบุ `loc` และ `msg` ของ Pydantic คือวัตถุดิบของ monitoring ในภายหลัง",
      },
      {
        node: 6,
        title: "Feedback — ย้อนกลับไปปรับปรุง",
        body: "สิ่งที่เห็นจากการเฝ้าดูไหลกลับไปปรับ data, schema และ prompt วงจรไม่ได้จบที่ deploy",
        day1: "ทุกบทต่อจากนี้เพิ่มความสามารถให้วงจรนี้ทีละส่วน — Day 4 จะกลับมาทวนสิ่งที่คุณเรียนวันนี้",
      },
    ],
  },

  objectives: [
    "**สร้างและจัดการ** สภาพแวดล้อม Python ที่ทำซ้ำได้ด้วย `uv init`, `uv add`, `uv run` โดยไม่พัง system Python",
    "**ออกแบบและตรวจสอบ** โครงสร้างข้อมูล input/output ของระบบ AI ด้วย {{pydantic}} (`BaseModel`, `Field`, `Literal`, `field_validator`)",
    "**ดักจับ** ข้อมูลไม่สมบูรณ์ผ่าน {{validation-error}} และแปลงข้อมูลที่ผ่านแล้วเป็น JSON มาตรฐาน (`model_dump_json`)",
  ],
  prerequisites: [
    "Python พื้นฐาน: ตัวแปร, function, dict",
    "ใช้ Terminal เปิด/รันคำสั่งได้",
    "รู้จัก JSON",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "ใช้เวลาไม่เกิน 5 นาที ติดตั้ง {{uv}} (ถ้ายังไม่มี) แล้วสร้างโปรเจกต์แรก ติ๊กทีละข้อเมื่อทำเสร็จ — ระบบจะจำความคืบหน้าไว้ในเบราว์เซอร์ของคุณ",
    commands: {
      language: "bash",
      filename: "terminal",
      code: `# 1) ติดตั้ง uv (เลือกบรรทัดที่ตรงกับระบบของคุณ)
#    Windows (PowerShell):
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
#    macOS / Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2) เช็กว่าใช้งานได้
uv --version

# 3) สร้างโปรเจกต์ + ติดตั้งไลบรารีของวันนี้
uv init ai-day1 && cd ai-day1
uv add pydantic
uv add --dev pytest ruff`,
    },
    steps: [
      { id: "uv-installed", label: "รัน `uv --version` แล้วเห็นเลขเวอร์ชัน" },
      { id: "project-created", label: "รัน `uv init ai-day1` แล้วเห็น `pyproject.toml` ในโฟลเดอร์" },
      { id: "deps-added", label: "รัน `uv add pydantic` และ `uv add --dev pytest ruff` สำเร็จ" },
    ],
    note: "ถ้าติดตั้งไม่ผ่าน ไม่ต้องกังวล: คุณยังทำแบบฝึกหัดในหน้านี้ได้เต็มรูปแบบ แล้วค่อยกลับมารัน `pytest` จริงบนเครื่องทีหลัง",
  },

  concepts: [
    {
      id: "why-schema",
      title: "1 · ทำไมระบบ AI พังบ่อยถ้าไม่มี schema",
      paragraphs: [
        "ข้อมูลที่ไหลเข้า–ออกระบบ AI — ข้อความผู้ใช้, metadata เอกสาร, JSON ที่ LLM ตอบกลับ, พารามิเตอร์ของ tool call — **คาดเดาไม่ได้** (unstructured/noisy)",
        "การใช้ `dict` เปล่า ๆ ทำให้บั๊กไปโผล่กลางทาง: `KeyError`, type ผิดอย่าง `\"100\"` แทน `100`, หรือ `confidence = 1.5` ที่เงียบจนถึงวันที่ลูกค้าเจอเอง",
        "{{pydantic}} บังคับ {{data-contract}} ตั้งแต่ขอบระบบ และเป็นแกนกลางของ FastAPI, {{structured-output}} ของ OpenAI/Anthropic และ LangGraph",
      ],
      analogy: "เหมือนด่านตรวจเอกสารหน้าสนามบิน — ถ้าข้อมูลไม่ครบหรือผิดช่อง เราหยุดตั้งแต่หน้าประตู ไม่ปล่อยให้ไปสร้างปัญหาบนเครื่องบิน",
      why: {
        title: "Why this matters — ทำไมต้องเริ่มที่วันแรก",
        paragraphs: [
          "ทุกตัวอย่างในหลักสูตร 180 วันจะส่งข้อมูลผ่านขอบระบบหลายครั้ง: parse ticket (D4), อ่าน JSONL (D5), config (D7), เรียก API (D13), extractor ด้วย LLM (D77–D80) ถ้าสัญญาข้อมูลไม่ชัดตั้งแต่ต้น ทุกขั้นหลังจากนี้จะพังเงียบ ๆ",
          "หลักปฏิบัติของ AI engineer ที่ใช้ได้ทุกวัน: **ไม่เชื่อ output ของโมเดล จนกว่าจะผ่านด่านตรวจ**",
        ],
      },
    },
    {
      id: "uv-commands",
      title: "2 · สามคำสั่ง uv ที่ใช้ทุกวัน",
      paragraphs: [
        "{{uv}} ทำให้ environment ของโปรเจกต์ {{reproducibility|ทำซ้ำได้}}: สร้าง `.venv` ให้เอง ล็อกเวอร์ชันลง {{lockfile|uv.lock}} และรันโค้ดใน environment ที่ถูกต้องเสมอ",
      ],
      analogy: "เหมือนใบเสร็จวัตถุดิบที่ระบุยี่ห้อและล็อตเป๊ะ ๆ — ไม่ว่าใครเปิดครัวใหม่บนเครื่องไหน ก็ได้รสชาติตรงกัน 100%",
      code: {
        language: "bash",
        filename: "terminal",
        code: `uv init ai-day1 && cd ai-day1   # สร้างโปรเจกต์ + pyproject.toml
uv add pydantic                  # ติดตั้งแพ็กเกจ + อัปเดต uv.lock
uv run python main.py            # รันโค้ดใน .venv อัตโนมัติ`,
        caption: "commit `pyproject.toml` และ `uv.lock` เข้า Git — แต่ไม่ commit `.venv`",
      },
      why: {
        title: "Why this matters — uv.lock กับ \"รันบนเครื่องฉันได้\"",
        paragraphs: [
          "`pyproject.toml` บอกช่วงเวอร์ชันที่ยอมรับ แต่ {{lockfile|uv.lock}} ล็อกเวอร์ชัน **เป๊ะ** ของทุก {{dependency|dependency (รวม transitive)}} ทีมและ CI จึงติดตั้งชุดเดียวกัน ผลทดลองของ AI จึงเทียบกันได้",
          "ในอีกหลายสัปดาห์ Dockerfile ของคุณ (D141) ก็จะใช้ `uv.lock` ตัวเดียวกันนี้",
        ],
      },
    },
    {
      id: "pydantic-parts",
      title: "3 · ส่วนประกอบหลักของ Pydantic v2",
      paragraphs: [
        "สี่ชิ้นที่คุณจะใช้ซ้ำทั้งหลักสูตร — ลองกดคำที่มีเส้นประเพื่ออ่านนิยามทีละตัว:",
      ],
      analogy: "BaseModel คือแบบฟอร์ม, Field คือขอบเขตตัวเลข, Literal คือช่อง dropdown ที่มีตัวเลือกตายตัว และ @field_validator คือเจ้าหน้าที่ตรวจละเอียดรอบสอง",
      bullets: [
        "{{basemodel|`BaseModel`}} — คลาสแม่สำหรับกำหนด schema",
        "`Field(...)` — กำหนดข้อจำกัดอย่าง `min_length`, `ge` (>=), `le` (<=), `default`",
        "{{literal|`Literal[...]`}} — จำกัดค่าให้อยู่ในชุดที่อนุญาต เช่น `\"billing\"`, `\"technical\"`, `\"general\"`",
        "{{field-validator|`@field_validator(...)`}} — เขียนกฎตรวจสอบหรือทำความสะอาดข้อมูลเอง เช่น `strip()`",
      ],
      why: {
        title: "Why this matters — ลำดับการทำงานของกฎ",
        paragraphs: [
          "`Field(min_length=5)` ทำงาน **ก่อน** `field_validator` แบบ after ดังนั้นข้อความที่เป็นช่องว่าง 6 ตัวจะผ่าน `min_length` แล้วค่อยถูกจับโดย validator ที่ `strip()` — ลองดูผลจริงใน Payload Lab ด้านล่าง",
          "ลำดับนี้คือที่มาของข้อผิดพลาดยอดฮิต: เช็กความยาว 'ก่อน' ตัดช่องว่าง",
        ],
      },
    },
  ],

  bridges: [
    {
      track: "web",
      label: "Junior Web/App Dev",
      title: "Web Dev Bridge — จาก JS/TS มา Python",
      body: [
        "ถ้าคุณคุ้น pnpm/bun และ Zod คุณรู้โครงสร้างนี้อยู่แล้ว แค่เปลี่ยนชื่อเรียก:",
      ],
      table: [
        ["uv", "pnpm / bun"],
        ["pyproject.toml", "package.json"],
        ["uv.lock", "pnpm-lock.yaml"],
        [".venv", "node_modules"],
        ["Pydantic v2 BaseModel", "Zod schema + z.infer"],
      ],
    },
    {
      track: "student",
      label: "นักศึกษาปี 1",
      title: "First-Year Note — .venv และ uv run คืออะไร",
      body: [
        "Virtual environment (`.venv`) คือ \"กล่องแยกไลบรารี\" ของแต่ละโปรเจกต์ เพื่อไม่ให้เวอร์ชันแพ็กเกจของโปรเจกต์ A ไปชนกับโปรเจกต์ B",
        "คำสั่ง `uv run python ...` จะเลือกใช้ Python และไลบรารีใน `.venv` ของโปรเจกต์นั้นให้อัตโนมัติ — ไม่ต้อง activate เอง",
        "Terminal คือหน้าต่างที่พิมพ์คำสั่ง (เช่น PowerShell, Terminal ของ macOS); `cd` คือการเข้าโฟลเดอร์",
      ],
    },
  ],

  workedExample: {
    intro:
      "สถานการณ์: ระบบ AI จัดหมวดหมู่ทิกเก็ตของลูกค้าแล้วส่งผลเป็น JSON/dict เราต้องตรวจสอบก่อนส่งต่อไปยังระบบสร้างทิกเก็ต เดินไปทีละขั้นด้วยปุ่ม **ขั้นต่อไป**",
    steps: [
      {
        title: "1 · กำหนดสัญญาข้อมูล (schema)",
        explain: "ประกาศ field พร้อมกฎ: `ticket_id` ยาว ≥ 4, `category` อยู่ในชุดที่กำหนด, `confidence` อยู่ใน 0–1, และ `summary_th` ถูกตัดช่องว่างก่อนเช็กอีกรอบ",
        code: {
          language: "python",
          filename: "worked_example.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field, ValidationError, field_validator


class TicketClassification(BaseModel):
    ticket_id: str = Field(min_length=4, description="รหัสทิกเก็ต เช่น TKT-001")
    category: Literal["billing", "technical", "general"]
    confidence: float = Field(ge=0.0, le=1.0)
    summary_th: str = Field(min_length=5, max_length=200)

    @field_validator("summary_th")
    @classmethod
    def strip_and_check_non_empty(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 5:
            raise ValueError("summary_th ต้องมีความยาวอย่างน้อย 5 ตัวอักษรหลังตัดช่องว่าง")
        return cleaned`,
        },
      },
      {
        title: "2 · ส่ง payload ที่ถูกต้อง (แต่ไม่เป๊ะ)",
        explain:
          "สังเกตว่า `confidence` เป็น string `\"0.92\"` และ `summary_th` มีช่องว่างหัวท้าย — Pydantic แปลงเป็น `0.92` ({{coercion}}) และ validator ตัดช่องว่างให้",
        code: {
          language: "python",
          filename: "worked_example.py",
          code: `valid_raw = {
    "ticket_id": "TKT-2026",
    "category": "billing",
    "confidence": "0.92",
    "summary_th": "  ลูกค้าสอบถามใบกำกับภาษีซ้ำซ้อน  ",
}
result = TicketClassification.model_validate(valid_raw)
print("VALID:", result.model_dump_json())`,
        },
        output: `VALID: {"ticket_id":"TKT-2026","category":"billing","confidence":0.92,"summary_th":"ลูกค้าสอบถามใบกำกับภาษีซ้ำซ้อน"}`,
      },
      {
        title: "3 · ส่ง payload ที่ผิด",
        explain: "category ไม่อยู่ในชุด, confidence เกิน 1.0, และ summary_th เป็นช่องว่างล้วน — ดูว่า Pydantic รายงาน **ทุกข้อผิดพร้อมกัน**",
        code: {
          language: "python",
          filename: "worked_example.py",
          code: `invalid_raw = {
    "ticket_id": "TKT-2026",
    "category": "refund",
    "confidence": 1.4,
    "summary_th": "   ",
}
try:
    TicketClassification.model_validate(invalid_raw)
except ValidationError as err:
    print(f"INVALID ({err.error_count()} errors):")
    for e in err.errors():
        print(" -", e["loc"], "->", e["msg"])`,
        },
        output: `INVALID (3 errors):
 - ('category',) -> Input should be 'billing', 'technical' or 'general'
 - ('confidence',) -> Input should be less than or equal to 1
 - ('summary_th',) -> String should have at least 5 characters`,
      },
    ],
    gotcha:
      "จุดสังเกต: ลองเปลี่ยน `summary_th` เป็นช่องว่าง **6 ตัว** ใน Payload Lab — มันผ่าน `min_length=5` แต่ถูกจับโดย validator ที่ `strip()` เพราะ `Field` ทำงานก่อน `field_validator`",
  },

  payloadLab: {
    intro:
      "ทดลองส่ง payload เข้า `TicketClassification` ได้เลย: เลือกตัวอย่างหรือแก้ JSON เอง แล้วกด **ตรวจ payload** — ผลลัพธ์จำลองการทำงานของ Pydantic v2 (lax mode) ตรงตามที่จะเห็นบนเครื่องคุณ",
    presets: [
      {
        id: "valid",
        label: "ถูกต้อง (confidence เป็น string)",
        payload: { ticket_id: "TKT-2026", category: "billing", confidence: "0.92", summary_th: "  ลูกค้าสอบถามใบกำกับภาษีซ้ำซ้อน  " },
        note: "ผ่านพร้อมแปลง \"0.92\" → 0.92 และตัดช่องว่างให้",
      },
      {
        id: "bad-category",
        label: "category นอกชุด + confidence เกิน",
        payload: { ticket_id: "TKT-2026", category: "refund", confidence: 1.4, summary_th: "   " },
        note: "Pydantic รายงานครบทุก field ที่ผิดในครั้งเดียว",
      },
      {
        id: "six-spaces",
        label: "ช่องว่าง 6 ตัว (ผ่าน min_length แต่ไม่ผ่าน validator)",
        payload: { ticket_id: "TKT-2026", category: "general", confidence: 0.5, summary_th: "      " },
        note: "ข้อความ error มาจาก validator (Value error) ไม่ใช่ Field",
      },
      {
        id: "missing",
        label: "ขาด ticket_id",
        payload: { category: "technical", confidence: 0.7, summary_th: "แอปค้างตอนชำระเงิน" },
        note: "field ที่ไม่มี default ถือเป็น required",
      },
      {
        id: "type-error",
        label: "confidence ไม่ใช่ตัวเลข",
        payload: { ticket_id: "TKT-77", category: "general", confidence: "สูง", summary_th: "ลูกค้าพอใจมาก" },
        note: "แปลงไม่ได้ → ValidationError (lax mode ไม่เดาให้)",
      },
    ],
  },

  exercise: {
    intro:
      "โจทย์ (12 นาที): สร้างฟังก์ชัน `parse_ai_request(payload: dict) -> AIQueryRequest` เพื่อตรวจสอบคำขอที่ส่งเข้า AI Assistant ของบริษัท แก้โค้ดในกล่องด้านล่างแล้วกด **รันเทสต์** (หรือ Ctrl/⌘ + Enter)",
    requirements: [
      "`user_id: str` — ขึ้นต้นด้วย `\"USR-\"` และยาวอย่างน้อย 6 ตัวอักษร (เช่น `\"USR-01\"`)",
      "`query: str` — ตัดช่องว่างหัวท้าย (`strip()`) แล้วต้องยาว 3 ถึง 500 ตัวอักษร",
      "`language: Literal[\"th\", \"en\", \"mixed\"]` — ค่าเริ่มต้น `\"th\"`",
      "`top_k: int` — ค่าเริ่มต้น `5`, อยู่ระหว่าง `1` ถึง `20` (รวมปลายทาง)",
      "`temperature: float` — ค่าเริ่มต้น `0.2`, อยู่ระหว่าง `0.0` ถึง `1.0` (รวมปลายทาง)",
      "`parse_ai_request` เรียก `AIQueryRequest.model_validate(payload)` แล้วคืน instance (ปล่อย `ValidationError` ตามปกติ)",
    ],
    starter: {
      language: "python",
      filename: "exercise_day1.py",
      code: `from typing import Literal
from pydantic import BaseModel, Field, field_validator


class AIQueryRequest(BaseModel):
    # TODO: กำหนด fields และ validation rules ตาม spec
    pass


def parse_ai_request(payload: dict) -> AIQueryRequest:
    # TODO: validate และ return AIQueryRequest
    raise NotImplementedError
`,
    },
    tests: {
      language: "python",
      filename: "test_day1.py",
      code: `import pytest
from pydantic import ValidationError
from exercise_day1 import AIQueryRequest, parse_ai_request


def test_valid_defaults_and_stripping():
    req = parse_ai_request({"user_id": "USR-101", "query": "  ขอเช็ค status order ครับ  "})
    assert isinstance(req, AIQueryRequest)
    assert req.query == "ขอเช็ค status order ครับ"
    assert req.language == "th"
    assert req.top_k == 5
    assert req.temperature == pytest.approx(0.2)


def test_reject_whitespace_only_query():
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "USR-101", "query": "     "})


def test_reject_invalid_user_id_prefix():
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "ADMIN-1", "query": "สวัสดี"})


def test_reject_out_of_bounds_params():
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "USR-101", "query": "สวัสดี", "top_k": 0})
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "USR-101", "query": "สวัสดี", "temperature": 1.5})


def test_accept_mixed_language():
    req = parse_ai_request({
        "user_id": "USR-999",
        "query": "วิธี reset password",
        "language": "mixed",
        "top_k": 10,
        "temperature": 0.0,
    })
    assert req.language == "mixed"
    assert req.top_k == 10
`,
    },
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# ใน ai-day1/ — คัดลอก exercise_day1.py และ test_day1.py มาไว้ในโฟลเดอร์เดียวกัน
uv run pytest -q
uv run ruff check .`,
      caption: "ไฟล์เริ่มต้นและเทสต์ของจริงอยู่ที่ `exercises/d001/` ในรีโปนี้",
    },
    hints: [
      {
        level: 1,
        title: "Level 1 · Conceptual Nudge",
        body: "แยกกฎที่ตรวจด้วยช่วงตัวเลข/ค่าคงที่ (`Field(ge=..., le=...)`, `Literal[...]`) ออกจากกฎที่ต้องประมวลผลสตริง (เช่น `strip()` หรือ `startswith(\"USR-\")`) ซึ่งควรเขียนใน `@field_validator` — และระวังเคส `\"     \"` ที่ความยาว **ก่อน** `strip()` มากกว่า 3 แต่ **หลัง** `strip()` เหลือ 0",
      },
      {
        level: 2,
        title: "Level 2 · Structure & API Clue",
        body: "ใช้ `Field(default=5, ge=1, le=20)` สำหรับ `top_k` และใช้ `@field_validator(\"user_id\")` กับ `@field_validator(\"query\")` — หรือจะตั้ง `model_config = ConfigDict(str_strip_whitespace=True)` ให้ตัดช่องว่างอัตโนมัติก่อนตรวจ `min_length`/`max_length` ก็ได้ (อย่าลืม import `ConfigDict`)",
      },
      {
        level: 3,
        title: "Level 3 · Concrete Walkthrough",
        body: "โครงเกือบสมบูรณ์ — เหลือขั้นตัดสินใจสุดท้ายให้คุณ: เติมบรรทัด `return AIQueryRequest.model_validate(payload)` ใน `parse_ai_request` แล้วกดรันเทสต์",
        code: {
          language: "python",
          filename: "hint-level-3.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field, field_validator


class AIQueryRequest(BaseModel):
    user_id: str = Field(min_length=6)
    query: str
    language: Literal["th", "en", "mixed"] = "th"
    top_k: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not v.startswith("USR-"):
            raise ValueError("user_id must start with 'USR-'")
        return v

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        cleaned = v.strip()
        if not (3 <= len(cleaned) <= 500):
            raise ValueError("query length must be between 3 and 500")
        return cleaned


def parse_ai_request(payload: dict) -> AIQueryRequest:
    # TODO: validate และ return AIQueryRequest
    raise NotImplementedError
`,
        },
      },
    ],
  },

  mistakes: [
    {
      title: "เช็กความยาวก่อน strip",
      symptom: "`query: str = Field(min_length=3)` ปล่อยให้ `\"   \"` (ช่องว่าง 3 ตัว) ผ่านไปเป็นคำถามว่างเปล่า",
      fix: "ตัดช่องว่างก่อน — ใช้ `ConfigDict(str_strip_whitespace=True)` หรือ `field_validator` ที่ `strip()` แล้วเช็กความยาวหลังตัด และ `return` ค่าที่ตัดแล้ว",
    },
    {
      title: "ลืม return ใน validator",
      symptom: "validator ตรวจผ่านแต่ไม่ `return` → field กลายเป็น `None` เงียบ ๆ",
      fix: "validator ต้อง `return` ค่า (ที่ทำความสะอาดแล้ว) เสมอ และ `raise ValueError(...)` เมื่อไม่ผ่าน",
    },
    {
      title: "ใช้ pip install ปนกับ uv",
      symptom: "ติดตั้งด้วย `pip install` แล้ว `uv run` มองไม่เห็นแพ็กเกจ หรือ `pyproject.toml` ไม่อัปเดต",
      fix: "ใช้ `uv add <package>` เสมอ มันแก้ `pyproject.toml` และ `uv.lock` ให้พร้อมกัน แล้วรันด้วย `uv run`",
    },
    {
      title: "commit .venv แต่ไม่ commit uv.lock",
      symptom: "repo ใหญ่โดยไม่จำเป็น ขณะที่เพื่อนร่วมทีมได้เวอร์ชันไลบรารีไม่ตรงกัน",
      fix: "ใส่ `.venv/` ใน `.gitignore` และ commit ทั้ง `pyproject.toml` กับ `uv.lock`",
    },
    {
      title: "ไม่ตั้งขอบบนให้พารามิเตอร์",
      symptom: "ผู้ใช้หรือบั๊กส่ง `top_k=10000` ทำให้ context ล้นและค่า API พุ่ง",
      fix: "ตั้ง `Field(ge=..., le=...)` ให้ทุกพารามิเตอร์ที่ผู้ใช้ควบคุมได้ — input bounding คือการป้องกันแรกของ latency และ cost",
    },
  ],

  quiz: {
    intro: "4 ข้อ เลือกคำตอบแล้วกด **ตรวจคำตอบ** เพื่อดูเหตุผลทันที ข้อที่พลาดจะเข้าคิวทบทวนอัตโนมัติ",
    questions: [
      {
        id: "q1",
        prompt: "ข้อใดคือประโยชน์หลักของ `uv.lock` ในทีม AI Engineer?",
        options: [
          { id: "A", text: "ทำให้โค้ด Python รันเร็วขึ้น 10 เท่า", why: "uv ติดตั้งแพ็กเกจเร็ว แต่ `uv.lock` ไม่ได้ทำให้โค้ดที่เรารันเร็วขึ้น มันเป็นไฟล์บันทึกเวอร์ชัน" },
          {
            id: "B",
            text: "ล็อกเวอร์ชันของ dependencies ทุกตัว (รวม transitive) ให้ทุกเครื่องและ CI ติดตั้งชุดเดียวกันเป๊ะ",
            why: "ถูก — นี่คือ reproducibility: ทุกเครื่องได้เวอร์ชันเดียวกัน ลดปัญหา \"รันบนเครื่องฉันได้ แต่พังบน server\"",
          },
          { id: "C", text: "เข้ารหัส API Key ในไฟล์ `.env`", why: "ไม่เกี่ยวกัน — `uv.lock` เก็บเวอร์ชันแพ็กเกจ ไม่ได้ดูแลความลับ (ความลับอยู่ใน `.env` และไม่ควร commit)" },
          { id: "D", text: "แปลงโค้ด Python เป็นไฟล์ Docker โดยอัตโนมัติ", why: "uv.lock ไม่สร้าง Docker image — แต่ Dockerfile ที่ดีจะอ่าน `uv.lock` เพื่อติดตั้งชุดเดียวกัน (D141)" },
        ],
        answer: "B",
        explanation: "`uv.lock` รับประกัน reproducibility โดยล็อกทุก dependency ทั้งทางตรงและทางอ้อม ซึ่งสำคัญมากเมื่อต้องเทียบผลของ AI ระหว่างเครื่องหรือเวลา *(ทบทวนซ้ำใน Day 4)*",
        review: { prompt: "`uv.lock` ช่วยทีม AI Engineer อย่างไร?", answer: "ล็อกเวอร์ชันของ dependency ทุกตัว (รวม transitive) ให้ทุกเครื่องและ CI ติดตั้งชุดเดียวกัน → reproducible, ลด \"รันบนเครื่องฉันได้\"" },
      },
      {
        id: "q2",
        prompt: "ถ้ากำหนด `query: str = Field(min_length=3)` โดยไม่ใส่ strip แล้วผู้ใช้ส่ง `\"   \"` (ช่องว่าง 3 ตัว) จะเกิดอะไรขึ้น?",
        options: [
          { id: "A", text: "เกิด `ValidationError` ทันที", why: "ไม่เกิด — ความยาวสตริงคือ 3 ซึ่งตรงเงื่อนไข `min_length=3` พอดี" },
          { id: "B", text: "ผ่านการตรวจสอบ เพราะสตริงมีความยาว 3 ตัวอักษร", why: "ถูก — Pydantic นับช่องว่างเป็นตัวอักษร จึงผ่าน และคำถามว่างเปล่าหลุดเข้าระบบได้" },
          { id: "C", text: "Pydantic ลบช่องว่างให้เองเป็นค่าเริ่มต้นเสมอ", why: "ไม่จริง — ต้องตั้ง `ConfigDict(str_strip_whitespace=True)` หรือเขียน validator เอง" },
          { id: "D", text: "คืนค่า `None`", why: "Pydantic ไม่แปลงค่าที่ผิดเป็น `None` — ถ้าผิดจะโยน ValidationError ถ้าผ่านก็คืนค่าเดิม" },
        ],
        answer: "B",
        explanation: "Pydantic ไม่ตัดช่องว่างให้อัตโนมัติ เว้นแต่จะตั้ง `ConfigDict(str_strip_whitespace=True)` หรือใช้ `@field_validator` — จึงต้อง strip ก่อนแล้วค่อยเช็กความยาว",
        review: { prompt: "`Field(min_length=3)` กับ `\"   \"` (ช่องว่าง 3 ตัว) ผลเป็นอย่างไร และแก้อย่างไร?", answer: "ผ่าน เพราะนับช่องว่างเป็นตัวอักษร → ใช้ `ConfigDict(str_strip_whitespace=True)` หรือ `field_validator` ที่ strip แล้วเช็กความยาว" },
      },
      {
        id: "q3",
        prompt: "เมื่อ LLM ตอบ JSON `{\"category\": \"unknown\", \"confidence\": 0.8}` แต่ schema กำหนด `Literal[\"billing\", \"technical\", \"general\"]` Pydantic จะทำอย่างไร?",
        options: [
          { id: "A", text: "เปลี่ยนเป็นค่าตัวแรก `\"billing\"` ให้อัตโนมัติ", why: "Pydantic ไม่เดาค่าแทนเรา — การเดาเงียบ ๆ จะซ่อนบั๊กและทำให้ข้อมูลผิดโดยไม่มีใครรู้" },
          { id: "B", text: "ปล่อยผ่านพร้อม warning", why: "ไม่ — ค่านอก Literal คือข้อมูลผิด ไม่ใช่แค่คำเตือน" },
          { id: "C", text: "โยน `ValidationError` เพื่อให้โค้ดฝั่งเราดักจับและทำ retry/fallback ได้อย่างปลอดภัย", why: "ถูก — นี่คือ fail-fast: รู้ทันทีว่าโมเดลตอบนอกกรอบ แล้วเลือก retry/fallback ได้อย่างตั้งใจ" },
          { id: "D", text: "ปิดโปรแกรมทันทีโดยจับ exception ไม่ได้", why: "ValidationError เป็น exception ปกติ ใช้ `try/except ValidationError` จับได้" },
        ],
        answer: "C",
        explanation: "การ fail-fast ด้วย `ValidationError` คือรากฐานของระบบ Structured Output ที่เชื่อถือได้ — ใน D78 เราจะต่อยอดเป็น validation-repair loop",
        review: { prompt: "LLM ตอบ category นอก `Literal` — Pydantic ทำอะไร และเราควรทำอะไรต่อ?", answer: "โยน `ValidationError` (ไม่เดา/ไม่ปล่อยผ่าน) → จับด้วย try/except แล้วทำ retry หรือ fallback" },
      },
      {
        id: "q4",
        prompt: "เหตุใดการกำหนด `top_k: int = Field(default=5, ge=1, le=20)` จึงสำคัญกับระบบ RAG ใน Production?",
        options: [
          { id: "A", text: "ป้องกันผู้ใช้หรือบั๊กส่ง `top_k=10000` จนล้น context window และทำให้ค่า LLM API พุ่ง", why: "ถูก — input bounding กัน latency spike, context overflow และ cost explosion" },
          { id: "B", text: "ทำให้ Vector Database ค้นหาเร็วขึ้นโดยไม่ต้องสร้าง index", why: "ขอบเขตของ top_k ไม่ได้แทน index — ความเร็วการค้นหามาจากการทำ index ไม่ใช่การจำกัดพารามิเตอร์" },
          { id: "C", text: "บังคับให้ LLM ตอบเป็นภาษาไทย", why: "ภาษาของคำตอบถูกควบคุมด้วย prompt/ `language` ไม่เกี่ยวกับ top_k" },
          { id: "D", text: "ลดขนาดของไฟล์ `pyproject.toml`", why: "ไม่เกี่ยวข้อง — ข้อจำกัดอยู่ในโค้ด ไม่ใช่ไฟล์ config ของโปรเจกต์" },
        ],
        answer: "A",
        explanation: "Input bounding ป้องกันทั้ง latency spike, context overflow และ cost explosion — เชื่อมโยงกับเนื้อหา Security & Cost ใน Phase 5",
        review: { prompt: "ทำไมต้องกำหนดขอบเขตให้ `top_k` (เช่น `ge=1, le=20`) ใน RAG production?", answer: "กันค่าผิดปกติ (เช่น 10000) ที่ทำ context ล้น, latency พุ่ง และค่า API บวม — input bounding" },
      },
    ],
  },

  summary: {
    takeaways: [
      "`uv init / add / run` สร้าง environment ที่ทำซ้ำได้; commit `pyproject.toml` + `uv.lock`, ไม่ commit `.venv`",
      "Pydantic ยกข้อมูลที่เลอะให้เป็นสัญญาที่ตรวจได้ที่ขอบระบบ: `BaseModel`, `Field`, `Literal`, `field_validator`",
      "ตัดช่องว่างก่อนเช็กความยาว และ validator ต้อง `return` ค่าเสมอ",
      "`ValidationError` ไม่ใช่ศัตรู แต่คือสัญญาณให้ retry/fallback — fail-fast ดีกว่าพังเงียบ",
    ],
    reviewNote:
      "เมื่อกดเสร็จสิ้นบท ระบบจะเพิ่มการ์ดทบทวนเข้าคิว: ทวนครั้งแรกที่ **Day 4** (+3 วัน) จากนั้น +8 และ +16 วัน",
    next: { day: 2, title: "Python Collections, Comprehensions & Type Hints", available: true },
  },

  reviewCards: [
    { id: "d001-rc-lock", prompt: "ทำไมต้อง commit `uv.lock` แต่ไม่ commit `.venv`?", answer: "`uv.lock` ล็อกเวอร์ชันเป๊ะให้ทุกเครื่องสร้าง `.venv` ซ้ำได้; `.venv` ใหญ่และสร้างใหม่ได้เสมอ จึงใส่ใน `.gitignore`" },
    { id: "d001-rc-order", prompt: "Field constraint กับ after-validator อันไหนทำงานก่อน และมีผลอย่างไรกับข้อความช่องว่างล้วน?", answer: "Field constraint ก่อน — ช่องว่าง 6 ตัวผ่าน `min_length=5` แล้วค่อยถูก validator ที่ `strip()` จับ จึงต้องเช็กความยาวหลังตัดช่องว่าง" },
    { id: "d001-rc-lax", prompt: "`confidence: float` รับ `\"0.92\"` ได้ไหม และ `\"สูง\"` ล่ะ?", answer: "รับ `\"0.92\"` (lax coercion → 0.92) แต่ `\"สูง\"` แปลงไม่ได้ → ValidationError; ถ้าอยากเข้มใช้ `strict=True`" },
  ],

  sources: [
    { label: "uv — Getting Started & Projects", href: "https://docs.astral.sh/uv/guides/projects/" },
    { label: "Pydantic v2 — Models", href: "https://docs.pydantic.dev/latest/concepts/models/" },
    { label: "Pydantic v2 — Field Validators", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
    { label: "pytest — Getting Started", href: "https://docs.pytest.org/en/stable/getting-started.html" },
    { label: "Python typing — Literal & Type Hints", href: "https://docs.python.org/3/library/typing.html" },
  ],

  glossary: [
    "uv",
    "venv",
    "lockfile",
    "reproducibility",
    "dependency",
    "pyproject",
    "pydantic",
    "basemodel",
    "schema",
    "validation",
    "validation-error",
    "type-hint",
    "literal",
    "field-validator",
    "coercion",
    "data-contract",
    "structured-output",
    "payload",
    "fail-fast",
    "top-k",
    "temperature",
    "llm",
    "pytest",
    "ruff",
    "serialization",
    "hallucination",
  ],
};
