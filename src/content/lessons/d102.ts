import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D102 — Phase 4 / Block B26
 * Cross-Encoder Reranking (bge-reranker / Rerank API)
 */
export const d102: Lesson = defineLesson({
  day: 102,
  titleTh: "จัดอันดับรอบสองด้วย Cross-Encoder Reranking (bge-reranker / Rerank API)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · คัดกรอง Top-20 → Top-5 แบบแม่นยำด้วย Cross-Encoder พร้อม Latency Guard",
  icon: "sparkles",
  visual: {
    id: "reranker-query-transform",
    title: "2-Stage Retrieval: Cross-Encoder Reranking & Query Transformation",
    caption: "สลับดูการคัดกรอง Top-20 → Top-5 ด้วย Cross-Encoder และการใช้ Query Rewrite/HyDE พร้อม Latency Guard",
    alt: "แผนภาพ Cross-Encoder Reranking และ Query Transformation",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ด้วย local/mock scorer (สลับไปใช้ bge-reranker-v2-m3 หรือ Rerank API จริงได้ทันที)",
  tools: ["Python 3.12", "Qdrant / pgvector", "Reranker (bge-reranker-v2-m3)", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "Hybrid Search กวาดผู้สมัครได้ครบ แต่ยังเรียง Top-5 ไม่คมพอ",
      body: "แม้ {{rrf}} จะช่วยดึงเอกสารที่เกี่ยวข้องเข้ามาอยู่ใน top-20 ได้ครบ แต่เอกสารที่มีคำซ้ำคล้ายกัน (เช่น `ภายใน 7 วัน` กับ `หลัง 7 วัน`) ยังสลับอันดับกันได้ง่ายในขั้น Bi-Encoder",
      lessonNote: "วันนี้เราเพิ่มชั้น {{reranker}} เป็นด่านคัดรอบสอง เพื่ออ่านคำถามและเอกสารคู่กันแบบละเอียดก่อนส่งเข้า LLM",
    },
    {
      node: 2,
      heading: "Cross-Encoder อ่าน (query, document) พร้อมกันด้วย Full Attention",
      body: "ต่างจาก Bi-Encoder ที่แปลงคำถามและเอกสารเป็นเวกเตอร์แยกกัน Cross-Encoder รับ `(query, doc)` เข้าพร้อมกัน ทำให้จับเงื่อนไขปฏิเสธ เงื่อนไขตัวเลข และบริบทไทยปนอังกฤษได้แม่นกว่ามาก",
      lessonNote: "เราจะดูวิธีวางท่อ **2-Stage Retrieval Funnel**: Hybrid Top-20 (Recall) → Cross-Encoder Top-5 (Precision)",
    },
    {
      node: 3,
      heading: "ยกระดับ MRR และ Precision@5 โดยไม่เพิ่มจำนวนโทเคนใน Prompt",
      body: "การยัด 20 chunks เข้า prompt เปลืองทั้งต้นทุนและทำให้โมเดลสับสน (lost in the middle) การคัดเหลือ 5 chunks ที่คมที่สุดช่วยเพิ่มทั้งความแม่นและความเร็ว",
      lessonNote: "ใน Day 104 เราจะวัดค่า {{mrr}} และ {{precision-recall|Recall@5}} เพื่อพิสูจน์ว่า Reranker ยกอันดับคำตอบขึ้นอันดับ 1 ได้จริง",
    },
    {
      node: 5,
      heading: "คุม Latency และสร้าง Fallback เมื่อ Reranker ช้าหรือล่ม",
      body: "Cross-Encoder ทำงานแบบ `O(N)` ตามจำนวนคู่เอกสาร หากส่งผู้สมัครมากเกินไปหรือ Rerank API เกิดหน่วง อาจทำให้เวลาตอบของระบบ {{rag}} พุ่งเกิน SLA",
      lessonNote: "แบบฝึกหัดวันนี้สร้าง Reranker Pipeline ที่จำกัด `max_candidates`, กรอง `min_score` และสลับกลับไปใช้ลำดับ RRF อัตโนมัติเมื่อเกิน timeout",
    },
  ],

  objectives: [
    "**อธิบายความแตกต่าง** ระหว่าง Bi-Encoder ({{embedding}} แยกฝั่ง) กับ Cross-Encoder {{reranker}} ทั้งในแง่กลไก Attention, ความแม่นยำ และต้นทุนเวลา",
    "**ออกแบบท่อค้นหา 2 จังหวะ (2-Stage Retrieval)** ที่รับผู้สมัคร Top-20 จาก Hybrid {{rrf}} แล้วคัดกรองเหลือ {{top-k|Top-5}} พร้อมกรองเอกสารคะแนนต่ำออก",
    "**เขียนฟังก์ชัน Reranking ที่ปลอดภัยต่อ Production** โดยมีตัวจำกัดจำนวนผู้สมัคร (`max_candidates`), การตรวจ `timeout_ms` และการ Fallback กลับไปใช้ลำดับ Stage 1 เมื่อเกิดข้อผิดพลาด",
  ],

  prerequisites: [
    "เข้าใจ Hybrid Search และ {{rrf}} (แนะนำ Day 101)",
    "เข้าใจ Dense {{embedding}} และ {{cosine-similarity}} (แนะนำ Day 38, Day 69)",
    "คุ้นเคยกับ `dataclasses`, `time.perf_counter()` และ `pytest`",
    "ไม่ต้องใช้ API key หรือการ์ดจอ — รันโค้ดและเทสต์ทั้งหมดบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "บทเรียนนี้ใช้ Pure Python + `pytest` สำหรับสร้างโครงท่อ Reranking และ Latency Guard (คุณสามารถติดตั้ง `sentence-transformers` เพิ่มภายหลังเพื่อโหลด `BAAI/bge-reranker-v2-m3` บนเครื่องได้)",
    commands: `uv init ai-day102 && cd ai-day102
uv add --dev pytest ruff
# ตัวเลือกเสริม (เมื่อต้องการรันโมเดล Cross-Encoder จริงบนเครื่อง)
# uv add sentence-transformers`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day102` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pytest` และ `ruff` สำเร็จ"],
      ["ready", "ตรวจสอบว่า `uv run pytest --version` ทำงานได้ปกติ"],
    ],
    note: "ตัวอย่างและแบบฝึกหัดวันนี้ใช้ local/mock scorer แบบ deterministic จึงรันผ่านได้ทันทีโดยไม่ต้องดาวน์โหลดโมเดลขนาด 2GB",
  },

  concepts: [
    {
      id: "bi-vs-cross-encoder",
      title: "1 · Bi-Encoder vs Cross-Encoder: ทำไมความเร็วกับความแม่นจึงต้องแยกหน้าที่กัน",
      paragraphs: [
        "ในระบบค้นหาด้วยเวกเตอร์ปกติ เราใช้ **Bi-Encoder**: โมเดลแปลงข้อความเอกสารทั้งหมดเป็นเวกเตอร์ ({{embedding}}) เก็บไว้ล่วงหน้าใน Qdrant/pgvector พอมีคำถามเข้ามาก็แปลงคำถามเป็นเวกเตอร์อีกเส้น แล้วคำนวณ {{cosine-similarity}} วิธีนี้เร็วระดับมิลลิวินาทีเพราะคำถามกับเอกสารไม่เคยต้องอ่านเทียบกันคำต่อคำ",
        "ข้อจำกัดของ Bi-Encoder คือการบีบทั้งย่อหน้าลงในเวกเตอร์เดียวทำให้รายละเอียดสำคัญตกหล่น เช่น คำถามว่า `\"ยกเลิกหลัง 7 วัน ยังขอคืนเงินได้ไหม\"` อาจได้คะแนนใกล้เคียงกับเอกสาร `\"ขอคืนเงินได้ภายใน 7 วัน\"` มากกว่าเอกสาร `\"กรณีเกิน 7 วัน ไม่สามารถคืนเงินได้\"` เพราะคำสำคัญซ้อนทับกันสูงมาก",
        "**Cross-Encoder {{reranker}}** (เช่น `BAAI/bge-reranker-v2-m3` ที่รองรับภาษาไทยได้ดี หรือบริการ Rerank API อย่าง Cohere / Jina) แก้ปัญหานี้ด้วยการป้อน `[CLS] query [SEP] document [SEP]` เข้าโมเดลพร้อมกัน ทำให้ทุกโทเคนในคำถามทำ self-attention กับทุกโทเคนในเอกสารได้โดยตรง แล้วคืนคะแนนความเกี่ยวข้อง (relevance score) ออกมา 1 ค่า",
      ],
      analogy:
        "เหมือนการคัดเลือกผู้สมัครงาน 10,000 คน: Bi-Encoder คือระบบคัดกรองเรซูเม่จากโปรไฟล์สรุปภายใน 5 วินาทีให้เหลือ 20 คน ส่วน Cross-Encoder คือกรรมการที่นำใบสมัคร 20 ใบนั้นมานั่งอ่านเทียบกับคุณสมบัติงานทีละบรรทัดเพื่อเลือก 5 คนสุดท้าย",
      bullets: [
        "**Bi-Encoder**: สร้างเวกเตอร์เอกสารล่วงหน้าได้, ค้นคลัง 100,000+ ชิ้นได้ใน ~10–30 ms, เด่นเรื่อง **Recall**",
        "**Cross-Encoder**: คำนวณเวกเตอร์ล่วงหน้าไม่ได้เพราะต้องจับคู่กับคำถามใหม่ทุกครั้ง, ช้ากว่ามาก (`O(N)` คู่), เด่นเรื่อง **Precision** และจับเงื่อนไข/คำปฏิเสธ",
        "**โมเดลแนะนำสำหรับภาษาไทย**: `BAAI/bge-reranker-v2-m3` (open-weights รันเองได้) หรือ Multilingual Rerank API ที่รองรับภาษาไทย",
      ],
      code: {
        language: "python",
        filename: "cross_encoder_interface.py",
        code: `from typing import Protocol


class RerankScorer(Protocol):
    """สัญญาฟังก์ชันให้คะแนนคู่ (query, doc) — สลับระหว่าง local model, API หรือ mock ได้"""

    def __call__(self, query: str, documents: list[str]) -> list[float]: ...


# ตัวอย่างเมื่อใช้งานจริงกับ sentence-transformers (BAAI/bge-reranker-v2-m3):
# from sentence_transformers import CrossEncoder
# model = CrossEncoder("BAAI/bge-reranker-v2-m3", max_length=512)
# def bge_scorer(query: str, documents: list[str]) -> list[float]:
#     pairs = [(query, doc) for doc in documents]
#     return [float(s) for s in model.predict(pairs)]`,
        caption: "ห่อ Cross-Encoder ไว้หลัง Protocol เดียวกัน ทำให้เทสต์บนเครื่องด้วย mock scorer และสลับไปใช้โมเดลจริงหรือ API ได้โดยไม่แก้โค้ดท่อหลัก",
      },
      whyTitle: "Why this matters — อย่าคาดหวังให้ Embedding แยกเงื่อนไขซับซ้อนได้ทั้งหมด",
      whyParagraphs: [
        "ความผิดพลาดที่พบบ่อยในระบบ {{rag}} ภาษาไทยคือพยายามเปลี่ยนโมเดล Embedding ไปเรื่อย ๆ ทั้งที่ปัญหาจริงเกิดจาก Bi-Encoder มองประโยคที่มีคำคล้ายกันแต่เงื่อนไขตรงข้ามกันอยู่ใกล้กันเกินไป",
        "การเพิ่ม Cross-Encoder Reranker เป็นชั้นที่สองมักยกระดับความแม่นยำของอันดับ Top-3 ได้ชัดเจนกว่าการเปลี่ยนโมเดล Embedding เพียงอย่างเดียว",
      ],
    },
    {
      id: "two-stage-funnel",
      title: "2 · ท่อค้นหา 2 จังหวะ (2-Stage Retrieval Funnel): Hybrid Top-20 → Rerank Top-5",
      paragraphs: [
        "เราไม่มีทางนำ Cross-Encoder ไปรันกับเอกสารทั้งคลัง 50,000 ชิ้น เพราะการประมวลผล 50,000 คู่จะใช้เวลาหลายสิบวินาที วิธีมาตรฐานในระบบจริงจึงแบ่งการค้นหาเป็น **กรวย 2 จังหวะ (2-Stage Funnel)**",
        "**จังหวะที่ 1 (Recall Stage)**: ใช้ Hybrid Search + {{rrf}} (BM25 + Dense Vector จาก Day 101) กวาดผู้สมัครที่อาจเกี่ยวข้องออกมา `candidate_k = 20` (หรือ 30–50 ในคลังที่ซับซ้อน) ภายในไม่กี่สิบมิลลิวินาที เป้าหมายคือ *อย่าให้เอกสารคำตอบหลุดมือ*",
        "**จังหวะที่ 2 (Precision Stage)**: ส่งเฉพาะ 20 คู่ `(query, doc_text)` เข้า {{reranker}} เพื่อจัดอันดับใหม่ ตัดเอกสารที่คะแนนต่ำกว่าเกณฑ์ `min_score` ทิ้ง แล้วหยิบเพียง **{{top-k|Top-5}}** ส่งเข้า prompt ของ LLM เพื่อลด noise และคุมต้นทุนโทเคน",
      ],
      analogy:
        "เหมือนการคัดผลไม้เกรดส่งออก: ตะแกรงหยาบคัดลูกที่ได้ขนาดคร่าว ๆ ออกมา 20 ลูกอย่างรวดเร็ว จากนั้นผู้เชี่ยวชาญส่องตรวจผิวทีละลูกเพื่อคัด 5 ลูกที่สมบูรณ์ที่สุดลงกล่อง",
      bullets: [
        "**Recall ก่อน Precision**: ถ้าเอกสารที่ใช่หลุดจาก Top-20 ตั้งแต่จังหวะแรก Reranker ไม่มีทางเสกมันกลับมาได้",
        "**ลดปัญหา Lost in the Middle**: LLM อ่านบริบท 5 ชิ้นที่แม่นตรงประเด็นได้ดีกว่าการยัด 20 ชิ้นที่มีเนื้อหาปะปน",
        "**Score Threshold (`min_score`)**: ช่วยป้องกันไม่ให้ส่งเอกสารที่ไม่เกี่ยวเลยเข้า prompt เมื่อผู้ใช้ถามเรื่องนอกคลังความรู้",
      ],
      whyTitle: "Why this matters — สมดุลระหว่าง Recall, Precision และ Context Window",
      whyParagraphs: [
        "ในแง่ {{precision-recall}} การเพิ่มจำนวนเอกสารจาก 5 เป็น 20 ในจังหวะแรกช่วยดัน Recall ขึ้นสูง แต่ทำให้ Precision ต่ำลงหากส่งเข้า LLM ตรง ๆ",
        "Cross-Encoder Reranker ทำหน้าที่บีบ 20 ชิ้นนั้นกลับเหลือ 5 ชิ้นที่คมที่สุด ทำให้ได้ทั้ง **High Recall จาก Stage 1** และ **High Precision ก่อนถึง LLM**",
      ],
    },
    {
      id: "rerank-latency-guardrails",
      title: "3 · คุม Latency, ความยาวข้อความ และ Fallback ของ Reranker บน Production",
      paragraphs: [
        "แม้ Cross-Encoder จะแม่นยำ แต่มีต้นทุนเวลาเป็นเส้นตรงกับจำนวนคู่ผู้สมัคร (`O(N)`) และความยาวข้อความ หากไม่ใส่กรอบป้องกัน ท่อค้นหาอาจช้าลงจนกระทบประสบการณ์ผู้ใช้ในระบบจริง",
        "กฎป้องกัน 3 ข้อที่วิศวกร AI ต้องวางตั้งแต่ต้น ได้แก่: (1) **Candidate Cap (`max_candidates`)** จำกัดไม่ให้ส่งเกิน 20–30 เอกสารต่อคำขอ, (2) **Text Truncation** ตัดความยาวข้อความแต่ละ chunk ให้อยู่ในขีดจำกัดของโมเดล (เช่น 512–1,024 tokens สำหรับ `bge-reranker-v2-m3`) และ (3) **Timeout & Error Fallback** หาก Rerank API ล่ม คืนจำนวนคะแนนไม่ครบ หรือใช้เวลาเกินงบ (เช่น `250 ms`) ให้สลับกลับไปใช้ลำดับจาก Stage 1 (Hybrid RRF) ทันทีแทนการโยน error ใส่ผู้ใช้",
        "การมี Fallback แบบนี้ทำให้ {{reranker}} เป็น **Quality Enhancer ที่ปลอดภัย (Graceful Degradation)**: ในสภาวะปกติผู้ใช้ได้คำตอบที่คมขึ้นมาก แต่ในวันที่บริการ Rerank ช้า ระบบ {{rag}} ยังคงตอบได้ตามปกติและบันทึก metric `used_fallback=True` ไว้แจ้งเตือนทีม",
      ],
      analogy:
        "เหมือนช่องตรวจละเอียดในสนามบินที่มีช่องมาตรฐานรองรับ: ถ้าเครื่องสแกนละเอียดเกิดคิวยาวเกินกำหนด ระบบไม่ปิดเที่ยวบิน แต่สลับไปใช้ผลตรวจรอบแรกที่ผ่านเกณฑ์แล้วทันที พร้อมแจ้งเจ้าหน้าที่มาดู",
      code: {
        language: "python",
        filename: "rerank_guard_pattern.py",
        code: `import time


def safe_score(
    query: str,
    texts: list[str],
    scorer,
    timeout_ms: float = 250.0,
) -> list[float] | None:
    """คืน list[float] เมื่อสำเร็จภายในงบเวลา มิฉะนั้นคืน None เพื่อให้ผู้เรียกใช้ fallback"""
    start = time.perf_counter()
    try:
        scores = scorer(query, texts)
    except Exception:
        return None
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    if elapsed_ms > timeout_ms or len(scores) != len(texts):
        return None
    return scores`,
        caption: "แยกความรับผิดชอบของด่านป้องกัน: ตรวจทั้ง exception, งบเวลา `timeout_ms` และความยาวผลลัพธ์ก่อนเชื่อคะแนนจาก Reranker",
      },
      whyTitle: "Why this matters — Reranker ที่ไม่มี Fallback คือ Single Point of Failure ตัวใหม่",
      whyParagraphs: [
        "หลายทีมต่อ Rerank API ภายนอกเข้าไปในท่อ RAG โดยไม่มี timeout และ fallback พอผู้ให้บริการเกิด latency spike ระบบแชตทั้งระบบก็ค้างตามไปด้วยทั้งที่มีผลลัพธ์จาก Hybrid RRF อยู่ในมือแล้ว",
        "การออกแบบให้ตกกลับไปใช้ Stage-1 order ได้ทันทีช่วยรักษา Availability โดยแทบไม่ต้องเขียนโค้ดเพิ่ม",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — 2-Stage Retrieval เทียบกับระบบ Search & Ranking ในเว็บแอป",
      body: [
        "หากคุณเคยทำระบบค้นหาสินค้าหรือฟีดข่าวขนาดใหญ่ สถาปัตยกรรม 2-Stage Retrieval คือแบบแผนเดียวกับ Candidate Generation + Re-ranking ในเว็บสเกลใหญ่:",
      ],
      table: [
        ["Stage 1: Hybrid RRF (Top-20)", "SQL / Elasticsearch query ที่ดึง candidate อย่างรวดเร็ว"],
        ["Stage 2: Cross-Encoder (Top-5)", "ML ranking service ที่ให้คะแนนละเอียดเฉพาะ 20 รายการบนสุด"],
        ["max_candidates = 20", "LIMIT 20 ก่อนส่งเข้าบริการคำนวณราคาแพง"],
        ["Timeout Fallback → Stage 1", "Circuit breaker / fallback ไปใช้ default sort เมื่อ ranking API ช้า"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Cross-Encoder ถึงช้ากว่า Bi-Encoder แบบเห็นได้ชัด",
      body: [
        "สมมติคุณมีเอกสาร 10,000 ชิ้น: **Bi-Encoder** รันโมเดลกับเอกสารทั้ง 10,000 ชิ้นแค่ *ครั้งเดียวตอนเก็บเข้าฐานข้อมูล* พอผู้ใช้ถามเข้ามา โมเดลรันแค่ **1 ครั้ง** (สำหรับคำถาม) แล้วเอาเวกเตอร์มาคูณเทียบกันซึ่งคอมพิวเตอร์ทำได้เร็วมาก",
        "แต่ **Cross-Encoder** ต้องเอาคำถามไปประกบคู่กับเอกสารทีละชิ้นแล้วรันโครงข่ายประสาทใหม่ทุกครั้ง — ถ้าส่ง 20 เอกสารก็รันโมเดล 20 คู่ (ใช้เวลาไม่ถึง 0.1 วินาที) แต่ถ้าส่ง 10,000 เอกสารก็ต้องรัน 10,000 คู่ (ช้าเกินรับไหว) นี่จึงเป็นเหตุผลที่เราต้องใช้ทั้งสองแบบร่วมกันเป็น 2 จังหวะ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ผู้ใช้ถามว่า `\"ลูกค้ายกเลิกหลัง 7 วัน ยังขอคืนเงินได้ไหม\"` ผลจาก Stage 1 (Hybrid RRF) หยิบเอกสารที่มีคำว่า `คืนเงิน` และ `7 วัน` ขึ้นมาครบ 4 ชิ้น แต่อันดับ 1 กลับเป็นเงื่อนไข `ภายใน 7 วัน` แทนที่จะเป็น `หลัง 7 วัน` มาดูว่า Cross-Encoder Reranker จัดอันดับใหม่และกรอง noise อย่างไร",
    steps: [
      {
        title: "1 · ดูรายการผู้สมัครจาก Stage 1 (Hybrid RRF)",
        explain:
          "สังเกตว่า `doc_refund_within_7d` อยู่ลำดับ 1 เพราะมีคำหลักตรงกับคำถามหลายคำ ส่วนคำตอบที่ตรงเงื่อนไขจริง (`doc_refund_after_7d`) หล่นไปอยู่อันดับ 3",
        code: {
          language: "python",
          filename: "worked_rerank.py",
          code: `query = "ลูกค้ายกเลิกหลัง 7 วัน ยังขอคืนเงินได้ไหม"

stage1_candidates = [
    ("doc_refund_within_7d", "ขอคืนเงินเต็มจำนวนได้ภายใน 7 วันหลังรับสินค้า", 0.0323),
    ("doc_shipping_fee", "ค่าจัดส่งสินค้ามาตรฐาน 50 บาท ส่งฟรีเมื่อครบ 1,000 บาท", 0.0161),
    ("doc_refund_after_7d", "กรณียกเลิกหลัง 7 วัน ไม่สามารถคืนเงินได้ แต่เปลี่ยนเป็นเครดิตร้านค้าได้", 0.0159),
    ("doc_vip_warranty", "สมาชิก VIP รับประกันซ่อมฟรี 1 ปีหลังวันสั่งซื้อ", 0.0156),
]

for idx, (doc_id, _, rrf_score) in enumerate(stage1_candidates, start=1):
    print(f"Stage-1 #{idx} {doc_id:<22} rrf={rrf_score:.4f}")`,
        },
        output: `Stage-1 #1 doc_refund_within_7d   rrf=0.0323
Stage-1 #2 doc_shipping_fee       rrf=0.0161
Stage-1 #3 doc_refund_after_7d    rrf=0.0159
Stage-1 #4 doc_vip_warranty       rrf=0.0156`,
      },
      {
        title: "2 · ให้คะแนนคู่ (query, doc) ด้วย Cross-Encoder Scorer จำลอง",
        explain:
          "Cross-Encoder อ่านเงื่อนไข `หลัง 7 วัน` คู่กับ `ยกเลิก` และ `คืนเงิน` พร้อมกัน จึงให้คะแนน `doc_refund_after_7d` สูงสุด (`0.94`) ขณะที่ `doc_shipping_fee` ได้คะแนนต่ำมาก (`0.04`)",
        code: {
          language: "python",
          filename: "worked_rerank.py",
          code: `def mock_cross_encoder(query: str, docs: list[str]) -> list[float]:
    """จำลองคะแนน relevance (0..1) ของ bge-reranker-v2-m3 แบบ deterministic"""
    scores: list[float] = []
    wants_after_7 = "หลัง 7 วัน" in query
    for text in docs:
        score = 0.05
        if "คืนเงิน" in text:
            score += 0.45
        if wants_after_7 and "หลัง 7 วัน" in text:
            score += 0.44
        elif "ภายใน 7 วัน" in text:
            score += 0.12
        elif "ค่าจัดส่ง" in text:
            score = 0.04
        scores.append(round(score, 2))
    return scores


texts = [text for _, text, _ in stage1_candidates]
ce_scores = mock_cross_encoder(query, texts)
for (doc_id, _, _), score in zip(stage1_candidates, ce_scores):
    print(f"{doc_id:<22} ce_score={score:.2f}")`,
        },
        output: `doc_refund_within_7d   ce_score=0.62
doc_shipping_fee       ce_score=0.04
doc_refund_after_7d    ce_score=0.94
doc_vip_warranty       ce_score=0.05`,
      },
      {
        title: "3 · เรียงอันดับใหม่ กรองด้วย min_score และตัดเหลือ Top-2",
        explain:
          "เมื่อเรียงตามคะแนน Cross-Encoder จากมากไปน้อยและตัดเอกสารที่คะแนนต่ำกว่า `0.20` ทิ้ง `doc_refund_after_7d` พุ่งจากอันดับ 3 ขึ้นมาอันดับ 1 ทันที และเอกสารที่ไม่เกี่ยวอย่างค่าจัดส่งถูกคัดออกหมด",
        code: {
          language: "python",
          filename: "worked_rerank.py",
          code: `min_score = 0.20
top_n = 2

reranked = [
    (doc_id, score)
    for (doc_id, _, _), score in zip(stage1_candidates, ce_scores)
    if score >= min_score
]
reranked.sort(key=lambda item: (-item[1], item[0]))

for idx, (doc_id, score) in enumerate(reranked[:top_n], start=1):
    print(f"Stage-2 #{idx} {doc_id:<22} ce_score={score:.2f}")`,
        },
        output: `Stage-2 #1 doc_refund_after_7d    ce_score=0.94
Stage-2 #2 doc_refund_within_7d   ce_score=0.62`,
      },
    ],
    gotcha:
      "จุดสังเกต: โมเดล `BAAI/bge-reranker-v2-m3` คืนค่าดิบเป็น **logit** (อาจเป็นค่าติดลบ เช่น `-4.2` ถึง `+6.5`) ไม่ใช่ `0..1` เสมอไป หากต้องการตั้ง `min_score` แบบ `0..1` ให้แปลงผ่านฟังก์ชัน sigmoid (`1 / (1 + math.exp(-x))`) หรือจูน threshold จากคะแนนจริงของโมเดลที่ใช้",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างฟังก์ชัน `rerank_candidates` สำหรับท่อ 2-Stage Retrieval ที่จำกัดจำนวนผู้สมัคร (`max_candidates`), กรองด้วย `min_score`, เรียงลำดับแบบ deterministic และมี Fallback กลับไปใช้ลำดับ Stage 1 อัตโนมัติเมื่อ scorer ล่มหรือทำงานช้าเกินงบเวลา `timeout_ms`",
    requirements: [
      "ใช้ dataclass `Candidate(doc_id: str, text: str, stage1_score: float)` และ `RerankResult(docs: list[tuple[str, float]], used_fallback: bool, scored_count: int, elapsed_ms: float)` ตามไฟล์ starter",
      "ตรวจสอบอินพุตแบบ fail-fast: หาก `max_candidates <= 0` หรือ `top_n <= 0` หรือ `timeout_ms <= 0` ให้โยน `ValueError`",
      "ตัดรายการผู้สมัครเหลือ `candidates[:max_candidates]` ก่อนส่ง `texts` เข้า `scorer(query, texts)` (ถ้า `candidates` ว่างให้คืนลิสต์ว่างโดยไม่เรียก `scorer`)",
      "จับเวลาเรียก `scorer` ด้วย `time.perf_counter()`: หาก `scorer` โยน exception ใด ๆ หรือคืนจำนวนคะแนนไม่เท่ากับจำนวนผู้สมัครที่ส่งไป หรือใช้เวลาเกิน `timeout_ms` ให้ตั้ง `used_fallback=True` แล้วคืนผลตามลำดับ Stage 1 เดิมสูงสุด `top_n` ชิ้น (ใช้ `stage1_score` เป็นคะแนน)",
      "กรณีสำเร็จภายในงบเวลา ให้กรองเอกสารที่ `score < min_score` (เมื่อกำหนด `min_score`) เรียงตาม `(-score, doc_id)` และคืนสูงสุด `top_n` ชิ้นพร้อม `used_fallback=False`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day102.py",
      code: `from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Callable


@dataclass(frozen=True)
class Candidate:
    doc_id: str
    text: str
    stage1_score: float


@dataclass(frozen=True)
class RerankResult:
    docs: list[tuple[str, float]]
    used_fallback: bool
    scored_count: int
    elapsed_ms: float


ScorerFn = Callable[[str, list[str]], list[float]]


def rerank_candidates(
    query: str,
    candidates: list[Candidate],
    scorer: ScorerFn,
    *,
    max_candidates: int = 20,
    top_n: int = 5,
    min_score: float | None = None,
    timeout_ms: float = 250.0,
) -> RerankResult:
    """จัดอันดับผู้สมัครจาก Stage 1 ด้วย Cross-Encoder scorer พร้อม latency/error fallback"""
    # TODO: 1) validate max_candidates, top_n, timeout_ms
    # TODO: 2) จัดการกรณี candidates ว่าง และจำกัด pool ด้วย candidates[:max_candidates]
    # TODO: 3) เรียก scorer พร้อมจับเวลาและดัก exception / length mismatch / timeout
    # TODO: 4) กรอง min_score เรียง (-score, doc_id) และตัด top_n
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day102.py",
      code: `import time
import pytest
from exercise_day102 import Candidate, rerank_candidates


def _sample_candidates() -> list[Candidate]:
    return [
        Candidate("doc_within_7d", "คืนเงินได้ภายใน 7 วัน", 0.032),
        Candidate("doc_shipping", "ค่าจัดส่งมาตรฐาน 50 บาท", 0.016),
        Candidate("doc_after_7d", "ยกเลิกหลัง 7 วัน ไม่สามารถคืนเงินได้", 0.015),
        Candidate("doc_warranty", "รับประกันซ่อมฟรี 1 ปี", 0.014),
    ]


def test_reranker_promotes_exact_policy_and_filters_min_score():
    def scorer(_query: str, texts: list[str]) -> list[float]:
        return [0.60, 0.05, 0.95, 0.10]

    result = rerank_candidates(
        "ยกเลิกหลัง 7 วันคืนเงินได้ไหม",
        _sample_candidates(),
        scorer,
        top_n=3,
        min_score=0.20,
    )
    assert result.used_fallback is False
    assert result.scored_count == 4
    assert result.docs == [("doc_after_7d", 0.95), ("doc_within_7d", 0.60)]


def test_caps_candidates_before_calling_scorer():
    seen_lengths: list[int] = []

    def scorer(_query: str, texts: list[str]) -> list[float]:
        seen_lengths.append(len(texts))
        return [0.5 + i * 0.1 for i in range(len(texts))]

    result = rerank_candidates(
        "ทดสอบจำกัดจำนวน",
        _sample_candidates(),
        scorer,
        max_candidates=2,
        top_n=2,
    )
    assert seen_lengths == [2]
    assert result.scored_count == 2
    assert result.docs[0][0] == "doc_shipping"


def test_fallback_on_scorer_exception_preserves_stage1_order():
    def failing_scorer(_query: str, _texts: list[str]) -> list[float]:
        raise RuntimeError("rerank API 503")

    result = rerank_candidates(
        "คืนเงิน",
        _sample_candidates(),
        failing_scorer,
        top_n=2,
    )
    assert result.used_fallback is True
    assert result.docs == [("doc_within_7d", 0.032), ("doc_shipping", 0.016)]


def test_fallback_on_timeout_budget_exceeded():
    def slow_scorer(_query: str, texts: list[str]) -> list[float]:
        time.sleep(0.03)
        return [0.9 for _ in texts]

    result = rerank_candidates(
        "คืนเงิน",
        _sample_candidates(),
        slow_scorer,
        top_n=2,
        timeout_ms=10.0,
    )
    assert result.used_fallback is True
    assert result.elapsed_ms >= 10.0
    assert result.docs == [("doc_within_7d", 0.032), ("doc_shipping", 0.016)]


def test_invalid_arguments_and_empty_candidates():
    called = False

    def scorer(_query: str, texts: list[str]) -> list[float]:
        nonlocal called
        called = True
        return [0.5 for _ in texts]

    empty_res = rerank_candidates("คำถาม", [], scorer)
    assert empty_res.docs == []
    assert empty_res.used_fallback is False
    assert called is False

    with pytest.raises(ValueError):
        rerank_candidates("คำถาม", _sample_candidates(), scorer, max_candidates=0)
    with pytest.raises(ValueError):
        rerank_candidates("คำถาม", _sample_candidates(), scorer, top_n=0)
    with pytest.raises(ValueError):
        rerank_candidates("คำถาม", _sample_candidates(), scorer, timeout_ms=-5)
`,
    },
    selfCheck: [
      "จำกัด `pool = candidates[:max_candidates]` ก่อนส่งข้อความเข้า `scorer` เพื่อคุมต้นทุน `O(N)`",
      "กรณี `candidates` ว่าง คืนผลทันทีโดยไม่เสียรอบเรียก `scorer`",
      "เมื่อ `scorer` โยน exception, คืนจำนวนคะแนนไม่ครบ หรือใช้เวลาเกิน `timeout_ms` ระบบสลับใช้ลำดับ Stage 1 พร้อม `used_fallback=True`",
      "การเรียงอันดับใช้ `(-score, doc_id)` เพื่อไม่ให้ลำดับแกว่งเมื่อคะแนนเท่ากัน",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "แยก helper เล็ก ๆ สำหรับสร้าง fallback output เช่น `fallback_docs = [(c.doc_id, c.stage1_score) for c in pool[:top_n]]` จะช่วยให้โค้ดอ่านง่ายทั้งตอนจับ exception และตอนตรวจ timeout",
      },
      {
        body: "จับเวลาด้วย `start = time.perf_counter()` ก่อนเรียก `scorer(query, [c.text for c in pool])` แล้วคำนวณ `elapsed_ms = (time.perf_counter() - start) * 1000.0` ทันทีในบล็อก `except` และหลังเรียกเสร็จ",
      },
      {
        body: "โครงฟังก์ชันเกือบสมบูรณ์ — เหลือเติมส่วนกรอง `min_score` และการเรียง `(-score, doc_id)` ด้านล่าง",
        code: {
          language: "python",
          filename: "hint_day102.py",
          code: `def rerank_candidates(
    query: str,
    candidates: list[Candidate],
    scorer: ScorerFn,
    *,
    max_candidates: int = 20,
    top_n: int = 5,
    min_score: float | None = None,
    timeout_ms: float = 250.0,
) -> RerankResult:
    if max_candidates <= 0 or top_n <= 0 or timeout_ms <= 0:
        raise ValueError("max_candidates, top_n, and timeout_ms must be > 0")
    if not candidates:
        return RerankResult(docs=[], used_fallback=False, scored_count=0, elapsed_ms=0.0)

    pool = candidates[:max_candidates]
    fallback_docs = [(c.doc_id, c.stage1_score) for c in pool[:top_n]]
    start = time.perf_counter()
    try:
        scores = scorer(query, [c.text for c in pool])
    except Exception:
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        return RerankResult(docs=fallback_docs, used_fallback=True, scored_count=len(pool), elapsed_ms=elapsed_ms)

    elapsed_ms = (time.perf_counter() - start) * 1000.0
    if elapsed_ms > timeout_ms or len(scores) != len(pool):
        return RerankResult(docs=fallback_docs, used_fallback=True, scored_count=len(pool), elapsed_ms=elapsed_ms)

    # TODO: จับคู่ (c.doc_id, float(s)), กรอง min_score, เรียง (-score, doc_id), คืน [:top_n]
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
      title: "ส่งเอกสารมากเกินไปเข้า Cross-Encoder (เช่น Top-200)",
      symptom: "เวลาค้นหาพุ่งจาก 80 ms เป็นหลายวินาที และค่า API Rerank บานปลายทั้งที่คำตอบจริงมักอยู่ใน Top-20 อยู่แล้ว",
      fix: "จำกัด `max_candidates` ไว้ที่ 20–30 ชิ้นจาก Hybrid {{rrf}} แล้ววัด Recall@20 ก่อนตัดสินใจขยาย",
    },
    {
      title: "ใช้ค่า min_score แบบ 0..1 กับ Raw Logit ของโมเดล",
      symptom: "เอกสารที่เกี่ยวข้องถูกตัดทิ้งเกือบหมด หรือผ่านหมดทุกชิ้น เพราะโมเดลอย่าง `bge-reranker-v2-m3` คืนค่า logit ที่มีช่วงเป็นจำนวนจริง (ติดลบได้)",
      fix: "ตรวจสอบเอกสารของโมเดล/API ว่าคืน probability หรือ logit — หากเป็น logit ให้แปลงด้วย sigmoid หรือจูน threshold จากการกระจายคะแนนจริง",
    },
    {
      title: "ไม่มี Fallback เมื่อ Rerank API ช้าหรือคืน HTTP 503",
      symptom: "ระบบแชต {{rag}} ทั้งหมดล่มตาม Rerank API ทั้งที่ระบบมีรายการเอกสารจาก Hybrid Search อยู่แล้ว",
      fix: "ใส่ `timeout_ms` และ `try/except` เพื่อให้สลับกลับไปใช้ลำดับ Stage 1 อัตโนมัติพร้อมบันทึก flag `used_fallback` ลง log",
    },
    {
      title: "หวังให้ Reranker แก้ปัญหาเมื่อ Stage 1 หาเอกสารคำตอบไม่เจอเลย",
      symptom: "เปิดใช้ Cross-Encoder แล้วแต่คำถามรหัสเอกสารภาษาไทยยังตอบผิดเหมือนเดิม",
      fix: "Reranker จัดอันดับได้เฉพาะผู้สมัครที่ส่งมาให้เท่านั้น — ต้องตรวจ Recall@20 ของ Stage 1 (BM25 + Dense + Chunking) ก่อนเสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d102-q1",
        "เหตุใด Cross-Encoder Reranker จึงมักแยกเงื่อนไขอย่าง `\"ยกเลิกภายใน 7 วัน\"` กับ `\"ยกเลิกหลัง 7 วัน\"` ได้แม่นกว่า Bi-Encoder?",
        [
          ["เพราะ Cross-Encoder ใช้เวกเตอร์ที่มีมิติมากกว่า Bi-Encoder เสมอ", "Cross-Encoder ไม่ได้เปรียบเทียบเวกเตอร์แยกฝั่ง แต่คำนวณคะแนนความเกี่ยวข้องจากคู่ข้อความโดยตรง"],
          [
            "เพราะ Cross-Encoder ป้อน `(query, document)` เข้าโมเดลพร้อมกัน ทำให้ทุกโทเคนในคำถามทำ Attention กับทุกโทเคนในเอกสารได้โดยตรง",
            "ถูก — การอ่านคู่กันทำให้จับความสัมพันธ์เชิงเงื่อนไข คำปฏิเสธ และรายละเอียดตัวเลขได้คมกว่าการบีบเป็นเวกเตอร์แยกกัน",
          ],
          ["เพราะ Cross-Encoder เก็บเอกสารทั้งหมดไว้ในหน่วยความจำแบบ Hash Table", "ไม่จริง — Cross-Encoder คือโมเดล Transformer ที่คำนวณคะแนนคู่ข้อความแบบออนดีมานด์"],
          ["เพราะ Bi-Encoder ไม่สามารถประมวลผลข้อความภาษาไทยได้", "Multilingual Bi-Encoder ประมวลผลภาษาไทยได้ดี แต่ข้อจำกัดอยู่ที่การ encode แยกฝั่งกัน"],
        ],
        "B",
        "Cross-Encoder รับ `[CLS] query [SEP] doc [SEP]` พร้อมกัน จึงเกิด full cross-attention ระหว่างคำถามและเอกสาร ต่างจาก Bi-Encoder ที่บีบแต่ละฝั่งเป็นเวกเตอร์เดี่ยวก่อนเทียบ",
        "กลไกหลักที่ทำให้ Cross-Encoder แม่นกว่า Bi-Encoder คืออะไร?",
        "Cross-Encoder อ่าน (query, doc) พร้อมกันด้วย full attention ระหว่างโทเคนทั้งสองฝั่ง ไม่ได้บีบแยกเป็นเวกเตอร์ก่อนเหมือน Bi-Encoder",
      ),
      mc(
        "d102-q2",
        "ทำไมสถาปัตยกรรม Production RAG จึงไม่นำ Cross-Encoder ไปค้นหาตรง ๆ กับคลังเอกสาร 100,000 ชิ้น?",
        [
          ["เพราะ Cross-Encoder คืนผลได้มากสุดแค่ 5 เอกสารตามข้อจำกัดทางคณิตศาสตร์", "ไม่จริง — มันให้คะแนนได้กี่ชิ้นก็ได้ แต่ต้นทุนเวลาจะโตตามจำนวนเอกสาร"],
          ["เพราะ Cross-Encoder อ่านภาษาอังกฤษไม่ได้", "Cross-Encoder อย่าง bge-reranker-v2-m3 รองรับได้กว่า 100 ภาษารวมไทยและอังกฤษ"],
          [
            "เพราะ Cross-Encoder ไม่สามารถ pre-compute เวกเตอร์เอกสารล่วงหน้าได้ ต้องรันโมเดลกับทุกคู่ `(query, doc)` ซึ่งช้าเกินไปในสเกลแสนเอกสาร",
            "ถูก — จึงต้องใช้ Bi-Encoder/Hybrid RRF คัดเหลือ ~20 ผู้สมัครก่อน แล้วค่อยให้ Cross-Encoder จัดอันดับรอบสอง",
          ],
          ["เพราะฐานข้อมูลเวกเตอร์ไม่อนุญาตให้เก็บข้อความดิบ", "ฐานข้อมูลเวกเตอร์อย่าง Qdrant/pgvector เก็บ payload ข้อความได้ตามปกติ"],
        ],
        "C",
        "Cross-Encoder มีความซับซ้อนเวลาแบบ `O(N)` ต่อทุกคำถามเพราะต้องจับคู่กับคำถามใหม่เสมอ จึงเหมาะกับ Stage 2 (Top-20 → Top-5) เท่านั้น",
        "ทำไมต้องวาง Cross-Encoder ไว้เป็น Stage 2 (Top-20 → Top-5) แทนการค้นทั้งคลัง?",
        "Cross-Encoder pre-compute เวกเตอร์ล่วงหน้าไม่ได้ ต้องรันโมเดลต่อทุกคู่ (query, doc) จึงช้าเกินไปถ้าทำทั้งคลัง 100k ชิ้น",
      ),
      mc(
        "d102-q3",
        "หากเอกสารคำตอบที่ถูกต้อง **ไม่ติดอยู่ใน Top-20** ที่ส่งมาจาก Stage 1 (Hybrid RRF) การเพิ่ม Cross-Encoder Reranker จะช่วยอะไรได้บ้าง?",
        [
          ["ช่วยให้ Reranker ดึงเอกสารนั้นกลับมาจากฐานข้อมูลเองได้", "Reranker ไม่มีสิทธิ์ค้นฐานข้อมูล มันเห็นเฉพาะรายการผู้สมัครที่ส่งเข้ามา"],
          [
            "ช่วยไม่ได้สำหรับคำถามนั้น เพราะ Reranker จัดอันดับได้เฉพาะผู้สมัครที่ได้รับจาก Stage 1 เท่านั้น",
            "ถูก — นี่คือเหตุผลที่ต้องคุม Recall@20 ของ Stage 1 ให้สูงก่อนเสมอ",
          ],
          ["ช่วยให้คะแนน BM25 ของเอกสารนั้นเพิ่มขึ้นอัตโนมัติ", "Reranker ทำงานหลัง Stage 1 ไม่ได้แก้คะแนน BM25 ย้อนหลัง"],
          ["ช่วยลดขนาด chunk ของเอกสารนั้นลงครึ่งหนึ่ง", "Reranker ไม่ได้ทำหน้าที่ chunking เอกสาร"],
        ],
        "B",
        "ในท่อ 2-Stage Retrieval เพดาน Recall สูงสุดของระบบถูกกำหนดโดย Stage 1 (เช่น Recall@20) ส่วน Reranker ทำหน้าที่ยก Precision และ MRR ภายในกลุ่มผู้สมัครนั้น",
        "ถ้าเอกสารคำตอบหลุดจาก Top-20 ของ Stage 1 แล้ว Reranker จะช่วยหาเจอไหม?",
        "ไม่ได้ — Reranker จัดอันดับได้เฉพาะผู้สมัครที่ Stage 1 ส่งมาเท่านั้น จึงต้องทำให้ Recall@20 ของ Stage 1 สูงก่อน",
      ),
      mc(
        "d102-q4",
        "เมื่อ Rerank API ภายนอกเกิดหน่วงเกิน `250 ms` หรือคืนข้อผิดพลาด HTTP 503 แนวทางออกแบบระบบ Production RAG ที่เหมาะสมที่สุดคือข้อใด?",
        [
          ["หยุดการทำงานและคืน HTTP 500 ให้ผู้ใช้ทันทีทุกครั้ง", "ไม่ควรทำให้ระบบทั้งหมดล่มทั้งที่มีผลลัพธ์จาก Stage 1 พร้อมใช้งานแล้ว"],
          ["ขยาย `max_candidates` เป็น 100 แล้วลองส่งซ้ำ 5 รอบทันที", "การเพิ่มผู้สมัครและรีไทร์ถี่ ๆ ตอน API ช้าจะยิ่งทำให้ latency พุ่งและเกิด retry storm"],
          ["ส่งคลังเอกสารทั้งหมดเข้า prompt ของ LLM แทน", "เกิน context window และเปลืองต้นทุนมหาศาล"],
          [
            "Fallback กลับไปใช้ Top-5 ตามลำดับจาก Stage 1 (Hybrid RRF) ทันที พร้อมบันทึก telemetry ว่าเกิด fallback",
            "ถูก — เป็น Graceful Degradation ที่รักษา Availability และ SLA ของระบบได้โดยไม่เสียผลค้นหาหลัก",
          ],
        ],
        "D",
        "Reranker ควรถูกออกแบบให้ degrades gracefully กลับไปใช้ลำดับ Stage 1 เสมอเมื่อเกินงบเวลาหรือเกิด error พร้อมส่งสัญญาณเตือนผ่าน log/metrics",
        "เมื่อ Rerank API ล่มหรือช้าเกิน timeout ควรจัดการท่อ RAG อย่างไร?",
        "Fallback กลับไปใช้ Top-5 จาก Stage 1 (Hybrid RRF) ทันที เพื่อรักษาความพร้อมใช้งานและคุม latency พร้อมบันทึก flag fallback ลง log",
      ),
    ],
  },

  takeaways: [
    "**Bi-Encoder** เร็วและ pre-compute ได้ (เด่น Recall) ส่วน **Cross-Encoder** อ่าน `(query, doc)` พร้อมกันด้วย Full Attention (เด่น Precision และจับเงื่อนไขซับซ้อน)",
    "สถาปัตยกรรมมาตรฐานคือ **2-Stage Retrieval Funnel**: Hybrid {{rrf}} คัด Top-20 → Cross-Encoder {{reranker}} คัดเหลือ {{top-k|Top-5}}",
    "อย่าลืมเช็กสเกลคะแนนของโมเดล (raw logit vs sigmoid probability) ก่อนตั้งค่า `min_score`",
    "Production Reranker ต้องมี **3 ด่านป้องกัน**: `max_candidates`, `timeout_ms` และ **Graceful Fallback** กลับไปใช้ลำดับ Stage 1 เสมอ",
  ],

  reviewCards: [
    rc(
      "d102-rc-1",
      "อธิบายความต่างระหว่าง Bi-Encoder กับ Cross-Encoder ใน 2 ประโยค",
      "Bi-Encoder แปลง query และ doc เป็นเวกเตอร์แยกกันจึง pre-compute ได้และค้นเร็วมาก (เหมาะกับ Stage 1 Recall) ส่วน Cross-Encoder อ่าน (query, doc) พร้อมกันด้วย full attention จึงแม่นกว่ามากแต่ช้ากว่าเป็น O(N) (เหมาะกับ Stage 2 Rerank Top-20 → Top-5)",
    ),
    rc(
      "d102-rc-2",
      "ในท่อ 2-Stage Retrieval ทำไมจึงไม่ส่ง Top-200 เข้า Cross-Encoder และควรใส่ Guardrail อะไรบ้าง?",
      "เพราะ Cross-Encoder ใช้เวลาแปรผันตรงกับจำนวนคู่ (O(N)) ทำให้ latency และต้นทุนพุ่ง ควรจำกัด max_candidates (20–30), ตั้ง timeout_ms และ fallback กลับลำดับ Stage 1 (Hybrid RRF) เมื่อช้าหรือ error",
    ),
    rc(
      "d102-rc-3",
      "ถ้า Stage 1 (Hybrid RRF) มี Recall@20 = 0.65 การเปลี่ยน Reranker ที่เก่งขึ้นจะทำให้ Recall@5 เกิน 0.65 ได้หรือไม่?",
      "ไม่ได้ — เพดาน Recall ของ Reranker ถูกจำกัดด้วย Recall@20 ของ Stage 1 เพราะ Reranker จัดอันดับได้เฉพาะผู้สมัครที่ได้รับมาเท่านั้น",
    ),
  ],

  sources: [
    { label: "BAAI/bge-reranker-v2-m3 — Hugging Face Model Card", href: "https://huggingface.co/BAAI/bge-reranker-v2-m3" },
    { label: "Sentence-Transformers — Retrieve & Re-Rank Documentation", href: "https://www.sbert.net/examples/applications/retrieve_rerank/README.html" },
    { label: "Qdrant Documentation — Reranking in Hybrid Search", href: "https://qdrant.tech/documentation/concepts/hybrid-queries/" },
    { label: "Cohere Documentation — Rerank Overview & Best Practices", href: "https://docs.cohere.com/docs/rerank-overview" },
  ],

  glossary: ["reranker", "embedding", "rrf", "rag", "precision-recall", "mrr", "cosine-similarity", "top-k"],
});
