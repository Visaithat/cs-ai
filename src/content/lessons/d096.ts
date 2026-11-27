import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D096 — Phase 4 / Block B24 (Review Day)
 * Review: Quiz + Inspect bad chunks and fix broken table/heading splits
 */
export const d096: Lesson = defineLesson({
  day: 96,
  titleTh: "ทบทวน B24: ตรวจสอบ Bad Chunks และซ่อมตาราง/หัวข้อที่ถูกตัดขาดในเอกสาร FAQ ภาษาไทย",
  tagline: "30 นาที · รอบทบทวน D93–D95 + D66 · รันบนเครื่องคุณ 100% · ลงมือดีบั๊ก Bad Chunks และรีแฟกเตอร์ด้วย pytest",
  icon: "wrench",
  visual: {
    id: "chunking-overlap",
    title: "ทบทวน B24: ตรวจจับ Bad Chunks และซ่อมตาราง/หัวข้อที่ถูกตัดขาด",
    caption: "ไล่ตรวจสอบ chunk ที่มีหัวตารางหายหรือคำขาดกลางประโยค แล้วรีแฟกเตอร์ด้วย structural token-aware chunker",
    alt: "แผนภาพทบทวนการซ่อมแซม bad chunks",
  },
  requiresApiKey: false,
  tools: ["Python 3.12", "PyMuPDF / parser", "tokenizers", "Pydantic v2", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "รวมพลัง D94 (Clean/Parse) + D95 (Structural Chunking) ในท่อเดียว",
      body: "ตลอด Block B24 เราสร้างเกราะป้องกันตั้งแต่ต้นทาง: วินิจฉัยจุดพัง Naive {{rag}} (D93), ล้างสระอำแตกและคงตาราง Markdown พร้อม Metadata (D94), และแบ่ง {{chunking}} ตามหัวข้อ ตาราง และงบ token จริง (D95)",
      lessonNote: "วันนี้เราจะเอาเอกสาร FAQ + ตารางราคาภาษาไทยสุดรกมาผ่านตัวตรวจจับ Bad Chunks แล้วซ่อมท่อ Ingestion-to-Chunking ให้สะอาด 100%",
    },
    {
      node: 2,
      heading: "ทบทวน D66 (BPE Token Inflation) กับขนาด Chunk จริง",
      body: "หาก chunk ภาษาไทยหลุดเกิน `max_tokens` เพราะนับผิดด้วยจำนวนตัวอักษร หรือมีขยะ `\\u200b`/สระอำแตกปนอยู่ คุณภาพของทั้ง Dense Vector และ {{bm25}} ใน Block B25 จะตกลงทันที",
      lessonNote: "ตัวตรวจคุณภาพ chunk (`audit_chunks`) ที่คุณสร้างวันนี้จะเช็กทั้งความสมบูรณ์ของตาราง, orphan heading, สระอำแตก และงบ token ในคำสั่งเดียว",
    },
    {
      node: 3,
      heading: "สร้าง Quality Gate อัตโนมัติด้วย pytest ก่อนขึ้น Index",
      body: "แทนที่จะเปิดดูทีละไฟล์ด้วยตาเปล่า ทีม Production เขียนเทสต์ {{pytest}} ตรวจคุณภาพ chunk ทุกครั้งที่เพิ่มเอกสารหรือปรับโค้ด parser",
      lessonNote: "เมื่อจบรอบทบทวนวันนี้ คุณจะมี Ingestion + Chunking pipeline ที่ผ่านการทดสอบพร้อมส่งต่อไปสร้าง Vector & BM25 Index ใน Day 97–100",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบผสม (Interleaved Recall)** ครบทั้ง D93 (4 จุดตาย Naive RAG), D94 (Thai PDF cleaning + Metadata), D95 (Structural/Table-Atomic Chunking + Overlap) และ D66 ({{bpe-tokenizer}} Thai inflation)",
    "**ตรวจสอบและวินิจฉัย Bad Chunks** จากผลลัพธ์ของ Naive Chunker บนเอกสาร FAQ + ตารางราคาภาษาไทย (จับสระอำแตก, ตารางไร้หัวตาราง, orphan heading, และ token เกินงบ)",
    "**รีแฟกเตอร์เป็น Clean Structural Token-Aware Pipeline** ที่ซ่อมข้อบกพร่องทั้งหมดจนคะแนน Audit เป็นศูนย์ข้อผิดพลาดและผ่านชุดทดสอบ {{pytest}} 100%",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน Day 93 (Naive RAG Failures), Day 94 (Ingestion/Parsing), Day 95 (Chunking) และ Day 66 (BPE Tokenizer)",
    "มี `uv`, `pydantic`, `pytest` และ `ruff` พร้อมใช้งานบนเครื่อง",
    "รันแบบออฟไลน์ได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์รอบทบทวน Block B24 ด้วย `uv` เพื่อรันแล็บตรวจสอบ Bad Chunks และรีแฟกเตอร์ Chunker ด้วย `pytest`",
    commands: `uv init ai-day096-review && cd ai-day096-review
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('B24 Review Ready · Pydantic', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day096-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["ready", "รันคำสั่งตรวจสภาพแวดล้อมแล้วเห็น `B24 Review Ready`"],
    ],
    note: "จัดเวลา Review Day 30 นาที: 10 นาทีทำ Interleaved Recall Quiz → 15 นาทีลงมือดีบั๊ก Bad Chunks + ซ่อม Chunker จน `pytest` เขียวทั้งหมด → 5 นาทีจด Error Log ก่อนเข้าสู่ Block B25 (Vector & Thai BM25 Indexing)",
  },

  concepts: [
    {
      id: "b24-synthesis-checklist",
      title: "1 · ร้อยต่อจิ๊กซอว์ Block B24 (D93–D95) + D66: เส้นทางจากไฟล์รกสู่ Chunk พร้อม Index",
      paragraphs: [
        "ก่อนเดินหน้าสู่การสร้าง Vector Store (`pgvector` / `Qdrant`) และ Thai {{bm25}} Index ใน Block B25 ลองเช็กว่า 4 ชิ้นส่วนต้นน้ำเชื่อมกันอย่างไร: **D66** ทำให้เรารู้ว่าภาษาไทยกิน {{bpe-tokenizer}} มากกว่าอังกฤษ `1.5x–3x`, **D93** ชี้ 4 จุดตายของ Naive {{rag}} และฝึกนิสัย *Inspect Chunks First*, **D94** สร้างท่อ Parse + Thai Cleaning (ซ่อมสระอำแตก `\\u0e4d\\u0e32` → `\\u0e33` + `NFC`, ลบ `\\u200b` และเลขหน้า) พร้อม Metadata Contract, และ **D95** สร้าง Structural Token-Aware {{chunking}} ที่แปะ Breadcrumb และคงหัวตาราง",
        "ในงานจริง ปัญหาไม่ค่อยมาจากความผิดพลาดใหญ่ข้อเดียว แต่มักเกิดจากการที่ **สี่เรื่องนี้รั่วพร้อมกันในไฟล์เดียว**: ไฟล์ PDF ถูกดึงมาแบบมีเลขหน้าปน, มีสระอำแตก, โดนหั่นด้วย fixed-char จนหัวตารางขาด และเกิด orphan heading — วันนี้เราจะจับทุกอาการพร้อมกันในชุดเอกสารเดียว",
      ],
      analogy:
        "เหมือนการตรวจสภาพรถยนต์ก่อนออกทางไกล (Phase 4 Indexing): D93 คือรายการอาการเสียที่พบบ่อย, D94 คือการล้างเครื่องและเช็กทะเบียนเอกสาร, D95 คือการจัดเรียงสัมภาระให้พอดีน้ำหนักจริง (D66) ไม่ให้กล่องแตกกลางทาง",
      bullets: [
        "**D66 → Token Budget**: นับขนาดด้วย `token_counter` ไม่เดาจาก `len(text) / 4`",
        "**D93 → Inspect First**: ดูผล chunk ดิบก่อนส่งเข้า Vector DB ทุกครั้ง",
        "**D94 → Clean + Metadata**: ซ่อม `\\u0e4d\\u0e32` → `\\u0e33` (`NFC`), ตัด noise lines, เก็บ `doc_id`/`tenant_id`/`updated_at`",
        "**D95 → Structural + Table-Atomic**: แปะ `[H1 > H2]`, คง 2 บรรทัดหัวตาราง, overlap 10–15% เฉพาะ prose",
      ],
      whyTitle: "Why this matters — แก้ที่ B24 ประหยัดเวลาดีบั๊กตลอด B25–B27",
      whyParagraphs: [
        "ถ้าคุณเอา bad chunks ใส่ลง `pgvector` หรือ `Qdrant` ใน Day 97–98 แล้วค่อยมาพบตอน Day 104 ว่า Recall@5 ต่ำ คุณจะต้องรื้อล้างดัชนีและ re-embed ใหม่ทั้งหมด",
        "การมี `audit_chunks()` เป็น automated quality gate ตั้งแต่ขั้น chunking ช่วยดักจับเอกสารพังได้ตั้งแต่ยังไม่เสียค่า embedding แม้แต่สตางค์เดียว",
      ],
    },
    {
      id: "anatomy-of-bad-chunks",
      title: "2 · 5 สัญญาณอันตรายของ Bad Chunks ที่ต้องตรวจจับอัตโนมัติ",
      paragraphs: [
        "เวลาเราตรวจสอบคุณภาพของชุด chunks จากคลังเอกสารไทย ให้ใช้รายการตรวจ (Audit Rules) 5 ข้อนี้เป็นมาตรฐาน:",
        "(1) **`broken_sara_am_or_zwsp`**: ยังหลงเหลือ `\\u0e4d\\u0e32` หรือ `\\u200b` ใน chunk, (2) **`noise_artifact`**: ยังมีบรรทัดเลขหน้า (`หน้า X / Y`) หรือ `Confidential` ติดเข้ามา, (3) **`orphan_heading`**: chunk มีแต่บรรทัดหัวข้อ `#` / `##` หรือสั้นมากโดยไม่มีเนื้อหาจริง",
        "(4) **`broken_table`**: chunk มีแถวตาราง `| ... |` แต่ขาดเส้นคั่นหัวตาราง `| --- |`, และ (5) **`missing_breadcrumb_or_over_budget`**: chunk ไม่ขึ้นต้นด้วย `[...]` Breadcrumb หรือมีจำนวน token เกิน `max_tokens` ที่กำหนดไว้",
      ],
      analogy:
        "เหมือนเครื่องตรวจ QC บนสายพานโรงงานอาหาร: เช็กทั้งสิ่งแปลกปลอม (noise/ZWSP), ฉลากหลุด (missing breadcrumb), ฝาปิดไม่สนิท (broken table), กล่องเปล่า (orphan heading) และน้ำหนักเกินกล่อง (over token budget)",
      code: {
        language: "python",
        filename: "chunk_audit_rules.py",
        code: `import re

NOISE_RE = re.compile(r"(?:หน้า\\s*\\d+\\s*/\\s*\\d+|Confidential)", re.IGNORECASE)


def audit_single_chunk(text: str, *, max_tokens: int, token_count: int) -> list[str]:
    issues: list[str] = []
    if "\\u0e4d\\u0e32" in text or "\\u200b" in text:
        issues.append("thai_unicode_artifact")
    if NOISE_RE.search(text):
        issues.append("noise_line_leaked")

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    body_lines = [ln for ln in lines if not (ln.startswith("[") and ln.endswith("]"))]
    if not body_lines or all(ln.startswith("#") for ln in body_lines):
        issues.append("orphan_heading")

    pipe_lines = [ln for ln in body_lines if ln.startswith("|") and ln.endswith("|")]
    if pipe_lines and not any("---" in ln for ln in pipe_lines):
        issues.append("broken_table")

    if not lines or not (lines[0].startswith("[") and lines[0].endswith("]")):
        issues.append("missing_breadcrumb")
    if token_count > max_tokens:
        issues.append("over_token_budget")
    return issues`,
        caption: "ฟังก์ชัน QC ตรวจสอบ Bad Chunks 6 เงื่อนไขที่รันได้เร็วแบบ Deterministic ใน CI/pytest",
      },
      whyTitle: "Why this matters — เปลี่ยนการ 'เปิดดูด้วยตา' เป็น 'Unit Test ที่รันซ้ำได้'",
      whyParagraphs: [
        "การเปิดดู 5 chunks ด้วยตาเปล่าช่วยตอนสำรวจไฟล์แรก แต่เมื่อคลังโตเป็น 200 ไฟล์ ไม่มีใครนั่งอ่านทุก chunk ไหว",
        "ฟังก์ชัน `audit_single_chunk` ทำให้คุณสแกนทั้งคลัง 5,000 chunks ได้ในเวลาไม่ถึงวินาที และเห็นทันทีว่าเอกสารหน้าไหนพาร์สพัง",
      ],
    },
    {
      id: "refactoring-naive-to-production",
      title: "3 · แนวทางรีแฟกเตอร์ Naive Chunker ให้สะอาดและวัดผล Before vs After",
      paragraphs: [
        "ในรอบทบทวนวันนี้เราจะทำตามกระบวนการวิศวกรรมจริง 3 ขั้น: **ขั้นที่ 1 (Reproduce & Measure)** รัน `naive_buggy_chunker` บนเอกสาร FAQ + ตารางราคาภาษาไทย แล้ววัดจำนวนข้อผิดพลาดผ่าน `audit_chunks` เพื่อเห็นหลักฐานตัวเลขก่อนแก้",
        "**ขั้นที่ 2 (Refactor)** แทนที่ด้วยท่อ 2 จังหวะที่เชื่อม D94 + D95 เข้าด้วยกัน: ทำความสะอาดข้อความไทย (`clean_thai_markdown`) ก่อน แล้วจึงแบ่งด้วย Structural + Table-Atomic + Token-Aware Chunker ที่รับประกันว่าจะไม่ตัดกลางตาราง ไม่ทิ้ง orphan heading และแนบ Breadcrumb ทุกชิ้น",
        "**ขั้นที่ 3 (Verify Regression)** รัน `audit_chunks` ซ้ำบนผลลัพธ์ใหม่เพื่อยืนยันว่า **ข้อผิดพลาดลดจากหลายจุดเหลือ 0** พร้อมตรวจว่าข้อความสำคัญ (เช่น ชื่อแพ็กเกจ ราคา และเงื่อนไข FAQ) ยังอยู่ครบไม่หายไประหว่างการล้างข้อความ",
      ],
      analogy:
        "เหมือนการซ่อมโค้ดด้วย Test-Driven Debugging: เขียนเทสต์จับอาการพังให้เห็นสีแดงก่อน → ลงมือแก้สาเหตุจริง → รันเทสต์ซ้ำจนเป็นสีเขียวทุกข้อและไม่ทำให้ข้อมูลดีเดิมหายไป",
      bullets: [
        "**วัด Before**: ยืนยันว่าตัว Audit จับอาการพังของ Naive Chunker ได้ครบจริง (ไม่เป็นเทสต์หลอก)",
        "**ตรวจ Data Preservation**: หลังแก้ต้องมั่นใจว่าทุกแถวราคาและคำตอบ FAQ ยังปรากฏครบในชุด chunks ใหม่",
        "**จด Error Log**: บันทึกจุดที่เคยพลาด (เช่น `NFKC`, ขอบเขตตาราง, หรือ infinite loop ของ overlap) ลงสมุดทบทวนส่วนตัว",
      ],
      whyTitle: "Why this matters — เตรียมพร้อมสำหรับ Capstone Milestone 2",
      whyParagraphs: [
        "ใน Phase 6 Milestone 2 คุณจะต้องเตรียมคลังเอกสารไทย 20+ ไฟล์และวัด Retrieval Recall@5 ≥ 0.85 — สคริปต์ตรวจสอบ Bad Chunks ที่คุณสร้างในวันนี้สามารถหยิบไปใช้ตรวจคลัง Capstone ได้ทันที",
        "การพิสูจน์ผลแบบ Before vs After ด้วยตัวเลขยังเป็นทักษะสำคัญที่ใช้เล่าใน Code Review และสัมภาษณ์งาน AI Engineer",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Chunk Audit Gate เทียบกับ Linter & Schema Migration Tests",
      body: [
        "การเขียน `audit_chunks` ก่อนส่งข้อมูลขึ้น Vector DB เหมือนการมี automated data validation gate ใน backend:",
      ],
      table: [
        ["`naive_buggy_chunker`", "Legacy script ที่ตัด string หยาบ ๆ โดยไม่สนโครงสร้าง"],
        ["`audit_chunks()`", "Data quality linter / CI check ที่รันก่อน deploy ข้อมูล"],
        ["Before vs After report", "Regression test ที่พิสูจน์ว่าแก้บั๊กได้จริงโดยไม่ทำข้อมูลหาย"],
        ["Clean Structural Chunker", "Idempotent ingestion pipeline ที่ปลอดภัยต่อการรันซ้ำ"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีดีบั๊กเมื่อโค้ดแบ่งข้อความไม่ผ่าน pytest",
      body: [
        "เวลาเทสต์แจ้งว่า `assert issues == []` ไม่ผ่าน ให้สั่ง `pytest -vv` หรือพิมพ์ `for ch in chunks: print(ch.chunk_id, ch.token_count, repr(ch.text))` ออกมาดู",
        "การใช้ `repr(ch.text)` สำคัญมากกับงานภาษาไทย เพราะมันจะโชว์อักขระที่มองด้วยตาเปล่าไม่เห็นอย่าง `\\u0e4d\\u0e32` (สระอำแตก) หรือ `\\u200b` (zero-width space) ออกมาให้เห็นชัดทันที!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีเอกสาร FAQ + ตารางราคาภาษาไทยที่มีทั้งสระอำแตก เลขหน้าซ้ำ หัวข้อว่าง และตารางราคา ลองรัน Naive Chunker เพื่อดูอาการพังจริงผ่าน `audit_chunks` แล้วเทียบกับผลลัพธ์หลังซ่อม",
    steps: [
      {
        title: "1 · ตรวจสอบผลลัพธ์ของ Naive Chunker (Before) ด้วยฟังก์ชัน Audit",
        explain:
          "รันตัวแบ่งข้อความแบบ fixed-char 95 ตัวอักษรบนเอกสารรก ๆ แล้วส่งทุกชิ้นเข้าตรวจ 6 เงื่อนไข จะเห็นข้อผิดพลาดโผล่ครบทั้งตารางแตก สระอำแตก เลขหน้าหลุด และไม่มี Breadcrumb",
        code: {
          language: "python",
          filename: "worked_review_b24.py",
          code: `import re

MESSY_FAQ_DOC = """Confidential - Internal
# ศูนย์ช่วยเหลือลูกค้า 2026
## ตารางค่าบริการ
| แพ็กเกจ | ราคา/เดือน | ค\\u0e4d\\u0e32อธิบาย |
| --- | --- | --- |
| Basic | 390 บาท | ส\\u0e4d\\u0e32หรับทีมเล็ก |
| Pro | 1,490 บาท | ช\\u0e4d\\u0e32ระรายเดือน\\u200b |
หน้า 1 / 2
## คำถามที่พบบ่อย
ขอคืนเงินได้ภายใน 7 วันหลังช\\u0e4d\\u0e32ระเงิน
"""

NOISE_RE = re.compile(r"(?:หน้า\\s*\\d+\\s*/\\s*\\d+|Confidential)", re.IGNORECASE)


def naive_split(text: str, size: int = 95) -> list[str]:
    return [text[i : i + size] for i in range(0, len(text), size)]


def find_issues(chunk: str) -> list[str]:
    issues: list[str] = []
    if "\\u0e4d\\u0e32" in chunk or "\\u200b" in chunk:
        issues.append("thai_artifact")
    if NOISE_RE.search(chunk):
        issues.append("noise_leaked")
    lines = [ln.strip() for ln in chunk.splitlines() if ln.strip()]
    pipe_lines = [ln for ln in lines if ln.startswith("|") and ln.endswith("|")]
    if pipe_lines and not any("---" in ln for ln in pipe_lines):
        issues.append("broken_table")
    if not lines or not lines[0].startswith("["):
        issues.append("missing_breadcrumb")
    return issues


for idx, ch in enumerate(naive_split(MESSY_FAQ_DOC), start=1):
    print(f"Naive #{idx}: issues={find_issues(ch)}")`,
        },
        output: `Naive #1: issues=['thai_artifact', 'noise_leaked', 'missing_breadcrumb']
Naive #2: issues=['thai_artifact', 'broken_table', 'missing_breadcrumb']
Naive #3: issues=['thai_artifact', 'noise_leaked', 'missing_breadcrumb']`,
      },
      {
        title: "2 · ล้างข้อความไทย + แบ่งแบบ Structural Table-Atomic (After)",
        explain:
          "เชื่อมต่อขั้น Clean จาก D94 เข้ากับขั้น Structural Chunking จาก D95 เพื่อซ่อมสระอำแตก ลบเลขหน้า แปะ Breadcrumb และคง 2 บรรทัดหัวตารางไว้ทุกชิ้น",
        code: {
          language: "python",
          filename: "worked_review_b24.py",
          code: `import unicodedata

NOISE_LINE_RE = re.compile(r"^(?:หน้า\\s*\\d+\\s*/\\s*\\d+|Confidential.*)$", re.IGNORECASE)


def clean_thai(raw: str) -> str:
    text = unicodedata.normalize("NFC", raw.replace("\\u0e4d\\u0e32", "\\u0e33")).replace("\\u200b", "")
    kept = [ln.rstrip() for ln in text.splitlines() if not NOISE_LINE_RE.match(ln.strip())]
    return "\\n".join(kept).strip()


cleaned_doc = clean_thai(MESSY_FAQ_DOC)
print(cleaned_doc)`,
        },
        output: `# ศูนย์ช่วยเหลือลูกค้า 2026
## ตารางค่าบริการ
| แพ็กเกจ | ราคา/เดือน | คำอธิบาย |
| --- | --- | --- |
| Basic | 390 บาท | สำหรับทีมเล็ก |
| Pro | 1,490 บาท | ชำระรายเดือน |
## คำถามที่พบบ่อย
ขอคืนเงินได้ภายใน 7 วันหลังชำระเงิน`,
      },
      {
        title: "3 · ตรวจซ้ำหลังซ่อมด้วย `find_issues` เพื่อยืนยัน 0 ข้อผิดพลาด",
        explain:
          "เมื่อสร้าง chunks ที่ติด Breadcrumb และรักษาหัวตารางเรียบร้อยแล้ว เรารัน `find_issues` ซ้ำเพื่อยืนยันว่าทุก chunk ผ่านเกณฑ์ QC 100%",
        code: {
          language: "python",
          filename: "worked_review_b24.py",
          code: `fixed_chunks = [
    "[ศูนย์ช่วยเหลือลูกค้า 2026 > ตารางค่าบริการ]\\n"
    "| แพ็กเกจ | ราคา/เดือน | คำอธิบาย |\\n"
    "| --- | --- | --- |\\n"
    "| Basic | 390 บาท | สำหรับทีมเล็ก |\\n"
    "| Pro | 1,490 บาท | ชำระรายเดือน |",
    "[ศูนย์ช่วยเหลือลูกค้า 2026 > คำถามที่พบบ่อย]\\n"
    "ขอคืนเงินได้ภายใน 7 วันหลังชำระเงิน",
]

for idx, ch in enumerate(fixed_chunks, start=1):
    print(f"Fixed #{idx}: issues={find_issues(ch)}")`,
        },
        output: `Fixed #1: issues=[]
Fixed #2: issues=[]`,
      },
    ],
    gotcha:
      "จุดสังเกต: การทำ `audit` จะมีประโยชน์สูงสุดก็ต่อเมื่อคุณเช็ก **2 ด้านพร้อมกัน** คือ (1) ไม่มี bad chunk issues (`issues == []`) และ (2) ข้อมูลสำคัญในเอกสารต้นฉบับ (เช่น `Basic`, `Pro`, `1,490 บาท`, `7 วัน`) ยังปรากฏครบในชุด chunks หลังซ่อม — เพื่อกันบั๊กที่โค้ดล้างข้อความเผลอลบเนื้อหาจริงทิ้ง!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน B24 (15 นาที): คุณได้รับสคริปต์ที่มี `naive_buggy_chunker` ซึ่งผลิต bad chunks เต็มไปหมดบนเอกสาร FAQ + ตารางราคาภาษาไทย จงสร้างตัวตรวจ `audit_chunks` เพื่อเปิดโปงข้อผิดพลาดทั้งหมด แล้วเขียน `clean_and_chunk_document` ที่ซ่อมทุกปัญหาจนผ่าน `pytest` 100%",
    requirements: [
      "สร้าง `ChunkAuditResult(BaseModel)` เก็บ `chunk_index: int`, `issues: list[str]` และฟังก์ชัน `audit_chunks(chunks: list[str], *, max_tokens: int, token_counter: Callable[[str], int] = approx_thai_tokens) -> list[ChunkAuditResult]` ที่ตรวจครบ 6 เงื่อนไข: `thai_unicode_artifact` (`\\u0e4d\\u0e32` หรือ `\\u200b`), `noise_line_leaked` (`หน้า X / Y` หรือ `Confidential`), `orphan_heading` (ไม่มีบรรทัดเนื้อหาจริงนอกจาก breadcrumb/heading), `broken_table` (มีบรรทัดตาราง `|...|` แต่ไม่มี `---`), `missing_breadcrumb` (บรรทัดแรกไม่ได้อยู่ในรูปแบบ `[...]`), และ `over_token_budget` (`token_counter(ch) > max_tokens`)",
      "คืนผลใน `audit_chunks` เฉพาะ chunk ที่มีปัญหา (`len(issues) > 0`) หากทุก chunk สะอาดครบต้องคืนลิสต์ว่าง `[]`",
      "เขียนฟังก์ชัน `clean_and_chunk_document(raw_markdown: str, *, max_tokens: int = 90, overlap_tokens: int = 12, token_counter: Callable[[str], int] = approx_thai_tokens) -> list[str]` ที่รวมขั้นทำความสะอาดข้อความไทย (D94: ซ่อม `\\u0e4d\\u0e32` → `\\u0e33`, `NFC`, ลบ `\\u200b`, ตัดบรรทัดเลขหน้าและ `Confidential`) เข้ากับ Structural + Table-Atomic + Token-Aware Chunking (D95)",
      "รับประกันว่าผลลัพธ์ของ `clean_and_chunk_document` บนเอกสารทดสอบ `MESSY_THAI_DOC` จะได้ `audit_chunks(...) == []` และยังคงเก็บข้อมูลสำคัญครบทุกแถวตาราง (`Starter`, `Pro`, `Enterprise`) และเนื้อหา FAQ โดยไม่ตัดกลางตารางและไม่ทิ้ง orphan heading",
    ],
    starter: {
      language: "python",
      filename: "exercise_day096.py",
      code: `from __future__ import annotations
import re
import unicodedata
from collections.abc import Callable
from pydantic import BaseModel

THAI_CHAR_RE = re.compile(r"[\\u0e00-\\u0e7f]")
NOISE_LINE_RE = re.compile(
    r"^(?:หน้า\\s*\\d+\\s*(?:/|จาก)\\s*\\d+|Page\\s*\\d+\\s*(?:of|/)\\s*\\d+|Confidential.*)$",
    re.IGNORECASE,
)
NOISE_SEARCH_RE = re.compile(
    r"(?:หน้า\\s*\\d+\\s*(?:/|จาก)\\s*\\d+|Page\\s*\\d+\\s*(?:of|/)\\s*\\d+|Confidential)",
    re.IGNORECASE,
)


def approx_thai_tokens(text: str) -> int:
    if not text.strip():
        return 0
    thai_chars = len(THAI_CHAR_RE.findall(text))
    other_chars = len(text) - thai_chars
    return max(1, int(thai_chars / 1.5 + other_chars / 4.0))


def naive_buggy_chunker(raw_markdown: str, char_size: int = 100) -> list[str]:
    """ตัวแบ่งข้อความแบบ Naive ที่ทำให้เกิด bad chunks (ไว้ใช้เปรียบเทียบ Before vs After)"""
    return [raw_markdown[i : i + char_size] for i in range(0, len(raw_markdown), char_size)]


class ChunkAuditResult(BaseModel):
    chunk_index: int
    issues: list[str]


def audit_chunks(
    chunks: list[str],
    *,
    max_tokens: int,
    token_counter: Callable[[str], int] = approx_thai_tokens,
) -> list[ChunkAuditResult]:
    """ตรวจคุณภาพ chunks ทั้ง 6 เงื่อนไข และคืนเฉพาะ chunk ที่พบปัญหา"""
    # TODO: ตรวจทั้ง 6 เงื่อนไขและคืน list[ChunkAuditResult]
    raise NotImplementedError


def clean_and_chunk_document(
    raw_markdown: str,
    *,
    max_tokens: int = 90,
    overlap_tokens: int = 12,
    token_counter: Callable[[str], int] = approx_thai_tokens,
) -> list[str]:
    """ซ่อมท่อ Ingestion + Structural Table-Atomic Token-Aware Chunking"""
    # TODO: 1) ล้างข้อความไทย (สระอำแตก, NFC, ZWSP, noise lines)
    # TODO: 2) แยกหัวข้อ/ตาราง/ย่อหน้า พร้อม heading stack (ไม่สร้าง orphan heading)
    # TODO: 3) แบ่งตารางแบบคง 2 บรรทัดหัวตาราง + แบ่งย่อหน้าแบบ token-aware + overlap
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day096.py",
      code: `from exercise_day096 import (
    approx_thai_tokens,
    audit_chunks,
    clean_and_chunk_document,
    naive_buggy_chunker,
)

MESSY_THAI_DOC = """Confidential — สำหรับใช้งานภายใน
# คู่มือบริการลูกค้า 2026
## ตารางราคาแพ็กเกจ
| แพ็กเกจ | ราคา/เดือน | ค\\u0e4d\\u0e32อธิบาย |
| --- | --- | --- |
| Starter | 490 บาท | ส\\u0e4d\\u0e32หรับร้านค้าขนาดเล็ก |
| Pro | 1,490 บาท | รองรับแชตหลายช่องทาง\\u200b |
| Enterprise | 4,900 บาท | มีทีมดูแลเฉพาะองค์กร |
หน้า 1 / 2
## คำถามที่พบบ่อยเรื่องคืนเงิน
ลูกค้า สามารถ ยื่นค\\u0e4d\\u0e32ขอ คืนเงิน ได้ภายใน 7 วัน หลัง ช\\u0e4d\\u0e32ระเงิน โดย แนบ หมายเลขค\\u0e4d\\u0e32สั่งซื้อ และ สลิป การโอนเงิน ผ่าน ช่องทาง แชต เจ้าหน้าที่ จะ ตรวจสอบ และ คืนเงิน ภายใน 5 วันทำการ
## หมวดร่างที่ยังไม่มีเนื้อหา
หน้า 2 / 2
"""


def test_audit_catches_naive_buggy_chunker_defects():
    bad_chunks = naive_buggy_chunker(MESSY_THAI_DOC, char_size=110)
    findings = audit_chunks(bad_chunks, max_tokens=90)
    assert len(findings) >= 2
    all_issues = {issue for item in findings for issue in item.issues}
    assert "thai_unicode_artifact" in all_issues
    assert "broken_table" in all_issues
    assert "missing_breadcrumb" in all_issues


def test_clean_and_chunk_eliminates_all_audit_issues():
    fixed_chunks = clean_and_chunk_document(MESSY_THAI_DOC, max_tokens=90, overlap_tokens=12)
    assert len(fixed_chunks) >= 3
    findings = audit_chunks(fixed_chunks, max_tokens=90, token_counter=approx_thai_tokens)
    assert findings == []


def test_clean_and_chunk_preserves_all_pricing_rows_and_faq_content():
    fixed_chunks = clean_and_chunk_document(MESSY_THAI_DOC, max_tokens=90, overlap_tokens=12)
    combined = "\\n".join(fixed_chunks)
    for expected in ["Starter", "490 บาท", "Pro", "1,490 บาท", "Enterprise", "4,900 บาท", "คำอธิบาย", "ชำระเงิน", "หมายเลขคำสั่งซื้อ"]:
        assert expected in combined
    assert "หมวดร่างที่ยังไม่มีเนื้อหา" not in combined
    assert "Confidential" not in combined
    assert "หน้า 1 / 2" not in combined


def test_every_table_chunk_repeats_markdown_header():
    fixed_chunks = clean_and_chunk_document(MESSY_THAI_DOC, max_tokens=75, overlap_tokens=10)
    table_chunks = [ch for ch in fixed_chunks if "| --- |" in ch or "| Starter |" in ch or "| Pro |" in ch or "| Enterprise |" in ch]
    assert len(table_chunks) >= 2
    for tc in table_chunks:
        assert "| แพ็กเกจ | ราคา/เดือน | คำอธิบาย |" in tc
        assert "| --- | --- | --- |" in tc
        assert tc.startswith("[คู่มือบริการลูกค้า 2026 > ตารางราคาแพ็กเกจ]")
`,
    },
    selfCheck: [
      "`audit_chunks` จับปัญหาของ `naive_buggy_chunker` ได้จริงครบทั้ง `thai_unicode_artifact`, `broken_table`, และ `missing_breadcrumb`",
      "`clean_and_chunk_document` ผ่าน `audit_chunks(...) == []` โดยไม่มี chunk ไหนเกิน `max_tokens`",
      "ทุกแถวราคา (`Starter`, `Pro`, `Enterprise`) และคำไทยที่ซ่อมสระอำแล้ว (`คำอธิบาย`, `ชำระเงิน`, `หมายเลขคำสั่งซื้อ`) อยู่ครบถ้วน",
      "หัวข้อว่าง (`หมวดร่างที่ยังไม่มีเนื้อหา`), `Confidential` และ `หน้า X / Y` ถูกล้างออกหมด",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และไม่มีคำเตือนจาก `uv run ruff check .`",
    hints: [
      {
        body: "เริ่มจากเขียน `audit_chunks` ให้ครบทั้ง 6 กฎแล้วรันเทสต์แรก (`test_audit_catches_naive_buggy_chunker_defects`) เพื่อเช็กว่าตัวตรวจ QC ของเราทำงานตรงตามสเปกก่อนค่อยลงมือเขียน `clean_and_chunk_document`",
      },
      {
        body: "ใน `clean_and_chunk_document` ระวังว่าเมื่อ `max_tokens=75` แถวตาราง 1 แถวรวม Breadcrumb + 2 บรรทัดหัวตารางต้องพอดีในงบ — ใช้โครง `_parse_blocks` + `_split_table_atomic` + `_split_prose_overlap` จาก Day 95 ต่อเข้าหลัง `_clean_thai_markdown` จาก Day 94 ได้เลย",
      },
      {
        body: "ตัวอย่างตัวช่วย `_clean_thai_markdown` และโครงของ `audit_chunks` — เติมการเช็ก `broken_table` และ `over_token_budget` แล้วต่อเข้ากับตัวแบ่ง Structural Chunker",
        code: {
          language: "python",
          filename: "hint_day096.py",
          code: `def _clean_thai_markdown(raw_text: str) -> str:
    text = unicodedata.normalize("NFC", raw_text.replace("\\u0e4d\\u0e32", "\\u0e33"))
    text = text.replace("\\u200b", "").replace("\\ufeff", "").replace("\\u00a0", " ")
    kept = [ln.rstrip() for ln in text.splitlines() if not NOISE_LINE_RE.match(ln.strip())]
    return re.sub(r"\\n{3,}", "\\n\\n", "\\n".join(kept)).strip()


def audit_chunks(
    chunks: list[str],
    *,
    max_tokens: int,
    token_counter: Callable[[str], int] = approx_thai_tokens,
) -> list[ChunkAuditResult]:
    results: list[ChunkAuditResult] = []
    for idx, ch in enumerate(chunks):
        issues: list[str] = []
        if "\\u0e4d\\u0e32" in ch or "\\u200b" in ch:
            issues.append("thai_unicode_artifact")
        if NOISE_SEARCH_RE.search(ch):
            issues.append("noise_line_leaked")
        lines = [ln.strip() for ln in ch.splitlines() if ln.strip()]
        if not lines or not (lines[0].startswith("[") and lines[0].endswith("]")):
            issues.append("missing_breadcrumb")
        body_lines = [ln for ln in lines if not (ln.startswith("[") and ln.endswith("]"))]
        if not body_lines or all(ln.startswith("#") for ln in body_lines):
            issues.append("orphan_heading")
        # TODO: ตรวจ broken_table และ over_token_budget
        if issues:
            results.append(ChunkAuditResult(chunk_index=idx, issues=issues))
    return results`,
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
      title: "แก้ Chunker จน audit ผ่าน 0 ปัญหา แต่ลืมเช็กว่าเนื้อหาหายไหม",
      symptom: "ฟังก์ชันเผลอกรองบรรทัดที่ขึ้นต้นด้วย `|` หรือ `##` ออกหมดจนคืน chunks ว่าง ๆ ซึ่งผ่าน `audit_chunks == []` แบบหลอก ๆ",
      fix: "เขียน assertion ตรวจ **Data Preservation** คู่กันเสมอว่าคีย์เวิร์ดสำคัญทุกแถวในเอกสารต้นฉบับยังปรากฏครบหลัง chunking",
    },
    {
      title: "ล้างข้อความทีหลังตอนแบ่ง chunk เสร็จแล้ว",
      symptom: "เลขหน้า `หน้า 1 / 2` ที่คั่นอยู่กลางตารางทำให้ตัวแบ่งบล็อกมองตาราง 1 อันขาดเป็น 2 ตาราง และตารางท่อนล่างไม่มีหัวตาราง",
      fix: "ต้องทำ **Clean (D94) ก่อน Parse Blocks & Chunk (D95)** เสมอ เพื่อให้ตารางที่ถูกเลขหน้าคั่นกลับมาต่อกันเป็นก้อนเดียวก่อนแบ่ง",
    },
    {
      title: "ใช้ repr() ไม่เป็นตอนดีบั๊กอักขระไทยที่มองไม่เห็น",
      symptom: "พิมพ์ chunk ออกจอเห็นคำว่า `คำอธิบาย` ปกติทุกอย่าง แต่เทสต์ `assert 'คำอธิบาย' in combined` ยังพังหาสาเหตุไม่เจอ",
      fix: "ใช้ `print(repr(text))` เพื่อเปิดดูรหัส Unicode จริง (`\\u0e4d\\u0e32` หรือ `\\u200b`) จะเห็นสาเหตุภายในไม่กี่วินาที",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d096-q1",
        "(Interleaved Recall · D94 + D95) หากไฟล์ PDF ภาษาไทยมีบรรทัด `หน้า 1 / 2` โผล่คั่นอยู่กลางตารางราคา ลำดับขั้นตอนใดที่ถูกต้องที่สุด?",
        [
          ["แบ่ง chunk ก่อน แล้วค่อยลบ `หน้า 1 / 2` ออกจากแต่ละ chunk", "ถ้าแบ่งก่อน ตารางจะถูกบรรทัดเลขหน้าตัดขาดเป็นสองท่อน ทำให้ท่อนล่างขาดหัวตาราง"],
          [
            "ล้างเลขหน้าและซ่อมสระอำแตกให้เสร็จก่อน (Ingestion Cleaning) แล้วค่อยสแกนบล็อกตารางและแบ่งแบบ Structural Table-Atomic",
            "ถูก — การล้าง noise ก่อนทำให้ตารางกลับมาต่อกันสมบูรณ์และรักษาหัวตารางไว้ได้ครบ",
          ],
          ["แปลงเป็น Vector Embedding ก่อนแล้วค่อยลบเลขหน้า", "ไม่สามารถลบข้อความออกจากเวกเตอร์ตัวเลขย้อนหลังได้"],
          ["ใช้ `NFKC` เพื่อลบเลขหน้าออกอัตโนมัติ", "NFKC ไม่ได้ลบเลขหน้า และยังทำลายสระอำภาษาไทยด้วย"],
        ],
        "B",
        "ลำดับ Clean (D94) → Structural Chunking (D95) สำคัญมาก เพราะ noise อย่างเลขหน้าหรือ running header ที่แทรกกลางตารางจะหลอกให้ Chunker ตัดตารางขาดถ้าไม่ลบออกก่อน",
        "ทำไมต้องทำ Cleaning (ลบเลขหน้า/header) ก่อน Structural Chunking เสมอ?",
        "เพราะเลขหน้าหรือ running header ที่คั่นกลางย่อหน้าหรือตารางจะทำให้ Chunker มองตารางขาดเป็นสองส่วนและเสียหัวตาราง",
      ),
      mc(
        "d096-q2",
        "(Interleaved Recall · D66 + D95) ทีมตั้งค่า chunk ของเอกสารภาษาไทยไว้ที่ `1,000 ตัวอักษร` แล้วส่งเข้า Embedding model ที่รับได้สูงสุด `512 tokens` อาการใดมีโอกาสเกิดขึ้นมากที่สุด?",
        [
          ["ระบบจะโยน `SyntaxError` ใน Python", "Embedding model มักไม่โยน SyntaxError แต่จะตัดข้อความส่วนเกินทิ้ง"],
          [
            "เนื่องจาก BPE Token Inflation 1.5x–3x ของภาษาไทย chunk อาจยาวเกิน 512 tokens ทำให้ข้อความช่วงท้ายถูกตัดทิ้งแบบเงียบ ๆ (silent truncation)",
            "ถูก — ต้องคุมขนาดด้วย Token Counter จริง (เช่น 250–450 tokens) ไม่ใช่จำนวนตัวอักษร",
          ],
          ["เวกเตอร์ที่ได้จะมีความยาวมิติเพิ่มขึ้นเป็น 2 เท่า", "ขนาดมิติเวกเตอร์ของโมเดลคงที่เสมอไม่ขึ้นกับความยาวข้อความ"],
          ["BM25 จะทำงานไม่ได้ทันที", "ประเด็นนี้กระทบขีดจำกัด token ของ Dense Embedding model โดยตรง"],
        ],
        "B",
        "ความรู้จาก D66 (BPE Inflation) เชื่อมตรงกับ D95: ห้ามใช้สูตร 4 ตัวอักษร/token กับภาษาไทย ต้องวัดขนาดด้วย token จริงเพื่อป้องกัน silent truncation",
        "หากแบ่ง chunk ภาษาไทยด้วยจำนวนตัวอักษร 1,000 ตัวเข้า Embedding model ขีดจำกัด 512 tokens จะเกิดความเสี่ยงอะไร?",
        "ภาษาไทยเกิด BPE inflation 1.5x–3x ทำให้เกิน 512 tokens และถูกโมเดลตัดข้อความช่วงท้ายทิ้งแบบเงียบ ๆ (silent truncation)",
      ),
      mc(
        "d096-q3",
        "(Interleaved Recall · D93 + D94) เมื่อเปิดดู `retrieved_chunks` ของระบบ RAG พบว่ามีเอกสาร `refund-2024` (`is_active=False`) ปนมากับ `refund-2026` (`is_active=True`) และคำไทยใน chunk สะกดเป็น `ค\\u0e4d\\u0e32สั่งซื้อ` ปัญหานี้ต้องแก้ที่ชั้นใด?",
        [
          ["แก้ที่ System Prompt และลด temperature อย่างเดียว", "Prompt ไม่ได้แก้เอกสารเก่าที่หลุดเข้ามาและไม่ซ่อมสระอำแตกในดัชนี"],
          [
            "แก้ที่ชั้น Ingestion/Cleaning (ซ่อมสระอำแตก + NFC) และชั้น Metadata Indexing (กรอง `is_active=True` / `updated_at`)",
            "ถูก — ต้องแก้ทั้งความสะอาดของข้อความต้นทางและตัวกรอง metadata ก่อนส่งถึงชั้น Generation",
          ],
          ["เพิ่ม `overlap_tokens` เป็น 50%", "Overlap ไม่ได้แก้เอกสารหมดอายุหรือสระอำแตก"],
          ["เปลี่ยนจาก Pydantic เป็น dict ธรรมดา", "Pydantic ช่วยบังคับ metadata contract ให้แข็งแรงขึ้น ไม่ใช่สาเหตุของปัญหา"],
        ],
        "B",
        "ปัญหาทั้งสองจุดเกิดที่ต้นน้ำ: สระอำแตกต้องซ่อมในขั้น Ingestion Cleaning (D94) และเอกสารหมดอายุต้องกรองด้วย Metadata (D93/D94/D107)",
        "หากพบทั้งสระอำแตกและเอกสารเก่า (`is_active=False`) ปนอยู่ใน retrieved chunks ต้องแก้ที่จุดใดบ้าง?",
        "แก้ที่ Ingestion Cleaning (แทน \\u0e4d\\u0e32 -> \\u0e33 + NFC) และ Metadata Filtering (กรองเฉพาะเอกสาร active/ล่าสุด)",
      ),
      mc(
        "d096-q4",
        "ในการเขียน {{pytest}} ตรวจคุณภาพ Chunker เหตุใดการตรวจแค่ `audit_chunks(chunks) == []` จึงยังไม่เพียงพอ?",
        [
          ["เพราะ `pytest` ไม่รองรับการเทียบลิสต์ว่าง `[]`", "`pytest` รองรับ `assert findings == []` ตามปกติ"],
          [
            "เพราะโค้ดที่มีบั๊กอาจเผลอลบเนื้อหาจริงออกหมดจนผ่าน audit เป็น `[]` ได้ จึงต้องมี assertion ตรวจ **Data Preservation** ว่าข้อมูลสำคัญและทุกแถวตารางยังอยู่ครบด้วย",
            "ถูก — ต้องตรวจทั้งคุณภาพโครงสร้าง (0 issues) และความครบถ้วนของข้อมูลต้นฉบับควบคู่กัน",
          ],
          ["เพราะ `audit_chunks` ทำงานได้เฉพาะเมื่อต่อ LLM API", "`audit_chunks` เป็นฟังก์ชัน deterministic ที่รันออฟไลน์ได้ 100%"],
          ["เพราะ chunk ที่ดีต้องมีอย่างน้อย 1 issue เสมอ", "chunk ที่ดีควรมี 0 issues และข้อมูลครบถ้วน"],
        ],
        "B",
        "การทดสอบท่อข้อมูลที่ดีต้องตรวจทั้ง **No Defects** (`audit == []`) และ **No Data Loss** (ทุกแถวราคาและเงื่อนไขสำคัญยังอยู่ครบ)",
        "นอกจากเช็กว่า `audit_chunks == []` แล้ว ควรเช็กอะไรคู่กันในเทสต์ของ Chunker?",
        "เช็ก Data Preservation ว่าข้อมูลสำคัญทุกแถวตารางและย่อหน้า FAQ ยังอยู่ครบ ไม่ถูกลบหายไปโดยไม่ได้ตั้งใจระหว่างการล้างและแบ่งข้อความ",
      ),
    ],
  },

  takeaways: [
    "ท่อต้นน้ำของ Production Thai {{rag}} ต้องเรียงลำดับให้ถูก: **Clean & Normalize (D94) → Structural Table-Atomic Token-Aware Chunking (D95) → Automated Chunk Audit (D96)**",
    "อย่าไว้ใจตาเปล่ากับข้อความไทย: ใช้ `repr()` และ Automated QC rules ดักจับสระอำแตก (`\\u0e4d\\u0e32`), `\\u200b`, เลขหน้า, orphan heading, ตารางขาดหัว และ token เกินงบ",
    "ทุกการรีแฟกเตอร์ Chunker ต้องพิสูจน์ทั้ง **0 Audit Issues** และ **Data Preservation** ผ่าน `pytest` ก่อนส่งข้อมูลขึ้นดัชนี",
    "พร้อมก้าวสู่ Block B25 (Day 97–100): นำ chunks สะอาดพร้อม metadata ไปสร้าง Vector Index (`pgvector` / `Qdrant`) และ Thai {{bm25}} Index!",
  ],

  reviewCards: [
    rc(
      "d096-rc-1",
      "ระบุ 5–6 อาการของ Bad Chunks ที่ควรมีอยู่ใน Automated Chunk Audit Gate",
      "1) สระอำแตก/ZWSP (\\u0e4d\\u0e32, \\u200b), 2) เลขหน้า/Confidential รั่ว, 3) Orphan heading, 4) ตาราง Markdown ขาดหัวตาราง (---), 5) ไม่มี Breadcrumb [H1 > H2], 6) เกินงบ max_tokens",
    ),
    rc(
      "d096-rc-2",
      "เวลาดีบั๊กข้อความภาษาไทยใน Python ที่ตาเปล่าดูเหมือนถูกต้องแต่ `assert` ไม่ผ่าน ควรใช้คำสั่งใดตรวจสอบ?",
      "ใช้ `repr(text)` เพื่อแสดงรหัสอักขระซ่อนเร้น เช่น \\u0e4d\\u0e32 (สระอำแตก) หรือ \\u200b (zero-width space) ออกมาให้เห็นชัดทันที",
    ),
    rc(
      "d096-rc-3",
      "การทดสอบท่อ Clean + Chunk ด้วย pytest ที่รัดกุมต้องตรวจ 2 มิติใดคู่กัน?",
      "1) Quality / No Defects (audit_chunks คืน []) และ 2) Data Preservation (คีย์เวิร์ดสำคัญและทุกแถวตารางต้นฉบับยังอยู่ครบไม่หายไป)",
    ),
  ],

  sources: [
    { label: "Anthropic — Contextual Retrieval", href: "https://www.anthropic.com/news/contextual-retrieval" },
    { label: "PyMuPDF4LLM Official Documentation", href: "https://pymupdf.readthedocs.io/en/latest/pymupdf4llm/" },
    { label: "pytest Official Documentation — Assertions & Writing Tests", href: "https://docs.pytest.org/en/stable/how-to/assert.html" },
    { label: "Pydantic v2 Documentation — Models", href: "https://docs.pydantic.dev/latest/concepts/models/" },
  ],

  glossary: ["rag", "chunking", "bpe-tokenizer", "hallucination", "groundedness", "bm25", "pydantic", "pytest"],
});
