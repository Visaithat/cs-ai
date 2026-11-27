import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D054 — Phase 2 / Block B14
 * Feature Drift & Monitoring Classical ML in Production
 */
export const d054: Lesson = defineLesson({
  day: 54,
  titleTh: "ตรวจจับ Feature Drift และเฝ้าระวังโมเดล ML ใน Production",
  tagline:
    "30 นาที · รันบน CPU 100% ไม่ใช้ API key · จับสัญญาณข้อมูลเพี้ยนก่อนความแม่นยำร่วงเงียบ ๆ ด้วย PSI, Thai OOV Rate และ Confidence Shift",
  icon: "activity",
  visual: {
    id: "drift-onnx-monitor",
    title: "Feature Drift & Monitoring — จับสัญญาณก่อนความแม่นยำตกเงียบ ๆ",
    caption:
      "เทียบการกระจายตัวของข้อมูลตอนเทรนกับช่วงโปรโมชันจริงด้วย PSI / OOV rate และ confidence shift",
    alt: "แผนภาพตรวจจับ Feature Drift ระหว่างข้อมูลเทรนกับข้อมูล production",
  },
  requiresApiKey: false,
  tools: ["NumPy", "Polars", "PyThaiNLP", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อมูลในโลกจริงเปลี่ยนแปลงตลอดเวลาไม่หยุดนิ่ง",
      body: "โลกธุรกิจจริงไม่เหมือนชุด Test ในแล็บ — ช่วงแคมเปญ 11.11 ยอดสั่งซื้อพุ่งสูง, มีชื่อขนส่งหรือโปรโมชันภาษาไทยใหม่ ๆ โผล่มา หรือทีม backend อัปเดตระบบจนฟิลด์บางช่องกลายเป็น `null`",
      lessonNote:
        "เรียนรู้การแยกแยะ {{feature-drift}} (Covariate Drift), Concept Drift และ upstream data bug ตั้งแต่ต้นทาง",
    },
    {
      node: 4,
      heading: "โมเดล ML พังแบบ 'เงียบ' โดยที่ API ยังคืน HTTP 200",
      body: "ต่างจากบั๊กซอฟต์แวร์ทั่วไปที่โยน 500 Error โมเดล ML ที่เจอข้อมูลแปลกหน้าจะยังคงคำนวณตัวเลขความน่าจะเป็นออกมาปกติ แต่ความแม่นยำในการคัดกรองทิกเก็ตอาจตกฮวบโดยไม่มีใครรู้",
      lessonNote:
        "เพราะเฉลยจริง (ground-truth labels) มักตามมาช้าหลายวันหรือหลายสัปดาห์ เราจึงต้องสร้าง Proxy Signals คอยเฝ้าทุก batch",
    },
    {
      node: 5,
      heading: "สร้างแผงเฝ้าระวังด้วย PSI, Thai OOV Rate และ Prediction Shift",
      body: "ไม่ต้องซื้อแพลตฟอร์มราคาแพงตั้งแต่ก้าวแรก แค่คำนวณ **PSI** บนฟีเจอร์ตัวเลข, **OOV Token Rate** สำหรับข้อความภาษาไทย ({{pythainlp}}), อัตราค่าว่าง และสัดส่วนผลทำนาย ก็จับปัญหาใหญ่ได้เกิน 80% แล้ว",
      lessonNote:
        "ลงมือเขียนโมดูล `drift_monitor.py` ที่สรุปสถานะ `ok` / `warn` / `alert` ออกเป็น {{structlog}} หรือ JSON report ได้ทันที",
    },
    {
      node: 6,
      heading: "ป้อนสัญญาณ Drift กลับไปกระตุ้นการตรวจสอบและ Retrain",
      body: "เมื่อระบบเตือน `alert` ทีมจะไม่รีบ retrain สุ่มสี่สุ่มห้า แต่จะเช็ก upstream pipeline bug ก่อน แล้วค่อยเก็บตัวอย่างข้อมูลใหม่มาติดป้ายเพื่อเทรนเวอร์ชันถัดไป",
      lessonNote:
        "ปิดวงจร AI Engineering Loop จาก Monitor กลับไปยัง Data และ Model อย่างครบถ้วน",
    },
  ],

  objectives: [
    "**แยกแยะ** ความต่างระหว่าง **Feature (Covariate) Drift**, **Concept Drift** และ **Label Drift** พร้อมยกตัวอย่างสถานการณ์จริงในธุรกิจไทยได้",
    "**คำนวณ Population Stability Index (PSI)** บนฟีเจอร์ตัวเลขโดยใช้ quantile bins จากชุดอ้างอิง (Train) อย่างปลอดภัยจาก `log(0)` และตีความเกณฑ์ `< 0.10` / `0.10–0.25` / `>= 0.25` ได้",
    "**ออกแบบ Proxy Signals ครบชุดสำหรับ Production ML** เมื่อเฉลยจริงมาช้า: Numeric PSI, **Thai OOV Token Rate** (ผ่าน {{pythainlp}}), Missing-Value Spike และ Prediction Probability Shift",
  ],

  prerequisites: [
    "ผ่าน Day 49 ({{pythainlp}} + {{tfidf}}) และ Day 53 (Model Versioning & Data Cards)",
    "เข้าใจการกระจายตัวและ Quantiles พื้นฐานจาก Block B10",
    "ใช้ `numpy`, `polars`, `pytest` บนเครื่องได้คล่อง",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่ด้วย `uv` แล้วติดตั้ง `numpy`, `polars` และ `pythainlp` เพื่อสร้างตัวตรวจจับ Drift สำหรับทั้งฟีเจอร์ตารางและข้อความภาษาไทย",
    commands: `uv init ai-day54 && cd ai-day54
uv add numpy polars pythainlp
uv add --dev pytest ruff
uv run python -c "import numpy, polars, pythainlp; print('Drift Monitor Ready!')"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day54` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `numpy`, `polars`, `pythainlp`, `pytest`, `ruff`"],
      ["verify", "รันคำสั่งทดสอบแล้วเห็น `Drift Monitor Ready!`"],
    ],
    note: "สูตร PSI และ OOV rate ที่เราจะเขียนในวันนี้เป็นคณิตศาสตร์เบา ๆ รันบนข้อมูลหลักแสนแถวได้ในไม่กี่มิลลิวินาทีบน CPU",
  },

  concepts: [
    {
      id: "types-of-drift-silent-failure",
      title: "1 · Covariate Drift vs Concept Drift: ทำไมโมเดลจึงเสื่อมสภาพเงียบ ๆ",
      paragraphs: [
        "เมื่อระบบ ML ขึ้น Production แล้ว ปัญหาที่น่ากลัวที่สุดไม่ใช่เซิร์ฟเวอร์ล่ม แต่คือ **Silent Degradation** — API ยังตอบ HTTP 200 เร็ว <10ms เหมือนเดิม แต่คุณภาพการตัดสินใจค่อย ๆ ตกเพราะโลกภายนอกเปลี่ยนไปจากวันที่เทรนโมเดล",
        "**{{feature-drift|Covariate / Feature Drift}}** เกิดขึ้นเมื่อการกระจายตัวของอินพุต $P(X)$ เปลี่ยนไป เช่น ปกติลูกค้าสั่งซื้อเฉลี่ย 800 บาท แต่ช่วงโปรโมชัน 11.11 ยอดสั่งซื้อเฉลี่ยพุ่งเป็น 3,500 บาท หรือลูกค้าเริ่มพิมพ์ชื่อบริการใหม่ที่โมเดลไม่เคยเห็น แม้กฎความสัมพันธ์ระหว่างอินพุตกับคำตอบ $P(Y|X)$ จะยังเหมือนเดิม",
        "**Concept Drift** เกิดขึ้นเมื่อความหมายหรือกฎของคำตอบ $P(Y|X)$ เปลี่ยนไปเอง เช่น บริษัทออกนโยบายใหม่ว่าทิกเก็ตปัญหา PromptPay ทุกใบถือเป็น `urgent` ทันทีแม้ยอดเงินน้อย — โมเดลเดิมที่เคยเห็นอินพุตหน้าตาเดิมจะทายผิดระบบทันที ส่วน **Label Drift** คือสัดส่วนคลาสเป้าหมาย $P(Y)$ เปลี่ยน (เช่น วันระบบชำระเงินล่ม ทิกเก็ตด่วนพุ่งจาก 10% เป็น 45%)",
      ],
      analogy:
        "Covariate Drift เหมือนครูเตรียมข้อสอบให้เด็ก ม.ปลาย แต่จู่ ๆ มีเด็กประถมย้ายเข้ามาสอบเต็มห้อง (ข้อมูลอินพุตเปลี่ยน) ส่วน Concept Drift เหมือนกระทรวงเปลี่ยนเกณฑ์เฉลยคำตอบใหม่ทั้งหมดทั้งที่ข้อสอบเดิม (ความสัมพันธ์คำตอบเปลี่ยน)",
      bullets: [
        "**Upstream Schema/Bug ไม่ใช่พฤติกรรมลูกค้า**: ก่อนโทษว่าโลกเปลี่ยน ให้ตรวจก่อนเสมอว่าหน่วยข้อมูลเปลี่ยนไหม (เช่น ส่งหน่วยสตางค์แทนบาท หรือค่า `null` พุ่งเพราะ bug ของ API ต้นทาง)",
        "**Delayed Ground Truth**: ในงานจริงกว่าจะรู้ว่าทิกเก็ตใบนั้นหลุด SLA หรือลูกค้า churn จริงหรือไม่ อาจต้องรอ 7–30 วัน — เราจึงรอวัด {{precision-recall}} จากเฉลยจริงอย่างเดียวไม่ได้",
        "**Proxy Monitoring**: เฝ้าอินพุต (`X`) และเอาต์พุต (`y_prob`) ทันทีแบบ real-time/รายวัน เพื่อจับสัญญาณเตือนล่วงหน้าตั้งแต่วันแรกที่ข้อมูลเริ่มเบี้ยว",
      ],
      whyTitle: "Why this matters — รู้ตัวภายในชั่วโมงเดียว แทนที่จะรู้ตอนลูกค้าหนีหมด",
      whyParagraphs: [
        "ถ้าไม่มี Drift Monitoring ทีมมักจะรู้ตัวว่าโมเดลพังก็ต่อเมื่อฝ่ายซัพพอร์ตโวยวายหรือยอด SLA ทะลุเป้าไปแล้วหลายสัปดาห์ ซึ่งตอนนั้นความเสียหายเกิดขึ้นแล้ว",
        "การแยกแยะได้ว่าปัญหาคือ upstream bug, Feature Drift หรือ Concept Drift ยังช่วยให้ทีมแก้ถูกจุด — เช่น bug ของ API ต้นทางต้องแก้ที่ ingestion ไม่ใช่เอาข้อมูลพัง ๆ ไป retrain โมเดล!",
      ],
    },
    {
      id: "population-stability-index",
      title: "2 · Population Stability Index (PSI): ไม้บรรทัดวัด Numeric Drift",
      paragraphs: [
        "**PSI** เป็นตัวชี้วัดมาตรฐานในวงการธนาคารและ Production ML สำหรับวัดว่าการกระจายตัวของฟีเจอร์ตัวเลขในปัจจุบัน (**Actual**, $a_i$) เบี่ยงเบนไปจากช่วงอ้างอิงตอนเทรน (**Expected / Reference**, $e_i$) มากแค่ไหน",
        "วิธีคำนวณทำ 3 ขั้น: (1) แบ่งข้อมูลชุด Reference ออกเป็น $B$ ช่วง (นิยมใช้ 10 ช่วงด้วย **quantiles** เพื่อให้แต่ละ bin ของ Reference มีสัดส่วนใกล้เคียงกัน ~10%), (2) นับสัดส่วนข้อมูลของชุด Reference ($e_i$) และชุด Production ($a_i$) ที่ตกในขอบเขต bin ชุดเดียวกัน (ขยายขอบล่างเป็น $-\infty$ และขอบบนเป็น $+\infty$ เพื่อรับค่าสุดโต่งใหม่ ๆ), แล้ว (3) รวมค่าตามสูตร $\\text{PSI} = \\sum_{i=1}^{B} (a_i - e_i) \\cdot \\ln(a_i / e_i)$",
        "จุดต้องระวังทางคณิตศาสตร์: หาก bin ใดในชุด Production ไม่มีข้อมูลเลย ($a_i = 0$) ค่า $\\ln(0)$ จะเป็น $-\infty$ ทันที เราจึงต้อง **clip** สัดส่วนต่ำสุดด้วยค่า `eps` เล็ก ๆ เช่น `1e-6` แล้ว normalize ให้ผลรวมสัดส่วนเท่ากับ 1 ก่อนคำนวณเสมอ",
      ],
      analogy:
        "เหมือนเทียบกราฟแท่งส่วนสูงของนักเรียนปีนี้กับปีที่แล้ว: ถ้าแท่งแต่ละช่วงยังสูงใกล้เคียงเดิม PSI จะเข้าใกล้ 0 แต่ถ้าปีนี้แท่งไปกระจุกอยู่ด้านขวาสุดเกือบหมด PSI จะพุ่งทะลุ 0.25 ทันที",
      bullets: [
        "`PSI < 0.10` (**OK / Stable**): การกระจายตัวยังใกล้เคียงช่วงเทรน ไม่ต้องทำอะไร",
        "`0.10 <= PSI < 0.25` (**WARN / Moderate Shift**): เริ่มเปลี่ยนอย่างมีนัยสำคัญ ให้ทีมเฝ้าระวังและตรวจสอบสาเหตุ",
        "`PSI >= 0.25` (**ALERT / Significant Drift**): ข้อมูลเปลี่ยนไปมาก แจ้งเตือนทันที ตรวจ upstream bug และประเมินการ retrain",
      ],
      code: {
        language: "python",
        filename: "psi_demo.py",
        code: `import numpy as np


def compute_psi(
    reference: np.ndarray,
    current: np.ndarray,
    bins: int = 10,
    eps: float = 1e-6,
) -> float:
    ref = np.asarray(reference, dtype=float)
    cur = np.asarray(current, dtype=float)
    quantiles = np.linspace(0.0, 1.0, bins + 1)
    edges = np.unique(np.quantile(ref, quantiles))
    edges[0], edges[-1] = -np.inf, np.inf

    ref_counts, _ = np.histogram(ref, bins=edges)
    cur_counts, _ = np.histogram(cur, bins=edges)

    e = np.clip(ref_counts / ref_counts.sum(), eps, None)
    a = np.clip(cur_counts / cur_counts.sum(), eps, None)
    e = e / e.sum()
    a = a / a.sum()
    return float(np.sum((a - e) * np.log(a / e)))


rng = np.random.default_rng(42)
ref_orders = rng.normal(1000, 200, size=2000)
same_week = rng.normal(1010, 205, size=500)
promo_11_11 = rng.normal(1650, 350, size=500)

print(f"Normal week PSI : {compute_psi(ref_orders, same_week):.4f}")
print(f"Promo 11.11 PSI : {compute_psi(ref_orders, promo_11_11):.4f}")`,
        caption: "ใช้ `np.unique(np.quantile(...))` และขยายขอบเป็น `[-inf, +inf]` เพื่อกันปัญหา bin ซ้ำและค่าใหม่หลุดขอบ",
      },
      whyTitle: "Why this matters — เบา ตีความง่าย และใช้ได้ทั้งฟีเจอร์และ Prediction Score",
      whyParagraphs: [
        "ข้อดีที่ทำให้ PSI เป็นขวัญใจทีม ML Production คือเราไม่ต้องเก็บข้อมูลดิบตอนเทรนทั้งหมดไว้บนเซิร์ฟเวอร์ แค่เก็บ **`edges` (ขอบ bin 11 ตัวเลข) กับ `ref_proportions` (10 ตัวเลข)** ไว้ใน `drift_baseline.json` ก็คำนวณ PSI ของข้อมูลใหม่ได้ทุกวัน",
        "นอกจากใช้กับฟีเจอร์อินพุตอย่าง `order_value_thb` หรือ `wait_minutes` แล้ว เรายังใช้ฟังก์ชัน `compute_psi` ตัวเดียวกันวัด **Prediction Shift** บน `y_prob` ที่โมเดลพ่นออกมาได้ทันทีด้วย!",
      ],
    },
    {
      id: "thai-oov-missing-and-prediction-shift",
      title: "3 · Proxy Signals สำหรับข้อความไทย: Thai OOV Rate, Missing Spike & Confidence Shift",
      paragraphs: [
        "สำหรับโมเดลข้อความภาษาไทยที่ใช้ {{pythainlp}} + {{tfidf}} การคำนวณ PSI บนคอลัมน์คำศัพท์หลายพันช่องไม่ค่อยสื่อความหมาย — สัญญาณที่แม่นและลงมือทำได้ง่ายกว่ามากคือ **Thai OOV (Out-of-Vocabulary) Token Rate**",
        "**OOV Token Rate** คือสัดส่วนของคำที่ `PyThaiNLP newmm` ตัดได้จากทิกเก็ตชุดใหม่ แต่ *ไม่เคยปรากฏอยู่ใน `vocabulary_` ตอนเทรนโมเดล* หากปกติ OOV อยู่ที่ ~10% แต่สัปดาห์นี้พุ่งเป็น 35% แสดงว่ามีศัพท์ใหม่ ชื่อแคมเปญใหม่ หรือบริการใหม่ที่ {{tfidf}} มองเป็นเวกเตอร์ศูนย์ทั้งหมดจนความแม่นยำตกแน่นอน",
        "เมื่อรวมอีก 2 สัญญาณหลัก ได้แก่ **Missing-Value Spike** (อัตรา `null` เพิ่มขึ้นจาก baseline เกินเช่น +5% ซึ่งเกือบ 100% เป็นบั๊กของระบบต้นทาง) และ **Prediction / Positive-Rate Shift** (สัดส่วนทิกเก็ตที่ถูกตีตราว่าด่วนพุ่งหรือหดผิดปกติ) คุณก็จะได้ระบบเฝ้าระวังที่ครอบคลุมทั้งฝั่ง Tabular, ข้อความไทย และพฤติกรรมโมเดล",
      ],
      analogy:
        "Thai OOV Rate เหมือนพนักงานคอลเซ็นเตอร์ที่เจอคำศัพท์ใหม่จากลูกค้าจนฟังไม่ออก 4 ใน 10 คำ — ต่อให้พนักงานยังตอบคำถามได้เร็วเท่าเดิม คุณก็รู้ทันทีว่าต้องรีบอัปเดตคู่มือ (vocabulary & retrain) แล้ว",
      bullets: [
        "**Numeric PSI**: จับการเปลี่ยนสเกลหรือการกระจายตัวของตัวเลข (`order_value_thb`, `wait_minutes`)",
        "**Thai OOV Rate**: `len(unknown_tokens) / len(all_tokens)` จับศัพท์ใหม่/สแลง/ชื่อสินค้าใหม่ในข้อความไทย",
        "**Missing-Value Delta**: `current_null_rate - ref_null_rate` จับ pipeline/API schema พังแบบ {{fail-fast}}",
        "**Prediction Shift (PSI ของ `y_prob` + Positive Rate Delta)**: จับความผิดปกติปลายทางเมื่อรวมทุกฟีเจอร์เข้าด้วยกันแล้ว",
      ],
      whyTitle: "Why this matters — เชื่อมต่อตรงเข้าสู่ระบบ Observability และ Alerting",
      whyParagraphs: [
        "การสรุปสัญญาณทั้ง 4 อย่างเป็น JSON report เดียวพร้อมสถานะ `ok` / `warn` / `alert` ทำให้คุณสามารถส่งเข้า {{structlog}}, Slack webhook หรือแดชบอร์ดใน Phase 5 ได้โดยไม่ต้องแก้โครงสร้างโค้ด",
        "และใน Day 56 เราจะบันทึก baseline ของทั้ง Numeric quantiles, `vocab_set` และ `positive_rate` ไว้ใน `drift_baseline.json` คู่กับโมเดลจริงทันทีหลังเทรนเสร็จ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ ML Drift Monitoring กับ Web App Observability",
      body: [
        "ในเว็บแอปปกติคุณเฝ้า HTTP 5xx, CPU และ Latency แต่สำหรับ ML Service แม้ 5xx = 0% และ Latency < 10ms โมเดลก็ยังพังเงียบ ๆ ได้ — Drift Monitor คือชั้น health check ด้านคุณภาพข้อมูลที่เพิ่มเข้ามา:",
      ],
      table: [
        ["HTTP 5xx / Latency P95", "Service Health (เซิร์ฟเวอร์ยังตอบได้เร็วไหม)"],
        ["Missing-Value Spike", "Upstream Payload/Contract Break (ฟิลด์หายจากต้นทาง)"],
        ["Numeric PSI >= 0.25", "Input Traffic Distribution Shift (ลักษณะข้อมูลเปลี่ยนแรง)"],
        ["Thai OOV Token Rate Spike", "Unrecognized Vocabulary (คำใหม่ที่โมเดลไม่รู้จัก)"],
        ["Prediction `y_prob` PSI", "Output Anomaly (ความมั่นใจ/สัดส่วนการตัดสินใจเพี้ยน)"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม PSI ต้องใช้ Quantile Bins และ Epsilon?",
      body: [
        "ถ้าเราแบ่งช่วงราคาสินค้าเป็นช่วงกว้างเท่า ๆ กัน (เช่น 0–1000, 1000–2000, ..., 9000–10000) แต่ลูกค้า 95% ซื้อของราคาไม่เกิน 1,000 บาท แทบทุกข้อมูลจะไปกองอยู่ในช่องแรกช่องเดียว ทำให้มองไม่เห็นความเปลี่ยนแปลงละเอียด ๆ การแบ่งด้วย **Quantiles** (เช่น เปอร์เซ็นไทล์ที่ 0, 10, 20, ..., 100) จะกระจายข้อมูลชุดอ้างอิงให้เฉลี่ยลงทุกช่องอย่างสมดุล",
        "ส่วน **Epsilon (`1e-6`)** คือเลขบวกที่เล็กมากที่เราใส่กันไว้ไม่ให้เกิดการหารด้วยศูนย์หรือ `log(0)` ซึ่งจะทำให้โปรแกรมพ่นค่า `nan` หรือ `inf` ออกมาพังระบบแจ้งเตือน",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: โมเดลคัดกรองทิกเก็ตด่วนที่เทรนไว้เมื่อเดือนมกราคมกำลังรับข้อมูลช่วงแคมเปญ 11.11 ในเดือนพฤศจิกายน มาลองรันตัวตรวจจับทั้ง 3 สัญญาณ (Numeric PSI, Thai OOV Rate และ Prediction Shift) เพื่อดูว่าระบบจับความผิดปกติได้อย่างไร",
    steps: [
      {
        title: "1 · สร้าง Reference Baseline จากข้อมูลตอนเทรน",
        explain:
          "เก็บชุดคำศัพท์ที่รู้จัก (`train_vocab`) จาก `PyThaiNLP newmm` พร้อมข้อมูลอ้างอิงของ `order_value_thb` และ `y_prob` ตอน validation",
        code: {
          language: "python",
          filename: "worked_day54.py",
          code: `import numpy as np
from pythainlp.tokenize import word_tokenize


def tokenize_thai(text: str) -> list[str]:
    return [t.lower() for t in word_tokenize(text, engine="newmm", keep_whitespace=False) if t.strip()]


rng = np.random.default_rng(7)
ref_order_value = rng.normal(950.0, 220.0, size=1000)
ref_probs = np.clip(rng.beta(1.5, 6.0, size=1000), 0.01, 0.99)

train_texts = [
    "ขอใบกำกับภาษีซ้ำครับ",
    "โอนเงินผ่านพร้อมเพย์แล้วแต่ยอดไม่เข้า",
    "ขอเลขพัสดุหน่อยค่ะ ของยังไม่ถึง",
    "สินค้าเสียหายขอคืนเงินด่วน",
]
train_vocab = {tok for doc in train_texts for tok in tokenize_thai(doc)}
print("Train vocab size:", len(train_vocab))`,
        },
        output: `Train vocab size: 22`,
      },
      {
        title: "2 · คำนวณ Numeric PSI และ Thai OOV Rate บน Batch ปกติ vs ช่วงโปร 11.11",
        explain:
          "เทียบชุดข้อมูลสัปดาห์ปกติกับชุดข้อมูลช่วงแคมเปญ 11.11 ที่มียอดซื้อพุ่งสูงและเต็มไปด้วยคำศัพท์โปรโมชันใหม่ที่ไม่อยู่ใน `train_vocab`",
        code: {
          language: "python",
          filename: "worked_day54.py",
          code: `def compute_psi(ref: np.ndarray, cur: np.ndarray, bins: int = 10, eps: float = 1e-6) -> float:
    edges = np.unique(np.quantile(ref, np.linspace(0.0, 1.0, bins + 1)))
    edges[0], edges[-1] = -np.inf, np.inf
    e_cnt, _ = np.histogram(ref, bins=edges)
    a_cnt, _ = np.histogram(cur, bins=edges)
    e = np.clip(e_cnt / e_cnt.sum(), eps, None)
    a = np.clip(a_cnt / a_cnt.sum(), eps, None)
    e, a = e / e.sum(), a / a.sum()
    return float(np.sum((a - e) * np.log(a / e)))


def thai_oov_rate(texts: list[str], known_vocab: set[str]) -> float:
    tokens = [tok for doc in texts for tok in tokenize_thai(doc)]
    if not tokens:
        return 0.0
    oov = sum(1 for tok in tokens if tok not in known_vocab)
    return oov / len(tokens)


normal_orders = rng.normal(965.0, 225.0, size=400)
promo_orders = rng.normal(1700.0, 420.0, size=400)

normal_texts = ["ขอใบกำกับภาษีครับ", "ขอเลขพัสดุหน่อยค่ะ"]
promo_texts = ["คูปองแฟลชเซลล์ไม่ลดราคาและแต้มสะสมหาย", "ใช้โค้ดส่วนลดเมกะแคมเปญไม่ได้"]

print(f"Normal | order_value PSI={compute_psi(ref_order_value, normal_orders):.3f} | OOV={thai_oov_rate(normal_texts, train_vocab):.1%}")
print(f"11.11  | order_value PSI={compute_psi(ref_order_value, promo_orders):.3f} | OOV={thai_oov_rate(promo_texts, train_vocab):.1%}")`,
        },
        output: `Normal | order_value PSI=0.024 | OOV=0.0%
11.11  | order_value PSI=2.148 | OOV=86.7%`,
      },
      {
        title: "3 · สรุประดับแจ้งเตือน (ok / warn / alert) เพื่อส่งเข้า Monitoring",
        explain:
          "รวมผลทั้ง Numeric PSI, Prediction PSI และ Thai OOV Rate เข้าด้วยกัน หากตัวใดทะลุเกณฑ์ Alert ให้คืนสถานะ `alert` พร้อมระบุรายการเหตุผลให้ทีมตรวจสอบได้ทันที",
        code: {
          language: "python",
          filename: "worked_day54.py",
          code: `promo_probs = np.clip(rng.beta(4.0, 3.0, size=400), 0.01, 0.99)
prob_psi = compute_psi(ref_probs, promo_probs)
order_psi = compute_psi(ref_order_value, promo_orders)
oov = thai_oov_rate(promo_texts, train_vocab)

reasons = []
if order_psi >= 0.25:
    reasons.append(f"order_value_thb PSI={order_psi:.2f} >= 0.25")
if prob_psi >= 0.25:
    reasons.append(f"prediction PSI={prob_psi:.2f} >= 0.25")
if oov >= 0.30:
    reasons.append(f"thai_oov_rate={oov:.1%} >= 30%")

status = "alert" if reasons else "ok"
print({"status": status, "reasons": reasons})`,
        },
        output: `{'status': 'alert', 'reasons': ['order_value_thb PSI=2.15 >= 0.25', 'prediction PSI=2.31 >= 0.25', 'thai_oov_rate=86.7% >= 30%']}`,
      },
    ],
    gotcha:
      "จุดสังเกต: ถ้าชุดข้อมูลปัจจุบัน (current batch) มีขนาดเล็กเกินไป (เช่น แค่ 15–20 แถว) ค่า PSI จะแกว่งแรงมากจนเกิด False Alert บ่อย — ใน Production ควรคำนวณ PSI บนหน้าต่างข้อมูลที่มีอย่างน้อย ~200–500 แถว (เช่น รายชั่วโมงหรือรายวัน)",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `drift_monitor.py` ที่ตรวจสอบคุณภาพข้อมูล Production batch ครบ 4 มิติ ได้แก่ Numeric PSI, Thai OOV Token Rate, Missing-Value Rate Delta และสรุปสถานะแจ้งเตือน `ok` / `warn` / `alert`",
    requirements: [
      "`compute_psi(reference: np.ndarray, current: np.ndarray, bins: int = 10, eps: float = 1e-6) -> float`: ตัดค่า `NaN` ออกก่อน หากอาร์เรย์ใดว่างให้ `raise ValueError`, สร้างขอบ bin จาก `np.unique(np.quantile(ref, np.linspace(0, 1, bins + 1)))` โดยตั้งขอบล่าง/บนเป็น `-np.inf` / `np.inf`, ป้องกัน `log(0)` ด้วย `eps` และคืนค่า PSI (`>= 0.0`)",
      "`compute_thai_oov_rate(texts: list[str], known_vocab: set[str]) -> float`: ตัดคำด้วย `PyThaiNLP newmm` (`keep_whitespace=False`) แปลงเป็นตัวพิมพ์เล็กแล้วคืนสัดส่วน token ที่ไม่อยู่ใน `known_vocab` (ถ้าไม่มี token เลยคืน `0.0`)",
      "`compute_missing_delta(ref_null_rate: float, current_values: list[float | None]) -> float`: คืนค่า `current_null_rate - ref_null_rate` โดยนับทั้ง `None` และ `float('nan')` เป็นค่าว่าง (ถ้า `current_values` ว่างให้ `raise ValueError`)",
      "`evaluate_drift_report(numeric_psi: float, prob_psi: float, oov_rate: float, missing_delta: float) -> dict[str, object]`: คืน `{\"status\": ..., \"alerts\": [...], \"warnings\": [...]}` โดยใช้เกณฑ์: Alert เมื่อ `numeric_psi >= 0.25` หรือ `prob_psi >= 0.25` หรือ `oov_rate >= 0.30` หรือ `missing_delta >= 0.05`; Warn เมื่อไม่เข้า Alert แต่ `numeric_psi >= 0.10` หรือ `prob_psi >= 0.10` หรือ `oov_rate >= 0.15` หรือ `missing_delta >= 0.02`; นอกนั้นเป็น `\"ok\"`",
    ],
    starter: {
      language: "python",
      filename: "drift_monitor.py",
      code: `import math
import numpy as np
from pythainlp.tokenize import word_tokenize


def compute_psi(
    reference: np.ndarray | list[float],
    current: np.ndarray | list[float],
    bins: int = 10,
    eps: float = 1e-6,
) -> float:
    """คำนวณ Population Stability Index ระหว่างชุดอ้างอิงและชุดปัจจุบัน"""
    # TODO: ตัด NaN, ตรวจว่าง, สร้าง quantile bin edges, คำนวณ PSI อย่างปลอดภัย
    raise NotImplementedError


def compute_thai_oov_rate(texts: list[str], known_vocab: set[str]) -> float:
    """คำนวณสัดส่วนคำภาษาไทย/อังกฤษที่ไม่อยู่ใน known_vocab ด้วย PyThaiNLP newmm"""
    # TODO: ตัดคำด้วย newmm -> lowercase -> คำนวณสัดส่วน OOV
    raise NotImplementedError


def compute_missing_delta(ref_null_rate: float, current_values: list[float | None]) -> float:
    """คำนวณส่วนต่างอัตราค่าว่าง (current_null_rate - ref_null_rate)"""
    # TODO: นับ None และ NaN แล้วคืนผลต่าง
    raise NotImplementedError


def evaluate_drift_report(
    numeric_psi: float,
    prob_psi: float,
    oov_rate: float,
    missing_delta: float,
) -> dict[str, object]:
    """สรุปสถานะ ok / warn / alert พร้อมรายการ alerts และ warnings"""
    # TODO: ตรวจเกณฑ์ alert และ warn แล้วคืน dict รายงาน
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day54.py",
      code: `import numpy as np
import pytest
from drift_monitor import (
    compute_missing_delta,
    compute_psi,
    compute_thai_oov_rate,
    evaluate_drift_report,
)


def test_psi_stable_vs_shifted():
    rng = np.random.default_rng(101)
    ref = rng.normal(1000.0, 150.0, size=1500)
    cur_ok = rng.normal(1005.0, 152.0, size=600)
    cur_drift = rng.normal(1450.0, 250.0, size=600)

    psi_ok = compute_psi(ref, cur_ok)
    psi_drift = compute_psi(ref, cur_drift)
    assert 0.0 <= psi_ok < 0.10
    assert psi_drift >= 0.25


def test_psi_handles_nans_and_rejects_empty():
    ref = [10.0, 20.0, 30.0, 40.0, float("nan")]
    cur = [11.0, 21.0, 31.0, 41.0]
    val = compute_psi(ref, cur, bins=4)
    assert np.isfinite(val)
    with pytest.raises(ValueError):
        compute_psi([], cur)


def test_thai_oov_rate():
    vocab = {"ขอ", "ใบกำกับภาษี", "ครับ", "พร้อมเพย์"}
    low_oov = compute_thai_oov_rate(["ขอใบกำกับภาษีครับ"], vocab)
    high_oov = compute_thai_oov_rate(["คูปองแฟลชเซลล์เมกะแคมเปญ"], vocab)
    assert low_oov == pytest.approx(0.0)
    assert high_oov > 0.5


def test_missing_delta_and_report_levels():
    delta = compute_missing_delta(0.01, [100.0, None, float("nan"), 200.0])
    assert delta == pytest.approx(0.49)

    ok_rep = evaluate_drift_report(0.03, 0.04, 0.05, 0.00)
    assert ok_rep["status"] == "ok"
    assert ok_rep["alerts"] == []

    warn_rep = evaluate_drift_report(0.15, 0.04, 0.08, 0.01)
    assert warn_rep["status"] == "warn"
    assert len(warn_rep["warnings"]) == 1

    alert_rep = evaluate_drift_report(0.05, 0.04, 0.42, 0.08)
    assert alert_rep["status"] == "alert"
    assert len(alert_rep["alerts"]) == 2
`,
    },
    selfCheck: [
      "`compute_psi` ให้ค่า `< 0.10` เมื่อข้อมูลกระจายใกล้เดิม และ `>= 0.25` เมื่อค่าเฉลี่ยเลื่อนแรง โดยไม่มี `nan`/`inf`",
      "`compute_thai_oov_rate` แปลงคำอังกฤษเป็น lowercase และตัดช่องว่างล้วนออกก่อนเทียบกับ `known_vocab`",
      "`compute_missing_delta` นับได้ทั้ง `None` และ `float('nan')` และโยน `ValueError` เมื่ออินพุตว่าง",
      "`evaluate_drift_report` แยกสถานะ `ok` / `warn` / `alert` ได้ตรงเกณฑ์และแจกแจงรายการเหตุผลชัดเจน",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance:
      "ผ่านทั้ง 4 test functions ใน `test_day54.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `compute_psi` แปลงเป็น `np.asarray(..., dtype=float)` แล้วกรองด้วย `arr = arr[~np.isnan(arr)]` ก่อนตรวจ `arr.size == 0` และขยาย `edges[0] = -np.inf`, `edges[-1] = np.inf`",
      },
      {
        body: "ใน `compute_missing_delta` ใช้ `v is None or (isinstance(v, float) and math.isnan(v))` เพื่อตรวจทั้ง `None` และ `NaN` ได้พร้อมกันโดยไม่พังกับ `TypeError`",
      },
      {
        body: "โครงของ `compute_thai_oov_rate` และ `evaluate_drift_report` เกือบครบ เหลือเติม `compute_psi` และ `compute_missing_delta`:",
        code: {
          language: "python",
          filename: "hint_day54.py",
          code: `def compute_thai_oov_rate(texts: list[str], known_vocab: set[str]) -> float:
    vocab_lower = {w.lower() for w in known_vocab}
    tokens = [
        t.lower()
        for doc in texts
        for t in word_tokenize(doc, engine="newmm", keep_whitespace=False)
        if t.strip()
    ]
    if not tokens:
        return 0.0
    oov_count = sum(1 for t in tokens if t not in vocab_lower)
    return oov_count / len(tokens)


def evaluate_drift_report(
    numeric_psi: float, prob_psi: float, oov_rate: float, missing_delta: float
) -> dict[str, object]:
    alerts: list[str] = []
    warnings: list[str] = []
    checks = [
        ("numeric_psi", numeric_psi, 0.10, 0.25),
        ("prob_psi", prob_psi, 0.10, 0.25),
        ("oov_rate", oov_rate, 0.15, 0.30),
        ("missing_delta", missing_delta, 0.02, 0.05),
    ]
    for name, val, warn_th, alert_th in checks:
        if val >= alert_th:
            alerts.append(f"{name}={val:.3f} >= {alert_th}")
        elif val >= warn_th:
            warnings.append(f"{name}={val:.3f} >= {warn_th}")
    status = "alert" if alerts else ("warn" if warnings else "ok")
    return {"status": status, "alerts": alerts, "warnings": warnings}`,
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
      title: "ลืมใส่ epsilon หรือขยายขอบ bin เป็น [-inf, +inf] ในสูตร PSI",
      symptom: "พอข้อมูลใหม่มีค่าสูงกว่าค่าสูงสุดตอนเทรน ค่าใหม่จะหลุดออกจาก `np.histogram` หรือบาง bin เป็น 0 จน `np.log(0)` กลายเป็น `-inf`/`nan`",
      fix: "ตั้ง `edges[0] = -np.inf` และ `edges[-1] = np.inf` เสมอ พร้อม `np.clip(prop, eps, None)` แล้ว re-normalize ก่อนคำนวณ `np.log(a / e)`",
    },
    {
      title: "เห็น Drift Alert แล้วสั่ง Retrain โมเดลอัตโนมัติทันทีโดยไม่เช็ก Upstream Bug",
      symptom: "ต้นเหตุจริงคือระบบ backend เปลี่ยนหน่วยราคาเป็นสตางค์หรือส่งค่า `null` เต็มไปหมด การรีบ retrain ทำให้โมเดลจำข้อมูลพังเข้าไปแทน",
      fix: "ตรวจ `missing_delta` และ {{schema}} ก่อนทุกครั้ง — แยกให้ออกระหว่าง 'data pipeline bug' กับ 'พฤติกรรมลูกค้าเปลี่ยนจริง'",
    },
    {
      title: "คำนวณ PSI บน batch เล็กมากเกินไป (เช่น 10–20 แถว)",
      symptom: "ระบบส่ง alert ปลอมแทบทุกชั่วโมงเพราะจำนวนตัวอย่างน้อยเกินกว่าจะประมาณ histogram 10 ช่วงได้นิ่ง",
      fix: "สะสมข้อมูลในหน้าต่างเวลาที่ใหญ่พอ (อย่างน้อย ~200–500 แถว) หรือลดจำนวน bins ลงเหลือ 5 ช่วงสำหรับ traffic ต่ำ",
    },
    {
      title: "เฝ้าเฉพาะฟีเจอร์ตัวเลขแล้วลืมเฝ้าข้อความภาษาไทย",
      symptom: "ฟีเจอร์ตัวเลขทุกตัว PSI ปกติ แต่ลูกค้าใช้ชื่อแคมเปญ/ศัพท์สินค้าใหม่จน TF-IDF มองไม่เห็นคำสำคัญและ recall ตกหนัก",
      fix: "เฝ้า **Thai OOV Token Rate** และ **Prediction Probability PSI** ควบคู่กับ Numeric PSI เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d054-q1",
        "บริษัทเปลี่ยนนโยบาย SLA ใหม่ให้ทิกเก็ตปัญหา PromptPay ทุกใบกลายเป็น 'ด่วน' ทั้งที่ข้อความและยอดเงินของลูกค้ายังเหมือนเดิม กรณีนี้คือ Drift ประเภทใด?",
        [
          ["Covariate (Feature) Drift เพราะอินพุต $P(X)$ เปลี่ยนไป", "ไม่ตรง — ข้อความและยอดเงิน ($X$) ยังกระจายตัวเหมือนเดิม"],
          ["Concept Drift เพราะความสัมพันธ์ระหว่างอินพุตกับคำตอบที่ถูกต้อง $P(Y|X)$ เปลี่ยนไป", "ถูก — อินพุตหน้าตาเดิมแต่กฎการตีตราความถูกต้องเปลี่ยน ทำให้ต้องอัปเดตป้ายกำกับและ retrain โมเดล"],
          ["Missing-Value Spike เพราะระบบส่งค่าว่างมา", "ไม่ใช่ — ไม่มีข้อมูลสูญหายจากต้นทาง"],
          ["Data Leakage เพราะข้อมูล test รั่วเข้า train", "ไม่ใช่ — เป็นการเปลี่ยนแปลงของนิยามธุรกิจใน Production"],
        ],
        "B",
        "Concept Drift คือการเปลี่ยนของ $P(Y|X)$ (ความหมายของคำตอบเปลี่ยน) ส่วน Covariate/Feature Drift คือการเปลี่ยนของ $P(X)$ (การกระจายตัวของอินพุตเปลี่ยน)",
        "ความต่างระหว่าง Feature (Covariate) Drift กับ Concept Drift คืออะไร?",
        "Feature Drift คือการกระจายตัวของอินพุต $P(X)$ เปลี่ยน (เช่น ยอดสั่งซื้อช่วง 11.11 พุ่ง) ส่วน Concept Drift คือความสัมพันธ์ระหว่างอินพุตกับคำตอบ $P(Y|X)$ เปลี่ยน (เช่น นโยบาย SLA เปลี่ยน)",
      ),
      mc(
        "d054-q2",
        "ค่า Population Stability Index (PSI) ของฟีเจอร์ `order_value_thb` ในสัปดาห์นี้คำนวณได้เท่ากับ `0.31` ควรตีความและรับมืออย่างไรเป็นอันดับแรก?",
        [
          ["ปกติทุกอย่าง (`< 0.50`) ไม่ต้องตรวจสอบใด ๆ", "ผิด — เกณฑ์ Alert ของ PSI คือ `>= 0.25`"],
          ["เกิด Significant Drift (`>= 0.25`) — แจ้งเตือน ตรวจหา upstream schema/unit bug ก่อน แล้วค่อยวิเคราะห์ว่าต้องปรับปรุงหรือ retrain โมเดลหรือไม่", "ถูก — ตรวจ data pipeline bug ก่อนเสมอ แล้วค่อยตัดสินใจเก็บข้อมูลใหม่มา retrain"],
          ["สั่งลบฟีเจอร์ `order_value_thb` ออกจากโมเดลบน Production ทันที", "ผิด — ลบฟีเจอร์โดยไม่เทรนใหม่จะทำให้โมเดลพังทันทีเพราะ schema ไม่ครบ"],
          ["เปลี่ยน `bins` จาก 10 เป็น 2 จนกว่า PSI จะลดลงต่ำกว่า 0.10", "ผิด — การแอบเปลี่ยนวิธีวัดเพื่อซ่อนตัวเลขไม่ช่วยแก้ปัญหาจริง"],
        ],
        "B",
        "เกณฑ์มาตรฐานของ PSI คือ `< 0.10` ปกติ, `0.10–0.25` เฝ้าระวัง, `>= 0.25` Drift รุนแรง — เมื่อ alert ให้เช็กความถูกต้องของ pipeline ต้นทางก่อนตัดสินใจ retrain",
        "เกณฑ์ตีความค่า PSI มาตรฐาน 3 ระดับคืออะไร?",
        "`< 0.10` = ปกติ (OK), `0.10 <= PSI < 0.25` = เริ่มเปลี่ยน/เฝ้าระวัง (WARN), `>= 0.25` = Drift รุนแรง (ALERT)",
      ),
      mc(
        "d054-q3",
        "เหตุใดระบบ ML Production จึงต้องเฝ้า Proxy Signals (เช่น PSI, OOV Rate, Prediction Shift) แทนที่จะรอเฝ้าแค่ค่า PR-AUC หรือ Recall จากเฉลยจริงอย่างเดียว?",
        [
          ["เพราะ PR-AUC คำนวณใน Python ไม่ได้บน Production", "ไม่จริง — คำนวณได้ทันทีเมื่อมีเฉลย"],
          ["เพราะเฉลยจริง (ground-truth labels) มักมาช้าหลายวันหรือหลายสัปดาห์ Proxy Signals ช่วยเตือนความผิดปกติตั้งแต่วันแรกที่ข้อมูลเริ่มเพี้ยน", "ถูก — ช่วยลดระยะเวลาตรวจพบปัญหา (MTTD) จากหลายสัปดาห์เหลือระดับชั่วโมง"],
          ["เพราะ Proxy Signals แม่นยำกว่าการวัดจากเฉลยจริง 100%", "ไม่จริง — Proxy เป็นสัญญาณเตือนล่วงหน้า เมื่อเฉลยจริงมาถึงเรายังต้องวัด metric จริงเสมอ"],
          ["เพราะ PSI สามารถแทนที่ unit test ได้ทั้งหมด", "ไม่เกี่ยวกัน — ทั้งสองอย่างทำคนละหน้าที่"],
        ],
        "B",
        "Delayed Ground Truth เป็นความจริงของระบบ ML แทบทุกงาน (churn, fraud, SLA breach) Proxy Monitoring จึงทำหน้าที่เป็นระบบเตือนภัยล่วงหน้า",
        "Proxy Signals 4 อย่างที่ใช้เฝ้าระวังโมเดล ML เมื่อเฉลยจริงมาช้ามีอะไรบ้าง?",
        "1) Numeric Feature PSI, 2) Thai OOV Token Rate (สำหรับข้อความ), 3) Missing-Value Rate Delta, และ 4) Prediction Probability / Positive-Rate Shift",
      ),
      mc(
        "d054-q4",
        "ในระบบคัดกรองทิกเก็ตภาษาไทยที่ใช้ `PyThaiNLP + TfidfVectorizer` หากจู่ ๆ ค่า **Thai OOV Token Rate** พุ่งจาก 8% เป็น 42% ผลกระทบที่เกิดขึ้นกับโมเดลคืออะไร?",
        [
          ["`TfidfVectorizer` จะเทรนพจนานุกรมใหม่ให้อัตโนมัติระหว่างทำนาย", "ผิด — `.transform()` ใช้ vocabulary เดิมเท่านั้น ไม่เรียนรู้คำใหม่เอง"],
          ["คำศัพท์ใหม่กว่า 42% จะถูกข้ามไปเงียบ ๆ จนเวกเตอร์ TF-IDF ว่างเปล่ามากขึ้น ทำให้ความแม่นยำในการจัดลำดับความสำคัญตกลง", "ถูก — โมเดลจะไม่เห็นสัญญาณจากชื่อโปรโมชันหรือบริการใหม่เลยจนกว่าจะอัปเดต custom dict และ retrain"],
          ["API จะโยน `KeyError` และคืน HTTP 500 ทันที", "ผิด — `TfidfVectorizer.transform` ข้าม OOV token ไปเงียบ ๆ จึงเป็น silent failure"],
          ["ความเร็ว inference จะช้าลง 100 เท่า", "ไม่ใช่ — ตัวเลขความเร็วยังใกล้เคียงเดิม แต่คุณภาพการทำนายจะตก"],
        ],
        "B",
        "`TfidfVectorizer.transform()` จะเมินคำที่ไม่อยู่ใน `vocabulary_` ไปเงียบ ๆ การติดตาม OOV rate จึงเป็นตัวชี้วัด Drift ที่ตรงจุดที่สุดสำหรับโมเดลข้อความภาษาไทย",
        "เมื่อค่า Thai OOV Token Rate พุ่งสูงใน Production เกิดอะไรขึ้นกับ `TfidfVectorizer`?",
        "คำใหม่ที่ไม่อยู่ใน `vocabulary_` ตอนเทรนจะถูกข้ามไปเงียบ ๆ ทำให้โมเดลเสียสัญญาณข้อความสำคัญและประสิทธิภาพตกโดยไม่โยน error",
      ),
    ],
  },

  takeaways: [
    "โมเดล ML พังแบบเงียบ (Silent Failure) โดย API ยังคืน HTTP 200 — ต้องแยกให้ออกระหว่าง **Upstream Bug**, **{{feature-drift|Covariate Drift}}** ($P(X)$ เปลี่ยน) และ **Concept Drift** ($P(Y|X)$ เปลี่ยน)",
    "**PSI** คือไม้บรรทัดมาตรฐานสำหรับฟีเจอร์ตัวเลขและค่าความน่าจะเป็น (`< 0.10` ปกติ, `0.10–0.25` เฝ้าระวัง, `>= 0.25` แจ้งเตือน) โดยต้องใช้ quantile bins จากชุดอ้างอิง + ขอบ `[-inf, +inf]` + `eps` กัน `log(0)`",
    "สำหรับระบบข้อความภาษาไทย ให้เฝ้า **Thai OOV Token Rate** (ผ่าน {{pythainlp}}) คู่กับ **Missing-Value Spike** และ **Prediction Shift** เพื่อรับมือช่วงที่เฉลยจริงยังมาไม่ถึง",
    "เมื่อเกิด Drift Alert ให้ตรวจ upstream schema/pipeline bug ก่อนเสมอ แล้วค่อยตัดสินใจเก็บข้อมูลใหม่มาติดป้ายเพื่อ retrain เวอร์ชันถัดไป",
  ],

  reviewCards: [
    rc(
      "d054-rc-1",
      "ทำไมสูตร PSI ต้องใช้ `np.clip(..., eps, None)` และตั้งขอบ bin แรก/สุดท้ายเป็น `-np.inf` กับ `+np.inf`?",
      "ขอบ `[-inf, +inf]` ช่วยรับค่าใหม่ที่อยู่นอกช่วงตอนเทรนไม่ให้ตกหล่น ส่วน `eps` ป้องกัน bin ที่เป็น 0 ทำให้เกิดการหารด้วย 0 หรือ `log(0)` (`-inf`/`nan`)",
    ),
    rc(
      "d054-rc-2",
      "หากระบบแจ้งเตือนทั้ง `missing_delta = +0.18` และ `numeric_psi = 0.65` พร้อมกัน สิ่งแรกที่ควรทำคืออะไร?",
      "ตรวจ upstream ingestion pipeline และ API schema ต้นทางก่อน (มักเป็นบั๊กส่งค่าว่างหรือเปลี่ยนหน่วยข้อมูล) อย่าเพิ่งรีบสั่ง retrain โมเดลด้วยข้อมูลที่เสียหาย",
    ),
    rc(
      "d054-rc-3",
      "ทำไม Thai OOV Token Rate จึงเป็น Proxy Signal สำคัญสำหรับโมเดลข้อความภาษาไทย?",
      "เพราะ `TfidfVectorizer.transform()` ข้ามคำศัพท์ใหม่ที่ไม่เคยเห็นตอนเทรนไปเงียบ ๆ หาก OOV rate พุ่งสูงแสดงว่ามีศัพท์แคมเปญหรือบริการใหม่ที่โมเดลอ่านไม่ออกแล้ว",
    ),
  ],

  sources: [
    {
      label: "Evidently AI — Population Stability Index (PSI) Explained",
      href: "https://www.evidentlyai.com/ranking-metrics/population-stability-index",
    },
    {
      label: "Google Cloud Architecture Center — MLOps: Continuous Delivery & Model Monitoring",
      href: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning",
    },
    {
      label: "NumPy Documentation — histogram & quantile",
      href: "https://numpy.org/doc/stable/reference/generated/numpy.histogram.html",
    },
    {
      label: "PyThaiNLP Documentation — Word Tokenization (newmm)",
      href: "https://pythainlp.github.io/docs/5.0/api/tokenize.html",
    },
  ],

  glossary: [
    "feature-drift",
    "pythainlp",
    "tfidf",
    "schema",
    "structlog",
    "precision-recall",
    "fail-fast",
    "pytest",
  ],
});
