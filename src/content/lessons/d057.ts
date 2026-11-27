import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D057 — Phase 2 / Block B15
 * Error Analysis on Misclassified Thai Tickets
 */
export const d057: Lesson = defineLesson({
  day: 57,
  titleTh: "ผ่าตัดข้อผิดพลาดบนทิกเก็ตภาษาไทยที่โมเดลทายผิด (Error Analysis)",
  tagline:
    "30 นาที · รันบนเครื่อง 100% CPU ไม่ต้องใช้ API key · แบ่งกลุ่ม FP/FN ที่โมเดลมั่นใจสูง เพื่อปรับฟีเจอร์และ Custom Dict อย่างตรงจุด",
  icon: "bar-chart-3",
  visual: {
    id: "phase2-ml-pipeline",
    title: "Error Analysis — ผ่าตัดทิกเก็ตไทยที่โมเดลทายผิดเพื่ออัปเกรดอย่างตรงจุด",
    caption:
      "ดูการแบ่งกลุ่ม False Positive / False Negative (ศัพท์เฉพาะ, คำประชด, ไทยปนอังกฤษ) เพื่อปรับฟีเจอร์และ dictionary",
    alt: "แผนภาพการวิเคราะห์ข้อผิดพลาดบนทิกเก็ตภาษาไทย",
  },
  requiresApiKey: false,
  tools: ["Polars", "PyThaiNLP", "scikit-learn", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ย้อนดูคุณภาพข้อความและคำศัพท์ภาษาไทยที่ต้นน้ำ",
      body: "โมเดล Classical ML มักไม่ได้พังเพราะอัลกอริทึมไม่เก่ง แต่พังเพราะฟีเจอร์ที่ส่งเข้าไปขาดสัญญาณสำคัญ เช่น คำศัพท์เฉพาะโดเมนถูกตัดคำขาด หรือตัวสะกดพิมพ์ลากเสียงจนกลายเป็นคำแปลกหน้า (OOV)",
      lessonNote:
        "วันนี้เรานำทิกเก็ตที่ทายผิดมาแยกแยะด้วย {{polars}} และ {{pythainlp}} เพื่อหาว่าความผิดพลาดส่วนใหญ่อยู่ที่ข้อมูลหรือการตัดคำจุดใด",
    },
    {
      node: 2,
      heading: "อัปเกรดฟีเจอร์อย่างมีเหตุผลแทนการสุ่มเปลี่ยนโมเดล",
      body: "มือใหม่มักเสียเวลาเปลี่ยนจาก Logistic Regression ไปลองโมเดลใหม่ ๆ ทั้งที่ข้อมูลและพจนานุกรมเดิมยังมีรอยรั่ว การแก้ที่ Feature Engineering และ Custom Dictionary ให้ผลตอบแทนต่อชั่วโมงสูงกว่ามาก",
      lessonNote:
        "เราจะเพิ่มคำเฉพาะโดเมนอย่าง `สลิปปลอม`, `โอนซ้ำ`, `ตัดบัตรซ้ำ` และทำความสะอาดคำลากเสียงลงใน {{sklearn-pipeline}} แล้ววัดผลเปรียบเทียบตรง ๆ",
    },
    {
      node: 3,
      heading: "ประเมินแบบเจาะกลุ่ม (Error Slicing) บน Validation Set เท่านั้น",
      body: "ตัวเลข F1 หรือ {{precision-recall|Precision/Recall}} รวมทั้งชุดอาจซ่อนจุดบอดร้ายแรง เช่น โมเดลทายผิดเกือบหมดในเคสไทยปนอังกฤษ (code-switching) หรือเคสเร่งด่วนด้านการเงิน",
      lessonNote:
        "เราสร้างตาราง Error Slice บน **Validation Set** (ห้ามแตะ Test Set เพื่อกัน {{data-leakage}}) เพื่อจัดลำดับการแก้ไขตามผลกระทบจริง",
    },
    {
      node: 6,
      heading: "หมุนวงจร Feedback Loop อย่างมีวินัย",
      body: "Error Analysis คือหัวใจของวงจร Feedback: วัดผล → ผ่าตัดเคสที่พัง → แก้ที่ต้นเหตุ (Data/Dict/Feature) → วัดซ้ำจนมั่นใจว่าไม่ทำเคสอื่นพังตาม",
      lessonNote:
        "รายการความผิดพลาดที่เราค้นพบวันนี้จะถูกนำไปต่อยอดเป็นชุดเทสต์พฤติกรรม (Behavioral Tests) ใน Day 59 ด้วย",
    },
  ],

  objectives: [
    "**สกัดและจัดอันดับ High-Confidence Errors** (False Positive และ False Negative ที่โมเดลมั่นใจสูงแต่ทายผิด) บนชุด Validation เพื่อหาจุดบอดที่ส่งผลกระทบหนักที่สุดก่อน",
    "**จำแนกหมวดหมู่ความผิดพลาดเฉพาะทางของทิกเก็ตไทย** (Error Slicing) ได้แก่ ศัพท์เฉพาะที่ตัดคำขาด, คำลากเสียง/พิมพ์ผิด, ไทยปนอังกฤษ (code-switching) และคำปฏิเสธ/ประชด",
    "**จัดลำดับการปรับปรุงแบบ Data-Centric** โดยใช้สัดส่วน Error Slice × ความรุนแรงของ FN ตัดสินใจอัปเกรด Custom Dictionary และ Text Normalization ก่อนลองเปลี่ยนอัลกอริทึม",
  ],

  prerequisites: [
    "ผ่าน Block B12–B14 (เข้าใจ {{precision-recall|Precision, Recall, F1}}, {{tfidf}}, {{pythainlp}} และ {{sklearn-pipeline}})",
    "เข้าใจการป้องกัน {{data-leakage}} และความต่างระหว่าง Validation Set กับ Test Set จาก Block B11",
    "ใช้ `uv`, `polars` และ `pytest` บนเครื่องได้คล่อง",
    "รันบนเครื่องได้ 100% บน CPU ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "ทำงานต่อในโปรเจกต์ Phase 2 Mini-Project ของคุณ (หรือสร้างโฟลเดอร์ใหม่สำหรับ Day 57 ด้วย {{uv}}) พร้อมตรวจว่ามี `polars`, `pythainlp`, `scikit-learn` และ `pytest` ครบแล้ว",
    commands: `uv init ai-day57 && cd ai-day57
uv add polars pythainlp scikit-learn
uv add --dev pytest ruff
uv run python -c "import polars, pythainlp, sklearn; print('Ready:', polars.__version__, sklearn.__version__)"`,
    steps: [
      ["init", "เข้าโฟลเดอร์โปรเจกต์ Phase 2 หรือสร้าง `ai-day57` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `polars`, `pythainlp`, `scikit-learn`, `pytest`, `ruff` ครบชุด"],
      ["verify", "รันเช็กเวอร์ชันผ่าน `uv run python` โดยไม่เกิด ImportError"],
    ],
    note: "การทำ Error Analysis ที่ดีไม่จำเป็นต้องมีชุดข้อมูลขนาดใหญ่ — แค่ดึงเคสที่ทายผิด 30–50 รายการจาก Validation Set มาอ่านและจัดหมวดหมู่จริง ๆ ก็มักเห็นแพตเทิร์นหลัก 80% แล้ว",
  },

  concepts: [
    {
      id: "high-confidence-error-slicing",
      title: "1 · อย่าดูแค่ F1 รวม: ผ่าตัด High-Confidence FP และ FN ก่อนเสมอ",
      paragraphs: [
        "สมมติโมเดลจัดความเร่งด่วนทิกเก็ตของคุณได้ `F1 = 0.81` บน Validation Set ตัวเลขนี้บอกแค่ว่า \"ยังไม่สมบูรณ์\" แต่ไม่ได้บอกเลยว่าควรแก้อะไรเป็นอันดับแรก หากเราสุ่มปรับ hyperparameter หรือสลับอัลกอริทึมไปมาโดยไม่อ่านตัวอย่างที่ผิด เรากำลังทำงานแบบเดาสุ่ม",
        "วิธีแบบมืออาชีพคือสร้าง **Error Table** จาก Validation Set แล้วเรียงตาม **Confidence** ของการทายผิด (`max(prob, 1 - prob)`) จากมากไปน้อย เคสที่โมเดลมั่นใจถึง `0.94` แต่ทายผิดมักเผยความจริงสำคัญสองอย่าง: (1) ฟีเจอร์หรือการตัดคำกำลัง \"บอด\" สัญญาณสำคัญ หรือ (2) ป้ายกำกับ (label) ในชุดข้อมูลติดผิดเอง (label noise)!",
        "แยกมอง **False Negative (FN)** (ทิกเก็ตเร่งด่วนจริงแต่โมเดลทายว่าปกติ — อันตรายต่อ SLA และเงินลูกค้า) ออกจาก **False Positive (FP)** (ทิกเก็ตปกติแต่โมเดลเตือนด่วน — เปลืองแรงทีมซัพพอร์ต) เสมอ เพราะต้นทุนธุรกิจของทั้งสองฝั่งไม่เท่ากัน",
      ],
      analogy:
        "เหมือนหมอตรวจคนไข้ที่ไข้ไม่ลด: ไม่ใช่ดูแค่อุณหภูมิเฉลี่ยทั้งวอร์ด (F1 รวม) แต่ต้องหยิบแฟ้มเคสที่อาการหนักสุดและวินิจฉัยพลาดชัดสุดขึ้นมาผ่าตัดหาต้นตอทีละกลุ่ม",
      bullets: [
        "**ทำบน Validation Set เท่านั้น** — ห้ามเปิดอ่าน Test Set มาปรับพจนานุกรมหรือฟีเจอร์เด็ดขาด มิฉะนั้น Test Set จะหมดความน่าเชื่อถือ ({{data-leakage}})",
        "โฟกัส **Top 30–50 High-Confidence Errors** ก่อน มักเจอต้นเหตุหลักไม่เกิน 3–4 กลุ่มที่กินสัดส่วนความผิดพลาดมากกว่า 70%",
        "บันทึก Error Log เป็นตาราง `ticket_id | text | y_true | y_pred | prob | error_type | slice_tag` เพื่อวัดความคืบหน้าก่อน-หลังแก้ได้จริง",
      ],
      code: {
        language: "python",
        filename: "error_table_polars.py",
        code: `import polars as pl

val_preds = pl.DataFrame({
    "ticket_id": ["T-101", "T-102", "T-103", "T-104"],
    "text": [
        "ลูกค้าส่งสลิปปลอมมาแจ้งโอน",
        "โอนซ้ำ 2 รอบด่วนนนน",
        "สอบถามเวลาเปิดร้านครับ",
        "payment timeout ตัดบัตรซ้ำ",
    ],
    "y_true": [1, 1, 0, 1],
    "prob_urgent": [0.12, 0.25, 0.88, 0.31],
})

errors = (
    val_preds.with_columns(
        (pl.col("prob_urgent") >= 0.5).cast(pl.Int64).alias("y_pred"),
        pl.max_horizontal(pl.col("prob_urgent"), 1.0 - pl.col("prob_urgent")).alias("confidence"),
    )
    .filter(pl.col("y_true") != pl.col("y_pred"))
    .with_columns(
        pl.when((pl.col("y_true") == 1) & (pl.col("y_pred") == 0))
        .then(pl.lit("FN"))
        .otherwise(pl.lit("FP"))
        .alias("error_type")
    )
    .sort("confidence", descending=True)
)
print(errors.select(["ticket_id", "error_type", "prob_urgent", "confidence", "text"]))`,
        caption: "ใช้ Polars คัดเฉพาะเคสที่ทายผิดพร้อมติดป้าย FP/FN และเรียงจากเคสที่โมเดลมั่นใจผิด ๆ สูงสุดก่อน",
      },
      whyTitle: "Why this matters — เคสที่มั่นใจสูงแต่ทายผิดคือเหมืองทองของการปรับปรุง",
      whyParagraphs: [
        "เคสที่ความน่าจะเป็นอยู่แถว `0.49` vs `0.51` มักเป็นเคสกำกวมที่แม้แต่มนุษย์ยังลังเล การไล่แก้เคสเหล่านั้นมักได้ผลน้อยและเสี่ยง overfit",
        "ตรงกันข้าม เคสที่โมเดลให้ `prob = 0.08` ทั้งที่เป็นทิกเก็ตเร่งด่วนจริงมักชี้ตรงไปยังรอยรั่วเชิงระบบ เช่น คำสำคัญถูกตัดขาดหรือข้อมูลป้ายกำกับผิด แก้ครั้งเดียวช่วยยกระดับหลายสิบเคสพร้อมกัน",
      ],
    },
    {
      id: "thai-failure-taxonomy",
      title: "2 · 4 กลุ่มความผิดพลาดยอดฮิตของทิกเก็ตภาษาไทย (Thai Error Taxonomy)",
      paragraphs: [
        "เมื่อคุณอ่านทิกเก็ตไทยที่โมเดล {{tfidf}} + {{pythainlp}} ทายผิดจริง ๆ คุณจะพบว่าความผิดพลาดส่วนใหญ่ตกอยู่ใน **4 หมวดหมู่เฉพาะทางของภาษาไทย** ที่ตำราภาษาอังกฤษไม่ค่อยพูดถึง:",
        "(1) **ศัพท์เฉพาะโดเมนที่ถูกตัดคำขาด (`missing_domain_term`)** เช่น `\"สลิปปลอม\"`, `\"โอนซ้ำ\"`, `\"ตัดบัตรซ้ำ\"`, `\"บัญชีโดนอายัด\"` หากไม่อยู่ใน `custom_dict` ของ `newmm` อาจถูกหั่นเป็นคำย่อยที่เสียสัญญาณความเร่งด่วน (2) **คำลากเสียงและพิมพ์ผิด (`elongated_typo`)** เช่น `\"ด่วนนนนน\"`, `\"ล่มมม\"`, `\"ช่วยด้วยยย\"` ซึ่ง {{tfidf}} จะมองว่าเป็นคนละคำกับ `\"ด่วน\"` หรือ `\"ล่ม\"` โดยสิ้นเชิง",
        "(3) **ไทยปนอังกฤษ (`code_switching`)** เช่น `\"OTP ไม่เข้า\"`, `\"API 500 error\"`, `\"payment timeout\"` หาก tokenizer ไม่ normalize ตัวพิมพ์เล็ก-ใหญ่หรือตัดสัญลักษณ์ผิดวิธี ฟีเจอร์จะแตกกระจาย และ (4) **คำปฏิเสธและคำประชด (`negation_sarcasm`)** เช่น `\"ไม่เป็นไรเลย แค่เงินหายไปหมื่นนึง\"` หรือ `\"ไม่ต้องรีบ\"` ซึ่ง unigram อย่างเดียวจับความต่างไม่ได้ ต้องพึ่ง bigram (`ngram_range=(1, 2)`) หรือส่งเคสกำกวมไปให้โมเดลเชิงความหมายใน Phase 3",
      ],
      analogy:
        "เหมือนคัดแยกเหตุผลที่พัสดุส่งไม่ถึงลูกค้าเป็น 4 กองชัดเจน: จ่าหน้าผิด (typo), ซอยใหม่ไม่มีในแผนที่ (missing domain term), เขียนที่อยู่ไทยปนอังกฤษ (code-switching) และลูกค้าเขียนประชดในหมายเหตุ (sarcasm) — แต่ละกองต้องใช้วิธีแก้คนละแบบ",
      bullets: [
        "**Missing Domain Term** → เติมคำลงใน `dict_trie(set(thai_words()) | DOMAIN_TERMS)`",
        "**Elongated / Typo** → ทำ text normalization เช่น ยุบอักษรไทย/อังกฤษที่ซ้ำติดกันเกิน 2 ตัว (`re.sub(r'(.)\\1{2,}', r'\\1', text)`) และ normalize สระซ้ำ",
        "**Code-Switching** → `.lower()` คำอังกฤษ + เก็บรหัส error เช่น `500`, `504`, `otp`, `timeout` ไว้เป็น token",
        "**Negation / Sarcasm** → เพิ่ม `ngram_range=(1, 2)` สำหรับ `\"ไม่ ด่วน\"`, `\"ไม่ เข้า\"` และบันทึกไว้เป็นเหตุผลสนับสนุน Hybrid ML+LLM ใน Day 60",
      ],
      code: {
        language: "python",
        filename: "thai_text_normalizer.py",
        code: `import re
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie

DOMAIN_TERMS = {"สลิปปลอม", "โอนซ้ำ", "ตัดบัตรซ้ำ", "ใบกำกับภาษี", "พร้อมเพย์"}
CUSTOM_DICT = dict_trie(set(thai_words()) | DOMAIN_TERMS)
ELONGATED_RE = re.compile(r"([ก-๛a-zA-Z])\\1{2,}")


def normalize_thai_ticket(text: str) -> str:
    # ยุบเสียงลากยาว เช่น "ด่วนนนน" -> "ด่วน", "พังงงง" -> "พัง"
    compact = ELONGATED_RE.sub(r"\\1", text.strip())
    return re.sub(r"\\s+", " ", compact).lower()


raw = "ระบบล่มมมม โอนซ้ำผ่าน PromptPay ด่วนนนนน!"
norm = normalize_thai_ticket(raw)
print("Normalized:", norm)
print("Tokens:    ", word_tokenize(norm, engine="newmm", custom_dict=CUSTOM_DICT, keep_whitespace=False))`,
        caption: "การยุบคำลากเสียง + เติม Custom Dictionary ทำให้คำว่า 'ด่วนนนนน' และ 'โอนซ้ำ' กลับมาจับคู่กับฟีเจอร์เดิมใน TF-IDF ได้ทันที",
      },
      whyTitle: "Why this matters — แก้ความผิดพลาดเฉพาะภาษาไทยได้ในไม่กี่บรรทัด",
      whyParagraphs: [
        "ลูกค้าจริงบน LINE OA หรือแชตซัพพอร์ตไทยแทบไม่พิมพ์ภาษาไทยแบบราชการ — แต่เต็มไปด้วยคำลากเสียง อีโมจิ และคำทับศัพท์ การ normalize ข้อความก่อนตัดคำช่วยลดขนาด vocabulary ที่แตกกระจาย (sparsity) และเพิ่ม Recall บนข้อความแชตได้ทันที",
        "ที่สำคัญ regex และ `dict_trie` ใช้เวลาเพิ่มเพียงหลักไมโครวินาที ยังคงรักษา latency `< 10ms` ของโมเดลไว้ได้เต็มร้อย",
      ],
    },
    {
      id: "data-centric-prioritization",
      title: "3 · Data-Centric Prioritization: จัดลำดับการแก้ด้วย Impact Matrix",
      paragraphs: [
        "หลังติดป้ายหมวดหมู่ให้เคสที่ผิดครบทุกใบ ให้สรุปตารางความถี่ของแต่ละ slice (จำนวนเคส, สัดส่วน % ของข้อผิดพลาดทั้งหมด และจำนวน FN ในกลุ่มนั้น) เพื่อตัดสินใจอย่างมีข้อมูลรองรับว่าควรลงทุนเวลาชั่วโมงถัดไปกับเรื่องไหน",
        "กฎทองของ **Data-Centric AI** คือเลือกงานที่ **Impact สูง + Effort ต่ำ** ก่อนเสมอ: หาก `missing_domain_term` และ `elongated_typo` รวมกันคิดเป็น 65% ของ FN ทั้งหมด การเติมคำศัพท์ 20 คำและเพิ่มฟังก์ชัน normalize 5 บรรทัดจะให้ผลลัพธ์คุ้มค่ากว่าการเทรนโมเดลที่ซับซ้อนขึ้นมาก",
        "หลังแก้ไขแต่ละอย่าง ให้วัดผลซ้ำบน Validation Set ด้วย **Cross-Validation หรือ Split เดิม** เพื่อยืนยัน 2 เรื่อง: (1) ข้อผิดพลาดใน slice เป้าหมายลดลงจริง และ (2) ไม่ได้ไปทำให้ slice อื่นพังเพิ่ม (no regression)",
      ],
      analogy:
        "เหมือนซ่อมเรือรั่ว: อุดรูใหญ่ใต้ท้องเรือที่น้ำเข้า 70% ก่อน อย่าเพิ่งเสียเวลาทาสีตัวเรือใหม่หรือเปลี่ยนเครื่องยนต์ราคาแพงทั้งที่รูเก่ายังเปิดอยู่",
      bullets: [
        "**Priority 1 (High Share, Low Effort)**: Custom Dict สำหรับศัพท์องค์กร + Text Normalization (ลด typo/ลากเสียง) + ล้าง label noise",
        "**Priority 2 (Medium Effort)**: เพิ่ม `ngram_range=(1, 2)`, character n-grams (`analyzer='char_wb'`) หรือฟีเจอร์ตารางเสริม (เช่น ช่องทาง, ยอดเงิน, เวลาส่ง)",
        "**Priority 3 (High Effort)**: ปรับอัลกอริทึม (เช่น LogisticRegression → LightGBM) หรือส่งเคสกำกวม (`sarcasm`) ไปให้ LLM ในสถาปัตยกรรม Hybrid",
      ],
      whyTitle: "Why this matters — แนวคิดนี้ใช้ได้ตั้งแต่ Classical ML ไปจนถึง RAG และ Agents",
      whyParagraphs: [
        "ใน Phase 4–5 (RAG & Evals) คุณจะใช้กระบวนการ Error Analysis แบบเดียวกันเป๊ะ: อ่านคำถามที่ RAG ตอบพลาด → แยกกลุ่ม (Retrieval Miss vs Chunk ขาด vs Hallucination) → แก้กลุ่มที่ใหญ่ที่สุดก่อน",
        "วิศวกรที่ทำ Error Analysis เป็นจะแก้ปัญหาตรงจุดและอธิบายเหตุผลของการปรับปรุงโมเดลให้ทีมหรือผู้สัมภาษณ์ฟังได้อย่างมีน้ำหนัก",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Error Analysis คือการดู Sentry Error Grouping ของฝั่ง ML",
      body: [
        "ในงาน Web/Backend เมื่อ error rate พุ่ง คุณไม่สุ่มเปลี่ยน framework จาก Express เป็น Fastify — แต่คุณเปิด Sentry ดูว่า error ไหนเกิดบ่อยสุดและกระทบลูกค้าหนักสุด Error Slicing ของ ML คือวินัยเดียวกัน:",
      ],
      table: [
        ["Overall F1 / Accuracy", "Overall HTTP 5xx Error Rate (บอกแค่ว่ามีปัญหา แต่ไม่บอกสาเหตุ)"],
        ["High-Confidence FN / FP Table", "Top Sentry Issues เรียงตามจำนวนผู้ใช้และระดับความรุนแรง"],
        ["Thai Error Slice Tags", "Grouping by root cause (Timeout vs Validation vs NullPointer)"],
        ["Custom Dict + Text Normalizer", "แก้ต้นตอที่ middleware/parser ก่อนย้ายไปเปลี่ยนทั้ง stack"],
        ["Validation Re-run (No Regression)", "รัน regression suite ยืนยันว่าแก้บั๊ก A ไม่ทำให้ฟีเจอร์ B พัง"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมห้ามแอบดู Test Set ตอนทำ Error Analysis",
      body: [
        "ลองนึกว่า **Validation Set** คือข้อสอบเก่าที่เราเอามาตรวจดูว่าเราทำผิดเรื่องไหนบ่อย (เช่น ชอบผิดเรื่องแคลคูลัส) เพื่อกลับไปอ่านเพิ่มเติม ส่วน **Test Set** คือข้อสอบปลายภาคจริงที่ต้องปิดผนึกไว้จนกว่าจะปรับโมเดลเสร็จทั้งหมด",
        "ถ้าเราแอบเปิดดู Test Set แล้วเติมคำจากข้อสอบปลายภาคเข้าไปใน Custom Dictionary คะแนนที่ได้จะสูงหลอกตา แต่พอเจอข้อความลูกค้าจริงชุดใหม่โมเดลอาจทำได้แย่ลง นี่คือเหตุผลที่เราต้องแยก Train / Val / Test ตั้งแต่ Block B11",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: โมเดลคัดกรองทิกเก็ตเร่งด่วนภาษาไทย (TF-IDF + LogisticRegression) พลาดทิกเก็ตสำคัญหลายใบใน Validation Set มาลองทำ Error Analysis แบบครบขั้นตอน: สกัด High-Confidence Errors → จัดกลุ่ม Error Slice → แก้ด้วย Custom Dict + Normalizer แล้วเทียบผลก่อน-หลัง",
    steps: [
      {
        title: "1 · เทรน Baseline และสกัด High-Confidence Errors จาก Validation Set",
        explain:
          "เทรนโมเดล baseline ด้วย tokenizer พื้นฐาน (ยังไม่ใส่ custom dict และยังไม่ยุบคำลากเสียง) แล้วดึงเคสที่ทายผิดบน Validation Set ออกมาดู",
        code: {
          language: "python",
          filename: "worked_d057.py",
          code: `from pythainlp.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

train_texts = [
    "โอนซ้ำสองรอบ เงินหายจากบัญชี ด่วน",
    "ลูกค้าแจ้งสลิปปลอม ตรวจสอบด่วน",
    "ระบบล่ม ตัดบัตรซ้ำ ลูกค้าชำระเงินไม่ได้",
    "บัญชีโดนล็อก เข้าใช้งานไม่ได้ ด่วน",
    "สอบถามเวลาเปิดทำการของสาขาครับ",
    "ขอเปลี่ยนที่อยู่จัดส่งพัสดุหน่อยค่ะ",
    "สินค้าสีดำมีสต็อกไหมครับ",
    "ขอใบเสร็จย้อนหลังเดือนที่แล้วค่ะ",
]
train_labels = [1, 1, 1, 1, 0, 0, 0, 0]

val_records = [
    {"id": "V-01", "text": "ด่วนนนน โอนซ้ำ 2 ครั้ง เงินไม่เข้า", "y_true": 1},
    {"id": "V-02", "text": "เจอสลิปปลอมมม ช่วยเช็กที", "y_true": 1},
    {"id": "V-03", "text": "PAYMENT TIMEOUT ตัดบัตรซ้ำครับ", "y_true": 1},
    {"id": "V-04", "text": "สอบถามโปรโมชันเดือนนี้หน่อยครับ", "y_true": 0},
]

def raw_tok(text: str) -> list[str]:
    return word_tokenize(text, engine="newmm", keep_whitespace=False)

baseline = Pipeline([
    ("tfidf", TfidfVectorizer(tokenizer=raw_tok, token_pattern=None, lowercase=False)),
    ("clf", LogisticRegression(C=4.0, random_state=42)),
])
baseline.fit(train_texts, train_labels)

val_probs = baseline.predict_proba([r["text"] for r in val_records])[:, 1]
for rec, prob in zip(val_records, val_probs):
    pred = int(prob >= 0.5)
    status = "OK" if pred == rec["y_true"] else ("FN" if rec["y_true"] == 1 else "FP")
    print(f"{rec['id']} | {status:2s} | prob={prob:.3f} | {rec['text']}")`,
        },
        output: `V-01 | FN | prob=0.461 | ด่วนนนน โอนซ้ำ 2 ครั้ง เงินไม่เข้า
V-02 | FN | prob=0.432 | เจอสลิปปลอมมม ช่วยเช็กที
V-03 | OK | prob=0.588 | PAYMENT TIMEOUT ตัดบัตรซ้ำครับ
V-04 | OK | prob=0.294 | สอบถามโปรโมชันเดือนนี้หน่อยครับ`,
      },
      {
        title: "2 · ติดป้าย Error Slice เพื่อหาต้นตอหลักของความผิดพลาด",
        explain:
          "สังเกตว่า `V-01` (`ด่วนนนน`, `โอนซ้ำ`) และ `V-02` (`สลิปปลอมมม`) หลุดเป็น FN เพราะคำลากเสียงและศัพท์เฉพาะไม่ได้ถูก normalize และรวมเป็น token เดียว เราจึงเขียนฟังก์ชันติดป้าย slice เพื่อวัดสัดส่วนปัญหา",
        code: {
          language: "python",
          filename: "worked_d057.py",
          code: `import re

DOMAIN_TERMS = {"สลิปปลอม", "โอนซ้ำ", "ตัดบัตรซ้ำ"}
ELONGATED_RE = re.compile(r"([ก-๛a-zA-Z])\\1{2,}")
EN_RE = re.compile(r"[A-Za-z]{2,}")

def tag_slice(text: str) -> str:
    if ELONGATED_RE.search(text):
        return "elongated_typo"
    if any(term in text for term in DOMAIN_TERMS):
        return "missing_domain_term"
    if EN_RE.search(text):
        return "code_switching"
    return "other"

for rec, prob in zip(val_records, val_probs):
    if int(prob >= 0.5) != rec["y_true"]:
        print(rec["id"], "-> slice:", tag_slice(rec["text"]))`,
        },
        output: `V-01 -> slice: elongated_typo
V-02 -> slice: elongated_typo`,
      },
      {
        title: "3 · อัปเกรดด้วย Normalizer + Custom Dict แล้ววัดผลซ้ำบนชุดเดิม",
        explain:
          "แทนที่จะเปลี่ยนโมเดล เราแค่เพิ่มการยุบคำลากเสียง (`.sub(r'\\1', ...)`) และ `dict_trie(set(thai_words()) | DOMAIN_TERMS)` เข้าใน tokenizer แล้วเทียบคะแนนบน Validation Set เดิม",
        code: {
          language: "python",
          filename: "worked_d057.py",
          code: `from pythainlp.corpus.common import thai_words
from pythainlp.util import dict_trie

CUSTOM_DICT = dict_trie(set(thai_words()) | DOMAIN_TERMS)

def clean_tok(text: str) -> list[str]:
    norm = ELONGATED_RE.sub(r"\\1", text.strip()).lower()
    return word_tokenize(norm, engine="newmm", custom_dict=CUSTOM_DICT, keep_whitespace=False)

upgraded = Pipeline([
    ("tfidf", TfidfVectorizer(tokenizer=clean_tok, token_pattern=None, lowercase=False)),
    ("clf", LogisticRegression(C=4.0, random_state=42)),
])
upgraded.fit(train_texts, train_labels)

new_probs = upgraded.predict_proba([r["text"] for r in val_records])[:, 1]
for rec, old_p, new_p in zip(val_records, val_probs, new_probs):
    pred = int(new_p >= 0.5)
    status = "OK" if pred == rec["y_true"] else "ERR"
    print(f"{rec['id']} | {status} | {old_p:.3f} -> {new_p:.3f} | {rec['text']}")`,
        },
        output: `V-01 | OK | 0.461 -> 0.742 | ด่วนนนน โอนซ้ำ 2 ครั้ง เงินไม่เข้า
V-02 | OK | 0.432 -> 0.684 | เจอสลิปปลอมมม ช่วยเช็กที
V-03 | OK | 0.588 -> 0.671 | PAYMENT TIMEOUT ตัดบัตรซ้ำครับ
V-04 | OK | 0.294 -> 0.278 | สอบถามโปรโมชันเดือนนี้หน่อยครับ`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมากเวลาเขียน regex ยุบตัวอักษรซ้ำ: ถ้าใช้ `{1,}` แทน `{2,}` คำภาษาไทยหรืออังกฤษปกติที่มีตัวอักษรเบิ้ล 2 ตัวอย่าง `\"สรรหา\"`, `\"กรรม\"`, `\"timeout\"`, `\"error\"` จะพังกลายเป็น `\"สรหา\"`, `\"กม\"`, `\"eror\"`! ต้องยุบเฉพาะตัวที่ซ้ำตั้งแต่ **3 ตัวขึ้นไป** (`\\1{2,}`)",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `error_analysis.py` สำหรับทำ Error Slicing และ Text Normalization บนทิกเก็ตภาษาไทยที่โมเดลทายผิด เพื่อช่วยทีมจัดลำดับการปรับปรุงแบบ Data-Centric",
    requirements: [
      "`normalize_thai_ticket(text: str) -> str`: ตัดช่องว่างหัวท้าย, ยุบตัวอักษรไทย/อังกฤษที่ซ้ำติดกัน **ตั้งแต่ 3 ตัวขึ้นไป** ให้เหลือ 1 ตัว (ห้ามทำลายคำที่ซ้ำแค่ 2 ตัวอย่าง `\"กรรม\"` หรือ `\"error\"`), ยุบช่องว่างซ้ำให้เหลือช่องว่างเดียว และแปลงตัวอักษรอังกฤษเป็นตัวพิมพ์เล็ก",
      "`extract_high_confidence_errors(records: list[dict], threshold: float = 0.5, top_k: int = 10) -> list[dict]`: รับรายการ `{\"ticket_id\", \"text\", \"y_true\", \"prob_urgent\"}` คัดเฉพาะรายการที่ทายผิด (`y_pred != y_true`), เพิ่มฟิลด์ `y_pred` (`0` หรือ `1`), `error_type` (`\"FN\"` หรือ `\"FP\"`), `confidence` (`round(max(prob, 1 - prob), 4)`), เรียงจาก `confidence` มากไปน้อย (ถ้าเท่ากันเรียงตาม `ticket_id` จากน้อยไปมาก) และคืนไม่เกิน `top_k` รายการ",
      "`tag_thai_error_slice(text: str, domain_terms: set[str]) -> str`: คืนป้ายกลุ่มความผิดพลาดตามลำดับความสำคัญ: `\"elongated_typo\"` (มีอักษรซ้ำ ≥ 3 ตัว) → `\"missing_domain_term\"` (มีคำใดคำหนึ่งใน `domain_terms` อยู่ใน `text` หลัง normalize) → `\"code_switching\"` (มีคำภาษาอังกฤษยาว ≥ 2 ตัวอักษร) → `\"other\"`",
      "`summarize_error_slices(errors: list[dict], domain_terms: set[str]) -> list[dict]`: รวมยอดข้อผิดพลาดแต่ละ slice คืนลิสต์ของ `{\"slice\", \"count\", \"share_pct\", \"fn_count\"}` โดย `share_pct` ปัดทศนิยม 1 ตำแหน่ง และเรียงตาม `count` มากไปน้อย (ถ้าเท่ากันเรียง `slice` A→Z)",
    ],
    starter: {
      language: "python",
      filename: "error_analysis.py",
      code: `import re

ELONGATED_RE = re.compile(r"([ก-๛a-zA-Z])\\1{2,}")
ENGLISH_WORD_RE = re.compile(r"[A-Za-z]{2,}")


def normalize_thai_ticket(text: str) -> str:
    """ยุบอักษรที่ลากยาว >= 3 ตัวเหลือ 1 ตัว คงคำซ้ำ 2 ตัวไว้ และแปลงอังกฤษเป็นตัวพิมพ์เล็ก"""
    # TODO: implement normalization
    raise NotImplementedError


def extract_high_confidence_errors(
    records: list[dict],
    threshold: float = 0.5,
    top_k: int = 10,
) -> list[dict]:
    """คัดเคสที่ทายผิด พร้อมระบุ y_pred, error_type (FP/FN), confidence เรียงจากมั่นใจสูงสุด"""
    # TODO: implement error extraction & sorting
    raise NotImplementedError


def tag_thai_error_slice(text: str, domain_terms: set[str]) -> str:
    """ติดป้ายกลุ่มข้อผิดพลาดเฉพาะภาษาไทย"""
    # TODO: elongated_typo -> missing_domain_term -> code_switching -> other
    raise NotImplementedError


def summarize_error_slices(errors: list[dict], domain_terms: set[str]) -> list[dict]:
    """สรุปจำนวน, สัดส่วน % และจำนวน FN ของแต่ละ error slice เพื่อจัดลำดับการแก้"""
    # TODO: aggregate by slice and sort descending by count
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_error_analysis.py",
      code: `import pytest
from error_analysis import (
    extract_high_confidence_errors,
    normalize_thai_ticket,
    summarize_error_slices,
    tag_thai_error_slice,
)


def test_normalize_preserves_double_chars_and_collapses_elongation():
    assert normalize_thai_ticket("  ด่วนนนนน ระบบล่มมม   Error 500 ") == "ด่วน ระบบล่ม error 500"
    assert normalize_thai_ticket("กรรมการแจ้งโอนซ้ำ") == "กรรมการแจ้งโอนซ้ำ"


def test_extract_high_confidence_errors_sorting_and_labels():
    records = [
        {"ticket_id": "T-1", "text": "สลิปปลอม", "y_true": 1, "prob_urgent": 0.10},
        {"ticket_id": "T-2", "text": "ถามราคา", "y_true": 0, "prob_urgent": 0.20},
        {"ticket_id": "T-3", "text": "ถามเวลาเปิด", "y_true": 0, "prob_urgent": 0.85},
        {"ticket_id": "T-4", "text": "โอนซ้ำด่วนนน", "y_true": 1, "prob_urgent": 0.30},
    ]
    errs = extract_high_confidence_errors(records, threshold=0.5, top_k=2)
    assert len(errs) == 2
    assert errs[0]["ticket_id"] == "T-1"
    assert errs[0]["error_type"] == "FN"
    assert errs[0]["confidence"] == pytest.approx(0.90)
    assert errs[1]["ticket_id"] == "T-3"
    assert errs[1]["error_type"] == "FP"
    assert errs[1]["confidence"] == pytest.approx(0.85)


def test_tag_and_summarize_error_slices():
    terms = {"สลิปปลอม", "โอนซ้ำ", "ตัดบัตรซ้ำ"}
    assert tag_thai_error_slice("ด่วนนนนน โอนซ้ำ", terms) == "elongated_typo"
    assert tag_thai_error_slice("พบสลิปปลอมในระบบ", terms) == "missing_domain_term"
    assert tag_thai_error_slice("OTP ไม่เข้าครับ", terms) == "code_switching"
    assert tag_thai_error_slice("ไม่เป็นไรหรอก แค่ของหาย", terms) == "other"

    errors = [
        {"ticket_id": "T-1", "text": "ด่วนนนนน ช่วยด้วย", "error_type": "FN"},
        {"ticket_id": "T-2", "text": "พังงงง เข้าไม่ได้", "error_type": "FN"},
        {"ticket_id": "T-3", "text": "พบสลิปปลอม", "error_type": "FN"},
        {"ticket_id": "T-4", "text": "OTP ล่าช้า", "error_type": "FP"},
    ]
    summary = summarize_error_slices(errors, terms)
    assert summary[0] == {
        "slice": "elongated_typo",
        "count": 2,
        "share_pct": 50.0,
        "fn_count": 2,
    }
    assert sum(row["count"] for row in summary) == 4
    assert summarize_error_slices([], terms) == []
`,
    },
    selfCheck: [
      "`normalize_thai_ticket` ยุบ `ด่วนนนนน` → `ด่วน` แต่ยังคงคำว่า `กรรมการ` และ `error` ไว้ครบไม่พัง",
      "`extract_high_confidence_errors` คืนเฉพาะรายการที่ทายผิด แยก `FN`/`FP` ถูกต้อง และเรียงตาม `confidence` จากมากไปน้อย",
      "`tag_thai_error_slice` จัดกลุ่มเคสทั้ง 4 แบบได้แม่นยำตามลำดับความสำคัญ",
      "`summarize_error_slices` รองรับกรณี `errors = []` โดยคืน `[]` ไม่เกิด `ZeroDivisionError`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance:
      "ผ่านทั้ง 3 test functions ใน `test_error_analysis.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `normalize_thai_ticket` ใช้ `ELONGATED_RE.sub(r'\\1', text.strip())` ก่อน แล้วค่อยยุบ whitespace ด้วย `re.sub(r'\\s+', ' ', ...)` และ `.lower()`",
      },
      {
        body: "ใน `extract_high_confidence_errors` ให้คำนวณ `y_pred = 1 if prob >= threshold else 0` และ `confidence = round(max(prob, 1.0 - prob), 4)` จากนั้นเรียงด้วย `key=lambda r: (-r['confidence'], r['ticket_id'])` แล้ว slice `[:top_k]`",
      },
      {
        body: "โครงของ `tag_thai_error_slice` และจุดเริ่มต้นของ `summarize_error_slices` พร้อมแล้ว เหลือเติมการคำนวณ `share_pct` และเรียงลำดับ:",
        code: {
          language: "python",
          filename: "hint_day57.py",
          code: `def tag_thai_error_slice(text: str, domain_terms: set[str]) -> str:
    if ELONGATED_RE.search(text):
        return "elongated_typo"
    norm = normalize_thai_ticket(text)
    if any(term.lower() in norm for term in domain_terms):
        return "missing_domain_term"
    if ENGLISH_WORD_RE.search(text):
        return "code_switching"
    return "other"


def summarize_error_slices(errors: list[dict], domain_terms: set[str]) -> list[dict]:
    if not errors:
        return []
    buckets: dict[str, dict[str, int]] = {}
    for err in errors:
        sl = tag_thai_error_slice(err["text"], domain_terms)
        entry = buckets.setdefault(sl, {"count": 0, "fn_count": 0})
        entry["count"] += 1
        if err.get("error_type") == "FN":
            entry["fn_count"] += 1
    total = len(errors)
    # TODO: แปลง buckets เป็น list[dict] พร้อม share_pct และเรียง (-count, slice)
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "ทำ Error Analysis บน Test Set แทนที่จะทำบน Validation Set",
      symptom: "หลังเติมคำเฉพาะจาก Test Set เข้า Custom Dictionary คะแนน Test F1 พุ่งสวย แต่พอขึ้น production คะแนนตกลงทันที",
      fix: "ทำ Error Analysis, เติม dictionary และปรับฟีเจอร์บน **Validation Set** เท่านั้น เก็บ Test Set ไว้ประเมินครั้งสุดท้ายรอบเดียวเพื่อกัน {{data-leakage}}",
    },
    {
      title: "สุ่มเปลี่ยนอัลกอริทึมไปมาโดยไม่เคยเปิดอ่านข้อความที่โมเดลทายผิด",
      symptom: "ลองทั้ง LogisticRegression, SVM, LightGBM แล้ว F1 วนอยู่ที่เดิม (~0.80) ทั้งวัน",
      fix: "เปิดอ่าน Top 30 High-Confidence Errors ก่อนเสมอ — ถ้าคำศัพท์สำคัญถูกตัดขาดหรือพิมพ์ลากเสียง ต่อให้เปลี่ยนกี่อัลกอริทึมก็ยังมองไม่เห็นฟีเจอร์นั้นอยู่ดี",
    },
    {
      title: "เขียน regex ยุบตัวอักษรซ้ำแรงเกินไปจนทำลายคำปกติ",
      symptom: "ใช้ `r'(.)\\1+'` ทำให้คำว่า `\"กรรม\"`, `\"สรรพ\"`, `\"error\"`, `\"session\"` ถูกตัดตัวอักษรจนเพี้ยนและไม่ตรงกับพจนานุกรม",
      fix: "ยุบเฉพาะตัวอักษรที่ซ้ำตั้งแต่ 3 ตัวขึ้นไป (`r'([ก-๛a-zA-Z])\\1{2,}'`) และเขียน unit test ตรวจคำที่ซ้ำ 2 ตัวไว้เสมอ",
    },
    {
      title: "ดูแต่จำนวน Error รวมโดยไม่แยก FN กับ FP",
      symptom: "ไล่แก้กลุ่มที่เกิด FP เล็กน้อย แต่ปล่อยให้ FN ด้านการเงิน (`สลิปปลอม`, `ตัดบัตรซ้ำ`) หลุดไปหาลูกค้า",
      fix: "แยกนับ `fn_count` ในทุก Error Slice แล้วจัดลำดับความสำคัญให้กลุ่มที่สร้างความเสียหายทางธุรกิจสูงก่อน",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d057-q1",
        "ทำไมการทำ Error Analysis จึงควรเริ่มต้นจากการคัด **High-Confidence Errors** (เคสที่โมเดลมั่นใจสูงแต่ทายผิด) บน Validation Set?",
        [
          ["เพราะเคสที่มั่นใจสูงมักคำนวณเร็วกว่าเคสที่มั่นใจต่ำ", "ไม่เกี่ยว — เวลาคำนวณแต่ละแถวเท่ากัน"],
          ["เพราะเคสที่โมเดลมั่นใจผิด ๆ สูงมากมักชี้ตรงไปยังปัญหาเชิงระบบ (เช่น ศัพท์เฉพาะถูกตัดขาด, normalization พัง หรือ label ผิด) ที่แก้ครั้งเดียวช่วยได้หลายเคส", "ถูก — ต่างจากเคสแถว 0.50 ที่มักเป็นความกำกวมตามธรรมชาติ"],
          ["เพราะเคสที่มั่นใจต่ำกว่า 0.50 ไม่ถือว่าเป็นความผิดพลาด", "ผิด — ถ้า `y_true == 1` แล้ว `prob == 0.45` ก็ยังเป็น False Negative"],
          ["เพราะ scikit-learn ไม่อนุญาตให้ดูเคสที่ความน่าจะเป็นอยู่ระหว่าง 0.4–0.6", "ไม่จริง — เราดูได้ทุกเคส แต่จัดลำดับจากเคสที่ให้ signal ชัดสุดก่อน"],
        ],
        "B",
        "High-Confidence Errors เป็นตัวกรองที่ช่วยชี้จุดบอดเชิงโครงสร้าง (missing domain terms, data bugs, label noise) ได้เร็วที่สุด",
        "ทำไมควรอ่าน High-Confidence Errors ก่อนเคสที่ความน่าจะเป็นใกล้ 0.50?",
        "เพราะเคสที่โมเดลมั่นใจสูงแต่ทายผิดมักเกิดจากจุดบอดเชิงระบบ (เช่น ตัดคำผิด, ขาดศัพท์โดเมน หรือ label ผิด) แก้หนึ่งจุดได้ผลกระทบกว้างกว่าเคสกำกวม",
      ),
      mc(
        "d057-q2",
        "จากผล Error Slicing บน Validation Set พบว่า 48% ของ False Negative เกิดจากคำศัพท์โดเมนอย่าง `\"สลิปปลอม\"` และ `\"โอนซ้ำ\"` ถูกตัดขาด และอีก 22% เกิดจากคำลากเสียง (`\"ด่วนนนน\"`) ขั้นตอนใดควรทำเป็นอันดับแรก?",
        [
          ["เปลี่ยนจาก Logistic Regression ไปเทรน Deep Learning ขนาดใหญ่ทันที", "ไม่คุ้ม — ยังไม่ได้แก้รอยรั่วต้นทางที่กินสัดส่วนถึง 70% ของปัญหา"],
          ["เพิ่มคำศัพท์โดเมนเข้า `dict_trie` ของ PyThaiNLP และเพิ่ม Text Normalization ยุบคำลากเสียง (≥ 3 ตัว) แล้ววัดผลซ้ำบน Validation Set", "ถูก — Impact สูง (ครอบคลุม 70% ของ FN), Effort ต่ำ และยังคง latency < 10ms"],
          ["ลบแถวที่มีคำลากเสียงออกจาก Validation Set เพื่อให้คะแนนสูงขึ้น", "ผิดร้ายแรง — การลบข้อมูลยากออกจาก Validation เป็นการโกงผลประเมิน"],
          ["นำ Test Set มารวมเข้า Train Set เพื่อให้โมเดลเห็นคำมากขึ้น", "ผิด — เกิด Data Leakage ทำให้วัดผลจริงไม่ได้"],
        ],
        "B",
        "แนวทาง Data-Centric AI ให้แก้กลุ่มความผิดพลาดที่ใหญ่ที่สุดด้วยวิธีที่ตรงจุดและต้นทุนต่ำที่สุดก่อน (Custom Dict + Normalizer) แล้วค่อยวัดผลเปรียบเทียบ",
        "หลักการจัดลำดับการแก้หลังทำ Error Slicing คืออะไร?",
        "เริ่มจาก Error Slice ที่มีสัดส่วน/ผลกระทบ FN สูงสุดและแก้ได้ตรงจุด (High Impact, Low Effort) เช่น เติม Custom Dict และ Text Normalization ก่อนเปลี่ยนอัลกอริทึม",
      ),
      mc(
        "d057-q3",
        "หากใช้ regex `re.sub(r'(.)\\1+', r'\\1', text)` กับข้อความทิกเก็ตภาษาไทย จะเกิดปัญหาใด?",
        [
          ["regex นี้ไม่ทำงานกับอักษรไทย", "ไม่จริง — มันจับทั้งไทยและอังกฤษ แต่จับกว้างเกินไป"],
          ["คำปกติที่มีตัวอักษรซ้ำ 2 ตัวอย่าง `\"กรรม\"`, `\"สรรหา\"` หรือ `\"error\"` จะถูกยุบจนสะกดผิดและไม่ตรงกับพจนานุกรม", "ถูก — ควรใช้ `\\1{2,}` เพื่อยุบเฉพาะตัวที่ซ้ำตั้งแต่ 3 ตัวขึ้นไป (คำลากเสียง)"],
          ["ทำให้ไฟล์ UTF-8 เสียหาย", "ไม่เกี่ยว — เป็นการแก้สตริงปกติ"],
          ["ทำให้ความเร็วการรันช้าลงเกิน 1 วินาทีต่อประโยค", "ไม่จริง — ปัญหาหลักคือความถูกต้องของคำศัพท์"],
        ],
        "B",
        "ภาษาไทยและอังกฤษมีคำปกติที่เบิ้ลตัวอักษร 2 ตัวจำนวนมาก การยุบจึงควรตั้งเกณฑ์ตั้งแต่ 3 ตัวขึ้นไป (`{2,}` หลังตัวแรก) เท่านั้น",
        "ทำไม regex ยุบคำลากเสียงจึงต้องใช้ `\\1{2,}` แทน `\\1+`?",
        "เพื่อยุบเฉพาะตัวที่ซ้ำตั้งแต่ 3 ตัวขึ้นไป (เช่น `ด่วนนนน`) โดยไม่ทำลายคำปกติที่ซ้ำ 2 ตัวอย่าง `กรรม`, `สรรหา`, `error`",
      ),
      mc(
        "d057-q4",
        "ข้อใดคือข้อผิดพลาดร้ายแรงด้านระเบียบวิธี (methodology) ระหว่างทำ Error Analysis?",
        [
          ["การแยกนับ False Positive กับ False Negative ออกจากกัน", "นี่คือแนวปฏิบัติที่ดี"],
          ["การเปิดอ่านเคสที่ทายผิดจาก **Test Set** แล้วนำคำศัพท์จาก Test Set ไปเติมใน Custom Dictionary ก่อนรายงานผลสุดท้าย", "ถูก — นี่คือ Data Leakage ทางอ้อม (test-set overfitting) ที่ทำให้คะแนน Test สูงเกินจริง"],
          ["การบันทึก Error Table ลงไฟล์ CSV/Parquet เพื่อเทียบผลก่อน-หลัง", "นี่คือแนวปฏิบัติที่ดีเพื่อความสามารถในการตรวจสอบย้อนหลัง"],
          ["การสร้าง slice `code_switching` เพื่อวัดความแม่นยำเฉพาะทิกเก็ตไทยปนอังกฤษ", "นี่คือหัวใจของ Error Slicing"],
        ],
        "B",
        "Validation Set มีไว้สำหรับทำ Error Analysis และปรับปรุงโมเดล ส่วน Test Set ต้องถูกเก็บไว้ประเมินครั้งสุดท้ายโดยไม่นำข้อมูลข้างในมาปรับพจนานุกรมหรือฟีเจอร์",
        "ต้องทำ Error Analysis บนชุดข้อมูลใด (Train / Validation / Test) และทำไม?",
        "ทำบน Validation Set เท่านั้น ห้ามใช้ Test Set เพื่อป้องกัน Data Leakage และให้คะแนน Test สะท้อนประสิทธิภาพบนข้อมูลใหม่จริง ๆ",
      ),
    ],
  },

  takeaways: [
    "อย่าหยุดแค่ตัวเลข F1 รวม — ดึง **Top High-Confidence FP/FN** จาก Validation Set มาอ่านและจัดกลุ่ม (**Error Slicing**) เพื่อหาต้นตอที่แท้จริงก่อนลงมือแก้",
    "ปัญหาเฉพาะทางของทิกเก็ตภาษาไทยมักวนอยู่ที่ 4 กลุ่ม: ศัพท์เฉพาะโดเมนถูกตัดขาด, คำลากเสียง/พิมพ์ผิด, ไทยปนอังกฤษ (`code-switching`) และคำปฏิเสธ/ประชด",
    "ยึดหลัก **Data-Centric AI**: เติม Custom Dictionary + ยุบคำลากเสียง (≥ 3 ตัว) + ปรับ `ngram_range` มักให้ผลลัพธ์คุ้มกว่าการเปลี่ยนอัลกอริทึมแบบสุ่ม",
    "ทำ Error Analysis บน **Validation Set เท่านั้น** ห้ามแอบใช้ Test Set ปรับพจนานุกรมหรือฟีเจอร์เด็ดขาด ({{data-leakage}})",
  ],

  reviewCards: [
    rc(
      "d057-rc-1",
      "4 หมวดหมู่ความผิดพลาดยอดฮิตของข้อความทิกเก็ตภาษาไทย (Thai Error Taxonomy) มีอะไรบ้าง และแก้อย่างไร?",
      "1) ศัพท์โดเมนถูกตัดขาด → เติม `custom_dict` (`dict_trie`), 2) คำลากเสียง/พิมพ์ผิด → ยุบอักษรซ้ำ ≥ 3 ตัว, 3) ไทยปนอังกฤษ → `.lower()` + เก็บ error code, 4) คำปฏิเสธ/ประชด → เพิ่ม bigram หรือส่งต่อ Hybrid LLM",
    ),
    rc(
      "d057-rc-2",
      "ทำไมจึงควรจัดลำดับการอ่าน Error Table จากเคสที่โมเดลมีความมั่นใจสูง (`max(prob, 1-prob)`) ก่อน?",
      "เพราะเคสที่มั่นใจสูงแต่ทายผิดมักเกิดจากจุดบอดเชิงระบบ (missing feature, bad tokenization, label noise) ซึ่งแก้ครั้งเดียวช่วยลดข้อผิดพลาดได้หลายเคส ต่างจากเคสแถว 0.50 ที่มักกำกวมตามธรรมชาติ",
    ),
    rc(
      "d057-rc-3",
      "กฎเหล็กของการป้องกัน Data Leakage ระหว่างทำ Error Analysis คืออะไร?",
      "ทำ Error Analysis, สร้าง Custom Dictionary และปรับฟีเจอร์บน Validation Set เท่านั้น ห้ามเปิดดู Test Set มาปรับแต่งโมเดลก่อนรายงานผลสุดท้าย",
    ),
  ],

  sources: [
    {
      label: "DeepLearning.AI — Data-Centric AI & Error Analysis Playbook (Andrew Ng)",
      href: "https://www.deeplearning.ai/short-courses/",
    },
    {
      label: "scikit-learn User Guide — Model Evaluation & Confusion Matrix",
      href: "https://scikit-learn.org/stable/modules/model_evaluation.html",
    },
    {
      label: "PyThaiNLP Documentation — Word Tokenization & Custom Dictionary",
      href: "https://pythainlp.github.io/docs/5.0/api/tokenize.html",
    },
    {
      label: "Polars User Guide — Expressions for Data Slicing & Aggregation",
      href: "https://docs.pola.rs/user-guide/concepts/expressions-and-contexts/",
    },
  ],

  glossary: [
    "precision-recall",
    "pythainlp",
    "tfidf",
    "polars",
    "data-leakage",
    "sklearn-pipeline",
    "pytest",
  ],
});
