import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D069 — Phase 3 / Block B18
 * Dense Text Embeddings (Sentence-Transformers Multilingual)
 */
export const d069: Lesson = defineLesson({
  day: 69,
  titleTh: "แปลงข้อความไทย-อังกฤษเป็น Dense Embeddings ด้วย Sentence-Transformers",
  tagline: "30 นาที · รันบน CPU 100% · ใช้ Bi-Encoder หลายภาษา + Prefix query/passage + Batching อย่างถูกต้อง",
  icon: "radar",
  visual: {
    id: "dense-embeddings-map",
    title: "Dense Multilingual Embeddings — ข้อความความหมายใกล้กันอยู่ย่านเดียวกัน",
    caption: "คลิกเลือกคำถามภาษาไทยหรือไทยปนอังกฤษเพื่อดูพิกัดความหมายและการจับคู่เอกสารที่เกี่ยวข้องโดยไม่ต้องตรงคำเป๊ะ",
    alt: "แผนภาพพื้นที่เวกเตอร์ของ Multilingual Dense Embeddings",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบน CPU ของเครื่องคุณ 100% ด้วย Sentence-Transformers ไม่ต้องใช้ API key",
  tools: ["Sentence-Transformers", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "แปลงเอกสารและคำถามไทย-อังกฤษให้เป็นพิกัดความหมายเดียวกัน",
      body: "ข้อความดิบในคลังเอกสารองค์กรมีทั้งภาษาไทย ภาษาอังกฤษ และคำพ้องความหมาย โมเดล {{embedding}} แบบหลายภาษาช่วยแปลงทุกประโยคเป็นเวกเตอร์ความยาวคงที่บนพื้นที่ความหมายเดียวกัน",
      lessonNote: "วันนี้เราจะใช้ `SentenceTransformer` รุ่น multilingual สร้าง dense vectors โดยใส่ prefix ให้ตรงบทบาทของข้อความ",
    },
    {
      node: 2,
      heading: "Bi-Encoder สร้างเวกเตอร์แยกฝั่งเพื่อให้ค้นหาได้ในระดับมิลลิวินาที",
      body: "แทนที่จะส่งคู่คำถามกับเอกสารทุกคู่เข้า {{transformer}} ใหม่ทุกรอบ Bi-Encoder จะ encode เอกสารทั้งหมดเตรียมไว้ล่วงหน้า แล้ว encode เฉพาะคำถามใหม่ตอนผู้ใช้ค้นหา",
      lessonNote: "เราจะตั้ง `normalize_embeddings=True` เพื่อให้ {{cosine-similarity}} ลดรูปเหลือแค่ {{dot-product}} ที่คำนวณเร็วมาก",
    },
    {
      node: 4,
      heading: "คุม CPU Throughput ด้วย Batching และ Caching",
      body: "การเรียก `.encode()` ทีละ 1 ประโยคใน loop ช้ากว่าการส่งเป็น batch หลายเท่า และเอกสารที่ไม่เปลี่ยนไม่ควรถูก re-encode ซ้ำทุกครั้งที่เริ่มแอป",
      lessonNote: "แบบฝึกหัดวันนี้สร้างตัวห่อ Bi-Encoder ที่จัด batch, ใส่ prefix อัตโนมัติ, normalize และทดสอบด้วย {{pytest}} แบบออฟไลน์",
    },
    {
      node: 5,
      heading: "ป้องกันคุณภาพตกเงียบจากการลืม Prefix หรือข้าม Normalization",
      body: "ข้อผิดพลาดเรื่อง `query:` / `passage:` prefix ไม่ได้โยน exception ออกมา แต่มันทำให้คะแนนค้นหาใน {{rag}} ตกเงียบ ๆ ใน production",
      lessonNote: "เราจะฝังการเติม prefix และ L2 normalization ไว้ใน helper เดียวเพื่อตัดโอกาสลืมตั้งแต่ต้นทาง",
    },
  ],

  objectives: [
    "**อธิบาย** สถาปัตยกรรม Bi-Encoder ของ `Sentence-Transformers` และความต่างระหว่าง Dense {{embedding}} กับเวกเตอร์คำแบบ Sparse (TF-IDF)",
    "**ใช้งาน** โมเดลหลายภาษา (`intfloat/multilingual-e5-small` / `BAAI/bge-m3`) พร้อมใส่ Asymmetric Prefix (`query:` vs `passage:`) และ `normalize_embeddings=True` อย่างถูกต้อง",
    "**ออกแบบ** ฟังก์ชัน `encode_batched` บน CPU ที่จัดการ batch size, L2 normalization และ {{caching}} พร้อมเขียนเทสต์ {{pytest}} แบบรันออฟไลน์ได้ในเสี้ยววินาที",
  ],

  prerequisites: [
    "Vectors, {{dot-product}} และ {{cosine-similarity}} ใน NumPy (Days 37–38)",
    "แนวคิด {{transformer}} และ {{bpe-tokenizer}} สำหรับภาษาไทย (Days 65–66)",
    "Python พื้นฐาน, `uv` และ `pytest`",
    "รันบน CPU ของเครื่องคุณได้ 100% (การดาวน์โหลดน้ำหนักโมเดลครั้งแรกใช้เน็ต ~470 MB สำหรับ `multilingual-e5-small` จากนั้นรันออฟไลน์ได้ตลอด)",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ด้วย `uv` และติดตั้ง `sentence-transformers` (บนเครื่องที่ไม่มี GPU จะรันบน CPU PyTorch ได้ทันที)",
    commands: `uv init ai-day69 && cd ai-day69
uv add sentence-transformers numpy
uv add --dev pytest ruff
uv run python -c "import sentence_transformers, numpy; print('ST:', sentence_transformers.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day69` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `sentence-transformers`, `numpy` และ `pytest` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน `sentence_transformers` แล้วไม่มี error"],
    ],
    note: "หากเน็ตช้าหรือยังไม่อยากดาวน์โหลดโมเดล 470 MB ตอนนี้ สามารถอ่านเนื้อหาและทำแบบฝึกหัด + รัน `pytest` ด้วย Mock Encoder บนเครื่องได้ครบ 100% แล้วค่อยโหลดโมเดลจริงทีหลัง",
  },

  concepts: [
    {
      id: "bi-encoder-dense-embeddings",
      title: "1 · Bi-Encoder และ Dense Multilingual Embeddings",
      paragraphs: [
        "ใน Phase 2 เราเคยแทนข้อความด้วย TF-IDF ซึ่งเป็นเวกเตอร์แบบ **Sparse** (ยาวหลายหมื่นช่อง แต่แทบทุกช่องเป็น `0`) ข้อจำกัดสำคัญคือถ้าเอกสารเขียนว่า *\"การออกใบกำกับภาษีเต็มรูปแบบ\"* แต่ลูกค้าถามว่า *\"ขอใบเสร็จรับเงิน\"* หรือ *\"Need a tax invoice\"* คำไม่ซ้ำกันเลย คะแนนความเหมือนจะกลายเป็น `0.0` ทันที",
        "**Dense Text {{embedding}}** แก้ปัญหานี้ด้วยสถาปัตยกรรม **Bi-Encoder**: โมเดลส่งข้อความเข้าชั้น {{transformer}} Encoder (เช่น XLM-RoBERTa) แล้วทำ **Pooling** (เช่น Mean Pooling หรือ CLS Pooling) ยุบเวกเตอร์ของทุก token ให้เหลือเวกเตอร์เลขทศนิยมแน่น ๆ 1 เส้นความยาวคงที่ เช่น `384` มิติ (`intfloat/multilingual-e5-small`) หรือ `1024` มิติ (`BAAI/bge-m3`)",
        "เพราะโมเดลผ่านการเทรนแบบ Contrastive Learning บนคู่คำถาม-คำตอบนับร้อยล้านคู่ข้ามกว่า 100 ภาษา ข้อความที่มีความหมายใกล้กันจึงถูกดึงมาอยู่ย่านเดียวกันในพื้นที่เวกเตอร์ แม้จะใช้คนละคำหรือคนละภาษา (ไทย ↔ อังกฤษ)",
      ],
      analogy: "TF-IDF เหมือนการหาหนังสือจากคำในดัชนีท้ายเล่มเป๊ะ ๆ ถ้าสะกดไม่ตรงก็หาไม่เจอ ส่วน Dense Embedding เหมือนพิกัด GPS ในห้องสมุดขนาดใหญ่ — หนังสือเรื่องภาษีภาษาไทยกับภาษาอังกฤษถูกวางอยู่ชั้นติดกัน แม้ชื่อปกจะไม่มีคำไหนซ้ำกันเลย",
      bullets: [
        "**Fixed Dimension**: ไม่ว่าประโยคจะยาว 5 คำหรือ 200 คำ ผลลัพธ์จะเป็นเวกเตอร์มิติคงที่ `(dim,)` เสมอ",
        "**Bi-Encoder Speed**: เข้ารหัสเอกสาร `N` ชิ้นเก็บไว้ครั้งเดียว ตอนค้นหาจริงเข้ารหัสแค่คำถาม 1 ประโยคแล้วคูณเมทริกซ์",
        "**Cross-Lingual Bridge**: คำถามไทยปนอังกฤษ (code-switching) อย่าง *\"ขอ reset password บัญชี\"* จับคู่กับคู่มือภาษาอังกฤษหรือไทยล้วนได้ทันที",
      ],
      whyTitle: "Why this matters — รากฐานของ Semantic Search และ RAG",
      whyParagraphs: [
        "ในระบบ {{rag}} จริง เอกสารภายในบริษัทมักเป็นภาษาทางการหรือภาษาอังกฤษ ในขณะที่ลูกค้าและพนักงานพิมพ์คำถามด้วยภาษาพูดไทยปนอังกฤษ",
        "Dense Multilingual Embeddings คือชั้นแรกที่เชื่อมช่องว่างทางภาษานี้ได้โดยไม่ต้องมานั่งสร้างพจนานุกรมคำพ้องด้วยมือ",
      ],
    },
    {
      id: "asymmetric-prefix-and-normalization",
      title: "2 · Asymmetric Prefixes (`query:` vs `passage:`) และ `normalize_embeddings=True`",
      paragraphs: [
        "คำถามสั้น ๆ ของผู้ใช้ (*\"ลืมรหัสผ่าน\"*) กับย่อหน้าเอกสารยาว ๆ (*\"ขั้นตอนการกู้คืนบัญชีเมื่อผู้ใช้ลืมรหัสผ่านเข้าสู่ระบบ...\"*) มีบทบาทไม่สมมาตรกัน โมเดลตระกูล **E5** (`intfloat/multilingual-e5-small`, `e5-base`, `e5-large`) จึงถูกเทรนให้แยกบทบาทด้วยคำนำหน้า (prefix) เสมอ: **`\"query: \"`** สำหรับคำถามค้นหา และ **`\"passage: \"`** สำหรับเอกสารในคลัง",
        "สิ่งที่อันตรายคือหากคุณลืมใส่ `query: ` หรือ `passage: ` โมเดลจะไม่โยน error ใด ๆ ออกมา — มันยังคืนเวกเตอร์ `(384,)` ตามปกติ แต่คุณภาพการจัดอันดับ (Recall / MRR) จะตกลงอย่างมีนัยสำคัญ ส่วนโมเดลอย่าง `BAAI/bge-m3` ไม่บังคับ prefix จึงต้องอ่าน **Model Card** ของโมเดลที่เลือกทุกครั้งก่อนใช้งาน",
        "อีกพารามิเตอร์ที่ควรเปิดเป็นนิสัยคือ **`normalize_embeddings=True`** เพื่อหารทุกเวกเตอร์ด้วย L2 norm ให้ความยาวเท่ากับ `1.0` เสมอ เมื่อทั้งเวกเตอร์คำถาม `q` และคลังเอกสาร `D` เป็น unit vector แล้ว ค่า {{cosine-similarity}} จะเท่ากับ {{dot-product}} (`q @ D.T`) เป๊ะโดยไม่ต้องหาร norm ซ้ำทุกครั้งตอนค้นหา",
      ],
      analogy: "Prefix `query:` กับ `passage:` เหมือนป้ายแขวนคอตอนเข้างานสัมมนาว่า \"ผู้ถาม\" กับ \"วิทยากร\" — ถ้าลืมแขวนป้ายก็ยังเดินเข้างานได้ แต่ระบบจับคู่จะสับสนว่าใครกำลังถามและใครกำลังตอบ",
      code: {
        language: "python",
        filename: "e5_prefix_demo.py",
        code: `import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("intfloat/multilingual-e5-small")

passages = [
    "passage: ลูกค้าสามารถขอใบกำกับภาษีเต็มรูปแบบได้ภายใน 7 วันหลังชำระเงิน",
    "passage: ขั้นตอนการรีเซ็ตรหัสผ่านผ่านอีเมลที่ลงทะเบียนไว้",
]
queries = ["query: ขอใบเสร็จรับเงินหน่อยครับ"]

p_vecs = model.encode(passages, normalize_embeddings=True)
q_vecs = model.encode(queries, normalize_embeddings=True)

scores = q_vecs @ p_vecs.T  # unit dot-product == cosine similarity
print("L2 norm of query:", np.round(np.linalg.norm(q_vecs[0]), 4))
print("Similarity scores:", np.round(scores[0], 4))`,
        caption: "ใส่ `query: ` และ `passage: ` ให้ตรง Model Card ของ E5 พร้อม `normalize_embeddings=True` เพื่อให้ `q_vecs @ p_vecs.T` เป็น Cosine Similarity ทันที",
      },
      whyTitle: "Why this matters — ตัดบั๊กเงียบที่ไล่หายากที่สุดในระบบ Search",
      whyParagraphs: [
        "บั๊กที่พบบ่อยที่สุดในโปรเจกต์ RAG คือทีม Ingestion ใช้ prefix `passage: ` ตอนสร้างดัชนี แต่ทีม API ลืมใส่ `query: ` ตอนค้นหา หรือใช้โมเดลคนละเวอร์ชันกัน ผลลัพธ์คือคะแนน similarity เพี้ยนทั้งหมดโดยไม่มี stack trace เตือน",
        "การห่อกฎ prefix และ normalization ไว้ใน Wrapper Class เดียวที่ทั้งฝั่ง indexing และฝั่ง query เรียกใช้ร่วมกันคือหลักวิศวกรรมที่ป้องกันความคลาดเคลื่อนนี้ได้เด็ดขาด",
      ],
    },
    {
      id: "cpu-batching-and-caching",
      title: "3 · เร่งความเร็ว `.encode()` บน CPU ด้วย Batching และ Caching",
      paragraphs: [
        "บน CPU การเรียก `model.encode([doc])` ทีละ 1 เอกสารใน `for` loop สำหรับ 1,000 เอกสารจะเสียเวลาไปกับ overhead ของ Python และ PyTorch dispatch ซ้ำ ๆ ทุกครั้ง แทนที่จะเป็นแบบนั้น ให้ส่งเป็นลิสต์พร้อมกำหนด **`batch_size=32`** (หรือ `16`–`64` ตาม RAM) เพื่อให้ PyTorch ประมวลผลเมทริกซ์พร้อมกันเป็นชุด",
        "ข้างใน `sentence-transformers` ยังแอบเรียงข้อความตามความยาวก่อนจัด batch ให้โดยอัตโนมัติ (length-sorted batching) เพื่อลด token padding ส่วนเกิน ทำให้รันบน CPU เร็วขึ้นอย่างชัดเจน และอย่าลืมตั้ง `convert_to_numpy=True` เพื่อได้ `np.ndarray` แบบ `float32` ที่พร้อมบันทึกหรือคำนวณต่อ",
        "สุดท้าย เอกสาร FAQ หรือคู่มือองค์กรไม่ได้เปลี่ยนทุกวินาที — เมื่อ encode คลังเอกสารเสร็จแล้วให้ทำ {{caching}} ลงดิสก์ (เช่น `np.save(\"corpus_vecs.npy\", vecs)` คู่กับไฟล์ metadata/hash ของข้อความ) เพื่อไม่ต้องเสียเวลา re-encode ใหม่ทุกครั้งที่รีสตาร์ตเซิร์ฟเวอร์",
      ],
      analogy: "การ encode ทีละประโยคเหมือนขับรถกระบะขนอิฐทีละก้อนไปกลับ 1,000 เที่ยว ส่วน batching คือขนทีละ 32 ก้อนต่อเที่ยว และ caching คือเก็บอิฐไว้หน้าไซต์งานแล้วไม่ต้องขับกลับโรงงานใหม่ทุกเช้า",
      bullets: [
        "**`batch_size=32`**: จุดเริ่มต้นที่สมดุลสำหรับ CPU ทั่วไป (ลดเหลือ `8–16` ถ้าเอกสารยาวมากหรือ RAM จำกัด)",
        "**`show_progress_bar=False`**: ปิด progress bar ในโค้ด service/test เพื่อไม่ให้ log รก",
        "**Persist `.npy` + Content Hash**: คำนวณใหม่เฉพาะเอกสารที่เพิ่มหรือแก้ไข (Incremental Indexing ใน Phase 4)",
      ],
      whyTitle: "Why this matters — เครื่องแล็ปท็อปธรรมดาก็รัน Embedding Pipeline จริงได้",
      whyParagraphs: [
        "หลายคนเข้าใจผิดว่าต้องเช่า GPU แพง ๆ ถึงจะรัน open-weights embeddings ได้ ทั้งที่โมเดลขนาดกะทัดรัดอย่าง `multilingual-e5-small` (~118M params) บน CPU พร้อม batching สามารถ encode เอกสาร FAQ หลายร้อยชิ้นเสร็จภายในไม่กี่วินาที",
        "การคุม batch size และ disk caching ให้เป็นตั้งแต่วันนี้จะทำให้คุณทดสอบไอเดียได้เร็ว ฟรี และไม่ติดคอขวดฮาร์ดแวร์",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — มอง Bi-Encoder เป็น Build-Time Index + Request-Time Lookup",
      body: [
        "ในงานเว็บ คุณไม่ compile TypeScript หรือ minify CSS ใหม่ทุกครั้งที่มี HTTP request เข้ามา — คุณ build ไว้ตอน deploy แล้วเสิร์ฟไฟล์ที่พร้อมใช้ทันที Bi-Encoder ทำงานด้วยหลักการเดียวกันเป๊ะ: encode เอกสารทั้งหมดตอน indexing (offline/background) แล้วตอนมี request เข้ามาค่อย encode แค่คำถาม 1 ประโยค",
        "ส่วน `batch_size=32` ก็เหมือนการทำ SQL bulk insert (`INSERT INTO ... VALUES (...), (...)`) แทนการยิง `INSERT` ทีละแถวใน `for` loop",
      ],
      table: [
        ["`model.encode(corpus, batch_size=32)`", "Bulk SQL insert / Build-time asset pre-compilation"],
        ["`normalize_embeddings=True`", "Normalize ค่าก่อนเก็บลง DB เพื่อให้ query เร็วและเทียบกันได้ตรง"],
        ["`query:` / `passage:` prefix", "Type discriminator / namespace tag แยกบทบาท payload"],
        ["`np.save('vecs.npy', vecs)`", "Static build artifact / disk cache บนเซิร์ฟเวอร์"],
      ],
    },
    student: {
      title: "First-Year Note — จากเวกเตอร์เลข 3 ตัวใน Day 37 สู่เวกเตอร์ 384 มิติ",
      body: [
        "ใน Day 37–38 เราลองสร้างเวกเตอร์ 3 มิติด้วยมือเพื่อเข้าใจ {{dot-product}} และ {{cosine-similarity}} — โมเดล Embedding วันนี้ก็สร้าง array NumPy หน้าตาแบบเดียวกันเลย แค่ขยายจาก 3 ช่องเป็น 384 หรือ 1,024 ช่อง และค่าตัวเลขข้างในถูกเรียนรู้มาจากข้อความจริงนับล้านประโยค",
        "สิ่งสำคัญคือคุณไม่จำเป็นต้องเข้าใจตัวเลขแต่ละช่องว่า \"ช่องที่ 17 แปลว่าอะไร\" ให้มองทั้งเวกเตอร์เป็น **พิกัดความหมาย** ที่ระยะมุม (cosine) ระหว่างสองเวกเตอร์บอกได้ว่าสองประโยคนั้นพูดเรื่องเดียวกันแค่ไหน",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เราจะโหลด `intfloat/multilingual-e5-small` บน CPU เพื่อสร้าง dense embeddings ให้ชุดคำถาม-เอกสารไทยปนอังกฤษ ตรวจเช็ก unit norm, เทียบความคล้ายข้ามภาษา และเขียน pattern การทำ batch + disk cache",
    steps: [
      {
        title: "1 · โหลด Multilingual E5 บน CPU และตรวจเช็ก Shape กับ Unit Norm",
        explain: "ใส่ prefix `passage: ` ให้คลังเอกสาร 4 ชิ้น และ `query: ` ให้คำถาม 2 ข้อ (ไทยล้วน 1 ข้อ, อังกฤษ 1 ข้อ) แล้ว encode ด้วย `normalize_embeddings=True`",
        code: {
          language: "python",
          filename: "worked_day69.py",
          code: `import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("intfloat/multilingual-e5-small", device="cpu")

raw_docs = [
    "ขั้นตอนการขอใบกำกับภาษีเต็มรูปแบบภายใน 7 วันหลังชำระเงิน",
    "วิธีรีเซ็ตรหัสผ่านและปลดล็อกบัญชีเมื่อล็อกอินไม่ได้",
    "นโยบายการคืนเงินเมื่อระบบตัดบัตรเครดิตซ้ำซ้อน",
    "เวลาทำการของศูนย์บริการลูกค้า วันจันทร์ถึงศุกร์ 09:00-18:00 น.",
]
raw_queries = [
    "ขอใบเสร็จภาษีทำยังไงครับ",
    "How do I reset my forgotten password?",
]

p_texts = [f"passage: {d}" for d in raw_docs]
q_texts = [f"query: {q}" for q in raw_queries]

p_vecs = model.encode(p_texts, batch_size=32, normalize_embeddings=True, show_progress_bar=False)
q_vecs = model.encode(q_texts, batch_size=32, normalize_embeddings=True, show_progress_bar=False)

print("Passages shape:", p_vecs.shape, "dtype:", p_vecs.dtype)
print("Row L2 norms:", np.round(np.linalg.norm(p_vecs, axis=1), 4))`,
        },
        output: `Passages shape: (4, 384) dtype: float32
Row L2 norms: [1. 1. 1. 1.]`,
      },
      {
        title: "2 · เทียบความคล้ายข้ามภาษาและคำพ้องด้วย Dot Product (`q @ p.T`)",
        explain: "เพราะทุกแถวถูก L2-normalize แล้ว การคูณเมทริกซ์ `q_vecs @ p_vecs.T` ให้ตาราง Cosine Similarity รูป `(2, 4)` ทันที สังเกตว่าคำถามภาษาอังกฤษจับคู่เอกสารไทยได้แม่นยำ",
        code: {
          language: "python",
          filename: "worked_day69.py",
          code: `sim_matrix = q_vecs @ p_vecs.T

for qi, q_text in enumerate(raw_queries):
    best_idx = int(np.argmax(sim_matrix[qi]))
    scores_str = ", ".join(f"{s:.3f}" for s in sim_matrix[qi])
    print(f"Q: {q_text}")
    print(f"   Scores: [{scores_str}]")
    print(f"   Top-1 -> Doc #{best_idx}: {raw_docs[best_idx]}")`,
        },
        output: `Q: ขอใบเสร็จภาษีทำยังไงครับ
   Scores: [0.892, 0.741, 0.785, 0.732]
   Top-1 -> Doc #0: ขั้นตอนการขอใบกำกับภาษีเต็มรูปแบบภายใน 7 วันหลังชำระเงิน
Q: How do I reset my forgotten password?
   Scores: [0.718, 0.874, 0.726, 0.709]
   Top-1 -> Doc #1: วิธีรีเซ็ตรหัสผ่านและปลดล็อกบัญชีเมื่อล็อกอินไม่ได้`,
      },
      {
        title: "3 · ทำ Disk Cache ด้วย `.npy` เพื่อไม่ Re-encode เอกสารซ้ำ",
        explain: "บันทึกเมทริกซ์ `float32` ลงไฟล์ `.npy` คู่กับ hash ของรายการเอกสาร — รอบถัดไปถ้าเนื้อหาไม่เปลี่ยนก็โหลดจากดิสก์ใน <1 มิลลิวินาที",
        code: {
          language: "python",
          filename: "worked_day69.py",
          code: `import hashlib
import json
from pathlib import Path

cache_dir = Path(".embed_cache")
cache_dir.mkdir(exist_ok=True)
sig = hashlib.sha256(json.dumps(p_texts, ensure_ascii=False).encode("utf-8")).hexdigest()[:12]
vec_path = cache_dir / f"e5_small_{sig}.npy"

if vec_path.exists():
    cached_vecs = np.load(vec_path)
    print("Loaded from cache:", cached_vecs.shape)
else:
    np.save(vec_path, p_vecs.astype(np.float32))
    print("Saved cache:", vec_path, f"({vec_path.stat().st_size} bytes)")`,
        },
        output: `Saved cache: .embed_cache/e5_small_a4f9c21b08e1.npy (6272 bytes)`,
      },
    ],
    gotcha: "สังเกตคะแนนของ E5 ในขั้นที่ 2: แม้เอกสารที่ไม่เกี่ยวข้อง (Doc #3) ก็ยังมีค่า Cosine Similarity สูงราว `0.70–0.74`! นี่คือลักษณะปกติของพื้นที่เวกเตอร์แบบ anisotropic ในตระกูล E5 — อย่าเดา threshold เองว่า `0.5` แปลว่าเกี่ยวข้อง ต้องดูการกระจายคะแนนจริงของโมเดลแต่ละตัวเสมอ (เราจะเจาะลึกเรื่อง threshold ใน Day 70)",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day69.py` ซึ่งเป็นตัวห่อ Bi-Encoder สำหรับงานจริง: จัดรูปแบบ E5 prefix (`query:` / `passage:`), ทำ L2 normalization อย่างปลอดภัยจากเวกเตอร์ศูนย์ และทำ batch encoding ที่ใช้ได้ทั้งกับ `SentenceTransformer` จริงและ Mock Encoder ใน `pytest`",
    requirements: [
      "`format_e5_texts(texts: list[str], role: Literal[\"query\", \"passage\"]) -> list[str]`: ตัดช่องว่างหัวท้ายของแต่ละข้อความ, `raise ValueError` หาก `role` ไม่ใช่ `\"query\"` หรือ `\"passage\"` หรือหากมีข้อความว่างเปล่าหลัง strip, และเติม `\"query: \"` หรือ `\"passage: \"` โดยไม่เติมซ้ำถ้าข้อความขึ้นต้นด้วย prefix นั้นอยู่แล้ว",
      "`l2_normalize(vectors: np.ndarray) -> np.ndarray`: แปลงเป็น 2D `np.float32` (raise `ValueError` ถ้าไม่ใช่ 2D หรือไม่มีแถว), หารแต่ละแถวด้วย L2 norm อย่างปลอดภัย (แถวที่ norm เป็น `0.0` ให้คงเป็น `0.0` ห้ามเกิด `NaN`)",
      "`encode_batched(texts: list[str], encode_fn: Callable[[list[str]], np.ndarray], *, role: Literal[\"query\", \"passage\"], batch_size: int = 32) -> np.ndarray`: ตรวจ `batch_size > 0` และ `len(texts) > 0`, เรียก `format_e5_texts`, แบ่งส่งเข้า `encode_fn` ทีละไม่เกิน `batch_size`, รวมผลลัพธ์ด้วย `np.vstack`, และคืนค่าที่ผ่าน `l2_normalize` แล้ว",
      "ออกแบบให้ `encode_fn` รับ callable ใดก็ได้ (เช่น `lambda batch: model.encode(batch, convert_to_numpy=True)`) เพื่อให้ `pytest` ทดสอบได้แบบออฟไลน์ 100% โดยไม่ต้องโหลดโมเดลจากอินเทอร์เน็ต",
    ],
    starter: {
      language: "python",
      filename: "exercise_day69.py",
      code: `from collections.abc import Callable
from typing import Literal
import numpy as np

Role = Literal["query", "passage"]


def format_e5_texts(texts: list[str], role: Role) -> list[str]:
    """เติม E5 prefix ('query: ' หรือ 'passage: ') โดยไม่เติมซ้ำ และกันข้อความว่าง."""
    # TODO: ตรวจ role, strip ข้อความ, กันข้อความว่าง และเติม prefix
    raise NotImplementedError


def l2_normalize(vectors: np.ndarray) -> np.ndarray:
    """แปลงเมทริกซ์ 2D เป็น float32 unit vectors อย่างปลอดภัยจาก zero-vector."""
    # TODO: ตรวจ ndim == 2 และ shape[0] > 0 แล้วหารด้วย safe L2 norm
    raise NotImplementedError


def encode_batched(
    texts: list[str],
    encode_fn: Callable[[list[str]], np.ndarray],
    *,
    role: Role,
    batch_size: int = 32,
) -> np.ndarray:
    """จัดรูป prefix, แบ่ง batch ส่งเข้า encode_fn และคืน unit-normalized float32 matrix."""
    # TODO: ตรวจ batch_size > 0 และ texts ไม่ว่าง, แบ่ง batch, vstack และ l2_normalize
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day69.py",
      code: `import hashlib
import numpy as np
import pytest
from exercise_day69 import encode_batched, format_e5_texts, l2_normalize


def make_mock_encoder(dim: int = 16):
    calls: list[list[str]] = []

    def _encode(batch: list[str]) -> np.ndarray:
        calls.append(list(batch))
        rows = []
        for text in batch:
            digest = hashlib.sha256(text.encode("utf-8")).digest()
            raw = np.frombuffer(digest[:dim], dtype=np.uint8).astype(np.float32) - 127.5
            rows.append(raw)
        return np.vstack(rows)

    return _encode, calls


def test_format_e5_texts_prefixes_and_avoids_duplicates():
    out = format_e5_texts(["  ขอใบกำกับภาษี ", "query: ลืมรหัสผ่าน"], role="query")
    assert out == ["query: ขอใบกำกับภาษี", "query: ลืมรหัสผ่าน"]
    with pytest.raises(ValueError):
        format_e5_texts(["   "], role="passage")
    with pytest.raises(ValueError):
        format_e5_texts(["ok"], role="invalid")  # type: ignore[arg-type]


def test_l2_normalize_unit_length_and_zero_safe():
    arr = np.array([[3.0, 4.0], [0.0, 0.0]], dtype=np.float64)
    normed = l2_normalize(arr)
    assert normed.dtype == np.float32
    assert np.allclose(normed[0], [0.6, 0.8], atol=1e-6)
    assert np.allclose(normed[1], [0.0, 0.0])
    assert not np.isnan(normed).any()
    with pytest.raises(ValueError):
        l2_normalize(np.array([1.0, 2.0]))


def test_encode_batched_splits_batches_and_normalizes():
    enc, calls = make_mock_encoder(dim=12)
    docs = [f"เอกสารภาษาไทยลำดับที่ {i}" for i in range(7)]
    vecs = encode_batched(docs, enc, role="passage", batch_size=3)
    assert vecs.shape == (7, 12)
    assert vecs.dtype == np.float32
    assert [len(c) for c in calls] == [3, 3, 1]
    assert all(item.startswith("passage: ") for batch in calls for item in batch)
    assert np.allclose(np.linalg.norm(vecs, axis=1), np.ones(7), atol=1e-5)


def test_encode_batched_rejects_bad_args():
    enc, _ = make_mock_encoder(dim=8)
    with pytest.raises(ValueError):
        encode_batched([], enc, role="query", batch_size=4)
    with pytest.raises(ValueError):
        encode_batched(["ทดสอบ"], enc, role="query", batch_size=0)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases ในเวลาต่ำกว่า 1 วินาที (ไม่ต้องต่อเน็ต)",
      "ตรวจว่า `format_e5_texts` ไม่เติม `query: query: ` ซ้ำเมื่อส่งข้อความที่มี prefix อยู่แล้ว",
      "ตรวจว่า `l2_normalize` คืน `float32` และไม่เกิด `NaN` เมื่อเจอแถวศูนย์ `[0.0, 0.0]`",
      "ลองเสียบ `SentenceTransformer('intfloat/multilingual-e5-small').encode` เข้า `encode_batched` บนเครื่องเพื่อยืนยันว่าใช้งานกับโมเดลจริงได้ตรงกัน",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day69.py` ด้วย `uv run pytest -q` และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `format_e5_texts` ให้ตรวจ `role not in (\"query\", \"passage\")` ก่อน จากนั้นสร้าง `prefix = f\"{role}: \"` แล้ววน strip ทุกข้อความ เช็ก `if not cleaned: raise ValueError(...)` และเช็ก `cleaned.startswith(prefix)` เพื่อไม่เติมซ้ำ",
      },
      {
        body: "ใน `l2_normalize` ให้ใช้ `norms = np.linalg.norm(arr, axis=1, keepdims=True)` และ `safe_norms = np.where(norms == 0.0, 1.0, norms)` ส่วนใน `encode_batched` ใช้ `range(0, len(formatted), batch_size)` แบ่ง slice แล้วเก็บผลลัพธ์ลงลิสต์ก่อน `np.vstack(chunks)`",
      },
      {
        body: "โครงของ `format_e5_texts` และ `l2_normalize` ครบแล้ว เหลือเติม loop แบ่ง batch ใน `encode_batched`",
        code: {
          language: "python",
          filename: "hint_day69.py",
          code: `from typing import Literal
import numpy as np

Role = Literal["query", "passage"]


def format_e5_texts(texts: list[str], role: Role) -> list[str]:
    if role not in ("query", "passage"):
        raise ValueError(f"Unsupported role: {role}")
    prefix = f"{role}: "
    result: list[str] = []
    for raw in texts:
        cleaned = raw.strip()
        if not cleaned:
            raise ValueError("Input text must not be empty")
        result.append(cleaned if cleaned.startswith(prefix) else f"{prefix}{cleaned}")
    return result


def l2_normalize(vectors: np.ndarray) -> np.ndarray:
    arr = np.asarray(vectors, dtype=np.float32)
    if arr.ndim != 2 or arr.shape[0] == 0:
        raise ValueError("Expected non-empty 2D array")
    norms = np.linalg.norm(arr, ord=2, axis=1, keepdims=True)
    safe_norms = np.where(norms == 0.0, 1.0, norms)
    return (arr / safe_norms).astype(np.float32)`,
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
      title: "ลืมใส่ `query: ` หรือ `passage: ` prefix กับโมเดลตระกูล E5",
      symptom: "โค้ดรันผ่านไม่มี error แต่ผลการค้นหาจัดอันดับแปลก ๆ และคะแนน Recall ตกลง 5%–15%",
      fix: "อ่าน Model Card ของโมเดลทุกครั้ง และบังคับการเติม prefix ผ่านฟังก์ชัน wrapper เดียวทั้งฝั่ง indexing และฝั่ง query",
    },
    {
      title: "เรียก `model.encode([doc])` ทีละ 1 ประโยคใน `for` loop",
      symptom: "การ encode เอกสาร 5,000 ชิ้นบน CPU ใช้เวลานานหลายสิบนาทีแทนที่จะจบในไม่กี่นาที",
      fix: "ส่งเป็นลิสต์แล้วกำหนด `batch_size=32` (หรือแบ่ง batch ด้วย `encode_batched`) เพื่อลด overhead และใช้ประโยชน์จาก vectorized matrix ops",
    },
    {
      title: "ลืม `normalize_embeddings=True` แล้วเอาไปทำ Dot Product ตรง ๆ",
      symptom: "เอกสารที่เวกเตอร์มี norm ยาวกว่าชนะการจัดอันดับอย่างไม่เป็นธรรม แม้ทิศทางความหมายจะตรงน้อยกว่า",
      fix: "เปิด `normalize_embeddings=True` เสมอ หรือทำ L2 normalization ด้วย `l2_normalize` ก่อนคูณ `q @ p.T`",
    },
    {
      title: "Encode เอกสารทั้งหมดใหม่ทุกครั้งที่ API สตาร์ตหรือมี Request เข้ามา",
      symptom: "API ค้างตอน boot หรือ latency ต่อ request พุ่งเป็นหลายวินาทีทั้งที่คลัง FAQ มีเนื้อหาเดิม",
      fix: "แยกขั้นตอน indexing ออกมา pre-compute และบันทึกเวกเตอร์ลงดิสก์ (`.npy` / Vector DB) พร้อม hash ตรวจสอบการเปลี่ยนแปลง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d069-q1",
        "จุดเด่นหลักของสถาปัตยกรรม Bi-Encoder (`Sentence-Transformers`) เมื่อเทียบกับ TF-IDF บนข้อความภาษาไทย-อังกฤษคืออะไร?",
        [
          ["Bi-Encoder ไม่ต้องใช้หน่วยความจำ RAM ในการเก็บเวกเตอร์", "ไม่จริง — Dense vector ทุกตัวต้องใช้พื้นที่เก็บใน RAM/ดิสก์ตามจำนวนมิติ `N × D × 4 bytes`"],
          ["Bi-Encoder แปลงข้อความเป็นเวกเตอร์ความหมายความยาวคงที่ ทำให้จับคู่คำพ้องและข้อความข้ามภาษา (ไทย ↔ อังกฤษ) ได้แม้ไม่มีคำตรงกันเลย", "ถูก — เพราะโมเดลหลายภาษาฝังประโยคความหมายเดียวกันไว้ใกล้กันในพื้นที่เวกเตอร์เดียว"],
          ["Bi-Encoder ค้นหารหัสใบแจ้งหนี้แบบตรงตัวอักษรได้แม่นยำกว่า regex 100%", "ไม่จริง — รหัสเฉพาะที่ไม่มีความหมายทางภาษากลับเป็นจุดอ่อนของ Dense Embeddings"],
          ["Bi-Encoder สามารถสร้างคำตอบภาษาไทยยาว ๆ แทน LLM ได้โดยตรง", "Bi-Encoder ทำหน้าที่สร้างเวกเตอร์เพื่อการค้นหาและจัดกลุ่ม ไม่ใช่ Decoder LLM สำหรับสร้างคำตอบ"],
        ],
        "B",
        "Dense Multilingual Embeddings แทนความหมายเชิงบริบทในเวกเตอร์มิติคงที่ ทำให้เชื่อมโยงคำพ้องและภาษาไทย-อังกฤษได้ต่างจาก TF-IDF ที่ต้องพึ่งคำตรงกัน",
        "ข้อได้เปรียบหลักของ Multilingual Dense Embeddings เหนือ TF-IDF คืออะไร?",
        "จับคู่คำพ้องความหมายและข้อความข้ามภาษา (เช่น ไทย ↔ อังกฤษ) ได้ในพื้นที่เวกเตอร์เดียวกันโดยไม่ต้องมีคำตรงกันเป๊ะ",
      ),
      mc(
        "d069-q2",
        "เมื่อใช้ `intfloat/multilingual-e5-small` สำหรับระบบค้นหาเอกสาร ข้อใดใช้งาน prefix ได้ถูกต้องตาม Model Card?",
        [
          ["ไม่ต้องใส่ prefix ใด ๆ ทั้งฝั่งคำถามและฝั่งเอกสาร", "ผิด — โมเดลตระกูล E5 ถูกเทรนแบบ asymmetric ถ้าไม่ใส่ prefix คุณภาพ retrieval จะตกลงเงียบ ๆ"],
          ["ใส่ `query: ` นำหน้าเอกสารทั้งหมด และใส่ `passage: ` นำหน้าคำถามผู้ใช้", "สลับกัน — `query: ` ต้องอยู่กับคำถามค้นหา และ `passage: ` ต้องอยู่กับเอกสารในคลัง"],
          ["ใส่ `query: ` นำหน้าคำถามค้นหา และใส่ `passage: ` นำหน้าเอกสารในคลัง", "ถูก — ตรงตามรูปแบบที่โมเดล E5 ถูกเทรนมาสำหรับการค้นหาแบบ asymmetric"],
          ["ใส่ `passage: ` เฉพาะข้อความภาษาอังกฤษ ส่วนภาษาไทยไม่ต้องใส่", "ผิด — ต้องใส่ prefix ให้สม่ำเสมอทุกภาษาในดัชนีเดียวกัน"],
        ],
        "C",
        "โมเดลตระกูล E5 แยกบทบาท asymmetric retrieval ด้วย `query: ` สำหรับคำถาม และ `passage: ` สำหรับเอกสารในคลัง",
        "โมเดลตระกูล `multilingual-e5` ต้องใส่ prefix อะไรให้คำถามและเอกสาร?",
        "ใส่ `query: ` นำหน้าคำถาม และใส่ `passage: ` นำหน้าเอกสารในคลังเสมอ",
      ),
      mc(
        "d069-q3",
        "เหตุใดเราจึงควรตั้ง `normalize_embeddings=True` ตอนเรียก `model.encode(...)`?",
        [
          ["เพื่อตัดข้อความภาษาไทยให้สั้นลงไม่เกิน 512 tokens", "ไม่เกี่ยวกัน — ความยาว token ถูกควบคุมด้วย `max_seq_length` ของ tokenizer"],
          ["เพื่อปรับ L2 norm ของทุกเวกเตอร์ให้เป็น `1.0` ทำให้การคำนวณ Cosine Similarity ลดรูปเหลือแค่ Dot Product (`q @ p.T`)", "ถูก — เร็วกว่าและไม่ต้องหาร norm ซ้ำทุกครั้งตอนค้นหา"],
          ["เพื่อแปลงชนิดข้อมูลจาก `float32` เป็น `int8` อัตโนมัติ", "การทำ L2 normalization ยังคงชนิดข้อมูล `float32` เหมือนเดิม ไม่ใช่ quantization"],
          ["เพื่อป้องกันไม่ให้โมเดลดาวน์โหลดไฟล์จาก Hugging Face", "ไม่เกี่ยวกัน — เป็นการปรับขนาดเวกเตอร์หลัง forward pass"],
        ],
        "B",
        "เมื่อเวกเตอร์มีความยาว L2 เท่ากับ 1.0 ค่า `dot(q, p) / (||q|| * ||p||)` จะลดรูปเหลือ `dot(q, p)` ทันที",
        "การตั้ง `normalize_embeddings=True` ช่วยอะไรในการค้นหาด้วยเวกเตอร์?",
        "ทำให้ทุกเวกเตอร์เป็น unit vector (`||v|| = 1`) จึงคำนวณ Cosine Similarity ด้วย Dot Product (`q @ p.T`) ได้โดยตรงและรวดเร็ว",
      ),
      mc(
        "d069-q4",
        "เมื่อทดสอบ `multilingual-e5-small` พบว่าเอกสารที่ไม่เกี่ยวข้องเลยได้คะแนน Cosine Similarity ราว `0.72` ส่วนเอกสารที่ตรงคำตอบได้ `0.89` ข้อสรุปใดถูกต้องที่สุด?",
        [
          ["โค้ดคำนวณผิดแน่นอน เพราะเอกสารที่ไม่เกี่ยวข้องต้องได้ `0.0` เสมอ", "ไม่จริง — โมเดลตระกูล E5 มีการกระจายเวกเตอร์แบบกระจุก (anisotropic) ทำให้คะแนนพื้นฐานอยู่แถว `0.70`"],
          ["ต้องลบโมเดลทิ้งเพราะโมเดลไม่เข้าใจภาษาไทย", "ไม่ใช่ — ช่องว่างระหว่าง `0.89` กับ `0.72` ชัดเจนมากและจัดอันดับได้แม่นยำ"],
          ["เป็นช่วงคะแนนปกติของโมเดลตระกูล E5 จึงต้องดูอันดับและคาลิเบรต threshold จากข้อมูลจริงของโมเดลนั้น แทนการเดาเลข `0.5`", "ถูก — แต่ละโมเดล embedding มีสเกลคะแนนต่างกัน ต้องวัด distribution จริงก่อนตั้ง threshold"],
          ["ควรปิด `normalize_embeddings` เพื่อให้คะแนนตกลงไปอยู่แถว `0.1`", "การปิด normalization ไม่ได้แก้สเกล cosine และยิ่งทำให้ dot-product ผิดเพี้ยน"],
        ],
        "C",
        "สเกลคะแนน Cosine ของแต่ละโมเดลไม่เท่ากัน (เช่น E5 มักกระจุกในช่วง 0.70–0.95) วิศวกรจึงต้องดู distribution จริงของโมเดลนั้นก่อนกำหนดเกณฑ์ตัดคะแนน",
        "ทำไมเอกสารที่ไม่เกี่ยวข้องใน `multilingual-e5-small` ถึงยังมีคะแนน cosine ราว `0.70` และเราควรรับมืออย่างไร?",
        "เป็นธรรมชาติของพื้นที่เวกเตอร์ตระกูล E5 — อย่าตั้ง threshold แบบเดาเองว่า `0.5` ให้วัดการกระจายคะแนนจริงของโมเดลนั้นบนข้อมูลเราเสมอ",
      ),
    ],
  },

  takeaways: [
    "Bi-Encoder (`Sentence-Transformers`) แปลงข้อความไทย-อังกฤษเป็น Dense {{embedding}} มิติคงที่ จับคู่คำพ้องและข้ามภาษาได้ต่างจาก TF-IDF",
    "อ่าน Model Card ทุกครั้ง: โมเดลตระกูล E5 ต้องใส่ `query: ` กับคำถาม และ `passage: ` กับเอกสาร มิฉะนั้นคุณภาพการค้นหาจะตกเงียบ ๆ",
    "เปิด `normalize_embeddings=True` (หรือทำ `l2_normalize` แบบ zero-safe) เพื่อให้ {{cosine-similarity}} ลดรูปเป็น `q @ p.T` ที่เร็วและแม่นยำ",
    "ส่งข้อความเป็น batch (`batch_size=32`) บน CPU และทำ {{caching}} เวกเตอร์คลังเอกสารลงดิสก์ (`.npy`) เพื่อไม่ต้อง re-encode ซ้ำ",
  ],

  reviewCards: [
    rc(
      "d069-rc-1",
      "ความต่างสำคัญระหว่าง Sparse Vector (TF-IDF) กับ Dense Embedding (Bi-Encoder) คืออะไร?",
      "TF-IDF อาศัยการตรงคำเป๊ะในเวกเตอร์ที่ส่วนใหญ่เป็น 0 ส่วน Dense Embedding ใช้ Transformer แปลงความหมายเป็นเวกเตอร์แน่นความยาวคงที่ จึงจับคู่คำพ้องและข้ามภาษา (ไทย-อังกฤษ) ได้",
    ),
    rc(
      "d069-rc-2",
      "กฎการใช้ `intfloat/multilingual-e5-small` 2 ข้อที่ห้ามลืมคืออะไร?",
      "1) ใส่ prefix `query: ` ให้คำถาม และ `passage: ` ให้เอกสารในคลัง 2) เปิด `normalize_embeddings=True` เพื่อให้ dot-product เท่ากับ cosine similarity",
    ),
    rc(
      "d069-rc-3",
      "ทำไมจึงไม่ควรเรียก `model.encode([doc])` ทีละ 1 ประโยคใน `for` loop บน CPU?",
      "เพราะเสีย overhead ของ Python/PyTorch ซ้ำทุกครั้งและไม่ได้ใช้การคำนวณเมทริกซ์แบบ vectorized — ควรส่งเป็น batch (`batch_size=32`) และ cache เวกเตอร์เอกสารที่คงที่ไว้บนดิสก์",
    ),
  ],

  sources: [
    { label: "Sentence-Transformers Official Documentation", href: "https://sbert.net/docs/quickstart.html" },
    { label: "Hugging Face — intfloat/multilingual-e5-small Model Card", href: "https://huggingface.co/intfloat/multilingual-e5-small" },
    { label: "Hugging Face — BAAI/bge-m3 Model Card", href: "https://huggingface.co/BAAI/bge-m3" },
    { label: "Multilingual E5 Text Embeddings Paper (Wang et al., 2024)", href: "https://arxiv.org/abs/2402.05672" },
  ],

  glossary: ["embedding", "transformer", "cosine-similarity", "dot-product", "bpe-tokenizer", "rag", "caching", "pytest"],
});
