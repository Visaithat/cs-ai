import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D046 — Phase 2 / Block B12
 * Regression Metrics (MAE, RMSE) & Error Analysis
 */
export const d046: Lesson = defineLesson({
  day: 46,
  titleTh: "วัดผลโมเดลทำนายตัวเลข (MAE vs RMSE) และวิเคราะห์ความคลาดเคลื่อนรายกลุ่ม",
  tagline: "30 นาที · รันบน CPU 100% ไม่ใช้ API key · เลือก MAE หรือ RMSE ให้ตรงความเสี่ยง และผ่า Residual เพื่อหาอคติซ่อนเร้น",
  icon: "trending-up",
  visual: {
    id: "regression-residuals",
    title: "MAE vs RMSE — ทำไม Outlier แค่ตัวเดียวจึงดึง RMSE พุ่งแรง",
    caption: "กดสลับเคสปกติกับเคสที่มี Outlier 1 ตัวเพื่อเห็นผลต่อ MAE, RMSE และกราฟ Residual",
    alt: "แผนภาพเปรียบเทียบ MAE และ RMSE เมื่อมี outlier",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "Polars", "NumPy", "uv", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "เปลี่ยนปัญหาธุรกิจเป็นตัวเลขต่อเนื่อง (Regression)",
      body: "ไม่ใช่ทุกปัญหา AI ที่ตอบแค่ใช่/ไม่ใช่ — หลายงานต้องทำนายตัวเลขจริง เช่น ทิกเก็ตนี้จะใช้เวลาปิดกี่ชั่วโมง, API latency จะพุ่งไปกี่มิลลิวินาที หรือคำสั่งซื้อรอบหน้าจะมียอดกี่บาท",
      lessonNote: "วันนี้เราเรียนรู้วิธีวัดความคลาดเคลื่อนของงานทำนายตัวเลขให้ตรงกับผลกระทบจริงต่อธุรกิจ",
    },
    {
      node: 2,
      heading: "เข้าใจจุดอ่อนของโมเดลหลังทำนายเสร็จ",
      body: "โมเดล Regression จาก {{sklearn-pipeline}} หรือ {{lightgbm}} จะปรับพารามิเตอร์ให้ลดฟังก์ชัน loss รวมทั้งหมด แต่ตัวเลขสรุปรวมตัวเดียวไม่เคยบอกเราว่าโมเดลทายพลาดหนักที่สุดที่ข้อมูลกลุ่มไหน",
      lessonNote: "การเก็บ `residual = y_true - y_pred` ควบคู่กับฟีเจอร์ต้นทางช่วยชี้เป้าว่าควรเพิ่มฟีเจอร์อะไรในรอบถัดไป",
    },
    {
      node: 3,
      heading: "วัดผลด้วย MAE คู่ RMSE และทำ Sliced Error Analysis",
      body: "ตัวเลขเฉลี่ยทั้งก้อนอาจกลบความเสียหายเฉพาะกลุ่ม เช่น โมเดลทำนายเวลาปิดทิกเก็ตเฉลี่ยคลาดเคลื่อนแค่ 1 ชั่วโมง แต่เฉพาะหมวด `billing` กลับทายต่ำกว่าความจริงถึง 4 ชั่วโมงทุกใบ",
      lessonNote: "ใช้ {{mae-rmse|MAE และ RMSE}} จับสัญญาณ outlier แล้วผ่า Residual แยกตาม segment ด้วย {{polars}}",
    },
    {
      node: 5,
      heading: "ตรวจจับความเพี้ยนเฉพาะกลุ่มใน Production",
      body: "เมื่อพฤติกรรมลูกค้าเปลี่ยนหรือเกิด {{feature-drift}} ความผิดพลาดมักโผล่ในบางกลุ่มก่อน (เช่น ลูกค้าองค์กรหรือช่วงแคมเปญใหญ่) การมอนิเตอร์ error แยกตาม segment จึงจับปัญหาได้เร็วกว่าดูค่าเฉลี่ยรวม",
      lessonNote: "ฟังก์ชัน Residual Slicing ที่เขียนวันนี้สามารถต่อเข้าแดชบอร์ดตรวจสอบคุณภาพโมเดลได้ทันที",
    },
  ],

  objectives: [
    "**คำนวณและตีความ** {{mae-rmse|MAE และ RMSE}} พร้อมอธิบายได้ทันทีว่าทำไม **Outlier เพียงตัวเดียว** จึงดึง RMSE พุ่งสูงกว่า MAE อย่างชัดเจน",
    "**เลือกใช้ MAE หรือ RMSE** ให้สอดคล้องกับความเสี่ยงของปัญหาจริง (เช่น ประมาณการเวลา SLA, API latency, ยอดคำสั่งซื้อ)",
    "**ทำ Residual Error Analysis แยกตาม Segment** (`residual = y_true - y_pred`) ด้วย {{polars}} เพื่อตรวจหา Systematic Bias (ทายสูงเกินหรือต่ำเกินอย่างเป็นระบบในกลุ่มใดกลุ่มหนึ่ง)",
  ],

  prerequisites: [
    "ผ่าน Day 33 ({{polars}} `with_columns`, `group_by`, `agg`) และ Day 42 (Train/Val/Test split)",
    "เข้าใจแนวคิดการประเมินผลแยกชุดข้อมูลโดยไม่เกิด {{data-leakage}}",
    "ใช้ `uv`, `pytest` และ NumPy พื้นฐานได้",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่ด้วย {{uv}} แล้วติดตั้ง `scikit-learn`, `polars` และ `numpy` สำหรับคำนวณ Regression metrics และผ่าความผิดพลาดรายกลุ่ม",
    commands: `uv init ai-day46 && cd ai-day46
uv add scikit-learn polars numpy
uv add --dev pytest ruff
uv run python -c "from sklearn.metrics import mean_absolute_error, root_mean_squared_error; print('Ready!')"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day46` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `scikit-learn`, `polars`, `numpy`, `pytest`, `ruff` สำเร็จ"],
      ["verify", "อิมพอร์ต `mean_absolute_error` และ `root_mean_squared_error` ได้โดยไม่มี error"],
    ],
    note: "ใน `scikit-learn >= 1.4` ให้ใช้ `root_mean_squared_error(y_true, y_pred)` โดยตรงแทนรูปแบบเก่า `mean_squared_error(..., squared=False)` ที่ถูกถอดออกแล้ว",
  },

  concepts: [
    {
      id: "mae-vs-rmse-intuition",
      title: "1 · MAE vs RMSE — หน่วยเดียวกันแต่บทลงโทษต่างกันมาก",
      paragraphs: [
        "เมื่อโมเดลทำนายตัวเลขต่อเนื่อง (เช่น เวลาปิดทิกเก็ตเป็นชั่วโมง หรือราคาเป็นบาท) ความคลาดเคลื่อนของแต่ละแถวคือ **Residual (`e_i = y_true_i - y_pred_i`)** วิธีสรุปความคลาดเคลื่อนทั้งชุดที่วิศวกร AI ใช้ทุกวันมี 2 ตัวหลักคือ **MAE** และ **RMSE** ซึ่งทั้งคู่มี **หน่วยเดียวกับค่าเป้าหมาย** (เช่น ชั่วโมง หรือ บาท) จึงสื่อสารกับทีมธุรกิจได้ทันที",
        "**MAE (Mean Absolute Error)** คิดค่าเฉลี่ยของ `|y_true - y_pred|` ตรง ๆ ทุกความผิดพลาดมีน้ำหนักเท่ากันเป็นเส้นตรง — พลาด 10 ชั่วโมงถือว่าหนักเป็น 2 เท่าของพลาด 5 ชั่วโมง",
        "**RMSE (Root Mean Squared Error)** นำความผิดพลาดมายกกำลังสองก่อนเฉลี่ยแล้วค่อยถอดรากที่สอง `sqrt(mean((y_true - y_pred)^2))` การยกกำลังสองทำให้ **ความผิดพลาดก้อนใหญ่ (Outlier) ถูกลงโทษหนักแบบทวีคูณ**: พลาด 10 ชั่วโมงสร้าง squared error `100` ซึ่งหนักกว่าพลาด 2 ชั่วโมง (`4`) ถึง **25 เท่า**! จึงมีกฎทางคณิตศาสตร์เสมอว่า `RMSE >= MAE` และหากอัตราส่วน `RMSE / MAE` สูงเกิน `1.4–1.5` นั่นคือสัญญาณเตือนว่าโมเดลมีเคสที่ทายหลุดหนักซ่อนอยู่",
      ],
      analogy:
        "เหมือนวัดเวลาส่งอาหารช้าของร้านเดลิเวอรี: **MAE** บอกว่าเฉลี่ยส่งช้ากี่นาที ส่วน **RMSE** จะร้องเตือนเสียงดังทันทีถ้ามีลูกค้าสักคนที่ต้องรออาหารนานถึง 3 ชั่วโมง แม้ลูกค้าคนอื่นจะได้รับตรงเวลาหมดก็ตาม",
      code: {
        language: "python",
        filename: "mae_vs_rmse_outlier.py",
        code: `import numpy as np
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

# ทิกเก็ต 5 ใบ: เคสปกติ โมเดลทายคลาดเคลื่อนใบละ 0.5 ชม. เท่ากันหมด
y_true_clean = np.array([2.0, 4.0, 3.0, 5.0, 6.0])
y_pred = np.array([2.5, 3.5, 3.5, 4.5, 5.5])

# เคสมี Outlier 1 ใบ: ใบที่ 5 ใช้เวลาจริง 16.0 ชม. (พลาดไป +10.5 ชม.)
y_true_outlier = np.array([2.0, 4.0, 3.0, 5.0, 16.0])

for label, yt in [("Clean  ", y_true_clean), ("Outlier", y_true_outlier)]:
    mae = mean_absolute_error(yt, y_pred)
    rmse = root_mean_squared_error(yt, y_pred)
    print(f"{label} | MAE={mae:.2f} hrs | RMSE={rmse:.2f} hrs | RMSE/MAE={rmse / mae:.2f}x")`,
        caption: "เมื่อทุกเคสพลาดเท่ากัน RMSE จะเท่ากับ MAE เป๊ะ แต่พอมี Outlier แค่ 1 ใน 5 ใบ RMSE พุ่งไปเกือบ 2 เท่าของ MAE",
      },
      whyTitle: "Why this matters — รายงานคู่กันเสมอเพื่อไม่ให้ตัวเองถูกหลอก",
      whyParagraphs: [
        "ถ้าคุณรายงานแค่ MAE = 2.5 ชั่วโมง ผู้จัดการอาจนึกว่าทิกเก็ตทุกใบคลาดเคลื่อนแถว ๆ 2–3 ชั่วโมง ทั้งที่ความจริงมีบางเคสหลุดไปเกิน 10 ชั่วโมงจนลูกค้าโวยวายแล้ว",
        "ในทางกลับกันถ้าดูแค่ RMSE อย่างเดียว คุณอาจตกใจและพยายามแก้โมเดลให้วิ่งตามข้อมูลขยะ (label error) เพียง 2 แถว — การดู **MAE คู่ RMSE** จึงเหมือนมีทั้งกล้องมุมกว้างและไฟแจ้งเตือนเคสสุดโต่งพร้อมกัน",
      ],
    },
    {
      id: "choosing-metric-by-business",
      title: "2 · เลือก Metric ให้ตรงความเสี่ยงธุรกิจ (MAE vs RMSE vs Median AE)",
      paragraphs: [
        "คำถามสัมภาษณ์และคำถามหน้างานที่พบบ่อยมากคือ *\"งานนี้ควร optimize ด้วย MAE หรือ RMSE?\"* คำตอบไม่ได้อยู่ที่สูตรคณิตศาสตร์ แต่ขึ้นกับ **รูปร่างของต้นทุนความเสียหายเมื่อทายพลาด**",
        "เลือกเน้น **RMSE** เมื่อความผิดพลาดขนาดใหญ่สร้างความเสียหายหนักกว่าความผิดพลาดเล็ก ๆ หลายครั้งรวมกัน เช่น การพยากรณ์เวลาปิดงานตามสัญญา SLA (ช้าเกิน 8 ชม. โดนปรับหนัก), พยากรณ์โหลดเซิร์ฟเวอร์ (พลาดหนัก 1 ครั้งระบบล่มทั้งเว็บ), หรือประมาณการงบประมาณโครงการใหญ่",
        "เลือกเน้น **MAE** (หรือดูคู่ **Median Absolute Error**) เมื่อความเสียหายโตเป็นเส้นตรงตามขนาดความผิดพลาด หรือชุดข้อมูลมี outlier แท้จริงที่คาดเดาไม่ได้ (เช่น ลูกค้า 1 คนสั่งซื้อเหมาล็อต 500,000 บาทในร้านค้าปลีกทั่วไป) เพราะการบังคับโมเดลให้ลด RMSE อาจดึงค่าทำนายของลูกค้าปกติทุกคนให้เพี้ยนสูงตาม outlier ไปด้วย",
      ],
      analogy:
        "เหมือนการทำประกันภัย: ถ้ากลัวอุบัติเหตุใหญ่ครั้งเดียวหมดตัวให้คุมความเสี่ยงด้วย RMSE แต่ถ้าต้องการประเมินค่าใช้จ่ายประจำวันของคนทั่วไปไม่ให้มหาเศรษฐี 1 คนมาดึงค่าเฉลี่ยเพี้ยน ให้ใช้ MAE หรือค่ามัธยฐาน",
      bullets: [
        "**MAE** — สะท้อน 'ความคลาดเคลื่อนโดยทั่วไป' ทนต่อ outlier และสอดคล้องกับค่ามัธยฐาน (median)",
        "**RMSE** — สะท้อน 'ความเสี่ยงจากเคสหลุดหนัก' ไวต่อ outlier และสอดคล้องกับค่าเฉลี่ย (mean)",
        "**R² (`r2_score`)** — บอกสัดส่วนความแปรปรวนที่โมเดลอธิบายได้เทียบกับโมเดลที่ทายแค่ค่าเฉลี่ย (ถ้า `R² < 0` แปลว่าโมเดลแย่กว่าการเดาด้วยค่าเฉลี่ยธรรมดา!)",
      ],
      whyTitle: "Why this matters — เชื่อมโยงไปถึง Objective Function ของโมเดล",
      whyParagraphs: [
        "ใน Day 47 เมื่อเราเทรน {{lightgbm}} (`LGBMRegressor`) เราสามารถเลือก `objective=\"regression\"` (ลด L2/RMSE) หรือ `objective=\"regression_l1\"` (ลด L1/MAE) ให้ตรงกับตัวชี้วัดธุรกิจได้เลย",
        "การตั้ง metric และ loss function ให้สอดคล้องกันตั้งแต่ต้นช่วยให้ทีมไม่เสียเวลาจูนโมเดลไปคนละทิศกับเป้าหมายจริง",
      ],
    },
    {
      id: "residual-error-analysis",
      title: "3 · Residual Error Analysis — ผ่าความผิดพลาดแยกตามกลุ่มเพื่อจับ Systematic Bias",
      paragraphs: [
        "นิยามของ **Residual** คือ `residual = y_true - y_pred` สังเกตเครื่องหมายให้แม่น: ถ้า `residual > 0` แปลว่าของจริงมากกว่าที่ทาย (**โมเดลทายต่ำเกินไป / under-predict**) แต่ถ้า `residual < 0` แปลว่าของจริงน้อยกว่าที่ทาย (**โมเดลทายสูงเกินไป / over-predict**)",
        "ความผิดพลาดที่อันตรายที่สุดในระบบจริงมักไม่ใช่นอยส์แบบสุ่ม แต่คือ **Systematic Bias** — โมเดลทายพลาดไปในทิศทางเดียวกันซ้ำ ๆ เฉพาะบางกลุ่มข้อมูล เช่น โมเดลทำนายเวลาตอบทิกเก็ตมีค่าเฉลี่ย Residual รวมใกล้ `0.0` ดูเหมือนไม่มีอคติ แต่พอแยกตามหมวดหมู่ด้วย {{polars}} กลับพบว่าหมวด `billing` มี Mean Residual = `+3.5 ชม.` (ทายเร็วเกินจริงตลอด) ส่วนหมวด `delivery` มี Mean Residual = `-2.0 ชม.` (ทายช้าเกินจริงตลอด) จนบวกลบกันหายไปในภาพรวม!",
        "ขั้นตอน Error Analysis ที่วิศวกร AI ทำเป็นประจำคือ: (1) สรุป `MAE`, `RMSE` และ `Mean Residual (Bias)` แยกตาม segment สำคัญ (เช่น หมวดหมู่, ช่องทาง, ระดับลูกค้า, ช่วงเวลา) และ (2) ดึง **Top-K worst errors** มาเปิดอ่านดูข้อมูลดิบด้วยตา เพื่อหาว่าฟีเจอร์ไหนหายไปหรือ label ไหนผิด",
      ],
      analogy:
        "เหมือนเชฟชิมซุปหม้อใหญ่แล้วคิดว่าเค็มพอดี แต่จริง ๆ เกลือไปกองเค็มปี๋อยู่ก้นหม้อส่วนด้านบนจืดสนิท — ถ้าไม่ตักแยกชั้นชิม (slice by segment) ไม่มีทางรู้เลย",
      bullets: [
        "`mean(y_true - y_pred) ≈ 0` ไม่ได้แปลว่าโมเดลแม่น — อาจแค่ทายสูงเกินครึ่งหนึ่งและทายต่ำเกินอีกครึ่งหนึ่ง",
        "`mean(residual) > 0` ในกลุ่มใดกลุ่มหนึ่ง = under-predict (ต้องเช็กว่ากลุ่มนั้นมีปัจจัยช้าเฉพาะตัวที่ยังไม่ใส่เป็นฟีเจอร์หรือไม่)",
        "Inspect **Top-5 largest |residual|** เสมอก่อนเปลี่ยนอัลกอริทึม — หลายครั้งปัญหาคือ data quality หรือ missing feature ไม่ใช่โมเดลอ่อน",
      ],
      whyTitle: "Why this matters — Error Analysis คือทางลัดพัฒนาโมเดลที่คุ้มค่าที่สุด",
      whyParagraphs: [
        "มือใหม่มักลองเปลี่ยนโมเดลไปเรื่อย ๆ เมื่อค่า RMSE สูง แต่มืออาชีพจะผ่า Residual ดู 10 เคสที่พังหนักที่สุดก่อนภายใน 5 นาที หลายครั้งแค่เพิ่มฟีเจอร์ง่าย ๆ 1 ตัว (เช่น `is_weekend` หรือ `needs_finance_approval`) ลด RMSE ได้มากกว่าการจูน hyperparameter ทั้งวัน",
        "นิสัยการผ่า error แยกกลุ่มนี้เราจะนำไปใช้ต่อทันทีใน Day 57 (Error Analysis on Misclassified Thai Tickets) และใน Phase 5 ตอนวิเคราะห์ผล eval ของระบบ LLM/RAG",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ MAE/RMSE และ Slicing กับ API Latency Monitoring",
      body: [
        "ถ้าคุณเคยดูกราฟ API latency ใน production คุณรู้ดีว่าค่าเฉลี่ยรวมอย่างเดียวหลอกตาได้ง่ายแค่ไหน — หลักการเดียวกับ Regression Error Analysis เป๊ะ:",
      ],
      table: [
        ["MAE (ค่าคลาดเคลื่อนเฉลี่ย)", "Average latency (ดูภาพรวมปกติ แต่ซ่อน spike)"],
        ["RMSE (ลงโทษ outlier หนัก)", "คล้าย P99 latency alert ที่เตือนทันทีเมื่อมี request ช้าสุดโต่ง"],
        ["Residual = y_true - y_pred", "ส่วนต่างระหว่าง SLA จริงกับเวลาที่ระบบประเมินไว้"],
        ["Slice Residual by category", "Breakdown latency ตาม endpoint / region เพื่อหาจุดคอขวด"],
      ],
    },
    student: {
      title: "First-Year Note — ระวังเครื่องหมายของ Residual และอย่าลืมถอดรากใน RMSE",
      body: [
        "เวลาคำนวณ `residual = y_true - y_pred` จำง่าย ๆ ว่า **'จริง ลบ ทาย'** — ถ้าเวลาจริง 8 ชม. แต่โมเดลทาย 5 ชม. จะได้ `+3 ชม.` แปลว่าความจริงสูงกว่าที่ทายไว้ 3 ชม. (โมเดลทายต่ำเกินไป)",
        "ส่วน **MSE** (Mean Squared Error) มีหน่วยเป็นกำลังสอง เช่น 'ชั่วโมง²' หรือ 'บาท²' ซึ่งคนอ่านไม่เข้าใจ เราจึงถอดรากเป็น **RMSE** เพื่อดึงกลับมาเป็นหน่วยเดิม ('ชั่วโมง' หรือ 'บาท') ให้เทียบกับ **MAE** ได้ตรง ๆ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีผลทำนายเวลาปิดทิกเก็ตซัพพอร์ต (หน่วย: ชั่วโมง) บนชุด Validation 9 ใบ จาก 3 หมวด (`billing`, `delivery`, `technical`) มาลองวัด MAE vs RMSE ภาพรวม แล้วผ่า Residual ด้วย Polars เพื่อดูว่าความผิดพลาดซ่อนอยู่หมวดไหน",
    steps: [
      {
        title: "1 · สร้างตารางผลทำนายและวัด MAE / RMSE ภาพรวม",
        explain:
          "เริ่มจากคำนวณ `MAE`, `RMSE`, อัตราส่วน `RMSE/MAE` และ `Mean Residual (Bias)` รวมทั้งชุดด้วย `scikit-learn`",
        code: {
          language: "python",
          filename: "worked_day46.py",
          code: `import polars as pl
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

df = pl.DataFrame({
    "ticket_id": [f"T-{i:02d}" for i in range(1, 10)],
    "category": [
        "billing", "billing", "billing",
        "delivery", "delivery", "delivery",
        "technical", "technical", "technical",
    ],
    "y_true": [8.0, 9.0, 7.0, 2.0, 3.0, 2.5, 4.0, 5.0, 15.0],
    "y_pred": [4.5, 5.5, 3.5, 2.2, 3.0, 2.6, 4.0, 4.8, 5.0],
})

mae = mean_absolute_error(df["y_true"], df["y_pred"])
rmse = root_mean_squared_error(df["y_true"], df["y_pred"])
bias = float((df["y_true"] - df["y_pred"]).mean())

print(f"Overall MAE  : {mae:.2f} hrs")
print(f"Overall RMSE : {rmse:.2f} hrs (RMSE/MAE = {rmse / mae:.2f}x)")
print(f"Overall Bias : {bias:+.2f} hrs")`,
        },
        output: `Overall MAE  : 2.33 hrs
Overall RMSE : 3.92 hrs (RMSE/MAE = 1.68x)
Overall Bias : +2.27 hrs`,
      },
      {
        title: "2 · ผ่า Residual แยกตามหมวดหมู่ด้วย Polars",
        explain:
          "อัตราส่วน `RMSE/MAE = 1.68x` บ่งชี้ว่ามี outlier และ `Overall Bias = +2.27` แสดงว่าโมเดลทายต่ำเกินจริงโดยรวม ลองแยกกลุ่มด้วย Polars เพื่อหาต้นเหตุที่แท้จริง",
        code: {
          language: "python",
          filename: "worked_day46.py",
          code: `with_err = df.with_columns(
    (pl.col("y_true") - pl.col("y_pred")).alias("residual"),
    (pl.col("y_true") - pl.col("y_pred")).abs().alias("abs_error"),
    ((pl.col("y_true") - pl.col("y_pred")) ** 2).alias("sq_error"),
)

by_cat = (
    with_err.group_by("category")
    .agg(
        pl.len().alias("n"),
        pl.col("abs_error").mean().round(2).alias("mae"),
        pl.col("sq_error").mean().sqrt().round(2).alias("rmse"),
        pl.col("residual").mean().round(2).alias("mean_residual"),
    )
    .sort("rmse", descending=True)
)
print(by_cat)`,
        },
        output: `shape: (3, 5)
┌───────────┬─────┬──────┬──────┬───────────────┐
│ category  ┆ n   ┆ mae  ┆ rmse ┆ mean_residual │
│ ---       ┆ --- ┆ ---  ┆ ---  ┆ ---           │
│ str       ┆ u32 ┆ f64  ┆ f64  ┆ f64           │
╞═══════════╪═════╪══════╪══════╪═══════════════╡
│ technical ┆ 3   ┆ 3.4  ┆ 5.77 ┆ 3.4           │
│ billing   ┆ 3   ┆ 3.5  ┆ 3.5  ┆ 3.5           │
│ delivery  ┆ 3   ┆ 0.1  ┆ 0.13 ┆ -0.1          │
└───────────┴─────┴──────┴──────┴───────────────┘`,
      },
      {
        title: "3 · ดึง Top-3 Worst Errors มาดูรายเคสเพื่อแยก Outlier ออกจาก Systematic Bias",
        explain:
          "สังเกตความต่างที่ชัดเจนในตารางขั้นที่ 2: หมวด `billing` มี `MAE == RMSE == 3.5` และ `mean_residual = +3.5` (ทุกใบพลาด +3.5 ชม. เท่ากัน = Systematic Bias!) ส่วนหมวด `technical` มี `RMSE (5.77) >> MAE (3.40)` เพราะมีเคส outlier เพียงใบเดียว มาดึง Top-3 ดูยืนยัน",
        code: {
          language: "python",
          filename: "worked_day46.py",
          code: `worst = with_err.sort("abs_error", descending=True).select(
    "ticket_id", "category", "y_true", "y_pred", "residual"
).head(3)
print(worst)`,
        },
        output: `shape: (3, 5)
┌───────────┬───────────┬────────┬────────┬──────────┐
│ ticket_id ┆ category  ┆ y_true ┆ y_pred ┆ residual │
│ ---       ┆ ---       ┆ ---    ┆ ---    ┆ ---      │
│ str       ┆ str       ┆ f64    ┆ f64    ┆ f64      │
╞═══════════╪═══════════╪════════╪════════╪══════════╡
│ T-09      ┆ technical ┆ 15.0   ┆ 5.0    ┆ 10.0     │
│ T-01      ┆ billing   ┆ 8.0    ┆ 4.5    ┆ 3.5      │
│ T-02      ┆ billing   ┆ 9.0    ┆ 5.5    ┆ 3.5      │
└───────────┴───────────┴────────┴────────┴──────────┘`,
      },
    ],
    gotcha:
      "จุดสังเกตสำคัญ: หมวด `billing` กับ `technical` ต้องการวิธีแก้คนละแบบ! `billing` เป็น Systematic Bias (เช่น ลืมฟีเจอร์ว่ารอฝ่ายบัญชีอนุมัติ) ส่วน `T-09` ใน `technical` เป็น Outlier เดี่ยว (อาจเป็นเคสระบบล่มหรือข้อมูลบันทึกเวลาผิด) — ถ้าไม่ผ่า Residual คุณจะไม่มีวันเห็นความต่างนี้เลย",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างเครื่องมือวิเคราะห์ความคลาดเคลื่อนของโมเดล Regression ใน `regression_eval.py` ที่คำนวณ MAE/RMSE ภาพรวม, ผ่า error แยกตาม segment ด้วย Polars และดึงเคสที่พลาดหนักที่สุดมาตรวจสอบ",
    requirements: [
      "`compute_regression_metrics(y_true: list[float] | np.ndarray, y_pred: list[float] | np.ndarray) -> dict[str, float]`: ตรวจว่าความยาวเท่ากันและไม่ว่าง (ไม่งั้น `raise ValueError`) แล้วคืน dict 4 คีย์: `mae`, `rmse`, `mean_residual` (`mean(y_true - y_pred)`), และ `rmse_to_mae_ratio` (`rmse / mae` หรือ `0.0` ถ้า `mae == 0.0`)",
      "`slice_error_by_segment(df: pl.DataFrame, group_col: str, true_col: str = \"y_true\", pred_col: str = \"y_pred\") -> pl.DataFrame`: คำนวณสรุปรายกลุ่มด้วย Polars โดยมีคอลัมน์เรียงตามนี้: `[group_col, \"count\", \"mae\", \"rmse\", \"mean_residual\"]` ปัด `mae`, `rmse`, `mean_residual` ไว้ 4 ตำแหน่ง และเรียงตาม `rmse` จากมากไปน้อย (ถ้าเท่ากันเรียง `group_col` จากน้อยไปมาก)",
      "`top_k_worst_errors(df: pl.DataFrame, k: int = 3, true_col: str = \"y_true\", pred_col: str = \"y_pred\") -> pl.DataFrame`: เพิ่มคอลัมน์ `residual` (`y_true - y_pred`) และ `abs_error` (`|residual|`) แล้วคืนเฉพาะ `k` แถวที่ `abs_error` สูงสุดเรียงจากมากไปน้อย (ถ้า `k <= 0` ให้ `raise ValueError`)",
    ],
    starter: {
      language: "python",
      filename: "regression_eval.py",
      code: `import numpy as np
import polars as pl
from sklearn.metrics import mean_absolute_error, root_mean_squared_error


def compute_regression_metrics(
    y_true: list[float] | np.ndarray,
    y_pred: list[float] | np.ndarray,
) -> dict[str, float]:
    """คำนวณ MAE, RMSE, mean_residual และอัตราส่วน RMSE/MAE"""
    # TODO: ตรวจ input และคำนวณ metrics ทั้ง 4 ตัว
    raise NotImplementedError


def slice_error_by_segment(
    df: pl.DataFrame,
    group_col: str,
    true_col: str = "y_true",
    pred_col: str = "y_pred",
) -> pl.DataFrame:
    """สรุป count, mae, rmse, mean_residual แยกตาม group_col เรียงตาม rmse มากไปน้อย"""
    # TODO: ใช้ Polars with_columns -> group_by -> agg -> sort
    raise NotImplementedError


def top_k_worst_errors(
    df: pl.DataFrame,
    k: int = 3,
    true_col: str = "y_true",
    pred_col: str = "y_pred",
) -> pl.DataFrame:
    """คืน k แถวที่มี |y_true - y_pred| สูงสุดพร้อมคอลัมน์ residual และ abs_error"""
    # TODO: ตรวจ k > 0 แล้วเพิ่มคอลัมน์ residual, abs_error พร้อม sort และ head(k)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day46.py",
      code: `import polars as pl
import pytest
from regression_eval import (
    compute_regression_metrics,
    slice_error_by_segment,
    top_k_worst_errors,
)


def test_compute_metrics_clean_and_outlier():
    clean = compute_regression_metrics([2.0, 4.0, 3.0, 5.0, 6.0], [2.5, 3.5, 3.5, 4.5, 5.5])
    assert clean["mae"] == pytest.approx(0.5)
    assert clean["rmse"] == pytest.approx(0.5)
    assert clean["rmse_to_mae_ratio"] == pytest.approx(1.0)
    assert clean["mean_residual"] == pytest.approx(0.1)

    outlier = compute_regression_metrics([2.0, 4.0, 3.0, 5.0, 16.0], [2.5, 3.5, 3.5, 4.5, 5.5])
    assert outlier["mae"] == pytest.approx(2.5)
    assert outlier["rmse"] == pytest.approx(4.71699, rel=1e-4)
    assert outlier["rmse_to_mae_ratio"] > 1.8

    perfect = compute_regression_metrics([1.0, 2.0], [1.0, 2.0])
    assert perfect["rmse_to_mae_ratio"] == 0.0


def test_validation_errors():
    with pytest.raises(ValueError):
        compute_regression_metrics([], [])
    with pytest.raises(ValueError):
        compute_regression_metrics([1.0, 2.0], [1.0])


def test_slice_error_by_segment_and_top_k():
    df = pl.DataFrame({
        "ticket_id": ["T1", "T2", "T3", "T4", "T5", "T6"],
        "segment": ["vip", "vip", "standard", "standard", "enterprise", "enterprise"],
        "y_true": [10.0, 12.0, 4.0, 4.0, 5.0, 15.0],
        "y_pred": [6.0, 8.0, 4.5, 3.5, 5.0, 5.0],
    })

    sliced = slice_error_by_segment(df, "segment")
    assert sliced.columns == ["segment", "count", "mae", "rmse", "mean_residual"]
    rows = sliced.to_dicts()

    # enterprise: errors 0 and +10 -> mae=5.0, rmse=sqrt(50)=7.0711, mean_res=+5.0
    assert rows[0]["segment"] == "enterprise"
    assert rows[0]["mae"] == pytest.approx(5.0)
    assert rows[0]["rmse"] == pytest.approx(7.0711, rel=1e-4)

    # vip: errors +4 and +4 -> mae=4.0, rmse=4.0, mean_res=+4.0 (systematic under-prediction)
    assert rows[1]["segment"] == "vip"
    assert rows[1]["mae"] == pytest.approx(4.0)
    assert rows[1]["rmse"] == pytest.approx(4.0)
    assert rows[1]["mean_residual"] == pytest.approx(4.0)

    # standard: errors -0.5 and +0.5 -> mae=0.5, rmse=0.5, mean_res=0.0
    assert rows[2]["segment"] == "standard"
    assert rows[2]["mean_residual"] == pytest.approx(0.0)

    worst = top_k_worst_errors(df, k=2)
    assert worst["ticket_id"].to_list() == ["T6", "T1"] or worst["abs_error"].to_list() == [10.0, 4.0]
    assert worst["residual"][0] == pytest.approx(10.0)

    with pytest.raises(ValueError):
        top_k_worst_errors(df, k=0)
`,
    },
    selfCheck: [
      "`compute_regression_metrics` ใช้ `root_mean_squared_error` (ไม่ติด deprecation warning) และจัดการกรณี `mae == 0.0` ได้โดยไม่หารด้วยศูนย์",
      "`slice_error_by_segment` ใช้ Polars Expression คำนวณ `count`, `mae`, `rmse`, `mean_residual` พร้อม `.sort([\"rmse\", group_col], descending=[True, False])`",
      "`top_k_worst_errors` เรียงตาม `abs_error` จากมากไปน้อยและยังคงเครื่องหมายของ `residual` ไว้เพื่อบอกทิศทาง under/over-prediction",
      "รัน `uv run pytest -q` ผ่านทั้ง 3 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 3 test functions ใน `test_day46.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `compute_regression_metrics` แปลงอินพุตด้วย `np.asarray(..., dtype=float)` แล้วคำนวณ `residual = yt - yp`, `mae = float(mean_absolute_error(yt, yp))`, `rmse = float(root_mean_squared_error(yt, yp))`",
      },
      {
        body: "ใน Polars คำนวณ RMSE ระดับกลุ่มได้ในหนึ่ง expression ด้วย `((pl.col(true_col) - pl.col(pred_col)) ** 2).mean().sqrt().round(4).alias(\"rmse\")`",
      },
      {
        body: "โครงของ `slice_error_by_segment` และ `top_k_worst_errors` พร้อมแล้ว เติมส่วนที่เหลือและรัน `pytest`:",
        code: {
          language: "python",
          filename: "hint_day46.py",
          code: `def slice_error_by_segment(
    df: pl.DataFrame,
    group_col: str,
    true_col: str = "y_true",
    pred_col: str = "y_pred",
) -> pl.DataFrame:
    res = pl.col(true_col) - pl.col(pred_col)
    return (
        df.with_columns(res.alias("_res"))
        .group_by(group_col)
        .agg(
            pl.len().alias("count"),
            pl.col("_res").abs().mean().round(4).alias("mae"),
            (pl.col("_res") ** 2).mean().sqrt().round(4).alias("rmse"),
            pl.col("_res").mean().round(4).alias("mean_residual"),
        )
        .sort(["rmse", group_col], descending=[True, False])
    )


def top_k_worst_errors(
    df: pl.DataFrame,
    k: int = 3,
    true_col: str = "y_true",
    pred_col: str = "y_pred",
) -> pl.DataFrame:
    if k <= 0:
        raise ValueError("k must be positive")
    # TODO: เพิ่มคอลัมน์ residual และ abs_error แล้ว sort ตาม abs_error descending + head(k)
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
      title: "ดูแค่ Mean Residual รวมแล้วเข้าใจว่าโมเดลแม่น",
      symptom: "เห็น `mean(y_true - y_pred) == 0.0` เลยสรุปว่าโมเดลไม่มีความผิดพลาด ทั้งที่จริง ๆ ทายขาด 5 ชม. ครึ่งหนึ่งและทายเกิน 5 ชม. อีกครึ่งหนึ่ง",
      fix: "`mean_residual` วัดเฉพาะ **อคติ (Bias)** ไม่ได้วัดขนาดความผิดพลาด — ต้องดูคู่กับ `MAE` และ `RMSE` เสมอ",
    },
    {
      title: "ใช้ `mean_squared_error(..., squared=False)` เวอร์ชันเก่าใน scikit-learn",
      symptom: "เกิด `TypeError` หรือ `FutureWarning` บน `scikit-learn >= 1.4` เพราะพารามิเตอร์ `squared` ถูกถอดออก",
      fix: "ใช้ `from sklearn.metrics import root_mean_squared_error` โดยตรง ซึ่งเป็น API มาตรฐานปัจจุบัน",
    },
    {
      title: "รายงาน MSE โดยไม่ถอดรากแล้วสับสนหน่วย",
      symptom: "บอกทีมธุรกิจว่า 'ความผิดพลาด 16' ทั้งที่จริงคือ 16 ชั่วโมง² (RMSE จริงคือ 4 ชั่วโมง)",
      fix: "ใช้ **RMSE** และ **MAE** ในการรายงานผลเสมอเพราะมีหน่วยเดียวกับตัวแปรเป้าหมาย",
    },
    {
      title: "ประเมิน error รวมทั้งชุดโดยไม่แยก Segment",
      symptom: "ค่า MAE ภาพรวมสวยหรู แต่ลูกค้ากลุ่ม VIP หรือหมวด billing เจอเวลาประเมินผิดเพี้ยนตลอดจนร้องเรียน",
      fix: "ทำ Sliced Residual Analysis แยกตามหมวดหมู่ ช่องทาง และกลุ่มลูกค้าทุกครั้งก่อนปล่อยโมเดลขึ้น Production",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d046-q1",
        "โมเดลทำนายเวลาตอบทิกเก็ตบนชุด Validation ได้ `MAE = 1.2 ชม.` แต่ `RMSE = 3.8 ชม.` ข้อใดตีความตัวเลขคู่นี้ได้ถูกต้องที่สุด?",
        [
          ["คำนวณผิดแน่นอน เพราะ RMSE ไม่มีทางมากกว่า MAE ได้", "ผิด — ในทางคณิตศาสตร์ RMSE >= MAE เสมอ และจะเท่ากันเฉพาะเมื่อทุกแถวพลาดขนาดเท่ากันเป๊ะ"],
          ["เคสส่วนใหญ่คลาดเคลื่อนไม่มากนัก แต่มีเคส Outlier ที่โมเดลทายพลาดหนักมากปะปนอยู่จนดึง RMSE พุ่งขึ้นเกิน 3 เท่าของ MAE", "ถูก — RMSE ยกกำลังสองก่อนเฉลี่ย จึงไวต่อเคสที่พลาดก้อนใหญ่มากกว่า MAE"],
          ["โมเดลทายสูงเกินจริงทุกเคสพอ ๆ กัน", "หากพลาดเท่ากันทุกเคส RMSE จะเท่ากับ MAE ไม่ใช่ห่างกัน 3 เท่า"],
          ["โมเดลมีความแม่นยำ 98.8%", "MAE ไม่ใช่เปอร์เซ็นต์ความแม่นยำ แต่มีหน่วยเป็นชั่วโมง"],
        ],
        "B",
        "อัตราส่วน RMSE / MAE ที่สูงมาก (3.8 / 1.2 = 3.17x) เป็นสัญญาณชัดเจนว่ามีเคสที่ทายพลาดรุนแรงซ่อนอยู่ ควรดึง Top-K worst errors มาตรวจสอบทันที",
        "เมื่อไรที่ RMSE สูงกว่า MAE มาก และควรทำอะไรต่อ?",
        "เมื่อมี Outlier ที่โมเดลทายพลาดหนักปะปนอยู่ → ควรดึง Top-K worst residuals มาเปิดดูข้อมูลดิบเพื่อตรวจว่าเป็น data error หรือขาดฟีเจอร์สำคัญ",
      ),
      mc(
        "d046-q2",
        "ในงานใดต่อไปนี้ที่ควรให้ความสำคัญกับ **RMSE** มากกว่า MAE อย่างชัดเจน?",
        [
          ["ประมาณการเวลาส่งมอบภายใต้สัญญา SLA ที่หากช้าเกินขอบเขตมาก ๆ จะโดนค่าปรับหนักแบบก้าวกระโดด", "ถูก — เมื่อความเสียหายจากความพลาดก้อนใหญ่รุนแรงกว่าความพลาดเล็ก ๆ หลายครั้งรวมกัน RMSE สะท้อนความเสี่ยงได้ดีกว่า"],
          ["สรุปราคาบ้านทั่วไปในเขตที่มีคฤหาสน์หรู 1 หลังราคาสูงกว่าปกติ 100 เท่าและไม่อยากให้หลังนั้นดึงค่าทำนายบ้านทั่วไปเพี้ยน", "กรณีนี้ควรใช้ MAE หรือ Median AE เพื่อไม่ให้ outlier ดึงค่าทำนายเพี้ยน"],
          ["งานจำแนกประเภทว่าทิกเก็ตเป็น spam หรือไม่", "งาน spam คือ Classification ใช้ Precision/Recall/PR-AUC ไม่ใช่ RMSE"],
          ["งานค้นคืนเอกสารด้วย Cosine Similarity", "งานค้นคืนเอกสารใช้ Recall@k / MRR ไม่ใช่ RMSE"],
        ],
        "A",
        "เลือก RMSE เมื่อ 'ความผิดพลาดก้อนใหญ่' สร้างความเสียหายแบบไม่เป็นเชิงเส้น (เช่น SLA penalty, server overload) และเลือก MAE เมื่อความเสียหายเป็นเส้นตรงหรืออยากทนต่อ outlier",
        "หลักการเลือกใช้ MAE กับ RMSE ตามบริบทธุรกิจคืออะไร?",
        "ใช้ RMSE เมื่อความผิดพลาดก้อนใหญ่เสียหายหนักมาก (ต้องลงโทษ outlier แรง); ใช้ MAE เมื่อความเสียหายโตเป็นเส้นตรงหรืออยากทนต่อ outlier",
      ),
      mc(
        "d046-q3",
        "หลังผ่า Residual (`y_true - y_pred`) แยกตามหมวดทิกเก็ต พบว่าหมวด `billing` มี `MAE = 3.5 ชม.`, `RMSE = 3.5 ชม.` และ `mean_residual = +3.5 ชม.` ข้อมูลนี้บอกอะไรเรา?",
        [
          ["หมวด billing มีเคส outlier เพียง 1 เคสที่พลาดหนัก", "ไม่จริง — ถ้ามี outlier เดี่ยว RMSE จะสูงกว่า MAE แต่ที่นี่ MAE == RMSE == 3.5"],
          ["โมเดลทายเวลาหมวด billing **ต่ำกว่าความจริง (under-predict)** อย่างสม่ำเสมอทุกใบประมาณ 3.5 ชม. (Systematic Bias)", "ถูก — residual เป็นบวกเท่ากันทุกใบแปลว่าเวลาจริงมากกว่าเวลาที่ทายเสมอ ต้องเช็กฟีเจอร์หรือกระบวนการของหมวด billing"],
          ["โมเดลทายเวลาหมวด billing สูงกว่าความจริงทุกใบ", "ถ้าทายสูงกว่าความจริง `y_true - y_pred` จะติดลบ"],
          ["หมวด billing มีความคลาดเคลื่อนเป็นศูนย์", "ความคลาดเคลื่อนคือ 3.5 ชั่วโมง ไม่ใช่ศูนย์"],
        ],
        "B",
        "เมื่อ `MAE == RMSE == |mean_residual|` และมีเครื่องหมายบวก แปลว่าความผิดพลาดชี้ไปทิศทางเดียวกันทั้งหมด (ทายต่ำกว่าความจริงอย่างเป็นระบบ) ไม่ใช่เรื่องบังเอิญ",
        "Residual (`y_true - y_pred`) ที่เป็นบวก vs เป็นลบ มีความหมายว่าอย่างไร?",
        "บวก (`> 0`) = ของจริงมากกว่าที่ทาย (under-predict / ทายต่ำเกิน); ลบ (`< 0`) = ของจริงน้อยกว่าที่ทาย (over-predict / ทายสูงเกิน)",
      ),
      mc(
        "d046-q4",
        "หากโมเดล Regression ตัวหนึ่งได้ค่า `r2_score(y_val, y_pred) = -0.15` หมายความว่าอย่างไร?",
        [
          ["โมเดลทำนายได้ดีกว่าค่าเฉลี่ย 15%", "ผิด — ค่า R² ติดลบแปลว่าแย่กว่าค่าเฉลี่ย"],
          ["เป็นไปไม่ได้ เพราะ R² มีค่าระหว่าง 0 ถึง 1 เสมอ", "ผิด — บนชุด Validation/Test ค่า R² ติดลบได้เมื่อโมเดลทายแย่กว่าเส้นฐานค่าเฉลี่ย"],
          ["โมเดลนี้ทำนายแย่กว่าการเดาด้วยค่าเฉลี่ยของ `y_val` เฉย ๆ เสียอีก", "ถูก — R² = 0 คือเท่ากับทายค่าเฉลี่ยตลอด ดังนั้น R² < 0 แปลว่าโมเดลมีปัญหาหนัก (เช่น overfit, สเกลผิด หรือ bug ใน pipeline)"],
          ["ข้อมูลมีค่า y_true เป็นเลขติดลบ", "R² ไม่ขึ้นกับว่า y_true เป็นบวกหรือลบ"],
        ],
        "C",
        "R² เทียบความผิดพลาดของโมเดลกับ baseline ที่ทายค่าเฉลี่ย `mean(y)` ตลอด หากติดลบแปลว่าโมเดลพังหรือ overfit หนัก ต้องรีบตรวจ pipeline และ residuals ทันที",
        "ค่า R² (`r2_score`) ติดลบหมายความว่าอย่างไร?",
        "หมายความว่าโมเดลทำนายได้แย่กว่าการเดาด้วยค่าเฉลี่ยของเป้าหมายเฉย ๆ — เป็นสัญญาณเตือนว่าโมเดล overfit หนักหรือมีบั๊กใน pipeline",
      ),
    ],
  },

  takeaways: [
    "รายงาน **{{mae-rmse|MAE คู่ RMSE}}** เสมอ: ทั้งคู่มีหน่วยเดียวกับค่าเป้าหมาย โดย MAE สะท้อนความพลาดทั่วไป ส่วน RMSE ลงโทษ Outlier หนักเป็นกำลังสอง",
    "สังเกตอัตราส่วน `RMSE / MAE`: ยิ่งสูงเกิน `1.5x` ยิ่งชี้ชัดว่ามีเคสหลุดหนักซ่อนอยู่ และใช้ `root_mean_squared_error` แทน API เก่าของ scikit-learn",
    "อย่าเชื่อแค่ค่าเฉลี่ยรวม — ผ่า **Residual (`y_true - y_pred`)** แยกตาม segment ด้วย {{polars}} เพื่อแยก **Systematic Bias** ออกจาก **Outlier เดี่ยว**",
    "เปิดดู **Top-K worst errors** ด้วยตาก่อนเปลี่ยนอัลกอริทึมเสมอ เพราะหลายครั้งฟีเจอร์ที่ขาดหายหรือข้อมูลผิดคือต้นตอที่แท้จริง",
  ],

  reviewCards: [
    rc(
      "d046-rc-1",
      "เปรียบเทียบความต่างระหว่าง MAE กับ RMSE และบอกว่าเมื่อไร `RMSE == MAE`?",
      "MAE เฉลี่ย `|e|` ตรง ๆ ทนต่อ outlier; RMSE คำนวณ `sqrt(mean(e^2))` ลงโทษ outlier หนักมาก; `RMSE >= MAE` เสมอ และเท่ากันเฉพาะเมื่อขนาดความผิดพลาด `|e|` ของทุกแถวเท่ากันหมด",
    ),
    rc(
      "d046-rc-2",
      "หากกลุ่ม `vip` มี `mean_residual (y_true - y_pred) = +4.0` และ `MAE = 4.0` แปลว่าโมเดลกำลังเกิดปัญหาอะไร?",
      "เกิด Systematic Bias แบบ under-prediction — โมเดลทายค่าของกลุ่ม `vip` ต่ำกว่าความจริงสม่ำเสมอทุกใบ ควรตรวจสอบฟีเจอร์เฉพาะของกลุ่มนี้",
    ),
    rc(
      "d046-rc-3",
      "ทำไม `mean_residual ≈ 0` ถึงไม่ได้รับประกันว่าโมเดลแม่น?",
      "เพราะความผิดพลาดบวก (+5) กับลบ (-5) หักล้างกันจนค่าเฉลี่ยเป็น 0 ได้ จึงต้องดูคู่กับ MAE และ RMSE เสมอ",
    ),
  ],

  sources: [
    { label: "scikit-learn User Guide — Regression Metrics (MAE, RMSE, R²)", href: "https://scikit-learn.org/stable/modules/model_evaluation.html#regression-metrics" },
    { label: "scikit-learn API Reference — root_mean_squared_error", href: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.root_mean_squared_error.html" },
    { label: "Polars User Guide — GroupBy Aggregations", href: "https://docs.pola.rs/user-guide/expressions/aggregation/" },
  ],

  glossary: [
    "mae-rmse",
    "polars",
    "data-leakage",
    "feature-drift",
    "sklearn-pipeline",
    "lightgbm",
    "pytest",
    "uv",
  ],
});
