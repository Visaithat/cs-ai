import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D165 — Phase 6 / Block B42
 * Implement Grounded Answer Generation with Strict Citations
 */
export const d165: Lesson = defineLesson({
  day: 165,
  titleTh: "สร้างชั้นตอบคำถามแบบอ้างอิงหลักฐานพร้อม Strict Citations และ Abstention",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · บังคับ LLM ตอบจากหลักฐาน Top-5 พร้อมเลข [doc_id#chunk] และปฏิเสธเมื่อไม่พบข้อมูล",
  icon: "shield-check",
  visual: {
    id: "capstone-core-router",
    title: "เส้นทางที่ 1 ของ Core Router — Grounded RAG Generation + Strict Citations",
    caption: "เจาะลึกเส้นทาง FAQ / Policy RAG: รับ Top-5 Chunks ที่ผ่าน ACL → บังคับอ้างอิง [doc_id#chunk] → ตรวจซ้ำด้วยโค้ดก่อนตอบหรือ Abstain",
    alt: "แผนภาพเส้นทาง FAQ RAG ของ LangGraph Router ที่สร้างคำตอบพร้อม strict citations และตัวตรวจหลักฐาน",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ด้วย mock/deterministic generator (สลับไปใช้ LLM API จริงผ่าน Callable ได้ทันที)",
  tools: ["Pydantic v2", "Hybrid RAG", "Strict Citations", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รับช่วงต่อจาก Hybrid Retrieval (Recall@5 >= 0.85) พร้อม ACL Filter",
      body: "ใน Milestone 2 เราพิสูจน์แล้วว่า {{bm25}} + Dense + {{reranker}} ดึงเอกสารที่ถูกต้องมาอยู่ใน Top-5 ได้เกิน 85% แต่เอกสารดีแค่ไหนก็ไร้ค่าหากชั้นสร้างคำตอบยังแต่งเรื่องเพิ่มเอง",
      lessonNote: "วันนี้เรานำ Top-5 chunks ที่ผ่าน {{acl}} แล้วมาจัดรูปแบบเป็น Context Block ที่มีรหัสอ้างอิงชัดเจนก่อนส่งให้ {{llm}}",
    },
    {
      node: 2,
      heading: "บังคับ Structured Output และ Groundedness ด้วย Schema + Code Verifier",
      body: "การบอกใน prompt ว่า *\"ห้ามมั่ว\"* อย่างเดียวไม่พอ เพราะโมเดลยังอาจอ้างอิงเลข chunk ที่ไม่มีอยู่จริงหรือตอบโดยไม่มีหลักฐานรองรับ",
      lessonNote: "เราสร้าง {{pydantic}} {{structured-output}} (`GroundedAnswer`) คู่กับตัวตรวจ `verify_citations` ที่ตรวจจับ citation ปลอมแบบ {{fail-fast}}",
    },
    {
      node: 3,
      heading: "ล็อกเกณฑ์ Faithfulness >= 0.85 และ Abstention >= 0.90",
      body: "เมื่อคำถามอยู่นอกเหนือเอกสารองค์กรหรือคะแนนความเกี่ยวข้องต่ำเกินไป ระบบต้องกล้าปฏิเสธอย่างซื่อสัตย์ ({{abstention}}) แทนที่จะเดาคำตอบ",
      lessonNote: "โค้ดวันนี้วางรากฐานเพื่อให้ผ่านเกณฑ์ {{ragas}} Faithfulness และชุดคำถาม Unanswerable ใน {{golden-dataset}} ของ B43",
    },
    {
      node: 4,
      heading: "ส่งออกคำตอบที่มีสัญญาข้อมูลชัดเจนเข้าสู่ LangGraph Router",
      body: "ทุกคำตอบที่ออกจากชั้น Generation ต้องมีสถานะชัดเจน (`answered` หรือ `abstained`) เพื่อให้ชั้น Router ตัดสินใจได้ว่าควรแสดงผลต่อผู้ใช้หรือส่งต่อเจ้าหน้าที่",
      lessonNote: "โมดูล `grounded_generator.py` วันนี้จะกลายเป็นโหนด `faq_rag` ตัวจริงใน {{langgraph}} Router ของ Day 167",
    },
  ],

  objectives: [
    "**ออกแบบ Context Packing และ Prompt Guard** ที่ติดป้ายรหัส `[doc_id#chunk_id]` ให้หลักฐานทุกชิ้นและสั่งให้โมเดลอ้างอิงเฉพาะข้อมูลที่เห็นจริง",
    "**บังคับ {{structured-output}} ด้วย {{pydantic}}** และเขียนตัวตรวจจับ Citation ปลอม (Hallucinated Citation Verifier) เพื่อไม่ให้เลขเอกสารที่ไม่มีอยู่จริงหลุดถึงผู้ใช้",
    "**สร้างตรรกะ Calibrated {{abstention}}** ที่ปฏิเสธคำตอบอย่างสุภาพเมื่อไม่มีหลักฐาน คะแนน retrieval ต่ำกว่าเกณฑ์ หรือคำตอบไม่มี citation รองรับ",
  ],

  prerequisites: [
    "ผ่าน Milestone 2 Retrieval Benchmark (`Recall@5 >= 0.85`) และเข้าใจโครงสร้าง Chunk ID จาก D161–D164",
    "ใช้งาน {{pydantic}} `BaseModel`, `Literal` และ `@field_validator` ได้คล่อง",
    "เข้าใจแนวคิด {{groundedness}} และ {{hallucination}} จาก Phase 4",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "ทำงานต่อในโฟลเดอร์โปรเจกต์ `thai-enterprise-assistant/` เพื่อเพิ่มโมดูลสร้างคำตอบแบบอ้างอิงหลักฐานและชุดทดสอบใน `tests/`",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p src tests
uv add pydantic
uv add --dev pytest ruff
uv run pytest --version`,
    steps: [
      ["dir", "ตรวจว่าอยู่ในโฟลเดอร์โปรเจกต์ Capstone ที่มี `src/` และ `tests/`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` เรียบร้อย"],
      ["ready", "พร้อมสร้าง `src/grounded_generator.py` และทดสอบแบบ offline 100%"],
    ],
    note: "ฟังก์ชันเรียกโมเดลถูกออกแบบเป็น `Callable` ที่รับ prompt และคืน JSON/dict คุณจึงรันเทสต์ด้วย mock แบบ deterministic ได้ทันที และเสียบ OpenAI/Anthropic/Ollama จริงได้ภายหลังโดยไม่ต้องแก้ตรรกะตรวจ citation",
  },

  concepts: [
    {
      id: "context-packing-and-citations",
      title: "1 · Context Packing & Strict Citation Protocol",
      paragraphs: [
        "ปัญหาหลักของการสร้างคำตอบใน {{rag}} ไม่ใช่แค่โมเดลไม่รู้คำตอบ แต่คือการที่โมเดล **ผสมความรู้เดิมในหัวเข้ากับเอกสารบริษัท** จนผู้ใช้แยกไม่ออกว่าประโยคไหนมาจากนโยบายจริงและประโยคไหนโมเดลเดาเอง (เช่น กฎคืนเงิน 7 วันของบริษัทอื่นปนกับ 14 วันของบริษัทเรา)",
        "วิธีแก้ระดับ {{context-engineering}} คือการแพ็กเอกสาร Top-5 จาก Hybrid Search ให้อยู่ในรูปแบบที่อ้างอิงได้ชัดเจน โดยติดรหัสประจำชิ้นแบบไม่ซ้ำกัน เช่น `[pol-refund#2]` หรือ `[fee-table#4]` พร้อมระบุหัวข้อเอกสารและสิทธิ์ {{acl}} จากนั้นสั่งให้โมเดลอ้างอิงรหัสนั้นคู่กับทุกข้อเท็จจริง",
        "นอกจากนี้ ควรจัดลำดับหลักฐานที่คะแนนสูงสุดไว้ที่ **ด้านบนสุดและด้านล่างสุด** ของ context block (หรือเรียงตามความสำคัญชัดเจน) และระบุคำสั่งบังคับซ้ำท้าย prompt เพื่อลดอาการ *Lost in the Middle* เมื่อเอกสารภาษาไทยมีความยาวหลายย่อหน้า",
      ],
      analogy:
        "เหมือนการเขียนรายงานสรุปคดีให้ผู้พิพากษา — ทุกประโยคที่ทนายอ้างว่า 'สัญญาอนุญาตให้คืนเงินภายใน 14 วัน' ต้องมีวงเล็บแนบเลขหน้าหลักฐาน `[เอกสาร-A#หน้า2]` กำกับไว้ ถ้าไม่มีเลขหลักฐานห้ามเขียนลงในคำให้การ",
      code: {
        language: "python",
        filename: "context_packing.py",
        code: `def pack_evidence_context(query: str, chunks: list[dict]) -> str:
    evidence_lines = [
        f"[{c['chunk_id']}] ({c['doc_title']}): {c['text']}"
        for c in chunks
    ]
    evidence_block = "\\n".join(evidence_lines)
    return (
        "ตอบจาก <evidence> เท่านั้น และระบุ [chunk_id] ทุกข้อเท็จจริง "
        "หากไม่มีข้อมูลให้ตั้ง status='abstained'\\n"
        f"<evidence>\\n{evidence_block}\\n</evidence>\\n"
        f"คำถาม: {query}"
    )`,
        caption: "ติดป้าย [chunk_id] ให้หลักฐานทุกชิ้นและล้อมด้วย <evidence> เพื่อแยกข้อมูลออกจากคำสั่งอย่างชัดเจน",
      },
      bullets: [
        "**Stable Citation ID**: ใช้รูปแบบ `[doc_id#chunk_id]` ตรงตามดัชนีใน Vector/BM25 เพื่อให้ตรวจสอบย้อนหลังและคลิกเปิดดูต้นฉบับใน UI ได้",
        "**Evidence Boundary**: แยกข้อความหลักฐานออกจากคำถามผู้ใช้ด้วย tag ชัดเจน (เช่น `<evidence>...</evidence>`) เพื่อช่วยลดความเสี่ยงจาก {{prompt-injection}} ที่อาจแฝงอยู่ในเอกสาร",
        "**No Parametric Guessing**: สั่งชัดเจนว่าหากหลักฐานไม่มีตัวเลข วันที่ หรือเงื่อนไขที่ถาม ให้เปลี่ยนสถานะเป็น `abstained` ห้ามคาดเดา",
      ],
      whyTitle: "Why this matters — ผู้ใช้และผู้ตรวจสอบต้องการคลิกเช็กต้นฉบับได้ทันที",
      whyParagraphs: [
        "ในองค์กรไทย พนักงานซัพพอร์ตไม่กล้าเอาคำตอบจาก AI ไปตอบลูกค้าถ้าไม่เห็นว่ามาจากประกาศฉบับไหนและข้อใด การแนบ `[pol-refund#2]` พร้อมข้อความอ้างอิงจริงเปลี่ยนแชตบอตจาก 'กล่องดำ' ให้เป็นเครื่องมือทำงานที่ตรวจสอบได้",
        "ยิ่งไปกว่านั้น Strict Citation ยังช่วยให้ทีมประเมินค่า {{ragas}} Faithfulness ใน B43 ได้แม่นยำขึ้นมาก เพราะข้อความตอบและข้อความอ้างอิงถูกจับคู่กันมาแล้ว",
      ],
    },
    {
      id: "schema-and-citation-verifier",
      title: "2 · บังคับสัญญาด้วย Pydantic Schema + Deterministic Citation Verifier",
      paragraphs: [
        "แม้เราจะเขียน System Prompt อย่างรัดกุม แต่ {{llm}} ก็ยังมีโอกาส **หลอนเลข Citation** (เช่น อ้าง `[pol-refund#99]` ทั้งที่ส่งเข้าไปแค่ `#1` กับ `#2`) หรือส่ง `status=\"answered\"` แต่ลืมใส่รายการ `citations` มาด้วย หากเชื่อผลลัพธ์ของโมเดลตรง ๆ ระบบก็จะส่งคำตอบลอย ๆ กลับไปหาลูกค้า",
        "เราจึงสร้างด่านป้องกันสองชั้น: ชั้นแรกคือ {{pydantic}} {{structured-output}} (`GroundedAnswer`) ที่บังคับโครงสร้างด้วย `Literal[\"answered\", \"abstained\"]`, `answer_th`, `citations` และ `@field_validator` ตรวจสอบความสอดคล้องภายในตัวโมเดลเอง",
        "ชั้นที่สองคือ **Deterministic Citation Verifier** ฝั่งโค้ด Python ที่รับ `GroundedAnswer` มาเทียบกับ `retrieved_chunks` จริง: ทุก `chunk_id` ที่โมเดลอ้างต้องมีอยู่ในชุดหลักฐานที่ดึงมาในรอบนั้นจริง (`cited_ids <= allowed_ids`) หากพบ citation ปลอม ระบบต้อง {{fail-fast}} ปฏิเสธหรือปรับเป็น `abstained` ทันที",
      ],
      analogy:
        "Pydantic Schema เหมือนด่านตรวจว่าผู้สมัครกรอกแบบฟอร์มครบทุกช่องไหม ส่วน Citation Verifier เหมือนเจ้าหน้าที่เอาเลขบัตรอ้างอิงที่กรอกไปเปิดเทียบกับแฟ้มเอกสารตัวจริงบนโต๊ะว่ามีใบนั้นอยู่จริงหรือเปล่า",
      code: {
        language: "python",
        filename: "citation_verifier.py",
        code: `from typing import Literal
from pydantic import BaseModel, Field, model_validator


class Citation(BaseModel):
    chunk_id: str = Field(min_length=3)
    quote: str = Field(min_length=5)


class GroundedAnswer(BaseModel):
    status: Literal["answered", "abstained"]
    answer_th: str = Field(min_length=5)
    citations: list[Citation] = Field(default_factory=list)
    abstain_reason: str | None = None

    @model_validator(mode="after")
    def check_citation_consistency(self) -> "GroundedAnswer":
        if self.status == "answered" and not self.citations:
            raise ValueError("answered response must include at least 1 citation")
        if self.status == "abstained" and self.citations:
            raise ValueError("abstained response must not include citations")
        return self


def verify_citations_exist(ans: GroundedAnswer, allowed_chunk_ids: set[str]) -> bool:
    return all(c.chunk_id in allowed_chunk_ids for c in ans.citations)`,
        caption: "แยกความถูกต้องของโครงสร้าง (Schema Validator) ออกจากการตรวจเทียบกับหลักฐานจริง (Deterministic Verifier)",
      },
      whyTitle: "Why this matters — ทำให้ Schema Pass Rate >= 99% และ Groundedness ตรวจสอบได้",
      whyParagraphs: [
        "Capstone Rubric กำหนดให้ `Schema Pass Rate >= 99%` และห้ามปล่อยคำตอบที่มีเลขเอกสารปลอมออกไป การมี Verifier ที่ทำงานในเวลา < 1 มิลลิวินาทีช่วยปิดช่องโหว่นี้ได้อย่างสมบูรณ์โดยไม่ต้องเสียค่าเรียก LLM ซ้ำในกรณีง่าย ๆ",
        "เมื่อระบบตรวจพบ hallucinated citation เราสามารถบันทึกเหตุการณ์ไว้ตรวจ error analysis และส่งเข้า retry loop หรือ fallback ไปยังเจ้าหน้าที่อย่างปลอดภัย",
      ],
    },
    {
      id: "calibrated-abstention",
      title: "3 · Calibrated Abstention: ปฏิเสธเมื่อควรปฏิเสธ ไม่ใช่ปฏิเสธพร่ำเพรื่อ",
      paragraphs: [
        "อาการหลอนมักเกิดหนักที่สุดเมื่อผู้ใช้ถามเรื่องที่ **ไม่มีอยู่ในคลังเอกสารเลย** (เช่น *\"บริษัทมีโปรผ่อน 0% กับบัตรธนาคาร X เดือนหน้าไหม\"*) หรือถามเรื่องที่ระบบค้นเจอเอกสารที่คะแนน {{reranker}} ต่ำมาก (เช่น `score < 0.35`) ในสถานการณ์นี้ ต่อให้ LLM พยายามช่วยแค่ไหนก็ทำได้แค่เดา",
        "**Calibrated {{abstention}}** คือการออกแบบ 2 กลไกควบคู่กัน: (1) **Pre-Generation Gate** ฝั่งโค้ด Python — หาก `retrieved_chunks` ว่างเปล่า หรือคะแนนสูงสุดต่ำกว่า `min_score` ให้ข้ามการเรียก LLM ไปเลยแล้วคืนคำตอบปฏิเสธมาตรฐานทันที ประหยัดทั้งเวลาและค่า token และ (2) **In-Prompt Abstention** — เมื่อมี chunk ผ่านเกณฑ์คะแนนเข้ามา แต่เนื้อหาข้างในไม่ตอบคำถามที่ถามจริง โมเดลต้องตั้ง `status=\"abstained\"` พร้อมระบุ `abstain_reason` ชัดเจน",
        "จุดสมดุลสำคัญคือคำว่า **Calibrated** (ตั้งค่าพอดี): หากตั้ง `min_score` สูงเกินไป ระบบจะปฏิเสธคำถามที่ตอบได้จริงจนลูกค้าหงุดหงิด แต่ถ้าต่ำเกินไป เอกสารคนละเรื่องจะไหลเข้าไปหลอกให้โมเดลตอบผิด — ค่าเกณฑ์นี้จึงต้องปรับเทียบกับ {{golden-dataset}} เสมอ",
      ],
      analogy:
        "เหมือนแพทย์ห้องฉุกเฉิน: ถ้าผลตรวจเลือดยังไม่มีเลย (Pre-Generation Gate) ก็ไม่ต้องเสียเวลาวินิจฉัย ให้สั่งตรวจเพิ่มหรือส่งแพทย์เฉพาะทางทันที แต่ถ้ามีผลตรวจแล้วยังไม่ชัด (In-Prompt Abstention) ก็ต้องบอกคนไข้ตรง ๆ ว่ายังไม่สรุป ไม่ใช่เดาโรคให้",
      bullets: [
        "**Pre-Generation Gate**: `chunks == []` หรือ `max(c.score) < min_score` → ไม่ยิง LLM คืน `status=\"abstained\"` ทันที (`0 ms` LLM latency)",
        "**Abstention Copy ที่ดี**: บอกชัดว่าไม่พบข้อมูลอะไร แนะนำขอบเขตที่ช่วยได้ หรือชี้ทางส่งต่อเจ้าหน้าที่ (Escalate)",
        "**Capstone Target**: กลุ่มคำถาม Unanswerable ในชุดประเมินต้องปฏิเสธได้ถูกต้อง `>= 90%` โดยไม่ทำลายคะแนนของคำถามที่ตอบได้จริง",
      ],
      whyTitle: "Why this matters — ระบบที่รู้จักคำว่า 'ไม่ทราบ' คือกุญแจความน่าเชื่อถือระดับ Enterprise",
      whyParagraphs: [
        "ผู้บริหารและลูกค้าองค์กรยอมรับได้ถ้าระบบตอบว่า *\"ไม่พบเงื่อนไขดังกล่าวในนโยบายปัจจุบัน ขอส่งต่อเจ้าหน้าที่\"* แต่จะหยุดใช้งานทันทีถ้าระบบแต่งโปรโมชันหรือเงื่อนไขคืนเงินปลอมขึ้นมา 1 ครั้ง",
        "Pre-Generation Abstention ยังช่วยประหยัดต้นทุน API และลด {{ttft}} สำหรับคำถามนอกเรื่องได้ทันทีอีกด้วย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Grounded Generation เหมือน Template Rendering ที่ตรวจ Foreign Key",
      body: [
        "ในเว็บ Backend คุณไม่มีทางปล่อยให้ Frontend แสดงลิงก์ `/docs/999` ที่ไม่มีอยู่จริงในฐานข้อมูล — Citation Verifier ใน RAG ทำหน้าที่เหมือน **Foreign Key Check** ก่อนส่ง JSON กลับไปให้ Client:",
      ],
      table: [
        ["Context Packing (`[doc_id#chunk]`)", "ส่ง ViewModel พร้อม primary key ที่อนุญาตเข้า template"],
        ["Pydantic `GroundedAnswer`", "Response DTO Schema Validation ก่อน serialize JSON"],
        ["Citation Verifier (`cited <= allowed`)", "Foreign-Key Integrity Check ป้องกัน ID ปลอม"],
        ["Pre-Generation Abstention Gate", "Early Return `404 / Empty State` เมื่อ Query DB ไม่เจอข้อมูล"],
      ],
    },
    student: {
      title: "First-Year Note — Set Subset (`<=`) กับการเช็กความถูกต้องใน 1 บรรทัด",
      body: [
        "ใน Python โครงสร้าง `set` ช่วยตรวจว่าทุก citation ที่โมเดลอ้างอยู่ในกลุ่มเอกสารที่ส่งเข้าไปจริงได้ง่ายมากด้วยตัวดำเนินการ `<=` (`issubset`) เช่น `cited_ids <= allowed_ids`",
        "ถ้าโมเดลอ้าง `{\"pol-refund#2\"}` และเอกสารที่ดึงมาคือ `{\"pol-refund#1\", \"pol-refund#2\"}` ผลลัพธ์จะเป็น `True` ทันที แต่ถ้าโมเดลแอบแต่ง `{\"pol-refund#9\"}` ขึ้นมา เซตย่อยจะกลายเป็น `False` ทันที ทำให้เราดักจับ hallucination ได้ด้วยโค้ดที่อ่านง่ายและเร็วมาก",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองสร้างท่อ Grounded Answer Generation ที่รับผลจาก Hybrid Retrieval แล้วทดสอบทั้ง 3 กรณี: (1) ตอบพร้อม citation ที่ถูกต้อง, (2) จับโมเดลที่หลอน citation ปลอม, และ (3) ปฏิเสธคำตอบ (Abstention) เมื่อคะแนน retrieval ต่ำกว่าเกณฑ์ กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · สร้าง Evidence Formatter และ Data Contract (`GroundedAnswer`)",
        explain:
          "แพ็กเอกสาร Top-k ให้มีป้ายกำกับ `[chunk_id]` ชัดเจน และนิยาม Pydantic model ที่บังคับให้คำตอบแบบ `answered` ต้องมีอย่างน้อย 1 citation เสมอ",
        code: {
          language: "python",
          filename: "worked_grounded.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field, model_validator


class Chunk(BaseModel):
    chunk_id: str
    doc_title: str
    text: str
    score: float


class Citation(BaseModel):
    chunk_id: str
    quote: str = Field(min_length=4)


class GroundedAnswer(BaseModel):
    status: Literal["answered", "abstained"]
    answer_th: str
    citations: list[Citation] = Field(default_factory=list)
    abstain_reason: str | None = None

    @model_validator(mode="after")
    def validate_rules(self) -> "GroundedAnswer":
        if self.status == "answered" and not self.citations:
            raise ValueError("answered status requires at least one citation")
        if self.status == "abstained" and self.citations:
            raise ValueError("abstained status must have empty citations")
        return self


def format_evidence(chunks: list[Chunk]) -> str:
    lines = [f"[{c.chunk_id}] ({c.doc_title}): {c.text}" for c in chunks]
    return "<evidence>\\n" + "\\n".join(lines) + "\\n</evidence>"`,
        },
      },
      {
        title: "2 · เขียนตัวตรวจ Citation Verifier และ Pre-Generation Abstention",
        explain:
          "ก่อนเรียก LLM ให้เช็กก่อนว่ามี chunk และคะแนนสูงสุดถึงเกณฑ์ `min_score` หรือไม่ และหลังได้ผลจาก LLM ให้ตรวจว่าทุก `chunk_id` ที่อ้างอยู่ใน `allowed_ids` จริง",
        code: {
          language: "python",
          filename: "worked_grounded.py",
          code: `def run_grounded_generation(
    query: str,
    chunks: list[Chunk],
    mock_llm_payload: dict | None,
    min_score: float = 0.35,
) -> GroundedAnswer:
    if not chunks or max(c.score for c in chunks) < min_score:
        return GroundedAnswer(
            status="abstained",
            answer_th="ไม่พบข้อมูลที่เพียงพอในเอกสารองค์กร กรุณาติดต่อเจ้าหน้าที่เพิ่มเติม",
            abstain_reason="no_relevant_evidence",
        )

    assert mock_llm_payload is not None
    ans = GroundedAnswer.model_validate(mock_llm_payload)
    allowed_ids = {c.chunk_id for c in chunks}
    cited_ids = {cit.chunk_id for cit in ans.citations}

    if not cited_ids.issubset(allowed_ids):
        bad = sorted(cited_ids - allowed_ids)
        return GroundedAnswer(
            status="abstained",
            answer_th="ระบบตรวจพบการอ้างอิงเอกสารที่ไม่ตรงกับหลักฐาน จึงขอระงับคำตอบเพื่อความปลอดภัย",
            abstain_reason=f"hallucinated_citations:{','.join(bad)}",
        )
    return ans`,
        },
      },
      {
        title: "3 · ทดสอบทั้ง Happy Path, Hallucinated Citation และ Low-Score Abstention",
        explain:
          "รันจำลองทั้ง 3 สถานการณ์บนเครื่อง — สังเกตว่าเคสที่โมเดลหลอนอ้าง `[pol-refund#99]` ถูกกั้นและแปลงเป็น `abstained` ก่อนถึงผู้ใช้ทันที",
        code: {
          language: "python",
          filename: "worked_grounded.py",
          code: `chunks = [
    Chunk(chunk_id="pol-refund#2", doc_title="นโยบายคืนสินค้า", text="สินค้าอิเล็กทรอนิกส์คืนได้ภายใน 14 วันหากยังไม่แกะซีล", score=0.88),
]

ok = run_grounded_generation(
    "คืนสินค้าอิเล็กทรอนิกส์ได้กี่วัน",
    chunks,
    {
        "status": "answered",
        "answer_th": "คืนได้ภายใน 14 วันหากยังไม่แกะซีล [pol-refund#2]",
        "citations": [{"chunk_id": "pol-refund#2", "quote": "คืนได้ภายใน 14 วันหากยังไม่แกะซีล"}],
    },
)
fake = run_grounded_generation(
    "คืนสินค้าได้กี่วัน",
    chunks,
    {
        "status": "answered",
        "answer_th": "คืนได้ภายใน 30 วัน [pol-refund#99]",
        "citations": [{"chunk_id": "pol-refund#99", "quote": "คืนได้ภายใน 30 วัน"}],
    },
)
low = run_grounded_generation("มีโปรบัตรเครดิตเดือนหน้าไหม", [], None)

print("1. OK  :", ok.status, "| cites:", [c.chunk_id for c in ok.citations])
print("2. FAKE:", fake.status, "| reason:", fake.abstain_reason)
print("3. LOW :", low.status, "| reason:", low.abstain_reason)`,
        },
        output: `1. OK  : answered | cites: ['pol-refund#2']
2. FAKE: abstained | reason: hallucinated_citations:pol-refund#99
3. LOW : abstained | reason: no_relevant_evidence`,
      },
    ],
    gotcha:
      "จุดสังเกต: แม้โมเดลจะใส่ `[pol-refund#2]` อยู่ในข้อความ `answer_th` แต่ลืมใส่ลงในลิสต์ `citations` หรือใส่รหัสที่ไม่มีใน `chunks` ถ้าไม่บังคับตรวจทั้งสองอย่างในโค้ด UI ของคุณอาจแสดงคำตอบที่คลิกดูหลักฐานไม่ได้เลย",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/grounded_generator.py` สำหรับ Capstone เพื่อจัดการ Context Packing, Schema Validation, Citation Verification และ Calibrated Abstention แบบ deterministic 100%",
    requirements: [
      "สร้าง `EvidenceChunk(BaseModel)` (`chunk_id: str`, `doc_title: str`, `text: str`, `score: float` ระหว่าง `0.0..1.0`) และ `CitationItem(BaseModel)` (`chunk_id: str`, `quote: str` ยาว >= 4)",
      "สร้าง `GroundedResponse(BaseModel)` มีฟิลด์ `status: Literal[\"answered\", \"abstained\"]`, `answer_th: str` (ยาว >= 5), `citations: list[CitationItem]`, `abstain_reason: str | None = None`, และ `verified: bool = True` พร้อม `@model_validator` ที่บังคับว่า `answered` ต้องมีอย่างน้อย 1 citation และ `abstained` ต้องไม่มี citation (`citations == []`)",
      "สร้าง `build_grounded_prompt(query: str, chunks: list[EvidenceChunk]) -> str` ที่จัดเรียงหลักฐานเป็นแท็ก `<evidence>` โดยแสดง `[chunk_id]` ครบทุกชิ้นที่ส่งเข้ามา และมีคำถาม `query` อยู่ใน prompt",
      "สร้าง `generate_grounded_answer(query: str, chunks: list[EvidenceChunk], llm_fn: Callable[[str], dict], min_score: float = 0.35) -> GroundedResponse`: (a) ถ้า `chunks` ว่าง หรือ `max(c.score for c in chunks) < min_score` ให้คืน `status=\"abstained\"`, `abstain_reason=\"insufficient_evidence\"` โดย **ไม่เรียก** `llm_fn`, (b) เรียก `llm_fn(prompt)` แล้ว validate ด้วย `GroundedResponse`, (c) ตรวจว่าทุก `chunk_id` ใน `citations` ต้องมีอยู่ใน `chunks` และข้อความ `answer_th` เมื่อเป็น `answered` ต้องอ้างอิง `[chunk_id]` อย่างน้อย 1 รหัสในคำตอบ — หากไม่ผ่านให้คืน `status=\"abstained\"`, `verified=False`, `abstain_reason=\"ungrounded_citation\"`",
    ],
    starter: {
      language: "python",
      filename: "src/grounded_generator.py",
      code: `from typing import Callable, Literal
from pydantic import BaseModel, Field, model_validator


class EvidenceChunk(BaseModel):
    chunk_id: str = Field(min_length=2)
    doc_title: str = Field(min_length=1)
    text: str = Field(min_length=1)
    score: float = Field(ge=0.0, le=1.0)


class CitationItem(BaseModel):
    chunk_id: str = Field(min_length=2)
    quote: str = Field(min_length=4)


class GroundedResponse(BaseModel):
    status: Literal["answered", "abstained"]
    answer_th: str = Field(min_length=5)
    citations: list[CitationItem] = Field(default_factory=list)
    abstain_reason: str | None = None
    verified: bool = True

    # TODO: เพิ่ม @model_validator(mode="after") ตรวจความสอดคล้องของ status กับ citations


def build_grounded_prompt(query: str, chunks: list[EvidenceChunk]) -> str:
    # TODO: สร้าง prompt ที่มี <evidence>...</evidence> พร้อม [chunk_id] ของทุก chunk และ query
    raise NotImplementedError


def generate_grounded_answer(
    query: str,
    chunks: list[EvidenceChunk],
    llm_fn: Callable[[str], dict],
    min_score: float = 0.35,
) -> GroundedResponse:
    # TODO: Pre-generation abstention gate -> เรียก llm_fn -> validate schema -> verify citations
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_grounded_generator.py",
      code: `import pytest
from pydantic import ValidationError
from src.grounded_generator import (
    EvidenceChunk,
    GroundedResponse,
    build_grounded_prompt,
    generate_grounded_answer,
)


def _sample_chunks() -> list[EvidenceChunk]:
    return [
        EvidenceChunk(
            chunk_id="pol-refund#2",
            doc_title="นโยบายคืนสินค้า",
            text="สินค้าอิเล็กทรอนิกส์คืนได้ภายใน 14 วันหากยังไม่แกะซีล",
            score=0.91,
        ),
        EvidenceChunk(
            chunk_id="fee-table#4",
            doc_title="ตารางค่าธรรมเนียม",
            text="ค่าธรรมเนียมโอนคืนผ่านพร้อมเพย์ 0 บาท",
            score=0.72,
        ),
    ]


def test_answered_with_valid_citations_passes_verification():
    chunks = _sample_chunks()

    def mock_llm(prompt: str) -> dict:
        assert "[pol-refund#2]" in prompt
        assert "<evidence>" in prompt
        return {
            "status": "answered",
            "answer_th": "คืนสินค้าอิเล็กทรอนิกส์ได้ภายใน 14 วันหากยังไม่แกะซีล [pol-refund#2]",
            "citations": [{"chunk_id": "pol-refund#2", "quote": "คืนได้ภายใน 14 วันหากยังไม่แกะซีล"}],
        }

    res = generate_grounded_answer("คืนสินค้าได้กี่วัน", chunks, mock_llm)
    assert res.status == "answered"
    assert res.verified is True
    assert res.citations[0].chunk_id == "pol-refund#2"


def test_empty_or_low_score_chunks_abstain_without_calling_llm():
    called = False

    def fail_if_called(_prompt: str) -> dict:
        nonlocal called
        called = True
        return {}

    empty_res = generate_grounded_answer("โปรเดือนหน้า", [], fail_if_called)
    low_chunks = [EvidenceChunk(chunk_id="faq#1", doc_title="FAQ", text="ทั่วไป", score=0.20)]
    low_res = generate_grounded_answer("โปรเดือนหน้า", low_chunks, fail_if_called, min_score=0.35)

    assert called is False
    assert empty_res.status == "abstained"
    assert empty_res.abstain_reason == "insufficient_evidence"
    assert low_res.status == "abstained"


def test_hallucinated_chunk_id_downgrades_to_unverified_abstain():
    chunks = _sample_chunks()

    def hallucinating_llm(_prompt: str) -> dict:
        return {
            "status": "answered",
            "answer_th": "คืนได้ภายใน 60 วัน [pol-fake#99]",
            "citations": [{"chunk_id": "pol-fake#99", "quote": "คืนได้ภายใน 60 วัน"}],
        }

    res = generate_grounded_answer("คืนสินค้าได้กี่วัน", chunks, hallucinating_llm)
    assert res.status == "abstained"
    assert res.verified is False
    assert res.citations == []
    assert res.abstain_reason == "ungrounded_citation"


def test_missing_inline_citation_tag_fails_verification():
    chunks = _sample_chunks()

    def missing_tag_llm(_prompt: str) -> dict:
        return {
            "status": "answered",
            "answer_th": "คืนได้ภายใน 14 วันโดยไม่มีป้ายอ้างอิงในข้อความ",
            "citations": [{"chunk_id": "pol-refund#2", "quote": "คืนได้ภายใน 14 วัน"}],
        }

    res = generate_grounded_answer("คืนสินค้าได้กี่วัน", chunks, missing_tag_llm)
    assert res.status == "abstained"
    assert res.verified is False
    assert res.abstain_reason == "ungrounded_citation"


def test_schema_rejects_inconsistent_answered_or_abstained_payload():
    with pytest.raises(ValidationError):
        GroundedResponse(status="answered", answer_th="ตอบลอย ๆ ไม่มีหลักฐาน", citations=[])

    with pytest.raises(ValidationError):
        GroundedResponse(
            status="abstained",
            answer_th="ไม่พบข้อมูลในระบบ",
            citations=[{"chunk_id": "pol#1", "quote": "ข้อความตัวอย่าง"}],
        )

    prompt = build_grounded_prompt("ทดสอบ", _sample_chunks())
    assert "[fee-table#4]" in prompt
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_grounded_generator.py` แล้วผ่านครบทั้ง 5 test cases",
      "ตรวจว่าเมื่อ `chunks` ว่างหรือ `score < min_score` ฟังก์ชัน `llm_fn` ไม่ถูกเรียกเลย",
      "ตรวจว่าทั้ง `citations` list และป้าย `[chunk_id]` ใน `answer_th` ถูกตรวจสอบกับ `chunks` จริง",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_grounded_generator.py` และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "ใน `GroundedResponse` ใช้ `@model_validator(mode=\"after\")` เช็กทั้ง `self.status == \"answered\" and not self.citations` และ `self.status == \"abstained\" and bool(self.citations)` แล้วโยน `ValueError`",
      },
      {
        body: "ใน `generate_grounded_answer` เช็ก `if not chunks or max(c.score for c in chunks) < min_score:` ก่อนสร้าง prompt; หลัง validate `resp = GroundedResponse.model_validate(raw)` ให้ตรวจทั้ง `{c.chunk_id for c in resp.citations}.issubset(allowed_ids)` และ `any(f\"[{c.chunk_id}]\" in resp.answer_th for c in resp.citations)`",
      },
      {
        body: "โครงของ `generate_grounded_answer` — เติม `build_grounded_prompt` และ `GroundedResponse` validator ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day165.py",
          code: `def generate_grounded_answer(
    query: str,
    chunks: list[EvidenceChunk],
    llm_fn: Callable[[str], dict],
    min_score: float = 0.35,
) -> GroundedResponse:
    if not chunks or max(c.score for c in chunks) < min_score:
        return GroundedResponse(
            status="abstained",
            answer_th="ไม่พบข้อมูลที่เพียงพอในเอกสารองค์กร กรุณาสอบถามเจ้าหน้าที่เพิ่มเติม",
            abstain_reason="insufficient_evidence",
        )

    prompt = build_grounded_prompt(query, chunks)
    resp = GroundedResponse.model_validate(llm_fn(prompt))
    if resp.status == "abstained":
        return resp

    allowed_ids = {c.chunk_id for c in chunks}
    cited_ids = {c.chunk_id for c in resp.citations}
    has_inline = any(f"[{cid}]" in resp.answer_th for cid in cited_ids)
    if not cited_ids.issubset(allowed_ids) or not has_inline:
        return GroundedResponse(
            status="abstained",
            answer_th="ไม่พบการอ้างอิงเอกสารที่ตรวจสอบได้ ระบบขอระงับคำตอบนี้ไว้ก่อน",
            citations=[],
            abstain_reason="ungrounded_citation",
            verified=False,
        )
    return resp`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_grounded_generator.py
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "เชื่อเลข Citation ที่ LLM ตอบกลับมาโดยไม่ตรวจเทียบกับ Chunks จริง",
      symptom: "โมเดลสร้างเลข `[pol-2026#99]` ขึ้นมาเองอย่างมั่นใจ ผู้ใช้กดลิงก์หลักฐานแล้วไม่เจอเอกสาร",
      fix: "ใช้ Deterministic Citation Verifier เช็กเสมอว่าทุก `chunk_id` ที่อ้างอยู่ใน `allowed_ids` ของรอบนั้นจริง",
    },
    {
      title: "ใส่คำสั่ง 'ห้ามมั่ว' ใน Prompt แต่ไม่สร้างกลไก Abstention Gate",
      symptom: "เมื่อคำถามอยู่นอกคลังเอกสารและ retrieval ดึงเอกสารคะแนนต่ำ (`0.18`) มาให้ โมเดลยังพยายามตีความเชื่อมโยงจนตอบผิด",
      fix: "ตั้ง Pre-Generation Gate (`chunks == []` หรือ `max(score) < min_score`) เพื่อคืน `abstained` ทันทีโดยไม่ต้องเรียก {{llm}}",
    },
    {
      title: "คืนข้อความอ้างอิงสั้นแค่ชื่อไฟล์โดยไม่มีท่อนข้อความ (quote) หรือ chunk_id",
      symptom: "เอกสารนโยบายยาว 15 หน้า แต่ระบบอ้างแค่ `[policy.pdf]` ทำให้ตรวจยากและวัด {{ragas}} Faithfulness ได้ไม่แม่น",
      fix: "บังคับให้ `CitationItem` เก็บทั้ง `chunk_id` และ `quote` จากหลักฐานจริง เพื่อแสดงไฮไลต์ใน UI และใช้ใน Eval Gate",
    },
    {
      title: "ยัดเอกสาร Top-20 เข้า LLM เพื่อหวังว่าจะไม่ตกหล่น",
      symptom: "Context ยาวเกินจำเป็น ทำให้เกิด *Lost in the Middle*, {{ttft}} ช้าลง และต้นทุน token พุ่ง",
      fix: "ใช้ {{reranker}} คัดเหลือ Top-5 คุณภาพสูงจาก Milestone 2 แล้วค่อยแพ็กเข้า Grounded Generator",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d165-q1",
        "ทำไมระบบ Grounded RAG ระดับ Production ต้องมี **Deterministic Citation Verifier** ต่อท้าย LLM แม้จะใช้ Structured Output แล้วก็ตาม?",
        [
          ["เพราะ Pydantic ไม่สามารถตรวจรูปแบบ JSON ได้", "ไม่จริง — Pydantic ตรวจชนิดข้อมูลและรูปแบบ field ได้ดีมาก"],
          ["เพราะ Structured Output การันตีแค่รูปทรง JSON แต่ไม่ได้การันตีว่า `chunk_id` ที่โมเดลใส่มาเป็นรหัสที่มีอยู่จริงในชุดหลักฐานรอบนั้น", "ถูก — โมเดลอาจใส่สตริงรูปทรงถูกต้องอย่าง `[pol#99]` ทั้งที่ไม่มีอยู่ใน Top-5 ที่ส่งเข้าไป"],
          ["เพราะ Verifier ช่วยลดค่า temperature ของโมเดลลงอัตโนมัติ", "Verifier ทำงานหลังโมเดลสร้างคำตอบแล้ว ไม่ได้ปรับ sampling parameter"],
          ["เพื่อแทนที่การทำ Hybrid Search และ BM25", "Verifier ตรวจ citation หลังค้นหา ไม่ได้ทำหน้าที่ค้นเอกสาร"],
        ],
        "B",
        "Schema Validator ตรวจโครงสร้างและความสอดคล้องภายใน JSON แต่การตรวจว่า `chunk_id` มีอยู่จริงใน `retrieved_chunks` ของคำขอนี้ต้องใช้โค้ด Deterministic Verifier เทียบกับชุดหลักฐานจริง",
        "Structured Output กับ Citation Verifier ต่างกันอย่างไร และทำไมต้องใช้คู่กัน?",
        "Structured Output ตรวจรูปทรงและกฎภายใน JSON (เช่น answered ต้องมี citation) ส่วน Citation Verifier เทียบกับ retrieved_chunks จริงว่าไม่ได้หลอนเลขเอกสารขึ้นมา",
      ),
      mc(
        "d165-q2",
        "เมื่อผู้ใช้ถามคำถามที่ไม่มีในคลังเอกสารและคะแนนสูงสุดจาก Retriever อยู่ที่ `0.19` (ต่ำกว่า `min_score = 0.35`) การทำงานแบบใดดีที่สุด?",
        [
          ["ส่ง chunk คะแนน `0.19` เข้า LLM แล้วขอให้โมเดลตอบเท่าที่รู้", "เสี่ยง Hallucination สูงมาก เพราะเอกสารไม่เกี่ยวข้องกับคำถาม"],
          ["เพิ่มจำนวน chunk จาก Top-5 เป็น Top-50 แล้วส่งเข้า LLM ทั้งหมด", "ยิ่งใส่เอกสารที่ไม่เกี่ยวข้องมาก โมเดลยิ่งสับสนและเปลือง token"],
          ["ให้ Pre-Generation Gate คืนสถานะ `abstained` ทันทีโดยไม่เรียก LLM", "ถูก — ประหยัดทั้งเวลาและค่า API พร้อมตัดโอกาสเกิดคำตอบหลอนตั้งแต่ต้นทาง"],
          ["ลบคะแนน threshold ทิ้งเพื่อให้ระบบตอบได้ 100% ของทุกคำถาม", "การตอบได้ทุกคำถามด้วยการเดาคือศัตรูตัวร้ายของระบบองค์กร"],
        ],
        "C",
        "Pre-Generation Abstention Gate ช่วยหยุดคำถามที่หลักฐานอ่อนเกินเกณฑ์ทันทีโดยไม่ต้องเสียเวลาหรือเสี่ยงให้ LLM ปั้นคำตอบ",
        "Pre-Generation Abstention Gate ทำงานเมื่อไร และมีข้อดีอย่างไร?",
        "ทำงานเมื่อ retrieved_chunks ว่างหรือคะแนนสูงสุดต่ำกว่า min_score โดยคืนสถานะ abstained ทันทีแบบ 0 ms LLM overhead",
      ),
      mc(
        "d165-q3",
        "ใน `GroundedResponse` เหตุใดเราจึงควรบังคับกฎ `status == \"abstained\"` ต้องมี `citations == []`?",
        [
          ["เพื่อประหยัดพื้นที่หน่วยความจำของ Python dict", "จำนวน citation มีขนาดเล็กมาก ไม่ใช่ประเด็นเรื่อง RAM"],
          ["เพื่อป้องกันความสับสนของ UI และ Eval ว่าตกลงคำตอบนี้เชื่อถือได้หรือปฏิเสธ ไม่ให้แสดงลิงก์หลักฐานคู่กับข้อความว่าไม่พบข้อมูล", "ถูก — สถานะและหลักฐานต้องสอดคล้องกันทั้งใน UI, Router และการวัด Abstention"],
          ["เพราะ Pydantic ไม่อนุญาตให้มี list ใน BaseModel ที่มี Literal", "Pydantic รองรับ list คู่กับ Literal ได้ตามปกติ"],
          ["เพื่อให้ BM25 ทำงานเร็วขึ้นในรอบถัดไป", "Schema ของผลลัพธ์ไม่มีผลต่อความเร็วการค้นหาของ BM25"],
        ],
        "B",
        "การแยกสถานะ `answered` (ต้องมี >= 1 verified citation) และ `abstained` (ต้องมี 0 citations) ให้เด็ดขาด ทำให้ทั้ง UI, LangGraph Router และชุดทดสอบ Evals ทำงานได้ตรงกัน",
        "กฎความสอดคล้องระหว่าง `status` และ `citations` ใน `GroundedResponse` คืออะไร?",
        "`answered` ต้องมีอย่างน้อย 1 citation ที่ตรวจสอบได้ ส่วน `abstained` ต้องมี `citations == []` และระบุ `abstain_reason`",
      ),
      mc(
        "d165-q4",
        "ข้อใดคือการวาง Context Engineering ที่ช่วยลดความเสี่ยง **Prompt Injection ที่แฝงมาในเอกสาร** และอาการ **Lost in the Middle** ได้ดีขึ้น?",
        [
          ["นำเอกสารดิบทั้งหมดมาต่อเป็นย่อหน้าเดียวโดยไม่ใส่รหัส `[chunk_id]`", "ทำให้โมเดลแยกขอบเขตหลักฐานไม่ออกและอ้างอิงไม่ได้"],
          ["คัดเหลือ Top-5 คุณภาพสูงจาก Reranker แยกขอบเขตด้วยแท็ก `<evidence>` พร้อม `[chunk_id]` และย้ำกฎอ้างอิงที่ขอบ prompt", "ถูก — แยก data ออกจาก instruction ชัดเจนและคุมขนาด context ให้กระชับ"],
          ["ใส่ประวัติแชตย้อนหลัง 50 รอบรวมกับ Top-30 chunks", "ทำให้ context บวม เกิด Lost in the Middle และแพงโดยไม่จำเป็น"],
          ["ให้โมเดลตอบเป็นข้อความอิสระก่อน แล้วค่อยสุ่มแปะ `[doc#1]` ทีหลัง", "การแปะ citation แบบสุ่มทำให้เกิด false attribution ที่อันตราย"],
        ],
        "B",
        "การคัดเฉพาะ Top-5 จาก Reranker พร้อมห่อหุ้มหลักฐานด้วยแท็ก `<evidence>` และป้าย `[chunk_id]` ช่วยทั้งเรื่องความแม่นยำในการอ้างอิงและลดโอกาสสับสนระหว่างคำสั่งกับข้อมูล",
        "ในการจัดเตรียม Context สำหรับ Grounded Generation ควรจัดการเอกสาร Top-K อย่างไร?",
        "ใช้ Top-5 ที่ผ่าน Reranker แล้ว แยกขอบเขตด้วยแท็ก `<evidence>` ติดป้าย `[chunk_id]` ชัดเจน และย้ำกฎ abstention เมื่อไม่พบหลักฐาน",
      ),
    ],
  },

  takeaways: [
    "แยกความรับผิดชอบเป็น 2 ชั้น: {{pydantic}} {{structured-output}} ตรวจรูปทรงสัญญา และ **Deterministic Citation Verifier** ตรวจว่า `chunk_id` มีอยู่จริงใน Top-5",
    "ใช้ **Pre-Generation Abstention Gate** (`chunks == []` หรือ `max(score) < min_score`) เพื่อปฏิเสธคำถามนอกเอกสารทันทีโดยไม่ต้องเรียก {{llm}}",
    "บังคับกฎสม่ำเสมอ: `answered` ต้องมี verified citation ทั้งใน `citations` และในข้อความตอบ ส่วน `abstained` ต้องไม่มี citation",
    "โมดูล `src/grounded_generator.py` นี้จะเป็นโหนดตอบคำถามหลักในเส้นทาง `faq_rag` ของ {{langgraph}} Router ใน Day 167",
  ],

  reviewCards: [
    rc(
      "d165-rc-1",
      "เหตุใด Structured Output เพียงอย่างเดียวจึงยังไม่พอสำหรับการันตี Citation ใน RAG?",
      "เพราะ Structured Output ตรวจแค่ชนิดข้อมูลและโครงสร้าง JSON แต่ตรวจไม่ได้ว่า `chunk_id` ที่โมเดลตอบมามีอยู่จริงใน Top-5 chunks ของคำขอนั้นหรือไม่ จึงต้องมี Deterministic Citation Verifier เทียบกับชุดหลักฐานจริง",
    ),
    rc(
      "d165-rc-2",
      "2 ด่านของ Calibrated Abstention ใน Grounded RAG คืออะไร?",
      "(1) Pre-Generation Gate: ตัดจบคืน abstained ทันทีเมื่อ chunks ว่างหรือ max(score) < min_score; (2) In-Prompt & Verifier Abstention: คืน abstained เมื่อหลักฐานไม่ตอบคำถามหรือตรวจพบ citation ปลอม",
    ),
    rc(
      "d165-rc-3",
      "สัญญาความสอดคล้องของ `GroundedResponse` ระหว่าง `status` กับ `citations` คืออะไร?",
      "ถ้า `status == \"answered\"` ต้องมีอย่างน้อย 1 verified citation (และอ้าง `[chunk_id]` ในคำตอบ) แต่ถ้า `status == \"abstained\"` ต้องมี `citations == []` พร้อมระบุ `abstain_reason`",
    ),
  ],

  sources: [
    { label: "Anthropic — Building Effective Agents & Grounding", href: "https://www.anthropic.com/research/building-effective-agents" },
    { label: "Pydantic v2 Documentation — Validators", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
    { label: "Ragas Documentation — Faithfulness Metric", href: "https://docs.ragas.io/" },
    { label: "OWASP Top 10 for LLM Applications", href: "https://genai.owasp.org/llm-top-10/" },
  ],

  glossary: ["rag", "groundedness", "hallucination", "abstention", "pydantic", "structured-output", "context-engineering", "acl", "fail-fast"],
});
