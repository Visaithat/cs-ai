import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D111 — Phase 4 / Block B28
 * Anthropic's 5 Workflow Patterns: Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer
 */
export const d111: Lesson = defineLesson({
  day: 111,
  titleTh: "Anthropic's 5 Workflow Patterns: Chaining, Routing, Parallelization, Orchestrator-Workers และ Evaluator-Optimizer",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · เลือกใช้ Deterministic Workflow แทน Autonomous Agent ที่ซับซ้อนเกินจำเป็น พร้อมสร้างครบทั้ง 5 แพตเทิร์นใน Python",
  icon: "workflow",
  visual: {
    id: "anthropic-workflows",
    title: "Anthropic's 5 Composable Workflow Patterns vs Autonomous Agent",
    caption: "คลิกสำรวจโครงสร้างทั้ง 5 แพตเทิร์น: Prompt Chaining, Routing, Parallelization, Orchestrator-Workers และ Evaluator-Optimizer",
    alt: "แผนภาพ 5 Workflow Patterns ของ Anthropic",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — จำลองทั้ง 5 Workflow Patterns ด้วย Python & asyncio ทดสอบด้วย pytest",
  tools: ["Python 3.12", "asyncio", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "กฎทองของ Anthropic: เริ่มจากโซลูชันที่เรียบง่ายที่สุด และใช้ Agent เมื่อจำเป็นจริงเท่านั้น",
      body: "ในบทความคลาสสิก *Building Effective Agents* ของ Anthropic มีข้อค้นพบสำคัญจากการทำระบบ Production จริง: ทีมที่ประสบความสำเร็จสูงสุดไม่ได้เริ่มจากการใช้ Autonomous Agent Framework ที่ซับซ้อน แต่เริ่มจาก **Composable {{workflow-patterns}}** ที่ควบคุมเส้นทางด้วยโค้ด Python ธรรมดา",
      lessonNote: "Workflow คือระบบที่โค้ดเป็นคนกำหนดลำดับขั้น (Deterministic Code Path) ส่วน Agent คือระบบที่ปล่อยให้ LLM ตัดสินใจเลือกก้าวถัดไปเองในลูป",
    },
    {
      node: 2,
      heading: "รู้จัก 3 แพตเทิร์นพื้นฐาน: Prompt Chaining, Routing และ Parallelization",
      body: "งานกว่า 80% ในบริษัทสามารถแก้ได้ด้วย 3 แพตเทิร์นแรก: **(1) Prompt Chaining** แยกงานเป็นขั้นย่อยพร้อม Gate Check คั่นกลาง, **(2) Routing** จำแนกเจตนาคำถามแล้วส่งเข้าสายเฉพาะทาง และ **(3) Parallelization** รันหลายการตรวจสอบพร้อมกันด้วย {{asyncio}}",
      lessonNote: "ทั้ง 3 แพตเทิร์นนี้คาดเดาจำนวนรอบ ต้นทุน และ Latency ได้ 100% เพราะไม่มีลูปเปิดกว้าง",
    },
    {
      node: 4,
      heading: "รู้จัก 2 แพตเทิร์นขั้นสูง: Orchestrator-Workers และ Evaluator-Optimizer",
      body: "เมื่องานมีส่วนย่อยที่คาดเดาล่วงหน้าไม่ได้ เราใช้ **(4) Orchestrator-Workers** ให้ตัวแม่แตกโจทย์ย่อยส่งให้ลูกทีมทำขนานกัน หรือเมื่อต้องการยกระดับคุณภาพคำตอบให้ผ่านเกณฑ์ (เช่น ตรวจ {{groundedness}} citations) เราใช้ **(5) Evaluator-Optimizer** ที่มีตัวตรวจสั่งแก้ซ้ำไม่เกิน `max_rounds`",
      lessonNote: "สังเกตว่าแม้แต่ใน Evaluator-Optimizer เราก็บังคับเพดาน `max_rounds` ในโค้ด Python เสมอเพื่อไม่ให้วนลูปไม่รู้จบ",
    },
    {
      node: 5,
      heading: "เลือกสถาปัตยกรรมให้เหมาะกับโจทย์ก่อนก้าวสู่ MCP (B29) และ LangGraph (B30)",
      body: "การเข้าใจทั้ง 5 {{workflow-patterns}} ทำให้เวลาคุณไปใช้ {{langgraph}} ใน Block B30 คุณจะไม่ออกแบบกราฟมั่ว แต่จะรู้ทันทีว่าโหนดไหนคือ Router, โหนดไหนคือ Parallel Guardrail และโหนดไหนคือ Bounded Evaluator Loop",
      lessonNote: "วันพรุ่งนี้ (Day 112) เราจะนำ Routing + Evaluator-Optimizer มาประกอบเป็นระบบผู้ช่วยลูกค้าครบวงจร",
    },
  ],

  objectives: [
    "**แยกความแตกต่างระหว่าง Deterministic Workflows กับ Autonomous Agents** ตามกรอบแนวคิดของ Anthropic พร้อมเกณฑ์การตัดสินใจเลือกใช้บนแกน Latency, Cost และ Predictability",
    "**อธิบายและเขียนโค้ดจำลองทั้ง 5 {{workflow-patterns}}** ได้แก่ Prompt Chaining (พร้อม Gate), Routing, Parallelization (`asyncio.gather`), Orchestrator-Workers และ Evaluator-Optimizer (`max_rounds`)",
    "**ทดสอบพฤติกรรมของ Workflow Patterns ด้วย {{pytest}}** ทั้งกรณีผ่านปกติ, กรณี Gate หยุดกลางคันใน Chaining และกรณี Evaluator-Optimizer หยุดเมื่อครบเพดานรอบ",
  ],

  prerequisites: [
    "ผ่าน Day 109–110 (Strict Tool Calling & Async Safe Tool Runner)",
    "ใช้งาน `asyncio.gather` พื้นฐานจาก Phase 1 (Day 17–18) ได้",
    "ไม่ต้องใช้ API key — เขียนและทดสอบทั้ง 5 Workflow Patterns ด้วยฟังก์ชันจำลองบนเครื่อง 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day111` ด้วย `uv` เพื่อลงมือเขียนฟังก์ชันแม่แบบของทั้ง 5 Workflow Patterns ใน `workflow_engine.py`",
    commands: `uv init ai-day111 && cd ai-day111
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day111` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เขียน `workflow_engine.py` และรัน `uv run pytest -v`"],
    ],
    note: "เคล็ดลับการออกแบบ: เขียนแต่ละขั้นให้รับและคืน Pydantic model เพื่อให้เชื่อมต่อกันเหมือนเลโก้และเขียน unit test แยกแต่ละขั้นได้ทันที",
  },

  concepts: [
    {
      id: "workflows-vs-agents-tradeoff",
      title: "1 · Workflows vs Agents: ทำไมไม่ควรใช้ Autonomous Agent กับทุกเรื่อง",
      paragraphs: [
        "คำถามแรกที่วิศวกร AI ควรถามเสมอก่อนเริ่มเขียนโค้ดคือ: **'ลำดับขั้นตอนในการแก้โจทย์นี้สามารถกำหนดล่วงหน้าได้หรือไม่?'**",
        "หากคำตอบคือ **'กำหนดได้'** (เช่น รับคำถามลูกค้า → คัดแยกหมวด → ค้นนโยบายด้วย {{rag}} → ตรวจป้ายอ้างอิง → ถ้าตกเกณฑ์ให้ซ่อม 1 ครั้ง) การใช้ **Workflow** ที่ควบคุมด้วยโค้ด Python โดยตรงจะดีกว่าการปล่อยให้ Autonomous Agent คิดหาทางเองทุกครั้ง เพราะ Workflow ให้ความแม่นยำที่สม่ำเสมอ ค่า API ถูกกว่า เร็วกว่า และดีบักง่ายกว่ามาก",
        "เราควรขยับไปใช้ **Agent** (เช่น {{langgraph}} loop ใน Block B30) เฉพาะเมื่อจำนวนก้าวและลำดับการใช้เครื่องมือขึ้นอยู่กับสิ่งที่ค้นพบระหว่างทางจริง ๆ และแม้จะใช้ Agent เราก็ยังต้องครอบด้วย {{guardrails}} ที่เข้มงวดเสมอ",
      ],
      analogy:
        "Workflow เหมือน 'รถไฟฟ้าที่วิ่งบนราง' ซึ่งตรงเวลา ปลอดภัย และรู้สถานีจอดแน่นอน ส่วน Autonomous Agent เหมือน 'รถออฟโรดขับสำรวจป่า' ที่เลี้ยวหลบสิ่งกีดขวางเองได้แต่กินน้ำมันมากกว่าและมีโอกาสหลงทาง — ถ้าแค่เดินทางจากสยามไปอโศก ให้ใช้รถไฟฟ้าบนรางเสมอ",
      bullets: [
        "**Workflows**: โค้ดกำหนดเส้นทาง (Code-driven control flow) → คาดเดาต้นทุนและเวลาได้ 100%",
        "**Agents**: โมเดลกำหนดเส้นทางไดนามิก (LLM-driven control flow) → ยืดหยุ่นสูงแต่ต้องมีเพดาน `max_steps`",
        "**Start Simple**: เริ่มจาก Single Call → Workflow Patterns → Controlled Agent Loop ตามลำดับความจำเป็น",
      ],
      whyTitle: "Why this matters — 90% ของปัญหา 'Agent ช้าและแพง' แก้ได้ด้วยการเปลี่ยนกลับเป็น Routing + Chaining Workflow",
      whyParagraphs: [
        "หลายทีมใช้ ReAct Agent วนคิด 6 รอบเพื่อตอบคำถามเช็กสถานะออเดอร์ธรรมดา เสียเวลารวม 12 วินาที พอย้ายมาใช้ **Routing Workflow** ที่จำแนกเจตนาในรอบแรกแล้วเรียก `lookup_order` ทันที เวลาตอบลดลงเหลือ 1.2 วินาทีและเสถียรขึ้นทันที",
      ],
    },
    {
      id: "chaining-routing-parallelization",
      title: "2 · 3 แพตเทิร์นหลัก: Prompt Chaining, Routing และ Parallelization",
      paragraphs: [
        "มาดูโครงสร้างของ 3 แพตเทิร์นแรกที่ใช้บ่อยที่สุดในงาน Production:",
        "**1. Prompt Chaining (ต่อเป็นลูกโซ่พร้อมด่านตรวจ)**: แบ่งงานออกเป็นขั้น 1 → Gate → ขั้น 2 เช่น ขั้นแรกสกัดข้อเท็จจริงและรหัสอ้างอิงจากเอกสาร → **Deterministic Gate** ใน Python ตรวจว่ามีป้าย `[doc_id#chunk]` ครบไหม → ถ้าผ่านจึงส่งไปขั้นที่สองเพื่อเรียบเรียงเป็นข้อความสุภาพถึงลูกค้า (ถ้าไม่ผ่านด่าน Gate ให้หยุดทันทีโดยไม่เสียค่าเรียกขั้นที่สอง)",
        "**2. Routing (คัดแยกเข้าสายเฉพาะทาง)**: ใช้ตัวจำแนก (Classifier หรือ {{structured-output}} ขนาดเล็ก) จัดหมวดคำขอ เช่น `\"policy_rag\"`, `\"order_status\"`, `\"refund_action\"` หรือ `\"out_of_scope\"` แล้วส่งเข้าท่อที่ออกแบบเฉพาะสำหรับหมวดนั้นโดยไม่เอา prompt ทุกเรื่องมายำรวมกัน",
        "**3. Parallelization (รันขนานด้วย `asyncio.gather`)**: แบ่งเป็น 2 รูปแบบย่อยคือ **Sectioning** (เช่น รัน Safety Guardrail ขนานไปกับการค้น RAG เพื่อไม่ให้เสียเวลารอต่อคิวกัน) และ **Voting** (ให้ตรวจความถูกต้อง 3 มุมพร้อมกันแล้วโหวตเสียงข้างมาก)",
      ],
      analogy:
        "Chaining เหมือนสายพานประกอบรถยนต์ที่มีจุด QC คั่นกลาง; Routing เหมือนพยาบาลคัดกรองหน้าห้องฉุกเฉินที่ส่งคนไข้ไปแผนกกระดูกหรือแผนกตา; Parallelization เหมือนการตรวจเลือดและเอกซเรย์ไปพร้อมกันเพื่อประหยัดเวลารอผล",
      code: {
        language: "python",
        filename: "core_three_patterns.py",
        code: `import asyncio
from collections.abc import Awaitable, Callable


def run_prompt_chain(
    raw_input: str,
    step1: Callable[[str], str],
    gate: Callable[[str], bool],
    step2: Callable[[str], str],
) -> tuple[bool, str]:
    """1. Prompt Chaining พร้อม Deterministic Gate คั่นกลาง"""
    intermediate = step1(raw_input)
    if not gate(intermediate):
        return False, "gate_failed"
    return True, step2(intermediate)


async def run_parallel_checks(
    text: str,
    checks: list[Callable[[str], Awaitable[bool]]],
) -> bool:
    """3. Parallelization: รันทุกด่านตรวจพร้อมกันด้วย asyncio.gather"""
    results = await asyncio.gather(*(check(text) for check in checks))
    return all(results)`,
        caption: "โค้ด Python ไม่กี่บรรทัดสามารถควบคุมทั้ง Chaining Gate และ Parallel Guardrails ได้อย่างชัดเจนและทดสอบง่าย",
      },
      whyTitle: "Why this matters — การรัน Guardrail ขนานกับ RAG (`asyncio.gather`) ช่วยให้เพิ่มความปลอดภัยโดย Latency แทบไม่เพิ่มเลย",
      whyParagraphs: [
        "ถ้าตรวจ Safety 300 ms แล้วค่อยค้น RAG อีก 400 msแบบเรียงต่อกัน ผู้ใช้ต้องรอ 700 ms แต่ถ้ายิงขนานกันด้วย `asyncio.gather` เวลารวมจะเหลือเพียง $\\max(300, 400) = 400\\text{ ms}$ เท่านั้น!",
      ],
    },
    {
      id: "orchestrator-workers-and-evaluator-optimizer",
      title: "3 · 2 แพตเทิร์นขั้นสูง: Orchestrator-Workers และ Evaluator-Optimizer",
      paragraphs: [
        "**4. Orchestrator-Workers (ผู้จัดการแตกงานย่อยให้ลูกทีม)**: ต่างจาก Parallelization ตรงที่จำนวนและหน้าตาของงานย่อยไม่ได้ตายตัวล่วงหน้า แต่ **Orchestrator** อ่านคำขอที่ซับซ้อน (เช่น `'เปรียบเทียบนโยบายคืนเงิน ค่าจัดส่ง และ SLA ของแพ็กเกจ Pro'`) แล้วแตกเป็นรายการ `subtasks: list[str]` ส่งให้ **Workers** ค้นหาและสรุปแต่ละประเด็นพร้อมกัน ก่อนนำผลลัพธ์มารวม (Synthesize) เป็นคำตอบเดียว",
        "**5. Evaluator-Optimizer (ผู้เขียนคู่กับผู้ตรวจในลูปที่มีเพดาน)**: ใช้เมื่อเรามีเกณฑ์ตรวจคุณภาพที่ชัดเจน (เช่น ฟังก์ชันตรวจ Inline Citations จาก Day 105) โดย **Generator/Optimizer** สร้างร่างคำตอบ → **Evaluator** ตรวจและให้ `feedback` ว่าขาดป้ายอ้างอิงจุดไหน → ส่งกลับให้ Optimizer แก้ไขตาม feedback โดยวนได้ไม่เกิน `max_rounds` (เช่น 2–3 รอบ) หากครบเพดานแล้วยังไม่ผ่านให้ตัดเข้า Safe Abstention ทันที",
      ],
      analogy:
        "Orchestrator-Workers เหมือนบรรณาธิการข่าวที่แตกประเด็นใหญ่ส่งให้นักข่าว 3 คนไปหาข้อมูลแต่ละด้านแล้วนำมาเรียบเรียงเป็นสกู๊ปเดียว ส่วน Evaluator-Optimizer เหมือนนักเขียนที่ส่งต้นฉบับให้พิสูจน์อักษรตรวจแก้ไม่เกิน 2 รอบก่อนส่งโรงพิมพ์",
      bullets: [
        "**Orchestrator-Workers**: เหมาะกับคำถามหลายประเด็น (Multi-hop / Multi-aspect queries) ที่ต้องแตกย่อยก่อนค้น",
        "**Evaluator-Optimizer**: เหมาะกับการซ่อม Citation, การปรับโทนภาษา หรือการแก้ Schema Repair ที่มีตัวตรวจชัดเจน",
        "**Bounded Loop (`max_rounds`)**: ห้ามเขียน `while True` ใน Evaluator-Optimizer เด็ดขาด ต้องใช้ `for round_idx in range(1, max_rounds + 1)` เสมอ",
      ],
      whyTitle: "Why this matters — Evaluator-Optimizer ที่มี Deterministic Evaluator (Python Verifier) ประหยัดและแม่นยำที่สุด",
      whyParagraphs: [
        "ในระบบของเรากล่อง Evaluator ไม่จำเป็นต้องเป็น LLM เสมอไป! การใช้ `verify_grounded_answer()` ใน Python เป็นตัว Evaluator เพื่อตรวจป้าย `[doc_id#chunk]` แล้วส่งรายการที่ตกเกณฑ์กลับไปให้ LLM แก้ไข 1 รอบ ทั้งเร็ว ฟรี และไม่หลอนซ้อนหลอน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ 5 Workflow Patterns กับ Software Architecture Patterns ที่คุ้นเคย",
      body: [
        "ทั้ง 5 แพตเทิร์นของ Anthropic คือรูปแบบสถาปัตยกรรมซอฟต์แวร์คลาสสิกที่นำมาประยุกต์กับ LLM:",
      ],
      table: [
        ["1. Prompt Chaining", "Unix Pipe / Middleware Pipeline (`step1 | gate | step2`)"],
        ["2. Routing", "API Gateway / Controller Switch-Case (`route(intent)`)"],
        ["3. Parallelization", "`Promise.all([checkSafety(), fetchContext()])`"],
        ["4. Orchestrator-Workers", "MapReduce (Planner splits tasks → Workers map → Synthesizer reduces)"],
        ["5. Evaluator-Optimizer", "Bounded Retry Loop with Validation Feedback (`max_rounds=2`)"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีจำง่าย ๆ ว่าเมื่อไหร่ใช้ Parallelization vs Orchestrator-Workers",
      body: [
        "ถามตัวเองว่า **'เรารู้จำนวนและประเภทของงานย่อยตั้งแต่วันที่เขียนโค้ดหรือเปล่า?'**",
        "ถ้ารู้ล่วงหน้าตายตัว (เช่น ทุกคำขอต้องรัน `check_pii` และ `check_injection` 2 ตัวนี้เสมอ) นั่นคือ **Parallelization** แต่ถ้าจำนวนงานย่อยขึ้นอยู่กับคำถามของผู้ใช้ในรอบนั้น (บางคำถามแตกได้ 2 หัวข้อ บางคำถามแตกได้ 4 หัวข้อ) นั่นคือ **Orchestrator-Workers** ครับ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะเขียนโค้ดสาธิตการทำงานของ **Routing**, **Orchestrator-Workers** และ **Evaluator-Optimizer** สำหรับระบบตอบคำถามลูกค้าภาษาไทย เพื่อดูวิธีควบคุมทุกลูปด้วยโค้ด Python ที่สะอาดและคาดเดาได้",
    steps: [
      {
        title: "1 · สร้าง Intent Router ที่คัดแยกคำถามเข้า 3 สายงานเฉพาะทาง",
        explain:
          "แยกคำถามออกเป็น `policy_rag`, `order_lookup` และ `out_of_scope` เพื่อให้แต่ละสายใช้เครื่องมือเฉพาะที่จำเป็นเท่านั้น",
        code: {
          language: "python",
          filename: "worked_workflows.py",
          code: `from typing import Literal
from pydantic import BaseModel

RouteKey = Literal["policy_rag", "order_lookup", "out_of_scope"]


def classify_route(query: str) -> RouteKey:
    if "INV-" in query or "สถานะออเดอร์" in query:
        return "order_lookup"
    if any(k in query for k in ("คืนเงิน", "จัดส่ง", "นโยบาย", "รับประกัน")):
        return "policy_rag"
    return "out_of_scope"`,
        },
      },
      {
        title: "2 · สร้าง Orchestrator-Workers สำหรับคำถามที่ถามหลายหัวข้อพร้อมกัน",
        explain:
          "Orchestrator แตกคำถามที่มีหลายประเด็นออกเป็นรายการ `subtasks` ส่งให้ Worker ค้นคำตอบแต่ละประเด็น แล้วรวมผลเป็นรายงานเดียว",
        code: {
          language: "python",
          filename: "worked_workflows.py",
          code: `KB = {
    "คืนเงิน": "คืนเงินได้ภายใน 14 วัน [policy-refund#c01]",
    "จัดส่ง": "จัดส่งฟรีเมื่อสั่งซื้อครบ 500 บาท [policy-ship#c01]",
    "รับประกัน": "รับประกันศูนย์ไทย 1 ปี [policy-warranty#c01]",
}


def run_orchestrator_workers(complex_query: str) -> dict[str, object]:
    subtasks = [topic for topic in KB if topic in complex_query]
    if not subtasks:
        return {"subtasks": [], "synthesized": "ไม่พบหัวข้อที่ระบุ"}
    worker_outputs = [KB[topic] for topic in subtasks]
    return {
        "subtasks": subtasks,
        "synthesized": " | ".join(worker_outputs),
    }`,
        },
      },
      {
        title: "3 · สร้าง Evaluator-Optimizer ที่ซ่อม Citation อัตโนมัติภายใต้เพดาน `max_rounds`",
        explain:
          "หากร่างคำตอบแรกยังไม่มีป้าย `[doc_id#chunk]` ตัว Evaluator จะส่ง feedback กลับให้ Optimizer เติมป้ายอ้างอิง โดยจำกัดไม่เกิน `max_rounds`",
        code: {
          language: "python",
          filename: "worked_workflows.py",
          code: `from collections.abc import Callable


class EvalLoopResult(BaseModel):
    passed: bool
    rounds_used: int
    final_output: str
    history: list[str]


def run_evaluator_optimizer(
    generator: Callable[[int, str | None], str],
    evaluator: Callable[[str], tuple[bool, str]],
    max_rounds: int = 3,
) -> EvalLoopResult:
    history: list[str] = []
    feedback: str | None = None

    for round_idx in range(1, max_rounds + 1):
        draft = generator(round_idx, feedback)
        history.append(draft)
        ok, reason = evaluator(draft)
        if ok:
            return EvalLoopResult(
                passed=True,
                rounds_used=round_idx,
                final_output=draft,
                history=history,
            )
        feedback = reason

    return EvalLoopResult(
        passed=False,
        rounds_used=max_rounds,
        final_output="ขออภัย ไม่สามารถสร้างคำตอบที่ผ่านเกณฑ์ได้",
        history=history,
    )


res_route = classify_route("เช็กสถานะออเดอร์ INV-2026-009")
res_orch = run_orchestrator_workers("ขอทราบเรื่องคืนเงินและจัดส่งครับ")
res_eval = run_evaluator_optimizer(
    generator=lambda r, fb: "คืนเงินใน 14 วัน" if r == 1 else "คืนเงินใน 14 วัน [policy-refund#c01]",
    evaluator=lambda text: ("[" in text and "#" in text, "missing_citation"),
    max_rounds=2,
)

print("Route:", res_route)
print("Orchestrator:", res_orch["subtasks"], "->", res_orch["synthesized"])
print("Evaluator-Optimizer:", res_eval.passed, "in round", res_eval.rounds_used, "->", res_eval.final_output)`,
        },
        output: `Route: order_lookup
Orchestrator: ['คืนเงิน', 'จัดส่ง'] -> คืนเงินได้ภายใน 14 วัน [policy-refund#c01] | จัดส่งฟรีเมื่อสั่งซื้อครบ 500 บาท [policy-ship#c01]
Evaluator-Optimizer: True in round 2 -> คืนเงินใน 14 วัน [policy-refund#c01]`,
      },
    ],
    gotcha:
      "ใน `run_evaluator_optimizer` ถ้า `max_rounds <= 0` ต้องโยน `ValueError` ทันทีตั้งแต่ต้นฟังก์ชัน เพื่อป้องกันไม่ให้ลูปข้ามการทำงานไปเฉย ๆ!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `workflow_engine.py` ที่รวบรวมฟังก์ชันของทั้ง 5 Anthropic Workflow Patterns พร้อมเขียนชุดทดสอบ `test_workflow_engine.py`",
    requirements: [
      "เขียน `run_prompt_chain(text, step1, gate, step2) -> tuple[bool, str]` ที่รัน `step1` แล้วตรวจ `gate` หากไม่ผ่านให้คืน `(False, \"gate_blocked\")` โดยไม่เรียก `step2`",
      "เขียน `route_request(query: str, handlers: dict[str, Callable[[str], str]]) -> tuple[str, str]` ที่จำแนกคำถาม (`order_lookup` เมื่อมี `INV-`, `policy_rag` เมื่อมีคำว่า `คืนเงิน`/`จัดส่ง`/`นโยบาย`, นอกนั้นเป็น `fallback`) แล้วเรียก handler ของสายนั้น",
      "เขียน `async def run_parallel_sectioning(text: str, tasks: dict[str, Callable[[str], Awaitable[bool]]]) -> dict[str, bool]` ที่รันทุก task ขนานกันด้วย `asyncio.gather`",
      "เขียน `run_orchestrator_workers(subtasks: list[str], worker_fn: Callable[[str], str]) -> list[str]` และ `run_evaluator_optimizer(generator, evaluator, max_rounds=3) -> EvalLoopResult` (โยน `ValueError` ถ้า `max_rounds < 1`)",
      "เขียน `test_workflow_engine.py` ทดสอบครบทั้ง 5 แพตเทิร์น รวมถึงกรณี Gate บล็อกใน Chaining และกรณี Evaluator-Optimizer ซ่อมผ่านในรอบที่ 2 หรือหยุดเมื่อครบ `max_rounds`",
    ],
    starter: {
      language: "python",
      filename: "workflow_engine.py",
      code: `import asyncio
from collections.abc import Awaitable, Callable
from pydantic import BaseModel


class EvalLoopResult(BaseModel):
    passed: bool
    rounds_used: int
    final_output: str
    history: list[str]


def run_prompt_chain(
    text: str,
    step1: Callable[[str], str],
    gate: Callable[[str], bool],
    step2: Callable[[str], str],
) -> tuple[bool, str]:
    """1. Prompt Chaining พร้อม Gate Check คั่นกลาง"""
    # TODO: รัน step1 -> ตรวจ gate -> ถ้ารอดจึงรัน step2
    raise NotImplementedError


def route_request(
    query: str,
    handlers: dict[str, Callable[[str], str]],
) -> tuple[str, str]:
    """2. Routing: คัดแยกเป็น order_lookup, policy_rag หรือ fallback"""
    # TODO: เลือก route key แล้วคืน (route_key, handlers[route_key](query))
    raise NotImplementedError


async def run_parallel_sectioning(
    text: str,
    tasks: dict[str, Callable[[str], Awaitable[bool]]],
) -> dict[str, bool]:
    """3. Parallelization: รันทุก async task พร้อมกันด้วย asyncio.gather"""
    # TODO: รันขนานแล้วคืน dict ของ task_name -> bool
    raise NotImplementedError


def run_orchestrator_workers(
    subtasks: list[str],
    worker_fn: Callable[[str], str],
) -> list[str]:
    """4. Orchestrator-Workers: กระจาย subtasks ให้ worker_fn ประมวลผลตามลำดับ"""
    # TODO: คืนผลลัพธ์ของแต่ละ subtask ที่ไม่ว่างเปล่า
    raise NotImplementedError


def run_evaluator_optimizer(
    generator: Callable[[int, str | None], str],
    evaluator: Callable[[str], tuple[bool, str]],
    max_rounds: int = 3,
) -> EvalLoopResult:
    """5. Evaluator-Optimizer: วนสร้างและตรวจไม่เกิน max_rounds"""
    # TODO: ถ้า max_rounds < 1 ให้ raise ValueError
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "ใน `run_prompt_chain` เมื่อ `gate(draft)` คืน `False` ฟังก์ชัน `step2` ไม่ถูกเรียกเลยใช่หรือไม่?",
      "ใน `run_parallel_sectioning` ใช้ `await asyncio.gather(...)` รันทุกงานพร้อมกันและจับคู่ชื่อ key กลับมาถูกต้องใช่หรือไม่?",
      "ใน `run_evaluator_optimizer` เมื่อครบ `max_rounds` แล้วยังไม่ผ่าน ค่า `passed` เป็น `False` และ `rounds_used == max_rounds` ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทั้ง 5 Workflow Patterns ของ Anthropic และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใน `run_parallel_sectioning` เก็บ `names = list(tasks.keys())` แล้วรัน `values = await asyncio.gather(*(tasks[n](text) for n in names))` จากนั้นคืน `dict(zip(names, values, strict=True))`",
      },
      {
        body: "ใน `run_orchestrator_workers` กรองเฉพาะ subtask ที่ `.strip()` ไม่ว่างเปล่า เช่น `[worker_fn(s.strip()) for s in subtasks if s.strip()]`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_workflow_engine.py`:",
        code: {
          language: "python",
          filename: "test_workflow_engine.py",
          code: `import asyncio
import pytest
from workflow_engine import (
    route_request,
    run_evaluator_optimizer,
    run_orchestrator_workers,
    run_parallel_sectioning,
    run_prompt_chain,
)


def test_prompt_chain_passes_and_blocks_at_gate() -> None:
    step2_calls = 0

    def step2(s: str) -> str:
        nonlocal step2_calls
        step2_calls += 1
        return f"FINAL:{s}"

    ok, out = run_prompt_chain("hello", lambda x: f"{x} [doc#c1]", lambda x: "[doc#c1]" in x, step2)
    assert ok is True and out == "FINAL:hello [doc#c1]" and step2_calls == 1

    ok_bad, out_bad = run_prompt_chain("hello", lambda x: x, lambda x: "[doc#c1]" in x, step2)
    assert ok_bad is False and out_bad == "gate_blocked" and step2_calls == 1


def test_routing_dispatches_to_specialized_handler() -> None:
    handlers = {
        "order_lookup": lambda q: f"ORDER:{q}",
        "policy_rag": lambda q: f"POLICY:{q}",
        "fallback": lambda q: "FALLBACK",
    }
    assert route_request("ตามออเดอร์ INV-2026-009", handlers)[0] == "order_lookup"
    assert route_request("สอบถามนโยบายคืนเงินครับ", handlers)[0] == "policy_rag"
    assert route_request("วันนี้อากาศดีไหม", handlers) == ("fallback", "FALLBACK")


def test_parallel_sectioning_and_orchestrator_workers() -> None:
    async def check_safe(s: str) -> bool:
        await asyncio.sleep(0.01)
        return "attack" not in s

    async def check_non_empty(s: str) -> bool:
        await asyncio.sleep(0.01)
        return len(s.strip()) > 0

    res = asyncio.run(
        run_parallel_sectioning("ข้อความปกติ", {"safe": check_safe, "non_empty": check_non_empty})
    )
    assert res == {"safe": True, "non_empty": True}

    worker_out = run_orchestrator_workers(["คืนเงิน", "  ", "จัดส่ง"], lambda t: f"สรุป:{t}")
    assert worker_out == ["สรุป:คืนเงิน", "สรุป:จัดส่ง"]


def test_evaluator_optimizer_repairs_and_respects_max_rounds() -> None:
    with pytest.raises(ValueError):
        run_evaluator_optimizer(lambda r, f: "", lambda s: (True, ""), max_rounds=0)

    repaired = run_evaluator_optimizer(
        generator=lambda r, fb: "ไม่มีอ้างอิง" if r == 1 else f"แก้ไขตาม {fb} [pol#c1]",
        evaluator=lambda s: ("[pol#c1]" in s, "missing_tag"),
        max_rounds=3,
    )
    assert repaired.passed is True
    assert repaired.rounds_used == 2

    exhausted = run_evaluator_optimizer(
        generator=lambda r, fb: f"รอบที่ {r}",
        evaluator=lambda s: (False, "still_invalid"),
        max_rounds=2,
    )
    assert exhausted.passed is False
    assert exhausted.rounds_used == 2
    assert len(exhausted.history) == 2`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v`,
    },
  },

  mistakes: [
    {
      title: "กระโดดไปสร้าง Autonomous Multi-Agent Loop ตั้งแต่วันแรกสำหรับโจทย์ที่มีขั้นตอนตายตัว",
      symptom:
        "ระบบใช้เวลาตอบนาน 15 วินาที เปลืองค่า Token 5 เท่า และบางครั้งวนลูปเรียกเครื่องมือผิดลำดับ ทั้งที่งานมีแค่ 2 ขั้นตอนคงที่",
      fix: "ใช้หลักการของ Anthropic: เริ่มจาก Prompt Chaining หรือ Routing Workflow ที่ควบคุมด้วยโค้ดเสมอก่อน",
    },
    {
      title: "ต่อ Prompt Chaining โดยไม่มี Deterministic Gate คั่นระหว่างขั้น",
      symptom:
        "เมื่อขั้นที่ 1 สกัดข้อมูลล้มเหลวหรือได้ข้อมูลว่าง ขั้นที่ 2 ยังคงถูกเรียกต่อและแต่งข้อความสวยหรูจากข้อมูลที่ผิด",
      fix: "วางฟังก์ชัน `gate(intermediate_output) -> bool` ใน Python คั่นทุกข้อต่อของ Chain เพื่อ Fail-Fast ทันทีที่ขั้นต้นทางไม่ผ่านเกณฑ์",
    },
    {
      title: "รันด่านตรวจความปลอดภัยและดึงข้อมูล RAG แบบเรียงลำดับทีละตัว (Sequential) ทั้งที่ไม่ได้พึ่งพากัน",
      symptom:
        "Latency รวมของระบบเท่ากับผลบวกของทุกด่าน ทำให้ผู้ใช้รอนานเกินความจำเป็น",
      fix: "ใช้ **Parallelization (Sectioning)** ด้วย `asyncio.gather` รันงานที่เป็นอิสระต่อกันไปพร้อมกัน",
    },
    {
      title: "เขียนลูป Evaluator-Optimizer แบบไม่มีเพดาน `max_rounds` หรือไม่ส่ง `feedback` ที่เฉพาะเจาะจงกลับไป",
      symptom:
        "โมเดลสร้างคำตอบเดิมซ้ำ ๆ และถูกตีตกซ้ำ ๆ จนวนลูปไม่รู้จบและผลาญงบ API",
      fix: "บังคับ `max_rounds` (เช่น 2–3 รอบ) และส่ง `feedback` ที่ระบุชัดเจนว่าตกเกณฑ์ข้อใด (เช่น รายชื่อ `phantom_citations` ที่ต้องแก้)",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d111-q1",
        "ตามกรอบแนวคิด *Building Effective Agents* ของ Anthropic ข้อใดคือความแตกต่างหลักระหว่าง 'Workflows' กับ 'Agents'?",
        [
          ["Workflows เขียนด้วยภาษา Python ส่วน Agents เขียนด้วยภาษา C++ เท่านั้น", "ทั้งคู่เขียนด้วย Python ได้"],
          ["Workflows คือระบบที่โค้ดกำหนดลำดับการทำงานและเส้นทางไว้ชัดเจน (Deterministic Control Flow) ส่วน Agents คือระบบที่ให้ LLM ตัดสินใจเลือกขั้นตอนและการใช้เครื่องมือแบบไดนามิกในลูป", "ถูกต้อง — และควรเลือกใช้ Workflows ก่อนเสมอเมื่อลำดับงานสามารถกำหนดล่วงหน้าได้"],
          ["Workflows ต้องใช้ GPU 100 ตัว ส่วน Agents รันบนเครื่องคิดเลขได้", "ไม่เป็นความจริง"],
          ["Workflows ไม่สามารถใช้กับระบบ RAG ได้", "RAG ส่วนใหญ่ใน Production คือ Workflow!"],
        ],
        "B",
        "การแยกแยะว่าเมื่อไหร่ควรให้โค้ดถือพวงมาลัย (Workflow) และเมื่อไหร่ควรให้ LLM ช่วยเลือกเส้นทาง (Agent) คือทักษะสำคัญของ AI Architect",
        "Workflows ต่างจาก Agents อย่างไรตามนิยามของ Anthropic?",
        "Workflows ใช้โค้ดกำหนดเส้นทางแบบตายตัวและคาดเดาได้ ส่วน Agents ให้ LLM ตัดสินใจเลือกก้าวถัดไปแบบไดนามิก",
      ),
      mc(
        "d111-q2",
        "หากคุณต้องการรัน Input Safety Guardrail ไปพร้อมกับการค้นหาเอกสาร Hybrid RAG เพื่อไม่ให้เวลารอรวมเพิ่มขึ้น คุณควรใช้ Workflow Pattern ใด?",
        [
          ["Prompt Chaining แบบเรียงต่อกันทีละขั้น", "การรันเรียงกันจะทำให้เวลารอรวมเท่ากับผลบวกของทั้งสองขั้น"],
          ["Parallelization (รูปแบบ Sectioning) ด้วย `asyncio.gather`", "ถูกต้อง — งานสองชิ้นที่เป็นอิสระต่อกันสามารถยิงขนานกันได้ ทำให้เวลารอรวมเหลือเพียงเวลาของชิ้นที่ช้าที่สุด"],
          ["Evaluator-Optimizer วนลูป 10 รอบ", "ไม่เกี่ยวกับการรันขนาน"],
          ["หยุดใช้ Guardrail ทั้งหมด", "ไม่ปลอดภัย"],
        ],
        "B",
        "Parallelization (Sectioning) ช่วยให้เราเพิ่มด่านตรวจความปลอดภัยได้โดยแทบไม่เพิ่ม Latency ให้ผู้ใช้ปลายทาง",
        "การรัน Safety Check ขนานไปกับการดึงข้อมูล RAG จัดเป็นแพตเทิร์นใด?",
        "Parallelization (Sectioning) ด้วย `asyncio.gather`",
      ),
      mc(
        "d111-q3",
        "ข้อใดอธิบายความแตกต่างระหว่าง 'Parallelization' กับ 'Orchestrator-Workers' ได้ถูกต้องที่สุด?",
        [
          ["ใน Parallelization งานย่อยถูกกำหนดไว้ตายตัวในโค้ดล่วงหน้า แต่ใน Orchestrator-Workers ตัว Orchestrator จะวิเคราะห์คำขอที่ซับซ้อนแล้วแตกเป็นรายการ `subtasks` แบบไดนามิกตามโจทย์นั้น ๆ", "ถูกต้อง — Orchestrator-Workers เหมาะกับคำถามหลายประเด็นที่รู้จำนวนงานย่อยก็ต่อเมื่อเห็นคำถามแล้ว"],
          ["Orchestrator-Workers ห้ามมีมากกว่า 1 งานย่อย", "มีได้หลายงานย่อยตามที่ Orchestrator แตกออกมา"],
          ["Parallelization ใช้ได้เฉพาะกับข้อมูลรูปภาพเท่านั้น", "ใช้กับข้อความและงาน I/O ทุกชนิดได้"],
          ["ทั้งสองแพตเทิร์นเหมือนกันทุกประการ แค่เปลี่ยนชื่อเรียก", "ต่างกันที่ว่างานย่อยถูกกำหนดตายตัวล่วงหน้าหรือถูกแตกแบบไดนามิก"],
        ],
        "A",
        "จำง่าย ๆ: Parallelization = งานย่อยกำหนดตายตัวในโค้ด (Pre-defined subtasks); Orchestrator-Workers = แตกงานย่อยตามเนื้อหาของโจทย์ (Dynamic task decomposition)",
        "Orchestrator-Workers ต่างจาก Parallelization อย่างไร?",
        "Orchestrator-Workers แตกงานย่อย (`subtasks`) แบบไดนามิกตามความซับซ้อนของคำขอในรอบนั้น ไม่ได้ล็อกงานย่อยตายตัวล่วงหน้า",
      ),
      mc(
        "d111-q4",
        "ในแพตเทิร์น 'Evaluator-Optimizer' เหตุใดเราจึงต้องกำหนดเพดาน `max_rounds` (เช่น 2–3 รอบ) และมีทางออก Fallback เสมอ?",
        [
          ["เพื่อป้องกันไม่ให้ลูปการตรวจและแก้ทำงานวนซ้ำไม่รู้จบเมื่อเจอกรณีที่หลักฐานไม่เพียงพอหรือโมเดลแก้ไม่ผ่านเกณฑ์ (Bounded Cost & Latency)", "ถูกต้อง — หากครบ `max_rounds` แล้วยังไม่ผ่านเกณฑ์ ระบบต้องหยุดและส่งเข้าโหมด Safe Abstention ทันที"],
          ["เพราะ Python ไม่อนุญาตให้ลูป `for` รันเกิน 3 รอบ", "Python รันลูปได้ไม่จำกัด"],
          ["เพื่อบังคับให้ต้องรันครบ 3 รอบเสมอแม้รอบแรกจะผ่านเกณฑ์แล้วก็ตาม", "ถ้ารอบแรกผ่าน (`ok=True`) ต้อง `return` ออกทันทีเพื่อประหยัดเวลา"],
          ["เพื่อให้ไม่ต้องเขียนฟังก์ชัน Evaluator", "ต้องมี Evaluator เป็นตัวตัดสินเสมอ"],
        ],
        "A",
        "ทุกวงรอบที่มีการปรับปรุงซ้ำ (Iterative Refinement) ต้องมีทั้ง Early Exit เมื่อผ่านเกณฑ์ และ Hard Ceiling (`max_rounds`) เมื่อไม่ผ่านเกณฑ์",
        "ทำไม Evaluator-Optimizer ต้องมี `max_rounds`?",
        "เพื่อจำกัดเพดาน Cost และ Latency ไม่ให้วนซ่อมคำตอบไม่รู้จบเมื่อหลักฐานไม่พอ",
      ),
    ],
  },

  takeaways: [
    "**Start Simple**: ใช้ **Composable {{workflow-patterns}}** ที่โค้ดควบคุมเส้นทางเสมอก่อนจะขยับไปใช้ Autonomous Agent",
    "**Prompt Chaining + Gate**, **Routing** และ **Parallelization (`asyncio.gather`)** แก้โจทย์งานบริการลูกค้าในโลกจริงได้มากกว่า 80% ด้วยความเร็วและต้นทุนที่คาดเดาได้",
    "**Orchestrator-Workers** ใช้แตกคำถามหลายประเด็นออกเป็นงานย่อยแบบไดนามิก ส่วน **Evaluator-Optimizer** ใช้ตรวจและซ่อมคำตอบภายใต้เพดาน `max_rounds`",
    "พรุ่งนี้ (Day 112 — Review B28) เราจะรวม **Routing + Strict Tool Calling + Evaluator-Optimizer** เข้าด้วยกันเพื่อสร้างผู้ช่วยตอบคำถามออเดอร์และนโยบายแบบครบวงจร!",
  ],

  reviewCards: [
    rc(
      "d111-rc1",
      "ไล่ชื่อทั้ง 5 Workflow Patterns ของ Anthropic พร้อมหน้าที่สั้น ๆ ของแต่ละตัว",
      "1) Prompt Chaining (ต่อขั้นพร้อม Gate), 2) Routing (คัดแยกเข้าสายเฉพาะทาง), 3) Parallelization (รันขนาน), 4) Orchestrator-Workers (แตกงานย่อยไดนามิก), 5) Evaluator-Optimizer (ตรวจและซ่อมภายใต้ max_rounds)",
    ),
    rc(
      "d111-rc2",
      "ทำไมจึงควรวาง Deterministic Gate คั่นกลางใน Prompt Chaining?",
      "เพื่อตรวจคุณภาพผลลัพธ์ของขั้นก่อนหน้าและหยุดทันที (Fail-Fast) หากข้อมูลไม่ผ่านเกณฑ์ โดยไม่เสียค่าเรียกขั้นถัดไป",
    ),
    rc(
      "d111-rc3",
      "2 รูปแบบย่อยของ Parallelization (Sectioning vs Voting) ต่างกันอย่างไร?",
      "Sectioning = แบ่งงานคนละหน้าที่รันพร้อมกัน (เช่น Safety Check ขนานกับ RAG); Voting = รันการประเมินเรื่องเดียวกันหลายมุมแล้วโหวตเสียงข้างมาก",
    ),
    rc(
      "d111-rc4",
      "ใน Evaluator-Optimizer ของระบบ RAG เราสามารถใช้อะไรเป็นตัว Evaluator ที่ทั้งเร็วและฟรีแทนการเรียก LLM อีกตัว?",
      "ใช้ Deterministic Python Verifier เช่น `verify_grounded_answer()` ที่ตรวจป้าย `[doc_id#chunk_id]` และตัวเลขเทียบกับหลักฐานโดยตรง",
    ),
  ],

  sources: [
    {
      label: "Anthropic Research — Building Effective Agents (The 5 Workflow Patterns)",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
    {
      label: "Python Standard Library — asyncio.gather (Running Tasks Concurrently)",
      href: "https://docs.python.org/3/library/asyncio-task.html#running-tasks-concurrently",
    },
    {
      label: "LangGraph Documentation — Workflows vs Agents in Graph API",
      href: "https://docs.langchain.com/oss/python/langgraph/workflows-agents",
    },
  ],

  glossary: ["workflow-patterns", "tool-calling", "asyncio", "pydantic", "groundedness", "guardrails"],
});
