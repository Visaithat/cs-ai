import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D090 — Phase 3 / Block B23
 * Measure Accuracy, Latency & Cost/1k Docs
 */
export const d090: Lesson = defineLesson({
  day: 90,
  titleTh: "วัดผลจริง 3 แกน: Field Accuracy, P50/P95 Latency และต้นทุนต่อ 1,000 เอกสาร",
  tagline:
    "30 นาที · รันบนเครื่องได้ 100% ด้วยข้อมูลบันทึกผลและโหมด mock · สร้างสคริปต์รายงาน Schema Pass Rate, Macro-F1, P95 และ Cost/1k Docs",
  icon: "bar-chart-3",
  visual: {
    id: "phase3-extractor-arch",
    title: "วัดผลจริง 3 แกน: Field Accuracy, P50/P95 Latency & Cost per 1,000 Docs",
    caption:
      "คำนวณต้นทุนจริงจาก Thai token counts พร้อมแยกดู Cache Hit Rate และ Routing Split",
    alt: "แผนภาพวัด Accuracy, Latency และ Cost ต่อ 1,000 เอกสาร",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องได้ 100% ด้วยไฟล์บันทึกผล (JSONL) และโหมด mock ไม่ต้องใช้ API key",
  tools: ["Pydantic v2", "JSONL", "tiktoken", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ชุดข้อมูลเฉลย (Golden Dataset) คือไม้บรรทัดกลางของการเปรียบเทียบ",
      body: "หากไม่มีชุดเอกสารไทยพร้อมคำตอบที่ตรวจแล้ว ({{golden-dataset}}) ทุกการปรับ prompt หรือเปลี่ยนโมเดลเป็นเพียงการ \"เดาด้วยความรู้สึก\" ไม่ใช่วิศวกรรม",
      lessonNote:
        "วันนี้เราอ่านผลรันจาก {{jsonl}} มาเทียบกับ Golden Dataset เพื่อคำนวณตัวเลขมาตรฐานในทุกฟิลด์",
    },
    {
      node: 2,
      heading: "Routing Split และ Prompt Caching เปลี่ยนสมการต้นทุนอย่างสิ้นเชิง",
      body: "เนื่องจากภาษาไทยเสียค่า {{bpe-tokenizer}} สูงกว่าอังกฤษ 1.5×–3× การผสม Small Model + Frontier Model + {{prompt-caching}} จึงส่งผลต่อทั้ง latency และต้นทุนจริงอย่างมหาศาล",
      lessonNote:
        "เราจะคำนวณ Cost/1k Docs จากจำนวน `input_tokens`, `cached_input_tokens` และ `output_tokens` จริงของแต่ละโมเดล",
    },
    {
      node: 3,
      heading: "ประเมินครบ 3 แกนพร้อมกัน: คุณภาพ, ความเร็ว และต้นทุน",
      body: "การดูแค่ Schema Pass Rate 100% ไม่พอบอกได้ว่าตัวเลขถูกต้อง และการดูแค่ค่าเฉลี่ย latency ปิดบังหางยาวของระบบ (P95) ที่ผู้ใช้รู้สึกจริง",
      lessonNote:
        "แบบฝึกหัดวันนี้สร้างสคริปต์ **3-Axis Eval Report** วัด Macro-F1, Field Accuracy, P50/P95 และ USD/THB ต่อ 1,000 เอกสารอัตโนมัติ",
    },
    {
      node: 5,
      heading: "เก็บตัวเลข Baseline เพื่อใช้ตัดสินใจใน Phase 3 Checkpoint และ Phase 5",
      body: "ตัวเลข 3 แกนของวันนี้จะกลายเป็นมาตรฐานเทียบกับ Phase 2 Classical ML ใน Day 92 และต่อยอดสู่ Cost/Latency Dashboard ใน Phase 5",
      lessonNote:
        "บันทึกผลรายงานของทุก config (`frontier_only` vs `routed_cached`) ไว้เทียบ Regression ทุกครั้งที่แก้ prompt",
    },
  ],

  objectives: [
    "**คำนวณ** คุณภาพการสกัดครบ 3 ระดับ: Schema Pass Rate, Exact Field Accuracy (รองรับ `None` และ tolerance ทศนิยม) และ Macro-F1 บนชุดข้อมูลไทย",
    "**วัด** ความเร็วด้วย P50 และ P95 Latency (แบบ nearest-rank percentile) พร้อมสรุป Cache Hit Rate และ Routing Split (`cache` / `small` / `frontier`)",
    "**คำนวณ** ต้นทุนจริงในหน่วย **USD และ THB ต่อ 1,000 เอกสาร** โดยแยกคิด `uncached_input_tokens`, `cached_input_tokens` และ `output_tokens` เพื่อเปรียบเทียบสถาปัตยกรรมได้อย่างแม่นยำ",
  ],

  prerequisites: [
    "{{precision-recall}} และ Macro-F1 จาก Phase 2 (Day 45)",
    "{{bpe-tokenizer}} (Thai token inflation) และ {{prompt-caching}} / Model Routing (Days 66 & 79)",
    "การอ่าน/เขียนไฟล์ {{jsonl}} และ `pytest` พื้นฐาน",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์ทำงานสำหรับ Day 90 เพื่อสร้างโมดูลคำนวณ Benchmark 3 แกนและทดสอบผ่าน `pytest` แบบออฟไลน์ 100%",
    commands: `uv init ai-day90 && cd ai-day90
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import json, pydantic; print('Eval bench ready:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day90` หรือเปิดโฟลเดอร์ extractor เดิม"],
      ["deps", "ติดตั้ง `pydantic`, `pytest`, `ruff` ผ่าน `uv` สำเร็จ"],
      ["verify", "รันคำสั่งตรวจสภาพแวดล้อมสำเร็จโดยไม่ต้องใช้ API key"],
    ],
    note: "การคำนวณตัวชี้วัดทั้งหมดใช้ข้อมูล log ในรูปแบบ JSONL ที่เก็บจำนวน token และเวลาจริงจากการรัน — ทำให้คุณรันรายงานซ้ำและตรวจสอบสูตรได้ 100% ออฟไลน์",
  },

  concepts: [
    {
      id: "three-level-extraction-accuracy",
      title: "1 · วัดความแม่นยำให้ครบ 3 ระดับ: Schema Pass Rate, Field Exact Match และ Macro-F1",
      paragraphs: [
        "ความผิดพลาดที่พบบ่อยที่สุดในการประเมินระบบ {{structured-output}} คือรายงานเพียงว่า *\"JSON valid 100%\"* — ทั้งที่ JSON ที่ผ่าน {{pydantic}} อาจทายหมวดหมู่ผิดหรือสกัดยอดเงินคลาดเคลื่อนไปหมดแล้ว เราจึงต้องวัดคุณภาพแยกเป็น 3 ชั้นชัดเจน",
        "**ชั้นที่ 1: Schema Pass Rate** วัดสัดส่วนเอกสารที่พาร์สผ่านโครงสร้างโดยไม่พัง; **ชั้นที่ 2: Field Exact Accuracy** วัดความถูกต้องรายฟิลด์ เช่น `order_ref` (เทียบหลัง `strip().upper()`, โดย `None == None` นับว่าถูก) และ `amount_thb` (ยอมรับ tolerance ทศนิยม `<= 0.01` บาท); และ **ชั้นที่ 3: Macro-F1** สำหรับงานจำแนกหมวดหมู่ (`billing`, `shipping`, `technical`, `other`) เพื่อไม่ให้หมวดที่มีปริมาณมากกลบความผิดพลาดของหมวดสำคัญที่มีเคสน้อย",
      ],
      analogy:
        "เหมือนการตรวจข้อสอบบัญชี: Schema Pass Rate คือตรวจว่าเขียนลงช่องถูกไหม, Field Exact Accuracy คือตรวจว่าตัวเลขแต่ละช่องตรงเฉลยไหม, ส่วน Macro-F1 คือตรวจว่าทำได้ทุกบทเรียนอย่างสม่ำเสมอ ไม่ใช่เก่งแค่บทเดียว",
      bullets: [
        "**Schema Pass Rate** = `valid_docs / total_docs` (เป้าหมายงาน production `>= 0.99`)",
        "**Field Exact Accuracy**: แยกรายงานทีละฟิลด์ (`order_ref_acc`, `amount_acc`) เพื่อเห็นทันทีว่าโมเดลอ่อนฟิลด์ไหน",
        "**Macro-F1**: ค่าเฉลี่ย F1 ของทุกคลาสด้วยน้ำหนักเท่ากัน — เหมาะกับทิกเก็ตไทยที่หมวด `billing` หรือ `technical` มักไม่สมดุลกัน",
      ],
      whyTitle: "Why this matters — แยกรายฟิลด์ถึงจะรู้ว่าควรแก้ตรงไหน",
      whyParagraphs: [
        "ถ้ารวมทุกอย่างเป็นคะแนนเดียว คุณจะไม่รู้ว่าต้องแก้ prompt ของ `category`, แก้ normalizer ของเลขไทยใน `amount_thb`, หรือแก้กฎ `null` ของ `order_ref`",
        "การรายงานแยกทั้ง 3 ระดับช่วยชี้เป้าการปรับปรุงในรอบถัดไปได้แม่นยำภายในไม่กี่นาที",
      ],
    },
    {
      id: "p50-p95-tail-latency",
      title: "2 · ทำไมต้องวัด P50 และ P95 Latency แทนค่าเฉลี่ย (Mean) เพียงอย่างเดียว",
      paragraphs: [
        "เวลาตอบสนองของระบบ {{llm}} ไม่ได้กระจายตัวแบบระฆังคว่ำ (Normal Distribution) แต่มักมี **หางยาวไปทางขวา (Right-Skewed)**: เคสส่วนใหญ่ที่ชน {{caching}} หรือรันบน Small Model อาจจบใน `180–350 ms` แต่บางเคสที่ติด Validation-Repair retry หรือถูก route ไป Frontier Model อาจพุ่งไป `1,800–3,500 ms`",
        "หากเรารายงานแค่ **ค่าเฉลี่ย (Mean)** ตัวเลขอาจดูสวยอยู่แถว `450 ms` แต่ผู้ใช้จริง 1 ใน 20 คนกำลังรอนานกว่า 2 วินาที! เราจึงต้องรายงานคู่กันเสมอคือ **P50 (Median)** แทนประสบการณ์ผู้ใช้ทั่วไป และ **P95** แทนหางช้าที่ต้องคุม SLA — นอกจากนี้ในระบบที่มี Model Routing ควรแนบ **Routing Split** (`cache %`, `small %`, `frontier %`) เพื่ออธิบายที่มาของทั้ง P50 และ P95",
      ],
      analogy:
        "เหมือนการเดินทางไปทำงาน: ค่าเฉลี่ยอาจบอก 30 นาที แต่ P95 บอกว่า 1 วันใน 20 วันรถติดหนักจนใช้เวลา 90 นาที — ถ้าคุณมีนัดสำคัญ คุณต้องเผื่อเวลาตาม P95 ไม่ใช่ค่าเฉลี่ย",
      code: {
        language: "python",
        filename: "percentiles.py",
        code: `import math


def percentile(values: list[float], p: float) -> float:
    """Nearest-rank percentile (0 < p <= 100)."""
    if not values:
        raise ValueError("values must not be empty")
    if not (0.0 < p <= 100.0):
        raise ValueError("p must be in (0, 100]")
    ordered = sorted(values)
    idx = max(0, math.ceil((p / 100.0) * len(ordered)) - 1)
    return float(ordered[idx])


latencies_ms = [12, 180, 210, 225, 240, 260, 290, 310, 1450, 2100]
print("Mean:", round(sum(latencies_ms) / len(latencies_ms), 1), "ms")
print("P50 :", percentile(latencies_ms, 50), "ms")
print("P95 :", percentile(latencies_ms, 95), "ms")`,
        caption:
          "ใช้สูตร nearest-rank percentile ที่คำนวณซ้ำได้ตรงกันทุกเครื่องโดยไม่ต้องพึ่งไลบรารีหนัก",
      },
      whyTitle: "Why this matters — P95 คือตัวเลขที่ทีม Product และ SLA ใช้ตัดสินใจ",
      whyParagraphs: [
        "ผู้ใช้ไม่จดจำว่าแอปเคยตอบเร็วแค่ไหน แต่จำทุกครั้งที่หน้าจอหมุนค้างนานผิดปกติ การติดตาม P95 คู่กับ {{ttft}} ทำให้คุณจับอาการคอขวดจาก retry หรือ Frontier escalation ได้ตั้งแต่ยังอยู่ในขั้นทดสอบ",
        "เมื่อเทียบกับ Phase 2 Classical ML (P95 `< 5ms`) ตัวเลข P50/P95 นี้จะทำให้เห็นภาพชัดเจนใน Day 92 ว่าควรวาง ML เป็นด่านหน้าตรงจุดไหน",
      ],
    },
    {
      id: "cost-per-1k-thai-docs",
      title: "3 · เศรษฐศาสตร์ Cost per 1,000 Thai Docs: Thai Token Tax + Prompt Caching",
      paragraphs: [
        "เมื่อผู้บริหารถามว่า *\"ถ้าระบบนี้รับเอกสารไทยเดือนละ 100,000 ฉบับ จะเสียค่า API กี่บาท?\"* คำตอบที่แม่นยำต้องมาจากหน่วยมาตรฐาน **Cost per 1,000 Docs (USD & THB)** ที่คำนวณจากจำนวน token จริง ไม่ใช่การเดาจากจำนวนตัวอักษรภาษาอังกฤษ",
        "สูตรต้นทุนต่อ 1 เอกสารของโมเดลแต่ละรุ่นคือ: `uncached_in * price_in + cached_in * price_cached_in + out * price_out` (โดยราคาต่อ 1M tokens) แล้วจึงนำผลรวมต้นทุนของทั้งชุดทดสอบมาปรับสเกลเป็น `(total_cost / num_docs) * 1000` — สำหรับเอกสารไทยที่ {{bpe-tokenizer}} กิน token มากกว่าอังกฤษ 1.5×–3× การเปิด {{prompt-caching}} กับ System Prompt + Few-Shot ที่ซ้ำกัน (ลดราคา cached input 50%–75%) คู่กับ Model Routing สามารถลด Cost/1k Docs ลงได้กว่า **60%–80%** โดยความแม่นยำแทบไม่ลดลง",
      ],
      analogy:
        "เหมือนการคิดต้นทุนอาหารต่อ 1,000 กล่อง: ต้องแยกชั่งทั้งวัตถุดิบซื้อสด (uncached input), วัตถุดิบซื้อยกแพ็กเก็บสต็อก (cached input) และค่าบรรจุภัณฑ์ (output tokens) ไม่ใช่เดาราคาจากขนาดจาน",
      bullets: [
        "**แยก 3 กอง Token เสมอ**: `uncached_input_tokens = max(0, input_tokens - cached_input_tokens)`, `cached_input_tokens`, และ `output_tokens`",
        "**Local / SQLite Cache Hit**: มีต้นทุน API = `$0.00` และ latency ระดับ `~1–5ms` — ยิ่งเอกสารหรือคำถามซ้ำเยอะ Cache Hit Rate ยิ่งช่วยลดบิล",
        "**แปลงเป็นบาทไทย (THB) ควบคู่ USD**: เช่น `35.0 THB/USD` เพื่อให้ทีมธุรกิจในไทยเห็นภาพงบรายเดือนทันที",
      ],
      whyTitle: "Why this matters — หน่วย Cost/1k Docs ทำให้เปรียบเทียบทุก Config เป็นธรรม",
      whyParagraphs: [
        "ชุดทดสอบในเครื่องอาจมีแค่ 30–50 เอกสาร (ค่า API รวมไม่กี่เซ็นต์จนดูเหมือนถูกมาก) แต่พอแปลงเป็น **Cost per 1,000 Docs** และคูณปริมาณจริงรายเดือน ตัวเลขจะเปิดเผยทันทีว่า config ไหนคุ้มค่าและ config ไหนงบบานปลาย",
        "ใน Phase 5 (Day 147) คุณจะต่อยอดสูตรนี้เป็น Capacity Planning & Per-User Monthly Budget ได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — 3-Axis Eval Report ≈ Lighthouse + APM + Cloud Cost Explorer",
      body: [
        "ถ้าคุณเคยทำ Web Performance Tuning คุณจะคุ้นเคยกับการไม่ดูตัวเลขเดียวโดด ๆ แต่ดูทั้งความถูกต้อง (HTTP 2xx / E2E pass), ความเร็ว (P50/P95 API latency) และค่าเซิร์ฟเวอร์ต่อ 1,000 requests",
        "ในงาน AI Engineering 3 แกนนี้ถูกแทนที่ด้วย Accuracy/Macro-F1, P50/P95 Latency และ Cost per 1,000 Docs — หากปรับ prompt ให้แม่นขึ้น 1% แต่ทำให้ P95 ช้าขึ้น 3 เท่าและแพงขึ้น 5 เท่า คุณจะได้เห็น trade-off ครบทั้งกระดานก่อน merge PR",
      ],
      table: [
        ["Schema Pass + Field Accuracy", "API contract test + E2E assertion pass rate"],
        ["P50 / P95 Latency (ms)", "APM / Datadog P50 & P95 endpoint latency"],
        ["Cost per 1,000 Docs (USD/THB)", "Cloud FinOps cost per 1k requests"],
        ["Cache Hit Rate + Routing Split", "CDN hit ratio + origin tier breakdown"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมแค่ 1 ค่าที่ช้ามากจึงดึง Mean ให้หลอกตาได้?",
      body: [
        "ลองนึกว่า 9 คนสอบได้ 200ms แต่คนที่ 10 เน็ตหลุดติด retry นาน 5,000ms ค่าเฉลี่ย (Mean) จะพุ่งเป็น 680ms ซึ่งไม่ตรงกับทั้ง 9 คนแรกและไม่สะท้อนความช้าจริงของคนที่ 10 เลย",
        "การใช้ **P50 (ค่ากลาง)** คู่กับ **P95 (ขอบบนของ 95% แรก)** ช่วยให้เห็นทั้งภาพปกติและภาพแย่ที่สุดที่ผู้ใช้จริงเจอในคราวเดียว",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีไฟล์บันทึกผลการรันสกัดเอกสารไทย 2 สถาปัตยกรรม (`frontier_only` vs `routed_cached`) บนชุด Golden Dataset เดียวกัน — มาเขียนสคริปต์คำนวณครบทั้ง 3 แกนแล้วเทียบกันแบบเห็นตัวเลขจริง",
    steps: [
      {
        title: "1 · คำนวณ Schema Pass Rate, Field Exact Accuracy และ Macro-F1",
        explain:
          "เทียบ prediction กับ gold record โดย `amount_thb` ยอมรับความคลาดเคลื่อน `<= 0.01` บาท, `order_ref` เทียบหลัง strip/upper (รองรับ `None == None`) และคำนวณ Macro-F1 ข้ามทุกคลาส",
        code: {
          language: "python",
          filename: "worked_d090.py",
          code: `def macro_f1(y_true: list[str], y_pred: list[str]) -> float:
    labels = sorted(set(y_true) | set(y_pred))
    f1s: list[float] = []
    for label in labels:
        tp = sum(1 for t, p in zip(y_true, y_pred, strict=True) if t == label and p == label)
        fp = sum(1 for t, p in zip(y_true, y_pred, strict=True) if t != label and p == label)
        fn = sum(1 for t, p in zip(y_true, y_pred, strict=True) if t == label and p != label)
        denom = 2 * tp + fp + fn
        f1s.append((2 * tp / denom) if denom > 0 else 0.0)
    return round(sum(f1s) / len(f1s), 4) if f1s else 0.0


def amount_match(gold: float | None, pred: float | None, tol: float = 0.01) -> bool:
    if gold is None or pred is None:
        return gold is None and pred is None
    return abs(gold - pred) <= tol


y_true = ["billing", "billing", "shipping", "technical", "other"]
y_pred = ["billing", "billing", "shipping", "billing", "other"]
print("Macro-F1:", macro_f1(y_true, y_pred))
print("Amount match (1250.0 vs 1250.005):", amount_match(1250.0, 1250.005))
print("Amount match (None vs None):", amount_match(None, None))`,
        },
        output: `Macro-F1: 0.70
Amount match (1250.0 vs 1250.005): True
Amount match (None vs None): True`,
      },
      {
        title: "2 · คำนวณต้นทุนต่อ 1,000 เอกสาร (แยก Cached Input และ Model Tier)",
        explain:
          "รับตารางราคาต่อ 1M tokens ของแต่ละ tier (`cache`, `small`, `frontier`) แล้วคำนวณต้นทุนจริงต่อ 1,000 เอกสารทั้ง USD และ THB",
        code: {
          language: "python",
          filename: "worked_d090.py",
          code: `PRICING_PER_1M = {
    "cache": {"in": 0.0, "cached_in": 0.0, "out": 0.0},
    "small": {"in": 0.15, "cached_in": 0.075, "out": 0.60},
    "frontier": {"in": 2.50, "cached_in": 1.25, "out": 10.00},
}


def record_cost_usd(rec: dict) -> float:
    p = PRICING_PER_1M[rec["route"]]
    cached_in = min(rec["input_tokens"], rec.get("cached_input_tokens", 0))
    uncached_in = rec["input_tokens"] - cached_in
    return (
        uncached_in * p["in"]
        + cached_in * p["cached_in"]
        + rec["output_tokens"] * p["out"]
    ) / 1_000_000.0


frontier_run = [
    {"route": "frontier", "input_tokens": 900, "cached_input_tokens": 0, "output_tokens": 110, "latency_ms": 1050.0},
    {"route": "frontier", "input_tokens": 850, "cached_input_tokens": 0, "output_tokens": 120, "latency_ms": 1180.0},
]
routed_run = [
    {"route": "cache", "input_tokens": 0, "cached_input_tokens": 0, "output_tokens": 0, "latency_ms": 2.5},
    {"route": "small", "input_tokens": 900, "cached_input_tokens": 600, "output_tokens": 110, "latency_ms": 260.0},
    {"route": "small", "input_tokens": 850, "cached_input_tokens": 600, "output_tokens": 105, "latency_ms": 290.0},
    {"route": "frontier", "input_tokens": 920, "cached_input_tokens": 600, "output_tokens": 115, "latency_ms": 1120.0},
]

for name, run in [("frontier_only", frontier_run), ("routed_cached", routed_run)]:
    per_1k_usd = (sum(record_cost_usd(r) for r in run) / len(run)) * 1000.0
    print(f"{name:14s} -> \${per_1k_usd:.3f} / 1k docs ({per_1k_usd * 35.0:.1f} THB)")`,
        },
        output: `frontier_only  -> $3.338 / 1k docs (116.8 THB)
routed_cached  -> $0.768 / 1k docs (26.9 THB)`,
      },
      {
        title: "3 · สรุป Routing Split และตารางเทียบ 2 Config แบบอ่านจบใน 10 วินาที",
        explain:
          "รวมเปอร์เซ็นต์แต่ละเส้นทาง (`cache`, `small`, `frontier`) คู่กับ P50/P95 และต้นทุน เพื่อใช้เป็นหลักฐานตัดสินใจเลือก config ขึ้น production",
        code: {
          language: "python",
          filename: "worked_d090.py",
          code: `import math
from collections import Counter


def pctl(vals: list[float], p: float) -> float:
    s = sorted(vals)
    return s[max(0, math.ceil((p / 100.0) * len(s)) - 1)]


counts = Counter(r["route"] for r in routed_run)
split = {k: round(v / len(routed_run) * 100.0, 1) for k, v in counts.items()}
lats = [r["latency_ms"] for r in routed_run]
print(f"Routing split (%): {split}")
print(f"Latency P50={pctl(lats, 50):.1f}ms | P95={pctl(lats, 95):.1f}ms")`,
        },
        output: `Routing split (%): {'cache': 25.0, 'small': 50.0, 'frontier': 25.0}
Latency P50=260.0ms | P95=1120.0ms`,
      },
    ],
    gotcha:
      "จุดพลาดยอดฮิตตอนคิดราคา Prompt Caching: อย่าเอา `input_tokens * price_in` แล้วค่อยบวก `cached_input_tokens * price_cached_in` เพราะใน LLM API ส่วนใหญ่ `input_tokens` (prompt_tokens) **รวม** `cached_input_tokens` ไว้ข้างในแล้ว! ต้องลบออกก่อน (`uncached_in = input_tokens - cached_input_tokens`) ไม่งั้นคุณจะคิดเงินซ้ำสองรอบ",
  },

  practice: {
    intro:
      "สร้างโมดูลประเมินผลอัตโนมัติ `eval_benchmark.py` ที่รับรายการผลรันและคำตอบเฉลย แล้วสรุปรายงานครบทั้ง 3 แกน (Schema Pass Rate, Macro-F1, Field Exact Accuracy, P50/P95 Latency, Routing Split และ USD/THB per 1,000 docs)",
    requirements: [
      "สร้าง `PricingTier(BaseModel)` มี `input_per_1m: float`, `cached_input_per_1m: float`, `output_per_1m: float` และ `EvalRecord(BaseModel)` มี `doc_id: str`, `gold_category: str`, `pred_category: str | None`, `gold_amount: float | None`, `pred_amount: float | None`, `schema_valid: bool`, `route: Literal[\"cache\", \"small\", \"frontier\"]`, `input_tokens: int = Field(ge=0)`, `cached_input_tokens: int = Field(default=0, ge=0)`, `output_tokens: int = Field(ge=0)`, `latency_ms: float = Field(ge=0.0)`",
      "สร้าง `compute_percentile(values: list[float], p: float) -> float` ด้วยสูตร nearest-rank (โยน `ValueError` หาก `values` ว่างหรือ `p` นอก `(0, 100]`)",
      "สร้าง `compute_macro_f1(y_true: list[str], y_pred: list[str]) -> float` คำนวณ Macro-F1 ปัดทศนิยม 4 ตำแหน่ง (รองรับกรณี `pred_category` เป็น `None` โดยแทนด้วย `\"__invalid__\"` และนับเฉพาะคลาสที่มีอยู่ใน `y_true` เป็นฐานเฉลี่ย)",
      "สร้าง `evaluate_benchmark(records: list[EvalRecord], pricing: dict[str, PricingTier], thb_per_usd: float = 35.0) -> dict`: คืน dict ที่มี `total_docs`, `schema_pass_rate`, `macro_f1`, `amount_exact_accuracy` (tolerance `0.01`, `None == None` ถือว่าถูก, เคสที่ `schema_valid=False` ถือว่าผิด), `p50_ms`, `p95_ms`, `cache_hit_rate`, `routing_split`, `cost_usd_per_1k_docs`, และ `cost_thb_per_1k_docs` (โยน `ValueError` หาก `records` ว่าง)",
    ],
    starter: {
      language: "python",
      filename: "eval_benchmark.py",
      code: `import math
from typing import Literal
from pydantic import BaseModel, Field


class PricingTier(BaseModel):
    input_per_1m: float = Field(ge=0.0)
    cached_input_per_1m: float = Field(ge=0.0)
    output_per_1m: float = Field(ge=0.0)


class EvalRecord(BaseModel):
    doc_id: str
    gold_category: str
    pred_category: str | None
    gold_amount: float | None
    pred_amount: float | None
    schema_valid: bool
    route: Literal["cache", "small", "frontier"]
    input_tokens: int = Field(ge=0)
    cached_input_tokens: int = Field(default=0, ge=0)
    output_tokens: int = Field(ge=0)
    latency_ms: float = Field(ge=0.0)


def compute_percentile(values: list[float], p: float) -> float:
    """Nearest-rank percentile สำหรับ 0 < p <= 100"""
    # TODO: validate inputs and return nearest-rank percentile
    raise NotImplementedError


def compute_macro_f1(y_true: list[str], y_pred: list[str]) -> float:
    """คำนวณ Macro-F1 เฉลี่ยตามคลาสที่ปรากฏใน y_true (ปัด 4 ตำแหน่ง)"""
    # TODO: compute macro-F1 across unique classes in y_true
    raise NotImplementedError


def evaluate_benchmark(
    records: list[EvalRecord],
    pricing: dict[str, PricingTier],
    thb_per_usd: float = 35.0,
) -> dict:
    """สร้างรายงาน 3 แกน: Accuracy, Latency และ Cost/1k Docs (USD & THB)"""
    # TODO: compute all metrics and return summary dictionary
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_eval_benchmark.py",
      code: `import pytest
from eval_benchmark import (
    EvalRecord,
    PricingTier,
    compute_macro_f1,
    compute_percentile,
    evaluate_benchmark,
)

PRICING = {
    "cache": PricingTier(input_per_1m=0.0, cached_input_per_1m=0.0, output_per_1m=0.0),
    "small": PricingTier(input_per_1m=0.15, cached_input_per_1m=0.075, output_per_1m=0.60),
    "frontier": PricingTier(input_per_1m=2.50, cached_input_per_1m=1.25, output_per_1m=10.00),
}


def test_compute_percentile_and_validation():
    vals = [10.0, 20.0, 30.0, 40.0, 100.0]
    assert compute_percentile(vals, 50) == 30.0
    assert compute_percentile(vals, 95) == 100.0
    with pytest.raises(ValueError):
        compute_percentile([], 50)
    with pytest.raises(ValueError):
        compute_percentile(vals, 0)


def test_compute_macro_f1_basic():
    y_true = ["billing", "billing", "shipping", "shipping"]
    y_pred = ["billing", "shipping", "shipping", "shipping"]
    # billing: tp=1, fp=0, fn=1 -> f1=2/3; shipping: tp=2, fp=1, fn=0 -> f1=4/5=0.8
    assert compute_macro_f1(y_true, y_pred) == pytest.approx((2 / 3 + 0.8) / 2, abs=1e-4)


def test_evaluate_benchmark_three_axes():
    records = [
        EvalRecord(
            doc_id="d1",
            gold_category="billing",
            pred_category="billing",
            gold_amount=1250.0,
            pred_amount=1250.005,
            schema_valid=True,
            route="cache",
            input_tokens=0,
            cached_input_tokens=0,
            output_tokens=0,
            latency_ms=3.0,
        ),
        EvalRecord(
            doc_id="d2",
            gold_category="shipping",
            pred_category="shipping",
            gold_amount=None,
            pred_amount=None,
            schema_valid=True,
            route="small",
            input_tokens=1000,
            cached_input_tokens=600,
            output_tokens=100,
            latency_ms=250.0,
        ),
        EvalRecord(
            doc_id="d3",
            gold_category="billing",
            pred_category="billing",
            gold_amount=500.0,
            pred_amount=500.0,
            schema_valid=True,
            route="small",
            input_tokens=1000,
            cached_input_tokens=600,
            output_tokens=100,
            latency_ms=300.0,
        ),
        EvalRecord(
            doc_id="d4",
            gold_category="technical",
            pred_category=None,
            gold_amount=None,
            pred_amount=None,
            schema_valid=False,
            route="frontier",
            input_tokens=1000,
            cached_input_tokens=0,
            output_tokens=100,
            latency_ms=1200.0,
        ),
    ]
    report = evaluate_benchmark(records, PRICING, thb_per_usd=35.0)
    assert report["total_docs"] == 4
    assert report["schema_pass_rate"] == pytest.approx(0.75)
    assert report["amount_exact_accuracy"] == pytest.approx(0.75)  # d4 invalid -> counts as wrong
    assert report["p50_ms"] == pytest.approx(250.0)
    assert report["p95_ms"] == pytest.approx(1200.0)
    assert report["cache_hit_rate"] == pytest.approx(0.25)
    assert report["routing_split"] == {"cache": 0.25, "small": 0.5, "frontier": 0.25}
    # d1=0, d2=(400*0.15 + 600*0.075 + 100*0.60)/1e6 = 0.000165, d3=0.000165, d4=(1000*2.5+100*10)/1e6=0.0035
    expected_per_1k = ((0.0 + 0.000165 + 0.000165 + 0.0035) / 4) * 1000.0
    assert report["cost_usd_per_1k_docs"] == pytest.approx(expected_per_1k, abs=1e-4)
    assert report["cost_thb_per_1k_docs"] == pytest.approx(expected_per_1k * 35.0, abs=1e-2)
`,
    },
    selfCheck: [
      "`compute_percentile` ผ่านทั้ง P50/P95 และโยน `ValueError` เมื่ออินพุตว่างหรือ `p` นอกช่วง",
      "`compute_macro_f1` เฉลี่ย F1 จากคลาสใน `y_true` โดยไม่ให้คลาสขนาดใหญ่กลบคลาสเล็ก",
      "`amount_exact_accuracy` นับ `1250.0` vs `1250.005` และ `None` vs `None` ว่าถูก แต่นับเคส `schema_valid=False` ว่าผิด",
      "สูตรต้นทุนไม่คิดเงิน `cached_input_tokens` ซ้ำซ้อน (`uncached = input_tokens - cached_input_tokens`) และแปลงเป็น THB ถูกต้อง",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance:
      "ผ่านทุกเทสต์ใน `test_eval_benchmark.py` ด้วย `uv run pytest -q` และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "สำหรับ `uncached_in` ให้ใช้ `cached_in = min(r.input_tokens, r.cached_input_tokens)` และ `uncached_in = r.input_tokens - cached_in` เพื่อกันเคสที่ log บันทึก `cached_input_tokens > input_tokens` โดยบังเอิญ",
      },
      {
        body: "ใน `evaluate_benchmark` เวลาส่งเข้า `compute_macro_f1` ให้แปลงรายการที่ `not r.schema_valid` หรือ `r.pred_category is None` เป็น `\"__invalid__\"` เพื่อให้เคสพังถูกหักคะแนน Recall ของคลาสจริงอย่างยุติธรรม",
      },
      {
        body: "โครงของ `compute_percentile` และ `compute_macro_f1` พร้อมแล้ว — เหลือรวมทุกแกนใน `evaluate_benchmark`:",
        code: {
          language: "python",
          filename: "hint_day90.py",
          code: `def compute_percentile(values: list[float], p: float) -> float:
    if not values or not (0.0 < p <= 100.0):
        raise ValueError("values must be non-empty and 0 < p <= 100")
    ordered = sorted(values)
    idx = max(0, math.ceil((p / 100.0) * len(ordered)) - 1)
    return float(ordered[idx])


def compute_macro_f1(y_true: list[str], y_pred: list[str]) -> float:
    classes = sorted(set(y_true))
    if not classes:
        return 0.0
    scores: list[float] = []
    for c in classes:
        tp = sum(1 for t, p in zip(y_true, y_pred, strict=True) if t == c and p == c)
        fp = sum(1 for t, p in zip(y_true, y_pred, strict=True) if t != c and p == c)
        fn = sum(1 for t, p in zip(y_true, y_pred, strict=True) if t == c and p != c)
        denom = 2 * tp + fp + fn
        scores.append((2 * tp / denom) if denom > 0 else 0.0)
    return round(sum(scores) / len(scores), 4)`,
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
      title: "คิดเงิน `cached_input_tokens` ซ้ำกับ `input_tokens`",
      symptom: "ตัวเลข Cost/1k Docs ในรายงานแพงกว่าบิลจริงเพราะบวก `input_tokens * price_in + cached_input_tokens * price_cached_in`",
      fix: "ลบ `cached_input_tokens` ออกจาก `input_tokens` ก่อน (`uncached = input_tokens - cached_in`) เพราะ `input_tokens` จาก API มักรวมส่วนที่ hit cache ไว้แล้ว",
    },
    {
      title: "วัด Accuracy เฉพาะเอกสารที่ `schema_valid == True` แล้วตัดเคสพังทิ้ง",
      symptom: "โมเดลพังไป 20% แต่รายงาน Accuracy 98% เพราะนำเฉพาะ 80% ที่เหลือมาเป็นตัวหาร",
      fix: "รายงาน `schema_pass_rate` แยกให้ชัด และนับเคสที่ `schema_valid == False` เป็นผิดในตัวหาร `total_docs` ของ Field Accuracy และ Macro-F1 เสมอ",
    },
    {
      title: "ประเมินต้นทุนภาษาไทยด้วยสูตรคร่าว ๆ 1 token ≈ 4 ตัวอักษร",
      symptom: "งบ API จริงบานปลายกว่าที่ประมาณไว้ 2–3 เท่า เพราะภาษาไทยกินจำนวน token มากกว่าภาษาอังกฤษมาก",
      fix: "ใช้จำนวน token จริงจาก tokenizer หรือ usage field ใน API response log มาคำนวณ Cost/1k Docs เสมอ",
    },
    {
      title: "รายงานเฉพาะ Mean Latency โดยไม่ดู P95",
      symptom: "ค่าเฉลี่ยดูดีที่ 300ms แต่ลูกค้า 5% ที่ติด retry หรือ Frontier route ต้องรอเกือบ 3 วินาที",
      fix: "รายงานทั้ง P50 และ P95 คู่กับ Routing Split (`cache` / `small` / `frontier`) ทุกครั้ง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d090-q1",
        "ระบบสกัดเอกสารมี 100 เอกสาร: ผ่าน Schema 80 เอกสาร (ทายหมวดถูก 78 เอกสาร) และพัง Schema 20 เอกสาร — ข้อใดคือวิธีรายงานผลที่ซื่อสัตย์และไม่หลอกตา?",
        [
          ["รายงานแค่ Accuracy = 78/80 = 97.5% เพราะอีก 20 เอกสารไม่ได้ตอบกลับมา", "หลอกตาอย่างรุนแรง — ซ่อนอัตราการพัง 20% ออกจากตัวชี้วัดหลัก"],
          ["รายงาน Schema Pass Rate = 80% และนับ 20 เอกสารที่พังเป็นผิดในตัวหารรวม (End-to-End Accuracy = 78%)", "ถูก — สะท้อนคุณภาพจริงที่ผู้ใช้ปลายทางได้รับและชี้ชัดว่าต้องรีบแก้ความเสถียรของ schema"],
          ["ลบ 20 เอกสารที่พังออกจาก Golden Dataset แล้วรันใหม่", "ห้ามแก้ข้อสอบเพื่อให้คะแนนสูงขึ้นเด็ดขาด"],
          ["เปลี่ยนไปรายงานเฉพาะเวลา P50 แทน", "ความเร็วไม่สามารถทดแทนความถูกต้องได้"],
        ],
        "B",
        "End-to-end metrics ต้องใช้จำนวนเอกสารทั้งหมดเป็นตัวหาร และรายงาน Schema Pass Rate แยกควบคู่เสมอเพื่อไม่ซ่อนเคสที่พัง",
        "เมื่อเอกสารบางส่วนพัง schema validation ควรนับอย่างไรใน Field Accuracy และ Macro-F1?",
        "รายงาน Schema Pass Rate แยกต่างหาก และนับเคสที่ schema พังเป็นคำตอบผิดในตัวหารรวม `total_docs` เสมอ",
      ),
      mc(
        "d090-q2",
        "เหตุใดสูตรคำนวณต้นทุน LLM API จึงต้องคำนวณ `uncached_in = input_tokens - cached_input_tokens` ก่อนคูณราคา?",
        [
          ["เพราะ API แจก `cached_input_tokens` ฟรี 100% ทุกเจ้า", "ไม่เสมอไป — ส่วนใหญ่มักลดราคา 50%–75% (ต้องคูณ `cached_input_per_1m`)"],
          ["เพราะ `input_tokens` ที่ API รายงานมักรวมจำนวน `cached_input_tokens` ไว้แล้ว หากไม่ลบออกจะคิดเงินส่วนที่ cached ซ้ำสองรอบ", "ถูก — ต้องแยกกอง uncached กับ cached ออกจากกันก่อนคูณเรตราคาของแต่ละกอง"],
          ["เพราะ `output_tokens` รวมอยู่ใน `cached_input_tokens`", "output tokens คิดแยกต่างหากและไม่ได้ถูก prompt-cached"],
          ["เพื่อแปลงจาก USD เป็น THB", "การแปลงสกุลเงินทำหลังได้ต้นทุนรวมใน USD แล้ว"],
        ],
        "B",
        "Usage payload ของ LLM API รายงาน `input_tokens` เป็นยอดรวมทั้งหมด (uncached + cached) จึงต้องหัก `cached_input_tokens` ออกก่อนคูณราคาเต็ม",
        "สูตรคำนวณต้นทุนเมื่อมี Prompt Caching ต้องแยก input tokens เป็นกี่ส่วน?",
        "2 ส่วน: `uncached_in = input_tokens - cached_input_tokens` (คูณราคาเต็ม) และ `cached_input_tokens` (คูณราคาลดของ cache) แล้วบวกกับ `output_tokens`",
      ),
      mc(
        "d090-q3",
        "ในระบบ Hybrid Routing ที่ 75% ใช้ Small Model (~250ms) และ 25% ถูกส่งต่อไป Frontier Model (~1,200ms) ตัวเลข **P50** และ **P95** ของทั้งระบบจะใกล้เคียงค่าใด?",
        [
          ["P50 ≈ 250ms และ P95 ≈ 250ms", "ผิด — กลุ่ม 25% ที่ช้า (~1,200ms) กินพื้นที่ตั้งแต่ P76 ถึง P100 ดังนั้น P95 ต้องตกอยู่ในกลุ่ม Frontier"],
          ["P50 ≈ 1,200ms และ P95 ≈ 1,200ms", "ผิด — 75% ของคำขอจบเร็วที่ Small Model ดังนั้นค่ากลาง P50 ยังอยู่ที่ ~250ms"],
          ["P50 ≈ 250ms (ประสบการณ์คนส่วนใหญ่) และ P95 ≈ 1,200ms (หางช้าของเคสที่ escalate)", "ถูก — นี่คือเหตุผลที่ต้องดูทั้ง P50, P95 และ Routing Split คู่กัน"],
          ["P50 ≈ 0ms และ P95 ≈ 500ms", "ไม่ตรงกับหลักการของ percentile"],
        ],
        "C",
        "เมื่อ 75% จบที่ ~250ms ค่า P50 จึงอยู่ที่ ~250ms แต่เนื่องจาก 25% จบที่ ~1,200ms ค่า P95 จึงตกอยู่ในช่วง Frontier (~1,200ms)",
        "หาก 75% ของทราฟฟิกวิ่ง Small Model (250ms) และ 25% วิ่ง Frontier (1,200ms) ค่า P50 กับ P95 อยู่แถวไหน?",
        "P50 อยู่แถว ~250ms ส่วน P95 อยู่แถว ~1,200ms เพราะ 25% ครอบคลุมหางบน P76–P100",
      ),
      mc(
        "d090-q4",
        "ทำไมงานประเมินหมวดหมู่ทิกเก็ตภาษาไทย (เช่น `billing` 70%, `shipping` 20%, `technical` 7%, `other` 3%) จึงควรใช้ **Macro-F1** ควบคู่กับ Accuracy?",
        [
          ["เพราะ Macro-F1 คำนวณเร็วกว่า Accuracy 100 เท่า", "ความเร็วในการคำนวณไม่ต่างกัน ประเด็นอยู่ที่ความยุติธรรมต่อคลาสขนาดเล็ก"],
          ["เพราะ Macro-F1 ให้น้ำหนักทุกหมวดหมู่เท่ากัน หากโมเดลทาย `technical` (7%) ผิดหมด คะแนน Macro-F1 จะร่วงลงชัดเจนทันที", "ถูก — ป้องกันไม่ให้หมวดหมู่ใหญ่ (70%) กลบความล้มเหลวของหมวดหมู่สำคัญที่มีเคสน้อย"],
          ["เพราะ Macro-F1 วัดต้นทุน token ได้ในตัว", "Macro-F1 วัดเฉพาะคุณภาพการจำแนก ไม่ได้วัดต้นทุน token"],
          ["เพราะ Accuracy ใช้ไม่ได้กับข้อมูลภาษาไทย", "Accuracy ใช้ได้แต่หลอกตาได้ง่ายเมื่อคลาสไม่สมดุล (imbalanced)"],
        ],
        "B",
        "Macro-F1 เฉลี่ย F1 ของทุกคลาสด้วยน้ำหนักเท่ากัน ทำให้เห็นทันทีหากโมเดลทำได้แย่บนหมวดหมู่ที่มีสัดส่วนน้อย",
        "ข้อดีหลักของ Macro-F1 เมื่อเทียบกับ Accuracy บนชุดข้อมูลทิกเก็ตไม่สมดุลคืออะไร?",
        "Macro-F1 ให้น้ำหนักทุกคลาสเท่ากัน จึงไม่ถูกคลาสขนาดใหญ่กลบเมื่อโมเดลทายผิดในคลาสขนาดเล็ก",
      ),
    ],
  },

  takeaways: [
    "วัดความแม่นยำให้ครบ 3 ระดับเสมอ: **Schema Pass Rate**, **Field Exact Accuracy** (รองรับ `None` และ tolerance) และ **Macro-F1** — ห้ามตัดเคส schema พังออกจากตัวหาร",
    "รายงาน **P50 และ P95 Latency** คู่กับ **Routing Split** (`cache` / `small` / `frontier`) เพื่อไม่ให้ค่าเฉลี่ยซ่อนหางช้าของระบบ",
    "คำนวณ **Cost per 1,000 Thai Docs (USD & THB)** จากจำนวน token จริง โดยแยก `uncached_input`, `cached_input` และ `output_tokens` เพื่อไม่คิดราคาซ้ำซ้อน",
    "เก็บผลรายงาน JSON/Markdown ของทุก config เป็นหลักฐานเปรียบเทียบก่อนตัดสินใจขึ้น production และใช้เทียบกับ ML Baseline ใน Day 92",
  ],

  reviewCards: [
    rc(
      "d090-rc-1",
      "3 แกนหลักในการประเมิน LLM Extractor บนเอกสารภาษาไทยคืออะไร และแต่ละแกนควรรายงานตัวเลขใด?",
      "1) Accuracy: Schema Pass Rate, Field Exact Accuracy, Macro-F1; 2) Latency: P50 & P95 ms (+ Routing Split); 3) Cost: USD & THB per 1,000 docs (แยก uncached/cached input + output)",
    ),
    rc(
      "d090-rc-2",
      "จุดพลาดยอดฮิตตอนคำนวณค่า Prompt Caching จาก API usage log คืออะไร?",
      "ลืมลบ `cached_input_tokens` ออกจาก `input_tokens` ทำให้คิดเงินส่วนที่ hit cache ซ้ำสองรอบ — ต้องใช้ `uncached_in = input_tokens - cached_input_tokens`",
    ),
    rc(
      "d090-rc-3",
      "เหตุใดในระบบ Routed LLM จึงต้องรายงานทั้ง P50 และ P95 แทนการรายงาน Mean Latency?",
      "เพราะ latency มีหางยาว (right-skewed) จาก retry และ Frontier routing — P50 บอกความเร็วส่วนใหญ่ ส่วน P95 เปิดเผยหางช้าที่กระทบ SLA จริง",
    ),
  ],

  sources: [
    { label: "OpenAI API Docs — Prompt Caching & Token Usage", href: "https://platform.openai.com/docs/guides/prompt-caching" },
    { label: "Anthropic Docs — Prompt Caching Pricing & Metrics", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" },
    { label: "scikit-learn Docs — F1 Score (Macro vs Micro)", href: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html" },
    { label: "Pydantic v2 Docs — Models & Serialization", href: "https://docs.pydantic.dev/latest/concepts/models/" },
  ],

  glossary: [
    "bpe-tokenizer",
    "prompt-caching",
    "ttft",
    "precision-recall",
    "golden-dataset",
    "jsonl",
    "structured-output",
    "caching",
  ],
});
