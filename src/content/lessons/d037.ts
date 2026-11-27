import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D037 — Phase 2 / Block B10
 * Vectors, Dot Product & Norms (NumPy Intuition)
 */
export const d037: Lesson = defineLesson({
  day: 37,
  titleTh: "เวกเตอร์, Dot Product และ Norms — สัญชาตญาณ NumPy สำหรับระบบ AI",
  tagline:
    "30 นาที · รันบนเครื่อง 100% ไม่ต้องใช้ API key · แทนข้อมูลด้วย NumPy array, วัดทิศทางด้วย Dot Product (a @ b) และเทียบ L1 vs L2 Norm",
  icon: "sigma",
  visual: {
    id: "vector-dot-norm",
    title: "Vectors, Dot Product (a · b) & L2 Norm ใน NumPy",
    caption:
      "กดสลับคู่เวกเตอร์เพื่อเห็นความสัมพันธ์ระหว่างทิศทาง, ผลคูณจุด และความยาว L2 Norm",
    alt: "แผนภาพเวกเตอร์ ผลคูณจุด และ L2 norm ใน NumPy",
  },
  requiresApiKey: false,
  tools: ["NumPy", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "เปลี่ยนปัญหาธุรกิจให้เป็นตัวเลขที่คำนวณได้",
      body: "คอมพิวเตอร์และโมเดล AI ไม่เข้าใจคำว่า 'ลูกค้าเร่งด่วน' หรือ 'สินค้าคล้ายกัน' โดยตรง — ทุกอย่างต้องถูกแปลงเป็นชุดตัวเลขที่มีโครงสร้างชัดเจนก่อนจึงจะจัดอันดับหรือทำนายได้",
      lessonNote:
        "วันนี้เราปูพื้นฐานการแทนคุณสมบัติ (features) ด้วยเวกเตอร์ใน NumPy ซึ่งเป็นภาษาตัวเลขกลางของทั้ง Classical ML และ LLM",
    },
    {
      node: 1,
      heading: "จัดเก็บข้อมูลเป็นเมทริกซ์ที่มี shape และ dtype ชัดเจน",
      body: "ข้อมูลที่ทำความสะอาดจากตารางใน Block B09 จะถูกแปลงเป็นเมทริกซ์ตัวเลขขนาด `(จำนวนแถว, จำนวนฟีเจอร์)` โดยเลือก `dtype=np.float32` เพื่อคุมทั้งความเร็วและขนาดหน่วยความจำ",
      lessonNote:
        "เข้าใจความต่างระหว่าง Python `list` กับ NumPy `ndarray` ที่เรียงข้อมูลติดกันใน RAM ทำให้คำนวณทั้งตารางได้โดยไม่ต้องวนลูปทีละแถว",
    },
    {
      node: 2,
      heading: "สร้างอิฐก้อนแรกของ ML, Embeddings และ Neural Nets",
      body: "เบื้องหลังการให้คะแนนโมเดลเส้นตรง, การค้นหาด้วย {{embedding}} และทุกเลเยอร์ของ {{tensor}} ใน PyTorch ล้วนประกอบจากการคูณเมทริกซ์ ({{dot-product}}) และขนาดเวกเตอร์ (Norm)",
      lessonNote:
        "สัญชาตญาณเรื่อง `a @ b` และ `np.linalg.norm` วันนี้จะต่อตรงไปยัง {{cosine-similarity}} ใน Day 38 และ Neural Networks ใน Phase 3",
    },
    {
      node: 4,
      heading: "รันคำนวณแบบ Vectorized ให้ตอบสนองระดับมิลลิวินาที",
      body: "ในระบบ Production การคำนวณคะแนนให้เอกสารหรือทิกเก็ตหลักหมื่นชิ้นด้วย Python `for` loop จะช้าเกินไป แต่การเขียนแบบ vectorized ด้วย NumPy ให้ความเร็วระดับ C/BLAS บน CPU เครื่องธรรมดา",
      lessonNote:
        "แบบฝึกหัดวันนี้สร้างฟังก์ชันคำนวณคะแนนถ่วงน้ำหนักและ L1/L2 norm แบบ vectorized พร้อมดักมิติผิดพลาดแบบ {{fail-fast}} และตรวจด้วย {{pytest}}",
    },
  ],

  objectives: [
    "**สร้างและตรวจสอบ NumPy array** (`shape`, `ndim`, `dtype=np.float32`) พร้อมอธิบายเหตุผลที่การคำนวณแบบ vectorized เร็วกว่า Python `for` loop หลายสิบเท่า",
    "**ตีความและคำนวณ {{dot-product}} (`a @ b`)** ได้ทั้งสองมุมมอง: การวัดความสอดคล้องของทิศทาง (บวก/ศูนย์/ลบ) และการคิดคะแนนผลรวมถ่วงน้ำหนัก (weighted sum)",
    "**แยกแยะและคำนวณ L1 Norm กับ L2 Norm** ด้วย `np.linalg.norm(..., ord=1|2, axis=1)` พร้อมบอกความต่างเมื่อข้อมูลมีค่าสุดโต่ง (outlier)",
  ],

  prerequisites: [
    "ผ่าน Phase 1 พื้นฐาน Python, {{uv}} และ {{pytest}}",
    "คุ้นเคยโครงสร้างตาราง (แถว/คอลัมน์) จาก Block B09",
    "รู้จักคณิตศาสตร์ระดับมัธยม: การบวกคูณเลข, ค่าสัมบูรณ์ (`|x|`) และทฤษฎีบทพีทาโกรัส (`√(x² + y²)`) — ไม่ต้องจำสูตรเมทริกซ์ซับซ้อนมาก่อน",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key หรือ GPU",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่สำหรับ Block B10 ด้วย {{uv}} แล้วติดตั้ง `numpy` พร้อม `pytest` และ `ruff` เพื่อทดลองคำนวณเวกเตอร์บน CPU",
    commands: `uv init ai-day37 && cd ai-day37
uv add numpy
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('NumPy:', np.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day37` ด้วย `uv init` สำเร็จ"],
      ["deps", "ติดตั้ง `numpy`, `pytest` และ `ruff` ผ่าน `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็นเลขเวอร์ชัน NumPy 2.x (หรือ 1.26+)"],
    ],
    note: "NumPy เป็นแกนกลางที่ทั้ง scikit-learn, PyTorch และไลบรารี AI เกือบทุกตัววางทับอยู่ — ลงทุนสร้างสัญชาตญาณให้แม่นใน 4 วันนี้จะช่วยให้ทุก Phase ถัดไปอ่านง่ายขึ้นมาก",
  },

  concepts: [
    {
      id: "numpy-vectors-and-vectorization",
      title: "1 · เวกเตอร์ใน NumPy (`shape`, `dtype`) และพลังของ Vectorization",
      paragraphs: [
        "ในงาน AI **เวกเตอร์ (Vector)** คือรายการตัวเลขที่มีลำดับชัดเจนสำหรับแทนข้อมูล 1 ชิ้น เช่น ทิกเก็ตลูกค้า 1 ใบอาจแทนด้วย `[ชั่วโมงที่รอ, มูลค่าคำสั่งซื้อ(พันบาท), จำนวนครั้งที่ทักซ้ำ]` = `[4.0, 3.0, 1.0]` เมื่อเรานำทิกเก็ตหลายใบมาเรียงซ้อนกันเป็นแถว จะได้ **เมทริกซ์ (2D array)** รูป `(จำนวนแถว, จำนวนฟีเจอร์)`",
        "จุดต่างสำคัญระหว่าง Python `list` กับ NumPy `ndarray` คือ `list` เก็บ pointer ชี้ไปยังอ็อบเจกต์ตัวเลขที่กระจัดกระจายใน RAM แต่ NumPy เก็บตัวเลขชนิดเดียวกัน (`dtype`) เรียงติดกันเป็นบล็อกเดียวในหน่วยความจำ (contiguous buffer) และสั่งคำนวณทั้งบล็อกผ่านโค้ดภาษา C/BLAS",
        "ในงาน ML และ {{embedding}} เรานิยมระบุ **`dtype=np.float32`** แทนค่าเริ่มต้น `float64` เพราะใช้ RAM ลดลงครึ่งหนึ่ง (4 bytes ต่อตัวเลข เทียบกับ 8 bytes) และประมวลผลได้เร็วขึ้น โดยยังให้ความละเอียดทศนิยมเพียงพอสำหรับฟีเจอร์และเวกเตอร์ความหมาย",
      ],
      analogy:
        "Python `for` loop เหมือนพนักงานเดินหยิบกล่องทีละใบจากคนละมุมโกดังมาติดป้ายราคา ส่วน NumPy vectorization เหมือนวางกล่องขนาดเท่ากันเรียงเป็นแถวบนสายพานแล้วเครื่องปั๊มราคาทั้งแถวในจังหวะเดียว",
      bullets: [
        "ตรวจโครงสร้างก่อนคำนวณเสมอด้วย `.shape` (ขนาดแต่ละแกน), `.ndim` (จำนวนมิติ) และ `.dtype` (ชนิดตัวเลข)",
        "ระวังเวกเตอร์ 1 มิติ `(3,)` ต่างจากเมทริกซ์ 1 แถว `(1, 3)` และเมทริกซ์ 1 คอลัมน์ `(3, 1)`",
        "เขียน `a + b`, `a * 2.0`, `X @ w` แทนการเขียน `for` วนบวกคูณทีละสมาชิก",
      ],
      code: {
        language: "python",
        filename: "vectorization_intro.py",
        code: `import numpy as np

# เมทริกซ์ทิกเก็ต 3 ใบ x 3 ฟีเจอร์: [wait_hours, order_k_thb, repeat_count]
tickets = np.array(
    [
        [4.0, 3.0, 1.0],
        [0.5, 0.5, 0.0],
        [2.0, 6.0, 2.0],
    ],
    dtype=np.float32,
)

print("shape:", tickets.shape, "| ndim:", tickets.ndim, "| dtype:", tickets.dtype)
print("memory (bytes):", tickets.nbytes)

# Vectorized scaling: คูณน้ำหนักให้ทุกแถวพร้อมกันโดยไม่เขียน for-loop
scaled = tickets * np.array([1.0, 2.0, 3.0], dtype=np.float32)
print("scaled row 0:", scaled[0])`,
        caption:
          "เมทริกซ์ `(3, 3)` ชนิด `float32` ใช้หน่วยความจำเพียง `3 × 3 × 4 = 36 bytes` และคำนวณทุกแถวพร้อมกันได้ในบรรทัดเดียว",
      },
      whyTitle: "Why this matters — ทำไมไม่วนลูป Python ปกติแล้วค่อยไปแก้ทีหลัง",
      whyParagraphs: [
        "ถ้าคุณมีคลังเอกสาร 50,000 ชิ้น ขนาด 768 มิติ การวนลูปด้วย Python ปกติเพื่อคำนวณความคล้ายจะใช้เวลาหลายวินาทีต่อคำถาม 1 ข้อ จนผู้ใช้รอไม่ไหว แต่ NumPy vectorized ใช้เวลาเพียงไม่กี่มิลลิวินาที",
        "นอกจากนี้โค้ดแบบ vectorized ยังถ่ายทอดแนวคิดตรงไปยัง {{tensor}} ของ PyTorch ใน Day 61 ได้ทันที เพราะ API เรื่อง `shape`, `dtype`, `axis`/`dim` และ broadcasting ใช้หลักการเดียวกันเกือบทั้งหมด",
      ],
    },
    {
      id: "dot-product-alignment",
      title: "2 · Dot Product (`a @ b`): วัดความสอดคล้องของทิศทาง & คะแนนถ่วงน้ำหนัก",
      paragraphs: [
        "**{{dot-product}}** ของเวกเตอร์สองตัวที่ยาวเท่ากันคือการนำสมาชิกตำแหน่งเดียวกันมาคูณกันแล้วบวกรวมทั้งหมด: `a · b = a₁b₁ + a₂b₂ + ... + aₙbₙ` ใน Python ยุคใหม่เราเขียนสั้นและชัดด้วยตัวดำเนินการ **`a @ b`** (หรือ `np.dot(a, b)`)",
        "ในงาน AI คุณควรจำความหมายของ Dot Product ให้ได้ **2 มุมมองพร้อมกัน**: (1) **มุมมองธุรกิจ (Weighted Sum)** — ถ้านำเวกเตอร์ฟีเจอร์ `x` มาดอทกับเวกเตอร์น้ำหนัก `w` (`x @ w`) ก็คือการให้คะแนนรวมตามความสำคัญของแต่ละปัจจัย และ (2) **มุมมองเรขาคณิต (Directional Alignment)** — ถ้าชี้ไปทางเดียวกันจะได้ค่า **บวกมาก**, ถ้าตั้งฉากกัน (ไม่เกี่ยวข้องกัน) ได้ **`0`**, และถ้าชี้สวนทางกันจะได้ค่า **ติดลบ**",
        "เมื่อขยายจากเวกเตอร์เดี่ยวเป็นเมทริกซ์ `X` รูป `(N, D)` คูณกับเวกเตอร์น้ำหนัก `w` รูป `(D,)` ด้วย `X @ w` NumPy จะคำนวณ Dot Product ของทั้ง `N` แถวพร้อมกันและคืนเวกเตอร์คะแนนรูป `(N,)` ในคำสั่งเดียว",
      ],
      analogy:
        "เหมือนการตรวจข้อสอบที่มีค่าน้ำหนักแต่ละข้อ (`weights`) คูณกับคะแนนที่ทำได้ (`features`) แล้วรวมเป็นคะแนนสุทธิ — ยิ่งทำคะแนนสูงตรงข้อที่น้ำหนักเยอะ ผลคูณจุดยิ่งพุ่งสูง",
      bullets: [
        "`a @ b > 0` → เวกเตอร์ชี้ไปทิศทางสอดคล้องกัน (มุมแหลม < 90°)",
        "`a @ b == 0` → เวกเตอร์ตั้งฉากกัน (orthogonal, มุม 90°)",
        "`a @ b < 0` → เวกเตอร์ชี้สวนทางกัน (มุมป้าน > 90°)",
        "ระวัง: Dot Product ขึ้นกับทั้ง *ทิศทาง* และ *ความยาว* ของเวกเตอร์ (พรุ่งนี้ Day 38 เราจะหารด้วยความยาวเพื่อได้ {{cosine-similarity}})",
      ],
      code: {
        language: "python",
        filename: "dot_product_demo.py",
        code: `import numpy as np

# มุมมองเรขาคณิต: เปรียบเทียบทิศทางกับแกนอ้างอิง [1, 0]
ref = np.array([1.0, 0.0], dtype=np.float32)
same_dir = np.array([2.0, 0.5], dtype=np.float32)
orthogonal = np.array([0.0, 3.0], dtype=np.float32)
opposite = np.array([-2.0, 0.0], dtype=np.float32)

print("same_dir @ ref  =", float(same_dir @ ref))    # +2.0 (ทิศเดียวกัน)
print("ortho @ ref     =", float(orthogonal @ ref))  #  0.0 (ตั้งฉาก)
print("opposite @ ref  =", float(opposite @ ref))    # -2.0 (สวนทาง)

# มุมมองธุรกิจ: คำนวณคะแนนความเร่งด่วน (Weighted Sum)
features = np.array([4.0, 3.0, 1.0], dtype=np.float32)
weights = np.array([1.5, 2.0, 3.0], dtype=np.float32)
print("urgency score   =", float(features @ weights))  # 6 + 6 + 3 = 15.0`,
        caption:
          "เครื่องหมาย `@` อ่านง่าย ชัดเจนกว่าการเขียนลูป `sum(x * y for x, y in zip(...))` และรันบน BLAS โดยตรง",
      },
      whyTitle: "Why this matters — สมการที่โผล่ซ้ำในทุกบทของ AI Engineering",
      whyParagraphs: [
        "ตั้งแต่ Logistic Regression ใน Phase 2 (`w @ x + b`), Self-Attention ใน Transformer (`Q @ K.T` ใน Day 65) ไปจนถึง Vector Search ใน Phase 4 (`unit_docs @ unit_query`) ทั้งหมดคือการเอา `a @ b` มาต่อยอดทั้งสิ้น",
        "เมื่อเห็นตัวดำเนินการ `@` คุณจะนึกภาพออกทันทีว่ามิติในสุดต้องตรงกัน `(N, D) @ (D,) -> (N,)` และรู้ทันทีว่าทำไมมิติไม่ตรงถึงโยน `ValueError`",
      ],
    },
    {
      id: "l1-vs-l2-norms",
      title: "3 · L1 vs L2 Norm (`np.linalg.norm`): วัดขนาดและความยาวของเวกเตอร์",
      paragraphs: [
        "**Norm** คือวิธีวัด 'ขนาด (magnitude)' หรือ 'ความยาว' ของเวกเตอร์ 1 ตัวให้ยุบเหลือเลขไม่ติดลบตัวเดียว ในงาน AI มี 2 ตัวที่ต้องรู้จักให้แม่นคือ **L2 Norm** และ **L1 Norm**",
        "**L2 Norm (Euclidean Norm)** คือระยะเส้นตรงตามทฤษฎีบทพีทาโกรัส `||v||₂ = √(v₁² + v₂² + ... + vₙ²)` เรียกด้วย `np.linalg.norm(v)` (ค่าเริ่มต้น `ord=2`) เพราะมีการยกกำลังสอง ค่าที่โดดสูงเพียงช่องเดียวจะดึง L2 Norm ให้พุ่งขึ้นแรงกว่าค่าเฉลี่ยหลายช่องรวมกัน",
        "**L1 Norm (Manhattan Norm)** คือผลรวมของค่าสัมบูรณ์ทุกช่อง `||v||₁ = |v₁| + |v₂| + ... + |vₙ|` เรียกด้วย `np.linalg.norm(v, ord=1)` เหมาะเมื่อทุกหน่วยของการเปลี่ยนแปลงมีความสำคัญเท่ากันและไม่ต้องการให้ค่าสุดโต่ง (outlier) ครอบงำผลลัพธ์",
      ],
      analogy:
        "L2 Norm เหมือนระยะทางนกบินตรงข้ามตึกในกรุงเทพฯ (เส้นทแยงมุม) ส่วน L1 Norm เหมือนระยะทางแท็กซี่ที่ต้องวิ่งตามบล็อกถนนเลี้ยวซ้าย-ขวาทีละแกน",
      bullets: [
        "ตัวอย่างคลาสสิก `v = [3, 4]`: **L1** = `|3| + |4| = 7.0`, **L2** = `√(3² + 4²) = 5.0`",
        "เทียบ `[5, 5]` กับ `[10, 0]`: ทั้งคู่มี **L1 = 10.0** เท่ากัน แต่ **L2** ของ `[10, 0]` คือ `10.0` ขณะที่ `[5, 5]` คือ `7.071` (L2 ลงโทษค่าสุดโต่งหนักกว่า)",
        "เมื่อคำนวณบนเมทริกซ์ 2D ให้ระบุ **`axis=1`** เพื่อหาความยาวของแต่ละแถว (แต่ละเอกสาร/ตัวอย่าง) แทนที่จะยุบทั้งเมทริกซ์เป็นเลขตัวเดียว",
      ],
      code: {
        language: "python",
        filename: "norms_demo.py",
        code: `import numpy as np

v = np.array([3.0, 4.0], dtype=np.float32)
print("v = [3, 4] -> L1:", float(np.linalg.norm(v, ord=1)), "| L2:", float(np.linalg.norm(v, ord=2)))

# เทียบผลของ outlier: ทั้งสองแถวมี L1 เท่ากัน (10.0) แต่ L2 ต่างกันชัดเจน
profiles = np.array(
    [
        [5.0, 5.0],
        [10.0, 0.0],
    ],
    dtype=np.float32,
)
print("row L1:", np.linalg.norm(profiles, ord=1, axis=1))
print("row L2:", np.round(np.linalg.norm(profiles, ord=2, axis=1), 3))`,
        caption:
          "L2 Norm ไวต่อค่าโดดเดี่ยว (`[10, 0]`) มากกว่า L1 Norm — แนวคิดเดียวกับที่ RMSE ลงโทษ error ใหญ่หนักกว่า MAE ใน Day 46",
      },
      whyTitle: "Why this matters — เชื่อมตรงไปยัง Cosine Similarity และ Regression Metrics",
      whyParagraphs: [
        "พรุ่งนี้ใน Day 38 เราจะใช้ **L2 Norm** เป็นตัวหารเพื่อย่อ-ขยายทุกเวกเตอร์ให้ยาว 1 (`v / ||v||₂`) ซึ่งเปลี่ยน {{cosine-similarity}} ให้เร็วขึ้นเหลือเพียง `u @ v`",
        "ส่วนความต่างระหว่าง L1 กับ L2 จะกลับมาอีกครั้งในเรื่อง Regularization (L1 Lasso vs L2 Ridge) และใน Day 46 เรื่อง `MAE` (ฐาน L1) เทียบกับ `RMSE` (ฐาน L2) สำหรับวัดความคลาดเคลื่อนของโมเดลทำนายตัวเลข",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ NumPy กับ TypedArray / JS Array",
      body: [
        "ถ้าคุณคุ้นเคยกับ TypeScript และ `Float32Array` ในเบราว์เซอร์ คุณจะเห็นภาพ NumPy ทันที — NumPy คือ `Float32Array` ที่รองรับหลายมิติ (2D/3D) และมีฟังก์ชันพีชคณิตเชิงเส้นความเร็วสูงติดมาครบ:",
      ],
      table: [
        ["`np.array([...], dtype=np.float32)`", "`new Float32Array([...])` (เก็บเรียงติดกันใน RAM)"],
        ["`X.shape` -> `(rows, cols)`", "`[matrix.length, matrix[0].length]` (แต่ตรวจง่ายกว่า)"],
        ["`a @ b`", "`a.reduce((s, v, i) => s + v * b[i], 0)` แต่รันใน C/BLAS"],
        ["`np.linalg.norm(v, ord=2)`", "`Math.hypot(...v)` (ความยาวแบบ L2)"],
        ["`np.linalg.norm(X, axis=1)`", "`X.map(row => Math.hypot(...row))`"],
      ],
    },
    student: {
      title: "First-Year Note — ไม่ต้องกลัวคำว่า 'Linear Algebra'",
      body: [
        "ในห้องเรียนปี 1 หลายคนจำพีชคณิตเชิงเส้นแบบต้องคูณเมทริกซ์ด้วยมือจนเหนื่อย แต่ในงาน AI Engineering คอมพิวเตอร์เป็นคนคูณให้ทั้งหมด สิ่งที่มนุษย์ต้องแม่นมีแค่ 3 เรื่อง: (1) **Shape** มิติต้องต่อกันได้, (2) **ความหมายของ `a @ b`** (ทิศทางและผลรวมถ่วงน้ำหนัก), และ (3) **Norm** (ความยาวของเวกเตอร์)",
        "จำกฎเช็กมิติของ `@` ง่าย ๆ: ถ้า `A` มีรูป `(N, D)` และ `w` มีรูป `(D,)` เลขตัวใน (`D` กับ `D`) ต้องเท่ากัน ผลลัพธ์จะเหลือเลขตัวนอกคือ `(N,)`",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ระบบคัดกรองทิกเก็ตซัพพอร์ต e-commerce ไทยต้องการจัดลำดับความเร่งด่วนของทิกเก็ต 3 ใบจากฟีเจอร์ 3 ตัว `[ชั่วโมงที่รอ, มูลค่าออเดอร์(พันบาท), จำนวนครั้งที่ทักซ้ำ]` มาดูการคำนวณแบบ vectorized ด้วย NumPy ทีละขั้น",
    steps: [
      {
        title: "1 · สร้างเมทริกซ์ฟีเจอร์ `float32` และตรวจ Shape / หน่วยความจำ",
        explain:
          "จัดเก็บทิกเก็ตทั้ง 3 ใบเป็นเมทริกซ์ 2 มิติรูป `(3, 3)` ชนิด `np.float32` เพื่อพร้อมคำนวณพร้อมกันทุกแถว",
        code: {
          language: "python",
          filename: "worked_day37.py",
          code: `import numpy as np

ticket_ids = ["TKT-101", "TKT-102", "TKT-103"]
# คอลัมน์: [wait_hours, order_k_thb, repeat_contact]
X = np.array(
    [
        [4.0, 3.0, 1.0],
        [0.5, 0.5, 0.0],
        [2.0, 6.0, 2.0],
    ],
    dtype=np.float32,
)

print(f"shape={X.shape}, dtype={X.dtype}, nbytes={X.nbytes}")`,
        },
        output: `shape=(3, 3), dtype=float32, nbytes=36`,
      },
      {
        title: "2 · คำนวณคะแนนความเร่งด่วนทั้งชุดด้วย Dot Product (`X @ weights`)",
        explain:
          "กำหนดน้ำหนักความสำคัญของแต่ละฟีเจอร์ `[1.5, 2.0, 3.0]` แล้วใช้ `X @ weights` เพื่อคำนวณคะแนนทั้ง 3 ทิกเก็ตในครั้งเดียว จากนั้นเรียงจากคะแนนมากไปน้อย",
        code: {
          language: "python",
          filename: "worked_day37.py",
          code: `weights = np.array([1.5, 2.0, 3.0], dtype=np.float32)
scores = X @ weights  # (3, 3) @ (3,) -> (3,)

for idx in np.argsort(-scores):
    print(f"{ticket_ids[idx]} -> urgency_score = {scores[idx]:.2f}")`,
        },
        output: `TKT-103 -> urgency_score = 21.00
TKT-101 -> urgency_score = 15.00
TKT-102 -> urgency_score = 1.75`,
      },
      {
        title: "3 · เปรียบเทียบ L1 vs L2 Norm รายแถว และตรวจความสอดคล้องระหว่างคู่ทิกเก็ต",
        explain:
          "คำนวณทั้ง L1 norm และ L2 norm ของแต่ละทิกเก็ตด้วย `axis=1` แล้วดู Dot Product ระหว่าง `TKT-101` กับ `TKT-103`",
        code: {
          language: "python",
          filename: "worked_day37.py",
          code: `l1_norms = np.linalg.norm(X, ord=1, axis=1)
l2_norms = np.linalg.norm(X, ord=2, axis=1)

for tid, l1, l2 in zip(ticket_ids, l1_norms, l2_norms):
    print(f"{tid} -> L1={l1:.2f} | L2={l2:.4f}")

pair_dot = float(X[0] @ X[2])
print(f"Dot(TKT-101, TKT-103) = {pair_dot:.1f}")`,
        },
        output: `TKT-101 -> L1=8.00 | L2=5.0990
TKT-102 -> L1=1.00 | L2=0.7071
TKT-103 -> L1=10.00 | L2=6.6332
Dot(TKT-101, TKT-103) = 28.0`,
      },
    ],
    gotcha:
      "จุดสังเกต: ถ้าลืมใส่ `axis=1` ใน `np.linalg.norm(X, ord=2)` NumPy จะคำนวณ Frobenius norm ของทั้งเมทริกซ์ออกมาเป็นเลขสเกลาร์ตัวเดียว แทนที่จะได้ความยาวของแต่ละทิกเก็ต — เช็ก `.shape` ของผลลัพธ์เสมอ",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูลพื้นฐานด้านเวกเตอร์ด้วย NumPy (`exercise_day37.py`) ที่แปลงข้อมูลเป็นเมทริกซ์ `float32`, คำนวณคะแนนถ่วงน้ำหนักแบบ vectorized และหา L1/L2 norm รายแถวอย่างปลอดภัย",
    requirements: [
      "`to_float32_matrix(rows: list[list[float]]) -> np.ndarray`: แปลงลิสต์ 2 มิติเป็น NumPy array ชนิด `np.float32` — ถ้า `rows` ว่าง, แถวแรกว่าง, หรือความยาวแต่ละแถวไม่เท่ากันให้โยน `ValueError` ({{fail-fast}})",
      "`weighted_scores(matrix: np.ndarray, weights: np.ndarray) -> np.ndarray`: ตรวจว่า `matrix` เป็น 2D, `weights` เป็น 1D และ `matrix.shape[1] == weights.shape[0]` (ถ้าไม่ตรงโยน `ValueError`) แล้วคำนวณ `matrix @ weights` โดยไม่ใช้ Python loop และคืนผลชนิด `np.float32`",
      "`row_norms(matrix: np.ndarray, order: int = 2) -> np.ndarray`: ตรวจว่า `matrix` เป็น 2D และ `order` เป็น `1` หรือ `2` เท่านั้น (ไม่งั้นโยน `ValueError`) แล้วคืนเวกเตอร์ 1D ของ L1 หรือ L2 norm รายแถว (`axis=1`) ชนิด `np.float32`",
      "โค้ดต้องมี type hints ครบและผ่าน `uv run ruff check .` โดยไม่มีคำเตือน",
    ],
    starter: {
      language: "python",
      filename: "exercise_day37.py",
      code: `import numpy as np


def to_float32_matrix(rows: list[list[float]]) -> np.ndarray:
    """แปลง list 2D เป็น NumPy array ชนิด float32 พร้อมตรวจความถูกต้องของมิติ"""
    # TODO: ตรวจว่าไม่ว่างและทุกแถวยาวเท่ากัน แล้วคืน np.asarray(..., dtype=np.float32)
    raise NotImplementedError


def weighted_scores(matrix: np.ndarray, weights: np.ndarray) -> np.ndarray:
    """คำนวณคะแนนถ่วงน้ำหนักรายแถวด้วย matrix @ weights (vectorized)"""
    # TODO: ตรวจ shape ของ matrix (2D) และ weights (1D) แล้วคูณด้วย @
    raise NotImplementedError


def row_norms(matrix: np.ndarray, order: int = 2) -> np.ndarray:
    """คำนวณ L1 (order=1) หรือ L2 (order=2) norm ของแต่ละแถวในเมทริกซ์ 2D"""
    # TODO: ตรวจ matrix.ndim == 2 และ order in (1, 2) แล้วใช้ np.linalg.norm(..., axis=1)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day37.py",
      code: `import numpy as np
import pytest
from exercise_day37 import row_norms, to_float32_matrix, weighted_scores


def test_to_float32_matrix_valid_and_invalid():
    mat = to_float32_matrix([[1, 2, 3], [4.5, 5.5, 6.5]])
    assert mat.shape == (2, 3)
    assert mat.dtype == np.float32

    with pytest.raises(ValueError):
        to_float32_matrix([])
    with pytest.raises(ValueError):
        to_float32_matrix([[]])
    with pytest.raises(ValueError):
        to_float32_matrix([[1.0, 2.0], [3.0]])


def test_weighted_scores_vectorized_values():
    X = to_float32_matrix([
        [4.0, 3.0, 1.0],
        [0.5, 0.5, 0.0],
        [2.0, 6.0, 2.0],
    ])
    w = np.array([1.5, 2.0, 3.0], dtype=np.float32)
    scores = weighted_scores(X, w)

    assert scores.shape == (3,)
    assert scores.dtype == np.float32
    assert scores == pytest.approx([15.0, 1.75, 21.0])


def test_weighted_scores_dimension_mismatch_raises():
    X = to_float32_matrix([[1.0, 2.0]])
    with pytest.raises(ValueError):
        weighted_scores(X, np.array([1.0, 2.0, 3.0], dtype=np.float32))


def test_row_norms_l1_and_l2():
    X = to_float32_matrix([[3.0, 4.0], [10.0, 0.0], [0.0, 0.0]])
    l1 = row_norms(X, order=1)
    l2 = row_norms(X, order=2)

    assert l1.dtype == np.float32
    assert l2.dtype == np.float32
    assert l1 == pytest.approx([7.0, 10.0, 0.0])
    assert l2 == pytest.approx([5.0, 10.0, 0.0])

    with pytest.raises(ValueError):
        row_norms(X, order=3)
`,
    },
    selfCheck: [
      "`to_float32_matrix` คืน `dtype == np.float32` และโยน `ValueError` เมื่ออินพุตว่างหรือแถวยาวไม่เท่ากัน",
      "`weighted_scores` ใช้ `arr @ w` แบบ vectorized โดยไม่เขียน `for` loop และคืนผลรูป `(n_rows,)`",
      "`row_norms` รองรับทั้ง `order=1` (L1) และ `order=2` (L2) และใส่ `axis=1` ถูกต้อง",
      "เมื่อป้อน `weights` ที่ความยาวไม่ตรงจำนวนคอลัมน์ หรือ `order=3` ระบบโยน `ValueError` ทันที",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านครบทั้งหมด",
    ],
    acceptance:
      "ผ่านทั้ง 4 test functions ใน `test_day37.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `to_float32_matrix` ให้ตรวจ `if not rows or not rows[0]:` และตรวจความยาวทุกแถวด้วย `row_len = len(rows[0]); if any(len(r) != row_len for r in rows): raise ValueError(...)` ก่อนเรียก `np.asarray(rows, dtype=np.float32)`",
      },
      {
        body: "ใน `weighted_scores` แปลงทั้งสองอินพุตเป็น `np.asarray(..., dtype=np.float32)` เช็ก `arr.ndim == 2`, `w.ndim == 1`, `arr.shape[1] == w.shape[0]` แล้วคืน `(arr @ w).astype(np.float32)`",
      },
      {
        body: "โครงของ `to_float32_matrix` และ `weighted_scores` เกือบครบแล้ว เหลือเติมส่วน `row_norms` ด้วย `np.linalg.norm(..., ord=order, axis=1)`:",
        code: {
          language: "python",
          filename: "hint_day37.py",
          code: `import numpy as np


def to_float32_matrix(rows: list[list[float]]) -> np.ndarray:
    if not rows or not rows[0]:
        raise ValueError("rows must be a non-empty 2D list")
    width = len(rows[0])
    if any(len(r) != width for r in rows):
        raise ValueError("all rows must have the same length")
    return np.asarray(rows, dtype=np.float32)


def weighted_scores(matrix: np.ndarray, weights: np.ndarray) -> np.ndarray:
    arr = np.asarray(matrix, dtype=np.float32)
    w = np.asarray(weights, dtype=np.float32)
    if arr.ndim != 2 or w.ndim != 1 or arr.shape[1] != w.shape[0]:
        raise ValueError("incompatible shapes for matrix @ weights")
    return (arr @ w).astype(np.float32)


def row_norms(matrix: np.ndarray, order: int = 2) -> np.ndarray:
    arr = np.asarray(matrix, dtype=np.float32)
    if arr.ndim != 2:
        raise ValueError("matrix must be 2D")
    if order not in (1, 2):
        raise ValueError("order must be 1 or 2")
    # TODO: คืน np.linalg.norm(arr, ord=order, axis=1).astype(np.float32)
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
      title: "สับสนระหว่าง `*` (Element-wise Multiply) กับ `@` (Dot Product)",
      symptom:
        "เขียน `a * b` เพื่อหา Dot Product แล้วได้เวกเตอร์กลับมาแทนที่จะเป็นเลขสเกลาร์ (หรือได้เมทริกซ์ผิดรูปเมื่อคำนวณกับ 2D array)",
      fix: "จำง่าย ๆ: `*` คูณทีละตำแหน่งแล้วคงรูปเดิม ส่วน `@` คูณแล้วบวกรวมตามแกนในสุด (Dot Product / Matrix Multiplication)",
    },
    {
      title: "ลืมใส่ `axis=1` ใน `np.linalg.norm(X)`",
      symptom:
        "อยากได้ความยาวของเอกสารทีละแถว แต่ผลลัพธ์กลับเป็นเลขทศนิยมตัวเดียว (Frobenius norm ของทั้งเมทริกซ์)",
      fix: "ระบุ `axis=1` ทุกครั้งเมื่อแต่ละแถวคือ 1 ตัวอย่าง/เอกสาร และเช็ก `norms.shape == (X.shape[0],)`",
    },
    {
      title: "ปล่อยให้ NumPy เดาเป็น `int64` หรือ `float64` โดยไม่ตั้งใจ",
      symptom:
        "โหลดเมทริกซ์ขนาดใหญ่แล้วกิน RAM เป็น 2 เท่าของที่คำนวณไว้ หรือเกิดปัญหาชนิดข้อมูลไม่ตรงกับโมเดลที่รับ `float32`",
      fix: "กำหนด `dtype=np.float32` อย่างชัดเจนตั้งแต่ขั้นสร้าง array (`np.asarray(..., dtype=np.float32)`)",
    },
    {
      title: "เขียน `for` loop ซ้อนบนเมทริกซ์ NumPy ขนาดใหญ่",
      symptom:
        "ใช้ NumPy แล้วแต่โค้ดยังช้าพอ ๆ กับ Python ปกติ เพราะดึงค่าออกมาคำนวณทีละช่องในลูป",
      fix: "ย้ายการคำนวณทั้งหมดเข้าสู่ตัวดำเนินการระดับ array เช่น `X @ w`, `X * scale`, `np.linalg.norm(X, axis=1)`",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d037-q1",
        "ถ้าเมทริกซ์ `X` มีรูป `(100, 768)` และเวกเตอร์น้ำหนัก `w` มีรูป `(768,)` ผลลัพธ์ของ `X @ w` จะมี `.shape` เป็นเท่าใด?",
        [
          ["`(100, 768)`", "ผิด — นั่นคือรูปของ `X * w` (element-wise multiply) ไม่ใช่ `@`"],
          ["`(100,)`", "ถูก — `(100, 768) @ (768,)` ยุบแกน `768` ที่ตรงกัน เหลือคะแนน 1 ค่าต่อแถว รวม 100 ค่า"],
          ["`(768,)`", "ผิด — แกน `768` ถูกคูณและรวมเข้าด้วยกันแล้ว"],
          ["เกิด `ValueError` เพราะ `w` ต้องเป็น 2 มิติเสมอ", "ไม่จริง — NumPy รองรับ `(N, D) @ (D,)` โดยตรง"],
        ],
        "B",
        "ในการคูณเมทริกซ์กับเวกเตอร์ `(N, D) @ (D,)` มิติในสุด `D` จะถูกดอทและรวมเข้าด้วยกัน เหลือเวกเตอร์ 1 มิติรูป `(N,)`",
        "ผลลัพธ์ของ `X @ w` เมื่อ `X.shape == (N, D)` และ `w.shape == (D,)` มีรูป (shape) เป็นเท่าใด?",
        "`(N,)` — ได้คะแนน Dot Product 1 ค่าต่อ 1 แถวของเมทริกซ์ `X`",
      ),
      mc(
        "d037-q2",
        "เวกเตอร์ `a = [1, 2]` และ `b = [-2, 1]` มีค่า Dot Product (`a @ b`) เท่าไร และหมายความว่าอย่างไรเชิงเรขาคณิต?",
        [
          ["`0` — เวกเตอร์ทั้งสองตั้งฉากกัน (มุม 90°)", "ถูก — `(1)(-2) + (2)(1) = -2 + 2 = 0` แปลว่าตั้งฉากกัน"],
          ["`4` — เวกเตอร์ทั้งสองชี้ไปทิศเดียวกัน", "ผิด — ลืมเครื่องหมายลบของ `-2`"],
          ["`-4` — เวกเตอร์ทั้งสองชี้สวนทางกัน", "ผิด — `(2)(1)` เป็น `+2` ไม่ใช่ `-2`"],
          ["`[-2, 2]` — เป็นเวกเตอร์ใหม่ที่ยาวเท่าเดิม", "ผิด — นั่นคือ `a * b` ไม่ใช่ Dot Product (`a @ b`)"],
        ],
        "A",
        "`a @ b = (1)(-2) + (2)(1) = 0` เมื่อ Dot Product ของเวกเตอร์ที่ไม่ใช่ศูนย์เท่ากับ 0 แสดงว่าเวกเตอร์ทั้งสองตั้งฉากกัน (orthogonal)",
        "ถ้า `a @ b == 0` (โดยทั้งคู่ไม่ใช่เวกเตอร์ศูนย์) เวกเตอร์ทั้งสองมีความสัมพันธ์เชิงทิศทางอย่างไร?",
        "ตั้งฉากกัน (orthogonal, มุม 90°) — ไม่มีความสอดคล้องเชิงทิศทางต่อกัน",
      ),
      mc(
        "d037-q3",
        "เวกเตอร์ `v = [3.0, -4.0]` มีค่า **L1 Norm** และ **L2 Norm** เท่าไรตามลำดับ?",
        [
          ["L1 = `-1.0`, L2 = `5.0`", "ผิด — Norm ต้องใช้ค่าสัมบูรณ์ (`|-4| = 4`) จึงไม่มีทางติดลบ"],
          ["L1 = `5.0`, L2 = `7.0`", "สลับกัน — L1 คือผลรวมค่าสัมบูรณ์ (`7.0`) ส่วน L2 คือรากที่สองของผลรวมกำลังสอง (`5.0`)"],
          ["L1 = `7.0`, L2 = `5.0`", "ถูก — L1 = `|3| + |-4| = 7.0`, L2 = `√(3² + (-4)²) = √25 = 5.0`"],
          ["L1 = `7.0`, L2 = `25.0`", "ผิด — ลืมถอดรากที่สองใน L2 Norm"],
        ],
        "C",
        "L1 Norm รวมค่าสัมบูรณ์ (`|3| + |-4| = 7.0`) ส่วน L2 Norm คือรากที่สองของผลรวมกำลังสอง (`√(9 + 16) = 5.0`)",
        "สูตรความต่างระหว่าง L1 Norm กับ L2 Norm คืออะไร?",
        "L1 Norm = `sum(|v_i|)` (Manhattan) ส่วน L2 Norm = `sqrt(sum(v_i^2))` (Euclidean) ซึ่งลงโทษค่าสุดโต่งหนักกว่า",
      ),
      mc(
        "d037-q4",
        "ทำไมงาน ML และ Embeddings ใน NumPy จึงนิยมเลือก `dtype=np.float32` แทน `np.float64`?",
        [
          ["เพราะ `float64` คำนวณ Dot Product ใน NumPy ไม่ได้", "ไม่จริง — `float64` คำนวณได้ปกติ"],
          ["เพราะ `float32` ใช้หน่วยความจำน้อยลงครึ่งหนึ่ง (4 bytes vs 8 bytes) และคำนวณเร็วกว่า โดยยังแม่นยำเพียงพอสำหรับฟีเจอร์และ embeddings", "ถูก — ช่วยลด RAM และเพิ่ม throughput โดยเฉพาะเมื่อมีเวกเตอร์หลักหมื่นถึงหลักล้านตัว"],
          ["เพราะ `float32` ไม่มีปัญหา floating-point rounding เลย", "ไม่จริง — `float32` มีทศนิยมละเอียดน้อยกว่า `float64` แต่เพียงพอสำหรับงาน ML"],
          ["เพราะ Python `list` บังคับให้ใช้ `float32` เท่านั้น", "Python `float` ปกติเป็น 64-bit double precision"],
        ],
        "B",
        "`np.float32` ประหยัด RAM ลง 50% เมื่อเทียบกับ `float64` และเข้ากันได้กับคำสั่ง SIMD/BLAS และ GPU/ONNX runtime ใน Phase ถัดไป",
        "เหตุผลหลักที่เลือก `dtype=np.float32` ในงาน AI/Embeddings คืออะไร?",
        "ประหยัด RAM ครึ่งหนึ่ง (4 bytes ต่อค่า) และคำนวณเร็วขึ้น โดยยังมีความแม่นยำเพียงพอสำหรับฟีเจอร์และเวกเตอร์ความหมาย",
      ),
    ],
  },

  takeaways: [
    "NumPy `ndarray` เก็บตัวเลขชนิดเดียวกัน (`dtype=np.float32`) เรียงติดกันใน RAM ทำให้การคำนวณแบบ **vectorized** เร็วกว่า Python loop หลายสิบเท่า",
    "**{{dot-product}} (`a @ b`)** อ่านได้สองความหมาย: คะแนนผลรวมถ่วงน้ำหนัก (`X @ w`) และความสอดคล้องของทิศทาง (`>0` ทิศเดียวกัน, `0` ตั้งฉาก, `<0` สวนทาง)",
    "**L1 Norm** (`sum(|v|)`) ให้น้ำหนักทุกหน่วยเท่ากัน ส่วน **L2 Norm** (`sqrt(sum(v^2))`) ลงโทษค่าสุดโต่งหนักกว่าและเป็นรากฐานของ L2 Normalization ใน Day 38",
    "เช็ก `.shape`, `.dtype` และใส่ `axis=1` ให้แม่นเสมอเมื่อทำงานกับเมทริกซ์ 2 มิติ เพื่อกันบั๊กเงียบและจับข้อผิดพลาดแบบ {{fail-fast}}",
  ],

  reviewCards: [
    rc(
      "d037-rc-1",
      "ต่างกันอย่างไรระหว่าง `a * b` กับ `a @ b` ใน NumPy?",
      "`a * b` คือการคูณทีละตำแหน่ง (element-wise) ได้ผลรูปเดิม ส่วน `a @ b` คือ Dot Product / Matrix Multiplication ที่คูณแล้วบวกรวมตามแกนในสุด",
    ),
    rc(
      "d037-rc-2",
      "ทำไม `[5, 5]` กับ `[10, 0]` มี L1 Norm เท่ากัน (`10.0`) แต่ L2 Norm ไม่เท่ากัน?",
      "เพราะ L2 Norm ยกกำลังสองแต่ละสมาชิกก่อนรวมแล้วถอดราก (`√(5²+5²) ≈ 7.07` vs `√(10²+0²) = 10.0`) ทำให้ค่าสุดโต่งในช่องเดียวส่งผลต่อ L2 มากกว่า L1",
    ),
    rc(
      "d037-rc-3",
      "หากลืมใส่ `axis=1` ใน `np.linalg.norm(matrix, ord=2)` จะได้อะไรกลับมา?",
      "จะได้เลขสเกลาร์ตัวเดียว (Frobenius norm ของทั้งเมทริกซ์) แทนที่จะได้เวกเตอร์ความยาวของแต่ละแถวรูป `(n_rows,)`",
    ),
  ],

  sources: [
    {
      label: "NumPy User Guide — NumPy Fundamentals (Array Shapes & Dtypes)",
      href: "https://numpy.org/doc/stable/user/basics.types.html",
    },
    {
      label: "NumPy Reference — numpy.matmul (`@`) & Dot Product",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.matmul.html",
    },
    {
      label: "NumPy Reference — numpy.linalg.norm (L1 & L2 Norms)",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.linalg.norm.html",
    },
    {
      label: "NumPy User Guide — Broadcasting",
      href: "https://numpy.org/doc/stable/user/basics.broadcasting.html",
    },
  ],

  glossary: [
    "dot-product",
    "cosine-similarity",
    "embedding",
    "tensor",
    "fail-fast",
    "pytest",
    "ruff",
    "uv",
  ],
});
