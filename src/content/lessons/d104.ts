import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D104 — Phase 4 / Block B26 (Review Day)
 * Review: Quiz + Measure Recall@5 gain: Dense vs Hybrid vs +Rerank
 */
export const d104: Lesson = defineLesson({
  day: 104,
  titleTh: "ทบทวน B26: วัด Recall@5 และ MRR Gain — Dense vs Hybrid RRF vs +Rerank",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ทำ 3-Stage Ablation Benchmark วัด Recall@5, MRR และ Latency Overhead ด้วย pytest",
  icon: "bar-chart-3",
  visual: {
    id: "reranker-query-transform",
    title: "ทบทวน B26: วัด Recall@5 & MRR Gain — Dense → Hybrid RRF → +Rerank",
    caption: "เปรียบเทียบตัวเลขจริงทั้ง 3 ขั้นบนชุดคำถามไทยปนอังกฤษ พร้อมเช็ก Latency Overhead ที่ยอมรับได้",
    alt: "แผนภาพวัด Recall@5 gain ระหว่าง Dense, Hybrid และ Rerank",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — Deterministic 3-Stage Retrieval Benchmark ด้วย pytest",
  tools: ["Python 3.12", "PyThaiNLP", "Qdrant / pgvector", "Reranker", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รวมชิ้นส่วน B25–B26 เข้าในท่อ Retrieval เดียวกัน",
      body: "ตลอด 4 วันที่ผ่านมา (และ Day 99) คุณสร้างทีละชั้นตั้งแต่ {{bm25}} ตัดคำด้วย {{pythainlp}}, Dense {{embedding}}, ผสานด้วย {{rrf}}, คัดรอบสองด้วย {{reranker}} และแปลงคำถามอย่างมี Latency Guard",
      lessonNote: "วันทบทวนนี้เรานำ 3 ขั้นหลัก (`Dense` → `Hybrid RRF` → `Hybrid + Rerank`) มาเทียบกันบนชุดคำถามเดียวกัน",
    },
    {
      node: 3,
      heading: "พิสูจน์ผลด้วย Ablation Benchmark แทนการเดาด้วยความรู้สึก",
      body: "ทีม AI มักเปิดใช้ฟีเจอร์ซับซ้อนตามกระแสโดยไม่วัดผล แต่การทำ Ablation วัด Recall@5 และ {{mrr}} ทำให้เห็นชัดว่าแต่ละชั้นช่วยยกระดับคุณภาพขึ้นกี่เปอร์เซ็นต์",
      lessonNote: "เราจะเขียนชุดทดสอบ `pytest` ที่ตรวจสอบว่า Hybrid ชนะ Dense ด้าน Recall@5 และ Rerank ชนะ Hybrid ด้าน MRR@5",
    },
    {
      node: 5,
      heading: "ชั่งน้ำหนัก Quality Gain คู่กับ Latency Overhead",
      body: "ทุกชั้นที่เพิ่มเข้ามาในท่อ {{rag}} มีราคาเป็นมิลลิวินาที การรายงาน Quality Gain ควบคู่กับ Average/P95 Latency ทำให้ตัดสินใจเรื่อง Production SLA ได้อย่างมีเหตุผล",
      lessonNote: "ในแบบฝึกหัดวันนี้ คุณจะสร้างตารางรายงานที่แสดงทั้ง `recall_at_k`, `mrr_at_k` และ `avg_latency_ms` ของทั้ง 3 ขั้น",
    },
    {
      node: 6,
      heading: "เปลี่ยนคำถามที่พลาดให้เป็น Error Log เพื่อปรับปรุงรอบถัดไป",
      body: "เมื่อเห็นว่าคำถามไหนยังคงได้ Recall@5 = 0 แม้ผ่านทั้ง 3 ขั้น นั่นคือเบาะแสตรงจุดว่าปัญหาอยู่ที่ Chunking, การตัดคำไทย หรือยังขาดเอกสารในคลัง",
      lessonNote: "หลังจบควิซและ Benchmark ให้จดข้อผิดพลาดที่พบบ่อยลง Error Log ก่อนก้าวสู่ Block B27 (Grounded Citations & ACL)",
    },
  ],

  objectives: [
    "**ทบทวนแบบสลับหัวข้อ (Interleaved Recall)** เนื้อหา Day 99 และ Day 101–103: Thai {{bm25}}, {{rrf}}, Cross-Encoder {{reranker}} และ Query Transformation + Latency Guard",
    "**คำนวณและตีความ** ค่า **Recall@5** และ **{{mrr}}@5** เพื่อแยกให้ออกว่าแต่ละขั้นช่วย *หาเจอมากขึ้น* หรือ *ดันขึ้นอันดับ 1 ดีขึ้น*",
    "**สร้าง 3-Stage Ablation Benchmark** แบบ deterministic ใน `pytest` เพื่อเทียบ `Dense Only` vs `Hybrid RRF` vs `Hybrid + Rerank` ควบคู่กับ Latency Overhead",
  ],

  prerequisites: [
    "ทบทวน Day 99 (Thai {{bm25}} + {{pythainlp}}), Day 101 ({{rrf}}), Day 102 ({{reranker}}) และ Day 103 (Query Transformation)",
    "เขียนฟังก์ชัน Python พื้นฐาน (`set`, `dict`, `sorted`) และรัน `pytest` ได้",
    "ไม่ต้องใช้ API key — ชุดทดสอบ Benchmark รันแบบ deterministic บนเครื่อง 100%",
  ],

  setup: {
    intro:
      "วันทบทวนนี้ใช้ Pure Python + `pytest` เพื่อสร้างและรัน 3-Stage Retrieval Ablation Benchmark ให้เสร็จและตรวจผลได้ทันทีใน 30 นาที",
    commands: `uv init ai-day104 && cd ai-day104
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day104` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pytest` และ `ruff` สำเร็จ"],
      ["ready", "เตรียมทำควิซทบทวน 4 ข้อและเขียน Ablation Benchmark ด้วย `pytest`"],
    ],
    note: "แนะนำให้ลองทำควิซก่อนดูเฉลย (Retrieval Practice) แล้วค่อยลงมือเขียนโค้ด Benchmark เพื่อตอกย้ำความเข้าใจจาก Day 101–103",
  },

  concepts: [
    {
      id: "ablation-study-retrieval",
      title: "1 · Retrieval Ablation Study: เปลี่ยนทีละชั้นบนชุดคำถามเดิม",
      paragraphs: [
        "คำว่า **Ablation Study** ในงานวิศวกรรม AI หมายถึงการวัดผลระบบโดยค่อย ๆ เพิ่ม (หรือถอด) องค์ประกอบทีละหนึ่งชิ้นบน **ชุดคำถามทดสอบชุดเดียวกัน** เพื่อให้รู้แน่ชัดว่าแต่ละชิ้นสร้างคุณค่าจริงแค่ไหน",
        "สำหรับ Block B26 เราตั้งค่าทดลอง 3 ขั้นชัดเจน: **(1) Dense Only** ใช้เป็น baseline ที่พึ่งความหมายจากเวกเตอร์อย่างเดียว, **(2) Hybrid RRF** ผสาน Dense เข้ากับ {{bm25}} (ที่ตัดคำด้วย {{pythainlp}}) ด้วยสูตร `k = 60` เพื่อเก็บเคสรหัสเอกสารและศัพท์เฉพาะ และ **(3) Hybrid + Rerank** นำ Top-20 จาก Hybrid RRF มาจัดอันดับใหม่ด้วย Cross-Encoder {{reranker}} ก่อนตัดเหลือ Top-5",
        "หากทำถูกต้อง บนชุดคำถามไทยปนอังกฤษที่มีทั้งรหัสเอกสารและเงื่อนไขซับซ้อน คุณมักจะเห็นแพตเทิร์นชัดเจน: **Hybrid RRF ดัน Recall@5 พุ่งขึ้น** (เจอเอกสารที่ Dense พลาด) และ **Reranker ดัน MRR@5 พุ่งขึ้นอีกขั้น** (เลื่อนคำตอบที่ใช่จากอันดับ 3–5 ขึ้นมาอันดับ 1)",
      ],
      analogy:
        "เหมือนการจูนรถแข่งในสนามเดิม: ลองวิ่งเดิม ๆ จับเวลาก่อน (Dense), เปลี่ยนยางแล้วจับเวลาอีกรอบ (Hybrid RRF), แล้วค่อยปรับแอโรไดนามิกจับเวลารอบสาม (+Rerank) จะได้รู้ชัดว่าแต่ละชิ้นทำให้เร็วขึ้นกี่วินาที",
      bullets: [
        "**ควบคุมตัวแปร**: ใช้คลังเอกสาร ชุดคำถาม และ Ground-Truth `relevant_ids` ชุดเดียวกันทั้ง 3 ขั้น",
        "**ห้ามดูแค่คำถามสวยหรู**: ชุดทดสอบควรผสมทั้งรหัสเฉพาะ (`#INV-...`), คำพ้องความหมายไทย-อังกฤษ และคำถามมีเงื่อนไขปฏิเสธ (`หลัง 7 วัน`)",
        "**Deterministic Eval**: ชั้น Retrieval วัดผลได้ฟรี เร็ว และทำซ้ำได้ 100% เหมาะนำไปผูกเป็น CI gate ใน `pytest`",
      ],
      whyTitle: "Why this matters — พิสูจน์ความคุ้มค่าด้วยตัวเลขก่อนเพิ่มความซับซ้อนในระบบจริง",
      whyParagraphs: [
        "ในทีมวิศวกรรมจริง ทุกชิ้นส่วนที่คุณเพิ่มเข้าท่อ {{rag}} (เช่น BM25 index หรือ Rerank service) แปลว่าภาระดูแลรักษาและ latency ที่เพิ่มขึ้น",
        "ตาราง Ablation คือหลักฐานเชิงประจักษ์ที่ช่วยตอบผู้จัดการหรือทีมได้ว่า *\"การเพิ่ม Reranker เพิ่มเวลาอีก 55 ms แต่ดัน MRR@5 จาก 0.58 เป็น 0.92 ซึ่งคุ้มค่ามาก\"*",
      ],
    },
    {
      id: "recall-and-mrr-metrics",
      title: "2 · อ่านค่า Recall@5 และ MRR@5 ให้ขาด: 'หาเจอไหม' vs 'อยู่อันดับบนไหม'",
      paragraphs: [
        "ในแง่ {{precision-recall}} ของงานค้นคืนเอกสาร สองตัวชี้วัดที่วิศวกร AI ใช้คู่กันเสมอคือ **Recall@k** และ **{{mrr}} (Mean Reciprocal Rank)** เพราะตอบคำถามคนละมิติกัน",
        "**Recall@5** คำนวณจาก `จำนวนเอกสารที่เกี่ยวข้องซึ่งติดใน Top-5 / จำนวนเอกสารที่เกี่ยวข้องทั้งหมด` (ค่า `0.0–1.0`) มันบอกว่า *เอกสารคำตอบหลุดจากหน้าต่าง Top-5 ที่จะส่งให้ LLM หรือไม่* แต่ไม่ได้สนใจว่าคำตอบนั้นอยู่อันดับ 1 หรืออันดับ 5",
        "**MRR@5** คำนวณจากค่าเฉลี่ยของ `1 / rank` ของเอกสารที่เกี่ยวข้อง **ชิ้นแรก** ที่พบใน Top-5 (ถ้าไม่พบเลยได้ `0.0`) เช่น เจออันดับ 1 ได้ `1.0`, เจออันดับ 2 ได้ `0.5`, เจออันดับ 5 ได้ `0.2` ค่า MRR จึงสะท้อนพลังของ {{reranker}} ได้แม่นยำมาก เพราะแม้ Recall@5 จะเท่าเดิม แต่การเลื่อนคำตอบจากอันดับ 4 ขึ้นอันดับ 1 ทำให้ MRR กระโดดจาก `0.25` เป็น `1.00`",
      ],
      analogy:
        "Recall@5 เหมือนถามว่า *\"กุญแจบ้านอยู่ในกระเป๋า 5 ใบที่หยิบติดตัวมาด้วยไหม\"* ส่วน MRR@5 เหมือนถามว่า *\"เปิดดูกี่ใบถึงจะเจอกุญแจทันที — ใบแรกเลย (1.0) หรือต้องคุ้ยถึงใบที่ห้า (0.2)\"*",
      code: {
        language: "python",
        filename: "retrieval_metrics.py",
        code: `def recall_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    if not relevant:
        return 0.0
    top_k = set(retrieved[:k])
    return len(top_k & relevant) / len(relevant)


def reciprocal_rank_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    for rank, doc_id in enumerate(retrieved[:k], start=1):
        if doc_id in relevant:
            return 1.0 / rank
    return 0.0


# ตัวอย่าง: คำตอบอยู่ที่อันดับ 4 (Hybrid) vs ขยับขึ้นมาอันดับ 1 (+Rerank)
rel = {"doc_after_7d"}
hybrid_top5 = ["doc_within_7d", "doc_shipping", "doc_faq", "doc_after_7d", "doc_warranty"]
rerank_top5 = ["doc_after_7d", "doc_within_7d", "doc_faq", "doc_warranty", "doc_shipping"]

print("Hybrid  Recall@5:", recall_at_k(hybrid_top5, rel), "RR@5:", reciprocal_rank_at_k(hybrid_top5, rel))
print("+Rerank Recall@5:", recall_at_k(rerank_top5, rel), "RR@5:", reciprocal_rank_at_k(rerank_top5, rel))`,
        caption: "ดูความต่างชัดเจน: Recall@5 เท่ากันที่ 1.0 ทั้งคู่ แต่ Reciprocal Rank กระโดดจาก 0.25 เป็น 1.00 เมื่อ Reranker ดันคำตอบขึ้นอันดับ 1",
      },
      whyTitle: "Why this matters — ใช้ตัวชี้วัดเดียวอาจมองไม่เห็นประโยชน์ของ Reranker",
      whyParagraphs: [
        "ถ้าคุณดูแค่ Recall@5 อย่างเดียว อาจเข้าใจผิดว่า Reranker ไม่ได้ช่วยอะไรเมื่อเอกสารคำตอบติดอยู่ที่อันดับ 4 หรือ 5 อยู่แล้ว",
        "แต่ในโลก LLM จริง เอกสารที่อยู่อันดับ 1–2 มีโอกาสถูกโมเดลอ้างอิงถูกต้องสูงกว่าเอกสารที่ถูกดันไปท้าย prompt อย่างมาก การวัด **Recall@5 คู่กับ MRR@5** จึงให้ภาพที่ครบถ้วนที่สุด",
      ],
    },
    {
      id: "b26-synthesis-and-latency-tradeoff",
      title: "3 · สรุปแผนที่ Block B26 (D99–D103) และการตัดสินใจเรื่อง Latency Budget",
      paragraphs: [
        "เมื่อรวมความรู้ตั้งแต่ Day 99 ถึง Day 103 เราจะได้แผนที่ท่อ Retrieval ภาษาไทยระดับ Production ที่เชื่อมกันทุกข้อต่ออย่างลงตัว: เริ่มจาก **Bypass / Query Transformation (D103)** เพื่อแก้คำถามต่อเนื่องหรือขยายคำค้นเมื่อจำเป็น → ค้นคู่ขนานด้วย **Thai BM25 + PyThaiNLP (D99)** กับ **Dense Vector (D97–D98)** → ผสานด้วย **RRF `k = 60` (D101)** ให้ได้ Top-20 → คัดละเอียดด้วย **Cross-Encoder Reranker (D102)** เหลือ Top-5 พร้อม timeout fallback",
        "ด้านต้นทุนเวลาโดยประมาณในระบบจริง: `Dense Only` อยู่ที่ ~25 ms, `Hybrid RRF` (BM25 + Dense รันขนาน) เพิ่มขึ้นเล็กน้อยเป็น ~35 ms และ `+Rerank (Top-20)` เพิ่มอีกราว ~55–90 ms รวมเป็น ~90–125 ms ซึ่งยังอยู่ในงบ retrieval ต่ำกว่า `200 ms` อย่างสบาย",
        "แต่หากพบว่าขั้นตอนใดเพิ่มเวลาเกินงบโดยไม่ได้ยกระดับ Recall@5 หรือ MRR@5 บนชุดทดสอบของโดเมนคุณ (เช่น เปิด HyDE กับคำถามที่มีแต่รหัสสินค้า) ให้ปิดหรือจำกัดด้วย Bypass Gate ทันทีตามหลัก Data-Driven Engineering",
      ],
      analogy:
        "เหมือนการเช็กบิลคุ้มค่าในร้านอาหาร: การเพิ่มซุปและสลัดอีกนิดหน่อยช่วยยกระดับมื้ออาหารได้ชัดในงบที่รับได้ แต่จานเสริมที่ทั้งแพงและรอนานโดยลูกค้าไม่ได้ชอบมากขึ้นควรตัดออกจากเซตมาตรฐาน",
      bullets: [
        "**Dense พลาดรหัสเฉพาะ** → แก้ด้วย **Thai BM25 (PyThaiNLP) + Hybrid RRF** (D99, D101)",
        "**Hybrid เจอคำตอบแต่อยู่อันดับ 3–5** → แก้ด้วย **Cross-Encoder Reranker Top-20 → Top-5** (D102)",
        "**คำถามต่อเนื่องมี 'มัน' / ภาษาพูดต่างจากเอกสาร** → แก้ด้วย **Query Rewrite / Multi-Query + Latency Guard** (D103)",
        "**ยืนยันทุกการเปลี่ยนแปลง** → รัน **3-Stage Ablation Benchmark** ใน `pytest` ก่อน merge โค้ด (D104)",
      ],
      whyTitle: "Why this matters — เตรียมพร้อมสู่ Block B27 และ Milestone 2 ใน Capstone",
      whyParagraphs: [
        "ใน Phase 6 Capstone (Milestone 2: Day 164) คุณจะต้องผ่านเกณฑ์ `Recall@5 >= 0.85` บนคลังเอกสารไทยปนอังกฤษ — โค้ด Ablation Benchmark ที่เขียนวันนี้คือต้นแบบโดยตรงของตัววัดผลใน Capstone",
        "และในพรุ่งนี้ (Day 105) เมื่อชั้น Retrieval ส่ง Top-5 ที่คมที่สุดมาให้แล้ว เราจะเดินหน้าสู่ชั้น Generation เพื่อบังคับ Grounded Answer และ Inline Citations",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Ablation Benchmark เทียบกับ Performance & A/B Regression Test",
      body: [
        "ในงานเว็บ คุณเขียน regression test และ Lighthouse/load benchmark เพื่อพิสูจน์ว่าโค้ดใหม่ดีขึ้นจริงโดยไม่ทำ latency พัง — Retrieval Ablation ในงาน AI ทำหน้าที่เดียวกันทุกประการ:",
      ],
      table: [
        ["Dense Only (Baseline)", "ระบบเวอร์ชันเดิมก่อนปรับปรุง"],
        ["Hybrid RRF vs +Rerank", "เปรียบเทียบทีละฟีเจอร์ (feature flag ablation)"],
        ["Recall@5 & MRR@5", "Accuracy / relevance assertion ใน test suite"],
        ["avg_latency_ms <= budget", "Performance budget assertion ใน CI pipeline"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีคำนวณค่าเฉลี่ย (Macro Average) ข้ามชุดคำถามทดสอบ",
      body: [
        "เมื่อเรามีชุดคำถามทดสอบ `N` ข้อ (เช่น 4 ข้อ หรือ 40 ข้อใน Capstone) เราคำนวณ `recall_at_k` และ `reciprocal_rank_at_k` ของแต่ละคำถามก่อน แล้วนำมาหาค่าเฉลี่ยเลขคณิต `sum(values) / len(cases)` — นี่คือเหตุผลที่ตัว **M** ใน **MRR** ย่อมาจาก **Mean** (ค่าเฉลี่ยของ Reciprocal Rank ทุกคำถาม)",
        "ข้อควรระวังเล็ก ๆ คือถ้า `cases` ว่าง (`len == 0`) อย่าหารด้วยศูนย์ ให้ตรวจสอบแล้วโยน `ValueError` ทันทีตามหลัก fail-fast",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีชุดคำถามทดสอบ 4 ข้อที่เป็นตัวแทนปัญหาจริงในไทย (`#INV-2026-009`, เงื่อนไข `หลัง 7 วัน`, `e-Tax invoice` และ `PDPA ลบข้อมูล`) ลองรัน 3-Stage Ablation เทียบ `Dense Only` → `Hybrid RRF` → `Hybrid + Rerank` แล้วอ่านตัวเลขจริงทีละขั้น",
    steps: [
      {
        title: "1 · เตรียมชุดคำถามทดสอบ 4 ข้อพร้อมผลจาก Dense, BM25 และ Cross-Encoder",
        explain:
          "แต่ละเคสมี `relevant` (คำตอบที่ถูกต้อง), ลำดับจาก `dense` (6 ชิ้น), ลำดับจาก `bm25` (ตัดคำไทยแล้ว) และคะแนนจาก Cross-Encoder `rerank`",
        code: {
          language: "python",
          filename: "worked_ablation.py",
          code: `CASES = [
    {
        "id": "q1_inv_code",
        "relevant": {"doc_inv_009"},
        "dense": ["doc_overdue", "doc_pay", "doc_tax", "doc_refund", "doc_faq", "doc_inv_009"],
        "bm25": ["doc_inv_009", "doc_inv_019", "doc_overdue", "doc_tax", "doc_pay", "doc_faq"],
        "rerank": {"doc_inv_009": 0.96, "doc_overdue": 0.72, "doc_inv_019": 0.25, "doc_tax": 0.15, "doc_pay": 0.18, "doc_refund": 0.10, "doc_faq": 0.08},
    },
    {
        "id": "q2_after_7d",
        "relevant": {"doc_after_7d"},
        "dense": ["doc_within_7d", "doc_shipping", "doc_faq", "doc_after_7d", "doc_warranty", "doc_vip"],
        "bm25": ["doc_within_7d", "doc_after_7d", "doc_faq", "doc_shipping", "doc_warranty", "doc_vip"],
        "rerank": {"doc_after_7d": 0.94, "doc_within_7d": 0.62, "doc_faq": 0.20, "doc_shipping": 0.05, "doc_warranty": 0.06, "doc_vip": 0.04},
    },
    {
        "id": "q3_etax",
        "relevant": {"doc_etax_guide"},
        "dense": ["doc_receipt", "doc_etax_guide", "doc_tax_law", "doc_pay", "doc_faq", "doc_shipping"],
        "bm25": ["doc_tax_law", "doc_receipt", "doc_etax_guide", "doc_faq", "doc_pay", "doc_shipping"],
        "rerank": {"doc_etax_guide": 0.91, "doc_receipt": 0.65, "doc_tax_law": 0.50, "doc_pay": 0.12, "doc_faq": 0.09, "doc_shipping": 0.03},
    },
    {
        "id": "q4_pdpa_delete",
        "relevant": {"doc_pdpa_erasure"},
        "dense": ["doc_privacy_gen", "doc_cookie", "doc_terms", "doc_faq", "doc_security", "doc_pdpa_erasure"],
        "bm25": ["doc_pdpa_erasure", "doc_privacy_gen", "doc_terms", "doc_cookie", "doc_security", "doc_faq"],
        "rerank": {"doc_pdpa_erasure": 0.93, "doc_privacy_gen": 0.58, "doc_terms": 0.22, "doc_cookie": 0.15, "doc_security": 0.12, "doc_faq": 0.07},
    },
]
print("Loaded evaluation cases:", len(CASES))`,
        },
        output: `Loaded evaluation cases: 4`,
      },
      {
        title: "2 · เขียนฟังก์ชันวัด Recall@5, MRR@5 และรันทั้ง 3 ขั้น",
        explain:
          "`Dense Only` ตัด Top-5 จาก `dense` ตรง ๆ; `Hybrid RRF` รวม `dense + bm25` ด้วย `k = 60`; และ `Hybrid + Rerank` นำผู้สมัครทั้งหมดจาก Hybrid มาจัดอันดับใหม่ด้วยคะแนน Cross-Encoder",
        code: {
          language: "python",
          filename: "worked_ablation.py",
          code: `def recall_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    return len(set(retrieved[:k]) & relevant) / len(relevant)


def rr_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    for rank, doc_id in enumerate(retrieved[:k], start=1):
        if doc_id in relevant:
            return 1.0 / rank
    return 0.0


def rrf_fuse(lists: list[list[str]], k: int = 60) -> list[str]:
    scores: dict[str, float] = {}
    for docs in lists:
        seen: set[str] = set()
        for rank, doc_id in enumerate(docs, start=1):
            if doc_id in seen:
                continue
            seen.add(doc_id)
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return [doc_id for doc_id, _ in sorted(scores.items(), key=lambda x: (-x[1], x[0]))]


stages = {"dense": [], "hybrid_rrf": [], "hybrid_rerank": []}
for c in CASES:
    rel = c["relevant"]
    dense_docs = c["dense"]
    hybrid_docs = rrf_fuse([c["dense"], c["bm25"]], k=60)
    rerank_docs = sorted(hybrid_docs[:20], key=lambda d: (-c["rerank"].get(d, -1e9), d))
    for name, docs in [("dense", dense_docs), ("hybrid_rrf", hybrid_docs), ("hybrid_rerank", rerank_docs)]:
        stages[name].append((recall_at_k(docs, rel, 5), rr_at_k(docs, rel, 5)))`,
        },
        output: `(คำนวณครบทั้ง 3 ขั้นบน 4 คำถาม)`,
      },
      {
        title: "3 · สรุปตารางเปรียบเทียบ Recall@5, MRR@5 และ Latency Overhead",
        explain:
          "สังเกตการก้าวกระโดดที่ชัดเจน: `Dense Only` พลาดเคสรหัสเอกสารและ PDPA จน Recall@5 เหลือ `0.50` พอเติม `Hybrid RRF` ค่า Recall@5 พุ่งเป็น `1.00` (แต่ MRR@5 ยังอยู่ที่ `0.3958`) และเมื่อเติม `+Rerank` ค่า MRR@5 กระโดดเป็น `1.0000` โดยเพิ่ม latency รวมเพียง ~55 ms",
        code: {
          language: "python",
          filename: "worked_ablation.py",
          code: `latencies = {"dense": 25.0, "hybrid_rrf": 35.0, "hybrid_rerank": 90.0}

print(f"{'Stage':<15} {'Recall@5':>10} {'MRR@5':>10} {'Latency(ms)':>13}")
for name, rows in stages.items():
    avg_recall = sum(r for r, _ in rows) / len(rows)
    avg_mrr = sum(m for _, m in rows) / len(rows)
    print(f"{name:<15} {avg_recall:>10.4f} {avg_mrr:>10.4f} {latencies[name]:>13.1f}")`,
        },
        output: `Stage             Recall@5      MRR@5   Latency(ms)
dense               0.5000     0.1875          25.0
hybrid_rrf          1.0000     0.3958          35.0
hybrid_rerank       1.0000     1.0000          90.0`,
      },
    ],
    gotcha:
      "จุดสังเกต: ในตัวอย่างนี้ `q1_inv_code` และ `q4_pdpa_delete` มีคำตอบหลุดไปอันดับ 6 ใน `dense` จึงได้ Recall@5 = `0.0` แต่เมื่อรวมกับ `bm25` ผ่าน RRF คำตอบทั้งสองถูกดึงกลับเข้า Top-5 (อันดับ 2 และ 4) ทันที แล้ว Cross-Encoder จึงดันทั้ง 4 ข้อขึ้นอันดับ 1 — นี่คือเหตุผลที่เราต้องดู **ทั้ง Recall@5 และ MRR@5 คู่กัน**",
  },

  practice: {
    intro:
      "โจทย์ทบทวน (15 นาที): สร้างโมดูล 3-Stage Retrieval Ablation Benchmark (`exercise_day104.py`) ที่คำนวณ `Recall@k`, `MRR@k`, การผสาน `RRF`, การจัดอันดับด้วย Reranker และสรุปรายงาน `StageReport` สำหรับ `dense`, `hybrid_rrf` และ `hybrid_rerank` ให้ผ่าน Quality & Latency Gate ใน `pytest`",
    requirements: [
      "เขียน `recall_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float` และ `reciprocal_rank_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float` (ถ้า `k <= 0` โยน `ValueError`, ถ้า `relevant` ว่างให้คืน `0.0`)",
      "เขียน `rrf_fuse(ranked_lists: list[list[str]], k: int = 60) -> list[str]` โดยใช้ 1-based rank, กัน `doc_id` ซ้ำในแต่ละลิสต์ และเรียง tie-break ด้วย `(-score, doc_id)` (ถ้า `k <= 0` โยน `ValueError`)",
      "เขียน `evaluate_ablation(cases: list[EvalCase], *, k: int = 5, rrf_k: int = 60, rerank_pool: int = 20, stage_latencies_ms: dict[str, float] | None = None) -> dict[str, StageReport]` โดยถ้า `cases` ว่าง หรือ `k <= 0` หรือ `rerank_pool <= 0` ให้โยน `ValueError`",
      "ในขั้น `hybrid_rerank` ให้นำเฉพาะ `hybrid_docs[:rerank_pool]` มาเรียงใหม่ด้วย `(-case.rerank_scores.get(doc_id, float('-inf')), doc_id)` แล้วคำนวณค่าเฉลี่ย `recall_at_k` และ `mrr_at_k` ระดับ `@k`",
      "คืน dict ที่มีครบ 3 คีย์ (`\"dense\"`, `\"hybrid_rrf\"`, `\"hybrid_rerank\"`) พร้อมค่า `avg_latency_ms` จาก `stage_latencies_ms` (ค่าเริ่มต้น `dense=25.0`, `hybrid_rrf=35.0`, `hybrid_rerank=90.0`)",
    ],
    starter: {
      language: "python",
      filename: "exercise_day104.py",
      code: `from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class EvalCase:
    query_id: str
    relevant_ids: set[str]
    dense_ranking: list[str]
    bm25_ranking: list[str]
    rerank_scores: dict[str, float]


@dataclass(frozen=True)
class StageReport:
    name: str
    recall_at_k: float
    mrr_at_k: float
    avg_latency_ms: float


DEFAULT_LATENCIES_MS: dict[str, float] = {
    "dense": 25.0,
    "hybrid_rrf": 35.0,
    "hybrid_rerank": 90.0,
}


def recall_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    # TODO: validate k > 0, จัดการ relevant ว่าง, คำนวณ Recall@k
    raise NotImplementedError


def reciprocal_rank_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:
    # TODO: validate k > 0, คืน 1/rank ของเอกสารที่เกี่ยวข้องชิ้นแรกใน top-k (หรือไม่พบคืน 0.0)
    raise NotImplementedError


def rrf_fuse(ranked_lists: list[list[str]], k: int = 60) -> list[str]:
    # TODO: validate k > 0, 1-based rank, กัน doc ซ้ำในแต่ละลิสต์, เรียง (-score, doc_id)
    raise NotImplementedError


def evaluate_ablation(
    cases: list[EvalCase],
    *,
    k: int = 5,
    rrf_k: int = 60,
    rerank_pool: int = 20,
    stage_latencies_ms: dict[str, float] | None = None,
) -> dict[str, StageReport]:
    # TODO: validate cases, k, rrf_k, rerank_pool แล้วคำนวณ StageReport ครบ 3 ขั้น
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day104.py",
      code: `import pytest
from exercise_day104 import (
    EvalCase,
    evaluate_ablation,
    recall_at_k,
    reciprocal_rank_at_k,
    rrf_fuse,
)


def _benchmark_cases() -> list[EvalCase]:
    return [
        EvalCase(
            query_id="q1_inv_code",
            relevant_ids={"doc_inv_009"},
            dense_ranking=["doc_overdue", "doc_pay", "doc_tax", "doc_refund", "doc_faq", "doc_inv_009"],
            bm25_ranking=["doc_inv_009", "doc_inv_019", "doc_overdue", "doc_tax", "doc_pay", "doc_faq"],
            rerank_scores={"doc_inv_009": 0.96, "doc_overdue": 0.72, "doc_inv_019": 0.25, "doc_tax": 0.15, "doc_pay": 0.18, "doc_refund": 0.10, "doc_faq": 0.08},
        ),
        EvalCase(
            query_id="q2_after_7d",
            relevant_ids={"doc_after_7d"},
            dense_ranking=["doc_within_7d", "doc_shipping", "doc_faq", "doc_after_7d", "doc_warranty", "doc_vip"],
            bm25_ranking=["doc_within_7d", "doc_after_7d", "doc_faq", "doc_shipping", "doc_warranty", "doc_vip"],
            rerank_scores={"doc_after_7d": 0.94, "doc_within_7d": 0.62, "doc_faq": 0.20, "doc_shipping": 0.05, "doc_warranty": 0.06, "doc_vip": 0.04},
        ),
        EvalCase(
            query_id="q3_etax",
            relevant_ids={"doc_etax_guide"},
            dense_ranking=["doc_receipt", "doc_etax_guide", "doc_tax_law", "doc_pay", "doc_faq", "doc_shipping"],
            bm25_ranking=["doc_tax_law", "doc_receipt", "doc_etax_guide", "doc_faq", "doc_pay", "doc_shipping"],
            rerank_scores={"doc_etax_guide": 0.91, "doc_receipt": 0.65, "doc_tax_law": 0.50, "doc_pay": 0.12, "doc_faq": 0.09, "doc_shipping": 0.03},
        ),
        EvalCase(
            query_id="q4_pdpa_delete",
            relevant_ids={"doc_pdpa_erasure"},
            dense_ranking=["doc_privacy_gen", "doc_cookie", "doc_terms", "doc_faq", "doc_security", "doc_pdpa_erasure"],
            bm25_ranking=["doc_pdpa_erasure", "doc_privacy_gen", "doc_terms", "doc_cookie", "doc_security", "doc_faq"],
            rerank_scores={"doc_pdpa_erasure": 0.93, "doc_privacy_gen": 0.58, "doc_terms": 0.22, "doc_cookie": 0.15, "doc_security": 0.12, "doc_faq": 0.07},
        ),
    ]


def test_recall_and_reciprocal_rank_metrics():
    retrieved = ["d1", "d2", "d3", "d4", "d5"]
    assert recall_at_k(retrieved, {"d2", "d6"}, k=5) == pytest.approx(0.5)
    assert recall_at_k(retrieved, set(), k=5) == 0.0
    assert reciprocal_rank_at_k(retrieved, {"d4"}, k=5) == pytest.approx(0.25)
    assert reciprocal_rank_at_k(retrieved, {"d9"}, k=5) == 0.0


def test_rrf_fuse_dedup_and_tie_break():
    fused = rrf_fuse([["doc_z", "doc_z"], ["doc_a"]], k=60)
    assert fused == ["doc_a", "doc_z"]


def test_ablation_proves_recall_and_mrr_gains_within_latency_budget():
    reports = evaluate_ablation(_benchmark_cases(), k=5, rrf_k=60, rerank_pool=20)
    dense = reports["dense"]
    hybrid = reports["hybrid_rrf"]
    rerank = reports["hybrid_rerank"]

    assert dense.recall_at_k == pytest.approx(0.50)
    assert hybrid.recall_at_k == pytest.approx(1.00)
    assert rerank.recall_at_k == pytest.approx(1.00)

    # Quality gates: Hybrid beats Dense on Recall@5; Rerank beats Hybrid on MRR@5
    assert hybrid.recall_at_k > dense.recall_at_k
    assert rerank.mrr_at_k > hybrid.mrr_at_k
    assert rerank.mrr_at_k == pytest.approx(1.00)

    # Latency budget gate (< 150ms)
    assert rerank.avg_latency_ms <= 150.0


def test_rerank_pool_limits_candidates_visible_to_reranker():
    case = EvalCase(
        query_id="pool_limit",
        relevant_ids={"doc_target"},
        dense_ranking=["d1", "d2", "d3", "doc_target"],
        bm25_ranking=["d1", "d2", "d3", "doc_target"],
        rerank_scores={"doc_target": 0.99, "d1": 0.1, "d2": 0.1, "d3": 0.1},
    )
    reports = evaluate_ablation([case], k=3, rerank_pool=2)
    assert reports["hybrid_rerank"].recall_at_k == 0.0


def test_invalid_inputs_raise_value_error():
    with pytest.raises(ValueError):
        recall_at_k(["d1"], {"d1"}, k=0)
    with pytest.raises(ValueError):
        reciprocal_rank_at_k(["d1"], {"d1"}, k=0)
    with pytest.raises(ValueError):
        rrf_fuse([["d1"]], k=0)
    with pytest.raises(ValueError):
        evaluate_ablation([], k=5)
`,
    },
    selfCheck: [
      "`recall_at_k` และ `reciprocal_rank_at_k` ตรวจ `k <= 0` และจัดการ `relevant` ว่างได้ถูกต้องโดยไม่เกิด `ZeroDivisionError`",
      "`rrf_fuse` ใช้ 1-based rank, กัน `doc_id` ซ้ำในแต่ละลิสต์ และ tie-break ด้วย `(-score, doc_id)`",
      "`evaluate_ablation` แสดงให้เห็นชัดว่า `hybrid_rrf.recall_at_k > dense.recall_at_k` และ `hybrid_rerank.mrr_at_k > hybrid_rrf.mrr_at_k`",
      "เทสต์ `test_rerank_pool_limits_candidates_visible_to_reranker` พิสูจน์ว่า Reranker มองเห็นเฉพาะ `hybrid_docs[:rerank_pool]` เท่านั้น",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "แยกการคำนวณแต่ละขั้นเป็นลิสต์ `recalls` และ `mrrs` ต่อชื่อ stage (`dense`, `hybrid_rrf`, `hybrid_rerank`) แล้วค่อยหาค่าเฉลี่ย `sum(vals) / len(cases)` ตอนสร้าง `StageReport`",
      },
      {
        body: "ในขั้น `hybrid_rerank` ต้อง slice `pool = hybrid_docs[:rerank_pool]` ก่อนเสมอ แล้วค่อยเรียงด้วย `sorted(pool, key=lambda d: (-case.rerank_scores.get(d, float('-inf')), d))` เพื่อจำลองข้อจำกัดจริงของ 2-Stage Retrieval",
      },
      {
        body: "โครงของ `evaluate_ablation` เกือบสมบูรณ์ — เหลือเติมการคำนวณค่าเฉลี่ยสร้าง `StageReport` ในลูปสุดท้าย",
        code: {
          language: "python",
          filename: "hint_day104.py",
          code: `def evaluate_ablation(
    cases: list[EvalCase],
    *,
    k: int = 5,
    rrf_k: int = 60,
    rerank_pool: int = 20,
    stage_latencies_ms: dict[str, float] | None = None,
) -> dict[str, StageReport]:
    if not cases or k <= 0 or rrf_k <= 0 or rerank_pool <= 0:
        raise ValueError("cases must be non-empty and k, rrf_k, rerank_pool must be > 0")

    latencies = {**DEFAULT_LATENCIES_MS, **(stage_latencies_ms or {})}
    metrics: dict[str, list[tuple[float, float]]] = {
        "dense": [],
        "hybrid_rrf": [],
        "hybrid_rerank": [],
    }
    for case in cases:
        hybrid_docs = rrf_fuse([case.dense_ranking, case.bm25_ranking], k=rrf_k)
        rerank_docs = sorted(
            hybrid_docs[:rerank_pool],
            key=lambda doc_id: (-case.rerank_scores.get(doc_id, float("-inf")), doc_id),
        )
        for name, docs in (
            ("dense", case.dense_ranking),
            ("hybrid_rrf", hybrid_docs),
            ("hybrid_rerank", rerank_docs),
        ):
            metrics[name].append(
                (
                    recall_at_k(docs, case.relevant_ids, k=k),
                    reciprocal_rank_at_k(docs, case.relevant_ids, k=k),
                )
            )

    # TODO: แปลง metrics เป็น dict[str, StageReport] โดยเฉลี่ย recall และ mrr ของแต่ละ stage
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
      title: "วัดแค่ Recall@5 อย่างเดียวโดยไม่วัด MRR@5",
      symptom: "เห็นว่า `Hybrid RRF` กับ `Hybrid + Rerank` ได้ Recall@5 เท่ากัน (`1.00`) เลยเข้าใจผิดว่า Reranker ไม่ได้ช่วยอะไรแล้วถอดออก",
      fix: "วัด **Recall@5 คู่กับ MRR@5** เสมอ — Recall บอกว่าเข้ากรอบ Top-5 ไหม ส่วน MRR บอกว่าคำตอบขึ้นอันดับ 1–2 ไหม",
    },
    {
      title: "เอา Reranker ไปเรียงเอกสารทั้งคลังแทนที่จะจำกัด `rerank_pool` จาก Stage 1",
      symptom: "ผล Benchmark ออฟไลน์สวยเกินจริง (Recall สูงหลอก) แต่พอขึ้น Production จริงกลับพลาดเพราะ Stage 1 ดึงเข้า Top-20 ไม่ทัน",
      fix: "ใน Ablation Benchmark ต้องจำลอง `hybrid_docs[:rerank_pool]` ให้เหมือนท่อ Production จริงทุกประการ",
    },
    {
      title: "เปลี่ยนชุดคำถามหรือคลังเอกสารระหว่างการเทียบแต่ละขั้น",
      symptom: "ตัวเลข Recall@5 แกว่งจนเปรียบเทียบไม่ได้ว่าดีขึ้นเพราะ RRF/Reranker หรือเพราะคำถามง่ายลง",
      fix: "ตรึงชุดคำถาม (`EvalCase`) และ `relevant_ids` ให้เหมือนกันทุกขั้น และเก็บไว้รันซ้ำเป็น regression test ใน `pytest`",
    },
    {
      title: "วัดคุณภาพอย่างเดียวโดยไม่บันทึก Latency Overhead",
      symptom: "เปิดใช้ทั้ง Multi-Query + HyDE + Rerank Top-50 จน Recall เพิ่ม 2% แต่ P95 Latency ทะลุ 2 วินาที",
      fix: "รายงาน `Recall@5`, `MRR@5` และ `avg_latency_ms` (หรือ P95) บนตารางเดียวกันและตั้งเกณฑ์ผ่าน (gate) ทั้งสองมิติ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d104-q1",
        "ผล Ablation บนชุดคำถามไทยปนอังกฤษแสดงว่า: `Dense Only` (Recall@5=0.50, MRR=0.20), `Hybrid RRF` (Recall@5=0.95, MRR=0.45), `Hybrid + Rerank` (Recall@5=0.95, MRR=0.90) ข้อใดตีความผลนี้ได้ถูกต้องที่สุด?",
        [
          ["Reranker ไม่มีประโยชน์เพราะ Recall@5 ไม่เพิ่มขึ้นจาก 0.95", "ผิด — Reranker ดัน MRR จาก 0.45 เป็น 0.90 แปลว่าเลื่อนคำตอบที่ใช่ขึ้นมาอันดับ 1–2 ได้เกือบทุกข้อ"],
          [
            "Hybrid RRF แก้ปัญหาการหาไม่เจอ (เพิ่ม Recall@5 จาก 0.50→0.95) และ Reranker แก้ปัญหาการจัดอันดับ (เพิ่ม MRR จาก 0.45→0.90)",
            "ถูก — สะท้อนบทบาทของท่อ 2-Stage Retrieval อย่างสมบูรณ์แบบ: Stage 1 เพิ่ม Recall, Stage 2 เพิ่ม Precision/MRR",
          ],
          ["Dense Only ดีที่สุดเพราะมีค่าตัวเลขน้อยกว่า", "ค่า Recall และ MRR ยิ่งใกล้ 1.0 ยิ่งดี"],
          ["ควรปิด BM25 แล้วใช้ Dense + Rerank จะได้ Recall@5 = 0.95 เท่ากัน", "ถ้าปิด BM25 เอกสารรหัสเฉพาะอาจหลุดตั้งแต่ Stage 1 จน Reranker ไม่มีสิทธิ์เห็น"],
        ],
        "B",
        "Recall@5 วัดว่าคำตอบติดใน Top-5 ไหม ส่วน MRR วัดว่าคำตอบอยู่อันดับบนแค่ไหน — ผลลัพธ์นี้ยืนยันว่าทั้ง Hybrid RRF และ Cross-Encoder Reranker ต่างทำหน้าที่ของตัวเองได้อย่างชัดเจน",
        "หาก Hybrid RRF เพิ่ม Recall@5 จาก 0.50→0.95 และ +Rerank เพิ่ม MRR จาก 0.45→0.90 หมายความว่าอย่างไร?",
        "Hybrid RRF ช่วยให้ดึงเอกสารคำตอบเข้า Top-5 ได้ครบขึ้น (Recall) ส่วน Reranker ช่วยดันเอกสารคำตอบจากอันดับรองขึ้นมาอันดับ 1–2 (Precision/MRR)",
      ),
      mc(
        "d104-q2",
        "คำถามหนึ่งมีเอกสารที่เกี่ยวข้อง 2 ชิ้น (`doc_a`, `doc_b`) ระบบคืน Top-5 เป็น `[\"doc_x\", \"doc_a\", \"doc_y\", \"doc_z\", \"doc_w\"]` ค่า **Recall@5** และ **Reciprocal Rank@5** คือเท่าไร?",
        [
          ["Recall@5 = 1.00, RR@5 = 0.50", "มีเอกสารที่เกี่ยวข้อง 2 ชิ้นแต่เจอใน Top-5 แค่ 1 ชิ้น ดังนั้น Recall@5 = 1/2 = 0.50"],
          ["Recall@5 = 0.20, RR@5 = 0.50", "ตัวส่วนของ Recall@5 คือจำนวนเอกสารที่เกี่ยวข้องทั้งหมด (2) ไม่ใช่ 5 (0.20 คือ Precision@5)"],
          [
            "Recall@5 = 0.50, RR@5 = 0.50",
            "ถูก — เจอ 1 จาก 2 ชิ้นที่เกี่ยวข้อง (Recall@5 = 1/2 = 0.50) และเอกสารที่เกี่ยวข้องชิ้นแรกอยู่อันดับ 2 (RR@5 = 1/2 = 0.50)",
          ],
          ["Recall@5 = 0.50, RR@5 = 1.00", "doc_a อยู่อันดับ 2 (ไม่ใช่ 1) ดังนั้น RR@5 = 1/2 = 0.50"],
        ],
        "C",
        "Recall@5 = `|retrieved[:5] ∩ relevant| / |relevant|` = `1/2 = 0.50` และ Reciprocal Rank@5 = `1 / rank_of_first_hit` = `1/2 = 0.50`",
        "จงแยกสูตร Recall@5 ออกจาก Reciprocal Rank@5",
        "Recall@5 = จำนวน relevant ที่เจอใน Top-5 หารด้วยจำนวน relevant ทั้งหมด; Reciprocal Rank@5 = 1 / อันดับของ relevant ชิ้นแรกที่เจอใน Top-5 (ไม่เจอได้ 0)",
      ),
      mc(
        "d104-q3",
        "ในการทบทวน Block B26 ทั้งหมด (D99 + D101–D103) หากผู้ใช้ถามในรอบที่ 2 ว่า `\"แล้วอันเมื่อกี้ใช้กับ #INV-2026-009 ได้ไหม\"` ข้อใดคือลำดับการทำงานของท่อที่สมเหตุสมผลและปลอดภัยที่สุด?",
        [
          ["ส่งเข้า HyDE เพื่อแต่งใบแจ้งหนี้จำลองแล้วค้นด้วย Dense อย่างเดียว", "ห้ามใช้ HyDE กับรหัสเฉพาะเพราะจะแต่งตัวเลขเพี้ยนและเสียความแม่นยำ"],
          [
            "รักษา `#INV-2026-009` ไว้ครบ (พร้อมแก้คำว่า 'อันเมื่อกี้' จากประวัติแชตภายใต้ timeout guard) → Hybrid Search (PyThaiNLP BM25 + Dense) + RRF Top-20 → Cross-Encoder Rerank Top-5 พร้อม fallback",
            "ถูก — รวมจุดแข็งทุกขั้นใน B26 อย่างลงตัว ทั้งความเข้าใจบทสนทนา รหัสตรงตัว ฉันทามติ RRF และความคมของ Cross-Encoder ภายใต้ Latency Guard",
          ],
          ["ข้าม Stage 1 แล้วเอาเอกสารทั้งคลังส่งเข้า Cross-Encoder ทันที", "ช้าเกินรับไหวในระดับคลังเอกสารจริง"],
          ["ใช้ BM25 แบบตัดคำด้วยช่องว่าง (`str.split()`) เพื่อความเร็วสูงสุด", "ภาษาไทยไม่มีช่องว่างคั่นคำ การใช้ `str.split()` ทำให้ BM25 พลาดคำไทยเกือบทั้งหมด ต้องใช้ PyThaiNLP"],
        ],
        "B",
        "ท่อ Production RAG ภาษาไทยที่แข็งแกร่งเชื่อมทุกชั้นเข้าด้วยกันอย่างมีวินัย: แก้บริบทโดยไม่ทำลายรหัสเฉพาะ → Hybrid RRF (PyThaiNLP BM25 + Dense) → Cross-Encoder Rerank พร้อม timeout fallback",
        "ลำดับท่อ Retrieval ภาษาไทยครบวงจรจาก Block B25–B26 เป็นอย่างไร?",
        "Query Transform (พร้อม Bypass/Latency Guard) → Hybrid Search (PyThaiNLP BM25 + Dense Vector) + RRF Top-20 → Cross-Encoder Rerank Top-5 (พร้อม Fallback)",
      ),
      mc(
        "d104-q4",
        "เหตุใดจึงต้องจำกัด `rerank_pool` (เช่น `hybrid_docs[:20]`) ในโค้ด Ablation Benchmark แทนที่จะให้ Reranker จัดอันดับเอกสารทุกชิ้นในคลัง?",
        [
          ["เพราะ Python `sorted()` เรียงลิสต์เกิน 20 ชิ้นไม่ได้", "Python เรียงลิสต์ได้หลายล้านชิ้น ข้อจำกัดนี้เพื่อจำลองท่อ Production จริง"],
          ["เพราะสูตร RRF คืนผลได้ไม่เกิน 20 ชิ้นเสมอ", "RRF คืนได้เท่ากับจำนวนเอกสารที่ไม่ซ้ำทั้งหมด"],
          [
            "เพื่อให้ผล Benchmark สะท้อนข้อจำกัดจริงของ 2-Stage Retrieval ที่ Reranker เห็นเฉพาะ Top-20 จาก Stage 1 เท่านั้น",
            "ถูก — หากปล่อยให้ Reranker เห็นทั้งคลังในเทสต์ ผล Benchmark จะหลอกตาและไม่ตรงกับพฤติกรรมจริงใน Production",
          ],
          ["เพื่อทำให้ค่า MRR@5 ลดลงครึ่งหนึ่งเสมอ", "ไม่ได้มีเป้าหมายลด MRR แต่เพื่อความสมจริงของระบบ 2 จังหวะ"],
        ],
        "C",
        "Evaluation ที่ดีต้องจำลองเงื่อนไข Production ให้ตรงที่สุด หาก Stage 1 ดึงคำตอบเข้า Top-20 ไม่ได้ Benchmark ก็ควรฟ้องให้เห็นความจริงนั้นทันที",
        "ทำไมโค้ด Ablation Benchmark ต้องตัด `hybrid_docs[:rerank_pool]` ก่อนเข้า Reranker?",
        "เพื่อสะท้อนข้อจำกัดจริงของท่อ 2-Stage Retrieval ใน Production ที่ Reranker เห็นเฉพาะผู้สมัคร Top-20 จาก Stage 1 เท่านั้น",
      ),
    ],
  },

  takeaways: [
    "**Ablation Study (`Dense` → `Hybrid RRF` → `+Rerank`)** บนชุดคำถามเดียวกันพิสูจน์คุณค่าของแต่ละชั้นด้วยตัวเลขจริงแทนการเดา",
    "วัด **Recall@5** (คำตอบติด Top-5 ไหม) คู่กับ **{{mrr}}@5** (คำตอบอยู่อันดับบนแค่ไหน) พร้อม **Latency Overhead** เสมอ",
    "แพตเทิร์นคลาสสิกของ Block B26: **Hybrid RRF ดัน Recall@5**, **Cross-Encoder ดัน MRR@5**, และ **Latency Guard คุม P95**",
    "ผูก Ablation Benchmark ไว้ใน `pytest` เป็น Quality & Latency Gate ก่อนขึ้นสู่ Block B27 (Grounded Citations & Tenant ACL)",
  ],

  reviewCards: [
    rc(
      "d104-rc-1",
      "สรุปบทบาทของแต่ละขั้นใน 3-Stage Ablation: Dense Only vs Hybrid RRF vs Hybrid + Rerank",
      "Dense Only เป็น baseline ความหมาย; Hybrid RRF (+PyThaiNLP BM25) ดัน Recall@5 สำหรับรหัสเฉพาะและคำถามไทยปนอังกฤษ; Hybrid + Rerank (Cross-Encoder) ดัน MRR@5 และ Precision@5 โดยเลื่อนคำตอบที่ใช่ขึ้นอันดับ 1–2",
    ),
    rc(
      "d104-rc-2",
      "Recall@5 เท่ากันที่ 1.00 แต่ MRR@5 ต่างกัน (0.25 vs 1.00) บอกอะไรกับเรา?",
      "ทั้งสองระบบหาคำตอบติดใน Top-5 ได้เหมือนกัน แต่ระบบที่ได้ MRR = 0.25 วางคำตอบไว้ที่อันดับ 4 ส่วนระบบที่ได้ MRR = 1.00 วางไว้ที่อันดับ 1 ซึ่งช่วยลดอาการ LLM หลงบริบทได้ดีกว่ามาก",
    ),
    rc(
      "d104-rc-3",
      "หาก Ablation Benchmark แสดงว่าคำถามกลุ่มหนึ่งได้ Recall@5 = 0 ทั้ง 3 ขั้น ควรเริ่มแก้จุดไหนก่อน?",
      "ตรวจ Stage 1 และต้นน้ำก่อนเสมอ: เช็กการตัดคำไทย (PyThaiNLP), Chunking (Day 95), การแปลงคำถามต่อเนื่อง (Day 103) หรือตรวจว่ามีเอกสารคำตอบอยู่ในคลังจริงไหม — การเปลี่ยน Reranker จะไม่ช่วยเคสนี้",
    ),
  ],

  sources: [
    { label: "TREC Evaluation Metrics — Recall@k & Mean Reciprocal Rank (IR Book)", href: "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html" },
    { label: "Qdrant Documentation — Hybrid Search & Evaluation Best Practices", href: "https://qdrant.tech/documentation/concepts/hybrid-queries/" },
    { label: "pytest Official Documentation — Assertions & Parametrize", href: "https://docs.pytest.org/en/stable/" },
    { label: "Sentence-Transformers — Information Retrieval Evaluator", href: "https://www.sbert.net/docs/package_reference/sentence_transformer/evaluation.html" },
  ],

  glossary: ["rrf", "reranker", "bm25", "pythainlp", "embedding", "mrr", "precision-recall", "rag"],
});
