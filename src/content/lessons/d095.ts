import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D095 — Phase 4 / Block B24
 * Chunking Strategies (Recursive, Token-aware, Structural + Overlap)
 */
export const d095: Lesson = defineLesson({
  day: 95,
  titleTh: "กลยุทธ์ Chunking ภาษาไทย: Structural, Token-Aware, Context Breadcrumb และ Overlap",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · เลิกหั่นด้วยจำนวนตัวอักษรแล้วเปลี่ยนมาแบ่งตามหัวข้อ ตาราง และงบ Token จริง",
  icon: "scissors",
  visual: {
    id: "chunking-overlap",
    title: "Fixed-Char Split (ตัดกลางตารางพัง) vs Structural Token-Aware + Overlap",
    caption: "กดสลับเทียบการหั่นตัวอักษรแบบหยาบกับการแบ่งตามหัวข้อ ตาราง และขนาด token พร้อม overlap ที่เหมาะกับภาษาไทย",
    alt: "แผนภาพเปรียบเทียบกลยุทธ์ Chunking แบบคงโครงสร้างและ token-aware",
  },
  requiresApiKey: false,
  tools: ["tiktoken / tokenizers", "Pydantic v2", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "เปลี่ยน Markdown สะอาดเป็นหน่วยความรู้ที่สมบูรณ์ในตัวเอง",
      body: "หลังจาก Day 94 แปลงเอกสารเป็น Markdown สะอาดแล้ว เราไม่สามารถยัดเอกสารยาว 30 หน้าเข้า {{embedding}} เป็นก้อนเดียวได้ เพราะเวกเตอร์จะเจือจางและเกินขีดจำกัดความยาวของโมเดล",
      lessonNote: "วันนี้เราออกแบบ {{chunking}} ที่หั่นตามโครงสร้างหัวข้อ/ตาราง และนับขนาดด้วย **token จริง** แทนจำนวนตัวอักษร",
    },
    {
      node: 2,
      heading: "เชื่อม BPE Token Inflation (D66) เข้ากับขีดจำกัดของ Embedding Model",
      body: "ภาษาไทยเกิด Token Inflation `1.5x–3x` ใน {{bpe-tokenizer}} ทำให้ก้อน 1,000 ตัวอักษรไทยอาจยาวเกินขีดจำกัด 512 tokens ของโมเดล Embedding จนส่วนท้ายถูกตัดทิ้งเงียบ ๆ",
      lessonNote: "Token-aware chunking รับประกันว่าทุก chunk อยู่ใต้งบ token ของทั้ง Embedding model และ {{context-engineering}} ใน prompt",
    },
    {
      node: 3,
      heading: "Breadcrumb Header + Overlap ทำให้ chunk ยืนด้วยตัวเองได้เมื่อถูกดึงแยกออกมา",
      body: "ตอนค้นคืน Retriever ดึง chunk ออกมาแค่ {{top-k}} ชิ้นแบบกระจัดกระจาย หากไม่มีหัวข้อพ่อกำกับ โมเดลจะไม่รู้ว่าข้อย่อย \"ภายใน 7 วัน\" เป็นของนโยบายไหน",
      lessonNote: "การแปะ `[นโยบายคืนเงิน > เงื่อนไข 7 วัน]` ไว้บนหัวทุก chunk และซ้อนทับ (overlap) 10–15% ช่วยเพิ่มทั้งความแม่นของการค้นหาและ {{groundedness}}",
    },
  ],

  objectives: [
    "**อธิบายเหตุผล** ที่การแบ่ง chunk ด้วยจำนวนตัวอักษรคงที่ (`char_size`) พลาดหนักบนภาษาไทยเนื่องจาก {{bpe-tokenizer}} inflation `1.5x–3x` (เชื่อมโยง Day 66)",
    "**เลือกและผสมผสานกลยุทธ์ {{chunking}}** ได้ตรงประเภทเนื้อหา: Recursive splitting, Heading-structural splitting, และ Table-atomic splitting (คงหัวตารางทุกชิ้น)",
    "**เขียน Structural Token-Aware Chunker** ใน Python ที่แนบ parent heading breadcrumb (`[H1 > H2]`), คงตาราง Markdown ไม่ให้แตก และใส่ token overlap `10–15%` ผ่านการตรวจด้วย {{pytest}}",
  ],

  prerequisites: [
    "เข้าใจว่าทำไมภาษาไทยกิน token มากกว่าภาษาอังกฤษ 1.5x–3x ใน {{bpe-tokenizer}} (Day 66)",
    "ผ่านการแปลงและล้างข้อความเป็น Canonical Markdown จาก Day 94",
    "ใช้งาน {{pydantic}} `BaseModel` และรัน `pytest` บนเครื่องได้",
    "ไม่ต้องใช้ API key — ตัวอย่างและแบบฝึกหัดรันแบบออฟไลน์ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day095` ด้วย `uv` พร้อม `pydantic`, `pytest` และ `ruff` (สามารถเพิ่ม `tiktoken` สำหรับนับ token จริงกับโมเดลตระกูล OpenAI หรือใช้ `token_counter` แบบ pluggable ที่ทำงานออฟไลน์ได้ 100%)",
    commands: `uv init ai-day095 && cd ai-day095
uv add pydantic
uv add --dev pytest ruff
# ตัวเลือกเสริมสำหรับนับ token จริงด้วย BPE (เมื่อมี cache/อินเทอร์เน็ต)
uv add tiktoken`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day095` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["ready", "รัน `uv run python --version` แล้วพร้อมเขียน Structural Chunker"],
    ],
    note: "เราออกแบบ Chunker ให้รับ `token_counter: Callable[[str], int]` เป็นพารามิเตอร์ เพื่อสลับใช้ได้ทั้ง `tiktoken`, `AutoTokenizer` (HuggingFace) และตัวนับจำลองใน unit tests ที่รันออฟไลน์ได้ 100%",
  },

  concepts: [
    {
      id: "why-token-aware-for-thai",
      title: "1 · ทำไม Fixed-Char Splitting ถึงพังกับภาษาไทย (เชื่อมโยง D66 BPE Inflation)",
      paragraphs: [
        "ในบทเรียนภาษาอังกฤษ มักแนะนำกฎง่าย ๆ ว่า *\"1 token ≈ 4 ตัวอักษร ดังนั้น `chunk_size = 1500` ตัวอักษร ≈ 375 tokens\"* แต่ใน Day 66 คุณพิสูจน์แล้วว่าภาษาไทยไม่เป็นไปตามกฎนี้เลย เพราะอักษรไทย 1 ตัวใช้ 3 bytes ใน UTF-8 และมี merge rules น้อยกว่าใน {{bpe-tokenizer}} ทำให้ภาษาไทยใช้จำนวน token สูงกว่าอังกฤษ **1.5x–3x** (ประมาณ 1–2 ตัวอักษรไทยต่อ 1 token ในหลาย tokenizer)",
        "ผลลัพธ์ที่อันตรายมากคือ: ถ้าคุณตั้ง `chunk_size = 1200` ตัวอักษรไทย แล้วส่งเข้า Embedding model ที่รองรับสูงสุด `512 tokens` ข้อความจริงอาจยาวถึง **700–900 tokens** — โมเดล Embedding ส่วนใหญ่จะ **ตัดท้ายทิ้งแบบเงียบ ๆ (silent truncation)** ทำให้ข้อมูลครึ่งหลังของ chunk หายสาบสูญจากการค้นหาตลอดกาล",
        "ดังนั้น Production Thai {{rag}} ต้องวัดขนาด chunk ด้วย **Token Counter จริง** ของโมเดลเป้าหมาย (เช่น `len(enc.encode(text))`) โดยขนาดมาตรฐานที่สมดุลสำหรับงาน RAG ภาษาไทยมักอยู่ที่ **`250–450 tokens`** ต่อ chunk — เล็กพอให้เวกเตอร์โฟกัสประเด็นเดียว แต่ใหญ่พอให้มีความหมายครบถ้วน",
      ],
      analogy:
        "การวัด chunk ภาษาไทยด้วยจำนวนตัวอักษรเหมือนชั่งน้ำหนักกระเป๋าขึ้นเครื่องด้วยการนับ 'จำนวนชิ้นเสื้อผ้า' แทนการชั่ง 'กิโลกรัมจริง' — เสื้อกันหนาวหนา 5 ตัว (ภาษาไทย) หนักเกินพิกัดจนถูกโยนทิ้งหน้าเกต ทั้งที่นับได้แค่ 5 ชิ้นเท่าเสื้อยืด",
      code: {
        language: "python",
        filename: "token_budget_compare.py",
        code: `import re

# ตัวประมาณ token ออฟไลน์ที่สะท้อน BPE inflation ของภาษาไทย (~1.6 ตัวอักษรไทย/token, ~4 ตัวอังกฤษ/token)
THAI_CHAR_RE = re.compile(r"[\\u0e00-\\u0e7f]")


def approx_bpe_tokens(text: str) -> int:
    thai_chars = len(THAI_CHAR_RE.findall(text))
    other_chars = len(text) - thai_chars
    return max(1, int(thai_chars / 1.5 + other_chars / 4.0)) if text.strip() else 0


en_sample = "Refund policy allows returns within 7 days of delivery with receipt." * 8
th_sample = "นโยบายการคืนเงินอนุญาตให้คืนสินค้าภายใน 7 วันหลังรับของพร้อมใบเสร็จ " * 8

print(f"EN: {len(en_sample)} chars -> ~{approx_bpe_tokens(en_sample)} tokens")
print(f"TH: {len(th_sample)} chars -> ~{approx_bpe_tokens(th_sample)} tokens")`,
        caption: "แม้จำนวนตัวอักษรใกล้เคียงกัน ข้อความภาษาไทยกินโควตา token มากกว่าอังกฤษเกือบ 2.5 เท่า",
      },
      whyTitle: "Why this matters — ป้องกัน Silent Truncation ใน Embedding Model",
      whyParagraphs: [
        "Embedding model รุ่นยอดนิยมอย่าง `bge-m3`, `multilingual-e5` หรือ `text-embedding-3` มีเพดาน token ต่างกัน (ตั้งแต่ 512 ถึง 8,192 tokens) แต่ถึงแม้เพดานจะสูง chunk ที่ยาวเกิน 500 tokens ก็ทำให้เวกเตอร์เฉลี่ยความหมายหลายเรื่องปนกันจนคะแนนค้นหาตก",
        "การคุมขนาดด้วย Token Counter จริงทำให้คุณควบคุมทั้งความแม่นของการค้นหาและงบ {{context-engineering}} ได้อย่างแม่นยำ",
      ],
    },
    {
      id: "recursive-vs-structural-vs-table-atomic",
      title: "2 · เทียบ 3 กลยุทธ์ Chunking: Recursive vs Heading-Structural vs Table-Atomic",
      paragraphs: [
        "**1) Recursive Splitting** แบ่งข้อความตามลำดับตัวคั่นจากหยาบไปละเอียด เช่น ย่อหน้า (`\\n\\n`) → ขึ้นบรรทัดใหม่ (`\\n`) → ช่องว่าง (` `) เหมาะกับข้อความร้อยแก้วทั่วไป แต่มีจุดอ่อน 2 เรื่องกับเอกสารไทย: ภาษาไทยไม่ได้เว้นวรรคระหว่างคำ และ Recursive Splitter มักตัดผ่านกลางตาราง Markdown หรือแยกหัวข้อ `##` ออกจากย่อหน้าใต้หัวข้อนั้น",
        "**2) Heading-Structural Splitting** ใช้โครงสร้างหัวข้อ Markdown (`#`, `##`, `###`) เป็นเส้นแบ่งหลักก่อนเสมอ เพื่อให้แต่ละ section ถูกจัดกลุ่มตามความหมายจริงของเอกสาร หาก section ใดยังยาวเกินงบ `max_tokens` จึงค่อยแบ่งย่อยตามย่อหน้า/ประโยคภายใน section เดียวกัน",
        "**3) Table-Atomic Splitting** ปฏิบัติกับตาราง Markdown (`| col | ... |`) เป็นหน่วยพิเศษที่ **ห้ามหั่นกลางแถวเด็ดขาด**: หากทั้งตารางเล็กกว่า `max_tokens` ให้เก็บไว้เป็นก้อนเดียวทั้งตาราง แต่หากตารางยาวมากจนจำเป็นต้องแบ่งหลาย chunk ต้อง **ทำสำเนา 2 บรรทัดหัวตาราง (`header + separator`) แปะไว้ด้านบนของทุก chunk ตาราง** เพื่อให้ทุกชิ้นอ่านคอลัมน์ออกได้ด้วยตัวเอง",
      ],
      analogy:
        "Recursive เหมือนหั่นขนมปังตามรอยปรุทั่วไป, Structural เหมือนแบ่งอาหารเป็นชุดตามเมนู (ของคาว/ของหวาน), ส่วน Table-Atomic เหมือนห้ามผ่าไข่ดาวครึ่งฟอง — ถ้าจานใหญ่เกินต้องแบ่งสองจาน ก็ต้องมีชื่อคอลัมน์ติดไปทั้งสองจาน",
      bullets: [
        "**Heading-Structural**: เก็บ stack ของหัวข้อปัจจุบัน (`H1 > H2 > H3`) ไว้ตลอดการอ่านเอกสาร",
        "**Table-Atomic**: ตรวจจับบล็อกตาราง Markdown และไม่รวมปนกับข้อความอื่นจนล้น หรือหากตารางใหญ่เกินงบ ให้แบ่งทีละแถวพร้อมคง 2 บรรทัดหัวตารางเสมอ",
        "**ไม่สร้าง Orphan Heading**: ห้ามปล่อย chunk ที่มีแต่บรรทัดหัวข้อ `## เงื่อนไข` เปล่า ๆ โดยไม่มีเนื้อหาตามมา",
      ],
      whyTitle: "Why this matters — แก้จุดตายข้อ 1 ของ Naive RAG ได้ถาวร",
      whyParagraphs: [
        "ตารางราคา ตารางเปรียบเทียบแพ็กเกจ และตาราง SLA คือแหล่งคำถามที่ลูกค้าและพนักงานถามบ่อยที่สุดในองค์กรไทย การรักษาหัวตารางไว้ในทุก chunk ที่ถูกแบ่งช่วยเพิ่มความแม่นยำของคำตอบเชิงตัวเลขได้ทันที",
        "เมื่อรวม Heading-Structural กับ Table-Atomic เข้าด้วยกัน Chunker ของคุณจะเข้าใจโครงสร้างเอกสารเหมือนมนุษย์อ่าน",
      ],
    },
    {
      id: "breadcrumb-and-overlap",
      title: "3 · Context Breadcrumb + Overlap 10–15%: ทำให้ทุก Chunk ยืนด้วยตัวเองได้",
      paragraphs: [
        "ลองนึกภาพว่าเอกสารนโยบายมี 2 หัวข้อใหญ่: `# นโยบายคืนเงินสินค้า` และ `# นโยบายเปลี่ยนไซส์` ทั้งคู่มีข้อความย่อยว่า `\"ดำเนินการภายใน 7 วันทำการ\"` ถ้า chunk ที่ถูกดึงขึ้นมามีแค่ประโยคนั้นลอย ๆ ทั้ง Embedding และ LLM จะไม่รู้เลยว่า 7 วันนี้คือคืนเงินหรือเปลี่ยนไซส์",
        "วิธีแก้ที่เรียบง่ายและได้ผลสูงมากคือ **Prepend Parent Heading Context (Breadcrumb)**: แปะเส้นทางหัวข้อพ่อไว้บรรทัดแรกของทุก chunk เช่น `[นโยบายคืนเงินสินค้า > เงื่อนไข 7 วัน]` วิธีนี้ใช้พื้นที่เพียง ~10–15 tokens แต่ช่วยให้ทั้ง Vector Search, {{bm25}} และ LLM เข้าใจบริบทครบถ้วน (เป็นหลักการเดียวกับ Contextual Retrieval ที่ลด Retrieval Failure ได้อย่างมาก)",
        "ส่วน **Overlap (การซ้อนทับระหว่าง chunk ติดกัน)** ควรตั้งไว้ราว **10–15% ของ `max_tokens`** (เช่น `max_tokens=300`, `overlap_tokens=40`) เพื่อเชื่อมรอยต่อระหว่างย่อหน้ายาวในหัวข้อเดียวกัน ไม่ให้คำตอบที่พาดข้ามรอยต่อหลุดขาด แต่มีข้อควรระวัง 2 ข้อ: **อย่า overlap ข้ามหัวข้อคนละเรื่อง** และ **อย่าเอาบรรทัดท้ายตารางไป overlap แบบมั่ว ๆ** (ตารางใช้การซ้ำหัวตารางแทน)",
      ],
      analogy:
        "Breadcrumb เหมือนพิมพ์หัวกระดาษว่า 'แฟ้ม: นโยบายคืนเงิน > หมวด: เงื่อนไข 7 วัน' บนทุกแผ่นที่ถ่ายเอกสาร ส่วน Overlap เหมือนให้ย่อหน้าสุดท้ายของแผ่นที่ 1 โผล่ซ้ำเล็กน้อยที่หัวแผ่นที่ 2 เพื่อไม่ให้ประโยคที่พาดข้ามหน้าขาดตอน",
      bullets: [
        "**Breadcrumb prefix**: แปะ `[H1 > H2]` ลงในเนื้อหา chunk ที่ส่งเข้าทั้ง Index และ Prompt (และนับรวมในงบ `max_tokens` ด้วย)",
        "**Overlap 10–15%**: ใช้เฉพาะระหว่าง prose chunks ภายใน section เดียวกัน — มากเกินไป (เช่น 40–50%) จะเพิ่มขนาดดัชนีและทำให้ผลค้นหาซ้ำซ้อน",
        "**Chunk ID ที่คาดเดาได้**: ตั้งชื่อเช่น `f\"{doc_id}#c{idx}\"` เพื่อส่งต่อไปทำ inline citation ใน Day 105",
      ],
      whyTitle: "Why this matters — เพิ่ม Recall และ Faithfulness โดยไม่ต้องเปลี่ยนโมเดล",
      whyParagraphs: [
        "การแปะ Breadcrumb เพิ่มต้นทุนแทบเป็นศูนย์ แต่ทำให้ chunk สั้น ๆ ที่อยู่ลึกในหัวข้อย่อยถูกค้นเจอได้ง่ายขึ้นมากเมื่อผู้ใช้ถามด้วยชื่อหัวข้อใหญ่",
        "และเมื่อถึงขั้นตอบคำถาม LLM จะเห็นหัวข้อชัดเจน ลดโอกาสตีความผิดหมวดจนเกิดคำตอบคลาดเคลื่อน ({{groundedness}} สูงขึ้นทันที)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Structural Chunking เทียบกับการแบ่งหน้าและการทำ Breadcrumb ในเว็บ",
      body: [
        "ถ้าคุณเคยทำ Pagination, DOM Tree traversal หรือ Breadcrumb Navigation ในเว็บแอป แนวคิดของ Structural Chunking แทบจะเหมือนกันเป๊ะ:",
      ],
      table: [
        ["Heading Stack (`H1 > H2`)", "Breadcrumb navigation (`Home > Docs > Refund`)"],
        ["Token-aware `max_tokens`", "Payload size budget ที่วัดหน่วยจริง (bytes/tokens) ไม่เดาจากจำนวนรายการ"],
        ["Table-atomic header repeat", "Sticky `<thead>` ที่ตามติดทุกหน้าเมื่อพิมพ์ตารางยาวข้ามหน้า"],
        ["10–15% Prose Overlap", "Sliding window buffer เพื่อกันขอบข้อมูลขาดตอน"],
      ],
    },
    student: {
      title: "First-Year Note — ใช้ Stack เก็บหัวข้อ `H1 > H2 > H3` อย่างไร",
      body: [
        "เมื่ออ่านไฟล์ Markdown ทีละบรรทัด เราสามารถเก็บหัวข้อปัจจุบันเป็นลิสต์ `heading_stack: list[tuple[int, str]]` เช่น `[(1, 'นโยบายคืนเงิน'), (2, 'เงื่อนไข 7 วัน')]`",
        "พอเจอหัวข้อระดับ `level` ใหม่ (นับจากจำนวน `#`) เราแค่ `pop()` ทุกหัวข้อที่ระดับ `>= level` ออกจากท้าย stack แล้ว `append((level, title))` เข้าไป — แค่นี้เราก็จะได้เส้นทาง `[H1 > H2]` ที่ถูกต้องเสมอแม้เอกสารจะกระโดดจาก `###` กลับมาที่ `##` ก็ตาม",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีเอกสาร Markdown ภาษาไทยที่มีทั้งหัวข้อซ้อนกัน (`#`, `##`), ย่อหน้ายาว และตารางราคา เราจะสร้าง Structural Token-Aware Chunker ทีละขั้น เพื่อดูว่า Breadcrumb, Table-Atomic และ Overlap ทำงานร่วมกันอย่างไร",
    steps: [
      {
        title: "1 · แยกเอกสาร Markdown เป็นบล็อก (Heading, Table, Paragraph) พร้อม Breadcrumb Stack",
        explain:
          "สแกนเอกสารทีละบรรทัด อัปเดต `heading_stack` เมื่อเจอ `#` และรวมบรรทัดที่ขึ้นต้นด้วย `|` ติดกันเป็นบล็อกชนิด `table`",
        code: {
          language: "python",
          filename: "worked_chunker.py",
          code: `def parse_blocks(md_text: str) -> list[dict]:
    blocks: list[dict] = []
    heading_stack: list[tuple[int, str]] = []
    lines = md_text.splitlines()
    i = 0

    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("#"):
            level = len(line) - len(line.lstrip("#"))
            title = line[level:].strip()
            while heading_stack and heading_stack[-1][0] >= level:
                heading_stack.pop()
            heading_stack.append((level, title))
            i += 1
            continue

        breadcrumb = " > ".join(t for _, t in heading_stack) or "เอกสารทั่วไป"
        if line.startswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            blocks.append({"kind": "table", "breadcrumb": breadcrumb, "lines": table_lines})
        else:
            para_lines = []
            while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(("#", "|")):
                para_lines.append(lines[i].strip())
                i += 1
            blocks.append({"kind": "prose", "breadcrumb": breadcrumb, "text": " ".join(para_lines)})
    return blocks


sample_md = """# คู่มือแพ็กเกจ 2026
## ตารางราคา
| แพ็กเกจ | ราคา | โควตา |
| --- | --- | --- |
| Starter | 490 บาท | 5,000 |
| Pro | 1,490 บาท | 50,000 |
## เงื่อนไขคืนเงิน
ลูกค้าขอคืนเงินได้ภายใน 7 วันหลังชำระเงิน
"""
for b in parse_blocks(sample_md):
    print(b["kind"], "|", b["breadcrumb"])`,
        },
        output: `table | คู่มือแพ็กเกจ 2026 > ตารางราคา
prose | คู่มือแพ็กเกจ 2026 > เงื่อนไขคืนเงิน`,
      },
      {
        title: "2 · แบ่งตารางแบบ Table-Atomic โดยคง 2 บรรทัดหัวตารางในทุกชิ้น",
        explain:
          "หากตารางมีหลายแถวจนเกิน `max_tokens` เราจะแบ่งทีละแถวโดย **แปะ Breadcrumb + 2 บรรทัดหัวตาราง (`header` + `---`)** ลงในทุก chunk ตาราง เพื่อไม่ให้แถวไหนกำพร้า",
        code: {
          language: "python",
          filename: "worked_chunker.py",
          code: `def simple_tokens(text: str) -> int:
    return max(1, len(text) // 2) if text.strip() else 0


def split_table_atomic(
    table_lines: list[str],
    breadcrumb: str,
    max_tokens: int,
    token_counter=simple_tokens,
) -> list[str]:
    prefix = f"[{breadcrumb}]"
    header = table_lines[:2]
    rows = table_lines[2:]
    chunks: list[str] = []
    current_rows: list[str] = []

    for row in rows:
        candidate = "\\n".join([prefix, *header, *current_rows, row])
        if current_rows and token_counter(candidate) > max_tokens:
            chunks.append("\\n".join([prefix, *header, *current_rows]))
            current_rows = [row]
        else:
            current_rows.append(row)

    if current_rows:
        chunks.append("\\n".join([prefix, *header, *current_rows]))
    return chunks


tbl = parse_blocks(sample_md)[0]
for idx, ch in enumerate(split_table_atomic(tbl["lines"], tbl["breadcrumb"], max_tokens=65), start=1):
    print(f"=== Table Chunk {idx} ===")
    print(ch)`,
        },
        output: `=== Table Chunk 1 ===
[คู่มือแพ็กเกจ 2026 > ตารางราคา]
| แพ็กเกจ | ราคา | โควตา |
| --- | --- | --- |
| Starter | 490 บาท | 5,000 |
=== Table Chunk 2 ===
[คู่มือแพ็กเกจ 2026 > ตารางราคา]
| แพ็กเกจ | ราคา | โควตา |
| --- | --- | --- |
| Pro | 1,490 บาท | 50,000 |`,
      },
      {
        title: "3 · แบ่งย่อหน้ายาวพร้อม Token-Aware Overlap 10–15%",
        explain:
          "สำหรับข้อความร้อยแก้วที่ยาวเกิน `max_tokens` เราแบ่งตามหน่วยคำ/ประโยคโดยคง `prefix` Breadcrumb ไว้บนหัวทุก chunk และดึงท้าย chunk ก่อนหน้ามาซ้อนทับไม่เกิน `overlap_tokens`",
        code: {
          language: "python",
          filename: "worked_chunker.py",
          code: `def split_prose_with_overlap(
    text: str,
    breadcrumb: str,
    max_tokens: int,
    overlap_tokens: int,
    token_counter=simple_tokens,
) -> list[str]:
    prefix = f"[{breadcrumb}]\\n"
    words = text.split()
    chunks: list[str] = []
    start = 0

    while start < len(words):
        end = start + 1
        while end <= len(words) and token_counter(prefix + " ".join(words[start:end])) <= max_tokens:
            end += 1
        chunk_end = max(start + 1, end - 1)
        chunks.append(prefix + " ".join(words[start:chunk_end]))
        if chunk_end >= len(words):
            break

        # ถอยหลังเก็บ overlap คำที่ไม่เกิน overlap_tokens
        ov_start = chunk_end
        while ov_start > start + 1 and token_counter(" ".join(words[ov_start - 1 : chunk_end])) <= overlap_tokens:
            ov_start -= 1
        start = ov_start if ov_start < chunk_end else chunk_end
    return chunks


long_thai = "ลูกค้า สามารถ ขอคืนเงิน ได้ภายใน 7 วัน โดยแนบ ใบเสร็จ และ หมายเลขคำสั่งซื้อ ผ่านระบบ แชต ฝ่ายบริการลูกค้า ตลอด 24 ชั่วโมง"
for idx, ch in enumerate(split_prose_with_overlap(long_thai, "นโยบายคืนเงิน", max_tokens=45, overlap_tokens=10), start=1):
    print(f"--- Prose Chunk {idx} ---")
    print(ch)`,
        },
        output: `--- Prose Chunk 1 ---
[นโยบายคืนเงิน]
ลูกค้า สามารถ ขอคืนเงิน ได้ภายใน 7 วัน โดยแนบ ใบเสร็จ และ หมายเลขคำสั่งซื้อ
--- Prose Chunk 2 ---
[นโยบายคืนเงิน]
และ หมายเลขคำสั่งซื้อ ผ่านระบบ แชต ฝ่ายบริการลูกค้า ตลอด 24 ชั่วโมง`,
      },
    ],
    gotcha:
      "จุดสังเกต: ถ้าข้อความไทยยาวติดกันเป็นพืดโดยไม่มีช่องว่างเลย (`words = text.split()` ได้แค่ 1 ก้อนยาว) ลูปต้องมี fallback หั่นตามประโยคหรือตามงบตัวอักษรที่สัมพันธ์กับ `token_counter` และต้องมั่นใจว่า `start` เดินหน้าเสมอเพื่อป้องกัน infinite loop!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้าง `chunk_markdown_document` ที่รวมพลังทั้ง 3 อย่าง — Heading Breadcrumb, Table-Atomic Header Repeat และ Token-Aware Prose Splitting + Overlap — พร้อมคืนลิสต์ `TextChunk` ที่ตรวจด้วย `Pydantic v2`",
    requirements: [
      "สร้าง `TextChunk(BaseModel)` เก็บ `chunk_id: str`, `doc_id: str`, `breadcrumb: str`, `kind: Literal[\"prose\", \"table\"]`, `text: str`, และ `token_count: int`",
      "สร้างฟังก์ชัน `chunk_markdown_document(markdown: str, *, doc_id: str, max_tokens: int = 120, overlap_tokens: int = 15, token_counter: Callable[[str], int] = approx_thai_tokens) -> list[TextChunk]`",
      "Validate พารามิเตอร์แบบ fail-fast: ถ้า `max_tokens <= 0` หรือ `overlap_tokens < 0` หรือ `overlap_tokens >= max_tokens` ให้โยน `ValueError`",
      "รักษาโครงสร้างเอกสาร: (ก) เก็บเส้นทางหัวข้อด้วย stack (`H1 > H2`) แล้วแปะ `[breadcrumb]` ไว้บรรทัดแรกของทุก chunk และไม่สร้าง orphan heading chunk, (ข) แบ่งตาราง Markdown แบบ Table-Atomic โดยหากต้องแบ่งหลาย chunk ต้องแปะ `[breadcrumb]` และ 2 บรรทัดหัวตาราง (`header` + `---`) ไว้ในทุก chunk ตาราง, (ค) แบ่งข้อความร้อยแก้วที่เกิน `max_tokens` พร้อม overlap ภายใน section เดียวกัน (ไม่ overlap ข้าม section)",
      "ตั้ง `chunk_id` เรียงลำดับเป็น `f\"{doc_id}#c{index}\"` (1-based) และคำนวณ `token_count = token_counter(chunk.text)` ให้ตรงทุกชิ้น",
    ],
    starter: {
      language: "python",
      filename: "exercise_day095.py",
      code: `from __future__ import annotations
import re
from collections.abc import Callable
from typing import Literal
from pydantic import BaseModel

THAI_CHAR_RE = re.compile(r"[\\u0e00-\\u0e7f]")


def approx_thai_tokens(text: str) -> int:
    """ตัวประมาณ BPE token แบบออฟไลน์ (ภาษาไทย ~1.5 ตัวอักษร/token, อื่น ๆ ~4 ตัวอักษร/token)"""
    if not text.strip():
        return 0
    thai_chars = len(THAI_CHAR_RE.findall(text))
    other_chars = len(text) - thai_chars
    return max(1, int(thai_chars / 1.5 + other_chars / 4.0))


class TextChunk(BaseModel):
    chunk_id: str
    doc_id: str
    breadcrumb: str
    kind: Literal["prose", "table"]
    text: str
    token_count: int


def chunk_markdown_document(
    markdown: str,
    *,
    doc_id: str,
    max_tokens: int = 120,
    overlap_tokens: int = 15,
    token_counter: Callable[[str], int] = approx_thai_tokens,
) -> list[TextChunk]:
    """แบ่งเอกสาร Markdown ภาษาไทยแบบ Structural + Table-Atomic + Token-Aware Overlap"""
    # TODO: 1) ตรวจพารามิเตอร์ max_tokens และ overlap_tokens
    # TODO: 2) แยกบล็อก heading / table / prose พร้อม heading stack
    # TODO: 3) แบ่ง table แบบคงหัวตาราง และแบ่ง prose แบบ token-aware + overlap ภายใน section
    # TODO: 4) คืน list[TextChunk] พร้อม chunk_id = f"{doc_id}#c{i}" และ token_count
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day095.py",
      code: `import pytest
from exercise_day095 import approx_thai_tokens, chunk_markdown_document

SAMPLE_DOC = """# นโยบายบริการ 2026
## ตารางราคาแพ็กเกจ
| แพ็กเกจ | ราคา/เดือน | โควตาข้อความ |
| --- | --- | --- |
| Starter | 490 บาท | 5,000 ข้อความ |
| Growth | 990 บาท | 20,000 ข้อความ |
| Pro | 1,490 บาท | 50,000 ข้อความ |
| Enterprise | 4,900 บาท | 250,000 ข้อความ |

## เงื่อนไขการคืนเงิน
ลูกค้า สามารถ ยื่นคำขอ คืนเงิน ได้ภายใน 7 วัน นับจาก วันที่ ชำระเงิน โดย ต้อง แนบ หมายเลขคำสั่งซื้อ และ หลักฐาน การโอนเงิน ผ่าน ช่องทาง แชต ฝ่ายบริการลูกค้า เพื่อ ให้ เจ้าหน้าที่ ตรวจสอบ และ คืนเงิน เข้า บัญชี เดิม ภายใน 5 วันทำการ

## หัวข้อว่างที่ยังไม่มีเนื้อหา
"""


def test_preserves_table_headers_and_breadcrumb_when_table_splits():
    chunks = chunk_markdown_document(SAMPLE_DOC, doc_id="svc-2026", max_tokens=75, overlap_tokens=10)
    table_chunks = [c for c in chunks if c.kind == "table"]
    assert len(table_chunks) >= 2
    for tc in table_chunks:
        assert tc.breadcrumb == "นโยบายบริการ 2026 > ตารางราคาแพ็กเกจ"
        assert tc.text.startswith("[นโยบายบริการ 2026 > ตารางราคาแพ็กเกจ]")
        assert "| แพ็กเกจ | ราคา/เดือน | โควตาข้อความ |" in tc.text
        assert "| --- | --- | --- |" in tc.text


def test_prose_chunks_have_overlap_and_no_orphan_headings():
    chunks = chunk_markdown_document(SAMPLE_DOC, doc_id="svc-2026", max_tokens=75, overlap_tokens=12)
    prose_chunks = [c for c in chunks if c.kind == "prose"]
    assert len(prose_chunks) >= 2
    assert all(c.breadcrumb == "นโยบายบริการ 2026 > เงื่อนไขการคืนเงิน" for c in prose_chunks)
    # ห้ามมี orphan heading chunk จาก 'หัวข้อว่างที่ยังไม่มีเนื้อหา'
    assert not any("หัวข้อว่างที่ยังไม่มีเนื้อหา" in c.text for c in chunks)

    # ตรวจว่ามีคำซ้อนทับกันระหว่าง prose chunk 1 และ 2
    words_1 = set(prose_chunks[0].text.splitlines()[1].split())
    words_2 = set(prose_chunks[1].text.splitlines()[1].split())
    assert len(words_1 & words_2) >= 1


def test_chunk_ids_and_token_counts_match_counter():
    chunks = chunk_markdown_document(
        SAMPLE_DOC,
        doc_id="svc-2026",
        max_tokens=80,
        overlap_tokens=10,
        token_counter=approx_thai_tokens,
    )
    assert [c.chunk_id for c in chunks] == [f"svc-2026#c{i}" for i in range(1, len(chunks) + 1)]
    for ch in chunks:
        assert ch.token_count == approx_thai_tokens(ch.text)


def test_invalid_token_parameters_raise_value_error():
    with pytest.raises(ValueError):
        chunk_markdown_document(SAMPLE_DOC, doc_id="svc-2026", max_tokens=0)
    with pytest.raises(ValueError):
        chunk_markdown_document(SAMPLE_DOC, doc_id="svc-2026", max_tokens=50, overlap_tokens=-1)
    with pytest.raises(ValueError):
        chunk_markdown_document(SAMPLE_DOC, doc_id="svc-2026", max_tokens=50, overlap_tokens=50)
`,
    },
    selfCheck: [
      "ทุก `table` chunk มี `[breadcrumb]`, แถวหัวตาราง และบรรทัด `| --- | --- |` ครบแม้ตารางถูกแบ่งเป็นหลายชิ้น",
      "หัวข้อว่างที่ไม่มีเนื้อหาตามหลังไม่ก่อให้เกิด orphan heading chunk",
      "ย่อหน้ายาวถูกแบ่งพร้อม overlap คำระหว่าง chunk ติดกันใน section เดียวกัน และไม่เกิด infinite loop",
      "`chunk_id` เรียงตั้งแต่ `doc_id#c1` เป็นต้นไป และ `token_count` ตรงกับ `token_counter(chunk.text)`",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "แยกฟังก์ชันย่อย 3 ตัวให้ชัด: `_parse_blocks(markdown)` → `_chunk_table(...)` → `_chunk_prose(...)` จะทำให้โค้ดอ่านง่ายและดีบั๊กทีละส่วนได้ไว",
      },
      {
        body: "ใน `_chunk_prose` ให้ระวังเงื่อนไขการขยับ `start`: เมื่อถอย `ov_start` กลับไปเก็บ overlap ต้องมั่นใจว่า `ov_start > start` เสมอ (หากถอยจนชน `start` ให้เลื่อนไปที่ `chunk_end`) เพื่อรับประกันว่าลูปจบแน่นอน",
      },
      {
        body: "โครงหลักของ `chunk_markdown_document` — เหลือต่อบล็อก `table` และ `prose` จากตัวอย่างใน Worked Example แล้วเติม validation ด้านบน",
        code: {
          language: "python",
          filename: "hint_day095.py",
          code: `def chunk_markdown_document(
    markdown: str,
    *,
    doc_id: str,
    max_tokens: int = 120,
    overlap_tokens: int = 15,
    token_counter: Callable[[str], int] = approx_thai_tokens,
) -> list[TextChunk]:
    if max_tokens <= 0 or overlap_tokens < 0 or overlap_tokens >= max_tokens:
        raise ValueError("Invalid max_tokens or overlap_tokens")

    raw_chunks: list[tuple[str, Literal["prose", "table"], str]] = []
    # TODO: วนผ่าน blocks จาก _parse_blocks(markdown)
    #   ถ้า kind == "table": เรียก _split_table_atomic(...) แล้ว append (breadcrumb, "table", text)
    #   ถ้า kind == "prose": เรียก _split_prose_overlap(...) แล้ว append (breadcrumb, "prose", text)

    return [
        TextChunk(
            chunk_id=f"{doc_id}#c{idx}",
            doc_id=doc_id,
            breadcrumb=bc,
            kind=kind,
            text=text,
            token_count=token_counter(text),
        )
        for idx, (bc, kind, text) in enumerate(raw_chunks, start=1)
    ]`,
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
      title: "ตั้ง chunk_size เป็นจำนวนตัวอักษรแล้วทึกทักว่า 1 token ≈ 4 ตัวอักษรกับภาษาไทย",
      symptom: "chunk ภาษาไทยยาวเกิน limit ของ Embedding model (เช่น 512 tokens) จนข้อความครึ่งหลังถูกตัดทิ้งเงียบ ๆ และค้นไม่เจอ",
      fix: "นับขนาด chunk ด้วย `token_counter` ของโมเดลจริงเสมอ (รองรับ {{bpe-tokenizer}} inflation 1.5x–3x ของภาษาไทย)",
    },
    {
      title: "ตั้ง overlap สูงเกินไป (เช่น 40–50% ของขนาด chunk)",
      symptom: "จำนวน chunk ใน Vector DB พุ่งเกือบ 2 เท่า กินค่าจัดเก็บ/embed แพงขึ้น และเวลาดึง top-5 ได้เนื้อหาซ้ำเดิมถึง 3 ชิ้น",
      fix: "ใช้ overlap ประมาณ **10–15%** ของ `max_tokens` เฉพาะข้อความร้อยแก้วภายใน section เดียวกัน",
    },
    {
      title: "ตัดหัวข้อทิ้งหรือปล่อยให้เกิด Orphan Heading Chunk",
      symptom: "chunk ที่มีแค่ `## เงื่อนไขคืนเงิน` ติดอันดับ 1 แต่ข้างในไม่มีเนื้อหาคำตอบ ส่วน chunk เนื้อหากลับไม่มีชื่อหัวข้อกำกับ",
      fix: "เก็บหัวข้อไว้ใน stack แล้วแปะเป็น Breadcrumb `[H1 > H2]` ลงบนเนื้อหาทุก chunk ใต้หัวข้อนั้น แทนการปล่อยเป็น chunk เปล่า",
    },
    {
      title: "ใช้ overlap แบบร้อยแก้วกับตาราง Markdown",
      symptom: "แถวสุดท้ายของตารางถูกคัดลอกไปแปะมั่ว ๆ โดยไม่มีหัวตาราง ทำให้โครงสร้างคอลัมน์พัง",
      fix: "จัดการตารางแบบ **Table-Atomic**: เก็บทั้งตารางถ้าไม่เกินงบ หรือแบ่งทีละแถวพร้อมคัดลอก 2 บรรทัดหัวตารางไว้ทุกชิ้น",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d095-q1",
        "ทำไมการตั้ง `chunk_size = 1,200` ตัวอักษร (ซึ่งมักปลอดภัยในภาษาอังกฤษ) จึงอันตรายมากกับเอกสารภาษาไทยที่ส่งเข้า Embedding model ขีดจำกัด 512 tokens?",
        [
          ["เพราะ Embedding model ไม่รองรับ UTF-8", "Multilingual embeddings รองรับ UTF-8 แต่มีเพดานจำนวน token จำกัด"],
          [
            "เพราะภาษาไทยเกิด BPE Token Inflation 1.5x–3x ทำให้ 1,200 ตัวอักษรไทยอาจยาว 700–900 tokens และถูกโมเดลตัดส่วนท้ายทิ้งเงียบ ๆ",
            "ถูก — ต้องวัดขนาด chunk ด้วย Token Counter จริง ไม่ใช่จำนวนตัวอักษร",
          ],
          ["เพราะ 1,200 ตัวอักษรไทยมีขนาดแค่ 50 tokens จึงสั้นเกินไป", "ตรงข้ามเลย — ภาษาไทยกิน token มากกว่าอังกฤษ ไม่ใช่น้อยกว่า"],
          ["เพราะ Python ตัดสตริงภาษาไทยเกิน 1,000 ตัวอักษรไม่ได้", "Python จัดการสตริงยาวได้ไม่จำกัด ปัญหาอยู่ที่ token limit ของโมเดล"],
        ],
        "B",
        "BPE Token Inflation ของภาษาไทย (Day 66) ทำให้กฎ 4 ตัวอักษร/token พลาดหนัก — การใช้ Token-aware chunking ป้องกัน silent truncation ได้เด็ดขาด",
        "ทำไมควรแบ่ง chunk ภาษาไทยแบบ Token-aware แทนการนับจำนวนตัวอักษรคงที่?",
        "เพราะภาษาไทยเกิด BPE inflation 1.5x–3x ทำให้จำนวนตัวอักษรเท่าอังกฤษกิน token พุ่งเกิน limit ของ Embedding model จนถูกตัดท้ายทิ้งเงียบ ๆ",
      ),
      mc(
        "d095-q2",
        "เอกสารมีตารางราคาแพ็กเกจ 40 แถวซึ่งยาวเกิน `max_tokens` วิธีแบ่งตารางที่ถูกต้องที่สุดสำหรับงาน RAG คือข้อใด?",
        [
          ["ตัดตารางทุก 500 ตัวอักษรเหมือนข้อความทั่วไป", "จะตัดขาดกลางแถวและทำให้แถวด้านล่างขาดหัวตาราง"],
          ["ลบตารางทิ้งทั้งหมดเพราะ RAG อ่านตารางไม่ได้", "ตารางราคาเป็นข้อมูลสำคัญมาก สามารถทำ RAG ได้ดีหากคงโครงสร้าง"],
          [
            "แบ่งทีละกลุ่มแถวที่ไม่เกิน `max_tokens` โดยแปะ Breadcrumb และทำสำเนา 2 บรรทัดหัวตาราง (`header + separator`) ไว้ด้านบนของทุก chunk ตาราง",
            "ถูก — ทุก chunk ตารางจะยังคงสมบูรณ์ อ่านคอลัมน์ออกได้ด้วยตัวเอง และไม่ตัดขาดกลางแถว",
          ],
          ["บีบตารางทั้ง 40 แถวให้เป็น chunk เดียวแม้ยาว 3,000 tokens", "จะเกิน token limit ของ Embedding model และทำให้เวกเตอร์เจือจาง"],
        ],
        "C",
        "Table-Atomic splitting ช่วยให้ตารางยาวถูกแบ่งอย่างปลอดภัยโดยทุก chunk ยังมีหัวคอลัมน์และชื่อหัวข้อครบถ้วน",
        "เมื่อตาราง Markdown ยาวเกินงบ max_tokens ของ 1 chunk ควรแบ่งอย่างไร?",
        "แบ่งตามขอบเขตแถว (ห้ามตัดกลางแถว) พร้อมแปะ Breadcrumb และคัดลอก 2 บรรทัดหัวตาราง (header + ---) ไว้ด้านบนทุก chunk ตาราง",
      ),
      mc(
        "d095-q3",
        "การแปะ Parent Heading Breadcrumb เช่น `[นโยบายคืนเงิน > เงื่อนไข 7 วัน]` ไว้ที่หัวของทุก chunk ช่วยแก้ปัญหาใดได้โดยตรง?",
        [
          ["ลดขนาดของไฟล์ PDF ต้นฉบับบนฮาร์ดดิสก์", "ไม่ได้เปลี่ยนขนาดไฟล์ต้นฉบับ"],
          [
            "ป้องกันการสูญเสียบริบทเมื่อ chunk ย่อยถูกดึงแยกออกมาโดด ๆ ทำให้ทั้งตัวค้นหาและ LLM รู้ทันทีว่าข้อความนั้นอยู่ภายใต้หัวข้อใด",
            "ถูก — ช่วยแก้ความกำกวมของข้อความสั้น ๆ อย่าง 'ภายใน 7 วัน' ที่โผล่ซ้ำได้ในหลายหมวดนโยบาย",
          ],
          ["ทำให้ไม่ต้องใช้ BM25 ในระบบ Hybrid Search", "Breadcrumb ช่วยเสริมทั้ง Dense และ BM25 แต่ไม่ได้แทนที่การทำ Hybrid Search"],
          ["ทำให้ไม่ต้องตรวจสอบ citation ในขั้นตอบคำถาม", "ยังคงต้องบังคับ citation เพื่อยืนยันแหล่งที่มาของคำตอบ"],
        ],
        "B",
        "Chunk ที่ถูกดึงขึ้นมาใน {{top-k}} มักขาดบริบทรอบข้าง การแปะ Breadcrumb ใช้เพียงไม่กี่ token แต่ช่วยเพิ่มทั้ง Retrieval accuracy และความถูกต้องของการตีความ",
        "ทำไมจึงควรแปะ Parent Heading Breadcrumb ไว้ด้านบนของทุก chunk?",
        "เพื่อให้ทุก chunk ยืนด้วยตัวเองได้เมื่อถูกดึงแยกออกมาจากเอกสาร ช่วยให้ทั้งตัวค้นหาและ LLM รู้หมวดหมู่/หัวข้อที่ถูกต้อง",
      ),
      mc(
        "d095-q4",
        "ข้อใดคือแนวปฏิบัติที่เหมาะสมสำหรับค่า **Overlap** ในการทำ Chunking?",
        [
          ["ตั้ง Overlap 50% ทุก chunk เพื่อกันข้อมูลหายให้มากที่สุด", "Overlap 50% ทำให้ดัชนีโตเกือบ 2 เท่าและดึงข้อความซ้ำซ้อนเข้ามาเปลือง context"],
          ["ตั้ง Overlap เท่ากับ 0 เสมอแม้ในย่อหน้ายาวมาก", "อาจทำให้ประโยคหรือเงื่อนไขที่พาดข้ามรอยต่อระหว่าง 2 chunk ขาดความเชื่อมโยง"],
          [
            "ตั้ง Overlap ราว 10–15% ของ `max_tokens` เฉพาะระหว่าง prose chunks ภายในหัวข้อเดียวกัน และไม่ overlap ข้ามหัวข้อคนละเรื่อง",
            "ถูก — รักษาความต่อเนื่องที่รอยต่อโดยไม่สร้าง noise ซ้ำซ้อนหรือปนบริบทข้ามหัวข้อ",
          ],
          ["ตั้ง `overlap_tokens` มากกว่า `max_tokens`", "ผิดตรรกะและจะทำให้ลูปแบ่ง chunk เดินหน้าไม่ได้ (infinite loop)"],
        ],
        "C",
        "Overlap 10–15% ภายใน section เดียวกันคือจุดสมดุลระหว่างความต่อเนื่องของเนื้อหากับขนาดดัชนีที่กระชับ",
        "ค่า Overlap ที่เหมาะสมในการทำ Chunking คือเท่าไร และมีขอบเขตการใช้งานอย่างไร?",
        "ประมาณ 10–15% ของ max_tokens ใช้เฉพาะระหว่าง prose chunks ภายใน section เดียวกัน ไม่ overlap ข้ามหัวข้อและไม่ใช้กับการตัดกลางตาราง",
      ),
    ],
  },

  takeaways: [
    "วัดขนาด chunk ภาษาไทยด้วย **Token Counter จริง** (`250–450 tokens`) เพื่อป้องกัน Silent Truncation จาก {{bpe-tokenizer}} inflation `1.5x–3x`",
    "แบ่งตามโครงสร้าง (**Heading-Structural**) และเก็บตารางแบบ **Table-Atomic** (หากแบ่งตารางยาวต้องคัดลอก 2 บรรทัดหัวตารางไว้ทุกชิ้น)",
    "แปะ **Parent Heading Breadcrumb** (`[H1 > H2]`) บนหัวทุก chunk และไม่สร้าง orphan heading chunk",
    "ใช้ **Overlap 10–15%** เฉพาะข้อความร้อยแก้วภายใน section เดียวกัน — พรุ่งนี้ (Day 96) เราจะลงมือทบทวนและดีบั๊กซ่อม bad chunks จากเอกสารจริงทั้งชุด",
  ],

  reviewCards: [
    rc(
      "d095-rc-1",
      "ทำไม Fixed-Char Splitting (เช่น 1,200 ตัวอักษร) จึงเสี่ยงเกิด Silent Truncation บนภาษาไทย?",
      "เพราะภาษาไทยมี BPE token inflation 1.5x–3x ทำให้ 1,200 ตัวอักษรไทยอาจยาว 700–900 tokens ซึ่งเกิน limit 512 tokens ของ Embedding model และถูกตัดท้ายทิ้งเงียบ ๆ",
    ),
    rc(
      "d095-rc-2",
      "กฎ 3 ข้อของ Structural + Table-Atomic Chunking บนเอกสาร Markdown คืออะไร?",
      "1) แบ่งตามหัวข้อและแปะ Breadcrumb [H1 > H2] (ห้ามสร้าง orphan heading), 2) คงตารางไม่ให้ตัดกลางแถวและซ้ำหัวตาราง 2 บรรทัดทุกชิ้นถ้าต้องแบ่ง, 3) ใส่ overlap 10–15% เฉพาะ prose ใน section เดียวกัน",
    ),
    rc(
      "d095-rc-3",
      "เหตุใดควรออกแบบ Chunker ให้รับ `token_counter: Callable[[str], int]` เป็นพารามิเตอร์?",
      "เพื่อให้สลับใช้ตัวนับ token จริงของแต่ละโมเดลได้ (tiktoken / AutoTokenizer) และสลับใช้ตัวนับ deterministic ใน unit tests แบบออฟไลน์ได้ง่าย",
    ),
  ],

  sources: [
    { label: "Anthropic — Contextual Retrieval", href: "https://www.anthropic.com/news/contextual-retrieval" },
    { label: "Pinecone — Chunking Strategies for LLM Applications", href: "https://www.pinecone.io/learn/chunking-strategies/" },
    { label: "OpenAI tiktoken Official Repository", href: "https://github.com/openai/tiktoken" },
    { label: "Hugging Face Tokenizers Documentation", href: "https://huggingface.co/docs/tokenizers/" },
  ],

  glossary: ["chunking", "bpe-tokenizer", "embedding", "rag", "context-engineering", "top-k", "pydantic", "groundedness"],
});
