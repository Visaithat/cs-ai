import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D070 — Phase 3 / Block B18
 * Semantic Search & Nearest Neighbors on Thai Sentences
 */
export const d070: Lesson = defineLesson({
  day: 70,
  titleTh: "สร้าง Semantic Search บนประโยคไทย พร้อมเกณฑ์ Threshold และจุดบอดรหัสเฉพาะ",
  tagline: "30 นาที · รันบน CPU 100% · ค้น FAQ ไทยด้วย unit_q @ unit_corpus.T, กันคำถามนอกเรื่อง และเข้าใจข้อจำกัดของ Dense Search",
  icon: "compass",
  visual: {
    id: "dense-embeddings-map",
    title: "Semantic Search บนประโยคไทย — ค้นด้วยความหมายพร้อมจุดบอดของรหัสเฉพาะ",
    caption: "ทดลองเทียบคำถามเชิงความหมาย ('ขอใบเสร็จ') กับคำถามรหัสเฉพาะ ('#INV-2026') เพื่อเข้าใจจุดแข็งและจุดอ่อนของ Dense Search",
    alt: "แผนภาพ Semantic Search บนประโยคภาษาไทย",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบน CPU ของเครื่องคุณ 100% ด้วย NumPy + Sentence-Transformers ไม่ต้องใช้ API key",
  tools: ["Sentence-Transformers", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "สร้างดัชนีเวกเตอร์คลัง FAQ ไทยที่พร้อมค้นหาใน RAM",
      body: "เมื่อแปลงเอกสารทั้งหมดเป็น unit vectors ด้วย Bi-Encoder (Day 69) เราสามารถเก็บเมทริกซ์ `(N, D)` ไว้ในหน่วยความจำเพื่อรองรับการค้นหาแบบ Exact Nearest Neighbor ได้ทันที",
      lessonNote: "วันนี้เราประกอบ `ThaiSemanticIndex` ที่แยกขั้นตอน index กับ search ออกจากกันอย่างสะอาด",
    },
    {
      node: 2,
      heading: "ค้นหา Top-K เพื่อนบ้านที่ใกล้ที่สุดด้วย `unit_q @ unit_corpus.T`",
      body: "สำหรับคลังเอกสารหลักพันถึงหลายหมื่นชิ้น การคูณเมทริกซ์ด้วย NumPy BLAS ใช้เวลาไม่ถึง 1 มิลลิวินาทีและได้ผลลัพธ์แม่นยำ 100% (Exact Search) ก่อนจำเป็นต้องใช้ดัชนีประมาณค่าอย่าง {{hnsw}} ใน Phase 4",
      lessonNote: "เราจะคัด {{top-k}} อย่างคงที่ (deterministic tie-breaking) เพื่อให้ผลเทสต์และระบบจริงไม่แกว่ง",
    },
    {
      node: 3,
      heading: "ตั้ง Score Threshold เพื่อปฏิเสธคำถามนอกเรื่องและจับจุดบอดรหัสเฉพาะ",
      body: "Nearest Neighbor จะคืนเอกสารอันดับ 1 เสมอแม้ผู้ใช้ถามเรื่องที่ไม่มีในคลัง และ Dense {{embedding}} ยังแยกแยะรหัสใบแจ้งหนี้หรือรหัสสินค้าที่ต่างกันแค่ตัวเลขท้ายได้ไม่ดี",
      lessonNote: "เราจะคาลิเบรต `min_score` สำหรับโหมด 'no match' และเขียนตัวตรวจจับรหัสเฉพาะเพื่อปูทางสู่ Hybrid Search ({{bm25}} + {{rrf}}) ใน Phase 4",
    },
    {
      node: 4,
      heading: "ส่งเฉพาะบริบทที่ผ่านเกณฑ์เข้าสู่ชั้นตอบคำถาม",
      body: "การกรองเอกสารที่คะแนนต่ำกว่าเกณฑ์ตั้งแต่ชั้น retrieval ช่วยลดอาการตอบมั่วใน {{rag}} และเปิดทางให้แอปตอบอย่างสุภาพว่าไม่พบข้อมูลหรือส่งต่อเจ้าหน้าที่",
      lessonNote: "แบบฝึกหัดวันนี้ให้คุณสร้างตัวค้นหา FAQ ไทยที่ผ่านชุดเทสต์ครบทั้งเคสคำพ้อง เคสนอกเรื่อง และเคสรหัสเฉพาะ",
    },
  ],

  objectives: [
    "**สร้าง** ระบบ Thai Semantic FAQ Retriever ด้วย `unit_q @ unit_corpus.T` และการจัดอันดับ {{top-k}} แบบ deterministic บน CPU",
    "**ออกแบบ** กลไก `min_score` threshold เพื่อตรวจจับคำถามนอกขอบเขต (no match / abstention) แทนการฝืนคืนเอกสารที่ไม่เกี่ยวข้อง",
    "**วิเคราะห์** จุดแข็งของ Dense Search บนคำพ้องภาษาไทย (`ขอใบเสร็จ` ↔ `ใบกำกับภาษี`) และจุดบอดบนรหัสเฉพาะ (`#INV-2026-0842`) เพื่อเชื่อมโยงสู่ Hybrid Search ใน Phase 4",
  ],

  prerequisites: [
    "การสร้าง Dense Embeddings, E5 Prefix และ L2 Normalization (Day 69)",
    "การคำนวณ {{cosine-similarity}} และ {{dot-product}} ด้วย NumPy (Days 37–38)",
    "Python dataclasses, `re` (regex พื้นฐาน) และ `pytest`",
    "รันได้ 100% บน CPU ไม่ต้องใช้ API key",
  ],

  setup: {
    intro: "ใช้โปรเจกต์ `uv` เดิมจาก Day 69 หรือสร้างโฟลเดอร์ใหม่สำหรับ Day 70 ที่มี `numpy`, `sentence-transformers` และ `pytest`",
    commands: `uv init ai-day70 && cd ai-day70
uv add numpy sentence-transformers
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('Ready with NumPy', np.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day70` หรือใช้สภาพแวดล้อมจาก Day 69"],
      ["deps", "ติดตั้ง `numpy`, `sentence-transformers`, `pytest` และ `ruff`"],
      ["verify", "ทดสอบรัน Python และ NumPy สำเร็จพร้อมเขียน Semantic Retriever"],
    ],
    note: "การทำแบบฝึกหัดและ `pytest` สามารถรันได้ 100% แบบออฟไลน์ด้วย Mock Embedder ที่กำหนดเอง โดยไม่ต้องรอโหลดน้ำหนักโมเดลทุกครั้ง",
  },

  concepts: [
    {
      id: "exact-nearest-neighbor-numpy",
      title: "1 · Exact Nearest Neighbor Search บน CPU (`unit_q @ unit_corpus.T`)",
      paragraphs: [
        "หลายคนมักรีบติดตั้ง Vector Database ขนาดใหญ่ตั้งแต่วันแรกทั้งที่คลัง FAQ ของบริษัทมีเพียง 500 หรือ 10,000 ชิ้น ความจริงคือเมื่อคลังเอกสารเป็น unit-normalized `float32` เมทริกซ์รูป `(N, D)` การค้นหาแบบ **Exact Brute-Force Nearest Neighbor** ด้วย `scores = corpus_matrix @ query_vec` ใช้เวลาเพียง ~0.2–2 มิลลิวินาทีบน CPU ธรรมดาสำหรับ `N = 10,000, D = 384`",
        "ข้อดีของ Exact Search คือได้ความแม่นยำ 100% (ไม่มี approximation error) โค้ดสั้น ดีบักง่าย และไม่ต้องดูแลโครงสร้างพื้นฐานเพิ่ม เมื่อปริมาณเอกสารโตขึ้นถึงหลักแสนหรือหลักล้านชิ้น หรือต้องกรอง metadata ซับซ้อน เราจึงค่อยขยับไปใช้ Approximate Nearest Neighbor อย่าง {{hnsw}} ใน pgvector/Qdrant (Phase 4)",
        "รายละเอียดเล็ก ๆ ที่มืออาชีพใส่ใจคือ **Deterministic Tie-Breaking**: เวลาเอกสาร 2 ชิ้นได้คะแนนเท่ากัน (เช่น `0.8500` เท่ากัน) การใช้ `sorted(..., key=lambda x: (-x.score, x.doc_id))` รับประกันว่าลำดับผลลัพธ์จะเหมือนกันทุกครั้งที่รันและไม่ทำให้เทสต์แกว่ง",
      ],
      analogy: "ถ้ามีรายชื่อลูกค้าแค่ 500 คน เปิดตารางสแกนตรง ๆ ใน RAM เสร็จในพริบตาและไม่มีทางพลาดสักคน — เราจะสร้างสารบัญแบ่งหมวดหมู่ซับซ้อน (HNSW) ก็ต่อเมื่อสมุดรายชื่อหนาเป็นล้านหน้าแล้ว",
      code: {
        language: "python",
        filename: "exact_nn.py",
        code: `import numpy as np


def top_k_cosine(
    unit_query: np.ndarray,
    unit_corpus: np.ndarray,
    doc_ids: list[str],
    top_k: int = 3,
    min_score: float = 0.0,
) -> list[tuple[str, float]]:
    scores = unit_corpus @ unit_query  # shape: (N,)
    pairs = [
        (doc_id, float(score))
        for doc_id, score in zip(doc_ids, scores, strict=True)
        if float(score) >= min_score
    ]
    pairs.sort(key=lambda item: (-item[1], item[0]))
    return pairs[:top_k]`,
        caption: "Exact Cosine Search + `min_score` filter + deterministic tie-breaking ในโค้ดไม่ถึง 15 บรรทัด",
      },
      whyTitle: "Why this matters — เริ่มจาก Exact Baseline ก่อนเสมอ",
      whyParagraphs: [
        "ในการสร้างระบบค้นหาหรือ {{rag}} การมี Exact Brute-Force baseline ใน NumPy ช่วยให้คุณวัดคุณภาพของโมเดล {{embedding}} และคุณภาพข้อมูลได้ตรง ๆ โดยไม่มีตัวแปรแทรกจากค่าพารามิเตอร์ของ Vector DB",
        "เมื่อย้ายขึ้น {{hnsw}} ใน Phase 4 คุณสามารถเทียบผลลัพธ์กับ Exact Baseline ตัวนี้เพื่อเช็กว่าดัชนีใหม่ทำ Recall ตกไปกี่เปอร์เซ็นต์",
      ],
    },
    {
      id: "score-threshold-abstention",
      title: "2 · Score Threshold สำหรับโหมด \"ไม่พบข้อมูล\" (No Match / Abstention)",
      paragraphs: [
        "ฟังก์ชัน Nearest Neighbor มีนิสัยอย่างหนึ่งที่อันตรายมากใน production: **มันจะคืนเอกสารอันดับ 1 เสมอไม่ว่าคำถามจะเกี่ยวข้องหรือไม่ก็ตาม** หากคลังเอกสารของคุณมีแต่คู่มือการเงินบริษัท แล้วลูกค้าพิมพ์ถามว่า *\"วิธีทำแกงเขียวหวานไก่\"* ระบบที่ไม่มี threshold จะยังหยิบเอกสารที่มีคะแนนสูงสุด (เช่น `0.71` ในโมเดล E5) ส่งต่อไปให้ LLM ตอบแบบมั่ว ๆ",
        "วิธีป้องกันด่านแรกคือกำหนด **`min_score` threshold** ที่ผ่านการคาลิเบรตจากชุดคำถามจริง 2 กลุ่ม: (1) คำถามที่ **มีคำตอบในคลัง** (in-domain) และ (2) คำถามที่ **ไม่มีคำตอบในคลัง** (out-of-domain) เพื่อหาจุดตัดที่แยกสองกลุ่มออกจากกันได้ดีที่สุด",
        "เมื่อไม่มีเอกสารใดได้คะแนนถึง `min_score` ฟังก์ชัน `search()` ควรคืนลิสต์ว่าง `[]` อย่างซื่อสัตย์ เพื่อให้ชั้นแอปพลิเคชันแจ้งผู้ใช้ว่า *\"ไม่พบข้อมูลที่เกี่ยวข้องในระบบ\"* หรือส่งต่อให้เจ้าหน้าที่แทนการฝืนสร้างคำตอบ",
      ],
      analogy: "เหมือนพนักงานต้อนรับที่รู้จักพูดว่า \"ขอโทษครับ เรื่องนี้ไม่ได้อยู่ในคู่มือ เดี๋ยวโอนสายให้เจ้าหน้าที่นะครับ\" แทนที่จะหยิบโบรชัวร์ที่ใกล้เคียงที่สุดแล้วแต่งคำตอบให้ลูกค้า",
      bullets: [
        "**ห้าม copy ตัวเลข threshold ข้ามโมเดล**: `0.78` อาจพอดีกับ `multilingual-e5-small` แต่สูงเกินไปสำหรับ `BAAI/bge-m3` หรือ `text-embedding-3-small`",
        "**วัด 2 การกระจาย (Distributions)**: เก็บคะแนน Top-1 ของคำถามที่มีคำตอบ vs คำถามนอกเรื่อง แล้วเลือกจุดตัดตามความเสี่ยงของธุรกิจ",
        "**Fallback UX**: คืน `[]` แปลว่า *Abstain* ไม่ใช่ crash — แอปควรมีข้อความ fallback หรือปุ่มติดต่อเจ้าหน้าที่รองรับเสมอ",
      ],
      whyTitle: "Why this matters — ตัดต้นตอ Hallucination ตั้งแต่ชั้น Retrieval",
      whyParagraphs: [
        "กว่าครึ่งของอาการตอบมั่วในระบบ {{rag}} ไม่ได้เกิดจาก LLM แต่เกิดจากการที่ตัวค้นหาป้อนเอกสารที่ไม่เกี่ยวข้องเข้าไปใน prompt แล้วบังคับให้โมเดลตอบ",
        "การตั้ง `min_score` gate ที่ผ่านการวัดผลจริงคือด่านคัดกรองที่ถูกที่สุดและเห็นผลเร็วที่สุดก่อนส่งข้อความไปเสียเงินค่า LLM",
      ],
    },
    {
      id: "semantic-superpower-vs-exact-id-blindspot",
      title: "3 · จุดแข็งบนคำพ้องไทย vs จุดบอดบนรหัสเฉพาะ (`#INV-2026-0842`)",
      paragraphs: [
        "จุดแข็งที่น่าทึ่งของ Semantic Search บนภาษาไทยคือมันจัดการ **คำพ้อง ภาษาพูด และประโยคที่ไม่เว้นวรรค** ได้ดีมาก เช่น ลูกค้าพิมพ์ *\"ขอใบเสร็จหน่อย\"* หรือ *\"จ่ายตังค์ไปแล้วจะเอาบิลไปเบิกบริษัท\"* ระบบจับคู่กับเอกสารทางการที่เขียนว่า *\"ขั้นตอนการขอใบกำกับภาษีเต็มรูปแบบ\"* ได้ทันที แม้ไม่มีคำไหนซ้ำกันเลย",
        "แต่เหรียญมีสองด้านเสมอ — **จุดบอดคลาสสิกของ Dense Embeddings คือรหัสเฉพาะ (Exact Identifiers)** เช่น เลขที่ใบแจ้งหนี้ `#INV-2026-0842`, รหัสสินค้า `SKU-TH-9914`, หรือรหัสข้อผิดพลาด `ERR_GATEWAY_504` เพราะโมเดลแปลงข้อความทั้งประโยคเป็นความหมายภาพรวม (\"ใบแจ้งหนี้ปี 2026\") ทำให้ `#INV-2026-0842` กับ `#INV-2026-0843` มีเวกเตอร์เกือบทับกันสนิท (cosine ~0.97–0.99)",
        "นี่คือเหตุผลที่ระบบค้นหาระดับ production ใน Phase 4 ไม่พึ่ง Dense Search เพียงอย่างเดียว แต่จะจับคู่ Dense Embeddings เข้ากับ Lexical Search อย่าง **{{bm25}}** (ที่จับรหัสเป๊ะ ๆ ได้ 100%) แล้วรวมอันดับด้วย **{{rrf}} (Hybrid Search)** — วันนี้เราจะเริ่มจากการเขียนตัวตรวจจับ exact code query เพื่อตระหนักรู้และเตรียม routing ไว้ล่วงหน้า",
      ],
      analogy: "Dense Search เหมือนบรรณารักษ์ที่จำ *เนื้อเรื่อง* หนังสือทุกเล่มได้แม่น แต่จำ *เลข ISBN 13 หลัก* สลับกันประจำ — ถ้าต้องการหาด้วยรหัสเป๊ะ ๆ ต้องให้สารบัญคำตรง (BM25) หรือฐานข้อมูลช่วยค้นควบคู่กัน",
      bullets: [
        "**Dense Search ชนะขาด**: คำพ้อง (`ใบเสร็จ` ↔ `ใบกำกับภาษี`), ภาษาพูด (`แอปเด้ง`), คำถามไทยปนอังกฤษ (`reset รหัสผ่าน`)",
        "**Dense Search แพ้ทาง**: เลขใบแจ้งหนี้ (`INV-2026-0842`), เลขพัสดุ, SKU, ชื่อรุ่นสินค้าที่มีเลขต่างกันหลักเดียว",
        "**ทางแก้ระยะยาว (Phase 4)**: Hybrid Search = Dense Embeddings + PyThaiNLP {{bm25}} + {{rrf}} Fusion",
      ],
      whyTitle: "Why this matters — รู้ขีดจำกัดของเครื่องมือก่อนเอาขึ้น Production",
      whyParagraphs: [
        "วิศวกร AI ที่เก่งไม่ได้ถามแค่ว่า *\"เครื่องมือนี้ทำอะไรได้บ้าง\"* แต่ถามก่อนเสมอว่า *\"มันจะพังกับเคสแบบไหน\"*",
        "การเห็นด้วยตาตัวเองในวันนี้ว่า Dense Search แยก `#INV-2026-0842` กับ `#INV-2026-0843` ไม่ออก จะทำให้คุณเข้าใจทันทีว่าทำไม Hybrid RAG ใน Phase 4 จึงเป็นมาตรฐานอุตสาหกรรม ไม่ใช่ความซับซ้อนเกินจำเป็น",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Semantic Search กับ SQL `LIKE` และ Full-Text Search",
      body: [
        "ในเว็บแอปทั่วไป คุณมักเริ่มจาก `WHERE title LIKE '%ใบเสร็จ%'` หรือ PostgreSQL `tsvector` — วิธีนี้หาคำว่า `#INV-2026-0842` ได้แม่น 100% แต่หาคำพ้องอย่าง `ขอใบเสร็จ` → `ใบกำกับภาษี` ไม่เจอเลย",
        "Semantic Search ทำหน้าที่ตรงกันข้าม: จับความหมายและคำพ้องได้ดีมาก แต่หลวมเรื่องรหัสเป๊ะ ดังนั้นในระบบจริงเราจึงมักใช้ทั้งสองอย่างร่วมกัน เหมือนมีทั้ง Fuzzy/Semantic index และ Exact B-Tree/BM25 index",
      ],
      table: [
        ["SQL `WHERE id = 'INV-2026-0842'`", "แม่น 100% สำหรับรหัสเฉพาะ แต่หาคำพ้องไม่ได้เลย"],
        ["Dense Semantic Search (`unit_q @ D.T`)", "จับคำพ้องและภาษาพูดไทยได้ดีมาก แต่สับสนเลขรหัสใกล้กัน"],
        ["`min_score` Threshold", "HTTP 404 / Empty state แทนการคืนผลลัพธ์มั่ว"],
        ["Exact-Code Query Detector", "Route guard ที่ส่งคำถามรหัสเฉพาะไปหา Lexical/DB Lookup"],
      ],
    },
    student: {
      title: "First-Year Note — Nearest Neighbor คือการหาค่ามากสุดในอาเรย์ 1 มิติ",
      body: [
        "คำว่า *\"Nearest Neighbor Search\"* ฟังดูเหมือนอัลกอริทึมขั้นสูง แต่ในเวอร์ชัน Exact ที่เราเขียนวันนี้ มันคือการคูณเมทริกซ์ `corpus_matrix @ query_vec` ได้อาเรย์คะแนน 1 มิติความยาว `N` แล้วเรียงลำดับจากมากไปน้อยเพื่อหยิบ `k` ตัวแรกเท่านั้นเอง",
        "สิ่งที่เปลี่ยนจากโค้ดจัดอันดับธรรมดาให้กลายเป็นระบบ AI ที่ใช้งานได้จริง คือการคิดเผื่อกรณีขอบ เช่น เอกสารไม่มีคำตอบ (`min_score`) และกรณีที่เวกเตอร์ไม่ถนัด (รหัสเฉพาะ)",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: สร้าง Thai Semantic FAQ Retriever ด้วย `multilingual-e5-small` เพื่อทดสอบ 3 สถานการณ์จริง — คำถามคำพ้องภาษาไทย, คำถามนอกเรื่องที่ต้องถูกกรองด้วย `min_score`, และจุดบอดเมื่อค้นด้วยเลขใบแจ้งหนี้เฉพาะ",
    steps: [
      {
        title: "1 · สร้างดัชนี FAQ ภาษาไทยและทดสอบคำถามคำพ้อง",
        explain: "Encode คลังเอกสาร 5 ชิ้นด้วย prefix `passage: ` เก็บเป็น unit matrix แล้วค้นหาด้วยคำถามภาษาพูดว่า *\"ขอใบเสร็จไปเบิกบริษัทหน่อย\"*",
        code: {
          language: "python",
          filename: "worked_day70.py",
          code: `import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("intfloat/multilingual-e5-small", device="cpu")

faq_docs = [
    ("FAQ-01", "ขั้นตอนการขอออกใบกำกับภาษีเต็มรูปแบบภายใน 7 วันหลังชำระเงิน"),
    ("FAQ-02", "นโยบายคืนเงินกรณีระบบตัดบัตรเครดิตซ้ำ ใช้เวลาดำเนินการ 5-7 วันทำการ"),
    ("FAQ-03", "วิธีเปลี่ยนรหัสผ่านและเปิดยืนยันตัวตนสองชั้น (2FA) ในหน้าตั้งค่าบัญชี"),
    ("FAQ-04", "ใบแจ้งหนี้ #INV-2026-0842 สถานะชำระแล้ว ยอด 1,070 บาท"),
    ("FAQ-05", "ใบแจ้งหนี้ #INV-2026-0843 สถานะรอตรวจสอบ ยอด 4,280 บาท"),
]

doc_ids = [doc_id for doc_id, _ in faq_docs]
corpus_vecs = model.encode(
    [f"passage: {text}" for _, text in faq_docs],
    normalize_embeddings=True,
    show_progress_bar=False,
)


def search_faq(query: str, top_k: int = 2, min_score: float = 0.80):
    q_vec = model.encode([f"query: {query}"], normalize_embeddings=True, show_progress_bar=False)[0]
    scores = corpus_vecs @ q_vec
    hits = [
        (doc_ids[i], float(scores[i]), faq_docs[i][1])
        for i in range(len(doc_ids))
        if float(scores[i]) >= min_score
    ]
    hits.sort(key=lambda x: (-x[1], x[0]))
    return hits[:top_k]


for doc_id, score, text in search_faq("ขอใบเสร็จไปเบิกบริษัทหน่อย"):
    print(f"{doc_id} ({score:.3f}): {text}")`,
        },
        output: `FAQ-01 (0.879): ขั้นตอนการขอออกใบกำกับภาษีเต็มรูปแบบภายใน 7 วันหลังชำระเงิน`,
      },
      {
        title: "2 · ทดสอบคำถามนอกเรื่องด้วย `min_score=0.80` (Abstention)",
        explain: "ถามเรื่องที่ไม่เกี่ยวกับคลัง FAQ เลย (*\"สูตรต้มยำกุ้งน้ำข้นใส่นมสด\"*) ดูคะแนนดิบสูงสุดเทียบกับผลเมื่อเปิด `min_score=0.80`",
        code: {
          language: "python",
          filename: "worked_day70.py",
          code: `ood_query = "สูตรต้มยำกุ้งน้ำข้นใส่นมสด"
raw_hits = search_faq(ood_query, top_k=2, min_score=0.0)
guarded_hits = search_faq(ood_query, top_k=2, min_score=0.80)

print("Without threshold ->", [(d, round(s, 3)) for d, s, _ in raw_hits])
print("With min_score=0.80 ->", guarded_hits)`,
        },
        output: `Without threshold -> [('FAQ-01', 0.728), ('FAQ-02', 0.719)]
With min_score=0.80 -> []`,
      },
      {
        title: "3 · พิสูจน์จุดบอดของ Dense Search บนรหัสใบแจ้งหนี้เฉพาะ",
        explain: "ค้นหา `#INV-2026-0843` แล้วดูคะแนนของ `FAQ-04` (`#INV-2026-0842`) เทียบกับ `FAQ-05` (`#INV-2026-0843`) — จะเห็นว่าคะแนนต่างกันเพียง `~0.004` ซึ่งเปราะบางมากเมื่อมีใบแจ้งหนี้หลายพันฉบับ",
        code: {
          language: "python",
          filename: "worked_day70.py",
          code: `id_hits = search_faq("เช็กสถานะบิล #INV-2026-0843", top_k=3, min_score=0.0)
for doc_id, score, text in id_hits:
    print(f"{doc_id} ({score:.4f}): {text}")`,
        },
        output: `FAQ-05 (0.9162): ใบแจ้งหนี้ #INV-2026-0843 สถานะรอตรวจสอบ ยอด 4,280 บาท
FAQ-04 (0.9121): ใบแจ้งหนี้ #INV-2026-0842 สถานะชำระแล้ว ยอด 1,070 บาท
FAQ-01 (0.8104): ขั้นตอนการขอออกใบกำกับภาษีเต็มรูปแบบภายใน 7 วันหลังชำระเงิน`,
      },
    ],
    gotcha: "ในคลังทดสอบแค่ 5 เอกสาร `#INV-2026-0843` อาจยังเฉือนชนะ `#INV-2026-0842` ด้วยส่วนต่างแค่ `0.004` แต่ทันทีที่คลังมีใบแจ้งหนี้จริง 10,000 ฉบับ ข้อความประกอบอื่น ๆ ในเอกสาร (เช่น ชื่อสินค้าหรือวันที่) จะกลบความต่างของเลข 4 หลักท้ายจน Dense Search ดึงผิดบิลได้ง่ายมาก — นี่คือเหตุผลที่รหัสเฉพาะต้องใช้ Lexical Search / DB Lookup ช่วยเสมอ",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day70.py` ที่มีคลาส `ThaiSemanticIndex` สำหรับเก็บเวกเตอร์ FAQ ไทย, ค้นหาแบบ Exact Nearest Neighbor พร้อม `min_score` abstention, และฟังก์ชัน `detect_exact_code_query` เพื่อระบุคำถามที่มีรหัสเฉพาะ",
    requirements: [
      "สร้าง `@dataclass(frozen=True) class SearchHit` มีฟิลด์ `doc_id: str`, `text: str`, `score: float`",
      "สร้างคลาส `ThaiSemanticIndex(encode_passages, encode_query)` โดยเมธอด `add_documents(docs: list[tuple[str, str]]) -> int` ตรวจว่า `docs` ไม่ว่าง, ไม่มี `doc_id` ซ้ำ (raise `ValueError`), เรียก `encode_passages`, ทำ L2 normalization, เก็บในหน่วยความจำ และคืนจำนวนเอกสารทั้งหมดในดัชนี",
      "เมธอด `search(query: str, *, top_k: int = 3, min_score: float = 0.0) -> list[SearchHit]` ตรวจว่า `top_k > 0`, `query.strip()` ไม่ว่าง, และดัชนีมีเอกสารแล้ว (ถ้ายังว่าง raise `ValueError`), คำนวณ `unit_corpus @ unit_query`, กรองเฉพาะ `score >= min_score`, เรียงด้วย `(-score, doc_id)` และคืนไม่เกิน `top_k` รายการ",
      "สร้างฟังก์ชัน `detect_exact_code_query(query: str) -> list[str]` ใช้ regex ดึงรหัสเฉพาะรูปแบบตัวอักษรอังกฤษใหญ่ 2–6 ตัว + ขีด + ตัวเลข/ตัวอักษรอย่างน้อย 3 ตัว (เช่น `INV-2026-0842`, `ORD-9912`, `ERR-504`, `SKU-TH-991`) คืนเป็นลิสต์รหัสที่พบ (ไม่รวมเครื่องหมาย `#` นำหน้า)",
    ],
    starter: {
      language: "python",
      filename: "exercise_day70.py",
      code: `from collections.abc import Callable
from dataclasses import dataclass
import re
import numpy as np


@dataclass(frozen=True)
class SearchHit:
    doc_id: str
    text: str
    score: float


def _l2_normalize(vectors: np.ndarray) -> np.ndarray:
    arr = np.asarray(vectors, dtype=np.float32)
    if arr.ndim == 1:
        arr = arr[None, :]
    norms = np.linalg.norm(arr, ord=2, axis=1, keepdims=True)
    safe_norms = np.where(norms == 0.0, 1.0, norms)
    return (arr / safe_norms).astype(np.float32)


class ThaiSemanticIndex:
    def __init__(
        self,
        encode_passages: Callable[[list[str]], np.ndarray],
        encode_query: Callable[[str], np.ndarray],
    ) -> None:
        self._encode_passages = encode_passages
        self._encode_query = encode_query
        self._doc_ids: list[str] = []
        self._texts: list[str] = []
        self._matrix: np.ndarray | None = None

    def add_documents(self, docs: list[tuple[str, str]]) -> int:
        # TODO: ตรวจ docs ไม่ว่างและ doc_id ไม่ซ้ำ, encode + normalize, เก็บใน index และคืนจำนวนเอกสารรวม
        raise NotImplementedError

    def search(
        self,
        query: str,
        *,
        top_k: int = 3,
        min_score: float = 0.0,
    ) -> list[SearchHit]:
        # TODO: ตรวจ query, top_k, และ index ไม่ว่าง -> คำนวณ cosine -> กรอง min_score -> เรียง (-score, doc_id)
        raise NotImplementedError


def detect_exact_code_query(query: str) -> list[str]:
    # TODO: ใช้ regex หารหัสเฉพาะ เช่น INV-2026-0842, ORD-9912, SKU-TH-991
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day70.py",
      code: `import numpy as np
import pytest
from exercise_day70 import SearchHit, ThaiSemanticIndex, detect_exact_code_query


def mock_embed_text(text: str) -> np.ndarray:
    """Deterministic 4-d topic embedder สำหรับเทสต์ออฟไลน์: [billing, auth, shipping, refund]."""
    vec = np.array([0.05, 0.05, 0.05, 0.05], dtype=np.float32)
    if any(k in text for k in ("ใบเสร็จ", "ใบกำกับภาษี", "invoice", "บิล")):
        vec[0] += 1.0
    if any(k in text for k in ("รหัสผ่าน", "password", "ล็อกอิน", "2FA")):
        vec[1] += 1.0
    if any(k in text for k in ("พัสดุ", "จัดส่ง", "ขนส่ง")):
        vec[2] += 1.0
    if any(k in text for k in ("คืนเงิน", "ตัดบัตรซ้ำ", "refund")):
        vec[3] += 1.0
    return vec


def build_index() -> ThaiSemanticIndex:
    idx = ThaiSemanticIndex(
        encode_passages=lambda texts: np.vstack([mock_embed_text(t) for t in texts]),
        encode_query=mock_embed_text,
    )
    idx.add_documents([
        ("FAQ-02", "นโยบายการคืนเงินเมื่อตัดบัตรซ้ำ"),
        ("FAQ-01", "การออกใบกำกับภาษีเต็มรูปแบบสำหรับนิติบุคคล"),
        ("FAQ-03", "วิธีรีเซ็ตรหัสผ่านและตั้งค่า 2FA"),
    ])
    return idx


def test_semantic_synonym_match_and_ranking():
    idx = build_index()
    hits = idx.search("ขอใบเสร็จไปเบิกบริษัท", top_k=2, min_score=0.5)
    assert len(hits) == 1
    assert isinstance(hits[0], SearchHit)
    assert hits[0].doc_id == "FAQ-01"
    assert hits[0].score > 0.9


def test_abstention_when_below_min_score():
    idx = build_index()
    hits = idx.search("สูตรต้มยำกุ้งน้ำข้น", top_k=3, min_score=0.75)
    assert hits == []


def test_validation_and_duplicate_doc_id():
    idx = build_index()
    with pytest.raises(ValueError):
        idx.add_documents([("FAQ-01", "ซ้ำกับของเดิม")])
    with pytest.raises(ValueError):
        idx.search("   ", top_k=2)
    with pytest.raises(ValueError):
        idx.search("ขอใบเสร็จ", top_k=0)


def test_detect_exact_code_query():
    assert detect_exact_code_query("เช็กสถานะบิล #INV-2026-0842 กับ ORD-9912") == [
        "INV-2026-0842",
        "ORD-9912",
    ]
    assert detect_exact_code_query("แจ้ง error ERR-504 บนสินค้า SKU-TH-991") == [
        "ERR-504",
        "SKU-TH-991",
    ]
    assert detect_exact_code_query("ขอใบเสร็จรับเงินหน่อยครับ") == []
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases แบบออฟไลน์ในเวลา < 1 วินาที",
      "ตรวจสอบว่า `search(\"สูตรต้มยำกุ้งน้ำข้น\", min_score=0.75)` คืนลิสต์ว่าง `[]` ไม่ฝืนคืนเอกสารมั่ว",
      "ตรวจสอบว่า `add_documents` โยน `ValueError` เมื่อใส่ `doc_id` ซ้ำกับที่มีอยู่แล้ว",
      "ตรวจสอบว่า `detect_exact_code_query` แยกรหัสอย่าง `INV-2026-0842`, `ORD-9912`, `SKU-TH-991` ออกจากคำถามภาษาไทยได้แม่นยำ",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day70.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `add_documents` ให้ตรวจ `existing = set(self._doc_ids)` และเช็กซ้ำทั้งกับของเดิมและภายในลิสต์ใหม่ (`len(new_ids) != len(set(new_ids))`) ถ้า `self._matrix is None` ให้กำหนดตรง ๆ แต่ถ้ามีอยู่แล้วให้ต่อด้วย `np.vstack([self._matrix, normed])`",
      },
      {
        body: "ใน `search` ให้แปลงผลจาก `self._encode_query(query)` ผ่าน `_l2_normalize` แล้วดึงแถว `[0]` มาคูณ `self._matrix @ q_vec` ส่วน regex ของ `detect_exact_code_query` ใช้ `r\"\\b[A-Z]{2,6}-(?:[A-Z0-9]+-)*[A-Z0-9]{3,}\\b\"`",
      },
      {
        body: "ตัวอย่างโครงเมธอด `search` และ `detect_exact_code_query` — เติม `add_documents` ให้ครบแล้วรันเทสต์",
        code: {
          language: "python",
          filename: "hint_day70.py",
          code: `import re
import numpy as np

CODE_PATTERN = re.compile(r"\b[A-Z]{2,6}-(?:[A-Z0-9]+-)*[A-Z0-9]{3,}\b")


def detect_exact_code_query(query: str) -> list[str]:
    return CODE_PATTERN.findall(query)


def search_helper(matrix: np.ndarray, doc_ids: list[str], texts: list[str], q_unit: np.ndarray, top_k: int, min_score: float):
    scores = matrix @ q_unit
    hits = [
        (doc_ids[i], texts[i], float(scores[i]))
        for i in range(len(doc_ids))
        if float(scores[i]) >= min_score
    ]
    hits.sort(key=lambda item: (-item[2], item[0]))
    return hits[:top_k]`,
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
      title: "ไม่ตั้ง `min_score` Threshold แล้วปล่อยให้ Top-1 ไหลเข้า LLM ทุกคำถาม",
      symptom: "ผู้ใช้ถามเรื่องนอกขอบเขตของระบบ แต่บอตยังหยิบเอกสารที่ไม่เกี่ยวเลยมาแต่งคำตอบอย่างมั่นใจ",
      fix: "คาลิเบรต `min_score` จากคำถาม in-domain vs out-of-domain ของโมเดลที่ใช้อยู่ และคืน `[]` เพื่อเข้าสู่โหมด abstention เมื่อไม่มีเอกสารผ่านเกณฑ์",
    },
    {
      title: "คาดหวังให้ Dense Embeddings ค้นหารหัสใบแจ้งหนี้หรือ SKU แม่น 100%",
      symptom: "ลูกค้าถามถึง `#INV-2026-0842` แต่ระบบดึง `#INV-2026-0843` หรือ `#INV-2026-0819` ขึ้นมาแทนเพราะคะแนนใกล้กันมาก",
      fix: "ตรวจจับรหัสเฉพาะและใช้ Database lookup หรือ Hybrid Search (Dense + {{bm25}} + {{rrf}} ใน Phase 4) ควบคู่กัน",
    },
    {
      title: "เรียงลำดับผลลัพธ์โดยไม่ทำ Tie-Breaking",
      symptom: "เมื่อเอกสารสองชิ้นได้คะแนนเท่ากัน ลำดับ Top-K เปลี่ยนไปมาระหว่างการรันหรือเมื่อเปลี่ยนวิธี sort",
      fix: "ใช้คีย์เรียงแบบ tuple `(-score, doc_id)` เสมอเพื่อให้ลำดับผลลัพธ์คงที่ 100%",
    },
    {
      title: "รีบตั้ง Vector Database ซับซ้อนทั้งที่คลังข้อมูลมีไม่กี่พันแถว",
      symptom: "เสียเวลาดีบักเครือข่าย Docker/HNSW แทนที่จะโฟกัสคุณภาพข้อความและ chunking",
      fix: "เริ่มด้วย Exact NumPy Search สำหรับข้อมูลหลักพันถึงหลักหมื่นชิ้นเพื่อวัด baseline ให้ชัด แล้วค่อยย้ายขึ้น pgvector/Qdrant เมื่อสเกลหรือ metadata filtering ต้องการ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d070-q1",
        "เหตุใดระบบ Semantic Search ด้วย Nearest Neighbor จึงต้องมี `min_score` threshold?",
        [
          ["เพราะ NumPy จะ error ถ้าไม่ส่งค่า `min_score`", "NumPy ไม่ได้บังคับ `min_score` — เป็นตรรกะฝั่งแอปพลิเคชันที่เราออกแบบเอง"],
          ["เพราะ Nearest Neighbor จะคืนเอกสารอันดับ 1 เสมอแม้คำถามจะไม่เกี่ยวกับคลังเอกสารเลย `min_score` ช่วยคัดกรองเพื่อให้ระบบปฏิเสธคำถามนอกเรื่องได้", "ถูก — ช่วยลดการป้อนบริบทมั่วเข้า RAG และป้องกันคำตอบที่ผิดพลาด"],
          ["เพื่อให้การคูณเมทริกซ์ `unit_q @ unit_corpus.T` เร็วขึ้น 10 เท่า", "การกรองเกิดขึ้นหลังคูณเมทริกซ์แล้ว จึงไม่ได้ลดเวลาคูณเมทริกซ์"],
          ["เพื่อแปลงคะแนน Cosine Similarity ให้อยู่ในช่วง 0 ถึง 100", "threshold ไม่ได้เปลี่ยนสเกลของคะแนน แต่ใช้ตัดสินใจรับหรือปฏิเสธผลลัพธ์"],
        ],
        "B",
        "Nearest Neighbor ไม่มีแนวคิด 'ไม่พบข้อมูล' โดยธรรมชาติ เราจึงต้องใช้ `min_score` ที่ผ่านการคาลิเบรตเพื่อเปิดโหมด abstention สำหรับคำถามนอกขอบเขต",
        "ทำไม Nearest Neighbor Search จึงต้องมี `min_score` threshold?",
        "เพราะมันจะคืน Top-1 เสมอแม้คำถามจะนอกเรื่อง `min_score` ช่วยคืน 'ไม่พบข้อมูล' (abstention) แทนการส่งบริบทผิดเข้า LLM",
      ),
      mc(
        "d070-q2",
        "คำถามแบบใดที่ Dense Semantic Search มักทำได้ **แย่กว่า** Keyword/BM25 Search?",
        [
          ["\"ขอใบเสร็จไปเบิกบริษัท\" เทียบกับเอกสาร \"การออกใบกำกับภาษีเต็มรูปแบบ\"", "นี่คือจุดแข็งของ Dense Search เพราะจับคำพ้องความหมายได้ดีมาก"],
          ["\"ลืมรหัสเข้าแอปทำไง\" เทียบกับเอกสาร \"ขั้นตอนรีเซ็ต Password บัญชีผู้ใช้\"", "นี่ก็เป็นจุดแข็งของ Dense Search เพราะจับภาษาพูดไทยและไทยปนอังกฤษได้"],
          ["\"เช็กสถานะใบแจ้งหนี้ #INV-2026-0842\" ในคลังที่มีใบแจ้งหนี้คล้ายกัน 5,000 ใบ", "ถูก — รหัสตัวเลขเฉพาะที่ต่างกันไม่กี่หลักมีเวกเตอร์ความหมายใกล้กันมากจน Dense Search สับสนได้ง่าย"],
          ["\"How to get a refund?\" เทียบกับเอกสารภาษาไทยเรื่องนโยบายคืนเงิน", "Multilingual Dense Search ทำได้ดีมากในงานข้ามภาษา ในขณะที่ BM25 ทำไม่ได้เลย"],
        ],
        "C",
        "Dense Embeddings ยุบความหมายทั้งประโยคเป็นพิกัดรวม จึงอ่อนไหวต่อรหัสเฉพาะอย่างเลขใบแจ้งหนี้ SKU หรือ error code — ซึ่งเป็นเหตุผลที่ Phase 4 ใช้ Hybrid Search",
        "จุดบอดสำคัญของ Dense Semantic Search ที่ต้องพึ่ง BM25 / Hybrid Search มาช่วยคือคำถามประเภทใด?",
        "คำถามที่ระบุรหัสเฉพาะแบบตรงตัว เช่น เลขใบแจ้งหนี้ (`#INV-2026-0842`), SKU, เลขพัสดุ หรือ error code",
      ),
      mc(
        "d070-q3",
        "สำหรับคลัง FAQ องค์กรขนาด 5,000 ชิ้น (`dim = 384`, `float32`) วิธีค้นหาใดเหมาะที่สุดสำหรับการสร้าง Baseline เริ่มต้นบนเครื่อง?",
        [
          ["Exact Nearest Neighbor ด้วย NumPy (`unit_corpus @ unit_query`) ใน RAM", "ถูก — 5,000 × 384 ใช้ RAM แค่ ~7.5 MB และคูณเมทริกซ์เสร็จใน <1 ms พร้อมความแม่นยำ 100%"],
          ["ส่งเอกสารทั้ง 5,000 ชิ้นเข้า LLM prompt ทุกครั้งที่ผู้ใช้ถาม", "ช้า แพง และเกิน context window อย่างมหาศาล"],
          ["เทรนโมเดล Transformer ใหม่ตั้งแต่ศูนย์สำหรับ FAQ 5,000 ชิ้นนี้", "เกินจำเป็นและสิ้นเปลืองมาก ใช้ pre-trained multilingual embedding ได้ทันที"],
          ["ตั้งคลัสเตอร์ Distributed Vector Database 5 โหนดทันทีตั้งแต่วันแรก", "ซับซ้อนเกินสเกลข้อมูลและทำให้วัด baseline ช้าลงโดยไม่จำเป็น"],
        ],
        "A",
        "คลังหลักพันถึงหลักหมื่นชิ้นสามารถทำ Exact Search ใน RAM ด้วย NumPy ได้เร็วระดับ sub-millisecond และเป็น baseline ความแม่นยำ 100% ที่ดีเยี่ยม",
        "ทำไมคลังเอกสาร 5,000 ชิ้นจึงควรเริ่มจาก Exact NumPy Search ก่อนขยับไปใช้ HNSW?",
        "เพราะใช้ RAM น้อยมาก (~7.5 MB), ค้นเสร็จใน <1 ms, แม่นยำ 100% (ไม่มี approximation error) และใช้เป็น baseline เทียบคุณภาพในอนาคตได้",
      ),
      mc(
        "d070-q4",
        "ข้อใดคือแนวทางที่ถูกต้องในการเลือกค่า `min_score` สำหรับระบบ Thai Semantic FAQ?",
        [
          ["ใช้ `0.50` เป็นค่ามาตรฐานสากลสำหรับทุกโมเดล embedding บนโลก", "ผิด — โมเดลอย่าง `multilingual-e5-small` ให้คะแนนคำถามนอกเรื่องแถว `0.70+` ทำให้ `0.50` กรองอะไรไม่ได้เลย"],
          ["เก็บชุดคำถามทดสอบทั้งที่มีคำตอบและไม่มีคำตอบในคลัง วัดการกระจายคะแนน Top-1 ของโมเดลที่เลือก แล้วตั้งจุดตัดจากข้อมูลจริง", "ถูก — สเกล cosine ของแต่ละโมเดลไม่เท่ากัน การคาลิเบรตจากข้อมูลจริงคือวิธีเดียวที่เชื่อถือได้"],
          ["ตั้ง `min_score = 0.99` เพื่อให้มั่นใจว่าไม่มีคำตอบผิดหลุดมาเลย", "สูงเกินไป — แม้แต่คำถามคำพ้องที่ถูกต้องเป๊ะก็อาจได้แค่ `0.85–0.92` จนระบบปฏิเสธแทบทุกคำถาม"],
          ["สุ่มค่า `min_score` ใหม่ในทุก request", "ทำให้พฤติกรรมระบบคาดเดาไม่ได้และทดสอบไม่ได้"],
        ],
        "B",
        "ต้องคาลิเบรต `min_score` จากการกระจายคะแนนจริงของโมเดลนั้นบนชุดคำถาม in-domain และ out-of-domain เสมอ",
        "วิธีเลือกค่า `min_score` ที่ถูกต้องสำหรับโมเดล embedding ตัวหนึ่งคืออะไร?",
        "วัดการกระจายคะแนน Top-1 ระหว่างคำถามที่มีคำตอบ (in-domain) กับคำถามนอกเรื่อง (out-of-domain) บนโมเดลนั้นจริง ๆ แล้วเลือกจุดตัดที่สมดุล",
      ),
    ],
  },

  takeaways: [
    "สำหรับคลังเอกสารหลักพันถึงหลักหมื่นชิ้น Exact Search (`unit_corpus @ unit_query`) ใน NumPy เร็วระดับ <1 ms แม่นยำ 100% และเป็น baseline ชั้นดีก่อนขึ้น {{hnsw}}",
    "ตั้ง `min_score` threshold ที่ผ่านการคาลิเบรตจากข้อมูลจริงของโมเดลนั้นเสมอ เพื่อคืน `[]` (abstention) เมื่อคำถามอยู่นอกขอบเขต",
    "Dense {{embedding}} เก่งเรื่องคำพ้องและภาษาพูดไทย (`ขอใบเสร็จ` ↔ `ใบกำกับภาษี`) แต่อ่อนเรื่องรหัสเฉพาะ (`#INV-2026-0842`)",
    "การรู้จุดบอดของ Dense Search ในวันนี้คือสะพานตรงสู่ Hybrid Search ({{bm25}} + Dense + {{rrf}}) ใน Phase 4",
  ],

  reviewCards: [
    rc(
      "d070-rc-1",
      "ทำไม Nearest Neighbor Search ถึงอันตรายถ้าไม่ใส่ `min_score` threshold?",
      "เพราะมันจะคืนเอกสารอันดับ 1 เสมอแม้คำถามจะไม่เกี่ยวข้องกับคลังข้อมูลเลย ทำให้ส่งบริบทมั่วเข้า RAG และเกิด hallucination",
    ),
    rc(
      "d070-rc-2",
      "จุดแข็งและจุดบอดของ Dense Semantic Search บนข้อความไทยคืออะไร?",
      "จุดแข็ง: จับคำพ้อง ภาษาพูด และการค้นข้ามภาษาได้ดีมาก — จุดบอด: สับสนรหัสเฉพาะที่ต่างกันไม่กี่หลัก เช่น เลขใบแจ้งหนี้ SKU หรือ error code",
    ),
    rc(
      "d070-rc-3",
      "ทำไมเราควรเรียงผลลัพธ์การค้นหาด้วย `key=lambda x: (-x.score, x.doc_id)`?",
      "เพื่อทำ deterministic tie-breaking รับประกันว่าเมื่อเอกสารได้คะแนนเท่ากัน ลำดับผลลัพธ์จะคงที่ทุกครั้งที่รัน",
    ),
  ],

  sources: [
    { label: "Sentence-Transformers Docs — Semantic Search Guide", href: "https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html" },
    { label: "NumPy Documentation — Matrix Multiplication (@ / matmul)", href: "https://numpy.org/doc/stable/reference/generated/numpy.matmul.html" },
    { label: "Qdrant — Hybrid Search & Why Dense Vectors Miss Exact Keywords", href: "https://qdrant.tech/articles/hybrid-search/" },
    { label: "BEIR Benchmark — Evaluating Zero-Shot Retrieval Limitations", href: "https://github.com/beir-cellar/beir" },
  ],

  glossary: ["embedding", "cosine-similarity", "dot-product", "top-k", "bm25", "rrf", "hnsw", "rag"],
});
