import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D084 — Phase 3 / Block B21 (Review Day)
 * Review: Quiz + Benchmark Cloud API vs Local Ollama on extraction task
 */
export const d084: Lesson = defineLesson({
  day: 84,
  titleTh: "ทบทวน Block B21: Benchmark เทียบ Cloud API vs Local Ollama บนงานสกัดเอกสารไทย",
  tagline: "30 นาที · รอบทบทวน D81–D83 + D77/D78 · รันบนเครื่องคุณ 100% · วัด Schema Pass Rate, Field Accuracy, P95 Latency และ Cost/1k Docs",
  icon: "git-compare",
  visual: {
    id: "ollama-quantization",
    title: "ทบทวน B21: Benchmark เทียบ Cloud API vs Local Ollama บนงานสกัดเอกสารไทย",
    caption: "วัด Schema Pass Rate, Exact Field Accuracy, P95 Latency และต้นทุนต่อ 1,000 เอกสารเพื่อตัดสินใจเลือกอย่างมีหลักฐาน",
    alt: "แผนภาพเปรียบเทียบ Cloud API กับ Local Ollama",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ด้วย recorded/mock fixtures ใน pytest และรองรับเสียบ Cloud/Ollama จริง",
  tools: ["Ollama", "Official SDK", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "สร้าง Golden Dataset ใบเสร็จ/ใบแจ้งหนี้ไทยสำหรับเทียบทุก Provider บนกติกาเดียว",
      body: "การเลือกใช้ Cloud API (Real-Time หรือ {{batch-api}}) กับ Local Ollama ({{quantization}} `Q4_K_M`) ต้องตัดสินจาก {{golden-dataset}} เอกสารไทยของโดเมนเราเองที่มีทั้งใบเสร็จปกติ ใบกำกับภาษีที่ไม่มีเลขประจำตัว และเคสยอดเงินซับซ้อน",
      lessonNote: "ทบทวน D77 (Strict {{schema}}), D81 ({{multimodal}} cross-field check) และ D83 (Local Ollama) ผ่านชุดทดสอบร่วมชุดเดียว",
    },
    {
      node: 2,
      heading: "รัน Provider-Agnostic Runner เทียบ Cloud vs Local ภายใต้ Schema เดียวกัน",
      body: "เพราะ Ollama รองรับ OpenAI-compatible API เราจึงส่งเอกสารชุดเดียวกันเข้า adapter ของแต่ละ provider พร้อม Strict {{pydantic}} validator และตัวเลือก Validation-Repair Loop (D78) เพื่อวัดความสามารถจริงอย่างยุติธรรม",
      lessonNote: "วันนี้เราสร้าง runner ที่เสียบได้ทั้ง recorded/mock fixtures (สำหรับ `pytest` แบบ {{reproducibility}}) และ client จริง",
    },
    {
      node: 3,
      heading: "วัด 4 แกนพร้อมกัน: Schema Pass, Exact Field Accuracy, P95 Latency และ Cost/1k Docs",
      body: "โมเดลที่ผ่าน {{structured-output}} 100% อาจยังสกัดชื่อร้านหรือยอดรวมผิดบางฟิลด์ การวัด **Schema Pass Rate**, **Exact Field Accuracy**, **P95 Latency** และ **ต้นทุนต่อ 1,000 เอกสาร** (รวมส่วนลด Batch 50%) ทำให้เห็นจุดคุ้มทุนชัดเจน",
      lessonNote: "แบบฝึกหัดวันนี้คำนวณทั้ง 4 ตัวชี้วัดและคัดกรองผู้ชนะตามเงื่อนไขธุรกิจ (เช่น ความแม่นยำขั้นต่ำและข้อจำกัด {{pdpa}})",
    },
    {
      node: 6,
      heading: "เปลี่ยนผล Benchmark เป็นเกณฑ์ตัดสินใจสถาปัตยกรรม (Routing & Hybrid Policy)",
      body: "หลายองค์กรไม่จำเป็นต้องเลือกข้างใดข้างหนึ่งแบบสุดโต่ง แต่ใช้ผล benchmark กำหนดนโยบาย เช่น รัน Local Ollama สำหรับเอกสารลับ {{pdpa}} และใช้ Cloud Batch API สำหรับเอกสารย้อนหลังความซับซ้อนสูง",
      lessonNote: "จบ Block B21 พร้อมเครื่องมือ Benchmark ที่จะต่อยอดเข้าสู่ Phase 3 Mini-Project ใน Block B22–B23",
    },
  ],

  objectives: [
    "**ทบทวนแบบผสมผสาน (Interleaved Recall)** เนื้อหา D81–D83 (Vision image preprocessing & tiling, {{batch-api}} `custom_id` reconciliation & 50% discount, Ollama GGUF {{quantization}} & VRAM sizing) ร่วมกับ D77/D78 (Strict Pydantic Schema & Repair Loop)",
    "**คำนวณ** 4 ตัวชี้วัดหลักของงาน Extraction Benchmark: **Schema Pass Rate**, **Exact Field Accuracy**, **P95 Latency (ms)** และ **Cost per 1,000 docs (USD)**",
    "**สร้าง** Provider-Agnostic Benchmark Harness ที่เปรียบเทียบ Cloud Real-Time, Cloud Batch และ Local Ollama บนชุดเอกสารไทยด้วย recorded/mock fixtures ที่รันซ้ำใน `pytest` ได้ 100%",
  ],

  prerequisites: [
    "ทบทวน D81 (Multimodal Vision & Receipt Cross-Field Check), D82 (Batch API & `custom_id` Reconciliation) และ D83 (Local Ollama & GGUF Quantization)",
    "ทบทวน D77 (Strict Pydantic Schema) และ D78 (Validation-Repair Loop)",
    "มี `uv`, `pydantic`, `pytest`, `ruff` (ไม่ต้องมี API key หรือ GPU ก็ทำครบทุกขั้นได้)",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์สำหรับรอบทบทวน Day 84 ด้วย `uv` — เราใช้ `pydantic` และ `pytest` รัน benchmark บน recorded fixtures แบบ deterministic 100% (และคุณสามารถต่อ Ollama หรือ Cloud API จริงเข้า adapter เดียวกันได้ทันที)",
    commands: `uv init ai-day84-review && cd ai-day84-review
uv add pydantic openai
uv add --dev pytest ruff
uv run python -c "import pydantic; print('Day 84 Review Ready | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์ `ai-day84-review`"],
      ["deps", "ติดตั้ง `pydantic`, `openai`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันเช็กสภาพแวดล้อมผ่าน พร้อมแบ่งเวลา: ควิซ 10 นาที → Benchmark Lab 15 นาที → Error Log 5 นาที"],
    ],
    note: "รอบทบทวน Day 84 ใช้เวลา 30 นาที: ทำควิซดึงความรู้เดิม D77–D83 (10 นาที) → สร้าง Provider-Agnostic Extraction Benchmark Harness (15 นาที) → บันทึกจุดพลาดและสรุปเกณฑ์เลือก Cloud vs Local (5 นาที)",
  },

  concepts: [
    {
      id: "review-b21-synthesis",
      title: "1 · ร้อยต่อจิ๊กซอว์ B21 + B20: จากอินพุตภาพ → คิว Batch → รัน Local Ollama",
      paragraphs: [
        "ตลอด Block B21 เราขยายขีดความสามารถของท่อ {{structured-output}} จาก B20 ให้พร้อมใช้งานจริงในองค์กรไทยครบ 3 มิติ: **D81** ทำให้ระบบอ่านภาพสลิป/ใบเสร็จและตาราง PDF ไทยได้พร้อมย่อภาพคุม image tokens และตรวจยอดข้ามฟิลด์, **D82** ย้ายงานออฟไลน์เข้า {{batch-api}} ลดต้นทุน 50% ด้วย `custom_id` ที่ทนต่อผลสลับลำดับและ partial failures, และ **D83** เปิดทางเลือก Local Open-Weights ด้วย Ollama + GGUF {{quantization}} (`Q4_K_M`/`Q8_0`) สำหรับงานลับ {{pdpa}} และงบพัฒนา 0 บาท",
        "คำถามใหญ่ที่สุดของวิศวกร AI หลังเรียนครบ 3 วันนี้คือ: *\"สำหรับงานสกัดใบแจ้งหนี้ไทยของทีมเรา ควรใช้ Cloud Real-Time, Cloud Batch หรือ Local Ollama ดี?\"* — คำตอบที่ถูกต้องไม่เคยมาจากการคาดเดา แต่ต้องมาจากการทำ **Extraction Benchmark** บนข้อมูลจริงของบริษัท",
      ],
      analogy: "D81–D83 เหมือนคุณได้รถ 3 คันสำหรับส่งของ: รถสปอร์ตด่วน (Cloud Real-Time), รถบรรทุกรอบดึกค่าขนส่งครึ่งราคา (Cloud Batch), และรถตู้ส่วนตัวในบริษัทที่ขับฟรีและเก็บความลับได้ (Local Ollama) — วันนี้เราจะจับทั้ง 3 คันมาวิ่งทดลองส่งของจริงเพื่อดูตัวเลขก่อนเซ็นสัญญา",
      bullets: [
        "**D77 + D78 + D81**: ทุก provider ต้องถูกตัดสินด้วย Strict {{pydantic}} schema และกฎธุรกิจข้ามฟิลด์เดียวกันเป๊ะ",
        "**D82**: งานที่ไม่ต้องตอบทันทีต้องคำนวณต้นทุนฝั่ง Cloud ทั้งราคา Real-Time และราคา Batch (-50%)",
        "**D83**: ฝั่ง Local Ollama มีต้นทุน API = `$0.00` (ไม่นับค่าเครื่องที่มีอยู่แล้ว) และผ่านเงื่อนไข {{pdpa}} on-prem 100%",
      ],
      whyTitle: "Why this matters — หลักฐานตัวเลขชนะการถกเถียงในทีมเสมอ",
      whyParagraphs: [
        "ในทีมวิศวกรรมจริง มักมีการถกเถียงระหว่างฝ่ายการเงินที่อยากลดค่า Cloud, ฝ่าย Security ที่กังวล {{pdpa}}, และฝ่าย Product ที่ต้องการความแม่นยำ >95% ตาราง benchmark 4 ตัวชี้วัดคือภาษากลางที่ทำให้ทุกฝ่ายตัดสินใจร่วมกันได้ใน 10 นาที",
        "นอกจากนี้การแยก recorded/mock fixtures ไว้รันใน `pytest` ยังทำให้คุณตรวจโค้ด benchmark เองได้เร็วและมี {{reproducibility}} 100% ก่อนเสียเงินรันจริงกับ API",
      ],
    },
    {
      id: "four-extraction-metrics",
      title: "2 · 4 ตัวชี้วัดมาตรฐานสำหรับ Extraction Benchmark",
      paragraphs: [
        "การวัดงานสกัดเอกสารด้วยตัวเลขเดียวอย่าง \"ผ่านกี่ข้อ\" ไม่เพียงพอ เราควรวัดแยก 4 แกนเสมอเพื่อให้เห็นทั้งจุดแข็งและจุดอ่อนที่ซ่อนอยู่:",
        "**1) Schema Pass Rate**: สัดส่วนเอกสารที่ผลลัพธ์ JSON ผ่าน `model_validate_json()` (รวมกฎข้ามฟิลด์) โดยไม่พัง — ถ้า Local 3B ได้ Schema Pass ต่ำ (เช่น 80%) แต่พอเสริม Repair Loop (D78) แล้วขึ้นเป็น 96% ตัวเลขนี้จะบอกได้ทันที\n**2) Exact Field Accuracy**: ในบรรดาฟิลด์เป้าหมายทั้งหมด (เช่น `invoice_no`, `category`, `total_thb` ของทุกเอกสาร) โมเดลสกัดตรงกับเฉลยใน {{golden-dataset}} กี่เปอร์เซ็นต์ (เคสที่พัง schema ให้นับว่าทุกฟิลด์ของเอกสารนั้นผิด = `0`)",
        "**3) P95 Latency (ms)**: เวลารอที่เปอร์เซ็นไทล์ที่ 95 (95% ของ request เสร็จเร็วกว่าค่านี้) — แสดงพฤติกรรมหางยาว (tail latency) ได้ดีกว่าค่าเฉลี่ยที่มักถูกกลบ\n**4) Cost per 1,000 Docs (USD)**: คำนวณจาก token จริงที่ใช้ทั้งหมดต่อจำนวนเอกสารแล้วคูณ 1,000 (ฝั่ง Local Ollama = `$0.00` ต่อ token, ฝั่ง Cloud Batch ลด 50% จาก Real-Time)",
      ],
      analogy: "Schema Pass Rate เหมือน *\"ส่งแบบฟอร์มครบทุกช่องไม่ลืมเซ็นชื่อ\"* ส่วน Exact Field Accuracy เหมือน *\"กรอกตัวเลขและชื่อถูกจริงไหม\"* — ฟอร์มสวยแต่เลขผิดก็ใช้งานไม่ได้!",
      code: {
        language: "python",
        filename: "p95_metric.py",
        code: `import math


def percentile_p95(latencies_ms: list[float]) -> float:
    if not latencies_ms:
        raise ValueError("latencies_ms must not be empty")
    ordered = sorted(latencies_ms)
    # nearest-rank P95 index (1-based ceil(0.95 * n) - 1)
    idx = max(0, math.ceil(0.95 * len(ordered)) - 1)
    return ordered[idx]


print("P95 of [120, 150, 180, 210, 950]:", percentile_p95([120, 150, 180, 210, 950]), "ms")`,
        caption: "สังเกตว่าค่าเฉลี่ยของ `[120, 150, 180, 210, 950]` คือ 322 ms แต่ P95 ฟ้องทันทีว่าผู้ใช้ 5% ต้องรอนานถึง 950 ms",
      },
      whyTitle: "Why this matters — อย่าหลงกล Schema Pass Rate 100%",
      whyParagraphs: [
        "Constrained Decoding (D77) ทำให้หลายโมเดลได้ Schema Pass Rate ใกล้ 100% แต่ไม่ได้แปลว่าสกัดถูกทุกช่อง โมเดลขนาดเล็กอาจใส่ `null` พร่ำเพรื่อหรือปัดเศษยอดรวมผิด",
        "การรายงาน `Schema Pass Rate` คู่กับ `Exact Field Accuracy` ช่วยเปิดโปงโมเดลที่ *\"ตอบถูกฟอร์มแต่เนื้อหาผิด\"* ได้ทันที",
      ],
    },
    {
      id: "decision-policy-cloud-vs-local",
      title: "3 · แปลงผล Benchmark เป็นนโยบายเลือก Provider (Quality Gate + PDPA Filter)",
      paragraphs: [
        "เมื่อได้ตารางผลลัพธ์ของแต่ละ provider แล้ว เราไม่ควรเลือกตัวที่ถูกที่สุดแบบหลับหูหลับตา แต่ควรใช้ **Decision Policy แบบ 2 ชั้น**: (1) **Hard Gates** — กรองออกทุก provider ที่ไม่ผ่านเกณฑ์ขั้นต่ำ เช่น `field_accuracy < min_accuracy`, `schema_pass_rate < min_schema_pass`, หรือ `require_local_only=True` สำหรับข้อมูลลับ {{pdpa}}, และ (2) **Rank Survivors** — ในกลุ่มที่ผ่านเกณฑ์ทั้งหมด ค่อยเลือกตัวที่ `cost_per_1k_usd` ต่ำที่สุด (ถ้าเท่ากันเลือกตัวที่ `field_accuracy` สูงกว่า แล้วค่อย `p95_latency_ms` ต่ำกว่า)",
        "แนวคิด Hard Gate + Cost Optimization นี้คือรากฐานของการทำ **Eval Gates ใน CI (Phase 5)** และการทำ **Model Routing** ที่คุ้มค่าที่สุดในระบบ production",
      ],
      analogy: "เหมือนเลือกซื้อหมวกกันน็อก: ขั้นแรกคัดเฉพาะใบที่ผ่านมาตรฐานความปลอดภัย มอก./ECE (Hard Gate) จากนั้นในกลุ่มที่ปลอดภัยแล้วค่อยเลือกราคาคุ้มค่าและใส่สบายที่สุด",
      bullets: [
        "**งานเอกสารลับ PDPA**: ตั้ง `require_local_only=True` → Local Ollama (`qwen2.5:7b` Q4_K_M / Q8_0) ผ่านด่านเดียว",
        "**งาน Backfill เอกสารยากที่ไม่ติด PDPA**: Cloud Batch API มักชนะเพราะได้ความแม่นยำระดับ Cloud ในราคาลด 50%",
        "**งาน Interactive หน้าเว็บ**: คุม `max_p95_ms` เพิ่มเติมเพื่อกันโมเดลที่ช้าเกิน SLA ของหน้าจอ",
      ],
      whyTitle: "Why this matters — ปิดจบ Block B21 อย่างเป็นระบบก่อนเข้าสู่ Fine-Tuning vs RAG",
      whyParagraphs: [
        "เมื่อคุณมี Benchmark Harness ที่วัดทั้งความแม่นยำ ความเร็ว และต้นทุนได้ชัดเจน ใน Block B22 (Day 85–88) คุณจะรู้ได้ทันทีว่าเมื่อไรที่โมเดลปัจจุบัน *\"ดีพอแล้ว\"* และเมื่อไรที่ต้องขยับไปทำ RAG หรือ Fine-Tuning (LoRA)",
        "ถ้าไม่มีตัวเลข baseline จากวันนี้ คุณจะไม่มีทางรู้เลยว่าการเปลี่ยนโมเดลหรือการ fine-tune ในอนาคตช่วยให้ดีขึ้นจริงหรือไม่",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Provider Benchmark Harness ≈ Multi-Region SLA + Cost Matrix",
      body: [
        "ในงาน Backend/Infra เวลาคุณเทียบ PostgreSQL Managed Cloud กับ Self-Hosted Postgres คุณเทียบ 4 อย่าง: Availability/Error Rate, Correctness, P95 Latency และ Monthly Cost — Extraction Benchmark ทำแบบเดียวกันทุกประการสำหรับ LLM Providers",
        "ส่วนการใช้ Recorded Fixtures (`ProviderRunRecord`) ใน `pytest` เหมือนกับการใช้ VCR/Polly.js บันทึก HTTP responses ไว้เล่นซ้ำใน CI เพื่อให้เทสต์เร็ว ฟรี และไม่ flaky",
      ],
      table: [
        ["`ProviderRunRecord` fixture", "Recorded HTTP cassette / Mock API fixture ใน Jest/Vitest"],
        ["Schema Pass + Field Accuracy", "Contract test + Functional correctness score"],
        ["`percentile_p95(latencies_ms)`", "P95 API response time SLA"],
        ["Hard Gate + Cost Ranking", "SLO-filtered vendor selection matrix"],
      ],
    },
    student: {
      title: "First-Year Note — P95 Latency คืออะไร และทำไมไม่ดูแค่ค่าเฉลี่ย (Mean)",
      body: [
        "สมมติมีคำขอ 20 ครั้ง: 19 ครั้งตอบใน `100 ms` แต่มี 1 ครั้งสะดุดนาน `5,000 ms` — ถ้าดูค่าเฉลี่ยจะได้แค่ `345 ms` ดูเหมือนเร็วมาก แต่ในความเป็นจริง 1 ใน 20 ของผู้ใช้ต้องรอนานถึง 5 วินาที!",
        "**P95 (เปอร์เซ็นไทล์ที่ 95)** คือการเรียงเวลาจากน้อยไปมากแล้วดูตัวที่ตำแหน่ง 95% — มันช่วยสะท้อนประสบการณ์แย่สุดที่ผู้ใช้กลุ่มหางยาวต้องเจอจริง ๆ ในระบบ production",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เทียบผลลัพธ์จริงที่บันทึกไว้ (recorded fixtures) ของ 3 ตัวเลือกบนชุดใบแจ้งหนี้ไทย 4 ใบ: **Cloud Real-Time (`gpt-4o-mini`)**, **Cloud Batch (`gpt-4o-mini` -50%)**, และ **Local Ollama (`qwen2.5:7b-q4_k_m`)** เพื่อคำนวณ 4 ตัวชี้วัดและคัดผู้ชนะตามเกณฑ์ธุรกิจ",
    steps: [
      {
        title: "1 · นิยาม Schema ใบแจ้งหนี้และ Golden Dataset 4 เอกสารไทย",
        explain: "ใช้ `InvoiceExtract` ที่มี `ConfigDict(extra=\"forbid\")` และตรวจยอด `total_thb >= 0` พร้อมเฉลย `GOLDEN_CASES` 4 ข้อ",
        code: {
          language: "python",
          filename: "worked_day84.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class InvoiceExtract(BaseModel):
    model_config = ConfigDict(extra="forbid")

    invoice_no: str | None
    category: Literal["cloud", "office", "travel"]
    total_thb: float = Field(ge=0.0)


GOLDEN_CASES = [
    {"doc_id": "D1", "expected": {"invoice_no": "INV-101", "category": "cloud", "total_thb": 1070.0}},
    {"doc_id": "D2", "expected": {"invoice_no": None, "category": "office", "total_thb": 320.0}},
    {"doc_id": "D3", "expected": {"invoice_no": "INV-103", "category": "travel", "total_thb": 2450.5}},
    {"doc_id": "D4", "expected": {"invoice_no": "INV-104", "category": "cloud", "total_thb": 5350.0}},
]
print("Golden cases loaded:", len(GOLDEN_CASES), "| total fields:", len(GOLDEN_CASES) * 3)`,
        },
        output: `Golden cases loaded: 4 | total fields: 12`,
      },
      {
        title: "2 · คำนวณ Schema Pass Rate, Exact Field Accuracy, P95 และ Cost/1k Docs",
        explain: "ประเมินผลจาก recorded outputs ของ Cloud Real-Time, Cloud Batch (-50%) และ Local Ollama โดยเทียบทีละฟิลด์ (`invoice_no`, `category`, `total_thb` ที่ tolerance `0.01`)",
        code: {
          language: "python",
          filename: "worked_day84.py",
          code: `import math
from pydantic import ValidationError


def score_provider(
    name: str,
    runs: list[dict],
    *,
    is_local: bool,
    input_per_1m_usd: float = 0.0,
    output_per_1m_usd: float = 0.0,
    batch_discount: float = 0.0,
) -> dict:
    passed = 0
    correct_fields = 0
    total_fields = len(GOLDEN_CASES) * 3
    latencies: list[float] = []
    total_in = 0
    total_out = 0

    for case, run in zip(GOLDEN_CASES, runs, strict=True):
        latencies.append(run["latency_ms"])
        total_in += run["input_tokens"]
        total_out += run["output_tokens"]
        try:
            parsed = InvoiceExtract.model_validate_json(run["raw_json"])
        except ValidationError:
            continue
        passed += 1
        exp = case["expected"]
        if parsed.invoice_no == exp["invoice_no"]:
            correct_fields += 1
        if parsed.category == exp["category"]:
            correct_fields += 1
        if abs(parsed.total_thb - exp["total_thb"]) <= 0.01:
            correct_fields += 1

    ordered = sorted(latencies)
    p95 = ordered[max(0, math.ceil(0.95 * len(ordered)) - 1)]
    raw_cost = (total_in / 1_000_000) * input_per_1m_usd + (total_out / 1_000_000) * output_per_1m_usd
    cost_per_1k = 0.0 if is_local else (raw_cost * (1.0 - batch_discount) / len(runs)) * 1000.0
    return {
        "provider": name,
        "is_local": is_local,
        "schema_pass": round(passed / len(runs), 3),
        "field_acc": round(correct_fields / total_fields, 3),
        "p95_ms": round(p95, 1),
        "cost_1k_usd": round(cost_per_1k, 4),
    }


cloud_runs = [
    {"raw_json": '{"invoice_no":"INV-101","category":"cloud","total_thb":1070.0}', "latency_ms": 420, "input_tokens": 900, "output_tokens": 80},
    {"raw_json": '{"invoice_no":null,"category":"office","total_thb":320.0}', "latency_ms": 390, "input_tokens": 850, "output_tokens": 75},
    {"raw_json": '{"invoice_no":"INV-103","category":"travel","total_thb":2450.5}', "latency_ms": 510, "input_tokens": 950, "output_tokens": 82},
    {"raw_json": '{"invoice_no":"INV-104","category":"cloud","total_thb":5350.0}', "latency_ms": 460, "input_tokens": 920, "output_tokens": 80},
]
ollama_runs = [
    {"raw_json": '{"invoice_no":"INV-101","category":"cloud","total_thb":1070.0}', "latency_ms": 680, "input_tokens": 900, "output_tokens": 80},
    {"raw_json": '{"invoice_no":"NONE","category":"office","total_thb":320.0}', "latency_ms": 640, "input_tokens": 850, "output_tokens": 75},
    {"raw_json": '{"invoice_no":"INV-103","category":"travel","total_thb":2450.5}', "latency_ms": 790, "input_tokens": 950, "output_tokens": 82},
    {"raw_json": '{"invoice_no":"INV-104","category":"cloud","total_thb":5350.0}', "latency_ms": 720, "input_tokens": 920, "output_tokens": 80},
]

reports = [
    score_provider("cloud-realtime", cloud_runs, is_local=False, input_per_1m_usd=0.15, output_per_1m_usd=0.60),
    score_provider("cloud-batch", cloud_runs, is_local=False, input_per_1m_usd=0.15, output_per_1m_usd=0.60, batch_discount=0.50),
    score_provider("ollama-qwen2.5-7b", ollama_runs, is_local=True),
]
for r in reports:
    print(r)`,
        },
        output: `{'provider': 'cloud-realtime', 'is_local': False, 'schema_pass': 1.0, 'field_acc': 1.0, 'p95_ms': 510, 'cost_1k_usd': 0.1833}
{'provider': 'cloud-batch', 'is_local': False, 'schema_pass': 1.0, 'field_acc': 1.0, 'p95_ms': 510, 'cost_1k_usd': 0.0917}
{'provider': 'ollama-qwen2.5-7b', 'is_local': True, 'schema_pass': 1.0, 'field_acc': 0.917, 'p95_ms': 790, 'cost_1k_usd': 0.0}`,
      },
      {
        title: "3 · สังเกต Error ที่ซ่อนอยู่และเลือกผู้ชนะตามเงื่อนไขธุรกิจ",
        explain: "ดูข้อ D2 ของ Ollama: แม้ `schema_pass = 1.0` แต่โมเดลใส่ `\"NONE\"` แทน `null` ทำให้ `field_acc` ลดเป็น `0.917` — จากนั้นใช้เกณฑ์ธุรกิจตัดสินใจเลือกผู้ชนะใน 2 สถานการณ์ต่างกัน",
        code: {
          language: "python",
          filename: "worked_day84.py",
          code: `def pick_provider(reports: list[dict], *, min_acc: float = 0.90, require_local: bool = False) -> dict | None:
    eligible = [
        r for r in reports
        if r["field_acc"] >= min_acc and (not require_local or r["is_local"])
    ]
    if not eligible:
        return None
    return min(eligible, key=lambda r: (r["cost_1k_usd"], -r["field_acc"], r["p95_ms"]))


print("General (>=95% acc):", pick_provider(reports, min_acc=0.95)["provider"])
print("PDPA Local (>=90% acc):", pick_provider(reports, min_acc=0.90, require_local=True)["provider"])`,
        },
        output: `General (>=95% acc): cloud-batch
PDPA Local (>=90% acc): ollama-qwen2.5-7b`,
      },
    ],
    gotcha: "สังเกตเคส `\"NONE\"` vs `null` ของ Local Ollama ในตัวอย่าง: นี่คือ bug ที่เจอบ่อยมากในโมเดลขนาด 7B! เมื่อพบ pattern แบบนี้ใน benchmark ให้เพิ่ม `@field_validator` แปลง string `\"NONE\"`/`\"N/A\"`/`\"\"` เป็น `None` หรือเพิ่ม few-shot example 1 ตัวอย่าง แล้วรัน benchmark ซ้ำเพื่อดูคะแนนพุ่งขึ้นจาก `0.917` เป็น `1.000`",
  },

  practice: {
    intro: "สร้าง Provider-Agnostic Extraction Benchmark Harness ใน `exercise_day84.py` เพื่อเปรียบเทียบ Cloud Real-Time, Cloud Batch และ Local Ollama บนชุดเอกสารใบแจ้งหนี้ไทยด้วย recorded/mock fixtures ที่รันผ่าน `pytest` ได้ 100%",
    requirements: [
      "สร้าง `ThaiInvoiceTarget(BaseModel)` ที่ตั้ง `ConfigDict(extra=\"forbid\")` และมีฟิลด์ `invoice_no: str | None`, `category: Literal[\"cloud\", \"office\", \"travel\"]`, `total_thb: float = Field(ge=0.0)`",
      "สร้าง `@dataclass(frozen=True) class GoldenInvoiceCase` (`doc_id: str`, `expected_invoice_no: str | None`, `expected_category: str`, `expected_total_thb: float`), `@dataclass(frozen=True) class ProviderOutput` (`doc_id: str`, `raw_json: str`, `latency_ms: float`, `input_tokens: int`, `output_tokens: int`) และ `@dataclass(frozen=True) class ProviderBenchmarkReport` (`provider_name: str`, `is_local: bool`, `schema_pass_rate: float`, `field_accuracy: float`, `p95_latency_ms: float`, `cost_per_1k_docs_usd: float`, `failed_doc_ids: tuple[str, ...]`) ",
      "สร้างฟังก์ชัน `compute_p95(values: list[float]) -> float` ด้วยวิธี nearest-rank (`idx = max(0, math.ceil(0.95 * len(ordered)) - 1)`, raise `ValueError` ถ้า `values` ว่าง)",
      "สร้างฟังก์ชัน `evaluate_provider(provider_name, golden_cases, outputs, *, is_local, input_per_1m_usd=0.0, output_per_1m_usd=0.0, batch_discount=0.0) -> ProviderBenchmarkReport`: จับคู่ `outputs` กับ `golden_cases` ด้วย `doc_id` (ไม่พึ่งลำดับ!), ตรวจด้วย `ThaiInvoiceTarget.model_validate_json()`, เก็บ `doc_id` ที่พัง schema หรือหายไปไว้ใน `failed_doc_ids` (เรียงตามตัวอักษร), คำนวณ `schema_pass_rate`, `field_accuracy` (3 ฟิลด์ต่อเอกสาร, `total_thb` เทียบด้วย tolerance `0.01`), `p95_latency_ms` และ `cost_per_1k_docs_usd` (`0.0` เมื่อ `is_local=True`)",
      "สร้างฟังก์ชัน `select_best_provider(reports: list[ProviderBenchmarkReport], *, min_schema_pass: float = 0.95, min_field_accuracy: float = 0.90, require_local_only: bool = False) -> ProviderBenchmarkReport | None` ที่กรองตาม Hard Gates แล้วเลือกผู้ชนะด้วยเกณฑ์ `(cost_per_1k_docs_usd ต่ำสุด, -field_accuracy สูงสุด, p95_latency_ms ต่ำสุด, provider_name)`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day84.py",
      code: `from dataclasses import dataclass
import math
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class ThaiInvoiceTarget(BaseModel):
    # TODO: ConfigDict(extra="forbid"), invoice_no, category, total_thb
    pass


@dataclass(frozen=True)
class GoldenInvoiceCase:
    doc_id: str
    expected_invoice_no: str | None
    expected_category: str
    expected_total_thb: float


@dataclass(frozen=True)
class ProviderOutput:
    doc_id: str
    raw_json: str
    latency_ms: float
    input_tokens: int
    output_tokens: int


@dataclass(frozen=True)
class ProviderBenchmarkReport:
    provider_name: str
    is_local: bool
    schema_pass_rate: float
    field_accuracy: float
    p95_latency_ms: float
    cost_per_1k_docs_usd: float
    failed_doc_ids: tuple[str, ...]


def compute_p95(values: list[float]) -> float:
    """คำนวณเปอร์เซ็นไทล์ที่ 95 แบบ nearest-rank."""
    # TODO: implement
    raise NotImplementedError


def evaluate_provider(
    provider_name: str,
    golden_cases: list[GoldenInvoiceCase],
    outputs: list[ProviderOutput],
    *,
    is_local: bool,
    input_per_1m_usd: float = 0.0,
    output_per_1m_usd: float = 0.0,
    batch_discount: float = 0.0,
) -> ProviderBenchmarkReport:
    """ประเมิน 1 provider บนชุด GoldenInvoiceCase โดยจับคู่ด้วย doc_id."""
    # TODO: implement
    raise NotImplementedError


def select_best_provider(
    reports: list[ProviderBenchmarkReport],
    *,
    min_schema_pass: float = 0.95,
    min_field_accuracy: float = 0.90,
    require_local_only: bool = False,
) -> ProviderBenchmarkReport | None:
    """คัดกรองด้วย Hard Gates แล้วเลือกผู้ชนะที่คุ้มค่าที่สุด."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day84.py",
      code: `import pytest
from exercise_day84 import (
    GoldenInvoiceCase,
    ProviderOutput,
    compute_p95,
    evaluate_provider,
    select_best_provider,
)

GOLDEN = [
    GoldenInvoiceCase("D1", "INV-101", "cloud", 1070.0),
    GoldenInvoiceCase("D2", None, "office", 320.0),
    GoldenInvoiceCase("D3", "INV-103", "travel", 2450.5),
    GoldenInvoiceCase("D4", "INV-104", "cloud", 5350.0),
]

CLOUD_OUTPUTS = [
    # จงใจสลับลำดับ D4 มาก่อน เพื่อเช็กว่าจับคู่ด้วย doc_id จริง
    ProviderOutput("D4", '{"invoice_no":"INV-104","category":"cloud","total_thb":5350.0}', 460.0, 920, 80),
    ProviderOutput("D1", '{"invoice_no":"INV-101","category":"cloud","total_thb":1070.0}', 420.0, 900, 80),
    ProviderOutput("D2", '{"invoice_no":null,"category":"office","total_thb":320.0}', 390.0, 850, 75),
    ProviderOutput("D3", '{"invoice_no":"INV-103","category":"travel","total_thb":2450.5}', 510.0, 950, 82),
]

OLLAMA_OUTPUTS = [
    ProviderOutput("D1", '{"invoice_no":"INV-101","category":"cloud","total_thb":1070.0}', 680.0, 900, 80),
    ProviderOutput("D2", '{"invoice_no":"NONE","category":"office","total_thb":320.0}', 640.0, 850, 75),
    ProviderOutput("D3", '{"invoice_no":"INV-103","category":"travel","total_thb":2450.5}', 790.0, 950, 82),
    ProviderOutput("D4", '{"invoice_no":"INV-104","category":"cloud","total_thb":5350.0}', 720.0, 920, 80),
]


def test_compute_p95():
    assert compute_p95([100.0, 200.0, 300.0, 400.0, 900.0]) == pytest.approx(900.0)
    assert compute_p95([10.0]) == pytest.approx(10.0)
    with pytest.raises(ValueError):
        compute_p95([])


def test_evaluate_cloud_vs_batch_vs_ollama():
    rep_rt = evaluate_provider(
        "cloud-realtime", GOLDEN, CLOUD_OUTPUTS,
        is_local=False, input_per_1m_usd=0.15, output_per_1m_usd=0.60,
    )
    rep_batch = evaluate_provider(
        "cloud-batch", GOLDEN, CLOUD_OUTPUTS,
        is_local=False, input_per_1m_usd=0.15, output_per_1m_usd=0.60, batch_discount=0.50,
    )
    rep_local = evaluate_provider(
        "ollama-qwen2.5-7b", GOLDEN, OLLAMA_OUTPUTS,
        is_local=True,
    )

    assert rep_rt.schema_pass_rate == pytest.approx(1.0)
    assert rep_rt.field_accuracy == pytest.approx(1.0)
    assert rep_rt.p95_latency_ms == pytest.approx(510.0)
    assert rep_rt.failed_doc_ids == ()
    assert rep_batch.cost_per_1k_docs_usd == pytest.approx(rep_rt.cost_per_1k_docs_usd * 0.5)

    assert rep_local.schema_pass_rate == pytest.approx(1.0)
    assert rep_local.field_accuracy == pytest.approx(11 / 12)
    assert rep_local.cost_per_1k_docs_usd == 0.0

    # เกณฑ์ความแม่นยำ >= 0.95 -> Cloud Batch ชนะ (ถูกกว่า Cloud Real-Time ครึ่งหนึ่ง)
    best_general = select_best_provider([rep_rt, rep_batch, rep_local], min_field_accuracy=0.95)
    assert best_general is not None and best_general.provider_name == "cloud-batch"

    # เกณฑ์ PDPA local only + acc >= 0.90 -> Ollama ชนะ
    best_pdpa = select_best_provider([rep_rt, rep_batch, rep_local], min_field_accuracy=0.90, require_local_only=True)
    assert best_pdpa is not None and best_pdpa.provider_name == "ollama-qwen2.5-7b"


def test_evaluate_provider_records_schema_failures():
    broken = [
        ProviderOutput("D1", '{"invoice_no":"INV-101","category":"invalid_cat","total_thb":1070.0}', 500.0, 900, 80),
        ProviderOutput("D2", '{"invoice_no":null,"category":"office","total_thb":320.0}', 400.0, 850, 75),
    ]
    rep = evaluate_provider("flaky-local", GOLDEN[:2], broken, is_local=True)
    assert rep.schema_pass_rate == pytest.approx(0.5)
    assert rep.field_accuracy == pytest.approx(3 / 6)
    assert rep.failed_doc_ids == ("D1",)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 3 test suites แบบออฟไลน์ใน < 1 วินาที",
      "ตรวจว่า `evaluate_provider` จับคู่ผลลัพธ์ด้วย `doc_id` อย่างถูกต้องแม้ลำดับใน `CLOUD_OUTPUTS` จะสลับกัน",
      "ตรวจว่าเอกสารที่พัง schema (`D1` ใน `broken`) ถูกบันทึกใน `failed_doc_ids` และนับคะแนนฟิลด์เป็น 0",
      "ตรวจว่า `select_best_provider` เลือก `cloud-batch` เมื่อ `min_field_accuracy=0.95` และเลือก `ollama-qwen2.5-7b` เมื่อ `require_local_only=True`",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day84.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `evaluate_provider` ให้สร้าง `by_id = {o.doc_id: o for o in outputs}` ก่อนวน `for case in golden_cases:` เพื่อให้จับคู่ถูกต้องแม้ `outputs` จะสลับลำดับมาเหมือนผลจาก Batch API",
      },
      {
        body: "ถ้า `case.doc_id not in by_id` หรือ `ThaiInvoiceTarget.model_validate_json(out.raw_json)` โยน `ValidationError` ให้เพิ่ม `case.doc_id` ลง `failed_ids` และไม่ต้องบวกคะแนนฟิลด์ของเอกสารนั้น (ส่วน `latencies` และ `tokens` ให้รวมจาก `out` หากมีอยู่ใน `by_id`)",
      },
      {
        body: "ตัวอย่างโครงของ `compute_p95` และ `select_best_provider` — เติม `ThaiInvoiceTarget` และ `evaluate_provider` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day84.py",
          code: `def compute_p95(values: list[float]) -> float:
    if not values:
        raise ValueError("values must not be empty")
    ordered = sorted(values)
    idx = max(0, math.ceil(0.95 * len(ordered)) - 1)
    return ordered[idx]


def select_best_provider(
    reports: list[ProviderBenchmarkReport],
    *,
    min_schema_pass: float = 0.95,
    min_field_accuracy: float = 0.90,
    require_local_only: bool = False,
) -> ProviderBenchmarkReport | None:
    eligible = [
        r for r in reports
        if r.schema_pass_rate >= min_schema_pass
        and r.field_accuracy >= min_field_accuracy
        and (not require_local_only or r.is_local)
    ]
    if not eligible:
        return None
    return min(
        eligible,
        key=lambda r: (r.cost_per_1k_docs_usd, -r.field_accuracy, r.p95_latency_ms, r.provider_name),
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
      title: "วัดแค่ Schema Pass Rate โดยไม่วัด Exact Field Accuracy",
      symptom: "โมเดลทั้ง Cloud และ Local ได้ Schema Pass 100% เท่ากัน เลยเลือก Local แต่พอขึ้นจริงลูกค้าโวยว่าเลขใบแจ้งหนี้กลายเป็นคำว่า `\"NONE\"` เต็มไปหมด",
      fix: "วัด Exact Field Accuracy เทียบกับ {{golden-dataset}} ทีละฟิลด์คู่กับ Schema Pass Rate เสมอ",
    },
    {
      title: "ดูเฉพาะค่าเฉลี่ย Latency (Mean) แทน P95 Latency",
      symptom: "ค่าเฉลี่ยดูดีที่ 400 ms แต่ในความจริง 5% ของคำขอติดค้างนานกว่า 6 วินาทีจนหน้าเว็บ timeout",
      fix: "รายงาน `P95 Latency` เพื่อเห็นปัญหาหางยาวของทั้ง Cloud network jitter และ Local GPU/RAM contention",
    },
    {
      title: "เทียบ Cloud กับ Local บน Prompt หรือ Schema ที่ไม่เหมือนกัน",
      symptom: "ฝั่ง Cloud ส่ง system prompt ละเอียดและ Strict Schema แต่ฝั่ง Ollama ส่ง prompt สั้น ๆ ทำให้ผล benchmark เอนเอียง",
      fix: "ใช้ Provider-Agnostic Runner ส่ง prompt, `temperature=0.0`, และ Pydantic validator ชุดเดียวกันทุกประการให้ทุก provider",
    },
    {
      title: "ลืมคำนวณทางเลือก Cloud Batch API (-50%) เมื่อเทียบต้นทุนกับ Local",
      symptom: "เทียบแค่ Cloud Real-Time ราคาเต็มกับ Local Ollama แล้วด่วนสรุปว่า Cloud แพงเกินไปสำหรับงานสกัดเอกสารรายคืน",
      fix: "แยกประเมินทั้ง `cloud-realtime`, `cloud-batch` (-50%) และ `local-ollama` ไว้ในตารางเดียวกันเสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d084-q1",
        "ในการทำ Extraction Benchmark เทียบ Cloud API กับ Local Ollama พบว่า Local Ollama ได้ `Schema Pass Rate = 100%` แต่ `Field Accuracy = 83%` เพราะโมเดลมักตอบ `\"N/A\"` แทน `null` ข้อมูลนี้สะท้อนเรื่องใด?",
        [
          ["Pydantic `model_validate_json()` พังและไม่ทำงาน", "Pydantic ทำงานถูกต้องตามสคีมาเพราะ `\"N/A\"` เป็น `str` ที่ถูกชนิดข้อมูล แต่ไม่ตรงความหมายที่ต้องการ (`None`)"],
          ["การผ่าน Schema Pass Rate ไม่ได้รับประกันความถูกต้องของเนื้อหา จึงต้องวัด Exact Field Accuracy คู่กันและใช้ผลนั้นปรับ prompt/validator", "ถูก — นี่คือเหตุผลที่ต้องมีทั้ง Schema Pass Rate และ Exact Field Accuracy ใน benchmark"],
          ["Local Ollama ใช้ไม่ได้เลยในงาน extraction ต้องเลิกใช้ทันที", "ปัญหานี้แก้ง่ายมากด้วย few-shot example หรือ `@field_validator` แปลง `\"N/A\"` → `None` แล้วรัน benchmark ซ้ำ"],
          ["ควรเปลี่ยนไปใช้ `detail=\"low\"` เพื่อให้โมเดลตอบ `null` ได้ดีขึ้น", "`detail` เป็นพารามิเตอร์ของภาพ Vision ไม่เกี่ยวกับการแปลง `\"N/A\"` เป็น `null`"],
        ],
        "B",
        "Schema Pass Rate บอกเพียงว่าโครงสร้าง JSON ถูกชนิดข้อมูล ส่วน Exact Field Accuracy เทียบกับ Golden Dataset จะเปิดเผยความเพี้ยนเชิงเนื้อหา (เช่น `\"N/A\"` vs `null`)",
        "ทำไม Extraction Benchmark ต้องรายงานทั้ง Schema Pass Rate และ Exact Field Accuracy คู่กัน?",
        "เพราะโมเดลอาจผ่าน Schema 100% แต่เนื้อหาในฟิลด์ผิด (เช่น ตอบ `\"N/A\"` แทน `null` หรืออ่านเลขคลาดเคลื่อน)",
      ),
      mc(
        "d084-q2",
        "บริษัทต้องสกัดสลิปและใบเสร็จไทยย้อนหลัง 40,000 ใบ (ไม่ติดข้อจำกัดส่งข้อมูลออกนอกองค์กร) โดยต้องการความแม่นยำระดับสูงและรอผลได้ถึงเช้าวันถัดไป ตัวเลือกใดคุ้มค่าที่สุดตามหลัก B21?",
        [
          ["ยิง Real-Time Vision API ด้วยรูปต้นฉบับ 4000×3000 px ทั้งหมด", "จ่ายแพงเต็มราคาทั้งค่าภาพที่ไม่ได้ย่อและราคา Real-Time และเสี่ยงติด rate limit"],
          ["ย่อภาพใบเสร็จ (`exif_transpose` + `max_side=1280` + JPEG) แล้วแพ็กเป็น `batch_input.jsonl` ด้วย `custom_id` ส่งเข้า Cloud Batch API (ลด 50%) + ตรวจยอดด้วย Pydantic", "ถูก — รวมจุดแข็งของ D81 (ย่อภาพ + cross-field check) กับ D82 (Batch API ลด 50% + `custom_id` reconciliation) ครบทุกชั้น"],
          ["ใช้ `pypdf` สกัดข้อความดิบจากรูปถ่ายสลิปทั้งหมด", "รูปถ่ายสลิปเป็นภาพไม่มี text layer ใช้ `pypdf` ดึงข้อความไม่ได้"],
          ["ใช้โมเดล Local ขนาด 1B แบบ `Q2_K` เพราะฟรี", "โมเดล 1B ระดับ 2-bit จะอ่านภาษาไทยและตัวเลขใบเสร็จเพี้ยนหนักจนใช้งานจริงไม่ได้"],
        ],
        "B",
        "การผสม Image Preprocessing (D81) + Batch API ลด 50% พร้อม `custom_id` (D82) + Pydantic cross-field validator (D77/D81) ให้ทั้งความแม่นยำสูงและต้นทุนต่ำที่สุดสำหรับงาน backfill",
        "ท่อสกัดใบเสร็จย้อนหลังจำนวนมากที่คุ้มค่าและน่าเชื่อถือที่สุดใน Block B21 ประกอบด้วยอะไรบ้าง?",
        "ย่อภาพ+แก้ EXIF (D81) → แพ็ก `custom_id` JSONL ส่ง Batch API ลด 50% (D82) → Reconcile + ตรวจยอดข้ามฟิลด์ด้วย Pydantic + Selective Retry",
      ),
      mc(
        "d084-q3",
        "องค์กรการเงินไทยมีเอกสารสัญญาที่มีข้อมูลส่วนบุคคลตาม {{pdpa}} ที่ห้ามส่งออกไปยัง Cloud API ภายนอก และมีเซิร์ฟเวอร์ในองค์กรที่มี VRAM 24 GB หากต้องการรันโมเดล 14B ควรเลือกแนวทางใด?",
        [
          ["ส่งเข้า Cloud Batch API เพราะราคาถูกลง 50%", "ผิดเงื่อนไขนโยบายข้อมูลองค์กรและ PDPA ที่ห้ามส่งข้อมูลออกนอกเครือข่าย"],
          ["รัน Local Open-Weights 14B ผ่าน Ollama ที่ระดับ `Q8_0` (~17.7 GB) หรือ `Q4_K_M` (~10.3 GB) พร้อม Strict Pydantic Schema และ Validation-Repair Loop", "ถูก — ทั้งสองระดับอยู่ในงบปลอดภัย ~80% ของ 24 GB (~19.2 GB) ข้อมูลไม่เคยหลุดออกนอกองค์กร และควบคุมคุณภาพด้วย Pydantic + Repair Loop"],
          ["รันโมเดล 14B แบบ `FP16` (~32.8 GB) บน VRAM 24 GB", "ขนาด 32.8 GB เกิน VRAM 24 GB จะล้นลง CPU/swap จนช้ามาก"],
          ["ปิด `temperature=0.0` แล้วตั้ง `temperature=1.5` เพื่อลดการใช้ VRAM", "temperature ไม่ได้ช่วยลดการใช้ VRAM และยิ่งทำให้ extraction มั่วขึ้น"],
        ],
        "B",
        "สำหรับ VRAM 24 GB (งบปลอดภัย ~19.2 GB) โมเดล 14B ที่ `Q8_0` (~17.7 GB) หรือ `Q4_K_M` (~10.3 GB) พอดีกับฮาร์ดแวร์และเก็บข้อมูล PDPA ไว้ภายใน 100%",
        "บนเซิร์ฟเวอร์ VRAM 24 GB สำหรับงานเอกสารลับ PDPA ควรเลือกระดับ Quantization ใดสำหรับโมเดล 14B?",
        "`Q8_0` (~17.7 GB) หรือ `Q4_K_M` (~10.3 GB) เพราะไม่เกินงบปลอดภัย ~19.2 GB ต่างจาก `FP16` (~32.8 GB) ที่ล้น VRAM",
      ),
      mc(
        "d084-q4",
        "จากผลการ benchmark 3 providers ต่อไปนี้ หากตั้ง Hard Gate `min_field_accuracy = 0.94` และไม่ติดเงื่อนไข local-only ผู้ชนะตามหลักการเลือกที่ถูกต้องคือข้อใด?\n- `cloud-rt`: acc `0.98`, cost `$0.20/1k`, P95 `450 ms`\n- `cloud-batch`: acc `0.98`, cost `$0.10/1k`, P95 `450 ms`\n- `local-ollama`: acc `0.91`, cost `$0.00/1k`, P95 `720 ms`",
        [
          ["`local-ollama` เพราะต้นทุน `$0.00` ถูกที่สุด", "ไม่ผ่าน Hard Gate เพราะ `field_accuracy = 0.91` ต่ำกว่าเกณฑ์ `0.94`"],
          ["`cloud-batch` เพราะผ่านเกณฑ์ความแม่นยำ `0.98 >= 0.94` และมีต้นทุน `$0.10/1k` ต่ำกว่า `cloud-rt` ครึ่งหนึ่ง", "ถูก — กรองด้วย Hard Gate ก่อน แล้วเลือกตัวที่คุ้มค่าที่สุดในกลุ่มที่ผ่านเกณฑ์"],
          ["`cloud-rt` เพราะจ่ายแพงกว่าแปลว่าเสถียรกว่าเสมอ", "ได้ความแม่นยำเท่ากัน (`0.98`) แต่จ่ายแพงกว่า `cloud-batch` 2 เท่า"],
          ["เลือกไม่ได้เพราะต้องให้ทุก provider ได้ `field_accuracy = 1.0` เท่านั้น", "เกณฑ์ Hard Gate คือ `>= 0.94` ซึ่งทั้ง `cloud-rt` และ `cloud-batch` ผ่านชัดเจน"],
        ],
        "B",
        "Hard Gate จะตัด `local-ollama` (`0.91 < 0.94`) ออกก่อน จากนั้นระหว่างสองตัวเลือกที่ผ่านเกณฑ์ `cloud-batch` ชนะด้วยต้นทุนที่ถูกกว่าครึ่งหนึ่ง",
        "หลักการเลือกผู้ชนะจากตาราง Benchmark แบบ 2 ชั้น (Hard Gate + Ranking) ทำงานอย่างไร?",
        "ขั้นแรกตัดทุก provider ที่ไม่ผ่านเกณฑ์ขั้นต่ำ (accuracy, schema pass, PDPA local-only) ออกก่อน แล้วค่อยเลือกตัวที่ cost ต่ำสุดในกลุ่มที่ผ่าน",
      ),
    ],
  },

  takeaways: [
    "ทบทวนครบ Block B21: {{multimodal}} Vision + ย่อภาพคุม tokens (D81), {{batch-api}} ลดงบ 50% + `custom_id` reconciliation (D82), และ Local Ollama + GGUF {{quantization}} (D83)",
    "ตัดสินใจเลือกระหว่าง Cloud Real-Time, Cloud Batch และ Local Ollama ด้วย 4 ตัวชี้วัดเสมอ: **Schema Pass Rate**, **Exact Field Accuracy**, **P95 Latency** และ **Cost per 1,000 docs**",
    "ใช้เกณฑ์ 2 ชั้น (Hard Gates สำหรับคุณภาพ/{{pdpa}} → Cost Optimization) และเก็บ recorded fixtures ไว้ใน `pytest` เพื่อให้ benchmark มี {{reproducibility}} 100%",
    "พร้อมก้าวสู่ Block B22 (Day 85–88): ตัดสินใจ Fine-Tuning vs Prompt vs RAG และสร้าง Phase 3 Mini-Project เต็มรูปแบบ",
  ],

  reviewCards: [
    rc(
      "d084-rc-1",
      "4 ตัวชี้วัดหลักที่ใช้เปรียบเทียบ Cloud API vs Local Ollama บนงานสกัดเอกสารไทยคืออะไร?",
      "1) Schema Pass Rate, 2) Exact Field Accuracy (เทียบ Golden Dataset), 3) P95 Latency (ms), และ 4) Cost per 1,000 Docs (USD)",
    ),
    rc(
      "d084-rc-2",
      "ทำไมใน Extraction Benchmark จึงควรจับคู่ `ProviderOutput` กับ `GoldenInvoiceCase` ด้วย `doc_id` แทนการใช้ `zip()`?",
      "เพื่อรองรับผลลัพธ์จาก Batch API หรือ async runner ที่อาจสลับลำดับและมีบางเอกสารหายไป (missing) โดยไม่ให้คะแนนคลาดเคลื่อน",
    ),
    rc(
      "d084-rc-3",
      "เมื่อ Local Ollama ได้ Schema Pass 100% แต่ Field Accuracy ต่ำเพราะตอบ `\"NONE\"` แทน `null` ควรปรับปรุงอย่างไรก่อนสรุปว่าโมเดลใช้ไม่ได้?",
      "เพิ่ม few-shot example แสดงค่า `null` ที่ชัดเจน และเพิ่ม Pydantic `@field_validator` normalize ค่า `\"NONE\"`/`\"N/A\"`/`\"\"` เป็น `None` แล้วรัน benchmark วัดผลซ้ำ",
    ),
  ],

  sources: [
    { label: "OpenAI API Docs — Structured Outputs & Batch API", href: "https://platform.openai.com/docs/guides/batch" },
    { label: "Ollama Docs — OpenAI-Compatible API Reference", href: "https://github.com/ollama/ollama/blob/main/docs/openai.md" },
    { label: "Pydantic v2 Docs — Validation & Serialization", href: "https://docs.pydantic.dev/latest/concepts/models/" },
    { label: "Anthropic Docs — Prompt Engineering & Evaluation Basics", href: "https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests" },
  ],

  glossary: ["multimodal", "batch-api", "quantization", "structured-output", "golden-dataset", "pydantic", "pdpa", "reproducibility"],
});
