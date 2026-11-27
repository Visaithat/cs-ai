import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D180 — Phase 6 / Block B45 (Final Defense & Graduation)
 * Capstone Rubric Evaluation, Live System Demo & Junior AI Engineer Interview Defense
 */
export const d180: Lesson = defineLesson({
  day: 180,
  titleTh: "Final Defense: ตรวจเกณฑ์ Capstone Rubric 4 เสาหลัก และเตรียมรับมือสัมภาษณ์งาน",
  tagline: "30 นาที · วันจบหลักสูตร 180 วัน · ตรวจรับระบบเทียบ Production-Ready Rubric และซ้อมตอบคำถามเทคนิคระดับ Junior AI Engineer",
  icon: "award",
  visual: {
    id: "capstone-rubric",
    title: "4 เสาหลัก Production-Ready Capstone Rubric",
    caption: "คลิกตรวจสอบเกณฑ์ผ่านทั้ง 4 ด้าน: Retrieval/Groundedness, Reliability/Tool Safety, Observability/Cost และ Security/PDPA",
    alt: "แผนภาพเกณฑ์ประเมิน Capstone 4 ด้านหลัก",
  },
  requiresApiKey: false,
  tools: ["pytest", "Promptfoo", "Ragas", "Langfuse", "FastAPI", "Docker"],
  graduationNote:
    "ยินดีด้วย! คุณครบ 180 วันของ Neural Path พร้อมพอร์ตโฟลิโอ 6 ชิ้นและระบบ AI ระดับ Production ที่อธิบายเหตุผลเชิงวิศวกรรมได้ทุกบรรทัด",

  bigPicture: [
    {
      node: 0,
      heading: "ปิดวงจรย้อนกลับไปตรวจรับตาม ADR-001",
      body: "วิศวกรไม่ได้วัดความสำเร็จจากจำนวนบรรทัดโค้ด แต่จากคำถามว่า *'ระบบที่ส่งมอบแก้ปัญหาใน {{adr}} ได้ครบตามเงื่อนไขและ Non-Goals หรือไม่'*",
      lessonNote: "ใน Final Defense คุณจะเชื่อมเรื่องเล่าตั้งแต่ปัญหาของ Day 157 มาจนถึงหลักฐานผลทดสอบจริงใน Day 180",
    },
    {
      node: 3,
      heading: "ผ่านการตรวจรับครบ 4 เสาหลักของ Capstone Rubric",
      body: "ระบบ AI ที่พร้อมขึ้น Production ต้องสอบผ่านพร้อมกันทั้ง 4 มิติ: คุณภาพคำตอบ ({{groundedness}}), ความเสถียรของ tool, การวัดผลต้นทุน/ความเร็ว, และความปลอดภัยข้อมูล",
      lessonNote: "วันนี้เราเขียนสคริปต์ตรวจ Capstone Rubric อัตโนมัติจากผล {{ragas}}, {{promptfoo}} และ red-team suite เพื่อให้มั่นใจว่าไม่มีจุดบอดก่อน Defense",
    },
    {
      node: 5,
      heading: "พิสูจน์ Production-Readiness ด้วย Trace และตัวเลขจริง",
      body: "ในห้องสัมภาษณ์หรือการตรวจรับงานจริง การเปิดดู trace waterfall ใน {{langfuse}} พร้อมตัวเลข P50/P95 latency และต้นทุนต่อ 1,000 คำถาม มีน้ำหนักมากกว่าสไลด์สวย ๆ หลายเท่า",
      lessonNote: "คุณจะได้ซ้อมเช็กลิสต์ Live Demo 3 นาทีที่โชว์ทั้ง happy path, edge case, และ observability ครบจบในรอบเดียว",
    },
    {
      node: 6,
      heading: "เปลี่ยนพอร์ตโฟลิโอเป็นความพร้อมสู่สายงาน AI Engineer",
      body: "วันจบหลักสูตรคือจุดเริ่มต้นของการดูแลระบบจริง — ทุกข้อผิดพลาดที่เคยเจอใน 180 วันคือต้นทุนประสบการณ์ที่คุณใช้ตอบคำถาม trade-off ในห้องสัมภาษณ์ได้ทันที",
      lessonNote: "สรุปกรอบตอบคำถามเทคนิคระดับ Junior AI Engineer และตรวจความสมบูรณ์ของผลงานทั้ง 6 ชิ้นใน GitHub ของคุณ",
    },
  ],

  objectives: [
    "**ประเมินระบบ Capstone** ของตนเองเทียบกับเกณฑ์ 4 เสาหลักของ **Production-Ready Capstone Rubric** ด้วยสคริปต์ตรวจสอบอัตโนมัติที่ระบุ blocker ชัดเจน",
    "**ลำดับขั้นตอน Live Technical Demo 3 นาที** ให้ครอบคลุมสถาปัตยกรรม, Hybrid RAG + Citations, Safe MCP + {{hitl}}, Edge Cases/PDPA และ {{langfuse}} Telemetry",
    "**อธิบายเหตุผลเชิงวิศวกรรม (Trade-off Thinking)** ตอบคำถามสัมภาษณ์ตำแหน่ง Junior AI Engineer ได้อย่างมีหลักฐานและตัวเลขรองรับ",
  ],

  prerequisites: [
    "ผ่าน Milestone 1–5 (ADR, Retrieval Benchmark, RAG+MCP+LangGraph, Eval Report, Staging Deploy + Red-Team)",
    "เตรียมผลรัน `Ragas`, `Promptfoo`, ตาราง P50/P95 latency และ Cost/1,000 queries ไว้ในรีโปแล้ว",
    "ใช้งาน `Pydantic v2` และ `pytest` ได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมตรวจสอบผลลัพธ์ทั้งหมดของ Capstone จากไฟล์รายงานและรันชุดเทสต์ Final Defense เพื่อสร้างใบสรุปความพร้อมสำหรับแปะลง `README.md`",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv run pytest -q
uv run ruff check .
git status -s`,
    steps: [
      ["tests", "รัน unit tests และ eval checks ทั้งหมดผ่านสีเขียว (`uv run pytest -q`)"],
      ["lint", "ตรวจสอบโค้ดสะอาดด้วย `uv run ruff check .` และไม่มีไฟล์ `.env` หรือข้อมูลจริงหลุดใน `git status`"],
      ["rubric", "พร้อมรันตัวตรวจ Capstone Rubric 4 เสาหลักและซ้อม Defense 3 นาที"],
    ],
    note: "อย่าลืมตรวจ `.gitignore` อีกครั้งว่าไม่มี API key, raw PII logs หรือไฟล์ `.venv` ถูก commit ขึ้น GitHub สาธารณะ",
  },

  concepts: [
    {
      id: "four-pillar-rubric",
      title: "1 · 4 เสาหลักของ Production-Ready Capstone Rubric",
      paragraphs: [
        "ความแตกต่างระหว่าง *\"เดโมแชตบอทที่ทำเสร็จในคืนเดียว\"* กับ *\"ระบบ AI ระดับ Production\"* คือระบบ Production ต้องผ่านเกณฑ์พร้อมกันทั้ง 4 เสาหลัก — ตกเสาใดเสาหนึ่งถือว่ายังไม่พร้อมขึ้นใช้งานจริง (เช่น ตอบแม่น 95% แต่หลุดเลขบัตรประชาชนลูกค้าลง log ถือว่า **ไม่ผ่าน** ทันที)",
        "เกณฑ์ผ่านทั้งหมดในหลักสูตร Neural Path ถูกออกแบบให้ตรงกับสิ่งที่ทีมวิศวกรรม AI ตัวจริงตรวจรับก่อนเปิดให้ผู้ใช้ภายนอกเข้าถึง:",
      ],
      analogy: "เหมือนใบตรวจรับความปลอดภัยของเครื่องบินก่อนขึ้นบิน — ไม่ใช่แค่เครื่องยนต์ติด (ตอบคำถามได้) แต่ระบบนำทาง (Retrieval), เบรกฉุกเฉิน (Fallback/HITL), กล่องดำ (Observability) และล็อกห้องนักบิน (Security/PDPA) ต้องผ่านพร้อมกันทุกข้อ",
      bullets: [
        "**เสาที่ 1 · Retrieval & Groundedness**: `Recall@5 >= 0.85` บนชุดทดสอบภาษาไทย 40 ข้อ, `Faithfulness >= 0.85` ({{ragas}}), และ Abstention (ตอบ *\"ไม่พบข้อมูล\"* กับคำถามนอกขอบเขต) `>= 90%`",
        "**เสาที่ 2 · Reliability & Tool Safety**: {{structured-output}} ผ่าน schema `>= 99%`, มี timeout/retry/fallback เมื่อ LLM API ล่ม, และ {{mcp}} write tool ทุกตัวผ่าน {{hitl}} confirmation gate",
        "**เสาที่ 3 · Observability & Cost**: ทุก request มี `trace_id` ครบ 100% ({{langfuse}} / {{otel}}), รายงาน P50/P95 latency และประมาณการต้นทุนต่อ 1,000 คำถามได้ชัดเจน",
        "**เสาที่ 4 · Security & PDPA**: ผ่าน red-team {{prompt-injection}} suite ({{promptfoo}}) `>= 90%`, และ {{guardrails}} ต้อง mask เลขบัตรประชาชน 13 หลัก/เบอร์โทรไทยก่อนออก external API และก่อนลง log ({{pdpa}})",
      ],
      whyTitle: "Why this matters — หลักฐานที่พูดแทนคำโฆษณา",
      whyParagraphs: [
        "ในเรซูเม่ของมือใหม่ส่วนใหญ่เขียนแค่ว่า *\"Built a RAG chatbot with LangGraph & FastAPI\"* ซึ่งแยกไม่ออกจากผู้สมัครอีก 200 คน",
        "แต่ถ้าคุณแปะตาราง Rubric 4 เสาหลักพร้อมตัวเลขจริง (`Recall@5: 0.88`, `Faithfulness: 0.91`, `Schema valid: 99.5%`, `P95: 2.8s`, `Cost: $1.40/1k queries`, `Red-team: 95%`) รีโปของคุณจะโดดเด่นทันทีใน 10 วินาทีแรกที่ผู้สัมภาษณ์เปิดดู",
      ],
    },
    {
      id: "three-minute-demo",
      title: "2 · โครงสร้าง Live Technical Demo 3 นาที (5 ช็อตจบครบทุกเสา)",
      paragraphs: [
        "ผู้สัมภาษณ์และกรรมการมีสมาธิสูงสุดใน 3 นาทีแรก อย่าเสียเวลาเล่าประวัติการติดตั้งไลบรารีหรือเปิดโชว์ไฟล์ config ทีละไฟล์ — ให้เดินเรื่องเป็น **5 ช็อตต่อเนื่อง** ที่พิสูจน์ครบทั้ง 4 เสาหลักของระบบ {{fastapi}} + {{langgraph}} + {{dockerfile}} ที่ deploy อยู่จริง",
        "เตรียม fallback recording (วิดีโอ 3 นาทีที่อัดไว้ใน Day 179) เผื่ออินเทอร์เน็ตหรือ LLM provider ล่มกลางห้องสัมภาษณ์ และเตรียมแสดงกลไก graceful degradation ของระบบให้เห็นว่าเป็นเรื่องที่ออกแบบรับมือไว้แล้ว",
      ],
      analogy: "เหมือนการฉายตัวอย่างหนังแอ็กชันความยาว 3 นาที — เปิดด้วยโจทย์และแผนผัง โชว์ฉากทำงานจริง โชว์ฉากรับมือวิกฤต แล้วปิดด้วยหน้าปัดตัวเลขพิสูจน์ผล",
      bullets: [
        "**0:00–0:30 · Problem & ADR**: เปิดแผนภาพสถาปัตยกรรม บอกโจทย์องค์กรไทยและเหตุผลหลักที่เลือก Hybrid RAG + MCP + PDPA Gate",
        "**0:30–1:00 · Happy Path RAG**: ถามคำถามภาษาไทยผสมอังกฤษที่อ้างอิงตาราง/นโยบาย → ชี้ให้เห็นคำตอบพร้อม inline citation `[doc_id#chunk]`",
        "**1:00–1:40 · MCP Lookup + HITL Gate**: เช็กสถานะใบสั่งซื้อ (read-only ทำงานทันที) เทียบกับคำสั่งเปิดทิกเก็ต/แก้ข้อมูล (หยุดรอ approval)",
        "**1:40–2:20 · Edge Cases & Security**: โชว์ 3 ช็อตสั้น — คำถามนอกเอกสาร (Abstention), ข้อความติดเลขบัตรประชาชน (ถูก mask ก่อนออก API/log), และ Prompt Injection (ถูกบล็อก)",
        "**2:20–3:00 · Traces, Evals & Cost**: เปิด {{langfuse}} trace waterfall, ตาราง CI eval gate และตัวเลข P95 latency / Cost per 1,000 queries",
      ],
      whyTitle: "Why this matters — โชว์การรับมือความล้มเหลวชนะใจวิศวกรรุ่นพี่",
      whyParagraphs: [
        "ใคร ๆ ก็โชว์ Happy Path ให้ดูสวยได้ แต่สิ่งที่ทำให้ Senior AI Engineer พยักหน้าคือตอนที่คุณจงใจป้อนคำถามที่ไม่มีในเอกสารหรือป้อนเลขบัตรประชาชน แล้วระบบจัดการได้อย่างสง่างาม",
        "การซ้อมจับเวลา 3 นาทีให้แม่นยังช่วยให้คุณคุมจังหวะการเล่าเรื่องและเปิดพื้นที่ให้ผู้สัมภาษณ์ถามเจาะลึกในส่วนที่คุณถนัด",
      ],
    },
    {
      id: "interview-defense",
      title: "3 · ตอบคำถามสัมภาษณ์ Junior AI Engineer ด้วยสูตร Decision → Evidence → Trade-off",
      paragraphs: [
        "คำถามสัมภาษณ์สาย AI Engineering ยุคใหม่แทบไม่ถามท่องจำสูตรคณิตศาสตร์ แต่จะเจาะลงไปที่ **การตัดสินใจในระบบของคุณเอง** เช่น *\"ทำไมไม่ Fine-tune แทน RAG?\"*, *\"รู้ได้อย่างไรว่าระบบไม่หลอน?\"*, หรือ *\"ถ้าผู้ใช้เพิ่มขึ้น 10 เท่า คอขวดจะไปติดที่ไหน?\"*",
        "ให้ใช้โครงสร้าง 3 ท่อนสั้น ๆ ตอบทุกคำถาม: **(1) Decision** เราเลือกอะไร, **(2) Evidence** ตัวเลขหรือข้อเท็จจริงที่พิสูจน์ (จาก benchmark/eval ของเรา), และ **(3) Trade-off & Next Step** ข้อเสียที่ยอมรับตอนนี้และจุดเปลี่ยนที่เราจะขยับสถาปัตยกรรมเมื่อสเกลโตขึ้น",
      ],
      analogy: "เหมือนแพทย์อธิบายแผนการรักษา — บอกยาที่เลือก, ผลตรวจเลือดที่ยืนยัน, และผลข้างเคียงที่เฝ้าระวังพร้อมแผนสำรอง",
      code: {
        language: "text",
        filename: "interview_defense_cheatsheet.txt",
        code: `Q1: ทำไมไม่ใช้ Fine-tuning (LoRA) แทน Hybrid RAG สำหรับเอกสารองค์กร?
- Decision: เลือก Hybrid RAG สำหรับความรู้องค์กร
- Evidence: นโยบาย/ราคาเปลี่ยนรายสัปดาห์ RAG อัปเดตเอกสารและทำ ACL filtering ได้ทันที พร้อมอ้างอิง citation เพื่อลด hallucination
- Trade-off: เสีย latency ชั้น retrieval (~200ms) และต้องคุมคุณภาพ chunking; จะพิจารณา LoRA เมื่ออยากปรับสไตล์หรือรูปแบบคำตอบเฉพาะทาง ไม่ใช่เพื่อจำข้อเท็จจริงที่เปลี่ยนบ่อย

Q2: ทำไมต้องเพิ่ม PyThaiNLP BM25 + Reranker แทนที่จะใช้ Vector Search อย่างเดียว?
- Decision: ใช้ Hybrid (PyThaiNLP BM25 + Multilingual Dense via RRF) + Cross-Encoder Rerank
- Evidence: บนชุดทดสอบ 40 ข้อภาษาไทย Dense-only พลาดรหัสใบแจ้งหนี้ (INV-2026-009) และตาราง (Recall@5 ~0.70) แต่ Hybrid+Rerank ดันขึ้นเกิน 0.85
- Trade-off: เพิ่มความซับซ้อนของ index และ latency ~180ms ซึ่งยังอยู่ในงบ P95 <= 3.5s

Q3: ถ้า LLM API ล่มกลางคัน หรือถูก Prompt Injection ระบบคุณรับมืออย่างไร?
- Decision: Defense-in-depth — timeout/retry/fallback ระดับ client + PDPA/guardrails middleware + least-privilege MCP + HITL write gate
- Evidence: ทดสอบ fault injection (D177) และ Promptfoo red-team pass >= 90%
- Trade-off: ผู้ใช้ต้องคลิกยืนยันเพิ่ม 1 ขั้นตอนสำหรับ write action เพื่อแลกกับการป้องกัน Excessive Agency`,
        caption: "ฝึกพูดแต่ละคำตอบให้จบภายใน 45–60 วินาที พร้อมหยิบตัวเลขจริงจากรีโปของคุณมาอ้างอิง",
      },
      whyTitle: "Why this matters — หลักฐานความเข้าใจลึกกว่าการจำทฤษฎี",
      whyParagraphs: [
        "เมื่อคุณตอบคำถามเรื่อง {{lora}} vs {{rag}} หรือ {{hallucination}} ด้วยตัวเลขที่รันเองจากเครื่องของคุณ คำตอบจะฟังดูเป็นธรรมชาติและน่าเชื่อถือกว่าการท่องสคริปต์ทั่วไปมาก",
        "ตลอด 180 วันที่ผ่านมา คุณสะสมผลงานครบ 6 ชิ้น (Async CLI, Classical ML Pipeline, Structured Extractor, Thai Hybrid RAG, Eval/Security Suite, และ Production Capstone) — ทุกชิ้นคือคลังคำตอบจริงในห้องสัมภาษณ์",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Production Readiness Review (PRR) สู่ AI Capstone Defense",
      body: [
        "ในทีมซอฟต์แวร์ระดับองค์กร ก่อนเปิด service ใหม่ขึ้น production จะมีขั้นตอน Production Readiness Review (PRR) เพื่อเช็ก SLO, Monitoring, Rollback และ Security — Capstone Rubric 4 เสาหลักคือ PRR ฉบับ AI Engineering ที่เพิ่ม Eval Gate และ PDPA/OWASP LLM เข้าไป",
      ],
      table: [
        ["Capstone Rubric 4 Pillars", "Production Readiness Review (PRR)"],
        ["Ragas + Promptfoo CI Gate", "Integration & Regression Test Suite"],
        ["Langfuse Trace + Cost/1k", "APM (Datadog/OTel) + Cloud FinOps"],
        ["PDPA Middleware + HITL Gate", "OWASP Web Security + RBAC Approval"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีเล่าโปรเจกต์ให้ดูมืออาชีพแม้ยังไม่เคยทำงานประจำ",
      body: [
        "นักศึกษาจำนวนมากกังวลว่าไม่มีประสบการณ์ทำงาน 1–2 ปีจะสู้คนอื่นไม่ได้ แต่รีโปที่มี **ADR 1 หน้า**, **ตาราง Eval Benchmark ก่อน-หลัง**, **CI Eval Gate**, และ **Incident Runbook** พิสูจน์ทักษะการทำงานจริงได้ทันที",
        "ในการสัมภาษณ์ฝึกงานหรือตำแหน่ง Junior ให้เปิดหน้า `README.md` และโชว์กราฟหรือ trace จริง พร้อมเล่าอย่างตรงไปตรงมาว่าเจอปัญหาอะไรตอนทำและแก้ด้วยวิธีไหน",
      ],
    },
  },

  workedExample: {
    intro:
      "เราจะสร้างตัวตรวจรับ Capstone Rubric อัตโนมัติด้วย `Pydantic v2` เพื่อเช็กว่าผลลัพธ์ของระบบคุณผ่านครบทั้ง 4 เสาหลักหรือยัง และมีจุดไหนที่เป็น Blocker ต้องซ่อมก่อน Defense กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · นิยามโมเดลข้อมูลและกฎตรวจรับครบ 4 เสาหลัก",
        explain:
          "แยกตัวชี้วัดเป็น 4 เสาหลักตาม `docs/curriculum.md` แล้วเขียนฟังก์ชัน `evaluate_defense` ที่คืนทั้งสถานะผ่านรายเสาและรายการ `blockers` ที่ต้องแก้",
        code: {
          language: "python",
          filename: "worked_defense.py",
          code: `from pydantic import BaseModel, Field


class CapstoneMetrics(BaseModel):
    recall_at_5: float = Field(ge=0.0, le=1.0)
    faithfulness: float = Field(ge=0.0, le=1.0)
    abstention_accuracy: float = Field(ge=0.0, le=1.0)
    schema_valid_rate: float = Field(ge=0.0, le=1.0)
    has_timeout_retry_fallback: bool
    write_tools_require_hitl: bool
    trace_id_coverage: float = Field(ge=0.0, le=1.0)
    p95_latency_ms: int = Field(gt=0)
    cost_per_1k_usd: float = Field(gt=0.0)
    red_team_pass_rate: float = Field(ge=0.0, le=1.0)
    pdpa_mask_external_api: bool
    pdpa_mask_logs: bool


def evaluate_defense(m: CapstoneMetrics) -> tuple[bool, list[str]]:
    checks = [
        (m.recall_at_5 >= 0.85, f"Recall@5={m.recall_at_5:.2f} (< 0.85)"),
        (m.faithfulness >= 0.85, f"Faithfulness={m.faithfulness:.2f} (< 0.85)"),
        (m.abstention_accuracy >= 0.90, f"Abstention={m.abstention_accuracy:.2f} (< 0.90)"),
        (m.schema_valid_rate >= 0.99, f"SchemaValid={m.schema_valid_rate:.3f} (< 0.99)"),
        (m.has_timeout_retry_fallback, "Missing timeout/retry/fallback"),
        (m.write_tools_require_hitl, "Write tools missing HITL confirmation gate"),
        (m.trace_id_coverage == 1.0, f"TraceCoverage={m.trace_id_coverage:.2f} (< 1.00)"),
        (m.red_team_pass_rate >= 0.90, f"RedTeam={m.red_team_pass_rate:.2f} (< 0.90)"),
        (m.pdpa_mask_external_api, "Missing PDPA masking before external API"),
        (m.pdpa_mask_logs, "Missing PDPA masking before logging"),
    ]
    blockers = [msg for ok, msg in checks if not ok]
    return (len(blockers) == 0, blockers)`,
        },
      },
      {
        title: "2 · ทดสอบเคสที่เกือบผ่านแต่พลาดจุดสำคัญด้าน PDPA และ Abstention",
        explain:
          "แม้ `Recall@5` และ `Faithfulness` จะสูงมาก แต่ถ้ายังปล่อย raw PII ลง log หรือตอบมั่วกับคำถามนอกขอบเขต ระบบจะถูกตีกลับพร้อมรายชื่อ Blocker ทันที",
        code: {
          language: "python",
          filename: "worked_defense.py",
          code: `draft = CapstoneMetrics(
    recall_at_5=0.89, faithfulness=0.90, abstention_accuracy=0.80,
    schema_valid_rate=0.995, has_timeout_retry_fallback=True, write_tools_require_hitl=True,
    trace_id_coverage=1.0, p95_latency_ms=2900, cost_per_1k_usd=1.45,
    red_team_pass_rate=0.92, pdpa_mask_external_api=True, pdpa_mask_logs=False,
)
passed, blockers = evaluate_defense(draft)
print("PASSED:", passed)
for b in blockers:
    print(" - BLOCKER:", b)`,
        },
        output: `PASSED: False
 - BLOCKER: Abstention=0.80 (< 0.90)
 - BLOCKER: Missing PDPA masking before logging`,
      },
      {
        title: "3 · ตรวจรับเคสที่ซ่อมครบทุก Blocker แล้ว (Ready for Graduation)",
        explain:
          "หลังเพิ่มระบบ redact PII ก่อนลง log และปรับเงื่อนไข abstention threshold ให้ผ่าน >= 0.90 ผลตรวจทั้ง 10 ข้อผ่านครบ 100%",
        code: {
          language: "python",
          filename: "worked_defense.py",
          code: `final_sub = draft.model_copy(update={"abstention_accuracy": 0.93, "pdpa_mask_logs": True})
passed, blockers = evaluate_defense(final_sub)
print(
    f"VERDICT={'PASS_PRODUCTION_READY' if passed else 'FIX'} | "
    f"Recall@5={final_sub.recall_at_5:.2f} | P95={final_sub.p95_latency_ms}ms | "
    f"Cost=\${final_sub.cost_per_1k_usd:.2f}/1k"
)`,
        },
        output: `VERDICT=PASS_PRODUCTION_READY | Recall@5=0.89 | P95=2900ms | Cost=$1.45/1k`,
      },
    ],
    gotcha:
      "จุดสังเกต: ห้ามแยกตรวจ PDPA แค่ฝั่งขาออกไป LLM API แล้วลืมฝั่ง Observability — นักพัฒนาจำนวนมาก mask ข้อความก่อนส่ง OpenAI/Anthropic แล้ว แต่ดันส่งข้อความดิบของลูกค้าลง Langfuse trace หรือ application logs เต็ม ๆ",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/capstone_rubric_evaluator.py` สำหรับตรวจเกณฑ์จบการศึกษา 4 เสาหลักของ Capstone และสร้าง Markdown Summary Card สำหรับแปะลง `README.md`",
    requirements: [
      "สร้าง Pydantic models แยกตาม 4 เสาหลัก: `RetrievalMetrics` (`recall_at_5`, `faithfulness`, `abstention_accuracy`), `ReliabilityMetrics` (`schema_valid_rate`, `has_timeout_retry_fallback`, `write_tools_require_hitl`), `ObservabilityMetrics` (`trace_id_coverage`, `p50_latency_ms`, `p95_latency_ms`, `cost_per_1k_usd`), `SecurityMetrics` (`red_team_pass_rate`, `pdpa_mask_external_api`, `pdpa_mask_logs`) และรวมใน `CapstoneSubmission` (พร้อมตรวจ `p95_latency_ms >= p50_latency_ms`)",
      "สร้างฟังก์ชัน `grade_capstone(submission: CapstoneSubmission) -> dict` ที่คืน: `pillars` (dict 4 keys: `retrieval`, `reliability`, `observability`, `security` เป็น `bool`), `passed_all` (`bool`), `blockers` (`list[str]`), และ `verdict` (`\"PASS_PRODUCTION_READY\"` หรือ `\"NEEDS_REMEDIATION\"`)",
      "เกณฑ์ผ่านต้องตรงตาม Capstone Rubric ทุกข้อ: `recall_at_5 >= 0.85`, `faithfulness >= 0.85`, `abstention_accuracy >= 0.90`, `schema_valid_rate >= 0.99`, `has_timeout_retry_fallback is True`, `write_tools_require_hitl is True`, `trace_id_coverage == 1.0`, `red_team_pass_rate >= 0.90`, `pdpa_mask_external_api is True`, `pdpa_mask_logs is True`",
      "สร้างฟังก์ชัน `format_defense_checklist(report: dict) -> str` ที่แปลงผลตรวจเป็น Markdown Checklist แสดง `[x]` / `[ ]` ของทั้ง 4 เสาหลักและแสดงรายการ blockers (ถ้ามี)",
    ],
    starter: {
      language: "python",
      filename: "src/capstone_rubric_evaluator.py",
      code: `from pydantic import BaseModel, Field, model_validator


class RetrievalMetrics(BaseModel):
    recall_at_5: float = Field(ge=0.0, le=1.0)
    faithfulness: float = Field(ge=0.0, le=1.0)
    abstention_accuracy: float = Field(ge=0.0, le=1.0)


class ReliabilityMetrics(BaseModel):
    schema_valid_rate: float = Field(ge=0.0, le=1.0)
    has_timeout_retry_fallback: bool
    write_tools_require_hitl: bool


class ObservabilityMetrics(BaseModel):
    trace_id_coverage: float = Field(ge=0.0, le=1.0)
    p50_latency_ms: int = Field(gt=0)
    p95_latency_ms: int = Field(gt=0)
    cost_per_1k_usd: float = Field(gt=0.0)

    # TODO: เพิ่ม @model_validator ตรวจว่า p95_latency_ms >= p50_latency_ms


class SecurityMetrics(BaseModel):
    red_team_pass_rate: float = Field(ge=0.0, le=1.0)
    pdpa_mask_external_api: bool
    pdpa_mask_logs: bool


class CapstoneSubmission(BaseModel):
    project_name: str = Field(min_length=3)
    retrieval: RetrievalMetrics
    reliability: ReliabilityMetrics
    observability: ObservabilityMetrics
    security: SecurityMetrics


def grade_capstone(submission: CapstoneSubmission) -> dict:
    # TODO: ตรวจทั้ง 4 เสาหลัก และคืน pillars, passed_all, blockers, verdict
    raise NotImplementedError


def format_defense_checklist(report: dict) -> str:
    # TODO: คืน Markdown checklist แสดง [x]/[ ] ของ 4 เสาหลัก + verdict + blockers
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_capstone_rubric.py",
      code: `import pytest
from pydantic import ValidationError
from src.capstone_rubric_evaluator import (
    CapstoneSubmission,
    format_defense_checklist,
    grade_capstone,
)


def _passing_payload() -> dict:
    return {
        "project_name": "thai-enterprise-ai-assistant",
        "retrieval": {
            "recall_at_5": 0.88,
            "faithfulness": 0.91,
            "abstention_accuracy": 0.94,
        },
        "reliability": {
            "schema_valid_rate": 0.995,
            "has_timeout_retry_fallback": True,
            "write_tools_require_hitl": True,
        },
        "observability": {
            "trace_id_coverage": 1.0,
            "p50_latency_ms": 1450,
            "p95_latency_ms": 2950,
            "cost_per_1k_usd": 1.40,
        },
        "security": {
            "red_team_pass_rate": 0.95,
            "pdpa_mask_external_api": True,
            "pdpa_mask_logs": True,
        },
    }


def test_passing_capstone_submission():
    sub = CapstoneSubmission.model_validate(_passing_payload())
    report = grade_capstone(sub)
    assert report["passed_all"] is True
    assert report["verdict"] == "PASS_PRODUCTION_READY"
    assert report["blockers"] == []
    assert all(report["pillars"].values())


def test_fail_when_pdpa_log_masking_missing():
    bad = _passing_payload()
    bad["security"]["pdpa_mask_logs"] = False
    report = grade_capstone(CapstoneSubmission.model_validate(bad))
    assert report["passed_all"] is False
    assert report["verdict"] == "NEEDS_REMEDIATION"
    assert report["pillars"]["security"] is False
    assert len(report["blockers"]) == 1


def test_fail_multiple_pillars_collects_all_blockers():
    bad = _passing_payload()
    bad["retrieval"]["recall_at_5"] = 0.80
    bad["reliability"]["write_tools_require_hitl"] = False
    bad["observability"]["trace_id_coverage"] = 0.85
    report = grade_capstone(CapstoneSubmission.model_validate(bad))
    assert report["pillars"]["retrieval"] is False
    assert report["pillars"]["reliability"] is False
    assert report["pillars"]["observability"] is False
    assert report["pillars"]["security"] is True
    assert len(report["blockers"]) == 3


def test_reject_p95_lower_than_p50():
    bad = _passing_payload()
    bad["observability"]["p50_latency_ms"] = 3000
    bad["observability"]["p95_latency_ms"] = 1200
    with pytest.raises(ValidationError):
        CapstoneSubmission.model_validate(bad)


def test_format_defense_checklist_renders_status():
    sub = CapstoneSubmission.model_validate(_passing_payload())
    md = format_defense_checklist(grade_capstone(sub))
    assert "PASS_PRODUCTION_READY" in md
    assert md.count("[x]") == 4
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_capstone_rubric.py` ผ่านครบทั้ง 5 test cases",
      "ป้อนตัวเลขจริงจากระบบ Capstone ของคุณลงใน `CapstoneSubmission` และเช็กว่าได้ `PASS_PRODUCTION_READY`",
      "นำผลจาก `format_defense_checklist` พร้อมตาราง latency/cost แปะลง `README.md` ของรีโป Capstone",
      "ซ้อม Live Demo 3 นาทีและตอบคำถามสัมภาษณ์ 3 ข้อหลักโดยไม่เกินเวลา",
      "ตรวจสอบพอร์ตโฟลิโอทั้ง 6 ชิ้นใน GitHub ว่ามี README, คำสั่งรัน `uv run`, และไม่มี secret รั่วไหล",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และสร้างรายงาน Capstone Rubric ที่พร้อมใช้ประกอบการ Defense จริง",
    hints: [
      {
        body: "ใน `ObservabilityMetrics` ใช้ `@model_validator(mode=\"after\")` เช็กว่า `self.p95_latency_ms >= self.p50_latency_ms` เพราะ P95 ไม่มีทางต่ำกว่าค่ามัธยฐาน (P50) ได้",
      },
      {
        body: "ใน `grade_capstone` ให้ตรวจเงื่อนไขแยกเป็น 4 กลุ่ม (`retrieval`, `reliability`, `observability`, `security`) เก็บข้อความ error ของแต่ละกลุ่มลงลิสต์ `blockers` แล้วตั้ง `pillars[name] = (len(group_errors) == 0)`",
      },
      {
        body: "โครงของ `ObservabilityMetrics` และ `grade_capstone` — เติมส่วนตรวจเสา `observability`, `security` และฟังก์ชัน `format_defense_checklist` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `class ObservabilityMetrics(BaseModel):
    trace_id_coverage: float = Field(ge=0.0, le=1.0)
    p50_latency_ms: int = Field(gt=0)
    p95_latency_ms: int = Field(gt=0)
    cost_per_1k_usd: float = Field(gt=0.0)

    @model_validator(mode="after")
    def check_latency_order(self) -> "ObservabilityMetrics":
        if self.p95_latency_ms < self.p50_latency_ms:
            raise ValueError("p95_latency_ms must be >= p50_latency_ms")
        return self


def grade_capstone(submission: CapstoneSubmission) -> dict:
    pillar_checks = {
        "retrieval": [
            (submission.retrieval.recall_at_5 >= 0.85, "Recall@5 below 0.85"),
            (submission.retrieval.faithfulness >= 0.85, "Faithfulness below 0.85"),
            (submission.retrieval.abstention_accuracy >= 0.90, "Abstention below 0.90"),
        ],
        "reliability": [
            (submission.reliability.schema_valid_rate >= 0.99, "Schema valid rate below 0.99"),
            (submission.reliability.has_timeout_retry_fallback, "Missing timeout/retry/fallback"),
            (submission.reliability.write_tools_require_hitl, "Write tools missing HITL gate"),
        ],
        # TODO: เพิ่ม "observability" และ "security"
    }
    # TODO: รวม blockers, คำนวณ pillars, passed_all และ verdict
`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_capstone_rubric.py
uv run ruff check .`,
      caption: "เก็บรันสคริปต์นี้เป็นด่านสุดท้ายใน CI ก่อนแท็ก release v1.0.0 ของ Capstone",
    },
  },

  mistakes: [
    {
      title: "โชว์เดโมเฉพาะ Happy Path โดยไม่เตรียมหลักฐาน Edge Case และ Telemetry",
      symptom: "ผู้สัมภาษณ์ถามว่า 'รู้ได้ไงว่าไม่หลอน?' หรือ 'ต่อเดือนเสียค่า API เท่าไร?' แล้วตอบได้แค่ว่า 'ลองพิมพ์ถามดูก็โอเคครับ'",
      fix: "เตรียม 5 ช็อตเดโมให้ครบทั้ง Abstention, PDPA redaction, HITL gate, และเปิดหน้าจอ {{langfuse}} / รายงาน {{promptfoo}} ให้เห็นตัวเลขจริง",
    },
    {
      title: "Mask ข้อมูล PDPA ก่อนส่ง LLM API แต่ลืม Mask ก่อนลง Trace/Logs",
      symptom: "ระบบส่งข้อความที่ mask แล้วให้ LLM แต่ middleware บันทึก request body ดิบที่มีเลขบัตรประชาชน 13 หลักลง Langfuse หรือ stdout",
      fix: "วาง PDPA PII redaction ไว้ที่ประตูหน้าสุดก่อนทั้งการ log, tracing และ outbound API call พร้อมตรวจด้วยเทสต์อัตโนมัติ",
    },
    {
      title: "ท่องคำตอบทฤษฎีโดยไม่เชื่อมกับตัวเลขจากระบบของตัวเอง",
      symptom: "อธิบายนิยาม RAG vs Fine-tuning ได้คล่อง แต่พอถูกถามว่าในโปรเจกต์ตัวเองใช้ chunk size เท่าไรและทำไม กลับตอบไม่ได้",
      fix: "ตอบด้วยสูตร Decision → Evidence (ตัวเลขจริงจาก benchmark ของคุณ) → Trade-off เสมอ และอ่านทวน `ADR-001.md` ก่อนเข้าห้องสัมภาษณ์",
    },
    {
      title: "ลืมตรวจสอบความสะอาดของ GitHub Repository ก่อนส่งสมัครงาน",
      symptom: "มีไฟล์ `.env` หลงเหลือใน git history, README ไม่มีวิธีรันบนเครื่อง, หรือ Docker build พังเมื่อคนอื่น clone ไปลอง",
      fix: "ลอง `git clone` รีโปตัวเองลงโฟลเดอร์ใหม่แล้วทำตาม README ตั้งแต่ต้นจนจบด้วย `uv` + `docker compose up` เพื่อพิสูจน์ว่าทำซ้ำได้จริง 100%",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d180-q1",
        "ระบบ Capstone ของคุณได้ `Recall@5 = 0.92`, `Faithfulness = 0.90`, `Schema = 99.6%`, `Red-team = 95%` แต่พบว่าเบอร์โทรศัพท์และเลขบัตรประชาชนไทยยังถูกบันทึกลง Langfuse trace logs โดยไม่ mask ผลการประเมินตาม Rubric คืออะไร?",
        [
          ["ผ่านระดับ Production-Ready เพราะคะแนนเฉลี่ยทั้ง 4 เสาเกิน 90% แล้ว", "ผิด — การละเมิด PDPA เป็น blocker เด็ดขาด ไม่สามารถเอาคะแนนเสาอื่นมาถัวเฉลี่ยได้"],
          ["ไม่ผ่าน (NEEDS_REMEDIATION) เพราะตกเกณฑ์เสา Security & PDPA ที่บังคับ mask PII ทั้งก่อนออก external API และก่อนลง log", "ถูก — ต้องผ่านครบทั้ง 4 เสาหลัก การรั่วข้อมูลส่วนบุคคลลง trace logs คือ blocker ที่ต้องแก้ก่อนขึ้น Production"],
          ["ผ่านแบบมีเงื่อนไข แค่ลบหน้า Langfuse dashboard ออกก็พอ", "การปิดหน้า UI ไม่ได้แก้ปัญหาการเก็บ PII โดยไม่ได้รับอนุญาตในฐานข้อมูล log"],
          ["ผ่าน เพราะ Langfuse เป็นเครื่องมือ observability ไม่ใช่ external LLM API", "ผิด — ตาม PDPA และ Capstone Rubric ข้อมูล PII ต้องถูก mask ทั้งก่อนส่ง external API และก่อนบันทึกลง log/trace"],
        ],
        "B",
        "Capstone Rubric บังคับให้ผ่านครบทั้ง 4 เสาหลัก การไม่ mask PII ก่อนลง log ถือเป็นความเสี่ยง PDPA ร้ายแรงและต้องแก้ไขก่อนผ่านเกณฑ์",
        "ใน Capstone Rubric ถ้าคะแนน Retrieval สูงมากแต่ยังหลุด PII ลง trace logs ถือว่าผ่านหรือไม่ เพราะเหตุใด?",
        "ไม่ผ่าน (NEEDS_REMEDIATION) — เสา Security & PDPA บังคับให้ mask เลขบัตรประชาชน/เบอร์โทรไทยทั้งก่อนออก external API และก่อนลง log โดยไม่สามารถเอาคะแนนเสาอื่นมาถัวได้",
      ),
      mc(
        "d180-q2",
        "ในการสัมภาษณ์ตำแหน่ง Junior AI Engineer ผู้สัมภาษณ์ถามว่า *\"ทำไมคุณถึงเลือก Hybrid RAG แทนที่จะ Fine-tune (LoRA) โมเดลด้วยเอกสารนโยบายบริษัททั้งหมด?\"* คำตอบใดสะท้อนวิธีคิดแบบ AI Engineer ดีที่สุด?",
        [
          ["เพราะ Fine-tuning ยากเกินไปและไม่มีใครใช้ใน Production แล้ว", "ไม่จริง — Fine-tuning ยังมีประโยชน์มากสำหรับปรับรูปแบบ/สไตล์/งานเฉพาะทาง แต่ไม่เหมาะกับการเก็บข้อเท็จจริงที่เปลี่ยนบ่อย"],
          ["เพราะนโยบายและข้อมูลองค์กรเปลี่ยนบ่อย RAG อัปเดตเอกสารได้ทันที ทำ ACL filtering และอ้างอิง citation เพื่อลด hallucination ได้ ส่วน LoRA จะเก็บไว้ใช้เมื่อต้องการปรับสไตล์หรือพฤติกรรมเฉพาะทาง", "ถูก — ตอบครบ Decision, เหตุผลเชิงระบบ (freshness, ACL, citations) และรู้ขอบเขตว่าเมื่อไรควรใช้ LoRA"],
          ["เพราะ RAG ทำให้ระบบไม่เกิด hallucination 100% แน่นอน", "เกินจริง — RAG ลด hallucination ได้มากแต่ไม่ได้การันตี 100% จึงยังต้องมี groundedness eval และ abstention"],
          ["เพราะ Fine-tuning ใช้กับภาษาไทยไม่ได้", "ไม่จริง — สามารถทำ LoRA กับโมเดลภาษาไทย/multilingual ได้ตามปกติ"],
        ],
        "B",
        "RAG เหมาะกับความรู้ที่เปลี่ยนแปลงบ่อย ต้องการ citation และสิทธิ์เข้าถึง (ACL) ขณะที่ Fine-tuning (LoRA) เหมาะกับการปรับสไตล์ โครงสร้าง หรือทักษะเฉพาะทาง",
        "อธิบายความต่างในการเลือกใช้ RAG vs Fine-tuning (LoRA) สำหรับเอกสารองค์กรใน 2 ประโยค",
        "ใช้ RAG เมื่อข้อมูลเปลี่ยนบ่อย ต้องการอ้างอิง citation และคุมสิทธิ์ ACL ได้ทันที; ใช้ LoRA เมื่อต้องการปรับสไตล์ พฤติกรรม หรือรูปแบบงานเฉพาะทางที่คงที่",
      ),
      mc(
        "d180-q3",
        "ในการตรวจรับเสา **Reliability & Tool Safety** ข้อใดคือเกณฑ์ที่ต้องมีครบทั้งหมดตาม Capstone Rubric?",
        [
          ["Structured output ผ่าน schema >= 99%, มี timeout/retry/fallback เมื่อ API ล่ม, และ write tool ต้องผ่าน confirmation gate", "ถูก — ครอบคลุมครบทั้งความถูกต้องของ payload, ความทนทานเมื่อผู้ให้บริการล่ม, และความปลอดภัยของเครื่องมือที่เปลี่ยนข้อมูล"],
          ["มี Docker image ขนาดเล็กกว่า 50 MB และใช้ภาษา Go แทน Python", "ไม่ได้เป็นเกณฑ์ใน Rubric — ระบบของเราใช้ Python/FastAPI + multi-stage uv Dockerfile"],
          ["ใช้โมเดลที่มีพารามิเตอร์ใหญ่ที่สุดเสมอโดยไม่ต้องมี fallback", "การพึ่งพาโมเดลใหญ่ตัวเดียวโดยไม่มี timeout/fallback เสี่ยง downtime และต้นทุนบวม"],
          ["ให้ agent ตัดสินใจแก้ไขฐานข้อมูลอัตโนมัติทุกกรณีเพื่อลดงานเจ้าหน้าที่", "ละเมิดหลัก tool safety และเสี่ยง Excessive Agency (OWASP LLM06)"],
        ],
        "A",
        "เสา Reliability & Tool Safety ตรวจ 3 เรื่องควบคู่กัน: Schema >= 99%, resilience (timeout/retry/fallback), และ Human-in-the-Loop confirmation gate สำหรับ write tools",
        "ระบุเกณฑ์ 3 ข้อในเสา Reliability & Tool Safety ของ Capstone Rubric",
        "(1) Structured output ผ่าน schema >= 99%, (2) มี timeout/retry/fallback เมื่อ API ล่ม, และ (3) write tool ทุกตัวต้องผ่าน HITL confirmation gate",
      ),
      mc(
        "d180-q4",
        "ใน Live Technical Demo ความยาว 3 นาที องค์ประกอบใดที่ควรใส่ไว้ต่อจาก Happy Path เพื่อให้เห็นความเป็น Production-Ready ชัดเจนที่สุด?",
        [
          ["การเปิดไฟล์ `pyproject.toml` อ่านชื่อไลบรารีทีละบรรทัด", "เสียเวลาและไม่สื่อถึงพฤติกรรมของระบบในสถานการณ์จริง"],
          ["การโชว์ Edge Case (Abstention, PDPA redaction, HITL write gate) ตามด้วย Trace Waterfall และตาราง Eval/Cost", "ถูก — แสดงให้เห็นทั้งความรอบคอบด้านความปลอดภัย การคุมสิทธิ์ และวินัยด้าน Observability/Cost ในเวลาจำกัด"],
          ["การพิมพ์คำถามง่าย ๆ ซ้ำกัน 10 ข้อเพื่อยืนยันว่าตอบได้เร็ว", "คำถามซ้ำ ๆ ไม่พิสูจน์ความทนทานหรือความปลอดภัยของระบบ"],
          ["การลบเทสต์ทั้งหมดแล้วแก้โค้ดสดกลางห้องสัมภาษณ์", "เสี่ยงพังโดยไม่จำเป็น — การเดโมควรเดินตามสคริปต์ที่ซ้อมและมีหลักฐานชัดเจน"],
        ],
        "B",
        "การโชว์ Edge Case (Abstention, PDPA, HITL) และปิดด้วย Trace + Eval/Cost Dashboard ทำให้ผู้ประเมินเห็นภาพครบทั้ง 4 เสาหลักภายใน 3 นาที",
        "โครงสร้าง Live Demo 3 นาที 5 ช็อตสำหรับ Capstone Defense มีลำดับอย่างไร?",
        "(1) Problem & ADR → (2) Happy Path Hybrid RAG + Citations → (3) MCP Lookup vs HITL Write Gate → (4) Edge Cases (Abstention/PDPA/Injection) → (5) Langfuse Trace & Eval/Cost Metrics",
      ),
    ],
  },

  takeaways: [
    "ระบบ Production-Ready ต้องผ่านครบทั้ง **4 เสาหลัก** (Retrieval/Groundedness, Reliability/Tool Safety, Observability/Cost, Security/PDPA) — ตกเสาใดเสาหนึ่งถือเป็น Blocker",
    "Live Demo 3 นาทีที่ทรงพลังคือการเดินครบ 5 ช็อต: ADR → Happy Path RAG → MCP/HITL → Edge Cases/PDPA → {{langfuse}} Trace & Eval/Cost",
    "ตอบคำถามสัมภาษณ์ Junior AI Engineer ด้วยสูตร **Decision → Evidence (ตัวเลขจริงจากระบบคุณ) → Trade-off**",
    "คุณจบเส้นทาง **Neural Path 180 วัน** พร้อมพอร์ตโฟลิโอ 6 ชิ้นที่รันซ้ำได้ ตรวจสอบได้ และอธิบายเหตุผลเชิงวิศวกรรมได้ทุกชั้น",
  ],

  reviewCards: [
    rc(
      "d180-rc-1",
      "ทวนตัวเลขเกณฑ์ผ่านหลักใน 4 เสาของ Production-Ready Capstone Rubric",
      "(1) Recall@5 >= 0.85, Faithfulness >= 0.85, Abstention >= 90%; (2) Schema >= 99%, timeout/retry/fallback, HITL write gate; (3) trace_id 100% + P50/P95 + Cost/1k; (4) Red-team >= 90% + PDPA mask ทั้งก่อนออก API และลง log",
    ),
    rc(
      "d180-rc-2",
      "สูตร 3 ท่อนสำหรับตอบคำถามเทคนิคเชิงสถาปัตยกรรมในห้องสัมภาษณ์ AI Engineer คืออะไร?",
      "Decision (เลือกอะไร) → Evidence (ตัวเลข/ผล eval ที่พิสูจน์) → Trade-off & Next Step (ข้อเสียที่ยอมรับและจุดที่จะเปลี่ยนเมื่อสเกลโต)",
    ),
    rc(
      "d180-rc-3",
      "ผลงานพอร์ตโฟลิโอ 6 ชิ้นที่คุณสร้างตลอด 180 วันของ Neural Path มีอะไรบ้าง?",
      "(1) Typed Async Python CLI, (2) Tabular ML Pipeline, (3) Production LLM Structured Extractor, (4) Thai Hybrid RAG Engine, (5) Automated Eval & Security Suite, และ (6) Production Thai/Bilingual Enterprise AI Assistant Capstone",
    ),
  ],

  sources: [
    { label: "OWASP Top 10 for LLM Applications", href: "https://genai.owasp.org/llm-top-10/" },
    { label: "Langfuse Documentation — Tracing & Evaluation", href: "https://langfuse.com/docs" },
    { label: "Promptfoo Documentation — Eval & Red-Teaming", href: "https://www.promptfoo.dev/docs" },
    { label: "Ragas Documentation — RAG Evaluation", href: "https://docs.ragas.io/" },
  ],

  glossary: ["groundedness", "ragas", "promptfoo", "langfuse", "pdpa", "guardrails", "hitl", "adr"],
});
