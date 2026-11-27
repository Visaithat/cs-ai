import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D053 — Phase 2 / Block B14
 * Model Serialization (joblib / ONNX), Versioning & Data Cards
 */
export const d053: Lesson = defineLesson({
  day: 53,
  titleTh: "บันทึกและส่งออกโมเดล (joblib / ONNX), การคุมเวอร์ชัน และ Data Cards",
  tagline:
    "30 นาที · รันบน CPU 100% ไม่ใช้ API key · ส่งออกโมเดล ONNX (<10ms) พร้อม Parity Check, Checksum และ Data Card",
  icon: "package",
  visual: {
    id: "drift-onnx-monitor",
    title: "Model Serialization (ONNX <10ms), Versioning & Production Drift Monitor",
    caption:
      "กดสลับเทียบ Latency joblib vs ONNX Runtime และการตรวจจับ Feature Drift เมื่อข้อมูลเปลี่ยน",
    alt: "แผนภาพการส่งออกโมเดล ONNX และการเฝ้าระวัง feature drift",
  },
  requiresApiKey: false,
  tools: ["scikit-learn", "ONNX", "joblib", "uv", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "บันทึกสัญญาข้อมูลและที่มาของชุดเทรนไว้ใน Data Card",
      body: "โมเดลที่เทรนดีแค่ไหนจะกลายเป็นกล่องดำทันทีหากอีก 3 เดือนข้างหน้าไม่มีใครจำได้ว่าเทรนจากข้อมูลช่วงวันที่เท่าไร ตัดแถวไหนทิ้ง หรือมี {{schema}} ของฟีเจอร์อะไรบ้าง",
      lessonNote:
        "วันนี้เราสร้าง `data_card.json` คู่กับทุกเวอร์ชันของโมเดล เพื่อบันทึกแหล่งข้อมูล, ช่วงวันที่ของ split, สัดส่วนคลาส และข้อจำกัดของชุดข้อมูล",
    },
    {
      node: 2,
      heading: "แปลงโมเดลจากหน่วยความจำให้เป็น Artifact ที่ปลอดภัยและเร็ว",
      body: "หลังเทรน {{sklearn-pipeline}} เสร็จ โมเดลยังอยู่ใน RAM — หากเลือกวิธี {{serialization}} ไม่เหมาะ (เช่น โหลด pickle จากแหล่งไม่น่าเชื่อถือ หรือผูกเวอร์ชันไลบรารีแน่นเกินไป) ระบบ Production จะพังหรือเกิดช่องโหว่ความปลอดภัย",
      lessonNote:
        "เรียนรู้ข้อดี-ข้อจำกัดของ `joblib` เทียบกับการส่งออกเป็น {{onnx}} (`skl2onnx` + `onnxruntime`) พร้อมทำ Parity Check ยืนยันผลทำนายตรงกัน",
    },
    {
      node: 4,
      heading: "เสิร์ฟโมเดลด้วย Immutable Versioning & Integrity Check",
      body: "การเซฟทับไฟล์ `model_final.joblib` ทำให้ย้อนกลับ (rollback) ไม่ได้เมื่อเวอร์ชันใหม่ทำงานเพี้ยน — ระบบจริงต้องล็อกเวอร์ชันแบบไม่แก้ทับพร้อมตรวจ SHA-256 ก่อนโหลด",
      lessonNote:
        "ออกแบบโครงสร้างโฟลเดอร์ `artifacts/<model>/<version>/` ที่เก็บ `model.onnx`, `metadata.json` และ `data_card.json` คู่กันอย่างมีวินัย",
    },
    {
      node: 5,
      heading: "ปูทางสู่การตรวจสอบย้อนหลังและการเฝ้าระวัง Drift",
      body: "เมื่อพรุ่งนี้ (Day 54) ระบบแจ้งเตือนว่าเกิด {{feature-drift}} หรือความแม่นยำตก `metadata.json` และ Data Card จะช่วยให้ทีมไล่ย้อนได้ว่า commit ไหนและชุดข้อมูลช่วงใดสร้างโมเดลตัวนี้ขึ้นมา",
      lessonNote:
        "สร้างฐาน {{reproducibility}} ที่สมบูรณ์ก่อนเข้าสู่ Mini-Project ของ Phase 2 ใน Day 55–56",
    },
  ],

  objectives: [
    "**เปรียบเทียบและเลือกใช้** `joblib` กับ {{onnx}} (`skl2onnx` + `onnxruntime`) ได้อย่างเหมาะสม ทั้งด้านความเร็ว (single-row latency), ความปลอดภัยจาก untrusted pickle และความเข้ากันได้ข้ามภาษา/เวอร์ชัน",
    "**ส่งออก `scikit-learn` Pipeline เป็นไฟล์ `.onnx`** และเขียน **Parity Check** ด้วย `np.allclose` เพื่อพิสูจน์ว่าค่า `predict_proba` ตรงกับโมเดลต้นฉบับก่อนขึ้น Production",
    "**ออกแบบ Immutable Model Version Bundle** ที่ประกอบด้วยไฟล์โมเดล, `SHA-256` checksum, `metadata.json` (git commit, schema, threshold, metrics) และ `data_card.json`",
  ],

  prerequisites: [
    "ผ่าน Block B11–B13: สร้างและเทรน `Pipeline` ของ `scikit-learn` และประเมินด้วย PR-AUC ได้แล้ว",
    "รู้จักแนวคิด {{data-contract}} และ {{fail-fast}} จาก Phase 1",
    "ใช้ `uv`, `pytest` และ `pathlib` บนเครื่องได้คล่อง",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key หรือ GPU",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่สำหรับ Day 53 ด้วย `uv` แล้วติดตั้ง `scikit-learn`, `joblib`, `skl2onnx` และ `onnxruntime` (เวอร์ชัน CPU ใช้พื้นที่น้อยและรันเร็วมาก)",
    commands: `uv init ai-day53 && cd ai-day53
uv add scikit-learn joblib skl2onnx onnxruntime numpy
uv add --dev pytest ruff
uv run python -c "import skl2onnx, onnxruntime as ort; print('ONNX Runtime:', ort.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day53` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `scikit-learn`, `joblib`, `skl2onnx`, `onnxruntime`, `numpy` และเครื่องมือทดสอบ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็นเลขเวอร์ชันของ `onnxruntime`"],
    ],
    note: "แพ็กเกจ `onnxruntime` ทำงานบน CPU ได้ทันทีโดยไม่ต้องลง CUDA — หากเครื่อง ARM/Windows ติดปัญหาลิงก์เวอร์ชัน ให้ตรวจว่าใช้ Python 3.11 หรือ 3.12 ที่ `onnxruntime` รองรับ wheel สำเร็จรูป",
  },

  concepts: [
    {
      id: "joblib-vs-onnx-tradeoffs",
      title: "1 · joblib vs ONNX: ความสะดวก ความปลอดภัย และ Latency <10ms",
      paragraphs: [
        "วิธีที่ง่ายที่สุดในการบันทึกโมเดล `scikit-learn` คือ `joblib.dump(pipe, 'model.joblib')` เพราะเก็บ NumPy arrays ขนาดใหญ่ได้มีประสิทธิภาพกว่า `pickle` ปกติ แต่ความจริงที่ต้องระวังคือ **เบื้องหลังของ `joblib` ยังใช้โปรโตคอล Python Pickle**",
        "การใช้ Pickle มี 2 ความเสี่ยงสำคัญใน Production: (1) **Security Risk** — การโหลดไฟล์ `.joblib`/`.pkl` จากแหล่งที่ไม่น่าเชื่อถือสามารถรันโค้ด Python อันตรายได้ทันทีตอน `joblib.load()` (Arbitrary Code Execution) และ (2) **Version Coupling** — ไฟล์ที่เทรนบน `scikit-learn 1.5` อาจโหลดไม่ได้หรือให้ผลเพี้ยนบน `1.6` และรันได้เฉพาะใน Python เท่านั้น",
        "**{{onnx}}** (Open Neural Network Exchange) แก้ปัญหาทั้งสองจุดด้วยการแปลงโมเดลเป็น **กราฟการคำนวณมาตรฐาน (data-only computation graph)** ที่ไม่รันโค้ด Python แปลกปลอม ย้ายไปรันได้ทั้ง Python, TypeScript, Go, Rust หรือ C++ และเมื่อรันผ่าน `onnxruntime` จะตัด overhead ของ Python/scikit-learn validation wrapper ออก ทำให้ single-row prediction เร็วขึ้นหลายเท่า (มักต่ำกว่า 1 มิลลิวินาที!)",
      ],
      analogy:
        "ไฟล์ `joblib` เหมือนส่ง 'ไฟล์โปรเจกต์ Photoshop ต้นฉบับ' ที่เปิดได้เฉพาะเครื่องที่ลงโปรแกรมเวอร์ชันเดียวกันเป๊ะ แถมเสี่ยงไวรัสแฝง ส่วน `ONNX` เหมือนส่ง 'ไฟล์ PDF/SVG มาตรฐาน' ที่เปิดอ่านได้เร็ว ปลอดภัย และเปิดได้แทบทุกแพลตฟอร์ม",
      bullets: [
        "**ใช้ `joblib` ได้เมื่อ**: เป็นงานภายใน (internal pipeline) ที่เราคุมทั้งฝั่งเทรนและฝั่งโหลด, ล็อกเวอร์ชันผ่าน `uv.lock`, ตรวจ `SHA-256` ก่อนโหลด และมี custom Python transform อย่าง `PyThaiNLP` ที่ยังแปลงเป็น ONNX operator ไม่ได้ตรง ๆ",
        "**ใช้ `ONNX` เมื่อ**: ต้องการ single-row latency ต่ำมาก (<10ms), ต้องการย้ายโมเดลไปรันใน service ภาษาอื่น (เช่น Node.js/Go/Edge) หรือต้องการมาตรฐานไฟล์ที่ปลอดภัยกว่า pickle",
        "**รูปแบบผสม (Hybrid Pattern)**: ตัดคำ/สกัดฟีเจอร์ข้อความในชั้น preprocessing แล้วส่งเวกเตอร์ตัวเลขเข้า classifier ที่ export เป็น `model.onnx` เพื่อให้ได้ทั้งความยืดหยุ่นของภาษาไทยและความเร็วของ `onnxruntime`",
      ],
      whyTitle: "Why this matters — ป้องกันช่องโหว่ Supply-Chain และคอขวด Latency",
      whyParagraphs: [
        "ทีม Security ในองค์กรจำนวนมากเริ่มห้ามนำไฟล์ `.pkl` / `.joblib` ที่ไม่มีการเซ็นหรือตรวจ checksum ขึ้นเซิร์ฟเวอร์ Production เพราะเป็นช่องทางโจมตีแบบ deserialization ที่ขึ้นชื่อในวงการ AI Security",
        "นอกจากนี้ใน API ที่รับทิกเก็ตทีละ 1 ใบ (online inference) scikit-learn มักเสียเวลาไปกับการตรวจ shape และสร้างอ็อบเจกต์ Python ราว 1–5ms ต่อครั้ง ขณะที่ `onnxruntime` รันกราฟ C++ ตรง ๆ ในระดับ 0.05–0.3ms ช่วยประหยัด CPU server ได้มหาศาล",
      ],
    },
    {
      id: "onnx-export-and-parity-check",
      title: "2 · ส่งออก ONNX ด้วย skl2onnx และกฎเหล็กเรื่อง Parity Check",
      paragraphs: [
        "การแปลง `scikit-learn` `Pipeline` เป็น {{onnx}} ทำผ่าน `skl2onnx.convert_sklearn(...)` โดยต้องระบุ **Input Signature** (`initial_types`) เช่น `FloatTensorType([None, n_features])` — คำว่า `None` ในมิติแรกหมายถึงรับ batch size กี่แถวก็ได้ (ตั้งแต่ 1 แถวจนถึงหลายพันแถว)",
        "รายละเอียดสำคัญที่มือใหม่พลาดบ่อย: โดยค่าเริ่มต้น `skl2onnx` จะส่งออกความน่าจะเป็นของ classifier ในรูป `ZipMap` (list ของ dict อย่าง `[{0: 0.8, 1: 0.2}]`) ซึ่งช้าและใช้งานยาก ให้ปิดด้วย `options={id(clf): {\"zipmap\": False}}` เพื่อให้ได้ NumPy 2D array `float32` รูปทรง `(N, 2)` ที่เหมือน `predict_proba` เป๊ะ",
        "ห้ามนำไฟล์ `.onnx` ขึ้น Production โดยไม่ทำ **Parity Check**! หลังบันทึกเสร็จ ต้องโหลดกลับด้วย `onnxruntime.InferenceSession` แล้วเทียบผลทำนายกับ `pipe.predict_proba(X_val)` ด้วย `np.allclose(..., atol=1e-5)` เสมอ (จำไว้ว่า ONNX มักคำนวณด้วย `float32` ขณะที่ scikit-learn ใช้ `float64` จึงอาจต่างกันในทศนิยมตำแหน่งที่ 6–7)",
      ],
      analogy:
        "เหมือนการแปลสูตรอาหารจากภาษาไทยเป็นภาษาอังกฤษแล้วต้องลองทำชิมเทียบกันทั้งสองจาน (Parity Check) ก่อนพิมพ์ลงเมนูจริงของร้าน",
      code: {
        language: "python",
        filename: "export_onnx_demo.py",
        code: `import numpy as np
import onnxruntime as ort
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(42)
X = rng.normal(size=(200, 4)).astype(np.float32)
y = (X[:, 0] * 1.5 - X[:, 1] > 0.2).astype(int)

pipe = Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression())])
pipe.fit(X, y)

# แปลงเป็น ONNX พร้อมปิด zipmap เพื่อคืนค่าเป็น 2D probability array
clf_step = pipe.named_steps["clf"]
onnx_model = convert_sklearn(
    pipe,
    initial_types=[("float_input", FloatTensorType([None, X.shape[1]]))],
    options={id(clf_step): {"zipmap": False}},
)
with open("model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

# Parity Check ด้วย onnxruntime
sess = ort.InferenceSession("model.onnx", providers=["CPUExecutionProvider"])
input_name = sess.get_inputs()[0].name
_, ort_probs = sess.run(None, {input_name: X[:5]})
sk_probs = pipe.predict_proba(X[:5])

assert np.allclose(sk_probs, ort_probs, atol=1e-5)
print("Parity OK! Max abs diff:", float(np.max(np.abs(sk_probs - ort_probs))))`,
        caption: "ปิด `zipmap` แล้วทำ Parity Check ด้วย `np.allclose` ทุกครั้งหลัง export โมเดลเป็น ONNX",
      },
      whyTitle: "Why this matters — จับบั๊กการแปลงกราฟก่อนลูกค้าเจอจริง",
      whyParagraphs: [
        "บางครั้งเวอร์ชันของ `skl2onnx` หรือ opset อาจแปลง step พิเศษ (เช่น missing value handling หรือการปัดเศษ) คลาดเคลื่อนเล็กน้อยจนผลจัดอันดับบริเวณ threshold เปลี่ยนไป",
        "การฝัง Parity Check ไว้ใน pipeline ตอน export (และใน {{pytest}}) ทำให้มั่นใจแบบ {{fail-fast}} ว่าโมเดลที่เสิร์ฟบน `onnxruntime` คิดเหมือนโมเดลที่เราประเมินผลไว้ทุกประการ",
      ],
    },
    {
      id: "immutable-versioning-and-data-cards",
      title: "3 · Immutable Model Versioning, SHA-256 Checksum และ Data Cards",
      paragraphs: [
        "กฎเหล็กของ MLOps คือ **ห้ามเขียนทับไฟล์โมเดลเวอร์ชันเดิม (Immutability)** — แทนที่จะเก็บแค่ `model.onnx` ไฟล์เดียว ให้เก็บแยกโฟลเดอร์ตามเวอร์ชัน เช่น `artifacts/ticket_priority/v1.0.0/` และหากเวอร์ชันนั้นมีอยู่แล้ว สคริปต์ต้องปฏิเสธไม่ให้เขียนทับทันที",
        "ภายในแต่ละโฟลเดอร์เวอร์ชันควรมีไฟล์อย่างน้อย 3 ชิ้นทำงานคู่กัน: (1) **Model Artifact** (`model.onnx` หรือ `model.joblib`), (2) **`metadata.json`** เก็บ `model_version`, `artifact_sha256`, `git_commit`, `feature_names`, `decision_threshold`, `sklearn_version`, `metrics` และ (3) **`data_card.json`** ที่บันทึกบริบทของข้อมูลที่ใช้เทรน",
        "**Data Card** (แนวคิดเดียวกับ Model Card ในวงการ AI Engineering) ตอบคำถามที่สำคัญที่สุดเวลาเกิดปัญหาในอนาคต: ข้อมูลมาจากตารางไหน? ช่วงวันที่ Train/Val/Test คือเมื่อไร? มีกี่แถวและสัดส่วนคลาสเป็นเท่าไร? ลบข้อมูลส่วนบุคคล (PII) ออกแล้วหรือยัง? และโมเดลนี้ *ไม่ควร* นำไปใช้กับกลุ่มลูกค้าใด?",
      ],
      analogy:
        "เหมือนฉลากยาที่ได้มาตรฐาน: ไม่ได้มีแค่เม็ดยา (`model.onnx`) แต่มีเลขล็อตและวันผลิต (`metadata.json` + SHA-256) รวมถึงเอกสารกำกับยาว่าทดสอบกับกลุ่มใดและมีข้อห้ามใช้อะไร (`data_card.json`)",
      bullets: [
        "**SHA-256 Checksum**: คำนวณแฮชของไฟล์โมเดลตอนเซฟ และตรวจซ้ำทุกครั้งก่อนโหลด — ถ้าไฟล์เสียระหว่างอัปโหลดหรือถูกแก้ไขโดยไม่ได้รับอนุญาต ระบบจะหยุดทำงานแบบ {{fail-fast}} ทันที",
        "**ล็อก `decision_threshold` ไว้ใน `metadata.json`**: ไม่ hardcode `0.50` ใน API เพื่อให้การสลับเวอร์ชันโมเดลสลับ threshold ที่จูนมาคู่กันไปพร้อมกันเสมอ",
        "**Rollback ภายในวินาที**: เมื่อ `v1.1.0` มีปัญหาบน Production แค่ชี้ config กลับไปที่โฟลเดอร์ `v1.0.0` ที่ไม่เคยถูกแก้ทับ",
      ],
      whyTitle: "Why this matters — รากฐานของ Reproducibility และการตรวจสอบ (Audit)",
      whyParagraphs: [
        "เมื่อระบบ AI ถูกนำไปใช้ในองค์กรจริง (โดยเฉพาะงานการเงิน ประกัน หรือ e-commerce ที่อยู่ใต้ PDPA) ทีมอาจถูกถามย้อนหลังว่า 'โมเดลที่ตัดสินใจเคสเมื่อเดือนที่แล้วเทรนจากข้อมูลชุดไหน?'",
        "การสร้าง Versioned Bundle ที่มี `metadata.json` และ `data_card.json` ตั้งแต่ Phase 2 ทำให้คุณมีนิสัยวิศวกรที่พร้อมต่อยอดสู่ระบบ CI/CD และ Governance ใน Phase 5–6 ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Model Artifact Bundle กับ Build Release & Lockfile",
      body: [
        "ถ้าคุณเคยทำ CI/CD ส่ง Docker image หรือแพ็กเกจ npm ขึ้น Registry คุณเข้าใจแนวคิด Model Versioning อยู่แล้ว แค่เปลี่ยนจากโค้ดคอมไพล์เป็นไฟล์น้ำหนักโมเดล:",
      ],
      table: [
        ["`joblib.dump` (Pickle)", "รัน `eval()` บนไฟล์จากภายนอก — สะดวกแต่เสี่ยง security และผูกเวอร์ชัน runtime"],
        ["`model.onnx` + `onnxruntime`", "ไบนารี/WASM มาตรฐานที่รันข้ามภาษาได้เร็วและปลอดภัยกว่า"],
        ["`artifacts/v1.0.0/` (Immutable)", "Immutable Docker tag / Git release — ห้าม push ทับแท็กเดิม"],
        ["`artifact_sha256` ใน `metadata.json`", "Subresource Integrity (SRI) / checksum ใน `package-lock.json`"],
        ["`data_card.json`", "Release notes + API schema spec สำหรับชุดข้อมูลที่ใช้สร้าง build นั้น"],
      ],
    },
    student: {
      title: "First-Year Note — Serialization และ SHA-256 คืออะไร?",
      body: [
        "เวลาเราเทรนโมเดลใน Python ตัวแปร `pipe` อยู่ในหน่วยความจำ **RAM** ซึ่งจะหายไปทันทีเมื่อปิดโปรแกรม **{{serialization}}** คือการแปลงอ็อบเจกต์ใน RAM ให้กลายเป็นไฟล์บนดิสก์เพื่อให้โหลดกลับมาใช้ซ้ำได้โดยไม่ต้องเทรนใหม่",
        "ส่วน **SHA-256** คือฟังก์ชันแฮชที่สรุปเนื้อหาทั้งไฟล์ให้เป็นรหัสข้อความยาว 64 ตัวอักษร หากมีใครแก้ไฟล์แม้แต่ 1 บิต รหัส SHA-256 จะเปลี่ยนไปโดยสิ้นเชิง เราจึงใช้มันยืนยันว่าไฟล์โมเดลที่เราโหลดขึ้นมาเป็นไฟล์ตัวเดียวกับที่เทรนไว้จริง ๆ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีโมเดลคัดกรองทิกเก็ตด่วนที่รับฟีเจอร์ตัวเลข 3 ตัว (`wait_min`, `order_value_thb`, `past_tickets_30d`) เราจะส่งออกทั้ง `joblib` และ `ONNX`, ทำ Parity Check + วัด latency และแพ็กเป็น Immutable Version Bundle พร้อม `metadata.json` และ `data_card.json`",
    steps: [
      {
        title: "1 · เทรน Pipeline และส่งออกทั้ง joblib กับ ONNX",
        explain:
          "สร้างข้อมูลสังเคราะห์แบบกำหนด seed, เทรน `StandardScaler + LogisticRegression`, เซฟ `model.joblib` และแปลงเป็น `model.onnx` โดยปิด `zipmap`",
        code: {
          language: "python",
          filename: "worked_day53.py",
          code: `import hashlib
import json
import time
from pathlib import Path

import joblib
import numpy as np
import onnxruntime as ort
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(7)
X = np.column_stack([
    rng.exponential(20.0, size=400),
    rng.normal(1500.0, 400.0, size=400),
    rng.poisson(1.5, size=400),
]).astype(np.float32)
y = ((0.05 * X[:, 0] + 0.001 * X[:, 1] + 0.5 * X[:, 2]) > 3.2).astype(int)

pipe = Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression())])
pipe.fit(X, y)

bundle_dir = Path("artifacts/ticket_priority/v1.0.0")
bundle_dir.mkdir(parents=True, exist_ok=True)
joblib.dump(pipe, bundle_dir / "model.joblib")

onnx_model = convert_sklearn(
    pipe,
    initial_types=[("float_input", FloatTensorType([None, X.shape[1]]))],
    options={id(pipe.named_steps["clf"]): {"zipmap": False}},
)
onnx_path = bundle_dir / "model.onnx"
onnx_path.write_bytes(onnx_model.SerializeToString())
print("Saved artifacts to:", bundle_dir)`,
        },
        output: `Saved artifacts to: artifacts/ticket_priority/v1.0.0`,
      },
      {
        title: "2 · ทำ Parity Check และเทียบ Single-Row Latency (sklearn vs ONNX Runtime)",
        explain:
          "ตรวจสอบว่าค่าความน่าจะเป็นของ ONNX ตรงกับ `scikit-learn` ภายใน `1e-5` จากนั้นลองวัดเวลาการทำนายทีละ 1 แถวจำนวน 500 รอบจำลองการยิง API จริง",
        code: {
          language: "python",
          filename: "worked_day53.py",
          code: `sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
input_name = sess.get_inputs()[0].name

sample = X[:10]
sk_probs = pipe.predict_proba(sample)
_, ort_probs = sess.run(None, {input_name: sample})
max_diff = float(np.max(np.abs(sk_probs - ort_probs)))
assert np.allclose(sk_probs, ort_probs, atol=1e-5)

one_row = X[:1]
t0 = time.perf_counter()
for _ in range(500):
    pipe.predict_proba(one_row)
sk_ms = (time.perf_counter() - t0) * 1000 / 500

t1 = time.perf_counter()
for _ in range(500):
    sess.run(None, {input_name: one_row})
ort_ms = (time.perf_counter() - t1) * 1000 / 500

print(f"Parity max_diff: {max_diff:.2e}")
print(f"Single-row avg latency | sklearn: {sk_ms:.3f} ms | ONNX: {ort_ms:.3f} ms")`,
        },
        output: `Parity max_diff: 2.38e-07
Single-row avg latency | sklearn: 0.245 ms | ONNX: 0.028 ms`,
      },
      {
        title: "3 · เขียน metadata.json (พร้อม SHA-256) และ data_card.json",
        explain:
          "คำนวณ `SHA-256` ของ `model.onnx` แล้วบันทึกลง `metadata.json` คู่กับ `data_card.json` ที่ระบุช่วงวันที่ split, schema และข้อจำกัดของชุดข้อมูล",
        code: {
          language: "python",
          filename: "worked_day53.py",
          code: `sha256 = hashlib.sha256(onnx_path.read_bytes()).hexdigest()

metadata = {
    "model_name": "ticket_priority",
    "model_version": "v1.0.0",
    "artifact_file": "model.onnx",
    "artifact_sha256": sha256,
    "feature_names": ["wait_min", "order_value_thb", "past_tickets_30d"],
    "decision_threshold": 0.30,
    "git_commit": "a1b2c3d",
}
data_card = {
    "dataset_name": "thai_support_tickets_2025",
    "row_count": int(len(X)),
    "positive_rate": round(float(y.mean()), 4),
    "split_dates": {"train": "2025-01-01..2025-02-15", "val": "2025-02-16..2025-02-28"},
    "pii_removed": True,
    "known_limitations": ["ไม่รวมทิกเก็ตช่วงโปรโมชัน 11.11", "รองรับเฉพาะฟีเจอร์ตัวเลข"],
}

(bundle_dir / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
(bundle_dir / "data_card.json").write_text(json.dumps(data_card, ensure_ascii=False, indent=2), encoding="utf-8")
print("SHA-256 prefix:", sha256[:16], "| Positive rate:", data_card["positive_rate"])`,
        },
        output: `SHA-256 prefix: 9f4c21a7d3e08b54 | Positive rate: 0.2925`,
      },
    ],
    gotcha:
      "จุดสังเกตสำคัญ: `onnxruntime` เคร่งเรื่องชนิดข้อมูลมาก หากโมเดล export ด้วย `FloatTensorType` แต่คุณส่ง `float64` (ค่าเริ่มต้นของ NumPy) เข้า `sess.run(...)` จะโยน `InvalidArgument` ทันที — ต้องแปลงด้วย `.astype(np.float32)` เสมอก่อนรัน inference",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `model_registry.py` สำหรับส่งออก `scikit-learn` Pipeline เป็น Immutable ONNX Bundle พร้อม Parity Check, SHA-256 Verification และ Data Card",
    requirements: [
      "`compute_sha256(file_path: Path) -> str`: คำนวณและคืนค่า hex digest ของ SHA-256 สำหรับไฟล์ที่ระบุ",
      "`save_versioned_onnx_bundle(pipe: Pipeline, X_sample: np.ndarray, out_root: Path, version: str, feature_names: list[str], threshold: float, data_card: dict) -> Path`: สร้างโฟลเดอร์ `out_root / version` — **หากโฟลเดอร์นั้นมีอยู่แล้วให้ `raise FileExistsError`** (บังคับ Immutability ห้ามเซฟทับ!)",
      "ภายใน `save_versioned_onnx_bundle`: แปลง `pipe` เป็น `model.onnx` ด้วย `skl2onnx` (`zipmap: False`), ทำ Parity Check เทียบ `pipe.predict_proba(X_sample)` กับ `onnxruntime` (`atol=1e-4`), บันทึก `metadata.json` (ต้องมี `version`, `artifact_sha256`, `feature_names`, `decision_threshold`) และ `data_card.json` (ต้องมีคีย์ `dataset_name`, `row_count`, `split_dates` ไม่ครบให้ `raise ValueError`)",
      "`load_verified_onnx_session(bundle_dir: Path) -> tuple[ort.InferenceSession, dict]`: อ่าน `metadata.json`, คำนวณ `SHA-256` ของ `model.onnx` ใหม่แล้วเทียบกับ `artifact_sha256` — **หากไม่ตรงให้ `raise ValueError(\"Artifact checksum mismatch\")`** ก่อนคืน `(session, metadata)`",
    ],
    starter: {
      language: "python",
      filename: "model_registry.py",
      code: `import hashlib
import json
from pathlib import Path

import numpy as np
import onnxruntime as ort
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.pipeline import Pipeline

REQUIRED_DATA_CARD_KEYS = {"dataset_name", "row_count", "split_dates"}


def compute_sha256(file_path: Path) -> str:
    """คำนวณ SHA-256 hex digest ของไฟล์"""
    # TODO: อ่าน bytes แล้วคืน hashlib.sha256(...).hexdigest()
    raise NotImplementedError


def save_versioned_onnx_bundle(
    pipe: Pipeline,
    X_sample: np.ndarray,
    out_root: Path,
    version: str,
    feature_names: list[str],
    threshold: float,
    data_card: dict,
) -> Path:
    """ส่งออก ONNX + Parity Check + metadata.json + data_card.json แบบห้ามเขียนทับเวอร์ชันเดิม"""
    # TODO: ตรวจ data_card, ตรวจ immutability, export ONNX, ทำ parity check, เขียนไฟล์
    raise NotImplementedError


def load_verified_onnx_session(bundle_dir: Path) -> tuple[ort.InferenceSession, dict]:
    """ตรวจ SHA-256 ของ model.onnx เทียบกับ metadata.json ก่อนโหลด InferenceSession"""
    # TODO: โหลด metadata, ตรวจ checksum (ไม่ตรง raise ValueError), คืน (session, metadata)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day53.py",
      code: `from pathlib import Path

import numpy as np
import pytest
from model_registry import (
    compute_sha256,
    load_verified_onnx_session,
    save_versioned_onnx_bundle,
)
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def _make_fitted_pipeline() -> tuple[Pipeline, np.ndarray]:
    rng = np.random.default_rng(42)
    X = rng.normal(size=(120, 3)).astype(np.float32)
    y = (X[:, 0] + 0.8 * X[:, 1] > 0.0).astype(int)
    pipe = Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression())])
    pipe.fit(X, y)
    return pipe, X[:10]


def test_save_and_load_onnx_bundle_parity(tmp_path: Path):
    pipe, X_sample = _make_fitted_pipeline()
    data_card = {
        "dataset_name": "tickets_demo",
        "row_count": 120,
        "split_dates": {"train": "2025-01", "val": "2025-02"},
    }
    bundle_dir = save_versioned_onnx_bundle(
        pipe=pipe,
        X_sample=X_sample,
        out_root=tmp_path,
        version="v1.0.0",
        feature_names=["f1", "f2", "f3"],
        threshold=0.35,
        data_card=data_card,
    )
    assert (bundle_dir / "model.onnx").exists()
    assert (bundle_dir / "metadata.json").exists()
    assert (bundle_dir / "data_card.json").exists()

    sess, meta = load_verified_onnx_session(bundle_dir)
    assert meta["version"] == "v1.0.0"
    assert meta["decision_threshold"] == pytest.approx(0.35)
    assert meta["artifact_sha256"] == compute_sha256(bundle_dir / "model.onnx")

    input_name = sess.get_inputs()[0].name
    _, ort_probs = sess.run(None, {input_name: X_sample.astype(np.float32)})
    assert np.allclose(pipe.predict_proba(X_sample), ort_probs, atol=1e-4)


def test_immutable_version_prevents_overwrite(tmp_path: Path):
    pipe, X_sample = _make_fitted_pipeline()
    card = {"dataset_name": "d", "row_count": 120, "split_dates": {"train": "2025-01"}}
    save_versioned_onnx_bundle(pipe, X_sample, tmp_path, "v1.0.0", ["a", "b", "c"], 0.5, card)
    with pytest.raises(FileExistsError):
        save_versioned_onnx_bundle(pipe, X_sample, tmp_path, "v1.0.0", ["a", "b", "c"], 0.5, card)


def test_tampered_artifact_fails_checksum(tmp_path: Path):
    pipe, X_sample = _make_fitted_pipeline()
    card = {"dataset_name": "d", "row_count": 120, "split_dates": {"train": "2025-01"}}
    bundle_dir = save_versioned_onnx_bundle(
        pipe, X_sample, tmp_path, "v1.0.0", ["a", "b", "c"], 0.5, card
    )
    # จำลองไฟล์เสียหายหรือถูกดัดแปลง
    onnx_path = bundle_dir / "model.onnx"
    onnx_path.write_bytes(onnx_path.read_bytes() + b"corrupted")

    with pytest.raises(ValueError, match="checksum"):
        load_verified_onnx_session(bundle_dir)


def test_missing_data_card_fields_rejected(tmp_path: Path):
    pipe, X_sample = _make_fitted_pipeline()
    with pytest.raises(ValueError):
        save_versioned_onnx_bundle(
            pipe, X_sample, tmp_path, "v1.0.0", ["a", "b", "c"], 0.5, {"dataset_name": "only_name"}
        )
`,
    },
    selfCheck: [
      "`save_versioned_onnx_bundle` ปฏิเสธการเขียนทับโฟลเดอร์เวอร์ชันเดิมด้วย `FileExistsError`",
      "Parity Check ยืนยันว่า `onnxruntime` คืนค่าความน่าจะเป็นตรงกับ `pipe.predict_proba` ภายใน `1e-4`",
      "หาก `data_card` ขาดคีย์บังคับ (`dataset_name`, `row_count`, `split_dates`) ฟังก์ชันโยน `ValueError` ก่อนสร้างโฟลเดอร์",
      "`load_verified_onnx_session` จับไฟล์ `.onnx` ที่ถูกแก้แม้เพียงไม่กี่ไบต์ได้ด้วย `ValueError`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านครบทั้งหมด",
    ],
    acceptance:
      "ผ่านทั้ง 4 test functions ใน `test_day53.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ตรวจความครบของ `data_card` (`REQUIRED_DATA_CARD_KEYS - data_card.keys()`) และตรวจว่า `bundle_dir.exists()` ก่อนจะสร้างโฟลเดอร์หรือเขียนไฟล์ใด ๆ เพื่อไม่ให้เหลือโฟลเดอร์ขยะค้างไว้เมื่ออินพุตผิด",
      },
      {
        body: "ตอนเรียก `convert_sklearn` ให้ส่ง `options={id(pipe.steps[-1][1]): {\"zipmap\": False}}` และแปลง `X_sample` เป็น `np.asarray(X_sample, dtype=np.float32)` ก่อนส่งเข้า `sess.run(...)`",
      },
      {
        body: "โครงของ `compute_sha256` และ `load_verified_onnx_session` พร้อมแล้ว เหลือเติมขั้นตอน export + parity check ใน `save_versioned_onnx_bundle`:",
        code: {
          language: "python",
          filename: "hint_day53.py",
          code: `def compute_sha256(file_path: Path) -> str:
    return hashlib.sha256(file_path.read_bytes()).hexdigest()


def load_verified_onnx_session(bundle_dir: Path) -> tuple[ort.InferenceSession, dict]:
    meta = json.loads((bundle_dir / "metadata.json").read_text(encoding="utf-8"))
    onnx_path = bundle_dir / "model.onnx"
    actual = compute_sha256(onnx_path)
    if actual != meta["artifact_sha256"]:
        raise ValueError("Artifact checksum mismatch")
    sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    return sess, meta

# ใน save_versioned_onnx_bundle:
# 1) ตรวจ REQUIRED_DATA_CARD_KEYS <= set(data_card.keys())
# 2) bundle_dir = out_root / version; ถ้า exists() -> raise FileExistsError
# 3) convert_sklearn(pipe, initial_types=[("float_input", FloatTensorType([None, X32.shape[1]]))],
#                    options={id(pipe.steps[-1][1]): {"zipmap": False}})
# 4) โหลด sess มาเทียบ np.allclose(pipe.predict_proba(X32), ort_probs, atol=1e-4)
# 5) เขียน metadata.json และ data_card.json`,
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
      title: "โหลดไฟล์ .joblib / .pkl จากแหล่งภายนอกโดยไม่ตรวจแหล่งที่มาหรือ checksum",
      symptom: "เสี่ยงต่อ Arbitrary Code Execution ทันทีที่เรียก `joblib.load()` เพราะ Pickle สามารถสั่งรันคำสั่งระบบผ่าน `__reduce__` ได้",
      fix: "ใช้ `ONNX` สำหรับการแลกเปลี่ยน/เสิร์ฟโมเดลเมื่อเป็นไปได้ และหากต้องใช้ `joblib` ภายในระบบ ให้โหลดเฉพาะจาก artifact registry ที่ควบคุมเองพร้อมตรวจ `SHA-256` ทุกครั้ง",
    },
    {
      title: "ลืมปิด zipmap ตอน export classifier ด้วย skl2onnx",
      symptom: "ผลลัพธ์จาก `sess.run()` กลายเป็น `list[dict[int, float]]` แทนที่จะเป็น 2D NumPy array ทำให้โค้ด downstream อย่าง `probs[:, 1]` พังด้วย `TypeError`",
      fix: "ส่ง `options={id(clf): {\"zipmap\": False}}` ใน `convert_sklearn(...)` แล้วตรวจด้วย Parity Check ทันที",
    },
    {
      title: "ส่ง float64 เข้า ONNX Runtime ที่ประกาศ FloatTensorType (float32)",
      symptom: "เกิด `onnxruntime.capi.onnxruntime_pybind11_state.InvalidArgument: Unexpected input data type. Actual: (tensor(double)), expected: (tensor(float))`",
      fix: "แปลงอินพุตด้วย `np.asarray(X, dtype=np.float32)` ทุกครั้งก่อนส่งเข้า `InferenceSession.run(...)`",
    },
    {
      title: "เซฟทับไฟล์ model_latest.onnx และไม่เก็บ decision_threshold คู่กัน",
      symptom: "พอเวอร์ชันใหม่มีปัญหาไม่สามารถย้อนกลับเวอร์ชันเก่าได้ หรือโหลดโมเดลใหม่แต่ยังใช้ threshold เก่าที่จูนมาจากคนละเวอร์ชันจนความแม่นยำเพี้ยน",
      fix: "เก็บเป็นโฟลเดอร์เวอร์ชันแบบ immutable (`v1.0.0`, `v1.1.0`) และฝัง `decision_threshold`, `feature_names`, `artifact_sha256` ไว้ใน `metadata.json` คู่กับ `data_card.json`",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d053-q1",
        "ทำไมการโหลดไฟล์ `.joblib` หรือ `.pkl` จากแหล่งที่ไม่น่าเชื่อถือจึงถือเป็นความเสี่ยงด้านความปลอดภัยร้ายแรง?",
        [
          ["เพราะไฟล์ `.joblib` มีขนาดใหญ่จนกินพื้นที่ดิสก์เต็มเสมอ", "ไม่เกี่ยว — ความเสี่ยงหลักไม่ได้อยู่ที่ขนาดไฟล์"],
          ["เพราะเบื้องหลัง `joblib` ใช้โปรโตคอล Python Pickle ซึ่งสามารถรันโค้ดอันตราย (Arbitrary Code Execution) ได้ทันทีระหว่าง `load()`", "ถูก — ต่างจาก ONNX ที่เก็บเป็นกราฟการคำนวณแบบ data-only ไม่รันโค้ด Python แปลกปลอม"],
          ["เพราะ `joblib` ไม่สามารถเก็บข้อมูลชนิดตัวเลขทศนิยมได้", "ไม่จริง — `joblib` เก็บ NumPy arrays และ float ได้ดีมาก"],
          ["เพราะ `joblib` ส่งข้อมูลโมเดลขึ้นคลาวด์อัตโนมัติ", "ไม่จริง — `joblib` ทำงานบนเครื่องแบบ local เท่านั้น"],
        ],
        "B",
        "Pickle/joblib ออกแบบมาเพื่อ reconstruct Python objects โดยรัน instruction ในไฟล์ จึงเสี่ยงต่อการโจมตีหากโหลดไฟล์จากภายนอก ส่วน ONNX เป็นกราฟคำนวณมาตรฐานที่ปลอดภัยกว่า",
        "ความเสี่ยงด้านความปลอดภัยหลักของ `joblib` / `pickle` เทียบกับ `ONNX` คืออะไร?",
        "`joblib` ใช้ Pickle ซึ่งอาจรัน Arbitrary Code ระหว่างโหลดไฟล์ได้ ส่วน `ONNX` เป็น computation graph แบบ data-only และรันข้ามภาษาได้",
      ),
      mc(
        "d053-q2",
        "หลังส่งออก `scikit-learn` Pipeline เป็น `model.onnx` ขั้นตอนใดที่ควรทำทันทีเพื่อป้องกันบั๊กเงียบก่อนขึ้น Production?",
        [
          ["ลบไฟล์เทรนและโค้ดต้นฉบับทิ้งทันทีเพื่อประหยัดพื้นที่", "ผิด — เราต้องเก็บโค้ดและ Data Card ไว้เพื่อ reproducibility"],
          ["โหลด `model.onnx` ด้วย `onnxruntime` แล้วทำ Parity Check เทียบ `predict_proba` กับโมเดลต้นฉบับด้วย `np.allclose`", "ถูก — ยืนยันว่ากราฟ ONNX ให้ผลตัวเลขตรงกับ scikit-learn ก่อนนำไปเสิร์ฟจริง"],
          ["เปลี่ยนชื่อไฟล์เป็น `model_final_v2.onnx` ทับเวอร์ชันเก่า", "ผิด — ห้ามเขียนทับเวอร์ชันเดิม ต้องใช้ immutable versioning"],
          ["แปลงค่าความน่าจะเป็นทั้งหมดเป็นจำนวนเต็ม 0 หรือ 1", "ผิด — เราต้องเก็บความน่าจะเป็นเพื่อใช้กับ decision threshold"],
        ],
        "B",
        "Parity Check ช่วยยืนยันว่าการแปลงกราฟและการลดความละเอียดเป็น `float32` ไม่ทำให้ผลทำนายคลาดเคลื่อนจากโมเดลที่ผ่านการประเมิน",
        "Parity Check หลัง export โมเดลเป็น ONNX คืออะไรและทำอย่างไร?",
        "คือการรันข้อมูลชุดเดียวกันผ่านทั้งโมเดลต้นฉบับ (`scikit-learn`) และ `onnxruntime` แล้วตรวจด้วย `np.allclose(..., atol=1e-5)` ว่าผลทำนายตรงกัน",
      ),
      mc(
        "d053-q3",
        "ทำไมจึงควรเก็บ `decision_threshold` และ `feature_names` ไว้ใน `metadata.json` ภายในโฟลเดอร์เวอร์ชันเดียวกับ `model.onnx`?",
        [
          ["เพื่อให้ไฟล์ `model.onnx` มีขนาดเล็กลงครึ่งหนึ่ง", "ไม่เกี่ยว — `metadata.json` ไม่ได้ลดขนาดไฟล์ `.onnx`"],
          ["เพราะ threshold ที่จูนมาและลำดับคอลัมน์ผูกกับโมเดลเวอร์ชันนั้น ๆ โดยตรง การเก็บคู่กันทำให้สลับเวอร์ชันหรือ rollback ได้โดยไม่สับสน", "ถูก — หากเปลี่ยนโมเดลแต่ลืมเปลี่ยน threshold หรือสลับลำดับคอลัมน์ ผลทำนายจะเพี้ยนทันที"],
          ["เพราะ `onnxruntime` บังคับว่าต้องมีไฟล์ `metadata.json` ไม่งั้นจะรันไม่ได้", "ไม่จริง — `onnxruntime` อ่านแค่ `.onnx` แต่ทีมวิศวกรสร้าง `metadata.json` เพื่อคุมระบบให้ปลอดภัย"],
          ["เพื่อใช้แทนการเขียน unit test ด้วย `pytest`", "ผิด — metadata ใช้คู่กับเทสต์ ไม่ได้ใช้แทนเทสต์"],
        ],
        "B",
        "โมเดลแต่ละเวอร์ชันอาจมี distribution ของความน่าจะเป็นและชุดฟีเจอร์ต่างกัน การมัดรวม artifact + metadata + data card ไว้ในโฟลเดอร์เวอร์ชันเดียวจึงช่วยกัน human error ได้ดีที่สุด",
        "3 ไฟล์หลักที่ควรอยู่ใน Immutable Model Version Bundle คืออะไรบ้าง?",
        "1) ไฟล์โมเดล (`model.onnx` / `model.joblib`), 2) `metadata.json` (version, SHA-256, schema, threshold, metrics), และ 3) `data_card.json` (ที่มาข้อมูล, ช่วงวันที่ split, ข้อจำกัด)",
      ),
      mc(
        "d053-q4",
        "เมื่อรัน `sess.run(None, {input_name: X})` ใน `onnxruntime` แล้วเจอ error `Actual: (tensor(double)), expected: (tensor(float))` สาเหตุและวิธีแก้คืออะไร?",
        [
          ["ไฟล์ `.onnx` เสียหาย ต้องเทรนโมเดลใหม่ทั้งหมด", "ไม่ใช่ — เป็นแค่ชนิดข้อมูล (dtype) ของอินพุตไม่ตรงกัน"],
          ["อินพุต `X` เป็น `float64` (double) แต่กราฟ ONNX ประกาศรับ `float32` — แก้ด้วย `X.astype(np.float32)`", "ถูก — NumPy สร้างอาร์เรย์เป็น `float64` โดยค่าเริ่มต้น จึงต้อง cast เป็น `np.float32` ก่อนส่งเข้า ONNX Runtime"],
          ["จำนวนแถวของ `X` น้อยเกินไป ต้องส่งอย่างน้อย 32 แถว", "ไม่จริง — `FloatTensorType([None, n_features])` รับตั้งแต่ 1 แถวได้"],
          ["ต้องเปลี่ยนจาก `CPUExecutionProvider` เป็น GPU เท่านั้น", "ไม่เกี่ยว — ปัญหานี้เป็นเรื่อง dtype บน CPU ก็แก้ได้ทันทีด้วย `float32`"],
        ],
        "B",
        "`FloatTensorType` ใน `skl2onnx` หมายถึง IEEE 32-bit float (`np.float32`) ส่วน `DoubleTensorType` คือ `float64` — การแปลงอินพุตเป็น `np.float32` ช่วยแก้ error นี้ได้ทันที",
        "เมื่อเจอ error `Actual: (tensor(double)), expected: (tensor(float))` ใน ONNX Runtime ต้องแก้อย่างไร?",
        "แปลงอินพุต NumPy array จาก `float64` เป็น `float32` ด้วย `np.asarray(X, dtype=np.float32)` ก่อนส่งเข้า `sess.run(...)`",
      ),
    ],
  },

  takeaways: [
    "`joblib` สะดวกสำหรับงานภายในแต่ใช้โปรโตคอล Pickle ที่เสี่ยงด้านความปลอดภัยและผูกเวอร์ชัน Python/scikit-learn ส่วน {{onnx}} เป็นกราฟมาตรฐานที่ปลอดภัย ย้ายข้ามภาษาได้ และลด single-row latency ต่ำกว่า 10ms",
    "ทุกครั้งที่ export เป็น ONNX ด้วย `skl2onnx` ให้ปิด `zipmap` สำหรับ classifier, ส่งอินพุต `np.float32` และรัน **Parity Check** เทียบกับโมเดลต้นฉบับด้วย `np.allclose`",
    "เก็บโมเดลแบบ **Immutable Version Bundle** (`artifacts/<name>/<version>/`) ที่มัดรวม `model.onnx`, `metadata.json` (พร้อม `SHA-256`, `feature_names`, `decision_threshold`) และ `data_card.json`",
    "ตรวจ `SHA-256` checksum ก่อนโหลดโมเดลเสมอเพื่อความมั่นใจด้านความปลอดภัยและ {{reproducibility}}",
  ],

  reviewCards: [
    rc(
      "d053-rc-1",
      "เทียบข้อดี-ข้อเสียระหว่าง `joblib` กับ `ONNX` (`onnxruntime`) ในระบบ Production",
      "`joblib` เก็บ custom Python pipeline ได้ง่ายแต่เสี่ยง untrusted pickle และผูกเวอร์ชันไลบรารี; `ONNX` ปลอดภัยกว่า (data-only graph), รันข้ามภาษาได้ และทำ single-row latency ต่ำมาก (<10ms) แต่ไม่รองรับ custom Python tokenizer โดยตรง",
    ),
    rc(
      "d053-rc-2",
      "Data Card ควรบันทึกข้อมูลสำคัญอะไรบ้างคู่กับไฟล์โมเดล?",
      "แหล่งที่มาของชุดข้อมูล, ช่วงวันที่ของ Train/Val/Test split, จำนวนแถวและสัดส่วนคลาส, schema ฟีเจอร์, สถานะการลบ PII และข้อจำกัดที่โมเดลยังไม่รองรับ",
    ),
    rc(
      "d053-rc-3",
      "ทำไมต้องใช้ Immutable Versioning + SHA-256 Checksum แทนการเซฟทับ `model_latest.onnx`?",
      "เพื่อให้ rollback กลับเวอร์ชันก่อนหน้าได้ทันทีเมื่อเวอร์ชันใหม่พัง, ไล่ย้อนผลการทดลองได้ (reproducibility), และจับไฟล์ที่เสียหายหรือถูกดัดแปลงได้แบบ fail-fast ก่อนโหลด",
    ),
  ],

  sources: [
    {
      label: "scikit-learn User Guide — Model Persistence (Security & ONNX)",
      href: "https://scikit-learn.org/stable/model_persistence.html",
    },
    {
      label: "sklearn-onnx (skl2onnx) Official Documentation",
      href: "https://onnx.ai/sklearn-onnx/",
    },
    {
      label: "ONNX Runtime Python API Documentation",
      href: "https://onnxruntime.ai/docs/api/python/api_summary.html",
    },
    {
      label: "Google Research — Data Cards Playbook",
      href: "https://pair-code.github.io/datacardsplaybook/",
    },
  ],

  glossary: [
    "serialization",
    "onnx",
    "reproducibility",
    "schema",
    "data-contract",
    "sklearn-pipeline",
    "fail-fast",
    "pytest",
  ],
});
