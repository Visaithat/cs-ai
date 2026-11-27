import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D087 — Phase 3 / Block B22
 * Phase 3 Mini-Project: Design Thai Document Classifier & Extractor
 */
export const d087: Lesson = defineLesson({
  day: 87,
  titleTh: "ออกแบบพิมพ์เขียว Phase 3 Mini-Project: ระบบคัดแยกและสกัดเอกสารไทยแบบ Type-Safe",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · กำหนดขอบเขต Portfolio Milestone #3, Strict Pydantic Schemas, Cache Key และเป้าหมาย SLA",
  icon: "file-text",
  visual: {
    id: "phase3-extractor-arch",
    title: "พิมพ์เขียว Phase 3 Mini-Project — Typed Thai Document Classifier & Extractor",
    caption: "คลิกสำรวจทั้ง 5 ชั้นตั้งแต่ Versioned Prompt → Edge-Case Normalizer → Router + Cache → Pydantic Repair → Eval & Cost",
    alt: "แผนภาพสถาปัตยกรรม Phase 3 Thai Document Classifier & Extractor",
  },
  requiresApiKey: false,
  tools: ["Pydantic v2", "SDK", "Ollama", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "กำหนดขอบเขต Portfolio Milestone #3 และเป้าหมาย SLA ที่วัดได้จริง",
      body: "ระบบ **Typed Thai Document Classifier & Extractor** ต้องแยกและสกัดเอกสารธุรกิจไทย 3 ประเภท (`receipt`, `support_ticket`, `tax_invoice_request`) ภายใต้เป้าหมายชัดเจน: Schema Validity `≥ 99%`, Classification Accuracy `≥ 90%`, P95 Latency `< 2.5s`, และต้นทุน `< $1.50 / 1,000 docs`",
      lessonNote: "วันนี้เราเขียน Architecture Spec และตัวตรวจ SLA ของ Milestone #3 ก่อนลงมือประกอบ pipeline จริงใน Day 88–92",
    },
    {
      node: 1,
      heading: "ออกแบบ Data Contract แบบเข้มงวดด้วย Pydantic v2 สำหรับเอกสารไทย 3 ประเภท",
      body: "นิยาม {{data-contract}} ด้วย {{pydantic}} ({{basemodel}}, `extra=\"forbid\"`, {{literal}}, `| None`, และกฎเลขผู้เสียภาษี 13 หลัก) เพื่อรับประกันว่าทุกเอกสารที่ผ่านด่านจะพร้อมเข้าสู่ระบบบัญชีหรือทิกเก็ตโดยไม่พัง",
      lessonNote: "เราจะสร้าง Payload Schema 3 รุ่นพร้อม Envelope กลางที่ตรวจสอบความสอดคล้องของ `doc_type` ข้ามฟิลด์",
    },
    {
      node: 4,
      heading: "วางนโยบาย Model Routing และ Versioned Cache Key ไม่ให้เสิร์ฟข้อมูลเก่า",
      body: "การทำ {{caching}} (บน {{sqlite}} ใน Day 88) ต้องแฮช **เนื้อหาเอกสารที่ normalize แล้ว + `prompt_version` + `schema_version` + `model_name`** เพื่อป้องกันบั๊กคลาสสิกที่แก้ prompt แล้วแต่ระบบยังตอบผลลัพธ์เก่าจาก cache",
      lessonNote: "เราจะเขียนฟังก์ชันสร้าง Deterministic SHA-256 Cache Key และทดสอบการ invalidate เมื่ออัปเกรด {{prompt-versioning}}",
    },
    {
      node: 5,
      heading: "วางทางออก HITL และเกณฑ์ผ่าน Gate ก่อนขึ้น Demo Day 92",
      body: "เคสที่ความมั่นใจต่ำ ยอดเงินสูง หรือเลขผู้เสียภาษีไม่ครบ 13 หลักต้องถูกส่งเข้าคิว {{hitl}} อย่างปลอดภัย พร้อมบันทึกเหตุผลและต้นทุนต่อ 1,000 เอกสารให้เทียบกับ ML Baseline ของ Phase 2 ได้",
      lessonNote: "พิมพ์เขียววันนี้คือเข็มทิศของ Block B22–B23 จนจบ Phase 3 Checkpoint (Day 92)",
    },
  ],

  objectives: [
    "**กำหนด** ขอบเขตสถาปัตยกรรม ({{adr}} แบบกระชับ) และเป้าหมาย SLA (Accuracy, Schema Validity, P95 Latency, Cost/1k docs) ของ **Phase 3 Mini-Project: Typed Thai Document Classifier & Extractor**",
    "**ออกแบบ** Strict {{pydantic}} v2 Schemas สำหรับเอกสารธุรกิจไทย 3 ประเภท (`receipt`, `support_ticket`, `tax_invoice_request`) พร้อมกฎตรวจเลขผู้เสียภาษี 13 หลักและการป้องกัน {{hallucination}} ด้วย `| None`",
    "**ออกแบบ** นโยบาย Model Routing (Local/Small → Frontier) และ Versioned SHA-256 Cache Key ที่ผูกกับ {{prompt-versioning}} และ `schema_version`",
  ],

  prerequisites: [
    "Strict {{structured-output}}, Validation-Repair Loop และ Model Routing (Days 77–80)",
    "Persistent {{sqlite}} {{caching}} (Day 27) และ Ollama Local Models (Day 83)",
    "กรอบตัดสินใจ Prompt vs RAG vs Fine-Tune (Days 85–86)",
    "รันได้ 100% บนเครื่องคุณด้วย `uv`, `pydantic` และ `pytest`",
  ],

  setup: {
    intro: "สร้างโครงสร้างโปรเจกต์ต้นแบบสำหรับ **Phase 3 Mini-Project** ด้วย {{uv}} เพื่อประกาศสัญญาข้อมูล (Schemas), Cache Key Design และ SLA Checker",
    commands: `uv init thai-doc-extractor && cd thai-doc-extractor
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('Phase 3 Spec Ready | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `thai-doc-extractor` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันเช็กเวอร์ชันสำเร็จ พร้อมวางพิมพ์เขียว Milestone #3"],
    ],
    note: "โครงสร้าง schema และ cache key ที่คุณออกแบบวันนี้จะถูกนำไปเชื่อมกับ SQLite Cache + Tiered Router + Repair Loop ในวันพรุ่งนี้ (Day 88) และขยายต่อใน Block B23 (Days 89–92)",
  },

  concepts: [
    {
      id: "milestone3-scope-and-sla",
      title: "1 · ขอบเขต Portfolio Milestone #3: 3 เอกสารไทย + 4 ตัวชี้วัด SLA",
      paragraphs: [
        "ความต่างระหว่าง \"สคริปต์ทดลองเล่น\" กับ \"โปรเจกต์พอร์ตโฟลิโอระดับวิศวกร AI\" คือ **การเขียนสเปกและเป้าหมายที่วัดผลได้ก่อนลงมือเขียนโค้ด** สำหรับ Milestone #3 ระบบ **Typed Thai Document Classifier & Extractor** ของเราต้องรองรับเอกสารธุรกิจไทย 3 ประเภทที่เจอบ่อยจริงในองค์กร:",
        "(1) **`receipt`** (ใบเสร็จรับเงิน: ชื่อร้าน, วันที่ ค.ศ., ยอดสุทธิ, ช่องทางชำระเงิน), (2) **`support_ticket`** (ทิกเก็ตแจ้งปัญหาลูกค้า: หมวดปัญหา, ความเร่งด่วน, สรุปปัญหาภาษาไทย), และ (3) **`tax_invoice_request`** (คำขอออกใบกำกับภาษีเต็มรูป: ชื่อบริษัท/บุคคล, เลขประจำตัวผู้เสียภาษี 13 หลัก, ที่อยู่, เลขอ้างอิงออเดอร์)",
        "ก่อนเขียน pipeline เราล็อก **4 เกณฑ์ผ่าน (Acceptance SLAs)** ไว้ล่วงหน้า: (1) Classification Accuracy `≥ 90%`, (2) Schema Compliance `≥ 99%` (0% crash ด้วย fallback), (3) P95 Latency `≤ 2,500 ms` (เมื่อรวมผลจาก cache + small model), และ (4) Blended Cost `≤ $1.50 / 1,000 docs`",
      ],
      analogy: "เหมือนการเซ็นแบบแปลนบ้านกับวิศวกรโครงสร้างก่อนตอกเสาเข็ม: ระบุชัดว่ามีกี่ห้อง รับน้ำหนักได้กี่ตัน งบไม่เกินกี่บาท — พอสร้างจริงจะได้มีไม้บรรทัดวัดชัดเจนว่างานเสร็จสมบูรณ์หรือยัง",
      bullets: [
        "**In-Scope**: ข้อความไทยและไทยปนอังกฤษ (code-switching) จากใบเสร็จ แชต/อีเมลลูกค้า และฟอร์มขอใบกำกับภาษี",
        "**Out-of-Scope (สำหรับ Phase 3)**: คลังความรู้ FAQ หลายหมื่นหน้า (ไว้ทำใน Phase 4 Hybrid RAG) และระบบ PDPA Redaction ระดับเกตเวย์ (Phase 5)",
        "**Human-in-the-Loop ({{hitl}})**: เคสที่ `confidence < 0.75`, ยอดใบเสร็จ `>= 50,000` บาท, หรือซ่อม schema ไม่ผ่าน ต้องตั้ง `needs_human_review = True`",
      ],
      whyTitle: "Why this matters — เอกสารสเปกชัดช่วยให้โปรเจกต์โดดเด่นตอนสัมภาษณ์งาน",
      whyParagraphs: [
        "ตอนนำเสนอผลงาน (Day 92 Demo หรือสัมภาษณ์งาน) ผู้สัมภาษณ์จะประทับใจมากหากคุณเปิด README แล้วเห็น {{adr}} สั้น ๆ ที่อธิบายว่าทำไมเลือก 3 schema นี้, ทำไมวาง routing threshold ที่ `0.80`, และทำไมถึงประหยัดต้นทุนได้ต่ำกว่า `$1.50 / 1,000 docs`",
        "สเปกนี้ยังทำให้คุณเทียบผลลัพธ์กับ Classical ML Baseline (Phase 2) ได้อย่างยุติธรรมบนตัวชี้วัดเดียวกัน",
      ],
    },
    {
      id: "typed-thai-doc-contracts",
      title: "2 · ออกแบบ Strict Pydantic Schemas สำหรับเอกสารไทย 3 ประเภท",
      paragraphs: [
        "แทนที่จะปล่อยให้ {{llm}} คืน `dict[str, Any]` ก้อนเดียวที่เดาโครงสร้างไม่ได้ เรานิยาม **Typed Envelope** (`ThaiDocExtraction`) ที่มีฟิลด์ตัวจำแนก `doc_type: Literal[\"receipt\", \"support_ticket\", \"tax_invoice_request\"]` คู่กับฟิลด์ payload เฉพาะทาง 3 ช่อง (`receipt`, `support_ticket`, `tax_invoice_request`) ที่ตั้ง `ConfigDict(extra=\"forbid\")` ทุกชั้น",
        "จุดสำคัญของการออกแบบ {{data-contract}} ภาษาไทยคือ: (1) ใช้ `| None` กับฟิลด์ที่ลูกค้ามักลืมกรอก (เช่น `order_ref` หรือ `merchant_tax_id`) เพื่อลด {{hallucination}}, (2) ใช้ `field_validator` บังคับรูปแบบข้อมูลไทยที่เข้มงวด เช่น **เลขประจำตัวผู้เสียภาษี 13 หลัก** (ล้างขีด `-` และช่องว่างแล้วต้องเป็นตัวเลขครบ 13 ตัวพอดี), และ (3) ใช้ `@model_validator(mode=\"after\")` บังคับว่า *payload ที่ถูกเติมต้องตรงกับ `doc_type` เท่านั้น* และช่องอื่นต้องเป็น `None` เพื่อ {{fail-fast}} ทันทีหากโมเดลสับสนชนิดเอกสาร",
      ],
      analogy: "เหมือนซองเอกสาร 3 สีของฝ่ายธุรการที่มีช่องกรอกเฉพาะเรื่องไม่เหมือนกัน: ถ้าหน้าซองติ๊กว่า \"ขอใบกำกับภาษี\" แต่ข้างในกลับแนบแบบฟอร์ม \"แจ้งซ่อม\" แทน ระบบตรวจรับจะตีกลับทันทีตั้งแต่หน้าเคาน์เตอร์",
      code: {
        language: "python",
        filename: "doc_contracts.py",
        code: `import re
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class TaxInvoiceRequestPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_name: str = Field(min_length=2)
    tax_id_13: str | None = Field(default=None, description="เลขผู้เสียภาษี 13 หลัก หรือ null หากไม่ระบุ")
    order_ref: str | None = None

    @field_validator("tax_id_13")
    @classmethod
    def check_thai_tax_id(cls, v: str | None) -> str | None:
        if v is None:
            return None
        digits = re.sub(r"[\\s-]", "", v)
        if not re.fullmatch(r"\\d{13}", digits):
            raise ValueError("เลขประจำตัวผู้เสียภาษีไทยต้องเป็นตัวเลขครบ 13 หลัก")
        return digits


p = TaxInvoiceRequestPayload(entity_name="บริษัท สยามคลาวด์ จำกัด", tax_id_13="0-1055-60001-23-4")
print("Normalized Tax ID:", p.tax_id_13)`,
        caption: "ล้างขีดคั่นในเลขผู้เสียภาษีไทยและตรวจสอบครบ 13 หลักในชั้น Pydantic เพื่อลดขยะข้อมูลก่อนเข้าสู่ระบบบัญชี",
      },
      whyTitle: "Why this matters — ตรวจความสอดคล้องของ Discriminator ป้องกันบั๊กข้ามระบบ",
      whyParagraphs: [
        "ถ้าไม่มี `@model_validator` เช็กความตรงกันระหว่าง `doc_type` กับฟิลด์ payload โค้ดปลายทางที่เขียนว่า `if doc.doc_type == \"receipt\": process(doc.receipt)` อาจพังด้วย `AttributeError: 'NoneType'` กลาง production",
        "การล็อกสัญญาข้อมูลให้แน่นตั้งแต่วันออกแบบช่วยให้ Day 88 (Pipeline) และ Day 89 (Edge Cases) เขียนต่อได้ลื่นและสะอาดมาก",
      ],
    },
    {
      id: "routing-and-versioned-cache-key",
      title: "3 · นโยบาย Routing 3 ระดับ + การออกแบบ Versioned Cache Key ที่ไม่เสิร์ฟผลเก่า",
      paragraphs: [
        "เพื่อคุมต้นทุนให้ต่ำกว่า `$1.50 / 1,000 docs` โดยยังคงความแม่นยำสูง สถาปัตยกรรม Milestone #3 วางเส้นทางประมวลผล **4 ด่านเรียงตามต้นทุนจากถูกไปแพง**:",
        "(1) **Exact Response Cache ({{sqlite}})**: ต้นทุน `$0`, latency `< 2 ms` — เอกสารซ้ำหรือใบเสร็จที่ส่งเข้ามาซ้ำไม่ต้องเรียก LLM เลย, (2) **Small / Local Tier (Ollama หรือ Cloud Small Model)**: รับงานปกติ 75%–85% พร้อม {{prompt-caching}} prefix คงที่, (3) **Frontier Escalation Tier**: รับเฉพาะเอกสารยาวเกินเกณฑ์, เคส `confidence < 0.80`, หรือเคสที่โมเดลเล็กซ่อมไม่ผ่าน, และ (4) **Safe Fallback ({{hitl}})**: ส่งต่อเจ้าหน้าที่โดยไม่ crash",
        "ข้อผิดพลาดร้ายแรงที่สุดในการออกแบบ **Cache Key** คือการแฮชเฉพาะ `doc_text` อย่างเดียว! ลองนึกภาพว่าเมื่อวานคุณใช้ `prompt_v1` ที่สกัดผิด วันนี้คุณอัปเกรดเป็น `prompt_v2` หรือเพิ่มฟิลด์ใหม่ใน `schema_v2` — หาก Cache Key ไม่รวม **`prompt_version`**, **`schema_version`**, และ **`model_name`** ระบบจะยังดึงคำตอบเก่าที่ผิดจาก `prompt_v1` มาเสิร์ฟซ้ำตลอดกาล การแฮช `SHA-256(normalized_text | prompt_version | schema_version | model_name)` จึงเป็นกฎเหล็กของ {{prompt-versioning}} + {{caching}}",
      ],
      analogy: "เหมือนรหัสล็อตบนกล่องยาที่ไม่ได้เขียนแค่ชื่อยา แต่ระบุรุ่นสูตรการผลิตและเวอร์ชันฉลากด้วย — ทันทีที่ปรับปรุงสูตรใหม่ ระบบจะไม่เผลอหยิบกล่องสูตรเก่าจากคลังมาจ่ายให้คนไข้",
      bullets: [
        "**Normalize ก่อน Hash**: ล้าง `\\u200b` และช่องว่างซ้ำ เพื่อให้ข้อความเดียวกันที่มีเว้นวรรคต่างกันนิดหน่อยยังได้ **Cache Hit**",
        "**Version Salt**: เปลี่ยน `prompt_version` (เช่น `v1.0` → `v1.1`) หรือ `schema_version` เมื่อไร Cache Key จะเปลี่ยนทันทีโดยไม่ต้องล้างตารางทิ้งทั้งหมด",
        "**Never Cache Fallbacks**: บันทึกลง cache เฉพาะผลที่ผ่าน Pydantic validation สมบูรณ์เท่านั้น เพื่อไม่ให้ cache เก็บความล้มเหลวไว้ถาวร",
      ],
      whyTitle: "Why this matters — สะพานตรงสู่การลงมือสร้าง Pipeline ใน Day 88",
      whyParagraphs: [
        "ในวันพรุ่งนี้ (Day 88) เราจะนำ `make_extraction_cache_key` ที่ออกแบบวันนี้ไปเสียบเข้ากับตาราง {{sqlite}} จริง พร้อมทดสอบใน `pytest` ว่าการอัปเกรด `prompt_version` ทำให้ cache invalidate อัตโนมัติ",
        "การออกแบบ Cache Key ให้ถูกตั้งแต่แรกช่วยป้องกันบั๊กลึกลับแบบ *\"แก้ prompt แล้วแต่ผลไม่เปลี่ยน\"* ที่ทีม AI เจอกันบ่อยที่สุด",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Discriminated Pydantic Envelope ≈ TypeScript Union + Versioned Redis Key",
      body: [
        "ถ้าคุณเขียน TypeScript การออกแบบ `ThaiDocExtraction` ที่มี `doc_type` คู่กับ payload 3 ชนิด ก็คือ **Discriminated Union** (`type Doc = { type: 'receipt'; ... } | ...`) ที่บังคับ type-safety ตั้งแต่ขอบเขต API",
        "ส่วน Versioned Cache Key ก็เหมือนการใส่ prefix เวอร์ชันใน Redis Key (`v2:schema3:sha256(...)`) เพื่อทำ **Zero-Downtime Cache Invalidation** เวลา deploy โค้ดเวอร์ชันใหม่โดยไม่ต้องสั่ง `FLUSHALL`",
      ],
      table: [
        ["`doc_type` + 3 typed payloads + validator", "TypeScript Discriminated Union + Zod `discriminatedUnion`"],
        ["`sha256(norm_text | prompt_v | schema_v)`", "Versioned Redis/CDN Cache Key (`v2:sha256(...)`)"],
        ["Small / Local → Frontier Escalation", "L1 Edge/Fast Worker → L2 Heavy Worker"],
        ["SLA Gate (`accuracy`, `p95`, `cost/1k`)", "SLO / Performance Budget Check ใน CI"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมถึงต้องเสียเวลา 1 วันเต็มเพื่อ \"ออกแบบ\" ก่อนเขียนโค้ด?",
      body: [
        "ในโปรเจกต์เล็ก ๆ การเปิดไฟล์แล้วลุยเขียนโค้ดเลยอาจดูเร็วกว่า แต่พอระบบมีหลายส่วน (3 ประเภทเอกสาร + Cache + Router + Repair Loop + Eval) การไม่นิยาม Data Contract และ SLA ให้ชัดก่อนจะทำให้คุณต้องรื้อโค้ดแก้ซ้ำ 3–4 รอบ",
        "การออกแบบพิมพ์เขียวใน Day 87 ทำให้ Day 88–92 กลายเป็นการต่อชิ้นส่วนจิ๊กซอว์ที่ขอบพอดีกันทุกตัว",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: วางพิมพ์เขียวโค้ดสัญญาข้อมูลของ Phase 3 Mini-Project ครบทั้ง 3 ส่วน — (1) Strict Schemas สำหรับเอกสารไทย 3 ประเภท, (2) Versioned SHA-256 Cache Key, และ (3) ตัวตรวจ SLA Gate",
    steps: [
      {
        title: "1 · นิยาม Payload 3 ประเภทและ Envelope กลางที่ตรวจความสอดคล้องข้ามฟิลด์",
        explain: "บังคับ `ConfigDict(extra=\"forbid\")` ทุกโมเดล, ล้างขีดเลขผู้เสียภาษี 13 หลัก, และเช็กใน `@model_validator` ว่าฟิลด์ payload ที่ไม่เป็น `None` ต้องตรงกับ `doc_type` เท่านั้น",
        code: {
          language: "python",
          filename: "worked_day87.py",
          code: `import re
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ReceiptPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    merchant_name: str = Field(min_length=1)
    total_thb: float = Field(ge=0.0)
    receipt_date: str | None = None


class SupportTicketPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    category: Literal["billing", "shipping", "technical", "account"]
    urgency: Literal["low", "medium", "high"]
    summary_th: str = Field(min_length=5, max_length=160)


class TaxInvoiceRequestPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    entity_name: str = Field(min_length=2)
    tax_id_13: str | None = None
    order_ref: str | None = None

    @field_validator("tax_id_13")
    @classmethod
    def validate_tax_id(cls, v: str | None) -> str | None:
        if v is None:
            return None
        digits = re.sub(r"[\\s-]", "", v)
        if not re.fullmatch(r"\\d{13}", digits):
            raise ValueError("tax_id_13 must be exactly 13 digits")
        return digits


class ThaiDocExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    doc_type: Literal["receipt", "support_ticket", "tax_invoice_request"]
    confidence: float = Field(ge=0.0, le=1.0)
    receipt: ReceiptPayload | None = None
    support_ticket: SupportTicketPayload | None = None
    tax_invoice_request: TaxInvoiceRequestPayload | None = None
    needs_human_review: bool = False

    @model_validator(mode="after")
    def verify_matching_payload(self) -> "ThaiDocExtraction":
        mapping = {
            "receipt": self.receipt,
            "support_ticket": self.support_ticket,
            "tax_invoice_request": self.tax_invoice_request,
        }
        if mapping[self.doc_type] is None:
            raise ValueError(f"Payload '{self.doc_type}' must not be None")
        extras = [k for k, v in mapping.items() if k != self.doc_type and v is not None]
        if extras:
            raise ValueError(f"Unexpected non-null payload(s) for doc_type='{self.doc_type}': {extras}")
        return self


doc = ThaiDocExtraction(
    doc_type="tax_invoice_request",
    confidence=0.95,
    tax_invoice_request=TaxInvoiceRequestPayload(entity_name="บจก. เอไอไทย", tax_id_13="01055-6000-1234"),
)
print("Valid Envelope:", doc.doc_type, "| TaxID:", doc.tax_invoice_request.tax_id_13)`,
        },
        output: `Valid Envelope: tax_invoice_request | TaxID: 0105560001234`,
      },
      {
        title: "2 · สร้าง Versioned SHA-256 Cache Key ที่ Normalize ข้อความไทยก่อนแฮช",
        explain: "ทดสอบว่าข้อความเดียวกันที่มีช่องว่างเกินยังได้ Cache Key เดิม (Cache Hit) แต่ทันทีที่เปลี่ยน `prompt_version` จาก `v1` เป็น `v2` Key จะเปลี่ยนทันที (Auto Invalidation)",
        code: {
          language: "python",
          filename: "worked_day87.py",
          code: `import hashlib


def make_cache_key(doc_text: str, *, prompt_version: str, schema_version: str, model_name: str) -> str:
    norm = re.sub(r"\\s+", " ", doc_text.replace("\\u200b", "")).strip()
    raw = f"{prompt_version}|{schema_version}|{model_name}|{norm}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


k1 = make_cache_key("ใบเสร็จ  ร้านกาแฟ 120 บาท", prompt_version="v1.0", schema_version="s1", model_name="qwen2.5:7b")
k2 = make_cache_key("ใบเสร็จ\\u200b ร้านกาแฟ 120 บาท", prompt_version="v1.0", schema_version="s1", model_name="qwen2.5:7b")
k3 = make_cache_key("ใบเสร็จ ร้านกาแฟ 120 บาท", prompt_version="v1.1", schema_version="s1", model_name="qwen2.5:7b")

print("Same text (noisy whitespace) -> same key?:", k1 == k2)
print("Prompt bumped v1.0 -> v1.1   -> same key?:", k1 == k3)
print("Key sample (16 chars):", k1[:16])`,
        },
        output: `Same text (noisy whitespace) -> same key?: True
Prompt bumped v1.0 -> v1.1   -> same key?: False
Key sample (16 chars): 4e91c8b3f20d7a15`,
      },
      {
        title: "3 · ตรวจเป้าหมาย SLA ของ Phase 3 Mini-Project",
        explain: "เช็กว่าค่าตัวชี้วัดที่วัดได้ผ่านเกณฑ์ Milestone #3 ทั้ง 4 ข้อหรือไม่ (`accuracy >= 0.90`, `schema_valid_rate >= 0.99`, `p95_latency_ms <= 2500`, `cost_per_1k_usd <= 1.50`)",
        code: {
          language: "python",
          filename: "worked_day87.py",
          code: `def evaluate_sla(
    *,
    accuracy: float,
    schema_valid_rate: float,
    p95_latency_ms: float,
    cost_per_1k_usd: float,
) -> dict[str, object]:
    checks = {
        "accuracy_ok": accuracy >= 0.90,
        "schema_ok": schema_valid_rate >= 0.99,
        "latency_ok": p95_latency_ms <= 2500.0,
        "cost_ok": cost_per_1k_usd <= 1.50,
    }
    failed = [name for name, ok in checks.items() if not ok]
    return {"passed": len(failed) == 0, "failed_gates": failed, **checks}


print("Good build:", evaluate_sla(accuracy=0.93, schema_valid_rate=0.995, p95_latency_ms=1420.0, cost_per_1k_usd=0.85))
print("Slow/Expensive:", evaluate_sla(accuracy=0.94, schema_valid_rate=0.99, p95_latency_ms=3400.0, cost_per_1k_usd=2.40))`,
        },
        output: `Good build: {'passed': True, 'failed_gates': [], 'accuracy_ok': True, 'schema_ok': True, 'latency_ok': True, 'cost_ok': True}
Slow/Expensive: {'passed': False, 'failed_gates': ['latency_ok', 'cost_ok'], 'accuracy_ok': True, 'schema_ok': True, 'latency_ok': False, 'cost_ok': False}`,
      },
    ],
    gotcha: "ข้อควรระวังเรื่อง `model_name` ใน Cache Key: หากระบบของคุณใช้ Tiered Routing (Small → Frontier) ให้ใส่ **Routing Policy Version** (เช่น `router-v1`) หรือชื่อ pipeline ลงใน Cache Key แทนชื่อโมเดลเดี่ยว เพื่อไม่ให้คำขอเดียวกันต้องเก็บซ้ำสองรอบและยัง invalidate ได้เมื่อเปลี่ยนนโยบาย router",
  },

  practice: {
    intro: "สร้างไฟล์สัญญาข้อมูลและพิมพ์เขียวของ Phase 3 Mini-Project ใน `exercise_day87.py` ให้ครบทั้ง 3 Payload Schemas, Envelope Validator, Versioned Cache Key และ SLA Gate Checker",
    requirements: [
      "สร้าง 3 strict payload models (`ConfigDict(extra=\"forbid\")`): `ReceiptPayload(merchant_name: str, total_thb: float >= 0, receipt_date: str | None = None)`, `SupportTicketPayload(category: Literal[\"billing\", \"shipping\", \"technical\", \"account\"], urgency: Literal[\"low\", \"medium\", \"high\"], summary_th: str ความยาว 5..160 หลัง strip)`, และ `TaxInvoiceRequestPayload(entity_name: str >= 2 chars, tax_id_13: str | None = None, order_ref: str | None = None)` พร้อม validator ล้างขีด/ช่องว่างและตรวจ `tax_id_13` ครบ 13 หลักเมื่อไม่เป็น `None`",
      "สร้าง `ThaiDocExtraction(BaseModel)` (`extra=\"forbid\"`) ที่มี `doc_type: Literal[\"receipt\", \"support_ticket\", \"tax_invoice_request\"]`, `confidence: float` (`0.0..1.0`), `receipt`, `support_ticket`, `tax_invoice_request`, `needs_human_review: bool = False` พร้อม `@model_validator(mode=\"after\")` บังคับให้มีเฉพาะ payload ที่ตรงกับ `doc_type` เท่านั้นที่ไม่เป็น `None` และหาก `receipt` มี `total_thb >= 50000.0` แต่ `needs_human_review` เป็น `False` ให้ `raise ValueError`",
      "สร้าง `make_extraction_cache_key(doc_text: str, *, prompt_version: str, schema_version: str, policy_version: str) -> str`: ตรวจว่าค่า version ทั้ง 3 และข้อความหลัง normalize (`\\u200b`, `\\ufeff`, ช่องว่างซ้ำ) ไม่ว่าง (ไม่งั้น `raise ValueError`) แล้วคืน hex digest SHA-256 ความยาว 64 ตัวอักษร",
      "สร้าง `check_sla_budget(*, accuracy: float, schema_valid_rate: float, p95_latency_ms: float, cost_per_1k_usd: float) -> dict[str, object]` ที่ตรวจช่วงค่า (`0 <= accuracy <= 1`, `0 <= schema_valid_rate <= 1`, `p95_latency_ms >= 0`, `cost_per_1k_usd >= 0` — ไม่งั้น `raise ValueError`) และเทียบกับเกณฑ์ Milestone #3 (`accuracy >= 0.90`, `schema_valid_rate >= 0.99`, `p95_latency_ms <= 2500.0`, `cost_per_1k_usd <= 1.50`) คืน `passed: bool` และ `failed_gates: list[str]`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day87.py",
      code: `import hashlib
import re
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ReceiptPayload(BaseModel):
    # TODO: ConfigDict(extra="forbid") + fields
    pass


class SupportTicketPayload(BaseModel):
    # TODO: ConfigDict(extra="forbid") + fields + summary_th validator
    pass


class TaxInvoiceRequestPayload(BaseModel):
    # TODO: ConfigDict(extra="forbid") + fields + 13-digit Thai tax ID validator
    pass


class ThaiDocExtraction(BaseModel):
    # TODO: Envelope + model_validator ตรวจ matching payload & high-value receipt HITL rule
    pass


def make_extraction_cache_key(
    doc_text: str,
    *,
    prompt_version: str,
    schema_version: str,
    policy_version: str,
) -> str:
    """สร้าง Versioned SHA-256 Cache Key หลัง normalize ข้อความไทย."""
    # TODO: implement
    raise NotImplementedError


def check_sla_budget(
    *,
    accuracy: float,
    schema_valid_rate: float,
    p95_latency_ms: float,
    cost_per_1k_usd: float,
) -> dict[str, object]:
    """ตรวจว่าตัวชี้วัดผ่านเกณฑ์ Milestone #3 SLA ครบทั้ง 4 ข้อหรือไม่."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day87.py",
      code: `import pytest
from pydantic import ValidationError
from exercise_day87 import (
    ReceiptPayload,
    SupportTicketPayload,
    TaxInvoiceRequestPayload,
    ThaiDocExtraction,
    check_sla_budget,
    make_extraction_cache_key,
)


def test_tax_id_normalization_and_rejection():
    ok = TaxInvoiceRequestPayload(entity_name="บริษัท ไทยเทค จำกัด", tax_id_13="0-1055-60001-23-4")
    assert ok.tax_id_13 == "0105560001234"
    nullable = TaxInvoiceRequestPayload(entity_name="บริษัท ไทยเทค จำกัด", tax_id_13=None)
    assert nullable.tax_id_13 is None
    with pytest.raises(ValidationError):
        TaxInvoiceRequestPayload(entity_name="บริษัท ไทยเทค จำกัด", tax_id_13="12345")


def test_envelope_matching_payload_and_high_value_receipt():
    # mismatched payload
    with pytest.raises(ValidationError):
        ThaiDocExtraction(
            doc_type="receipt",
            confidence=0.92,
            support_ticket=SupportTicketPayload(category="billing", urgency="low", summary_th="สอบถามยอดใบเสร็จ"),
        )
    # two payloads populated at once
    with pytest.raises(ValidationError):
        ThaiDocExtraction(
            doc_type="receipt",
            confidence=0.92,
            receipt=ReceiptPayload(merchant_name="ร้าน A", total_thb=150.0),
            support_ticket=SupportTicketPayload(category="billing", urgency="low", summary_th="สอบถามยอดใบเสร็จ"),
        )
    # high-value receipt requires human review
    with pytest.raises(ValidationError):
        ThaiDocExtraction(
            doc_type="receipt",
            confidence=0.95,
            receipt=ReceiptPayload(merchant_name="ร้านคอมพิวเตอร์", total_thb=55000.0),
            needs_human_review=False,
        )
    ok = ThaiDocExtraction(
        doc_type="receipt",
        confidence=0.95,
        receipt=ReceiptPayload(merchant_name="ร้านคอมพิวเตอร์", total_thb=55000.0),
        needs_human_review=True,
    )
    assert ok.needs_human_review is True


def test_versioned_cache_key_stability_and_invalidation():
    k1 = make_extraction_cache_key("ใบเสร็จ  ร้าน A 100 บาท", prompt_version="v1", schema_version="s1", policy_version="r1")
    k2 = make_extraction_cache_key("ใบเสร็จ\\u200b ร้าน A\\n100 บาท", prompt_version="v1", schema_version="s1", policy_version="r1")
    k3 = make_extraction_cache_key("ใบเสร็จ ร้าน A 100 บาท", prompt_version="v2", schema_version="s1", policy_version="r1")
    k4 = make_extraction_cache_key("ใบเสร็จ ร้าน A 100 บาท", prompt_version="v1", schema_version="s2", policy_version="r1")

    assert len(k1) == 64
    assert k1 == k2
    assert k1 != k3
    assert k1 != k4
    with pytest.raises(ValueError):
        make_extraction_cache_key("   \\u200b ", prompt_version="v1", schema_version="s1", policy_version="r1")


def test_sla_budget_gates():
    good = check_sla_budget(accuracy=0.92, schema_valid_rate=0.994, p95_latency_ms=1800.0, cost_per_1k_usd=1.10)
    assert good["passed"] is True
    assert good["failed_gates"] == []

    bad = check_sla_budget(accuracy=0.85, schema_valid_rate=0.98, p95_latency_ms=3100.0, cost_per_1k_usd=2.10)
    assert bad["passed"] is False
    assert len(bad["failed_gates"]) == 4

    with pytest.raises(ValueError):
        check_sla_budget(accuracy=1.2, schema_valid_rate=0.99, p95_latency_ms=500.0, cost_per_1k_usd=0.5)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases ในเวลา < 1 วินาที",
      "ตรวจว่าเลขผู้เสียภาษี `\"0-1055-60001-23-4\"` ถูก normalize เป็น `\"0105560001234\"` และเลขไม่ครบ 13 หลักถูกปฏิเสธ",
      "ตรวจว่า `ThaiDocExtraction` ปฏิเสธเคสที่ payload ไม่ตรงกับ `doc_type` และเคสใบเสร็จ `>= 50,000` บาทที่ลืมตั้ง `needs_human_review=True`",
      "ตรวจว่าการเปลี่ยน `prompt_version` หรือ `schema_version` เปลี่ยน SHA-256 Cache Key ทันที",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day87.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `ThaiDocExtraction.@model_validator(mode=\"after\")` สร้าง dict mapping 3 ตัว (`receipt`, `support_ticket`, `tax_invoice_request`) เพื่อเช็กว่าช่องที่ตรงกับ `self.doc_type` ไม่ใช่ `None` และอีก 2 ช่องต้องเป็น `None` ทั้งคู่",
      },
      {
        body: "ใน `make_extraction_cache_key` ให้ `strip()` ค่า version ทั้ง 3 ตัวก่อนเช็กว่าไม่ว่าง แล้วเชื่อมด้วยตัวคั่นคงที่ (เช่น `\"|\"`) ก่อนเรียก `hashlib.sha256(...).hexdigest()`",
      },
      {
        body: "โครงของ `ThaiDocExtraction` และ `make_extraction_cache_key` — เติม 3 payload models และ `check_sla_budget` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day87.py",
          code: `def make_extraction_cache_key(
    doc_text: str,
    *,
    prompt_version: str,
    schema_version: str,
    policy_version: str,
) -> str:
    norm_text = re.sub(r"\\s+", " ", doc_text.replace("\\u200b", "").replace("\\ufeff", "")).strip()
    pv, sv, rv = prompt_version.strip(), schema_version.strip(), policy_version.strip()
    if not norm_text or not pv or not sv or not rv:
        raise ValueError("doc_text and all version identifiers must be non-empty")
    material = f"{pv}|{sv}|{rv}|{norm_text}"
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def check_sla_budget(
    *,
    accuracy: float,
    schema_valid_rate: float,
    p95_latency_ms: float,
    cost_per_1k_usd: float,
) -> dict[str, object]:
    if not (0.0 <= accuracy <= 1.0) or not (0.0 <= schema_valid_rate <= 1.0):
        raise ValueError("Rates must be within [0.0, 1.0]")
    if p95_latency_ms < 0 or cost_per_1k_usd < 0:
        raise ValueError("Latency and cost must be non-negative")
    gates = {
        "accuracy": accuracy >= 0.90,
        "schema_valid_rate": schema_valid_rate >= 0.99,
        "p95_latency_ms": p95_latency_ms <= 2500.0,
        "cost_per_1k_usd": cost_per_1k_usd <= 1.50,
    }
    failed = [k for k, ok in gates.items() if not ok]
    return {"passed": not failed, "failed_gates": failed}`,
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
      title: "สร้าง Cache Key จากข้อความเอกสารอย่างเดียวโดยไม่รวม `prompt_version` และ `schema_version`",
      symptom: "อัปเกรด prompt แก้บั๊กการสกัดใบเสร็จแล้ว แต่ระบบยังคืนคำตอบผิด ๆ แบบเดิมให้เอกสารที่เคยส่งเข้ามา",
      fix: "ใส่ `prompt_version`, `schema_version` และ `policy_version` ลงในวัสดุก่อนแฮช SHA-256 ทุกครั้ง",
    },
    {
      title: "ปล่อยให้ Payload ของเอกสารหลายประเภทถูกเติมพร้อมกันหรือเป็น `None` ทั้งหมด",
      symptom: "`doc_type == \"receipt\"` แต่ `receipt` เป็น `None` ทำให้โค้ดฝั่งบัญชีพังด้วย `AttributeError`",
      fix: "เขียน `@model_validator(mode=\"after\")` บังคับให้มีเฉพาะ payload ที่ตรงกับ `doc_type` เท่านั้นที่ไม่เป็น `None`",
    },
    {
      title: "ไม่ normalize ขีดคั่นในเลขประจำตัวผู้เสียภาษี 13 หลักของไทย",
      symptom: "เอกสารลูกค้าพิมพ์ `0-1055-60001-23-4` แล้ว validator ปฏิเสธเพราะเช็ก `len(v) == 13` ตรง ๆ",
      fix: "ล้างช่องว่างและขีด `-` ออกก่อนด้วย regex แล้วตรวจ `\\d{13}` เพื่อให้ได้รูปแบบมาตรฐาน 13 หลักพร้อมเก็บลงฐานข้อมูล",
    },
    {
      title: "เริ่มเขียน Pipeline โดยไม่ตั้งเป้าหมาย SLA (Accuracy, Latency, Cost)",
      symptom: "สร้างเสร็จแล้วไม่รู้ว่าความเร็ว 6 วินาทีหรือต้นทุน `$12/1k docs` ยอมรับได้หรือไม่ และไม่รู้ว่าจะปรับจุดไหนก่อน",
      fix: "กำหนดตัวเลขเป้าหมาย 4 แกนตั้งแต่ขั้นตอน Design (Day 87) แล้วตรวจด้วยฟังก์ชัน SLA Gate อัตโนมัติหลังรัน eval",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d087-q1",
        "เหตุใด Cache Key ของระบบ Extraction จึงต้องแฮช `normalized_text` คู่กับ `prompt_version` และ `schema_version` แทนการแฮชเฉพาะ `doc_text`?",
        [
          ["เพื่อให้ความยาวของ SHA-256 ยาวขึ้นเป็น 128 ตัวอักษร", "SHA-256 คืนความยาว 64 ตัวอักษรเสมอไม่ว่า input จะสั้นหรือยาว"],
          ["เพื่อทำ Automatic Cache Invalidation ทันทีที่ปรับปรุง prompt หรือแก้ Pydantic schema โดยไม่เสิร์ฟผลลัพธ์เก่าที่ล้าสมัย", "ถูก — เมื่อเวอร์ชันเปลี่ยน Cache Key จะเปลี่ยนทันที ช่วยป้องกันบั๊กแก้ prompt แล้วผลไม่เปลี่ยน"],
          ["เพราะ SQLite ไม่รองรับ primary key ที่เกิดจากข้อความภาษาไทย", "SHA-256 แปลงข้อความใด ๆ เป็น ASCII hex อยู่แล้ว ไม่ใช่ข้อจำกัดของ SQLite"],
          ["เพื่อบังคับให้เกิด Cache Miss 100% ทุกคำขอ", "ไม่จริง — คำขอเดิมภายใต้เวอร์ชันเดียวกันยังคง Cache Hit 100%"],
        ],
        "B",
        "การรวม `prompt_version` และ `schema_version` ไว้ใน Cache Key ทำให้การอัปเกรดระบบ invalidate ข้อมูลเก่าได้อย่างปลอดภัยโดยไม่ต้องล้างฐานข้อมูล cache ทิ้งทั้งหมด",
        "ต้องใส่องค์ประกอบใดบ้างลงใน Cache Key ของระบบ LLM Document Extractor?",
        "`normalized_doc_text` + `prompt_version` + `schema_version` + `policy_version` (หรือ `model_name`) แล้วแฮชด้วย SHA-256",
      ),
      mc(
        "d087-q2",
        "ใน `ThaiDocExtraction` ที่มี `doc_type` และช่อง payload 3 ประเภท (`receipt`, `support_ticket`, `tax_invoice_request`) เหตุใดจึงต้องเพิ่ม `@model_validator(mode=\"after\")`?",
        [
          ["เพื่อเร่งความเร็วในการสร้างคำตอบของ LLM ให้เร็วขึ้น 2 เท่า", "validator ทำงานฝั่ง Python หลังได้รับผลลัพธ์ ไม่ได้เร่งความเร็ว LLM"],
          ["เพื่อรับประกันความสอดคล้องข้ามฟิลด์ว่า payload ที่ถูกเติมตรงกับ `doc_type` เท่านั้น และบังคับกฎธุรกิจอย่างใบเสร็จยอดสูงต้องเข้าคิว HITL", "ถูก — JSON Schema พื้นฐานตรวจความสัมพันธ์ข้ามฟิลด์ลักษณะนี้ไม่ได้ ต้องให้ `@model_validator` ช่วย fail-fast"],
          ["เพราะ Pydantic v2 ไม่สามารถใช้ `Literal` ร่วมกับ `BaseModel` ได้โดยตรง", "Pydantic v2 รองรับ `Literal` เต็มรูปแบบอยู่แล้ว"],
          ["เพื่อแปลงสกุลเงิน THB เป็น USD อัตโนมัติ", "ไม่เกี่ยวกัน — จุดประสงค์คือการตรวจสัญญาข้อมูลข้ามฟิลด์"],
        ],
        "B",
        "ความสัมพันธ์ข้ามฟิลด์ (cross-field invariant) อย่าง `doc_type` ต้องตรงกับฟิลด์ payload ที่ไม่เป็น `None` และเงื่อนไขยอดเงินสูงต้องส่งเจ้าหน้าที่ ต้องบังคับผ่าน `@model_validator(mode=\"after\")`",
        "กฎใดใน `ThaiDocExtraction` ที่ต้องใช้ `@model_validator(mode='after')` บังคับ?",
        "กฎข้ามฟิลด์: payload ที่ไม่เป็น `None` ต้องตรงกับ `doc_type` ตัวเดียวเท่านั้น และใบเสร็จที่ `total_thb >= 50,000` ต้องตั้ง `needs_human_review=True`",
      ),
      mc(
        "d087-q3",
        "ลูกค้าส่งคำขอออกใบกำกับภาษีโดยพิมพ์เลขผู้เสียภาษีว่า `\"0-1055-60001-23-4\"` แต่ไม่ได้ระบุ `order_ref` Schema ของเราควรจัดการอย่างไร?",
        [
          ["ปฏิเสธทั้งเอกสารเพราะมีขีด `-` และไม่มี `order_ref`", "เข้มงวดผิดจุด — ลูกค้าไทยนิยมพิมพ์เลขผู้เสียภาษีแบบมีขีด และ `order_ref` อาจไม่ถูกระบุมาในแชต"],
          ["Normalize `tax_id_13` ล้างขีดให้เหลือตัวเลข 13 หลัก (`\"0105560001234\"`) และอนุญาตให้ `order_ref` เป็น `None` เพื่อกัน hallucination", "ถูก — ยืดหยุ่นในรูปแบบอินพุตที่พบจริงในไทย แต่เข้มงวดในข้อมูลปลายทางที่สะอาดและไม่บังคับโมเดลเดา"],
          ["ให้ LLM สุ่มเลข `order_ref` ขึ้นมาใส่เพื่อให้ทุกฟิลด์ไม่ว่าง", "ห้ามทำเด็ดขาด — เป็นการจงใจสร้าง hallucination"],
          ["เก็บ `tax_id_13` เป็น `int` เพื่อประหยัดหน่วยความจำ", "อันตรายมาก! เลขผู้เสียภาษีไทยมักขึ้นต้นด้วย `0` (เช่น `01055...`) ถ้าเก็บเป็น `int` เลขศูนย์นำหน้าจะหายทันที"],
        ],
        "B",
        "เลขผู้เสียภาษีไทยต้องเก็บเป็น `str` (รักษาเลข `0` นำหน้า), ล้างขีด/ช่องว่างแล้วตรวจครบ 13 หลัก, และเปิด `| None` ให้ฟิลด์ที่อาจไม่มีในเอกสาร",
        "ทำไม `tax_id_13` ของไทยจึงต้องเก็บเป็น `str` แทน `int` และต้อง normalize ก่อนตรวจ?",
        "เพราะเลขผู้เสียภาษีนิติบุคคลไทยขึ้นต้นด้วย `0` (เก็บเป็น `int` เลข 0 จะหาย) และลูกค้ามักพิมพ์ขีด `-` หรือเว้นวรรคคั่นมาด้วย",
      ),
      mc(
        "d087-q4",
        "ในการออกแบบเส้นทางประมวลผลของ Milestone #3 เหตุใดจึงไม่ควรบันทึกผลลัพธ์ที่เป็น `fallback` (ซ่อมไม่ผ่าน) ลงใน SQLite Response Cache?",
        [
          ["เพราะ SQLite เก็บค่า boolean `needs_human_review=True` ไม่ได้", "SQLite เก็บข้อมูล JSON string ได้ทุกแบบ"],
          ["เพราะหากแคชความล้มเหลวไว้ เมื่อเอกสารเดิมถูกส่งมาประมวลผลใหม่หลังเราแก้ระบบหรือปัญหาชั่วคราวหายแล้ว มันจะยังคงคืน fallback เก่าซ้ำไปเรื่อย ๆ (Cache Poisoning)", "ถูก — ควรแคชเฉพาะผลลัพธ์ที่ผ่าน Pydantic validation สมบูรณ์แล้วเท่านั้น"],
          ["เพราะผลลัพธ์ fallback มีขนาดใหญ่เกิน 1 GB", "fallback payload มีขนาดเล็กมาก ปัญหาคือความถูกต้องของข้อมูลใน cache"],
          ["เพราะ Python `sqlite3` ไม่รองรับคำสั่ง `INSERT` สำหรับ error object", "ไม่จริง — เป็นกฎการออกแบบ caching ที่ดีเพื่อป้องกัน cache poisoning"],
        ],
        "B",
        "Cache ต้องเก็บเฉพาะผลลัพธ์ที่ถูกต้อง (verified valid extractions) เท่านั้น การแคชผลลัพธ์ที่พังหรือ fallback จะทำให้เกิด cache poisoning และบล็อกการกู้คืนระบบ",
        "ผลลัพธ์ประเภทใดที่ **ห้าม** บันทึกลง Response Cache?",
        "ผลลัพธ์ที่พัง, ผ่าน schema ไม่ครบ, หรือตก `fallback` — ควรแคชเฉพาะผลลัพธ์ที่ผ่าน Pydantic validation สมบูรณ์แล้วเท่านั้น",
      ),
    ],
  },

  takeaways: [
    "กำหนดขอบเขต **Milestone #3** ให้ชัดตั้งแต่วันออกแบบ: 3 เอกสารไทย (`receipt`, `support_ticket`, `tax_invoice_request`) ภายใต้ 4 เกณฑ์ SLA (`accuracy ≥ 90%`, `schema ≥ 99%`, `P95 ≤ 2.5s`, `cost ≤ $1.50/1k`)",
    "ออกแบบ {{data-contract}} ด้วย {{pydantic}} v2 (`extra=\"forbid\"`, `| None`, 13-digit Thai Tax ID `str` normalization, และ `@model_validator` ตรวจ payload ตรงกับ `doc_type`)",
    "ผูก SHA-256 Cache Key เข้ากับ `normalized_text + prompt_version + schema_version + policy_version` เพื่อให้การอัปเกรด {{prompt-versioning}} ล้างผลเก่าอัตโนมัติ และห้ามแคชผลลัพธ์ที่ตก `fallback`",
    "พรุ่งนี้ (Day 88 — Review Day) เราจะประกอบพิมพ์เขียวทั้งหมดนี้เป็น Extraction Pipeline ที่มี {{sqlite}} Cache + Routing + Repair Loop ที่ทำงานได้จริงและทดสอบผ่าน `pytest`",
  ],

  reviewCards: [
    rc(
      "d087-rc-1",
      "4 เกณฑ์เป้าหมาย SLA ของ Phase 3 Mini-Project (Thai Document Classifier & Extractor) คืออะไร?",
      "Classification Accuracy ≥ 90%, Schema Validity ≥ 99% (0% crash), P95 Latency ≤ 2,500 ms, และ Blended Cost ≤ $1.50 / 1,000 docs",
    ),
    rc(
      "d087-rc-2",
      "ทำไม `tax_id_13` ในเอกสารไทยต้องเก็บเป็น `str | None` แทน `int`?",
      "เพราะเลขผู้เสียภาษีนิติบุคคลไทยมักขึ้นต้นด้วย `0` (ถ้าเป็น `int` เลข 0 นำหน้าจะหาย) และ `| None` เปิดทางให้โมเดลตอบ `null` ได้เมื่อลูกค้าไม่ได้แจ้งมา",
    ),
    rc(
      "d087-rc-3",
      "ทำไม Versioned Cache Key จึงต้องมีทั้ง `prompt_version` และ `schema_version`?",
      "เพื่อให้ทันทีที่ทีมปรับปรุง prompt หรือแก้โครงสร้าง Pydantic schema ระบบจะสร้าง key ใหม่และไม่เผลอเสิร์ฟผลสกัดเก่าจากเวอร์ชันเดิม",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Docs — Model Validators & Discriminated Unions", href: "https://docs.pydantic.dev/latest/concepts/unions/" },
    { label: "Python Docs — hashlib (SHA-256 Secure Hashes)", href: "https://docs.python.org/3/library/hashlib.html" },
    { label: "Python Docs — sqlite3 DB-API 2.0 Interface", href: "https://docs.python.org/3/library/sqlite3.html" },
    { label: "Anthropic Docs — Prompt Engineering & Versioning Best Practices", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
  ],

  glossary: ["pydantic", "basemodel", "data-contract", "structured-output", "literal", "caching", "prompt-versioning", "hitl"],
});
