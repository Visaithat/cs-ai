import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D041 — Phase 2 / Block B11
 * When to Use Classical ML vs LLM (Cost/Latency Decision Matrix)
 */
export const d041: Lesson = defineLesson({
  day: 41,
  titleTh: "เลือกใช้ Classical ML หรือ LLM: ตารางตัดสินใจด้านต้นทุน Latency และโครงสร้างข้อมูล",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% (CPU / ไม่ต้องใช้ API key) · ฝึกวิจารณญาณเลือก Classical ML, LLM และ Hybrid Routing ด้วยตัวเลขจริง",
  icon: "scale",
  visual: {
    id: "ml-vs-llm-matrix",
    title: "Decision Matrix: เมื่อไรควรใช้ Classical ML และเมื่อไรควรใช้ LLM",
    caption: "คลิกเลือกโจทย์งานจริงเพื่อเทียบ Latency, ต้นทุนต่อ 100k คำขอ และความเหมาะสมของ Classical ML vs LLM",
    alt: "ตารางตัดสินใจเลือก Classical ML เทียบกับ LLM",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "เลือกสถาปัตยกรรมให้ถูกตั้งแต่วันแรกก่อนเขียนโค้ด",
      body: "ความผิดพลาดที่แพงที่สุดของทีม AI มือใหม่คือโยนทุกปัญหาให้ {{llm}} ทำ แม้เป็นงานจัดหมวดหมู่ตารางหรือให้คะแนนความเสี่ยงที่ต้องการความเร็วต่ำกว่า 10ms และมีปริมาณหลายแสนคำขอต่อวัน",
      lessonNote: "วันนี้เราสร้าง Decision Matrix เพื่อแยกโจทย์ที่ควรใช้ Classical ML (`scikit-learn` / {{lightgbm}}), โจทย์ที่เหมาะกับ {{llm}} และโจทย์ที่ควรใช้ Hybrid Routing",
    },
    {
      node: 2,
      heading: "จับคู่ประเภทโมเดลกับลักษณะข้อมูลและข้อจำกัดหน้างาน",
      body: "ข้อมูลแบบตาราง (Tabular: ยอดซื้อ, จำนวนครั้งที่คืนสินค้า, เวลารอตอบ) เป็นถิ่นของ Classical ML ที่เร็ว ถูก และอธิบายผลได้ ส่วนข้อความอิสระ การสรุปเอกสาร และการให้เหตุผลซับซ้อนเป็นจุดแข็งของ {{llm}}",
      lessonNote: "ใน Block B11–B14 เราจะสร้างโมเดล Classical ML จริงบน CPU ก่อน แล้วจึงผสานเข้ากับ LLM ใน Phase 3–4",
    },
    {
      node: 3,
      heading: "ประเมินทั้งความแม่นยำ Latency และต้นทุนต่อ 100k คำขอ",
      body: "โมเดลที่แม่นกว่า 1% แต่ช้ากว่า 200 เท่าและแพงกว่า 500 เท่าอาจไม่ใช่คำตอบที่ดีที่สุดใน Production — วิศวกร AI ต้องคำนวณเศรษฐศาสตร์และ {{expected-value}} ประกอบการตัดสินใจเสมอ",
      lessonNote: "ตัวอย่างและแบบฝึกหัดวันนี้จำลองต้นทุนและ P95 latency ที่ปริมาณ 100,000 คำขอ/วัน เพื่อเทียบ All-LLM, All-ML และ Hybrid 80/20",
    },
    {
      node: 5,
      heading: "คุมงบประมาณและลดความเสี่ยงข้อมูลรั่วไหลในระยะยาว",
      body: "เมื่อทราฟฟิกเติบโต ระบบที่รัน Classical ML บน CPU ภายในองค์กรไม่เพียงประหยัดค่า token มหาศาล แต่ยังลดการส่งข้อมูลอ่อนไหวตาม {{pdpa}} ออกนอกเครือข่ายด้วย",
      lessonNote: "การใช้ Hybrid Routing ช่วยให้ระบบควบคุมได้ทั้งค่าใช้จ่าย Latency และขอบเขตข้อมูลที่ส่งออกสู่ภายนอก",
    },
  ],

  objectives: [
    "**จำแนกและให้เหตุผลได้** ว่าโจทย์งาน AI ใดควรใช้ Classical ML (`scikit-learn` / {{lightgbm}}), โจทย์ใดควรใช้ {{llm}}, และโจทย์ใดควรใช้ **Hybrid Routing**",
    "**คำนวณเปรียบเทียบ** ต้นทุนรายเดือนและ Latency (P50/P95) ที่ปริมาณ 100,000 คำขอต่อวัน โดยคำนึงถึงอัตราการขยาย token ของภาษาไทย (1.5x–3x)",
    "**ออกแบบและเขียนโค้ด** ตัวจำลอง Decision Matrix และ Hybrid Confidence Router (ให้ ML จัดการเคสที่มั่นใจ 80% และส่งเคสกำกวม 20% ให้ LLM) พร้อมทดสอบด้วย {{pytest}}",
  ],

  prerequisites: [
    "เข้าใจแนวคิด {{expected-value}} และความน่าจะเป็นจาก Day 39",
    "ผ่านพื้นฐาน Python, `dataclass` / Type Hints, {{uv}} และ {{pytest}} จาก Phase 1",
    "ยังไม่จำเป็นต้องเคยเทรนโมเดล `scikit-learn` มาก่อน (เริ่มลงมือเทรนใน Day 42–43)",
    "รันบนเครื่องได้ 100% (CPU) ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่สำหรับ Block B11 ด้วย {{uv}} พร้อมติดตั้ง `scikit-learn` ไว้เตรียมพร้อมสำหรับทั้ง 4 วันของรอบนี้ และติดตั้ง `pytest` กับ `ruff`",
    commands: `uv init ai-day41 && cd ai-day41
uv add scikit-learn
uv add --dev pytest ruff
uv run python -c "import sklearn; print('scikit-learn:', sklearn.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day41` ด้วย `uv init` สำเร็จ"],
      ["deps", "ติดตั้ง `scikit-learn` และ dev tools (`pytest`, `ruff`) ผ่าน `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็นเลข `scikit-learn` 1.x"],
    ],
    note: "Block B11 ทั้ง 4 วันรันบน CPU ของโน้ตบุ๊กทั่วไปได้ 100% ไม่มีค่า API และไม่ต้องใช้ GPU",
  },

  concepts: [
    {
      id: "decision-matrix-ml-vs-llm",
      title: "1 · Decision Matrix: เมื่อไร Classical ML ชนะขาด และเมื่อไรต้องใช้ LLM",
      paragraphs: [
        "ทักษะแรกที่แยก AI Engineer ตัวจริงออกจากคนที่แค่เรียก API เป็น คือ **Engineering Judgment** — การไม่ใช้ค้อน (LLM) ตอกทุกอย่างที่ขวางหน้า ตามแนวทางของหลักสูตร งานที่มี **ข้อมูลแบบตารางชัดเจน (Structured Tabular)**, ต้องการความเร็วระดับ `<10ms`, มีข้อมูลป้ายกำกับ (labeled data) มากพอ และรันปริมาณสูง เช่น ทำนายลูกค้าเลิกใช้บริการ (Churn), ตรวจจับทุจริต (Fraud), จัดลำดับความเร่งด่วนทิกเก็ต หรือคาดการณ์ยอดขาย — **Classical ML (`scikit-learn` / {{lightgbm}}) ชนะ {{llm}} ทั้งความแม่นยำ Latency และต้นทุน**",
        "ในทางกลับกัน **{{llm}}** โดดเด่นเมื่อโจทย์เป็น **ข้อความอิสระที่หลากหลาย (Unstructured)**, ต้องการความเข้าใจภาษามนุษย์แบบกว้าง ๆ, การสรุป/ร่างคำตอบ, การสกัดข้อมูล ({{structured-output}}) จากเอกสารรูปแบบไม่ตายตัว หรือช่วง **Cold Start** ที่ยังไม่มีข้อมูลป้ายกำกับสำหรับเทรนโมเดล ML เลย",
        "กฎจำง่าย: ถ้าคุณตอบได้ว่าฟีเจอร์คือคอลัมน์ตัวเลข/หมวดหมู่ที่คงที่ และคำตอบคือคลาสจำกัดหรือตัวเลขเดียว ให้เริ่มคิดถึง Classical ML ก่อนเสมอ แต่ถ้าคำตอบต้องอาศัยการอ่านบริบทเปิดกว้างหรือสร้างภาษาใหม่ ให้เลือก LLM",
      ],
      analogy:
        "เหมือนโรงพยาบาล: การวัดไข้และคัดกรองความดันของคนไข้ 10,000 คนต่อวันใช้เครื่องวัดอัตโนมัติที่เร็ว 2 วินาทีและแม่นยำคงที่ (Classical ML) ส่วนการซักประวัติซับซ้อนและอธิบายแผนรักษาให้คนไข้เข้าใจใช้แพทย์เฉพาะทาง (LLM)",
      bullets: [
        "**เลือก Classical ML (`scikit-learn` / {{lightgbm}})** — ข้อมูลตาราง/ตัวเลข, SLA `< 20ms`, ปริมาณสูง (`> 10k req/day`), ต้องการผล deterministic ไม่มี {{hallucination}}, หรือต้องรันในองค์กรตาม {{pdpa}}",
        "**เลือก {{llm}}** — ข้อความอิสระ/เอกสารหลากหลายรูปแบบ, งานสรุป/เขียนคำตอบ/ให้เหตุผลหลายขั้น, ยังไม่มี labeled dataset (zero-shot / few-shot bootstrap)",
        "**เลือก SQL / Rule-Based ธรรมดา** — เมื่อกฎธุรกิจตายตัว 100% (เช่น ยอดซื้อ > 50,000 = VIP) ไม่ต้องใช้ทั้ง ML และ LLM!",
      ],
      code: {
        language: "python",
        filename: "decision_criteria.py",
        code: `from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class WorkloadSpec:
    name: str
    input_type: Literal["tabular", "short_text", "open_text"]
    requires_generation: bool
    labeled_rows: int
    daily_requests: int
    latency_budget_ms: int


def quick_decide(spec: WorkloadSpec) -> Literal["classical_ml", "llm", "hybrid"]:
    if spec.requires_generation:
        return "llm"
    if spec.input_type == "tabular" and spec.labeled_rows >= 500:
        return "classical_ml"
    if spec.daily_requests >= 50_000 and spec.latency_budget_ms <= 50 and spec.labeled_rows >= 1_000:
        return "hybrid" if spec.input_type == "open_text" else "classical_ml"
    return "llm"


fraud = WorkloadSpec("Payment Fraud", "tabular", False, 50_000, 200_000, 15)
summary = WorkloadSpec("Contract Summary", "open_text", True, 0, 2_000, 5_000)
print(fraud.name, "->", quick_decide(fraud))
print(summary.name, "->", quick_decide(summary))`,
        caption: "การแปลงเกณฑ์ตัดสินใจเป็นโครงสร้างข้อมูลชัดเจนช่วยลดการถกเถียงด้วยความรู้สึกในทีม",
      },
      whyTitle: "Why this matters — หลีกเลี่ยงสถาปัตยกรรมที่ 'แพง ช้า และไม่เสถียร'",
      whyParagraphs: [
        "หลายทีมสร้าง POC จัดหมวดหมู่ทิกเก็ตด้วย LLM แล้วดูว้าวตอนทดสอบ 20 ข้อความ แต่พอขึ้น Production ที่มีทิกเก็ต 100,000 ใบต่อวัน ค่า API พุ่งหลักแสนบาทต่อเดือนแถมติด rate limit และตอบช้าจนหน้าจอค้าง",
        "การรู้ขอบเขตของ Classical ML ใน Phase 2 จะทำให้คุณพร้อมเปรียบเทียบ ML Baseline กับ LLM Extractor ด้วยตัวเลขจริงใน Day 92 (Phase 3 Checkpoint)",
      ],
    },
    {
      id: "cost-latency-economics",
      title: "2 · เศรษฐศาสตร์ของ Latency และต้นทุนที่ 100,000 คำขอต่อวัน",
      paragraphs: [
        "ลองเทียบตัวเลขจริงแบบไม่เดา: โมเดล `scikit-learn` หรือ {{lightgbm}} ที่รันบน CPU เครื่องเดียวใช้เวลาทำนายต่อ 1 คำขอประมาณ **1–5 ms** (รองรับได้หลายร้อยถึงหลายพันคำขอต่อวินาทีบนคอนเทนเนอร์ราคาไม่กี่ร้อยบาทต่อเดือน) ในขณะที่การยิง Hosted {{llm}} API ขนาดเล็ก-กลางมักมี P95 latency อยู่ที่ **400–2,000 ms** และคิดเงินตามจำนวน input + output tokens ทุกครั้ง",
        "สำหรับระบบภาษาไทยมีตัวคูณซ่อนอยู่ที่ต้องระวังเป็นพิเศษ: **Token Inflation** — ข้อความภาษาไทยความยาวเท่ากันมักถูกแบ่งเป็น token มากกว่าภาษาอังกฤษราว **1.5x–3x** ในหลาย tokenizer ทำให้ต้นทุนต่อคำขอของงานภาษาไทยสูงกว่าที่ประเมินจากตัวอย่างภาษาอังกฤษอย่างชัดเจน",
        "นอกจากค่าเงินและเวลาแล้ว ยังมีต้นทุนด้านความน่าเชื่อถือ: Classical ML คืนความน่าจะเป็นแบบ deterministic ทุกครั้ง ไม่มีปัญหา {{hallucination}} หรือ JSON ผิดรูป และข้อมูลลูกค้าไม่ต้องวิ่งออกนอกเซิร์ฟเวอร์ จึงบริหารความสอดคล้องกับ {{pdpa}} ได้ง่ายกว่ามาก",
      ],
      analogy:
        "เหมือนการส่งเอกสารในตึกเดียวกัน: เดินส่งผ่านท่อลมภายในตึก (Classical ML บน CPU) ใช้เวลา 2 วินาทีและแทบไม่มีค่าใช้จ่ายเพิ่มต่อชิ้น ส่วนเรียกแมสเซนเจอร์วิ่งข้ามเมืองทุกครั้ง (LLM API) ทั้งช้ากว่าและจ่ายค่าส่งทุกซอง",
      bullets: [
        "**Classical ML (CPU)**: Latency ~1–10 ms · ต้นทุนแปรผันต่อ 100k คำขอ ≈ `$0.02–$0.20` (ค่าเช่า CPU คงที่)",
        "**Small Hosted LLM**: Latency ~400–1,200 ms · ต้นทุนต่อ 100k คำขอ (ไทย ~500 tokens/req) ≈ `$10–$35` ต่อวัน (`$300–$1,050/เดือน`)",
        "**Frontier Hosted LLM**: Latency ~1,000–3,000 ms · ต้นทุนต่อ 100k คำขอ ≈ `$150–$600+` ต่อวัน (`$4,500–$18,000/เดือน`)",
      ],
      whyTitle: "Why this matters — ตัวเลขทำให้การเสนอแผนต่อหัวหน้าทีมหรือผู้บริหารจบใน 1 หน้า",
      whyParagraphs: [
        "เมื่อคุณเขียน Architecture Decision Record (ADR) พร้อมตารางเทียบ Cost/100k requests และ P95 Latency คุณจะตอบคำถามได้ว่าทำไมระบบนี้ถึงควรลงทุนเก็บข้อมูลและเทรน Classical ML แทนการยิง LLM ล้วน",
        "และในกรณีที่ปริมาณคำขอน้อย (เช่น 500 คำขอต่อวัน) ตัวเลขชุดเดียวกันก็จะช่วยยืนยันอย่างตรงไปตรงมาว่าใช้ LLM API ไปก่อนคุ้มค่ากว่าเสียเวลา 2 สัปดาห์เก็บข้อมูลเทรน ML",
      ],
    },
    {
      id: "hybrid-routing-pattern",
      title: "3 · Hybrid Routing Pattern: ให้ ML คัดกรอง 80% แล้วส่ง 20% ที่กำกวมให้ LLM",
      paragraphs: [
        "ในระบบ Production จริง คำตอบมักไม่ใช่ 'เลือกอย่างใดอย่างหนึ่งแบบสุดโต่ง' แต่คือ **Hybrid Routing (Cascade Architecture)**: ส่งคำขอทั้งหมดผ่านโมเดล Classical ML ความเร็ว `<5ms` ก่อน เพื่อขอความน่าจะเป็น `confidence = max(predict_proba)`",
        "หากโมเดล ML มั่นใจสูงกว่าเกณฑ์ (เช่น `confidence >= 0.85` ซึ่งมักครอบคลุม **75%–85%** ของทิกเก็ตมาตรฐาน) ให้ตอบกลับทันทีด้วยต้นทุนเกือบศูนย์และ latency ระดับมิลลิวินาที ส่วนอีก **15%–25%** ที่เป็นเคสกำกวม ภาษาสแลงใหม่ หรือลูกค้าอธิบายซับซ้อน ค่อยส่งต่อไปให้ {{llm}} ช่วยวิเคราะห์ (และใช้ {{caching}} เสริมสำหรับคำถามซ้ำ)",
        "ผลลัพธ์ที่ได้คือจุดสมดุลที่ยอดเยี่ยม: **ลดค่า LLM API ลงได้ ~80%**, ลดค่าเฉลี่ย latency ลงหลายเท่า, ในขณะที่ยังคงความแม่นยำสูงในเคสยาก — แถมคำตอบที่ LLM ช่วยติดป้ายให้ใน 20% นั้นยังถูกเก็บไว้เป็นข้อมูลเทรนรอบถัดไปเพื่อทำให้โมเดล ML ฉลาดขึ้นเรื่อย ๆ (Data Flywheel)",
      ],
      analogy:
        "เหมือนสายด่วนธนาคารที่มีระบบคัดกรองอัตโนมัติ: เรื่องมาตรฐานอย่างเช็กยอดหรืออายัดบัตร 80% จบใน 3 วินาที ส่วนเรื่องร้องเรียนซับซ้อน 20% จึงโอนสายให้เจ้าหน้าที่อาวุโสดูแล",
      code: {
        language: "python",
        filename: "hybrid_router.py",
        code: `def route_ticket(ml_label: str, ml_confidence: float, threshold: float = 0.85) -> dict:
    if ml_confidence >= threshold:
        return {
            "route": "classical_ml",
            "label": ml_label,
            "confidence": ml_confidence,
            "est_latency_ms": 4,
        }
    return {
        "route": "llm_fallback",
        "label": None,  # ส่งต่อไปให้ LLM วิเคราะห์ต่อ
        "confidence": ml_confidence,
        "est_latency_ms": 850,
    }


print(route_ticket("billing", 0.94))
print(route_ticket("unknown", 0.58))`,
        caption: "Routing ด้วยค่า confidence threshold ช่วยให้ 80% ของคำขอจบเร็วในระดับมิลลิวินาที",
      },
      whyTitle: "Why this matters — เชื่อมโยง Expected Value (D39) สู่ระบบจริง",
      whyParagraphs: [
        "การเลือกจุดตัด `threshold` (เช่น `0.80` vs `0.90`) ไม่ใช่การเดาสุ่ม แต่เป็นการคำนวณ **{{expected-value}}** ระหว่างต้นทุนการทายผิดของ ML เทียบกับค่า API + latency ของ LLM — ซึ่งเป็นทักษะที่คุณเพิ่งฝึกมาใน Day 39",
        "รูปแบบนี้ยังถูกนำไปต่อยอดโดยตรงใน Phase 3 (Day 79: Model Routing) และ Phase 6 Capstone ที่เราจะออกแบบ Router แยกเคสถูกกับเคสแพงอย่างเป็นระบบ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ ML vs LLM กับสถาปัตยกรรม Backend ที่คุณคุ้นเคย",
      body: [
        "การเลือกระหว่าง Rule-Based, Classical ML และ LLM เหมือนการเลือกชั้นประมวลผลในระบบเว็บระหว่าง In-Memory Cache / SQL Query กับการยิง External Microservice ภายนอก:",
      ],
      table: [
        ["Rule-Based (if/else / SQL)", "Validation ง่าย ๆ หรือ SQL index query (<1 ms, ฟรี)"],
        ["Classical ML (scikit-learn / LightGBM)", "Fast local microservice บน CPU (<10 ms, ต้นทุนคงที่ต่ำ)"],
        ["Hosted LLM API", "External heavy API call (500–2,000 ms, จ่ายต่อ request/token)"],
        ["Hybrid ML → LLM Router", "Edge/Cache hit 80% + Origin fallback 20% เมื่อ cache miss"],
      ],
    },
    student: {
      title: "First-Year Note — เข้าใจคำว่า Latency (P50 / P95) และ Throughput",
      body: [
        "**Latency** คือระยะเวลารอตั้งแต่ส่งคำขอจนได้คำตอบ (หน่วยเป็นมิลลิวินาที `ms`, 1,000 ms = 1 วินาที) เวลาประเมินระบบจริงเราไม่ดูแค่ค่าเฉลี่ย แต่ดู **P95 Latency** ซึ่งแปลว่า '95% ของผู้ใช้ทั้งหมดรอไม่เกินเวลานี้'",
        "**Throughput** คือจำนวนคำขอที่ระบบรับไหวต่อวินาที (เช่น 500 req/s) โมเดล Classical ML ที่รันบน CPU ตัวเล็ก ๆ มักทำได้หลายร้อย req/s ในขณะที่ LLM API มักติดเพดาน Rate Limit และใช้เวลานานกว่ามาก",
        "ดังนั้นการรู้ว่าเมื่อไร 'ไม่ควรใช้ LLM' จึงเป็นสัญลักษณ์ของวิศวกรที่คิดเป็นระบบ ไม่ใช่การตกยุค",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: แพลตฟอร์ม e-commerce ไทยมีทิกเก็ตลูกค้าเข้ามา **100,000 ใบต่อวัน** เพื่อจัดหมวดหมู่ (`billing`, `delivery`, `technical`, `refund`) และประเมินความเร่งด่วน เราจะเขียนสคริปต์คำนวณต้นทุนรายเดือนและ Latency เฉลี่ยเพื่อเทียบ 3 ทางเลือก: All-LLM, All-ML และ Hybrid 80/20",
    steps: [
      {
        title: "1 · กำหนดสมมติฐานต้นทุนและ Latency (รวมตัวคูณ Token ภาษาไทย)",
        explain:
          "คำนวณต้นทุนต่อ 1 คำขอจากจำนวน input/output tokens (เผื่อ Thai token inflation 2x เรียบร้อยแล้ว) และตั้งค่า latency ของแต่ละชั้นโมเดล",
        code: {
          language: "python",
          filename: "worked_economics.py",
          code: `from dataclasses import dataclass


@dataclass(frozen=True)
class CostConfig:
    daily_requests: int = 100_000
    days_per_month: int = 30
    # ภาษาไทย ~350 input tokens + 60 output tokens ต่อทิกเก็ต
    llm_cost_per_1k_requests_usd: float = 0.35
    ml_monthly_cpu_infra_usd: float = 40.0
    ml_latency_ms: float = 4.0
    llm_latency_ms: float = 750.0


cfg = CostConfig()
monthly_requests = cfg.daily_requests * cfg.days_per_month
print(f"Monthly volume: {monthly_requests:,} requests")`,
        },
        output: `Monthly volume: 3,000,000 requests`,
      },
      {
        title: "2 · เทียบต้นทุนรายเดือนและ Latency ระหว่าง All-LLM, All-ML และ Hybrid 80/20",
        explain:
          "ในโหมด Hybrid 80/20 ทุกคำขอผ่าน ML ก่อน (`4 ms`) และมีเพียง 20% ที่ต้องส่งต่อไปหา LLM (`+750 ms`) — ลองดูตัวเลขที่ออกมาเทียบกันชัด ๆ",
        code: {
          language: "python",
          filename: "worked_economics.py",
          code: `def simulate_strategy(cfg: CostConfig, llm_fraction: float, uses_ml: bool) -> dict:
    monthly_reqs = cfg.daily_requests * cfg.days_per_month
    llm_reqs = monthly_reqs * llm_fraction
    llm_cost = (llm_reqs / 1_000) * cfg.llm_cost_per_1k_requests_usd
    ml_cost = cfg.ml_monthly_cpu_infra_usd if uses_ml else 0.0
    avg_latency_ms = (cfg.ml_latency_ms if uses_ml else 0.0) + (llm_fraction * cfg.llm_latency_ms)
    return {
        "monthly_usd": round(ml_cost + llm_cost, 2),
        "avg_latency_ms": round(avg_latency_ms, 1),
    }


strategies = {
    "All-LLM (100% LLM)": simulate_strategy(cfg, llm_fraction=1.0, uses_ml=False),
    "Hybrid (80% ML / 20% LLM)": simulate_strategy(cfg, llm_fraction=0.20, uses_ml=True),
    "All-ML (100% ML)": simulate_strategy(cfg, llm_fraction=0.0, uses_ml=True),
}

for name, metrics in strategies.items():
    print(f"{name:28s} -> \${metrics['monthly_usd']:7.2f}/mo | avg latency: {metrics['avg_latency_ms']:5.1f} ms")`,
        },
        output: `All-LLM (100% LLM)           -> $1050.00/mo | avg latency: 750.0 ms
Hybrid (80% ML / 20% LLM)    -> $ 250.00/mo | avg latency: 154.0 ms
All-ML (100% ML)             -> $  40.00/mo | avg latency:   4.0 ms`,
      },
      {
        title: "3 · ตรวจสอบผลกระทบของความแม่นยำด้วย Expected Error Cost",
        explain:
          "อย่าดูแค่ค่า infra — สมมติถ้าจัดหมวดหมู่ผิด 1 ครั้งเสียเวลาเจ้าหน้าที่แก้ `$0.02` (2 เซ็นต์) ลองเทียบ **ต้นทุนรวม (Infra + Error Cost)** เมื่อ All-ML ผิดพลาด 1.5%, All-LLM ผิดพลาด 0.5% และ Hybrid ผิดพลาด 0.4%",
        code: {
          language: "python",
          filename: "worked_economics.py",
          code: `def total_monthly_cost(infra_usd: float, error_rate: float, monthly_reqs: int, cost_per_error: float) -> float:
    error_cost = monthly_reqs * error_rate * cost_per_error
    return round(infra_usd + error_cost, 2)


# สมมติ error rate: All-ML = 0.015, Hybrid = 0.004, All-LLM = 0.005 (ต่อ 3M reqs, error cost $0.02)
for label, infra, err in [
    ("All-LLM", 1050.0, 0.005),
    ("Hybrid 80/20", 250.0, 0.004),
    ("All-ML", 40.0, 0.015),
]:
    total = total_monthly_cost(infra, err, monthly_requests, cost_per_error=0.02)
    print(f"{label:14s} -> infra=\${infra:7.2f} | total_with_errors=\${total:7.2f}/mo")`,
        },
        output: `All-LLM        -> infra=$1050.00 | total_with_errors=$1350.00/mo
Hybrid 80/20   -> infra=$ 250.00 | total_with_errors=$ 490.00/mo
All-ML         -> infra=$  40.00 | total_with_errors=$ 940.00/mo`,
      },
    ],
    gotcha:
      "จุดสังเกต: สังเกตผลลัพธ์ในขั้นที่ 3! แม้ All-ML จะมีค่า infra ถูกที่สุด (`$40`) แต่หากเคสยาก 20% ทำให้ error rate สูงขึ้นจนเสียค่าแรงเจ้าหน้าที่แก้บ่อย ต้นทุนรวมของ **Hybrid 80/20 (`$490/mo`)** กลับถูกกว่าทั้ง All-ML (`$940/mo`) และ All-LLM (`$1,350/mo`) — นี่คือพลังของการคิดด้วย Expected Value",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูลช่วยตัดสินใจเชิงวิศวกรรม (`exercise_day41.py`) ที่มี 3 ฟังก์ชัน: (1) แนะนำสถาปัตยกรรมจากสเปกงาน, (2) คำนวณเศรษฐศาสตร์รายเดือนของ Hybrid Routing และ (3) เราเตอร์คัดกรองทิกเก็ตตาม confidence threshold",
    requirements: [
      "`recommend_architecture(spec: TaskSpec) -> Literal[\"rules\", \"classical_ml\", \"llm\", \"hybrid\"]`: คืน `\"rules\"` ถ้า `is_deterministic_rule=True`; คืน `\"llm\"` ถ้า `requires_freeform_generation=True` หรือ `labeled_examples < 500`; คืน `\"classical_ml\"` ถ้า `input_kind == \"tabular\"` และ `labeled_examples >= 500`; คืน `\"hybrid\"` ถ้า `input_kind == \"text\"` และ `daily_requests >= 20_000` และ `latency_budget_ms <= 200`; มิฉะนั้นคืน `\"llm\"`",
      "`estimate_hybrid_monthly_cost(daily_requests: int, llm_fallback_ratio: float, llm_cost_per_1k_usd: float, ml_fixed_monthly_usd: float, ml_latency_ms: float = 5.0, llm_latency_ms: float = 800.0) -> dict[str, float]`: ตรวจว่า `0.0 <= llm_fallback_ratio <= 1.0` (มิฉะนั้น raise `ValueError`) แล้วคืน dict ที่มีคีย์ `monthly_cost_usd`, `all_llm_cost_usd`, `savings_pct` และ `avg_latency_ms` (ปัดทศนิยม 2 ตำแหน่ง โดยใช้ 30 วัน/เดือน)",
      "`route_batch(predictions: list[tuple[str, float]], threshold: float = 0.85) -> dict[str, list[int]]`: รับรายการ `(label, confidence)` แล้วคืน `{\"ml_handled\": [...indices...], \"llm_fallback\": [...indices...]}` โดยส่งให้ ML เมื่อ `confidence >= threshold`",
      "ผ่านการทดสอบทั้งหมดใน `test_day41.py` และไม่มีข้อผิดพลาดจาก `ruff check .`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day41.py",
      code: `from dataclasses import dataclass
from typing import Literal

ArchChoice = Literal["rules", "classical_ml", "llm", "hybrid"]


@dataclass(frozen=True)
class TaskSpec:
    input_kind: Literal["tabular", "text"]
    is_deterministic_rule: bool
    requires_freeform_generation: bool
    labeled_examples: int
    daily_requests: int
    latency_budget_ms: int


def recommend_architecture(spec: TaskSpec) -> ArchChoice:
    """แนะนำสถาปัตยกรรมที่เหมาะสมตาม Decision Matrix"""
    # TODO: เติมเงื่อนไขตามลำดับความสำคัญใน requirements
    raise NotImplementedError


def estimate_hybrid_monthly_cost(
    daily_requests: int,
    llm_fallback_ratio: float,
    llm_cost_per_1k_usd: float,
    ml_fixed_monthly_usd: float,
    ml_latency_ms: float = 5.0,
    llm_latency_ms: float = 800.0,
) -> dict[str, float]:
    """คำนวณต้นทุนรายเดือน (30 วัน) เปอร์เซ็นต์ประหยัด และ latency เฉลี่ยของ Hybrid Routing"""
    # TODO: ตรวจช่วง llm_fallback_ratio และคำนวณ monthly_cost_usd, all_llm_cost_usd, savings_pct, avg_latency_ms
    raise NotImplementedError


def route_batch(
    predictions: list[tuple[str, float]],
    threshold: float = 0.85,
) -> dict[str, list[int]]:
    """แบ่งดัชนีคำขอเป็น ml_handled (confidence >= threshold) และ llm_fallback"""
    # TODO: วนตรวจสอบแต่ละรายการแล้วจัดกลุ่มดัชนี
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day41.py",
      code: `import pytest
from exercise_day41 import (
    TaskSpec,
    estimate_hybrid_monthly_cost,
    recommend_architecture,
    route_batch,
)


def test_recommend_architecture_matrix():
    assert recommend_architecture(TaskSpec("tabular", True, False, 0, 100_000, 10)) == "rules"
    assert recommend_architecture(TaskSpec("tabular", False, False, 10_000, 50_000, 15)) == "classical_ml"
    assert recommend_architecture(TaskSpec("text", False, True, 20_000, 50_000, 1_000)) == "llm"
    assert recommend_architecture(TaskSpec("tabular", False, False, 100, 50_000, 50)) == "llm"
    assert recommend_architecture(TaskSpec("text", False, False, 5_000, 100_000, 150)) == "hybrid"


def test_estimate_hybrid_monthly_cost():
    res = estimate_hybrid_monthly_cost(
        daily_requests=100_000,
        llm_fallback_ratio=0.20,
        llm_cost_per_1k_usd=0.35,
        ml_fixed_monthly_usd=40.0,
        ml_latency_ms=4.0,
        llm_latency_ms=750.0,
    )
    assert res["all_llm_cost_usd"] == pytest.approx(1050.0)
    assert res["monthly_cost_usd"] == pytest.approx(250.0)
    assert res["savings_pct"] == pytest.approx(76.19, abs=0.02)
    assert res["avg_latency_ms"] == pytest.approx(154.0)

    with pytest.raises(ValueError):
        estimate_hybrid_monthly_cost(10_000, 1.5, 0.35, 40.0)


def test_route_batch_threshold():
    preds = [
        ("billing", 0.92),
        ("delivery", 0.61),
        ("refund", 0.85),
        ("technical", 0.40),
    ]
    routed = route_batch(preds, threshold=0.85)
    assert routed["ml_handled"] == [0, 2]
    assert routed["llm_fallback"] == [1, 3]
`,
    },
    selfCheck: [
      "`recommend_architecture` คืนผลลัพธ์ตรงตามลำดับเงื่อนไขทั้ง 4 แบบ (`rules`, `classical_ml`, `hybrid`, `llm`)",
      "`estimate_hybrid_monthly_cost` โยน `ValueError` เมื่อ `llm_fallback_ratio` อยู่นอกช่วง `[0.0, 1.0]`",
      "ค่า `savings_pct` คำนวณจาก `(all_llm_cost - monthly_cost) / all_llm_cost * 100` (จัดการกรณี `all_llm_cost == 0` ให้ปลอดภัย)",
      "`route_batch` ส่งรายการที่ `confidence == threshold` (`0.85`) เข้า `ml_handled` อย่างถูกต้อง",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 3 test functions ใน `test_day41.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `recommend_architecture` ให้ตรวจเงื่อนไขที่เจาะจงที่สุดก่อนตามลำดับ: `is_deterministic_rule` → `requires_freeform_generation` หรือข้อมูลน้อยกว่า 500 → `tabular` → `text` ปริมาณสูงและ latency ตึง → ค่าเริ่มต้น `llm`",
      },
      {
        body: "จำนวนคำขอรายเดือนคือ `monthly_reqs = daily_requests * 30`, ต้นทุน All-LLM คือ `(monthly_reqs / 1_000) * llm_cost_per_1k_usd`, และต้นทุน Hybrid คือ `ml_fixed_monthly_usd + all_llm_cost * llm_fallback_ratio`",
      },
      {
        body: "โครงของ `estimate_hybrid_monthly_cost` และ `route_batch` เกือบสมบูรณ์ — เติมสูตรคำนวณที่เว้นไว้แล้วรัน `pytest`:",
        code: {
          language: "python",
          filename: "hint_day41.py",
          code: `def estimate_hybrid_monthly_cost(
    daily_requests: int,
    llm_fallback_ratio: float,
    llm_cost_per_1k_usd: float,
    ml_fixed_monthly_usd: float,
    ml_latency_ms: float = 5.0,
    llm_latency_ms: float = 800.0,
) -> dict[str, float]:
    if not (0.0 <= llm_fallback_ratio <= 1.0):
        raise ValueError("llm_fallback_ratio must be between 0.0 and 1.0")
    monthly_reqs = daily_requests * 30
    all_llm = (monthly_reqs / 1_000) * llm_cost_per_1k_usd
    monthly_cost = ml_fixed_monthly_usd + (all_llm * llm_fallback_ratio)
    savings_pct = ((all_llm - monthly_cost) / all_llm * 100.0) if all_llm > 0 else 0.0
    # TODO: คำนวณ avg_latency_ms = ml_latency_ms + (llm_fallback_ratio * llm_latency_ms)
    raise NotImplementedError`,
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
      title: "ใช้ LLM แทน Classical ML กับงานตารางปริมาณสูงและต้องการ Sub-10ms",
      symptom: "ระบบตรวจจับทุจริตหรือจัดอันดับสินค้าหน่วง 800ms ทุกคำขอ ค่า API บานปลาย และบางครั้ง JSON หลุด schema",
      fix: "ใช้ `scikit-learn` หรือ {{lightgbm}} บนข้อมูลตาราง (Tabular) เพื่อได้ความเร็ว <10ms ต้นทุนคงที่ และผลลัพธ์ deterministic",
    },
    {
      title: "ประเมินค่า API ภาษาไทยด้วยจำนวน token แบบภาษาอังกฤษ",
      symptom: "งบประมาณจริงใน Production สูงกว่าที่คำนวณไว้ 2–3 เท่า เพราะข้อความภาษาไทยถูกแบ่งเป็น subword token เยอะกว่าภาษาอังกฤษ",
      fix: "เผื่อตัวคูณ Thai token inflation (1.5x–3x) เสมอเวลาคำนวณงบ หรือนับ token จริงจากชุดข้อความตัวอย่างภาษาไทย",
    },
    {
      title: "ดึงดันเทรน Classical ML ทั้งที่ยังไม่มี Labeled Data เลย",
      symptom: "ทีมเสียเวลา 1 เดือนก่อนจะปล่อยฟีเจอร์แรกได้ ทั้งที่ปริมาณคำขอช่วงเปิดตัวมีแค่วันละ 300 ครั้ง",
      fix: "ใช้ LLM (zero-shot / few-shot) เพื่อปล่อยเวอร์ชันแรกและเก็บข้อมูลป้ายกำกับก่อน เมื่อปริมาณโตและมีข้อมูลครบค่อยย้าย 80% มาใช้ Classical ML (Hybrid Routing)",
    },
    {
      title: "ใช้ AI (ทั้ง ML และ LLM) กับกฎธุรกิจที่เขียน if/else หรือ SQL ได้ตรง ๆ",
      symptom: "เพิ่มความซับซ้อน โอกาสทายผิด และภาระดูแลโมเดลโดยไม่จำเป็นกับโจทย์ที่มีเงื่อนไขตายตัว",
      fix: "ถามเสมอว่า 'กฎ `if/else` หรือ SQL แก้ได้ 100% ไหม?' ถ้าได้ ให้ใช้โค้ดธรรมดาก่อนเสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d041-q1",
        "โจทย์ใดต่อไปนี้เหมาะกับการใช้ **Classical ML (`scikit-learn` / LightGBM)** มากกว่า LLM มากที่สุด?",
        [
          ["สรุปรายงานการประชุมภาษาไทยความยาว 20 หน้าเป็น bullet point", "งานสรุปข้อความอิสระและสร้างภาษาใหม่เป็นจุดแข็งของ LLM"],
          ["ทำนายความเสี่ยงการฉ้อโกงบัตรเครดิตจากฟีเจอร์ตาราง 35 คอลัมน์ ปริมาณ 200,000 รายการ/วัน ภายในเวลาไม่เกิน 15ms", "ถูก — ข้อมูลตาราง ปริมาณสูง ต้องการ latency <15ms และมีข้อมูลประวัติย้อนหลังชัดเจนคือจุดแข็งที่สุดของ Classical ML"],
          ["เขียนอีเมลตอบลูกค้าแบบเฉพาะบุคคลตามประวัติการสนทนา", "งานสร้างข้อความภาษาธรรมชาติแบบเปิดกว้างต้องใช้ LLM"],
          ["ระบบคัดกรองสิทธิ์ส่วนลดที่ให้เฉพาะสมาชิกที่มีอายุบัญชีมากกว่า 365 วัน", "กฎตายตัว 100% แบบนี้ควรใช้โค้ด `if/else` หรือ SQL ธรรมดา ไม่ต้องใช้ทั้ง ML และ LLM"],
        ],
        "B",
        "ข้อมูลแบบตาราง (Tabular) ที่มีปริมาณสูงและต้องการความเร็วระดับมิลลิวินาทีเป็นจุดที่ Classical ML ชนะ LLM ขาดทั้งความแม่นยำ ต้นทุน และความเสถียร",
        "เกณฑ์ 3 ข้อหลักที่ชี้ว่าโจทย์ควรใช้ Classical ML แทน LLM คืออะไร?",
        "1) ข้อมูลเป็นตาราง/ฟีเจอร์โครงสร้างชัดเจน (หรือหมวดหมู่จำกัดพร้อม labeled data), 2) ปริมาณคำขอสูงและต้องการ latency ต่ำ (<20ms), 3) ต้องการต้นทุนคงที่ ผล deterministic และคุมข้อมูลในองค์กรตาม PDPA",
      ),
      mc(
        "d041-q2",
        "ในสถาปัตยกรรม **Hybrid Routing (Cascade)** สำหรับจัดหมวดหมู่ทิกเก็ต 100,000 ใบ/วัน ขั้นตอนการทำงานที่ถูกต้องคือข้อใด?",
        [
          ["ส่งทุกทิกเก็ตให้ LLM ก่อน ถ้า LLM ช้าค่อยส่งให้ Classical ML", "ผิดลำดับ — จะไม่ได้ประหยัดค่า LLM และเสียเวลารอ LLM ทุกคำขอ"],
          ["ส่งทุกทิกเก็ตผ่าน Classical ML ความเร็ว <10ms ก่อน เคสที่มั่นใจสูง (~80%) ตอบกลับทันที ส่วนเคสที่ความมั่นใจต่ำกว่า threshold (~20%) จึงส่งต่อให้ LLM", "ถูก — ลดค่า LLM API ลงราว 80% ลด latency เฉลี่ย และคงความแม่นยำในเคสยาก"],
          ["สุ่มโยนเหรียญ 50/50 ว่าจะส่งให้ ML หรือ LLM", "การสุ่มไม่แยกเคสง่ายกับเคสยาก ทำให้เคสยากหลุดไปให้ ML ตอบผิดและเคสง่ายเปลืองเงิน LLM"],
          ["รันทั้ง ML และ LLM พร้อมกันทุกคำขอแล้วค่อยเอาคำตอบมาเฉลี่ย", "ต้องจ่ายค่า LLM 100% และรอ latency ของตัวที่ช้าที่สุดทุกครั้ง"],
        ],
        "B",
        "Hybrid Routing ใช้โมเดลราคาถูกและเร็วกรองเคสที่มั่นใจสูงออกก่อน แล้วสงวนโมเดลราคาแพงไว้เฉพาะเคสกำกวมที่ `confidence < threshold`",
        "อธิบายหลักการทำงานและประโยชน์หลักของ Hybrid Routing (ML → LLM)?",
        "ให้ Classical ML ที่เร็วและถูกจัดการเคสที่ความมั่นใจสูง (~80%) ทันที และส่งเฉพาะเคสกำกวม (~20%) ให้ LLM ช่วยวิเคราะห์ ช่วยลดต้นทุนและ latency ได้มากโดยไม่เสียความแม่นยำ",
      ),
      mc(
        "d041-q3",
        "เหตุใดทีมที่ประเมินค่า LLM API สำหรับทิกเก็ตภาษาไทยจึงมักเจอค่าใช้จ่ายจริงสูงกว่าการประมาณการจากตัวอย่างภาษาอังกฤษ?",
        [
          ["เพราะผู้ให้บริการคิดราคาต่อ token ของภาษาไทยแพงกว่าภาษาอังกฤษ 3 เท่าโดยตรง", "ราคาต่อ token เท่ากัน แต่จำนวน token ที่ถูกแบ่งออกมามากกว่า"],
          ["เพราะข้อความภาษาไทยมักถูกแบ่งเป็นจำนวน token มากกว่าภาษาอังกฤษราว 1.5x–3x (Token Inflation)", "ถูก — เมื่อข้อความยาวเท่ากันแต่แตกเป็น token มากกว่า 1.5x–3x ค่า API และเวลาประมวลผลจึงเพิ่มขึ้นตามไปด้วย"],
          ["เพราะภาษาไทยไม่สามารถส่งผ่าน HTTPS ได้ ต้องแปลงเป็นภาพก่อน", "ไม่จริง — ข้อความ UTF-8 ส่งผ่าน JSON/HTTPS ได้ตามปกติ"],
          ["เพราะ Classical ML ใช้จำนวน token มากกว่า LLM", "Classical ML ไม่ได้คิดเงินตาม LLM token"],
        ],
        "B",
        "BPE tokenizer ส่วนใหญ่ถูกเทรนด้วยสัดส่วนภาษาอังกฤษสูงกว่า ทำให้ข้อความภาษาไทยแตกเป็นจำนวน token มากกว่า (จะได้เจาะลึกใน Day 66) จึงต้องเผื่อตัวคูณนี้ในแผนงบประมาณเสมอ",
        "Token Inflation ในภาษาไทยส่งผลต่อการตัดสินใจเลือก ML vs LLM อย่างไร?",
        "ข้อความภาษาไทยใช้จำนวน token มากกว่าภาษาอังกฤษ 1.5x–3x ทำให้ค่า API จริงสูงขึ้นและชน context limit เร็วขึ้น ยิ่งเพิ่มความคุ้มค่าของการใช้ Classical ML หรือ Hybrid Routing ในงานปริมาณสูง",
      ),
      mc(
        "d041-q4",
        "สตาร์ทอัพกำลังจะเปิดตัวฟีเจอร์จัดหมวดหมู่คำติชมภาษาไทยสัปดาห์หน้า ปริมาณช่วงแรก ~300 ข้อความ/วัน และยัง **ไม่มีข้อมูลที่ติดป้ายกำกับ (labeled data) เลย** แนวทางใดเหมาะสมที่สุด?",
        [
          ["เลื่อนเปิดตัวไปอีก 2 เดือนเพื่อรอเก็บข้อมูลครบ 50,000 แถวแล้วค่อยเทรน LightGBM", "ช้าเกินความจำเป็นสำหรับปริมาณแค่ 300 ข้อความ/วัน"],
          ["เริ่มด้วย LLM แบบ Zero-shot/Few-shot เพื่อปล่อยงานได้เร็วพร้อมเก็บ log และคำตอบที่ตรวจแล้วไว้เป็นชุดข้อมูลสำหรับเทรน Classical ML เมื่อทราฟฟิกโตขึ้น", "ถูก — ช่วง Cold Start ที่ทราฟฟิกน้อย ค่า LLM แทบไม่กี่ดอลลาร์ต่อเดือน และช่วยสร้างชุดข้อมูลป้ายกำกับให้ ML ในอนาคต"],
          ["เทรนโมเดล scikit-learn ด้วยข้อมูลสุ่มขึ้นมาเอง 10 แถว", "โมเดลที่เทรนจากข้อมูลสุ่มจะไม่สามารถทำนายข้อมูลจริงได้"],
          ["เช่าเครื่อง GPU ราคาแพงมา fine-tune โมเดล 70B ตั้งแต่วันแรก", "ต้นทุนสูงเกินไปและยังไม่มีชุดข้อมูลสำหรับ fine-tune ด้วยซ้ำ"],
        ],
        "B",
        "หลักวิศวกรรมที่ดีคือเลือกให้เหมาะกับระยะของผลิตภัณฑ์: ช่วง Cold Start ทราฟฟิกต่ำใช้ LLM เพื่อเปิดตัวไวและสะสม labeled data แล้วค่อยขยับสู่ Hybrid หรือ Classical ML เมื่อปริมาณโตขึ้น",
        "เมื่อยังไม่มี labeled data และทราฟฟิกช่วงแรกยังต่ำ (~300 req/day) ควรเริ่มด้วย Classical ML หรือ LLM?",
        "ควรเริ่มด้วย LLM เพื่อปล่อยฟีเจอร์ไว (ต้นทุนต่ำมากเมื่อทราฟฟิกน้อย) พร้อมบันทึกข้อมูลที่ตรวจสอบแล้วไว้สร้างชุดเทรนสำหรับ Classical ML / Hybrid Routing เมื่อปริมาณขยายตัว",
      ),
    ],
  },

  takeaways: [
    "ไม่ใช้ {{llm}} กับทุกปัญหา: ข้อมูลตาราง ปริมาณสูง ต้องการ `<10ms` และผล deterministic → ใช้ **Classical ML (`scikit-learn` / {{lightgbm}})**; กฎตายตัว 100% → ใช้ **SQL / `if-else`**",
    "ประเมินทางเลือกด้วยตัวเลขจริงเสมอ: เทียบ **ต้นทุนต่อ 100k คำขอ** (เผื่อ Thai token inflation 1.5x–3x), **P95 Latency**, และ **{{expected-value}}** ของความผิดพลาด",
    "ใช้ **Hybrid Routing (ML → LLM)** เพื่อดึงข้อดีของทั้งสองโลก: ให้ ML จบงาน 80% ที่มั่นใจใน `<10ms` และส่ง 20% ที่กำกวมให้ LLM ช่วยวิเคราะห์",
    "ช่วง Cold Start ที่ยังไม่มี labeled data และทราฟฟิกต่ำ ใช้ LLM เป็นตัวเปิดตัวแล้วค่อยเก็บข้อมูลมาสร้าง Classical ML เพื่อลดต้นทุนเมื่อระบบเติบโต",
  ],

  reviewCards: [
    rc(
      "d041-rc-1",
      "สรุป Decision Matrix: เมื่อไรควรเลือก Rules, Classical ML, LLM และ Hybrid Routing?",
      "Rules = เงื่อนไขตายตัว 100%; Classical ML = ข้อมูลตาราง/หมวดหมู่จำกัด ปริมาณสูง Latency <20ms และมี labeled data; LLM = ข้อความอิสระ/สร้างภาษา/Cold Start ไร้ป้ายกำกับ; Hybrid = ปริมาณสูงแต่มีเคสกำกวม ให้ ML จบ ~80% และส่ง ~20% ที่ไม่มั่นใจให้ LLM",
    ),
    rc(
      "d041-rc-2",
      "ทำไมการประเมินต้นทุน Hybrid Routing ต้องคิดรวมทั้งค่า Infra/API และต้นทุนความผิดพลาด (Error Cost)?",
      "เพราะโมเดลที่ค่า infra ถูกที่สุดอาจมี error rate สูงจนเสียค่าแรงคนแก้หรือเสียลูกค้ามากกว่า การคิดรวมด้วย Expected Value จะชี้จุดสมดุลที่ต้นทุนรวมต่ำสุดจริง ๆ",
    ),
    rc(
      "d041-rc-3",
      "นอกจากต้นทุนและ Latency แล้ว มีเหตุผลด้านวิศวกรรมใดอีกที่ทำให้ Classical ML เหมาะกับหลายงานในองค์กรไทย?",
      "ผลลัพธ์ deterministic ไม่มี hallucination, รันบน CPU ภายในองค์กรได้ง่ายไม่ต้องส่งข้อมูลอ่อนไหวตาม PDPA ออกนอกเครือข่าย, และอธิบายน้ำหนักฟีเจอร์ให้ทีมตรวจสอบได้",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Supervised Learning Overview", href: "https://scikit-learn.org/stable/supervised_learning.html" },
    { label: "Google Developers — Rules of Machine Learning (Rule #1–#4)", href: "https://developers.google.com/machine-learning/guides/rules-of-ml" },
    { label: "Anthropic — Building Effective Agents (Workflows & Routing)", href: "https://www.anthropic.com/research/building-effective-agents" },
    { label: "LightGBM Documentation — Features & Performance", href: "https://lightgbm.readthedocs.io/en/stable/Features.html" },
  ],

  glossary: [
    "llm",
    "lightgbm",
    "expected-value",
    "pdpa",
    "hallucination",
    "structured-output",
    "caching",
    "pytest",
  ],
});
