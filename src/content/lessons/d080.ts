import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D080 — Phase 3 / Block B20 (Review Day)
 * Review: Quiz + Build 99%-valid Thai invoice/ticket JSON extractor
 */
export const d080: Lesson = defineLesson({
  day: 80,
  titleTh: "ทบทวน B20: สร้างตัวสกัดใบแจ้งหนี้/ทิกเก็ตไทยที่ผ่าน Schema 99%+ พร้อม Repair Loop และ Routing",
  tagline: "30 นาที · รอบทบทวน D77–D79 + D3/D14 · รันทดสอบบนเครื่องได้ 100% ด้วย mock client · ประกอบ Extractor ที่ผ่านสัญญาข้อมูล ≥ 99% ใน pytest",
  icon: "braces",
  visual: {
    id: "validation-repair-loop",
    title: "ทบทวน B20: สร้างตัวสกัดใบแจ้งหนี้/ทิกเก็ตไทยที่ผ่าน Schema 99%+",
    caption: "ผสาน Strict Pydantic Schema + Repair Loop + Model Routing + Fallback พร้อมวัดอัตราผ่านบนชุดทดสอบจำลอง",
    alt: "แผนภาพระบบสกัด JSON ใบแจ้งหนี้ภาษาไทยที่ผ่าน schema 99%",
  },
  requiresApiKey: true,
  apiKeyNote: "ทดสอบและรันลูป repair/routing/cache บนเครื่องได้ 100% ด้วย mock client",
  tools: ["Official SDK", "Pydantic v2", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "รวม Strict Schema + Static Prefix ให้เป็นสัญญาข้อมูลเดียว",
      body: "ตลอด Block B20 เราเห็นแล้วว่า {{data-contract}} ที่แข็งแรงเริ่มจาก {{pydantic}} v2 (`extra=\"forbid\"`, `T | None`, cross-field validators จาก D3/D77) คู่กับ Static Prefix คงที่เพื่อเปิดทางให้ {{prompt-caching}} (D79)",
      lessonNote: "วันนี้เราประกอบทั้ง 3 วัน (D77–D79) + D3/D14 เข้าเป็นตัวสกัดใบแจ้งหนี้ภาษาไทยชิ้นเดียวที่พร้อมใช้จริง",
    },
    {
      node: 2,
      heading: "Small-First Routing + Bounded Repair Loop ดันความแม่นยำสู่ 99%+",
      body: "เคสง่าย 80% จบที่โมเดลเล็กพร้อมซ่อมตัวเองได้ใน 1–2 รอบด้วย {{validation-error}} แบบย่อ (D78) ส่วนเคสความมั่นใจต่ำหรือซ่อมไม่ผ่านจะ escalate ไปโมเดลใหญ่โดยอัตโนมัติ (D79)",
      lessonNote: "เราจะแยกชั้น Semantic Repair ออกจากชั้น HTTP {{exponential-backoff}} (D14) อย่างชัดเจน",
    },
    {
      node: 3,
      heading: "พิสูจน์อัตราผ่าน ≥ 99% บนชุดทดสอบจำลอง 100 เอกสารด้วย pytest",
      body: "คำว่า \"99% valid\" ต้องวัดได้จริงบนชุดทดสอบที่มีทั้งเคสปกติ, ปี พ.ศ. ไทย (`2569`), ยอด VAT ผิด, เคสความมั่นใจต่ำ, และเอกสารเสียหายที่ต้องตก Deterministic Fallback",
      lessonNote: "แบบฝึกหัดวันนี้จำลอง 100 ใบแจ้งหนี้ไทยด้วย {{mocking}} เพื่อตรวจ `valid_rate >= 0.99`, `unique_prefix_hashes == 1` และ `fallback` ที่ปลอดภัย",
    },
    {
      node: 5,
      heading: "ส่งออก Metric ครบทุกมิติเพื่อเตรียมพร้อมสู่ Phase 4–5",
      body: "รายงาน `first_pass_rate`, `repaired_rate`, `fallback_rate`, `frontier_rate` และ `prefix_cache_hash` ช่วยให้ทีมรู้ทันทีทั้งคุณภาพ ต้นทุน และคิวงาน {{hitl}}",
      lessonNote: "จบบล็อก B20 พร้อม Extractor Architecture ที่คุณจะนำไปต่อยอดกับ Multimodal (D81) และ Mini-Project ปลาย Phase 3 (D87)",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบผสมผสาน (Interleaved Recall)** ครบทั้ง D77 (Strict {{structured-output}} + `| None` + `@model_validator`), D78 (Bounded Validation-Repair Loop + Deterministic Fallback), D79 ({{prompt-caching}} Static Prefix + Small/Frontier Routing) และ D3/D14 (Pydantic Validators vs HTTP {{exponential-backoff}})",
    "**ประกอบ** Production-Grade Thai Invoice Extractor ที่ผสาน Strict Pydantic Schema, Immutable Static Prefix, 2-Step Repair Loop, Frontier Escalation และ Safe Fallback ครบใน pipeline เดียว",
    "**ตรวจสอบเชิงปริมาณ** ด้วยชุดทดสอบจำลอง 100 เคสใน {{pytest}} ว่า pipeline ทำ `valid_rate >= 0.99`, รักษา `unique_prefix_hashes == 1`, และจับเอกสารเสียหายเข้าคิว {{hitl}} โดยไม่ crash",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D77 (Strict Pydantic Schema), D78 (Validation-Repair Loop & Fallback), D79 (Prompt Caching & Model Routing)",
    "ทบทวน D3 (`@field_validator` / `@model_validator`) และ D14 (HTTP Retry with {{exponential-backoff}})",
    "มี `uv`, `pydantic`, `pytest` และ `ruff` พร้อมรันบนเครื่อง 100% ด้วย mock client",
  ],

  setup: {
    intro: "สร้างโปรเจกต์รอบทบทวน Block B20 ด้วย {{uv}} เพื่อประกอบและทดสอบตัวสกัดใบแจ้งหนี้ภาษาไทยแบบครบวงจรบนเครื่อง 100%",
    commands: `uv init ai-day80-review && cd ai-day80-review
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('B20 Review Ready | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day80-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันเช็กเวอร์ชันสำเร็จ พร้อมลุยควิซ 10 นาที + ประกอบ Extractor 15 นาที"],
    ],
    note: "จัดเวลา Review Day 30 นาที: 10 นาทีทำ Interleaved Recall Quiz → 15 นาทีประกอบ Thai Invoice Extractor และรันชุดทดสอบ 100 เคสใน `pytest` → 5 นาทีสรุป Error Log ก่อนเริ่ม Block B21 (Multimodal, Batch API & Ollama)",
  },

  concepts: [
    {
      id: "b20-pipeline-synthesis",
      title: "1 · ร้อยต่อจิ๊กซอว์ B20 (D77–D79) + D3/D14 เป็น 4-Layer Extraction Pipeline",
      paragraphs: [
        "เมื่อรวมความรู้ตลอด Block B20 เข้ากับพื้นฐาน Phase 1 (D3 และ D14) ระบบสกัดข้อมูลจากเอกสารไทยระดับ production จะมีโครงสร้างสะอาด 4 ชั้นที่แยกความรับผิดชอบออกจากกันชัดเจน:",
        "**ชั้น 1 — Prompt Layout & Caching (D79)**: สร้างข้อความด้วย **Immutable Static Prefix** ไว้ใน `system` message เพื่อให้ผู้ให้บริการทำ {{prompt-caching}} ได้ทุกคำขอ และวางเอกสารไทยของรอบนั้นไว้ใน `user` message ท้ายสุด (เลี่ยง Lost in the Middle)",
        "**ชั้น 2 — Transport vs Semantic Resilience (D14 + D77 + D78)**: ให้ชั้น HTTP SDK จัดการ timeout/429 ด้วย {{exponential-backoff}} (D14) ส่วนชั้นแอปตรวจผลด้วย {{pydantic}} Strict Schema + cross-field validator (D3/D77) และซ่อมด้วย Bounded Repair Loop `max_retries=2` (D78)",
        "**ชั้น 3 & 4 — Tiered Escalation & Safe Fallback (D79 + D78)**: ลองโมเดลเล็กก่อน 80% หาก `confidence < 0.80` หรือซ่อมครบโควตาแล้วยังไม่ผ่านให้ escalate ไปโมเดลใหญ่ และหากยังไม่ผ่านอีกให้ตัดจบด้วย Deterministic Safe Fallback (`needs_human_review=True`) แทนการ crash",
      ],
      analogy: "เหมือนสายพานตรวจสอบคุณภาพในโรงงานอาหาร: ชั้น 1 ใช้แม่พิมพ์มาตรฐานเดิมทุกรอบ (Static Prefix), ชั้น 2 มีเครื่องชั่งดิจิทัลตรวจซ้ำและปรับแก้ได้ 2 ครั้ง (Pydantic + Repair Loop), ชั้น 3 ส่งชิ้นงานน่าสงสัยให้หัวหน้ากะตรวจละเอียด (Frontier Escalation), และชั้น 4 ดีดชิ้นงานชำรุดลงตะกร้าคัดแยกให้คนตรวจ (Fallback / HITL)",
      bullets: [
        "**D3 + D77**: `ConfigDict(extra=\"forbid\")`, `invoice_no: str | None`, ISO date ค.ศ. 2020–2030, `subtotal + vat == total`, และ `total >= 50,000 → needs_human_review=True`",
        "**D14 vs D78**: HTTP 429/5xx ใช้ backoff ซ้ำคำขอเดิม; `ValidationError` ใช้ Repair Loop ส่งข้อความ `- field: reason` กลับให้แก้",
        "**D79**: ตรวจ `unique_prefix_hashes == 1` เพื่อยืนยันว่าไม่มี dynamic field รั่วเข้า `system` prompt และคุม `frontier_rate` ให้อยู่ราว 15%–25%",
      ],
      whyTitle: "Why this matters — แยกชั้นชัดเจนทำให้ดีบักและขยายระบบได้ง่าย",
      whyParagraphs: [
        "เมื่อแต่ละชั้นมีขอบเขตและผลลัพธ์ชัดเจน คุณสามารถอัปเกรดโมเดลเล็ก เปลี่ยนกฎ VAT หรือเพิ่มช่องฟิลด์ใหม่ใน Pydantic ได้โดยไม่ทำให้ระบบ routing หรือ fallback รวนตามไปด้วย",
        "นี่คือสถาปัตยกรรมต้นแบบของ Phase 3 Mini-Project ที่คุณจะได้ลงมือขยายใน Block B22–B23",
      ],
    },
    {
      id: "contract-compliance-99",
      title: "2 · อ่านตัวเลขความน่าเชื่อถือให้เป็น: First-Pass vs Repaired vs Fallback",
      paragraphs: [
        "หลายคนบอกว่า \"ระบบสกัด JSON ของฉันผ่าน 99%\" แต่ไม่เคยแยกให้เห็นว่า 99% นั้นมาจากรอบแรกเท่าไร ซ่อมผ่านเท่าไร และตก fallback เท่าไร — ในงานวิศวกรรม AI เราต้องรายงาน **5 ตัวเลขคู่กัน** เสมอ:",
        "(1) **`first_pass_rate`**: ผ่านตั้งแต่เรียกครั้งแรก (บอกคุณภาพของ prompt + schema), (2) **`repaired_rate`**: พลาดรอบแรกแต่ซ่อมผ่านด้วย Repair Loop (บอกมูลค่าของ D78), (3) **`valid_rate`** = `first_pass_rate + repaired_rate` (เป้าหมาย ≥ 99% สำหรับเอกสารที่อ่านได้), (4) **`fallback_rate`**: เคสที่ซ่อมไม่ผ่านและถูกส่งเข้าคิว {{hitl}} อย่างปลอดภัย (0% crash), และ (5) **`frontier_rate`**: สัดส่วนที่ escalate ไปโมเดลใหญ่ (คุมงบตาม D79)",
      ],
      analogy: "เหมือนรายงานของคลินิกตรวจสุขภาพ: ไม่ดูแค่ \"คนไข้ปลอดภัย 100%\" แต่แยกให้เห็นว่า 84% แข็งแรงดีตั้งแต่ตรวจรอบแรก, 15% ปรับยาแล้วหาย, และ 1% ส่งต่อโรงพยาบาลเฉพาะทางอย่างปลอดภัย",
      code: {
        language: "python",
        filename: "b20_metrics.py",
        code: `def summarize_compliance(statuses: list[str], tiers: list[str]) -> dict[str, float]:
    n = len(statuses)
    if n == 0:
        raise ValueError("statuses must not be empty")
    ok = sum(s == "ok" for s in statuses)
    repaired = sum(s == "repaired" for s in statuses)
    fallback = sum(s == "fallback" for s in statuses)
    frontier = sum(t == "frontier" for t in tiers)
    return {
        "total": float(n),
        "first_pass_rate": round(ok / n, 4),
        "repaired_rate": round(repaired / n, 4),
        "valid_rate": round((ok + repaired) / n, 4),
        "fallback_rate": round(fallback / n, 4),
        "frontier_rate": round(frontier / n, 4),
    }


sample = summarize_compliance(
    ["ok"] * 84 + ["repaired"] * 15 + ["fallback"] * 1,
    ["small"] * 81 + ["frontier"] * 18 + ["none"] * 1,
)
print(sample)`,
        caption: "แยกให้เห็นชัดว่า 99% valid เกิดจาก first-pass 84% + repair/escalation 15% และอีก 1% ตก fallback อย่างปลอดภัยโดยไม่ทำระบบล่ม",
      },
      whyTitle: "Why this matters — ตัวเลขที่แยกมิติช่วยให้ปรับจูนระบบตรงจุด",
      whyParagraphs: [
        "ถ้า `first_pass_rate` ตกจาก 85% เหลือ 65% แม้ `valid_rate` ยังอยู่ที่ 99% เพราะ Repair Loop ช่วยแบกไว้ ตัวเลขนี้จะเตือนคุณทันทีว่าต้นทุนและ latency กำลังพุ่งขึ้น — ถึงเวลาปรับ prompt หรือเพิ่มตัวอย่าง few-shot แล้ว",
        "การดูแค่ `valid_rate` ตัวเดียวจะบดบังต้นทุนแฝงของการซ่อมและการ escalate",
      ],
    },
    {
      id: "offline-eval-gate-b20",
      title: "3 · ทดสอบ Stress Test 100 เอกสารแบบ 100% ออฟไลน์ก่อนเสียเงินยิง API",
      paragraphs: [
        "ก่อนเชื่อมกับ OpenAI หรือ Anthropic API จริง วิศวกร AI ที่ดีจะสร้าง **Deterministic Mock Stress Suite** ใน {{pytest}} ที่จำลองการกระจายตัวของปัญหาจริงครบทุกแบบ เช่น ใน 100 ใบแจ้งหนี้ไทย:",
        "80 ใบผ่านรอบแรกที่โมเดลเล็ก, 10 ใบโมเดลเล็กตอบปี พ.ศ. หรือ VAT ผิดแล้วซ่อมผ่านในรอบ 2, 9 ใบโมเดลเล็กความมั่นใจต่ำหรือซ่อมไม่ผ่านจึง escalate ไปโมเดลใหญ่แล้วผ่าน, และ 1 ใบเป็นเอกสารเสียหายที่ถูกจับลง Fallback พร้อม `needs_human_review=True`",
        "เมื่อชุดเทสต์ 100 เคสนี้ผ่านใน 0.1 วินาทีบนเครื่อง คุณมั่นใจได้ทันทีว่า **ตรรกะทั้งหมดของ Schema, Prefix Hashing, Repair Loop, Routing และ Fallback ทำงานประสานกันถูกต้อง 100%** ก่อนจะใช้เครดิต API จริงแม้แต่บาทเดียว",
      ],
      analogy: "เหมือนนักบินฝึกใน Flight Simulator ที่จำลองพายุ เครื่องยนต์ดับ และเซนเซอร์รวนครบ 100 สถานการณ์ก่อนขึ้นบินเครื่องจริง — ไม่เสียค่าน้ำมันและไม่เสี่ยงเครื่องตก",
      bullets: [
        "**Contract Safety**: ยืนยันว่าไม่มี uncaught exception หลุดออกมาจากทั้ง 100 เอกสาร",
        "**Cache Invariant**: ยืนยัน `unique_prefix_hashes == 1` ข้ามทั้ง 100 คำขอ",
        "**Cost Guardrail**: ยืนยัน `frontier_rate <= 0.25` และ `valid_rate >= 0.99` ใน CI ทุกครั้งที่แก้โค้ด",
      ],
      whyTitle: "Why this matters — สะพานตรงสู่ Eval-Driven Development ใน Phase 5",
      whyParagraphs: [
        "ชุดทดสอบจำลอง 100 เคสในวันนี้คือต้นแบบของ Automated CI Eval Gate (Promptfoo / Pytest) ที่คุณจะใช้ใน Phase 5",
        "เมื่อมีเพื่อนร่วมทีมเผลอแก้ prompt หรือ validator จนทำลาย cache prefix หรือทำให้ repair loop พัง `pytest` จะจับได้ทันทีภายใน 1 วินาที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — B20 Extractor Pipeline ≈ API Gateway + DTO Validation + Worker DLQ",
      body: [
        "มองทั้ง pipeline ของ B20 เป็นสถาปัตยกรรม Backend มาตรฐานที่คุ้นเคย: `build_static_prefix` คือ Cache Key normalization, `route_and_extract` คือ Tiered Traffic Router, `ThaiInvoiceRecord` คือ Strict DTO Validator, Repair Loop คือ Automated 422 Retry, และ Fallback คือ Dead-Letter Queue",
        "การเขียน 100-case deterministic stress test ด้วย mock functions ใน `pytest` คือ Integration Test ที่รันได้เร็วและเสถียรในทุก Pull Request",
      ],
      table: [
        ["`unique_prefix_hashes == 1`", "CDN Cache Key Stability Test"],
        ["Small-first + Frontier Escalation", "Fast-path / Heavy-path Service Routing"],
        ["Bounded Repair Loop (`max_retries=2`)", "Idempotent 422 Auto-Fix Client"],
        ["`status=\"fallback\"` + `needs_human_review=True`", "Dead-Letter Queue (DLQ) + Manual Triage"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีเช็กว่าเราเข้าใจ Block B20 ทะลุปรุโปร่งหรือยัง",
      body: [
        "ลองอธิบาย 3 คำถามนี้ด้วยปากเปล่าก่อนเปิดโค้ด: (1) ทำไมต้องมีทั้ง Strict Schema และ `@model_validator`? (2) ถ้าซ่อมครบ 2 รอบแล้วยังไม่ผ่านจะเกิดอะไรขึ้น? (3) ทำไมแค่ใส่เวลาปัจจุบันไว้บนสุดของ System Prompt ถึงทำให้ค่า API แพงขึ้น?",
        "ถ้าคุณตอบทั้ง 3 ข้อได้คล่องและรันชุดทดสอบ 100 เคสผ่าน `valid_rate >= 0.99` วันนี้ นั่นแปลว่าคุณพร้อมเต็มที่สำหรับ Block B21 (Multimodal, Batch API และ Local Ollama) แล้ว!",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ประกอบ Thai Invoice Extractor ฉบับสมบูรณ์ที่รวม D77 (Strict Pydantic) + D78 (2-Step Repair + Fallback) + D79 (Static Prefix + Small/Frontier Routing) แล้วรันทดสอบบนชุดจำลอง 100 ใบแจ้งหนี้ไทย",
    steps: [
      {
        title: "1 · นิยาม Strict Schema ใบแจ้งหนี้ไทย (D77 + D3) และ Static Prefix Hasher (D79)",
        explain: "บังคับปี ค.ศ. 2020–2030, `subtotal + vat == total`, และหาก `total_amount >= 50,000` บาทต้องตั้ง `needs_human_review=True` พร้อมแฮช prefix เพื่อยืนยันว่า cache ไม่แตก",
        code: {
          language: "python",
          filename: "worked_day80.py",
          code: `from datetime import date
import hashlib
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class ThaiInvoiceRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    invoice_no: str | None = Field(default=None)
    vendor_name: str = Field(min_length=2)
    issue_date: str
    currency: Literal["THB", "USD"]
    subtotal: float = Field(ge=0.0)
    vat_amount: float = Field(ge=0.0)
    total_amount: float = Field(ge=0.0)
    confidence: float = Field(ge=0.0, le=1.0)
    needs_human_review: bool

    @field_validator("issue_date")
    @classmethod
    def valid_ce_date(cls, v: str) -> str:
        d = date.fromisoformat(v)
        if not (2020 <= d.year <= 2030):
            raise ValueError(f"ปี {d.year} ต้องเป็น ค.ศ. 2020-2030 (หากเป็น พ.ศ. ให้ลบ 543)")
        return v

    @model_validator(mode="after")
    def verify_rules(self) -> "ThaiInvoiceRecord":
        if abs(round(self.subtotal + self.vat_amount, 2) - self.total_amount) > 0.02:
            raise ValueError("subtotal + vat_amount must equal total_amount")
        if self.total_amount >= 50000.0 and not self.needs_human_review:
            raise ValueError("Invoices >= 50,000 THB must set needs_human_review=True")
        return self


def format_errors(err: ValidationError) -> str:
    return "\\n".join(
        f"- {'.'.join(str(p) for p in e['loc']) or '__root__'}: {e['msg']}"
        for e in err.errors()
    )


def static_prefix_hash(rubric: str) -> str:
    return hashlib.sha256(rubric.strip().encode("utf-8")).hexdigest()[:12]`,
        },
        output: `Defined ThaiInvoiceRecord with strict CE date, VAT math, and 50,000 THB review policy.`,
      },
      {
        title: "2 · ประกอบ Pipeline: Static Prefix → Small + Repair → Frontier Escalation → Fallback",
        explain: "ลองโมเดลเล็กพร้อมซ่อมสูงสุด `max_retries` รอบ หากผ่านและ `confidence >= 0.80` จบทันที; มิฉะนั้น escalate ไปโมเดลใหญ่ (ซ่อมได้อีก 1 รอบ); หากยังพังคืน Deterministic Safe Fallback",
        code: {
          language: "python",
          filename: "worked_day80.py",
          code: `from collections.abc import Callable


class PipelineResult(BaseModel):
    status: Literal["ok", "repaired", "fallback"]
    model_tier: Literal["small", "frontier", "none"]
    attempts: int
    cache_prefix_hash: str
    record: ThaiInvoiceRecord | None
    needs_human_review: bool
    error_reasons: list[str]


def _try_tier(
    system_prompt: str,
    doc_text: str,
    llm_fn: Callable[[list[dict[str, str]]], str],
    max_retries: int,
) -> tuple[ThaiInvoiceRecord | None, int, list[str]]:
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": doc_text},
    ]
    errors: list[str] = []
    for attempt in range(1, max_retries + 2):
        raw = llm_fn(messages)
        try:
            return ThaiInvoiceRecord.model_validate_json(raw), attempt, errors
        except ValidationError as exc:
            fb = format_errors(exc)
            errors.append(fb)
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": f"แก้จุดผิดต่อไปนี้แล้วคืน JSON เท่านั้น:\\n{fb}"})
    return None, max_retries + 1, errors


def extract_invoice(
    doc_text: str,
    *,
    small_llm: Callable[[list[dict[str, str]]], str],
    frontier_llm: Callable[[list[dict[str, str]]], str],
    rubric: str,
    max_retries: int = 2,
    confidence_threshold: float = 0.80,
) -> PipelineResult:
    sys_prompt = rubric.strip()
    p_hash = static_prefix_hash(sys_prompt)

    rec, small_tries, small_errs = _try_tier(sys_prompt, doc_text, small_llm, max_retries)
    if rec is not None and rec.confidence >= confidence_threshold:
        return PipelineResult(
            status="ok" if small_tries == 1 else "repaired",
            model_tier="small",
            attempts=small_tries,
            cache_prefix_hash=p_hash,
            record=rec,
            needs_human_review=rec.needs_human_review,
            error_reasons=small_errs,
        )

    f_rec, f_tries, f_errs = _try_tier(sys_prompt, doc_text, frontier_llm, max_retries=1)
    all_errs = small_errs + (["low_confidence_escalated"] if rec is not None else []) + f_errs
    if f_rec is not None:
        return PipelineResult(
            status="repaired",
            model_tier="frontier",
            attempts=small_tries + f_tries,
            cache_prefix_hash=p_hash,
            record=f_rec,
            needs_human_review=f_rec.needs_human_review,
            error_reasons=all_errs,
        )

    return PipelineResult(
        status="fallback",
        model_tier="none",
        attempts=small_tries + f_tries,
        cache_prefix_hash=p_hash,
        record=None,
        needs_human_review=True,
        error_reasons=all_errs,
    )`,
        },
        output: `Composed end-to-end extract_invoice pipeline (Caching + Routing + Repair + Fallback).`,
      },
      {
        title: "3 · รันจำลอง 100 ใบแจ้งหนี้ไทยและวัดอัตราผ่าน ≥ 99%",
        explain: "จำลองชุดข้อมูล 100 เคส: 80 เคสผ่านรอบแรก, 11 เคสปี พ.ศ. ซ่อมผ่านที่โมเดลเล็ก, 8 เคสความมั่นใจต่ำ escalate ไปโมเดลใหญ่แล้วผ่าน, และ 1 เคสเสียหายตก Fallback",
        code: {
          language: "python",
          filename: "worked_day80.py",
          code: `import json

RUBRIC = "สกัดใบแจ้งหนี้ไทยเป็น Strict JSON ใช้ปี ค.ศ. 2020-2030 และตรวจยอดรวม"


def make_json(issue_date="2026-05-10", total=1070.0, conf=0.93, review=False) -> str:
    return json.dumps({
        "invoice_no": "INV-2026-001",
        "vendor_name": "บริษัท คลาวด์ไทย จำกัด",
        "issue_date": issue_date,
        "currency": "THB",
        "subtotal": 1000.0,
        "vat_amount": 70.0,
        "total_amount": total,
        "confidence": conf,
        "needs_human_review": review,
    })


def sim_small(msgs: list[dict[str, str]]) -> str:
    doc = msgs[1]["content"]
    if "CORRUPT" in doc:
        return "unreadable scan"
    if "AMBIGUOUS" in doc:
        return make_json(conf=0.55)
    if "BE_YEAR" in doc and len(msgs) == 2:
        return make_json(issue_date="2569-05-10")  # พลาดปี พ.ศ. รอบแรก แล้วซ่อมผ่านรอบ 2
    return make_json()


def sim_frontier(msgs: list[dict[str, str]]) -> str:
    if "CORRUPT" in msgs[1]["content"]:
        return "still unreadable"
    return make_json(conf=0.98)


docs = ["CLEAN"] * 80 + ["BE_YEAR"] * 11 + ["AMBIGUOUS"] * 8 + ["CORRUPT"] * 1
results = [extract_invoice(d, small_llm=sim_small, frontier_llm=sim_frontier, rubric=RUBRIC) for d in docs]

ok = sum(r.status == "ok" for r in results)
repaired = sum(r.status == "repaired" for r in results)
fallback = sum(r.status == "fallback" for r in results)
frontier = sum(r.model_tier == "frontier" for r in results)
hashes = {r.cache_prefix_hash for r in results}

print(f"Valid Rate: {(ok + repaired)/len(results)*100:.1f}% (ok={ok}, repaired={repaired}, fallback={fallback})")
print(f"Frontier Escalation: {frontier/len(results)*100:.1f}% | Unique Cache Prefix Hashes: {len(hashes)}")`,
        },
        output: `Valid Rate: 99.0% (ok=80, repaired=19, fallback=1)
Frontier Escalation: 8.0% | Unique Cache Prefix Hashes: 1`,
      },
    ],
    gotcha: "สังเกตว่าในเคส `CORRUPT` (1 ใบจาก 100 ใบ) แม้ `valid_rate` จะอยู่ที่ `99.0%` แต่ **Contract Safety ของระบบคือ 100%** เพราะใบที่เสียหายไม่ทำให้ batch ล่มและถูกตั้ง `needs_human_review=True` ส่งเข้าคิวเจ้าหน้าที่ทันที",
  },

  practice: {
    intro: "ประกอบตัวสกัดใบแจ้งหนี้ไทยแบบครบวงจรใน `exercise_day80.py` ที่ผสาน Strict Pydantic Schema (D77) + Bounded Repair Loop & Fallback (D78) + Static Prefix Caching & Small/Frontier Routing (D79) แล้วพิสูจน์ใน `test_day80.py` ว่าผ่าน ≥ 99% บนชุดจำลอง 100 เอกสาร",
    requirements: [
      "สร้าง `ThaiInvoiceRecord(BaseModel)` ตั้ง `ConfigDict(extra=\"forbid\")` มีฟิลด์: `invoice_no: str | None = None`, `vendor_name: str = Field(min_length=2)`, `issue_date: str` (ISO ค.ศ. 2020–2030), `currency: Literal[\"THB\", \"USD\"]`, `subtotal: float >= 0`, `vat_amount: float >= 0`, `total_amount: float >= 0`, `confidence: float` (`0.0..1.0`), `needs_human_review: bool` พร้อม `@model_validator` ตรวจ `abs((subtotal + vat_amount) - total_amount) <= 0.02` และหาก `total_amount >= 50000.0` ต้องมี `needs_human_review is True`",
      "สร้าง `PipelineResult(BaseModel)` มีฟิลด์: `status: Literal[\"ok\", \"repaired\", \"fallback\"]`, `model_tier: Literal[\"small\", \"frontier\", \"none\"]`, `attempts: int`, `cache_prefix_hash: str`, `record: ThaiInvoiceRecord | None`, `needs_human_review: bool`, `error_reasons: list[str]`",
      "สร้าง `extract_invoice(doc_text: str, *, small_llm: Callable[[list[dict[str, str]]], str], frontier_llm: Callable[[list[dict[str, str]]], str], rubric: str, max_retries: int = 2, confidence_threshold: float = 0.80) -> PipelineResult`: ตรวจ `max_retries >= 0` และ `0.0 <= confidence_threshold <= 1.0`, ใช้ `rubric.strip()` เป็น immutable `system` message และแฮชด้วย SHA-256 (12 ตัวแรก) เป็น `cache_prefix_hash`, รัน `small_llm` พร้อม repair loop สูงสุด `max_retries` รอบ, หากได้ `confidence >= confidence_threshold` คืนผลจาก `small`, มิฉะนั้น escalate ไป `frontier_llm` (ซ่อมได้สูงสุด 1 รอบ), และหากยังไม่ผ่านให้คืน Deterministic Safe Fallback (`status=\"fallback\"`, `model_tier=\"none\"`, `record=None`, `needs_human_review=True`)",
      "สร้าง `evaluate_batch(results: list[PipelineResult]) -> dict[str, float]` ที่ตรวจ `results` ไม่ว่าง (ไม่งั้น `raise ValueError`) และคืน dict ที่มีคีย์: `total`, `first_pass_rate`, `repaired_rate`, `valid_rate`, `fallback_rate`, `frontier_rate`, และ `unique_prefix_hashes`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day80.py",
      code: `from collections.abc import Callable
from datetime import date
import hashlib
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class ThaiInvoiceRecord(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid"), fields, CE date validator และ cross-field validators
    pass


class PipelineResult(BaseModel):
    status: Literal["ok", "repaired", "fallback"]
    model_tier: Literal["small", "frontier", "none"]
    attempts: int
    cache_prefix_hash: str
    record: ThaiInvoiceRecord | None
    needs_human_review: bool
    error_reasons: list[str]


def extract_invoice(
    doc_text: str,
    *,
    small_llm: Callable[[list[dict[str, str]]], str],
    frontier_llm: Callable[[list[dict[str, str]]], str],
    rubric: str,
    max_retries: int = 2,
    confidence_threshold: float = 0.80,
) -> PipelineResult:
    """สกัดใบแจ้งหนี้ไทยด้วย Static Prefix + Small/Frontier Routing + Repair Loop + Safe Fallback."""
    # TODO: implement
    raise NotImplementedError


def evaluate_batch(results: list[PipelineResult]) -> dict[str, float]:
    """สรุปตัวชี้วัดคุณภาพ ต้นทุน routing และความเสถียรของ cache prefix."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day80.py",
      code: `import json
import pytest
from exercise_day80 import (
    PipelineResult,
    ThaiInvoiceRecord,
    evaluate_batch,
    extract_invoice,
)

RUBRIC = (
    "สกัดใบแจ้งหนี้ไทยเป็น Strict JSON Schema เท่านั้น ห้ามแต่งเลขที่เอกสาร "
    "แปลงปี พ.ศ. เป็น ค.ศ. 2020-2030 และตั้ง needs_human_review=true เมื่อยอด >= 50000"
)


def _payload(
    *,
    invoice_no: str | None = "INV-2026-080",
    issue_date: str = "2026-05-10",
    subtotal: float = 1000.0,
    vat: float = 70.0,
    total: float = 1070.0,
    confidence: float = 0.94,
    review: bool = False,
) -> str:
    return json.dumps({
        "invoice_no": invoice_no,
        "vendor_name": "บริษัท เอไอไทย จำกัด",
        "issue_date": issue_date,
        "currency": "THB",
        "subtotal": subtotal,
        "vat_amount": vat,
        "total_amount": total,
        "confidence": confidence,
        "needs_human_review": review,
    })


def test_schema_enforces_high_value_review_and_ce_year():
    with pytest.raises(Exception):
        ThaiInvoiceRecord.model_validate_json(_payload(subtotal=50000.0, vat=3500.0, total=53500.0, review=False))
    ok = ThaiInvoiceRecord.model_validate_json(_payload(subtotal=50000.0, vat=3500.0, total=53500.0, review=True))
    assert ok.needs_human_review is True


def test_100_thai_invoices_achieve_99_percent_valid_and_stable_cache_prefix():
    def mock_small(messages: list[dict[str, str]]) -> str:
        # ตรวจว่า system message ไม่แอบใส่เอกสารหรือ id เข้ามาปน
        assert "CASE-" not in messages[0]["content"]
        doc = messages[1]["content"]
        if "CORRUPT" in doc:
            return "not json"
        if "LOW_CONF" in doc:
            return _payload(confidence=0.60)
        if "HARD_MATH" in doc:
            return _payload(total=9999.0)  # โมเดลเล็กแก้ไม่ได้ -> escalate ไป frontier
        if "BE_YEAR" in doc and len(messages) == 2:
            return _payload(issue_date="2569-05-10")  # พลาดรอบแรก ซ่อมผ่านรอบ 2
        if "HIGH_VALUE" in doc and len(messages) == 2:
            return _payload(subtotal=60000.0, vat=4200.0, total=64200.0, review=False)
        if "HIGH_VALUE" in doc:
            return _payload(subtotal=60000.0, vat=4200.0, total=64200.0, review=True)
        return _payload(invoice_no=None)

    def mock_frontier(messages: list[dict[str, str]]) -> str:
        doc = messages[1]["content"]
        if "CORRUPT" in doc:
            return "still broken"
        return _payload(confidence=0.98)

    docs = (
        [f"CASE-{i} CLEAN" for i in range(78)]
        + [f"CASE-{i} BE_YEAR" for i in range(78, 86)]
        + [f"CASE-{i} HIGH_VALUE" for i in range(86, 91)]
        + [f"CASE-{i} LOW_CONF" for i in range(91, 96)]
        + [f"CASE-{i} HARD_MATH" for i in range(96, 99)]
        + ["CASE-99 CORRUPT"]
    )
    assert len(docs) == 100

    results = [
        extract_invoice(doc, small_llm=mock_small, frontier_llm=mock_frontier, rubric=RUBRIC, max_retries=2)
        for doc in docs
    ]
    assert all(isinstance(r, PipelineResult) for r in results)

    metrics = evaluate_batch(results)
    assert metrics["total"] == 100.0
    assert metrics["valid_rate"] >= 0.99
    assert metrics["first_pass_rate"] == pytest.approx(0.78)
    assert metrics["repaired_rate"] == pytest.approx(0.21)
    assert metrics["fallback_rate"] == pytest.approx(0.01)
    assert metrics["frontier_rate"] <= 0.15
    assert metrics["unique_prefix_hashes"] == 1.0

    corrupt_res = results[-1]
    assert corrupt_res.status == "fallback"
    assert corrupt_res.record is None
    assert corrupt_res.needs_human_review is True
    assert len(corrupt_res.error_reasons) >= 1


def test_invalid_arguments_raise_value_error():
    with pytest.raises(ValueError):
        evaluate_batch([])
    with pytest.raises(ValueError):
        extract_invoice("x", small_llm=lambda _: "{}", frontier_llm=lambda _: "{}", rubric=RUBRIC, max_retries=-1)
    with pytest.raises(ValueError):
        extract_invoice("x", small_llm=lambda _: "{}", frontier_llm=lambda _: "{}", rubric=RUBRIC, confidence_threshold=1.5)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 3 test functions (รวมชุดจำลอง 100 ใบแจ้งหนี้ไทย) ในเวลา < 1 วินาที",
      "ตรวจว่า `metrics[\"valid_rate\"] >= 0.99`, `metrics[\"unique_prefix_hashes\"] == 1.0`, และ `metrics[\"frontier_rate\"] <= 0.15`",
      "ตรวจว่าเคส `HIGH_VALUE` (`>= 50,000` บาท) ที่โมเดลลืมตั้ง `needs_human_review=True` ในรอบแรกถูกจับและซ่อมผ่านในรอบที่ 2",
      "ตรวจว่าเคส `CORRUPT` ตก `status=\"fallback\"` พร้อม `needs_human_review=True` โดยไม่มี exception หลุดออกมา",
      "รัน `uv run ruff check .` แล้วไม่มี lint warning",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day80.py` ด้วย `uv run pytest -q` และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "แยก helper `_run_tier(sys_prompt, doc_text, llm_fn, max_retries)` ไว้ใช้ซ้ำได้ทั้งกับ `small_llm` (ใช้ `max_retries`) และ `frontier_llm` (ใช้ `max_retries=1`) เพื่อลดโค้ดซ้ำซ้อนและทำให้ลูปอ่านง่ายมาก",
      },
      {
        body: "ใน `extract_invoice` อย่าลืมกรณีที่ `small_llm` validate ผ่าน (`rec is not None`) แต่ `rec.confidence < confidence_threshold` — เคสนี้ต้อง escalate ไป `frontier_llm` และเก็บเหตุผล (เช่น `\"low_confidence\"`) ลง `error_reasons` ด้วย",
      },
      {
        body: "โครงของ `evaluate_batch` และ `_format_errors` พร้อมแล้ว เหลือเติม `ThaiInvoiceRecord` และเชื่อม `extract_invoice` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day80.py",
          code: `def _format_errors(err: ValidationError) -> str:
    return "\\n".join(
        f"- {'.'.join(str(p) for p in e['loc']) or '__root__'}: {e['msg']}"
        for e in err.errors()
    )


def evaluate_batch(results: list[PipelineResult]) -> dict[str, float]:
    if not results:
        raise ValueError("results must not be empty")
    n = len(results)
    ok = sum(r.status == "ok" for r in results)
    repaired = sum(r.status == "repaired" for r in results)
    fallback = sum(r.status == "fallback" for r in results)
    frontier = sum(r.model_tier == "frontier" for r in results)
    unique_hashes = len({r.cache_prefix_hash for r in results})
    return {
        "total": float(n),
        "first_pass_rate": round(ok / n, 4),
        "repaired_rate": round(repaired / n, 4),
        "valid_rate": round((ok + repaired) / n, 4),
        "fallback_rate": round(fallback / n, 4),
        "frontier_rate": round(frontier / n, 4),
        "unique_prefix_hashes": float(unique_hashes),
    }`,
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
      title: "วัด \"99% Valid\" บนชุดทดสอบสะอาดอย่างเดียวโดยไม่มีเคส พ.ศ. ไทยหรือยอด VAT ผิด",
      symptom: "ในเทสต์ได้ 100% แต่ขึ้น production แล้วตกเหลือ 80% เพราะเจอใบเสร็จไทยที่ระบุปี `2569` หรือปัดเศษ VAT ต่างจากที่คาด",
      fix: "ใส่ edge cases ภาษาไทยจริง (ปี พ.ศ., เลขเอกสารเป็น `null`, ยอดรวมผิด, เคสยอดสูง, เอกสารเสีย) ลงในชุด stress test ของ `pytest` เสมอ",
    },
    {
      title: "เผลอใส่ `doc_id` หรือ `timestamp` ลงใน `system` message ของ `extract_invoice`",
      symptom: "ค่า `unique_prefix_hashes` พุ่งเท่ากับจำนวนเอกสาร (`100`) แทนที่จะเป็น `1` ทำให้ Prompt Caching miss ทุกคำขอ",
      fix: "ล็อก `system` message ให้มีเฉพาะ `rubric` คงที่และใส่ assertion `unique_prefix_hashes == 1` ใน `pytest`",
    },
    {
      title: "ให้ `frontier_llm` ใช้ `max_retries` สูงเกินไปหรือลืมคืน Deterministic Fallback",
      symptom: "เจอเอกสารสแกนเสีย 1 ใบ ระบบยิงโมเดลใหญ่ซ้ำหลายรอบจนเปลืองเงินและสุดท้ายโยน `ValidationError` ทำ batch 100 ใบล่มกลางคัน",
      fix: "จำกัดรอบซ่อมฝั่ง Frontier ไว้สั้น ๆ (`max_retries=1`) แล้วตัดจบด้วย `status=\"fallback\"` และ `needs_human_review=True` เสมอ",
    },
    {
      title: "เอา `tenacity` HTTP Retry มาดักจับ `ValidationError`",
      symptom: "ระบบหน่วงเวลา backoff แล้วส่ง prompt เดิมซ้ำโดยไม่บอกจุดผิด ทำให้ซ่อมไม่ผ่านและเปลืองเวลา",
      fix: "ใช้ {{exponential-backoff}} (D14) เฉพาะ network/429/5xx ส่วน `ValidationError` ให้เข้า Repair Loop (D78) ทันที",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d080-q1",
        "ในระบบสกัดใบแจ้งหนี้ไทยที่ผ่านเกณฑ์ 99%+ บทบาทของทั้ง 3 ชั้น (D77 Strict Schema, D78 Repair Loop, D79 Prompt Cache + Routing) ต่อกันอย่างไร?",
        [
          ["ใช้แทนกันได้ เลือกทำแค่อย่างใดอย่างหนึ่งก็พอ", "ไม่จริง — แต่ละชั้นแก้ปัญหาคนละมิติ (โครงสร้าง vs ความถูกต้องเชิงธุรกิจ vs ต้นทุน/ความเร็ว)"],
          ["Strict Schema คุมโครงสร้าง + Pydantic Validator จับกฎธุรกิจ → Repair Loop ส่ง error feedback ซ่อมจุดผิดและตัดจบด้วย Fallback → Static Prefix + Small/Frontier Routing คุมต้นทุนและ latency", "ถูก — ทั้งสามชั้นเสริมกันให้ได้ทั้งความน่าเชื่อถือสูงและต้นทุนที่คุ้มค่า"],
          ["Routing ทำหน้าที่ตรวจ `subtotal + vat == total` แทน Pydantic", "ไม่ใช่ — การตรวจสมการบัญชีเป็นหน้าที่ของ Pydantic `@model_validator`"],
          ["Prompt Caching ทำหน้าที่ซ่อม JSON ที่ผิดรูปอัตโนมัติ", "ไม่ใช่ — Prompt Caching ช่วยลดค่า input token และ TTFT ของ prefix คงที่ ไม่ได้แก้ JSON พัง"],
        ],
        "B",
        "สถาปัตยกรรม B20 รวม 3 มิติเข้าด้วยกัน: Strict Schema + Validators (D77/D3), Bounded Repair + Safe Fallback (D78), และ Static Prefix Caching + Tiered Routing (D79)",
        "ทั้ง 3 วันใน Block B20 (D77, D78, D79) ต่อกันเป็นสถาปัตยกรรมเดียวอย่างไร?",
        "D77: Strict Schema + cross-field validator → D78: Bounded Repair Loop + Safe Fallback → D79: Immutable Static Prefix Caching + Small/Frontier Routing",
      ),
      mc(
        "d080-q2",
        "ผลรันชุดทดสอบ 100 ใบแจ้งหนี้ไทยได้ `valid_rate = 0.99`, `first_pass_rate = 0.55`, `repaired_rate = 0.44`, `unique_prefix_hashes = 100` — สัญญาณนี้บอกปัญหาสำคัญ 2 เรื่องใด?",
        [
          ["ระบบสมบูรณ์แบบแล้วเพราะ `valid_rate` ถึง 99%", "อันตรายมาก — ตัวเลข `valid_rate` บดบังปัญหาใหญ่ 2 อย่างที่ซ่อนอยู่"],
          ["1) Prompt/Schema ยังไม่ชัดพอจนต้องพึ่ง Repair Loop ถึง 44% (เปลืองรอบเรียกและช้า) และ 2) มีข้อมูล dynamic รั่วเข้า Static Prefix จน Prompt Caching miss 100%", "ถูก — ต้องรีบแก้ทั้งคำอธิบายใน prompt/schema และย้ายข้อมูล dynamic ออกจาก `system` message"],
          ["Pydantic v2 พังจึงสร้าง hash ไม่ซ้ำกัน", "ไม่ใช่บั๊กของ Pydantic แต่เป็นบั๊กฝั่งโค้ดเราที่แทรกข้อมูล dynamic ลงใน `system` message"],
          ["ควรเพิ่ม `max_retries` เป็น 10 เพื่อให้ `repaired_rate` สูงขึ้น", "การเพิ่ม retry ยิ่งทำให้ช้าและแพง ควรปรับ prompt ให้ `first_pass_rate` สูงขึ้นต่างหาก"],
        ],
        "B",
        "การแยกดู `first_pass_rate` และ `unique_prefix_hashes` ช่วยเปิดโปงต้นทุนแฝงจาก repair รอบซ้ำและ cache busting แม้ `valid_rate` จะดูสวยที่ 99%",
        "ถ้า `valid_rate = 0.99` แต่ `first_pass_rate = 0.55` และ `unique_prefix_hashes = 100` แปลว่าเกิดปัญหาอะไร?",
        "1) Prompt/schema ยังมีจุดกำกวมจนต้องซ่อมเกือบครึ่งหนึ่ง (latency/cost พุ่ง) และ 2) Static Prefix เปลี่ยนทุกคำขอทำให้ Prompt Caching miss 100%",
      ),
      mc(
        "d080-q3",
        "ข้อใดคือการจัดการที่ถูกต้องเมื่อใบแจ้งหนี้มูลค่า `64,200` บาท (เกินเกณฑ์ `50,000` บาท) ถูกโมเดลเล็กสกัดครบทุกตัวเลขแต่ตั้ง `needs_human_review = false`?",
        [
          ["ปล่อยผ่านเพราะตัวเลข `subtotal + vat == total` ถูกต้องแล้ว", "ผิดกฎธุรกิจ — ใบแจ้งหนี้มูลค่าสูงต้องเข้าคิวตรวจโดยเจ้าหน้าที่"],
          ["`@model_validator` โยน `ValidationError` → Repair Loop ส่งข้อความ error สั้น ๆ กลับให้โมเดลแก้เป็น `needs_human_review = true` (หรือ escalate หากไม่ผ่าน)", "ถูก — ใช้ด่านที่ 2 ของ Pydantic บังคับนโยบายธุรกิจแล้วซ่อมด้วย feedback loop"],
          ["ให้ชั้น `tenacity` รอ 4 วินาทีแล้วส่ง prompt เดิมซ้ำ", "HTTP backoff ไม่ได้บอกโมเดลว่าผิดกฎข้อไหน โมเดลจะตอบ `false` ซ้ำเดิม"],
          ["ลบเงื่อนไข `50,000` ออกจาก validator แล้วค่อยให้ฝ่ายบัญชีไปกรองเองใน Excel", "การตรวจด้วยโค้ดแบบ deterministic ปลอดภัยและไม่ตกหล่นกว่าการกรองมือ"],
        ],
        "B",
        "กฎธุรกิจที่ขึ้นกับความสัมพันธ์ระหว่างฟิลด์ (`total_amount >= 50000` → `needs_human_review=True`) ต้องบังคับด้วย `@model_validator` แล้วให้ Repair Loop แก้ให้ตรงสัญญาข้อมูล",
        "จะบังคับกฎธุรกิจ \"ยอด `>= 50,000` บาทต้องตั้ง `needs_human_review=True`\" ใน pipeline ของ B20 อย่างไร?",
        "ตรวจใน `@model_validator(mode='after')` ของ Pydantic เพื่อให้โยน `ValidationError` แล้วให้ Repair Loop ส่ง error feedback กลับไปซ่อม",
      ),
      mc(
        "d080-q4",
        "เหตุใดเราจึงควรทดสอบ pipeline ของ B20 ด้วยชุดจำลอง 100 เคสแบบ Mock Client ใน `pytest` ก่อนยิง LLM API จริง?",
        [
          ["เพราะ Mock Client ทำให้ไม่ต้องใช้ LLM API จริงเลยใน production", "ไม่ใช่ — ใน production เรายังใช้ LLM จริง แต่ใช้ mock เพื่อทดสอบตรรกะฝั่งแอปใน CI"],
          ["เพื่อยืนยันตรรกะของ Schema, Prefix Cache, Repair Loop, Escalation และ Fallback ให้ครบทุก edge case อย่างรวดเร็ว ฟรี และทำซ้ำได้ 100% ก่อนเสียค่า API", "ถูก — จับบั๊กเชิงวิศวกรรม (เช่น cache busting หรือ infinite loop) ได้ภายใน 1 วินาทีก่อนยิง API จริง"],
          ["เพราะ Official SDK ไม่สามารถรันร่วมกับ `pytest` ได้", "รันได้ แต่การยิง API จริงใน unit test จะช้า เสียเงิน และไม่ deterministic"],
          ["เพื่อหลีกเลี่ยงการเขียน `ConfigDict(extra=\"forbid\")`", "ไม่เกี่ยวกัน — `extra=\"forbid\"` ยังจำเป็นสำหรับ Strict Schema เสมอ"],
        ],
        "B",
        "Offline mock stress testing ทำให้เราพิสูจน์ความถูกต้องของทั้ง pipeline (schema, cache prefix, routing, repair, fallback) ได้เร็ว ฟรี และทำซ้ำได้ทุกครั้งใน CI",
        "ทำไมต้องมี 100-case Offline Mock Stress Test ก่อนเชื่อม LLM API จริง?",
        "เพื่อตรวจจับบั๊กของ schema, cache prefix, routing, repair loop และ fallback ครบทุก edge case ได้เร็ว (<1s), ฟรี, และทำซ้ำได้ 100% ใน CI",
      ),
    ],
  },

  takeaways: [
    "ระบบสกัดเอกสารไทยที่ผ่านสัญญาข้อมูล **≥ 99%** เกิดจากการประสาน 4 ชั้น: **Strict Pydantic Schema (D77)** + **Static Prefix Caching (D79)** + **Small/Frontier Routing (D79)** + **Bounded Repair Loop & Safe Fallback (D78)**",
    "รายงานตัวชี้วัดครบทั้ง `first_pass_rate`, `repaired_rate`, `valid_rate`, `fallback_rate`, `frontier_rate` และ `unique_prefix_hashes` เพื่อไม่ให้ตัวเลขสวย ๆ บดบังต้นทุนแฝง",
    "แยก HTTP Transport Retry ({{exponential-backoff}}, D14) ออกจาก Semantic Validation Repair (D78) และรับประกัน 0% crash ด้วย Deterministic Fallback เข้าคิว {{hitl}}",
    "ล็อกความถูกต้องของทั้ง pipeline ด้วย 100-case offline mock stress test ใน {{pytest}} เพื่อให้มั่นใจก่อนก้าวสู่ Block B21 (Multimodal, Batch API และ Local Ollama)",
  ],

  reviewCards: [
    rc(
      "d080-rc-1",
      "หากวัดผล batch 100 เอกสารแล้ว `unique_prefix_hashes` มากกว่า `1` แปลว่าเกิดปัญหาอะไร?",
      "แปลว่ามีข้อมูล dynamic (เช่น `doc_id`, `request_id` หรือ `timestamp`) รั่วเข้าไปใน `system` message ทำให้ Prompt Caching miss และต้องรีบย้ายไปไว้ใน `user` message",
    ),
    rc(
      "d080-rc-2",
      "ความต่างระหว่าง `valid_rate = 99%` กับ **100% Contract Safety** คืออะไร?",
      "`valid_rate = 99%` คือสัดส่วนเอกสารที่สกัดผ่าน schema+กฎธุรกิจอัตโนมัติ (ok + repaired) ส่วน 100% Contract Safety คืออีก 1% ที่ซ่อมไม่ผ่านจะไม่ทำระบบ crash และไม่เขียนข้อมูลผิดลง DB แต่ตก Safe Fallback (`needs_human_review=True`) อย่างปลอดภัย",
    ),
    rc(
      "d080-rc-3",
      "ทำไมใน B20 Pipeline เราจึงยังต้องดู `first_pass_rate` แม้ `valid_rate` จะสูงถึง 99% แล้วก็ตาม?",
      "เพราะหาก `first_pass_rate` ต่ำแสดงว่า Repair Loop และ Frontier Escalation กำลังแบกงานหนักเกินไป ทำให้ latency และค่า API พุ่งสูง — ต้องกลับไปปรับ prompt/schema",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Docs — Validators & Strict Mode", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
    { label: "OpenAI API Docs — Structured Outputs", href: "https://platform.openai.com/docs/guides/structured-outputs" },
    { label: "OpenAI API Docs — Prompt Caching", href: "https://platform.openai.com/docs/guides/prompt-caching" },
    { label: "Anthropic Docs — Building Effective Agents", href: "https://www.anthropic.com/research/building-effective-agents" },
  ],

  glossary: ["structured-output", "pydantic", "validation-error", "prompt-caching", "exponential-backoff", "hitl", "data-contract", "mocking"],
});
