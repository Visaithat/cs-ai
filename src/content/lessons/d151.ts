import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D151 — Phase 5 / Block B38
 * Thai PDPA Engineering (PII Detection/Redaction: Thai ID, Phone, Name + Audit Log)
 */
export const d151: Lesson = defineLesson({
  day: 151,
  titleTh: "วิศวกรรม PDPA สำหรับระบบ AI ไทย: ตรวจจับและปกปิดข้อมูลส่วนบุคคลพร้อม Audit Log",
  tagline: "30 นาที · ปิดบังเลขบัตรประชาชน 13 หลัก (พร้อม checksum) เบอร์โทร และชื่อลูกค้าก่อนออก API และก่อนลง log",
  icon: "lock",
  visual: {
    id: "pdpa-redaction",
    title: "PDPA PII Redaction Middleware — ปิดข้อมูลอ่อนไหวก่อนออกนอกองค์กร",
    caption: "กดทดสอบสแกนข้อความลูกค้าเพื่อเห็นการตรวจเลขบัตรประชาชน 13 หลัก (พร้อม checksum) และเบอร์โทรไทยก่อนส่ง LLM",
    alt: "แผนภาพการตรวจจับและปกปิดข้อมูลส่วนบุคคลตาม PDPA ก่อนส่งไปยัง LLM และระบบล็อก",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  tools: ["Python re", "Pydantic v2", "structlog", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อมูลลูกค้าไทยมี PII ปะปนอยู่ในข้อความธรรมชาติเสมอ",
      body: "ลูกค้ามักพิมพ์เลขบัตรประชาชน 13 หลัก เบอร์มือถือ หรือชื่อ-นามสกุลส่งมาในแชตซัพพอร์ตและเอกสาร {{rag}} โดยไม่รู้ตัว",
      lessonNote: "สร้างด่าน {{pdpa}} ตรวจจับข้อมูลส่วนบุคคลบริบทไทยด้วย regex + อัลกอริทึม checksum เพื่อลดการปิดบังผิดตัว (false positive)",
    },
    {
      node: 4,
      heading: "Redact ก่อนส่งออก External LLM API ทุกครั้ง",
      body: "หากส่ง raw prompt ออกไปยังคลาวด์ LLM ภายนอก ข้อมูลส่วนบุคคลของลูกค้าจะออกนอกขอบเขตองค์กรทันที เสี่ยงผิดหลัก Data Minimization",
      lessonNote: "วาง {{guardrails|PII Redaction Middleware}} คั่นหน้าประตูแอป แทนที่ค่าจริงด้วย placeholder เช่น `[THAI_ID_1]` ก่อนส่งเข้าโมเดล",
    },
    {
      node: 5,
      heading: "ปกปิดก่อนลง Observability & Audit Log ด้วย",
      body: "จุดรั่วไหลที่ทีมมองข้ามบ่อยที่สุดไม่ใช่แค่ LLM API แต่คือการเผลอพิมพ์ raw prompt ลง {{structlog}} หรือส่งเข้า {{langfuse}} trace",
      lessonNote: "บันทึกเฉพาะ **Sanitized Audit Log** (จำนวน entity ที่พบ, ประเภท, hash แบบใส่ salt และข้อความที่ปิดบังแล้ว) โดยไม่มี raw PII ค้างในระบบล็อก",
    },
    {
      node: 6,
      heading: "ตรวจสอบย้อนหลังและทดสอบกับเคสจริงอย่างต่อเนื่อง",
      body: "รูปแบบข้อความลูกค้าเปลี่ยนไปเรื่อย ๆ เช่น ใส่ขีด เว้นวรรค หรือพิมพ์ปนรหัสสินค้า 13 หลัก",
      lessonNote: "เขียนชุดเทสต์ {{pytest}} ครอบคลุมทั้งเคสที่ต้องปิด (valid Thai ID/phone) และเคสที่ห้ามปิดผิด (เช่น บาร์โค้ด 13 หลัก)",
    },
  ],

  objectives: [
    "**ออกแบบลำดับ Redaction-First Pipeline** ที่ปกปิด PII **ก่อน** ส่งออกไปยัง external LLM API และ **ก่อน** บันทึกลง observability/audit logs เพื่อสอดคล้องกับ {{pdpa}}",
    "**เขียนตัวตรวจจับ PII บริบทไทยที่แม่นยำ** โดยใช้ checksum เลขบัตรประชาชนไทย 13 หลักแยกออกจากเลขบาร์โค้ด/ออเดอร์ พร้อมจับเบอร์โทรไทย อีเมล และชื่อที่มีคำนำหน้า",
    "**สร้างโครงสร้าง Audit Log ที่ปลอด Raw PII** ด้วย {{pydantic}} ซึ่งบันทึกสถิติการปกปิดและตรวจสอบย้อนหลังได้โดยไม่สร้างแหล่งข้อมูลรั่วไหลแห่งใหม่",
  ],

  prerequisites: [
    "ใช้งาน `Pydantic v2` และ `pytest` ได้คล่อง (Phase 1)",
    "รู้จักโครงสร้าง logging (`structlog`) และ tracing (`Langfuse`) (D6, D134)",
    "เข้าใจแนวคิด Input/Output Guardrails และ OWASP LLM02 Sensitive Information Disclosure (D149–D150)",
    "พื้นฐาน Regular Expressions (`re`) ใน Python",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `pdpa-guard-lab` ด้วย `uv` — โค้ดทั้งหมดใช้ Python standard library (`re`, `hashlib`, `datetime`) ร่วมกับ `pydantic` และ `pytest` รันบนเครื่องได้ 100%",
    commands: `uv init pdpa-guard-lab && cd pdpa-guard-lab
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `pdpa-guard-lab` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["check", "รัน `uv run pytest --version` แล้วเห็นเลขเวอร์ชัน"],
    ],
    note: "บทเรียนนี้เน้นมิติวิศวกรรมซอฟต์แวร์ (Data Minimization, Redaction, Auditability) เพื่อลดความเสี่ยงด้านเทคนิค — สำหรับนโยบายทางกฎหมายและ Consent ขององค์กรให้ทำงานร่วมกับ DPO / ฝ่ายกฎหมายเสมอ",
  },

  concepts: [
    {
      id: "pdpa-two-leak-points",
      title: "1 · สองจุดรั่วไหลของ PII ในระบบ AI ไทย (API และ Observability Logs)",
      paragraphs: [
        "ภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ({{pdpa}}) องค์กรต้องเก็บ ใช้ และเปิดเผยข้อมูลส่วนบุคคลเท่าที่จำเป็น (Data Minimization) แต่ในระบบ AI ที่คุยกับลูกค้าจริง ผู้ใช้มักพิมพ์ข้อความเช่น *\"ช่วยเช็กกรมธรรม์ให้คุณสมชาย เลขบัตร 1-1007-00123-45-5 เบอร์ 081-234-5678 หน่อย\"* เข้ามาตรง ๆ",
        "วิศวกรที่ทำแค่ปกปิดก่อนเรียก LLM API มักพลาดจุดรั่วไหลที่สองคือ **ชั้น Logging & Tracing**: หาก middleware บันทึก request ดิบลง {{structlog}} หรือส่งเข้า {{langfuse}} ก่อนผ่าน redactor ข้อมูลบัตรประชาชนลูกค้าจะไปค้างอยู่ในฐานข้อมูล log ซึ่งมีคนเข้าถึงได้มากกว่าและลบทิ้งตามคำขอ (Right to Erasure) ได้ยากมาก",
      ],
      analogy: "เหมือนการขีดดำปิดเลขบัตรประชาชนบนสำเนาเอกสาร **ก่อน** ถ่ายเอกสารแจกทุกแผนก — ถ้าขีดดำเฉพาะแผ่นที่ส่งคู่ค้า แต่เก็บต้นฉบับไม่ขีดดำวางเกลื่อนไว้บนโต๊ะกลางห้องประชุม ข้อมูลก็ยังรั่วอยู่ดี",
      bullets: [
        "**จุดที่ 1 — Outbound LLM / Embedding API**: ปกปิด PII ก่อนสร้าง prompt และก่อนส่งไปทำ embedding เสมอ เว้นแต่เป็นการรันโมเดลภายในองค์กรที่ได้รับสิทธิ์ชัดแจ้ง",
        "**จุดที่ 2 — Application Logs, Traces & Eval Datasets**: ห้ามบันทึก raw PII ลง log, trace span หรือ export ไปทำ golden dataset โดยไม่ผ่านการ scrub",
        "**จุดที่ 3 — Output & Indirect Leak**: แม้กันขาเข้าแล้ว เอกสารจาก {{rag}} หรือ tool output อาจมี PII ติดมาและเสี่ยงถูกหลอกให้คายออกด้วย {{prompt-injection}} จึงควรสแกนทั้งก่อนส่งเข้า LLM และก่อนส่งถึงผู้ใช้",
      ],
      whyTitle: "Why this matters — ช่องว่างเฉพาะบริบทไทยที่ตำราต่างประเทศไม่ได้สอน",
      whyParagraphs: [
        "เครื่องมือตรวจจับ PII สำเร็จรูปจากต่างประเทศมักรู้จัก SSN ของสหรัฐฯ แต่ไม่รู้จักเลขบัตรประชาชนไทย 13 หลัก เบอร์มือถือไทย (`06/08/09` และ `+66`) หรือคำนำหน้าชื่อภาษาไทย (`นาย`, `นางสาว`, `คุณ`) ทำให้ปล่อยข้อมูลลูกค้าไทยหลุดออกไปทั้งหมด",
        "การสร้าง Thai PDPA Guardrail ที่เบา เร็ว (ระดับไมโครวินาที) และทดสอบได้ด้วย `pytest` จึงเป็นทักษะเด่นที่องค์กรไทยมองหาใน AI Engineer",
      ],
    },
    {
      id: "thai-id-checksum-and-patterns",
      title: "2 · ตรวจจับ PII ไทยให้แม่นด้วย Checksum เลขบัตร 13 หลัก",
      paragraphs: [
        "ถ้าเขียน regex ง่าย ๆ อย่าง `\\d{13}` เพื่อปิดเลขบัตรประชาชน ระบบจะเกิด **False Positive** ทันทีเมื่อลูกค้าส่งเลขบาร์โค้ดสินค้า EAN-13 (เช่น `8850123456789`) หรือเลขออเดอร์ 13 หลัก จนทำให้ AI ตอบคำถามสินค้าไม่ได้",
        "วิธีแยกเลขบัตรประชาชนไทยออกจากตัวเลข 13 หลักทั่วไปอย่างแม่นยำคือการตรวจ **หลักตรวจสอบ (Check Digit)** ที่หลักที่ 13 ตามสูตรมาตรฐานของกรมการปกครอง: นำ 12 หลักแรกคูณน้ำหนัก `13` ลงไปถึง `2` รวมกัน หารเอาเศษด้วย `11` แล้วคำนวณ `(11 - (sum % 11)) % 10` ต้องตรงกับหลักที่ 13 เป๊ะ",
      ],
      analogy: "เหมือนเครื่องตรวจธนบัตรที่ไม่ดูแค่ว่า \"กระดาษสีแดง\" (ครบ 13 หลัก) แต่ส่องลายน้ำด้วย (checksum) จึงไม่เผลอริบใบปลิวสีแดงของลูกค้า",
      code: {
        language: "python",
        filename: "thai_id_check.py",
        code: `import re


def is_valid_thai_national_id(raw: str) -> bool:
    """ตรวจสอบเลขบัตรประชาชนไทย 13 หลักด้วยอัลกอริทึม Check Digit"""
    digits = re.sub(r"[\\s-]", "", raw)
    if len(digits) != 13 or not digits.isdigit():
        return False
    # เลขบัตรไทยไม่ขึ้นต้นด้วย 0 หรือ 9 ในรูปแบบปกติ (1-8)
    if digits[0] == "0":
        return False
    weighted_sum = sum(int(digits[i]) * (13 - i) for i in range(12))
    check_digit = (11 - (weighted_sum % 11)) % 10
    return check_digit == int(digits[12])


print("Valid ID (1-1007-00123-45-5):", is_valid_thai_national_id("1-1007-00123-45-5"))
print("Valid ID (1234567890121):    ", is_valid_thai_national_id("1234567890121"))
print("EAN-13 Barcode (8850123456789):", is_valid_thai_national_id("8850123456789"))`,
        caption: "เลขบาร์โค้ดไทย `8850123456789` ไม่ผ่าน checksum จึงไม่ถูกปิดบังผิดพลาด",
      },
      whyTitle: "Why this matters — Guardrail ที่ False Positive สูงจะถูกทีมปิดทิ้ง",
      whyParagraphs: [
        "ในระบบจริง ถ้า PII redactor ปิดบังรหัสสินค้าหรือเลขใบแจ้งหนี้ของลูกค้าไปหมด ทีมธุรกิจจะขอปิดฟีเจอร์นี้ทันทีเพื่อไม่ให้ลูกค้าใช้งานไม่ได้",
        "การใช้ `regex` จับ candidate (รองรับทั้งติดกันและมีขีด/ช่องว่าง) แล้วกรองซ้ำด้วย `is_valid_thai_national_id` ให้ทั้งความเร็วสูงและความแม่นยำระดับ production",
      ],
    },
    {
      id: "redaction-and-audit-log",
      title: "3 · Redaction Placeholder และ Audit Log ที่ปลอด Raw PII",
      paragraphs: [
        "เมื่อตรวจพบ PII เราแทนที่ด้วย placeholder ที่ระบุชนิดและลำดับ เช่น `[THAI_ID_1]`, `[PHONE_1]`, `[EMAIL_1]`, `[PERSON_1]` ข้อดีของการคงประเภทและลำดับไว้คือ {{llm}} ยังเข้าใจบริบทประโยคได้ครบ (เช่น รู้ว่าผู้ใช้ให้เบอร์โทรมาแล้วและอ้างถึงบุคคลคนเดิม) โดยไม่เห็นข้อมูลจริงเลย",
        "ส่วน **Audit Log** ที่ส่งเข้า {{structlog}} หรือระบบ monitoring ต้องบันทึกเฉพาะร่องรอยที่ตรวจสอบย้อนหลังได้โดย **ห้ามเก็บ raw PII**: เก็บ `request_id`, `timestamp_utc`, `redacted_text`, `entity_counts` (เช่น `{\"THAI_ID\": 1, \"PHONE\": 1}`) และ `redaction_applied: bool` (หากจำเป็นต้องสืบค้นซ้ำเฉพาะฝ่าย security ค่อยเก็บ salted SHA-256 hash ในพื้นที่จำกัดสิทธิ์แยกต่างหาก)",
      ],
      analogy: "เหมือนสมุดลงเวลารปภ. ที่บันทึกว่า \"14:05 น. ตรวจพบและปิดบังเลขบัตร 1 รายการ, เบอร์โทร 1 รายการ (รหัสคำขอ REQ-901)\" โดยไม่ได้จดเลขบัตรจริงของลูกค้าลงในสมุด",
      bullets: [
        "**ลำดับการสแกนสำคัญ** — ตรวจเลขบัตรประชาชน 13 หลัก **ก่อน** เบอร์โทรศัพท์ 10 หลัก เพื่อไม่ให้ regex เบอร์โทรไปตัดกินเลข 10 หลักข้างในเลขบัตรประชาชน",
        "**ห้ามส่ง `mapping` dict เข้า LLM หรือ Log** — เก็บ mapping ไว้เฉพาะในหน่วยความจำชั่วคราว (in-memory per-request) หากต้อง re-hydrate คำตอบ แล้วทิ้งทันทีหลังตอบกลับ",
        "**ใช้ Pydantic บังคับรูปแบบ Audit Record** — ป้องกันนักพัฒนาเผลอโยน `raw_text` เข้าไปใน object ที่จะถูก serialize ลง log",
      ],
      whyTitle: "Why this matters — พิสูจน์การปฏิบัติตาม PDPA ได้จริงเมื่อถูกตรวจสอบ",
      whyParagraphs: [
        "เมื่อทีม Security หรือผู้ตรวจสอบ (Auditor) ถามว่า \"มั่นใจได้อย่างไรว่าไม่มีเลขบัตรลูกค้าหลุดไปที่ OpenAI หรือค้างใน Langfuse?\" คุณสามารถแสดง middleware ที่ทำงานเป็นด่านแรก คู่กับ Audit Log และชุดเทสต์อัตโนมัติใน CI เป็นหลักฐานเชิงประจักษ์ได้ทันที",
        "ใน Capstone (D173) เราจะนำ middleware ตัวนี้ไปเสียบเข้ากับ FastAPI API จาก D137 เพื่อให้ทุกคำขอผ่านการคัดกรอง PDPA โดยอัตโนมัติ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — PDPA Redaction Middleware ≈ Express/Next.js Sanitizer Middleware",
      body: [
        "แนวคิดเดียวกับที่คุณเคยทำ sanitizer/masking รหัสผ่านหรือเลขบัตรเครดิตก่อนส่งลง Sentry หรือ Winston log แต่ยกระดับมาดูแลข้อความอิสระ (free text) ภาษาไทยก่อนเข้า LLM:",
      ],
      table: [
        ["PII Redaction Middleware", "Express / Hono request sanitizer middleware"],
        ["Thai ID Checksum (mod 11)", "Luhn algorithm สำหรับตรวจเลขบัตรเครดิตก่อน mask"],
        ["Sanitized Audit Log (Pydantic)", "Pino / Winston redact config ที่ตัด sensitive fields"],
        ["Redaction-First before Langfuse", "Sentry `beforeSend` hook ที่ลบ PII ก่อนส่ง trace"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Masking/Redaction ถึงดีกว่าการเข้ารหัสเฉย ๆ เวลาส่งให้ LLM?",
      body: [
        "บางคนอาจคิดว่าส่งผ่าน HTTPS (เข้ารหัสระหว่างทาง) ก็น่าจะปลอดภัยแล้ว — ความจริงคือ HTTPS ป้องกันคนดักฟังกลางทางเท่านั้น แต่เมื่อข้อความถึงเซิร์ฟเวอร์ผู้ให้บริการ LLM ภายนอก ข้อความจะถูกถอดรหัสเป็นข้อความดิบเพื่อประมวลผล",
        "การทำ **Redaction** ก่อนส่งออกจึงทำให้ข้อมูลส่วนบุคคลไม่เคยออกจากเครื่อง/เซิร์ฟเวอร์ของเราตั้งแต่แรก ลดความเสี่ยงได้ถึงต้นตอ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ลูกค้าส่งข้อความแชตเข้ามาพร้อมเลขบัตรประชาชน เบอร์มือถือ อีเมล ชื่อ และเลขบาร์โค้ดสินค้า 13 หลัก เราจะรัน PDPA Redactor เพื่อปิดบังเฉพาะ PII จริง (ปล่อยบาร์โค้ดไว้) และสร้าง Audit Log ที่ปลอด raw PII",
    steps: [
      {
        title: "1 · สร้างตัวตรวจ Checksum เลขบัตรไทยและรูปแบบ PII",
        explain:
          "ใช้ regex แบบมีขอบเขตตัวเลข (`(?<!\\d)...(?!\\d)`) เพื่อจับชุดตัวเลขครบจำนวน และกรองเลขบัตรประชาชนด้วย `is_valid_thai_id`",
        code: {
          language: "python",
          filename: "worked_pdpa.py",
          code: `import re
from datetime import datetime, timezone
from pydantic import BaseModel, Field

THAI_ID_RE = re.compile(r"(?<!\\d)([1-8](?:[\\s-]?\\d){12})(?!\\d)")
THAI_PHONE_RE = re.compile(
    r"(?<!\\d)(?:\\+66[\\s-]?|0)(?:[689]\\d(?:[\\s-]?\\d){7}|2(?:[\\s-]?\\d){7})(?!\\d)"
)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}")
THAI_NAME_RE = re.compile(r"(?:นาย|นางสาว|นาง|คุณ)\\s*[ก-๙]{2,}(?:\\s+[ก-๙]{2,})?")


def is_valid_thai_id(candidate: str) -> bool:
    digits = re.sub(r"[\\s-]", "", candidate)
    if len(digits) != 13 or not digits.isdigit() or digits[0] == "0":
        return False
    total = sum(int(digits[i]) * (13 - i) for i in range(12))
    return ((11 - (total % 11)) % 10) == int(digits[12])


class AuditLogRecord(BaseModel):
    request_id: str
    timestamp_utc: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    redaction_applied: bool
    entity_counts: dict[str, int]
    sanitized_preview: str`,
        },
        output: `# รูปแบบ regex, checksum และ AuditLogRecord schema พร้อมใช้งาน`,
      },
      {
        title: "2 · ฟังก์ชัน Redact ตามลำดับที่ปลอดภัยและออก Audit Record",
        explain:
          "สแกนตามลำดับ `THAI_ID` → `PHONE` → `EMAIL` → `PERSON` เพื่อให้เลขบัตร 13 หลักถูกจัดการก่อนเบอร์โทร 10 หลัก และสร้าง `AuditLogRecord` จากข้อความที่ปิดบังแล้วเท่านั้น",
        code: {
          language: "python",
          filename: "worked_pdpa.py",
          code: `def redact_thai_pii(text: str, request_id: str) -> tuple[str, AuditLogRecord]:
    counts: dict[str, int] = {}

    def next_tag(kind: str) -> str:
        counts[kind] = counts.get(kind, 0) + 1
        return f"[{kind}_{counts[kind]}]"

    def replace_id(match: re.Match[str]) -> str:
        raw = match.group(1)
        return next_tag("THAI_ID") if is_valid_thai_id(raw) else raw

    redacted = THAI_ID_RE.sub(replace_id, text)
    redacted = THAI_PHONE_RE.sub(lambda _: next_tag("PHONE"), redacted)
    redacted = EMAIL_RE.sub(lambda _: next_tag("EMAIL"), redacted)
    redacted = THAI_NAME_RE.sub(lambda _: next_tag("PERSON"), redacted)

    audit = AuditLogRecord(
        request_id=request_id,
        redaction_applied=bool(counts),
        entity_counts=counts,
        sanitized_preview=redacted[:120],
    )
    return redacted, audit`,
        },
        output: `# พร้อมสแกนข้อความจริงในขั้นที่ 3`,
      },
      {
        title: "3 · ทดสอบกับข้อความที่มีทั้ง PII จริงและบาร์โค้ด 13 หลัก",
        explain:
          "สังเกตว่าเลขบัตรประชาชน `1-1007-00123-45-5`, เบอร์โทร, อีเมล และชื่อถูกปิดบังทั้งหมด แต่บาร์โค้ดสินค้า `8850123456789` ยังอยู่ครบเพื่อให้ RAG ค้นสินค้าได้ต่อ",
        code: {
          language: "python",
          filename: "worked_pdpa.py",
          code: `raw_message = (
    "สวัสดีครับ คุณสมชาย ใจดี เลขบัตร 1-1007-00123-45-5 "
    "โทร 081-234-5678 อีเมล somchai@example.co.th "
    "ขอเช็กสินค้าบาร์โค้ด 8850123456789 หน่อยครับ"
)

safe_text, audit_record = redact_thai_pii(raw_message, request_id="REQ-2026-01")
print("SAFE FOR LLM:", safe_text)
print("AUDIT LOG:", audit_record.model_dump_json())`,
        },
        output: `SAFE FOR LLM: สวัสดีครับ [PERSON_1] เลขบัตร [THAI_ID_1] โทร [PHONE_1] อีเมล [EMAIL_1] ขอเช็กสินค้าบาร์โค้ด 8850123456789 หน่อยครับ
AUDIT LOG: {"request_id":"REQ-2026-01","timestamp_utc":"2026-11-22T14:45:00+00:00","redaction_applied":true,"entity_counts":{"THAI_ID":1,"PHONE":1,"EMAIL":1,"PERSON":1},"sanitized_preview":"สวัสดีครับ [PERSON_1] เลขบัตร [THAI_ID_1] โทร [PHONE_1] อีเมล [EMAIL_1] ขอเช็กสินค้าบาร์โค้ด 8850123456789 หน่อยครับ"}`,
      },
    ],
    gotcha:
      "จุดสังเกตสำคัญ: ถ้าเผลอเอา `THAI_PHONE_RE` รัน **ก่อน** `THAI_ID_RE` เลขบัตรที่พิมพ์ติดกันอย่าง `1081234567890` อาจถูกจับช่วง `0812345678` เป็นเบอร์โทรเสียก่อนจนเลขบัตรพังและหลุดการตรวจ checksum!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `pdpa_middleware.py` สำหรับตรวจจับและปกปิดข้อมูลส่วนบุคคลไทย (เลขบัตรประชาชนพร้อม checksum, เบอร์โทรไทย, อีเมล) พร้อมสร้าง `PdpAuditEvent` ที่รับประกันว่าไม่มี raw PII หลุดเข้าสู่ LLM หรือระบบล็อก",
    requirements: [
      "เขียน `is_valid_thai_id(raw: str) -> bool` ที่ตัดช่องว่าง/ขีดออก ตรวจความยาว 13 หลัก (ไม่ขึ้นต้นด้วย `0`) และคำนวณ check digit ด้วยสูตร `(11 - (sum(d[i]*(13-i)) % 11)) % 10`",
      "สร้าง Pydantic model `PdpAuditEvent` ที่มีฟิลด์ `request_id: str`, `redacted: bool`, `counts: dict[str, int]`, `sanitized_text: str`",
      "เขียน `redact_for_ai(text: str, request_id: str) -> tuple[str, PdpAuditEvent]` ที่ปิดบังตามลำดับ `THAI_ID` (เฉพาะที่ผ่าน checksum) → `PHONE` (มือถือไทย `06/08/09` 10 หลัก, `+66` หรือ `02` 9 หลัก) → `EMAIL` ด้วยแท็ก `[THAI_ID_1]`, `[PHONE_1]`, `[EMAIL_1]` ตามลำดับที่พบ",
      "รับประกันว่าตัวเลข 13 หลักที่ไม่ผ่าน checksum (เช่น บาร์โค้ด `8850123456789`) จะไม่ถูกปิดบัง และข้อความใน `PdpAuditEvent.sanitized_text` ต้องตรงกับข้อความที่ปิดบังแล้วเสมอ",
    ],
    starter: {
      language: "python",
      filename: "pdpa_middleware.py",
      code: `import re
from pydantic import BaseModel


class PdpAuditEvent(BaseModel):
    request_id: str
    redacted: bool
    counts: dict[str, int]
    sanitized_text: str


def is_valid_thai_id(raw: str) -> bool:
    # TODO: ตรวจเลขบัตรประชาชนไทย 13 หลักพร้อม check digit
    raise NotImplementedError


def redact_for_ai(text: str, request_id: str) -> tuple[str, PdpAuditEvent]:
    # TODO: ปกปิด THAI_ID (ผ่าน checksum), PHONE (ไทย), EMAIL ตามลำดับ และคืน (safe_text, audit)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_pdpa_middleware.py",
      code: `from pdpa_middleware import PdpAuditEvent, is_valid_thai_id, redact_for_ai


def test_thai_id_checksum_validation():
    assert is_valid_thai_id("1-1007-00123-45-5") is True
    assert is_valid_thai_id("1234567890121") is True
    assert is_valid_thai_id("1234567890129") is False  # bad check digit
    assert is_valid_thai_id("8850123456789") is False  # EAN-13 barcode
    assert is_valid_thai_id("0100700123455") is False  # starts with 0


def test_redact_thai_pii_and_preserve_barcode():
    raw = (
        "เลขบัตร 1-1007-00123-45-5 เบอร์ 081-234-5678 หรือ +66 92 111 2222 "
        "อีเมล user.th@company.co.th รหัสบาร์โค้ด 8850123456789"
    )
    safe, audit = redact_for_ai(raw, request_id="REQ-100")

    assert isinstance(audit, PdpAuditEvent)
    assert audit.request_id == "REQ-100"
    assert audit.redacted is True
    assert audit.counts == {"THAI_ID": 1, "PHONE": 2, "EMAIL": 1}
    assert "1-1007-00123-45-5" not in safe
    assert "081-234-5678" not in safe
    assert "user.th@company.co.th" not in safe
    assert "[THAI_ID_1]" in safe
    assert "[PHONE_1]" in safe and "[PHONE_2]" in safe
    assert "[EMAIL_1]" in safe
    # บาร์โค้ดต้องไม่ถูกปิดบังผิดพลาด
    assert "8850123456789" in safe
    # Audit log ต้องไม่มี raw PII
    assert audit.sanitized_text == safe


def test_clean_message_not_marked_redacted():
    raw = "ขอทราบเวลาทำการของสาขาสีลมครับ"
    safe, audit = redact_for_ai(raw, request_id="REQ-101")
    assert safe == raw
    assert audit.redacted is False
    assert audit.counts == {}


def test_thai_id_containing_phone_like_digits_not_corrupted():
    # เลขบัตร 13 หลักที่ถูกต้องและมีชุดตัวเลขคล้าย 08... อยู่ข้างใน
    raw = "บัตรประชาชน 1100700123455"
    safe, audit = redact_for_ai(raw, request_id="REQ-102")
    assert safe == "บัตรประชาชน [THAI_ID_1]"
    assert audit.counts == {"THAI_ID": 1}
`,
    },
    selfCheck: [
      "`is_valid_thai_id` รับได้ทั้งรูปแบบติดกัน (`1234567890121`) และมีขีด/ช่องว่าง (`1-1007-00123-45-5`) และปฏิเสธเลขที่ checksum ผิดหรือขึ้นต้นด้วย `0`",
      "รัน redaction ของ `THAI_ID` ก่อน `PHONE` เพื่อไม่ให้เบอร์โทรไปตัดกินบางส่วนของเลขบัตร",
      "เลขบาร์โค้ด `8850123456789` ไม่ถูกปิดบัง (zero false positive บนเคสทดสอบ)",
      "`PdpAuditEvent` เก็บเฉพาะ `sanitized_text` และ `counts` ไม่มี raw PII ปะปน",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านครบทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ใน `test_pdpa_middleware.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `is_valid_thai_id` ให้ใช้ `re.sub(r\"[\\s-]\", \"\", raw)` เพื่อเหลือเฉพาะตัวเลขก่อน แล้วเช็ก `len(digits) == 13`, `digits.isdigit()`, `digits[0] != \"0\"` ก่อนคำนวณผลรวมถ่วงน้ำหนัก `13..2`",
      },
      {
        body: "ใช้ฟังก์ชัน callback กับ `THAI_ID_RE.sub(replace_id, text)` เพื่อตรวจ `is_valid_thai_id(m.group(1))` ทีละ match ถ้าผ่านค่อยสร้างแท็ก `[THAI_ID_k]` ถ้าไม่ผ่านให้คืน `m.group(0)` กลับไปเหมือนเดิม",
      },
      {
        body: "โครงของ regex และ `is_valid_thai_id` พร้อมแล้ว — นำไปประกอบเข้ากับ `redact_for_ai` และสร้าง `PdpAuditEvent`",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `THAI_ID_RE = re.compile(r"(?<!\\d)([1-8](?:[\\s-]?\\d){12})(?!\\d)")
THAI_PHONE_RE = re.compile(
    r"(?<!\\d)(?:\\+66[\\s-]?|0)(?:[689]\\d(?:[\\s-]?\\d){7}|2(?:[\\s-]?\\d){7})(?!\\d)"
)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}")


def is_valid_thai_id(raw: str) -> bool:
    digits = re.sub(r"[\\s-]", "", raw)
    if len(digits) != 13 or not digits.isdigit() or digits[0] == "0":
        return False
    total = sum(int(digits[i]) * (13 - i) for i in range(12))
    return ((11 - (total % 11)) % 10) == int(digits[12])`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# วาง pdpa_middleware.py และ test_pdpa_middleware.py ในโฟลเดอร์ pdpa-guard-lab/
uv run pytest -q
uv run ruff check .`,
      caption: "สามารถนำฟังก์ชันนี้ไปใช้ต่อเป็น FastAPI middleware ใน Capstone D173 ได้โดยตรง",
    },
  },

  mistakes: [
    {
      title: "Redact ก่อนส่ง LLM แต่ลืม Redact ก่อนเขียน Log / Langfuse Trace",
      symptom: "API ขาออกสะอาดแล้ว แต่เมื่อเปิดดู structlog หรือ Langfuse dashboard ยังเห็นเลขบัตรประชาชนและเบอร์โทรลูกค้าครบทุกตัว",
      fix: "วาง PII Redaction เป็นด่านแรกสุดที่รับ input แล้วส่งเฉพาะ `sanitized_text` ไปยังทั้ง LLM API และ observability/logging layer",
    },
    {
      title: "ใช้ `\\d{13}` จับเลขบัตรประชาชนโดยไม่ตรวจ Checksum",
      symptom: "ระบบเผลอปิดบังเลขบาร์โค้ด EAN-13, เลขพัสดุ หรือรหัสอ้างอิงธนาคารของลูกค้าจน AI ตอบคำถามงานหลักไม่ได้",
      fix: "ตรวจสอบหลักตรวจสอบ (Check Digit mod 11) เสมอ และเพิ่มเคสบาร์โค้ด/เลขออเดอร์ไว้ใน unit test เพื่อกัน regression",
    },
    {
      title: "รัน Regex เบอร์โทร 10 หลักก่อนเลขบัตรประชาชน 13 หลัก",
      symptom: "เลขบัตรประชาชนที่มีชุดตัวเลขขึ้นต้น `08` หรือ `06` ข้างในถูกตัดกลางลำกลายเป็น `[PHONE_1]` พร้อมเศษตัวเลขเหลืออยู่",
      fix: "เรียงลำดับการสแกนจากรูปแบบที่ยาวและเจาะจงกว่าไปหารูปแบบที่สั้นกว่า (`THAI_ID` → `PHONE` → `EMAIL` → `PERSON`) และใช้ boundary `(?<!\\d)...(?!\\d)`",
    },
    {
      title: "ฝากความหวังไว้ที่ System Prompt ว่า \"ห้ามบันทึกหรือเปิดเผยข้อมูลส่วนบุคคล\"",
      symptom: "เมื่อข้อมูลดิบถูกส่งออกไปใน prompt แล้ว แปลว่าข้อมูลได้รั่วออกจากองค์กรไปแล้ว และ LLM ยังอาจคายข้อมูลออกมาเมื่อเจอ prompt injection",
      fix: "การป้องกัน PDPA ต้องทำที่ชั้นโค้ด (deterministic middleware) ก่อนข้อมูลออกจากระบบ ไม่ใช่แค่ขอร้องโมเดลใน prompt",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d151-q1",
        "ลำดับการไหลของข้อมูลใน Production AI API ที่สอดคล้องกับ PDPA ควรเป็นอย่างไร?",
        [
          ["User Input → เขียนลง Langfuse/Log ดิบ → Redact PII → ส่งเข้า External LLM API", "ผิด — การเขียนข้อมูลดิบลง log/trace ก่อน redact ทำให้ PII ค้างอยู่ในระบบ observability"],
          ["User Input → PII Redaction Middleware → ส่งข้อความที่ปิดบังแล้วไปยังทั้ง External LLM API และ Observability/Audit Log", "ถูก — ป้องกันการรั่วไหลทั้งสองจุด (ผู้ให้บริการภายนอกและฐานข้อมูล log) พร้อมกันตั้งแต่ต้นทาง"],
          ["User Input → ส่งเข้า External LLM API พร้อมสั่งใน System Prompt ว่า \"ช่วยปิดเลขบัตรให้ด้วย\" → ตอบลูกค้า", "ผิด — เมื่อส่งข้อความดิบออกไปถึง API ภายนอก ข้อมูลส่วนบุคคลได้ออกนอกองค์กรไปแล้ว"],
          ["User Input → เข้ารหัสฐาน 64 (Base64) แล้วส่งเข้า LLM API", "ผิด — Base64 ไม่ใช่การปกปิดหรือเข้ารหัส แปลงกลับได้ทันทีและทำให้ LLM อ่านข้อความผิดเพี้ยน"],
        ],
        "B",
        "หลัก Redaction-First ต้องปิดบังข้อมูลส่วนบุคคลก่อนที่ข้อความจะถูกส่งออกนอกองค์กรและก่อนที่จะถูกบันทึกลง log หรือ trace ใด ๆ",
        "จุดใดใน pipeline ที่ต้องทำ PDPA PII Redaction?",
        "ทำเป็นด่านแรกสุด **ก่อน** ส่งออกไปยัง external LLM API และ **ก่อน** บันทึกลง log / Langfuse trace",
      ),
      mc(
        "d151-q2",
        "เหตุใดการตรวจเลขบัตรประชาชนไทย 13 หลักจึงควรคำนวณ Check Digit (`(11 - (sum % 11)) % 10`) เพิ่มเติมจาก Regex?",
        [
          ["เพื่อแปลงเลขบัตรประชาชนให้กลายเป็นเบอร์โทรศัพท์", "ไม่เกี่ยวกัน — Check Digit ใช้ยืนยันความถูกต้องตามโครงสร้างเลขบัตรไทย"],
          ["เพื่อลด False Positive จากตัวเลข 13 หลักอื่น เช่น บาร์โค้ดสินค้า EAN-13 หรือเลขอ้างอิงออเดอร์", "ถูก — ช่วยให้ระบบปิดบังเฉพาะเลขบัตรจริง โดยไม่ทำลายตัวเลขธุรกิจที่ลูกค้าจำเป็นต้องใช้ถาม AI"],
          ["เพราะ Python `re` ไม่สามารถจับตัวเลขที่ยาวเกิน 10 หลักได้", "ไม่จริง — `re` จับได้ไม่จำกัดความยาว แต่จับตามรูปแบบอย่างเดียวแยกบาร์โค้ดกับเลขบัตรไม่ได้"],
          ["เพื่อให้สามารถเดาชื่อจริงของเจ้าของบัตรจากตัวเลขได้", "ไม่จริง — Check Digit เป็นเพียงเลขตรวจสอบความถูกต้องทางคณิตศาสตร์"],
        ],
        "B",
        "เลขบัตรประชาชนไทยมีหลักตรวจสอบที่หลักที่ 13 การเช็กสูตร mod 11 ช่วยแยกเลขบัตรออกจากบาร์โค้ด 13 หลัก (เช่น `885...`) ได้อย่างแม่นยำ",
        "ทำไมต้องตรวจ Check Digit ของเลขบัตรประชาชนไทย 13 หลักเพิ่มจาก Regex?",
        "เพื่อลด False Positive ไม่ให้เผลอปิดบังเลข 13 หลักทางธุรกิจ เช่น บาร์โค้ด EAN-13 หรือเลขออเดอร์",
      ),
      mc(
        "d151-q3",
        "ข้อมูลใดที่ **ไม่ควร** เก็บไว้ใน Audit Log ของระบบ PII Redaction?",
        [
          ["`request_id` และ `timestamp_utc`", "ควรเก็บ — จำเป็นต่อการสืบค้นเหตุการณ์ย้อนหลัง"],
          ["จำนวนและประเภทของ PII ที่ตรวจพบ เช่น `{\"THAI_ID\": 1, \"PHONE\": 1}`", "ควรเก็บ — บอกได้ว่าด่านตรวจทำงานและพบเหตุการณ์กี่ครั้งโดยไม่เปิดเผยตัวตนลูกค้า"],
          ["ข้อความต้นฉบับที่มีเลขบัตรประชาชนและเบอร์โทรจริงของลูกค้า (`raw_text`) เพื่อไว้ดูย้อนหลังง่าย ๆ", "ถูก — การเก็บ raw PII ลง audit log เป็นการสร้างแหล่งข้อมูลรั่วไหลแห่งใหม่และขัดหลัก Data Minimization ของ PDPA"],
          ["ข้อความหลังปิดบังแล้ว (`sanitized_text`) ที่มี `[THAI_ID_1]`", "เก็บได้ปลอดภัย เพราะข้อมูลระบุตัวตนถูกแทนที่ด้วย placeholder แล้ว"],
        ],
        "C",
        "Audit Log ที่ดีต้องพิสูจน์ได้ว่าเกิดการคัดกรองจริงโดยไม่กลายเป็นคลังเก็บ PII เสียเอง จึงห้ามเก็บ `raw_text` หรือค่า PII ดิบลงไป",
        "PDPA Audit Log ควรเก็บอะไร และห้ามเก็บอะไร?",
        "เก็บ `request_id`, `timestamp`, `entity_counts`, `sanitized_text` — **ห้าม** เก็บ `raw_text` หรือค่า PII ดิบ",
      ),
      mc(
        "d151-q4",
        "หากข้อความมีเลขบัตรประชาชนไทย `1100700123455` แล้วเรารัน regex เบอร์โทร 10 หลักก่อน regex เลขบัตรประชาชน จะเสี่ยงเกิดปัญหาใด?",
        [
          ["ไม่มีปัญหา เพราะ regex เบอร์โทรไม่เคยจับตัวเลขภายในสตริงอื่น", "เสี่ยงเกิดปัญหาได้มากถ้าไม่ได้วางลำดับและ boundary อย่างรัดกุม โดยเฉพาะเมื่อเลขบัตรมีลำดับ `08/06/09` หรือ `02` อยู่ข้างใน"],
          ["regex เบอร์โทรอาจตัดกินบางส่วนของเลขบัตรไปก่อน ทำให้เลขบัตรที่เหลือไม่ครบ 13 หลักและหลุดการตรวจ checksum", "ถูก — จึงต้องสแกนรูปแบบที่ยาวและเฉพาะเจาะจงกว่า (`THAI_ID`) ก่อน (`PHONE`) และใช้ boundary `(?<!\\d)...(?!\\d)` เสมอ"],
          ["Python จะโยน `SyntaxError` ทันทีตอน compile regex", "ไม่เกิด SyntaxError แต่จะเกิดบั๊กเงียบที่ข้อมูลรั่วหรือถูกแทนที่ผิดประเภท"],
          ["ทำให้ checksum ของเลขบัตรประชาชนเปลี่ยนค่าจาก mod 11 เป็น mod 10", "สูตร checksum ไม่เปลี่ยน แต่ candidate ที่หลงเหลือไม่ครบ 13 หลักจึงไม่ถูกตรวจ"],
        ],
        "B",
        "การเรียงลำดับ pattern จากยาว/เจาะจงไปสั้น/กว้าง (`THAI_ID` → `PHONE` → `EMAIL`) ร่วมกับ digit boundary ช่วยป้องกันการทับซ้อนระหว่างรูปแบบตัวเลข",
        "ทำไมต้องสแกน `THAI_ID` ก่อน `PHONE` ใน PII Redactor?",
        "ป้องกัน regex เบอร์โทรไปตัดกินช่วงตัวเลขกลางเลขบัตร 13 หลัก จนเลขบัตรไม่ครบหลักและหลุดการตรวจ",
      ),
    ],
  },

  takeaways: [
    "**Redaction-First ทั้งสองจุด**: ปกปิด PII ก่อนส่งออกไปยัง external LLM API **และ** ก่อนบันทึกลง `structlog` / `Langfuse`",
    "**ใช้ Checksum แยกเลขบัตรไทย 13 หลัก** ออกจากบาร์โค้ดและเลขออเดอร์ เพื่อลด False Positive ให้ต่ำที่สุด",
    "**เรียงลำดับ pattern ให้ถูกต้อง** (`THAI_ID` → `PHONE` → `EMAIL` → `PERSON`) และใช้ digit boundary เพื่อกันการจับซ้อนทับ",
    "**Audit Log ต้องปลอด Raw PII** บันทึกเฉพาะ `request_id`, `timestamp`, `entity_counts` และ `sanitized_text` เพื่อพิสูจน์การปฏิบัติตาม PDPA ได้จริง",
  ],

  reviewCards: [
    rc(
      "d151-rc-1",
      "สูตรตรวจสอบ Check Digit ของเลขบัตรประชาชนไทย 13 หลักคำนวณอย่างไร?",
      "นำ 12 หลักแรกคูณน้ำหนัก 13 ลงไปถึง 2 แล้วรวมกัน (`total`) จากนั้นตรวจว่า `(11 - (total % 11)) % 10 == int(d[12])`",
    ),
    rc(
      "d151-rc-2",
      "สองจุดรั่วไหลหลักของ PII ในแอป AI ที่ต้องวาง Redaction ดักไว้ก่อนคือจุดไหนบ้าง?",
      "1) ขาออกไปยัง External LLM / Embedding API และ 2) ขาลงระบบ Observability / Logging (`structlog`, `Langfuse` traces)",
    ),
    rc(
      "d151-rc-3",
      "ทำไมจึงไม่ควรพึ่งแค่ System Prompt ในการป้องกันการรั่วไหลของข้อมูลตาม PDPA?",
      "เพราะเมื่อส่งข้อความดิบออกไปถึง external API ข้อมูลก็รั่วออกนอกองค์กรไปแล้ว และ LLM ยังถูกหลอกด้วย Prompt Injection ได้ ต้องปกปิดที่ชั้นโค้ดก่อนส่งออกเสมอ",
    ),
  ],

  sources: [
    { label: "OWASP Top 10 for LLM Applications — LLM02: Sensitive Information Disclosure", href: "https://genai.owasp.org/llm-top-10/" },
    { label: "Langfuse Docs — Masking & Sensitive Data Redaction in Traces", href: "https://langfuse.com/docs/security-and-compliance/masking" },
    { label: "Python Official Docs — Regular Expression Operations (`re`)", href: "https://docs.python.org/3/library/re.html" },
    { label: "Pydantic v2 Official Documentation — Models & Serialization", href: "https://docs.pydantic.dev/latest/concepts/models/" },
  ],

  glossary: ["pdpa", "guardrails", "pydantic", "structlog", "langfuse", "prompt-injection", "rag", "pytest"],
});
