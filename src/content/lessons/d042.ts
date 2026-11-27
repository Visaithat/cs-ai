import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D042 — Phase 2 / Block B11
 * Train/Val/Test Split & Preventing Data Leakage
 */
export const d042: Lesson = defineLesson({
  day: 42,
  titleTh: "การแบ่งชุดข้อมูล Train / Val / Test และการป้องกัน Data Leakage",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% (CPU / ไม่ต้องใช้ API key) · แยกชุดข้อมูลอย่างมีวินัย (Stratified / Time / Group) และปิดจุดรั่วที่หลอกคะแนนสูงปลอม",
  icon: "split",
  visual: {
    id: "data-leakage-split",
    title: "Train / Val / Test Split & การป้องกัน Data Leakage",
    caption: "กดสลับเทียบ Pipeline ที่ทำข้อมูลรั่ว (fit ก่อน split) กับวิธีที่ถูกต้อง (split ก่อนแล้ว fit เฉพาะ train)",
    alt: "แผนภาพการแบ่ง Train/Val/Test และจุดที่เกิด data leakage",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "pandas", "uv", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "แบ่งข้อมูลให้สะท้อนโลกจริงก่อนแตะตัวแปลงใด ๆ",
      body: "ข้อมูลที่ทำความสะอาดแล้วต้องถูกแบ่งเป็น **Train / Validation / Test** ด้วยกลยุทธ์ที่ตรงกับธรรมชาติของงาน (ไม่สมดุล, เรียงตามเวลา, หรือมีกลุ่มลูกค้าซ้ำ) ก่อนเริ่มคำนวณค่าเฉลี่ย สเกล หรือคำศัพท์",
      lessonNote: "วันนี้เราฝึกเลือกใช้ Stratified Split, Time-Based Split และ Group Split เพื่อให้ชุดทดสอบจำลองอนาคตได้ใกล้ความจริงที่สุด",
    },
    {
      node: 2,
      heading: "ให้โมเดลเรียนรู้จากชุด Train เพียงอย่างเดียว",
      body: "โมเดลและตัวแปลงข้อมูล (Scaler, Imputer, Encoder, {{tfidf}}) ทุกตัวต้องถูก `.fit()` บนชุด Train เท่านั้น เพื่อให้วัดได้จริงว่าโมเดลจับรูปแบบได้ ไม่ใช่แอบจำเฉลย",
      lessonNote: "กฎทองข้อเดียวที่กันบั๊กได้เกือบทั้งหมด: **Split ก่อนเสมอ แล้วค่อย Fit เฉพาะ Train**",
    },
    {
      node: 3,
      heading: "เก็บชุด Test ไว้เป็นตู้เซฟเพื่อประเมินผลอย่างซื่อสัตย์",
      body: "หากข้อมูลจากชุด Test รั่วเข้าไปตอนเทรน ({{data-leakage}}) หรือคุณแก้โมเดลซ้ำ ๆ เพื่อไล่คะแนน Test ตัวเลขวัดผลจะสูงหลอกตา (เช่น 0.99) แต่พังทันทีที่เจอข้อมูลลูกค้าใหม่",
      lessonNote: "เราแยกบทบาท Validation สำหรับเลือก/จูนโมเดล และเก็บ Test ไว้เปิดดูครั้งเดียวตอนสรุปผล",
    },
    {
      node: 5,
      heading: "ลดช่องว่างระหว่างคะแนนออฟไลน์กับประสิทธิภาพใน Production",
      body: "สาเหตุอันดับหนึ่งที่โมเดลคะแนน 98% ในโน้ตบุ๊กร่วงเหลือ 62% เมื่อขึ้น Production คือ {{data-leakage}} ที่แอบซ่อนอยู่ในคอลัมน์จากอนาคตหรือการแบ่งข้อมูลแบบสุ่มบนข้อมูลที่เรียงตามเวลา",
      lessonNote: "การเขียนฟังก์ชันตรวจคุณภาพการแบ่งข้อมูลด้วย {{pytest}} ช่วยป้องกันข้อมูลรั่วตั้งแต่ขั้นพัฒนา",
    },
  ],

  objectives: [
    "**แยกแยะบทบาท** ของชุดข้อมูล Train, Validation และ Test (ที่ห้ามเปิดดูก่อนจบ) เพื่อป้องกันการปรับจูนจนจำข้อสอบ",
    "**เลือกและเขียนโค้ด** กลยุทธ์การแบ่งข้อมูลที่เหมาะกับโจทย์จริงได้ครบ 3 แบบ: **Stratified Split** (ข้อมูลไม่สมดุล), **Time-Based Split** (ข้อมูลตามเวลา) และ **Group Split** (ป้องกันลูกค้า/เอนทิตีเดียวกันข้ามฝั่ง)",
    "**ระบุและป้องกัน** กับดัก {{data-leakage}} สุดคลาสสิก 3 แบบ: การทำ Scaling/{{tfidf}} ก่อนแบ่ง, คอลัมน์จากอนาคต (Target Leakage) และการมีแถวซ้ำข้ามฝั่ง Train/Test",
  ],

  prerequisites: [
    "ผ่าน Day 41 และติดตั้ง `scikit-learn` ด้วย `uv` แล้ว",
    "คุ้นเคยการจัดการตารางข้อมูลและค่าว่าง/แถวซ้ำจาก Block B09 (Day 33–34)",
    "ใช้งาน `pytest` เพื่อเขียน assertion ตรวจสอบความถูกต้องของข้อมูลได้",
    "รันบนเครื่องได้ 100% (CPU) ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์สำหรับ Day 42 ด้วย {{uv}} แล้วติดตั้ง `scikit-learn` และ `pandas` (เพื่อทำงานร่วมกับ DataFrame และชื่อคอลัมน์ใน `scikit-learn` ได้สะดวก)",
    commands: `uv init ai-day42 && cd ai-day42
uv add scikit-learn pandas
uv add --dev pytest ruff
uv run python -c "import sklearn, pandas as pd; print('sklearn:', sklearn.__version__, '| pandas:', pd.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day42` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `scikit-learn`, `pandas`, `pytest`, `ruff` ผ่าน `uv add`"],
      ["verify", "รันคำสั่งตรวจเวอร์ชัน `scikit-learn` และ `pandas` สำเร็จ"],
    ],
    note: "ในงาน Data Engineering เราใช้ Polars เพื่อความเร็ว แต่เวลาส่งตารางเข้า `scikit-learn` API สามารถใช้ `pandas.DataFrame` (หรือ `df.to_pandas()` จาก Polars) ได้อย่างราบรื่น",
  },

  concepts: [
    {
      id: "train-val-test-roles",
      title: "1 · บทบาทของ Train / Validation / Test — ทำไมต้องมี 3 กอง",
      paragraphs: [
        "มือใหม่หลายคนแบ่งข้อมูลแค่ 2 กอง (Train / Test) แล้วลองปรับโมเดล ลองเปลี่ยนฟีเจอร์ และเช็กคะแนนบน Test ซ้ำไปมา 20 รอบ — สิ่งที่เกิดขึ้นโดยไม่รู้ตัวคือ **ตัวคุณเองกำลัง overfit เข้ากับชุด Test** เพราะคุณเลือกเฉพาะการตั้งค่าที่บังเอิญทำคะแนนได้ดีบนชุด Test นั้น",
        "แนวทางมาตรฐานจึงแยกข้อมูลเป็น **3 กองที่มีหน้าที่ต่างกันเด็ดขาด** (เช่น 60% / 20% / 20% หรือ 70% / 15% / 15%): **Train** ใช้เรียนรู้พารามิเตอร์ของโมเดลและตัวแปลงข้อมูล, **Validation** ใช้เปรียบเทียบโมเดลและจูนไฮเปอร์พารามิเตอร์/threshold ซ้ำได้หลายรอบ, และ **Test (Holdout)** ปิดผนึกไว้ในตู้เซฟเพื่อเปิดประเมิน **เพียงครั้งเดียว** หลังเลือกโมเดลตัวสุดท้ายแล้ว",
        "หากชุดข้อมูลมีขนาดเล็ก (เช่น หลักร้อยถึงไม่กี่พันแถว) เราสามารถแบ่ง Test ไว้ 20% แล้วใช้ **{{cross-validation}}** บนชุด Train 80% แทนการกัน Validation กองเดียวได้ (จะได้ลงลึกใน Day 51)",
      ],
      analogy:
        "Train คือหนังสือแบบเรียน, Validation คือข้อสอบจำลอง (Mock Exam) ที่เอาไว้ฝึกและปรับวิธีทำซ้ำได้ ส่วน Test คือข้อสอบเข้ามหาวิทยาลัยจริงที่ห้ามเปิดดูก่อนวันสอบ",
      bullets: [
        "**Train Set (~60–70%)** — ใช้ `.fit()` ทั้งตัวแปลงข้อมูลและตัวโมเดล",
        "**Validation Set (~15–20%)** — ใช้เทียบโมเดล (เช่น Logistic Regression vs LightGBM) และปรับ threshold/hyperparameters",
        "**Test Set (~15–20%)** — ล็อกไว้จนจบทุกการตัดสินใจ ใช้รายงานความแม่นยำจริงก่อนขึ้น Production (ตั้ง `random_state` คงที่เสมอเพื่อ {{reproducibility}})",
      ],
      whyTitle: "Why this matters — ตัวเลข Test คือสัญญาที่คุณให้ไว้กับทีมธุรกิจ",
      whyParagraphs: [
        "ถ้าคุณรายงานหัวหน้าทีมว่าโมเดลจัดลำดับทิกเก็ตเร่งด่วนได้ Recall 92% แต่ตัวเลขนั้นมาจากชุด Test ที่คุณแอบเปิดปรับโมเดลมาแล้ว 30 รอบ วันขึ้นระบบจริงตัวเลขอาจตกฮวบและทำให้ทีมเสียความเชื่อมั่น",
        "วินัยการแยก Train / Val / Test ตั้งแต่วันนี้เป็นรากฐานเดียวกับแนวคิด Golden Eval Dataset ใน Phase 5",
      ],
    },
    {
      id: "split-strategies",
      title: "2 · เลือกวิธีแบ่งให้ตรงธรรมชาติข้อมูล: Stratified, Time-Based และ Group",
      paragraphs: [
        "`train_test_split(X, y)` แบบสุ่มธรรมดาไม่ได้เหมาะกับทุกชุดข้อมูล! หากทิกเก็ตระดับ `urgent` มีเพียง **5%** ของทั้งหมด การสุ่มธรรมดาอาจทำให้ชุด Test บังเอิญได้ `urgent` แค่ 1% หรือไม่เหลือเลย — วิธีแก้คือใส่ **`stratify=y`** (Stratified Split) เพื่อบังคับให้สัดส่วนของทุกคลาสเท่ากันทั้งใน Train, Val และ Test",
        "หากข้อมูลมีมิติ **เวลา (Chronological)** เช่น ยอดขายรายวัน ราคาสินค้า หรือพฤติกรรมทุจริตที่เปลี่ยนไปตามเดือน ห้ามสุ่มแบ่งเด็ดขาด เพราะจะทำให้โมเดลเอาข้อมูลวันศุกร์ไปช่วยทายวันอังคาร (มองเห็นอนาคต) ต้องใช้ **Time-Based Split**: เรียงตาม timestamp แล้วตัดอดีตเป็น Train, ช่วงกลางเป็น Val และช่วงล่าสุดเป็น Test",
        "และหากลูกค้า 1 คน (`customer_id`) หรือสินค้า 1 ชิ้นโผล่หลายแถวในตาราง การสุ่มแบ่งจะทำให้ลูกค้ารายเดียวกันอยู่ทั้งฝั่ง Train และ Test จนโมเดลแอบจำพฤติกรรมเฉพาะบุคคลได้ — กรณีนี้ต้องใช้ **Group Split** (`GroupShuffleSplit`) เพื่อบังคับให้ทุกแถวของลูกค้า 1 คนอยู่ฝั่งเดียวกันทั้งหมด",
      ],
      analogy:
        "ถ้าจะทดสอบว่าหมอวินิจฉัยโรคกับคนไข้ใหม่ได้แม่นไหม ต้องห้ามเอาผลตรวจครั้งที่ 1 ของนาย ก. ไว้ใน Train แล้วเอาผลตรวจครั้งที่ 2 ของนาย ก. ไปสอบใน Test (Group Split)",
      code: {
        language: "python",
        filename: "split_strategies.py",
        code: `import pandas as pd
from sklearn.model_selection import GroupShuffleSplit, train_test_split

# 1) Stratified Split สำหรับคลาสไม่สมดุล
df = pd.DataFrame({
    "ticket_id": range(1, 21),
    "customer_id": [f"C{i % 5}" for i in range(20)],
    "created_day": range(1, 21),
    "is_urgent": [1, 0, 0, 0, 0] * 4,  # 20% urgent
})
train_s, test_s = train_test_split(
    df, test_size=0.25, stratify=df["is_urgent"], random_state=42
)

# 2) Time-Based Split สำหรับข้อมูลเรียงตามเวลา
df_sorted = df.sort_values("created_day")
train_t, test_t = df_sorted.iloc[:15], df_sorted.iloc[15:]

# 3) Group Split กันลูกค้ารายเดียวกันข้ามฝั่ง
gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
tr_idx, te_idx = next(gss.split(df, df["is_urgent"], groups=df["customer_id"]))
train_g, test_g = df.iloc[tr_idx], df.iloc[te_idx]

print("Stratified urgent rate -> train:", train_s["is_urgent"].mean(), "test:", test_s["is_urgent"].mean())
print("Time split max train day:", train_t["created_day"].max(), "| min test day:", test_t["created_day"].min())
print("Group overlap customers:", set(train_g["customer_id"]) & set(test_g["customer_id"]))`,
        caption: "เลือกวิธีแบ่งตามโจทย์: คลาสไม่สมดุลใช้ `stratify`, ข้อมูลเวลาใช้ตัดตาม timestamp, มีเอนทิตีซ้ำใช้ `GroupShuffleSplit`",
      },
      whyTitle: "Why this matters — วิธีแบ่งข้อมูลกำหนดคำถามที่ชุด Test กำลังตอบ",
      whyParagraphs: [
        "Time-Based Split ตอบคำถามว่า *'โมเดลที่เทรนจากข้อมูลเดือนก่อนจะทายเดือนหน้าได้ดีแค่ไหน?'* ส่วน Group Split ตอบคำถามว่า *'โมเดลจะทายลูกค้าหน้าใหม่ที่ไม่เคยเห็นมาก่อนได้ดีแค่ไหน?'*",
        "ถ้าเลือกวิธีแบ่งผิดตั้งแต่บรรทัดแรก ทุกเมทริกซ์ประเมินผล (Precision, Recall, F1) ที่ตามมาใน Block B12 จะสะท้อนคำถามที่ผิดทั้งหมด",
      ],
    },
    {
      id: "classic-leakage-traps",
      title: "3 · 3 กับดัก Data Leakage สุดคลาสสิกที่หลอกให้คะแนนสูงปลอม",
      paragraphs: [
        "**{{data-leakage}}** คือการที่ข้อมูลซึ่ง *ไม่ควรมีอยู่จริงในเวลาทำนาย* หรือ *ข้อมูลสถิติจากชุด Test* หลุดเข้าไปในกระบวนการเทรน ส่งผลให้คะแนนบนชุด Test สูงผิดปกติ แต่ใช้งานจริงไม่ได้เลย",
        "กับดักที่เจอบ่อยที่สุดในงานจริงมี 3 รูปแบบ: **(1) Preprocessing Leakage** — การเรียก `StandardScaler().fit_transform(X_all)`, `SimpleImputer().fit_transform(X_all)` หรือ `TfidfVectorizer().fit_transform(all_texts)` ก่อนแบ่ง Train/Test ทำให้ค่าเฉลี่ย ส่วนเบี่ยงเบนมาตรฐาน หรือคำศัพท์ของชุด Test รั่วเข้าไปในการเทรน",
        "**(2) Target / Future Leakage** — การเผลอใส่ฟีเจอร์ที่เกิดขึ้น *หลังจาก* เหตุการณ์ที่ต้องการทาย เช่น ต้องการทำนายตอนลูกค้าเปิดทิกเก็ตว่า `is_urgent` หรือไม่ แต่ดันใส่คอลัมน์ `resolved_in_minutes` หรือ `assigned_senior_agent` (ซึ่งรู้ทีหลังเมื่อปิดงานแล้ว!) และ **(3) Duplicate / Entity Leakage** — มีแถวข้อมูลซ้ำจากระบบ log (จำ Day 34 ได้ไหม?) ที่ไม่ได้ตัดออกก่อนแบ่ง จนสำเนาแถวเดียวกันไปอยู่ทั้ง Train และ Test",
      ],
      analogy:
        "Target Leakage เหมือนการให้โมเดลทายว่า 'วันนี้ฝนจะตกไหมตอนเช้า' โดยแอบส่งฟีเจอร์ 'จำนวนร่มที่กางตอนเที่ยง' เข้าไปด้วย — ทายแม่น 99% บนข้อมูลย้อนหลัง แต่ตอนเช้าจริงไม่มีฟีเจอร์นั้นให้ใช้!",
      bullets: [
        "**Preprocessing Leakage** → แก้โดย Split ก่อนเสมอ แล้วใส่ทุกตัวแปลงไว้ใน {{sklearn-pipeline}} (เรียนเต็มใน Day 43)",
        "**Target / Future Leakage** → ถามทุกคอลัมน์ว่า *'ณ วินาทีที่เรียก `.predict()` ใน Production เรารู้ค่าคอลัมน์นี้แล้วหรือยัง?'* ถ้ายังไม่รู้ ให้ตัดทิ้งทันที",
        "**Duplicate / Customer Leakage** → ตัดแถวซ้ำก่อนแบ่ง และใช้ `GroupShuffleSplit` เมื่อหนึ่งเอนทิตีมีหลายแถว",
      ],
      whyTitle: "Why this matters — คะแนนที่ 'ดีเกินจริง' คือสัญญาณเตือนภัยอันดับหนึ่ง",
      whyParagraphs: [
        "วิศวกร ML ที่มีประสบการณ์จะ **ไม่รีบดีใจ** เมื่อเห็นโมเดลรันครั้งแรกได้คะแนน 0.99 บนข้อมูลธุรกิจจริง แต่จะหยุดตั้งข้อสงสัยทันทีว่า *'มีคอลัมน์จากอนาคตหรือข้อมูลซ้ำรั่วเข้ามาหรือเปล่า?'*",
        "ใน Day 44 (วันทบทวนรอบนี้) คุณจะได้ลงมือผ่าตัดสคริปต์ที่ตั้งใจฝังบั๊ก Data Leakage ทั้ง 3 แบบนี้ด้วยตัวเอง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Train/Val/Test และ Data Leakage กับงาน Software Engineering",
      body: [
        "แนวคิดการแยกสภาพแวดล้อมและการป้องกันข้อมูลรั่วมีคู่ขนานที่ชัดเจนในงานพัฒนาเว็บและระบบหลังบ้าน:",
      ],
      table: [
        ["Train / Val / Test sets", "Dev / Staging / Production (ห้ามเอา Production data มา hardcode ใส่ unit test)"],
        ["Data Leakage (fit ก่อน split)", "เอาคำตอบจากไฟล์ test มาร่วมคำนวณในฟังก์ชันที่ถูกทดสอบ"],
        ["Target / Future Leakage", "อ่านฟิลด์ `updated_at` / `closed_status` ในจังหวะ `POST /tickets` ที่เพิ่งสร้าง"],
        ["GroupSplit by customer_id", "แยก tenant/user ใน staging ไม่ให้ปนกันตอนทำ A/B test"],
      ],
    },
    student: {
      title: "First-Year Note — จำข้อสอบ (Memorization) vs เข้าใจบทเรียน (Generalization)",
      body: [
        "เป้าหมายของ Machine Learning ไม่ใช่การทำคะแนนเต็มบนข้อมูลที่เคยเห็นแล้ว แต่คือ **Generalization** — ความสามารถในการทำนายข้อมูลใหม่ที่ไม่เคยเห็นมาก่อนได้แม่นยำ",
        "เมื่อเกิด **Data Leakage** (เช่น มีทิกเก็ตซ้ำอยู่ทั้ง Train และ Test หรือแอบเอาค่าเฉลี่ยของ Test มาช่วยคำนวณ) โมเดลจะเหมือนนักเรียนที่แอบเห็นเฉลยข้อสอบล่วงหน้า สอบในห้องได้ 99% แต่พอเจอข้อสอบจริงในชีวิตการทำงานกลับทำไม่ได้",
        "การตั้ง `random_state=42` ในฟังก์ชันแบ่งข้อมูลไม่ได้ทำให้โมเดลเก่งขึ้น แต่ช่วยให้เพื่อนร่วมทีมหรือชุดเทสต์ได้ผลการแบ่งเหมือนเดิมทุกครั้ง ({{reproducibility}})",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีชุดข้อมูลทิกเก็ตซัพพอร์ต e-commerce ไทย 100 แถว (มีคลาส `urgent` น้อยเพียง 10%, มี timestamp และมี `customer_id`) มาดูการแบ่ง 3 กองแบบ Stratified, การแบ่งตามเวลา และการเทียบ `StandardScaler` ที่รั่วกับไม่รั่วทีละขั้น",
    steps: [
      {
        title: "1 · แบ่ง Train / Val / Test (60 / 20 / 20) แบบ Stratified",
        explain:
          "`train_test_split` แบ่งทีละ 2 กอง เราจึงแบ่ง 2 จังหวะ: แยก Test 20% ออกไปเก็บในตู้เซฟก่อน แล้วค่อยแบ่ง 80% ที่เหลือออกเป็น Train (60%) และ Val (20%) โดยใส่ `stratify` ทั้งสองครั้ง",
        code: {
          language: "python",
          filename: "worked_split.py",
          code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(42)
n = 100
df = pd.DataFrame({
    "ticket_id": [f"T-{i:03d}" for i in range(n)],
    "customer_id": [f"CUS-{i % 25:02d}" for i in range(n)],
    "created_day": np.arange(1, n + 1),
    "wait_min": rng.normal(loc=25.0, scale=10.0, size=n).clip(1.0).round(1),
    "is_urgent": [1 if i % 10 == 0 else 0 for i in range(n)],  # 10% urgent
})

# ขั้น 1: กัน Test 20% ออกไปก่อน
train_val, test = train_test_split(
    df, test_size=0.20, stratify=df["is_urgent"], random_state=42
)
# ขั้น 2: แบ่ง 80% ที่เหลือเป็น Train 60% / Val 20% (0.25 ของ 80% = 20%)
train, val = train_test_split(
    train_val, test_size=0.25, stratify=train_val["is_urgent"], random_state=42
)

for name, part in [("train", train), ("val", val), ("test", test)]:
    print(f"{name:5s}: rows={len(part):2d} | urgent_rate={part['is_urgent'].mean():.2f}")`,
        },
        output: `train: rows=60 | urgent_rate=0.10
val  : rows=20 | urgent_rate=0.10
test : rows=20 | urgent_rate=0.10`,
      },
      {
        title: "2 · เทียบการ Scale แบบรั่ว (fit ก่อน split) vs แบบสะอาด (fit เฉพาะ train)",
        explain:
          "สมมติชุดข้อมูลช่วงหลัง (Test) มีเวลารอพุ่งสูงขึ้นเป็น 120 นาที ลองดูความต่างของค่าเฉลี่ย `mean_` ที่ `StandardScaler` เรียนรู้ระหว่างวิธีที่รั่วกับวิธีที่ถูกต้อง",
        code: {
          language: "python",
          filename: "worked_split.py",
          code: `from sklearn.preprocessing import StandardScaler

# จำลองสถานการณ์ที่ช่วง Test มี wait_min สูงกว่าปกติ (traffic spike)
df_spike = df.copy()
df_spike.loc[80:, "wait_min"] = 120.0

# แบบผิด (LEAKY): fit บนข้อมูลทั้งหมดก่อนแบ่ง
leaky_scaler = StandardScaler()
leaky_scaler.fit(df_spike[["wait_min"]])

# แบบถูก (CLEAN): แบ่งตามเวลาก่อน แล้ว fit เฉพาะ train
train_time = df_spike.iloc[:80]
test_time = df_spike.iloc[80:]
clean_scaler = StandardScaler()
clean_scaler.fit(train_time[["wait_min"]])

print(f"Leaky scaler mean : {leaky_scaler.mean_[0]:.2f} (แอบรู้ข้อมูล spike ในอนาคต!)")
print(f"Clean scaler mean : {clean_scaler.mean_[0]:.2f} (เรียนรู้เฉพาะอดีตจาก train)")
print("Scaled first test row (clean):", round(float(clean_scaler.transform(test_time[["wait_min"]])[0, 0]), 2))`,
        },
        output: `Leaky scaler mean : 43.82 (แอบรู้ข้อมูล spike ในอนาคต!)
Clean scaler mean : 24.78 (เรียนรู้เฉพาะอดีตจาก train)
Scaled first test row (clean): 10.29`,
      },
      {
        title: "3 · ตรวจสอบความสมบูรณ์ของ Split แบบอัตโนมัติ (Zero Overlap)",
        explain:
          "เขียนตัวเช็กสั้น ๆ ยืนยันว่าดัชนีไม่ทับซ้อนกันเลย, ผลรวมจำนวนแถวเท่าเดิมเป๊ะ และในกรณี Time Split เวลาสูงสุดของ Train ต้องไม่เกินเวลาต่ำสุดของ Test",
        code: {
          language: "python",
          filename: "worked_split.py",
          code: `assert set(train.index).isdisjoint(val.index)
assert set(train.index).isdisjoint(test.index)
assert set(val.index).isdisjoint(test.index)
assert len(train) + len(val) + len(test) == len(df)
assert train_time["created_day"].max() < test_time["created_day"].min()
print("All split integrity checks passed!")`,
        },
        output: `All split integrity checks passed!`,
      },
    ],
    gotcha:
      "จุดสังเกต: เวลาแบ่ง 3 กอง (`60/20/20`) หลังจากตัด `test_size=0.20` ออกไปแล้ว ข้อมูลที่เหลือคือ 80% ดังนั้นถ้าอยากได้ Validation 20% ของข้อมูลทั้งหมด ต้องส่ง `test_size=0.25` ในรอบที่สอง (`0.25 * 0.80 = 0.20`) ไม่ใช่ `0.20`!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างชุดยูทิลิตี้แบ่งข้อมูลที่ปลอดภัยจาก {{data-leakage}} ใน `exercise_day42.py` รองรับทั้ง Stratified 3-way split, Chronological split, Group split และการตรวจเช็กความถูกต้องของ split",
    requirements: [
      "`stratified_three_way_split(df: pd.DataFrame, target_col: str, val_ratio: float = 0.2, test_ratio: float = 0.2, random_state: int = 42) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]`: แบ่งเป็น `(train, val, test)` โดยรักษาสัดส่วนของ `target_col` ทั้ง 3 กอง และคำนวณสัดส่วนรอบสองให้แม่น (`val_ratio / (1.0 - test_ratio)`)",
      "`chronological_split(df: pd.DataFrame, time_col: str, test_ratio: float = 0.2) -> tuple[pd.DataFrame, pd.DataFrame]`: เรียงข้อมูลตาม `time_col` จากน้อยไปมาก แล้วตัดช่วงแรกเป็น `train` และช่วงท้าย (`int(len(df) * test_ratio)` แถว อย่างน้อย 1 แถว) เป็น `test`",
      "`group_leak_free_split(df: pd.DataFrame, target_col: str, group_col: str, test_ratio: float = 0.2, random_state: int = 42) -> tuple[pd.DataFrame, pd.DataFrame]`: ใช้ `GroupShuffleSplit` เพื่อให้ไม่มีค่าใน `group_col` ใดอยู่ทั้งใน `train` และ `test`",
      "`fit_clean_scaler(train_df: pd.DataFrame, test_df: pd.DataFrame, feature_cols: list[str]) -> tuple[np.ndarray, np.ndarray, StandardScaler]`: `fit_transform` เฉพาะ `train_df[feature_cols]` และ `transform` บน `test_df[feature_cols]` แล้วคืน `(X_train_scaled, X_test_scaled, scaler)`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day42.py",
      code: `import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.preprocessing import StandardScaler


def stratified_three_way_split(
    df: pd.DataFrame,
    target_col: str,
    val_ratio: float = 0.2,
    test_ratio: float = 0.2,
    random_state: int = 42,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """แบ่ง DataFrame เป็น (train, val, test) แบบ Stratified"""
    # TODO: ตรวจ val_ratio + test_ratio < 1.0 แล้วแบ่ง 2 จังหวะพร้อม stratify
    raise NotImplementedError


def chronological_split(
    df: pd.DataFrame,
    time_col: str,
    test_ratio: float = 0.2,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """แบ่งข้อมูลตามลำดับเวลา (อดีต=train, ล่าสุด=test)"""
    # TODO: เรียงตาม time_col แล้วตัดเป็น train / test
    raise NotImplementedError


def group_leak_free_split(
    df: pd.DataFrame,
    target_col: str,
    group_col: str,
    test_ratio: float = 0.2,
    random_state: int = 42,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """แบ่งข้อมูลโดยไม่ให้เอนทิตีใน group_col เดียวกันข้ามฝั่งระหว่าง train และ test"""
    # TODO: ใช้ GroupShuffleSplit
    raise NotImplementedError


def fit_clean_scaler(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    feature_cols: list[str],
) -> tuple[np.ndarray, np.ndarray, StandardScaler]:
    """fit StandardScaler เฉพาะชุด train แล้ว transform ชุด test"""
    # TODO: fit_transform(train) และ transform(test)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day42.py",
      code: `import pandas as pd
import pytest
from exercise_day42 import (
    chronological_split,
    fit_clean_scaler,
    group_leak_free_split,
    stratified_three_way_split,
)


@pytest.fixture
def sample_tickets() -> pd.DataFrame:
    n = 100
    return pd.DataFrame({
        "ticket_id": range(n),
        "customer_id": [f"CUS-{i % 20:02d}" for i in range(n)],
        "created_day": list(range(n, 0, -1)),  # จงใจให้เรียงสลับเพื่อเทสต์การ sort
        "wait_min": [10.0 if i < 80 else 100.0 for i in range(n)],
        "is_urgent": [1 if i % 10 == 0 else 0 for i in range(n)],
    })


def test_stratified_three_way_split(sample_tickets: pd.DataFrame):
    tr, va, te = stratified_three_way_split(sample_tickets, "is_urgent", 0.2, 0.2)
    assert (len(tr), len(va), len(te)) == (60, 20, 20)
    assert set(tr.index).isdisjoint(va.index)
    assert set(tr.index).isdisjoint(te.index)
    assert set(va.index).isdisjoint(te.index)
    assert tr["is_urgent"].mean() == pytest.approx(0.10)
    assert va["is_urgent"].mean() == pytest.approx(0.10)
    assert te["is_urgent"].mean() == pytest.approx(0.10)


def test_chronological_split_ordering(sample_tickets: pd.DataFrame):
    tr, te = chronological_split(sample_tickets, "created_day", test_ratio=0.2)
    assert len(tr) == 80 and len(te) == 20
    assert tr["created_day"].max() < te["created_day"].min()


def test_group_split_zero_customer_overlap(sample_tickets: pd.DataFrame):
    tr, te = group_leak_free_split(sample_tickets, "is_urgent", "customer_id", test_ratio=0.2)
    overlap = set(tr["customer_id"]) & set(te["customer_id"])
    assert len(overlap) == 0
    assert len(tr) + len(te) == len(sample_tickets)


def test_fit_clean_scaler_no_test_leakage(sample_tickets: pd.DataFrame):
    tr = sample_tickets.iloc[:80]  # wait_min = 10.0 ทั้งหมด
    te = sample_tickets.iloc[80:]  # wait_min = 100.0 ทั้งหมด
    X_tr, X_te, scaler = fit_clean_scaler(tr, te, ["wait_min"])
    assert scaler.mean_[0] == pytest.approx(10.0)  # ห้ามมี 100.0 จาก test รั่วเข้ามา!
    assert X_tr.shape == (80, 1)
    assert X_te.shape == (20, 1)
`,
    },
    selfCheck: [
      "`stratified_three_way_split` แบ่งได้ `(60, 20, 20)` แถวและรักษาอัตรา `is_urgent == 0.10` ครบทั้ง 3 กองโดยไม่มีดัชนีทับซ้อน",
      "`chronological_split` เรียงข้อมูลตาม `created_day` ก่อนตัดเสมอ แม้ข้อมูลขาเข้าจะไม่ได้เรียงมาก่อน",
      "`group_leak_free_split` รับประกันว่าไม่มี `customer_id` ใดปรากฏทั้งฝั่ง `train` และ `test`",
      "`fit_clean_scaler` มีค่า `scaler.mean_[0] == 10.0` ยืนยันว่าไม่ได้แตะข้อมูลฝั่ง `test` (`100.0`) ตอน `fit`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 4 test functions ใน `test_day42.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `stratified_three_way_split` ให้คำนวณ `val_relative = val_ratio / (1.0 - test_ratio)` สำหรับการแบ่งรอบที่สองหลังตัด `test` ออกไปแล้ว",
      },
      {
        body: "ใน `group_leak_free_split` ใช้ `gss = GroupShuffleSplit(n_splits=1, test_size=test_ratio, random_state=random_state)` แล้วดึง index ด้วย `tr_idx, te_idx = next(gss.split(df, df[target_col], groups=df[group_col]))`",
      },
      {
        body: "โครงของ `stratified_three_way_split` และ `fit_clean_scaler` เกือบสมบูรณ์ — เติมส่วนที่เหลือแล้วรันเทสต์:",
        code: {
          language: "python",
          filename: "hint_day42.py",
          code: `def stratified_three_way_split(
    df: pd.DataFrame,
    target_col: str,
    val_ratio: float = 0.2,
    test_ratio: float = 0.2,
    random_state: int = 42,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    if val_ratio <= 0 or test_ratio <= 0 or (val_ratio + test_ratio) >= 1.0:
        raise ValueError("Invalid split ratios")
    train_val, test = train_test_split(
        df, test_size=test_ratio, stratify=df[target_col], random_state=random_state
    )
    val_relative = val_ratio / (1.0 - test_ratio)
    train, val = train_test_split(
        train_val, test_size=val_relative, stratify=train_val[target_col], random_state=random_state
    )
    return train, val, test


def fit_clean_scaler(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    feature_cols: list[str],
) -> tuple[np.ndarray, np.ndarray, StandardScaler]:
    scaler = StandardScaler()
    # TODO: เรียก scaler.fit_transform(train_df[feature_cols]) และ scaler.transform(test_df[feature_cols])
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
      title: "ทำ StandardScaler / SimpleImputer / TfidfVectorizer บนข้อมูลทั้งหมดก่อนแบ่ง Train/Test",
      symptom: "สถิติจากชุด Test (ค่าเฉลี่ย, ค่ามัธยฐาน, คำศัพท์ IDF) รั่วเข้าไปในชุด Train ทำให้คะแนน validation สูงกว่าความเป็นจริง",
      fix: "แบ่ง Train/Val/Test ก่อนเสมอ แล้วห่อทุกตัวแปลงข้อมูลไว้ใน `sklearn.pipeline.Pipeline` (Day 43) เพื่อบังคับ `.fit()` เฉพาะชุด Train",
    },
    {
      title: "สุ่มแบ่งข้อมูล (Random Split) กับชุดข้อมูลที่ขึ้นกับเวลา",
      symptom: "โมเดลทำนายยอดขายหรือการทุจริตได้คะแนนสูงมากตอนทดสอบ แต่พอใช้ทำนายสัปดาห์ถัดไปกลับแม่นยำต่ำ",
      fix: "เรียงข้อมูลตาม timestamp แล้วใช้ Time-Based Split (หรือ `TimeSeriesSplit`) เพื่อให้ Train เป็นอดีตและ Test เป็นอนาคตเสมอ",
    },
    {
      title: "เผลอใส่คอลัมน์ที่รู้หลังจากเกิดผลลัพธ์แล้ว (Target / Future Leakage)",
      symptom: "โมเดลได้ Accuracy 0.99 ทันทีตั้งแต่รอบแรก แต่เมื่อรับคำขอใหม่ใน Production คอลัมน์นั้นเป็นค่าว่างหรือไม่มีอยู่จริง",
      fix: "ตรวจสอบทุกฟีเจอร์ว่ามีค่าพร้อมใช้งานจริง ณ เวลาที่เรียก `.predict()` หรือไม่ และตัดคอลัมน์หลังเหตุการณ์ (เช่น `resolved_in_minutes`, `refund_status`) ทิ้งก่อนเทรน",
    },
    {
      title: "เปิดดูและปรับโมเดลไล่ตามคะแนนชุด Test ซ้ำหลายสิบรอบ",
      symptom: "โมเดล overfit กับชุด Test โดยอ้อม ทำให้คะแนน Test ไม่สามารถพยากรณ์คุณภาพบนข้อมูลลูกค้าใหม่ได้อีกต่อไป",
      fix: "ใช้ชุด Validation (หรือ Cross-Validation) สำหรับการทดลองทั้งหมด และแตะชุด Test เพียงครั้งเดียวเมื่อเลือกโมเดลสุดท้ายแล้ว",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d042-q1",
        "ข้อใดคือตัวอย่างของ **Target / Future Leakage** ในระบบทำนายความเร่งด่วนของทิกเก็ตลูกค้าทันทีที่เปิดทิกเก็ต?",
        [
          ["ใช้คอลัมน์ `customer_tier` (ระดับสมาชิก ณ เวลาเปิดทิกเก็ต)", "ข้อมูลนี้มีอยู่จริงตั้งแต่ตอนลูกค้าเปิดทิกเก็ต ไม่ใช่ leakage"],
          ["ใช้คอลัมน์ `resolved_in_minutes` (จำนวนนาทีที่เจ้าหน้าที่ใช้ปิดทิกเก็ตนี้)", "ถูก — ณ วินาทีที่ลูกค้าเพิ่งเปิดทิกเก็ต เรายังไม่รู้ว่าจะใช้เวลาปิดงานกี่นาที คอลัมน์นี้มาจากอนาคต"],
          ["ใช้คอลัมน์ `channel` (`line`, `email`, `web`)", "ช่องทางที่ส่งเข้ามาเป็นข้อมูลที่รู้ทันทีตอนเปิดทิกเก็ต"],
          ["ใช้จำนวนทิกเก็ตในอดีตของลูกค้ารายนั้นในรอบ 30 วันที่ผ่านมา", "สถิติย้อนหลังก่อนเวลาเปิดทิกเก็ตเป็นฟีเจอร์ที่ถูกต้อง"],
        ],
        "B",
        "กฎเช็ก Target Leakage: ถามเสมอว่า 'ณ วินาทีที่ต้องทำนายใน Production เรามีค่าฟีเจอร์นี้แล้วหรือยัง?' หากค่านี้เกิดขึ้นทีหลัง ต้องตัดทิ้งทันที",
        "จะตรวจจับ Target / Future Leakage ในตารางฟีเจอร์ได้อย่างไร?",
        "ตรวจสอบทุกคอลัมน์ว่ามีค่าพร้อมใช้จริง ณ เวลาที่เรียก `.predict()` หรือไม่ หากเป็นข้อมูลที่เกิดขึ้นหลังจากผลลัพธ์ (เช่น เวลาปิดงานหรือสถานะอนุมัติ) ให้ตัดทิ้ง",
      ),
      mc(
        "d042-q2",
        "ชุดข้อมูลทิกเก็ตมี 50,000 แถว แต่มีลูกค้ารวมเพียง 4,000 คน (ลูกค้า 1 คนเปิดเฉลี่ย 12 ทิกเก็ต) หากต้องการวัดว่าโมเดลทำนาย **ลูกค้าหน้าใหม่** ได้ดีแค่ไหน ควรแบ่งข้อมูลแบบใด?",
        [
          ["Random split 80/20 ธรรมดา", "ผิด — ลูกค้าคนเดิมจะกระจายอยู่ทั้ง Train และ Test ทำให้โมเดลจำรูปแบบเฉพาะบุคคลได้"],
          ["`GroupShuffleSplit` โดยระบุ `groups=df[\"customer_id\"]`", "ถูก — บังคับให้ทิกเก็ตทุกใบของลูกค้า 1 คนอยู่ฝั่งเดียวกันทั้งหมด ไม่รั่วข้ามฝั่ง"],
          ["ทำ `StandardScaler` ทั้งตารางก่อนแล้วค่อยสุ่มแบ่ง", "ผิดซ้ำสอง — เกิดทั้ง preprocessing leakage และ customer leakage"],
          ["ใช้ข้อมูลทั้ง 50,000 แถวเป็นทั้ง Train และ Test", "ผิด — เป็นการสอบด้วยข้อสอบเดิมที่เพิ่งท่องมา ไม่วัด generalization"],
        ],
        "B",
        "เมื่อหลายแถวผูกกับเอนทิตีเดียวกัน (ลูกค้า, ผู้ป่วย, ร้านค้า) ต้องใช้ Group Split เพื่อรับประกันว่าเอนทิตีเดียวกันไม่ปรากฏทั้งสองฝั่ง",
        "เมื่อไรต้องใช้ `GroupShuffleSplit` แทน `train_test_split` ธรรมดา?",
        "เมื่อหนึ่งเอนทิตี (เช่น `customer_id`, `user_id`, `shop_id`) มีหลายแถวในชุดข้อมูล เพื่อป้องกันไม่ให้ข้อมูลของเอนทิตีเดียวกันรั่วข้ามฝั่งระหว่าง Train และ Test",
      ),
      mc(
        "d042-q3",
        "หากข้อมูลมีคลาส `fraud = 1` เพียง **2%** และ `fraud = 0` ถึง **98%** การใส่ `stratify=y` ใน `train_test_split` ช่วยเรื่องใด?",
        [
          ["สร้างข้อมูลปลอมเพิ่มให้ `fraud = 1` กลายเป็น 50%", "ไม่จริง — `stratify` ไม่ได้เพิ่มหรือสังเคราะห์ข้อมูลใหม่"],
          ["รักษาสัดส่วนคลาส `2% / 98%` ให้เท่ากันทั้งในชุด Train และชุด Test", "ถูก — ป้องกันไม่ให้คลาสหายากไปกระจุกอยู่ฝั่งเดียวหรือหายไปจากชุด Test"],
          ["ลบแถวที่ค่าว่างออกให้อัตโนมัติ", "`stratify` ไม่ได้จัดการค่าว่าง"],
          ["เรียงข้อมูลตามเวลาให้อัตโนมัติ", "ไม่จริง — `stratify` เป็นการสุ่มแบบแบ่งชั้น ไม่ใช่การเรียงตามเวลา"],
        ],
        "B",
        "Stratified Split ช่วยให้การกระจายตัวของคลาสใน Train, Val และ Test ตรงกับสัดส่วนจริงของข้อมูล โดยเฉพาะในงานที่คลาสไม่สมดุล (Imbalanced Classification)",
        "`stratify=y` ใน `train_test_split` ทำหน้าที่อะไรและสำคัญตอนไหน?",
        "รักษาสัดส่วนของแต่ละคลาสใน Train และ Test ให้เท่ากับชุดข้อมูลตั้งต้น สำคัญมากเมื่อคลาสไม่สมดุล (เช่น fraud 2% หรือ urgent 5%)",
      ),
      mc(
        "d042-q4",
        "เหตุใดจึงต้องแยกชุด **Validation** ออกมาจากชุด **Test** แทนที่จะจูนโมเดลดูผลจากชุด Test ไปเรื่อย ๆ?",
        [
          ["เพราะ `scikit-learn` ไม่ยอมให้เรียก `.score()` บนชุด Test เกิน 1 ครั้ง", "ไลบรารีไม่ได้ห้าม แต่วินัยวิศวกรรมห้ามเพื่อป้องกันการหลอกตัวเอง"],
          ["เพราะการปรับจูนโมเดลตามผลชุด Test ซ้ำ ๆ จะทำให้เรา overfit กับชุด Test จนคะแนน Test สูงหลอกตาและไม่สะท้อนข้อมูลจริงในอนาคต", "ถูก — ใช้ Validation สำหรับทดลอง/เลือกโมเดล และเก็บ Test ไว้ประเมินผลสุดท้ายอย่างเป็นกลางเพียงครั้งเดียว"],
          ["เพราะชุด Validation ใช้สำหรับ `.fit()` โมเดลเท่านั้น", "ผิด — เรา `.fit()` โมเดลบนชุด Train ไม่ใช่ Validation"],
          ["เพราะชุด Test ไม่ต้องมีคอลัมน์เป้าหมาย (`y_test`)", "ผิด — ชุด Test ต้องมี `y_test` เพื่อใช้วัดความแม่นยำสุดท้าย"],
        ],
        "B",
        "ทุกครั้งที่คุณเลือกโมเดลหรือเปลี่ยนพารามิเตอร์โดยดูคะแนนจากชุดใด ชุดนั้นจะกลายเป็นส่วนหนึ่งของกระบวนการเลือกโมเดลทันที จึงต้องมี Holdout Test ที่ไม่ถูกแตะเลยจนจบ",
        "อธิบายความต่างของหน้าที่ระหว่าง Train, Validation และ Test Set?",
        "Train = เรียนรู้พารามิเตอร์ (`.fit()`), Validation = เปรียบเทียบโมเดลและจูนไฮเปอร์พารามิเตอร์/threshold, Test = ประเมินผลครั้งสุดท้ายเพียงครั้งเดียวเพื่อวัด generalization จริง",
      ),
    ],
  },

  takeaways: [
    "แยกบทบาทให้ขาด: **Train** สำหรับ `.fit()`, **Validation** สำหรับเลือกโมเดล/จูนค่า, และ **Test** ปิดผนึกไว้ประเมินผลสุดท้ายครั้งเดียว",
    "เลือกวิธีแบ่งตามธรรมชาติข้อมูล: คลาสไม่สมดุลใช้ **`stratify=y`**, ข้อมูลตามเวลาใช้ **Time-Based Split**, มีเอนทิตีซ้ำหลายแถวใช้ **`GroupShuffleSplit`**",
    "กฎทองกัน {{data-leakage}}: **Split ก่อนทุกอย่าง** แล้วค่อย `fit` ตัวแปลงข้อมูลเฉพาะชุด Train และตรวจสอบทุกฟีเจอร์ว่าไม่มีข้อมูลจากอนาคต (Target Leakage)",
    "เขียนเทสต์ {{pytest}} ตรวจ `isdisjoint`, กลุ่มลูกค้าไม่ข้ามฝั่ง และลำดับเวลา เพื่อให้ความสะอาดของชุดข้อมูลถูกยืนยันอัตโนมัติทุกครั้ง",
  ],

  reviewCards: [
    rc(
      "d042-rc-1",
      "กับดัก Data Leakage สุดคลาสสิก 3 รูปแบบคืออะไร และวิธีป้องกันแต่ละแบบคืออะไร?",
      "1) Preprocessing Leakage (fit scaler/TF-IDF ก่อน split) → split ก่อนและใช้ Pipeline; 2) Target/Future Leakage (คอลัมน์ที่รู้หลังเกิดเหตุการณ์) → ตัดทิ้งก่อนเทรน; 3) Duplicate/Group Leakage → ตัดแถวซ้ำก่อน split และใช้ GroupShuffleSplit",
    ),
    rc(
      "d042-rc-2",
      "เมื่อแบ่งข้อมูลเป็น 60% Train / 20% Val / 20% Test ด้วย `train_test_split` สองรอบ รอบที่สองต้องใส่ `test_size` เท่าไร?",
      "ใส่ `test_size = 0.25` (มาจาก `0.20 / (1.0 - 0.20)`) เพราะหลังจากตัด Test 20% ออกไปแล้ว ข้อมูลที่เหลือคือ 80% ดังนั้น 25% ของ 80% จึงเท่ากับ 20% ของทั้งหมด",
    ),
    rc(
      "d042-rc-3",
      "ทำไมห้ามใช้ Random Split กับข้อมูลที่เรียงตามเวลา (Time-Series / Log รายวัน)?",
      "เพราะจะทำให้ข้อมูลในอนาคตไปอยู่ในชุด Train และข้อมูลในอดีตไปอยู่ในชุด Test โมเดลจึงเหมือนแอบดูอนาคต ทำให้คะแนนทดสอบสูงเกินจริงแต่ทายวันพรุ่งนี้ไม่ได้",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Common Pitfalls & Data Leakage", href: "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage" },
    { label: "scikit-learn API Reference — train_test_split", href: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html" },
    { label: "scikit-learn API Reference — GroupShuffleSplit", href: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupShuffleSplit.html" },
    { label: "scikit-learn User Guide — Cross-validation & Splitting", href: "https://scikit-learn.org/stable/modules/cross_validation.html" },
  ],

  glossary: [
    "data-leakage",
    "sklearn-pipeline",
    "cross-validation",
    "precision-recall",
    "tfidf",
    "reproducibility",
    "pytest",
  ],
});
