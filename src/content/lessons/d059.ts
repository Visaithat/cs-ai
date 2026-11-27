import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D059 — Phase 2 / Block B15
 * Write Reproducible Training & Inference Tests
 */
export const d059: Lesson = defineLesson({
  day: 59,
  titleTh: "เขียนชุดเทสต์ ML ที่ทำซ้ำได้: Seed Determinism, Behavioral Tests และ Quality Gate",
  tagline:
    "30 นาที · รันบนเครื่อง 100% CPU ไม่ต้องใช้ API key · สร้างชุด pytest ตรวจ Seed, Invariance/Directional, เคสข้อความไทยแปลก ๆ และ F1/Latency Gate",
  icon: "flask-conical",
  visual: {
    id: "phase2-ml-pipeline",
    title: "Reproducible ML Testing — ตรวจ Seed Determinism, Schema & Quality Gate",
    caption:
      "สร้างชุด pytest ตรวจทั้งความสม่ำเสมอของ seed, เคสข้อความไทยแปลก ๆ, latency budget และ minimum F1 gate",
    alt: "แผนภาพการเขียนเทสต์สำหรับระบบ Machine Learning ที่ทำซ้ำได้",
  },
  requiresApiKey: false,
  tools: ["pytest", "scikit-learn", "Pydantic v2", "NumPy", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ป้องกันข้อมูลประหลาดที่ขอบทางเข้า (Input Robustness)",
      body: "ข้อความจากลูกค้าจริงไม่ได้สะอาดเหมือนในชุดฝึกสอน — คุณจะเจอทั้งข้อความว่าง `\"\"`, ช่องว่างล้วน, `None`, อิโมจิล้วน `\"🔥🔥🔥\"` หรือข้อความคัดลอกยาว 10,000 ตัวอักษร",
      lessonNote:
        "วันนี้เราใช้ `pytest.mark.parametrize` ({{parametrize}}) ทดสอบเคสขอบเขตภาษาไทยทั้งหมดให้มั่นใจว่าฟังก์ชันทำนายไม่ crash และคืน {{schema}} ถูกต้องเสมอ",
    },
    {
      node: 2,
      heading: "รับประกันว่าเทรนซ้ำแล้วได้โมเดลเดิมเป๊ะ (Seed Determinism)",
      body: "ถ้าเทรนด้วยข้อมูลและโค้ดเดิมสองรอบแล้วได้ผลทำนายต่างกัน ทีมจะไม่สามารถดีบักหรือเปรียบเทียบการทดลองได้เลย",
      lessonNote:
        "เราเขียนเทสต์ยืนยันว่า `random_state` ถูกส่งครบทุกขั้นตอนใน {{sklearn-pipeline}} จนรันเทรน 2 รอบได้ความน่าจะเป็นเท่ากันเป๊ะ (`np.allclose`)",
    },
    {
      node: 3,
      heading: "ทดสอบพฤติกรรมโมเดล (Behavioral Testing: Invariance & Directional)",
      body: "โค้ด ML อาจรันผ่านทุก unit test แต่มีพฤติกรรมผิดเพี้ยน เช่น ใส่คำว่า `\"ด่วนมาก ระบบล่ม\"` แล้วความน่าจะเป็นของคลาสเร่งด่วนกลับลดลง!",
      lessonNote:
        "เราประยุกต์แนวคิด CheckList (Invariance + Directional Expectation Tests) ร่วมกับ Minimum F1 Gate เพื่อจับ regression เชิงคุณภาพอัตโนมัติ",
    },
    {
      node: 4,
      heading: "ผูก Schema Contract และ Latency Gate เข้ากับ Inference Service",
      body: "ปลายทางที่เรียกใช้โมเดล (CLI หรือ FastAPI) ต้องการทั้งเอาต์พุตที่ผ่าน {{pydantic}} และเวลาตอบสนองที่ต่ำกว่างบ `< 10ms`",
      lessonNote:
        "ชุด {{pytest}} ของวันนี้ทำหน้าที่เป็น Quality Gate ชุดเดียวจบก่อนส่งมอบ Phase 2 Milestone ในวันพรุ่งนี้ (Day 60)",
    },
  ],

  objectives: [
    "**เขียน ML Determinism Tests** ด้วย {{pytest}} และ {{fixture}} เพื่อยืนยันว่าการเทรนซ้ำด้วย `random_state` เดิมให้ค่าความน่าจะเป็นตรงกัน 100% ({{reproducibility}})",
    "**ออกแบบ Behavioral Tests สำหรับข้อความไทย** ทั้ง **Invariance Tests** (ช่องว่าง/case/คำลงท้ายไม่ควรพลิกคลาส) และ **Directional Tests** (เติมคำวิกฤตต้องไม่ทำให้ความน่าจะเป็นเร่งด่วนลดลง)",
    "**สร้าง Robustness, Schema และ Quality/Latency Gates** ด้วย `@pytest.mark.parametrize` เพื่อรับมือข้อความว่าง/อิโมจิ/ยาวจัด พร้อมบังคับเกณฑ์ Minimum F1 และ `< 10ms` P95 latency",
  ],

  prerequisites: [
    "ผ่าน Block B03 (พื้นฐาน {{pytest}}, {{fixture}} และ {{parametrize}})",
    "ผ่าน Day 57–58 (เข้าใจ Error Analysis, Text Normalization และ Inference Latency Benchmarking)",
    "คุ้นเคยกับ `scikit-learn` {{sklearn-pipeline}} และ {{pydantic}} `BaseModel`",
    "รันบนเครื่องได้ 100% บน CPU ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "เตรียมสภาพแวดล้อมด้วย `uv` สำหรับเขียนและรันชุดทดสอบ ML ครบทั้ง 4 ชั้น (Determinism, Behavioral, Robustness, Quality/Latency Gate)",
    commands: `uv init ai-day59 && cd ai-day59
uv add scikit-learn pydantic numpy
uv add --dev pytest ruff
uv run pytest --version`,
    steps: [
      ["init", "เข้าโฟลเดอร์โปรเจกต์ Phase 2 หรือสร้าง `ai-day59` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `scikit-learn`, `pydantic`, `numpy`, `pytest`, `ruff`"],
      ["verify", "รัน `uv run pytest --version` สำเร็จพร้อมสร้างชุดเทสต์ ML"],
    ],
    note: "ชุดเทสต์ ML ที่ดีต้องรันจบเร็ว (ไม่เกิน 2–5 วินาทีบน CPU) เพื่อให้คุณและ CI รันตรวจได้ทุกครั้งที่แก้โค้ดโดยไม่ขี้เกียจรอ",
  },

  concepts: [
    {
      id: "ml-testing-beyond-unit-tests",
      title: "1 · ทำไม Unit Test ปกติไม่พอสำหรับ ML: 4 ชั้นของ ML Test Suite",
      paragraphs: [
        "ในซอฟต์แวร์ทั่วไป บั๊กมักแสดงตัวเป็น Exception หรือค่าที่ผิดชัดเจน (เช่น `2 + 2 == 5`) แต่ในระบบ Machine Learning บั๊กที่อันตรายที่สุดคือ **Silent Failure** — โค้ดรันผ่าน 0 errors แต่โมเดลค่อย ๆ ทายแย่ลง, สลับคลาส, หรือไม่เสถียรเมื่อเจอข้อความจริง",
        "ดังนั้นทีม AI Engineering จึงแบ่งชุดทดสอบ ML ออกเป็น **4 ชั้นหลัก** ที่ทำงานร่วมกันใน {{pytest}}: (1) **Determinism & Artifact Tests** (seed เดิมต้องได้โมเดลเดิม), (2) **Schema & Input Robustness Tests** (ข้อความว่าง/None/อิโมจิ/ยาวจัดห้าม crash), (3) **Behavioral Tests** (ตรวจตรรกะความหมายแบบ Invariance และ Directional), และ (4) **Quality & Latency Gates** (F1 ขั้นต่ำ + P95 `< 10ms`)",
        "การแยกชุดข้อมูลจำลองขนาดเล็กแต่ชัดเจนไว้ใน `pytest` {{fixture}} (`scope=\"module\"`) ช่วยให้เทรนโมเดลเพียงครั้งเดียวต่อไฟล์เทสต์ รันครบทั้ง 4 ชั้นได้ในไม่ถึง 1 วินาที",
      ],
      analogy:
        "เหมือนตรวจรับรถยนต์จากโรงงาน: ไม่ใช่แค่เช็กว่าสตาร์ตติด (ไม่ crash) แต่ต้องเช็กว่าเหยียบคันเร่งแล้วรถเร่งไปข้างหน้าจริง (Directional), พวงมาลัยตรงทุกคัน (Determinism), ขับลุยน้ำขังแล้วไม่ดับ (Robustness) และเบรกหยุดในระยะที่กำหนด (Quality/Latency Gate)",
      bullets: [
        "**Layer 1 · Determinism**: เทรน 2 รอบด้วย `random_state=42` → `np.allclose(p1, p2)` ต้องเป็น `True`",
        "**Layer 2 · Robustness & Schema**: input แปลก ๆ ทุกแบบต้องผ่านและคืน `TicketPrediction` ที่ valid เสมอ",
        "**Layer 3 · Behavioral**: Invariance (สิ่งรบกวนไม่เปลี่ยนผล) + Directional (เติมสัญญาณด่วน ความน่าจะเป็นต้องไม่ลด)",
        "**Layer 4 · Quality & Latency Gate**: F1 บนชุดตรวจ ≥ เกณฑ์ขั้นต่ำ และ P95 latency < 10ms",
      ],
      whyTitle: "Why this matters — ป้องกัน Silent Regression ก่อนขึ้น Production",
      whyParagraphs: [
        "วันหนึ่งเพื่อนร่วมทีมอาจแก้ฟังก์ชันทำความสะอาดข้อความหรืออัปเกรดเวอร์ชัน `scikit-learn` แล้วเผลอทำให้ F1 ร่วงจาก 0.88 เหลือ 0.65 โดยไม่มี syntax error เลย หากไม่มี Quality Gate และ Behavioral Tests บั๊กนี้จะหลุดไปถึงลูกค้าทันที",
        "แนวคิด 4 ชั้นนี้ยังเป็นรากฐานตรงของ Eval-Driven Development และ CI Eval Gate สำหรับ LLM/RAG ใน Phase 5 (Day 125–132)",
      ],
    },
    {
      id: "behavioral-testing-invariance-directional",
      title: "2 · Behavioral Testing (CheckList): Invariance และ Directional Tests สำหรับภาษาไทย",
      paragraphs: [
        "งานวิจัยชื่อดัง *CheckList (ACL 2020)* เสนอวิธีทดสอบโมเดล NLP เหมือนวิศวกรซอฟต์แวร์ทดสอบ black-box API โดยไม่ต้องรอฉลากมนุษย์จำนวนมาก มี 2 รูปแบบที่ทรงพลังที่สุดสำหรับทิกเก็ตภาษาไทย:",
        "**Invariance Test (INV)** — การเปลี่ยนแปลงอินพุตที่ *ไม่เปลี่ยนความหมาย* ต้องไม่ทำให้ผลการทำนายเปลี่ยน เช่น เติมช่องว่างหัวท้าย `\"  โอนซ้ำ  \"`, เปลี่ยนตัวพิมพ์ของศัพท์อังกฤษ `\"PromptPay\"` ↔ `\"promptpay\"`, หรือเติมคำลงท้าย `\"ครับ\"`/`\"ค่ะ\"` คลาสที่ทำนายต้องเหมือนเดิมและความน่าจะเป็นต่างกันไม่เกินเกณฑ์ (เช่น `< 0.08`)",
        "**Directional Expectation Test (DIR)** — การเปลี่ยนแปลงอินพุตที่มีทิศทางชัดเจนต้องส่งผลในทิศทางที่คาดได้ เช่น นำทิกเก็ตปกติมาเติมข้อความวิกฤต `\"ด่วนมาก ระบบล่ม เงินหาย\"` ต่อท้าย → ค่า `urgent_prob` **ต้องไม่ลดลง** (`p_after >= p_before`) และควรเพิ่มขึ้นอย่างมีนัยสำคัญ",
      ],
      analogy:
        "Invariance เหมือนเปลี่ยนฟอนต์หรือสีกระดาษของใบแจ้งเหตุ ระดับความด่วนต้องเท่าเดิม ส่วน Directional เหมือนเพิ่มคำว่า 'ไฟไหม้!' ลงในใบแจ้งเหตุ ระดับความด่วนห้ามลดลงเด็ดขาด",
      code: {
        language: "python",
        filename: "behavioral_tests_demo.py",
        code: `def test_invariance_whitespace_and_case(trained_model):
    base = predict_ticket(trained_model, "โอนซ้ำผ่าน PromptPay เงินหาย")
    noisy = predict_ticket(trained_model, "   โอนซ้ำผ่าน promptpay   เงินหาย  ")
    assert base.label == noisy.label
    assert abs(base.urgent_prob - noisy.urgent_prob) < 0.05


def test_directional_urgent_signal_never_lowers_prob(trained_model):
    calm = predict_ticket(trained_model, "สอบถามรายการโอนล่าสุด")
    escalated = predict_ticket(trained_model, "สอบถามรายการโอนล่าสุด ด่วนมาก ระบบล่ม เงินหาย")
    assert escalated.urgent_prob >= calm.urgent_prob
    assert escalated.urgent_prob - calm.urgent_prob > 0.10`,
        caption: "Behavioral Tests จับตรรกะเพี้ยนของโมเดลได้ชัดเจนกว่าการดูแค่ค่า accuracy รวม",
      },
      whyTitle: "Why this matters — เชื่อม Error Analysis วัน Day 57 เข้าเป็น Regression Test ถาวร",
      whyParagraphs: [
        "ทุกครั้งที่คุณเจอเคสที่โมเดลทายผิดจาก Day 57 (เช่น คำลากเสียง `ด่วนนนน` หรือ `PROMPTPAY`) ให้เขียนเพิ่มเป็นเคสใน Behavioral Tests ทันที เพื่อรับประกันว่าบั๊กเดิมจะไม่มีวันกลับมาซ้ำในอนาคต",
        "เทคนิค INV/DIR นี้ยังนำไปใช้ทดสอบความทนทานของ LLM Prompt และ RAG Router ใน Phase 3–5 ได้โดยตรง",
      ],
    },
    {
      id: "determinism-and-ci-gates",
      title: "3 · Seed Determinism, Edge-Case Robustness และ Quality/Latency Gate",
      paragraphs: [
        "ความสามารถในการทำซ้ำ ({{reproducibility}}) ในงาน ML เริ่มจากการคุมแหล่งความสุ่มทั้งหมดด้วย `random_state` (เช่น `train_test_split(..., random_state=seed)`, `LogisticRegression(random_state=seed)`, `LGBMClassifier(random_state=seed, deterministic=True)`): การเขียนเทสต์เทรน 2 รอบแล้ว `assert np.allclose(p1, p2)` จะฟ้องทันทีถ้ามีใครเผลอลืมส่ง seed ในขั้นตอนใดขั้นตอนหนึ่ง",
        "สำหรับ **Edge-Case Robustness** ให้ใช้ `@pytest.mark.parametrize` ทดสอบข้อความแปลก ๆ ที่มักทำให้บริการจริงล่ม ได้แก่ `None`, `\"\"`, `\"   \"`, `\"🔥🔥🔥\"`, ตัวเลขล้วน `\"123456\"` และข้อความยาวจัด (เช่น 5,000 ตัวอักษร ซึ่งควร truncate อย่างปลอดภัยก่อนส่งเข้า tokenizer เพื่อกัน DoS และคุม latency)",
        "สุดท้ายคือ **Quality & Latency Gate**: กำหนดเกณฑ์ขั้นต่ำที่ยอมรับได้ไว้ในเทสต์ เช่น `f1 >= 0.80` บนชุด holdout คงที่ และ `p95_ms < 10.0` เพื่อให้ `uv run pytest` เป็นปราการด่านสุดท้ายก่อน merge โค้ด",
      ],
      analogy:
        "เหมือนด่านตรวจความปลอดภัยสนามบิน 3 เครื่องเรียงกัน: เครื่องแรกตรวจเอกสารตรงกัน (Determinism), เครื่องสองตรวจของแปลกปลอม (Edge-Case Robustness) และเครื่องสามตรวจน้ำหนักกระเป๋าไม่เกินเกณฑ์ (Quality & Latency Gate)",
      bullets: [
        "Truncate ข้อความยาวผิดปกติ (เช่น `text[:2000]`) ก่อนเข้า tokenizer เพื่อป้องกัน P95 latency พุ่งทะลุ 10ms",
        "ข้อความว่างหรือมีแต่สัญลักษณ์/อิโมจิไม่ควร crash — ให้คืนผล `TicketPrediction` ที่ valid ตาม {{schema}} เสมอ",
        "ใช้ `@pytest.fixture(scope=\"module\")` สำหรับโมเดลที่เทรนในไฟล์เทสต์ เพื่อความเร็วของชุดเทสต์ใน CI",
      ],
      whyTitle: "Why this matters — ชุดเทสต์ที่เร็ว นิ่ง และรันออฟไลน์ได้ 100%",
      whyParagraphs: [
        "หากชุดเทสต์ ML ใช้เวลา 10 นาทีหรือพึ่งพาไฟล์ขนาดใหญ่ที่ไม่ได้อยู่ใน repo นักพัฒนาจะหยุดรันเทสต์ก่อน commit",
        "การสร้างชุดเทสต์ด้วยข้อมูลตัวอย่างขนาดเล็กแต่ครบทุก failure mode ทำให้รัน `uv run pytest` จบในไม่กี่วินาทีและพร้อมใส่เข้า GitHub Actions CI ได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ 4 ชั้นของ ML Tests กับ Backend/API Testing",
      body: [
        "ถ้าคุณเคยเขียนชุดเทสต์ด้วย Vitest / Playwright / Jest ให้มอง ML Test Suite เป็นการเพิ่มชั้น 'Behavioral & Quality Contract' เข้าไปเหนือ Unit Test ปกติ:",
      ],
      table: [
        ["Seed Determinism Test", "Idempotent / Pure Function Test (input เดิม → output เดิมเป๊ะ)"],
        ["Edge-Case `@pytest.mark.parametrize`", "Table-driven boundary/fuzz tests (`null`, `\"\"`, emoji, huge string)"],
        ["Pydantic `TicketPrediction` validation", "Zod response schema validation"],
        ["Invariance & Directional Tests", "Property-based / metamorphic tests (ตรวจความสัมพันธ์ของผลลัพธ์)"],
        ["Min F1 & P95 < 10ms Gate", "CI Performance Budget & SLA assertion"],
      ],
    },
    student: {
      title: "First-Year Note — `random_state` คืออะไร ทำไมเลข 42 ถึงโผล่บ่อย?",
      body: [
        "คอมพิวเตอร์สุ่มตัวเลขแท้ ๆ ไม่ได้ แต่ใช้สูตรคณิตศาสตร์ที่เรียกว่า **Pseudo-Random Number Generator** ซึ่งเริ่มคำนวณจากเลขตั้งต้นที่เรียกว่า **Seed** (ใน scikit-learn ใช้ชื่อพารามิเตอร์ว่า `random_state`)",
        "ถ้าคุณและเพื่อนใส่ `random_state=42` เหมือนกัน การแบ่งข้อมูลและการสุ่มน้ำหนักเริ่มต้นจะออกมาเหมือนเดิมทุกประการ ทำให้ผลลัพธ์ทำซ้ำได้ 100% ส่วนเลข `42` เป็นแค่มุกคลาสสิกจากนิยายไซไฟ *The Hitchhiker's Guide to the Galaxy* คุณจะใช้เลขจำนวนเต็มใดก็ได้ (เช่น `0`, `7`, `2025`) ขอแค่คงที่และบันทึกไว้ชัด",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรากำลังเตรียมส่งมอบ `ticket_ml_service.py` สำหรับ Phase 2 Milestone มาลองสร้าง inference wrapper ที่ปลอดภัยต่อทุก input แปลก ๆ พร้อมเขียนและรันชุดเทสต์ ML ครบทั้ง 4 ด้าน",
    steps: [
      {
        title: "1 · สร้าง `TicketPrediction` Schema และฟังก์ชันเทรนที่ Deterministic 100%",
        explain:
          "กำหนด Pydantic contract ให้ผลลัพธ์ทุกครั้ง และรับประกันว่า `train_ticket_model` ส่ง `random_state` ให้ `LogisticRegression` พร้อม normalization ลดคำลากเสียงและ case ภาษาอังกฤษ",
        code: {
          language: "python",
          filename: "worked_d059.py",
          code: `import re
import time
from typing import Literal
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

ELONGATED_RE = re.compile(r"([ก-๛a-zA-Z])\\1{2,}")
MAX_TEXT_LEN = 2000


class TicketPrediction(BaseModel):
    label: Literal["normal", "urgent"]
    urgent_prob: float = Field(ge=0.0, le=1.0)
    latency_ms: float = Field(ge=0.0)


def clean_ticket_text(text: str | None) -> str:
    if not text:
        return ""
    clipped = text.strip()[:MAX_TEXT_LEN]
    compact = ELONGATED_RE.sub(r"\\1", clipped)
    return re.sub(r"\\s+", " ", compact).lower()


def train_ticket_model(
    texts: list[str],
    labels: list[int],
    random_state: int = 42,
) -> Pipeline:
    cleaned = [clean_ticket_text(t) for t in texts]
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))),
        ("clf", LogisticRegression(C=3.0, max_iter=500, random_state=random_state)),
    ])
    pipe.fit(cleaned, labels)
    return pipe


def predict_ticket(
    model: Pipeline,
    text: str | None,
    threshold: float = 0.5,
) -> TicketPrediction:
    t0 = time.perf_counter()
    norm = clean_ticket_text(text)
    if not norm:
        elapsed = (time.perf_counter() - t0) * 1000.0
        return TicketPrediction(label="normal", urgent_prob=0.0, latency_ms=round(elapsed, 3))
    prob = float(model.predict_proba([norm])[0, 1])
    elapsed = (time.perf_counter() - t0) * 1000.0
    label: Literal["normal", "urgent"] = "urgent" if prob >= threshold else "normal"
    return TicketPrediction(label=label, urgent_prob=round(prob, 6), latency_ms=round(elapsed, 3))`,
        },
        output: `# นิยาม TicketPrediction, train_ticket_model และ predict_ticket เรียบร้อย`,
      },
      {
        title: "2 · รันตรวจ Determinism + Behavioral Tests (Invariance & Directional)",
        explain:
          "เทรน 2 รอบด้วย `random_state=42` เพื่อยืนยันค่าความน่าจะเป็นเท่ากันทุกทศนิยม จากนั้นตรวจทั้ง Invariance (ช่องว่าง/case) และ Directional (เติมข้อความวิกฤต)",
        code: {
          language: "python",
          filename: "worked_d059.py",
          code: `import numpy as np

train_x = [
    "ด่วนมาก ระบบล่ม โอนซ้ำ เงินหาย",
    "พบสลิปปลอม ตัดบัตรซ้ำ ด่วน",
    "บัญชีโดนล็อก เข้าไม่ได้ ด่วนมาก",
    "โอนเงินผ่าน PromptPay ไม่เข้า ด่วน",
    "สอบถามเวลาเปิดปิดร้านครับ",
    "ขอเปลี่ยนที่อยู่จัดส่งพัสดุค่ะ",
    "สินค้าสีดำมีสต็อกไหมครับ",
    "ขอใบเสร็จย้อนหลังเดือนที่แล้ว",
]
train_y = [1, 1, 1, 1, 0, 0, 0, 0]

m1 = train_ticket_model(train_x, train_y, random_state=42)
m2 = train_ticket_model(train_x, train_y, random_state=42)
probes = ["โอนซ้ำ PromptPay ด่วน", "สอบถามเวลาเปิดร้านครับ"]

p1 = [predict_ticket(m1, t).urgent_prob for t in probes]
p2 = [predict_ticket(m2, t).urgent_prob for t in probes]
assert np.allclose(p1, p2)

# Invariance: ช่องว่าง + ตัวพิมพ์อังกฤษ
inv_a = predict_ticket(m1, "โอนซ้ำผ่าน PromptPay ด่วน")
inv_b = predict_ticket(m1, "   โอนซ้ำผ่าน promptpay   ด่วนนนน  ")
assert inv_a.label == inv_b.label and abs(inv_a.urgent_prob - inv_b.urgent_prob) < 1e-6

# Directional: เพิ่มสัญญาณเร่งด่วน
calm = predict_ticket(m1, "สอบถามรายการโอนครับ")
urgent = predict_ticket(m1, "สอบถามรายการโอนครับ ด่วนมาก ระบบล่ม เงินหาย")
assert urgent.urgent_prob > calm.urgent_prob
print(f"Determinism=PASS | Invariance=PASS | Directional: {calm.urgent_prob:.3f} -> {urgent.urgent_prob:.3f}")`,
        },
        output: `Determinism=PASS | Invariance=PASS | Directional: 0.432 -> 0.781`,
      },
      {
        title: "3 · รันตรวจ Edge-Case Robustness และ Latency Gate",
        explain:
          "ป้อนข้อความที่มักทำระบบพัง (`None`, `\"\"`, ช่องว่าง, อิโมจิ, ข้อความยาว 5,000 ตัวอักษร) เพื่อยืนยันว่าผ่าน Schema contract และเร็วกว่า 10ms ทุกเคส",
        code: {
          language: "python",
          filename: "worked_d059.py",
          code: `edge_cases = [None, "", "   ", "🔥🔥🔥", "1234567890", "ก" * 5000]
for case in edge_cases:
    res = predict_ticket(m1, case)
    assert 0.0 <= res.urgent_prob <= 1.0
    assert res.latency_ms < 10.0
    preview = repr(case) if case is None or len(case) < 15 else f"'ก'*5000"
    print(f"{preview:14s} -> label={res.label:6s} | prob={res.urgent_prob:.3f} | {res.latency_ms:.3f}ms")`,
        },
        output: `None           -> label=normal | prob=0.000 | 0.005ms
''             -> label=normal | prob=0.000 | 0.003ms
'   '          -> label=normal | prob=0.000 | 0.004ms
'🔥🔥🔥'         -> label=normal | prob=0.491 | 0.285ms
'1234567890'   -> label=normal | prob=0.491 | 0.301ms
'ก'*5000       -> label=normal | prob=0.491 | 0.912ms`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมากเวลาเขียน Directional Test: ถ้าเลือกประโยคตั้งต้นที่โมเดลมั่นใจเกือบ `1.000` อยู่แล้ว การเติมคำวิกฤตเพิ่มอาจทำให้ค่าความน่าจะเป็นขยับแทบไม่ได้ (saturation) ควรทดสอบ Directional บนประโยคตั้งต้นที่เป็นกลางหรือหมวดปกติ แล้วตรวจทั้ง `p_after >= p_before` และส่วนต่างขั้นต่ำที่สมเหตุสมผล",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `ticket_ml_service.py` พร้อมชุดเทสต์ ML ครบทั้ง 4 ชั้น (Determinism, Behavioral Invariance/Directional, Edge-Case Robustness และ Quality/Latency Gate)",
    requirements: [
      "ประกาศ `TicketPrediction(BaseModel)` มี `label: Literal['normal', 'urgent']`, `urgent_prob: float` (`0.0 <= p <= 1.0`) และ `latency_ms: float` (`>= 0.0`)",
      "`clean_ticket_text(text: str | None, max_len: int = 2000) -> str`: รองรับ `None` (คืน `\"\"`), ตัดช่องว่างหัวท้าย, ตัดความยาวไม่เกิน `max_len`, ยุบอักษรไทย/อังกฤษที่ซ้ำ ≥ 3 ตัวเหลือ 1 ตัว, ยุบช่องว่างซ้ำ และแปลงตัวอังกฤษเป็นพิมพ์เล็ก",
      "`train_ticket_model(texts: list[str], labels: list[int], random_state: int = 42) -> Pipeline`: ทำความสะอาดข้อความด้วย `clean_ticket_text` แล้วเทรน `Pipeline` (`TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 4))` + `LogisticRegression(C=3.0, max_iter=500, random_state=random_state)`)",
      "`predict_ticket(model: Pipeline, text: str | None, threshold: float = 0.5) -> TicketPrediction`: จับเวลาด้วย `time.perf_counter()`, ถ้าข้อความหลัง clean ว่างให้คืน `TicketPrediction(label='normal', urgent_prob=0.0, latency_ms=...)`, มิฉะนั้นทำนายด้วย `model.predict_proba([norm])[0, 1]` และคืน `TicketPrediction`",
      "ต้องผ่านชุดเทสต์ทั้ง 4 กลุ่มใน `test_ticket_ml_service.py`: Determinism, Invariance + Directional, Parametrized Edge Cases และ Minimum F1 + P95 `< 10ms` Latency Gate",
    ],
    starter: {
      language: "python",
      filename: "ticket_ml_service.py",
      code: `import re
import time
from typing import Literal
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

ELONGATED_RE = re.compile(r"([ก-๛a-zA-Z])\\1{2,}")


class TicketPrediction(BaseModel):
    label: Literal["normal", "urgent"]
    urgent_prob: float = Field(ge=0.0, le=1.0)
    latency_ms: float = Field(ge=0.0)


def clean_ticket_text(text: str | None, max_len: int = 2000) -> str:
    """ทำความสะอาดข้อความทิกเก็ตไทยอย่างปลอดภัยและจำกัดความยาว"""
    # TODO: handle None/empty, strip, clip to max_len, collapse elongation >= 3, lowercase
    raise NotImplementedError


def train_ticket_model(
    texts: list[str],
    labels: list[int],
    random_state: int = 42,
) -> Pipeline:
    """เทรน Pipeline แบบ deterministic ด้วย random_state ที่กำหนด"""
    # TODO: clean texts -> fit Pipeline(TfidfVectorizer + LogisticRegression)
    raise NotImplementedError


def predict_ticket(
    model: Pipeline,
    text: str | None,
    threshold: float = 0.5,
) -> TicketPrediction:
    """ทำนายความเร่งด่วนพร้อมจับเวลาและคืน TicketPrediction ที่ผ่าน Pydantic schema"""
    # TODO: measure with perf_counter, handle empty text, return TicketPrediction
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_ml_service.py",
      code: `import numpy as np
import pytest
from sklearn.metrics import f1_score
from ticket_ml_service import (
    TicketPrediction,
    clean_ticket_text,
    predict_ticket,
    train_ticket_model,
)

TRAIN_TEXTS = [
    "ด่วนมาก ระบบล่ม โอนซ้ำ เงินหาย",
    "พบสลิปปลอม ตัดบัตรซ้ำ ตรวจสอบด่วน",
    "บัญชีโดนล็อก เข้าใช้งานไม่ได้ ด่วน",
    "โอนเงินผ่าน PromptPay ไม่เข้า เงินหาย",
    "ชำระเงินซ้ำสองรอบ ระบบล่ม ด่วนมาก",
    "สอบถามเวลาเปิดปิดร้านครับ",
    "ขอเปลี่ยนที่อยู่จัดส่งพัสดุหน่อยค่ะ",
    "สินค้าสีดำมีสต็อกไหมครับ",
    "ขอใบเสร็จย้อนหลังเดือนที่แล้วค่ะ",
    "สอบถามโปรโมชันสมาชิกใหม่ครับ",
]
TRAIN_LABELS = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]


@pytest.fixture(scope="module")
def trained_model():
    return train_ticket_model(TRAIN_TEXTS, TRAIN_LABELS, random_state=42)


def test_seed_determinism():
    m1 = train_ticket_model(TRAIN_TEXTS, TRAIN_LABELS, random_state=42)
    m2 = train_ticket_model(TRAIN_TEXTS, TRAIN_LABELS, random_state=42)
    samples = ["โอนซ้ำ PromptPay ด่วน", "สอบถามเวลาเปิดร้านครับ", "สลิปปลอม"]
    p1 = [predict_ticket(m1, s).urgent_prob for s in samples]
    p2 = [predict_ticket(m2, s).urgent_prob for s in samples]
    assert np.allclose(p1, p2)


def test_behavioral_invariance_and_directional(trained_model):
    # Invariance: ช่องว่าง + คำลากเสียง + ตัวพิมพ์ใหญ่-เล็ก
    r1 = predict_ticket(trained_model, "โอนซ้ำผ่าน PromptPay ด่วน")
    r2 = predict_ticket(trained_model, "   โอนซ้ำผ่าน promptpay   ด่วนนนน   ")
    assert r1.label == r2.label
    assert abs(r1.urgent_prob - r2.urgent_prob) < 1e-6

    # Directional: เติมสัญญาณเร่งด่วนต้องไม่ทำให้ urgent_prob ลดลง
    calm = predict_ticket(trained_model, "สอบถามข้อมูลพัสดุครับ")
    urgent = predict_ticket(trained_model, "สอบถามข้อมูลพัสดุครับ ด่วนมาก ระบบล่ม เงินหาย")
    assert urgent.urgent_prob >= calm.urgent_prob
    assert urgent.urgent_prob - calm.urgent_prob > 0.10


@pytest.mark.parametrize(
    "bad_input",
    [None, "", "   ", "🔥🔥🔥", "1234567890", "ก" * 5000],
)
def test_edge_case_robustness_and_schema(trained_model, bad_input):
    res = predict_ticket(trained_model, bad_input)
    assert isinstance(res, TicketPrediction)
    assert res.label in ("normal", "urgent")
    assert 0.0 <= res.urgent_prob <= 1.0
    assert res.latency_ms < 10.0
    if bad_input in (None, "", "   "):
        assert res.label == "normal"
        assert res.urgent_prob == 0.0


def test_quality_f1_and_p95_latency_gate(trained_model):
    eval_cases = [
        ("โอนซ้ำ เงินไม่เข้า ด่วนนนน", 1),
        ("ระบบล่ม ตัดบัตรซ้ำ", 1),
        ("พบสลิปปลอม รีบตรวจด่วน", 1),
        ("สอบถามเวลาเปิดสาขาครับ", 0),
        ("ขอเปลี่ยนที่อยู่จัดส่งค่ะ", 0),
        ("สินค้ามีสีขาวไหมครับ", 0),
    ]
    preds = []
    latencies = []
    # Warmup
    for _ in range(10):
        predict_ticket(trained_model, eval_cases[0][0])

    for _ in range(15):
        for text, _ in eval_cases:
            out = predict_ticket(trained_model, text)
            latencies.append(out.latency_ms)

    y_true = [y for _, y in eval_cases]
    preds = [1 if predict_ticket(trained_model, t).label == "urgent" else 0 for t, _ in eval_cases]
    f1 = f1_score(y_true, preds)
    p95_ms = float(np.percentile(latencies, 95))

    assert f1 >= 0.80, f"F1 gate failed: {f1:.3f}"
    assert p95_ms < 10.0, f"Latency gate failed: P95={p95_ms:.3f}ms"
    assert len(clean_ticket_text("ก" * 5000, max_len=100)) <= 100
`,
    },
    selfCheck: [
      "เทรน 2 รอบด้วย `random_state=42` ได้ค่า `urgent_prob` ตรงกันเป๊ะทุกทศนิยม",
      "Invariance Test ผ่าน (ช่องว่าง/case/คำลากเสียงไม่เปลี่ยน label) และ Directional Test ผ่าน (`urgent_prob` เพิ่มขึ้นอย่างชัดเจน)",
      "Parametrized Edge Cases ทั้ง 6 เคส (`None`, `\"\"`, ช่องว่าง, อิโมจิ, ตัวเลข, ข้อความยาว 5,000 ตัว) ไม่ crash และผ่าน Pydantic schema",
      "Quality Gate (`f1 >= 0.80`) และ Latency Gate (`p95_ms < 10.0`) ผ่านทั้งหมดบน CPU",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance:
      "ผ่านชุดเทสต์ทั้ง 4 กลุ่มใน `test_ticket_ml_service.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `clean_ticket_text` ระวังลำดับ: ตรวจ `if not text: return ''` ก่อน, จากนั้น `text.strip()[:max_len]` เพื่อกันข้อความยาวมากก่อนรัน regex ยุบตัวอักษรซ้ำ",
      },
      {
        body: "ใน `predict_ticket` จับ `t0 = time.perf_counter()` ตั้งแต่บรรทัดแรกเพื่อให้เวลาของ `clean_ticket_text` นับรวมอยู่ใน `latency_ms` ด้วย (end-to-end latency)",
      },
      {
        body: "โครงของ `clean_ticket_text` และ `train_ticket_model` พร้อมแล้ว เหลือเติม `predict_ticket`:",
        code: {
          language: "python",
          filename: "hint_day59.py",
          code: `def clean_ticket_text(text: str | None, max_len: int = 2000) -> str:
    if not text:
        return ""
    clipped = text.strip()[:max_len]
    compact = ELONGATED_RE.sub(r"\\1", clipped)
    return re.sub(r"\\s+", " ", compact).lower()


def train_ticket_model(
    texts: list[str],
    labels: list[int],
    random_state: int = 42,
) -> Pipeline:
    cleaned = [clean_ticket_text(t) for t in texts]
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))),
        ("clf", LogisticRegression(C=3.0, max_iter=500, random_state=random_state)),
    ])
    pipe.fit(cleaned, labels)
    return pipe`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "ลืมส่ง `random_state` ในบางขั้นตอนของ training pipeline",
      symptom: "รันเทสต์ `test_seed_determinism` ผ่านบ้างพังบ้าง เพราะ `train_test_split` หรือตัว classifier สุ่มค่าใหม่ทุกรอบ",
      fix: "รับพารามิเตอร์ `random_state: int = 42` เพียงจุดเดียวแล้วส่งต่อไปยังทุกคอมโพเนนต์ที่มีความสุ่มภายใน pipeline",
    },
    {
      title: "เขียนเทสต์ให้ผูกกับไฟล์ชุดข้อมูลใหญ่หลายร้อย MB ที่ไม่ได้ commit ใน repo",
      symptom: "เพื่อนร่วมทีมหรือ CI รัน `pytest` ไม่ผ่านเพราะ `FileNotFoundError` หรือรันนานเกิน 5 นาที",
      fix: "ใช้ชุดข้อมูลตัวอย่างขนาดเล็กแต่ครอบคลุมใน `@pytest.fixture` สำหรับ CI unit/behavioral tests และแยก full-dataset evaluation เป็นงานอีกขั้น",
    },
    {
      title: "ไม่จำกัดความยาวอินพุต (no truncation) ใน inference wrapper",
      symptom: "ลูกค้าเผลอก๊อป log ยาว 50,000 ตัวอักษรมาวางในแชต ทำให้ regex/tokenizer ช้าจนทะลุ latency SLA หรือกิน RAM สูง",
      fix: "ตัดความยาวข้อความ (เช่น `text[:2000]`) ตั้งแต่ต้นทางใน `clean_ticket_text` และเขียนเทสต์ยืนยันด้วยเคส `'ก' * 5000`",
    },
    {
      title: "ตั้งเกณฑ์ Quality Gate สูงเกินจริงบนชุดเทสต์เล็ก (เช่น `f1 == 1.0`) หรือไม่ได้ล็อกชุดตรวจ",
      symptom: "เทสต์เปราะบางมาก (flaky) แค่ปรับพารามิเตอร์นิดเดียวก็พังทั้งที่โมเดลดีขึ้นในภาพรวม",
      fix: "ตั้งเกณฑ์ขั้นต่ำที่สมเหตุสมผล (floor gate เช่น `f1 >= 0.80`) และแยก behavioral regression cases ออกจาก full benchmark",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d059-q1",
        "ข้อใดคือตัวอย่างของ **Directional Expectation Test (DIR)** สำหรับโมเดลจัดลำดับความเร่งด่วนของทิกเก็ตภาษาไทย?",
        [
          ["เปลี่ยนช่องว่างหัวท้ายของข้อความแล้วตรวจว่าคลาสที่ทำนายยังคงเดิม", "นี่คือ Invariance Test (INV) ไม่ใช่ Directional"],
          ["เติมวลีวิกฤต `\"ด่วนมาก ระบบล่ม เงินหาย\"` ต่อท้ายทิกเก็ตปกติ แล้วตรวจว่า `urgent_prob` ต้องไม่ลดลง", "ถูก — Directional Test ตรวจว่าการเปลี่ยนอินพุตในทิศทางชัดเจนส่งผลต่อความน่าจะเป็นในทิศทางที่คาดไว้"],
          ["เทรนโมเดล 2 รอบด้วย `random_state=42` แล้วตรวจว่าความน่าจะเป็นเท่ากัน", "นี่คือ Seed Determinism Test"],
          ["ส่ง `None` เข้าฟังก์ชันทำนายแล้วตรวจว่าไม่เกิด `AttributeError`", "นี่คือ Edge-Case Robustness Test"],
        ],
        "B",
        "Directional Expectation Test ทดสอบว่าเมื่อเพิ่มสัญญาณที่มีทิศทางชัดเจน (เช่น ความเร่งด่วน) คะแนนความน่าจะเป็นของคลาสนั้นต้องขยับไปในทิศทางที่ถูกต้องหรือไม่ลดลง",
        "Invariance Test (INV) กับ Directional Expectation Test (DIR) ต่างกันอย่างไร?",
        "INV เปลี่ยนสิ่งที่ไม่ควรกระทบความหมาย (ช่องว่าง/case) → ผลต้องไม่เปลี่ยน; DIR เพิ่มสัญญาณที่มีทิศทางชัด (คำวิกฤต) → ความน่าจะเป็นต้องขยับไปทิศทางนั้นหรือไม่ลดลง",
      ),
      mc(
        "d059-q2",
        "ทำไมจึงควรใช้ `@pytest.fixture(scope=\"module\")` สำหรับโมเดลที่เทรนในชุดเทสต์ ML และใช้ `@pytest.mark.parametrize` สำหรับ edge cases?",
        [
          ["เพราะ `scope=\"module\"` ทำให้โมเดลมีความแม่นยำสูงกว่า `scope=\"function\"`", "ไม่เกี่ยว — ความแม่นยำเท่ากัน แต่ต่างกันที่เวลาในการรันเทสต์"],
          ["`scope=\"module\"` เทรนโมเดลเพียงครั้งเดียวต่อไฟล์เทสต์ทำให้ CI เร็ว และ `parametrize` ช่วยรันหลายเคสขอบเขต (`None`, `\"\"`, อิโมจิ, ข้อความยาว) แยกผลผ่าน/ตกทีละเคสชัดเจน", "ถูก — ช่วยให้ชุดเทสต์ทั้งเร็วและรายงานจุดพังได้แม่นยำ"],
          ["เพราะ `pytest` ห้ามเรียก `model.fit` มากกว่า 1 ครั้งในไฟล์เดียว", "ไม่จริง — เรียกได้ แต่จะเสียเวลาซ้ำซ้อนโดยไม่จำเป็น"],
          ["เพราะ `parametrize` ช่วยแก้คำพิมพ์ผิดในข้อความไทยให้อัตโนมัติ", "ไม่จริง — `parametrize` ใช้รันฟังก์ชันเทสต์ซ้ำกับหลายชุดอินพุต"],
        ],
        "B",
        "การแชร์โมเดลที่ read-only ด้วย `scope=\"module\"` ช่วยลดเวลาเทสต์ และ `@pytest.mark.parametrize` ทำให้เห็นทันทีว่า edge case ตัวไหนที่ทำให้ระบบพัง",
        "ประโยชน์ของ `@pytest.fixture(scope=\"module\")` และ `@pytest.mark.parametrize` ใน ML Test Suite คืออะไร?",
        "`scope=\"module\"` ลดการเทรนซ้ำทำให้ชุดเทสต์เร็ว ส่วน `parametrize` ทดสอบ edge cases หลายรูปแบบและรายงานผลแยกทีละเคสชัดเจน",
      ),
      mc(
        "d059-q3",
        "หากต้องการยืนยันว่า pipeline เทรนโมเดลมีความสามารถในการทำซ้ำ ({{reproducibility}}) ต้องตรวจสอบสิ่งใดในเทสต์?",
        [
          ["เช็กว่าฟังก์ชันเทรนรันจบโดยไม่โยน exception", "ไม่พอ — โค้ดอาจไม่ crash แต่สุ่มน้ำหนักต่างกันทุกครั้ง"],
          ["เทรนโมเดล 2 ครั้งแยกกันด้วยข้อมูลและ `random_state` เดิม แล้วตรวจว่าค่า `predict_proba` บนชุดตัวอย่างตรงกันด้วย `np.allclose`", "ถูก — ยืนยันว่าไม่มีแหล่งความสุ่มหลุดรอดใน training pipeline"],
          ["เช็กว่าเวลาเทรนสองครั้งเท่ากันเป๊ะถึงระดับไมโครวินาที", "ผิด — เวลา CPU แกว่งตามโหลดของเครื่องเป็นเรื่องปกติ"],
          ["เปลี่ยน `random_state` เป็นค่าใหม่สองค่าแล้วบังคับให้ได้ผลเท่ากัน", "ไม่จำเป็น — ต่าง seed อาจต่างกันเล็กน้อย แต่ seed เดิมต้องตรงกันเป๊ะ"],
        ],
        "B",
        "Seed Determinism Test ยืนยันว่าเมื่อข้อมูล โค้ด และ `random_state` เหมือนเดิม ผลลัพธ์จากโมเดลจะออกมาเหมือนกัน 100%",
        "วิธีเขียน Seed Determinism Test ใน pytest ทำอย่างไร?",
        "เทรนโมเดล 2 อินสแตนซ์แยกกันด้วยข้อมูลและ `random_state` เดิม แล้ว `assert np.allclose(probs_1, probs_2)` บนชุดข้อความทดสอบ",
      ),
      mc(
        "d059-q4",
        "เหตุใดฟังก์ชัน inference สำหรับข้อความภาษาไทยจึงควรตัดความยาวข้อความ (truncation) และจัดการข้อความว่าง (`None` / `\"\"`) ก่อนส่งเข้าโมเดล?",
        [
          ["เพื่อเพิ่มจำนวนคลาสที่โมเดลทำนายได้", "ไม่เกี่ยวกัน"],
          ["เพื่อป้องกันความผิดพลาด (`AttributeError` / `ValueError`), คุม P95 latency ไม่ให้ทะลุ SLA จากข้อความยาวผิดปกติ และคงเอาต์พุตให้ตรงตาม Pydantic schema เสมอ", "ถูก — นี่คือ Defensive Inference Engineering ที่จำเป็นในระบบจริง"],
          ["เพราะ `TfidfVectorizer` รองรับข้อความยาวไม่เกิน 50 ตัวอักษร", "ไม่จริง — มันรับได้ยาวกว่านั้น แต่ข้อความยาวจัดจะทำให้เวลาประมวลผลพุ่งขึ้น"],
          ["เพื่อให้ข้ามการตรวจสอบความถูกต้องของ Pydantic ได้", "ตรงกันข้าม — เราทำเพื่อรับประกันว่าผลลัพธ์ผ่าน Pydantic schema เสมอ"],
        ],
        "B",
        "การป้องกันที่ขอบทางเข้า (handling None/empty + max length truncation) ช่วยให้ inference service ไม่ล่มและรักษา P95 `< 10ms` ได้แม้เจออินพุตสุดโต่ง",
        "ทำไม inference wrapper จึงต้องทำ input truncation และจัดการข้อความว่าง/None?",
        "เพื่อป้องกัน crash (`AttributeError`), ป้องกัน latency spike จากข้อความยาวผิดปกติ และรับประกันว่าผลลัพธ์ตรงตาม Pydantic schema ทุกครั้ง",
      ),
    ],
  },

  takeaways: [
    "ระบบ ML ต้องการชุดเทสต์ **4 ชั้น** มากกว่าแค่ unit test ทั่วไป: **Seed Determinism**, **Robustness & Schema**, **Behavioral (Invariance + Directional)** และ **Quality/Latency Gate**",
    "เปลี่ยนบทเรียนจาก Error Analysis (Day 57) ให้กลายเป็น **Behavioral Tests** ถาวร เพื่อให้บั๊กที่แก้ไปแล้วไม่หวนกลับมาอีก",
    "ใช้ `@pytest.mark.parametrize` ทดสอบ edge cases ภาษาไทย (`None`, `\"\"`, อิโมจิ, ข้อความยาว 5,000 ตัวอักษร) พร้อมทำ input truncation เพื่อรักษา P95 `< 10ms`",
    "ชุดเทสต์ที่รันเร็ว ออฟไลน์ 100% และตรวจทั้ง F1 กับ Latency คือ Quality Gate ที่พร้อมส่งมอบ Phase 2 Portfolio Milestone ในวันพรุ่งนี้",
  ],

  reviewCards: [
    rc(
      "d059-rc-1",
      "4 ชั้นของชุดเทสต์ ML (Reproducible ML Test Suite) มีอะไรบ้าง?",
      "1) Seed Determinism (seed เดิมได้ผลเดิม), 2) Input Robustness & Schema (None/ว่าง/อิโมจิ/ยาวจัดไม่ crash), 3) Behavioral Tests (Invariance + Directional), 4) Quality & Latency Gate (min F1 + P95 < 10ms)",
    ),
    rc(
      "d059-rc-2",
      "จงยกตัวอย่าง Invariance Test และ Directional Test อย่างละ 1 เคสสำหรับทิกเก็ตภาษาไทย",
      "Invariance: เติมช่องว่างหรือเปลี่ยน `PromptPay` เป็น `promptpay` → label ต้องไม่เปลี่ยน; Directional: เติม `\"ด่วนมาก ระบบล่ม เงินหาย\"` ต่อท้ายทิกเก็ตปกติ → `urgent_prob` ต้องไม่ลดลง",
    ),
    rc(
      "d059-rc-3",
      "ทำไมจึงควรทำ input truncation (เช่น `max_len=2000`) ใน inference wrapper?",
      "เพื่อป้องกันข้อความยาวผิดปกติ (เช่น ลูกค้าวาง log ยาวเป็นหมื่นตัวอักษร) ไม่ให้ดึงเวลา regex/tokenizer พุ่งทะลุ latency SLA หรือกิน RAM เกินจำเป็น",
    ),
  ],

  sources: [
    {
      label: "ACL 2020 — Beyond Accuracy: Behavioral Testing of NLP Models with CheckList",
      href: "https://aclanthology.org/2020.acl-main.442/",
    },
    {
      label: "Made With ML — Testing ML Systems (Data, Model & Behavioral Tests)",
      href: "https://madewithml.com/courses/mlops/testing/",
    },
    {
      label: "pytest Documentation — Parametrize & Fixtures Scope",
      href: "https://docs.pytest.org/en/stable/how-to/parametrize.html",
    },
    {
      label: "scikit-learn User Guide — Controlling Randomness & Reproducibility",
      href: "https://scikit-learn.org/stable/common_pitfalls.html#controlling-randomness",
    },
  ],

  glossary: [
    "pytest",
    "parametrize",
    "fixture",
    "reproducibility",
    "sklearn-pipeline",
    "pydantic",
    "schema",
    "tfidf",
  ],
});
