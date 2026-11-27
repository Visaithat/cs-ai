import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D050 — Phase 2 / Block B13
 * Fast Thai Text Classifier (TF-IDF + Logistic Regression Baseline)
 */
export const d050: Lesson = defineLesson({
  day: 50,
  titleTh: "สร้างตัวจำแนกข้อความภาษาไทยความเร็วสูง (TF-IDF + Logistic Regression)",
  tagline: "30 นาที · รันบน CPU เครื่องคุณ 100% ไม่ต้องใช้ API key · สร้างตัวคัดแยกทิกเก็ตภาษาไทยระดับ <5ms พร้อมอธิบายคำสำคัญรายหมวดด้วย coef_",
  icon: "zap",
  visual: {
    id: "thai-cv-tuning",
    title: "Thai Text Classifier (PyThaiNLP TF-IDF + LogisticRegression) & 5-Fold CV",
    caption: "สลับดูสถาปัตยกรรม Fast Thai Baseline, 5-Fold Stratified CV และกราฟเทียบกับ Whitespace Split",
    alt: "แผนภาพตัวจำแนกข้อความภาษาไทยด้วย TF-IDF และ Stratified 5-Fold CV",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP", "scikit-learn", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "เลือกอาวุธให้เหมาะกับปริมาณงานคัดแยกข้อความ",
      body: "การส่งทิกเก็ตภาษาไทยวันละ 50,000 ใบไปให้ {{llm}} จัดหมวดหมู่ทั้งหมดทั้งช้า (~400–1,200ms/ใบ) และเปลืองค่า token ภาษาไทยที่แพงกว่าอังกฤษ 1.5–3 เท่า ทั้งที่ 80–90% ของทิกเก็ตมีคำสัญญาณชัดเจน",
      lessonNote: "วันนี้เราสร้าง Fast Thai Baseline ด้วย Classical ML ที่จัดหมวดทิกเก็ตได้ในระดับไม่กี่มิลลิวินาทีด้วยต้นทุนแทบเป็นศูนย์",
    },
    {
      node: 1,
      heading: "เชื่อมต่อ Thai Tokenizer เข้าสู่ Pipeline เดียว",
      body: "ต่อยอดจาก Day 49 ที่ตัดคำไทยด้วย {{pythainlp}} `newmm` + custom dictionary — วันนี้เรามัด `TfidfVectorizer` เข้ากับโมเดลใน {{sklearn-pipeline}} ชิ้นเดียวเพื่อกัน {{data-leakage}} และตัดความยุ่งยากตอน deploy",
      lessonNote: "อินพุตเข้า Pipeline คือสตริงภาษาไทยดิบ ๆ และเอาต์พุตคือหมวดหมู่พร้อมความน่าจะเป็น `predict_proba` ทันที",
    },
    {
      node: 2,
      heading: "เทรน Logistic Regression ที่ตีความได้ทุกคำ",
      body: "`LogisticRegression(class_weight=\"balanced\")` ทำงานบน sparse matrix ของ {{tfidf}} ได้เร็วมาก รับมือคลาสที่ไม่สมดุลได้ดี และเปิดดูค่าน้ำหนัก `coef_` เพื่อเช็กว่าโมเดลเชื่อคำไหนในแต่ละหมวดหมู่",
      lessonNote: "เมื่อโมเดลทายผิด เราไม่ต้องเดาแบบกล่องดำ แต่ส่อง Top Positive / Negative Thai Keywords รายหมวดได้ทันที",
    },
    {
      node: 4,
      heading: "ทำหน้าที่เป็นด่านหน้า (Fast Router) ในระบบจริง",
      body: "ในระบบ Hybrid Architecture (Day 41 & Phase 4) ตัวจำแนกความเร็ว <5ms จะคัดแยกทิกเก็ตที่มีความมั่นใจสูง (`max(prob) >= 0.80`) ทันที แล้วค่อยส่งเฉพาะเคสกำกวมไปให้ {{llm}} ช่วยตัดสิน",
      lessonNote: "แบบฝึกหัดวันนี้สร้าง Pipeline ตัวจำแนก, ฟังก์ชันส่องคำสำคัญ `coef_`, และสคริปต์วัด latency จริงด้วย {{pytest}}",
    },
  ],

  objectives: [
    "**ประกอบ `Pipeline([(\"tfidf\", TfidfVectorizer(...)), (\"clf\", LogisticRegression(class_weight=\"balanced\"))])`** ที่รับข้อความภาษาไทยดิบและตัดคำด้วย {{pythainlp}} `newmm` + custom dictionary โดยไม่เกิด {{data-leakage}}",
    "**ส่องและตีความค่าน้ำหนัก `coef_`** ของ `LogisticRegression` เพื่อดึง Top Positive และ Top Negative Thai keywords ประจำแต่ละหมวดหมู่ สำหรับทำ Error Analysis และตรวจจับสัญญาณหลอก",
    "**วัดความเร็ว Single-Ticket Latency (P50 / P95 เป็นมิลลิวินาที)** และอธิบายเหตุผลเชิงวิศวกรรมว่าทำไม Fast TF-IDF Baseline จึงชนะ {{llm}} ในงานคัดแยกปริมาณสูง",
  ],

  prerequisites: [
    "ผ่าน Day 49: การตัดคำไทยด้วย {{pythainlp}} `newmm`, `dict_trie` และ `TfidfVectorizer`",
    "ผ่าน Day 43 และ Day 45: เข้าใจ {{sklearn-pipeline}} และ {{precision-recall|Precision / Recall / Macro-F1}}",
    "คุ้นเคย `uv`, `pytest` และ `ruff` จาก Phase 1",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key หรือ GPU",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งาน Day 50 ด้วย `uv` แล้วติดตั้ง `pythainlp`, `scikit-learn`, `numpy` พร้อมเครื่องมือทดสอบ ใช้เวลาไม่เกิน 2 นาที",
    commands: `uv init ai-day50 && cd ai-day50
uv add pythainlp scikit-learn numpy
uv add --dev pytest ruff
uv run python -c "import sklearn, pythainlp; print('Ready:', sklearn.__version__, pythainlp.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day50` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pythainlp`, `scikit-learn`, `numpy`, `pytest`, `ruff` ครบถ้วน"],
      ["verify", "รันคำสั่งตรวจสอบแล้วเห็นเวอร์ชันของทั้ง `scikit-learn` และ `pythainlp`"],
    ],
    note: "ทั้งหมดรันบน CPU ล้วนและใช้ RAM น้อยมาก — โมเดล TF-IDF + LogisticRegression เทรนข้อมูลหลายหมื่นทิกเก็ตจบในไม่กี่วินาที",
  },

  concepts: [
    {
      id: "tfidf-logreg-pipeline",
      title: "1 · สถาปัตยกรรม Fast Thai Baseline: TF-IDF + Logistic Regression ใน Pipeline เดียว",
      paragraphs: [
        "สำหรับงานจัดหมวดหมู่ข้อความภาษาไทย (เช่น แยกทิกเก็ตเป็น `billing`, `delivery`, `technical`) คู่หูที่คุ้มค่าที่สุดในโลกวิศวกรรม AI คือ **`TfidfVectorizer` (พร้อม {{pythainlp}} `newmm`) + `LogisticRegression`** ที่ถูกมัดรวมอยู่ใน {{sklearn-pipeline}} ชิ้นเดียว",
        "ทำไมต้อง `LogisticRegression` ไม่ใช่ Decision Tree หรือ Random Forest? เพราะเมทริกซ์ {{tfidf}} มีมิติสูงมาก (หลักพันถึงหลักแสนคอลัมน์คำศัพท์) แต่เป็นแบบ **sparse** (มีค่าไม่ใช่ศูนย์แค่ 5–20 คำต่อประโยค) โมเดลเชิงเส้นอย่าง `LogisticRegression` คำนวณแค่ผลคูณจุด ({{dot-product}}) ของคำที่โผล่จริงกับค่าน้ำหนัก จึงเทรนและทำนายเร็วระดับ **<5 มิลลิวินาที** และไม่ Overfit ง่ายเหมือนต้นไม้บนข้อมูลมิติสูง",
        "การตั้งค่าสำคัญ 3 จุดที่ควรใช้เป็นมาตรฐานตั้งแต่ Day 1 ของโปรเจกต์คือ: (1) `class_weight=\"balanced\"` เพื่อไม่ให้หมวดหมู่ที่มีทิกเก็ตน้อยถูกกลืนหาย, (2) `sublinear_tf=True` (`1 + log(tf)`) เพื่อลดอิทธิพลของลูกค้าที่พิมพ์คำเดิมซ้ำ ๆ 10 รอบ, และ (3) `ngram_range=(1, 2)` เพื่อจับคำคู่สำคัญอย่าง `\"โอน เงิน\"` หรือ `\"เข้า ระบบ\"`",
      ],
      analogy:
        "เหมือนเครื่องคัดแยกจดหมายอัตโนมัติในไปรษณีย์ที่ใช้ระบบสแกนคำสำคัญประจำแผนก — แค่เห็นคำว่า 'ใบกำกับภาษี' + 'หักซ้ำ' ก็ดีดลงช่องบัญชีทันทีในเสี้ยววินาที โดยไม่ต้องจ้างผู้เชี่ยวชาญมานั่งอ่านทุกฉบับ",
      bullets: [
        "**`class_weight=\"balanced\"`** — ปรับน้ำหนัก loss ตามสัดส่วนผกผันของจำนวนตัวอย่างในแต่ละคลาส ปกป้อง Recall ของคลาสที่หายาก",
        "**`sublinear_tf=True`** — แปลงความถี่คำด้วยสเกลลอการิทึม กันข้อความยาวหรือการพิมพ์ย้ำคำเดียวมาบดบังคำอื่น",
        "**`Pipeline`** — ล็อกลำดับ `tokenizer → TF-IDF → LogisticRegression` ไว้ในอ็อบเจกต์เดียว ป้องกัน {{data-leakage}} และรับ raw Thai string เข้า `.predict()` ได้ตรง ๆ",
      ],
      code: {
        language: "python",
        filename: "fast_thai_pipeline.py",
        code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

DOMAIN_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"}
TRIE = dict_trie(set(thai_words()) | DOMAIN_WORDS)
STOPWORDS = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "เลย"}


def thai_tokenize(text: str) -> list[str]:
    tokens = word_tokenize(text, engine="newmm", custom_dict=TRIE, keep_whitespace=False)
    return [t.lower() for t in tokens if t.strip() and t.lower() not in STOPWORDS]


pipe = Pipeline([
    ("tfidf", TfidfVectorizer(
        tokenizer=thai_tokenize,
        token_pattern=None,
        lowercase=False,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )),
    ("clf", LogisticRegression(
        C=1.0,
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
    )),
])`,
        caption: "โครงสร้างมาตรฐานของ Fast Thai Text Classifier — รับสตริงไทยดิบ ปลอด Data Leakage และรันในหลักมิลลิวินาที",
      },
      whyTitle: "Why this matters — Baseline ที่แข็งแกร่งคือไม้บรรทัดวัดผลก่อนลงทุนกับโมเดลใหญ่",
      whyParagraphs: [
        "กฎทองของงาน AI Engineering คือ **อย่าเริ่มด้วย LLM หรือ Fine-tuned Transformer ก่อนจะมี TF-IDF + LogisticRegression Baseline** เพราะในงานคัดแยกหมวดหมู่ที่มีขอบเขตชัดเจน Baseline ตัวนี้มักทำ Macro-F1 ได้ถึง 0.85–0.94 ภายในเวลาสร้างไม่ถึงครึ่งชั่วโมง",
        "ต่อให้ภายหลังคุณตัดสินใจใช้ {{llm}} หรือ Multilingual Embedding (Phase 3) คุณก็จะมีตัวเลขเปรียบเทียบชัดเจนว่าจ่ายเงินและเวลาเพิ่มเพื่อแลกกับความแม่นยำที่เพิ่มขึ้นกี่เปอร์เซ็นต์",
      ],
    },
    {
      id: "inspecting-coef-weights",
      title: "2 · เปิดกล่องขาวด้วย `coef_`: ส่องคำไทยที่ดันและฉุดคะแนนแต่ละหมวดหมู่",
      paragraphs: [
        "ข้อได้เปรียบมหาศาลของ `LogisticRegression` เหนือโมเดลกล่องดำคือความสามารถในการ **อธิบายเหตุผล (Interpretability)** แบบ 100% — หลังเรียก `.fit(...)` โมเดลจะเก็บค่าน้ำหนักของทุกคำศัพท์ไว้ในเมทริกซ์ **`clf.coef_`**",
        "สำหรับงานหลายคลาส (Multiclass เช่น 3 หมวด `billing`, `delivery`, `technical`) เมทริกซ์ `clf.coef_` มีขนาด `(n_classes, n_features)` โดยแถวที่ `i` ตรงกับหมวด `clf.classes_[i]` และคอลัมน์ที่ `j` ตรงกับคำศัพท์ `tfidf.get_feature_names_out()[j]`",
        "คำที่มีน้ำหนัก **บวกสูงสุด (Top Positive)** คือคำที่ผลักให้ทิกเก็ตเข้าหมวดนั้นแรงที่สุด (เช่น `\"ใบกำกับภาษี\"`, `\"พร้อมเพย์\"` → `billing`) ส่วนคำที่มีน้ำหนัก **ลบมากที่สุด (Top Negative)** คือคำที่ดึงออกจากหมวดนั้น (เช่น `\"เลขพัสดุ\"` จะมีค่าลบในหมวด `billing` เพราะมันชี้ไปทาง `delivery` แทน)",
      ],
      analogy:
        "เหมือนเปิดดูใบให้คะแนนของกรรมการ: เห็นชัดเลยว่าคำว่า 'พร้อมเพย์' บวกคะแนนให้หมวดบัญชี +1.8 แต่คำว่า 'ขนส่ง' หักคะแนนหมวดบัญชี -1.1 — ถ้าเห็นคำแปลก ๆ อย่างชื่อวันจันทร์ได้คะแนนสูง แปลว่าข้อมูลเทรนมีอคติแฝง!",
      bullets: [
        "**จับ Spurious Signals** — ถ้าคำว่า `\"ครับ\"` หรือชื่อพนักงานดันติด Top Positive แปลว่าข้อมูลเทรนมีอคติหรือลืมใส่ stopwords",
        "**ตรวจคุณภาพ Custom Dict** — ถ้าเห็นเศษคำแปลก ๆ เช่น `\"เพย์\"` แยกจาก `\"พร้อม\"` ใน Top Keywords รู้ทันทีว่าต้องเพิ่ม `\"พร้อมเพย์\"` ลง `dict_trie`",
        "**ข้อควรระวังกรณี 2 คลาส (Binary)** — ใน scikit-learn ถ้ามีแค่ 2 คลาส `clf.coef_` จะมีรูปร่าง `(1, n_features)` (แถวเดียวสำหรับ `classes_[1]` ส่วน `classes_[0]` คือค่าตรงข้าม `-clf.coef_[0]`)",
      ],
      code: {
        language: "python",
        filename: "inspect_coef.py",
        code: `import numpy as np

# สมมติ pipe ถูก fit บนงาน 3 คลาสแล้ว
feature_names = pipe.named_steps["tfidf"].get_feature_names_out()
clf = pipe.named_steps["clf"]

for idx, cls_name in enumerate(clf.classes_):
    weights = clf.coef_[idx]
    top_pos_idx = np.argsort(weights)[::-1][:3]
    top_neg_idx = np.argsort(weights)[:3]
    pos_terms = [(str(feature_names[j]), round(float(weights[j]), 3)) for j in top_pos_idx]
    neg_terms = [(str(feature_names[j]), round(float(weights[j]), 3)) for j in top_neg_idx]
    print(f"[{cls_name}] + {pos_terms} | - {neg_terms}")`,
        caption: "เข้าถึงขั้นตอนใน Pipeline ผ่าน `pipe.named_steps['tfidf']` และ `pipe.named_steps['clf']` เพื่อดึงคำเด่นรายคลาส",
      },
      whyTitle: "Why this matters — ดีบักโมเดลได้ใน 10 วินาทีโดยไม่ต้องเดา",
      whyParagraphs: [
        "เมื่อทีมซัพพอร์ตแจ้งว่า *\"ทำไมทิกเก็ตเรื่องโอนเงินผ่านแอปมือถือแล้วค้างถูกโยนไปหมวด technical บ่อย?\"* คุณแค่เปิดดู `coef_` จะเห็นทันทีว่าคำว่า `\"แอป\"` และ `\"ค้าง\"` มีน้ำหนักบวกใน `technical` สูงกว่า `\"โอน\"` ใน `billing`",
        "ความโปร่งใสแบบนี้ช่วยให้นำไปปรับปรุง custom dictionary, เพิ่มตัวอย่าง training ที่ตรงจุด หรือออกแบบ bigram เพิ่มเติมได้อย่างมีเหตุผล",
      ],
    },
    {
      id: "fast-ml-vs-llm-routing",
      title: "3 · ทำไม Fast TF-IDF Baseline จึงชนะ LLM ในงาน High-Volume Routing",
      paragraphs: [
        "ลองคำนวณตัวเลขจริงสำหรับแพลตฟอร์มที่มีทิกเก็ตภาษาไทย **100,000 ใบต่อวัน**: หากยิงเข้า {{llm}} API ทุกใบ (ข้อความ + system prompt ≈ 450 tokens ภาษาไทย) ความหน่วงอยู่ที่ ~500–1,200ms ต่อใบ เสียค่า API หลายหมื่นบาทต่อเดือน แถมต้องรับความเสี่ยงเรื่อง rate limit และ downtime ของผู้ให้บริการภายนอก",
        "เทียบกับ `PyThaiNLP newmm + TF-IDF + LogisticRegression` ที่รันบน CPU เครื่องเดียว: ความหน่วงเฉลี่ย **0.3–3.0ms ต่อใบ** (เร็วกว่า LLM 200–1,000 เท่า), ต้นทุนแปรผันต่อคำขอเป็น **0 บาท**, ทำงานออฟไลน์ใน VPC ของบริษัทได้ 100% (ปลอดภัยตาม PDPA), และให้ผลลัพธ์ **deterministic** เหมือนเดิมทุกครั้งที่ส่งข้อความเดิม",
        "ในระบบจริงที่ฉลาดที่สุด เราไม่ได้เลือกอย่างใดอย่างหนึ่งแบบสุดโต่ง แต่ใช้ **Confidence-Based Hybrid Routing**: ใช้ตัวจำแนก TF-IDF ตัดสินทันทีเมื่อ `max(predict_proba) >= threshold` (จัดการได้ 80–90% ของทราฟฟิกใน <5ms) และส่งเฉพาะ 10–20% ที่ความมั่นใจต่ำหรือเป็นประโยคประชดประชันซับซ้อนไปให้ {{llm}} ช่วยวิเคราะห์",
      ],
      analogy:
        "เหมือนโรงพยาบาลที่มีจุดคัดกรองพยาบาล (Fast Classifier) คัดเคสชัดเจน 85% ส่งห้องตรวจได้ใน 1 นาที แล้วส่งเฉพาะเคสซับซ้อน 15% ไปพบแพทย์เฉพาะทาง (LLM) — ทั้งเร็วกว่าและประหยัดงบกว่าส่งทุกคนไปหาแพทย์เฉพาะทางตั้งแต่หน้าประตู",
      bullets: [
        "**Latency**: ~0.5–3ms (CPU) vs ~500–1,500ms (Cloud LLM)",
        "**Cost / 1M tickets**: ค่าเครื่อง CPU เดิม (~0 บาทส่วนเพิ่ม) vs หลักหมื่น–แสนบาทสำหรับ LLM API (โดยเฉพาะภาษาไทยที่เปลือง token)",
        "**Hybrid Confidence Gate**: ใช้ `probs = pipe.predict_proba([text])[0]` ถ้า `probs.max() < 0.65` ค่อย fallback ไปหา {{llm}} หรือเจ้าหน้าที่",
      ],
      whyTitle: "Why this matters — เชื่อมตรงไปยัง Phase 3–5 และโจทย์สัมภาษณ์ AI Engineer",
      whyParagraphs: [
        "คำถามสัมภาษณ์ยอดฮิตของตำแหน่ง AI Engineer คือ *\"ถ้าต้องจัดหมวดข้อความลูกค้าภาษาไทย 50,000 ข้อความ/วัน คุณจะออกแบบระบบอย่างไร?\"* — ผู้สมัครที่ตอบว่าเรียก GPT/Claude ตรง ๆ ทุกใบมักถูกตัดคะแนนด้าน System Design ทันที",
        "การตอบว่าเริ่มจาก `PyThaiNLP + TF-IDF + LogisticRegression` เป็น Fast Baseline (<5ms) แล้วค่อยใช้ Confidence Threshold ทำ Hybrid Routing ไปหา LLM แสดงถึงวุฒิภาวะด้านต้นทุน ความเร็ว และความเสถียรของระบบจริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ TF-IDF Classifier กับ Fast API Middleware",
      body: [
        "คิดเสียว่า `Pipeline` ของ scikit-learn คือ pure function ความเร็วสูงที่ฝังอยู่ใน microservice เดียวกันโดยไม่ต้องยิง network call ออกนอกเครื่อง:",
      ],
      table: [
        ["`pipe.predict_proba([text])`", "In-process router function (<5ms, zero network hop)"],
        ["`clf.coef_` + `get_feature_names_out()`", "Feature importance / rule weights ที่ตรวจสอบย้อนหลังได้"],
        ["`class_weight='balanced'`", "Weighted priority queue ไม่ให้เคสหายากถูกกลืน"],
        ["`probs.max() < 0.65` → LLM", "Fast-path cache/router + slow-path fallback"],
      ],
    },
    student: {
      title: "First-Year Note — Logistic Regression คำนวณคะแนนแต่ละหมวดอย่างไร?",
      body: [
        "แม้ชื่อจะมีคำว่า Regression แต่ **`LogisticRegression` คืออัลกอริทึมสำหรับงานจำแนกประเภท (Classification)**",
        "เบื้องหลังมันเอาค่า TF-IDF ของแต่ละคำในประโยคมาคูณกับค่าน้ำหนัก `coef_` ของหมวดนั้นแล้วบวกกัน (`z = w · x + b`) จากนั้นส่งผ่านฟังก์ชัน **Softmax** (สำหรับหลายคลาส) เพื่อแปลงคะแนนดิบให้เป็นความน่าจะเป็นที่รวมกันเท่ากับ `1.00` (เช่น `billing: 0.91, delivery: 0.06, technical: 0.03`)",
        "เพราะมันมีแค่การคูณ-บวกเลขไม่กี่สิบตัวสำหรับคำที่โผล่ในประโยค การทำนาย 1 ข้อความจึงจบภายในเสี้ยวของเสี้ยววินาที!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้างตัวจำแนกทิกเก็ตภาษาไทย 3 หมวด (`billing`, `delivery`, `technical`) ตั้งแต่ประกอบ `Pipeline`, ประเมิน {{precision-recall|Macro-F1}}, ส่องคำสำคัญจาก `coef_`, และจับเวลา inference จริงต่อข้อความบน CPU",
    steps: [
      {
        title: "1 · เตรียมชุดข้อมูลทิกเก็ตไทย 3 หมวดและประกอบ Pipeline",
        explain:
          "ใช้ `PyThaiNLP newmm` + `dict_trie` ห่อไว้ในฟังก์ชันระดับโมดูล `thai_tokenize` (เพื่อให้ pickle ได้ในอนาคต) แล้วแบ่ง Train/Test แบบ `stratify=y` ก่อนเรียก `pipe.fit(X_train, y_train)`",
        code: {
          language: "python",
          filename: "worked_day50.py",
          code: `from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

DOMAIN_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"}
CUSTOM_DICT = dict_trie(set(thai_words()) | DOMAIN_WORDS)
STOPWORDS = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "เลย", "มาก"}


def thai_tokenize(text: str) -> list[str]:
    tokens = word_tokenize(text, engine="newmm", custom_dict=CUSTOM_DICT, keep_whitespace=False)
    return [t.lower() for t in tokens if t.strip() and t.lower() not in STOPWORDS]


DATA = [
    ("ขอใบกำกับภาษีเต็มรูปแบบของบิลเดือนนี้ครับ", "billing"),
    ("โอนเงินผ่านพร้อมเพย์แล้วแต่ยอดไม่ตัดค่ะ", "billing"),
    ("บัตรเครดิตถูกหักเงินซ้ำสองรอบ ขอคืนเงินด้วย", "billing"),
    ("ต้องการใบลดหนี้และใบเสร็จรับเงินฉบับใหม่", "billing"),
    ("ชำระผ่าน PromptPay สำเร็จแต่สถานะยังรอชำระ", "billing"),
    ("บิลค่าบริการเดือนนี้คิดยอดเกิน ขอตรวจสอบราคา", "billing"),
    ("ออกใบกำกับภาษีชื่อบริษัทให้หน่อยครับ", "billing"),
    ("ขอคืนเงินค่าสินค้าที่ยกเลิกผ่านพร้อมเพย์", "billing"),
    ("ขอเลขพัสดุหน่อยค่ะ สั่งไปสามวันแล้วยังไม่ถึง", "delivery"),
    ("ขนส่งแฟลชเอ็กซ์เพรสส่งของผิดบ้านครับ", "delivery"),
    ("พัสดุค้างอยู่ที่คลังสินค้าตั้งแต่วันจันทร์", "delivery"),
    ("กล่องสินค้าบุบเสียหายจากการจัดส่ง ขอเปลี่ยนชิ้นใหม่", "delivery"),
    ("เช็กสถานะการจัดส่งไม่ได้ เลขพัสดุไม่อัปเดต", "delivery"),
    ("พนักงานส่งของไม่โทรแจ้งก่อนมาส่งพัสดุ", "delivery"),
    ("สั่งส่งด่วนแต่ของยังไม่ออกจากโกดังเลยค่ะ", "delivery"),
    ("ขอเปลี่ยนที่อยู่จัดส่งพัสดุก่อนขนส่งนำจ่าย", "delivery"),
    ("เข้าสู่ระบบไม่ได้ รหัส OTP ไม่ส่งเข้ามือถือครับ", "technical"),
    ("แอปเด้งออกเองทุกครั้งตอนกดหน้าชำระเงิน", "technical"),
    ("เว็บขึ้น error 500 โหลดหน้าแดชบอร์ดไม่ขึ้น", "technical"),
    ("ล็อกอินผ่านมือถือค้างหน้าขาว กดรีเซ็ตรหัสผ่านไม่ได้", "technical"),
    ("เชื่อมต่อ API ไม่สำเร็จขึ้น timeout ตลอดค่ะ", "technical"),
    ("อัปเดตแอปเวอร์ชันใหม่แล้วเปิดใช้งานไม่ได้เลย", "technical"),
    ("กดปุ่มส่งฟอร์มแล้วหน้าเว็บค้าง error 502", "technical"),
    ("ระบบแจ้งรหัสผ่านผิดทั้งที่ตั้งรหัสใหม่แล้ว", "technical"),
]

texts = [t for t, _ in DATA]
labels = [y for _, y in DATA]
X_tr, X_te, y_tr, y_te = train_test_split(texts, labels, test_size=0.25, stratify=labels, random_state=42)

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(tokenizer=thai_tokenize, token_pattern=None, lowercase=False, ngram_range=(1, 2), sublinear_tf=True)),
    ("clf", LogisticRegression(C=1.0, class_weight="balanced", max_iter=1000, random_state=42)),
])
pipe.fit(X_tr, y_tr)
print(classification_report(y_te, pipe.predict(X_te), digits=3))`,
        },
        output: `              precision    recall  f1-score   support

     billing      1.000     1.000     1.000         2
    delivery      1.000     1.000     1.000         2
   technical      1.000     1.000     1.000         2

    accuracy                          1.000         6
   macro avg      1.000     1.000     1.000         6
weighted avg      1.000     1.000     1.000         6`,
      },
      {
        title: "2 · ส่อง Top Positive / Negative Thai Keywords รายคลาสจาก `coef_`",
        explain:
          "ดึงคำศัพท์และน้ำหนักจาก `pipe.named_steps` เพื่อตรวจสอบว่าโมเดลจับสัญญาณคำไทยที่ถูกต้องจริง ไม่ใช่จับคำขยะหรือคำลงท้าย",
        code: {
          language: "python",
          filename: "worked_day50.py",
          code: `import numpy as np

vocab = pipe.named_steps["tfidf"].get_feature_names_out()
clf = pipe.named_steps["clf"]

for idx, cls_name in enumerate(clf.classes_):
    w = clf.coef_[idx]
    pos = [(str(vocab[j]), round(float(w[j]), 2)) for j in np.argsort(w)[::-1][:4]]
    neg = [(str(vocab[j]), round(float(w[j]), 2)) for j in np.argsort(w)[:2]]
    print(f"{cls_name:10s} | + {pos} | - {neg}")`,
        },
        output: `billing    | + [('พร้อมเพย์', 0.64), ('ใบกำกับภาษี', 0.61), ('ขอ', 0.45), ('เงิน', 0.41)] | - [('พัสดุ', -0.44), ('ไม่', -0.35)]
delivery   | + [('พัสดุ', 0.72), ('ส่ง', 0.56), ('เลขพัสดุ', 0.51), ('ของ', 0.48)] | - [('พร้อมเพย์', -0.34), ('แอป', -0.31)]
technical  | + [('แอป', 0.59), ('error', 0.54), ('รหัส', 0.51), ('ค้าง', 0.47)] | - [('พัสดุ', -0.39), ('ขอ', -0.38)]`,
      },
      {
        title: "3 · วัดความเร็ว Single-Ticket Latency และทำนายพร้อม Confidence Routing",
        explain:
          "จับเวลาการทำนายทีละ 1 ข้อความจริงด้วย `time.perf_counter()` จำนวน 200 รอบ แล้วคำนวณ P50/P95 พร้อมแสดงตัวอย่างการคัดกรองด้วย confidence threshold",
        code: {
          language: "python",
          filename: "worked_day50.py",
          code: `import time

sample = "โอนพร้อมเพย์ไปแล้วแต่ยังไม่ได้ใบกำกับภาษีเลยครับ"
latencies_ms = []
for _ in range(200):
    t0 = time.perf_counter()
    probs = pipe.predict_proba([sample])[0]
    latencies_ms.append((time.perf_counter() - t0) * 1000.0)

pred_idx = int(np.argmax(probs))
pred_label = str(clf.classes_[pred_idx])
conf = float(probs[pred_idx])
route = "FAST_AUTO_ROUTE" if conf >= 0.55 else "ESCALATE_TO_LLM"

print(f"Pred={pred_label} (conf={conf:.3f}) -> {route}")
print(f"Latency: P50={np.percentile(latencies_ms, 50):.2f} ms | P95={np.percentile(latencies_ms, 95):.2f} ms")`,
        },
        output: `Pred=billing (conf=0.742) -> FAST_AUTO_ROUTE
Latency: P50=0.42 ms | P95=0.71 ms`,
      },
    ],
    gotcha:
      "จุดสังเกต: ในตัวอย่างเล็กข้างต้น test set มีแค่ 6 แถวจึงเห็น F1 = 1.000 ได้ง่าย — อย่าเพิ่งดีใจกับ holdout เล็ก ๆ แค่รอบเดียว! พรุ่งนี้ (Day 51) เราจะใช้ Stratified 5-Fold Cross-Validation วัดค่าเฉลี่ย ± ส่วนเบี่ยงเบนมาตรฐานอย่างน่าเชื่อถือ",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `exercise_day50.py` สำหรับตัวจำแนกข้อความภาษาไทยความเร็วสูง ประกอบด้วยการสร้าง `Pipeline`, การส่องคำสำคัญจาก `coef_` (รองรับทั้ง Multiclass และ Binary), และการจับเวลา Single-Ticket Latency จริง",
    requirements: [
      "`build_thai_classifier_pipeline(custom_words: set[str] | None = None, stopwords: set[str] | None = None, C: float = 1.0, ngram_range: tuple[int, int] = (1, 2)) -> Pipeline`: คืน `Pipeline` ที่มี 2 ขั้นตอนชื่อ `\"tfidf\"` (`TfidfVectorizer` ที่ใช้ `PyThaiNLP newmm` + `dict_trie`, `token_pattern=None`, `lowercase=False`, `ngram_range=ngram_range`, `sublinear_tf=True`) และ `\"clf\"` (`LogisticRegression(C=C, class_weight=\"balanced\", max_iter=1000, random_state=42)`)",
      "ตัวตัดคำใน `build_thai_classifier_pipeline` ต้องสร้าง `dict_trie(set(thai_words()) | (custom_words or set()))` เพียงครั้งเดียว, แปลงคำอังกฤษเป็นตัวพิมพ์เล็ก, และตัด `stopwords` กับช่องว่างเปล่าออก",
      "`inspect_top_keywords(pipeline: Pipeline, top_k: int = 5) -> dict[str, dict[str, list[tuple[str, float]]]]`: ดึง Top `top_k` คำที่มีน้ำหนักบวกสูงสุด (`\"positive\"`, เรียงจากมากไปน้อย) และลบมากที่สุด (`\"negative\"`, เรียงจากน้อยไปมาก) สำหรับทุกคลาสใน `clf.classes_` — ต้องรองรับทั้งกรณี Multiclass (`coef_.shape[0] == len(classes)`) และ Binary (`coef_.shape[0] == 1` โดยคลาส 0 ใช้ `-coef_[0]`)",
      "`benchmark_single_latency_ms(pipeline: Pipeline, sample_texts: list[str], runs: int = 100) -> dict[str, float]`: ตรวจว่า `sample_texts` ไม่ว่างและ `runs > 0` (ไม่งั้น `raise ValueError`), วัดเวลา `pipeline.predict_proba([text])` ทีละข้อความครบ `runs` รอบด้วย `time.perf_counter()`, แล้วคืน dict 3 คีย์: `mean_ms`, `p50_ms`, `p95_ms`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day50.py",
      code: `import time
import numpy as np
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


def build_thai_classifier_pipeline(
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
    C: float = 1.0,
    ngram_range: tuple[int, int] = (1, 2),
) -> Pipeline:
    """สร้าง Pipeline(tfidf + LogisticRegression balanced) สำหรับข้อความภาษาไทย"""
    # TODO: สร้าง trie และ stopwords ครั้งเดียว แล้วประกอบ Pipeline([("tfidf", ...), ("clf", ...)])
    raise NotImplementedError


def inspect_top_keywords(
    pipeline: Pipeline,
    top_k: int = 5,
) -> dict[str, dict[str, list[tuple[str, float]]]]:
    """คืน Top Positive และ Top Negative keywords พร้อมค่าน้ำหนัก coef_ ของแต่ละคลาส"""
    # TODO: ดึง feature_names และ coef_ (รองรับทั้ง binary และ multiclass)
    raise NotImplementedError


def benchmark_single_latency_ms(
    pipeline: Pipeline,
    sample_texts: list[str],
    runs: int = 100,
) -> dict[str, float]:
    """วัดความเร็วการทำนายทีละข้อความ (ms) คืน mean_ms, p50_ms, p95_ms"""
    # TODO: ตรวจ input, วนจับเวลาด้วย time.perf_counter() แล้วคำนวณ mean/p50/p95
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day50.py",
      code: `import warnings
import pytest
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from exercise_day50 import (
    benchmark_single_latency_ms,
    build_thai_classifier_pipeline,
    inspect_top_keywords,
)

CUSTOM_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "เลขพัสดุ", "ใบลดหนี้", "แฟลชเอ็กซ์เพรส"}
STOPWORDS = {"ครับ", "ค่ะ", "คะ", "หน่อย", "ด้วย", "แล้ว", "เลย"}

TICKETS = [
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
]


def test_pipeline_trains_cleanly_and_predicts_accurately():
    texts = [t for t, _ in TICKETS]
    labels = [y for _, y in TICKETS]
    X_tr, X_te, y_tr, y_te = train_test_split(
        texts, labels, test_size=0.3, stratify=labels, random_state=42
    )
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        pipe = build_thai_classifier_pipeline(CUSTOM_WORDS, STOPWORDS)
        pipe.fit(X_tr, y_tr)
    assert len(caught) == 0

    preds = pipe.predict(X_te)
    macro_f1 = f1_score(y_te, preds, average="macro")
    assert macro_f1 >= 0.85


def test_inspect_top_keywords_multiclass_and_binary():
    texts = [t for t, _ in TICKETS]
    labels = [y for _, y in TICKETS]
    pipe = build_thai_classifier_pipeline(CUSTOM_WORDS, STOPWORDS).fit(texts, labels)

    report = inspect_top_keywords(pipe, top_k=5)
    assert set(report.keys()) == {"billing", "delivery", "technical"}
    billing_pos_terms = {term for term, _ in report["billing"]["positive"]}
    delivery_pos_terms = {term for term, _ in report["delivery"]["positive"]}
    assert billing_pos_terms & {"ใบกำกับภาษี", "พร้อมเพย์", "บิล", "เงิน"}
    assert delivery_pos_terms & {"พัสดุ", "ส่ง", "เลขพัสดุ", "ขนส่ง"}
    # น้ำหนัก positive เรียงจากมากไปน้อย, negative เรียงจากน้อยไปมาก
    pos_w = [w for _, w in report["billing"]["positive"]]
    neg_w = [w for _, w in report["billing"]["negative"]]
    assert pos_w == sorted(pos_w, reverse=True)
    assert neg_w == sorted(neg_w)

    # ทดสอบกรณี Binary (2 คลาส)
    bin_texts = [t for t, y in TICKETS if y in {"billing", "delivery"}]
    bin_labels = [y for _, y in TICKETS if y in {"billing", "delivery"}]
    bin_pipe = build_thai_classifier_pipeline(CUSTOM_WORDS, STOPWORDS).fit(bin_texts, bin_labels)
    bin_report = inspect_top_keywords(bin_pipe, top_k=3)
    assert set(bin_report.keys()) == {"billing", "delivery"}
    assert len(bin_report["billing"]["positive"]) == 3


def test_latency_benchmark_and_validation():
    texts = [t for t, _ in TICKETS]
    labels = [y for _, y in TICKETS]
    pipe = build_thai_classifier_pipeline(CUSTOM_WORDS, STOPWORDS).fit(texts, labels)

    stats = benchmark_single_latency_ms(
        pipe,
        ["ขอใบกำกับภาษีผ่านพร้อมเพย์ครับ", "เช็กเลขพัสดุแฟลชเอ็กซ์เพรสหน่อย"],
        runs=60,
    )
    assert set(stats.keys()) == {"mean_ms", "p50_ms", "p95_ms"}
    assert 0.0 < stats["p50_ms"] <= stats["p95_ms"]
    assert stats["p95_ms"] < 25.0  # ปกติบน CPU อยู่ที่ ~0.5–3ms

    with pytest.raises(ValueError):
        benchmark_single_latency_ms(pipe, [], runs=10)
    with pytest.raises(ValueError):
        benchmark_single_latency_ms(pipe, ["สวัสดี"], runs=0)
`,
    },
    selfCheck: [
      "`build_thai_classifier_pipeline` ประกอบ `Pipeline([(\"tfidf\", ...), (\"clf\", ...)])` โดยไม่มี `UserWarning` และตั้ง `class_weight=\"balanced\"`",
      "ได้ `macro_f1 >= 0.85` บนชุดทดสอบทิกเก็ตภาษาไทย 3 หมวด (`billing`, `delivery`, `technical`)",
      "`inspect_top_keywords` ดึงคำสำคัญภาษาไทยที่สมเหตุสมผลในแต่ละหมวด และรองรับทั้งกรณี 3 คลาส (Multiclass) และ 2 คลาส (Binary)",
      "`benchmark_single_latency_ms` วัดความเร็ว P50 และ P95 ของการทำนายทีละข้อความได้ต่ำกว่าเกณฑ์ (ปกติ <5ms บน CPU)",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมดโดยไม่มี warning",
    ],
    acceptance: "ผ่านทั้ง 3 test functions ใน `test_day50.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `build_thai_classifier_pipeline` ใช้โครงเดียวกับ Day 49 คือสร้าง `trie` และ `stop` นอกฟังก์ชัน `tokenize(text)` แล้วส่งเข้า `TfidfVectorizer(..., token_pattern=None, lowercase=False, ngram_range=ngram_range, sublinear_tf=True)` ต่อด้วย `LogisticRegression(C=C, class_weight=\"balanced\", max_iter=1000, random_state=42)`",
      },
      {
        body: "ใน `inspect_top_keywords` เช็ก `if len(classes) == 2:` → คลาส index 0 ใช้น้ำหนัก `-coef[0]`, คลาส index 1 ใช้น้ำหนัก `coef[0]` ส่วนถ้า `len(classes) > 2` คลาส index `i` ใช้น้ำหนัก `coef[i]` แล้วใช้ `np.argsort(w)` ดึงหัว-ท้ายอย่างละ `top_k` คำ",
      },
      {
        body: "โครงของ `inspect_top_keywords` และ `benchmark_single_latency_ms` เกือบครบแล้ว เหลือเติมการประกอบ `Pipeline` และคำนวณเปอร์เซ็นไทล์:",
        code: {
          language: "python",
          filename: "hint_day50.py",
          code: `def inspect_top_keywords(
    pipeline: Pipeline,
    top_k: int = 5,
) -> dict[str, dict[str, list[tuple[str, float]]]]:
    vocab = pipeline.named_steps["tfidf"].get_feature_names_out()
    clf = pipeline.named_steps["clf"]
    classes = list(clf.classes_)
    coef = clf.coef_
    result: dict[str, dict[str, list[tuple[str, float]]]] = {}

    for idx, cls_name in enumerate(classes):
        weights = (-coef[0] if idx == 0 else coef[0]) if len(classes) == 2 else coef[idx]
        pos_idx = np.argsort(weights)[::-1][:top_k]
        neg_idx = np.argsort(weights)[:top_k]
        result[str(cls_name)] = {
            "positive": [(str(vocab[j]), float(weights[j])) for j in pos_idx],
            "negative": [(str(vocab[j]), float(weights[j])) for j in neg_idx],
        }
    return result


def benchmark_single_latency_ms(
    pipeline: Pipeline,
    sample_texts: list[str],
    runs: int = 100,
) -> dict[str, float]:
    if not sample_texts or runs <= 0:
        raise ValueError("sample_texts must be non-empty and runs must be positive")
    timings = []
    for i in range(runs):
        text = sample_texts[i % len(sample_texts)]
        t0 = time.perf_counter()
        pipeline.predict_proba([text])
        timings.append((time.perf_counter() - t0) * 1000.0)
    arr = np.asarray(timings, dtype=float)
    # TODO: คืน {"mean_ms": ..., "p50_ms": ..., "p95_ms": ...}
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
      title: "ลืมตั้ง class_weight='balanced' บนชุดทิกเก็ตที่ไม่สมดุล",
      symptom: "หมวดหลักอย่าง `delivery` (75% ของข้อมูล) ได้ Recall 0.98 แต่หมวดหายากอย่าง `fraud` หรือ `billing` (5%) ได้ Recall ต่ำมากจนลูกค้าเคสสำคัญตกหล่น",
      fix: "ใส่ `class_weight=\"balanced\"` ใน `LogisticRegression` เสมอเมื่อสัดส่วนคลาสไม่เท่ากัน และวัดผลด้วย `f1_score(..., average=\"macro\")` แทน Accuracy",
    },
    {
      title: "สันนิษฐานว่า `clf.coef_` มีจำนวนแถวเท่ากับจำนวนคลาสเสมอในงาน 2 คลาส (Binary)",
      symptom: "เขียน `clf.coef_[1]` ในงานจำแนก 2 คลาสแล้วพังด้วย `IndexError: index 1 is out of bounds for axis 0 with size 1`",
      fix: "จำไว้ว่าสำหรับ Binary classification ใน scikit-learn `clf.coef_` มีรูปร่าง `(1, n_features)` โดยแทนน้ำหนักของ `clf.classes_[1]` และ `-clf.coef_[0]` แทนน้ำหนักของ `clf.classes_[0]`",
    },
    {
      title: "ส่งสตริงเดี่ยวเข้า `pipe.predict(text)` แทนที่จะห่อเป็น list `[text]`",
      symptom: "เกิด `ValueError: Iterable over raw text documents expected, string object received`",
      fix: "scikit-learn คาดหวัง iterable ของเอกสารเสมอ ให้ส่งเป็น `pipe.predict([text])` หรือ `pipe.predict_proba([text])` แม้จะทำนายแค่ 1 ข้อความ",
    },
    {
      title: "ใส่ `tfidf` และ `clf` แยกกันนอก Pipeline แล้วเอาไปใช้งานใน API",
      symptom: "ตอนเทรนตั้ง `ngram_range=(1, 2)` แต่ตอนโหลดขึ้น API ดันสร้าง `TfidfVectorizer` ใหม่หรือลืม `custom_dict` จนฟีเจอร์ไม่ตรงและคะแนนตกฮวบ",
      fix: "มัด `TfidfVectorizer` และ `LogisticRegression` เป็น {{sklearn-pipeline}} ชิ้นเดียวเสมอ เพื่อรับประกันว่าขั้นตอนแปลงข้อความตอนเทรนและตอนทำนายเหมือนกัน 100%",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d050-q1",
        "ทำไม `LogisticRegression` จึงมักเป็นตัวเลือกแรก (Baseline) ที่เหมาะสมกว่า Decision Tree หรือ Random Forest เมื่อฟีเจอร์เป็นเมทริกซ์ TF-IDF ของข้อความภาษาไทย?",
        [
          ["เพราะ `LogisticRegression` สามารถสร้างรูปภาพและข้อความตอบกลับลูกค้าได้เอง", "ไม่จริง — มันเป็นตัวจำแนกประเภท (classifier) ไม่ใช่ generative model"],
          ["เพราะเมทริกซ์ TF-IDF มีมิติสูงและเป็น sparse matrix — โมเดลเชิงเส้นคำนวณเร็วระดับ <5ms, ใช้ RAM น้อย, และ Overfit ยากกว่าต้นไม้บนข้อมูลมิติสูง", "ถูก — ต้นไม้ต้องสแกน split ข้ามคำศัพท์หลายหมื่นคอลัมน์ ทำให้ช้าและมักจำคำเฉพาะจน Overfit"],
          ["เพราะ Random Forest ไม่สามารถรันใน `scikit-learn` ได้", "Random Forest อยู่ใน `sklearn.ensemble` ตามปกติ แต่ไม่เหมาะกับ sparse high-dimensional text เท่า linear model"],
          ["เพราะ `LogisticRegression` ไม่ต้องตัดคำภาษาไทยก่อน", "ผิด — โมเดลยังคงต้องพึ่ง `PyThaiNLP` ใน `TfidfVectorizer` เพื่อตัดคำไทยก่อนเสมอ"],
        ],
        "B",
        "เมทริกซ์ TF-IDF เป็น sparse high-dimensional data ซึ่งโมเดลเชิงเส้นอย่าง `LogisticRegression` (หรือ LinearSVC) รับมือได้เร็ว แม่น และอธิบายได้ด้วย `coef_`",
        "ทำไม `TF-IDF + LogisticRegression` จึงเป็น Fast Baseline ที่เหมาะกับงานจัดหมวดข้อความไทย?",
        "เพราะทำงานบน sparse matrix มิติสูงได้เร็วระดับ <5ms, Overfit ยากกว่าต้นไม้บนฟีเจอร์คำศัพท์จำนวนมาก, และส่องคำสำคัญรายคลาสผ่าน `coef_` ได้ตรง ๆ",
      ),
      mc(
        "d050-q2",
        "เมื่อเปิดดู `clf.coef_` ของหมวด `billing` แล้วพบว่าคำว่า `\"ครับ\"` ติดอันดับ Top 3 Positive Keywords นั่นบ่งชี้ถึงปัญหาใดและควรแก้อย่างไร?",
        [
          ["เป็นเรื่องปกติ แปลว่าลูกค้าหมวดบัญชีสุภาพกว่าหมวดอื่น ไม่ต้องสนใจ", "อันตราย — คำลงท้ายไม่ควรเป็นตัวกำหนดหมวดหมู่ เพราะถ้าลูกค้าหมวดอื่นพิมพ์ 'ครับ' โมเดลจะเอนเอียงไปทาง billing"],
          ["ข้อมูลเทรนมีอคติแฝง (spurious correlation) หรือยังไม่ได้กรอง stopwords — ควรกรองคำลงท้ายใน tokenizer และตรวจความสมดุลของสไตล์ข้อความในชุดเทรน", "ถูก — นี่คือประโยชน์สำคัญของการส่อง `coef_` เพื่อจับสัญญาณหลอกก่อนขึ้น Production"],
          ["ต้องเปลี่ยนไปใช้ `C=1000` เพื่อให้โมเดลจำคำว่า `\"ครับ\"` ได้แรงขึ้น", "ยิ่งเพิ่ม `C` โมเดลยิ่งลด regularization และจำสัญญาณหลอกหนักขึ้นไปอีก"],
          ["ต้องลบ `sublinear_tf=True` ออกทันที", "`sublinear_tf` ไม่ได้เป็นต้นเหตุของการที่ stopwords ติดอันดับสูง"],
        ],
        "B",
        "การตรวจสอบ `coef_` ช่วยจับสัญญาณหลอก (spurious features) เช่น คำลงท้าย ชื่อแอดมิน หรือเทมเพลตระบบ ที่ไม่ควรมีอิทธิพลต่อการตัดสินใจจริง",
        "การเห็นคำลงท้ายอย่าง `\"ครับ\"` ติด Top Positive Keywords ใน `clf.coef_` สะท้อนปัญหาอะไร?",
        "สะท้อนว่าโมเดลกำลังพึ่งพาสัญญาณหลอก (spurious feature) หรือยังไม่ได้กรอง stopwords — ควรกรองคำลงท้ายและตรวจสอบอคติในชุดข้อมูลเทรน",
      ),
      mc(
        "d050-q3",
        "ในงานจัดหมวดหมู่ 2 คลาส (`classes_ = ['normal', 'urgent']`) เมื่อเทรน `LogisticRegression` เสร็จแล้ว `clf.coef_` จะมีรูปร่าง (shape) เป็นอย่างไร?",
        [
          ["`(2, n_features)` โดยแถว 0 เป็นของ `'normal'` และแถว 1 เป็นของ `'urgent'`", "ผิด — รูปร่าง `(n_classes, n_features)` เกิดเฉพาะกรณี 3 คลาสขึ้นไป (Multiclass)"],
          ["`(1, n_features)` โดยค่าบวกผลักไปทาง `classes_[1]` (`'urgent'`) และค่าลบผลักไปทาง `classes_[0]` (`'normal'`)", "ถูก — ใน Binary classification ของ scikit-learn เก็บเวกเตอร์น้ำหนักเพียงแถวเดียว"],
          ["`(n_features,)` เป็น 1D array เสมอ", "ผิด — `coef_` เป็น 2D array เสมอ แม้จะมีแค่ 1 แถว"],
          ["`None` เพราะ Binary Logistic Regression ไม่มี `coef_`", "ผิด — มี `coef_` ตามปกติ"],
        ],
        "B",
        "ใน scikit-learn งาน Binary classification จะให้ `coef_.shape == (1, n_features)` สำหรับ `classes_[1]` ส่วนงาน Multiclass (3+ คลาส) จะให้ `(n_classes, n_features)`",
        "รูปร่างของ `clf.coef_` ใน `LogisticRegression` ต่างกันอย่างไรระหว่าง 2 คลาส กับ 3 คลาสขึ้นไป?",
        "2 คลาสมีรูปร่าง `(1, n_features)` (แทน `classes_[1]` ส่วน `classes_[0]` คือ `-coef_[0]`) ส่วน 3 คลาสขึ้นไปมีรูปร่าง `(n_classes, n_features)`",
      ),
      mc(
        "d050-q4",
        "บริษัทมีทิกเก็ตลูกค้าภาษาไทย 80,000 ใบ/วัน และต้องการจัดหมวดอัตโนมัติโดยคุมต้นทุนและความหน่วงให้ต่ำที่สุด สถาปัตยกรรมใดเหมาะสมที่สุดตามหลักวิศวกรรม AI?",
        [
          ["ส่งทุกใบเข้า Frontier LLM API เพื่อความแม่นยำสูงสุดโดยไม่ต้องสร้าง Baseline", "แพงและช้ามากสำหรับ 80,000 ใบ/วัน ทั้งที่เคสส่วนใหญ่แยกได้ง่ายด้วยคำสำคัญ"],
          ["ใช้ `PyThaiNLP + TF-IDF + LogisticRegression` (<5ms) จัดหมวดทันทีสำหรับเคสที่ความมั่นใจสูง (`max_prob >= threshold`) และส่งเฉพาะเคสกำกวมที่ความมั่นใจต่ำไปให้ LLM หรือเจ้าหน้าที่", "ถูก — Confidence-Based Hybrid Routing ได้ทั้งความเร็ว/ต้นทุนของ Classical ML และความยืดหยุ่นของ LLM เฉพาะเคสยาก"],
          ["ใช้ regex ตรวจแค่ 3 คำโดยไม่เทรนโมเดลใด ๆ", "เปราะบางมากเมื่อลูกค้าพิมพ์คำใหม่หรือสะกดหลากหลาย และไม่สามารถจัดอันดับความมั่นใจได้"],
          ["เทรน LLM ขนาด 70B ใหม่ตั้งแต่ศูนย์สำหรับงานจัดหมวด 3 คลาส", "เกินความจำเป็นอย่างมากทั้งด้าน GPU, เวลา และข้อมูล"],
        ],
        "B",
        "Hybrid Routing ใช้ Fast Thai ML Baseline รับภาระ 80–90% ของทราฟฟิกใน <5ms ด้วยต้นทุน ~0 บาท และสงวน LLM ไว้สำหรับ 10–20% ที่ซับซ้อนจริง",
        "Hybrid Routing ระหว่าง Fast TF-IDF Classifier กับ LLM ทำงานอย่างไร?",
        "ให้ TF-IDF + LogisticRegression ทำนายก่อนใน <5ms: ถ้าความน่าจะเป็นสูงสุดผ่าน confidence threshold ให้ตัดสินทันที ถ้าต่ำกว่าเกณฑ์ค่อยส่งต่อให้ LLM ช่วยวิเคราะห์",
      ),
    ],
  },

  takeaways: [
    "มัด `PyThaiNLP newmm` + `TfidfVectorizer(sublinear_tf=True, ngram_range=(1, 2))` เข้ากับ `LogisticRegression(class_weight=\"balanced\")` ใน {{sklearn-pipeline}} ชิ้นเดียวเพื่อกัน {{data-leakage}} และพร้อมใช้งานจริง",
    "ส่องค่าน้ำหนัก `clf.coef_` ควบคู่ `get_feature_names_out()` ทุกครั้งหลังเทรน เพื่อตรวจสอบว่าโมเดลพึ่งพาคำไทยที่มีความหมายจริง ไม่ใช่สัญญาณหลอกหรือ stopwords",
    "Fast Thai TF-IDF Baseline ทำนายได้ระดับ <5ms บน CPU ด้วยต้นทุนแปรผันเป็นศูนย์ เหมาะเป็นทั้งไม้บรรทัดวัดผลแรกและด่านหน้าของ Confidence-Based Hybrid Routing ก่อนถึง {{llm}}",
    "ในวันพรุ่งนี้ (Day 51) เราจะใช้ Stratified K-Fold Cross-Validation และ `GridSearchCV` ปรับจูน `C` และ `ngram_range` บน Pipeline นี้โดยไม่ Overfit",
  ],

  reviewCards: [
    rc(
      "d050-rc-1",
      "พารามิเตอร์ 3 ตัวที่ควรตั้งเป็นมาตรฐานใน Fast Thai Baseline (`TfidfVectorizer` + `LogisticRegression`) คืออะไรและเพื่ออะไร?",
      "1) `sublinear_tf=True` (ลดอิทธิพลการพิมพ์คำซ้ำ), 2) `ngram_range=(1, 2)` (จับคำคู่ภาษาไทย), และ 3) `class_weight=\"balanced\"` ใน `LogisticRegression` (ไม่ให้คลาสหายากถูกกลืน)",
    ),
    rc(
      "d050-rc-2",
      "จะตรวจสอบได้อย่างไรว่า `LogisticRegression` บน TF-IDF ไม่ได้กำลังจำคำขยะหรือสัญญาณหลอก?",
      "ดึงชื่อคำจาก `pipe.named_steps['tfidf'].get_feature_names_out()` มาจับคู่กับ `pipe.named_steps['clf'].coef_` แล้วส่อง Top Positive / Negative keywords ของแต่ละคลาส",
    ),
    rc(
      "d050-rc-3",
      "ทำไมจึงควรใช้ `PyThaiNLP + TF-IDF + LogisticRegression` เป็นด่านหน้าก่อนเรียก LLM ในงานจัดหมวดข้อความปริมาณสูง?",
      "เพราะรันบน CPU ได้ใน <5ms (เร็วกว่า LLM 200–1,000 เท่า), ต้นทุนแปรผันเป็น 0, รันออฟไลน์ได้ตาม PDPA, และใช้ `max(predict_proba)` ส่งต่อเฉพาะเคสกำกวม 10–20% ให้ LLM ได้",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Working With Text Data (TF-IDF + Linear Classifiers)", href: "https://scikit-learn.org/stable/tutorial/text_analytics/working_with_text_data.html" },
    { label: "scikit-learn API Reference — LogisticRegression", href: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html" },
    { label: "scikit-learn API Reference — Pipeline", href: "https://scikit-learn.org/stable/modules/generated/sklearn.pipeline.Pipeline.html" },
    { label: "PyThaiNLP Documentation — Tokenization (word_tokenize & newmm)", href: "https://pythainlp.github.io/docs/5.0/api/tokenize.html" },
  ],

  glossary: [
    "tfidf",
    "pythainlp",
    "sklearn-pipeline",
    "dot-product",
    "precision-recall",
    "data-leakage",
    "llm",
    "pytest",
  ],
});
