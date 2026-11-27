import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D045 — Phase 2 / Block B12
 * Classification Metrics (Precision, Recall, F1, PR-AUC for Imbalanced Data)
 */
export const d045: Lesson = defineLesson({
  day: 45,
  titleTh: "วัดผลโมเดลจำแนกประเภทเมื่อข้อมูลไม่สมดุล (Precision, Recall, F1 & PR-AUC)",
  tagline: "30 นาที · รันบน CPU 100% ไม่ใช้ API key · ทำไม Accuracy 98% ถึงหลอกตา และเลือกตัวชี้วัดตามความเสี่ยงธุรกิจ",
  icon: "sliders-horizontal",
  visual: {
    id: "precision-recall-thresh",
    title: "Confusion Matrix, Precision, Recall, F1 & Probability Threshold",
    caption: "เลื่อนแถบ Threshold เพื่อดู Trade-off ระหว่าง Precision กับ Recall และต้นทุนธุรกิจ (FP vs FN) แบบสด ๆ",
    alt: "แผนภาพโต้ตอบปรับ threshold เพื่อดู Precision, Recall, F1 และต้นทุน FP/FN",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "NumPy", "uv", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "นิยามความสำเร็จของโมเดลให้ตรงความเสี่ยงธุรกิจ",
      body: "งานจริงอย่างจับธุรกรรมทุจริต คัดทิกเก็ต VIP ด่วน หรือตรวจจับลูกค้ากำลังยกเลิกบริการมักมีคลาสเป้าหมายแค่ 1%–5% ของข้อมูลทั้งหมด — การบอกทีมว่า 'โมเดลแม่น 98%' อาจไม่มีความหมายเลยถ้าจับเคสด่วนไม่ได้แม้แต่เคสเดียว",
      lessonNote: "วันนี้เราเปลี่ยนคำถามจาก 'โมเดลแม่นกี่เปอร์เซ็นต์' เป็น 'เราพลาดเคสสำคัญกี่เคส และเตือนเก้อกี่ครั้ง'",
    },
    {
      node: 2,
      heading: "อ่านค่าความน่าจะเป็น (`predict_proba`) ไม่ใช่แค่ 0 หรือ 1",
      body: "โมเดลจำแนกประเภทจาก {{sklearn-pipeline}} (เช่น Logistic Regression หรือ {{lightgbm}}) ไม่ได้ตอบแค่ใช่/ไม่ใช่ แต่คืนความน่าจะเป็น `y_prob` ระหว่าง 0.0 ถึง 1.0 เพื่อเปิดทางให้เราปรับเกณฑ์ตัดสินใจได้เอง",
      lessonNote: "เกณฑ์เริ่มต้น `0.50` ของ `.predict()` ไม่ใช่คำตอบที่ดีที่สุดเสมอไป — เราใช้ `predict_proba` คู่กับ PR-AUC เพื่อวัดคุณภาพการจัดอันดับ",
    },
    {
      node: 3,
      heading: "เลือก Metric ที่สะท้อนความเป็นจริงของ Imbalanced Data",
      body: "ขั้น Evaluation คือด่านที่ตัดสินว่าโมเดลพร้อมขึ้นระบบจริงหรือไม่ หากเลือกตัวชี้วัดผิด (เช่น ดูแค่ Accuracy หรือ ROC-AUC กับข้อมูลไม่สมดุลหนัก) เราอาจเลือกโมเดลที่พังในงานจริง",
      lessonNote: "วัดผลด้วย Confusion Matrix, {{precision-recall|Precision, Recall, F1}} และ PR-AUC (`average_precision_score`) บนชุด Validation ที่ปลอด {{data-leakage}}",
    },
    {
      node: 5,
      heading: "ติดตามคุณภาพหลังขึ้น Production",
      body: "หลังปล่อยโมเดลจริง สัดส่วนเคสด่วนอาจเปลี่ยนตามฤดูกาลหรือแคมเปญ การแยกติดตาม Precision และ Recall ช่วยให้รู้ทันทีว่าโมเดลเริ่มเตือนเก้อถี่เกินไปหรือเริ่มหลุดเคสสำคัญ",
      lessonNote: "โครงสร้างตัวชี้วัดวันนี้จะต่อยอดตรงสู่การจูน Threshold ตามต้นทุนธุรกิจใน Day 48 และระบบ Monitoring ใน Day 54",
    },
  ],

  objectives: [
    "**อธิบาย Accuracy Paradox** ได้ชัดเจนว่าทำไมโมเดลที่ได้ Accuracy 98% บนชุดข้อมูลที่มีคลาสเป้าหมาย 2% จึงอาจไร้ประโยชน์ในงานจริง",
    "**คำนวณและตีความ** Confusion Matrix (`TP`, `FP`, `FN`, `TN`), **Precision**, **Recall** และ **F1-Score** พร้อมเข้าใจผลของการขยับ probability threshold",
    "**ใช้ PR-AUC (`average_precision_score`)** เปรียบเทียบโมเดลหลายตัวบนข้อมูลไม่สมดุล (imbalanced data) โดยไม่ต้องผูกติดกับ threshold เดียว",
  ],

  prerequisites: [
    "ผ่าน Block B11 เข้าใจ Train/Val/Test split, {{sklearn-pipeline}} และการป้องกัน {{data-leakage}}",
    "เข้าใจความน่าจะเป็นเบื้องต้นและ {{expected-value}} จาก Day 39",
    "ใช้ `uv`, `pytest` และ NumPy array พื้นฐานได้",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่สำหรับ Block B12 ด้วย {{uv}} แล้วติดตั้ง `scikit-learn` และ `numpy` พร้อมชุดทดสอบ ใช้เวลาไม่เกิน 2 นาที",
    commands: `uv init ai-day45 && cd ai-day45
uv add scikit-learn numpy
uv add --dev pytest ruff
uv run python -c "import sklearn, numpy; print('sklearn:', sklearn.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day45` ด้วย `uv init` สำเร็จ"],
      ["deps", "ติดตั้ง `scikit-learn`, `numpy`, `pytest` และ `ruff` ผ่าน `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็น `sklearn: 1.x` โดยไม่มี error"],
    ],
    note: "โค้ดทุกตัวอย่างในบทนี้รันบน CPU ได้ในไม่กี่มิลลิวินาทีโดยไม่ต้องดาวน์โหลดชุดข้อมูลขนาดใหญ่",
  },

  concepts: [
    {
      id: "accuracy-paradox-confusion-matrix",
      title: "1 · Accuracy Paradox และ Confusion Matrix (TP, FP, FN, TN)",
      paragraphs: [
        "สมมติระบบซัพพอร์ตไทยรับทิกเก็ตวันละ 1,000 ใบ โดยมีทิกเก็ต **ด่วนระดับ SLA วิกฤต (urgent = 1)** เพียง 20 ใบ (2%) และอีก 980 ใบเป็นทิกเก็ตปกติ (0) ถ้าใครสักคนเขียนโมเดลโง่ ๆ ที่ตอบ `0` (ไม่ด่วน) ทุกใบโดยไม่อ่านข้อมูลเลย โมเดลนั้นจะได้ **Accuracy = 980 / 1,000 = 98%** ทันที — ทั้งที่จับทิกเก็ตด่วนไม่ได้เลยแม้แต่ใบเดียว!",
        "นี่คือ **Accuracy Paradox**: เมื่อคลาสไม่สมดุล (imbalanced data) ตัวเลข Accuracy จะถูกครอบงำด้วยคลาสส่วนใหญ่ (Negative) จนมองไม่เห็นความล้มเหลวบนคลาสเป้าหมายที่หายาก เราจึงต้องกางผลลัพธ์ออกเป็น **Confusion Matrix** 4 ช่องเสมอ:",
      ],
      analogy:
        "เหมือนยามเฝ้าประตูที่ไม่เคยตรวจใครเลยและปล่อยทุกคนผ่านตลอด 98% ของคนเดินผ่านไม่ใช่ขโมย ยามเลยดูเหมือนทำงาน 'ถูก 98%' ทั้งที่ปล่อยขโมยเดินเข้าตึกครบทุกคน",
      bullets: [
        "**TP (True Positive)** — ของจริงด่วน และโมเดลทายว่าด่วน (จับถูก)",
        "**FP (False Positive / Type I Error)** — ของจริงปกติ แต่โมเดลทายว่าด่วน (เตือนเก้อ / หลอกให้ทีมตรวจฟรี)",
        "**FN (False Negative / Type II Error)** — ของจริงด่วน แต่โมเดลทายว่าปกติ (หลุด! พลาดเคสสำคัญ)",
        "**TN (True Negative)** — ของจริงปกติ และโมเดลทายว่าปกติ (ผ่านถูก)",
      ],
      code: {
        language: "python",
        filename: "accuracy_paradox.py",
        code: `import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score

# ทิกเก็ต 100 ใบ: ด่วนจริง 2 ใบ (2%), ปกติ 98 ใบ (98%)
y_true = np.array([1] * 2 + [0] * 98)
# โมเดลมักง่าย: ทายว่า "ไม่ด่วน (0)" ทุกใบ
y_pred_dummy = np.zeros_like(y_true)

tn, fp, fn, tp = confusion_matrix(y_true, y_pred_dummy, labels=[0, 1]).ravel()
print(f"Accuracy : {accuracy_score(y_true, y_pred_dummy):.2%}")
print(f"TP={tp}, FP={fp}, FN={fn}, TN={tn}")
print(f"Precision: {precision_score(y_true, y_pred_dummy, zero_division=0):.2%}")
print(f"Recall   : {recall_score(y_true, y_pred_dummy, zero_division=0):.2%}")`,
        caption: "ส่ง `labels=[0, 1]` ให้ `confusion_matrix` เสมอเพื่อการันตีลำดับ `tn, fp, fn, tp` แม้คลาสใดคลาสหนึ่งจะไม่ถูกทายเลย",
      },
      whyTitle: "Why this matters — แยกต้นทุนของ FP กับ FN ออกจากกัน",
      whyParagraphs: [
        "ในระบบ AI จริง ความผิดพลาดสองแบบไม่เคยมีราคาเท่ากัน: สำหรับระบบตรวจจับธุรกรรมโกงหรือคัดทิกเก็ต VIP ด่วน การปล่อยหลุด (**FN**) อาจทำให้เสียลูกค้าหรือโดนปรับ SLA หลักหมื่นบาท ขณะที่การเตือนเก้อ (**FP**) เสียแค่เวลาพนักงานคลิกตรวจ 30 วินาที",
        "ในทางกลับกัน สำหรับระบบบล็อกบัญชีผู้ใช้หรือส่งโปรโมชันอัตโนมัติ การทายผิดว่าโกง (**FP**) จะทำให้ลูกค้าดีเดือดร้อนหนัก — การเห็นช่อง `TP/FP/FN/TN` ชัด ๆ ทำให้คุยกับทีมธุรกิจรู้เรื่องตั้งแต่ก่อนเทรนโมเดล",
      ],
    },
    {
      id: "precision-recall-f1-tradeoff",
      title: "2 · Precision, Recall และ F1-Score — ชั่งน้ำหนักระหว่างทายแม่นกับเก็บครบ",
      paragraphs: [
        "{{precision-recall|Precision และ Recall}} ตอบคำถามคนละข้อจาก Confusion Matrix เดียวกัน: **Precision = TP / (TP + FP)** ถามว่า *\"ในบรรดาเคสที่โมเดลชี้ว่าใช่ ใช่จริงกี่เปอร์เซ็นต์?\"* (เน้นลด FP / ลดเตือนเก้อ) ส่วน **Recall = TP / (TP + FN)** ถามว่า *\"ในบรรดาเคสที่ใช่จริงทั้งหมด โมเดลจับได้กี่เปอร์เซ็นต์?\"* (เน้นลด FN / ลดเคสหลุด)",
        "ทั้งสองค่ามี **Trade-off** โดยธรรมชาติผ่าน **Probability Threshold**: หากเราลด threshold ลง (เช่น จาก `0.50` เป็น `0.30`) โมเดลจะทายว่า `1` ง่ายขึ้น ทำให้ **Recall เพิ่มขึ้น** แต่ **Precision มักลดลง** เพราะดึงเคสปกติติดร่างแหมาเป็น FP ด้วย ในทางกลับกันถ้าเพิ่ม threshold เป็น `0.80` **Precision จะสูงขึ้น** แต่ **Recall จะตก**",
        "เมื่อต้องการเลขสรุปตัวเดียวที่สมดุลทั้งสองฝั่ง เราใช้ **F1-Score** ซึ่งเป็น *Harmonic Mean* `2 * (P * R) / (P + R)` ข้อดีของ Harmonic Mean คือมันลงโทษทันทีถ้าตัวใดตัวหนึ่งต่ำมาก เช่น หาก Precision = 1.0 แต่ Recall = 0.02 ค่าเฉลี่ยเลขคณิตได้ 0.51 ดูสวยหลอกตา แต่ F1 จะเหลือแค่ `0.039`",
      ],
      analogy:
        "เหมือนการทอดแหจับปลาในบ่อที่มีขยะลอยปน: ตาแหถี่มาก (threshold ต่ำ) จับปลาได้ครบทุกตัว (Recall สูง) แต่ติดขยะขึ้นมาเต็มแห (Precision ต่ำ) ส่วนใช้ฉมวกแทงทีละตัว (threshold สูง) แทงทีไรโดนปลาแน่ ๆ (Precision สูง) แต่ปลาว่ายหนีไปเยอะ (Recall ต่ำ)",
      bullets: [
        "**เน้น Recall สูง** เมื่อ FN แพงมาก: คัดทิกเก็ตฉุกเฉิน, ตรวจจับ fraud ขั้นต้น, คัดกรองโรค",
        "**เน้น Precision สูง** เมื่อ FP แพงมาก: แบนบัญชีอัตโนมัติ, ส่งข้อความแจ้งเตือนลูกค้า, ตอบอัตโนมัติโดยไม่มีคนตรวจ",
        "**เน้น F1 หรือ F-beta (`fbeta_score`)** เมื่อต้องคุมทั้งสองฝั่งพร้อมกัน (เช่น `beta=2` ให้น้ำหนัก Recall มากกว่า Precision 2 เท่า)",
      ],
      whyTitle: "Why this matters — อย่าปล่อยให้ `.predict()` ตัดสินใจแทนคุณด้วยค่า 0.50",
      whyParagraphs: [
        "เมธอด `.predict(X)` ใน scikit-learn แค่แอบตัด `predict_proba(X)[:, 1] >= 0.50` ให้โดยไม่รู้เลยว่าธุรกิจของคุณกลัว FP หรือ FN มากกว่ากัน",
        "AI Engineer ที่ดีจึงเก็บ `y_prob` จาก `predict_proba` ไว้ประเมินหลาย threshold เสมอ และใน Day 48 เราจะใช้ {{expected-value}} คำนวณ threshold ที่ลดต้นทุนรวมเป็นตัวเงินได้ต่ำที่สุด",
      ],
    },
    {
      id: "pr-auc-vs-roc-auc",
      title: "3 · PR-AUC (`average_precision_score`) — เทียบโมเดลบนข้อมูลไม่สมดุลโดยไม่อิง Threshold เดียว",
      paragraphs: [
        "ปัญหาของการดู F1 ตอนเปรียบเทียบโมเดล A กับโมเดล B คือ F1 ผูกติดกับ threshold หนึ่งค่า (เช่น 0.50) โมเดล B อาจจัดอันดับเคสด่วนได้ดีกว่าโมเดล A มาก แต่แค่มีสเกลความน่าจะเป็นต่ำกว่าจนที่ 0.50 ดูเหมือนแพ้",
        "เราจึงวัดคุณภาพการจัดอันดับ (ranking quality) ข้ามทุก threshold ด้วย **PR-AUC** (พื้นที่ใต้กราฟ Precision–Recall) ซึ่งใน `scikit-learn` คำนวณได้ตรง ๆ ด้วย `average_precision_score(y_true, y_prob)` ค่าเข้าใกล้ `1.0` ยิ่งดี และค่าของโมเดลเดาสุ่มจะเท่ากับ **สัดส่วนคลาสเป้าหมาย (prevalence)** เช่น ถ้าเคสด่วนมี 2% โมเดลเดาสุ่มจะได้ PR-AUC ประมาณ `0.02`",
        "ทำไมต้อง **PR-AUC** แทนที่จะดู **ROC-AUC** อย่างเดียว? เพราะแกน X ของ ROC คือ False Positive Rate `FP / (FP + TN)` — เมื่อ TN มีมหาศาล (เช่น 98,000 เคสปกติ) ต่อให้โมเดลเตือนเก้อเพิ่มอีก 1,000 เคส ค่า FPR ก็ขยับแค่ 0.01 ทำให้ ROC-AUC ยังสวยหรู 0.95 แต่ในความเป็นจริงทีมซัพพอร์ตจมกอง FP ไปแล้ว ส่วน PR-AUC ไม่ใช้ `TN` ในสูตรเลย จึงฟ้องปัญหา FP บนข้อมูลไม่สมดุลได้ตรงไปตรงมาที่สุด",
      ],
      analogy:
        "ROC-AUC เหมือนวัดคะแนนการจับโจรโดยเอาจำนวนพลเมืองดีทั้งประเทศ (TN) มาเป็นตัวหาร ทำให้จับผิดคนไปร้อยคนตัวเลขก็ยังดูดี แต่ PR-AUC หารเฉพาะคนที่ตำรวจจับกุมจริง จึงเห็นทันทีว่าจับมั่วไปกี่เปอร์เซ็นต์",
      code: {
        language: "python",
        filename: "pr_auc_compare.py",
        code: `import numpy as np
from sklearn.metrics import average_precision_score, roc_auc_score

# 1,000 เคส: ด่วนจริง 20 เคส (2%)
rng = np.random.default_rng(42)
y_true = np.array([1] * 20 + [0] * 980)

# โมเดลที่แยกเคสปกติส่วนใหญ่ได้ แต่ปน FP มา 80 เคสในกลุ่มคะแนนสูง
y_prob_noisy = np.concatenate([
    rng.uniform(0.65, 0.95, size=20),   # 20 เคสด่วนจริง
    rng.uniform(0.65, 0.95, size=80),   # 80 เคสปกติที่หลงคะแนนสูง (FP)
    rng.uniform(0.01, 0.30, size=900),  # 900 เคสปกติที่แยกออกชัด (TN)
])

print(f"ROC-AUC : {roc_auc_score(y_true, y_prob_noisy):.3f}  <-- ดูสูงสวยหรู!")
print(f"PR-AUC  : {average_precision_score(y_true, y_prob_noisy):.3f}  <-- ฟ้องความจริงว่า precision ต่ำ")`,
        caption: "เมื่อ TN เยอะมาก ROC-AUC อาจสูงเกิน 0.90 แม้ว่า 4 ใน 5 ของเคสที่เตือนจะเป็น FP — PR-AUC เผยความจริงนี้ทันที",
      },
      whyTitle: "Why this matters — ตัวชี้วัดหลักตลอด Phase 2 และ Phase 5",
      whyParagraphs: [
        "ตั้งแต่ Day 47 (LightGBM) ไปจนถึง Day 51 (Cross-Validation) เราจะใช้ `average_precision` (PR-AUC) เป็นเกณฑ์เลือกโมเดลสำหรับงานข้อมูลไม่สมดุล แล้วค่อยจูน threshold ปิดท้ายบนชุด Validation",
        "แนวคิด Precision/Recall ยังเป็นฐานของงานค้นคืนเอกสารใน Phase 4 (Context Precision / Context Recall ของระบบ RAG) และตัวตรวจ Guardrails ใน Phase 5 ด้วย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Classification Metrics กับ Alerting & Spam Filter",
      body: [
        "ถ้าคุณเคยดูแลระบบ monitoring alert หรือ spam filter ในเว็บแอป คุณเคยเจอ Trade-off ระหว่าง Precision กับ Recall มาแล้วทุกวัน:",
      ],
      table: [
        ["False Positive (FP)", "Alert ดังตอนตี 3 แต่เซิร์ฟเวอร์ปกติ (alert fatigue)"],
        ["False Negative (FN)", "ระบบล่มจริงแต่ alert ไม่ดังจนลูกค้าโทรมาด่า"],
        ["Precision = TP/(TP+FP)", "ความน่าเชื่อถือของ alert (ดังทีไรพังจริงกี่ %)"],
        ["Recall = TP/(TP+FN)", "ความครอบคลุม (เหตุการณ์พังจริงจับได้กี่ %)"],
        ["Probability Threshold", "ค่าขีดแบ่งความไวของกฎเตือน (เช่น CPU > 70% vs > 95%)"],
      ],
    },
    student: {
      title: "First-Year Note — จำสูตร Precision กับ Recall ไม่ให้สลับกัน",
      body: [
        "เทคนิคจำที่ไม่มีวันสลับคือดู **ตัวหาร (ฐานที่เทียบ)**: **Precision** หารด้วย *สิ่งที่โมเดลทายว่าใช่* (`TP + FP`) — คิดว่า \"แม่นแค่ไหนเวลาชี้\", ส่วน **Recall** หารด้วย *ของจริงที่ใช่ทั้งหมด* (`TP + FN`) — คิดว่า \"เก็บตกของจริงมาได้ครบแค่ไหน\"",
        "และอย่าลืมใส่ `zero_division=0` ในฟังก์ชัน `precision_score`, `recall_score`, `f1_score` ของ scikit-learn เสมอ เพราะถ้า threshold สูงจนโมเดลไม่ทาย `1` เลย (`TP + FP == 0`) จะเกิดการหารด้วยศูนย์และพ่น warning ใส่หน้าจอ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีชุด Validation ขนาดกะทัดรัด 10 ทิกเก็ต (ด่วนจริง 3 ใบ, ปกติ 7 ใบ) พร้อมคะแนนความน่าจะเป็น `y_prob` จากโมเดลคัดกรองทิกเก็ต VIP มาไล่ดูทีละขั้นว่า Confusion Matrix, Precision/Recall/F1 เปลี่ยนอย่างไรตาม Threshold และคำนวณ PR-AUC เพื่อสรุปคุณภาพรวม",
    steps: [
      {
        title: "1 · เตรียมข้อมูลชุด Validation และตรวจผลที่ Threshold ค่าเริ่มต้น 0.50",
        explain:
          "เริ่มจากใช้เกณฑ์มาตรฐาน `0.50` แปลง `y_prob` เป็นคำทำนาย 0/1 แล้วคำนวณ Confusion Matrix พร้อม Precision, Recall, F1",
        code: {
          language: "python",
          filename: "worked_day45.py",
          code: `import numpy as np
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

y_true = np.array([1, 1, 1, 0, 0, 0, 0, 0, 0, 0])
y_prob = np.array([0.92, 0.74, 0.35, 0.62, 0.41, 0.28, 0.19, 0.12, 0.08, 0.03])


def eval_threshold(y_true: np.ndarray, y_prob: np.ndarray, threshold: float) -> dict[str, float | int]:
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return {
        "threshold": threshold,
        "tp": int(tp),
        "fp": int(fp),
        "fn": int(fn),
        "tn": int(tn),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 3),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 3),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 3),
    }


print("Default 0.50:", eval_threshold(y_true, y_prob, 0.50))`,
        },
        output: `Default 0.50: {'threshold': 0.5, 'tp': 2, 'fp': 1, 'fn': 1, 'tn': 6, 'precision': 0.667, 'recall': 0.667, 'f1': 0.667}`,
      },
      {
        title: "2 · เทียบ Trade-off ที่ Threshold 0.30 (เน้น Recall) กับ 0.70 (เน้น Precision)",
        explain:
          "ลองขยับ threshold ลงมาที่ `0.30` เพื่อไม่ให้หลุดเคสด่วนใบที่ 3 (`0.35`) เทียบกับขยับขึ้นไปที่ `0.70` เพื่อลดการเตือนเก้อ (`0.62`)",
        code: {
          language: "python",
          filename: "worked_day45.py",
          code: `for th in [0.30, 0.50, 0.70]:
    r = eval_threshold(y_true, y_prob, th)
    print(
        f"th={r['threshold']:.2f} | TP={r['tp']} FP={r['fp']} FN={r['fn']} | "
        f"P={r['precision']:.3f} R={r['recall']:.3f} F1={r['f1']:.3f}"
    )`,
        },
        output: `th=0.30 | TP=3 FP=2 FN=0 | P=0.600 R=1.000 F1=0.750
th=0.50 | TP=2 FP=1 FN=1 | P=0.667 R=0.667 F1=0.667
th=0.70 | TP=2 FP=0 FN=1 | P=1.000 R=0.667 F1=0.800`,
      },
      {
        title: "3 · สรุปคุณภาพการจัดอันดับรวมด้วย PR-AUC และเทียบกับ Baseline เคลื่อนที่",
        explain:
          "ใช้ `average_precision_score(y_true, y_prob)` เพื่อวัดคุณภาพข้ามทุก threshold โดยเทียบกับค่า baseline ของการเดาสุ่ม (`y_true.mean() = 0.30`)",
        code: {
          language: "python",
          filename: "worked_day45.py",
          code: `pr_auc = average_precision_score(y_true, y_prob)
baseline = float(y_true.mean())
print(f"Model PR-AUC   : {pr_auc:.4f}")
print(f"Random Baseline: {baseline:.4f} (lift = {pr_auc / baseline:.2f}x)")`,
        },
        output: `Model PR-AUC   : 0.8667
Random Baseline: 0.3000 (lift = 2.89x)`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมาก: ส่ง `y_pred` (ค่า 0/1 ที่ตัด threshold แล้ว) เข้าไปใน `average_precision_score(y_true, y_pred)` แทนที่จะส่ง `y_prob` (ค่าความน่าจะเป็นต่อเนื่อง) — การส่ง 0/1 จะทำให้กราฟ PR เหลือจุดเดียวและได้คะแนน PR-AUC ต่ำกว่าความเป็นจริงมาก!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `metrics_day45.py` สำหรับประเมินโมเดลจำแนกทิกเก็ตด่วนบนข้อมูลไม่สมดุล ทั้งแบบระบุ threshold และแบบจัดอันดับหลายโมเดลด้วย PR-AUC",
    requirements: [
      "`evaluate_at_threshold(y_true: list[int] | np.ndarray, y_prob: list[float] | np.ndarray, threshold: float = 0.5) -> dict[str, float | int]`: แปลง `y_prob >= threshold` เป็นคำทำนาย 0/1 แล้วคืน dict ที่มีคีย์ครบ 8 ตัว: `tp`, `fp`, `fn`, `tn` (int), `precision`, `recall`, `f1`, `accuracy` (float, ใช้ `zero_division=0`)",
      "ตรวจสอบอินพุตใน `evaluate_at_threshold`: ถ้า `threshold` ไม่อยู่ในช่วง `[0.0, 1.0]` หรือความยาว `y_true` ไม่เท่า `y_prob` หรือข้อมูลว่าง ให้ `raise ValueError`",
      "`rank_models_by_pr_auc(y_true: list[int] | np.ndarray, model_probs: dict[str, list[float] | np.ndarray]) -> list[tuple[str, float]]`: คำนวณ `average_precision_score` ให้ทุกโมเดลใน `model_probs` แล้วคืนรายการ `(model_name, pr_auc)` เรียงจากมากไปน้อย (ถ้าเท่ากันเรียงชื่อโมเดล A→Z)",
      "`find_min_threshold_for_recall(y_true: list[int] | np.ndarray, y_prob: list[float] | np.ndarray, min_recall: float, grid: list[float] | None = None) -> float | None`: จากค่า `grid` (ค่าเริ่มต้น `[round(x, 2) for x in np.linspace(0.1, 0.9, 17)]`) เลือก threshold ที่ให้ **Precision สูงที่สุด** ภายใต้เงื่อนไขว่า `recall >= min_recall` (ถ้า Precision เท่ากันให้เลือก threshold ที่สูงกว่า; ถ้าไม่มี threshold ใดผ่านคืน `None`)",
    ],
    starter: {
      language: "python",
      filename: "metrics_day45.py",
      code: `import numpy as np
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


def evaluate_at_threshold(
    y_true: list[int] | np.ndarray,
    y_prob: list[float] | np.ndarray,
    threshold: float = 0.5,
) -> dict[str, float | int]:
    """ประเมิน Confusion Matrix และ Precision/Recall/F1/Accuracy ณ threshold ที่กำหนด"""
    # TODO: ตรวจเงื่อนไข input (ความยาว, ไม่ว่าง, 0.0 <= threshold <= 1.0)
    # TODO: คำนวณ tn, fp, fn, tp ด้วย confusion_matrix(..., labels=[0, 1]) และ metrics ต่าง ๆ
    raise NotImplementedError


def rank_models_by_pr_auc(
    y_true: list[int] | np.ndarray,
    model_probs: dict[str, list[float] | np.ndarray],
) -> list[tuple[str, float]]:
    """เรียงอันดับโมเดลตาม PR-AUC (average_precision_score) จากมากไปน้อย"""
    # TODO: คำนวณ PR-AUC ให้แต่ละโมเดลแล้วเรียง (-score, name)
    raise NotImplementedError


def find_min_threshold_for_recall(
    y_true: list[int] | np.ndarray,
    y_prob: list[float] | np.ndarray,
    min_recall: float,
    grid: list[float] | None = None,
) -> float | None:
    """หา threshold ที่ให้ Precision สูงสุดภายใต้เงื่อนไข recall >= min_recall"""
    # TODO: วนตรวจแต่ละ threshold ใน grid แล้วคัดผู้ชนะ
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day45.py",
      code: `import pytest
from metrics_day45 import (
    evaluate_at_threshold,
    find_min_threshold_for_recall,
    rank_models_by_pr_auc,
)


def test_evaluate_at_threshold_normal_and_zero_division():
    y_true = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
    y_prob = [0.92, 0.74, 0.35, 0.62, 0.41, 0.28, 0.19, 0.12, 0.08, 0.03]

    res = evaluate_at_threshold(y_true, y_prob, threshold=0.30)
    assert (res["tp"], res["fp"], res["fn"], res["tn"]) == (3, 2, 0, 5)
    assert res["precision"] == pytest.approx(0.6)
    assert res["recall"] == pytest.approx(1.0)
    assert res["f1"] == pytest.approx(0.75)
    assert res["accuracy"] == pytest.approx(0.8)

    # threshold สูงมากจนไม่ทาย positive เลย -> precision/recall/f1 = 0.0 ไม่มี warning
    high = evaluate_at_threshold(y_true, y_prob, threshold=0.99)
    assert high["tp"] == 0 and high["fp"] == 0
    assert high["precision"] == 0.0
    assert high["recall"] == 0.0
    assert high["f1"] == 0.0


def test_evaluate_validation_errors():
    with pytest.raises(ValueError):
        evaluate_at_threshold([], [], threshold=0.5)
    with pytest.raises(ValueError):
        evaluate_at_threshold([1, 0], [0.5], threshold=0.5)
    with pytest.raises(ValueError):
        evaluate_at_threshold([1, 0], [0.9, 0.1], threshold=1.2)


def test_rank_models_by_pr_auc():
    y_true = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
    probs = {
        "dummy_constant": [0.5] * 10,
        "good_lgbm": [0.95, 0.80, 0.60, 0.40, 0.30, 0.20, 0.15, 0.10, 0.05, 0.01],
        "ok_logreg": [0.92, 0.74, 0.35, 0.62, 0.41, 0.28, 0.19, 0.12, 0.08, 0.03],
    }
    ranked = rank_models_by_pr_auc(y_true, probs)
    assert [name for name, _ in ranked] == ["good_lgbm", "ok_logreg", "dummy_constant"]
    assert ranked[0][1] == pytest.approx(1.0)
    assert ranked[1][1] == pytest.approx(0.8666667, rel=1e-4)


def test_find_min_threshold_for_recall():
    y_true = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
    y_prob = [0.92, 0.74, 0.35, 0.62, 0.41, 0.28, 0.19, 0.12, 0.08, 0.03]

    # ต้องการ recall >= 0.95 (ต้องเก็บครบ 3/3) -> ที่ 0.35 ได้ TP=3, FP=2 (P=0.60) สูงกว่า 0.30 ที่เท่ากันแต่ threshold สูงกว่า
    best = find_min_threshold_for_recall(y_true, y_prob, min_recall=0.95)
    assert best == pytest.approx(0.35)

    # ถ้า grid มีแต่ค่าสูงเกิน (0.80, 0.90) จะทำ recall >= 0.95 ไม่ได้ -> คืน None
    assert find_min_threshold_for_recall(y_true, y_prob, min_recall=0.95, grid=[0.80, 0.90]) is None
`,
    },
    selfCheck: [
      "`evaluate_at_threshold` ตรวจความถูกต้องของอินพุต (fail-fast) และคืน `tp/fp/fn/tn` ที่ไม่พังแม้ไม่มีการทายคลาส `1` เลย",
      "`rank_models_by_pr_auc` ใช้ `average_precision_score` กับ `y_prob` โดยตรง (ไม่ใช่ 0/1) และเรียงลำดับคงที่",
      "`find_min_threshold_for_recall` เลือก threshold ที่ได้ Precision สูงสุดภายใต้เงื่อนไข Recall ขั้นต่ำ และคืน `None` เมื่อไม่มีค่าใดผ่าน",
      "รัน `uv run pytest -q` ผ่านทั้ง 4 เทสต์โดยไม่มี `UndefinedMetricWarning`",
      "รัน `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อใน `test_day45.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "แปลง `y_true` และ `y_prob` เป็น `np.asarray(...)` ก่อนเช็ก `len == 0` หรือความยาวไม่เท่ากัน และส่ง `labels=[0, 1]` เข้า `confusion_matrix` เสมอเพื่อไม่ให้ `.ravel()` พังเมื่อคลาสไม่ครบ",
      },
      {
        body: "ใน `find_min_threshold_for_recall` ให้เก็บรายการผู้สมัครที่ผ่าน `res['recall'] >= min_recall` เป็น tuple `(res['precision'], th)` แล้วใช้ `max(candidates)` — Python จะเปรียบเทียบ `precision` ก่อนแล้วค่อยใช้ `th` ที่สูงกว่าตัดสินเมื่อเสมอกันพอดี!",
      },
      {
        body: "โครงของ `evaluate_at_threshold` และ `rank_models_by_pr_auc` พร้อมแล้ว เหลือเติมเงื่อนไขเลือกผู้ชนะใน `find_min_threshold_for_recall`:",
        code: {
          language: "python",
          filename: "hint_day45.py",
          code: `def evaluate_at_threshold(
    y_true: list[int] | np.ndarray,
    y_prob: list[float] | np.ndarray,
    threshold: float = 0.5,
) -> dict[str, float | int]:
    yt = np.asarray(y_true, dtype=int)
    yp = np.asarray(y_prob, dtype=float)
    if yt.size == 0 or yt.shape != yp.shape or not (0.0 <= threshold <= 1.0):
        raise ValueError("Invalid y_true, y_prob, or threshold")
    y_pred = (yp >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(yt, y_pred, labels=[0, 1]).ravel()
    return {
        "tp": int(tp),
        "fp": int(fp),
        "fn": int(fn),
        "tn": int(tn),
        "precision": float(precision_score(yt, y_pred, zero_division=0)),
        "recall": float(recall_score(yt, y_pred, zero_division=0)),
        "f1": float(f1_score(yt, y_pred, zero_division=0)),
        "accuracy": float(accuracy_score(yt, y_pred)),
    }


def find_min_threshold_for_recall(
    y_true: list[int] | np.ndarray,
    y_prob: list[float] | np.ndarray,
    min_recall: float,
    grid: list[float] | None = None,
) -> float | None:
    thresholds = grid if grid is not None else [round(float(x), 2) for x in np.linspace(0.1, 0.9, 17)]
    candidates: list[tuple[float, float]] = []
    for th in thresholds:
        metrics = evaluate_at_threshold(y_true, y_prob, threshold=th)
        if metrics["recall"] >= min_recall:
            candidates.append((float(metrics["precision"]), float(th)))
    # TODO: ถ้า candidates ว่างคืน None ไม่อย่างนั้นคืน max(candidates)[1]
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
      title: "วัดผลข้อมูล Imbalanced ด้วย Accuracy หรือ ROC-AUC เพียงตัวเดียว",
      symptom: "รายงานว่าโมเดลได้ Accuracy 98% หรือ ROC-AUC 0.94 แต่พอขึ้น Production จับเคสทุจริตแทบไม่ได้หรือเตือนเก้อเต็มหน้าจอทีมงาน",
      fix: "ดู Confusion Matrix, Precision, Recall, F1 และใช้ PR-AUC (`average_precision_score`) เป็นตัวชี้วัดหลักเสมอเมื่อคลาสเป้าหมายมีน้อยกว่า ~15%",
    },
    {
      title: "ส่ง y_pred (0/1) เข้า average_precision_score แทน y_prob",
      symptom: "ค่า PR-AUC ออกมาต่ำผิดปกติและเปลี่ยนไม่ได้เมื่อลองปรับสเกลความน่าจะเป็น",
      fix: "ดึงความน่าจะเป็นของคลาส `1` ด้วย `model.predict_proba(X_val)[:, 1]` แล้วส่งเข้า `average_precision_score(y_val, y_prob)` เสมอ",
    },
    {
      title: "ลืมใส่ labels=[0, 1] ใน confusion_matrix",
      symptom: "เกิด `ValueError: not enough values to unpack (expected 4, got 1)` เมื่อชุดข้อมูลย่อยหรือ threshold สูงมีแค่คลาสเดียว",
      fix: "ระบุ `confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()` ทุกครั้งเพื่อให้ได้เมทริกซ์ 2×2 ครบทั้ง 4 ค่าเสมอ",
    },
    {
      title: "ลืม zero_division=0 ใน precision_score / f1_score",
      symptom: "เมื่อขยับ threshold สูงจนไม่มีการทำนายคลาส `1` เลย เกิด `UndefinedMetricWarning` เต็ม log หรือ CI ล้มเหลว",
      fix: "ใส่ `zero_division=0` ใน `precision_score`, `recall_score` และ `f1_score` ทุกครั้งที่ประเมินหลาย threshold",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d045-q1",
        "ชุดข้อมูลธุรกรรมมีเคสทุจริต (fraud = 1) เพียง 1% อีก 99% เป็นปกติ โมเดลหนึ่งทายว่า 'ปกติ' ทุกธุรกรรม ผลลัพธ์ข้อใดถูกต้อง?",
        [
          ["Accuracy = 99%, Recall = 99%, Precision = 99%", "ผิด — โมเดลจับทุจริตไม่ได้เลย (TP = 0) ดังนั้น Recall และ Precision ต้องเป็น 0%"],
          ["Accuracy = 99%, แต่ TP = 0 ทำให้ Recall = 0% และ Precision = 0% (เมื่อตั้ง zero_division=0)", "ถูก — นี่คือ Accuracy Paradox คลาสใหญ่ 99% กลบความล้มเหลวบนคลาสเป้าหมายจนหมด"],
          ["Accuracy = 1%, Recall = 100%", "สลับกัน — ทาย 0 ทุกใบจะทายถูก 99% บนคลาสปกติ แต่พลาดคลาสทุจริตทั้งหมด"],
          ["PR-AUC = 0.99 เพราะทายถูกเกือบทั้งหมด", "ผิด — โมเดลที่แยกคลาสไม่ได้เลยจะได้ PR-AUC ใกล้สัดส่วนคลาสเป้าหมาย (~0.01)"],
        ],
        "B",
        "เมื่อข้อมูลไม่สมดุล 99:1 การทายคลาสส่วนใหญ่ทุกเคสจะได้ Accuracy 99% ทันที แต่จับเคสเป้าหมายไม่ได้เลย (TP=0, Recall=0)",
        "Accuracy Paradox คืออะไร? ยกตัวอย่างสั้น ๆ",
        "คือภาวะที่ข้อมูลไม่สมดุลหนัก (เช่น คลาสเป้าหมาย 1–2%) ทำให้โมเดลที่ทายคลาสส่วนใหญ่ตลอดได้ Accuracy 98–99% ทั้งที่จับคลาสเป้าหมายไม่ได้เลย (Recall = 0%)",
      ),
      mc(
        "d045-q2",
        "ระบบคัดกรองทิกเก็ต VIP ด่วนของทีมซัพพอร์ตพบว่า **หากปล่อยเคสด่วนหลุด (FN) จะโดนปรับ SLA หนักมาก** แต่หากเตือนเก้อ (FP) พนักงานแค่กดปิดใช้เวลา 20 วินาที เราควรปรับ threshold และโฟกัสตัวชี้วัดใด?",
        [
          ["เพิ่ม threshold ให้สูงขึ้น (เช่น 0.85) เพื่อดัน Precision เป็นหลัก", "ผิด — threshold สูงจะทำให้เคสด่วนหลุด (FN) เพิ่มขึ้นมาก"],
          ["ลด threshold ลง (เช่น 0.25–0.35) เพื่อดัน **Recall** ให้สูง โดยคุม Precision ให้อยู่ในระดับที่ทีมรับไหว", "ถูก — ลด threshold ช่วยลด FN ทำให้เก็บเคสด่วนได้ครบขึ้น แลกกับ FP ที่เพิ่มขึ้นในระดับยอมรับได้"],
          ["ใช้ threshold 0.50 คงที่เสมอเพราะเป็นมาตรฐานของ scikit-learn", "ผิด — ค่า 0.50 ไม่ได้คำนึงถึงต้นทุนที่ไม่เท่ากันระหว่าง FP และ FN"],
          ["วัดเฉพาะ Accuracy เพื่อลดทั้ง FP และ FN พร้อมกัน", "ผิด — Accuracy ไม่แยกน้ำหนักระหว่าง FP กับ FN และหลอกตาเมื่อข้อมูลไม่สมดุล"],
        ],
        "B",
        "เมื่อต้นทุนของ FN สูงกว่า FP มาก การลด probability threshold จะช่วยดึงเคสที่อาจด่วนเข้ามาตรวจมากขึ้น ทำให้ Recall พุ่งสูงขึ้น",
        "เมื่อ FN เสียหายหนักกว่า FP มาก ควรขยับ threshold ขึ้นหรือลง และเน้นตัวชี้วัดใด?",
        "ลด threshold ลง เพื่อเพิ่ม Recall (ลดโอกาสปล่อยเคสสำคัญหลุด/FN) โดยคุม Precision ไม่ให้ต่ำจนทีมรับภาระ FP ไม่ไหว",
      ),
      mc(
        "d045-q3",
        "เหตุใด **PR-AUC (`average_precision_score`)** จึงเหมาะกับการเปรียบเทียบโมเดลบนข้อมูลไม่สมดุลมากกว่า **ROC-AUC**?",
        [
          ["เพราะ PR-AUC คำนวณได้จากผลทำนาย 0/1 โดยไม่ต้องใช้ความน่าจะเป็น", "ผิด — ทั้ง PR-AUC และ ROC-AUC ต้องใช้คะแนนความน่าจะเป็นต่อเนื่อง (`y_prob`)"],
          ["เพราะ ROC-AUC ใช้ False Positive Rate ที่มี `TN` เป็นตัวหาร เมื่อ TN มีมหาศาลค่า ROC-AUC จะดูสูงหลอกตาแม้มี FP จำนวนมาก ส่วน PR-AUC ไม่ใช้ TN เลย", "ถูก — PR-AUC โฟกัสเฉพาะ `TP`, `FP`, `FN` จึงสะท้อนปัญหาการเตือนเก้อบนคลาสหายากได้ชัดเจนกว่า"],
          ["เพราะ ROC-AUC ใช้ได้เฉพาะกับงาน Regression เท่านั้น", "ผิด — ROC-AUC เป็นตัวชี้วัดของงาน Classification"],
          ["เพราะ PR-AUC ให้ค่าเท่ากับ Accuracy เสมอ", "ผิด — PR-AUC วัดพื้นที่ใต้กราฟ Precision–Recall ข้ามทุก threshold ไม่ใช่ Accuracy"],
        ],
        "B",
        "เมื่อคลาส Negative มี 98%–99% ตัวหาร `FP + TN` ใน ROC จะใหญ่มากจนกลบความผิดพลาดแบบ FP ไปหมด ขณะที่ Precision ใช้ `TP + FP` จึงเห็นปัญหาทันที",
        "ทำไม PR-AUC จึงน่าเชื่อถือกว่า ROC-AUC เมื่อข้อมูลมีคลาสเป้าหมายหายาก (เช่น 1–2%)?",
        "เพราะ PR-AUC ไม่ใช้ TN ในสูตร จึงไม่ถูกคลาส Negative จำนวนมหาศาลมากลบความผิดพลาดแบบ FP เหมือนในแกน FPR ของ ROC-AUC",
      ),
      mc(
        "d045-q4",
        "โมเดลหนึ่งทำนายชุด Validation แล้วได้ `TP = 8, FP = 2, FN = 12, TN = 178` ค่า **Precision** และ **Recall** ของโมเดลนี้คือข้อใด?",
        [
          ["Precision = 8/20 (40%), Recall = 8/10 (80%)", "สลับสูตรกัน — Precision หารด้วย TP+FP (=10) ส่วน Recall หารด้วย TP+FN (=20)"],
          ["Precision = 8/10 (80%), Recall = 8/20 (40%)", "ถูก — ทายว่าใช่ 10 เคส ถูกจริง 8 เคส (Precision 80%) แต่จากของจริงทั้งหมด 20 เคส จับได้แค่ 8 เคส (Recall 40%)"],
          ["Precision = 186/200 (93%), Recall = 8/200 (4%)", "186/200 คือ Accuracy ไม่ใช่ Precision"],
          ["Precision = 8/178 (4.5%), Recall = 2/12 (16.7%)", "ผิดสูตร — ไม่ได้เอา TN มาหารใน Precision"],
        ],
        "B",
        "Precision = TP / (TP + FP) = 8 / (8 + 2) = 0.80 และ Recall = TP / (TP + FN) = 8 / (8 + 12) = 0.40 (แม้ Accuracy จะสูงถึง 93% แต่โมเดลปล่อยหลุดถึง 60% ของเคสจริง!)",
        "จาก TP, FP, FN เขียนสูตร Precision, Recall และ F1-Score ได้อย่างไร?",
        "Precision = TP/(TP+FP), Recall = TP/(TP+FN), และ F1 = 2 * (Precision * Recall) / (Precision + Recall)",
      ),
    ],
  },

  takeaways: [
    "อย่าดูแค่ **Accuracy** กับข้อมูลไม่สมดุล — กาง **Confusion Matrix (`TP, FP, FN, TN`)** เพื่อแยกต้นทุนของการเตือนเก้อ (`FP`) กับการปล่อยหลุด (`FN`) เสมอ",
    "**Precision** วัดความแม่นเวลาโมเดลทายว่าใช่ (`TP/(TP+FP)`), **Recall** วัดการเก็บตกของจริง (`TP/(TP+FN)`), และ **F1** คือค่าเฉลี่ยฮาร์มอนิกที่ลงโทษหากฝั่งใดฝั่งหนึ่งต่ำเกินไป",
    "ใช้ **PR-AUC (`average_precision_score(y_true, y_prob)`)** เป็นเกณฑ์เปรียบเทียบโมเดลข้ามทุก threshold บนข้อมูลไม่สมดุล โดยส่งความน่าจะเป็น `y_prob` ไม่ใช่ค่า 0/1",
    "เก็บ `predict_proba` ไว้ปรับ threshold ให้ตรงความเสี่ยงธุรกิจ แทนที่จะยอมรับค่าเริ่มต้น `0.50` ของ `.predict()` แบบหลับตา",
  ],

  reviewCards: [
    rc(
      "d045-rc-1",
      "สรุปความต่างระหว่าง Precision, Recall และเหตุผลที่ F1 ใช้ Harmonic Mean แทนค่าเฉลี่ยปกติ?",
      "Precision = TP/(TP+FP) วัดความแม่นในสิ่งที่ทายว่าใช่; Recall = TP/(TP+FN) วัดว่าจับของจริงได้ครบกี่%; F1 ใช้ Harmonic Mean เพราะจะต่ำทันทีถ้าตัวใดตัวหนึ่งแย่ ไม่ให้ค่าอีกตัวมากลบ",
    ),
    rc(
      "d045-rc-2",
      "เมื่อเทียบโมเดล 2 ตัวบนข้อมูล Fraud ที่มีคลาสเป้าหมาย 2% ทำไมควรดู PR-AUC แทน ROC-AUC และต้องส่งค่าอะไรเข้าฟังก์ชัน?",
      "เพราะ PR-AUC ไม่ใช้ TN ในสูตรจึงไม่ถูกคลาสปกติ 98% มากลบจำนวน FP และต้องส่งความน่าจะเป็น `y_prob` (จาก `predict_proba[:, 1]`) เข้า `average_precision_score` ไม่ใช่ 0/1",
    ),
    rc(
      "d045-rc-3",
      "การลด Probability Threshold จาก 0.50 ลงเป็น 0.25 มักส่งผลต่อ FP, FN, Precision และ Recall อย่างไร?",
      "โมเดลทาย `1` มากขึ้น → FN ลดลง (Recall เพิ่มขึ้น) แต่ FP มักเพิ่มขึ้น (Precision มักลดลง)",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Classification Metrics (Precision, Recall, F-measures)", href: "https://scikit-learn.org/stable/modules/model_evaluation.html#precision-recall-and-f-measures" },
    { label: "scikit-learn API Reference — average_precision_score (PR-AUC)", href: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html" },
    { label: "scikit-learn User Guide — Tuning the decision threshold for class prediction", href: "https://scikit-learn.org/stable/modules/classification_threshold.html" },
  ],

  glossary: [
    "precision-recall",
    "expected-value",
    "data-leakage",
    "sklearn-pipeline",
    "lightgbm",
    "pytest",
    "uv",
  ],
});
