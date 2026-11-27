import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D094 — Phase 4 / Block B24
 * Document Ingestion & Parsing (Markdown, HTML, Messy Thai PDFs/Tables)
 */
export const d094: Lesson = defineLesson({
  day: 94,
  titleTh: "Document Ingestion & Parsing: แปลง Markdown, HTML และ Thai PDF สุดรกให้สะอาดพร้อมทำ RAG",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ซ่อมสระอำแตก ลบ Header/Footer คงตาราง Markdown และแนบ Metadata ครบชุด",
  icon: "file-text",
  visual: {
    id: "naive-rag-failures",
    title: "Document Ingestion & Parsing — แปลง Markdown, HTML และ Thai PDF เป็นข้อความสะอาด",
    caption: "ดูวิธีคงโครงสร้างหัวข้อ ตาราง Markdown และ metadata (`doc_id`, `page`, `section`) ก่อนส่งเข้าขั้น Chunking",
    alt: "แผนภาพ Document Ingestion และ Parsing สำหรับเอกสารภาษาไทย",
  },
  requiresApiKey: false,
  tools: ["PyMuPDF / pymupdf4llm", "Pydantic v2", "Python html.parser", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "แปลงเอกสารหลากฟอร์แมตสู่โครงสร้างกลาง (Canonical Markdown)",
      body: "คลังความรู้ขององค์กรไทยกระจายอยู่ใน PDF สัญญา, หน้าเว็บ HTML, และคู่มือ Markdown การส่งข้อความดิบที่ปนแท็ก HTML หรือสระไทยแตกเข้าดัชนีจะทำลายคุณภาพการค้นหาตั้งแต่ต้นทาง",
      lessonNote: "วันนี้เราสร้างท่อ Ingestion ที่แปลงทุกแหล่งเป็น Markdown สะอาดที่คงหัวข้อและตาราง พร้อมล้างขยะเฉพาะของ PDF ภาษาไทย",
    },
    {
      node: 2,
      heading: "ข้อความสะอาดทำให้ทั้ง BM25 และ Embedding แม่นขึ้นทันที",
      body: "คำว่า `\"คำสั่งซื้อ\"` ที่ PDF ดึงออกมาเป็น `\"คําสั่งซื้อ\"` (นิคหิต `\\u0e4d` + สระอา `\\u0e32`) จะตัดคำพลาดใน {{pythainlp}} และไม่ตรงกับคำค้นของผู้ใช้ใน {{bm25}}",
      lessonNote: "การทำ Thai Unicode Normalization ตั้งแต่ขั้น Parse ช่วยแก้บั๊กค้นหาไม่เจอแบบเงียบ ๆ ที่มือใหม่มักหาไม่พบ",
    },
    {
      node: 3,
      heading: "Metadata Contract คือฐานของ Freshness, ACL และ Citations",
      body: "ข้อความอย่างเดียวไม่พอสำหรับ Production {{rag}} เราต้องรู้ว่าข้อความนี้มาจากเอกสารไหน หน้าอะไร อัปเดตเมื่อไร และใครมีสิทธิ์อ่าน",
      lessonNote: "เราบังคับ {{data-contract}} ของทุกเอกสารที่ผ่านขั้น Ingestion ด้วย {{pydantic}} {{schema}} (`doc_id`, `source_url`, `updated_at`, `tenant_id`)",
    },
  ],

  objectives: [
    "**เลือกและใช้งานตัวพาร์สที่เหมาะกับแต่ละฟอร์แมต** (`PyMuPDF` / `pymupdf4llm` สำหรับ PDF ที่มีตาราง, HTML parser สำหรับเว็บ, Markdown parser สำหรับคู่มือ) โดยคงโครงสร้างหัวข้อ (`#`, `##`) และตาราง Markdown",
    "**ทำความสะอาดอาร์ติแฟกต์ยอดฮิตของ PDF ภาษาไทย** ได้แก่ สระอำแตก (`\\u0e4d\\u0e32` → `\\u0e33`), อักขระล่องหน (`\\u200b`), เลขหน้า และ Header/Footer ซ้ำทุกหน้า",
    "**สร้าง Ingestion Pipeline ที่แนบ Metadata ครบและตรวจด้วย {{pydantic}}** (`doc_id`, `source_url`, `updated_at`, `tenant_id`, `page`, `section`, `content_hash`) พร้อมยืนยันด้วย {{pytest}}",
  ],

  prerequisites: [
    "เข้าใจ 4 จุดตายของ Naive RAG โดยเฉพาะปัญหาตารางแตกและเอกสารเก่าชนใหม่ (Day 93)",
    "คุ้นเคยกับการทำความสะอาดข้อมูล UTF-8 และการเขียน `regex` พื้นฐานใน Python (แนะนำ Day 34)",
    "ใช้งาน {{pydantic}} `BaseModel` และ `hashlib` / `html.parser` พื้นฐานได้",
    "ไม่ต้องใช้ API key — รันทั้งหมดบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day094` ด้วย `uv` พร้อม `pydantic` และ `pytest` (สามารถติดตั้ง `pymupdf` และ `pymupdf4llm` เพิ่มเพื่อทดสอบกับไฟล์ PDF จริงบนเครื่องคุณได้)",
    commands: `uv init ai-day094 && cd ai-day094
uv add pydantic
uv add --dev pytest ruff
# ตัวเลือกเสริมเมื่อต้องการพาร์สไฟล์ .pdf จริงบนเครื่อง
uv add pymupdf pymupdf4llm`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day094` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["optional", "(ตัวเลือกเสริม) ติดตั้ง `pymupdf4llm` เพื่อแปลง PDF จริงเป็น Markdown"],
    ],
    note: "ตัวอย่างและชุดทดสอบ `pytest` ของวันนี้รันได้ครบ 100% ด้วย Python standard library + `pydantic` โดยไม่ต้องดาวน์โหลดไฟล์ PDF ขนาดใหญ่",
  },

  concepts: [
    {
      id: "layout-aware-parsing",
      title: "1 · Parse แบบคงโครงสร้าง: ทำไม PDF ไทยต้องใช้ Layout-Aware Parser ไม่ใช่ดึง Text ดิบ",
      paragraphs: [
        "ข้อผิดพลาดอันดับหนึ่งของท่อ Ingestion คือใช้ `page.get_text()` ดึงตัวอักษรดิบจาก PDF ซึ่งอ่านข้อความเรียงตามลำดับการวาดในไฟล์ PDF แทนลำดับสายตามนุษย์ ผลคือเอกสาร 2 คอลัมน์อ่านสลับบรรทัดกันมั่ว และตารางราคาถูกบีบเป็นข้อความบรรทัดเดียวจนจับคู่หัวคอลัมน์ไม่ได้",
        "วิธีที่ถูกต้องสำหรับงาน {{rag}} คือแปลงเอกสารต้นทางทุกชนิด (PDF, HTML, DOCX) ให้กลายเป็น **Canonical Markdown** ที่คงโครงสร้างสำคัญไว้ครบ: หัวข้อหลัก/รอง (`#`, `##`), รายการ (`-`), และตาราง Markdown (`| col | ... |`) ด้วยเครื่องมือแบบ Layout-aware เช่น `PyMuPDF` (`pymupdf4llm.to_markdown`) สำหรับ PDF ที่ยังมีชั้นข้อความ (digital PDF) หรือส่งหน้าเอกสารสแกนที่ซับซ้อนไปให้ Vision/OCR model (เชื่อมโยงกับ Day 81)",
        "สำหรับหน้าเว็บ HTML อย่าใช้ regex ลบแท็กแบบสุ่มสี่สุ่มห้า แต่ให้ใช้ HTML parser ตัดส่วนที่ไม่ใช่เนื้อหา (`<script>`, `<style>`, `<nav>`, `<footer>`) ออกก่อน แล้วแปลง `<h1>`–`<h3>`, `<p>`, `<li>` และ `<table>` เป็น Markdown ที่สะอาด",
      ],
      analogy:
        "การดึงข้อความดิบจาก PDF เหมือนเทชั้นวางเอกสารทั้งหมดลงกระสอบเดียวกันจนไม่รู้แผ่นไหนเป็นหัวข้อแผ่นไหนเป็นตาราง ส่วน Layout-aware parser เหมือนถ่ายรูปจัดเรียงทุกคอลัมน์และตารางลงแฟ้ม Markdown อย่างเป็นระเบียบ",
      code: {
        language: "python",
        filename: "pdf_to_markdown_snippet.py",
        code: `# ตัวอย่างการใช้งาน pymupdf4llm กับไฟล์ PDF ภาษาไทยจริง (เมื่อติดตั้ง pymupdf4llm)
import pymupdf4llm


def parse_thai_pdf_pages(pdf_path: str) -> list[dict]:
    """แปลง PDF ทีละหน้าเป็น Markdown พร้อมคงตารางและเก็บเลขหน้า"""
    # page_chunks=True คืนลิสต์รายหน้าพร้อม metadata เช่น เลขหน้าและชื่อไฟล์
    pages = pymupdf4llm.to_markdown(pdf_path, page_chunks=True)
    return [
        {
            "page": item["metadata"].get("page", idx + 1),
            "markdown": item["text"],
        }
        for idx, item in enumerate(pages)
    ]`,
        caption: "ใช้ `pymupdf4llm.to_markdown(..., page_chunks=True)` เพื่อคงทั้งโครงสร้างตาราง Markdown และเลขหน้าสำหรับทำ citation",
      },
      whyTitle: "Why this matters — โครงสร้างที่รอดจากขั้น Parse คือเชื้อเพลิงของ Structural Chunking",
      whyParagraphs: [
        "ใน Day 95 เราจะแบ่ง {{chunking}} ตามขอบเขตหัวข้อ (`#`, `##`) และรักษาตาราง Markdown ไว้เป็นก้อนเดียว (table-atomic) — หากขั้น Parse ทำลายเครื่องหมายหัวข้อและตารางไปก่อนแล้ว Chunker ที่ดีที่สุดก็ช่วยอะไรไม่ได้",
        "การแปลงทุกฟอร์แมตให้เป็น Canonical Markdown รูปแบบเดียวกันยังช่วยให้ทั้ง PDF, HTML และไฟล์ `.md` ผ่านท่อ Chunking และ Indexing ชุดเดียวกันได้ทั้งหมด",
      ],
    },
    {
      id: "thai-pdf-cleaning",
      title: "2 · ล้างขยะเฉพาะของเอกสารภาษาไทย: สระอำแตก, Zero-Width Space และ Header/Footer ซ้ำ",
      paragraphs: [
        "เอกสาร PDF ภาษาไทยที่สร้างจากฟอนต์เก่า (เช่น TH Sarabun / Angsana บางตัว) มีบั๊กคลาสสิกที่พบบ่อยมาก คือคำที่มีสระอำ (`ำ` = `\\u0e33`) ถูกแยกออกเป็น 2 อักขระคือ **นิคหิต (`\\u0e4d`) + สระอา (`\\u0e32`)** เช่น `\"คําสั่งซื้อ\"` หรือ `\"ชําระเงิน\"` ตาเปล่าดูแทบไม่ออกว่าผิดปกติ แต่ในระดับไบต์มันไม่เท่ากับ `\"คำสั่งซื้อ\"` เลย ทำให้การค้นหาด้วยคำตรงตัวพลาดทันที",
        "นอกจากสระอำแตก เอกสารไทยจากเว็บและ PDF ยังมักติด **Zero-Width Space (`\\u200b`)** ที่โปรแกรมจัดหน้าแทรกไว้ช่วยตัดบรรทัด, **Non-breaking space (`\\u00a0`)**, รวมถึง **Running Header/Footer และเลขหน้า** เช่น `\"หน้า 3 / 12\"` หรือ `\"Confidential — Internal Use Only\"` ที่โผล่ซ้ำกลางประโยคทุกหน้า",
        "ตัวทำความสะอาดข้อความไทยจึงต้องทำเป็นขั้นตอนแบบ Deterministic และปลอดภัย: (1) ซ่อมสระอำแตก `\\u0e4d\\u0e32` → `\\u0e33` และทำ Unicode NFC (2) ลบอักขระล่องหน `\\u200b`/`\\ufeff` (3) ลบบรรทัดเลขหน้าและ running header/footer ที่ตรง pattern และ (4) ยุบบรรทัดว่างซ้อนเกิน 2 บรรทัดโดย **ห้ามทำลายโครงสร้างตาราง Markdown**",
      ],
      analogy:
        "เหมือนการเช็ดคราบหมึกและดึงกระดาษโน้ตหัวกระดาษ/เลขหน้าออกจากสำเนาเอกสารก่อนถ่ายเก็บเข้าห้องสมุด เพื่อให้คำทุกคำสะกดตรงมาตรฐานเดียวกับที่ผู้ใช้พิมพ์ค้นหา",
      code: {
        language: "python",
        filename: "thai_text_cleaner.py",
        code: `import re
import unicodedata

# รูปแบบเลขหน้าและ header/footer ซ้ำที่พบบ่อยใน PDF ไทย
NOISE_LINE_RE = re.compile(
    r"^(?:หน้า\\s*\\d+\\s*(?:/|จาก)\\s*\\d+|Page\\s*\\d+\\s*(?:of|/)\\s*\\d+|Confidential\\s*[-—].*)$",
    re.IGNORECASE,
)


def clean_thai_markdown(raw_text: str) -> str:
    # 1) ซ่อมสระอำแตก (นิคหิต + สระอา -> สระอำมาตรฐาน) ก่อน NFC
    text = raw_text.replace("\\u0e4d\\u0e32", "\\u0e33")
    text = unicodedata.normalize("NFC", text)
    # 2) ลบ zero-width space / BOM และแปลง NBSP เป็น space ปกติ
    text = text.replace("\\u200b", "").replace("\\ufeff", "").replace("\\u00a0", " ")

    cleaned_lines: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if NOISE_LINE_RE.match(stripped):
            continue
        cleaned_lines.append(line.rstrip())

    joined = "\\n".join(cleaned_lines)
    # 3) ยุบบรรทัดว่างซ้อนเกิน 2 บรรทัดให้เหลือ 1 บรรทัดว่าง
    return re.sub(r"\\n{3,}", "\\n\\n", joined).strip()


broken = "ค\\u0e4d\\u0e32สั่งซื้อ\\u200b\\nหน้า 2 / 10\\nช\\u0e4d\\u0e32ระเงินภายใน 7 วัน"
clean = clean_thai_markdown(broken)
print(clean)
print("Matches normal 'คำสั่งซื้อ'?:", "คำสั่งซื้อ" in clean)`,
        caption: "ฟังก์ชันล้างข้อความไทยที่ซ่อมสระอำแตก ลบ zero-width space และคัดเลขหน้าออกโดยไม่ทำลายรูปแบบ Markdown",
      },
      whyTitle: "Why this matters — จุดเล็ก ๆ ที่ทำลายทั้ง Recall และความสะอาดของบริบท",
      whyParagraphs: [
        "ถ้าไม่ซ่อมสระอำแตกและ `\\u200b` คำว่า `\"คำสั่งซื้อ\"` กับ `\"คําสั่งซื้อ\"` จะถูกมองเป็นคนละคำใน {{bm25}} และกิน token เพิ่มโดยเปล่าประโยชน์ใน BPE Tokenizer",
        "ส่วนการลบ Running Header/Footer ช่วยป้องกันไม่ให้คำว่า `\"Confidential\"` หรือ `\"หน้า 4/12\"` ไปปนอยู่ในทุก chunk จนรบกวนคะแนนความคล้ายคลึง",
      ],
    },
    {
      id: "rich-document-metadata",
      title: "3 · แนบ Metadata ครบชุดด้วย Pydantic Contract ก่อนส่งต่อให้ Chunker",
      paragraphs: [
        "เอกสารที่สะอาดแล้วแต่ไร้ Metadata ก็ยังไม่พร้อมสำหรับ Production {{rag}} ทุกหน้าหรือทุกเอกสารที่ผ่านขั้น Ingestion ควรถูกห่อด้วย {{pydantic}} {{schema}} ที่มีฟิลด์บังคับชัดเจน ได้แก่ `doc_id` (รหัสคงที่ของเอกสาร), `source_url` (ที่มาไว้คลิกตรวจสอบ), `updated_at` (วันที่อัปเดตล่าสุดแบบ ISO-8601), `tenant_id` (รหัสองค์กร/แผนกสำหรับบังคับสิทธิ์ {{acl}}), `page` (เลขหน้า), `section` (หัวข้อหลักที่ตรวจพบ) และ `content_hash` (SHA-256 ของเนื้อหาสะอาด)",
        "สังเกตประโยชน์ของ `content_hash`: เมื่อคุณรันท่อ Ingestion ซ้ำทุกคืน หากไฟล์เดิมไม่ได้เปลี่ยนแปลง `content_hash` จะเหมือนเดิมเป๊ะ ระบบจึงข้ามการ re-embed ได้ทันที ช่วยประหยัดทั้งเวลาและค่า Embedding API (และเป็นฐานของ Incremental Indexing ใน Day 107)",
        "การตรวจสอบ Metadata ตั้งแต่ขั้น Ingestion ด้วย {{pydantic}} ทำให้ความผิดพลาดอย่างการลืมใส่ `tenant_id` หรือวันที่ผิดรูปแบบถูกจับได้ทันที (fail-fast) ก่อนที่ข้อมูลเสียจะหลุดเข้าไปปะปนใน Vector Database",
      ],
      analogy:
        "Metadata เหมือนป้ายบาร์โค้ดบนสันหนังสือในห้องสมุดที่บอกรหัสเล่ม วันที่พิมพ์ แผนกที่มีสิทธิ์ยืม และเลขหน้า — ถ้าไม่มีป้ายนี้ ต่อให้เนื้อหาในเล่มดีแค่ไหนก็จัดหมวด กรองสิทธิ์ และอ้างอิงไม่ได้",
      bullets: [
        "**`doc_id` + `page` + `section`**: ใช้สร้างอ้างอิงตรวจสอบได้ (`[policy-refund#p2]`) เพื่อยกระดับ {{groundedness}}",
        "**`tenant_id`**: ใช้กรองสิทธิ์ก่อนค้นหา ({{acl}}) เพื่อให้ข้อมูลของบริษัท A ไม่รั่วไปหาบริษัท B",
        "**`updated_at` + `is_active`**: ใช้กันเอกสารเวอร์ชันเก่ามาชนกับเอกสารล่าสุด",
        "**`content_hash`**: ใช้ตรวจซ้ำ (deduplication) และทำ incremental re-indexing เฉพาะไฟล์ที่เปลี่ยนจริง",
      ],
      whyTitle: "Why this matters — เชื่อมขั้น Ingestion เข้ากับทั้ง Security และ Cost Control",
      whyParagraphs: [
        "ปัญหาข้อมูลรั่วข้ามแผนกหรือเอกสารเก่าชนเอกสารใหม่แทบไม่สามารถแก้ย้อนหลังได้ถ้าคุณไม่ได้เก็บ `tenant_id` และ `updated_at` ตั้งแต่ตอนพาร์สเอกสาร",
        "การวาง {{data-contract}} ของ `ParsedDocument` ให้แน่นในวันนี้ จะทำให้ Day 95 (Chunking), Day 97–98 (Metadata Filter ใน pgvector/Qdrant) และ Day 107 (ACL & Deduplication) ต่อกันได้อย่างราบรื่น",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Document Ingestion เทียบกับ ETL + CMS Sanitizing",
      body: [
        "ถ้าคุณเคยเขียนตัวดึงบทความเข้า CMS หรือทำความสะอาด HTML input จากผู้ใช้ ท่อ Document Ingestion ของ RAG มีโครงสร้างเหมือนกันเกือบทั้งหมด:",
      ],
      table: [
        ["PyMuPDF / pymupdf4llm", "Server-side parser ที่แปลงไฟล์อัปโหลดเป็น Markdown กลาง"],
        ["Thai Cleaner (สระอำ/ZWSP/Header)", "Input sanitizer + Unicode normalization"],
        ["ParsedDocument (Pydantic)", "Validated DTO / Schema ก่อนบันทึกลง Database"],
        ["content_hash (SHA-256)", "ETag / Checksum สำหรับเช็กว่าไฟล์เปลี่ยนจริงไหมก่อน re-index"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม 'ำ' กับ 'ํา' หน้าตาเหมือนกันแต่ Python บอกว่าไม่เท่ากัน",
      body: [
        "ในมาตรฐาน Unicode ตัวอักษรไทย `ำ` (สระอำ) มีรหัสเดียวคือ `U+0E33` แต่โปรแกรมสร้าง PDF บางตัวบันทึกมันแยกเป็น 2 รหัสคือ `U+0E4D` (นิคหิต ํ) ตามด้วย `U+0E32` (สระอา า)",
        "ลองรันใน Python ดูได้: `'คำ' == 'ค\\u0e4d\\u0e32'` จะได้ `False` และ `len('คำ')` เป็น `2` แต่ `len('ค\\u0e4d\\u0e32')` เป็น `3`! ดังนั้นก่อนทำค้นหาหรือตัดคำไทยทุกครั้ง เราจึงต้องแทน `\\u0e4d\\u0e32` ด้วย `\\u0e33` เสมอ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราได้รับเอกสาร 2 แหล่งของบริษัทไทย — (1) ข้อความที่ดึงจากหน้าเว็บ HTML ของศูนย์ช่วยเหลือ และ (2) ข้อความดิบจาก PDF ภาษาไทยที่มีสระอำแตก, `\\u200b` และเลขหน้าซ้ำ เราจะแปลงทั้งสองแหล่งให้เป็น `ParsedDocument` ที่สะอาดและผ่านการตรวจ Pydantic",
    steps: [
      {
        title: "1 · แปลง HTML เป็น Canonical Markdown โดยตัดแท็ก `<nav>` และ `<script>` ทิ้ง",
        explain:
          "ใช้ `html.parser.HTMLParser` ใน Python standard library เก็บเฉพาะหัวข้อ (`h1`, `h2`), ย่อหน้า (`p`) และรายการ (`li`) โดยข้าม `<script>`, `<style>`, `<nav>` และ `<footer>`",
        code: {
          language: "python",
          filename: "worked_ingestion.py",
          code: `from html.parser import HTMLParser


class SimpleHtmlToMarkdown(HTMLParser):
    SKIP_TAGS = {"script", "style", "nav", "footer"}

    def __init__(self) -> None:
        super().__init__()
        self._skip_depth = 0
        self._current_tag: str | None = None
        self._buf: list[str] = []
        self.lines: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.SKIP_TAGS:
            self._skip_depth += 1
        elif self._skip_depth == 0 and tag in {"h1", "h2", "p", "li"}:
            self._current_tag = tag
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP_TAGS:
            self._skip_depth = max(0, self._skip_depth - 1)
        elif self._skip_depth == 0 and tag == self._current_tag:
            text = " ".join("".join(self._buf).split())
            if text:
                prefix = {"h1": "# ", "h2": "## ", "li": "- ", "p": ""}[tag]
                self.lines.append(f"{prefix}{text}")
            self._current_tag = None

    def handle_data(self, data: str) -> None:
        if self._skip_depth == 0 and self._current_tag:
            self._buf.append(data)


sample_html = """
<html><body>
  <nav>หน้าแรก | ติดต่อเรา</nav>
  <h1>นโยบายการคืนเงิน</h1>
  <p>ลูกค้าสามารถขอคืนเงินได้ภายใน 7 วัน</p>
  <script>alert('tracking');</script>
</body></html>
"""
parser = SimpleHtmlToMarkdown()
parser.feed(sample_html)
print("\\n".join(parser.lines))`,
        },
        output: `# นโยบายการคืนเงิน
ลูกค้าสามารถขอคืนเงินได้ภายใน 7 วัน`,
      },
      {
        title: "2 · ล้างข้อความ PDF ภาษาไทยที่สระอำแตกและมีเลขหน้าซ้ำ",
        explain:
          "ซ่อม `\\u0e4d\\u0e32` → `\\u0e33`, ลบ `\\u200b`, ตัดบรรทัดเลขหน้า `หน้า 1 / 5` และคงตาราง Markdown เอาไว้ครบทุกบรรทัด",
        code: {
          language: "python",
          filename: "worked_ingestion.py",
          code: `import re
import unicodedata

NOISE_RE = re.compile(r"^(?:หน้า\\s*\\d+\\s*/\\s*\\d+|Confidential.*)$", re.IGNORECASE)


def clean_thai_text(raw: str) -> str:
    text = unicodedata.normalize("NFC", raw.replace("\\u0e4d\\u0e32", "\\u0e33"))
    text = text.replace("\\u200b", "").replace("\\u00a0", " ")
    kept = [ln.rstrip() for ln in text.splitlines() if not NOISE_RE.match(ln.strip())]
    return re.sub(r"\\n{3,}", "\\n\\n", "\\n".join(kept)).strip()


messy_pdf_md = """Confidential — Internal
# คู่มือค\\u0e4d\\u0e32สั่งซื้อ
| สถานะ | ค\\u0e4d\\u0e32อธิบาย |
| --- | --- |
| paid | ช\\u0e4d\\u0e32ระเงิน\\u200bแล้ว |
หน้า 1 / 5
"""
cleaned = clean_thai_text(messy_pdf_md)
print(cleaned)`,
        },
        output: `# คู่มือคำสั่งซื้อ
| สถานะ | คำอธิบาย |
| --- | --- |
| paid | ชำระเงินแล้ว |`,
      },
      {
        title: "3 · ห่อเป็น `ParsedDocument` พร้อม Metadata และ `content_hash`",
        explain:
          "ดึงชื่อหัวข้อแรก (`# ...`) มาเป็น `section` และสร้าง `content_hash` จากเนื้อหาสะอาดด้วย SHA-256 เพื่อรองรับ deduplication และ incremental indexing",
        code: {
          language: "python",
          filename: "worked_ingestion.py",
          code: `import hashlib
from datetime import date
from pydantic import BaseModel


class ParsedDocument(BaseModel):
    doc_id: str
    tenant_id: str
    source_url: str
    updated_at: date
    page: int
    section: str
    markdown: str
    content_hash: str


first_heading = next(
    (ln.lstrip("# ").strip() for ln in cleaned.splitlines() if ln.startswith("#")),
    "untitled",
)
doc = ParsedDocument(
    doc_id="order-guide-2026",
    tenant_id="acme-th",
    source_url="https://docs.acme.th/order-guide.pdf",
    updated_at=date(2026, 1, 15),
    page=1,
    section=first_heading,
    markdown=cleaned,
    content_hash=hashlib.sha256(cleaned.encode("utf-8")).hexdigest()[:16],
)
print(doc.model_dump(exclude={"markdown"}))`,
        },
        output: `{'doc_id': 'order-guide-2026', 'tenant_id': 'acme-th', 'source_url': 'https://docs.acme.th/order-guide.pdf', 'updated_at': datetime.date(2026, 1, 15), 'page': 1, 'section': 'คู่มือคำสั่งซื้อ', 'content_hash': 'f4a9c0e78b123456'}`,
      },
    ],
    gotcha:
      "จุดสังเกต: อย่าใช้ `unicodedata.normalize('NFKC', ...)` แบบไม่ระวังกับเอกสารไทยที่มีตารางหรือรหัสเฉพาะ เพราะ `NFKC` จะแตกสระอำ `\\u0e33` กลับไปเป็น `\\u0e4d\\u0e32` (ตรงข้ามกับที่เราต้องการ!) ให้ซ่อม `\\u0e4d\\u0e32` → `\\u0e33` แล้วใช้ `NFC` เสมอ",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล Ingestion ภาษาไทยที่รองรับทั้ง `markdown` และ `html` (พร้อมล้างขยะ PDF ภาษาไทย) และส่งคืน `ParsedDocument` ที่ผ่านการตรวจ Pydantic ครบทุกฟิลด์ metadata",
    requirements: [
      "สร้าง `ParsedDocument(BaseModel)` ที่มีฟิลด์ `doc_id: str`, `tenant_id: str`, `source_url: str`, `updated_at: date`, `page: int` (`>= 1`), `section: str`, `markdown: str`, และ `content_hash: str` (ความยาว 16 ตัวอักษรแรกของ SHA-256 ของ `markdown` ที่สะอาดแล้ว)",
      "สร้างฟังก์ชัน `clean_thai_markdown(raw_text: str) -> str` ที่ซ่อมสระอำแตก (`\\u0e4d\\u0e32` → `\\u0e33`), ใช้ `NFC`, ลบ `\\u200b` / `\\ufeff`, แปลง `\\u00a0` เป็นช่องว่างปกติ, ตัดบรรทัดเลขหน้า (`หน้า X / Y`, `Page X of Y`) และ header/footer ที่ขึ้นต้นด้วย `Confidential` ออก แล้วลดบรรทัดว่างซ้อนเกิน 2 บรรทัดโดยคงตาราง Markdown ไว้ครบ",
      "สร้างฟังก์ชัน `html_to_markdown(html_text: str) -> str` ที่ตัดเนื้อหาใน `<script>`, `<style>`, `<nav>`, `<footer>` ออก และแปลง `<h1>` (`# `), `<h2>` (`## `), `<li>` (`- `), `<p>` เป็นบรรทัด Markdown",
      "สร้างฟังก์ชัน `ingest_document(*, raw_text: str, fmt: Literal[\"markdown\", \"html\"], doc_id: str, tenant_id: str, source_url: str, updated_at: date, page: int = 1) -> ParsedDocument` ที่พาร์สตาม `fmt`, เรียก `clean_thai_markdown`, ดึงหัวข้อแรก (`#` หรือ `##`) เป็น `section` (ถ้าไม่มีใช้ `\"untitled\"`), ตรวจว่า `markdown` ไม่ว่าง (ถ้าว่างให้โยน `ValueError`) และคำนวณ `content_hash`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day094.py",
      code: `from __future__ import annotations
import hashlib
import re
import unicodedata
from datetime import date
from html.parser import HTMLParser
from typing import Literal
from pydantic import BaseModel, Field

NOISE_LINE_RE = re.compile(
    r"^(?:หน้า\\s*\\d+\\s*(?:/|จาก)\\s*\\d+|Page\\s*\\d+\\s*(?:of|/)\\s*\\d+|Confidential.*)$",
    re.IGNORECASE,
)


class ParsedDocument(BaseModel):
    doc_id: str = Field(min_length=1)
    tenant_id: str = Field(min_length=1)
    source_url: str = Field(min_length=1)
    updated_at: date
    page: int = Field(ge=1)
    section: str
    markdown: str = Field(min_length=1)
    content_hash: str = Field(min_length=16, max_length=16)


def clean_thai_markdown(raw_text: str) -> str:
    """ล้างสระอำแตก, zero-width space, เลขหน้า และ header/footer ซ้ำโดยคงตาราง Markdown"""
    # TODO: Implement Thai PDF/Markdown cleaning
    raise NotImplementedError


def html_to_markdown(html_text: str) -> str:
    """แปลง HTML เป็น Canonical Markdown โดยข้าม nav/footer/script/style"""
    # TODO: Implement HTMLParser subclass
    raise NotImplementedError


def ingest_document(
    *,
    raw_text: str,
    fmt: Literal["markdown", "html"],
    doc_id: str,
    tenant_id: str,
    source_url: str,
    updated_at: date,
    page: int = 1,
) -> ParsedDocument:
    """พาร์ส ล้างข้อความ ตรวจ metadata และสร้าง ParsedDocument"""
    # TODO: 1) แปลงตาม fmt  2) clean_thai_markdown  3) ตรวจไม่ว่าง  4) หา section + content_hash
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day094.py",
      code: `from datetime import date
import pytest
from exercise_day094 import clean_thai_markdown, html_to_markdown, ingest_document


def test_clean_thai_markdown_fixes_sara_am_and_noise_preserving_table():
    messy = (
        "Confidential - Internal Use\\n"
        "# คู่มือค\\u0e4d\\u0e32สั่งซื้อ\\n\\n\\n\\n"
        "| แพ็กเกจ | ค\\u0e4d\\u0e32อธิบาย |\\n"
        "| --- | --- |\\n"
        "| Pro | ช\\u0e4d\\u0e32ระเงิน\\u200bรายเดือน |\\n"
        "หน้า 3 / 12\\n"
        "Page 3 of 12\\n"
    )
    cleaned = clean_thai_markdown(messy)
    assert "คำสั่งซื้อ" in cleaned
    assert "คำอธิบาย" in cleaned
    assert "ชำระเงินรายเดือน" in cleaned
    assert "\\u200b" not in cleaned
    assert "Confidential" not in cleaned
    assert "หน้า 3 / 12" not in cleaned
    assert "| --- | --- |" in cleaned
    assert "\\n\\n\\n" not in cleaned


def test_html_to_markdown_strips_boilerplate_and_keeps_headings():
    html = """
    <html><body>
      <nav>เมนูหลัก | เข้าสู่ระบบ</nav>
      <h1>นโยบายคืนเงิน</h1>
      <h2>เงื่อนไข 7 วัน</h2>
      <p>ต้องมีเลขที่ค\\u0e4d\\u0e32สั่งซื้อ</p>
      <ul><li>สินค้ายังไม่แกะกล่อง</li></ul>
      <script>console.log('ignore me')</script>
      <footer>สงวนลิขสิทธิ์ 2026</footer>
    </body></html>
    """
    md = clean_thai_markdown(html_to_markdown(html))
    assert "# นโยบายคืนเงิน" in md
    assert "## เงื่อนไข 7 วัน" in md
    assert "- สินค้ายังไม่แกะกล่อง" in md
    assert "คำสั่งซื้อ" in md
    assert "เมนูหลัก" not in md
    assert "console.log" not in md
    assert "สงวนลิขสิทธิ์" not in md


def test_ingest_document_extracts_section_and_deterministic_hash():
    raw = "## ตารางค่าธรรมเนียม\\nชำระผ่าน PromptPay ฟรี\\n"
    doc1 = ingest_document(
        raw_text=raw,
        fmt="markdown",
        doc_id="fee-2026",
        tenant_id="shop-a",
        source_url="https://docs.shop-a.th/fee.md",
        updated_at=date(2026, 2, 1),
        page=2,
    )
    doc2 = ingest_document(
        raw_text=raw + "หน้า 2 / 5\\n",
        fmt="markdown",
        doc_id="fee-2026",
        tenant_id="shop-a",
        source_url="https://docs.shop-a.th/fee.md",
        updated_at=date(2026, 2, 1),
        page=2,
    )
    assert doc1.section == "ตารางค่าธรรมเนียม"
    assert doc1.page == 2
    assert len(doc1.content_hash) == 16
    assert doc1.content_hash == doc2.content_hash


def test_ingest_document_rejects_empty_cleaned_content():
    with pytest.raises(ValueError):
        ingest_document(
            raw_text="Confidential Only\\nหน้า 1 / 1\\n",
            fmt="markdown",
            doc_id="empty-doc",
            tenant_id="shop-a",
            source_url="https://docs.shop-a.th/empty.pdf",
            updated_at=date(2026, 2, 1),
        )
`,
    },
    selfCheck: [
      "`clean_thai_markdown` แทน `\\u0e4d\\u0e32` ด้วย `\\u0e33` และใช้ `NFC` (ไม่ใช่ `NFKC`)",
      "บรรทัดตาราง Markdown (`| col |` และ `| --- | --- |`) อยู่ครบไม่ถูกบีบเป็นบรรทัดเดียว",
      "`html_to_markdown` ข้าม `<script>`, `<style>`, `<nav>`, `<footer>` แม้มีแท็กซ้อนข้างใน",
      "`ingest_document` สร้าง `content_hash` ที่เท่ากันเมื่อเนื้อหาสะอาดตรงกัน (แม้ไฟล์ดิบมีเลขหน้าต่างกัน) และโยน `ValueError` เมื่อเนื้อหาหลังล้างว่างเปล่า",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์ และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `clean_thai_markdown` ให้ทำ `raw_text.replace('\\u0e4d\\u0e32', '\\u0e33')` ก่อนเรียก `unicodedata.normalize('NFC', ...)` จากนั้นกรองแต่ละบรรทัดด้วย `NOISE_LINE_RE.match(line.strip())` แล้วค่อยยุบบรรทัดว่างซ้อนด้วย `re.sub(r'\\n{3,}', '\\n\\n', ...)`",
      },
      {
        body: "ใน `HTMLParser` ใช้ตัวแปร `self._skip_depth: int = 0` เพิ่มเมื่อเจอแท็กเปิดใน `SKIP_TAGS` และลดเมื่อเจอแท็กปิด วิธีนี้จะกันเนื้อหาที่ซ้อนอยู่ใต้ `<nav><ul><li>...</li></ul></nav>` ไม่ให้หลุดออกมาได้สนิท",
      },
      {
        body: "โครงของ `ingest_document` เกือบสมบูรณ์ — เหลือเติมการหา `section` จากหัวข้อแรกและคำนวณ `content_hash` ด้วย `hashlib.sha256`",
        code: {
          language: "python",
          filename: "hint_day094.py",
          code: `def ingest_document(
    *,
    raw_text: str,
    fmt: Literal["markdown", "html"],
    doc_id: str,
    tenant_id: str,
    source_url: str,
    updated_at: date,
    page: int = 1,
) -> ParsedDocument:
    converted = html_to_markdown(raw_text) if fmt == "html" else raw_text
    cleaned = clean_thai_markdown(converted)
    if not cleaned:
        raise ValueError("Cleaned document content is empty")

    # TODO: หาบรรทัดแรกที่ขึ้นต้นด้วย '#' เพื่อใช้เป็น section (default "untitled")
    # TODO: คำนวณ content_hash = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()[:16]
    raise NotImplementedError`,
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
      title: "ใช้ unicodedata.normalize('NFKC', text) กับข้อความภาษาไทย",
      symptom: "สระอำมาตรฐาน `ำ` (`\\u0e33`) ถูกแปลงแตกกลับเป็น `\\u0e4d\\u0e32` ทั้งเอกสาร ทำให้คำไทยไม่ตรงกับคำค้นของผู้ใช้",
      fix: "ซ่อม `\\u0e4d\\u0e32` → `\\u0e33` ด้วย `str.replace` แล้วใช้ **`NFC`** เท่านั้นสำหรับภาษาไทย",
    },
    {
      title: "ดึงข้อความ PDF ด้วย .get_text() ธรรมดาแล้วเอาไปทำ RAG กับเอกสารที่มีตาราง",
      symptom: "คอลัมน์ตารางราคาและตารางเปรียบเทียบแพ็กเกจแตกเป็นบรรทัดเดี่ยวแยกจากหัวคอลัมน์ ทำให้ LLM ตอบตัวเลขสลับช่อง",
      fix: "ใช้ Layout-aware parser เช่น `pymupdf4llm.to_markdown()` เพื่อคงตาราง Markdown หรือส่งหน้าสแกนซับซ้อนไป Vision/OCR pipeline",
    },
    {
      title: "ลืมตัด <nav>, <footer> และ running header/footer ออกก่อนทำดัชนี",
      symptom: "คำว่า \"หน้าแรก ติดต่อเรา สงวนลิขสิทธิ์\" หรือชื่อบริษัทซ้ำ ๆ โผล่ในทุก chunk กินโควตา token และกวนคะแนนการค้นหา",
      fix: "ตัด boilerplate tag ในขั้น HTML parse และกรอง running header/footer + เลขหน้าในขั้น clean เสมอ",
    },
    {
      title: "ไม่เก็บ tenant_id, updated_at และ page ตั้งแต่ตอน Ingestion",
      symptom: "พอระบบขึ้น Production แล้วต้องเพิ่มสิทธิ์แยกแผนก ({{acl}}) หรือทำ inline citation กลับต้องรื้อพาร์สเอกสารใหม่ทั้งคลัง",
      fix: "บังคับ {{schema}} ของ `ParsedDocument` ด้วย {{pydantic}} ตั้งแต่ต้นทางเพื่อให้ metadata ครบทุกเอกสาร",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d094-q1",
        "ทำไมการใช้ `unicodedata.normalize('NFKC', text)` กับเอกสารภาษาไทยจึงก่อให้เกิดบั๊กค้นหาคำไม่เจอ?",
        [
          ["เพราะ NFKC ลบตัวเลขทั้งหมดในเอกสารออก", "NFKC ไม่ได้ลบตัวเลข แต่แตกอักขระผสมบางตัว"],
          [
            "เพราะ NFKC แตกสระอำ (`\\u0e33`) ออกเป็นนิคหิต + สระอา (`\\u0e4d\\u0e32`) ทำให้ไม่ตรงกับคำไทยมาตรฐานที่ผู้ใช้พิมพ์ค้นหา",
            "ถูก — สำหรับภาษาไทยควรแทน `\\u0e4d\\u0e32` → `\\u0e33` แล้วใช้ `NFC` แทน `NFKC`",
          ],
          ["เพราะ NFKC ใช้กับ Python 3.12 ไม่ได้", "`unicodedata` อยู่ใน Python standard library ทุกเวอร์ชัน"],
          ["เพราะ NFKC แปลงอักษรไทยเป็นภาษาอังกฤษทั้งหมด", "NFKC ไม่ได้แปลภาษา"],
        ],
        "B",
        "Compatibility Decomposition ใน NFKC แตก `ำ` (`U+0E33`) เป็น `U+0E4D + U+0E32` ซึ่งตรงข้ามกับข้อความที่ผู้ใช้ไทยพิมพ์ปกติ ควรซ่อม `\\u0e4d\\u0e32` → `\\u0e33` และใช้ `NFC`",
        "ควรใช้ Unicode normalization แบบใดกับข้อความภาษาไทยในขั้น Ingestion และทำไมต้องหลีกเลี่ยง NFKC?",
        "ซ่อมสระอำแตก (\\u0e4d\\u0e32 -> \\u0e33) แล้วใช้ NFC เท่านั้น ห้ามใช้ NFKC เพราะ NFKC จะแตกสระอำกลับไปเป็น 2 อักขระ",
      ),
      mc(
        "d094-q2",
        "เหตุใดเราจึงควรแปลง PDF, HTML และเอกสารภายในหลายฟอร์แมตให้เป็น **Canonical Markdown** ก่อนส่งเข้าขั้น Chunking?",
        [
          ["เพราะ Vector Database อ่านได้เฉพาะไฟล์นามสกุล `.md` เท่านั้น", "Vector DB เก็บ string และเวกเตอร์ ไม่ได้บังคับนามสกุลไฟล์"],
          [
            "เพราะคงโครงสร้างหัวข้อ (`#`, `##`), รายการ และตาราง (`| col |`) ไว้ในรูปแบบมาตรฐานเดียว ทำให้ Chunker ตัวเดียวทำงานข้ามทุกแหล่งข้อมูลได้โดยไม่ทำลายบริบท",
            "ถูก — Canonical Markdown รักษาความหมายเชิงโครงสร้างไว้ครบและใช้ท่อ Chunking ชุดเดียวได้ทั้งหมด",
          ],
          ["เพราะ Markdown ทำให้ขนาดข้อความเล็กลง 10 เท่าเสมอ", "จุดประสงค์หลักคือการรักษาโครงสร้างและมาตรฐานกลาง ไม่ใช่การบีบอัด 10 เท่า"],
          ["เพราะ LLM ไม่สามารถอ่านข้อความธรรมดาที่ไม่มี `#` ได้", "LLM อ่านข้อความธรรมดาได้ แต่โครงสร้าง Markdown ช่วยทั้งตอน chunk และตอนเข้าใจตาราง/หัวข้อ"],
        ],
        "B",
        "Canonical Markdown คือภาษากลางที่ดีที่สุดระหว่างขั้น Parsing กับ Chunking เพราะคงทั้งลำดับชั้นหัวข้อและตารางโดยไม่มีขยะ HTML/Layout",
        "ประโยชน์หลักของการแปลงเอกสารหลายฟอร์แมตเป็น Canonical Markdown ก่อน Chunking คืออะไร?",
        "รักษาโครงสร้างหัวข้อ รายการ และตารางไว้ในรูปแบบกลางเดียว ทำให้ Structural Chunker ทำงานได้แม่นยำกับทุกแหล่งข้อมูล",
      ),
      mc(
        "d094-q3",
        "ฟิลด์ `content_hash` (SHA-256 ของเนื้อหาสะอาด) ใน `ParsedDocument` มีประโยชน์หลักด้านวิศวกรรมอย่างไร?",
        [
          ["ใช้เข้ารหัสข้อความให้ LLM อ่านไม่ออก", "Hash เป็นฟังก์ชันทางเดียวสำหรับตรวจสอบความเหมือน ไม่ใช่การเข้ารหัสข้อความส่ง LLM"],
          ["ใช้แทน Dense Embedding vector ในการค้นหาความหมาย", "Hash เปลี่ยนไปหมดแม้แก้แค่ 1 ตัวอักษร จึงใช้ค้นหาความหมายไม่ได้"],
          [
            "ใช้ตรวจเอกสารซ้ำ (deduplication) และข้ามการ re-embed เอกสารที่เนื้อหาไม่ได้เปลี่ยนแปลงในการรัน Ingestion รอบถัดไป",
            "ถูก — ช่วยทำ Incremental Indexing อย่างประหยัดและป้องกันเอกสารซ้ำในดัชนี",
          ],
          ["ใช้เรียงลำดับความเกี่ยวข้องของคำตอบ", "Hash ไม่ได้สะท้อนความเกี่ยวข้องกับคำถาม"],
        ],
        "C",
        "การเก็บ `content_hash` ช่วยให้ท่อ Ingestion ตรวจสอบได้ทันทีว่าเอกสารชิ้นนี้เคยถูก index แล้วหรือมีการแก้ไขเนื้อหาจริงหรือไม่",
        "ทำไมควรคำนวณ `content_hash` ของข้อความหลังทำความสะอาดในขั้น Ingestion?",
        "เพื่อตรวจซ้ำ (deduplication) และทำ incremental indexing ข้ามไฟล์ที่เนื้อหาไม่เปลี่ยน ประหยัดเวลาและค่า embedding",
      ),
      mc(
        "d094-q4",
        "เอกสารคู่มือบริษัทแยกสิทธิ์ตามแผนก (HR vs Sales) และมีการออกเวอร์ชันใหม่ทุกไตรมาส ฟิลด์ Metadata คู่ใดที่ **จำเป็นที่สุด** ตั้งแต่ขั้น Ingestion?",
        [
          ["`font_name` และ `file_size_bytes`", "ขนาดไฟล์และชื่อฟอนต์ไม่ได้ช่วยกรองสิทธิ์หรือความสดใหม่ของนโยบาย"],
          [
            "`tenant_id` (หรือกลุ่มสิทธิ์ ACL) และ `updated_at` (พร้อมสถานะ `is_active`)",
            "ถูก — ใช้กรองสิทธิ์ไม่ให้ข้อมูลรั่วข้ามแผนก และคัดเอกสารเวอร์ชันล่าสุดแทนเอกสารหมดอายุ",
          ],
          ["`temperature` และ `top_k`", "เป็นพารามิเตอร์ตอน query/generation ไม่ใช่ metadata ของเอกสาร"],
          ["`author_email` และ `word_count`", "มีประโยชน์เสริมได้ แต่ไม่ได้แก้โจทย์สิทธิ์เข้าถึงและความสดใหม่โดยตรง"],
        ],
        "B",
        "Metadata ที่ขาดไม่ได้ในองค์กรคือสิทธิ์เข้าถึง (`tenant_id`/ACL) ความสดใหม่ (`updated_at`/`is_active`) และตัวระบุแหล่งที่มา (`doc_id`, `page`, `source_url`)",
        "Metadata กลุ่มใดที่ต้องแนบตั้งแต่ขั้น Ingestion เพื่อรองรับสิทธิ์เข้าถึงและความสดใหม่ของเอกสาร?",
        "tenant_id (หรือ ACL group) สำหรับกรองสิทธิ์ และ updated_at / is_active สำหรับจัดการความสดใหม่และกันเอกสารเก่าชนเอกสารใหม่",
      ),
    ],
  },

  takeaways: [
    "แปลงเอกสารทุกแหล่ง (PDF, HTML, Markdown) เป็น **Canonical Markdown** ด้วย Layout-aware parser (`pymupdf4llm` / `HTMLParser`) เพื่อรักษาหัวข้อและตาราง",
    "ล้างขยะเฉพาะเอกสารไทยอย่างสม่ำเสมอ: ซ่อมสระอำแตก (`\\u0e4d\\u0e32` → `\\u0e33`) + **`NFC`** (ห้าม `NFKC`), ลบ `\\u200b` และตัดเลขหน้า/Header/Footer ซ้ำ",
    "บังคับ {{pydantic}} {{schema}} สำหรับ Metadata (`doc_id`, `tenant_id`, `source_url`, `updated_at`, `page`, `section`, `content_hash`) ตั้งแต่ต้นทาง",
    "ข้อมูลสะอาดและมีโครงสร้างครบจากวันนี้พร้อมส่งต่อเข้าสู่ **Structural Token-Aware Chunking** ใน Day 95",
  ],

  reviewCards: [
    rc(
      "d094-rc-1",
      "ทำไม PDF ภาษาไทยจึงมักมีปัญหาสระอำแตก และวิธีซ่อมที่ถูกต้องใน Python คืออะไร?",
      "ฟอนต์ PDF เก่ามักแยก `ำ` (U+0E33) เป็นนิคหิต+สระอา (\\u0e4d\\u0e32) ทำให้ไม่ตรงคำค้น → แทน \\u0e4d\\u0e32 ด้วย \\u0e33 แล้วใช้ unicodedata.normalize('NFC', text) ห้ามใช้ NFKC",
    ),
    rc(
      "d094-rc-2",
      "ข้อดีของ `pymupdf4llm.to_markdown(..., page_chunks=True)` เทียบกับ `page.get_text()` คืออะไร?",
      "คงโครงสร้างหัวข้อ รายการ และตาราง Markdown พร้อมคืนข้อมูลแยกทีละหน้าและเลขหน้า ทำให้ไม่ทำลายตารางและสร้าง citation อ้างหน้าได้",
    ),
    rc(
      "d094-rc-3",
      "ระบุ 5 ฟิลด์ Metadata สำคัญที่ควรแนบกับทุก `ParsedDocument` ใน Production RAG",
      "doc_id, tenant_id (ACL), source_url, updated_at (freshness), page/section (citation) และ content_hash (dedup/incremental indexing)",
    ),
  ],

  sources: [
    { label: "PyMuPDF4LLM Official Documentation — PDF to Markdown for LLMs", href: "https://pymupdf.readthedocs.io/en/latest/pymupdf4llm/" },
    { label: "Python 3 Docs — unicodedata (NFC vs NFKC)", href: "https://docs.python.org/3/library/unicodedata.html" },
    { label: "Python 3 Docs — html.parser", href: "https://docs.python.org/3/library/html.parser.html" },
    { label: "Pydantic v2 Documentation — Fields & Validation", href: "https://docs.pydantic.dev/latest/concepts/fields/" },
  ],

  glossary: ["rag", "chunking", "pydantic", "schema", "data-contract", "acl", "groundedness", "pythainlp"],
});
