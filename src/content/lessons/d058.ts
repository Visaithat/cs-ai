import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D058 — Phase 2 / Block B15
 * Export & Benchmark Inference Latency (<10ms)
 */
export const d058: Lesson = defineLesson({
  day: 58,
  titleTh: "Export โมเดลและวัด Inference Latency (<10ms) อย่างมืออาชีพ",
  tagline:
    "30 นาที · รันบนเครื่อง 100% CPU ไม่ต้องใช้ API key · ตรวจ Output Parity (np.allclose) และวัด P50/P95/P99 พร้อม Warmup Runs",
  icon: "timer",
  visual: {
    id: "drift-onnx-monitor",
    title: "Export & Benchmark Latency (<10ms) — วัด P50/P95/P99 อย่างมืออาชีพ",
    caption:
      "เปรียบเทียบเวลา inference ระหว่าง Python/joblib, ONNX Runtime และ LLM API พร้อม warmup runs",
    alt: "แผนภาพเปรียบเทียบ inference latency P50/P95 ต่ำกว่า 10 มิลลิวินาที",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "ONNX Runtime", "joblib", "NumPy", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "Export โมเดลเป็น Artifact ที่พร้อมโหลดจริงโดยไม่เพี้ยน",
      body: "โมเดลที่อยู่ใน RAM หลังเทรนเสร็จยังส่งขึ้นเซิร์ฟเวอร์ไม่ได้ ต้องผ่านขั้น {{serialization}} เป็นไฟล์ artifact (`joblib` หรือ {{onnx}}) และพิสูจน์ว่าค่าทำนายหลังโหลดกลับตรงกับโมเดลต้นฉบับทุกทศนิยม",
      lessonNote:
        "วันนี้เราตรวจ Numerical Parity ด้วย `np.allclose` เพื่อรับประกันว่าการ export ไม่ทำให้คะแนนความน่าจะเป็นคลาดเคลื่อน",
    },
    {
      node: 3,
      heading: "วัดความเร็วจริงด้วย P50 / P95 / P99 และ Warmup Runs",
      body: "การจับเวลาแค่รอบเดียวหรือดูแค่ค่าเฉลี่ย (`mean`) มักปิดบังอาการกระตุก (tail latency) ที่ลูกค้าเจอจริงในระบบ production",
      lessonNote:
        "เราสร้าง Benchmark Harness ด้วย `time.perf_counter()` + warmup runs เพื่อตรวจว่าโมเดลผ่านเกณฑ์ `< 10ms` ที่ P95 บน CPU จริงหรือไม่",
    },
    {
      node: 4,
      heading: "แยกวัด Single-Request Latency กับ Batch Throughput",
      body: "API แบบ real-time (จัดลำดับทิกเก็ตทีละใบตอนลูกค้าส่งเข้ามา) แคร์เวลาของ `batch_size=1` ส่วนงานรันย้อนหลังตอนกลางคืนแคร์จำนวนทิกเก็ตต่อวินาที (throughput)",
      lessonNote:
        "เราจะเทียบโครงสร้างทั้งสองโหมดและเปรียบเทียบกับความหน่วงของ {{llm}} API (~800ms) เพื่อใช้เป็นตัวเลขจริงใน Memo วัน Day 60",
    },
    {
      node: 5,
      heading: "ตั้ง Latency SLA Gate ป้องกันโค้ดใหม่ทำระบบช้าลง",
      body: "เมื่อทีมเพิ่มฟีเจอร์หรือเปลี่ยน tokenizer ในอนาคต ความเร็วอาจแอบพุ่งจาก 3ms เป็น 45ms โดยไม่มีใครรู้ตัวหากไม่มีเกณฑ์อัตโนมัติเฝ้าไว้",
      lessonNote:
        "รายงาน `BenchmarkReport` วันนี้ถูกออกแบบให้เช็ก `sla_passed` แบบอัตโนมัติ (fail-fast) และนำไปผูกกับ `pytest` ใน Day 59 ได้ทันที",
    },
  ],

  objectives: [
    "**ออกแบบ Inference Benchmark ที่น่าเชื่อถือ** โดยใช้ `time.perf_counter()`, ทำ **Warmup Runs** ก่อนจับเวลาจริง และรายงาน **P50 / P95 / P99** แทนการพึ่งพาค่าเฉลี่ยอย่างเดียว",
    "**ตรวจสอบ Output Parity หลัง Export** (`joblib` และแนวทาง {{onnx}} Runtime) ด้วย `np.allclose(..., atol=1e-5)` และการตรงกันของ predicted class แบบ 100%",
    "**แยกแยะ Single-Request Latency (`batch_size=1`) กับ Batch Throughput** และตรวจสอบว่าโมเดล Thai Ticket Priority ผ่านงบประมาณเวลา `< 10ms` ที่ P95 บน CPU",
  ],

  prerequisites: [
    "ผ่าน Day 53 (พื้นฐาน Model Serialization ด้วย `joblib` / {{onnx}})",
    "คุ้นเคยกับ `scikit-learn` {{sklearn-pipeline}}, `NumPy` และ {{pydantic}}",
    "ใช้ `uv`, `pytest` และ `ruff` บนเครื่องได้คล่อง",
    "รันบนเครื่องได้ 100% บน CPU ไม่ต้องใช้ API key หรือ GPU",
  ],

  setup: {
    intro:
      "ติดตั้งแพ็กเกจหลักสำหรับ export และ benchmark บน CPU (`scikit-learn`, `joblib`, `numpy`, `pydantic`) — ส่วน `onnxruntime` และ `skl2onnx` สามารถติดตั้งเสริมได้หากต้องการลอง export ไฟล์ `.onnx` จริงบนเครื่อง",
    commands: `uv init ai-day58 && cd ai-day58
uv add scikit-learn joblib numpy pydantic
uv add --dev pytest ruff
# (เสริมหากต้องการรัน export .onnx จริง): uv add onnxruntime skl2onnx
uv run python -c "import joblib, numpy, sklearn; print('Ready:', numpy.__version__, sklearn.__version__)"`,
    steps: [
      ["init", "เข้าโฟลเดอร์โปรเจกต์ Phase 2 หรือสร้าง `ai-day58` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `scikit-learn`, `joblib`, `numpy`, `pydantic`, `pytest`, `ruff`"],
      ["verify", "รันเช็กเวอร์ชันสำเร็จพร้อมเริ่มวัด latency บน CPU"],
    ],
    note: "เวลา latency บนเครื่องแต่ละรุ่นต่างกันเล็กน้อย (ขึ้นกับ CPU และโปรแกรมที่เปิดค้างไว้) ควรปิดงานหนักชั่วคราวตอนเก็บตัวเลขสำหรับใส่ README/Memo",
  },

  concepts: [
    {
      id: "proper-latency-benchmarking",
      title: "1 · ทำไม `time.time()` และค่า Mean ถึงหลอกตา: Warmup + `perf_counter` + P95/P99",
      paragraphs: [
        "ความผิดพลาดยอดฮิตตอนวัดความเร็วโมเดล ML คือเขียน `t0 = time.time(); model.predict(x); print(time.time() - t0)` เพียงครั้งเดียว ปัญหาคือ: (1) `time.time()` เป็น wall-clock ที่ความละเอียดต่ำกว่าและอาจกระโดดเมื่อระบบซิงก์นาฬิกา — ต้องใช้ **`time.perf_counter()`** ที่เป็น monotonic high-resolution timer เสมอ",
        "(2) รอบแรก ๆ ของการรัน (**Cold Start**) มักช้ากว่าปกติเพราะ CPU cache ยังว่าง, memory allocator เพิ่งจองพื้นที่ หรือ {{onnx}} Runtime เพิ่งสร้าง execution graph — จึงต้องรัน **Warmup Runs** (เช่น 10–20 รอบ) ทิ้งก่อนเริ่มเก็บสถิติจริง",
        "(3) **ค่าเฉลี่ย (Mean) ปิดบัง Tail Latency**: ถ้าร้อยคำขอใช้เวลา 95 ครั้งที่ `2ms` แต่อีก 5 ครั้งกระตุกไปที่ `45ms` ค่าเฉลี่ยจะดูสวยแค่ `4.1ms` ทั้งที่ผู้ใช้ 1 ใน 20 คนต้องรอเกือบ 50ms! วิศวกรระบบจึงดู **P50 (median)**, **P95** และ **P99** เป็นมาตรฐานหลัก",
      ],
      analogy:
        "เหมือนจับเวลาเดินทางไปทำงาน: อย่าบอกหัวหน้าว่า 'เฉลี่ย 20 นาที' ถ้าทุกวันจันทร์รถติด 1 ชั่วโมง (P95 = 60 นาที) — และอย่าเอาเวลาวันแรกที่เพิ่งหาทางเข้าออฟฟิศ (cold start) มานับรวมเป็นเวลาปกติ",
      bullets: [
        "ใช้ `(time.perf_counter() - t0) * 1000.0` เพื่อแปลงเป็นมิลลิวินาที (`ms`) อย่างแม่นยำ",
        "ทำ **Warmup 10–20 รอบ** ก่อนเข้าลูปวัดจริงอย่างน้อย 100–500 รอบ",
        "คำนวณ `p50, p95, p99 = np.percentile(latencies_ms, [50, 95, 99])` และตั้ง SLA บน **P95** (เช่น `p95_ms < 10.0`)",
      ],
      code: {
        language: "python",
        filename: "benchmark_harness.py",
        code: `import time
from collections.abc import Callable
import numpy as np


def measure_latency_ms(
    fn: Callable[[], object],
    n_runs: int = 200,
    warmup_runs: int = 20,
) -> dict[str, float]:
    # 1) Warmup: อุ่น CPU cache และ runtime ก่อน ไม่นับรวมในสถิติ
    for _ in range(warmup_runs):
        fn()

    # 2) วัดเวลาจริงทีละคำขอด้วย monotonic high-resolution clock
    samples_ms: list[float] = []
    for _ in range(n_runs):
        t0 = time.perf_counter()
        fn()
        samples_ms.append((time.perf_counter() - t0) * 1000.0)

    arr = np.array(samples_ms, dtype=np.float64)
    p50, p95, p99 = np.percentile(arr, [50, 95, 99])
    return {
        "mean_ms": round(float(arr.mean()), 3),
        "p50_ms": round(float(p50), 3),
        "p95_ms": round(float(p95), 3),
        "p99_ms": round(float(p99), 3),
    }`,
        caption: "โครงสร้าง Benchmark Harness มาตรฐาน: Warmup → perf_counter ลูปวัดจริง → คำนวณ P50/P95/P99",
      },
      whyTitle: "Why this matters — ตัวเลข P95 คือภาษาที่ทีม Backend และ SRE ใช้คุยกัน",
      whyParagraphs: [
        "เมื่อนำโมเดลไปวางหลัง FastAPI ใน Phase 5 งบประมาณความหน่วง (latency budget) ของทั้ง API อาจอยู่ที่ 50ms ถ้าส่วน ML กินไปไม่เกิน 10ms ที่ P95 คุณจะเหลือเวลาพอสำหรับ auth, DB lookup และ network โดยไม่ทำเว็บอืด",
        "การรายงานครบทั้ง P50, P95, P99 และจำนวน `n_runs` + `warmup_runs` ทำให้ผล benchmark ของคุณตรวจสอบซ้ำได้ ({{reproducibility}}) และดูเป็นมืออาชีพทันที",
      ],
    },
    {
      id: "single-vs-batch-and-onnx",
      title: "2 · Single-Request vs Batch และเมื่อไรควรใช้ `joblib` vs `ONNX Runtime`",
      paragraphs: [
        "ต้องเลือกโหมดการวัดให้ตรงกับลักษณะการใช้งานจริง: ในงาน **Online API** ลูกค้าส่งทิกเก็ตเข้ามาทีละ 1 ข้อความ (`batch_size=1`) เวลาที่สำคัญคือ **per-request latency (ms)** ส่วนงาน **Offline Backfill** (เช่น จัดหมวดทิกเก็ตย้อนหลัง 100,000 ใบ) เราส่งเป็น batch ทีละ 256–1,024 แถวเพื่อใช้ vectorization ให้คุ้มค่า และวัดเป็น **throughput (tickets/sec)**",
        "สำหรับโมเดล `scikit-learn` (`TfidfVectorizer` + `LogisticRegression` หรือ `LightGBM`) การโหลดผ่าน **`joblib`** นั้นง่ายที่สุดเมื่อฝั่งเซิร์ฟเวอร์เป็น Python เวอร์ชันเดียวกันและมี `scikit-learn` ติดตั้งครบ โดยมักทำ latency ระดับ **0.3–3ms** ต่อ 1 ทิกเก็ตบน CPU อยู่แล้ว",
        "แต่เมื่อคุณต้องลดขนาด Docker image, หลีกเลี่ยงความไม่เข้ากันของเวอร์ชัน `scikit-learn`/pickle ข้ามสภาพแวดล้อม, หรือต้องการเร่งความเร็วโมเดลต้นไม้ขนาดใหญ่บน CPU หลายภาษา การ export เป็น **{{onnx}}** แล้วรันผ่าน `onnxruntime.InferenceSession` มักช่วยลด overhead ของ Python และลด P95 ลงได้อีกมาก (โดยเฉพาะเมื่อส่งฟีเจอร์ตัวเลข/เมทริกซ์เข้า ONNX ตรง ๆ)",
      ],
      analogy:
        "เทียบ `joblib` กับ `ONNX` เหมือนส่งไฟล์เอกสาร: `joblib` คือไฟล์ `.docx` ที่ต้องเปิดด้วย Word รุ่นเดียวกันเป๊ะ ส่วน `ONNX` คือไฟล์ `.pdf` มาตรฐานที่เปิดอ่านได้เร็วและเหมือนกันบนเครื่องไหนก็ได้โดยไม่ต้องลงชุดโปรแกรมใหญ่",
      bullets: [
        "**`joblib`**: เร็วมากสำหรับการพัฒนาและ Python service ที่คุมเวอร์ชันด้วย `uv.lock` — รองรับ custom Thai tokenizer ใน `Pipeline` ได้ตรง ๆ",
        "**`ONNX Runtime`**: มาตรฐานข้ามแพลตฟอร์ม, ปลอดภัยกว่า pickle, ใช้ RAM น้อย, เร็วมากสำหรับโมเดลตัวเลข/Linear/LightGBM (หมายเหตุ: ขั้นตัดคำ `PyThaiNLP` มักทำฝั่ง Python ก่อน แล้วส่ง token ที่คั่นด้วยช่องว่างหรือเวกเตอร์เข้า ONNX)",
        "**เทียบกับ {{llm}} API**: Classical ML ใช้ ~1–5ms และแทบไม่มีค่า API ส่วน LLM API ใช้ ~600–1,500ms (ช้ากว่า ~200x–500x) และเสียค่า token ทุกคำขอ",
      ],
      code: {
        language: "python",
        filename: "onnx_export_pattern.py",
        code: `# แพตเทิร์น Export scikit-learn เป็น ONNX และรันด้วย ONNX Runtime
# (ต้องติดตั้ง: uv add skl2onnx onnxruntime)
#
# from skl2onnx import convert_sklearn
# from skl2onnx.common.data_types import FloatTensorType
# import onnxruntime as ort
#
# initial_type = [("features", FloatTensorType([None, X_train.shape[1]]))]
# onnx_model = convert_sklearn(clf, initial_types=initial_type, options={id(clf): {"zipmap": False}})
# with open("ticket_clf.onnx", "wb") as f:
#     f.write(onnx_model.SerializeToString())
#
# sess = ort.InferenceSession("ticket_clf.onnx", providers=["CPUExecutionProvider"])
# input_name = sess.get_inputs()[0].name
# _, probs = sess.run(None, {input_name: X_sample.astype("float32")})`,
        caption: "ปิด `zipmap: False` ตอน export เป็น ONNX เพื่อให้ได้ NumPy array ความน่าจะเป็นตรง ๆ ที่เร็วกว่า list of dicts มาก",
      },
      whyTitle: "Why this matters — หลีกเลี่ยงกับดัก Overhead ของ Python Wrapper",
      whyParagraphs: [
        "บ่อยครั้งที่โมเดลคำนวณจริงแค่ `0.2ms` แต่โค้ดรอบข้างดันเสียเวลาไป `15ms` เพราะสร้าง `DataFrame` ใหม่ทุก request, โหลดไฟล์โมเดลจากดิสก์ใหม่ทุกรอบ หรือสร้าง `dict_trie` ใหม่ซ้ำ ๆ",
        "การวัด latency ของฟังก์ชัน inference ตั้งแต่รับสตริงดิบจนคืนผลลัพธ์ (end-to-end) จะเผยคอขวดเหล่านี้ให้เห็นทันที",
      ],
    },
    {
      id: "parity-and-sla-gate",
      title: "3 · Output Parity (`np.allclose`) และ Latency SLA Gate แบบ Fail-Fast",
      paragraphs: [
        "ความเร็วไม่มีความหมายเลยถ้าโมเดลที่ export ออกมาทายไม่เหมือนโมเดลต้นฉบับ! ความคลาดเคลื่อนอาจเกิดจากหลายสาเหตุ เช่น แปลง `float64` เป็น `float32`, ลำดับคลาสสลับกัน, หรือพารามิเตอร์ `zipmap`/preprocessing ตกหล่นระหว่าง export",
        "ดังนั้นทุกสคริปต์ export ต้องจบด้วย **Parity Verification** 2 ชั้นแบบ {{fail-fast}}: (1) ค่าความน่าจะเป็นต้องใกล้เคียงกันภายในเกณฑ์ `np.allclose(orig_probs, exported_probs, atol=1e-5)` และ (2) คลาสที่ทำนาย (`argmax` หรือ `prob >= threshold`) บนชุดตัวอย่างต้องตรงกัน **100%**",
        "เมื่อผ่าน Parity แล้ว จึงรัน Benchmark เพื่อตรวจ **Latency SLA Gate** (`p95_ms < 10.0`) และบันทึกผลเป็น JSON/Markdown report แนบคู่กับไฟล์โมเดล (Model Card) เพื่อให้ทีมตรวจสอบย้อนหลังได้เสมอ",
      ],
      analogy:
        "เหมือนย้ายสูตรอาหารจากครัวทดลองเข้าสายพานโรงงาน: ต้องชิมเทียบก่อนว่ารสชาติตรงสูตรเดิมเป๊ะ (Parity) แล้วค่อยจับเวลาสายพานว่าผลิตทันตามเป้าหรือไม่ (SLA Gate)",
      bullets: [
        "ตรวจ `orig_probs.shape == exported_probs.shape` ก่อนเสมอ เพื่อกันบั๊ก broadcast ของ NumPy",
        "วัด `max_abs_diff = float(np.max(np.abs(orig_probs - exported_probs)))` เก็บไว้ในรายงาน export",
        "ให้สคริปต์ export โยน `ValueError` ทันทีถ้า Parity ไม่ผ่าน — ห้ามส่งออกไฟล์โมเดลที่เพี้ยนขึ้น production เด็ดขาด",
      ],
      whyTitle: "Why this matters — ความมั่นใจตอน Deploy เปลี่ยนเวอร์ชันโมเดล",
      whyParagraphs: [
        "เมื่อมี Parity Check + Latency SLA Gate อัตโนมัติ ทุกครั้งที่คุณอัปเดตพจนานุกรมหรือเทรนโมเดลรุ่นใหม่ (`v1.1`, `v1.2`) ระบบจะการันตีให้ทันทีว่าไฟล์ artifact ใช้งานได้จริงและไม่ช้าเกินงบ",
        "รูปแบบนี้ยังเป็นพื้นฐานของ CI Quality Gate สำหรับ AI service ที่คุณจะได้ทำเต็มรูปแบบใน Phase 5",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ ML Latency Benchmarking กับ API Load/Perf Testing",
      body: [
        "แนวคิดเรื่อง Warmup, P95/P99 และ SLA Budget เหมือนกับการทำ performance benchmark ให้ REST/GraphQL API ในฝั่งเว็บ:",
      ],
      table: [
        ["Warmup runs (ไม่นับรวมสถิติ)", "อุ่น JVM/V8 JIT, connection pool และ cache ก่อนเก็บผล k6/autocannon"],
        ["`time.perf_counter()`", "`performance.now()` (monotonic high-resolution timer ไม่ใช่ `Date.now()`)"],
        ["P50 / P95 / P99 latency", "ตัวชี้วัด SLA เดียวกับ APM (Datadog / Grafana / Lighthouse)"],
        ["`np.allclose` Parity Check", "Snapshot / Golden-Output Diff หลัง refactor หรือเปลี่ยน build target"],
        ["`batch_size=1` vs `batch_size=256`", "Single API request latency vs Bulk background job throughput"],
      ],
    },
    student: {
      title: "First-Year Note — P95 หมายความว่าอย่างไรกันแน่?",
      body: [
        "สมมติเราจับเวลาการทำนาย 100 ครั้ง แล้วนำตัวเลขทั้ง 100 ค่ามาเรียงจากเร็วสุดไปช้าสุด ค่า **P50 (Percentile ที่ 50)** คือค่าตัวกลาง (ครึ่งหนึ่งเร็วกว่านี้ อีกครึ่งช้ากว่านี้)",
        "ส่วนค่า **P95 (Percentile ที่ 95)** คือค่าที่บอกว่า **95% ของคำขอทั้งหมดเสร็จเร็วกว่าหรือเท่ากับเวลานี้** (มีเพียง 5% ที่ช้ากว่า) — ดังนั้นถ้าเราตั้งเป้า `P95 < 10ms` แปลว่าลูกค้าอย่างน้อย 95 ใน 100 คนจะได้คำตอบเร็วกว่า 10 มิลลิวินาที!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีโมเดลจัดลำดับความเร่งด่วนทิกเก็ตภาษาไทยที่ผ่านการปรับปรุงแล้ว มาลองทำครบทั้ง 3 ขั้น: (1) เทรนและ Export ด้วย `joblib`, (2) ตรวจ Numerical Parity ด้วย `np.allclose`, และ (3) วัด Single-Request vs Batch Latency พร้อม Warmup เพื่อเช็กเกณฑ์ `< 10ms` P95",
    steps: [
      {
        title: "1 · เทรน Pipeline และ Export Artifact ด้วย `joblib`",
        explain:
          "ใช้ฟีเจอร์ข้อความ `TfidfVectorizer` (character/word n-grams ที่ serialize ได้สะอาด 100% โดยไม่ติดปัญหา lambda) คู่กับ `LogisticRegression` แล้วบันทึกเป็นไฟล์ `.joblib` พร้อมเช็กขนาดไฟล์",
        code: {
          language: "python",
          filename: "worked_d058.py",
          code: `from pathlib import Path
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

train_texts = [
    "โอนซ้ำ เงินหายจากบัญชี ด่วนมาก",
    "พบสลิปปลอม กรุณาตรวจสอบทันที",
    "ระบบล่ม ตัดบัตรซ้ำ ชำระเงินไม่ได้",
    "เข้าบัญชีไม่ได้ OTP ไม่เข้า ด่วน",
    "สอบถามเวลาเปิดร้านครับ",
    "ขอเปลี่ยนที่อยู่จัดส่งหน่อยค่ะ",
    "สินค้าสีดำมีของไหมครับ",
    "ขอใบเสร็จย้อนหลังเดือนที่แล้ว",
]
train_labels = [1, 1, 1, 1, 0, 0, 0, 0]

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))),
    ("clf", LogisticRegression(C=3.0, random_state=42)),
])
pipe.fit(train_texts, train_labels)

artifact_path = Path("ticket_priority_v1.joblib")
joblib.dump(pipe, artifact_path, compress=3)
print(f"Exported: {artifact_path} ({artifact_path.stat().st_size / 1024:.1f} KB)")`,
        },
        output: `Exported: ticket_priority_v1.joblib (4.8 KB)`,
      },
      {
        title: "2 · โหลด Artifact กลับและตรวจ Output Parity ด้วย `np.allclose`",
        explain:
          "โหลดโมเดลกลับจากดิสก์ในสถานะเหมือนตอนเซิร์ฟเวอร์เริ่มทำงาน แล้วเทียบเมทริกซ์ `predict_proba` กับโมเดลต้นฉบับทั้งค่าความน่าจะเป็นและคลาสที่ทำนาย",
        code: {
          language: "python",
          filename: "worked_d058.py",
          code: `loaded_pipe = joblib.load(artifact_path)

sample_texts = [
    "โอนซ้ำสองรอบ เงินยังไม่เข้า ด่วน",
    "สอบถามโปรโมชันวันเกิดครับ",
    "ระบบล่มตัดบัตรซ้ำ",
]

orig_probs = pipe.predict_proba(sample_texts)
loaded_probs = loaded_pipe.predict_proba(sample_texts)

max_diff = float(np.max(np.abs(orig_probs - loaded_probs)))
probs_close = bool(np.allclose(orig_probs, loaded_probs, atol=1e-6))
labels_match = bool(np.array_equal(orig_probs.argmax(axis=1), loaded_probs.argmax(axis=1)))

print(f"Parity close={probs_close} | labels_match={labels_match} | max_diff={max_diff:.2e}")`,
        },
        output: `Parity close=True | labels_match=True | max_diff=0.00e+00`,
      },
      {
        title: "3 · วัด Single-Request (`batch_size=1`) vs Batch (100 ข้อความ) พร้อม Warmup",
        explain:
          "อุ่นเครื่อง 20 รอบก่อน แล้วจับเวลาการทำนายทีละ 1 ทิกเก็ต 200 รอบด้วย `time.perf_counter()` เพื่อคำนวณ P50/P95/P99 และเปรียบเทียบกับโหมด batch 100 ทิกเก็ต",
        code: {
          language: "python",
          filename: "worked_d058.py",
          code: `import time

single_input = ["โอนซ้ำสองรอบ เงินยังไม่เข้า ด่วนมาก"]
batch_input = sample_texts * 34  # 102 tickets

# Warmup
for _ in range(20):
    loaded_pipe.predict_proba(single_input)

single_ms = []
for _ in range(200):
    t0 = time.perf_counter()
    loaded_pipe.predict_proba(single_input)
    single_ms.append((time.perf_counter() - t0) * 1000.0)

p50, p95, p99 = np.percentile(single_ms, [50, 95, 99])
print(f"Single (batch=1) | P50={p50:.3f}ms | P95={p95:.3f}ms | P99={p99:.3f}ms | SLA<10ms={p95 < 10.0}")

t0 = time.perf_counter()
loaded_pipe.predict_proba(batch_input)
batch_ms = (time.perf_counter() - t0) * 1000.0
throughput = len(batch_input) / (batch_ms / 1000.0)
print(f"Batch ({len(batch_input)} items) | total={batch_ms:.3f}ms | throughput={throughput:,.0f} tickets/sec")`,
        },
        output: `Single (batch=1) | P50=0.412ms | P95=0.587ms | P99=0.814ms | SLA<10ms=True
Batch (102 items) | total=3.920ms | throughput=26,020 tickets/sec`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมากเวลา export `TfidfVectorizer(tokenizer=...)` ด้วย `joblib`: ถ้าส่ง **lambda** หรือฟังก์ชันที่ประกาศไว้ใน local scope (closure) `joblib.dump` จะพังด้วย `AttributeError: Can't pickle local object`! ต้องประกาศฟังก์ชัน tokenizer ไว้ระดับ top-level ของโมดูล (หรือใช้คลาสที่ import ได้จาก path เดิม)",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `latency_benchmark.py` สำหรับ export โมเดล, ตรวจสอบ Numerical Parity แบบ fail-fast และวัด Inference Latency (P50/P95/P99) พร้อม Warmup Runs ตาม SLA `< 10ms`",
    requirements: [
      "ประกาศ `BenchmarkReport(BaseModel)` ของ Pydantic v2 มีฟิลด์ `n_runs: int`, `warmup_runs: int`, `mean_ms: float`, `p50_ms: float`, `p95_ms: float`, `p99_ms: float`, `sla_ms: float`, `sla_passed: bool`",
      "`verify_prediction_parity(orig_probs: np.ndarray, exported_probs: np.ndarray, atol: float = 1e-5) -> tuple[bool, float]`: ตรวจว่า shape ตรงกัน, ค่าใกล้เคียงกันด้วย `np.allclose(..., atol=atol)` และคลาสทำนาย (`argmax(axis=-1)` สำหรับ 2D หรือ `>= 0.5` สำหรับ 1D) ตรงกัน 100% คืน `(passed, max_abs_diff)` (ถ้า shape ไม่ตรงให้โยน `ValueError`)",
      "`benchmark_single_inference(predict_fn: Callable[[], object], n_runs: int = 100, warmup_runs: int = 10, sla_ms: float = 10.0) -> BenchmarkReport`: รัน `predict_fn()` จำนวน `warmup_runs` รอบโดยไม่จับเวลา จากนั้นจับเวลา `n_runs` รอบด้วย `time.perf_counter()` แปลงเป็น ms, คำนวณ mean/P50/P95/P99 (ปัดทศนิยม 3 ตำแหน่ง) และตั้ง `sla_passed = p95_ms < sla_ms` (ตรวจว่า `n_runs >= 1` และ `warmup_runs >= 0` มิฉะนั้นโยน `ValueError`)",
      "`export_and_verify_joblib(model, X_sample, output_path: Path, atol: float = 1e-5) -> tuple[Path, float]`: สร้างโฟลเดอร์ปลายทางอัตโนมัติ, เซฟด้วย `joblib.dump`, โหลดกลับด้วย `joblib.load`, ตรวจ parity ของ `predict_proba(X_sample)` ด้วย `verify_prediction_parity` — ถ้าไม่ผ่านให้โยน `ValueError` ทันที (fail-fast) ถ้าผ่านคืน `(output_path, max_abs_diff)`",
    ],
    starter: {
      language: "python",
      filename: "latency_benchmark.py",
      code: `import time
from collections.abc import Callable
from pathlib import Path
import joblib
import numpy as np
from pydantic import BaseModel, Field


class BenchmarkReport(BaseModel):
    n_runs: int = Field(ge=1)
    warmup_runs: int = Field(ge=0)
    mean_ms: float = Field(ge=0.0)
    p50_ms: float = Field(ge=0.0)
    p95_ms: float = Field(ge=0.0)
    p99_ms: float = Field(ge=0.0)
    sla_ms: float = Field(gt=0.0)
    sla_passed: bool


def verify_prediction_parity(
    orig_probs: np.ndarray,
    exported_probs: np.ndarray,
    atol: float = 1e-5,
) -> tuple[bool, float]:
    """ตรวจความตรงกันของค่าความน่าจะเป็นและคลาสทำนายหลัง export"""
    # TODO: ตรวจ shape, np.allclose, และความตรงกันของ predicted labels
    raise NotImplementedError


def benchmark_single_inference(
    predict_fn: Callable[[], object],
    n_runs: int = 100,
    warmup_runs: int = 10,
    sla_ms: float = 10.0,
) -> BenchmarkReport:
    """รัน warmup แล้ววัด latency P50/P95/P99 ด้วย time.perf_counter()"""
    # TODO: validate args -> warmup -> measure -> return BenchmarkReport
    raise NotImplementedError


def export_and_verify_joblib(
    model,
    X_sample,
    output_path: Path,
    atol: float = 1e-5,
) -> tuple[Path, float]:
    """Export โมเดลด้วย joblib แล้วโหลดกลับตรวจ parity แบบ fail-fast"""
    # TODO: mkdir -> joblib.dump -> joblib.load -> verify_prediction_parity
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_latency_benchmark.py",
      code: `from pathlib import Path
import numpy as np
import pytest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from latency_benchmark import (
    benchmark_single_inference,
    export_and_verify_joblib,
    verify_prediction_parity,
)


def _train_demo_pipeline() -> Pipeline:
    texts = [
        "โอนซ้ำ เงินหาย ด่วนมาก",
        "สลิปปลอม ตัดบัตรซ้ำ ด่วน",
        "ระบบล่ม ใช้งานไม่ได้",
        "สอบถามเวลาเปิดร้านครับ",
        "ขอเปลี่ยนที่อยู่จัดส่งค่ะ",
        "สินค้ามีสีดำไหมครับ",
    ]
    labels = [1, 1, 1, 0, 0, 0]
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))),
        ("clf", LogisticRegression(random_state=42)),
    ])
    pipe.fit(texts, labels)
    return pipe


def test_verify_prediction_parity_pass_fail_and_shape_error():
    a = np.array([[0.2, 0.8], [0.9, 0.1]])
    b = np.array([[0.2 + 1e-7, 0.8 - 1e-7], [0.9, 0.1]])
    passed, diff = verify_prediction_parity(a, b, atol=1e-5)
    assert passed is True
    assert diff < 1e-5

    # ค่าต่างเกิน tolerance
    c = np.array([[0.6, 0.4], [0.9, 0.1]])
    passed2, diff2 = verify_prediction_parity(a, c, atol=1e-5)
    assert passed2 is False
    assert diff2 == pytest.approx(0.4)

    with pytest.raises(ValueError):
        verify_prediction_parity(a, np.array([0.8, 0.1]))


def test_benchmark_runs_warmup_and_meets_sla():
    calls = 0

    def fast_fn():
        nonlocal calls
        calls += 1
        return 1

    report = benchmark_single_inference(fast_fn, n_runs=50, warmup_runs=10, sla_ms=10.0)
    assert calls == 60  # 10 warmup + 50 measured
    assert report.n_runs == 50
    assert report.warmup_runs == 10
    assert report.p50_ms <= report.p95_ms <= report.p99_ms
    assert report.sla_passed is True


def test_export_verify_and_benchmark_real_pipeline(tmp_path: Path):
    pipe = _train_demo_pipeline()
    sample = ["โอนซ้ำ เงินไม่เข้า ด่วน", "สอบถามเวลาเปิดร้าน"]
    out_file = tmp_path / "artifacts" / "model.joblib"

    saved_path, max_diff = export_and_verify_joblib(pipe, sample, out_file)
    assert saved_path.is_file()
    assert max_diff < 1e-6

    report = benchmark_single_inference(
        lambda: pipe.predict_proba(["โอนซ้ำ เงินไม่เข้า ด่วน"]),
        n_runs=60,
        warmup_runs=10,
        sla_ms=10.0,
    )
    assert report.p95_ms < 10.0
    assert report.sla_passed is True
`,
    },
    selfCheck: [
      "`verify_prediction_parity` โยน `ValueError` เมื่อ shape ไม่ตรง และตรวจทั้ง `np.allclose` กับ predicted labels",
      "`benchmark_single_inference` เรียก `predict_fn` ครบ `warmup_runs + n_runs` รอบ และเก็บเวลาเฉพาะ `n_runs` รอบหลัง",
      "ค่า `p50_ms <= p95_ms <= p99_ms` เรียงถูกต้อง และ `sla_passed` สะท้อนเงื่อนไข `p95_ms < sla_ms`",
      "`export_and_verify_joblib` สร้างโฟลเดอร์ปลายทางอัตโนมัติและโหลดกลับมายืนยัน parity จริง",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance:
      "ผ่านทั้ง 3 test functions ใน `test_latency_benchmark.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `verify_prediction_parity` แปลงอินพุตด้วย `np.asarray(..., dtype=np.float64)` ก่อนเช็ก `orig.shape != exp.shape`, คำนวณ `max_diff = float(np.max(np.abs(orig - exp)))` และแยกเทียบคลาสกรณี 1D (`>= 0.5`) กับ 2D (`argmax(axis=-1)`)",
      },
      {
        body: "ใน `benchmark_single_inference` ตรวจ `if n_runs < 1 or warmup_runs < 0 or sla_ms <= 0: raise ValueError(...)` แล้วใช้ `np.percentile(arr, [50, 95, 99])` คำนวณ percentiles ทั้งสามค่าในครั้งเดียว",
      },
      {
        body: "โครงของ `verify_prediction_parity` และ `export_and_verify_joblib` — เหลือเติมลูปจับเวลาใน `benchmark_single_inference`:",
        code: {
          language: "python",
          filename: "hint_day58.py",
          code: `def verify_prediction_parity(
    orig_probs: np.ndarray,
    exported_probs: np.ndarray,
    atol: float = 1e-5,
) -> tuple[bool, float]:
    a = np.asarray(orig_probs, dtype=np.float64)
    b = np.asarray(exported_probs, dtype=np.float64)
    if a.shape != b.shape:
        raise ValueError(f"Shape mismatch: {a.shape} != {b.shape}")
    max_diff = float(np.max(np.abs(a - b))) if a.size else 0.0
    close = bool(np.allclose(a, b, atol=atol))
    if a.ndim == 1:
        labels_ok = bool(np.array_equal(a >= 0.5, b >= 0.5))
    else:
        labels_ok = bool(np.array_equal(a.argmax(axis=-1), b.argmax(axis=-1)))
    return (close and labels_ok), max_diff


def export_and_verify_joblib(model, X_sample, output_path: Path, atol: float = 1e-5) -> tuple[Path, float]:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    orig = model.predict_proba(X_sample)
    joblib.dump(model, output_path, compress=3)
    loaded = joblib.load(output_path)
    exported = loaded.predict_proba(X_sample)
    passed, max_diff = verify_prediction_parity(orig, exported, atol=atol)
    if not passed:
        raise ValueError(f"Export parity failed: max_diff={max_diff}")
    return output_path, max_diff`,
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
      title: "โหลดไฟล์โมเดล (`joblib.load` / `InferenceSession`) ข้างในฟังก์ชันที่ถูกจับเวลาทุกรอบ",
      symptom: "วัด latency ออกมาได้ 40–150ms ทั้งที่การทำนายจริงใช้ไม่ถึง 1ms และเมื่อขึ้น FastAPI เซิร์ฟเวอร์ช้ามาก",
      fix: "โหลดโมเดลเพียงครั้งเดียวตอนเริ่มต้นโปรแกรม (startup/lifespan) แล้วนำอ็อบเจกต์ใน RAM มาทำนายซ้ำทุกคำขอ",
    },
    {
      title: "วัดเวลาแค่ 1–3 รอบแรกโดยไม่ทำ Warmup และรายงานเฉพาะค่าเฉลี่ย (Mean)",
      symptom: "ตัวเลขแกว่งมากทุกครั้งที่รัน และมองไม่เห็น spike ที่ P95/P99",
      fix: "รัน Warmup 10–20 รอบก่อน จากนั้นวัดอย่างน้อย 100 รอบด้วย `time.perf_counter()` แล้วรายงานทั้ง P50, P95, P99",
    },
    {
      title: "Export โมเดลเป็น ONNX/joblib แล้วขึ้น production โดยไม่ตรวจ Parity",
      symptom: "หลัง export ค่าความน่าจะเป็นเพี้ยนหรือคลาสสลับกันเงียบ ๆ เพราะเปิด `zipmap` ผิดหรือแปลงชนิดข้อมูล `float32` คลาดเคลื่อน",
      fix: "บังคับรัน `np.allclose` + ตรวจ predicted labels ตรงกัน 100% เป็นด่าน fail-fast ในสคริปต์ export ทุกครั้ง",
    },
    {
      title: "ใช้ lambda เป็น tokenizer ใน TfidfVectorizer แล้วพยายาม dump ด้วย joblib",
      symptom: "เกิด `PicklingError` หรือ `AttributeError: Can't pickle local object` ตอนเรียก `joblib.dump`",
      fix: "ประกาศฟังก์ชัน tokenizer ระดับ top-level ของโมดูล (เช่น `def thai_tokenize(text: str): ...`) หรือใช้ analyzer ในตัวของ scikit-learn",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d058-q1",
        "ทำไมการวัด Inference Latency ของระบบ AI จึงควรใช้ `time.perf_counter()` ร่วมกับ **Warmup Runs** และรายงาน **P95** แทนการจับเวลาครั้งเดียวด้วย `time.time()`?",
        [
          ["เพราะ `time.time()` ใช้กับ Python 3.12 ไม่ได้แล้ว", "ไม่จริง — ใช้ได้แต่ความละเอียดต่ำกว่าและไม่ monotonic"],
          ["`perf_counter()` ให้ความละเอียดสูงแบบ monotonic, Warmup ตัด cold-start overhead ออก และ P95 สะท้อน tail latency ที่ผู้ใช้จริงเจอได้ดีกว่าค่าเฉลี่ย", "ถูก — นี่คือมาตรฐานการวัด latency ในงานวิศวกรรมระบบ"],
          ["เพราะ Warmup ช่วยให้โมเดลแม่นยำขึ้น (F1 สูงขึ้น)", "ไม่เกี่ยว — Warmup ช่วยอุ่น cache/runtime เพื่อวัด steady-state latency ไม่ได้เปลี่ยนน้ำหนักโมเดล"],
          ["เพราะ P95 จะมีค่าน้อยกว่าค่าเฉลี่ยเสมอ", "ตรงกันข้าม — P95 มักสูงกว่าค่าเฉลี่ยเมื่อมีการกระจายแบบเบ้ขวา (tail spikes)"],
        ],
        "B",
        "การวัด latency ที่เชื่อถือได้ต้องตัดสัญญาณรบกวนจาก cold start ด้วย warmup, ใช้ clock แบบ monotonic (`perf_counter`) และดู tail latency (P95/P99)",
        "องค์ประกอบ 3 อย่างของ Inference Latency Benchmark ที่ถูกต้องคืออะไร?",
        "1) ใช้ `time.perf_counter()` (monotonic high-res), 2) ทำ Warmup Runs ก่อนเก็บสถิติ, 3) รายงาน P50/P95/P99 (ไม่ใช่แค่ mean)",
      ),
      mc(
        "d058-q2",
        "หลัง export โมเดลจาก `scikit-learn` เป็นไฟล์ `.onnx` หรือ `.joblib` วิธีตรวจ **Output Parity** ที่รัดกุมที่สุดคือข้อใด?",
        [
          ["เช็กแค่ว่าขนาดไฟล์มากกว่า 0 ไบต์และโหลดไม่เกิด exception", "ไม่พอ — โมเดลอาจโหลดได้แต่ทายค่าความน่าจะเป็นผิดเงียบ ๆ"],
          ["เทียบ `predict_proba` บนชุดตัวอย่างด้วย `np.allclose(orig, exported, atol=1e-5)` และยืนยันว่าคลาสที่ทำนาย (`argmax`) ตรงกัน 100%", "ถูก — ยืนยันทั้งความแม่นยำเชิงตัวเลขและผลการตัดสินใจปลายทาง"],
          ["เทรนโมเดลใหม่จากศูนย์แล้วเทียบค่า accuracy", "ไม่ใช่การตรวจ parity ของไฟล์ที่ export"],
          ["ตรวจเฉพาะแถวแรกของชุดข้อมูล 1 แถว", "น้อยเกินไป — ควรตรวจบนชุดตัวอย่างที่ครอบคลุมทุกคลาส"],
        ],
        "B",
        "การตรวจทั้ง `np.allclose` บนความน่าจะเป็นและการตรงกันของคลาสทำนาย (`argmax`) ช่วยดักความคลาดเคลื่อนจาก `float32`, ลำดับคลาส หรือการตั้งค่า converter ได้ครบ",
        "Output Parity Check หลัง Export โมเดลควรตรวจอะไรบ้าง?",
        "ตรวจ 2 ชั้น: shape + `np.allclose(orig_probs, exported_probs, atol=1e-5)` และ predicted labels ตรงกัน 100%",
      ),
      mc(
        "d058-q3",
        "หากระบบของคุณเป็น REST API ที่รับทิกเก็ตลูกค้าเข้ามาทีละ 1 ใบแบบ real-time คุณควรยึดตัวเลขใดเป็นหลักในการตรวจ SLA `< 10ms`?",
        [
          ["เวลาเฉลี่ยต่อใบเมื่อรันแบบ batch 1,000 ใบพร้อมกัน (หารด้วย 1,000)", "ผิด — ค่าเฉลี่ยใน batch ใหญ่จะดูต่ำเกินจริงมาก เพราะแบ่งเบา overhead ของการเรียกฟังก์ชันออกไป"],
          ["Single-Request (`batch_size=1`) P95 latency ที่วัดครบตั้งแต่รับข้อความเข้าจนได้ผลทำนาย", "ถูก — สะท้อนประสบการณ์จริงของคำขอ real-time ที่เข้ามาทีละใบ"],
          ["เวลาที่ใช้ตอน `model.fit(...)` หารด้วยจำนวนแถวเทรน", "ผิด — นั่นคือเวลา training ไม่ใช่ inference latency"],
          ["ขนาดไฟล์ `.joblib` หน่วยเป็นกิโลไบต์", "ขนาดไฟล์ไม่ใช่ latency"],
        ],
        "B",
        "Batch throughput เหมาะกับงาน offline backfill แต่ API แบบ real-time ต้องวัด `batch_size=1` end-to-end ที่ P95",
        "Single-Request Latency กับ Batch Throughput ต่างกันอย่างไรและใช้ในสถานการณ์ใด?",
        "Single-Request (`batch_size=1`, วัด P95 ms) ใช้กับ Online API แบบ real-time ส่วน Batch Throughput (items/sec) ใช้กับงาน offline backfill ปริมาณมาก",
      ),
      mc(
        "d058-q4",
        "เมื่อ export โมเดลจัดหมวดหมู่ `scikit-learn` ด้วย `skl2onnx` เพื่อความเร็วสูงสุดใน `ONNX Runtime` เหตุใดจึงนิยมตั้ง option `{\"zipmap\": False}`?",
        [
          ["เพื่อปิดการคำนวณความน่าจะเป็นและคืนค่าสุ่มแทน", "ไม่จริง — ยังคืนความน่าจะเป็นครบทุกคลาส"],
          ["เพื่อให้ ONNX Runtime คืนเมทริกซ์ NumPy ของความน่าจะเป็นโดยตรง แทนการสร้าง list ของ Python dict ทีละแถวซึ่งช้าและกิน RAM กว่า", "ถูก — ช่วยลด overhead การแปลงอ็อบเจกต์ฝั่ง Python ลงอย่างชัดเจน"],
          ["เพราะ `zipmap` ไม่รองรับระบบปฏิบัติการ Windows", "ไม่จริง — รองรับทุก OS แต่มี overhead สูงกว่า"],
          ["เพื่อให้ไฟล์ `.onnx` เข้ารหัสด้วยรหัสผ่าน", "ไม่เกี่ยวกัน — `zipmap` คือรูปแบบโครงสร้างเอาต์พุต"],
        ],
        "B",
        "ค่าเริ่มต้นของ `skl2onnx` (`zipmap=True`) แปลงความน่าจะเป็นแต่ละแถวเป็น `dict` ของ Python ซึ่งเพิ่ม overhead สูง การตั้ง `zipmap=False` จะคืน NumPy array ตรง ๆ",
        "การตั้ง `zipmap=False` ตอนแปลงโมเดล scikit-learn เป็น ONNX มีประโยชน์อย่างไร?",
        "ทำให้ ONNX Runtime คืน probability เป็น NumPy array ตรง ๆ แทน list of dicts ลด Python overhead และทำให้อินเฟอเรนซ์เร็วขึ้นมาก",
      ),
    ],
  },

  takeaways: [
    "วัด Inference Latency อย่างมืออาชีพด้วย **`time.perf_counter()` + Warmup Runs + P50/P95/P99** — อย่าเชื่อการจับเวลาครั้งเดียวหรือค่า mean อย่างเดียว",
    "แยกวัดให้ตรงงาน: **Single-Request (`batch_size=1`) P95 `< 10ms`** สำหรับ Online API และ **Throughput (tickets/sec)** สำหรับงาน Offline Batch",
    "ทุกการ export (`joblib` หรือ {{onnx}}) ต้องผ่าน **Output Parity Check** (`np.allclose` + predicted labels ตรงกัน 100%) แบบ fail-fast ก่อนนำไปใช้จริง",
    "Classical ML บน CPU ทำความเร็วระดับ **< 1–5ms** (เร็วกว่า LLM API หลายร้อยเท่า) ซึ่งจะเป็นตัวเลขสำคัญสำหรับ Engineering Memo ใน Day 60",
  ],

  reviewCards: [
    rc(
      "d058-rc-1",
      "ทำไมต้องทำ Warmup Runs ก่อนจับเวลา Inference Latency?",
      "เพื่อตัดความหน่วงผิดปกติของรอบแรก (Cold Start: CPU cache ว่าง, memory allocation, runtime graph init) ออก ทำให้ตัวเลขสะท้อน steady-state latency ใน production จริง",
    ),
    rc(
      "d058-rc-2",
      "ทำไม `time.perf_counter()` จึงดีกว่า `time.time()` ในการ benchmark?",
      "`perf_counter()` เป็นนาฬิกาความละเอียดสูงแบบ monotonic (เดินหน้าอย่างเดียวไม่ถอยหลังเมื่อ OS ซิงก์เวลา) จึงวัดช่วงเวลาหลักไมโคร/มิลลิวินาทีได้แม่นยำกว่า",
    ),
    rc(
      "d058-rc-3",
      "เกณฑ์ 2 ข้อของ Output Parity Check หลัง Export โมเดลคืออะไร?",
      "1) ค่าความน่าจะเป็นใกล้เคียงเดิมภายใต้ `np.allclose(orig, exported, atol=1e-5)` และ 2) คลาสที่ทำนาย (`argmax` หรือ threshold label) ตรงกัน 100%",
    ),
  ],

  sources: [
    {
      label: "Python Official Docs — time.perf_counter (High-Resolution Monotonic Timer)",
      href: "https://docs.python.org/3/library/time.html#time.perf_counter",
    },
    {
      label: "ONNX Runtime Documentation — Python InferenceSession & Performance Tuning",
      href: "https://onnxruntime.ai/docs/performance/tune-performance/threading.html",
    },
    {
      label: "sklearn-onnx (skl2onnx) — Converting scikit-learn Pipelines & ZipMap Option",
      href: "https://onnx.ai/sklearn-onnx/auto_tutorial/plot_dbegin_options_zipmap.html",
    },
    {
      label: "scikit-learn User Guide — Model Persistence (joblib & ONNX)",
      href: "https://scikit-learn.org/stable/model_persistence.html",
    },
  ],

  glossary: [
    "onnx",
    "serialization",
    "reproducibility",
    "sklearn-pipeline",
    "pydantic",
    "fail-fast",
    "llm",
    "pytest",
  ],
});
