import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D047 — Phase 2 / Block B12
 * Gradient Boosting for Tabular Data with LightGBM
 */
export const d047: Lesson = defineLesson({
  day: 47,
  titleTh: "เทรนโมเดลข้อมูลตารางระดับโปรดักชันด้วย LightGBM (Gradient Boosting)",
  tagline: "30 นาที · รันบน CPU 100% ไม่ใช้ API key · เข้าใจวิธีที่ต้นไม้ทีละต้นแก้ Residual และคุม Overfitting ด้วย Early Stopping",
  icon: "git-merge",
  visual: {
    id: "lightgbm-boosting",
    title: "LightGBM Gradient Boosting — ต้นไม้แต่ละต้นช่วยกันแก้ความผิดพลาด (Residuals)",
    caption: "กดเดินทีละต้นไม้ (Tree 1 → Tree 2 → Tree 3) เพื่อดูค่าความคลาดเคลื่อนที่ค่อย ๆ หดเล็กลง",
    alt: "แผนภาพการทำงานของ Gradient Boosting ด้วย LightGBM ทีละต้นไม้",
  },
  requiresApiKey: false,
  tools: ["LightGBM", "scikit-learn", "NumPy", "uv", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รับข้อมูลตารางที่มีความสัมพันธ์ซับซ้อนและค่าว่าง",
      body: "ข้อมูลธุรกิจในโลกจริง เช่น ประวัติลูกค้า ยอดซื้อ เวลารอตอบ และจำนวนทิกเก็ตซ้ำ มักมีทั้งความสัมพันธ์ไม่เป็นเชิงเส้น (non-linear) และมีค่าว่าง (`NaN`) ปะปนอยู่เสมอ",
      lessonNote: "{{lightgbm}} รับมือ `NaN` ได้โดยตรง (native missing-value split) และไม่ต้องทำ feature scaling อย่าง `StandardScaler` เหมือนโมเดลเชิงเส้น",
    },
    {
      node: 2,
      heading: "สร้างโมเดลที่แม่น เร็ว และคุ้มค่ากว่า LLM บนงานตาราง",
      body: "เมื่อข้อมูลเป็นตารางตัวเลขและหมวดหมู่ (เช่น ทำนาย churn, จัดลำดับทิกเก็ตด่วน, คาดการณ์เวลาปิดงาน) Gradient Boosted Decision Trees อย่าง {{lightgbm}} ชนะทั้ง Logistic Regression เรื่องความแม่นยำ และชนะ {{llm}} ทั้งความเร็วและต้นทุนหลายร้อยเท่า",
      lessonNote: "วันนี้เราสร้างและปรับจูน `LGBMClassifier` ด้วยปุ่มควบคุมหลักที่คุม Overfitting ได้จริง",
    },
    {
      node: 3,
      heading: "คุมการเทรนด้วย Early Stopping บน Validation Set",
      body: "การเพิ่มจำนวนต้นไม้ไปเรื่อย ๆ จะทำให้โมเดลเริ่มจำข้อมูลชุด Train (Overfit) และคะแนนบนข้อมูลใหม่ตกลง การใช้ `eval_set` + `early_stopping` บนชุด Validation ช่วยหยุดในรอบที่ดีที่สุดโดยอัตโนมัติ",
      lessonNote: "วัดผลด้วย {{precision-recall|PR-AUC}} บน Validation set ระหว่างเทรน และห้ามนำชุด Test เข้า `eval_set` เพื่อป้องกัน {{data-leakage}}",
    },
    {
      node: 4,
      heading: "พร้อมส่งออกสู่ระบบจริงด้วย Latency ระดับมิลลิวินาที",
      body: "โมเดล LightGBM ขนาด 100–300 ต้นไม้ใช้ไฟล์ไม่กี่ร้อย KB และทำนาย 1 แถวบน CPU เสร็จใน < 2 มิลลิวินาที จึงเสียบเข้า API หรือ microservice ได้โดยไม่ต้องใช้ GPU",
      lessonNote: "ต่อยอดไปสู่การจูน Threshold ใน Day 48 และการส่งออก {{onnx}} / `joblib` ใน Day 53",
    },
  ],

  objectives: [
    "**อธิบายหลักการทำงานของ Gradient Boosting** (ต้นไม้ทีละต้นช่วยกันแก้ความผิดพลาดของชุดต้นไม้ก่อนหน้า) และเหตุผลที่ {{lightgbm}} ครองแชมป์งานข้อมูลตาราง",
    "**เลือกปรับ Hyperparameter หลักของ LightGBM** (`n_estimators`, `learning_rate`, `num_leaves`, `min_child_samples`, `class_weight`) อย่างมีเหตุผลเพื่อคุม Overfitting และรับมือข้อมูลไม่สมดุล",
    "**ใช้ Early Stopping บน Validation Set** (`eval_set` + `lgb.early_stopping`) ร่วมกับ `average_precision` โดยไม่ทำให้เกิด {{data-leakage}} จากชุด Test",
  ],

  prerequisites: [
    "ผ่าน Day 42 (Train/Val/Test split) และ Day 43 (Baseline Classifier ด้วย `scikit-learn`)",
    "ผ่าน Day 45 (PR-AUC สำหรับข้อมูลไม่สมดุล) และ Day 46 (แนวคิด Residual)",
    "ใช้ `uv` และ `pytest` ได้คล่อง",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key หรือ GPU",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่ด้วย `uv` แล้วติดตั้ง `lightgbm` ร่วมกับ `scikit-learn`, `numpy` และ {{pytest}} (LightGBM มี wheel สำเร็จรูปบน Windows/macOS/Linux ติดตั้งเสร็จในไม่กี่วินาที)",
    commands: `uv init ai-day47 && cd ai-day47
uv add lightgbm scikit-learn numpy
uv add --dev pytest ruff
uv run python -c "import lightgbm as lgb; print('LightGBM:', lgb.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day47` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `lightgbm`, `scikit-learn`, `numpy`, `pytest`, `ruff` ผ่าน `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็น `LightGBM: 4.x` โดยไม่มี error"],
    ],
    note: "หากใช้ macOS Apple Silicon และพบ error เกี่ยวกับ `libomp` ให้ติดตั้งผ่าน `brew install libomp` ครั้งเดียว (บน Windows/Linux ใช้ได้ทันที)",
  },

  concepts: [
    {
      id: "why-gbdt-wins-tabular",
      title: "1 · ทำไม LightGBM (Gradient Boosting) ถึงครองแชมป์งานข้อมูลตาราง",
      paragraphs: [
        "โมเดลเชิงเส้นอย่าง `LogisticRegression` (Day 43) เรียนรู้เส้นตรงเพียงเส้นเดียว — หากเงื่อนไขที่ทำให้ทิกเก็ตด่วนจริงคือ *\"ลูกค้าเป็น VIP **และ** รอนานเกิน 30 นาที **หรือ** เปิดทิกเก็ตซ้ำเกิน 2 ครั้งในสัปดาห์เดียว\"* โมเดลเชิงเส้นจะจับความสัมพันธ์แบบโต้ตอบไม่เป็นเชิงเส้น (non-linear interaction) เหล่านี้ได้ยากมากหากเราไม่นั่งสร้างฟีเจอร์คูณกันเองทีละคู่",
        "**Gradient Boosted Decision Trees (GBDT)** แก้ปัญหานี้ด้วยการต่อ **ต้นไม้ตัดสินใจขนาดเล็กทีละต้นตามลำดับ (sequential boosting)**: ต้นไม้ที่ 1 ทำนายคร่าว ๆ ก่อน แล้วดูว่าพลาดตรงไหน (residual/gradient จาก Day 46) → ต้นไม้ที่ 2 ถูกเทรนขึ้นมาเพื่อ *แก้ความผิดพลาดของต้นที่ 1* → ต้นไม้ที่ 3 แก้ความผิดพลาดที่ยังเหลืออยู่ของต้นที่ 1+2 ต่อไปเรื่อย ๆ",
        "**{{lightgbm}}** (จาก Microsoft) ยกระดับ GBDT ให้เร็วและแม่นขึ้นอีกขั้นด้วย 3 จุดแข็ง: (1) จัดกลุ่มตัวเลขเป็น **Histogram** ทำให้เทรนเร็วกว่า XGBoost รุ่นเก่าหลายเท่า, (2) ขยายกิ่งแบบ **Leaf-wise** (เลือกแตกใบที่ลด loss ได้มากที่สุดก่อน แทนที่จะแตกครบทุกชั้นเท่ากัน) และ (3) **จัดการค่าว่าง (`NaN`) ในตัว** โดยเรียนรู้เองว่าตอนเจอ `NaN` ควรวิ่งไปกิ่งซ้ายหรือกิ่งขวา",
      ],
      analogy:
        "เหมือนทีมแพทย์ตรวจเคสยากเป็นทอด ๆ: หมอคนที่ 1 วินิจฉัยภาพรวมก่อน, หมอคนที่ 2 โฟกัสเฉพาะเคสที่คนแรกยังวินิจฉัยพลาด, หมอคนที่ 3 เก็บรายละเอียดส่วนที่ยังค้างอยู่ — รวมกันแล้วแม่นกว่าหมอคนเดียวมาก",
      bullets: [
        "จับความสัมพันธ์ non-linear และเงื่อนไขแบบ `if A and B` ให้อัตโนมัติโดยไม่ต้องคูณฟีเจอร์เอง",
        "**ไม่ต้องทำ `StandardScaler` หรือ `MinMaxScaler`** เพราะต้นไม้ตัดสินใจใช้แค่ลำดับการเปรียบเทียบ (`x > 30`) ไม่สนสเกล",
        "รองรับ `np.nan` โดยตรง ไม่พังเหมือน `LogisticRegression` (แต่ใน {{sklearn-pipeline}} ร่วมกับโมเดลอื่นยังควรดูแลข้อมูลให้สม่ำเสมอ)",
      ],
      whyTitle: "Why this matters — อย่าใช้ LLM กับงานที่ LightGBM ทำได้ดีกว่าและถูกกว่า 1,000 เท่า",
      whyParagraphs: [
        "งานพยากรณ์ข้อมูลตารางอย่าง churn prediction, fraud scoring, ETA estimation หรือ ticket priority scoring มีปริมาณหลักหมื่นถึงหลักล้านแถวต่อวัน — การยิง {{llm}} ทุกแถวทั้งช้า (1–3 วินาที) และแพงมหาศาล",
        "LightGBM ใช้เวลาเทรนหลักวินาทีบน CPU ทำนายหลักมิลลิวินาที ต้นทุนแทบเป็นศูนย์ และให้ `predict_proba` ที่นำไปจูน threshold ต่อได้แม่นยำ",
      ],
    },
    {
      id: "lightgbm-key-knobs",
      title: "2 · ปุ่มปรับหลัก 5 ตัวของ LightGBM (คุมความเก่ง vs Overfitting)",
      paragraphs: [
        "LightGBM มีพารามิเตอร์นับร้อยตัว แต่ในงานจริง 90% ของผลลัพธ์มาจากปุ่มหลักแค่ **5 ตัว** ที่คุณควรเข้าใจกลไกแทนที่จะสุ่มตัวเลขมั่ว:",
        "จุดที่ต้องระวังเป็นพิเศษของ LightGBM คือการแตกต้นไม้แบบ **Leaf-wise** — แม้จะเรียนรู้รูปแบบซับซ้อนได้เร็วมาก แต่ถ้าข้อมูลชุด Train มีขนาดเล็ก (เช่นไม่กี่พันแถว) แล้วปล่อยค่าเริ่มต้น `num_leaves=31` กับ `min_child_samples=20` ไว้โดยไม่คุม โมเดลจะจำรายละเอียดยิบย่อยของชุด Train จน **Overfit** ได้ง่าย",
      ],
      analogy:
        "เหมือนการขับรถลงเขา: `learning_rate` คือความเร็วรถ (ขับช้าหน่อยแต่หลายโค้ง `n_estimators` ปลอดภัยกว่า), `num_leaves` คือความซับซ้อนของเส้นทาง และ `min_child_samples` คือป้ายห้ามเลี้ยวเข้าซอยตันที่มีข้อมูลน้อยเกินไป",
      bullets: [
        "**`learning_rate`** (เช่น `0.03–0.1`) — ขนาดก้าวที่ต้นไม้แต่ละต้นเข้าไปแก้ความผิดพลาด; ค่าน้อยลงช่วยให้เรียนรู้ละเอียดและเสถียรขึ้นเมื่อใช้คู่กับต้นไม้มากขึ้น",
        "**`n_estimators`** (เช่น `500–2000` เมื่อใช้ร่วมกับ early stopping) — เพดานจำนวนต้นไม้สูงสุด ปล่อยให้ early stopping หยุดเองเมื่อถึงจุดดีที่สุด",
        "**`num_leaves`** (เช่น `15` หรือ `31`; คู่กับ `max_depth`) — คุมความซับซ้อนของแต่ละต้นไม้; ข้อมูลเล็กให้ลดเหลือ `7–15` เพื่อลด Overfit",
        "**`min_child_samples`** (เช่น `20–50`) — จำนวนแถวขั้นต่ำในแต่ละใบ (leaf); เพิ่มค่านี้ขึ้นเมื่อข้อมูลน้อยหรือมี noise เยอะเพื่อไม่ให้สร้างใบเฉพาะกลุ่มจิ๋ว ๆ",
        "**`class_weight=\"balanced\"`** (หรือ `scale_pos_weight`) — ถ่วงน้ำหนักคลาสหายากอัตโนมัติในงานข้อมูลไม่สมดุล (และตั้ง `random_state=42` เสมอเพื่อทำซ้ำได้)",
      ],
      code: {
        language: "python",
        filename: "lgbm_knobs.py",
        code: `import lightgbm as lgb

model = lgb.LGBMClassifier(
    n_estimators=500,          # เพดานสูงสุด ให้ early stopping หยุดเอง
    learning_rate=0.05,        # ก้าวเล็กเพื่อการเรียนรู้ที่นุ่มนวล
    num_leaves=15,             # คุมความซับซ้อนไม่ให้ overfit ข้อมูลขนาดกลาง-เล็ก
    min_child_samples=20,      # ใบหนึ่งต้องมีข้อมูลอย่างน้อย 20 แถว
    class_weight="balanced",   # ช่วยรับมือคลาสเป้าหมายที่หายาก
    random_state=42,
    verbosity=-1,              # ปิด log ยืดยาวตอนเทรน
)`,
        caption: "ชุดค่าเริ่มต้นที่ปลอดภัยสำหรับชุดข้อมูลตารางขนาดเล็กถึงกลาง (~1,000–50,000 แถว)",
      },
      whyTitle: "Why this matters — รู้จักปุ่มน้อยแต่แม่น ดีกว่าสุ่มจูน 30 ตัวแบบไม่รู้ทิศทาง",
      whyParagraphs: [
        "เมื่อเห็นคะแนน Train สูงลิ่วแต่ Validation ตก (Overfitting) คุณจะรู้ทันทีว่าต้อง **ลด `num_leaves`**, **เพิ่ม `min_child_samples`**, หรือเพิ่ม `colsample_bytree` / `subsample` แทนที่จะเดาสุ่ม",
        "ใน Day 51 เราจะนำปุ่มเหล่านี้ไปค้นหาอย่างเป็นระบบด้วย {{cross-validation}} (Stratified K-Fold) เพื่อไม่ให้ overfit กับ Validation set ชุดเดียว",
      ],
    },
    {
      id: "early-stopping-validation",
      title: "3 · Early Stopping บน Validation Set — หยุดเทรนก่อนโมเดลจำข้อสอบ",
      paragraphs: [
        "หากเราตั้ง `n_estimators=1000` โดยไม่มีตัวเบรก ในช่วง 100 ต้นแรกความผิดพลาดบนทั้งชุด Train และชุด Validation จะลดลงพร้อมกัน แต่หลังจากนั้นความผิดพลาดบนชุด Train จะลดลงต่อเรื่อย ๆ จนเกือบศูนย์ ขณะที่ความผิดพลาดบนชุด **Validation กลับเริ่มเด้งสูงขึ้น** — จุดเปลี่ยนนั้นคือจุดที่โมเดลเริ่ม Overfit",
        "**Early Stopping** แก้ปัญหานี้โดยส่งชุด Validation เข้าไปใน `eval_set=[(X_val, y_val)]` พร้อม `callbacks=[lgb.early_stopping(stopping_rounds=20, verbose=False)]` หากคะแนนบนชุด Validation ไม่ดีขึ้นติดต่อกัน 20 รอบ LightGBM จะหยุดเทรนทันทีและเก็บจำนวนต้นไม้ที่ดีที่สุดไว้ใน `model.best_iteration_`",
        "กฎเหล็กที่ห้ามละเมิดเด็ดขาด: **ห้ามส่ง `X_test, y_test` เข้าไปใน `eval_set`** เพราะทันทีที่โมเดลใช้ชุด Test ตัดสินใจว่าจะหยุดเทรนที่รอบไหน ชุด Test นั้นจะเกิด {{data-leakage}} และไม่ใช่ตัววัดความสามารถจริงอีกต่อไป — ต้องแบ่ง 3 ส่วนเสมอ: **Train** (เทรนต้นไม้) → **Validation** (early stopping + จูนพารามิเตอร์/threshold) → **Test** (วัดผลสุดท้ายครั้งเดียว)",
      ],
      analogy:
        "เหมือนการอบขนมปังที่มีเครื่องวัดอุณหภูมิคอยเช็ก (Validation set): พอสุกกำลังดีแล้วไม่ดีขึ้นอีกก็ปิดเตาทันที (`early_stopping`) ก่อนขนมจะไหม้ (Overfit) — โดยยังเก็บขนมชิ้นสุดท้ายไว้ให้กรรมการตัวจริงชิมทีหลัง (Test set)",
      code: {
        language: "python",
        filename: "early_stopping_demo.py",
        code: `import lightgbm as lgb

# เทรนบน X_train, ให้ early stopping เฝ้าดู X_val เท่านั้น (ห้ามใช้ X_test!)
model.fit(
    X_train,
    y_train,
    eval_set=[(X_val, y_val)],
    eval_metric="average_precision",
    callbacks=[lgb.early_stopping(stopping_rounds=25, verbose=False)],
)
print("Best iteration:", model.best_iteration_)`,
        caption: "ระบุ `eval_metric=\"average_precision\"` เพื่อให้ early stopping เฝ้าดู PR-AUC บนข้อมูลไม่สมดุลโดยตรง",
      },
      whyTitle: "Why this matters — ประหยัดเวลาเทรนและกัน Overfit ได้ใน 3 บรรทัด",
      whyParagraphs: [
        "Early stopping ทำให้คุณไม่ต้องมานั่งเดาว่า `n_estimators` ควรเป็น 80, 150 หรือ 400 แค่ตั้งเพดานสูงพอ (เช่น 500–1000) แล้วให้ Validation metric เป็นคนตัดสิน",
        "ใน LightGBM เวอร์ชัน 4.x พารามิเตอร์เก่า `early_stopping_rounds=...` ใน `.fit()` ถูกถอดออกแล้ว ต้องส่งผ่าน `callbacks=[lgb.early_stopping(...)]` เสมอ — จดจุดนี้ไว้ให้แม่นเพราะโค้ดเก่าบนอินเทอร์เน็ตมักพังตรงนี้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ LightGBM กับ Business Rule Engine ที่เรียนรู้เองได้",
      body: [
        "ถ้าคุณเคยเขียน `if / else` ซ้อนกันหลายชั้นใน backend เพื่อคัดกรองทิกเก็ตด่วนหรือให้คะแนนความเสี่ยง ลองมอง LightGBM เป็นเครื่องสร้างชุดกฎ `if / else` ที่ปรับน้ำหนักอัตโนมัติจากข้อมูลจริง:",
      ],
      table: [
        ["1 Decision Tree", "ชุด `if (wait_min > 30) { ... } else { ... }` หนึ่งชุด"],
        ["Gradient Boosting (100 trees)", "100 กฎย่อยที่แต่ละตัวบวก/ลบคะแนนแก้ส่วนที่กฎก่อนหน้าพลาด"],
        ["Native `NaN` handling", "มีสาขา fallback ให้ค่า `null`/`undefined` อัตโนมัติไม่ crash"],
        ["`early_stopping(25)`", "หยุด loop ทันทีเมื่อ metric บน staging/val ไม่ดีขึ้น 25 รอบติด"],
      ],
    },
    student: {
      title: "First-Year Note — Bagging (Random Forest) vs Boosting (LightGBM) ต่างกันอย่างไร",
      body: [
        "**Random Forest (Bagging)** สร้างต้นไม้หลายร้อยต้น *แยกกันอย่างอิสระ* บนข้อมูลสุ่มแล้วเอามาโหวตเสียงข้างมาก เหมาะกับการลดความแปรปรวนและใช้ง่าย",
        "**Gradient Boosting (LightGBM)** สร้างต้นไม้ *ทีละต้นต่อเนื่องกัน* โดยแต่ละต้นพยายามแก้ความผิดพลาดที่ต้นก่อนหน้าทิ้งไว้ จึงมักให้ความแม่นยำสูงกว่าบนข้อมูลตาราง แต่ก็ต้องคุมด้วย `learning_rate`, `num_leaves` และ `early_stopping` เพื่อไม่ให้ Overfit",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีชุดข้อมูลตารางทิกเก็ตซัพพอร์ต 1,200 ใบที่มีความสัมพันธ์ไม่เป็นเชิงเส้น (ลูกค้า VIP ที่รอนานหรือเปิดทิกเก็ตซ้ำมีโอกาสด่วนสูง) ปนค่าว่าง (`NaN`) และคลาสเป้าหมายไม่สมดุล (~12%) มาลองเทียบ `LogisticRegression` Baseline กับ `LightGBM` + Early Stopping ทีละขั้น",
    steps: [
      {
        title: "1 · สร้างชุดข้อมูลตารางแบบ Non-Linear ปนค่าว่าง และแบ่ง Train / Val / Test (60/20/20)",
        explain:
          "ใช้ `stratify` ทุกครั้งที่แบ่งข้อมูลไม่สมดุล เพื่อให้สัดส่วนคลาสเป้าหมายเท่ากันทั้ง 3 ชุด และจงใจใส่ `np.nan` 5% เพื่อทดสอบการรับมือค่าว่าง",
        code: {
          language: "python",
          filename: "worked_day47.py",
          code: `import numpy as np
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(42)
n = 1200
wait_min = rng.exponential(scale=25.0, size=n)
is_vip = rng.binomial(1, 0.25, size=n).astype(float)
prior_tickets = rng.poisson(lam=1.8, size=n).astype(float)
order_value_thb = rng.lognormal(mean=7.2, sigma=0.8, size=n)

# เงื่อนไขไม่เป็นเชิงเส้น: VIP + รอนาน หรือ ทิกเก็ตซ้ำเยอะ + ยอดสูง
risk_score = (
    ((is_vip == 1) & (wait_min > 30)).astype(float) * 2.4
    + ((prior_tickets >= 3) & (order_value_thb > 2000)).astype(float) * 2.0
    + rng.normal(0, 0.8, size=n)
)
y = (risk_score > 1.8).astype(int)

X = np.column_stack([wait_min, is_vip, prior_tickets, order_value_thb])
# จงใจใส่ค่าว่าง (NaN) 5% ในคอลัมน์ wait_min
missing_mask = rng.random(n) < 0.05
X[missing_mask, 0] = np.nan

X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.20, stratify=y, random_state=42
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42
)
print(f"Split sizes -> Train:{len(y_train)}, Val:{len(y_val)}, Test:{len(y_test)} | Pos rate:{y.mean():.1%}")`,
        },
        output: `Split sizes -> Train:720, Val:240, Test:240 | Pos rate:12.4%`,
      },
      {
        title: "2 · เทรน LightGBM พร้อม Early Stopping บน Validation Set แล้วเทียบกับ Logistic Regression",
        explain:
          "สังเกตว่า `LogisticRegression` ต้องห่อด้วย `SimpleImputer` + `StandardScaler` ใน Pipeline ส่วน `LGBMClassifier` รับเมทริกซ์ที่มี `NaN` ได้ทันทีและหยุดเทรนเองด้วย `lgb.early_stopping`",
        code: {
          language: "python",
          filename: "worked_day47.py",
          code: `import lightgbm as lgb
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Baseline จาก Block B11
logreg = make_pipeline(
    SimpleImputer(strategy="median"),
    StandardScaler(),
    LogisticRegression(class_weight="balanced", random_state=42),
)
logreg.fit(X_train, y_train)
val_pr_logreg = average_precision_score(y_val, logreg.predict_proba(X_val)[:, 1])

# LightGBM + Early Stopping (เฝ้าดูเฉพาะ X_val)
gbm = lgb.LGBMClassifier(
    n_estimators=500,
    learning_rate=0.05,
    num_leaves=15,
    min_child_samples=20,
    class_weight="balanced",
    random_state=42,
    verbosity=-1,
)
gbm.fit(
    X_train,
    y_train,
    eval_set=[(X_val, y_val)],
    eval_metric="average_precision",
    callbacks=[lgb.early_stopping(stopping_rounds=25, verbose=False)],
)
val_pr_gbm = average_precision_score(y_val, gbm.predict_proba(X_val)[:, 1])

print(f"Val PR-AUC (LogReg)  : {val_pr_logreg:.4f}")
print(f"Val PR-AUC (LightGBM): {val_pr_gbm:.4f} (stopped at tree {gbm.best_iteration_})")`,
        },
        output: `Val PR-AUC (LogReg)  : 0.5421
Val PR-AUC (LightGBM): 0.7815 (stopped at tree 48)`,
      },
      {
        title: "3 · ตรวจ Feature Importance และวัดผลบน Test Set ที่ไม่เคยแตะ + Latency บน CPU",
        explain:
          "หลังเลือกโมเดลบนชุด Validation เสร็จแล้ว ค่อยวัดผลครั้งสุดท้ายบนชุด Test พร้อมดูว่าฟีเจอร์ใดมีผลต่อการตัดสินใจมากที่สุด และใช้เวลาทำนายต่อ 1 แถวกี่มิลลิวินาที",
        code: {
          language: "python",
          filename: "worked_day47.py",
          code: `import time

feature_names = ["wait_min", "is_vip", "prior_tickets", "order_value_thb"]
for name, imp in sorted(zip(feature_names, gbm.feature_importances_), key=lambda x: -x[1]):
    print(f"  {name:<16} -> splits: {imp}")

test_pr = average_precision_score(y_test, gbm.predict_proba(X_test)[:, 1])

t0 = time.perf_counter()
_ = gbm.predict_proba(X_test[:1])
latency_ms = (time.perf_counter() - t0) * 1000

print(f"Test PR-AUC (LightGBM): {test_pr:.4f}")
print(f"Single-row CPU latency: {latency_ms:.2f} ms")`,
        },
        output: `  wait_min         -> splits: 184
  order_value_thb  -> splits: 152
  prior_tickets    -> splits: 96
  is_vip           -> splits: 71
Test PR-AUC (LightGBM): 0.7689
Single-row CPU latency: 0.85 ms`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยใน LightGBM v4+: เรียก `gbm.fit(..., early_stopping_rounds=25)` แบบเวอร์ชันเก่าแล้วเจอ `TypeError: LGBMClassifier.fit() got an unexpected keyword argument 'early_stopping_rounds'` — ต้องส่งผ่าน `callbacks=[lgb.early_stopping(25, verbose=False)]` เสมอ!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `lgbm_trainer.py` ที่เทรน `LGBMClassifier` พร้อม Early Stopping บนชุด Validation, ดึง Feature Importance ที่อ่านง่าย และเปรียบเทียบ PR-AUC กับ Baseline โดยไม่แตะชุด Test ระหว่างเทรน",
    requirements: [
      "`train_lgbm_classifier(X_train, y_train, X_val, y_val, *, num_leaves: int = 15, min_child_samples: int = 20, learning_rate: float = 0.05, n_estimators: int = 400, stopping_rounds: int = 20, random_state: int = 42) -> tuple[lgb.LGBMClassifier, float]`: สร้าง `LGBMClassifier` ที่ตั้ง `class_weight=\"balanced\"`, `verbosity=-1`, เทรนด้วย `eval_set=[(X_val, y_val)]`, `eval_metric=\"average_precision\"`, และ `callbacks=[lgb.early_stopping(stopping_rounds, verbose=False)]` แล้วคืน `(fitted_model, val_pr_auc)`",
      "ตรวจสอบอินพุต: หาก `num_leaves < 2` หรือ `stopping_rounds < 1` หรือ `len(X_val) == 0` ให้ `raise ValueError`",
      "`extract_top_features(model: lgb.LGBMClassifier, feature_names: list[str], top_k: int = 3) -> list[tuple[str, int]]`: ตรวจว่าความยาว `feature_names` เท่ากับ `len(model.feature_importances_)` (ไม่งั้น `raise ValueError`) แล้วคืนรายการ `(name, int(importance))` จำนวน `top_k` ตัวที่สูงสุด เรียงจากมากไปน้อย (ถ้าเท่ากันเรียงชื่อ A→Z)",
      "โมเดลต้องรองรับ `X_train` / `X_val` ที่มีค่า `np.nan` ปนอยู่ได้โดยไม่โยน error และต้องหยุดก่อนถึง `n_estimators` เมื่อ Validation ไม่ดีขึ้น (`model.best_iteration_ < n_estimators`)",
    ],
    starter: {
      language: "python",
      filename: "lgbm_trainer.py",
      code: `import lightgbm as lgb
import numpy as np
from sklearn.metrics import average_precision_score


def train_lgbm_classifier(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    *,
    num_leaves: int = 15,
    min_child_samples: int = 20,
    learning_rate: float = 0.05,
    n_estimators: int = 400,
    stopping_rounds: int = 20,
    random_state: int = 42,
) -> tuple[lgb.LGBMClassifier, float]:
    """เทรน LGBMClassifier พร้อม Early Stopping บน Validation Set และคืน (model, val_pr_auc)"""
    # TODO: ตรวจเงื่อนไขพารามิเตอร์และขนาดข้อมูล
    # TODO: เทรน LGBMClassifier ด้วย callbacks=[lgb.early_stopping(...)] แล้วคำนวณ val_pr_auc
    raise NotImplementedError


def extract_top_features(
    model: lgb.LGBMClassifier,
    feature_names: list[str],
    top_k: int = 3,
) -> list[tuple[str, int]]:
    """คืน top_k ฟีเจอร์ที่สำคัญที่สุดเป็น [(name, importance), ...] เรียงจากมากไปน้อย"""
    # TODO: ตรวจความยาว feature_names แล้วเรียง (-importance, name)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day47.py",
      code: `import numpy as np
import pytest
from sklearn.model_selection import train_test_split
from lgbm_trainer import extract_top_features, train_lgbm_classifier


@pytest.fixture
def synthetic_tabular_data():
    rng = np.random.default_rng(7)
    n = 800
    f0 = rng.exponential(20.0, size=n)
    f1 = rng.binomial(1, 0.3, size=n).astype(float)
    f2 = rng.normal(0.0, 1.0, size=n)  # pure noise
    f3 = rng.poisson(2.0, size=n).astype(float)

    score = ((f1 == 1) & (f0 > 22)).astype(float) * 3.0 + (f3 >= 4).astype(float) * 2.0 + rng.normal(0, 0.6, size=n)
    y = (score > 1.8).astype(int)
    X = np.column_stack([f0, f1, f2, f3])
    X[rng.random(n) < 0.05, 0] = np.nan  # ใส่ค่าว่างใน f0

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=7
    )
    return X_train, y_train, X_val, y_val


def test_train_lgbm_handles_nans_and_early_stops(synthetic_tabular_data):
    X_train, y_train, X_val, y_val = synthetic_tabular_data
    model, val_pr = train_lgbm_classifier(
        X_train, y_train, X_val, y_val, n_estimators=400, stopping_rounds=20
    )
    assert val_pr > 0.65
    assert 0 < model.best_iteration_ < 400

    top = extract_top_features(model, ["wait_min", "is_vip", "noise", "prior_tickets"], top_k=2)
    assert len(top) == 2
    assert all(isinstance(score, int) for _, score in top)
    assert top[0][1] >= top[1][1]
    assert "wait_min" in [name for name, _ in top]


def test_validation_guards(synthetic_tabular_data):
    X_train, y_train, X_val, y_val = synthetic_tabular_data
    with pytest.raises(ValueError):
        train_lgbm_classifier(X_train, y_train, X_val, y_val, num_leaves=1)
    with pytest.raises(ValueError):
        train_lgbm_classifier(X_train, y_train, X_val, y_val, stopping_rounds=0)

    model, _ = train_lgbm_classifier(X_train, y_train, X_val, y_val, n_estimators=50)
    with pytest.raises(ValueError):
        extract_top_features(model, ["only_one_name"])
`,
    },
    selfCheck: [
      "`train_lgbm_classifier` ใช้ `callbacks=[lgb.early_stopping(stopping_rounds, verbose=False)]` (ไม่ใช้พารามิเตอร์เก่าที่พังใน LightGBM v4)",
      "โมเดลจัดการ `np.nan` ใน `X_train` และ `X_val` ได้โดยตรงโดยไม่ต้อง impute ก่อน และได้ `val_pr > 0.65`",
      "`model.best_iteration_` หยุดจริงก่อนถึง `n_estimators = 400`",
      "`extract_top_features` ตรวจความยาว `feature_names` ตรงกับจำนวนฟีเจอร์จริงและเรียงลำดับคงที่",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านสะอาดไม่มี warning",
    ],
    acceptance: "ผ่านทั้ง 2 test functions ใน `test_day47.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ตรวจเงื่อนไข guard clause ด้านบนสุดก่อน: `if num_leaves < 2 or stopping_rounds < 1 or len(X_val) == 0: raise ValueError(...)` และตั้ง `verbosity=-1` ใน `LGBMClassifier` เพื่อไม่ให้ log รกเทอร์มินัล",
      },
      {
        body: "ใช้ `callbacks=[lgb.early_stopping(stopping_rounds=stopping_rounds, verbose=False)]` ใน `model.fit(...)` แล้วคำนวณ `val_pr = float(average_precision_score(y_val, model.predict_proba(X_val)[:, 1]))`",
      },
      {
        body: "โครงของ `train_lgbm_classifier` เสร็จสมบูรณ์ เหลือเติมการตรวจและเรียงลำดับใน `extract_top_features`:",
        code: {
          language: "python",
          filename: "hint_day47.py",
          code: `def train_lgbm_classifier(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    *,
    num_leaves: int = 15,
    min_child_samples: int = 20,
    learning_rate: float = 0.05,
    n_estimators: int = 400,
    stopping_rounds: int = 20,
    random_state: int = 42,
) -> tuple[lgb.LGBMClassifier, float]:
    if num_leaves < 2 or stopping_rounds < 1 or len(X_val) == 0:
        raise ValueError("Invalid hyperparameters or empty validation set")
    model = lgb.LGBMClassifier(
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        num_leaves=num_leaves,
        min_child_samples=min_child_samples,
        class_weight="balanced",
        random_state=random_state,
        verbosity=-1,
    )
    model.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        eval_metric="average_precision",
        callbacks=[lgb.early_stopping(stopping_rounds=stopping_rounds, verbose=False)],
    )
    y_val_prob = model.predict_proba(X_val)[:, 1]
    return model, float(average_precision_score(y_val, y_val_prob))


def extract_top_features(
    model: lgb.LGBMClassifier,
    feature_names: list[str],
    top_k: int = 3,
) -> list[tuple[str, int]]:
    importances = [int(x) for x in model.feature_importances_]
    if len(feature_names) != len(importances):
        raise ValueError("feature_names length mismatch")
    # TODO: จับคู่ zip(feature_names, importances) เรียงด้วย key=lambda item: (-item[1], item[0]) แล้วตัด [:top_k]
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
      title: "ส่งชุด Test เข้าไปใน eval_set ของ Early Stopping",
      symptom: "คะแนน Test ดูดีมากตอนพัฒนา แต่พอขึ้น Production จริงความแม่นยำร่วงหนัก",
      fix: "ส่งเฉพาะ `(X_val, y_val)` เข้า `eval_set` เสมอ — เก็บ `X_test, y_test` ไว้ล็อกตายเพื่อวัดผลสุดท้ายเพียงครั้งเดียวเพื่อป้องกัน {{data-leakage}}",
    },
    {
      title: "ใช้พารามิเตอร์ `early_stopping_rounds=...` แบบเก่าใน LightGBM v4+",
      symptom: "เกิด `TypeError: LGBMClassifier.fit() got an unexpected keyword argument 'early_stopping_rounds'`",
      fix: "ใช้ `callbacks=[lgb.early_stopping(stopping_rounds=20, verbose=False)]` ตาม API ปัจจุบันของ LightGBM v4+",
    },
    {
      title: "ปล่อย `num_leaves` สูงเกินไปกับชุดข้อมูลขนาดเล็ก (< 2,000 แถว)",
      symptom: "Train PR-AUC ขึ้นไปถึง `0.99` แต่ Validation PR-AUC หยุดอยู่ที่ `0.62` (Overfitting รุนแรง)",
      fix: "ลด `num_leaves` ลงเหลือ `7–15`, เพิ่ม `min_child_samples` เป็น `20–50` และใช้ `early_stopping` คู่กันเสมอ",
    },
    {
      title: "ใส่ StandardScaler เพื่อหวังให้ LightGBM แม่นขึ้น",
      symptom: "เสียเวลาและโค้ดซับซ้อนขึ้นโดยคะแนนไม่เปลี่ยน (และอาจทำให้ต้อง impute NaN ก่อนโดยไม่จำเป็น)",
      fix: "ต้นไม้ตัดสินใจดูแค่ลำดับค่า ไม่ได้ใช้ระยะทางแบบ Euclidean จึงไม่ต้อง scale ฟีเจอร์ตัวเลขสำหรับ LightGBM",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d047-q1",
        "หัวใจหลักของการทำงานแบบ **Gradient Boosting** ใน LightGBM คือข้อใด?",
        [
          ["สร้างต้นไม้ 500 ต้นพร้อมกันอย่างอิสระแล้วโหวตเสียงข้างมาก", "นั่นคือ Bagging (Random Forest) ไม่ใช่ Gradient Boosting"],
          ["สร้างต้นไม้ทีละต้นตามลำดับ โดยต้นไม้ถัดไปเรียนรู้เพื่อแก้ความผิดพลาด (residuals/gradients) ที่ชุดต้นไม้ก่อนหน้ายังทำพลาดอยู่", "ถูก — การสะสมต้นไม้ทีละขั้นเพื่อแก้ความผิดพลาดที่เหลืออยู่คือหัวใจของ Gradient Boosting"],
          ["แปลงทุกคอลัมน์เป็นข้อความแล้วส่งให้ LLM ทำนาย", "ผิด — LightGBM เป็น Classical ML ที่รันบนตารางตัวเลข/หมวดหมู่บน CPU โดยตรง"],
          ["ต้องทำ StandardScaler กับทุกคอลัมน์ก่อนเสมอไม่อย่างนั้นโมเดลจะไม่ลู่เข้า", "ผิด — ต้นไม้ตัดสินใจไม่ขึ้นกับสเกลของฟีเจอร์"],
        ],
        "B",
        "Gradient Boosting ฝึกต้นไม้ทีละต้นเพื่อลดความผิดพลาดที่ยังหลงเหลือของชุดต้นไม้ก่อนหน้า ทำให้จับความสัมพันธ์ไม่เป็นเชิงเส้นบนข้อมูลตารางได้ดีมาก",
        "Gradient Boosting ใน LightGBM ต่างจาก Random Forest อย่างไร?",
        "Random Forest สร้างต้นไม้แยกกันอิสระแล้วโหวต (Bagging) ส่วน LightGBM สร้างต้นไม้ทีละต้นต่อเนื่องเพื่อแก้ความผิดพลาดของต้นก่อนหน้า (Boosting)",
      ),
      mc(
        "d047-q2",
        "คุณเทรน `LGBMClassifier` บนชุดข้อมูลทิกเก็ต 1,500 แถว แล้วพบว่า Train PR-AUC = `0.995` แต่ Validation PR-AUC = `0.680` การปรับคู่ใดต่อไปนี้แก้ปัญหานี้ได้ตรงจุดที่สุด?",
        [
          ["เพิ่ม `num_leaves` จาก 31 เป็น 127 และลด `min_child_samples` เหลือ 2", "ตรงกันข้าม — จะยิ่งทำให้ต้นไม้จำข้อสอบ (Overfit) หนักกว่าเดิม"],
          ["ลด `num_leaves` (เช่น เหลือ 15), เพิ่ม `min_child_samples` (เช่น 30–50) และใช้ `early_stopping` บน Validation set", "ถูก — จำกัดความซับซ้อนของแต่ละใบและหยุดเทรนก่อนที่โมเดลจะเริ่มจำ noise ในชุด Train"],
          ["ย้าย `X_test` มารวมใน `X_train` เพื่อให้ข้อมูลเยอะขึ้น", "ผิดร้ายแรง — ทำให้เกิด Data Leakage และไม่มีชุดทดสอบเหลือเลย"],
          ["เปลี่ยน `random_state` ไปเรื่อย ๆ จนกว่า Validation จะขึ้น", "การสุ่ม seed เพื่อเลือกผลที่ดีที่สุดคือการหลอกตัวเอง ไม่ได้แก้ Overfitting"],
        ],
        "B",
        "เมื่อ Train สูงมากแต่ Validation ต่ำแปลว่าเกิด Overfitting — วิธีแก้ตรงจุดใน LightGBM คือลดความซับซ้อนของต้นไม้ (`num_leaves` ลง, `min_child_samples` ขึ้น) และคุมรอบด้วย early stopping",
        "หาก LightGBM เกิด Overfitting (Train สูงมากแต่ Val ต่ำ) ควรปรับพารามิเตอร์หลักตัวใด?",
        "ลด `num_leaves`, เพิ่ม `min_child_samples`, ลด `learning_rate` และใช้ `lgb.early_stopping` บนชุด Validation",
      ),
      mc(
        "d047-q3",
        "ทำไมจึง **ห้าม** ส่ง `(X_test, y_test)` เข้าพารามิเตอร์ `eval_set` ของ `lgb.early_stopping`?",
        [
          ["เพราะ LightGBM รองรับเฉพาะข้อมูลที่มีชื่อตัวแปรว่า `X_val` เท่านั้น", "ไม่เกี่ยวกัน — Python ไม่สนชื่อตัวแปร"],
          ["เพราะการให้โมเดลใช้ชุด Test ตัดสินใจว่าจะหยุดเทรนรอบไหน ทำให้ข้อมูล Test รั่วเข้ากระบวนการเทรน (Data Leakage) จนคะแนน Test สูงหลอกตา", "ถูก — `eval_set` คือส่วนหนึ่งของการเลือกโมเดล จึงต้องเป็นชุด Validation เท่านั้น และเก็บ Test ไว้ประเมินครั้งสุดท้าย"],
          ["เพราะ `eval_set` ทำให้โมเดลช้าลง 100 เท่าเมื่อส่งชุด Test", "ไม่จริง — ปัญหาคือเรื่องความถูกต้องทางสถิติ (Data Leakage) ไม่ใช่ความเร็ว"],
          ["เพราะชุด Test ไม่มีคอลัมน์ label `y_test`", "ในการทดลองเรามี `y_test` แต่ต้องล็อกไม่ให้โมเดลเห็นระหว่างเทรนและจูน"],
        ],
        "B",
        "ทุกการตัดสินใจระหว่างเทรน (early stopping, hyperparameter tuning, threshold selection) ต้องใช้ชุด Validation เท่านั้นเพื่อให้ชุด Test เป็นตัวแทนของข้อมูลใหม่จริง ๆ",
        "ทำไม `eval_set` ใน Early Stopping ต้องใช้ Validation Set ห้ามใช้ Test Set?",
        "เพราะการเลือกจุดหยุดเทรนด้วย Test Set ทำให้เกิด Data Leakage จนคะแนนประเมินบน Test สูงเกินจริง",
      ),
      mc(
        "d047-q4",
        "ข้อใดคือจุดแข็งเฉพาะตัวของ **LightGBM** เมื่อเทียบกับ `LogisticRegression` บนข้อมูลตารางที่มีค่าว่าง (`NaN`) และเงื่อนไขโต้ตอบซับซ้อน?",
        [
          ["LightGBM รองรับค่า `NaN` ได้ในตัวและจับความสัมพันธ์ไม่เป็นเชิงเส้น (`if A and B`) ได้อัตโนมัติโดยไม่ต้องทำ Feature Scaling", "ถูก — ต่างจาก LogisticRegression ที่พังเมื่อเจอ `NaN`, ไวต่อสเกล และจับเงื่อนไขโต้ตอบไม่ได้เอง"],
          ["LightGBM ไม่จำเป็นต้องแบ่ง Train/Val/Test split", "ผิด — ทุกโมเดล ML ต้องแบ่ง Train/Val/Test เพื่อกัน Data Leakage"],
          ["LightGBM ตัดคำภาษาไทยได้ในตัวเหมือน PyThaiNLP", "ผิด — LightGBM รับฟีเจอร์ตัวเลข/หมวดหมู่ หากมีข้อความไทยต้องผ่าน PyThaiNLP + TF-IDF (Day 49) ก่อน"],
          ["LightGBM ต้องใช้ GPU เท่านั้นในการเทรนและทำนาย", "ผิด — LightGBM ทำงานเร็วมากบน CPU ปกติ (inference < 2ms)"],
        ],
        "A",
        "LightGBM ออกแบบมาเพื่อข้อมูลตารางโดยเฉพาะ: จัดการค่าว่างอัตโนมัติ, ไม่ต้อง scale ตัวเลข, เรียนรู้ non-linear interactions เอง และรันบน CPU ได้เร็วระดับมิลลิวินาที",
        "สรุป 3 จุดแข็งของ LightGBM เหนือ LogisticRegression บนข้อมูลตาราง?",
        "1) จับความสัมพันธ์ non-linear/interaction อัตโนมัติ, 2) รองรับค่าว่าง `NaN` ในตัว, 3) ไม่ต้องทำ feature scaling และยังรัน CPU เร็วระดับมิลลิวินาที",
      ),
    ],
  },

  takeaways: [
    "**{{lightgbm}} (GBDT)** สร้างต้นไม้ทีละต้นเพื่อแก้ความผิดพลาดที่เหลืออยู่ของชุดต้นไม้ก่อนหน้า จึงจับความสัมพันธ์ไม่เป็นเชิงเส้นบนข้อมูลตารางได้เหนือกว่าโมเดลเชิงเส้นมาก",
    "LightGBM จัดการค่าว่าง (`NaN`) ได้ในตัว, ไม่ต้องทำ feature scaling และทำนายบน CPU เสร็จในระดับ **< 2 มิลลิวินาที**",
    "คุม Overfitting ด้วยปุ่มหลัก: **`learning_rate`**, **`num_leaves`**, **`min_child_samples`**, **`class_weight=\"balanced\"`** และ **`callbacks=[lgb.early_stopping(...)]`**",
    "ส่งเฉพาะ **Validation Set** เข้า `eval_set` เสมอ — เก็บ **Test Set** ไว้ประเมินครั้งสุดท้ายเพื่อป้องกัน {{data-leakage}}",
  ],

  reviewCards: [
    rc(
      "d047-rc-1",
      "วิธีใช้ Early Stopping ที่ถูกต้องใน LightGBM v4+ เขียนอย่างไร และต้องส่งชุดข้อมูลไหนเข้า `eval_set`?",
      "ส่ง `eval_set=[(X_val, y_val)]`, `eval_metric=\"average_precision\"` และ `callbacks=[lgb.early_stopping(stopping_rounds=20, verbose=False)]` — ใช้เฉพาะ Validation Set ห้ามใช้ Test Set",
    ),
    rc(
      "d047-rc-2",
      "พารามิเตอร์ `num_leaves` และ `min_child_samples` ใน LightGBM ควบคุมอะไร?",
      "`num_leaves` จำกัดจำนวนใบสูงสุดต่อต้นไม้ (ยิ่งสูงยิ่งซับซ้อน/เสี่ยง overfit); `min_child_samples` กำหนดจำนวนแถวขั้นต่ำในแต่ละใบ (ยิ่งสูงยิ่งกันไม่ให้จำข้อมูลกลุ่มจิ๋ว)",
    ),
    rc(
      "d047-rc-3",
      "ทำไมงานทำนายตารางอย่าง Churn หรือ Ticket Priority จึงมักใช้ LightGBM แทน LLM?",
      "เพราะ LightGBM จับรูปแบบตัวเลข/หมวดหมู่และค่าว่างได้แม่นยำกว่า รันบน CPU เสร็จใน < 2ms (เร็วกว่า LLM ~1,000x) และต้นทุนต่อการทำนายแทบเป็นศูนย์",
    ),
  ],

  sources: [
    { label: "LightGBM Documentation — Parameters Tuning Guide", href: "https://lightgbm.readthedocs.io/en/latest/Parameters-Tuning.html" },
    { label: "LightGBM Python API — LGBMClassifier", href: "https://lightgbm.readthedocs.io/en/latest/pythonapi/lightgbm.LGBMClassifier.html" },
    { label: "LightGBM Python API — early_stopping Callback", href: "https://lightgbm.readthedocs.io/en/latest/pythonapi/lightgbm.early_stopping.html" },
    { label: "scikit-learn User Guide — Train/Val/Test & Model Selection", href: "https://scikit-learn.org/stable/modules/cross_validation.html" },
  ],

  glossary: [
    "lightgbm",
    "precision-recall",
    "data-leakage",
    "sklearn-pipeline",
    "cross-validation",
    "onnx",
    "llm",
    "pytest",
  ],
});
