import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D039 — Phase 2 / Block B10
 * Probability, Distributions & Expected Value for AI Systems
 */
export const d039: Lesson = defineLesson({
  day: 39,
  titleTh: "ความน่าจะเป็น การแจกแจง และ Expected Value สำหรับการตัดสินใจในระบบ AI",
  tagline:
    "30 นาที · รันบนเครื่อง 100% ไม่ต้องใช้ API key · แปลงความมั่นใจโมเดลเป็น Expected Value เพื่อตัดสินใจตอบอัตโนมัติหรือส่งต่อคน",
  icon: "scale",
  visual: {
    id: "prob-expected-value",
    title: "Expected Value (EV) — ใช้ความน่าจะเป็นตัดสินใจ Routing & Abstention",
    caption:
      "ปรับความมั่นใจของโมเดลและค่าเสียหายเมื่อตอบผิด เพื่อหาจุดตัดที่ให้ Expected Value เป็นบวก",
    alt: "แผนภาพการคำนวณ Expected Value สำหรับระบบ AI",
  },
  requiresApiKey: false,
  tools: ["NumPy", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "แปลโจทย์ AI ให้เป็นต้นทุนและผลตอบแทนทางธุรกิจ",
      body: "ในโลกจริงการตอบผิด 1 ครั้ง (เช่น แจ้งเงื่อนไขคืนเงินผิดหรือเกิด {{hallucination}}) มักเสียหายมากกว่าเงินที่ประหยัดได้จากการตอบอัตโนมัติ 1 ครั้งหลายเท่า — เราจึงไม่สามารถใช้จุดตัด `0.50` กับทุกงานได้",
      lessonNote:
        "วันนี้เรากำหนดตัวเลข `gain` (ผลได้เมื่อตอบถูก) และ `cost` (ค่าเสียหายเมื่อตอบผิด) เพื่อแปลงความน่าจะเป็นให้เป็นการตัดสินใจที่คุ้มค่าจริง",
    },
    {
      node: 2,
      heading: "เข้าใจธรรมชาติความน่าจะเป็นของคำตอบโมเดล",
      body: "โมเดล ML และ LLM ไม่ได้ให้คำตอบแบบถูก-ผิด 100% แต่ให้ความน่าจะเป็น (probability) หรือคะแนนความมั่นใจ ซึ่งอาจสูงเกินจริง (overconfident) หากไม่ผ่านการตรวจสอบ calibration",
      lessonNote:
        "เรียนรู้ความต่างระหว่างคะแนนดิบของโมเดลกับความน่าจะเป็นที่ผ่านการปรับเทียบ (calibrated probability) และวิธีอ่านการแจกแจงด้วย percentiles",
    },
    {
      node: 3,
      heading: "ระวังกับดัก Base Rate ตอนประเมินผล",
      body: "เมื่อเหตุการณ์ที่สนใจเกิดขึ้นน้อย (เช่น ทุจริต 2% หรือทิกเก็ตวิกฤต 3%) โมเดลที่ดูแม่นยำ 90% อาจแจ้งเตือนผิดพลาดมากกว่า 80% ของเคสที่เด้งเตือนทั้งหมด",
      lessonNote:
        "เข้าใจ Conditional Probability และ Base Rate เพื่อปูทางสู่ {{precision-recall}} ใน Block B12",
    },
    {
      node: 4,
      heading: "วางนโยบาย Auto-Reply vs Escalate อย่างมีหลักการ",
      body: "ระบบ AI Production ที่ดีต้องรู้ว่าเมื่อไหร่ควรตอบเอง และเมื่อไหร่ควรหยุดตอบแล้วส่งต่อเจ้าหน้าที่ ({{hitl}})",
      lessonNote:
        "ใช้สูตร {{expected-value}} (`EV = p*gain - (1-p)*cost`) สร้างตัวเราท์ทิกเก็ตซัพพอร์ตภาษาไทยแบบ vectorized ด้วย NumPy",
    },
  ],

  objectives: [
    "**คำนวณและอธิบาย Conditional Probability กับ Base Rate** เพื่อหลีกเลี่ยง Base Rate Fallacy เมื่อประเมินระบบคัดกรองที่เหตุการณ์เป้าหมายเกิดขึ้นน้อย",
    "**แยกแยะ Model Confidence ดิบกับ Calibrated Probability** และสรุปการแจกแจงข้อมูลที่ไม่สมมาตรด้วย percentiles (`P50`, `P90`, `P95`) ใน NumPy",
    "**คำนวณ {{expected-value}} (`EV = p·gain - (1-p)·cost`) และจุดคุ้มทุน `p* = cost / (gain + cost)`** เพื่อสร้างนโยบายตัดสินใจ Auto-Reply vs ส่งต่อเจ้าหน้าที่ ({{hitl}})",
  ],

  prerequisites: [
    "ผ่าน Day 37 เรื่อง NumPy array และการคำนวณแบบ vectorized",
    "เข้าใจพื้นฐานร้อยละและทศนิยมความน่าจะเป็นช่วง `[0.0, 1.0]`",
    "ใช้ `uv` และ `pytest` จาก Phase 1 ได้คล่อง",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ขนาดเล็กด้วย {{uv}} และติดตั้ง `numpy` สำหรับจำลองความน่าจะเป็นและการตัดสินใจเชิง Expected Value บนเครื่อง",
    commands: `uv init ai-day39 && cd ai-day39
uv add numpy
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('NumPy:', np.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day39` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `numpy`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน NumPy ผ่าน `uv run python` สำเร็จ"],
    ],
    note: "บทนี้ใช้คณิตศาสตร์ระดับประยุกต์ที่เชื่อมตรงกับเงินและประสบการณ์ผู้ใช้จริง ไม่เน้นการพิสูจน์ทฤษฎีบทเชิงสัญลักษณ์",
  },

  concepts: [
    {
      id: "conditional-prob-base-rate",
      title: "1 · Conditional Probability & Base Rate: ทำไมโมเดลแม่น 90% ยังเตือนมั่วได้เกิน 80%",
      paragraphs: [
        "**ความน่าจะเป็นแบบมีเงื่อนไข `P(A | B)`** อ่านว่า 'โอกาสที่จะเกิด A เมื่อเรารู้แล้วว่าเกิด B' ในระบบ AI เราสนใจสองทิศทางที่คนมักสลับกัน: `P(ระบบเตือน | เป็นเคสทุจริต)` (ความไวของโมเดล) กับ `P(เป็นเคสทุจริตจริง | ระบบเตือน)` (ความน่าเชื่อถือเมื่อสัญญาณดัง)",
        "สมมติร้านค้ามีสลิปปลอมจริงเพียง **2%** (**Base Rate** `P(Fraud) = 0.02`) โมเดลตรวจสลิปจับของปลอมได้ 90% (`P(Flag | Fraud) = 0.90`) และเผลอเตือนสลิปจริงผิดพลาด 10% (`P(Flag | Valid) = 0.10`) — จาก 1,000 สลิป จะมีสลิปปลอมที่ถูกจับได้ `20 × 0.90 = 18` ใบ แต่มีสลิปจริงที่โดนเตือนมั่วถึง `980 × 0.10 = 98` ใบ!",
        "เมื่อรวมกัน ระบบเด้งเตือนทั้งหมด `18 + 98 = 116` ครั้ง แต่เป็นสลิปปลอมจริงเพียง **`18 / 116 ≈ 15.5%`** เท่านั้น! นี่คือ **Base Rate Fallacy** — หากไม่คูณอัตราฐานเข้าไปก่อน ทีมอาจหลงเชื่อว่าสัญญาณเตือนแม่น 90% จนตั้งระบบแบนลูกค้าอัตโนมัติพังทั้งร้าน",
      ],
      analogy:
        "เหมือนเครื่องตรวจจับโลหะที่ไวมากในสวนสาธารณะที่มีเหรียญตกอยู่แค่ไม่กี่เหรียญ แต่มีฝาขวดเกลื่อนพื้น — ต่อให้เครื่องจับเหรียญได้ 90% เสียงติ๊ดส่วนใหญ่ที่ดังขึ้นก็ยังเป็นฝาขวดอยู่ดี",
      bullets: [
        "**Base Rate (`P(Positive)`)** คือสัดส่วนจริงของเหตุการณ์ในประชากรทั้งหมดก่อนโมเดลทำงาน",
        "**กฎของเบย์ (Bayes' Rule)**: `P(Pos | Flag) = [P(Pos) · P(Flag | Pos)] / [P(Pos) · P(Flag | Pos) + P(Neg) · P(Flag | Neg)]`",
        "เมื่อ Base Rate ต่ำมาก (imbalanced data) เราต้องดู {{precision-recall}} แทน Accuracy เสมอ (จะเจาะลึกใน Day 45)",
      ],
      code: {
        language: "python",
        filename: "base_rate_demo.py",
        code: `base_rate = 0.02            # P(Fraud) = 2%
sensitivity = 0.90          # P(Flag | Fraud) = 90%
false_positive_rate = 0.10  # P(Flag | Valid) = 10%

p_flag_and_fraud = base_rate * sensitivity
p_flag_and_valid = (1.0 - base_rate) * false_positive_rate
p_fraud_given_flag = p_flag_and_fraud / (p_flag_and_fraud + p_flag_and_valid)

print(f"P(Flag)          = {p_flag_and_fraud + p_flag_and_valid:.4f}")
print(f"P(Fraud | Flag)  = {p_fraud_given_flag:.4f} ({p_fraud_given_flag * 100:.1f}%)")`,
        caption:
          "แม้โมเดลจับเคสจริงได้ 90% แต่เมื่อ Base Rate อยู่ที่ 2% กว่า 84% ของการแจ้งเตือนยังคงเป็น False Positive",
      },
      whyTitle: "Why this matters — ป้องกันความเข้าใจผิดตอนรายงานผลให้ทีมธุรกิจ",
      whyParagraphs: [
        "ปัญหาคลาสสิกในทีม AI มือใหม่คือเอาตัวเลข 'Accuracy 98%' ไปนำเสนอ ทั้งที่ถ้าทายว่า 'ไม่ใช่ทุจริต' ทุกเคสก็ได้ 98% อยู่แล้ว หรือเข้าใจผิดว่า Recall 90% แปลว่าทุกครั้งที่ระบบเตือนจะมีโอกาสถูก 90%",
        "การคิดด้วย Base Rate และ Conditional Probability ทำให้คุณออกแบบระบบคัดกรอง (fraud, toxic comment, escalation) ได้ตรงความเป็นจริงตั้งแต่บนกระดาษ",
      ],
    },
    {
      id: "confidence-vs-calibration",
      title: "2 · Model Confidence vs Calibrated Probability และการอ่านการแจกแจง",
      paragraphs: [
        "โมเดล ML และ LLM มักส่งตัวเลขช่วง `0.0–1.0` ออกมา (เช่น softmax score หรือ self-reported confidence) แต่นักวิศวกรรม AI ต้องรู้ว่า **คะแนนความมั่นใจดิบ (raw confidence) ≠ ความน่าจะเป็นที่แท้จริง (calibrated probability)**",
        "โมเดลที่ **Calibrated ดี** หมายความว่า ในบรรดาเคสทั้งหมดที่โมเดลทายด้วยความมั่นใจ `0.80` มันจะต้องตอบถูกจริงประมาณ `80%` — แต่โมเดล Deep Learning และ LLM จำนวนมากมัก **มั่นใจเกินจริง (overconfident)** เช่น พูดว่ามั่นใจ `0.95` ทั้งที่บนชุดทดสอบจริงตอบถูกเพียง `70%`",
        "นอกจากค่าเฉลี่ย (`mean`) แล้ว ในงานระบบ AI การแจกแจงข้อมูลมักเบ้ (skewed) เช่น latency หรือ confidence ของคำถามลูกค้า เราจึงควรสรุปการแจกแจงด้วย **Percentiles / Quantiles** (`np.percentile(x, [50, 90, 95])`) เพื่อเห็นทั้งเคสปกติ (`P50`) และเคสหางยาว (`P95`)",
      ],
      analogy:
        "พยากรณ์อากาศที่ calibrated ดีคือทุกวันที่ประกาศว่า 'ฝนตก 70%' ฝนจะตกจริง 7 จาก 10 วัน ส่วนคนที่มั่นใจเกินจริงคือคนที่พูดว่า 'ชัวร์ 95%' ทุกวันแต่ทายถูกจริงแค่ครึ่งเดียว",
      bullets: [
        "ตรวจ calibration แบบเร็วได้ด้วยการแบ่งคะแนนเป็นช่วง (bins) แล้วเทียบ `mean(predicted_prob)` กับ `mean(actual_correct)` ในแต่ละช่วง",
        "ห้ามนำค่า `confidence` ที่ LLM พิมพ์ออกมาเป็นข้อความ (เช่น 'ฉันมั่นใจ 99%') ไปใส่สูตร Expected Value โดยไม่ทดสอบเทียบกับข้อมูลจริงก่อน",
        "ใช้ `np.percentile` ตรวจหางของการแจกแจง (`P10`, `P50`, `P90`, `P95`) เสมอ เพราะค่าเฉลี่ยเดียวซ่อนความเสี่ยงได้ดีมาก",
      ],
      code: {
        language: "python",
        filename: "calibration_check.py",
        code: `import numpy as np

# ตัวอย่างกลุ่มเคสที่โมเดลอ้างว่ามั่นใจช่วง 0.85 - 0.95
pred_probs = np.array([0.92, 0.90, 0.88, 0.94, 0.86, 0.91], dtype=np.float64)
actual_ok = np.array([1, 1, 0, 1, 0, 1], dtype=np.float64)  # ถูกจริง 4 จาก 6 เคส

print(f"Mean predicted confidence : {pred_probs.mean():.3f}")
print(f"Actual empirical accuracy : {actual_ok.mean():.3f}")
print(f"Overconfidence gap        : {pred_probs.mean() - actual_ok.mean():+.3f}")

# สรุปการแจกแจงเวลาตอบกลับ (ms) ที่มักเบ้ขวา
latencies_ms = np.array([120, 135, 140, 155, 160, 180, 210, 950], dtype=np.float64)
p50, p95 = np.percentile(latencies_ms, [50, 95])
print(f"Latency mean={latencies_ms.mean():.1f}ms | P50={p50:.1f}ms | P95={p95:.1f}ms")`,
        caption:
          "ค่าเฉลี่ย latency อยู่ที่ 256ms เพราะโดนเคส 950ms ดึงขึ้น แต่ `P50` กับ `P95` บอกภาพจริงของทั้งผู้ใช้ทั่วไปและเคสช้าสุดได้ชัดกว่ามาก",
      },
      whyTitle: "Why this matters — เงื่อนไขสำคัญก่อนนำความน่าจะเป็นไปคำนวณเงิน",
      whyParagraphs: [
        "สูตร {{expected-value}} ในหัวข้อถัดไปจะแม่นยำก็ต่อเมื่อค่า `p` ใกล้เคียงความน่าจะเป็นจริง (calibrated) ถ้าโมเดล overconfident อยู่ 20% จุดตัดที่เราคำนวณได้จะปล่อยให้ระบบตอบอัตโนมัติในเคสที่ขาดทุนโดยไม่รู้ตัว",
        "ใน Phase 2 (Day 48) และ Phase 5 (Day 125–135) เราจะวัด calibration บนชุด validation/golden dataset ก่อนตั้ง threshold จริงใน Production เสมอ",
      ],
    },
    {
      id: "expected-value-routing",
      title: "3 · Expected Value (EV): สูตรคำนวณจุดตัด Auto-Reply vs ส่งต่อเจ้าหน้าที่",
      paragraphs: [
        "**{{expected-value}} (EV)** คือผลตอบแทนเฉลี่ยที่คาดว่าจะได้รับต่อการตัดสินใจ 1 ครั้ง เมื่อถ่วงน้ำหนักทุกผลลัพธ์ที่เป็นไปได้ด้วยความน่าจะเป็นของมัน สำหรับการให้ AI ตอบอัตโนมัติในระบบซัพพอร์ตไทยที่มีโอกาสตอบถูก `p` และโอกาสตอบผิด `1 - p`:",
        "**`EV_auto = p × gain - (1 - p) × cost`** โดย `gain` คือมูลค่าที่ประหยัดได้เมื่อตอบถูก (เช่น ค่าเวลาเจ้าหน้าที่ 25 บาท) และ `cost` คือความเสียหายเมื่อตอบผิด (เช่น ค่าแก้ปัญหาซ้ำ + เสียลูกค้า 225 บาท) ส่วนการส่งต่อเจ้าหน้าที่ตั้งแต่แรกถือเป็นฐานอ้างอิง `EV_escalate = 0`",
        "เราควรให้ AI ตอบอัตโนมัติก็ต่อเมื่อ `EV_auto >= 0` เมื่อย้ายข้างสมการจะได้ **จุดตัดคุ้มทุน (Break-Even Threshold)** ที่สั้นและทรงพลังมาก: **`p* = cost / (gain + cost)`** — ในตัวอย่างนี้ `p* = 225 / (25 + 225) = 0.90` แปลว่าหากความมั่นใจต่ำกว่า 90% การให้ AI ตอบเองจะ **ขาดทุนเชิงสถิติ** ควรส่งต่อคนทันที!",
      ],
      analogy:
        "เหมือนการวางเดิมพันที่ทายถูกได้ 25 บาท แต่ทายผิดเสีย 225 บาท — ต่อให้มีโอกาสถูกถึง 80% ถ้าเล่นไปเรื่อย ๆ ก็ยังขาดทุน (`0.8×25 - 0.2×225 = -25` บาทต่อตา) คุณจะลงเล่นก็ต่อเมื่อมั่นใจเกิน 90% เท่านั้น",
      bullets: [
        "`gain = 25`, `cost = 225` → จุดคุ้มทุน `p* = 225 / 250 = 0.90` (ต้องมั่นใจ ≥ 90% จึงค่อย Auto-Reply)",
        "ถ้าใช้จุดตัดแบบไร้หลักการ `0.50` ที่ความมั่นใจ `p = 0.60` จะได้ `EV = 0.6(25) - 0.4(225) = -75` บาทต่อทิกเก็ต!",
        "เมื่อลักษณะงานเปลี่ยน เช่น แนะนำสินค้า (ผิดเสีย 5 บาท, ถูกได้ 20 บาท) จุดคุ้มทุนจะลดเหลือ `5 / 25 = 0.20` — กฎเดิมสูตรเดียวปรับใช้ได้กับทุกโดเมน",
      ],
      code: {
        language: "python",
        filename: "ev_threshold.py",
        code: `import numpy as np

gain_thb = 25.0    # ประหยัดค่าเวลาเจ้าหน้าที่เมื่อตอบถูก
cost_thb = 225.0   # ค่าเสียหายเมื่อตอบผิด / เกิด hallucination

p_star = cost_thb / (gain_thb + cost_thb)
probs = np.array([0.95, 0.90, 0.75, 0.50])
ev = probs * gain_thb - (1.0 - probs) * cost_thb

print(f"Break-even threshold p* = {p_star:.2f}")
for p, val in zip(probs, ev):
    action = "AUTO_REPLY" if val >= 0 else "ESCALATE"
    print(f"p={p:.2f} -> EV={val:+7.2f} THB -> {action}")`,
        caption:
          "แค่เปลี่ยน `gain` และ `cost` ตามโดเมนธุรกิจ ก็ได้จุดตัด `p*` ที่อธิบายผู้บริหารและทีมปฏิบัติการได้ทันที",
      },
      whyTitle: "Why this matters — เชื่อมตรงไปยัง Threshold Tuning และ RAG Abstention",
      whyParagraphs: [
        "ใน Day 48 คุณจะจูน threshold ของโมเดล ML ด้วยต้นทุน False Positive vs False Negative และใน Day 106 คุณจะสร้างระบบ **Abstention ('ไม่ทราบ / ส่งต่อเจ้าหน้าที่')** ใน RAG — ทั้งหมดใช้กรอบคิด Expected Value เดียวกับวันนี้",
        "นี่คือทักษะที่เปลี่ยนคนเขียนโมเดลธรรมดาให้เป็น AI Engineer ที่ออกแบบระบบทำกำไรและควบคุมความเสี่ยงได้จริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก `if (score > 0.5)` สู่ Policy ที่คำนวณจากต้นทุนจริง",
      body: [
        "นักพัฒนาเว็บมักคุ้นกับการตั้งค่าคงที่อย่าง `const THRESHOLD = 0.5` หรือ `0.7` จากความรู้สึก แต่ในระบบ AI ที่มีความไม่แน่นอน การผูก threshold เข้ากับตัวเลขธุรกิจทำให้ config มีเหตุผลรองรับและปรับอัตโนมัติได้เมื่อต้นทุนเปลี่ยน:",
      ],
      table: [
        ["`p_star = cost / (gain + cost)`", "แทน magic number `0.5` ด้วยจุดคุ้มทุนจากต้นทุนจริง"],
        ["`ev = p * gain - (1 - p) * cost`", "ฟังก์ชันคิดกำไร-ขาดทุนคาดหวังต่อ request"],
        ["`np.where(ev >= 0, 'auto', 'human')`", "Feature flag / routing decision แบบ vectorized"],
        ["`np.percentile(arr, [50, 95])`", "SLA monitoring แบบ P50/P95 ใน APM dashboard"],
      ],
    },
    student: {
      title: "First-Year Note — ที่มาสั้น ๆ ของสูตรจุดคุ้มทุน `p* = cost / (gain + cost)`",
      body: [
        "ไม่ต้องท่องสูตรแบบนกแก้วนกขุนทอง — ลองแก้สมการแค่ 2 บรรทัด: เราอยากรู้จุดที่ `EV_auto = 0` นั่นคือ `p × gain - (1 - p) × cost = 0`",
        "กระจายวงเล็บได้ `p × gain - cost + p × cost = 0` → ดึงตัวร่วม `p` ออกได้ `p × (gain + cost) = cost` → ย้ายข้างได้ `p* = cost / (gain + cost)` ทันที!",
        "ลองแทนเลขเช็กสัญชาตญาณ: ถ้าถูกได้ 100 ผิดเสีย 100 (`gain == cost`) จะได้ `p* = 100 / 200 = 0.50` พอดี แต่ถ้าผิดเสียแพงกว่าถูก 9 เท่า (`cost = 9×gain`) จะได้ `p* = 9 / 10 = 0.90`",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ศูนย์บริการลูกค้า e-commerce ไทยมีทิกเก็ตเข้ามา 6 ใบ โดยโมเดลที่ผ่านการ calibrate แล้วประเมินความน่าจะเป็นที่ AI จะตอบถูกต้องได้ `[0.96, 0.91, 0.86, 0.78, 0.62, 0.45]` การตอบอัตโนมัติที่ถูกต้องประหยัดต้นทุนได้ `30` บาท แต่ถ้าตอบผิดจะเกิดความเสียหาย `170` บาท มาเทียบผลลัพธ์ของ 3 นโยบายกัน",
    steps: [
      {
        title: "1 · หาจุดคุ้มทุน `p*` จากเศรษฐศาสตร์ของระบบ",
        explain:
          "คำนวณ `p* = 170 / (30 + 170)` จะได้ `0.85` หมายความว่าเฉพาะทิกเก็ตที่มั่นใจตั้งแต่ `85%` ขึ้นไปเท่านั้นจึงจะมี Expected Value ไม่ติดลบ",
        code: {
          language: "python",
          filename: "worked_day39.py",
          code: `import numpy as np

gain_thb = 30.0
wrong_cost_thb = 170.0
p_star = wrong_cost_thb / (gain_thb + wrong_cost_thb)

ticket_ids = ["T-01", "T-02", "T-03", "T-04", "T-05", "T-06"]
probs = np.array([0.96, 0.91, 0.86, 0.78, 0.62, 0.45], dtype=np.float64)

print(f"Break-even threshold p* = {p_star:.2f}")`,
        },
        output: `Break-even threshold p* = 0.85`,
      },
      {
        title: "2 · คำนวณ Expected Value ของแต่ละทิกเก็ตแบบ Vectorized",
        explain:
          "ใช้สูตร `ev = probs * gain_thb - (1.0 - probs) * wrong_cost_thb` คำนวณกำไร-ขาดทุนคาดหวังของทุกทิกเก็ตพร้อมกัน",
        code: {
          language: "python",
          filename: "worked_day39.py",
          code: `ev_per_ticket = probs * gain_thb - (1.0 - probs) * wrong_cost_thb

for tid, p, ev in zip(ticket_ids, probs, ev_per_ticket):
    route = "auto_reply" if ev >= 0.0 else "escalate"
    print(f"{tid} | p={p:.2f} | EV={ev:+7.2f} THB | route={route}")`,
        },
        output: `T-01 | p=0.96 | EV= +22.00 THB | route=auto_reply
T-02 | p=0.91 | EV= +12.00 THB | route=auto_reply
T-03 | p=0.86 | EV=  +2.00 THB | route=auto_reply
T-04 | p=0.78 | EV= -14.00 THB | route=escalate
T-05 | p=0.62 | EV= -46.00 THB | route=escalate
T-06 | p=0.45 | EV= -80.00 THB | route=escalate`,
      },
      {
        title: "3 · เปรียบเทียบมูลค่าคาดหวังรวมของ 3 นโยบายการ Routing",
        explain:
          "เทียบ (1) ตอบอัตโนมัติทุกเคส (`threshold=0.0`), (2) จุดตัดความรู้สึก (`threshold=0.50`) และ (3) จุดตัด EV-optimal (`threshold=0.85`) โดยทิกเก็ตที่ส่งต่อคนคิด EV เทียบฐานเป็น `0.0`",
        code: {
          language: "python",
          filename: "worked_day39.py",
          code: `for label, thresh in [("Always Auto (0.00)", 0.0), ("Naive (0.50)", 0.50), ("EV-Optimal (0.85)", p_star)]:
    mask = probs >= thresh
    total_ev = float(ev_per_ticket[mask].sum())
    print(f"{label:18s} -> auto={int(mask.sum())}/6 | total EV = {total_ev:+7.2f} THB")`,
        },
        output: `Always Auto (0.00) -> auto=6/6 | total EV = -104.00 THB
Naive (0.50)       -> auto=5/6 | total EV =  -24.00 THB
EV-Optimal (0.85)  -> auto=3/6 | total EV =  +36.00 THB`,
      },
    ],
    gotcha:
      "จุดสังเกต: การเพิ่มอัตราการตอบอัตโนมัติ (automation rate) จาก 50% เป็น 83% ในนโยบาย Naive (`0.50`) ทำให้ตัวเลข 'AI ตอบได้เยอะขึ้น' ดูสวยในสไลด์ แต่ในความเป็นจริงระบบเปลี่ยนจากกำไร `+36` บาทเป็นขาดทุน `-24` บาท!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูลตัดสินใจ Routing ด้วย Expected Value (`exercise_day39.py`) สำหรับระบบซัพพอร์ตลูกค้าภาษาไทย พร้อมการตรวจสอบอินพุตแบบ {{fail-fast}}",
    requirements: [
      "`break_even_probability(gain_thb: float, wrong_cost_thb: float) -> float`: ตรวจว่า `gain_thb > 0` และ `wrong_cost_thb >= 0` (ไม่งั้นโยน `ValueError`) แล้วคืน `wrong_cost_thb / (gain_thb + wrong_cost_thb)`",
      "`expected_auto_reply_ev(probs: np.ndarray, gain_thb: float, wrong_cost_thb: float) -> np.ndarray`: ตรวจว่า `probs` เป็น array 1D ที่ทุกค่าอยู่ในช่วง `[0.0, 1.0]` และ `gain_thb > 0`, `wrong_cost_thb >= 0` (ไม่งั้นโยน `ValueError`) แล้วคืน array 1D ของ `p * gain_thb - (1.0 - p) * wrong_cost_thb` แบบ vectorized",
      "`route_tickets(probs: np.ndarray, gain_thb: float, wrong_cost_thb: float) -> dict[str, object]`: ใช้สองฟังก์ชันด้านบนตัดสินใจแต่ละทิกเก็ตเป็น `\"auto_reply\"` เมื่อ `ev >= 0.0` (และ `\"escalate\"` เมื่อ `ev < 0.0`) แล้วคืน dict ที่มีคีย์ `threshold`, `decisions`, `auto_count`, `escalate_count`, `total_expected_value_thb` (ผลรวม EV เฉพาะเคส `auto_reply`)",
      "คำนวณทุกอย่างแบบ vectorized ด้วย NumPy โดยไม่เขียน loop คำนวณ EV ทีละตัว และผ่าน `uv run ruff check .`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day39.py",
      code: `import numpy as np


def break_even_probability(gain_thb: float, wrong_cost_thb: float) -> float:
    """คำนวณจุดคุ้มทุน p* = wrong_cost / (gain + wrong_cost)"""
    # TODO: ตรวจ gain_thb > 0 และ wrong_cost_thb >= 0 แล้วคืนค่า p*
    raise NotImplementedError


def expected_auto_reply_ev(
    probs: np.ndarray,
    gain_thb: float,
    wrong_cost_thb: float,
) -> np.ndarray:
    """คำนวณ Expected Value (บาท) ของการตอบอัตโนมัติสำหรับทุกทิกเก็ตแบบ vectorized"""
    # TODO: ตรวจขอบเขต probs ใน [0.0, 1.0], ndim == 1, gain/cost แล้วคำนวณ EV
    raise NotImplementedError


def route_tickets(
    probs: np.ndarray,
    gain_thb: float,
    wrong_cost_thb: float,
) -> dict[str, object]:
    """ตัดสินใจ auto_reply หรือ escalate ตามเกณฑ์ EV >= 0 และสรุปผลรวม"""
    # TODO: คืน dict {threshold, decisions, auto_count, escalate_count, total_expected_value_thb}
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day39.py",
      code: `import numpy as np
import pytest
from exercise_day39 import (
    break_even_probability,
    expected_auto_reply_ev,
    route_tickets,
)


def test_break_even_probability_values_and_validation():
    assert break_even_probability(25.0, 225.0) == pytest.approx(0.90)
    assert break_even_probability(30.0, 170.0) == pytest.approx(0.85)
    assert break_even_probability(50.0, 0.0) == pytest.approx(0.0)

    with pytest.raises(ValueError):
        break_even_probability(0.0, 100.0)
    with pytest.raises(ValueError):
        break_even_probability(20.0, -5.0)


def test_expected_auto_reply_ev_and_bounds():
    probs = np.array([0.96, 0.85, 0.45])
    ev = expected_auto_reply_ev(probs, gain_thb=30.0, wrong_cost_thb=170.0)
    assert ev == pytest.approx([22.0, 0.0, -80.0])

    with pytest.raises(ValueError):
        expected_auto_reply_ev(np.array([1.2, 0.5]), 30.0, 170.0)
    with pytest.raises(ValueError):
        expected_auto_reply_ev(np.array([-0.1, 0.5]), 30.0, 170.0)


def test_route_tickets_optimal_policy():
    probs = np.array([0.96, 0.91, 0.86, 0.78, 0.62, 0.45])
    report = route_tickets(probs, gain_thb=30.0, wrong_cost_thb=170.0)

    assert report["threshold"] == pytest.approx(0.85)
    assert report["decisions"] == [
        "auto_reply",
        "auto_reply",
        "auto_reply",
        "escalate",
        "escalate",
        "escalate",
    ]
    assert report["auto_count"] == 3
    assert report["escalate_count"] == 3
    assert report["total_expected_value_thb"] == pytest.approx(36.0)
`,
    },
    selfCheck: [
      "`break_even_probability(30.0, 170.0)` คืน `0.85` และโยน `ValueError` เมื่อ `gain <= 0` หรือ `wrong_cost < 0`",
      "`expected_auto_reply_ev` ปฏิเสธค่าความน่าจะเป็นที่อยู่นอกช่วง `[0.0, 1.0]` หรือไม่ใช่ 1D array",
      "`route_tickets` นับเฉพาะ EV ของเคส `auto_reply` (เคส `escalate` คิดเป็น `0.0` ไม่ติดลบ)",
      "กรณีเคสที่ `p == p*` (เช่น `0.85` ได้ `ev == 0.0`) ถูกจัดเป็น `auto_reply` อย่างสม่ำเสมอ",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance:
      "ผ่านทั้ง 3 test functions ใน `test_day39.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ตรวจขอบเขตความน่าจะเป็นทั้ง array ใน NumPy ด้วย `if np.any((arr < 0.0) | (arr > 1.0)) or np.isnan(arr).any(): raise ValueError(...)`",
      },
      {
        body: "ระวังความคลาดเคลื่อนของทศนิยม floating-point เช่น `0.85 * 30 - 0.15 * 170` อาจได้ `-1e-15` เล็กน้อย ใช้ `mask = arr >= threshold` หรือ `ev >= -1e-12` เพื่อไม่ให้เคสที่อยู่บนเส้นจุดคุ้มทุนเป๊ะหลุดไปเป็น `escalate`",
      },
      {
        body: "โครงของ `break_even_probability` และ `expected_auto_reply_ev` เกือบครบแล้ว เหลือเติมสรุปผลลัพธ์ใน `route_tickets`:",
        code: {
          language: "python",
          filename: "hint_day39.py",
          code: `import numpy as np


def break_even_probability(gain_thb: float, wrong_cost_thb: float) -> float:
    if gain_thb <= 0.0 or wrong_cost_thb < 0.0:
        raise ValueError("gain_thb must be > 0 and wrong_cost_thb must be >= 0")
    return float(wrong_cost_thb / (gain_thb + wrong_cost_thb))


def expected_auto_reply_ev(
    probs: np.ndarray,
    gain_thb: float,
    wrong_cost_thb: float,
) -> np.ndarray:
    break_even_probability(gain_thb, wrong_cost_thb)
    arr = np.asarray(probs, dtype=np.float64)
    if arr.ndim != 1 or np.isnan(arr).any() or np.any((arr < 0.0) | (arr > 1.0)):
        raise ValueError("probs must be a 1D array with values in [0.0, 1.0]")
    return arr * gain_thb - (1.0 - arr) * wrong_cost_thb


def route_tickets(
    probs: np.ndarray,
    gain_thb: float,
    wrong_cost_thb: float,
) -> dict[str, object]:
    threshold = break_even_probability(gain_thb, wrong_cost_thb)
    ev = expected_auto_reply_ev(probs, gain_thb, wrong_cost_thb)
    auto_mask = ev >= -1e-12
    # TODO: สร้าง decisions list, auto_count, escalate_count และ total_expected_value_thb = float(ev[auto_mask].sum())
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
      title: "ใช้จุดตัด 0.50 เป็นค่าเริ่มต้นกับทุกปัญหา AI",
      symptom:
        "ระบบตอบอัตโนมัติบ่อยมาก แต่ทีมซัพพอร์ตต้องตามแก้เคสที่ AI ตอบผิดจนต้นทุนรวมสูงกว่าเดิม",
      fix: "คำนวณจุดคุ้มทุน `p* = cost / (gain + cost)` จากความเสียหายจริงของโดเมนก่อนตั้ง threshold เสมอ",
    },
    {
      title: "นำ raw confidence ที่ยังไม่ calibrate ไปแทนค่า `p` ในสูตร EV ตรง ๆ",
      symptom:
        "สูตรบอกว่า EV เป็นบวก แต่เมื่อเปิดใช้งานจริงกลับขาดทุนเพราะโมเดลพูดว่า '90%' ทั้งที่ถูกจริงแค่ '65%'",
      fix: "ตรวจสอบ calibration บนชุดข้อมูลจริง (เทียบความมั่นใจเฉลี่ยกับความแม่นยำจริงในแต่ละช่วงคะแนน) ก่อนนำค่า `p` ไปตัดสินใจทางการเงิน",
    },
    {
      title: "มองข้าม Base Rate ตอนตั้งระบบแจ้งเตือนความเสี่ยง",
      symptom:
        "โมเดลมี sensitivity 90% แต่เมื่อขึ้น Production เจ้าหน้าที่ถูกถล่มด้วย False Alarm กว่า 80% จนเลิกสนใจการแจ้งเตือน",
      fix: "คำนวณ `P(Positive | Flag)` ด้วย Bayes' Rule โดยใส่ Base Rate จริงลงไปด้วยเสมอ และคุม False Positive Rate ให้ต่ำพอ",
    },
    {
      title: "ดูแค่ค่าเฉลี่ย (`mean`) โดยไม่ดู Percentiles (`P50`, `P95`)",
      symptom:
        "ค่าเฉลี่ยเวลาตอบกลับหรือคะแนนความมั่นใจดูดี แต่ผู้ใช้กลุ่ม 5–10% เจอประสบการณ์พังอย่างหนัก",
      fix: "รายงานการแจกแจงควบคู่กันด้วย `np.percentile(values, [10, 50, 90, 95])` เพื่อให้เห็นหางของการแจกแจงชัดเจน",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d039-q1",
        "ระบบตอบทิกเก็ตอัตโนมัติประหยัดต้นทุนได้ `40` บาทเมื่อตอบถูก แต่เสียค่าแก้ปัญหา `160` บาทเมื่อตอบผิด (ส่งต่อคน = `0` บาท) จุดคุ้มทุน `p*` ที่ควรเริ่มให้ AI ตอบอัตโนมัติคือเท่าใด?",
        [
          ["`0.20`", "สลับเศษส่วน — คุณคำนวณ `40 / 200` ซึ่งคือ `gain / (gain + cost)` ไม่ใช่ `cost / (gain + cost)`"],
          ["`0.50`", "ผิด — `0.50` ใช้ได้เฉพาะเมื่อ `gain == cost` เท่านั้น"],
          ["`0.80`", "ถูก — `p* = 160 / (40 + 160) = 160 / 200 = 0.80` (ต้องมั่นใจอย่างน้อย 80%)"],
          ["`0.95`", "สูงเกินจุดคุ้มทุนจริง — ที่ `0.85` ระบบก็เริ่มมี EV เป็นบวกแล้ว"],
        ],
        "C",
        "จาก `EV = p(40) - (1-p)(160) >= 0` จะได้ `200p >= 160` หรือ `p >= 0.80` หากความมั่นใจต่ำกว่า 80% การตอบอัตโนมัติจะขาดทุนเชิงสถิติ",
        "สูตรจุดคุ้มทุน `p*` สำหรับตัดสินใจ Auto-Reply vs Escalate คืออะไร?",
        "`p* = cost / (gain + cost)` — ยิ่งค่าเสียหายเมื่อตอบผิด (`cost`) สูงกว่าผลได้ (`gain`) มากเท่าไร จุดตัดยิ่งต้องเข้าใกล้ 1.0 มากขึ้น",
      ),
      mc(
        "d039-q2",
        "ในระบบตรวจจับทุจริตที่มี Base Rate ต่ำมาก (`1%`) โมเดลจับทุจริตได้ `90%` และเตือนผิดบนเคสปกติ `10%` หากระบบเด้งเตือน 1 เคส โอกาสที่เป็นทุจริตจริง (`P(Fraud | Flag)`) เป็นอย่างไร?",
        [
          ["ประมาณ `90%` เพราะโมเดลจับทุจริตได้ 90%", "ผิด — นี่คือ Base Rate Fallacy เพราะสลับ `P(Flag | Fraud)` กับ `P(Fraud | Flag)`"],
          ["ต่ำกว่า `10%` เพราะเคสปกติมีจำนวนมหาศาลกว่าเคสทุจริต ทำให้จำนวน False Positive สูงกว่า True Positive มาก", "ถูก — จาก 1,000 เคส จับถูก `9` เคส แต่เตือนผิดถึง `99` เคส จึงได้ `9 / 108 ≈ 8.3%` เท่านั้น"],
          ["เท่ากับ `50%` พอดี", "ไม่จริง — ต้องคำนวณถ่วงด้วย Base Rate จริง"],
          ["เท่ากับ `1%` เสมอไม่ว่าโมเดลจะแม่นแค่ไหน", "ไม่จริง — โมเดลช่วยเพิ่มโอกาสจาก 1% เป็น ~8.3% แต่ยังไม่สูงถึง 90%"],
        ],
        "B",
        "เมื่อ Base Rate อยู่ที่ 1% จำนวนเคสปกติ (`99%`) ใหญ่กว่าเกือบ 100 เท่า แม้ False Positive Rate จะอยู่ที่ 10% ก็สร้างสัญญาณเตือนปลอมถึง `99` ครั้ง เทียบกับจับถูก `9` ครั้ง (`9 / 108 ≈ 8.3%`)",
        "Base Rate Fallacy ในระบบคัดกรอง AI คืออะไร?",
        "การหลงเชื่อว่าความไวของโมเดล `P(Flag | Pos)` เท่ากับโอกาสเป็นเคสจริงเมื่อเตือน `P(Pos | Flag)` โดยลืมคำนึงว่า Base Rate ของเหตุการณ์นั้นต่ำมาก",
      ),
      mc(
        "d039-q3",
        "ข้อความใดอธิบายความหมายของโมเดลที่ **Well-Calibrated (ปรับเทียบความน่าจะเป็นดี)** ได้ถูกต้องที่สุด?",
        [
          ["โมเดลตอบถูก 100% ในทุกเคส", "ไม่จำเป็น — โมเดลที่ตอบถูก 70% ก็ calibrated ดีได้ถ้ามันรายงานความมั่นใจที่ ~0.70"],
          ["ในบรรดาเคสที่โมเดลรายงานความมั่นใจ ~`0.80` มันตอบถูกจริงประมาณ `80%` ของเคสเหล่านั้น", "ถูก — ค่าความมั่นใจที่โมเดลบอกสอดคล้องกับอัตราความถูกต้องจริงตามสถิติ"],
          ["โมเดลให้คะแนนความมั่นใจเป็น `0.99` ในทุกคำตอบ", "ตรงกันข้าม — นั่นคืออาการ overconfident ที่อันตรายต่อสูตร Expected Value"],
          ["โมเดลมีค่าเฉลี่ย latency ต่ำกว่า 100ms", "ไม่เกี่ยวกัน — นั่นคือความเร็ว (latency) ไม่ใช่ probability calibration"],
        ],
        "B",
        "Calibration วัดว่าความน่าจะเป็นที่โมเดลทำนายตรงกับความถี่ที่เกิดขึ้นจริงหรือไม่ ซึ่งเป็นเงื่อนไขสำคัญก่อนนำ `p` เข้าสูตร Expected Value",
        "โมเดลที่ 'Well-Calibrated' หมายถึงอะไร และทำไมจึงสำคัญต่อ Expected Value?",
        "หมายถึงเคสที่โมเดลให้คะแนนความมั่นใจ `p` จะถูกจริงในสัดส่วน `p` — ถ้าโมเดลมั่นใจเกินจริง (overconfident) สูตร EV จะประเมินกำไรสูงเกินจริงและตัดสินใจผิดพลาด",
      ),
      mc(
        "d039-q4",
        "ถ้า `gain = 20` บาท, `cost = 80` บาท และทิกเก็ตใบหนึ่งมี calibrated probability `p = 0.70` ค่า `EV_auto` เป็นเท่าไร และระบบควรทำอย่างไร?",
        [
          ["`EV = +14.0` บาท → ควร `auto_reply`", "ผิด — ลืมลบเทอมความเสียหาย `-(1 - 0.70) × 80 = -24.0`"],
          ["`EV = -10.0` บาท → ควร `escalate` ส่งต่อเจ้าหน้าที่", "ถูก — `0.70(20) - 0.30(80) = 14 - 24 = -10` บาท จึงควรส่งต่อคน (`EV = 0`)"],
          ["`EV = +10.0` บาท → ควร `auto_reply`", "ผิด — สลับเครื่องหมายผลลัพธ์"],
          ["`EV = 0.0` บาท → ทำแบบไหนก็ได้", "จุดคุ้มทุนคือ `80 / 100 = 0.80` ไม่ใช่ `0.70`"],
        ],
        "B",
        "`EV_auto = 0.70 × 20 - 0.30 × 80 = 14 - 24 = -10` บาท ซึ่งต่ำกว่าการส่งต่อเจ้าหน้าที่ (`0` บาท) จึงต้องเลือก `escalate`",
        "วิธีคำนวณ `EV_auto` เมื่อรู้ `p`, `gain` และ `cost` คืออะไร?",
        "`EV_auto = p * gain - (1 - p) * cost` — เลือกตอบอัตโนมัติเมื่อ `EV_auto >= 0` และส่งต่อเจ้าหน้าที่เมื่อ `EV_auto < 0`",
      ),
    ],
  },

  takeaways: [
    "อย่าสลับ `P(Flag | Positive)` กับ `P(Positive | Flag)` — เมื่อ **Base Rate** ต่ำมาก อัตราแจ้งเตือนผิด (False Positive) จะพุ่งสูงเกินคาดเสมอ",
    "**Raw Confidence ≠ Calibrated Probability** ต้องตรวจบนชุดทดสอบจริงก่อนว่าเคสที่โมเดลมั่นใจ `0.85` ถูกจริง ~85% หรือไม่",
    "ใช้สูตร **{{expected-value}}** (`EV = p·gain - (1-p)·cost`) และจุดคุ้มทุน **`p* = cost / (gain + cost)`** แทนการเดา threshold `0.50` เพื่อตัดสินใจ Auto-Reply vs {{hitl}}",
    "สรุปการแจกแจงข้อมูลระบบ AI ด้วย **Percentiles (`P50`, `P90`, `P95`)** ควบคู่กับค่าเฉลี่ยเพื่อไม่ให้หางของการแจกแจงซ่อนปัญหา",
  ],

  reviewCards: [
    rc(
      "d039-rc-1",
      "หาก AI ตอบถูกประหยัดได้ `G` บาท แต่ตอบผิดเสียหาย `C` บาท จุดคุ้มทุน `p*` สำหรับเปิด Auto-Reply คือเท่าไร?",
      "`p* = C / (G + C)` — เพราะที่จุดนี้ `p*·G - (1 - p*)·C = 0`",
    ),
    rc(
      "d039-rc-2",
      "ทำไมโมเดลที่ Overconfident (เช่น พูดว่ามั่นใจ 90% แต่ถูกจริง 65%) จึงทำให้ระบบ Routing แบบ Expected Value พัง?",
      "เพราะสูตร EV จะคำนวณมูลค่าคาดหวังสูงเกินจริง ทำให้ปล่อย Auto-Reply ในเคสที่จริง ๆ แล้วขาดทุนเชิงสถิติ",
    ),
    rc(
      "d039-rc-3",
      "ทำไมการรายงาน Latency หรือ Score ของระบบ AI ควรใช้ `P50` และ `P95` มากกว่าดูแค่ค่าเฉลี่ย (`mean`)?",
      "เพราะการแจกแจงในระบบจริงมักเบ้ (skewed) ค่าเฉลี่ยเพียงตัวเดียวถูกค่าสุดโต่งดึงได้ง่ายและไม่สะท้อนประสบการณ์ของกลุ่มผู้ใช้ 5% ที่ช้าที่สุด",
    ),
  ],

  sources: [
    {
      label: "NumPy Reference — Statistics & Percentiles (numpy.percentile)",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.percentile.html",
    },
    {
      label: "scikit-learn User Guide — Probability Calibration",
      href: "https://scikit-learn.org/stable/modules/calibration.html",
    },
    {
      label: "Google ML Crash Course — Classification Thresholding & Metrics",
      href: "https://developers.google.com/machine-learning/crash-course/classification/thresholding",
    },
    {
      label: "Wikipedia — Expected Value & Decision Theory",
      href: "https://en.wikipedia.org/wiki/Expected_value",
    },
  ],

  glossary: [
    "expected-value",
    "precision-recall",
    "hitl",
    "hallucination",
    "fail-fast",
    "pytest",
    "ruff",
    "uv",
  ],
});
