import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D048 — Phase 2 / Block B12 (Review Day)
 * Interleaved recall of D45–D47 + D39 + Tune threshold for business cost (FP vs FN).
 */
export const d048: Lesson = defineLesson({
  day: 48,
  titleTh: "ทบทวน B12: หา Threshold ที่ลดต้นทุนธุรกิจต่ำสุด (FP vs FN Cost Matrix)",
  tagline: "30 นาที · รอบทบทวน D45–D47 + D39 · รันบน CPU 100% · จูน Threshold บน Val Set ตามต้นทุน SLA จริงแล้วพิสูจน์บน Test Set",
  icon: "sliders-horizontal",
  visual: {
    id: "precision-recall-thresh",
    title: "ทบทวน B12: หา Threshold ที่ลดต้นทุนธุรกิจต่ำสุด (FP vs FN Cost Matrix)",
    caption: "ประเมิน `predict_proba` บน validation set เพื่อเลือก threshold ที่คุ้มทุนที่สุดแทนค่าเริ่มต้น 0.50",
    alt: "แผนภาพการจูน threshold ตามต้นทุนธุรกิจ",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "LightGBM", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "แปลความผิดพลาดของโมเดลเป็นต้นทุนบาทจริง",
      body: "ทีมธุรกิจไม่ได้ถามว่า 'F1 ได้ 0.72 ดีไหม?' แต่ถามว่า 'ถ้าเปิดใช้โมเดลนี้เดือนหน้า เราจะประหยัดค่าปรับ SLA และค่าแรงทีมซัพพอร์ตได้กี่บาท?'",
      lessonNote: "วันนี้เราเชื่อม {{expected-value}} (Day 39) เข้ากับ {{precision-recall}} (Day 45) เพื่อตั้งเกณฑ์ตัดสินใจด้วยหน่วยเงินจริง",
    },
    {
      node: 2,
      heading: "แยกขั้นตอน 'เทรนโมเดล' ออกจาก 'การตัดสินใจ (Decision Policy)'",
      body: "โมเดล {{lightgbm}} (Day 47) มีหน้าที่สร้างความน่าจะเป็น `y_prob` ที่จัดอันดับเคสได้ดีที่สุด (PR-AUC สูง) ส่วนนโยบายธุรกิจ (threshold) มีหน้าที่เปลี่ยน `y_prob` เป็นการกระทำตามต้นทุน FP vs FN",
      lessonNote: "เมื่อนโยบายค่าปรับ SLA เปลี่ยนในอนาคต เราปรับแค่ `threshold` บน Validation set ได้ทันทีโดยไม่ต้องรื้อเทรนโมเดลใหม่ทั้งหมด",
    },
    {
      node: 3,
      heading: "จูน Threshold บน Val Set เท่านั้น แล้วพิสูจน์บน Test Set",
      body: "การลองปรับ threshold จนได้ต้นทุนต่ำสุดบนชุด Test คือ {{data-leakage}} รูปแบบหนึ่งที่พบบ่อยมากในทีม ML มือใหม่ — ตัวเลขประหยัดเงินที่รายงานจะสวยเกินความจริง",
      lessonNote: "เราล็อก `best_threshold` จากชุด Validation แล้วนำไปเทียบต้นทุนกับค่าเริ่มต้น `0.50` บนชุด Test ที่ไม่เคยแตะเพียงครั้งเดียว",
    },
    {
      node: 5,
      heading: "ทบทวนตัวชี้วัดทั้งงาน Classification และ Regression",
      body: "ระบบซัพพอร์ตจริงมักมีทั้งตัวคัดเคสด่วน (Classification + Cost Threshold) และตัวประมาณเวลาปิดงาน (Regression + {{mae-rmse|MAE/RMSE}} & Residual Analysis จาก Day 46)",
      lessonNote: "รอบทบทวนนี้ย้ำทั้งสองแกนผ่าน Interleaved Quiz และมินิแล็บจูน Threshold แบบครบวงจร",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบสลับหัวข้อ (Interleaved Recall)** จาก D45 (Precision/Recall/PR-AUC), D46 (MAE/RMSE & Residuals), D47 (LightGBM + Early Stopping) และ D39 ({{expected-value}})",
    "**คำนวณต้นทุนธุรกิจรวมจาก Cost Matrix** (`total_cost = fp * cost_fp + fn * cost_fn`) และเขียนตัวค้นหา `best_threshold` จาก `y_prob` บนชุด Validation",
    "**ปฏิบัติตามกติกาปลอด {{data-leakage}}**: เลือก `best_threshold` บน Validation Set เท่านั้น แล้วล็อกไปพิสูจน์การประหยัดต้นทุนเทียบกับ `0.50` บน Test Set ที่ไม่เคยแตะ",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D39 ({{expected-value}}), D45 (Classification Metrics), D46 (Regression Metrics) และ D47 ({{lightgbm}})",
    "มี `scikit-learn`, `lightgbm`, `numpy`, `pytest` และ `ruff` ในสภาพแวดล้อม `uv`",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งานทบทวน Day 48 ด้วย `uv` (หรือใช้โปรเจกต์เดิมจาก Day 47) แล้วตรวจว่า {{sklearn-pipeline|scikit-learn}}, `lightgbm` และ {{pytest}} พร้อมรัน",
    commands: `uv init ai-day48-review && cd ai-day48-review
uv add scikit-learn lightgbm numpy
uv add --dev pytest ruff
uv run python -c "import lightgbm, sklearn, numpy; print('B12 Review Ready!')"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์โปรเจกต์รอบทบทวน Day 48"],
      ["deps", "ติดตั้ง `scikit-learn`, `lightgbm`, `numpy`, `pytest`, `ruff` ครบถ้วน"],
      ["verify", "รันคำสั่งทดสอบแล้วเห็น `B12 Review Ready!`"],
    ],
    note: "รอบทบทวน Day 48 จัดเวลาตามจังหวะ 30 นาที: ทำควิซทบทวน 4 ข้อแรก (10 นาที) → ลงมือเขียนและเทสต์ Threshold Optimizer (15 นาที) → สรุป Error Log และการ์ดทบทวน (5 นาที)",
  },

  concepts: [
    {
      id: "review-b12-interleaving",
      title: "1 · ร้อยต่อจิ๊กซอว์ B12 (D45–D47) + Expected Value (D39)",
      paragraphs: [
        "สามวันที่ผ่านมาใน Block B12 เราได้ครบทั้ง 3 ชิ้นส่วนหลักของ Classical ML Evaluation & Modeling: **Day 45** สอนวิธีวัดงานจำแนกข้อมูลไม่สมดุลด้วย Confusion Matrix และ PR-AUC, **Day 46** สอนวิธีจับ outlier และ systematic bias ในงานทำนายตัวเลขด้วย {{mae-rmse|MAE/RMSE}} และ Residual slicing, และ **Day 47** สอนการเทรน {{lightgbm}} พร้อม early stopping บนชุด Validation",
        "วันนี้เรานำชิ้นส่วนสุดท้ายจาก **Day 39 ({{expected-value}})** มาประกอบเข้าด้วยกัน: แทนที่จะหยุดแค่ค่า PR-AUC หรือ F1 เราแปลงผลทำนายความน่าจะเป็น `y_prob` ให้กลายเป็นการตัดสินใจที่ **ลดความสูญเสียเป็นตัวเงินจริง (baht)** ได้ต่ำที่สุด",
      ],
      analogy:
        "เหมือนทีมวิศวกรสร้างรถแข่ง: LightGBM คือเครื่องยนต์ (D47), PR-AUC กับ MAE/RMSE คือหน้าปัดวัดสมรรถนะ (D45–D46), ส่วน Cost-Optimal Threshold คือจังหวะเปลี่ยนเกียร์ที่ทำให้เข้าเส้นชัยประหยัดน้ำมันที่สุด (D48)",
      bullets: [
        "**D45 (Imbalanced Classification)** — เลือกโมเดลด้วย PR-AUC (`average_precision_score`) บน `y_prob` ไม่ใช่ Accuracy",
        "**D46 (Regression & Residuals)** — ดู MAE คู่ RMSE จับ outlier แล้วผ่า `y_true - y_pred` รายกลุ่มเพื่อหาอคติซ่อนเร้น",
        "**D47 (LightGBM)** — เทรนต้นไม้แก้ residual ทีละต้น คุมด้วย `num_leaves`, `min_child_samples` และ `early_stopping` บน Val",
        "**D39 + D48 (Business Cost Threshold)** — แปลง `y_prob` เป็นการตัดสินใจ 0/1 ที่ต้นทุน `FP * cost_fp + FN * cost_fn` ต่ำสุด",
      ],
      whyTitle: "Why this matters — ภาษาที่ผู้บริหารและทีมโปรดักต์เข้าใจทันที",
      whyParagraphs: [
        "เวลาคุณนำเสนอผลงาน ML ในบริษัทหรือตอนสัมภาษณ์งาน ประโยคว่า *\"จูน threshold บน Val set จาก 0.50 เป็น 0.25 ทำให้ต้นทุน SLA ผิดพลาดบน Test set ลดลง 62%\"* มีน้ำหนักกว่าการพูดว่า *\"F1 เพิ่มจาก 0.67 เป็น 0.75\"* อย่างเทียบไม่ติด",
        "แนวคิดนี้ยังใช้ได้ตรง ๆ กับการตั้ง confidence threshold ของระบบ LLM Routing และ Guardrails ใน Phase 3–5 ด้วย",
      ],
    },
    {
      id: "asymmetric-cost-matrix",
      title: "2 · Asymmetric Cost Matrix: ทำไม Threshold 0.50 แทบไม่เคยคุ้มทุนที่สุด",
      paragraphs: [
        "ลองดูโจทย์จริงของทีมซัพพอร์ต e-commerce ไทย: ถ้าโมเดลส่งทิกเก็ตปกติไปให้ทีม VIP ตรวจเก้อ (**False Positive: FP**) เสียเวลาพนักงานคิดเป็นต้นทุน **100 บาท/ใบ** แต่ถ้าปล่อยทิกเก็ต VIP ด่วนหลุดคิว (**False Negative: FN**) จนเกิน SLA และลูกค้ายกเลิกสมาชิก คิดเป็นความเสียหาย **1,000 บาท/ใบ** (อัตราส่วน 10 ต่อ 1!)",
        "หากใช้หลัก {{expected-value}} จาก Day 39 เมื่อความน่าจะเป็นของทิกเก็ตใบหนึ่งคือ `p`: ต้นทุนคาดหวังของการ **ส่งด่วน (ทาย 1)** คือ `(1 - p) * 100` (โอกาสทายเก้อ × ค่าตรวจ), ส่วนต้นทุนคาดหวังของการ **ปล่อยปกติ (ทาย 0)** คือ `p * 1000` (โอกาสด่วนจริง × ค่าปรับ SLA) จุดคุ้มทุนทางทฤษฎีที่ควรเริ่มส่งด่วนคือ `t* = cost_fp / (cost_fp + cost_fn) = 100 / 1100 ≈ 0.091` — ห่างจาก `0.50` ลิบลับ!",
        "ในทางปฏิบัติ ความน่าจะเป็นดิบของโมเดล (โดยเฉพาะเมื่อใช้ `class_weight=\"balanced\"` ใน LightGBM) อาจไม่ได้ calibrate เป๊ะตามความน่าจะเป็นจริง เราจึงใช้วิธี **Empirical Threshold Sweep**: กวาดค่า threshold หลาย ๆ จุดบนชุด Validation แล้วคำนวณ `total_cost = fp * cost_fp + fn * cost_fn` เพื่อหาจุดต่ำสุดจริงของโมเดลนั้น",
      ],
      analogy:
        "เหมือนการพกร่มออกจากบ้าน: ถ้าเปียกฝนแล้วเป็นไข้เสียงาน 1,000 บาท (FN) แต่พกร่มเก้อแค่หนักกระเป๋านิดหน่อยเทียบเป็น 100 บาท (FP) คุณจะเริ่มพกร่มตั้งแต่พยากรณ์อากาศบอกว่าโอกาสฝนตกแค่ 15–25% ไม่ใช่รอให้เกิน 50% แน่นอน",
      code: {
        language: "python",
        filename: "cost_matrix_formula.py",
        code: `import numpy as np
from sklearn.metrics import confusion_matrix


def expected_business_cost(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    threshold: float,
    cost_fp: float = 100.0,
    cost_fn: float = 1000.0,
) -> float:
    y_pred = (y_prob >= threshold).astype(int)
    _, fp, fn, _ = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return float(fp * cost_fp + fn * cost_fn)`,
        caption: "สูตรต้นทุนธุรกิจสั้นเพียง 4 บรรทัด แต่เปลี่ยนวิธีตัดสินใจของโมเดลทั้งระบบให้ตรงเป้าหมายองค์กร",
      },
      whyTitle: "Why this matters — `class_weight='balanced'` เปลี่ยนสเกลความน่าจะเป็น",
      whyParagraphs: [
        "ข้อควรรู้สำคัญจาก Day 47: เมื่อเปิด `class_weight=\"balanced\"` โมเดลจะดันค่า `predict_proba` ของคลาสเป้าหมายให้สูงกว่าสัดส่วนจริงในธรรมชาติ ดังนั้นสูตรทฤษฎี `cost_fp / (cost_fp + cost_fn)` จึงใช้เป็นแนวคิดตั้งต้น แต่การทำ **Empirical Sweep บนชุด Validation** จะจับจุดที่ต้นทุนต่ำสุดจริงได้แม่นยำกว่ามาก",
      ],
    },
    {
      id: "val-only-tuning-test-verify",
      title: "3 · กฎเหล็กการจูน Threshold: เลือกบน Val เท่านั้น แล้วล็อกไปวัดบน Test",
      paragraphs: [
        "ความผิดพลาดที่พบบ่อยที่สุดเวลาทำ Threshold Optimization คือเอา `y_test` กับ `p_test` มากวาดหาค่า threshold ที่ต้นทุนต่ำสุดแล้วเอาตัวเลขนั้นไปรายงาน — การทำแบบนั้นคือ **{{data-leakage}}** เพราะคุณกำลังแอบเลือก threshold ให้เข้ากับความบังเอิญของชุด Test โดยเฉพาะ",
        "กติกาการทดลองที่สะอาด 100% ต้องมี 3 ขั้นแยกขาดจากกัน: (1) เทรนโมเดลบน **Train** (พร้อม early stopping บน Val), (2) กวาดหา `best_threshold` ที่ลดต้นทุนต่ำสุดบน **Val** เท่านั้น, และ (3) นำ `(model, best_threshold)` ที่ล็อกไว้ไปวัดต้นทุนบน **Test** เพียงครั้งเดียวเทียบกับค่าเริ่มต้น `0.50` เพื่อพิสูจน์ว่าการประหยัดเงินเกิดขึ้นจริงบนข้อมูลใหม่",
      ],
      analogy:
        "เหมือนการตั้งระดับไฟเตาอบ: ลองปรับไฟจนได้เค้กอร่อยที่สุดในรอบซ้อม (Val) แล้วล็อกปุ่มอุณหภูมินั้นไปอบส่งเข้าประกวดจริง (Test) ห้ามแอบชิมของกรรมการแล้วหมุนปุ่มแก้ทีหลัง",
      bullets: [
        "**Train Set** — เรียนรู้พารามิเตอร์ของโมเดล (weights / tree splits)",
        "**Validation Set** — ใช้กับ early stopping, เลือกโมเดลด้วย PR-AUC, และจูน `best_threshold` จาก Cost Matrix",
        "**Test Set** — แตะเพียงครั้งเดียวตอนจบ เพื่อวัดต้นทุนจริงของ `best_threshold` เทียบกับ `0.50`",
      ],
      whyTitle: "Why this matters — ป้องกันความคาดหวังพังหลังขึ้น Production",
      whyParagraphs: [
        "หากตัวเลขประหยัดต้นทุนบน Validation (เช่น ลด 75%) กับ Test (เช่น ลด 68%) ใกล้เคียงกัน นั่นเป็นสัญญาณว่า threshold ของคุณเสถียรและพร้อมขึ้นใช้งานจริง แต่ถ้าบน Val ลดได้ 80% แล้วบน Test กลับแย่กว่าเดิม แสดงว่า Val set เล็กเกินไปหรือเกิด Overfitting และควรใช้ Out-of-Fold {{cross-validation}} (Day 51) แทน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Cost-Optimal Threshold กับ Feature Flag & SLA Budget",
      body: [
        "มอง `best_threshold` เหมือนค่า config ตัวหนึ่งในระบบ production ที่แยกออกจากโค้ดโมเดลอย่างชัดเจน:",
      ],
      table: [
        ["`model.predict_proba(X)[:, 1]`", "Score API ที่คืนระดับความเสี่ยง 0.0–1.0"],
        ["`best_threshold` (เก็บใน config/env)", "นโยบายตัดสินใจที่ปรับได้ตามงบ SLA โดยไม่ต้องเทรนใหม่"],
        ["Val-only threshold sweep", "หาค่าตั้งต้นบน staging dataset ก่อนปล่อย"],
        ["Locked Test verification", "A/B check ว่าค่า config ใหม่ลดต้นทุนจริงเมื่อเจอ traffic ใหม่"],
      ],
    },
    student: {
      title: "First-Year Note — ถ้าราคาเท่ากันหลาย Threshold ควรเลือกตัวไหน?",
      body: [
        "เวลาเราสแกน threshold บนชุด Validation ขนาดเล็ก (เช่น 100–300 แถว) อาจมี 2–3 ค่าที่ได้ `total_cost` ต่ำสุดเท่ากันเป๊ะ เช่น `0.25` และ `0.30` ต่างก็ได้ต้นทุน 200 บาทเท่ากัน",
        "วิธีตัดสิน (tie-breaking) ที่นิยมและ deterministic คือเก็บ `(total_cost, -f1, -threshold)` หรือเลือกค่าที่ให้ F1 สูงกว่า (และถ้ายังเท่ากันเลือก threshold ที่อยู่กึ่งกลางหรือสูงกว่าเพื่อกันเตือนเก้อ) เพื่อให้ผลลัพธ์คงที่ทุกครั้งที่รันเทสต์",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ระบบคัดกรองทิกเก็ต VIP ด่วนกำหนดต้นทุน `cost_fp = 100` บาท (ส่งตรวจเก้อ) และ `cost_fn = 1,000` บาท (พลาดเคสด่วนหลุด SLA) มาลองรันวงจรเต็ม 3 ขั้น: สร้างฟังก์ชันคำนวณต้นทุน → กวาดหา `best_threshold` บนชุด Val → ล็อกค่าไปพิสูจน์บนชุด Test",
    steps: [
      {
        title: "1 · เขียนฟังก์ชันคำนวณต้นทุนธุรกิจและรายละเอียด Confusion Matrix",
        explain:
          "รับ `y_true`, `y_prob`, `threshold`, `cost_fp`, `cost_fn` แล้วคืนทั้งจำนวน `tp/fp/fn/tn`, `precision`, `recall` และ `total_cost` ในหน่วยบาท",
        code: {
          language: "python",
          filename: "worked_day48.py",
          code: `import numpy as np
from sklearn.metrics import confusion_matrix, precision_score, recall_score


def eval_cost(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    threshold: float,
    cost_fp: float = 100.0,
    cost_fn: float = 1000.0,
) -> dict[str, float | int]:
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    total_cost = float(fp * cost_fp + fn * cost_fn)
    return {
        "threshold": round(float(threshold), 3),
        "tp": int(tp),
        "fp": int(fp),
        "fn": int(fn),
        "tn": int(tn),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 3),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 3),
        "total_cost": total_cost,
    }`,
        },
        output: `# พร้อมคำนวณต้นทุนธุรกิจ ณ threshold ใด ๆ`,
      },
      {
        title: "2 · กวาดหา best_threshold บนชุด Validation เท่านั้น",
        explain:
          "ลองเทียบต้นทุนที่ threshold `0.10`, `0.25`, `0.50` บนชุด Validation (`y_val`, `p_val`) จะเห็นชัดว่าที่ `0.50` พลาดเคสด่วนไป 2 ใบโดนปรับหนักถึง 2,100 บาท ขณะที่ `0.25` เหลือเพียง 200 บาท",
        code: {
          language: "python",
          filename: "worked_day48.py",
          code: `y_val = np.array([1, 1, 1, 0, 0, 0, 0, 0, 0, 0])
p_val = np.array([0.85, 0.42, 0.25, 0.55, 0.30, 0.20, 0.15, 0.10, 0.05, 0.02])

grid = [round(float(x), 2) for x in np.linspace(0.05, 0.95, 19)]
results = [eval_cost(y_val, p_val, th) for th in grid]
best = min(results, key=lambda r: (r["total_cost"], -r["threshold"]))

for th in [0.10, 0.25, 0.50]:
    r = eval_cost(y_val, p_val, th)
    print(f"Val th={r['threshold']:.2f} | FP={r['fp']} FN={r['fn']} | Cost={r['total_cost']:,.0f} THB")
print(f"--> Locked best_threshold from Val: {best['threshold']:.2f} (Val Cost={best['total_cost']:,.0f} THB)")`,
        },
        output: `Val th=0.10 | FP=5 FN=0 | Cost=500 THB
Val th=0.25 | FP=2 FN=0 | Cost=200 THB
Val th=0.50 | FP=1 FN=2 | Cost=2,100 THB
--> Locked best_threshold from Val: 0.25 (Val Cost=200 THB)`,
      },
      {
        title: "3 · ล็อก threshold = 0.25 แล้วพิสูจน์บนชุด Test ที่ไม่เคยแตะ",
        explain:
          "นำค่า `best['threshold'] = 0.25` ที่ได้จาก Val มาวัดบน `y_test`, `p_test` เทียบกับค่าเริ่มต้น `0.50` เพื่อยืนยันผลประหยัดจริงโดยไม่เกิด Data Leakage",
        code: {
          language: "python",
          filename: "worked_day48.py",
          code: `y_test = np.array([1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
p_test = np.array([0.78, 0.31, 0.48, 0.28, 0.19, 0.14, 0.09, 0.06, 0.03, 0.01])

test_default = eval_cost(y_test, p_test, threshold=0.50)
test_tuned = eval_cost(y_test, p_test, threshold=float(best["threshold"]))
savings = test_default["total_cost"] - test_tuned["total_cost"]
savings_pct = (savings / test_default["total_cost"]) * 100

print(f"Test @ 0.50 (default): FP={test_default['fp']} FN={test_default['fn']} | Cost={test_default['total_cost']:,.0f} THB")
print(f"Test @ {best['threshold']:.2f} (tuned)  : FP={test_tuned['fp']} FN={test_tuned['fn']} | Cost={test_tuned['total_cost']:,.0f} THB")
print(f"Verified Savings     : {savings:,.0f} THB ({savings_pct:.1f}% reduction)")`,
        },
        output: `Test @ 0.50 (default): FP=0 FN=1 | Cost=1,000 THB
Test @ 0.25 (tuned)  : FP=2 FN=0 | Cost=200 THB
Verified Savings     : 800 THB (80.0% reduction)`,
      },
    ],
    gotcha:
      "จุดสังเกตสำคัญ: ถ้าเปลี่ยนต้นทุนสลับด้านกัน (เช่น `cost_fp = 1000`, `cost_fn = 100` สำหรับระบบแบนบัญชีอัตโนมัติ) โค้ดเดิมชุดนี้จะดัน `best_threshold` ขึ้นสูง (เช่น `0.60–0.85`) ให้เองอัตโนมัติโดยไม่ต้องแก้ logic ใด ๆ!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + Mini-Integration (15 นาที): สร้างโมดูล `threshold_optimizer.py` ที่คำนวณต้นทุนธุรกิจจาก Cost Matrix, จูน `best_threshold` บนชุด Validation เท่านั้น และสร้างรายงานเปรียบเทียบต้นทุนบนชุด Test ระหว่าง threshold ค่าเริ่มต้น `0.50` กับ threshold ที่จูนแล้ว",
    requirements: [
      "`evaluate_business_cost(y_true, y_prob, threshold: float, cost_fp: float, cost_fn: float) -> dict[str, float | int]`: ตรวจว่าอินพุตไม่ว่าง ความยาวเท่ากัน `0.0 <= threshold <= 1.0` และ `cost_fp >= 0`, `cost_fn >= 0` (ไม่งั้น `raise ValueError`) แล้วคืน dict ที่มีคีย์ `threshold`, `tp`, `fp`, `fn`, `tn`, `precision`, `recall`, `f1`, `total_cost`, `avg_cost` (`total_cost / n`)",
      "`find_optimal_threshold(y_val, p_val, cost_fp: float, cost_fn: float, grid: list[float] | None = None) -> dict[str, float | int]`: กวาดทุก threshold ใน `grid` (ค่าเริ่มต้น `[round(float(x), 2) for x in np.linspace(0.05, 0.95, 19)]`) แล้วคืนผลลัพธ์ของ threshold ที่ให้ `total_cost` ต่ำที่สุด (หาก `total_cost` เท่ากันให้เลือกตัวที่ `f1` สูงกว่า และถ้ายังเท่ากันเลือก `threshold` ที่สูงกว่า)",
      "`verify_threshold_on_test(y_val, p_val, y_test, p_test, cost_fp: float, cost_fn: float, grid: list[float] | None = None) -> dict[str, float]`: เรียก `find_optimal_threshold` บน `(y_val, p_val)` เท่านั้นเพื่อได้ `best_threshold`, จากนั้นประเมินทั้ง `0.50` และ `best_threshold` บน `(y_test, p_test)` แล้วคืน dict 5 คีย์: `best_threshold`, `val_best_cost`, `test_default_cost`, `test_tuned_cost`, `test_cost_saved` (`test_default_cost - test_tuned_cost`)",
      "ทดสอบ end-to-end ร่วมกับ `LGBMClassifier` บนชุดข้อมูลสังเคราะห์แบบไม่สมดุลในไฟล์เทสต์ โดยยืนยันว่าการจูนบน Val ช่วยลดต้นทุนบน Test ได้จริงเมื่อเทียบกับ `0.50`",
    ],
    starter: {
      language: "python",
      filename: "threshold_optimizer.py",
      code: `import numpy as np
from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score


def evaluate_business_cost(
    y_true: list[int] | np.ndarray,
    y_prob: list[float] | np.ndarray,
    threshold: float,
    cost_fp: float,
    cost_fn: float,
) -> dict[str, float | int]:
    """คำนวณ Confusion Matrix, metrics และต้นทุนธุรกิจรวม/เฉลี่ยต่อรายการ"""
    # TODO: ตรวจ input แล้วคำนวณ total_cost = fp * cost_fp + fn * cost_fn และ avg_cost
    raise NotImplementedError


def find_optimal_threshold(
    y_val: list[int] | np.ndarray,
    p_val: list[float] | np.ndarray,
    cost_fp: float,
    cost_fn: float,
    grid: list[float] | None = None,
) -> dict[str, float | int]:
    """เลือก threshold ที่ลดต้นทุนรวมบนชุด Validation ต่ำที่สุด (tie-break ด้วย F1 สูงสุด -> threshold สูงสุด)"""
    # TODO: กวาด grid แล้วคืน dict ของ threshold ที่ดีที่สุด
    raise NotImplementedError


def verify_threshold_on_test(
    y_val: list[int] | np.ndarray,
    p_val: list[float] | np.ndarray,
    y_test: list[int] | np.ndarray,
    p_test: list[float] | np.ndarray,
    cost_fp: float,
    cost_fn: float,
    grid: list[float] | None = None,
) -> dict[str, float]:
    """จูน threshold บน Val เท่านั้น แล้วเทียบต้นทุนกับ 0.50 บน Test ที่ไม่เคยแตะ"""
    # TODO: เรียก find_optimal_threshold บน val แล้วประเมิน 0.50 กับ best_threshold บน test
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day48.py",
      code: `import lightgbm as lgb
import numpy as np
import pytest
from sklearn.model_selection import train_test_split
from threshold_optimizer import (
    evaluate_business_cost,
    find_optimal_threshold,
    verify_threshold_on_test,
)


def test_asymmetric_fn_heavy_lowers_threshold():
    y_val = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
    p_val = [0.85, 0.42, 0.25, 0.55, 0.30, 0.20, 0.15, 0.10, 0.05, 0.02]
    y_test = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    p_test = [0.78, 0.31, 0.48, 0.28, 0.19, 0.14, 0.09, 0.06, 0.03, 0.01]

    report = verify_threshold_on_test(
        y_val, p_val, y_test, p_test, cost_fp=100.0, cost_fn=1000.0
    )
    assert report["best_threshold"] == pytest.approx(0.25)
    assert report["val_best_cost"] == pytest.approx(200.0)
    assert report["test_default_cost"] == pytest.approx(1000.0)
    assert report["test_tuned_cost"] == pytest.approx(200.0)
    assert report["test_cost_saved"] == pytest.approx(800.0)


def test_asymmetric_fp_heavy_raises_threshold():
    y_val = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
    p_val = [0.90, 0.72, 0.35, 0.65, 0.45, 0.30, 0.20, 0.10, 0.05, 0.02]

    # FP แพงกว่า FN 10 เท่า (เช่น แบนบัญชีอัตโนมัติ) -> ต้องดัน threshold สูงกว่า 0.65 เพื่อกัน FP
    best = find_optimal_threshold(y_val, p_val, cost_fp=1000.0, cost_fn=100.0)
    assert best["threshold"] >= 0.70
    assert best["fp"] == 0
    assert best["total_cost"] == pytest.approx(100.0)


def test_input_validation_errors():
    with pytest.raises(ValueError):
        evaluate_business_cost([], [], threshold=0.5, cost_fp=100, cost_fn=1000)
    with pytest.raises(ValueError):
        evaluate_business_cost([1, 0], [0.8, 0.2], threshold=0.5, cost_fp=-10, cost_fn=100)
    with pytest.raises(ValueError):
        evaluate_business_cost([1, 0], [0.8, 0.2], threshold=1.5, cost_fp=100, cost_fn=100)


def test_end_to_end_lightgbm_val_tune_test_verify():
    rng = np.random.default_rng(123)
    n = 1500
    wait_min = rng.exponential(20.0, size=n)
    is_vip = rng.binomial(1, 0.2, size=n).astype(float)
    prior = rng.poisson(1.5, size=n).astype(float)
    logit = -3.0 + 0.06 * wait_min + 1.4 * is_vip + 0.45 * prior
    probs_true = 1.0 / (1.0 + np.exp(-logit))
    y = rng.binomial(1, probs_true)
    X = np.column_stack([wait_min, is_vip, prior])

    X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, stratify=y_temp, random_state=42)

    # เทรน LightGBM แบบไม่ใช้ class_weight เพื่อให้ความน่าจะเป็นใกล้ความเป็นจริง
    clf = lgb.LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=15,
        random_state=42,
        verbosity=-1,
    )
    clf.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        eval_metric="average_precision",
        callbacks=[lgb.early_stopping(20, verbose=False)],
    )

    p_val = clf.predict_proba(X_val)[:, 1]
    p_test = clf.predict_proba(X_test)[:, 1]

    report = verify_threshold_on_test(
        y_val, p_val, y_test, p_test, cost_fp=100.0, cost_fn=1000.0
    )
    assert report["best_threshold"] < 0.40
    assert report["test_tuned_cost"] < report["test_default_cost"]
`,
    },
    selfCheck: [
      "เมื่อ `cost_fn = 1000, cost_fp = 100` ตัวจูนลด threshold ลงต่ำกว่า `0.40` และลดต้นทุนบน Test set ได้ชัดเจน",
      "เมื่อสลับข้างเป็น `cost_fp = 1000, cost_fn = 100` ตัวจูนดัน threshold ขึ้นสูงเพื่อกำจัด FP (`fp == 0`)",
      "`verify_threshold_on_test` ไม่เคยส่ง `y_test` หรือ `p_test` เข้า `find_optimal_threshold` เลย (ปลอด Data Leakage 100%)",
      "รันเทสต์ end-to-end ร่วมกับ `LGBMClassifier` + `early_stopping` ผ่านครบทั้ง 4 ข้อด้วย `uv run pytest -q` และ `uv run ruff check .`",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อใน `test_day48.py` (รวม LightGBM end-to-end) ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `evaluate_business_cost` ตรวจ `yt.size == 0`, `yt.shape != yp.shape`, `not (0.0 <= threshold <= 1.0)` และ `cost_fp < 0 or cost_fn < 0` ก่อนคำนวณ `confusion_matrix(..., labels=[0, 1])`",
      },
      {
        body: "ใน `find_optimal_threshold` ใช้ `min(candidates, key=lambda r: (r['total_cost'], -r['f1'], -r['threshold']))` เพื่อเลือกต้นทุนต่ำสุดก่อน แล้วค่อยตัดสินเมื่อเสมอกันด้วย F1 สูงสุดและ threshold สูงสุดตามลำดับ",
      },
      {
        body: "โครงของ `find_optimal_threshold` และ `verify_threshold_on_test` พร้อมแล้ว เหลือเติมส่วนคำนวณใน `evaluate_business_cost`:",
        code: {
          language: "python",
          filename: "hint_day48.py",
          code: `def find_optimal_threshold(
    y_val: list[int] | np.ndarray,
    p_val: list[float] | np.ndarray,
    cost_fp: float,
    cost_fn: float,
    grid: list[float] | None = None,
) -> dict[str, float | int]:
    thresholds = grid if grid is not None else [round(float(x), 2) for x in np.linspace(0.05, 0.95, 19)]
    if not thresholds:
        raise ValueError("grid must not be empty")
    evaluated = [
        evaluate_business_cost(y_val, p_val, th, cost_fp, cost_fn)
        for th in thresholds
    ]
    return min(
        evaluated,
        key=lambda r: (float(r["total_cost"]), -float(r["f1"]), -float(r["threshold"])),
    )


def verify_threshold_on_test(
    y_val: list[int] | np.ndarray,
    p_val: list[float] | np.ndarray,
    y_test: list[int] | np.ndarray,
    p_test: list[float] | np.ndarray,
    cost_fp: float,
    cost_fn: float,
    grid: list[float] | None = None,
) -> dict[str, float]:
    val_best = find_optimal_threshold(y_val, p_val, cost_fp, cost_fn, grid=grid)
    best_th = float(val_best["threshold"])
    test_default = evaluate_business_cost(y_test, p_test, 0.50, cost_fp, cost_fn)
    test_tuned = evaluate_business_cost(y_test, p_test, best_th, cost_fp, cost_fn)
    return {
        "best_threshold": best_th,
        "val_best_cost": float(val_best["total_cost"]),
        "test_default_cost": float(test_default["total_cost"]),
        "test_tuned_cost": float(test_tuned["total_cost"]),
        "test_cost_saved": float(test_default["total_cost"]) - float(test_tuned["total_cost"]),
    }`,
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
      title: "จูน Threshold บนชุด Test โดยตรงแล้วรายงานผลประหยัด",
      symptom: "ตัวเลขประหยัดต้นทุนบนรายงานสูงมาก แต่เมื่อเปิดรับข้อมูลจริงในสัปดาห์ถัดไปต้นทุนพุ่งเกินคาด",
      fix: "กวาดหา `best_threshold` บน **Validation Set เท่านั้น** แล้วล็อกค่าไปประเมินบน Test Set เพียงครั้งเดียวเพื่อป้องกัน {{data-leakage}}",
    },
    {
      title: "ใช้สูตรทฤษฎี `cost_fp / (cost_fp + cost_fn)` โดยไม่เช็กว่าความน่าจะเป็น calibrate หรือไม่",
      symptom: "เทรน LightGBM ด้วย `class_weight=\"balanced\"` แล้วเอา threshold 0.09 ไปใช้ตรง ๆ ทำให้โมเดลเตือนเก้อเกือบทุกใบ",
      fix: "เมื่อใช้ `class_weight=\"balanced\"` สเกล `predict_proba` จะถูกยกสูงขึ้น — ให้ทำ **Empirical Threshold Sweep** บน Validation Set เสมอ (หรือ calibrate ความน่าจะเป็นก่อน)",
    },
    {
      title: "ลืมตรวจสอบว่าผลประหยัดเทียบกับ Dummy Policy (ทาย 0 หมด หรือ ทาย 1 หมด)",
      symptom: "คิดว่าโมเดลช่วยลดต้นทุนได้แล้ว แต่จริง ๆ ถ้าส่งทุกเคสให้คนตรวจหมดเลยอาจถูกกว่าโมเดลที่ยังอ่อนอยู่",
      fix: "เทียบต้นทุนของโมเดลกับทั้ง `threshold = 0.50`, `threshold = 0.0` (ทาย 1 หมด) และ `threshold = 1.0` (ทาย 0 หมด) เพื่อยืนยันว่าโมเดลสร้างมูลค่าเพิ่มจริง",
    },
    {
      title: "ตั้ง grid หยาบเกินไป (เช่น 0.25, 0.50, 0.75) ในงานที่คลาสเป้าหมายหายากมาก",
      symptom: "คลาสเป้าหมายมีแค่ 1% ความน่าจะเป็นส่วนใหญ่อยู่ช่วง `0.01–0.15` แต่ grid เริ่มที่ `0.25` ทำให้หาจุดคุ้มทุนไม่เจอเลย",
      fix: "ปรับช่วง `grid` ให้ครอบคลุมการกระจายตัวของ `p_val` จริง (เช่น ใช้ `np.quantile` หรือช่วง `0.01–0.99` ละเอียดขึ้นเมื่อ prevalence ต่ำมาก)",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ ทบทวน D39 + D45 + D46 + D47 + D48) — ลองตอบจากความจำก่อนดูเฉลย",
    questions: [
      mc(
        "d048-q1",
        "[ทบทวน D39 + D48] ระบบคัดกรองทิกเก็ต VIP มีความน่าจะเป็นที่ calibrate แล้ว โดยต้นทุนเตือนเก้อ (`cost_fp`) = 200 บาท และต้นทุนปล่อยเคสด่วนหลุด (`cost_fn`) = 1,800 บาท จุดคุ้มทุนทางทฤษฎี (Bayes threshold) ควรอยู่ที่ประมาณเท่าใด?",
        [
          ["`0.50` เพราะเป็นจุดกึ่งกลางของความน่าจะเป็น", "ผิด — 0.50 ใช้ได้เฉพาะเมื่อต้นทุน FP เท่ากับ FN เท่านั้น"],
          ["`0.10` (`200 / (200 + 1800)`) — แค่โอกาสเป็นเคสด่วนถึง 10% ก็คุ้มที่จะส่งตรวจแล้ว", "ถูก — ต้นทุนคาดหวังของการปล่อยหลุด (`0.10 * 1800 = 180`) เท่ากับต้นทุนคาดหวังของการเตือนเก้อ (`0.90 * 200 = 180`) พอดี"],
          ["`0.90` (`1800 / (200 + 1800)`)", "สลับเศษส่วน — ค่า 0.90 คือกรณีที่ FP แพงกว่า FN 9 เท่า ไม่ใช่ FN แพงกว่า FP"],
          ["`0.01` เพราะยิ่งต่ำยิ่งดีเสมอ", "ผิด — ถ้าต่ำเกินไปจนเตือนเก้อหมดทุกใบ ค่า FP รวมจะบานปลายเกินค่า FN ที่ประหยัดได้"],
        ],
        "B",
        "ตามหลัก Expected Value จุดคุ้มทุนคือ `t* = cost_fp / (cost_fp + cost_fn) = 200 / 2000 = 0.10` (และในทางปฏิบัติควรทำ sweep ยืนยันบน Validation set อีกครั้ง)",
        "สูตร Bayes optimal threshold จากต้นทุน `cost_fp` และ `cost_fn` (เมื่อความน่าจะเป็น calibrate แล้ว) คืออะไร?",
        "`t* = cost_fp / (cost_fp + cost_fn)` — เมื่อ FN แพงกว่า FP มาก threshold จะต่ำลง; เมื่อ FP แพงกว่า FN มาก threshold จะสูงขึ้น",
      ),
      mc(
        "d048-q2",
        "[ทบทวน D45] ทีมต้องการเปรียบเทียบ `LogisticRegression` กับ `LightGBM` บนชุดข้อมูลตรวจจับทุจริตที่มีคลาสเป้าหมายเพียง 1.5% ก่อนจะไปจูน threshold ควรใช้ตัวชี้วัดใดเปรียบเทียบ?",
        [
          ["Accuracy ที่ threshold 0.50", "ผิด — ข้อมูล 98.5% เป็นคลาสปกติทำให้ Accuracy หลอกตา (Accuracy Paradox)"],
          ["PR-AUC (`average_precision_score`) โดยส่งค่าความน่าจะเป็น `predict_proba(X_val)[:, 1]`", "ถูก — PR-AUC วัดคุณภาพการจัดอันดับข้ามทุก threshold โดยไม่ถูกคลาส TN 98.5% มากลบความผิดพลาดแบบ FP"],
          ["RMSE ของค่า 0/1", "RMSE เป็นตัวชี้วัดหลักของงาน Regression ไม่ใช่ตัวเลือกมาตรฐานสำหรับคัดโมเดล Imbalanced Classification"],
          ["จำนวนแถวใน `X_train`", "ขนาดข้อมูลไม่บอกคุณภาพของโมเดล"],
        ],
        "B",
        "แยกขั้นตอนให้ชัด: ใช้ PR-AUC บน `y_prob` เลือกโมเดลที่จัดอันดับเก่งที่สุดก่อน แล้วค่อยจูน threshold ตามต้นทุนธุรกิจทีหลัง",
        "ลำดับขั้นตอนที่ถูกต้องระหว่าง 'เลือกโมเดลด้วย PR-AUC' กับ 'จูน Threshold ด้วย Cost Matrix' คืออะไร?",
        "เลือกโมเดลที่จัดอันดับ `y_prob` ดีที่สุดบน Validation ด้วย PR-AUC ก่อน จากนั้นจึงกวาดหา `best_threshold` ที่ลดต้นทุนธุรกิจต่ำสุดบน Validation แล้วล็อกไปตรวจบน Test",
      ),
      mc(
        "d048-q3",
        "[ทบทวน D46] โมเดลทำนายเวลาปิดทิกเก็ตได้ค่าเฉลี่ยรวม `MAE = 1.5 ชม.` และ `mean_residual = +0.1 ชม.` แต่พอผ่ากลุ่มพบว่าหมวด `enterprise` มี `MAE = 4.2 ชม.`, `RMSE = 4.3 ชม.`, `mean_residual = +4.2 ชม.` ข้อสรุปใดถูกต้อง?",
        [
          ["หมวด `enterprise` ปกติดี เพราะภาพรวมทั้งบริษัทยังมี `mean_residual = +0.1`", "ผิด — ค่าเฉลี่ยรวมกลบปัญหาของกลุ่มย่อยไว้"],
          ["โมเดลกำลัง **ทายเวลาของหมวด `enterprise` ต่ำกว่าความจริงอย่างเป็นระบบ (Systematic Under-prediction)** ประมาณ 4.2 ชม. ทุกใบ", "ถูก — `mean_residual = +4.2` และ `MAE ≈ RMSE ≈ 4.2` ชี้ชัดว่าเกือบทุกใบในกลุ่มนี้ใช้เวลาจริงมากกว่าที่ทาย ~4.2 ชม."],
          ["หมวด `enterprise` มี outlier เพียง 1 ใบที่ทำให้ค่าเพี้ยน", "ถ้ามี outlier เดี่ยว RMSE จะสูงกว่า MAE มาก ไม่ใช่ 4.3 เทียบ 4.2"],
          ["ต้องเปลี่ยนไปใช้ Accuracy แทน MAE", "งานทำนายชั่วโมงเป็น Regression ไม่ใช้ Accuracy"],
        ],
        "B",
        "การผ่า Residual แยกตาม segment ช่วยให้แยกออกทันทีว่าระบบกำลังเจอ Systematic Bias (MAE ≈ RMSE ≈ |mean_residual|) หรือ Outlier เดี่ยว (RMSE >> MAE)",
        "ใน Regression Error Analysis เราแยก 'Systematic Bias' ออกจาก 'Single Outlier' ในแต่ละกลุ่มได้อย่างไร?",
        "ถ้า `MAE ≈ RMSE ≈ |mean_residual|` แปลว่าพลาดไปทิศทางเดียวกันทั้งกลุ่ม (Systematic Bias) แต่ถ้า `RMSE >> MAE` แปลว่ามีเคส Outlier พลาดหนักปะปนอยู่",
      ),
      mc(
        "d048-q4",
        "[ทบทวน D47 + D48] ข้อใดคือลำดับการใช้ชุดข้อมูล **Train / Val / Test** ที่ปลอด **Data Leakage** 100% เมื่อเทรน LightGBM พร้อมจูน Threshold?",
        [
          ["เทรนบน Train → early stopping บน Test → จูน threshold บน Test", "ผิดร้ายแรง — ใช้ Test ทั้ง early stopping และจูน threshold เกิด Data Leakage เต็มรูปแบบ"],
          ["เทรนบน Train → early stopping และจูน threshold บน **Val** → ล็อกโมเดลและ threshold ไปวัดต้นทุนครั้งสุดท้ายบน **Test**", "ถูก — ชุด Test ไม่เคยมีส่วนร่วมในการตัดสินใจใด ๆ ระหว่างเทรนหรือจูน จึงสะท้อนต้นทุนบนข้อมูลใหม่ได้จริง"],
          ["รวม Train+Val+Test เพื่อเทรนให้แม่นที่สุด แล้วค่อยแบ่งตอนจูน threshold", "ผิด — โมเดลเห็นข้อมูล Test ไปแล้วตั้งแต่ตอนเทรน"],
          ["เทรนบน Train → จูน threshold บน Train → ไม่ต้องใช้ Val set", "ผิด — โมเดลมักมั่นใจเกินจริงบน Train set ทำให้ threshold ที่จูนบน Train เพี้ยนเมื่อเจอข้อมูลใหม่"],
        ],
        "B",
        "ทุกการตัดสินใจที่ปรับเปลี่ยนโมเดลหรือเกณฑ์ (early stopping, hyperparameter tuning, threshold tuning) ต้องอยู่บน Validation set เท่านั้น เพื่อรักษาความบริสุทธิ์ของ Test set",
        "ทำไมการจูน Threshold บน Train set หรือ Test set จึงผิดทั้งคู่?",
        "จูนบน Train set จะได้ความน่าจะเป็นที่ overfit เกินจริง ส่วนจูนบน Test set ทำให้เกิด Data Leakage จนวัดผลจริงไม่ได้ — จึงต้องจูนบน Validation set เท่านั้น",
      ),
    ],
  },

  takeaways: [
    "แยก **Model Quality (PR-AUC)** ออกจาก **Decision Policy (Threshold)**: ใช้ {{lightgbm}} สร้าง `y_prob` ที่จัดอันดับคมที่สุด แล้วใช้ Cost Matrix เลือกจุดตัดที่คุ้มทุนที่สุด",
    "ค่าเริ่มต้น `0.50` แทบไม่เคยเหมาะกับงานที่มีต้นทุน **FP vs FN ไม่เท่ากัน** — เมื่อ FN แพงกว่า FP มาก (เช่น พลาดทิกเก็ต VIP) threshold ที่เหมาะสมจะต่ำลงอย่างมาก",
    "ทำ **Empirical Threshold Sweep บน Validation Set เท่านั้น** แล้วล็อกไปพิสูจน์ผลประหยัดบน Test Set ที่ไม่เคยแตะเพื่อป้องกัน {{data-leakage}}",
    "จบ Block B12 คุณมีครบทั้งอาวุธวัดผล Classification ({{precision-recall}}), Regression ({{mae-rmse}}), โมเดลตารางระดับโปรดักชัน ({{lightgbm}}) และการตัดสินใจด้วย {{expected-value}} — พร้อมลุยภาษาไทยด้วย PyThaiNLP ใน Block B13 พรุ่งนี้!",
  ],

  reviewCards: [
    rc(
      "d048-rc-1",
      "ทำไมจึงควรทำ Empirical Threshold Sweep บน Validation Set แทนการใช้สูตร `cost_fp / (cost_fp + cost_fn)` เพียงอย่างเดียว?",
      "เพราะความน่าจะเป็นดิบของโมเดล (โดยเฉพาะเมื่อเปิด `class_weight=\"balanced\"`) มักไม่ calibrate เป๊ะ การกวาดบน Validation Set จะหาจุดที่ต้นทุนจริงต่ำที่สุดสำหรับโมเดลนั้นได้แม่นกว่า",
    ),
    rc(
      "d048-rc-2",
      "สรุปหน้าที่ของ Train, Validation และ Test Set ใน pipeline ที่ใช้ LightGBM + Threshold Tuning?",
      "Train = เทรนต้นไม้; Validation = early stopping + เลือกโมเดล (PR-AUC) + จูน `best_threshold`; Test = วัดต้นทุนจริงครั้งสุดท้ายด้วย `(model, best_threshold)` ที่ล็อกไว้แล้วเท่านั้น",
    ),
    rc(
      "d048-rc-3",
      "เปรียบเทียบภาพรวมของ 3 เครื่องมือใน Block B12 (D45, D46, D47) ว่าแต่ละตัวตอบคำถามอะไร?",
      "D45 (Precision/Recall/PR-AUC) = วัดงานจำแนกข้อมูลไม่สมดุล; D46 (MAE/RMSE + Residual Slicing) = วัดงานทำนายตัวเลขและหา outlier/bias รายกลุ่ม; D47 (LightGBM) = โมเดลตารางเร็วและแม่นพร้อม early stopping",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Tuning the decision threshold (TunedThresholdClassifierCV)", href: "https://scikit-learn.org/stable/modules/classification_threshold.html" },
    { label: "scikit-learn User Guide — Probability Calibration", href: "https://scikit-learn.org/stable/modules/calibration.html" },
    { label: "LightGBM Documentation — Binary Classification & Imbalanced Data", href: "https://lightgbm.readthedocs.io/en/latest/Parameters-Tuning.html" },
  ],

  glossary: [
    "precision-recall",
    "expected-value",
    "mae-rmse",
    "lightgbm",
    "data-leakage",
    "cross-validation",
    "sklearn-pipeline",
    "pytest",
  ],
});
