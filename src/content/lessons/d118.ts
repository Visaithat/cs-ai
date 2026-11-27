import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D118 — Phase 4 / Block B30
 * Guarded Execution in LangGraph: Max Steps, Tool Budgets & Cycle Detection
 */
export const d118: Lesson = defineLesson({
  day: 118,
  titleTh: "Guarded Execution ใน LangGraph: คุม Max Steps, Tool Budget และตรวจจับลูปซ้ำ",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ป้องกัน Agent วนลูปผลาญงบด้วย Step Ceiling, Tool Call Budget และ SHA-256 Cycle Hash",
  icon: "shield-alert",
  visual: {
    id: "langgraph-guardrails",
    title: "Guarded LangGraph Loop (max_steps, tool_budget & cycle hash)",
    caption: "สลับเทียบระหว่าง Guarded Loop ที่ตัดเข้า Fallback เมื่อพบการเรียก Tool ซ้ำ กับ Unbounded Loop ที่วนไม่รู้จบ",
    alt: "แผนภาพ Guarded LangGraph Loop และการตรวจจับลูปซ้ำ",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้าง Guarded Agent Loop & Cycle Detector ทดสอบด้วย pytest",
  tools: ["Python 3.12", "LangGraph Concepts", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "เมื่อเปิดให้ Agent วนลูปคิดเอง ภัยที่พบบ่อยที่สุดคือ 'Infinite Tool Loop'",
      body: "ใน Day 117 เราสร้างกราฟ `State → Node → Conditional Edge` ใน {{langgraph}} ได้แล้ว แต่ใน Production จริง เมื่อเครื่องมือค้นไม่เจอข้อมูลหรือคืนข้อผิดพลาด โมเดล {{llm}} มักดื้อส่งคำสั่งเรียกเครื่องมือเดิมด้วยอาร์กิวเมนต์เดิมซ้ำไปซ้ำมาจนผลาญ Token และทำให้ผู้ใช้ค้าง",
      lessonNote: "วันนี้เราสร้าง {{guardrails}} 3 ชั้นใน State Machine เพื่อตัดวงจรลูปซ้ำตั้งแต่วินาทีแรกที่ตรวจพบ",
    },
    {
      node: 3,
      heading: "เกราะชั้นที่ 1 & 2: `max_steps` คู่กับ `max_tool_calls` Budget",
      body: "การตั้ง `recursion_limit` ของเฟรมเวิร์กเป็นแค่ฟิวส์ตัวสุดท้ายที่โยน Exception เมื่อกราฟพังไปแล้ว แต่ระบบที่ดีต้องมี `steps < max_steps` และ `tool_calls < max_tool_calls` อยู่ใน `AgentState` เพื่อให้ Conditional Router พาลงโหนด `fallback` อย่างนุ่มนวลพร้อมระบุ `stop_reason`",
      lessonNote: "ต้องนับ `tool_calls += 1` ทุกครั้งที่พยายามเรียกเครื่องมือ แม้เครื่องมือนั้นจะคืนข้อผิดพลาดก็ตาม!",
    },
    {
      node: 4,
      heading: "เกราะชั้นที่ 3: Deterministic Cycle Hash ดักการเรียก Tool เดิมด้วย Args เดิมซ้ำ",
      body: "ทำไมต้องรอให้วนครบ 10 รอบแล้วค่อยตัดด้วย `max_steps` ในเมื่อเราเห็นตั้งแต่วินาทีที่โมเดลขอเรียก `(tool_name, args)` ชุดเดิมซ้ำเป็นครั้งที่ 2 แล้ว? การเก็บ `seen_signatures` จาก SHA-256 ของ `tool_name + canonical_json(args)` ช่วยให้เราหยุดลูปซ้ำได้ตั้งแต่รอบที่ 2 ทันที",
      lessonNote: "เทคนิคเดียวกับ Idempotency Key ใน Day 110 แต่นำมาใช้ในฝั่ง Agent Router เพื่อตรวจจับอาการย้ำคิดย้ำทำของโมเดล",
    },
    {
      node: 5,
      heading: "ทุกการหยุดต้องคืน `stop_reason` ที่ชัดเจนสำหรับ Observability & Evals",
      body: "ไม่ว่ากราฟจะจบเพราะตอบสำเร็จ (`completed`), ครบเพดานก้าว (`max_steps_reached`), หมดงบเครื่องมือ (`tool_budget_exhausted`) หรือตรวจพบลูปซ้ำ (`duplicate_tool_cycle`) สถานะสุดท้ายต้องระบุรหัสชัดเจน",
      lessonNote: "เกณฑ์บังคับของ Phase 4 Checkpoint (D124) คือ 100% ของเคสทดสอบต้องจบภายใน `max_steps` โดยไม่มีลูปค้าง",
    },
  ],

  objectives: [
    "**ออกแบบ Guarded Agent State** ที่ติดตาม `steps`, `max_steps`, `tool_calls`, `max_tool_calls`, `seen_signatures` และ `stop_reason` อย่างครบถ้วน",
    "**สร้างฟังก์ชัน `compute_tool_signature`** จากชื่อเครื่องมือและ `json.dumps(args, sort_keys=True)` เพื่อตรวจจับการเรียกเครื่องมือซ้ำ (`duplicate_tool_cycle`) ก่อนรันเครื่องมือซ้ำจริง",
    "**เขียน Guarded Execution Router & Loop** ที่ตัดเข้าโหนด Fallback อย่างปลอดภัยเมื่อชนเพดานใดเพดานหนึ่ง พร้อมพิสูจน์ด้วย {{pytest}} ว่าไม่มีการรัน side effect เกินงบ",
  ],

  prerequisites: [
    "ผ่าน Day 117 (Controlled Agent Loops with LangGraph: State, Nodes, Conditional Edges)",
    "ทบทวน Day 110 (Canonical JSON Serialization & SHA-256 Hashing)",
    "ไม่ต้องใช้ API key — ทดสอบ Guarded Loop & Cycle Detection บนเครื่องด้วย `pytest` ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day118` ด้วย `uv` เพื่อสร้างโมดูล `agent_guardrails.py` ที่ควบคุมงบการทำงานของ Agent Loop และทดสอบด้วย `pytest`",
    commands: `uv init ai-day118 && cd ai-day118
uv add pydantic langgraph
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day118` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `langgraph`, `pytest` และ `ruff`"],
      ["verify", "เขียน `agent_guardrails.py` และรัน `uv run pytest -v`"],
    ],
    note: "หลักการสำคัญ: ตรวจเพดานงบ (`max_steps`, `max_tool_calls`, `seen_signatures`) ก่อนรันเครื่องมือเสมอ ไม่ใช่รันเครื่องมือไปแล้วค่อยมาตรวจ!",
  },

  concepts: [
    {
      id: "step-and-tool-budgets-in-state",
      title: "1 · Step Budget vs Tool Budget: ทำไมต้องคุมแยกกันทั้งสองเพดาน",
      paragraphs: [
        "ใน {{langgraph}} หนึ่งก้าว (`step`) คือการเดินผ่านโหนดหนึ่งในกราฟ (เช่น `plan` → `tool` → `verify` นับเป็น 3 ก้าว) ส่วน `tool_calls` คือจำนวนครั้งที่มีการเรียกใช้งานเครื่องมือภายนอกจริง ๆ",
        "เราต้องคุมเพดานทั้งสองตัวควบคู่กัน: **`max_steps`** (เช่น 6 ก้าว) ป้องกันไม่ให้กราฟเดินวนระหว่างโหนดวางแผนกับโหนดตรวจผลไปมาโดยไม่จบ ส่วน **`max_tool_calls`** (เช่น 2–3 ครั้งต่อคำถาม) ป้องกันไม่ให้บอทยิงฐานข้อมูลหรือ API ภายนอกรัว ๆ ในคำถามเดียว",
        "กฎสำคัญคือ: ต้องตรวจงบ **ก่อน** อนุญาตให้โหนดทำงานขั้นถัดไป และต้องนับ `tool_calls += 1` ทุกครั้งที่มีการเรียกเครื่องมือ แม้เครื่องมือนั้นจะคืนผลลัพธ์ว่าไม่พบข้อมูลหรือเกิด error ก็ตาม เพราะการยิง API ที่ล้มเหลวก็เสียเวลาและทรัพยากรของระบบเช่นกัน",
      ],
      analogy:
        "เหมือนการจำกัดทั้ง 'เวลาเดินในสวนสนุกไม่เกิน 3 ชั่วโมง' (`max_steps`) และ 'คูปองเล่นเครื่องเล่นไม่เกิน 3 ใบ' (`max_tool_calls`) — ไม่ว่าโควตาไหนหมดก่อน เจ้าหน้าที่ก็จะเชิญออกทางประตูทางออกอย่างสุภาพทันที",
      bullets: [
        "**`steps >= max_steps`**: ตัดเข้า `fallback` พร้อม `stop_reason=\"max_steps_reached\"`",
        "**`tool_calls >= max_tool_calls`**: ตัดเข้า `fallback` พร้อม `stop_reason=\"tool_budget_exhausted\"`",
        "**Graceful Fallback vs Crash**: คืนคำตอบ fallback ที่ปลอดภัยแทนการปล่อยให้ติด `GraphRecursionError`",
      ],
      whyTitle: "Why this matters — ถ้าไม่นับ Tool Call ที่ล้มเหลว โมเดลจะยิง API ที่พังอยู่ซ้ำไม่รู้จบ!",
      whyParagraphs: [
        "บั๊กยอดฮิตคือการเขียน `if result.ok: state.tool_calls += 1` ซึ่งพอ API ปลายทางล่ม (`ok=False`) ตัวนับ `tool_calls` จะเป็น 0 ตลอดกาล ทำให้ Agent ยิงซ้ำใส่ระบบที่กำลังล่มอยู่จนเกิด Retry Storm",
      ],
    },
    {
      id: "deterministic-cycle-hash-detection",
      title: "2 · Cycle Detection ด้วย SHA-256 Signature: หยุดอาการย้ำคิดย้ำทำตั้งแต่รอบที่ 2",
      paragraphs: [
        "อาการที่เจอบ่อยที่สุดเวลา LLM ใช้ {{tool-calling}} คือ: รอบที่ 1 โมเดลสั่งเรียก `lookup_order({\"order_id\": \"INV-2026-999\"})` แล้วได้รับคำตอบว่า `{\"found\": False}` พอถึงรอบที่ 2 แทนที่โมเดลจะสรุปบอกลูกค้าว่าไม่พบออเดอร์ โมเดลกลับสั่งเรียก `lookup_order({\"order_id\": \"INV-2026-999\"})` ซ้ำด้วยพารามิเตอร์เดิมเป๊ะ!",
        "เราสามารถดักจับอาการนี้ได้แบบ Deterministic 100% โดยสร้างลายเซ็น (Signature) ของแต่ละคำสั่งเรียกเครื่องมือ: `sig = f\"{tool_name}:{sha256(json.dumps(args, sort_keys=True))}\"` แล้วเก็บสะสมไว้ในเซตหรือลิสต์ `seen_signatures` ใน State",
        "ก่อนที่โหนดรันเครื่องมือจะทำงาน เราตรวจว่า `sig in state.seen_signatures` หรือไม่ หากพบว่าเคยเรียกชื่อเครื่องมือนี้ด้วยอาร์กิวเมนต์ชุดนี้ไปแล้วในเทิร์นเดียวกัน Router จะเบรกทันทีโดย **ไม่รันเครื่องมือซ้ำ** และตัดเข้าโหนดสรุปหรือ `fallback` พร้อม `stop_reason=\"duplicate_tool_cycle\"`",
      ],
      analogy:
        "เหมือนสมุดจดหน้าห้องคลังเอกสาร: ถ้าพนักงานคนเดิมเดินมาขอเปิดแฟ้มหมายเลขเดิมที่เพิ่งเปิดดูเมื่อ 5 วินาทีก่อนแล้วพบว่าแฟ้มว่างเปล่า บรรณารักษ์จะทักทันทีว่า 'แฟ้มนี้เพิ่งเปิดดูแล้วไม่มีข้อมูลครับ ไม่ต้องเปิดซ้ำแล้ว'",
      code: {
        language: "python",
        filename: "cycle_detector.py",
        code: `import hashlib
import json
from typing import Any


def compute_tool_signature(tool_name: str, args: dict[str, Any]) -> str:
    """สร้างลายเซ็นคงที่จากชื่อ tool และ arguments ที่เรียง key แล้ว"""
    canonical = json.dumps(args, sort_keys=True, ensure_ascii=False)
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]
    return f"{tool_name}:{digest}"


sig1 = compute_tool_signature("lookup_order", {"order_id": "INV-01", "full": True})
sig2 = compute_tool_signature("lookup_order", {"full": True, "order_id": "INV-01"})
print("Identical signature:", sig1 == sig2, sig1)`,
        caption: "ไม่ว่า LLM จะสลับลำดับ key ใน JSON อย่างไร `compute_tool_signature` ก็ให้รหัสลายเซ็นเดียวกันเสมอ",
      },
      whyTitle: "Why this matters — ตัดจบในรอบที่ 2 ช่วยประหยัดเวลาและค่า Token ไปได้อีก 4–8 รอบที่เหลือ",
      whyParagraphs: [
        "ถ้าตั้ง `max_steps = 8` แต่ไม่มี Cycle Detection ระบบจะต้องเสียเงินและเวลารอโมเดลเรียกเครื่องมือเดิมซ้ำถึง 4 รอบกว่าจะชนเพดาน `max_steps` การมี `seen_signatures` ช่วยตัดจบได้ตั้งแต่วินาทีแรกที่เริ่มวนซ้ำ",
      ],
    },
    {
      id: "pre-execution-guardrail-router",
      title: "3 · ลำดับการตรวจของ Guardrail Router ก่อนรันแต่ละก้าว",
      paragraphs: [
        "เพื่อให้เข้าใจง่ายและนำไปเขียนทั้งในฟังก์ชัน Python และใน Conditional Edge ของ {{langgraph}} ได้ทันที เรามาวางลำดับการตรวจของ `check_step_guardrails` ก่อนรันแต่ละคำสั่ง:",
        "**ลำดับที่ 1 — Step Ceiling**: ถ้า `steps >= max_steps` ให้หยุดด้วย `stop_reason=\"max_steps_reached\"`",
        "**ลำดับที่ 2 — Action Check**: ถ้าคำสั่งถัดไปคือ `\"finish\"` (โมเดลพร้อมตอบแล้ว) ให้นับก้าวและจบด้วย `stop_reason=\"completed\"`",
        "**ลำดับที่ 3 — Duplicate Cycle Check**: คำนวณ `sig = compute_tool_signature(tool_name, args)` ถ้า `sig in seen_signatures` ให้หยุดทันทีด้วย `stop_reason=\"duplicate_tool_cycle\"` (โดยไม่รันเครื่องมือซ้ำ!)",
        "**ลำดับที่ 4 — Tool Budget Check**: ถ้า `tool_calls >= max_tool_calls` ให้หยุดทันทีด้วย `stop_reason=\"tool_budget_exhausted\"` (โดยไม่รันเครื่องมือเกินงบ!)",
        "เมื่อผ่านครบทั้ง 4 ด่านแล้วเท่านั้น จึงบันทึก `sig` ลง `seen_signatures`, เพิ่ม `tool_calls += 1` และรันเครื่องมือจริง",
      ],
      analogy:
        "เหมือนด่านตรวจ 4 ประตูเรียงกันก่อนเข้าห้องเครื่อง: เช็กเวลาทำงานรวม → เช็กว่างานเสร็จหรือยัง → เช็กว่าทำซ้ำคำสั่งเดิมไหม → เช็กว่าโควตาใช้เครื่องมือยังเหลือไหม ผ่านครบจึงเปิดประตูให้เดินเครื่อง",
      bullets: [
        "**Check before Side Effect**: ทั้ง 4 เงื่อนไขตรวจก่อนเรียก `tool_executor` เสมอ",
        "**Deterministic `stop_reason`**: ช่วยให้เขียน assertion ใน `pytest` และทำกราฟ Dashboard ใน Phase 5 ได้ตรงจุด",
        "**Audit Trail**: เก็บ `seen_signatures` และ `history` ไว้ในผลลัพธ์เพื่อไล่ดูย้อนหลังได้ทุกก้าว",
      ],
      whyTitle: "Why this matters — ทำไมต้องตรวจ Duplicate Cycle ก่อนตรวจ Tool Budget?",
      whyParagraphs: [
        "สมมติว่าตั้ง `max_tool_calls = 2` แล้วในครั้งที่ 2 โมเดลส่งคำสั่งซ้ำกับครั้งแรกเป๊ะ ถ้าเราตรวจ Duplicate Cycle ก่อน เราจะได้ `stop_reason=\"duplicate_tool_cycle\"` ที่บอกสาเหตุแท้จริงว่าโมเดลกำลังวนลูปซ้ำ ไม่ใช่แค่งบหมดตามปกติ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Agent Guardrails กับ Rate Limiting & Circuit Breakers",
      body: [
        "กลไกป้องกันลูปใน LangGraph เทียบได้กับระบบป้องกันทราฟฟิกและลูปในระบบ Backend:",
      ],
      table: [
        ["`max_steps` ceiling", "HTTP Redirect Limit (`ERR_TOO_MANY_REDIRECTS` ตัดที่ 5–10 ครั้ง)"],
        ["`max_tool_calls` budget", "Per-Request Downstream RPC Quota / Query Limit"],
        ["`seen_signatures` cycle hash", "Visited URL Set ใน Web Crawler ป้องกันการไต่ลิงก์วนเป็นวงกลม"],
        ["`stop_reason` fallback", "Structured Graceful Degradation Response พร้อมรหัสวินิจฉัย"],
      ],
    },
    student: {
      title: "First-Year Note — ความคล้ายกันระหว่าง Cycle Detection ในกราฟของวิชา Algorithms กับ LangGraph",
      body: [
        "ในวิชา Data Structures & Algorithms เวลาเราเดินกราฟด้วย DFS/BFS เราต้องมีเซต `visited` คอยเก็บโหนดที่เคยเดินผ่านไปแล้วเพื่อไม่ให้ติด Infinite Loop",
        "`seen_signatures` ใน Agent ของเราก็คือเซต `visited` นั่นเองครับ เพียงแต่สิ่งที่เราเก็บไม่ใช่แค่ชื่อโหนด แต่เป็นคู่ `(tool_name, args_hash)` เพราะการเรียกเครื่องมือคนละพารามิเตอร์ถือเป็นก้าวใหม่ แต่พารามิเตอร์เดิมเป๊ะถือเป็นการเดินย่ำที่เดิม!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะสร้าง `run_guarded_agent_loop` ที่รับรายการแผนการเรียกเครื่องมือ (จำลองการตัดสินใจของ LLM ในแต่ละรอบ) แล้วทดสอบเปรียบเทียบทั้งกรณีจบงานปกติ, กรณีโมเดลพยายามเรียกเครื่องมือเดิมซ้ำ (`duplicate_tool_cycle`), กรณีใช้เครื่องมือเกินงบ (`tool_budget_exhausted`) และกรณีเดินเกินจำนวนก้าว (`max_steps_reached`)",
    steps: [
      {
        title: "1 · นิยามโมเดล `AgentAction`, `GuardedLoopState` และฟังก์ชัน `compute_tool_signature`",
        explain:
          "กำหนด `StopReason` เป็น `Literal` 4 ค่าชัดเจน เพื่อใช้ตรวจสอบสาเหตุการหยุดของกราฟ",
        code: {
          language: "python",
          filename: "worked_guardrails.py",
          code: `import hashlib
import json
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, Field

StopReason = Literal[
    "completed",
    "max_steps_reached",
    "tool_budget_exhausted",
    "duplicate_tool_cycle",
]


class AgentAction(BaseModel):
    kind: Literal["tool", "finish"]
    tool_name: str = ""
    args: dict[str, Any] = Field(default_factory=dict)
    final_answer: str = ""


class GuardedLoopResult(BaseModel):
    stop_reason: StopReason
    steps_taken: int
    tool_calls_made: int
    seen_signatures: list[str]
    final_answer: str


def compute_tool_signature(tool_name: str, args: dict[str, Any]) -> str:
    canonical = json.dumps(args, sort_keys=True, ensure_ascii=False)
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]
    return f"{tool_name}:{digest}"`,
        },
      },
      {
        title: "2 · เขียนลูป Guarded Execution ที่ตรวจเพดานทุกด่านก่อนรัน Tool",
        explain:
          "ในแต่ละก้าว ตรวจ `steps >= max_steps`, ตรวจ `kind == \"finish\"`, ตรวจ `sig in seen` และตรวจ `tool_calls >= max_tool_calls` ก่อนเรียก `tool_executor`",
        code: {
          language: "python",
          filename: "worked_guardrails.py",
          code: `FALLBACK_ANSWERS: dict[StopReason, str] = {
    "completed": "",
    "max_steps_reached": "ขออภัย คำขอใช้ขั้นตอนเกินเพดานที่กำหนด ระบบจึงหยุดการทำงานอย่างปลอดภัย",
    "tool_budget_exhausted": "ขออภัย ใช้โควตาการค้นหาข้อมูลครบเพดานแล้ว",
    "duplicate_tool_cycle": "ขออภัย ตรวจพบการเรียกค้นข้อมูลซ้ำเดิม ระบบจึงตัดเข้าโหมดตอบกลับปลอดภัย",
}


def run_guarded_agent_loop(
    planned_actions: list[AgentAction],
    tool_executor: Callable[[str, dict[str, Any]], dict[str, Any]],
    max_steps: int = 5,
    max_tool_calls: int = 2,
) -> GuardedLoopResult:
    steps = 0
    tool_calls = 0
    seen: list[str] = []

    for action in planned_actions:
        if steps >= max_steps:
            return GuardedLoopResult(
                stop_reason="max_steps_reached",
                steps_taken=steps,
                tool_calls_made=tool_calls,
                seen_signatures=seen,
                final_answer=FALLBACK_ANSWERS["max_steps_reached"],
            )

        steps += 1
        if action.kind == "finish":
            return GuardedLoopResult(
                stop_reason="completed",
                steps_taken=steps,
                tool_calls_made=tool_calls,
                seen_signatures=seen,
                final_answer=action.final_answer,
            )

        sig = compute_tool_signature(action.tool_name, action.args)
        if sig in seen:
            return GuardedLoopResult(
                stop_reason="duplicate_tool_cycle",
                steps_taken=steps,
                tool_calls_made=tool_calls,
                seen_signatures=seen,
                final_answer=FALLBACK_ANSWERS["duplicate_tool_cycle"],
            )

        if tool_calls >= max_tool_calls:
            return GuardedLoopResult(
                stop_reason="tool_budget_exhausted",
                steps_taken=steps,
                tool_calls_made=tool_calls,
                seen_signatures=seen,
                final_answer=FALLBACK_ANSWERS["tool_budget_exhausted"],
            )

        seen.append(sig)
        tool_calls += 1
        tool_executor(action.tool_name, action.args)

    return GuardedLoopResult(
        stop_reason="max_steps_reached",
        steps_taken=steps,
        tool_calls_made=tool_calls,
        seen_signatures=seen,
        final_answer=FALLBACK_ANSWERS["max_steps_reached"],
    )`,
        },
      },
      {
        title: "3 · ทดสอบการดักจับ Duplicate Cycle และ Tool Budget Exhaustion",
        explain:
          "ยืนยันว่าเมื่อโมเดลส่งคำสั่งซ้ำในก้าวที่ 2 ตัว `tool_executor` ถูกเรียกเพียง 1 ครั้งเท่านั้น",
        code: {
          language: "python",
          filename: "worked_guardrails.py",
          code: `executed: list[str] = []


def dummy_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    executed.append(f"{name}:{args.get('order_id')}")
    return {"found": False}


cycle_res = run_guarded_agent_loop(
    [
        AgentAction(kind="tool", tool_name="lookup_order", args={"order_id": "INV-999"}),
        AgentAction(kind="tool", tool_name="lookup_order", args={"order_id": "INV-999"}),
        AgentAction(kind="finish", final_answer="ไม่พบข้อมูล"),
    ],
    dummy_tool,
    max_steps=5,
    max_tool_calls=3,
)

print("Cycle stop_reason:", cycle_res.stop_reason)
print("Steps taken:", cycle_res.steps_taken, "| Actual tool executions:", len(executed))`,
        },
        output: `Cycle stop_reason: duplicate_tool_cycle
Steps taken: 2 | Actual tool executions: 1`,
      },
    ],
    gotcha:
      "สังเกตว่าเมื่อพบ `sig in seen` ในก้าวที่ 2 เราคืน `duplicate_tool_cycle` ทันที **ก่อน** บรรทัด `tool_calls += 1` และ `tool_executor(...)` ทำให้ `tool_calls_made` ยังคงเป็น `1` และไม่มีการยิง API ซ้ำจริง!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `agent_guardrails.py` ที่มี `compute_tool_signature` และ `run_guarded_agent_loop` พร้อมเขียนชุดทดสอบ `test_agent_guardrails.py` ตรวจครบทั้ง 4 เส้นทางการหยุด",
    requirements: [
      "เขียน `compute_tool_signature(tool_name: str, args: dict[str, Any]) -> str` ที่ serialize `args` แบบ `sort_keys=True` แล้วทำ SHA-256 hash",
      "เขียน `run_guarded_agent_loop(planned_actions, tool_executor, max_steps=5, max_tool_calls=2) -> GuardedLoopResult` (ถ้า `max_steps < 1` หรือ `max_tool_calls < 0` ให้โยน `ValueError`)",
      "นับ `steps` ทุกก้าวและหยุดด้วย `stop_reason=\"max_steps_reached\"` ก่อนเกิน `max_steps`",
      "ก่อนเรียก `tool_executor` ให้ตรวจ `duplicate_tool_cycle` (จาก `seen_signatures`) และตรวจ `tool_budget_exhausted` (`tool_calls >= max_tool_calls`) ตามลำดับ และนับ `tool_calls += 1` แม้ `tool_executor` จะโยน Exception (จับ Exception แล้วเดินต่อหรือบันทึกใน state โดยไม่ให้ลูปแครช)",
      "เขียน `test_agent_guardrails.py` ทดสอบครบทั้งกรณี `completed`, `duplicate_tool_cycle`, `tool_budget_exhausted`, `max_steps_reached` และกรณี `tool_executor` โยน Exception แล้วงบ `tool_calls` ยังคงถูกนับ",
    ],
    starter: {
      language: "python",
      filename: "agent_guardrails.py",
      code: `import hashlib
import json
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, Field

StopReason = Literal[
    "completed",
    "max_steps_reached",
    "tool_budget_exhausted",
    "duplicate_tool_cycle",
]


class AgentAction(BaseModel):
    kind: Literal["tool", "finish"]
    tool_name: str = ""
    args: dict[str, Any] = Field(default_factory=dict)
    final_answer: str = ""


class GuardedLoopResult(BaseModel):
    stop_reason: StopReason
    steps_taken: int
    tool_calls_made: int
    seen_signatures: list[str]
    tool_errors: list[str] = Field(default_factory=list)
    final_answer: str


def compute_tool_signature(tool_name: str, args: dict[str, Any]) -> str:
    """สร้างลายเซ็น tool_name:<sha256_prefix> จาก args ที่เรียง key คงที่"""
    # TODO: ใช้ json.dumps(..., sort_keys=True) และ hashlib.sha256
    raise NotImplementedError


def run_guarded_agent_loop(
    planned_actions: list[AgentAction],
    tool_executor: Callable[[str, dict[str, Any]], dict[str, Any]],
    max_steps: int = 5,
    max_tool_calls: int = 2,
) -> GuardedLoopResult:
    """รันลูป Agent ภายใต้เพดาน max_steps, max_tool_calls และการดักจับ duplicate_tool_cycle"""
    # TODO: implement guarded loop
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`compute_tool_signature` คืนค่าเท่ากันเมื่อส่ง `{\"a\": 1, \"b\": 2}` และ `{\"b\": 2, \"a\": 1}` ใช่หรือไม่?",
      "เมื่อตรวจพบ `duplicate_tool_cycle` หรือ `tool_budget_exhausted` ตัว `tool_executor` ไม่ถูกเรียกในก้าวนั้นใช่หรือไม่?",
      "เมื่อ `tool_executor` โยน `RuntimeError` ค่า `tool_calls_made` ยังคงถูกเพิ่ม `+1` และข้อความ error ถูกเก็บไว้ใน `tool_errors` โดยลูปไม่แครชใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทุกเส้นทาง (`completed`, `duplicate_tool_cycle`, `tool_budget_exhausted`, `max_steps_reached`, failed tool call still counts against budget) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "เพิ่ม `tool_calls += 1` และ `seen.append(sig)` ทันทีที่ผ่านด่านตรวจ (ก่อนบรรทัด `try: tool_executor(...) except Exception as exc: tool_errors.append(str(exc))`) เพื่อให้งบถูกนับเสมอแม้เครื่องมือจะโยน exception",
      },
      {
        body: "ถ้าลูป `for action in planned_actions:` วิ่งจนหมดรายการแล้วยังไม่เจอ `kind == \"finish\"` ให้คืน `stop_reason=\"max_steps_reached\"`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_agent_guardrails.py`:",
        code: {
          language: "python",
          filename: "test_agent_guardrails.py",
          code: `from typing import Any
from agent_guardrails import (
    AgentAction,
    compute_tool_signature,
    run_guarded_agent_loop,
)


def test_compute_tool_signature_is_key_order_independent() -> None:
    s1 = compute_tool_signature("search", {"q": "คืนเงิน", "top_k": 3})
    s2 = compute_tool_signature("search", {"top_k": 3, "q": "คืนเงิน"})
    assert s1 == s2


def test_happy_path_completes_within_budgets() -> None:
    calls = 0

    def exec_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        return {"ok": True}

    res = run_guarded_agent_loop(
        [
            AgentAction(kind="tool", tool_name="lookup", args={"id": "1"}),
            AgentAction(kind="finish", final_answer="พบข้อมูลเรียบร้อย"),
        ],
        exec_tool,
        max_steps=4,
        max_tool_calls=2,
    )
    assert res.stop_reason == "completed"
    assert res.steps_taken == 2
    assert res.tool_calls_made == 1
    assert calls == 1


def test_detects_duplicate_tool_cycle_before_re_executing() -> None:
    calls = 0

    def exec_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        return {"ok": True}

    res = run_guarded_agent_loop(
        [
            AgentAction(kind="tool", tool_name="lookup", args={"a": 1, "b": 2}),
            AgentAction(kind="tool", tool_name="lookup", args={"b": 2, "a": 1}),
        ],
        exec_tool,
        max_steps=5,
        max_tool_calls=5,
    )
    assert res.stop_reason == "duplicate_tool_cycle"
    assert res.tool_calls_made == 1
    assert calls == 1


def test_enforces_tool_budget_and_counts_failed_tool_calls() -> None:
    calls = 0

    def flaky_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        raise RuntimeError("db timeout")

    res = run_guarded_agent_loop(
        [
            AgentAction(kind="tool", tool_name="lookup", args={"id": "1"}),
            AgentAction(kind="tool", tool_name="lookup", args={"id": "2"}),
        ],
        flaky_tool,
        max_steps=5,
        max_tool_calls=1,
    )
    assert res.stop_reason == "tool_budget_exhausted"
    assert res.tool_calls_made == 1
    assert len(res.tool_errors) == 1
    assert calls == 1


def test_enforces_max_steps_ceiling() -> None:
    res = run_guarded_agent_loop(
        [
            AgentAction(kind="tool", tool_name="lookup", args={"id": "1"}),
            AgentAction(kind="tool", tool_name="lookup", args={"id": "2"}),
            AgentAction(kind="finish", final_answer="เสร็จ"),
        ],
        lambda n, a: {"ok": True},
        max_steps=2,
        max_tool_calls=5,
    )
    assert res.stop_reason == "max_steps_reached"
    assert res.steps_taken == 2`,
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
      title: "พึ่งพาแต่ `recursion_limit` ของ LangGraph โดยไม่มีตัวแปร `steps` และ `max_steps` ใน State",
      symptom:
        "เมื่อกราฟเดินครบเพดาน ระบบโยน `GraphRecursionError` ออกมาเป็น Exception ดิบ แทนที่จะเดินเข้าโหนด `fallback` เพื่อส่งข้อความสุภาพและบันทึก `stop_reason`",
      fix: "เก็บ `steps` และ `max_steps` ใน State แล้วให้ Conditional Router พาเข้าโหนด `fallback` ก่อนชน `recursion_limit` เสมอ",
    },
    {
      title: "นับ `tool_calls += 1` เฉพาะเมื่อเครื่องมือทำงานสำเร็จ (`ok=True`) เท่านั้น",
      symptom:
        "เมื่อเครื่องมือโยน Exception หรือฐานข้อมูลล่ม ตัวนับ `tool_calls` ไม่เพิ่มขึ้น ทำให้ Agent ยิงซ้ำใส่ระบบที่ล่มอยู่ไม่หยุด",
      fix: "เพิ่ม `tool_calls += 1` ทันทีที่ตัดสินใจเรียกเครื่องมือ (ก่อนหรือใน `try/finally`) ไม่ว่าผลลัพธ์จะสำเร็จหรือล้มเหลว",
    },
    {
      title: "ตรวจจับลูปซ้ำจากชื่อ `tool_name` เพียงอย่างเดียวโดยไม่รวม hash ของ `args`",
      symptom:
        "เมื่อผู้ใช้ถามเปรียบเทียบออเดอร์ 2 รายการ (`INV-001` และ `INV-002`) ระบบบล็อกการเรียก `lookup_order` ครั้งที่สองอย่างผิดพลาดทั้งที่เป็นคนละออเดอร์กัน!",
      fix: "สร้างลายเซ็นจากคู่ `(tool_name, sha256(canonical_json(args)))` เสมอ เพื่อให้บล็อกเฉพาะการเรียกเครื่องมือเดิมด้วยอาร์กิวเมนต์เดิมซ้ำ",
    },
    {
      title: "รันเครื่องมือไปก่อนแล้วค่อยตรวจว่า `sig in seen_signatures` หรือ `tool_calls > max_tool_calls`",
      symptom:
        "เกิด side effect หรือเสียเวลายิง API ซ้ำไปแล้ว 1 ครั้งก่อนที่กราฟจะหยุด",
      fix: "วาง Guardrail Check ทั้งหมดไว้ **ก่อน** บรรทัดเรียก `tool_executor` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d118-q1",
        "ทำไมเราจึงควรจัดการ `steps >= max_steps` ผ่าน State และ Conditional Edge เพื่อเข้าโหนด Fallback แทนการรอให้ LangGraph โยน `GraphRecursionError`?",
        [
          ["เพราะ `GraphRecursionError` ทำให้คอมพิวเตอร์รีสตาร์ตเอง", "ไม่ได้ทำให้เครื่องรีสตาร์ต"],
          ["เพื่อให้กราฟจบการทำงานอย่างนุ่มนวล (Graceful Degradation) โดยคืนข้อความ fallback ที่ปลอดภัยพร้อมรหัส `stop_reason=\"max_steps_reached\"` และข้อมูล trace ครบถ้วนแทนการแครชด้วย Exception", "ถูกต้อง — เราควบคุมทั้งข้อความตอบกลับและข้อมูล Observability ได้ 100%"],
          ["เพราะ LangGraph ไม่มีฟีเจอร์ `recursion_limit`", "LangGraph มี `recursion_limit` เป็นฟิวส์ชั้นสุดท้าย"],
          ["เพื่อให้กราฟสามารถรันเกิน 1,000 ก้าวได้", "เราต้องการจำกัดจำนวนก้าวให้สั้นและปลอดภัย"],
        ],
        "B",
        "`max_steps` ใน State คือเบรกมือที่พาผู้โดยสารจอดเข้าป้าย Fallback อย่างนุ่มนวล ส่วน `recursion_limit` คือถุงลมนิรภัยเมื่อเบรกมือพัง",
        "ข้อดีของการคุม `max_steps` ใน State ควบคู่กับ `recursion_limit` คืออะไร?",
        "ช่วยให้กราฟเลี้ยวเข้าโหนด Fallback อย่างนุ่มนวลพร้อมคืน `stop_reason` ที่ชัดเจนแทนการแครชด้วย Exception",
      ),
      mc(
        "d118-q2",
        "ในการตรวจจับลูปซ้ำ (Cycle Detection) เหตุใดลายเซ็น (`signature`) จึงต้องสร้างจาก `tool_name + sha256(json.dumps(args, sort_keys=True))` แทนการใช้แค่ `tool_name` เฉย ๆ?",
        [
          ["เพื่อให้เรียกเครื่องมือเดียวกันสำหรับข้อมูลคนละรายการได้ (เช่น เช็ก `INV-001` แล้วเช็ก `INV-002`) แต่บล็อกทันทีเมื่อเรียกเครื่องมือเดิมด้วยพารามิเตอร์ชุดเดิมซ้ำ", "ถูกต้อง — การเรียก tool เดิมด้วย args ใหม่คืองานปกติ แต่การเรียกด้วย args เดิมซ้ำคืออาการติดลูป"],
          ["เพราะชื่อ `tool_name` เป็นความลับห้ามเก็บใน State", "ชื่อ `tool_name` เก็บใน State ได้ตามปกติ"],
          ["เพื่อบังคับให้เรียกเครื่องมือได้เพียงชนิดละ 1 ครั้งตลอดอายุของเซิร์ฟเวอร์", "เราตรวจเฉพาะภายในเทิร์น/คำขอเดียวกันและเฉพาะเมื่อ args ซ้ำเดิม"],
          ["เพราะ Python เปรียบเทียบสตริงภาษาอังกฤษไม่ได้", "เปรียบเทียบได้ตามปกติ"],
        ],
        "A",
        "การผูกชื่อเครื่องมือเข้ากับ Canonical Args Hash ช่วยแยกแยะระหว่าง 'การค้นหาหลายรายการ' กับ 'การย้ำคิดย้ำทำที่เดิม' ได้อย่างแม่นยำ",
        "ทำไม Cycle Signature ต้องรวมทั้งชื่อ Tool และ Hash ของ Arguments?",
        "เพื่อให้ยังเรียก Tool เดิมด้วย Arguments ใหม่ได้ แต่บล็อกทันทีเมื่อเรียก Tool เดิมด้วย Arguments ชุดเดิมซ้ำ",
      ),
      mc(
        "d118-q3",
        "หากการเรียก `tool_executor` ในก้าวที่ 1 เกิดข้อผิดพลาด (โยน Exception หรือคืน error) ตัวนับ `tool_calls` ควรเป็นอย่างไร?",
        [
          ["ไม่ควรนับ (`tool_calls = 0`) เพราะเครื่องมือยังทำงานไม่สำเร็จ", "ผิด — จะทำให้โมเดลยิงเครื่องมือที่พังซ้ำได้ไม่จำกัดจนเกิด Retry Storm"],
          ["ต้องนับ `tool_calls += 1` เสมอแม้เครื่องมือจะล้มเหลว และเก็บข้อความ error ลงใน State เพื่อให้ Router และเพดานงบ `max_tool_calls` ทำงานได้ถูกต้อง", "ถูกต้อง — การเรียกที่ล้มเหลวก็ใช้ทรัพยากรและเวลาจริง จึงต้องถูกหักจากงบเสมอ"],
          ["ลดค่า `tool_calls` ลงทีละ 1", "ยิ่งทำให้งบเพิ่มขึ้นผิดปกติ"],
          ["รีเซ็ต `steps = 0` ใหม่ทั้งหมด", "ทำให้เกิด Infinite Loop ทันที"],
        ],
        "B",
        "ทุกความพยายามในการเรียกเครื่องมือภายนอกต้องถูกหักจาก `max_tool_calls` เสมอไม่ว่าจะสำเร็จหรือล้มเหลว",
        "ทำไมต้องนับ `tool_calls += 1` แม้การเรียกเครื่องมือนั้นจะล้มเหลว?",
        "เพื่อป้องกันไม่ให้ Agent ยิงซ้ำใส่ระบบภายนอกที่กำลังล่มอยู่จนเกินงบ (ป้องกัน Retry Storm)",
      ),
      mc(
        "d118-q4",
        "เมื่อโมเดลส่งคำสั่งเรียกเครื่องมือซ้ำเดิมในก้าวที่ 2 จนติดเงื่อนไข `sig in seen_signatures` ระบบควรรัน `tool_executor` ในก้าวที่ 2 หรือไม่?",
        [
          ["รันไปก่อนอีกรอบเพื่อความแน่ใจ แล้วค่อยหยุดในก้าวที่ 3", "ผิด — เสียเวลาและอาจเกิด side effect ซ้ำ"],
          ["ห้ามรัน `tool_executor` ในก้าวที่ 2 เด็ดขาด และตัดเข้าโหนด Fallback ทันทีพร้อม `stop_reason=\"duplicate_tool_cycle\"`", "ถูกต้อง — ดักจับก่อนรัน (Pre-execution check) ช่วยประหยัดทั้งเวลาและป้องกันผลข้างเคียงซ้ำซ้อน"],
          ["รันซ้ำอีก 5 รอบแล้วค่อยเฉลี่ยผลลัพธ์", "ผิดวัตถุประสงค์ของการป้องกันลูป"],
          ["ลบ `seen_signatures` ทิ้งแล้วเริ่มนับหนึ่งใหม่", "ทำให้ลูปวนไม่รู้จบ"],
        ],
        "B",
        "Pre-execution cycle detection ต้องหยุดก่อนที่บรรทัด `tool_executor(...)` จะทำงานเสมอ",
        "เมื่อตรวจพบ `sig in seen_signatures` โค้ดควรทำอย่างไร?",
        "หยุดทันทีโดยไม่รัน `tool_executor` ซ้ำ และคืน `stop_reason='duplicate_tool_cycle'`",
      ),
    ],
  },

  takeaways: [
    "**3 เกราะบังคับของ Guarded Agent Loop**: `max_steps` ceiling, `max_tool_calls` budget และ `seen_signatures` cycle hash",
    "**Check before Execute**: ตรวจทั้ง 3 เกราะก่อนเรียก `tool_executor` เสมอ และนับ `tool_calls += 1` แม้เครื่องมือจะล้มเหลว",
    "**Canonical Signature (`tool_name + sha256(sort_keys_json)`)** ช่วยหยุดอาการโมเดลเรียกเครื่องมือเดิมซ้ำได้ตั้งแต่รอบที่ 2",
    "พรุ่งนี้ (Day 119) เราจะต่อยอดกราฟนี้ด้วย **Checkpointer & Human-in-the-Loop (HITL)** เพื่อให้กราฟหยุดรอคนอนุมัติก่อนรันคำสั่งคืนเงินจริง!",
  ],

  reviewCards: [
    rc(
      "d118-rc1",
      "4 ค่าของ `stop_reason` ใน Guarded Agent Loop มีอะไรบ้าง?",
      "`completed`, `max_steps_reached`, `tool_budget_exhausted` และ `duplicate_tool_cycle`",
    ),
    rc(
      "d118-rc2",
      "ทำไมจึงต้องตรวจ `duplicate_tool_cycle` ก่อนตรวจ `tool_budget_exhausted`?",
      "เพื่อให้กรณีที่โมเดลส่งคำสั่งซ้ำเดิมในโควตาส่งท้าย ถูกรายงานสาเหตุที่แท้จริงว่าเกิดจากลูปซ้ำ (`duplicate_tool_cycle`)",
    ),
    rc(
      "d118-rc3",
      "จะเกิดอะไรขึ้นถ้าเรานับ `tool_calls += 1` เฉพาะตอนที่ Tool คืน `ok=True` เท่านั้น?",
      "เมื่อ Tool ปลายทางล่ม (`ok=False`) ตัวนับจะไม่เพิ่มขึ้นเลย ทำให้ Agent ยิงซ้ำใส่บริการที่ล่มอยู่ไปเรื่อย ๆ จนกว่าจะชน `max_steps`",
    ),
    rc(
      "d118-rc4",
      "วิธีสร้าง Cycle Signature ที่ไม่ขึ้นกับลำดับ key ใน JSON ของ Tool Arguments ทำอย่างไร?",
      "ใช้ `json.dumps(args, sort_keys=True, ensure_ascii=False)` แล้วนำมาเข้า `hashlib.sha256` คู่กับ `tool_name`",
    ),
  ],

  sources: [
    {
      label: "LangGraph Documentation — Recursion Limit & Controlled Execution Loops",
      href: "https://docs.langchain.com/oss/python/langgraph/graph-api#recursion-limit",
    },
    {
      label: "Anthropic Research — Building Effective Agents (Stopping Conditions & Guardrails)",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
    {
      label: "OWASP Top 10 for LLM Applications — LLM10: Unbounded Consumption",
      href: "https://genai.owasp.org/llmrisk/llm10-2025-unbounded-consumption/",
    },
  ],

  glossary: ["langgraph", "guardrails", "tool-calling", "fail-fast", "pydantic", "pytest"],
});
