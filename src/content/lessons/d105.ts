import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D105 — Phase 4 / Block B27
 * Grounded Generation & Inline Citations ([doc_id#chunk])
 */
export const d105: Lesson = defineLesson({
  day: 105,
  titleTh: "Grounded Generation และการอ้างอิงแหล่งที่มาแบบ Inline Citations ([doc_id#chunk])",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · บังคับทุกข้อกล่าวอ้างอ้างอิง [doc_id#chunk] และตรวจจับ Phantom Citations ด้วย Pydantic + Regex",
  icon: "book-marked",
  visual: {
    id: "grounded-citations",
    title: "Grounded Answer ([doc_id#chunk]) vs Safe Abstention",
    caption: "คลิกตรวจเส้นเชื่อมระหว่างข้อกล่าวอ้างในคำตอบกับ Chunk ต้นทาง หรือสลับดูโหมดปฏิเสธเมื่อหลักฐานไม่พอ",
    alt: "แผนภาพ Grounded Generation และการตรวจสอบ Inline Citations",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — ใช้ deterministic citation parser & lexical support verifier ทดสอบด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "re (Regex)", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ค้นเจอเอกสารที่ถูกยังไม่พอ ถ้าโมเดลแต่งตัวเลขเพิ่มเองตอนสรุป",
      body: "ใน Block B25–B26 เราทำ Hybrid Search ({{bm25}} + {{hnsw}} + {{rrf}}) และ {{reranker}} จนดึง Top-3 chunks ที่แม่นยำมาได้แล้ว แต่ชั้น Generation ของ {{llm}} ยังอาจเกิด {{hallucination}} หรือหยิบความรู้เก่ามาปนกับเอกสารบริษัทได้",
      lessonNote: "วันนี้เราสร้างสัญญา Grounded Generation ที่บังคับให้ทุกประโยคสำคัญต้องแนบป้ายอ้างอิง `[doc_id#chunk_id]` เสมอ",
    },
    {
      node: 2,
      heading: "Inline Citation Tag ([doc_id#chunk]) คือตัวเชื่อมที่โค้ดตรวจสอบย้อนกลับได้",
      body: "การบอกโมเดลลอย ๆ ว่า 'อ้างอิงเอกสารด้วยนะ' มักได้ชื่อเอกสารกว้าง ๆ ที่ตรวจสอบอัตโนมัติไม่ได้ แต่การกำหนดรูปแบบตายตัว เช่น `[policy-refund#c02]` ทำให้เราใช้ Regex สกัดและตรวจเทียบกับชุด chunk ที่ดึงมาจริงได้ในระดับมิลลิวินาที",
      lessonNote: "ถ้าโมเดลอ้าง `[policy-vip#c99]` ที่ไม่ได้อยู่ในผลค้นคืน ระบบจะจับได้ทันทีว่าเป็น Phantom Citation",
    },
    {
      node: 4,
      heading: "แยก 2 ด่านตรวจ: Citation Existence vs Lexical Claim Support",
      body: "ความผิดพลาดคลาสสิกของระบบ {{rag}} คือตรวจแค่ว่ามีแท็ก `[doc#chunk]` แปะอยู่ท้ายประโยค แต่ไม่ตรวจว่าเนื้อหาใน chunk นั้นพูดเรื่องเดียวกับข้อกล่าวอ้างหรือไม่ (False Attribution)",
      lessonNote: "ในแล็บวันนี้เราจะตรวจทั้ง (1) แท็กมีอยู่จริงใน retrieved chunks และ (2) คำสำคัญ/ตัวเลขในข้อกล่าวอ้างปรากฏอยู่ใน chunk ที่อ้างจริง",
    },
    {
      node: 5,
      heading: "ปูทางสู่ Safe Abstention (D106) และ Citation Repair Gate (D122)",
      body: "เมื่อเรามีฟังก์ชัน `verify_grounded_answer()` ที่คืนรายงาน {{structured-output}} อย่างชัดเจน เราสามารถนำไปต่อเป็นด่านตรวจก่อนส่งคำตอบถึงลูกค้า หรือสั่ง repair / ปฏิเสธการตอบอย่างปลอดภัยในวันถัดไป",
      lessonNote: "ความสามารถด้าน {{groundedness}} นี้เป็นหนึ่งในเกณฑ์บังคับของ Phase 4 Checkpoint (Faithfulness = 1.0)",
    },
  ],

  objectives: [
    "**ออกแบบสัญญา Grounded Generation** ที่กำหนดรูปแบบ context block และบังคับให้ทุกข้อกล่าวอ้าง (claim) อ้างอิงรหัส `[doc_id#chunk_id]` จากเอกสารที่ดึงมาเท่านั้น",
    "**สร้างตัวสกัดและตรวจสอบ Inline Citations** ด้วย Python `re` และ {{pydantic}} เพื่อดักจับทั้งประโยคที่ลืมอ้างอิง (Uncited Claim) และรหัสอ้างอิงปลอมที่ไม่อยู่ในผลค้นคืน (Phantom Citation)",
    "**ตรวจสอบความสอดคล้องของเนื้อหาเบื้องต้น (Claim-to-Chunk Support)** เพื่อป้องกันการแปะป้าย `[doc_id#chunk_id]` จริงแต่เนื้อหาใน chunk ไม่ได้สนับสนุนข้อกล่าวอ้างนั้น พร้อมทดสอบด้วย {{pytest}}",
  ],

  prerequisites: [
    "ผ่าน Day 101–104 (Hybrid Retrieval, Reranking และ Context Compression)",
    "ใช้งาน {{pydantic}} `BaseModel` และ Python Regular Expressions (`re.findall`) พื้นฐานได้",
    "ไม่ต้องใช้ API key — ทดสอบด่านตรวจ Grounded Citations บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day105` ด้วย `uv` และติดตั้ง `pydantic` คู่กับ `pytest` เพื่อสร้างโมดูลตรวจสอบความถูกต้องของ Inline Citations",
    commands: `uv init ai-day105 && cd ai-day105
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day105` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เตรียมเขียน `citation_verifier.py` และรัน `uv run pytest -v`"],
    ],
    note: "เราใช้ Regex `\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]` เป็นมาตรฐานเดียวกันตลอด Phase 4–6 เพื่อให้อ่านง่ายทั้งสำหรับมนุษย์และโค้ดตรวจสอบ",
  },

  concepts: [
    {
      id: "evidence-block-and-citation-contract",
      title: "1 · สัญญา Context Block & Inline Citation รูปแบบ [doc_id#chunk_id]",
      paragraphs: [
        "จุดเริ่มต้นของ {{groundedness}} ไม่ได้อยู่ที่ตอนตรวจคำตอบ แต่อยู่ที่ **วิธีจัดรูปแบบ Context** ที่ส่งเข้า {{llm}} หากเราส่งข้อความดิบต่อกันเฉย ๆ โมเดลจะไม่รู้ว่าแต่ละย่อหน้ามีรหัสอ้างอิงอะไร",
        "แนวปฏิบัติมาตรฐานคือห่อแต่ละ chunk ด้วยหัวกระดาษที่มีรหัสชัดเจน เช่น `[policy-refund#c01] (หมวด: การคืนเงิน) ...เนื้อหา...` แล้วกำหนดใน System Prompt coupled กับ {{structured-output}} ว่า: (1) ตอบเฉพาะจากหลักฐานใน `<evidence>` เท่านั้น, (2) ทุกประโยคข้อเท็จจริงต้องลงท้ายด้วย `[doc_id#chunk_id]` อย่างน้อย 1 รายการ และ (3) ห้ามประดิษฐ์รหัสเอกสารที่ไม่มีใน `<evidence>`",
        "การใช้รูปแบบ `doc_id#chunk_id` (คั่นด้วย `#`) มีข้อดีคือบอกทั้งระดับเอกสาร (`policy-refund`) และตำแหน่งย่อย (`c01`) ทำให้ UI ฝั่งเว็บสามารถทำปุ่มคลิกแล้วเลื่อนไปไฮไลต์ย่อหน้าต้นฉบับได้ทันที",
      ],
      analogy:
        "เหมือนการเขียนรายงานวิจัยที่มีเชิงอรรถระบุทั้ง 'ชื่อหนังสือ' และ 'เลขหน้า' (`[เล่มที่#หน้า]`) ผู้อ่านหรือกรรมการตรวจสามารถเปิดไปหน้านั้นเพื่อเช็กได้ทันทีว่าผู้เขียนอ้างตรงตามต้นฉบับหรือมั่วขึ้นมาเอง",
      bullets: [
        "**Readable & Parseable**: มนุษย์อ่านเข้าใจทันที และ Regex ดึงค่าออกมาได้ในบรรทัดเดียว",
        "**Multi-Citation Support**: ประโยคที่สังเคราะห์จาก 2 ย่อหน้าสามารถแนบ `[docA#c01][docB#c03]` ต่อกันได้",
        "**Traceable UI**: หน้าเว็บแชตสามารถแปลง `[doc_id#chunk_id]` เป็นชิปสีเขียวที่คลิกเปิดดูข้อความต้นฉบับได้",
      ],
      whyTitle: "Why this matters — คำตอบที่ไม่มีแหล่งอ้างอิงคือความเสี่ยงทางกฎหมายและธุรกิจ",
      whyParagraphs: [
        "ในระบบตอบคำถามนโยบายการเงิน ประกันภัย หรือ SLA ลูกค้า หากบอทตอบตัวเลขค่าธรรมเนียมผิดโดยไม่มีลิงก์อ้างอิง พนักงานและลูกค้าจะไม่สามารถตรวจสอบได้เลยว่าตัวเลขนั้นมาจากเอกสารฉบับไหน",
        "เมื่อบังคับ `[doc_id#chunk_id]` ทุกครั้ง ผู้ใช้สามารถคลิกตรวจต้นฉบับได้ใน 1 วินาที",
      ],
    },
    {
      id: "phantom-and-uncited-detection",
      title: "2 · ด่านตรวจระดับโครงสร้าง: ดัก Uncited Claims และ Phantom Citations",
      paragraphs: [
        "แม้จะเขียน System Prompt เข้มงวดแค่ไหน โมเดลก็ยังมีโอกาสหลุด 2 อาการหลักที่ต้องใช้โค้ด Python ดักจับหลังสร้างคำตอบ (Post-Generation Verification):",
        "**อาการที่ 1: Uncited Claim (ลืมแปะป้ายอ้างอิง)** — โมเดลตอบประโยคข้อเท็จจริง เช่น `'สามารถขอคืนเงินได้ภายใน 30 วัน'` แต่ไม่มี `[doc_id#chunk]` กำกับเลย กรณีนี้ถือว่าไม่ผ่านเกณฑ์ {{groundedness}} เพราะผู้ตรวจสอบไม่รู้ว่าตัวเลข 30 วันมาจากไหน",
        "**อาการที่ 2: Phantom Citation (อ้างรหัสผี/รหัสที่ไม่ได้ดึงมา)** — โมเดลแปะป้าย `[policy-refund#c99]` หรือ `[faq-general#c01]` ทั้งที่ในรอบนั้น Retriever ดึงมาแค่ `policy-refund#c01` และ `policy-refund#c02` อาการนี้เกิดจากโมเดลเลียนแบบรูปแบบป้ายอ้างอิงแต่เดาชื่อรหัสขึ้นมาเอง",
      ],
      analogy:
        "Uncited Claim เหมือนการส่งเบิกเงินโดยไม่แนบใบเสร็จ ส่วน Phantom Citation เหมือนการเขียนเลขที่ใบเสร็จปลอมที่ไม่มีอยู่ในแฟ้มบัญชี — ฝ่ายการเงินต้องตีกลับทั้งสองกรณี",
      code: {
        language: "python",
        filename: "citation_parser.py",
        code: `import re

CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")


def extract_citations(text: str) -> list[str]:
    """ดึงรหัส doc_id#chunk_id ทั้งหมดตามลำดับที่พบโดยไม่ซ้ำกัน"""
    seen: list[str] = []
    for match in CITATION_RE.findall(text):
        if match not in seen:
            seen.append(match)
    return seen


sample = "คืนเงินภายใน 14 วัน [policy-refund#c01] และฟรีค่าส่งคืน [policy-ship#c02]"
print(extract_citations(sample))
# ['policy-refund#c01', 'policy-ship#c02']`,
        caption: "ใช้ `CITATION_RE` สกัดรหัสอ้างอิงออกมาเทียบกับ `allowed_chunk_ids` ที่ดึงมาจาก Retriever",
      },
      whyTitle: "Why this matters — Regex Check ใช้เวลา < 0.1 ms แต่กัน Hallucinated IDs ได้ 100%",
      whyParagraphs: [
        "หลายคนเข้าใจผิดว่าต้องใช้ LLM อีกตัว (LLM-as-a-Judge) มาตรวจทุกคำตอบเสมอไป ซึ่งช้าและเสียค่า API สองต่อ",
        "การตรวจ Uncited Claims และ Phantom Citations ด้วยชุดรหัส `set(retrieved_chunks.keys())` ใน Python ทำงานเสร็จในระดับไมโครวินาที ฟรี และแม่นยำ 100%",
      ],
    },
    {
      id: "lexical-support-verification",
      title: "3 · ด่านตรวจระดับเนื้อหา: ป้องกัน False Attribution (แปะป้ายจริงแต่เนื้อหาไม่ตรง)",
      paragraphs: [
        "ด่านที่ละเอียดขึ้นคือกรณีที่โมเดลแปะป้าย `[policy-refund#c01]` ซึ่งมีอยู่จริงในผลค้นคืน แต่ใน chunk นั้นเขียนว่า `'คืนเงินภายใน 14 วัน'` ส่วนโมเดลกลับตอบว่า `'คืนเงินภายใน 30 วัน [policy-refund#c01]'` — นี่เรียกว่า **False Attribution** หรือการอ้างอิงผิดข้อเท็จจริง",
        "เราสามารถสร้างด่านตรวจเร็วระดับ Lexical & Numeric Overlap ก่อนส่งคำตอบ: (1) ตัวเลขสำคัญทุกตัวในประโยคคำตอบ (เช่น `14`, `1500`) ต้องปรากฏอยู่ในข้อความของ chunk ที่อ้างอิง และ (2) คำสำคัญในข้อกล่าวอ้างต้องมีสัดส่วนการซ้อนทับ (support score) กับเนื้อหาใน chunk ที่อ้างถึงตามเกณฑ์ขั้นต่ำ",
        "หากประโยคใดมีตัวเลขที่ไม่มีใน chunk ต้นทาง หรือมีคะแนนความสอดคล้องต่ำกว่าเกณฑ์ ด่านตรวจจะตีธง `unsupported_claims` ทันทีเพื่อส่งเข้าโหมดซ่อมคำตอบ (Repair) หรือปฏิเสธการตอบอย่างปลอดภัย",
      ],
      analogy:
        "เหมือนเจ้าหน้าที่ตรวจรับที่ไม่ได้ดูแค่ว่ามีใบเสร็จแนบมาจริงไหม แต่ก้มดูตัวเลขยอดเงินในใบเสร็จด้วยว่าตรงกับตัวเลขที่เขียนเบิกในใบปะหน้าหรือเปล่า",
      bullets: [
        "**Numeric Guard**: สกัดตัวเลขด้วย `re.findall(r\"\\d+\", claim)` แล้วตรวจว่าทุกตัวเลขปรากฏในข้อความของ chunk ที่อ้างอิง",
        "**Token Overlap**: ตรวจว่าคำสำคัญของข้อกล่าวอ้างปรากฏอยู่ใน chunk ต้นทาง",
        "**Fail-Closed Report**: คืน `CitationReport` ที่มี `is_grounded=True` เฉพาะเมื่อไม่มีทั้ง uncited, phantom และ unsupported claims",
      ],
      whyTitle: "Why this matters — ตัวเลขที่เพี้ยนเพียงตัวเดียวในงานบริการลูกค้าคือความเสียหายจริง",
      whyParagraphs: [
        "ในภาษาไทย โมเดลอาจสรุปย่อหน้าถูกเกือบหมดแต่เผลอเปลี่ยนตัวเลข `'7 วันทำการ'` เป็น `'14 วันทำการ'` การมี Numeric + Lexical Support Check ช่วยจับความคลาดเคลื่อนนี้ได้ทันทีโดยไม่ต้องรอคนมาร้องเรียน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Grounded Citations กับ Foreign Key & Content Integrity",
      body: [
        "สำหรับนักพัฒนาเว็บ ระบบตรวจ Inline Citations มีโครงสร้างเหมือนการตรวจ Foreign Key และ Checksum ในระบบ Backend:",
      ],
      table: [
        ["`[doc_id#chunk_id]` tag", "Foreign Key ที่ชี้ไปยังแถวข้อมูลในตาราง `retrieved_chunks`"],
        ["Uncited Claim", "ฟิลด์บังคับ (`NOT NULL`) ที่ถูกส่งมาเป็นค่าว่าง"],
        ["Phantom Citation", "Foreign Key Constraint Violation (อ้างถึง ID ที่ไม่มีในตาราง)"],
        ["Numeric / Lexical Support Check", "Payload Checksum / Business Rule Validation ก่อน commit"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมเราต้องตัด `[doc_id#chunk]` ออกก่อนตรวจตัวเลขในประโยค",
      body: [
        "สังเกตว่าในรหัส `[policy-refund#c01]` มีตัวเลข `01` อยู่ด้วย! ถ้าเราไม่ลบแท็ก `[...]` ออกจากประโยคก่อนสกัดตัวเลข โค้ดของเราจะเข้าใจผิดว่าประโยคนี้กำลังพูดถึงเลข `01`",
        "ดังนั้นในโค้ดจริง ให้ใช้ `CITATION_RE.sub(\"\", line)` ลบป้ายอ้างอิงออกให้เหลือแต่เนื้อความของประโยคก่อน แล้วจึงสกัดตัวเลขและคำสำคัญไปเทียบกับเนื้อหาใน chunk ต้นทาง",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีผลค้นคืน 2 chunks จากนโยบายบริษัท (`policy-refund#c01` และ `policy-ship#c02`) เราจะเขียนตัวตรวจ `verify_answer_citations` เพื่อทดสอบคำตอบ 3 แบบ: (1) คำตอบที่อ้างอิงถูกต้อง, (2) คำตอบที่อ้างรหัสผี `[policy-vip#c99]` และ (3) คำตอบที่แปะป้ายถูกแต่แอบเปลี่ยนตัวเลขจาก 14 วันเป็น 30 วัน",
    steps: [
      {
        title: "1 · นิยามโมเดล Pydantic สำหรับผลลัพธ์การตรวจ Citations",
        explain:
          "แยกประเภทความผิดพลาดออกเป็น 3 รายการชัดเจน: `uncited_claims`, `phantom_citations` และ `unsupported_claims` เพื่อให้ระบบปลายทางตัดสินใจซ่อมคำตอบได้ถูกจุด",
        code: {
          language: "python",
          filename: "worked_citations.py",
          code: `import re
from pydantic import BaseModel

CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")
NUMBER_RE = re.compile(r"\\d+")


class ClaimCheck(BaseModel):
    claim_text: str
    citations: list[str]
    is_supported: bool
    reason: str


class CitationAuditReport(BaseModel):
    is_grounded: bool
    valid_citations: list[str]
    uncited_claims: list[str]
    phantom_citations: list[str]
    unsupported_claims: list[str]
    claim_checks: list[ClaimCheck]`,
        },
      },
      {
        title: "2 · เขียนฟังก์ชันตรวจทั้ง Citation ID และ Numeric/Keyword Support",
        explain:
          "แต่ละบรรทัดคำตอบจะถูกสกัดป้าย `[doc_id#chunk]` ออกมาตรวจว่าอยู่ใน `retrieved_chunks` หรือไม่ จากนั้นลบป้ายออกแล้วตรวจว่าตัวเลขและคำหลักในประโยคปรากฏอยู่ในข้อความของ chunk ที่อ้างอิงจริง",
        code: {
          language: "python",
          filename: "worked_citations.py",
          code: `def audit_grounded_answer(
    answer_lines: list[str],
    retrieved_chunks: dict[str, str],
) -> CitationAuditReport:
    valid_cites: list[str] = []
    uncited: list[str] = []
    phantom: list[str] = []
    unsupported: list[str] = []
    checks: list[ClaimCheck] = []

    for raw_line in answer_lines:
        line = raw_line.strip()
        if not line:
            continue
        cites = CITATION_RE.findall(line)
        clean_claim = CITATION_RE.sub("", line).strip()

        if not cites:
            uncited.append(clean_claim)
            checks.append(
                ClaimCheck(
                    claim_text=clean_claim,
                    citations=[],
                    is_supported=False,
                    reason="missing_citation",
                )
            )
            continue

        missing_ids = [cid for cid in cites if cid not in retrieved_chunks]
        if missing_ids:
            for cid in missing_ids:
                if cid not in phantom:
                    phantom.append(cid)
            checks.append(
                ClaimCheck(
                    claim_text=clean_claim,
                    citations=cites,
                    is_supported=False,
                    reason="phantom_citation",
                )
            )
            continue

        combined_evidence = " ".join(retrieved_chunks[cid] for cid in cites)
        claim_numbers = NUMBER_RE.findall(clean_claim)
        numbers_ok = all(num in combined_evidence for num in claim_numbers)

        if not numbers_ok:
            unsupported.append(clean_claim)
            checks.append(
                ClaimCheck(
                    claim_text=clean_claim,
                    citations=cites,
                    is_supported=False,
                    reason="numeric_mismatch",
                )
            )
            continue

        for cid in cites:
            if cid not in valid_cites:
                valid_cites.append(cid)
        checks.append(
            ClaimCheck(
                claim_text=clean_claim,
                citations=cites,
                is_supported=True,
                reason="verified",
            )
        )

    is_ok = not uncited and not phantom and not unsupported and len(checks) > 0
    return CitationAuditReport(
        is_grounded=is_ok,
        valid_citations=valid_cites,
        uncited_claims=uncited,
        phantom_citations=phantom,
        unsupported_claims=unsupported,
        claim_checks=checks,
    )`,
        },
      },
      {
        title: "3 · ทดสอบกับคำตอบ 3 สถานการณ์ (Grounded, Phantom และ Numeric Hallucination)",
        explain:
          "รันฟังก์ชันกับหลักฐาน 2 chunks เพื่อยืนยันว่าด่านตรวจแยกแยะคำตอบที่ถูกต้องออกจากคำตอบที่อ้างรหัสปลอมหรือบิดเบือนตัวเลขได้อย่างแม่นยำ",
        code: {
          language: "python",
          filename: "worked_citations.py",
          code: `chunks = {
    "policy-refund#c01": "ลูกค้าสามารถขอคืนเงินได้ภายใน 14 วันนับจากวันรับสินค้า",
    "policy-ship#c02": "กรณีสินค้าชำรุด บริษัทรับผิดชอบค่าจัดส่งคืน 50 บาท",
}

good = audit_grounded_answer(
    [
        "ลูกค้าขอคืนเงินได้ภายใน 14 วัน [policy-refund#c01]",
        "บริษัทช่วยค่าจัดส่งคืน 50 บาทเมื่อสินค้าชำรุด [policy-ship#c02]",
    ],
    chunks,
)
bad_phantom = audit_grounded_answer(
    ["สมาชิก VIP คืนเงินได้ใน 60 วัน [policy-vip#c99]"],
    chunks,
)
bad_number = audit_grounded_answer(
    ["ลูกค้าขอคืนเงินได้ภายใน 30 วัน [policy-refund#c01]"],
    chunks,
)

print("Good grounded:", good.is_grounded, good.valid_citations)
print("Phantom caught:", bad_phantom.is_grounded, bad_phantom.phantom_citations)
print("Number mismatch:", bad_number.is_grounded, bad_number.unsupported_claims)`,
        },
        output: `Good grounded: True ['policy-refund#c01', 'policy-ship#c02']
Phantom caught: False ['policy-vip#c99']
Number mismatch: False ['ลูกค้าขอคืนเงินได้ภายใน 30 วัน']`,
      },
    ],
    gotcha:
      "อย่าลืมเช็กกรณีที่ `answer_lines` ว่างเปล่า (`[]`) — คำตอบที่ไม่มีข้อกล่าวอ้างใด ๆ เลยต้องได้ `is_grounded=False` เสมอ ไม่ใช่ผ่านไปเฉย ๆ เพราะรายการข้อผิดพลาดเป็นลิสต์ว่าง!",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `citation_verifier.py` ที่มีฟังก์ชัน `extract_citations`, `format_evidence_block` และ `verify_grounded_answer` พร้อมเขียนชุดทดสอบ `test_citation_verifier.py` ให้ครบทุกกรณี",
    requirements: [
      "เขียน `extract_citations(text: str) -> list[str]` ดึงรหัส `[doc_id#chunk_id]` ตามลำดับที่พบโดยไม่ซ้ำกัน",
      "เขียน `format_evidence_block(chunks: dict[str, str]) -> str` จัดรูปแบบแต่ละ chunk เป็นบรรทัด `[doc_id#chunk_id] <content>` คั่นด้วย `\\n` (ถ้า `chunks` ว่างให้โยน `ValueError`)",
      "เขียน `verify_grounded_answer(claims: list[str], retrieved_chunks: dict[str, str]) -> GroundingReport` ที่ตรวจจับทั้ง `uncited_claims`, `phantom_citations` และ `unsupported_claims` (เมื่อตัวเลขใน claim ไม่ปรากฏใน chunk ที่อ้างอิง)",
      "กำหนดให้ `is_grounded = True` เฉพาะเมื่อมีอย่างน้อย 1 claim ที่ผ่านการตรวจ และไม่มี uncited, phantom หรือ unsupported claims เลย",
      "เขียน `test_citation_verifier.py` ทดสอบครบทั้งเคสปกติ, เคสลืมใส่แท็ก, เคสแท็กปลอม (phantom), เคสตัวเลขไม่ตรงกับ chunk และเคส `claims` ว่าง",
    ],
    starter: {
      language: "python",
      filename: "citation_verifier.py",
      code: `import re
from pydantic import BaseModel

CITATION_RE = re.compile(r"\\[([a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+)\\]")
NUMBER_RE = re.compile(r"\\d+")


class GroundingReport(BaseModel):
    is_grounded: bool
    valid_citations: list[str]
    uncited_claims: list[str]
    phantom_citations: list[str]
    unsupported_claims: list[str]


def extract_citations(text: str) -> list[str]:
    """ดึงรหัส doc_id#chunk_id ตามลำดับที่พบโดยไม่ซ้ำกัน"""
    # TODO: ใช้ CITATION_RE.findall(text) และรักษาลำดับโดยไม่ซ้ำ
    raise NotImplementedError


def format_evidence_block(chunks: dict[str, str]) -> str:
    """แปลง dict ของ chunk_id -> text เป็นบล็อกหลักฐานสำหรับใส่ใน prompt"""
    # TODO: ถ้า chunks ว่างให้ raise ValueError("chunks must not be empty")
    # คืนบรรทัด "[doc_id#chunk_id] <text>" คั่นด้วย "\\n"
    raise NotImplementedError


def verify_grounded_answer(
    claims: list[str],
    retrieved_chunks: dict[str, str],
) -> GroundingReport:
    """ตรวจว่าทุก claim มี citation ที่อยู่ใน retrieved_chunks และตัวเลขตรงตามหลักฐาน"""
    # TODO: ตรวจทั้ง uncited_claims, phantom_citations และ unsupported_claims
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "`extract_citations` คืนรหัสโดยตัดเครื่องหมาย `[` และ `]` ออกแล้ว และไม่เก็บค่าซ้ำใช่หรือไม่?",
      "`verify_grounded_answer` ลบแท็ก `[doc_id#chunk_id]` ออกก่อนสกัดตัวเลขในประโยค เพื่อไม่ให้เลขใน chunk ID ไปกวนการตรวจตัวเลขใช่หรือไม่?",
      "ถ้า `claims` มีแต่บรรทัดว่าง หรือเป็นลิสต์ว่าง `[]` ค่า `is_grounded` เป็น `False` ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบ 5 เทสต์ (valid grounded answer, uncited claim, phantom citation, numeric hallucination, empty input) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "ใน `extract_citations` ใช้ `dict.fromkeys(CITATION_RE.findall(text))` แล้วแปลงเป็น `list(...)` จะได้รายการที่ไม่ซ้ำตามลำดับที่พบในบรรทัดเดียว",
      },
      {
        body: "ตอนตรวจตัวเลขใน claim ให้ทำ `clean_claim = CITATION_RE.sub(\"\", raw_claim).strip()` ก่อนเสมอ เพื่อไม่ให้เลขใน `#c01` ถูกนับเป็นตัวเลขในเนื้อความ",
      },
      {
        body: "เฉลยโค้ด `citation_verifier.py` และชุดทดสอบ `test_citation_verifier.py`:",
        code: {
          language: "python",
          filename: "test_citation_verifier.py",
          code: `import pytest
from citation_verifier import (
    extract_citations,
    format_evidence_block,
    verify_grounded_answer,
)

CHUNKS = {
    "policy-refund#c01": "คืนเงินได้ภายใน 14 วัน สำหรับสินค้าราคาไม่เกิน 5000 บาท",
    "policy-sla#c02": "ตอบกลับตั๋วด่วนภายใน 2 ชั่วโมงทำการ",
}


def test_extract_citations_deduplicates_in_order() -> None:
    text = "ข้อแรก [a#c1] ข้อสอง [b#c2] และย้ำข้อแรก [a#c1]"
    assert extract_citations(text) == ["a#c1", "b#c2"]


def test_format_evidence_block_Rejects_empty() -> None:
    with pytest.raises(ValueError):
        format_evidence_block({})
    block = format_evidence_block(CHUNKS)
    assert "[policy-refund#c01]" in block


def test_valid_grounded_answer_passes() -> None:
    report = verify_grounded_answer(
        [
            "ขอคืนเงินได้ภายใน 14 วัน [policy-refund#c01]",
            "ตั๋วด่วนจะได้รับคำตอบใน 2 ชั่วโมงทำการ [policy-sla#c02]",
        ],
        CHUNKS,
    )
    assert report.is_grounded is True
    assert report.valid_citations == ["policy-refund#c01", "policy-sla#c02"]


def test_detects_uncited_and_phantom_citations() -> None:
    report = verify_grounded_answer(
        [
            "ประโยคนี้ลืมใส่แหล่งอ้างอิง",
            "ประโยคนี้อ้างเอกสารที่ไม่มีอยู่จริง [policy-ghost#c99]",
        ],
        CHUNKS,
    )
    assert report.is_grounded is False
    assert len(report.uncited_claims) == 1
    assert report.phantom_citations == ["policy-ghost#c99"]


def test_detects_numeric_hallucination_and_empty_claims() -> None:
    report = verify_grounded_answer(
        ["ขอคืนเงินได้ภายใน 30 วัน [policy-refund#c01]"],
        CHUNKS,
    )
    assert report.is_grounded is False
    assert len(report.unsupported_claims) == 1
    assert verify_grounded_answer([], CHUNKS).is_grounded is False`,
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
      title: "ให้ LLM อ้างอิงเป็นชื่อเอกสารภาษาไทยยาว ๆ แทนรหัส `[doc_id#chunk_id]`",
      symptom:
        "โมเดลสะกดชื่อเอกสารเพี้ยนเล็กน้อยในแต่ละรอบ เช่น `'คู่มือการคืนเงินหน้า 2'` บ้าง `'นโยบายคืนเงิน'` บ้าง จนโค้ดตรวจสอบอัตโนมัติเทียบกับ retrieved chunks ไม่ได้เลย",
      fix: "กำหนดรหัสมาตรฐาน `[doc_id#chunk_id]` ตั้งแต่ตอนฟอร์แมต context block และใช้ Regex สกัดตรวจแบบ deterministic",
    },
    {
      title: "ตรวจแค่ว่ามีเครื่องหมาย `[...]` อยู่ในคำตอบ แต่ไม่เช็กว่า ID นั้นอยู่ใน `retrieved_chunks` ของรอบนั้นหรือไม่",
      symptom:
        "โมเดลประดิษฐ์แท็ก `[policy-general#c01]` ขึ้นมาเอง (Phantom Citation) แล้วระบบปล่อยผ่านจนเกิดลิงก์เสียหรืออ้างอิงมั่วบนหน้าเว็บ",
      fix: "ตรวจ `cid in retrieved_chunks` ทุกครั้ง และเก็บรายการที่ไม่อยู่ในผลค้นคืนลง `phantom_citations`",
    },
    {
      title: "ไม่ลบป้าย `[doc_id#chunk_id]` ออกก่อนสกัดตัวเลขในประโยคคำตอบ",
      symptom:
        "เลข `01` หรือ `02` ในชื่อรหัส `#c01` ถูกสกัดไปตรวจในเนื้อความของ chunk ทำให้เกิด False Positive ว่าตัวเลขไม่ตรงกับหลักฐาน",
      fix: "ใช้ `CITATION_RE.sub(\"\", claim)` ลบป้ายอ้างอิงออกจากประโยคก่อนสกัดตัวเลขหรือคำสำคัญเสมอ",
    },
    {
      title: "ปล่อยให้คำตอบว่างเปล่า (`claims = []`) ได้ `is_grounded = True`",
      symptom:
        "เมื่อ parser แยกประโยคพลาดจนได้ลิสต์ว่าง ลิสต์ข้อผิดพลาดทั้งหมดก็ว่างตาม ทำให้ระบบเข้าใจผิดว่าคำตอบผ่านเกณฑ์ Groundedness",
      fix: "บังคับเงื่อนไข `len(verified_claims) > 0` ควบคู่กับการไม่มีข้อผิดพลาดเสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d105-q1",
        "ทำไมการส่ง Context เข้า LLM จึงควรใส่หัวกระดาษรหัสตายตัว เช่น `[policy-refund#c01]` กำกับทุก chunk?",
        [
          ["เพื่อบังคับให้ LLM แปลภาษาไทยเป็นภาษาอังกฤษอัตโนมัติ", "รหัส chunk ไม่ได้ใช้สั่งแปลภาษา"],
          ["เพื่อให้ทั้งโมเดลอ้างอิงได้แม่นยำ และโค้ดหลังบ้านสามารถใช้ Regex ตรวจย้อนกลับไปยัง chunk ต้นทางได้แบบ deterministic", "ถูกต้อง — รหัสตายตัวทำให้ทั้งการอ้างอิงและการ verify ทำงานร่วมกันได้ 100%"],
          ["เพื่อลดขนาด Vector Embedding ลงครึ่งหนึ่ง", "การใส่แท็กใน prompt ตอน generate ไม่ได้ลดขนาด vector index"],
          ["เพื่อให้ไม่ต้องใช้ฐานข้อมูลเอกสารอีกต่อไป", "ยังต้องใช้ชุด retrieved chunks มาเทียบความถูกต้อง"],
        ],
        "B",
        "รหัส `[doc_id#chunk_id]` สร้างสะพานเชื่อมแบบ 1:1 ระหว่างประโยคในคำตอบกับ chunk ที่ถูกดึงมาในรอบนั้น",
        "เป้าประสงค์ของ Inline Citation ID คืออะไร?",
        "เพื่อให้ทั้งโมเดลอ้างอิงและโค้ด verifier ตรวจสอบย้อนกลับไปยัง chunk ต้นทางได้แบบ deterministic",
      ),
      mc(
        "d105-q2",
        "ข้อใดคืออาการของ 'Phantom Citation' ในระบบ RAG?",
        [
          ["โมเดลตอบโดยไม่ใส่เครื่องหมายอ้างอิงใด ๆ เลย", "นั่นคือ Uncited Claim"],
          ["โมเดลใส่ป้ายอ้างอิงรูปแบบ `[doc_id#chunk_id]` ที่ดูสมจริง แต่รหัสนั้นไม่ได้อยู่ในชุด `retrieved_chunks` ที่ค้นมาในรอบนั้น", "ถูกต้อง — โมเดลเลียนแบบรูปแบบแท็กแต่แต่งรหัสเอกสารขึ้นมาเอง"],
          ["Retriever ค้นเอกสารมาได้ 0 รายการ", "นั่นคือ Empty Retrieval"],
          ["ผู้ใช้พิมพ์คำถามที่มีคำผิด", "นั่นคือ Noisy Query"],
        ],
        "B",
        "Phantom Citation คือรหัสอ้างอิงผีที่มีหน้าตาถูกต้องตาม Regex แต่ไม่มีอยู่จริงในชุดหลักฐานที่ดึงมา",
        "Phantom Citation คืออะไร?",
        "ป้ายอ้างอิง `[doc_id#chunk_id]` ที่ไม่อยู่ในชุด `retrieved_chunks` ของคำขอนั้น",
      ),
      mc(
        "d105-q3",
        "หาก Chunk `policy-refund#c01` ระบุว่า 'คืนเงินภายใน 14 วัน' แต่โมเดลตอบว่า 'คืนเงินภายใน 30 วัน [policy-refund#c01]' ด่านตรวจใดจะจับปัญหานี้ได้?",
        [
          ["Regex Citation Format Check เพียงอย่างเดียว", "รูปแบบแท็กถูกต้องจึงจับไม่ได้"],
          ["Phantom Citation Check เทียบกับ `retrieved_chunks.keys()`", "รหัส `policy-refund#c01` มีอยู่จริงใน keys จึงจับไม่ได้"],
          ["Claim-to-Chunk Numeric & Lexical Support Check ที่ตรวจว่าตัวเลข `30` ในข้อกล่าวอ้างไม่ปรากฏในข้อความของ chunk ที่อ้างอิง", "ถูกต้อง — ต้องตรวจเนื้อหาใน chunk ที่อ้างด้วยว่ามีตัวเลข/คำสำคัญตรงกับ claim หรือไม่"],
          ["การตั้ง `temperature = 1.5`", "ยิ่งเพิ่มโอกาสเกิด hallucination"],
        ],
        "C",
        "การมีแท็กที่ถูกไม่ได้แปลว่าเนื้อหาถูก ต้องตรวจ Claim-to-Chunk Support โดยเฉพาะตัวเลขสำคัญควบคู่กันเสมอ",
        "จะจับ False Attribution ที่แปะแท็กจริงแต่บิดเบือนตัวเลขได้อย่างไร?",
        "ใช้ Claim-to-Chunk Numeric & Lexical Support Check ตรวจว่าตัวเลขใน claim ปรากฏในข้อความของ chunk ที่อ้างจริง",
      ),
      mc(
        "d105-q4",
        "เหตุใดเราจึงต้องลบป้าย `[doc_id#chunk_id]` ออกจากประโยคด้วย `CITATION_RE.sub(\"\", claim)` ก่อนสกัดตัวเลขไปตรวจกับเนื้อหาใน chunk?",
        [
          ["เพราะในรหัส `#c01` หรือ `doc2` มีตัวเลขอยู่ หากไม่ลบออกก่อน โค้ดจะนำตัวเลขในรหัสแท็กไปตรวจในเนื้อความจนเกิด False Positive", "ถูกต้อง — ตัวเลขของรหัสอ้างอิงไม่ใช่ตัวเลขของข้อเท็จจริงในประโยค"],
          ["เพราะ Python `re.findall` ทำงานกับสตริงที่มีวงเล็บก้ามปูไม่ได้", "`re.findall` ทำงานได้ตามปกติ"],
          ["เพื่อแปลงข้อความภาษาไทยเป็นตัวพิมพ์เล็ก", "ภาษาไทยไม่มีตัวพิมพ์เล็ก/ใหญ่"],
          ["เพื่อลบตัวเลขทั้งหมดออกจากประโยคคำตอบ", "เราต้องการเก็บตัวเลขในเนื้อความไว้ตรวจ"],
        ],
        "A",
        "การแยก metadata tag ออกจากเนื้อความ (clean claim) ก่อนตรวจเนื้อหาช่วยป้องกันการปะปนระหว่าง ID กับข้อเท็จจริง",
        "ทำไมต้องลบ `[doc_id#chunk_id]` ออกจากประโยคก่อนสกัดตัวเลขใน claim?",
        "เพื่อไม่ให้ตัวเลขในรหัส `#c01` ถูกรวมเป็นตัวเลขข้อเท็จจริงที่ต้องไปค้นในเนื้อความของ chunk",
      ),
    ],
  },

  takeaways: [
    "**Grounded Generation** เริ่มตั้งแต่การส่ง Context ที่มีหัวกระดาษ `[doc_id#chunk_id]` ชัดเจน เพื่อให้โมเดลอ้างอิงกลับมาด้วยรหัสเดียวกัน",
    "**Post-Generation Citation Verifier** ต้องตรวจ 3 ด่านเสมอ: (1) ไม่มี Uncited Claim, (2) ไม่มี Phantom Citation และ (3) ตัวเลข/คำหลักใน Claim สอดคล้องกับ Chunk ที่อ้าง",
    "**Clean before Numeric Check**: ลบป้าย `[doc_id#chunk_id]` ออกจากประโยคก่อนสกัดตัวเลขไปเทียบกับเนื้อหาใน chunk เสมอ",
    "เมื่อ `is_grounded=False` ระบบต้องไม่ปล่อยคำตอบนั้นถึงผู้ใช้ตรง ๆ แต่ส่งต่อไปยังขั้น Repair หรือ **Safe Abstention** ที่เราจะสร้างต่อใน Day 106",
  ],

  reviewCards: [
    rc(
      "d105-rc1",
      "รูปแบบ Inline Citation มาตรฐานในระบบ RAG ของเราคืออะไร และมีข้อดีอย่างไร?",
      "`[doc_id#chunk_id]` — ระบุทั้งเอกสารและย่อหน้าย่อย มนุษย์อ่านง่าย UI ทำลิงก์คลิกได้ และ Regex สกัดตรวจเทียบกับ `retrieved_chunks` ได้แบบ deterministic",
    ),
    rc(
      "d105-rc2",
      "Uncited Claim, Phantom Citation และ Unsupported Claim ต่างกันอย่างไร?",
      "Uncited = ประโยคไม่มีแท็กอ้างอิง; Phantom = มีแท็กแต่รหัสไม่อยู่ใน retrieved chunks; Unsupported = แท็กมีอยู่จริงแต่ตัวเลข/เนื้อหาใน chunk ไม่ตรงกับที่อ้าง",
    ),
    rc(
      "d105-rc3",
      "ทำไมต้องลบแท็ก `[doc_id#chunk_id]` ออกก่อนสกัดตัวเลขในประโยคไปตรวจกับ chunk?",
      "เพื่อไม่ให้ตัวเลขในรหัส เช่น `01` ใน `#c01` ถูกเข้าใจผิดว่าเป็นตัวเลขในเนื้อความของข้อกล่าวอ้าง",
    ),
    rc(
      "d105-rc4",
      "ถ้า `claims` ที่ส่งเข้า verifier เป็นลิสต์ว่าง `[]` ค่า `is_grounded` ควรเป็นเท่าใด?",
      "ต้องเป็น `False` เสมอ (Fail-Closed) เพราะคำตอบที่ไม่มีข้อกล่าวอ้างที่ตรวจผ่านเลยไม่ถือว่า grounded",
    ),
  ],

  sources: [
    {
      label: "Anthropic Docs — Cite your sources & Grounded RAG patterns",
      href: "https://docs.anthropic.com/en/docs/build-with-claude/citations",
    },
    {
      label: "Python Standard Library — re (Regular expression operations)",
      href: "https://docs.python.org/3/library/re.html",
    },
    {
      label: "Pydantic v2 Documentation — Models & Validation",
      href: "https://docs.pydantic.dev/latest/concepts/models/",
    },
  ],

  glossary: ["rag", "groundedness", "hallucination", "structured-output", "pydantic", "pytest"],
});
