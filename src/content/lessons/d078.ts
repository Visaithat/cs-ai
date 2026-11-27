import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D078 — Phase 3 / Block B20
 * Validation-Repair Loop & Deterministic Fallbacks
 */
export const d078: Lesson = defineLesson({
  day: 78,
  titleTh: "ลูปซ่อมผลลัพธ์ด้วย Error Feedback (Validation-Repair Loop) และ Deterministic Fallback",
  tagline: "30 นาที · รันลูปซ่อมและเทสต์บนเครื่องได้ 100% ด้วย mock client · ดันอัตราผ่าน schema จาก ~84% สู่ 99%+ อย่างปลอดภัย",
  icon: "refresh-cw",
  visual: {
    id: "validation-repair-loop",
    title: "Validation-Repair Loop — จาก 84% สู่ 99%+ ด้วย Error Feedback + Fallback",
    caption: "กดเดินทีละรอบเพื่อดูการส่งข้อความ ValidationError กลับให้โมเดลแก้ตัวเอง และการตัดจบด้วย Deterministic Fallback",
    alt: "แผนภาพ Validation-Repair Loop และ Deterministic Fallback",
  },
  requiresApiKey: true,
  apiKeyNote: "ทดสอบและรันลูป repair/routing/cache บนเครื่องได้ 100% ด้วย mock client",
  tools: ["Official SDK", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "Strict Schema ป้องกัน JSON พัง แต่ไม่กันความผิดพลาดเชิงกฎธุรกิจ",
      body: "แม้จะเปิด {{structured-output}} แบบเข้มงวดแล้ว {{llm}} ยังอาจสกัดปี พ.ศ. ไทย (`2569-05-10`) แทน ค.ศ., คำนวณ `subtotal + vat != total`, หรือพลาดเงื่อนไขส่งตรวจจากเอกสารที่ซับซ้อน",
      lessonNote: "วันนี้เราจับความผิดพลาดเชิงความหมายจาก {{pydantic}} แล้วส่งข้อความสั้น ๆ กลับไปให้โมเดลซ่อมตัวเอง",
    },
    {
      node: 3,
      heading: "เปลี่ยน ValidationError ให้เป็นสัญญาณซ่อมแซมที่วัดผลได้",
      body: "แทนที่จะทิ้งคำตอบที่พังหรือสุ่มเรียกซ้ำแบบมั่ว ๆ การส่ง {{validation-error}} แบบย่อเฉพาะชื่อฟิลด์และเหตุผลกลับไปช่วยให้โมเดลแก้จุดผิดได้แม่นยำใน 1–2 รอบ",
      lessonNote: "เราจะวัดความต่างระหว่าง First-Pass Valid Rate กับ Repaired Valid Rate ด้วย mock client ใน {{pytest}}",
    },
    {
      node: 4,
      heading: "ตัดจบอย่างปลอดภัยด้วย Deterministic Fallback ไม่ให้แอปพังกลางอากาศ",
      body: "เมื่อครบเพดาน `max_retries=2` แล้วยังไม่ผ่าน ระบบต้อง {{fail-fast|ตัดจบอย่างมีขอบเขต}} ไม่วนลูปไม่รู้จบและไม่โยน 500 ใส่ผู้ใช้ แต่คืนอ็อบเจกต์ fallback ที่มี `needs_human_review=True` เพื่อส่งเข้าคิว {{hitl}}",
      lessonNote: "โค้ดปลายทางจะได้รับสัญญาข้อมูลที่คาดเดาได้ 100% ทุกครั้ง ไม่ว่าเอกสารต้นฉบับจะเละแค่ไหน",
    },
    {
      node: 5,
      heading: "บันทึกทุกการซ่อมและ Fallback เพื่อไล่แก้ต้นเหตุของ Prompt",
      body: "การเก็บล็อกจำนวนรอบซ่อมและสาเหตุ error ด้วย {{structlog}} ช่วยให้ทีมรู้ทันทีว่าฟิลด์ไหนพังบ่อย (เช่น วันที่ พ.ศ.) เพื่อนำไปปรับคำสั่งใน prompt หรือ schema รอบถัดไป",
      lessonNote: "สถิติ `repaired` และ `fallback` ของวันนี้คือฐานสำคัญของระบบเฝ้าระวังคุณภาพใน Phase 5",
    },
  ],

  objectives: [
    "**อธิบายความต่าง** ระหว่างความล้มเหลวระดับโครงสร้าง (JSON Syntax) กับความล้มเหลวระดับความหมาย/กฎธุรกิจ (Semantic & Cross-Field Validation) และแยกออกจาก network retry ({{exponential-backoff}})",
    "**สร้าง** Bounded Validation-Repair Loop (`max_retries=2`) ที่ย่อ {{validation-error}} ของ {{pydantic}} เป็นข้อความ feedback สั้น กระชับ แล้วส่งกลับให้ {{llm}} ซ่อมตัวเอง",
    "**ออกแบบ** Deterministic Safe Fallback ที่คืนผลลัพธ์แบบ type-safe พร้อม `needs_human_review=True` และประวัติ error แทนการ crash หรือวนลูปไม่รู้จบ",
  ],

  prerequisites: [
    "Strict JSON Schema และ `@model_validator` ใน {{pydantic}} v2 (Day 77 & Day 3)",
    "แนวคิด Retry กับ {{exponential-backoff}} สำหรับ HTTP error (Day 14)",
    "การเขียนเทสต์ด้วย {{pytest}} และ {{mocking}} (Day 10)",
    "ทดสอบและรันลูป repair บนเครื่องได้ 100% ด้วย mock client โดยไม่ต้องใช้ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์เบา ๆ ด้วย {{uv}} พร้อม `pydantic` และ `pytest` เพื่อทดลองสร้าง Validation-Repair Loop และ Fallback แบบออฟไลน์ 100%",
    commands: `uv init ai-day78 && cd ai-day78
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('Day 78 Ready | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day78` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันเช็กเวอร์ชัน Pydantic v2 เรียบร้อย (ใช้ mock client ไม่ต้องใช้ API key)"],
    ],
    note: "โครงสร้าง `llm_fn(messages) -> str` ที่เราออกแบบวันนี้รองรับการเสียบ Official OpenAI/Anthropic SDK ได้ทันทีเมื่อต้องการยิง API จริง",
  },

  concepts: [
    {
      id: "semantic-failures-beyond-json",
      title: "1 · ทำไม Strict JSON Schema ยังพังได้ ~10–16% บนเอกสารภาษาไทยจริง",
      paragraphs: [
        "ใน Day 77 เราเห็นแล้วว่า {{structured-output}} (Constrained Decoding) ช่วยรับประกันโครงสร้าง JSON ได้เกือบ 100% แต่เมื่อนำไปรันกับใบแจ้งหนี้ อีเมล หรือแชตลูกค้าไทยจริง อัตราผ่านด่านแรก (First-Pass Valid Rate) มักอยู่ราว **82%–90%** ไม่ใช่ 100%",
        "สาเหตุคือความผิดพลาดระดับ **ความหมายและกฎธุรกิจ (Semantic Failures)** ที่ JSON Schema แสดงออกไม่ได้ เช่น ใบกำกับภาษีไทยระบุวันที่ *\"15/05/2569\"* แล้วโมเดลแปลงเป็น `\"2569-05-15\"` (ปี พ.ศ. ไม่ใช่ ค.ศ.), สกัดตัวเลข `subtotal = 1000`, `vat = 70` แต่พลาดใส่ `total = 1000`, หรือลืมตั้ง `needs_human_review = true` ในเคสมูลค่าสูง",
        "จุดสำคัญที่ต้องแยกให้ขาดจาก Day 14: **HTTP Retry ({{exponential-backoff}})** ใช้แก้ปัญหาเครือข่ายหรือ `429 Rate Limit` โดยส่ง payload เดิมซ้ำ แต่ **Validation-Repair Loop** ใช้แก้ปัญหาคำตอบผิดกฎธุรกิจ โดยต้องส่ง *ข้อมูลใหม่* คือข้อความบอกว่าผิดตรงไหนกลับไปให้โมเดลแก้!",
      ],
      analogy: "HTTP Retry เหมือนโทรสายหลุดแล้วกดโทรซ้ำเบอร์เดิม แต่ Validation-Repair Loop เหมือนส่งแบบฟอร์มเบิกเงินให้พนักงาน แล้วฝ่ายบัญชีวงปากกาแดงส่งคืนว่า \"ช่องยอดรวมบวก VAT ผิด 70 บาท และปีต้องเป็น ค.ศ.\" เพื่อให้แก้ตรงจุดแล้วส่งมาใหม่",
      bullets: [
        "**วันที่ไทย (พ.ศ. vs ค.ศ.)**: เอกสารไทยมักใช้ปี 2568–2569 แต่ฐานข้อมูลต้องการ ISO `2025–2026`",
        "**สมการบัญชีข้ามฟิลด์**: `subtotal + vat_amount != total_amount` หรือผลรวมรายการสินค้าไม่ตรงยอดก่อนภาษี",
        "**กฎนโยบายองค์กร**: เคสมูลค่าสูงหรือความเสี่ยงสูงต้องตั้ง flag ส่งตรวจโดยคน ({{hitl}})",
      ],
      whyTitle: "Why this matters — สั่งยิงซ้ำแบบไม่บอกจุดผิดแทบไม่ช่วยให้ผ่าน",
      whyParagraphs: [
        "เมื่อตั้ง `temperature=0.0` เพื่อให้ผลลัพธ์นิ่ง หากคุณแค่ส่ง prompt เดิมซ้ำโดยไม่แนบข้อผิดพลาด โมเดลจะตอบผิดแบบเดิมซ้ำอีกครั้ง ทำให้เสียเงินและ latency เปล่า",
        "การแนบ error feedback ที่ชี้ชัดว่าฟิลด์ไหนผิดและกฎที่ถูกต้องคืออะไร มักช่วยซ่อมเคสที่พลาดรอบแรกให้ผ่านได้กว่า 80–90% ในการลองซ้ำเพียง 1–2 รอบ",
      ],
    },
    {
      id: "bounded-repair-loop",
      title: "2 · ออกแบบ Bounded Validation-Repair Loop และย่อ Error Feedback ให้คม",
      paragraphs: [
        "หัวใจของ **Validation-Repair Loop** มีกฎเหล็ก 3 ข้อ: (1) **ต้องมีเพดานจำนวนรอบชัดเจน** เช่น `max_retries = 2` (รวมลองทั้งหมดไม่เกิน 3 ครั้ง) ห้ามใช้ `while True` เด็ดขาด เพราะหากเอกสารต้นฉบับมีข้อมูลขัดแย้งในตัวเอง โมเดลจะวนซ่อมจนค่า API บานและ request ค้าง",
        "(2) **ย่อ {{validation-error}} ให้สั้นและชี้เป้าตรงจุด** แทนที่จะคัดลอก stacktrace Python ยาว 40 บรรทัดหรือ Pydantic URL dump เข้าไป ให้แปลง `err.errors()` เป็นบรรทัดสั้น ๆ รูปแบบ `- field: reason` เพื่อประหยัด token และไม่ทำให้โมเดลสับสน",
        "(3) **แนบคำตอบเก่าที่ผิด + รายการจุดผิดเป็นข้อความรอบถัดไป** (`assistant` ส่ง JSON เดิม → `user` ส่งรายการจุดผิดและสั่งให้คืน JSON ฉบับแก้ไขเท่านั้น) พร้อมคุม `temperature=0.0`",
      ],
      analogy: "เวลาโค้ดรีวิวให้เพื่อนร่วมทีม การคอมเมนต์สั้น ๆ ว่า \"บรรทัด 12: เปลี่ยนปี พ.ศ. เป็น ค.ศ. และบวก VAT 7% ให้ตรงยอดรวม\" แก้จบใน 1 นาที — ดีกว่าส่งไฟล์ log ยาว 500 บรรทัดที่หาจุดผิดไม่เจอ",
      code: {
        language: "python",
        filename: "error_feedback.py",
        code: `from pydantic import ValidationError


def format_concise_errors(err: ValidationError) -> str:
    """แปลง Pydantic ValidationError เป็นข้อความสั้น ชี้เป้าตรงจุดสำหรับส่งกลับให้ LLM."""
    lines: list[str] = []
    for item in err.errors():
        loc = ".".join(str(part) for part in item.get("loc", ())) or "__root__"
        msg = item.get("msg", "invalid value")
        lines.append(f"- {loc}: {msg}")
    return "\\n".join(lines)`,
        caption: "ส่งเฉพาะ path ของฟิลด์และเหตุผลที่ผิด ไม่ส่ง Python traceback หรือ URL ประกอบของ Pydantic เพื่อลด noise และประหยัด token",
      },
      whyTitle: "Why this matters — รอบซ่อมที่ 1–2 ให้ผลตอบแทนคุ้มที่สุด (Diminishing Returns)",
      whyParagraphs: [
        "จากประสบการณ์ใน production เคสที่ซ่อมได้จริงมักผ่านตั้งแต่ **Retry รอบที่ 1** (ดันจาก ~84% → ~97%) และ **Retry รอบที่ 2** (ดันสู่ ~99%+) หากยังพังในรอบที่ 3 มักแปลว่าต้นฉบับเอกสารคลุมเครือจริงหรือข้อมูลขาดหาย ไม่ใช่ความผิดพลาดชั่วคราวของโมเดล",
        "การจำกัด `max_retries = 2` จึงเป็นจุดสมดุลที่ดีที่สุดระหว่างอัตราผ่าน (reliability), เพดานเวลาตอบสนอง (P95 latency), และเพดานค่าใช้จ่าย",
      ],
    },
    {
      id: "deterministic-fallback",
      title: "3 · Deterministic Safe Fallback: เมื่อซ่อมไม่ผ่าน ต้องตัดจบอย่างสง่างาม",
      paragraphs: [
        "คำถามสำคัญของวิศวกร AI ระดับ production คือ *\"แล้วอีก 1% ที่ซ่อมครบ 2 รอบแล้วยังไม่ผ่านล่ะ จะให้ระบบทำอะไร?\"* คำตอบที่ไม่ดีคือปล่อย `ValidationError` พุ่งทะลุ API ออกไปเป็น `HTTP 500` หรือแย่กว่านั้นคือแอบเอา JSON ที่เลขผิดยัดลงฐานข้อมูล",
        "แนวทางที่ถูกต้องคือ **Deterministic Safe Fallback**: ห่อผลลัพธ์ของ extractor ไว้ใน **Envelope** (เช่น `ExtractionEnvelope`) ที่มี `status: Literal[\"ok\", \"repaired\", \"fallback\"]`, `data: Invoice | None`, `needs_human_review: bool`, `attempts: int`, และ `error_history: list[str]`",
        "เมื่อครบ `max_retries` แล้วยังไม่ผ่าน ฟังก์ชันจะคืน `status=\"fallback\"`, `data=None`, `needs_human_review=True` เสมอ — ไม่มี exception หลุดไปทำลาย batch pipeline, ไม่มีข้อมูลมั่วไหลลงบัญชี, และทุกเคสที่ตก fallback จะถูกส่งเข้าคิวให้เจ้าหน้าที่ตรวจ ({{hitl}}) พร้อม log ประวัติจุดผิดครบถ้วน",
      ],
      analogy: "เหมือนเครื่องคัดแยกธนบัตรในธนาคาร: ถ้าธนบัตรยับจนสแกนไม่ผ่านแม้ลองสแกนซ้ำ 2 รอบ เครื่องจะไม่ค้างและไม่เดามูลค่าเอง แต่จะดีดธนบัตรใบนั้นลง \"ช่องพักให้พนักงานตรวจ\" แล้วเดินเครื่องนับใบถัดไปต่อทันที",
      bullets: [
        "**Zero Unhandled Crashes**: Batch 1,000 ใบไม่ล่มทั้งงานเพราะใบแจ้งหนี้เละเพียง 1 ใบ",
        "**Zero Silent Corruption**: ไม่ยอมให้ตัวเลข `subtotal + vat != total` ไหลลงฐานข้อมูลโดยอ้างว่า \"เดี๋ยวค่อยแก้\"",
        "**Audit Trail ครบ**: เก็บ `attempts` และ `error_history` เพื่อส่งเข้า {{structlog}} และวิเคราะห์ปรับปรุง prompt ภายหลัง",
      ],
      whyTitle: "Why this matters — ทำให้ทั้งระบบรับประกัน 100% Contract Safety",
      whyParagraphs: [
        "เมื่อรวม Strict Schema (Day 77) + Bounded Repair Loop + Deterministic Fallback เข้าด้วยกัน ฝั่งผู้เรียกใช้จะได้รับสัญญาข้อมูลที่ปลอดภัย **100%** (คือผ่านกฎธุรกิจจริง ~99%+ และอีก ≤1% ถูกกักเข้าคิวตรวจโดยคนอย่างปลอดภัย)",
        "นี่คือมาตรฐานที่ทำให้ระบบ AI ใช้งานจริงในงานการเงิน บัญชี และซัพพอร์ตได้โดยไม่สร้างหนี้ความเสียหายเงียบ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Validation-Repair Loop ≈ HTTP 422 Feedback + Dead-Letter Queue",
      body: [
        "ถ้าคุณเคยทำฟอร์มหรือ REST API เวลา client ส่งข้อมูลผิดเซิร์ฟเวอร์จะคืน `422 Unprocessable Entity` พร้อม list ของ field errors เพื่อให้ client แก้แล้วส่งใหม่ — Validation-Repair Loop ใช้รูปแบบเดียวกันเป๊ะ เพียงแต่คนแก้คือ LLM",
        "ส่วน Deterministic Fallback (`status=\"fallback\"`, `needs_human_review=True`) เทียบได้กับ **Dead-Letter Queue (DLQ)** ในระบบคิวงาน (SQS/RabbitMQ): งานที่ retry ครบโควตาแล้วยังไม่ผ่านจะถูกพักไว้ในคิวตรวจสอบแทนที่จะบล็อก worker ทั้งระบบ",
      ],
      table: [
        ["`format_concise_errors(err)`", "Payload ของ `HTTP 422` ที่ระบุ `field` และ `message`"],
        ["`max_retries = 2`", "Max delivery attempts ก่อนตัดจบใน Message Queue"],
        ["`status=\"fallback\"` + `needs_human_review=True`", "Dead-Letter Queue (DLQ) / Manual Review Queue"],
        ["`tenacity` (D14) vs Repair Loop (D78)", "Transport retry (5xx/429) vs Semantic correction (422)"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมห้ามใช้ `while True` กับ LLM และต่างจาก D14 อย่างไร",
      body: [
        "ในวิชาเขียนโปรแกรมเบื้องต้น เราอาจเคยเขียน `while True:` รับ input จากผู้ใช้จนกว่าจะถูก แต่กับ {{llm}} API ทุกครั้งที่วนรอบคือ **เงินจริงและเวลาจริง** และถ้าเอกสารต้นฉบับไม่มีคำตอบที่ถูกต้องอยู่เลย `while True` จะกลายเป็นลูปไม่รู้จบที่ดูดเงินหมดบัญชีภายในไม่กี่นาที จึงต้องใช้ `for attempt in range(1, max_retries + 2):` เสมอ",
        "จำหลักแยกง่าย ๆ: **D14 (Backoff)** ไว้คุยกับ *เครือข่าย* ตอนเน็ตหลุดหรือเซิร์ฟเวอร์ยุ่ง ส่วน **D78 (Repair Loop)** ไว้คุยกับ *โมเดล* ตอนคำตอบผิดกฎข้อมูล",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: สกัดใบแจ้งหนี้ภาษาไทยที่มีปี พ.ศ. (`2569`) และยอดรวมผิดในรอบแรก เราจะจำลอง LLM ด้วย mock client เพื่อดูการจับ error → ส่ง feedback สั้น ๆ → โมเดลซ่อมตัวเองผ่านในรอบ 2 และดูการทำงานของ Fallback เมื่อเอกสารเละเกินซ่อม",
    steps: [
      {
        title: "1 · นิยาม Schema ใบแจ้งหนี้ไทยพร้อมตรวจปี ค.ศ. และสมการ VAT + ตัวจัดรูปแบบ Error",
        explain: "สร้าง `ThaiInvoice` ที่ปฏิเสธปี พ.ศ. (ยอมรับเฉพาะ ค.ศ. 2020–2030) และตรวจ `subtotal + vat_amount == total_amount` พร้อมฟังก์ชันย่อ `ValidationError`",
        code: {
          language: "python",
          filename: "worked_day78.py",
          code: `from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class ThaiInvoice(BaseModel):
    model_config = ConfigDict(extra="forbid")

    invoice_no: str | None = Field(default=None)
    issue_date: str = Field(description="วันที่ออกเอกสารรูปแบบ ค.ศ. YYYY-MM-DD")
    subtotal: float = Field(ge=0.0)
    vat_amount: float = Field(ge=0.0)
    total_amount: float = Field(ge=0.0)

    @field_validator("issue_date")
    @classmethod
    def check_ce_date(cls, value: str) -> str:
        parsed = date.fromisoformat(value)
        if not (2020 <= parsed.year <= 2030):
            raise ValueError(
                f"ปี {parsed.year} อยู่นอกช่วง ค.ศ. 2020-2030 (หากเป็น พ.ศ. ให้ลบ 543)"
            )
        return value

    @model_validator(mode="after")
    def check_math(self) -> "ThaiInvoice":
        expected = round(self.subtotal + self.vat_amount, 2)
        if abs(expected - self.total_amount) > 0.02:
            raise ValueError(
                f"ยอดรวมไม่ตรง: subtotal({self.subtotal}) + vat({self.vat_amount}) != total({self.total_amount})"
            )
        return self


def format_concise_errors(err: ValidationError) -> str:
    return "\\n".join(
        f"- {'.'.join(str(p) for p in e['loc']) or '__root__'}: {e['msg']}"
        for e in err.errors()
    )


try:
    ThaiInvoice.model_validate_json(
        '{"invoice_no":"INV-1","issue_date":"2569-05-10","subtotal":1000,"vat_amount":70,"total_amount":1000}'
    )
except ValidationError as exc:
    print(format_concise_errors(exc))`,
        },
        output: `- issue_date: Value error, ปี 2569 อยู่นอกช่วง ค.ศ. 2020-2030 (หากเป็น พ.ศ. ให้ลบ 543)
- __root__: Value error, ยอดรวมไม่ตรง: subtotal(1000.0) + vat(70.0) != total(1000.0)`,
      },
      {
        title: "2 · เขียน Bounded Repair Loop พร้อม Deterministic Fallback Envelope",
        explain: "ห่อผลลัพธ์ด้วย `ExtractionEnvelope` — ในแต่ละรอบถ้า `model_validate_json` พัง จะแนบคำตอบเดิมและข้อความจาก `format_concise_errors` กลับไปให้ `llm_fn` แก้ สูงสุด `max_retries=2` รอบ",
        code: {
          language: "python",
          filename: "worked_day78.py",
          code: `from collections.abc import Callable


class ExtractionEnvelope(BaseModel):
    status: Literal["ok", "repaired", "fallback"]
    attempts: int
    data: ThaiInvoice | None
    needs_human_review: bool
    error_history: list[str]


def extract_with_repair(
    doc_text: str,
    llm_fn: Callable[[list[dict[str, str]]], str],
    *,
    max_retries: int = 2,
) -> ExtractionEnvelope:
    messages: list[dict[str, str]] = [
        {"role": "system", "content": "สกัดใบแจ้งหนี้เป็น JSON ใช้ปี ค.ศ. YYYY-MM-DD และตรวจยอดรวม"},
        {"role": "user", "content": doc_text},
    ]
    error_history: list[str] = []

    for attempt in range(1, max_retries + 2):
        raw_output = llm_fn(messages)
        try:
            parsed = ThaiInvoice.model_validate_json(raw_output)
            return ExtractionEnvelope(
                status="ok" if attempt == 1 else "repaired",
                attempts=attempt,
                data=parsed,
                needs_human_review=False,
                error_history=error_history,
            )
        except ValidationError as exc:
            feedback = format_concise_errors(exc)
            error_history.append(f"attempt {attempt}: {feedback}")
            messages.append({"role": "assistant", "content": raw_output})
            messages.append(
                {
                    "role": "user",
                    "content": f"JSON ด้านบนไม่ผ่านกฎตรวจดังนี้:\\n{feedback}\\nกรุณาแก้ไขและคืนเฉพาะ JSON ที่ถูกต้อง",
                }
            )

    return ExtractionEnvelope(
        status="fallback",
        attempts=max_retries + 1,
        data=None,
        needs_human_review=True,
        error_history=error_history,
    )`,
        },
        output: `Defined ExtractionEnvelope and bounded extract_with_repair (max_retries=2).`,
      },
      {
        title: "3 · ทดสอบทั้งเคส \"ซ่อมผ่านรอบ 2\" และเคส \"ตก Fallback อย่างปลอดภัย\"",
        explain: "ใช้ mock client 2 ตัว: ตัวแรกผิดปี พ.ศ. รอบแรกแล้วซ่อมผ่านรอบ 2, ตัวที่สองคืนค่าพังทุกครั้งเพื่อยืนยันว่า fallback ทำงานโดยไม่ crash",
        code: {
          language: "python",
          filename: "worked_day78.py",
          code: `def mock_self_healing_llm(messages: list[dict[str, str]]) -> str:
    # รอบแรก (2 messages) ตอบปี พ.ศ. และยอดผิด; รอบสองเห็น error feedback แล้วแก้ถูก
    if len(messages) == 2:
        return '{"invoice_no":"INV-78","issue_date":"2569-05-10","subtotal":1000,"vat_amount":70,"total_amount":1000}'
    return '{"invoice_no":"INV-78","issue_date":"2026-05-10","subtotal":1000,"vat_amount":70,"total_amount":1070}'


def mock_broken_llm(messages: list[dict[str, str]]) -> str:
    return "ขออภัย ไม่สามารถอ่านภาพใบเสร็จได้"


res_healed = extract_with_repair("ใบแจ้งหนี้ INV-78 วันที่ 10/05/2569", mock_self_healing_llm)
res_fallback = extract_with_repair("เอกสารเสียหาย", mock_broken_llm)

print("Healed:", res_healed.status, "| attempts:", res_healed.attempts, "| date:", res_healed.data.issue_date)
print("Fallback:", res_fallback.status, "| attempts:", res_fallback.attempts, "| human_review:", res_fallback.needs_human_review)`,
        },
        output: `Healed: repaired | attempts: 2 | date: 2026-05-10
Fallback: fallback | attempts: 3 | human_review: True`,
      },
    ],
    gotcha: "สังเกตในขั้นที่ 3: `ThaiInvoice.model_validate_json(\"ขออภัย ไม่สามารถอ่านภาพได้\")` ก็โยน `ValidationError` (ชนิด `json_invalid`) เหมือนกัน! เราจึงจัดการทั้งเคส JSON พังและเคสกฎธุรกิจพังได้ในบล็อก `except ValidationError:` เดียวอย่างสะอาดตา",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day78.py` ที่มี Schema ใบแจ้งหนี้ภาษาไทย, ตัวจัดรูปแบบ `ValidationError` แบบกระชับ, และ Bounded Validation-Repair Loop พร้อม Deterministic Safe Fallback ที่ทดสอบผ่าน 100% ด้วย mock client",
    requirements: [
      "สร้าง `ThaiInvoiceDraft(BaseModel)` ตั้ง `ConfigDict(extra=\"forbid\")` มีฟิลด์: `invoice_no: str | None = None`, `issue_date: str` (ต้องเป็น ISO `YYYY-MM-DD` และปี ค.ศ. อยู่ระหว่าง `2020..2030` เพื่อกันปี พ.ศ.), `subtotal: float = Field(ge=0.0)`, `vat_amount: float = Field(ge=0.0)`, `total_amount: float = Field(ge=0.0)` พร้อม `@model_validator(mode=\"after\")` ตรวจ `abs((subtotal + vat_amount) - total_amount) <= 0.02`",
      "สร้าง `ExtractionEnvelope(BaseModel)` มีฟิลด์: `status: Literal[\"ok\", \"repaired\", \"fallback\"]`, `attempts: int`, `data: ThaiInvoiceDraft | None`, `needs_human_review: bool`, `error_history: list[str]`",
      "สร้าง `format_concise_errors(err: ValidationError) -> str` แปลง `err.errors()` เป็นบรรทัด `- <field_path>: <msg>` (ถ้า `loc` ว่างให้ใช้ `__root__`)",
      "สร้าง `run_repair_loop(doc_text: str, llm_fn: Callable[[list[dict[str, str]]], str], *, max_retries: int = 2) -> ExtractionEnvelope`: ตรวจ `max_retries >= 0` (ไม่งั้น `raise ValueError`), เรียก `llm_fn` สูงสุด `max_retries + 1` ครั้ง, เมื่อไม่ผ่านให้แนบ `assistant` (raw output) และ `user` (ข้อความจาก `format_concise_errors`) เข้า `messages`, คืน `status=\"ok\"` หากผ่านรอบแรก, `\"repaired\"` หากผ่านรอบซ่อม, และ `\"fallback\"` (`data=None`, `needs_human_review=True`) หากไม่ผ่านจนครบเพดาน",
    ],
    starter: {
      language: "python",
      filename: "exercise_day78.py",
      code: `from collections.abc import Callable
from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class ThaiInvoiceDraft(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid"), fields, check CE date 2020..2030 และ check subtotal + vat == total
    pass


class ExtractionEnvelope(BaseModel):
    status: Literal["ok", "repaired", "fallback"]
    attempts: int
    data: ThaiInvoiceDraft | None
    needs_human_review: bool
    error_history: list[str]


def format_concise_errors(err: ValidationError) -> str:
    """ย่อ ValidationError เป็นรายการ '- path: msg' สำหรับส่งให้ LLM ซ่อม."""
    # TODO: implement
    raise NotImplementedError


def run_repair_loop(
    doc_text: str,
    llm_fn: Callable[[list[dict[str, str]]], str],
    *,
    max_retries: int = 2,
) -> ExtractionEnvelope:
    """รัน Bounded Validation-Repair Loop พร้อม Deterministic Safe Fallback."""
    # TODO: ตรวจ max_retries >= 0, วนซ่อมสูงสุด max_retries + 1 ครั้ง, คืน fallback หากไม่ผ่าน
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day78.py",
      code: `import json
import pytest
from exercise_day78 import ExtractionEnvelope, run_repair_loop


def test_first_pass_ok():
    calls = 0

    def mock_ok(messages: list[dict[str, str]]) -> str:
        nonlocal calls
        calls += 1
        return json.dumps({
            "invoice_no": "INV-2026-001",
            "issue_date": "2026-03-15",
            "subtotal": 2000.0,
            "vat_amount": 140.0,
            "total_amount": 2140.0,
        })

    env = run_repair_loop("ใบแจ้งหนี้ INV-2026-001", mock_ok, max_retries=2)
    assert isinstance(env, ExtractionEnvelope)
    assert env.status == "ok"
    assert env.attempts == 1
    assert calls == 1
    assert env.needs_human_review is False
    assert env.data is not None and env.data.total_amount == 2140.0
    assert env.error_history == []


def test_repair_fixes_buddhist_year_and_math_on_second_attempt():
    seen_messages: list[list[dict[str, str]]] = []

    def mock_heal(messages: list[dict[str, str]]) -> str:
        seen_messages.append(list(messages))
        if len(seen_messages) == 1:
            return json.dumps({
                "invoice_no": "INV-2026-002",
                "issue_date": "2569-03-15",
                "subtotal": 1000.0,
                "vat_amount": 70.0,
                "total_amount": 1000.0,
            })
        return json.dumps({
            "invoice_no": "INV-2026-002",
            "issue_date": "2026-03-15",
            "subtotal": 1000.0,
            "vat_amount": 70.0,
            "total_amount": 1070.0,
        })

    env = run_repair_loop("ใบแจ้งหนี้วันที่ 15/03/2569", mock_heal, max_retries=2)
    assert env.status == "repaired"
    assert env.attempts == 2
    assert env.needs_human_review is False
    assert env.data is not None and env.data.issue_date == "2026-03-15"
    assert len(env.error_history) == 1
    # ตรวจว่าส่ง error feedback กลับในรอบที่ 2 จริง
    second_prompt = seen_messages[1][-1]["content"]
    assert "issue_date" in second_prompt


def test_deterministic_fallback_after_max_retries():
    calls = 0

    def mock_always_bad(messages: list[dict[str, str]]) -> str:
        nonlocal calls
        calls += 1
        return "not valid json at all"

    env = run_repair_loop("เอกสารเบลอ", mock_always_bad, max_retries=2)
    assert calls == 3
    assert env.status == "fallback"
    assert env.attempts == 3
    assert env.data is None
    assert env.needs_human_review is True
    assert len(env.error_history) == 3


def test_reject_negative_max_retries():
    with pytest.raises(ValueError):
        run_repair_loop("test", lambda _: "{}", max_retries=-1)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases ในเวลา < 1 วินาทีโดยไม่ต้องใช้ API key",
      "ตรวจว่าปี พ.ศ. อย่าง `2569-03-15` ถูกปฏิเสธและส่งข้อความ `issue_date` กลับเข้า repair prompt จริง",
      "ตรวจว่าเมื่อ `max_retries=2` และโมเดลตอบพังตลอด ลูปหยุดที่ `attempts == 3` และคืน `status=\"fallback\"`, `needs_human_review=True`",
      "รัน `uv run ruff check .` แล้วไม่มี lint warning",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day78.py` ด้วย `uv run pytest -q` และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `ThaiInvoiceDraft` ใช้ `date.fromisoformat(value)` ตรวจรูปแบบ `YYYY-MM-DD` แล้วเช็ก `2020 <= parsed.year <= 2030` เพื่อกันปี พ.ศ. ไทย (`2569`) และใน `@model_validator(mode=\"after\")` เช็ก `abs(round(self.subtotal + self.vat_amount, 2) - self.total_amount) > 0.02`",
      },
      {
        body: "ใน `run_repair_loop` วน `for attempt in range(1, max_retries + 2):` แล้วครอบ `ThaiInvoiceDraft.model_validate_json(raw)` ด้วย `try ... except ValidationError as exc:` — ถ้าพลาดให้เก็บ feedback ลง `error_history` แล้ว `messages.append(...)` ทั้งบทบาท `assistant` และ `user`",
      },
      {
        body: "โครงของ `format_concise_errors` และลูปหลักใน `run_repair_loop` พร้อมแล้ว เหลือเติม `ThaiInvoiceDraft` ให้ครบตามสเปก",
        code: {
          language: "python",
          filename: "hint_day78.py",
          code: `def format_concise_errors(err: ValidationError) -> str:
    lines = []
    for item in err.errors():
        loc = ".".join(str(p) for p in item.get("loc", ())) or "__root__"
        lines.append(f"- {loc}: {item.get('msg', 'invalid')}")
    return "\\n".join(lines)


def run_repair_loop(doc_text: str, llm_fn, *, max_retries: int = 2) -> ExtractionEnvelope:
    if max_retries < 0:
        raise ValueError("max_retries must be >= 0")
    messages = [
        {"role": "system", "content": "Extract Thai invoice as strict JSON (CE date YYYY-MM-DD)."},
        {"role": "user", "content": doc_text},
    ]
    error_history: list[str] = []
    for attempt in range(1, max_retries + 2):
        raw = llm_fn(messages)
        try:
            parsed = ThaiInvoiceDraft.model_validate_json(raw)
            return ExtractionEnvelope(
                status="ok" if attempt == 1 else "repaired",
                attempts=attempt,
                data=parsed,
                needs_human_review=False,
                error_history=error_history,
            )
        except ValidationError as exc:
            feedback = format_concise_errors(exc)
            error_history.append(feedback)
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": f"Fix these validation errors:\\n{feedback}"})
    return ExtractionEnvelope(
        status="fallback",
        attempts=max_retries + 1,
        data=None,
        needs_human_review=True,
        error_history=error_history,
    )`,
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
      title: "ใช้ `while True` วนซ่อมจนกว่าจะผ่านโดยไม่ตั้ง `max_retries`",
      symptom: "เจอใบเสร็จที่สแกนเบลอจนข้อมูลไม่ครบ 1 ใบ ระบบยิง API ซ้ำหลายร้อยรอบจนชน rate limit และค่า API พุ่ง",
      fix: "จำกัดรอบซ่อมอย่างเข้มงวดด้วย `max_retries = 2` (สูงสุด 3 ครั้งรวมรอบแรก) แล้วตัดจบเข้า Deterministic Fallback เสมอ",
    },
    {
      title: "แปะ Python Traceback ยาวเหยียดหรือ `str(err)` ดิบทั้งหมดเข้า Repair Prompt",
      symptom: "เสีย input tokens เกินจำเป็นและบางครั้งโมเดลสับสนกับ URL เอกสาร Pydantic หรือชื่อไฟล์ภายในเครื่อง",
      fix: "เขียนฟังก์ชัน `format_concise_errors(err)` ส่งเฉพาะ `- field_path: reason` ที่สั้นและชี้จุดแก้โดยตรง",
    },
    {
      title: "ปล่อย Fallback ผ่านเงียบ ๆ โดยไม่ตั้ง `needs_human_review=True` และไม่ log สาเหตุ",
      symptom: "เอกสารที่ซ่อมไม่ผ่านหายสาบสูญจากกระบวนการบัญชี ไม่มีใครรู้ว่ามีใบแจ้งหนี้ตกหล่น",
      fix: "คืน `ExtractionEnvelope` ที่มี `status=\"fallback\"`, `needs_human_review=True`, และ `error_history` พร้อมบันทึกด้วย {{structlog}}",
    },
    {
      title: "เอา HTTP Retry (Backoff) ไปปนกับ Validation Repair",
      symptom: "สั่ง `tenacity` รอ 1s, 2s, 4s แล้วส่ง prompt เดิมซ้ำเมื่อ `ValidationError` เกิดขึ้น — โมเดลเลยตอบผิดซ้ำเดิมทุกครั้งและช้าโดยใช่เหตุ",
      fix: "แยกสองชั้นออกจากกัน: ใช้ {{exponential-backoff}} เฉพาะ network/429/5xx ส่วน `ValidationError` ให้เข้า Repair Loop ที่ส่ง error feedback กลับทันที",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d078-q1",
        "เหตุใดระบบที่เปิด Strict Structured Outputs แล้ว จึงยังต้องมี Validation-Repair Loop เพิ่มอีกชั้น?",
        [
          ["เพราะ Strict JSON Schema สร้างไฟล์ JSON ไม่ได้ในภาษาไทย", "ไม่จริง — Strict JSON Schema รองรับค่า string ภาษาไทยได้เต็มที่"],
          ["เพราะ Strict JSON Schema ตรวจได้เฉพาะโครงสร้างและชนิดข้อมูล แต่ไม่สามารถจับความผิดพลาดเชิงกฎธุรกิจข้ามฟิลด์ (เช่น `subtotal + vat != total` หรือปี พ.ศ. แทน ค.ศ.)", "ถูก — ด่าน Pydantic validator ฝั่งแอปจับความผิดพลาดเชิงความหมาย แล้วส่ง feedback ให้โมเดลซ่อมตัวเอง"],
          ["เพราะ Pydantic ไม่สามารถทำงานร่วมกับ Official SDK ได้", "ไม่จริง — Pydantic v2 ทำงานคู่กับ Official SDK ได้โดยตรง"],
          ["เพื่อเพิ่มจำนวน token ที่ส่งให้โมเดลในทุกรอบ", "ไม่ใช่เป้าหมาย — เราต้องการส่ง repair เฉพาะเคสที่รอบแรกไม่ผ่านเท่านั้น"],
        ],
        "B",
        "Strict JSON Schema รับประกันไวยากรณ์ JSON และชนิดข้อมูล แต่ความสัมพันธ์ข้ามฟิลด์และกฎโดเมน (เช่น ปี ค.ศ. ไทยหรือสมการ VAT) ต้องตรวจด้วย Pydantic validator แล้วซ่อมด้วย Repair Loop",
        "Strict JSON Schema รับประกันอะไรได้ และทำไมยังต้องมี Validation-Repair Loop?",
        "Strict Schema คุมได้แค่โครงสร้าง/ชนิดข้อมูล แต่จับกฎธุรกิจข้ามฟิลด์หรือปี พ.ศ. ไม่ได้ — Repair Loop ส่ง `ValidationError` สั้น ๆ กลับให้โมเดลซ่อมจุดผิดเหล่านั้น",
      ),
      mc(
        "d078-q2",
        "ข้อใดคือแนวปฏิบัติที่ดีที่สุดในการสร้างข้อความ feedback ส่งกลับให้ LLM เมื่อเกิด Pydantic `ValidationError`?",
        [
          ["ส่ง prompt เดิมซ้ำโดยไม่บอกอะไรเพิ่มเติมและเพิ่ม `temperature=1.5`", "ไม่ดี — การสุ่มมั่วโดยไม่บอกจุดผิดทำให้โมเดลหลุดบริบทและแก้ไม่ตรงจุด"],
          ["แปะ Python full stacktrace พร้อม path ไฟล์ในเครื่องทั้งหมดลงไปใน prompt", "สิ้นเปลือง token และมี noise มากเกินไป แถมเสี่ยงเปิดเผยโครงสร้างภายใน"],
          ["ย่อ `err.errors()` ให้เหลือเฉพาะ `- field_path: reason` แนบคู่กับ JSON เก่าที่ผิด เพื่อให้โมเดลแก้ตรงจุด", "ถูก — กระชับ ประหยัด token และชี้เป้าให้โมเดลแก้ถูกใน 1–2 รอบ"],
          ["ลบฟิลด์ที่ผิดออกจาก schema แล้วลองใหม่", "อันตรายมาก — ทำให้สัญญาข้อมูลพังและเสียข้อมูลสำคัญ"],
        ],
        "C",
        "การส่งเฉพาะชื่อฟิลด์และเหตุผลที่ผิดแบบกระชับคู่กับคำตอบเดิมช่วยให้โมเดลโฟกัสที่การแก้ข้อผิดพลาดได้แม่นยำและประหยัด token ที่สุด",
        "ควรจัดรูปแบบ `ValidationError` อย่างไรก่อนส่งกลับให้ LLM ใน Repair Loop?",
        "ย่อ `err.errors()` เป็นบรรทัดสั้น ๆ รูปแบบ `- field_path: reason` แนบคู่กับคำตอบเดิมที่ผิด ไม่ส่ง full stacktrace",
      ),
      mc(
        "d078-q3",
        "เมื่อ Validation-Repair Loop ลองซ่อมครบเพดาน `max_retries=2` แล้วยังไม่ผ่าน ระบบ production ควรจัดการอย่างไร?",
        [
          ["ขยายเพดานเป็น `while True` ต่อไปเรื่อย ๆ จนกว่าโมเดลจะตอบถูก", "อันตรายมาก — เสี่ยงลูปไม่รู้จบ ค่า API พุ่ง และ request timeout"],
          ["บังคับบันทึก JSON ที่เลขผิดลงฐานข้อมูลไปก่อนเพื่อให้ระบบไม่สะดุด", "อันตราย — เกิด Silent Data Corruption ในระบบบัญชีหรือธุรกิจ"],
          ["คืน Deterministic Safe Fallback (`status=\"fallback\"`, `data=None`, `needs_human_review=True`, พร้อม `error_history`) เพื่อส่งเข้าคิวคนตรวจโดยไม่ทำระบบล่ม", "ถูก — ปลอดภัยทั้งต่อสัญญาข้อมูลและเสถียรภาพของ batch pipeline"],
          ["ปิด `@model_validator` ชั่วคราวเพื่อให้ผ่านได้", "ไม่ควรทำ — เป็นการปิดด่านความปลอดภัยของข้อมูล"],
        ],
        "C",
        "Deterministic Safe Fallback ช่วยให้ระบบไม่ crash, ไม่บันทึกข้อมูลผิดลงฐานข้อมูล, และส่งเคสที่แก้ไม่ได้เข้าคิว Human-in-the-Loop พร้อมบันทึกสาเหตุไว้ปรับปรุงระบบ",
        "เมื่อครบ `max_retries` แล้วยัง validate ไม่ผ่าน ระบบควรทำอย่างไร?",
        "ตัดจบด้วย Deterministic Safe Fallback (`status='fallback'`, `data=None`, `needs_human_review=True`, พร้อม `error_history`) ส่งเข้าคิว HITL แทนการ crash หรือบันทึกข้อมูลผิด",
      ),
      mc(
        "d078-q4",
        "ความแตกต่างสำคัญระหว่าง Network Retry (`exponential-backoff`, Day 14) กับ Validation-Repair Loop (Day 78) คือข้อใด?",
        [
          ["Network Retry ใช้กับ Python เท่านั้น ส่วน Repair Loop ใช้กับ TypeScript", "ไม่เกี่ยวกัน — ทั้งสองรูปแบบใช้ได้กับทุกภาษา"],
          ["Network Retry ส่งคำขอเดิมซ้ำเมื่อเจอปัญหาเครือข่าย/429/5xx ส่วน Repair Loop ส่ง *error feedback ใหม่* กลับไปให้โมเดลแก้เมื่อคำตอบผิดกฎข้อมูล", "ถูก — แยกความรับผิดชอบชัดเจนระหว่างชั้นการสื่อสาร (transport) กับชั้นความถูกต้องของข้อมูล (semantic)"],
          ["Repair Loop ต้องรอเวลาแบบ exponential 2s, 4s, 8s ทุกครั้งก่อนซ่อม", "ไม่จำเป็น — Validation error ไม่ใช่ปัญหาเซิร์ฟเวอร์ล่ม จึงส่งซ่อมได้ทันที"],
          ["ทั้งสองอย่างเหมือนกันทุกประการ ใช้ `tenacity` อย่างเดียวก็พอ", "ไม่เหมือนกัน — `tenacity` ที่ส่ง prompt เดิมซ้ำไม่ได้บอกโมเดลว่าผิดฟิลด์ไหน"],
        ],
        "B",
        "ชั้น HTTP/Network Retry จัดการความผิดพลาดชั่วคราวของโครงสร้างพื้นฐาน (429/5xx/timeout) ส่วน Validation-Repair Loop จัดการความผิดพลาดเชิงเนื้อหาด้วยการป้อน feedback กลับให้โมเดล",
        "HTTP Backoff Retry (D14) ต่างจาก Validation-Repair Loop (D78) อย่างไร?",
        "HTTP Retry ส่งคำขอเดิมซ้ำเมื่อเจอ 429/5xx/timeout; Repair Loop ส่งข้อความ `ValidationError` ใหม่กลับให้โมเดลแก้เมื่อคำตอบผิดกฎธุรกิจ",
      ),
    ],
  },

  takeaways: [
    "Strict JSON Schema ป้องกัน JSON syntax พังได้ แต่ยังต้องมี **Validation-Repair Loop** เพื่อซ่อมความผิดพลาดเชิงกฎธุรกิจและบริบทไทย (เช่น ปี พ.ศ. 2569 หรือ `subtotal + vat != total`)",
    "จำกัดรอบซ่อมเสมอ (`max_retries = 2`) และย่อ {{validation-error}} ให้เหลือเฉพาะ `- field: reason` เพื่อความแม่นยำและคุมต้นทุน",
    "เมื่อซ่อมครบโควตาแล้วยังไม่ผ่าน ให้ตัดจบด้วย **Deterministic Safe Fallback** (`status=\"fallback\"`, `needs_human_review=True`) แทนการ crash หรือปล่อยข้อมูลผิดลงฐานข้อมูล",
    "แยก Transport Retry ({{exponential-backoff}}) ออกจาก Semantic Repair Loop และเก็บสถิติ `ok / repaired / fallback` ด้วย {{structlog}} เพื่อปรับปรุง prompt อย่างต่อเนื่อง",
  ],

  reviewCards: [
    rc(
      "d078-rc-1",
      "ทำไมจึงไม่ควรสั่งซ้ำด้วย prompt เดิมเฉย ๆ เมื่อ Pydantic โยน `ValidationError`?",
      "เพราะที่ `temperature=0` โมเดลมักตอบผิดแบบเดิมซ้ำ — ต้องแนบคำตอบเดิมและข้อความ error แบบย่อ (`- field: reason`) เพื่อชี้จุดให้โมเดลแก้ตัวเอง",
    ),
    rc(
      "d078-rc-2",
      "ค่า `max_retries` ที่เหมาะสมสำหรับ Validation-Repair Loop คือประมาณกี่รอบ และเพราะอะไร?",
      "ประมาณ `max_retries = 2` (รวมสูงสุด 3 ครั้ง) เพราะเคสที่ซ่อมได้มักผ่านในรอบซ่อมที่ 1–2 ส่วนรอบที่ 3+ มักเกิดจากเอกสารคลุมเครือและทำให้ latency/cost พุ่งโดยไม่คุ้ม",
    ),
    rc(
      "d078-rc-3",
      "Deterministic Safe Fallback ควรคืนโครงสร้างข้อมูลแบบใดเมื่อซ่อมไม่ผ่านครบทุกโควตา?",
      "คืน typed envelope เช่น `status=\"fallback\"`, `data=None`, `needs_human_review=True`, `attempts`, และ `error_history` เพื่อส่งเข้าคิว HITL โดยไม่ทำ batch ล่มและไม่เขียนข้อมูลผิดลง DB",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Docs — Error Handling & ValidationError", href: "https://docs.pydantic.dev/latest/errors/errors/" },
    { label: "Instructor Docs — Retrying & Validation Loops", href: "https://python.useinstructor.com/concepts/retrying/" },
    { label: "OpenAI API Docs — Structured Outputs & Refusals", href: "https://platform.openai.com/docs/guides/structured-outputs" },
    { label: "Anthropic Docs — Building Effective Agents & Evaluators", href: "https://www.anthropic.com/research/building-effective-agents" },
  ],

  glossary: ["validation-error", "pydantic", "structured-output", "fail-fast", "exponential-backoff", "hitl", "structlog", "mocking"],
});
