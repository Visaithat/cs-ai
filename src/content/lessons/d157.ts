import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D157 — Phase 6 / Block B40
 * Capstone Kickoff: Problem Framing, User Stories & Architecture Diagram (ADR)
 */
export const d157: Lesson = defineLesson({
  day: 157,
  titleTh: "วางกรอบปัญหา เขียน User Stories และจัดทำเอกสารสถาปัตยกรรม (ADR)",
  tagline: "30 นาที · ออกแบบก่อนเขียนโค้ด · ทำ 1-Page ADR และตั้งเกณฑ์ SLA/Eval ให้ผู้ช่วย AI องค์กรสองภาษา",
  icon: "file-text",
  visual: {
    id: "capstone-adr",
    title: "พิมพ์เขียว Capstone — Thai/Bilingual Enterprise AI Assistant",
    caption: "คลิกสำรวจแต่ละชั้นสถาปัตยกรรมตั้งแต่ FastAPI + PDPA Gate → LangGraph Router → Hybrid RAG & MCP → Langfuse",
    alt: "แผนภาพสถาปัตยกรรมระบบ Capstone ผู้ช่วย AI องค์กรสองภาษา",
  },
  requiresApiKey: false,
  tools: ["ADR.md", "Pydantic v2", "pytest", "Mermaid"],

  bigPicture: [
    {
      node: 0,
      heading: "ตั้งโจทย์ ขอบเขต และ Non-Goals ให้คมชัด",
      body: "โปรเจกต์ AI ส่วนใหญ่พังก่อนเขียนโค้ดบรรทัดแรก เพราะนิยามแค่ว่า 'อยากได้แชตบอทตอบได้ทุกเรื่อง' โดยไม่ระบุว่าใครใช้ ใช้แก้ปัญหาอะไร และเรื่องไหนที่ระบบต้องปฏิเสธ",
      lessonNote: "วันนี้เราเขียน User Stories และ {{adr}} ฉบับแรกให้ระบบ Thai/Bilingual Enterprise Knowledge & Support AI Assistant เพื่อล็อกขอบเขตงานตลอด 24 วันของ Phase 6",
    },
    {
      node: 3,
      heading: "ล็อกเกณฑ์วัดผล (SLA & Eval Gate) ล่วงหน้า",
      body: "ถ้าไม่กำหนดตัวเลขผ่านเกณฑ์ตั้งแต่วันเริ่ม ทีมจะเผลอปรับเป้าหมายตามผลลัพธ์ที่ได้จริง (moving the goalpost) และไม่มีทางรู้ว่าเมื่อไรระบบพร้อมขึ้น Production",
      lessonNote: "เรานำเกณฑ์ Capstone Rubric (`Recall@5 >= 0.85`, `Faithfulness >= 0.85`, `Schema >= 99%`, `PDPA = 100%`) มาผูกเป็นสัญญาใน ADR และเตรียมวางแผน {{golden-dataset}} ตั้งแต่ต้น",
    },
    {
      node: 4,
      heading: "ออกแบบรอยต่อระหว่างชั้นของระบบ AI",
      body: "ระบบจริงไม่ใช่การยิง prompt เดียวจบ แต่คือการต่อ {{fastapi}} + {{pdpa}} Gate เข้ากับ {{langgraph}} Router, Hybrid {{rag}} และ {{mcp}} Tool ให้แต่ละชั้นมีหน้าที่และสิทธิ์ชัดเจน",
      lessonNote: "แผนภาพสถาปัตยกรรมใน ADR ช่วยให้ทีมเห็นทันทีว่าจุดไหนทำ PII redaction, จุดไหนอ่านอย่างเดียว และจุดไหนต้องหยุดรอ {{hitl|Human-in-the-Loop}}",
    },
    {
      node: 5,
      heading: "ฝังเงื่อนไข Observability และงบต้นทุนตั้งแต่วันแรก",
      body: "การมาไล่ติด tracing หรือคำนวณค่า token ทีหลังมักทำให้โครงสร้างโค้ดรกและพลาดข้อมูลสำคัญใน production",
      lessonNote: "ใน ADR เราบังคับให้ทุก request ต้องส่ง trace เข้า {{langfuse}} พร้อมตั้งงบ P95 latency และต้นทุนต่อ 1,000 คำถามไว้เป็นข้อตกลงตั้งแต่ Day 157",
    },
  ],

  objectives: [
    "**แปลงโจทย์ธุรกิจ** ของระบบ Thai/Bilingual Enterprise Knowledge & Support AI Assistant เป็น User Stories ที่ระบุเงื่อนไขยอมรับ (Acceptance Criteria) และ Non-Goals ชัดเจน",
    "**เขียนเอกสาร** 1-Page {{adr|Architecture Decision Record (ADR)}} ที่ครบ 4 ส่วนหลัก (Context, Decision, Alternatives, Trade-offs) เพื่ออธิบายเหตุผลเชิงวิศวกรรมของทุกชิ้นส่วนใน stack",
    "**กำหนดสัญญา SLA และ Eval Gate** แบบตรวจสอบได้ด้วยโค้ด ({{pydantic}} + `pytest`) ก่อนเริ่มสร้าง repo และ ingestion pipeline ในวันถัดไป",
  ],

  prerequisites: [
    "ผ่านภาพรวม RAG, MCP, LangGraph (Phase 4) และ Eval, FastAPI, PDPA (Phase 5)",
    "ใช้งาน `uv`, `Pydantic v2` และ `pytest` พื้นฐานได้คล่อง",
    "เข้าใจองค์ประกอบ 4 เสาหลักของระบบ AI ระดับ Production",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์โปรเจกต์ Capstone ของคุณเพื่อเก็บเอกสาร `docs/ADR-001.md` และสคริปต์ตรวจสัญญา SLA อัตโนมัติ",
    commands: `# สร้างโครงสร้างเริ่มต้นสำหรับเอกสารสถาปัตยกรรม Capstone
uv init thai-enterprise-assistant && cd thai-enterprise-assistant
mkdir -p docs src tests
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "รัน `uv init thai-enterprise-assistant` และสร้างโฟลเดอร์ `docs/`, `src/`, `tests/`"],
      ["deps", "ติดตั้ง `pydantic` และ dev dependencies (`pytest`, `ruff`) สำเร็จ"],
      ["ready", "พร้อมเขียนโค้ดตรวจสอบโครงสร้าง ADR และ SLA Contract"],
    ],
    note: "โฟลเดอร์นี้จะเป็นฐานของงาน Capstone ตลอด Days 157–180 — Day 158 เราจะต่อยอดเพิ่ม Docker Compose และโครงสร้าง `src/` เต็มรูปแบบ",
  },

  concepts: [
    {
      id: "problem-framing",
      title: "1 · Problem Framing, User Stories และ Non-Goals",
      paragraphs: [
        "ความผิดพลาดอันดับหนึ่งของโปรเจกต์ AI ในองค์กรไม่ใช่การเลือกโมเดลผิด แต่คือการ **สร้างก่อนเข้าใจขอบเขตปัญหา** ระบบผู้ช่วยลูกค้าและเอกสารภายในองค์กรไทยต้องรับมือกับคำถามผสมภาษาไทย-อังกฤษ (code-switching), รหัสเอกสารเฉพาะ (เช่น `INV-2026-009`), และคำร้องที่เกี่ยวข้องกับข้อมูลส่วนบุคคล",
        "เราจึงแบ่ง User Stories ออกเป็น 3 เส้นทางที่ชัดเจน: (1) **Knowledge Q&A** ตอบคำถามนโยบาย/FAQ พร้อมอ้างอิงเอกสารผ่าน Hybrid {{rag}}, (2) **Read-Only Lookup** ตรวจสอบสถานะคำสั่งซื้อหรือทิกเก็ตผ่าน {{mcp}} Tool, และ (3) **Guarded Write Action** เช่น เปิดทิกเก็ตเคลมหรือขอออกใบกำกับภาษีใหม่ ซึ่งต้องหยุดขอการยืนยันแบบ {{hitl}} เสมอ",
        "สิ่งที่สำคัญไม่แพ้กันคือ **Non-Goals** (สิ่งที่ระบบจะไม่ทำ): ไม่เดาคำตอบเมื่อเอกสารไม่มีข้อมูล (ต้อง abstain), ไม่ให้โมเดลเขียนฐานข้อมูลโดยตรงโดยไร้ confirmation gate, และไม่ส่งเลขบัตรประชาชนหรือเบอร์โทรไทยดิบออกไปยัง LLM ภายนอก",
      ],
      analogy: "เหมือนการวาดแบบบ้านพร้อมระบุพื้นที่ห้ามก่อสร้างก่อนลงเสาเข็ม — ถ้าไม่ตกลงกันก่อนว่าห้องไหนรับน้ำหนักเท่าไร ช่างจะก่อกำแพงทับท่อน้ำจนต้องรื้อใหม่ทั้งหลัง",
      bullets: [
        "**Persona หลัก**: พนักงานซัพพอร์ตองค์กรและลูกค้า B2B ที่ถามภาษาไทยปนศัพท์อังกฤษ",
        "**Happy Paths (3 เส้นทาง)**: Policy/FAQ RAG · Read-Only Order/Ticket Lookup · Write Action + HITL Approval",
        "**Hard Boundaries (Non-Goals)**: ห้ามเดาคำตอบนอกเอกสาร, ห้ามแก้ข้อมูลอัตโนมัติ, ห้ามรั่วข้อมูล {{pdpa}}",
      ],
      whyTitle: "Why this matters — ทำไมต้องเขียน Non-Goals ลงเอกสาร",
      whyParagraphs: [
        "ในทีมจริง Stakeholder มักคาดหวังว่า AI จะทำได้ทุกอย่าง การระบุ Non-Goals ชัดเจนตั้งแต่วันที่ 157 ช่วยป้องกัน scope creep และทำให้คุณออกแบบชุดทดสอบ Abstention (คำถามที่ระบบต้องตอบว่า *\"ไม่พบข้อมูล\"*) ได้อย่างแม่นยำ",
        "ในการสัมภาษณ์งาน Junior AI Engineer การตอบได้ว่า *\"ระบบนี้ตั้งใจไม่ทำอะไร และเพราะเหตุใด\"* แสดงให้เห็นวุฒิภาวะเชิงวิศวกรรมมากกว่าการอวดฟีเจอร์เยอะ ๆ",
      ],
    },
    {
      id: "one-page-adr",
      title: "2 · เขียน 1-Page Architecture Decision Record (ADR)",
      paragraphs: [
        "{{adr|ADR (Architecture Decision Record)}} คือเอกสารสั้น 1 หน้า (ไม่เกิน ~400–600 คำ) ที่บันทึก **การตัดสินใจเชิงสถาปัตยกรรมที่สำคัญ** พร้อมเหตุผลและทางเลือกที่ตัดทิ้ง เพื่อไม่ให้อีก 3 เดือนข้างหน้าทีมต้องมานั่งเถียงซ้ำว่า *\"ทำไมตอนนั้นเลือก pgvector ไม่เลือก Qdrant\"* หรือ *\"ทำไมใช้ Hosted API แทน self-host vLLM\"*",
        "โครงสร้างมาตรฐานของ ADR ที่อ่านง่ายและใช้ได้จริงในทีมวิศวกรรมมี 4 ส่วนเสมอ: **Context** (บริบทและข้อจำกัด), **Decision** (สถาปัตยกรรมที่เลือก), **Alternatives Considered** (ทางเลือกอื่นอย่างน้อย 2 ตัวพร้อมเหตุผลที่ไม่เลือก), และ **Trade-offs & Consequences** (ข้อเสียที่ยอมรับได้และวิธีลดความเสี่ยง)",
      ],
      analogy: "เหมือนบันทึกการตัดสินใจของนักบินก่อนเปลี่ยนเส้นทาง — บอกสภาพอากาศตอนนั้น ทางเลือกที่มี เหตุผลที่เลือกเส้นนี้ และน้ำมันสำรองที่ต้องเผื่อไว้",
      code: {
        language: "yaml",
        filename: "docs/ADR-001-summary.yaml",
        code: `adr_id: ADR-001
title: Thai/Bilingual Enterprise AI Assistant Architecture
status: accepted
context:
  users: Thai support agents & B2B customers (code-switching TH/EN)
  corpus: 20+ policy docs, Thai PDF tables, FAQs, mock order DB
  constraints: Solo engineer budget, PDPA compliance, < 3.5s P95 latency
decision:
  api_layer: FastAPI (async SSE) + PDPA PII Redaction Middleware
  orchestration: LangGraph bounded router (FAQ RAG vs MCP Lookup vs HITL)
  retrieval: PyThaiNLP BM25 + Multilingual Dense Vector (RRF) + Cross-Encoder Rerank
  tooling: MCP Server (read-only lookup + gated write action)
  observability: Langfuse self-hostable traces + GitHub Actions Eval Gate
alternatives:
  - option: Self-hosted vLLM on dedicated 24/7 GPU
    reason_rejected: Idle GPU cost too high for prototype/low steady traffic
  - option: Naive Dense-only RAG without PyThaiNLP BM25
    reason_rejected: Misses Thai exact terms, invoice IDs (INV-2026-009), and tables
  - option: Autonomous unrestricted ReAct agent
    reason_rejected: High loop risk and violates least-privilege for write actions`,
        caption: "ADR ที่ดีต้องบันทึก 'ทางเลือกที่ปฏิเสธ' เสมอ เพราะนั่นคือหลักฐานว่าคุณไม่ได้เลือกเทคโนโลยีตามกระแส",
      },
      whyTitle: "Why this matters — ADR คืออาวุธลับในพอร์ตโฟลิโอและห้องสัมภาษณ์",
      whyParagraphs: [
        "ผู้สัมภาษณ์งาน AI Engineer แทบไม่มีเวลาอ่านโค้ดทุกไฟล์ใน GitHub แต่เกือบทุกคนจะเปิด `README.md` และ `docs/ADR-001.md` เพื่อดูวิธีคิดของคุณ",
        "ADR ที่เปรียบเทียบ {{vllm}} vs Hosted API หรือ {{bm25}} + {{pythainlp}} vs Dense-only อย่างมีเหตุผล บอกได้ทันทีว่าคุณเข้าใจ cost, latency และบริบทภาษาไทยจริง",
      ],
    },
    {
      id: "sla-eval-contract",
      title: "3 · ล็อก SLA และ Eval Gates เป็นสัญญาที่ตรวจด้วยโค้ดได้",
      paragraphs: [
        "คำว่า *\"ตอบแม่น ปลอดภัย และเร็ว\"* ไม่ใช่เกณฑ์วิศวกรรม เพราะวัดไม่ได้และเถียงกันไม่จบ ก่อนเริ่ม Day 158 เราต้องแปลงทุกเป้าหมายใน ADR ให้เป็นตัวเลขที่ผูกกับ **4 เสาหลักของ Capstone Rubric**",
        "การเขียน SLA เป็น {{pydantic}} schema ช่วยให้เราทำ {{fail-fast}} ตั้งแต่ขั้นออกแบบ: หากใครแก้ spec แล้วเผลอลดเกณฑ์ `recall_at_5` ต่ำกว่า `0.85` หรือปิดสวิตช์ `pdpa_masking` เทสต์จะแดงทันที และค่าตัวเลขชุดเดียวกันนี้จะถูกนำไปใช้เป็น threshold จริงใน CI Eval Gate (Milestone 4)",
      ],
      analogy: "เหมือนสเปกมาตรฐานความปลอดภัยของลิฟต์ที่เขียนเป็นตัวเลข (รับน้ำหนัก >= 1,000 กก., เบรกทำงานใน <= 0.2 วินาที) ไม่ใช่เขียนแค่ว่า 'แข็งแรงและปลอดภัย'",
      bullets: [
        "**Retrieval & Groundedness**: `Recall@5 >= 0.85` (ชุดไทย 40 ข้อ), `Faithfulness >= 0.85`, Abstention `>= 0.90`",
        "**Reliability & Tool Safety**: {{structured-output}} ผ่าน schema `>= 0.99`, มี timeout/retry/fallback, write tool บังคับ {{hitl}}",
        "**Observability & Cost**: `trace_id` ครบ 100% บน {{langfuse}}, รายงาน P50/P95 latency (`<= 3,500 ms` เป้าหมาย) และ Cost / 1,000 queries",
        "**Security & PDPA**: ผ่าน red-team suite `>= 0.90` และ mask เลขบัตรประชาชน/เบอร์โทรไทยก่อนออก API ภายนอกและก่อนลง log",
      ],
      whyTitle: "Why this matters — เปลี่ยนเป้าหมายลอย ๆ ให้เป็น CI Gate",
      whyParagraphs: [
        "เมื่อเกณฑ์ผ่านถูกนิยามชัดตั้งแต่ Day 157 ทุก Milestone ถัดไป (D164 Retrieval Benchmark, D172 Eval Report, D176 Red-Team Pass, D180 Final Defense) จะมีมาตรวัดเดียวกันตลอดทั้งโปรเจกต์",
        "คุณจะรู้ทันทีในแต่ละสัปดาห์ว่าต้องลงทุนเวลาไปปรับ {{reranker}}, แก้ prompt, หรืออุดช่องโหว่ความปลอดภัย แทนที่จะเสียเวลาขัดเกลาส่วนที่ไม่กระทบเกณฑ์ผ่าน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก RFC / Tech Spec สู่ AI Architecture ADR",
      body: [
        "ถ้าคุณเคยเขียน Tech Spec หรือ RFC ก่อนสร้างฟีเจอร์ Backend/Frontend ในทีม Web Dev คุณกำลังใช้กล้ามเนื้อเดิม แต่ในระบบ AI ต้องเพิ่มมิติที่เว็บทั่วไปไม่มี: **ความไม่แน่นอนของผลลัพธ์ (probabilistic output)**, **ต้นทุนต่อ token**, และ **Eval Gate**",
      ],
      table: [
        ["ADR (Architecture Decision Record)", "Tech Spec / RFC 1 หน้าก่อนเริ่ม Sprint"],
        ["Eval Gate (Recall@5, Faithfulness)", "SLI / Acceptance Test Gate ใน CI"],
        ["Non-Goals & Abstention Policy", "Error Spec & Out-of-Scope HTTP 400/422"],
        ["PDPA Middleware + LangGraph HITL", "AuthZ Middleware + Confirmation Modal"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมโปรเจกต์คนเดียวก็ต้องเขียน ADR",
      body: [
        "นักศึกษาหลายคนคิดว่าเอกสารสถาปัตยกรรมมีไว้สำหรับทีมใหญ่ 20 คนเท่านั้น แต่ความจริงคือ **คุณในอีก 2 สัปดาห์ข้างหน้าก็เหมือนคนแปลกหน้า** ที่จำไม่ได้แล้วว่าทำไมถึงตั้ง chunk size เท่านี้หรือเลือกใช้ไลบรารีนี้",
        "ADR 1 หน้าใช้เวลาเขียนไม่ถึง 15 นาที แต่ช่วยประหยัดเวลาแก้งานย้อนหลังหลายชั่วโมง และกลายเป็นเอกสารชิ้นแรกที่กรรมการหรือผู้สัมภาษณ์ใช้ทำความเข้าใจโปรเจกต์ของคุณ",
      ],
    },
  },

  workedExample: {
    intro:
      "เราจะสร้างตัวตรวจสอบพิมพ์เขียว ADR และสัญญา SLA ด้วย `Pydantic v2` เพื่อบังคับให้เอกสารสถาปัตยกรรมของ Capstone ครบถ้วนและไม่ต่ำกว่ามาตรฐาน Production กด **ขั้นต่อไป** เพื่อดูทีละส่วน",
    steps: [
      {
        title: "1 · นิยาม Schema สำหรับ ADR และ SLA Contract",
        explain:
          "แยกโมเดลเป็น `AlternativeOption`, `SLATargets` และ `CapstoneADR` โดยตั้งขอบเขตขั้นต่ำ (`ge`, `le`) ให้ตรงกับ Capstone Rubric และบังคับให้มีทางเลือกเปรียบเทียบอย่างน้อย 2 ตัว",
        code: {
          language: "python",
          filename: "worked_adr.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field, ValidationError, field_validator


class AlternativeOption(BaseModel):
    option: str = Field(min_length=3)
    reason_rejected: str = Field(min_length=10)


class SLATargets(BaseModel):
    recall_at_5: float = Field(ge=0.85, le=1.0)
    faithfulness: float = Field(ge=0.85, le=1.0)
    abstention_accuracy: float = Field(ge=0.90, le=1.0)
    schema_pass_rate: float = Field(ge=0.99, le=1.0)
    p95_latency_ms: int = Field(gt=0, le=5000)
    require_pdpa_redaction: Literal[True] = True
    require_hitl_for_writes: Literal[True] = True


class CapstoneADR(BaseModel):
    adr_id: str
    title: str = Field(min_length=5)
    context: str = Field(min_length=20)
    decision: str = Field(min_length=20)
    alternatives: list[AlternativeOption] = Field(min_length=2)
    tradeoffs: list[str] = Field(min_length=1)
    sla: SLATargets

    @field_validator("adr_id")
    @classmethod
    def check_adr_prefix(cls, value: str) -> str:
        if not value.startswith("ADR-"):
            raise ValueError("adr_id must start with 'ADR-' (e.g., ADR-001)")
        return value`,
        },
      },
      {
        title: "2 · ตรวจสอบ ADR-001 ที่สมบูรณ์และแปลงเป็น Markdown 1 หน้า",
        explain:
          "ส่งพิมพ์เขียวของระบบ Thai/Bilingual Enterprise AI Assistant เข้าไปตรวจ — เมื่อผ่านทั้งหมด เราสามารถ render เป็น `docs/ADR-001.md` ที่มีโครงสร้างสม่ำเสมอ",
        code: {
          language: "python",
          filename: "worked_adr.py",
          code: `adr_payload = {
    "adr_id": "ADR-001",
    "title": "Thai/Bilingual Enterprise Knowledge & Support AI Assistant",
    "context": "Support team handles Thai/English mixed queries, invoice IDs, and PDPA-sensitive customer records.",
    "decision": "FastAPI SSE + PDPA Middleware -> LangGraph Router -> PyThaiNLP BM25+Dense Hybrid RAG & Read-Only/HITL MCP Server + Langfuse.",
    "alternatives": [
        {
            "option": "Dense-only vector RAG",
            "reason_rejected": "Poor recall on Thai compound words and exact invoice IDs.",
        },
        {
            "option": "Self-hosted vLLM on 24/7 GPU",
            "reason_rejected": "Fixed GPU cost exceeds prototype budget at low traffic.",
        },
    ],
    "tradeoffs": [
        "Hybrid search + reranker adds ~180ms latency in exchange for Recall@5 >= 0.85.",
        "Hosted LLM API requires strict PDPA redaction before outbound calls.",
    ],
    "sla": {
        "recall_at_5": 0.85,
        "faithfulness": 0.85,
        "abstention_accuracy": 0.90,
        "schema_pass_rate": 0.99,
        "p95_latency_ms": 3500,
    },
}

adr = CapstoneADR.model_validate(adr_payload)
print(f"{adr.adr_id} ACCEPTED | alternatives={len(adr.alternatives)} | P95<={adr.sla.p95_latency_ms}ms")`,
        },
        output: `ADR-001 ACCEPTED | alternatives=2 | P95<=3500ms`,
      },
      {
        title: "3 · ทดสอบ Fail-Fast เมื่อ ADR ขาดทางเลือกหรือหย่อนเกณฑ์",
        explain:
          "ลองส่ง ADR ที่ใส่ทางเลือกแค่ 1 ตัว, ตั้ง `recall_at_5 = 0.70`, และปิด `require_pdpa_redaction` — สัญญาข้อมูลจะจับทุกจุดบกพร่องพร้อมกันก่อนที่เราจะเริ่มเขียนระบบจริง",
        code: {
          language: "python",
          filename: "worked_adr.py",
          code: `weak_payload = {
    **adr_payload,
    "adr_id": "SPEC-1",
    "alternatives": [adr_payload["alternatives"][0]],
    "sla": {
        **adr_payload["sla"],
        "recall_at_5": 0.70,
        "require_pdpa_redaction": False,
    },
}

try:
    CapstoneADR.model_validate(weak_payload)
except ValidationError as err:
    print(f"REJECTED ({err.error_count()} issues):")
    for e in err.errors():
        print(" -", e["loc"], "->", e["msg"])`,
        },
        output: `REJECTED (4 issues):
 - ('adr_id',) -> Value error, adr_id must start with 'ADR-' (e.g., ADR-001)
 - ('alternatives',) -> List should have at least 2 items after validation, not 1
 - ('sla', 'recall_at_5') -> Input should be greater than or equal to 0.85
 - ('sla', 'require_pdpa_redaction') -> Input should be True`,
      },
    ],
    gotcha:
      "จุดสังเกต: อย่าเขียน ADR เป็นแค่รายการชื่อเครื่องมือ (`FastAPI + Qdrant + LangGraph`) โดยไม่ระบุ **Alternatives** และ **Trade-offs** — เอกสารที่ไม่มีเหตุผลว่าทำไมไม่เลือกทางอื่น ไม่ถือเป็น ADR ที่ดี",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/capstone_adr.py` สำหรับตรวจสอบเอกสาร ADR + User Stories และสร้างไฟล์ Markdown อัตโนมัติ เพื่อใช้เป็นพิมพ์เขียวจริงของโปรเจกต์ Capstone คุณ",
    requirements: [
      "สร้าง `UserStory(BaseModel)` ที่มี `story_id: str` (ขึ้นต้นด้วย `\"US-\"`), `route: Literal[\"rag_faq\", \"mcp_lookup\", \"hitl_write\"]`, `summary: str` (ยาว >= 10), และ `acceptance_criteria: list[str]` (อย่างน้อย 1 ข้อ)",
      "สร้าง `AlternativeOption(BaseModel)` (`option`, `reason_rejected`) และ `SLAContract(BaseModel)` ที่บังคับ `recall_at_5 >= 0.85`, `faithfulness >= 0.85`, `schema_pass_rate >= 0.99`, `p95_latency_ms` อยู่ระหว่าง `1..5000`, `require_pdpa_redaction: Literal[True] = True`",
      "สร้าง `CapstoneBlueprint(BaseModel)` ที่รวม `adr_id` (ขึ้นต้น `\"ADR-\"`), `title`, `context`, `decision`, `alternatives` (>= 2 รายการ), `non_goals` (>= 2 รายการ), `user_stories` (>= 3 รายการและต้องครอบคลุมครบทั้ง 3 routes: `rag_faq`, `mcp_lookup`, `hitl_write`), และ `sla: SLAContract`",
      "สร้างฟังก์ชัน `validate_capstone_blueprint(payload: dict) -> CapstoneBlueprint` และ `render_adr_markdown(bp: CapstoneBlueprint) -> str` ที่คืน Markdown ซึ่งมีหัวข้อ `## Context`, `## Decision`, `## Alternatives`, `## Non-Goals`, และ `## SLA & Eval Gates`",
    ],
    starter: {
      language: "python",
      filename: "src/capstone_adr.py",
      code: `from typing import Literal
from pydantic import BaseModel, Field, field_validator


class UserStory(BaseModel):
    # TODO: story_id (prefix "US-"), route, summary, acceptance_criteria
    pass


class AlternativeOption(BaseModel):
    # TODO: option, reason_rejected
    pass


class SLAContract(BaseModel):
    # TODO: recall_at_5, faithfulness, schema_pass_rate, p95_latency_ms, require_pdpa_redaction
    pass


class CapstoneBlueprint(BaseModel):
    # TODO: adr_id, title, context, decision, alternatives, non_goals, user_stories, sla
    pass


def validate_capstone_blueprint(payload: dict) -> CapstoneBlueprint:
    raise NotImplementedError


def render_adr_markdown(bp: CapstoneBlueprint) -> str:
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_capstone_adr.py",
      code: `import pytest
from pydantic import ValidationError
from src.capstone_adr import render_adr_markdown, validate_capstone_blueprint


def _sample_payload() -> dict:
    return {
        "adr_id": "ADR-001",
        "title": "Thai/Bilingual Enterprise Knowledge & Support AI Assistant",
        "context": "Support agents answer Thai/EN policy questions and check order statuses under PDPA rules.",
        "decision": "FastAPI SSE + PDPA Gate -> LangGraph Router -> Hybrid RAG (PyThaiNLP BM25+Dense+Rerank) & MCP.",
        "alternatives": [
            {"option": "Dense-only RAG", "reason_rejected": "Fails on Thai compound words and exact invoice IDs."},
            {"option": "Self-hosted vLLM 24/7", "reason_rejected": "Too expensive for low initial traffic volume."},
        ],
        "non_goals": [
            "Never fabricate policy answers when corpus lacks evidence.",
            "Never execute database writes without human confirmation.",
        ],
        "user_stories": [
            {
                "story_id": "US-01",
                "route": "rag_faq",
                "summary": "พนักงานถามเงื่อนไขการคืนสินค้าและได้คำตอบพร้อม citation",
                "acceptance_criteria": ["ตอบพร้อม [doc_id#chunk] ถูกต้อง"],
            },
            {
                "story_id": "US-02",
                "route": "mcp_lookup",
                "summary": "เช็กสถานะใบสั่งซื้อ INV-2026-009 ผ่าน MCP tool แบบ read-only",
                "acceptance_criteria": ["คืนสถานะตรงกับฐานข้อมูลจำลอง"],
            },
            {
                "story_id": "US-03",
                "route": "hitl_write",
                "summary": "เปิดคำร้องออกใบกำกับภาษีใหม่โดยต้องรอยืนยันจากเจ้าหน้าที่ก่อน",
                "acceptance_criteria": ["หยุดรอ approval ก่อน commit"],
            },
        ],
        "sla": {
            "recall_at_5": 0.85,
            "faithfulness": 0.85,
            "schema_pass_rate": 0.99,
            "p95_latency_ms": 3500,
        },
    }


def test_valid_blueprint_and_markdown_render():
    bp = validate_capstone_blueprint(_sample_payload())
    md = render_adr_markdown(bp)
    assert bp.adr_id == "ADR-001"
    for heading in ["## Context", "## Decision", "## Alternatives", "## Non-Goals", "## SLA & Eval Gates"]:
        assert heading in md


def test_reject_missing_route_coverage():
    bad = _sample_payload()
    bad["user_stories"][2]["route"] = "rag_faq"
    with pytest.raises(ValidationError):
        validate_capstone_blueprint(bad)


def test_reject_weak_sla_or_disabled_pdpa():
    bad = _sample_payload()
    bad["sla"]["recall_at_5"] = 0.72
    bad["sla"]["require_pdpa_redaction"] = False
    with pytest.raises(ValidationError):
        validate_capstone_blueprint(bad)


def test_reject_single_alternative():
    bad = _sample_payload()
    bad["alternatives"] = bad["alternatives"][:1]
    with pytest.raises(ValidationError):
        validate_capstone_blueprint(bad)


def test_reject_bad_prefixes():
    bad = _sample_payload()
    bad["adr_id"] = "DOC-001"
    bad["user_stories"][0]["story_id"] = "STORY-1"
    with pytest.raises(ValidationError):
        validate_capstone_blueprint(bad)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 5 test cases",
      "ลองเรียก `render_adr_markdown(bp)` แล้วบันทึกเป็น `docs/ADR-001.md` อ่านได้กระชับจบใน 1 หน้า",
      "ตรวจสอบว่า `user_stories` บังคับครบทั้ง 3 เส้นทาง (`rag_faq`, `mcp_lookup`, `hitl_write`)",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_capstone_adr.py` และสร้างไฟล์ `docs/ADR-001.md` จากพิมพ์เขียวที่ผ่านการตรวจแล้ว",
    hints: [
      {
        body: "แยก validation ระดับ field (`Field(min_length=...)`, `Field(ge=...)`) ออกจากกฎข้ามรายการ เช่น การตรวจว่า `user_stories` มีครบทั้ง 3 routes ซึ่งตรวจได้ง่ายใน `@field_validator(\"user_stories\")` โดยใช้ `set` ของ `s.route`",
      },
      {
        body: "ใน `CapstoneBlueprint` ให้เขียน `@field_validator(\"user_stories\")` เช็กว่า `{\"rag_faq\", \"mcp_lookup\", \"hitl_write\"}.issubset({s.route for s in stories})` และใช้ `Literal[True] = True` สำหรับ `require_pdpa_redaction` เพื่อล็อกห้ามปิด PDPA",
      },
      {
        body: "โครงหลักของ `CapstoneBlueprint` และ `render_adr_markdown` — เติมฟังก์ชัน `validate_capstone_blueprint` และการเรนเดอร์รายการ `non_goals` กับ `sla` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `class CapstoneBlueprint(BaseModel):
    adr_id: str
    title: str = Field(min_length=5)
    context: str = Field(min_length=20)
    decision: str = Field(min_length=20)
    alternatives: list[AlternativeOption] = Field(min_length=2)
    non_goals: list[str] = Field(min_length=2)
    user_stories: list[UserStory] = Field(min_length=3)
    sla: SLAContract

    @field_validator("adr_id")
    @classmethod
    def check_adr_id(cls, v: str) -> str:
        if not v.startswith("ADR-"):
            raise ValueError("adr_id must start with 'ADR-'")
        return v

    @field_validator("user_stories")
    @classmethod
    def check_all_routes(cls, stories: list[UserStory]) -> list[UserStory]:
        required = {"rag_faq", "mcp_lookup", "hitl_write"}
        present = {s.route for s in stories}
        missing = required - present
        if missing:
            raise ValueError(f"missing required user story routes: {sorted(missing)}")
        return stories`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
      caption: "รันจาก root ของโฟลเดอร์ `thai-enterprise-assistant/`",
    },
  },

  mistakes: [
    {
      title: "เขียน ADR เป็นแค่รายการเครื่องมือ ไม่มีทางเลือกเปรียบเทียบ",
      symptom: "เอกสารเขียนแค่ 'ใช้ LangGraph + Qdrant + OpenAI' โดยไม่อธิบายว่าทำไมไม่เลือกทางอื่นและต้องแลกกับอะไร",
      fix: "บังคับให้มีหัวข้อ Alternatives Considered อย่างน้อย 2 ตัวเลือก พร้อมระบุ Trade-off ที่ยอมรับได้ทุกครั้ง",
    },
    {
      title: "ไม่แยก Read-Only Tool ออกจาก Write Tool ตั้งแต่ขั้นออกแบบ",
      symptom: "ปล่อยให้ agent เรียก tool แก้ไขคำสั่งซื้อหรือส่งอีเมลลูกค้าได้ทันทีเหมือน tool อ่านข้อมูล เกิดความเสี่ยง Excessive Agency (OWASP LLM06)",
      fix: "แยก route `mcp_lookup` (read-only) กับ `hitl_write` (ต้องขออนุมัติ) ออกจากกันตั้งแต่ใน User Stories และสถาปัตยกรรม {{langgraph}}",
    },
    {
      title: "ละเลย Non-Goals และเงื่อนไขการปฏิเสธคำตอบ (Abstention)",
      symptom: "เมื่อผู้ใช้ถามเรื่องนอกเอกสาร ระบบพยายามปั้นคำตอบจากความรู้เดิมจนเกิดอาการหลอน",
      fix: "ระบุ Non-Goals ชัดเจนใน ADR และตั้งเกณฑ์ `abstention_accuracy >= 0.90` ไว้ในสัญญา SLA ตั้งแต่วันแรก",
    },
    {
      title: "ตั้งเกณฑ์คุณภาพแบบลอย ๆ วัดไม่ได้",
      symptom: "เขียนว่า 'ระบบตอบเร็วและแม่นยำ' ทำให้ตอนทำ Milestone 2–5 ไม่รู้ว่าผลปัจจุบันถือว่าผ่านหรือต้องแก้ต่อ",
      fix: "ระบุตัวเลขชัดเจน (`Recall@5 >= 0.85`, `P95 <= 3,500ms`, `Schema >= 99%`) เพื่อใช้เป็นเกณฑ์ตัดสินใจใน CI",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d157-q1",
        "องค์ประกอบใดที่ทำให้เอกสาร 1 หน้าเป็น **ADR (Architecture Decision Record)** ที่ดี แตกต่างจากแค่ README แนะนำเครื่องมือ?",
        [
          ["การใส่โลโก้และสกรีนช็อต UI ของแอปให้สวยงาม", "ภาพ UI ช่วยอธิบายหน้าตาแอป แต่ไม่ใช่เหตุผลเบื้องหลังการตัดสินใจเชิงสถาปัตยกรรม"],
          ["การบันทึก Context, Decision, Alternatives ที่ปฏิเสธ และ Trade-offs ที่ยอมรับได้", "ถูก — ADR มีคุณค่าเพราะบันทึก 'เหตุผลและทางเลือกที่ตัดทิ้ง' เพื่อให้ทีมและผู้สัมภาษณ์เข้าใจการตัดสินใจ"],
          ["การคัดลอกโค้ดทุกไฟล์ในโปรเจกต์มาวางรวมกัน", "ADR ควรสั้นกระชับ ~1 หน้า ไม่ใช่การคัดลอกซอร์สโค้ด"],
          ["การระบุแค่ชื่อโมเดล LLM เวอร์ชันล่าสุดที่ใช้", "ชื่อโมเดลเปลี่ยนได้บ่อย แต่เหตุผลเชิงข้อจำกัดและ trade-off คือแก่นของ ADR"],
        ],
        "B",
        "ADR ที่ดีต้องบันทึก Context, Decision, Alternatives Considered และ Trade-offs เพื่ออธิบายว่าทำไมจึงเลือกสถาปัตยกรรมนี้ภายใต้ข้อจำกัดที่มี",
        "ADR 1 หน้าที่ดีควรมีองค์ประกอบหลัก 4 ส่วนอะไรบ้าง?",
        "Context (บริบท/ข้อจำกัด), Decision (สิ่งที่เลือก), Alternatives Considered (ทางเลือกที่ปฏิเสธพร้อมเหตุผล), และ Trade-offs & Consequences",
      ),
      mc(
        "d157-q2",
        "ในระบบ Capstone ผู้ช่วย AI องค์กรสองภาษา ทำไมเราจึงเลือก Hosted LLM API + PDPA Redaction Middleware แทนการเช่า GPU รัน `vLLM` ตลอด 24 ชม. ในระยะเริ่มต้น?",
        [
          ["เพราะ `vLLM` ไม่รองรับภาษาไทยเลย", "ไม่จริง — vLLM รันโมเดล open-weights ที่รองรับภาษาไทยได้หลายตัว เช่น Qwen/Typhoon"],
          ["เพราะ Hosted API ไม่ต้องทำ PDPA masking เลย", "ผิด — ยิ่งส่งออก external API ยิ่งต้องทำ PDPA PII redaction อย่างเข้มงวดก่อนส่ง"],
          ["เพราะ traffic ระยะเริ่มต้นยังต่ำและไม่คงที่ ต้นทุน GPU idle สูงกว่า pay-per-token API มาก", "ถูก — เป็นการเลือกตาม economics: เริ่มด้วย pay-per-token + PDPA gate แล้วค่อยย้ายไป self-host เมื่อ volume สูงคงที่หรือติดกฎ data residency"],
          ["เพราะ `FastAPI` เชื่อมต่อกับ `vLLM` ไม่ได้", "ไม่จริง — vLLM เปิด OpenAI-compatible HTTP API ที่ FastAPI เรียกได้ตามปกติ"],
        ],
        "C",
        "ตามหลัก Selection Criteria การเช่า GPU 24 ชม. สำหรับระบบที่ traffic ยังต่ำทำให้เกิด idle cost สูง การใช้ Hosted API คู่กับ PDPA Redaction Gate จึงคุ้มทุนกว่าในเฟสแรก",
        "เมื่อไรควรเลือก Hosted LLM API แทนการ self-host vLLM 24/7 และต้องระวังอะไรเพิ่ม?",
        "เลือก Hosted API เมื่อ traffic ยังต่ำ/ไม่สม่ำเสมอเพื่อเลี่ยงค่า GPU idle — แต่ต้องติด PDPA PII redaction gate ก่อนส่งข้อมูลออกทุกครั้ง",
      ),
      mc(
        "d157-q3",
        "เหตุใดจึงควรกำหนด **Non-Goals** และตัวเลข **SLA / Eval Gates** ตั้งแต่วันที่ 157 ก่อนเริ่มเขียนโค้ด Ingestion?",
        [
          ["เพื่อป้องกัน scope creep และให้ทุก Milestone มีเกณฑ์ผ่านที่วัดได้ตรงกันตั้งแต่ต้น", "ถูก — ช่วยคุมขอบเขตงานและทำให้ Milestone 2–5 ตัดสินใจด้วยตัวเลขจริง ไม่ใช่ความรู้สึก"],
          ["เพราะ `uv init` จะรันไม่ผ่านถ้าไม่มีไฟล์ `ADR.md`", "`uv init` ไม่ได้ตรวจหาไฟล์ ADR — นี่คือกฎทางวิศวกรรมของทีม"],
          ["เพื่อหลีกเลี่ยงไม่ต้องเขียน unit test ในภายหลัง", "ตรงข้าม — SLA Contract คือฐานในการเขียน automated test และ CI eval gate"],
          ["เพื่อให้ LLM ตอบคำถามได้เร็วขึ้น 50% โดยอัตโนมัติ", "เอกสาร ADR ไม่ได้เปลี่ยนความเร็วโมเดลโดยตรง แต่ช่วยตั้งงบ latency ให้ทีมออกแบบได้ถูกทาง"],
        ],
        "A",
        "การนิยาม Non-Goals และ SLA ล่วงหน้าช่วยป้องกันการขยายขอบเขตงานไม่รู้จบ และทำให้ทุกการปรับปรุงระบบมีตัวชี้วัดชัดเจน",
        "ทำไมต้องกำหนด Non-Goals และตัวเลข SLA/Eval Gate ก่อนเริ่มเขียนโค้ด?",
        "เพื่อป้องกัน scope creep, ป้องกันการเลื่อนเป้าหมายทีหลัง และให้ทุก Milestone วัดผลผ่าน/ไม่ผ่านได้ด้วยตัวเลขชัดเจน",
      ),
      mc(
        "d157-q4",
        "ข้อใดคือการแยกสิทธิ์เครื่องมือ (Tool Safety) ที่ถูกต้องในพิมพ์เขียว Capstone ของเรา?",
        [
          ["ให้ LLM เรียกคำสั่ง `UPDATE/DELETE` บนฐานข้อมูลลูกค้าโดยตรงเพื่อความรวดเร็ว", "เสี่ยง Excessive Agency สูงมาก — หากถูก prompt injection จะแก้ข้อมูลเสียหายทันที"],
          ["ให้ทุก tool เป็น read-only และ write action ทั้งหมดต้องหยุดรอ Human-in-the-Loop approval gate", "ถูก — แยก read-only lookup (`mcp_lookup`) ออกจาก write action (`hitl_write`) ที่มี confirmation gate ชัดเจน"],
          ["เขียนคำเตือนใน System Prompt ว่า 'ห้ามแก้ข้อมูลผิด' แล้วไม่ต้องมีด่านตรวจในโค้ด", "System Prompt อย่างเดียวกัน Prompt Injection ไม่ได้ 100% — สิทธิ์ต้องคุมที่ชั้นโค้ดและสถาปัตยกรรม"],
          ["ปิดการใช้งาน MCP ทั้งหมดแล้วตอบจากความจำของ LLM แทน", "ทำให้เช็กสถานะคำสั่งซื้อหรือทิกเก็ตปัจจุบันไม่ได้ และเพิ่มความเสี่ยงอาการหลอน"],
        ],
        "B",
        "หลัก Least Privilege และ OWASP LLM06 กำหนดให้แยกเครื่องมืออ่านข้อมูลออกจากเครื่องมือที่เปลี่ยนสถานะระบบ โดยบังคับ confirmation gate ฝั่งโค้ด",
        "ในพิมพ์เขียว Capstone เราแบ่งเส้นทางและสิทธิ์ของ MCP Tool อย่างไรเพื่อลดความเสี่ยง Excessive Agency?",
        "แยก Read-only Lookup (`mcp_lookup`) ออกจาก Write Action (`hitl_write`) โดยบังคับให้ทุกการแก้ไขข้อมูลผ่าน Human-in-the-Loop confirmation gate ฝั่งโค้ด",
      ),
    ],
  },

  takeaways: [
    "เริ่มโปรเจกต์ AI ด้วย **Problem Framing, 3 Core User Stories และ Non-Goals** ก่อนเขียนโค้ดเสมอ",
    "1-Page {{adr}} ที่ดีต้องมีครบ 4 ส่วน: Context, Decision, Alternatives Considered (อย่างน้อย 2 ตัว) และ Trade-offs",
    "แปลงความคาดหวังลอย ๆ เป็น **SLA & Eval Contract** ที่ตรวจได้ด้วยโค้ด (`Recall@5 >= 0.85`, `Faithfulness >= 0.85`, `Schema >= 99%`, `PDPA = True`)",
    "แยกชั้นความรับผิดชอบชัดเจน: {{fastapi}} + {{pdpa}} Gate → {{langgraph}} Router → Hybrid {{rag}} & {{mcp}} (Read-only vs {{hitl}} Write) → {{langfuse}}",
  ],

  reviewCards: [
    rc(
      "d157-rc-1",
      "โครงสร้าง 4 ส่วนหลักของ 1-Page ADR คืออะไร และส่วนไหนที่มักถูกลืมบ่อยที่สุด?",
      "Context, Decision, Alternatives Considered, และ Trade-offs & Consequences — ส่วนที่มักถูกลืมคือ Alternatives ที่ปฏิเสธพร้อมเหตุผลและ Trade-offs",
    ),
    rc(
      "d157-rc-2",
      "ระบบ Capstone ผู้ช่วย AI องค์กรสองภาษาแบ่งเส้นทาง User Story หลักออกเป็นกี่เส้นทาง อะไรบ้าง?",
      "3 เส้นทาง: (1) Knowledge/FAQ Hybrid RAG พร้อม citation, (2) Read-Only Order/Ticket Lookup ผ่าน MCP, และ (3) Guarded Write Action ที่ต้องผ่าน HITL approval",
    ),
    rc(
      "d157-rc-3",
      "ระบุตัวเลข SLA หลัก 4 ค่าที่ต้องล็อกไว้ตั้งแต่ Day 157 ก่อนเริ่มเขียนโค้ด Capstone",
      "Recall@5 >= 0.85, Faithfulness >= 0.85 (พร้อม Abstention >= 90%), Structured Output Schema >= 99%, และ PDPA Redaction 100% ก่อนออก external API/log",
    ),
  ],

  sources: [
    { label: "Anthropic — Building Effective Agents", href: "https://www.anthropic.com/research/building-effective-agents" },
    { label: "Model Context Protocol (MCP) Official Docs", href: "https://modelcontextprotocol.io/" },
    { label: "FastAPI Documentation", href: "https://fastapi.tiangolo.com/" },
    { label: "OWASP Top 10 for LLM Applications", href: "https://genai.owasp.org/llm-top-10/" },
  ],

  glossary: ["adr", "rag", "mcp", "langgraph", "fastapi", "pdpa", "langfuse", "golden-dataset"],
});
