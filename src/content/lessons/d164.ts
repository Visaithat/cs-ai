import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D164 — Phase 6 / Block B41 (Milestone 2)
 * Retrieval Benchmark Verification Lab (Recall@5 >= 0.85)
 */
export const d164: Lesson = defineLesson({
  day: 164,
  titleTh: "Milestone 2: วัดผล Retrieval Benchmark ให้ Recall@5 >= 0.85",
  tagline: "30 นาที · Milestone 2 Lab · เทียบ Dense vs Hybrid RRF vs +Rerank และผ่า Failure Slices ภาษาไทยก่อนตัดสินใจ Ship",
  icon: "bar-chart-3",
  visual: {
    id: "retrieval-benchmark",
    title: "Benchmark 3 ขั้น: Dense Only → Hybrid RRF → +Cross-Encoder Rerank",
    caption: "กดเปรียบเทียบผล Recall@5 และ MRR บนชุดคำถามภาษาไทย 40 ข้อ เพื่อพาคะแนนข้ามเกณฑ์ 0.85",
    alt: "กราฟเปรียบเทียบ Recall@5 และ MRR ระหว่าง Dense, Hybrid และ Rerank",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP", "BM25", "RRF", "Cross-Encoder Reranker", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "คุณภาพ Data & Chunking กำหนดเพดานของ RAG",
      body: "ต่อให้ใช้ LLM รุ่นท็อปที่สุด หากขั้นตอน {{chunking}} ตัดตารางขาดครึ่ง หรือไม่ได้ตัดคำไทยด้วย {{pythainlp}} ก่อนทำ index ระบบก็จะค้นเอกสารที่ถูกต้องไม่เจอตั้งแต่ต้น",
      lessonNote: "Milestone 2 บังคับให้เราพิสูจน์ว่า ingestion และ index ของเอกสารสองภาษาค้นเจอชิ้นส่วนคำตอบจริง ก่อนนำไปต่อกับชั้น Generation",
    },
    {
      node: 2,
      heading: "ยกระดับการค้นหาแบบเป็นขั้นบันได (3-Stage Retrieval)",
      body: "การเปรียบเทียบ Dense {{embedding}} เดี่ยว ๆ กับ Hybrid ({{bm25}} + Dense ผ่าน {{rrf}}) และ +Cross-Encoder {{reranker}} ทำให้เห็นชัดว่าความซับซ้อนที่เพิ่มเข้ามาคุ้มค่ากับ latency หรือไม่",
      lessonNote: "วันนี้เราจำลองและวัดผลทั้ง 3 ขั้นบนชุดคำถามภาษาไทยเพื่อดูว่าแต่ละชิ้นดัน `Recall@5` และ {{mrr}} ขึ้นมากี่จุด",
    },
    {
      node: 3,
      heading: "Eval Gate ระดับ Retrieval: ผ่าน 0.85 และไม่มี Slice บอด",
      body: "ใน {{rag}} เราแยกวัด Retrieval ออกจาก Generation เสมอ เพราะถ้า `Recall@5` ต่ำกว่า 0.85 การไปจูน System Prompt ให้ตายก็แก้ปัญหาตอบผิดไม่ได้",
      lessonNote: "เราวัดทั้งคะแนนรวม (`Recall@5 >= 0.85`, {{mrr}}) และผ่าดูตาม slice (`code_switch`, `exact_id`, `table_policy`) บน {{golden-dataset}}",
    },
    {
      node: 6,
      heading: "ตัดสินใจ Ship หรือย้อนกลับไปซ่อม Chunking",
      body: "Milestone Day ไม่ใช่แค่รันสคริปต์ให้จบ แต่คือจุดตัดสินใจเชิงวิศวกรรมว่าผลปัจจุบันพร้อมส่งต่อไปสร้างชั้น Generation ใน B42 หรือต้องวนกลับไปปรับปรุงข้อมูลก่อน",
      lessonNote: "คุณจะได้ใช้ฟังก์ชันวินิจฉัย failure slice เพื่อตัดสินใจอย่างมีระบบระหว่างปรับ chunking, เพิ่มศัพท์เฉพาะลง tokenizer, หรือเซ็นผ่าน Milestone 2",
    },
  ],

  objectives: [
    "**คำนวณและตีความ** ค่า `Recall@5` และ {{mrr|MRR (Mean Reciprocal Rank)}} เพื่อแยกแยะปัญหา 'ค้นไม่เจอเลย' ออกจากปัญหา 'เจอแต่อยู่อันดับท้าย'",
    "**เปรียบเทียบผลลัพธ์** เชิงตัวเลขของ Retrieval 3 ขั้น (Dense Only → Hybrid {{rrf}} → +Cross-Encoder {{reranker}}) บนชุดคำถามภาษาไทยผสมอังกฤษ",
    "**ผ่า Failure Slices** (ไทยปนอังกฤษ, รหัสใบแจ้งหนี้, ตาราง) เพื่อตัดสินใจ Ship ต่อสู่ Block B42 หรือย้อนกลับไปแก้ {{chunking}} / {{pythainlp}} tokenization",
  ],

  prerequisites: [
    "สร้าง ingestion, token-aware chunking, PyThaiNLP BM25 และ Hybrid Search แล้วใน D161–D163",
    "เข้าใจแนวคิด Dense Embedding, BM25, RRF และ Cross-Encoder Reranking (Phase 4)",
    "ใช้งาน `uv` และ `pytest` เพื่อรันสคริปต์ประเมินผลแบบ deterministic ได้",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมไฟล์ benchmark และชุดเทสต์สำหรับ Milestone 2 ในรีโป Capstone เดิมของคุณ เพื่อให้รันซ้ำใน CI ได้ทุกครั้งที่แก้ chunking หรือ index",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p evals src tests
uv add --dev pytest ruff
uv run pytest --version`,
    steps: [
      ["dir", "ตรวจสอบว่ามีโฟลเดอร์ `evals/`, `src/`, `tests/` ในโปรเจกต์"],
      ["pytest", "รัน `uv run pytest --version` สำเร็จโดยไม่ต้องเชื่อมต่ออินเทอร์เน็ต"],
      ["gate", "พร้อมเขียนตัวคำนวณ `Recall@5`, `MRR` และ Failure Slice Gate"],
    ],
    note: "โค้ด Benchmark ของวันนี้รันแบบ offline 100% ด้วยผลการจัดอันดับจำลอง เพื่อให้คุณฝึกเขียนตัววัดผลและตรรกะตัดสินใจให้แม่นก่อนต่อกับฐานข้อมูลจริง",
  },

  concepts: [
    {
      id: "recall-and-mrr",
      title: "1 · Recall@5 และ MRR: ทำไมต้องดูคู่กันเสมอ",
      paragraphs: [
        "ในระบบ {{rag}} ที่ส่งเอกสาร Top-5 เข้า context ของ LLM ค่า **`Recall@5`** วัดว่าเอกสารคำตอบที่ถูกต้องติดอยู่ใน Top-5 กี่เปอร์เซ็นต์ (ถ้ามีเอกสารที่ต้องใช้อยู่ใน Top-5 ครบจะได้ 1.0, ไม่ติดเลยได้ 0.0) นี่คือตัวชี้วัด **เพดานความถูกต้อง** เพราะหากเอกสารไม่ติด Top-5 โมเดลจะไม่มีทางตอบถูกจากหลักฐานได้เลย",
        "ส่วน **{{mrr|MRR (Mean Reciprocal Rank)}}** วัดว่าเอกสารคำตอบชิ้นแรกโผล่มาที่อันดับเท่าไร (`1 / rank`: อันดับ 1 ได้ `1.0`, อันดับ 2 ได้ `0.5`, อันดับ 5 ได้ `0.2`, ไม่ติด Top-k ได้ `0.0`) การที่ `Recall@5` สูงแต่ `MRR` ต่ำ แปลว่าคำตอบมักไปกองอยู่อันดับ 4–5 ซึ่งเสี่ยงต่อปัญหา *Lost in the Middle* และเปลือง token",
      ],
      analogy: "`Recall@5` เหมือนการเช็กว่าหยิบเอกสารที่ต้องใช้ใส่แฟ้มมาครบไหม ส่วน `MRR` เหมือนการดูว่าเอกสารแผ่นที่สำคัญที่สุดถูกวางไว้หน้าสุดของแฟ้มหรือซ่อนอยู่แผ่นสุดท้าย",
      bullets: [
        "**`Recall@5 >= 0.85`**: เกณฑ์ขั้นต่ำของ Milestone 2 บนชุดคำถามภาษาไทย 40 ข้อ",
        "**`MRR`** ยิ่งเข้าใกล้ `1.0` ยิ่งดี — ช่วยลดโอกาสที่ LLM หลุดโฟกัสและเปิดทางให้ลด `top_k` เพื่อประหยัดค่า token ในอนาคต",
        "วัด Retrieval แยกจาก LLM เสมอ เพื่อรู้ทันทีว่าข้อผิดพลาดเกิดที่การค้นหาหรือการสรุปคำตอบ (ดูเพิ่มเรื่อง {{precision-recall}})",
      ],
      whyTitle: "Why this matters — อย่าโทษ Prompt เมื่อปัญหาอยู่ที่ Retrieval",
      whyParagraphs: [
        "มือใหม่จำนวนมากเห็น RAG ตอบผิดแล้วรีบไปแก้ System Prompt วนอยู่หลายวัน ทั้งที่ความจริงเอกสารคำตอบไม่ได้ติดอยู่ใน Top-5 ตั้งแต่แรก",
        "การทำ Milestone 2 Retrieval Benchmark ก่อนเริ่มเขียนชั้น Generation (B42) ช่วยตัดสาเหตุความผิดพลาดไปได้ครึ่งหนึ่งทันที",
      ],
    },
    {
      id: "three-stage-progression",
      title: "2 · ก้าวกระโดด 3 ขั้น: Dense → Hybrid RRF → +Cross-Encoder Rerank",
      paragraphs: [
        "**ขั้นที่ 1 (Dense Only)**: ใช้ Multilingual {{embedding}} ค้นผ่าน {{hnsw}} จับความหมายข้ามภาษาไทย-อังกฤษได้ดี เช่น *\"ขอเลื่อนจ่ายบิล\"* ตรงกับ *\"นโยบายขยายระยะเวลาชำระเงิน\"* แต่มักพลาดรหัสเฉพาะอย่าง `INV-2026-009`, รหัสมาตรา, หรือชื่อแบบฟอร์ม `ภ.พ.20`",
        "**ขั้นที่ 2 (Hybrid RRF)**: ผสาน Dense กับ {{bm25}} ที่ตัดคำไทยด้วย {{pythainlp}} (`newmm`) ผ่านสูตร **{{rrf|Reciprocal Rank Fusion}}**: `score(d) = Σ 1 / (k + rank_i(d))` (นิยมใช้ `k = 60`) จุดแข็งคือไม่ต้อง normalize สเกลคะแนนระหว่าง cosine similarity กับ BM25 และดึงเอกสารที่มีรหัสตรงเป๊ะกลับขึ้นมาได้ทันที",
        "**ขั้นที่ 3 (+Cross-Encoder Rerank)**: ดึงผู้สมัคร Top-20 จาก Hybrid แล้วส่งให้ {{reranker}} (เช่น `bge-reranker-v2-m3`) อ่านคู่ `(query, chunk)` พร้อมกันเพื่อจัดอันดับใหม่เหลือ Top-5 — แม้จะเพิ่ม latency ราว 100–250 ms แต่มักดันทั้ง `Recall@5` และ `MRR` ข้าม `0.85` ได้อย่างมีนัยสำคัญ",
      ],
      analogy: "Dense เหมือนบรรณารักษ์ที่จำเนื้อหาคร่าว ๆ เก่ง, BM25 เหมือนดัชนีคำสำคัญท้ายเล่มที่หาเลขรหัสเป๊ะ, RRF คือการรวมรายชื่อ 20 เล่มที่น่าจะใช่ที่สุด และ Reranker คือผู้เชี่ยวชาญที่หยิบ 20 เล่มนั้นมาเปิดอ่านเทียบกับคำถามทีละคู่แล้วคัด 5 เล่มที่ดีที่สุด",
      code: {
        language: "python",
        filename: "rrf_intuition.py",
        code: `def rrf_fuse(dense_ids: list[str], bm25_ids: list[str], k: int = 60) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}
    for rank, doc_id in enumerate(dense_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(bm25_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda item: (-item[1], item[0]))`,
        caption: "RRF ใช้แค่อันดับ (rank) ไม่ใช้คะแนนดิบ จึงทนทานต่อความต่างของสเกลระหว่าง Vector Search และ BM25",
      },
      whyTitle: "Why this matters — เพิ่มความซับซ้อนเมื่อตัวเลขพิสูจน์ว่าคุ้ม",
      whyParagraphs: [
        "ในการทำ Benchmark ให้บันทึกผลทั้ง 3 ขั้นเก็บเป็นตารางใน `README.md` เสมอ (เช่น Dense `0.70` → Hybrid RRF `0.83` → +Rerank `0.90`)",
        "ข้อมูลเปรียบเทียบนี้คือหลักฐานชั้นยอดเวลาถูกถามใน Defense ว่า *\"ทำไมต้องจ่าย latency เพิ่มเพื่อใส่ Reranker?\"*",
      ],
    },
    {
      id: "failure-slicing",
      title: "3 · ผ่า Failure Slices ภาษาไทย และเกณฑ์ตัดสินใจ Ship vs Fix",
      paragraphs: [
        "ค่าเฉลี่ย `Recall@5 = 0.85` บนคำถาม 40 ข้ออาจหลอกตาได้ ถ้ากลุ่มคำถามทั่วไปได้ `0.97` แต่กลุ่มคำถาม **ตารางอัตราค่าธรรมเนียม** หรือ **รหัสเอกสาร** ได้แค่ `0.50` ใน Production ลูกค้าจะเจอจุดบอดเดิมซ้ำ ๆ จนหมดความเชื่อถือ",
        "เราจึงต้องแปะแท็ก `slice` ให้ทุกข้อใน {{golden-dataset}} อย่างน้อย 4 กลุ่ม: `thai_faq` (คำถามนโยบายภาษาไทย), `code_switch` (ไทยปนอังกฤษ), `exact_id` (รหัสเอกสาร/ฟอร์ม), และ `table_policy` (ข้อมูลในตาราง/เอกสารยาว) แล้วตรวจทั้งค่าเฉลี่ยรวมและค่าต่ำสุดราย slice ก่อนอนุมัติ Ship",
      ],
      analogy: "เหมือนการตรวจสภาพรถยนต์ที่ต้องเช็กแยกทุกระบบ (เบรก ไฟ ยาง เครื่องยนต์) — ถึงคะแนนเฉลี่ยจะ 88/100 แต่ถ้าเบรกได้ 50/100 ก็ห้ามเอารถออกถนน",
      bullets: [
        "**ถ้า `exact_id` พัง**: ตรวจว่าตัดคำไทยด้วย {{pythainlp}} แล้วไม่หั่นรหัสอย่าง `INV-2026-009` กระจาย และตรวจน้ำหนัก BM25",
        "**ถ้า `table_policy` พัง**: ย้อนกลับไปแก้ {{chunking}} ให้คงหัวตาราง (table header) ไว้ในทุก chunk และใช้ token-aware size ตาม {{bpe-tokenizer}}",
        "**ถ้า `code_switch` พัง**: ตรวจโมเดล multilingual embedding หรือเปิด query normalization ที่ไม่ลบคำอังกฤษทิ้ง",
        "**อย่าลืม {{acl}}**: ทุกผล Benchmark ต้องรันพร้อม tenant/role filter เพื่อยืนยันว่าไม่ได้คะแนนดีเพราะดึงเอกสารข้ามสิทธิ์",
      ],
      whyTitle: "Why this matters — Error Analysis คืองานหลักของ AI Engineer",
      whyParagraphs: [
        "การดูแค่ตัวเลขรวมทำให้คุณเดาสุ่มว่าจะแก้อะไรต่อ แต่การผ่า failure slice ชี้ตรงไปที่ต้นตอภายใน 5 นาที — ลดรอบการลองผิดลองถูกได้มหาศาล",
        "เมื่อทั้งคะแนนรวมผ่าน `>= 0.85` และไม่มี slice ไหนร่วงหนัก คุณจึงพร้อมเซ็นผ่าน Milestone 2 และเดินหน้าสู่ Grounded Generation + MCP ใน Block B42",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Lighthouse Performance Audit สู่ Retrieval Benchmark",
      body: [
        "ในงาน Web Dev คุณไม่เดาว่าหน้าเว็บเร็วพอไหมด้วยการลองกดเปิดเอง 2 ครั้ง แต่ใช้ Lighthouse/WebPageTest วัด LCP/CLS แยกตามหน้า (Home, Checkout, Search) แล้วตั้งเกณฑ์ใน CI — Retrieval Benchmark คือสิ่งเดียวกันสำหรับระบบค้นหาของ AI",
      ],
      table: [
        ["Recall@5 & MRR", "Core Web Vitals (LCP / INP) สำหรับ Search"],
        ["Failure Slices (exact_id, table)", "แยกวัดผลตาม route (Mobile vs Desktop)"],
        ["Dense → RRF → Rerank", "Progressive Optimization วัดผลก่อน-หลังทุกขั้น"],
        ["Ship-or-Fix Milestone Gate", "Release Gate ก่อน merge ขึ้น main"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Recall@5 ถึงต่างจาก Accuracy ทั่วไป",
      body: [
        "ในวิชาเขียนโปรแกรมหรือ ML พื้นฐานเรามักคุ้นกับ Accuracy (ทายถูกกี่ข้อจากทั้งหมด) แต่ระบบค้นหาไม่ได้ตอบแค่ 1 ค่า มันคืนเอกสารมา **5 อันดับพร้อมกัน**",
        "`Recall@5` จึงถามง่าย ๆ ว่า *\"ใน 5 ชิ้นที่ดึงมา มีชิ้นที่เป็นเฉลยอยู่ด้วยไหม\"* ส่วน `MRR` ให้รางวัลเพิ่มเติมถ้าเฉลยอยู่อันดับที่ 1 มากกว่าอันดับที่ 5",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองรัน Benchmark 3 ขั้น (`dense` → `hybrid_rrf` → `hybrid_rerank`) บนชุดคำถามภาษาไทยจำลอง พร้อมผ่าคะแนนตาม failure slice เพื่อตัดสินใจ Ship หรือ Fix กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · เขียนฟังก์ชันคำนวณ Recall@k, Reciprocal Rank และ RRF",
        explain:
          "เริ่มจากฟังก์ชันวัดผลพื้นฐานที่ deterministic 100% — `recall_at_k` ตรวจสัดส่วนของเอกสารเฉลยที่ติด Top-k และ `rrf_fuse` ผสานผลจัดอันดับจาก Dense กับ BM25",
        code: {
          language: "python",
          filename: "worked_benchmark.py",
          code: `def recall_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    if not relevant:
        return 0.0
    hits = len(set(retrieved[:k]) & relevant)
    return hits / len(relevant)


def reciprocal_rank(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    for rank, doc_id in enumerate(retrieved[:k], start=1):
        if doc_id in relevant:
            return 1.0 / rank
    return 0.0


def rrf_fuse(dense: list[str], bm25: list[str], k: int = 60, top_n: int = 5) -> list[str]:
    scores: dict[str, float] = {}
    for rank, doc_id in enumerate(dense, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(bm25, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    ranked = sorted(scores.items(), key=lambda x: (-x[1], x[0]))
    return [doc_id for doc_id, _ in ranked[:top_n]]`,
        },
      },
      {
        title: "2 · เทียบคะแนน 3 ขั้นบนคำถามองค์กรไทยหลายประเภท",
        explain:
          "ชุดข้อมูลจำลอง 4 ข้อครอบคลุม 4 slices (`thai_faq`, `code_switch`, `exact_id`, `table_policy`) — สังเกตว่า `dense` พลาดข้อ `INV-2026-009` และตารางค่าธรรมเนียม แต่ `hybrid_rrf` และ `rerank` ดึงกลับขึ้นมาได้",
        code: {
          language: "python",
          filename: "worked_benchmark.py",
          code: `cases = [
    {
        "id": "Q1", "slice": "thai_faq", "relevant": {"pol-refund#2"},
        "dense": ["pol-refund#2", "faq-01#1", "pol-ship#1", "faq-02#1", "pol-tax#1"],
        "bm25": ["pol-refund#2", "pol-refund#1", "faq-01#1", "pol-ship#1", "pol-tax#1"],
        "rerank": ["pol-refund#2", "pol-refund#1", "faq-01#1", "pol-ship#1", "pol-tax#1"],
    },
    {
        "id": "Q2", "slice": "code_switch", "relevant": {"faq-sso#3"},
        "dense": ["faq-login#1", "faq-sso#3", "pol-sec#1", "faq-02#1", "pol-it#2"],
        "bm25": ["faq-sso#3", "faq-login#1", "pol-it#2", "pol-sec#1", "faq-02#1"],
        "rerank": ["faq-sso#3", "faq-login#1", "pol-sec#1", "pol-it#2", "faq-02#1"],
    },
    {
        "id": "Q3", "slice": "exact_id", "relevant": {"inv-2026-009#1"},
        "dense": ["pol-tax#1", "pol-billing#2", "faq-pay#1", "pol-refund#1", "faq-01#1"],
        "bm25": ["inv-2026-009#1", "pol-billing#2", "pol-tax#1", "faq-pay#1", "faq-01#1"],
        "rerank": ["inv-2026-009#1", "pol-billing#2", "pol-tax#1", "faq-pay#1", "faq-01#1"],
    },
    {
        "id": "Q4", "slice": "table_policy", "relevant": {"fee-table#4"},
        "dense": ["pol-ship#1", "fee-table#1", "faq-pay#1", "pol-billing#2", "faq-01#1"],
        "bm25": ["fee-table#1", "pol-ship#1", "fee-table#4", "faq-pay#1", "pol-billing#2"],
        "rerank": ["fee-table#4", "fee-table#1", "pol-ship#1", "faq-pay#1", "pol-billing#2"],
    },
]

for mode in ("dense", "hybrid_rrf", "rerank"):
    recalls, mrrs = [], []
    for c in cases:
        top5 = rrf_fuse(c["dense"], c["bm25"]) if mode == "hybrid_rrf" else c[mode]
        recalls.append(recall_at_k(top5, c["relevant"], k=5))
        mrrs.append(reciprocal_rank(top5, c["relevant"], k=5))
    print(f"{mode:11s} | Recall@5={sum(recalls)/len(recalls):.2f} | MRR={sum(mrrs)/len(mrrs):.2f}")`,
        },
        output: `dense       | Recall@5=0.50 | MRR=0.38
hybrid_rrf  | Recall@5=1.00 | MRR=0.69
rerank      | Recall@5=1.00 | MRR=1.00`,
      },
      {
        title: "3 · ผ่าผลราย Slice เพื่อเช็กจุดบอดก่อนเซ็นผ่าน Milestone 2",
        explain:
          "ตรวจสอบแต่ละ slice ของ `dense` เทียบกับ `rerank` — จะเห็นชัดว่าหากหยุดแค่ `dense` จะพังสนิทใน `exact_id` และ `table_policy` (`0.00`)",
        code: {
          language: "python",
          filename: "worked_benchmark.py",
          code: `for mode in ("dense", "rerank"):
    weak = [
        c["slice"]
        for c in cases
        if recall_at_k(c[mode], c["relevant"], k=5) < 0.85
    ]
    verdict = "SHIP_TO_B42" if not weak else f"FIX_FIRST ({', '.join(weak)})"
    print(f"{mode:7s} -> {verdict}")`,
        },
        output: `dense   -> FIX_FIRST (exact_id, table_policy)
rerank  -> SHIP_TO_B42`,
      },
    ],
    gotcha:
      "จุดสังเกต: ถ้าผล `hybrid_rrf` ได้ `Recall@5` สูงอยู่แล้วแต่ `MRR` ยังต่ำ (เช่น `0.55`) ให้ลองส่ง Top-20 จาก RRF เข้า Cross-Encoder Reranker — แต่ถ้าแม้แต่ Top-20 จาก RRF ยังไม่ติดเอกสารเฉลยเลย Reranker จะช่วยอะไรไม่ได้ คุณต้องย้อนไปแก้ **Chunking** หรือ **Thai Tokenization**",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/retrieval_benchmark.py` สำหรับใช้เป็น Automated Milestone 2 Gate ที่คำนวณ `Recall@5`, `MRR`, แยกคะแนนราย slice และสรุปคำแนะนำ Ship/Fix",
    requirements: [
      "`rrf_merge(dense_rank: list[str], bm25_rank: list[str], k: int = 60, top_n: int = 5) -> list[str]` — รวมผลด้วย Reciprocal Rank Fusion (`1 / (k + rank)`) และถ้าคะแนนเท่ากันให้เรียงตาม `doc_id` (ascending) เพื่อผลลัพธ์ deterministic",
      "`evaluate_retrieval(cases: list[dict], k: int = 5, target_recall: float = 0.85) -> dict` — แต่ละ case มี `id`, `slice`, `relevant` (`list[str]` หรือ `set[str]`), `retrieved` (`list[str]`); คืน dict ที่มี `recall_at_k`, `mrr`, `by_slice` (`{slice: {\"recall_at_k\": ..., \"mrr\": ..., \"count\": ...}}`), `missed_case_ids` (กรณี recall < 1.0), และ `passed_gate` (`recall_at_k >= target_recall`)",
      "`find_weak_slices(report: dict, min_slice_recall: float = 0.75) -> list[str]` — คืนชื่อ slice ที่ `recall_at_k < min_slice_recall` เรียงจาก recall ต่ำสุดไปสูงสุด (ถ้าเท่ากันเรียงตามชื่อ slice)",
      "กรณี `cases` ว่าง ให้โยน `ValueError(\"cases must not be empty\")` แบบ fail-fast",
    ],
    starter: {
      language: "python",
      filename: "src/retrieval_benchmark.py",
      code: `from collections import defaultdict


def rrf_merge(
    dense_rank: list[str],
    bm25_rank: list[str],
    k: int = 60,
    top_n: int = 5,
) -> list[str]:
    # TODO: คำนวณ RRF และคืน top_n doc_ids (tie-break ด้วย doc_id)
    raise NotImplementedError


def evaluate_retrieval(
    cases: list[dict],
    k: int = 5,
    target_recall: float = 0.85,
) -> dict:
    # TODO: คำนวณ recall_at_k, mrr, by_slice, missed_case_ids, passed_gate
    raise NotImplementedError


def find_weak_slices(report: dict, min_slice_recall: float = 0.75) -> list[str]:
    # TODO: คืนรายชื่อ slice ที่ต่ำกว่า min_slice_recall เรียงจากแย่สุดไปดีสุด
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_retrieval_benchmark.py",
      code: `import pytest
from src.retrieval_benchmark import evaluate_retrieval, find_weak_slices, rrf_merge


def test_rrf_merge_promotes_shared_docs_and_is_deterministic():
    dense = ["doc-a", "doc-b", "doc-c"]
    bm25 = ["doc-c", "doc-b", "doc-d"]
    merged = rrf_merge(dense, bm25, k=60, top_n=3)
    assert merged[0] == "doc-b"
    assert set(merged) == {"doc-b", "doc-c", "doc-a"}


def test_evaluate_retrieval_passing_gate():
    cases = [
        {"id": "Q1", "slice": "thai_faq", "relevant": ["d1"], "retrieved": ["d1", "d2", "d3"]},
        {"id": "Q2", "slice": "code_switch", "relevant": ["d4"], "retrieved": ["d9", "d4", "d2"]},
        {"id": "Q3", "slice": "exact_id", "relevant": ["d5"], "retrieved": ["d5", "d1", "d2"]},
        {"id": "Q4", "slice": "table_policy", "relevant": ["d7"], "retrieved": ["d2", "d3", "d7"]},
    ]
    report = evaluate_retrieval(cases, k=5, target_recall=0.85)
    assert report["recall_at_k"] == pytest.approx(1.0)
    assert report["mrr"] == pytest.approx((1.0 + 0.5 + 1.0 + 1 / 3) / 4)
    assert report["missed_case_ids"] == []
    assert report["passed_gate"] is True


def test_evaluate_retrieval_detects_weak_slices_even_near_gate():
    cases = [
        {"id": "Q1", "slice": "thai_faq", "relevant": ["d1"], "retrieved": ["d1"]},
        {"id": "Q2", "slice": "thai_faq", "relevant": ["d2"], "retrieved": ["d2"]},
        {"id": "Q3", "slice": "exact_id", "relevant": ["d3"], "retrieved": ["d9"]},
        {"id": "Q4", "slice": "table_policy", "relevant": ["d4"], "retrieved": ["d4"]},
        {"id": "Q5", "slice": "table_policy", "relevant": ["d5"], "retrieved": ["d8"]},
    ]
    report = evaluate_retrieval(cases, k=5, target_recall=0.85)
    assert report["recall_at_k"] == pytest.approx(0.60)
    assert report["passed_gate"] is False
    assert report["missed_case_ids"] == ["Q3", "Q5"]
    assert find_weak_slices(report, min_slice_recall=0.75) == ["exact_id", "table_policy"]


def test_multi_relevant_partial_recall():
    cases = [
        {"id": "Q1", "slice": "table_policy", "relevant": ["d1", "d2"], "retrieved": ["d1", "d9"]},
    ]
    report = evaluate_retrieval(cases, k=2, target_recall=0.85)
    assert report["recall_at_k"] == pytest.approx(0.5)
    assert report["mrr"] == pytest.approx(1.0)
    assert report["missed_case_ids"] == ["Q1"]


def test_empty_cases_raises_value_error():
    with pytest.raises(ValueError):
        evaluate_retrieval([])
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านทั้ง 5 test cases ใน `tests/test_retrieval_benchmark.py`",
      "ทดสอบรันกับผลจริงจาก Hybrid Retrieval Module ของคุณ (40 ข้อ) และเช็กว่า `passed_gate` เป็น `True`",
      "ตรวจผล `find_weak_slices(report)` เพื่อดูว่าไม่มี slice ไหน (เช่น `exact_id`, `table_policy`) ต่ำกว่า `0.75`",
      "บันทึกตารางเปรียบเทียบ `Dense` vs `Hybrid RRF` vs `+Rerank` เก็บไว้ใน `README.md` สำหรับวัน Defense",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "สำหรับแต่ละ case ให้แปลง `relevant` เป็น `set` แล้วตัด `retrieved[:k]` ก่อนคำนวณทั้ง `hits / len(relevant)` และหา rank แรกที่ `doc_id in relevant` เพื่อคิด `1.0 / rank`",
      },
      {
        body: "ใช้ `defaultdict(list)` เก็บ `(recall, rr)` แยกตาม `case[\"slice\"]` เพื่อคำนวณค่าเฉลี่ยของแต่ละ slice ใน `by_slice` และใช้ `sorted(..., key=lambda s: (by_slice[s][\"recall_at_k\"], s))` ใน `find_weak_slices`",
      },
      {
        body: "โครงของ `evaluate_retrieval` — เติมส่วนคำนวณ `by_slice` และ `find_weak_slices` ให้สมบูรณ์แล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def evaluate_retrieval(cases: list[dict], k: int = 5, target_recall: float = 0.85) -> dict:
    if not cases:
        raise ValueError("cases must not be empty")
    total_recall, total_rr = 0.0, 0.0
    missed: list[str] = []
    slice_rows: dict[str, list[tuple[float, float]]] = defaultdict(list)

    for case in cases:
        rel = set(case["relevant"])
        top_k = case["retrieved"][:k]
        rec = (len(set(top_k) & rel) / len(rel)) if rel else 0.0
        rr = next((1.0 / i for i, doc in enumerate(top_k, 1) if doc in rel), 0.0)
        total_recall += rec
        total_rr += rr
        if rec < 1.0:
            missed.append(case["id"])
        slice_rows[case["slice"]].append((rec, rr))

    avg_recall = total_recall / len(cases)
    avg_rr = total_rr / len(cases)
    # TODO: สร้าง by_slice จาก slice_rows และคืน dict ที่มี passed_gate
`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_retrieval_benchmark.py
uv run ruff check .`,
      caption: "เพิ่มสคริปต์นี้เป็น step ใน GitHub Actions เพื่อตรวจ retrieval regression อัตโนมัติ",
    },
  },

  mistakes: [
    {
      title: "ใส่ Reranker แต่ดึง candidate จาก RRF มาแค่ Top-5",
      symptom: "ใส่ Cross-Encoder Reranker แล้ว `MRR` ดีขึ้นนิดหน่อย แต่ `Recall@5` เท่าเดิมเป๊ะ ไม่ขยับเลย",
      fix: "Reranker จัดอันดับใหม่ได้เฉพาะเอกสารที่ส่งเข้าไปเท่านั้น — ต้องดึง Top-20 หรือ Top-30 จาก Hybrid RRF แล้วค่อย rerank คัดลงมาเหลือ Top-5",
    },
    {
      title: "วัด Retrieval Benchmark โดยลืมใส่ชุดคำถามที่ยาก (Code-Switching, Invoice ID, ตาราง)",
      symptom: "ได้ `Recall@5 = 0.95` ตอนทดสอบเอง แต่พอใช้งานจริงลูกค้าถามเลขใบแจ้งหนี้หรือเงื่อนไขในตารางแล้วหาไม่เจอ",
      fix: "ออกแบบ Golden Dataset 40 ข้อให้กระจายครบทุก slice ยาก และตรวจคะแนนราย slice เสมอ ไม่ดูแค่ค่าเฉลี่ยรวม",
    },
    {
      title: "ใช้ whitespace `.split()` ทำ BM25 กับเอกสารภาษาไทย",
      symptom: "คะแนน Hybrid RRF แทบไม่ต่างจาก Dense Only เพราะทั้งย่อหน้าภาษาไทยถูกมองเป็น 1 token ยาว ๆ",
      fix: "ตัดคำไทยทั้งฝั่ง indexing และฝั่ง query ด้วย {{pythainlp}} (`word_tokenize(..., engine=\"newmm\")`) พร้อมคงรูปแบบรหัสอังกฤษ/ตัวเลขไว้ไม่ให้แตก",
    },
    {
      title: "ปิด ACL filter ตอนทำ Benchmark แล้วเปิดทีหลังตอน Production",
      symptom: "ผล Benchmark สวยงาม แต่เมื่อเปิด {{acl}} filter ใน Production จำนวนเอกสารที่ผ่าน filter น้อยลงจน `Recall@5` ตกฮวบ",
      fix: "ทดสอบ Retrieval พร้อม metadata/ACL filter เสมอ (pre-filtering ใน pgvector/Qdrant) เพื่อให้ตัวเลขสะท้อนสภาพจริง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d164-q1",
        "ระบบของคุณได้ `Recall@5 = 0.72` บนชุดคำถามภาษาไทย 40 ข้อ แต่เมื่อดูเฉพาะ Top-20 จาก Hybrid RRF พบว่า `Recall@20 = 0.92` ขั้นตอนใดน่าจะแก้ปัญหาได้ตรงจุดที่สุด?",
        [
          ["เพิ่ม Cross-Encoder Reranker เพื่อจัดอันดับ Top-20 ลงมาเป็น Top-5", "ถูก — เอกสารคำตอบถูกดึงมาอยู่ใน Top-20 แล้ว (0.92) แค่หลุดจาก Top-5 การใส่ Reranker จะดันเอกสารที่ตรงคำถามขึ้นมา Top-5 ได้ตรงจุด"],
          ["เปลี่ยน System Prompt ของ LLM ให้ตอบสั้นลง", "System Prompt ทำงานหลังการค้นหา ไม่ได้ช่วยให้เอกสารที่หลุด Top-5 กลับเข้ามา"],
          ["ลด `top_k` ของ Hybrid RRF จาก 20 เหลือ 3", "ยิ่งลด candidate ยิ่งทำให้เอกสารคำตอบหายมากขึ้น"],
          ["เปลี่ยนจาก FastAPI ไปใช้ Flask", "เว็บเฟรมเวิร์กไม่มีผลต่อคุณภาพการจัดอันดับของ Retrieval"],
        ],
        "A",
        "เมื่อ Recall@20 สูง (0.92) แต่ Recall@5 ต่ำ (0.72) แสดงว่า Retriever หาเจอแล้วแต่จัดอันดับไม่แม่นพอ — Cross-Encoder Reranker คือตัวแก้ที่ตรงจุดที่สุด",
        "ถ้า Recall@20 = 0.92 แต่ Recall@5 = 0.72 ควรแก้ด้วยวิธีใด และถ้า Recall@20 ก็ต่ำ (0.65) ด้วยควรแก้ที่ไหน?",
        "ถ้า Recall@20 สูงแต่ Recall@5 ต่ำ → ใส่ Cross-Encoder Reranker; ถ้า Recall@20 ต่ำด้วย → ย้อนไปแก้ Chunking, PyThaiNLP BM25 tokenization หรือ Embedding model",
      ),
      mc(
        "d164-q2",
        "คำถามข้อหนึ่งมีเอกสารเฉลย 1 ชิ้น (`doc-X`) ระบบดึงมาได้ Top-5 คือ `[\"doc-1\", \"doc-2\", \"doc-X\", \"doc-4\", \"doc-5\"]` ค่า `Recall@5` และ `Reciprocal Rank` ของข้อนี้คือเท่าไร?",
        [
          ["Recall@5 = 0.33, Reciprocal Rank = 1.00", "สลับกัน — Recall@5 ตรวจแค่ว่าติดใน Top-5 หรือไม่ (1/1 = 1.0) ส่วน Reciprocal Rank คือ 1/rank"],
          ["Recall@5 = 1.00, Reciprocal Rank = 0.33", "ถูก — `doc-X` ติดอยู่ใน Top-5 ครบ 1/1 ชิ้น (`Recall@5 = 1.00`) และอยู่อันดับที่ 3 (`1/3 ≈ 0.33`)"],
          ["Recall@5 = 0.60, Reciprocal Rank = 0.60", "ไม่ตรงนิยาม — rank ที่ 3 ไม่ได้คำนวณเป็น 3/5"],
          ["Recall@5 = 1.00, Reciprocal Rank = 3.00", "Reciprocal Rank คือส่วนกลับ `1 / rank` จึงมีค่าอยู่ระหว่าง 0 ถึง 1 เสมอ"],
        ],
        "B",
        "`doc-X` ปรากฏใน Top-5 จึงได้ `Recall@5 = 1.00` และอยู่ที่ตำแหน่งที่ 3 จึงได้ `Reciprocal Rank = 1 / 3 ≈ 0.33`",
        "หากเอกสารเฉลยชิ้นเดียวอยู่อันดับที่ 4 ใน Top-5 ค่า Recall@5 และ Reciprocal Rank เท่ากับเท่าไร?",
        "Recall@5 = 1.00 (ติดอยู่ใน Top-5) และ Reciprocal Rank = 1/4 = 0.25",
      ),
      mc(
        "d164-q3",
        "เหตุใดสูตร Reciprocal Rank Fusion (`RRF`: `1 / (k + rank)`) จึงนิยมใช้รวมผล Dense Vector Search กับ BM25 มากกว่าการเอาคะแนนดิบมาบวกกันตรง ๆ?",
        [
          ["เพราะ RRF ทำให้ไม่ต้องใช้ `PyThaiNLP` ตัดคำภาษาไทย", "ไม่จริง — BM25 ยังต้องตัดคำภาษาไทยให้ถูกก่อนจึงจะได้อันดับที่ดีส่งเข้า RRF"],
          ["เพราะ Cosine Similarity (0–1) และคะแนน BM25 (ไม่จำกัดขอบบน) มีคนละสเกลกัน การใช้ rank ทำให้รวมผลได้เสถียรโดยไม่ต้อง normalize คะแนนดิบ", "ถูก — RRF อาศัยแค่อันดับ (rank) จึงไม่ถูกครอบงำโดยระบบที่มีช่วงคะแนนกว้างกว่า"],
          ["เพราะ RRF ลดจำนวน token ของเอกสารลงครึ่งหนึ่ง", "RRF จัดอันดับเอกสาร ไม่ได้ย่อเนื้อหาหรือลด token"],
          ["เพราะ RRF ทำงานแทน Access Control (ACL) ได้ในตัว", "RRF ไม่ได้เช็กสิทธิ์ผู้ใช้ — ต้องทำ ACL filtering แยกเสมอ"],
        ],
        "B",
        "BM25 และ Cosine Similarity มีการกระจายตัวและช่วงคะแนนต่างกันมาก การฟิวชันด้วยอันดับ (RRF) จึงเรียบง่าย เสถียร และไม่ต้องจูนตัวคูณสเกลที่พังง่ายเมื่อ corpus เปลี่ยน",
        "ทำไม RRF ถึงเหมาะกับการรวมผล Dense Vector Search และ BM25 มากกว่าการบวกคะแนนดิบตรง ๆ?",
        "เพราะทั้งสองระบบมีสเกลคะแนนต่างกัน (Cosine 0..1 vs BM25 ไม่มีขอบบนตายตัว) RRF ใช้เฉพาะอันดับ (1/(k+rank)) จึงรวมผลได้เสถียรโดยไม่ต้อง normalize",
      ),
      mc(
        "d164-q4",
        "หลังรัน Milestone 2 Benchmark คุณได้ `Recall@5` รวม `0.86` (ผ่านเกณฑ์ 0.85) แต่เมื่อผ่าตาม slice พบว่า `table_policy` ได้แค่ `0.45` การตัดสินใจเชิงวิศวกรรมข้อใดดีที่สุด?",
        [
          ["ปล่อยผ่านทันทีเพราะค่าเฉลี่ยรวมเกิน 0.85 แล้ว ไม่ต้องสนใจ slice ย่อย", "อันตราย — ผู้ใช้ที่ถามเรื่องตารางราคา/ค่าธรรมเนียมจะเจอคำตอบผิดเกินครึ่งหนึ่ง"],
          ["ลบคำถามกลุ่ม `table_policy` ออกจากชุดทดสอบเพื่อให้คะแนนสวยขึ้น", "ห้ามโกง benchmark — นั่นคือการหลอกตัวเองและปล่อยบั๊กขึ้น Production"],
          ["เปิดดู chunk ที่พังในกลุ่ม `table_policy` เพื่อแก้การ parse/chunking ตาราง (เช่น คงหัวตารางไว้ในทุก chunk) แล้วรัน benchmark ซ้ำ", "ถูก — Error analysis ราย slice ชี้ตรงไปที่ต้นตอการตัดตาราง แก้แล้วจะทำให้ระบบแข็งแรงขึ้นจริง"],
          ["เพิ่ม `temperature` ของ LLM เป็น `1.0` เพื่อให้เดาตารางได้แม่นขึ้น", "`temperature` สูงยิ่งเพิ่มอาการหลอน และไม่เกี่ยวกับปัญหา Retrieval"],
        ],
        "C",
        "ค่าเฉลี่ยรวมที่ผ่านเกณฑ์ไม่ได้แปลว่าระบบปลอดภัยหากมี slice สำคัญพังหนัก การตรวจดู bad chunks ใน `table_policy` และซ่อมการ parse/chunking คือแนวทางที่ถูกต้อง",
        "ถ้า Recall@5 รวมได้ 0.86 แต่ slice `table_policy` ได้ 0.45 ควรทำอย่างไร?",
        "ยังไม่ควรเพิกเฉย — ให้ inspect chunk ที่พังใน `table_policy` เพื่อแก้การ parse/chunking ตาราง (เช่น รักษา header ไว้กับแถวข้อมูล) แล้วรัน benchmark ใหม่",
      ),
    ],
  },

  takeaways: [
    "วัด Retrieval แยกจาก Generation เสมอด้วย `Recall@5` (ติด Top-5 ไหม) คู่กับ {{mrr}} (อยู่อันดับสูงแค่ไหน)",
    "บันทึกผลแบบ 3 ขั้น (`Dense Only` → `Hybrid RRF` + {{pythainlp}} {{bm25}} → `+Cross-Encoder Rerank`) เพื่อพิสูจน์ความคุ้มค่าของทุกชั้น",
    "อย่าดูแค่ค่าเฉลี่ยรวม — ผ่า Failure Slices (`thai_faq`, `code_switch`, `exact_id`, `table_policy`) เพื่อหาต้นตอระหว่าง {{chunking}}, tokenization หรือ reranking",
    "ดึง Top-20 จาก Hybrid RRF เข้า {{reranker}} ก่อนคัดเหลือ Top-5 เสมอ และรันทดสอบพร้อม {{acl}} filter",
  ],

  reviewCards: [
    rc(
      "d164-rc-1",
      "`Recall@5` และ `MRR` วัดคุณภาพของ Retrieval ต่างกันอย่างไร?",
      "Recall@5 วัดว่าเอกสารเฉลยติดอยู่ใน Top-5 กี่สัดส่วน (เพดานความถูกต้องของ RAG) ส่วน MRR วัดว่าเอกสารเฉลยชิ้นแรกอยู่อันดับสูงแค่ไหน (1/rank)",
    ),
    rc(
      "d164-rc-2",
      "แยกแยะได้อย่างไรว่าควร 'ใส่ Reranker' หรือควร 'ย้อนไปแก้ Chunking / BM25'?",
      "ดู Recall@20 เทียบกับ Recall@5: ถ้า Recall@20 สูงแต่ Recall@5 ต่ำ → ใส่ Reranker; ถ้า Recall@20 ก็ต่ำด้วย → แก้ Chunking, การ parse ตาราง, หรือ PyThaiNLP BM25",
    ),
    rc(
      "d164-rc-3",
      "4 Failure Slices สำคัญที่ควรแยกวัดใน Benchmark เอกสารองค์กรภาษาไทยคืออะไร?",
      "thai_faq (คำถามนโยบายไทย), code_switch (ไทยปนอังกฤษ), exact_id (รหัสเอกสาร/ใบแจ้งหนี้), และ table_policy (ข้อมูลในตาราง/เอกสารยาว)",
    ),
  ],

  sources: [
    { label: "PyThaiNLP Documentation", href: "https://pythainlp.github.io/docs/" },
    { label: "Qdrant Documentation — Hybrid Queries", href: "https://qdrant.tech/documentation/" },
    { label: "pgvector — Vector Similarity Search for Postgres", href: "https://github.com/pgvector/pgvector" },
    { label: "Ragas Documentation — Retrieval Metrics", href: "https://docs.ragas.io/" },
  ],

  glossary: ["rag", "pythainlp", "bm25", "rrf", "reranker", "mrr", "chunking", "golden-dataset"],
});
