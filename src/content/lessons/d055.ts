import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D055 — Phase 2 / Block B14
 * Phase 2 Mini-Project: Design Ticket Priority ML Pipeline
 */
export const d055: Lesson = defineLesson({
  day: 55,
  titleTh: "ออกแบบ Phase 2 Mini-Project: Thai Ticket Priority ML Pipeline (<10ms)",
  tagline:
    "30 นาที · รันบน CPU 100% ไม่ใช้ API key · วางพิมพ์เขียว Portfolio #2 รวมข้อความไทย + ข้อมูลตาราง พร้อม Leakage Guard และ SLA Gate",
  icon: "file-text",
  visual: {
    id: "phase2-ml-pipeline",
    title: "พิมพ์เขียว Phase 2 Mini-Project — Thai Ticket Priority ML Pipeline (<10ms)",
    caption:
      "คลิกสำรวจทั้ง 5 ชั้นตั้งแต่ Polars Clean → PyThaiNLP TF-IDF + Tabular → LightGBM/LogReg → Threshold/Error Analysis → ONNX & Tests",
    alt: "แผนภาพสถาปัตยกรรม Phase 2 Mini-Project Ticket Priority ML Pipeline",
  },
  requiresApiKey: false,
  tools: ["Polars", "PyThaiNLP", "scikit-learn", "LightGBM", "ONNX"],

  bigPicture: [
    {
      node: 0,
      heading: "กำหนดโจทย์ธุรกิจและ SLA ที่วัดผลได้จริง",
      body: "ทีมซัพพอร์ต e-commerce ไทยรับทิกเก็ตวันละหลักหมื่นใบ หากคัดแยกทิกเก็ตด่วน (`is_urgent = 1`) ช้าจะเสียค่าปรับ SLA และเสียลูกค้า VIP — แต่การยิง {{llm}} ทุกใบช้าเกินไปและต้นทุนบานปลาย",
      lessonNote:
        "Portfolio Milestone #2 ออกแบบ Classical ML Pipeline ที่ตอบสนอง **P95 < 10ms** บน CPU ด้วยต้นทุนใกล้ศูนย์บาท",
    },
    {
      node: 1,
      heading: "ล็อก Data Contract และเกราะป้องกัน Data Leakage ตั้งแต่ก่อนเขียนโค้ดเทรน",
      body: "โปรเจกต์ ML เกินครึ่งล้มเหลวไม่ใช่เพราะเลือกอัลกอริทึมผิด แต่เพราะเผลอเอาฟีเจอร์ที่เกิดหลังเวลาเปิดทิกเก็ต (เช่น `first_response_min` หรือ `refund_approved`) มาเทรน หรือแบ่งข้อมูลแบบสุ่มจนอนาคตรั่วเข้าอดีต",
      lessonNote:
        "เขียน **Executable Spec** ด้วย {{pydantic}} และตัวตรวจ {{data-leakage}} บน {{polars}} เพื่อกันคอลัมน์ต้องห้ามและตรวจลำดับเวลาของ split อัตโนมัติ",
    },
    {
      node: 2,
      heading: "ออกแบบ Hybrid Feature Pipeline: ข้อความไทย + Tabular Metadata",
      body: "ข้อมูลทิกเก็ตจริงไม่ได้มีแค่ข้อความหรือแค่ตัวเลข แต่มีทั้งคู่ — ข้อความ \"โอนพร้อมเพย์แล้วไม่เข้า\" บอกอาการ ส่วน `customer_tier=vip`, `order_value_thb=15000` และ `wait_minutes=25` บอกความเร่งด่วนเชิงธุรกิจ",
      lessonNote:
        "วางโครง {{sklearn-pipeline}} (`ColumnTransformer`) ที่รวม `PyThaiNLP newmm + TF-IDF` เข้ากับฟีเจอร์ตาราง เพื่อเทรนเทียบ `LogisticRegression` กับ {{lightgbm}} ใน Day 56",
    },
    {
      node: 3,
      heading: "ตั้ง Quality Gates สำหรับโมเดล ความเร็ว และการทดสอบ",
      body: "ก่อนปล่อยโมเดลขึ้น Production ต้องมีเกณฑ์ผ่าน/ไม่ผ่านที่ชัดเจนทั้งด้านความแม่นยำ (`PR-AUC`, `Recall@urgent`), ด้านระบบ (`P95 latency <= 10ms`) และด้านความปลอดภัย/Monitoring",
      lessonNote:
        "วางแผนการส่งงานตลอดช่วงจบ Phase 2 (Day 55 ออกแบบ → Day 56 เทรน → Day 57 Error Analysis → Day 58 ONNX <10ms → Day 59 Tests → Day 60 Demo)",
    },
  ],

  objectives: [
    "**กำหนดขอบเขตและเหตุผลทางสถาปัตยกรรม** ของ Portfolio Milestone #2 (`Thai Support Ticket Priority ML Pipeline`) โดยเทียบข้อดีของ Classical ML (<10ms, ต้นทุนต่ำ) กับ {{llm}} ได้ชัดเจน",
    "**ออกแบบ 5-Layer ML Pipeline & Data Contract** ที่รวมข้อความภาษาไทย ({{pythainlp}} + {{tfidf}}) เข้ากับ Tabular Metadata ผ่าน `ColumnTransformer` โดยกำหนดรายการคอลัมน์ต้องห้ามเพื่อป้องกัน {{data-leakage}}",
    "**เขียน Executable Specification & Quality Gate Checker** ด้วย {{pydantic}} และ {{polars}} เพื่อตรวจสอบสคีมา, การแบ่ง Train/Val/Test ตามเวลา และเกณฑ์ผ่าน (`PR-AUC`, `Recall@urgent`, `P95 < 10ms`) ก่อนลงมือเทรนใน Day 56",
  ],

  prerequisites: [
    "ผ่าน Block B09–B14: {{polars}}, `scikit-learn` `ColumnTransformer`, {{lightgbm}}, {{pythainlp}} + {{tfidf}}, ONNX และ Feature Drift",
    "ใช้ {{pydantic}} v2 และ `pytest` จาก Phase 1 ได้คล่อง",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโครงสร้างโปรเจกต์สำหรับ **Phase 2 Mini-Project (`thai-ticket-priority`)** ที่เราจะพัฒนาต่อยอดต่อเนื่องตั้งแต่ Day 55 จนถึง Day 60 (Phase 2 Demo)",
    commands: `uv init thai-ticket-priority && cd thai-ticket-priority
uv add polars pydantic scikit-learn lightgbm pythainlp joblib skl2onnx onnxruntime numpy pandas
uv add --dev pytest ruff
uv run python -c "import polars, pydantic, lightgbm, pythainlp, onnxruntime; print('Phase 2 Mini-Project Ready!')"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `thai-ticket-priority` ด้วย `uv init`"],
      ["deps", "ติดตั้งชุดเครื่องมือ Phase 2 ครบชุด (Polars, Pydantic, PyThaiNLP, scikit-learn, LightGBM, ONNX)"],
      ["verify", "รันคำสั่งเช็ก import แล้วเห็น `Phase 2 Mini-Project Ready!`"],
    ],
    note: "เก็บโฟลเดอร์ `thai-ticket-priority` นี้ไว้ใช้ยาวถึง Day 60 — คุณจะได้ repo ที่สะอาด มีสเปก มีเทสต์ มี benchmark <10ms และพร้อมโชว์ในพอร์ตสมัครงานจริง",
  },

  concepts: [
    {
      id: "scoping-milestone2-ml-vs-llm",
      title: "1 · Scoping Portfolio Milestone #2: ทำไมงานนี้ต้องเริ่มที่ Classical ML",
      paragraphs: [
        "ปัญหาจริงของทีมซัพพอร์ต e-commerce ไทยคือทุกวันมีทิกเก็ตไหลเข้ามาจาก LINE, Chat และ Email หลักหมื่นใบ โดยมีประมาณ **12–18% ที่เป็นเคสด่วน (`is_urgent = 1`)** เช่น โอนเงินตัดยอดซ้ำ, ลูกค้า VIP รอเกินกำหนด หรือสินค้าเสียหายหนัก ซึ่งหากตอบช้าเกิน 15 นาทีจะเสียค่าปรับ SLA",
        "ย้อนกลับไปดู Decision Matrix ของ Day 41: หากเราโยนทุกทิกเก็ตเข้า {{llm}} API เพื่อจัดระดับความด่วน เราจะเจอทั้ง Latency 500–2,000ms ต่อใบ, ค่า token ภาษาไทยที่แพงกว่าอังกฤษ 1.5–3 เท่า และความเสี่ยงเมื่อ API ล่ม — ขณะที่งาน **Binary Classification ที่มีความถี่สูงและมีข้อมูลตารางประกอบ** เป็นจุดแข็งเต็มร้อยของ Classical ML",
        "เป้าหมายของ Milestone #2 จึงชัดเจนมาก: สร้าง Hybrid Pipeline ที่รวม **ข้อความไทย + ข้อมูลตาราง** ให้ได้ค่า `PR-AUC >= 0.78`, `Recall@urgent >= 0.85` (บน threshold ที่จูนจาก Val set ตามต้นทุน SLA) และทำ **P95 single-row latency < 10ms** บน CPU ธรรมดา!",
      ],
      analogy:
        "เหมือนห้องฉุกเฉินในโรงพยาบาล: พยาบาลคัดกรองหน้าประตู (Classical ML <10ms) แยกคนไข้ฉุกเฉินออกภายในเสี้ยววินาทีด้วยสัญญาณชีพ + อาการสั้น ๆ ก่อนส่งต่อให้แพทย์เฉพาะทาง (LLM ใน Phase 3–4) วินิจฉัยเชิงลึก",
      bullets: [
        "**Target (`is_urgent`)**: `1` = ด่วนต้องส่งคิวพิเศษภายใน 15 นาที, `0` = ปกติ (ข้อมูลไม่สมดุล ~15% positive)",
        "**Business Cost Matrix**: `cost_fp = 100` บาท (ส่งทีมด่วนตรวจเก้อ) vs `cost_fn = 1,000` บาท (ปล่อยเคสด่วนหลุด SLA)",
        "**Primary Evaluation Metrics**: `PR-AUC` (วัดคุณภาพการจัดอันดับ), `Recall@urgent` และ `Expected Business Cost` บน Test set",
        "**System SLA**: P95 single-row inference latency `<= 10.0 ms` บน CPU + ขนาด artifact กะทัดรัด + ไม่มี API key",
      ],
      whyTitle: "Why this matters — ชิ้นงานพอร์ตที่ตอบคำถามสัมภาษณ์ได้ครบทั้ง ML และ Engineering",
      whyParagraphs: [
        "พอร์ตของมือใหม่ส่วนใหญ่จบแค่ Jupyter Notebook ที่โหลดไฟล์ CSV มา `.fit()` แล้วพิมพ์ `accuracy = 0.91` ซึ่งไม่สะท้อนงานจริงในบริษัท",
        "โปรเจกต์ `thai-ticket-priority` แสดงให้ผู้สัมภาษณ์เห็นครบทุกมิติ: การเลือกเครื่องมืออย่างมีเหตุผล (ML vs LLM), การจัดการภาษาไทยจริง, การกัน Leakage, การจูน Threshold ด้วยต้นทุนธุรกิจ, การส่งออก ONNX <10ms และการตรวจ Feature Drift",
      ],
    },
    {
      id: "five-layer-architecture-and-leakage-contract",
      title: "2 · พิมพ์เขียว 5 ชั้นและ Data Contract ปลอด Data Leakage",
      paragraphs: [
        "สถาปัตยกรรมของ `thai-ticket-priority` แบ่งเป็น 5 ชั้นที่รับผิดชอบแยกขาดจากกันอย่างชัดเจน (Modular Design) เพื่อให้ทดสอบทีละส่วนและเปลี่ยนโมเดลได้โดยไม่รื้อทั้งระบบ:",
        "จุดชี้เป็นชี้ตายในชั้นข้อมูลคือ **Point-in-Time Feature Contract (กัน Target/Future Leakage)**: ฟีเจอร์ทุกตัวที่ใช้ตอนเทรนต้องเป็นข้อมูลที่ **มีอยู่จริง ณ วินาทีที่ลูกค้ากดส่งทิกเก็ต** เท่านั้น คอลัมน์ที่เกิดขึ้น *ภายหลัง* เช่น `first_response_min`, `agent_id`, `resolution_code` หรือ `refund_approved` ห้ามโผล่ในอินพุตเด็ดขาด!",
        "และสำหรับการแบ่ง **Train / Val / Test (60% / 20% / 20%)** หากข้อมูลมี timestamp (`created_at`) ให้ใช้ **Time-based Split** (`max(train.created_at) < min(val.created_at) < min(test.created_at)`) เพื่อให้การประเมินจำลองการทำนายอนาคตจากอดีตได้สมจริงที่สุด",
      ],
      analogy:
        "เหมือนการวางแบบแปลนบ้านก่อนลงเสาเข็ม: ระบุให้ชัดว่าท่อน้ำ (Polars), สายไฟ (ColumnTransformer), ตู้เบรกเกอร์ (Threshold & Quality Gate) และมิเตอร์ (Drift Monitor) อยู่ตรงไหน เพื่อไม่ให้ช่างเดินท่อผิดแล้วต้องทุบผนังแก้ทีหลัง",
      bullets: [
        "**Layer 1 · Ingestion & Clean ({{polars}})** — อ่าน {{parquet}}/CSV ด้วย Lazy mode, ตัดซ้ำ, ล้าง UTF-8/null และตรวจสคีมา",
        "**Layer 2 · Leakage-Free Split** — ตรวจห้ามมีคอลัมน์หลังเหตุการณ์ (post-event columns) และตรวจลำดับเวลา Train < Val < Test",
        "**Layer 3 · Hybrid Features (`ColumnTransformer`)** — Text (`PyThaiNLP newmm + TfidfVectorizer`) + Numeric (`SimpleImputer + StandardScaler`) + Categorical (`OneHotEncoder(handle_unknown='ignore')`)",
        "**Layer 4 · Model & Decision Policy** — เทียบ Baseline (`LogisticRegression`) vs {{lightgbm}} ด้วย Val PR-AUC แล้วจูน `best_threshold` บน Val เท่านั้น",
        "**Layer 5 · Packaging & Monitoring** — เซฟ Immutable Bundle (`model` + `metadata.json` + `data_card.json` + `drift_baseline.json`) พร้อม Benchmark `< 10ms` และ `pytest`",
      ],
      whyTitle: "Why this matters — แยกการออกแบบให้ชัดก่อนลงมือเขียนโค้ดเทรน",
      whyParagraphs: [
        "การเขียนกฎ **Forbidden Columns** และ **Temporal Split Check** เป็นโค้ดที่รันตรวจอัตโนมัติ (ไม่ใช่แค่เขียนเตือนไว้ใน README) ช่วยป้องกันความผิดพลาดที่พบบ่อยที่สุดเวลาทีมขยายฟีเจอร์เพิ่มในอนาคต",
        "เมื่อโครงสร้าง 5 ชั้นชัดแบบนี้ ใน Day 56 คุณจะเขียนโค้ดเทรน end-to-end ได้เร็วและสะอาดมาก โดยไม่ต้องมานั่งแก้ปัญหา schema ชนกันกลางทาง",
      ],
    },
    {
      id: "executable-spec-and-quality-gates",
      title: "3 · เขียน Executable Spec & Quality Gates ด้วย Pydantic + Polars",
      paragraphs: [
        "แทนที่จะปล่อยให้สเปกเป็นเพียงเอกสารที่ไม่มีใครเปิดอ่านหลังวันแรก เราแปลงสเปกของ Mini-Project ให้เป็น **Executable Contract** ด้วย {{pydantic}} v2 (`TicketInput`, `QualityGate`, `ModelEvalSummary`) ที่รันตรวจได้จริงใน CI และ `pytest`",
        "`TicketInput` ทำหน้าที่เป็น {{data-contract}} ที่ขอบระบบ Inference: บังคับชนิดและขอบเขตข้อมูล เช่น `order_value_thb >= 0`, `wait_minutes >= 0`, `customer_tier` ต้องเป็น `Literal[\"standard\", \"silver\", \"gold\", \"vip\"]` และข้อความ `text` ต้องไม่ว่างเปล่า",
        "`QualityGate` ทำหน้าที่เป็นประตูตรวจรับโมเดลอัตโนมัติก่อนปล่อยขึ้น Production: หากโมเดลเวอร์ชันใหม่ได้ `test_pr_auc < 0.78`, `test_urgent_recall < 0.85` หรือ `p95_latency_ms > 10.0` ระบบจะตีกลับพร้อมเหตุผลที่ชัดเจนทันที (เหมือน CI Eval Gate ที่เราจะขยายผลใน Phase 5)",
      ],
      analogy:
        "เหมือนรายการตรวจรับรถยนต์ก่อนออกจากโรงงาน (Pre-Delivery Inspection): ต้องผ่านครบทุกข้อทั้งเบรก ความเร็ว และความปลอดภัย หากตกข้อเดียวรถจะถูกกักไว้ไม่ส่งมอบให้ลูกค้า",
      code: {
        language: "python",
        filename: "spec_preview.py",
        code: `from typing import Literal
from pydantic import BaseModel, Field


class TicketInput(BaseModel):
    ticket_id: str = Field(min_length=1)
    text: str = Field(min_length=2, max_length=2000)
    customer_tier: Literal["standard", "silver", "gold", "vip"]
    channel: Literal["line", "chat", "email"]
    order_value_thb: float = Field(ge=0.0)
    wait_minutes: float = Field(ge=0.0)
    past_tickets_30d: int = Field(ge=0)


class QualityGate(BaseModel):
    min_pr_auc: float = 0.78
    min_urgent_recall: float = 0.85
    max_p95_latency_ms: float = 10.0


sample = TicketInput(
    ticket_id="T-9001",
    text="โอนเงินผ่านพร้อมเพย์ตัดยอดซ้ำสองรอบ รบกวนตรวจด่วนครับ",
    customer_tier="vip",
    channel="line",
    order_value_thb=8500.0,
    wait_minutes=18.0,
    past_tickets_30d=2,
)
print("Validated ticket:", sample.ticket_id, "| tier:", sample.customer_tier)`,
        caption: "Pydantic Contract บังคับสคีมาอินพุตให้สะอาดตั้งแต่วันออกแบบและใช้ซ้ำต่อได้จนถึง FastAPI ใน Phase 5",
      },
      whyTitle: "Why this matters — สะพานเชื่อม Phase 1, Phase 2 และ Phase 5",
      whyParagraphs: [
        "สังเกตว่าเรากำลังนำความรู้จาก Phase 1 (`Pydantic`, `pytest`, `uv`) มาผสานเข้ากับ Phase 2 (`Polars`, `PyThaiNLP`, `scikit-learn`, `LightGBM`, `ONNX`) อย่างเป็นธรรมชาติ",
        "แนวคิด **Quality Gate** นี้คือรูปแบบเดียวกับ CI Eval Gate สำหรับ LLM/RAG ใน Phase 5 — เมื่อฝึกจนชินกับ Classical ML วันนี้ คุณจะเข้าใจระบบประเมินผลอัตโนมัติของทั้งหลักสูตรได้ทะลุปรุโปร่ง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ ML Architecture Spec กับ API Design Doc & CI Gate",
      body: [
        "การออกแบบ ML Pipeline ในวันนี้คือการเขียน Technical Design Doc + Contract Test แบบเดียวกับงาน Backend Engineering:",
      ],
      table: [
        ["`TicketInput` (Pydantic)", "Request DTO / Zod Schema ที่ขอบ API"],
        ["`FORBIDDEN_LEAKAGE_COLS`", "Denylist ป้องกันข้อมูลหลังเหตุการณ์รั่วเข้าฟีเจอร์"],
        ["Time-based Split Check", "Invariant Test รับประกันไม่เอาข้อมูลอนาคตมาเทรน"],
        ["`ColumnTransformer` Spec", "Data Transformation Layer ที่รวมหลายแหล่งข้อมูล"],
        ["`QualityGate` (PR-AUC, Recall, <10ms)", "CI Release Gate ที่บล็อกการ deploy หาก SLA ไม่ผ่าน"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมต้องออกแบบสเปกก่อน 1 วันแทนที่จะรีบเทรนเลย?",
      body: [
        "ในโปรเจกต์จริง หากเรารีบเทรนโมเดลโดยไม่ตกลงชื่อคอลัมน์, คอลัมน์ต้องห้าม และตัวชี้วัดเป้าหมายก่อน มักจะเสียเวลาวนแก้โค้ดหลายรอบเพราะเพิ่งมารู้ตัวตอนท้ายว่าลืมคอลัมน์สำคัญหรือเผลอใส่ฟีเจอร์ที่เกิด Data Leakage เข้าไป",
        "การใช้เวลา 30 นาทีวันนี้สร้างไฟล์สเปกและตัวตรวจสคีมาที่รันได้จริง จะทำให้พรุ่งนี้ (Day 56) เราโฟกัสกับการเทรน เปรียบเทียบโมเดล และจูน Threshold ได้อย่างลื่นไหล 100%",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ก่อนเริ่มเทรนโมเดลในวันพรุ่งนี้ เราจะสร้างตัวตรวจสอบชุดข้อมูล (`audit_dataset_contract`) ด้วย Polars เพื่อจับปัญหา 3 อย่างตั้งแต่หน้าประตู: คอลัมน์ขาดหาย, คอลัมน์ต้องห้ามที่ทำให้เกิด Leakage และช่วงเวลา Train/Val/Test ทับซ้อนกัน",
    steps: [
      {
        title: "1 · ประกาศ Feature Schema และ Forbidden Post-Event Columns",
        explain:
          "ล็อกรายชื่อคอลัมน์อินพุตที่อนุญาต, คอลัมน์เป้าหมาย (`is_urgent`) และรายการคอลัมน์ที่เกิดขึ้นหลังเปิดทิกเก็ตซึ่งห้ามหลุดเข้ามาในชุดฟีเจอร์เด็ดขาด",
        code: {
          language: "python",
          filename: "worked_day55.py",
          code: `import polars as pl

REQUIRED_FEATURE_COLS = {
    "text",
    "customer_tier",
    "channel",
    "order_value_thb",
    "wait_minutes",
    "past_tickets_30d",
}
FORBIDDEN_LEAKAGE_COLS = {
    "first_response_min",
    "resolved_at",
    "agent_id",
    "refund_approved",
    "sla_breached",
}
TARGET_COL = "is_urgent"
print("Allowed features:", len(REQUIRED_FEATURE_COLS), "| Blocked leakage cols:", len(FORBIDDEN_LEAKAGE_COLS))`,
        },
        output: `Allowed features: 6 | Blocked leakage cols: 5`,
      },
      {
        title: "2 · เขียนตัวตรวจ Dataset Contract และ Temporal Split Overlap",
        explain:
          "ตรวจสอบว่าตาราง Polars มีคอลัมน์ครบ, ไม่มีคอลัมน์ Leakage ปนอยู่ และวันที่สูงสุดของ Train น้อยกว่าวันที่ต่ำสุดของ Val และ Test อย่างเคร่งครัด",
        code: {
          language: "python",
          filename: "worked_day55.py",
          code: `def audit_splits(train_df: pl.DataFrame, val_df: pl.DataFrame, test_df: pl.DataFrame) -> dict[str, object]:
    cols = set(train_df.columns)
    missing = sorted(REQUIRED_FEATURE_COLS - cols)
    leaked = sorted(FORBIDDEN_LEAKAGE_COLS & cols)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    if leaked:
        raise ValueError(f"Detected post-event leakage columns: {leaked}")

    train_max = train_df["created_at"].max()
    val_min, val_max = val_df["created_at"].min(), val_df["created_at"].max()
    test_min = test_df["created_at"].min()
    if not (train_max < val_min and val_max < test_min):
        raise ValueError("Temporal split overlap detected: require train < val < test")

    return {
        "rows": {"train": train_df.height, "val": val_df.height, "test": test_df.height},
        "train_positive_rate": round(float(train_df[TARGET_COL].mean()), 4),
    }


df_tr = pl.DataFrame({
    "created_at": ["2025-01-01", "2025-01-15"],
    "text": ["โอนเงินซ้ำครับ", "สอบถามวิธีใช้งาน"],
    "customer_tier": ["vip", "standard"],
    "channel": ["line", "email"],
    "order_value_thb": [5000.0, 300.0],
    "wait_minutes": [22.0, 5.0],
    "past_tickets_30d": [2, 0],
    "is_urgent": [1, 0],
})
df_va = df_tr.with_columns(pl.Series("created_at", ["2025-02-01", "2025-02-10"]))
df_te = df_tr.with_columns(pl.Series("created_at", ["2025-03-01", "2025-03-10"]))
print("Audit passed:", audit_splits(df_tr, df_va, df_te))`,
        },
        output: `Audit passed: {'rows': {'train': 2, 'val': 2, 'test': 2}, 'train_positive_rate': 0.5}`,
      },
      {
        title: "3 · ตรวจรับผลโมเดลผ่าน Quality Gate ก่อนขึ้น Production",
        explain:
          "รับผลประเมินของโมเดล (`pr_auc`, `urgent_recall`, `p95_latency_ms`) แล้วเทียบกับเกณฑ์ SLA ที่ตกลงกันไว้ในสเปก",
        code: {
          language: "python",
          filename: "worked_day55.py",
          code: `def check_quality_gate(
    pr_auc: float,
    urgent_recall: float,
    p95_latency_ms: float,
    min_pr_auc: float = 0.78,
    min_recall: float = 0.85,
    max_p95_ms: float = 10.0,
) -> dict[str, object]:
    failures = []
    if pr_auc < min_pr_auc:
        failures.append(f"pr_auc {pr_auc:.3f} < {min_pr_auc}")
    if urgent_recall < min_recall:
        failures.append(f"urgent_recall {urgent_recall:.3f} < {min_recall}")
    if p95_latency_ms > max_p95_ms:
        failures.append(f"p95_latency_ms {p95_latency_ms:.2f} > {max_p95_ms}")
    return {"passed": len(failures) == 0, "failures": failures}


print("Candidate A:", check_quality_gate(0.84, 0.89, 2.4))
print("Candidate B:", check_quality_gate(0.86, 0.88, 45.0))`,
        },
        output: `Candidate A: {'passed': True, 'failures': []}
Candidate B: {'passed': False, 'failures': ['p95_latency_ms 45.00 > 10.0']}`,
      },
    ],
    gotcha:
      "จุดสังเกต: ในตัวอย่างที่ 3 โมเดล Candidate B ได้ PR-AUC สูงกว่านิดหน่อย (0.86 vs 0.84) แต่ช้าถึง 45ms จนตก Latency Gate — นี่คือวิธีคิดแบบ AI Engineer ที่มองทั้งคุณภาพโมเดลและขีดจำกัดระบบจริงควบคู่กัน",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูลสเปกที่รันตรวจสอบได้จริง `ticket_spec.py` สำหรับ Phase 2 Mini-Project (`thai-ticket-priority`) เพื่อใช้เป็นฐานรากต่อยอดใน Day 56–60",
    requirements: [
      "สร้าง Pydantic model `TicketInput` ที่ตรวจฟิลด์: `ticket_id` (str ไม่ว่าง), `text` (str ยาว >= 2), `customer_tier` (`Literal['standard', 'silver', 'gold', 'vip']`), `channel` (`Literal['line', 'chat', 'email']`), `order_value_thb` (`float >= 0`), `wait_minutes` (`float >= 0`), `past_tickets_30d` (`int >= 0`)",
      "สร้าง Pydantic model `QualityGate` ที่มีค่าเริ่มต้น `min_pr_auc = 0.78`, `min_urgent_recall = 0.85`, `max_p95_latency_ms = 10.0` พร้อมเมธอด `evaluate(pr_auc: float, urgent_recall: float, p95_latency_ms: float) -> dict[str, object]` ที่คืน `{\"passed\": bool, \"failures\": list[str]}`",
      "สร้างฟังก์ชัน `audit_dataset_contract(train_df: pl.DataFrame, val_df: pl.DataFrame, test_df: pl.DataFrame) -> dict[str, object]` ที่ตรวจ: (1) คอลัมน์ฟีเจอร์บังคับ 6 คอลัมน์ + `is_urgent` + `created_at` ครบในทุก split, (2) ห้ามมีคอลัมน์ต้องห้าม (`first_response_min`, `resolved_at`, `agent_id`, `refund_approved`, `sla_breached`) ใน split ใดเลย, และ (3) ลำดับเวลา `train.max < val.min` และ `val.max < test.min` (หากผิดเงื่อนไขใดให้ `raise ValueError`)",
      "ฟังก์ชัน `audit_dataset_contract` ต้องคืนสรุป `{\"train_rows\", \"val_rows\", \"test_rows\", \"train_positive_rate\"}` เมื่อผ่านครบทุกเงื่อนไข",
    ],
    starter: {
      language: "python",
      filename: "ticket_spec.py",
      code: `from typing import Literal
import polars as pl
from pydantic import BaseModel, Field

REQUIRED_COLS = {
    "created_at",
    "text",
    "customer_tier",
    "channel",
    "order_value_thb",
    "wait_minutes",
    "past_tickets_30d",
    "is_urgent",
}
FORBIDDEN_LEAKAGE_COLS = {
    "first_response_min",
    "resolved_at",
    "agent_id",
    "refund_approved",
    "sla_breached",
}


class TicketInput(BaseModel):
    # TODO: ประกาศฟิลด์และข้อจำกัดตามสเปก
    ticket_id: str


class QualityGate(BaseModel):
    min_pr_auc: float = 0.78
    min_urgent_recall: float = 0.85
    max_p95_latency_ms: float = 10.0

    def evaluate(
        self,
        pr_auc: float,
        urgent_recall: float,
        p95_latency_ms: float,
    ) -> dict[str, object]:
        # TODO: ตรวจทั้ง 3 เงื่อนไขแล้วคืน {"passed": bool, "failures": list[str]}
        raise NotImplementedError


def audit_dataset_contract(
    train_df: pl.DataFrame,
    val_df: pl.DataFrame,
    test_df: pl.DataFrame,
) -> dict[str, object]:
    """ตรวจสอบ schema, forbidden leakage columns และลำดับเวลา train < val < test"""
    # TODO: ตรวจทั้ง 3 split แล้วคืน dict สรุป
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day55.py",
      code: `import polars as pl
import pytest
from pydantic import ValidationError
from ticket_spec import QualityGate, TicketInput, audit_dataset_contract


def _make_split(dates: list[str], extra_col: str | None = None) -> pl.DataFrame:
    data: dict[str, list] = {
        "created_at": dates,
        "text": ["โอนเงินพร้อมเพย์ไม่เข้า", "สอบถามโปรโมชันสินค้า"],
        "customer_tier": ["vip", "standard"],
        "channel": ["line", "email"],
        "order_value_thb": [4500.0, 290.0],
        "wait_minutes": [25.0, 3.0],
        "past_tickets_30d": [3, 0],
        "is_urgent": [1, 0],
    }
    if extra_col:
        data[extra_col] = [12.0, 45.0]
    return pl.DataFrame(data)


def test_ticket_input_validation():
    valid = TicketInput(
        ticket_id="T-001",
        text="ขอคืนเงินด่วนครับ",
        customer_tier="gold",
        channel="line",
        order_value_thb=1200.0,
        wait_minutes=15.0,
        past_tickets_30d=1,
    )
    assert valid.customer_tier == "gold"

    with pytest.raises(ValidationError):
        TicketInput(
            ticket_id="T-002",
            text="x",  # สั้นเกินไป (< 2)
            customer_tier="diamond",  # ไม่อยู่ใน Literal
            channel="line",
            order_value_thb=-50.0,
            wait_minutes=1.0,
            past_tickets_30d=0,
        )


def test_audit_passes_clean_temporal_splits():
    tr = _make_split(["2025-01-01", "2025-01-20"])
    va = _make_split(["2025-02-01", "2025-02-15"])
    te = _make_split(["2025-03-01", "2025-03-10"])
    summary = audit_dataset_contract(tr, va, te)
    assert summary["train_rows"] == 2
    assert summary["val_rows"] == 2
    assert summary["test_rows"] == 2
    assert summary["train_positive_rate"] == pytest.approx(0.5)


def test_audit_blocks_post_event_leakage_and_overlap():
    tr_bad = _make_split(["2025-01-01", "2025-01-20"], extra_col="first_response_min")
    va = _make_split(["2025-02-01", "2025-02-15"])
    te = _make_split(["2025-03-01", "2025-03-10"])
    with pytest.raises(ValueError, match="leakage"):
        audit_dataset_contract(tr_bad, va, te)

    tr_overlap = _make_split(["2025-01-01", "2025-02-05"])  # ทับช่วงกับ val
    with pytest.raises(ValueError, match="overlap|temporal|time"):
        audit_dataset_contract(tr_overlap, va, te)


def test_quality_gate_pass_and_fail():
    gate = QualityGate()
    ok = gate.evaluate(pr_auc=0.83, urgent_recall=0.88, p95_latency_ms=3.2)
    assert ok["passed"] is True
    assert ok["failures"] == []

    bad = gate.evaluate(pr_auc=0.72, urgent_recall=0.90, p95_latency_ms=18.5)
    assert bad["passed"] is False
    assert len(bad["failures"]) == 2
`,
    },
    selfCheck: [
      "`TicketInput` ปฏิเสธข้อความสั้นเกินไป, tier นอกเหนือจากที่กำหนด และตัวเลขติดลบด้วย `ValidationError`",
      "`audit_dataset_contract` จับคอลัมน์ต้องห้ามอย่าง `first_response_min` ได้และโยน `ValueError` ที่มีคำว่า `leakage`",
      "`audit_dataset_contract` จับช่วงเวลาที่ Train ทับซ้อนกับ Val ได้และโยน `ValueError`",
      "`QualityGate.evaluate` ตรวจครบทั้ง 3 เกณฑ์ (`min_pr_auc`, `min_urgent_recall`, `max_p95_latency_ms`)",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance:
      "ผ่านทั้ง 4 test functions ใน `test_day55.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `audit_dataset_contract` วนตรวจ `(name, df)` ทั้ง 3 split สำหรับ `REQUIRED_COLS - set(df.columns)` และ `FORBIDDEN_LEAKAGE_COLS & set(df.columns)` ก่อน แล้วค่อยตรวจว่า `train_df['created_at'].max() < val_df['created_at'].min()` และ `val_df['created_at'].max() < test_df['created_at'].min()`",
      },
      {
        body: "ในข้อความของ `ValueError` ให้ใส่คำว่า `leakage` เมื่อเจอคอลัมน์ต้องห้าม และคำว่า `temporal overlap` เมื่อช่วงเวลาทับกัน เพื่อให้เทสต์และคนอ่าน log เข้าใจสาเหตุทันที",
      },
      {
        body: "โครงของ `TicketInput` และ `QualityGate.evaluate` พร้อมแล้ว เหลือเติม `audit_dataset_contract`:",
        code: {
          language: "python",
          filename: "hint_day55.py",
          code: `class TicketInput(BaseModel):
    ticket_id: str = Field(min_length=1)
    text: str = Field(min_length=2, max_length=2000)
    customer_tier: Literal["standard", "silver", "gold", "vip"]
    channel: Literal["line", "chat", "email"]
    order_value_thb: float = Field(ge=0.0)
    wait_minutes: float = Field(ge=0.0)
    past_tickets_30d: int = Field(ge=0)


class QualityGate(BaseModel):
    min_pr_auc: float = 0.78
    min_urgent_recall: float = 0.85
    max_p95_latency_ms: float = 10.0

    def evaluate(self, pr_auc: float, urgent_recall: float, p95_latency_ms: float) -> dict[str, object]:
        failures: list[str] = []
        if pr_auc < self.min_pr_auc:
            failures.append(f"pr_auc {pr_auc:.3f} < {self.min_pr_auc}")
        if urgent_recall < self.min_urgent_recall:
            failures.append(f"urgent_recall {urgent_recall:.3f} < {self.min_urgent_recall}")
        if p95_latency_ms > self.max_p95_latency_ms:
            failures.append(f"p95_latency_ms {p95_latency_ms:.2f} > {self.max_p95_latency_ms}")
        return {"passed": not failures, "failures": failures}`,
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
      title: "เผลอใส่ฟีเจอร์ที่เกิดหลังเปิดทิกเก็ต (Post-Event Feature) เข้ามาเทรน",
      symptom: "โมเดลได้ PR-AUC สูงถึง 0.99 บนแล็บเพราะมีคอลัมน์อย่าง `first_response_min` หรือ `agent_id` แต่พอขึ้น Production จริงคอลัมน์นั้นยังเป็น `null` ตอนทิกเก็ตเพิ่งเข้ามา",
      fix: "กำหนดรายการ `FORBIDDEN_LEAKAGE_COLS` และรัน `audit_dataset_contract` อัตโนมัติก่อนเทรนทุกครั้ง เพื่อบังคับกฎ Point-in-Time Features",
    },
    {
      title: "ตั้งเกณฑ์ความสำเร็จด้วย Accuracy บนข้อมูลทิกเก็ตที่ไม่สมดุล",
      symptom: "ทิกเก็ตด่วนมีแค่ 15% โมเดลทาย 'ไม่ด่วน' ทั้งหมดก็ได้ Accuracy 85% แต่ปล่อยเคสด่วนหลุด 100%",
      fix: "ตั้ง Quality Gate ด้วย `PR-AUC`, `Recall@urgent` และต้นทุนธุรกิจ (`FP * cost_fp + FN * cost_fn`) แทน Accuracy",
    },
    {
      title: "โยนทุกอย่างไปใช้ LLM API โดยไม่พิจารณา Latency และต้นทุนต่อ 1,000 ทิกเก็ต",
      symptom: "ระบบจัดคิวทิกเก็ตช้าครั้งละ 1–2 วินาทีและเสียค่า token มหาศาลทุกเดือนสำหรับงานที่ `TF-IDF + LightGBM/LogReg` ทำได้ใน <5ms",
      fix: "ใช้ Classical ML คัดกรองความเร็วสูงเป็นด่านหน้า แล้วเก็บ LLM ไว้เฉพาะเคสที่ต้องการความเข้าใจซับซ้อนหรือการร่างคำตอบใน Phase 3–4",
    },
    {
      title: "แบ่ง Train/Val/Test แบบสุ่มบนข้อมูลที่มีลำดับเวลาและแคมเปญตามฤดูกาล",
      symptom: "ทิกเก็ตจากแคมเปญวันเดียวกันหลุดไปอยู่ทั้ง Train และ Test ทำให้คะแนนประเมินสูงเกินจริงเมื่อเทียบกับการใช้งานเดือนถัดไป",
      fix: "ใช้ **Time-based Split** (`train < val < test`) เมื่อมี `created_at` เพื่อจำลองการทำนายอนาคตจากอดีตให้ตรงความจริง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d055-q1",
        "ในโปรเจกต์ทำนายความด่วนของทิกเก็ต ณ วินาทีที่ลูกค้าส่งข้อความเข้ามา คอลัมน์ใดต่อไปนี้ถือเป็น **Post-Event Data Leakage** และห้ามนำมาใช้เป็นฟีเจอร์?",
        [
          ["`past_tickets_30d` (จำนวนทิกเก็ตที่ลูกค้าคนนี้เคยเปิดใน 30 วันที่ผ่านมา)", "ปลอดภัย — ข้อมูลนี้มีอยู่แล้วในฐานข้อมูลก่อนทิกเก็ตใหม่ถูกสร้าง"],
          ["`order_value_thb` (มูลค่าคำสั่งซื้อที่ลูกค้าแจ้งปัญหา)", "ปลอดภัย — ทราบค่าตั้งแต่ตอนเปิดทิกเก็ต"],
          ["`first_response_min` (จำนวนนาทีที่พนักงานตอบกลับครั้งแรก)", "ถูก — ค่านี้เกิดขึ้น *หลังจาก* ทิกเก็ตถูกจัดคิวและมีพนักงานมาตอบแล้ว จึงไม่มีอยู่จริงตอน inference"],
          ["`customer_tier` (ระดับสมาชิก standard/silver/gold/vip)", "ปลอดภัย — เป็นข้อมูลโปรไฟล์ลูกค้าที่มีอยู่ก่อนแล้ว"],
        ],
        "C",
        "กฎ Point-in-Time Feature: ใช้ได้เฉพาะข้อมูลที่มีอยู่จริง ณ วินาทีที่ต้องการทำนาย (`t = 0`) เท่านั้น ข้อมูลที่เกิดหลังการตัดสินใจคือ Target/Future Leakage",
        "กฎ Point-in-Time Feature ในการเลือกฟีเจอร์ ML คืออะไร?",
        "ทุกฟีเจอร์ที่ใช้เทรนต้องเป็นข้อมูลที่มีอยู่จริง ณ เวลาที่ทำนายใน Production เท่านั้น ห้ามใช้คอลัมน์ที่เกิดขึ้นภายหลัง (post-event columns) เช่น `first_response_min` หรือ `refund_approved`",
      ),
      mc(
        "d055-q2",
        "ทำไมโจทย์ Thai Ticket Priority ที่มีทิกเก็ตวันละหลายหมื่นใบและต้องการ P95 < 10ms จึงเหมาะกับ Hybrid Classical ML (`PyThaiNLP TF-IDF + Tabular`) มากกว่าการยิง LLM API ทุกใบ?",
        [
          ["เพราะ LLM อ่านภาษาไทยไม่ได้เลย", "ไม่จริง — LLM อ่านไทยได้ แต่ช้าและแพงกว่ามากสำหรับงาน routing ความถี่สูง"],
          ["เพราะ Classical ML รันบน CPU ได้ในหลักมิลลิวินาที ต้นทุนต่อ 1,000 ใบใกล้ศูนย์บาท ผสานฟีเจอร์ตารางได้ตรง ๆ และจูน threshold ตามต้นทุน SLA ได้แม่นยำ", "ถูก — ตรงกับ Decision Matrix ของ Day 41 ทุกข้อ"],
          ["เพราะ Classical ML ไม่ต้องทำความสะอาดข้อมูลก่อนเทรน", "ผิด — Classical ML ต้องการข้อมูลสะอาดและสคีมาที่ชัดเจนมาก"],
          ["เพราะ Classical ML ไม่สามารถเกิด Feature Drift ได้", "ผิด — โมเดลทุกชนิดเกิด Drift ได้และต้องมีการเฝ้าระวัง"],
        ],
        "B",
        "งานจำแนกความถี่สูงที่มีทั้งข้อความและฟีเจอร์ตารางพร้อม SLA <10ms เป็นงานถนัดของ Classical ML ซึ่งช่วยประหยัดทั้งต้นทุนและเวลาตอบสนองได้มหาศาล",
        "เหตุผลหลัก 3 ข้อที่เลือก Classical ML แทน LLM สำหรับ Ticket Priority Routing คืออะไร?",
        "1) P95 Latency ต่ำมาก (<10ms บน CPU), 2) ต้นทุนต่อ 1,000 คำขอใกล้ศูนย์บาทและไม่พึ่ง cloud API, 3) ผสาน Tabular Metadata + จูน Probability Threshold ตามต้นทุนธุรกิจได้ตรงจุด",
      ),
      mc(
        "d055-q3",
        "เหตุใด `ColumnTransformer` จึงเป็นชิ้นส่วนหลักใน Layer 3 ของ Thai Ticket Priority Pipeline?",
        [
          ["เพราะช่วยลดขนาดไฟล์ CSV บนดิสก์ลง 90%", "ไม่เกี่ยว — นั่นคือหน้าที่ของไฟล์ Parquet"],
          ["เพราะช่วยรวมการแปลงข้อมูลต่างชนิด (ข้อความไทยด้วย TF-IDF, ตัวเลขด้วย Scaler, หมวดหมู่ด้วย OneHotEncoder) ไว้ใน Pipeline เดียวโดยไม่เกิด Data Leakage", "ถูก — และทำให้เรียก `.fit(X_train)` กับ `.predict_proba(X_test)` ได้ในอ็อบเจกต์เดียว"],
          ["เพราะทำให้ไม่ต้องใช้ `PyThaiNLP` ตัดคำภาษาไทย", "ไม่จริง — เรายังต้องตัดคำภาษาไทยก่อนหรือใน `TfidfVectorizer` เสมอ"],
          ["เพราะใช้แปลงโค้ด Python เป็น JavaScript อัตโนมัติ", "ไม่เกี่ยวกันเลย"],
        ],
        "B",
        "`ColumnTransformer` ช่วยแยกทางแปลงข้อมูลแต่ละชนิดแล้วเชื่อมเมทริกซ์ฟีเจอร์เข้าด้วยกันอัตโนมัติภายใน `Pipeline` เดียว ทำให้กัน Data Leakage และส่งต่อเข้าโมเดลได้สะอาดมาก",
        "บทบาทของ `ColumnTransformer` ใน Hybrid ML Pipeline คืออะไร?",
        "ใช้แปลงคอลัมน์แต่ละชนิดด้วยตัวแปลงที่เหมาะสม (Text → Thai TF-IDF, Numeric → Imputer/Scaler, Categorical → OneHotEncoder) แล้วรวมเป็นเมทริกซ์ฟีเจอร์เดียวภายใน `Pipeline` เพื่อกัน Data Leakage",
      ),
      mc(
        "d055-q4",
        "หากโมเดล Candidate ตัวหนึ่งได้ `PR-AUC = 0.85` และ `Recall@urgent = 0.89` (ผ่านเกณฑ์ความแม่นยำทั้งคู่) แต่มี `P95 latency = 28 ms` เทียบกับเกณฑ์ `<= 10 ms` ควรทำอย่างไรตามหลัก Quality Gate?",
        [
          ["ปล่อยขึ้น Production ไปก่อนเพราะ PR-AUC สูงดีแล้ว", "ผิด — ผิดสัญญา SLA ของระบบ อาจทำให้คิวทิกเก็ตสะสมและ timeout"],
          ["ตีกลับ (Fail Gate) แล้วตรวจหาคอขวด เช่น export เป็น ONNX, ลดขนาด vocabulary หรือลดความลึกต้นไม้ ก่อนตรวจซ้ำ", "ถูก — คุณภาพโมเดลและ SLA Latency ต้องผ่านพร้อมกันทั้งหมด"],
          ["แก้เกณฑ์ `max_p95_latency_ms` เป็น `50 ms` โดยไม่คุยกับทีมระบบ", "ผิด — การแอบผ่อนเกณฑ์โดยพลการทำลายความน่าเชื่อถือของระบบ"],
          ["สุ่มข้ามการทำนายครึ่งหนึ่งของทิกเก็ตเพื่อให้ค่าเฉลี่ยเร็วขึ้น", "ผิด — จะทำให้ลูกค้าไม่ได้รับการจัดลำดับความสำคัญ"],
        ],
        "B",
        "Quality Gate บังคับให้ทั้ง Model Quality และ System SLA ผ่านพร้อมกัน หากติด Latency Gate เราปรับ optimize pipeline (เช่น pre-built Trie, ONNX, max_features) แทนการละเลย SLA",
        "Quality Gate ใน Phase 2 Mini-Project ตรวจ 3 มิติใดบ้างก่อนปล่อยโมเดล?",
        "1) `PR-AUC` (คุณภาพการจัดอันดับ), 2) `Recall@urgent` (จับเคสด่วนได้ตามเป้า SLA), และ 3) `P95 Latency <= 10 ms` (ความเร็วระดับ Production บน CPU)",
      ),
    ],
  },

  takeaways: [
    "Portfolio Milestone #2 (`thai-ticket-priority`) ผสาน **ข้อความไทย (`PyThaiNLP + TF-IDF`) + Tabular Metadata** เพื่อคัดแยกทิกเก็ตด่วนที่ **P95 < 10ms** บน CPU ด้วยต้นทุนใกล้ศูนย์",
    "แบ่งสถาปัตยกรรมเป็น 5 ชั้นชัดเจน: Polars Clean → Leakage-Free Temporal Split → Hybrid `ColumnTransformer` → Model & Val-only Threshold → Immutable Artifact + Drift Monitor",
    "เปลี่ยนกฎการออกแบบให้เป็น **Executable Spec** ด้วย {{pydantic}} (`TicketInput`, `QualityGate`) และฟังก์ชัน `audit_dataset_contract` ที่บล็อก Post-Event Leakage และ Temporal Overlap อัตโนมัติ",
    "พรุ่งนี้ (Day 56) เราจะลงมือเทรนและประเมิน End-to-End Hybrid Pipeline บนพิมพ์เขียวชุดนี้ทันที!",
  ],

  reviewCards: [
    rc(
      "d055-rc-1",
      "สถาปัตยกรรม 5 ชั้นของ Thai Ticket Priority ML Pipeline ประกอบด้วยอะไรบ้าง?",
      "1) Polars Clean/Schema, 2) Leakage-Free Temporal Split, 3) Hybrid ColumnTransformer (Thai TF-IDF + Numeric + Categorical), 4) Model (LogReg/LightGBM) + Val-only Threshold, 5) Versioned Artifact + ONNX (<10ms) + Drift Monitor",
    ),
    rc(
      "d055-rc-2",
      "ยกตัวอย่าง 3 คอลัมน์ที่ถือเป็น Post-Event Leakage ในโจทย์จัดลำดับความด่วนของทิกเก็ต",
      "`first_response_min` (เวลาที่พนักงานตอบกลับ), `agent_id` (พนักงานที่รับเคส) และ `refund_approved` / `sla_breached` — ล้วนเกิดขึ้นหลังเวลาเปิดทิกเก็ตจึงห้ามใช้เทรน",
    ),
    rc(
      "d055-rc-3",
      "ทำไมจึงควรใช้ Time-based Split (`train < val < test`) แทน Random Split สำหรับข้อมูลทิกเก็ตที่มีวันที่?",
      "เพราะป้องกันข้อมูลจากเหตุการณ์/แคมเปญเดียวกันรั่วข้ามระหว่าง Train และ Test และสะท้อนการใช้งานจริงที่โมเดลต้องทำนายทิกเก็ตในอนาคตจากข้อมูลอดีต",
    ),
  ],

  sources: [
    {
      label: "scikit-learn User Guide — ColumnTransformer with Mixed Types",
      href: "https://scikit-learn.org/stable/auto_examples/compose/plot_column_transformer_mixed_types.html",
    },
    {
      label: "Pydantic v2 Documentation — Models & Field Constraints",
      href: "https://docs.pydantic.dev/latest/concepts/models/",
    },
    {
      label: "Polars User Guide — Lazy API & Data Validation",
      href: "https://docs.pola.rs/user-guide/lazy/",
    },
    {
      label: "Google Rules of Machine Learning — Best Practices for ML Engineering",
      href: "https://developers.google.com/machine-learning/guides/rules-of-ml",
    },
  ],

  glossary: [
    "polars",
    "pythainlp",
    "tfidf",
    "sklearn-pipeline",
    "lightgbm",
    "data-leakage",
    "data-contract",
    "precision-recall",
  ],
});
