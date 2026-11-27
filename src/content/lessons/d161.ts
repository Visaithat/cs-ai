import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D161 — Phase 6 / Block B41
 * Build Ingestion Pipeline + Token-Aware Chunking
 */
export const d161: Lesson = defineLesson({
  day: 161,
  titleTh: "สร้าง Ingestion Pipeline และ Token-Aware Chunking สำหรับเอกสารสองภาษา",
  tagline: "30 นาที · ออกแบบท่อนำเข้าเอกสารที่สะอาด คงหัวตาราง ตัดคำไทยแม่น และไม่สร้าง chunk ซ้ำ",
  icon: "scissors",
  visual: {
    id: "capstone-hybrid-ingest",
    title: "เส้นทางนำเข้าเอกสารองค์กร: Normalize → Table/Token Chunking → Deterministic IDs",
    caption: "แปลงเอกสาร Markdown/PDF สองภาษาให้เป็น chunk ที่มี token พอดี รักษาหัวตารางและ metadata/ACL ครบถ้วน",
    alt: "แผนภาพ Ingestion Pipeline และ Token-Aware Chunking สำหรับระบบ Hybrid RAG ของ Capstone",
  },
  requiresApiKey: false,
  tools: ["Python 3.12", "Pydantic v2", "tiktoken / Token Estimator", "PyThaiNLP", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อมูลเข้าดีมีชัยไปกว่าครึ่ง (Garbage In, Garbage Out)",
      body: "ต่อให้ใช้ {{embedding}} และโมเดล {{llm}} ที่ฉลาดแค่ไหน หาก {{chunking}} ตัดตารางค่าธรรมเนียมขาดครึ่ง หรือเก็บอักขระขยะจาก PDF เข้าฐานข้อมูล ระบบ {{rag}} ก็จะค้นหาคำตอบไม่เจอหรืออ้างอิงผิด",
      lessonNote: "วันนี้เราสร้างท่อ Ingestion ของระบบ Capstone ที่ทำความสะอาดข้อความไทย-อังกฤษ แยกหัวข้อ และติดป้ายสิทธิ์ {{acl}} ให้ทุกชิ้นข้อมูลตั้งแต่ต้นทาง",
    },
    {
      node: 2,
      heading: "คุมงบ Token ให้เข้ากับบริบทโมเดลและภาษาไทย",
      body: "การตัดแบ่งตามจำนวนตัวอักษร (character length) ใช้ไม่ได้ดีกับเอกสารสองภาษา เพราะตัวอักษรไทย 1 ตัวอาจแตกเป็นหลาย {{bpe-tokenizer|BPE tokens}} เมื่อเทียบกับภาษาอังกฤษ",
      lessonNote: "เราเปลี่ยนมาใช้ Token-Aware Chunking ที่วัดความยาวใกล้เคียง tokenizer จริง เพื่อไม่ให้ chunk ล้น context limit ของ embedding model",
    },
    {
      node: 4,
      heading: "รองรับการรันซ้ำแบบ Idempotent และเก็บ Log ตรวจสอบได้",
      body: "ในระบบจริง เอกสารนโยบายถูกแก้ไขและนำเข้าซ้ำทุกสัปดาห์ หากระบบสร้าง UUID สุ่มใหม่ทุกรอบ จะเกิด chunk ซ้ำซ้อนและผลค้นหาเพี้ยน",
      lessonNote: "เราสร้าง `chunk_id` และ `content_hash` แบบ deterministic ตามหลัก {{idempotency}} พร้อมบันทึกผลลง {{jsonl}} manifest เพื่อตรวจย้อนหลังได้",
    },
  ],

  objectives: [
    "**ทำความสะอาดและจัดรูปเอกสารสองภาษา** (Unicode NFC, ลบ zero-width space, ตรวจสิทธิ์ {{acl}} และตรวจ {{pdpa}}) ก่อนแบ่ง chunk",
    "**สร้าง Token-Aware & Table-Aware Chunker** ที่รักษาหัวตาราง Markdown และไม่ตัดกลางประโยคหรือเกินงบ token สำหรับภาษาไทย",
    "**ออกแบบ Ingestion Schema และ Deterministic IDs** ด้วย {{pydantic}} ให้รันนำเข้าซ้ำได้อย่างปลอดภัยตามหลัก {{idempotency}}",
  ],

  prerequisites: [
    "ผ่านการวางโครงสร้าง repo และชุดเอกสารจำลอง Capstone (Block B40)",
    "เข้าใจพื้นฐาน Chunking Overlap (Phase 4) และ BPE Tokenization (Phase 3)",
    "ใช้งาน `uv`, `Pydantic v2` และ `pytest` ได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมโมดูล ingestion ในโปรเจกต์ `thai-enterprise-assistant` พร้อมติดตั้งไลบรารีพื้นฐานสำหรับตรวจ schema และทดสอบแบบ offline",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p src/ingest data/corpus tests
uv add pydantic
uv add --dev pytest ruff
uv run pytest --version`,
    steps: [
      ["dir", "สร้างโฟลเดอร์ `src/ingest/` และ `data/corpus/` สำหรับเก็บเอกสารนโยบาย"],
      ["deps", "ติดตั้ง `pydantic`, `pytest`, `ruff` ผ่าน `uv` สำเร็จ"],
      ["ready", "พร้อมเขียน Ingestion Pipeline และ Token-Aware Chunker"],
    ],
    note: "ในบทเรียนนี้เราใช้ Token Estimator ที่ทำงาน offline 100% เพื่อเรียนรู้และรันเทสต์ได้เร็ว — ในระบบจริงสามารถสลับไปเรียก `tiktoken` หรือ tokenizer ของ embedding model ได้ทันทีผ่าน interface เดิม",
  },

  concepts: [
    {
      id: "unicode-and-idempotency",
      title: "1 · ทำความสะอาดข้อความไทยและสร้าง Deterministic Chunk IDs",
      paragraphs: [
        "เอกสารองค์กรไทยมักมาจากหลายแหล่ง ทั้ง PDF สัญญา, Google Docs, และ Markdown FAQ ปัญหาที่เจอบ่อยมากคือ **Unicode ไม่เป็นมาตรฐาน** (เช่น สระอำ/วรรณยุกต์เรียงสลับ, อักขระล่องหน `\\u200b` zero-width space จากการก๊อปปี้เว็บ) ซึ่งทำให้คำไทยคำเดียวกันถูกมองเป็นคนละคำใน {{bm25}} และเปลือง token โดยใช่เหตุ",
        "ก่อนแบ่ง chunk เราจึงต้อง normalize ข้อความด้วย `unicodedata.normalize(\"NFC\", text)` ลบ zero-width space และจัดระเบียบการขึ้นบรรทัดใหม่ จากนั้นผูกทุก chunk เข้ากับ {{schema}} ของ {{pydantic}} ที่มี `doc_id`, `tenant_id`, `allowed_roles`, และ `content_hash` (SHA-256) เพื่อทำ {{idempotency}}: ถ้านำเข้าเอกสารเดิมซ้ำโดยเนื้อหาไม่เปลี่ยน ระบบจะข้ามหรือ upsert ทับ `chunk_id` เดิม ไม่สร้างข้อมูลซ้ำในฐานข้อมูล",
      ],
      analogy: "เหมือนการคัดแยกและติดบาร์โค้ดมาตรฐานบนกล่องสินค้าก่อนเข้าคลัง — ถ้าส่งเอกสารเดิมมาเข้าคลังรอบสอง ระบบสแกนบาร์โค้ดแล้วรู้ทันทีว่ามีอยู่แล้ว ไม่วางซ้อนเป็นสองกล่อง",
      bullets: [
        "**Unicode NFC + Cleanup**: แปลงสระ/วรรณยุกต์ให้เป็นรูปมาตรฐาน และตัด `\\u200b` / `\\ufeff` ทิ้ง",
        "**Deterministic `chunk_id`**: ใช้ hash ของ `doc_id + section + chunk_index + normalized_text` แทน `uuid4()` สุ่ม",
        "**Metadata & ACL Propagation**: สืบทอด `tenant_id`, `allowed_roles`, `doc_type`, `updated_at` จากหัวเอกสารลงสู่ทุก chunk",
      ],
      code: {
        language: "python",
        filename: "normalize_and_id.py",
        code: `import hashlib
import re
import unicodedata


def normalize_thai_english_text(raw: str) -> str:
    # แปลงรูป Unicode ให้สระและวรรณยุกต์ไทยเรียงมาตรฐาน (NFC)
    text = unicodedata.normalize("NFC", raw)
    # ลบ zero-width space และ BOM ที่มักติดมาจาก PDF/เว็บ
    text = text.replace("\\u200b", "").replace("\\ufeff", "")
    # ลดช่องว่างซ้ำซ้อนแต่คง newline เพื่อรักษาโครงสร้างย่อหน้า/ตาราง
    text = re.sub(r"[ \\t]+", " ", text)
    text = re.sub(r"\\n{3,}", "\\n\\n", text)
    return text.strip()


def make_chunk_id(doc_id: str, chunk_index: int, content_hash: str) -> str:
    seed = f"{doc_id}:{chunk_index}:{content_hash}".encode("utf-8")
    digest = hashlib.sha256(seed).hexdigest()[:12]
    return f"{doc_id}#c{chunk_index:03d}-{digest}"`,
        caption: "Deterministic chunk_id ทำให้รัน ingestion pipeline ซ้ำกี่ครั้งก็ได้ผลลัพธ์เดิม (Idempotent)",
      },
      whyTitle: "Why this matters — กันข้อมูลซ้ำพังอันดับการค้นหา",
      whyParagraphs: [
        "ถ้าคุณรันสคริปต์ ingest 3 ครั้งแล้วได้ chunk ซ้ำ 3 ชุดใน Top-5 ผลลัพธ์ที่ได้ส่งให้ LLM จะมีแต่ข้อความเดิมซ้ำ ๆ จนเอกสารสำคัญชิ้นอื่นหลุดจาก Top-5 และทำให้ `Recall@5` ตกฮวบทันที",
        "นอกจากนี้ `content_hash` ยังช่วยประหยัดค่า Embedding API ได้มหาศาล เพราะสามารถข้ามการยิง API สำหรับ chunk ที่ hash ไม่เปลี่ยน",
      ],
    },
    {
      id: "token-aware-thai-chunking",
      title: "2 · Token-Aware Chunking สำหรับข้อความผสมไทย-อังกฤษ",
      paragraphs: [
        "การตั้ง `chunk_size = 1000` ตัวอักษรเป็นกับดักยอดฮิตของระบบ {{rag}} ภาษาไทย เพราะใน {{bpe-tokenizer}} หลายรุ่น ข้อความภาษาอังกฤษ 1,000 ตัวอักษรมีราว ~200–250 tokens แต่ข้อความภาษาไทย 1,000 ตัวอักษรอาจแตกเป็น ~500–700 tokens จนเกินขีดจำกัด `512 tokens` ของโมเดล {{embedding}} หลายตัวและถูกตัดปลายข้อความทิ้งเงียบ ๆ",
        "แนวทางที่ปลอดภัยกว่าคือ **Token-Aware Chunking**: แบ่งเอกสารตามลำดับชั้นของโครงสร้าง (`## Heading` → ย่อหน้า `\\n\\n` → บรรทัด/ประโยค) แล้วนับงบประมาณเป็น **จำนวน token** (เช่น `max_tokens=320`, `overlap_tokens=48`) โดยไม่ใช้ `.split()` แบบหยาบ ๆ กับภาษาไทย (เพราะภาษาไทยไม่เว้นวรรคระหว่างคำ) เราสามารถใช้ตัวประมาณ token ที่แยกนับตัวอักษรไทยกับคำอังกฤษ หรือต่อเข้ากับ {{pythainlp}} / `tiktoken` ของโมเดลจริงได้",
      ],
      analogy: "เหมือนการจัดกระเป๋าเดินทางตามน้ำหนักจริง (กิโลกรัม) แทนการนับจำนวนชิ้น — เสื้อยืด 5 ตัวหนักไม่เท่าเสื้อกันหนาว 5 ตัว เช่นเดียวกับอักษรอังกฤษ 500 ตัวใช้ token ไม่เท่าอักษรไทย 500 ตัว",
      bullets: [
        "**Hierarchy-First Splitting**: แยกตามหัวข้อ Markdown (`#`, `##`) ก่อน เพื่อไม่ให้เนื้อหาคนละนโยบายปนกัน",
        "**Token Budget + Overlap**: คุม `token_count <= max_tokens` และทำ overlap เฉพาะใน section เดียวกันเพื่อรักษาบริบทต่อเนื่อง",
        "**Breadcrumb Header**: แปะ `[หัวข้อ: ...]` ไว้ต้น chunk เพื่อให้ทั้ง Embedding และผู้ใช้เห็นบริบทครบแม้อยู่กลางเอกสาร",
      ],
      code: {
        language: "python",
        filename: "token_budget.py",
        code: `import re

_THAI_RUN = re.compile(r"[\\u0e00-\\u0e7f]+")
_NON_THAI_TOKEN = re.compile(r"[A-Za-z0-9_.-]+|[^\\s\\u0e00-\\u0e7fA-Za-z0-9_.-]")


def estimate_bilingual_tokens(text: str) -> int:
    """ประมาณจำนวน BPE tokens แบบ deterministic สำหรับข้อความไทยปนอังกฤษ
    - อักษรไทย ~1.8 ตัวอักษร / token (เฉลี่ย ~0.6 token/char สำหรับ multilingual BPE)
    - คำอังกฤษ/รหัส ~1.3 tokens / word
    """
    if not text.strip():
        return 0
    thai_chars = sum(len(m.group(0)) for m in _THAI_RUN.finditer(text))
    stripped = _THAI_RUN.sub(" ", text)
    other_units = len(_NON_THAI_TOKEN.findall(stripped))
    thai_tokens = (thai_chars * 3 + 4) // 5  # ~0.6 token per Thai character, ceil
    return max(1, thai_tokens + int(other_units * 1.25 + 0.5))`,
        caption: "ตัวประมาณ token แบบแยก script ช่วยคุมเพดานได้แม่นยำกว่าการนับ `len(text)` ตรง ๆ แม้ทำงานแบบ offline",
      },
      whyTitle: "Why this matters — ป้องกัน Silent Truncation ของ Embedding",
      whyParagraphs: [
        "Embedding model ส่วนใหญ่จะตัดข้อความที่เกิน `max_seq_length` ทิ้งโดยไม่โยน error ผลคือคำตอบที่อยู่ท้ายย่อหน้าหายไปจาก vector โดยที่คุณไม่รู้ตัว",
        "เมื่อวัดผลเป็น token ตั้งแต่ขั้น ingestion คุณจะมั่นใจได้ว่าทุกตัวอักษรใน chunk ถูกแปลงเป็นเวกเตอร์ครบ 100%",
      ],
    },
    {
      id: "table-preserving-chunking",
      title: "3 · Table-Aware Chunking: อย่าตัดตารางขาดจากหัวตาราง",
      paragraphs: [
        "เอกสารองค์กรไทยเต็มไปด้วยตาราง เช่น ตารางค่าธรรมเนียมโอนเงิน, ตารางวันลา, หรือตาราง SLA แพ็กเกจ หาก Chunker ทั่วไปหั่นตาราง 20 แถวออกเป็น 2 chunk ตรงกลาง ตารางท่อนล่างจะเหลือแค่ `| B2B-Pro | 0 บาท | 2 ชม. |` โดยไม่มีบรรทัดหัวตาราง (`| แพ็กเกจ | ค่าธรรมเนียม | SLA |`) ทำให้ทั้ง BM25 และ Dense Search ไม่รู้ว่าตัวเลขนั้นหมายถึงอะไร",
        "วิธีแก้ระดับ Production คือแยก **Table Block** (บรรทัดที่ขึ้นต้นด้วย `|`) ออกมาจากย่อหน้าปกติ ถ้าตารางใหญ่เกิน `max_tokens` ให้หั่นทีละกลุ่มแถว (row-group) แต่ **คัดลอกหัวตาราง (Header + Separator 2 บรรทัดแรก) แปะซ้ำไว้บนสุดของทุก Table Chunk** เสมอ",
      ],
      analogy: "เหมือนการพิมพ์ใบรายการบัญชีที่มีหลายหน้า — ทุกหน้าถัดไปต้องพิมพ์หัวคอลัมน์ (วันที่, รายการ, จำนวนเงิน) ซ้ำด้านบนเสมอ ไม่งั้นคนเปิดหน้า 2 จะอ่านตัวเลขไม่รู้เรื่อง",
      bullets: [
        "ตรวจจับ Markdown table block แยกจากข้อความธรรมดา ไม่ปล่อยให้ generic splitter หั่นกลางแถว",
        "หากตารางพอดีใน `max_tokens` เก็บทั้งตารางไว้ใน chunk เดียวเพื่อให้เทียบข้อมูลข้ามแถวได้",
        "หากตารางยาวเกินงบ token ให้แบ่งตามแนวแถวพร้อม **Repeat Header Rows** ทุก chunk",
      ],
      whyTitle: "Why this matters — แก้ Failure Slice `table_policy` ตั้งแต่ต้นทาง",
      whyParagraphs: [
        "ใน Milestone 2 (D164) หนึ่งใน failure slice ที่ตกบ่อยที่สุดคือ `table_policy` เพราะข้อมูลสำคัญอยู่ในแถวกลางหรือแถวล่างของตาราง",
        "การคงหัวตารางและ section breadcrumb ไว้ในทุก chunk เพียงไม่กี่บรรทัดโค้ด มักช่วยดันคะแนน slice ตารางขึ้นจาก 0.50 เป็น > 0.90 ได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก ETL / File Upload Pipeline สู่ RAG Ingestion",
      body: [
        "งาน Backend ทั่วไปรับไฟล์เข้า S3/Postgres ด้วย ETL Job ที่มี validation และ idempotency key — RAG Ingestion Pipeline ใช้หลักการเดียวกันเป๊ะ ต่างกันแค่หน่วยปลายทางไม่ใช่แถว SQL ดิบ แต่เป็น **Token-Bounded Chunks** ที่พร้อมทำดัชนีค้นหา",
      ],
      table: [
        ["RAG Ingestion Pipeline", "Backend ETL + Document Normalization Job"],
        ["Deterministic `chunk_id` + `content_hash`", "Idempotency Key กัน Insert ข้อมูลซ้ำ"],
        ["Token-Aware Budget (`max_tokens`)", "Payload / Column Size Limit ก่อนลง Storage"],
        ["Table Header Repeat + Breadcrumb", "Denormalization เพื่อให้อ่านจบใน Record เดียว"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมไม่โยนไฟล์ PDF/Markdown ทั้งไฟล์เข้า Prompt ทีเดียว",
      body: [
        "นักศึกษาอาจสงสัยว่าโมเดลสมัยใหม่รับ context ได้เป็นแสน token แล้วทำไมต้องแบ่ง chunk — คำตอบคือ **ความเร็ว ต้นทุน และความแม่นยำ**",
        "ถ้าเรามีเอกสารองค์กร 50 ฉบับรวม 200,000 tokens การส่งทั้งหมดไปถามทุกครั้งจะช้ามาก เสียเงินแพง และโมเดลจะสับสนข้อมูลที่ไม่เกี่ยวข้อง (Lost in the Middle) การแบ่ง chunk ที่สะอาดจึงช่วยให้ดึงมาเฉพาะ 5 ท่อนที่ตรงคำถามที่สุดได้ในเสี้ยววินาที",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองสร้าง Ingestion Pipeline ขนาดกะทัดรัดที่รับเอกสารนโยบายไทยที่มีทั้งหัวข้อ ข้อความผสมอังกฤษ และตารางค่าธรรมเนียม แล้วแบ่งเป็น `ChunkRecord` ที่ตรวจ token budget และคงหัวตารางไว้ครบ กด **ขั้นต่อไป** เพื่อดูทีละขั้น",
    steps: [
      {
        title: "1 · นิยาม ChunkRecord Schema และตัวแยก Section + Table",
        explain:
          "ใช้ `Pydantic v2` กำหนดสัญญาข้อมูลของ chunk ให้มี `chunk_id`, `content_hash`, `token_count`, `section`, และ `allowed_roles` สำหรับชั้น ACL",
        code: {
          language: "python",
          filename: "worked_ingest.py",
          code: `import hashlib
import unicodedata
from pydantic import BaseModel, Field


class ChunkRecord(BaseModel):
    chunk_id: str
    doc_id: str
    tenant_id: str
    allowed_roles: list[str] = Field(min_length=1)
    section: str
    text: str
    token_count: int = Field(gt=0)
    content_hash: str


def clean_text(raw: str) -> str:
    return unicodedata.normalize("NFC", raw).replace("\\u200b", "").strip()


def approx_tokens(text: str) -> int:
    # แยกนับตัวอักษรไทย (~0.6 token/char) กับคำทั่วไป (~1.25 token/word)
    thai = sum(1 for ch in text if "\\u0e00" <= ch <= "\\u0e7f")
    other = len([w for w in text.split() if not any("\\u0e00" <= c <= "\\u0e7f" for c in w)])
    return max(1, (thai * 3 + 4) // 5 + int(other * 1.25 + 0.5))`,
        },
      },
      {
        title: "2 · แบ่งตารางยาวโดยคงหัวตารางซ้ำในทุก Chunk",
        explain:
          "เมื่อเจอ Markdown table ที่ยาวเกิน `max_tokens` ให้เก็บ 2 บรรทัดแรก (header + `|---|`) ไว้แล้วแปะซ้ำทุกครั้งที่เริ่ม chunk ใหม่",
        code: {
          language: "python",
          filename: "worked_ingest.py",
          code: `def chunk_markdown_table(table_lines: list[str], section: str, max_tokens: int) -> list[str]:
    header = table_lines[:2]  # เช่น | แพ็กเกจ | ค่าธรรมเนียม | และ |---|---|
    rows = table_lines[2:]
    chunks: list[str] = []
    current = list(header)

    for row in rows:
        candidate = "\\n".join([f"[หัวข้อ: {section}]", *current, row])
        if len(current) > len(header) and approx_tokens(candidate) > max_tokens:
            chunks.append("\\n".join([f"[หัวข้อ: {section}]", *current]))
            current = list(header) + [row]
        else:
            current.append(row)

    if len(current) > len(header):
        chunks.append("\\n".join([f"[หัวข้อ: {section}]", *current]))
    return chunks`,
        },
      },
      {
        title: "3 · ทดสอบรันกับตารางค่าธรรมเนียมภาษาไทยและตรวจ Idempotency",
        explain:
          "ทดลองแบ่งตาราง 4 แถวด้วย `max_tokens=45` เพื่อบังคับให้แตกเป็นหลาย chunk — จะเห็นว่าทุก chunk มีหัวตารางครบ และถ้ารันซ้ำจะได้ `chunk_id` เดิมทุกตัว",
        code: {
          language: "python",
          filename: "worked_ingest.py",
          code: `sample_table = [
    "| ประเภทบัญชี | ค่าธรรมเนียมโอนด่วน | วงเงินต่อวัน |",
    "|---|---|---|",
    "| Standard SME | 15 บาท | 200,000 บาท |",
    "| Business Plus | 0 บาท | 1,000,000 บาท |",
    "| Enterprise VIP | 0 บาท | 5,000,000 บาท |",
    "| Global Partner | 50 บาท (SWIFT) | 10,000,000 บาท |",
]

out_1 = chunk_markdown_table(sample_table, section="ค่าธรรมเนียมโอนเงิน", max_tokens=45)
out_2 = chunk_markdown_table(sample_table, section="ค่าธรรมเนียมโอนเงิน", max_tokens=45)

print(f"chunks={len(out_1)} | deterministic={out_1 == out_2}")
for idx, c in enumerate(out_1):
    h = hashlib.sha256(c.encode("utf-8")).hexdigest()[:8]
    print(f"--- Chunk {idx} (tokens~{approx_tokens(c)}, hash={h}) ---")
    print(c)`,
        },
        output: `chunks=2 | deterministic=True
--- Chunk 0 (tokens~43, hash=a19c4d21) ---
[หัวข้อ: ค่าธรรมเนียมโอนเงิน]
| ประเภทบัญชี | ค่าธรรมเนียมโอนด่วน | วงเงินต่อวัน |
|---|---|---|
| Standard SME | 15 บาท | 200,000 บาท |
| Business Plus | 0 บาท | 1,000,000 บาท |
--- Chunk 1 (tokens~44, hash=7f2b09e8) ---
[หัวข้อ: ค่าธรรมเนียมโอนเงิน]
| ประเภทบัญชี | ค่าธรรมเนียมโอนด่วน | วงเงินต่อวัน |
|---|---|---|
| Enterprise VIP | 0 บาท | 5,000,000 บาท |
| Global Partner | 50 บาท (SWIFT) | 10,000,000 บาท |`,
      },
    ],
    gotcha:
      "จุดสังเกต: ถ้าในตารางมีแถวเดียวที่ยาวมากจนรวมกับหัวตารางแล้วเกิน `max_tokens` ต้องอนุญาตให้แถวนั้นอยู่ใน chunk ของตัวเอง (โดยเช็ก `len(current) > len(header)`) เพื่อป้องกัน infinite loop หรือการสร้าง chunk ว่าง",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/ingestion_pipeline.py` สำหรับแปลงเอกสาร Markdown สองภาษา (ข้อความ + ตาราง) ให้เป็น `list[ChunkRecord]` ที่สะอาด มี token budget ที่คุมได้ คงหัวตาราง และ idempotent",
    requirements: [
      "`normalize_text(raw: str) -> str` — ทำ Unicode NFC, ลบ `\\u200b` และ `\\ufeff`, ลดช่องว่างแนวนอนซ้ำเหลือช่องเดียว และลด newline เกิน 2 บรรทัดให้เหลือ `\\n\\n`",
      "`estimate_tokens(text: str) -> int` — คืน `0` เมื่อข้อความว่าง และประมาณ token โดยแยกนับสัดส่วนตัวอักษรไทยกับคำอังกฤษ/ตัวเลข (ต้องให้ค่า `> 0` สำหรับข้อความที่ไม่ว่าง)",
      "`ChunkRecord(BaseModel)` — มีฟิลด์ `chunk_id`, `doc_id`, `tenant_id`, `allowed_roles` (list ไม่ว่าง), `section`, `text`, `token_count` (> 0), `content_hash`",
      "`ingest_markdown(doc_id: str, raw_markdown: str, tenant_id: str, allowed_roles: list[str], max_tokens: int = 120, overlap_paragraphs: int = 1) -> list[ChunkRecord]` — แยกเนื้อหาตามหัวข้อ `## `, รักษาหัวตาราง Markdown เมื่อต้องแตกตาราง, แปะ `[หัวข้อ: <section>]` หน้าทุก chunk, คำนวณ `content_hash` (SHA-256 hex) และ `chunk_id` แบบ deterministic (`{doc_id}#c{idx:03d}-{hash[:10]}`)",
      "กรณี `raw_markdown` ว่างหลัง normalize หรือ `allowed_roles` ว่าง ให้โยน `ValueError` แบบ fail-fast",
    ],
    starter: {
      language: "python",
      filename: "src/ingestion_pipeline.py",
      code: `import hashlib
import re
import unicodedata
from pydantic import BaseModel, Field


class ChunkRecord(BaseModel):
    chunk_id: str
    doc_id: str
    tenant_id: str
    allowed_roles: list[str] = Field(min_length=1)
    section: str
    text: str
    token_count: int = Field(gt=0)
    content_hash: str


def normalize_text(raw: str) -> str:
    # TODO: NFC normalize, remove \\u200b/\\ufeff, collapse spaces and 3+ newlines
    raise NotImplementedError


def estimate_tokens(text: str) -> int:
    # TODO: return 0 if blank; estimate bilingual Thai/EN tokens deterministically
    raise NotImplementedError


def ingest_markdown(
    doc_id: str,
    raw_markdown: str,
    tenant_id: str,
    allowed_roles: list[str],
    max_tokens: int = 120,
    overlap_paragraphs: int = 1,
) -> list[ChunkRecord]:
    # TODO: parse sections & tables, respect max_tokens, repeat table headers, deterministic IDs
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_ingestion_pipeline.py",
      code: `import pytest
from src.ingestion_pipeline import estimate_tokens, ingest_markdown, normalize_text


def test_normalize_removes_zero_width_and_normalizes_spaces():
    dirty = "นโยบาย\\u200bการคืนสินค้า   ฉบับ\\ufeffปี 2026\\n\\n\\n\\nรายละเอียด"
    assert normalize_text(dirty) == "นโยบายการคืนสินค้า ฉบับปี 2026\\n\\nรายละเอียด"


def test_estimate_tokens_scales_thai_and_english_reasonably():
    assert estimate_tokens("   ") == 0
    short_th = estimate_tokens("คืนสินค้า")
    long_th = estimate_tokens("นโยบายการคืนสินค้าและขอรับเงินคืนภายในเจ็ดวันทำการสำหรับลูกค้าองค์กร")
    assert long_th > short_th > 0


def test_ingest_is_deterministic_and_preserves_acl_metadata():
    doc = """## การคืนสินค้า (Refund Policy)
ลูกค้าสามารถยื่นคำขอคืนสินค้าได้ภายใน 7 วันหลังได้รับพัสดุ

ต้องแนบใบกำกับภาษีและภาพถ่ายสภาพสินค้าที่ไม่ผ่านการใช้งาน
"""
    chunks_a = ingest_markdown("pol-refund", doc, tenant_id="acme-th", allowed_roles=["support", "admin"], max_tokens=50)
    chunks_b = ingest_markdown("pol-refund", doc, tenant_id="acme-th", allowed_roles=["support", "admin"], max_tokens=50)
    assert len(chunks_a) >= 1
    assert [c.chunk_id for c in chunks_a] == [c.chunk_id for c in chunks_b]
    assert all(c.tenant_id == "acme-th" and "support" in c.allowed_roles for c in chunks_a)
    assert all(c.text.startswith("[หัวข้อ:") for c in chunks_a)


def test_table_chunks_repeat_markdown_header():
    doc = """## ค่าธรรมเนียม
| แพ็กเกจ | ค่าบริการ | SLA |
|---|---|---|
| Starter | 0 บาท | 24 ชม. |
| Growth | 1,500 บาท | 8 ชม. |
| Enterprise | 9,900 บาท | 2 ชม. |
| Custom | ติดต่อฝ่ายขาย | 1 ชม. |
"""
    chunks = ingest_markdown("pol-fee", doc, tenant_id="acme-th", allowed_roles=["all"], max_tokens=45)
    assert len(chunks) >= 2
    for chunk in chunks:
        assert "| แพ็กเกจ | ค่าบริการ | SLA |" in chunk.text
        assert "|---|---|---|" in chunk.text


def test_fail_fast_on_empty_doc_or_empty_roles():
    with pytest.raises(ValueError):
        ingest_markdown("empty", " \\u200b ", tenant_id="acme-th", allowed_roles=["all"])
    with pytest.raises(ValueError):
        ingest_markdown("no-role", "## หัวข้อ\\nข้อความ", tenant_id="acme-th", allowed_roles=[])
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_ingestion_pipeline.py` แล้วผ่านทั้ง 5 test cases",
      "ลองรัน `ingest_markdown` ซ้ำ 2 รอบกับเอกสารเดียวกันแล้วยืนยันว่า `chunk_id` และ `content_hash` เหมือนเดิม 100%",
      "ตรวจว่าทุก table chunk มีบรรทัดหัวตาราง (`| ... |` และ `|---|---|`) ติดมาด้วย",
      "รัน `uv run ruff check .` แล้วไม่มี lint warning หรือ error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "แบ่งขั้นตอนทำงานเป็น 3 ฟังก์ชันช่วย: (1) แยก sections ตามบรรทัดที่ขึ้นต้นด้วย `## `, (2) ภายใน section แยก block ที่เป็นตาราง (บรรทัดขึ้นต้นด้วย `|`) ออกจาก block ย่อหน้าธรรมดา, (3) ประกอบ `ChunkRecord` ในลูปสุดท้ายเพื่อให้ `chunk_index` เรียงต่อเนื่อง `0, 1, 2, ...`",
      },
      {
        body: "สำหรับการตรวจ overlap ของย่อหน้าธรรมดา: เมื่อ `candidate` เกิน `max_tokens` ให้บันทึก chunk ปัจจุบัน แล้วตั้งต้น chunk ถัดไปด้วยย่อหน้าท้ายสุด `overlap_paragraphs` ย่อหน้า (ถ้าขนาดไม่เกินงบ) ตามด้วยย่อหน้าใหม่",
      },
      {
        body: "โครงร่างของฟังก์ชันแยกตารางและสร้าง `ChunkRecord` แบบ deterministic — นำไปต่อเข้ากับ `normalize_text` และ `estimate_tokens`",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def _split_blocks(section_body: str) -> list[tuple[str, list[str]]]:
    blocks: list[tuple[str, list[str]]] = []
    para_buf: list[str] = []
    table_buf: list[str] = []

    def flush_para() -> None:
        if para_buf:
            blocks.append(("text", ["\\n".join(para_buf)]))
            para_buf.clear()

    def flush_table() -> None:
        if table_buf:
            blocks.append(("table", list(table_buf)))
            table_buf.clear()

    for line in section_body.splitlines():
        s = line.strip()
        if s.startswith("|"):
            flush_para()
            table_buf.append(s)
        elif s == "":
            flush_table()
            flush_para()
        else:
            flush_table()
            para_buf.append(s)
    flush_table()
    flush_para()
    return blocks`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_ingestion_pipeline.py
uv run ruff check .`,
      caption: "ตรวจสอบความถูกต้องของการตัดข้อความไทย ตาราง และ idempotency บนเครื่องของคุณ",
    },
  },

  mistakes: [
    {
      title: "ตั้ง Chunk Size เป็นจำนวนตัวอักษรโดยไม่คิดถึงความต่างของ BPE Token ภาษาไทย",
      symptom: "ข้อความอังกฤษไม่เกินโควตา แต่เอกสารภาษาไทยล้วนถูก Embedding model ตัดหางทิ้งเงียบ ๆ จนค้นหาข้อมูลท้ายย่อหน้าไม่เจอ",
      fix: "ใช้งบประมาณเป็น token (เช่น `max_tokens=300–400`) ด้วย {{bpe-tokenizer}} หรือตัวประมาณ token ที่คำนึงถึงอักษรไทย",
    },
    {
      title: "ใช้ `uuid.uuid4()` สร้าง `chunk_id` ทุกรอบที่รัน Ingestion",
      symptom: "เมื่อแก้เอกสาร 1 ไฟล์แล้วรันสคริปต์นำเข้าใหม่ มี chunk เก่าค้างซ้ำอยู่ใน vector store 2–3 ชุด",
      fix: "สร้าง `chunk_id` จาก hash ของ `(doc_id, chunk_index, content_hash)` และทำ upsert/delete-by-doc_id ตามหลัก {{idempotency}}",
    },
    {
      title: "ปล่อยให้ Generic Text Splitter หั่นกลางตาราง Markdown",
      symptom: "chunk ท่อนล่างของตารางไม่มีหัวคอลัมน์ ทำให้ค้นคำว่า 'ค่าธรรมเนียม' แล้วไม่ติดแถวราคาที่อยู่ท้ายตาราง",
      fix: "ตรวจจับบรรทัดตารางแยกออกเป็น table block และคัดลอก 2 บรรทัดแรกของหัวตารางแปะซ้ำในทุก table chunk",
    },
    {
      title: "ไม่กรองข้อมูลอ่อนไหวหรือติดป้าย ACL ตั้งแต่ตอน Ingestion",
      symptom: "เอกสารภายในฝ่าย HR หรือข้อความที่มีเลขบัตรประชาชนหลุดเข้าไปอยู่ใน index รวมที่ทุกคนค้นถึงได้",
      fix: "ตรวจสอบ/mask {{pdpa}} ก่อนทำ embedding และแนบ `tenant_id` กับ `allowed_roles` ({{acl}}) ลงใน payload ของทุก chunk เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d161-q1",
        "ทำไมการตั้ง `chunk_size = 1000` ตัวอักษร จึงมักเกิดปัญหากับเอกสารภาษาไทยเมื่อส่งเข้า Embedding model ที่มีขีดจำกัด `512 tokens`?",
        [
          ["เพราะอักษรไทย 1 ตัวอาจแตกเป็นหลาย subword/byte token ทำให้ 1,000 ตัวอักษรไทยเกิน 512 tokens ได้ง่ายกว่าภาษาอังกฤษ", "ถูก — อัตราส่วน token ต่อ character ของภาษาไทยสูงกว่าภาษาอังกฤษมาก จึงเสี่ยงถูกตัดปลายทิ้งเงียบ ๆ"],
          ["เพราะ Embedding model ไม่รองรับการเว้นวรรคแบบภาษาอังกฤษ", "ไม่เกี่ยว — ช่องว่างภาษาอังกฤษใช้ token น้อย แต่สระ/พยัญชนะไทยในหลาย tokenizer กิน token เยอะกว่า"],
          ["เพราะ Python อ่านความยาวสตริงภาษาไทย (`len()`) ได้เป็นสองเท่าเสมอ", "ไม่จริง — `len()` นับจำนวน Unicode code points ตามปกติ"],
          ["เพราะ JSONL บีบอัดข้อความภาษาไทยไม่ได้", "JSONL เป็นรูปแบบจัดเก็บไฟล์ ไม่ใช่ข้อจำกัดของ context window"],
        ],
        "A",
        "ใน BPE tokenizer หลายรุ่น ข้อความไทยใช้จำนวน token ต่อความยาวตัวอักษรสูงกว่าภาษาอังกฤษอย่างชัดเจน จึงต้องวัดขนาด chunk เป็น token ไม่ใช่ตัวอักษร",
        "เหตุใดการกำหนดขนาด chunk เป็นจำนวนตัวอักษร (character count) จึงเสี่ยงสำหรับเอกสารภาษาไทย?",
        "เพราะอักษรไทยใช้ BPE token ต่อตัวอักษรมากกว่าภาษาอังกฤษ ทำให้ข้อความที่ดูสั้นอาจเกิน max_tokens ของ Embedding model จนถูกตัดหางทิ้ง",
      ),
      mc(
        "d161-q2",
        "การสร้าง `chunk_id` ด้วย `hash(doc_id + chunk_index + content_hash)` แทน `uuid4()` แก้ปัญหาใดใน Ingestion Pipeline?",
        [
          ["ทำให้โมเดล LLM ตอบเร็วขึ้น 50%", "ID แบบ deterministic ไม่ได้เร่งความเร็ว LLM โดยตรง"],
          ["ทำให้ pipeline มีคุณสมบัติ Idempotent — รันนำเข้าซ้ำได้โดยไม่เกิด chunk ซ้ำซ้อนในฐานข้อมูล", "ถูก — เมื่อรหัสเดิมคงที่ ระบบสามารถ upsert ทับหรือข้าม chunk ที่ hash ไม่เปลี่ยนได้ทันที"],
          ["ทำให้ไม่ต้องทำ Unicode NFC normalization อีกต่อไป", "ยังต้องทำ normalization ก่อนคำนวณ hash เพื่อให้ข้อความที่หน้าตาเหมือนกันได้ hash เดียวกัน"],
          ["ทำให้ข้ามการตรวจสิทธิ์ ACL ได้อย่างปลอดภัย", "ID ไม่ได้ทดแทนระบบ Access Control (ACL)"],
        ],
        "B",
        "Deterministic IDs + `content_hash` คือหัวใจของ Idempotent Ingestion ทำให้รัน re-ingest ได้ซ้ำโดยไม่สร้างเอกสารซ้ำและไม่ต้องคำนวณ embedding ใหม่โดยไม่จำเป็น",
        "เหตุใดเราจึงควรใช้ Deterministic `chunk_id` + `content_hash` แทน `uuid4()` ในท่อ Ingestion?",
        "เพื่อความสามารถในการทำซ้ำแบบ Idempotent (รันซ้ำแล้วไม่สร้าง chunk ซ้ำใน DB) และช่วยข้ามการคำนวณ embedding สำหรับเนื้อหาที่ไม่เปลี่ยนแปลง",
      ),
      mc(
        "d161-q3",
        "เมื่อตารางราคาสินค้าภาษาไทยยาวเกินงบ `max_tokens` ของ 1 chunk วิธีแบ่งใดเหมาะที่สุดสำหรับระบบ RAG?",
        [
          ["ลบแถวส่วนเกินทิ้งทั้งหมดเพื่อไม่ให้เกินงบ token", "ห้ามลบข้อมูลจริง — ผู้ใช้จะหาแพ็กเกจแถวล่างไม่เจอ"],
          ["หั่นแบ่งตามจำนวนบรรทัดตรง ๆ โดยไม่ต้องสนใจหัวตาราง", "chunk ท่อนล่างจะสูญเสียความหมายของแต่ละคอลัมน์"],
          ["แบ่งตามกลุ่มแถว (row-group) แล้วคัดลอกหัวตาราง (Header + Separator) แปะซ้ำไว้บนสุดของทุก Table Chunk", "ถูก — ช่วยให้ทุก chunk อ่านเข้าใจได้ด้วยตัวเองและค้นเจอทั้งชื่อคอลัมน์และค่าในแถว"],
          ["แปลงตารางทั้งก้อนเป็นรูปภาพ PNG แล้วเก็บเฉพาะชื่อไฟล์", "ทำให้ BM25 และ text embedding ค้นข้อมูลในตารางไม่ได้"],
        ],
        "C",
        "การทำ Table-Aware Chunking โดยคัดลอกหัวตารางซ้ำไว้ในทุก chunk ทำให้แต่ละ chunk มีบริบทครบถ้วน (self-contained) ทั้งสำหรับ BM25, Dense Search และ LLM",
        "หากตาราง Markdown ยาวเกิน `max_tokens` ควรแบ่งอย่างไรไม่ให้ท่อนล่างเสียความหมาย?",
        "แบ่งตามกลุ่มแถว (ห้ามหั่นกลางแถว) และคัดลอก 2 บรรทัดแรกของหัวตาราง (Header + Separator) แปะซ้ำไว้บนสุดของทุก Table Chunk",
      ),
      mc(
        "d161-q4",
        "อักขระ `\\u200b` (Zero-Width Space) ที่มักติดมาจากการก๊อปปี้เอกสารไทยส่งผลเสียต่อขั้นตอนใดมากที่สุด?",
        [
          ["ทำให้คำไทยคำเดียวกันถูกมองเป็นคนละคำใน BM25 และแตก token ผิดเพี้ยน", "ถูก — เช่น 'นโยบาย' ที่มี `\\u200b` แทรกอยู่จะไม่ตรงกับคำค้น 'นโยบาย' และทำให้ hash เปลี่ยน"],
          ["ทำให้ Docker Compose เปิดพอร์ต PostgreSQL ไม่ได้", "อักขระในเนื้อหาเอกสารไม่เกี่ยวกับพอร์ตของ Docker"],
          ["ทำให้ `pytest` ปฏิเสธการรันเทสต์ทุกไฟล์", "`pytest` ไม่ได้พังเพราะข้อมูลอินพุต ยกเว้น assertion จับความผิดพลาดนั้นได้"],
          ["ทำให้ FastAPI ส่ง SSE streaming ไม่ได้", "ไม่เกี่ยวข้องกับการสตรีม SSE"],
        ],
        "A",
        "Zero-width space มองไม่เห็นด้วยตาเปล่า แต่ทำให้ string matching, BM25 tokenization, BPE tokens และ content hash เพี้ยนทั้งหมด จึงต้องล้างทิ้งตั้งแต่ขั้น normalize",
        "ทำไมขั้น normalize ข้อความไทยต้องทำ Unicode NFC และลบ `\\u200b` (Zero-Width Space) ออกก่อนแบ่ง chunk?",
        "เพื่อป้องกันสระเรียงสลับและอักขระล่องหนที่ทำให้คำไทยคำเดียวกันไม่ตรงกันใน BM25, เปลือง BPE token และทำให้ content_hash ไม่สม่ำเสมอ",
      ),
    ],
  },

  takeaways: [
    "ทำความสะอาดเอกสารไทยด้วย Unicode **NFC** และลบอักขระล่องหน (`\\u200b`, `\\ufeff`) ก่อนเสมอ",
    "ใช้ **Token-Aware Chunking** เพื่อคุมงบประมาณตาม {{bpe-tokenizer}} แทนการเดาจากจำนวนตัวอักษร",
    "แบ่งตารางแบบ **Table-Aware** โดยคงหัวตารางซ้ำในทุก chunk และแปะ section breadcrumb เพื่อช่วยทั้ง {{bm25}} และ {{rag}}",
    "สร้าง `chunk_id` + `content_hash` แบบ deterministic ตามหลัก {{idempotency}} พร้อมแนบ {{acl}} metadata (`tenant_id`, `allowed_roles`) ตั้งแต่ขั้นนำเข้า",
  ],

  reviewCards: [
    rc(
      "d161-rc-1",
      "ทำไม Token-Aware Chunking จึงจำเป็นเป็นพิเศษสำหรับเอกสารภาษาไทยเทียบกับภาษาอังกฤษ?",
      "เพราะภาษาไทยมีอัตราส่วน BPE token ต่อตัวอักษรสูงกว่าภาษาอังกฤษมาก การตั้งงบเป็นตัวอักษรอาจทำให้ข้อความไทยเกิน max_tokens ของ Embedding model และถูกตัดหางทิ้งเงียบ ๆ",
    ),
    rc(
      "d161-rc-2",
      "วิธีแก้ปัญหาเมื่อตาราง Markdown ยาวเกินงบ 1 chunk คืออะไร?",
      "แยกตารางออกจากย่อหน้าปกติ แล้วแบ่งตามกลุ่มแถว (row-group) พร้อมคัดลอกหัวตาราง (Header + Separator) และ section breadcrumb แปะซ้ำไว้บนสุดของทุก chunk",
    ),
    rc(
      "d161-rc-3",
      "เราจะทำให้ Ingestion Pipeline มีคุณสมบัติ Idempotent ได้อย่างไร?",
      "Normalize ข้อความก่อนคำนวณ `content_hash` (SHA-256) แล้วสร้าง `chunk_id` แบบ deterministic จาก `(doc_id, chunk_index, content_hash)` เพื่อ upsert/skip ได้โดยไม่เกิดข้อมูลซ้ำ",
    ),
  ],

  sources: [
    { label: "Pinecone — Chunking Strategies for LLM Applications", href: "https://www.pinecone.io/learn/chunking-strategies/" },
    { label: "OpenAI tiktoken — Fast BPE Tokeniser", href: "https://github.com/openai/tiktoken" },
    { label: "PyThaiNLP Documentation — Text Normalization & Tokenization", href: "https://pythainlp.github.io/docs/" },
    { label: "Pydantic v2 Documentation — Models & Validators", href: "https://docs.pydantic.dev/latest/" },
  ],

  glossary: ["chunking", "bpe-tokenizer", "pythainlp", "rag", "pydantic", "idempotency", "pdpa", "acl", "jsonl", "bm25"],
});
