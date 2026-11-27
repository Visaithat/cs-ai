import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D043 — Phase 2 / Block B11
 * Baseline Classifier with scikit-learn (Pipeline, ColumnTransformer)
 */
export const d043: Lesson = defineLesson({
  day: 43,
  titleTh: "สร้าง Baseline Classifier ด้วย scikit-learn (Pipeline & ColumnTransformer)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% (CPU / ไม่ต้องใช้ API key) · รวม Imputer, Scaler, OneHotEncoder และโมเดลเป็น Pipeline ชิ้นเดียวไร้ Leakage",
  icon: "workflow",
  visual: {
    id: "sklearn-pipeline",
    title: "scikit-learn Pipeline + ColumnTransformer — รวม Preprocess & Model เป็นชิ้นเดียว",
    caption: "ดูการแยกคอลัมน์ตัวเลข (Impute+Scale) และหมวดหมู่ (OneHot) ก่อนส่งเข้า Classifier โดยไม่เกิด Leakage",
    alt: "แผนภาพ scikit-learn Pipeline และ ColumnTransformer",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "pandas", "uv", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รับตารางข้อมูลผสมที่มีทั้งตัวเลข ข้อความหมวดหมู่ และค่าว่าง",
      body: "ตารางข้อมูลจริงไม่เคยสะอาดเป็นเมทริกซ์ตัวเลขล้วน แต่ปนทั้งคอลัมน์ตัวเลข (`order_value_thb`, `wait_min` ที่มี `NaN`) และคอลัมน์หมวดหมู่ (`channel`, `customer_tier` ที่อาจมีค่าใหม่โผล่มาในอนาคต)",
      lessonNote: "ใช้ `ColumnTransformer` แยกสายพานแปลงคอลัมน์ตัวเลข (`SimpleImputer` + `StandardScaler`) และหมวดหมู่ (`SimpleImputer` + `OneHotEncoder`) อย่างเป็นระบบ",
    },
    {
      node: 2,
      heading: "ตั้งเกณฑ์ขั้นต่ำด้วย Baseline ก่อนขยับไปโมเดลซับซ้อน",
      body: "ก่อนจะลอง LightGBM หรือ Neural Net วิศวกร ML จะสร้าง **Dummy Baseline** (`DummyClassifier`) เพื่อดูคะแนนขั้นต่ำ และ **Linear Baseline** (`LogisticRegression`) ที่เร็ว ตีความได้ และตรวจบั๊กในข้อมูลได้ทันที",
      lessonNote: "ห่อทุกอย่างไว้ใน {{sklearn-pipeline}} ชิ้นเดียวเพื่อให้ `.fit(X_train, y_train)` เรียนรู้สถิติจาก Train เท่านั้น",
    },
    {
      node: 3,
      heading: "วัดผลเทียบกับ Dummy Baseline เพื่อยืนยันว่าโมเดลเรียนรู้จริง",
      body: "ถ้าชุดข้อมูลมี `urgent` แค่ 10% โมเดลที่ทาย `0` ตลอดยังได้ Accuracy 90% — การเทียบกับ `DummyClassifier` ทำให้เห็นทันทีว่าโมเดลใหม่สร้างคุณค่าเพิ่มขึ้นจริงหรือไม่",
      lessonNote: "วันนี้เราเทียบ Baseline พร้อมกัน และวันพรุ่งนี้หลังรอบทบทวน (Block B12) จะเจาะลึก {{precision-recall}} และ F1",
    },
    {
      node: 4,
      heading: "เรียกใช้งานจริงด้วยอินเทอร์เฟซเดียว `.predict(raw_df)` ไม่พังเมื่อเจอค่าใหม่",
      body: "เมื่อรวม Preprocessing กับ Model ไว้ใน `Pipeline` เดียว แอป API แค่ส่งตารางดิบเข้าไปโดยไม่ต้องเขียนโค้ดแปลงข้อมูลซ้ำสองรอบ (ลด Training-Serving Skew)",
      lessonNote: "การตั้ง `OneHotEncoder(handle_unknown=\"ignore\")` ช่วยให้ระบบไม่ crash แม้ใน Production จะมีช่องทางใหม่เช่น `\"tiktok\"` ที่ไม่เคยเห็นตอนเทรน",
    },
  ],

  objectives: [
    "**อธิบายเหตุผลและสร้าง** Baseline 2 ระดับ (`DummyClassifier` และ `LogisticRegression`) เพื่อตั้งเกณฑ์อ้างอิงที่ซื่อสัตย์ก่อนพัฒนาโมเดลที่ซับซ้อนขึ้น",
    "**ประกอบ `ColumnTransformer`** แยกสายพานสำหรับคอลัมน์ตัวเลข (`SimpleImputer` + `StandardScaler`) และคอลัมน์หมวดหมู่ (`SimpleImputer` + `OneHotEncoder(handle_unknown=\"ignore\")`)",
    "**รวม `ColumnTransformer` และ Classifier เข้าใน {{sklearn-pipeline}}** ที่ทนต่อค่าว่าง (`NaN`) และหมวดหมู่ไม่เคยเห็นในชุด Test โดยไม่เกิด {{data-leakage}}",
  ],

  prerequisites: [
    "ผ่าน Day 42 เข้าใจ Train/Val/Test split และการป้องกัน {{data-leakage}}",
    "คุ้นเคย `pandas.DataFrame` และคอลัมน์ตัวเลข vs หมวดหมู่",
    "ติดตั้ง `scikit-learn`, `pandas`, `pytest`, `ruff` ด้วย `uv` แล้ว",
    "รันบนเครื่องได้ 100% (CPU) ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์สำหรับ Day 43 ด้วย {{uv}} และติดตั้ง `scikit-learn` กับ `pandas` พร้อมเครื่องมือทดสอบ",
    commands: `uv init ai-day43 && cd ai-day43
uv add scikit-learn pandas
uv add --dev pytest ruff
uv run python -c "from sklearn.pipeline import Pipeline; from sklearn.compose import ColumnTransformer; print('Ready!')"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day43` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `scikit-learn`, `pandas`, `pytest`, `ruff` ผ่าน `uv add`"],
      ["verify", "อิมพอร์ต `Pipeline` และ `ColumnTransformer` สำเร็จ"],
    ],
    note: "โค้ด `Pipeline` ที่คุณสร้างวันนี้จะเป็นโครงแม่แบบที่นำไปเสียบกับ `LightGBM` (Day 47) และบันทึกเป็นไฟล์โมเดล (`joblib` / ONNX) ใน Day 53",
  },

  concepts: [
    {
      id: "always-build-baseline-first",
      title: "1 · สร้าง Baseline ก่อนเสมอ: DummyClassifier + LogisticRegression",
      paragraphs: [
        "กฎข้อสำคัญในคู่มือ ML ของ Google คือ **'อย่าเริ่มจากโมเดลที่ซับซ้อนที่สุด แต่ให้สร้าง Simple Baseline ที่รันจบทั้งท่อก่อน'** เพราะ Baseline ช่วยตรวจสอบได้ทันทีว่าท่อข้อมูลไม่พัง ป้ายกำกับไม่สลับ และมีเกณฑ์คะแนนขั้นต่ำไว้เปรียบเทียบ",
        "Baseline มี 2 ชั้นที่ควรมีในทุกโปรเจกต์: ชั้นแรกคือ **`DummyClassifier(strategy=\"most_frequent\")`** (หรือ `\"stratified\"`) ที่ไม่ได้เรียนรู้ฟีเจอร์เลย — หากข้อมูลมี `not_urgent` 90% ตัว Dummy จะได้ Accuracy 0.90 ทันที ทำให้คุณไม่หลงดีใจถ้าโมเดลแรกของคุณได้ 0.89!",
        "ชั้นที่สองคือ **`LogisticRegression`** ซึ่งเป็นโมเดลเชิงเส้นที่เทรนเสร็จในเสี้ยววินาที ให้ความน่าจะเป็น (`predict_proba`) ที่ค่อนข้างเสถียร และเปิดดูค่าน้ำหนัก (`coef_`) เพื่อตรวจสอบว่าโมเดลกำลังพึ่งพาฟีเจอร์ที่สมเหตุสมผลหรือไม่",
      ],
      analogy:
        "เหมือนการวิ่งจับเวลา: `DummyClassifier` คือการเดินเฉย ๆ ให้รู้เวลาพื้นฐาน ส่วน `LogisticRegression` คือการวิ่งรองเท้าผ้าใบธรรมดา — ก่อนจะลงทุนซื้อรองเท้าคาร์บอนราคาแพง (โมเดลซับซ้อน) คุณต้องมีเวลาอ้างอิงก่อนว่าเร็วขึ้นจริงกี่วินาที",
      bullets: [
        "`DummyClassifier` ตั้งเส้นพื้น (sanity floor) ป้องกันการหลงเชื่อ Accuracy บนข้อมูลไม่สมดุล",
        "`LogisticRegression(max_iter=1000, class_weight=\"balanced\")` เป็นตัวเริ่มต้นที่ดีสำหรับงานจัดหมวดหมู่ตารางและข้อความ (TF-IDF)",
        "หาก `LogisticRegression` ได้คะแนนสูงถึง 0.99 ทันที ให้เช็ก `coef_` เพื่อล่าบั๊ก {{data-leakage}} ก่อนดีใจ!",
      ],
      whyTitle: "Why this matters — 70% ของมูลค่าทางธุรกิจมักมาจากท่อข้อมูลสะอาด + Baseline ที่ดี",
      whyParagraphs: [
        "ในงานจริง การแก้คุณภาพข้อมูลและฟีเจอร์มักเพิ่มคะแนนได้มากกว่าการเปลี่ยนอัลกอริทึมหลายเท่า การมี Baseline ที่รันซ้ำได้ใน 1 วินาทีช่วยให้คุณทดสอบสมมติฐานเรื่องฟีเจอร์ได้เร็วกว่ามาก",
        "นอกจากนี้ Baseline ยังใช้ยืนยันว่าการอัปเกรดไปใช้ LightGBM หรือ LLM ในภายหลังคุ้มค่ากับต้นทุนและ latency ที่เพิ่มขึ้นจริง",
      ],
    },
    {
      id: "column-transformer-architecture",
      title: "2 · `ColumnTransformer`: แยกสายพานจัดการคอลัมน์ตัวเลขและหมวดหมู่",
      paragraphs: [
        "โมเดลอย่าง `LogisticRegression` รับได้เฉพาะเมทริกซ์ตัวเลขที่ไม่มีค่าว่าง (`NaN`) เท่านั้น แต่ตารางธุรกิจจริงมีทั้งคอลัมน์ตัวเลข (เช่น `wait_min`, `order_value_thb` ที่บางช่องเป็น `NaN` และหน่วยต่างกันมากตั้งแต่ `5` ถึง `50,000`) และคอลัมน์หมวดหมู่ข้อความ (เช่น `channel = \"line\"`, `customer_tier = \"vip\"`)",
        "**`ColumnTransformer`** ช่วยให้เรากำหนดสายพานย่อยแยกตามชนิดคอลัมน์อย่างสะอาดในที่เดียว: สายพานตัวเลขเติมค่าว่างด้วย **`SimpleImputer(strategy=\"median\")`** (ทนต่อค่าผิดปกติหรือ outlier ดีกว่าค่าเฉลี่ย) แล้วปรับสเกลด้วย **`StandardScaler()`** ส่วนสายพานหมวดหมู่เติมค่าว่างด้วย **`SimpleImputer(strategy=\"most_frequent\")`** แล้วแปลงเป็นตัวเลข 0/1 ด้วย **`OneHotEncoder(handle_unknown=\"ignore\")`**",
        "พารามิเตอร์สองตัวที่ช่วยชีวิตใน Production คือ **`handle_unknown=\"ignore\"`** (หากวันหน้ามีหมวดหมู่ใหม่อย่าง `channel=\"tiktok\"` ที่ไม่เคยอยู่ในชุด Train ระบบจะให้ค่าเป็น 0 ทั้งหมดแทนที่จะพังด้วย `ValueError`) และ **`remainder=\"drop\"`** (ตัดคอลัมน์อื่นที่ไม่ได้ระบุอย่าง `ticket_id` ทิ้งอัตโนมัติ)",
      ],
      analogy:
        "เหมือนเครื่องคัดแยกขยะอัตโนมัติ 2 ราง: รางขวดแก้วไปล้างและชั่งน้ำหนัก (Numeric: Impute + Scale) รางกระดาษไปอัดแท่งติดรหัส (Categorical: Impute + OneHot) แล้วค่อยรวมผลลัพธ์ส่งต่อให้โรงงานปลายทาง",
      code: {
        language: "python",
        filename: "column_transformer_demo.py",
        code: `from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUMERIC_COLS = ["wait_min", "order_value_thb", "past_tickets"]
CATEGORICAL_COLS = ["channel", "customer_tier"]

numeric_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

categorical_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore")),
])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_pipe, NUMERIC_COLS),
        ("cat", categorical_pipe, CATEGORICAL_COLS),
    ],
    remainder="drop",
)`,
        caption: "แยกสายพานตัวเลขและหมวดหมู่อย่างชัดเจนพร้อม `handle_unknown=\"ignore\"` และ `remainder=\"drop\"`",
      },
      whyTitle: "Why this matters — ป้องกัน Production Crash จากค่าว่างและหมวดหมู่ใหม่",
      whyParagraphs: [
        "ความพังที่พบบ่อยที่สุดวันแรกที่นำโมเดลขึ้น API คือข้อมูลลูกค้าใหม่มี `null` ในคอลัมน์ที่ชุดเทรนไม่เคยมีค่าว่าง หรือฝ่ายการตลาดเพิ่งเปิดช่องทางขายใหม่จน `OneHotEncoder` เจอค่าไม่รู้จัก",
        "การใส่ `SimpleImputer` และ `handle_unknown=\"ignore\"` ไว้ใน `ColumnTransformer` ตั้งแต่วันแรกคือการป้องกันเชิงโครงสร้าง (defensive engineering)",
      ],
    },
    {
      id: "sklearn-pipeline-glue",
      title: "3 · `Pipeline`: มัด Preprocessing + Model เป็นอ็อบเจกต์เดียวไร้ Data Leakage",
      paragraphs: [
        "เมื่อเรานำ `preprocessor` (`ColumnTransformer`) มาต่อกับตัวโมเดล (`LogisticRegression`) ภายใน **`{{sklearn-pipeline}}`** เราจะได้อ็อบเจกต์เดียวที่รองรับ `.fit(X_train, y_train)`, `.predict(X_test)` และ `.predict_proba(X_test)` โดยอัตโนมัติ",
        "ข้อดีใหญ่ 3 ข้อของ `Pipeline` คือ: **(1) กัน {{data-leakage}} โดยโครงสร้าง** — เมื่อเรียก `pipe.fit(X_train, y_train)` ทุก `Imputer`, `Scaler` และ `OneHotEncoder` จะเรียนรู้สถิติจาก `X_train` เท่านั้น และเมื่อเรียก `pipe.predict(X_test)` จะเรียก `.transform()` ด้วยสถิติเดิมของ Train อัตโนมัติ",
        "**(2) ขจัด Training-Serving Skew** — โค้ดแปลงข้อมูลตอนเทรนกับตอนใช้งานจริงใน FastAPI (Phase 5) เป็นชิ้นเดียวกันเป๊ะ ไม่มีทางลืมสเกลหรือสลับลำดับคอลัมน์ และ **(3) พร้อมสำหรับการทำ {{serialization}}** (`joblib.dump(pipe, \"model.joblib\")`) และการทำ Cross-Validation ในอนาคตโดยไม่ต้องเขียนลูปแปลงข้อมูลเอง",
      ],
      analogy:
        "เหมือนเครื่องชงกาแฟแคปซูลแบบครบวงจร: คุณใส่เมล็ด/ข้อมูลดิบที่ปลายด้านหนึ่ง เครื่องบด ตวง ชง (Preprocess) และรินน้ำกาแฟ (Predict) ด้วยสูตรเดียวกันเป๊ะทุกแก้ว ไม่มีทางลืมขั้นตอนกลางทาง",
      bullets: [
        "เรียก `pipe.fit(X_train, y_train)` → ทำ `fit_transform` ทุกขั้นกลาง และ `fit` ขั้นสุดท้าย",
        "เรียก `pipe.predict(X_test)` / `pipe.predict_proba(X_test)` → ทำ `transform` ทุกขั้นกลาง และ `predict` ขั้นสุดท้าย",
        "เข้าถึงขั้นตอนข้างในได้ผ่านชื่อ step เช่น `pipe.named_steps[\"clf\"].coef_`",
      ],
      whyTitle: "Why this matters — มาตรฐานอุตสาหกรรมสำหรับการ Deploy โมเดล scikit-learn",
      whyParagraphs: [
        "หากคุณบันทึกเฉพาะไฟล์โมเดล `LogisticRegression` แต่แยกไฟล์ `scaler` กับ `encoder` ไว้คนละที่ โอกาสโหลดผิดเวอร์ชันหรือแปลงคอลัมน์สลับกันใน Production สูงมาก",
        "การบันทึกทั้ง `Pipeline` เป็นอ็อบเจกต์เดียวทำให้ระบบ inference ใน Phase 2 Mini-Project (Day 55–58) เรียบง่าย ทดสอบได้ และเชื่อถือได้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Pipeline + ColumnTransformer กับ Middleware Chain",
      body: [
        "หากคุณเคยเขียน Express / FastAPI middleware หรือท่อแปลงข้อมูลก่อนถึง controller คุณจะเห็นภาพ `Pipeline` และ `ColumnTransformer` ได้ทันที:",
      ],
      table: [
        ["ColumnTransformer", "Field-level parser/coercer แยกตามชนิดฟิลด์ (number vs enum)"],
        ["SimpleImputer", "Default fallback value เมื่อฟิลด์ใน payload เป็น null/undefined"],
        ["OneHotEncoder(handle_unknown='ignore')", "Safe enum mapping ที่ไม่ throw 500 เมื่อเจอค่า enum ใหม่"],
        ["Pipeline([('prep', ct), ('clf', lr)])", "Middleware chain → Handler ที่ห่อเป็นฟังก์ชันเดียวเรียกใช้ง่าย"],
      ],
    },
    student: {
      title: "First-Year Note — One-Hot Encoding และ StandardScaler ทำงานอย่างไร",
      body: [
        "**One-Hot Encoding** แปลงคอลัมน์ข้อความที่มีหมวดหมู่จำกัด เช่น `channel` (`line`, `email`, `web`) เป็นคอลัมน์เลข `0/1` สามช่อง (`is_line`, `is_email`, `is_web`) เพราะเราไม่ควรแทนด้วยเลข `1, 2, 3` ตรง ๆ (ไม่อย่างนั้นโมเดลจะเข้าใจผิดว่า `web > email > line`)",
        "**StandardScaler** แปลงคอลัมน์ตัวเลขให้มีค่าเฉลี่ย 0 และส่วนเบี่ยงเบนมาตรฐาน 1 ด้วยสูตร $z = (x - \\mu) / \\sigma$ เพื่อไม่ให้คอลัมน์ที่เลขใหญ่ (เช่น `order_value_thb = 15,000`) กลบคอลัมน์ที่เลขเล็ก (เช่น `past_tickets = 2`) เวลาคำนวณน้ำหนักใน `LogisticRegression`",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง Baseline Classifier สำหรับจัดระดับความเร่งด่วนของทิกเก็ตลูกค้า (`is_urgent`: 0 หรือ 1) จากข้อมูลตารางที่มีทั้งค่าว่าง (`NaN`) และช่องทางใหม่ (`\"tiktok\"`) ที่โผล่มาเฉพาะตอนทดสอบ",
    steps: [
      {
        title: "1 · เตรียมชุดข้อมูลจำลองและแบ่ง Stratified Train / Test",
        explain:
          "สร้างข้อมูลทิกเก็ตที่มีทั้งตัวเลข (`wait_min`, `order_value_thb`, `past_tickets`) และหมวดหมู่ (`channel`, `customer_tier`) โดยจงใจใส่ค่าว่าง `None`/`np.nan` เพื่อทดสอบความทนทานของ `Pipeline`",
        code: {
          language: "python",
          filename: "worked_pipeline.py",
          code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(42)
n = 200
wait_min = rng.normal(30, 15, n).clip(2)
order_val = rng.normal(1500, 700, n).clip(100)
past_tickets = rng.integers(0, 8, n)
channels = rng.choice(["line", "email", "web"], size=n, p=[0.5, 0.3, 0.2])
tiers = rng.choice(["standard", "vip"], size=n, p=[0.75, 0.25])

# สร้างสัญญาณจริง: รอนาน + VIP + ยอดซื้อสูง มีโอกาส urgent สูง
score = 0.06 * wait_min + 0.001 * order_val + (tiers == "vip") * 1.5 + rng.normal(0, 0.8, n)
is_urgent = (score > 4.6).astype(int)

df = pd.DataFrame({
    "ticket_id": [f"T-{i:04d}" for i in range(n)],
    "wait_min": wait_min,
    "order_value_thb": order_val,
    "past_tickets": past_tickets.astype(float),
    "channel": channels,
    "customer_tier": tiers,
    "is_urgent": is_urgent,
})
df.loc[[3, 17, 45], "wait_min"] = np.nan
df.loc[[10, 52], "channel"] = None

X = df.drop(columns=["is_urgent"])
y = df["is_urgent"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42
)
print(f"Train: {len(X_train)} rows | Test: {len(X_test)} rows | Urgent rate: {y_train.mean():.2f}")`,
        },
        output: `Train: 150 rows | Test: 50 rows | Urgent rate: 0.25`,
      },
      {
        title: "2 · ประกอบ ColumnTransformer + Pipeline และเทียบ Dummy vs LogisticRegression",
        explain:
          "รัน `DummyClassifier` เพื่อตั้งเกณฑ์พื้น แล้วเทรน `Pipeline` ที่มี `ColumnTransformer` + `LogisticRegression` บนชุด Train เดียวกัน",
        code: {
          language: "python",
          filename: "worked_pipeline.py",
          code: `from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUM_COLS = ["wait_min", "order_value_thb", "past_tickets"]
CAT_COLS = ["channel", "customer_tier"]

dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
dummy_pred = dummy.predict(X_test)

preprocessor = ColumnTransformer(
    transformers=[
        ("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]), NUM_COLS),
        ("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]), CAT_COLS),
    ],
    remainder="drop",  # ทิ้ง ticket_id อัตโนมัติ
)

baseline_pipe = Pipeline([
    ("preprocess", preprocessor),
    ("clf", LogisticRegression(max_iter=1000, random_state=42)),
])
baseline_pipe.fit(X_train, y_train)
lr_pred = baseline_pipe.predict(X_test)

print(f"Dummy  -> acc={accuracy_score(y_test, dummy_pred):.3f}, f1={f1_score(y_test, dummy_pred):.3f}")
print(f"LogReg -> acc={accuracy_score(y_test, lr_pred):.3f}, f1={f1_score(y_test, lr_pred):.3f}")`,
        },
        output: `Dummy  -> acc=0.740, f1=0.000
LogReg -> acc=0.900, f1=0.783`,
      },
      {
        title: "3 · ทดสอบกับข้อมูล Production ที่เจอค่าว่างและหมวดหมู่ใหม่ (`tiktok`)",
        explain:
          "ส่งแถวข้อมูลดิบที่มีทั้ง `wait_min=None` และ `channel=\"tiktok\"` (ไม่เคยเห็นในชุด Train) เข้า `baseline_pipe.predict_proba(...)` โดยตรง — ระบบต้องไม่ crash และคืนความน่าจะเป็นครบ",
        code: {
          language: "python",
          filename: "worked_pipeline.py",
          code: `new_tickets = pd.DataFrame([
    {
        "ticket_id": "T-9999",
        "wait_min": None,
        "order_value_thb": 3200.0,
        "past_tickets": 4.0,
        "channel": "tiktok",  # หมวดหมู่ใหม่ที่ไม่เคยอยู่ใน train!
        "customer_tier": "vip",
    }
])

prob_urgent = float(baseline_pipe.predict_proba(new_tickets)[0, 1])
pred_label = int(baseline_pipe.predict(new_tickets)[0])
print(f"New unseen-channel ticket -> pred={pred_label}, P(urgent)={prob_urgent:.3f}")`,
        },
        output: `New unseen-channel ticket -> pred=1, P(urgent)=0.842`,
      },
    ],
    gotcha:
      "จุดสังเกต: ดูผลลัพธ์ของ `DummyClassifier` ในขั้นที่ 2: แม้จะทาย `0` ทุกข้อจนได้ `f1=0.000` (จับเคส urgent ไม่ได้เลยสักใบ!) แต่กลับได้ `acc=0.740` — นี่คือเหตุผลว่าทำไมใน Block B12 (Day 45) เราจะเจาะลึก Precision, Recall, F1 และ PR-AUC แทนการดู Accuracy อย่างเดียว",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างฟังก์ชันประกอบ `Pipeline` + `ColumnTransformer` และฟังก์ชันประเมินเทียบกับ `DummyClassifier` ใน `exercise_day43.py` ที่ทนต่อค่าว่าง คอลัมน์ ID ส่วนเกิน และหมวดหมู่ใหม่ใน Production",
    requirements: [
      "`build_baseline_pipeline(numeric_cols: list[str], categorical_cols: list[str]) -> Pipeline`: คืน `Pipeline` ที่มี step ชื่อ `\"preprocess\"` (`ColumnTransformer` พร้อม `remainder=\"drop\"`) และ `\"clf\"` (`LogisticRegression(max_iter=1000, random_state=42)`)",
      "สายพานตัวเลขใน `ColumnTransformer` ต้องทำ `SimpleImputer(strategy=\"median\")` ตามด้วย `StandardScaler()`; สายพานหมวดหมู่ต้องทำ `SimpleImputer(strategy=\"most_frequent\")` ตามด้วย `OneHotEncoder(handle_unknown=\"ignore\")`",
      "`train_and_compare_baseline(df: pd.DataFrame, target_col: str, numeric_cols: list[str], categorical_cols: list[str], test_size: float = 0.25, random_state: int = 42) -> dict`: แบ่งข้อมูลแบบ Stratified (`stratify=y`), เทรนทั้ง `DummyClassifier(strategy=\"most_frequent\")` และ `build_baseline_pipeline(...)` บนชุด Train เท่านั้น แล้วคืน dict ที่มีคีย์ `pipeline`, `dummy_accuracy`, `dummy_f1`, `model_accuracy`, `model_f1`",
      "`predict_urgent_proba(pipeline: Pipeline, raw_rows: list[dict]) -> list[float]`: แปลง `raw_rows` เป็น `pd.DataFrame` แล้วคืนลิสต์ความน่าจะเป็นของคลาส `1` (`predict_proba(...)[:, 1]`) เป็น Python `float`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day43.py",
      code: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def build_baseline_pipeline(
    numeric_cols: list[str],
    categorical_cols: list[str],
) -> Pipeline:
    """สร้าง Pipeline(preprocess=ColumnTransformer, clf=LogisticRegression)"""
    # TODO: ประกอบ numeric_pipe, categorical_pipe, ColumnTransformer และ Pipeline
    raise NotImplementedError


def train_and_compare_baseline(
    df: pd.DataFrame,
    target_col: str,
    numeric_cols: list[str],
    categorical_cols: list[str],
    test_size: float = 0.25,
    random_state: int = 42,
) -> dict:
    """แบ่งข้อมูลแบบ Stratified แล้วเทียบ DummyClassifier กับ LogisticRegression Pipeline"""
    # TODO: split -> fit dummy & pipeline บน train -> วัด accuracy และ f1 บน test
    raise NotImplementedError


def predict_urgent_proba(pipeline: Pipeline, raw_rows: list[dict]) -> list[float]:
    """คืนความน่าจะเป็นของคลาส 1 สำหรับข้อมูลดิบชุดใหม่"""
    # TODO: แปลงเป็น DataFrame แล้วคืน [float(p) for p in pipeline.predict_proba(df)[:, 1]]
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day43.py",
      code: `import numpy as np
import pandas as pd
import pytest
from sklearn.pipeline import Pipeline
from exercise_day43 import (
    build_baseline_pipeline,
    predict_urgent_proba,
    train_and_compare_baseline,
)


@pytest.fixture
def tickets_df() -> pd.DataFrame:
    rng = np.random.default_rng(7)
    n = 240
    wait = rng.normal(28, 12, n).clip(1)
    amount = rng.normal(1400, 600, n).clip(100)
    channel = rng.choice(["line", "email", "web"], size=n)
    tier = rng.choice(["standard", "vip"], size=n, p=[0.7, 0.3])
    logit = 0.09 * wait + 0.0012 * amount + (tier == "vip") * 1.8 + rng.normal(0, 0.7, n)
    y = (logit > 4.8).astype(int)
    df = pd.DataFrame({
        "ticket_id": [f"T-{i:04d}" for i in range(n)],
        "wait_min": wait,
        "order_value_thb": amount,
        "channel": channel,
        "customer_tier": tier,
        "is_urgent": y,
    })
    df.loc[[1, 15, 30], "wait_min"] = np.nan
    df.loc[[5, 22], "channel"] = None
    return df


def test_pipeline_structure_and_beats_dummy(tickets_df: pd.DataFrame):
    num_cols = ["wait_min", "order_value_thb"]
    cat_cols = ["channel", "customer_tier"]
    result = train_and_compare_baseline(tickets_df, "is_urgent", num_cols, cat_cols)

    pipe = result["pipeline"]
    assert isinstance(pipe, Pipeline)
    assert "preprocess" in pipe.named_steps
    assert "clf" in pipe.named_steps
    assert result["model_f1"] > result["dummy_f1"] + 0.4
    assert result["model_accuracy"] > result["dummy_accuracy"]


def test_handles_nulls_and_unseen_categories(tickets_df: pd.DataFrame):
    num_cols = ["wait_min", "order_value_thb"]
    cat_cols = ["channel", "customer_tier"]
    pipe = build_baseline_pipeline(num_cols, cat_cols)
    X = tickets_df.drop(columns=["is_urgent"])
    y = tickets_df["is_urgent"]
    pipe.fit(X, y)

    unseen_rows = [
        {
            "ticket_id": "T-NEW-1",
            "wait_min": None,
            "order_value_thb": 2800.0,
            "channel": "tiktok_shop",  # unseen category
            "customer_tier": "vip",
        },
        {
            "ticket_id": "T-NEW-2",
            "wait_min": 5.0,
            "order_value_thb": None,
            "channel": None,
            "customer_tier": "standard",
        },
    ]
    probs = predict_urgent_proba(pipe, unseen_rows)
    assert len(probs) == 2
    assert all(isinstance(p, float) and 0.0 <= p <= 1.0 for p in probs)
    assert probs[0] > probs[1]
`,
    },
    selfCheck: [
      "`build_baseline_pipeline` มี step ชื่อ `\"preprocess\"` (`ColumnTransformer`) และ `\"clf\"` (`LogisticRegression`) พร้อม `remainder=\"drop\"`",
      "`train_and_compare_baseline` แบ่งข้อมูลแบบ Stratified ก่อนแล้วค่อย `.fit()` ทั้ง Dummy และ Pipeline บนชุด Train เท่านั้น",
      "โมเดล Baseline ทำคะแนน F1 ชนะ `DummyClassifier` อย่างชัดเจน (`model_f1 > dummy_f1 + 0.4`)",
      "`predict_urgent_proba` รับข้อมูลที่มี `None` และหมวดหมู่ใหม่อย่าง `\"tiktok_shop\"` ได้โดยไม่โยน `ValueError`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 2 test functions ใน `test_day43.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `build_baseline_pipeline` ให้สร้าง `Pipeline` ย่อย 2 ตัว (`numeric_pipe` และ `categorical_pipe`) ใส่เข้า `ColumnTransformer(..., remainder=\"drop\")` แล้วจึงห่อด้วย `Pipeline([(\"preprocess\", preprocessor), (\"clf\", LogisticRegression(max_iter=1000, random_state=42))])`",
      },
      {
        body: "ใน `train_and_compare_baseline` ใช้ `f1_score(y_test, preds, zero_division=0)` เพื่อไม่ให้เกิด warning เมื่อ `DummyClassifier` ทายคลาส `1` เป็นศูนย์ทั้งหมด",
      },
      {
        body: "โครงของ `build_baseline_pipeline` เกือบสมบูรณ์ — เติม `categorical_pipe` และ `Pipeline` ชั้นนอกแล้วรันเทสต์:",
        code: {
          language: "python",
          filename: "hint_day43.py",
          code: `def build_baseline_pipeline(
    numeric_cols: list[str],
    categorical_cols: list[str],
) -> Pipeline:
    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipe, numeric_cols),
            ("cat", categorical_pipe, categorical_cols),
        ],
        remainder="drop",
    )
    # TODO: คืน Pipeline([("preprocess", preprocessor), ("clf", LogisticRegression(max_iter=1000, random_state=42))])
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
      title: "ลืมใส่ `handle_unknown=\"ignore\"` ใน `OneHotEncoder`",
      symptom: "เทรนและเทสต์ผ่านเรียบร้อย แต่พอขึ้น Production เจอหมวดหมู่ใหม่ (เช่น `channel=\"tiktok\"`) ระบบโยน `ValueError: Found unknown categories` ทันที",
      fix: "กำหนด `OneHotEncoder(handle_unknown=\"ignore\")` เสมอเมื่อใช้กับฟีเจอร์หมวดหมู่ที่อาจมีค่าใหม่ในอนาคต",
    },
    {
      title: "ไม่ใส่ `StandardScaler` ก่อน `LogisticRegression` หรือใช้ `max_iter` ต่ำเกินไป",
      symptom: "เกิด `ConvergenceWarning: lbfgs failed to converge` และน้ำหนักของฟีเจอร์ที่มีช่วงตัวเลขต่างกันมากเพี้ยน",
      fix: "สเกลคอลัมน์ตัวเลขด้วย `StandardScaler()` ในสายพานตัวเลข และตั้ง `LogisticRegression(max_iter=1000)`",
    },
    {
      title: "ตั้ง `remainder=\"passthrough\"` โดยไม่รู้ตัวจนคอลัมน์ ID หรือข้อความดิบหลุดเข้าโมเดล",
      symptom: "เกิด `ValueError: could not convert string to float: 'T-0001'` หรือโมเดลแอบใช้เลข ID ที่เรียงตามเวลาเป็นฟีเจอร์",
      fix: "กำหนด `remainder=\"drop\"` อย่างชัดเจนใน `ColumnTransformer` เพื่อให้ผ่านเฉพาะคอลัมน์ที่อยู่ใน allowlist (`numeric_cols` และ `categorical_cols`)",
    },
    {
      title: "แปลงข้อมูลด้วย `pd.get_dummies(df)` บนตารางรวมก่อนแยก Train/Test",
      symptom: "จำนวนและลำดับคอลัมน์ระหว่าง Train กับข้อมูลใหม่ใน Production ไม่ตรงกัน (แถมอาจเกิด leakage จากหมวดหมู่ฝั่ง Test)",
      fix: "ใช้ `OneHotEncoder(handle_unknown=\"ignore\")` ภายใน `ColumnTransformer` + `Pipeline` แทน `pd.get_dummies` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d043-q1",
        "ทำไมวิศวกร ML จึงนิยมรัน `DummyClassifier` ก่อนสร้างโมเดลจริงทุกครั้ง?",
        [
          ["เพราะ `DummyClassifier` แม่นยำที่สุดสำหรับข้อมูลตาราง", "ไม่จริง — `DummyClassifier` แค่ทายตามความถี่หรือสุ่มโดยไม่ดูฟีเจอร์เลย"],
          ["เพื่อตั้งเกณฑ์คะแนนขั้นต่ำ (sanity floor) ให้รู้ว่าโมเดลจริงเรียนรู้สัญญาณได้ดีกว่าการเดาง่าย ๆ โดยเฉพาะเมื่อคลาสไม่สมดุล", "ถูก — ช่วยให้ไม่หลงดีใจกับ Accuracy 90% บนชุดข้อมูลที่มีคลาสหลักอยู่แล้ว 90%"],
          ["เพราะ `scikit-learn` บังคับให้เทรน `DummyClassifier` ก่อนเรียก `Pipeline`", "ไม่ได้บังคับเชิงเทคนิค แต่เป็นวินัยทางวิศวกรรมที่ดี"],
          ["เพื่อเติมค่าว่าง (`NaN`) ในชุดข้อมูลอัตโนมัติ", "การเติมค่าว่างเป็นหน้าที่ของ `SimpleImputer`"],
        ],
        "B",
        "`DummyClassifier` เป็นไม้บรรทัดขั้นต่ำของโปรเจกต์ ML หากโมเดลซับซ้อนยังชนะ Dummy ไม่ได้ แปลว่าฟีเจอร์หรือท่อข้อมูลยังมีปัญหา",
        "บทบาทของ `DummyClassifier` ในโปรเจกต์ ML คืออะไร?",
        "ตั้งเกณฑ์คะแนนขั้นต่ำ (baseline floor) โดยไม่ดูฟีเจอร์ เพื่อใช้ยืนยันว่าโมเดลจริงเรียนรู้สัญญาณได้ดีกว่าการทายคลาสที่พบบ่อยที่สุด",
      ),
      mc(
        "d043-q2",
        "เกิดอะไรขึ้นหากคุณลืมใส่ `handle_unknown=\"ignore\"` ใน `OneHotEncoder` แล้วข้อมูลใหม่ใน Production มี `channel = \"tiktok\"` ที่ไม่เคยอยู่ในชุด Train?",
        [
          ["`OneHotEncoder` จะแอบเพิ่มคอลัมน์ใหม่และเทรนโมเดลใหม่ให้อัตโนมัติ", "ไม่จริง — `.transform()` จะไม่เทรนใหม่"],
          ["ระบบจะโยน `ValueError: Found unknown categories` ทำให้คำขอทำนายนั้นล่มทันที", "ถูก — ค่าเริ่มต้น `handle_unknown=\"error\"` จะโยน exception เมื่อเจอหมวดหมู่ที่ไม่รู้จัก"],
          ["โมเดลจะลบแถวลูกค้านั้นทิ้งเงียบ ๆ", "ไม่จริง — มันจะ error ทันที"],
          ["`OneHotEncoder` จะสุ่มเลือกหมวดหมู่เดิมแทนให้", "ไม่จริง — จะ error เว้นแต่ตั้งค่า `handle_unknown=\"ignore\"`"],
        ],
        "B",
        "ในโลกจริงหมวดหมู่ใหม่เกิดขึ้นได้เสมอ การตั้ง `handle_unknown=\"ignore\"` ทำให้เวกเตอร์ one-hot ของคอลัมน์นั้นเป็น 0 ทั้งหมดอย่างปลอดภัยแทนที่จะทำให้ API ล่ม",
        "`OneHotEncoder(handle_unknown=\"ignore\")` ป้องกันปัญหาอะไรใน Production?",
        "ป้องกันไม่ให้เกิด `ValueError` เมื่อข้อมูลใหม่มีค่าหมวดหมู่ที่ไม่เคยปรากฏในชุด Train โดยแปลงเป็นเวกเตอร์ศูนย์อย่างปลอดภัย",
      ),
      mc(
        "d043-q3",
        "ข้อใดคือประโยชน์สำคัญที่สุดของการห่อ `ColumnTransformer` และ `LogisticRegression` ไว้ใน `sklearn.pipeline.Pipeline` เดียวกัน?",
        [
          ["ทำให้โมเดลเปลี่ยนจาก CPU ไปรันบน GPU อัตโนมัติ", "ไม่จริง — `scikit-learn` `Pipeline` รันบน CPU ตามปกติ"],
          ["รับประกันว่าทุกตัวแปลง (`Imputer`, `Scaler`, `OneHotEncoder`) จะถูก `.fit()` บนชุด Train เท่านั้น และใช้ขั้นตอนแปลงชุดเดียวกันเป๊ะตอนทำนายจริง ลดทั้ง Data Leakage และ Training-Serving Skew", "ถูก — ช่วยให้โค้ดสั้น ปลอดภัยจาก leakage และ serialize เป็นอ็อบเจกต์เดียวได้ง่าย"],
          ["ทำให้ไม่ต้องแบ่ง Train/Test อีกต่อไป", "ผิด — เรายังต้องแบ่ง Train/Val/Test ก่อนเรียก `pipe.fit(X_train, y_train)` เสมอ"],
          ["ลดจำนวนแถวของข้อมูลเทรนลงครึ่งหนึ่งอัตโนมัติ", "ไม่จริง — `Pipeline` แปลงฟีเจอร์ ไม่ได้ตัดแถวทิ้ง"],
        ],
        "B",
        "`Pipeline` บังคับวินัย `fit` เฉพาะ Train และ `transform` บน Val/Test/Prod โดยอัตโนมัติ ทำให้โค้ดเทรนและโค้ดเสิร์ฟตรงกัน 100%",
        "การรวม preprocessing กับ classifier ไว้ใน `sklearn.pipeline.Pipeline` ช่วยแก้ปัญหาอะไรได้บ้าง?",
        "1) ป้องกัน Data Leakage โดยบังคับ fit เฉพาะ train, 2) ขจัด Training-Serving Skew เพราะใช้สายพานแปลงชุดเดียวกันตอนเสิร์ฟ, 3) สะดวกต่อการทำ Cross-Validation และบันทึกโมเดลเป็นไฟล์เดียว",
      ),
      mc(
        "d043-q4",
        "เหตุใดจึงมักเลือก `SimpleImputer(strategy=\"median\")` สำหรับคอลัมน์ตัวเลขอย่าง `order_value_thb` แทนที่จะใช้ `strategy=\"mean\"` เสมอไป?",
        [
          ["เพราะ `median` ทนทานต่อค่าผิดปกติที่สูงโดด (outliers) เช่น ออเดอร์หลักแสนบาทได้ดีกว่า `mean`", "ถูก — ค่าเฉลี่ยถูกดึงเพี้ยนได้ง่ายเมื่อมีออเดอร์ใหญ่พิเศษไม่กี่รายการ ขณะที่มัธยฐานยังคงสะท้อนลูกค้าทั่วไป"],
          ["เพราะ `mean` ใช้กับจำนวนทศนิยม (`float`) ไม่ได้", "ไม่จริง — ทั้ง `mean` และ `median` ใช้กับ float ได้"],
          ["เพราะ `median` ใช้ได้กับคอลัมน์ข้อความด้วย", "ผิด — คอลัมน์ข้อความใช้ `most_frequent` หรือ `constant`"],
          ["เพราะ `median` ไม่ต้องคำนวณจากชุด Train", "ผิด — `median` ก็ต้อง `.fit()` เพื่อคำนวณค่ามัธยฐานจากชุด Train เช่นกัน"],
        ],
        "A",
        "ข้อมูลธุรกิจอย่างราคาสินค้า ยอดซื้อ และเวลารอตอบมักมีการกระจายแบบเบ้ขวา (right-skewed) ค่ามัธยฐาน (`median`) จึงปลอดภัยจาก outlier มากกว่าค่าเฉลี่ย (`mean`)",
        "เมื่อเติมค่าว่างให้คอลัมน์ตัวเลขธุรกิจอย่างยอดซื้อหรือเวลารอ ทำไม `SimpleImputer(strategy=\"median\")` จึงมักปลอดภัยกว่า `mean`?",
        "เพราะข้อมูลธุรกิจมักมี outlier สูงโดดซึ่งดึงค่า `mean` ให้เพี้ยนง่าย ขณะที่ `median` ทนต่อ outlier ได้ดีกว่า",
      ),
    ],
  },

  takeaways: [
    "สร้าง **2-Tier Baseline** เสมอ: `DummyClassifier` (ตั้งเกณฑ์ขั้นต่ำ) + `LogisticRegression` (โมเดลเชิงเส้นเร็วและตีความได้) ก่อนขยับไปโมเดลซับซ้อน",
    "ใช้ **`ColumnTransformer(..., remainder=\"drop\")`** แยกสายพานตัวเลข (`SimpleImputer(median)` + `StandardScaler`) และหมวดหมู่ (`SimpleImputer(most_frequent)` + `OneHotEncoder(handle_unknown=\"ignore\")`)",
    "มัด `ColumnTransformer` + Model ไว้ใน **`{{sklearn-pipeline}}`** เดียว เพื่อกัน {{data-leakage}} โดยโครงสร้าง และไม่ให้โค้ดเทรนกับโค้ด Production เพี้ยนจากกัน",
    "ทดสอบ `Pipeline` ด้วยข้อมูลที่มี `None`/`NaN` และหมวดหมู่ที่ไม่เคยเห็นมาก่อนด้วย {{pytest}} ก่อนถือว่าเสร็จงาน",
  ],

  reviewCards: [
    rc(
      "d043-rc-1",
      "โครงสร้างมาตรฐานของ `ColumnTransformer` สำหรับข้อมูลตารางผสม (ตัวเลข + หมวดหมู่) ประกอบด้วยอะไรบ้าง?",
      "สายพานตัวเลข: `SimpleImputer(strategy=\"median\")` → `StandardScaler()`; สายพานหมวดหมู่: `SimpleImputer(strategy=\"most_frequent\")` → `OneHotEncoder(handle_unknown=\"ignore\")`; และตั้ง `remainder=\"drop\"`",
    ),
    rc(
      "d043-rc-2",
      "ทำไมจึงควรใช้ `OneHotEncoder(handle_unknown=\"ignore\")` ใน `Pipeline` แทน `pd.get_dummies(df)`?",
      "เพราะ `pd.get_dummies` ทำให้คอลัมน์ระหว่าง Train กับข้อมูลใหม่ไม่ตรงกันและเสี่ยง data leakage ส่วน `OneHotEncoder` ใน `Pipeline` จำชุดคอลัมน์จาก Train เท่านั้นและรับมือหมวดหมู่ใหม่ใน Production ได้โดยไม่ crash",
    ),
    rc(
      "d043-rc-3",
      "เมื่อเรียก `pipe.fit(X_train, y_train)` และ `pipe.predict(X_test)` บน `scikit-learn Pipeline` แต่ละขั้นทำงานต่างกันอย่างไร?",
      "`.fit()` เรียก `fit_transform` ทุกตัวแปลงบน `X_train` แล้ว `fit` โมเดลขั้นสุดท้าย ส่วน `.predict()` เรียกเฉพาะ `transform` ด้วยสถิติที่จำไว้จาก Train แล้วส่งเข้า `.predict()` ของโมเดล",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Pipelines and Composite Estimators", href: "https://scikit-learn.org/stable/modules/compose.html" },
    { label: "scikit-learn API Reference — ColumnTransformer", href: "https://scikit-learn.org/stable/modules/generated/sklearn.compose.ColumnTransformer.html" },
    { label: "scikit-learn API Reference — OneHotEncoder", href: "https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html" },
    { label: "scikit-learn API Reference — DummyClassifier", href: "https://scikit-learn.org/stable/modules/generated/sklearn.dummy.DummyClassifier.html" },
  ],

  glossary: [
    "sklearn-pipeline",
    "data-leakage",
    "precision-recall",
    "schema",
    "validation",
    "serialization",
    "reproducibility",
    "pytest",
  ],
});
