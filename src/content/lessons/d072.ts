import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D072 — Phase 3 / Block B18 (Review Day)
 * Review: Quiz + Compare 2 multilingual embeddings on Thai code-switching
 */
export const d072: Lesson = defineLesson({
  day: 72,
  titleTh: "ทบทวน Block B18: เทียบ 2 โมเดล Multilingual Embeddings บนโจทย์ไทยปนอังกฤษ",
  tagline: "30 นาที · รอบทบทวน D69–D71 + D38/D66 · รันบน CPU 100% · วัด Recall@3, MRR และ Latency เพื่อเลือกโมเดลด้วยตัวเลขจริง",
  icon: "git-compare",
  visual: {
    id: "embedding-model-tradeoff",
    title: "ทบทวน B18: เทียบ 2 Multilingual Embeddings บนโจทย์ไทยปนอังกฤษ (Code-Switching)",
    caption: "วัด Recall@3, MRR และเวลา encode ต่อเอกสารเพื่อตัดสินใจเลือกโมเดลด้วยตัวเลขจริงแทนความรู้สึก",
    alt: "แผนภาพเปรียบเทียบ 2 โมเดล embedding บนโจทย์ภาษาไทยปนอังกฤษ",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบน CPU ของเครื่องคุณ 100% — รองรับทั้งการเทียบโมเดลจริงและ Mock Embedders ใน pytest",
  tools: ["Sentence-Transformers", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "สร้างชุดทดสอบขนาดจิ๋ว (Mini Golden Dataset) สำหรับคำถามไทยปนอังกฤษ",
      body: "ผู้ใช้ในองค์กรไทยแทบไม่พิมพ์ภาษาไทยล้วนหรืออังกฤษล้วน แต่มักผสมคำเทคนิค (*\"ขอ reset password SSO\"*, *\"API โดน 429 rate limit\"*) การมี {{golden-dataset}} เล็ก ๆ ของโดเมนเราเองสำคัญกว่าการดูตารางอันดับโลกเพียงอย่างเดียว",
      lessonNote: "ทบทวน D66 ({{bpe-tokenizer}} ภาษาไทย) และ D69 (Multilingual {{embedding}}) ผ่านชุดคำถาม code-switching จริง",
    },
    {
      node: 2,
      heading: "รัน A/B Retrieval เปรียบเทียบ 2 โมเดลภายใต้กติกาเดียวกัน",
      body: "แต่ละโมเดลต้องถูกใช้งานให้เต็มศักยภาพตาม Model Card ของมัน (เช่น E5 ใส่ `query:`/`passage:`, BGE ไม่ต้องใส่) และแปลงเป็น unit vectors เพื่อค้นหาด้วย {{dot-product}} (`Q @ D.T`) อย่างยุติธรรม",
      lessonNote: "ร้อยต่อความรู้จาก D38 ({{cosine-similarity}} / L2 norm) และ D69–D70 เข้าเป็น pipeline ที่สลับโมเดลได้ง่าย",
    },
    {
      node: 3,
      heading: "ตัดสินด้วยตัวเลข: Recall@3, MRR, Latency และ RAM",
      body: "ความรู้สึกว่า \"ลองถาม 2 ข้อแล้วดูดี\" หลอกตาได้ง่าย การวัด **Recall@3**, **{{mrr}}**, เวลา `ms/doc` และขนาด RAM ที่ 100k chunks ทำให้การเลือกโมเดลตรวจสอบย้อนหลังและทำซ้ำได้ ({{reproducibility}})",
      lessonNote: "วันนี้เราสร้าง Offline Benchmark Harness ที่คืนรายงานเปรียบเทียบ Model A vs Model B อย่างครบถ้วน",
    },
    {
      node: 6,
      heading: "บันทึก Error Cases เพื่อใช้ต่อยอดใน Phase 4 (Hybrid RAG)",
      body: "คำถามที่ทั้ง 2 โมเดลยังพลาด (เช่น รหัสใบแจ้งหนี้เฉพาะหรือศัพท์เฉพาะองค์กร) คือหลักฐานชั้นดีสำหรับออกแบบ BM25 + Reranker ใน Phase 4",
      lessonNote: "จบบล็อก B18 พร้อมเครื่องมือ A/B Benchmark ที่คุณสามารถหยิบไปใช้เลือกโมเดลในงานจริงได้ทันที",
    },
  ],

  objectives: [
    "**ทบทวนแบบผสมผสาน (Interleaved Recall)** เนื้อหา D69–D71 (Bi-Encoder/E5 prefix, Semantic Search + `min_score`/จุดบอดรหัสเฉพาะ, RAM/Matryoshka/Silent Truncation) ร่วมกับ D38 ({{cosine-similarity}}) และ D66 ({{bpe-tokenizer}})",
    "**คำนวณ** ตัวชี้วัดการค้นหาหลัก 2 ตัวอย่างถูกต้องด้วยโค้ด: **Recall@k** และ **{{mrr}} (Mean Reciprocal Rank)** พร้อมจับเวลา latency (`ms/doc`)",
    "**สร้าง** Offline A/B Embedding Benchmark Harness ที่เปรียบเทียบ 2 โมเดล (หรือ 2 deterministic mock embedders) บนชุดคำถามไทยปนอังกฤษ (code-switching) และสรุปผู้ชนะอย่างเป็นระบบ",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D69 (Dense Embeddings & E5 Prefix), D70 (Semantic Search & Thresholds) และ D71 (Choosing Embedding Models)",
    "ทบทวน D38 (L2 Normalization & {{cosine-similarity}}) และ D66 (ไทยใช้ token 1.5–3× บน {{bpe-tokenizer}})",
    "มี `uv`, `numpy`, `pytest`, `ruff` (และ `sentence-transformers` หากต้องการรันเทียบโมเดลจริงบนเครื่อง)",
    "รันบน CPU ได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์สำหรับรอบทบทวน Day 72 ด้วย `uv` (ติดตั้ง `sentence-transformers` ด้วยหากต้องการรัน benchmark กับ 2 โมเดลจริง ส่วนการทำแบบฝึกหัดและ `pytest` ใช้แค่ `numpy` + `pytest` ก็ผ่าน 100%)",
    commands: `uv init ai-day72-review && cd ai-day72-review
uv add numpy sentence-transformers
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('Day 72 Review Ready | NumPy:', np.__version__)"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์ `ai-day72-review`"],
      ["deps", "ติดตั้ง `numpy`, `sentence-transformers`, `pytest` และ `ruff`"],
      ["verify", "รันเช็กเวอร์ชันสำเร็จ พร้อมทำควิซทบทวน 10 นาทีและสร้าง A/B Harness 15 นาที"],
    ],
    note: "รอบทบทวน Day 72 แบ่งเวลา 30 นาที: ทำควิซดึงความรู้เดิม 10 นาที → สร้าง A/B Embedding Benchmark Harness บนโจทย์ไทยปนอังกฤษ 15 นาที → จดข้อผิดพลาดลง Error Log 5 นาที",
  },

  concepts: [
    {
      id: "review-b18-synthesis",
      title: "1 · ร้อยต่อจิ๊กซอว์ B18: จาก Token ไทย → Dense Vector → เกณฑ์เลือกโมเดล",
      paragraphs: [
        "ตลอด 3 วันของ Block B18 เราสร้างสายพานความเข้าใจที่ต่อกันเป็นชิ้นเดียว: เริ่มจาก **D66** ที่เตือนว่าข้อความไทยแตกเป็น token เยอะกว่าอังกฤษ 1.5–3×, มาสู่ **D69** ที่แปลงประโยคไทย-อังกฤษเป็น unit vectors ด้วย Bi-Encoder (พร้อม prefix `query:`/`passage:` และ CPU batching), ต่อด้วย **D70** ที่ค้นหาด้วย `unit_q @ unit_corpus.T` + `min_score` abstention และเห็นจุดบอดรหัสเฉพาะ, จบด้วย **D71** ที่คุม RAM (`N × D × 4 × 1.5`), Matryoshka และ Silent Truncation",
        "วันนี้เราจะนำทุกชิ้นมาประกอบเป็น **A/B Embedding Benchmark** เพื่อตอบคำถามที่วิศวกร AI ทุกคนต้องเจอในที่ทำงาน: *\"ระหว่างโมเดล A (เล็ก เร็ว 384-d) กับโมเดล B (ใหญ่ แม่น 1024-d) ตัวไหนคุ้มกว่าสำหรับคำถามไทยปนอังกฤษของบริษัทเรา?\"*",
      ],
      analogy: "การเลือกโมเดลโดยไม่ทำ benchmark เหมือนซื้อรองเท้าวิ่งจากรีวิวคนอื่นโดยไม่เคยลองสวมวิ่งเอง — A/B Benchmark บนชุดคำถามไทยปนอังกฤษคือการลองวิ่งจับเวลาจริง 5 กิโลเมตรก่อนจ่ายเงิน",
      bullets: [
        "**D38 + D69**: ทุกโมเดลต้องถูก L2-normalize ก่อนคูณ `Q @ D.T` และต้องใส่ prefix ให้ตรง Model Card ของตัวเอง",
        "**D66 + D71**: ตรวจทั้งความแม่นยำ, ความเสี่ยง truncation ที่ `max_seq_length`, และขนาด RAM เมื่อขยายเป็น 100k–1M chunks",
        "**D70**: แยกดูทั้งเคสคำพ้องไทยปนอังกฤษ (ที่ Dense ควรชนะ) และเคสรหัสเฉพาะ (ที่ควรเห็นข้อจำกัดชัดเจน)",
      ],
      whyTitle: "Why this matters — เตรียมพร้อมสู่ Eval-Driven Development ใน Phase 4–5",
      whyParagraphs: [
        "นิสัยการวัดผลด้วยชุดทดสอบขนาดเล็กที่มีคำตอบเฉลย ({{golden-dataset}}) ตั้งแต่ตอนเลือกโมเดล embedding คือจุดเริ่มต้นของ Eval-Driven Development",
        "เมื่อเข้าสู่ Phase 4 คุณจะใช้ harness โครงสร้างเดียวกับวันนี้เป๊ะเพื่อวัดผลว่า Hybrid Search (BM25 + Dense + RRF) และ Reranker ช่วยดัน Recall@5 กับ {{mrr}} ขึ้นจริงกี่เปอร์เซ็นต์",
      ],
    },
    {
      id: "recall-at-k-and-mrr",
      title: "2 · วัดคุณภาพ Retrieval ด้วยตัวเลขจริง: Recall@k และ MRR",
      paragraphs: [
        "ในงานค้นหาเอกสาร เราไม่ใช้ Accuracy แบบ classification ทั่วไป แต่วัดด้วย 2 ตัวชี้วัดหลักที่ตีความง่ายและสะท้อนประสบการณ์ผู้ใช้โดยตรง:",
        "**1) Recall@k** (เช่น `Recall@3`): สัดส่วนของคำถามที่มีเอกสารเฉลย (relevant doc) โผล่มาอยู่ใน {{top-k}} อันดับแรกอย่างน้อย 1 ชิ้น — ถ้ามีคำถาม 10 ข้อ และ 8 ข้อดึงเอกสารที่ถูกต้องมาอยู่ใน Top-3 ได้ จะได้ `Recall@3 = 0.80` (ตัวเลขนี้บอกเราว่าชั้นส่งบริบทให้ LLM มีโอกาสเห็นคำตอบกี่เปอร์เซ็นต์)",
        "**2) {{mrr}} (Mean Reciprocal Rank)**: ค่าเฉลี่ยของ `1 / rank` ของเอกสารที่ถูกต้องชิ้นแรกใน Top-k (ถ้าไม่ติด Top-k เลยให้เป็น `0.0`) — อันดับ 1 ได้ `1.0`, อันดับ 2 ได้ `0.5`, อันดับ 3 ได้ `0.333` ตัวเลข MRR จะลงโทษโมเดลที่เอาคำตอบจริงไปซ่อนไว้อันดับ 3 แม้ Recall@3 จะเท่ากันก็ตาม",
      ],
      analogy: "Recall@3 เหมือนถามว่า \"ร้านที่อยากกินติดอยู่ใน 3 อันดับแรกที่แอปแนะนำไหม?\" ส่วน MRR เหมือนถามว่า \"มันอยู่อันดับ 1 เลย หรือต้องเลื่อนลงไปเจออันดับ 3?\"",
      code: {
        language: "python",
        filename: "retrieval_metrics.py",
        code: `def recall_at_k(ranked_ids: list[str], relevant_ids: set[str], k: int) -> float:
    return 1.0 if any(doc_id in relevant_ids for doc_id in ranked_ids[:k]) else 0.0


def reciprocal_rank(ranked_ids: list[str], relevant_ids: set[str], k: int) -> float:
    for rank, doc_id in enumerate(ranked_ids[:k], start=1):
        if doc_id in relevant_ids:
            return 1.0 / rank
    return 0.0


# โมเดล A ดึง DOC-2 มาอันดับ 1, โมเดล B ดึงมาอันดับ 3 -> Recall@3 เท่ากัน แต่ MRR ต่างกัน 3 เท่า!
print("Model A -> Recall@3:", recall_at_k(["DOC-2", "DOC-1", "DOC-3"], {"DOC-2"}, 3),
      "RR:", reciprocal_rank(["DOC-2", "DOC-1", "DOC-3"], {"DOC-2"}, 3))
print("Model B -> Recall@3:", recall_at_k(["DOC-1", "DOC-3", "DOC-2"], {"DOC-2"}, 3),
      "RR:", round(reciprocal_rank(["DOC-1", "DOC-3", "DOC-2"], {"DOC-2"}, 3), 3))`,
        caption: "ดูทั้ง Recall@3 และ MRR คู่กันเสมอ: Recall บอกว่า \"หาเจอไหม\" ส่วน MRR บอกว่า \"อยู่บนสุดแค่ไหน\"",
      },
      whyTitle: "Why this matters — Rank #1 ส่งผลตรงต่อคุณภาพและต้นทุน LLM",
      whyParagraphs: [
        "ในระบบ RAG ถ้าเอกสารคำตอบอยู่อันดับ 1 เสมอ คุณอาจส่งบริบทให้ LLM แค่ Top-2 แทน Top-5 ซึ่งช่วยลดค่า token และลดปัญหา Lost in the Middle ได้ทันที",
        "ดังนั้นเมื่อสองโมเดลได้ `Recall@3` เท่ากัน โมเดลที่มี `MRR` สูงกว่า (และ latency ต่ำกว่า) คือผู้ชนะที่แท้จริง",
      ],
    },
    {
      id: "fair-ab-benchmark-codeswitch",
      title: "3 · กติกาการทำ A/B Benchmark ที่ยุติธรรมบนโจทย์ไทยปนอังกฤษ",
      paragraphs: [
        "ข้อผิดพลาดยอดฮิตตอนทำ benchmark เปรียบเทียบ 2 โมเดลคือ **เทียบแบบไม่ยุติธรรม (Unfair Comparison)** เช่น ใส่ `query: ` ให้ E5 แต่เอา prefix `query: ` เดียวกันไปยัดใส่โมเดลอื่นที่ไม่ได้ใช้ prefix, หรือจับเวลาโหลดน้ำหนักโมเดลครั้งแรกปนเข้าไปกับเวลา encode จริง (Cold Start vs Warm Latency)",
        "เพื่อให้การทดสอบมี {{reproducibility|ความสามารถทำซ้ำได้}} และเชื่อถือได้ ให้ทำ 4 ขั้นตอนเสมอ: (1) ห่อแต่ละโมเดลภายใต้ interface เดียวกัน (Adapter/Protocol) ที่จัดการ prefix ของใครของมันข้างใน, (2) รัน warm-up 1 รอบก่อนเริ่มจับเวลาด้วย `time.perf_counter()`, (3) ทดสอบบนชุดคำถามไทยปนอังกฤษชุดเดียวกันเป๊ะ, และ (4) รายงานผลเป็นตาราง 4 ช่องคู่กัน: **Recall@3 | MRR | ms/doc | RAM@100k (MB)**",
      ],
      analogy: "เหมือนการเทียบความเร็วรถ 2 คันบนสนามเดียวกัน: ต้องอุ่นเครื่องก่อนออกตัวทั้งคู่ (warm-up), เติมน้ำมันตรงสเปกของแต่ละคัน (prefix ตาม Model Card), และวัดทั้งความเร็วกับอัตราสิ้นเปลือง (latency + RAM) พร้อมกัน",
      bullets: [
        "**Warm-up before timing**: เรียก encode 1 ประโยคก่อนจับเวลาเพื่อไม่นับเวลา JIT/cache init ปนเข้ามา",
        "**Per-Model Adapter**: ซ่อน `query:`/`passage:` prefix ไว้ใน adapter ของโมเดล E5 โดยไม่รั่วไปกวนโมเดล BGE/MiniLM",
        "**Inspect Failures**: พิมพ์รายการคำถามที่แต่ละโมเดลพลาด (missed queries) ออกมาดูด้วยตาเสมอ เพื่อแยกปัญหาโมเดลออกจากปัญหาเอกสาร",
      ],
      whyTitle: "Why this matters — ตัดสินใจเชิงวิศวกรรมที่อธิบายให้ทีมและหัวหน้าฟังได้",
      whyParagraphs: [
        "แทนที่จะพูดในที่ประชุมว่า *\"ผมว่า bge-m3 น่าจะดีกว่านะ\"* คุณจะเปิดตารางตัวเลขให้ทีมเห็นได้ทันทีว่า *\"bge-m3 ดัน MRR บนคำถามไทยปนอังกฤษจาก 0.74 เป็น 0.91 แลกกับ latency เพิ่มจาก 12 ms เป็น 45 ms และ RAM เพิ่ม 2.7×\"*",
        "ตารางเปรียบเทียบแบบมีตัวเลขคือภาษาสากลของ Senior AI Engineer",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Embedding Benchmark Harness ≈ API Load Test + Lighthouse Score",
      body: [
        "ในงานเว็บ คุณไม่เดาเอาเองว่าอัลกอริทึมใหม่เร็วขึ้นไหม — คุณเขียน benchmark script จับเวลา P50/P95 และรันชุด regression test เดิมซ้ำทุกครั้งที่เปลี่ยนไลบรารี",
        "Embedding Benchmark Harness ทำงานแบบเดียวกันทุกประการ: แยก `Embedder` interface (Dependency Injection) เพื่อเสียบโมเดลไหนเข้ามาก็ได้ จับเวลาด้วย `time.perf_counter()` และตรวจคุณภาพบนชุดทดสอบคงที่ใน CI",
      ],
      table: [
        ["`Embedder` Protocol / Adapter", "Strategy Pattern / Provider Interface ใน TypeScript"],
        ["Golden Code-Switch Queries", "Regression Test Fixture ที่ล็อกอินพุตและ expected IDs"],
        ["Recall@3 & MRR", "Accuracy / Quality KPIs ของระบบค้นหา"],
        ["`ms/doc` & RAM@100k", "Latency & Memory Budget ใน Performance Benchmark"],
      ],
    },
    student: {
      title: "First-Year Note — เข้าใจ MRR ด้วยเลขเศษส่วนง่าย ๆ",
      body: [
        "คำว่า **Mean Reciprocal Rank (MRR)** ฟังดูเป็นศัพท์วิชาการ แต่ความหมายตรงตัวมาก: *Reciprocal* แปลว่าส่วนกลับ (`1 / rank`) และ *Mean* แปลว่าค่าเฉลี่ย",
        "ถ้าทดสอบ 2 คำถาม: ข้อแรกคำตอบจริงอยู่อันดับ 1 ได้ `1/1 = 1.0`, ข้อสองคำตอบจริงอยู่อันดับ 2 ได้ `1/2 = 0.5` — เอาสองตัวมาหาค่าเฉลี่ย `(1.0 + 0.5) / 2 = 0.75` นั่นแหละคือค่า MRR! ยิ่งใกล้ `1.0` ยิ่งดีมาก",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เทียบ 2 โมเดล Multilingual Embeddings บน CPU (`intfloat/multilingual-e5-small` vs `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) บนโจทย์คำถามไทยปนอังกฤษ 5 ข้อ เพื่อวัด Recall@3, MRR, ความเร็ว `ms/doc` และ RAM@100k",
    steps: [
      {
        title: "1 · เตรียมคลังเอกสารและชุดคำถาม Code-Switching (ไทยปนอังกฤษ)",
        explain: "สร้างคลังเอกสารซัพพอร์ต 6 ชิ้นและคำถามไทยปนอังกฤษ 4 ข้อพร้อม `relevant_id` ที่ถูกต้อง เพื่อให้ทั้งสองโมเดลแข่งกันบนโจทย์ชุดเดียวกันเป๊ะ",
        code: {
          language: "python",
          filename: "worked_day72.py",
          code: `CORPUS = [
    ("DOC-SSO", "คู่มือการรีเซ็ตรหัสผ่านและแก้ไขปัญหาเข้าสู่ระบบ Single Sign-On ไม่ได้"),
    ("DOC-RATE", "แนวทางรับมือ HTTP 429 Too Many Requests ด้วย Exponential Backoff และ Jitter"),
    ("DOC-TAX", "ขั้นตอนขอออกใบกำกับภาษีเต็มรูปแบบและส่งสำเนาทางอีเมลภายใน 7 วัน"),
    ("DOC-REFUND", "นโยบายการคืนเงินเมื่อระบบตัดบัตรเครดิตซ้ำซ้อนและระยะเวลาคืนยอด"),
    ("DOC-PDPA", "มาตรฐานการปิดบังข้อมูลส่วนบุคคล เลขบัตรประชาชน และเบอร์โทรตามกฎหมาย PDPA"),
    ("DOC-HOURS", "เวลาทำการฝ่ายบริการลูกค้าและช่องทางติดต่อฉุกเฉินนอกเวลา"),
]

EVAL_QUERIES = [
    ("ขอวิธี reset password บัญชี SSO หน่อยครับ", {"DOC-SSO"}),
    ("ยิง API แล้วติด 429 rate limit ต้องตั้ง retry ยังไง", {"DOC-RATE"}),
    ("ระบบตัด credit card ซ้ำ ต้องขอ refund กี่วันได้เงินคืน", {"DOC-REFUND"}),
    ("อยากได้ tax invoice เต็มรูปแบบส่งเข้า email", {"DOC-TAX"}),
]`,
        },
        output: `Prepared 6 corpus docs and 4 Thai code-switching eval queries.`,
      },
      {
        title: "2 · ห่อ 2 โมเดลภายใต้ Adapter ที่จัดการ Prefix ของใครของมัน",
        explain: "โมเดล E5 ใส่ `query:`/`passage:` อัตโนมัติ ส่วน MiniLM ไม่ต้องใส่ prefix จากนั้นจับเวลา encode หลัง warm-up และคำนวณ Recall@3, MRR และ RAM@100k",
        code: {
          language: "python",
          filename: "worked_day72.py",
          code: `import time
import numpy as np
from sentence_transformers import SentenceTransformer


def eval_st_model(name: str, model_id: str, use_e5_prefix: bool, top_k: int = 3):
    model = SentenceTransformer(model_id, device="cpu")
    _ = model.encode(["warm-up"], normalize_embeddings=True, show_progress_bar=False)

    doc_ids = [d for d, _ in CORPUS]
    p_texts = [f"passage: {t}" if use_e5_prefix else t for _, t in CORPUS]
    q_texts = [f"query: {q}" if use_e5_prefix else q for q, _ in EVAL_QUERIES]

    t0 = time.perf_counter()
    p_vecs = model.encode(p_texts, batch_size=16, normalize_embeddings=True, show_progress_bar=False)
    ms_per_doc = ((time.perf_counter() - t0) * 1000.0) / len(p_texts)

    q_vecs = model.encode(q_texts, batch_size=16, normalize_embeddings=True, show_progress_bar=False)
    sim = q_vecs @ p_vecs.T

    recalls, rrs = [], []
    for i, (_, rel_ids) in enumerate(EVAL_QUERIES):
        order = np.argsort(-sim[i])[:top_k]
        ranked = [doc_ids[idx] for idx in order]
        recalls.append(1.0 if any(d in rel_ids for d in ranked) else 0.0)
        rr = next((1.0 / r for r, d in enumerate(ranked, 1) if d in rel_ids), 0.0)
        rrs.append(rr)

    ram_100k_mb = (100_000 * p_vecs.shape[1] * 4 * 1.5) / (1024 ** 2)
    return {
        "name": name,
        "dim": int(p_vecs.shape[1]),
        "recall@3": round(float(np.mean(recalls)), 3),
        "mrr@3": round(float(np.mean(rrs)), 3),
        "ms_per_doc": round(ms_per_doc, 2),
        "ram_100k_mb": round(ram_100k_mb, 1),
    }`,
        },
        output: `Defined fair adapter benchmark function (warm-up + per-model prefix + unit cosine).`,
      },
      {
        title: "3 · พิมพ์ตารางเปรียบเทียบเพื่อตัดสินใจเลือกโมเดล",
        explain: "รันทั้ง 2 โมเดลบนเครื่อง CPU แล้วเทียบผลลัพธ์ 4 แกนพร้อมกัน (ตัวเลข ms/doc จะแตกต่างตามสเปก CPU ของแต่ละเครื่อง)",
        code: {
          language: "python",
          filename: "worked_day72.py",
          code: `results = [
    eval_st_model("multilingual-e5-small", "intfloat/multilingual-e5-small", use_e5_prefix=True),
    eval_st_model("multilingual-MiniLM", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", use_e5_prefix=False),
]

print(f"{'Model':24s} | {'Dim':>4s} | {'R@3':>5s} | {'MRR@3':>5s} | {'ms/doc':>7s} | {'RAM@100k':>10s}")
print("-" * 70)
for r in results:
    print(f"{r['name']:24s} | {r['dim']:4d} | {r['recall@3']:5.3f} | {r['mrr@3']:5.3f} | {r['ms_per_doc']:7.2f} | {r['ram_100k_mb']:8.1f} MB")`,
        },
        output: `Model                    |  Dim |   R@3 | MRR@3 |  ms/doc |   RAM@100k
----------------------------------------------------------------------
multilingual-e5-small    |  384 | 1.000 | 1.000 |   14.20 |    219.7 MB
multilingual-MiniLM      |  384 | 1.000 | 0.875 |   11.80 |    219.7 MB`,
      },
    ],
    gotcha: "สังเกตผลลัพธ์ตัวอย่าง: ทั้งสองโมเดลได้ `Recall@3 = 1.000` เท่ากันเป๊ะ ถ้าดูแค่ Recall@3 คุณอาจเลือก MiniLM เพราะเร็วกว่า แต่พอเปิดดู **`MRR@3`** จะเห็นว่า `e5-small` ดึงคำตอบขึ้นอันดับ 1 ได้ครบทุกข้อ (`1.000`) ในขณะที่ `MiniLM` หล่นไปอันดับ 2 ในบางข้อ (`0.875`) และอย่าลืมว่า MiniLM ยังโดน `max_seq_length = 128` ตัดเอกสารไทยยาว ๆ อีกด้วย!",
  },

  practice: {
    intro: "สร้าง Offline A/B Embedding Benchmark Harness ใน `exercise_day72.py` ที่คำนวณ `Recall@k`, `MRR@k`, `ms_per_doc`, `ram_100k_mb`, และรายการ `missed_queries` พร้อมฟังก์ชัน `compare_embedders` ที่รองรับทั้งโมเดลจริงและ Mock Embedders ใน `pytest`",
    requirements: [
      "สร้าง `@dataclass(frozen=True) class EvalQuery` (`query: str`, `relevant_ids: frozenset[str]`) และ `@dataclass(frozen=True) class BenchmarkReport` (`model_name: str`, `dim: int`, `recall_at_k: float`, `mrr_at_k: float`, `ms_per_doc: float`, `ram_100k_mb: float`, `missed_queries: tuple[str, ...]`) ",
      "สร้างฟังก์ชัน `compute_recall_and_mrr(ranked_lists: list[list[str]], relevant_sets: list[frozenset[str]], *, k: int = 3) -> tuple[float, float]` ที่ตรวจ `k > 0`, `len(ranked_lists) == len(relevant_sets) > 0` และคืน `(mean_recall_at_k, mean_mrr_at_k)`",
      "สร้างฟังก์ชัน `benchmark_embedder(model_name, corpus, eval_queries, *, encode_passages, encode_queries, top_k=3) -> BenchmarkReport`: ทำ L2 normalize ทั้งฝั่ง passages และ queries, จับเวลา encode passages ด้วย `time.perf_counter()`, คำนวณ `sim = unit_q @ unit_p.T`, เรียงอันดับแบบ deterministic `(-score, doc_id)`, คำนวณ `recall_at_k`, `mrr_at_k`, `ram_100k_mb` (`overhead=1.5`, `float32`), และเก็บ `missed_queries` (คำถามที่ไม่มี `relevant_id` อยู่ใน `top_k`)",
      "สร้างฟังก์ชัน `compare_embedders(reports: list[BenchmarkReport]) -> list[BenchmarkReport]` ที่เรียงลำดับรายงานจากดีที่สุดไปน้อยสุดด้วยเกณฑ์: `mrr_at_k` สูงกว่า → `recall_at_k` สูงกว่า → `ms_per_doc` ต่ำกว่า → `model_name` ตามตัวอักษร (raise `ValueError` หาก `reports` ว่าง)",
    ],
    starter: {
      language: "python",
      filename: "exercise_day72.py",
      code: `from collections.abc import Callable
from dataclasses import dataclass
import time
import numpy as np


@dataclass(frozen=True)
class EvalQuery:
    query: str
    relevant_ids: frozenset[str]


@dataclass(frozen=True)
class BenchmarkReport:
    model_name: str
    dim: int
    recall_at_k: float
    mrr_at_k: float
    ms_per_doc: float
    ram_100k_mb: float
    missed_queries: tuple[str, ...]


def _l2_normalize(vectors: np.ndarray) -> np.ndarray:
    arr = np.asarray(vectors, dtype=np.float32)
    norms = np.linalg.norm(arr, ord=2, axis=1, keepdims=True)
    safe_norms = np.where(norms == 0.0, 1.0, norms)
    return (arr / safe_norms).astype(np.float32)


def compute_recall_and_mrr(
    ranked_lists: list[list[str]],
    relevant_sets: list[frozenset[str]],
    *,
    k: int = 3,
) -> tuple[float, float]:
    """คำนวณค่าเฉลี่ย (Recall@k, MRR@k)."""
    # TODO: ตรวจ k > 0 และความยาวเท่ากันไม่ว่าง แล้วคำนวณ mean Recall@k และ mean MRR@k
    raise NotImplementedError


def benchmark_embedder(
    model_name: str,
    corpus: list[tuple[str, str]],
    eval_queries: list[EvalQuery],
    *,
    encode_passages: Callable[[list[str]], np.ndarray],
    encode_queries: Callable[[list[str]], np.ndarray],
    top_k: int = 3,
) -> BenchmarkReport:
    """รัน benchmark โมเดล embedding 1 ตัวบนชุดคำถาม code-switching."""
    # TODO: ตรวจ input, จับเวลา encode passages, normalize, sim = Q @ P.T, จัดอันดับ, คืน BenchmarkReport
    raise NotImplementedError


def compare_embedders(reports: list[BenchmarkReport]) -> list[BenchmarkReport]:
    """จัดอันดับผล benchmark จากดีที่สุดไปน้อยสุดด้วย MRR -> Recall -> Latency -> Name."""
    # TODO: ตรวจ reports ไม่ว่าง แล้วเรียงตามเกณฑ์
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day72.py",
      code: `import numpy as np
import pytest
from exercise_day72 import (
    BenchmarkReport,
    EvalQuery,
    benchmark_embedder,
    compare_embedders,
    compute_recall_and_mrr,
)

CORPUS = [
    ("DOC-SSO", "คู่มือรีเซ็ตรหัสผ่านและปลดล็อกบัญชี Single Sign-On"),
    ("DOC-RATE", "วิธีรับมือ HTTP 429 rate limit ด้วย exponential backoff"),
    ("DOC-TAX", "ขั้นตอนขอใบกำกับภาษีเต็มรูปแบบสำหรับลูกค้าองค์กร"),
    ("DOC-REFUND", "นโยบายคืนเงินกรณีตัดบัตรเครดิตซ้ำซ้อน"),
]

QUERIES = [
    EvalQuery("ขอ reset password บัญชี SSO", frozenset({"DOC-SSO"})),
    EvalQuery("ยิง API ติด 429 rate limit ทำไง", frozenset({"DOC-RATE"})),
    EvalQuery("อยากได้ tax invoice ส่งเข้าเมล", frozenset({"DOC-TAX"})),
    EvalQuery("ตัด credit card ซ้ำ ต้องทำ refund ไหม", frozenset({"DOC-REFUND"})),
]


def _make_mock_embedder(understands_codeswitch: bool, dim: int):
    def _encode(texts: list[str]) -> np.ndarray:
        rows = []
        for text in texts:
            v = np.full(dim, 0.05, dtype=np.float32)
            lower = text.lower()
            if "รหัสผ่าน" in text or "single sign-on" in lower or (understands_codeswitch and ("reset password" in lower or "sso" in lower)):
                v[0] += 1.0
            if "429" in lower or "rate limit" in lower:
                v[1] += 1.0
            if "ใบกำกับภาษี" in text or (understands_codeswitch and "tax invoice" in lower):
                v[2] += 1.0
            if "คืนเงิน" in text or "ตัดบัตร" in text or (understands_codeswitch and ("refund" in lower or "credit card" in lower)):
                v[3] += 1.0
            rows.append(v)
        return np.vstack(rows)

    return _encode


def test_compute_recall_and_mrr():
    ranked = [["D1", "D2", "D3"], ["D2", "D1", "D3"], ["D3", "D2", "D1"]]
    rels = [frozenset({"D1"}), frozenset({"D1"}), frozenset({"D9"})]
    recall, mrr = compute_recall_and_mrr(ranked, rels, k=3)
    assert np.isclose(recall, 2.0 / 3.0)
    assert np.isclose(mrr, (1.0 + 0.5 + 0.0) / 3.0)
    with pytest.raises(ValueError):
        compute_recall_and_mrr([], [], k=3)


def test_benchmark_two_embedders_on_thai_codeswitching():
    strong_fn = _make_mock_embedder(understands_codeswitch=True, dim=16)
    weak_fn = _make_mock_embedder(understands_codeswitch=False, dim=8)

    rep_strong = benchmark_embedder(
        "strong-multilingual",
        CORPUS,
        QUERIES,
        encode_passages=strong_fn,
        encode_queries=strong_fn,
        top_k=2,
    )
    rep_weak = benchmark_embedder(
        "weak-monolingual",
        CORPUS,
        QUERIES,
        encode_passages=weak_fn,
        encode_queries=weak_fn,
        top_k=2,
    )

    assert rep_strong.recall_at_k == 1.0
    assert rep_strong.mrr_at_k == 1.0
    assert rep_strong.missed_queries == ()
    assert rep_strong.dim == 16
    assert rep_strong.ms_per_doc >= 0.0
    assert rep_strong.ram_100k_mb > rep_weak.ram_100k_mb

    assert rep_weak.mrr_at_k < rep_strong.mrr_at_k
    assert len(rep_weak.missed_queries) >= 1

    ranked_models = compare_embedders([rep_weak, rep_strong])
    assert [r.model_name for r in ranked_models] == ["strong-multilingual", "weak-monolingual"]


def test_compare_embedders_tie_breaks_by_latency():
    a = BenchmarkReport("model-slow", 384, 0.9, 0.85, 25.0, 219.7, ())
    b = BenchmarkReport("model-fast", 384, 0.9, 0.85, 10.0, 219.7, ())
    assert [r.model_name for r in compare_embedders([a, b])] == ["model-fast", "model-slow"]
    with pytest.raises(ValueError):
        compare_embedders([])
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทุก test cases แบบออฟไลน์ในเวลา < 1 วินาที",
      "ตรวจว่า `compute_recall_and_mrr` ให้ `RR = 1.0` เมื่อตรงอันดับ 1, `0.5` เมื่อตรงอันดับ 2, และ `0.0` เมื่อไม่อยู่ใน `top_k`",
      "ตรวจว่า `benchmark_embedder` บันทึก `missed_queries` ของคำถามไทยปนอังกฤษที่โมเดลอ่อนพลาดไว้อย่างถูกต้อง",
      "ลองเสียบ 2 โมเดลจริง (`multilingual-e5-small` vs `paraphrase-multilingual-MiniLM-L12-v2`) เข้า `benchmark_embedder` บนเครื่องเพื่อดูตัวเลขจริง",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day72.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `compute_recall_and_mrr` วนคู่ `(ranked, rel)` โดยดูเฉพาะ `top = ranked[:k]`: สำหรับ recall เช็ก `any(d in rel for d in top)` ส่วน RR วน `for idx, doc_id in enumerate(top, start=1): if doc_id in rel: rr = 1.0 / idx; break`",
      },
      {
        body: "ใน `benchmark_embedder` หลังจากได้ `sim = q_unit @ p_unit.T` สำหรับแต่ละแถว `i` ให้สร้างลิสต์ `(doc_ids[j], float(sim[i, j]))`, เรียงด้วย `key=lambda x: (-x[1], x[0])`, หยิบ `top_k` แรกมาเป็น `ranked_ids`, และเก็บ `eq.query` ลง `missed` ถ้า `not any(d in eq.relevant_ids for d in ranked_ids)`",
      },
      {
        body: "โครงของ `compute_recall_and_mrr` และ `compare_embedders` ครบแล้ว เหลือเชื่อมทั้งหมดเข้าด้วยกันใน `benchmark_embedder`",
        code: {
          language: "python",
          filename: "hint_day72.py",
          code: `def compute_recall_and_mrr(
    ranked_lists: list[list[str]],
    relevant_sets: list[frozenset[str]],
    *,
    k: int = 3,
) -> tuple[float, float]:
    if k <= 0 or not ranked_lists or len(ranked_lists) != len(relevant_sets):
        raise ValueError("Invalid ranked_lists, relevant_sets, or k")
    recalls: list[float] = []
    rrs: list[float] = []
    for ranked, rel in zip(ranked_lists, relevant_sets, strict=True):
        top = ranked[:k]
        recalls.append(1.0 if any(d in rel for d in top) else 0.0)
        rr = 0.0
        for rank, doc_id in enumerate(top, start=1):
            if doc_id in rel:
                rr = 1.0 / rank
                break
        rrs.append(rr)
    return sum(recalls) / len(recalls), sum(rrs) / len(rrs)


def compare_embedders(reports: list[BenchmarkReport]) -> list[BenchmarkReport]:
    if not reports:
        raise ValueError("reports must not be empty")
    return sorted(
        reports,
        key=lambda r: (-r.mrr_at_k, -r.recall_at_k, r.ms_per_doc, r.model_name),
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
      title: "ใส่ Prefix `query:`/`passage:` เฉพาะโมเดลเดียวหรือเอาไปใส่ให้ทุกโมเดลแบบเหมารวม",
      symptom: "ผล A/B test เอนเอียงเพราะโมเดลที่ไม่ได้เทรนด้วย prefix ถูกเพิ่มคำแปลกปลอมเข้าไป หรือ E5 ไม่ได้ใส่ prefix",
      fix: "ห่อแต่ละโมเดลใน adapter ของตัวเอง (`encode_passages` / `encode_queries`) ที่เคารพ Model Card ของโมเดลนั้นอย่างเคร่งครัด",
    },
    {
      title: "จับเวลา Cold Start (โหลดโมเดลจากดิสก์) ปนเข้าไปในเวลา `ms/doc`",
      symptom: "ตัวเลข latency สูงผิดปกติหลายพันมิลลิวินาทีและแกว่งหนักทุกรอบที่รัน",
      fix: "โหลดโมเดลและรัน warm-up 1 ครั้งก่อนเริ่ม `time.perf_counter()` เสมอ",
    },
    {
      title: "ดูแค่ Recall@3 โดยไม่ดู MRR และรายการ `missed_queries`",
      symptom: "เลือกโมเดลที่มักเอาคำตอบจริงไปไว้อันดับ 3 หรือมองไม่เห็นว่าโมเดลพลาดเฉพาะกลุ่มคำถามไทยปนอังกฤษ",
      fix: "รายงาน Recall@k คู่กับ {{mrr}}, latency, RAM และพิมพ์ `missed_queries` ออกมาตรวจด้วยตาทุกครั้ง",
    },
    {
      title: "ประเมินโมเดลบนคำถามภาษาอังกฤษล้วนทั้งที่ผู้ใช้จริงพิมพ์ไทยปนอังกฤษ",
      symptom: "คะแนนใน lab สูง 98% แต่ขึ้น production แล้วลูกค้าไทยบ่นว่าหาเอกสารไม่เจอ",
      fix: "สร้าง {{golden-dataset}} ที่มีสัดส่วนภาษาพูดไทย คำพ้อง และไทยปนอังกฤษ (code-switching) ตรงกับ traffic จริง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d072-q1",
        "บนชุดทดสอบ 4 คำถาม โมเดล A ดึงเอกสารที่ถูกต้องมาอยู่อันดับ `[1, 1, 2, ไม่ติด Top-3]` ค่า `(Recall@3, MRR@3)` ของโมเดล A คือข้อใด?",
        [
          ["Recall@3 = `0.75`, MRR@3 = `0.625`", "ถูก — เจอ 3 จาก 4 ข้อ (`3/4 = 0.75`) และ MRR = `(1.0 + 1.0 + 0.5 + 0.0) / 4 = 2.5 / 4 = 0.625`"],
          ["Recall@3 = `0.75`, MRR@3 = `0.750`", "MRR ผิด — ข้อที่อยู่อันดับ 2 ได้ `1/2 = 0.5` ไม่ใช่ `1.0`"],
          ["Recall@3 = `0.625`, MRR@3 = `0.750`", "สลับค่าระหว่าง Recall@3 กับ MRR@3"],
          ["Recall@3 = `1.00`, MRR@3 = `0.833`", "ผิด — ข้อที่ 4 ไม่ติด Top-3 จึงได้ `0` ทั้ง Recall และ RR"],
        ],
        "A",
        "Recall@3 นับสัดส่วนที่ติด Top-3 (`3/4 = 0.75`) ส่วน MRR@3 เฉลี่ยส่วนกลับของอันดับ (`(1 + 1 + 0.5 + 0) / 4 = 0.625`)",
        "คำนวณ Recall@3 และ MRR@3 เมื่อคำตอบจริงอยู่อันดับ `[1, 1, 2, miss]` จาก 4 ข้อ",
        "Recall@3 = `3/4 = 0.75`, MRR@3 = `(1.0 + 1.0 + 0.5 + 0.0) / 4 = 0.625`",
      ),
      mc(
        "d072-q2",
        "ในการทำ A/B Benchmark ระหว่าง `multilingual-e5-small` กับ `BAAI/bge-m3` ข้อใดช่วยให้การเปรียบเทียบ **ยุติธรรมและทำซ้ำได้** ที่สุด?",
        [
          ["ไม่ใส่ prefix ใด ๆ ทั้งสองโมเดลเพื่อให้ข้อความเข้าเหมือนกันเป๊ะ", "ไม่ยุติธรรมกับ E5 เพราะ Model Card ของ E5 บังคับ `query:`/`passage:`"],
          ["ใส่ prefix ตาม Model Card ของแต่ละโมเดลผ่าน adapter, ทำ L2 normalization ทั้งคู่, รัน warm-up ก่อนจับเวลา, และทดสอบบนชุดคำถาม code-switching เดียวกัน", "ถูก — แต่ละโมเดลได้แสดงศักยภาพเต็มที่ภายใต้กติกาการวัดเดียวกัน"],
          ["จับเวลาตั้งแต่ขั้นตอน `SentenceTransformer(...)` ดาวน์โหลดไฟล์จาก Hugging Face", "เวลาดาวน์โหลดขึ้นกับความเร็วอินเทอร์เน็ต ไม่ใช่ความเร็ว inference ของโมเดล"],
          ["ให้โมเดลที่ 1 ทดสอบกับคำถามภาษาอังกฤษ และโมเดลที่ 2 ทดสอบกับคำถามภาษาไทย", "เทียบกันไม่ได้เลยเพราะใช้โจทย์คนละชุด"],
        ],
        "B",
        "A/B Benchmark ที่ดีต้องให้แต่ละโมเดลใช้การตั้งค่าที่ถูกต้องตาม Model Card, อุ่นเครื่องก่อนจับเวลา, และแข่งบนชุดข้อมูลเดียวกัน",
        "หลักการทำ A/B Benchmark เปรียบเทียบ 2 โมเดล Embedding ให้ยุติธรรมมีอะไรบ้าง?",
        "ใช้ prefix ตาม Model Card ของแต่ละโมเดล, L2 normalize ให้เท่าเทียม, warm-up ก่อนจับเวลา, และวัดบนชุดคำถามเดียวกัน",
      ),
      mc(
        "d072-q3",
        "ข้อใดเชื่อมโยงบทเรียนข้ามบล็อก (D38 + D66 + D69–D71) ได้ถูกต้องทั้งหมด?",
        [
          ["เพราะภาษาไทยใช้ token น้อยกว่าอังกฤษ โมเดลลิมิต 128 tokens จึงพอเสมอ", "ผิดจาก D66 — ภาษาไทยใช้ token *มากกว่า* อังกฤษ 1.5–3× จึงชนลิมิตเร็วกว่ามาก"],
          ["เมื่อทำ L2 normalize (D38/D69) เราค้นหาด้วย `Q @ D.T` (D70), ต้องระวัง Silent Truncation บนเอกสารไทย (D66/D71), และเลือกโมเดลด้วย Recall/MRR + RAM/Latency (D71/D72)", "ถูก — นี่คือภาพรวมครบวงจรของ Block B18 ที่ร้อยต่อกับความรู้เดิมอย่างลงตัว"],
          ["Matryoshka slicing ทำให้ไม่ต้องทำ L2 normalization อีกต่อไป", "ผิดจาก D71 — หลังตัดมิติ Matryoshka ต้องทำ L2 re-normalize ใหม่เสมอ"],
          ["Dense Embeddings แก้ปัญหาการค้นหารหัสใบแจ้งหนี้ `#INV-2026-0842` ได้ดีกว่า BM25 เสมอ", "ผิดจาก D70 — รหัสเฉพาะคือจุดบอดของ Dense Embeddings ที่ต้องใช้ BM25/Hybrid ช่วย"],
        ],
        "B",
        "ทุกชิ้นส่วนตั้งแต่ L2 norm (D38), Thai tokenization (D66), Bi-Encoder + prefix (D69), Exact search + threshold (D70) และ RAM/truncation/benchmark (D71–D72) ทำงานเสริมกันเป็นระบบเดียว",
        "สรุปภาพรวมความเชื่อมโยงระหว่าง D38, D66 และ Block B18 (D69–D72) ใน 1 ประโยค",
        "แปลงข้อความไทย (ที่กิน token เยอะ) เป็น unit dense embeddings อย่างถูก prefix และไม่โดนตัดหาง ค้นหาด้วย `Q @ D.T` พร้อม `min_score` และเลือกโมเดลด้วย Recall/MRR + RAM/Latency จริง",
      ),
      mc(
        "d072-q4",
        "ผล benchmark พบว่า Model X (`384-d`) ได้ `Recall@3 = 0.90, MRR@3 = 0.85, 12 ms/doc` ส่วน Model Y (`1024-d`) ได้ `Recall@3 = 0.92, MRR@3 = 0.86, 65 ms/doc` บนเซิร์ฟเวอร์ CPU ที่มี RAM จำกัดและต้องการ latency ต่ำ ข้อตัดสินใจใดมีเหตุผลทางวิศวกรรมมากที่สุด?",
        [
          ["เลือก Model Y เสมอเพราะ MRR สูงกว่า 0.01 ไม่ว่าจะช้ากว่ากี่เท่าก็ตาม", "การแลกความเร็วช้าลง 5.4× และ RAM เพิ่ม 2.7× เพื่อ MRR ที่ต่างกันแค่ 0.01 บนข้อจำกัด CPU/RAM อาจไม่คุ้ม"],
          ["เลือก Model X เป็น baseline บน production เพราะได้คุณภาพแทบเท่ากันแต่เร็วกว่า 5× และประหยัด RAM 2.7× แล้วนำเวลาไปแก้เคสที่พลาด (เช่น เพิ่ม Hybrid BM25 ใน Phase 4)", "ถูก — เป็นการชั่ง trade-off คุณภาพ เทียบกับ latency/RAM และเลือกคันโยกที่คุ้มค่ากว่า"],
          ["นำเวกเตอร์ 384-d ของ Model X มาบวกกับเวกเตอร์ 1024-d ของ Model Y โดยตรง", "บวกกันไม่ได้เพราะมิติและพื้นที่เวกเตอร์ต่างกัน"],
          ["ลดจำนวนเอกสารในคลังลงครึ่งหนึ่งเพื่อให้ Model Y รันเร็วขึ้น", "การลบเอกสารทิ้งจะทำลายคุณภาพคำตอบของผู้ใช้โดยตรง"],
        ],
        "B",
        "วิศวกร AI ตัดสินใจจาก trade-off โดยรวม: หากคุณภาพต่างกันน้อยมากแต่ทรัพยากรต่างกันหลายเท่า การเลือกโมเดลที่คล่องตัวกว่าแล้วไปเพิ่ม Hybrid Search / Reranker มักให้ผลตอบแทนสูงกว่ามาก",
        "หากโมเดลเล็กกว่าเร็วกว่า 5× ใช้ RAM น้อยกว่า 2.7× แต่ MRR ต่ำกว่าโมเดลใหญ่แค่ `0.01` ควรตัดสินใจอย่างไร?",
        "เลือกโมเดลเล็กเป็น baseline ที่คุ้มค่ากว่า แล้วนำงบ latency/RAM ที่เหลือไปต่อยอดด้วย Hybrid Search (BM25 + RRF) หรือ Reranker ใน Phase 4",
      ),
    ],
  },

  takeaways: [
    "ตัดสินใจเลือก Embedding Model ด้วยตัวเลขจากชุดคำถามจริงของโดเมนคุณ (ไทยพูด + ไทยปนอังกฤษ) แทนการเดาจากความรู้สึกหรืออันดับภาษาอังกฤษ",
    "วัด **Recall@k** คู่กับ **{{mrr}}** เสมอ: Recall บอกว่าหาเจอไหม ส่วน MRR บอกว่าคำตอบจริงอยู่อันดับ 1 แค่ไหน",
    "ทำ A/B Benchmark อย่างยุติธรรม: ใช้ Adapter จัดการ prefix ตาม Model Card ของแต่ละโมเดล, ทำ L2 normalization, และ warm-up ก่อนจับเวลา",
    "พร้อมก้าวสู่ Block B19 (Production LLM APIs & Context Engineering) ด้วยพื้นฐาน Embeddings ที่วัดผลได้และคุมต้นทุน RAM/Latency เป็น",
  ],

  reviewCards: [
    rc(
      "d072-rc-1",
      "ความต่างระหว่าง `Recall@3` และ `MRR@3` คืออะไร?",
      "`Recall@3` วัดว่าคำตอบจริงติดอยู่ใน 3 อันดับแรกหรือไม่ (`0` หรือ `1` ต่อข้อ) ส่วน `MRR@3` วัดค่าเฉลี่ยของ `1 / rank` จึงให้คะแนนอันดับ 1 (`1.0`) สูงกว่าอันดับ 2 (`0.5`) และอันดับ 3 (`0.333`)",
    ),
    rc(
      "d072-rc-2",
      "ทำไมต้องรัน warm-up และแยก per-model prefix adapter ตอนทำ A/B Embedding Benchmark?",
      "Warm-up ป้องกันไม่ให้เวลาโหลด/init ปนกับ latency จริง และ adapter รับประกันว่าโมเดลอย่าง E5 ได้ใช้ `query:`/`passage:` ตาม Model Card โดยไม่ไปปนกับโมเดลอื่น",
    ),
    rc(
      "d072-rc-3",
      "หลังจบรอบทบทวน Block B18 ขั้นตอน 4 ข้อก่อนนำ Embedding Model ขึ้น production มีอะไรบ้าง?",
      "1) เช็กความเสี่ยง Silent Truncation ของข้อความไทย 2) คำนวณ RAM (`N × D × bytes × 1.5`) 3) รัน A/B benchmark (Recall@k, MRR, ms/doc) บนคำถามไทยปนอังกฤษ 4) ตั้ง `min_score` threshold และเตรียมแผน Hybrid Search สำหรับรหัสเฉพาะ",
    ),
  ],

  sources: [
    { label: "Information Retrieval Evaluation — Recall@k & MRR (Manning et al., Stanford NLP)", href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html" },
    { label: "Sentence-Transformers Docs — Information Retrieval Evaluator", href: "https://sbert.net/docs/package_reference/sentence_transformer/evaluation.html" },
    { label: "MTEB Benchmark Paper (Muennighoff et al., 2023)", href: "https://arxiv.org/abs/2210.07316" },
    { label: "Hugging Face — Multilingual E5 & MiniLM Model Comparison", href: "https://huggingface.co/models?pipeline_tag=sentence-similarity&sort=trending" },
  ],

  glossary: ["embedding", "cosine-similarity", "dot-product", "bpe-tokenizer", "mrr", "top-k", "golden-dataset", "reproducibility"],
});
