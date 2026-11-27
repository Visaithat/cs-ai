import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D120 — Phase 4 / Block B30 (Review Day)
 * Review: Quiz + Debug an Infinite Tool-Calling Loop Bug in LangGraph with Guardrails & HITL
 */
export const d120: Lesson = defineLesson({
  day: 120,
  titleTh: "ทบทวน B30: ดีบักบั๊กลูปเรียก Tool ไม่รู้จบใน LangGraph พร้อมติด Guardrails และ HITL Gate",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ผ่าตัดแก้ 3 บั๊กคลาสสิกที่ทำให้ Agent วนลูปไม่รู้จบ พร้อมติดด่านรออนุมัติคืนเงินเกิน 1,000 บาท",
  icon: "git-branch",
  visual: {
    id: "langgraph-guardrails",
    title: "ทบทวน B30: ผ่าตัดแก้บั๊ก Infinite Tool-Calling Loop ใน LangGraph",
    caption: "ตรวจพบจุดที่ State ไม่นับรอบและไม่จดจำ Tool Error แล้วติด Guardrail Router + HITL Refund Gate (> 1,000 THB)",
    alt: "แผนภาพการดีบัก Infinite Loop ใน LangGraph",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — Integration Lab ซ่อมบั๊ก Agent Loop + HITL Threshold Gate ด้วย pytest",
  tools: ["Python 3.12", "LangGraph Concepts", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ทำไม Agent ในห้องแล็บรันผ่านฉลุย แต่พอขึ้น Production กลับค้างอยู่ในลูปไม่รู้จบ?",
      body: "ในการสัมภาษณ์งาน AI Engineer และในการดูแลระบบจริง โจทย์ที่คุณจะได้เจอแน่ ๆ คือการไล่หาสาเหตุว่าทำไมกราฟ {{langgraph}} ถึงวนเรียก {{tool-calling}} ซ้ำ 50 รอบจนชน Timeout — วันทบทวนนี้เราจะมาผ่าตัด 3 บั๊กต้นตอและซ่อมให้หายขาด",
      lessonNote: "3 บั๊กคลาสสิก: (1) โหนดลืมคืน `step_count + 1` กลับเข้า State, (2) กลืน Tool Error ทิ้งจน Router ไม่รู้ว่าเครื่องมือพัง และ (3) ไม่มี Cycle Hash ดักคำสั่งซ้ำ",
    },
    {
      node: 3,
      heading: "รวมเกราะ Block B30: State Reducer (D117) + Budgets/Cycle Hash (D118) + HITL (D119)",
      body: "เมื่อซ่อมลูปให้เดินและหยุดอย่างถูกต้องแล้ว เราจะเชื่อมเข้ากับด่าน **Human-in-the-Loop ({{hitl}})** ตามนโยบายธุรกิจจริง: หากคำขอคืนเงินมียอด `amount_thb <= 1000` ให้ดำเนินการอัตโนมัติได้ แต่หาก `amount_thb > 1000` ต้องหยุดพักด้วย {{checkpointer}} รอคนอนุมัติเสมอ",
      lessonNote: "การทดสอบขอบเขตตัวเลข (`1000` vs `1001` บาท) คือทักษะสำคัญของการเขียน Boundary Test ใน `pytest`",
    },
    {
      node: 4,
      heading: "ตรวจสอบด้วย Deterministic Mock Tools ที่แกล้งพังและแกล้งส่งคำสั่งซ้ำ",
      body: "เราจะใช้ Mock Tool ที่แกล้งโยนข้อผิดพลาด (`ConnectionError`) หรือคืนค่าว่าง เพื่อพิสูจน์ว่ากราฟที่เราซ่อมแล้วสามารถบันทึก `tool_error` ลง State, หักงบ `step_count` และตัดเข้าโหนด `fallback` ได้อย่างปลอดภัย",
      lessonNote: "ไม่มีการเสียค่า API และรันเทสต์ทั้งหมดเสร็จในเสี้ยววินาที",
    },
    {
      node: 6,
      heading: "พร้อม 100% สำหรับสัปดาห์สุดท้ายของ Phase 4: Mini-Project & Checkpoint (Block B31)",
      body: "เมื่อจบวันทบทวนนี้ คุณจะมีครบทั้งท่อ **Thai Hybrid RAG + Multi-Tenant ACL (B24–B27)**, **Safe Tools & Workflows (B28)**, **FastMCP Server/Client (B29)** และ **Guarded LangGraph + HITL (B30)** พร้อมนำมาประกอบเป็นโปรเจกต์ใหญ่ใน Day 121–124!",
      lessonNote: "ทำควิซทบทวน 4 ข้อแบบไม่เปิดโพย แล้วลงมือผ่าตัดซ่อม `debug_agent_loop.py` กันเลย",
    },
  ],

  objectives: [
    "**ทบทวนแบบสลับหัวข้อ (Interleaved Recall)** เนื้อหา Day 117–119 (LangGraph State/Reducers, Conditional Edges, Step/Tool Budgets, Cycle Hash และ Thread-Scoped HITL Checkpoints)",
    "**วินิจฉัยและซ่อม 3 บั๊กต้นตอของ Infinite Agent Loop** ได้แก่ การอัปเดต `step_count` ทุกก้าว, การส่ง `tool_error` กลับเข้า State เพื่อให้ Router เห็นความล้มเหลว และการตรวจ Cycle Hash ก่อนเรียกเครื่องมือซ้ำ",
    "**ผสานด่านอนุมัติคืนเงินตามเงื่อนไขยอดเงิน (`amount_thb > 1000`)** ที่หยุดพักรอ `approved=True/False` ใน Checkpointer พร้อมทดสอบครบทุกกรณีขอบเขตด้วย {{pytest}}",
  ],

  prerequisites: [
    "ทบทวน Day 117 (LangGraph State & Conditional Routing), Day 118 (Budgets & Cycle Hash) และ Day 119 (Checkpointer & HITL)",
    "เขียนและรัน `pytest` สำหรับทดสอบกรณีขอบเขต (Boundary Value Testing) ได้",
    "ไม่ต้องใช้ API key — ดีบักและรันชุดทดสอบบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day120` ด้วย `uv` เพื่อลงมือซ่อมโมดูล `debug_agent_loop.py` และรันชุดทดสอบ `test_debug_agent_loop.py` ให้ผ่านครบทุกเคสภายใน 30 นาที",
    commands: `uv init ai-day120 && cd ai-day120
uv add pydantic langgraph
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day120` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `langgraph`, `pytest` และ `ruff`"],
      ["ready", "ทำควิซทบทวน 4 ข้อ แล้วลงมือซ่อม `debug_agent_loop.py` และรัน `uv run pytest -v`"],
    ],
    note: "ลองอ่านโค้ดที่มีบั๊กในส่วน Concept ที่ 1 ก่อนดูวิธีซ่อม เพื่อฝึกสายตาในการตรวจจับบั๊กของ State Machine",
  },

  concepts: [
    {
      id: "anatomy-of-three-infinite-loop-bugs",
      title: "1 · ผ่าชันสูตร 3 บั๊กคลาสสิกที่ทำให้ LangGraph วนลูปไม่รู้จบ",
      paragraphs: [
        "เวลาที่กราฟ {{langgraph}} ค้างอยู่ในลูป `agent → tool → agent → tool` ไม่ยอมจบ มักเกิดจากบั๊ก 3 จุดนี้รวมกัน:",
        "**บั๊กที่ 1: โหนดลืมคืนค่า `step_count` ที่บวกเพิ่มแล้วกลับเข้า State** — ใน LangGraph โหนดต้องคืน dict ของฟิลด์ที่ต้องการอัปเดต หากโหนดเขียนแค่ `step_count = state[\"step_count\"] + 1` เป็นตัวแปรโลคอลแต่ตอน `return` ลืมใส่ `\"step_count\": step_count` ค่าใน State จะเป็น `0` ตลอดกาล ทำให้เงื่อนไข `step_count >= max_steps` ไม่มีวันเป็นจริง!",
        "**บั๊กที่ 2: กลืน Tool Exception ทิ้งโดยไม่บันทึกลง `tool_error` ใน State** — เมื่อเครื่องมือค้นฐานข้อมูลล้มเหลวแล้วโหนดเขียน `except Exception: return {}` ตัว Conditional Router จะไม่รู้เลยว่าเครื่องมือพัง จึงส่งกลับไปโหนดเดิมให้ลองเรียกใหม่ซ้ำ ๆ",
        "**บั๊กที่ 3: ไม่เก็บ `seen_signatures` ของ `(tool_name, canonical_args_hash)`** — เมื่อโมเดลส่งคำสั่งเดิมซ้ำเพราะไม่ได้ข้อมูลที่ต้องการ กราฟไม่มีตัวดักจับว่าคำสั่งนี้เคยรันไปแล้วในเทิร์นเดียวกัน",
      ],
      analogy:
        "เหมือนคนเดินหลงในเขาวงกตที่ (1) นาฬิกาจับเวลาเสียเดินไม่ขยับ (`step_count=0`), (2) เจอทางตันแล้วไม่เขียนป้ายบอกตัวเองว่าทางนี้ตัน (`tool_error=None`) และ (3) ไม่โรยเศษขนมปังจำรอยเท้าเดิม (`seen_signatures=[]`) จึงเดินวนเข้าซอยตันเดิมไม่รู้จบ",
      code: {
        language: "python",
        filename: "buggy_vs_fixed_node.py",
        code: `# ❌ BUGGY NODE: อัปเดตตัวแปรโลคอลแต่ไม่คืนเข้า State และกลืน error ทิ้ง
def buggy_tool_node(state: dict) -> dict:
    steps = state["step_count"] + 1  # ลืมส่งกลับใน return!
    try:
        res = call_external_tool(state["pending_tool"])
        return {"tool_output": res}
    except Exception:
        return {}  # กลืน error หายไปเลย!


# ✅ FIXED NODE: คืน step_count + 1 เสมอ และบันทึก tool_error อย่างชัดเจน
def fixed_tool_node(state: dict) -> dict:
    next_step = state["step_count"] + 1
    try:
        res = call_external_tool(state["pending_tool"])
        return {"step_count": next_step, "tool_output": res, "tool_error": None}
    except Exception as exc:
        return {"step_count": next_step, "tool_output": None, "tool_error": str(exc)}`,
        caption: "เปรียบเทียบโหนดที่ทำให้เกิด Infinite Loop กับโหนดที่อัปเดต `step_count` และ `tool_error` ครบทุกเส้นทาง",
      },
      whyTitle: "Why this matters — ทุกกิ่ง `try` และ `except` ของโหนดต้องคืน `step_count` ที่เพิ่มขึ้นเสมอ",
      whyParagraphs: [
        "แม้จะคืน `step_count` ในกิ่ง `try` แล้ว แต่ถ้าในกิ่ง `except` ลืมคืน `step_count: next_step` ทันทีที่เครื่องมือโยน Exception ตัวนับก้าวก็จะหยุดนิ่งและเกิดลูปไม่รู้จบเฉพาะตอนที่ระบบภายนอกล่ม!",
      ],
    },
    {
      id: "policy-based-hitl-refund-threshold",
      title: "2 · Conditional HITL Gate: คืนเงินอัตโนมัติ <= 1,000 บาท vs หยุดรออนุมัติ > 1,000 บาท",
      paragraphs: [
        "ในระบบบริการลูกค้าจริง หากต้องให้หัวหน้างานมากดอนุมัติทุกเคสแม้กระทั่งเคสคืนค่าส่ง 30 บาท ทีมงานจะทำงานไม่ทัน แต่ถ้าปล่อยให้บอทคืนเงินหลักหมื่นบาทเองก็เสี่ยงเกินไป",
        "เราจึงผสาน **Conditional Routing (D117)** เข้ากับ **{{hitl}} Checkpointer (D119)** ด้วยกฎทางธุรกิจที่ชัดเจน: ตั้งเพดาน `AUTO_REFUND_LIMIT_THB = 1000`",
        "- หาก `amount_thb <= 1000`: กราฟอนุญาตให้รัน `refund_executor` ได้ทันทีในรอบเดียวและจบด้วยสถานะ `status=\"refunded_auto\"`\n- หาก `amount_thb > 1000` และ `approved is None`: กราฟจะ **หยุดพักทันที** ด้วยสถานะ `status=\"awaiting_approval\"` และเซฟลง {{checkpointer}} ของ `thread_id` นั้น\n- เมื่อผู้ดูแลบันทึกผลและสั่ง `resume`: หาก `approved is True` จึงรัน `refund_executor` และจบด้วย `status=\"refunded_approved\"` แต่หาก `approved is False` ให้จบด้วย `status=\"rejected_by_human\"` โดยไม่โอนเงิน",
      ],
      analogy:
        "เหมือนสิทธิ์อนุมัติในธนาคาร: ยอดไม่เกิน 1,000 บาท พนักงานหน้าเคาน์เตอร์ทำรายการให้ลูกค้าได้ทันที แต่ถ้ายอดตั้งแต่ 1,001 บาทขึ้นไป หน้าจอจะขึ้นสถานะล็อกรอผู้จัดการสาขาเสียบบัตรอนุมัติก่อน",
      bullets: [
        "**Boundary `amount_thb == 1000`**: ผ่านแบบอัตโนมัติ (`refunded_auto`) เพราะเงื่อนไขต้องรออนุมัติคือ `> 1000`",
        "**Boundary `amount_thb == 1001`**: หยุดรอที่ `awaiting_approval` ทันที (`refund_calls == 0`)",
        "**Resumed Approval**: โอนเงินเฉพาะเมื่อ `approved is True` เท่านั้น",
      ],
      whyTitle: "Why this matters — การเขียน Boundary Test ที่เลข `1000` และ `1001` ช่วยจับบั๊กเครื่องหมาย `>` vs `>=` ได้ทันที",
      whyParagraphs: [
        "บั๊ก `off-by-one` (`amount >= 1000` แทนที่จะเป็น `amount > 1000`) เกิดขึ้นบ่อยมาก การใส่เคสทดสอบที่ยอด `1000` พอดีไว้ใน `pytest` จึงเป็นนิสัยสำคัญของวิศวกรที่รัดกุม",
      ],
    },
    {
      id: "b30-synthesis-before-mini-project",
      title: "3 · สรุปเช็กลิสต์ Block B30 ก่อนลุย Phase 4 Mini-Project (D121–D124)",
      paragraphs: [
        "ทบทวน 4 กฎเหล็กของการควบคุม Agent ด้วย {{langgraph}} ที่เราเรียนจบใน Block B30:",
        "1. **Explicit State & Reducers (D117)**: ทุกโหนดต้องคืนค่าอัปเดตกลับเข้า State อย่างชัดเจน โดยเฉพาะ `step_count`, `trace` และ `tool_error`",
        "2. **Step & Tool Budgets (D118)**: ตรวจ `step_count >= max_steps` และ `tool_calls >= max_tool_calls` ก่อนรันก้าวถัดไป เพื่อเลี้ยวเข้าโหนด `fallback` อย่างปลอดภัยแทนการปล่อยให้กราฟแครช",
        "3. **Canonical Cycle Detection (D118)**: คำนวณ `sig = f\"{tool_name}:{sha256(sort_keys_json)}\"` และหยุดด้วย `duplicate_tool_cycle` ทันทีที่พบคำสั่งซ้ำใน `seen_signatures`",
        "4. **Thread-Scoped HITL Checkpoints (D119)**: ใช้ `thread_id` แยกสถานะแต่ละงาน หยุดก่อน Write Action ที่มีความเสี่ยงสูง และตรวจ `approved is True` ซ้ำก่อนรันผลข้างเคียงเสมอ",
      ],
      analogy:
        "ทั้ง 4 ข้อนี้คือระบบเบรก พวงมาลัย เข็มขัดนิรภัย และกุญแจนิรภัยของรถ Agent ที่พร้อมจะวิ่งเชื่อมกับระบบ Thai Hybrid RAG และ MCP Server ใน Mini-Project วันพรุ่งนี้แล้ว",
      bullets: [
        "**D117**: `StateGraph`, Typed State, Reducers & Conditional Edges",
        "**D118**: `max_steps`, `max_tool_calls`, `seen_signatures` & `stop_reason`",
        "**D119**: `Checkpointer`, `thread_id`, `interrupt_before` & `approved is True`",
      ],
      whyTitle: "Why this matters — ใน Day 121–124 เราจะนำกราฟนี้ไปต่อกับ Thai Hybrid RAG และ MCP Lookup จริง",
      whyParagraphs: [
        "โค้ดที่คุณซ่อมและทดสอบในวันนี้คือโครงสร้างเดียวกับส่วนควบคุม Agent ใน Phase 4 Mini-Project และ Phase 4 Checkpoint ทุกประการ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบการดีบัก LangGraph Loop กับการดีบัก State & Reducer ใน Redux / React",
      body: [
        "หากคุณเคยเขียน React หรือ Redux บั๊กใน LangGraph State Machine มีธรรมชาติเดียวกันเลยครับ:",
      ],
      table: [
        ["แก้ไขตัวแปรโลคอลแต่ลืม `return {\"step_count\": ...}`", "Mutate state ตรง ๆ ใน Redux reducer แล้วลืม return new state"],
        ["`except Exception: return {}` กลืน error", "Empty `catch {}` ใน async action จน UI ค้างสถานะ Loading ตลอดกาล"],
        ["`seen_signatures` cycle hash", "`useEffect` dependency comparison ป้องกัน infinite re-render loop"],
        ["Threshold HITL (`amount_thb > 1000`)", "Step-up Authentication / 2FA challenge เมื่อโอนเงินเกินวงเงิน"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีไล่หาบั๊กลูปไม่รู้จบใน pytest โดยไม่ต้องรอให้ค้างจริง",
      body: [
        "เวลาเขียนเทสต์ทดสอบโค้ดที่อาจมีบั๊ก Infinite Loop เราไม่ควรตั้ง `max_steps = 1000000` แต่ให้ตั้ง `max_steps = 3` หรือ `4` ในเทสต์!",
        "ถ้าโค้ดของเราซ่อมถูก ลูปจะต้องหยุดภายใน `step_count <= max_steps` เสมอ และเราสามารถ `assert result.step_count == 2` เพื่อเช็กได้ทันทีว่าตัวนับก้าวเดินจริงทุกก้าว",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีคลาส `GuardedSupportGraph` ที่ซ่อมบั๊กทั้ง 3 จุดเรียบร้อยแล้ว (นับ `step_count` ทุกก้าว, เก็บ `tool_error` ลง State เพื่อตัดเข้า fallback, ดัก `duplicate_tool_cycle` ด้วย hash) และผสานด่านอนุมัติคืนเงินเมื่อ `amount_thb > 1000`",
    steps: [
      {
        title: "1 · นิยามโมเดลสถานะ `SupportGraphState` และฟังก์ชันคำนวณลายเซ็น",
        explain:
          "รวมฟิลด์ด้าน Guardrails (`step_count`, `seen_signatures`, `tool_error`) เข้ากับฟิลด์ด้าน HITL (`amount_thb`, `approved`, `status`) ในโมเดลเดียว",
        code: {
          language: "python",
          filename: "worked_b30_debug.py",
          code: `import hashlib
import json
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, Field

GraphStatus = Literal[
    "completed",
    "max_steps_reached",
    "duplicate_tool_cycle",
    "tool_error_fallback",
    "awaiting_approval",
    "refunded_auto",
    "refunded_approved",
    "rejected_by_human",
]


class ToolStep(BaseModel):
    tool_name: str
    args: dict[str, Any] = Field(default_factory=dict)


class SupportGraphState(BaseModel):
    thread_id: str
    step_count: int = 0
    max_steps: int = 4
    seen_signatures: list[str] = Field(default_factory=list)
    tool_error: str | None = None
    amount_thb: int = 0
    approved: bool | None = None
    status: GraphStatus = "completed"
    output_text: str = ""


def make_sig(tool_name: str, args: dict[str, Any]) -> str:
    canonical = json.dumps(args, sort_keys=True, ensure_ascii=False)
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]
    return f"{tool_name}:{digest}"`,
        },
      },
      {
        title: "2 · เขียนลูปที่ซ่อมบั๊กครบทั้ง 3 จุด + ด่าน HITL เกิน 1,000 บาท",
        explain:
          "ทุกก้าวจะเพิ่ม `step_count`, ตรวจ `max_steps`, ตรวจ `sig in seen_signatures`, จับ `tool_error` ลง State เพื่อตัดเข้า `tool_error_fallback` และตรวจยอดคืนเงินเทียบกับเพดาน `1000` บาท",
        code: {
          language: "python",
          filename: "worked_b30_debug.py",
          code: `AUTO_REFUND_LIMIT_THB = 1000


class GuardedSupportGraph:
    def __init__(
        self,
        tool_fn: Callable[[str, dict[str, Any]], dict[str, Any]],
        refund_fn: Callable[[str, int], str],
    ) -> None:
        self._tool_fn = tool_fn
        self._refund_fn = refund_fn
        self._checkpoints: dict[str, SupportGraphState] = {}

    def run_tool_steps(
        self,
        thread_id: str,
        planned_steps: list[ToolStep],
        max_steps: int = 4,
    ) -> SupportGraphState:
        state = SupportGraphState(thread_id=thread_id, max_steps=max_steps)

        for step in planned_steps:
            if state.step_count >= state.max_steps:
                state.status = "max_steps_reached"
                state.output_text = "หยุดการทำงานเนื่องจากครบเพดานจำนวนก้าว"
                self._checkpoints[thread_id] = state
                return state.model_copy()

            state.step_count += 1
            sig = make_sig(step.tool_name, step.args)
            if sig in state.seen_signatures:
                state.status = "duplicate_tool_cycle"
                state.output_text = "หยุดการทำงานเนื่องจากตรวจพบการเรียกเครื่องมือซ้ำ"
                self._checkpoints[thread_id] = state
                return state.model_copy()

            state.seen_signatures.append(sig)
            try:
                res = self._tool_fn(step.tool_name, step.args)
                state.output_text = f"ผลลัพธ์: {res}"
            except Exception as exc:
                state.tool_error = str(exc)
                state.status = "tool_error_fallback"
                state.output_text = "ขออภัย ระบบค้นข้อมูลขัดข้องชั่วคราว"
                self._checkpoints[thread_id] = state
                return state.model_copy()

        state.status = "completed"
        self._checkpoints[thread_id] = state
        return state.model_copy()

    def request_refund(
        self,
        thread_id: str,
        order_id: str,
        amount_thb: int,
    ) -> SupportGraphState:
        state = SupportGraphState(
            thread_id=thread_id,
            step_count=1,
            amount_thb=amount_thb,
        )
        if amount_thb <= AUTO_REFUND_LIMIT_THB:
            tx = self._refund_fn(order_id, amount_thb)
            state.status = "refunded_auto"
            state.output_text = f"คืนเงินอัตโนมัติสำเร็จ: {tx}"
        else:
            state.status = "awaiting_approval"
            state.output_text = f"ยอด {amount_thb} บาท เกิน 1,000 บาท ต้องรอผู้ดูแลอนุมัติ"
        self._checkpoints[thread_id] = state
        return state.model_copy()

    def decide_and_resume_refund(
        self,
        thread_id: str,
        order_id: str,
        approved: bool,
    ) -> SupportGraphState:
        if thread_id not in self._checkpoints:
            raise KeyError(f"Unknown thread_id: {thread_id}")
        state = self._checkpoints[thread_id]
        if state.status in ("refunded_auto", "refunded_approved", "rejected_by_human"):
            return state.model_copy()

        state.approved = approved
        state.step_count += 1
        if approved is True:
            tx = self._refund_fn(order_id, state.amount_thb)
            state.status = "refunded_approved"
            state.output_text = f"อนุมัติและคืนเงินสำเร็จ: {tx}"
        else:
            state.status = "rejected_by_human"
            state.output_text = "คำขอคืนเงินถูกปฏิเสธโดยผู้ดูแล"
        self._checkpoints[thread_id] = state
        return state.model_copy()`,
        },
      },
      {
        title: "3 · ทดสอบการตัดจบเมื่อ Tool พัง และการคืนเงินที่ขอบเขต 1,000 vs 1,500 บาท",
        explain:
          "รันดูผลลัพธ์ของทั้งกรณี Tool โยน Exception, กรณียอด 1,000 บาท (โอนอัตโนมัติ) และกรณียอด 1,500 บาท (หยุดรออนุมัติ)",
        code: {
          language: "python",
          filename: "worked_b30_debug.py",
          code: `refund_log: list[tuple[str, int]] = []

graph = GuardedSupportGraph(
    tool_fn=lambda name, args: (_ for _ in ()).throw(RuntimeError("DB offline")),
    refund_fn=lambda oid, amt: (refund_log.append((oid, amt)) or f"TX-{oid}"),
)

err_state = graph.run_tool_steps("th-err", [ToolStep(tool_name="lookup", args={"id": 1})])
auto_state = graph.request_refund("th-1000", "INV-01", 1000)
wait_state = graph.request_refund("th-1500", "INV-02", 1500)
approved_state = graph.decide_and_resume_refund("th-1500", "INV-02", approved=True)

print("1. Tool error state:", err_state.status, "| step_count:", err_state.step_count, "| err:", err_state.tool_error)
print("2. 1000 THB refund:", auto_state.status, "| log:", refund_log)
print("3. 1500 THB initial:", wait_state.status, "-> after approve:", approved_state.status, "| log:", refund_log)`,
        },
        output: `1. Tool error state: tool_error_fallback | step_count: 1 | err: DB offline
2. 1000 THB refund: refunded_auto | log: [('INV-01', 1000)]
3. 1500 THB initial: awaiting_approval -> after approve: refunded_approved | log: [('INV-01', 1000), ('INV-02', 1500)]`,
      },
    ],
    gotcha:
      "สังเกตความต่างที่ขอบเขตตัวเลข: ยอด `1000` บาท (`amount_thb <= 1000`) ได้สถานะ `refunded_auto` ทันทีในก้าวเดียว แต่พอยอดเป็น `1001` หรือ `1500` บาท (`amount_thb > 1000`) กราฟต้องหยุดที่ `awaiting_approval` โดยยังไม่เรียก `refund_fn` จนกว่าจะเรียก `decide_and_resume_refund` ด้วย `approved=True`!",
  },

  practice: {
    intro:
      "ภารกิจทบทวน 15 นาที: สร้างโมดูล `debug_agent_loop.py` ที่ซ่อมบั๊กลูปไม่รู้จบครบทั้ง 3 จุด และผสานด่าน HITL สำหรับยอดคืนเงินเกิน 1,000 บาท พร้อมชุดทดสอบ `test_debug_agent_loop.py`",
    requirements: [
      "เขียน `make_sig(tool_name: str, args: dict[str, Any]) -> str` สร้างลายเซ็นด้วย `json.dumps(..., sort_keys=True)` และ SHA-256",
      "ใน `GuardedSupportGraph.run_tool_steps` ให้นับ `step_count` ทุกก้าว, ตัดจบด้วย `status=\"max_steps_reached\"` เมื่อถึง `max_steps` และตัดจบด้วย `status=\"duplicate_tool_cycle\"` ก่อนรันเครื่องมือซ้ำเมื่อพบ `sig in seen_signatures`",
      "เมื่อ `tool_fn` โยน Exception ให้เก็บข้อความลง `state.tool_error` และตัดเข้า `status=\"tool_error_fallback\"` ทันทีโดยไม่วนลูปต่อ",
      "ใน `request_refund(thread_id, order_id, amount_thb)` ถ้ายอด `amount_thb <= 1000` ให้รัน `refund_fn` ทันที (`status=\"refunded_auto\"`) แต่ถ้ายอด `amount_thb > 1000` ให้หยุดพักใน Checkpointer ด้วย `status=\"awaiting_approval\"` แล้วค่อยดำเนินการต่อใน `decide_and_resume_refund(thread_id, order_id, approved)`",
      "เขียน `test_debug_agent_loop.py` ทดสอบครบทั้ง 5 กรณี: (1) tool error fallback พร้อมบันทึก `tool_error`, (2) duplicate cycle stop, (3) `max_steps` ceiling, (4) ขอบเขต 1,000 บาท (`refunded_auto`) และ (5) ยอดเกิน 1,000 บาท ทั้งกรณีอนุมัติ (`refunded_approved`) และปฏิเสธ (`rejected_by_human`)",
    ],
    starter: {
      language: "python",
      filename: "debug_agent_loop.py",
      code: `import hashlib
import json
from collections.abc import Callable
from typing import Any, Literal
from pydantic import BaseModel, Field

AUTO_REFUND_LIMIT_THB = 1000

GraphStatus = Literal[
    "completed",
    "max_steps_reached",
    "duplicate_tool_cycle",
    "tool_error_fallback",
    "awaiting_approval",
    "refunded_auto",
    "refunded_approved",
    "rejected_by_human",
]


class ToolStep(BaseModel):
    tool_name: str
    args: dict[str, Any] = Field(default_factory=dict)


class SupportGraphState(BaseModel):
    thread_id: str
    step_count: int = 0
    max_steps: int = 4
    seen_signatures: list[str] = Field(default_factory=list)
    tool_error: str | None = None
    amount_thb: int = 0
    approved: bool | None = None
    status: GraphStatus = "completed"
    output_text: str = ""


def make_sig(tool_name: str, args: dict[str, Any]) -> str:
    """สร้างลายเซ็น tool_name:<sha256_prefix> จาก args ที่เรียง key คงที่"""
    # TODO: ใช้ json.dumps(..., sort_keys=True) และ hashlib.sha256
    raise NotImplementedError


class GuardedSupportGraph:
    def __init__(
        self,
        tool_fn: Callable[[str, dict[str, Any]], dict[str, Any]],
        refund_fn: Callable[[str, int], str],
    ) -> None:
        self._tool_fn = tool_fn
        self._refund_fn = refund_fn
        self._checkpoints: dict[str, SupportGraphState] = {}

    def run_tool_steps(
        self,
        thread_id: str,
        planned_steps: list[ToolStep],
        max_steps: int = 4,
    ) -> SupportGraphState:
        """รันขั้นตอนการเรียก tool พร้อมตรวจ max_steps, duplicate cycle และจับ tool_error"""
        # TODO: implement guarded tool execution loop
        raise NotImplementedError

    def request_refund(
        self,
        thread_id: str,
        order_id: str,
        amount_thb: int,
    ) -> SupportGraphState:
        """คืนเงินอัตโนมัติเมื่อ <= 1000 บาท หรือหยุดรออนุมัติเมื่อ > 1000 บาท"""
        # TODO: implement threshold HITL gate
        raise NotImplementedError

    def decide_and_resume_refund(
        self,
        thread_id: str,
        order_id: str,
        approved: bool,
    ) -> SupportGraphState:
        """บันทึกผลอนุมัติและ resume การคืนเงินของ thread_id ที่ระบุ"""
        # TODO: implement resume logic
        raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "เมื่อ `tool_fn` โยน Exception ค่า `state.step_count` ถูกบวกเพิ่มแล้ว และ `state.tool_error` ไม่เป็น `None` ใช่หรือไม่?",
      "เมื่อ `amount_thb == 1000` พอดี ระบบคืนเงินอัตโนมัติ (`refunded_auto`) โดยไม่ต้องรอคนอนุมัติใช่หรือไม่?",
      "เมื่อ `amount_thb == 1001` ระบบหยุดที่ `awaiting_approval` โดยยังไม่เรียก `refund_fn` จนกว่าจะเรียก `decide_and_resume_refund(..., approved=True)` ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทั้ง 5 การทดสอบบูรณาการของ Block B30 และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใน `run_tool_steps` ตรวจ `if state.step_count >= state.max_steps:` ก่อนเพิ่ม `state.step_count += 1` ในแต่ละรอบ",
      },
      {
        body: "ใน `decide_and_resume_refund` ตรวจ `if state.status in (\"refunded_auto\", \"refunded_approved\", \"rejected_by_human\"): return state.model_copy()` เพื่อป้องกันการโอนเงินซ้ำหากถูกเรียกซ้ำ",
      },
      {
        body: "เฉลยชุดทดสอบ `test_debug_agent_loop.py`:",
        code: {
          language: "python",
          filename: "test_debug_agent_loop.py",
          code: `from typing import Any
from debug_agent_loop import GuardedSupportGraph, ToolStep


def test_tool_error_is_recorded_and_routes_to_fallback() -> None:
    calls = 0

    def failing_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        raise RuntimeError("sqlite locked")

    graph = GuardedSupportGraph(failing_tool, lambda oid, amt: "TX")
    state = graph.run_tool_steps(
        "t-err",
        [
            ToolStep(tool_name="lookup", args={"id": 1}),
            ToolStep(tool_name="lookup", args={"id": 2}),
        ],
    )
    assert state.status == "tool_error_fallback"
    assert state.step_count == 1
    assert state.tool_error == "sqlite locked"
    assert calls == 1


def test_stops_on_duplicate_cycle_and_max_steps() -> None:
    calls = 0

    def ok_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
        nonlocal calls
        calls += 1
        return {"ok": True}

    graph = GuardedSupportGraph(ok_tool, lambda oid, amt: "TX")
    dup = graph.run_tool_steps(
        "t-dup",
        [
            ToolStep(tool_name="lookup", args={"a": 1, "b": 2}),
            ToolStep(tool_name="lookup", args={"b": 2, "a": 1}),
        ],
    )
    assert dup.status == "duplicate_tool_cycle"
    assert calls == 1

    maxed = graph.run_tool_steps(
        "t-max",
        [
            ToolStep(tool_name="lookup", args={"id": 1}),
            ToolStep(tool_name="lookup", args={"id": 2}),
            ToolStep(tool_name="lookup", args={"id": 3}),
        ],
        max_steps=2,
    )
    assert maxed.status == "max_steps_reached"
    assert maxed.step_count == 2


def test_refund_boundary_1000_auto_vs_over_1000_hitl() -> None:
    refunds: list[tuple[str, int]] = []
    graph = GuardedSupportGraph(
        lambda n, a: {"ok": True},
        lambda oid, amt: (refunds.append((oid, amt)) or f"TX-{oid}"),
    )

    # Boundary 1000 THB -> auto refund
    s_auto = graph.request_refund("t-1000", "INV-1000", 1000)
    assert s_auto.status == "refunded_auto"
    assert refunds == [("INV-1000", 1000)]

    # 1001 THB -> pauses for approval
    s_wait = graph.request_refund("t-1001", "INV-1001", 1001)
    assert s_wait.status == "awaiting_approval"
    assert len(refunds) == 1

    s_ok = graph.decide_and_resume_refund("t-1001", "INV-1001", approved=True)
    assert s_ok.status == "refunded_approved"
    assert refunds == [("INV-1000", 1000), ("INV-1001", 1001)]

    # Over 1000 THB rejected -> no refund executed
    graph.request_refund("t-2000", "INV-2000", 2000)
    s_rej = graph.decide_and_resume_refund("t-2000", "INV-2000", approved=False)
    assert s_rej.status == "rejected_by_human"
    assert len(refunds) == 2`,
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
      title: "อัปเดต `step_count` เฉพาะตอนที่ `tool_fn` ทำงานสำเร็จ แต่ลืมอัปเดตในกิ่ง `except`",
      symptom:
        "เมื่อเครื่องมือโยน Exception ตัวนับก้าวไม่เพิ่มขึ้นและกราฟวนลูปเรียกเครื่องมือที่พังอยู่ไม่รู้จบ",
      fix: "เพิ่ม `state.step_count += 1` ตั้งแต่เริ่มก้าว (ก่อน `try: self._tool_fn(...)`) เสมอ",
    },
    {
      title: "เขียนเงื่อนไข `if amount_thb >= 1000:` ให้ต้องรออนุมัติ ทั้งที่สเปกกำหนดว่า 'เกิน 1,000 บาท (`> 1000`)'",
      symptom:
        "เคสคืนเงินยอด 1,000 บาทพอดีติดค้างอยู่ที่ `awaiting_approval` และตก Boundary Test ใน `pytest`",
      fix: "ตรวจสอบคำนิยามขอบเขตให้แม่นยำ: `amount_thb <= 1000` คืออัตโนมัติ และ `amount_thb > 1000` คือหยุดรออนุมัติ",
    },
    {
      title: "เมื่อจับ `Exception` จากเครื่องมือได้แล้ว ไม่บันทึก `state.tool_error` และปล่อยให้ลูปเดินเรียกขั้นตอนถัดไปที่พึ่งพาผลลัพธ์ของก้าวแรก",
      symptom:
        "ก้าวถัดไปทำงานด้วยข้อมูล `None` จนเกิดข้อผิดพลาดต่อเนื่อง (Cascading Failure)",
      fix: "บันทึก `state.tool_error = str(exc)` และตัดเข้าโหนด `tool_error_fallback` อย่างปลอดภัยทันที",
    },
    {
      title: "ใช้ `str(args)` ตรง ๆ ในการสร้างลายเซ็นตรวจจับลูปซ้ำโดยไม่เรียง key",
      symptom:
        "เมื่อลำดับ key ใน dict สลับกัน ระบบตรวจไม่พบว่าเป็นคำสั่งซ้ำและปล่อยให้รันเครื่องมือเดิมซ้ำอีกครั้ง",
      fix: "ใช้ `json.dumps(args, sort_keys=True, ensure_ascii=False)` ก่อนทำ SHA-256 เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d120-q1",
        "ข้อใดคือสาเหตุที่ทำให้โหนดใน LangGraph ที่เขียน `steps = state[\"step_count\"] + 1` แล้ว `return {\"tool_output\": res}` เกิดอาการ Infinite Loop?",
        [
          ["เพราะ Python บวกเลขจำนวนเต็มไม่ได้", "Python บวกเลขได้ตามปกติ"],
          ["เพราะใน LangGraph ค่าใน State จะอัปเดตก็ต่อเมื่อโหนดส่งคีย์นั้นกลับมาใน dict ที่ `return` การไม่ส่ง `\"step_count\": steps` กลับไปทำให้ `state[\"step_count\"]` มีค่าเป็น 0 ตลอดกาล", "ถูกต้อง — ตัวแปรโลคอล `steps` หายไปทันทีที่จบฟังก์ชันหากไม่ส่งกลับใน dict"],
          ["เพราะชื่อตัวแปร `steps` สั้นเกินไป", "ชื่อตัวแปรไม่มีผล"],
          ["เพราะไม่ได้ติดตั้ง GPU", "ไม่เกี่ยวกับ GPU"],
        ],
        "B",
        "ใน LangGraph State Reducers จะทำงานเฉพาะกับคีย์ที่โหนด `return` กลับมาใน dict เท่านั้น",
        "ทำไมการลืมใส่ `'step_count'` ใน dict ที่โหนด `return` จึงทำให้เกิด Infinite Loop?",
        "เพราะค่า `step_count` ใน State จะไม่ถูกอัปเดตและค้างอยู่ที่ค่าเริ่มต้น ทำให้ไม่เคยถึงเพดาน `max_steps`",
      ),
      mc(
        "d120-q2",
        "เมื่อเครื่องมือภายนอกโยน Exception ภายในโหนดของกราฟ เหตุใดการเขียน `except Exception: return {}` จึงเป็น Anti-pattern ที่อันตราย?",
        [
          ["เพราะมันกลืนข้อผิดพลาดทิ้งโดยไม่อัปเดตทั้ง `step_count` และ `tool_error` ทำให้ Conditional Router ไม่รู้ว่าเครื่องมือล้มเหลวและส่งกลับไปวนเรียกซ้ำไม่รู้จบ", "ถูกต้อง — ต้องอัปเดต `step_count` และบันทึก `tool_error` เพื่อให้ Router เลี้ยวเข้า Fallback ทันที"],
          ["เพราะทำให้ไฟล์โค้ดมีขนาดใหญ่ขึ้น", "ไม่เกี่ยวกับขนาดไฟล์"],
          ["เพราะ Python ห้ามใช้ `try/except` ในฟังก์ชัน", "ใช้ได้ตามปกติ"],
          ["เพราะทำให้ฐานข้อมูลถูกลบ", "ไม่ได้ลบฐานข้อมูล"],
        ],
        "A",
        "การซ่อนความล้มเหลวจาก State ทำให้ Router ตัดสินใจบนข้อมูลที่ผิดพลาด ต้องส่ง `tool_error` เข้า State เสมอ",
        "ทำไมห้ามเขียน `except Exception: return {}` ในโหนดเรียก Tool ของ LangGraph?",
        "เพราะ Router จะไม่เห็นว่าเกิดข้อผิดพลาดและ `step_count` ไม่เพิ่มขึ้น จนเกิดลูปเรียก Tool ที่พังซ้ำไม่รู้จบ",
      ),
      mc(
        "d120-q3",
        "ตามนโยบาย 'คืนเงินอัตโนมัติได้ไม่เกิน 1,000 บาท ถ้ายอดเกิน 1,000 บาทต้องหยุดรอผู้ดูแลอนุมัติ' หากลูกค้าขอคืนเงินยอด `1,000` บาทพอดี และอีกรายขอคืนยอด `1,001` บาท ผลลัพธ์ที่ถูกต้องคือข้อใด?",
        [
          ["ทั้งสองรายการต้องหยุดรอผู้ดูแลอนุมัติ", "ผิด — ยอด 1,000 บาทอยู่ในเกณฑ์ 'ไม่เกิน 1,000 บาท' (`<= 1000`)"],
          ["ทั้งสองรายการโอนเงินอัตโนมัติทันที", "ผิด — ยอด 1,001 บาทเกินเพดาน 1,000 บาท"],
          ["ยอด 1,000 บาทโอนคืนอัตโนมัติทันที (`refunded_auto`) ส่วนยอด 1,001 บาทหยุดพักใน Checkpointer ที่สถานะ `awaiting_approval` โดยยังไม่โอนเงิน", "ถูกต้อง — นี่คือเหตุผลที่ต้องทดสอบ Boundary Values ที่เลข 1000 และ 1001 เสมอ"],
          ["ระบบปฏิเสธทั้งสองรายการทันที", "ไม่ตรงตามนโยบาย"],
        ],
        "C",
        "การทดสอบค่าขอบเขต (`1000` vs `1001`) ช่วยยืนยันว่าเงื่อนไข `amount_thb <= 1000` vs `amount_thb > 1000` ทำงานตรงตามสเปกธุรกิจ",
        "ที่เพดานคืนเงินอัตโนมัติไม่เกิน 1,000 บาท ยอด 1,000 บาท กับ 1,001 บาท เดินไปเส้นทางใด?",
        "1,000 บาท (`<= 1000`) คืนเงินอัตโนมัติทันที ส่วน 1,001 บาท (`> 1000`) หยุดพักที่ `awaiting_approval` รอคนอนุมัติ",
      ),
      mc(
        "d120-q4",
        "เมื่อนำความรู้ตลอด Block B30 (D117–D120) มารวมกัน เกราะป้องกันใดทำงานเป็นลำดับแรกสุดก่อนที่โหนดเรียกเครื่องมือจะยิงคำสั่งออกไป?",
        [
          ["รันเครื่องมือให้เสร็จก่อนแล้วค่อยตรวจทุกอย่างทีหลัง", "ผิด — นั่นคือ Post-execution ซึ่งกัน side effect ไม่ทัน"],
          ["ตรวจเพดานก้าว (`step_count >= max_steps`) และตรวจลายเซ็นคำสั่งซ้ำ (`sig in seen_signatures`) ก่อนรันเครื่องมือจริงเสมอ", "ถูกต้อง — Pre-execution guardrails ป้องกันไม่ให้เกิดการยิง API เกินงบหรือยิงคำสั่งเดิมซ้ำ"],
          ["รอให้ผู้ใช้ปิดเบราว์เซอร์ก่อน", "ไม่เกี่ยวข้อง"],
          ["ลบ Checkpointer ทิ้งทุกครั้ง", "Checkpointer ต้องเก็บไว้สำหรับ HITL"],
        ],
        "B",
        "Pre-execution check (`max_steps`, `seen_signatures`, `max_tool_calls`) คือหัวใจของ Guarded Agent Execution",
        "ด่านใดต้องทำงานก่อนบรรทัดเรียก `tool_fn` เสมอ?",
        "ด่านตรวจ `step_count >= max_steps` และ `sig in seen_signatures` (Pre-execution guardrails)",
      ),
    ],
  },

  takeaways: [
    "**3 ต้นตอของ Infinite Agent Loop** คือลืมคืน `step_count + 1` เข้า State, กลืน `tool_error` ทิ้งใน `except` และไม่ตรวจ `seen_signatures` ก่อนเรียกเครื่องมือ",
    "**Policy-Based HITL Gate** (`amount_thb <= 1000` อัตโนมัติ vs `> 1000` หยุดรออนุมัติ) ช่วยสร้างสมดุลระหว่างความเร็วในการบริการลูกค้ากับความปลอดภัยทางการเงิน",
    "**Boundary Testing (`1000` vs `1001`)** ใน `pytest` คือวิธีที่แม่นยำที่สุดในการยืนยันกฎทางธุรกิจของ State Machine",
    "จบ Block B30 แล้ว! พรุ่งนี้ (Day 121 — Block B31) เราจะเข้าสู่ **Phase 4 Mini-Project & Checkpoint** เพื่อเชื่อม Thai Hybrid RAG + MCP Lookup + Guarded LangGraph เข้าเป็นระบบเดียวกัน!",
  ],

  reviewCards: [
    rc(
      "d120-rc1",
      "3 บั๊กคลาสสิกที่ทำให้กราฟ LangGraph วนลูปไม่รู้จบมีอะไรบ้าง?",
      "1) โหนดไม่ส่ง `step_count + 1` กลับใน dict ที่ `return`, 2) กลืน exception ใน `except` โดยไม่บันทึก `tool_error` ลง State, 3) ไม่มี `seen_signatures` ดักการเรียก `(tool_name, args_hash)` ซ้ำ",
    ),
    rc(
      "d120-rc2",
      "ทำไมจึงต้องทดสอบทั้งยอด `1000` บาท และ `1001` บาท สำหรับกฎ 'คืนเงินเกิน 1,000 บาทต้องรออนุมัติ'?",
      "เพื่อตรวจ Boundary Value ป้องกันบั๊ก `off-by-one` (`>=` สลับกับ `>`) โดย 1,000 บาทต้องโอนอัตโนมัติ และ 1,001 บาทต้องหยุดที่ `awaiting_approval`",
    ),
    rc(
      "d120-rc3",
      "เมื่อ `tool_fn` โยน Exception โหนดที่ปลอดภัยควรอัปเดตฟิลด์ใดใน State บ้าง?",
      "ต้องอัปเดตทั้ง `step_count` (`+1`), `tool_error` (`str(exc)`) และเปลี่ยน `status` เป็น `tool_error_fallback` เพื่อให้กราฟหยุดอย่างปลอดภัย",
    ),
    rc(
      "d120-rc4",
      "ตลอด Block B24–B30 เราได้สร้างชิ้นส่วนหลักอะไรบ้างที่พร้อมจะนำไปประกอบใน Block B31 Mini-Project?",
      "1) Thai Hybrid RAG + RRF + Reranker + ACL + Citations (B24–B27), 2) Strict Safe Tools & Workflows (B28), 3) FastMCP Server/Client (B29) และ 4) Guarded LangGraph + HITL Checkpoints (B30)",
    ),
  ],

  sources: [
    {
      label: "LangGraph Documentation — Debugging Graphs, State Reducers & Interrupts",
      href: "https://docs.langchain.com/oss/python/langgraph/graph-api",
    },
    {
      label: "LangGraph Documentation — Persistence & Human-in-the-Loop",
      href: "https://docs.langchain.com/oss/python/langgraph/persistence",
    },
    {
      label: "pytest Documentation — Boundary Value Assertions",
      href: "https://docs.pytest.org/en/stable/",
    },
  ],

  glossary: ["langgraph", "guardrails", "checkpointer", "hitl", "tool-calling", "pytest"],
});
