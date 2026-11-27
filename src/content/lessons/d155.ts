import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D155 — Phase 5 / Block B39
 * Write Incident Runbook (Provider Outage, Cost Spike, Prompt Injection)
 */
export const d155: Lesson = defineLesson({
  day: 155,
  titleTh: "เขียน Incident Runbook รับมือเหตุฉุกเฉิน: Provider ล่ม, ต้นทุนพุ่ง และ Prompt Injection",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% · แปลงสัญญาณจาก Dashboard (P95, Error Rate, Cost/Req, Block Rate) เป็น Runbook, Fallback/Kill-Switch, การสื่อสาร และ Blameless Postmortem",
  icon: "shield-alert",
  visual: {
    id: "phase5-prod-arch",
    title: "เส้นทางรับมือเหตุฉุกเฉินของ Production AI Microservice",
    caption:
      "เชื่อมสัญญาณจาก Langfuse/OTel Dashboard ไปยังตัวจำแนกระดับความรุนแรง (SEV-1/2/3), Runbook, Fallback/Kill-Switch และ Blameless Postmortem",
    alt: "แผนภาพสถาปัตยกรรม Production AI Microservice แสดงการตรวจจับสัญญาณผิดปกติ การสลับ Fallback หรือ Kill-Switch และการป้อนเคสกลับเข้าชุด Eval",
  },
  requiresApiKey: false,
  apiKeyNote:
    "รันบนเครื่องคุณได้ 100% — ใช้ Pydantic v2 จำลองสัญญาณจาก Dashboard และทดสอบตัวจำแนกเหตุการณ์ + Alert Router ด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "pytest", "Langfuse Alerts", "Runbook Markdown"],

  bigPicture: [
    {
      node: 5,
      heading: "เปลี่ยนตัวเลขจาก Dashboard (Day 135) ให้เป็นสัญญาณเปิด Runbook",
      body: "กราฟ P95 latency, อัตรา error, ต้นทุนต่อคำขอ และอัตราการบล็อกของ {{guardrails}} จะไร้ประโยชน์ถ้าตอนตีสองไม่มีกติกาชัดเจนว่าค่าไหนต้องปลุกคนดูแล และต้องรออย่างน้อย 2 หน้าต่างต่อเนื่อง (`sample_count >= 20`) เพื่อลดสัญญาณรบกวน",
      lessonNote:
        "ดึงนิยามหน้าต่างเวลาและปริมาณตัวอย่างขั้นต่ำจาก Day 135 มาผูกกับเกณฑ์ SEV-1 / SEV-2 / SEV-3 แบบตรวจสอบด้วยโค้ดได้",
    },
    {
      node: 0,
      heading: "แยก 3 เหตุการณ์วิกฤตของระบบ AI ให้ออกภายใน 2 นาทีแรก",
      body: "เหตุล่มของระบบ AI ไม่ได้มีแค่เซิร์ฟเวอร์ดับ แต่แบ่งชัดเป็น 3 กลุ่ม: **Provider Outage** (API ปลายทาง 5xx/ช้า), **Cost Spike** (ค่าโทเคนพุ่งผิดปกติจาก retry หรือ prompt บวม) และ **{{prompt-injection}} Wave / PII Leak** (การโจมตีหรือข้อมูล {{pdpa}} รั่ว)",
      lessonNote:
        "แต่ละกลุ่มมี Runbook และลำดับการหยุดความเสียหายต่างกัน — หยิบผิดเล่มอาจทำให้ระบบล่มหนักกว่าเดิม",
    },
    {
      node: 4,
      heading: "หยุดความเสียหายก่อนแก้โค้ด: Fallback Model, Feature Flag และ Kill-Switch",
      body: "ตามหลัก Google SRE ในช่วง SEV-1 หน้าที่อันดับหนึ่งคือ **Mitigate First, Debug Second** — สลับไปใช้ Fallback Model, ปิดฟีเจอร์สิ้นเปลืองผ่าน Feature Flag, เปิด {{circuit-breaker}} หรือสับ Kill-Switch ภายใน 60 วินาทีโดยไม่ต้องรอ deploy โค้ดใหม่",
      lessonNote:
        "ทุก Runbook ในวันนี้ระบุธงคอนฟิกและขั้นตอนยืนยันการฟื้นตัว (Verification) ไว้ครบชุด",
    },
    {
      node: 6,
      heading: "สื่อสารให้เป็นระบบและปิดวงจรด้วย Blameless Postmortem",
      body: "หลังคุมสถานการณ์ได้ ต้องอัปเดตผู้เกี่ยวข้องโดยไม่หลุดข้อมูลภายในหรือ PII แล้วเขียน **Blameless Postmortem** เพื่อหาช่องโหว่เชิงระบบ และเปลี่ยนเหตุการณ์จริงให้กลายเป็นเคสใหม่ใน {{golden-dataset}} และ {{promptfoo}} CI Gate",
      lessonNote:
        "ผลลัพธ์ของวันนี้คือ Runbook และ `incident_router.py` ซึ่งเป็นหนึ่งในเกณฑ์บังคับของวันตรวจรับ Phase 5 Checkpoint (Day 156)",
    },
  ],

  objectives: [
    "**แปลงสัญญาณจาก Dashboard (Day 135)** — `p95_ms`, `error_rate`, `cost_per_request_thb`, `guardrail_block_rate` และ `pii_leak_detected` — ให้เป็นระดับความรุนแรง (`SEV-1` / `SEV-2` / `SEV-3` / `NONE`) พร้อมเลือก Runbook ที่ต้องเปิดทันที",
    "**ออกแบบ Incident Runbook ครบทั้ง 3 สถานการณ์** (Provider Outage, Cost Spike, Prompt Injection) ที่ระบุลำดับ Mitigation (Fallback Model, Feature Flag, Kill-Switch), กติกาการสื่อสาร และเทมเพลต Blameless Postmortem ตามแนวทาง Google SRE",
    "**เขียนและทดสอบ `incident_router.py` ด้วย `Pydantic v2` + `pytest`** ที่รองรับการกรองสัญญาณรบกวน (`sample_count < 20` หรือ `< 2` หน้าต่าง), การจัดลำดับความสำคัญเมื่อเกิดหลายอาการพร้อมกัน และการสร้างเอกสาร Postmortem Markdown",
  ],

  prerequisites: [
    "Day 135 · เข้าใจการคำนวณ P50/P95 Latency, Token, ต้นทุนต่อคำขอ และเงื่อนไข alert แบบ 2 หน้าต่างต่อเนื่องพร้อมจำนวนตัวอย่างขั้นต่ำ",
    "Day 138 & Day 147 · เข้าใจ timeout, graceful degradation ({{circuit-breaker}}) และงบต้นทุนต่อคำขอ/ต่อผู้ใช้",
    "Day 150–154 · มี {{fastapi}} ที่ห่อ {{guardrails}}, {{pdpa}} masking, {{langfuse}} trace และชุดตรวจ {{promptfoo}} ครบแล้ว",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์ `ai-day155` สำหรับสร้างโมดูลคัดแยกเหตุการณ์และกระจายการแจ้งเตือน (`incident_router.py`) พร้อมเทมเพลต Runbook และ Postmortem",
    commands: `uv init ai-day155 && cd ai-day155
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day155` และติดตั้ง `pydantic`, `pytest`, `ruff`"],
      ["router", "สร้าง `incident_router.py` ที่จำแนกสัญญาณจาก Dashboard เป็น SEV-1/2/3 และจับคู่ Runbook"],
      ["verify", "รัน `uv run pytest -v` และ `uv run ruff check .` ยืนยันความถูกต้องทุกเงื่อนไขขอบเขต"],
    ],
    note: "บทเรียนนี้รันได้ 100% แบบออฟไลน์ด้วยข้อมูลจำลองจาก Dashboard ของ Day 135 และ Day 147 — สามารถนำสคริปต์ไปเชื่อมเป็น Webhook Handler ของ Langfuse/Alertmanager ในระบบจริงได้ทันที",
  },

  concepts: [
    {
      id: "detection-and-severity",
      title: "1 · สัญญาณจาก Dashboard (Day 135) และเกณฑ์ระดับความรุนแรง SEV-1 / SEV-2 / SEV-3",
      paragraphs: [
        "ความผิดพลาดที่พบบ่อยของทีม AI มือใหม่คือตั้ง Alert ไว้ทุกตัวเลขจนกลุ่มแชตเด้งทั้งวัน (Alert Fatigue) จนวันเกิดเหตุจริงไม่มีใครเปิดอ่าน เราจึงนำกฎจาก **Day 135** มาเป็นด่านกรองแรก: สัญญาณเชิงสถิติต้องมีคำขออย่างน้อย **`sample_count >= 20`** และละเมิดเกณฑ์ติดกันอย่างน้อย **`consecutive_windows >= 2`** หน้าต่าง 1 นาที จึงจะเปิดเหตุการณ์ — **ยกเว้นกรณีเดียวคือ `pii_leak_detected == True`** ซึ่งถือเป็น **SEV-1 ทันที** แม้เกิดเพียง 1 คำขอ เพราะเกี่ยวข้องกับกฎหมาย {{pdpa}}",
        "เมื่อสัญญาณผ่านด่านกรองแล้ว เราจำแนกระดับความรุนแรงตามผลกระทบต่อผู้ใช้และงบประมาณ:\n- **SEV-1 (Critical · ปลุก On-Call ผ่าน `pager-sev1` ภายใน 5 นาที)**: บริการล่มหนัก (`error_rate >= 0.25` หรือ `p95_ms >= 4000`), ค่าใช้จ่ายพุ่ง >= 5 เท่าของฐาน (`cost_per_request_thb >= 1.00`), ถูกยิงโจมตีหนัก (`guardrail_block_rate >= 0.25`) หรือพบ **PII รั่วไหล** (`pii_leak_detected == True`)\n- **SEV-2 (High · แจ้งทีมผ่าน `slack-ai-oncall` ภายใน 15 นาที)**: ประสบการณ์ผู้ใช้เริ่มแย่ชัดเจน (`error_rate >= 0.05` หรือ `p95_ms > 1200` ตามเกณฑ์ Day 135), ต้นทุนพุ่ง >= 2.5 เท่า (`cost_per_request_thb >= 0.50`) หรือการบล็อกพุ่งผิดปกติ (`guardrail_block_rate >= 0.10`)\n- **SEV-3 (Medium · เปิดทิกเก็ต `ticket-backlog` ตรวจในวันทำการถัดไป)**: อาการเตือนระยะต้น (`error_rate >= 0.02`, `cost_per_request_thb >= 0.30` หรือ `guardrail_block_rate >= 0.05`)",
      ],
      analogy:
        "เหมือนห้องฉุกเฉินโรงพยาบาลที่มีบัตรคัดกรองสีแดง-เหลือง-เขียว: คนไข้ที่หัวใจหยุดเต้น (PII รั่ว / Outage หนัก) เข้าห้องกู้ชีพทันทีไม่ต้องรอคิว ส่วนอาการไข้ต่ำชั่วครู่ (1 หน้าต่าง, ตัวอย่างน้อย) ให้เฝ้าดูอาการก่อนเพื่อไม่ให้หมอหมดแรง",
      bullets: [
        "**Noise Gate**: ปฏิเสธการเปิด Alert หาก `sample_count < 20` หรือ `consecutive_windows < 2` (ยกเว้น `pii_leak_detected=True`)",
        "**Multi-Signal Priority**: หากเกิดหลายอาการพร้อมกัน เลือกความรุนแรงสูงสุดเป็นหลัก และเมื่อระดับ SEV เท่ากัน ให้ลำดับความสำคัญเป็น `prompt_injection > provider_outage > cost_spike`",
        "**Cost Baseline Tie-In**: อ้างอิงงบ Day 147 ที่ตั้งฐานต้นทุนหลังปรับแต่ง ~`0.18–0.20` บาท/คำขอ ทำให้จุด `0.30 / 0.50 / 1.00` บาทสะท้อน 1.5x / 2.5x / 5x ของฐานจริง",
      ],
      code: {
        language: "python",
        filename: "severity_thresholds.py",
        code: `# เกณฑ์จำแนกระดับความรุนแรง (เชื่อมตัวเลขจาก Day 135 และ Day 147)
THRESHOLDS = {
    "provider_outage": {
        "SEV-1": "error_rate >= 0.25 or p95_ms >= 4000",
        "SEV-2": "error_rate >= 0.05 or p95_ms > 1200",
        "SEV-3": "error_rate >= 0.02",
    },
    "cost_spike": {
        "SEV-1": "cost_per_request_thb >= 1.00",  # >= 5x baseline (0.20 THB)
        "SEV-2": "cost_per_request_thb >= 0.50",  # >= 2.5x baseline
        "SEV-3": "cost_per_request_thb >= 0.30",  # >= 1.5x baseline
    },
    "prompt_injection": {
        "SEV-1": "pii_leak_detected or guardrail_block_rate >= 0.25",
        "SEV-2": "guardrail_block_rate >= 0.10",
        "SEV-3": "guardrail_block_rate >= 0.05",
    },
}`,
        caption: "ตารางเกณฑ์เดียวที่เชื่อมสัญญาณ Dashboard จาก Day 135 และงบต่อคำขอจาก Day 147 เข้ากับระดับ SEV",
      },
      whyTitle: "Why this matters — ตัวเลขเกณฑ์ที่ชัดเจนลดเวลาตัดสินใจใน 5 นาทีแรก",
      whyParagraphs: [
        "ตอนตีสองที่ระบบมีปัญหา มนุษย์ตัดสินใจได้ช้าและผิดพลาดง่าย การเขียนเกณฑ์เป็นโค้ดและตารางที่ตกลงร่วมกันไว้ล่วงหน้าทำให้ทุกคนรู้ทันทีว่าต้องปลุกใครและเปิดคู่มือเล่มไหนโดยไม่ต้องถกเถียง",
      ],
    },
    {
      id: "three-ai-runbooks",
      title: "2 · โครงสร้าง Incident Runbook 3 สถานการณ์หลักของระบบ AI",
      paragraphs: [
        "Runbook ที่ดีไม่ใช่ตำราทฤษฎียาว 20 หน้า แต่คือ **เช็กลิสต์ลงมือทำได้ใน 5 ขั้น** (1. Verify Signal, 2. Immediate Mitigation, 3. Scope Impact, 4. Comms Update, 5. Recovery Verification) ที่วิศวกรคนใหม่ในทีมก็เปิดทำตามได้ทันที:",
        "- **`RUNBOOK-01-PROVIDER-OUTAGE` (ผู้ให้บริการ LLM ล่มหรือหน่วงหนัก)**: ตรวจหน้าสถานะผู้ให้บริการและแยกสัดส่วน 429 vs 5xx vs Timeout ใน {{langfuse}}/{{structlog}} → เปิด {{circuit-breaker}} และสลับ `LLM_FALLBACK_MODEL` ไปยังโมเดลสำรอง (หรือโหมดคืนเฉพาะเอกสาร FAQ จากแคช) → ตรวจว่า `error_rate < 0.02` และ `p95_ms <= 1200` ติดกัน 5 นาทีก่อนปิดเหตุ\n- **`RUNBOOK-02-COST-SPIKE` (ต้นทุนโทเคนพุ่งผิดปกติ)**: แยกใน {{langfuse}} ว่าเป็นเพราะ retry loop ({{exponential-backoff}} ทำงานซ้ำไม่หยุด), input context บวม หรือมีผู้เช่ารายเดียวกำลัง scrape ระบบ → เปิดธง `MODEL_TIER_SMALL_ONLY=true`, กดเพดาน `MAX_OUTPUT_TOKENS=256`, บีบ {{rate-limit}} ต่อ tenant และปิด Query Rewriting/HyDE ชั่วคราว → ตรวจให้ `cost_per_request_thb <= 0.25`\n- **`RUNBOOK-03-PROMPT-INJECTION` (คลื่นโจมตี Prompt Injection หรือ PII รั่ว)**: ตรวจ `request_id` และรหัสกฎที่บล็อก (ห้ามคัดลอกข้อความดิบหรือข้อมูลส่วนบุคคลลงห้องแชต!) → เปิด `STRICT_GUARDRAIL_MODE=true` และปิด write tools ด้วย `DISABLE_WRITE_TOOLS=true`; หาก `pii_leak_detected == True` ให้สับ `AI_KILL_SWITCH=true` เพื่อตัดการส่งออก external API ทันที → แจ้ง DPO/Security ภายในกรอบเวลาของ {{pdpa}}",
      ],
      analogy:
        "เหมือน Quick Reference Handbook (QRH) ในห้องนักบิน — พอไฟเตือนเครื่องยนต์ติด นักบินไม่ต้องเปิดตำราวิศวกรรมการบิน แต่เปิดหน้าสีแดงตามรหัสสัญญาณแล้วทำตามข้อ 1–2–3 ทันที",
      bullets: [
        "**Verify before acting**: แยกให้ออกก่อนว่ากราฟพังเพราะ collector ล่ม (no-data) หรือบริการปลายทางล่มจริง",
        "**Safe trace inspection**: เวลาสืบเหตุ {{prompt-injection}} ให้ค้นด้วย `request_id` และ allowlist metadata เท่านั้น ห้ามแปะ payload ดิบที่มี PII ลง Slack",
        "**Exit criteria**: ทุก Runbook ต้องระบุตัวเลขยืนยันการฟื้นตัวชัดเจน ไม่ใช่ปิดเหตุเพราะ 'ดูเหมือนหายแล้ว'",
      ],
      whyTitle: "Why this matters — ปัญหา Cost Spike และ Prompt Injection ต่างจาก Outage ทั่วไป",
      whyParagraphs: [
        "ในเว็บแอปทั่วไปถ้า API ตอบ HTTP 200 แปลว่าระบบปกติ แต่ในระบบ AI บริการอาจตอบ 200 OK ตลอดเวลาขณะที่กำลังเผางบเดือนละแสนจาก retry loop หรือกำลังหลุดข้อมูลลูกค้าออกนอกองค์กร Runbook เฉพาะทางของ AI จึงขาดไม่ได้",
      ],
    },
    {
      id: "mitigation-controls",
      title: "3 · กลไกหยุดเลือดใน 60 วินาที: Fallback Model, Feature Flag และ Kill-Switch",
      paragraphs: [
        "การแก้โค้ดแล้วรอ CI build Docker image และ deploy ใหม่มักใช้เวลา 10–25 นาที ซึ่งช้าเกินไปสำหรับ SEV-1 ระบบ AI ระดับ Production จึงต้องออกแบบ **3 สวิตช์ควบคุมตอนรันไทม์** ไว้ล่วงหน้า:",
        "1. **Fallback Model (`LLM_FALLBACK_MODEL`)**: สลับการเรียกโมเดลหลักที่กำลัง 503/ช้า ไปยังผู้ให้บริการสำรอง หรือโมเดลขนาดเล็กที่เสถียรกว่า โดยคงสัญญา {{pydantic}} output schema เดิมไว้\n2. **Feature Flag (`ENABLE_HYDE`, `MODEL_TIER_SMALL_ONLY`, `DISABLE_WRITE_TOOLS`)**: ลดระดับความสามารถบางส่วน (Graceful Degradation) เพื่อลดต้นทุนหรือจำกัดพื้นที่โจมตี โดยที่ผู้ใช้ยังถาม FAQ หลักได้\n3. **Kill-Switch (`AI_KILL_SWITCH=true`)**: สวิตช์ตัดไฟระดับระบบที่หยุดการส่งคำขอออกไปยัง LLM ภายนอก 100% แล้วคืนคำตอบปลอดภัยแบบ static/search-only ใช้เมื่อพบ **PII รั่วไหล** หรือต้นทุนพุ่งคุมไม่อยู่",
      ],
      analogy:
        "เหมือนระบบไฟฟ้าในอาคารที่มี 3 ระดับ: (1) เครื่องปั่นไฟสำรอง (Fallback Model), (2) ปิดแอร์บางชั้นเพื่อลดโหลด (Feature Flag) และ (3) คัตเอาต์เมนตัดไฟทั้งตึกเมื่อไฟช็อต (Kill-Switch)",
      code: {
        language: "python",
        filename: "runtime_controls.py",
        code: `from pydantic import BaseModel


class RuntimeControls(BaseModel):
    use_fallback_model: bool = False
    model_tier_small_only: bool = False
    disable_write_tools: bool = False
    strict_guardrail_mode: bool = False
    ai_kill_switch: bool = False


def controls_for_incident(incident_type: str, severity: str, pii_leak: bool) -> RuntimeControls:
    if pii_leak:
        return RuntimeControls(
            disable_write_tools=True,
            strict_guardrail_mode=True,
            ai_kill_switch=True,
        )
    if incident_type == "provider_outage" and severity in ("SEV-1", "SEV-2"):
        return RuntimeControls(use_fallback_model=True)
    if incident_type == "cost_spike" and severity in ("SEV-1", "SEV-2"):
        return RuntimeControls(model_tier_small_only=True)
    if incident_type == "prompt_injection" and severity in ("SEV-1", "SEV-2"):
        return RuntimeControls(disable_write_tools=True, strict_guardrail_mode=True)
    return RuntimeControls()`,
        caption: "แมปประเภทเหตุการณ์เข้ากับสวิตช์ควบคุมรันไทม์แบบ Fail-Closed โดยเฉพาะเมื่อพบ PII รั่วไหล",
      },
      whyTitle: "Why this matters — สวิตช์ที่ไม่ได้ทดสอบตอนปกติจะพังตอนเกิดเหตุจริง",
      whyParagraphs: [
        "Google SRE เน้นย้ำว่า Fallback หรือ Kill-Switch ที่ไม่เคยซ้อมรันใน staging มักพังด้วยบั๊กเล็ก ๆ (เช่น env var ชื่อผิด หรือ schema โมเดลสำรองไม่ตรง) จึงต้องมีเทสต์อัตโนมัติยืนยันการทำงานของสวิตช์เหล่านี้ทุกครั้ง",
      ],
    },
    {
      id: "comms-and-postmortem",
      title: "4 · การสื่อสารระหว่างเหตุการณ์และ Blameless Postmortem (Google SRE)",
      paragraphs: [
        "ตามบท *Managing Incidents* ของ **Google SRE Book** เมื่อเกิด SEV-1/SEV-2 ต้องแบ่งบทบาทชัดไม่ให้ทุกคนวิ่งชนกัน: **Incident Commander (IC)** คุมภาพรวมและตัดสินใจ, **Operations Lead** ลงมือแก้/สับสวิตช์ และ **Communications Lead** อัปเดตสถานะให้ผู้เกี่ยวข้องทุก 15–30 นาที โดยระบุ 4 อย่างเสมอ: *เกิดอะไรขึ้น, ใครได้รับผลกระทบ, กำลังทำอะไรเพื่อบรรเทา และจะอัปเดตอีกครั้งกี่โมง* (ห้ามเปิดเผย stack trace, secret หรือข้อมูลลูกค้า)",
        "เมื่อระบบกลับมาเสถียรแล้ว ภายใน 48 ชั่วโมงให้จัดทำ **Blameless Postmortem** — วัฒนธรรม 'ไม่กล่าวโทษตัวบุคคล' ตั้งสมมติฐานว่าวิศวกรทุกคนตัดสินใจดีที่สุดตามข้อมูลและเครื่องมือที่มีในตอนนั้น เราจึงไม่เขียนว่า *'นาย ก. เผลอแก้ prompt ผิด'* แต่เขียนว่า *'CI ขาด regression gate สำหรับ token limit และระบบไม่มี max_output_tokens cap'* พร้อมกำหนด Action Items ที่มีเจ้าของและวันเสร็จชัดเจน — และสำหรับระบบ AI ทุก Postmortem ต้องเพิ่ม **อย่างน้อย 1 เคสทดสอบใหม่** เข้าสู่ {{golden-dataset}} และ {{promptfoo}} suite เสมอ",
      ],
      analogy:
        "เหมือนการสอบสวนอุบัติเหตุทางการบินของ NTSB: เป้าหมายไม่ใช่การด่าหรือไล่นักบินออก แต่คือการแก้แผงควบคุมและเช็กลิสต์เพื่อไม่ให้เครื่องบินลำไหนเจออุบัติเหตุซ้ำได้อีก",
      bullets: [
        "**Comms Template (4 บรรทัด)**: Status + Impact + Current Mitigation + Next Update ETA",
        "**Blameless Language**: ใช้ภาษาเชิงข้อเท็จจริงและระบบ เช่น 'deployment ขาด guardrail check' แทน 'พนักงานลืมเช็ก'",
        "**Feedback to Evals**: ปิดวงจร AI Loop โดยเปลี่ยน incident payload (ที่ลบ PII แล้ว) เป็น regression case ใน `promptfooconfig.yaml`",
      ],
      whyTitle: "Why this matters — ทีมที่กล่าวโทษคนจะซ่อนปัญหา ส่วนทีมที่ทำ Blameless Postmortem จะแข็งแกร่งขึ้นทุกครั้งที่ล้ม",
      whyParagraphs: [
        "หากวิศวกรกลัวถูกตำหนิเมื่อเปิดเผยปัญหา พวกเขาจะลังเลในการแจ้งเหตุ PII รั่วหรือต้นทุนพุ่ง ทำให้ความเสียหายบานปลาย วัฒนธรรม Blameless ทำให้รายงานเหตุเกิดเร็ว แก้ไว และป้องกันซ้ำได้อย่างยั่งยืน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ AI Incident Runbook กับ Backend/SRE On-Call Playbook",
      body: [
        "หากคุณเคยอยู่เวร On-Call ให้ระบบเว็บหรือ REST API โครงสร้าง Runbook และ SEV-1/2/3 คือมาตรฐาน SRE เดิม เพิ่มเพียงมิติเฉพาะของ LLM คือ **Token Cost** และ **Prompt Injection / PDPA**:",
      ],
      table: [
        ["Provider Outage (`RUNBOOK-01`)", "Upstream Payment/DB Outage + Circuit Breaker Fallback"],
        ["Cost Spike (`RUNBOOK-02`)", "Runaway Autoscaling / Infinite Retry Storm + Rate Limit"],
        ["Prompt Injection / PII Leak (`RUNBOOK-03`)", "WAF Attack Spike / Data Exposure + Kill-Switch & DPO Alert"],
        ["Promptfoo Regression Case จาก Postmortem", "Unit/Integration Regression Test หลังแก้ Bug Production"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม 'Blameless' ไม่ได้แปลว่า 'ไม่มีความรับผิดชอบ'",
      body: [
        "หลายคนเข้าใจผิดว่า Blameless Postmortem แปลว่าใครทำพังก็ปล่อยผ่านไปเฉย ๆ ความจริงแล้วตรงกันข้ามครับ: ทุกคนต้องรับผิดชอบร่วมกันในการ **ปรับปรุงระบบให้กันความผิดพลาดของมนุษย์ได้** (เช่น ใส่ schema validation, ใส่เพดานต้นทุน, เพิ่ม CI test)",
        "เพราะมนุษย์ทุกคนมีวันเหนื่อยและเผลอพลาดได้เสมอ ระบบที่ดีจึงไม่ฝากความปลอดภัยไว้กับความจำของคน แต่ฝากไว้กับ automated guardrails และ runbook ที่ทดสอบได้ครับ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง `incident_router.py` ที่รับภาพรวมสัญญาณจาก Dashboard (Day 135) แล้วตัดสินระดับความรุนแรง, จับคู่ Runbook, เลือกช่องแจ้งเตือน และแนะนำสวิตช์หยุดความเสียหายแบบ deterministic 100%",
    steps: [
      {
        title: "1 · นิยาม Pydantic Schema สำหรับสัญญาณ Dashboard (`TelemetrySnapshot`) และผลตัดสิน (`IncidentDecision`)",
        explain:
          "บังคับขอบเขตค่าที่ถูกต้อง (`ge=0`, `le=1.0`) ตั้งแต่ขอบระบบ ({{fail-fast}}) เพื่อให้แน่ใจว่าข้อมูลเพี้ยนจาก monitoring จะไม่ถูกตีความผิด",
        code: {
          language: "python",
          filename: "worked_incident_router.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field

Severity = Literal["NONE", "SEV-3", "SEV-2", "SEV-1"]
IncidentType = Literal["none", "provider_outage", "cost_spike", "prompt_injection"]
AlertChannel = Literal["none", "ticket-backlog", "slack-ai-oncall", "pager-sev1"]


class TelemetrySnapshot(BaseModel):
    service: str = Field(min_length=1)
    window_minute: int = Field(ge=0)
    sample_count: int = Field(ge=0)
    consecutive_windows: int = Field(ge=0)
    p95_ms: float = Field(ge=0.0)
    error_rate: float = Field(ge=0.0, le=1.0)
    cost_per_request_thb: float = Field(ge=0.0)
    guardrail_block_rate: float = Field(ge=0.0, le=1.0)
    pii_leak_detected: bool = False


class IncidentDecision(BaseModel):
    severity: Severity
    primary_incident: IncidentType
    matched_incidents: list[str]
    runbook_id: str | None
    route_channel: AlertChannel
    mitigation_steps: list[str]
    suppressed_as_noise: bool = False`,
        },
      },
      {
        title: "2 · เขียนตัวจำแนกและจัดเส้นทางแจ้งเตือน (`classify_and_route_incident`)",
        explain:
          "ตรวจ PII leak ก่อนเป็นอันดับแรก (ไม่รอ sample/window gate), กรอง noise เมื่อข้อมูลไม่พอ, ประเมินทั้ง 3 Runbook และเลือกความรุนแรงสูงสุดพร้อมลำดับ tie-break ที่ชัดเจน",
        code: {
          language: "python",
          filename: "worked_incident_router.py",
          code: `SEV_RANK = {"NONE": 0, "SEV-3": 1, "SEV-2": 2, "SEV-1": 3}
TYPE_PRIORITY = {"prompt_injection": 3, "provider_outage": 2, "cost_spike": 1}

RUNBOOKS = {
    "provider_outage": "RUNBOOK-01-PROVIDER-OUTAGE",
    "cost_spike": "RUNBOOK-02-COST-SPIKE",
    "prompt_injection": "RUNBOOK-03-PROMPT-INJECTION",
}

CHANNELS: dict[str, AlertChannel] = {
    "NONE": "none",
    "SEV-3": "ticket-backlog",
    "SEV-2": "slack-ai-oncall",
    "SEV-1": "pager-sev1",
}

MITIGATIONS = {
    "provider_outage": [
        "Trip circuit breaker for degraded primary LLM provider",
        "Flip LLM_FALLBACK_MODEL feature flag to backup model",
        "Verify error_rate < 0.02 and p95_ms <= 1200 for 5 consecutive minutes",
    ],
    "cost_spike": [
        "Enable MODEL_TIER_SMALL_ONLY=true and cap MAX_OUTPUT_TOKENS=256",
        "Tighten per-tenant rate limit and disable multi-query/HyDE transforms",
        "Verify cost_per_request_thb <= 0.25 on Langfuse dashboard",
    ],
    "prompt_injection": [
        "Enable STRICT_GUARDRAIL_MODE=true and set DISABLE_WRITE_TOOLS=true",
        "Inspect masked request_id traces without pasting raw PII into chat",
        "Add sanitized attack payload to Promptfoo security suite",
    ],
}


def classify_and_route_incident(
    snap: TelemetrySnapshot,
    min_samples: int = 20,
    min_windows: int = 2,
) -> IncidentDecision:
    if snap.pii_leak_detected:
        return IncidentDecision(
            severity="SEV-1",
            primary_incident="prompt_injection",
            matched_incidents=["prompt_injection"],
            runbook_id=RUNBOOKS["prompt_injection"],
            route_channel="pager-sev1",
            mitigation_steps=[
                "Activate AI_KILL_SWITCH=true to halt external LLM egress immediately",
                "Rotate affected credentials and notify DPO under PDPA timeline",
                "Inspect canary/redactor regression in isolated audit log",
            ],
            suppressed_as_noise=False,
        )

    candidates: list[tuple[str, Severity]] = []

    if snap.error_rate >= 0.25 or snap.p95_ms >= 4000:
        candidates.append(("provider_outage", "SEV-1"))
    elif snap.error_rate >= 0.05 or snap.p95_ms > 1200:
        candidates.append(("provider_outage", "SEV-2"))
    elif snap.error_rate >= 0.02:
        candidates.append(("provider_outage", "SEV-3"))

    if snap.cost_per_request_thb >= 1.00:
        candidates.append(("cost_spike", "SEV-1"))
    elif snap.cost_per_request_thb >= 0.50:
        candidates.append(("cost_spike", "SEV-2"))
    elif snap.cost_per_request_thb >= 0.30:
        candidates.append(("cost_spike", "SEV-3"))

    if snap.guardrail_block_rate >= 0.25:
        candidates.append(("prompt_injection", "SEV-1"))
    elif snap.guardrail_block_rate >= 0.10:
        candidates.append(("prompt_injection", "SEV-2"))
    elif snap.guardrail_block_rate >= 0.05:
        candidates.append(("prompt_injection", "SEV-3"))

    if not candidates:
        return IncidentDecision(
            severity="NONE",
            primary_incident="none",
            matched_incidents=[],
            runbook_id=None,
            route_channel="none",
            mitigation_steps=[],
            suppressed_as_noise=False,
        )

    if snap.sample_count < min_samples or snap.consecutive_windows < min_windows:
        return IncidentDecision(
            severity="NONE",
            primary_incident="none",
            matched_incidents=[],
            runbook_id=None,
            route_channel="none",
            mitigation_steps=[],
            suppressed_as_noise=True,
        )

    candidates.sort(key=lambda item: (SEV_RANK[item[1]], TYPE_PRIORITY[item[0]]), reverse=True)
    primary_type, top_sev = candidates[0]
    return IncidentDecision(
        severity=top_sev,
        primary_incident=primary_type,  # type: ignore[arg-type]
        matched_incidents=[name for name, _ in candidates],
        runbook_id=RUNBOOKS[primary_type],
        route_channel=CHANNELS[top_sev],
        mitigation_steps=list(MITIGATIONS[primary_type]),
        suppressed_as_noise=False,
    )`,
        },
      },
      {
        title: "3 · ทดลองจำแนก 4 สถานการณ์จริง (ปกติ, สัญญาณรบกวน, Outage หนัก และเหตุซ้อน Cost + Injection)",
        explain:
          "รันเทียบผลลัพธ์จาก 4 สแนปชอตเพื่อเห็นการทำงานของ noise filter, priority tie-breaker และ PII bypass",
        code: {
          language: "python",
          filename: "worked_incident_router.py",
          code: `scenarios = [
    ("healthy", TelemetrySnapshot(
        service="thai-rag-api", window_minute=10, sample_count=60, consecutive_windows=2,
        p95_ms=780.0, error_rate=0.005, cost_per_request_thb=0.18, guardrail_block_rate=0.01,
    )),
    ("single_window_blip", TelemetrySnapshot(
        service="thai-rag-api", window_minute=11, sample_count=45, consecutive_windows=1,
        p95_ms=2100.0, error_rate=0.08, cost_per_request_thb=0.19, guardrail_block_rate=0.01,
    )),
    ("provider_outage_sev1", TelemetrySnapshot(
        service="thai-rag-api", window_minute=12, sample_count=80, consecutive_windows=2,
        p95_ms=4600.0, error_rate=0.32, cost_per_request_thb=0.22, guardrail_block_rate=0.01,
    )),
    ("multi_signal_injection_and_cost", TelemetrySnapshot(
        service="thai-rag-api", window_minute=13, sample_count=90, consecutive_windows=3,
        p95_ms=950.0, error_rate=0.01, cost_per_request_thb=1.25, guardrail_block_rate=0.28,
    )),
]

for label, snap in scenarios:
    dec = classify_and_route_incident(snap)
    print(f"{label}: sev={dec.severity} primary={dec.primary_incident} channel={dec.route_channel} noise={dec.suppressed_as_noise} matched={dec.matched_incidents}")`,
        },
        output: `healthy: sev=NONE primary=none channel=none noise=False matched=[]
single_window_blip: sev=NONE primary=none channel=none noise=True matched=[]
provider_outage_sev1: sev=SEV-1 primary=provider_outage channel=pager-sev1 noise=False matched=['provider_outage']
multi_signal_injection_and_cost: sev=SEV-1 primary=prompt_injection channel=pager-sev1 noise=False matched=['prompt_injection', 'cost_spike']`,
      },
    ],
    gotcha:
      "ระวังอย่าใส่ `pii_leak_detected` ไว้หลังเงื่อนไข `sample_count < min_samples`! หากมีลูกค้าเพียง 1 คนที่เลขบัตรประชาชนหลุดออกไปใน response หรือ trace ระบบต้องปลุก SEV-1 ทันทีโดยไม่รอให้ครบ 20 คำขอ",
  },

  practice: {
    intro:
      "สร้างโมดูล `incident_router.py` ที่รวมตัวจำแนกเหตุการณ์ + Alert Router (`classify_and_route_incident`) และตัวสร้างเอกสาร Blameless Postmortem (`render_postmortem_markdown`) พร้อมทดสอบด้วย `pytest`",
    requirements: [
      "สร้าง `TelemetrySnapshot`, `IncidentDecision` และ `PostmortemDraft` ด้วย `Pydantic v2` โดยบังคับค่าขอบเขต (`sample_count >= 0`, `error_rate` และ `guardrail_block_rate` อยู่ใน `[0.0, 1.0]`, `p95_ms >= 0`, `cost_per_request_thb >= 0`)",
      "ใน `classify_and_route_incident(snap, min_samples=20, min_windows=2)`: หาก `pii_leak_detected=True` ให้คืน `SEV-1` (`RUNBOOK-03-PROMPT-INJECTION`, `pager-sev1`, มี `AI_KILL_SWITCH=true`) ทันทีโดยข้าม noise gate",
      "หากไม่พบ PII leak แต่มีสัญญาณละเมิดเกณฑ์และ `sample_count < min_samples` หรือ `consecutive_windows < min_windows` ให้คืน `severity='NONE'`, `route_channel='none'` และ `suppressed_as_noise=True`",
      "เมื่อเกิดหลายอาการพร้อมกัน ให้จัดเรียง `matched_incidents` ตาม `(severity สูงสุด, priority: prompt_injection > provider_outage > cost_spike)` และเลือกตัวแรกเป็น `primary_incident`",
      "สร้าง `render_postmortem_markdown(draft: PostmortemDraft) -> str` ที่บังคับให้มีอย่างน้อย 1 `action_items` และ 1 `new_eval_case_id` พร้อมหัวข้อ `## Incident Summary`, `## Timeline`, `## Systemic Root Cause`, `## Action Items` และ `## New Eval Regression Case` (ห้ามใช้คำกล่าวโทษบุคคลในตัวสร้างเทมเพลต)",
    ],
    starter: {
      language: "python",
      filename: "incident_router.py",
      code: `from typing import Literal
from pydantic import BaseModel, Field

Severity = Literal["NONE", "SEV-3", "SEV-2", "SEV-1"]
IncidentType = Literal["none", "provider_outage", "cost_spike", "prompt_injection"]
AlertChannel = Literal["none", "ticket-backlog", "slack-ai-oncall", "pager-sev1"]


class TelemetrySnapshot(BaseModel):
    service: str = Field(min_length=1)
    window_minute: int = Field(ge=0)
    sample_count: int = Field(ge=0)
    consecutive_windows: int = Field(ge=0)
    p95_ms: float = Field(ge=0.0)
    error_rate: float = Field(ge=0.0, le=1.0)
    cost_per_request_thb: float = Field(ge=0.0)
    guardrail_block_rate: float = Field(ge=0.0, le=1.0)
    pii_leak_detected: bool = False


class IncidentDecision(BaseModel):
    severity: Severity
    primary_incident: IncidentType
    matched_incidents: list[str]
    runbook_id: str | None
    route_channel: AlertChannel
    mitigation_steps: list[str]
    suppressed_as_noise: bool = False


class PostmortemDraft(BaseModel):
    incident_id: str = Field(min_length=4)
    severity: Literal["SEV-1", "SEV-2", "SEV-3"]
    runbook_id: str = Field(min_length=5)
    summary: str = Field(min_length=10)
    timeline: list[str] = Field(min_length=2)
    systemic_root_cause: str = Field(min_length=10)
    action_items: list[str] = Field(min_length=1)
    new_eval_case_id: str = Field(min_length=3)


def classify_and_route_incident(
    snap: TelemetrySnapshot,
    min_samples: int = 20,
    min_windows: int = 2,
) -> IncidentDecision:
    # TODO: 1) Bypass noise gate if pii_leak_detected is True -> SEV-1 + AI_KILL_SWITCH
    # TODO: 2) Evaluate provider_outage, cost_spike, prompt_injection thresholds
    # TODO: 3) Suppress as noise if sample_count < min_samples or consecutive_windows < min_windows
    # TODO: 4) Sort candidates by (severity rank, type priority) and return IncidentDecision
    raise NotImplementedError


def render_postmortem_markdown(draft: PostmortemDraft) -> str:
    # TODO: Render blameless postmortem Markdown with all 5 required sections
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "หากส่ง `pii_leak_detected=True` พร้อม `sample_count=1` และ `consecutive_windows=1` ฟังก์ชันคืน `SEV-1` และมี `AI_KILL_SWITCH=true` ทันทีใช่หรือไม่?",
      "หาก `p95_ms=2000` แต่ `sample_count=10` หรือ `consecutive_windows=1` ฟังก์ชันคืน `severity='NONE'` และ `suppressed_as_noise=True` ใช่หรือไม่?",
      "เมื่อเกิด `cost_spike` (SEV-1) พร้อม `prompt_injection` (SEV-1) ฟังก์ชันเลือก `prompt_injection` เป็น `primary_incident` และเก็บทั้งคู่ไว้ใน `matched_incidents` ใช่หรือไม่?",
      "เอกสาร Markdown จาก `render_postmortem_markdown` มีครบทั้ง 5 หัวข้อและระบุ `new_eval_case_id` ที่จะเพิ่มเข้า Promptfoo ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทั้ง 9 เคส (healthy, noise suppression, PII bypass, outage/cost/injection routing, multi-signal tie-break, postmortem markdown, invalid input rejection) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "แยกการตรวจ 3 สถานการณ์เป็นรายการ `candidates: list[tuple[str, Severity]]` ก่อน แล้วค่อยเช็ก noise gate (`sample_count < min_samples or consecutive_windows < min_windows`) เพื่อให้แยกได้ชัดระหว่าง 'ระบบปกติ' (`suppressed_as_noise=False`) กับ 'มีสัญญาณผิดปกติแต่ข้อมูลยังไม่พอ' (`suppressed_as_noise=True`)",
      },
      {
        body: "ใช้ดิกชันนารีน้ำหนัก `SEV_RANK = {'NONE': 0, 'SEV-3': 1, 'SEV-2': 2, 'SEV-1': 3}` และ `TYPE_PRIORITY = {'prompt_injection': 3, 'provider_outage': 2, 'cost_spike': 1}` แล้วเรียงด้วย `candidates.sort(key=lambda item: (SEV_RANK[item[1]], TYPE_PRIORITY[item[0]]), reverse=True)`",
      },
      {
        body: "เฉลยฉบับสมบูรณ์พร้อมชุดทดสอบ `pytest` ครบ 9 เคส (คัดลอกบันทึกเป็น `test_incident_router.py` แล้วรัน `uv run --with pytest --with pydantic pytest -v` ได้ทันที):",
        code: {
          language: "python",
          filename: "test_incident_router.py",
          code: `from typing import Literal

import pytest
from pydantic import BaseModel, Field, ValidationError

Severity = Literal["NONE", "SEV-3", "SEV-2", "SEV-1"]
IncidentType = Literal["none", "provider_outage", "cost_spike", "prompt_injection"]
AlertChannel = Literal["none", "ticket-backlog", "slack-ai-oncall", "pager-sev1"]


class TelemetrySnapshot(BaseModel):
    service: str = Field(min_length=1)
    window_minute: int = Field(ge=0)
    sample_count: int = Field(ge=0)
    consecutive_windows: int = Field(ge=0)
    p95_ms: float = Field(ge=0.0)
    error_rate: float = Field(ge=0.0, le=1.0)
    cost_per_request_thb: float = Field(ge=0.0)
    guardrail_block_rate: float = Field(ge=0.0, le=1.0)
    pii_leak_detected: bool = False


class IncidentDecision(BaseModel):
    severity: Severity
    primary_incident: IncidentType
    matched_incidents: list[str]
    runbook_id: str | None
    route_channel: AlertChannel
    mitigation_steps: list[str]
    suppressed_as_noise: bool = False


class PostmortemDraft(BaseModel):
    incident_id: str = Field(min_length=4)
    severity: Literal["SEV-1", "SEV-2", "SEV-3"]
    runbook_id: str = Field(min_length=5)
    summary: str = Field(min_length=10)
    timeline: list[str] = Field(min_length=2)
    systemic_root_cause: str = Field(min_length=10)
    action_items: list[str] = Field(min_length=1)
    new_eval_case_id: str = Field(min_length=3)


SEV_RANK: dict[str, int] = {"NONE": 0, "SEV-3": 1, "SEV-2": 2, "SEV-1": 3}
TYPE_PRIORITY: dict[str, int] = {
    "prompt_injection": 3,
    "provider_outage": 2,
    "cost_spike": 1,
}
RUNBOOKS: dict[str, str] = {
    "provider_outage": "RUNBOOK-01-PROVIDER-OUTAGE",
    "cost_spike": "RUNBOOK-02-COST-SPIKE",
    "prompt_injection": "RUNBOOK-03-PROMPT-INJECTION",
}
CHANNELS: dict[str, AlertChannel] = {
    "NONE": "none",
    "SEV-3": "ticket-backlog",
    "SEV-2": "slack-ai-oncall",
    "SEV-1": "pager-sev1",
}
MITIGATIONS: dict[str, list[str]] = {
    "provider_outage": [
        "Trip circuit breaker for degraded primary LLM provider",
        "Flip LLM_FALLBACK_MODEL feature flag to backup model",
        "Verify error_rate < 0.02 and p95_ms <= 1200 for 5 consecutive minutes",
    ],
    "cost_spike": [
        "Enable MODEL_TIER_SMALL_ONLY=true and cap MAX_OUTPUT_TOKENS=256",
        "Tighten per-tenant rate limit and disable multi-query/HyDE transforms",
        "Verify cost_per_request_thb <= 0.25 on Langfuse dashboard",
    ],
    "prompt_injection": [
        "Enable STRICT_GUARDRAIL_MODE=true and set DISABLE_WRITE_TOOLS=true",
        "Inspect masked request_id traces without pasting raw PII into chat",
        "Add sanitized attack payload to Promptfoo security suite",
    ],
}


def classify_and_route_incident(
    snap: TelemetrySnapshot,
    min_samples: int = 20,
    min_windows: int = 2,
) -> IncidentDecision:
    if min_samples < 1 or min_windows < 1:
        raise ValueError("min_samples and min_windows must be >= 1")

    if snap.pii_leak_detected:
        return IncidentDecision(
            severity="SEV-1",
            primary_incident="prompt_injection",
            matched_incidents=["prompt_injection"],
            runbook_id=RUNBOOKS["prompt_injection"],
            route_channel="pager-sev1",
            mitigation_steps=[
                "Activate AI_KILL_SWITCH=true to halt external LLM egress immediately",
                "Rotate affected credentials and notify DPO under PDPA timeline",
                "Inspect canary/redactor regression in isolated audit log",
            ],
            suppressed_as_noise=False,
        )

    candidates: list[tuple[IncidentType, Severity]] = []

    if snap.error_rate >= 0.25 or snap.p95_ms >= 4000:
        candidates.append(("provider_outage", "SEV-1"))
    elif snap.error_rate >= 0.05 or snap.p95_ms > 1200:
        candidates.append(("provider_outage", "SEV-2"))
    elif snap.error_rate >= 0.02:
        candidates.append(("provider_outage", "SEV-3"))

    if snap.cost_per_request_thb >= 1.00:
        candidates.append(("cost_spike", "SEV-1"))
    elif snap.cost_per_request_thb >= 0.50:
        candidates.append(("cost_spike", "SEV-2"))
    elif snap.cost_per_request_thb >= 0.30:
        candidates.append(("cost_spike", "SEV-3"))

    if snap.guardrail_block_rate >= 0.25:
        candidates.append(("prompt_injection", "SEV-1"))
    elif snap.guardrail_block_rate >= 0.10:
        candidates.append(("prompt_injection", "SEV-2"))
    elif snap.guardrail_block_rate >= 0.05:
        candidates.append(("prompt_injection", "SEV-3"))

    if not candidates:
        return IncidentDecision(
            severity="NONE",
            primary_incident="none",
            matched_incidents=[],
            runbook_id=None,
            route_channel="none",
            mitigation_steps=[],
            suppressed_as_noise=False,
        )

    if snap.sample_count < min_samples or snap.consecutive_windows < min_windows:
        return IncidentDecision(
            severity="NONE",
            primary_incident="none",
            matched_incidents=[],
            runbook_id=None,
            route_channel="none",
            mitigation_steps=[],
            suppressed_as_noise=True,
        )

    candidates.sort(
        key=lambda item: (SEV_RANK[item[1]], TYPE_PRIORITY[item[0]]),
        reverse=True,
    )
    primary_type, top_sev = candidates[0]
    return IncidentDecision(
        severity=top_sev,
        primary_incident=primary_type,
        matched_incidents=[name for name, _ in candidates],
        runbook_id=RUNBOOKS[primary_type],
        route_channel=CHANNELS[top_sev],
        mitigation_steps=list(MITIGATIONS[primary_type]),
        suppressed_as_noise=False,
    )


def render_postmortem_markdown(draft: PostmortemDraft) -> str:
    timeline_md = "\\n".join(f"- {entry}" for entry in draft.timeline)
    actions_md = "\\n".join(f"- [ ] {item}" for item in draft.action_items)
    return (
        f"# Blameless Postmortem: {draft.incident_id} ({draft.severity})\\n\\n"
        f"**Runbook Executed:** \`{draft.runbook_id}\`\\n\\n"
        f"## Incident Summary\\n{draft.summary}\\n\\n"
        f"## Timeline\\n{timeline_md}\\n\\n"
        f"## Systemic Root Cause\\n{draft.systemic_root_cause}\\n\\n"
        f"## Action Items\\n{actions_md}\\n\\n"
        f"## New Eval Regression Case\\n"
        f"- Added sanitized regression case \`{draft.new_eval_case_id}\` to Promptfoo & Golden Dataset.\\n"
    )


# --- pytest suite (9 tests) ---


def _snap(**overrides: object) -> TelemetrySnapshot:
    base: dict[str, object] = {
        "service": "thai-rag-api",
        "window_minute": 10,
        "sample_count": 60,
        "consecutive_windows": 2,
        "p95_ms": 750.0,
        "error_rate": 0.005,
        "cost_per_request_thb": 0.18,
        "guardrail_block_rate": 0.01,
        "pii_leak_detected": False,
    }
    base.update(overrides)
    return TelemetrySnapshot.model_validate(base)


def test_healthy_snapshot_returns_none_without_suppression() -> None:
    dec = classify_and_route_incident(_snap())
    assert dec.severity == "NONE"
    assert dec.primary_incident == "none"
    assert dec.runbook_id is None
    assert dec.route_channel == "none"
    assert dec.suppressed_as_noise is False


def test_suppresses_low_volume_or_single_window_blip() -> None:
    low_n = classify_and_route_incident(_snap(sample_count=12, p95_ms=2500.0))
    one_win = classify_and_route_incident(_snap(consecutive_windows=1, error_rate=0.30))
    for dec in (low_n, one_win):
        assert dec.severity == "NONE"
        assert dec.route_channel == "none"
        assert dec.suppressed_as_noise is True


def test_pii_leak_bypasses_noise_gate_with_kill_switch() -> None:
    dec = classify_and_route_incident(
        _snap(sample_count=1, consecutive_windows=1, pii_leak_detected=True)
    )
    assert dec.severity == "SEV-1"
    assert dec.primary_incident == "prompt_injection"
    assert dec.runbook_id == "RUNBOOK-03-PROMPT-INJECTION"
    assert dec.route_channel == "pager-sev1"
    assert dec.suppressed_as_noise is False
    assert any("AI_KILL_SWITCH=true" in step for step in dec.mitigation_steps)


def test_provider_outage_sev1_and_sev2_boundaries() -> None:
    sev1 = classify_and_route_incident(_snap(error_rate=0.25, p95_ms=900.0))
    assert sev1.severity == "SEV-1"
    assert sev1.runbook_id == "RUNBOOK-01-PROVIDER-OUTAGE"
    assert sev1.route_channel == "pager-sev1"

    sev2 = classify_and_route_incident(_snap(error_rate=0.01, p95_ms=1450.0))
    assert sev2.severity == "SEV-2"
    assert sev2.runbook_id == "RUNBOOK-01-PROVIDER-OUTAGE"
    assert sev2.route_channel == "slack-ai-oncall"


def test_cost_spike_tiers_route_to_expected_channels() -> None:
    sev3 = classify_and_route_incident(_snap(cost_per_request_thb=0.35))
    assert (sev3.severity, sev3.route_channel, sev3.runbook_id) == (
        "SEV-3",
        "ticket-backlog",
        "RUNBOOK-02-COST-SPIKE",
    )
    sev2 = classify_and_route_incident(_snap(cost_per_request_thb=0.60))
    assert (sev2.severity, sev2.route_channel) == ("SEV-2", "slack-ai-oncall")
    sev1 = classify_and_route_incident(_snap(cost_per_request_thb=1.10))
    assert (sev1.severity, sev1.route_channel) == ("SEV-1", "pager-sev1")


def test_multi_signal_tie_breaks_security_over_outage_and_cost() -> None:
    dec = classify_and_route_incident(
        _snap(cost_per_request_thb=1.20, error_rate=0.30, guardrail_block_rate=0.28)
    )
    assert dec.severity == "SEV-1"
    assert dec.primary_incident == "prompt_injection"
    assert dec.matched_incidents == ["prompt_injection", "provider_outage", "cost_spike"]


def test_higher_severity_wins_over_type_priority() -> None:
    dec = classify_and_route_incident(
        _snap(cost_per_request_thb=1.15, guardrail_block_rate=0.06)
    )
    assert dec.severity == "SEV-1"
    assert dec.primary_incident == "cost_spike"
    assert dec.matched_incidents == ["cost_spike", "prompt_injection"]


def test_render_postmortem_markdown_includes_all_blameless_sections() -> None:
    draft = PostmortemDraft(
        incident_id="INC-2026-042",
        severity="SEV-1",
        runbook_id="RUNBOOK-02-COST-SPIKE",
        summary="Token spend per request spiked 6x due to unbounded retry loop on timeout.",
        timeline=[
            "14:02 ICT - Alert fired after 2 consecutive windows > 1.00 THB/req",
            "14:05 ICT - Flipped MODEL_TIER_SMALL_ONLY=true and capped retries to 2",
        ],
        systemic_root_cause="HTTP client retried non-idempotent large prompts without token budget cap.",
        action_items=["Enforce max_output_tokens=256 and per-request cost ceiling in middleware"],
        new_eval_case_id="cost-retry-cap-01",
    )
    md = render_postmortem_markdown(draft)
    for heading in [
        "## Incident Summary",
        "## Timeline",
        "## Systemic Root Cause",
        "## Action Items",
        "## New Eval Regression Case",
    ]:
        assert heading in md
    assert "cost-retry-cap-01" in md


def test_invalid_snapshot_or_thresholds_rejected() -> None:
    with pytest.raises(ValidationError):
        _snap(error_rate=1.5)
    with pytest.raises(ValueError):
        classify_and_route_incident(_snap(), min_samples=0)`,
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
      title: "ตั้ง Alert โดยไม่กำหนดจำนวนตัวอย่างขั้นต่ำ (`sample_count`) และหน้าต่างต่อเนื่อง",
      symptom:
        "ตอนตีสามมีคำขอเข้ามาเพียง 2 รายการและช้า 1 รายการ ทำให้ P95 พุ่งเกินเพดานและปลุก On-Call ทั้งที่ระบบปกติ จนทีมเริ่มปิดเสียง Alert",
      fix: "บังคับให้สัญญาณเชิงสถิติต้องมี `sample_count >= 20` และละเมิดติดกันอย่างน้อย 2 หน้าต่าง (ยกเว้นสัญญาณความเสี่ยงวิกฤตอย่าง `pii_leak_detected`)",
    },
    {
      title: "พยายามแก้โค้ดและ Deploy ใหม่ทันทีตอน SEV-1 แทนที่จะสับ Fallback หรือ Feature Flag ก่อน",
      symptom:
        "ผู้ใช้เจอ 503 หรือระบบเผาเงินต่อไปอีก 20 นาทีระหว่างรอ build และอาจแถมบั๊กใหม่เพราะเขียนโค้ดภายใต้ความกดดัน",
      fix: "ยึดหลัก Mitigate First, Debug Second ของ Google SRE: สลับ `LLM_FALLBACK_MODEL`, เปิด `MODEL_TIER_SMALL_ONLY` หรือสับ `AI_KILL_SWITCH` เพื่อหยุดผลกระทบภายใน 60 วินาทีก่อน",
    },
    {
      title: "คัดลอก Prompt หรือ Response ดิบที่ติด PII จากเหตุ Prompt Injection ไปแปะในห้องแชต Incident",
      symptom:
        "ห้องแชต Slack/Teams กลายเป็นจุดรั่วไหลข้อมูลส่วนบุคคลรอบที่สอง ละเมิด {{pdpa}} เพิ่มเติมระหว่างแก้เหตุการณ์",
      fix: "สื่อสารด้วย `request_id`, ชื่อกฎ guardrail ที่ทำงาน และตัวเลข mask count เท่านั้น ห้ามส่งข้อความดิบของผู้ใช้ลงช่องแชตสาธารณะของทีม",
    },
    {
      title: "จบ Postmortem แค่เขียนว่า 'เตือนทีมให้ระวังมากขึ้น' โดยไม่เพิ่มเคสทดสอบใน CI",
      symptom:
        "อีกสองเดือนถัดมาเมื่อมีการปรับ prompt หรืออัปเดต SDK เหตุการณ์เดิมกลับมาเกิดซ้ำอีก",
      fix: "บังคับให้ทุก Blameless Postmortem มี `new_eval_case_id` ที่เพิ่มเข้า {{golden-dataset}} และ {{promptfoo}} regression suite เพื่อป้องกันซ้ำอัตโนมัติ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d155-q1",
        "ระบบตรวจพบ `pii_leak_detected = True` จากคำขอเพียง 1 รายการในหน้าต่างที่ 1 (`sample_count = 1`, `consecutive_windows = 1`) ตัวจำแนกเหตุการณ์ควรตัดสินใจอย่างไร?",
        [
          [
            "กรองทิ้งเป็น noise (`NONE`) เพราะยังไม่ครบ 20 คำขอและ 2 หน้าต่าง",
            "ผิด — การรั่วไหลของข้อมูลส่วนบุคคล (PDPA) ยอมรับไม่ได้แม้เพียง 1 คำขอ ห้ามรอให้ครบเกณฑ์สถิติ",
          ],
          [
            "เปิดเหตุการณ์ `SEV-1` ทันที ส่งเข้า `pager-sev1` และสั่งเปิด `AI_KILL_SWITCH=true` ตาม `RUNBOOK-03-PROMPT-INJECTION`",
            "ถูกต้อง — สัญญาณ PII leak เป็นข้อยกเว้นที่ข้าม noise gate ทันทีเพื่อหยุดการรั่วไหลออกสู่ external API",
          ],
          [
            "เปิดทิกเก็ต `SEV-3` ไว้ตรวจพรุ่งนี้เช้า",
            "ช้าเกินไปมากสำหรับเหตุข้อมูลส่วนบุคคลรั่วไหล",
          ],
          [
            "คัดลอกข้อความที่มีเลขบัตรประชาชนไปถามในห้อง Slack รวมของบริษัท",
            "อันตราย — เป็นการทำให้ข้อมูลส่วนบุคคลรั่วซ้ำในช่องแชต",
          ],
        ],
        "B",
        "Noise gate (`sample_count >= 20`, `consecutive_windows >= 2`) ใช้กับสัญญาณเชิงสถิติ เช่น latency/cost แต่เหตุ PII leak ต้องยกระดับเป็น SEV-1 ทันที",
        "เหตุใด `pii_leak_detected = True` จึงต้องข้าม noise gate เสมอ?",
        "เพราะการรั่วไหลของข้อมูลส่วนบุคคลตาม PDPA เป็นความเสี่ยงวิกฤตแม้เกิดเพียง 1 คำขอ ต้องเปิด SEV-1 และสับ Kill-Switch ทันที",
      ),
      mc(
        "d155-q2",
        "เวลา 02:15 น. ผู้ให้บริการ LLM หลักตอบ 503 สูงถึง 35% (`SEV-1`) ขั้นตอนแรกที่วิศวกร On-Call ควรทำตามแนวทาง Google SRE คือข้อใด?",
        [
          [
            "เริ่มเขียน SDK wrapper ใหม่ทั้งไฟล์แล้วรอ CI/CD build 20 นาที",
            "ผิด — ช้าเกินไปและเสี่ยงเพิ่มบั๊กใหม่ขณะเกิดเหตุ",
          ],
          [
            "เปิด Circuit Breaker และสลับ Feature Flag `LLM_FALLBACK_MODEL` ไปยังโมเดลสำรองเพื่อหยุดผลกระทบต่อผู้ใช้ก่อน แล้วค่อยสืบหาต้นเหตุ",
            "ถูกต้อง — หลัก Mitigate First, Debug Second ช่วยคืนบริการได้ภายในไม่กี่สิบวินาที",
          ],
          [
            "ปิดระบบ Monitoring เพื่อไม่ให้แจ้งเตือนเด้งรบกวน",
            "การปิดตาไม่ได้แก้ปัญหาและทำให้ไม่รู้ว่าระบบฟื้นหรือยัง",
          ],
          [
            "เพิ่มจำนวน retry จาก 2 ครั้งเป็น 20 ครั้งโดยไม่ตั้ง backoff",
            "จะยิ่งซ้ำเติม retry storm และทำให้ต้นทุนและคิวงานพังหนักกว่าเดิม",
          ],
        ],
        "B",
        "Runbook ของ Provider Outage ต้องให้ความสำคัญกับการหยุดผลกระทบผ่าน Fallback Model / Circuit Breaker ก่อนการแก้โค้ดระยะยาว",
        "หลักการลำดับความสำคัญแรกสุดในช่วง SEV-1 ตาม Google SRE คืออะไร?",
        "Mitigate First, Debug Second — หยุดผลกระทบต่อผู้ใช้ด้วยสวิตช์รันไทม์ (Fallback/Feature Flag/Kill-Switch) ก่อน แล้วค่อยวิเคราะห์ต้นเหตุเชิงลึก",
      ),
      mc(
        "d155-q3",
        "เกิดเหตุพร้อมกัน 2 อาการในหน้าต่างเดียวกัน (`sample_count = 80`, `consecutive_windows = 2`): `cost_per_request_thb = 1.25` (SEV-1) และ `guardrail_block_rate = 0.28` (SEV-1) ระบบควรเลือก Runbook ใดเป็น `primary_incident`?",
        [
          [
            "`RUNBOOK-02-COST-SPIKE` เพราะเรื่องเงินสำคัญกว่าความปลอดภัยเสมอ",
            "ผิด — หากคลื่น Prompt Injection กำลังเจาะระบบ การปล่อยช่องโหว่เปิดไว้เสี่ยงความเสียหายหนักกว่าและมักเป็นต้นเหตุให้ต้นทุนพุ่งด้วย",
          ],
          [
            "`RUNBOOK-03-PROMPT-INJECTION` เป็นหลัก และบันทึกทั้ง `['prompt_injection', 'cost_spike']` ไว้ใน `matched_incidents`",
            "ถูกต้อง — เมื่อความรุนแรงเท่ากัน ลำดับความสำคัญคือ `prompt_injection > provider_outage > cost_spike` โดยยังคงรายงานทุกอาการที่ตรวจพบ",
          ],
          [
            "คืนค่า `NONE` เพราะระบบเลือกไม่ได้ระหว่างสองอาการ",
            "ห้ามเงียบเมื่อมีเหตุ SEV-1 พร้อมกันเด็ดขาด",
          ],
          [
            "สุ่มเลือก Runbook เพื่อกระจายโหลดทีม",
            "ระบบแจ้งเตือนต้อง deterministic และอิงลำดับความสำคัญที่ตกลงไว้ล่วงหน้า",
          ],
        ],
        "B",
        "การจัดลำดับความสำคัญ `prompt_injection > provider_outage > cost_spike` เมื่อระดับ SEV เท่ากัน ช่วยให้ทีมปิดช่องโหว่ความปลอดภัยก่อน พร้อมเห็นอาการร่วมทั้งหมดใน `matched_incidents`",
        "เมื่อหลายเหตุการณ์มีระดับ SEV เท่ากัน ควรจัดลำดับความสำคัญอย่างไร?",
        "`prompt_injection > provider_outage > cost_spike` และรายงานทุกเหตุการณ์ที่เข้าเกณฑ์ไว้ใน `matched_incidents`",
      ),
      mc(
        "d155-q4",
        "ข้อใดสะท้อนการเขียน **Blameless Postmortem** ตามวัฒนธรรม Google SRE ได้ถูกต้องที่สุด?",
        [
          [
            "ระบุชื่อวิศวกรที่กด merge พร้อมตักเตือนว่าคราวหน้าต้องรอบคอบกว่านี้",
            "ผิด — นี่คือการกล่าวโทษบุคคล ซึ่งไม่ได้แก้ช่องโหว่ของระบบและทำให้ทีมไม่กล้ารายงานเหตุในอนาคต",
          ],
          [
            "วิเคราะห์ช่องโหว่เชิงระบบ (เช่น ขาด token cap และไม่มี regression test), กำหนด Action Items ที่ตรวจสอบได้ และเพิ่มเคสทดสอบใหม่เข้า Promptfoo/Golden Dataset",
            "ถูกต้อง — Blameless Postmortem มุ่งปิดช่องโหว่เชิงระบบและสร้างเกราะป้องกันอัตโนมัติไม่ให้เกิดซ้ำ",
          ],
          [
            "ไม่ต้องเขียนเอกสารหากระบบกลับมาทำงานได้เองใน 10 นาที",
            "เหตุการณ์ที่หายเองได้มักกลับมาเกิดซ้ำในจังหวะที่แย่กว่าหากไม่สรุปบทเรียน",
          ],
          [
            "เก็บ Postmortem ไว้ดูคนเดียวเพื่อไม่ให้ทีมอื่นรู้ว่าระบบเคยล่ม",
            "Postmortem มีคุณค่าเมื่อแบ่งปันบทเรียนภายในองค์กรอย่างโปร่งใส",
          ],
        ],
        "B",
        "Blameless Postmortem เปลี่ยนทุกเหตุขัดข้องให้เป็นการปรับปรุงระบบและชุดทดสอบอัตโนมัติใน CI",
        "ผลลัพธ์บังคับของ Blameless Postmortem สำหรับระบบ AI ที่ช่วยป้องกันเหตุซ้ำคืออะไร?",
        "Action Items เชิงระบบที่มีเจ้าของชัดเจน และอย่างน้อย 1 เคสทดสอบใหม่ (ที่ลบ PII แล้ว) ใน Golden Dataset / Promptfoo CI Gate",
      ),
    ],
  },

  takeaways: [
    "**แปลงสัญญาณ Dashboard (Day 135) เป็นเกณฑ์ SEV-1 / SEV-2 / SEV-3 แบบมี Noise Gate** (`sample_count >= 20`, `consecutive_windows >= 2`) ยกเว้น `pii_leak_detected` ที่ต้องปลุก SEV-1 ทันที",
    "**มี Runbook เฉพาะทางครบ 3 สถานการณ์**: Provider Outage (`RUNBOOK-01`), Cost Spike (`RUNBOOK-02`) และ Prompt Injection / PII Leak (`RUNBOOK-03`)",
    "**Mitigate First, Debug Second**: เตรียม Fallback Model, Feature Flag และ Kill-Switch ที่ทดสอบแล้ว เพื่อให้หยุดผลกระทบได้ภายใน 60 วินาที",
    "**Blameless Postmortem ปิดวงจร AI Loop**: แก้ที่ระบบ ไม่กล่าวโทษบุคคล และนำทุกเหตุการณ์จริง (ที่ลบ PII แล้ว) ไปสร้างเคส regression ใหม่ใน Promptfoo และเตรียมพร้อมสู่ **Day 156 Phase 5 Checkpoint**",
  ],

  reviewCards: [
    rc(
      "d155-rc1",
      "สัญญาณหลัก 4 ตัวจาก Dashboard (Day 135) ที่ใช้เปิด AI Incident Runbook มีอะไรบ้าง?",
      "1) `p95_ms` (tail latency), 2) `error_rate` (5xx/timeout), 3) `cost_per_request_thb` (ต้นทุนต่อคำขอ) และ 4) `guardrail_block_rate` (คู่กับ `pii_leak_detected`)",
    ),
    rc(
      "d155-rc2",
      "ความต่างระหว่าง Fallback Model, Feature Flag และ Kill-Switch ตอนเกิดเหตุคืออะไร?",
      "Fallback Model สลับไปโมเดลสำรองเมื่อปลายทางล่ม; Feature Flag ปิดฟีเจอร์สิ้นเปลือง/เสี่ยง (เช่น HyDE, write tools) เพื่อลดโหลด; Kill-Switch ตัดการส่งออก external LLM 100% เมื่อพบ PII รั่วหรือต้นทุนคุมไม่อยู่",
    ),
    rc(
      "d155-rc3",
      "ระหว่างเกิดเหตุ SEV-1 ควรแบ่งบทบาททีมตาม Google SRE อย่างไร และสื่อสารอะไรบ้าง?",
      "แบ่งเป็น Incident Commander (IC), Operations Lead และ Communications Lead — อัปเดตทุก 15–30 นาทีด้วย 4 ข้อมูล: สถานะ, ผลกระทบ, การบรรเทาปัจจุบัน และเวลาอัปเดตครั้งถัดไป (ห้ามหลุด PII/internals)",
    ),
    rc(
      "d155-rc4",
      "Blameless Postmortem ของระบบ AI ต้องจบลงด้วย Action Item สำคัญอะไรเสมอ?",
      "การปิดช่องโหว่เชิงระบบ (เช่น เพดาน token/retry/circuit breaker) และเพิ่มเคส regression ใหม่ที่ลบ PII แล้วเข้าสู่ Golden Dataset และ Promptfoo CI Gate",
    ),
  ],

  sources: [
    {
      label: "Google SRE Book · Chapter 14: Managing Incidents",
      href: "https://sre.google/sre-book/managing-incidents/",
    },
    {
      label: "Google SRE Book · Chapter 15: Postmortem Culture: Learning from Failure",
      href: "https://sre.google/sre-book/postmortem-culture/",
    },
    {
      label: "Google SRE Book · Chapter 13: Emergency Response",
      href: "https://sre.google/sre-book/emergency-response/",
    },
  ],

  glossary: [
    "langfuse",
    "otel",
    "circuit-breaker",
    "guardrails",
    "prompt-injection",
    "pdpa",
    "fastapi",
    "pydantic",
    "pytest",
    "structlog",
    "rate-limit",
    "exponential-backoff",
    "fail-fast",
    "golden-dataset",
    "promptfoo",
  ],
});
