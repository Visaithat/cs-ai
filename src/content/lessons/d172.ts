import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D172 — Phase 6 / Block B43 (Milestone 4)
 * Milestone 4: Eval Report Passing Quality Gates
 */
export const d172: Lesson = defineLesson({
  day: 172,
  titleTh: "Milestone 4: สรุป Eval Report 40 เคสที่ผ่าน Quality Gates ครบทุกมิติ",
  tagline: "30 นาที · Milestone 4 Lab · รวมผล 40-Case Golden Eval + Ragas + Promptfoo + Langfuse Telemetry ออกเป็น Quality Gate Report สำหรับ CI และ README",
  icon: "bar-chart-3",
  visual: {
    id: "capstone-eval-telemetry",
    title: "Milestone 4 Quality Gate — 4 Slices 40 เคส + Telemetry ผ่านเกณฑ์พร้อมส่งต่อ B44",
    caption: "ตรวจสอบเกณฑ์ผ่านครบทั้ง 4 กลุ่ม (Thai FAQ >= 0.85, Code-Switch >= 0.85, Unanswerable >= 0.90, Red-Team >= 0.90) คู่กับ P95 Latency และ Trace 100%",
    alt: "แผนภาพสรุปผล Milestone 4 Eval Report ที่ผ่าน Quality Gates ทั้ง 4 กลุ่มเคสและ Telemetry",
  },
  requiresApiKey: false,
  apiKeyNote: "รัน Milestone 4 Quality Gate และสร้าง Eval Report Markdown บนเครื่องคุณได้ 100% ด้วยข้อมูลจาก D169–D171",
  tools: ["Eval Harness", "Ragas", "Promptfoo", "Langfuse", "pytest"],

  bigPicture: [
    {
      node: 3,
      heading: "รวมหลักฐาน B43 (D169–D171) เป็น Quality Gate เดียวที่สั่งผ่าน/ตกอัตโนมัติ",
      body: "การมีไฟล์ Golden Set (D169), ผล Ragas/Promptfoo (D170) และตัวเลข Langfuse (D171) แยกกันคนละสคริปต์ยังใช้งานใน CI ได้ไม่เต็มที่ หากไม่มี **Aggregator Gate** ที่ตรวจเงื่อนไขทั้งหมดพร้อมกัน",
      lessonNote: "Milestone 4 รวบรวมผลทั้งคุณภาพ ความปลอดภัย และ Latency/Cost เข้าสู่ `Milestone4Report` เพื่อตัดสินใจว่าพร้อมไป Deploy ใน B44 หรือไม่",
    },
    {
      node: 1,
      heading: "ตรวจทั้งค่าเฉลี่ยรวมและคะแนนราย Slice (40 เคส) เพื่อกันจุดบอด",
      body: "ระบบอาจได้คะแนนรวม 0.88 แต่มีกลุ่ม `attack` หรือ `unanswerable` ร่วงต่ำกว่าเกณฑ์ ซึ่งอันตรายมากเมื่อเปิดให้ผู้ใช้จริงเข้าถึง",
      lessonNote: "Quality Gate ของเราตรวจครบทั้ง `thai_faq`, `code_switch`, `unanswerable`, และ `attack` ให้ผ่านตามโควตา 12/10/10/8",
    },
    {
      node: 5,
      heading: "ล็อก Telemetry Gate: Trace Coverage 100% และ P95 <= 3,500 ms",
      body: "ใน Production คุณภาพดีอย่างเดียวไม่พอ — ต้องรวดเร็วตาม SLA และสังเกตการณ์ได้ทุกคำขอโดยไม่รั่วข้อมูล {{pdpa}}",
      lessonNote: "Milestone 4 บังคับ `trace_coverage == 1.0`, `p95_ms <= 3500`, และ `pii_leaks == 0` ควบคู่ไปกับคะแนน {{ragas}} และ {{promptfoo}}",
    },
    {
      node: 4,
      heading: "ส่งออก Eval Report Markdown ไปใส่ CI Summary และ README.md",
      body: "รายงานที่ดีต้องอ่านได้ทั้งเครื่อง (JSON สำหรับ GitHub Actions exit code) และอ่านได้ทั้งคน (Markdown Table สำหรับผู้สัมภาษณ์)",
      lessonNote: "ผลลัพธ์จากวันนี้จะเป็นตาราง Eval & Cost Metrics หลักที่จะใช้โชว์ใน B45 (D178) และ Final Defense (D180)",
    },
  ],

  objectives: [
    "**ประกอบตัวตรวจรับ Milestone 4 Quality Gates** ที่รวมคะแนน 40-Case {{golden-dataset}} ({{ragas}} Faithfulness/Recall, {{promptfoo}} Schema/Abstention/Attack) เข้ากับ {{langfuse}} Telemetry (`trace_coverage`, `P95`, `Cost/1k`) ในที่เดียว",
    "**ตรวจจับ Blockers อย่างโปร่งใส** ทั้งระดับภาพรวมและระดับ slice ย่อย (`thai_faq`, `code_switch`, `unanswerable`, `attack`) เพื่อป้องกันการปล่อยระบบที่มีจุดบอดขึ้น Production",
    "**สร้างรายงาน Markdown Eval Report** ที่พร้อมแปะลง `README.md` และ GitHub Actions Step Summary เพื่อยืนยันความพร้อมก่อนเข้าสู่ Block B44 (PDPA Middleware, FastAPI SSE & Staging Deploy)",
  ],

  prerequisites: [
    "ทำแบบฝึกหัด D169 (`golden_eval_dataset.py`), D170 (`eval_runner.py`), และ D171 (`telemetry_langfuse.py`) แล้ว",
    "เข้าใจเกณฑ์ Capstone Rubric 4 เสาหลักจาก ADR-001 (D157)",
    "ใช้งาน {{pydantic}}, `pytest` และ `ruff` ได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "ทำงานต่อในโปรเจกต์ `thai-enterprise-assistant/` โดยรันชุดทดสอบของ D169–D171 ให้ผ่านก่อน แล้วสร้าง `src/milestone4_eval_report.py` สำหรับตรวจรับ Milestone 4",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv run pytest -q tests/test_golden_eval_dataset.py tests/test_eval_runner.py tests/test_telemetry_langfuse.py
uv run ruff check .`,
    steps: [
      ["b43-unit", "ตรวจว่า unit tests ของ D169, D170 และ D171 ผ่านสีเขียวทั้งหมด"],
      ["lint", "ยืนยันว่าโค้ดสะอาดด้วย `uv run ruff check .`"],
      ["gate", "พร้อมสร้าง `src/milestone4_eval_report.py` เพื่อออกใบรับรอง Milestone 4"],
    ],
    note: "ใน Milestone 4 นี้ คุณจะได้เขียนสคริปต์ที่แปลง JSON Metrics เป็นทั้ง Gate Decision (`SHIP_TO_B44` / `BLOCK_AND_FIX`) และตาราง Markdown สำหรับพอร์ตโฟลิโอ",
  },

  concepts: [
    {
      id: "milestone4-unified-gates",
      title: "1 · เกณฑ์ Quality Gates ทั้งหมดของ Milestone 4 (Quality + Safety + Telemetry)",
      paragraphs: [
        "เพื่อเซ็นผ่าน **Milestone 4: Eval Report Passing Quality Gates** ระบบต้องสอบผ่านเกณฑ์ขั้นต่ำที่เรากำหนดไว้ตั้งแต่ ADR-001 พร้อมกันทุกมิติ — ขาดแม้แต่ข้อเดียวถือว่า `BLOCK_AND_FIX` (ต้องกลับไปซ่อม Failure Mode ก่อนข้ามไป B44):",
        "1) **Dataset & Slice Completeness**: รันครบ `40` เคสตามโควตา (`thai_faq=12`, `code_switch=10`, `unanswerable=10`, `attack=8`), 2) **RAG & Citation Quality**: `Recall@5 >= 0.85` และ {{ragas}} `Faithfulness >= 0.85`, 3) **Abstention & Reliability**: เคส `unanswerable` ปฏิเสธถูกต้อง `>= 0.90` และ {{structured-output}} {{schema}} ผ่าน `>= 0.99`",
        "4) **Security & Observability**: เคส `attack` ป้องกันได้ `>= 0.90`, มี {{langfuse}} `trace_coverage == 1.00` (100% ของคำขอมี `trace_id`), `pii_leaks == 0`, และ `P95 Latency <= 3,500 ms` พร้อมระบุตัวเลข `Cost / 1,000 queries` ที่คำนวณได้จริง",
      ],
      analogy:
        "เหมือนใบตรวจสภาพเครื่องบินก่อนขึ้นบินจริง (Pre-Flight Release Checklist): ไม่ใช่แค่ดูว่าเครื่องยนต์แรง (Faithfulness 0.92) แต่ต้องดูพร้อมกันว่าเข็มวัดความเร็วทำงาน 100% (Trace Coverage), เบรกฉุกเฉินไม่ค้าง (Abstention/Attack), และใช้น้ำมันอยู่ในงบ (Cost/1k)",
      bullets: [
        "**`Recall@5 >= 0.85`** และ **`Faithfulness >= 0.85`**: ยืนยันว่าทั้ง Retrieval และ Generation ของ {{rag}} ผ่านเกณฑ์",
        "**`Abstention >= 0.90`** และ **`Attack Defense >= 0.90`**: ป้องกันทั้งอาการหลอนนอกเอกสารและ {{prompt-injection}}",
        "**`Schema >= 0.99`**, **`Trace Coverage == 1.00`**, **`P95 <= 3,500 ms`**, **`PII Leaks == 0`**: ยืนยันความพร้อมด้าน Ops & {{pdpa}}",
      ],
      whyTitle: "Why this matters — แปลง Quality Gate เป็น Exit Code ใน CI/CD",
      whyParagraphs: [
        "เมื่อคุณเขียน Quality Gate เป็นโค้ดที่คืน `passed_gate: bool` และ `blockers: list[str]` คุณสามารถนำไปผูกกับ GitHub Actions ใน B44 ได้ทันที (ถ้า `passed_gate` เป็น `False` ให้สั่ง `sys.exit(1)` เพื่อบล็อกการ deploy)",
        "นี่คือเส้นแบ่งสำคัญระหว่างโปรเจกต์ของนักศึกษากับระบบวิศวกรรม AI ระดับ Production",
      ],
    },
    {
      id: "slice-level-non-regression-check",
      title: "2 · ตรวจลึกถึงระดับ Slice และรายการ Blockers ที่ระบุต้นตอทันที",
      paragraphs: [
        "ในรายงาน Milestone 4 เราไม่เพียงตอบว่า *\"ผ่านหรือไม่ผ่าน\"* แต่ฟังก์ชันตรวจรับต้องบอกได้ทันทีว่า **ติด Blocker ข้อไหนบ้าง** เช่น `[\"code_switch pass_rate 0.70 < 0.85\", \"p95_ms 3920.0 > 3500.0\"]`",
        "การรายงานราย slice ตามตาราง 4 กลุ่ม (`thai_faq`, `code_switch`, `unanswerable`, `attack`) ช่วยให้ทีมตรวจสอบได้ว่าไม่มีกลุ่มไหนโดนค่าเฉลี่ยกลบ เช่น ถ้า `thai_faq` ได้ `1.00` (12/12) แต่ `code_switch` ได้ `0.70` (7/10) ค่าเฉลี่ยสองกลุ่มนี้อาจดูสูงถึง `0.86` แต่ตัวตรวจราย slice จะจับได้ทันทีว่า `code_switch` ยังไม่ผ่าน `0.85`",
      ],
      analogy:
        "เหมือนรายงานผลตรวจสุขภาพประจำปีที่ไม่ใช่แค่เขียนว่า 'สุขภาพโดยรวม B+' แต่ชี้ตรงจุดเลยว่า 'ความดันสูงกว่าเกณฑ์ 145/95 และน้ำตาลเกิน' เพื่อจะได้รักษาถูกโรคทันที",
      code: {
        language: "python",
        filename: "gate_blockers.py",
        code: `def check_slice_floors(by_slice: dict[str, float], floors: dict[str, float]) -> list[str]:
    blockers: list[str] = []
    for name, min_score in floors.items():
        actual = by_slice.get(name, 0.0)
        if actual < min_score:
            blockers.append(f"slice:{name} {actual:.2f} < {min_score:.2f}")
    return blockers


floors = {"thai_faq": 0.85, "code_switch": 0.85, "unanswerable": 0.90, "attack": 0.90}
print("OK:", check_slice_floors({"thai_faq": 0.92, "code_switch": 0.88, "unanswerable": 0.90, "attack": 0.95}, floors))
print("FAIL:", check_slice_floors({"thai_faq": 1.00, "code_switch": 0.70, "unanswerable": 0.90, "attack": 0.88}, floors))`,
        caption: "แยกตรวจเกณฑ์ขั้นต่ำของแต่ละ slice พร้อมระบุข้อความ blocker ที่ชัดเจน",
      },
      whyTitle: "Why this matters — ประหยัดเวลาสืบสวนเมื่อ CI แดง",
      whyParagraphs: [
        "เวลา CI fail เพราะ `passed_gate == False` ถ้าข้อความ error บอกแค่ `AssertionError` คุณต้องมานั่งเปิด log ไล่หาเองว่าพังตรงไหน",
        "การสร้าง `blockers: list[str]` ที่ระบุชื่อ metric, ค่าจริง และค่าเกณฑ์ขั้นต่ำ ช่วยให้รู้สาเหตุใน 3 วินาที",
      ],
    },
    {
      id: "markdown-eval-report-for-portfolio",
      title: "3 · แปลง Eval Report เป็น Markdown สำหรับ CI Summary และ README.md",
      paragraphs: [
        "งานของ Block B43 ยังไม่จบแค่โค้ดผ่าน `pytest` แต่ต้องสื่อสารผลลัพธ์ให้ทั้งทีมและผู้สัมภาษณ์งานเห็นภาพชัดเจนด้วย เราจึงสร้างตัวแปลง `Milestone4Report` เป็น **Markdown Table** ที่มีครบ 4 ส่วน: (1) สรุปคำตัดสิน (`SHIP_TO_B44` vs `BLOCK_AND_FIX`), (2) ตารางคะแนนราย Slice 40 เคส, (3) ตาราง KPI คุณภาพ + Telemetry (Faithfulness, Recall@5, Schema, P50/P95, Cost/1k), และ (4) รายการ Blockers (ถ้ามี)",
        "รายงานนี้เขียนลง `evals/milestone4_report.md` ได้อัตโนมัติใน CI และใช้เป็นฐานตัวเลขจริงสำหรับ `README.md` ที่เราจะขัดเกลาใน B45",
      ],
      analogy:
        "เหมือนหน้าสรุปผู้บริหาร (Executive Dashboard) ที่ดึงตัวเลขจากเครื่องจักรมาแสดงเป็นตารางเรียบร้อย — วิศวกรดู JSON ในเครื่องมือ แต่หัวหน้าทีมและผู้สัมภาษณ์เปิดอ่าน Markdown ได้ทันที",
      bullets: [
        "**Single Source of Truth**: ตัวเลขใน `README.md` มาจากผลรันโค้ดจริง ไม่ใช่ตัวเลขพิมพ์มือที่ล้าสมัย",
        "**GitHub Step Summary**: ใน B44 สามารถ pipe ไฟล์ Markdown นี้เข้า `$GITHUB_STEP_SUMMARY` ให้แสดงบนหน้า PR ได้เลย",
        "**พร้อมต่อ B44**: เมื่อ Gate เขียวแล้ว สัปดาห์หน้าเราจะห่อระบบด้วย PDPA Middleware + FastAPI SSE + Docker Deploy",
      ],
      whyTitle: "Why this matters — เชื่อม B43 เข้ากับความสำเร็จของ Milestone 5 และ Final Defense",
      whyParagraphs: [
        "ใน B44 เราจะทำ Red-Team & Staging Deploy (Milestone 5) และใน B45 เราจะทำ Final Defense — ตัวเลขฐานจาก Milestone 4 คือหลักฐานเปรียบเทียบก่อน-หลังขึ้น Staging",
        "รีโป GitHub ที่มีทั้ง `ADR-001.md` และ `milestone4_report.md` แสดงความเป็นมืออาชีพที่หาได้ยากในระดับ Junior",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Milestone 4 Eval Report คือ Release Readiness Sign-Off + Lighthouse Report",
      body: [
        "ในทีมเว็บก่อนปล่อยฟีเจอร์ใหญ่เข้า Production คุณต้องดูรายงานรวมจาก CI (Unit + E2E + Lighthouse Performance + Security Audit) ก่อนกดปุ่ม Release Milestone 4 ทำหน้าที่เดียวกันให้ระบบ AI:",
      ],
      table: [
        ["40-Case Slice Table", "Test Coverage & E2E Matrix Breakdown"],
        ["`P95 <= 3,500ms` & `Cost/1k`", "Performance Budget & Cloud Infra Estimate"],
        ["`blockers: list[str]`", "CI Release Gate Failure Diagnostics"],
        ["`milestone4_report.md`", "Automated PR Check / Release Notes Summary"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Milestone 4 ถึงบังคับตรวจทั้งที่เพิ่งผ่าน B42 มา?",
      body: [
        "ใน Milestone 3 (D168) เราตรวจแค่ว่าท่อ E2E ทำงานครบ 4 ตัวอย่างได้จริงหรือไม่ (Functional Smoke Test) แต่ยังไม่ได้วัดเชิงสถิติบน 40 เคสและยังไม่ได้วัด latency/cost",
        "Milestone 4 (D172) จึงเป็นด่านพิสูจน์เชิงปริมาณว่าเมื่อเจอคำถามหลากหลาย 40 ข้อ ระบบได้คะแนนเกินเกณฑ์ `>= 0.85` / `>= 0.90` จริงและคุมต้นทุนกับความเร็วให้อยู่ในงบได้",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองรันตัวประเมิน Milestone 4 Gate บนผลลัพธ์ของ 40-Case Golden Set + Langfuse Telemetry แล้วเรนเดอร์ออกเป็นตาราง Markdown และทดสอบกรณีที่มี Blocker กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · นิยาม Thresholds และตรวจ Gate รวม + ราย Slice",
        explain:
          "ตรวจสอบตัวเลขทั้ง 40 เคส, เกณฑ์ Ragas/Promptfoo, ราย slice 4 กลุ่ม และตัวเลข Telemetry (`trace_coverage`, `p95_ms`, `pii_leaks`) พร้อมสะสมรายการ `blockers`",
        code: {
          language: "python",
          filename: "worked_milestone4.py",
          code: `def check_milestone4(metrics: dict) -> tuple[bool, list[str]]:
    blockers: list[str] = []
    if metrics["total_cases"] != 40:
        blockers.append(f"total_cases {metrics['total_cases']} != 40")
    if metrics["recall_at_5"] < 0.85:
        blockers.append(f"recall_at_5 {metrics['recall_at_5']:.2f} < 0.85")
    if metrics["faithfulness"] < 0.85:
        blockers.append(f"faithfulness {metrics['faithfulness']:.2f} < 0.85")
    if metrics["schema_pass_rate"] < 0.99:
        blockers.append(f"schema_pass_rate {metrics['schema_pass_rate']:.2f} < 0.99")
    if metrics["trace_coverage"] < 1.0:
        blockers.append(f"trace_coverage {metrics['trace_coverage']:.2f} < 1.00")
    if metrics["p95_ms"] > 3500.0:
        blockers.append(f"p95_ms {metrics['p95_ms']:.1f} > 3500.0")
    if metrics["pii_leaks"] != 0:
        blockers.append(f"pii_leaks {metrics['pii_leaks']} != 0")

    slice_floors = {"thai_faq": 0.85, "code_switch": 0.85, "unanswerable": 0.90, "attack": 0.90}
    for s_name, floor in slice_floors.items():
        val = metrics["by_slice"].get(s_name, 0.0)
        if val < floor:
            blockers.append(f"slice:{s_name} {val:.2f} < {floor:.2f}")

    return len(blockers) == 0, blockers`,
        },
      },
      {
        title: "2 · รันตรวจเคสที่ผ่านครบทุก Gate (SHIP_TO_B44)",
        explain:
          "ป้อนผลลัพธ์หลังแก้ Top 3 Failure Modes (D170) และติด Telemetry (D171) — ทุกตัวเลขผ่านเกณฑ์ Milestone 4",
        code: {
          language: "python",
          filename: "worked_milestone4.py",
          code: `passing_metrics = {
    "total_cases": 40,
    "recall_at_5": 0.90,
    "faithfulness": 0.91,
    "schema_pass_rate": 1.00,
    "trace_coverage": 1.00,
    "p50_ms": 1180.0,
    "p95_ms": 2840.0,
    "cost_per_1k_usd": 0.267,
    "pii_leaks": 0,
    "by_slice": {
        "thai_faq": 0.92,
        "code_switch": 0.88,
        "unanswerable": 0.90,
        "attack": 0.95,
    },
}

passed, blockers = check_milestone4(passing_metrics)
print("Verdict:", "SHIP_TO_B44" if passed else "BLOCK_AND_FIX", "| blockers:", blockers)`,
        },
        output: `Verdict: SHIP_TO_B44 | blockers: []`,
      },
      {
        title: "3 · ทดสอบจับ Blocker เมื่อมี Slice ต่ำกว่าเกณฑ์และ P95 เกินงบ",
        explain:
          "ลองลดคะแนน `attack` เหลือ `0.75` และเพิ่ม `p95_ms` เป็น `4100.0` — ตัวตรวจจะบล็อกและระบุรายการ Blocker ชัดเจนทั้ง 2 จุด",
        code: {
          language: "python",
          filename: "worked_milestone4.py",
          code: `failing_metrics = {
    **passing_metrics,
    "p95_ms": 4100.0,
    "by_slice": {**passing_metrics["by_slice"], "attack": 0.75},
}

passed_bad, blockers_bad = check_milestone4(failing_metrics)
print("Verdict:", "SHIP_TO_B44" if passed_bad else "BLOCK_AND_FIX")
for b in blockers_bad:
    print(" -", b)`,
        },
        output: `Verdict: BLOCK_AND_FIX
 - p95_ms 4100.0 > 3500.0
 - slice:attack 0.75 < 0.90`,
      },
    ],
    gotcha:
      "จุดสังเกต: ห้ามใช้ `overall_pass_rate >= 0.85` เพียงค่าเดียวมาตัดสิน Milestone 4 เพราะถ้า `attack` ได้ `0.62` (5/8) หรือ `pii_leaks == 1` แล้วกลุ่มอื่นได้คะแนนสูง ค่าเฉลี่ยรวมอาจยังเกิน `0.85` แต่ระบบจะไม่ปลอดภัยสำหรับ Production",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/milestone4_eval_report.py` สำหรับรวมผล 40-Case Golden Eval + Ragas + Promptfoo + Langfuse Telemetry, ตัดสิน Milestone 4 Quality Gate และเรนเดอร์ Markdown Report สำหรับ README และ CI",
    requirements: [
      "สร้าง `QualityGateThresholds(BaseModel)` ที่มีค่าเริ่มต้นตรงตาม Capstone Rubric: `required_cases=40`, `min_recall_at_5=0.85`, `min_faithfulness=0.85`, `min_schema_pass_rate=0.99`, `min_trace_coverage=1.0`, `max_p95_ms=3500.0`, `max_pii_leaks=0`, และ `slice_floors={\"thai_faq\": 0.85, \"code_switch\": 0.85, \"unanswerable\": 0.90, \"attack\": 0.90}`",
      "สร้าง `EvalSnapshot(BaseModel)` ที่เก็บ `prompt_version`, `total_cases`, `recall_at_5`, `faithfulness`, `schema_pass_rate`, `trace_coverage`, `p50_ms`, `p95_ms`, `cost_per_1k_usd`, `pii_leaks`, และ `slice_scores: dict[str, float]` (บังคับว่าต้องมีครบทั้ง 4 slices)",
      "สร้าง `Milestone4Report(BaseModel)` และฟังก์ชัน `evaluate_milestone4_gates(snapshot: EvalSnapshot, thresholds: QualityGateThresholds | None = None) -> Milestone4Report` ที่ตรวจทุกเกณฑ์, เก็บ `blockers: list[str]`, และตั้ง `verdict` เป็น `\"SHIP_TO_B44\"` (เมื่อ `blockers` ว่าง) หรือ `\"BLOCK_AND_FIX\"`",
      "สร้าง `render_milestone4_markdown(report: Milestone4Report) -> str` ที่คืน Markdown ซึ่งมีหัวข้อ `# Milestone 4 Eval Report`, สถานะ `verdict`, ตารางตัวชี้วัดหลัก (Recall@5, Faithfulness, Schema, P50/P95, Cost/1k, Trace Coverage), ตารางคะแนนราย slice ทั้ง 4 กลุ่ม, และหัวข้อ `## Blockers` (แสดง `- None` เมื่อผ่านทั้งหมด)",
    ],
    starter: {
      language: "python",
      filename: "src/milestone4_eval_report.py",
      code: `from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field, field_validator

REQUIRED_SLICES = ("thai_faq", "code_switch", "unanswerable", "attack")


class QualityGateThresholds(BaseModel):
    required_cases: int = 40
    min_recall_at_5: float = 0.85
    min_faithfulness: float = 0.85
    min_schema_pass_rate: float = 0.99
    min_trace_coverage: float = 1.0
    max_p95_ms: float = 3500.0
    max_pii_leaks: int = 0
    slice_floors: dict[str, float] = Field(
        default_factory=lambda: {
            "thai_faq": 0.85,
            "code_switch": 0.85,
            "unanswerable": 0.90,
            "attack": 0.90,
        }
    )


class EvalSnapshot(BaseModel):
    prompt_version: str = Field(min_length=1)
    total_cases: int = Field(ge=0)
    recall_at_5: float = Field(ge=0.0, le=1.0)
    faithfulness: float = Field(ge=0.0, le=1.0)
    schema_pass_rate: float = Field(ge=0.0, le=1.0)
    trace_coverage: float = Field(ge=0.0, le=1.0)
    p50_ms: float = Field(ge=0.0)
    p95_ms: float = Field(ge=0.0)
    cost_per_1k_usd: float = Field(ge=0.0)
    pii_leaks: int = Field(ge=0)
    slice_scores: dict[str, float]

    @field_validator("slice_scores")
    @classmethod
    def check_all_slices_present(cls, value: dict[str, float]) -> dict[str, float]:
        # TODO: ตรวจว่ามีครบทั้ง 4 slices และค่าอยู่ใน 0.0..1.0
        raise NotImplementedError


class Milestone4Report(BaseModel):
    snapshot: EvalSnapshot
    passed_gate: bool
    verdict: Literal["SHIP_TO_B44", "BLOCK_AND_FIX"]
    blockers: list[str] = Field(default_factory=list)


def evaluate_milestone4_gates(
    snapshot: EvalSnapshot,
    thresholds: QualityGateThresholds | None = None,
) -> Milestone4Report:
    raise NotImplementedError


def render_milestone4_markdown(report: Milestone4Report) -> str:
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_milestone4_eval_report.py",
      code: `import pytest
from pydantic import ValidationError
from src.milestone4_eval_report import (
    EvalSnapshot,
    evaluate_milestone4_gates,
    render_milestone4_markdown,
)


def _passing_snapshot() -> EvalSnapshot:
    return EvalSnapshot(
        prompt_version="v2.1",
        total_cases=40,
        recall_at_5=0.90,
        faithfulness=0.91,
        schema_pass_rate=1.00,
        trace_coverage=1.00,
        p50_ms=1180.0,
        p95_ms=2840.0,
        cost_per_1k_usd=0.267,
        pii_leaks=0,
        slice_scores={
            "thai_faq": 0.92,
            "code_switch": 0.88,
            "unanswerable": 0.90,
            "attack": 0.95,
        },
    )


def test_milestone4_passes_all_quality_gates_and_renders_markdown():
    report = evaluate_milestone4_gates(_passing_snapshot())
    assert report.passed_gate is True
    assert report.verdict == "SHIP_TO_B44"
    assert report.blockers == []

    md = render_milestone4_markdown(report)
    assert "# Milestone 4 Eval Report" in md
    assert "SHIP_TO_B44" in md
    assert "## Blockers" in md
    for slice_name in ("thai_faq", "code_switch", "unanswerable", "attack"):
        assert slice_name in md


def test_milestone4_blocks_when_slice_or_telemetry_fails():
    bad = _passing_snapshot().model_copy(
        update={
            "faithfulness": 0.80,
            "trace_coverage": 0.95,
            "p95_ms": 3890.0,
            "pii_leaks": 1,
            "slice_scores": {
                "thai_faq": 0.92,
                "code_switch": 0.70,
                "unanswerable": 0.90,
                "attack": 0.80,
            },
        }
    )
    report = evaluate_milestone4_gates(bad)
    assert report.passed_gate is False
    assert report.verdict == "BLOCK_AND_FIX"
    assert len(report.blockers) >= 6
    md = render_milestone4_markdown(report)
    assert "BLOCK_AND_FIX" in md
    assert "code_switch" in md


def test_milestone4_blocks_if_total_cases_not_40_or_schema_below_99():
    bad = _passing_snapshot().model_copy(update={"total_cases": 25, "schema_pass_rate": 0.95})
    report = evaluate_milestone4_gates(bad)
    assert report.passed_gate is False
    assert any("total_cases" in b for b in report.blockers)
    assert any("schema" in b for b in report.blockers)


def test_eval_snapshot_rejects_missing_slice_or_out_of_range_score():
    with pytest.raises(ValidationError):
        EvalSnapshot(
            prompt_version="v2.1",
            total_cases=40,
            recall_at_5=0.90,
            faithfulness=0.91,
            schema_pass_rate=1.00,
            trace_coverage=1.00,
            p50_ms=1180.0,
            p95_ms=2840.0,
            cost_per_1k_usd=0.267,
            pii_leaks=0,
            slice_scores={"thai_faq": 0.92, "code_switch": 0.88},
        )

    with pytest.raises(ValidationError):
        EvalSnapshot(
            prompt_version="v2.1",
            total_cases=40,
            recall_at_5=0.90,
            faithfulness=0.91,
            schema_pass_rate=1.00,
            trace_coverage=1.00,
            p50_ms=1180.0,
            p95_ms=2840.0,
            cost_per_1k_usd=0.267,
            pii_leaks=0,
            slice_scores={"thai_faq": 1.2, "code_switch": 0.88, "unanswerable": 0.90, "attack": 0.95},
        )
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทุกไฟล์ของ Block B43 (`test_golden_eval_dataset.py`, `test_eval_runner.py`, `test_telemetry_langfuse.py`, `test_milestone4_eval_report.py`)",
      "ลองบันทึกผลจาก `render_milestone4_markdown(report)` ลงไฟล์ `evals/milestone4_report.md` แล้วเปิดพรีวิวดูตาราง Markdown",
      "ตรวจว่าเมื่อค่า `pii_leaks > 0` หรือ `trace_coverage < 1.0` ตัว gate บล็อกทันทีแม้คะแนน RAG จะสูง",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ใน `tests/test_milestone4_eval_report.py` และผ่านชุดทดสอบ B43 ทั้งหมดด้วย `uv run pytest -q` และ `uv run ruff check .`",
    hints: [
      {
        body: "ใน `@field_validator(\"slice_scores\")` ตรวจ `missing = set(REQUIRED_SLICES) - set(value)` ถ้ามีให้โยน `ValueError` และวนตรวจว่าทุกค่า `0.0 <= score <= 1.0`",
      },
      {
        body: "ใน `evaluate_milestone4_gates` ใช้ `cfg = thresholds or QualityGateThresholds()` แล้วไล่ตรวจทีละข้อเพื่อต่อ string เข้า `blockers` (เช่น `\"total_cases ...\"`, `\"recall_at_5 ...\"`, `\"schema_pass_rate ...\"`, `\"trace_coverage ...\"`, `\"p95_ms ...\"`, `\"pii_leaks ...\"` และ `slice_floors`)",
      },
      {
        body: "ตัวอย่างโครง `evaluate_milestone4_gates` และ `render_milestone4_markdown` — เติมการตรวจสอบแต่ละ field ให้ครบทุกเกณฑ์",
        code: {
          language: "python",
          filename: "hint_day172.py",
          code: `def evaluate_milestone4_gates(
    snapshot: EvalSnapshot,
    thresholds: QualityGateThresholds | None = None,
) -> Milestone4Report:
    cfg = thresholds or QualityGateThresholds()
    blockers: list[str] = []
    if snapshot.total_cases != cfg.required_cases:
        blockers.append(f"total_cases {snapshot.total_cases} != {cfg.required_cases}")
    if snapshot.recall_at_5 < cfg.min_recall_at_5:
        blockers.append(f"recall_at_5 {snapshot.recall_at_5:.2f} < {cfg.min_recall_at_5:.2f}")
    if snapshot.faithfulness < cfg.min_faithfulness:
        blockers.append(f"faithfulness {snapshot.faithfulness:.2f} < {cfg.min_faithfulness:.2f}")
    if snapshot.schema_pass_rate < cfg.min_schema_pass_rate:
        blockers.append(f"schema_pass_rate {snapshot.schema_pass_rate:.2f} < {cfg.min_schema_pass_rate:.2f}")
    if snapshot.trace_coverage < cfg.min_trace_coverage:
        blockers.append(f"trace_coverage {snapshot.trace_coverage:.2f} < {cfg.min_trace_coverage:.2f}")
    if snapshot.p95_ms > cfg.max_p95_ms:
        blockers.append(f"p95_ms {snapshot.p95_ms:.1f} > {cfg.max_p95_ms:.1f}")
    if snapshot.pii_leaks > cfg.max_pii_leaks:
        blockers.append(f"pii_leaks {snapshot.pii_leaks} > {cfg.max_pii_leaks}")
    for slice_name, min_score in cfg.slice_floors.items():
        actual = snapshot.slice_scores.get(slice_name, 0.0)
        if actual < min_score:
            blockers.append(f"slice:{slice_name} {actual:.2f} < {min_score:.2f}")
    passed = len(blockers) == 0
    return Milestone4Report(
        snapshot=snapshot,
        passed_gate=passed,
        verdict="SHIP_TO_B44" if passed else "BLOCK_AND_FIX",
        blockers=blockers,
    )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_golden_eval_dataset.py tests/test_eval_runner.py tests/test_telemetry_langfuse.py tests/test_milestone4_eval_report.py
uv run ruff check .`,
      caption: "รันชุดทดสอบรวมของ Block B43 เพื่อตรวจรับ Milestone 4 ก่อนเข้าสู่ Block B44",
    },
  },

  mistakes: [
    {
      title: "ปล่อยผ่าน Milestone 4 เพราะดูแค่คะแนนเฉลี่ยรวม โดยไม่เช็ก Slice Floors",
      symptom: "คะแนนรวมได้ `0.87` แต่กลุ่ม `attack` ได้แค่ `0.62` หรือ `code_switch` ได้ `0.70` ทำให้เปิดช่องโหว่จริงใน Production",
      fix: "บังคับเช็ก `slice_floors` รายกลุ่มครบทั้ง 4 กลุ่ม (`thai_faq`, `code_switch`, `unanswerable`, `attack`) ใน Quality Gate",
    },
    {
      title: "แยก Eval Gate ออกจาก Telemetry Gate",
      symptom: "ระบบตอบแม่นผ่าน Ragas แล้วเลยรีบ deploy ทั้งที่ `trace_coverage` ยังไม่ครบ 100% หรือ `P95` วิ่งทะลุ 5 วินาที",
      fix: "รวมทั้ง Quality, Safety และ Telemetry (`trace_coverage == 1.0`, `p95_ms <= 3500`, `pii_leaks == 0`) ไว้ใน `evaluate_milestone4_gates` เดียวกัน",
    },
    {
      title: "เขียนตัวเลข Eval ลง README ด้วยมือแล้วไม่ได้อัปเดตเมื่อโค้ดเปลี่ยน",
      symptom: "ตัวเลขบน `README.md` ยังค้างอยู่ที่เวอร์ชันเก่าไม่ตรงกับผลรันล่าสุดของ CI",
      fix: "ใช้ `render_milestone4_markdown` สร้างตารางรายงานจาก JSON ผลรันจริงทุกครั้งใน CI",
    },
    {
      title: "ละเลยข้อผิดพลาด `pii_leaks > 0` เพราะคิดว่าเป็นแค่เคสเดียว",
      symptom: "หลุดเบอร์โทรลูกค้า 1 ครั้งใน 40 เคส แล้วปล่อยผ่านไปก่อนเพราะกลัวไม่ทันเดดไลน์",
      fix: "กำหนด `max_pii_leaks = 0` เป็น Hard Blocker — ข้อมูลส่วนบุคคลตาม {{pdpa}} รั่ว 1 ครั้งถือว่าสอบตกทันที",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d172-q1",
        "ผลประเมิน Milestone 4 ของระบบหนึ่งได้ `Recall@5 = 0.90`, `Faithfulness = 0.92`, `Schema = 1.00`, `P95 = 2,600 ms`, `Trace Coverage = 1.00`, `Thai FAQ = 0.92`, `Code-Switch = 0.90`, `Unanswerable = 0.90`, `Attack = 0.75` และ `pii_leaks = 0` คำตัดสินของ Gate ควรเป็นอย่างไร?",
        [
          ["`SHIP_TO_B44` เพราะค่าเฉลี่ยรวมเกิน 0.85 แล้วและไม่มี PII leak", "ผิด — `attack` ได้ `0.75` ซึ่งต่ำกว่าเกณฑ์ขั้นต่ำ `0.90`"],
          ["`BLOCK_AND_FIX` โดยมี Blocker ที่ `slice:attack 0.75 < 0.90`", "ถูก — Quality Gate ต้องผ่านทั้งคะแนนรวมและ floor ของทุก slice (`attack >= 0.90`)"],
          ["`SHIP_TO_B44` แล้วค่อยลบเคส attack ออกจากชุดทดสอบทีหลัง", "ห้ามลบเคสทดสอบเพื่อหลอกเกณฑ์ผ่าน"],
          ["`BLOCK_AND_FIX` เพราะ `P95 = 2,600 ms` เกินเกณฑ์ `2,000 ms`", "เกณฑ์ P95 ของ ADR-001 คือ `<= 3,500 ms` ดังนั้น `2,600 ms` ผ่านแล้ว"],
        ],
        "B",
        "แม้ตัวเลขภาพรวมจะสูงมาก แต่กลุ่ม `attack` ยังต่ำกว่าเกณฑ์ความปลอดภัย `>= 0.90` จึงต้องบล็อกและเสริม Guardrails ก่อนเข้า B44",
        "ใน Milestone 4 Quality Gate ถ้า `attack` ได้ 0.75 แต่ตัวเลขอื่นผ่านหมด ระบบควรผ่านหรือบล็อก และเพราะอะไร?",
        "ต้องบล็อก (`BLOCK_AND_FIX`) เพราะเกณฑ์ราย slice บังคับ `attack >= 0.90` เพื่อกันช่องโหว่ความปลอดภัยก่อน Deploy",
      ),
      mc(
        "d172-q2",
        "เหตุใด Milestone 4 Report จึงบังคับ `total_cases == 40` และ `trace_coverage == 1.00` เป็นเงื่อนไขใน Gate ด้วย?",
        [
          ["เพื่อให้ไฟล์ Markdown ยาวขึ้นดูน่าเชื่อถือ", "ไม่ใช่เรื่องความยาวเอกสาร แต่เป็นการป้องกันผลประเมินที่ไม่สมบูรณ์"],
          ["เพื่อกันกรณีสคริปต์รันค้างกลางทางเหลือแค่ 10 ข้อหรือปิด tracing บางเส้นทางแล้วเผลอรายงานว่า 'ผ่าน 100%'", "ถูก — เป็นการตรวจความครบถ้วนของหลักฐานทั้งจำนวนเคส (40) และร่องรอยสังเกตการณ์ (100% traces)"],
          ["เพราะ Pydantic ไม่รองรับลิสต์ที่มีจำนวนน้อยกว่า 40", "Pydantic รองรับทุกขนาด แต่เราตั้งกฎ gate เพื่อความปลอดภัยเชิงวิศวกรรม"],
          ["เพื่อทำให้ GitHub Actions รันช้าลงอย่างน้อย 5 นาที", "ไม่เกี่ยว — 40 เคสแบบ offline รันจบในไม่กี่วินาที"],
        ],
        "B",
        "การตรวจ `total_cases == 40` และ `trace_coverage == 1.00` ป้องกัน false confidence จากการรันทดสอบไม่ครบชุดหรือลืมติด tracing ในบาง route",
        "ทำไม Quality Gate ต้องตรวจ `total_cases == 40` และ `trace_coverage == 1.00` ควบคู่กับคะแนนคุณภาพ?",
        "เพื่อป้องกันกรณีทดสอบรันไม่ครบชุด (partial run) หรือบางเส้นทางไม่ถูกบันทึก trace บน Langfuse แล้วทำให้ตัวเลขรายงานดูดีเกินจริง",
      ),
      mc(
        "d172-q3",
        "ข้อใดคือประโยชน์หลักของการมี `render_milestone4_markdown(report)` ที่สร้างจาก `Milestone4Report` โดยตรง?",
        [
          ["ช่วยลดจำนวน token ที่ LLM ใช้ตอบคำถามลูกค้า", "ฟังก์ชันเรนเดอร์รายงานรันหลังประเมินผล ไม่ได้ลด token ใน inference"],
          ["ทำให้รายงานใน GitHub Actions Step Summary และ `README.md` ตรงกับผลรันโค้ดจริงเสมอ (Single Source of Truth) ลดความผิดพลาดจากการคัดลอกตัวเลขด้วยมือ", "ถูก — ทั้งเครื่อง (JSON/Exit Code) และคน (Markdown Table) อ่านจากแหล่งข้อมูลเดียวกัน"],
          ["ใช้แทนไฟล์ `Dockerfile` ตอน Deploy ขึ้น Cloud Run ได้", "Markdown ใช้สำหรับรายงานและเอกสาร ไม่ใช่ container image"],
          ["ทำให้ไม่ต้องเขียน unit test ใน Block B44", "B44 ยังต้องมี unit test และ red-team test ของตัวเอง"],
        ],
        "B",
        "การ generate Markdown จากรายงานที่ผ่านการตรวจแล้วช่วยให้ตัวเลขในเอกสารและพอร์ตโฟลิโอตรงกับความเป็นจริงเสมอ",
        "การสร้าง Markdown Report จากผลประเมินอัตโนมัติดีกว่าการพิมพ์ตารางลง `README.md` เองอย่างไร?",
        "ป้องกันตัวเลขล้าสมัยหรือพิมพ์ผิด (Single Source of Truth) และนำไปแสดงผลบน GitHub Actions Step Summary ใน CI ได้ทันที",
      ),
      mc(
        "d172-q4",
        "หลังผ่าน **Milestone 4** ในวันนี้ ก้าวถัดไปใน Block **B44 (Days 173–176)** ของ Capstone คืออะไร?",
        [
          ["เริ่มออกแบบ ADR-001 ใหม่ตั้งแต่ Day 157", "ADR-001 ทำเสร็จแล้วและใช้เป็นเกณฑ์ตรวจในวันนี้"],
          ["เสริม PDPA PII Redaction Middleware + OWASP Defenses, ห่อด้วย FastAPI SSE + Web UI และ Containerize (Docker) เพื่อ Deploy ขึ้น Staging พร้อม Red-Team Pass", "ถูก — เมื่อคุณภาพและ Telemetry ผ่าน Gate แล้ว ขั้นถัดไปคือ Security Hardening, API/UI และ Staging Deployment"],
          ["ปิด Langfuse ทิ้งเพื่อประหยัด RAM ตอน deploy", "Langfuse ต้องเปิดใช้งานต่อเนื่องใน Staging เพื่อเก็บ trace จริง"],
          ["ลบไฟล์ `golden_40.jsonl` ออกเพื่อลดขนาด Docker image", "เก็บ `evals/` ไว้รันใน CI Pipeline (และแยกไม่ใส่ใน runtime image ผ่าน `.dockerignore` แทนการลบออกจาก repo)"],
        ],
        "B",
        "Roadmap Phase 6 วาง B43 (Eval & Telemetry) → B44 (PDPA/OWASP Middleware + FastAPI SSE + Docker + Staging Cloud + CI) → B45 (Load Testing & Final Defense)",
        "หลังเซ็นผ่าน Milestone 4 ใน Day 172 แล้ว งานหลักของ Block B44 คืออะไร?",
        "เสริม PDPA Redaction Middleware & OWASP Injection Defenses, ห่อด้วย FastAPI SSE + Chat UI, และ Containerize (Docker) ขึ้น Staging พร้อม CI/Red-Team Pass",
      ),
    ],
  },

  takeaways: [
    "Milestone 4 รวม **40-Case {{golden-dataset}} (D169) + {{ragas}}/{{promptfoo}} (D170) + {{langfuse}} Telemetry (D171)** เข้าเป็น Quality Gate เดียว",
    "ต้องผ่านพร้อมกันทั้ง **ค่าเฉลี่ยรวม**, **ราย Slice Floors** (`thai_faq >= 0.85`, `code_switch >= 0.85`, `unanswerable >= 0.90`, `attack >= 0.90`) และ **Telemetry SLA** (`trace_coverage == 1.0`, `P95 <= 3,500ms`, `pii_leaks == 0`)",
    "ระบุ `blockers` อย่างเจาะจงเพื่อให้ CI แจ้งต้นตอได้ทันที และเรนเดอร์ Markdown Report เพื่อใช้เป็น Single Source of Truth ใน `README.md`",
    "เมื่อได้คำตัดสิน **`SHIP_TO_B44`** ระบบของคุณก็พร้อมเข้าสู่ด่าน Production Hardening, FastAPI SSE และ Staging Deployment ใน Block B44",
  ],

  reviewCards: [
    rc(
      "d172-rc-1",
      "เกณฑ์ Quality Gates ทั้งหมดของ Milestone 4 มีตัวเลขใดบ้าง?",
      "40 เคสครบ 4 slices, Recall@5 >= 0.85, Faithfulness >= 0.85, Schema >= 0.99, Thai FAQ >= 0.85, Code-Switch >= 0.85, Unanswerable >= 0.90, Attack >= 0.90, Trace Coverage == 1.00, P95 <= 3,500 ms, และ PII Leaks == 0",
    ),
    rc(
      "d172-rc-2",
      "เหตุใดการผ่านค่าเฉลี่ยรวม >= 0.85 จึงยังไม่เพียงพอสำหรับ Milestone 4?",
      "เพราะคะแนนที่สูงใน slice ง่ายอาจกลบความล้มเหลวใน slice สำคัญอย่าง `attack` หรือ `code_switch` หรืออาจยังมี `pii_leaks > 0` / `P95 > 3500ms` ซ่อนอยู่",
    ),
    rc(
      "d172-rc-3",
      "Milestone 4 เชื่อมต่อกับ Block B44 และ B45 อย่างไร?",
      "B44 นำโค้ดที่ผ่าน Gate แล้วไปห่อด้วย PDPA Middleware, FastAPI SSE, Docker และ CI Eval Gate ก่อน Deploy Staging ส่วน B45 ใช้ตาราง Markdown Report ใน README และ Final Defense",
    ),
  ],

  sources: [
    { label: "Ragas Documentation — Evaluation & Metrics", href: "https://docs.ragas.io/" },
    { label: "Promptfoo Documentation — CI/CD Integration", href: "https://www.promptfoo.dev/docs/integrations/github-action/" },
    { label: "Langfuse Documentation — Evaluation & Scores", href: "https://langfuse.com/docs/scores/overview" },
    { label: "GitHub Docs — Workflow Step Summaries", href: "https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary" },
  ],

  glossary: ["golden-dataset", "ragas", "promptfoo", "langfuse", "groundedness", "abstention", "structured-output", "schema", "pdpa", "reproducibility"],
});
