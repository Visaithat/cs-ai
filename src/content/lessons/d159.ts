import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D159 — Phase 6 / Block B40
 * Prepare Thai/Bilingual Knowledge Corpus (20+ docs, tables, FAQs)
 */
export const d159: Lesson = defineLesson({
  day: 159,
  titleTh: "เตรียมชุดคลังความรู้องค์กรไทย/สองภาษา (20+ เอกสาร, ตาราง และ FAQ)",
  tagline: "30 นาที · Garbage In, Garbage Out · คัดและทำความสะอาด 20+ เอกสารไทย/อังกฤษ พร้อมตารางและสิทธิ์ ACL",
  icon: "book-marked",
  visual: {
    id: "capstone-scaffold-corpus",
    title: "B40 ขั้นที่ 2 — คลังความรู้ Thai/Bilingual Enterprise Corpus",
    caption: "เตรียมเอกสารนโยบาย ตารางค่าธรรมเนียม PDF และ FAQ สองภาษา ≥ 20 ฉบับ พร้อมล้าง UTF-8 และติดแท็ก ACL",
    alt: "แผนภาพขั้นตอน B40 แสดงส่วน D159 Thai/EN Corpus ที่ประกอบด้วยเอกสาร 20+ ฉบับ ตาราง รหัส และ Metadata ACL",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP", "Unicode NFC", "Pydantic", "JSONL", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "คุณภาพของคลังข้อมูลกำหนดเพดานความฉลาดของ RAG",
      body: "ต่อให้ใช้ Hybrid Search + Cross-Encoder {{reranker}} ดีที่สุด หากคลังเอกสารมีสระลอย, อักขระมองไม่เห็น (`\\u200b`), หรือตารางเละจนตัวเลขหลุดแถว {{rag}} ก็จะค้นผิดและตอบมั่วทันที",
      lessonNote: "วันนี้เราคัดและสังเคราะห์คลังความรู้องค์กร ≥ 20 ฉบับให้สมจริงทั้งภาษาไทยล้วน, ไทยปนอังกฤษ, ตารางอัตราค่าบริการ, และรหัสเอกสารเฉพาะ",
    },
    {
      node: 2,
      heading: "ออกแบบเนื้อหาให้ทดสอบจุดอ่อนของโมเดลได้จริง",
      body: "คลังเอกสารที่ง่ายเกินไป (เช่น มีแต่ย่อหน้าภาษาอังกฤษสั้น ๆ) จะทำให้คะแนนเทสต์หลอกตา และไปพังเมื่อเจอคำถามลูกค้าจริงที่มีเลขใบแจ้งหนี้หรือตารางซับซ้อน",
      lessonNote: "เราจงใจใส่ตารางเงื่อนไข, รหัสแบบ `INV-2026-009` / `ภ.พ.20`, และเอกสารสองภาษาเพื่อให้ {{pythainlp}} BM25 และ {{chunking}} ใน Block B41 ได้แสดงฝีมือจริง",
    },
    {
      node: 3,
      heading: "ติด Metadata และสิทธิ์เข้าถึง (ACL) ตั้งแต่ต้นทาง",
      body: "องค์กรจริงไม่ให้พนักงานฝึกงานค้นเอกสารเงินเดือนผู้บริหารได้ และการมาไล่แปะแท็กสิทธิ์ทีหลังเมื่อ index ข้อมูลไปแล้วทำให้ต้อง re-ingest ใหม่ทั้งหมด",
      lessonNote: "ทุกเอกสารในคลังวันนี้ต้องผ่าน {{data-contract}} ที่มี `doc_id`, `category`, `lang`, `acl_roles` และ `content_sha256` เพื่อรองรับ {{idempotency}}",
    },
    {
      node: 6,
      heading: "สร้าง Golden Corpus Snapshot ก่อนเข้าสู่ Milestone 1",
      body: "เมื่อรวมเอกสารที่ผ่านการทำความสะอาดเป็นไฟล์ {{jsonl}} (`corpus_manifest.jsonl`) การทดสอบ Benchmark ใน Milestone 2 จะอ้างอิงชุดข้อมูลเดียวกันตลอด",
      lessonNote: "ไฟล์ manifest จากวันนี้จะเป็นอินพุตตรงให้สคริปต์ Ingestion & Token-Aware Chunking ใน Day 161",
    },
  ],

  objectives: [
    "**ออกแบบและจัดกลุ่ม** คลังเอกสารองค์กรสองภาษาอย่างน้อย 20 ฉบับ ครอบคลุม 4 ประเภทหลัก (`policy`, `faq`, `table`, `runbook`) พร้อมรหัสเฉพาะและกรณีไทยปนอังกฤษ",
    "**ล้างขยะอักขระภาษาไทย** (Unicode NFC, Zero-Width Space `\\u200b`, สระอำแตกตัว `ํ + า`, และบรรทัดขยะจากการ copy PDF) โดยคงโครงสร้างตาราง Markdown ให้ครบถ้วน",
    "**บังคับใช้ {{schema}} และ {{acl}} metadata** ด้วย {{pydantic}} และสร้าง `content_sha256` เก็บเป็น {{jsonl}} manifest เพื่อเตรียมส่งต่อให้ Ingestion Pipeline",
  ],

  prerequisites: [
    "มีโครงสร้างโปรเจกต์ `thai-enterprise-assistant/` และโฟลเดอร์ `data/corpus/` จาก Day 158",
    "เข้าใจแนวคิด Hybrid RAG, Thai Tokenization และ ACL Filtering จาก Phase 4",
    "ใช้งาน `Pydantic v2`, `unicodedata` และ `hashlib` ใน Python ได้",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์ย่อยใน `data/corpus/` และทดสอบการรัน Python เพื่อประมวลผลไฟล์ UTF-8 ภาษาไทยบนเครื่องของคุณ",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p data/corpus/raw data/corpus/processed
uv run python -c "import unicodedata, hashlib, pydantic; print('Corpus tools ready')"`,
    steps: [
      ["folders", "สร้างโฟลเดอร์ `data/corpus/raw` และ `data/corpus/processed`"],
      ["python", "ทดสอบ `unicodedata`, `hashlib`, `pydantic` ผ่าน `uv run python` สำเร็จ"],
      ["plan", "พร้อมเขียนตัวล้างอักขระไทย, ตรวจ schema และสร้าง corpus manifest"],
    ],
    note: "บทเรียนนี้ใช้ข้อมูลองค์กรจำลอง (synthetic enterprise docs) เพื่อความปลอดภัย — ห้ามนำเอกสารลับหรือข้อมูลส่วนบุคคลของบริษัทจริงมาใส่ใน repo สาธารณะเด็ดขาด",
  },

  concepts: [
    {
      id: "corpus-diversity-design",
      title: "1 · ออกแบบคลังความรู้ 20+ เอกสารให้ครบมิติขององค์กรไทย",
      paragraphs: [
        "ในการสร้างผู้ช่วย AI องค์กรสองภาษา คลังเอกสารที่ดีไม่ใช่การก๊อปปี้บทความยาว ๆ 20 เรื่องที่หน้าตาเหมือนกันหมด แต่ต้องสะท้อน **4 รูปแบบข้อมูลที่เจอจริงในงานซัพพอร์ตไทย**: (1) **Policy Docs** เช่น นโยบายคืนสินค้า, SLA การตอบกลับ, เงื่อนไขประกัน; (2) **Tables** เช่น ตารางค่าธรรมเนียมจัดส่งแยกตามน้ำหนัก/ภูมิภาค หรือตารางอัตราภาษีหัก ณ ที่จ่าย; (3) **Bilingual FAQs** คำถามที่ผู้ใช้พิมพ์ไทยปนอังกฤษ เช่น *\"ขอ reset SSO / 2FA\"* หรือ *\"API rate limit กี่ req/min\"*; และ (4) **Runbooks & Exact Codes** ที่มีรหัสอย่าง `INV-2026-009`, `ภ.พ.20`, `SLA-P1`",
        "นอกจากเนื้อหาที่มีคำตอบแล้ว การออกแบบคลังวันนี้ต้องวางแผน **ขอบเขตที่ไม่ครอบคลุม (Knowledge Gaps)** เอาไว้ล่วงหน้าด้วย เช่น ไม่มีนโยบายส่วนลดพนักงานสายการบินหรือเมนูอาหารกลางวัน เพื่อให้ใน Phase Eval เราสามารถสร้างคำถามแบบ *Unanswerable* มาทดสอบว่าโมเดลกล้าตอบว่าไม่รู้ ({{abstention}}) หรือแอบแต่งเรื่อง",
      ],
      analogy: "เหมือนการจัดห้องสมุดจำลองเพื่อสอบบรรณารักษ์ — ถ้าใส่แต่นิทานอ่านง่ายทุกเล่ม บรรณารักษ์จะได้คะแนนเต็มปลอม ๆ แต่พอเจอตารางบัญชีและรหัสใบแจ้งหนี้จริงก็จะหาไม่เจอทันที",
      bullets: [
        "**Policy (`policy`)**: 6–8 ฉบับ (คืนเงิน/เคลม, PDPA/เก็บรักษาข้อมูล, เงื่อนไขใบกำกับภาษี, สิทธิ์พนักงาน)",
        "**Tables (`table`)**: 4–5 ฉบับ (ตารางค่าบริการ, ตาราง SLA P1–P4, ตารางค่าจัดส่ง, ตารางสิทธิ์แต่ละ Role)",
        "**Bilingual FAQ (`faq`)**: 6–8 ฉบับ (SSO/Login, Webhook & Rate limit, การอัปโหลดเอกสาร, การออกใบเสร็จ)",
        "**Runbook & Codes (`runbook`)**: 4+ ฉบับ (ขั้นตอน Escalation, คู่มือรหัสข้อผิดพลาด `ERR-401..503` และใบแจ้งหนี้ตัวอย่าง)",
      ],
      whyTitle: "Why this matters — Corpus ดีทำให้ Benchmark ใน Milestone 2 เชื่อถือได้",
      whyParagraphs: [
        "ใน Day 164 (Milestone 2) คุณต้องวัด `Recall@5 >= 0.85` พร้อมผ่า Failure Slices (`thai_faq`, `code_switch`, `exact_id`, `table_policy`) ถ้าคลังความรู้วันนี้ไม่มีตารางและรหัสเฉพาะปนอยู่เลย Benchmark นั้นก็แทบไม่มีความหมาย",
        "คลังเอกสาร 20+ ฉบับนี้ยังเป็นสินทรัพย์สำคัญในพอร์ตโฟลิโอ เพราะแสดงให้เห็นว่าคุณเข้าใจโดเมนภาษาไทยและโครงสร้างข้อมูลองค์กรจริง",
      ],
    },
    {
      id: "thai-utf8-table-hygiene",
      title: "2 · ล้างพิษภาษาไทย (NFC, Zero-Width Chars) และรักษาโครงสร้างตาราง",
      paragraphs: [
        "เอกสารภาษาไทยที่คัดลอกมาจาก PDF, Word, หรือหน้าเว็บมักซ่อน **บั๊กที่มองไม่เห็นด้วยตาเปล่า** เช่น อักขระ Zero-Width Space (`\\u200b`) ที่แทรกอยู่กลางคำ (ทำให้ `\"ใบกำ\\u200bกับภาษี\"` ค้นหาด้วย `\"ใบกำกับภาษี\"` ไม่เจอ!) หรือสระอำที่ถูกเก็บแบบแยกตัว `\\u0e4d\\u0e32` (นฤคหิต + สระอา) แทนรูปมาตรฐาน `\\u0e33` (`ำ`)",
        "ทางแก้ที่เป็นมาตรฐานคือรัน `unicodedata.normalize(\"NFC\", text)` เพื่อรวมรูปสระไทยให้เป็นมาตรฐานเดียวกัน ลบอักขระล่องหน (`\\u200b`, `\\u200c`, `\\u200d`, `\\ufeff`) และสำหรับ **ตารางจาก PDF** ให้แปลงเป็น Markdown table ที่ชัดเจนพร้อมคงหัวตาราง (column headers) ไว้เสมอ แทนการทิ้งข้อความต่อกันเป็นบรรทัดเดียวจนตัวเลขสลับคอลัมน์",
      ],
      analogy: "เหมือนการซักล้างวัตถุดิบก่อนเข้าเครื่องบด — ถ้าไม่หยิบเศษพลาสติกใส (`\\u200b`) ออกและไม่แยกก้างตารางให้เป็นระเบียบ ต่อให้เครื่องบด (`chunking` + {{pythainlp}}) แพงแค่ไหน อาหารที่ได้ก็ยังติดคอ",
      code: {
        language: "python",
        filename: "thai_text_clean.py",
        code: `import re
import unicodedata

INVISIBLE_CHARS_RE = re.compile(r"[\\u200b\\u200c\\u200d\\ufeff]")


def normalize_thai_text(raw: str) -> str:
    # 1) รวมรูปสระ/วรรณยุกต์ไทยให้เป็น NFC มาตรฐาน
    text = unicodedata.normalize("NFC", raw)
    # 2) ลบ zero-width chars และ BOM ที่ทำให้ BM25 / exact match เพี้ยน
    text = INVISIBLE_CHARS_RE.sub("", text)
    # 3) แปลง CRLF -> LF และตัดช่องว่างท้ายบรรทัด (ยังคงโครง Markdown table)
    lines = [line.rstrip() for line in text.replace("\\r\\n", "\\n").replace("\\r", "\\n").split("\\n")]
    cleaned = "\\n".join(lines).strip()
    return re.sub(r"\\n{3,}", "\\n\\n", cleaned)`,
        caption: "ฟังก์ชันล้างข้อความไทยแบบเบาและปลอดภัย — รวมสระ NFC และกำจัดอักขระล่องหนโดยไม่ทำลายโครงสร้าง Markdown table",
      },
      whyTitle: "Why this matters — แก้บั๊กการค้นหาที่ไม่เจอคำตอบทั้งที่มีคำนั้นอยู่ตรงหน้า",
      whyParagraphs: [
        "ปัญหาที่เจอบ่อยมากในระบบ RAG ภาษาไทยคือผู้ใช้พิมพ์คำว่า *\"นโยบายคืนเงิน\"* แต่ระบบค้นไม่เจอเพราะไฟล์ต้นฉบับก๊อปมาจาก PDF ที่มี `\\u200b` คั่นอยู่กลางคำ หรือใช้ `ํ + า` แทน `ำ`",
        "การทำ text normalization ตั้งแต่ขั้นเตรียม corpus (และฝั่ง query ตอนค้นหา) ช่วยปิดช่องโหว่เหล่านี้ได้แบบถาวร",
      ],
    },
    {
      id: "metadata-acl-manifest",
      title: "3 · สัญญา Metadata, สิทธิ์ ACL และ Manifest JSONL แบบ Idempotent",
      paragraphs: [
        "ไฟล์ Markdown เปล่า ๆ ไม่มีวันเพียงพอสำหรับ {{rag}} องค์กร ทุกเอกสารต้องผูกกับ {{data-contract}} ที่บังคับด้วย {{pydantic}} {{schema}} เพื่อระบุ: `doc_id` (ไม่ซ้ำ), `title`, `category`, `lang` (`th`/`en`/`bilingual`), `acl_roles` (เช่น `[\"public\"]` สำหรับ FAQ ทั่วไป vs `[\"support_agent\", \"finance\"]` สำหรับคู่มือเคลม/บัญชีภายใน), และ `effective_date`",
        "เมื่อผ่านการตรวจแล้ว เราคำนวณ `content_sha256` จากเนื้อหาที่ล้างสะอาดแล้วบันทึกลง `data/corpus/processed/corpus_manifest.jsonl` ({{jsonl}}) ค่า hash นี้ทำให้ขั้นตอน ingestion ใน Day 161 มีคุณสมบัติ {{idempotency}}: ถ้ารันสคริปต์ซ้ำ เอกสารที่ hash เดิมจะถูกข้ามโดยไม่ต้องเสียเงินคำนวณ embedding ใหม่",
      ],
      analogy: "เหมือนบาร์โค้ด + ป้ายระดับความลับหน้าแฟ้มเอกสาร — คลังเอกสารรู้ทันทีว่าแฟ้มนี้ชื่ออะไร, แผนกไหนเปิดอ่านได้, และเวอร์ชันข้างในเปลี่ยนไปจากครั้งก่อนหรือยัง",
      code: {
        language: "json",
        filename: "data/corpus/processed/corpus_manifest.jsonl (1 line)",
        code: `{"doc_id":"pol-refund-01","title":"นโยบายการคืนเงินและยกเลิกคำสั่งซื้อ B2B","category":"policy","lang":"bilingual","acl_roles":["public","support_agent"],"effective_date":"2026-01-15","has_table":true,"content_sha256":"9f4c2a...","body":"## เงื่อนไขการคืนเงิน\\n| ประเภทสินค้า | ระยะเวลาคืน | ค่าธรรมเนียม |\\n|---|---|---|\\n| SaaS Annual | 14 วัน | 0% |"}`,
        caption: "1 บรรทัด = 1 เอกสารที่ผ่าน normalization, schema validation และติดสิทธิ์ ACL พร้อมส่งเข้า Ingestion Pipeline",
      },
      whyTitle: "Why this matters — ป้องกัน Data Leak ข้ามแผนกและประหยัดค่า Embedding",
      whyParagraphs: [
        "การไม่ติด `acl_roles` ตั้งแต่ขั้นเตรียม corpus ทำให้ตอนสร้าง Retrieval (D163) ไม่มี metadata ให้กรอง ลูกค้าทั่วไปอาจถามเจอคู่มือปรับวงเงินภายในของพนักงานซัพพอร์ตได้",
        "ส่วน `content_sha256` คือหัวใจของการทำ incremental re-indexing ในระบบจริง เมื่อแก้ policy แค่ 1 ฉบับ ระบบจะอัปเดตเฉพาะ chunk ของฉบับนั้น",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Seed Data & CMS Schema สู่ RAG Knowledge Corpus",
      body: [
        "นักพัฒนาเว็บคุ้นเคยกับการออกแบบ database seed data หรือ CMS content model ก่อนสร้างหน้าเว็บ — การเตรียม Knowledge Corpus ก็คือสิ่งเดียวกันสำหรับระบบ RAG",
      ],
      table: [
        ["CorpusDoc (Pydantic Schema)", "CMS Content Type / Zod Schema"],
        ["acl_roles: [\"public\", \"finance\"]", "RBAC Role Tags สำหรับกรอง query"],
        ["Unicode NFC + ลบ \\u200b", "Input Sanitization ก่อนลง DB"],
        ["corpus_manifest.jsonl + sha256", "Database Seed + Idempotent Migration Hash"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมแค่โยนไฟล์ PDF เข้าโฟลเดอร์เฉย ๆ ถึงไม่พอ",
      body: [
        "หลายคนคิดว่าทำ RAG แค่โหลดไฟล์ PDF 20 ไฟล์มาวางในโฟลเดอร์แล้วให้โค้ดอ่านก็จบ แต่ในความเป็นจริง PDF ภาษาไทยมักมีอักขระสระลอย, หัวกระดาษซ้ำทุกหน้า, และตารางที่อ่านจากซ้ายไปขวาแล้วข้อมูลสลับแถว",
        "การสละเวลา 1 วันมาทำความสะอาดข้อมูล, ตรวจความครบถ้วน, และจัดทำ manifest ที่มี metadata ชัดเจน จะทำให้ทุกวันหลังจากนี้ราบรื่นขึ้นหลายเท่า",
      ],
    },
  },

  workedExample: {
    intro:
      "มาสร้างท่อเตรียมข้อมูลขนาดกะทัดรัดที่รับเอกสารดิบที่มีอักขระขยะภาษาไทย (`\\u200b` และ `ํ + า`), ตรวจสอบ {{schema}} + {{acl}} ด้วย `Pydantic`, และคำนวณ `SHA-256` เก็บเป็น JSONL manifest กด **ขั้นต่อไป** เพื่อดูทีละขั้น",
    steps: [
      {
        title: "1 · ล้างอักขระล่องหนและรวมรูปสระภาษาไทย (NFC)",
        explain:
          "ทดสอบข้อความที่มีสระอำแบบแยกตัว (`\\u0e4d\\u0e32`) และ Zero-Width Space (`\\u200b`) ซ่อนอยู่กลางคำว่า *\"คำนวณ\"* และ *\"ใบกำกับภาษี\"* แล้วดูผลหลัง normalize",
        code: {
          language: "python",
          filename: "worked_corpus.py",
          code: `import re
import unicodedata

RAW_THAI = "การค\\u0e4d\\u0e32นวณค่าธรรมเนียม และ ใบกำ\\u200bกับภาษี ภ.พ.20\\r\\n\\r\\n\\r\\n| แผน | ราคา |\\n|---|---|\\n| Pro | 990 |"
INVISIBLE_RE = re.compile(r"[\\u200b\\u200c\\u200d\\ufeff]")


def normalize_thai_text(text: str) -> str:
    nfc = unicodedata.normalize("NFC", text)
    no_zw = INVISIBLE_RE.sub("", nfc)
    lines = [line.rstrip() for line in no_zw.replace("\\r\\n", "\\n").replace("\\r", "\\n").split("\\n")]
    return re.sub(r"\\n{3,}", "\\n\\n", "\\n".join(lines).strip())


clean = normalize_thai_text(RAW_THAI)
print("Contains 'คำนวณ':", "คำนวณ" in clean)
print("Contains 'ใบกำกับภาษี':", "ใบกำกับภาษี" in clean)
print("Has ZWSP:", "\\u200b" in clean)`,
        },
        output: `Contains 'คำนวณ': True
Contains 'ใบกำกับภาษี': True
Has ZWSP: False`,
      },
      {
        title: "2 · ตรวจ Data Contract และ ACL ด้วย Pydantic v2",
        explain:
          "นิยามโมเดล `CorpusDoc` เพื่อตรวจ `category`, `lang`, และ `acl_roles` (ต้องมีอย่างน้อย 1 role และห้ามเป็นสตริงว่าง) พร้อมสร้าง `content_sha256` จากข้อความที่ล้างแล้ว",
        code: {
          language: "python",
          filename: "worked_corpus.py",
          code: `import hashlib
from typing import Literal
from pydantic import BaseModel, Field, field_validator


class CorpusDoc(BaseModel):
    doc_id: str = Field(min_length=3, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=5)
    category: Literal["policy", "faq", "table", "runbook"]
    lang: Literal["th", "en", "bilingual"]
    acl_roles: list[str] = Field(min_length=1)
    body: str = Field(min_length=20)

    @field_validator("acl_roles")
    @classmethod
    def clean_roles(cls, roles: list[str]) -> list[str]:
        cleaned = [r.strip().lower() for r in roles if r.strip()]
        if not cleaned:
            raise ValueError("acl_roles must contain at least one non-empty role")
        return cleaned

    def sha256(self) -> str:
        return hashlib.sha256(self.body.encode("utf-8")).hexdigest()


doc = CorpusDoc(
    doc_id="fee-table-01",
    title="ตารางค่าธรรมเนียมบริการและภาษี ภ.พ.20",
    category="table",
    lang="bilingual",
    acl_roles=["public", "support_agent"],
    body=clean,
)
print(f"{doc.doc_id} | roles={doc.acl_roles} | sha256={doc.sha256()[:12]}...")`,
        },
        output: `fee-table-01 | roles=['public', 'support_agent'] | sha256=d8b1c4a9...`,
      },
      {
        title: "3 · เขียน Manifest JSONL และตรวจความครอบคลุมคลังเอกสาร",
        explain:
          "แปลงเอกสารที่ผ่าน schema เป็นรูปแบบ JSONL 1 บรรทัดต่อ 1 เอกสาร และเช็กสถิติเบื้องต้นเพื่อเตรียมเข้า Milestone 1 Sign-off",
        code: {
          language: "python",
          filename: "worked_corpus.py",
          code: `import json

manifest_record = {
    **doc.model_dump(),
    "has_table": "|" in doc.body and "---" in doc.body,
    "content_sha256": doc.sha256(),
}
jsonl_line = json.dumps(manifest_record, ensure_ascii=False)
print("JSONL length:", len(jsonl_line), "| has_table:", manifest_record["has_table"])`,
        },
        output: `JSONL length: 342 | has_table: True`,
      },
    ],
    gotcha:
      "จุดสังเกต: เวลา `json.dumps(...)` เพื่อสร้าง JSONL ภาษาไทย ให้ใส่ **`ensure_ascii=False`** เสมอ ไม่อย่างนั้นข้อความภาษาไทยจะถูกแปลงเป็น `\\u0e01\\u0e02...` จนอ่าน/ตรวจแก้ด้วยตาเปล่าแทบไม่ได้และขนาดไฟล์บวมขึ้น 3–4 เท่า",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/corpus_prep.py` เพื่อทำความสะอาดข้อความไทย ตรวจสอบ schema + ACL ของเอกสารทุกฉบับ และทำ Corpus Readiness Audit (ตรวจจำนวน ≥ 20 ฉบับ, ครบทั้ง 4 หมวดหมู่, และมีตารางจริง)",
    requirements: [
      "`normalize_thai_text(text: str) -> str` — ทำ `unicodedata.normalize(\"NFC\", text)`, ลบอักขระล่องหน (`\\u200b`, `\\u200c`, `\\u200d`, `\\ufeff`), แปลง `\\r\\n`/`\\r` เป็น `\\n`, ตัดช่องว่างท้ายบรรทัด, และยุบ `\\n{3,}` เป็น `\\n\\n`",
      "`CorpusDocument(BaseModel)` — ฟิลด์ `doc_id` (`^[a-z0-9-]+$`), `title` (`min_length=5`), `category: Literal[\"policy\", \"faq\", \"table\", \"runbook\"]`, `lang: Literal[\"th\", \"en\", \"bilingual\"]`, `acl_roles: list[str]` (อย่างน้อย 1 role ที่ไม่ว่าง), และ `body: str` (`min_length=30` หลัง normalize)",
      "`build_manifest_records(raw_docs: list[dict]) -> list[dict]` — normalize `title` และ `body` ของทุก doc, ตรวจสอบด้วย `CorpusDocument`, ป้องกัน `doc_id` ซ้ำ (โยน `ValueError`), และเพิ่มฟิลด์ `has_table: bool` กับ `content_sha256: str` (UTF-8 SHA-256 ของ `body`)",
      "`audit_corpus(records: list[dict], min_docs: int = 20) -> dict` — คืน dict ที่มี `total_docs`, `by_category`, `table_doc_count`, `restricted_doc_count` (เอกสารที่ `acl_roles` ไม่ได้มีแค่ `\"public\"`), `missing_categories` (เทียบกับ `{\"policy\", \"faq\", \"table\", \"runbook\"}`), และ `passed: bool` (`total_docs >= min_docs`, `not missing_categories`, `table_doc_count >= 1`, `restricted_doc_count >= 1`)",
    ],
    starter: {
      language: "python",
      filename: "src/corpus_prep.py",
      code: `import hashlib
import re
import unicodedata
from collections import Counter
from typing import Literal
from pydantic import BaseModel, Field, field_validator

REQUIRED_CATEGORIES = {"policy", "faq", "table", "runbook"}
INVISIBLE_CHARS_RE = re.compile(r"[\\u200b\\u200c\\u200d\\ufeff]")


def normalize_thai_text(text: str) -> str:
    # TODO: NFC + strip invisible chars + normalize newlines + strip line trailing spaces
    raise NotImplementedError


class CorpusDocument(BaseModel):
    doc_id: str = Field(min_length=3, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=5)
    category: Literal["policy", "faq", "table", "runbook"]
    lang: Literal["th", "en", "bilingual"]
    acl_roles: list[str] = Field(min_length=1)
    body: str = Field(min_length=30)

    @field_validator("acl_roles")
    @classmethod
    def check_roles(cls, roles: list[str]) -> list[str]:
        # TODO: trim และตรวจว่าต้องมี role ที่ไม่ว่างอย่างน้อย 1 ตัว
        raise NotImplementedError


def build_manifest_records(raw_docs: list[dict]) -> list[dict]:
    # TODO: normalize, validate, reject duplicate doc_id, attach has_table & content_sha256
    raise NotImplementedError


def audit_corpus(records: list[dict], min_docs: int = 20) -> dict:
    # TODO: สรุปสถิติและคืน passed flag
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_corpus_prep.py",
      code: `import pytest
from src.corpus_prep import audit_corpus, build_manifest_records, normalize_thai_text


def _make_sample_corpus(n: int = 20) -> list[dict]:
    categories = ["policy", "faq", "table", "runbook"]
    docs = []
    for i in range(n):
        cat = categories[i % 4]
        is_table = cat == "table"
        body = (
            "## ตารางอัตราค่าบริการ\\n| แผน | ราคา |\\n|---|---|\\n| Pro | 990 บาท |"
            if is_table
            else f"เอกสารนโยบายและขั้นตอนการให้บริการองค์กรฉบับที่ {i + 1} รองรับคำถามภาษาไทยและอังกฤษ"
        )
        docs.append(
            {
                "doc_id": f"doc-{i:02d}",
                "title": f"คู่มือองค์กรฉบับที่ {i + 1}",
                "category": cat,
                "lang": "bilingual" if i % 2 == 0 else "th",
                "acl_roles": ["support_agent"] if i % 5 == 0 else ["public"],
                "body": body,
            }
        )
    return docs


def test_normalize_thai_text_fixes_sara_am_and_zwsp():
    dirty = "ค\\u0e4d\\u0e32อธิบาย\\u200bเอกสาร  \\r\\n\\r\\n\\r\\nบรรทัดถัดไป"
    clean = normalize_thai_text(dirty)
    assert clean == "คำอธิบายเอกสาร\\n\\nบรรทัดถัดไป"


def test_build_manifest_and_audit_passes_for_20_diverse_docs():
    records = build_manifest_records(_make_sample_corpus(20))
    report = audit_corpus(records, min_docs=20)
    assert report["total_docs"] == 20
    assert report["missing_categories"] == []
    assert report["table_doc_count"] >= 1
    assert report["restricted_doc_count"] >= 1
    assert report["passed"] is True


def test_duplicate_doc_id_raises_value_error():
    docs = _make_sample_corpus(4)
    docs[1]["doc_id"] = docs[0]["doc_id"]
    with pytest.raises(ValueError):
        build_manifest_records(docs)


def test_audit_fails_when_under_min_docs_or_missing_category():
    docs = [d for d in _make_sample_corpus(20) if d["category"] != "runbook"]
    records = build_manifest_records(docs)
    report = audit_corpus(records, min_docs=20)
    assert report["passed"] is False
    assert "runbook" in report["missing_categories"]


def test_sha256_is_deterministic_after_invisible_char_cleanup():
    doc_a = _make_sample_corpus(1)[0]
    doc_b = {**doc_a, "body": doc_a["body"] + "\\u200b"}
    rec_a = build_manifest_records([doc_a])[0]
    rec_b = build_manifest_records([doc_b])[0]
    assert rec_a["content_sha256"] == rec_b["content_sha256"]
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_corpus_prep.py` แล้วผ่านครบทั้ง 5 test cases",
      "รันสคริปต์กับคลังเอกสารจริง ≥ 20 ฉบับของคุณใน `data/corpus/raw/` แล้วได้ไฟล์ `data/corpus/processed/corpus_manifest.jsonl`",
      "เปิดดูไฟล์ `.jsonl` ด้วยตาเปล่าแล้วภาษาไทยอ่านออกชัดเจน (ไม่มี `\\u0e01...`) และตาราง Markdown ยังเรียงคอลัมน์ถูกต้อง",
      "ตรวจสอบว่ามีทั้งเอกสาร `public` และเอกสารที่มี role จำกัดสิทธิ์ (เช่น `support_agent`, `finance`) เพื่อใช้ทดสอบ ACL ใน Day 163",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_corpus_prep.py`, `uv run ruff check .` ผ่าน 0 error และมี manifest ≥ 20 เอกสารในโปรเจกต์",
    hints: [
      {
        body: "อย่าลืม normalize ข้อความ `body` และ `title` **ก่อน** ส่งเข้า `CorpusDocument.model_validate(...)` เพื่อให้ `min_length=30` วัดจากข้อความสะอาดจริง และ `content_sha256` คำนวณจาก `body` หลัง normalize",
      },
      {
        body: "ตรวจตาราง Markdown ง่าย ๆ ด้วย `\"|\" in doc.body and \"---\" in doc.body` และตรวจเอกสารจำกัดสิทธิ์ด้วย `any(r != \"public\" for r in rec[\"acl_roles\"])`",
      },
      {
        body: "โครงร่างของ `build_manifest_records` และ `audit_corpus` — เติม `normalize_thai_text` และ `check_roles` แล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def build_manifest_records(raw_docs: list[dict]) -> list[dict]:
    seen: set[str] = set()
    records: list[dict] = []
    for item in raw_docs:
        cleaned = {
            **item,
            "title": normalize_thai_text(item.get("title", "")),
            "body": normalize_thai_text(item.get("body", "")),
        }
        doc = CorpusDocument.model_validate(cleaned)
        if doc.doc_id in seen:
            raise ValueError(f"duplicate doc_id: {doc.doc_id}")
        seen.add(doc.doc_id)
        digest = hashlib.sha256(doc.body.encode("utf-8")).hexdigest()
        has_table = "|" in doc.body and "---" in doc.body
        records.append({**doc.model_dump(), "has_table": has_table, "content_sha256": digest})
    return records`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_corpus_prep.py
uv run ruff check .`,
      caption: "รันทดสอบการเตรียมชุดเอกสารสองภาษาก่อนเข้าสู่ Milestone 1 Sign-off ใน Day 160",
    },
  },

  mistakes: [
    {
      title: "คัดลอกข้อความภาษาไทยจาก PDF แล้วไม่ลบ Zero-Width Space (`\\u200b`) และไม่ทำ NFC",
      symptom: "คำว่า \"ใบกำกับภาษี\" มองด้วยตาเปล่าเหมือนกันเป๊ะ แต่ค้นหาด้วยคำตรง ๆ หรือ BM25 ไม่เจอเลย",
      fix: "รัน `unicodedata.normalize(\"NFC\", text)` และลบ `[\\u200b\\u200c\\u200d\\ufeff]` ทั้งตอนเตรียม corpus และตอนรับ query",
    },
    {
      title: "แปลงตาราง PDF เป็นข้อความบรรทัดเดียวจนคอลัมน์ปนกันมั่ว",
      symptom: "ตารางอัตราค่าธรรมเนียมถูกย่อยเป็นคำเรียงต่อกัน LLM จับคู่ราคาผิดแพ็กเกจ",
      fix: "จัดรูปตารางเป็น Markdown Table (`| col1 | col2 |`) ที่รักษาหัวตารางและแถวข้อมูลไว้ชัดเจน",
    },
    {
      title: "ใส่ข้อมูลลูกค้าจริงหรือเลขบัตรประชาชนจริงลงในคลังเอกสารตัวอย่าง",
      symptom: "ละเมิด {{pdpa}} และเสี่ยงข้อมูลรั่วไหลเมื่อนำโค้ดขึ้น GitHub",
      fix: "ใช้ข้อมูลสังเคราะห์ทั้งหมด (เช่น `INV-2026-009`, `02-000-0000`) และเพิ่มตัวสแกน PII hygiene check ก่อน commit",
    },
    {
      title: "ลืมใส่ `acl_roles` ให้เอกสารตั้งแต่ตอนสร้างคลัง",
      symptom: "เมื่อทำระบบ RAG เสร็จแล้วเพิ่งรู้ว่าต้องแยกสิทธิ์พนักงานกับลูกค้า ทำให้ต้องรื้อ schema และ re-ingest ข้อมูลใหม่ทั้งหมด",
      fix: "บังคับฟิลด์ `acl_roles` เป็น list ที่ไม่ว่างใน `CorpusDocument` ตั้งแต่วันนี้",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d159-q1",
        "ปัญหาใดที่เกิดบ่อยที่สุดเมื่อคัดลอกข้อความภาษาไทยจากไฟล์ PDF มาทำดัชนีค้นหาโดยไม่ทำ **Unicode NFC + ลบ `\\u200b`**?",
        [
          ["ไฟล์ JSONL จะไม่สามารถเปิดใน VS Code ได้เลย", "ไฟล์ยังเปิดได้ตามปกติ แต่การจับคู่สตริงและการตัดคำจะเพี้ยน"],
          ["คำที่ตาเปล่ามองเห็นเหมือนกันเป๊ะ (เช่น `ใบกำกับภาษี` หรือ `คำนวณ`) ค้นหาด้วย keyword/BM25 ไม่เจอเพราะมีอักขระล่องหนหรือสระแยกตัวแทรกอยู่", "ถูก — `\\u200b` (ZWSP) และ `\\u0e4d\\u0e32` ทำให้ byte sequence ต่างจากข้อความที่ผู้ใช้พิมพ์"],
          ["Python `pydantic` จะโยน `ValidationError` ทุกครั้งที่มีอักษรไทย", "Pydantic รองรับ UTF-8 เต็มรูปแบบ ไม่ได้ error กับอักษรไทย"],
          ["Docker container จะใช้ RAM เพิ่มขึ้น 10 เท่า", "อักขระล่องหนไม่กี่ตัวไม่ได้ทำให้ RAM พุ่ง 10 เท่า แต่ทำให้คุณภาพการค้นหาตก"],
        ],
        "B",
        "อักขระ Zero-Width Space (`\\u200b`) และสระอำแบบแยกตัว (`\\u0e4d\\u0e32`) ทำให้สตริงไม่ตรงกับข้อความที่ผู้ใช้พิมพ์ แม้ตาเปล่าจะเห็นเหมือนกัน",
        "เหตุใดต้องทำ `unicodedata.normalize(\"NFC\", text)` และลบ `\\u200b` กับเอกสารภาษาไทยก่อนทำ index?",
        "เพื่อรวมสระ/วรรณยุกต์ให้เป็นมาตรฐานเดียวและกำจัด Zero-Width Space จาก PDF ที่ทำให้ exact match และ BM25 หาคำไม่เจอ",
      ),
      mc(
        "d159-q2",
        "การเก็บค่า `content_sha256` ไว้ใน `corpus_manifest.jsonl` มีประโยชน์โดยตรงต่อคุณสมบัติใดในขั้น Ingestion (Day 161)?",
        [
          ["ทำให้ LLM ตอบคำถามเร็วขึ้น 5 เท่า", "Hash ไม่ได้เร่งความเร็ว LLM แต่ช่วยลดงานซ้ำในขั้น ingestion"],
          ["**Idempotency** — รัน ingestion ซ้ำได้โดยข้ามเอกสารที่เนื้อหาไม่เปลี่ยน ประหยัดเวลาและค่า embedding", "ถูก — ถ้า SHA-256 เดิมตรงกับในฐานข้อมูลก็ไม่ต้อง chunk และยิง embedding API ซ้ำ"],
          ["ใช้แทนการทำ ACL role filtering", "Hash เป็นลายนิ้วมือของเนื้อหา ไม่ได้บอกสิทธิ์ผู้ใช้"],
          ["ใช้เข้ารหัสลับข้อมูล PDPA ให้ถอดรหัสกลับมาเป็นคำตอบ", "SHA-256 เป็น one-way hash ถอดรหัสกลับไม่ได้"],
        ],
        "B",
        "`content_sha256` ทำให้ระบบ ingestion ตรวจจับได้แบบ deterministic ว่าเอกสารไหนไม่เปลี่ยนแปลงและข้ามการคำนวณ embedding ซ้ำได้",
        "`content_sha256` ใน `corpus_manifest.jsonl` ช่วยงาน Ingestion Pipeline ในเรื่องใด?",
        "ทำให้การ re-ingest มีคุณสมบัติ Idempotency — ตรวจได้ว่าเอกสารไหนไม่เปลี่ยนและข้ามการสร้าง chunk/embedding ใหม่ ช่วยประหยัดเวลาและต้นทุน",
      ),
      mc(
        "d159-q3",
        "เหตุใดในการเตรียมคลังความรู้ 20+ เอกสาร จึงควรผสมทั้ง `policy`, `table`, `faq` (ไทยปนอังกฤษ) และ `runbook` ที่มีรหัสอย่าง `INV-2026-009`?",
        [
          ["เพื่อให้ทดสอบจุดอ่อนจริงของ RAG (เช่น ตารางแตก, รหัสเฉพาะ, code-switching) ได้ตั้งแต่ Milestone 2", "ถูก — คลังที่มีแต่นิยามง่าย ๆ จะปิดบังบั๊กของ chunking และ dense-only retrieval"],
          ["เพราะ `PyThaiNLP` อ่านได้เฉพาะเอกสารที่มีคำภาษาอังกฤษปนอยู่", "ไม่จริง — PyThaiNLP ตัดคำภาษาไทยล้วนได้ดี แต่เราใส่ code-switching เพราะผู้ใช้จริงพิมพ์แบบนั้น"],
          ["เพราะ PostgreSQL ไม่ยอมเก็บเอกสารประเภทเดียวกันเกิน 5 แถว", "ไม่จริง — เป็นเรื่องการออกแบบความหลากหลายของชุดข้อมูลเพื่อการประเมินผล"],
          ["เพื่อหลีกเลี่ยงไม่ต้องเขียน unit test ใน `pytest`", "ไม่เกี่ยว — เรายังคงเขียน unit test และ eval suite ครบถ้วน"],
        ],
        "A",
        "ความหลากหลายของรูปแบบเอกสารในคลังช่วยให้ Retrieval Benchmark และ Golden Eval สะท้อนปัญหาที่เกิดจริงในองค์กรไทย",
        "ทำไมคลังเอกสาร Capstone 20+ ฉบับจึงต้องมีทั้งตาราง, รหัสเอกสารเฉพาะ, และ FAQ สองภาษา?",
        "เพื่อให้ benchmark และ eval ทดสอบความสามารถจริงของ chunking, PyThaiNLP BM25 และ Hybrid Search บนข้อมูลที่ซับซ้อนเหมือนงานจริง",
      ),
      mc(
        "d159-q4",
        "เมื่อใช้ `json.dumps(record)` ใน Python เพื่อเขียนไฟล์ `corpus_manifest.jsonl` ภาษาไทย ควรส่งพารามิเตอร์ใดเพิ่มเติมเสมอ?",
        [
          ["`sort_keys=True` เพื่อเรียงลำดับตัวอักษรไทย", "`sort_keys` เรียงเฉพาะ key ของ dict ไม่ได้ช่วยให้ข้อความไทยอ่านง่าย"],
          ["`ensure_ascii=False` เพื่อให้ตัวอักษรไทยถูกเขียนเป็น UTF-8 ที่อ่านได้โดยตรงแทน `\\u0eXX`", "ถูก — ช่วยให้ไฟล์สั้นลง อ่านตรวจด้วยตาเปล่าได้ง่าย และลดขนาดไฟล์ JSONL"],
          ["`indent=4` เพื่อให้ 1 เอกสารแบ่งเป็นหลายบรรทัด", "ห้ามใส่ `indent=4` ใน JSONL เพราะมาตรฐาน JSONL ต้องเป็น 1 object ต่อ 1 บรรทัด"],
          ["`allow_nan=False` เพื่อลบตาราง Markdown ออก", "`allow_nan` เกี่ยวกับค่า `NaN` ทางคณิตศาสตร์ ไม่เกี่ยวกับภาษาไทยหรือตาราง"],
        ],
        "B",
        "ค่าเริ่มต้นของ `json.dumps` ใน Python คือ `ensure_ascii=True` ซึ่งจะ escape ตัวอักษรไทยทั้งหมดเป็น `\\u0eXX` การตั้ง `ensure_ascii=False` และห้ามใส่ `indent` จึงเหมาะกับ JSONL ภาษาไทยที่สุด",
        "การเขียนไฟล์ JSONL ภาษาไทยด้วย `json.dumps` ควรตั้งค่าอย่างไร?",
        "ใส่ `ensure_ascii=False` เพื่อให้เก็บเป็น UTF-8 อ่านออกได้ตรง ๆ และไม่ใส่ `indent` เพื่อคงรูปแบบ 1 JSON object ต่อ 1 บรรทัด",
      ),
    ],
  },

  takeaways: [
    "เตรียมคลังเอกสารองค์กรอย่างน้อย **20+ ฉบับ** ให้ครบ 4 หมวด (`policy`, `faq`, `table`, `runbook`) พร้อมกรณีไทยปนอังกฤษและรหัสเอกสารเฉพาะ",
    "ล้างข้อความภาษาไทยด้วย **Unicode NFC + ลบอักขระล่องหน (`\\u200b`)** และรักษาตารางให้อยู่ในรูป Markdown Table เสมอ",
    "บังคับ {{data-contract}} ด้วย {{pydantic}} ที่มี `doc_id`, `category`, `lang`, `acl_roles` และ `content_sha256` เพื่อรองรับ {{acl}} และ {{idempotency}}",
    "บันทึกผลลัพธ์เป็น `corpus_manifest.jsonl` (ด้วย `ensure_ascii=False`) เพื่อส่งต่อให้ Ingestion & Chunking ใน Block B41",
  ],

  reviewCards: [
    rc(
      "d159-rc-1",
      "ขั้นตอนทำความสะอาดข้อความภาษาไทยจาก PDF ก่อนทำ RAG Index มีอะไรบ้าง?",
      "1) แปลง Unicode เป็น NFC (แก้สระอำแยกตัว), 2) ลบ zero-width chars (\\u200b, \\ufeff), 3) จัดรูปตารางเป็น Markdown Table ที่คงหัวตาราง",
    ),
    rc(
      "d159-rc-2",
      "Metadata ขั้นต่ำที่ควรติดไว้กับเอกสารทุกฉบับในคลังองค์กรก่อนเข้า Ingestion คืออะไร?",
      "doc_id (unique), title, category, lang, acl_roles (สิทธิ์เข้าถึง), effective_date และ content_sha256",
    ),
    rc(
      "d159-rc-3",
      "ทำไมห้ามส่ง `indent=2` แต่ควรส่ง `ensure_ascii=False` เมื่อเขียนไฟล์ `.jsonl` ภาษาไทย?",
      "JSONL ต้องมี 1 JSON object ต่อ 1 บรรทัด (ห้ามมี indent หลายบรรทัด) และ ensure_ascii=False ช่วยให้ภาษาไทยเก็บเป็น UTF-8 อ่านออกได้ทันที",
    ),
  ],

  sources: [
    { label: "Python Docs — unicodedata (Unicode NFC Normalization)", href: "https://docs.python.org/3/library/unicodedata.html" },
    { label: "JSON Lines (JSONL) Format Specification", href: "https://jsonlines.org/" },
    { label: "PyThaiNLP — Text Normalization Utilities", href: "https://pythainlp.github.io/docs/" },
    { label: "Pydantic v2 — Validators & Schema Enforcement", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
  ],

  glossary: ["rag", "pythainlp", "chunking", "pydantic", "schema", "data-contract", "acl", "jsonl", "idempotency", "pdpa"],
});
