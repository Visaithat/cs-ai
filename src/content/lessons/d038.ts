import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D038 — Phase 2 / Block B10
 * Cosine Similarity vs Euclidean Distance (Why embeddings use Cosine)
 */
export const d038: Lesson = defineLesson({
  day: 38,
  titleTh: "Cosine Similarity vs Euclidean Distance — ทำไมระบบ Embeddings จึงวัดที่มุม",
  tagline: "30 นาที · มองเห็นภาพมุมเทียบระยะห่างใน NumPy พร้อม L2 Normalization สำหรับ Semantic Search",
  icon: "compass",
  visual: {
    id: "cosine-vectors",
    title: "Cosine Similarity vs Euclidean Distance ในพื้นที่ 2 มิติ",
    caption: "เลื่อนมุมและขนาดเวกเตอร์เพื่อดูว่าทำไมเอกสารสั้นกับยาวที่ความหมายเดียวกันจึงได้ค่า Cosine สูง",
    alt: "แผนภาพเวกเตอร์ 2 มิติเปรียบเทียบมุมโคไซน์กับระยะยุคลิด",
  },
  requiresApiKey: false,
  tools: ["NumPy", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "แปลงข้อความเป็นเวกเตอร์ตัวเลข",
      body: "ไม่ว่าจะเป็นเวกเตอร์นับคำแบบคลาสสิกหรือ dense {{embedding}} จากโมเดลภาษา เอกสารและคำถามของลูกค้าจะถูกแทนด้วยเวกเตอร์ตัวเลขในพื้นที่หลายมิติ",
      lessonNote: "วันนี้เราสร้างสัญชาตญาณเชิงเรขาคณิตด้วย NumPy ว่าการวัดความใกล้กันของเวกเตอร์สองแบบให้ผลต่างกันอย่างไร",
    },
    {
      node: 2,
      heading: "จัดอันดับเอกสารที่ความหมายใกล้เคียงที่สุด",
      body: "หัวใจของ Semantic Search และ {{rag}} คือการเทียบเวกเตอร์คำถามกับเวกเตอร์เอกสารนับหมื่นชิ้นเพื่อคัด {{top-k}} ชิ้นที่เกี่ยวข้องที่สุด",
      lessonNote: "{{cosine-similarity}} วัดที่ทิศทาง (มุม) ไม่หลงไปกับความยาวเอกสาร และเมื่อทำ L2 normalization แล้วจะคำนวณเร็วมากด้วย {{dot-product}}",
    },
    {
      node: 3,
      heading: "เลือก Metric ให้ตรงกับดัชนีค้นหา",
      body: "Vector Database และดัชนี {{hnsw}} (ใน Phase 4) ให้เราเลือกว่าจะวัดระยะแบบ Cosine, Inner Product หรือ L2 (Euclidean) — ถ้าเลือกไม่ตรงกับตอน normalize ผลจัดอันดับจะเพี้ยน",
      lessonNote: "เข้าใจความสัมพันธ์ทางคณิตศาสตร์ระหว่าง Cosine, Dot Product และ Euclidean บน unit vectors เพื่อไม่ตั้งค่าดัชนีผิดใน Production",
    },
    {
      node: 4,
      heading: "นำฟังก์ชันจัดอันดับไปใช้จริงในแอป",
      body: "เมื่อค้นหาเอกสารในแอปจริง เราต้องคำนวณความคล้ายกับคลังเอกสารทั้งก้อนพร้อมกันแบบ vectorized ไม่ใช่วนลูปทีละตัว และต้องกันเคสขอบอย่างเวกเตอร์ศูนย์",
      lessonNote: "แบบฝึกหัดวันนี้สร้าง mini semantic ranker ด้วย NumPy ที่รองรับ L2 normalization และผ่านเทสต์ {{pytest}}",
    },
  ],

  objectives: [
    "**อธิบายความแตกต่างเชิงเรขาคณิต** ระหว่าง {{cosine-similarity}} (วัดมุม/ทิศทาง) กับ Euclidean Distance (วัดระยะเส้นตรงรวมขนาดเวกเตอร์) ได้อย่างชัดเจน",
    "**คำนวณและทำ L2 Normalization** บนเวกเตอร์และเมทริกซ์ด้วย NumPy พร้อมจัดการกรณีเวกเตอร์ศูนย์ (`norm == 0`) ไม่ให้เกิด `NaN`",
    "**พิสูจน์ด้วยโค้ด** ว่าเมื่อเวกเตอร์ทุกตัวเป็น unit vector แล้ว `a @ b` ({{dot-product}}) ให้ค่าเท่ากับ Cosine Similarity เป๊ะและจัดอันดับตรงกับ Euclidean Distance",
  ],

  prerequisites: [
    "ผ่าน Day 37 เรื่องเวกเตอร์, {{dot-product}} และ vector norm ใน NumPy",
    "เข้าใจพื้นฐาน NumPy array (`np.array`, `.shape`, `axis=1`) และ broadcasting",
    "รู้จักฟังก์ชันโคไซน์ (cos 0° = 1, cos 90° = 0, cos 180° = -1) ระดับมัธยมปลาย",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ขนาดเล็กด้วย {{uv}} และติดตั้ง `numpy` เพื่อทดลองคำนวณและรันเทสต์ความคล้ายของเวกเตอร์บนเครื่อง",
    commands: `uv init ai-day38 && cd ai-day38
uv add numpy
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('NumPy:', np.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day38` ด้วย `uv init`"],
      ["numpy", "ติดตั้ง `numpy`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็นเลขเวอร์ชัน NumPy"],
    ],
    note: "โค้ดทั้งหมดใช้เพียง NumPy บน CPU รันเสร็จภายในไม่กี่มิลลิวินาที",
  },

  concepts: [
    {
      id: "angle-vs-distance",
      title: "1 · มุม (Cosine) vs ระยะเส้นตรง (Euclidean): ทำไมความยาวจึงหลอกตาได้",
      paragraphs: [
        "สมมติเราแทนข้อความด้วยเวกเตอร์ 2 มิติ `[จำนวนคำว่า 'ใบกำกับภาษี', จำนวนคำว่า 'ส่งสินค้า']` — ข้อความสั้น *\"ขอใบกำกับภาษี\"* ได้เวกเตอร์ `[1, 0]` ส่วนบทความยาวที่พูดเรื่องเดียวกันซ้ำ 10 รอบได้ `[10, 0]` และข้อความคนละเรื่อง *\"สถานะส่งสินค้า\"* ได้ `[0, 1]`",
        "ถ้าวัดด้วย **Euclidean Distance** (`||a - b||`) ระยะระหว่าง `[1, 0]` กับ `[0, 1]` คือ `1.414` แต่ระยะระหว่าง `[1, 0]` กับ `[10, 0]` กลับห่างถึง `9.0`! แปลว่า Euclidean มองว่าเอกสารคนละเรื่อง 'ใกล้กว่า' เอกสารเรื่องเดียวกันที่ยาวกว่า",
        "แต่ถ้าวัดด้วย **{{cosine-similarity}}** เราดูที่ *มุมระหว่างลูกศร* (`cos θ = (a · b) / (||a|| ||b||)`) — ทั้ง `[1, 0]` และ `[10, 0]` ชี้ไปทิศเดียวกันเป๊ะ (มุม 0°) จึงได้ค่า `1.0` เต็ม ส่วน `[1, 0]` กับ `[0, 1]` ตั้งฉากกัน (มุม 90°) ได้ `0.0`",
      ],
      analogy:
        "เหมือนเรือสองลำที่แล่นไปทางทิศเหนือเหมือนกัน ลำหนึ่งแล่นไป 1 กม. อีกลำแล่นไป 10 กม. — เข็มทิศ (Cosine) บอกว่ามุ่งหน้าไปทางเดียวกัน 100% แต่ไม้บรรทัด (Euclidean) บอกว่าอยู่ห่างกัน 9 กม.",
      bullets: [
        "**Cosine Similarity** มีค่าอยู่ระหว่าง `-1.0` (ตรงข้ามกัน) ถึง `1.0` (ทิศทางเดียวกันเป๊ะ), `0.0` คือตั้งฉากกัน (ไม่เกี่ยวข้องกันเชิงทิศทาง)",
        "**Cosine Distance** มักนิยามเป็น `1 - cosine_similarity` (ค่า `0` = เหมือนกันที่สุด) ระวังอย่าสับสนตอนอ่านเอกสารของ Vector DB",
        "**Euclidean Distance (L2)** เหมาะเมื่อ *ขนาด (magnitude)* มีความหมายจริง เช่น พิกัด GPS, ยอดใช้จ่ายลูกค้า (บาท) หรือฟีเจอร์เชิงปริมาณในงานตาราง",
      ],
      code: {
        language: "python",
        filename: "angle_vs_distance.py",
        code: `import numpy as np

short_tax = np.array([1.0, 0.0])     # "ขอใบกำกับภาษี"
long_tax = np.array([10.0, 0.0])     # บทความยาวเรื่องใบกำกับภาษี
shipping = np.array([0.0, 1.0])      # "สถานะส่งสินค้า"

def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def euclidean_dist(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a - b))

print("short vs long  | cos:", round(cosine_sim(short_tax, long_tax), 3), "| L2:", round(euclidean_dist(short_tax, long_tax), 3))
print("short vs ship  | cos:", round(cosine_sim(short_tax, shipping), 3), "| L2:", round(euclidean_dist(short_tax, shipping), 3))`,
        caption: "Euclidean บอกว่า short_tax ใกล้ shipping (1.414) มากกว่า long_tax (9.0) แต่ Cosine แยกความหมายถูก",
      },
      whyTitle: "Why this matters — ทำไมโมเดล Text Embeddings ส่วนใหญ่ใช้ Cosine",
      whyParagraphs: [
        "ในระบบค้นหาและ {{rag}} คำถามของผู้ใช้มักสั้น (5–10 คำ) แต่เอกสารในคลังความรู้ยาวเป็นย่อหน้า (100–300 คำ) โมเดล {{embedding}} ถูกฝึกให้แทน *ความหมาย* ด้วยทิศทางบนทรงกลมหลายมิติ (hypersphere)",
        "การใช้ Cosine Similarity ช่วยตัดอคติจากขนาดเวกเตอร์ออก ทำให้คำถามสั้น ๆ อย่าง *\"ขอใบกำกับภาษี\"* จับคู่กับย่อหน้าคู่มือการออกใบกำกับภาษีได้อย่างแม่นยำ",
      ],
    },
    {
      id: "l2-normalization-unit-vectors",
      title: "2 · L2 Normalization & Unit Vectors: เปลี่ยน Cosine ให้เป็น Dot Product ที่เร็วกว่า",
      paragraphs: [
        "ถ้าเราหารเวกเตอร์แต่ละตัวด้วยความยาวของมันเอง (`u = v / ||v||`) เราจะได้ **Unit Vector** ที่มีความยาวเท่ากับ `1.0` พอดี กระบวนการนี้เรียกว่า **L2 Normalization**",
        "เมื่อทั้ง `u` และ `v` เป็น unit vector สูตร Cosine Similarity `(u · v) / (||u|| ||v||)` จะมีตัวส่วนเป็น `1 × 1 = 1` จึงลดรูปเหลือแค่ **{{dot-product}}** (`u @ v`) เท่านั้น! ไม่ต้องคำนวณรากที่สองและหารซ้ำทุกครั้งที่ค้นหา",
        "ยิ่งไปกว่านั้น บน unit vectors ระยะ Euclidean กำลังสองจะเท่ากับ `||u - v||² = 2 - 2(u · v)` ซึ่งแปรผกผันแบบคงที่กับ Cosine Similarity แปลว่า **ถ้าคุณทำ L2 normalize ล่วงหน้าแล้ว การจัดอันดับด้วย Cosine, Dot Product และ Euclidean จะได้ลำดับเอกสารเหมือนกัน 100%**",
      ],
      analogy:
        "เหมือนย่อ-ขยายลูกศรทุกอันให้ยาวเท่ากัน 1 เมตรก่อนนำไปเทียบ — จากนั้นแค่ดูเงาที่ทาบกัน (`dot product`) ก็รู้ทันทีว่าชี้ไปทางเดียวกันแค่ไหน",
      code: {
        language: "python",
        filename: "unit_vectors.py",
        code: `import numpy as np

# เมทริกซ์เอกสาร 3 ชิ้น (แต่ละแถวคือ 1 เวกเตอร์ 3 มิติ)
docs = np.array([
    [3.0, 4.0, 0.0],
    [6.0, 8.0, 0.0],
    [0.0, 1.0, 5.0],
])

# L2 normalize ทีละแถว (keepdims=True เพื่อ broadcast ได้ถูกต้อง)
norms = np.linalg.norm(docs, axis=1, keepdims=True)
unit_docs = docs / norms

query = np.array([1.0, 1.0, 0.0])
unit_query = query / np.linalg.norm(query)

# คำนวณ Cosine Similarity กับทุกเอกสารพร้อมกันด้วย matrix-vector product เดียว
scores = unit_docs @ unit_query
print("Unit norms:", np.round(np.linalg.norm(unit_docs, axis=1), 4))
print("Cosine scores via @:", np.round(scores, 4))`,
        caption: "เมื่อ normalize ล่วงหน้าตอน indexing ตอน query จริงใช้แค่ `unit_docs @ unit_query` เร็วกว่ามาก",
      },
      whyTitle: "Why this matters — เชื่อมตรงไปยัง Vector Databases (pgvector / Qdrant)",
      whyParagraphs: [
        "ใน Phase 4 เมื่อคุณใช้ `pgvector` หรือ `Qdrant` กับดัชนี {{hnsw}} โมเดล embedding สมัยใหม่ส่วนใหญ่คืนเวกเตอร์ที่ L2-normalized มาแล้ว ทำให้เราเลือก metric เป็น Dot Product (`<#>`) หรือ Cosine (`<=>`) ได้อย่างมั่นใจและประหยัด CPU ตอนค้นหา",
        "ในทางกลับกัน ถ้าโมเดลไม่ได้ normalize มาให้ แล้วคุณเผลอตั้ง Vector DB เป็น Dot Product ตรง ๆ เอกสารที่มี norm ใหญ่จะถูกดันขึ้นอันดับต้นเสมอแม้ความหมายไม่ตรง — นี่คือบั๊กคลาสสิกในระบบ RAG Production",
      ],
    },
    {
      id: "edge-cases-and-ranking",
      title: "3 · Vectorized Top-K Ranking & กับดัก Zero Vector",
      paragraphs: [
        "เวลาหา {{top-k}} เอกสารที่ใกล้ที่สุดใน NumPy เราไม่เขียน `for` วนเทียบทีละเอกสาร แต่คำนวณคะแนนทั้งเมทริกซ์ในครั้งเดียว (`scores = unit_docs @ unit_query`) แล้วจัดอันดับดัชนีด้วย `np.argsort(-scores)[:k]`",
        "ข้อควรระวังอันดับหนึ่งคือ **Zero Vector** (เวกเตอร์ที่เป็นศูนย์ทั้งหมด เช่น `[0.0, 0.0, 0.0]` ซึ่งเกิดได้จริงเมื่อเอกสารว่างหรือไม่มีคำในพจนานุกรม) — เพราะ `0 / 0` จะได้ `NaN` และ `NaN` เพียงตัวเดียวสามารถทำให้การเรียงลำดับ `argsort` พังทั้งชุด",
        "วิธีป้องกันที่ปลอดภัยคือตรวจ `norm == 0` ก่อนหาร (เช่นใช้ `np.where(norms == 0, 1.0, norms)` หรือจัดการแยกชัดเจน) เพื่อให้เวกเตอร์ศูนย์มีค่า similarity เป็น `0.0` แทนที่จะโยน `NaN` เข้าไปในระบบ",
      ],
      analogy:
        "เหมือนเครื่องคิดเลขหารศูนย์แล้วขึ้น `Error` จนใบสรุปคะแนนทั้งห้องพัง — เราต้องดักกรณีตัวหารเป็นศูนย์ไว้ก่อนเสมอ",
      bullets: [
        "`np.argsort(-scores)[:k]` คืนตำแหน่ง index ของ {{top-k}} ตัวที่คะแนนสูงสุดเรียงจากมากไปน้อย",
        "ตรวจสอบ `np.isnan(scores).any()` ใน unit test เสมอเมื่อเขียนฟังก์ชันเชิงตัวเลข",
        "ใช้ `dtype=np.float64` หรือ `np.float32` ให้สม่ำเสมอ เพื่อป้องกันปัญหา integer division หรือ overflow",
      ],
      whyTitle: "Why this matters — พร้อมต่อยอดสู่ Day 40 และ Phase 3–4",
      whyParagraphs: [
        "ใน Day 40 (Review Day) คุณจะได้สร้างเครื่องมือค้นหาข้อความด้วย NumPy เต็มรูปแบบ และใน Block B18 (Days 69–72) คุณจะเอาสูตรเดียวกับวันนี้ไปรันบน dense {{embedding}} ภาษาไทยจริงขนาด 768–1024 มิติ",
        "การเข้าใจกลไก matrix multiplication (`@`), `keepdims=True` และ zero-norm guard ทำให้คุณอ่านและดีบักโค้ด retrieval ทุกตัวในโปรเจกต์ AI ได้ทะลุปรุโปร่ง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Loop/Sort ใน JS มาสู่ Vectorized NumPy",
      body: [
        "ถ้าคุณเคยเขียนฟังก์ชันค้นหาใน TypeScript ด้วย `docs.map(...).sort(...).slice(0, k)` แนวคิดใน NumPy เหมือนกันทุกขั้น ต่างกันแค่แทนที่จะวนทีละชิ้นใน JS เราคำนวณทั้งตารางด้วยเมทริกซ์ครั้งเดียวใน C/BLAS:",
      ],
      table: [
        ["unit_docs @ unit_query", "docs.map(d => dot(d, query)) แต่รันใน C เร็วกว่า 50–100x"],
        ["np.linalg.norm(v)", "Math.hypot(...v) — ความยาวเวกเตอร์แบบ L2"],
        ["axis=1, keepdims=True", "คำนวณทีละแถวแล้วคงรูป (N, 1) ไว้หารกับ (N, D) ได้"],
        ["np.argsort(-scores)[:k]", "เรียง index ตามคะแนนมากไปน้อยแล้ว `.slice(0, k)`"],
      ],
    },
    student: {
      title: "First-Year Note — ทบทวนภาพเรขาคณิตของ Dot Product และ Norm",
      body: [
        "ในวิชาคณิตศาสตร์ ม.ปลาย หรือพีชคณิตเชิงเส้นปี 1 เราเคยเจอสูตร `a · b = ||a|| ||b|| cos(θ)` — เมื่อย้ายข้างจะได้ `cos(θ) = (a · b) / (||a|| ||b||)` นั่นคือสูตรของ **Cosine Similarity** ที่ใช้จริงในระบบ AI สมัยใหม่ทุกตัว!",
        "สำหรับเวกเตอร์ `v = [3, 4]` ความยาว (L2 norm) คือ `√(3² + 4²) = 5` เมื่อหารด้วย 5 จะได้ unit vector `[0.6, 0.8]` ซึ่งยาว `√(0.36 + 0.64) = 1.0` พอดี",
        "ถึงแม้เอกสารจริงใน LLM จะมี 768 หรือ 1,536 มิติจนวาดรูปไม่ได้ แต่สูตร `a @ b` และ `np.linalg.norm` ทำงานเหมือนเดิมเป๊ะทุกมิติ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีเวกเตอร์แทนหัวข้อทิกเก็ต 3 มิติ `[billing, shipping, tech]` สำหรับบทความช่วยเหลือ 3 ชิ้น และคำถามสั้นจากลูกค้า 1 ข้อ มาดูความต่างของการจัดอันดับด้วย Euclidean ดิบ เทียบกับ Cosine Similarity (ผ่าน L2 Normalization)",
    steps: [
      {
        title: "1 · สร้างเวกเตอร์บทความ (ต่างความยาวกัน) และคำถามสั้น",
        explain:
          "บทความ A พูดเรื่อง `billing` ยาวมาก (`[10, 2, 0]`), บทความ B พูดเรื่อง `shipping` สั้น ๆ (`[0, 1, 0]`), บทความ C พูด `billing` ปน `tech` (`[2, 0, 2]`) ส่วนคำถามลูกค้าคือ `[1, 0.2, 0]` (ทิศทางเดียวกับ A เป๊ะ!)",
        code: {
          language: "python",
          filename: "worked_cosine.py",
          code: `import numpy as np

doc_names = ["DocA_billing_long", "DocB_shipping_short", "DocC_billing_tech"]
docs = np.array([
    [10.0, 2.0, 0.0],
    [0.0,  1.0, 0.0],
    [2.0,  0.0, 2.0],
])
query = np.array([1.0, 0.2, 0.0])

# วัดด้วย Euclidean Distance ดิบ (ยิ่งน้อยยิ่งใกล้)
l2_dists = np.linalg.norm(docs - query, axis=1)
for name, d in zip(doc_names, l2_dists):
    print(f"{name:20s} -> L2 dist = {d:.4f}")`,
        },
        output: `DocA_billing_long    -> L2 dist = 9.1782
DocB_shipping_short  -> L2 dist = 1.2806
DocC_billing_tech    -> L2 dist = 2.2450`,
      },
      {
        title: "2 · ทำ L2 Normalization แล้วคำนวณ Cosine Similarity ด้วย @",
        explain:
          "สังเกตว่าในขั้นที่ 1 Euclidean เลือก `DocB_shipping_short` (1.28) เป็นอันดับ 1 ทั้งที่คนละเรื่อง และโยน `DocA_billing_long` (9.18) ไปอยู่อันดับสุดท้าย! ลอง normalize แล้ววัดด้วย Cosine ดู",
        code: {
          language: "python",
          filename: "worked_cosine.py",
          code: `unit_docs = docs / np.linalg.norm(docs, axis=1, keepdims=True)
unit_query = query / np.linalg.norm(query)

cos_scores = unit_docs @ unit_query
for idx in np.argsort(-cos_scores):
    print(f"{doc_names[idx]:20s} -> Cosine = {cos_scores[idx]:.4f}")`,
        },
        output: `DocA_billing_long    -> Cosine = 1.0000
DocC_billing_tech    -> Cosine = 0.6934
DocB_shipping_short  -> Cosine = 0.1961`,
      },
      {
        title: "3 · ยืนยันว่าบน Unit Vectors ระยะ L2 จัดอันดับตรงกับ Cosine 100%",
        explain:
          "ลองวัด Euclidean Distance ระหว่าง `unit_docs` กับ `unit_query` — จะเห็นว่าอันดับ 1 กลับมาเป็น `DocA_billing_long` (ระยะ 0.0000) และตรงกับสูตร `sqrt(2 - 2 * cos)` ทุกทศนิยม",
        code: {
          language: "python",
          filename: "worked_cosine.py",
          code: `unit_l2 = np.linalg.norm(unit_docs - unit_query, axis=1)
formula_l2 = np.sqrt(np.maximum(0.0, 2.0 - 2.0 * cos_scores))

for name, d1, d2 in zip(doc_names, unit_l2, formula_l2):
    print(f"{name:20s} -> Unit L2 = {d1:.4f} | sqrt(2-2cos) = {d2:.4f}")`,
        },
        output: `DocA_billing_long    -> Unit L2 = 0.0000 | sqrt(2-2cos) = 0.0000
DocB_shipping_short  -> Unit L2 = 1.2680 | sqrt(2-2cos) = 1.2680
DocC_billing_tech    -> Unit L2 = 0.7831 | sqrt(2-2cos) = 0.7831`,
      },
    ],
    gotcha:
      "จุดสังเกต: ใช้ `np.maximum(0.0, 2.0 - 2.0 * cos)` เพราะความคลาดเคลื่อนของทศนิยมแบบ floating-point อาจทำให้ `cos` เป็น `1.0000000000000002` จน `2 - 2*cos` ติดลบเล็กน้อยและ `np.sqrt` คืน `NaN` ได้",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูลคำนวณความคล้ายเวกเตอร์แบบปลอดภัยด้วย NumPy เพื่อเตรียมไว้ใช้กับระบบค้นหาเชิงความหมาย (Semantic Search) ในบทถัดไป",
    requirements: [
      "`l2_normalize_rows(matrix: np.ndarray) -> np.ndarray`: รับเมทริกซ์ 2 มิติรูป `(n_docs, dim)` แล้วทำ L2 normalization ทีละแถว โดยแถวที่เป็นเวกเตอร์ศูนย์ทั้งหมดต้องคงเป็นศูนย์ทั้งหมด (ห้ามเกิด `NaN`)",
      "`cosine_top_k(doc_matrix: np.ndarray, query: np.ndarray, k: int = 3) -> list[tuple[int, float]]`: คำนวณ Cosine Similarity ระหว่าง `query` (1 มิติ) กับทุกแถวใน `doc_matrix` แล้วคืนรายการ `(doc_index, score)` จำนวนไม่เกิน `k` รายการ เรียงจาก `score` มากไปน้อย",
      "ถ้า `query` เป็นเวกเตอร์ศูนย์ทั้งหมด ให้คะแนนทุกเอกสารเป็น `0.0` (ห้ามเกิด `NaN` หรือ `ZeroDivisionError`)",
      "ถ้า `k <= 0` ให้โยน `ValueError` และถ้ามิติของ `query` ไม่ตรงกับจำนวนคอลัมน์ของ `doc_matrix` ให้โยน `ValueError` (fail-fast)",
    ],
    starter: {
      language: "python",
      filename: "exercise_day38.py",
      code: `import numpy as np


def l2_normalize_rows(matrix: np.ndarray) -> np.ndarray:
    """L2-normalize แต่ละแถวของเมทริกซ์ 2D โดยไม่ให้แถวศูนย์กลายเป็น NaN"""
    # TODO: แปลงเป็น float64, ตรวจ ndim == 2, หารด้วย norm อย่างปลอดภัย
    raise NotImplementedError


def cosine_top_k(
    doc_matrix: np.ndarray,
    query: np.ndarray,
    k: int = 3,
) -> list[tuple[int, float]]:
    """คืน top-k (doc_index, cosine_score) เรียงจากคะแนนมากไปน้อย"""
    # TODO: ตรวจเงื่อนไข k และมิติ, normalize, คำนวณคะแนนด้วย @ และจัดอันดับ
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day38.py",
      code: `import numpy as np
import pytest
from exercise_day38 import cosine_top_k, l2_normalize_rows


def test_l2_normalize_handles_zero_row():
    mat = np.array([[3.0, 4.0], [0.0, 0.0], [0.0, 5.0]])
    normed = l2_normalize_rows(mat)
    assert not np.isnan(normed).any()
    assert normed[0] == pytest.approx([0.6, 0.8])
    assert normed[1] == pytest.approx([0.0, 0.0])
    assert normed[2] == pytest.approx([0.0, 1.0])


def test_cosine_top_k_prefers_direction_over_magnitude():
    docs = np.array([
        [10.0, 2.0, 0.0],  # 0: ทิศทางเดียวกับ query เป๊ะแต่ยาว 10x
        [0.0, 1.0, 0.0],   # 1: คนละทิศแต่สั้น
        [2.0, 0.0, 2.0],   # 2: กึ่งกลาง
        [0.0, 0.0, 0.0],   # 3: เอกสารว่าง (zero vector)
    ])
    query = np.array([1.0, 0.2, 0.0])
    results = cosine_top_k(docs, query, k=3)

    assert len(results) == 3
    indices = [idx for idx, _ in results]
    assert indices == [0, 2, 1]
    assert results[0][1] == pytest.approx(1.0)
    assert results[1][1] == pytest.approx(0.693375, abs=1e-4)


def test_zero_query_returns_zero_scores_without_nan():
    docs = np.array([[1.0, 0.0], [0.0, 1.0]])
    results = cosine_top_k(docs, np.array([0.0, 0.0]), k=2)
    assert all(score == pytest.approx(0.0) for _, score in results)


def test_invalid_inputs_raise_value_error():
    docs = np.array([[1.0, 2.0]])
    with pytest.raises(ValueError):
        cosine_top_k(docs, np.array([1.0, 2.0]), k=0)
    with pytest.raises(ValueError):
        cosine_top_k(docs, np.array([1.0, 2.0, 3.0]), k=1)
`,
    },
    selfCheck: [
      "`l2_normalize_rows` คืนแถว `[0.0, 0.0]` เมื่ออินพุตเป็นแถวศูนย์ โดยไม่มี `NaN` หรือ RuntimeWarning",
      "`cosine_top_k` จัดอันดับเอกสาร `[10.0, 2.0, 0.0]` เป็นอันดับ 1 เมื่อเทียบกับ `[1.0, 0.2, 0.0]`",
      "เมื่อ `query` เป็นเวกเตอร์ศูนย์ คะแนนทุกตัวเป็น `0.0` และไม่พัง",
      "กรณี `k <= 0` หรือมิติ `query` ไม่เท่าจำนวนคอลัมน์ของ `doc_matrix` โยน `ValueError` ทันที",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านครบทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ใน `test_day38.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ปัญหาหารศูนย์ใน NumPy แก้ได้ง่ายมากด้วย `safe_norms = np.where(norms == 0.0, 1.0, norms)` เพราะสำหรับแถวที่ทุกค่าเป็น `0.0` การหารด้วย `1.0` ก็ยังได้ `[0.0, 0.0]` เหมือนเดิมโดยไม่เกิด `NaN`",
      },
      {
        body: "ใน `l2_normalize_rows` ใช้ `norms = np.linalg.norm(arr, axis=1, keepdims=True)` และใน `cosine_top_k` ให้ `k_capped = min(k, len(scores))` แล้วใช้ `np.argsort(-scores)[:k_capped]` แปลงเป็น `[(int(i), float(scores[i])) for i in top_idx]`",
      },
      {
        body: "โครงของทั้งสองฟังก์ชันเกือบครบ — เหลือเติมการคำนวณ `scores` และคืน `top_k` ใน `cosine_top_k`:",
        code: {
          language: "python",
          filename: "hint_day38.py",
          code: `import numpy as np


def l2_normalize_rows(matrix: np.ndarray) -> np.ndarray:
    arr = np.asarray(matrix, dtype=np.float64)
    if arr.ndim != 2:
        raise ValueError("matrix must be 2D")
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    safe_norms = np.where(norms == 0.0, 1.0, norms)
    return arr / safe_norms


def cosine_top_k(
    doc_matrix: np.ndarray,
    query: np.ndarray,
    k: int = 3,
) -> list[tuple[int, float]]:
    if k <= 0:
        raise ValueError("k must be positive")
    docs = np.asarray(doc_matrix, dtype=np.float64)
    q = np.asarray(query, dtype=np.float64)
    if docs.ndim != 2 or q.ndim != 1 or docs.shape[1] != q.shape[0]:
        raise ValueError("incompatible shapes")

    unit_docs = l2_normalize_rows(docs)
    q_norm = float(np.linalg.norm(q))
    unit_q = np.zeros_like(q) if q_norm == 0.0 else q / q_norm

    # TODO: คำนวณ scores = unit_docs @ unit_q แล้วคืน [(int(i), float(scores[i])) ...] top-k
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
      title: "ลืม keepdims=True ตอนหารเมทริกซ์ด้วย norm",
      symptom: "เกิด `ValueError: operands could not be broadcast together with shapes (100, 3) (100,)` — หรือแย่กว่านั้นถ้าเมทริกซ์เป็นจัตุรัส `(3, 3)` NumPy จะหารผิดแกน (หารตามคอลัมน์แทนแถว) แบบเงียบ ๆ!",
      fix: "ใส่ `axis=1, keepdims=True` เสมอเมื่อคำนวณ norm รายแถว เพื่อให้ได้รูป `(N, 1)` ที่ broadcast กับ `(N, D)` อย่างถูกต้องทุกครั้ง",
    },
    {
      title: "สับสนระหว่าง Cosine Similarity กับ Cosine Distance",
      symptom: "เรียงลำดับจากน้อยไปมากบน Cosine Similarity ทำให้ได้เอกสารที่ *ไม่เกี่ยวข้องที่สุด* ขึ้นมาเป็นอันดับ 1",
      fix: "จำกติกาให้แม่น: **Similarity** ยิ่งมากยิ่งเหมือน (เรียงจากมากไปน้อย, max = 1.0) ส่วน **Distance** (`1 - similarity`) ยิ่งน้อยยิ่งเหมือน (เรียงจากน้อยไปมาก, min = 0.0)",
    },
    {
      title: "ใช้ Dot Product กับเวกเตอร์ที่ยังไม่ได้ Normalize",
      symptom: "เอกสารที่เวกเตอร์มี norm ใหญ่ผิดปกติชนะการค้นหาทุกคำถามแม้ทิศทางไม่ตรง",
      fix: "ตรวจสอบเอกสารของโมเดล embedding เสมอว่าคืน unit vector หรือไม่ — ถ้าไม่แน่ใจให้ทำ L2 normalization ทั้งฝั่ง document และ query ก่อนใช้ `@`",
    },
    {
      title: "ไม่ดัก Zero Vector ทำให้เกิด NaN หลุดเข้าระบบจัดอันดับ",
      symptom: "มีเอกสารว่าง 1 ชิ้นในคลัง ทำให้ `0.0 / 0.0` กลายเป็น `nan` แล้ว `np.argsort(-scores)` จัดอันดับเพี้ยน",
      fix: "แทนที่ตัวหาร `0.0` ด้วย `1.0` ผ่าน `np.where(norms == 0.0, 1.0, norms)` และเขียน unit test สำหรับแถวศูนย์ไว้เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d038-q1",
        "ทำไมระบบค้นหาข้อความด้วย Text Embeddings จึงนิยมใช้ Cosine Similarity มากกว่า Euclidean Distance (บนเวกเตอร์ที่ยังไม่ normalize)?",
        [
          ["เพราะ Euclidean Distance คำนวณไม่ได้เมื่อมิติเกิน 3 มิติ", "ไม่จริง — Euclidean คำนวณได้ทุกมิติ แต่ไวต่อขนาด (magnitude) ของเวกเตอร์"],
          ["เพราะ Cosine Similarity วัดที่ทิศทาง (มุม) จึงไม่ถูกหลอกด้วยความแตกต่างของขนาด/ความยาวเวกเตอร์ระหว่างคำถามสั้นกับเอกสารยาว", "ถูก — เอกสารสั้นกับยาวที่พูดเรื่องเดียวกันชี้ทิศเดียวกัน จึงได้ค่า Cosine ใกล้ 1.0"],
          ["เพราะ Cosine Similarity คืนค่าเป็นจำนวนเต็มบวกเสมอ", "ไม่จริง — คืนค่าทศนิยมในช่วง `[-1.0, 1.0]`"],
          ["เพราะ Cosine Similarity ไม่ต้องใช้ NumPy", "ทั้งสองสูตรคำนวณด้วย NumPy ได้เหมือนกัน"],
        ],
        "B",
        "Cosine Similarity โฟกัสที่มุมระหว่างเวกเตอร์จึงตัดผลกระทบจากขนาดเวกเตอร์ (magnitude) ออก เหมาะกับการเทียบคำถามสั้นกับเอกสารยาวในระบบ Semantic Search และ RAG",
        "ทำไม Cosine Similarity จึงเหมาะกับ Text Embeddings มากกว่า Euclidean Distance ดิบ?",
        "เพราะวัดที่ทิศทาง (มุม) ไม่ขึ้นกับขนาด/ความยาวเวกเตอร์ คำถามสั้นกับเอกสารยาวที่ความหมายเดียวกันจึงได้คะแนนสูง",
      ),
      mc(
        "d038-q2",
        "เมื่อนำเวกเตอร์ทุกตัวมาทำ L2 Normalization ให้เป็น unit vectors (`||u|| = ||v|| = 1`) แล้ว ข้อใดถูกต้อง?",
        [
          ["`u @ v` (Dot Product) มีค่าเท่ากับ Cosine Similarity เป๊ะ และการจัดอันดับด้วย Euclidean Distance จะได้ลำดับเดียวกัน", "ถูก — เพราะตัวส่วน `||u|| ||v|| = 1` และ `||u - v||² = 2 - 2(u @ v)`"],
          ["Cosine Similarity ของทุกคู่จะกลายเป็น `1.0` เสมอ", "ไม่จริง — L2 normalization เปลี่ยนแค่ความยาวเป็น 1 ไม่ได้เปลี่ยนมุมระหว่างเวกเตอร์"],
          ["Euclidean Distance จะกลายเป็น `0.0` สำหรับทุกคู่", "เป็น `0.0` เฉพาะคู่ที่ชี้ทิศเดียวกันเป๊ะเท่านั้น"],
          ["ไม่สามารถคำนวณ Dot Product ได้อีกต่อไป", "ตรงกันข้าม — ทำ Dot Product ได้เร็วขึ้นเพราะไม่ต้องหารด้วย norm ซ้ำ"],
        ],
        "A",
        "การทำ L2 normalization ล่วงหน้าทำให้ `u @ v == cosine(u, v)` ช่วยให้การค้นหาบนคลังเอกสารขนาดใหญ่ใช้เพียง matrix multiplication เดียว",
        "เมื่อทำ L2 normalization แล้ว Dot Product, Cosine Similarity และ Euclidean Distance สัมพันธ์กันอย่างไร?",
        "`u @ v` เท่ากับ Cosine Similarity เป๊ะ และ `||u - v||² = 2 - 2(u @ v)` ทำให้ทั้งสามวิธีจัดอันดับเอกสารได้ลำดับเดียวกัน 100%",
      ),
      mc(
        "d038-q3",
        "เกิดอะไรขึ้นหากคุณเขียน `docs / np.linalg.norm(docs, axis=1)` บนเมทริกซ์ `docs` ขนาด `(3, 3)` โดยลืมใส่ `keepdims=True`?",
        [
          ["NumPy โยน `ValueError` ทันทีเพื่อเตือนว่าลืม `keepdims=True`", "น่าเสียดายที่ไม่โยน error เพราะรูป `(3, 3)` กับ `(3,)` สามารถ broadcast ได้!"],
          ["NumPy จะ broadcast แบบ `(1, 3)` ทำให้หารผิดแกน (เอา norm ของแถวไปหารแต่ละคอลัมน์แทน) และเกิดบั๊กเงียบ", "ถูก — นี่คือกับดักที่อันตรายที่สุดของเมทริกซ์จัตุรัส ต้องใส่ `keepdims=True` เสมอ"],
          ["ผลลัพธ์ถูกต้องเหมือนใส่ `keepdims=True` ทุกประการ", "ไม่จริง — ผลลัพธ์ผิดเพราะ broadcast ผิดแกน"],
          ["NumPy ปัดค่าทุกตัวเป็นจำนวนเต็ม", "ไม่เกี่ยวกับชนิดข้อมูล แต่เกี่ยวกับแกนการ broadcast"],
        ],
        "B",
        "เมื่อลืม `keepdims=True` ผลลัพธ์ของ norm จะมีรูป `(3,)` ซึ่ง NumPy broadcast เทียบแกนสุดท้าย (คอลัมน์) แทนที่จะเป็นแถว ทำให้คำนวณผิดเงียบ ๆ เมื่อจำนวนแถวเท่าจำนวนคอลัมน์",
        "ทำไมต้องใส่ `keepdims=True` ใน `np.linalg.norm(docs, axis=1, keepdims=True)`?",
        "เพื่อให้ได้รูป `(N, 1)` สำหรับหารแต่ละแถวอย่างถูกต้อง ป้องกัน broadcast error และกันบั๊กเงียบเมื่อเมทริกซ์เป็นจัตุรัส `(N, N)`",
      ),
      mc(
        "d038-q4",
        "ในสถานการณ์ใดที่ **Euclidean Distance** (โดยไม่ทำ L2 normalize) อาจเหมาะกว่า Cosine Similarity?",
        [
          ["ค้นหาเอกสารภาษาไทยที่ความหมายคล้ายคำถามผู้ใช้ในระบบ RAG", "งานนี้ควรใช้ Cosine เพราะคำถามสั้นกว่าเอกสารมาก"],
          ["เปรียบเทียบโปรไฟล์ลูกค้าตามพิกัดที่ตั้ง (ละติจูด/ลองจิจูด) หรือยอดใช้จ่ายจริง (บาท) ที่ 'ขนาดตัวเลข' มีความหมายทางธุรกิจ", "ถูก — ถ้าลูกค้า A ซื้อ 100 บาท กับลูกค้า B ซื้อ 10,000 บาท ในสัดส่วนหมวดสินค้าเดิม ขนาดตัวเลขสำคัญมาก"],
          ["เปรียบเทียบเวกเตอร์ TF-IDF ของบทความยาว 50 คำกับ 5,000 คำ", "ความยาวบทความต่างกันมากควรใช้ Cosine"],
          ["จัดอันดับผลลัพธ์จากโมเดล multilingual embedding ที่ไม่ได้ normalize", "โมเดล embedding แทนความหมายด้วยทิศทาง ควรใช้ Cosine"],
        ],
        "B",
        "เลือก metric ตามความหมายของ *ขนาด (magnitude)*: ถ้าขนาดคือ noise (เช่น ความยาวข้อความ) ใช้ Cosine; ถ้าขนาดคือข้อมูลสำคัญ (เช่น ระยะทางจริง, ยอดเงิน) ใช้ Euclidean (ควบคู่กับการ scale ฟีเจอร์ให้หน่วยเหมาะสม)",
        "เกณฑ์ตัดสินใจระหว่าง Cosine Similarity กับ Euclidean Distance คืออะไร?",
        "ถ้า 'ขนาดเวกเตอร์' ไม่ควรมีผล (เช่น ความยาวเอกสาร/embeddings) ใช้ Cosine; ถ้า 'ขนาดตัวเลข' มีความหมายจริง (เช่น ระยะทาง, ยอดเงิน) ใช้ Euclidean",
      ),
    ],
  },

  takeaways: [
    "**Cosine Similarity** วัดที่มุม (`[-1, 1]`) จึงเหมาะกับ text {{embedding}} ที่คำถามสั้นกว่าเอกสารมาก ส่วน **Euclidean Distance** วัดระยะรวมขนาดเวกเตอร์",
    "การทำ **L2 Normalization** (`v / ||v||`) เปลี่ยน Cosine ให้เหลือเพียง {{dot-product}} (`u @ v`) และทำให้ลำดับของ Cosine, Dot Product และ Euclidean ตรงกัน 100%",
    "ใส่ `axis=1, keepdims=True` เสมอตอน normalize เมทริกซ์ และดัก `norm == 0` เพื่อกัน `NaN` หลุดเข้าระบบจัดอันดับ",
    "ระวังชื่อเรียกใน Vector DB: **Cosine Similarity** ยิ่งมากยิ่งเหมือน ส่วน **Cosine Distance** (`1 - sim`) ยิ่งน้อยยิ่งเหมือน",
  ],

  reviewCards: [
    rc(
      "d038-rc-1",
      "เวกเตอร์ `[1, 0]` กับ `[10, 0]` มีค่า Cosine Similarity และ Euclidean Distance เท่าไร?",
      "Cosine Similarity = `1.0` (ชี้ทิศเดียวกันเป๊ะ มุม 0°) แต่ Euclidean Distance = `9.0` (ห่างกันตามขนาด)",
    ),
    rc(
      "d038-rc-2",
      "ทำไม Vector DB และระบบค้นหาจึงนิยม L2-normalize เวกเตอร์เอกสารไว้ล่วงหน้า?",
      "เพราะเมื่อทุกเวกเตอร์ยาว 1 (`unit vector`) การคำนวณ Cosine Similarity ลดรูปเหลือแค่ Dot Product (`unit_docs @ unit_query`) ที่เร็วกว่าและไม่ต้องหาร norm ซ้ำทุก query",
    ),
    rc(
      "d038-rc-3",
      "จะป้องกัน `NaN` ตอน L2-normalize เมทริกซ์ที่มีแถวเป็นเวกเตอร์ศูนย์ `[0, 0, ...]` ได้อย่างไร?",
      "ใช้ `safe_norms = np.where(norms == 0.0, 1.0, norms)` แล้วค่อยหาร `arr / safe_norms` แถวศูนย์จะยังคงเป็นศูนย์ทั้งหมดโดยไม่เกิดการหารศูนย์",
    ),
  ],

  sources: [
    { label: "NumPy Documentation — Linear Algebra (linalg.norm & matmul)", href: "https://numpy.org/doc/stable/reference/routines.linalg.html" },
    { label: "NumPy Documentation — Broadcasting Fundamentals", href: "https://numpy.org/doc/stable/user/basics.broadcasting.html" },
    { label: "scikit-learn User Guide — Pairwise Metrics & Cosine Similarity", href: "https://scikit-learn.org/stable/modules/metrics.html#cosine-similarity" },
    { label: "Qdrant Documentation — Distance Metrics (Cosine, Dot, Euclid)", href: "https://qdrant.tech/documentation/concepts/search/#metrics" },
  ],

  glossary: [
    "cosine-similarity",
    "dot-product",
    "embedding",
    "rag",
    "hnsw",
    "top-k",
    "pytest",
    "uv",
  ],
});
