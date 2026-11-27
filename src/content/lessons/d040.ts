import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D040 — Phase 2 / Block B10 (Review Day)
 * Review: Quiz + Implement mini cosine similarity search in NumPy
 */
export const d040: Lesson = defineLesson({
  day: 40,
  titleTh: "ทบทวน Block B10: สร้าง Mini Cosine Similarity Search Engine ด้วย NumPy",
  tagline:
    "30 นาที · รอบทบทวน D37–D39 + D2/D33 · รันบนเครื่อง 100% ไม่ต้องใช้ API key · รวม L2 Normalize + Batch Q @ D.T + เกณฑ์ Expected Value",
  icon: "compass",
  visual: {
    id: "vector-dot-norm",
    title: "ทบทวน B10: สร้าง Mini Vector Search Engine ด้วย NumPy Matrix Multiply",
    caption:
      "รวม L2 normalize + `Q @ D.T` + `np.argsort` เพื่อค้นหา top-k เอกสารที่คล้ายที่สุดแบบ vectorized",
    alt: "แผนภาพการค้นหา cosine similarity ด้วย NumPy matrix multiplication",
  },
  requiresApiKey: false,
  tools: ["NumPy", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "เตรียมคลังเวกเตอร์เอกสารให้สะอาดและ Normalized ล่วงหน้า",
      body: "ในระบบค้นหาจริง เราแปลงคลังเอกสารเป็นเมทริกซ์ `float32` แล้วทำ L2 normalization ไว้ตั้งแต่ตอน indexing พร้อมจัดการเวกเตอร์ศูนย์ไม่ให้เกิด `NaN`",
      lessonNote:
        "ทบทวน D37 (`shape`, `dtype`, norm) และ D38 (`keepdims=True`, zero-vector guard) เพื่อสร้างดัชนีเอกสารใน RAM ที่ปลอดภัย",
    },
    {
      node: 2,
      heading: "ค้นหาหลายคำถามพร้อมกันด้วย Batch Matrix Multiply (`Q @ D.T`)",
      body: "เมื่อทั้งเมทริกซ์คำถาม `Q` รูป `(M, dim)` และเมทริกซ์เอกสาร `D` รูป `(N, dim)` เป็น unit vectors การคูณเมทริกซ์เดียว `Q @ D.T` จะให้ตาราง {{cosine-similarity}} รูป `(M, N)` ทันที",
      lessonNote:
        "เชื่อมสัญชาตญาณ {{dot-product}} (D37) กับ {{cosine-similarity}} (D38) แทนการเขียน loop ซ้อนสองชั้นแบบ Python",
    },
    {
      node: 3,
      heading: "คัด {{top-k}} อย่างคงที่และดักเคสไม่มั่นใจด้วย Expected Value",
      body: "Vector search จะคืนเอกสารอันดับ 1 เสมอแม้คำถามไม่เกี่ยวกับคลังข้อมูลเลย — หากไม่มีเกณฑ์หยุดตอบ (abstention) ระบบจะตอบผิดและเสียต้นทุนธุรกิจ",
      lessonNote:
        "ผสาน D39 ({{expected-value}}) เข้ากับคะแนนความคล้าย เพื่อเลือกระหว่าง `auto_reply` กับ `abstain` (ส่งต่อ {{hitl}})",
    },
    {
      node: 4,
      heading: "ประกอบเป็น Mini Search Engine ที่พร้อมต่อยอดสู่ Phase 3–4",
      body: "แกนกลางของ Semantic Search (Block B18) และ {{rag}} (Phase 4) ก็คือฟังก์ชันค้นหาแบบเดียวกันนี้ เพียงเปลี่ยนเวกเตอร์จำลองเป็น dense {{embedding}} จริง",
      lessonNote:
        "จบบล็อก B10 ด้วยโมดูลค้นหาที่มี {{type-hint}} ครบ, deterministic tie-breaking และผ่านชุดเทสต์ {{pytest}}",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิมแบบผสมผสาน (Interleaved Recall)** จาก D37–D39 (เวกเตอร์/norm, Cosine vs Euclidean, Expected Value) ร่วมกับ D2 ({{comprehension}}/{{type-hint}}) และ D33 (การคิดแบบ vectorized ไม่วนแถว)",
    "**สร้างฟังก์ชัน `normalize_matrix` และ `batch_top_k_search`** ด้วย `unit_Q @ unit_D.T` ที่รองรับหลายคำถามพร้อมกัน กันเวกเตอร์ศูนย์ (`NaN`-safe) และเรียงลำดับคงที่เมื่อคะแนนเท่ากัน",
    "**ผสานเกณฑ์ Abstention จาก {{expected-value}}** (`p* = cost / (gain + cost)`) เข้ากับผลการค้นหา เพื่อหยุดตอบและส่งต่อคนเมื่อคะแนนความคล้ายต่ำกว่าจุดคุ้มทุน",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D37 (Vectors, Dot Product & Norms), D38 (Cosine Similarity & L2 Normalization) และ D39 (Probability & Expected Value)",
    "จำหลักการ {{type-hint}} / {{comprehension}} (D2) และการคิดแบบ vectorized แทน row loop (D33)",
    "มี `uv`, `numpy`, `pytest` และ `ruff` พร้อมใช้งาน",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์สำหรับรอบทบทวน Day 40 ด้วย {{uv}} หรือใช้โปรเจกต์เดิมของ Block B10 เช็กว่า `numpy`, `pytest` และ `ruff` พร้อมรัน",
    commands: `uv init ai-day40-review && cd ai-day40-review
uv add numpy
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('NumPy:', np.__version__)"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์โปรเจกต์รอบทบทวน Day 40"],
      ["deps", "ติดตั้ง `numpy`, `pytest` และ `ruff` ผ่าน `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน NumPy สำเร็จพร้อมลุยควิซและมินิโปรเจกต์"],
    ],
    note: "รอบทบทวน Day 40 แบ่งเวลา 30 นาที: ทำควิซดึงความรู้เดิม 10 นาที → สร้าง Mini Cosine Search Engine + Abstention Gate 15 นาที → จดข้อผิดพลาดลง Error Log 5 นาที",
  },

  concepts: [
    {
      id: "review-b10-vector-pipeline",
      title: "1 · ร้อยต่อจิ๊กซอว์ B10: จากเวกเตอร์เดี่ยวสู่ Batch Search (`Q @ D.T`)",
      paragraphs: [
        "ตลอด 3 วันที่ผ่านมาเราเก็บอาวุธ 3 ชิ้น: **D37** สอนแทนข้อมูลเป็น `float32` array, คำนวณ {{dot-product}} (`@`) และ L1/L2 norm; **D38** สอน L2 normalization เพื่อเปลี่ยน {{cosine-similarity}} ให้เหลือแค่ Dot Product; **D39** สอนใช้ {{expected-value}} คำนวณจุดตัดตัดสินใจจากต้นทุนจริง",
        "วันนี้เรายกระดับจาก 1 คำถาม (`unit_docs @ unit_query`) เป็น **Batch Search** สำหรับ `M` คำถามเทียบกับ `N` เอกสารพร้อมกันในคำสั่งเดียว: **`sim_matrix = unit_queries @ unit_docs.T`** โดย `(M, dim) @ (dim, N) -> (M, N)`",
        "ช่อง `sim_matrix[i, j]` คือค่า Cosine Similarity ระหว่างคำถามที่ `i` กับเอกสารที่ `j` ทั้งหมดคำนวณเสร็จใน BLAS matrix multiplication เดียว — หลักการคิดแบบ vectorized เดียวกับที่เราเลือกใช้ Expression ใน {{polars}} (D33) แทนการวน `for` ทีละแถว",
      ],
      analogy:
        "แทนที่จะหยิบคำถามทีละใบเดินไปเทียบกับเอกสาร 10,000 แผ่นทีละแผ่น (`for` ซ้อน `for`) การทำ `Q @ D.T` เหมือนเอาแผ่นตารางคำถามทาบลงบนตารางเอกสารแล้วได้ตารางคะแนนทุกคู่พร้อมกันในพริบตา",
      bullets: [
        "**D37 (`float32` + `@` + norm)**: คุม RAM และเช็ก `shape` ก่อนคูณ (`Q.shape[1] == D.shape[1]`)",
        "**D38 (`L2 normalize` + `keepdims=True`)**: แปลงทั้ง `Q` และ `D` เป็น unit rows โดยดัก `norm == 0` ไม่ให้เกิด `NaN`",
        "**D2 (`type-hint` + `comprehension`)**: ประกอบผลลัพธ์เป็น `list[list[tuple[int, float]]]` ที่อ่านง่ายและตรวจชนิดข้อมูลชัดเจน",
      ],
      code: {
        language: "python",
        filename: "batch_matmul_recap.py",
        code: `import numpy as np

def normalize_matrix(matrix: np.ndarray) -> np.ndarray:
    arr = np.asarray(matrix, dtype=np.float32)
    norms = np.linalg.norm(arr, ord=2, axis=1, keepdims=True)
    safe_norms = np.where(norms == 0.0, 1.0, norms)
    return (arr / safe_norms).astype(np.float32)

docs = np.array([[8.0, 1.0, 0.0], [0.0, 5.0, 0.0], [0.0, 0.0, 0.0]])
queries = np.array([[2.0, 0.25, 0.0], [0.0, 2.0, 0.0]])

sim_matrix = normalize_matrix(queries) @ normalize_matrix(docs).T
print("shape:", sim_matrix.shape)
print(np.round(sim_matrix, 4))`,
        caption:
          "`(2, 3) @ (3, 3) -> (2, 3)` ได้คะแนน Cosine ของทุกคู่คำถาม-เอกสารในครั้งเดียว และแถวเอกสารศูนย์ได้ `0.0` โดยไม่มี `NaN`",
      },
      whyTitle: "Why this matters — แกนเดียวกับ Evaluation Harness และ RAG Batch Retrieval",
      whyParagraphs: [
        "เวลาคุณประเมินระบบค้นหาใน Phase 4–5 คุณไม่ได้ยิงคำถามทีละ 1 ข้อ แต่ยิงชุดทดสอบ 40–200 คำถามพร้อมกันเพื่อวัด Recall@5 และ MRR — การคำนวณแบบ batch `Q @ D.T` ช่วยให้รัน benchmark ทั้งชุดเสร็จในเสี้ยววินาที",
        "นอกจากนี้ `Q @ K.T` ในกลไก Self-Attention ของ Transformer (Day 65) ก็ใช้รูปแบบเมทริกซ์คูณเมทริกซ์ทรานสโพสแบบเดียวกันเป๊ะ",
      ],
    },
    {
      id: "batch-top-k-and-zero-guard",
      title: "2 · การคัด {{top-k}} แบบ Batch, Zero-Vector Guard และ Deterministic Tie-Breaking",
      paragraphs: [
        "เมื่อได้ `sim_matrix` รูป `(M, N)` แล้ว ขั้นถัดไปคือดึงดัชนีเอกสารที่มีคะแนนสูงสุด `k` อันดับแรกของแต่ละคำถาม เราต้องคุมสองจุดสำคัญคือ: (1) จำกัด `k_eff = min(k, n_docs)` เพื่อไม่ให้พังเมื่อ `k` มากกว่าจำนวนเอกสารในคลัง และ (2) เรียงลำดับแบบ **deterministic** เมื่อเอกสารสองชิ้นได้คะแนนเท่ากันเป๊ะ",
        "ใน NumPy การเรียก `np.argsort(-row, kind=\"stable\")[:k_eff]` จะใช้ stable sort ทำให้เมื่อเอกสารดัชนี `0` และ `1` ได้คะแนนเท่ากัน (เช่น `0.0` ทั้งคู่เมื่อเจอ zero query) ดัชนีที่น้อยกว่า (`0`) จะอยู่ก่อน (`1`) เสมอทุกครั้งที่รันและข้ามทุกเครื่อง",
        "สำหรับงานจริงที่มีคลังเอกสารใหญ่ระดับหลายแสนแถว เราสามารถอัปเกรดไปใช้ `np.argpartition(-row, k_eff - 1)[:k_eff]` (เวลาเฉลี่ย $O(N)$) แล้วค่อยเรียงเฉพาะ `k` ตัวที่คัดมา แต่สำหรับคลังขนาดเล็ก-กลาง `np.argsort(-row, kind=\"stable\")[:k_eff]` อ่านง่ายและปลอดภัยมาก",
      ],
      analogy:
        "เหมือนกรรมการจัดอันดับคะแนนสอบ — ถ้าได้คะแนนเท่ากันต้องมีกติกาชัดว่าใครขึ้นก่อน (เช่น เรียงตามรหัสผู้สอบน้อยไปมาก) ประกาศผลกี่รอบอันดับก็ต้องเหมือนเดิมเป๊ะ",
      bullets: [
        "ใส่ `kind=\"stable\"` ใน `np.argsort(-row, kind=\"stable\")` เพื่อให้ unit test ไม่แกว่งเมื่อเจอคะแนนเสมอกัน",
        "ตรวจ `if k <= 0` และ `docs.shape[1] != queries.shape[1]` ตั้งแต่ต้นฟังก์ชัน ({{fail-fast}})",
        "ระวัง `float32` rounding ที่อาจทำให้ cosine ของเวกเตอร์เหมือนกันเป๊ะได้ `1.0000001` — สามารถ `np.clip(sim_matrix, -1.0, 1.0)` เพื่อความสะอาดของคะแนน",
      ],
      whyTitle: "Why this matters — ทำไมเทสต์เชิงตัวเลขต้อง Deterministic 100%",
      whyParagraphs: [
        "เหมือนที่เราจำกฎใส่ `.sort()` หลัง `group_by` ใน Polars (Day 33) และใช้ `dict.fromkeys()` แทน `set` (Day 4) ในงาน NumPy การระบุ `kind=\"stable\"` และการ clip ขอบเขต `[-1.0, 1.0]` ช่วยป้องกันบั๊กประหลาดที่ผ่านบนเครื่องเราแต่ไปพังบน CI",
      ],
    },
    {
      id: "abstention-threshold-ev",
      title: "3 · ผสาน Expected Value เป็นด่าน Abstention: หยุดตอบเมื่อเอกสารไม่ใกล้พอ",
      paragraphs: [
        "จุดอ่อนอันดับหนึ่งของ Vector Search แบบไร้การป้องกันคือ **มันจะคืนเอกสารอันดับ 1 ออกมาเสมอ** ต่อให้ลูกค้าถามเรื่อง 'ที่จอดรถหน้าร้าน' แต่คลังเอกสารมีแค่เรื่องใบกำกับภาษีกับคืนเงิน เอกสารที่ได้คะแนนสูงสุดอาจมีค่าเพียง `0.09` แต่ระบบที่ไม่ได้วางด่านก็จะหยิบเอกสารนั้นไปตอบลูกค้าอย่างมั่นใจ!",
        "เมื่อเราเชื่อมความรู้จาก Day 39 เข้ามา เราสามารถกำหนดเกณฑ์หยุดตอบ (**Abstention Threshold**) จากเศรษฐศาสตร์จริงของธุรกิจ: `threshold = wrong_cost / (gain + wrong_cost)` หากคะแนนความคล้ายอันดับ 1 (เมื่อปรับเทียบให้แทนความน่าจะเป็นแล้ว) ต่ำกว่า `threshold` ระบบจะคืนสถานะ `\"abstain\"` และส่งต่อเจ้าหน้าที่ ({{hitl}}) แทนการเดา",
        "แนวคิด 'ค้นหา Top-K → ตรวจเกณฑ์ความมั่นใจ → ตอบหรือส่งต่อคน' นี่เองคือโครงกระดูกของระบบ {{rag}} Production ที่ลดการเกิดคำตอบมั่วได้อย่างเป็นรูปธรรม",
      ],
      analogy:
        "เหมือนบรรณารักษ์ที่หาหนังสือใกล้เคียงที่สุดบนชั้นมาได้ 1 เล่ม แต่พอเปิดดูแล้วเนื้อหาตรงคำถามแค่ 10% บรรณารักษ์ที่ดีจะบอกว่า 'ไม่มีข้อมูลเรื่องนี้ ขอส่งต่อผู้เชี่ยวชาญ' แทนที่จะฝืนอ่านหน้าแรกให้ฟัง",
      bullets: [
        "`top_score >= threshold` → `action = \"auto_reply\"` พร้อมระบุ `top_doc_id`",
        "`top_score < threshold` → `action = \"abstain\"` และ `top_doc_id = None` (ส่งต่อเจ้าหน้าที่)",
        "ยังเก็บรายการ `candidates` ไว้ในผลลัพธ์เสมอ เพื่อช่วยให้เจ้าหน้าที่หรือทีม eval ตรวจสอบย้อนหลังได้ว่าทำไมระบบจึงหยุดตอบ",
      ],
      whyTitle: "Why this matters — สะพานเชื่อมจาก Block B10 สู่ Classical ML และ RAG",
      whyParagraphs: [
        "คุณเพิ่งรวม 3 แกนคณิตศาสตร์ของ Phase 2 (Linear Algebra, Similarity Geometry และ Decision Theory) เข้าเป็นระบบที่ใช้งานได้จริงในไฟล์เดียว",
        "ใน Block B11 (พรุ่งนี้ Day 41) เราจะนำความเข้าใจเรื่องต้นทุนและโครงสร้างฟีเจอร์นี้ไปตัดสินใจเลือกระหว่าง Classical ML กับ LLM และเริ่มสร้างโมเดลทำนายจริงด้วย scikit-learn",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Mini Vector Search Engine เทียบกับ Backend Search API",
      body: [
        "สถาปัตยกรรมที่คุณเขียนในวันนี้คือโครงสร้างเดียวกับ endpoint `POST /search/batch` ที่มี confidence gate ก่อนส่งคำตอบกลับไปหน้าเว็บ:",
      ],
      table: [
        ["`normalize_matrix(docs)`", "Indexing step: เตรียมข้อมูลครั้งเดียวแล้ว cache ไว้ใน memory"],
        ["`unit_Q @ unit_D.T`", "Batch scoring ของคำถามทั้งหมดเทียบกับ index ใน 1 operation"],
        ["`np.argsort(-row, kind='stable')[:k]`", "Deterministic ranking + `.slice(0, k)`"],
        ["`top_score >= threshold ? 'auto_reply' : 'abstain'`", "Confidence guard ก่อนแสดงคำตอบอัตโนมัติใน UI"],
      ],
    },
    student: {
      title: "First-Year Note — อ่านมิติของ `unit_Q @ unit_D.T` ให้คล่องใน 10 วินาที",
      body: [
        "สัญลักษณ์ `.T` คือ **Transpose** (สลับแถวเป็นคอลัมน์) ถ้า `unit_D` มี 4 เอกสาร 4 มิติ รูป `(4, 4)` หรือ 10 เอกสาร 3 มิติ รูป `(10, 3)` พอใส่ `.T` จะพลิกเป็น `(3, 10)`",
        "ดังนั้นถ้าเรามี 2 คำถาม 3 มิติ `unit_Q` รูป `(2, 3)` เมื่อคูณ `unit_Q @ unit_D.T` จะเป็น `(2, 3) @ (3, 10)` → เลขตัวใน `3` ตรงกันพอดี ผลลัพธ์จึงได้ตาราง `(2, 10)` คือ 2 แถว (ตามจำนวนคำถาม) × 10 คอลัมน์ (คะแนนกับเอกสารทั้ง 10 ชิ้น)!",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองรัน Mini Cosine Search Engine เต็มรูปแบบกับคลัง FAQ ภาษาไทย 4 เอกสาร (4 มิติ `[tax, refund, shipping, other]`, รวมเอกสารว่าง 1 ชิ้น) และคำถามพร้อมกัน 2 ข้อ (ข้อแรกตรงเรื่องใบกำกับภาษี, ข้อสองอยู่นอกขอบเขตคลัง)",
    steps: [
      {
        title: "1 · สร้างเมทริกซ์คลังเอกสารและคำถาม แล้วทำ L2 Normalize อย่างปลอดภัย",
        explain:
          "สังเกตว่าเอกสาร `FAQ-EMPTY` เป็นเวกเตอร์ศูนย์ `[0, 0, 0, 0]` — ฟังก์ชัน `normalize_matrix` ต้องคงแถวนี้ไว้เป็นศูนย์ทั้งหมดโดยไม่เกิด `NaN`",
        code: {
          language: "python",
          filename: "worked_day40.py",
          code: `import numpy as np

doc_ids = ["FAQ-TAX", "FAQ-REFUND", "FAQ-SHIP", "FAQ-EMPTY"]
# มิติ: [tax, refund, shipping, other]
docs = np.array(
    [
        [8.0, 1.0, 0.0, 0.0],
        [1.0, 9.0, 0.0, 0.0],
        [0.0, 0.0, 5.0, 0.0],
        [0.0, 0.0, 0.0, 0.0],
    ],
    dtype=np.float32,
)
queries = np.array(
    [
        [2.0, 0.25, 0.0, 0.0],  # Q0: "ขอใบกำกับภาษี" (ทิศเดียวกับ FAQ-TAX)
        [0.2, 0.0, 0.0, 2.0],   # Q1: "ถามเรื่องโปรโมชันหน้าร้าน" (นอกคลัง)
    ],
    dtype=np.float32,
)

def normalize_matrix(mat: np.ndarray) -> np.ndarray:
    arr = np.asarray(mat, dtype=np.float32)
    norms = np.linalg.norm(arr, ord=2, axis=1, keepdims=True)
    safe = np.where(norms == 0.0, 1.0, norms)
    return (arr / safe).astype(np.float32)

unit_docs = normalize_matrix(docs)
unit_queries = normalize_matrix(queries)
print("Any NaN in unit_docs?", bool(np.isnan(unit_docs).any()))`,
        },
        output: `Any NaN in unit_docs? False`,
      },
      {
        title: "2 · คำนวณ Batch Cosine Similarity (`unit_queries @ unit_docs.T`) และคัด Top-2",
        explain:
          "คูณเมทริกซ์ครั้งเดียวได้ตารางคะแนน `(2, 4)` แล้ว clip ให้อยู่ใน `[-1.0, 1.0]` จากนั้นคัด top-2 ด้วย `np.argsort(-row, kind=\"stable\")[:2]`",
        code: {
          language: "python",
          filename: "worked_day40.py",
          code: `sim_matrix = np.clip(unit_queries @ unit_docs.T, -1.0, 1.0)

for q_idx, row in enumerate(sim_matrix):
    top_idx = np.argsort(-row, kind="stable")[:2]
    hits = [(doc_ids[i], round(float(row[i]), 4)) for i in top_idx]
    print(f"Q{q_idx} top-2 -> {hits}")`,
        },
        output: `Q0 top-2 -> [('FAQ-TAX', 1.0), ('FAQ-REFUND', 0.2329)]
Q1 top-2 -> [('FAQ-TAX', 0.0987), ('FAQ-REFUND', 0.011)]`,
      },
      {
        title: "3 · ผ่านด่าน Abstention ด้วยจุดคุ้มทุน Expected Value (`gain=20, cost=80`)",
        explain:
          "จุดคุ้มทุน `p* = 80 / (20 + 80) = 0.80` — คำถาม Q0 ได้คะแนน `1.0000 >= 0.80` จึงตอบอัตโนมัติด้วย `FAQ-TAX` ส่วน Q1 ได้เพียง `0.0987 < 0.80` ระบบจึง `abstain` ส่งต่อเจ้าหน้าที่",
        code: {
          language: "python",
          filename: "worked_day40.py",
          code: `gain_thb, wrong_cost_thb = 20.0, 80.0
threshold = wrong_cost_thb / (gain_thb + wrong_cost_thb)

for q_idx, row in enumerate(sim_matrix):
    best_i = int(np.argsort(-row, kind="stable")[0])
    best_score = float(row[best_i])
    if best_score >= threshold:
        print(f"Q{q_idx} -> AUTO_REPLY ({doc_ids[best_i]}, score={best_score:.4f} >= {threshold:.2f})")
    else:
        print(f"Q{q_idx} -> ABSTAIN (best={best_score:.4f} < {threshold:.2f}, escalate to human)")`,
        },
        output: `Q0 -> AUTO_REPLY (FAQ-TAX, score=1.0000 >= 0.80)
Q1 -> ABSTAIN (best=0.0987 < 0.80, escalate to human)`,
      },
    ],
    gotcha:
      "จุดสังเกต: ในงานจริงค่า Cosine Similarity ดิบของโมเดล embedding (เช่นช่วง `0.55–0.85`) อาจไม่ได้เท่ากับความน่าจะเป็นที่ผ่านการ calibrate โดยตรง 1:1 — ใน Phase 4–5 เราจะหา mapping หรือเกณฑ์ที่ calibrate บน Golden Dataset แทนการใช้เลขดิบตรง ๆ",
  },

  practice: {
    intro:
      "โจทย์ทบทวน Block B10 (15 นาที): สร้าง Mini Cosine Similarity Search Engine แบบ batch ด้วย NumPy (`exercise_day40.py`) ที่รวม L2 normalization แบบ zero-safe, การค้นหา `Q @ D.T`, และด่าน Abstention จาก Expected Value",
    requirements: [
      "`normalize_matrix(matrix: np.ndarray) -> np.ndarray`: รับเมทริกซ์ 2D ไม่ว่าง แปลงเป็น `np.float32` และ L2-normalize ทีละแถว (`axis=1, keepdims=True`) โดยแถวศูนย์ต้องคงเป็นศูนย์ (ห้ามเกิด `NaN`) ถ้าไม่เป็น 2D หรือว่างให้โยน `ValueError`",
      "`batch_top_k_search(doc_matrix: np.ndarray, query_matrix: np.ndarray, k: int = 2) -> list[list[tuple[int, float]]]`: ตรวจ `k > 0`, ทั้งสองเมทริกซ์เป็น 2D ไม่ว่าง และมีจำนวนคอลัมน์เท่ากัน (ไม่งั้นโยน `ValueError`) จากนั้นคำนวณ `sim = np.clip(unit_queries @ unit_docs.T, -1.0, 1.0)` แล้วคืน top-`min(k, n_docs)` `(doc_index, score)` ของแต่ละคำถามเรียงคะแนนมากไปน้อยแบบ `kind=\"stable\"`",
      "`search_with_abstention(doc_matrix, query_matrix, doc_ids, gain_thb, wrong_cost_thb, k=2) -> list[dict[str, object]]`: ตรวจ `len(doc_ids) == doc_matrix.shape[0]`, `gain_thb > 0`, `wrong_cost_thb >= 0` แล้วคำนวณ `threshold = wrong_cost_thb / (gain_thb + wrong_cost_thb)`",
      "สำหรับแต่ละคำถาม คืน dict ที่มีคีย์ `action` (`\"auto_reply\"` เมื่อ `top_score >= threshold` มิฉะนั้น `\"abstain\"`), `threshold`, `top_doc_id` (เป็น `str` เมื่อ `auto_reply` และ `None` เมื่อ `abstain`), `top_score` และ `candidates` (`list[tuple[str, float]]`)",
      "ผ่าน `uv run pytest -q` และ `uv run ruff check .` โดยไม่มี warning",
    ],
    starter: {
      language: "python",
      filename: "exercise_day40.py",
      code: `import numpy as np


def normalize_matrix(matrix: np.ndarray) -> np.ndarray:
    """L2-normalize แต่ละแถวของเมทริกซ์ 2D เป็น float32 โดยกันแถวศูนย์ไม่ให้เกิด NaN"""
    # TODO: ตรวจ 2D ไม่ว่าง, แปลงเป็น float32, ใช้ np.where กัน norm == 0
    raise NotImplementedError


def batch_top_k_search(
    doc_matrix: np.ndarray,
    query_matrix: np.ndarray,
    k: int = 2,
) -> list[list[tuple[int, float]]]:
    """ค้นหา top-k เอกสารสำหรับทุกคำถามพร้อมกันด้วย unit_Q @ unit_D.T"""
    # TODO: ตรวจ k > 0 และมิติ, normalize, คูณเมทริกซ์, คัด top-k ด้วย stable argsort
    raise NotImplementedError


def search_with_abstention(
    doc_matrix: np.ndarray,
    query_matrix: np.ndarray,
    doc_ids: list[str],
    gain_thb: float,
    wrong_cost_thb: float,
    k: int = 2,
) -> list[dict[str, object]]:
    """ค้นหาเอกสารพร้อมด่าน Abstention ที่คำนวณจุดตัดจาก Expected Value"""
    # TODO: ตรวจ doc_ids / gain / cost, คำนวณ threshold, เรียก batch_top_k_search แล้วตัดสินใจ
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day40.py",
      code: `import numpy as np
import pytest
from exercise_day40 import (
    batch_top_k_search,
    normalize_matrix,
    search_with_abstention,
)


def test_normalize_matrix_zero_safe_and_float32():
    mat = np.array([[3.0, 4.0], [0.0, 0.0], [0.0, 5.0]])
    normed = normalize_matrix(mat)
    assert normed.dtype == np.float32
    assert not np.isnan(normed).any()
    assert normed[0] == pytest.approx([0.6, 0.8], abs=1e-5)
    assert normed[1] == pytest.approx([0.0, 0.0])
    assert normed[2] == pytest.approx([0.0, 1.0])

    with pytest.raises(ValueError):
        normalize_matrix(np.array([1.0, 2.0]))
    with pytest.raises(ValueError):
        normalize_matrix(np.empty((0, 3)))


def test_batch_top_k_search_ranking_and_zero_query():
    docs = np.array([
        [8.0, 1.0, 0.0, 0.0],
        [1.0, 9.0, 0.0, 0.0],
        [0.0, 0.0, 5.0, 0.0],
        [0.0, 0.0, 0.0, 0.0],
    ])
    queries = np.array([
        [2.0, 0.25, 0.0, 0.0],  # ตรงกับ doc 0 เป๊ะ
        [0.0, 0.0, 0.0, 0.0],   # zero query -> ทุกคะแนนเป็น 0.0, tie-break 0 แล้ว 1
    ])
    results = batch_top_k_search(docs, queries, k=2)
    assert len(results) == 2

    assert results[0][0][0] == 0
    assert results[0][0][1] == pytest.approx(1.0, abs=1e-5)
    assert results[0][1][0] == 1
    assert results[0][1][1] == pytest.approx(0.2329, abs=1e-3)

    assert [idx for idx, _ in results[1]] == [0, 1]
    assert all(score == pytest.approx(0.0) for _, score in results[1])


def test_search_with_abstention_ev_gate():
    doc_ids = ["FAQ-TAX", "FAQ-REFUND", "FAQ-SHIP", "FAQ-EMPTY"]
    docs = np.array([
        [8.0, 1.0, 0.0, 0.0],
        [1.0, 9.0, 0.0, 0.0],
        [0.0, 0.0, 5.0, 0.0],
        [0.0, 0.0, 0.0, 0.0],
    ])
    queries = np.array([
        [2.0, 0.25, 0.0, 0.0],  # score 1.0000 >= 0.80 -> auto_reply
        [0.2, 0.0, 0.0, 2.0],   # score 0.0987 <  0.80 -> abstain
    ])
    out = search_with_abstention(
        docs,
        queries,
        doc_ids=doc_ids,
        gain_thb=20.0,
        wrong_cost_thb=80.0,
        k=2,
    )
    assert len(out) == 2
    assert out[0]["action"] == "auto_reply"
    assert out[0]["top_doc_id"] == "FAQ-TAX"
    assert out[0]["threshold"] == pytest.approx(0.80)

    assert out[1]["action"] == "abstain"
    assert out[1]["top_doc_id"] is None
    assert out[1]["top_score"] == pytest.approx(0.0987, abs=1e-3)
    assert len(out[1]["candidates"]) == 2


def test_invalid_inputs_raise_value_error():
    docs = np.array([[1.0, 0.0], [0.0, 1.0]])
    queries = np.array([[1.0, 0.0]])
    with pytest.raises(ValueError):
        batch_top_k_search(docs, queries, k=0)
    with pytest.raises(ValueError):
        batch_top_k_search(docs, np.array([[1.0, 0.0, 0.0]]), k=1)
    with pytest.raises(ValueError):
        search_with_abstention(docs, queries, doc_ids=["ONLY-ONE"], gain_thb=20.0, wrong_cost_thb=80.0)
    with pytest.raises(ValueError):
        search_with_abstention(docs, queries, doc_ids=["A", "B"], gain_thb=0.0, wrong_cost_thb=80.0)
`,
    },
    selfCheck: [
      "`normalize_matrix` คืน `float32`, จัดการแถวศูนย์โดยไม่เกิด `NaN` และโยน `ValueError` เมื่ออินพุตไม่ใช่ 2D หรือว่าง",
      "`batch_top_k_search` คำนวณทุกคำถามพร้อมกันด้วย `unit_queries @ unit_docs.T` และใช้ `kind=\"stable\"` เพื่อให้ tie-breaking คงที่",
      "`search_with_abstention` ใช้จุดตัด `wrong_cost_thb / (gain_thb + wrong_cost_thb)` และคืน `top_doc_id=None` เมื่อ `action == \"abstain\"`",
      "ตรวจจับอินพุตผิดเงื่อนไขครบ (k <= 0, มิติไม่ตรง, จำนวน `doc_ids` ไม่ตรง, `gain <= 0`)",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance:
      "ผ่านทั้ง 4 test functions ใน `test_day40.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `normalize_matrix` ตรวจ `if arr.ndim != 2 or arr.shape[0] == 0 or arr.shape[1] == 0: raise ValueError(...)` ก่อนหา `norms = np.linalg.norm(arr, ord=2, axis=1, keepdims=True)`",
      },
      {
        body: "ใน `batch_top_k_search` ให้เรียก `unit_docs = normalize_matrix(doc_matrix)` และ `unit_queries = normalize_matrix(query_matrix)` เช็ก `unit_docs.shape[1] == unit_queries.shape[1]` แล้วคำนวณ `sim = np.clip(unit_queries @ unit_docs.T, -1.0, 1.0)`",
      },
      {
        body: "โครงของ `normalize_matrix` และ `batch_top_k_search` เกือบสมบูรณ์ เหลือเติมด่าน Abstention ใน `search_with_abstention`:",
        code: {
          language: "python",
          filename: "hint_day40.py",
          code: `import numpy as np


def normalize_matrix(matrix: np.ndarray) -> np.ndarray:
    arr = np.asarray(matrix, dtype=np.float32)
    if arr.ndim != 2 or arr.shape[0] == 0 or arr.shape[1] == 0:
        raise ValueError("matrix must be a non-empty 2D array")
    norms = np.linalg.norm(arr, ord=2, axis=1, keepdims=True)
    safe_norms = np.where(norms == 0.0, 1.0, norms)
    return (arr / safe_norms).astype(np.float32)


def batch_top_k_search(
    doc_matrix: np.ndarray,
    query_matrix: np.ndarray,
    k: int = 2,
) -> list[list[tuple[int, float]]]:
    if k <= 0:
        raise ValueError("k must be positive")
    unit_docs = normalize_matrix(doc_matrix)
    unit_queries = normalize_matrix(query_matrix)
    if unit_docs.shape[1] != unit_queries.shape[1]:
        raise ValueError("doc_matrix and query_matrix must have the same feature dimension")

    sim = np.clip(unit_queries @ unit_docs.T, -1.0, 1.0)
    k_eff = min(k, unit_docs.shape[0])
    results: list[list[tuple[int, float]]] = []
    for row in sim:
        top_idx = np.argsort(-row, kind="stable")[:k_eff]
        results.append([(int(i), float(row[i])) for i in top_idx])
    return results


def search_with_abstention(
    doc_matrix: np.ndarray,
    query_matrix: np.ndarray,
    doc_ids: list[str],
    gain_thb: float,
    wrong_cost_thb: float,
    k: int = 2,
) -> list[dict[str, object]]:
    if gain_thb <= 0.0 or wrong_cost_thb < 0.0:
        raise ValueError("gain_thb must be > 0 and wrong_cost_thb must be >= 0")
    if len(doc_ids) != np.asarray(doc_matrix).shape[0]:
        raise ValueError("doc_ids length must match number of rows in doc_matrix")
    threshold = float(wrong_cost_thb / (gain_thb + wrong_cost_thb))
    batch_hits = batch_top_k_search(doc_matrix, query_matrix, k=k)
    # TODO: วนแต่ละ hits ใน batch_hits ตรวจ top_score >= threshold เพื่อสร้าง dict ผลลัพธ์
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
      title: "ลืมทรานสโพส `.T` ใน `unit_queries @ unit_docs`",
      symptom:
        "เกิด `ValueError: matmul: Input operand 1 has a mismatch in its core dimension` (หรือคูณผิดแกนเงียบ ๆ เมื่อ `unit_docs` เป็นเมทริกซ์จัตุรัส `(N, N)`!)",
      fix: "เขียน `unit_queries @ unit_docs.T` เสมอเพื่อให้ `(M, D) @ (D, N) -> (M, N)` และทดสอบด้วยเคสที่จำนวนเอกสารไม่เท่าจำนวนมิติ (`N != D`)",
    },
    {
      title: "ปล่อยให้ Vector Search ตอบทุกคำถามโดยไม่มี Abstention Threshold",
      symptom:
        "ลูกค้าถามคำถามนอกคลังความรู้ แต่ระบบยังหยิบเอกสารอันดับ 1 ที่คะแนนแค่ `0.10` มาตอบอย่างมั่นใจ",
      fix: "วางด่านตรวจ `top_score >= threshold` (ผูกกับต้นทุนธุรกิจ / Expected Value) และคืน `abstain` ส่งต่อเจ้าหน้าที่เมื่อไม่ถึงเกณฑ์",
    },
    {
      title: "ไม่ใส่ `np.clip(..., -1.0, 1.0)` หลังคำนวณ `float32` Cosine Similarity",
      symptom:
        "เวกเตอร์ที่ชี้ทิศเดียวกันเป๊ะได้คะแนน `1.0000001` จนไปพังด่านตรวจช่วงค่า `[-1, 1]` หรือสูตร `sqrt(2 - 2*cos)` ที่ปลายทาง",
      fix: "ครอบผลคูณเมทริกซ์ด้วย `np.clip(unit_queries @ unit_docs.T, -1.0, 1.0)` เสมอ",
    },
    {
      title: "ไม่ใส่ `kind=\"stable\"` ใน `np.argsort` แล้วผล tie-breaking แกว่ง",
      symptom:
        "เมื่อเจอ zero query ที่คะแนนทุกเอกสารเท่ากับ `0.0` ลำดับดัชนีที่ได้ไม่ตรงกันข้ามเวอร์ชันหรือชุดข้อมูลใหญ่ขึ้น",
      fix: "ใช้ `np.argsort(-row, kind=\"stable\")[:k_eff]` เพื่อให้ลำดับดัชนีเดิมถูกรักษาไว้เสมอเมื่อคะแนนเท่ากัน",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d040-q1",
        "ถ้า `unit_queries` มีรูป `(5, 384)` และ `unit_docs` มีรูป `(1000, 384)` นิพจน์ใดคำนวณตาราง Cosine Similarity ของทั้ง 5 คำถามเทียบกับ 1,000 เอกสารได้ถูกต้องและมีรูปผลลัพธ์เป็นเท่าใด?",
        [
          ["`unit_queries @ unit_docs` ได้รูป `(5, 1000)`", "ผิด — `(5, 384) @ (1000, 384)` คูณไม่ได้เพราะแกนใน `384 != 1000`"],
          ["`unit_queries @ unit_docs.T` ได้รูป `(5, 1000)`", "ถูก — `(5, 384) @ (384, 1000) -> (5, 1000)` แถว `i` คอลัมน์ `j` คือความคล้ายของคำถาม `i` กับเอกสาร `j`"],
          ["`unit_queries * unit_docs` ได้รูป `(5, 1000)`", "ผิด — `*` คือคูณรายช่องและ broadcast ไม่ได้"],
          ["`unit_docs @ unit_queries` ได้รูป `(1000, 5)`", "ผิด — `(1000, 384) @ (5, 384)` แกนในไม่ตรงกัน ต้องใส่ `.T` ที่ตัวหลัง"],
        ],
        "B",
        "การทรานสโพส `unit_docs.T` เปลี่ยนรูปจาก `(1000, 384)` เป็น `(384, 1000)` ทำให้คูณกับ `(5, 384)` ได้ตารางความคล้าย `(5, 1000)` ในคำสั่งเดียว",
        "จะคำนวณ Cosine Similarity แบบ batch ระหว่าง `unit_queries (M, D)` กับ `unit_docs (N, D)` ด้วยสูตรใด?",
        "`unit_queries @ unit_docs.T` — ได้เมทริกซ์คะแนนรูป `(M, N)` ใน BLAS call เดียว",
      ),
      mc(
        "d040-q2",
        "ข้อใดคือชุดคำสั่งที่ปลอดภัยที่สุดสำหรับ L2-normalize เมทริกซ์ `X` รูป `(N, D)` ที่อาจมีแถวศูนย์ `[0, 0, ...]` ปนอยู่?",
        [
          ["`X / np.linalg.norm(X, axis=1)`", "ผิด 2 จุด — ลืม `keepdims=True` และไม่กันหารศูนย์"],
          ["`norms = np.linalg.norm(X, ord=2, axis=1, keepdims=True); X / np.where(norms == 0.0, 1.0, norms)`", "ถูก — คงรูป `(N, 1)` ให้ broadcast ถูกแกน และแถวศูนย์ยังคงเป็นศูนย์โดยไม่เกิด `NaN`"],
          ["`X / np.linalg.norm(X, ord=1, axis=1, keepdims=True)`", "ผิด — นั่นคือ L1 normalization ไม่ใช่ L2 และยังไม่กันหารศูนย์"],
          ["`X / np.linalg.norm(X)`", "ผิด — ลืม `axis=1` จึงหารด้วย norm ของทั้งเมทริกซ์แทนรายแถว"],
        ],
        "B",
        "ต้องทำครบทั้ง 3 อย่าง: `ord=2` (L2), `axis=1, keepdims=True` (หารถูกแกนแม้เป็นเมทริกซ์จัตุรัส) และ `np.where(norms == 0.0, 1.0, norms)` (กัน `NaN`)",
        "3 เงื่อนไขสำคัญของการเขียน `normalize_matrix` ที่ปลอดภัยใน NumPy คืออะไร?",
        "1) ใช้ L2 norm รายแถว (`axis=1`), 2) ใส่ `keepdims=True` กัน broadcast ผิดแกน, 3) แทนที่ `norm == 0` ด้วย `1.0` เพื่อกัน `NaN`",
      ),
      mc(
        "d040-q3",
        "ในระบบค้นหา FAQ ที่ตอบถูกประหยัดได้ `25` บาท แต่ตอบผิดเสียหาย `100` บาท คำถามลูกค้าได้คะแนน top-1 เพียง `0.65` (เทียบได้กับความน่าจะเป็นที่ตอบถูก 65%) ระบบควรทำอย่างไร?",
        [
          ["`auto_reply` เพราะคะแนนเกิน `0.50` แล้ว", "ผิด — ที่ `p = 0.65` จะได้ `EV = 0.65(25) - 0.35(100) = 16.25 - 35 = -18.75` บาท (ขาดทุน!)"],
          ["`abstain` ส่งต่อเจ้าหน้าที่ เพราะจุดคุ้มทุนคือ `100 / 125 = 0.80` และ `0.65 < 0.80`", "ถูก — การหยุดตอบช่วยหลีกเลี่ยงการขาดทุนเฉลี่ย `18.75` บาทต่อเคส"],
          ["`auto_reply` โดยส่งเอกสาร top-3 ทั้งหมดให้ลูกค้าอ่านเอง", "ยังไม่ได้แก้ความเสี่ยงของการเดาในเคสที่ความมั่นใจต่ำกว่าจุดคุ้มทุน"],
          ["เพิ่มค่า `k` เป็น 10 เพื่อให้คะแนน top-1 สูงขึ้น", "การเปลี่ยน `k` ไม่ได้เปลี่ยนคะแนนของอันดับ 1 เลย"],
        ],
        "B",
        "จุดคุ้มทุนจาก Expected Value คือ `100 / (25 + 100) = 0.80` เมื่อคะแนน `0.65 < 0.80` ค่า EV ติดลบ (`-18.75` บาท) จึงต้อง `abstain`",
        "ทำไม Mini Vector Search Engine จึงต้องมีด่าน Abstention จาก Expected Value?",
        "เพราะการค้นหาจะคืนเอกสารอันดับ 1 เสมอแม้ไม่เกี่ยวข้อง หากไม่หยุดตอบเมื่อคะแนนต่ำกว่าจุดคุ้มทุน `cost / (gain + cost)` ระบบจะตอบผิดและขาดทุนเชิงสถิติ",
      ),
      mc(
        "d040-q4",
        "เหตุใดเราจึงควรส่ง `kind=\"stable\"` ให้กับ `np.argsort(-row, kind=\"stable\")[:k]` ในฟังก์ชันค้นหา?",
        [
          ["เพื่อให้ NumPy เปลี่ยนชนิดข้อมูลเป็น `float32` อัตโนมัติ", "ไม่เกี่ยวกัน — `argsort` คืน array ของดัชนีจำนวนเต็ม"],
          ["เพื่อให้เมื่อมีเอกสารที่ได้คะแนนเท่ากัน ลำดับดัชนีเดิมถูกคงไว้เสมอ (deterministic) ลดโอกาสเทสต์แกว่ง", "ถูก — โดยเฉพาะกรณี zero query หรือเอกสารซ้ำที่คะแนนเท่ากันเป๊ะ"],
          ["เพื่อให้คำนวณ Cosine Similarity แทน Dot Product โดยอัตโนมัติ", "ไม่จริง — `argsort` ทำหน้าที่จัดเรียงดัชนีเท่านั้น"],
          ["เพื่อตัดค่า `NaN` ออกจากอาร์เรย์ให้อัตโนมัติ", "`argsort` ไม่ลบ `NaN` ต้องป้องกันตั้งแต่ขั้น `normalize_matrix`"],
        ],
        "B",
        "Stable sort รับประกันว่าเมื่อสมาชิกมีค่าเท่ากัน ตำแหน่งเดิมก่อนเรียงจะถูกรักษาไว้ ทำให้ผลลัพธ์และ unit test คงที่ 100% ทุกครั้งที่รัน",
        "ประโยชน์ของ `kind=\"stable\"` ใน `np.argsort(-row, kind=\"stable\")` คืออะไร?",
        "รักษาลำดับดัชนีเดิมเมื่อคะแนนเท่ากัน ทำให้การคัด top-k เป็นแบบ deterministic และทดสอบซ้ำได้แน่นอน",
      ),
    ],
  },

  takeaways: [
    "การรวม **L2 Normalization** (D38) กับ **`unit_queries @ unit_docs.T`** (D37) ทำให้ค้นหา {{cosine-similarity}} แบบ batch สำหรับหลายคำถามพร้อมกันได้ใน BLAS call เดียว",
    "ฟังก์ชันค้นหาที่พร้อมใช้จริงต้องมีครบ 4 เกราะป้องกัน: `float32` + เช็กมิติแบบ fail-fast, `keepdims=True`, zero-vector guard (`NaN`-free), และ `np.clip(..., -1.0, 1.0)` + `kind=\"stable\"`",
    "การผสาน **{{expected-value}}** (`p* = cost / (gain + cost)`) เป็นด่าน **Abstention** ช่วยป้องกันไม่ให้ระบบค้นหาฝืนตอบเมื่อคำถามอยู่นอกคลังข้อมูล",
    "คุณพร้อมขึ้น **Block B11 (Days 41–44)** แล้ว — พรุ่งนี้เราจะเริ่มเข้าสู่โลก Classical ML ด้วยเกณฑ์ตัดสินใจ ML vs LLM และสร้าง pipeline ด้วย scikit-learn",
  ],

  reviewCards: [
    rc(
      "d040-rc-1",
      "ทำไม `unit_queries @ unit_docs.T` จึงให้ตาราง Cosine Similarity ของทุกคู่คำถาม-เอกสารในครั้งเดียว?",
      "เพราะทุกแถวถูก L2-normalize ให้ยาว 1 แล้ว Dot Product ของแถวคำถาม `i` กับคอลัมน์เอกสาร `j` (จาก `.T`) จึงเท่ากับ Cosine Similarity พอดี และได้เมทริกซ์รูป `(n_queries, n_docs)`",
    ),
    rc(
      "d040-rc-2",
      "เกิดอะไรขึ้นถ้าเราไม่ใส่ `np.clip(sim, -1.0, 1.0)` หลังคำนวณ `unit_Q @ unit_D.T` ด้วย `float32`?",
      "ความคลาดเคลื่อนทศนิยมของ `float32` อาจทำให้ค่าที่ควรเป็น `1.0` กลายเป็น `1.0000001` ซึ่งอาจทำให้ validation หรือสูตร `sqrt(2 - 2*cos)` คืน `NaN`",
    ),
    rc(
      "d040-rc-3",
      "เมื่อคลัง FAQ มีแค่เรื่องบัญชีกับจัดส่ง แต่ลูกค้าถามเรื่องที่จอดรถ Mini Search Engine ที่ดีควรตอบสนองอย่างไร?",
      "ควรเปรียบเทียบคะแนน top-1 กับเกณฑ์ Abstention (`cost / (gain + cost)`) เมื่อคะแนนต่ำกว่าเกณฑ์ให้คืน `action=\"abstain\"` (`top_doc_id=None`) เพื่อส่งต่อเจ้าหน้าที่แทนการเดา",
    ),
  ],

  sources: [
    {
      label: "NumPy Reference — numpy.argsort (Sorting Algorithms & Stability)",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.argsort.html",
    },
    {
      label: "NumPy Reference — numpy.clip & Matrix Multiplication",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.clip.html",
    },
    {
      label: "NumPy Reference — numpy.linalg.norm",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.linalg.norm.html",
    },
    {
      label: "Qdrant Documentation — Vector Search & Score Thresholding",
      href: "https://qdrant.tech/documentation/concepts/search/#score-threshold",
    },
  ],

  glossary: [
    "dot-product",
    "cosine-similarity",
    "expected-value",
    "embedding",
    "top-k",
    "rag",
    "hitl",
    "pytest",
  ],
});
