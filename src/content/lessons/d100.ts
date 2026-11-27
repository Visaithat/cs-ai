import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D100 — Phase 4 / Block B25 (Review Day — Milestone Day 100!)
 * Review: Quiz + Build Thai BM25 index vs Vector index comparison
 */
export const d100: Lesson = defineLesson({
  day: 100,
  titleTh: "ทบทวน B25 (Day 100!): เทียบผลจริง Thai BM25 กับ Dense Vector บนชุดคำถามไทย",
  tagline: "30 นาที · รอบทบทวน D97–D99 + D49/D70 · รันบนเครื่องคุณ 100% · พิสูจน์ด้วยตัวเลข Recall@3 และ MRR ว่าทำไมต้องไปต่อที่ Hybrid RRF",
  icon: "git-compare",
  visual: {
    id: "thai-bm25-index",
    title: "ทบทวน B25 (Day 100!): เทียบผล Thai BM25 vs Dense Vector บนชุดคำถามจริง",
    caption: "วัด Recall@3 แยกตามประเภทคำถาม (รหัสเอกสาร vs คำถามเชิงความหมาย) เพื่อเตรียมพร้อมสู่ Hybrid RRF ใน Day 101",
    alt: "แผนภาพเปรียบเทียบ Thai BM25 และ Vector index",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบน CPU ของเครื่องคุณ 100% — ใช้ PyThaiNLP + rank_bm25 เทียบกับ Dense Vector Index แบบ offline ใน pytest",
  tools: ["PyThaiNLP", "rank_bm25", "NumPy", "Qdrant / pgvector", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ร้อยต่อดัชนีสองโลกจาก Block B25 (D97–D99)",
      body: "ตลอด 3 วันที่ผ่านมา เราสร้างครบทั้ง **Dense Vector Index** (`pgvector` {{hnsw}} ใน D97 และ `Qdrant` Hybrid/Payload Filter ใน D98) และ **Thai Lexical Index** ({{pythainlp}} `newmm` + {{bm25}} ใน D99)",
      lessonNote: "ใน Day 100 นี้เรานำสองระบบค้นหามาวางเทียบข้างกันบนคลังเอกสารไทยชุดเดียวกัน เพื่อเห็นจุดแข็ง-จุดอ่อนด้วยตาตัวเอง",
    },
    {
      node: 2,
      heading: "แบ่งชุดคำถามตามลักษณะงานจริง (Stratified Evaluation)",
      body: "การดูแค่ค่าเฉลี่ยรวม (overall score) มักซ่อนจุดบอดสำคัญ: ระบบหนึ่งอาจได้ 100% ในคำถามรหัสเอกสารแต่ได้ 0% ในคำถามคำพ้องความหมาย",
      lessonNote: "เราแบ่ง {{golden-dataset}} ออกเป็นกลุ่ม **`exact_id`** (รหัสใบแจ้งหนี้/SKU/มาตรา) และกลุ่ม **`semantic_paraphrase`** (ภาษาพูด/คำพ้องความหมาย)",
    },
    {
      node: 3,
      heading: "วัดด้วย Recall@3 และ MRR แทนการสุ่มลองถามด้วยความรู้สึก",
      body: "เชื่อมความรู้จาก D49 (Thai segmentation) และ D70 (Semantic search nearest neighbors) เข้ากับตัวชี้วัด Retrieval มาตรฐานอย่าง **Recall@3** และ **{{mrr}}**",
      lessonNote: "ผลลัพธ์เชิงตัวเลขจะพิสูจน์ชัดเจนว่า BM25 ชนะกลุ่ม `exact_id` ขณะที่ Dense Vector ชนะกลุ่ม `semantic_paraphrase` — ไม่มีตัวไหนชนะทุกสนามเพียงลำพัง",
    },
    {
      node: 6,
      heading: "หลักฐานสำคัญก่อนก้าวสู่ Block B26: Hybrid Search RRF (Day 101)",
      body: "เมื่อเห็นรายการคำถามที่แต่ละตัวค้นหาพลาด (Error Analysis) คุณจะเข้าใจทันทีว่าทำไมพรุ่งนี้เราต้องผสานทั้งสองอันดับด้วย {{rrf}} และคัดละเอียดด้วย Reranker",
      lessonNote: "ยินดีด้วยกับการเดินทางครบ **100 วัน**! คุณพร้อมสร้างชั้น Hybrid Retrieval ระดับ Production ใน Block B26 เต็มตัว",
    },
  ],

  objectives: [
    "**ทบทวนแบบสลับหัวข้อ (Interleaved Recall)** ครบทั้ง D97 (`pgvector` `<=>` / HNSW / `iterative_scan`), D98 (`Qdrant` Named+Sparse Vectors / `Filter(must=...)` / `:memory:`), D99 (`PyThaiNLP` + `BM25Okapi` / `k1`, `b` / Index–Query Parity) ร่วมกับ D49 และ D70",
    "**สร้าง Comparison Harness บนเครื่อง** ที่รัน **Thai BM25 Index** และ **Dense Vector Index** (`cosine-similarity`) เคียงข้างกันบนคลังเอกสารไทยชุดเดียวกัน",
    "**คำนวณและวิเคราะห์ `Recall@3` และ `MRR@3` แยกตามหมวดคำถาม** (`exact_id` vs `semantic_paraphrase` vs `overall`) เพื่อสรุปหลักฐานเชิงปริมาณก่อนผสานด้วย {{rrf}} ใน Day 101",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D97 (`pgvector` HNSW), D98 (`Qdrant` Hybrid/Payload) และ D99 (`PyThaiNLP` + `BM25`)",
    "ทบทวน D49 (`PyThaiNLP newmm` + `dict_trie`) และ D70 (Semantic Search ด้วย {{cosine-similarity}})",
    "มี `pythainlp`, `rank-bm25`, `numpy`, `pytest` และ `ruff` ในโปรเจกต์ `uv`",
    "รันบน CPU ของเครื่องคุณได้ 100% ไม่ต้องใช้ API key หรือดาวน์โหลดโมเดลขนาดใหญ่",
  ],

  setup: {
    intro:
      "เตรียมโฟลเดอร์สำหรับรอบทบทวน **Day 100** ด้วย `uv` (ติดตั้ง `pythainlp`, `rank-bm25`, `numpy` และ `pytest` เพื่อรันการเปรียบเทียบ Thai BM25 vs Dense Vector แบบ 100% ออฟไลน์)",
    commands: `uv init ai-day100-review && cd ai-day100-review
uv add pythainlp rank-bm25 numpy
uv add --dev pytest ruff
uv run python -c "import pythainlp, rank_bm25, numpy; print('Day 100 Review Ready!')"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์ `ai-day100-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pythainlp`, `rank-bm25`, `numpy`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กแล้วเห็น `Day 100 Review Ready!` พร้อมลุยควิซ 10 นาที + แล็บเทียบดัชนี 15 นาที"],
    ],
    note: "รอบทบทวน Day 100 แบ่งเวลา 30 นาที: 10 นาทีทำ Interleaved Recall Quiz (D97–D99 + D49/D70) → 15 นาทีสร้างสคริปต์เทียบ Thai BM25 vs Dense Vector และรัน `pytest` → 5 นาทีสรุป Error Log เตรียมพร้อมสู่ Day 101 Hybrid RRF",
  },

  concepts: [
    {
      id: "b25-interleaved-recap",
      title: "1 · ภาพรวม Block B25 (D97–D99) + D49/D70: สองเครื่องยนต์ค้นคืนที่เติมเต็มกัน",
      paragraphs: [
        "ยินดีด้วยที่คุณมาถึง **Day 100** ของเส้นทางวิศวกร AI! ตลอด Block B25 เราประกอบฐานรากของชั้น **Retrieval** ครบทั้งสองสายแล้ว: สายแรกคือ **Dense Semantic Retrieval** ที่ต่อยอดจาก D70 (Dense {{embedding}} และ Cosine nearest neighbors) มาสู่ดัชนีจริงระดับ Production อย่าง **`pgvector` {{hnsw}}** (`<=>`, `halfvec`, `hnsw.iterative_scan` ใน D97) และ **`Qdrant`** (Hybrid Dense+Sparse Collections, Payload Index `is_tenant=True`, และ `:memory:` test ใน D98)",
        "สายที่สองคือ **Thai Lexical Retrieval** ที่ต่อยอดจาก D49 ({{pythainlp}} `newmm` + `dict_trie`) มาสู่ **`BM25Okapi`** ใน D99 พร้อมกฎเหล็กสองข้อคือ **รักษารหัสเอกสารไม่ให้แตก** และ **Index–Query Tokenizer Parity**",
        "วันนี้เราจะไม่เดาว่าตัวไหนดีกว่า แต่จะสร้าง **Side-by-Side Comparison Harness** เพื่อวัดผลทั้งสองเครื่องยนต์ภายใต้กติกาและชุดข้อมูลเดียวกันเป๊ะ",
      ],
      analogy:
        "จบ Block B25 เหมือนเรามีทั้ง 'กล้องส่องทางไกล' ที่เห็นภาพรวมความหมาย (Dense Vector) และ 'แว่นขยาย' ที่อ่านเลขรหัสตัวจิ๋วได้คมกริบ (Thai BM25) — วันนี้คือการทดสอบทั้งสองชิ้นบนป้ายบอกทางจริง 2 แบบ เพื่อพิสูจน์ว่าทำไมพรุ่งนี้ต้องพกทั้งคู่ไปด้วยกัน",
      bullets: [
        "**D97 (`pgvector`)**: `ORDER BY embedding <=> $1 LIMIT k` + `halfvec` + `SET LOCAL hnsw.iterative_scan = strict_order;`",
        "**D98 (`Qdrant`)**: Named Dense + Sparse Vectors ใน Point เดียว + `Filter(must=[tenant_id])` + `QdrantClient(\":memory:\")`",
        "**D99 (`Thai BM25`)**: Regex รักษารหัส + `PyThaiNLP newmm` + `BM25Okapi(k1=1.5, b=0.75)` + กรอง `score > 0`",
      ],
      whyTitle: "Why this matters — วัดแยกตาม Slice ก่อนตัดสินใจเปลี่ยนสถาปัตยกรรม",
      whyParagraphs: [
        "วิศวกร AI ที่เก่งจะไม่รีบเพิ่มความซับซ้อน (เช่น Hybrid Search หรือ Reranker) เพียงเพราะอ่านบล็อกมา แต่จะวัด baseline ของแต่ละตัวค้นหาบนข้อมูลของตัวเองก่อนเพื่อเห็นปัญหาจริง",
        "เมื่อคุณเห็นตัวเลขชัด ๆ ว่า BM25 ตกในหมวดคำพ้องความหมาย และ Dense ตกในหมวดรหัสเอกสาร การเพิ่ม RRF ใน Day 101 จะมีเหตุผลเชิงประจักษ์รองรับเต็ม 100%",
      ],
    },
    {
      id: "sliced-recall-and-mrr",
      title: "2 · วัดเทียบแบบแยกกลุ่มคำถาม (Sliced Metrics): `exact_id` vs `semantic_paraphrase`",
      paragraphs: [
        "ถ้าคุณเอาคำถาม 6 ข้อ (รหัสเอกสาร 3 ข้อ + คำพ้องความหมาย 3 ข้อ) มารวมหาค่าเฉลี่ยครั้งเดียว คุณอาจเห็นว่า BM25 ได้ `Recall@3 = 0.50` และ Dense Vector ได้ `Recall@3 = 0.50` เท่ากันเป๊ะ แล้วเข้าใจผิดว่า *\"ทั้งสองวิธีเก่งพอ ๆ กัน เลือกตัวไหนก็ได้\"*",
        "แต่พอเราแยกดูตามหมวดคำถาม (**Sliced Evaluation**) ความจริงจะโผล่ออกมาทันที: ในหมวด **`exact_id`** (เช่น `\"เช็กสถานะ #INV-2026-009\"`) BM25 ได้ `Recall@3 = 1.00, MRR = 1.00` ขณะที่ Dense อาจสลับอันดับกับ `INV-2026-019` ส่วนในหมวด **`semantic_paraphrase`** (เช่น `\"ซื้อผิดรุ่นอยากได้ตังค์กลับ\"`) Dense ได้ `Recall@3 = 1.00, MRR = 1.00` ขณะที่ BM25 ได้ `0.00`!",
        "การรายงานทั้ง **`Recall@k`** (เจอคำตอบใน top-k หรือไม่) และ **`{{mrr}}`** (เฉลี่ย `1 / rank` ของคำตอบแรกที่เจอ) แบบ **แยกตาม slice** จึงเป็นอาวุธสำคัญที่จะติดตัวคุณไปจนถึง Phase 5 (Eval-Driven Development) และ Capstone",
      ],
      analogy:
        "เหมือนการเทียบนักวิ่งระยะสั้นกับนักวิ่งมาราธอน: ถ้าเอาเวลาเฉลี่ยรวมสองสนามมาเทียบอาจดูเท่ากัน แต่พอแยกดูสนาม 100 เมตรกับสนาม 42 กิโลเมตร จะเห็นชัดทันทีว่าแต่ละคนเก่งคนละทาง",
      code: {
        language: "python",
        filename: "sliced_metrics.py",
        code: `def recall_at_k(ranked_ids: list[str], expected_id: str, k: int = 3) -> float:
    return 1.0 if expected_id in ranked_ids[:k] else 0.0

def reciprocal_rank_at_k(ranked_ids: list[str], expected_id: str, k: int = 3) -> float:
    for rank, doc_id in enumerate(ranked_ids[:k], start=1):
        if doc_id == expected_id:
            return 1.0 / rank
    return 0.0

# เคสที่คำตอบอยู่อันดับ 1 vs อันดับ 3 -> Recall@3 เท่ากัน แต่ MRR ต่างกัน 3 เท่า
print("Rank 1 -> Recall@3:", recall_at_k(["d1", "d2", "d3"], "d1"), "RR:", reciprocal_rank_at_k(["d1", "d2", "d3"], "d1"))
print("Rank 3 -> Recall@3:", recall_at_k(["d2", "d3", "d1"], "d1"), "RR:", round(reciprocal_rank_at_k(["d2", "d3", "d1"], "d1"), 3))`,
        caption: "ดูทั้ง `Recall@3` (ติดอันดับ top-3 ไหม) และ `RR@3` (อยู่อันดับบนสุดแค่ไหน) แยกตามหมวดคำถาม",
      },
      whyTitle: "Why this matters — ตั้งเส้นฐาน (Baseline) เพื่อพิสูจน์ผลของ Hybrid RRF พรุ่งนี้",
      whyParagraphs: [
        "ตารางเปรียบเทียบแบบแยก slice ที่คุณสร้างวันนี้คือตาราง Baseline ของจริง: พรุ่งนี้ใน Day 101 เมื่อคุณเพิ่ม RRF ผสานทั้งสองตัวเข้าด้วยกัน คุณจะเห็นทั้ง `exact_id` และ `semantic_paraphrase` กระโดดขึ้นสูงพร้อมกันทั้งคู่",
        "นอกจากนี้ การแยกดู failure cases (`bm25_misses`, `dense_misses`) ยังช่วยบอกใบ้ทันทีว่าคำไหนควรเพิ่มเข้า `custom_dict` ของ `PyThaiNLP` หรือเอกสารไหนควรปรับ `chunking`",
      ],
    },
    {
      id: "deterministic-offline-benchmark-design",
      title: "3 · ออกแบบ Comparison Harness ที่รันใน pytest ได้เร็วและสลับ Embedder จริงได้",
      paragraphs: [
        "ในงานจริงคุณจะรัน Dense Vector ด้วยโมเดล multilingual อย่าง `multilingual-e5-small` หรือ `bge-m3` (เก็บใน `pgvector` หรือ `Qdrant`) แต่เวลาเขียน unit test สำหรับ Comparison Harness เราไม่ควรบังคับให้ CI ดาวน์โหลดโมเดลขนาดหลายร้อย MB ทุกรอบ",
        "แนวทางมาตรฐานคือออกแบบ `DenseVectorIndex` ให้รับฟังก์ชัน **`embed_fn: Callable[[str], np.ndarray]`** เข้ามา (Dependency Injection): ในโหมดทดสอบบนเครื่องและ CI เราส่ง Deterministic Mock Embedder ที่จำลองจุดแข็งเรื่องความหมายและจุดอ่อนเรื่องรหัสเฉพาะได้อย่างสมจริง (รันจบใน `< 0.2` วินาที) ส่วนเวลาวัดผลจริงบนเครื่องค่อยสลับ `embed_fn` เป็น `SentenceTransformer.encode` โดยไม่ต้องแก้โค้ด harness แม้แต่บรรทัดเดียว",
        "รูปแบบนี้ทำให้ชุดทดสอบของคุณเร็ว, ทำซ้ำได้ 100% และพร้อมขยายเป็น Eval Suite เต็มรูปแบบใน Block B26 และ Phase 5",
      ],
      analogy:
        "เหมือนการออกแบบแท่นทดสอบเครื่องยนต์ที่ใช้ปลั๊กมาตรฐานเดียวกัน: ตอนเทสต์ระบบวัดรอบในห้องแล็บเสียบมอเตอร์จำลองที่คุมค่าได้เป๊ะ พอจะเทสต์จริงค่อยเสียบเครื่องยนต์ตัวจริงเข้าปลั๊กเดิม",
      bullets: [
        "**Dependency Injection (`embed_fn`)**: แยกชั้นสร้างเวกเตอร์ออกจากชั้นค้นหาและชั้นวัดผล",
        "**L2 Normalization + Cosine Similarity**: ตรวจให้เวกเตอร์ทั้งเอกสารและคำถามเป็น unit vectors ก่อนคูณ `dot` เพื่อผลลัพธ์เดียวกับ `pgvector <=>` และ `Qdrant Cosine`",
        "**Report โครงสร้างชัดเจน**: คืน `overall`, `by_category` (`exact_id`, `semantic_paraphrase`) และรายชื่อ `misses` ของแต่ละตัวค้นหา",
      ],
      whyTitle: "Why this matters — แยกความถูกต้องของโค้ดประเมินออกจากความแปรปรวนของโมเดล",
      whyParagraphs: [
        "หากตัววัด `Recall@3` หรือ `MRR` เองมีบั๊ก การเทียบโมเดลราคาแพงแค่ไหนก็ได้ข้อสรุปผิดทั้งหมด การเทสต์ harness ด้วย deterministic mock embedder ช่วยยืนยัน 100% ว่าสูตรวัดผลและการเปรียบเทียบทำงานถูกต้องก่อนเสียเวลารันบนข้อมูลจริง",
        "และนี่คือรากฐานสำคัญของ Eval-Driven Development ที่เราจะใช้ตลอด Phase 4–6",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เปรียบเทียบกับ A/B Benchmark และ Dependency Injection ใน Backend",
      body: [
        "การสร้าง Comparison Harness วันนี้ใช้หลักการเดียวกับการทำ Benchmark Service ในเว็บ Backend:",
      ],
      table: [
        ["`embed_fn` injection ใน `DenseVectorIndex`", "Interface / Strategy Pattern เพื่อ mock service ใน unit test"],
        ["Sliced Metrics (`exact_id` vs `semantic`)", "การแยกดู latency/conversion ตาม segment แทนค่าเฉลี่ยรวม"],
        ["`Recall@3` & `MRR@3`", "ตัวชี้วัดคุณภาพอันดับ Search Result (คล้าย NDCG/Click-through position)"],
        ["Failure Case Log (`misses`)", "Regression test cases จากบั๊กจริงของผู้ใช้"],
      ],
    },
    student: {
      title: "First-Year Note — อ่านค่า MRR และ Recall@3 ให้เป็นใน 10 วินาที",
      body: [
        "สมมติมีคำถาม 2 ข้อ และเราดู Top-3: ข้อแรกคำตอบจริงอยู่อันดับ 1 (`Recall = 1`, `RR = 1/1 = 1.0`), ข้อสองคำตอบจริงอยู่อันดับ 2 (`Recall = 1`, `RR = 1/2 = 0.5`) — ค่าเฉลี่ยจะเป็น **`Recall@3 = 1.00`** และ **`MRR@3 = (1.0 + 0.5) / 2 = 0.75`**",
        "ถ้าข้อสองไม่เจอคำตอบใน Top-3 เลย (`Recall = 0`, `RR = 0.0`) ค่าเฉลี่ยจะเหลือ **`Recall@3 = 0.50`** และ **`MRR@3 = 0.50`** — จำง่าย ๆ ว่า `Recall@3` คือ \"ติด Top-3 กี่เปอร์เซ็นต์\" ส่วน `MRR@3` คือ \"เฉลี่ยแล้วติดอันดับบนแค่ไหน\"",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีคลังเอกสาร 4 ชิ้น (ใบแจ้งหนี้ `INV-2026-009` vs `INV-2026-019`, นโยบายคืนเงิน และคู่มือใบกำกับภาษี) กับคำถาม 2 ประเภท (`exact_id` และ `semantic_paraphrase`) ลองรัน Thai BM25 เทียบกับ Dense Vector ข้างกันเพื่อดูผลลัพธ์จริง",
    steps: [
      {
        title: "1 · เตรียม Thai BM25 Index และ Dense Vector Index บนคลังชุดเดียวกัน",
        explain:
          "จำลอง Dense Embedder ที่เข้าใจกลุ่มความหมาย (`คืนเงิน`/`ตังค์กลับ`, `ใบแจ้งหนี้`/`ค้างชำระ`) แต่ให้เวกเตอร์ของ `INV-2026-009` กับ `INV-2026-019` ใกล้กันมาก (พฤติกรรมจริงของ multilingual embedding)",
        code: {
          language: "python",
          filename: "worked_compare.py",
          code: `import re
import numpy as np
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from rank_bm25 import BM25Okapi

CODE_RE = re.compile(r"[A-Za-z]{2,}(?:-[A-Za-z0-9]+)+")
TRIE = dict_trie(set(thai_words()) | {"พร้อมเพย์", "ใบกำกับภาษี", "ค้างชำระ", "คืนเงิน"})

def tokenize(text: str) -> list[str]:
    codes = [m.group(0).lower() for m in CODE_RE.finditer(text)]
    rest = CODE_RE.sub(" ", text)
    toks = word_tokenize(rest, engine="newmm", custom_dict=TRIE, keep_whitespace=False)
    return codes + [t.strip().lower() for t in toks if t.strip() and t.strip().isalnum()]

DOCS = [
    ("doc_inv_009", "ใบแจ้งหนี้ INV-2026-009 ยอดค้างชำระ 1,490 บาท ผ่านพร้อมเพย์"),
    ("doc_inv_019", "ใบแจ้งหนี้ INV-2026-019 ยอดค้างชำระ 2,990 บาท ผ่านบัตรเครดิต"),
    ("doc_refund",  "นโยบายการขอคืนเงินภายใน 7 วัน สำหรับสินค้ายังไม่แกะกล่อง"),
    ("doc_tax",     "วิธีขอใบกำกับภาษีเต็มรูปแบบสำหรับลูกค้าองค์กร"),
]

# เวกเตอร์ความหมาย 3 มิติ: [billing/invoice, refund/money-back, tax]
DOC_VECS = {
    "doc_inv_009": np.array([0.96, 0.28, 0.00], dtype=np.float32),
    "doc_inv_019": np.array([0.99, 0.14, 0.00], dtype=np.float32),
    "doc_refund":  np.array([0.10, 0.99, 0.00], dtype=np.float32),
    "doc_tax":     np.array([0.15, 0.00, 0.99], dtype=np.float32),
}

bm25 = BM25Okapi([tokenize(t) for _, t in DOCS])
print("Indexed", len(DOCS), "docs in both BM25 and Dense indexes")`,
        },
        output: `Indexed 4 docs in both BM25 and Dense indexes`,
      },
      {
        title: "2 · ยิงคำถาม 2 ประเภท (Exact ID vs Semantic Paraphrase) เข้าทั้งสองดัชนี",
        explain:
          "เทียบผล Top-2 ของคำถามรหัส `#INV-2026-009` และคำถามภาษาพูด `\"ซื้อผิดรุ่นอยากได้ตังค์กลับ\"` ข้างกัน",
        code: {
          language: "python",
          filename: "worked_compare.py",
          code: `def search_bm25(query: str, top_k: int = 2) -> list[str]:
    scores = bm25.get_scores(tokenize(query))
    pairs = [(DOCS[i][0], float(scores[i])) for i in range(len(DOCS)) if scores[i] > 0]
    pairs.sort(key=lambda x: (-x[1], x[0]))
    return [doc_id for doc_id, _ in pairs[:top_k]]

def search_dense(q_vec: np.ndarray, top_k: int = 2) -> list[str]:
    q_norm = q_vec / np.linalg.norm(q_vec)
    pairs = []
    for doc_id, vec in DOC_VECS.items():
        sim = float(np.dot(q_norm, vec / np.linalg.norm(vec)))
        pairs.append((doc_id, sim))
    pairs.sort(key=lambda x: (-x[1], x[0]))
    return [doc_id for doc_id, _ in pairs[:top_k]]

q1 = ("exact_id", "เช็กสถานะ #INV-2026-009", np.array([0.99, 0.10, 0.0], dtype=np.float32))
q2 = ("semantic", "ซื้อผิดรุ่นอยากได้ตังค์กลับ", np.array([0.05, 0.99, 0.0], dtype=np.float32))

for kind, text, q_vec in [q1, q2]:
    print(f"[{kind}] {text}")
    print("  BM25 top-2 :", search_bm25(text))
    print("  Dense top-2:", search_dense(q_vec))`,
        },
        output: `[exact_id] เช็กสถานะ #INV-2026-009
  BM25 top-2 : ['doc_inv_009', 'doc_inv_019']
  Dense top-2: ['doc_inv_019', 'doc_inv_009']
[semantic] ซื้อผิดรุ่นอยากได้ตังค์กลับ
  BM25 top-2 : []
  Dense top-2: ['doc_refund', 'doc_inv_009']`,
      },
      {
        title: "3 · สรุปผลต่างที่ปูทางตรงสู่ Day 101 Hybrid RRF",
        explain:
          "เห็นชัดเป็นหลักฐาน: คำถาม `exact_id` ตัว BM25 เอา `doc_inv_009` ขึ้นอันดับ 1 (Dense สลับกับ `019`) ส่วนคำถาม `semantic` ตัว Dense เอา `doc_refund` ขึ้นอันดับ 1 (BM25 ว่างเปล่า `[]`) — ไม่มีใครชนะทุกสนาม!",
        code: {
          language: "python",
          filename: "worked_compare.py",
          code: `summary = {
    "exact_id": {"bm25_top1": "doc_inv_009 (HIT)", "dense_top1": "doc_inv_019 (MISS)"},
    "semantic": {"bm25_top1": "NONE (MISS)",       "dense_top1": "doc_refund (HIT)"},
}
for cat, res in summary.items():
    print(f"{cat:<10} -> BM25: {res['bm25_top1']:<18} | Dense: {res['dense_top1']}")`,
        },
        output: `exact_id   -> BM25: doc_inv_009 (HIT)  | Dense: doc_inv_019 (MISS)
semantic   -> BM25: NONE (MISS)        | Dense: doc_refund (HIT)`,
      },
    ],
    gotcha:
      "จุดสังเกต: สังเกตว่าในเคส `exact_id` ตัว Dense Vector เอา `doc_inv_009` มาอยู่อันดับ 2 ทำให้ `Recall@3` ยังเป็น `1.0` แต่ **`MRR@3` ตกจาก `1.0` เหลือ `0.5`**! นี่คือเหตุผลที่เราต้องดูทั้ง `Recall@k` และ `MRR@k` ควบคู่กันเสมอ",
  },

  practice: {
    intro:
      "โจทย์ทบทวน Day 100 (15 นาที): สร้าง **Thai BM25 vs Dense Vector Comparison Harness** (`compare_retrievers`) ที่ประเมินทั้งสองดัชนีบนชุดคำถามไทยที่มีหมวด `exact_id` และ `semantic_paraphrase` พร้อมรายงาน `Recall@k`, `MRR@k` แยกตามหมวดและรายชื่อเคสที่พลาด",
    requirements: [
      "กำหนด `EvalQuery(query_id: str, text: str, expected_doc_id: str, category: str)` และ `RetrieverSummary(recall_at_k: float, mrr_at_k: float, misses: list[str])` (dataclass)",
      "สร้าง `ThaiBM25Retriever(docs: list[tuple[str, str]], custom_words: set[str] | None = None)` ที่รักษารหัสเอกสารด้วย regex + ตัดคำด้วย `PyThaiNLP newmm` + `BM25Okapi`, กรอง `score > 0`, เรียง `(-score, doc_id)` และคืนลิสต์ `doc_id` ไม่เกิน `top_k`",
      "สร้าง `DenseCosineRetriever(docs: list[tuple[str, str]], embed_fn: Callable[[str], np.ndarray])` ที่ L2-normalize เวกเตอร์เอกสารและคำถาม, คำนวณ {{cosine-similarity}}, เรียง `(-sim, doc_id)` และคืนลิสต์ `doc_id` ไม่เกิน `top_k`",
      "สร้างฟังก์ชัน `evaluate_retriever(search_fn: Callable[[str, int], list[str]], queries: list[EvalQuery], k: int = 3) -> dict[str, RetrieverSummary]` คืนผลสรุปทั้งคีย์ `\"overall\"` และแยกตามแต่ละ `query.category` (เช่น `\"exact_id\"`, `\"semantic_paraphrase\"`) โดย `misses` เก็บ `query_id` ที่ไม่พบ `expected_doc_id` ใน top-k (ถ้า `k <= 0` หรือ `queries` ว่างให้โยน `ValueError`)",
      "สร้างฟังก์ชัน `compare_retrievers(bm25: ThaiBM25Retriever, dense: DenseCosineRetriever, queries: list[EvalQuery], k: int = 3) -> dict[str, dict[str, RetrieverSummary]]` คืน `{\"bm25\": ..., \"dense\": ...}` เพื่อให้เทียบผลแต่ละหมวดได้ทันที",
    ],
    starter: {
      language: "python",
      filename: "exercise_day100.py",
      code: `from __future__ import annotations
from dataclasses import dataclass
import re
from typing import Callable
import numpy as np
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from rank_bm25 import BM25Okapi

CODE_RE = re.compile(r"[A-Za-z]{2,}(?:-[A-Za-z0-9]+)+")
PUNCT_RE = re.compile(r"^[\\W_]+$", re.UNICODE)


@dataclass(frozen=True)
class EvalQuery:
    query_id: str
    text: str
    expected_doc_id: str
    category: str


@dataclass(frozen=True)
class RetrieverSummary:
    recall_at_k: float
    mrr_at_k: float
    misses: list[str]


class ThaiBM25Retriever:
    def __init__(
        self,
        docs: list[tuple[str, str]],
        custom_words: set[str] | None = None,
    ) -> None:
        # TODO: เตรียม trie, tokenize ทุกเอกสาร และสร้าง BM25Okapi
        raise NotImplementedError

    def search(self, query: str, top_k: int = 3) -> list[str]:
        # TODO: ตัดคำ query ด้วย tokenizer เดียวกัน กรอง score > 0 เรียง (-score, doc_id)[:top_k]
        raise NotImplementedError


class DenseCosineRetriever:
    def __init__(
        self,
        docs: list[tuple[str, str]],
        embed_fn: Callable[[str], np.ndarray],
    ) -> None:
        # TODO: แปลงเอกสารทุกชิ้นด้วย embed_fn และ L2-normalize เก็บไว้
        raise NotImplementedError

    def search(self, query: str, top_k: int = 3) -> list[str]:
        # TODO: แปลง query ด้วย embed_fn, คำนวณ cosine similarity, เรียง (-sim, doc_id)[:top_k]
        raise NotImplementedError


def evaluate_retriever(
    search_fn: Callable[[str, int], list[str]],
    queries: list[EvalQuery],
    k: int = 3,
) -> dict[str, RetrieverSummary]:
    """คำนวณ Recall@k, MRR@k และรายชื่อ misses ทั้งแบบ overall และแยกตาม category."""
    # TODO: 1) validate k > 0 และ queries ไม่ว่าง
    # TODO: 2) รัน search_fn(q.text, k) หา recall, rr และ misses แยกรวม + แยก category
    raise NotImplementedError


def compare_retrievers(
    bm25: ThaiBM25Retriever,
    dense: DenseCosineRetriever,
    queries: list[EvalQuery],
    k: int = 3,
) -> dict[str, dict[str, RetrieverSummary]]:
    # TODO: คืน {"bm25": evaluate_retriever(...), "dense": evaluate_retriever(...)}
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day100.py",
      code: `import numpy as np
import pytest
from exercise_day100 import (
    DenseCosineRetriever,
    EvalQuery,
    ThaiBM25Retriever,
    compare_retrievers,
    evaluate_retriever,
)

DOCS = [
    ("doc_inv_009", "ใบแจ้งหนี้ INV-2026-009 ยอดค้างชำระ 1,490 บาท ชำระผ่านพร้อมเพย์"),
    ("doc_inv_019", "ใบแจ้งหนี้ INV-2026-019 ยอดค้างชำระ 2,990 บาท ชำระผ่านบัตรเครดิต"),
    ("doc_sku_8821", "คู่มือรับประกันสินค้า SKU-8821 หูฟังไร้สายรับประกัน 1 ปีเต็ม"),
    ("doc_sku_8829", "คู่มือรับประกันสินค้า SKU-8829 ลำโพงบลูทูธรับประกัน 2 ปีเต็ม"),
    ("doc_refund", "นโยบายการขอคืนเงินภายใน 7 วัน สำหรับสินค้าที่ยังไม่แกะซีล"),
    ("doc_tax", "ขั้นตอนการออกใบกำกับภาษีเต็มรูปแบบสำหรับลูกค้าองค์กร"),
]

# Deterministic semantic mock embedder: เก่งเรื่องความหมาย/คำพ้อง แต่แยกเลขรหัสคล้ายกันไม่คม
def mock_semantic_embed(text: str) -> np.ndarray:
    t = text.lower()
    if "พร้อมเพย์" in t:
        return np.array([0.95, 0.20, 0.20, 0.00], dtype=np.float32)
    if "บัตรเครดิต" in t:
        return np.array([0.99, 0.05, 0.05, 0.00], dtype=np.float32)
    if "inv-2026" in t or "ใบแจ้งหนี้" in t or "ค้างชำระ" in t:
        return np.array([0.995, 0.04, 0.04, 0.00], dtype=np.float32)
    if "หูฟัง" in t:
        return np.array([0.20, 0.95, 0.20, 0.00], dtype=np.float32)
    if "ลำโพง" in t:
        return np.array([0.05, 0.99, 0.05, 0.00], dtype=np.float32)
    if "sku-882" in t or "ประกัน" in t:
        return np.array([0.04, 0.995, 0.04, 0.00], dtype=np.float32)
    if "คืนเงิน" in t or "ตังค์กลับ" in t or "ซื้อผิด" in t:
        return np.array([0.00, 0.05, 0.99, 0.05], dtype=np.float32)
    if "ใบกำกับภาษี" in t or "บิลแวต" in t or "ลดหย่อน" in t:
        return np.array([0.00, 0.00, 0.05, 0.99], dtype=np.float32)
    return np.array([0.25, 0.25, 0.25, 0.25], dtype=np.float32)


QUERIES = [
    EvalQuery("q1", "เช็กสถานะใบแจ้งหนี้ #INV-2026-009", "doc_inv_009", "exact_id"),
    EvalQuery("q2", "ประกันสินค้า SKU-8821 กี่ปี", "doc_sku_8821", "exact_id"),
    EvalQuery("q3", "ซื้อผิดรุ่นอยากได้ตังค์กลับต้องทำยังไง", "doc_refund", "semantic_paraphrase"),
    EvalQuery("q4", "ต้องการบิลแวตเพื่อนำไปยื่นหักลดหย่อนนิติบุคคล", "doc_tax", "semantic_paraphrase"),
]


def test_bm25_wins_exact_id_and_dense_wins_paraphrase():
    bm25 = ThaiBM25Retriever(DOCS, custom_words={"พร้อมเพย์", "ใบกำกับภาษี", "ค้างชำระ"})
    dense = DenseCosineRetriever(DOCS, embed_fn=mock_semantic_embed)

    report = compare_retrievers(bm25, dense, QUERIES, k=1)

    # ในโหมด strict top-1: BM25 ชนะขาด exact_id แต่พลาด paraphrase ทั้งหมด
    assert report["bm25"]["exact_id"].recall_at_k == pytest.approx(1.0)
    assert report["bm25"]["exact_id"].mrr_at_k == pytest.approx(1.0)
    assert report["bm25"]["semantic_paraphrase"].recall_at_k == pytest.approx(0.0)
    assert set(report["bm25"]["semantic_paraphrase"].misses) == {"q3", "q4"}

    # Dense ชนะขาด semantic_paraphrase แต่พลาด exact_id ใน top-1 (ชนกับ 019 / 8829)
    assert report["dense"]["semantic_paraphrase"].recall_at_k == pytest.approx(1.0)
    assert report["dense"]["semantic_paraphrase"].mrr_at_k == pytest.approx(1.0)
    assert report["dense"]["exact_id"].recall_at_k < 1.0


def test_top3_mrr_captures_rank_drop_even_when_recall_is_one():
    bm25 = ThaiBM25Retriever(DOCS, custom_words={"พร้อมเพย์", "ใบกำกับภาษี", "ค้างชำระ"})
    dense = DenseCosineRetriever(DOCS, embed_fn=mock_semantic_embed)

    report = compare_retrievers(bm25, dense, QUERIES, k=3)
    # สำหรับ exact_id: BM25 ได้ MRR@3 สูงกว่า Dense อย่างชัดเจน
    assert report["bm25"]["exact_id"].mrr_at_k == pytest.approx(1.0)
    assert report["dense"]["exact_id"].mrr_at_k < report["bm25"]["exact_id"].mrr_at_k
    # สำหรับ overall: ทั้งสองตัวยังไม่สมบูรณ์แบบ (รอ Hybrid RRF ใน Day 101!)
    assert report["bm25"]["overall"].recall_at_k == pytest.approx(0.5)
    assert report["dense"]["overall"].mrr_at_k < 1.0


def test_evaluate_retriever_validation():
    with pytest.raises(ValueError):
        evaluate_retriever(lambda q, k: [], [], k=3)
    with pytest.raises(ValueError):
        evaluate_retriever(lambda q, k: [], QUERIES, k=0)
`,
    },
    selfCheck: [
      "`ThaiBM25Retriever` ทำ `exact_id` ได้ `Recall@1 = 1.0` และ `MRR@1 = 1.0` แต่ได้ `0.0` ใน `semantic_paraphrase`",
      "`DenseCosineRetriever` ทำ `semantic_paraphrase` ได้ `Recall@1 = 1.0` และ `MRR@1 = 1.0` แต่ `MRR@3` ตกในหมวด `exact_id`",
      "`evaluate_retriever` คืนทั้ง `\"overall\"` และหมวดย่อยครบทุก `category` พร้อมรายชื่อ `misses` ที่ถูกต้อง",
      "โยน `ValueError` ทันทีเมื่อ `queries` ว่างหรือ `k <= 0`",
      "รัน `uv run pytest -q` ผ่านครบ 3 เทสต์ และ `uv run ruff check .` สะอาด",
    ],
    acceptance: "ผ่านทั้ง 3 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `DenseCosineRetriever.__init__` ให้เก็บ `self._doc_ids` และ `self._doc_vecs` ที่ L2-normalize แล้ว (ถ้า `norm == 0` ให้เก็บเวกเตอร์ศูนย์เดิมไว้กันหารศูนย์) ตอน `search` แค่ normalize `query_vec` แล้วคำนวณ `float(np.dot(q_unit, d_unit))`",
      },
      {
        body: "ใน `evaluate_retriever` ให้เขียน helper `_summarize(rows)` ที่รับลิสต์ `(query_id, recall, rr)` แล้วคำนวณค่าเฉลี่ย `recall`, ค่าเฉลี่ย `rr` และลิสต์ `misses = [qid for qid, rec, _ in rows if rec == 0.0]` จากนั้นเรียกใช้กับทั้งชุดรวม (`\"overall\"`) และกลุ่มที่จัดตาม `q.category`",
      },
      {
        body: "ตัวอย่างโครงของ `evaluate_retriever` — นำไปประกอบกับ `ThaiBM25Retriever` และ `DenseCosineRetriever`",
        code: {
          language: "python",
          filename: "hint_day100.py",
          code: `def _summarize(records: list[tuple[str, float, float]]) -> RetrieverSummary:
    n = len(records)
    recall = sum(r for _, r, _ in records) / n
    mrr = sum(rr for _, _, rr in records) / n
    misses = [qid for qid, r, _ in records if r == 0.0]
    return RetrieverSummary(recall_at_k=recall, mrr_at_k=mrr, misses=misses)


def evaluate_retriever(
    search_fn: Callable[[str, int], list[str]],
    queries: list[EvalQuery],
    k: int = 3,
) -> dict[str, RetrieverSummary]:
    if k <= 0 or not queries:
        raise ValueError("k must be > 0 and queries must not be empty")
    all_rows: list[tuple[str, float, float]] = []
    by_cat: dict[str, list[tuple[str, float, float]]] = {}
    for q in queries:
        ranked = search_fn(q.text, k)[:k]
        rec = 1.0 if q.expected_doc_id in ranked else 0.0
        rr = 0.0
        for rank, doc_id in enumerate(ranked, start=1):
            if doc_id == q.expected_doc_id:
                rr = 1.0 / rank
                break
        row = (q.query_id, rec, rr)
        all_rows.append(row)
        by_cat.setdefault(q.category, []).append(row)

    out = {"overall": _summarize(all_rows)}
    for cat, rows in by_cat.items():
        out[cat] = _summarize(rows)
    return out`,
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
      title: "ดูแค่ Overall Recall@3 แล้วไม่แยกดูตามประเภทคำถาม (Slice)",
      symptom: "เห็น BM25 กับ Dense ได้คะแนนรวมใกล้เคียงกัน เลยเลือกแค่ตัวเดียวขึ้น Production แล้วโดนผู้ใช้ร้องเรียนในเคสที่ตัวนั้นอ่อน",
      fix: "แยกวัด `exact_id` กับ `semantic_paraphrase` เสมอเพื่อให้เห็นจุดบอดที่ซ่อนอยู่และวางแผน Hybrid Search ได้ตรงจุด",
    },
    {
      title: "วัดแค่ Recall@5 โดยไม่ดู MRR",
      symptom: "เอกสารที่ถูกต้องตกไปอยู่อันดับ 4–5 (โดนเอกสารใกล้เคียงอย่าง `INV-2026-019` แซงหน้า) ซึ่งทำให้ LLM สับสนได้ง่ายขึ้นมากแม้ Recall@5 จะดูเป็น 1.0",
      fix: "รายงาน **`Recall@k`** คู่กับ **`MRR@k`** เสมอ เพราะ MRR สะท้อนคุณภาพของการจัดอันดับบนสุดได้คมกว่า",
    },
    {
      title: "ลืม L2-normalize เวกเตอร์ใน DenseCosineRetriever แล้วคูณ dot ตรง ๆ",
      symptom: "เอกสารที่เวกเตอร์มี norm ยาวกว่าชนะอย่างไม่ยุติธรรม แม้ทิศทางความหมายจะตรงน้อยกว่าก็ตาม (ทบทวน D38/D70)",
      fix: "หารเวกเตอร์ทั้งฝั่งเอกสารและฝั่งคำถามด้วย `np.linalg.norm(v)` ก่อนทำ dot product เสมอ",
    },
    {
      title: "ไม่เก็บรายชื่อ misses ไว้ทำ Error Analysis",
      symptom: "เห็นแค่ตัวเลขว่าได้ `0.75` แต่ไม่รู้ว่าคำถามข้อไหนพลาดและพลาดเพราะตัดคำผิด, chunk ขาด หรือ embedding ไม่เข้าใจ",
      fix: "เก็บ `misses: list[str]` ทุกครั้งที่รัน evaluation และเปิดอ่านคำถามที่พลาดจริงเพื่อป้อนกลับเข้า Error Log",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d100-q1",
        "(ทบทวน D97 — pgvector) คิวรี `SELECT chunk_id FROM chunks WHERE tenant_id = $2 ORDER BY embedding <=> $1 LIMIT 5;` คืนผลมาแค่ 1 แถวทั้งที่ `tenant_id` นี้มี 500 แถวในตาราง สาเหตุและวิธีแก้ที่ตรงจุดที่สุดคือข้อใด?",
        [
          ["เพราะ `<=>` เรียงผิดด้าน ต้องเปลี่ยนเป็น `DESC`", "`<=>` คือ Cosine Distance ยิ่งน้อยยิ่งเหมือน การเรียง `ASC` ถูกต้องอยู่แล้ว"],
          [
            "เกิด Post-Filtering Starvation จาก HNSW — แก้ด้วย `SET LOCAL hnsw.iterative_scan = strict_order;` (pgvector 0.8+) ร่วมกับดัชนีบน `tenant_id`",
            "ถูก — `iterative_scan` สั่งให้ HNSW เดินสแกนกราฟต่อเนื่องจนกว่าจะได้แถวที่ผ่าน `WHERE` ครบตาม `LIMIT`",
          ],
          ["ต้องลบคอลัมน์ `tenant_id` ออกจากเงื่อนไข `WHERE`", "ห้ามลบ `tenant_id` เด็ดขาด เพราะจะทำให้ข้อมูลรั่วข้ามลูกค้า"],
          ["ต้องเปลี่ยนจาก `halfvec` กลับเป็น `TEXT`", "การเก็บเวกเตอร์เป็น `TEXT` ไม่สามารถใช้ดัชนี HNSW ได้"],
        ],
        "B",
        "ทบทวน D97: Post-Filtering Starvation เป็นกับดักคลาสสิกของ Multi-Tenant `pgvector` ที่แก้ได้สะอาดด้วย `hnsw.iterative_scan` และดัชนีเสริม",
        "เมื่อคิวรี pgvector HNSW ที่มี `WHERE tenant_id = ... LIMIT 5` คืนผลไม่ครบทั้งที่มีข้อมูลอยู่จริง เกิดจากอะไรและแก้อย่างไร?",
        "เกิดจาก Post-Filtering Starvation (ดัชนีหยิบแค่ `ef_search` แถวจากทุก tenant แล้วค่อยกรอง) แก้ด้วย `SET LOCAL hnsw.iterative_scan = strict_order;` ใน pgvector 0.8+",
      ),
      mc(
        "d100-q2",
        "(ทบทวน D98 — Qdrant) ในระบบ Multi-Tenant บน Qdrant ข้อใดเป็นแนวทางที่ปลอดภัยและได้ประสิทธิภาพดีที่สุด?",
        [
          ["ใส่เงื่อนไข `tenant_id` ใน `Filter(should=[...])` โดยไม่ต้องสร้าง Payload Index", "ใส่ใน `should` (OR) เสี่ยงข้อมูลรั่วข้าม tenant และไม่มี Payload Index จะกรองช้ามากตอนข้อมูลใหญ่"],
          ["สร้างคอลเลกชันแยกใหม่ 1 คอลเลกชันต่อลูกค้า 1 รายแม้จะมีลูกค้า 5,000 ราย", "จำนวนคอลเลกชันมากเกินไปกิน RAM และ overhead สูงโดยไม่จำเป็น"],
          [
            "เก็บใน Hybrid Collection เดียว ประกาศ Payload Index บน `tenant_id` ด้วย `is_tenant=True` และใส่ `tenant_id` ใน `Filter(must=[...])` ทุกคิวรี",
            "ถูก — รวมข้อดีทั้งความเร็วของ tenant-aware storage layout และความปลอดภัยแบบบังคับ AND ทุกคำขอ",
          ],
          ["ดึงผล 100 แถวจากทุก tenant มากรองใน Python ฝั่งแอปแทนการใช้ `query_filter`", "เสี่ยงข้อมูลรั่วและอาจเกิดอาการได้ผลไม่ครบเหมือน post-filtering"],
        ],
        "C",
        "ทบทวน D98: การใช้ `is_tenant=True` คู่กับ `Filter(must=[...])` คือ pattern มาตรฐานของ Multi-Tenant RAG บน Qdrant",
        "แนวทางมาตรฐานสำหรับ Multi-Tenant RAG บน Qdrant คืออะไร?",
        "เก็บใน Collection เดียว + ประกาศ Payload Index `is_tenant=True` บน `tenant_id` + บังคับใส่ `tenant_id` ใน `Filter(must=[...])` ทุกคำขอ",
      ),
      mc(
        "d100-q3",
        "(ทบทวน D99 + D49 — Thai BM25) ทำไมผลเทียบระหว่าง Thai BM25 กับ Dense Vector บนชุดคำถามไทยจึงมักแสดงว่า BM25 ชนะในหมวด `exact_id` แต่แพ้ในหมวด `semantic_paraphrase`?",
        [
          ["เพราะ BM25 ใช้ GPU ส่วน Dense Vector ใช้ CPU", "กลับกัน — BM25 รันบน CPU ได้เบาและเร็วมาก ส่วน Dense Embedding มักใช้โมเดลประสาทเทียม"],
          [
            "เพราะ BM25 จับคู่โทเค็นตรงตัว (หลังตัดคำด้วย PyThaiNLP + รักษารหัส) จึงแม่นรหัสเฉพาะ 100% แต่คืน 0 เมื่อเจอคำพ้องความหมาย ส่วน Dense Vector เข้าใจความหมายแต่แยกเลขรหัสที่คล้ายกันไม่คม",
            "ถูก — จุดแข็งและจุดอ่อนของทั้งสองระบบเป็นภาพสะท้อนซึ่งกันและกัน จึงต้องผสานด้วย Hybrid RRF ใน Day 101",
          ],
          ["เพราะ `PyThaiNLP` ลบคำพ้องความหมายออกจากเอกสารทั้งหมด", "`PyThaiNLP` แค่ตัดคำ ไม่ได้ลบคำพ้องความหมาย แต่ BM25 ให้คะแนนเฉพาะคำที่ตรงรูปกัน"],
          ["เพราะ Dense Vector ไม่สามารถคำนวณ Cosine Similarity กับภาษาไทยได้", "Multilingual embeddings คำนวณ Cosine Similarity บนภาษาไทยได้ดีมากในด้านความหมาย"],
        ],
        "B",
        "นี่คือข้อสรุปสำคัญที่สุดของ Block B25: Lexical (Thai BM25) และ Semantic (Dense Vector) เก่งคนละสนาม และเติมเต็มกันได้สมบูรณ์แบบ",
        "สรุปจุดแข็ง-จุดอ่อนของ Thai BM25 เทียบกับ Dense Vector ในหนึ่งประโยค",
        "Thai BM25 แม่นรหัสเอกสาร/ศัพท์ตรงตัวแต่แพ้คำพ้องความหมาย ส่วน Dense Vector เก่งคำพ้อง/ภาษาพูดแต่แยกรหัสเฉพาะที่คล้ายกันไม่คม",
      ),
      mc(
        "d100-q4",
        "(ทบทวน D70 + การวัดผล) บนชุดคำถาม `exact_id` 2 ข้อ: BM25 ดึงเอกสารเฉลยขึ้นมาอยู่อันดับ 1 ทั้งสองข้อ ส่วน Dense Vector ดึงเอกสารเฉลยมาอยู่อันดับ 2 ทั้งสองข้อ ค่า `Recall@3` และ `MRR@3` ของทั้งสองตัวเป็นเท่าไร?",
        [
          ["BM25: Recall@3 = 1.0, MRR@3 = 1.0 | Dense: Recall@3 = 0.5, MRR@3 = 0.5", "อันดับ 2 ยังอยู่ใน Top-3 ดังนั้น `Recall@3` ของ Dense ยังเท่ากับ `1.0`"],
          [
            "BM25: Recall@3 = 1.0, MRR@3 = 1.0 | Dense: Recall@3 = 1.0, MRR@3 = 0.5",
            "ถูก — ทั้งคู่ติด Top-3 ครบ (Recall@3 = 1.0) แต่ Dense ได้ `1/2 = 0.5` ในแต่ละข้อ ทำให้ MRR@3 เหลือ 0.5",
          ],
          ["ทั้งคู่ได้ Recall@3 = 1.0 และ MRR@3 = 1.0 เท่ากัน", "MRR หารด้วยอันดับ (`1/rank`) ดังนั้นอันดับ 2 ได้ 0.5 ไม่ใช่ 1.0"],
          ["BM25: Recall@3 = 0.5, MRR@3 = 1.0 | Dense: Recall@3 = 1.0, MRR@3 = 0.5", "ถ้าอันดับ 1 ถูกต้องทั้ง 2 ข้อ `Recall@3` ย่อมเท่ากับ `1.0`"],
        ],
        "B",
        "`Recall@3` บอกแค่ว่าคำตอบติด Top-3 หรือไม่ ส่วน `MRR@3` แยกความคมของการจัดอันดับ 1 ออกจากอันดับ 2–3 ได้อย่างชัดเจน",
        "ถ้าคำตอบจริงอยู่อันดับ 2 ทุกข้อในชุดทดสอบ ค่า Recall@3 และ MRR@3 จะเป็นเท่าไร?",
        "Recall@3 = 1.0 (ติด Top-3 ทุกข้อ) และ MRR@3 = 0.5 (เฉลี่ย 1/2 ทุกข้อ)",
      ),
    ],
  },

  takeaways: [
    "ครบ **100 วัน** และจบ **Block B25** แล้ว: คุณเชี่ยวชาญครบทั้ง **`pgvector` HNSW**, **`Qdrant` Hybrid/Payload Filter** และ **Thai `PyThaiNLP` + `BM25`**",
    "การวัดผลแบบ **Sliced Evaluation** (`exact_id` vs `semantic_paraphrase`) ด้วย **`Recall@k` + `MRR@k`** เปิดเผยจุดบอดที่ค่าเฉลี่ยรวมซ่อนไว้",
    "ผลการทดลองพิสูจน์ชัดเจนว่า **Thai BM25 ชนะรหัสเฉพาะ** ส่วน **Dense Vector ชนะคำพ้องความหมาย** — ไม่มีตัวค้นหาเดี่ยวใดชนะทุกสนาม",
    "พรุ่งนี้ใน **Day 101** คุณจะนำผลอันดับจากทั้งสองเครื่องยนต์นี้มาผสานด้วย **Reciprocal Rank Fusion (RRF)** เพื่อเก็บชัยชนะทั้งสองสนามพร้อมกัน!",
  ],

  reviewCards: [
    rc(
      "d100-rc-1",
      "ทำไมการประเมินระบบค้นหาควรแยกวัดแบบ Sliced Evaluation (`exact_id` vs `semantic_paraphrase`) แทนดูแค่ Overall Recall?",
      "เพราะค่าเฉลี่ยรวมอาจซ่อนจุดบอดสุดโต่ง (เช่น BM25 ได้ 1.0 ในรหัสแต่ 0.0 ในคำพ้อง) การแยก slice ช่วยเห็นสาเหตุความพลาดและยืนยันความจำเป็นของ Hybrid Search",
    ),
    rc(
      "d100-rc-2",
      "เทียบ `Recall@3` กับ `MRR@3` ต่างกันอย่างไร และทำไมต้องใช้คู่กัน?",
      "`Recall@3` วัดว่าคำตอบติด Top-3 หรือไม่ (0 หรือ 1) ส่วน `MRR@3` วัดค่าเฉลี่ย `1/rank` (อันดับ 1 ได้ 1.0, อันดับ 2 ได้ 0.5) จึงจับอาการอันดับตกได้แม้ Recall@3 ยังเป็น 1.0",
    ),
    rc(
      "d100-rc-3",
      "เชื่อม B25 → B26: ทำไมเราต้องใช้ RRF (Day 101) ผสานผลจาก Thai BM25 (D99) และ Dense Vector (D97–D98)?",
      "เพราะ BM25 ชนะรหัสเอกสาร/SKU ส่วน Dense ชนะคำพ้องความหมาย และคะแนนดิบของทั้งคู่อยู่คนละสเกลกัน — RRF ผสานด้วยอันดับ (1/(k+rank)) เพื่อรวมจุดแข็งทั้งสองฝั่งอย่างเสถียร",
    ),
  ],

  sources: [
    { label: "pgvector Official Repository — Indexing & Iterative Scan", href: "https://github.com/pgvector/pgvector" },
    { label: "Qdrant Documentation — Hybrid Queries & Filtering", href: "https://qdrant.tech/documentation/concepts/hybrid-queries/" },
    { label: "PyThaiNLP Documentation — Tokenization", href: "https://pythainlp.github.io/docs/" },
    { label: "rank_bm25 Official Repository", href: "https://github.com/dorianbrown/rank_bm25" },
  ],

  glossary: ["bm25", "pythainlp", "hnsw", "embedding", "cosine-similarity", "mrr", "rrf", "golden-dataset"],
});
