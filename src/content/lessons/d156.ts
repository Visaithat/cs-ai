import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D156 — Phase 5 / Block B39 (Checkpoint Day)
 * Phase 5 Checkpoint: Production-Readiness Audit (v0.5.0)
 */
export const d156: Lesson = defineLesson({
  day: 156,
  titleTh: "Checkpoint Phase 5: ตรวจรับความพร้อม Production (Readiness Audit) และปิด Milestone v0.5.0",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% · ปิด Milestone v0.5.0 ด้วยการตรวจรับ 7 มิติ: Eval Gate, P95 Latency, งบต่อผู้ใช้/เดือน, Zero PII Leaks, Injection Block Rate, /healthz+/readyz และ Runbook ครบชุด",
  icon: "award",
  visual: {
    id: "phase5-prod-arch",
    title: "Phase 5 Production-Readiness Gate (v0.5.0) ก่อนก้าวสู่ Phase 6 Capstone",
    caption:
      "สรุปเกณฑ์ตรวจรับระบบ Production ทั้ง 7 มิติ: Eval Gate, P95 Latency, Cost/User/Month, Zero PII Leaks, Injection Block Rate, Health/Readiness Probes และ Incident Runbooks",
    alt: "แผนภาพ Phase 5 Production-Readiness Gate ตรวจรับระบบ AI Microservice ครบ 7 มิติก่อนติดแท็ก v0.5.0",
  },
  requiresApiKey: false,
  apiKeyNote:
    "รันบนเครื่องคุณได้ 100% — สร้าง Phase 5 Production-Readiness Auditor & Markdown Report ทดสอบด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "pytest", "Git Tag v0.5.0"],

  bigPicture: [
    {
      node: 0,
      heading: "ยินดีด้วย! คุณมาถึงวัน Checkpoint ปิดท้าย Phase 5 (ครบ 156 วัน — พร้อมขึ้น Phase 6 Capstone)",
      body: "ตลอด 32 วันของ Phase 5 (Blocks B32–B39, Days 125–155) คุณได้ยกระดับระบบ Thai Hybrid {{rag}} + Agent จาก `v0.4.0` ให้กลายเป็น **Evaluated, Observable, Containerized & Guarded AI Microservice** วันนี้เราจะตรวจรับครบทั้ง **7 Production Gates** เพื่อติดแท็กพอร์ตโฟลิโอชิ้นที่ 5 (`v0.5.0`)",
      lessonNote:
        "เหมือนที่เราปิด `v0.4.0` ด้วย 5 Quality Gates ใน Day 124 วันนี้เราสร้าง `phase5_checkpoint.py` เพื่อพิสูจน์ความพร้อมขึ้น Production ด้วยตัวเลขที่ทำซ้ำได้",
    },
    {
      node: 3,
      heading: "มิติที่ 1–3 (Evals, Latency & Cost): Eval Gate, P95 Latency และงบต่อผู้ใช้ต่อเดือน",
      body: "ตรวจผลรัน {{promptfoo}} + {{ragas}} CI Eval Gate (`eval_pass_rate >= 0.95`), คำนวณ **P95 Latency** จากหน้าต่างโหลดทดสอบ (`p95_latency_ms <= 2500 ms`) และตรวจงบประมาณต่อผู้ใช้ต่อเดือนจากสูตร Day 147 (`cost_per_user_month_thb <= 12.00 THB`)",
      lessonNote:
        "ทุกเกณฑ์เป็นสัญญาเชิงตัวเลขที่ปฏิเสธชุดข้อมูลว่าง (`raise ValueError`) เพื่อป้องกัน Vacuous Pass",
    },
    {
      node: 4,
      heading: "มิติที่ 4–5 (AI Security & PDPA): Zero PII Leaks และ Injection Block Rate >= 0.90",
      body: "ยืนยันว่าไม่มีข้อมูลส่วนบุคคล {{pdpa}} รั่วไหลในทั้ง input ที่ส่งออก, API response และ {{langfuse}} trace (`pii_leaks == 0`) ควบคู่กับอัตราการบล็อกการโจมตี {{prompt-injection}} จากชุด Red-Team / {{promptfoo}} (`injection_block_rate >= 0.90`)",
      lessonNote:
        "เกณฑ์ `pii_leaks == 0` เป็น Zero-Tolerance — หากรั่วแม้แต่ 1 เคสจะตีตก `v0.5.0` ทันที",
    },
    {
      node: 5,
      heading: "มิติที่ 6–7 (Operations) & สะพานเชื่อมสู่ Phase 6 Production Capstone (Day 157 ADR)",
      body: "ยืนยันว่าบริการ {{fastapi}} ใน {{dockerfile}} มีทั้ง `/healthz` และ `/readyz` ผ่านครบ (Day 143) และมี Incident Runbook ครบทั้ง 3 เล่มจาก Day 155 (`provider_outage`, `cost_spike`, `prompt_injection`) — เมื่อผ่านครบ 7 มิติ พรุ่งนี้ (Day 157) เราจะเปิดบท **Phase 6 Capstone** ด้วยการเขียน 1-Page {{adr}} (`ADR-001`)!",
      lessonNote:
        "รายงาน Markdown จาก `phase5_checkpoint.py` พร้อมแปะใน `README.md` ของแท็ก `v0.5.0` และใช้ตั้งเกณฑ์ SLA ใน Day 157 ต่อทันที",
    },
  ],

  objectives: [
    "**คำนวณและตรวจสอบเกณฑ์ Production-Readiness ทั้ง 7 มิติของ `v0.5.0`** ได้แก่ Eval Gate Pass Rate (`>= 0.95`), P95 Latency (`<= 2500 ms`), Cost/User/Month (`<= 12.00 THB`), Zero PII Leaks (`== 0`), Injection Block Rate (`>= 0.90`), Health/Readiness Probes (`/healthz` + `/readyz`) และ Runbook ครบ 3 สถานการณ์",
    "**สร้าง `evaluate_phase5_readiness` และ `render_readiness_report`** ที่ปฏิเสธข้อมูลวัดผลที่ว่างเปล่า (`raise ValueError`), รายงาน `passed_gates` / `failed_gates` แยกรายมิติ และอนุมัติ `ready_for_v0_5_0 = True` เฉพาะเมื่อผ่านครบ 100% (Fail-Closed)",
    "**ทบทวนความรู้รวมทั้ง Phase 5 (B32–B39, Days 125–155)** และเชื่อมเกณฑ์ Production-Readiness เข้าสู่การออกแบบ {{adr}} ของ **Phase 6 Production Capstone (Day 157)**",
  ],

  prerequisites: [
    "ผ่าน Day 125–155 (ครบทั้ง 8 บล็อกของ Phase 5: B32–B39)",
    "มีผลลัพธ์จาก `guarded_api.py` (D153), `promptfooconfig.yaml` (D154) และ `incident_router.py` + Runbooks (D155)",
    "ไม่ต้องใช้ API key — รันสคริปต์ตรวจรับ Checkpoint และชุดทดสอบบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "เปิดโปรเจกต์ Phase 5 ของคุณ (หรือสร้างโฟลเดอร์ `ai-day156` สำหรับแบบฝึกหัดตรวจรับวันนี้) เพื่อรัน Production-Readiness Audit ครบ 7 มิติก่อนติดแท็ก `v0.5.0`",
    commands: `uv init ai-day156 && cd ai-day156
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "เตรียมโปรเจกต์ `ai-day156` และติดตั้ง `pydantic`, `pytest`, `ruff`"],
      ["audit", "เขียน `phase5_checkpoint.py` และ `test_phase5_checkpoint.py` ตรวจรับครบ 7 มิติ"],
      ["tag", "รัน `uv run pytest -v` และ `uv run ruff check .` ให้ผ่าน 100% แล้วติดแท็ก `git tag -a v0.5.0`"],
    ],
    note: "จังหวะเวลา 30 นาทีของวัน Checkpoint: ทำ Cumulative Quiz Phase 5 (10 นาที) → เขียนสคริปต์ Readiness Auditor 7 มิติ + สร้างรายงาน Markdown (15 นาที) → ติดแท็ก `v0.5.0` และเตรียมตัวเข้า Day 157 Capstone ADR (5 นาที)",
  },

  concepts: [
    {
      id: "seven-gates-of-phase5-readiness",
      title: "1 · 7 Production-Readiness Gates ของ Portfolio Milestone ชิ้นที่ 5 (v0.5.0)",
      paragraphs: [
        "ก่อนที่เราจะติดแท็ก `git tag -a v0.5.0 -m \"Phase 5: Production AI Ops, Evals & Security\"` ระบบ AI Microservice ของเราต้องผ่านเกณฑ์วิศวกรรมครบทั้ง **7 มิติ** แบบ Fail-Closed (ตกแม้แต่มิติเดียวห้ามปล่อยผ่าน):",
        "1. **`eval_gate` (`eval_pass_rate >= 0.95`)**: สัดส่วนเคสที่ผ่านจากชุด {{golden-dataset}} + {{ragas}} + {{promptfoo}} CI Suite (คำนวณจาก `passed_cases / total_cases`, ปฏิเสธเมื่อ `total_cases <= 0`)\n2. **`p95_latency_gate` (`p95_latency_ms <= 2500.0`)**: คำนวณค่า P95 แบบ nearest-rank จาก `request_latencies_ms` ในการทดสอบโหลด ({{fastapi}} SSE / `/query`)\n3. **`cost_budget_gate` (`cost_per_user_month_thb <= 12.00`)**: ตรวจต้นทุนต่อผู้ใช้ต่อเดือนจากสูตร Capacity & Cost ของ Day 147 (`monthly_cost_thb / active_users`)\n4. **`zero_pii_leak_gate` (`pii_leaks == 0`)**: ตรวจ Zero-Tolerance ว่าไม่มีเลขบัตรประชาชน เบอร์โทร หรือ canary รั่วในทั้ง LLM outbound input, API response และ {{langfuse}} trace (Day 151, 153, 154)\n5. **`injection_block_gate` (`injection_block_rate >= 0.90`)**: อัตราการสกัดกั้นการโจมตี {{prompt-injection}} จากชุด Red-Team ภาษาไทย/อังกฤษ (`blocked_attacks / total_attacks >= 0.90`, ตรงตาม Capstone Rubric)\n6. **`health_probes_gate` (`healthz_ok and readyz_ok`)**: ยืนยันว่า Liveness (`/healthz`) และ Readiness (`/readyz`) ในคอนเทนเนอร์ {{dockerfile}} ทำงานแยกกันถูกต้องตาม Day 143\n7. **`incident_runbook_gate` (ครบ 3 Runbook)**: ยืนยันว่ามี Runbook ครบชุด `{\"provider_outage\", \"cost_spike\", \"prompt_injection\"}` จาก Day 155 พร้อมใช้งานจริง",
      ],
      analogy:
        "เหมือนการตรวจความพร้อมก่อนนำเครื่องบินขึ้นบินเชิงพาณิชย์ (Pre-Flight Readiness Audit): ไม่ใช่แค่เครื่องยนต์ติด (RAG ตอบได้) แต่ต้องเช็กเกจ์วัดความเร็ว (P95), ปริมาณเชื้อเพลิง (Cost/User), ประตูนิรภัยห้องนักบิน (Zero PII & Injection Gate), ไฟสัญญาณสถานะ (`/healthz` + `/readyz`) และคู่มือฉุกเฉินในห้องนักบิน (Runbooks) ครบทุกข้อก่อนออกบิน",
      bullets: [
        "**Fail-Closed Conjunction**: `ready_for_v0_5_0 = (len(failed_gates) == 0)` เสมอ ไม่มีการถัวเฉลี่ยข้ามมิติ",
        "**Zero Vacuous Pass**: หาก `request_latencies_ms` ว่าง, `eval_total_cases <= 0`, `injection_total_attacks <= 0` หรือ `active_users <= 0` ต้องโยน `ValueError` ทันที",
        "**Evidence for Portfolio**: แปลง `Phase5ReadinessReport` เป็นตาราง Markdown พร้อมแนบใน `README.md` ของแท็ก `v0.5.0`",
      ],
      whyTitle: "Why this matters — นี่คือเช็กลิสต์ที่ทีม AI Platform ระดับองค์กรใช้ตรวจรับก่อน Go-Live จริง",
      whyParagraphs: [
        "ในการสัมภาษณ์งาน AI Engineer การโชว์ว่าคุณไม่ได้หยุดแค่ 'รันแชตบอทได้บนเครื่อง' แต่มีสคริปต์ตรวจรับ 7 มิติที่ครอบคลุมทั้ง CI Evals, Latency, Unit Economics, PDPA, Red-Teaming, Health Probes และ SRE Runbook คือหลักฐานชัดเจนว่าคุณคิดแบบวิศวกร Production แล้ว",
      ],
    },
    {
      id: "recap-phase5-b32-to-b39",
      title: "2 · ทบทวนภาพรวมทั้ง Phase 5 (Blocks B32–B39, Days 125–155)",
      paragraphs: [
        "ลองมองย้อนกลับไปดูแผนที่ 8 บล็อก (32 วัน) ที่คุณสร้างต่อยอดขึ้นมาตลอด Phase 5 เพื่อเห็นว่าแต่ละบล็อกป้อนหลักฐานเข้าสู่เกณฑ์ทั้ง 7 มิตินี้อย่างไร:",
        "- **B32 (D125–D128 · Evals Foundation)**: สร้าง {{golden-dataset}}, Deterministic Evals (`Recall@k`/`MRR`) และปรับจูน {{llm-as-a-judge}} ลดอคติ\n- **B33 (D129–D132 · Automated CI Gates)**: วัด RAG Triad ด้วย {{ragas}}, เขียนเมทริกซ์ {{promptfoo}} และผูกเป็น required check บน GitHub Actions\n- **B34 (D133–D136 · Observability)**: ติดตั้ง {{otel}} GenAI SemConv, ส่ง trace waterfall เข้า {{langfuse}} และอ่านกราฟ P50/P95, Token, Cost พร้อม Alert สองหน้าต่าง\n- **B35 (D137–D140 · Production API)**: สร้าง Async {{fastapi}} ด้วย Lifespan + DI, SSE Streaming พร้อม Timeout/{{circuit-breaker}}, Background Queue และ Load Test\n- **B36 (D141–D144 · Packaging & Cloud)**: สร้าง Multi-stage Non-root {{dockerfile}}, รัน `docker compose` local stack และขึ้น Cloud พร้อม Secrets + `/healthz` + `/readyz`\n- **B37 (D145–D148 · Inference Economics)**: เปรียบเทียบ {{vllm}} vs API, ลดต้นทุน 40% ด้วย Semantic Cache + Model Tiering และคำนวณงบต่อผู้ใช้ต่อเดือน\n- **B38 (D149–D152 · AI Security & PDPA)**: ป้องกัน OWASP LLM Top 10, สร้าง {{guardrails}} + Least-Privilege Sandbox, ปิดบัง PII ตาม {{pdpa}} และทำ Red-Team\n- **B39 (D153–D156 · Integration & Ops)**: รวม Guardrails + PII + Langfuse เข้า FastAPI (D153), รัน Promptfoo Security+Quality Suite (D154), เขียน Incident Runbook 3 สถานการณ์ (D155) และปิดด้วย Readiness Audit วันนี้ (D156)!",
      ],
      analogy:
        "ถ้า Phase 4 คือการประกอบรถยนต์ต้นแบบจนวิ่งในสนามทดสอบได้ Phase 5 ทั้ง 8 บล็อกก็คือการติดตั้งเข็มขัดนิรภัย ถุงลม กล่องดำ มาตรวัดน้ำมัน ผ่านด่านตรวจสภาพรถ และเขียนคู่มือซ่อมฉุกเฉินจนพร้อมรับป้ายทะเบียนวิ่งบนถนนจริง",
      code: {
        language: "python",
        filename: "phase5_gate_formulas.py",
        code: `import math

REQUIRED_RUNBOOKS = {"provider_outage", "cost_spike", "prompt_injection"}


def compute_p95_ms(latencies_ms: list[float]) -> float:
    if not latencies_ms or any(x <= 0 for x in latencies_ms):
        raise ValueError("latencies_ms must be non-empty positive numbers")
    ordered = sorted(latencies_ms)
    idx = max(0, math.ceil(0.95 * len(ordered)) - 1)
    return round(float(ordered[idx]), 2)


def compute_rate(passed: int, total: int, label: str) -> float:
    if total <= 0 or passed < 0 or passed > total:
        raise ValueError(f"invalid counts for {label}: {passed}/{total}")
    return round(passed / total, 4)`,
        caption: "ฟังก์ชันคำนวณ P95 และอัตราส่วนที่ป้องกันการหารด้วยศูนย์และค่าเกินช่วง 0..1 ทุกกรณี",
      },
      whyTitle: "Why this matters — การตรวจจำนวนเคส (`passed <= total`) กันตัวเลขหลอกตาในรายงาน CI",
      whyParagraphs: [
        "ในโลกจริงเคยเกิดบั๊กที่สคริปต์นับเคสซ้ำจนรายงาน `eval_pass_rate = 1.12` หรือ `total = 0` แล้วคืน `1.0` การบังคับ `0 <= passed <= total` และ `total > 0` ในตัวตรวจรับช่วยให้มั่นใจว่าตัวเลขทุกช่องเชื่อถือได้จริง",
      ],
    },
    {
      id: "bridge-to-phase6-capstone",
      title: "3 · สะพานเชื่อมสู่ Phase 6 (Days 157–180): Production Capstone & Portfolio Defense",
      paragraphs: [
        "เมื่อคุณติดแท็ก `v0.5.0` สำเร็จวันนี้ คุณได้สะสมผลงานพอร์ตโฟลิโอครบ **5 ชิ้นงาน** แล้ว (`v0.1.0` Async Data CLI → `v0.2.0` Thai ML Pipeline → `v0.3.0` Typed LLM Extractor → `v0.4.0` Thai Hybrid RAG + Agent → `v0.5.0` Production AI Ops & Security)",
        "ตั้งแต่วันพรุ่งนี้ (**Day 157 — เปิดฉาก Phase 6: 24 วันสุดท้ายของหลักสูตร**) เราจะนำทุกทักษะจากทั้ง 5 Phases มาประกอบเป็น **Production Capstone Project** ชิ้นเอกในพอร์ตโฟลิโอของคุณ: **Thai/Bilingual Enterprise Knowledge & Support AI Assistant**",
        "จุดเริ่มต้นใน **Day 157** จะไม่กระโดดไปเขียนโค้ดทันที แต่เริ่มจากการทำ **Problem Framing, User Stories (3 เส้นทาง: `rag_faq`, `mcp_lookup`, `hitl_write`), Non-Goals และเขียน 1-Page {{adr}} (`ADR-001`)** ที่ล็อกสัญญา SLA (`Recall@5 >= 0.85`, `Faithfulness >= 0.85`, `Schema >= 99%`, `PDPA = 100%`, `Red-Team >= 90%`) ไว้ในโค้ด Pydantic ตั้งแต่บรรทัดแรก ก่อนเดินผ่าน 5 Milestones สู่ Final Defense ใน Day 180!",
      ],
      analogy:
        "ตลอด 5 Phases ที่ผ่านมาคุณฝึกทำอาหารแต่ละจานและคุมมาตรฐานครัวจนคล่องแล้ว Phase 6 คือการเปิดร้านอาหารของตัวเองตั้งแต่เขียนแผนธุรกิจ (`ADR-001` ใน Day 157), จัดครัว, เสิร์ฟจริงบน Cloud ไปจนถึงวันสอบชิมต่อหน้ากรรมการใน Day 180",
      bullets: [
        "**B40 (D157–D160 · Milestone 1)**: Problem Framing, User Stories, `ADR-001`, Repo Scaffold และ Thai/Bilingual Corpus",
        "**B41–B42 (D161–D168 · Milestones 2–3)**: Hybrid RAG (`Recall@5 >= 0.85`) + Grounded Citations + MCP Server + LangGraph Router",
        "**B43–B45 (D169–D180 · Milestones 4–5 & Final Defense)**: 40-Case Eval Gate, Langfuse, PDPA/OWASP Red-Team, Cloud Deploy, Load/Failure Testing และ Technical Demo",
      ],
      whyTitle: "Why this matters — ตัวเลข 7 มิติจาก `v0.5.0` วันนี้คือฐานของสัญญา SLA ใน Day 157",
      whyParagraphs: [
        "คุณไม่จำเป็นต้องเดาตัวเลข SLA ใน `ADR-001` ของพรุ่งนี้ เพราะคุณเพิ่งวัดและยืนยันเกณฑ์จริงครบทั้ง Eval, P95, Cost/User, PDPA, Red-Team และ Runbook ใน `phase5_checkpoint.py` ของวันนี้แล้ว",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Phase 5 Readiness Audit กับ Production Launch Readiness Review (LRR)",
      body: [
        "ในบริษัทเทคโนโลยีขนาดใหญ่ (เช่น Google หรือ Stripe) ก่อนเปิดบริการใหม่ขึ้น Production จะมีด่าน **Launch Readiness Review (LRR)** ซึ่ง 7 เกณฑ์ของวันนี้คือ LRR ฉบับ AI Engineering:",
      ],
      table: [
        ["`eval_gate` (`>= 0.95`) & `injection_block_gate` (`>= 0.90`)", "Automated Regression + Security/OWASP Test Gate ใน CI"],
        ["`p95_latency_gate` (`<= 2500 ms`) & `cost_budget_gate` (`<= 12 THB/user`)", "Performance SLO + Cloud FinOps Unit Cost Ceiling"],
        ["`zero_pii_leak_gate` (`pii_leaks == 0`)", "Privacy / PDPA Compliance Audit (Zero-Tolerance)"],
        ["`health_probes_gate` & `incident_runbook_gate`", "Kubernetes/Cloud Run Probes + SRE On-Call Runbook Sign-off"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมระบบที่ 'ฉลาดมาก' แต่ไม่มี `/readyz` หรือ Runbook ถึงยังไม่พร้อมขึ้น Production",
      body: [
        "ในโปรเจกต์ส่งอาจารย์ เรามักวัดแค่ว่าโมเดลตอบคำถามได้แม่นกี่เปอร์เซ็นต์ แต่เมื่อมีผู้ใช้จริงหลายพันคนใช้งานตลอด 24 ชั่วโมง ระบบต้องบอก Load Balancer ได้ว่าตัวเองพร้อมรับงานหรือยัง (`/readyz`), ต้องคุมค่า API ไม่ให้เกินงบ (`cost/user/month`), และต้องมีคู่มือแก้ปัญหาตอนตีสอง (Runbook)",
        "การตรวจรับครบ 7 มิติในวันนี้ช่วยให้คุณมองเห็นภาพเต็มของคำว่า **Production-Ready AI Engineer** ครับ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง `phase5_checkpoint.py` ที่รับหลักฐานจากการทดสอบทั้ง 7 มิติของ Phase 5 คำนวณตัวชี้วัดและตัดสินว่าพร้อมติดแท็ก `v0.5.0` (`ready_for_v0_5_0=True`) หรือไม่ พร้อมเรนเดอร์รายงาน Markdown",
    steps: [
      {
        title: "1 · นิยามโมเดลหลักฐานการตรวจรับ (`Phase5AuditInput`) และรายงาน (`Phase5ReadinessReport`)",
        explain:
          "รวมตัวเลขหลักฐานทั้ง 7 มิติจาก B32–B39 ไว้ในสกีมา Pydantic ที่ตรวจสอบชนิดและขอบเขตข้อมูลตั้งแต่ต้นทาง",
        code: {
          language: "python",
          filename: "worked_phase5_checkpoint.py",
          code: `import math
from pydantic import BaseModel, Field

REQUIRED_RUNBOOKS = {"provider_outage", "cost_spike", "prompt_injection"}


class Phase5AuditInput(BaseModel):
    service_name: str = Field(min_length=1)
    release_tag: str = "v0.5.0"
    eval_passed_cases: int = Field(ge=0)
    eval_total_cases: int = Field(ge=0)
    request_latencies_ms: list[float]
    monthly_cost_thb: float = Field(ge=0.0)
    active_users: int = Field(ge=0)
    pii_leaks_input: int = Field(ge=0)
    pii_leaks_output: int = Field(ge=0)
    pii_leaks_trace: int = Field(ge=0)
    injection_blocked: int = Field(ge=0)
    injection_total: int = Field(ge=0)
    healthz_ok: bool
    readyz_ok: bool
    present_runbooks: list[str] = Field(default_factory=list)


class Phase5ReadinessReport(BaseModel):
    service_name: str
    release_tag: str
    eval_pass_rate: float
    p95_latency_ms: float
    cost_per_user_month_thb: float
    total_pii_leaks: int
    injection_block_rate: float
    health_probes_ready: bool
    missing_runbooks: list[str]
    passed_gates: list[str]
    failed_gates: list[str]
    ready_for_v0_5_0: bool`,
        },
      },
      {
        title: "2 · เขียน `evaluate_phase5_readiness` ที่ตรวจครบ 7 มิติและปฏิเสธข้อมูลว่าง",
        explain:
          "ตรวจสอบเงื่อนไข Vacuous Pass ก่อนคำนวณทุกตัวชี้วัด แล้วตรวจผ่านเกณฑ์แบบ Fail-Closed (`len(failed_gates) == 0`)",
        code: {
          language: "python",
          filename: "worked_phase5_checkpoint.py",
          code: `def evaluate_phase5_readiness(
    audit: Phase5AuditInput,
    min_eval_pass_rate: float = 0.95,
    latency_budget_ms: float = 2500.0,
    max_cost_per_user_thb: float = 12.00,
    min_injection_block_rate: float = 0.90,
) -> Phase5ReadinessReport:
    if audit.eval_total_cases <= 0 or audit.eval_passed_cases > audit.eval_total_cases:
        raise ValueError("eval counts must have total > 0 and passed <= total")
    if not audit.request_latencies_ms or any(x <= 0 for x in audit.request_latencies_ms):
        raise ValueError("request_latencies_ms must be non-empty positive numbers")
    if audit.active_users <= 0:
        raise ValueError("active_users must be > 0")
    if audit.injection_total <= 0 or audit.injection_blocked > audit.injection_total:
        raise ValueError("injection counts must have total > 0 and blocked <= total")

    eval_pass_rate = round(audit.eval_passed_cases / audit.eval_total_cases, 4)

    ordered_lat = sorted(audit.request_latencies_ms)
    p95_idx = max(0, math.ceil(0.95 * len(ordered_lat)) - 1)
    p95_ms = round(float(ordered_lat[p95_idx]), 2)

    cost_per_user = round(audit.monthly_cost_thb / audit.active_users, 2)
    total_pii_leaks = audit.pii_leaks_input + audit.pii_leaks_output + audit.pii_leaks_trace
    injection_block_rate = round(audit.injection_blocked / audit.injection_total, 4)
    probes_ok = audit.healthz_ok and audit.readyz_ok
    missing_runbooks = sorted(REQUIRED_RUNBOOKS - set(audit.present_runbooks))

    checks = [
        ("eval_gate", eval_pass_rate >= min_eval_pass_rate),
        ("p95_latency_gate", p95_ms <= latency_budget_ms),
        ("cost_budget_gate", cost_per_user <= max_cost_per_user_thb),
        ("zero_pii_leak_gate", total_pii_leaks == 0),
        ("injection_block_gate", injection_block_rate >= min_injection_block_rate),
        ("health_probes_gate", probes_ok),
        ("incident_runbook_gate", len(missing_runbooks) == 0),
    ]
    passed = [name for name, ok in checks if ok]
    failed = [name for name, ok in checks if not ok]

    return Phase5ReadinessReport(
        service_name=audit.service_name,
        release_tag=audit.release_tag,
        eval_pass_rate=eval_pass_rate,
        p95_latency_ms=p95_ms,
        cost_per_user_month_thb=cost_per_user,
        total_pii_leaks=total_pii_leaks,
        injection_block_rate=injection_block_rate,
        health_probes_ready=probes_ok,
        missing_runbooks=missing_runbooks,
        passed_gates=passed,
        failed_gates=failed,
        ready_for_v0_5_0=(len(failed) == 0),
    )`,
        },
      },
      {
        title: "3 · ทดสอบทั้งกรณีพร้อมติดแท็ก `v0.5.0` และกรณีที่ยังมีจุดบกพร่อง (PII รั่ว + ขาด Runbook)",
        explain:
          "ใช้ตัวเลขจริงที่ต่อเนื่องจาก Day 147 (`97,200 THB / 10,000 users = 9.72 THB/user`) และ Day 153–155 แล้วเทียบกับกรณีที่มี PII รั่วใน trace และขาด Runbook",
        code: {
          language: "python",
          filename: "worked_phase5_checkpoint.py",
          code: `prod_ready = Phase5AuditInput(
    service_name="thai-knowledge-rag-api",
    eval_passed_cases=39,
    eval_total_cases=40,
    request_latencies_ms=[420.0] * 18 + [980.0, 1450.0],
    monthly_cost_thb=97200.0,
    active_users=10000,
    pii_leaks_input=0,
    pii_leaks_output=0,
    pii_leaks_trace=0,
    injection_blocked=19,
    injection_total=20,
    healthz_ok=True,
    readyz_ok=True,
    present_runbooks=["provider_outage", "cost_spike", "prompt_injection"],
)

rep_ok = evaluate_phase5_readiness(prod_ready)
print(
    f"v0.5.0 ready={rep_ok.ready_for_v0_5_0} | eval={rep_ok.eval_pass_rate} "
    f"| p95={rep_ok.p95_latency_ms}ms | cost={rep_ok.cost_per_user_month_thb} THB/user "
    f"| block={rep_ok.injection_block_rate}"
)

not_ready = prod_ready.model_copy(
    update={"pii_leaks_trace": 1, "present_runbooks": ["provider_outage"]}
)
rep_bad = evaluate_phase5_readiness(not_ready)
print(
    f"blocked ready={rep_bad.ready_for_v0_5_0} | failed_gates={rep_bad.failed_gates} "
    f"| missing_runbooks={rep_bad.missing_runbooks}"
)`,
        },
        output: `v0.5.0 ready=True | eval=0.975 | p95=980.0ms | cost=9.72 THB/user | block=0.95
blocked ready=False | failed_gates=['zero_pii_leak_gate', 'incident_runbook_gate'] | missing_runbooks=['cost_spike', 'prompt_injection']`,
      },
    ],
    gotcha:
      "สังเกตในชุดข้อมูล `request_latencies_ms = [420.0] * 18 + [980.0, 1450.0]` (20 รายการ): ค่า P95 แบบ nearest-rank คือดัชนีที่ 18 (`math.ceil(0.95 * 20) - 1 = 18`) ซึ่งเท่ากับ `980.0 ms` (ไม่ใช่ `1450.0 ms` ซึ่งเป็นค่า max/P100) ตรงตามนิยาม Day 135 และ Day 124!",
  },

  practice: {
    intro:
      "ภารกิจ Checkpoint 15 นาที: สร้างโมดูล `phase5_checkpoint.py` ที่ตรวจรับความพร้อม Production ครบทั้ง 7 มิติ (`evaluate_phase5_readiness`) พร้อมตัวสร้างรายงานสถาปัตยกรรม Markdown (`render_readiness_report`) และชุดทดสอบ `pytest` ครบทุกมิติก่อนติดแท็ก `v0.5.0`",
    requirements: [
      "ตรวจครบทั้ง 7 เกณฑ์ด้วยชื่อ gate ที่ชัดเจน: `eval_gate` (`>= 0.95`), `p95_latency_gate` (`<= 2500.0 ms`), `cost_budget_gate` (`<= 12.00 THB/user`), `zero_pii_leak_gate` (`input + output + trace == 0`), `injection_block_gate` (`>= 0.90`), `health_probes_gate` (`healthz_ok and readyz_ok`) และ `incident_runbook_gate` (ครบทั้ง 3 เล่ม: `provider_outage`, `cost_spike`, `prompt_injection`)",
      "คำนวณ `p95_latency_ms` ด้วยสูตร nearest-rank (`idx = max(0, math.ceil(0.95 * len(ordered)) - 1)`) และคำนวณ `cost_per_user_month_thb = round(monthly_cost_thb / active_users, 2)`",
      "ปฏิเสธข้อมูลวัดผลที่ว่างเปล่าหรือไม่สมเหตุสมผลด้วย `ValueError` (เช่น `request_latencies_ms=[]`, latency `<= 0`, `eval_total_cases=0`, `eval_passed_cases > eval_total_cases`, `active_users=0`, `injection_total=0`)",
      "ตั้ง `ready_for_v0_5_0 = True` เฉพาะเมื่อ `failed_gates == []` (Fail-Closed 100%) และรายงาน `missing_runbooks` เรียงตามตัวอักษร",
      "เขียน `render_readiness_report(report: Phase5ReadinessReport) -> str` ที่คืนรายงาน Markdown พร้อมตาราง 7 มิติ, สถานะ `GO (v0.5.0)` หรือ `NO-GO`, และคำสั่ง `git tag -a v0.5.0` เมื่อผ่านครบทุกมิติ",
    ],
    starter: {
      language: "python",
      filename: "phase5_checkpoint.py",
      code: `import math
from pydantic import BaseModel, Field

REQUIRED_RUNBOOKS = {"provider_outage", "cost_spike", "prompt_injection"}


class Phase5AuditInput(BaseModel):
    service_name: str = Field(min_length=1)
    release_tag: str = "v0.5.0"
    eval_passed_cases: int = Field(ge=0)
    eval_total_cases: int = Field(ge=0)
    request_latencies_ms: list[float]
    monthly_cost_thb: float = Field(ge=0.0)
    active_users: int = Field(ge=0)
    pii_leaks_input: int = Field(ge=0)
    pii_leaks_output: int = Field(ge=0)
    pii_leaks_trace: int = Field(ge=0)
    injection_blocked: int = Field(ge=0)
    injection_total: int = Field(ge=0)
    healthz_ok: bool
    readyz_ok: bool
    present_runbooks: list[str] = Field(default_factory=list)


class Phase5ReadinessReport(BaseModel):
    service_name: str
    release_tag: str
    eval_pass_rate: float
    p95_latency_ms: float
    cost_per_user_month_thb: float
    total_pii_leaks: int
    injection_block_rate: float
    health_probes_ready: bool
    missing_runbooks: list[str]
    passed_gates: list[str]
    failed_gates: list[str]
    ready_for_v0_5_0: bool


def evaluate_phase5_readiness(
    audit: Phase5AuditInput,
    min_eval_pass_rate: float = 0.95,
    latency_budget_ms: float = 2500.0,
    max_cost_per_user_thb: float = 12.00,
    min_injection_block_rate: float = 0.90,
) -> Phase5ReadinessReport:
    """ตรวจรับครบทั้ง 7 มิติของ Phase 5 Checkpoint และปฏิเสธข้อมูลวัดที่ว่างเปล่า"""
    # TODO: 1) Validate non-empty latencies, positive active_users, valid eval & injection totals
    # TODO: 2) Compute all 7 metrics and build passed_gates / failed_gates
    # TODO: 3) Return Phase5ReadinessReport with ready_for_v0_5_0 = (len(failed_gates) == 0)
    raise NotImplementedError


def render_readiness_report(report: Phase5ReadinessReport) -> str:
    """สร้างรายงาน Production-Readiness Markdown สำหรับแนบใน README ของ v0.5.0"""
    # TODO: Render Markdown summary table with GO/NO-GO decision and failed_gates details
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .
git tag -a v0.5.0 -m "Phase 5: Production AI Ops, Evals & Security"`,
    },
    selfCheck: [
      "การตรวจ `zero_pii_leak_gate` รวมครบทั้ง 3 ขอบเขต (`pii_leaks_input + pii_leaks_output + pii_leaks_trace == 0`) ใช่หรือไม่?",
      "หาก `/healthz` เป็น `True` แต่ `/readyz` เป็น `False` เกณฑ์ `health_probes_gate` ตกและ `ready_for_v0_5_0` เป็น `False` ใช่หรือไม่?",
      "หากส่ง `request_latencies_ms=[]`, `active_users=0`, `eval_total_cases=0` หรือ `injection_blocked > injection_total` ฟังก์ชันโยน `ValueError` ทันทีใช่หรือไม่?",
      "รายงานจาก `render_readiness_report` แสดงตาราง 7 มิติและระบุ `NO-GO` พร้อมรายการ `failed_gates` เมื่อตกแม้แต่มิติเดียวใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทั้ง 9 เคส (all 7 gates pass, eval/latency/cost failures, PII leak across 3 boundaries, injection block failure, health/readyz probe & missing runbooks, empty/invalid input rejection, GO/NO-GO Markdown report) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "เรียงชื่อ gate ทั้ง 7 ให้ตรงกันทุกที่: `eval_gate`, `p95_latency_gate`, `cost_budget_gate`, `zero_pii_leak_gate`, `injection_block_gate`, `health_probes_gate`, `incident_runbook_gate`",
      },
      {
        body: "ใช้ `missing_runbooks = sorted(REQUIRED_RUNBOOKS - set(audit.present_runbooks))` เพื่อรองรับกรณีมีชื่อ runbook ซ้ำหรือลำดับไม่ตรงกันในลิสต์อินพุต",
      },
      {
        body: "เฉลยฉบับสมบูรณ์พร้อมชุดทดสอบ `pytest` ครบ 9 เคส (คัดลอกบันทึกเป็น `test_phase5_checkpoint.py` แล้วรัน `uv run --with pytest --with pydantic pytest -v` ได้ทันที):",
        code: {
          language: "python",
          filename: "test_phase5_checkpoint.py",
          code: `import math

import pytest
from pydantic import BaseModel, Field

REQUIRED_RUNBOOKS = {"provider_outage", "cost_spike", "prompt_injection"}


class Phase5AuditInput(BaseModel):
    service_name: str = Field(min_length=1)
    release_tag: str = "v0.5.0"
    eval_passed_cases: int = Field(ge=0)
    eval_total_cases: int = Field(ge=0)
    request_latencies_ms: list[float]
    monthly_cost_thb: float = Field(ge=0.0)
    active_users: int = Field(ge=0)
    pii_leaks_input: int = Field(ge=0)
    pii_leaks_output: int = Field(ge=0)
    pii_leaks_trace: int = Field(ge=0)
    injection_blocked: int = Field(ge=0)
    injection_total: int = Field(ge=0)
    healthz_ok: bool
    readyz_ok: bool
    present_runbooks: list[str] = Field(default_factory=list)


class Phase5ReadinessReport(BaseModel):
    service_name: str
    release_tag: str
    eval_pass_rate: float
    p95_latency_ms: float
    cost_per_user_month_thb: float
    total_pii_leaks: int
    injection_block_rate: float
    health_probes_ready: bool
    missing_runbooks: list[str]
    passed_gates: list[str]
    failed_gates: list[str]
    ready_for_v0_5_0: bool


def evaluate_phase5_readiness(
    audit: Phase5AuditInput,
    min_eval_pass_rate: float = 0.95,
    latency_budget_ms: float = 2500.0,
    max_cost_per_user_thb: float = 12.00,
    min_injection_block_rate: float = 0.90,
) -> Phase5ReadinessReport:
    if audit.eval_total_cases <= 0 or audit.eval_passed_cases > audit.eval_total_cases:
        raise ValueError("eval counts must have total > 0 and passed <= total")
    if not audit.request_latencies_ms or any(x <= 0 for x in audit.request_latencies_ms):
        raise ValueError("request_latencies_ms must be non-empty positive numbers")
    if audit.active_users <= 0:
        raise ValueError("active_users must be > 0")
    if audit.injection_total <= 0 or audit.injection_blocked > audit.injection_total:
        raise ValueError("injection counts must have total > 0 and blocked <= total")

    eval_pass_rate = round(audit.eval_passed_cases / audit.eval_total_cases, 4)

    ordered_lat = sorted(audit.request_latencies_ms)
    p95_idx = max(0, math.ceil(0.95 * len(ordered_lat)) - 1)
    p95_ms = round(float(ordered_lat[p95_idx]), 2)

    cost_per_user = round(audit.monthly_cost_thb / audit.active_users, 2)
    total_pii_leaks = audit.pii_leaks_input + audit.pii_leaks_output + audit.pii_leaks_trace
    injection_block_rate = round(audit.injection_blocked / audit.injection_total, 4)
    probes_ok = audit.healthz_ok and audit.readyz_ok
    missing_runbooks = sorted(REQUIRED_RUNBOOKS - set(audit.present_runbooks))

    checks = [
        ("eval_gate", eval_pass_rate >= min_eval_pass_rate),
        ("p95_latency_gate", p95_ms <= latency_budget_ms),
        ("cost_budget_gate", cost_per_user <= max_cost_per_user_thb),
        ("zero_pii_leak_gate", total_pii_leaks == 0),
        ("injection_block_gate", injection_block_rate >= min_injection_block_rate),
        ("health_probes_gate", probes_ok),
        ("incident_runbook_gate", len(missing_runbooks) == 0),
    ]
    passed = [name for name, ok in checks if ok]
    failed = [name for name, ok in checks if not ok]

    return Phase5ReadinessReport(
        service_name=audit.service_name,
        release_tag=audit.release_tag,
        eval_pass_rate=eval_pass_rate,
        p95_latency_ms=p95_ms,
        cost_per_user_month_thb=cost_per_user,
        total_pii_leaks=total_pii_leaks,
        injection_block_rate=injection_block_rate,
        health_probes_ready=probes_ok,
        missing_runbooks=missing_runbooks,
        passed_gates=passed,
        failed_gates=failed,
        ready_for_v0_5_0=(len(failed) == 0),
    )


def render_readiness_report(report: Phase5ReadinessReport) -> str:
    status = f"GO ({report.release_tag})" if report.ready_for_v0_5_0 else "NO-GO"
    rows = [
        f"| Eval Gate Pass Rate | {report.eval_pass_rate:.2%} | {'PASS' if 'eval_gate' in report.passed_gates else 'FAIL'} |",
        f"| P95 Latency | {report.p95_latency_ms:.2f} ms | {'PASS' if 'p95_latency_gate' in report.passed_gates else 'FAIL'} |",
        f"| Cost / User / Month | {report.cost_per_user_month_thb:.2f} THB | {'PASS' if 'cost_budget_gate' in report.passed_gates else 'FAIL'} |",
        f"| PII Leaks (In/Out/Trace) | {report.total_pii_leaks} | {'PASS' if 'zero_pii_leak_gate' in report.passed_gates else 'FAIL'} |",
        f"| Injection Block Rate | {report.injection_block_rate:.2%} | {'PASS' if 'injection_block_gate' in report.passed_gates else 'FAIL'} |",
        f"| Health & Readiness Probes | {report.health_probes_ready} | {'PASS' if 'health_probes_gate' in report.passed_gates else 'FAIL'} |",
        f"| Incident Runbooks | missing={report.missing_runbooks} | {'PASS' if 'incident_runbook_gate' in report.passed_gates else 'FAIL'} |",
    ]
    table = "\\n".join(rows)
    footer = (
        f"Next step: \`git tag -a {report.release_tag} -m 'Phase 5: Production AI Ops, Evals & Security'\`"
        if report.ready_for_v0_5_0
        else f"Blocked gates: {', '.join(report.failed_gates)}"
    )
    return (
        f"# Phase 5 Production-Readiness Audit — {report.service_name}\\n\\n"
        f"**Decision:** {status}\\n\\n"
        f"| Dimension | Observed | Gate |\\n"
        f"| :--- | :---: | :---: |\\n"
        f"{table}\\n\\n"
        f"{footer}\\n"
    )


# --- pytest suite (9 tests) ---


def _baseline_input(**overrides: object) -> Phase5AuditInput:
    base: dict[str, object] = {
        "service_name": "thai-knowledge-rag-api",
        "release_tag": "v0.5.0",
        "eval_passed_cases": 39,
        "eval_total_cases": 40,
        "request_latencies_ms": [420.0] * 18 + [980.0, 1450.0],
        "monthly_cost_thb": 97200.0,
        "active_users": 10000,
        "pii_leaks_input": 0,
        "pii_leaks_output": 0,
        "pii_leaks_trace": 0,
        "injection_blocked": 19,
        "injection_total": 20,
        "healthz_ok": True,
        "readyz_ok": True,
        "present_runbooks": ["provider_outage", "cost_spike", "prompt_injection"],
    }
    base.update(overrides)
    return Phase5AuditInput.model_validate(base)


def test_all_seven_gates_pass_for_production_ready_service() -> None:
    rep = evaluate_phase5_readiness(_baseline_input())
    assert rep.ready_for_v0_5_0 is True
    assert rep.eval_pass_rate == 0.975
    assert rep.p95_latency_ms == 980.0
    assert rep.cost_per_user_month_thb == 9.72
    assert rep.total_pii_leaks == 0
    assert rep.injection_block_rate == 0.95
    assert rep.health_probes_ready is True
    assert rep.missing_runbooks == []
    assert len(rep.passed_gates) == 7
    assert rep.failed_gates == []


def test_fails_when_eval_latency_or_cost_exceeds_budget() -> None:
    bad = _baseline_input(
        eval_passed_cases=36,
        eval_total_cases=40,
        request_latencies_ms=[500.0] * 18 + [2900.0, 3200.0],
        monthly_cost_thb=162000.0,
    )
    rep = evaluate_phase5_readiness(bad)
    assert rep.ready_for_v0_5_0 is False
    assert rep.eval_pass_rate == 0.9
    assert rep.p95_latency_ms == 2900.0
    assert rep.cost_per_user_month_thb == 16.2
    assert set(rep.failed_gates) == {"eval_gate", "p95_latency_gate", "cost_budget_gate"}


@pytest.mark.parametrize("field", ["pii_leaks_input", "pii_leaks_output", "pii_leaks_trace"])
def test_zero_tolerance_pii_leak_across_all_three_boundaries(field: str) -> None:
    rep = evaluate_phase5_readiness(_baseline_input(**{field: 1}))
    assert rep.ready_for_v0_5_0 is False
    assert rep.total_pii_leaks == 1
    assert rep.failed_gates == ["zero_pii_leak_gate"]


def test_fails_when_injection_block_rate_below_90_percent() -> None:
    rep = evaluate_phase5_readiness(_baseline_input(injection_blocked=17, injection_total=20))
    assert rep.ready_for_v0_5_0 is False
    assert rep.injection_block_rate == 0.85
    assert rep.failed_gates == ["injection_block_gate"]


def test_fails_when_readyz_false_or_runbooks_incomplete() -> None:
    rep = evaluate_phase5_readiness(
        _baseline_input(
            healthz_ok=True,
            readyz_ok=False,
            present_runbooks=["provider_outage", "provider_outage"],
        )
    )
    assert rep.ready_for_v0_5_0 is False
    assert rep.health_probes_ready is False
    assert rep.missing_runbooks == ["cost_spike", "prompt_injection"]
    assert set(rep.failed_gates) == {"health_probes_gate", "incident_runbook_gate"}


def test_rejects_empty_or_inconsistent_metrics() -> None:
    with pytest.raises(ValueError):
        evaluate_phase5_readiness(_baseline_input(request_latencies_ms=[]))
    with pytest.raises(ValueError):
        evaluate_phase5_readiness(_baseline_input(request_latencies_ms=[0.0, 200.0]))
    with pytest.raises(ValueError):
        evaluate_phase5_readiness(_baseline_input(eval_total_cases=0, eval_passed_cases=0))
    with pytest.raises(ValueError):
        evaluate_phase5_readiness(_baseline_input(eval_total_cases=10, eval_passed_cases=11))
    with pytest.raises(ValueError):
        evaluate_phase5_readiness(_baseline_input(active_users=0))
    with pytest.raises(ValueError):
        evaluate_phase5_readiness(_baseline_input(injection_total=0, injection_blocked=0))


def test_render_readiness_report_go_and_nogo_outputs() -> None:
    ok_md = render_readiness_report(evaluate_phase5_readiness(_baseline_input()))
    assert "GO (v0.5.0)" in ok_md
    assert "git tag -a v0.5.0" in ok_md
    assert "9.72 THB" in ok_md

    bad_md = render_readiness_report(evaluate_phase5_readiness(_baseline_input(readyz_ok=False)))
    assert "NO-GO" in bad_md
    assert "health_probes_gate" in bad_md
    assert "git tag -a" not in bad_md`,
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
      title: "ตรวจ PII Leak เฉพาะใน API Response แต่ลืมตรวจ outbound LLM Input และ Langfuse Trace",
      symptom:
        "หน้าบ้านไม่เห็นเบอร์โทรหรือเลขบัตรประชาชน แต่ข้อมูลดิบถูกส่งไปหา external LLM API หรือถูกบันทึกค้างไว้ใน span metadata ของ {{langfuse}} ละเมิด {{pdpa}}",
      fix: "รวมยอด `pii_leaks_input + pii_leaks_output + pii_leaks_trace` แล้วบังคับให้เท่ากับ `0` ทุกขอบเขต",
    },
    {
      title: "ปล่อยผ่าน `health_probes_gate` เมื่อ `/healthz` เป็น 200 โดยไม่เช็ก `/readyz`",
      symptom:
        "คอนเทนเนอร์สตาร์ตติดแต่ยังเชื่อมต่อ Postgres/`pgvector` หรือโหลดโมเดลไม่เสร็จ ทำให้ Load Balancer ยิงทราฟฟิกเข้าจนลูกค้าเจอ 500 ระหว่าง deploy",
      fix: "ต้องตรวจ `healthz_ok and readyz_ok` คู่กันตามหลักการแยก Liveness ออกจาก Readiness ของ Day 143",
    },
    {
      title: "ปล่อยให้ผ่าน `v0.5.0` เพราะผ่าน 6 จาก 7 มิติ (เช่น ลืมเขียน Runbook หรือ Injection Block Rate เหลือ 80%)",
      symptom:
        "ระบบถูกปล่อยขึ้น Production ทั้งที่ยังไม่มีแผนรับมือเหตุฉุกเฉินหรือกันการโจมตีได้ไม่ถึงมาตรฐาน",
      fix: "ใช้ตรรกะ Fail-Closed (`ready_for_v0_5_0 = (len(failed_gates) == 0)`): ต้องผ่านครบทุกมิติ 100% จึงค่อยติดแท็ก `v0.5.0`",
    },
    {
      title: "ลืมตรวจสอบค่าว่างหรือค่าผิดปกติก่อนหาร (`active_users=0`, `eval_total_cases=0`, `request_latencies_ms=[]`)",
      symptom:
        "สคริปต์ตรวจรับพังด้วย `ZeroDivisionError` หรือเผลอผ่านเกณฑ์ Vacuous Pass บนชุดทดสอบที่ไม่ได้รันจริง",
      fix: "ตรวจสอบ `total > 0`, `0 <= passed <= total`, `active_users > 0` และ `latencies_ms` ไม่ว่างตั้งแต่บรรทัดแรกพร้อมโยน `ValueError`",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d156-q1",
        "ระบบของคุณผ่าน 6 มิติแรกของ Phase 5 Readiness Audit ทั้งหมด (`eval=0.98`, `P95=920 ms`, `cost=9.50 THB/user`, `injection_block=0.95`, `/healthz` + `/readyz` ผ่าน, Runbook ครบ 3 เล่ม) แต่พบ `pii_leaks_trace = 1` ใน {{langfuse}} ผลตัดสิน `ready_for_v0_5_0` ต้องเป็นอย่างไร?",
        [
          [
            "`True` — เพราะข้อมูลไม่ได้หลุดออกไปที่ API Response ของลูกค้า",
            "ผิด — การเก็บข้อมูลส่วนบุคคลดิบไว้ในระบบ Trace โดยไม่ได้รับอนุญาตยังละเมิด PDPA และเป็นช่องโหว่สำคัญ",
          ],
          [
            "`False` — เพราะ `zero_pii_leak_gate` ตรวจรวมทั้ง Input, Output และ Trace แบบ Zero-Tolerance (`== 0`) และ Readiness Gate ต้องผ่านครบทุกมิติ",
            "ถูกต้อง — ต้องปิดจุดรั่วใน Trace Allowlist (Day 153–154) ให้เป็น 0 ก่อนติดแท็ก `v0.5.0`",
          ],
          [
            "`True` — เพราะผ่านถึง 6 จาก 7 มิติ (85.7%)",
            "Readiness Gate ทำงานแบบ AND ไม่ใช่คะแนนเฉลี่ย",
          ],
          [
            "ข้ามมิติ PII แล้วค่อยไปแก้ใน Phase 6",
            "ห้ามติดแท็ก `v0.5.0` ขณะที่ยังมี PII รั่วในระบบ",
          ],
        ],
        "B",
        "การคุ้มครองข้อมูลส่วนบุคคลตาม PDPA ต้องครอบคลุมครบทั้ง 3 ขอบเขต: outbound LLM input, API response และ observability trace",
        "เหตุใด `pii_leaks_trace = 1` จึงทำให้ `zero_pii_leak_gate` ตกแม้ response จะสะอาด?",
        "เพราะ PII ห้ามรั่วในทุกขอบเขตทั้ง outbound LLM input, API response และ trace/log ของระบบ monitoring",
      ),
      mc(
        "d156-q2",
        "จากข้อมูลโหลดทดสอบ 20 รายการที่มีค่า `monthly_cost_thb = 97,200` บาท สำหรับ `active_users = 10,000` คน และ `request_latencies_ms = [420]*18 + [980, 1450]` ค่า `cost_per_user_month_thb` และ `p95_latency_ms` (nearest-rank) เป็นเท่าใด?",
        [
          [
            "`9.72 THB/user` และ `980.0 ms` (ผ่านทั้ง `cost_budget_gate` และ `p95_latency_gate`)",
            "ถูกต้อง — `97200 / 10000 = 9.72 <= 12.00` และตำแหน่ง P95 ของ 20 รายการคือลำดับที่ 19 (index 18) = `980.0 ms <= 2500.0 ms`",
          ],
          [
            "`9.72 THB/user` และ `1450.0 ms`",
            "ผิด — `1450.0 ms` คือลำดับที่ 20 (P100/max) ไม่ใช่ P95 ของ 20 รายการ",
          ],
          [
            "`16.20 THB/user` และ `420.0 ms`",
            "ผิดทั้งสองตัวเลข — `16.20` เป็นงบก่อนปรับแต่งใน Day 147 และ `420.0` คือ P50",
          ],
          [
            "`0.97 THB/user` และ `980.0 ms`",
            "หารผิดหลัก — `97,200 / 10,000 = 9.72`",
          ],
        ],
        "A",
        "ทบทวนสูตรทั้งสองจาก Day 135 (`math.ceil(0.95 * 20) - 1 = 18`) และ Day 147 (`monthly_cost_thb / active_users`)",
        "สำหรับชุดข้อมูล 20 รายการ ตำแหน่งดัชนี (0-based) ของ P95 แบบ nearest-rank คือดัชนีใด?",
        "ดัชนี `18` (`math.ceil(0.95 * 20) - 1 = 18`, ซึ่งเป็นรายการที่ 19 จาก 20 รายการ)",
      ),
      mc(
        "d156-q3",
        "ใน `health_probes_gate` หาก `/healthz` ตอบ 200 OK แต่ `/readyz` ตอบ 503 Service Unavailable หมายความว่าอย่างไร และควรผ่านเกณฑ์หรือไม่?",
        [
          [
            "โปรเซสแอปยังทำงานอยู่แต่ dependency (เช่น DB/vector store) ยังไม่พร้อมรับทราฟฟิก — จึงต้อง **ไม่ผ่าน** `health_probes_gate`",
            "ถูกต้อง — `/healthz` (Liveness) บอกว่าแอปไม่ค้าง ส่วน `/readyz` (Readiness) บอกว่าพร้อมรับทราฟฟิกจริง ต้องผ่านทั้งคู่",
          ],
          [
            "ผ่านได้ เพราะ `/healthz` ตอบ 200 แล้ว",
            "ผิด — หากส่งทราฟฟิกเข้าตอน `/readyz` เป็น 503 ผู้ใช้จะเจอ error ทันที",
          ],
          [
            "ควรสั่งรีสตาร์ตคอนเทนเนอร์ทันทีเมื่อ `/readyz` เป็น 503",
            "ผิด — นั่นคือเหตุผลที่ Day 143 แยก Liveness ออกจาก Readiness เพื่อไม่ให้ DB ช้าไปสั่งรีสตาร์ตแอปวนลูป",
          ],
          [
            "ควรลบ `/readyz` ออกเพื่อให้ระบบผ่านเกณฑ์ง่ายขึ้น",
            "ห้ามลบ readiness probe ในระบบ production",
          ],
        ],
        "A",
        "การแยก `/healthz` (Liveness) กับ `/readyz` (Readiness) ช่วยให้แพลตฟอร์มคลาวด์หยุดส่งทราฟฟิกโดยไม่รีสตาร์ตแอปมั่ว และก่อนปล่อยรุ่นใหม่ทั้งสองต้องพร้อม",
        "ความต่างระหว่าง `/healthz` กับ `/readyz` ใน Production FastAPI คืออะไร?",
        "`/healthz` ตรวจว่าโปรเซสแอปยังมีชีวิตโดยไม่เรียก dependency ส่วน `/readyz` ตรวจว่าแอปพร้อมรับทราฟฟิกและเชื่อมต่อ dependency สำคัญได้แล้ว",
      ),
      mc(
        "d156-q4",
        "เมื่อติดแท็ก `v0.5.0` สำเร็จแล้ว ก้าวแรกของ **Phase 6: Production Capstone (Day 157)** คืออะไร?",
        [
          [
            "เขียนโค้ด UI หน้าแชตให้สวยที่สุดก่อนแล้วค่อยคิดสถาปัตยกรรมทีหลัง",
            "ผิด — การสร้างก่อนวางกรอบปัญหามักทำให้ scope บานปลายและไม่ผ่าน Rubric",
          ],
          [
            "ทำ Problem Framing, เขียน User Stories 3 เส้นทาง (`rag_faq`, `mcp_lookup`, `hitl_write`), ระบุ Non-Goals และเขียน 1-Page ADR (`ADR-001`) พร้อมล็อกสัญญา SLA ด้วย Pydantic",
            "ถูกต้อง — Day 157 เริ่มจากการล็อกขอบเขต, เหตุผลเชิงสถาปัตยกรรม (Alternatives & Trade-offs) และเกณฑ์ SLA ของระบบผู้ช่วย AI องค์กรสองภาษาก่อนสร้าง repo ใน Day 158",
          ],
          [
            "เปลี่ยนไปเทรนโมเดล LLM ใหม่ตั้งแต่ศูนย์",
            "Capstone ใช้สถาปัตยกรรม Hybrid RAG + MCP + LangGraph + FastAPI + Langfuse + PDPA ที่ฝึกมาตลอด 5 Phases",
          ],
          [
            "ปิด CI Eval Gate และ PDPA Middleware เพื่อให้พัฒนาเร็วขึ้น",
            "ทั้ง Eval Gate และ PDPA เป็นเกณฑ์บังคับใน Capstone Grading Rubric",
          ],
        ],
        "B",
        "ยินดีด้วยครับ! คุณผ่าน Phase 5 ครบทุกมิติแล้ว และพร้อมเปิดฉาก Phase 6 Production Capstone ใน Day 157 ด้วยเอกสาร ADR-001!",
        "Day 157 (ก้าวแรกของ Phase 6 Capstone) ให้เราสร้างเอกสารและสัญญาอะไรเป็นอันดับแรก?",
        "Problem Framing, User Stories 3 เส้นทาง (`rag_faq`, `mcp_lookup`, `hitl_write`), Non-Goals, 1-Page ADR (`ADR-001`) และ SLA Contract ที่ตรวจด้วย Pydantic + pytest",
      ),
    ],
  },

  takeaways: [
    "**ยินดีด้วย! คุณจบ Phase 5 (Days 125–156, Blocks B32–B39) และปิด Portfolio Milestone ชิ้นที่ 5 (`v0.5.0`) สำเร็จแล้ว!**",
    "**7 Production-Readiness Gates**: Eval Gate (`>= 0.95`), P95 Latency (`<= 2500 ms`), Cost/User/Month (`<= 12.00 THB`), Zero PII Leaks (`== 0`), Injection Block Rate (`>= 0.90`), `/healthz` + `/readyz` และ Incident Runbook ครบ 3 สถานการณ์",
    "**Fail-Closed Readiness Auditor**: ปฏิเสธข้อมูลวัดที่ว่างหรือผิดช่วง (`raise ValueError`), สร้างรายงาน Markdown อัตโนมัติ และอนุญาตให้ติดแท็ก `v0.5.0` เฉพาะเมื่อ `failed_gates == []`",
    "พบกันใน **Phase 6: Production Capstone (Day 157)** เพื่อเริ่มออกแบบ `ADR-001` ของระบบ **Thai/Bilingual Enterprise Knowledge & Support AI Assistant** สู่ Final Defense ใน Day 180!",
  ],

  reviewCards: [
    rc(
      "d156-rc1",
      "ไล่ชื่อเกณฑ์ทั้ง 7 มิติของ Phase 5 Production-Readiness Audit (`v0.5.0`) พร้อมค่าเป้าหมาย",
      "1) `eval_gate >= 0.95`, 2) `p95_latency_gate <= 2500 ms`, 3) `cost_budget_gate <= 12.00 THB/user/month`, 4) `zero_pii_leak_gate == 0` (in+out+trace), 5) `injection_block_gate >= 0.90`, 6) `health_probes_gate` (`/healthz` + `/readyz`), 7) `incident_runbook_gate` (`provider_outage`, `cost_spike`, `prompt_injection`)",
    ),
    rc(
      "d156-rc2",
      "Phase 5 (Days 125–156) ครอบคลุม 4 เสาหลักของ Production AI Engineering ด้านใดบ้าง?",
      "1) Automated Evals (Golden Dataset, Ragas, Promptfoo, CI Gates), 2) Observability (OTel, Langfuse, P50/P95 & Cost Dashboards), 3) Deployment & Economics (Async FastAPI, Dockerfile/Compose, Cloud Probes, vLLM/Caching/Cost Calc), 4) Security & Ops (OWASP LLM, Guardrails, Thai PDPA, Incident Runbooks)",
    ),
    rc(
      "d156-rc3",
      "5 ชิ้นงานในพอร์ตโฟลิโอที่คุณสร้างสำเร็จมาแล้วตั้งแต่ Phase 1 ถึง Phase 5 มีอะไรบ้าง?",
      "`v0.1.0`: Async Data CLI (Phase 1), `v0.2.0`: Thai Ticket ML Pipeline (Phase 2), `v0.3.0`: Typed Thai Document Extractor (Phase 3), `v0.4.0`: Thai Hybrid RAG + MCP/LangGraph Agent (Phase 4), `v0.5.0`: Evaluated, Observable, Guarded & Production-Ready AI Microservice (Phase 5)",
    ),
    rc(
      "d156-rc4",
      "Phase 6 Capstone (เริ่มต้น Day 157) คือโปรเจกต์อะไรและมีเกณฑ์ผ่าน 4 เสาหลักอย่างไร?",
      "Thai/Bilingual Enterprise Knowledge & Support AI Assistant — เกณฑ์ผ่าน: 1) `Recall@5 >= 0.85`, `Faithfulness >= 0.85`, Abstention `>= 90%`, 2) Schema `>= 99%` + Fallback + HITL write gate, 3) 100% Trace ID + P50/P95 + Cost/1k, 4) Red-Team `>= 90%` + PDPA PII Masking",
    ),
  ],

  sources: [
    {
      label: "Google SRE Book · Production Readiness Review & Launch Checklist",
      href: "https://sre.google/sre-book/evolving-sre-engagement-model/",
    },
    {
      label: "OWASP Top 10 for LLM Applications — Production Security Verification",
      href: "https://genai.owasp.org/llm-top-10/",
    },
    {
      label: "OpenTelemetry Semantic Conventions for Generative AI",
      href: "https://opentelemetry.io/docs/specs/semconv/gen-ai/",
    },
    {
      label: "Promptfoo Documentation — CI/CD Quality & Security Eval Gates",
      href: "https://www.promptfoo.dev/docs/integrations/ci-cd/",
    },
  ],

  glossary: [
    "golden-dataset",
    "ragas",
    "promptfoo",
    "otel",
    "langfuse",
    "fastapi",
    "dockerfile",
    "vllm",
    "guardrails",
    "prompt-injection",
    "pdpa",
    "circuit-breaker",
    "adr",
    "pydantic",
    "pytest",
  ],
});
