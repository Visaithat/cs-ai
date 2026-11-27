import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D060 — Phase 2 / Block B15 (Checkpoint Day)
 * Checkpoint: Phase 2 Demo, ML vs LLM Trade-off Memo & Quiz (B09–B15)
 */
export const d060: Lesson = defineLesson({
  day: 60,
  titleTh: "Checkpoint Phase 2: เดโมระบบ, บันทึกวิเคราะห์ ML vs LLM และควิซรวม B09–B15",
  tagline:
    "30 นาที · รันบนเครื่อง 100% CPU ไม่ต้องใช้ API key · ตรวจความพร้อม Portfolio Milestone #2 เขียน Engineering Memo เทียบ ML vs LLM และเปิดประตูสู่ Phase 3",
  icon: "award",
  visual: {
    id: "phase2-ml-pipeline",
    title: "Phase 2 Checkpoint — Demo, ML vs LLM Trade-off Memo & Readiness Audit",
    caption:
      "ตรวจครบทุกเกณฑ์ของ Phase 2 Portfolio Milestone ก่อนก้าวเข้าสู่ Phase 3 (Deep Learning & Core LLM)",
    alt: "แผนภาพตรวจสอบความพร้อม Phase 2 Checkpoint",
  },
  requiresApiKey: false,
  tools: [
    "Polars",
    "DuckDB",
    "NumPy",
    "scikit-learn",
    "LightGBM",
    "PyThaiNLP",
    "ONNX Runtime",
    "pytest",
    "Ruff",
  ],

  bigPicture: [
    {
      node: 0,
      heading: "ตัดสินใจเชิงสถาปัตยกรรมด้วยตัวเลขจริง (ML vs LLM Trade-off)",
      body: "วิศวกร AI ที่เก่งไม่ใช่คนที่โยนทุกปัญหาใส่ {{llm}} แต่คือคนที่คำนวณต้นทุน (Cost/100k requests), ความเร็ว (P95 latency) และความแม่นยำ เพื่อเลือกระหว่าง Classical ML, LLM หรือ Hybrid Routing ได้อย่างมีเหตุผล",
      lessonNote:
        "วันนี้คุณเขียน **1-Page Engineering Memo** เทียบ Classical ML (`<10ms`, `~$0.01/100k`) กับ LLM (`~800ms`, `~$50/100k`) และออกแบบ Hybrid Router สำหรับ Phase 3",
    },
    {
      node: 2,
      heading: "ปิดรอบ Portfolio Milestone #2: Thai Ticket Priority ML Pipeline",
      body: "ตลอด 28 วันของ Phase 2 คุณได้ต่อยอดจากข้อมูลดิบด้วย {{polars}}/{{duckdb}} จนเป็นโมเดลจัดลำดับทิกเก็ตภาษาไทยที่ตัดคำด้วย {{pythainlp}}, ผ่าน Error Analysis และ export เป็น artifact ความเร็ว `< 10ms`",
      lessonNote:
        "เราจะตรวจเช็กครบทั้ง 6 ด้านของ Phase 2 Demo Checklist เพื่อให้ผลงานพร้อมเผยแพร่บน GitHub และนำเสนอใน 3 นาที",
    },
    {
      node: 3,
      heading: "ประเมินความเข้าใจรวม Block B09–B15 และตรวจ Readiness Audit",
      body: "ก่อนก้าวสู่โลกของ Neural Networks และ LLM ใน Phase 3 แนวคิดพื้นฐานอย่าง {{cosine-similarity}}, {{data-leakage}}, {{precision-recall}} และ {{onnx}} parity ต้องแม่นยำโดยไม่ต้องเปิดตำรา",
      lessonNote:
        "ทำ Cumulative Quiz รวม B09–B15 และรันสคริปต์ **Phase 2 Readiness Auditor** เพื่อยืนยันว่าผ่านทุก Quality Gate",
    },
    {
      node: 5,
      heading: "เตรียมพร้อมรับมือ Production Drift และสะพานสู่ Phase 3",
      body: "โมเดลที่วางขึ้นระบบจริงจะเสื่อมลงเมื่อพฤติกรรมลูกค้าเปลี่ยน ({{feature-drift}}) และการเก็บ baseline metrics วันนี้คือจุดอ้างอิงสำคัญตอนเทียบกับ LLM Extractor ใน Phase 3 (Day 92)",
      lessonNote:
        "เก็บรายงาน F1, P95 latency และต้นทุนของ Phase 2 Baseline ไว้เทียบกับ LLM แบบหมัดต่อหมัดใน Phase 3!",
    },
  ],

  objectives: [
    "**ตรวจสอบความพร้อมของ Phase 2 Portfolio Milestone (`Thai Ticket Priority ML Pipeline`)** ครบทั้ง 6 เกณฑ์วิศวกรรม: Data Hygiene, Zero Data Leakage, Thai NLP/Error Analysis, Business Metrics, Export Parity `< 10ms` และ Reproducible ML Tests",
    "**เขียน 1-Page Engineering Trade-off Memo** เปรียบเทียบ **Classical ML vs LLM vs Hybrid Routing** ด้วยตัวเลข Latency, ต้นทุนต่อ 100k ทิกเก็ต และเกณฑ์การตัดสินใจส่งเคสกำกวมขึ้น LLM ใน Phase 3",
    "**ประเมินความเข้าใจเชิงบูรณาการ (Cumulative Quiz)** ครบทุกบล็อกของ Phase 2 (B09–B15) เพื่อยืนยันความพร้อมก่อนเริ่ม Phase 3 (PyTorch, Transformers & Core LLM)",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน Block B09–B15 (Polars/DuckDB, NumPy Vectors, scikit-learn/LightGBM, PyThaiNLP, ONNX, Error Analysis & ML Tests)",
    "มีผลงานหรือโค้ดจาก Day 55–59 และติดตั้ง `pydantic`, `pytest`, `ruff` ผ่าน `uv` แล้ว",
    "รันบนเครื่องได้ 100% บน CPU ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "เปิดโฟลเดอร์โปรเจกต์ `Thai Ticket Priority ML Pipeline` ของคุณ (หรือสร้างโฟลเดอร์ Day 60) เพื่อรันชุดคำสั่ง Quality Gate ครบชุดและสร้างไฟล์ Memo สรุปผล",
    commands: `# 1) รัน Quality Gate ครบชุดของ Phase 2 Portfolio Milestone
uv sync --frozen
uv run ruff check .
uv run pytest -v

# 2) (กรณีเริ่มโฟลเดอร์แยกสำหรับแบบฝึกหัด Checkpoint Day 60)
# uv init ai-day60 && cd ai-day60 && uv add pydantic && uv add --dev pytest ruff`,
    steps: [
      ["sync", "ตรวจ `uv sync --frozen` และยืนยันว่าไม่มีไฟล์ข้อมูลดิบ/artifact ใหญ่หลุดเข้า Git"],
      ["gate", "รัน `uv run ruff check .` และ `uv run pytest -v` ผ่านทั้ง Determinism, Behavioral, Parity และ Latency Gate"],
      ["memo", "เตรียมตัวเลขจริง (F1, PR-AUC, P95 ms) จากโมเดลของคุณสำหรับใส่ใน Engineering Memo"],
    ],
    note: "จังหวะ 30 นาทีของวัน Checkpoint: ทำ Cumulative Quiz B09–B15 (10 นาที) → สร้างสคริปต์ Audit + Engineering Memo และซ้อมเดโม 3 นาที (15 นาที) → ทบทวน Error Log ก่อนขึ้น Phase 3 (5 นาที)",
  },

  concepts: [
    {
      id: "phase2-milestone-audit-checklist",
      title: "1 · เช็กลิสต์ 6 ด้านของ Phase 2 Portfolio Milestone (`Thai Ticket Priority ML Pipeline`)",
      paragraphs: [
        "ก่อนปิดบท Phase 2 และติดแท็ก `v0.2.0` บน GitHub ให้ตรวจผลงานด้วย **Phase 2 Readiness Checklist 6 ด้าน** เพื่อรับประกันว่านี่คือ ML Pipeline ระดับวิศวกรรมจริง ไม่ใช่แค่สคริปต์ทดลองใน Notebook:",
        "ทุกด้านเชื่อมโยงเนื้อหาตลอด 28 วันเข้าด้วยกัน ตั้งแต่การล้างข้อมูลภาษาไทยแบบ UTF-8 ด้วย {{polars}}/{{duckdb}}, การป้องกัน {{data-leakage}} ด้วย `Pipeline`, การตัดคำด้วย {{pythainlp}} + Error Slicing, การตั้ง threshold ด้วย {{expected-value}}, การ export ที่ผ่าน parity และ `< 10ms` P95, ไปจนถึงชุดเทสต์ 4 ชั้นและการวาง baseline สำหรับตรวจ {{feature-drift}}",
      ],
      analogy:
        "เหมือนการตรวจรับอาคารก่อนเปิดใช้งาน: ต้องตรวจครบทั้งฐานราก (Data Hygiene), โครงสร้างกันแผ่นดินไหว (Zero Leakage & CV), ระบบไฟฟ้าความเร็วสูง (<10ms Export), และสัญญาณเตือนภัย (ML Tests & Drift Baseline)",
      bullets: [
        "**1. Data & Analytics Hygiene (B09)** — โหลด/ล้างข้อมูลด้วย `Polars` / `DuckDB` แบบ UTF-8 สะอาด ไม่มี duplicate/null หลุดเข้าโมเดล",
        "**2. Zero Leakage & Validation Discipline (B11, B13)** — แยก Train/Val/Test ก่อนทุกอย่าง, ห่อ preprocessing ใน `Pipeline`, ใช้ Stratified {{cross-validation}} และทำ Error Analysis บน Val Set เท่านั้น",
        "**3. Thai NLP & Data-Centric Polish (B13, B15)** — ตัดคำด้วย `PyThaiNLP newmm` + Custom Dict (`สลิปปลอม`, `โอนซ้ำ`) + ยุบคำลากเสียง พร้อมหลักฐานเปรียบเทียบก่อน-หลัง",
        "**4. Business-Aligned Metrics (B10, B12)** — รายงาน `Precision`, `Recall`, `F1`, `PR-AUC` (ไม่ใช่แค่ accuracy บนข้อมูลไม่สมดุล) และเลือก threshold ตามต้นทุนธุรกิจ (FP vs FN)",
        "**5. Export Parity & `< 10ms` Latency (B14, B15)** — Export เป็น `joblib` / {{onnx}}, ผ่าน `np.allclose` parity check 100%, และวัด P50/P95/P99 พร้อม warmup ได้ `P95 < 10ms` บน CPU",
        "**6. Reproducible Tests & Drift Readiness (B14, B15)** — ชุด `pytest` ตรวจ seed determinism, Invariance/Directional, edge cases ไทย และบันทึก Data/Model Card + feature distribution baseline",
      ],
      whyTitle: "Why this matters — พอร์ตโฟลิโอชิ้นที่ 2 ที่พิสูจน์ว่าคุณคุม Classical ML ได้ครบวงจร",
      whyParagraphs: [
        "ในสัมภาษณ์งาน AI Engineer คำถามที่พบบ่อยมากคือ 'ทำไมคุณไม่ใช้ LLM ทำทั้งหมดเลย?' — การมีโปรเจกต์ Classical ML ภาษาไทยที่เร็ว `< 10ms`, มี Error Analysis ชัดเจน และมีชุดเทสต์ครบชุด คือคำตอบที่ทรงพลังที่สุด",
        "ยิ่งไปกว่านั้น ตัวเลข F1 และ P95 ของโปรเจกต์นี้จะถูกใช้เป็น **Baseline มาตรฐาน** ใน Day 92 (Phase 3 Checkpoint) เพื่อวัดว่า LLM คุ้มค่าที่จะนำมาใช้ตรงจุดไหนบ้าง",
      ],
    },
    {
      id: "ml-vs-llm-engineering-memo",
      title: "2 · 1-Page Engineering Memo: Classical ML vs LLM vs Hybrid Routing",
      paragraphs: [
        "ลองคำนวณเศรษฐศาสตร์ของระบบคัดกรองทิกเก็ตระดับองค์กรที่มีปริมาณ **100,000 ทิกเก็ต/เดือน** จะเห็นความต่างแบบคนละโลก: **Classical ML** (TF-IDF + LogisticRegression / LightGBM) รันบน CPU เดิมด้วย P95 **~1–5ms** และต้นทุน compute ราว **$0.01 / 100k ทิกเก็ต** (แทบฟรี), deterministic 100%, ทำงาน offline ได้โดยข้อมูลลูกค้าไม่หลุดออกนอกองค์กร",
        "ในขณะที่การยิง **Frontier/Mid-tier {{llm}} API** ทุกทิกเก็ตมี P95 latency ราว **~800ms** (ช้ากว่า >150 เท่า) และต้นทุนราว **$5–$50 / 100k ทิกเก็ต** — โดยเฉพาะภาษาไทยที่ {{bpe-tokenizer}} ของ LLM มักตัดเป็นจำนวน token มากกว่าภาษาอังกฤษถึง **1.5x–3x** ทำให้ทั้งช้าและแพงขึ้นอีก แถมยังมีความเสี่ยงเรื่อง {{hallucination}} หรือรูปแบบเอาต์พุตแกว่งถ้าไม่คุม schema",
        "แล้วเมื่อไรที่ควรใช้ **Hybrid Routing (ML + LLM)**? เมื่อเรามีทิกเก็ตส่วนใหญ่ (~85%) ที่ Classical ML มั่นใจสูง (`prob >= 0.85` หรือ `<= 0.15`) ให้ตอบทันทีใน `< 10ms` ส่วนเคสกำกวมที่เหลือ (~15%) เช่น ประชดประชัน ความหมายซับซ้อน หรือคำศัพท์ใหม่เอี่ยม ให้ส่งต่อไปยัง LLM ช่วยวิเคราะห์ — ผลลัพธ์คือ **ประหยัดค่า API ลง ~85%** และได้ความเร็วเฉลี่ยระดับมิลลิวินาทีพร้อมความแม่นยำสูงสุด!",
      ],
      analogy:
        "เหมือนห้องฉุกเฉินโรงพยาบาล: พยาบาลคัดกรอง (Classical ML) แยกเคสชัดเจน 85% ได้ในไม่กี่วินาที ส่วนเคสอาการซับซ้อนกำกวม 15% ค่อยส่งเข้าพบแพทย์เฉพาะทาง (LLM) — ทั้งเร็วกว่า ประหยัดกว่า และไม่ทำแพทย์ล้นมือ",
      code: {
        language: "text",
        filename: "MEMO_TEMPLATE.md",
        code: `# Engineering Memo: Ticket Priority Architecture (ML vs LLM vs Hybrid)

## 1. Decision Summary
ใช้ Classical ML (PyThaiNLP + TF-IDF + LogisticRegression/LightGBM) เป็นด่านแรก (<10ms P95)
และวางแผนเพิ่ม Confidence-Based Hybrid Router ส่งเฉพาะเคสกำกวม (~15%) ไปยัง LLM ใน Phase 3

## 2. Economics & Latency (100,000 Thai Tickets / Month)
| Approach      | P95 Latency | Est. Cost / 100k | Offline / PDPA | Best For |
|---------------|-------------|------------------|----------------|----------|
| Classical ML  | ~2 ms       | ~$0.01           | 100% Local     | High-volume, labeled routing |
| LLM API Only  | ~800 ms     | ~$50.00          | External API   | Zero-shot, sarcasm, extraction |
| Hybrid (85/15)| ~122 ms*    | ~$7.51 (-85%)    | Selective      | Best cost/accuracy trade-off |
(*weighted latency; 85% ของผู้ใช้ได้คำตอบภายใน <5ms ทันที)

## 3. Risks & Mitigations
- Feature Drift / ศัพท์ใหม่ -> ตรวจ drift รายสัปดาห์ + อัปเดต Custom Dict จากเคสที่ส่งไป LLM`,
        caption: "โครงสร้าง Engineering Memo 1 หน้าที่ชัดเจน กระชับ และตัดสินใจด้วยตัวเลขจริง",
      },
      whyTitle: "Why this matters — เอกสาร 1 หน้านี้คือทักษะระดับ Senior AI Engineer",
      whyParagraphs: [
        "ผู้บริหารและ Tech Lead ตัดสินใจจากตาราง Cost, Latency, Accuracy และ Privacy (PDPA) ไม่ใช่จากชื่อเทคโนโลยีที่กำลังเป็นกระแส การเขียน Memo 1 หน้านี้ช่วยให้คุณสื่อสารคุณค่าของงานวิศวกรรมได้อย่างคมชัด",
        "นอกจากนี้ เคสกำกวม 15% ที่ถูกส่งไปให้ LLM ช่วยตอบใน Phase 3 ยังสามารถนำมาตรวจทานและป้อนกลับเป็น training data เพื่ออัปเกรดโมเดล Classical ML ให้เก่งขึ้นเรื่อย ๆ (Data Flywheel)!",
      ],
    },
    {
      id: "bridge-to-phase3-deep-learning",
      title: "3 · สะพานเชื่อมสู่ Phase 3: จาก Classical ML สู่ PyTorch, Embeddings และ Core LLM",
      paragraphs: [
        "ยินดีด้วยที่คุณจบ **Phase 2: Data, Math Intuition & Classical ML** ครบทั้ง 28 วัน! ทุกเครื่องมือและสัญชาตญาณทางคณิตศาสตร์ใน Phase 2 คือรากฐานตรงของ **Phase 3 (Days 61–92: Neural Nets, Embeddings & Core LLM)**",
        "เริ่มวันพรุ่งนี้ (Day 61 — Block B16) เราจะต่อยอดเวกเตอร์และ {{dot-product}} จาก NumPy เข้าสู่ **`PyTorch` Tensors, Autograd และ Gradient Descent**, เจาะลึก Transformer & BPE Tokenizer (เข้าใจลึกว่าทำไมภาษาไทยกิน token แพงกว่าอังกฤษ), สร้าง Semantic Search ด้วย Multilingual Dense Embeddings เพื่อแก้ข้อจำกัดคำพ้องความหมาย (OOV) ของ TF-IDF, และเรียกใช้งาน Production LLM APIs แบบ Structured Outputs ด้วย Pydantic v2",
      ],
      analogy:
        "Phase 2 สอนให้คุณขับรถเกียร์ธรรมดาและเข้าใจเครื่องยนต์กลไกทุกชิ้น — Phase 3 จะพาคุณก้าวขึ้นขับรถไฟฟ้าสมรรถนะสูง (Neural Nets & LLM) โดยรู้ดีว่าจังหวะไหนควรใช้คันไหนให้คุ้มค่าที่สุด",
      bullets: [
        "**Day 37–38 (Vectors & Cosine)** → ต่อตรงไปยัง **PyTorch Tensors (Day 61)** และ **Multilingual Embeddings (Day 69)**",
        "**Day 49 (PyThaiNLP & TF-IDF OOV)** → ต่อตรงไปยัง **BPE Tokenizers (Day 66)** และ **Hybrid BM25 + Dense Search (Phase 4)**",
        "**Day 55–59 (Thai Ticket ML Baseline)** → ใช้เป็นคู่เทียบจริงกับ **LLM Structured Extractor (Day 92)**",
      ],
      whyTitle: "Why this matters — ทำไมเส้นทาง Python → Classical ML → LLM ถึงเหนือกว่าการข้ามขั้น",
      whyParagraphs: [
        "คนที่กระโดดไปเขียน prompt LLM เลยโดยไม่ผ่าน Phase 1–2 มักติดปัญหา 3 อย่าง: จัดการข้อมูลดิบ/async ไม่เป็น, ออกแบบ evaluation/metrics ไม่ถูก, และมองไม่เห็นว่างานไหนควรใช้ Classical ML ที่ถูกกว่า 1,000 เท่า",
        "วันนี้คุณมีครบทั้ง 2 เสาหลักแล้ว พร้อมก้าวสู่ Phase 3 ด้วยความเข้าใจที่มั่นคงทั้งฝั่งซอฟต์แวร์ ข้อมูล และสถิติ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Hybrid ML+LLM Routing เหมือน CDN Cache + Origin Server",
      body: [
        "สถาปัตยกรรม Hybrid Routing (ส่ง 85% จบที่ Classical ML `< 10ms` แล้วค่อยส่ง 15% ที่กำกวมไป LLM) ใช้หลักการเดียวกับระบบเว็บความเร็วสูง:",
      ],
      table: [
        ["Classical ML (`<10ms`, `~$0.01/100k`)", "Edge CDN / Redis Cache (ตอบส่วนใหญ่ทันที เร็วและถูกมาก)"],
        ["LLM API (`~800ms`, `~$50/100k`)", "Heavy Origin DB / Third-party API (เรียกเฉพาะตอน cache miss จริง ๆ)"],
        ["Confidence Router (`0.15 < p < 0.85`)", "Cache-Miss Condition / Feature Flag Routing"],
        ["1-Page Engineering Memo", "RFC / Architecture Decision Record (ADR) ก่อนขออนุมัติงบทีม"],
      ],
    },
    student: {
      title: "First-Year Note — สรุปภาพรวม 2 Phase ที่ผ่านมาใน 2 ประโยค",
      body: [
        "**Phase 1** ทำให้คุณสร้างโปรแกรม Python ที่สะอาด ทนทานต่อเครือข่าย และทดสอบได้จริง — ส่วน **Phase 2** ทำให้คุณวิเคราะห์ข้อมูลขนาดใหญ่ด้วย Polars/DuckDB เข้าใจเวกเตอร์/สถิติ และสร้างโมเดล ML ภาษาไทยความเร็ว `< 10ms` พร้อมชุดเทสต์ครบชุด",
        "เมื่อเข้าสู่ **Phase 3** ในวันพรุ่งนี้ คุณจะเริ่มสร้างโครงข่ายประสาทเทียม (Neural Network) ด้วย PyTorch และทำงานกับ LLM อย่างเป็นระบบ — ค่อย ๆ สะสมวันละ 30 นาทีเหมือนเดิม รับรองไปถึง Production Capstone ได้แน่นอน",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองสร้างสคริปต์คำนวณเศรษฐศาสตร์ **Classical ML vs LLM vs Hybrid Router** พร้อม **Phase 2 Readiness Auditor** เพื่อสร้างเนื้อหาตารางจริงสำหรับใส่ใน 1-Page Engineering Memo ของคุณ",
    steps: [
      {
        title: "1 · คำนวณต้นทุนและ Latency ของ 3 สถาปัตยกรรม (ML / LLM / Hybrid)",
        explain:
          "รับปริมาณทิกเก็ตต่อเดือน, latency ของแต่ละระบบ และสัดส่วนเคสกำกวมที่ส่งไป LLM (`hybrid_llm_ratio = 0.15`) เพื่อคำนวณค่าใช้จ่ายรายเดือนและเปอร์เซ็นต์ที่ประหยัดได้",
        code: {
          language: "python",
          filename: "worked_d060.py",
          code: `def estimate_economics(
    monthly_tickets: int,
    ml_p95_ms: float = 2.0,
    llm_p95_ms: float = 800.0,
    ml_cost_per_100k: float = 0.01,
    llm_cost_per_100k: float = 50.0,
    hybrid_llm_ratio: float = 0.15,
) -> dict[str, dict[str, float]]:
    units = monthly_tickets / 100_000.0
    ml_cost = units * ml_cost_per_100k
    llm_cost = units * llm_cost_per_100k
    hybrid_cost = ml_cost + (units * hybrid_llm_ratio * llm_cost_per_100k)
    hybrid_weighted_ms = ml_p95_ms + (hybrid_llm_ratio * llm_p95_ms)
    savings_pct = ((llm_cost - hybrid_cost) / llm_cost * 100.0) if llm_cost > 0 else 0.0

    return {
        "classical_ml": {"monthly_usd": round(ml_cost, 2), "latency_ms": round(ml_p95_ms, 2)},
        "llm_only": {"monthly_usd": round(llm_cost, 2), "latency_ms": round(llm_p95_ms, 2)},
        "hybrid_router": {
            "monthly_usd": round(hybrid_cost, 2),
            "latency_ms": round(hybrid_weighted_ms, 2),
            "savings_vs_llm_pct": round(savings_pct, 1),
        },
    }


econ = estimate_economics(monthly_tickets=200_000)
for name, stats in econ.items():
    print(f"{name:14s} -> {stats}")`,
        },
        output: `classical_ml   -> {'monthly_usd': 0.02, 'latency_ms': 2.0}
llm_only       -> {'monthly_usd': 100.0, 'latency_ms': 800.0}
hybrid_router  -> {'monthly_usd': 15.02, 'latency_ms': 122.0, 'savings_vs_llm_pct': 85.0}`,
      },
      {
        title: "2 · สร้าง Phase 2 Readiness Auditor ตรวจ 5 เกณฑ์หลัก",
        explain:
          "ตรวจสอบเงื่อนไขสำคัญของ Portfolio Milestone #2 (pipeline กัน leakage, F1 ≥ 0.80, P95 < 10ms, parity ผ่าน และชุดเทสต์ผ่าน) แล้วสรุปคะแนนความพร้อมเข้าสู่ Phase 3",
        code: {
          language: "python",
          filename: "worked_d060.py",
          code: `def audit_phase2(metrics: dict) -> dict:
    checks = {
        "no_leakage_pipeline": bool(metrics.get("no_leakage_pipeline", False)),
        "f1_gate": float(metrics.get("val_f1", 0.0)) >= 0.80,
        "latency_gate": float(metrics.get("p95_ms", 999.0)) < 10.0,
        "export_parity": bool(metrics.get("export_parity_ok", False)),
        "tests_passed": bool(metrics.get("tests_passed", False)),
    }
    failed = [k for k, ok in checks.items() if not ok]
    score = round((sum(checks.values()) / len(checks)) * 100.0, 1)
    return {"score_pct": score, "ready_for_phase3": len(failed) == 0, "failed_gates": failed}


audit = audit_phase2({
    "no_leakage_pipeline": True,
    "val_f1": 0.87,
    "p95_ms": 1.85,
    "export_parity_ok": True,
    "tests_passed": True,
})
print("Audit:", audit)`,
        },
        output: `Audit: {'score_pct': 100.0, 'ready_for_phase3': True, 'failed_gates': []}`,
      },
      {
        title: "3 · แปลงผลลัพธ์เป็น Markdown Memo 1 หน้าพร้อมแนบใน Repository",
        explain:
          "สร้าง Markdown อัตโนมัติจากตัวเลขจริงที่วัดได้ เพื่อป้องกันปัญหาเอกสารใน README/Memo ไม่ตรงกับโค้ดจริง",
        code: {
          language: "python",
          filename: "worked_d060.py",
          code: `memo = f"""# Phase 2 Trade-off Memo: Thai Ticket Priority Pipeline
- Readiness Score: {audit['score_pct']}% (Ready for Phase 3: {audit['ready_for_phase3']})
- Classical ML: \${econ['classical_ml']['monthly_usd']}/mo @ {econ['classical_ml']['latency_ms']}ms
- LLM Only:     \${econ['llm_only']['monthly_usd']}/mo @ {econ['llm_only']['latency_ms']}ms
- Hybrid (15%): \${econ['hybrid_router']['monthly_usd']}/mo (ประหยัด {econ['hybrid_router']['savings_vs_llm_pct']}%)
"""
print(memo.strip())`,
        },
        output: `# Phase 2 Trade-off Memo: Thai Ticket Priority Pipeline
- Readiness Score: 100.0% (Ready for Phase 3: True)
- Classical ML: $0.02/mo @ 2.0ms
- LLM Only:     $100.0/mo @ 800.0ms
- Hybrid (15%): $15.02/mo (ประหยัด 85.0%)`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยตอนคำนวณ Hybrid Latency: ในโหมด Hybrid ที่ส่ง 15% ไป LLM เคสที่ผ่าน Classical ML (85%) จะได้คำตอบใน `2ms` จริง แต่ **P95 ของทั้งระบบรวม** จะตกอยู่ในกลุ่ม 15% ที่เรียก LLM (คือ ~800ms)! ดังนั้นใน Engineering Memo ต้องแยกให้ชัดระหว่าง **Weighted Average Latency (~122ms)** กับ **Fast-Path P95 (<5ms สำหรับ 85% ของทิกเก็ต)** และ **Slow-Path P95 (~800ms สำหรับเคสที่ escalate)**",
  },

  practice: {
    intro:
      "โจทย์ Checkpoint (15 นาที): สร้างโมดูล `phase2_checkpoint.py` ที่คำนวณเศรษฐศาสตร์ Classical ML vs LLM vs Hybrid, ตรวจความพร้อม Phase 2 Portfolio Milestone 5 เกณฑ์ และสร้างไฟล์ Markdown Engineering Memo 1 หน้าอัตโนมัติ",
    requirements: [
      "ประกาศ `Phase2Metrics(BaseModel)` มีฟิลด์ `no_leakage_pipeline: bool`, `val_f1: float` (`0.0..1.0`), `p95_ms: float` (`>= 0.0`), `export_parity_ok: bool`, `tests_passed: bool` และ `Phase2AuditReport(BaseModel)` มี `score_pct: float`, `ready_for_phase3: bool`, `failed_gates: list[str]`",
      "`estimate_monthly_economics(monthly_tickets: int, ml_p95_ms: float = 2.0, llm_p95_ms: float = 800.0, ml_cost_per_100k: float = 0.01, llm_cost_per_100k: float = 50.0, hybrid_llm_ratio: float = 0.15) -> dict`: ตรวจว่า `monthly_tickets > 0` และ `0.0 <= hybrid_llm_ratio <= 1.0` (มิฉะนั้นโยน `ValueError`), คำนวณค่าใช้จ่ายรายเดือน (ปัด 2 ตำแหน่ง) และ latency ของ `classical_ml`, `llm_only`, `hybrid_router` พร้อม `savings_vs_llm_pct` (ปัด 1 ตำแหน่ง)",
      "`audit_phase2_milestone(metrics: Phase2Metrics, min_f1: float = 0.80, max_p95_ms: float = 10.0) -> Phase2AuditReport`: ตรวจ 5 เกณฑ์ ได้แก่ `no_leakage_pipeline`, `f1_gate` (`val_f1 >= min_f1`), `latency_gate` (`p95_ms < max_p95_ms`), `export_parity` และ `tests_passed` คืน `Phase2AuditReport` โดย `failed_gates` เก็บชื่อเกณฑ์ที่ตกเรียงตามลำดับคงที่",
      "`render_tradeoff_memo(project_name: str, economics: dict, audit: Phase2AuditReport) -> str`: สร้างสตริง Markdown ที่มีชื่อโปรเจกต์, สถานะ `Ready for Phase 3`, ตารางเทียบ `Classical ML` / `LLM Only` / `Hybrid Router` และเปอร์เซ็นต์ที่ประหยัดได้",
    ],
    starter: {
      language: "python",
      filename: "phase2_checkpoint.py",
      code: `from pydantic import BaseModel, Field


class Phase2Metrics(BaseModel):
    no_leakage_pipeline: bool
    val_f1: float = Field(ge=0.0, le=1.0)
    p95_ms: float = Field(ge=0.0)
    export_parity_ok: bool
    tests_passed: bool


class Phase2AuditReport(BaseModel):
    score_pct: float = Field(ge=0.0, le=100.0)
    ready_for_phase3: bool
    failed_gates: list[str]


def estimate_monthly_economics(
    monthly_tickets: int,
    ml_p95_ms: float = 2.0,
    llm_p95_ms: float = 800.0,
    ml_cost_per_100k: float = 0.01,
    llm_cost_per_100k: float = 50.0,
    hybrid_llm_ratio: float = 0.15,
) -> dict[str, dict[str, float]]:
    """คำนวณต้นทุนรายเดือนและ latency สำหรับ Classical ML, LLM Only และ Hybrid Router"""
    # TODO: validate inputs & compute economics
    raise NotImplementedError


def audit_phase2_milestone(
    metrics: Phase2Metrics,
    min_f1: float = 0.80,
    max_p95_ms: float = 10.0,
) -> Phase2AuditReport:
    """ตรวจ 5 Quality Gates ของ Phase 2 Portfolio Milestone"""
    # TODO: evaluate 5 gates and return Phase2AuditReport
    raise NotImplementedError


def render_tradeoff_memo(
    project_name: str,
    economics: dict[str, dict[str, float]],
    audit: Phase2AuditReport,
) -> str:
    """สร้าง 1-page Engineering Trade-off Memo ในรูปแบบ Markdown"""
    # TODO: format clean markdown memo with table and readiness summary
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_phase2_checkpoint.py",
      code: `import pytest
from phase2_checkpoint import (
    Phase2Metrics,
    audit_phase2_milestone,
    estimate_monthly_economics,
    render_tradeoff_memo,
)


def test_estimate_monthly_economics_and_validation():
    econ = estimate_monthly_economics(monthly_tickets=100_000, hybrid_llm_ratio=0.15)
    assert econ["classical_ml"]["monthly_usd"] == pytest.approx(0.01)
    assert econ["llm_only"]["monthly_usd"] == pytest.approx(50.0)
    assert econ["hybrid_router"]["monthly_usd"] == pytest.approx(7.51)
    assert econ["hybrid_router"]["savings_vs_llm_pct"] == pytest.approx(85.0)
    assert econ["classical_ml"]["latency_ms"] < 10.0

    with pytest.raises(ValueError):
        estimate_monthly_economics(monthly_tickets=0)
    with pytest.raises(ValueError):
        estimate_monthly_economics(monthly_tickets=1000, hybrid_llm_ratio=1.5)


def test_audit_phase2_milestone_pass_and_partial_fail():
    good = Phase2Metrics(
        no_leakage_pipeline=True,
        val_f1=0.86,
        p95_ms=2.4,
        export_parity_ok=True,
        tests_passed=True,
    )
    report = audit_phase2_milestone(good)
    assert report.ready_for_phase3 is True
    assert report.score_pct == 100.0
    assert report.failed_gates == []

    weak = Phase2Metrics(
        no_leakage_pipeline=True,
        val_f1=0.72,
        p95_ms=14.5,
        export_parity_ok=True,
        tests_passed=False,
    )
    report2 = audit_phase2_milestone(weak)
    assert report2.ready_for_phase3 is False
    assert report2.score_pct == 40.0
    assert report2.failed_gates == ["f1_gate", "latency_gate", "tests_passed"]


def test_render_tradeoff_memo_contains_required_sections():
    econ = estimate_monthly_economics(monthly_tickets=100_000)
    audit = audit_phase2_milestone(
        Phase2Metrics(
            no_leakage_pipeline=True,
            val_f1=0.88,
            p95_ms=1.9,
            export_parity_ok=True,
            tests_passed=True,
        )
    )
    memo = render_tradeoff_memo("Thai Ticket Priority ML Pipeline", econ, audit)
    assert "Thai Ticket Priority ML Pipeline" in memo
    assert "Classical ML" in memo
    assert "LLM Only" in memo
    assert "Hybrid Router" in memo
    assert "85.0%" in memo
    assert "Ready for Phase 3: True" in memo
`,
    },
    selfCheck: [
      "`estimate_monthly_economics` ปฏิเสธ `monthly_tickets <= 0` หรือ `hybrid_llm_ratio` นอกช่วง `[0, 1]` ด้วย `ValueError`",
      "ตัวเลข `hybrid_router` สำหรับ 100,000 ทิกเก็ต (`ratio=0.15`) ได้ `$7.51` และประหยัด `85.0%` เทียบกับ LLM Only",
      "`audit_phase2_milestone` คืนชื่อ `failed_gates` ตรงตามลำดับเมื่อมีเกณฑ์ที่ไม่ผ่าน และคืน `score_pct == 100.0` เมื่อครบทั้ง 5 เกณฑ์",
      "`render_tradeoff_memo` สร้าง Markdown ที่อ่านง่ายและมีตัวเลขครบทั้ง 3 แนวทางพร้อมสถานะ `Ready for Phase 3`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance:
      "ผ่านทั้ง 3 test functions ใน `test_phase2_checkpoint.py` ด้วย `uv run pytest -q` และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "ใน `estimate_monthly_economics` คิด `units = monthly_tickets / 100_000.0`, `ml_cost = units * ml_cost_per_100k`, `llm_cost = units * llm_cost_per_100k`, `hybrid_cost = ml_cost + (units * hybrid_llm_ratio * llm_cost_per_100k)`",
      },
      {
        body: "ใน `audit_phase2_milestone` เก็บเกณฑ์เป็นลิสต์ของ tuple `(gate_name, passed_bool)` 5 ตัวตามลำดับ เพื่อให้ `failed_gates` มีลำดับคงที่เสมอ",
      },
      {
        body: "โครงของ `audit_phase2_milestone` และ `render_tradeoff_memo` พร้อมแล้ว เหลือเติม `estimate_monthly_economics`:",
        code: {
          language: "python",
          filename: "hint_day60.py",
          code: `def audit_phase2_milestone(
    metrics: Phase2Metrics,
    min_f1: float = 0.80,
    max_p95_ms: float = 10.0,
) -> Phase2AuditReport:
    gates = [
        ("no_leakage_pipeline", metrics.no_leakage_pipeline),
        ("f1_gate", metrics.val_f1 >= min_f1),
        ("latency_gate", metrics.p95_ms < max_p95_ms),
        ("export_parity", metrics.export_parity_ok),
        ("tests_passed", metrics.tests_passed),
    ]
    failed = [name for name, ok in gates if not ok]
    passed = len(gates) - len(failed)
    return Phase2AuditReport(
        score_pct=round((passed / len(gates)) * 100.0, 1),
        ready_for_phase3=len(failed) == 0,
        failed_gates=failed,
    )


def render_tradeoff_memo(
    project_name: str,
    economics: dict[str, dict[str, float]],
    audit: Phase2AuditReport,
) -> str:
    ml = economics["classical_ml"]
    llm = economics["llm_only"]
    hyb = economics["hybrid_router"]
    return (
        f"# Engineering Trade-off Memo: {project_name}\\n\\n"
        f"- Readiness Score: {audit.score_pct}% | Ready for Phase 3: {audit.ready_for_phase3}\\n\\n"
        "| Architecture | Est. Monthly Cost (USD) | Latency (ms) |\\n"
        "|---|---:|---:|\\n"
        f"| Classical ML | \${ml['monthly_usd']:.2f} | {ml['latency_ms']:.2f} |\\n"
        f"| LLM Only | \${llm['monthly_usd']:.2f} | {llm['latency_ms']:.2f} |\\n"
        f"| Hybrid Router | \${hyb['monthly_usd']:.2f} | {hyb['latency_ms']:.2f} |\\n\\n"
        f"Hybrid Router ประหยัดต้นทุน {hyb['savings_vs_llm_pct']:.1f}% เทียบกับ LLM Only\\n"
    )`,
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
      title: "วัดความสำเร็จของโมเดลข้อมูลไม่สมดุลด้วย Accuracy เพียงอย่างเดียว",
      symptom: "ทิกเก็ตเร่งด่วนมีแค่ 5% โมเดลทาย 'ปกติ' ทั้งหมดได้ Accuracy 95% แต่ Recall = 0% ทำลูกค้าหลุด SLA ทุกราย",
      fix: "รายงาน `Precision`, `Recall`, `F1` และ `PR-AUC` เสมอ พร้อมเลือก threshold จากต้นทุนธุรกิจ (FP vs FN)",
    },
    {
      title: "ใช้ LLM แทน Classical ML โดยไม่คำนวณ Latency, ต้นทุน และ Thai Token Tax",
      symptom: "ระบบคัดกรองทิกเก็ตแสนใบต่อเดือนช้าลงกว่า 100 เท่าและบิลค่า API พุ่งสูงโดยที่ F1 ต่างจาก Classical ML แค่ 1–2%",
      fix: "ทำ Classical ML Baseline (`< 10ms`) ก่อนเสมอ แล้วใช้ Hybrid Confidence Routing ส่งเฉพาะเคสกำกวมขึ้น LLM",
    },
    {
      title: "ลืมแยก Weighted Average Latency กับ Tail P95 ในสถาปัตยกรรม Hybrid",
      symptom: "เขียนใน Memo ว่า Hybrid มี P95 อยู่ที่ 120ms ทั้งที่เมื่อส่ง 15% ไป LLM (800ms) ตัว P95 จริงจะตกอยู่ในกลุ่ม 15% นั้น",
      fix: "รายงานแยกให้ชัดระหว่าง Fast-Path P95 (`< 5ms` สำหรับ 85% ของคำขอ), Slow-Path P95 (`~800ms`) และ Weighted Average Latency",
    },
    {
      title: "ปล่อยโปรเจกต์ Phase 2 ทิ้งไว้โดยไม่บันทึก Baseline Metrics สำหรับเทียบใน Phase 3",
      symptom: "พอถึง Phase 3 (Day 92) ไม่รู้ว่า LLM Extractor ดีกว่าหรือคุ้มกว่า Classical ML เดิมแค่ไหน",
      fix: "บันทึก `MEMO.md` ที่มี F1, PR-AUC, P95 latency และต้นทุน/100k ของ Phase 2 ไว้ใน repo เพื่อเทียบตรงกับ Phase 3",
    },
  ],

  quiz: {
    intro:
      "Phase 2 Cumulative Quiz (4 ข้อ ครอบคลุม Block B09–B15) — ทดสอบความแม่นยำจากการเชื่อมโยง Data, Math Intuition, Classical ML, Thai NLP และ System Trade-offs ก่อนขึ้น Phase 3",
    questions: [
      mc(
        "d060-q1",
        "[B09–B10] ข้อใดจับคู่หลักการของ **Polars Lazy Mode** และ **Cosine Similarity** ได้ถูกต้องทั้งหมด?",
        [
          ["Polars Lazy อ่านทั้งไฟล์เข้า RAM ก่อนค่อยกรอง; Cosine Similarity ขึ้นกับความยาว (norm) ของเวกเตอร์", "ผิดทั้งสองส่วน — Lazy ทำ pushdown ก่อนอ่าน และ Cosine วัดเฉพาะมุม (ไม่ขึ้นกับความยาว)"],
          ["Polars Lazy ทำ Predicate & Projection Pushdown ก่อน `.collect()`; เมื่อเวกเตอร์ผ่าน L2-normalization แล้ว Dot Product จะเท่ากับ Cosine Similarity พอดี", "ถูก — นี่คือแก่นของทั้ง B09 (Polars) และ B10 (NumPy Vectors)"],
          ["Polars Lazy ใช้ได้เฉพาะไฟล์ JSONL; Cosine Similarity ใช้ได้เฉพาะข้อมูล 2 มิติ", "ผิด — Polars รองรับ CSV/Parquet/NDJSON และ Cosine ใช้ได้ทุกมิติ (เช่น 768 หรือ 1536 มิติของ embeddings)"],
          ["DuckDB ต้องโหลดข้อมูลทั้งหมดเข้า Python list ก่อน query; Euclidean Distance ดีกว่า Cosine เสมอสำหรับข้อความ", "ผิด — DuckDB สแกน Parquet/CSV ตรง ๆ และข้อความนิยมใช้ Cosine เพื่อไม่ให้เอกสารยาวได้เปรียบ"],
        ],
        "B",
        "Polars Lazy ช่วยลด RAM/I/O ผ่าน Pushdown และความรู้เรื่อง L2-normalized Dot Product = Cosine Similarity จะถูกใช้ตรง ๆ กับ Dense Embeddings ใน Phase 3–4",
        "เมื่อเวกเตอร์ผ่าน L2 normalization แล้ว (`||u|| = ||v|| = 1`) การคำนวณ Cosine Similarity ลดรูปเหลืออะไร?",
        "ลดรูปเหลือเพียง Dot Product (`u @ v`) โดยตรง ทำให้ค้นหาความคล้ายบนเมทริกซ์ขนาดใหญ่ด้วย NumPy/Vector DB ทำได้เร็วมาก",
      ),
      mc(
        "d060-q2",
        "[B11–B12] ในโจทย์คัดกรองทิกเก็ตเร่งด่วนที่มีเคสด่วนเพียง **4%** ของข้อมูลทั้งหมด และต้นทุนของการพลาดเคสด่วน (FN) สูงกว่าการเตือนผิด (FP) ถึง **10 เท่า** แนวทางใดถูกต้อง?",
        [
          ["ทำ `TfidfVectorizer.fit_transform` บนข้อมูลทั้งหมดก่อนแบ่ง Train/Test แล้วเลือกโมเดลที่ Accuracy สูงสุด", "ผิดสองจุด: เกิด Data Leakage และ Accuracy บนข้อมูลไม่สมดุล 4% หลอกตา"],
          ["แยก Train/Val/Test แบบ Stratified ก่อน, ห่อ preprocessing ใน `Pipeline`, ประเมินด้วย `PR-AUC` / `F1` และปรับ threshold ลงต่ำกว่า 0.5 ตาม Expected Value เพื่อลด FN", "ถูก — ป้องกัน Data Leakage, ใช้ metric ตรงกับ imbalanced data และจูน threshold ตามต้นทุนธุรกิจ"],
          ["ใช้ `RMSE` และ `MAE` เป็นตัวชี้วัดหลักของ classification", "ผิด — MAE/RMSE เป็น metric ของงาน Regression ไม่ใช่ Classification"],
          ["ลบทิกเก็ตปกติออก 95% จาก Test Set เพื่อให้ Test Set สมดุล 50/50", "ผิด — Test Set ต้องคงสัดส่วนจริงของโลก production เสมอ"],
        ],
        "B",
        "สำหรับ imbalanced classification ที่ FN แพงกว่า FP มาก ต้องป้องกัน leakage ด้วย `Pipeline`, วัดผลด้วย PR-AUC/Precision-Recall และปรับ decision threshold ตามต้นทุนธุรกิจ",
        "เมื่อข้อมูลมีคลาสบวกเพียง 4% และ FN แพงกว่า FP 10 เท่า ควรใช้ metric ใดและปรับ threshold ไปทางไหน?",
        "ใช้ PR-AUC, Precision, Recall, F1 (ไม่ใช้ Accuracy) และปรับ threshold ลงต่ำกว่า 0.5 ตาม Expected Value เพื่อเพิ่ม Recall และลด FN",
      ),
      mc(
        "d060-q3",
        "[B13–B14] ข้อใดคือชุดแนวปฏิบัติที่ถูกต้องสำหรับ **Thai NLP Pipeline** และ **Production ML Operations**?",
        [
          ["ใช้ default whitespace tokenizer ของ `TfidfVectorizer` กับภาษาไทย และไม่จำเป็นต้องตรวจ Feature Drift หลัง deploy", "ผิดทั้งสองจุด — ภาษาไทยต้องตัดคำด้วย PyThaiNLP และต้องเฝ้า Feature Drift"],
          ["ตัดคำไทยด้วย `PyThaiNLP newmm` + `dict_trie(set(thai_words()) | domain_words)`, จูนโมเดลด้วย Cross-Validation, Export ด้วย `joblib`/`ONNX` พร้อมตรวจ `np.allclose` parity และเฝ้า Feature Drift", "ถูก — ครอบคลุมครบทุกเสาหลักของ B13–B14"],
          ["สร้าง `dict_trie` ใหม่ทุกรอบในลูปทีละประโยค และทำ Error Analysis บน Test Set", "ผิด — สร้าง Trie ในลูปจะช้ามาก และห้ามทำ Error Analysis บน Test Set"],
          ["ใช้ LLM แทนการตัดคำ `newmm` ในทุกคำขอเพื่อให้ได้ latency ต่ำกว่า 1ms", "ผิด — LLM API มี latency ระดับหลายร้อยมิลลิวินาที ไม่ใช่ < 1ms"],
        ],
        "B",
        "การผสม `PyThaiNLP newmm` + Custom Dict (สร้าง Trie ครั้งเดียว) + CV + Export Parity + Drift Monitoring คือสูตรมาตรฐานของ Classical ML ภาษาไทยใน production",
        "4 เสาหลักของ Thai NLP + Production ML ใน Block B13–B14 คืออะไร?",
        "1) `PyThaiNLP newmm` + Custom Dict, 2) Stratified CV ไม่ให้ overfit, 3) Export (`joblib`/ONNX) + `np.allclose` parity, 4) Data/Model Card + Feature Drift Monitoring",
      ),
      mc(
        "d060-q4",
        "[B15] บริษัทมีทิกเก็ตภาษาไทย **200,000 ใบ/เดือน** ต้องการคัดกรองความเร่งด่วนแบบ real-time โดยมีงบค่า API จำกัด แต่มีเคสประชด/กำกวมราว **15%** ที่โมเดล Classical ML มั่นใจต่ำ สถาปัตยกรรมใดเหมาะสมที่สุด?",
        [
          ["ส่งทั้ง 200,000 ทิกเก็ตให้ Frontier LLM API ทุกใบ", "แพงและช้าเกินจำเป็น (~$100/เดือน และ ~800ms ทุกใบ)"],
          ["ใช้ Classical ML เป็นด่านแรก (`< 10ms`) ตัดสินใจเคสที่มั่นใจสูง (~85%) ทันที และส่งเฉพาะเคสกำกวม (~15%) ให้ LLM ช่วยวิเคราะห์ (Hybrid Confidence Routing)", "ถูก — ลดต้นทุน API ลง ~85% คงความเร็ว <10ms สำหรับลูกค้าส่วนใหญ่ และได้ความแม่นยำสูงในเคสยาก"],
          ["เลิกใช้โมเดลทั้งหมดแล้วให้พนักงานอ่านมือทีละใบ", "ไม่สเกลที่ 200,000 ใบ/เดือน"],
          ["ใช้ Classical ML โดยไม่ทำ Error Analysis และไม่เขียน Behavioral Tests", "เสี่ยงเกิด silent regression และพลาดเคสศัพท์ใหม่"],
        ],
        "B",
        "Hybrid Routing ผสานจุดแข็งของทั้งสองโลก: ความเร็ว `< 10ms` และต้นทุนเกือบศูนย์ของ Classical ML กับความเข้าใจบริบทซับซ้อนของ LLM",
        "สถาปัตยกรรม Hybrid Confidence Routing (ML + LLM) ทำงานอย่างไรและได้ประโยชน์อะไร?",
        "ให้ Classical ML ตัดสินใจเคสที่มั่นใจสูง (~85%) ใน <10ms และส่งเฉพาะเคสกำกวม (~15%) ไปให้ LLM ช่วยตัดสิน ลดค่า API ~85% โดยยังคงความแม่นยำสูงสุด",
      ),
    ],
  },

  takeaways: [
    "ยินดีด้วยที่จบ **Phase 2 (Data, Math Intuition & Classical ML)** ครบทั้ง 28 วัน — คุณพร้อมส่งมอบ Portfolio Milestone #2 (`Thai Ticket Priority ML Pipeline`) แล้ว",
    "วิศวกร AI เลือกเครื่องมือจากตัวเลขจริง: **Classical ML** ชนะขาดเรื่องความเร็ว (`< 10ms`) และต้นทุน (`~$0.01/100k`) ส่วน **LLM** เด่นเรื่องบริบทซับซ้อน/zero-shot — และ **Hybrid Routing** รวมข้อดีทั้งสองฝั่งเข้าด้วยกัน",
    "เก็บตัวเลข Baseline ของ Phase 2 (F1, PR-AUC, P95 latency, Cost/100k) ไว้ใน `MEMO.md` เพื่อเทียบตรงกับระบบ LLM ใน Phase 3 (Day 92)",
    "วันพรุ่งนี้ (Day 61) เราเปิดฉาก **Phase 3: Neural Nets, Embeddings & Core LLM** ด้วย PyTorch Tensors & Autograd โดยต่อยอดตรงจากความรู้เวกเตอร์และสถิติของ Phase 2",
  ],

  reviewCards: [
    rc(
      "d060-rc-1",
      "เทียบตัวเลขโดยประมาณของ Classical ML vs LLM API บนงานจัดหมวดทิกเก็ตภาษาไทย (Latency, Cost/100k, จุดแข็ง)?",
      "Classical ML: <10ms P95, ~$0.01/100k, offline/PDPA-friendly เหมาะกับปริมาณสูงที่มี label; LLM API: ~800ms P95, ~$5–$50/100k (ไทยใช้ token 1.5x–3x มากกว่าอังกฤษ) เหมาะกับ zero-shot, คำประชด และ extraction ซับซ้อน",
    ),
    rc(
      "d060-rc-2",
      "เกณฑ์ตรวจความพร้อม 6 ด้านของ Phase 2 Portfolio Milestone (`Thai Ticket Priority ML Pipeline`) มีอะไรบ้าง?",
      "1) Polars/DuckDB Data Hygiene, 2) Zero Data Leakage & Stratified CV, 3) PyThaiNLP Custom Dict & Error Analysis, 4) PR-AUC/F1 & Threshold Tuning, 5) Export Parity (`np.allclose`) & P95 < 10ms, 6) Reproducible ML Tests & Drift Baseline",
    ),
    rc(
      "d060-rc-3",
      "เหตุใดในสถาปัตยกรรม Hybrid Routing (85% ML + 15% LLM) จึงต้องแยกรายงาน Fast-Path P95 กับ Weighted Average Latency?",
      "เพราะลูกค้า 85% ได้คำตอบภายใน <5ms (Fast-Path) แต่ตัวเลข P95 รวมทั้งระบบจะตกอยู่ในกลุ่ม 15% ที่เรียก LLM (~800ms) การแยก Fast-Path / Slow-Path / Weighted Average ทำให้สื่อสาร SLA ได้ถูกต้องไม่เข้าใจผิด",
    ),
  ],

  sources: [
    {
      label: "Google Developers — Rules of Machine Learning (Best Practices for ML Engineering)",
      href: "https://developers.google.com/machine-learning/guides/rules-of-ml",
    },
    {
      label: "scikit-learn User Guide — Common Pitfalls & Recommended Practices",
      href: "https://scikit-learn.org/stable/common_pitfalls.html",
    },
    {
      label: "Polars User Guide — Official Documentation",
      href: "https://docs.pola.rs/",
    },
    {
      label: "PyTorch Tutorials — Learn the Basics (Preview for Phase 3 Day 61)",
      href: "https://pytorch.org/tutorials/beginner/basics/intro.html",
    },
  ],

  glossary: [
    "polars",
    "duckdb",
    "cosine-similarity",
    "data-leakage",
    "precision-recall",
    "pythainlp",
    "onnx",
    "llm",
  ],
});
