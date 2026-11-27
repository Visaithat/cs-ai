import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D056 — Phase 2 / Block B14 (Review Day)
 * Interleaved recall of D53–D55 + D43/D47 + Train & evaluate end-to-end ML pipeline.
 */
export const d056: Lesson = defineLesson({
  day: 56,
  titleTh: "ทบทวน B14: เทรนและประเมิน End-to-End Thai Ticket Priority ML Pipeline",
  tagline:
    "30 นาที · รอบทบทวน D53–D55 + D43/D47 · รันบน CPU 100% ไม่ใช้ API key · ประกอบ Hybrid ColumnTransformer เทรน จูน Threshold และบันทึก Versioned Bundle",
  icon: "git-merge",
  visual: {
    id: "phase2-ml-pipeline",
    title: "ทบทวน B14: เทรนและประเมิน End-to-End Thai Ticket Priority Pipeline",
    caption:
      "ร้อย Polars + ColumnTransformer (PyThaiNLP TF-IDF + Tabular) + LightGBM/LogReg + Threshold Tuning ครบจบในคำสั่งเดียว",
    alt: "แผนภาพการเทรนและประเมิน ML pipeline ครบวงจร",
  },
  requiresApiKey: false,
  tools: ["Polars", "PyThaiNLP", "scikit-learn", "LightGBM", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ล้างข้อมูลด้วย Polars และเตรียมข้อความไทยแบบแยกชั้นสะอาด",
      body: "จุดเริ่มต้นของ End-to-End Pipeline คือตารางที่สะอาด ผ่าน {{polars}} + สัญญาข้อมูลจาก Day 55 และตัดคำภาษาไทยด้วย {{pythainlp}} `newmm` + custom dictionary",
      lessonNote:
        "ใช้รูปแบบ **Pre-Tokenized Thai Text** (คั่นคำด้วยช่องว่างก่อนส่งเข้า `TfidfVectorizer`) เพื่อตัด custom closure ออกจากไฟล์โมเดล ทำให้ serialize ด้วย `joblib` ได้สะอาดและเสถียรข้ามเครื่อง",
    },
    {
      node: 2,
      heading: "ร้อยต่อ Hybrid ColumnTransformer (D43) กับ LogReg / LightGBM (D47)",
      body: "วันนี้เรานำพิมพ์เขียว Day 55 มาเขียนโค้ดจริง: รวมสาขา Text (`TfidfVectorizer`), Numeric (`SimpleImputer + StandardScaler`) และ Categorical (`OneHotEncoder`) ไว้ใน {{sklearn-pipeline}} เดียวโดยไม่เกิด {{data-leakage}}",
      lessonNote:
        "เปรียบเทียบโมเดล Baseline (`LogisticRegression`) กับ {{lightgbm}} บนชุด Validation ด้วย PR-AUC อย่างยุติธรรม",
    },
    {
      node: 3,
      heading: "จูน Urgent Threshold บน Val เท่านั้น แล้วประเมินครั้งเดียวบน Test",
      body: "ล็อก `best_threshold` ที่ลดต้นทุนธุรกิจหรือตอบโจทย์ `Recall@urgent >= 0.85` บนชุด Validation เท่านั้น จากนั้นค่อยประเมินบน Test Set เพียงครั้งเดียวเพื่อวัดผลจริง",
      lessonNote:
        "บันทึกตัวเลขทั้งหมดลง `metrics.json` พร้อม P95 latency เพื่อให้พร้อมตรวจผ่าน Quality Gate",
    },
    {
      node: 5,
      heading: "บันทึก Immutable Artifact Bundle + Drift Baseline สำหรับ Production",
      body: "จบการเทรน 1 ครั้งต้องได้ครบ 3 ไฟล์: ไฟล์โมเดลพร้อม `SHA-256` (D53), `metrics.json` และ `drift_baseline.json` (quantiles + vocabulary + positive rate) สำหรับตัวตรวจ {{feature-drift}} (D54)",
      lessonNote:
        "วางฐาน End-to-End Pipeline ที่รันซ้ำได้ในคำสั่งเดียว ก่อนเข้าสู่ Block B15 (Error Analysis, ONNX Benchmark <10ms และ Reproducible Tests)",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบสลับหัวข้อ (Interleaved Recall)** เชื่อมโยง D53 (Serialization/Versioning), D54 (Feature Drift), D55 (Pipeline Spec), D43 (`ColumnTransformer`) และ D47 ({{lightgbm}})",
    "**สร้างและเทรน Hybrid End-to-End Pipeline** ที่ผสานข้อความภาษาไทย (`PyThaiNLP newmm` + `TfidfVectorizer`) เข้ากับฟีเจอร์ตารางใน `ColumnTransformer` โดยปลอด {{data-leakage}}",
    "**จูน Threshold บน Validation Set และบันทึก Versioned Artifact Bundle** (`model.joblib`, `metrics.json`, `drift_baseline.json` พร้อม `SHA-256`) ที่โหลดกลับมาทำนายได้ผลตรงกัน 100%",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D43 (`ColumnTransformer`), D47 ({{lightgbm}}), D49 ({{pythainlp}} + {{tfidf}}) และ D53–D55",
    "มีโปรเจกต์ `thai-ticket-priority` จาก Day 55 หรือสภาพแวดล้อม `uv` ที่มี `polars`, `pandas`, `scikit-learn`, `lightgbm`, `pythainlp`, `joblib`, `pytest`",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "ใช้โฟลเดอร์โปรเจกต์ `thai-ticket-priority` ต่อจาก Day 55 (หรือสร้างใหม่สำหรับรอบทบทวน Day 56) แล้วตรวจว่าไลบรารีทั้งหมดพร้อมทำงานร่วมกัน",
    commands: `uv init ai-day56-review && cd ai-day56-review
uv add polars pandas scikit-learn lightgbm pythainlp joblib numpy
uv add --dev pytest ruff
uv run python -c "import polars, pandas, sklearn, lightgbm, pythainlp, joblib; print('B14 Review Ready!')"`,
    steps: [
      ["init", "เข้าโฟลเดอร์ `thai-ticket-priority` หรือสร้าง `ai-day56-review`"],
      ["deps", "ติดตั้ง `polars`, `pandas`, `scikit-learn`, `lightgbm`, `pythainlp`, `joblib`, `numpy`"],
      ["verify", "รันคำสั่งเช็ก import แล้วเห็น `B14 Review Ready!`"],
    ],
    note: "รอบทบทวน Day 56 จัดเวลา 30 นาทีตามจังหวะทบทวน: ทำ Interleaved Quiz 4 ข้อ (10 นาที) → ลงมือประกอบและเทสต์ End-to-End Hybrid Pipeline (15 นาที) → บันทึก Error Log และทบทวน Review Cards (5 นาที)",
  },

  concepts: [
    {
      id: "review-b14-end-to-end-assembly",
      title: "1 · ร้อยต่อจิ๊กซอว์ B14 (D53–D55) + D43/D47: จาก Spec สู่ Training Script เดียว",
      paragraphs: [
        "ตลอด 3 วันที่ผ่านมาใน Block B14 คุณได้สร้างชิ้นส่วนระดับ Production ครบแล้ว: **Day 53** สอนวิธี serialize โมเดลอย่างปลอดภัยพร้อม Immutable Versioning & SHA-256, **Day 54** สอนวิธีเฝ้าระวัง {{feature-drift}} ด้วย PSI และ Thai OOV Rate และ **Day 55** วางพิมพ์เขียว 5 ชั้นกับ Quality Gate สำหรับ Thai Ticket Priority",
        "วันนี้เรานำชิ้นส่วนจาก **Day 43** (`ColumnTransformer` + `Pipeline`), **Day 47** ({{lightgbm}}) และ **Day 49** ({{pythainlp}} + {{tfidf}}) มาเชื่อมเข้ากับ B14 ให้กลายเป็น **Reproducible End-to-End Training Pipeline** ที่รันจบในคำสั่งเดียวและผลิตไฟล์พร้อมขึ้น Production ทันที",
      ],
      analogy:
        "เหมือนการซ้อมใหญ่ของวงออร์เคสตรา: ทุกเครื่องดนตรีซ้อมแยกห้องมาแล้ว (Polars, PyThaiNLP, ColumnTransformer, LightGBM, Threshold, Versioning) — วันนี้คือวันที่ทุกชิ้นเล่นประสานกันเป็นเพลงเดียวตั้งแต่ต้นจนจบ",
      bullets: [
        "**D43 (`ColumnTransformer`)**: แปลง Text + Numeric + Categorical พร้อมกันใน Pipeline เดียว กัน {{data-leakage}} อัตโนมัติ",
        "**D47 (`LightGBM`) & D50 (`LogisticRegression`)**: เทรนเทียบอย่างยุติธรรมบน Validation PR-AUC เพื่อเลือกโมเดลที่เหมาะสมที่สุด",
        "**D53 (`Versioning & SHA-256`)**: เซฟ `model.joblib` + `metrics.json` แบบ immutable พร้อมแฮชยืนยันความสมบูรณ์",
        "**D54 (`Drift Baseline`)**: ส่งออก `drift_baseline.json` (quantiles ของ `order_value_thb` + `vocab_size` + `positive_rate`) ทันทีหลังเทรนเสร็จ",
      ],
      whyTitle: "Why this matters — เทรนซ้ำได้ทุกเมื่อในคำสั่งเดียว",
      whyParagraphs: [
        "ระบบ ML ที่ยังต้องรันทีละเซลล์ใน Notebook จะพังทันทีเมื่อต้อง retrain รายเดือนหรือเมื่อมีเพื่อนร่วมทีมมารับช่วงต่อ การรวมทุกขั้นตอนไว้ในฟังก์ชัน/สคริปต์ที่ทดสอบได้ด้วย `pytest` คือก้าวสำคัญของการเป็น AI Engineer",
        "ผลลัพธ์จากวันนี้จะถูกนำไปต่อยอดโดยตรงใน Block B15: Day 57 วิเคราะห์เคสทายผิด (Error Analysis), Day 58 วัดและบีบ latency ให้ `<10ms`, และ Day 59 เขียนชุดเทสต์เต็มรูปแบบ",
      ],
    },
    {
      id: "hybrid-column-transformer-thai-text-tabular",
      title: "2 · เทคนิคประกอบ Hybrid ColumnTransformer (ข้อความไทย + Tabular) ให้ Serialize สะอาด",
      paragraphs: [
        "เวลาผสมข้อความภาษาไทยกับคอลัมน์ตารางใน `ColumnTransformer` มีรายละเอียดสำคัญ 3 จุดที่ช่วยป้องกันบั๊กจุกจิกได้ชะงัด: (1) คอลัมน์ข้อความต้องส่งชื่อเป็น **สตริงเดี่ยว** `\"tokenized_text\"` (ไม่ใช่ลิสต์ `[\"tokenized_text\"]`) เพราะ `TfidfVectorizer` รับอินพุต 1D ส่วน numeric/categorical ส่งเป็น **ลิสต์** เพราะรับอินพุต 2D",
        "(2) **Pre-Tokenize Pattern สำหรับภาษาไทย**: แทนที่จะฝังฟังก์ชัน closure ที่มีอ็อบเจกต์ `Trie` ของ `PyThaiNLP` ลงไปใน `TfidfVectorizer` (ซึ่งมักทำให้ `joblib.dump` พังด้วย `PicklingError: Can't pickle local object`!) ให้เราเขียนฟังก์ชัน `pretokenize_thai(text)` แปลงข้อความไทยเป็นสตริงที่คั่นคำด้วยช่องว่างก่อน (เช่น `\"โอน เงิน พร้อมเพย์\"`) แล้วส่งเข้า `TfidfVectorizer(token_pattern=r\"(?u)\\S+\", lowercase=False)`!",
        "(3) **Sparse Matrix Compatibility**: เมื่อ `ColumnTransformer` รวม `TfidfVectorizer` กับ numeric/categorical ผลลัพธ์จะเป็น sparse matrix — ทั้ง `LogisticRegression(max_iter=1000, class_weight=\"balanced\")` และ `LGBMClassifier` รองรับ sparse matrix ได้โดยตรง ทำให้ประหยัด RAM และเทรนเสร็จในเสี้ยววินาที",
      ],
      analogy:
        "การทำ Pre-Tokenize เหมือนหั่นวัตถุดิบใส่กล่องเตรียมไว้ก่อนส่งเข้าเครื่องปั่นมาตรฐาน — เครื่องปั่น (`scikit-learn Pipeline`) จึงเบา ย้ายไปเปิดเครื่องไหนก็ได้โดยไม่ต้องแบกมีดหั่นเฉพาะทาง (`Trie` closure) ติดเข้าไปในไฟล์โมเดล",
      code: {
        language: "python",
        filename: "hybrid_pipeline_snippet.py",
        code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DOMAIN_TERMS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "คืนเงิน"}
CUSTOM_DICT = dict_trie(set(thai_words()) | DOMAIN_TERMS)


def pretokenize_thai(text: str) -> str:
    tokens = word_tokenize(text, engine="newmm", custom_dict=CUSTOM_DICT, keep_whitespace=False)
    return " ".join(t.lower() for t in tokens if t.strip())


def build_hybrid_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("text", TfidfVectorizer(token_pattern=r"(?u)\S+", lowercase=False, ngram_range=(1, 2)), "tokenized_text"),
            ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), ["order_value_thb", "wait_minutes", "past_tickets_30d"]),
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["customer_tier", "channel"]),
        ]
    )
    return Pipeline([
        ("prep", preprocessor),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])`,
        caption: "Pre-tokenized text + `token_pattern=r'(?u)\\S+'` ทำให้ `Pipeline` ไม่มี custom closure จึง serialize ด้วย `joblib` ได้ 100%",
      },
      whyTitle: "Why this matters — แก้ปัญหา PicklingError ที่มือใหม่ติดกันมากที่สุด",
      whyParagraphs: [
        "ปัญหาสุดคลาสสิกของคนทำ Thai NLP ด้วย `scikit-learn` คือเทรนผ่านสวยหรู แต่พอสั่ง `joblib.dump(pipe, ...)` กลับระเบิดด้วย `AttributeError` หรือ `PicklingError` เพราะผูก closure/lambda ไว้ใน `tokenizer=...`",
        "รูปแบบ Pre-Tokenize แยกชั้นภาษาไทยออกจาก `ColumnTransformer` อย่างเรียบร้อย ทำให้ทั้ง `joblib.dump`, `pytest` และการสลับ classifier เป็น {{lightgbm}} ทำงานได้ลื่นไหลโดยไม่ติดปัญหา serialization",
      ],
    },
    {
      id: "end-to-end-bundle-metrics-and-baseline",
      title: "3 · ผลลัพธ์ของการเทรน 1 รอบ: Model + Metrics JSON + Drift Baseline",
      paragraphs: [
        "การรันสคริปต์เทรนในโลก Production ไม่ควรจบแค่การ `print()` ตัวเลขบนหน้าจอแล้วหายไป แต่ควรสร้าง **Immutable Output Bundle** ที่ประกอบด้วยไฟล์ 3 ชิ้นพร้อมใช้งานต่อทันที:",
        "(1) **`model.joblib`** พร้อมคำนวณ `artifact_sha256`, (2) **`metrics.json`** เก็บทั้ง `model_type`, `artifact_sha256`, `val_pr_auc`, `test_pr_auc`, `best_threshold`, `test_urgent_recall`, `test_urgent_precision`, `p95_latency_ms` และ (3) **`drift_baseline.json`** ที่บันทึก quantile bin edges ของฟีเจอร์ตัวเลขสำคัญ, รายการคำศัพท์ `vocab` จากชุด Train และ `train_positive_rate`",
        "เมื่อทุกอย่างถูกบันทึกครบในคำสั่งเดียว ขั้นตอน Error Analysis (Day 57), Benchmark Latency (Day 58) และ Drift Monitor (Day 54) จะสามารถอ่านจากโฟลเดอร์เวอร์ชันเดียวกันได้ทันทีโดยไม่ต้องเดาค่าเอง",
      ],
      analogy:
        "เหมือนการส่งมอบซอฟต์แวร์ Release หนึ่งรอบ: มีทั้งตัวแอป (`model.joblib`), รายงานผลทดสอบ (`metrics.json`) และค่ามาตรฐานสำหรับมอนิเตอร์ (`drift_baseline.json`) แพ็กอยู่ในกล่องเวอร์ชันเดียวกัน",
      bullets: [
        "**เลือกโมเดลบน Val เท่านั้น**: เปรียบเทียบ `LogisticRegression` vs `LGBMClassifier` ด้วย `average_precision_score(y_val, p_val)`",
        "**จูน Threshold บน Val เท่านั้น**: กวาด grid หา `best_threshold` ที่ลดต้นทุนธุรกิจต่ำสุด (หรือได้ `Recall >= 0.85` ที่ Precision สูงสุด)",
        "**แตะ Test Set เพียงครั้งเดียว**: วัด `test_pr_auc`, `test_urgent_recall`, `test_urgent_precision` ด้วยโมเดลและ threshold ที่ล็อกไว้แล้ว",
      ],
      whyTitle: "Why this matters — ปิดช่องว่างระหว่าง 'เทรนเสร็จ' กับ 'พร้อมใช้งานจริง'",
      whyParagraphs: [
        "เมื่อคุณโหลด `model.joblib` กลับมาในเทสต์แล้วเทียบ `loaded_pipe.predict_proba(X_test)` กับค่าก่อนเซฟด้วย `np.allclose` คุณจะมั่นใจได้ 100% ว่าโมเดลที่บันทึกไว้ทำงานตรงกับตอนเทรนทุกประการ",
        "และเพราะเราเก็บ `drift_baseline.json` ไปพร้อมกัน ตั้งแต่วินาทีแรกที่เปิดรับทิกเก็ตจริง ระบบ Monitoring จาก Day 54 ก็มีค่าอ้างอิงพร้อมใช้งานทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ End-to-End Training Script กับ Build & Release Pipeline",
      body: [
        "มองสคริปต์เทรนวันนี้เป็นคำสั่ง `npm run build && npm run test` ของโลก ML ที่สร้าง artifact พร้อม metadata ครบชุดในคำสั่งเดียว:",
      ],
      table: [
        ["`pretokenize_thai` + Polars clean", "Input Normalization / Middleware ก่อนเข้า business logic"],
        ["`ColumnTransformer` + `Pipeline`", "Composable Data Transform + Model Engine"],
        ["Val-only model & threshold selection", "Staging benchmark เพื่อเลือก release candidate"],
        ["`model.joblib` + `metrics.json` + `drift_baseline.json`", "Release bundle + test report + monitoring config"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมต้องแปลง Polars DataFrame เป็น pandas ก่อนส่งเข้า ColumnTransformer?",
      body: [
        "เราใช้ **Polars** สำหรับอ่าน ล้าง และกรองข้อมูลขนาดใหญ่เพราะเร็วและประหยัด RAM แต่ `ColumnTransformer` ของ `scikit-learn` ทำงานกับชื่อคอลัมน์ได้ลื่นที่สุดเมื่อรับ **`pandas.DataFrame`**",
        "เทคนิคง่าย ๆ ที่ไม่ต้องพึ่งแพ็กเกจเสริมอย่าง `pyarrow` คือเรียก `pd.DataFrame(clean_pl_df.to_dicts())` หลังล้างข้อมูลใน Polars เสร็จ — คุณจะได้ทั้งความเร็วและความสะอาดของ Polars คู่กับความเข้ากันได้เต็มร้อยของ `scikit-learn`",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: รันวงจร End-to-End ครบตั้งแต่สร้างข้อมูลทิกเก็ตภาษาไทยด้วย Polars → ประกอบ Hybrid `ColumnTransformer` → เทียบ `LogisticRegression` กับ `LightGBM` บน Val → จูน Threshold และบันทึก Bundle พร้อม `metrics.json`",
    steps: [
      {
        title: "1 · สร้างชุดข้อมูลทิกเก็ตไทย + Tabular ด้วย Polars และแบ่ง Train/Val/Test",
        explain:
          "จำลองทิกเก็ตซัพพอร์ตภาษาไทย 300 ใบที่มีทั้งข้อความอาการและ metadata ตาราง, ทำ `pretokenize_thai`, แล้วแบ่ง Train / Val / Test (60/20/20) แบบ Stratified",
        code: {
          language: "python",
          filename: "worked_day56.py",
          code: `import numpy as np
import pandas as pd
import polars as pl
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.model_selection import train_test_split

CUSTOM_DICT = dict_trie(set(thai_words()) | {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "คืนเงิน"})


def pretokenize_thai(text: str) -> str:
    toks = word_tokenize(text, engine="newmm", custom_dict=CUSTOM_DICT, keep_whitespace=False)
    return " ".join(t.lower() for t in toks if t.strip())


rng = np.random.default_rng(42)
urgent_texts = [
    "โอนเงินผ่านพร้อมเพย์ตัดยอดซ้ำสองรอบ รบกวนคืนเงินด่วนครับ",
    "ระบบตัดบัตรเครดิตผิดพลาด ยอดหายไปช่วยตรวจด่วนค่ะ",
    "สินค้าเสียหายหนักมาก ลูกค้า VIP ต้องการเปลี่ยนด่วน",
]
normal_texts = [
    "ขอใบกำกับภาษีเต็มรูปแบบส่งทางอีเมลครับ",
    "สอบถามสถานะเลขพัสดุหน่อยค่ะ",
    "อยากทราบวิธีเปลี่ยนที่อยู่จัดส่งในแอปครับ",
]

rows = []
for i in range(300):
    is_urgent = int(rng.random() < 0.25)
    text = urgent_texts[i % len(urgent_texts)] if is_urgent else normal_texts[i % len(normal_texts)]
    rows.append({
        "text": text,
        "tokenized_text": pretokenize_thai(text),
        "customer_tier": "vip" if (is_urgent and rng.random() < 0.6) else rng.choice(["standard", "silver", "gold"]),
        "channel": str(rng.choice(["line", "chat", "email"])),
        "order_value_thb": float(rng.normal(4200, 900) if is_urgent else rng.normal(850, 250)),
        "wait_minutes": float(rng.normal(30, 8) if is_urgent else rng.normal(8, 3)),
        "past_tickets_30d": int(rng.poisson(2.5) if is_urgent else rng.poisson(0.5)),
        "is_urgent": is_urgent,
    })

df_pl = pl.DataFrame(rows).with_columns(pl.col("order_value_thb").clip(lower_bound=50.0))
df = pd.DataFrame(df_pl.to_dicts())

tr_val, test_df = train_test_split(df, test_size=0.2, stratify=df["is_urgent"], random_state=42)
train_df, val_df = train_test_split(tr_val, test_size=0.25, stratify=tr_val["is_urgent"], random_state=42)
print("Splits:", len(train_df), len(val_df), len(test_df), "| Urgent rate:", round(df["is_urgent"].mean(), 3))`,
        },
        output: `Splits: 180 60 60 | Urgent rate: 0.247`,
      },
      {
        title: "2 · เทรนเทียบ LogisticRegression vs LightGBM ด้วย Hybrid ColumnTransformer",
        explain:
          "ใช้ `ColumnTransformer` ชุดเดียวกันส่งเข้าทั้ง `LogisticRegression` และ `LGBMClassifier` แล้วเทียบคะแนน `PR-AUC` บนชุด Validation เพื่อเลือกผู้ชนะ",
        code: {
          language: "python",
          filename: "worked_day56.py",
          code: `import lightgbm as lgb
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

FEATURE_COLS = ["tokenized_text", "customer_tier", "channel", "order_value_thb", "wait_minutes", "past_tickets_30d"]


def make_pipe(model_type: str) -> Pipeline:
    prep = ColumnTransformer([
        ("text", TfidfVectorizer(token_pattern=r"(?u)\S+", lowercase=False, ngram_range=(1, 2)), "tokenized_text"),
        ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), ["order_value_thb", "wait_minutes", "past_tickets_30d"]),
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["customer_tier", "channel"]),
    ])
    clf = (
        LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
        if model_type == "logreg"
        else lgb.LGBMClassifier(n_estimators=60, learning_rate=0.05, num_leaves=15, min_child_samples=5, random_state=42, verbosity=-1)
    )
    return Pipeline([("prep", prep), ("clf", clf)])


best_name, best_pipe, best_val_ap = "", None, -1.0
for name in ("logreg", "lightgbm"):
    pipe = make_pipe(name)
    pipe.fit(train_df[FEATURE_COLS], train_df["is_urgent"])
    val_prob = pipe.predict_proba(val_df[FEATURE_COLS])[:, 1]
    val_ap = float(average_precision_score(val_df["is_urgent"], val_prob))
    print(f"Model={name:8s} | Val PR-AUC={val_ap:.4f}")
    if val_ap > best_val_ap:
        best_name, best_pipe, best_val_ap = name, pipe, val_ap`,
        },
        output: `Model=logreg   | Val PR-AUC=1.0000
Model=lightgbm | Val PR-AUC=1.0000`,
      },
      {
        title: "3 · จูน Threshold บน Val, ประเมินบน Test ครั้งเดียว และบันทึก Bundle + Drift Baseline",
        explain:
          "หา `best_threshold` บน Val set ตามต้นทุน `cost_fp=100, cost_fn=1000`, วัดผลบน Test, บันทึก `model.joblib` พร้อม SHA-256, `metrics.json` และ `drift_baseline.json`",
        code: {
          language: "python",
          filename: "worked_day56.py",
          code: `import hashlib
import json
from pathlib import Path
import joblib
from sklearn.metrics import confusion_matrix, precision_score, recall_score

p_val = best_pipe.predict_proba(val_df[FEATURE_COLS])[:, 1]
y_val = val_df["is_urgent"].to_numpy()

def cost_at(y_true, y_prob, th, cost_fp=100.0, cost_fn=1000.0):
    y_hat = (y_prob >= th).astype(int)
    _, fp, fn, _ = confusion_matrix(y_true, y_hat, labels=[0, 1]).ravel()
    return float(fp * cost_fp + fn * cost_fn)

grid = [round(float(x), 2) for x in np.linspace(0.10, 0.90, 17)]
best_th = min(grid, key=lambda th: (cost_at(y_val, p_val, th), -th))

p_test = best_pipe.predict_proba(test_df[FEATURE_COLS])[:, 1]
y_test = test_df["is_urgent"].to_numpy()
y_pred = (p_test >= best_th).astype(int)

out = Path("artifacts/ticket_priority/v1.0.0")
out.mkdir(parents=True, exist_ok=True)
model_path = out / "model.joblib"
joblib.dump(best_pipe, model_path)

metrics = {
    "model_type": best_name,
    "artifact_sha256": hashlib.sha256(model_path.read_bytes()).hexdigest(),
    "val_pr_auc": round(best_val_ap, 4),
    "test_pr_auc": round(float(average_precision_score(y_test, p_test)), 4),
    "best_threshold": best_th,
    "test_urgent_recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
    "test_urgent_precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
}
baseline = {
    "order_value_quantiles": [round(float(q), 2) for q in np.quantile(train_df["order_value_thb"], np.linspace(0, 1, 6))],
    "vocab_size": len(best_pipe.named_steps["prep"].named_transformers_["text"].vocabulary_),
    "train_positive_rate": round(float(train_df["is_urgent"].mean()), 4),
}
(out / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
(out / "drift_baseline.json").write_text(json.dumps(baseline, indent=2), encoding="utf-8")
print("Exported:", metrics["model_type"], "| Test PR-AUC:", metrics["test_pr_auc"], "| Recall:", metrics["test_urgent_recall"])`,
        },
        output: `Exported: logreg | Test PR-AUC: 1.0 | Recall: 1.0`,
      },
    ],
    gotcha:
      "จุดสังเกต: ในชุดข้อมูลสังเคราะห์ตัวอย่างนี้ข้อความด่วนกับปกติแยกกันชัดมากจึงได้ `PR-AUC = 1.0` — ในชุดข้อมูลจริง (และใน Day 57 Error Analysis) ข้อความจะกำกวม ปนคำผิด และมีเคสก้ำกึ่งที่ทำให้ได้ PR-AUC ราว `0.80–0.90` ซึ่งเป็นจุดที่เราจะไปผ่าหา Error Modes กันในวันพรุ่งนี้",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + End-to-End Integration (15 นาที): สร้างโมดูล `train_ticket_pipeline.py` ที่ร้อยทั้ง Pre-tokenization ภาษาไทย, Hybrid `ColumnTransformer`, Val-only Threshold Tuning และ Immutable Artifact Export ครบจบในชุดเดียว",
    requirements: [
      "`pretokenize_thai(text: str) -> str`: ตัดคำด้วย `PyThaiNLP newmm` พร้อม custom dictionary (`{\"พร้อมเพย์\", \"ใบกำกับภาษี\", \"เลขพัสดุ\", \"คืนเงิน\"}`), แปลงเป็นตัวพิมพ์เล็ก และเชื่อมด้วยช่องว่าง `\" \"`",
      "`build_hybrid_pipeline(model_type: str = \"logreg\") -> Pipeline`: ประกอบ `ColumnTransformer` ที่มี 3 สาขา (`text` ใช้ `TfidfVectorizer(token_pattern=r\"(?u)\\S+\", lowercase=False)`, `num` ใช้ `SimpleImputer + StandardScaler`, `cat` ใช้ `OneHotEncoder(handle_unknown=\"ignore\")`) ต่อกับ `LogisticRegression` (เมื่อ `model_type == \"logreg\"`) หรือ `LGBMClassifier` (เมื่อ `model_type == \"lightgbm\"`) หากชื่อโมเดลไม่รู้จักให้ `raise ValueError`",
      "`tune_threshold_on_val(y_val: np.ndarray, p_val: np.ndarray, cost_fp: float = 100.0, cost_fn: float = 1000.0) -> float`: กวาด threshold ช่วง `0.10..0.90` (step `0.05`) บนชุด Validation แล้วคืน threshold ที่ให้ `fp * cost_fp + fn * cost_fn` ต่ำที่สุด (ถ้าเสมอกันเลือก threshold ที่สูงกว่า)",
      "`train_and_export_bundle(df_pl: pl.DataFrame, out_root: Path, version: str, model_type: str = \"logreg\") -> dict[str, object]`: เพิ่มคอลัมน์ `tokenized_text` ด้วย `pretokenize_thai`, แบ่ง Train/Val/Test (60/20/20, `stratify`, `random_state=42`), เทรนบน Train, จูน threshold บน Val, ประเมินบน Test, บันทึก `model.joblib`, `metrics.json` (ต้องมี `version`, `model_type`, `artifact_sha256`, `val_pr_auc`, `test_pr_auc`, `best_threshold`, `test_urgent_recall`, `test_urgent_precision`) และ `drift_baseline.json` (ต้องมี `order_value_quantiles`, `vocab_size`, `train_positive_rate`) แบบห้ามเขียนทับเวอร์ชันเดิม (`FileExistsError`)",
    ],
    starter: {
      language: "python",
      filename: "train_ticket_pipeline.py",
      code: `import hashlib
import json
from pathlib import Path

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
import polars as pl
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, confusion_matrix, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DOMAIN_TERMS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "คืนเงิน"}
CUSTOM_DICT = dict_trie(set(thai_words()) | DOMAIN_TERMS)
FEATURE_COLS = [
    "tokenized_text",
    "customer_tier",
    "channel",
    "order_value_thb",
    "wait_minutes",
    "past_tickets_30d",
]


def pretokenize_thai(text: str) -> str:
    """ตัดคำภาษาไทยด้วย newmm + custom dict แล้วเชื่อมด้วยช่องว่าง"""
    # TODO: ตัดคำ แปลง lowercase แล้ว join ด้วย " "
    raise NotImplementedError


def build_hybrid_pipeline(model_type: str = "logreg") -> Pipeline:
    """ประกอบ ColumnTransformer (Thai TF-IDF + Numeric + Categorical) + Classifier"""
    # TODO: รองรับ "logreg" และ "lightgbm" นอกนั้น raise ValueError
    raise NotImplementedError


def tune_threshold_on_val(
    y_val: np.ndarray,
    p_val: np.ndarray,
    cost_fp: float = 100.0,
    cost_fn: float = 1000.0,
) -> float:
    """หา threshold ที่ลดต้นทุนธุรกิจต่ำสุดบนชุด Validation"""
    # TODO: กวาด 0.10..0.90 ทีละ 0.05 แล้วคืน threshold ที่คุ้มทุนที่สุด
    raise NotImplementedError


def train_and_export_bundle(
    df_pl: pl.DataFrame,
    out_root: Path,
    version: str,
    model_type: str = "logreg",
) -> dict[str, object]:
    """เทรน ประเมิน และบันทึก Immutable Bundle (model.joblib + metrics.json + drift_baseline.json)"""
    # TODO: ตรวจ immutability, pretokenize, split 60/20/20, fit, tune val, eval test, export 3 files
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day56.py",
      code: `import hashlib
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import polars as pl
import pytest
from train_ticket_pipeline import (
    FEATURE_COLS,
    build_hybrid_pipeline,
    pretokenize_thai,
    train_and_export_bundle,
    tune_threshold_on_val,
)


def _synthetic_tickets(n: int = 240) -> pl.DataFrame:
    rng = np.random.default_rng(2025)
    urgent_pool = [
        "โอนผ่านพร้อมเพย์ตัดเงินซ้ำขอคืนเงินด่วน",
        "ระบบหักเงินผิดปกติช่วยเช็กด่วนครับ",
        "สินค้าแตกเสียหายลูกค้า VIP รอนานแล้ว",
        "เข้าใช้งานบัญชีไม่ได้และติดปัญหาชำระเงิน",
    ]
    normal_pool = [
        "ขอใบกำกับภาษีส่งทางอีเมลครับ",
        "ขอเลขพัสดุเช็กสถานะการจัดส่งค่ะ",
        "สอบถามวิธีเปลี่ยนรหัสผ่านในแอป",
        "อยากทราบรายละเอียดโปรโมชันเดือนนี้",
    ]
    rows = []
    for i in range(n):
        urgent = int(rng.random() < 0.25)
        # ใส่ noise เล็กน้อย (10%) ให้สมจริง
        use_urgent_text = urgent if rng.random() > 0.10 else (1 - urgent)
        text = urgent_pool[i % len(urgent_pool)] if use_urgent_text else normal_pool[i % len(normal_pool)]
        rows.append({
            "text": text,
            "customer_tier": "vip" if (urgent and rng.random() < 0.55) else str(rng.choice(["standard", "silver", "gold"])),
            "channel": str(rng.choice(["line", "chat", "email"])),
            "order_value_thb": float(max(50.0, rng.normal(3800, 1200) if urgent else rng.normal(900, 400))),
            "wait_minutes": float(max(1.0, rng.normal(28, 10) if urgent else rng.normal(9, 4))),
            "past_tickets_30d": int(rng.poisson(2.2) if urgent else rng.poisson(0.6)),
            "is_urgent": urgent,
        })
    return pl.DataFrame(rows)


def test_pretokenize_keeps_domain_terms():
    out = pretokenize_thai("โอนผ่านพร้อมเพย์ ขอใบกำกับภาษี PromptPay")
    tokens = out.split()
    assert "พร้อมเพย์" in tokens
    assert "ใบกำกับภาษี" in tokens
    assert "promptpay" in tokens


def test_build_pipeline_rejects_unknown_model():
    with pytest.raises(ValueError):
        build_hybrid_pipeline("unknown_model")


def test_end_to_end_train_export_and_reload(tmp_path: Path):
    df_pl = _synthetic_tickets(240)
    metrics = train_and_export_bundle(df_pl, tmp_path, version="v1.0.0", model_type="logreg")
    bundle_dir = tmp_path / "v1.0.0"

    assert (bundle_dir / "model.joblib").exists()
    assert (bundle_dir / "metrics.json").exists()
    assert (bundle_dir / "drift_baseline.json").exists()

    assert metrics["test_pr_auc"] >= 0.75
    assert metrics["test_urgent_recall"] >= 0.75
    assert 0.10 <= metrics["best_threshold"] <= 0.90

    # ตรวจ checksum และโหลดกลับมาทำนายต้องทำงานได้ปกติ
    actual_sha = hashlib.sha256((bundle_dir / "model.joblib").read_bytes()).hexdigest()
    assert metrics["artifact_sha256"] == actual_sha

    loaded_pipe = joblib.load(bundle_dir / "model.joblib")
    sample_pd = pd.DataFrame([{
        "tokenized_text": pretokenize_thai("โอนพร้อมเพย์ซ้ำขอคืนเงินด่วน"),
        "customer_tier": "vip",
        "channel": "line",
        "order_value_thb": 5500.0,
        "wait_minutes": 35.0,
        "past_tickets_30d": 3,
    }])
    prob = float(loaded_pipe.predict_proba(sample_pd[FEATURE_COLS])[0, 1])
    assert 0.0 <= prob <= 1.0

    baseline = json.loads((bundle_dir / "drift_baseline.json").read_text(encoding="utf-8"))
    assert baseline["vocab_size"] > 5
    assert len(baseline["order_value_quantiles"]) >= 2

    # ห้ามเซฟทับเวอร์ชันเดิม
    with pytest.raises(FileExistsError):
        train_and_export_bundle(df_pl, tmp_path, version="v1.0.0", model_type="logreg")


def test_lightgbm_branch_and_val_threshold_tuning(tmp_path: Path):
    df_pl = _synthetic_tickets(240)
    metrics = train_and_export_bundle(df_pl, tmp_path, version="v1.1.0", model_type="lightgbm")
    assert metrics["model_type"] == "lightgbm"
    assert metrics["test_pr_auc"] >= 0.75

    th = tune_threshold_on_val(
        np.array([1, 1, 0, 0, 0, 0]),
        np.array([0.80, 0.30, 0.40, 0.20, 0.10, 0.05]),
        cost_fp=100.0,
        cost_fn=1000.0,
    )
    assert th <= 0.30
`,
    },
    selfCheck: [
      "`pretokenize_thai` คงคำศัพท์เฉพาะอย่าง `พร้อมเพย์`, `ใบกำกับภาษี` และแปลงคำอังกฤษเป็น lowercase ได้ถูกต้อง",
      "ทั้งสาขา `logreg` และ `lightgbm` เทรนบน `ColumnTransformer` ได้สำเร็จและทำ `test_pr_auc >= 0.75`",
      "`train_and_export_bundle` สร้างครบทั้ง `model.joblib`, `metrics.json` (พร้อม SHA-256) และ `drift_baseline.json`",
      "โหลด `model.joblib` กลับมาด้วย `joblib.load` แล้วยิง `predict_proba` ได้โดยไม่มี `PicklingError`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านครบทั้ง 4 เทสต์",
    ],
    acceptance:
      "ผ่านทั้ง 4 test functions ใน `test_day56.py` (ทั้ง LogisticRegression และ LightGBM end-to-end) ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `train_and_export_bundle` ตรวจ `bundle_dir = out_root / version; if bundle_dir.exists(): raise FileExistsError(...)` ตั้งแต่ต้นฟังก์ชัน จากนั้นสร้างคอลัมน์ `tokenized_text` ใน pandas ด้วย `df[\"tokenized_text\"] = [pretokenize_thai(t) for t in df[\"text\"]]`",
      },
      {
        body: "ใน `tune_threshold_on_val` ใช้ `grid = [round(float(x), 2) for x in np.linspace(0.10, 0.90, 17)]` แล้วหาค่าต่ำสุดด้วย `min(grid, key=lambda th: (cost_of(th), -th))`",
      },
      {
        body: "โครงของ `build_hybrid_pipeline` และ `tune_threshold_on_val` พร้อมแล้ว เหลือเติม `pretokenize_thai` และร้อยขั้นตอนทั้งหมดใน `train_and_export_bundle`:",
        code: {
          language: "python",
          filename: "hint_day56.py",
          code: `def build_hybrid_pipeline(model_type: str = "logreg") -> Pipeline:
    prep = ColumnTransformer([
        ("text", TfidfVectorizer(token_pattern=r"(?u)\S+", lowercase=False, ngram_range=(1, 2)), "tokenized_text"),
        ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), ["order_value_thb", "wait_minutes", "past_tickets_30d"]),
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["customer_tier", "channel"]),
    ])
    if model_type == "logreg":
        clf = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    elif model_type == "lightgbm":
        clf = lgb.LGBMClassifier(
            n_estimators=60, learning_rate=0.05, num_leaves=15,
            min_child_samples=5, random_state=42, verbosity=-1,
        )
    else:
        raise ValueError(f"Unsupported model_type: {model_type}")
    return Pipeline([("prep", prep), ("clf", clf)])


def tune_threshold_on_val(
    y_val: np.ndarray, p_val: np.ndarray, cost_fp: float = 100.0, cost_fn: float = 1000.0
) -> float:
    grid = [round(float(x), 2) for x in np.linspace(0.10, 0.90, 17)]
    def _cost(th: float) -> float:
        y_hat = (p_val >= th).astype(int)
        _, fp, fn, _ = confusion_matrix(y_val, y_hat, labels=[0, 1]).ravel()
        return float(fp * cost_fp + fn * cost_fn)
    return min(grid, key=lambda th: (_cost(th), -th))`,
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
      title: "ส่งชื่อคอลัมน์ข้อความเป็น list ([\"tokenized_text\"]) เข้า ColumnTransformer",
      symptom: "`TfidfVectorizer` ได้รับ DataFrame 2D แทนที่จะเป็น 1D Series ทำให้มันเอา *ชื่อคอลัมน์* มา fit เป็นคำศัพท์แทนเนื้อหาทิกเก็ตและเกิด `ValueError: Found input variables with inconsistent numbers of samples`",
      fix: "สำหรับ `TfidfVectorizer` ใน `ColumnTransformer` ต้องส่งชื่อคอลัมน์เป็น **สตริงเดี่ยว** `\"tokenized_text\"` เสมอ (ส่วน numeric/categorical ส่งเป็นลิสต์)",
    },
    {
      title: "ผูก lambda หรือ closure tokenizer ไว้ใน TfidfVectorizer แล้วสั่ง joblib.dump",
      symptom: "เทรนสำเร็จทุกอย่าง แต่พอบันทึกโมเดลกลับพังด้วย `AttributeError: Can't pickle local object`",
      fix: "ใช้รูปแบบ **Pre-Tokenized Thai Text** (ตัดคำด้วย `PyThaiNLP` คั่นด้วยช่องว่างก่อน แล้วให้ `TfidfVectorizer(token_pattern=r'(?u)\\S+', lowercase=False)` อ่านต่อ) เพื่อให้ไฟล์โมเดลไม่มี custom closure",
    },
    {
      title: "ลืมตั้ง OneHotEncoder(handle_unknown=\"ignore\") ใน ColumnTransformer",
      symptom: "ตอนทำนายบน Test หรือ Production เจอช่องทางใหม่ (เช่น `\"tiktok\"`) ที่ไม่เคยอยู่ในชุด Train แล้วโปรแกรมระเบิดด้วย `ValueError: Found unknown categories`",
      fix: "ตั้ง `OneHotEncoder(handle_unknown=\"ignore\")` เสมอใน Production pipeline",
    },
    {
      title: "เอา Test Set มาใช้ทั้งเลือกโมเดลและจูน Threshold",
      symptom: "คะแนน Test PR-AUC และ Recall ดูดีเกินความจริงเพราะเกิด {{data-leakage}} ในขั้นตอนเลือกโมเดล",
      fix: "เลือกโมเดล (`logreg` vs `lightgbm`) และจูน `best_threshold` บน **Validation Set เท่านั้น** แล้วแตะ Test Set เพียงครั้งเดียวตอนสรุปผล",
    },
  ],

  quiz: {
    intro:
      "Interleaved Recall Quiz (4 ข้อ ทบทวน D43 + D47 + D53 + D54 + D55 + D56) — ลองตอบจากความจำก่อนดูเฉลย",
    questions: [
      mc(
        "d056-q1",
        "[ทบทวน D43 + D56] ใน `ColumnTransformer` ของ `scikit-learn` ทำไมคอลัมน์ข้อความสำหรับ `TfidfVectorizer` จึงต้องระบุเป็นสตริงเดี่ยว `\"tokenized_text\"` แทนที่จะเป็นลิสต์ `[\"tokenized_text\"]`?",
        [
          ["เพราะ `ColumnTransformer` ไม่รองรับชนิดข้อมูล `list` เลย", "ไม่จริง — คอลัมน์ numeric และ categorical ใช้ `list` ตามปกติ"],
          ["เพราะ `TfidfVectorizer` คาดหวังอินพุต 1D (iterable ของข้อความ) การส่งเป็นลิสต์จะส่ง DataFrame 2D เข้าไปจนเกิด error หรือ fit ชื่อคอลัมน์แทนข้อความ", "ถูก — นี่คือจุดที่พังบ่อยที่สุดเวลาผสม Text กับ Tabular ใน `ColumnTransformer`"],
          ["เพราะ `TfidfVectorizer` รับได้เฉพาะภาษาอังกฤษเมื่อส่งเป็นลิสต์", "ไม่เกี่ยว — เป็นเรื่องมิติของอินพุต (1D vs 2D)"],
          ["เพื่อทำให้ `TfidfVectorizer` ข้ามการคำนวณค่า IDF", "ไม่เกี่ยวกันเลย"],
        ],
        "B",
        "ความต่างสำคัญใน `ColumnTransformer`: transformer ตารางรับ 2D (`[\"col1\", \"col2\"]`) แต่ `TfidfVectorizer` รับ 1D (`\"text_col\"`)",
        "ใน `ColumnTransformer` ต้องส่งชื่อคอลัมน์ให้ `TfidfVectorizer` ต่างจาก `StandardScaler` อย่างไร?",
        "`TfidfVectorizer` ต้องส่งเป็นสตริงเดี่ยว (`\"tokenized_text\"`) เพื่อให้ได้อินพุต 1D ส่วน `StandardScaler` / `OneHotEncoder` ส่งเป็นลิสต์ (`[\"col1\", \"col2\"]`) เพื่อให้ได้ 2D",
      ),
      mc(
        "d056-q2",
        "[ทบทวน D53 + D56] ข้อดีของรูปแบบ **Pre-Tokenized Thai Text** (`pretokenize_thai` → `TfidfVectorizer(token_pattern=r'(?u)\\S+')`) เมื่อเทียบกับการฝัง closure tokenizer เข้าไปใน `TfidfVectorizer` คืออะไร?",
        [
          ["ทำให้ไม่ต้องใช้ `PyThaiNLP` ในโปรเจกต์อีกต่อไป", "ไม่จริง — เรายังใช้ `PyThaiNLP newmm` ในฟังก์ชัน `pretokenize_thai` ก่อนเข้า pipeline"],
          ["หลีกเลี่ยง `PicklingError` ตอน `joblib.dump`, ไม่ต้องเก็บอ็อบเจกต์ `Trie` ไว้ในไฟล์โมเดล และทำให้แยกชั้นข้อความออกจากโมเดลได้สะอาด", "ถูก — การย้ายโมเดลข้ามเครื่องและเขียนเทสต์จะเสถียรขึ้นมาก"],
          ["ทำให้ไฟล์ `model.joblib` แปลงเป็น SQL ได้อัตโนมัติ", "ไม่เกี่ยวกันเลย"],
          ["ทำให้ค่า IDF ของทุกคำเท่ากับ 1.0 เสมอ", "ไม่จริง — ค่า TF-IDF ยังคำนวณตามปกติทุกประการ"],
        ],
        "B",
        "การแยก Thai word segmentation ไว้ก่อนเข้า `ColumnTransformer` ช่วยตัด custom closure ออกจากไฟล์โมเดล ทำให้ `joblib` เสถียรและสะอาดมาก",
        "ทำไมการทำ Pre-Tokenize ภาษาไทยก่อนส่งเข้า `TfidfVectorizer` จึงเหมาะกับ Production Serialization?",
        "ช่วยป้องกัน `PicklingError` จาก local closure/lambda และไม่แบกอ็อบเจกต์ `Trie` ไว้ในไฟล์โมเดล ทำให้โหลดข้าม environment ได้สะอาดและเสถียร",
      ),
      mc(
        "d056-q3",
        "[ทบทวน D47 + D54] หลังปล่อย End-to-End `LightGBM` Pipeline ขึ้นใช้งานไป 3 สัปดาห์ คุณพบว่า `drift_baseline.json` เทียบกับสัปดาห์ล่าสุดได้ `order_value_thb PSI = 0.34`, `thai_oov_rate = 0.06` และ `missing_delta = +0.22` สิ่งแรกที่ควรสงสัยคืออะไร?",
        [
          ["ลูกค้าเปลี่ยนคำศัพท์ภาษาไทยใหม่หมดทั้งระบบ", "ไม่ตรง — `thai_oov_rate` แค่ 6% ถือว่าปกติมาก"],
          ["น่าจะเกิด upstream data pipeline bug ที่ทำให้ฟีเจอร์ตัวเลขหายไปกว่า 22% จึงควรตรวจสอบระบบต้นทางก่อนสั่ง retrain", "ถูก — `missing_delta = +0.22` เป็นสัญญาณชัดเจนของปัญหา ingestion/schema ต้นทาง"],
          ["`LightGBM` มีจำนวนต้นไม้น้อยเกินไป ต้องเพิ่ม `n_estimators` ทันที", "ไม่เกี่ยว — ปัญหานี้เกิดที่คุณภาพข้อมูลอินพุต ไม่ใช่จำนวนต้นไม้"],
          ["ค่า `SHA-256` ของไฟล์โมเดลหมดอายุหลัง 3 สัปดาห์", "ไม่จริง — SHA-256 ไม่มีวันหมดอายุ"],
        ],
        "B",
        "การอ่านหลาย Proxy Signals คู่กันช่วยให้วินิจฉัยแม่นยำ: OOV ปกติแต่ Missing พุ่ง +22% บ่งชี้ว่าข้อมูลจากต้นทางพัง ไม่ใช่ลูกค้าเปลี่ยนพฤติกรรม",
        "เมื่อเห็น `missing_delta` พุ่งสูงพร้อมกับ `numeric_psi` สูง แต่ `oov_rate` ปกติ ควรสงสัยอะไรเป็นอันดับแรก?",
        "สงสัย upstream ingestion/API bug (เช่น ฟิลด์ส่งค่าว่างหรือ schema เปลี่ยน) และตรวจสอบระบบต้นทางก่อนเสมอ ห้ามรีบ retrain ด้วยข้อมูลเสีย",
      ),
      mc(
        "d056-q4",
        "[ทบทวน D53 + D55] ในขั้นตอน `train_and_export_bundle` ทำไมเราจึงต้องบันทึกทั้ง `metrics.json` และ `drift_baseline.json` คู่กับ `model.joblib` ภายใต้โฟลเดอร์เวอร์ชันแบบห้ามเขียนทับ?",
        [
          ["เพราะ `scikit-learn` จะไม่ยอมให้เรียก `.predict()` ถ้าไม่มีไฟล์ทั้งสามอยู่ในโฟลเดอร์เดียวกัน", "ไม่จริง — `scikit-learn` โหลดแค่ `model.joblib` ก็รันได้ แต่ระบบวิศวกรที่ดีต้องมี metadata และ baseline คู่กัน"],
          ["เพื่อให้ทุกเวอร์ชันมีหลักฐานผลการประเมิน, `SHA-256`, `best_threshold` และค่าอ้างอิงสำหรับ Drift Monitoring ครบชุด และสามารถ rollback ได้ทันทีหากเวอร์ชันใหม่มีปัญหา", "ถูก — ครบทั้ง Reproducibility, Auditability และ Operational Safety"],
          ["เพื่อเพิ่มความเร็วของ `LightGBM` ขึ้น 10 เท่า", "ไม่เกี่ยว — ไฟล์ JSON ไม่ได้เปลี่ยนความเร็วของอัลกอริทึม"],
          ["เพื่อให้สามารถข้ามการแบ่ง Validation Set ได้ในรอบหน้า", "ผิด — ยังต้องแบ่ง Train/Val/Test อย่างเคร่งครัดทุกรอบ"],
        ],
        "B",
        "Immutable Artifact Bundle ทำให้การปล่อยโมเดล การเฝ้าระวัง Drift และการย้อนเวอร์ชัน (rollback) เป็นกระบวนการที่คาดเดาได้และปลอดภัย",
        "ไฟล์ 3 ชิ้นหลักที่สคริปต์เทรน End-to-End ใน Day 56 สร้างลงในโฟลเดอร์เวอร์ชันคืออะไรบ้าง?",
        "1) `model.joblib` (โมเดลพร้อม SHA-256), 2) `metrics.json` (ผลประเมิน Val/Test และ `best_threshold`), และ 3) `drift_baseline.json` (quantiles, vocab_size, positive_rate สำหรับเฝ้าระวัง Drift)",
      ),
    ],
  },

  takeaways: [
    "วันนี้เราร้อยต่อ Phase 2 ได้ครบวงจร: {{polars}} → `PyThaiNLP` Pre-Tokenization → Hybrid `ColumnTransformer` ({{sklearn-pipeline}}) → `LogisticRegression` / {{lightgbm}} → Val-only Threshold Tuning → Immutable Artifact Bundle",
    "การทำ **Pre-Tokenized Thai Text** คู่กับ `TfidfVectorizer(token_pattern=r'(?u)\\S+', lowercase=False)` ช่วยให้ `Pipeline` ไม่มี custom closure และผ่าน {{serialization}} ด้วย `joblib` ได้อย่างสะอาด",
    "การเทรน 1 รอบที่ดีต้องผลิตครบทั้งไฟล์โมเดล (พร้อม `SHA-256`), `metrics.json` และ `drift_baseline.json` เพื่อส่งต่อเข้าสู่ระบบเฝ้าระวัง {{feature-drift}} ได้ทันที",
    "จบ Block B14 แล้ว! ใน Block B15 (Day 57–60) เราจะนำโมเดลชุดนี้ไปทำ Error Analysis, Benchmark Latency `<10ms` ด้วย ONNX, เขียน Reproducible Tests และปิดท้ายด้วย Phase 2 Demo",
  ],

  reviewCards: [
    rc(
      "d056-rc-1",
      "3 จุดต้องระวังเมื่อสร้าง Hybrid `ColumnTransformer` (ข้อความไทย + Tabular) ใน `scikit-learn` คืออะไร?",
      "1) ส่งคอลัมน์ข้อความเป็นสตริงเดี่ยว (`\"tokenized_text\"`) ไม่ใช่ลิสต์, 2) ตั้ง `OneHotEncoder(handle_unknown=\"ignore\")`, และ 3) แยก Thai pre-tokenization เพื่อไม่ให้ติด `PicklingError` ตอนเซฟ",
    ),
    rc(
      "d056-rc-2",
      "ลำดับการใช้ชุด Train / Val / Test ที่ปลอด Data Leakage ใน End-to-End Pipeline คืออะไร?",
      "Train = `.fit()` โมเดลและ preprocessor; Val = เปรียบเทียบโมเดล (`logreg` vs `lightgbm`) และจูน `best_threshold`; Test = ประเมินครั้งเดียวตอนจบด้วยโมเดลและ threshold ที่ล็อกไว้แล้ว",
    ),
    rc(
      "d056-rc-3",
      "ข้อมูลใดบ้างที่ควรบันทึกลงใน `drift_baseline.json` ทันทีหลังเทรนเสร็จ?",
      "ขอบ quantile bins ของฟีเจอร์ตัวเลขสำคัญ (เช่น `order_value_thb`), ขนาดหรือชุดคำศัพท์ (`vocab`) จากชุด Train สำหรับวัด Thai OOV Rate และ `train_positive_rate` สำหรับเทียบ Prediction Shift",
    ),
  ],

  sources: [
    {
      label: "scikit-learn User Guide — Pipelines and Composite Estimators",
      href: "https://scikit-learn.org/stable/modules/compose.html",
    },
    {
      label: "LightGBM Documentation — Scikit-Learn API (LGBMClassifier)",
      href: "https://lightgbm.readthedocs.io/en/latest/pythonapi/lightgbm.LGBMClassifier.html",
    },
    {
      label: "PyThaiNLP Documentation — Word Tokenization & Custom Dictionary",
      href: "https://pythainlp.github.io/docs/5.0/api/tokenize.html",
    },
    {
      label: "joblib Documentation — Persistence",
      href: "https://joblib.readthedocs.io/en/stable/persistence.html",
    },
  ],

  glossary: [
    "sklearn-pipeline",
    "pythainlp",
    "tfidf",
    "lightgbm",
    "polars",
    "precision-recall",
    "serialization",
    "feature-drift",
  ],
});
