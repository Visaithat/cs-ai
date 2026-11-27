import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D052 — Phase 2 / Block B13 (Review Day)
 * Interleaved recall of D49–D51 (+ D45) + Controlled A/B comparison:
 * Thai PyThaiNLP newmm TF-IDF baseline vs raw whitespace split on identical 5-Fold Stratified CV.
 */
export const d052: Lesson = defineLesson({
  day: 52,
  titleTh: "ทบทวน B13: วัดผลเทียบจริง Thai PyThaiNLP TF-IDF กับ Whitespace Split บน 5-Fold CV",
  tagline: "30 นาที · รอบทบทวน D49–D51 + D45 · รันบน CPU เครื่องคุณ 100% ไม่ต้องใช้ API key · ทดลอง A/B คุมตัวแปรพิสูจน์ส่วนต่าง Macro-F1 จริง",
  icon: "scissors",
  visual: {
    id: "thai-cv-tuning",
    title: "ทบทวน B13: วัดผลเทียบจริง Thai PyThaiNLP newmm vs Whitespace Split",
    caption: "เห็นความต่างของ Macro-F1 และจำนวนฟีเจอร์คำไทยที่แยกได้เมื่อตัดคำด้วย newmm + custom dict",
    alt: "แผนภาพเปรียบเทียบผล Thai TF-IDF กับ raw whitespace split",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP", "scikit-learn", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "พิสูจน์ผลกระทบของการตัดคำไทยด้วยตัวเลข ไม่ใช่ความรู้สึก",
      body: "ใน Day 49 เราเห็นด้วยตาเปล่าว่า default `TfidfVectorizer()` มองประโยคไทยติดกันเป็นก้อนเดียว — แต่วิศวกร AI ที่ดีไม่เชื่อแค่ตัวอย่าง 2 ประโยค เราต้องพิสูจน์ด้วย **Controlled A/B Experiment** บนชุดข้อมูลจริง",
      lessonNote: "วันนี้เราเทียบ `raw whitespace TfidfVectorizer` กับ `PyThaiNLP newmm + custom dict` บนโมเดลและข้อมูลชุดเดียวกันเป๊ะ",
    },
    {
      node: 2,
      heading: "ร้อยต่อครบทั้ง B13: Tokenizer + Fast Pipeline + 5-Fold CV",
      body: "รวมทุกชิ้นส่วนจาก D49 ({{pythainlp}} `newmm` + {{tfidf}}), D50 ({{sklearn-pipeline}} + `LogisticRegression(class_weight=\"balanced\")`) และ D51 (`StratifiedKFold` 5-Fold {{cross-validation}})",
      lessonNote: "ล็อก classifier, `class_weight`, `random_state` และ CV fold indices ให้เหมือนกัน 100% เพื่อให้ความต่างเกิดจาก **ตัวตัดคำไทยเพียงปัจจัยเดียว**",
    },
    {
      node: 3,
      heading: "วัดผลด้วย Macro-F1 และส่อง OOV / Vocabulary Diagnostics",
      body: "ทบทวน D45 ({{precision-recall|Precision / Recall / Macro-F1}}) ร่วมกับ D51 (`mean ± std` ข้าม 5 folds) พร้อมตรวจดูว่าแต่ละวิธีมีสัดส่วนคำศัพท์ที่รู้จักร่วมกันมากน้อยแค่ไหน",
      lessonNote: "เห็นชัดเป็นตัวเลขว่า `newmm` ดัน Macro-F1 เพิ่มขึ้นหลายสิบจุด และลดปัญหาคำที่ไม่รู้จัก (OOV) ลงอย่างฮวบฮาบ",
    },
    {
      node: 6,
      heading: "เตรียมพร้อมต่อยอดสู่ Deployment (B14) และ Thai Hybrid RAG (Phase 4)",
      body: "บทพิสูจน์วันนี้คือหลักฐานเชิงประจักษ์ที่จะติดตัวคุณไปทั้งตอน serialize โมเดลเป็น joblib/ONNX ใน Day 53 และตอนสร้าง Thai {{bm25}} Index ใน Day 99",
      lessonNote: "จบ B13 ด้วยชุดทดสอบ A/B อัตโนมัติใน {{pytest}} และ Error Log ที่ช่วยกันไม่ให้เผลอใช้ default tokenizer กับภาษาไทยอีกตลอดอาชีพ",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบสลับหัวข้อ (Interleaved Recall)** ครบทั้ง D49 (`PyThaiNLP newmm` + `dict_trie`), D50 (Fast TF-IDF + `LogisticRegression` + `coef_`), D51 (`StratifiedKFold` + `GridSearchCV` over `Pipeline`) และ D45 (Macro-F1 บนข้อมูลไม่สมดุล)",
    "**ออกแบบการทดลอง A/B แบบควบคุมตัวแปร (Controlled Experiment)** โดยใช้ `StratifiedKFold` splits ชุดเดียวกันเป๊ะเทียบระหว่าง Default Whitespace `TfidfVectorizer` กับ `PyThaiNLP newmm + Custom Dict`",
    "**พิสูจน์และอธิบายผลต่างเชิงปริมาณ** ทั้ง `Macro-F1 (mean ± std)`, `delta_f1_macro`, จำนวน fold ที่ชนะ (`thai_wins_folds`) และขนาดคำศัพท์ที่ใช้ซ้ำได้จริงโดยไม่เกิด {{data-leakage}}",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D49 (Thai Tokenization & TF-IDF), D50 (Fast Thai Classifier), D51 (CV & Tuning) และ D45 (Classification Metrics)",
    "มี `pythainlp`, `scikit-learn`, `numpy`, `pytest` และ `ruff` ในสภาพแวดล้อม `uv`",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งานทบทวน Day 52 ด้วย `uv` (หรือใช้โปรเจกต์เดิมจาก Day 51) แล้วตรวจว่าแพ็กเกจทั้งหมดพร้อมรันการทดลอง A/B",
    commands: `uv init ai-day52-review && cd ai-day52-review
uv add pythainlp scikit-learn numpy
uv add --dev pytest ruff
uv run python -c "import pythainlp, sklearn, numpy; print('B13 Review Ready!')"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์ `ai-day52-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pythainlp`, `scikit-learn`, `numpy`, `pytest`, `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งทดสอบแล้วเห็น `B13 Review Ready!`"],
    ],
    note: "รอบทบทวน Day 52 จัดเวลาตามสูตร 30 นาที: 10 นาทีทำ Interleaved Recall Quiz → 15 นาทีลงมือรันแล็บ A/B Benchmark และตรวจด้วย `pytest` → 5 นาทีสรุป Error Log และการ์ดทบทวน",
  },

  concepts: [
    {
      id: "b13-interleaved-synthesis",
      title: "1 · ร้อยต่อจิ๊กซอว์ B13 (D49–D51) + D45: ครบวงจร Thai Classical NLP",
      paragraphs: [
        "ตลอด 3 วันที่ผ่านมาใน Block B13 เราสร้างระบบประมวลผลข้อความภาษาไทยระดับ Production ครบทุกชั้น: **D49** แก้ปัญหาไม่มีช่องว่างคั่นคำด้วย {{pythainlp}} `newmm` + `dict_trie`, **D50** ประกอบเป็นตัวจำแนกความเร็ว <5ms ด้วย {{tfidf}} + `LogisticRegression(class_weight=\"balanced\")` ที่ตีความได้ผ่าน `coef_`, และ **D51** วางระบบวัดผลที่ซื่อสัตย์ด้วย `StratifiedKFold` + `GridSearchCV` ครอบ {{sklearn-pipeline}}",
        "เมื่อเชื่อมกับ **D45 ({{precision-recall|Macro-F1}})** ที่ให้คะแนนทุกคลาสเท่าเทียมกันแม้จำนวนทิกเก็ตแต่ละหมวดไม่เท่ากัน เราจึงได้ชุดเครื่องมือที่พร้อมทดสอบสมมติฐานทางวิศวกรรมอย่างเป็นวิทยาศาสตร์: *\"การเพิ่ม Thai word segmentation ช่วยดันความแม่นยำจริงเท่าไร?\"*",
      ],
      analogy:
        "เหมือนทีมผลิตรถไฟฟ้าที่ประกอบครบทั้งล้อเกาะถนน (D49 newmm), มอเตอร์ความเร็วสูง (D50 TF-IDF + LogReg), และสนามทดสอบ 5 สภาพถนน (D51 Stratified 5-Fold CV) — วันนี้คือวันวิ่งจับเวลาเทียบกับล้อยางเก่า (Whitespace Split) บนสนามเดียวกัน!",
      bullets: [
        "**D49 (Tokenizer)** — `word_tokenize(..., engine=\"newmm\", custom_dict=trie, keep_whitespace=False)` + `token_pattern=None`",
        "**D50 (Fast Model)** — `Pipeline([(\"tfidf\", ...), (\"clf\", LogisticRegression(class_weight=\"balanced\"))])` + ส่อง `coef_`",
        "**D51 (Honest Eval)** — `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` + ตรวจ Train vs Val gap",
        "**D45 (Right Metric)** — ใช้ `f1_macro` เพื่อไม่ให้คลาสที่มีจำนวนมากกลบความพังของคลาสหายาก",
      ],
      whyTitle: "Why this matters — หลักฐานตัวเลขชนะคำกล่าวอ้างเสมอ",
      whyParagraphs: [
        "ในทีมวิศวกรรมจริง เมื่อคุณเสนอให้เพิ่ม dependency อย่าง `pythainlp` เข้าไปใน Docker image ของบริษัท เพื่อนร่วมทีมจะถามว่า *\"จำเป็นแค่ไหน? ไม่ใช้ได้ไหม?\"*",
        "การมีสคริปต์ A/B Benchmark ที่รันซ้ำได้และโชว์ตัวเลขชัด ๆ ว่า Macro-F1 กระโดดจาก `~0.42 ± 0.10` เป็น `~0.92 ± 0.05` บน CV ชุดเดียวกันจะปิดข้อสงสัยได้ทันทีใน 10 วินาที",
      ],
    },
    {
      id: "controlled-ab-experiment-design",
      title: "2 · กติกาการทดลอง A/B แบบควบคุมตัวแปร (Controlled CV Comparison)",
      paragraphs: [
        "การเปรียบเทียบโมเดล A (Whitespace Baseline) กับโมเดล B (`PyThaiNLP newmm` Baseline) จะน่าเชื่อถือได้ก็ต่อเมื่อเรา **ควบคุมตัวแปรอื่นทั้งหมดให้เหมือนกัน 100% (Ceteris Paribus)** — สิ่งเดียวที่อนุญาตให้ต่างกันคือ `tokenizer` ของ `TfidfVectorizer` เท่านั้น",
        "รายละเอียดที่ห้ามเผลอพลาดมี 3 ข้อ: (1) ใช้ **`splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=42).split(texts, labels))`** ชุดเดียวกันเป๊ะส่งเข้าทั้งสอง Pipeline เพื่อให้แต่ละ fold ประเมินบนทิกเก็ตชุดเดียวกันจริง ๆ (Paired Comparison), (2) ใช้ `LogisticRegression(class_weight=\"balanced\", max_iter=1000, random_state=42)` เหมือนกันทั้งคู่, และ (3) ห้ามปรับแต่งชุดข้อมูลหรือกรองแถวยากออกเฉพาะฝั่งใดฝั่งหนึ่ง",
        "เมื่อได้คะแนนครบ 5 folds จากทั้งคู่ เราจะดูได้ครบทั้ง 3 มิติ: **ค่าเฉลี่ยส่วนต่าง (`delta_f1_macro`)**, **ความสม่ำเสมอ (`thai_wins_folds` เช่น ชนะ 5/5 folds)**, และ **ส่วนเบี่ยงเบนมาตรฐาน (`std`)**",
      ],
      analogy:
        "เหมือนเทียบความเร็วรองเท้าวิ่งสองคู่: ต้องให้นักวิ่งคนเดียวกัน วิ่งบนลู่เดียวกัน 5 รอบจับเวลาเทียบกันทีละรอบ ไม่ใช่ให้คนหนึ่งวิ่งทางเรียบและอีกคนวิ่งขึ้นเขาแล้วมาเทียบเวลา",
      code: {
        language: "python",
        filename: "paired_cv_ab.py",
        code: `from sklearn.model_selection import StratifiedKFold, cross_validate

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
# ล็อก index ของทั้ง 5 folds ไว้ล่วงหน้าเพื่อให้ทั้ง A และ B เจอข้อสอบชุดเดียวกันเป๊ะ
splits = list(cv.split(texts, labels))

ws_res = cross_validate(ws_pipe, texts, labels, cv=splits, scoring="f1_macro", return_estimator=True)
th_res = cross_validate(th_pipe, texts, labels, cv=splits, scoring="f1_macro", return_estimator=True)

delta = float(th_res["test_score"].mean() - ws_res["test_score"].mean())
wins = int((th_res["test_score"] > ws_res["test_score"]).sum())
print(f"Delta Macro-F1: +{delta:.3f} | Thai newmm wins {wins}/5 folds")`,
        caption: "ส่ง `splits` ตัวเดียวกันเข้า `cross_validate(..., return_estimator=True)` ได้ทั้งคะแนนราย fold และ Pipeline ที่ fit แล้วของทุก fold",
      },
      whyTitle: "Why this matters — แนวคิด Paired Evaluation ใช้ยาวไปจนถึง Phase 4 & Phase 5",
      whyParagraphs: [
        "รูปแบบ Paired Evaluation ที่คุมชุดทดสอบให้ตรงกันทุกแถวนี้ คือแกนหลักของทั้ง Retrieval Benchmark ใน Phase 4 (เทียบ Dense vs Hybrid {{bm25}}+Dense บนคำถามชุดเดียวกัน) และ Promptfoo Regression Testing ใน Phase 5",
        "เมื่อคุณฝึกวางโครง A/B ให้สะอาดตั้งแต่วันนี้ คุณจะไม่ตกหลุมพรางการเปรียบเทียบแอปเปิลกับส้มในอนาคต",
      ],
    },
    {
      id: "diagnosing-why-whitespace-collapses",
      title: "3 · ผ่าสาเหตุเชิงลึก: ทำไม Whitespace Split ถึงแพ้ขาดในข้อมูลจริง?",
      paragraphs: [
        "หากเราเข้าไปส่อง `estimator.named_steps[\"tfidf\"].vocabulary_` ของทั้งสองฝั่งในแต่ละ fold จะเห็นความจริงที่น่าตกใจทันที: ฝั่ง **Whitespace Split** แตกประโยคไทยที่ติดกันไม่ออก เช่น `\"ขอใบกำกับภาษีเต็มรูปแบบของบิลเดือนนี้ครับ\"` กลายเป็น token ยาว 1 ก้อนเต็ม ๆ (ยกเว้นตรงที่ลูกค้าเคาะวรรคหรือมีคำอังกฤษอย่าง `PromptPay`, `OTP`, `API`)",
        "ผลที่ตามมาคือใน Validation fold เมื่อเจอลูกค้าใหม่ที่พิมพ์คำใกล้เคียงแต่ไม่ตรงทั้งประโยค เช่น `\"ออกใบกำกับภาษีชื่อบริษัทให้หน่อยครับ\"` ฝั่ง Whitespace จะเจอภาวะ **Out-of-Vocabulary (OOV) สูงมาก** จนเวกเตอร์ TF-IDF เกือบทั้งแถวเป็น **ศูนย์ (`0.0`)** โมเดลจึงต้องเดาสุ่มจากค่า intercept หรือพึ่งได้แค่คำภาษาอังกฤษที่บังเอิญโผล่มาเท่านั้น!",
        "ตรงกันข้าม ฝั่ง **`PyThaiNLP newmm` + Custom Dict** แตกข้อความออกเป็นหน่วยคำไทยที่นำกลับมาใช้ซ้ำได้จริง (`\"ใบกำกับภาษี\"`, `\"พร้อมเพย์\"`, `\"เลขพัสดุ\"`, `\"เข้า\"`, `\"ระบบ\"`) ทำให้เอกสารใน Validation fold แชร์ฟีเจอร์ร่วมกับชุด Train ได้อย่างหนาแน่น ส่งผลให้ Macro-F1 พุ่งสูงและเสถียรข้ามทุก fold",
      ],
      analogy:
        "Whitespace Split เหมือนพยายามต่อเลโก้โดยเชื่อมก้อนทั้งกล่องติดกันเป็นก้อนเดียว — เอาไปประกอบรูปใหม่ไม่ได้เลย ส่วน `newmm` แกะออกเป็นชิ้นเลโก้มาตรฐาน ทำให้ประกอบและจับคู่รูปแบบใหม่ ๆ ได้ไม่จำกัด",
      bullets: [
        "**Token Overlap (อัตราการซ้ำของคำ)** — `newmm` สร้างคำศัพท์ที่แชร์ข้ามทิกเก็ตได้จริง ไม่ใช่ประโยคเฉพาะกิจที่ใช้ได้ครั้งเดียว",
        "**Code-Switching Trap** — บางครั้ง Whitespace Split ดูเหมือนจะทายหมวด `technical` ถูกบ้างเพราะมีคำอังกฤษคั่นช่องว่าง (เช่น `error`, `API`, `OTP`) แต่พังยับทันทีในหมวดที่เป็นภาษาไทยล้วนอย่าง `billing` หรือ `delivery`",
        "**การใช้ `return_estimator=True`** — ช่วยวัดขนาด `len(est.named_steps[\"tfidf\"].vocabulary_)` เฉลี่ยจาก training folds ได้โดยไม่ต้อง `fit` บนข้อมูลทั้งหมด (ปลอด {{data-leakage}})",
      ],
      whyTitle: "Why this matters — เตือนใจก่อนทำ Thai BM25 ใน Phase 4",
      whyParagraphs: [
        "อาการที่ Whitespace Split พอเดาได้เฉพาะประโยคที่มีคำอังกฤษแต่บอดสนิทกับคำไทยล้วน จะเกิดซ้ำแบบเดียวกันเป๊ะหากคุณทำ {{bm25}} Search ใน Phase 4 โดยไม่ผ่าน `PyThaiNLP` ก่อน",
        "บทเรียนทบทวนวันนี้จึงปิดวงจร Block B13 อย่างสมบูรณ์และปูพรมตรงสู่ทั้ง Model Serialization (B14) และ Thai Hybrid RAG (B25)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Controlled CV A/B กับ Feature Flag Experiment",
      body: [
        "การทดสอบ `Whitespace vs PyThaiNLP newmm` บน `splits` ชุดเดียวกันคือหลักการเดียวกับ Controlled Experiment ในระบบโปรดักต์:",
      ],
      table: [
        ["`ws_pipe` (Control)", "ระบบเดิมที่ใช้ default analyzer"],
        ["`th_pipe` (Treatment)", "ระบบใหม่ที่เสียบ Thai `newmm` + custom dict"],
        ["`splits = list(cv.split(...))`", "ใช้ชุดคำขอเดียวกัน 100% เพื่อตัดตัวแปรกวน (Replay / Shadow test)"],
        ["`delta_f1_macro` + `wins/5`", "เมตริกชี้ขาดก่อนตัดสินใจ Rollout ขึ้น Production"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Whitespace Split ถึงยังได้ Macro-F1 ไม่ใช่ 0.00 ซะทีเดียว?",
      body: [
        "คุณอาจสงสัยว่าถ้า Whitespace Split ตัดคำไทยไม่ได้ ทำไมคะแนนถึงได้ประมาณ `0.35–0.55` ไม่ใช่ `0.00`? เหตุผลมี 2 ข้อครับ:",
        "1) ในงานจำแนก 3 คลาส การเดาสุ่มก็มีโอกาสถูกประมาณ `33%` อยู่แล้ว และ 2) ข้อความไทยจริงมักมีการเคาะวรรคระหว่างวลีหรือปนคำอังกฤษ (เช่น `OTP`, `API`, `error`, `PromptPay`) ซึ่ง default regex แยกคำอังกฤษเหล่านั้นออกได้บ้าง",
        "แต่ทันทีที่ลูกค้าพิมพ์ภาษาไทยล้วนติดกันยาว ๆ Whitespace Split จะตาบอดทันที ขณะที่ `PyThaiNLP newmm` ยังแยกคำสำคัญได้อย่างแม่นยำ!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: รัน Controlled A/B Experiment บนชุดทิกเก็ตภาษาไทยล้วนปนอังกฤษ 36 ข้อความ (3 หมวด) ด้วย 5-Fold `StratifiedKFold` ชุดเดียวกันเป๊ะ เพื่อเทียบ Default Whitespace `TfidfVectorizer` กับ `PyThaiNLP newmm + Custom Dict`",
    steps: [
      {
        title: "1 · สร้าง Pipeline ฝั่ง Control (Whitespace) และฝั่ง Treatment (PyThaiNLP newmm)",
        explain:
          "ควบคุมทุกอย่างใน `LogisticRegression` ให้เหมือนกันเป๊ะ (`class_weight=\"balanced\", max_iter=1000, random_state=42`) ต่างกันเฉพาะ `TfidfVectorizer` เท่านั้น",
        code: {
          language: "python",
          filename: "worked_day52_ab.py",
          code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

CUSTOM_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"}
STOPWORDS = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "เลย"}


class ThaiTokenizer:
    def __init__(self, custom_words: set[str], stopwords: set[str]) -> None:
        self._trie = dict_trie(set(thai_words()) | custom_words)
        self._stop = {w.lower() for w in stopwords}

    def __call__(self, text: str) -> list[str]:
        toks = word_tokenize(text, engine="newmm", custom_dict=self._trie, keep_whitespace=False)
        return [t.lower() for t in toks if t.strip() and t.lower() not in self._stop]


ws_pipe = Pipeline([
    ("tfidf", TfidfVectorizer(sublinear_tf=True)),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)),
])

th_pipe = Pipeline([
    ("tfidf", TfidfVectorizer(
        tokenizer=ThaiTokenizer(CUSTOM_WORDS, STOPWORDS),
        token_pattern=None,
        lowercase=False,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)),
])`,
        },
        output: `# พร้อมทั้ง Control (ws_pipe) และ Treatment (th_pipe) โดยล็อก clf เหมือนกัน 100%`,
      },
      {
        title: "2 · รัน 5-Fold Stratified CV บน Splits ชุดเดียวกันและเทียบผลทีละ Fold",
        explain:
          "ล็อก `splits = list(cv.split(texts, labels))` แล้วส่งเข้า `cross_validate(..., return_estimator=True)` เพื่อดูคะแนน Macro-F1 ราย fold และส่วนต่างเฉลี่ย",
        code: {
          language: "python",
          filename: "worked_day52_ab.py",
          code: `from sklearn.model_selection import StratifiedKFold, cross_validate

# ใช้ชุดทิกเก็ตภาษาไทย 36 ใบ (หมวด billing / delivery / technical หมวดละ 12 ใบ)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
splits = list(cv.split(texts, labels))

ws_cv = cross_validate(ws_pipe, texts, labels, cv=splits, scoring="f1_macro", return_estimator=True)
th_cv = cross_validate(th_pipe, texts, labels, cv=splits, scoring="f1_macro", return_estimator=True)

for fold, (w_sc, t_sc) in enumerate(zip(ws_cv["test_score"], th_cv["test_score"]), start=1):
    print(f"Fold {fold}: Whitespace={w_sc:.3f} | PyThaiNLP={t_sc:.3f} | diff={t_sc - w_sc:+.3f}")

delta = th_cv["test_score"].mean() - ws_cv["test_score"].mean()
print(f"Mean : Whitespace={ws_cv['test_score'].mean():.3f}±{ws_cv['test_score'].std():.3f} | "
      f"PyThaiNLP={th_cv['test_score'].mean():.3f}±{th_cv['test_score'].std():.3f} | Delta={delta:+.3f}")`,
        },
        output: `Fold 1: Whitespace=0.417 | PyThaiNLP=1.000 | diff=+0.583
Fold 2: Whitespace=0.222 | PyThaiNLP=0.867 | diff=+0.644
Fold 3: Whitespace=0.556 | PyThaiNLP=1.000 | diff=+0.444
Fold 4: Whitespace=0.381 | PyThaiNLP=0.867 | diff=+0.486
Fold 5: Whitespace=0.444 | PyThaiNLP=1.000 | diff=+0.556
Mean : Whitespace=0.404±0.108 | PyThaiNLP=0.947±0.065 | Delta=+0.543`,
      },
      {
        title: "3 · ส่อง Vocabulary และ Zero-Vector Rate ใน Validation Fold เพื่อยืนยันสาเหตุ",
        explain:
          "ตรวจสอบบน Fold 1 ว่ามีข้อความใน Validation fold กี่เปอร์เซ็นต์ที่กลายเป็นเวกเตอร์ศูนย์ (ไม่ตรงคำศัพท์ใดในชุด Train เลย!) เมื่อใช้ Whitespace Split เทียบกับ `PyThaiNLP newmm`",
        code: {
          language: "python",
          filename: "worked_day52_ab.py",
          code: `_, val_idx = splits[0]
val_texts = [texts[i] for i in val_idx]

ws_vec = ws_cv["estimator"][0].named_steps["tfidf"]
th_vec = th_cv["estimator"][0].named_steps["tfidf"]

ws_zero = int((ws_vec.transform(val_texts).getnnz(axis=1) == 0).sum())
th_zero = int((th_vec.transform(val_texts).getnnz(axis=1) == 0).sum())

print(f"Fold 1 Whitespace: vocab={len(ws_vec.vocabulary_):3d} | zero-feature val docs={ws_zero}/{len(val_texts)}")
print(f"Fold 1 PyThaiNLP : vocab={len(th_vec.vocabulary_):3d} | zero-feature val docs={th_zero}/{len(val_texts)}")`,
        },
        output: `Fold 1 Whitespace: vocab= 54 | zero-feature val docs=5/8
Fold 1 PyThaiNLP : vocab=248 | zero-feature val docs=0/8`,
      },
    ],
    gotcha:
      "ดูบรรทัดสุดท้ายให้ดี: ใน Validation fold ของ Whitespace Split มีข้อความถึง 5 จาก 8 ใบที่กลายเป็น **เวกเตอร์ศูนย์สนิท** (ไม่รู้จักแม้แต่คำเดียว!) ขณะที่ `PyThaiNLP newmm` มี `0/8` และดัน Macro-F1 เพิ่มขึ้นถึง `+0.543` — นี่คือหลักฐานเชิงประจักษ์ที่ชัดเจนที่สุดของ Block B13",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + A/B Benchmark (15 นาที): สร้างโมดูล `exercise_day52.py` ที่รันการทดลอง A/B ควบคุมตัวแปรบน Stratified 5-Fold CV ชุดเดียวกัน เพื่อพิสูจน์ผลต่างระหว่าง Default Whitespace `TfidfVectorizer` กับ `PyThaiNLP newmm + Custom Dict` พร้อมวัด Zero-Vector Rate ใน Validation folds",
    requirements: [
      "`build_whitespace_baseline() -> Pipeline`: คืน `Pipeline([(\"tfidf\", TfidfVectorizer(sublinear_tf=True)), (\"clf\", LogisticRegression(class_weight=\"balanced\", max_iter=1000, random_state=42))])` (ฝั่ง Control ที่ไม่ตัดคำไทย)",
      "`build_thai_newmm_baseline(custom_words: set[str] | None = None, stopwords: set[str] | None = None, ngram_range: tuple[int, int] = (1, 2)) -> Pipeline`: คืน `Pipeline` ที่มี `LogisticRegression` ชุดเดียวกันเป๊ะ แต่ฝั่ง `tfidf` ใช้ `PyThaiNLP newmm` + `dict_trie`, `token_pattern=None`, `lowercase=False`, `ngram_range=ngram_range`, `sublinear_tf=True`",
      "`mean_zero_vector_rate(estimators: list[Pipeline], texts: list[str], splits: list[tuple]) -> float`: สำหรับแต่ละ fold `(est, (_, val_idx))` ให้ `est.named_steps[\"tfidf\"].transform(val_texts)` แล้วคำนวณสัดส่วนของเอกสารที่ `getnnz(axis=1) == 0` จากนั้นคืนค่าเฉลี่ยข้ามทุก fold (ช่วง `0.0` ถึง `1.0`)",
      "`compare_tokenizers_cv(texts: list[str], labels: list[str], custom_words: set[str] | None = None, stopwords: set[str] | None = None, n_splits: int = 5, random_state: int = 42) -> dict`: ล็อก `splits = list(StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state).split(texts, labels))` ใช้ร่วมกันทั้งสอง Pipeline, รัน `cross_validate(..., scoring=\"f1_macro\", return_estimator=True)`, แล้วคืน dict ที่มีคีย์: `whitespace_f1_mean`, `whitespace_f1_std`, `thai_f1_mean`, `thai_f1_std`, `delta_f1_macro`, `thai_wins_folds`, `whitespace_zero_vec_rate`, `thai_zero_vec_rate`, `whitespace_avg_vocab`, `thai_avg_vocab`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day52.py",
      code: `import numpy as np
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline


class ThaiTokenizer:
    """Pickle-safe PyThaiNLP newmm tokenizer พร้อม custom dictionary"""

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


def build_whitespace_baseline() -> Pipeline:
    """สร้าง Control Pipeline: Default whitespace TfidfVectorizer + LogisticRegression"""
    # TODO: ประกอบ Pipeline([("tfidf", ...), ("clf", ...)])
    raise NotImplementedError


def build_thai_newmm_baseline(
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
    ngram_range: tuple[int, int] = (1, 2),
) -> Pipeline:
    """สร้าง Treatment Pipeline: PyThaiNLP newmm TfidfVectorizer + LogisticRegression"""
    # TODO: ประกอบ Pipeline ที่ใช้ ThaiTokenizer + token_pattern=None + lowercase=False
    raise NotImplementedError


def mean_zero_vector_rate(
    estimators: list[Pipeline],
    texts: list[str],
    splits: list[tuple],
) -> float:
    """คำนวณสัดส่วนเฉลี่ยของข้อความใน Validation folds ที่กลายเป็นเวกเตอร์ศูนย์ (ไม่ตรงคำศัพท์เลย)"""
    # TODO: วนแต่ละ fold ใช้ est.named_steps["tfidf"].transform(val_texts).getnnz(axis=1) == 0
    raise NotImplementedError


def compare_tokenizers_cv(
    texts: list[str],
    labels: list[str],
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
    n_splits: int = 5,
    random_state: int = 42,
) -> dict[str, float | int]:
    """รัน Controlled A/B Experiment บน Stratified K-Fold เดียวกันและคืนรายงานเปรียบเทียบ"""
    # TODO: ล็อก splits -> cross_validate ทั้งสองฝั่ง -> คำนวณ delta, wins, zero_vec_rate, avg_vocab
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day52.py",
      code: `import pytest
from exercise_day52 import (
    build_thai_newmm_baseline,
    build_whitespace_baseline,
    compare_tokenizers_cv,
)

CUSTOM_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"}
STOPWORDS = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "เลย"}

# ชุดทิกเก็ตภาษาไทยแท้ (แทบไม่เคาะวรรคหรือปนคำอังกฤษ) เพื่อสะท้อนปัญหาจริงของภาษาไทย
THAI_TICKETS = [
    ("ขอใบกำกับภาษีเต็มรูปแบบของบิลเดือนนี้ครับ", "billing"),
    ("โอนเงินผ่านพร้อมเพย์แล้วแต่ยอดไม่ตัดค่ะ", "billing"),
    ("บัตรเครดิตถูกหักเงินซ้ำสองรอบขอคืนเงินด้วย", "billing"),
    ("ต้องการใบลดหนี้และใบเสร็จรับเงินฉบับใหม่", "billing"),
    ("ชำระผ่านพร้อมเพย์สำเร็จแต่สถานะยังรอชำระ", "billing"),
    ("บิลค่าบริการเดือนนี้คิดยอดเกินขอตรวจสอบราคา", "billing"),
    ("ออกใบกำกับภาษีชื่อบริษัทให้หน่อยครับ", "billing"),
    ("ขอคืนเงินค่าสินค้าที่ยกเลิกผ่านพร้อมเพย์", "billing"),
    ("โอนพร้อมเพย์ซ้ำสองครั้งขอใบลดหนี้คืนยอด", "billing"),
    ("ใบกำกับภาษีพิมพ์ชื่อผิดขอแก้ไขบิลใหม่ค่ะ", "billing"),
    ("ขอใบเสร็จค่าบริการย้อนหลังพร้อมใบกำกับภาษี", "billing"),
    ("ยอดชำระบัตรเครดิตหักเกินราคาสินค้าขอคืนเงิน", "billing"),
    ("ขอเลขพัสดุหน่อยค่ะสั่งไปสามวันแล้วยังไม่ถึง", "delivery"),
    ("ขนส่งแฟลชเอ็กซ์เพรสส่งของผิดบ้านครับ", "delivery"),
    ("พัสดุค้างอยู่ที่คลังสินค้าตั้งแต่วันจันทร์", "delivery"),
    ("กล่องสินค้าบุบเสียหายจากการจัดส่งขอเปลี่ยนชิ้นใหม่", "delivery"),
    ("เช็กสถานะการจัดส่งไม่ได้เลขพัสดุไม่อัปเดต", "delivery"),
    ("พนักงานส่งของไม่โทรแจ้งก่อนมาส่งพัสดุ", "delivery"),
    ("สั่งส่งด่วนแต่ของยังไม่ออกจากโกดังเลยค่ะ", "delivery"),
    ("ขอเปลี่ยนที่อยู่จัดส่งพัสดุก่อนขนส่งนำจ่าย", "delivery"),
    ("ตามพัสดุแฟลชเอ็กซ์เพรสส่งล่าช้าเกินกำหนด", "delivery"),
    ("เลขพัสดุหายจากหน้าคำสั่งซื้อเช็กขนส่งไม่ได้", "delivery"),
    ("ขนส่งยังไม่มารับพัสดุจากคลังสินค้าเลยครับ", "delivery"),
    ("พัสดุตีกลับโกดังทั้งที่ที่อยู่จัดส่งถูกต้อง", "delivery"),
    ("เข้าสู่ระบบไม่ได้รหัสผ่านไม่ส่งเข้ามือถือครับ", "technical"),
    ("แอปเด้งออกเองทุกครั้งตอนกดหน้าชำระเงิน", "technical"),
    ("เว็บขึ้นข้อผิดพลาดโหลดหน้าแดชบอร์ดไม่ขึ้น", "technical"),
    ("เข้าสู่ระบบผ่านมือถือค้างหน้าขาวรีเซ็ตรหัสไม่ได้", "technical"),
    ("เชื่อมต่อระบบไม่สำเร็จหน้าจอค้างตลอดค่ะ", "technical"),
    ("อัปเดตแอปเวอร์ชันใหม่แล้วเปิดใช้งานไม่ได้เลย", "technical"),
    ("กดปุ่มส่งข้อมูลแล้วหน้าเว็บค้างเข้าไม่ได้", "technical"),
    ("ระบบแจ้งรหัสผ่านผิดทั้งที่ตั้งรหัสใหม่แล้ว", "technical"),
    ("หน้าเข้าสู่ระบบหมุนค้างส่งรหัสไม่เข้ามือถือ", "technical"),
    ("เปิดแอปบนมือถือแล้วค้างหน้าจอดำใช้งานไม่ได้", "technical"),
    ("กดเข้าสู่ระบบบนเว็บแล้วค้างขึ้นข้อผิดพลาดตลอด", "technical"),
    ("แอปมือถือค้างหลังอัปเดตและเข้าระบบไม่ได้เลย", "technical"),
]


def test_pipelines_have_identical_classifier_config():
    ws = build_whitespace_baseline()
    th = build_thai_newmm_baseline(CUSTOM_WORDS, STOPWORDS)
    assert ws.named_steps["clf"].get_params() == th.named_steps["clf"].get_params()


def test_controlled_ab_proves_thai_newmm_beats_whitespace():
    texts = [t for t, _ in THAI_TICKETS]
    labels = [y for _, y in THAI_TICKETS]

    report = compare_tokenizers_cv(
        texts,
        labels,
        custom_words=CUSTOM_WORDS,
        stopwords=STOPWORDS,
        n_splits=5,
        random_state=42,
    )

    assert report["delta_f1_macro"] == pytest.approx(
        report["thai_f1_mean"] - report["whitespace_f1_mean"]
    )
    # PyThaiNLP newmm ต้องชนะ Whitespace Split ขาดลอยทั้ง Macro-F1 และทุก fold
    assert report["thai_f1_mean"] >= 0.85
    assert report["delta_f1_macro"] >= 0.35
    assert report["thai_wins_folds"] == 5

    # Whitespace split ต้องเจอปัญหาเวกเตอร์ศูนย์สูงกว่ามาก และสร้างคำศัพท์ย่อยได้น้อยกว่า
    assert report["whitespace_zero_vec_rate"] > 0.70
    assert report["thai_zero_vec_rate"] < 0.05
    assert report["thai_avg_vocab"] > report["whitespace_avg_vocab"]
`,
    },
    selfCheck: [
      "ฝั่ง Control (`build_whitespace_baseline`) และฝั่ง Treatment (`build_thai_newmm_baseline`) ใช้พารามิเตอร์ `LogisticRegression` เหมือนกันทุกประการ",
      "ทั้งสองฝั่งรันบน `splits` ของ `StratifiedKFold` ชุดเดียวกันเป๊ะ (Paired Comparison, ปลอด Data Leakage)",
      "`thai_f1_mean >= 0.85`, `delta_f1_macro >= 0.35`, และ `thai_wins_folds == 5` พิสูจน์ชัยชนะของ `PyThaiNLP newmm` ได้อย่างชัดเจน",
      "`whitespace_zero_vec_rate > 0.70` ขณะที่ `thai_zero_vec_rate < 0.05` อธิบายต้นตอของความต่างได้ตรงจุด",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 2 test functions ใน `test_day52.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `mean_zero_vector_rate` สำหรับแต่ละรอบ `(est, (_, val_idx))` ให้ดึง `val_texts = [texts[i] for i in val_idx]`, แปลงด้วย `X_val = est.named_steps['tfidf'].transform(val_texts)` แล้วคำนวณ `float(np.mean(X_val.getnnz(axis=1) == 0))` จากนั้นหาค่าเฉลี่ยของทุก fold",
      },
      {
        body: "ใน `compare_tokenizers_cv` สร้าง `splits = list(StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state).split(texts, labels))` แล้วส่ง `cv=splits` เข้า `cross_validate(..., scoring='f1_macro', return_estimator=True)` ทั้งสองฝั่ง",
      },
      {
        body: "โครงของ `mean_zero_vector_rate` และ `compare_tokenizers_cv` พร้อมแล้ว เหลือเติมการคำนวณ `avg_vocab` และคืนค่า dict ให้ครบ:",
        code: {
          language: "python",
          filename: "hint_day52.py",
          code: `def mean_zero_vector_rate(
    estimators: list[Pipeline],
    texts: list[str],
    splits: list[tuple],
) -> float:
    rates = []
    for est, (_, val_idx) in zip(estimators, splits):
        val_texts = [texts[i] for i in val_idx]
        X_val = est.named_steps["tfidf"].transform(val_texts)
        rates.append(float(np.mean(X_val.getnnz(axis=1) == 0)))
    return float(np.mean(rates))


def compare_tokenizers_cv(
    texts: list[str],
    labels: list[str],
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
    n_splits: int = 5,
    random_state: int = 42,
) -> dict[str, float | int]:
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    splits = list(cv.split(texts, labels))

    ws_cv = cross_validate(
        build_whitespace_baseline(), texts, labels, cv=splits, scoring="f1_macro", return_estimator=True
    )
    th_cv = cross_validate(
        build_thai_newmm_baseline(custom_words, stopwords), texts, labels, cv=splits, scoring="f1_macro", return_estimator=True
    )

    ws_scores = ws_cv["test_score"]
    th_scores = th_cv["test_score"]
    # TODO: คำนวณ mean/std, delta_f1_macro, thai_wins_folds, zero_vec_rate และ avg_vocab แล้วคืน dict
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
      title: "เทียบสองวิธีบน CV split คนละชุด (ไม่ล็อก `splits` หรือ `random_state`)",
      symptom: "ผลต่างของคะแนนปนเปกับความบังเอิญของการแบ่งข้อมูล จนบอกไม่ได้แน่ชัดว่าวิธีใหม่ดีกว่าจริงหรือไม่",
      fix: "ล็อก `splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=42).split(texts, labels))` แล้วส่งเข้าทั้ง Control และ Treatment",
    },
    {
      title: "เปลี่ยนหลายตัวแปรพร้อมกัน (เช่น เปลี่ยนทั้ง tokenizer และเปลี่ยน `C` หรือโมเดล)",
      symptom: "เมื่อคะแนนดีขึ้น ไม่รู้ว่าเป็นเพราะ `PyThaiNLP newmm` หรือเพราะเปลี่ยนค่า `C` ของ `LogisticRegression`",
      fix: "ทำ Controlled Experiment ทีละปัจจัย (one factor at a time): ล็อกพารามิเตอร์ `clf` ให้เหมือนกันทุกประการก่อนเทียบ tokenizer",
    },
    {
      title: "วัดผลเฉพาะบนชุดข้อมูลที่มีคำอังกฤษเยอะ ๆ แล้วสรุปว่า Whitespace Split ก็พอใช้ได้",
      symptom: "บนตัวอย่างที่มีคำว่า `PromptPay`, `OTP`, `API` ทุกประโยค Whitespace Split แยกคำอังกฤษออกได้บ้าง แต่พอเจอลูกค้าพิมพ์ภาษาไทยล้วนใน Production ระบบพังทันที",
      fix: "ทดสอบบนชุดข้อความภาษาไทยล้วนและภาษาไทยปนอังกฤษแยกกัน พร้อมส่อง `zero_vector_rate` บน Validation folds เสมอ",
    },
    {
      title: "ใช้ Accuracy แทน Macro-F1 ในชุดทิกเก็ตที่มีคลาสไม่สมดุล",
      symptom: "ฝั่ง Whitespace Split เดาหมวดหลัก (80% ของข้อมูล) เกือบทุกใบเพราะเวกเตอร์เป็นศูนย์ แต่ยังได้ Accuracy 0.80 ดูเหมือนใช้งานได้ทั้งที่คลาสอื่น F1 = 0.00",
      fix: "ใช้ `scoring=\"f1_macro\"` (ทบทวน D45) เพื่อให้ทุกคลาสมีน้ำหนักเท่ากันในการตัดสินผล A/B",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ ทบทวน D45 + D49 + D50 + D51 + D52) — ลองตอบจากความจำก่อนดูเฉลย",
    questions: [
      mc(
        "d052-q1",
        "[ทบทวน D49 + D52] ในการทดลอง A/B บนข้อความภาษาไทยล้วน เหตุใด Validation fold ของ Default Whitespace `TfidfVectorizer` จึงมีสัดส่วน **Zero-Vector Docs** สูงเกิน 70%?",
        [
          ["เพราะ `LogisticRegression` ลบคำภาษาไทยทิ้งตอนเทรน", "ผิด — `LogisticRegression` รับเมทริกซ์ตัวเลขจาก `TfidfVectorizer` เท่านั้น"],
          ["เพราะภาษาไทยไม่เว้นวรรคระหว่างคำ default regex จึงเก็บทั้งประโยคเป็น 1 token — พอเจอประโยคใหม่ใน Validation fold ที่ไม่ตรงทั้งบรรทัดจึงไม่ซ้ำกับ vocabulary เลยสักคำ", "ถูก — เมื่อไม่มี token ใดตรงกับ vocabulary เลย เวกเตอร์ของข้อความนั้นจึงเป็นศูนย์ทั้งหมด"],
          ["เพราะ `sublinear_tf=True` เปลี่ยนค่าทุกช่องเป็น 0", "ผิด — `sublinear_tf` คำนวณ `1 + log(tf)` สำหรับคำที่มีความถี่มากกว่า 0"],
          ["เพราะ `StratifiedKFold` ลบข้อความที่ยาวเกิน 20 ตัวอักษรออก", "ผิด — `StratifiedKFold` แค่แบ่ง index ไม่ได้แก้ไขข้อความ"],
        ],
        "B",
        "เมื่อไม่ตัดคำ ประโยคไทยทั้งบรรทัดกลายเป็น token เฉพาะกิจที่ใช้ซ้ำไม่ได้ ส่งผลให้เอกสารใหม่ใน Validation fold กลายเป็นเวกเตอร์ศูนย์และโมเดลต้องเดาสุ่ม",
        "ทำไม Default Whitespace `TfidfVectorizer` ถึงสร้าง Zero-Vector Docs จำนวนมากกับข้อความภาษาไทย?",
        "เพราะภาษาไทยไม่มีช่องว่างคั่นคำ ประโยคทั้งก้อนจึงถูกเก็บเป็น token เดียว เมื่อเจอข้อความใหม่ที่ไม่ตรงกันทั้งประโยคจึงไม่ตรงกับคำศัพท์ใน vocabulary เลย",
      ),
      mc(
        "d052-q2",
        "[ทบทวน D45 + D52] ชุดทิกเก็ตมี 3 หมวดในสัดส่วน 80% / 15% / 5% หากฝั่ง Whitespace Split ได้เวกเตอร์ศูนย์เกือบหมดแล้วเผลอทายหมวดใหญ่ (80%) ทุกใบ ตัวชี้วัดใดจะเปิดโปงความพังนี้ได้ทันที?",
        [
          ["Accuracy เพราะจะได้ ~0.80 ซึ่งต่ำมาก", "ผิด — Accuracy 0.80 ดูสูงหลอกตาทั้งที่โมเดลทายคลาสเล็ก 2 หมวดไม่ได้เลย"],
          ["Macro-F1 (`f1_score(..., average=\"macro\")`) เพราะเฉลี่ย F1 ของทั้ง 3 คลาสเท่า ๆ กัน ทำให้คะแนนร่วงลงเหลือ ~0.30 ทันที", "ถูก — คลาส 80% ได้ F1 ~0.89 แต่สองคลาสที่เหลือได้ 0.00 เฉลี่ยออกมาจึงเหลือเพียง ~0.30"],
          ["จำนวนแถวใน Training Set", "ไม่เกี่ยวกับความแม่นยำของโมเดล"],
          ["เวลาที่ใช้ในการ `fit` โมเดล", "ความเร็วในการเทรนไม่ได้บอกว่าโมเดลทายคลาสหายากถูกหรือไม่"],
        ],
        "B",
        "Macro-F1 ให้น้ำหนักแต่ละคลาสเท่ากัน (1/3 ต่อคลาส) จึงไม่ถูกคลาสส่วนใหญ่กลบ และเหมาะมากสำหรับงานจำแนกทิกเก็ตหลายหมวดที่ไม่สมดุล",
        "ทำไมจึงควรใช้ `f1_macro` แทน `accuracy` เวลาเทียบโมเดลจัดหมวดทิกเก็ตที่ไม่สมดุล?",
        "เพราะ `f1_macro` เฉลี่ย F1 ของทุกคลาสด้วยน้ำหนักเท่ากัน โมเดลที่เดาเฉพาะคลาสใหญ่จะได้ F1 ของคลาสเล็กเป็น 0 และถูกเปิดโปงทันที",
      ),
      mc(
        "d052-q3",
        "[ทบทวน D50] หลังจากเทรน `Pipeline([(\"tfidf\", ...), (\"clf\", LogisticRegression(class_weight=\"balanced\"))])` เสร็จ คุณพบว่ามีเคสลูกค้าพิมพ์ประชดซับซ้อนที่โมเดลได้ `predict_proba = [0.38, 0.34, 0.28]` ควรจัดการอย่างไรในระบบ Production?",
        [
          ["บังคับส่งเข้าหมวดแรก (`0.38`) ทันทีเพราะสูงกว่าอีกสองหมวด", "เสี่ยงผิดพลาดสูง — ความน่าจะเป็น 0.38 บน 3 คลาสแทบไม่ต่างจากการเดาสุ่ม (0.33)"],
          ["ใช้ Confidence-Based Hybrid Routing: เมื่อ `max(probs) < threshold` (เช่น `< 0.65`) ให้ส่งต่อเคสกำกวมนี้ไปให้ LLM หรือเจ้าหน้าที่ช่วยตัดสิน แทนที่จะเดาอัตโนมัติ", "ถูก — คงความเร็ว <5ms ไว้กับเคสที่มั่นใจสูง และใช้ LLM เฉพาะเคสกำกวม"],
          ["ลบประโยคนี้ออกจากระบบโดยไม่ตอบลูกค้า", "ห้ามทิ้งทิกเก็ตลูกค้า"],
          ["เพิ่มค่า `C` เป็น `10000` เพื่อบังคับให้ความน่าจะเป็นทุกประโยคเป็น `0.99`", "ผิด — การเพิ่ม `C` สูงเกินไปจะทำให้โมเดล Overfit และมั่นใจผิด ๆ (overconfident)"],
        ],
        "B",
        "Confidence-Based Hybrid Routing คือจุดแข็งของโมเดลที่คืนความน่าจะเป็น: ตัดสินเองใน <5ms เมื่อมั่นใจสูง และ escalate เคสกำกวมไปให้ LLM หรือคน",
        "ควรทำอย่างไรเมื่อ Fast Thai TF-IDF Classifier คืน `max(predict_proba)` ต่ำ (เช่น 0.38 บน 3 คลาส)?",
        "ใช้ Confidence-Based Hybrid Routing ส่งต่อเคสที่ `max(probs) < threshold` ไปให้ LLM หรือเจ้าหน้าที่ช่วยตัดสิน แทนที่จะตอบอัตโนมัติแบบเสี่ยงผิดพลาด",
      ),
      mc(
        "d052-q4",
        "[ทบทวน D51 + D52] ในการทดลอง A/B เปรียบเทียบ Whitespace Split vs `PyThaiNLP newmm` ด้วย 5-Fold Stratified CV ข้อใดคือแนวปฏิบัติที่ถูกต้องที่สุดเพื่อความยุติธรรมและปลอด Data Leakage?",
        [
          ["เรียก `fit_transform` บนข้อมูลทั้งหมดก่อน แล้วแบ่ง 5 folds เพื่อประหยัดเวลา", "ผิด — เกิด Data Leakage ตั้งแต่ขั้น TF-IDF"],
          ["สร้าง `splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=42).split(texts, labels))` ชุดเดียวกัน ส่งเข้า `cross_validate` ของทั้งสอง `Pipeline` ที่ล็อก `LogisticRegression` เหมือนกันเป๊ะ", "ถูก — เป็น Controlled Paired Comparison ที่ปลอด Data Leakage 100%"],
          ["ใช้ `random_state=1` กับ Whitespace และ `random_state=99` กับ PyThaiNLP เพื่อความหลากหลาย", "ผิด — การใช้ split คนละชุดทำให้เทียบแบบ paired ไม่ได้และมีตัวแปรกวน"],
          ["จูน `C=10` ให้ฝั่ง PyThaiNLP แต่ปล่อย `C=0.01` ไว้ฝั่ง Whitespace เพื่อให้เห็นความต่างชัด ๆ", "ผิด — ไม่ยุติธรรมและผิดหลัก Controlled Experiment"],
        ],
        "B",
        "Controlled A/B Comparison ต้องล็อกทุกอย่างให้เหมือนกัน (splits, model, metric) และเปลี่ยนเฉพาะตัวแปรที่ต้องการพิสูจน์ภายใน `Pipeline` ที่ปลอด Data Leakage",
        "หลักการทำ Controlled A/B Comparison บน 5-Fold CV ที่ถูกต้องและปลอด Data Leakage คืออะไร?",
        "ล็อก `StratifiedKFold` `splits` ชุดเดียวกัน, ล็อกพารามิเตอร์โมเดลและ metric (`f1_macro`) ให้เหมือนกันทั้งสองฝั่ง, และรันทั้งคู่ผ่าน `Pipeline` เพื่อให้ TF-IDF fit ใหม่ในทุก fold",
      ),
    ],
  },

  takeaways: [
    "Controlled A/B Experiment บน 5-Fold `StratifiedKFold` ชุดเดียวกันพิสูจน์ได้เชิงปริมาณว่า `PyThaiNLP newmm + Custom Dict` ชนะ Default Whitespace Split ขาดลอยทั้ง `Macro-F1` และความสม่ำเสมอทุก fold",
    "ต้นตอที่ Whitespace Split พังกับภาษาไทยคือ **Zero-Vector Rate** ที่สูงมากใน Validation fold เพราะทั้งประโยคถูกมัดเป็น token เดียวจนจับคู่กับข้อความใหม่ไม่ได้",
    "ชุดทักษะของ Block B13 (D49 `newmm` + D50 Fast `Pipeline` & `coef_` + D51 Leak-Free CV & Tuning + D45 `Macro-F1`) คือรากฐานที่ใช้ต่อทันทีใน B14 (Model Serialization & Drift) และ Phase 4 (Thai {{bm25}} Hybrid RAG)",
    "จดข้อผิดพลาดที่เจอบ่อย (เช่น ลืม `token_pattern=None`, Fit TF-IDF นอก CV, ไม่ล็อก `splits` ตอนทำ A/B) ลง Error Log ก่อนก้าวเข้าสู่ Block B14 ในวันพรุ่งนี้",
  ],

  reviewCards: [
    rc(
      "d052-rc-1",
      "สรุป 4 องค์ประกอบของ Controlled A/B Experiment สำหรับเทียบ Thai Tokenizer บน 5-Fold CV",
      "1) ล็อก `StratifiedKFold` `splits` ชุดเดียวกัน, 2) ล็อก `LogisticRegression` และพารามิเตอร์อื่นให้เหมือนกัน, 3) ห่อแต่ละฝั่งเป็น `Pipeline` เพื่อกัน Data Leakage, 4) วัดด้วย `f1_macro` พร้อม `mean ± std` และ `zero_vector_rate`",
    ),
    rc(
      "d052-rc-2",
      "หากเพื่อนร่วมทีมถามว่า 'ทำไมต้องเพิ่ม `pythainlp` เข้าโปรเจกต์ ใช้ `TfidfVectorizer()` ธรรมดาไม่ได้เหรอ?' จะตอบพร้อมหลักฐานอย่างไร?",
      "อ้างผล Controlled 5-Fold CV: Default Whitespace Split มองประโยคไทยติดกันเป็น 1 token ทำให้ Validation docs >70% กลายเป็นเวกเตอร์ศูนย์และ Macro-F1 ต่ำมาก ขณะที่ `newmm` + custom dict ลด zero-vector เหลือ ~0% และดัน Macro-F1 สูงขึ้น >0.35 จุดในความเร็ว <5ms",
    ),
    rc(
      "d052-rc-3",
      "ความรู้จาก Block B13 (`PyThaiNLP newmm` + `dict_trie` + `TF-IDF`) จะถูกนำไปใช้ซ้ำในจุดไหนของ Phase 4?",
      "ใช้เป็นตัวตัดคำภาษาไทยสำหรับ **Thai Lexical Search ({{bm25}})** ใน Hybrid RAG (Day 99) เพื่อจับรหัสสินค้าและศัพท์เฉพาะองค์กรร่วมกับ Dense Embeddings",
    ),
  ],

  sources: [
    { label: "scikit-learn API Reference — cross_validate (return_estimator & paired CV)", href: "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_validate.html" },
    { label: "scikit-learn User Guide — Metrics and Scoring (f1_macro)", href: "https://scikit-learn.org/stable/modules/model_evaluation.html#f1-score" },
    { label: "PyThaiNLP Documentation — Word Tokenization (newmm)", href: "https://pythainlp.github.io/docs/5.0/api/tokenize.html" },
    { label: "scikit-learn User Guide — Pipelines and Composite Estimators", href: "https://scikit-learn.org/stable/modules/compose.html#pipeline" },
  ],

  glossary: [
    "pythainlp",
    "tfidf",
    "sklearn-pipeline",
    "cross-validation",
    "precision-recall",
    "data-leakage",
    "bm25",
    "pytest",
  ],
});
