import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D178 — Phase 6 / Block B45
 * Polish README.md, Architecture Diagram & Eval/Cost Metrics Table
 */
export const d178: Lesson = defineLesson({
  day: 178,
  titleTh: "ขัดเกลา README.md, แผนภาพสถาปัตยกรรม และตาราง Eval/Cost Metrics ระดับมืออาชีพ",
  tagline: "30 นาที · Portfolio Polish · จัดหน้าด่านแรกของ GitHub Repo ให้ผู้สัมภาษณ์เข้าใจคุณค่าและหลักฐานตัวเลขครบใน 30 วินาที",
  icon: "file-text",
  visual: {
    id: "capstone-load-defense",
    title: "หน้าด่านพอร์ตโฟลิโอ — README.md, Mermaid Diagram & Artifact-Backed Metrics",
    caption: "เชื่อมผลรันจริงจาก Eval Report (D172), Load Test (D177) และ Red-Team (D176) เป็นตารางเดียวใน README โดยไม่มีตัวเลขแต่งเอง",
    alt: "แผนภาพการจัดทำเอกสารพอร์ตโฟลิโอ Capstone เชื่อม Architecture Diagram กับตาราง Eval, Latency และ Cost Metrics จากหลักฐานจริง",
  },
  requiresApiKey: false,
  apiKeyNote: "สร้างและตรวจความสอดคล้องของตาราง Metrics + README Markdown จากไฟล์ JSON ในเครื่อง 100% ออฟไลน์",
  tools: ["README.md", "Mermaid", "Pydantic v2", "pytest", "ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "สื่อสารปัญหาและ Non-Goals ตั้งแต่ย่อหน้าแรก",
      body: "Hiring manager หรือ tech lead มีเวลาสแกนโปรเจกต์ GitHub ของผู้สมัครเฉลี่ยไม่เกิน 30–60 วินาที ถ้าเปิดมาเจอแค่คำว่า *'AI Chatbot using LangChain'* เขาจะปิดแท็บทันที",
      lessonNote: "หน้าแรกของ `README.md` ต้องสรุปปัญหาขององค์กรไทย, 3 เส้นทางหลัก, Non-Goals และลิงก์ไปยัง {{adr|ADR-001}} ให้จบใน 10 วินาทีแรก",
    },
    {
      node: 4,
      heading: "วาดแผนภาพสถาปัตยกรรมที่ตรงกับโค้ดจริงทุกเส้นทาง",
      body: "แผนภาพที่สวยแต่วาดกล่องที่ไม่มีอยู่ในโค้ดจริง (diagram drift) เป็นจุดตายเวลาถูกถามเจาะลึกในห้องสัมภาษณ์",
      lessonNote: "เราเขียน Mermaid diagram ที่สะท้อนท่อจริงใน `src/`: {{fastapi}} + {{pdpa}} Gate → {{langgraph}} Router → Hybrid {{rag}} / {{mcp}} + {{hitl}} → Fallback & {{langfuse}}",
    },
    {
      node: 3,
      heading: "เปลี่ยนคำโฆษณาเป็นตาราง Metrics ที่สร้างจาก Artifact จริง",
      body: "การพิมพ์ตัวเลขลง `README.md` ด้วยมือมักทำให้เลขล้าสมัยทันทีเมื่อแก้ prompt หรือเปลี่ยนโมเดลในภายหลัง",
      lessonNote: "เราสร้างสคริปต์อ่านรายงาน JSON จาก {{ragas}}, {{promptfoo}} และ Load Test (Day 177) มาตรวจเทียบ SLA และ render เป็นตาราง Markdown อัตโนมัติ",
    },
    {
      node: 5,
      heading: "เปิดเผย Latency, Token Cost และ Hygiene ของ Repo อย่างโปร่งใส",
      body: "วิศวกรตัวจริงไม่ซ่อนข้อจำกัด — การบอกทั้ง P50/P95 latency, ต้นทุนต่อ 1,000 คำถาม, และวิธีรันทดสอบแบบออฟไลน์ด้วย `uv` แสดงถึงความรับผิดชอบระดับ Production",
      lessonNote: "รวมเช็กลิสต์ Repo Hygiene ตรวจว่าไม่มี `.env`, raw PII หรือไฟล์ขยะหลุดเข้า Git before final defense",
    },
  ],

  objectives: [
    "**ออกแบบโครงสร้าง `README.md` ระดับ Hiring-Grade** ที่สื่อสาร Problem, Architecture, Quickstart (1 คำสั่งด้วย `uv` / Docker), Non-Goals และ Known Limitations ได้ภายใน 30 วินาที",
    "**เขียนแผนภาพสถาปัตยกรรมด้วย Mermaid** ที่ตรงกับโมดูลจริงใน `src/` ครบทั้ง Happy Path, Guardrails/PDPA, HITL Gate, Observability และ Timeout Fallback",
    "**สร้างตัวเรนเดอร์และตรวจสอบ Metrics Table ด้วยโค้ด** (`Pydantic v2` + `pytest`) เพื่อดึงผล Eval, Red-Team, P50/P95 Latency และ Cost/1,000 queries จาก JSON artifact มาอัปเดต `README.md` อย่างซื่อสัตย์",
  ],

  prerequisites: [
    "มีผลรัน Milestone 2–5 และผล Load/Fallback Test จาก Day 177",
    "รู้จักโครงสร้าง {{adr}} และเกณฑ์ Capstone Rubric 4 เสาหลัก",
    "ใช้งาน Markdown, Mermaid และ `Pydantic v2` ได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "ตรวจสอบสถานะไฟล์เอกสาร, รายงานผลทดสอบ และความสะอาดของ Git repository ในโปรเจกต์ `thai-enterprise-assistant/` ก่อนสร้างตัวเรนเดอร์ตาราง Metrics",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
ls -la docs/
uv run pytest -q
git status -s`,
    steps: [
      ["docs", "ตรวจว่ามี `docs/ADR-001.md` และโครงสร้างโฟลเดอร์ `src/`, `tests/` ครบถ้วน"],
      ["tests", "รัน `uv run pytest -q` ให้ทุกบทเรียนที่ผ่านมาผ่านทั้งหมด"],
      ["hygiene", "ตรวจ `git status -s` ให้แน่ใจว่าไม่มี `.env` หรือไฟล์ชั่วคราวที่ไม่ควร commit"],
    ],
    note: "Mermaid diagram ใน `README.md` แสดงผลเป็นกราฟสวยงามบน GitHub ได้ทันทีโดยไม่ต้องส่งออกไฟล์รูปภาพแยก และแก้ตามโค้ดผ่าน Git diff ได้ง่าย",
  },

  concepts: [
    {
      id: "readme-30-second-architecture",
      title: "1 · กฎ 30 วินาทีของ README.md: เขียนให้ Tech Lead อ่านจบแล้วอยากเปิดโค้ดต่อ",
      paragraphs: [
        "สำหรับงานสาย AI Engineer รีโป GitHub ของคุณคือ **หน้าปกผลงาน** ความผิดพลาดที่พบบ่อยคือการปล่อย `README.md` ว่าง ๆ จาก `uv init` หรือเขียนแค่คำสั่งติดตั้งสั้น ๆ 3 บรรทัดโดยไม่อธิบายว่าแก้ปัญหาอะไร ทำไมออกแบบแบบนี้ และพิสูจน์คุณภาพอย่างไร",
        "`README.md` ที่ดีต้องเรียงลำดับตามความอยากรู้ของคนอ่านจริง: **(1) Hero Summary & Value Proposition** 2–3 ประโยค + ลิงก์วิดีโอ Demo 3 นาที, **(2) Architecture Diagram** ที่มองปราดเดียวเห็น data flow และ safety gates, **(3) Eval, Cost & Resilience Metrics Table** พร้อมวันที่และเงื่อนไขการวัด, **(4) 3-Step Quickstart** ที่รันแบบ mock/offline ได้ทันทีโดยไม่ต้องควักบัตรเครดิต, และ **(5) Engineering Trade-offs & Known Limitations** ที่ลิงก์ไป `docs/ADR-001.md`",
        "การระบุ **Known Limitations** อย่างตรงไปตรงมา (เช่น *\"ชุดทดสอบภาษาไทยปัจจุบันเน้นนโยบายภายใน 24 ไฟล์ ยังไม่รองรับไฟล์สแกน PDF ที่ไม่มี OCR\"*) ไม่ได้ทำให้คะแนนตก แต่กลับเพิ่มความน่าเชื่อถืออย่างมหาศาลเพราะแสดงว่าคุณรู้ขอบเขตระบบของตัวเอง",
      ],
      analogy: "เหมือนหน้าเมนูหน้าร้านอาหารระดับมิชลิน — ไม่ได้เทสูตรอาหารทุกอย่างลงไป แต่บอกชัดเจนว่าจานเด่นคืออะไร ใช้วัตถุดิบจากไหน ราคาเท่าไร และมีคำเตือนสำหรับคนแพ้อาหารอะไรบ้าง",
      bullets: [
        "**Above the Fold**: ชื่อโปรเจกต์, ปัญหาที่แก้, และ Mermaid diagram ต้องเห็นได้ตั้งแต่หน้าจอแรก",
        "**Zero-Friction Quickstart**: ระบุวิธีรันทั้งแบบ `uv run pytest` (ออฟไลน์ 0 บาท) และแบบต่อ Real API / Docker Compose",
        "**Trade-off & ADR Link**: สรุป 3 การตัดสินใจหลักใน `README.md` แล้วชี้ไปรายละเอียดเต็มใน `docs/ADR-001.md`",
      ],
      whyTitle: "Why this matters — แยกรีโปพอร์ตโฟลิโอออกจากโปรเจกต์เรียนตามคลิป",
      whyParagraphs: [
        "รีโปจาก tutorial ทั่วไปมักมีแค่โค้ดต่อ API กับหน้าต่างแชต แต่ไม่มี Non-Goals, ไม่มี Cost/Latency table และไม่มีคำสั่งเทสต์แบบออฟไลน์",
        "เมื่อผู้สัมภาษณ์เห็นโครงสร้าง `README.md` + `docs/ADR-001.md` + `tests/` ที่ครบเครื่อง เขาจะรู้ทันทีว่าคุณถูกฝึกมาด้วยมาตรฐานทีมวิศวกรรมจริง",
      ],
    },
    {
      id: "honest-mermaid-diagram",
      title: "2 · วาด Mermaid Architecture Diagram ที่ไม่โกหกโค้ดจริง",
      paragraphs: [
        "แผนภาพสถาปัตยกรรมที่ดีที่สุดคือแผนภาพที่ **เชื่อมตรงกับชื่อไฟล์และเส้นทางข้อมูลจริงในโปรเจกต์** หากในโค้ดคุณใช้ {{fastapi}}, {{pdpa}} Redactor, {{langgraph}} Router, Hybrid {{rag}} ({{pythainlp}} {{bm25}} + Dense + {{reranker}}), {{mcp}} + {{hitl}} และ Timeout Fallback (D177) ในแผนภาพก็ต้องแสดงจุดเหล่านี้ครบและแยกเส้นทาง Read vs Write ชัดเจน",
        "จงหลีกเลี่ยงแผนภาพที่วาดกล่องลอย ๆ เช่น `\"Magic AI Brain\"` หรือแอบวาด Kubernetes/Kafka ที่โปรเจกต์จริงไม่ได้ใช้งาน เพราะถ้าถูกสัมภาษณ์เจาะเข้าไปที่กล่องนั้นแล้วตอบไม่ได้ว่าไฟล์ไหนทำหน้าที่นี้ ความน่าเชื่อถือทั้งหมดจะพังทลายทันที",
      ],
      analogy: "เหมือนแผนผังทางหนีไฟของอาคาร — ต้องตรงกับประตูและบันไดที่มีอยู่จริงทุกบาน ห้ามวาดประตูหลอกที่เปิดไปเจอผนังปูน",
      code: {
        language: "text",
        filename: "docs/architecture.mmd",
        code: `flowchart LR
    U[User / Support Agent] -->|HTTPS + SSE| API[FastAPI + PDPA PII Mask]
    API -->|Prompt Injection Guard| R{LangGraph Router}
    R -->|faq_rag| RAG[PyThaiNLP BM25 + Dense + Rerank]
    R -->|mcp_lookup| MCP[MCP Server: Read-Only SQLite]
    R -->|hitl_write| HITL[HITL Approval Gate]
    RAG -->|LLM Timeout / 503| FB[Circuit Breaker -> Grounded Snippet]
    API -.->|Async Spans & Cost| LF[(Langfuse / Structlog)]`,
        caption: "Mermaid diagram ที่สั้น กระชับ แสดงครบทั้ง Happy Path, Security Gate, HITL, Fallback และ Observability",
      },
      bullets: [
        "**แยกเส้นทาง Data vs Telemetry**: ใช้เส้นทึบสำหรับ Request Flow และเส้นประ (`-.->`) สำหรับ Observability / Audit Log",
        "**แสดง Failure Path**: ใส่วงจร {{circuit-breaker}} → Fallback เพื่อโชว์ว่าระบบคิดเผื่อกรณี LLM ล่มไว้แล้ว",
        "**เช็กตรงกับโค้ด**: ทุกกล่องใน Mermaid ควรมีชื่อไฟล์/โมดูลจริงในหัวข้อ Project Structure ด้านล่าง",
      ],
      whyTitle: "Why this matters — ภาพเดียวช่วยประหยัดเวลาอธิบาย 10 นาที",
      whyParagraphs: [
        "ในวันพรีเซนต์ 3 นาที (Day 179) และการสอบ Final Defense (Day 180) คุณจะเปิดแผนภาพนี้เป็นสไลด์แรกเพื่อชี้เส้นทางของ request ตั้งแต่ต้นจนจบ",
        "แผนภาพที่ชัดและซื่อสัตย์ช่วยให้กรรมการตั้งคำถามเชิงสถาปัตยกรรมได้ตรงจุด และทำให้คุณคุมทิศทางการเล่าเรื่องได้ง่ายขึ้น",
      ],
    },
    {
      id: "artifact-backed-metrics-table",
      title: "3 · สร้างตาราง Eval, Latency & Cost Metrics จาก Artifact จริง (ห้ามแต่งเลข)",
      paragraphs: [
        "หลักจรรยาบรรณสำคัญของ AI Engineer คือ **ทุกตัวเลขใน `README.md` ต้องสืบย้อนกลับไปยังไฟล์หลักฐาน (Artifact) และชุดข้อมูลที่ใช้ทดสอบได้** เช่น `Recall@5 = 0.88` มาจาก `reports/eval_summary.json` บนชุดคำถามไทย 40 ข้อ ไม่ใช่ตัวเลขที่พิมพ์ขึ้นลอย ๆ",
        "ตารางสรุปผลใน Capstone ของเราควรครอบคลุมครบ 4 เสาหลัก: **(1) Quality & Groundedness** (`Recall@5`, `Faithfulness`, `Abstention`), **(2) Reliability** (`Schema Pass Rate`, `Fallback Success Rate`), **(3) Performance & Cost** (`P50`, `P95`, `Cost / 1,000 queries`), และ **(4) Security** (`Red-Team Pass Rate`, `PDPA Leak = 0`)",
        "การเขียนสคริปต์ Python + {{pydantic}} เพื่ออ่านไฟล์ JSON report แล้วตรวจเทียบกับ SLA Targets (เช่น `Recall@5 >= 0.85`, `P95 <= 3,500 ms`) ก่อน render ตาราง Markdown ช่วยให้ทุกครั้งที่ปรับระบบ คุณรันสคริปต์เดียวแล้วได้ตารางใหม่ที่ถูกต้อง 100% โดยไม่เผลออัปเดตแค่บางช่อง",
      ],
      analogy: "เหมือนป้ายโภชนาการข้างกล่องอาหารที่มาจากผลตรวจห้องแล็บจริง พร้อมระบุขนาดหนึ่งหน่วยบริโภค — ไม่ใช่เขียนด้วยปากกาเมจิกว่า 'อร่อยและไม่อ้วน'",
      code: {
        language: "json",
        filename: "reports/capstone_metrics_sample.json",
        code: `{
  "dataset_version": "golden-th-en-v1 (40 cases)",
  "recall_at_5": 0.88,
  "faithfulness": 0.91,
  "abstention_accuracy": 0.93,
  "schema_pass_rate": 0.995,
  "fallback_success_rate": 1.0,
  "p50_ms": 1180.0,
  "p95_ms": 2840.0,
  "cost_per_1k_queries_usd": 1.42,
  "red_team_pass_rate": 0.95,
  "pdpa_leak_count": 0
}`,
        caption: "เก็บผลวัดจริงเป็น JSON artifact เพื่อใช้สร้างตารางใน README และตรวจ CI Gate ได้พร้อมกัน",
      },
      bullets: [
        "**ระบุ Context ของตัวเลข**: บอกขนาด Golden Dataset, ชื่อโมเดล, และ concurrency ที่ใช้วัด Latency",
        "**แสดง Target vs Actual + Status**: เช่น `Target >= 0.85 | Actual 0.88 | PASS` อ่านง่ายกว่าตัวเลขดิบ",
        "**คำนวณ Cost / 1,000 Queries**: แยกให้เห็นชัดว่าคิดจากสมมติฐาน token เฉลี่ยเท่าไรต่อคำถาม",
      ],
      whyTitle: "Why this matters — ป้องกัน Metric Drift และเพิ่มความน่าเชื่อถือ",
      whyParagraphs: [
        "หากผู้สัมภาษณ์เปิดดูตารางใน `README.md` แล้วถามว่า *\"ตัวเลข P95 = 2,840 ms นี้วัดที่กี่ concurrent users\"* การมี artifact + test script ชัดเจนทำให้คุณตอบได้ทันทีอย่างมั่นใจ",
        "นอกจากนี้ การเอาตารางจากสคริปต์นี้ไปตรวจใน `pytest` ยังช่วยให้มั่นใจว่าไม่มีตัวเลขใดต่ำกว่าเกณฑ์ Capstone Rubric ก่อนถึงวัน Defense",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก OpenAPI Docs & Lighthouse Score สู่ AI README & Scorecard",
      body: [
        "ในงาน Web Dev เรามักโชว์ Lighthouse Score, API Docs และ Demo Link ใน `README.md` แต่สำหรับ AI App สิ่งที่เข้ามาแทนที่ Lighthouse Score คือ **Eval & Cost Scorecard** เพราะฝั่ง Backend/AI มีทั้งความไม่แน่นอนของคำตอบและต้นทุน token ต่อการใช้งานจริง",
      ],
      table: [
        ["Lighthouse Performance / Accessibility Score", "Eval Scorecard (Recall@5, Faithfulness, Red-Team)"],
        ["Bundle Size & Server Response Time", "P50 / P95 Latency & Cost / 1,000 Queries"],
        ["Swagger / OpenAPI Spec Link", "Mermaid Architecture + ADR-001 + `/docs`"],
        ["`npm test` Quickstart", "`uv run pytest -q` (100% Offline Mock Support)"],
      ],
    },
    student: {
      title: "First-Year Note — อย่าอายที่จะเขียน 'ข้อจำกัดที่รู้ตัว' ลงใน README",
      body: [
        "นักศึกษาหลายคนกลัวว่าถ้าเขียนหัวข้อ Known Limitations ลงไปใน `README.md` อาจารย์หรือผู้สัมภาษณ์จะหักคะแนน แต่ในโลกวิศวกรรมจริง **ตรงกันข้ามเลย** — ทุกระบบมีข้อจำกัด",
        "การเขียนอย่างซื่อสัตย์ว่า *\"ปัจจุบันรันทดสอบโหลดด้วย mock transport บน 20 concurrent users และรองรับเอกสารข้อความ/ตาราง Markdown+PDF ที่มี text layer\"* แสดงว่าคุณเข้าใจระบบลึกและไม่ได้อวดอ้างเกินจริง",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองสร้างตัวตรวจสอบและเรนเดอร์ตาราง Eval/Cost Metrics จาก JSON Report ด้วย `Pydantic v2` เพื่อเอาไปแปะใน `README.md` อย่างเป็นระบบ กด **ขั้นต่อไป** เพื่อดูทีละส่วน",
    steps: [
      {
        title: "1 · นิยาม Schema สำหรับ Capstone Scorecard และตรวจเกณฑ์ Target อัตโนมัติ",
        explain:
          "กำหนดโมเดล `CapstoneMetrics` ที่เก็บค่าจากรายงาน Eval, Load Test และ Security พร้อมเมธอดเช็กสถานะ `PASS` / `FAIL` เทียบกับเกณฑ์ Capstone Rubric 4 เสาหลัก",
        code: {
          language: "python",
          filename: "worked_readme_metrics.py",
          code: `from pydantic import BaseModel, Field


class CapstoneMetrics(BaseModel):
    dataset_label: str = Field(min_length=3)
    recall_at_5: float = Field(ge=0.0, le=1.0)
    faithfulness: float = Field(ge=0.0, le=1.0)
    abstention_accuracy: float = Field(ge=0.0, le=1.0)
    schema_pass_rate: float = Field(ge=0.0, le=1.0)
    p50_ms: float = Field(gt=0.0)
    p95_ms: float = Field(gt=0.0)
    cost_per_1k_usd: float = Field(ge=0.0)
    red_team_pass_rate: float = Field(ge=0.0, le=1.0)
    pdpa_leak_count: int = Field(ge=0)

    def evaluate_gates(self) -> list[tuple[str, str, str, str]]:
        rows = [
            ("Recall@5", ">= 0.85", f"{self.recall_at_5:.2f}", "PASS" if self.recall_at_5 >= 0.85 else "FAIL"),
            ("Faithfulness", ">= 0.85", f"{self.faithfulness:.2f}", "PASS" if self.faithfulness >= 0.85 else "FAIL"),
            ("Abstention", ">= 0.90", f"{self.abstention_accuracy:.2f}", "PASS" if self.abstention_accuracy >= 0.90 else "FAIL"),
            ("Schema Pass Rate", ">= 99%", f"{self.schema_pass_rate * 100:.1f}%", "PASS" if self.schema_pass_rate >= 0.99 else "FAIL"),
            ("P95 Latency", "<= 3,500 ms", f"{self.p95_ms:,.0f} ms", "PASS" if self.p95_ms <= 3500 else "FAIL"),
            ("Red-Team Pass", ">= 90%", f"{self.red_team_pass_rate * 100:.0f}%", "PASS" if self.red_team_pass_rate >= 0.90 else "FAIL"),
            ("PDPA Leaks", "0", str(self.pdpa_leak_count), "PASS" if self.pdpa_leak_count == 0 else "FAIL"),
        ]
        return rows`,
        },
      },
      {
        title: "2 · แปลงเป็น Markdown Table พร้อมบรรทัด Latency/Cost Summary",
        explain:
          "ฟังก์ชัน `render_metrics_markdown` จะสร้างตาราง Markdown ที่ก๊อปปี้ลง `README.md` ได้ทันที พร้อมระบุ dataset และต้นทุนต่อ 1,000 คำถามไว้ใต้ตาราง",
        code: {
          language: "python",
          filename: "worked_readme_metrics.py",
          code: `def render_metrics_markdown(m: CapstoneMetrics) -> str:
    lines = [
        "| Metric | Target | Actual | Status |",
        "| --- | --- | --- | --- |",
    ]
    for name, target, actual, status in m.evaluate_gates():
        lines.append(f"| {name} | {target} | {actual} | **{status}** |")
    lines.append("")
    lines.append(
        f"> Measured on \`{m.dataset_label}\` · P50: \`{m.p50_ms:,.0f} ms\` · Est. Cost: \`\${m.cost_per_1k_usd:.2f} / 1,000 queries\`"
    )
    return "\\n".join(lines)`,
        },
      },
      {
        title: "3 · ทดสอบรันด้วย Artifact ตัวอย่างและดู Markdown ที่ได้",
        explain:
          "ส่งค่าจริงจากผลเทสต์เข้า `CapstoneMetrics` แล้วพิมพ์ตาราง Markdown — จะเห็นทั้ง Status และเงื่อนไขการวัดครบถ้วน",
        code: {
          language: "python",
          filename: "worked_readme_metrics.py",
          code: `sample = CapstoneMetrics(
    dataset_label="golden-th-en-v1 (40 cases)",
    recall_at_5=0.88,
    faithfulness=0.91,
    abstention_accuracy=0.93,
    schema_pass_rate=0.995,
    p50_ms=1180,
    p95_ms=2840,
    cost_per_1k_usd=1.42,
    red_team_pass_rate=0.95,
    pdpa_leak_count=0,
)
print(render_metrics_markdown(sample))`,
        },
        output: `| Metric | Target | Actual | Status |
| --- | --- | --- | --- |
| Recall@5 | >= 0.85 | 0.88 | **PASS** |
| Faithfulness | >= 0.85 | 0.91 | **PASS** |
| Abstention | >= 0.90 | 0.93 | **PASS** |
| Schema Pass Rate | >= 99% | 99.5% | **PASS** |
| P95 Latency | <= 3,500 ms | 2,840 ms | **PASS** |
| Red-Team Pass | >= 90% | 95% | **PASS** |
| PDPA Leaks | 0 | 0 | **PASS** |

> Measured on \`golden-th-en-v1 (40 cases)\` · P50: \`1,180 ms\` · Est. Cost: \`$1.42 / 1,000 queries\``,
      },
    ],
    gotcha:
      "จุดสังเกต: ห้ามเขียนตัวเลขใน `README.md` โดยไม่ระบุว่าวัดบน dataset ไหนหรือ mock/real mode ใด — เพราะผู้สัมภาษณ์จะถามทันทีว่าตัวเลขนี้มาจากสภาพแวดล้อมแบบใด",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/readme_polish.py` เพื่อตรวจสอบโครงสร้าง `README.md`, ตรวจความครบถ้วนของ Mermaid Architecture Diagram, และสร้างตาราง Eval/Cost Metrics จาก JSON Report อัตโนมัติ",
    requirements: [
      "สร้าง `MetricsReport(BaseModel)` ที่รับ `dataset_label`, `recall_at_5`, `faithfulness`, `abstention_accuracy`, `schema_pass_rate`, `fallback_success_rate`, `p50_ms`, `p95_ms`, `cost_per_1k_usd`, `red_team_pass_rate`, `pdpa_leak_count` และต้อง validate ให้ `p95_ms >= p50_ms` (ด้วย `@model_validator(mode=\"after\")`)",
      "สร้างฟังก์ชัน `all_rubric_gates_pass(report: MetricsReport) -> tuple[bool, list[str]]` ที่คืน `(True, [])` เมื่อผ่านทุกเกณฑ์ (`recall_at_5 >= 0.85`, `faithfulness >= 0.85`, `abstention_accuracy >= 0.90`, `schema_pass_rate >= 0.99`, `fallback_success_rate >= 0.95`, `p95_ms <= 3500`, `red_team_pass_rate >= 0.90`, `pdpa_leak_count == 0`) หรือคืน `(False, failed_names)` พร้อมรายชื่อเกณฑ์ที่ไม่ผ่าน",
      "สร้างฟังก์ชัน `render_readme_metrics_section(report: MetricsReport) -> str` ที่สร้างหัวข้อ `## Eval, Latency & Cost Metrics`, ตาราง Markdown ครบทุกตัวชี้วัด, และบรรทัดสรุป `dataset_label` + `cost_per_1k_usd`",
      "สร้างฟังก์ชัน `validate_readme_completeness(readme_text: str) -> list[str]` ที่คืนรายการจุดที่ขาด (empty list = ผ่าน) โดยตรวจว่า: (1) มีหัวข้อ `# `, `## Architecture`, `## Quickstart`, `## Eval, Latency & Cost Metrics`, `## Known Limitations`, (2) มีบล็อก ```mermaid ที่มีคำว่า `PDPA`, `LangGraph`, `MCP`, `HITL`, `Fallback`, และ (3) ไม่มีข้อความ placeholder เช่น `TODO` หรือ `API_KEY_HERE_LIVE_SECRET` (หรือ `sk-live-`)",
    ],
    starter: {
      language: "python",
      filename: "src/readme_polish.py",
      code: `from pydantic import BaseModel, Field, model_validator


class MetricsReport(BaseModel):
    dataset_label: str = Field(min_length=3)
    recall_at_5: float = Field(ge=0.0, le=1.0)
    faithfulness: float = Field(ge=0.0, le=1.0)
    abstention_accuracy: float = Field(ge=0.0, le=1.0)
    schema_pass_rate: float = Field(ge=0.0, le=1.0)
    fallback_success_rate: float = Field(ge=0.0, le=1.0)
    p50_ms: float = Field(gt=0.0)
    p95_ms: float = Field(gt=0.0)
    cost_per_1k_usd: float = Field(ge=0.0)
    red_team_pass_rate: float = Field(ge=0.0, le=1.0)
    pdpa_leak_count: int = Field(ge=0)

    @model_validator(mode="after")
    def check_p95_ge_p50(self) -> "MetricsReport":
        # TODO: ตรวจว่า p95_ms >= p50_ms
        return self


def all_rubric_gates_pass(report: MetricsReport) -> tuple[bool, list[str]]:
    raise NotImplementedError


def render_readme_metrics_section(report: MetricsReport) -> str:
    raise NotImplementedError


def validate_readme_completeness(readme_text: str) -> list[str]:
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_readme_polish.py",
      code: `import pytest
from pydantic import ValidationError
from src.readme_polish import (
    MetricsReport,
    all_rubric_gates_pass,
    render_readme_metrics_section,
    validate_readme_completeness,
)


def _passing_report() -> MetricsReport:
    return MetricsReport(
        dataset_label="golden-th-en-v1 (40 cases)",
        recall_at_5=0.88,
        faithfulness=0.91,
        abstention_accuracy=0.93,
        schema_pass_rate=0.995,
        fallback_success_rate=1.0,
        p50_ms=1150.0,
        p95_ms=2820.0,
        cost_per_1k_usd=1.42,
        red_team_pass_rate=0.95,
        pdpa_leak_count=0,
    )


def test_reject_impossible_p95_less_than_p50():
    with pytest.raises(ValidationError):
        MetricsReport(
            dataset_label="golden-v1",
            recall_at_5=0.9,
            faithfulness=0.9,
            abstention_accuracy=0.95,
            schema_pass_rate=1.0,
            fallback_success_rate=1.0,
            p50_ms=2500.0,
            p95_ms=1200.0,
            cost_per_1k_usd=1.0,
            red_team_pass_rate=0.95,
            pdpa_leak_count=0,
        )


def test_rubric_gates_pass_and_fail_detection():
    ok, failed = all_rubric_gates_pass(_passing_report())
    assert ok is True
    assert failed == []

    bad = _passing_report().model_copy(update={"recall_at_5": 0.78, "pdpa_leak_count": 1})
    ok2, failed2 = all_rubric_gates_pass(bad)
    assert ok2 is False
    assert "recall_at_5" in failed2
    assert "pdpa_leak_count" in failed2


def test_render_metrics_and_validate_readme_completeness():
    report = _passing_report()
    metrics_md = render_readme_metrics_section(report)
    assert "## Eval, Latency & Cost Metrics" in metrics_md
    assert "0.88" in metrics_md
    assert "$1.42" in metrics_md

    full_readme = f"""# Thai Enterprise AI Assistant

## Architecture
\`\`\`mermaid
flowchart LR
  User --> FastAPI_PDPA --> LangGraph --> RAG_or_MCP_HITL --> Fallback
\`\`\`

## Quickstart
Run \`uv run pytest -q\`

{metrics_md}

## Known Limitations
- Text-layer PDFs and Markdown policies only.
"""
    assert validate_readme_completeness(full_readme) == []

    incomplete = full_readme.replace("## Known Limitations", "## Notes") + "\\nTODO: fill later\\n"
    issues = validate_readme_completeness(incomplete)
    assert len(issues) >= 2
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_readme_polish.py` ผ่านครบทั้ง 3 test cases",
      "ลองนำ `render_readme_metrics_section` ไปสร้างตารางใน `README.md` จริงของโปรเจกต์คุณ",
      "ตรวจว่า Mermaid diagram ใน `README.md` สอดคล้องกับโมดูลใน `src/` จริงทุกกล่อง",
      "รัน `uv run ruff check .` ไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 3 test cases ใน `tests/test_readme_polish.py` และ `README.md` ของโปรเจกต์ผ่าน `validate_readme_completeness` โดยไม่มี issue",
    hints: [
      {
        body: "ใน `@model_validator(mode=\"after\")` เช็ก `if self.p95_ms < self.p50_ms: raise ValueError(\"p95_ms must be >= p50_ms\")` แล้วคืน `self`",
      },
      {
        body: "ใน `all_rubric_gates_pass` สร้างรายการกฎ `(field_name, condition_bool)` เพื่อรวบรวมชื่อ field ที่ไม่ผ่านทั้งหมดในลิสต์เดียว — วิธีนี้ไม่หล่นเช็กเฉพาะข้อแรกที่พัง",
      },
      {
        body: "ตัวอย่าง `validate_readme_completeness` ที่ตรวจทั้งหัวข้อ, Mermaid block และข้อความต้องห้าม:",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def validate_readme_completeness(readme_text: str) -> list[str]:
    issues: list[str] = []
    required_headings = [
        "# ",
        "## Architecture",
        "## Quickstart",
        "## Eval, Latency & Cost Metrics",
        "## Known Limitations",
    ]
    for h in required_headings:
        if h not in readme_text:
            issues.append(f"missing heading: {h.strip()}")

    if "\`\`\`mermaid" not in readme_text:
        issues.append("missing mermaid diagram block")
    else:
        for kw in ["PDPA", "LangGraph", "MCP", "HITL", "Fallback"]:
            if kw.lower() not in readme_text.lower():
                issues.append(f"mermaid/doc missing component: {kw}")

    for banned in ["TODO", "sk-live-", "API_KEY_HERE_LIVE_SECRET"]:
        if banned in readme_text:
            issues.append(f"forbidden placeholder or secret found: {banned}")
    return issues`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_readme_polish.py
uv run ruff check .`,
      caption: "ตรวจความถูกต้องของ Metrics Report และความสมบูรณ์ของ README.md แบบอัตโนมัติ",
    },
  },

  mistakes: [
    {
      title: "พิมพ์ตัวเลข Eval และ Cost ลง README ด้วยมือจนไม่ตรงกับโค้ดล่าสุด",
      symptom: "ใน `README.md` เขียนว่า `Recall@5 = 0.90` แต่พอเปิด `reports/` หรือรัน eval ใหม่จริงได้แค่ `0.81`",
      fix: "สร้างตารางจาก JSON artifact ผ่านสคริปต์ (`render_readme_metrics_section`) และระบุ `dataset_label` ทุกครั้ง",
    },
    {
      title: "วาดแผนภาพสถาปัตยกรรมเกินความจริง (Diagram Drift)",
      symptom: "วาดกล่อง Kubernetes, Redis Cluster หรือ Multi-Agent Swarm ทั้งที่โค้ดจริงรันแค่ Docker Compose + LangGraph Router เดียว",
      fix: "วาดเฉพาะ component ที่มีอยู่จริงในโค้ด และชี้ชื่อโมดูลให้ตรงกันทุกจุด",
    },
    {
      title: "Quickstart บังคับให้คนอ่านต้องมี API Key เสียเงินถึงจะลองรันได้",
      symptom: "ผู้สัมภาษณ์อยากลอง `pytest` หรือรันตัวอย่างดู แต่ติด error ไม่มี `OPENAI_API_KEY` ตั้งแต่ขั้นตอนแรก",
      fix: "แสดงคำสั่ง `uv run pytest -q` แบบ offline mock เป็นขั้นตอนแรก แล้วค่อยอธิบายวิธีใส่ `.env` สำหรับโหมด Live LLM",
    },
    {
      title: "ลืมลบ placeholder (`TODO`) หรือตัวอย่าง secret ออกจาก README",
      symptom: "มีคำว่า `TODO: add demo link` หรือตัวอย่าง key คล้ายของจริงหลุดค้างอยู่ในหน้าหลักของ GitHub",
      fix: "เพิ่มเช็กอัตโนมัติใน test เพื่อสแกนคำว่า `TODO` และ pattern ของ secret ก่อน push",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d178-q1",
        "ข้อมูลชุดใดควรปรากฏอยู่ใน **30 วินาทีแรก (ด้านบนสุด)** ของ `README.md` สำหรับพอร์ตโฟลิโอ AI Engineer?",
        [
          ["ประวัติส่วนตัวและรายวิชาที่เรียนทั้งหมดในมหาวิทยาลัย", "ไม่ใช่สิ่งที่ tech lead มองหาเวลาประเมินโปรเจกต์ GitHub"],
          ["สรุปปัญหาที่แก้ (1–2 ย่อหน้า), ลิงก์ Demo, แผนภาพสถาปัตยกรรม (Mermaid), และตาราง Eval/Cost Metrics", "ถูก — ช่วยให้ผู้ประเมินเข้าใจทั้งโจทย์ สถาปัตยกรรม และหลักฐานคุณภาพได้ทันที"],
          ["รายการ dependencies ทั้งหมดใน `uv.lock` กว่า 200 บรรทัด", "รกเกินไปและไม่สื่อสารคุณค่าของระบบ"],
          ["โค้ด Python ทั้งหมดของโปรเจกต์คัดลอกมาวางต่อกัน", "ซ้ำซ้อนกับไฟล์ใน `src/` และทำให้ `README.md` อ่านไม่ได้"],
        ],
        "B",
        "หน้าบนสุดของ README ต้องตอบ 3 คำถามใน 30 วินาที: ระบบแก้ปัญหาอะไร (Problem), ทำงานอย่างไร (Architecture), และวัดผลแล้วดีแค่ไหน (Metrics)",
        "ส่วนบนของ README.md ที่ดีควรตอบคำถาม 3 ข้ออะไรให้คนอ่านภายใน 30 วินาที?",
        "1) แก้ปัญหาอะไรให้ใคร, 2) สถาปัตยกรรมและการไหลของข้อมูลเป็นอย่างไร (Diagram), 3) ผลวัดคุณภาพ ความเร็ว และต้นทุนจริงเป็นเท่าไร (Metrics Table)",
      ),
      mc(
        "d178-q2",
        "ทำไมเราจึงควรสร้างตาราง Metrics ใน `README.md` จากไฟล์ JSON artifact ด้วยสคริปต์แทนการพิมพ์ตัวเลขด้วยมือ?",
        [
          ["เพราะ Markdown ไม่รองรับการพิมพ์ตัวเลขด้วยมือ", "Markdown รองรับข้อความธรรมดาปกติ แต่คนพิมพ์มักลืมอัปเดต"],
          ["เพื่อป้องกันเลขล้าสมัย (metric drift), บังคับตรวจเทียบเกณฑ์ SLA อัตโนมัติ, และสืบย้อนกลับไปยังชุดทดสอบจริงได้", "ถูก — ทำให้ตัวเลขในเอกสารตรงกับผลรันล่าสุดของระบบเสมอ"],
          ["เพื่อเพิ่มขนาดไฟล์ Git repo ให้ดูใหญ่ขึ้น", "ไม่เกี่ยวข้อง — ไฟล์ JSON artifact มีขนาดเล็กมาก"],
          ["เพื่อซ่อนตัวเลขที่ต่ำกว่าเกณฑ์ไม่ให้แสดงในตาราง", "ตรงข้าม — สคริปต์ช่วยฟ้อง `FAIL` ทันทีถ้ามีตัวเลขตกเกณฑ์เพื่อบังคับให้แก้ก่อนส่งมอบ"],
        ],
        "B",
        "Artifact-backed metrics ช่วยให้เอกสารตรงกับความจริงของโค้ดล่าสุดเสมอ และผูกเข้ากับ CI gate ได้",
        "ข้อดีของการ generate ตาราง Eval/Cost Metrics จาก JSON report ด้วยสคริปต์คืออะไร?",
        "ป้องกันตัวเลขล้าสมัย (metric drift), ตรวจเทียบเกณฑ์ PASS/FAIL อัตโนมัติ, และระบุ dataset/เงื่อนไขการวัดกำกับทุกครั้ง",
      ),
      mc(
        "d178-q3",
        "ในการวาด Mermaid Architecture Diagram ของ Capstone เหตุใดจึงต้องวาด **PDPA Mask, HITL Gate และ Timeout Fallback** ให้เห็นชัดเจน?",
        [
          ["เพื่อให้แผนภาพดูมีกล่องเยอะขึ้นเฉย ๆ", "ไม่ควรใส่กล่องที่ไม่จำเป็น — ทุกกล่องต้องสะท้อนโค้ดจริง"],
          ["เพราะจุดต่างของระบบ AI ระดับ Production กับเดโมทั่วไปอยู่ที่ Safety Gates และ Resilience ไม่ใช่แค่กล่อง LLM", "ถูก — แผนภาพที่แสดงจุดป้องกัน PDPA, HITL และ Fallback สื่อถึงวุฒิภาวะเชิงวิศวกรรมทันที"],
          ["เพราะ Mermaid วาดได้เฉพาะแผนภาพที่มีมากกว่า 6 กล่อง", "ไม่จริง — Mermaid วาดกี่กล่องก็ได้"],
          ["เพื่อใช้แทน unit test ใน `pytest`", "แผนภาพใช้สื่อสารสถาปัตยกรรม ไม่สามารถแทนการทดสอบโค้ดได้"],
        ],
        "B",
        "จุดที่แยก Production AI System ออกจากแชตบอททั่วไปคือ Guardrails, PDPA Redaction, HITL สำหรับ Write Action และ Failure Fallback",
        "ทำไม Architecture Diagram ของระบบ AI ระดับ Production จึงควรเน้น Safety Gates และ Fallback path?",
        "เพราะนั่นคือส่วนที่พิสูจน์ว่าคุณออกแบบระบบรับมือความเสี่ยงจริง (PDPA leak, Excessive Agency, LLM outage) ไม่ใช่แค่ต่อ API ตอบคำถาม",
      ),
      mc(
        "d178-q4",
        "การใส่หัวข้อ **Known Limitations** ใน `README.md` ส่งผลอย่างไรต่อการประเมินผลงานพอร์ตโฟลิโอ?",
        [
          ["ทำให้ผู้สัมภาษณ์มองว่าเขียนโค้ดไม่เก่ง", "ไม่ใช่ — วิศวกรอาวุโสมองว่าคนที่อ้างว่าระบบไม่มีข้อจำกัดเลยต่างหากที่ยังไม่เข้าใจระบบจริง"],
          ["แสดงความซื่อสัตย์เชิงวิศวกรรมและบอกว่าคุณเข้าใจขอบเขตการใช้งานกับแผนพัฒนาต่อในอนาคต", "ถูก — เช่น ระบุชัดว่ารองรับเอกสารข้อความ 20+ ไฟล์ และยังต้องเพิ่ม OCR สำหรับ PDF สแกนภาพ"],
          ["ทำให้ไม่ต้องเขียน Quickstart ใน README", "Quickstart ยังจำเป็นต้องมีเสมอเพื่อให้คนลองรันได้"],
          ["ช่วยให้ระบบทำงานเร็วขึ้น 2 เท่า", "เอกสารไม่ได้เปลี่ยน runtime latency ของโค้ด"],
        ],
        "B",
        "การระบุ Known Limitations และ Next Steps อย่างชัดเจนสะท้อนความเข้าใจ Trade-off และขอบเขตของระบบอย่างมืออาชีพ",
        "เหตุใดหัวข้อ Known Limitations ใน README.md จึงช่วยเพิ่มคะแนนความน่าเชื่อถือแทนที่จะลดคะแนน?",
        "เพราะแสดงให้เห็นว่าผู้สร้างรู้ขอบเขตจริงของข้อมูล/สถาปัตยกรรม และแยกออกระหว่างสิ่งที่พิสูจน์แล้วกับสิ่งที่ต้องต่อยอด",
      ),
    ],
  },

  takeaways: [
    "`README.md` ระดับพอร์ตโฟลิโอต้องตอบ **Problem, Architecture, Metrics, Quickstart, Trade-offs/Limitations** ให้ชัดภายใน 30 วินาที",
    "วาด **Mermaid Diagram** ให้ตรงกับโมดูลจริงใน `src/` ครบทั้ง {{pdpa}}, {{langgraph}}, Hybrid {{rag}}, {{mcp}} + {{hitl}}, {{circuit-breaker}} Fallback และ {{langfuse}}",
    "สร้างตาราง **Eval, Latency & Cost Metrics** จาก JSON artifact ด้วยสคริปต์ {{pydantic}} เพื่อไม่ให้ตัวเลขหลุดจากความจริง",
    "ให้คำสั่ง Quickstart รันแบบ **100% offline mock** (`uv run pytest -q`) ได้ทันทีโดยไม่ต้องใช้ API key",
  ],

  reviewCards: [
    rc(
      "d178-rc-1",
      "5 หัวข้อหลักที่ README.md ระดับ AI Engineer Portfolio ควรมีครบคืออะไร?",
      "1) Problem & Non-Goals (+ ลิงก์ Demo/ADR), 2) Architecture Diagram (Mermaid ที่ตรงโค้ดจริง), 3) Artifact-Backed Eval/Latency/Cost Metrics Table, 4) Zero-Friction Quickstart (รองรับ offline mock), 5) Engineering Trade-offs & Known Limitations",
    ),
    rc(
      "d178-rc-2",
      "ทำไมจึงห้ามวาดกล่องเทคโนโลยีที่ไม่ได้ใช้จริงลงใน Architecture Diagram?",
      "เพราะเกิด Diagram Drift — หากผู้สัมภาษณ์ถามเจาะลึกแล้วไม่มีโค้ดรองรับ จะทำลายความน่าเชื่อถือของทั้งโปรเจกต์ทันที",
    ),
    rc(
      "d178-rc-3",
      "ตาราง Metrics ที่ครบทั้ง 4 เสาหลักของ Capstone ควรรายงานตัวเลขใดบ้าง?",
      "Recall@5, Faithfulness, Abstention, Schema Pass Rate, Fallback Success Rate, P50/P95 Latency, Est. Cost / 1,000 queries, Red-Team Pass Rate และ PDPA Leak Count",
    ),
  ],

  sources: [
    { label: "GitHub Docs — About READMEs & Mermaid Diagrams", href: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes" },
    { label: "Mermaid.js — Flowchart Syntax", href: "https://mermaid.js.org/syntax/flowchart.html" },
    { label: "Pydantic v2 — Model Validators", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
  ],

  glossary: [
    "adr",
    "pydantic",
    "fastapi",
    "pdpa",
    "langgraph",
    "rag",
    "mcp",
    "hitl",
    "circuit-breaker",
    "langfuse",
  ],
});
