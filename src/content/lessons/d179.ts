import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D179 — Phase 6 / Block B45
 * Record 3-Minute Technical Demo + Prepare Interview Q&A
 */
export const d179: Lesson = defineLesson({
  day: 179,
  titleTh: "อัดวิดีโอ Technical Demo 3 นาที และเตรียมตอบคำถามสัมภาษณ์ Junior AI Engineer",
  tagline: "30 นาที · Pre-Defense Rehearsal · จัด Storyboard 180 วินาทีให้โชว์ครบ Flow, Guardrails, Telemetry และซ้อมตอบคำถาม Trade-off แบบมีหลักฐาน",
  icon: "rocket",
  visual: {
    id: "capstone-load-defense",
    title: "พิมพ์เขียว Demo 3 นาที & กรอบตอบคำถามสัมภาษณ์ — Evidence-Driven Defense",
    caption: "แบ่งเวลา 180 วินาทีเป็น 5 ช่วงคมชัด (Hook → RAG/Abstention → MCP/HITL → Attack/Fallback → Telemetry) พร้อมกรอบคำตอบ Trade-off",
    alt: "แผนภาพโครงสร้าง Technical Demo 3 นาที และกรอบเตรียมตอบคำถามสัมภาษณ์ตำแหน่ง Junior AI Engineer",
  },
  requiresApiKey: false,
  apiKeyNote: "เตรียมและตรวจสอบ Demo Storyboard + คลังคำตอบ Interview Q&A แบบออฟไลน์บนเครื่อง 100% ด้วย Pydantic + pytest",
  tools: ["Demo Script", "Langfuse", "FastAPI", "pytest", "Interview Q&A"],

  bigPicture: [
    {
      node: 0,
      heading: "เปิด Demo 25 วินาทีแรกด้วยปัญหาจริงและสถาปัตยกรรม",
      body: "วิดีโอเดโมส่วนใหญ่เสียเวลา 1 นาทีแรกไปกับการเกริ่นประวัติหรือเปิดไฟล์โค้ดไปมา ทำให้คนดูหลุดโฟกัสก่อนเห็นความสามารถของระบบ",
      lessonNote: "Storyboard ของเราเปิดด้วยปัญหาองค์กรไทย 3 ข้อ และแผนภาพจาก `README.md` (D178) ทันทีในวินาทีที่ 0:00–0:25",
    },
    {
      node: 4,
      heading: "สาธิตครบ 3 Core Routes และ Defense ในแอปจริง",
      body: "การโชว์แค่ถาม-ตอบ Happy Path อย่างเดียวพิสูจน์ไม่ได้ว่าระบบปลอดภัย — ต้องโชว์จุดที่ระบบปฏิเสธคำตอบ ({{abstention}}), หยุดรอ {{hitl}}, และกัน {{prompt-injection}} / {{pdpa}} ด้วย",
      lessonNote: "ช่วง `0:25–2:35` เดโมวิ่งผ่านทั้ง Bilingual RAG + Citation, MCP Lookup + HITL Approve, และ Fault/Attack Defense",
    },
    {
      node: 5,
      heading: "ปิดท้ายด้วย Langfuse Trace และตัวเลข Telemetry จริง",
      body: "ภาพหน้าจอ {{langfuse}} Trace Waterfall ที่เห็น latency ของ Retrieval vs Rerank vs LLM กับต้นทุนต่อ query ช่วยยืนยันว่าสิ่งที่พูดไม่ใช่แค่หน้ากาก UI",
      lessonNote: "ช่วง `2:35–3:00` เปิดดู Trace, ตาราง Recall@5 / P95 / Cost แล้วชี้ไปที่ `README.md`",
    },
    {
      node: 6,
      heading: "แปรประสบการณ์ตลอด 180 วันเป็นคำตอบสัมภาษณ์ระดับวิศวกร",
      body: "ผู้สัมภาษณ์ไม่ได้อยากฟังคำท่องจำนิยาม {{rag}} แต่ถามเรื่อง *'ทำไมเลือกทางนี้ ไม่เลือกอีกทาง และแลกกับอะไร'*",
      lessonNote: "เราจัดโครงคำตอบด้วยสูตร **Decision → Trade-off → Evidence (Metrics)** เพื่อเตรียมรับ Day 180 Final Defense และสัมภาษณ์งานจริง",
    },
  ],

  objectives: [
    "**ออกแบบ Storyboard สำหรับ Technical Demo 3 นาที (<= 180 วินาที)** ที่ครอบคลุมครบ 5 ช่วงหลักโดยไม่ล้นเวลาและไม่เปิดเผย secret บนหน้าจอ",
    "**สร้างคลัง Interview Q&A เชิงสถาปัตยกรรม** ที่ตอบคำถามยอดฮิตของ Junior AI Engineer ด้วยโครงสร้าง *Context → Decision → Trade-off → Metric Evidence*",
    "**ทำ Demo Pre-Flight Check ด้วยโค้ด (`pytest`)** เพื่อตรวจสอบความพร้อมของสคริปต์เดโม ความครบถ้วนของหลักฐาน และความปลอดภัยของข้อมูลก่อนอัดวิดีโอจริง",
  ],

  prerequisites: [
    "ผ่าน Load & Failure Testing (D177) และขัดเกลา `README.md` + ตาราง Metrics (D178) แล้ว",
    "มีระบบ FastAPI / Swagger / UI หรือ CLI Demo ที่รันทดสอบได้บนเครื่อง",
    "เข้าใจเหตุผลเชิงวิศวกรรมของ stack ที่เลือกใน `docs/ADR-001.md` (D157)",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์ `docs/` และ `src/` สำหรับบันทึก Storyboard วิดีโอ 3 นาที และคลังคำตอบ Interview Q&A ที่ผูกกับตัวเลขจริงจาก D178",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv run pytest -q
uv run ruff check .`,
    steps: [
      ["verify", "ยืนยันว่าชุดทดสอบทั้งหมดใน `tests/` ผ่านเขียวก่อนเริ่มซ้อมเดโม"],
      ["envcheck", "ตรวจว่าหน้าจอ/terminal ที่จะอัดวิดีโอไม่มีไฟล์ `.env` หรือ API key เปิดค้างไว้"],
      ["ready", "พร้อมเขียนตัวตรวจ Storyboard 3 นาทีและคลัง Interview Q&A"],
    ],
    note: "หากใช้วิธีอัดหน้าจอ (OBS / Loom / QuickTime) ให้ขยายฟอนต์ Terminal และ Swagger UI ใหญ่กว่าปกติ (~16–18pt) เพื่อให้อ่านชัดแม้เปิดดูในหน้าต่างเล็ก",
  },

  concepts: [
    {
      id: "three-minute-demo-storyboard",
      title: "1 · โครงสร้าง Technical Demo 3 นาที (180 วินาที) แบบไม่หลุดโฟกัส",
      paragraphs: [
        "ความยาว **3 นาที (180 วินาที)** คือจุดสมดุลที่ผู้สัมภาษณ์และ Tech Lead ยอมดูจนจบ: สั้นพอที่จะไม่น่าเบื่อ แต่ยาวพอที่จะโชว์ทั้ง Flow, Edge Cases และ Observability โดยไม่ต้องตัดต่อเกินจริง",
        "เพื่อให้คุมเวลาเป๊ะและไม่ตกหล่นจุดขายสำคัญของ Capstone ให้แบ่งเวลาเป็น 5 องก์แบบตายตัว: **0:00–0:25 (Hook & Architecture)** เปิดแผนภาพจาก `README.md` เล่าปัญหาองค์กรไทย 30 วินาทีแรก, **0:25–1:15 (RAG + Abstention)** ยิงคำถามภาษาไทยปนอังกฤษให้เห็น `[doc#chunk]` citation แล้วตามด้วยคำถามนอกเอกสารให้เห็นระบบตอบว่า *\"ไม่พบข้อมูล\"* ({{abstention}}), **1:15–2:00 (MCP + HITL)** เช็กสถานะ `ORD-2026-104` ให้เห็นเบอร์โทรที่ถูก mask และเปิดคำร้องเขียน DB ที่หยุดรอ Approve ก่อน commit",
        "จากนั้น **2:00–2:35 (Security & Timeout Fallback)** ทดลองส่ง {{prompt-injection}} หรือเลขบัตรประชาชน 13 หลักให้เห็นว่าถูกสกัด/mask และเปิดให้เห็นกรณี LLM timeout ที่สลับเข้า Fallback โดย Schema ยังผ่าน, แล้วปิดท้าย **2:35–3:00 (Telemetry & Eval Scorecard)** เปิดหน้า {{langfuse}} trace waterfall คู่กับตาราง `Recall@5`, `P95`, `Cost/1k`",
      ],
      analogy: "เหมือนตัวอย่างหนัง (Movie Trailer) ความยาว 3 นาที — ไม่ได้ฉายทุกฉากตั้งแต่ต้นเรื่องจนจบ แต่คัดเฉพาะฉากพิสูจน์จุดแข็งของเรื่องมาเรียงต่อกันแบบไม่มีช่วงเดดแอร์",
      code: {
        language: "yaml",
        filename: "docs/demo_storyboard_3min.yaml",
        code: `total_budget_sec: 180
chapters:
  - id: hook_arch
    duration_sec: 25
    show: "README.md Mermaid diagram + 3 core routes & Non-Goals"
  - id: rag_and_abstention
    duration_sec: 50
    show: "Bilingual FAQ query with [doc#chunk] + unanswerable abstention"
  - id: mcp_and_hitl
    duration_sec: 45
    show: "Read-only order lookup (masked phone) + HITL write pause & approve"
  - id: defense_and_fallback
    duration_sec: 35
    show: "PDPA 13-digit ID mask + injection block + timeout fallback"
  - id: telemetry_scorecard
    duration_sec: 25
    show: "Langfuse trace waterfall + Recall@5 / P95 / Cost table"`,
        caption: "แบ่งเวลา 5 องก์รวม 180 วินาทีพอดี — ทุกวินาทีต้องพิสูจน์ความสามารถระดับ Production",
      },
      bullets: [
        "**โชว์ Failure/Edge Case อย่างน้อย 2 จุด**: Abstention + Injection/Fallback คือสิ่งที่แยกคุณจากเดโมทั่วไป",
        "**ห้ามพิมพ์สดยาว ๆ ระหว่างอัด**: เตรียม prompt/curl/preset payload ไว้ใน clipboard หรือ Swagger เพื่อลดช่วงเงียบ",
        "**ปิดท้ายด้วยตัวเลข**: ทิ้งภาพตาราง Rubric Scorecard ไว้ 5 วินาทีสุดท้ายเพื่อตอกย้ำผลลัพธ์",
      ],
      whyTitle: "Why this matters — วิดีโอ 3 นาทีคือใบเบิกทางเข้าห้องสัมภาษณ์",
      whyParagraphs: [
        "ผู้คัดเลือกผู้สมัครแทบไม่เคย clone repo ของทุกคนมารัน `docker compose up` เองตั้งแต่รอบแรก แต่แทบทุกคนจะกดดูวิดีโอเดโม 2–3 นาทีที่แปะไว้บนสุดของ `README.md`",
        "วิดีโอที่โชว์ครบทั้ง RAG citation, HITL pause/resume, PDPA redaction และ Langfuse trace จะตอบคำถามเบื้องต้นได้ 80% ก่อนคุยกันจริงด้วยซ้ำ",
      ],
    },
    {
      id: "interview-qa-tradeoff-framework",
      title: "2 · กรอบตอบคำถามสัมภาษณ์ Junior AI Engineer: Decision → Trade-off → Evidence",
      paragraphs: [
        "ในห้องสัมภาษณ์สาย AI Engineer คำถามจะไม่ได้ถามแค่ *\"PyThaiNLP คืออะไร\"* แต่จะถามว่า *\"ทำไมต้องเสียเวลาทำ Hybrid BM25 + Dense + Reranker ทั้งที่ใช้ vector search อย่างเดียวก็ได้?\"* หรือ *\"ทำไมใช้ bounded LangGraph router แทน autonomous agent?\"*",
        "สูตรตอบคำถามที่ให้คะแนนสูงสุดคือ **4 ขั้น: Context → Decision → Trade-off → Evidence**: เริ่มจากบอกข้อจำกัดของปัญหา (Context), ระบุสิ่งที่เลือกใน {{adr}} (Decision), ยอมรับข้อเสียหรือต้นทุนที่ต้องแลกอย่างตรงไปตรงมา (Trade-off), และปิดด้วยตัวเลขที่วัดได้จริงจากโปรเจกต์ (Evidence)",
        "ตัวอย่างเช่น: *\"เราเลือก Hybrid {{pythainlp}} {{bm25}} + Dense + {{reranker}} แทน Dense-only (Decision) เพราะคำถามองค์กรมีรหัสใบแจ้งหนี้เช่น `INV-2026-009` และคำประสมภาษาไทยที่ vector พลาด (Context) ข้อเสียคือเพิ่มความซับซ้อนของ index และ latency ~180 ms (Trade-off) แต่ช่วยดัน `Recall@5` จาก `0.71` ขึ้นมาที่ `0.88` ซึ่งผ่านเกณฑ์ `>= 0.85` โดย P95 รวมยังอยู่ที่ `2.84 s` (Evidence)\"*",
      ],
      analogy: "เหมือนการสอบปากเปล่าของสถาปนิก — กรรมการไม่ได้ถามว่าอิฐก้อนนี้สีอะไร แต่ถามว่าทำไมเลือกคานเหล็กแทนไม้ รับน้ำหนักเพิ่มได้เท่าไร และต้องแลกกับงบที่เพิ่มขึ้นแค่ไหน",
      bullets: [
        "**คำถามที่ 1 (Retrieval)**: ทำไมใช้ Hybrid PyThaiNLP BM25 + Dense + Reranker แทน Dense-only?",
        "**คำถามที่ 2 (Agent Safety)**: ทำไมใช้ Bounded {{langgraph}} Router + {{hitl}} แทน Free-form ReAct Agent?",
        "**คำถามที่ 3 (Security & PDPA)**: แค่เขียนบอกใน System Prompt ว่าห้ามเปิดเผยข้อมูลลูกค้าพอไหม? (ไม่พอ — ต้องใช้ deterministic regex/middleware + least-privilege)",
        "**คำถามที่ 4 (Resilience & Cost)**: ถ้า LLM API ล่มหรือแพงเกินงบ ทำอย่างไร? (Timeout + Circuit Breaker + Fallback + Caching/Tiering + Langfuse)",
      ],
      whyTitle: "Why this matters — แสดงความต่างระหว่าง 'ผู้ใช้ API' กับ 'AI Engineer'",
      whyParagraphs: [
        "ใคร ๆ ก็เรียก API โมเดลเก่ง ๆ ได้ใน 10 บรรทัด แต่วิศวกร AI คือคนที่อธิบายได้ว่าทุกชิ้นส่วนมีราคาที่ต้องจ่าย (latency, token cost, complexity) และใช้ข้อมูล {{golden-dataset}} / {{ragas}} พิสูจน์ว่าสิ่งที่จ่ายไปคุ้มค่า",
        "การเขียนคำตอบทั้ง 5–6 ข้อลงในคลัง Q&A ส่วนตัวแล้วซ้อมพูดออกเสียง 2–3 รอบ จะช่วยลดอาการตื่นเต้นและทำให้ตอบได้กระชับในเวลาไม่เกิน 60–90 วินาทีต่อข้อ",
      ],
    },
    {
      id: "demo-hygiene-and-preflight",
      title: "3 · Demo Pre-Flight Hygiene: กันพังหน้ากล้องและกันข้อมูลลับรั่วบนจอ",
      paragraphs: [
        "ความผิดพลาดสุดคลาสสิกของการอัด Demo หรือ Live Defense คือ **(1) ลืม seed ฐานข้อมูลจำลอง** ทำให้กดค้นหา `ORD-2026-104` แล้วขึ้น Empty, **(2) เผลอเปิดไฟล์ `.env` ที่มี API Key จริง** ติดเข้าไปในเฟรมวิดีโอ, และ **(3) ยิงคำถามสดตอนเน็ตช้า** จนรอ response เงียบกริบ 20 วินาที",
        "ก่อนกด Record ทุกครั้งให้ทำ **Pre-Flight Check**: ล้างและ seed SQLite/Vector DB ให้พร้อม, เปิดโหมด mock/fallback เตรียมไว้กรณี API หลักสะดุด, ปิด notification ของ OS, ซ่อน bookmarks และตรวจว่าไม่มีไฟล์ความลับเปิดค้างใน editor, และตั้งนาฬิกาจับเวลา 3 นาทีไว้ข้างจอ",
      ],
      analogy: "เหมือนเช็กลิสต์นักบินก่อนเครื่องขึ้น — ต่อให้บินเส้นทางเดิมมาแล้วร้อยครั้ง ก็ยังต้องไล่เช็กน้ำมัน ล็อกประตู และวิทยุสื่อสารก่อนเร่งเครื่องเสมอ",
      code: {
        language: "bash",
        filename: "demo_preflight.sh",
        code: `# 1. ตรวจว่าชุดเทสต์ทั้งหมดผ่านก่อนเปิดกล้อง
uv run pytest -q
# 2. ตรวจ git status ว่าไม่มี .env หรือ secret หลุด
git status -s
# 3. เตรียม seed DB + เปิด FastAPI ในโหมด deterministic หรือ staging`,
        caption: "เช็กลิสต์ 3 คำสั่งก่อนกดปุ่ม Record เพื่อไม่ให้เดโมสะดุดหรือทำข้อมูลลับหลุดเข้าวิดีโอ",
      },
      bullets: [
        "**Seed Data Reset**: รีเซ็ตสถานะ DB ก่อนอัดเพื่อให้ HITL Approve เพิ่มแถวได้อย่างสะอาด",
        "**Secret Screen Hygiene**: ปิดแท็บ `.env`, cloud billing console, และอีเมลส่วนตัวก่อนแชร์หน้าจอ",
        "**Plan B Ready**: หาก Live API ช้าหรือติด rate limit ระหว่างเดโม ต้องสลับไปใช้ mock/local fallback mode ได้ใน 1 flag",
      ],
      whyTitle: "Why this matters — รักษาจังหวะการเล่าเรื่องและมาตรฐานความปลอดภัย",
      whyParagraphs: [
        "วิดีโอที่ไหลลื่นโดยไม่มีช่วงรอ error 40 วินาทีหรือตัดต่อสะดุด ทำให้ผู้ชมเชื่อมั่นในความเสถียรของระบบที่คุณสร้าง",
        "และในทางกลับกัน ถ้าเผลอให้ API key ติดในวิดีโอแม้แต่วินาทีเดียวแล้วอัปโหลดขึ้น YouTube/GitHub คุณต้องรีบ revoke key ทันที — การตรวจ Pre-Flight จึงคุ้มค่ากว่ามาก",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Sprint Demo & System Design Interview สู่ AI Technical Defense",
      body: [
        "ในทีมซอฟต์แวร์ทั่วไป คุณเคยทำ Sprint Demo และตอบ System Design Interview (เช่น ทำไมเลือก Postgres แทน MongoDB, ทำไมติด Redis cache) — ของฝั่ง AI Engineer ใช้ทักษะเดียวกันเป๊ะ เพียงแค่เปลี่ยนหัวข้อจาก Database/Cache ไปเป็น **Retrieval, Agent Control, Eval Metrics และ Cost/PDPA Trade-off**",
      ],
      table: [
        ["Sprint Demo (Happy Path + Error State)", "3-Minute AI Demo (RAG + HITL + Injection/Fallback)"],
        ["Why SQL vs NoSQL Trade-off", "Why Hybrid BM25+Dense vs Dense-only & Bounded Router"],
        ["APM Waterfall (Datadog / Jaeger)", "Langfuse GenAI Trace Waterfall + Token Cost"],
        ["Pre-Demo Seed & Env Check", "Seed SQLite/Corpus + Secret Screen Check + Offline Fallback"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีซ้อมพูดไม่ให้ตื่นเต้นและไม่ท่องจำสคริปต์",
      body: [
        "นักศึกษามักเขียนสคริปต์คำต่อคำแล้วพยายามอ่านตาม ทำให้เสียงแข็งและลืมทันทีเมื่อสะดุด วิธีที่ดีกว่าคือจำแค่ **5 Bullet หัวข้อของ Storyboard** กับ **ตัวเลขสำคัญ 4 ค่า (`Recall@5`, `Faithfulness`, `P95`, `Cost`)** แล้วพูดอธิบายเหมือนกำลังเล่าให้เพื่อนร่วมโปรเจกต์ฟัง",
        "ลองอัดรอบแรกแบบไม่หยุดแม้พูดผิด ดูย้อนหลัง 1 รอบเพื่อตัดคำฟุ่มเฟือย แล้วอัดรอบสอง — แค่ 2 รอบคุณภาพวิดีโอจะดีขึ้นแบบก้าวกระโดด",
      ],
    },
  },

  workedExample: {
    intro:
      "มาสร้างตัวตรวจสอบ **3-Minute Demo Storyboard** และ **Interview Q&A Bank** ด้วย `Pydantic v2` เพื่อเช็กให้แน่ใจว่าแผนการเดโมและคำตอบสัมภาษณ์ของคุณครบถ้วนและไม่เกินเวลา กด **ขั้นต่อไป** เพื่อดูทีละส่วน",
    steps: [
      {
        title: "1 · นิยาม Schema สำหรับ Demo Chapter และงบเวลา 180 วินาที",
        explain:
          "บังคับว่าแต่ละช่วงของเดโมต้องมีเวลาเป็นบวก และผลรวมของทุกช่วงต้องไม่เกิน `180` วินาที รวมถึงต้องครอบคลุมครบ 5 หัวข้อสำคัญของ Capstone",
        code: {
          language: "python",
          filename: "worked_demo_prep.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field, model_validator

DemoTopic = Literal[
    "hook_arch",
    "rag_abstention",
    "mcp_hitl",
    "defense_fallback",
    "telemetry_scorecard",
]


class DemoChapter(BaseModel):
    topic: DemoTopic
    duration_sec: int = Field(gt=0, le=90)
    action_on_screen: str = Field(min_length=10)


class DemoStoryboard(BaseModel):
    title: str = Field(min_length=5)
    chapters: list[DemoChapter] = Field(min_length=5)
    max_total_sec: int = 180

    @model_validator(mode="after")
    def validate_budget_and_coverage(self) -> "DemoStoryboard":
        total = sum(c.duration_sec for c in self.chapters)
        if total > self.max_total_sec:
            raise ValueError(f"total duration {total}s exceeds {self.max_total_sec}s")
        required: set[str] = {
            "hook_arch",
            "rag_abstention",
            "mcp_hitl",
            "defense_fallback",
            "telemetry_scorecard",
        }
        present = {c.topic for c in self.chapters}
        missing = required - present
        if missing:
            raise ValueError(f"missing demo chapters: {sorted(missing)}")
        return self`,
        },
      },
      {
        title: "2 · นิยาม Schema สำหรับ Interview Q&A ที่บังคับ Trade-off และ Evidence",
        explain:
          "ป้องกันการเตรียมคำตอบแบบท่องจำลอย ๆ โดยบังคับให้ทุกข้อใน Q&A Bank ต้องมี `decision`, `tradeoff` และ `metric_evidence`",
        code: {
          language: "python",
          filename: "worked_demo_prep.py",
          code: `class InterviewQA(BaseModel):
    question_id: str
    question: str = Field(min_length=10)
    decision: str = Field(min_length=15)
    tradeoff: str = Field(min_length=15)
    metric_evidence: str = Field(min_length=10)`,
        },
      },
      {
        title: "3 · ทดสอบตรวจสอบ Storyboard 3 นาทีและคลัง Q&A ตัวอย่าง",
        explain:
          "ลอง validate แผนเดโม 5 ช่วงรวม 180 วินาที และข้อ Q&A เรื่อง Hybrid RAG — หากทุกอย่างครบจะได้สรุปเวลาที่ใช้ทันที",
        code: {
          language: "python",
          filename: "worked_demo_prep.py",
          code: `board = DemoStoryboard(
    title="Thai/Bilingual Enterprise AI Assistant — 3-Min Demo",
    chapters=[
        DemoChapter(topic="hook_arch", duration_sec=25, action_on_screen="Show README Mermaid diagram & 3 routes"),
        DemoChapter(topic="rag_abstention", duration_sec=50, action_on_screen="Ask TH/EN policy + out-of-scope abstention"),
        DemoChapter(topic="mcp_hitl", duration_sec=45, action_on_screen="Lookup ORD-2026-104 masked + HITL approve"),
        DemoChapter(topic="defense_fallback", duration_sec=35, action_on_screen="Show PDPA mask, injection block, timeout fallback"),
        DemoChapter(topic="telemetry_scorecard", duration_sec=25, action_on_screen="Show Langfuse waterfall & Recall@5/P95/Cost"),
    ],
)
qa = InterviewQA(
    question_id="QA-01",
    question="Why PyThaiNLP BM25 + Dense + Reranker instead of Dense-only?",
    decision="Use RRF hybrid search with PyThaiNLP tokenization plus Cross-Encoder reranking.",
    tradeoff="Adds ~180ms retrieval latency and BM25 index upkeep vs pure vector search.",
    metric_evidence="Recall@5 improved from 0.71 to 0.88 on 40-case Thai/EN golden set.",
)
print(f"Storyboard OK: {sum(c.duration_sec for c in board.chapters)}s | QA {qa.question_id} verified")`,
        },
        output: `Storyboard OK: 180s | QA QA-01 verified`,
      },
    ],
    gotcha:
      "จุดสังเกต: เวลาพูดจริงมักช้ากว่าตอนอ่านในใจประมาณ 15–20% — ดังนั้นในการอัดจริงควรตั้งเป้าเนื้อหาให้จบที่ ~155–165 วินาทีเพื่อเผื่อจังหวะหายใจและการโหลดหน้าจอ",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/demo_readiness.py` เพื่อตรวจสอบความพร้อมของ Demo Storyboard 3 นาที, คลัง Interview Q&A ระดับ Junior AI Engineer และ Pre-Flight Screen Check ก่อนบันทึกวิดีโอจริง",
    requirements: [
      "สร้าง `DemoChapter(BaseModel)` (`topic` หนึ่งใน 5 ค่า, `duration_sec > 0`, `action_on_screen` ยาว >= 10, `has_secret_exposure: bool = False`) และ `DemoStoryboard(BaseModel)` ที่บังคับผลรวมเวลา `<= 180` วินาที, ครบทั้ง 5 topics, และต้องไม่มี chapter ใดที่ `has_secret_exposure == True`",
      "สร้าง `InterviewQAItem(BaseModel)` ที่มี `qa_id` (ขึ้นต้น `\"QA-\"`), `category: Literal[\"rag\", \"agents\", \"security\", \"ops_cost\"]`, `question`, `decision`, `tradeoff`, `metric_evidence` (ยาว >= 8 ทุกช่อง)",
      "สร้าง `DemoDefensePack(BaseModel)` ที่รวม `storyboard: DemoStoryboard` และ `qa_bank: list[InterviewQAItem]` โดยบังคับให้ `qa_bank` มีอย่างน้อย 4 ข้อและต้องครอบคลุมครบทั้ง 4 categories (`rag`, `agents`, `security`, `ops_cost`)",
      "สร้างฟังก์ชัน `validate_defense_pack(payload: dict) -> DemoDefensePack` และ `summarize_demo_timeline(pack: DemoDefensePack) -> list[str]` ที่คืนรายการช่วงเวลาแบบ `\"00:00-00:25 | hook_arch | ...\"`",
    ],
    starter: {
      language: "python",
      filename: "src/demo_readiness.py",
      code: `from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator

DemoTopic = Literal[
    "hook_arch",
    "rag_abstention",
    "mcp_hitl",
    "defense_fallback",
    "telemetry_scorecard",
]

QACategory = Literal["rag", "agents", "security", "ops_cost"]


class DemoChapter(BaseModel):
    topic: DemoTopic
    duration_sec: int = Field(gt=0, le=90)
    action_on_screen: str = Field(min_length=10)
    has_secret_exposure: bool = False


class DemoStoryboard(BaseModel):
    title: str = Field(min_length=5)
    chapters: list[DemoChapter] = Field(min_length=5)

    @model_validator(mode="after")
    def check_storyboard(self) -> "DemoStoryboard":
        # TODO: ตรวจเวลา <= 180s, ครบทั้ง 5 topics, ไม่มี secret exposure
        return self


class InterviewQAItem(BaseModel):
    qa_id: str
    category: QACategory
    question: str = Field(min_length=8)
    decision: str = Field(min_length=8)
    tradeoff: str = Field(min_length=8)
    metric_evidence: str = Field(min_length=8)

    @field_validator("qa_id")
    @classmethod
    def check_qa_prefix(cls, v: str) -> str:
        # TODO: ตรวจ prefix "QA-"
        return v


class DemoDefensePack(BaseModel):
    storyboard: DemoStoryboard
    qa_bank: list[InterviewQAItem] = Field(min_length=4)

    @model_validator(mode="after")
    def check_category_coverage(self) -> "DemoDefensePack":
        # TODO: ตรวจว่า qa_bank มีครบทั้ง 4 categories
        return self


def validate_defense_pack(payload: dict) -> DemoDefensePack:
    raise NotImplementedError


def summarize_demo_timeline(pack: DemoDefensePack) -> list[str]:
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_demo_readiness.py",
      code: `import pytest
from pydantic import ValidationError
from src.demo_readiness import summarize_demo_timeline, validate_defense_pack


def _valid_pack() -> dict:
    return {
        "storyboard": {
            "title": "Thai/Bilingual Enterprise AI Assistant Demo",
            "chapters": [
                {"topic": "hook_arch", "duration_sec": 25, "action_on_screen": "Show README Mermaid diagram & 3 routes"},
                {"topic": "rag_abstention", "duration_sec": 50, "action_on_screen": "Run TH/EN FAQ + unanswerable abstention"},
                {"topic": "mcp_hitl", "duration_sec": 45, "action_on_screen": "Order lookup masked + HITL approve"},
                {"topic": "defense_fallback", "duration_sec": 35, "action_on_screen": "PDPA mask + injection block + fallback"},
                {"topic": "telemetry_scorecard", "duration_sec": 25, "action_on_screen": "Langfuse trace + Recall@5/P95/Cost table"},
            ],
        },
        "qa_bank": [
            {
                "qa_id": "QA-01",
                "category": "rag",
                "question": "Why Hybrid BM25 + Dense instead of Dense-only?",
                "decision": "Combine PyThaiNLP BM25 with Dense + Cross-Encoder Rerank.",
                "tradeoff": "Adds ~180ms latency and index maintenance overhead.",
                "metric_evidence": "Recall@5 reached 0.88 vs 0.71 dense-only.",
            },
            {
                "qa_id": "QA-02",
                "category": "agents",
                "question": "Why bounded LangGraph router instead of free ReAct?",
                "decision": "Use explicit router edges + HITL gate for write tools.",
                "tradeoff": "Less ad-hoc flexibility for unforeseen multi-step tasks.",
                "metric_evidence": "0 unapproved writes and 99.5% schema validity.",
            },
            {
                "qa_id": "QA-03",
                "category": "security",
                "question": "How do you prevent PDPA leaks and prompt injection?",
                "decision": "Run regex/Pydantic PDPA mask + input/output guardrails.",
                "tradeoff": "May slightly over-mask numeric sequences resembling Thai IDs.",
                "metric_evidence": "95% red-team pass rate and 0 PDPA leaks.",
            },
            {
                "qa_id": "QA-04",
                "category": "ops_cost",
                "question": "How do you handle LLM timeout and control token cost?",
                "decision": "Set httpx timeout + circuit breaker + snippet fallback + cache.",
                "tradeoff": "Fallback replies are less conversational during outages.",
                "metric_evidence": "P95=2,840ms and $1.42 per 1,000 queries.",
            },
        ],
    }


def test_valid_pack_and_timeline_formatting():
    pack = validate_defense_pack(_valid_pack())
    timeline = summarize_demo_timeline(pack)
    assert len(timeline) == 5
    assert timeline[0].startswith("00:00-00:25 | hook_arch |")
    assert timeline[-1].startswith("02:35-03:00 | telemetry_scorecard |")


def test_reject_over_180s_or_secret_exposure():
    bad = _valid_pack()
    bad["storyboard"]["chapters"][1]["duration_sec"] = 90
    with pytest.raises(ValidationError):
        validate_defense_pack(bad)

    bad_secret = _valid_pack()
    bad_secret["storyboard"]["chapters"][0]["has_secret_exposure"] = True
    with pytest.raises(ValidationError):
        validate_defense_pack(bad_secret)


def test_reject_missing_qa_category_or_bad_id():
    bad = _valid_pack()
    bad["qa_bank"][3]["category"] = "rag"
    with pytest.raises(ValidationError):
        validate_defense_pack(bad)

    bad_id = _valid_pack()
    bad_id["qa_bank"][0]["qa_id"] = "ITEM-1"
    with pytest.raises(ValidationError):
        validate_defense_pack(bad_id)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_demo_readiness.py` ผ่านครบทั้ง 3 test cases",
      "ลองซ้อมพูดตาม timeline ทั้ง 5 ช่วงจริงโดยจับเวลาไม่ให้เกิน 180 วินาที",
      "ตรวจคำตอบ Q&A ของตัวเองครบ 4 หมวด (`rag`, `agents`, `security`, `ops_cost`) โดยทุกข้อมีทั้ง Trade-off และตัวเลขจริง",
      "รัน `uv run ruff check .` ไม่พบ lint warning หรือ error",
    ],
    acceptance: "ผ่านทั้ง 3 test cases ใน `tests/test_demo_readiness.py` และพร้อมอัดวิดีโอเดโม 3 นาที + เข้าสู่ Final Defense (Day 180)",
    hints: [
      {
        body: "ใน `summarize_demo_timeline` ใช้ตัวแปรสะสม `cursor = 0` แล้วจัดรูปเวลาด้วย `f\"{cursor // 60:02d}:{cursor % 60:02d}-{end // 60:02d}:{end % 60:02d}\"` ก่อนอัปเดต `cursor = end`",
      },
      {
        body: "ใน `DemoStoryboard.check_storyboard` ตรวจทั้ง 3 เงื่อนไขพร้อมโยน `ValueError` เมื่อผิด: (1) `sum(c.duration_sec for c in self.chapters) > 180`, (2) `any(c.has_secret_exposure for c in self.chapters)`, และ (3) ขาดหัวข้อใดใน 5 `DemoTopic`",
      },
      {
        body: "ตัวอย่างเมธอดตรวจสอบใน `DemoStoryboard` และ `summarize_demo_timeline`:",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def summarize_demo_timeline(pack: DemoDefensePack) -> list[str]:
    lines: list[str] = []
    cursor = 0
    for ch in pack.storyboard.chapters:
        end = cursor + ch.duration_sec
        start_str = f"{cursor // 60:02d}:{cursor % 60:02d}"
        end_str = f"{end // 60:02d}:{end % 60:02d}"
        lines.append(f"{start_str}-{end_str} | {ch.topic} | {ch.action_on_screen}")
        cursor = end
    return lines`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_demo_readiness.py
uv run ruff check .`,
      caption: "ตรวจ Storyboard 3 นาทีและคลังคำตอบสัมภาษณ์ให้ครบทั้ง 4 มิติก่อนอัดวิดีโอ",
    },
  },

  mistakes: [
    {
      title: "ใช้ 1.5 นาทีแรกไปกับการอธิบายประวัติโปรเจกต์และการติดตั้ง `uv`",
      symptom: "วิดีโอเดโมหมดเวลา 3 นาทีแล้วยังไม่ทันโชว์ HITL, PDPA Guardrail หรือ Langfuse Trace",
      fix: "คุมเวลา 0:00–0:25 สำหรับ Hook + แผนภาพสถาปัตยกรรมเท่านั้น แล้วเข้าสู่การทำงานจริงทันที",
    },
    {
      title: "โชว์แต่ Happy Path ไม่โชว์ Edge Case และความปลอดภัย",
      symptom: "เดโมดูเหมือนแชตบอททั่วไปที่ใคร ๆ ก็สร้างได้ภายในครึ่งชั่วโมง ไม่เห็นคุณค่าของ Phase 4–5",
      fix: "บังคับใส่ฉาก Abstention, HITL Pause/Approve, PDPA/Injection Defense และ Timeout Fallback ลงใน Storyboard",
    },
    {
      title: "ตอบคำถามสัมภาษณ์แบบท่องนิยาม ไม่ยอมพูดเรื่อง Trade-off",
      symptom: "เมื่อถูกถามว่าทำไมเลือก Hybrid Search หรือ Hosted API ตอบแค่ว่า 'เพราะมันดีที่สุดและทันสมัย'",
      fix: "ฝึกตอบด้วยโครง *Decision → Trade-off → Metric Evidence* โดยยอมรับข้อจำกัดที่แลกมาอย่างตรงไปตรงมา",
    },
    {
      title: "อัดหน้าจอโดยเปิดไฟล์ `.env` หรือ API Key ค้างไว้ในแถบ Editor",
      symptom: "API key จริงหลุดอยู่ในวิดีโอเดโมที่อัปโหลดขึ้นพอร์ตโฟลิโอสาธารณะ",
      fix: "ทำ Pre-Flight Check ปิดไฟล์ config จริงและตรวจ `git status` ก่อนกดอัดทุกครั้ง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d179-q1",
        "ในวิดีโอ Technical Demo 3 นาที ช่วง **0:00–0:25 (25 วินาทีแรก)** ควรนำเสนออะไรเพื่อให้ผู้ชมสนใจดูจนจบ?",
        [
          ["เปิดให้ดูวิธีสร้าง virtual environment และรัน `pip install` ทีละบรรทัด", "ทำให้เสียจังหวะและคนดูจะกดข้ามทันที"],
          ["สรุปปัญหาองค์กรไทยที่แก้ + แผนภาพสถาปัตยกรรมจาก `README.md` และ 3 เส้นทางหลักของระบบ", "ถูก — เปิด Hook ที่ชัดเจนและวางภาพรวมสถาปัตยกรรมให้คนดูเข้าใจบริบทก่อนเข้าสู่ Live Flow"],
          ["อ่านไฟล์ `pyproject.toml` และรายชื่อแพ็กเกจทั้งหมด", "ไม่สื่อคุณค่าของระบบต่อผู้ชม"],
          ["เปิดสไลด์ประวัติส่วนตัว 5 หน้าก่อนเข้าเรื่อง", "ควรเก็บไว้ใน CV — เดโมเทคนิคควรเข้าเนื้อหาระบบทันที"],
        ],
        "B",
        "25 วินาทีแรกควรวางกรอบปัญหาและสถาปัตยกรรมให้ชัด เพื่อให้คนดูเข้าใจว่าทุกฟีเจอร์ที่จะโชว์ต่อไปแก้ปัญหาอะไร",
        "ช่วง 25 วินาทีแรกของ Technical Demo 3 นาทีควรนำเสนออะไร?",
        "Hook ปัญหาจริงที่แก้, แผนภาพสถาปัตยกรรม 1 ภาพ, และ 3 เส้นทางหลักที่กำลังจะสาธิตให้ดู",
      ),
      mc(
        "d179-q2",
        "ในการเตรียมคำตอบสัมภาษณ์ตำแหน่ง Junior AI Engineer ข้อใดสะท้อนการตอบแบบ **Decision → Trade-off → Evidence** ได้ดีที่สุด?",
        [
          ["\"ผมใช้ LangGraph เพราะกำลังฮิตและทุกบริษัทใช้กัน\"", "ไม่มีเหตุผลเชิงข้อจำกัด ไม่มี Trade-off และไม่มีตัวเลขพิสูจน์"],
          ["\"ระบบเราไม่มีข้อเสียเลยเพราะใช้เทคโนโลยีล่าสุดทั้งหมด\"", "ขาดความน่าเชื่อถือ — ทุกระบบมี Trade-off เสมอ"],
          ["\"เราเลือก Bounded LangGraph Router + HITL แทน Free-form ReAct (Decision) ยอมลดความยืดหยุ่นแบบ open-ended (Trade-off) เพื่อคุม 0 unapproved writes และ 99.5% schema pass บนชุด 40 ข้อ (Evidence)\"", "ถูก — ครบทั้งสิ่งที่เลือก, ราคาที่ยอมจ่าย, และหลักฐานตัวเลขจริง"],
          ["\"ผมให้ AI เขียนโค้ดให้ทั้งหมดเลยจำไม่ได้ว่าข้างในทำอะไรบ้าง\"", "ผู้สัมภาษณ์ต้องการวิศวกรที่เข้าใจและรับผิดชอบการออกแบบระบบได้จริง"],
        ],
        "C",
        "คำตอบระดับวิศวกรต้องบอกได้ทั้ง Decision, Trade-off ที่ยอมรับได้, และ Metric Evidence ที่วัดจากระบบจริง",
        "กรอบ 3 ส่วนในการตอบคำถามสัมภาษณ์เชิงสถาปัตยกรรมคืออะไร?",
        "Decision (เลือกอะไรและทำไม) → Trade-off (แลกกับข้อเสียหรือต้นทุนอะไร) → Evidence (ตัวเลข Eval/Latency/Cost ที่พิสูจน์ผล)",
      ),
      mc(
        "d179-q3",
        "เหตุใดใน Demo 3 นาทีจึงควรจัดเวลาโชว์ **Abstention (ปฏิเสธคำตอบ)** และ **PDPA / HITL Gate** ด้วย แทนที่จะโชว์เฉพาะคำถาม RAG ที่ตอบถูก?",
        [
          ["เพื่อยืดเวลาวิดีโอให้ครบ 3 นาทีพอดี", "ไม่ใช่เรื่องถ่วงเวลา แต่เป็นจุดพิสูจน์สำคัญที่สุดของระบบองค์กร"],
          ["เพราะลูกค้าและผู้สัมภาษณ์อยากเห็นว่าเมื่อเจอคำถามนอกขอบเขตหรือคำสั่งอันตราย ระบบ 'ไม่หลอน' และ 'ไม่ทำข้อมูลพัง'", "ถูก — การคุม failure modes และ safety boundary คือสิ่งที่แยกระบบ Production ออกจากเดโมทั่วไป"],
          ["เพราะคำถามที่ตอบถูกมักไม่มี citation ให้โชว์", "คำถาม RAG ที่ตอบถูกก็มี `[doc#chunk]` citation ให้โชว์เช่นกัน"],
          ["เพื่อหลีกเลี่ยงการเปิดหน้าต่าง Langfuse", "ควรโชว์ทั้ง Safety Gates และ Langfuse Trace ในเดโมเดียวกัน"],
        ],
        "B",
        "ระบบ AI องค์กรถูกตัดสินความน่าเชื่อถือจากพฤติกรรมในจุดเสี่ยง (Abstention, PDPA Masking, HITL Approval, Fallback) มากกว่าการตอบคำถามง่าย ๆ",
        "ทำไม Demo ระบบ AI องค์กรต้องโชว์ทั้ง Abstention, PDPA/HITL และ Fallback ไม่ใช่แค่ Happy Path?",
        "เพื่อพิสูจน์ว่าระบบไม่หลอนเมื่อไม่มีข้อมูล, ไม่รั่ว PII ตาม PDPA, ไม่แก้ข้อมูลโดยพลการ, และไม่ล่มเมื่อ LLM ขัดข้อง",
      ),
      mc(
        "d179-q4",
        "ข้อใดคือ **Pre-Flight Check** ที่สำคัญที่สุดก่อนกดอัดหน้าจอ Live Demo?",
        [
          ["ลบ unit test ออกชั่วคราวเพื่อให้โฟลเดอร์ดูโล่ง", "ไม่ควรลบ test — ควรตรวจสอบว่า test ผ่านทั้งหมดต่างหาก"],
          ["รีเซ็ตข้อมูลจำลอง (Seed DB), ตรวจว่าไม่มี `.env`/API Key เปิดค้างบนจอ, และเตรียมโหมด Fallback สำรอง", "ถูก — ช่วยให้เดโมไหลลื่น ไม่มีข้อมูลค้างจากรอบซ้อม และไม่ทำ secret รั่วในวิดีโอ"],
          ["ตั้งค่าความละเอียดหน้าจอเป็น 4K พร้อมฟอนต์ขนาด 8pt", "ฟอนต์เล็กเกินไปจนคนดูอ่านโค้ดหรือผลลัพธ์ไม่เห็น — ควรขยายฟอนต์ให้ใหญ่ขึ้น"],
          ["ปิด Circuit Breaker และ Timeout เพื่อให้โมเดลรอได้ไม่จำกัด", "ถ้าโมเดลค้างระหว่างอัด จะทำให้เดโมค้างไปด้วย"],
        ],
        "B",
        "Pre-Flight Hygiene ช่วยป้องกันทั้งอาการเดโมสะดุดจากข้อมูลไม่สะอาดและอุบัติเหตุทำ API key รั่วเข้าวิดีโอ",
        "ก่อนกดอัดวิดีโอ Technical Demo ควรตรวจ Pre-Flight Check 3 ข้อหลักอะไรบ้าง?",
        "1) รีเซ็ต Seed Data และรัน test ให้เขียว, 2) ตรวจหน้าจอซ่อน `.env`/API keys/แจ้งเตือนส่วนตัว, 3) ขยายฟอนต์และเตรียม Fallback mode สำรอง",
      ),
    ],
  },

  takeaways: [
    "แบ่งเวลา **Technical Demo 3 นาที (180 วินาที)** เป็น 5 องก์คมชัด: Hook/Arch (`25s`) → RAG/Abstention (`50s`) → MCP/HITL (`45s`) → Defense/Fallback (`35s`) → {{langfuse}}/Scorecard (`25s`)",
    "ตอบคำถามสัมภาษณ์ด้วยสูตร **Decision → Trade-off → Evidence** โดยผูกกับตัวเลขจริงจาก `README.md` และ `docs/ADR-001.md`",
    "ทำ **Pre-Flight Hygiene** ทุกครั้งก่อนอัด: seed DB ใหม่, ซ่อน `.env`/secrets บนหน้าจอ, ขยายฟอนต์ให้ชัด และมีแผนสำรองแบบ offline fallback",
    "ก้าวต่อไปใน **Day 180 (Final Defense)** คือการตรวจรับครบ 4 เสาหลักของ Capstone Rubric และจบหลักสูตร 180 วันอย่างสมบูรณ์",
  ],

  reviewCards: [
    rc(
      "d179-rc-1",
      "5 องก์ของ Technical Demo 3 นาที (180 วินาที) มีอะไรบ้าง?",
      "1) Hook & Architecture (25s), 2) Bilingual RAG + Abstention (50s), 3) MCP Read Lookup + HITL Approve (45s), 4) PDPA/Injection Defense + Timeout Fallback (35s), 5) Langfuse Trace + Eval/Cost Scorecard (25s)",
    ),
    rc(
      "d179-rc-2",
      "สูตร 3 ขั้นสำหรับการตอบคำถามสัมภาษณ์สาย AI Engineer เมื่อถูกถามว่า 'ทำไมเลือกสถาปัตยกรรมนี้?' คืออะไร?",
      "Decision (เลือกอะไรเพื่อแก้บริบทไหน) → Trade-off (ยอมแลกต้นทุน/latency/ความซับซ้อนอะไร) → Evidence (ตัวเลขจริงจาก Golden Dataset, Ragas, Load Test)",
    ),
    rc(
      "d179-rc-3",
      "หากผู้สัมภาษณ์ถามว่า 'ทำไมไม่ใช้ Autonomous ReAct Agent แทน Bounded LangGraph Router?' ควรตอบอย่างไร?",
      "Bounded Router + HITL gate ลดความเสี่ยง infinite loop และ Excessive Agency (OWASP LLM06) แลกกับการไม่รองรับ multi-step นอกสคริปต์อิสระ โดยได้ผลจริงคือ 0 unapproved writes และ Schema >= 99%",
    ),
  ],

  sources: [
    { label: "Anthropic — Building Effective Agents (Workflows vs Agents)", href: "https://www.anthropic.com/research/building-effective-agents" },
    { label: "Langfuse — Tracing & Observability Overview", href: "https://langfuse.com/docs/tracing" },
    { label: "OWASP Top 10 for LLM Applications", href: "https://genai.owasp.org/llm-top-10/" },
  ],

  glossary: [
    "adr",
    "rag",
    "abstention",
    "mcp",
    "hitl",
    "pdpa",
    "prompt-injection",
    "langgraph",
    "langfuse",
    "golden-dataset",
  ],
});
