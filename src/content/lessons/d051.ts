import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D051 — Phase 2 / Block B13
 * Cross-Validation & Hyperparameter Tuning without Overfitting
 */
export const d051: Lesson = defineLesson({
  day: 51,
  titleTh: "ทำ Cross-Validation และจูน Hyperparameters โดยไม่ Overfit และไม่เกิด Leakage",
  tagline: "30 นาที · รันบน CPU เครื่องคุณ 100% ไม่ต้องใช้ API key · ใช้ StratifiedKFold + GridSearchCV ครอบ Pipeline แล้วจับสัญญาณ Overfit จากช่องว่าง Train vs Val",
  icon: "layers",
  visual: {
    id: "thai-cv-tuning",
    title: "Stratified K-Fold Cross-Validation & Hyperparameter Tuning ไม่ให้ Overfit",
    caption: "กดสลับดูการแบ่ง 5 Folds และเปรียบเทียบช่องว่าง Train vs Val score เมื่อปรับพารามิเตอร์ C และ ngram_range",
    alt: "แผนภาพ 5-Fold Stratified Cross-Validation และกราฟ Overfitting",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP", "scikit-learn", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "แบ่งข้อมูลให้คงสัดส่วนคลาสและกัน Test Set ไว้ต่างหาก",
      body: "การแบ่ง Train/Test แค่ครั้งเดียวบนชุดข้อมูลไม่กี่ร้อยหรือพันแถวทำให้คะแนนแกว่งตามดวง (`random_state`) — แค่เปลี่ยน seed คะแนนอาจกระโดด ±0.08 จนเราเลือกโมเดลผิดตัวได้",
      lessonNote: "ล็อกชุด Test ไว้ด้านนอก แล้วใช้ `StratifiedKFold` แบ่งชุด Train เป็น 5 Folds ที่รักษาสัดส่วนคลาสเท่ากันทุก fold",
    },
    {
      node: 2,
      heading: "จูน Hyperparameters ผ่าน `Pipeline` เท่านั้น",
      body: "เมื่อส่ง {{sklearn-pipeline}} เข้า `cross_validate` หรือ `GridSearchCV` ระบบจะสั่ง `TfidfVectorizer.fit` ใหม่บน 4 folds ของแต่ละรอบอัตโนมัติ — คำศัพท์และค่า IDF ของ Validation fold จึงไม่เคยรั่วเข้าไปตอนเทรน",
      lessonNote: "เรียนรู้ syntax `tfidf__ngram_range`, `tfidf__min_df`, `clf__C` เพื่อจูนทั้งขั้นสกัดฟีเจอร์และขั้นโมเดลไปพร้อมกันอย่างปลอด {{data-leakage}}",
    },
    {
      node: 3,
      heading: "อ่าน `mean ± std` และจับ Overfitting จาก Train vs Val Gap",
      body: "คะแนนเฉลี่ยอย่างเดียวไม่พอ — ถ้า `Train = 0.995` แต่ `Val = 0.780 ± 0.09` นั่นคือสัญญาณชัดเจนว่าโมเดลกำลังท่องจำ (`C` สูงเกินไปหรือฟีเจอร์แตกตัวมากเกินไป)",
      lessonNote: "ใช้ `return_train_score=True` วัดช่องว่าง `train_mean - val_mean` และเลือกโมเดลที่เสถียร (std ต่ำ, gap แคบ) ก่อนพิสูจน์บน Test Set ครั้งเดียว",
    },
    {
      node: 6,
      heading: "วางรากฐานการทดลองที่ทำซ้ำได้ก่อนเทียบ A/B ใน Day 52",
      body: "การทดลอง ML ที่น่าเชื่อถือต้องมี {{reproducibility}} สูง: ล็อก `random_state`, ใช้ CV splits ชุดเดียวกัน, และบันทึกทั้ง `best_params_` กับ `mean ± std`",
      lessonNote: "เทคนิค {{cross-validation}} วันนี้จะเป็นเครื่องมือหลักในรอบทบทวน Day 52 เพื่อพิสูจน์ว่า `PyThaiNLP newmm` ชนะ whitespace split จริง",
    },
  ],

  objectives: [
    "**ประเมินความเสถียรของโมเดลด้วย `StratifiedKFold` และ `cross_validate`** พร้อมอ่านค่า `mean ± std` ของทั้งฝั่ง Train และ Validation เพื่อตรวจจับความแกว่งและภาวะ Overfitting",
    "**รัน `GridSearchCV` / `RandomizedSearchCV` ครอบ {{sklearn-pipeline}}** ด้วยพารามิเตอร์แบบ double-underscore (`tfidf__ngram_range`, `clf__C`) เพื่อให้ TF-IDF ถูก `fit` ใหม่ภายในทุก fold ป้องกัน {{data-leakage}} 100%",
    "**วินิจฉัยปัญหา Underfitting, Overfitting และ Healthy Fit** จากช่องว่าง `train_mean - val_mean` และยืนยันผลของ `best_estimator_` บน Held-out Test Set ที่ไม่เคยแตะเพียงครั้งเดียว",
  ],

  prerequisites: [
    "ผ่าน Day 49–50: สร้าง {{pythainlp}} + {{tfidf}} + `LogisticRegression` ใน {{sklearn-pipeline}} ได้แล้ว",
    "ผ่าน Day 42 & Day 45: เข้าใจ {{data-leakage}} และ {{precision-recall|Macro-F1}}",
    "มี `pythainlp`, `scikit-learn`, `numpy`, {{pytest}} และ `ruff` พร้อมรันผ่าน `uv`",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งาน Day 51 ด้วย `uv` (หรือต่อยอดจากสภาพแวดล้อม Day 50) แล้วตรวจสอบว่า `pythainlp` และ `scikit-learn` พร้อมรัน {{cross-validation}}",
    commands: `uv init ai-day51 && cd ai-day51
uv add pythainlp scikit-learn numpy
uv add --dev pytest ruff
uv run python -c "from sklearn.model_selection import StratifiedKFold, GridSearchCV; print('CV Tools Ready!')"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day51` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pythainlp`, `scikit-learn`, `numpy`, `pytest`, `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งนำเข้า `StratifiedKFold` และ `GridSearchCV` แล้วเห็น `CV Tools Ready!`"],
    ],
    note: "การรัน 5-Fold GridSearchCV บนข้อมูลข้อความขนาดเล็ก-กลางในบทนี้ใช้เวลาเพียง ~1–3 วินาทีบน CPU",
  },

  concepts: [
    {
      id: "stratified-kfold-cv",
      title: "1 · Stratified K-Fold Cross-Validation: เลิกพึ่งดวงจากการสุ่มแบ่งครั้งเดียว",
      paragraphs: [
        "เมื่อคุณมีชุดข้อมูลทิกเก็ตที่ติดป้ายแล้วไม่กี่ร้อยถึงไม่กี่พันใบ การใช้ `train_test_split` เพียงครั้งเดียวมีความเสี่ยงสูงที่ชุด Validation จะบังเอิญได้แต่ประโยคง่าย (หรือบังเอิญรวมเคสยากไว้หมด) จนคะแนนเพี้ยนไปตาม `random_state`",
        "**{{cross-validation}} แบบ Stratified K-Fold** (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`) แก้ปัญหานี้ด้วยการแบ่งชุด Train ออกเป็น 5 ส่วนเท่า ๆ กันโดย **รักษาสัดส่วนของทุกคลาสให้เท่าเดิมในทุก fold** จากนั้นวนเทรน 5 รอบ — ทุกรอบใช้ 4 folds เทรนและ 1 fold วัดผล จนครบทุกข้อมูลได้ทำหน้าที่เป็น Validation อย่างละ 1 ครั้งพอดี",
        "ผลลัพธ์ที่ได้ไม่ใช่ตัวเลขเดี่ยว แต่คือ **`mean ± std`** (เช่น `Macro-F1 = 0.892 ± 0.024`): ค่า `mean` บอกความแม่นยำเฉลี่ย ส่วนค่า `std` บอก **ความเสถียร** — โมเดลที่ได้ `0.88 ± 0.02` มักน่าไว้ใจกว่าโมเดลที่ได้ `0.89 ± 0.11` เพราะแกว่งน้อยกว่าเมื่อเจอข้อมูลชุดใหม่",
      ],
      analogy:
        "เหมือนการชิมต้มยำหม้อใหญ่ 5 ช้อนจากคนละมุมหม้อ (5 Folds) แทนที่จะตักชิมแค่ช้อนเดียว — คุณจะรู้ทั้งรสชาติเฉลี่ย (mean) และรู้ว่าปรุงเข้ากันสม่ำเสมอหรือเค็มเป็นหย่อม ๆ (std)",
      bullets: [
        "**`StratifiedKFold`** — ใช้กับงาน Classification เสมอ (โดยเฉพาะข้อมูลไม่สมดุล) เพื่อไม่ให้ fold ใดขาดคลาสหายาก",
        "**`shuffle=True, random_state=42`** — ต้องเปิด `shuffle=True` เสมอหากข้อมูลต้นทางเรียงตามหมวดหมู่หรือวันที่ (แต่ถ้าข้อมูลเป็น Time-Series ให้ใช้ `TimeSeriesSplit` แทน!)",
        "**ล็อก Held-out Test Set ไว้นอก CV** — ทำ CV เฉพาะบน `X_train` เพื่อเลือกพารามิเตอร์ แล้วค่อยทดสอบตัวชนะเลิศบน `X_test` เพียงครั้งเดียวตอนจบ",
      ],
      code: {
        language: "python",
        filename: "cv_stability_demo.py",
        code: `from sklearn.model_selection import StratifiedKFold, cross_validate

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_validate(
    pipe,
    X_train,
    y_train,
    cv=cv,
    scoring="f1_macro",
    return_train_score=True,
)
print(f"Train Macro-F1: {scores['train_score'].mean():.3f} ± {scores['train_score'].std():.3f}")
print(f"Val   Macro-F1: {scores['test_score'].mean():.3f} ± {scores['test_score'].std():.3f}")`,
        caption: "`cross_validate(..., return_train_score=True)` ให้ทั้งคะแนนฝั่ง Train และ Val ของทุก fold ในคำสั่งเดียว",
      },
      whyTitle: "Why this matters — ป้องกันการเลือกโมเดลผิดเพราะโชคดีใน Split เดียว",
      whyParagraphs: [
        "บ่อยครั้งที่วิศวกรลองปรับพารามิเตอร์แล้วเห็นคะแนนบน single split เพิ่มขึ้น `+0.02` จึงดีใจและขึ้น Production แต่พอเช็ก 5-Fold CV กลับพบว่า `std` คือ `±0.05` แปลว่า `+0.02` นั้นเป็นแค่เสียงรบกวนทางสถิติ (noise)",
        "การรายงานผลเป็น `mean ± std` บน 5-Fold Stratified CV คือมาตรฐานขั้นต่ำของทีม ML มืออาชีพในการตัดสินใจเปลี่ยนโมเดล",
      ],
    },
    {
      id: "gridsearch-over-pipeline",
      title: "2 · `GridSearchCV` และ `RandomizedSearchCV` ครอบ Pipeline (Zero Leakage!)",
      paragraphs: [
        "ข้อผิดพลาดร้ายแรงที่มือใหม่ทำซ้ำบ่อยที่สุดตอนทำ Cross-Validation กับข้อความคือ: เรียก `X_vec = tfidf.fit_transform(X_train)` **ก่อน** แล้วค่อยส่ง `X_vec` เข้า `GridSearchCV(LogisticRegression(), ...)` — การทำแบบนั้นคือ **{{data-leakage}}** เพราะค่า IDF และคำศัพท์ของ Validation fold ถูกคำนวณปนเข้าไปก่อนแบ่ง fold เรียบร้อยแล้ว!",
        "ทางแก้ที่สะอาดและปลอดภัย 100% คือส่ง **`Pipeline([(\"tfidf\", ...), (\"clf\", ...)])` ทั้งก้อน** เข้าไปใน `GridSearchCV` หรือ `RandomizedSearchCV` โดยอ้างอิงชื่อพารามิเตอร์ของแต่ละขั้นตอนด้วย **double underscore (`__`)** เช่น `tfidf__ngram_range`, `tfidf__min_df`, `clf__C`",
        "เบื้องหลัง scikit-learn จะโคลน Pipeline ใหม่ทุก fold, สั่ง `tfidf.fit_transform` เฉพาะ 4 folds ฝั่งเทรน, สั่ง `tfidf.transform` บน 1 fold ฝั่งตรวจ, และเมื่อพบชุดพารามิเตอร์ที่ให้คะแนน CV สูงสุด จะสั่ง `refit=True` บน `X_train` ทั้งก้อนให้อัตโนมัติเป็น `search.best_estimator_`",
      ],
      analogy:
        "เหมือนการสอบแข่งขัน 5 สนามที่กรรมการสร้างข้อสอบและเฉลยใหม่แยกขาดในแต่ละสนาม (Pipeline อยู่ใน CV) ไม่ใช่แจกคำศัพท์ข้อสอบของทั้ง 5 สนามให้ผู้เข้าสอบท่องล่วงหน้าตั้งแต่สนามแรก",
      bullets: [
        "**`GridSearchCV`** — ลองทุกคู่ผสมใน `param_grid` เหมาะเมื่อจำนวนคู่ผสมไม่มาก (เช่น 10–30 ชุด × 5 folds)",
        "**`RandomizedSearchCV`** — สุ่มลองตามงบ `n_iter` (เช่น 20–40 รอบ) เหมาะเมื่อมีพารามิเตอร์หลายตัวหรือช่วงค่ากว้าง ช่วยประหยัดเวลา CPU มหาศาล",
        "**Double-underscore naming** — รูปแบบคือ `<step_name>__<param_name>` เช่น `tfidf__ngram_range: [(1, 1), (1, 2)]` และ `clf__C: [0.1, 1.0, 10.0]`",
      ],
      code: {
        language: "python",
        filename: "gridsearch_pipeline.py",
        code: `from sklearn.model_selection import GridSearchCV, StratifiedKFold

param_grid = {
    "tfidf__ngram_range": [(1, 1), (1, 2)],
    "tfidf__min_df": [1, 2],
    "clf__C": [0.1, 0.5, 1.0, 5.0, 10.0],
}

search = GridSearchCV(
    estimator=pipe,
    param_grid=param_grid,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="f1_macro",
    return_train_score=True,
    refit=True,
)
search.fit(X_train, y_train)
print("Best params:", search.best_params_)
print(f"Best CV Macro-F1: {search.best_score_:.3f}")`,
        caption: "ส่ง `pipe` เข้า `GridSearchCV` โดยตรง เพื่อให้ `tfidf` ถูก `fit` ใหม่ภายในทุก fold ป้องกัน Data Leakage 100%",
      },
      whyTitle: "Why this matters — จูนทั้ง Feature Engineering และ Model ไปพร้อมกันได้",
      whyParagraphs: [
        "ในงาน NLP ภาษาไทย พารามิเตอร์ของ `TfidfVectorizer` (เช่น `ngram_range`, `min_df`, `sublinear_tf`) มักส่งผลต่อความแม่นยำพอ ๆ กับหรือมากกว่าพารามิเตอร์ `C` ของโมเดลด้วยซ้ำ",
        "การครอบ `Pipeline` ด้วย `GridSearchCV` ทำให้คุณทดสอบคำถามเชิงประจักษ์อย่าง *\"คำคู่ (1, 2) ช่วยเพิ่ม Macro-F1 มากกว่าคำเดี่ยว (1, 1) จริงไหม?\"* ได้อย่างซื่อสัตย์ในไม่กี่บรรทัด",
      ],
    },
    {
      id: "spotting-overfitting-train-vs-val",
      title: "3 · อ่านช่องว่าง `Train vs Val` และเข้าใจพารามิเตอร์ `C` เพื่อคุม Overfitting",
      paragraphs: [
        "ใน `LogisticRegression` พารามิเตอร์ **`C`** คือ **ส่วนกลับของความแรง Regularization (`C = 1 / λ`)** — พูดง่าย ๆ คือ **`C` เล็ก (เช่น `0.05–0.2`) = คุมเข้ม** (กดน้ำหนักคำไม่ให้พุ่งสูง กันการท่องจำ แต่ถ้าเล็กเกินอาจ Underfit), ส่วน **`C` ใหญ่ (เช่น `20–100`) = ปล่อยอิสระ** (ยอมให้โมเดลจำรายละเอียดชุดเทรนเต็มที่ เสี่ยง Overfit สูง)",
        "วิธีจับอาการ Overfitting ที่แม่นยำที่สุดคือดูผลจาก `search.cv_results_` โดยเทียบ `mean_train_score` กับ `mean_test_score` (ซึ่งใน scikit-learn หมายถึง Validation fold score!):",
        "ถ้า **Train ต่ำและ Val ต่ำคู่กัน** (เช่น `0.58` vs `0.55`) = **Underfitting** (โมเดลแข็งเกินไป เช่น `C` เล็กเกิน หรือฟีเจอร์ไม่พอ); ถ้า **Train พุ่งสูงมากแต่ Val ทิ้งห่าง** (เช่น `0.99` vs `0.76`, gap = `0.23`) = **Overfitting** (โมเดลกำลังท่องจำชุดเทรน ให้ลด `C`, เพิ่ม `min_df`, หรือลด `max_features`); และถ้า **Train กับ Val สูงใกล้กัน** (เช่น `0.93` vs `0.89`, gap = `0.04`) = **Healthy Generalization**",
      ],
      analogy:
        "นักเรียนที่ท่องจำเฉลยแบบฝึกหัดทุกบรรทัดจะได้คะแนนการบ้าน 99% (Train) แต่พอเจอข้อสอบจริงที่สลับคำนิดเดียวได้ 72% (Val) — นั่นคือ Overfitting ส่วน Regularization (`C` ที่พอดี) เหมือนการบังคับให้สรุปหลักการสำคัญแทนการท่องจำ",
      bullets: [
        "**Underfitting**: `train < 0.65` และ `val < 0.65` → เพิ่ม `C`, ลอง `ngram_range=(1, 2)`, หรือเพิ่มคำเฉพาะใน `custom_dict`",
        "**Overfitting**: `train - val > 0.12` (โดยเฉพาะเมื่อ `C` สูงมาก) → ลด `C` (เช่น `0.5` หรือ `1.0`), ตั้ง `min_df=2`, หรือเพิ่มข้อมูลเทรน",
        "**กับดักชื่อคอลัมน์ใน `cv_results_`**: คีย์ `mean_test_score` ใน `GridSearchCV` คือคะแนนบน **Validation folds** ไม่ใช่ Held-out Test Set อย่าสับสน!",
      ],
      whyTitle: "Why this matters — ป้องกันโมเดลที่ 'เก่งแต่ในห้องแล็บ แต่พังเมื่อเจอลูกค้าจริง'",
      whyParagraphs: [
        "ในชุดข้อมูลข้อความภาษาไทยที่มีคำศัพท์เยอะแต่จำนวนตัวอย่างจำกัด (เช่น 200–2,000 ทิกเก็ต) โมเดลมักดัน Train score ขึ้นไปแตะ `0.98–1.00` ได้ง่ายมาก",
        "การตรวจสอบ `overfit_gap = train_mean - val_mean` และ `std` ของ CV folds เป็นวินัยที่ช่วยคัดเลือกโมเดลที่รับมือกับภาษาพิมพ์หลากหลายของลูกค้าจริงได้ดีที่สุด",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Cross-Validation & GridSearch กับ Automated Benchmarking",
      body: [
        "มอง `StratifiedKFold` + `GridSearchCV` เหมือนการรัน Load Test Matrix หลายชุด config บน staging environments ที่แยกข้อมูลขาดจากกัน:",
      ],
      table: [
        ["`StratifiedKFold(n_splits=5)`", "รันเทสต์บน 5 data shards ที่มีสัดส่วน traffic เท่ากัน"],
        ["`mean ± std`", "รายงานทั้งค่าเฉลี่ยและ jitter/variance ไม่ใช่ดูแค่ 1 run"],
        ["`GridSearchCV(pipe, param_grid)`", "Matrix CI job ลองทุกชุด config แบบอัตโนมัติ"],
        ["`train_score - val_score`", "เช็กว่า config ใหม่ไม่ได้แค่จำ fixture แต่ทำงานกับข้อมูลใหม่ได้จริง"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม `C` เล็กถึงคุมเข้ม แต่ `C` ใหญ่ถึงเสี่ยง Overfit?",
      body: [
        "หลายคนจำสลับเพราะนึกว่า `C` คือค่าปรับ (penalty) — ความจริงใน `scikit-learn` `C` คือ **ส่วนกลับของค่าปรับ (`C = 1 / penalty`)**",
        "จำง่าย ๆ ว่า **`C` = ความใจกว้าง (Capacity / Freedom)**: `C` น้อย (`0.01`) = ครูเข้มงวด ห้ามจำปลีกย่อย; `C` มาก (`100.0`) = ปล่อยฟรีเต็มที่ ยอมให้จำทุกคำในชุดฝึกจนอาจ Overfit",
        "ดังนั้นเวลาไล่จูน `clf__C` เรามักตั้งสเกลแบบทวีคูณ (logarithmic grid) เช่น `[0.05, 0.2, 1.0, 5.0, 20.0]` แทนที่จะไล่ทีละ `1, 2, 3, 4`",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีชุดทิกเก็ตภาษาไทย 3 หมวด (`billing`, `delivery`, `technical`) แบ่ง Held-out Test Set 25% ล็อกไว้ก่อน จากนั้นใช้ `StratifiedKFold` 5 Folds และ `GridSearchCV` ครอบ `Pipeline` เพื่อเทียบ Train vs Val score เมื่อเปลี่ยนค่า `clf__C` และ `tfidf__ngram_range`",
    steps: [
      {
        title: "1 · แยก Held-out Test Set ล็อกไว้ แล้ววัดเสถียรภาพ Baseline ด้วย 5-Fold CV",
        explain:
          "ใช้ `cross_validate(..., return_train_score=True)` บน `X_train` เท่านั้น (ไม่แตะ `X_test`) เพื่อดูทั้ง `train_mean`, `val_mean`, `val_std` และ `overfit_gap`",
        code: {
          language: "python",
          filename: "worked_day51.py",
          code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline

TRIE = dict_trie(set(thai_words()) | {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"})
STOP = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "เลย"}


def thai_tokenize(text: str) -> list[str]:
    toks = word_tokenize(text, engine="newmm", custom_dict=TRIE, keep_whitespace=False)
    return [t.lower() for t in toks if t.strip() and t.lower() not in STOP]


# สมมติโหลด texts, labels จำนวน 60 ทิกเก็ต (หมวดละ 20 ใบ)
X_tr, X_te, y_tr, y_te = train_test_split(texts, labels, test_size=0.25, stratify=labels, random_state=42)

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(tokenizer=thai_tokenize, token_pattern=None, lowercase=False, sublinear_tf=True)),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)),
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_res = cross_validate(pipe, X_tr, y_tr, cv=cv, scoring="f1_macro", return_train_score=True)
print(f"5-Fold Train: {cv_res['train_score'].mean():.3f} ± {cv_res['train_score'].std():.3f}")
print(f"5-Fold Val  : {cv_res['test_score'].mean():.3f} ± {cv_res['test_score'].std():.3f}")
print(f"Overfit Gap : {cv_res['train_score'].mean() - cv_res['test_score'].mean():.3f}")`,
        },
        output: `5-Fold Train: 0.994 ± 0.011
5-Fold Val  : 0.911 ± 0.045
Overfit Gap : 0.083`,
      },
      {
        title: "2 · รัน `GridSearchCV` ครอบ Pipeline แล้วเทียบ Train vs Val ของแต่ละชุดพารามิเตอร์",
        explain:
          "ส่อง `cv_results_` เพื่อดูว่าเมื่อปรับ `clf__C` จาก `0.05` (คุมเข้มมาก) ไปจนถึง `20.0` (ปล่อยฟรี) ช่องว่าง Train vs Val เปลี่ยนไปอย่างไร",
        code: {
          language: "python",
          filename: "worked_day51.py",
          code: `from sklearn.model_selection import GridSearchCV

param_grid = {
    "tfidf__ngram_range": [(1, 1), (1, 2)],
    "clf__C": [0.05, 0.5, 1.0, 10.0],
}
search = GridSearchCV(
    estimator=pipe,
    param_grid=param_grid,
    cv=cv,
    scoring="f1_macro",
    return_train_score=True,
    refit=True,
)
search.fit(X_tr, y_tr)

res = search.cv_results_
for i in range(len(res["params"])):
    tr_m = res["mean_train_score"][i]
    va_m = res["mean_test_score"][i]
    va_s = res["std_test_score"][i]
    print(f"{str(res['params'][i]):52s} | train={tr_m:.3f} | val={va_m:.3f}±{va_s:.3f} | gap={tr_m - va_m:.3f}")`,
        },
        output: `{'clf__C': 0.05, 'tfidf__ngram_range': (1, 1)}       | train=0.882 | val=0.844±0.052 | gap=0.038
{'clf__C': 0.5, 'tfidf__ngram_range': (1, 1)}        | train=0.978 | val=0.911±0.045 | gap=0.067
{'clf__C': 1.0, 'tfidf__ngram_range': (1, 2)}        | train=0.994 | val=0.933±0.042 | gap=0.061
{'clf__C': 10.0, 'tfidf__ngram_range': (1, 2)}       | train=1.000 | val=0.889±0.068 | gap=0.111`,
      },
      {
        title: "3 · นำ `best_estimator_` ไปยืนยันบน Held-out Test Set เพียงครั้งเดียว",
        explain:
          "สังเกตว่าที่ `C=10.0` Train แตะ `1.000` แต่ Val กลับตกลงและ `std` กว้างขึ้น (สัญญาณ Overfitting!) ขณะที่ `C=1.0, ngram_range=(1, 2)` ได้ Val สูงสุดและเสถียรที่สุด — เราจึงนำ `search.best_estimator_` ไปวัดบน `X_te` ครั้งเดียว",
        code: {
          language: "python",
          filename: "worked_day51.py",
          code: `from sklearn.metrics import f1_score

best_model = search.best_estimator_
test_f1 = f1_score(y_te, best_model.predict(X_te), average="macro")
print("Best Params     :", search.best_params_)
print(f"Best CV Macro-F1: {search.best_score_:.3f}")
print(f"Held-out Test F1: {test_f1:.3f}")`,
        },
        output: `Best Params     : {'clf__C': 1.0, 'tfidf__ngram_range': (1, 2)}
Best CV Macro-F1: 0.933
Held-out Test F1: 0.933`,
      },
    ],
    gotcha:
      "จุดสังเกตสำคัญ: หากคุณส่ง `n_jobs=-1` เข้า `GridSearchCV` พร้อม tokenizer ที่เป็นฟังก์ชัน local closure ข้างในฟังก์ชันอื่น `joblib` อาจโยน `PicklingError` บน Windows/macOS — ให้ประกาศ `thai_tokenize` เป็น top-level function หรือ callable class ระดับโมดูลเสมอ (หรือใช้ `n_jobs=1` สำหรับชุดข้อมูลขนาดเล็ก)",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `exercise_day51.py` เพื่อทำ Stratified K-Fold Cross-Validation, จูนพารามิเตอร์ `Pipeline` ด้วย `GridSearchCV` แบบปลอด Data Leakage, และวินิจฉัยสถานะ Overfitting / Underfitting จากช่องว่าง Train vs Val",
    requirements: [
      "ประกาศตัวตัดคำภาษาไทยแบบ top-level callable (`ThaiTokenizer` class หรือฟังก์ชันระดับโมดูล) เพื่อให้รองรับการโคลนและ serialization ใน `GridSearchCV` ได้สะอาดโดยไม่เกิด warning",
      "`evaluate_cv_stability(pipeline: Pipeline, texts: list[str], labels: list[str], n_splits: int = 5, scoring: str = \"f1_macro\", random_state: int = 42) -> dict`: ใช้ `StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)` ร่วมกับ `cross_validate(..., return_train_score=True)` แล้วคืน dict 6 คีย์: `train_mean`, `train_std`, `val_mean`, `val_std`, `overfit_gap` (`train_mean - val_mean`), `val_fold_scores` (list ของ float ยาวเท่ากับ `n_splits`)",
      "`tune_thai_classifier_cv(base_pipeline: Pipeline, X_train: list[str], y_train: list[str], param_grid: dict, n_splits: int = 5, scoring: str = \"f1_macro\", random_state: int = 42) -> dict`: รัน `GridSearchCV` ครอบ `base_pipeline` ด้วย `StratifiedKFold` (`return_train_score=True, refit=True`) แล้วคืน dict 6 คีย์: `best_estimator`, `best_params`, `best_cv_mean`, `best_cv_std`, `best_train_mean`, `overfit_gap` (ดึง `best_cv_std` และ `best_train_mean` จากตำแหน่ง `search.best_index_` ใน `search.cv_results_`)",
      "`diagnose_overfitting(train_score: float, val_score: float, gap_threshold: float = 0.12, underfit_threshold: float = 0.65) -> str`: คืน `\"underfitting\"` เมื่อทั้ง `train_score < underfit_threshold` และ `val_score < underfit_threshold`, คืน `\"overfitting\"` เมื่อ `(train_score - val_score) > gap_threshold`, มิฉะนั้นคืน `\"healthy\"`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day51.py",
      code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline


class ThaiTokenizer:
    """Top-level callable tokenizer สำหรับ PyThaiNLP newmm + custom dict (pickle-safe)"""

    def __init__(
        self,
        custom_words: set[str] | None = None,
        stopwords: set[str] | None = None,
    ) -> None:
        self.custom_words = set(custom_words or set())
        self.stopwords = {w.lower() for w in (stopwords or set())}
        self._trie = dict_trie(set(thai_words()) | self.custom_words)

    def __call__(self, text: str) -> list[str]:
        tokens = word_tokenize(
            text,
            engine="newmm",
            custom_dict=self._trie,
            keep_whitespace=False,
        )
        return [t.lower() for t in tokens if t.strip() and t.lower() not in self.stopwords]


def build_base_pipeline(
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
) -> Pipeline:
    """สร้าง Pipeline ตั้งต้นสำหรับส่งเข้า CV และ GridSearchCV"""
    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                tokenizer=ThaiTokenizer(custom_words, stopwords),
                token_pattern=None,
                lowercase=False,
                sublinear_tf=True,
            ),
        ),
        (
            "clf",
            LogisticRegression(
                class_weight="balanced",
                max_iter=1000,
                random_state=42,
            ),
        ),
    ])


def evaluate_cv_stability(
    pipeline: Pipeline,
    texts: list[str],
    labels: list[str],
    n_splits: int = 5,
    scoring: str = "f1_macro",
    random_state: int = 42,
) -> dict:
    """ประเมิน 5-Fold Stratified CV และคืน train/val mean, std, overfit_gap, val_fold_scores"""
    # TODO: สร้าง StratifiedKFold และเรียก cross_validate(..., return_train_score=True)
    raise NotImplementedError


def tune_thai_classifier_cv(
    base_pipeline: Pipeline,
    X_train: list[str],
    y_train: list[str],
    param_grid: dict,
    n_splits: int = 5,
    scoring: str = "f1_macro",
    random_state: int = 42,
) -> dict:
    """รัน GridSearchCV ครอบ Pipeline แล้วคืน best_estimator พร้อมสถิติ CV"""
    # TODO: รัน GridSearchCV(..., return_train_score=True, refit=True) แล้วอ่านค่าที่ best_index_
    raise NotImplementedError


def diagnose_overfitting(
    train_score: float,
    val_score: float,
    gap_threshold: float = 0.12,
    underfit_threshold: float = 0.65,
) -> str:
    """จำแนกสถานะเป็น 'underfitting', 'overfitting' หรือ 'healthy'"""
    # TODO: ตรวจเงื่อนไขตามลำดับ underfitting -> overfitting -> healthy
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day51.py",
      code: `import pytest
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from exercise_day51 import (
    build_base_pipeline,
    diagnose_overfitting,
    evaluate_cv_stability,
    tune_thai_classifier_cv,
)

CUSTOM_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"}
STOPWORDS = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "เลย"}

DATASET = [
    ("ขอใบกำกับภาษีเต็มรูปแบบของบิลเดือนนี้ครับ", "billing"),
    ("โอนเงินผ่านพร้อมเพย์แล้วแต่ยอดไม่ตัดค่ะ", "billing"),
    ("บัตรเครดิตถูกหักเงินซ้ำสองรอบ ขอคืนเงินด้วย", "billing"),
    ("ต้องการใบลดหนี้และใบเสร็จรับเงินฉบับใหม่", "billing"),
    ("ชำระผ่าน PromptPay สำเร็จแต่สถานะยังรอชำระ", "billing"),
    ("บิลค่าบริการเดือนนี้คิดยอดเกิน ขอตรวจสอบราคา", "billing"),
    ("ออกใบกำกับภาษีชื่อบริษัทให้หน่อยครับ", "billing"),
    ("ขอคืนเงินค่าสินค้าที่ยกเลิกผ่านพร้อมเพย์", "billing"),
    ("โอนพร้อมเพย์ซ้ำสองครั้ง ขอใบลดหนี้คืนยอด", "billing"),
    ("ใบกำกับภาษีพิมพ์ชื่อผิด ขอแก้ไขบิลใหม่ค่ะ", "billing"),
    ("ขอใบเสร็จค่าบริการย้อนหลังพร้อมใบกำกับภาษี", "billing"),
    ("ยอดชำระบัตรเครดิตหักเกินราคาสินค้า ขอคืนเงิน", "billing"),
    ("ขอเลขพัสดุหน่อยค่ะ สั่งไปสามวันแล้วยังไม่ถึง", "delivery"),
    ("ขนส่งแฟลชเอ็กซ์เพรสส่งของผิดบ้านครับ", "delivery"),
    ("พัสดุค้างอยู่ที่คลังสินค้าตั้งแต่วันจันทร์", "delivery"),
    ("กล่องสินค้าบุบเสียหายจากการจัดส่ง ขอเปลี่ยนชิ้นใหม่", "delivery"),
    ("เช็กสถานะการจัดส่งไม่ได้ เลขพัสดุไม่อัปเดต", "delivery"),
    ("พนักงานส่งของไม่โทรแจ้งก่อนมาส่งพัสดุ", "delivery"),
    ("สั่งส่งด่วนแต่ของยังไม่ออกจากโกดังเลยค่ะ", "delivery"),
    ("ขอเปลี่ยนที่อยู่จัดส่งพัสดุก่อนขนส่งนำจ่าย", "delivery"),
    ("ตามพัสดุแฟลชเอ็กซ์เพรสส่งล่าช้าเกินกำหนด", "delivery"),
    ("เลขพัสดุหายจากหน้าคำสั่งซื้อ เช็กขนส่งไม่ได้", "delivery"),
    ("ขนส่งยังไม่มารับพัสดุจากคลังสินค้าเลยครับ", "delivery"),
    ("พัสดุตีกลับโกดังทั้งที่ที่อยู่จัดส่งถูกต้อง", "delivery"),
    ("เข้าสู่ระบบไม่ได้ รหัส OTP ไม่ส่งเข้ามือถือครับ", "technical"),
    ("แอปเด้งออกเองทุกครั้งตอนกดหน้าชำระเงิน", "technical"),
    ("เว็บขึ้น error 500 โหลดหน้าแดชบอร์ดไม่ขึ้น", "technical"),
    ("ล็อกอินผ่านมือถือค้างหน้าขาว กดรีเซ็ตรหัสผ่านไม่ได้", "technical"),
    ("เชื่อมต่อ API ไม่สำเร็จขึ้น timeout ตลอดค่ะ", "technical"),
    ("อัปเดตแอปเวอร์ชันใหม่แล้วเปิดใช้งานไม่ได้เลย", "technical"),
    ("กดปุ่มส่งฟอร์มแล้วหน้าเว็บค้าง error 502", "technical"),
    ("ระบบแจ้งรหัสผ่านผิดทั้งที่ตั้งรหัสใหม่แล้ว", "technical"),
    ("หน้าล็อกอินหมุนค้างส่ง OTP ไม่เข้าเบอร์มือถือ", "technical"),
    ("เรียก API แล้วค้าง error timeout บนแอปมือถือ", "technical"),
    ("กดเข้าสู่ระบบบนเว็บแล้วขึ้น error 503 ตลอด", "technical"),
    ("แอปมือถือค้างหลังอัปเดตและล็อกอินด้วย OTP ไม่ได้", "technical"),
]


def test_evaluate_cv_stability_returns_expected_stats():
    texts = [t for t, _ in DATASET]
    labels = [y for _, y in DATASET]
    pipe = build_base_pipeline(CUSTOM_WORDS, STOPWORDS)

    res = evaluate_cv_stability(pipe, texts, labels, n_splits=5, random_state=42)
    assert len(res["val_fold_scores"]) == 5
    assert res["val_mean"] >= 0.80
    assert res["val_std"] >= 0.0
    assert res["overfit_gap"] == pytest.approx(res["train_mean"] - res["val_mean"])


def test_tune_thai_classifier_cv_and_locked_test():
    texts = [t for t, _ in DATASET]
    labels = [y for _, y in DATASET]
    X_tr, X_te, y_tr, y_te = train_test_split(
        texts, labels, test_size=0.25, stratify=labels, random_state=42
    )
    pipe = build_base_pipeline(CUSTOM_WORDS, STOPWORDS)
    param_grid = {
        "tfidf__ngram_range": [(1, 1), (1, 2)],
        "clf__C": [0.1, 1.0, 5.0],
    }

    tuned = tune_thai_classifier_cv(pipe, X_tr, y_tr, param_grid, n_splits=5, random_state=42)
    assert set(tuned["best_params"].keys()) == {"tfidf__ngram_range", "clf__C"}
    assert tuned["best_cv_mean"] >= 0.80
    assert tuned["best_cv_std"] >= 0.0
    assert tuned["overfit_gap"] == pytest.approx(tuned["best_train_mean"] - tuned["best_cv_mean"])

    # ประเมินบน Held-out Test Set เพียงครั้งเดียว
    test_f1 = f1_score(y_te, tuned["best_estimator"].predict(X_te), average="macro")
    assert test_f1 >= 0.80


def test_diagnose_overfitting_rules():
    assert diagnose_overfitting(0.55, 0.50) == "underfitting"
    assert diagnose_overfitting(0.99, 0.78) == "overfitting"
    assert diagnose_overfitting(0.93, 0.89) == "healthy"
`,
    },
    selfCheck: [
      "`evaluate_cv_stability` ใช้ `StratifiedKFold(shuffle=True)` และ `cross_validate(..., return_train_score=True)` คืนครบ 6 คีย์และ `val_fold_scores` ยาว 5",
      "`tune_thai_classifier_cv` ส่ง `Pipeline` ทั้งก้อนเข้า `GridSearchCV` ทำให้ `TfidfVectorizer` ถูก fit ใหม่ในทุก fold (ไม่เกิด Data Leakage)",
      "ดึง `best_cv_std` และ `best_train_mean` ตรงตาม `search.best_index_` ไม่ใช่เอาค่าของชุดแรกหรือค่าเฉลี่ยรวมทุก grid",
      "`diagnose_overfitting` แยกแยะ `underfitting`, `overfitting` และ `healthy` ได้แม่นยำตามเกณฑ์",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 3 test functions ใน `test_day51.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `evaluate_cv_stability` ผลจาก `cross_validate` มีคีย์ `'train_score'` และ `'test_score'` (ซึ่งคือ Validation fold scores!) ให้แปลงเป็น `float(scores['test_score'].mean())` และ `[float(x) for x in scores['test_score']]`",
      },
      {
        body: "ใน `tune_thai_classifier_cv` หลัง `search.fit(X_train, y_train)` ให้ใช้ `idx = int(search.best_index_)` เพื่อดึง `float(search.cv_results_['std_test_score'][idx])` และ `float(search.cv_results_['mean_train_score'][idx])`",
      },
      {
        body: "โครงของ `tune_thai_classifier_cv` และ `diagnose_overfitting` พร้อมแล้ว เหลือเติม `evaluate_cv_stability` ให้ครบ:",
        code: {
          language: "python",
          filename: "hint_day51.py",
          code: `def tune_thai_classifier_cv(
    base_pipeline: Pipeline,
    X_train: list[str],
    y_train: list[str],
    param_grid: dict,
    n_splits: int = 5,
    scoring: str = "f1_macro",
    random_state: int = 42,
) -> dict:
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    search = GridSearchCV(
        estimator=base_pipeline,
        param_grid=param_grid,
        cv=cv,
        scoring=scoring,
        return_train_score=True,
        refit=True,
    )
    search.fit(X_train, y_train)
    idx = int(search.best_index_)
    best_cv_mean = float(search.best_score_)
    best_cv_std = float(search.cv_results_["std_test_score"][idx])
    best_train_mean = float(search.cv_results_["mean_train_score"][idx])
    return {
        "best_estimator": search.best_estimator_,
        "best_params": dict(search.best_params_),
        "best_cv_mean": best_cv_mean,
        "best_cv_std": best_cv_std,
        "best_train_mean": best_train_mean,
        "overfit_gap": best_train_mean - best_cv_mean,
    }


def diagnose_overfitting(
    train_score: float,
    val_score: float,
    gap_threshold: float = 0.12,
    underfit_threshold: float = 0.65,
) -> str:
    if train_score < underfit_threshold and val_score < underfit_threshold:
        return "underfitting"
    if (train_score - val_score) > gap_threshold:
        return "overfitting"
    return "healthy"`,
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
      title: "เรียก `tfidf.fit_transform(X_train)` ก่อนส่งเข้า `GridSearchCV`",
      symptom: "คะแนน CV สูงกว่าความจริงเพราะค่า IDF และคำศัพท์ของ validation fold รั่วเข้าไปตั้งแต่ก่อนแบ่ง fold ({{data-leakage}})",
      fix: "ส่ง `Pipeline([(\"tfidf\", ...), (\"clf\", ...)])` เข้าไปใน `GridSearchCV` / `cross_validate` โดยตรงเสมอ เพื่อให้ vectorizer ถูก `fit` ใหม่ทุก fold",
    },
    {
      title: "ทำ `GridSearchCV` บนข้อมูลทั้งหมด (`X, y`) โดยไม่กัน Held-out Test Set ไว้ก่อน",
      symptom: "คะแนน `best_score_` ของ CV ดูดีเพราะเราเลือกพารามิเตอร์ที่บังเอิญชนะบนชุดข้อมูลนั้น (Selection Bias) แต่ไม่มีชุดทดสอบอิสระไว้ยืนยันผลจริง",
      fix: "แยก `X_train, X_test` ออกก่อนเสมอ ทำ CV + GridSearch บน `X_train` เท่านั้น แล้วค่อยวัดผล `best_estimator_` บน `X_test` เพียงครั้งเดียว",
    },
    {
      title: "ลืมใส่ `shuffle=True` ใน `StratifiedKFold` เมื่อข้อมูลเรียงตามหมวดหรือเวลา",
      symptom: "บาง fold ได้แต่ข้อความจากสัปดาห์หรือแคมเปญเดียวกัน ทำให้ `std` กว้างผิดปกติหรือคะแนนประเมินเพี้ยน",
      fix: "สำหรับข้อมูลที่ไม่มีลำดับเวลา ให้ตั้ง `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` เสมอ (และถ้าเป็น Time-Series ให้ใช้ `TimeSeriesSplit` แทน)",
    },
    {
      title: "ใส่ `param_grid` ใหญ่เกินไปจนรันเป็นชั่วโมง (Combinatorial Explosion)",
      symptom: "ใส่ 6 พารามิเตอร์อย่างละ 5 ค่า = `15,625 × 5 folds = 78,125` รอบเทรน จนเครื่องค้าง",
      fix: "เริ่มจาก grid ขนาดเล็ก (10–25 ชุด) สำหรับ `GridSearchCV` หรือสลับไปใช้ `RandomizedSearchCV(n_iter=20)` เพื่อสำรวจช่วงพารามิเตอร์กว้างอย่างรวดเร็ว",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d051-q1",
        "ทำไมการส่ง `Pipeline([(\"tfidf\", TfidfVectorizer(...)), (\"clf\", LogisticRegression())])` เข้า `GridSearchCV` จึงปลอดภัยกว่าการทำ `X_tfidf = tfidf.fit_transform(X_train)` ก่อนแล้วค่อยทำ CV?",
        [
          ["เพราะ `Pipeline` ทำให้ `TfidfVectorizer` ทำงานบน GPU ได้", "ไม่จริง — scikit-learn รันบน CPU เหมือนเดิม"],
          ["เพราะ `GridSearchCV` จะ `fit` `TfidfVectorizer` ใหม่เฉพาะบน 4 training folds ของแต่ละรอบ ป้องกันไม่ให้ vocabulary และค่า IDF จาก validation fold รั่วเข้ามา", "ถูก — ปิดช่องโหว่ {{data-leakage}} ภายใน Cross-Validation ได้ 100%"],
          ["เพราะ `GridSearchCV` ไม่รองรับเมทริกซ์ตัวเลขจาก `TfidfVectorizer`", "ผิด — มันรับเมทริกซ์ได้ แต่จะเกิด Data Leakage ตั้งแต่ขั้นตอนเตรียมฟีเจอร์"],
          ["เพราะ `Pipeline` ช่วยลดจำนวน fold จาก 5 เหลือ 1 โดยอัตโนมัติ", "ผิด — ยังคงรันครบทุก fold ตามที่กำหนดใน `cv`"],
        ],
        "B",
        "ทุกขั้นตอนที่มีการเรียนรู้สถิติจากข้อมูล (เช่น TF-IDF, Imputer, Scaler) ต้องอยู่ใน `Pipeline` เพื่อถูก `fit` ใหม่เฉพาะฝั่ง training folds ของแต่ละรอบ CV",
        "ทำไมต้องส่ง `Pipeline` ทั้งก้อนเข้า `cross_validate` / `GridSearchCV` แทนที่จะแปลง TF-IDF ก่อน?",
        "เพื่อให้ `TfidfVectorizer` ถูก `fit` ใหม่บน training folds ของแต่ละรอบเท่านั้น ป้องกัน vocabulary และค่า IDF จาก validation fold รั่วเข้ามา",
      ),
      mc(
        "d051-q2",
        "จากผลการรัน 5-Fold `GridSearchCV` ต่อไปนี้ ชุดพารามิเตอร์ใดแสดงสัญญาณ **Overfitting** ชัดเจนที่สุด?\n- Config A: `Train = 0.62`, `Val = 0.60 ± 0.03`\n- Config B: `Train = 0.93`, `Val = 0.90 ± 0.02`\n- Config C: `Train = 1.00`, `Val = 0.77 ± 0.08`\n- Config D: `Train = 0.88`, `Val = 0.86 ± 0.02`",
        [
          ["Config A (`Train = 0.62, Val = 0.60`)", "ผิด — ทั้ง Train และ Val ต่ำคู่กันคืออาการ Underfitting ไม่ใช่ Overfitting"],
          ["Config B (`Train = 0.93, Val = 0.90 ± 0.02`)", "ผิด — นี่คือ Healthy Generalization ที่ทั้งสูงและเสถียรที่สุด"],
          ["Config C (`Train = 1.00, Val = 0.77 ± 0.08`)", "ถูก — Train เต็ม 1.00 แต่ Val ตกลงถึง 0.23 แถม `std` กว้าง (0.08) แปลว่าโมเดลกำลังท่องจำชุดเทรน"],
          ["Config D (`Train = 0.88, Val = 0.86 ± 0.02`)", "ผิด — ช่องว่างแค่ 0.02 ถือว่าไม่ Overfit"],
        ],
        "C",
        "Overfitting มีลักษณะเด่นคือ Train score สูงลิ่วแต่ Validation score ทิ้งห่างมาก (`overfit_gap` กว้าง) และมักมาพร้อม `std` ระหว่าง folds ที่สูงขึ้น",
        "แยกแยะ Underfitting, Overfitting และ Healthy Fit จาก Train vs Val score อย่างไร?",
        "Underfitting: Train ต่ำและ Val ต่ำคู่กัน; Overfitting: Train สูงมากแต่ Val ทิ้งห่าง (gap กว้าง); Healthy: ทั้ง Train และ Val สูงใกล้กันพร้อม `std` ต่ำ",
      ),
      mc(
        "d051-q3",
        "ใน `Pipeline([(\"tfidf\", TfidfVectorizer()), (\"clf\", LogisticRegression())])` หากต้องการจูนค่า `ngram_range` ของ `tfidf` และค่า `C` ของ `clf` ใน `GridSearchCV` ต้องตั้งชื่อคีย์ใน `param_grid` อย่างไร?",
        [
          ["`{\"ngram_range\": [...], \"C\": [...]}`", "ผิด — scikit-learn จะไม่รู้ว่าพารามิเตอร์นี้เป็นของขั้นตอนไหนใน Pipeline และโยน `ValueError`"],
          ["`{\"tfidf.ngram_range\": [...], \"clf.C\": [...]}`", "ผิด — scikit-learn ไม่ใช้จุด (`.`) แต่ใช้ double underscore (`__`)"],
          ["`{\"tfidf__ngram_range\": [...], \"clf__C\": [...]}`", "ถูก — รูปแบบมาตรฐานคือ `<ชื่อขั้นตอน>__<ชื่อพารามิเตอร์>`"],
          ["`{\"TfidfVectorizer__ngram_range\": [...], \"LogisticRegression__C\": [...]}`", "ผิด — ต้องใช้ชื่อ step (`\"tfidf\"`, `\"clf\"`) ที่เราตั้งใน `Pipeline` ไม่ใช่ชื่อคลาส"],
        ],
        "C",
        "scikit-learn ใช้เครื่องหมายขีดล่างสองตัว (`__`) เชื่อมชื่อขั้นตอนใน `Pipeline` กับชื่อพารามิเตอร์ของ estimator นั้น",
        "รูปแบบชื่อคีย์ใน `param_grid` เมื่อจูน `Pipeline` ด้วย `GridSearchCV` คืออะไร?",
        "ใช้ `<step_name>__<param_name>` (double underscore) เช่น `tfidf__ngram_range` และ `clf__C`",
      ),
      mc(
        "d051-q4",
        "เมื่อเทียบผล 5-Fold CV ระหว่างโมเดลที่ใช้ `C=0.5` (`Val = 0.89 ± 0.02`) กับ `C=100` (`Train = 1.00, Val = 0.84 ± 0.07`) ข้อใดอธิบายบทบาทของ `C` ใน `LogisticRegression` ได้ถูกต้อง?",
        [
          ["`C` ยิ่งสูงยิ่งเพิ่ม Regularization มากขึ้น", "ตรงกันข้าม — `C` คือส่วนกลับของ Regularization (`1 / λ`)"],
          ["`C` ยิ่งสูงยิ่งลด Regularization (ปล่อยให้โมเดลจำชุดเทรนอิสระมากขึ้น) จึงทำให้ `C=100` เกิด Overfitting จน Val ต่ำลงและแกว่งกว่า `C=0.5`", "ถูก — การลด `C` ช่วยคุมขนาดน้ำหนัก `coef_` ไม่ให้พุ่งสูงจนจำเสียงรบกวนในชุดเทรน"],
          ["`C` คือจำนวน folds ใน Cross-Validation", "ผิด — จำนวน folds กำหนดที่ `n_splits` ของ `StratifiedKFold`"],
          ["`C` คือความยาวสูงสุดของข้อความภาษาไทย", "ผิด — `C` เป็น regularization hyperparameter ของ `LogisticRegression`"],
        ],
        "B",
        "`C` ใน `LogisticRegression` คือส่วนกลับของความแรง Regularization: `C` เล็ก = คุมเข้มกัน Overfit, `C` ใหญ่ = ปล่อยอิสระเสี่ยง Overfit",
        "พารามิเตอร์ `C` ใน `LogisticRegression` ส่งผลต่อ Regularization และ Overfitting อย่างไร?",
        "`C = 1 / λ`: `C` เล็กหมายถึง Regularization แรง (คุมไม่ให้ Overfit แต่อาจ Underfit ถ้าน้อยเกิน) ส่วน `C` ใหญ่หมายถึง Regularization อ่อน (เสี่ยง Overfit)",
      ),
    ],
  },

  takeaways: [
    "ใช้ `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` วัดผลเป็น **`mean ± std`** แทนการเชื่อผลจาก `train_test_split` เพียงรอบเดียว เพื่อคุม {{reproducibility}} และวัดความเสถียรจริง",
    "ส่ง {{sklearn-pipeline}} ทั้งก้อนเข้า `cross_validate` / `GridSearchCV` / `RandomizedSearchCV` เสมอ เพื่อให้ `TfidfVectorizer` ถูก `fit` ใหม่ภายในทุก fold ป้องกัน {{data-leakage}} 100%",
    "เปิด `return_train_score=True` เพื่อตรวจช่องว่าง `Train - Val`: แยกแยะ Underfitting, Overfitting และ Healthy Fit ได้ชัดก่อนล็อก `best_estimator_` ไปวัดบน Held-out Test Set เพียงครั้งเดียว",
    "ในวันพรุ่งนี้ (Day 52 Review) เราจะใช้ 5-Fold Stratified CV ชุดเดียวกันเป๊ะเพื่อพิสูจน์เชิงปริมาณว่า `PyThaiNLP newmm` ชนะ raw whitespace split กี่จุด Macro-F1",
  ],

  reviewCards: [
    rc(
      "d051-rc-1",
      "ทำไมใน `GridSearchCV` จึงต้องเก็บ `TfidfVectorizer` ไว้ใน `Pipeline` แทนที่จะแปลงข้อความก่อนแบ่ง CV?",
      "เพื่อให้ `TfidfVectorizer` ถูก `fit` เฉพาะบน training folds ของแต่ละรอบ CV เท่านั้น — หากแปลงก่อนแบ่ง ค่า IDF และ vocabulary ของ validation fold จะรั่วเข้าไปเกิด Data Leakage",
    ),
    rc(
      "d051-rc-2",
      "ในผลลัพธ์ `cv_results_` ของ `GridSearchCV` คีย์ `mean_test_score` หมายถึงคะแนนบนชุดใด และต้องดูคู่กับอะไรเพื่อจับ Overfitting?",
      "`mean_test_score` คือคะแนนเฉลี่ยบน **Validation folds** (ไม่ใช่ Held-out Test Set) ต้องเปิด `return_train_score=True` แล้วเทียบกับ `mean_train_score` และ `std_test_score` เพื่อดูทั้ง overfit gap และความเสถียร",
    ),
    rc(
      "d051-rc-3",
      "เมื่อไรควรเลือก `RandomizedSearchCV` แทน `GridSearchCV`?",
      "เมื่อพื้นที่พารามิเตอร์กว้างหรือมีหลายตัวจนการลองทุกคู่ผสม (grid) ช้าเกินไป — `RandomizedSearchCV(n_iter=...)` ช่วยคุมงบเวลา CPU และมักเจอจุดที่ใกล้เคียงค่าดีที่สุดได้เร็วกว่า",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Cross-Validation: Evaluating Estimator Performance", href: "https://scikit-learn.org/stable/modules/cross_validation.html" },
    { label: "scikit-learn User Guide — Tuning the Hyper-Parameters of an Estimator (GridSearchCV / RandomizedSearchCV)", href: "https://scikit-learn.org/stable/modules/grid_search.html" },
    { label: "scikit-learn API Reference — StratifiedKFold", href: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedKFold.html" },
    { label: "scikit-learn Common Pitfalls — Data Leakage in Cross-Validation", href: "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage" },
  ],

  glossary: [
    "cross-validation",
    "sklearn-pipeline",
    "data-leakage",
    "tfidf",
    "pythainlp",
    "precision-recall",
    "reproducibility",
    "pytest",
  ],
});
