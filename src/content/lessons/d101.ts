import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D101 — Phase 4 / Block B26
 * Hybrid Search Fusion (Reciprocal Rank Fusion — RRF)
 */
export const d101: Lesson = defineLesson({
  day: 101,
  titleTh: "ผสานผลค้นหาไทย-อังกฤษด้วย Hybrid Search และ Reciprocal Rank Fusion (RRF)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · รวมพลัง BM25 + Dense Vector แบบไม่ต้องปรับสเกลคะแนนดิบ",
  icon: "layers",
  visual: {
    id: "hybrid-rrf",
    title: "Hybrid Search + Reciprocal Rank Fusion (BM25 + Dense Vector)",
    caption: "ปรับค่า k หรือเลือกคำถามไทยปนอังกฤษเพื่อดูว่า RRF ผสานอันดับคำตรงตัวกับความหมายอย่างไร",
    alt: "แผนภาพการรวมอันดับ BM25 และ Dense Vector ด้วยสูตร RRF",
  },
  requiresApiKey: false,
  tools: ["Python 3.12", "PyThaiNLP", "rank_bm25", "Qdrant / pgvector", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "คำถามจริงในไทยปนทั้งรหัสและคำพ้องความหมาย",
      body: "ผู้ใช้พิมพ์คำถามแบบ code-switching เช่น `\"ขอเช็ก status order #INV-2026-009 ที่ค้างชำระหน่อย\"` ซึ่งมีทั้งรหัสเอกสารเป๊ะ ๆ และบริบทความหมายภาษาไทย",
      lessonNote: "วันนี้เราผสานดัชนีสองชุด — {{bm25}} (ตัดคำด้วย {{pythainlp}}) และ Dense {{embedding}} — เพื่อไม่ให้พลาดทั้งรหัสและความหมาย",
    },
    {
      node: 2,
      heading: "ดึงบริบทให้แม่นก่อนส่งเข้า LLM",
      body: "ถ้าเอกสารที่ถูกต้องหลุดจาก top-k ที่ส่งเข้า prompt ต่อให้โมเดลฉลาดแค่ไหนก็ตอบไม่ได้หรือเกิด hallucination",
      lessonNote: "{{rrf}} ดันเอกสารที่ติดอันดับต้นจากทั้งสองแหล่งขึ้นบนสุด ก่อนส่งต่อไปให้ {{reranker}} คัดละเอียดใน Day 102",
    },
    {
      node: 3,
      heading: "วัดคุณภาพการค้นคืนแบบ Deterministic",
      body: "ก่อนเสียค่า API ประเมินคำตอบ LLM เราวัดชั้น Retrieval ได้ฟรีและเร็วด้วย Recall@k และ {{mrr}}",
      lessonNote: "ใน Day 104 คุณจะนำฟังก์ชัน RRF จากวันนี้ไปเทียบ Recall@5 ระหว่าง Dense อย่างเดียว vs Hybrid RRF",
    },
    {
      node: 4,
      heading: "ชั้น Retriever ที่เสถียรในแอป RAG",
      body: "คะแนนจาก BM25 กับ {{cosine-similarity}} อยู่คนละหน่วยกัน การบวกตรง ๆ พังง่ายเมื่อข้อมูลเปลี่ยน",
      lessonNote: "RRF ใช้เพียงลำดับอันดับ (`rank`) จึงไม่ต้องจูนค่า normalize ให้เปราะบางเมื่อเพิ่มเอกสารใหม่เข้าคลัง {{rag}}",
    },
  ],

  objectives: [
    "**อธิบายเหตุผล** ที่คำถามไทยปนอังกฤษ (code-switching) พลาดได้เมื่อใช้ Dense Vector หรือ {{bm25}} เพียงอย่างเดียว",
    "**เขียนฟังก์ชัน** {{rrf}} (`1 / (k + rank)`) ด้วย Pure Python ที่รองรับน้ำหนัก (weights), การกัน doc ซ้ำ และการเรียง tie-break อย่างคงเส้นคงวา",
    "**วิเคราะห์ผล** ของค่าพารามิเตอร์ `k` ต่อการจัดอันดับเอกสาร และวางตำแหน่งของ RRF ในท่อ Hybrid {{rag}} ร่วมกับ {{reranker}}",
  ],

  prerequisites: [
    "เข้าใจ {{bm25}} และการตัดคำไทยด้วย {{pythainlp}} (แนะนำ Day 99)",
    "เข้าใจ Dense {{embedding}} และ {{cosine-similarity}} (แนะนำ Day 38, Day 69)",
    "เขียน Python `dict`, `sorted(..., key=...)` และรัน `pytest` ได้",
    "ไม่ต้องใช้ API key — รันทั้งหมดบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "บทเรียนนี้ใช้ Pure Python สำหรับสูตร RRF และ `pytest` สำหรับตรวจความถูกต้อง (ติดตั้ง `pythainlp` และ `rank-bm25` เพิ่มได้หากอยากต่อกับดัชนีจาก Day 99)",
    commands: `uv init ai-day101 && cd ai-day101
uv add --dev pytest ruff
# ตัวเลือกเสริม (ถ้าต้องการทดสอบร่วมกับดัชนี BM25 ภาษาไทยจาก Day 99)
uv add pythainlp rank-bm25`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day101` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pytest` และ `ruff` สำเร็จ"],
      ["ready", "รัน `uv run python --version` แล้วเห็น Python 3.11+"],
    ],
    note: "โจทย์และตัวอย่างหลักของวันนี้ใช้ Python standard library ล้วน ไม่ต้องโหลดโมเดลขนาดใหญ่หรือต่ออินเทอร์เน็ต",
  },

  concepts: [
    {
      id: "why-hybrid-thai",
      title: "1 · ทำไม Dense Vector หรือ BM25 อย่างเดียวจึงไม่พอสำหรับภาษาไทยปนอังกฤษ",
      paragraphs: [
        "ลองดูคำถามจริงที่พนักงานหรือลูกค้าไทยพิมพ์ทุกวัน: `\"ขอเช็ก status order #INV-2026-009 ที่ค้างชำระหน่อย\"` คำถามเดียวนี้ซ่อนความต้องการสองแบบไว้พร้อมกัน คือ **รหัสตรงตัว** (`#INV-2026-009`) และ **ความหมายเชิงภาษา** (`ค้างชำระ` ซึ่งในเอกสารองค์กรอาจเขียนว่า `ยอดค้างจ่าย` หรือ `overdue payment`)",
        "Dense {{embedding}} เก่งเรื่องความหมายข้ามคำและข้ามภาษา (จับคู่ `ค้างชำระ` กับ `overdue` ได้ดี) แต่เวกเตอร์ความหมายมักมอง `#INV-2026-009` กับ `#INV-2026-019` ใกล้กันมากจนสลับอันดับกันง่าย ในทางกลับกัน {{bm25}} (หลังตัดคำด้วย {{pythainlp}}) จับ `#INV-2026-009` ได้แม่น 100% แต่จะให้คะแนนเป็น 0 หากเอกสารใช้คำพ้องความหมายที่ไม่ตรงตัวอักษร",
        "Hybrid Search จึงรันการค้นหาทั้งสองแบบคู่ขนานกัน แล้วนำรายการผลลัพธ์มาผสานเข้าด้วยกัน เพื่อให้ได้ทั้งความแม่นของรหัสเฉพาะและความเข้าใจความหมายภาษาไทย-อังกฤษ",
      ],
      analogy:
        "เหมือนค้นหาเอกสารในออฟฟิศด้วยผู้ช่วยสองคนพร้อมกัน: คนแรกจำเลขที่ใบแจ้งหนี้เป๊ะทุกหลัก (BM25) อีกคนเข้าใจว่าลูกค้าหมายถึงเรื่องอะไรแม้ใช้คนละคำ (Dense Vector)",
      bullets: [
        "**BM25 + PyThaiNLP ชนะ**: รหัสสินค้า (`SKU-8821`), เลขใบแจ้งหนี้ (`#INV-2026-009`), ชื่อรุ่น, มาตรา PDPA, ศัพท์เฉพาะองค์กร",
        "**Dense Vector ชนะ**: คำพ้องความหมาย (`ขอใบเสร็จ` ↔ `ใบกำกับภาษี`), ภาษาพูดไทย, คำถามไทยหาเอกสารอังกฤษ",
        "**Hybrid Search ชนะเกือบทุกเคสจริง**: เก็บจุดแข็งทั้งสองฝั่งพร้อมกันโดยเพิ่ม latency เพียงเล็กน้อย",
      ],
      whyTitle: "Why this matters — แก้จุดบอดที่พบบ่อยที่สุดของ RAG ภาษาไทย",
      whyParagraphs: [
        "ทีมจำนวนมากเริ่มจาก Naive {{rag}} ที่ใช้แค่ Vector Search แล้วพบว่าผู้ใช้บ่นว่า *\"พิมพ์เลขเอกสารตรง ๆ ยังหาไม่เจอ\"* สาเหตุไม่ใช่เพราะโมเดล LLM โง่ แต่เพราะชั้น Retriever พลาดเอกสารตั้งแต่ต้นทาง",
        "เมื่อรวม BM25 + Dense Vector เข้าด้วยกัน ค่า Recall@5 บนชุดคำถามไทยผสมอังกฤษมักกระโดดขึ้นอย่างชัดเจนโดยไม่ต้องเปลี่ยนโมเดล LLM ที่แพงขึ้นเลย",
      ],
    },
    {
      id: "rrf-formula",
      title: "2 · สูตร Reciprocal Rank Fusion (RRF): รวมด้วยอันดับ ไม่ใช่คะแนนดิบ",
      paragraphs: [
        "ปัญหาแรกเมื่อพยายามรวมผลจาก BM25 และ Dense Vector คือ **สเกลคะแนนไม่เท่ากัน**: คะแนน BM25 ไม่มีเพดานบน (อาจอยู่ตั้งแต่ `0` ถึง `25+` ขึ้นกับความยาวเอกสารและจำนวนคำ) ขณะที่ {{cosine-similarity}} อยู่ในช่วง `[-1, 1]` และมักกระจุกตัวแคบ ๆ แถว `0.72–0.85` การจับมาบวกกันตรง ๆ จึงทำให้ฝั่ง BM25 กลบฝั่ง Vector เกือบหมด",
        "{{rrf}} แก้ปัญหานี้อย่างเรียบง่ายและทนทานด้วยการ **ทิ้งคะแนนดิบแล้วใช้แค่อันดับ (1-based rank)** ของแต่ละระบบค้นหา โดยให้คะแนนเอกสาร $d$ เท่ากับผลรวมของ `1 / (k + rank_i(d))` จากทุกรายการที่เอกสารนั้นปรากฏอยู่",
        "ค่ามาตรฐานจากงานวิจัยต้นฉบับคือ `k = 60` เอกสารที่ได้อันดับ 1 จากฝั่งเดียวได้ `1/61 ≈ 0.0164` แต่เอกสารที่ติดอันดับต้นจาก **ทั้งสองฝั่ง** (เช่น อันดับ 1 ใน BM25 และอันดับ 3 ใน Dense) จะได้ `1/61 + 1/63 ≈ 0.0323` ซึ่งพุ่งขึ้นเป็นอันดับ 1 ทันที",
      ],
      analogy:
        "เหมือนกรรมการ 2 คนให้คะแนนคนละมาตรฐาน (คนหนึ่งให้เต็ม 100 อีกคนให้เต็ม 10) แทนที่จะเอาคะแนนดิบมาบวกกัน เรานับเฉพาะอันดับที่ 1, 2, 3 ของกรรมการแต่ละคนแล้วแปลงเป็นแต้มกลาง",
      code: {
        language: "python",
        filename: "rrf_core.py",
        code: `def rrf_score(ranks: list[int], k: int = 60) -> float:
    """คำนวณคะแนน RRF จากลิสต์อันดับ 1-based ของเอกสารหนึ่งชิ้น"""
    return sum(1.0 / (k + rank) for rank in ranks)


# เอกสารที่ติดอันดับ 1 ใน BM25 และอันดับ 3 ใน Dense
both_lists = rrf_score([1, 3], k=60)
# เอกสารที่ติดอันดับ 1 ใน Dense ฝั่งเดียว (ไม่ติดใน BM25)
single_list = rrf_score([1], k=60)

print(f"ติดทั้ง 2 ฝั่ง (rank 1, 3): {both_lists:.4f}")
print(f"ติดฝั่งเดียว  (rank 1)  : {single_list:.4f}")`,
        caption: "RRF ให้รางวัลเอกสารที่มีฉันทามติ (consensus) จากหลายตัวค้นหา โดยไม่ต้อง normalize คะแนนดิบ",
      },
      whyTitle: "Why this matters — เสถียรแม้ไม่รู้การกระจายตัวของคะแนน",
      whyParagraphs: [
        "วิธีทางเลือกอย่าง Min-Max Normalization มักพังเมื่อรายการผลลัพธ์มีแค่ 2–3 ชิ้น หรือมีค่า outlier สูงผิดปกติจนบีบคะแนนเอกสารอื่นลงใกล้ศูนย์ทั้งหมด",
        "RRF เป็นแบบ **rank-based และ parameter-light** จึงถูกฝังเป็นค่าเริ่มต้นในฐานข้อมูลสมัยใหม่อย่าง `Qdrant` (Query API prefetch + RRF) และเขียนใน SQL ของ `pgvector` ได้ภายในไม่กี่บรรทัด",
      ],
    },
    {
      id: "tuning-k-and-pipeline",
      title: "3 · ผลของค่า k, น้ำหนัก (Weighted RRF) และขั้นต่อไปสู่ Reranker",
      paragraphs: [
        "พารามิเตอร์ `k` ในสูตร `1 / (k + rank)` ควบคุมว่าเราจะ **เทน้ำหนักให้อันดับบนสุดมากแค่ไหน**: ถ้า `k` เล็ก (เช่น `k = 5` หรือ `10`) อันดับ 1 (`1/11 = 0.091`) จะทิ้งห่างอันดับ 4 (`1/14 = 0.071`) มาก แต่ถ้า `k` ใหญ่ (เช่น `k = 60`) เส้นโค้งคะแนนจะลาดเรียบขึ้น ทำให้อันดับ 1–5 มีน้ำหนักใกล้เคียงกันและเน้นฉันทามติระหว่างหลายแหล่งมากขึ้น",
        "ในบางโดเมนที่มีรหัสเอกสารเยอะเป็นพิเศษ ทีมอาจเพิ่ม **น้ำหนัก (`weight`)** ให้สูตรเป็น `weight_i / (k + rank_i(d))` เช่น ให้ `bm25 = 1.2`, `dense = 1.0` แต่ควรปรับก็ต่อเมื่อมีชุดทดสอบวัดผลชัดเจน (เช่น {{mrr}} หรือ Recall@5) ไม่ใช่เดาเอาเอง",
        "ในสถาปัตยกรรม {{rag}} ระดับ Production เรามักดึง `top_k = 20` ถึง `50` จากแต่ละฝั่งมาผสานด้วย RRF เพื่อให้ได้ผู้สมัคร 20 ชิ้นที่ครอบคลุมที่สุด แล้วจึงส่งต่อไปยัง Cross-Encoder {{reranker}} (Day 102) เพื่อคัดเหลือ 5 ชิ้นสุดท้ายที่แม่นที่สุดเข้าสู่ prompt",
      ],
      analogy:
        "RRF คือรอบคัดเลือกที่รวมรายชื่อจากแมวมองสองสายให้ได้ผู้เข้ารอบ 20 คนที่ครบเครื่องที่สุด ส่วน Reranker ในวันพรุ่งนี้คือรอบสัมภาษณ์ตัวต่อตัวเพื่อเลือก 5 คนสุดท้าย",
      bullets: [
        "**เริ่มที่ `k = 60` เสมอ**: เป็นค่ามาตรฐานที่ทำงานดีข้ามโดเมนโดยแทบไม่ต้องจูน",
        "**จัดการ doc ซ้ำในรายการเดียวกัน**: หากตัวค้นหาคืน `doc_id` ซ้ำ (เช่น หลาย chunk ของเอกสารเดียวกัน) ให้ยึดอันดับที่ดีที่สุดเพื่อไม่ให้คะแนนเบิ้ลผิดปกติ",
        "**Tie-breaking แบบ Deterministic**: เมื่อสองเอกสารได้คะแนน RRF เท่ากัน ให้เรียงตาม `doc_id` เพื่อไม่ให้ลำดับแกว่งไปมาจนทำเทสต์ flaky",
      ],
      whyTitle: "Why this matters — วางท่อ Retrieval แบบสองจังหวะ (Recall ก่อน Precision)",
      whyParagraphs: [
        "งานของ Hybrid RRF คือ **Maximize Recall** (อย่าให้เอกสารที่ใช่หลุดมือ) ในเวลาเพียงไม่กี่มิลลิวินาที เพราะทำงานบนอันดับที่ได้มาจาก index เรียบร้อยแล้ว",
        "เมื่อมั่นใจว่าเอกสารคำตอบติดอยู่ใน top-20 แล้ว ค่อยให้โมเดลที่ละเอียดและช้ากว่าอย่าง Cross-Encoder Reranker จัดอันดับ top-5 เพื่อ **Maximize Precision** ต่อไป",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เปรียบเทียบกับการรวมผล Search ในเว็บแอป",
      body: [
        "ถ้าคุณเคยทำช่องค้นหาในเว็บที่ใช้ SQL `ILIKE`/Full-text search คู่กับระบบแนะนำ (Recommendation) หรือ Algolia — Hybrid Search + RRF คือแนวคิดเดียวกันในฝั่ง AI Retrieval:",
      ],
      table: [
        ["BM25 + PyThaiNLP", "PostgreSQL Full-Text / Elasticsearch keyword match"],
        ["Dense Vector (pgvector / Qdrant)", "Semantic similarity search ด้วย embeddings"],
        ["Reciprocal Rank Fusion (RRF)", "Merge & re-rank ผลจาก 2 search endpoints ด้วยอันดับ"],
        ["Cross-Encoder Reranker (D102)", "Second-stage scoring เฉพาะ top-20 ก่อนแสดงผล"],
      ],
    },
    student: {
      title: "First-Year Note — 1-based rank กับการใช้ dict สะสมคะแนน",
      body: [
        "ใน Python ลิสต์เริ่มนับ index ที่ `0` (`enumerate(docs)`) แต่สูตร RRF นับอันดับที่ `1` (`enumerate(docs, start=1)`) เพราะเอกสารอันดับแรกคือ rank 1 ไม่ใช่ rank 0",
        "การสะสมคะแนนจากหลายลิสต์ทำได้ง่ายด้วย `scores: dict[str, float] = {}` แล้วใช้ `scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)` จากนั้นเรียงจากมากไปน้อยด้วย `sorted(scores.items(), key=lambda x: (-x[1], x[0]))` — เครื่องหมายลบหน้า `x[1]` เรียงคะแนนจากมากไปน้อย ส่วน `x[0]` เรียงชื่อเอกสารจาก A→Z เมื่อคะแนนเท่ากัน",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ระบบผู้ช่วยองค์กรรับคำถามไทยปนอังกฤษว่า `\"ขอเช็ก status order #INV-2026-009 ที่ค้างชำระหน่อย\"` เราได้รายการอันดับจาก BM25 (ตัดคำไทยแล้ว) และ Dense Vector มาอย่างละ 4 เอกสาร ลองเดินทีละขั้นเพื่อดูว่า RRF ผสานผลอย่างไร",
    steps: [
      {
        title: "1 · ดูผลอันดับแยกกันของ BM25 และ Dense Vector",
        explain:
          "สังเกตว่า `BM25` เจอ `#INV-2026-009` เป็นอันดับ 1 แต่หลงหยิบ `#INV-2026-019` มาเป็นอันดับ 2 ส่วน `Dense` จับความหมายคำว่า `ค้างชำระ` ได้ดีจนเอา `doc_overdue_policy` ขึ้นอันดับ 1 แต่ดัน `doc_inv_009` ลงไปอันดับ 3",
        code: {
          language: "python",
          filename: "worked_rrf.py",
          code: `query = "ขอเช็ก status order #INV-2026-009 ที่ค้างชำระหน่อย"

bm25_ranks = [
    "doc_inv_009",         # rank 1: ตรงรหัส #INV-2026-009 เป๊ะ
    "doc_inv_019",         # rank 2: รหัสคล้ายกัน (INV-2026)
    "doc_tax_faq",         # rank 3: มีคำว่าชำระ
    "doc_overdue_policy",  # rank 4: มีคำว่าค้างชำระ
]

dense_ranks = [
    "doc_overdue_policy",  # rank 1: ความหมายใกล้ 'ค้างชำระ' ที่สุด
    "doc_payment_guide",   # rank 2: ความหมายใกล้ 'การชำระเงิน'
    "doc_inv_009",         # rank 3: เอกสารออเดอร์ค้างจ่ายจริง
    "doc_refund_policy",   # rank 4: เกี่ยวกับการเงินทั่วไป
]

print("BM25 top-1 :", bm25_ranks[0])
print("Dense top-1:", dense_ranks[0])`,
        },
        output: `BM25 top-1 : doc_inv_009
Dense top-1: doc_overdue_policy`,
      },
      {
        title: "2 · ผสานอันดับด้วย RRF (k = 60) ใน Pure Python",
        explain:
          "วนลูปทุกรายการด้วย `enumerate(..., start=1)` แล้วบวก `1 / (k + rank)` เข้าไปใน `scores` จากนั้นเรียงคะแนนมาก→น้อย และ tie-break ด้วย `doc_id` น้อย→มาก",
        code: {
          language: "python",
          filename: "worked_rrf.py",
          code: `def reciprocal_rank_fusion(
    ranked_lists: list[list[str]],
    k: int = 60,
) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}
    for docs in ranked_lists:
        seen: set[str] = set()
        for rank, doc_id in enumerate(docs, start=1):
            if doc_id in seen:
                continue
            seen.add(doc_id)
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda item: (-item[1], item[0]))


fused_60 = reciprocal_rank_fusion([bm25_ranks, dense_ranks], k=60)
for idx, (doc_id, score) in enumerate(fused_60, start=1):
    print(f"#{idx} {doc_id:<20} score={score:.4f}")`,
        },
        output: `#1 doc_inv_009          score=0.0323
#2 doc_overdue_policy   score=0.0320
#3 doc_inv_019          score=0.0161
#4 doc_payment_guide    score=0.0161
#5 doc_tax_faq          score=0.0159
#6 doc_refund_policy    score=0.0156`,
      },
      {
        title: "3 · เทียบผลเมื่อลดค่า k เป็น 10",
        explain:
          "เมื่อลด `k = 10` คะแนนรวมจะสูงขึ้นและช่องว่างระหว่างอันดับบนกับอันดับล่างกว้างขึ้นอย่างชัดเจน สังเกตว่าทั้ง `doc_inv_009` และ `doc_overdue_policy` ยังคงครอง top-2 เพราะติดอันดับทั้งสองฝั่ง",
        code: {
          language: "python",
          filename: "worked_rrf.py",
          code: `fused_10 = reciprocal_rank_fusion([bm25_ranks, dense_ranks], k=10)
for idx, (doc_id, score) in enumerate(fused_10[:4], start=1):
    print(f"k=10 #{idx} {doc_id:<20} score={score:.4f}")`,
        },
        output: `k=10 #1 doc_inv_009          score=0.1678
k=10 #2 doc_overdue_policy   score=0.1623
k=10 #3 doc_inv_019          score=0.0833
k=10 #4 doc_payment_guide    score=0.0833`,
      },
    ],
    gotcha:
      "จุดสังเกต: ดู `#3 doc_inv_019` กับ `#4 doc_payment_guide` ที่ได้คะแนน `0.0161` เท่ากันเป๊ะ (`1/62`) — ถ้าเราไม่ใส่ `item[0]` เป็นเงื่อนไขเรียงลำดับรอง ลำดับของผลลัพธ์ที่คะแนนเท่ากันจะขึ้นอยู่กับลำดับการใส่เข้า dict ซึ่งทำให้การทดสอบซ้ำคาดเดาได้ยาก",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างฟังก์ชัน `rrf_fuse` ที่พร้อมใช้งานจริงในท่อ Hybrid Search ขององค์กร รองรับทั้งชื่อแหล่งค้นหา (เช่น `\"bm25\"`, `\"dense\"`), น้ำหนักเฉพาะแหล่ง (`weights`), การกันเอกสารซ้ำ และการตัดผลลัพธ์ด้วย `top_k`",
    requirements: [
      "ฟังก์ชัน `rrf_fuse(rankings: dict[str, list[str]], k: int = 60, weights: dict[str, float] | None = None, top_k: int | None = None) -> list[tuple[str, float]]`",
      "ตรวจสอบพารามิเตอร์: ถ้า `k <= 0` หรือมีค่า weight `< 0` หรือ `top_k` ไม่ใช่ `None` และ `top_k <= 0` ให้โยน `ValueError`",
      "ใช้สูตร Weighted RRF: `weight / (k + rank)` โดย `rank` เป็น 1-based และถ้าไม่ระบุ `weights` (หรือไม่มีชื่อแหล่งนั้นใน `weights`) ให้ใช้ค่าเริ่มต้น `1.0`",
      "ถ้าในแหล่งค้นหาเดียวกันมี `doc_id` ซ้ำ ให้คิดคะแนนเฉพาะ **อันดับแรกที่ดีที่สุด** เท่านั้น (ไม่นับซ้ำ)",
      "เรียงผลลัพธ์ตามคะแนนจากมากไปน้อย และหากคะแนนเท่ากันให้เรียงตาม `doc_id` จากน้อยไปมาก (`A -> Z`) แล้วตัดตาม `top_k` หากกำหนดไว้",
    ],
    starter: {
      language: "python",
      filename: "exercise_day101.py",
      code: `from __future__ import annotations


def rrf_fuse(
    rankings: dict[str, list[str]],
    k: int = 60,
    weights: dict[str, float] | None = None,
    top_k: int | None = None,
) -> list[tuple[str, float]]:
    """ผสานผลอันดับจากหลายตัวค้นหาด้วย Weighted Reciprocal Rank Fusion (RRF)."""
    # TODO: 1) validate k, top_k และ weights
    # TODO: 2) วนแต่ละแหล่งค้นหา สะสม weight / (k + rank) โดยกัน doc_id ซ้ำในแหล่งเดียวกัน
    # TODO: 3) เรียงคะแนนมาก->น้อย (tie-break ด้วย doc_id น้อย->มาก) และตัดตาม top_k
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day101.py",
      code: `import pytest
from exercise_day101 import rrf_fuse


def test_thai_code_switching_hybrid_fusion():
    rankings = {
        "bm25": ["doc_inv_009", "doc_inv_019", "doc_tax_faq", "doc_overdue_policy"],
        "dense": ["doc_overdue_policy", "doc_payment_guide", "doc_inv_009", "doc_refund_policy"],
    }
    fused = rrf_fuse(rankings, k=60)
    assert fused[0][0] == "doc_inv_009"
    assert fused[1][0] == "doc_overdue_policy"
    assert fused[0][1] == pytest.approx(1 / 61 + 1 / 63)
    assert fused[1][1] == pytest.approx(1 / 64 + 1 / 61)


def test_deduplicates_within_same_source_keeping_best_rank():
    rankings = {
        "bm25": ["doc_a", "doc_a", "doc_b"],
    }
    fused = rrf_fuse(rankings, k=60)
    assert dict(fused)["doc_a"] == pytest.approx(1 / 61)
    assert dict(fused)["doc_b"] == pytest.approx(1 / 63)


def test_weighted_rrf_and_top_k():
    rankings = {
        "bm25": ["doc_exact", "doc_shared"],
        "dense": ["doc_semantic", "doc_shared"],
    }
    fused = rrf_fuse(rankings, k=60, weights={"bm25": 2.0, "dense": 1.0}, top_k=2)
    assert len(fused) == 2
    assert fused[0][0] == "doc_shared"
    assert fused[1][0] == "doc_exact"


def test_deterministic_tie_breaking():
    rankings = {
        "bm25": ["doc_z"],
        "dense": ["doc_a"],
    }
    fused = rrf_fuse(rankings, k=60)
    assert [doc_id for doc_id, _ in fused] == ["doc_a", "doc_z"]


def test_invalid_arguments_raise_value_error():
    with pytest.raises(ValueError):
        rrf_fuse({"bm25": ["doc_1"]}, k=0)
    with pytest.raises(ValueError):
        rrf_fuse({"bm25": ["doc_1"]}, weights={"bm25": -0.5})
    with pytest.raises(ValueError):
        rrf_fuse({"bm25": ["doc_1"]}, top_k=0)
`,
    },
    selfCheck: [
      "ใช้ 1-based rank (`enumerate(docs, start=1)`) ไม่ใช่ 0-based index",
      "กรณี `doc_a` ปรากฏซ้ำที่ index 0 และ 1 ในแหล่งเดียวกัน คะแนนยังคงเป็น `1/(k+1)` และ `doc_b` ถัดไปใช้ rank จริงของมัน",
      "เมื่อคะแนนเท่ากัน `doc_a` มาก่อน `doc_z` เสมอ (deterministic tie-break)",
      "โยน `ValueError` ทันทีเมื่อ `k <= 0`, `top_k <= 0` หรือมี weight ติดลบ",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "แยกงานเป็น 3 ขั้นชัดเจน: ตรวจค่าอินพุตก่อน (fail-fast) → วนสะสมคะแนนลง `dict[str, float]` โดยใช้ `seen: set[str]` ต่อหนึ่งแหล่งค้นหา → เรียงผลด้วย tuple key `(-score, doc_id)` แล้วค่อย slice `[:top_k]`",
      },
      {
        body: "ระวังเคส `doc_b` ใน `[\"doc_a\", \"doc_a\", \"doc_b\"]`: ถ้าใช้ `for rank, doc_id in enumerate(docs, start=1):` แล้ว `if doc_id in seen: continue` อันดับของ `doc_b` จะเป็น `3` (`1 / 63`) ตรงตามเทสต์ และสำหรับการดึง weight ใช้ `weight = (weights or {}).get(source, 1.0)`",
      },
      {
        body: "โครงฟังก์ชันเกือบสมบูรณ์ — เหลือเติมเงื่อนไขเรียงลำดับและการตัด `top_k` ที่บรรทัดสุดท้ายแล้วลองรันเทสต์",
        code: {
          language: "python",
          filename: "hint_day101.py",
          code: `def rrf_fuse(
    rankings: dict[str, list[str]],
    k: int = 60,
    weights: dict[str, float] | None = None,
    top_k: int | None = None,
) -> list[tuple[str, float]]:
    if k <= 0:
        raise ValueError("k must be greater than 0")
    if top_k is not None and top_k <= 0:
        raise ValueError("top_k must be greater than 0")

    weight_map = weights or {}
    if any(w < 0 for w in weight_map.values()):
        raise ValueError("weights must be non-negative")

    scores: dict[str, float] = {}
    for source, docs in rankings.items():
        w = weight_map.get(source, 1.0)
        seen: set[str] = set()
        for rank, doc_id in enumerate(docs, start=1):
            if doc_id in seen:
                continue
            seen.add(doc_id)
            scores[doc_id] = scores.get(doc_id, 0.0) + w / (k + rank)

    # TODO: เรียง scores.items() ด้วย (-score, doc_id) และคืน [:top_k] ถ้ากำหนดไว้
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
      title: "เอาคะแนนดิบ BM25 บวกกับ Cosine Similarity ตรง ๆ",
      symptom: "ผลค้นหาเหมือนใช้ BM25 ล้วน ๆ คำพ้องความหมายภาษาไทยที่ Dense Vector เจอถูกกลบหมด",
      fix: "อย่าบวกคะแนนต่างสเกลกันตรง ๆ ให้ใช้ {{rrf}} (`1 / (k + rank)`) ซึ่งอิงจากลำดับอันดับเท่านั้น",
    },
    {
      title: "ใช้ 0-based index แทน 1-based rank",
      symptom: "สูตรกลายเป็น `1 / (k + 0)` ซึ่งไม่ตรงกับนิยามมาตรฐานและทำให้เมื่อ `k = 0` หรือเปรียบเทียบกับ Qdrant/pgvector ได้คะแนนไม่ตรงกัน",
      fix: "ใช้ `enumerate(docs, start=1)` เสมอ และตรวจว่า `k > 0`",
    },
    {
      title: "ไม่ตัดคำภาษาไทยก่อนทำ BM25 แล้วหวังให้ RRF ช่วย",
      symptom: "BM25 คืนลิสต์ว่างสำหรับคำถามภาษาไทยล้วน ทำให้ Hybrid Search เสื่อมสภาพกลับไปเป็น Dense Vector อย่างเดียว",
      fix: "RRF ผสานได้เฉพาะสิ่งที่ตัวค้นหาส่งมาเท่านั้น — ต้องตัดคำด้วย {{pythainlp}} (`newmm`) ทั้งตอน index และตอน query เสมอ",
    },
    {
      title: "ปล่อยให้ doc_id ซ้ำในแหล่งเดียวสะสมคะแนนเบิ้ล",
      symptom: "เอกสารยาวที่ถูกแบ่งเป็นหลาย chunk และติดอันดับ 1, 2, 3 ใน BM25 ได้คะแนน RRF พุ่งเกินจริงจนเบียดเอกสารอื่นที่เกี่ยวข้องกว่า",
      fix: "ใช้ `seen: set[str]` ต่อหนึ่งแหล่งค้นหา หรือใช้ `chunk_id` ที่ไม่ซ้ำกันเป็นคีย์หลักให้ชัดเจนว่ากำลังผสานระดับเอกสารหรือระดับ chunk",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d101-q1",
        "ทำไมคำถามไทยปนอังกฤษอย่าง `\"ขอเช็ก status order #INV-2026-009 ที่ค้างชำระ\"` จึงมักค้นไม่แม่นหากใช้ Dense Vector เพียงอย่างเดียว?",
        [
          ["Dense Vector ไม่รองรับตัวอักษรภาษาไทยเลย", "Multilingual embedding รองรับภาษาไทยได้ดี แต่จุดอ่อนคือรหัสเฉพาะแบบตรงตัว"],
          [
            "Dense Vector จับความหมายภาพรวมได้ดี แต่แยกรหัสเฉพาะที่คล้ายกันอย่าง `#INV-2026-009` กับ `#INV-2026-019` ไม่คมเท่า BM25",
            "ถูก — Embedding บีบข้อความเป็นเวกเตอร์ความหมาย จึงมักให้คะแนนรหัสที่หน้าตาคล้ายกันใกล้เคียงกันมาก ต่างจาก BM25 ที่จับคู่คำตรงตัว",
          ],
          ["Dense Vector ค้นหาได้ช้ากว่า BM25 เสมอในทุกขนาดข้อมูล", "ประเด็นหลักไม่ใช่แค่ความเร็ว แต่คือความแม่นยำกับรหัสเฉพาะ (exact match)"],
          ["Dense Vector ใช้ไม่ได้กับฐานข้อมูล PostgreSQL", "PostgreSQL รองรับ vector search ผ่าน `pgvector` ได้โดยตรง"],
        ],
        "B",
        "Dense Embedding เก่งความหมายและคำพ้อง ส่วน BM25 เก่งรหัสเฉพาะตรงตัว — Hybrid Search จึงจำเป็นมากกับคำถามไทยปนอังกฤษในงานจริง",
        "จุดอ่อนของ Dense Vector และ BM25 เมื่อเจอคำถามไทยปนอังกฤษที่มีรหัสเอกสารคืออะไร?",
        "Dense Vector เก่งความหมายแต่แยกรหัสเฉพาะ (เช่น #INV-2026-009 vs 019) ไม่คม ส่วน BM25 แม่นรหัสตรงตัวแต่พลาดคำพ้องความหมาย",
      ),
      mc(
        "d101-q2",
        "ข้อใดคือเหตุผลสำคัญที่ Reciprocal Rank Fusion (RRF) ใช้ `อันดับ (rank)` แทนการใช้คะแนนดิบจาก BM25 และ Cosine Similarity?",
        [
          ["เพราะ BM25 ไม่มีคะแนนออกมา มีแค่อันดับ", "BM25 มีคะแนนดิบ แต่คะแนนนั้นไม่มีเพดานบนและสเกลไม่เท่ากับ Cosine"],
          ["เพราะคอมพิวเตอร์คำนวณเลขทศนิยมของ Cosine Similarity ไม่ได้", "ไม่จริง — สูตร RRF เองก็คำนวณเลขทศนิยม `1 / (k + rank)`"],
          [
            "เพราะคะแนน BM25 (ไม่มีขอบบน) กับ Cosine Similarity ([-1, 1]) อยู่คนละสเกลกัน การใช้ rank ทำให้รวมผลได้เสถียรโดยไม่ต้องจูน normalization",
            "ถูก — RRF เป็น rank-based fusion จึงไม่พังเมื่อช่วงคะแนนดิบเปลี่ยนตามขนาดคลังเอกสาร",
          ],
          ["เพราะ RRF ทำให้ไม่ต้องสร้าง Vector Index", "RRF ทำหน้าที่ผสานผลลัพธ์หลังการค้นหา ไม่ได้แทนที่การสร้าง index"],
        ],
        "C",
        "ความต่างของสเกลคะแนนระหว่าง BM25 กับ Cosine Similarity ทำให้การบวกคะแนนดิบเปราะบางมาก RRF แก้ปัญหานี้ด้วยการแปลงทุกอย่างเป็น `1 / (k + rank)`",
        "ทำไม RRF จึงใช้อันดับ (rank) แทนการบวกคะแนนดิบของ BM25 กับ Cosine?",
        "คะแนน BM25 ไม่มีเพดานบน ส่วน Cosine อยู่ใน [-1, 1] สเกลไม่เท่ากัน การใช้ rank ทำให้รวมผลเสถียรโดยไม่ต้อง normalize คะแนนดิบ",
      ),
      mc(
        "d101-q3",
        "กำหนด `k = 60` เอกสาร A ติดอันดับ 2 ใน BM25 และอันดับ 4 ใน Dense ส่วนเอกสาร B ติดอันดับ 1 ใน Dense ฝั่งเดียว เอกสารใดจะได้คะแนน RRF สูงกว่า?",
        [
          [
            "เอกสาร A (`1/62 + 1/64 ≈ 0.0318`) สูงกว่าเอกสาร B (`1/61 ≈ 0.0164`)",
            "ถูก — RRF ให้รางวัลสูงมากกับเอกสารที่ติดอันดับต้นจากทั้งสองแหล่ง (consensus)",
          ],
          ["เอกสาร B สูงกว่า เพราะได้อันดับ 1", "แม้ได้อันดับ 1 จากฝั่งเดียว คะแนน `1/61` ยังน้อยกว่าผลรวมสองฝั่งของเอกสาร A เกือบครึ่งหนึ่ง"],
          ["ได้คะแนนเท่ากัน", "ไม่เท่ากัน — `1/62 + 1/64` มากกว่า `1/61` อย่างชัดเจน"],
          ["คำนวณไม่ได้เพราะไม่รู้คะแนน Cosine ดิบ", "RRF ไม่ต้องใช้คะแนนดิบ รู้แค่อันดับก็คำนวณได้ทันที"],
        ],
        "A",
        "เอกสาร A ได้ `1/62 + 1/64 ≈ 0.0318` ขณะที่เอกสาร B ได้ `1/61 ≈ 0.0164` — นี่คือคุณสมบัติเด่นของ RRF ที่ดันเอกสารซึ่งทั้งสองระบบเห็นตรงกันขึ้นบนสุด",
        "ด้วย k=60 เอกสารที่ได้ rank (2, 4) จากสองระบบ กับเอกสารที่ได้ rank (1) จากระบบเดียว ใครชนะใน RRF?",
        "เอกสารที่ได้ (2, 4) ชนะขาด (1/62 + 1/64 ≈ 0.0318 เทียบกับ 1/61 ≈ 0.0164) เพราะ RRF ให้รางวัลฉันทามติจากหลายแหล่ง",
      ),
      mc(
        "d101-q4",
        "หากลดค่า `k` ในสูตร RRF จาก `60` ลงเหลือ `5` พฤติกรรมของการจัดอันดับจะเปลี่ยนไปอย่างไร?",
        [
          ["ผลลัพธ์จะสุ่มไม่คงที่ทุกครั้งที่รัน", "สูตร RRF เป็น deterministic เสมอไม่ว่า k จะเป็นเท่าไร"],
          [
            "อันดับต้นสุด (เช่น rank 1) จะมีอิทธิพลทิ้งห่างอันดับรองลงมามากขึ้น",
            "ถูก — เมื่อ k=5, rank 1 ได้ 1/6 (0.167) ส่วน rank 5 ได้ 1/10 (0.100) ต่างกันมากเมื่อเทียบกับ k=60 ที่ 1/61 (0.0164) กับ 1/65 (0.0154)",
          ],
          ["เอกสารที่ติดอันดับล่าง ๆ จะได้คะแนนมากกว่าอันดับ 1", "ไม่จริง — ตัวส่วน `k + rank` ยิ่งมาก ค่า `1 / (k + rank)` ยิ่งน้อยเสมอ"],
          ["ทำให้ BM25 ทำงานเร็วขึ้น 10 เท่า", "ค่า k เป็นพารามิเตอร์ตอนรวมอันดับหลังค้นหา ไม่ได้เปลี่ยนความเร็วของดัชนี BM25"],
        ],
        "B",
        "ค่า `k` ทำหน้าที่เป็น smoothing constant: `k` ยิ่งเล็ก ยิ่งเน้นอันดับ 1–2 แบบเฉียบคม ส่วน `k = 60` เกลี่ยน้ำหนักให้เนียนและเน้นฉันทามติจากหลายตัวค้นหา",
        "การลดค่า k ในสูตร RRF (เช่นจาก 60 เหลือ 5) ส่งผลต่อการจัดอันดับอย่างไร?",
        "อันดับบนสุด (rank 1–2) จะได้น้ำหนักทิ้งห่างอันดับรองลงมามากขึ้น ขณะที่ k=60 เกลี่ยน้ำหนักให้เรียบและเน้นฉันทามติข้ามแหล่ง",
      ),
    ],
  },

  takeaways: [
    "คำถามไทยปนอังกฤษต้องการทั้ง **BM25 + PyThaiNLP** (จับรหัสตรงตัว) และ **Dense Vector** (จับความหมายและคำพ้อง)",
    "**RRF (`sum(1 / (k + rank))`, `k = 60`)** รวมผลหลายตัวค้นหาได้เสถียรโดยไม่ต้องปรับสเกลคะแนนดิบ",
    "ในโค้ดจริงต้องใช้ **1-based rank**, **กัน `doc_id` ซ้ำในแหล่งเดียว**, และ **tie-break แบบ deterministic** ด้วย `doc_id`",
    "Hybrid RRF ทำหน้าที่เพิ่ม Recall ในระดับ top-20 เพื่อส่งต่อให้ **Cross-Encoder Reranker** คัด top-5 ใน Day 102",
  ],

  reviewCards: [
    rc(
      "d101-rc-1",
      "เขียนสูตร Reciprocal Rank Fusion (RRF) และระบุค่า k มาตรฐาน",
      "score(d) = sum(1 / (k + rank_i(d))) โดยใช้ 1-based rank และค่ามาตรฐาน k = 60",
    ),
    rc(
      "d101-rc-2",
      "ทำไม Hybrid Search จึงสำคัญกับคำถามภาษาไทยปนอังกฤษ เช่น '#INV-2026-009 ค้างชำระ'?",
      "BM25 (หลังตัดคำด้วย PyThaiNLP) แม่นรหัสตรงตัว ส่วน Dense Embedding จับความหมาย/คำพ้องความหมาย (ค้างชำระ ↔ overdue) — RRF รวมจุดแข็งทั้งสองฝั่ง",
    ),
    rc(
      "d101-rc-3",
      "ก่อนนำผลจากหลายแหล่งมาเข้า RRF มี 2 ข้อควรระวังด้านวิศวกรรมอะไรบ้าง?",
      "1) กัน doc_id ซ้ำในแหล่งเดียวกันไม่ให้คะแนนเบิ้ล (ยึดอันดับดีสุด) และ 2) ทำ deterministic tie-breaking เช่น เรียงตาม (-score, doc_id)",
    ),
  ],

  sources: [
    { label: "Qdrant Documentation — Hybrid Queries & RRF", href: "https://qdrant.tech/documentation/concepts/hybrid-queries/" },
    { label: "PyThaiNLP Documentation — Thai Tokenization", href: "https://pythainlp.github.io/docs/" },
    { label: "pgvector Official Repository — Hybrid Search Patterns", href: "https://github.com/pgvector/pgvector" },
    { label: "Python 3 Official Docs — Sorting HOW TO", href: "https://docs.python.org/3/howto/sorting.html" },
  ],

  glossary: ["rrf", "bm25", "embedding", "pythainlp", "cosine-similarity", "rag", "reranker", "mrr"],
});
