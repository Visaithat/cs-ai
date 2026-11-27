import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D044 — Phase 2 / Block B11 (Review Day)
 * Interleaved recall of D41–D43 (+ D34) + Catch & fix deliberate data leakage bug
 */
export const d044: Lesson = defineLesson({
  day: 44,
  titleTh: "ทบทวน B11: จับและแก้บั๊ก Data Leakage ที่หลอกให้คะแนนสูงเกินจริง",
  tagline: "30 นาที · รอบทบทวน D41–D43 + D34 · รันบนเครื่องคุณ 100% (CPU / ไม่ต้องใช้ API key) · ไล่จับจุดรั่ว 3 แบบแล้วย้ายทุกตัวแปลงเข้า Pipeline",
  icon: "shield-check",
  visual: {
    id: "data-leakage-split",
    title: "ทบทวน B11: จับและแก้บั๊ก Data Leakage ที่หลอกให้คะแนนสูงเกินจริง",
    caption: "เทียบคะแนนปลอม 0.99 จากโค้ดที่รั่วกับคะแนนจริงหลังย้ายตัวแปลงทุกตัวเข้า scikit-learn Pipeline",
    alt: "แผนภาพการตรวจจับและแก้ไข data leakage",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "pandas", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ล้างข้อมูลซ้ำและคัดกรองคอลัมน์ก่อนแบ่ง Train/Test",
      body: "บั๊ก {{data-leakage}} มักเริ่มตั้งแต่ขั้นเตรียมข้อมูล: ลืมตัดแถวซ้ำ (D34), เก็บคอลัมน์จากอนาคตอย่าง `resolved_in_minutes` ไว้ในตารางฟีเจอร์ และแบ่งสุ่มทั้งที่ลูกค้า 1 คนมีหลายทิกเก็ต",
      lessonNote: "วันนี้เราทบทวน D34 + D42 เพื่อทำความสะอาดและแยกกลุ่มข้อมูลให้ปลอดรอยรั่วก่อนเริ่มเทรน",
    },
    {
      node: 2,
      heading: "ย้ายทุกตัวแปลงข้อมูลเข้าไปใน `scikit-learn Pipeline`",
      body: "โค้ดที่เรียก `StandardScaler().fit_transform(X)` หรือ `pd.get_dummies(df)` นอก Pipeline คือแหล่งรั่วไหลเงียบที่พบบ่อยที่สุดในสคริปต์ทดลอง",
      lessonNote: "รื้อสคริปต์ที่รั่วแล้วห่อด้วย `ColumnTransformer` + `LogisticRegression` ภายใน {{sklearn-pipeline}} จาก D43",
    },
    {
      node: 3,
      heading: "แยกแยะคะแนนหลอก (0.99) ออกจากคะแนนจริงที่เชื่อถือได้",
      body: "หลังแก้บั๊ก {{data-leakage}} คะแนนบนชุด Test จะ **ลดลง** จาก ~0.99 มาสู่ระดับความจริง (เช่น ~0.82–0.88) — นั่นไม่ใช่ความล้มเหลว แต่คือการได้กระจกสะท้อนความจริงก่อนขึ้น Production",
      lessonNote: "ใช้ {{pytest}} เขียนเกราะป้องกันอัตโนมัติ (forbidden columns, zero group overlap, raw unseen data inference)",
    },
    {
      node: 5,
      heading: "เตรียมท่อ ML ที่ซื่อสัตย์ก่อนเจาะลึก Metrics และ LightGBM ใน B12",
      body: "การมีท่อประเมินผลที่สะอาดและเชื่อมโยงกับ Decision Matrix (D41) ทำให้การจูน threshold และเปรียบเทียบโมเดลใน Block B12 (Day 45–48) มีความหมายจริง",
      lessonNote: "จบวันนี้คุณจะได้สคริปต์ Audit + Clean Baseline Pipeline ที่พร้อมต่อยอดสู่ LightGBM และ Thai NLP",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิมแบบสลับหัวข้อ (Interleaved Recall)** ครบทั้ง D41 (ML vs LLM & Hybrid Routing), D42 (Splits & Leakage), D43 (`Pipeline` & `ColumnTransformer`) และ D34 (การจัดการแถวซ้ำและค่าว่าง)",
    "**ตรวจวินิจฉัยและจับบั๊ก {{data-leakage}} 3 จุดพร้อมกัน** ในสคริปต์เทรนโมเดลที่ตั้งใจฝังบั๊ก: (1) Global `StandardScaler` ก่อนแบ่ง, (2) คอลัมน์จากอนาคต `resolved_in_minutes` และ (3) การแบ่งสุ่มบนข้อมูลที่มีทิกเก็ตซ้ำและลูกค้าซ้ำ",
    "**รีแฟกเตอร์โค้ดที่รั่ว** ให้เป็น `GroupShuffleSplit` + {{sklearn-pipeline}} ที่สะอาด พร้อมพิสูจน์ด้วย {{pytest}} ว่าไม่รั่วและรันบนข้อมูล Production ดิบที่มีค่าว่างและหมวดหมู่ใหม่ได้จริง",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D41 (ML vs LLM), D42 (Train/Val/Test & Leakage), D43 (Pipeline & ColumnTransformer) และ D34 (Data Cleaning)",
    "มี `uv`, `scikit-learn`, `pandas`, `pytest` และ `ruff` พร้อมใช้งาน",
    "รันบนเครื่องได้ 100% (CPU) ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งานทบทวน Day 44 ด้วย {{uv}} แล้วติดตั้ง `scikit-learn`, `pandas`, `pytest` และ `ruff` สำหรับห้องแล็บไล่จับบั๊ก Data Leakage",
    commands: `uv init ai-day44-review && cd ai-day44-review
uv add scikit-learn pandas
uv add --dev pytest ruff
uv run python -c "import sklearn, pandas; print('B11 Review Env Ready:', sklearn.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day44-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `scikit-learn`, `pandas`, `pytest`, `ruff` ผ่าน `uv add`"],
      ["verify", "รันคำสั่งยืนยันสภาพแวดล้อม B11 Review สำเร็จ"],
    ],
    note: "รอบทบทวน Day 44 แบ่งเวลาตามสูตร 30 นาที: 10 นาทีทำ Interleaved Recall Quiz → 15 นาทีดีบักและแก้สคริปต์ Data Leakage + รันเทสต์ → 5 นาทีจดข้อผิดพลาดที่พบบ่อยเข้า Error Log",
  },

  concepts: [
    {
      id: "b11-interleaved-synthesis",
      title: "1 · ร้อยต่อจิ๊กซอว์ B11 (+ D34): จากการตัดสินใจเลือก ML สู่ Pipeline ที่เชื่อถือได้",
      paragraphs: [
        "ตลอด 3 วันที่ผ่านมาใน Block B11 เราวางรากฐาน Classical ML ครบ 3 เสาหลัก: **D41** สอนวิจารณญาณว่าเมื่อไรควรใช้ Classical ML (`<10ms`, ตาราง, ปริมาณสูง) หรือ Hybrid Routing แทนที่จะโยนทุกอย่างให้ {{llm}}, **D42** สอนวิธีแบ่ง Train/Val/Test ให้ตรงธรรมชาติข้อมูลและปิดรอยรั่ว, และ **D43** สอนวิธีมัด `ColumnTransformer` + โมเดลเป็น {{sklearn-pipeline}} ชิ้นเดียว",
        "เมื่อรวมเข้ากับ **D34** (การตัดแถวซ้ำและทำความสะอาดค่าว่างตั้งแต่ต้นน้ำ) เราจะได้ลำดับขั้นตอนมาตรฐานของงาน ML จริงที่ไม่เคยสลับลำดับ: **Clean/Deduplicate → Drop Future Columns → Split (Stratified / Time / Group) → Fit Pipeline on Train Only → Evaluate on Val/Test**",
      ],
      analogy:
        "เหมือนกระบวนการผลิตอาหารปลอดภัย (GMP): คัดของเสีย/ซ้ำออกก่อน (D34) → แยกห้องวัตถุดิบกับห้องสุ่มตรวจไม่ให้ปนกัน (D42) → ใช้สายพานปิดสนิทแบบอัตโนมัติ (D43) — พลาดแค่ด่านเดียวผลตรวจก็เชื่อถือไม่ได้",
      bullets: [
        "**D41 (Judgment)** — เลือก Classical ML / Hybrid ก่อนลงมือ เพื่อคุม Latency และต้นทุนต่อ 100k คำขอ",
        "**D34 + D42 (Hygiene & Split)** — ตัด `duplicate` ก่อนแบ่ง, ห้ามใส่คอลัมน์จากอนาคต, ใช้ `GroupShuffleSplit` เมื่อมีหลายแถวต่อลูกค้า",
        "**D43 (Architecture)** — ห่อ `SimpleImputer`, `StandardScaler`, `OneHotEncoder(handle_unknown=\"ignore\")` และ `Classifier` ใน `Pipeline` เดียว",
      ],
      whyTitle: "Why this matters — ฝึกสายตา 'จับผิดโค้ด ML' ซึ่งเป็นทักษะสำคัญตอน Code Review",
      whyParagraphs: [
        "ในทีม AI จริง คุณไม่ได้แค่เขียนโค้ดใหม่จากศูนย์ แต่ต้องรีวิว PR ของเพื่อนร่วมทีม (หรือโค้ดที่ AI ช่วยเขียน) ซึ่งมักมีบั๊ก {{data-leakage}} ที่รันผ่านโดยไม่มี error แต่ให้คะแนนหลอกตา",
        "การฝึกดีบักสคริปต์ที่ตั้งใจฝังบั๊กในวันนี้จะสร้างสัญชาตญาณให้คุณจับรอยรั่วได้ภายในไม่กี่วินาที",
      ],
    },
    {
      id: "anatomy-of-leaky-script",
      title: "2 · ผ่าตัดสคริปต์ 'คะแนน 0.99 ปลอม' — จับ 3 จุดรั่วในโค้ดเดียว",
      paragraphs: [
        "ลองดูสคริปต์ฝึกโมเดลทำนายความเร่งด่วนทิกเก็ตด้านล่างที่ดูเผิน ๆ เหมือนจะ 'โค้ดสั้น รันผ่าน และได้ F1 = 0.99 สวยหรู!' แต่ความจริงซ่อน **บั๊ก Data Leakage ถึง 3 จุดซ้อนกัน**:",
        "**จุดรั่ว #1 (Target / Future Leakage)**: คอลัมน์ `resolved_in_minutes` คือจำนวนนาทีที่เจ้าหน้าที่ใช้ปิดทิกเก็ต (ทิกเก็ตด่วนมักถูกปิดเร็วกว่า 15 นาที) ซึ่งเป็นข้อมูลจากอนาคตที่ไม่มีวันรู้ ณ วินาทีที่ลูกค้าเพิ่งเปิดทิกเก็ต!",
        "**จุดรั่ว #2 (Duplicate & Customer Leakage)**: ตารางมีทิกเก็ตซ้ำ (`ticket_id` เดิมโผล่ 2–3 รอบจาก retry log) และลูกค้าคนเดิมมีหลายใบ แต่สคริปต์สุ่มแบ่งด้วย `train_test_split` ตรง ๆ ทำให้แถวซ้ำและลูกค้าเดิมหลุดข้ามไปอยู่ทั้ง Train และ Test — และ **จุดรั่ว #3 (Global Preprocessing Leakage)**: เรียก `StandardScaler().fit_transform(X_num)` และ `pd.get_dummies(df)` บนตารางรวมทั้งหมดก่อนแบ่ง",
      ],
      analogy:
        "เหมือนทีมขายรายงานว่ายอดปิดการขายแม่น 99% แต่พอเปิดดูสูตรพบว่า 1) แอบเอาใบเสร็จที่จ่ายเงินแล้วมาเป็นตัวแปรทำนาย, 2) นับลูกค้าคนเดิมซ้ำสองฝั่ง และ 3) เอาข้อมูลเดือนหน้ามาเฉลี่ยปนกับเดือนนี้",
      code: {
        language: "python",
        filename: "buggy_leaky_script.py",
        code: `# [คำเตือน: โค้ดตัวอย่างที่มีบั๊ก Data Leakage 3 จุด — ห้ามนำไปใช้จริง!]
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def leaky_train_score(df: pd.DataFrame) -> float:
    # BUG #1: ลืมตัดแถวซ้ำ (ticket_id ซ้ำ) และใช้คอลัมน์จากอนาคต 'resolved_in_minutes'!
    X = df[["wait_min", "order_value_thb", "resolved_in_minutes", "channel"]].copy()
    X["wait_min"] = X["wait_min"].fillna(X["wait_min"].median())  # BUG #3a: เติมค่าว่างก่อน split
    X = pd.get_dummies(X, columns=["channel"])  # BUG #3b: one-hot ทั้งตารางก่อน split

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)  # BUG #3c: fit scaler บนข้อมูลทั้งหมดก่อน split!

    # BUG #2: แบ่งสุ่มโดยไม่แยกกลุ่ม customer_id และไม่ได้ตัดแถวซ้ำ
    X_tr, X_te, y_tr, y_te = train_test_split(X_scaled, df["is_urgent"], test_size=0.25, random_state=42)
    clf = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
    return float(clf.score(X_te, y_te))  # ได้ ~0.98-0.99 ปลอม!`,
        caption: "โค้ดนี้รันผ่านโดยไม่มี error แม้แต่บรรทัดเดียว แต่เต็มไปด้วยรอยรั่ว 3 จุดที่จะทำให้โมเดลพังใน Production",
      },
      whyTitle: "Why this matters — บั๊ก ML ที่อันตรายที่สุดคือบั๊กที่ไม่โยน Exception",
      whyParagraphs: [
        "ต่างจาก `SyntaxError` หรือ `KeyError` ที่ Python แจ้งเตือนทันที บั๊ก {{data-leakage}} จะเงียบสนิทแถมให้รางวัลเป็นคะแนน Test ที่สวยกว่าเดิมเสียอีก",
        "วิธีสู้กับบั๊กเงียบแบบนี้คือการมี **Leakage Audit Checklist** และชุดเทสต์อัตโนมัติใน `pytest` ที่บังคับตรวจทุกครั้งก่อน merge โค้ด",
      ],
    },
    {
      id: "automated-leakage-guardrails",
      title: "3 · สร้างเกราะป้องกันอัตโนมัติด้วย `pytest` Guardrails",
      paragraphs: [
        "แทนที่จะอาศัยความจำอย่างเดียว เราสามารถเปลี่ยนกฎป้องกัน {{data-leakage}} ให้เป็น **Unit Tests ที่รันใน CI ทุกครั้ง**: (1) ประกาศรายการ `ALLOWED_FEATURES` อย่างชัดแจ้ง (Allowlist) และทดสอบว่า `FORBIDDEN_POST_EVENT_COLS` อย่าง `resolved_in_minutes` ไม่ถูกใช้ใน `ColumnTransformer`",
        "(2) ทดสอบ `clean_and_split` ว่าหลังตัดแถวซ้ำตาม `ticket_id` แล้ว ไม่มี `ticket_id` และ `customer_id` ใดปรากฏซ้ำข้ามฝั่งระหว่าง Train และ Test เลย (`set(train[\"customer_id\"]).isdisjoint(test[\"customer_id\"])`)",
        "(3) ทดสอบ Inference Contract: ส่งตารางดิบที่ยังไม่ได้สเกล ไม่มีคอลัมน์อนาคต มีค่า `None` และมีหมวดหมู่ใหม่เข้าไปใน `pipeline.predict_proba(raw_df)` แล้วต้องทำงานสำเร็จโดยไม่ error — นี่เป็นการพิสูจน์ว่าตัวแปลงทุกตัวอยู่ใน `Pipeline` จริงและไม่ได้พึ่งคอลัมน์จากอนาคต",
      ],
      analogy:
        "เหมือนเครื่องตรวจจับโลหะหน้าประตูสนามบิน — ต่อให้คนรีบแค่ไหน ถ้าพกของต้องห้าม (`resolved_in_minutes` หรือลูกค้าข้ามฝั่ง) เครื่องจะร้องเตือนทันทีใน `pytest`",
      bullets: [
        "**Allowlist Features** — ระบุชื่อฟีเจอร์ที่อนุญาต ณ เวลาเปิดทิกเก็ตเท่านั้น พร้อมตั้ง `remainder=\"drop\"`",
        "**Disjointness Test** — ยืนยัน `ticket_id` ไม่ซ้ำและ `customer_id` ไม่ข้ามฝั่งด้วย `set(...).isdisjoint(...)`",
        "**Raw Production Smoke Test** — ส่ง DataFrame ดิบ (ไม่มีคอลัมน์อนาคต + มี null + มีหมวดหมู่ใหม่) เข้า `pipe.predict_proba()`",
      ],
      whyTitle: "Why this matters — สะพานเชื่อมจาก Phase 2 สู่ Eval Gates ใน Phase 5",
      whyParagraphs: [
        "แนวคิดการเขียน deterministic tests เพื่อตรวจคุณภาพข้อมูลและสัญญาอินพุตของโมเดลวันนี้ คือรากฐานเดียวกับ Automated Eval Gates ใน CI ที่เราจะสร้างใน Block B33",
        "เมื่อชุดเทสต์นี้ผ่าน คุณจึงจะมั่นใจได้ว่าตัวเลข Precision, Recall และ F1 ที่กำลังจะเจาะลึกในวันพรุ่งนี้ (Day 45) เป็นตัวเลขที่สะอาดและเชื่อถือได้ 100%",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Leakage Audit กับ Security Code Review",
      body: [
        "การไล่จับบั๊ก Data Leakage ในสคริปต์ ML ใช้กรอบความคิดเดียวกับการรีวิวช่องโหว่ความปลอดภัยใน Backend API:",
      ],
      table: [
        ["Allowed feature list + remainder='drop'", "DTO / Zod allowlist เพื่อกัน Mass Assignment"],
        ["Drop post-event columns (resolved_in_minutes)", "ห้ามอ่านฟิลด์ที่ยังไม่มีค่าใน request lifecycle ตอนนั้น"],
        ["Deduplicate + GroupShuffleSplit", "กันข้อมูลซ้ำ (idempotency) และแยก tenant isolation"],
        ["Raw unseen-data pytest smoke test", "Contract / integration test กับ payload ที่ยังไม่ผ่านการ clean"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมคะแนน 'ลดลง' หลังแก้บั๊กถึงเป็นข่าวดี?",
      body: [
        "หลายคนตกใจเมื่อแก้บั๊ก Data Leakage เสร็จแล้วเห็นคะแนนโมเดลลดจาก `0.99` เหลือ `0.83` แล้วเผลอคิดว่าตัวเองแก้ผิด — ขอให้จำไว้ว่า **0.99 คือคะแนนปลอม** เพราะโมเดลแอบโกงข้อสอบ ส่วน **0.83 คือความสามารถที่แท้จริง** บนข้อมูลลูกค้าใหม่",
        "การยอมรับคะแนนจริง 0.83 ตั้งแต่วันนี้ช่วยให้คุณพัฒนาฟีเจอร์ที่มีประโยชน์จริง (เช่น การตัดคำภาษาไทยใน Block B13 หรือใช้ LightGBM ใน Block B12) เพื่อดันคะแนนจริงขึ้นอย่างยั่งยืน",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีชุดข้อมูลทิกเก็ตที่จงใจใส่แถวซ้ำ (`ticket_id` ซ้ำ), ลูกค้าหลายใบ (`customer_id`) และคอลัมน์จากอนาคต (`resolved_in_minutes`) มาลองรันเทียบสคริปต์ที่รั่วกับสคริปต์ที่ซ่อมเสร็จแล้วทีละขั้น",
    steps: [
      {
        title: "1 · สร้างชุดข้อมูลที่มีกับดักครบทั้ง 3 แบบ และดูคะแนนปลอมจากโค้ดที่รั่ว",
        explain:
          "ในข้อมูลจำลองนี้ `resolved_in_minutes` สัมพันธ์ตรงกับ `is_urgent` (เพราะทีมงานรีบปิดงานด่วนใน <15 นาที) และมีการทำซ้ำ 30% ของแถว — โค้ดที่รั่วจะได้คะแนนสูงเกือบเต็ม",
        code: {
          language: "python",
          filename: "worked_debug_leakage.py",
          code: `import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(42)
n = 200
wait = rng.normal(25, 10, n).clip(2)
amount = rng.normal(1200, 500, n).clip(100)
channel = rng.choice(["line", "email", "web"], size=n)
cust_ids = [f"CUS-{i % 40:02d}" for i in range(n)]
is_urgent = (0.08 * wait + 0.001 * amount + rng.normal(0, 1.0, n) > 3.8).astype(int)
# คอลัมน์จากอนาคต! งานด่วนถูกปิดเร็ว (<15 นาที) งานปกติปิดช้า (>45 นาที)
resolved_min = np.where(is_urgent == 1, rng.uniform(3, 14, n), rng.uniform(45, 120, n))

base_df = pd.DataFrame({
    "ticket_id": [f"T-{i:04d}" for i in range(n)],
    "customer_id": cust_ids,
    "wait_min": wait,
    "order_value_thb": amount,
    "channel": channel,
    "resolved_in_minutes": resolved_min,
    "is_urgent": is_urgent,
})
# จงใจเติมแถวซ้ำ 60 แถว (เช่น log retry)
dirty_df = pd.concat([base_df, base_df.iloc[:60]], ignore_index=True)

# โค้ดที่รั่ว (LEAKY)
X_leak = pd.get_dummies(dirty_df[["wait_min", "order_value_thb", "resolved_in_minutes", "channel"]])
X_leak_scaled = StandardScaler().fit_transform(X_leak)
Xtr, Xte, ytr, yte = train_test_split(X_leak_scaled, dirty_df["is_urgent"], test_size=0.25, random_state=42)
leaky_f1 = f1_score(yte, LogisticRegression(max_iter=1000).fit(Xtr, ytr).predict(Xte))
print(f"[LEAKY] Suspiciously high F1 = {leaky_f1:.3f} (rows={len(dirty_df)})")`,
        },
        output: `[LEAKY] Suspiciously high F1 = 1.000 (rows=260)`,
      },
      {
        title: "2 · ซ่อมบั๊กทั้ง 3 จุด: Deduplicate + Drop Future Column + GroupSplit + Pipeline",
        explain:
          "ตัดแถวซ้ำด้วย `drop_duplicates(subset=[\"ticket_id\"])`, แบ่งด้วย `GroupShuffleSplit` ตาม `customer_id`, อนุญาตเฉพาะฟีเจอร์ ณ เวลาเปิดทิกเก็ต และมัดทุกตัวแปลงเข้า `Pipeline`",
        code: {
          language: "python",
          filename: "worked_debug_leakage.py",
          code: `from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# Fix #1: ตัดแถวซ้ำก่อนแบ่ง
dedup_df = dirty_df.drop_duplicates(subset=["ticket_id"], keep="first").reset_index(drop=True)

# Fix #2: ใช้ GroupShuffleSplit ไม่ให้ customer_id ข้ามฝั่ง
gss = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
tr_idx, te_idx = next(gss.split(dedup_df, dedup_df["is_urgent"], groups=dedup_df["customer_id"]))
train_df, test_df = dedup_df.iloc[tr_idx], dedup_df.iloc[te_idx]

# Fix #3: อนุญาตเฉพาะฟีเจอร์ ณ เวลาเปิดทิกเก็ต (ไม่มี resolved_in_minutes) ใน Pipeline
NUM_COLS = ["wait_min", "order_value_thb"]
CAT_COLS = ["channel"]
clean_pipe = Pipeline([
    ("preprocess", ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), NUM_COLS),
        ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")), ("oh", OneHotEncoder(handle_unknown="ignore"))]), CAT_COLS),
    ], remainder="drop")),
    ("clf", LogisticRegression(max_iter=1000, random_state=42)),
])

clean_pipe.fit(train_df, train_df["is_urgent"])
clean_f1 = f1_score(test_df["is_urgent"], clean_pipe.predict(test_df))
print(f"[CLEAN] Honest test F1 = {clean_f1:.3f} (dedup rows={len(dedup_df)})")`,
        },
        output: `[CLEAN] Honest test F1 = 0.789 (dedup rows=200)`,
      },
      {
        title: "3 · ยืนยันด้วย Audit Checks ว่าไม่มีรอยรั่วเหลืออยู่และพร้อมรับข้อมูล Production",
        explain:
          "ตรวจสอบทั้ง customer overlap, คอลัมน์ที่ใช้จริงใน `ColumnTransformer` และการทำนายทิกเก็ตใหม่ที่ไม่มี `resolved_in_minutes` และมีช่องทางใหม่",
        code: {
          language: "python",
          filename: "worked_debug_leakage.py",
          code: `assert set(train_df["customer_id"]).isdisjoint(test_df["customer_id"])
used_cols = set(NUM_COLS + CAT_COLS)
assert "resolved_in_minutes" not in used_cols

prod_ticket = pd.DataFrame([{
    "ticket_id": "T-PROD-1",
    "customer_id": "CUS-NEW",
    "wait_min": 42.0,
    "order_value_thb": None,
    "channel": "tiktok",
}])
prob = float(clean_pipe.predict_proba(prod_ticket)[0, 1])
print(f"Audit passed! Production ticket P(urgent) = {prob:.3f}")`,
        },
        output: `Audit passed! Production ticket P(urgent) = 0.871`,
      },
    ],
    gotcha:
      "จุดสังเกต: ดูตัวเลขที่เปลี่ยนจาก `1.000` ลงมาเป็น `0.789`! ถ้าคุณเอาโมเดล `1.000` ขึ้น Production จริง มันจะพังทันทีตั้งแต่วินาทีแรกเพราะคำขอใหม่ไม่มีคอลัมน์ `resolved_in_minutes` แต่โมเดล `0.789` ทำงานได้จริงและให้ตัวเลขที่ซื่อสัตย์สำหรับนำไปพัฒนาต่อ",
  },

  practice: {
    intro:
      "โจทย์ทบทวน (15 นาที): ใน `exercise_day44.py` มีโค้ดที่มีบั๊ก Data Leakage ซ่อนอยู่ ให้คุณเขียนฟังก์ชัน `clean_and_group_split`, `build_leak_free_pipeline` และ `train_and_audit` เพื่อแก้จุดรั่วทั้ง 3 จุดให้สะอาดหมดจดแล้วพิสูจน์ด้วย `test_day44.py`",
    requirements: [
      "`clean_and_group_split(df: pd.DataFrame, id_col: str = \"ticket_id\", group_col: str = \"customer_id\", target_col: str = \"is_urgent\", test_size: float = 0.25, random_state: int = 42) -> tuple[pd.DataFrame, pd.DataFrame]`: ตัดแถวซ้ำตาม `id_col` ก่อน (`keep=\"first\"`), ลบคอลัมน์ต้องห้ามที่มาจากอนาคต (`FORBIDDEN_COLS = {\"resolved_in_minutes\", \"final_agent_note\"}`) หากมีอยู่ในตาราง แล้วแบ่ง `(train_df, test_df)` ด้วย `GroupShuffleSplit` ตาม `group_col`",
      "`build_leak_free_pipeline(numeric_cols: list[str], categorical_cols: list[str]) -> Pipeline`: ตรวจสอบก่อนว่าไม่มีคอลัมน์ใดอยู่ใน `FORBIDDEN_COLS` (ถ้ามีให้ raise `ValueError`) แล้วคืน `Pipeline([(\"preprocess\", ColumnTransformer(..., remainder=\"drop\")), (\"clf\", LogisticRegression(max_iter=1000, random_state=42))])` ที่มี `SimpleImputer`, `StandardScaler` และ `OneHotEncoder(handle_unknown=\"ignore\")`",
      "`train_and_audit(df: pd.DataFrame, numeric_cols: list[str], categorical_cols: list[str]) -> dict`: เรียก `clean_and_group_split`, เทรนทั้ง `DummyClassifier(strategy=\"most_frequent\")` และ `build_leak_free_pipeline` บน `train_df` เท่านั้น แล้วคืน dict ที่มี `pipeline`, `train_rows`, `test_rows`, `customer_overlap`, `dummy_f1`, `clean_f1`",
      "ผ่านการตรวจทุกข้อใน `test_day44.py` รวมถึงการทดสอบยิงข้อมูล Production ดิบที่ไม่มี `resolved_in_minutes`, มีค่าว่าง และมีหมวดหมู่ใหม่",
    ],
    starter: {
      language: "python",
      filename: "exercise_day44.py",
      code: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

FORBIDDEN_COLS = {"resolved_in_minutes", "final_agent_note"}


def clean_and_group_split(
    df: pd.DataFrame,
    id_col: str = "ticket_id",
    group_col: str = "customer_id",
    target_col: str = "is_urgent",
    test_size: float = 0.25,
    random_state: int = 42,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """ตัดแถวซ้ำ ลบคอลัมน์จากอนาคต แล้วแบ่ง train/test ด้วย GroupShuffleSplit"""
    # TODO: drop_duplicates(subset=[id_col]) -> drop FORBIDDEN_COLS -> GroupShuffleSplit
    raise NotImplementedError


def build_leak_free_pipeline(
    numeric_cols: list[str],
    categorical_cols: list[str],
) -> Pipeline:
    """สร้าง Pipeline ที่ปลอดภัยจาก Data Leakage และปฏิเสธคอลัมน์ต้องห้าม"""
    # TODO: เช็ก FORBIDDEN_COLS (raise ValueError) แล้วประกอบ ColumnTransformer + LogisticRegression
    raise NotImplementedError


def train_and_audit(
    df: pd.DataFrame,
    numeric_cols: list[str],
    categorical_cols: list[str],
) -> dict:
    """เทรน Clean Pipeline และคืนผลตรวจสอบ (audit metrics) เทียบกับ Dummy"""
    # TODO: เรียก clean_and_group_split -> fit dummy & pipeline -> คืน audit dict
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day44.py",
      code: `import numpy as np
import pandas as pd
import pytest
from exercise_day44 import (
    build_leak_free_pipeline,
    clean_and_group_split,
    train_and_audit,
)


@pytest.fixture
def dirty_leaky_df() -> pd.DataFrame:
    rng = np.random.default_rng(123)
    n = 240
    wait = rng.normal(28, 12, n).clip(1)
    amount = rng.normal(1500, 600, n).clip(100)
    channel = rng.choice(["line", "email", "web"], size=n)
    tier = rng.choice(["standard", "vip"], size=n, p=[0.7, 0.3])
    logit = 0.09 * wait + 0.0012 * amount + (tier == "vip") * 1.8 + rng.normal(0, 0.8, n)
    y = (logit > 4.9).astype(int)
    resolved = np.where(y == 1, rng.uniform(2, 12, n), rng.uniform(50, 140, n))

    base = pd.DataFrame({
        "ticket_id": [f"T-{i:04d}" for i in range(n)],
        "customer_id": [f"CUS-{i % 48:02d}" for i in range(n)],
        "wait_min": wait,
        "order_value_thb": amount,
        "channel": channel,
        "customer_tier": tier,
        "resolved_in_minutes": resolved,
        "final_agent_note": ["urgent handled" if v else "normal" for v in y],
        "is_urgent": y,
    })
    base.loc[[2, 18, 40], "wait_min"] = np.nan
    base.loc[[7, 29], "channel"] = None
    # เพิ่มแถวซ้ำ 60 แถวเพื่อทดสอบ deduplication
    return pd.concat([base, base.iloc[:60]], ignore_index=True)


def test_clean_and_group_split_removes_dupes_and_leakage(dirty_leaky_df: pd.DataFrame):
    tr, te = clean_and_group_split(dirty_leaky_df)
    assert len(tr) + len(te) == 240  # ตัดแถวซ้ำ 60 แถวออกแล้ว
    assert set(tr["ticket_id"]).isdisjoint(te["ticket_id"])
    assert set(tr["customer_id"]).isdisjoint(te["customer_id"])
    assert "resolved_in_minutes" not in tr.columns
    assert "final_agent_note" not in te.columns


def test_pipeline_rejects_forbidden_feature():
    with pytest.raises(ValueError):
        build_leak_free_pipeline(["wait_min", "resolved_in_minutes"], ["channel"])


def test_train_and_audit_honest_and_prod_ready(dirty_leaky_df: pd.DataFrame):
    num_cols = ["wait_min", "order_value_thb"]
    cat_cols = ["channel", "customer_tier"]
    audit = train_and_audit(dirty_leaky_df, num_cols, cat_cols)

    assert audit["train_rows"] + audit["test_rows"] == 240
    assert audit["customer_overlap"] == 0
    assert audit["clean_f1"] > audit["dummy_f1"] + 0.4
    assert audit["clean_f1"] < 0.99  # คะแนนจริงที่ไม่ถูก target leakage หลอกเป็น 1.00

    # ทดสอบข้อมูล Production ดิบ (ไม่มีคอลัมน์อนาคต + มีค่าว่าง + หมวดหมู่ใหม่)
    raw_prod = pd.DataFrame([{
        "ticket_id": "T-PROD-9",
        "customer_id": "CUS-999",
        "wait_min": None,
        "order_value_thb": 3000.0,
        "channel": "instagram_dm",
        "customer_tier": "vip",
    }])
    probs = audit["pipeline"].predict_proba(raw_prod)
    assert probs.shape == (1, 2)
    assert 0.0 <= float(probs[0, 1]) <= 1.0
`,
    },
    selfCheck: [
      "`clean_and_group_split` ตัดแถวซ้ำตาม `ticket_id` จาก 300 แถวเหลือ 240 แถวก่อนแบ่ง และลบคอลัมน์ใน `FORBIDDEN_COLS` ออกหมด",
      "`customer_overlap == 0` ไม่มี `customer_id` ใดปรากฏทั้งฝั่ง `train` และ `test`",
      "`build_leak_free_pipeline` โยน `ValueError` ทันทีถ้ามีใครเผลอส่ง `resolved_in_minutes` เข้ามาในลิสต์ฟีเจอร์",
      "`clean_f1` ชนะ `dummy_f1` อย่างชัดเจนและสะท้อนความแม่นยำจริง (ไม่ใช่ 1.00 ปลอมจาก target leakage)",
      "`pipeline.predict_proba(raw_prod)` ทำงานได้แม้ข้อมูล Production จะไม่มีคอลัมน์อนาคต มีค่าว่าง และมีหมวดหมู่ใหม่อย่าง `\"instagram_dm\"`",
    ],
    acceptance: "ผ่านทั้ง 3 test functions ใน `test_day44.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `clean_and_group_split` ใช้ `df.drop_duplicates(subset=[id_col], keep=\"first\").drop(columns=list(FORBIDDEN_COLS), errors=\"ignore\").reset_index(drop=True)` ก่อนส่งเข้า `GroupShuffleSplit`",
      },
      {
        body: "ใน `build_leak_free_pipeline` ตรวจด้วย `bad = FORBIDDEN_COLS & (set(numeric_cols) | set(categorical_cols))` ถ้า `bad` ไม่ว่างให้ `raise ValueError(f\"Forbidden leakage columns: {sorted(bad)}\")`",
      },
      {
        body: "โครงของ `clean_and_group_split` และ `train_and_audit` เกือบครบ — เติมการคำนวณ `customer_overlap` และ `f1_score` แล้วรันเทสต์:",
        code: {
          language: "python",
          filename: "hint_day44.py",
          code: `def clean_and_group_split(
    df: pd.DataFrame,
    id_col: str = "ticket_id",
    group_col: str = "customer_id",
    target_col: str = "is_urgent",
    test_size: float = 0.25,
    random_state: int = 42,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    clean = (
        df.drop_duplicates(subset=[id_col], keep="first")
        .drop(columns=list(FORBIDDEN_COLS), errors="ignore")
        .reset_index(drop=True)
    )
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    tr_idx, te_idx = next(gss.split(clean, clean[target_col], groups=clean[group_col]))
    return clean.iloc[tr_idx].copy(), clean.iloc[te_idx].copy()


def train_and_audit(
    df: pd.DataFrame,
    numeric_cols: list[str],
    categorical_cols: list[str],
) -> dict:
    train_df, test_df = clean_and_group_split(df)
    dummy = DummyClassifier(strategy="most_frequent").fit(train_df, train_df["is_urgent"])
    pipe = build_leak_free_pipeline(numeric_cols, categorical_cols).fit(train_df, train_df["is_urgent"])
    # TODO: คำนวณ customer_overlap, dummy_f1, clean_f1 (ใส่ zero_division=0) แล้วคืน dict
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
      title: "แก้จุดรั่วแค่ 1 จุด (เช่น ย้าย StandardScaler เข้า Pipeline) แต่ลืมตรวจ Target Leakage และแถวซ้ำ",
      symptom: "โค้ดดูเหมือนสะอาดเพราะใช้ `Pipeline` แล้ว แต่คะแนนยังเป็น `0.99` ปลอมจากคอลัมน์ `resolved_in_minutes` หรือแถวซ้ำที่ไม่ได้ตัดออก",
      fix: "ตรวจครบทั้ง 3 ชั้นเสมอ: (1) Deduplicate + Drop future columns, (2) วิธี Split (Stratified / Time / Group), (3) Preprocessing ภายใน `Pipeline`",
    },
    {
      title: "ตัดแถวซ้ำ *หลังจาก* แบ่ง Train/Test ไปแล้ว",
      symptom: "แถวซ้ำ 1 สำเนาอยู่ฝั่ง Train และอีกสำเนาอยู่ฝั่ง Test ต่อให้สั่ง `drop_duplicates()` แยกในแต่ละฝั่ง ตัวซ้ำก็ยังคงอยู่ทั้งสองฝั่งเหมือนเดิม!",
      fix: "ตัดแถวซ้ำตาม `id_col` บนตารางตั้งต้น **ก่อน** แบ่ง Train/Test เสมอ",
    },
    {
      title: "เห็นคะแนนลดลงหลังแก้ Data Leakage แล้วเผลอใส่คอลัมน์จากอนาคตกลับเข้าไป",
      symptom: "โมเดลได้คะแนนสวยในรายงาน แต่ใช้งานจริงไม่ได้เพราะ Production ไม่มีฟีเจอร์นั้น",
      fix: "ยึดความซื่อสัตย์ของระบบวัดผลเป็นหลัก คะแนนจริงที่ต่ำกว่าแต่เชื่อถือได้คือจุดเริ่มต้นที่ถูกต้องสำหรับการปรับปรุงโมเดลต่อ",
    },
    {
      title: "ไม่เขียนเทสต์เช็ก `FORBIDDEN_COLS` และ `customer_overlap` ทิ้งไว้",
      symptom: "อีก 2 สัปดาห์เพื่อนร่วมทีมเพิ่มคอลัมน์ใหม่จากตาราง DB เข้ามาโดยไม่รู้ว่าเป็นข้อมูลหลังปิดงาน จนเกิด leakage กลับมาอีก",
      fix: "ผูก Leakage Guardrails ไว้ในชุด `pytest` เพื่อจับการนำคอลัมน์ต้องห้ามหรือการแบ่งกลุ่มผิดพลาดตั้งแต่วินาทีที่รันเทสต์",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d044-q1",
        "[ทบทวน D41] แพลตฟอร์มส่งอาหารมีออเดอร์ 150,000 รายการ/วัน ต้องการทำนายเวลาจัดส่งและโอกาสล่าช้าจากฟีเจอร์ตาราง 25 คอลัมน์ภายใน `<15ms` แนวทางใดเหมาะสมที่สุด?",
        [
          ["ส่ง JSON 25 คอลัมน์ให้ Frontier LLM ทำนายทุกออเดอร์", "ผิด — ทั้งช้าเกินงบ 15ms และแพงมหาศาลที่ 150k คำขอ/วัน"],
          ["ใช้ Classical ML (`scikit-learn` / LightGBM) บน CPU เพราะเป็นข้อมูลตาราง ปริมาณสูง และต้องการ sub-15ms latency", "ถูก — ข้อมูลตารางปริมาณสูงและ latency ตึงคือจุดแข็งที่สุดของ Classical ML"],
          ["เขียน `if/else` เดาจากจังหวัดอย่างเดียว", "ฟีเจอร์ 25 คอลัมน์มีความสัมพันธ์ซับซ้อนเกินกว่ากฎ `if/else` ง่าย ๆ"],
          ["ใช้ Hybrid Routing ส่งให้ LLM ก่อนแล้วค่อยส่งให้ ML", "ผิดทั้งลำดับและไม่จำเป็นต้องใช้ LLM กับงานตารางล้วน"],
        ],
        "B",
        "โจทย์ข้อมูลตารางที่มีปริมาณสูงและต้องการความเร็วระดับมิลลิวินาทีควรใช้ Classical ML เสมอ เพื่อคุมทั้งต้นทุน Latency และความเสถียร",
        "ทำไมโจทย์ตาราง 150k req/day ที่ต้องการ <15ms จึงควรใช้ Classical ML แทน LLM?",
        "เพราะ Classical ML บน CPU ทำนายได้ใน 1–5ms ด้วยต้นทุนคงที่ต่ำมาก แม่นยำบนข้อมูลตาราง และไม่มีปัญหา latency/token cost แบบ LLM API",
      ),
      mc(
        "d044-q2",
        "[ทบทวน D42] คุณรันโมเดลทำนายความเร่งด่วนทิกเก็ตครั้งแรกแล้วได้ F1 = `0.995` เมื่อเปิดดูน้ำหนักฟีเจอร์ (`coef_`) พบว่า `resolved_in_minutes` มีน้ำหนักสูงโด่งกว่าทุกคอลัมน์ สิ่งแรกที่ควรทำคืออะไร?",
        [
          ["รีบนำโมเดลขึ้น Production ทันทีเพราะคะแนนสูงมาก", "อันตราย — คะแนน 0.995 นี้มาจากข้อมูลอนาคตที่ไม่มีอยู่จริงตอนลูกค้าเปิดทิกเก็ต"],
          ["ตัด `resolved_in_minutes` ออกจากชุดฟีเจอร์ทันที เพราะเป็น Target/Future Leakage แล้วเทรนและวัดคะแนนจริงใหม่", "ถูก — ค่านี้เกิดขึ้นหลังจากปิดงานแล้ว ไม่สามารถใช้ทำนายตอนเปิดทิกเก็ตได้"],
          ["คูณค่า `resolved_in_minutes` ด้วย 0.5 เพื่อให้คะแนนลดลงดูสมจริงขึ้น", "ผิด — การปรับสเกลไม่ได้แก้ปัญหา leakage และใน Production ก็ยังไม่มีคอลัมน์นี้อยู่ดี"],
          ["เปลี่ยนจาก LogisticRegression เป็น LightGBM แทนโดยเก็บคอลัมน์เดิมไว้", "เปลี่ยนโมเดลไม่ได้แก้ปัญหา data leakage"],
        ],
        "B",
        "เมื่อเห็นคะแนนสูงผิดปกติ (`~0.99`) ให้ตรวจ feature importance / `coef_` ทันที หากพบคอลัมน์ที่รู้หลังจากเกิดผลลัพธ์ ต้องตัดทิ้งและประเมินใหม่ทั้งหมด",
        "เมื่อพบว่าโมเดลได้คะแนน 0.99+ โดยพึ่งพาคอลัมน์ที่เกิดหลังเหตุการณ์ ควรทำอย่างไร?",
        "ตัดคอลัมน์นั้นทิ้งทันที (แก้ Target/Future Leakage) เพิ่มเข้าในรายการ `FORBIDDEN_COLS` ของชุดเทสต์ แล้ววัดผลบนชุดข้อมูลที่สะอาดใหม่",
      ),
      mc(
        "d044-q3",
        "[ทบทวน D43] ในการรีแฟกเตอร์สคริปต์ที่รั่วเข้าสู่ `sklearn.pipeline.Pipeline` ข้อใดตั้งค่า `ColumnTransformer` ได้ปลอดภัยที่สุดสำหรับ Production?",
        [
          ["ใช้ `OneHotEncoder()` ค่าเริ่มต้น (ไม่ระบุ `handle_unknown`) และตั้ง `remainder=\"passthrough\"`", "ผิด — จะ crash เมื่อเจอหมวดหมู่ใหม่ และปล่อยคอลัมน์ ID หลุดเข้าโมเดล"],
          ["แยกสายพานตัวเลข (`SimpleImputer(median)` + `StandardScaler`) และสายพานหมวดหมู่ (`SimpleImputer(most_frequent)` + `OneHotEncoder(handle_unknown=\"ignore\")`) พร้อม `remainder=\"drop\"`", "ถูก — ทนต่อค่าว่าง หมวดหมู่ใหม่ ตัดคอลัมน์ส่วนเกินทิ้ง และไม่เกิด leakage"],
          ["ทำ `StandardScaler().fit_transform(X_all)` ก่อนแล้วค่อยส่งเข้า `Pipeline`", "ผิด — การสเกลก่อนแบ่งทำให้เกิด Preprocessing Leakage"],
          ["ใช้ `pd.get_dummies(df)` นอก Pipeline แล้วส่งเฉพาะ `LogisticRegression` เข้า Pipeline", "ผิด — เสี่ยงคอลัมน์ไม่ตรงกันใน Production และเกิด leakage"],
        ],
        "B",
        "การรวม `Imputer`, `Scaler` และ `OneHotEncoder(handle_unknown=\"ignore\")` ไว้ใน `ColumnTransformer(remainder=\"drop\")` ภายใน `Pipeline` คือโครงสร้างมาตรฐานที่ป้องกันได้ทั้ง leakage และ runtime crash",
        "4 องค์ประกอบสำคัญของ `ColumnTransformer` ที่ปลอดภัยใน Production คืออะไร?",
        "1) `SimpleImputer` ทั้งสายพานตัวเลขและหมวดหมู่, 2) `StandardScaler` ในสายพานตัวเลข, 3) `OneHotEncoder(handle_unknown=\"ignore\")` ในสายพานหมวดหมู่, 4) `remainder=\"drop\"`",
      ),
      mc(
        "d044-q4",
        "[ทบทวน D34 + D42] หากตารางทิกเก็ตมีแถวซ้ำจากระบบ log retry (30% ของข้อมูล) และคุณสั่ง `drop_duplicates()` แยกทำ *หลังจาก* เรียก `train_test_split()` ไปแล้ว จะเกิดปัญหาใด?",
        [
          ["ไม่มีปัญหา เพราะทั้ง Train และ Test ไม่มีแถวซ้ำภายในตัวเองแล้ว", "ผิด — แถวเดิมยังคงมีสำเนาอยู่ทั้งฝั่ง Train และฝั่ง Test พร้อมกัน!"],
          ["เกิด Duplicate Leakage เพราะสำเนาของทิกเก็ตใบเดียวกันหลุดไปอยู่ทั้งฝั่ง Train และ Test ทำให้โมเดลได้สอบข้อสอบที่เคยเห็นแล้ว", "ถูก — ต้องตัดแถวซ้ำด้วย `drop_duplicates(subset=[id_col])` ก่อนแบ่งข้อมูลเสมอ"],
          ["`scikit-learn` จะโยน `DuplicateError` ทันทีตอน `.fit()`", "ไม่จริง — `scikit-learn` ไม่รู้ว่าแถวไหนซ้ำข้ามฝั่ง มันจะเทรนต่อไปเงียบ ๆ"],
          ["จำนวนคอลัมน์ของ Test จะไม่เท่ากับ Train", "ไม่เกี่ยวกัน — `drop_duplicates` ลบแถว ไม่ได้ลบคอลัมน์"],
        ],
        "B",
        "การตัดแถวซ้ำ (D34) ต้องทำก่อนการแบ่งข้อมูล (D42) เสมอ เพื่อรับประกันว่าไม่มีทิกเก็ตใบใดปรากฏซ้ำข้ามฝั่ง Train และ Test",
        "ทำไมต้องเรียก `drop_duplicates(subset=[id_col])` ก่อนแบ่ง Train/Test เสมอ?",
        "เพื่อป้องกัน Duplicate Leakage ที่สำเนาของแถวเดียวกันหลุดไปอยู่ทั้ง Train และ Test (ถ้าตัดทีหลังจะลบแค่ตัวซ้ำในฝั่งเดียวกัน แต่ยังซ้ำข้ามฝั่งอยู่ดี)",
      ),
    ],
  },

  takeaways: [
    "ลำดับทองที่ห้ามสลับในงาน Classical ML: **Deduplicate (D34) → Drop Future Columns → Split อย่างถูกวิธี (D42) → Fit `Pipeline` เฉพาะ Train (D43)**",
    "คะแนน `0.99` ที่สวยผิดปกติในข้อมูลธุรกิจจริงคือสัญญาณเตือนภัยอันดับหนึ่งของ **{{data-leakage}}** — ตรวจคอลัมน์จากอนาคต, แถวซ้ำ, ลูกค้าข้ามฝั่ง และ preprocessing นอก Pipeline เสมอ",
    "การที่คะแนนลดลงหลังแก้ Data Leakage คือความสำเร็จทางวิศวกรรม เพราะคุณได้ตัวเลขจริงที่สะท้อนประสิทธิภาพใน Production",
    "เขียนเกราะป้องกันไว้ใน {{pytest}} (`FORBIDDEN_COLS`, `customer_overlap == 0`, raw unseen data smoke test) เพื่อไม่ให้บั๊กรั่วกลับมาอีกในอนาคต",
  ],

  reviewCards: [
    rc(
      "d044-rc-1",
      "สรุป Leakage Audit Checklist 4 ข้อที่ต้องเช็กก่อนเชื่อคะแนนโมเดล Classical ML?",
      "1) ตัดแถวซ้ำตาม ID ก่อน split แล้วหรือยัง? 2) มีคอลัมน์จากอนาคต (Target Leakage) ปนอยู่หรือไม่? 3) แบ่งข้อมูลตรงธรรมชาติงาน (Stratified / Time / Group) หรือไม่? 4) ตัวแปลงทุกตัว (`Imputer`, `Scaler`, `Encoder`, `TF-IDF`) อยู่ใน `Pipeline` ที่ fit เฉพาะ train แล้วหรือยัง?",
    ),
    rc(
      "d044-rc-2",
      "ทำไมคะแนนโมเดลที่ลดลงจาก 0.99 เหลือ 0.80 หลังแก้บั๊ก Data Leakage ถึงเป็นเรื่องดี?",
      "เพราะ 0.99 คือคะแนนปลอมจากการแอบเห็นข้อมูลอนาคตหรือแถวซ้ำซึ่งใช้จริงใน Production ไม่ได้ ส่วน 0.80 คือคะแนนความสามารถจริงที่ใช้วัดผลการปรับปรุงโมเดลต่อไปได้อย่างซื่อสัตย์",
    ),
    rc(
      "d044-rc-3",
      "เราจะเขียน `pytest` Guardrail อะไรได้บ้างเพื่อกัน Data Leakage กลับมาในโปรเจกต์?",
      "1) Assert ปฏิเสธ `FORBIDDEN_COLS` ในฟังก์ชันสร้าง Pipeline, 2) Assert `set(train[group]).isdisjoint(test[group])` และ `id` ไม่ซ้ำข้ามฝั่ง, 3) ส่ง DataFrame ดิบ (ไม่มีคอลัมน์อนาคต + มี null + หมวดหมู่ใหม่) เข้า `pipeline.predict_proba()` แล้วต้องผ่านโดยไม่ error",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Common Pitfalls: Data Leakage", href: "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage" },
    { label: "scikit-learn User Guide — Pipelines & ColumnTransformer", href: "https://scikit-learn.org/stable/modules/compose.html" },
    { label: "scikit-learn API Reference — GroupShuffleSplit", href: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupShuffleSplit.html" },
    { label: "Google Developers — Rules of Machine Learning (Data & Evaluation Hygiene)", href: "https://developers.google.com/machine-learning/guides/rules-of-ml" },
  ],

  glossary: [
    "data-leakage",
    "sklearn-pipeline",
    "llm",
    "lightgbm",
    "precision-recall",
    "expected-value",
    "reproducibility",
    "pytest",
  ],
});
