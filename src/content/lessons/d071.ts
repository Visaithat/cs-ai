import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D071 — Phase 3 / Block B18
 * Choosing Embedding Models (Dimensions, Context Limit, Thai Quality, Cost)
 */
export const d071: Lesson = defineLesson({
  day: 71,
  titleTh: "เกณฑ์เลือก Embedding Model: มิติ (RAM), Context Limit ภาษาไทย และต้นทุน",
  tagline: "30 นาที · รันบน CPU 100% · คำนวณ RAM ดัชนี 1M Chunks, ลดมิติด้วย Matryoshka และดักกับดัก Silent Truncation ของภาษาไทย",
  icon: "scale",
  visual: {
    id: "embedding-model-tradeoff",
    title: "เกณฑ์เลือก Embedding Model — มิติ (RAM), Context, คุณภาพภาษาไทย & ต้นทุน",
    caption: "คลิกเทียบ 3 โมเดล (Local 384-d vs Multilingual 1024-d vs Hosted 1536-d) พร้อมคำนวณขนาด Index สำหรับ 1M Chunks",
    alt: "แผนภาพเปรียบเทียบโมเดล Embedding ด้านมิติ ความยาวบริบท คุณภาพภาษาไทย และต้นทุน",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบน CPU ของเครื่องคุณ 100% — วิเคราะห์ trade-off และคำนวณต้นทุนด้วย Python + NumPy",
  tools: ["Sentence-Transformers", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "เปลี่ยนการเลือกโมเดลจาก \"ตามกระแส\" เป็น \"เกณฑ์วิศวกรรม 4 แกน\"",
      body: "โมเดล {{embedding}} ที่ติดอันดับ 1 บนตารางภาษาอังกฤษอาจทำงานแย่บนภาษาไทย หรือกิน RAM เกินงบเซิร์ฟเวอร์ การเลือกต้องชั่ง 4 แกนพร้อมกัน: คุณภาพภาษาไทย, มิติ/RAM, Context Limit และต้นทุน/PDPA",
      lessonNote: "วันนี้เราสร้างสูตรคำนวณ RAM, ตัวตรวจความเสี่ยงตัดข้อความ และตารางตัดสินใจสำหรับงานจริง",
    },
    {
      node: 1,
      heading: "ดักกับดัก Silent Truncation บนเอกสารภาษาไทยก่อนเข้าดัชนี",
      body: "จาก Day 66 เรารู้ว่าภาษาไทยใช้ token มากกว่าอังกฤษ 1.5–3 เท่าบน {{bpe-tokenizer}} หลายตัว หากส่งย่อหน้าไทยยาว 900 tokens เข้าโมเดลที่รับได้แค่ `512` tokens เนื้อหาครึ่งหลังจะถูกตัดทิ้งเงียบ ๆ โดยไม่มี error",
      lessonNote: "เราจะเขียนตัวตรวจสอบอัตราการถูกตัดข้อความ (truncation rate) เพื่อตัดสินใจเลือก {{chunking}} หรือขยับไปใช้โมเดลบริบทยาวอย่าง `BAAI/bge-m3`",
    },
    {
      node: 2,
      heading: "คุม RAM ด้วยสูตร `N × D × 4 bytes`, Matryoshka และ Quantization",
      body: "เวกเตอร์ `1536` มิติ 1 ล้านชิ้นกิน RAM ดิบเกือบ 6 GB (และ ~9 GB เมื่อรวมโครงสร้าง {{hnsw}}) แต่การใช้ Matryoshka dimension reduction หรือ {{quantization}} ช่วยลดหน่วยความจำได้ 3–6 เท่าโดยที่ {{mrr}} แทบไม่ตก",
      lessonNote: "เราจะลงมือเขียนฟังก์ชันตัดมิติ Matryoshka + L2 re-normalize ด้วย NumPy และตรวจสอบค่าความจำจริง",
    },
    {
      node: 5,
      heading: "วางแผนต้นทุนและข้อจำกัดข้อมูลระหว่าง Local กับ Hosted API",
      body: "Hosted API ติดตั้งไวและคิดเงินตามจำนวน token แต่ต้องส่งข้อความออกนอกองค์กร ส่วน Local open-weights มีค่า API เป็นศูนย์และเป็นมิตรกับ PDPA แต่ต้องบริหาร CPU/GPU และอัปเดตดัชนีเอง",
      lessonNote: "แบบฝึกหัดวันนี้ให้คุณสร้างเครื่องมือคำนวณ RAM และตัวแนะนำ tier โมเดลแบบอัตโนมัติพร้อมชุดเทสต์ `pytest`",
    },
  ],

  objectives: [
    "**คำนวณ** ขนาดหน่วยความจำของดัชนีเวกเตอร์ได้แม่นยำด้วยสูตร `N × D × bytes × index_overhead` สำหรับ FP32, FP16 และ int8 {{quantization}}",
    "**ประยุกต์ใช้** Matryoshka Representation Learning (ตัดมิติส่วนหน้า + L2 re-normalize) และตรวจสอบความเสี่ยง **Silent Truncation** จาก `max_seq_length` ของข้อความภาษาไทย",
    "**ตัดสินใจ** เลือก Embedding Model อย่างเป็นระบบจาก MTEB Multilingual/Thai benchmarks, ความยาวเอกสาร, ข้อกำหนด PDPA และงบประมาณระหว่าง Local กับ Hosted API",
  ],

  prerequisites: [
    "Dense Text Embeddings และ L2 Normalization (Days 69–70)",
    "ทำไมภาษาไทยใช้จำนวน token มากกว่าภาษาอังกฤษ 1.5–3 เท่าบน {{bpe-tokenizer}} (Day 66)",
    "Python, NumPy และ `pytest`",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ `uv` เบา ๆ ด้วย `numpy` และ `pytest` สำหรับคำนวณ RAM, ทดลอง Matryoshka truncation และวิเคราะห์ความเสี่ยงการตัดคำภาษาไทย",
    commands: `uv init ai-day71 && cd ai-day71
uv add numpy
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('NumPy:', np.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day71` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `numpy`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "ทดสอบรัน Python + NumPy สำเร็จพร้อมคำนวณ Trade-off"],
    ],
  },

  concepts: [
    {
      id: "vector-memory-and-matryoshka",
      title: "1 · สูตรคำนวณ RAM (`N × D × 4 bytes`) และ Matryoshka Dimension Reduction",
      paragraphs: [
        "ตัวเลขมิติของ {{embedding}} (`D`) ไม่ใช่แค่รายละเอียดทางเทคนิค แต่เป็นตัวคูณตรงของค่าเช่า RAM และความเร็วค้นหา เวกเตอร์ 1 ชิ้นแบบ `float32` (4 bytes/ค่า) คูณกับจำนวน chunks (`N`) จะได้ขนาดดิบ **`Raw Bytes = N × D × 4`** และเมื่อเก็บในดัชนีกราฟอย่าง {{hnsw}} (ที่ต้องเก็บลิงก์เพื่อนบ้านเพิ่ม) หน่วยความจำจริงมักบวก overhead อีกราว **`1.5×`**",
        "ลองดูตัวเลขสำหรับคลังเอกสาร **1,000,000 chunks** (`float32` + 1.5× HNSW overhead): โมเดล 384-d ใช้ ~`2.15 GB`, โมเดล 1024-d ใช้ ~`5.72 GB`, ส่วนโมเดล 1536-d พุ่งไป ~`8.58 GB` — นั่นแปลว่ามิติที่ใหญ่ขึ้น 4 เท่า ทำให้ค่า RAM และเวลาโหลดดัชนีโตขึ้น 4 เท่าทันที",
        "ทางออกสมัยใหม่มี 2 แนวหลัก: (1) **Matryoshka Representation Learning (MRL)** ซึ่งเทรนให้ข้อมูลความหมายสำคัญที่สุดอัดแน่นอยู่ที่มิติส่วนหน้า คุณจึงสามารถหั่น `vecs[:, :512]` จากเวกเตอร์ 1536-d (ลด RAM 3×) แล้ว **L2 re-normalize ใหม่** โดยคุณภาพ {{mrr}}/Recall ลดลงไม่ถึง 1–2% และ (2) **Vector {{quantization}}** แปลง `float32` (4 bytes) เป็น `float16` (2 bytes) หรือ `int8` (1 byte) เพื่อลด RAM อีก 2×–4×",
      ],
      analogy: "Matryoshka เหมือนตุ๊กตาแม่ลูกดกหรือภาพที่โหลดแบบ Progressive — แค่ดู 256 หรือ 512 มิติแรกก็เห็นภาพรวมชัดเกือบ 98% แล้ว ไม่จำเป็นต้องเก็บรายละเอียดครบ 1,536 มิติถ้าเซิร์ฟเวอร์มี RAM จำกัด",
      code: {
        language: "python",
        filename: "matryoshka_math.py",
        code: `import numpy as np


def estimate_ram_gb(n_chunks: int, dim: int, bytes_per_dim: int = 4, overhead: float = 1.5) -> float:
    return (n_chunks * dim * bytes_per_dim * overhead) / (1024 ** 3)


def truncate_matryoshka(unit_vecs: np.ndarray, target_dim: int) -> np.ndarray:
    sliced = np.asarray(unit_vecs[:, :target_dim], dtype=np.float32)
    norms = np.linalg.norm(sliced, axis=1, keepdims=True)
    safe_norms = np.where(norms == 0.0, 1.0, norms)
    return (sliced / safe_norms).astype(np.float32)


for label, d, b in [("384-d FP32", 384, 4), ("1024-d FP32", 1024, 4), ("1536-d FP32", 1536, 4), ("512-d int8", 512, 1)]:
    print(f"1M chunks | {label:12s} -> {estimate_ram_gb(1_000_000, d, b):.2f} GB RAM (incl. 1.5x HNSW)")`,
        caption: "ห้ามลืม L2 re-normalize หลังหั่นมิติ Matryoshka เพราะความยาวเวกเตอร์หลังตัดจะน้อยกว่า `1.0` เสมอ",
      },
      whyTitle: "Why this matters — วางแผนงบ Infrastructure ได้ตั้งแต่วันออกแบบ",
      whyParagraphs: [
        "ทีมที่เลือกโมเดล 3072-d โดยไม่คำนวณ RAM ล่วงหน้า มักเจอปัญหา Out-of-Memory (OOM) ตอนนำเข้าเอกสารจริงหลายแสนหน้า และต้องเสียเวลา re-embed คลังเอกสารทั้งหมดใหม่",
        "แค่คูณ `N × D × bytes × overhead` บนกระดาษก่อนเริ่มโปรเจกต์ คุณจะรู้ได้ทันทีว่าต้องใช้เครื่องกี่ GB หรือควรใช้ Matryoshka / int8 ตั้งแต่ต้น",
      ],
    },
    {
      id: "thai-truncation-trap",
      title: "2 · กับดัก `max_seq_length` (Silent Truncation) บนข้อความภาษาไทย",
      paragraphs: [
        "ความลับที่ทำเอาหลายคนเสียเวลาดีบัก {{rag}} เป็นสัปดาห์คือ **โมเดล Embedding แทบทุกตัวจะตัดข้อความที่ยาวเกิน `max_seq_length` ทิ้งเงียบ ๆ (Silent Truncation)** โดยไม่โยน exception เลย เช่น `intfloat/multilingual-e5-small` รับได้สูงสุด **`512` tokens** ส่วน `paraphrase-multilingual-MiniLM-L12-v2` รับได้เพียง **`128` tokens**!",
        "เมื่อรวมเข้ากับความจริงจาก Day 66 ที่ว่าภาษาไทยใช้จำนวน token บน {{bpe-tokenizer}} มากกว่าภาษาอังกฤษราว **1.5–3 เท่า** ข้อความไทยความยาวแค่ครึ่งหน้า A4 (~900–1,200 ตัวอักษร) อาจทะลุ `512` tokens ไปแล้วอย่างง่ายดาย — หากข้อยกเว้นเรื่อง *\"เงื่อนไขคืนเงิน\"* เขียนอยู่ท้ายย่อหน้า โมเดลจะไม่เคยเห็นประโยคนั้นเลยและค้นหาไม่เจอตลอดกาล",
        "วิธีแก้มี 2 ทางที่ต้องทำคู่กัน: (1) ทำ **Token-Aware {{chunking}}** (Phase 4) ตัดเอกสารให้แต่ละ chunk ยาวไม่เกิน ~60%–80% ของ `max_seq_length` ด้วย tokenizer ของโมเดลตัวนั้นจริง ๆ หรือ (2) เลือกโมเดลบริบทยาวอย่าง **`BAAI/bge-m3`** ที่รองรับสูงสุดถึง **`8,192` tokens**",
      ],
      analogy: "Silent Truncation เหมือนเครื่องแฟกซ์ที่รับกระดาษได้แค่ครึ่งแผ่นแล้วฉีกครึ่งล่างทิ้งโดยไม่ส่งเสียงเตือน — ผู้ส่งนึกว่าเอกสารถึงครบทั้งแผ่น แต่ข้อมูลสำคัญที่อยู่ท้ายหน้าหายสาบสูญไปแล้ว",
      bullets: [
        "**`multilingual-MiniLM-L12-v2`**: `128` tokens — สั้นมากสำหรับภาษาไทย เหมาะเฉพาะประโยคสั้น/หัวข้อ",
        "**`intfloat/multilingual-e5-small`**: `512` tokens — เร็วและดีมากสำหรับ FAQ/chunks ที่ตัดความยาวไว้เรียบร้อย",
        "**`BAAI/bge-m3`**: `8,192` tokens — รองรับเอกสารไทยยาว ๆ และ code-switching ได้ดีเยี่ยม แลกกับขนาดโมเดล ~2.2 GB และเวกเตอร์ `1024-d`",
      ],
      whyTitle: "Why this matters — เช็ก Token Count ของคลังไทยก่อนเลือกโมเดลเสมอ",
      whyParagraphs: [
        "ก่อน commit เลือกโมเดลใดก็ตาม ให้วัด P95 token length ของเอกสารไทยในระบบคุณเทียบกับ `model.max_seq_length` หากพบว่าเกิน 5% ของเอกสารยาวเกินขีดจำกัด คุณต้องปรับขนาด chunk หรือเปลี่ยนไปใช้โมเดลบริบทยาวทันที",
        "การตรวจเรื่องนี้ใช้เวลาเขียนโค้ดไม่ถึง 10 บรรทัด แต่ช่วยกันบั๊กค้นหาไม่เจอที่ลึกลับที่สุดในระบบ RAG",
      ],
    },
    {
      id: "mteb-thai-and-local-vs-hosted",
      title: "3 · อ่าน MTEB อย่างฉลาด และชั่งน้ำหนัก Local vs Hosted API",
      paragraphs: [
        "ตารางอันดับ **MTEB (Massive Text Embedding Benchmark)** เป็นจุดเริ่มต้นที่ดีในการคัดเลือกโมเดล 2–3 ตัวแรก แต่ข้อควรระวังคือคะแนนรวมบนหน้าแรกส่วนใหญ่ถูกถ่วงน้ำหนักด้วยภาษาอังกฤษ โมเดลที่ได้ที่ 1 ในอังกฤษอาจไม่รองรับภาษาไทยเลย! ให้เปิดแท็บ **Multilingual / Retrieval** และตรวจคะแนนบนชุดข้อมูลภาษาไทย (หรือภาษาเอเชียตะวันออกเฉียงใต้) เสมอ จากนั้นค่อยทำ A/B test บนคำถามจริงของบริษัทเรา (Day 72)",
        "เมื่อได้ตัวเต็งแล้ว ให้ตัดสินใจระหว่าง **Local Open-Weights** กับ **Hosted Embedding API** จาก 4 ปัจจัยหลัก: (1) **Data Privacy / PDPA**: ข้อมูลสัญญา HR หรือประวัติลูกค้าที่ห้ามออกนอกเครือข่ายต้องรัน Local, (2) **Latency & Ops**: Hosted API ไม่ต้องดูแลเครื่องเซิร์ฟเวอร์ แต่มี network round-trip และ rate limit, (3) **Cost at Scale**: หากต้อง re-embed เอกสารหลายล้านชิ้นบ่อย ๆ Local จะคุ้มกว่าในระยะยาว ส่วนงานเริ่มต้นไม่กี่หมื่น chunks API มักถูกแค่ไม่กี่สิบบาท, และ (4) **Re-indexing Lock-in**: จำไว้ว่า **เวกเตอร์จากคนละโมเดลเปรียบเทียบกันไม่ได้** — ถ้าเปลี่ยนโมเดลเมื่อไร ต้อง re-embed คลังเอกสารทั้ง 100% ใหม่เสมอ",
      ],
      analogy: "การเลือก Local vs Hosted API เหมือนเลือกระหว่างซื้อเครื่องพิมพ์ไว้ในออฟฟิศ (ปลอดภัยกับเอกสารลับ จ่ายค่าเครื่องครั้งเดียวแต่ต้องดูแลเอง) กับไปร้านถ่ายเอกสาร (ไม่ต้องดูแลเครื่อง จ่ายเป็นแผ่น แต่ต้องนำเอกสารออกไปนอกบริษัท)",
      bullets: [
        "**Local Compact (`multilingual-e5-small`, 384-d)**: ฟรีค่า API, รันบน CPU ได้ดี, ปลอดภัยตาม PDPA, จำกัด `512` tokens",
        "**Local Flagship (`BAAI/bge-m3`, 1024-d)**: ภาษาไทยและ code-switching แกร่งมาก, รองรับ `8,192` tokens, ใช้ RAM/เวลา compute สูงกว่า ~3–4×",
        "**Hosted API (`text-embedding-3-small`, Cohere `embed-v4`, 1024–1536-d)**: คุณภาพสูง + รองรับ Matryoshka, ไม่ต้องดูแล GPU/CPU เอง, มีค่าใช้จ่ายต่อล้าน token และส่งข้อมูลออกนอกองค์กร",
      ],
      whyTitle: "Why this matters — เก็บ `embedding_model_id` ไว้ใน Metadata ดัชนีเสมอ",
      whyParagraphs: [
        "เพราะเวกเตอร์จาก `e5-small` กับ `bge-m3` อยู่คนละพื้นที่พิกัดโดยสิ้นเชิง การเอาคำถามที่ encode ด้วยโมเดลใหม่ไปค้นหาในดัชนีของโมเดลเก่าจะพังทั้งระบบ",
        "มาตรฐานวิศวกรรมที่ดีคือติดป้าย `model_name`, `dimension`, และ `max_seq_length` ไว้กับทุกดัชนี และวางแผน pipeline ให้ re-index ใหม่ได้อัตโนมัติเมื่อถึงวันที่ต้องอัปเกรดโมเดล",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — การเลือก Embedding Model เหมือนการเลือก Database Schema & Hosting",
      body: [
        "การเปลี่ยน Embedding Model กลางคันเทียบได้กับการทำ **Full Database Migration** ที่ต้องแปลงข้อมูลทุกแถวใหม่ทั้งหมด (ไม่สามารถปนเวกเตอร์เก่ากับใหม่ในตารางเดียวกันได้) ดังนั้นการประเมิน RAM, ความยาวข้อมูล และ PDPA ก่อนเริ่มจึงคุ้มค่ามาก",
        "ส่วน Silent Truncation ที่ `512` tokens ก็คล้ายฐานข้อมูล MySQL โหมดเก่าที่แอบตัด string ยาวเกิน `VARCHAR(255)` ทิ้งเงียบ ๆ โดยไม่เตือน — ทางแก้คือ validate ความยาวก่อนบันทึกเสมอ",
      ],
      table: [
        ["`N × D × 4 × 1.5` RAM math", "Database capacity planning (rows × row_size × index factor)"],
        ["Silent Truncation (`max_seq_length`)", "Silent `VARCHAR` truncation โดยไม่โยน constraint error"],
        ["Matryoshka slicing (`[:, :512]`)", "Image thumbnail / adaptive resolution ตามแบนด์วิดท์"],
        ["Re-indexing on model change", "Full table backfill migration เมื่อเปลี่ยน hashing/encoding scheme"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมมิติที่มากกว่าถึงไม่ได้แปลว่าดีกว่าเสมอไป",
      body: [
        "มือใหม่มักคิดว่าโมเดล `1536` มิติต้องเก่งกว่า `384` มิติ 4 เท่าเสมอ ความจริงคือคุณภาพขึ้นอยู่กับ *ข้อมูลที่ใช้เทรน* (โดยเฉพาะสัดส่วนภาษาไทย) มากกว่าขนาดมิติเพียงอย่างเดียว",
        "โมเดล `384` มิติที่เทรนภาษาไทยมาดีอาจชนะโมเดล `1536` มิติที่เน้นภาษาอังกฤษได้ขาดลอย แถมยังใช้ RAM น้อยกว่า 4 เท่าและค้นหาเร็วกว่า 4 เท่าด้วย — นี่คือเหตุผลที่เราต้องวัดด้วยตัวเลขจริงใน Day 72",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ทีมกำลังออกแบบระบบค้นหาเอกสารกฎหมายและคู่มือภาษาไทยจำนวน 500,000 chunks บนเครื่อง RAM 8 GB เราจะคำนวณขนาดดัชนี, ทดลองหั่นมิติ Matryoshka, และตรวจอัตรา Silent Truncation ของเอกสารไทย",
    steps: [
      {
        title: "1 · เทียบขนาด RAM ของ 3 ตัวเลือกโมเดลสำหรับ 500,000 Chunks",
        explain: "คำนวณทั้งขนาดเวกเตอร์ดิบและขนาดจริงเมื่อรวม HNSW overhead `1.5×` เพื่อดูว่าตัวไหนลงเครื่อง RAM 8 GB ได้อย่างปลอดภัย",
        code: {
          language: "python",
          filename: "worked_day71.py",
          code: `def estimate_ram_mb(n_chunks: int, dim: int, dtype_bytes: int = 4, overhead: float = 1.5) -> float:
    return (n_chunks * dim * dtype_bytes * overhead) / (1024 ** 2)


candidates = [
    ("local-e5-small (384d FP32)", 384, 4),
    ("local-bge-m3 (1024d FP32)", 1024, 4),
    ("hosted-1536d (1536d FP32)", 1536, 4),
    ("hosted-MRL (512d FP16)", 512, 2),
]

for name, dim, b in candidates:
    mb = estimate_ram_mb(500_000, dim, dtype_bytes=b)
    print(f"{name:28s} -> {mb:7.1f} MB ({mb / 1024:.2f} GB)")`,
        },
        output: `local-e5-small (384d FP32)   ->  1098.6 MB (1.07 GB)
local-bge-m3 (1024d FP32)    ->  2929.7 MB (2.86 GB)
hosted-1536d (1536d FP32)    ->  4394.5 MB (4.29 GB)
hosted-MRL (512d FP16)       ->   732.4 MB (0.72 GB)`,
      },
      {
        title: "2 · ทดลอง Matryoshka Truncation + L2 Re-Normalization",
        explain: "จำลองเวกเตอร์ 1536-d ที่สาระสำคัญอยู่ช่วงต้นแล้วตัดเหลือ 256-d — สังเกตว่าก่อน re-normalize ค่า norm จะตกลงต่ำกว่า `1.0` จึงต้อง normalize ใหม่ทุกครั้งก่อนทำ {{cosine-similarity}} search",
        code: {
          language: "python",
          filename: "worked_day71.py",
          code: `import numpy as np

rng = np.random.default_rng(71)
raw = rng.normal(size=(3, 1536)).astype(np.float32)
unit_1536 = raw / np.linalg.norm(raw, axis=1, keepdims=True)

sliced_only = unit_1536[:, :256]
print("Norm right after slicing (WRONG if used as-is):", np.round(np.linalg.norm(sliced_only, axis=1), 4))

unit_256 = sliced_only / np.linalg.norm(sliced_only, axis=1, keepdims=True)
print("Norm after L2 re-normalize (READY):", np.round(np.linalg.norm(unit_256, axis=1), 4))
print("Memory reduction factor:", unit_1536.nbytes / unit_256.nbytes)`,
        },
        output: `Norm right after slicing (WRONG if used as-is): [0.3991 0.4126 0.4058]
Norm after L2 re-normalize (READY): [1. 1. 1.]
Memory reduction factor: 6.0`,
      },
      {
        title: "3 · ตรวจสอบอัตรา Silent Truncation ของเอกสารไทยเทียบกับ Limit 512 Tokens",
        explain: "ประมาณจำนวน token ของเอกสารไทยจากสถิติจริง (หรือใช้ tokenizer ของโมเดล) แล้วคำนวณว่ากี่เปอร์เซ็นต์ของคลังจะถูกตัดหางทิ้งหากใช้โมเดลลิมิต 512 tokens",
        code: {
          language: "python",
          filename: "worked_day71.py",
          code: `doc_token_counts = [180, 290, 410, 560, 740, 1120, 320, 495, 630, 210]

for limit in (128, 512, 8192):
    truncated = sum(1 for t in doc_token_counts if t > limit)
    pct = (truncated / len(doc_token_counts)) * 100
    print(f"max_seq_length={limit:4d} -> truncated {truncated:2d}/{len(doc_token_counts)} docs ({pct:5.1f}%)")`,
        },
        output: `max_seq_length= 128 -> truncated 10/10 docs (100.0%)
max_seq_length= 512 -> truncated  4/10 docs ( 40.0%)
max_seq_length=8192 -> truncated  0/10 docs (  0.0%)`,
      },
    ],
    gotcha: "ห้ามทำ Matryoshka truncation (`vecs[:, :256]`) กับโมเดลที่ **ไม่ได้เทรนแบบ MRL** โดยไม่วัดผลก่อน! โมเดลทั่วไปกระจายความหมายไปทั่วทุกมิติ การหั่นทิ้งดื้อ ๆ อาจทำให้คุณภาพการค้นหาพังหนัก — ตรวจใน Model Card เสมอว่าโมเดลรองรับ Matryoshka (MRL) หรือไม่",
  },

  practice: {
    intro: "สร้างชุดเครื่องมือประเมินและเลือก Embedding Model ใน `exercise_day71.py` ครอบคลุมการคำนวณ RAM, การทำ Matryoshka truncation + re-normalization, การวัดอัตรา Silent Truncation และตรรกะแนะนำ tier ของโมเดล",
    requirements: [
      "`estimate_vector_ram_mb(num_vectors: int, dim: int, *, dtype_bytes: int = 4, index_overhead: float = 1.5) -> float`: ตรวจว่าทุกพารามิเตอร์ `> 0` (ถ้าไม่ให้ `raise ValueError`) แล้วคืนขนาดหน่วยความจำในหน่วย MB (หารด้วย `1024 ** 2`)",
      "`truncate_and_renormalize(vectors: np.ndarray, target_dim: int) -> np.ndarray`: ตรวจว่าเป็น 2D array ไม่ว่างและ `0 < target_dim <= vectors.shape[1]` (ถ้าไม่ให้ `raise ValueError`), ตัดเหลือ `[:, :target_dim]` และทำ L2 normalization แบบ zero-safe คืน `np.float32`",
      "`check_truncation_rate(token_counts: list[int], max_seq_length: int) -> tuple[int, float]`: ตรวจ `len(token_counts) > 0`, `max_seq_length > 0`, และทุกค่าใน `token_counts >= 0` คืน `(num_truncated, ratio)` โดยนับรายการที่ `count > max_seq_length`",
      "`recommend_embedding_tier(*, num_chunks: int, max_doc_tokens: int, must_stay_local: bool, max_ram_mb: float) -> str`: คืน tier ตามกฎชัดเจน — (1) ถ้า `must_stay_local` เป็น `True`: ถ้า `max_doc_tokens <= 512` และ RAM ของ 384-d FP32 (`overhead=1.5`) `<= max_ram_mb` คืน `\"local-e5-small\"`; ไม่งั้นถ้า `max_doc_tokens <= 8192` และ RAM ของ 1024-d FP32 `<= max_ram_mb` คืน `\"local-bge-m3\"`; ไม่งั้นคืน `\"chunk-and-quantize\"` (2) ถ้า `must_stay_local` เป็น `False`: ถ้า `max_doc_tokens <= 8192` และ RAM ของ 1536-d FP32 `<= max_ram_mb` คืน `\"hosted-api\"`; ไม่งั้นคืน `\"chunk-and-quantize\"`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day71.py",
      code: `import numpy as np


def estimate_vector_ram_mb(
    num_vectors: int,
    dim: int,
    *,
    dtype_bytes: int = 4,
    index_overhead: float = 1.5,
) -> float:
    """คำนวณขนาดหน่วยความจำของดัชนีเวกเตอร์ (MB) รวม index overhead."""
    # TODO: validate inputs > 0 และคืนค่าในหน่วย MB
    raise NotImplementedError


def truncate_and_renormalize(vectors: np.ndarray, target_dim: int) -> np.ndarray:
    """ตัดมิติส่วนหน้าตามแนวคิด Matryoshka แล้ว L2 re-normalize เป็น float32."""
    # TODO: validate shape & target_dim, slice [:, :target_dim], safe L2 normalize
    raise NotImplementedError


def check_truncation_rate(token_counts: list[int], max_seq_length: int) -> tuple[int, float]:
    """นับจำนวนและสัดส่วนของเอกสารที่จะโดน Silent Truncation."""
    # TODO: validate inputs และคืน (num_truncated, ratio)
    raise NotImplementedError


def recommend_embedding_tier(
    *,
    num_chunks: int,
    max_doc_tokens: int,
    must_stay_local: bool,
    max_ram_mb: float,
) -> str:
    """แนะนำ tier ของ Embedding Model ตามข้อจำกัด PDPA, ความยาวเอกสาร และงบ RAM."""
    # TODO: ใช้ estimate_vector_ram_mb ตัดสินใจคืน local-e5-small / local-bge-m3 / hosted-api / chunk-and-quantize
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day71.py",
      code: `import numpy as np
import pytest
from exercise_day71 import (
    check_truncation_rate,
    estimate_vector_ram_mb,
    recommend_embedding_tier,
    truncate_and_renormalize,
)


def test_estimate_vector_ram_mb():
    mb = estimate_vector_ram_mb(1_048_576, 384, dtype_bytes=4, index_overhead=1.5)
    assert np.isclose(mb, 384 * 4 * 1.5)
    with pytest.raises(ValueError):
        estimate_vector_ram_mb(0, 384)
    with pytest.raises(ValueError):
        estimate_vector_ram_mb(100, 384, index_overhead=0.0)


def test_truncate_and_renormalize_matryoshka():
    arr = np.array([[3.0, 4.0, 12.0, 0.0], [0.0, 0.0, 5.0, 5.0]], dtype=np.float64)
    out = truncate_and_renormalize(arr, target_dim=2)
    assert out.shape == (2, 2)
    assert out.dtype == np.float32
    assert np.allclose(out[0], [0.6, 0.8], atol=1e-6)
    assert np.allclose(out[1], [0.0, 0.0])
    with pytest.raises(ValueError):
        truncate_and_renormalize(arr, target_dim=5)
    with pytest.raises(ValueError):
        truncate_and_renormalize(arr, target_dim=0)


def test_check_truncation_rate():
    n, ratio = check_truncation_rate([100, 512, 513, 900], max_seq_length=512)
    assert n == 2
    assert np.isclose(ratio, 0.5)
    with pytest.raises(ValueError):
        check_truncation_rate([], 512)
    with pytest.raises(ValueError):
        check_truncation_rate([-1, 100], 512)


def test_recommend_embedding_tier_decisions():
    assert recommend_embedding_tier(num_chunks=50_000, max_doc_tokens=400, must_stay_local=True, max_ram_mb=512.0) == "local-e5-small"
    assert recommend_embedding_tier(num_chunks=50_000, max_doc_tokens=1500, must_stay_local=True, max_ram_mb=512.0) == "local-bge-m3"
    assert recommend_embedding_tier(num_chunks=1_000_000, max_doc_tokens=1500, must_stay_local=True, max_ram_mb=1024.0) == "chunk-and-quantize"
    assert recommend_embedding_tier(num_chunks=50_000, max_doc_tokens=2000, must_stay_local=False, max_ram_mb=1024.0) == "hosted-api"
    assert recommend_embedding_tier(num_chunks=50_000, max_doc_tokens=10_000, must_stay_local=False, max_ram_mb=4096.0) == "chunk-and-quantize"
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases",
      "ตรวจว่า `check_truncation_rate([512], 512)` นับเป็น `0` (เอกสารยาวเท่ากับลิมิตเป๊ะยังไม่โดนตัด จะโดนตัดเมื่อ `> max_seq_length`)",
      "ตรวจว่า `truncate_and_renormalize` คืน unit vectors ที่ norm เท่ากับ `1.0` และปลอดภัยจาก zero-vector",
      "ลองใส่จำนวน chunks ของโปรเจกต์จริงที่คุณสนใจลงใน `recommend_embedding_tier` เพื่อดูคำแนะนำ",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day71.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `estimate_vector_ram_mb` ตรวจเงื่อนไข `num_vectors <= 0 or dim <= 0 or dtype_bytes <= 0 or index_overhead <= 0` แล้วคำนวณ `(num_vectors * dim * dtype_bytes * index_overhead) / (1024 ** 2)`",
      },
      {
        body: "ใน `truncate_and_renormalize` สังเกตเคสแถว `[0.0, 0.0, 5.0, 5.0]` เมื่อหั่นเหลือ 2 มิติแรกจะกลายเป็นเวกเตอร์ศูนย์ `[0.0, 0.0]` พอดี — การใช้ `safe_norms = np.where(norms == 0.0, 1.0, norms)` จึงสำคัญมากเพื่อไม่ให้เกิด `NaN`",
      },
      {
        body: "โครงของ `recommend_embedding_tier` ที่เรียกใช้ `estimate_vector_ram_mb` — เติมอีก 3 ฟังก์ชันด้านบนให้ครบ",
        code: {
          language: "python",
          filename: "hint_day71.py",
          code: `def recommend_embedding_tier(
    *,
    num_chunks: int,
    max_doc_tokens: int,
    must_stay_local: bool,
    max_ram_mb: float,
) -> str:
    if must_stay_local:
        if max_doc_tokens <= 512 and estimate_vector_ram_mb(num_chunks, 384) <= max_ram_mb:
            return "local-e5-small"
        if max_doc_tokens <= 8192 and estimate_vector_ram_mb(num_chunks, 1024) <= max_ram_mb:
            return "local-bge-m3"
        return "chunk-and-quantize"
    if max_doc_tokens <= 8192 and estimate_vector_ram_mb(num_chunks, 1536) <= max_ram_mb:
        return "hosted-api"
    return "chunk-and-quantize"`,
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
      title: "ส่งเอกสารภาษาไทยยาว 1,000+ tokens เข้าโมเดลลิมิต 512 tokens โดยไม่รู้ตัว",
      symptom: "ระบบไม่ขึ้น error แต่คำถามที่คำตอบอยู่ครึ่งล่างของเอกสารค้นหาไม่เคยเจอเลย",
      fix: "ตรวจ token count ด้วย tokenizer ของโมเดลก่อน indexing เสมอ แล้วทำ token-aware {{chunking}} หรือเปลี่ยนไปใช้โมเดลที่รับบริบทยาวอย่าง `BAAI/bge-m3` (8,192 tokens)",
    },
    {
      title: "ตัดมิติ Matryoshka แล้วลืม L2 Re-Normalize",
      symptom: "คะแนน Dot Product ลดลงฮวบและ threshold เดิมพังทั้งหมดเพราะความยาวเวกเตอร์หลังตัดเหลือแค่ ~`0.4`",
      fix: "ทำ L2 normalization ใหม่ทุกครั้งหลังหั่น `vecs[:, :target_dim]` และตรวจสอบใน Model Card ว่าโมเดลรองรับ MRL จริง",
    },
    {
      title: "เลือกโมเดลจากอันดับ 1 ของตาราง MTEB รวมโดยไม่ดูคะแนนภาษาไทย",
      symptom: "โมเดลได้คะแนนสูงลิ่วในเอกสารภาษาอังกฤษ แต่พอเจอคำถามภาษาไทยหรือไทยปนอังกฤษกลับจับคู่พลาดบ่อย",
      fix: "คัดเลือกจาก MTEB Multilingual/Retrieval (เฉพาะภาษาไทย) แล้วทำ benchmark บนชุดคำถามจริงของโดเมนตัวเองก่อนขึ้น production",
    },
    {
      title: "คำนวณแค่ขนาดเวกเตอร์ดิบโดยลืม HNSW Index Overhead",
      symptom: "ประเมินว่าดัชนีใช้ RAM 5 GB จึงเช่าเครื่อง 6 GB แต่พอสร้างดัชนีจริงเครื่อง OOM crash",
      fix: "เผื่อ `index_overhead` ราว `1.5×–2.0×` ของขนาดเวกเตอร์ดิบ หรือใช้ FP16/int8 {{quantization}} และ Matryoshka เพื่อลด footprint",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d071-q1",
        "คลังเอกสารมี `1,000,000` chunks ใช้โมเดล `1024` มิติ แบบ `float32` (4 bytes) และเผื่อ HNSW overhead `1.5×` จะใช้ RAM ประมาณเท่าใด?",
        [
          ["ประมาณ 0.4 GB", "น้อยกว่าความจริง 10 เท่า — ลืมคูณ `bytes` และ `overhead`"],
          ["ประมาณ 1.5 GB", "ตัวเลขนี้ใกล้เคียงกับโมเดล `384` มิติ ไม่ใช่ `1024` มิติ"],
          ["ประมาณ 5.7 GB", "ถูก — `1,000,000 × 1024 × 4 × 1.5 ≈ 6.14 × 10^9 bytes ≈ 5.72 GiB`"],
          ["ประมาณ 24.0 GB", "สูงกว่าความจริง 4 เท่า"],
        ],
        "C",
        "ขนาดเวกเตอร์ดิบ = `1M × 1024 × 4 bytes ≈ 3.81 GiB` เมื่อคูณ `1.5×` HNSW overhead จะได้ราว `5.72 GiB`",
        "สูตรคำนวณ RAM ของดัชนีเวกเตอร์ (รวม HNSW overhead) คืออะไร?",
        "`N × D × bytes_per_dim × overhead` (เช่น `4` bytes สำหรับ FP32 และ `1.5×` สำหรับ HNSW overhead)",
      ),
      mc(
        "d071-q2",
        "ทำไมเอกสารภาษาไทยจึงเสี่ยงเจอปัญหา Silent Truncation มากกว่าเอกสารภาษาอังกฤษบนโมเดลที่จำกัด `max_seq_length = 512`?",
        [
          ["เพราะโมเดล Embedding ตัดอักษรไทยทิ้งโดยอัตโนมัติ", "ไม่จริง — โมเดล multilingual อ่านภาษาไทยได้ แต่ใช้จำนวน token ต่อความยาวข้อความมากกว่า"],
          ["เพราะบน BPE/SentencePiece Tokenizer หลายตัว ข้อความภาษาไทยใช้จำนวน token มากกว่าภาษาอังกฤษ 1.5–3 เท่า ทำให้ทะลุ 512 tokens เร็วกว่าและส่วนเกินจะถูกตัดทิ้งเงียบ ๆ", "ถูก — เนื้อหาครึ่งหลังของเอกสารจะหายไปจากเวกเตอร์โดยไม่มี error แจ้งเตือน"],
          ["เพราะภาษาไทยใช้หน่วยความจำ `float64` แทน `float32`", "ไม่เกี่ยวกัน — ชนิดข้อมูลของเวกเตอร์เหมือนกันทุกภาษา"],
          ["เพราะ PyTorch จำกัดความยาวภาษาไทยไว้แค่ 100 ตัวอักษร", "ไม่จริง — ข้อจำกัดมาจาก `max_seq_length` ของสถาปัตยกรรมโมเดล"],
        ],
        "B",
        "อัตราการใช้ token ของภาษาไทยที่สูงกว่าภาษาอังกฤษทำให้ข้อความไทยชนเพดาน `max_seq_length` เร็วกว่า และโมเดลจะตัดส่วนเกินทิ้งโดยไม่เตือน",
        "Silent Truncation ในโมเดล Embedding คืออะไร และทำไมจึงพบบ่อยในภาษาไทย?",
        "คือการที่โมเดลตัดข้อความยาวเกิน `max_seq_length` ทิ้งเงียบ ๆ โดยไม่โยน error — ภาษาไทยใช้ token มากกว่าอังกฤษ 1.5–3× จึงชนเพดาน 512 tokens เร็วมาก",
      ),
      mc(
        "d071-q3",
        "หลังจากหั่นเวกเตอร์ Matryoshka (MRL) จาก `1536` มิติลงเหลือ `512` มิติ (`vecs[:, :512]`) ขั้นตอนใดที่ **ต้องทำเสมอ** ก่อนนำไปค้นหาด้วย Dot Product?",
        [
          ["คูณทุกค่าด้วย `3.0` เพื่อให้ขนาดเท่าเดิม", "ผิด — การคูณด้วยค่าคงที่ไม่ได้รับประกันว่าแต่ละแถวจะมี L2 norm เท่ากับ `1.0`"],
          ["ทำ L2 re-normalization ให้แต่ละแถวกลับมามี norm เท่ากับ `1.0`", "ถูก — เพราะหลังตัดมิติทิ้ง ความยาวเวกเตอร์จะสั้นกว่า `1.0` ต้อง normalize ใหม่เพื่อให้ dot-product กลับมาเท่ากับ cosine similarity"],
          ["เรียงค่าตัวเลขในแต่ละแถวจากมากไปน้อย", "ผิดมหันต์ — การสลับลำดับมิติทำลายพิกัดความหมายทั้งหมด"],
          ["เติมเลข `0.0` กลับเข้าไปให้ครบ `1536` มิติเหมือนเดิม", "ถ้าเติมศูนย์กลับไปก็ไม่ได้ประหยัด RAM เลย"],
        ],
        "B",
        "เวกเตอร์ที่ถูกตัดมิติจะมี L2 norm น้อยกว่า 1.0 จึงต้องทำ L2 re-normalization ใหม่เสมอหลัง slicing",
        "หลังตัดมิติเวกเตอร์แบบ Matryoshka (`vecs[:, :d]`) ต้องทำขั้นตอนใดทันที?",
        "ทำ L2 re-normalization ให้ทุกแถวกลับมามีความยาว `1.0` เสมอ เพื่อให้ dot-product เท่ากับ cosine similarity",
      ),
      mc(
        "d071-q4",
        "หากทีมตัดสินใจอัปเกรด Embedding Model ในระบบ RAG จาก `multilingual-e5-small` (384-d) เป็น `BAAI/bge-m3` (1024-d) ข้อใดถูกต้อง?",
        [
          ["ใช้ดัชนีเอกสารเดิมต่อไปได้เลย แค่เปลี่ยนโมเดลเฉพาะฝั่ง query", "พังทันที — ทั้งขนาดมิติ (384 vs 1024) และพื้นที่เวกเตอร์ของสองโมเดลเข้ากันไม่ได้เลย"],
          ["ต้อง re-embed และสร้างดัชนีคลังเอกสารทั้งหมดใหม่ด้วย `BAAI/bge-m3` (และปรับกฎ prefix ตาม Model Card ใหม่)", "ถูก — เวกเตอร์จากคนละโมเดลเทียบกันไม่ได้ และ `bge-m3` ไม่ต้องใช้ prefix `query:`/`passage:` เหมือน E5"],
          ["แค่เติมเลข `0` ต่อท้ายเวกเตอร์เดิม 640 ช่องให้ครบ `1024` มิติ", "พื้นที่ความหมายของสองโมเดลคนละพิกัดกัน การเติมศูนย์ไม่ได้ทำให้ค้นหาได้"],
          ["เก็บเวกเตอร์ทั้งสองรุ่นปนกันในคอลเลกชันเดียวแล้วให้ HNSW แยกเอง", "ไม่ได้ — คอลเลกชันเวกเตอร์ต้องมาจากโมเดลรุ่นเดียวกันทั้งหมด"],
        ],
        "B",
        "การเปลี่ยน Embedding Model ต้อง re-embed คลังเอกสารทั้งหมดใหม่และตรวจสอบกฎ prefix / normalization ของโมเดลใหม่ทุกครั้ง",
        "เมื่อเปลี่ยน Embedding Model ในระบบ RAG ทำไมจึงไม่สามารถใช้เวกเตอร์เอกสารเดิมต่อได้?",
        "เพราะแต่ละโมเดลมีพิกัดพื้นที่ความหมาย (และอาจมีจำนวนมิติ) คนละระบบกัน ต้อง re-embed คลังเอกสารทั้งหมดใหม่และติดแท็ก `model_id` ไว้กับดัชนี",
      ),
    ],
  },

  takeaways: [
    "คำนวณ RAM ล่วงหน้าเสมอด้วยสูตร `N × D × bytes × 1.5` (HNSW overhead) — มิติที่ใหญ่ขึ้น 4× หมายถึง RAM และเวลาค้นหาที่โตขึ้น 4×",
    "ใช้ Matryoshka (MRL) ตัดมิติส่วนหน้า + **L2 re-normalize** หรือใช้ FP16/int8 {{quantization}} เพื่อลด RAM 2×–6× เมื่อสเกลโต",
    "ภาษาไทยใช้ token มากกว่าอังกฤษ 1.5–3× บน {{bpe-tokenizer}} จึงเสี่ยง **Silent Truncation** บนโมเดลลิมิต 512 tokens — ต้องเช็กความยาวเอกสารและทำ {{chunking}} หรือเลือกโมเดลบริบทยาวอย่าง `BAAI/bge-m3`",
    "อย่าเลือกโมเดลจาก MTEB อังกฤษล้วน — พิจารณาคุณภาพภาษาไทย, ข้อกำหนด PDPA (Local vs Hosted API), และติดแท็ก `embedding_model_id` ไว้กับทุกดัชนีเพื่อรองรับการ re-index",
  ],

  reviewCards: [
    rc(
      "d071-rc-1",
      "4 แกนหลักในการเลือก Embedding Model สำหรับระบบภาษาไทยมีอะไรบ้าง?",
      "1) คุณภาพภาษาไทย/code-switching 2) มิติและขนาด RAM (`N × D × bytes × overhead`) 3) Context Limit (`max_seq_length` เพื่อกัน Silent Truncation) 4) ต้นทุนและ PDPA (Local vs Hosted API)",
    ),
    rc(
      "d071-rc-2",
      "Matryoshka Representation Learning (MRL) ช่วยลด RAM อย่างไร และมีข้อควรระวังอะไร?",
      "ตัดใช้เฉพาะมิติส่วนหน้า (`vecs[:, :target_dim]`) เพื่อลดขนาดเวกเตอร์ 2×–6× — ข้อควรระวังคือต้องใช้กับโมเดลที่เทรนแบบ MRL และต้อง **L2 re-normalize** ใหม่ทุกครั้งหลังตัด",
    ),
    rc(
      "d071-rc-3",
      "ทำไมเอกสารภาษาไทยยาว 900 ตัวอักษรอาจค้นหาข้อความส่วนท้ายไม่เจอเมื่อใช้ `multilingual-e5-small`?",
      "เพราะภาษาไทยใช้ token มากและโมเดลลิมิตที่ `512` tokens ส่วนที่เกินจะถูก **Silent Truncation** ทิ้งเงียบ ๆ โดยไม่แจ้ง error — ต้องทำ token-aware chunking หรือใช้โมเดลบริบทยาวอย่าง `BAAI/bge-m3`",
    ),
  ],

  sources: [
    { label: "MTEB Leaderboard (Massive Text Embedding Benchmark)", href: "https://huggingface.co/spaces/mteb/leaderboard" },
    { label: "Sentence-Transformers Docs — Matryoshka Embeddings", href: "https://sbert.net/examples/sentence_transformer/training/matryoshka/README.html" },
    { label: "Sentence-Transformers Docs — Embedding Quantization", href: "https://sbert.net/examples/sentence_transformer/applications/embedding-quantization/README.html" },
    { label: "Hugging Face — BAAI/bge-m3 Technical Details (8192 tokens)", href: "https://huggingface.co/BAAI/bge-m3" },
  ],

  glossary: ["embedding", "bpe-tokenizer", "chunking", "cosine-similarity", "quantization", "hnsw", "rag", "mrr"],
});
