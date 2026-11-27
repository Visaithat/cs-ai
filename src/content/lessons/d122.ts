import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D122 — Phase 4 / Block B31
 * Citation Verification Gate & Fallback Handling on Evidence or Tool Failure
 */
export const d122: Lesson = defineLesson({
  day: 122,
  titleTh: "Citation Verification Gate และการจัดการ Fallback เมื่อหลักฐานหรือ Tool ล้มเหลว",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · สร้างด่านตรวจ [doc_id#chunk] ที่ซ่อมคำตอบอัตโนมัติ 1 ครั้งจากหลักฐานของ Tenant ตัวเอง และตัดเข้า Safe Abstention เมื่อไม่ผ่าน",
  icon: "badge-check",
  visual: {
    id: "grounded-citations",
    title: "Post-Generation Citation Verifier, Single-Shot Repair & Safe Abstention Fallback",
    caption: "ตรวจสอบว่าทุก [doc_id#chunk] ในคำตอบตรงกับ Chunk ของ Tenant ที่ดึงมาจริง ลองซ่อม 1 ครั้งเมื่อขาดป้าย และ Abstain ทันทีเมื่อซ่อมไม่ผ่านหรือ Tool ล้มเหลว",
    alt: "แผนภาพ Citation Verifier และ Fallback Gate",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — สร้างโมดูล Citation Verification & Repair Gate ทดสอบด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "re (Regex)", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "ด่านสุดท้ายก่อนปล่อยคำตอบออกสู่หน้าจอของลูกค้าใน Phase 4 Mini-Project",
      body: "เมื่อวาน (D121) เราต่อโครงสร้าง 4 เส้นทางของ `thai_rag_agent.py` เสร็จแล้ว วันนี้เราจะสร้าง **Outbound Citation & Fallback Gate** (`citation_fallback.py`) มาวางขวางหน้าประตูขาออก เพื่อรับประกันว่า **Citation Faithfulness = 1.0** ตามเกณฑ์ Checkpoint",
      lessonNote: "ไม่มีประโยคใดหลุดถึงลูกค้าได้โดยไม่มีป้าย `[doc_id#chunk]` ที่ถูกต้องและอยู่ในสิทธิ์ของ `auth.tenant_id`",
    },
    {
      node: 1,
      heading: "ตรวจทั้ง 3 เงื่อนไข: มีป้ายอ้างอิง + อยู่ใน Tenant's Allowed Chunks + ตัวเลขตรงตามหลักฐาน",
      body: "การตรวจความถูกต้องของคำตอบไม่ได้ดูแค่ว่ามีวงเล็บ `[...]` หรือไม่ แต่ต้องตรวจเทียบกับรายการ `retrieved_chunks` ที่ถูกกรองเฉพาะ `chunk.tenant_id == auth.tenant_id` แล้วเท่านั้น พร้อมตรวจว่าตัวเลขทุกตัวในประโยคปรากฏอยู่ในข้อความของ chunk ที่อ้างอิงจริง",
      lessonNote: "หากโมเดลอ้างรหัส chunk ของบริษัทอื่น หรือเปลี่ยนตัวเลข 14 วันเป็น 30 วัน ด่านนี้จะตีตกทันที",
    },
    {
      node: 4,
      heading: "Single-Shot Bounded Repair: ให้โอกาสซ่อม 1 ครั้งจากหลักฐานที่ได้รับอนุญาตเท่านั้น",
      body: "ตามแพตเทิร์น Evaluator-Optimizer (D111–D112) หากร่างคำตอบแรกตกด่านตรวจ (เช่น ลืมแปะป้ายอ้างอิง) ระบบจะส่งเฉพาะรายการ `allowed_chunks` ของ tenant นั้นไปให้ฟังก์ชัน `repair_fn` ซ่อมคำตอบได้ **1 ครั้ง**",
      lessonNote: "สำคัญมาก: คำตอบที่ซ่อมกลับมาแล้ว **ต้องถูกส่งเข้าฟังก์ชันตรวจสอบซ้ำอีกครั้ง (Re-verification)** ห้ามเชื่อว่าซ่อมแล้วจะถูกเสมอ!",
    },
    {
      node: 5,
      heading: "Fail-Closed Abstention เมื่อซ่อมไม่ผ่าน, ไม่มีหลักฐาน หรือ Tool ต้นทางล้มเหลว",
      body: "หากหลังซ่อม 1 ครั้งแล้วยังไม่ผ่านเกณฑ์ หรือตั้งแต่ต้นทางเกิด `tool_failed=True` หรือไม่มี chunk ของ tenant นั้นเลย ระบบจะตัดเข้าโหมด {{abstention}} พร้อมระบุ `fallback_reason` ที่ชัดเจน",
      lessonNote: "วันพรุ่งนี้ (Day 123) เราจะนำด่านตรวจนี้ไปรันทดสอบกับชุดคำถามลูกค้าภาษาไทย 15 ข้อครบทุกสถานการณ์",
    },
  ],

  objectives: [
    "**สร้างตัวคัดกรองและตรวจสอบ Citation แบบผูกสิทธิ์ Tenant** ที่สกัดป้าย `[doc_id#chunk]` และยืนยันว่าทุกป้ายอยู่ในชุด `allowed_chunks` ของ `auth.tenant_id` พร้อมตรวจความตรงกันของตัวเลข",
    "**ออกแบบกลไก Single-Shot Repair + Re-Verification** ที่ส่งเฉพาะหลักฐานที่ได้รับอนุญาตไปซ่อมคำตอบ 1 ครั้งเมื่อร่างแรกไม่ผ่าน และนำผลที่ซ่อมแล้วมาตรวจซ้ำอย่างเข้มงวด",
    "**จัดการ Safe Fallback ครบทุกกรณีความล้มเหลว** (`tool_failed`, `no_allowed_evidence`, `repair_failed`) และเขียนชุดทดสอบ {{pytest}} ครอบคลุมครบทุกกิ่งของการตัดสินใจ",
  ],

  prerequisites: [
    "ผ่าน Day 105–108 (Grounded Citations & Multi-Tenant ACL) และ Day 111–112 (Evaluator-Optimizer Repair)",
    "ผ่าน Day 121 (Phase 4 Mini-Project Architecture)",
    "ไม่ต้องใช้ API key — ทดสอบด่านตรวจและซ่อม Citation บนเครื่องด้วย `pytest` ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day122` ด้วย `uv` เพื่อสร้างโมดูล `citation_fallback.py` และชุดทดสอบ `test_citation_fallback.py`",
    commands: `uv init ai-day122 && cd ai-day122
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day122` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เขียน `citation_fallback.py` และรัน `uv run pytest -v`"],
    ],
    note: "กฎเหล็กของวันนี้: คำตอบที่ผ่าน `repair_fn` มาแล้วต้องรันผ่านฟังก์ชัน `verify_answer_against_chunks` ตัวเดียวกับที่ตรวจร่างแรกเสมอ!",
  },

  concepts: [
    {
      id: "tenant-filtered-evidence-pool",
      title: "1 · สร้าง `allowed_map` จาก Chunks ที่ตรงกับ `auth.tenant_id` เท่านั้น",
      paragraphs: [
        "ในระบบที่มีหลายส่วนประกอบส่งข้อมูลหากัน ด่านตรวจขาออก (`Citation Verification Gate`) ต้องทำงานแบบ Zero-Trust: แม้ฟังก์ชันค้นหาต้นทางจะส่งรายการ `retrieved_chunks: list[EvidenceChunk]` มาให้แล้ว ด่านตรวจขาออกก็ยังต้องคัดเฉพาะ `c for c in retrieved_chunks if c.tenant_id == auth.tenant_id` มาสร้างเป็น `allowed_map: dict[str, str]` ก่อนเสมอ",
        "ทำไมต้องทำเช่นนี้? เพราะถ้าเกิดบั๊กในตัวค้นหาที่ทำให้ chunk ของบริษัท `beta_th` หลุดปนเข้ามากับผลค้นของ `acme_th` แล้วโมเดลเผลอหยิบข้อมูลของ `beta_th` มาตอบพร้อมแปะป้าย `[beta-pol#c01]` การที่ด่านขาออกสร้าง `allowed_map` เฉพาะของ `acme_th` จะทำให้ `[beta-pol#c01]` ถูกจับเป็น **Phantom / Unauthorized Citation** ทันที!",
        "และแน่นอนว่าเมื่อต้องส่งหลักฐานไปให้ `repair_fn` ซ่อมคำตอบ เราจะส่งเฉพาะ `allowed_map` ของ `auth.tenant_id` นั้นเข้าไปเท่านั้น เพื่อไม่ให้ขั้นตอนการซ่อมเห็นข้อมูลของบริษัทอื่นอย่างเด็ดขาด",
      ],
      analogy:
        "เหมือนกรรมการคุมสอบที่ตรวจว่านักศึกษาอ้างอิงเฉพาะ 'หนังสือที่อนุญาตให้นำเข้าห้องสอบของวิชานี้' เท่านั้น ถ้าใครแอบหยิบโพยของวิชาอื่นที่หลงอยู่ใต้โต๊ะมาอ้างอิง กรรมการก็ตัดคะแนนทันทีและริบโพยนั้นออกก่อนให้แก้ตัว",
      bullets: [
        "**Tenant Scoping at Gate**: `allowed_map = {c.chunk_id: c.text for c in chunks if c.tenant_id == auth.tenant_id}`",
        "**Empty Evidence Short-Circuit**: ถ้า `allowed_map` ว่างเปล่า ให้คืน `status=\"abstain\"`, `fallback_reason=\"no_allowed_evidence\"` ทันที",
        "**Tool Failure Short-Circuit**: ถ้าต้นทางส่งธง `tool_failed=True` มา ให้คืน `status=\"abstain\"`, `fallback_reason=\"tool_failure\"` ทันที",
      ],
      whyTitle: "Why this matters — ป้องกันไม่ให้ขั้นตอน Repair กลายเป็นช่องทางรั่วไหลของข้อมูลข้ามบริษัท",
      whyParagraphs: [
        "หากส่ง `retrieved_chunks` ดิบที่ยังไม่กรอง `tenant_id` เข้าไปใน prompt ของ `repair_fn` โมเดลตอนซ่อมอาจหยิบเนื้อหาของบริษัทอื่นมาเขียนแทนของเดิม การส่งเฉพาะ `allowed_map` ที่กรองแล้วจึงปิดช่องโหว่นี้ 100%",
      ],
    },
    {
      id: "verify-repair-reverify-cycle",
      title: "2 · วงจร Verify → Single-Shot Repair → Re-Verify",
      paragraphs: [
        "ความผิดพลาดที่พบบ่อยมากในโค้ด Production คือ: เมื่อตรวจร่างคำตอบแรกไม่ผ่าน จึงเรียก `repaired = repair_fn(draft, allowed_map)` แล้ว **ส่ง `repaired` ออกไปหาผู้ใช้ทันทีโดยไม่ตรวจซ้ำ!**",
        "ลองคิดดูว่าถ้าในรอบซ่อม โมเดลก็ยังลืมใส่ป้ายอ้างอิงเหมือนเดิม หรือแย่กว่านั้นคือใส่ป้ายถูกแต่แอบเปลี่ยนตัวเลขจาก 14 วันเป็น 30 วัน ถ้าเราไม่รันฟังก์ชันตรวจสอบซ้ำ คำตอบที่ผิดนั้นจะหลุดออกไปหาลูกค้าทันทีพร้อมสถานะว่าซ่อมสำเร็จ!",
        "ดังนั้นวงจรที่ถูกต้องต้องเป็น 3 จังหวะเสมอ:\n1. **Verify Draft**: รัน `ok, cites, reason = verify_claim_text(draft_answer, allowed_map)` ถ้า `ok` เป็น `True` ให้คืน `status=\"verified\"`, `repair_attempted=False`\n2. **Single-Shot Repair**: ถ้าไม่ผ่านและมี `repair_fn` ให้เรียก `repaired_text = repair_fn(draft_answer, allowed_map, reason)` เพียง 1 ครั้ง\n3. **Re-Verify Repaired**: รัน `ok2, cites2, reason2 = verify_claim_text(repaired_text, allowed_map)` ซ้ำอีกครั้ง! ถ้า `ok2` เป็น `True` จึงคืน `status=\"repaired\"`, `repair_attempted=True` แต่ถ้ายังไม่ผ่านให้ตัดเข้า `status=\"abstain\"`, `fallback_reason=\"citation_verification_failed\"` ทันที",
      ],
      analogy:
        "เหมือนการตรวจสภาพรถยนต์ (ตรอ.): ถ้ารอบแรกไฟเบรกไม่ติดแล้วช่างบอกว่ารับไปซ่อมให้แล้ว นายทะเบียนต้อง 'กดเหยียบเบรกตรวจซ้ำอีกครั้ง' ว่าไฟติดจริงก่อนออกใบผ่าน ไม่ใช่เชื่อคำพูดช่างแล้วปั๊มตราผ่านให้เลย",
      code: {
        language: "python",
        filename: "verify_and_reverify.py",
        code: `import re

CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")
NUMBER_RE = re.compile(r"\\d+")


def verify_claim_text(
    text: str,
    allowed_map: dict[str, str],
) -> tuple[bool, list[str], str]:
    """ตรวจว่ามี citation ที่อยู่ใน allowed_map ทุกตัว และตัวเลขในข้อความตรงกับหลักฐาน"""
    cleaned_lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]
    if not cleaned_lines:
        return False, [], "empty_answer"

    all_cites: list[str] = []
    for line in cleaned_lines:
        cites = CITATION_RE.findall(line)
        if not cites:
            return False, [], "missing_citation"
        if any(cid not in allowed_map for cid in cites):
            return False, [], "unauthorized_or_phantom_citation"

        body_without_tags = CITATION_RE.sub("", line)
        evidence_blob = " ".join(allowed_map[cid] for cid in cites)
        if not all(num in evidence_blob for num in NUMBER_RE.findall(body_without_tags)):
            return False, [], "numeric_mismatch"

        for cid in cites:
            if cid not in all_cites:
                all_cites.append(cid)

    return True, all_cites, "verified"`,
        caption: "ฟังก์ชันเดียวใช้ตรวจทั้งร่างแรกและร่างหลังซ่อม รับประกันมาตรฐานเดียวกัน 100%",
      },
      whyTitle: "Why this matters — Re-verification คือสิ่งที่ทำให้ Citation Faithfulness = 1.0 เป็นความจริงทางคณิตศาสตร์",
      whyParagraphs: [
        "เมื่อทุกเส้นทางที่คืนคำตอบ (`verified` และ `repaired`) ต้องผ่าน `verify_claim_text(...) == True` เสมอ จึงไม่มีทางที่คำตอบซึ่งขาดป้ายอ้างอิงหรือมีป้ายปลอมจะได้คะแนน Faithfulness ต่ำกว่า 1.0",
      ],
    },
    {
      id: "structured-fallback-reasons",
      title: "3 · การแยก `fallback_reason` และการซ่อนข้อความดิบที่ไม่ผ่านการตรวจ",
      paragraphs: [
        "เมื่อคำขอตกเข้าสถานะ `status=\"abstain\"` ไม่ว่าจะด้วยสาเหตุใด สิ่งสำคัญ 2 ประการคือ:",
        "**ประการที่ 1 (Safe User Message)**: ข้อความ `final_answer` ที่ส่งกลับให้ผู้ใช้ต้องถูกแทนที่ด้วยข้อความมาตรฐานที่ปลอดภัย (`SAFE_FALLBACK_TEXT`) เสมอ ห้ามส่งร่างคำตอบที่ตกด่านตรวจหรือข้อความ error ดิบของเครื่องมือออกไปให้ลูกค้าเห็นเด็ดขาด",
        "**ประการที่ 2 (Explicit Diagnostic Reason)**: ระบุ `fallback_reason` ให้ชัดเจนว่าเป็น `\"tool_failure\"`, `\"no_allowed_evidence\"` หรือ `\"citation_verification_failed\"` พร้อมตั้งค่า `citations=[]` เพื่อให้ชุดทดสอบใน Day 123 และระบบ Checkpoint ใน Day 124 ตรวจสอบความถูกต้องของแต่ละเคสได้",
      ],
      analogy:
        "เหมือนหน้าจอแจ้งผู้โดยสารที่สนามบินที่ขึ้นข้อความสุภาพว่า 'เที่ยวบินล่าช้า กรุณาติดต่อเคาน์เตอร์บริการ' เหมือนกัน แต่ในระบบของวิศวกรซ่อมบำรุงมีรหัสแยกชัดเจนว่าเกิดจากเรดาร์ขัดข้อง เชื้อเพลิงไม่พอ หรือตรวจเช็กล้อไม่ผ่าน",
      bullets: [
        "**`status == \"verified\"`**: ร่างแรกผ่านทันที (`repair_attempted=False`)",
        "**`status == \"repaired\"`**: ร่างแรกตก แต่ซ่อม 1 ครั้งแล้วตรวจซ้ำผ่าน (`repair_attempted=True`)",
        "**`status == \"abstain\"`**: ตกเข้าข้อความปลอดภัย (`final_answer = SAFE_FALLBACK_TEXT`, `citations = []`)",
      ],
      whyTitle: "Why this matters — เมื่อ `status == 'abstain'` ลิสต์ `citations` ต้องเป็น `[]` เสมอ",
      whyParagraphs: [
        "หากระบบปฏิเสธการตอบแต่ยังเผลอแนบลิสต์ `citations` ที่ไม่ผ่านการตรวจสอบติดออกไป UI หน้าเว็บอาจแสดงชิปแหล่งอ้างอิงผิด ๆ ใต้ข้อความขออภัยได้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Citation Verification & Fallback Gate กับ Outbound Response Interceptor",
      body: [
        "ด่านตรวจขาออกในวันนี้ทำงานเหมือน Response Interceptor + Error Boundary ในสถาปัตยกรรมเว็บ:",
      ],
      table: [
        ["`allowed_map` scoped to `auth.tenant_id`", "Row-level tenant filter บนข้อมูลที่ใช้ render response"],
        ["`verify_claim_text` (Draft Check)", "Zod Outbound Response Schema Validation"],
        ["Single-Shot `repair_fn` + Re-verify", "1x Auto-healing transformer ก่อน validate ซ้ำ"],
        ["`status='abstain'` + `SAFE_FALLBACK_TEXT`", "Error Boundary Fallback UI ที่ซ่อนข้อมูลภายในที่พัง"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมเราถึงซ่อมแค่ 1 ครั้ง (Single-Shot Repair) แทนที่จะวนซ่อม 10 ครั้ง",
      body: [
        "ถ้าเราส่งรายการ `allowed_map` และบอกเหตุผลที่ตกเกณฑ์ (เช่น `'missing_citation'`) ให้โมเดลทราบอย่างชัดเจนแล้ว แต่การซ่อมครั้งที่ 1 ก็ยังไม่ผ่าน มักแปลว่า **หลักฐานที่ดึงมาไม่มีคำตอบนั้นอยู่จริง ๆ**",
        "การฝืนสั่งซ่อมครั้งที่ 2, 3, 4 รังแต่จะเพิ่ม Latency ให้ผู้ใช้รอนานขึ้นและกดดันให้โมเดลแต่งข้อมูลมั่ว การซ่อมเพียง 1 ครั้งแล้วตัดเข้า Safe Abstention ทันทีจึงเป็นจุดสมดุลที่ดีที่สุดครับ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะเขียน `run_citation_fallback_gate` ที่รับร่างคำตอบ, รายการ chunks, `auth`, ธง `tool_failed` และฟังก์ชัน `repair_fn` แล้วทดสอบทั้ง 4 กรณี: (1) ผ่านตั้งแต่รอบแรก, (2) ลืมใส่แท็กแต่ซ่อมผ่านใน 1 ครั้ง, (3) พยายามอ้าง chunk ของบริษัทอื่นและซ่อมไม่ผ่าน และ (4) Tool ล้มเหลวตั้งแต่ต้นทาง",
    steps: [
      {
        title: "1 · นิยามโมเดล `EvidenceChunk`, `AuthContext` และ `GateDecision`",
        explain:
          "กำหนดฟิลด์ `status`, `repair_attempted`, `fallback_reason` และ `citations` อย่างครบถ้วน",
        code: {
          language: "python",
          filename: "worked_citation_gate.py",
          code: `import re
from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")
NUMBER_RE = re.compile(r"\\d+")
SAFE_FALLBACK_TEXT = "ขออภัย ไม่สามารถยืนยันคำตอบจากหลักฐานที่ได้รับอนุญาตได้"

GateStatus = Literal["verified", "repaired", "abstain"]
FallbackReason = Literal[
    "none",
    "tool_failure",
    "no_allowed_evidence",
    "citation_verification_failed",
]


class AuthContext(BaseModel):
    model_config = ConfigDict(frozen=True)
    tenant_id: str


class EvidenceChunk(BaseModel):
    chunk_id: str
    tenant_id: str
    text: str


class GateDecision(BaseModel):
    status: GateStatus
    final_answer: str
    citations: list[str] = Field(default_factory=list)
    repair_attempted: bool = False
    fallback_reason: FallbackReason = "none"`,
        },
      },
      {
        title: "2 · เขียนฟังก์ชันตรวจ `verify_claim_text` และด่าน `run_citation_fallback_gate`",
        explain:
          "กรอง `allowed_map` ตาม `auth.tenant_id` ก่อนเสมอ ตรวจร่างแรก ถ้าไม่ผ่านให้เรียก `repair_fn` 1 ครั้งด้วย `allowed_map` แล้วนำผลที่ซ่อมแล้วมาตรวจด้วย `verify_claim_text` ซ้ำอีกครั้ง",
        code: {
          language: "python",
          filename: "worked_citation_gate.py",
          code: `def verify_claim_text(
    text: str,
    allowed_map: dict[str, str],
) -> tuple[bool, list[str], str]:
    lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]
    if not lines:
        return False, [], "empty_answer"

    collected: list[str] = []
    for line in lines:
        cites = CITATION_RE.findall(line)
        if not cites:
            return False, [], "missing_citation"
        if any(cid not in allowed_map for cid in cites):
            return False, [], "unauthorized_or_phantom_citation"

        clean_body = CITATION_RE.sub("", line)
        evidence_text = " ".join(allowed_map[cid] for cid in cites)
        if not all(num in evidence_text for num in NUMBER_RE.findall(clean_body)):
            return False, [], "numeric_mismatch"

        for cid in cites:
            if cid not in collected:
                collected.append(cid)

    return True, collected, "verified"


def run_citation_fallback_gate(
    draft_answer: str,
    retrieved_chunks: list[EvidenceChunk],
    auth: AuthContext,
    repair_fn: Callable[[str, dict[str, str], str], str] | None = None,
    tool_failed: bool = False,
) -> GateDecision:
    if tool_failed:
        return GateDecision(
            status="abstain",
            final_answer=SAFE_FALLBACK_TEXT,
            fallback_reason="tool_failure",
        )

    allowed_map = {
        c.chunk_id: c.text
        for c in retrieved_chunks
        if c.tenant_id == auth.tenant_id
    }
    if not allowed_map:
        return GateDecision(
            status="abstain",
            final_answer=SAFE_FALLBACK_TEXT,
            fallback_reason="no_allowed_evidence",
        )

    ok, cites, reason = verify_claim_text(draft_answer, allowed_map)
    if ok:
        return GateDecision(
            status="verified",
            final_answer=draft_answer.strip(),
            citations=cites,
            repair_attempted=False,
        )

    if repair_fn is not None:
        repaired = repair_fn(draft_answer, allowed_map, reason)
        ok2, cites2, _ = verify_claim_text(repaired, allowed_map)
        if ok2:
            return GateDecision(
                status="repaired",
                final_answer=repaired.strip(),
                citations=cites2,
                repair_attempted=True,
            )
        return GateDecision(
            status="abstain",
            final_answer=SAFE_FALLBACK_TEXT,
            repair_attempted=True,
            fallback_reason="citation_verification_failed",
        )

    return GateDecision(
        status="abstain",
        final_answer=SAFE_FALLBACK_TEXT,
        repair_attempted=False,
        fallback_reason="citation_verification_failed",
    )`,
        },
      },
      {
        title: "3 · ทดสอบทั้ง 4 สถานการณ์บนเครื่อง",
        explain:
          "ดูการทำงานเมื่อคำตอบผ่านทันที, เมื่อซ่อม 1 ครั้งแล้วผ่าน, เมื่อพยายามซ่อมแต่ตัวเลขยังผิด และเมื่อ Tool ล้มเหลว",
        code: {
          language: "python",
          filename: "worked_citation_gate.py",
          code: `chunks = [
    EvidenceChunk(chunk_id="acme-pol#c01", tenant_id="acme_th", text="คืนเงินได้ภายใน 14 วันทำการ"),
    EvidenceChunk(chunk_id="beta-pol#c01", tenant_id="beta_th", text="คืนเงินได้ภายใน 60 วันทำการ"),
]
auth = AuthContext(tenant_id="acme_th")

d_ok = run_citation_fallback_gate(
    "คืนเงินได้ภายใน 14 วันทำการ [acme-pol#c01]", chunks, auth
)
d_repaired = run_citation_fallback_gate(
    "คืนเงินได้ภายใน 14 วันทำการ",
    chunks,
    auth,
    repair_fn=lambda draft, allowed, err: f"{draft} [{next(iter(allowed.keys()))}]",
)
d_fail_repair = run_citation_fallback_gate(
    "คืนเงินได้ภายใน 60 วันทำการ [beta-pol#c01]",
    chunks,
    auth,
    repair_fn=lambda draft, allowed, err: "คืนเงินได้ภายใน 60 วันทำการ [acme-pol#c01]",
)
d_tool_err = run_citation_fallback_gate("ข้อความใด ๆ", chunks, auth, tool_failed=True)

print("1. Direct verified:", d_ok.status, d_ok.citations)
print("2. Repaired once:", d_repaired.status, "| repair_attempted:", d_repaired.repair_attempted, "->", d_repaired.final_answer)
print("3. Failed repair (60 vs 14):", d_fail_repair.status, "| reason:", d_fail_repair.fallback_reason)
print("4. Tool failure:", d_tool_err.status, "| reason:", d_tool_err.fallback_reason)`,
        },
        output: `1. Direct verified: verified ['acme-pol#c01']
2. Repaired once: repaired | repair_attempted: True -> คืนเงินได้ภายใน 14 วันทำการ [acme-pol#c01]
3. Failed repair (60 vs 14): abstain | reason: citation_verification_failed
4. Tool failure: abstain | reason: tool_failure`,
      },
    ],
    gotcha:
      "สังเกตในเคสที่ 3 (`d_fail_repair`): แม้ `repair_fn` จะเปลี่ยนป้ายอ้างอิงจาก `[beta-pol#c01]` มาเป็น `[acme-pol#c01]` ที่อยู่ใน `allowed_map` แล้ว แต่เพราะเนื้อความยังคงเขียนว่า `'60 วันทำการ'` (ซึ่งไม่มีเลข 60 ใน `acme-pol#c01`) การตรวจซ้ำ (`Re-verify`) จึงจับ `numeric_mismatch` ได้และตัดเข้า `abstain` อย่างปลอดภัย!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `citation_fallback.py` ที่มี `verify_claim_text` และ `run_citation_fallback_gate` พร้อมเขียนชุดทดสอบ `test_citation_fallback.py`",
    requirements: [
      "รับร่างคำตอบ `draft_answer`, รายการ `retrieved_chunks: list[EvidenceChunk]` และ `auth: AuthContext` จากบริบทที่เชื่อถือได้",
      "หาก `tool_failed=True` ให้คืน `status=\"abstain\"` พร้อม `fallback_reason=\"tool_failure\"` ทันที และหากไม่มี chunk ที่ตรงกับ `auth.tenant_id` เลยให้คืน `fallback_reason=\"no_allowed_evidence\"`",
      "สกัดป้าย `[doc_id#chunk]` จากทุกบรรทัดของคำตอบ ตรวจว่าทุกป้ายอยู่ใน `allowed_map` ของ `auth.tenant_id` และตัวเลขทุกตัวในประโยค (หลังลบป้ายอ้างอิงแล้ว) ปรากฏอยู่ในข้อความของ chunk ที่อ้าง",
      "เมื่อร่างคำตอบแรกไม่ผ่านและมี `repair_fn` ให้เรียก `repair_fn(draft_answer, allowed_map, reason)` เพียง 1 ครั้งโดยส่งเฉพาะ `allowed_map` ของ tenant นั้น แล้วนำคำตอบที่ซ่อมแล้วมาตรวจซ้ำด้วย `verify_claim_text` หากยังไม่ผ่านให้คืน `status=\"abstain\"` พร้อม `fallback_reason=\"citation_verification_failed\"`",
      "เขียน `test_citation_fallback.py` ทดสอบครบทั้งกรณี citation ถูกต้อง, ไม่มี citation, ข้าม tenant, repair สำเร็จ, repair ล้มเหลว และกรณี tool ล้มเหลว",
    ],
    starter: {
      language: "python",
      filename: "citation_fallback.py",
      code: `import re
from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")
NUMBER_RE = re.compile(r"\\d+")
SAFE_FALLBACK_TEXT = "ขออภัย ไม่สามารถยืนยันคำตอบจากหลักฐานที่ได้รับอนุญาตได้"

GateStatus = Literal["verified", "repaired", "abstain"]
FallbackReason = Literal[
    "none",
    "tool_failure",
    "no_allowed_evidence",
    "citation_verification_failed",
]


class AuthContext(BaseModel):
    model_config = ConfigDict(frozen=True)
    tenant_id: str


class EvidenceChunk(BaseModel):
    chunk_id: str
    tenant_id: str
    text: str


class GateDecision(BaseModel):
    status: GateStatus
    final_answer: str
    citations: list[str] = Field(default_factory=list)
    repair_attempted: bool = False
    fallback_reason: FallbackReason = "none"


def verify_claim_text(
    text: str,
    allowed_map: dict[str, str],
) -> tuple[bool, list[str], str]:
    """ตรวจว่าทุกบรรทัดมีป้าย [doc_id#chunk] ที่อยู่ใน allowed_map และตัวเลขตรงตามหลักฐาน"""
    # TODO: implement citation & numeric verification
    raise NotImplementedError


def run_citation_fallback_gate(
    draft_answer: str,
    retrieved_chunks: list[EvidenceChunk],
    auth: AuthContext,
    repair_fn: Callable[[str, dict[str, str], str], str] | None = None,
    tool_failed: bool = False,
) -> GateDecision:
    """ตรวจ citation, ลอง repair 1 ครั้งด้วยหลักฐานที่อนุญาต และ abstain เมื่อไม่ผ่านหรือ tool ล้มเหลว"""
    # TODO: implement gate with single-shot repair and re-verification
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`allowed_map` ที่ส่งเข้า `repair_fn` มีเฉพาะ chunks ของ `auth.tenant_id` เท่านั้นใช่หรือไม่?",
      "ผลลัพธ์ที่ได้จาก `repair_fn` ถูกส่งเข้า `verify_claim_text(repaired, allowed_map)` ซ้ำอีกครั้งก่อนอนุญาตให้คืน `status=\"repaired\"` ใช่หรือไม่?",
      "เมื่อ `status == \"abstain\"` ค่า `final_answer` เป็น `SAFE_FALLBACK_TEXT` และ `citations == []` เสมอใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทุกกรณี (verified pass, missing citation abstain, cross-tenant citation blocked, single-shot repair pass, repair re-verification failure, tool failure fallback) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใน `verify_claim_text` แยกบรรทัดด้วย `lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]` ถ้า `not lines` ให้คืน `(False, [], \"empty_answer\")` ทันที",
      },
      {
        body: "อย่าลืมลบป้าย `[doc_id#chunk]` ออกจากบรรทัดด้วย `CITATION_RE.sub(\"\", line)` ก่อนสกัดตัวเลขด้วย `NUMBER_RE.findall(...)`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_citation_fallback.py`:",
        code: {
          language: "python",
          filename: "test_citation_fallback.py",
          code: `from citation_fallback import (
    AuthContext,
    EvidenceChunk,
    SAFE_FALLBACK_TEXT,
    run_citation_fallback_gate,
)

CHUNKS = [
    EvidenceChunk(
        chunk_id="acme-pol#c01",
        tenant_id="acme_th",
        text="คืนเงินได้ภายใน 14 วันทำการ สำหรับยอดไม่เกิน 5000 บาท",
    ),
    EvidenceChunk(
        chunk_id="beta-pol#c01",
        tenant_id="beta_th",
        text="คืนเงินได้ภายใน 60 วันทำการ",
    ),
]
AUTH_ACME = AuthContext(tenant_id="acme_th")


def test_valid_citation_passes_without_repair() -> None:
    res = run_citation_fallback_gate(
        "ลูกค้าขอคืนเงินได้ภายใน 14 วันทำการ [acme-pol#c01]",
        CHUNKS,
        AUTH_ACME,
    )
    assert res.status == "verified"
    assert res.citations == ["acme-pol#c01"]
    assert res.repair_attempted is False


def test_missing_or_cross_tenant_citation_fails_when_no_repair() -> None:
    no_cite = run_citation_fallback_gate("คืนเงินได้ภายใน 14 วันทำการ", CHUNKS, AUTH_ACME)
    assert no_cite.status == "abstain"
    assert no_cite.fallback_reason == "citation_verification_failed"
    assert no_cite.final_answer == SAFE_FALLBACK_TEXT

    cross_cite = run_citation_fallback_gate(
        "คืนเงินได้ภายใน 60 วันทำการ [beta-pol#c01]", CHUNKS, AUTH_ACME
    )
    assert cross_cite.status == "abstain"
    assert cross_cite.citations == []


def test_single_shot_repair_succeeds_and_only_sees_allowed_chunks() -> None:
    seen_keys: list[str] = []

    def repair_once(draft: str, allowed: dict[str, str], reason: str) -> str:
        seen_keys.extend(allowed.keys())
        return f"{draft} [acme-pol#c01]"

    res = run_citation_fallback_gate(
        "คืนเงินได้ภายใน 14 วันทำการ",
        CHUNKS,
        AUTH_ACME,
        repair_fn=repair_once,
    )
    assert res.status == "repaired"
    assert res.repair_attempted is True
    assert res.citations == ["acme-pol#c01"]
    assert seen_keys == ["acme-pol#c01"]


def test_repair_failure_and_tool_failure_abstain_safely() -> None:
    bad_repair = run_citation_fallback_gate(
        "คืนเงินได้ภายใน 99 วันทำการ",
        CHUNKS,
        AUTH_ACME,
        repair_fn=lambda d, a, r: "คืนเงินได้ภายใน 99 วันทำการ [acme-pol#c01]",
    )
    assert bad_repair.status == "abstain"
    assert bad_repair.repair_attempted is True
    assert bad_repair.fallback_reason == "citation_verification_failed"

    tool_err = run_citation_fallback_gate(
        "คืนเงินได้ภายใน 14 วันทำการ [acme-pol#c01]",
        CHUNKS,
        AUTH_ACME,
        tool_failed=True,
    )
    assert tool_err.status == "abstain"
    assert tool_err.fallback_reason == "tool_failure"

    no_ev = run_citation_fallback_gate(
        "ข้อความ",
        CHUNKS,
        AuthContext(tenant_id="unknown_tenant"),
    )
    assert no_ev.status == "abstain"
    assert no_ev.fallback_reason == "no_allowed_evidence"`,
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
      title: "ปล่อยคำตอบที่ได้จาก `repair_fn` ออกไปหาผู้ใช้ทันทีโดยไม่รัน `verify_claim_text` ซ้ำ",
      symptom:
        "เมื่อการซ่อมล้มเหลว (เช่น โมเดลยังใส่รหัสปลอมหรือตัวเลขยังผิด) คำตอบที่ผิดนั้นหลุดออกไปพร้อมสถานะ `repaired`",
      fix: "ต้องนำผลลัพธ์จาก `repair_fn` มารัน `verify_claim_text(repaired, allowed_map)` ซ้ำเสมอ หากไม่ผ่านต้องตัดเข้า `abstain`",
    },
    {
      title: "ส่ง `retrieved_chunks` ทั้งหมด (รวมของบริษัทอื่นที่อาจหลุดมา) เข้าไปให้ `repair_fn`",
      symptom:
        "ฟังก์ชันซ่อมคำตอบเห็นข้อความของบริษัทอื่นและนำมาเขียนเป็นคำตอบให้ผู้ใช้ปัจจุบัน",
      fix: "ส่งเฉพาะ `allowed_map` ที่กรอง `c.tenant_id == auth.tenant_id` แล้วเข้าไปใน `repair_fn` เท่านั้น",
    },
    {
      title: "เมื่อ `tool_failed=True` แล้วระบบยังคงพยายามรัน `repair_fn` หรือส่งร่างคำตอบที่โมเดลเดาเองออกไป",
      symptom:
        "เมื่อ MCP Tool ล่ม บอทแต่งสถานะออเดอร์มั่วส่งให้ลูกค้าแทนที่จะแจ้งเหตุขัดข้อง",
      fix: "ตรวจ `if tool_failed:` เป็นด่านแรกสุดและตัดเข้า `status=\"abstain\", fallback_reason=\"tool_failure\"` ทันที",
    },
    {
      title: "เมื่อตัดเข้า `status=\"abstain\"` แต่ยังคืน `final_answer = draft_answer`",
      symptom:
        "แม้สถานะใน JSON จะเป็น `abstain` แต่ข้อความที่แสดงบนหน้าจอแชตยังคงเป็นข้อความมั่วที่ตกด่านตรวจ",
      fix: "ทุกครั้งที่ `status == \"abstain\"` ต้องตั้ง `final_answer = SAFE_FALLBACK_TEXT` และ `citations = []` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d122-q1",
        "เมื่อร่างคำตอบแรกไม่ผ่านด่านตรวจ Citation แล้วระบบเรียก `repaired = repair_fn(draft, allowed_map, reason)` ขั้นตอนบังคับถัดไปก่อนส่งคำตอบให้ผู้ใช้คือข้อใด?",
        [
          ["ส่ง `repaired` ให้ผู้ใช้ทันทีเพราะถือว่าซ่อมเสร็จแล้ว", "ผิด — การซ่อมอาจยังไม่ผ่านเกณฑ์หรือแอบเปลี่ยนตัวเลขได้"],
          ["นำ `repaired` มารันผ่าน `verify_claim_text(repaired, allowed_map)` ซ้ำอีกครั้ง (Re-verification) หากผ่านจึงคืน `status=\"repaired\"` หากไม่ผ่านให้ตัดเข้า `status=\"abstain\"`", "ถูกต้อง — ห้ามปล่อยผลลัพธ์จากการซ่อมออกสู่ผู้ใช้โดยไม่ตรวจซ้ำด้วยมาตรฐานเดิมเด็ดขาด"],
          ["เรียก `repair_fn` ซ้ำไปเรื่อย ๆ จนกว่าจะครบ 50 รอบ", "ทำให้ Latency พุ่งและเสี่ยงค้างในลูป"],
          ["ลบป้าย `[doc_id#chunk]` ทั้งหมดทิ้งแล้วส่งให้ผู้ใช้", "ทำให้คำตอบไม่มีแหล่งอ้างอิง"],
        ],
        "B",
        "Re-verification หลังการซ่อมคือหัวใจที่ทำให้ Citation Verification Gate รับประกัน Faithfulness = 1.0 ได้อย่างแท้จริง",
        "ทำไมต้องรัน `verify_claim_text` ซ้ำอีกครั้งหลังจากเรียก `repair_fn`?",
        "เพื่อยืนยันว่าคำตอบที่ซ่อมแล้วมีป้ายอ้างอิงใน `allowed_map` และตัวเลขตรงตามหลักฐานจริง หากยังไม่ผ่านต้องตัดเข้า `abstain`",
      ),
      mc(
        "d122-q2",
        "เหตุใดพารามิเตอร์หลักฐานที่ส่งเข้าไปใน `repair_fn` จึงต้องเป็น `allowed_map` (ที่กรอง `c.tenant_id == auth.tenant_id` แล้ว) แทนที่จะส่ง `retrieved_chunks` ทั้งหมด?",
        [
          ["เพื่อรับประกันว่าขั้นตอนการซ่อมคำตอบจะเห็นและอ้างอิงได้เฉพาะหลักฐานที่ผู้เช่า (`tenant_id`) รายนั้นมีสิทธิ์เข้าถึงเท่านั้น ป้องกันการรั่วไหลของข้อมูลข้ามบริษัทระหว่างการซ่อม", "ถูกต้อง — Defense-in-Depth ต้องจำกัดขอบเขตข้อมูลในทุกขั้นตอนรวมถึงขั้นตอนการซ่อมคำตอบ"],
          ["เพราะ Python ไม่สามารถส่ง `list` เข้าฟังก์ชันได้", "Python ส่ง `list` เข้าฟังก์ชันได้ตามปกติ"],
          ["เพื่อบังคับให้ `repair_fn` คืนค่าว่างเสมอ", "เราต้องการให้ซ่อมสำเร็จเมื่อมีหลักฐานที่ถูกต้อง"],
          ["เพื่อเปลี่ยนภาษาไทยเป็นภาษาอังกฤษ", "ไม่เกี่ยวข้องกับการแปลภาษา"],
        ],
        "A",
        "การจำกัดให้ `repair_fn` เห็นเฉพาะ `allowed_map` ของ tenant ปัจจุบันป้องกันไม่ให้การซ่อมคำตอบหยิบข้อมูลข้ามผู้เช่ามาใช้",
        "ทำไมต้องส่งเฉพาะ `allowed_map` ของ Tenant ปัจจุบันเข้า `repair_fn`?",
        "เพื่อป้องกันไม่ให้ขั้นตอนการซ่อมคำตอบเข้าถึงหรืออ้างอิงเอกสารของบริษัทอื่น",
      ),
      mc(
        "d122-q3",
        "หากร่างคำตอบแรกคือ `'คืนเงินได้ภายใน 60 วันทำการ [beta-pol#c01]'` สำหรับผู้ใช้ `acme_th` (ซึ่งมีเฉพาะ `acme-pol#c01`: `'คืนเงินได้ภายใน 14 วันทำการ'`) และ `repair_fn` แค่เปลี่ยนป้ายเป็น `'คืนเงินได้ภายใน 60 วันทำการ [acme-pol#c01]'` ด่าน Re-verification จะตัดสินอย่างไร?",
        [
          ["ให้ผ่านเป็น `status=\"repaired\"` เพราะป้าย `[acme-pol#c01]` อยู่ใน `allowed_map` แล้ว", "ผิด — ตัวเลข 60 วันไม่ปรากฏในข้อความของ `acme-pol#c01` (14 วัน)"],
          ["ตีตกในการตรวจซ้ำเพราะพบ `numeric_mismatch` (เลข 60 ไม่อยู่ใน `acme-pol#c01`) และตัดเข้า `status=\"abstain\"`, `fallback_reason=\"citation_verification_failed\"`", "ถูกต้อง — การเปลี่ยนแค่ป้ายอ้างอิงโดยที่ตัวเลขข้อเท็จจริงยังผิดอยู่ต้องถูกบล็อกโดย Numeric Support Check"],
          ["แก้เลข 14 ในฐานข้อมูลให้เป็น 60 ตามคำตอบของโมเดล", "ห้ามแก้ข้อมูลต้นฉบับตามสิ่งที่โมเดลหลอน"],
          ["สลับ `tenant_id` ของผู้ใช้เป็น `beta_th`", "ละเมิดความปลอดภัยร้ายแรง"],
        ],
        "B",
        "ตัวอย่างนี้แสดงให้เห็นชัดเจนว่าทำไมต้องตรวจทั้ง Citation Membership (`cid in allowed_map`) และ Numeric Support (`num in evidence_text`) ควบคู่กัน",
        "ถ้า `repair_fn` แก้ป้าย `[doc_id#chunk]` ให้ถูกบริษัทแล้ว แต่ตัวเลขในประโยคยังเป็นตัวเลขของบริษัทอื่น ด่านตรวจซ้ำจะทำอย่างไร?",
        "ตีตกด้วย `numeric_mismatch` และตัดเข้า `status='abstain'` ทันที",
      ),
      mc(
        "d122-q4",
        "เมื่อต้นทางส่งธง `tool_failed=True` เข้ามายัง `run_citation_fallback_gate` ระบบควรทำอย่างไร?",
        [
          ["พยายามรัน `repair_fn` เพื่อแต่งคำตอบชดเชยข้อมูลจาก Tool ที่หายไป", "อันตราย — เมื่อ Tool ล้มเหลว ระบบไม่มีข้อมูลจริง การซ่อมคือการแต่งข้อมูลมั่ว"],
          ["ตัดจบเป็น `status=\"abstain\"`, `fallback_reason=\"tool_failure\"` และคืนข้อความ `SAFE_FALLBACK_TEXT` ทันทีโดยไม่รัน `repair_fn`", "ถูกต้อง — เมื่อแหล่งข้อมูลต้นทางล้มเหลว ต้อง Fail-Closed แจ้งเหตุขัดข้องอย่างปลอดภัยทันที"],
          ["คืน `status=\"verified\"` พร้อมสตริงว่าง", "ทำให้ผู้ใช้ได้กล่องข้อความว่างเปล่า"],
          ["โยน `ZeroDivisionError`", "ไม่ควรทำให้โปรแกรมแครช"],
        ],
        "B",
        "เมื่อเครื่องมือต้นทางล้มเหลว (`tool_failed=True`) ไม่มีหลักฐานที่เชื่อถือได้ให้ซ่อม จึงต้อง Short-Circuit เข้า Safe Abstention ทันที",
        "ทำไมเมื่อ `tool_failed=True` จึงต้องตัดเข้า `abstain` ทันทีโดยไม่เรียก `repair_fn`?",
        "เพราะเมื่อ Tool ล้มเหลวจะไม่มีข้อมูลจริงจากระบบต้นทาง การพยายามเขียนคำตอบต่อจะกลายเป็น Hallucination",
      ),
    ],
  },

  takeaways: [
    "**Tenant-Scoped `allowed_map`**: ด่านตรวจ Citation ขาออกต้องกรองเฉพาะ chunks ที่ `tenant_id == auth.tenant_id` ก่อนตรวจและก่อนส่งเข้าฟังก์ชันซ่อมเสมอ",
    "**Verify → Single-Shot Repair → Re-Verify**: คำตอบที่ผ่านการซ่อม 1 ครั้งต้องถูกตรวจซ้ำด้วยฟังก์ชัน `verify_claim_text` เดิมเสมอ",
    "**Fail-Closed Fallback**: เมื่อซ่อมไม่ผ่าน, ไม่มีหลักฐาน หรือ `tool_failed=True` ต้องคืน `status=\"abstain\"`, `final_answer=SAFE_FALLBACK_TEXT` และ `citations=[]`",
    "พรุ่งนี้ (Day 123) เราจะนำระบบทั้งหมดมาทดสอบแบบปูพรมด้วย **Integration Tests บน 15 คำถามลูกค้าภาษาไทยเสมือนจริง**!",
  ],

  reviewCards: [
    rc(
      "d122-rc1",
      "วงจร 3 จังหวะของ Citation Verification Gate ใน Day 122 คืออะไร?",
      "1) Verify Draft เทียบกับ `allowed_map` ของ tenant → 2) ถ้าตกเกณฑ์ให้เรียก Single-Shot `repair_fn` ด้วยหลักฐานที่อนุญาต → 3) Re-Verify คำตอบที่ซ่อมแล้วซ้ำอีกครั้งก่อนปล่อยผ่าน",
    ),
    rc(
      "d122-rc2",
      "ค่า `fallback_reason` ทั้ง 3 แบบเมื่อ `status == \"abstain\"` มีอะไรบ้างและเกิดเมื่อใด?",
      "`tool_failure` (เมื่อ `tool_failed=True`), `no_allowed_evidence` (เมื่อไม่มี chunk ของ tenant นั้นเลย), และ `citation_verification_failed` (เมื่อร่างคำตอบและ/หรือการซ่อมไม่ผ่านการตรวจ citation/ตัวเลข)",
    ),
    rc(
      "d122-rc3",
      "ทำไมจึงห้ามปล่อยผลลัพธ์จาก `repair_fn` ออกไปโดยไม่รัน `verify_claim_text` ซ้ำ?",
      "เพราะผลลัพธ์จากการซ่อมอาจยังคงขาดป้ายอ้างอิง อ้างรหัสปลอม หรือมีตัวเลขที่ไม่ตรงกับหลักฐาน (`numeric_mismatch`)",
    ),
    rc(
      "d122-rc4",
      "เมื่อ `GateDecision.status == \"abstain\"` ค่า `final_answer` และ `citations` ต้องเป็นอย่างไรเสมอ?",
      "`final_answer` ต้องเป็น `SAFE_FALLBACK_TEXT` (ห้ามปล่อยร่างคำตอบที่ตกเกณฑ์ออกไป) และ `citations` ต้องเป็นลิสต์ว่าง `[]`",
    ),
  ],

  sources: [
    {
      label: "Anthropic Docs — Grounded Citations & Post-Generation Verification",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/citations",
    },
    {
      label: "Anthropic Research — Building Effective Agents (Evaluator-Optimizer Pattern)",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
    {
      label: "Pydantic v2 Documentation — Strict Models & Type Validation",
      href: "https://docs.pydantic.dev/latest/concepts/models/",
    },
  ],

  glossary: ["groundedness", "abstention", "hallucination", "acl", "fail-fast", "pydantic"],
});
