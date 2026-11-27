import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D117 — Phase 4 / Block B30
 * Controlled Agent Loops with LangGraph (State, Nodes, Edges)
 */
export const d117: Lesson = defineLesson({
  day: 117,
  titleTh: "ควบคุมลูปเอเจนต์ด้วย LangGraph: State, Nodes, Conditional Edges และ Step Budget",
  tagline: "30 นาที · รันกราฟจำลองบนเครื่องได้ 100% · เปลี่ยนเอเจนต์ที่เดาทางยากให้เป็น State Machine ที่หยุดได้แน่นอน",
  icon: "workflow",
  visual: {
    id: "langgraph-loop",
    title: "Controlled Agent Graph — State, Nodes, Conditional Edges & Max Steps",
    caption: "กดจำลองเส้นทางคำถามเพื่อดูการเลือกโหนด RAG / Tool และการตัดลูปเมื่อครบ step budget",
    alt: "แผนภาพกราฟสถานะ LangGraph แสดงการ routed และการจำกัดจำนวนรอบ",
  },
  requiresApiKey: true,
  apiKeyNote: "รันกราฟจำลองบนเครื่องได้ 100% ด้วย mock node หรือต่อ LLM API จริงได้",
  tools: ["LangGraph", "TypedDict", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "เลือก Agent Loop เฉพาะงานที่ต้องการหลายก้าว",
      body: "ถ้าคำถามจบได้ใน 1 ขั้นตอนให้ใช้ workflow ธรรมดา แต่เมื่อระบบต้องสลับไปมาระหว่างค้นเอกสาร, เรียก tool, ลองใหม่ หรือขออนุมัติ เราต้องมีโครงสร้างคุมลูปที่ชัดเจน",
      lessonNote: "วันนี้เราใช้ {{langgraph}} วางผังการทำงานแบบกราฟสถานะ แทนการปล่อยให้ `while True` ของเอเจนต์วิ่งอิสระ",
    },
    {
      node: 2,
      heading: "จำกัดบทบาทของ LLM ไว้ในโหนดที่กำหนด",
      body: "แทนที่จะปล่อยให้ {{llm}} ตัดสินใจทุกอย่างแบบไม่มีกรอบ เราแยกโหนดให้ชัดว่าจุดไหนใช้โมเดลเลือกเส้นทาง และจุดไหนใช้โค้ดแบบ deterministic ตรวจสอบ",
      lessonNote: "โค้ดของวันนี้รันด้วย mock node เพื่อพิสูจน์ผังกราฟได้ 100% ก่อนเสียเงินต่อ LLM API จริง",
    },
    {
      node: 4,
      heading: "State, Nodes, Conditional Edges และ Step Budget",
      body: "กราฟสถานะส่งต่อ `AgentState` ผ่านแต่ละโหนด และตัดสินใจเลือกทางแยกด้วย Conditional Edge พร้อมเพดานจำนวนรอบ (`max_steps` และ `recursion_limit`)",
      lessonNote: "คุณจะได้สร้างทั้งเส้นทาง {{rag}}, เส้นทาง {{tool-calling}}, ด่าน {{hitl}} และเส้นทาง fallback เมื่อครบงบรอบ",
    },
    {
      node: 5,
      heading: "Trace ทุกก้าวที่กราฟเดินและจับลูปที่ผิดปกติ",
      body: "เมื่อทุกโหนดบันทึกชื่อตัวเองและจำนวนก้าวลงใน State เราเห็นย้อนหลังได้ทันทีว่าคำขอใดชน budget หรือวนเรียก tool เดิมซ้ำ",
      lessonNote: "ฟิลด์ `trace` และ `status` ใน State วันนี้จะต่อยอดสู่ Guarded Execution (Day 118) และ Langfuse Tracing (Day 134)",
    },
  ],

  objectives: [
    "**ออกแบบ State** ของเอเจนต์ด้วย `TypedDict` (พร้อม `Annotated` reducer) เพื่อเก็บเส้นทาง, จำนวนรอบ และสถานะการทำงานอย่างมีชนิดข้อมูลชัดเจน",
    "**ประกอบกราฟ** ด้วย `StateGraph` ของ {{langgraph}} โดยแยก **Nodes** (ฟังก์ชันทำงาน), **Normal Edges** (ทางตรง) และ **Conditional Edges** (ทางแยกตามเงื่อนไข)",
    "**ป้องกันลูปไม่รู้จบ** ด้วยการผสาน `max_steps` ระดับแอป (graceful fallback) เข้ากับ `recursion_limit` ของ LangGraph และจุดพัก {{hitl}} สำหรับคำสั่งที่มีความเสี่ยง",
  ],

  prerequisites: [
    "เข้าใจ {{tool-calling}} และรูปแบบ Workflow (Routing, Chaining — แนะนำ Day 109–111)",
    "เข้าใจแนวคิด Least-Privilege และ {{hitl}} (แนะนำ Day 113)",
    "คุ้นเคยกับ Python type hints (`TypedDict`, `Literal`, `Annotated`)",
    "ไม่ต้องมี API key เพื่อทำแล็บวันนี้ (ใช้ mock node ได้ 100%)",
  ],

  setup: {
    intro:
      "ติดตั้ง `langgraph` และ `pytest` ด้วย `uv` — โค้ดทั้งหมดในวันนี้สามารถรันแบบออฟไลน์ได้ทันทีโดยใช้โหนดจำลอง (และเสียบ SDK ของ OpenAI/Anthropic เข้าแทนที่โหนดเดียวได้เมื่อต้องการ)",
    commands: `uv init ai-day117 && cd ai-day117
uv add langgraph pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day117` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `langgraph`, `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รัน `uv run python -c \"from langgraph.graph import StateGraph; print('ok')\"` แล้วเห็น `ok`"],
    ],
    note: "การทดสอบโครงสร้างกราฟด้วย mock node ก่อนต่อ LLM จริงคือแนวปฏิบัติที่ดีที่สุด — ช่วยให้เทสต์รันจบในระดับมิลลิวินาทีและไม่เสียค่า token ระหว่างแก้บั๊กลูป",
  },

  concepts: [
    {
      id: "langgraph-state",
      title: "1 · State: แหล่งความจริงเดียวของกราฟ (`TypedDict` & Reducers)",
      paragraphs: [
        "ความผิดพลาดอันดับต้น ๆ ของการเขียนเอเจนต์เองด้วย `while True` คือข้อมูลกระจายอยู่ตามตัวแปรชั่วคราวหลายจุดจนไล่ไม่ถูกว่าเมื่อก้าวที่ 3 เกิดอะไรขึ้น {{langgraph}} บังคับให้ทุกอย่างไหลผ่าน **State** โครงสร้างเดียว (นิยมประกาศด้วย `TypedDict` หรือ {{pydantic}} {{schema}})",
        "ทุกโหนดรับ `state` ปัจจุบันเข้าไป แล้วคืนค่าเป็น **partial dict** เฉพาะฟิลด์ที่ต้องการอัปเดต (เช่น `{\"steps\": state[\"steps\"] + 1, \"answer\": \"...\"}`) LangGraph จะ merge กลับเข้า State ให้อัตโนมัติ",
        "สำหรับฟิลด์แบบลิสต์ที่อยากให้ **ต่อท้ายสะสมไปเรื่อย ๆ** เช่น `trace` หรือประวัติข้อความ เราใช้ **Reducer** ด้วย `Annotated[list[str], operator.add]` เพื่อไม่ให้โหนดถัดไปเผลอเขียนทับประวัติของโหนดก่อนหน้า",
      ],
      analogy:
        "State เหมือน 'แฟ้มคนไข้ประจำตัว' ที่ส่งต่อจากแผนกคัดกรองไปห้องตรวจและห้องยา ทุกแผนกอ่านประวัติเดิมได้และจดบันทึกเพิ่มลงแฟ้มเดียวกันโดยไม่ฉีกหน้าเก่าทิ้ง",
      code: {
        language: "python",
        filename: "agent_state.py",
        code: `import operator
from typing import Annotated, Literal, TypedDict


class SupportAgentState(TypedDict):
    query: str
    route: Literal["rag", "order_tool", "approval", "unknown"]
    steps: int
    max_steps: int
    trace: Annotated[list[str], operator.add]
    answer: str
    status: Literal["running", "completed", "awaiting_approval", "budget_exceeded"]`,
        caption: "`Annotated[list[str], operator.add]` ทำให้เมื่อโหนดคืน `{\"trace\": [\"rag_node\"]}` ระบบจะต่อท้ายลิสต์เดิมให้อัตโนมัติ",
      },
      whyTitle: "Why this matters — ตรวจสอบย้อนหลังและทำ Checkpoint ได้ง่าย",
      whyParagraphs: [
        "เมื่อสถานะทั้งหมดอยู่ใน State ที่ serialize ได้ การบันทึก snapshot เพื่อหยุดรอคนอนุมัติแล้วกลับมาทำงานต่อ (Day 119) หรือการทำ unit test เฉพาะโหนดจะกลายเป็นเรื่องตรงไปตรงมา",
        "แค่ส่ง dict จำลองเข้าฟังก์ชันโหนดเดียว คุณก็ตรวจพฤติกรรมได้ทันทีโดยไม่ต้องรันทั้งระบบ",
      ],
    },
    {
      id: "nodes-and-edges",
      title: "2 · Nodes & Conditional Edges: แยก 'การทำงาน' ออกจาก 'การตัดสินใจเลือกทาง'",
      paragraphs: [
        "ใน {{langgraph}} เราแยกองค์ประกอบของผังงานออกเป็นสองส่วนชัดเจน: **Nodes** คือฟังก์ชัน Python ที่ทำงานเฉพาะอย่าง (เช่น `router_node` วิเคราะห์เจตนา, `rag_node` ค้นเอกสาร, `order_tool_node` เรียกเครื่องมือเช็กออเดอร์) และ **Edges** คือเส้นทางที่กำหนดว่าหลังจบโหนดนี้ต้องไปโหนดไหนต่อ",
        "**Normal Edge** (`add_edge(\"rag_node\", \"synthesize_node\")`) ใช้กับเส้นทางที่ตายตัวเสมอ ส่วน **Conditional Edge** (`add_conditional_edges(\"router_node\", choose_next_node, {...})`) คือฟังก์ชัน routing ที่อ่าน `state` แล้วคืนชื่อเส้นทางถัดไป เช่น `\"rag\"`, `\"order_tool\"`, `\"fallback\"` หรือ `END`",
        "การแยกโหนดกับเส้นทางแบบนี้ช่วยให้ผังควบคุมอ่านออกได้จากโค้ดเพียงไม่กี่บรรทัด และสามารถวาดเป็นไดอะแกรมตรวจทานกับทีมได้ก่อนขึ้น Production",
      ],
      analogy:
        "Nodes คือสถานีรถไฟที่ทำงานเฉพาะจุด ส่วน Conditional Edges คือประแจสับรางที่ดูป้ายปลายทางบนขบวน (State) แล้วสับรางให้รถวิ่งไปถูกชานชาลา",
      bullets: [
        "**`START` และ `END`**: จุดเข้าและจุดออกมาตรฐานของ `StateGraph`",
        "**โหนดควรเล็กและมีหน้าที่เดียว**: โหนดดึงข้อมูลไม่ควรผสมโค้ดตัดสินใจหยุดลูปไว้ข้างในอย่างคลุมเครือ",
        "**ฟังก์ชัน routing ควรเป็น Pure Function**: อ่านจาก `state` เท่านั้น ห้ามเรียก API หรือแก้ค่าใน `state` ระหว่างเลือกทาง",
      ],
      whyTitle: "Why this matters — แก้บั๊กและสลับโมเดลได้ทีละโหนด",
      whyParagraphs: [
        "เมื่อระบบตอบช้าหรือเลือกเครื่องมือผิด คุณรู้ทันทีว่าต้องแก้ที่ `router_node`, `rag_node` หรือ `order_tool_node` ไม่ต้องงมใน prompt ยาวเหยียดก้อนเดียว",
        "คุณยังสามารถใช้โมเดลเล็กเร็วสำหรับ `router_node` และใช้โมเดลหลักสำหรับ `synthesize_node` ได้ในกราฟเดียวกัน",
      ],
    },
    {
      id: "step-budget-and-hitl",
      title: "3 · Step Budget, `recursion_limit` และจุดพัก Human-in-the-Loop",
      paragraphs: [
        "อันตรายใหญ่ที่สุดของเอเจนต์ที่มีลูป (เช่น เรียก tool ไม่สำเร็จแล้ววนกลับมาลองใหม่) คือ **Infinite Loop** ที่เผาค่า API และค้างหน้าจอผู้ใช้ เราจึงต้องมีรั้วป้องกัน **สองชั้น** เสมอ:",
        "**ชั้นที่ 1 — Application-level `max_steps`**: เก็บตัวนับ `steps` ใน State และให้ Conditional Edge ตรวจ `if state[\"steps\"] >= state[\"max_steps\"]` เพื่อเบี่ยงไปที่ `budget_fallback_node` แล้วส่งคำตอบสุภาพให้ผู้ใช้ (เช่น *\"ระบบตรวจสอบไม่สำเร็จภายในจำนวนรอบที่กำหนด กรุณาติดต่อเจ้าหน้าที่\"*) อย่างสง่างาม",
        "**ชั้นที่ 2 — Framework-level `recursion_limit`**: ส่ง `config={\"recursion_limit\": 10}` ตอนเรียก `app.invoke(...)` เป็นเบรกฉุกเฉิน ({{fail-fast}}) เผื่อโค้ดเงื่อนไขของเราเองมีบั๊กจนกราฟวิ่งเกินกำหนด และสำหรับคำสั่งที่มีผลกระทบสูง (เช่น คืนเงิน/ยกเลิกออเดอร์) ให้ route ไปยังโหนดพัก {{hitl}} (`status = \"awaiting_approval\"`) เพื่อหยุดรอคนยืนยันก่อนทำจริง",
      ],
      analogy:
        "`max_steps` เหมือนนาฬิกาจับเวลาที่เตือนเชฟให้เสิร์ฟจานสำรองอย่างสุภาพก่อนลูกค้าโมโห ส่วน `recursion_limit` คือเบรกเกอร์ตัดไฟอัตโนมัติกันไฟไหม้ครัวเมื่อทุกอย่างพลาดพร้อมกัน",
      bullets: [
        "**Graceful Degradation (`max_steps`)**: ผู้ใช้ยังได้ข้อความแจ้งสถานะและทางไปต่อ ไม่เจอหน้า error 500 เปล่า ๆ",
        "**Hard Safety Net (`recursion_limit`)**: ป้องกันบั๊กใน conditional edge ที่ลืมเพิ่ม `steps` ไม่ให้รันค้างไม่รู้จบ",
        "**Approval Checkpoint (`hitl`)**: แยกคำขอแบบอ่าน (รันอัตโนมัติได้) ออกจากคำขอแก้ไขข้อมูล (หยุดรอคนยืนยัน)",
      ],
      whyTitle: "Why this matters — Production Agent ต้อง 'หยุดเป็น'",
      whyParagraphs: [
        "ความแตกต่างระหว่างเดโมเอเจนต์ในวิดีโอกับระบบที่ใช้จริงในองค์กร ไม่ใช่ความฉลาดตอนทุกอย่างราบรื่น แต่คือพฤติกรรมตอน tool ล่ม, ข้อมูลไม่ครบ หรือโมเดลตัดสินใจวนซ้ำ",
        "กราฟที่มี `max_steps` + `recursion_limit` + `hitl` checkpoint ช่วยให้คุณรับประกันเพดานต้นทุนและเพดานเวลาตอบสนอง (latency budget) ต่อคำขอได้จริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — LangGraph คือ State Machine ของฝั่ง AI",
      body: [
        "ถ้าคุณเคยใช้ XState, Redux reducer หรือเขียน workflow state machine ใน Backend คุณมีโมเดลความคิดของ LangGraph ครบแล้ว:",
      ],
      table: [
        ["LangGraph State (TypedDict)", "Redux Store / XState Context"],
        ["Annotated[..., operator.add]", "Reducer function ที่ merge state ใหม่กับเดิม"],
        ["Node function", "State handler / async action"],
        ["Conditional Edge", "State transition guard (if/switch routing)"],
        ["max_steps + recursion_limit", "Circuit breaker / max-retry timeout guard"],
      ],
    },
    student: {
      title: "First-Year Note — กราฟ (Directed Graph) ที่เรียนใน CS ใช้จริงตรงนี้",
      body: [
        "ในวิชาโครงสร้างข้อมูลคุณอาจเคยเจอ **Directed Graph** ที่มีจุดยอด (Nodes) และเส้นเชื่อมมีทิศทาง (Edges) — `LangGraph` คือการนำกราฟแบบนั้นมาควบคุมลำดับการทำงานของโปรแกรม AI โดยตรง",
        "สังเกตว่าทุกฟังก์ชันโหนดรับ `state: dict` แล้วคืนเฉพาะ key ที่เปลี่ยน เช่น `return {\"steps\": state[\"steps\"] + 1}` แทนการแก้ dict ตัวเดิมตรง ๆ เพื่อลด side effect และทำให้ไล่ดูประวัติการเปลี่ยนค่าได้ง่าย",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: สร้างกราฟผู้ช่วยลูกค้าไทยด้วย `LangGraph` ที่แยกคำถามเป็น 2 ทางหลัก (เอกสารนโยบาย → RAG, เลขออเดอร์ `#INV-` → Order Tool) และจำลองกรณีที่ Tool ชั่วคราวล้มเหลวจนชน `max_steps` เพื่อดูการทำงานของเส้นทาง Fallback",
    steps: [
      {
        title: "1 · ประกาศ State และฟังก์ชันโหนดหลัก",
        explain:
          "กำหนด `SupportState` พร้อมตัวนับ `steps`, เพดาน `max_steps` และตัวสะสม `trace` จากนั้นเขียนโหนด `router`, `rag`, `order_tool` และ `budget_fallback`",
        code: {
          language: "python",
          filename: "worked_langgraph.py",
          code: `import operator
from typing import Annotated, Literal, TypedDict
from langgraph.graph import END, START, StateGraph


class SupportState(TypedDict):
    query: str
    route: Literal["rag", "order_tool"]
    steps: int
    max_steps: int
    simulate_flaky_tool: bool
    trace: Annotated[list[str], operator.add]
    answer: str
    status: Literal["running", "completed", "budget_exceeded"]


def router_node(state: SupportState) -> dict:
    route = "order_tool" if "#INV-" in state["query"] else "rag"
    return {"route": route, "trace": ["router"]}


def rag_node(state: SupportState) -> dict:
    return {
        "steps": state["steps"] + 1,
        "trace": ["rag"],
        "answer": "นโยบายการคืนสินค้า: คืนได้ภายใน 7 วันพร้อมใบเสร็จ [policy#1]",
        "status": "completed",
    }


def order_tool_node(state: SupportState) -> dict:
    next_step = state["steps"] + 1
    if state["simulate_flaky_tool"]:
        return {"steps": next_step, "trace": ["order_tool(retry)"]}
    return {
        "steps": next_step,
        "trace": ["order_tool"],
        "answer": "ออเดอร์ #INV-2026-009 สถานะ: รอชำระเงิน (1,490 บาท)",
        "status": "completed",
    }


def budget_fallback_node(state: SupportState) -> dict:
    return {
        "trace": ["budget_fallback"],
        "answer": "ระบบตรวจสอบสถานะไม่สำเร็จภายในจำนวนรอบที่กำหนด กรุณาติดต่อเจ้าหน้าที่ครับ",
        "status": "budget_exceeded",
    }`,
        },
        output: `# นิยาม State และ 4 โหนดเรียบร้อย (พร้อมต่อสาย Edge ในขั้นถัดไป)`,
      },
      {
        title: "2 · ต่อสาย Edges และ Conditional Edges ที่คุม `max_steps`",
        explain:
          "หลัง `order_tool` ฟังก์ชัน `after_tool` จะเช็กก่อนว่าเสร็จแล้วหรือยัง ถ้ายังไม่เสร็จจะตรวจ `steps >= max_steps` เพื่อตัดเข้า `budget_fallback` แทนการวนซ้ำไม่รู้จบ",
        code: {
          language: "python",
          filename: "worked_langgraph.py",
          code: `def route_from_router(state: SupportState) -> str:
    return state["route"]


def after_tool(state: SupportState) -> str:
    if state["status"] == "completed":
        return "done"
    if state["steps"] >= state["max_steps"]:
        return "budget_exceeded"
    return "retry"


builder = StateGraph(SupportState)
builder.add_node("router", router_node)
builder.add_node("rag", rag_node)
builder.add_node("order_tool", order_tool_node)
builder.add_node("budget_fallback", budget_fallback_node)

builder.add_edge(START, "router")
builder.add_conditional_edges("router", route_from_router, {"rag": "rag", "order_tool": "order_tool"})
builder.add_edge("rag", END)
builder.add_conditional_edges(
    "order_tool",
    after_tool,
    {"done": END, "retry": "order_tool", "budget_exceeded": "budget_fallback"},
)
builder.add_edge("budget_fallback", END)

app = builder.compile()
print("Graph compiled successfully")`,
        },
        output: `Graph compiled successfully`,
      },
      {
        title: "3 · รันทดสอบ 3 เส้นทาง (RAG, Tool สำเร็จ, และ Tool ล่มจนชน Step Budget)",
        explain:
          "ส่ง `config={\"recursion_limit\": 10}` ทุกครั้งที่ invoke และสังเกต `trace` กับ `status` ของแต่ละเคส",
        code: {
          language: "python",
          filename: "worked_langgraph.py",
          code: `cases = [
    ("ขอทราบนโยบายคืนสินค้าครับ", False),
    ("ขอเช็ก status order #INV-2026-009", False),
    ("ขอเช็ก status order #INV-2026-009", True),
]

for query, flaky in cases:
    out = app.invoke(
        {
            "query": query,
            "route": "rag",
            "steps": 0,
            "max_steps": 3,
            "simulate_flaky_tool": flaky,
            "trace": [],
            "answer": "",
            "status": "running",
        },
        config={"recursion_limit": 10},
    )
    print(f"status={out['status']:<15} steps={out['steps']} trace={out['trace']}")`,
        },
        output: `status=completed       steps=1 trace=['router', 'rag']
status=completed       steps=1 trace=['router', 'order_tool']
status=budget_exceeded steps=3 trace=['router', 'order_tool(retry)', 'order_tool(retry)', 'order_tool(retry)', 'budget_fallback']`,
      },
    ],
    gotcha:
      "จุดสังเกต: ถ้าใน `order_tool_node` คุณลืมบวก `steps` (`state[\"steps\"] + 1`) ลูปจะไม่มีวันชน `max_steps` เลย แต่ `config={\"recursion_limit\": 10}` จะช่วยตัดวงจรและโยน `GraphRecursionError` ขึ้นมาแทนที่จะค้างตลอดกาล",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างฟังก์ชัน `build_support_graph()` ด้วย `LangGraph` ที่รองรับ 3 เส้นทาง ได้แก่ ค้น FAQ (`faq_rag`), เช็กออเดอร์ (`order_lookup` พร้อม retry ภายใต้ `max_steps`) และด่านขออนุมัติคืนเงิน (`refund_gate` แบบ HITL)",
    requirements: [
      "กำหนด `AgentState(TypedDict)` มีฟิลด์: `query`, `route`, `steps`, `max_steps`, `fail_until_step` (จำลอง tool ล่มจนกว่าจะถึงรอบที่กำหนด), `needs_approval`, `trace` (ใช้ `Annotated[list[str], operator.add]`), `answer`, และ `status`",
      "`router_node`: ถ้า `query` มีคำว่า `\"คืนเงิน\"` หรือ `\"refund\"` (ไม่สนตัวพิมพ์ใหญ่-เล็ก) ให้ `route = \"refund_gate\"`; ถ้ามี `\"#INV-\"` ให้ `route = \"order_lookup\"`; นอกนั้นให้ `route = \"faq_rag\"` พร้อมบันทึก `\"router\"` ลง `trace`",
      "`refund_gate_node`: ไม่รันการคืนเงินอัตโนมัติ แต่ตั้ง `needs_approval = True`, `status = \"awaiting_approval\"`, ระบุข้อความขออนุมัติใน `answer` แล้วจบกราฟ (`END`)",
      "`order_lookup_node`: เพิ่ม `steps` ทีละ 1; ถ้า `next_step <= state[\"fail_until_step\"]` ให้ถือว่า tool ล้มเหลวชั่วคราว (`status = \"running\"`) และให้ conditional edge วนลองใหม่ได้ตราบใดที่ `steps < max_steps` แต่ถ้า `steps >= max_steps` ให้ส่งไป `fallback_node` (`status = \"budget_exceeded\"`)",
      "สร้างฟังก์ชันช่วย `run_support_agent(query: str, *, max_steps: int = 3, fail_until_step: int = 0) -> AgentState` ที่เรียก `graph.invoke(..., config={\"recursion_limit\": 15})`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day117.py",
      code: `from __future__ import annotations
import operator
from typing import Annotated, Literal, TypedDict
from langgraph.graph import END, START, StateGraph


class AgentState(TypedDict):
    query: str
    route: Literal["faq_rag", "order_lookup", "refund_gate"]
    steps: int
    max_steps: int
    fail_until_step: int
    needs_approval: bool
    trace: Annotated[list[str], operator.add]
    answer: str
    status: Literal["running", "completed", "awaiting_approval", "budget_exceeded"]


def build_support_graph():
    """สร้างและ compile LangGraph สำหรับผู้ช่วยลูกค้าพร้อม step budget และ HITL gate"""
    # TODO: เขียนโหนด router, faq_rag, order_lookup, refund_gate, fallback
    # TODO: ต่อสาย START, Conditional Edges และ END แล้วคืน builder.compile()
    raise NotImplementedError


def run_support_agent(
    query: str,
    *,
    max_steps: int = 3,
    fail_until_step: int = 0,
) -> AgentState:
    # TODO: invoke กราฟพร้อม initial state และ config={"recursion_limit": 15}
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day117.py",
      code: `from exercise_day117 import run_support_agent


def test_faq_route_completes_in_one_step():
    res = run_support_agent("เวลาจัดส่งสินค้ากี่วันครับ")
    assert res["status"] == "completed"
    assert res["route"] == "faq_rag"
    assert res["steps"] == 1
    assert res["needs_approval"] is False
    assert res["trace"] == ["router", "faq_rag"]


def test_order_lookup_recovers_after_one_transient_failure():
    res = run_support_agent("เช็ก status #INV-2026-009", max_steps=3, fail_until_step=1)
    assert res["status"] == "completed"
    assert res["steps"] == 2
    assert res["trace"] == ["router", "order_lookup", "order_lookup"]


def test_order_lookup_hits_step_budget_gracefully():
    res = run_support_agent("เช็ก status #INV-2026-009", max_steps=2, fail_until_step=5)
    assert res["status"] == "budget_exceeded"
    assert res["steps"] == 2
    assert res["trace"][-1] == "fallback"


def test_refund_query_pauses_at_hitl_gate():
    res = run_support_agent("ช่วยทำเรื่องคืนเงินให้ #INV-2026-009 หน่อย")
    assert res["route"] == "refund_gate"
    assert res["status"] == "awaiting_approval"
    assert res["needs_approval"] is True
    assert res["trace"] == ["router", "refund_gate"]
`,
    },
    selfCheck: [
      "คำขอคืนเงินที่มี `#INV-` ปนอยู่ด้วยต้องถูกจัดเข้า `refund_gate` ก่อน (ตรวจคำว่า `คืนเงิน`/`refund` ก่อน `#INV-`)",
      "กรณี `fail_until_step=1, max_steps=3` โหนด `order_lookup` ลองใหม่ครั้งที่ 2 แล้วสำเร็จ (`steps == 2`)",
      "กรณี `fail_until_step=5, max_steps=2` กราฟตัดเข้า `fallback` และจบด้วย `status == \"budget_exceeded\"` ไม่ค้างลูป",
      "`trace` สะสมชื่อโหนดครบตามลำดับด้วย reducer `Annotated[list[str], operator.add]`",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์ และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ลำดับเงื่อนไขใน `router_node` สำคัญมาก: ข้อความ `\"ช่วยทำเรื่องคืนเงินให้ #INV-2026-009\"` มีทั้งคำว่า `คืนเงิน` และ `#INV-` จึงต้องเช็ก `\"คืนเงิน\" in q or \"refund\" in q` ก่อนเช็ก `\"#INV-\"`",
      },
      {
        body: "ใน `order_lookup_node` ให้คำนวณ `next_step = state[\"steps\"] + 1` แล้วถ้า `next_step <= state[\"fail_until_step\"]` ให้คืน `{\"steps\": next_step, \"trace\": [\"order_lookup\"], \"status\": \"running\"}` จากนั้นให้ conditional edge หลัง `order_lookup` เช็ก 3 กรณี: `completed` → `END`, `steps >= max_steps` → `\"fallback\"`, นอกนั้น → `\"order_lookup\"`",
      },
      {
        body: "โครงของโหนดและ Conditional Edge เกือบสมบูรณ์ — เหลือเติมการต่อ `add_conditional_edges` ของ `order_lookup` และฟังก์ชัน `run_support_agent`",
        code: {
          language: "python",
          filename: "hint_day117.py",
          code: `def router_node(state: AgentState) -> dict:
    q = state["query"].lower()
    if "คืนเงิน" in q or "refund" in q:
        route = "refund_gate"
    elif "#inv-" in q:
        route = "order_lookup"
    else:
        route = "faq_rag"
    return {"route": route, "trace": ["router"]}


def faq_rag_node(state: AgentState) -> dict:
    return {
        "steps": state["steps"] + 1,
        "trace": ["faq_rag"],
        "answer": "จัดส่งสินค้าภายใน 2-3 วันทำการครับ",
        "status": "completed",
    }


def refund_gate_node(state: AgentState) -> dict:
    return {
        "trace": ["refund_gate"],
        "needs_approval": True,
        "answer": "คำขอคืนเงินต้องรอการอนุมัติจากเจ้าหน้าที่ก่อนดำเนินการครับ",
        "status": "awaiting_approval",
    }


def order_lookup_node(state: AgentState) -> dict:
    next_step = state["steps"] + 1
    if next_step <= state["fail_until_step"]:
        return {"steps": next_step, "trace": ["order_lookup"], "status": "running"}
    return {
        "steps": next_step,
        "trace": ["order_lookup"],
        "answer": "พบข้อมูลคำสั่งซื้อเรียบร้อยครับ",
        "status": "completed",
    }


def fallback_node(state: AgentState) -> dict:
    return {
        "trace": ["fallback"],
        "answer": "ไม่สามารถดึงข้อมูลได้ภายในจำนวนรอบที่กำหนด กรุณาติดต่อเจ้าหน้าที่ครับ",
        "status": "budget_exceeded",
    }

# TODO: สร้าง StateGraph(AgentState), เพิ่มโหนด, ต่อ START -> router -> (3 ทาง),
#       ต่อ conditional edge หลัง order_lookup และเขียน run_support_agent(...)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "ลืมใส่ Reducer ให้ฟิลด์ลิสต์อย่าง `trace` หรือ `messages`",
      symptom: "หลังจบกราฟ `state[\"trace\"]` เหลือแค่ชื่อโหนดสุดท้ายโหนดเดียว ประวัติโหนดก่อนหน้าหายไปหมด",
      fix: "ประกาศฟิลด์ที่ต้องการสะสมค่าด้วย `Annotated[list[str], operator.add]` เพื่อให้ LangGraph ต่อท้ายลิสต์แทนการเขียนทับ",
    },
    {
      title: "พึ่ง `recursion_limit` อย่างเดียวโดยไม่มี `max_steps` + Fallback Node",
      symptom: "เมื่อ tool ล่มครบจำนวนรอบ แอปโยน `GraphRecursionError` ระเบิดเป็น HTTP 500 ให้ผู้ใช้เห็นตรง ๆ",
      fix: "ใช้ `max_steps` ใน State เพื่อเบี่ยงเข้า `fallback_node` อย่างสุภาพ และเก็บ `recursion_limit` ไว้เป็นเบรกฉุกเฉินชั้นที่สอง",
    },
    {
      title: "ใส่ลำดับเงื่อนไข routing ผิดจนคำขอเสี่ยงหลุดข้ามด่านอนุมัติ",
      symptom: "คำถาม `\"ขอคืนเงินออเดอร์ #INV-2026-009\"` ดันวิ่งเข้า `order_lookup` แทน `refund_gate` เพราะเช็ก `#INV-` ก่อน",
      fix: "ตรวจเงื่อนไขความปลอดภัย / write intent (เช่น คืนเงิน, ลบ, ยกเลิก) เป็นลำดับแรกเสมอ และเขียน pytest ดักเคสผสม",
    },
    {
      title: "รัน LLM จริงตั้งแต่ตอนลองต่อผังกราฟ",
      symptom: "ดีบั๊ก conditional edge ผิด 1 บรรทัดแต่เสียเวลาและค่า API หลายสิบรอบโดยไม่จำเป็น",
      fix: "ทดสอบโครงสร้าง State, Edges และ step budget ด้วย mock node + `pytest` ให้ผ่าน 100% ก่อนค่อยสลับโหนดมาเรียก LLM จริง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d117-q1",
        "เหตุใดเราจึงประกาศฟิลด์ `trace: Annotated[list[str], operator.add]` ใน `AgentState` ของ LangGraph?",
        [
          ["เพื่อให้ Python รันฟังก์ชันโหนดแบบขนานได้เร็วขึ้น 2 เท่า", "Reducer ไม่ได้เกี่ยวกับความเร็ว CPU แต่เกี่ยวกับวิธีรวมค่าของ State"],
          [
            "เพื่อให้ค่าที่แต่ละโหนดคืนกลับมาถูก 'ต่อท้าย' ลิสต์เดิมแทนที่จะเขียนทับประวัติเก่าทิ้ง",
            "ถูก — ถ้าไม่ใส่ reducer การคืน `{\"trace\": [\"node_b\"]}` จะทับลิสต์เดิมจนหายหมด",
          ],
          ["เพื่อบังคับให้ลิสต์เก็บข้อมูลได้ไม่เกิน 10 ตัว", "หากต้องการจำกัดความยาวต้องเขียน custom reducer หรือเช็กในโค้ดเอง"],
          ["เพื่อแปลงลิสต์เป็น JSON ส่งเข้า LLM อัตโนมัติ", "การแปลงเป็น prompt เป็นหน้าที่ของโหนด ไม่ใช่หน้าที่ของ `operator.add`"],
        ],
        "B",
        "ใน LangGraph ฟิลด์ที่ไม่มี reducer จะถูกแทนที่ด้วยค่าล่าสุด (overwrite) ส่วน `Annotated[list[str], operator.add]` บอกให้รวมลิสต์เก่ากับใหม่เข้าด้วยกัน",
        "Annotated[list[str], operator.add] ใน LangGraph State ทำหน้าที่อะไร?",
        "เป็น reducer ที่สั่งให้ต่อท้าย (append) ค่าลิสต์ที่โหนดคืนกลับมากับลิสต์เดิมใน State แทนที่จะเขียนทับข้อมูลเก่า",
      ),
      mc(
        "d117-q2",
        "ความแตกต่างระหว่าง **Normal Edge (`add_edge`)** กับ **Conditional Edge (`add_conditional_edges`)** คืออะไร?",
        [
          ["Normal Edge ใช้กับ LLM เท่านั้น ส่วน Conditional Edge ใช้กับ SQL", "ไม่เกี่ยวกัน — ทั้งคู่ใช้เชื่อมโหนดชนิดใดก็ได้ในกราฟ"],
          ["Normal Edge วนลูปไม่ได้ แต่ Conditional Edge วนลูปได้เฉพาะ 1 ครั้ง", "Conditional Edge วนลูปได้กี่ครั้งก็ได้ภายใต้เงื่อนไขและ recursion_limit"],
          [
            "Normal Edge ส่งต่อไปโหนดถัดไปแบบตายตัวเสมอ ส่วน Conditional Edge เรียกฟังก์ชันอ่าน State เพื่อเลือกโหนดปลายทางแบบไดนามิก",
            "ถูก — ใช้ Normal Edge กับลำดับคงที่ และใช้ Conditional Edge กับจุดตัดสินใจ routing, retry หรือหยุดเมื่อครบ budget",
          ],
          ["Conditional Edge ใช้แทน StateGraph ได้โดยไม่ต้องสร้างโหนด", "Conditional Edge ต้องเชื่อมระหว่างโหนดที่เพิ่มไว้ใน StateGraph"],
        ],
        "C",
        "การแยกเส้นทางคงที่ (Normal Edge) กับทางแยกตามสถานะ (Conditional Edge) ทำให้ผังควบคุมของเอเจนต์อ่านง่ายและตรวจสอบได้",
        "ควรใช้ add_edge กับ add_conditional_edges ต่างกันอย่างไร?",
        "add_edge ใช้เมื่อเส้นทางถัดไปตายตัวเสมอ; add_conditional_edges ใช้เมื่อต้องอ่าน State เพื่อเลือกปลายทาง (เช่น route, retry หรือ fallback)",
      ),
      mc(
        "d117-q3",
        "ทำไมระบบ Production จึงควรมีทั้ง **`max_steps` ใน State** และ **`recursion_limit` ใน config** ควบคู่กัน?",
        [
          ["เพราะ LangGraph จะไม่ยอม compile ถ้าไม่ใส่ทั้งสองตัว", "LangGraph compile ได้โดยไม่มี `max_steps` แต่จะขาดทางลงแบบนุ่มนวล"],
          [
            "`max_steps` ช่วยเบี่ยงเข้า fallback node เพื่อตอบผู้ใช้อย่างสุภาพ ส่วน `recursion_limit` เป็นเบรกฉุกเฉินกันลูปค้างเมื่อโค้ดมีบั๊ก",
            "ถูก — เป็นการป้องกันสองชั้น: graceful degradation + hard fail-fast safety net",
          ],
          ["`max_steps` คุมเฉพาะ RAG ส่วน `recursion_limit` คุมเฉพาะ MCP", "ทั้งสองตัวคุมจำนวนก้าวของกราฟทั้งหมด ไม่ได้แยกตามเครื่องมือ"],
          ["เพื่อเพิ่มจำนวน token ที่ส่งให้ LLM ได้มากขึ้น", "ทั้งสองตัวมีไว้จำกัดรอบการทำงานเพื่อคุม latency และต้นทุน"],
        ],
        "B",
        "`max_steps` ให้ประสบการณ์ผู้ใช้ที่ดีเมื่อ tool ล้มเหลว ส่วน `recursion_limit` กันไม่ให้บั๊กลืมเพิ่มตัวนับทำให้ระบบวนลูปไม่รู้จบ",
        "บทบาทที่ต่างกันของ max_steps (ใน State) กับ recursion_limit (ใน config) คืออะไร?",
        "max_steps พาไป fallback node อย่างสุภาพเมื่อครบงบรอบ ส่วน recursion_limit เป็น hard safety net ที่โยน error ทันทีถ้ากราฟวนเกินกำหนด",
      ),
      mc(
        "d117-q4",
        "เมื่อผู้ใช้พิมพ์คำขอที่มีผลกระทบสูงอย่าง `\"ช่วยทำเรื่องคืนเงินออเดอร์ #INV-2026-009\"` โหนด `refund_gate` ควรทำอย่างไรตามหลัก Controlled Agent?",
        [
          ["สั่งโอนเงินคืนทันทีเพื่อลดเวลารอของลูกค้า", "อันตราย — write action ทางการเงินไม่ควรถูกรันอัตโนมัติโดยไม่มีด่านอนุมัติ"],
          ["โยน `RuntimeError` ให้แอปปิดตัวลง", "ไม่ควรทำให้แอปล่ม ควรตั้งสถานะและแจ้งผู้ใช้อย่างชัดเจน"],
          [
            "ตั้ง `needs_approval = True` และ `status = \"awaiting_approval\"` แล้วหยุดรอการยืนยันจากมนุษย์ (HITL) ก่อนดำเนินการจริง",
            "ถูก — แยกคำขอความเสี่ยงสูงมาหยุดที่จุด checkpoint เพื่อป้องกัน Excessive Agency",
          ],
          ["วนเรียก `order_lookup` ซ้ำ 10 รอบเพื่อความมั่นใจแล้วค่อยคืนเงิน", "การวนเช็กซ้ำไม่ได้ทดแทนการอนุมัติจากมนุษย์และยิ่งเปลือง latency"],
        ],
        "C",
        "Human-in-the-Loop (HITL) checkpoint ช่วยให้คำสั่งอ่านข้อมูลทำงานอัตโนมัติได้เร็ว ในขณะที่คำสั่งแก้ไขข้อมูลสำคัญยังอยู่ใต้การควบคุมของมนุษย์",
        "เมื่อกราฟเจอคำขอที่มีผลกระทบสูง (เช่น คืนเงิน) ควรจัดการอย่างไร?",
        "Route เข้า approval gate ที่ตั้ง needs_approval=True, status='awaiting_approval' และหยุดรอการยืนยันจากมนุษย์ (HITL) ก่อนรัน write action",
      ),
    ],
  },

  takeaways: [
    "**LangGraph State (`TypedDict`)** รวมข้อมูลทุกก้าวไว้ที่เดียว และใช้ `Annotated[list[str], operator.add]` เพื่อสะสมประวัติโดยไม่เขียนทับ",
    "แยก **Nodes** (ทำงานเฉพาะจุด) ออกจาก **Conditional Edges** (ฟังก์ชันอ่าน State เพื่อเลือกทาง) เพื่อให้ดีบั๊กและเทสต์ได้ง่าย",
    "คุมลูปเอเจนต์ด้วยรั้วสองชั้นเสมอ: **`max_steps`** (พาลง fallback อย่างสุภาพ) + **`recursion_limit`** (เบรกฉุกเฉินกันลูปค้าง)",
    "หยุดคำสั่งแก้ไขข้อมูลสำคัญไว้ที่ **HITL Approval Gate** และทดสอบผังกราฟทั้งหมดด้วย mock node + `pytest` ก่อนต่อ LLM API จริง",
  ],

  reviewCards: [
    rc(
      "d117-rc-1",
      "องค์ประกอบหลัก 3 อย่างของ StateGraph ใน LangGraph คืออะไร?",
      "1) State (TypedDict/Pydantic แหล่งความจริงเดียว + reducers), 2) Nodes (ฟังก์ชันทำงานคืน partial update), 3) Edges / Conditional Edges (กำหนดเส้นทางเดินและทางแยก)",
    ),
    rc(
      "d117-rc-2",
      "ทำไมต้องใช้ทั้ง `max_steps` ใน State และ `recursion_limit` ตอน invoke กราฟ?",
      "max_steps ใช้เบี่ยงเข้า fallback node ตอบผู้ใช้อย่างสุภาพเมื่อครบงบ ส่วน recursion_limit เป็น hard safety net กันบั๊กลูปไม่รู้จบ",
    ),
    rc(
      "d117-rc-3",
      "ทำไมควรเขียน unit test ให้กราฟ LangGraph ด้วย mock node ก่อนต่อ LLM API จริง?",
      "รันได้เร็วแบบ deterministic ไม่เสียค่า token และยืนยันได้ 100% ว่า routing, retry, step budget และ HITL gate ทำงานตรงตามออกแบบ",
    ),
  ],

  sources: [
    { label: "LangGraph Official Documentation — Overview & Core Concepts", href: "https://docs.langchain.com/oss/python/langgraph/overview" },
    { label: "LangGraph Graph API — State, Nodes, Edges & Recursion Limits", href: "https://docs.langchain.com/oss/python/langgraph/graph-api" },
    { label: "Anthropic — Building Effective Agents", href: "https://www.anthropic.com/research/building-effective-agents" },
    { label: "Pydantic v2 Documentation — Models & Validation", href: "https://docs.pydantic.dev/latest/" },
  ],

  glossary: ["langgraph", "hitl", "tool-calling", "rag", "schema", "pydantic", "fail-fast", "llm"],
});
