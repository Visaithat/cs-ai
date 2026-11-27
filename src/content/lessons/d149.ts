import type { Lesson, LessonVisualId } from "../types";
import { defineLesson, mc, rc } from "./builder";

const inventory = String.raw`from dataclasses import dataclass


@dataclass(frozen=True)
class Finding:
    risk: str
    surface: str
    boundary: str
    control: str
    owner: str
    evidence: str


FINDINGS = (
    Finding(
        "LLM01",
        "retrieval_context",
        "RAG chunk -> model context",
        "Quarantine flagged chunks and label the remaining text as evidence",
        "retrieval",
        "test_flagged_chunk_never_reaches_context",
    ),
    Finding(
        "LLM02",
        "model_context_and_traces",
        "tenant store -> authorized request -> telemetry",
        "Filter tenant before retrieval and minimize fields before tracing",
        "api",
        "test_other_tenant_absent_before_ranking",
    ),
    Finding(
        "LLM06",
        "agent_tool_dispatch",
        "LangGraph proposal -> MCP executor",
        "Check scope and require approval for writes in the executor",
        "tools",
        "test_write_stops_at_checkpoint",
    ),
)
`;

const retrieval = String.raw`@dataclass(frozen=True)
class Chunk:
    tenant: str
    ref: str
    text: str
    relevance: float
    flagged: bool = False


def context_for(tenant: str, chunks: list[Chunk]) -> list[Chunk]:
    if not tenant:
        raise ValueError("missing tenant")
    eligible = [
        chunk
        for chunk in chunks
        if chunk.tenant == tenant and not chunk.flagged
    ]
    return sorted(
        eligible, key=lambda chunk: chunk.relevance, reverse=True
    )[:2]


def audit_metadata(context: list[Chunk]) -> dict:
    return {"context_count": len(context)}


DOCS = [
    Chunk("north", "policy#1", "เปลี่ยนสินค้าได้ภายในเจ็ดวัน", 0.70),
    Chunk("south", "private#1", "FIXTURE_PRIVATE", 0.99),
    Chunk("north", "draft#1", "TEST_INSTRUCTION", 0.95, flagged=True),
]
`;

const dispatch = String.raw`TOOL_POLICY = {
    "lookup_order": ("orders:read", False),
    "add_note": ("orders:write", True),
}


def decision_for(tool: str, scopes: frozenset[str]) -> str:
    policy = TOOL_POLICY.get(tool)
    if policy is None:
        return "deny_unknown_tool"
    required_scope, is_write = policy
    if required_scope not in scopes:
        return "deny_scope"
    if is_write:
        return "pending_approval"
    return "allow_read"
`;

const projection = String.raw`def public_status(order: dict[str, str]) -> dict[str, str]:
    return {"reference": order["reference"], "status": order["status"]}


AUTHORIZED_ORDER = {
    "reference": "DEMO-17",
    "status": "กำลังจัดส่ง",
    "internal_note": "FIXTURE_PRIVATE",
}
`;

const demo = String.raw`if __name__ == "__main__":
    visible = context_for("north", DOCS)
    print("context:", [chunk.ref for chunk in visible])
    print("audit:", audit_metadata(visible))
    print("status fields:", sorted(public_status(AUTHORIZED_ORDER)))
    print("read:", decision_for("lookup_order", frozenset({"orders:read"})))
    print("write:", decision_for("add_note", frozenset({"orders:write"})))
`;

const tests = String.raw`import pytest


def test_findings_cover_project_boundaries():
    assert {row.risk for row in FINDINGS} == {"LLM01", "LLM02", "LLM06"}
    assert len({row.surface for row in FINDINGS}) == 3
    assert all(row.boundary and row.control and row.owner for row in FINDINGS)
    assert all(callable(globals().get(row.evidence)) for row in FINDINGS)


def test_flagged_chunk_never_reaches_context():
    visible = context_for("north", DOCS)
    assert "draft#1" not in {chunk.ref for chunk in visible}


def test_other_tenant_absent_before_ranking():
    visible = context_for("north", DOCS)
    assert [chunk.ref for chunk in visible] == ["policy#1"]
    assert audit_metadata(visible) == {"context_count": 1}


def test_top_two_selected_after_filtering():
    candidates = [
        *DOCS,
        Chunk("north", "policy#2", "หลักฐานการซื้อ", 0.80),
        Chunk("north", "policy#3", "ช่องทางติดต่อ", 0.60),
    ]
    visible = context_for("north", candidates)
    assert [chunk.ref for chunk in visible] == ["policy#2", "policy#1"]


def test_no_eligible_context_returns_empty():
    assert context_for("west", DOCS) == []
    assert audit_metadata([]) == {"context_count": 0}


def test_order_projection_keeps_only_public_fields():
    assert public_status(AUTHORIZED_ORDER) == {
        "reference": "DEMO-17",
        "status": "กำลังจัดส่ง",
    }


def test_empty_tenant_fails_closed():
    with pytest.raises(ValueError, match="missing tenant"):
        context_for("", DOCS)


@pytest.mark.parametrize(
    ("tool", "scopes", "expected"),
    [
        ("lookup_order", {"orders:read"}, "allow_read"),
        ("lookup_order", {"orders:write"}, "deny_scope"),
        ("add_note", {"orders:read"}, "deny_scope"),
        ("add_note", {"orders:write"}, "pending_approval"),
        ("unknown", {"orders:write"}, "deny_unknown_tool"),
    ],
)
def test_write_stops_at_checkpoint(tool, scopes, expected):
    assert decision_for(tool, frozenset(scopes)) == expected
`;

export const d149: Lesson = defineLesson({
  day: 149,
  titleTh: "เดินสำรวจ OWASP Top 10 บนระบบ Thai Knowledge RAG และ Agent",
  tagline: "30 นาที · ผูกความเสี่ยง LLM01, LLM02 และ LLM06 กับจุดควบคุมและหลักฐานทดสอบ",
  icon: "shield-alert",
  visual: {
    id: "owasp-llm-top10" as LessonVisualId,
    title: "OWASP Top 10 for LLM Applications 2025",
    caption: "ตามรอยข้อความจาก RAG ไปยังคำตอบและคำขอเรียก MCP Tool แล้วชี้จุดที่แอปต้องตรวจ",
    alt: "แผนภาพเชื่อม Prompt Injection กับเอกสาร RAG, Sensitive Information Disclosure กับบริบทและ log, Excessive Agency กับ LangGraph และ MCP",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้เอกสารสมมติและจำลองการตัดสินใจของ Tool บนเครื่อง",
  tools: ["OWASP Top 10 for LLM Applications 2025", "Python 3.12", "uv", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ตามแหล่งที่มาของข้อความ",
      body: "เอกสารคืนสินค้าไทยจาก Day 121 ผ่าน hybrid retrieval ส่วนสถานะออเดอร์มาจาก {{mcp}} ทั้งคู่มีข้อความที่ระบบอาจนำเข้า context",
      lessonNote: "จดว่าใครแก้ไขแหล่งนั้นได้ และใครมีสิทธิ์อ่านแต่ละชิ้น",
    },
    {
      node: 2,
      heading: "ให้โมเดลใช้หลักฐานตอบคำถาม",
      body: "{{prompt-injection}} เกิดเมื่อข้อความจากผู้ใช้หรือเอกสารบิดการทำงานของโมเดล เช่น ทำให้คำตอบเปลี่ยนบทบาทจากการสรุปเป็นการทำตามคำสั่งในเอกสาร",
      lessonNote: "กำหนดที่มาของ context และรักษาขอบเขตอำนาจไว้ในแอป",
    },
    {
      node: 4,
      heading: "คุมข้อมูลและผลข้างเคียงที่จุดใช้งาน",
      body: "Day 107 กำหนด {{acl}} ก่อนค้นหา และ Day 119 ใช้ {{hitl}} ก่อนเขียนข้อมูล ควบคุมทั้งสิ่งที่โมเดลเห็นและสิ่งที่เครื่องมือทำได้",
      lessonNote: "ตรวจผู้ใช้และสิทธิ์ที่ retriever กับ executor ทุกครั้ง",
    },
    {
      node: 5,
      heading: "บันทึกข้อมูลเท่าที่ใช้ตรวจสอบ",
      body: "Trace บอกได้ว่าด่านไหนทำงาน แต่การส่ง context ดิบเข้าระบบ trace เพิ่มอีกตำแหน่งที่ข้อมูลลูกค้าอาจถูกเปิดเผย",
      lessonNote: "บันทึก decision code จำนวนชิ้น และเวอร์ชันนโยบายสำหรับตรวจย้อนหลัง",
    },
  ],
  objectives: [
    "จำแนก LLM01, LLM02 และ LLM06 ด้วยตัวอย่างจาก RAG docs, MCP tools และ LangGraph",
    "ทำ inventory สามแถวที่ระบุ trust boundary, control, เจ้าของ และชื่อหลักฐานทดสอบ",
    "ยืนยันว่าเอกสารต่าง tenant ไม่เข้าบริบท และข้อเสนอเขียนจาก agent หยุดที่ checkpoint",
  ],
  prerequisites: [
    "Day 107–108 · tenant ACL ก่อน retrieval และการทดสอบข้าม tenant",
    "Day 115 และ Day 117–119 · ขอบเขต MCP client, step budget และ checkpoint",
    "Day 121–124 และ Day 146–148 · ระบบ Thai Knowledge RAG เดิมและงานลดต้นทุนก่อนเพิ่มด่านควบคุม",
  ],
  setup: {
    intro: "ใช้ไดเรกทอรีฝึกแยกในเครื่อง คัดลอกโค้ดทีละช่วงตามชื่อไฟล์ และใช้ข้อความกับ tenant สมมติชุดเดียวตลอดบท",
    commands: "mkdir b38-audit\ncd b38-audit\nuv python install 3.12\nuv run --python 3.12 python --version",
    steps: [
      ["version", "ตรวจว่าเห็น Python 3.12"],
      ["boundary", "เขียนเส้นทาง API → hybrid search → LLM → LangGraph → MCP และแตกแขนง trace"],
      ["fixture", "เตรียม policy#1, draft#1 และ private#1 ตามตัวอย่าง"],
    ],
    note: "รอบแรกใช้ list แทน index และใช้ผลการตัดสินใจแบบ deterministic แทนการเรียกโมเดลหรือ MCP จริง",
  },

  concepts: [
    {
      id: "rubric-2025",
      title: "1 · อ่าน OWASP ฉบับ 2025 แล้วทำรายการตรวจของโปรเจกต์",
      paragraphs: [
        "OWASP Top 10 for LLM Applications ฉบับ 2025 ใช้เป็นคำศัพท์กลางตอนรีวิวสถาปัตยกรรม เริ่มจากระบบที่มีอยู่จริง เช่น endpoint ถามนโยบายร้านค้า, ค้นเอกสารของสาขา และเครื่องมือดูสถานะคำสั่งซื้อ แล้วค่อยจัดหมวดความเสี่ยง",
        "เริ่มจากเส้นทางหนึ่งของ Day 121 เช่น ลูกค้าสาขาเหนือถามเงื่อนไขคืนสินค้า API ยืนยัน tenant ก่อนให้ hybrid retrieval หา policy โมเดลใช้ policy เป็นหลักฐานตอบ และ LangGraph เสนออ่านสถานะออเดอร์เพิ่มได้เมื่อมีเหตุผล เส้นแยกไป Langfuse เกิดได้ทั้งตอนค้นหาและตอนเรียก Tool",
        "แถวที่ตรวจได้ควรตอบว่าอะไรข้าม trust boundary, ด่านใดรับผิดชอบ, ทีมใดดูแล และเทสต์ชื่ออะไร ตอนเปลี่ยน reranker หรือเชื่อม MCP server เพิ่ม เราจึงรู้ว่าต้องรันหลักฐานไหนซ้ำ",
      ],
      analogy: "เหมือนแบบตรวจรับหอพัก แยกประตูห้อง เก็บกุญแจ และสมุดผู้มาติดต่อ แล้วผูกแต่ละรายการกับหลักฐานว่าใครตรวจเมื่อไร",
      bullets: [
        "LLM01 Prompt Injection · ข้อความเปลี่ยนพฤติกรรมของโมเดล",
        "LLM02 Sensitive Information Disclosure · ข้อมูลอ่อนไหวไปถึงผู้รับที่ไม่ควรเห็น",
        "LLM03 Supply Chain · ความเสี่ยงจากส่วนประกอบ ผู้ให้บริการ และ dependencies",
        "LLM04 Data and Model Poisoning · การปนเปื้อนของข้อมูลหรือโมเดลที่ส่งผลต่อพฤติกรรม",
        "LLM05 Improper Output Handling · ระบบปลายทางนำ output ไปใช้โดยตรวจไม่พอ",
        "LLM06 Excessive Agency · เครื่องมือ สิทธิ์ หรือความอิสระของ agent มากเกินงาน",
        "LLM07 System Prompt Leakage · การเปิดเผยข้อความกำกับระบบ",
        "LLM08 Vector and Embedding Weaknesses · จุดอ่อนในระบบ vector และ embeddings",
        "LLM09 Misinformation · คำตอบเท็จหรือทำให้เข้าใจผิด",
        "LLM10 Unbounded Consumption · ใช้ทรัพยากรโดยขาดเพดาน",
      ],
      code: {
        language: "python",
        filename: "audit_demo.py",
        code: inventory,
      },
      whyTitle: "จดความเสี่ยงหลายหมวดบนเส้นทางเดียวกันได้",
      whyParagraphs: [
        "เอกสารที่มีคำสั่งแฝงเกี่ยวกับ LLM01 หากคำตอบเผยข้อมูลลูกค้าต่อ เหตุการณ์นั้นมีผลแบบ LLM02 ด้วย หาก executor เขียนโดยไม่มีด่านตรวจ ให้ตามแก้ LLM06 ที่ executor โดยตรง",
        "ทำเครื่องหมายที่รอยต่อจริงสามแห่ง คือเอกสารเข้า context ผลของ MCP ไปยังโมเดลหรือ telemetry และข้อเสนอของ agent เข้า executor หลักฐานแต่ละแถวควรจับผลของด่านตัวเอง เช่น จับรายการ chunk ที่โมเดลจะเห็น หรือยืนยันว่า write ยังไม่เริ่ม",
        "การจัดหมวดช่วยชี้เจ้าของการแก้ไข ส่วนหลักฐานจากเทสต์บอกว่าด่านแต่ละจุดทำงานตามที่สัญญาไว้หรือไม่",
      ],
    },
    {
      id: "rag-injection",
      title: "2 · LLM01 เริ่มได้ทั้งที่ช่องถามและเอกสาร RAG",
      paragraphs: [
        "Direct injection มาจากข้อความที่ผู้ใช้ส่งมา ส่วน indirect injection มาจากข้อมูลที่ระบบไปอ่านเอง เช่น FAQ ที่มีคนแก้ไข หรือคำอธิบายที่คืนจาก Tool คำสั่งแฝงในย่อหน้าภาษาไทยอาจดูคล้ายหมายเหตุของเจ้าหน้าที่",
        "ลองเทียบคู่มือคืนสินค้าฉบับประกาศกับฉบับร่างที่เจ้าหน้าที่สาขาอัปโหลด แอปอาจยืนยันสาขาได้ถูกต้องทั้งสองฉบับ แต่ฉบับร่างที่ถูก flag ต้องถูกพักไว้ก่อนให้ reranker ส่งต่อ ทีมดูแลเอกสารต้องตรวจที่มาและยืนยันเวอร์ชันก่อนปล่อยกลับ",
        "Day 107 คัดเอกสารด้วย tenant และ role ก่อน retrieval ด่านนี้ตรวจสิทธิ์อ่าน ส่วนการจัดการ prompt injection ใช้การคัดกรองเนื้อหา แยกข้อมูลอ้างอิงใน context และคุมคำขอเรียก Tool ถัดไป ใช้ fixture ที่กำหนด flagged จากชุดทดสอบตรง ๆ ให้ผลของตัวกรองตรวจได้ชัด",
      ],
      analogy: "ทีมซัพพอร์ตเปิดคู่มือที่มีสิทธิ์อ่านได้ แต่ประโยคในคู่มือยังต้องผ่านขั้นตอนอนุมัติของงานจริง",
      bullets: [
        "ตรวจแหล่งเอกสารและเก็บ provenance เช่น document ID และ ingestion version",
        "แยก chunk ที่ถูก flag ไปให้เจ้าของตรวจ และตัดออกก่อนโมเดลรับ context",
        "ตรวจทั้งผล BM25 และ vector ด้วยเงื่อนไขสิทธิ์เดียวกัน ก่อนรวมอันดับและตัด top-k",
        "ทดสอบด้วยเอกสารกันออกที่ได้คะแนนสูงและเอกสารอนุญาตที่ได้คะแนนต่ำกว่า ถ้าคัดช้า เอกสารอนุญาตอาจหลุดจาก top-k จนผู้ใช้ได้คำตอบว่าง",
        "จำกัดความสามารถของช่องทางตอบคำถาม และใช้ {{abstention}} เมื่อไม่มีแหล่งอ้างอิงพอ",
      ],
      code: {
        language: "python",
        filename: "audit_demo.py",
        code: inventory + "\n\n" + retrieval,
        caption: "filter ก่อนจัดอันดับใน fixture และออก audit metadata แบบจำกัด",
      },
      whyTitle: "คำสั่งกำกับและตัวกรองเป็นคนละชั้นกับสิทธิ์",
      whyParagraphs: [
        "แยกประวัติสนทนา คำถาม และหลักฐานเป็นคนละส่วนใน request แล้วส่งให้โมเดลเฉพาะข้อมูลที่ผ่านขอบเขตของคำถาม ถ้าไม่มีหลักฐานตามสิทธิ์ ให้แจ้งว่าหาคำตอบไม่ได้จากข้อมูลที่มี",
        "การคั่นข้อความและคำสั่งช่วยสื่อหน้าที่ของ context ให้โมเดล แต่ความเข้าใจของโมเดลยังไม่ใช่ authorization ให้ executor ตรวจสิทธิ์อีกครั้งแม้คำตอบดูสมเหตุสมผล",
      ],
    },
    {
      id: "sensitive-disclosure",
      title: "3 · LLM02 ตรวจทั้ง context, tool result, response และ trace",
      paragraphs: [
        "ข้อมูลลูกค้าอาจออกจากระบบได้ก่อนมีคำตอบ เช่น ส่ง chunk ดิบไปที่ผู้ให้บริการ LLM หรือเก็บผล MCP แบบเต็มใน trace คิดแยกทีละปลายทางว่าต้องใช้ฟิลด์ใด",
        "ผล lookup_order อาจมีทั้ง reference, status, ข้อความภายใน และข้อมูลจัดส่ง หลังตรวจสิทธิ์รายออเดอร์ ให้สร้างผลลัพธ์ใหม่จากรายชื่อฟิลด์ที่จำเป็น เมื่อ schema ต้นทางมีฟิลด์เพิ่ม ฟิลด์นั้นจะยังอยู่นอกผลลัพธ์โดยปริยาย",
        "เปรียบเทียบ tenant filter กับการลดข้อมูล เมื่อผู้ใช้ถามวันที่คืนสินค้า ระบบต้องใช้ช่วงเวลาและลิงก์นโยบาย ไม่ต้องใช้เบอร์โทรจากตั๋วซัพพอร์ต Day 151 จะฝึก masking ข้อมูลส่วนบุคคลไทยเพิ่มเติม",
      ],
      analogy: "ใบแจ้งสถานะพัสดุบนจอสาธารณะใช้เลขอ้างอิงและสถานะ ส่วนที่อยู่ผู้รับเก็บไว้หลังระบบที่ตรวจสิทธิ์",
      code: {
        language: "python",
        filename: "project_status.py",
        code: projection + '\nprint(public_status(AUTHORIZED_ORDER))\n',
        caption: "เลือกเฉพาะฟิลด์ที่เผยแพร่ได้หลังตรวจสิทธิ์ออเดอร์แล้ว",
      },
      bullets: [
        "ก่อนค้นหา ใช้ tenant และสิทธิ์จาก session ที่แอปยืนยันแล้ว",
        "ก่อนตอบ ใช้ schema ของข้อมูลที่เปิดเผยได้และตรวจว่าคำตอบอ้างอิงจากชุดเอกสารที่ให้โมเดล",
        "ก่อนส่ง trace ให้ส่งเฉพาะฟิลด์ที่วางไว้สำหรับการวัดผล เช่น จำนวนหลักฐาน และตรวจเส้นทาง error ด้วย",
      ],
      whyTitle: "projection ลดทั้งขนาดข้อมูลและพื้นที่รั่วไหล",
      whyParagraphs: [
        "เลือกเฉพาะฟิลด์ที่จำเป็นก่อนส่งเข้าโมเดลหรือ trace การกรองเพียงคำตอบท้ายทางยังทิ้งสำเนาข้อมูลในระบบ upstream",
        "Day 146 ใช้ cache ลดต้นทุน เมื่อนำมาประกอบกับ RAG ให้คุม namespace ตาม tenant และสิทธิ์ ตรวจการอ่านซ้ำเมื่อสิทธิ์เปลี่ยน",
      ],
    },
    {
      id: "agent-authority",
      title: "4 · LLM06 จำกัดอำนาจที่ LangGraph ส่งต่อให้ MCP",
      paragraphs: [
        "ตัวโมเดลเสนอชื่อเครื่องมือและ args ผ่าน {{tool-calling}} ส่วนโค้ดแอปเป็นผู้ตัดสินว่าทำได้หรือไม่ เช่น lookup_order ใช้สิทธิ์อ่าน ขณะที่ add_note ต้องมีสิทธิ์เขียนและผู้รับผิดชอบอนุมัติ",
        "ในงานตอบนโยบายคืนสินค้า ให้เริ่มจากเครื่องมืออ่านเท่าที่งานต้องใช้ เก็บสิทธิ์เขียนไว้กับขั้นที่รับผิดชอบการแก้ไขออเดอร์ หาก MCP server ให้บริการหลาย workflow ให้ตรวจ tenant กับออเดอร์ที่ขอในฝั่งเซิร์ฟเวอร์ด้วย",
        "{{langgraph}} อาจกลับเข้าทางเดิมหลายครั้ง ให้ตรวจนโยบายทุกครั้งหน้า executor และใช้เพดานรอบจาก Day 118 ขณะรออนุมัติให้เก็บข้อเสนอไว้ใน checkpoint ที่มีอายุจำกัด",
      ],
      bullets: [
        "ชื่อ Tool จากโมเดลต้องผ่าน allowlist ของ workflow ปัจจุบันก่อน dispatch",
        "scope ที่เชื่อถือได้มาจาก session หรือข้อมูลรับรองของบริการที่เซิร์ฟเวอร์ตรวจแล้ว",
        "เมื่อต้องขออนุมัติ ให้แสดงรายการแก้ไขจริงกับผู้ตรวจ และตรวจสิทธิ์อีกครั้งตอนกลับจาก checkpoint",
      ],
      analogy: "เจ้าหน้าที่เสนอขอแก้บันทึกในระบบ ลายเซ็นอนุมัติผูกกับรายการแก้ไขที่ตรวจแล้ว",
      code: {
        language: "python",
        filename: "audit_demo.py",
        code: dispatch,
      },
      whyTitle: "ตัวตัดสินใจไม่ต้องเดาความตั้งใจของโมเดล",
      whyParagraphs: [
        "allowlist และ scope ตัดสินจากนโยบายที่ฝั่งเซิร์ฟเวอร์รู้ ส่วนผู้อนุมัติตรวจรายการที่จะเกิดจริง Day 150 จะผูกการอนุมัติกับ actor, tenant และ arguments",
        "หลักฐานที่มีน้ำหนักคือจำนวนการเรียก tool stub หรือบันทึก side effects พร้อม decision code ไม่ใช่ประโยคปฏิเสธจากโมเดล",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Trust boundaries ในแอป AI",
      body: [
        "SQL parameter binding แยกค่าจากโครงสร้างคำสั่ง SQL และ output encoding ทำให้ข้อความใน HTML อยู่ในบริบทที่ปลอดภัย เมื่อข้อความเข้าโมเดลระบบยังต้องตรวจสิ่งที่โมเดลเสนอที่ปลายทาง",
      ],
      table: [
        ["SQL injection และ parameter binding", "ใช้ parameterized query ใน MCP ต่อไป และตรวจ RAG context เป็นข้อมูลก่อนส่งให้โมเดล"],
        ["XSS และ CSP", "render คำตอบเป็นข้อความหรือใช้ sanitizer ตามปลายทาง พร้อมแยกชั้นคุมการทำงานของ Tool"],
        ["IAM และ row-level security", "แยก read/write scopes และดึงเอกสารเฉพาะ tenant ที่ยืนยันจาก session"],
        ["Structured logging", "บันทึกประเภทเหตุการณ์และจำนวน โดยตัด context ดิบออกจาก telemetry"],
      ],
    },
    student: {
      title: "First-Year Note — ใครให้ข้อมูล ใครให้สิทธิ์",
      body: [
        "กระดาษประกาศบอกเวลาเปิดห้องสมุดได้ ส่วนสิทธิ์ยืมหนังสือมาจากระบบสมาชิก แยกผู้เขียนเนื้อหาออกจากผู้อนุญาตให้ลงมือทำ",
        "ลองลากกรอบรอบองค์ประกอบที่เชื่อถือร่วมกัน เมื่อเส้นข้ามกรอบให้เขียนสมมติฐานและจุดตรวจหนึ่งข้อ",
      ],
    },
  },

  workedExample: {
    intro: "ประกอบ audit_demo.py ต่อเนื่องสามขั้น แล้วรันด้วย uv run --python 3.12 python audit_demo.py หลังแต่ละขั้นตามตัวอย่าง",
    steps: [
      {
        title: "1 · ระบุเจ้าของด่านและหลักฐาน",
        explain: [
          "เริ่มไฟล์ด้วย Finding และรายการสามแถว อ่านจากรหัสไปยัง boundary แล้วชี้ได้ว่าโค้ดส่วนไหนรับผิดชอบการตรวจ",
          "บรรทัด print ชั่วคราวแสดงว่ารหัสและเจ้าของครบ ลบบรรทัดนั้นก่อนต่อขั้นสอง",
        ].join(" "),
        code: {
          language: "python",
          filename: "audit_demo.py",
          code: inventory + '\nprint([(row.risk, row.owner) for row in FINDINGS])\n',
        },
        output: "[('LLM01', 'retrieval'), ('LLM02', 'api'), ('LLM06', 'tools')]",
      },
      {
        title: "2 · เก็บเอกสารที่เกี่ยวข้องภายใน tenant",
        explain: [
          "ต่อท้ายด้วย Chunk และ context_for แล้วลองบรรทัด print ชั่วคราว",
          "ทั้ง private#1 และ draft#1 มีคะแนนสูงกว่า policy#1 ชิ้นแรกอยู่นอก tenant ส่วนชิ้นหลังถูก flag จึงเหลือหลักฐานเดียวแม้เพดานจะเป็นสองชิ้น",
        ].join(" "),
        code: {
          language: "python",
          filename: "audit_demo.py",
          code: retrieval + '\nprint([chunk.ref for chunk in context_for("north", DOCS)])\n',
        },
        output: "['policy#1']",
      },
      {
        title: "3 · ตรวจ read/write และข้อมูลที่ลง audit",
        explain: [
          "ลบ print ชั่วคราวจากขั้นสอง แล้วต่อท้ายด้วยฟังก์ชันเลือกฟิลด์ของออเดอร์ นโยบาย Tool และ demo",
          "ดูว่า audit มีจำนวนอย่างเดียว ส่วนผลออเดอร์มีสองฟิลด์ งานอ่านผ่านด่าน scope และงานเขียนหยุดรออนุมัติ ตัวอย่างนี้จำลองการตัดสินใจโดยยังไม่มี executor ที่ทำงานเขียน",
        ].join(" "),
        code: {
          language: "python",
          filename: "audit_demo.py",
          code: projection + "\n\n" + dispatch + "\n\n" + demo,
        },
        output: "context: ['policy#1']\naudit: {'context_count': 1}\nstatus fields: ['reference', 'status']\nread: allow_read\nwrite: pending_approval",
      },
    ],
    gotcha: "ค่า flagged ใน fixture แทนผลจากด่านจัดการเอกสาร ในระบบจริงให้ RAG search ทั้ง BM25 และ vector รับ ACL เดียวกัน และตรวจ metadata ของผลก่อนสร้าง context",
  },

  practice: {
    intro: "สร้าง audit checklist สำหรับบริการของคุณ แล้วใช้ pytest เป็นหลักฐานว่าจุดควบคุมสามแห่งตอบสนองตามที่ออกแบบ",
    requirements: [
      "ให้แต่ละ Finding มี OWASP ID, surface, trust boundary, เจ้าของ control และชื่อเทสต์",
      "กรอง tenant และ flagged chunk ก่อน top-two แล้วสร้าง audit record ที่มีเพียงจำนวน context",
      "เลือกเฉพาะ reference และ status จากข้อมูลออเดอร์ที่ตรวจสิทธิ์แล้ว",
      "ปฏิเสธ Tool นอก allowlist และ scope ที่ขาด ให้ read ผ่านและ write คืน pending_approval",
    ],
    starter: {
      language: "python",
      filename: "b38_audit.py",
      code: inventory + "\n\n" + String.raw`@dataclass(frozen=True)
class Chunk:
    tenant: str
    ref: str
    text: str
    relevance: float
    flagged: bool = False


DOCS = [
    Chunk("north", "policy#1", "เปลี่ยนสินค้าได้ภายในเจ็ดวัน", 0.70),
    Chunk("south", "private#1", "FIXTURE_PRIVATE", 0.99),
    Chunk("north", "draft#1", "TEST_INSTRUCTION", 0.95, flagged=True),
]


def context_for(tenant: str, chunks: list[Chunk]) -> list[Chunk]:
    # TODO: ปฏิเสธ tenant ว่าง กรองสิทธิ์และ flagged ก่อน sort
    raise NotImplementedError


def audit_metadata(context: list[Chunk]) -> dict:
    # TODO: คืน count เท่านั้น
    raise NotImplementedError


AUTHORIZED_ORDER = {
    "reference": "DEMO-17",
    "status": "กำลังจัดส่ง",
    "internal_note": "FIXTURE_PRIVATE",
}


def public_status(order: dict[str, str]) -> dict[str, str]:
    # TODO: สร้างผลลัพธ์ด้วยรายชื่อฟิลด์ที่เปิดเผยได้
    raise NotImplementedError


def decision_for(tool: str, scopes: frozenset[str]) -> str:
    # TODO: ตรวจ allowlist, scope และ write ตามลำดับ
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_b38_audit.py",
      code: String.raw`from b38_audit import (
    AUTHORIZED_ORDER,
    DOCS,
    FINDINGS,
    Chunk,
    audit_metadata,
    context_for,
    decision_for,
    public_status,
)


` + tests,
    },
    selfCheck: [
      "อธิบายได้ว่าคะแนนสูงของ private#1 ควรไม่มีผลต่อการจัดอันดับของ tenant north",
      "policy#2 แซง policy#1 ได้เมื่อเป็นเอกสารที่ได้รับสิทธิ์ ส่วน policy#3 หลุดจากสองอันดับแรก",
      "public_status มี reference และ status เท่านั้น แม้ input จะมี internal_note",
      "audit metadata ไม่มี text, ref, ชื่อผู้ใช้ หรือข้อมูลส่วนบุคคล",
      "เชื่อมชื่อเทสต์ใน inventory กับผล pytest และชี้ตำแหน่งด่านในโปรเจกต์ของตัวเองได้",
    ],
    acceptance: "ผ่าน 12 เคส และเขียน inventory สามแถวที่ตรวจได้จากผลลัพธ์หรือการขาด side effects",
    hints: [
      { body: "แยกคำถามว่าใครอ่านข้อมูลได้ ใครลงมือทำได้ และข้อความที่อ่านมาควรถูกใช้ในบทบาทใด" },
      { body: "ใช้ list comprehension กรองเอกสารก่อน sort และใช้ dict.get ตรวจชื่อ Tool ก่อน unpack scope" },
      {
        body: "ไฟล์เดียวสำหรับตรวจคำตอบด้วย pytest มีทั้ง implementation, fixture และเทสต์",
        code: {
          language: "python",
          filename: "test_b38_audit_solution.py",
          code: [
            inventory,
            retrieval,
            projection,
            dispatch,
            tests,
          ].join("\n\n"),
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: "uv run --python 3.12 --with pytest --with pydantic pytest -q test_b38_audit_solution.py",
    },
  },

  mistakes: [
    {
      title: "อ่านรหัสจาก OWASP รุ่นเก่า",
      symptom: "อ้าง LLM06 เป็นข้อมูลอ่อนไหว ทำให้ผู้รีวิวตามเอกสารคนละหมวด",
      fix: "เขียนปี 2025 ไว้ที่หัว checklist และใช้ชื่อหมวดควบคู่กับรหัส",
    },
    {
      title: "คิดว่า ACL ตรวจความน่าเชื่อถือของข้อความแล้ว",
      symptom: "draft ที่ user อ่านได้ยังมีข้อความชี้นำอยู่ใน context",
      fix: "เพิ่มการตรวจ provenance และคัดกรองเนื้อหา แล้วตรวจนโยบาย Tool อิสระจากการตัดสินของโมเดล",
    },
    {
      title: "เก็บ tool output ดิบใน trace",
      symptom: "คำตอบผ่านการปกปิด แต่ note ภายในยังอยู่ในระบบสังเกตการณ์",
      fix: "ส่งเฉพาะฟิลด์ที่จำเป็นไปแต่ละปลายทาง และทดสอบ audit metadata แยก",
    },
    {
      title: "เปิดเครื่องมือเขียนเป็นค่าเริ่มต้น",
      symptom: "Agent ส่งข้อเสนอแล้วเกิดการแก้ข้อมูลทันทีแม้ผู้ใช้ต้องการแค่อ่าน",
      fix: "แยก allowlist และ scopes ตามงาน ให้ checkpoint หยุด write จนกว่าจะอนุมัติรายการจริง",
    },
  ],
  quiz: {
    questions: [
      mc("d149-q1", "FAQ ใน tenant เดียวกันมีข้อความที่เปลี่ยนพฤติกรรมของโมเดล ตรงกับหมวดใด?",
        [["LLM01", "ข้อความในเอกสารเป็นช่องทาง indirect prompt injection"], ["LLM03", "โจทย์ไม่ได้เน้น dependency"], ["LLM09", "คำตอบผิดอาจตามมา แต่โจทย์เจาะที่การชี้นำ"], ["LLM10", "โจทย์ไม่มีการใช้ทรัพยากรเกินขอบเขต"]],
        "A", "LLM01 มองที่ข้อความที่ชี้นำโมเดลได้จากหลายแหล่งรวมถึงเอกสาร", "Indirect injection เข้าจากไหนได้บ้าง?", "เอกสาร RAG, ผลจาก Tool และแหล่งข้อมูลอื่นที่ระบบนำเข้า context"),
      mc("d149-q2", "คำตอบปิดข้อมูลแล้ว แต่ trace มีข้อมูลลูกค้าดิบ จุดเสี่ยงหลักคืออะไร?",
        [["LLM04", "ไม่มีหลักฐานว่าข้อมูลฝึกถูกปนเปื้อน"], ["LLM02", "trace เป็นปลายทางที่อาจเผยข้อมูลอ่อนไหว"], ["LLM07", "โจทย์เป็นข้อมูลลูกค้า"], ["LLM10", "ปริมาณ trace เป็นคนละประเด็น"]],
        "B", "ตรวจทุกปลายทางที่ข้อมูลปรากฏ และจำกัดฟิลด์ก่อนส่ง trace", "ยกสองปลายทางที่อาจพบ PII", "ผลลัพธ์ API และ observability traces"),
      mc("d149-q3", "ผู้ใช้มี orders:read แต่ agent เสนอ add_note แอปควรทำอะไร?",
        [["ขออนุมัติทันที", "ผู้ขอไม่มีสิทธิ์เขียนตั้งแต่ต้น"], ["รันเพราะ args ถูกต้อง", "schema ตรวจรูปร่างข้อมูล"], ["ปฏิเสธที่ executor", "executor ตรวจ scope ก่อนเกิด side effect"], ["ให้โมเดลตัดสินซ้ำ", "โมเดลไม่มีสิทธิ์ออก scope"]],
        "C", "LLM06 ลดได้ด้วยการให้ executor บังคับ scope แล้วใช้ HITL สำหรับ write ที่ได้รับสิทธิ์", "ด่านใดตรวจ orders:write?", "ด่านติดกับ executor ของ Tool"),
      mc("d149-q4", "Evidence ที่เหมาะกับแถว LLM02 ใน retrieval คือข้อใด?",
        [["รูปหน้าแดชบอร์ด", "ไม่เห็นข้อมูลที่เข้า context"], ["คะแนน reranker สูง", "คะแนนบอกความเกี่ยวข้อง"], ["ข้อความ prompt ว่าตรวจสิทธิ์แล้ว", "ข้อความเดียวไม่ยืนยันการกรอง"], ["เทสต์ที่ยืนยันชุด ref ของ tenant หลัง ACL และก่อนเข้าโมเดล", "ตรวจสิ่งที่แอปส่งข้าม boundary โดยตรง"]],
        "D", "ตรวจรายการอ้างอิงที่ถูกส่งถึงโมเดลและใช้ fixture ที่มีเอกสารต่าง tenant คะแนนสูง", "ทำไมต้องมีเอกสารต่าง tenant คะแนนสูงในเทสต์?", "เพื่อให้พบ regression เมื่อคัดสิทธิ์ผิดลำดับหรือขาดเงื่อนไข"),
    ],
  },
  takeaways: [
    "LLM01 ดูเส้นทางข้อความ LLM02 ดูปลายทางข้อมูล และ LLM06 ดูอำนาจของ executor",
    "ติดเจ้าของและชื่อเทสต์ไว้ที่ทุก trust boundary ใน inventory",
    "เชื่อมรายการตรวจนี้กับ guardrails ที่ Day 150, PII masking ที่ Day 151 และชุด regression ที่ Day 152",
  ],
  reviewCards: [
    rc("d149-r1", "tenant ACL กับการตรวจเอกสารคุมคนละเรื่องอย่างไร?", "ACL คุมสิทธิ์อ่าน ส่วนการตรวจเอกสารคุมความเสี่ยงจากเนื้อหาที่นำเข้า context"),
    rc("d149-r2", "ควรตรวจการเผยข้อมูลที่จุดไหน?", "ก่อนส่ง context, tool result, response และ trace ตามความจำเป็นของแต่ละปลายทาง"),
    rc("d149-r3", "ลำดับตรวจ write action ที่ถูกต้องคืออะไร?", "ตรวจ allowlist และ scope แล้วหยุดรออนุมัติก่อน execute"),
  ],
  sources: [
    { label: "OWASP Top 10 for LLM Applications 2025", href: "https://genai.owasp.org/llm-top-10/" },
    { label: "OWASP LLM Prompt Injection Prevention Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html" },
    { label: "OWASP Authorization Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" },
  ],
  glossary: ["prompt-injection", "acl", "mcp", "hitl", "abstention", "tool-calling", "langgraph"],
});
