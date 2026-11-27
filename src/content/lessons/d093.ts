import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D093 — Phase 4 / Block B24
 * Naive RAG Architecture & Why It Fails in Production
 */
export const d093: Lesson = defineLesson({
  day: 93,
  titleTh: "สถาปัตยกรรม Naive RAG และ 4 จุดตายที่ทำให้พังในงานจริงขององค์กรไทย",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · เข้าใจวงจร RAG ตั้งแต่ต้นจนจบ และฝึกวินิจฉัยจุดพังก่อนลงมือแก้ผิดชั้น",
  icon: "search",
  visual: {
    id: "naive-rag-failures",
    title: "Naive RAG vs Production Thai RAG — 4 จุดตายที่พบบ่อยในงานจริง",
    caption: "คลิกสำรวจแต่ละจุดพัง (ตาราง PDF แตก, รหัสไทยปนอังกฤษหลุด, ตัดบริบทขาด, คำตอบมั่วไม่มีอ้างอิง) และวิธีแก้",
    alt: "แผนภาพเปรียบเทียบจุดอ่อนของ Naive RAG กับ Production Thai RAG",
  },
  requiresApiKey: false,
  tools: ["Python 3.12", "PyMuPDF / parser", "tokenizers", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "ทำไมต้อง RAG แทนการยัดเอกสารทั้งหมดเข้า Prompt",
      body: "คลังคู่มือ นโยบาย และตารางราคาขององค์กรไทยมีตั้งแต่หลายร้อยถึงหลายหมื่นหน้า และอัปเดตทุกเดือน การยัดทุกอย่างลง Context Window แพง ช้า และหลงรายละเอียด",
      lessonNote: "{{rag}} ดึงเฉพาะชิ้นส่วนเอกสารที่เกี่ยวข้องกับคำถาม ณ เวลานั้นมาแนบให้ {{llm}} ตอบจากหลักฐานจริง",
    },
    {
      node: 1,
      heading: "ความพังส่วนใหญ่ของ RAG เริ่มตั้งแต่ขั้น Data & Ingestion",
      body: "ตัวอย่างเดโมมักอ่านไฟล์ `.txt` สะอาด ๆ แล้วหั่นทีละ 500 ตัวอักษร แต่เอกสารไทยจริงคือ PDF สองคอลัมน์ ตารางค่าธรรมเนียม และนโยบายหลายเวอร์ชันที่ชนกัน",
      lessonNote: "วันนี้เราแยกอาการพัง 4 แบบที่เกิดจากขั้น Parse, {{chunking}} และ Metadata ก่อนจะลงมือแก้ทีละชั้นใน Day 94–108",
    },
    {
      node: 2,
      heading: "Retriever พลาด = โมเดลฉลาดแค่ไหนก็ตอบถูกไม่ได้",
      body: "Naive RAG พึ่งพา Dense {{embedding}} เพียงอย่างเดียว ทำให้พลาดรหัสสินค้า เลขที่ใบแจ้งหนี้ หรือมาตราเฉพาะในคำถามไทยปนอังกฤษ",
      lessonNote: "การวินิจฉัยต้องแยกให้ออกว่า **บริบทที่ถูกไม่ถูกดึงขึ้นมา (Retrieval Miss)** หรือ **ดึงมาแล้วแต่โมเดลแต่งเรื่องเอง (Generation Failure)**",
    },
    {
      node: 3,
      heading: "สร้างกรอบวินิจฉัยก่อนจูน Prompt หรือเปลี่ยนโมเดล",
      body: "ทีมมือใหม่มักเสียเวลาแก้ System Prompt หรืออัปเกรดเป็นโมเดลแพงที่สุด ทั้งที่ปัญหาจริงคือหัวตารางหายตอนหั่น chunk",
      lessonNote: "ในแบบฝึกหัดวันนี้ คุณจะเขียนตัววินิจฉัย (RAG Failure Diagnoser) ที่จำแนกสาเหตุความล้มเหลวของแต่ละเคสไปยังชั้นที่ต้องแก้ได้อย่างแม่นยำ",
    },
  ],

  objectives: [
    "**ไล่เรียงท่อ Naive {{rag}} ครบ 5 ขั้น** (`Load → Split → Embed → Retrieve → Prompt`) และระบุบทบาทของทั้งฝั่ง Offline Indexing และ Online Query",
    "**จำแนก 4 จุดตายหลัก** ของ Naive RAG บนเอกสารองค์กรไทย (ตาราง/หัวข้อแตก, พลาดรหัสเฉพาะเพราะไร้ {{bm25}}, เอกสารเก่าชนเอกสารใหม่, คำตอบไร้ {{groundedness}} / ไม่ยอม {{abstention}})",
    "**วินิจฉัยต้นตอความพังข้าม 3 ชั้น** (Ingestion/Chunking, Retrieval, Generation) ด้วยโค้ดและชุดทดสอบ {{pytest}} ก่อนเลือกวิธีแก้ให้ถูกจุด",
  ],

  prerequisites: [
    "เข้าใจ Dense {{embedding}} และการค้นหาด้วยความคล้ายคลึง (แนะนำ Day 69–70)",
    "เข้าใจขอบเขต Context Window และการเขียน Prompt พื้นฐาน (แนะนำ Day 73–74)",
    "ใช้งาน {{pydantic}} `BaseModel` และรัน {{pytest}} บนเครื่องได้",
    "ไม่ต้องใช้ API key — ตัวอย่างและแบบฝึกหัดทั้งหมดรันบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "เปิดโปรเจกต์เริ่มต้นของ Phase 4 (Block B24) ด้วย `uv` พร้อมติดตั้ง `pydantic` สำหรับโครงสร้างรายงานวินิจฉัย และ `pytest` + `ruff` สำหรับตรวจโค้ด",
    commands: `uv init ai-day093 && cd ai-day093
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('Phase 4 Ready · Pydantic', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day093` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งตรวจเวอร์ชันแล้วเห็น `Phase 4 Ready`"],
    ],
    note: "ตลอด Block B24 (Day 93–96) เราจะโฟกัสที่คุณภาพข้อมูลต้นทาง (Ingestion & Chunking) — ทุกบทเรียนรันได้ 100% บนเครื่องโดยไม่ต้องใช้ API key",
  },

  concepts: [
    {
      id: "naive-rag-anatomy",
      title: "1 · โครงสร้าง Naive RAG: จาก 5 ขั้นตอนในเดโมสู่ 2 เส้นทางในระบบจริง",
      paragraphs: [
        "บทความสอน {{rag}} ส่วนใหญ่เริ่มต้นด้วยท่อ 5 ขั้นที่ดูเรียบง่ายมาก: **Load** (อ่านไฟล์ PDF/Markdown) → **Split** (หั่นข้อความทุก 500 ตัวอักษร) → **Embed** (แปลงทุกชิ้นเป็นเวกเตอร์ {{embedding}}) → **Retrieve** (เอาคำถามมาหา {{top-k}} ชิ้นที่ใกล้สุด) → **Prompt** (ยัดชิ้นส่วนเหล่านั้นรวมกับคำถามส่งให้ {{llm}} ตอบ)",
        "ในเชิงวิศวกรรม ท่อนี้แบ่งเป็น **2 เส้นทางที่ทำงานคนละจังหวะ**: เส้นทาง **Offline Indexing** (`Load → Clean → Chunk → Embed → Store`) ที่รันเมื่อมีเอกสารใหม่หรือมีการแก้ไข และเส้นทาง **Online Query** (`Query → Retrieve → Rerank → Grounded Prompt → Answer`) ที่ต้องตอบผู้ใช้ให้เร็วภายในไม่กี่วินาที",
        "ปัญหาคือ Naive RAG ทำทุกขั้นแบบหยาบที่สุด: อ่าน PDF แบบดึงตัวอักษรดิบ หั่นด้วยจำนวนตัวอักษรคงที่ ใช้แค่ Vector Search ตัวเดียว และสั่งให้โมเดลตอบโดยไม่บังคับการอ้างอิง — ซึ่งมักผ่านเดโม 3 คำถามแรกอย่างสวยงาม แต่พังทันทีที่เปิดให้พนักงานจริงใช้งาน",
      ],
      analogy:
        "Naive RAG เหมือนถ่ายเอกสารคู่มือบริษัททั้งเล่มแล้วใช้กรรไกรตัดตามความกว้างไม้บรรทัดทุก 10 เซนติเมตร โยนใส่ลังเดียวกัน พอมีคนถามก็หยิบกระดาษที่หน้าตาคล้ายคำถามขึ้นมา 3 แผ่นแล้วให้พนักงานใหม่เดาคำตอบ",
      bullets: [
        "**Offline Indexing Pipeline**: โหลดเอกสาร → ล้างขยะ → แบ่ง {{chunking}} พร้อม metadata → สร้างดัชนี Vector + Lexical",
        "**Online Query Pipeline**: รับคำถาม → ค้นคืน {{top-k}} → จัดอันดับใหม่ → สร้างคำตอบที่มีแหล่งอ้างอิง ({{groundedness}})",
        "**กฎทองของ RAG**: Garbage In, Hallucination Out — ความฉลาดของ LLM ไม่สามารถกู้ข้อมูลที่ถูกทำลายตั้งแต่ขั้น Load และ Split ได้",
      ],
      whyTitle: "Why this matters — แผนที่ของทั้ง Phase 4 อยู่ที่ท่อนี้",
      whyParagraphs: [
        "ตลอด Days 93–108 เราจะอัปเกรด Naive RAG ทีละจุดอย่างเป็นระบบ: B24 ซ่อม Ingestion & Chunking, B25–B26 สร้าง Hybrid Search (Vector + {{bm25}} + {{rrf}} + {{reranker}}), และ B27 คุม {{groundedness}}, {{abstention}} และสิทธิ์เข้าถึงข้อมูล ({{acl}})",
        "การเห็นภาพรวมทั้งท่อตั้งแต่วันแรกทำให้คุณไม่หลงทางและรู้ว่าแต่ละเครื่องมือเข้ามาแก้จุดอ่อนตรงไหนของ Naive RAG",
      ],
    },
    {
      id: "four-thai-production-failures",
      title: "2 · 4 จุดตายของ Naive RAG บนเอกสารองค์กรไทย",
      paragraphs: [
        "เมื่อนำ Naive RAG ไปใช้กับเอกสารไทยจริง (นโยบาย HR, คู่มือซัพพอร์ต, สัญญา, ใบเสนอราคา PDF) อาการพังเกือบทั้งหมดจะตกอยู่ใน 4 กลุ่มหลักนี้:",
        "**จุดตายที่ 1 — ตารางและหัวข้อแตก (Broken Layout & Context Split)**: การดึงข้อความดิบจาก PDF ทำลายคอลัมน์ตาราง และ Fixed-char splitting ตัดหัวข้อออกจากเนื้อหาหรือตัดแถวราคาออกจากหัวตาราง จนเหลือแค่ตัวเลขลอย ๆ ที่อ่านไม่รู้เรื่อง **จุดตายที่ 2 — พลาดรหัสเฉพาะในคำถามไทยปนอังกฤษ (Exact ID Miss)**: Dense Vector อย่างเดียวแยก `#INV-2026-009` กับ `#INV-2026-019` หรือ `SKU-TH-402` ไม่คมเพราะไม่มีดัชนีคำตรงตัวแบบ {{bm25}}",
        "**จุดตายที่ 3 — เอกสารเก่าชนเอกสารใหม่ (Stale & Conflicting Docs)**: คลังมีทั้ง \"นโยบายคืนเงิน 2024 (14 วัน)\" และ \"นโยบายคืนเงิน 2026 (7 วัน)\" ปนกันโดยไม่เก็บ `updated_at` หรือสถานะ `active` โมเดลจึงหยิบของเก่ามาตอบลูกค้าอย่างมั่นใจ **จุดตายที่ 4 — แต่งคำตอบไร้หลักฐาน (Ungrounded {{hallucination}})**: เมื่อคลังไม่มีคำตอบ หรือบริบทไม่พอ โมเดลกลับเดาเองแทนที่จะ {{abstention|ปฏิเสธการตอบ}} และไม่แนบเลขแหล่งอ้างอิงให้ตรวจสอบได้",
      ],
      analogy:
        "เหมือนร้านขายยาที่ฉีกฉลากยาขาดครึ่ง (จุดที่ 1), หาชื่อรหัสยาไม่เจอเพราะจำแต่สีกล่อง (จุดที่ 2), เก็บใบราคาปีเก่าปนกับปีใหม่บนเคาน์เตอร์ (จุดที่ 3), และไม่กล้าบอกลูกค้าว่า 'ไม่มีข้อมูลนี้' เลยเดาขนาดยาให้แทน (จุดที่ 4)",
      code: {
        language: "python",
        filename: "naive_rag_failures.py",
        code: `FAILURE_TAXONOMY = {
    "broken_structure": {
        "layer": "ingestion_chunking",
        "thai_example": "หัวตาราง 'แพ็กเกจ Pro' หลุดไปอยู่ chunk ก่อนหน้า เหลือแค่ '| 1,290 บาท | ไม่จำกัด |'",
        "production_fix": "Parse เป็น Markdown พร้อมตาราง + Structural token-aware chunking (D94–D95)",
    },
    "exact_id_miss": {
        "layer": "retrieval",
        "thai_example": "ถาม 'สถานะออเดอร์ #INV-2026-009' แต่ Vector Search ดึง #INV-2026-019 ขึ้นมาแทน",
        "production_fix": "Hybrid Search: PyThaiNLP BM25 + Dense Vector + RRF (D99–D101)",
    },
    "stale_conflict": {
        "layer": "metadata_indexing",
        "thai_example": "ดึงนโยบายคืนเงินปี 2024 (14 วัน) มาตอบแทนฉบับปี 2026 (7 วัน)",
        "production_fix": "เก็บ updated_at/status ใน metadata + Incremental indexing & filtering (D94, D107)",
    },
    "ungrounded_answer": {
        "layer": "generation",
        "thai_example": "ไม่มีข้อมูลส่วนลด VIP ในบริบท แต่ LLM ตอบมั่นใจว่า 'ลด 25%' โดยไม่มี citation",
        "production_fix": "บังคับ inline citation [doc_id#chunk] + Abstention prompt (D105–D106)",
    },
}

for code_name, info in FAILURE_TAXONOMY.items():
    print(f"[{info['layer']}] {code_name} -> {info['production_fix']}")`,
        caption: "แผนที่เชื่อม 4 อาการพังของ Naive RAG ไปยังชั้นที่ต้องแก้ในสถาปัตยกรรม Production Thai RAG",
      },
      whyTitle: "Why this matters — แก้ผิดชั้น = เสียทั้งเวลาและค่า API ฟรี",
      whyParagraphs: [
        "ถ้า `broken_structure` ทำให้ตัวเลขราคาหลุดจากชื่อแพ็กเกจ ต่อให้คุณเปลี่ยนจากโมเดลเล็กเป็น Frontier LLM ที่แพงกว่า 20 เท่า โมเดลก็ยังตอบผิดอยู่ดีเพราะมันไม่เคยเห็นความเชื่อมโยงระหว่างหัวตารางกับตัวเลข",
        "วิศวกร AI ที่เก่งจะเปิดดู `retrieved_chunks` ดิบก่อนเสมอ เพื่อยืนยันว่าข้อมูลคำตอบ **ปรากฏครบและไม่แตก** ในบริบทที่ส่งเข้าโมเดลจริงหรือไม่",
      ],
    },
    {
      id: "rag-diagnostic-mindset",
      title: "3 · วิธีคิดแบบ Diagnostic: ไล่ตรวจจากหลักฐานทีละชั้น (Inspect Chunks First)",
      paragraphs: [
        "เมื่อระบบ {{rag}} ตอบผิด ให้ไล่ตรวจเป็นลำดับเหมือนหมอตรวจคนไข้ แทนที่จะสุ่มแก้ prompt ไปเรื่อย ๆ โดยเริ่มจากคำถาม 3 ข้อตามลำดับท่อข้อมูล:",
        "**ขั้นที่ 1 (ตรวจ Source & Chunk)**: เอกสารต้นฉบับมีคำตอบที่ถูกต้องและเป็นเวอร์ชันล่าสุดหรือไม่ และเมื่อถูกหั่นเป็น chunk แล้ว ข้อความยังอ่านรู้เรื่องครบหัวข้อ/หัวตารางหรือเปล่า? **ขั้นที่ 2 (ตรวจ Retrieval)**: ใน {{top-k}} chunks ที่ตัวค้นหาดึงขึ้นมา มี chunk คำตอบติดมาด้วยไหม? ถ้าไม่ติดเลย แปลว่าเป็น **Retrieval Miss** (ต้องแก้ดัชนีหรือเพิ่ม {{bm25}})",
        "**ขั้นที่ 3 (ตรวจ Generation)**: ถ้า chunk คำตอบที่ถูกต้องและสดใหม่ติดอยู่ใน {{top-k}} แล้ว แต่โมเดลยังตอบผิด ขัดกับบริบท หรือแต่งเรื่องเพิ่มเมื่อไม่มีข้อมูล นั่นจึงจะเป็น **Generation Failure** ที่ต้องแก้ด้วย {{context-engineering}}, การบังคับอ้างอิง ({{groundedness}}) และกฎ {{abstention}}",
      ],
      analogy:
        "เหมือนตรวจซ่อมท่อน้ำไม่ไหลในบ้าน: ต้องเช็กก่อนว่าน้ำประปาเข้ามิเตอร์ไหม (Ingestion) → วาล์วเปิดส่งมาถึงห้องน้ำไหม (Retrieval) → ค่อยเปลี่ยนก๊อกน้ำปลายทาง (Generation) ไม่ใช่รื้อเปลี่ยนก๊อกทุกครั้งที่น้ำไม่ไหล",
      bullets: [
        "**บริบทคำตอบหายเพราะโดนตัดขาด/พาร์สพัง** → ซ่อมที่ชั้น `ingestion_chunking`",
        "**มี chunk ดีอยู่ในคลัง แต่ไม่ติด top-k** → ซ่อมที่ชั้น `retrieval` (เช่น เพิ่ม Hybrid BM25 + RRF)",
        "**ดึงเอกสารหมดอายุ/ข้ามเวอร์ชันขึ้นมา** → ซ่อมที่ชั้น `metadata_indexing` (filter `is_active` / `updated_at`)",
        "**บริบทถูกต้องครบถ้วน หรือว่างเปล่า แต่โมเดลเดาคำตอบมั่ว** → ซ่อมที่ชั้น `generation` (citation + abstention)",
      ],
      whyTitle: "Why this matters — เป็นรากฐานของ Eval-Driven RAG ใน Phase 5",
      whyParagraphs: [
        "แนวคิดการแยกความผิดพลาดออกเป็น Ingestion, Retrieval และ Generation นี้ตรงกับ **RAG Triad** (`Context Recall`, `Context Precision`, `Faithfulness`) ที่คุณจะใช้วัดผลอัตโนมัติด้วย `Ragas` ใน Phase 5",
        "การฝึกดู `retrieved_chunks` เป็นนิสัยตั้งแต่วันแรกจะช่วยลดเวลาดีบั๊กระบบ RAG จริงได้มากกว่าครึ่ง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Naive RAG เทียบกับระบบ Search + Template Rendering",
      body: [
        "ถ้าคุณเคยทำแอปเว็บที่ดึงข้อมูลจาก Database แล้วส่งเข้า UI Template ให้แสดงผล — ท่อ RAG มีความรับผิดชอบแยกชั้นคล้ายกันมาก:",
      ],
      table: [
        ["Document Parsing & Chunking", "ETL / Data Migration ที่แปลงไฟล์ดิบเข้าตารางสะอาด"],
        ["Vector + BM25 Retriever", "SQL / Elasticsearch Query ที่ดึงแถวที่ตรงเงื่อนไข"],
        ["Metadata Filter (updated_at / tenant)", "WHERE status = 'active' AND tenant_id = ?"],
        ["LLM Grounded Prompt + Citations", "View Layer ที่เรนเดอร์คำตอบจากข้อมูลจริงเท่านั้น"],
      ],
    },
    student: {
      title: "First-Year Note — Offline Indexing กับ Online Query ต่างกันอย่างไร",
      body: [
        "มือใหม่หลายคนเข้าใจผิดว่าทุกครั้งที่ผู้ใช้พิมพ์ถาม 1 ครั้ง ระบบต้องไปเปิดอ่านไฟล์ PDF ใหม่ทั้งหมดแล้วหั่นข้อความใหม่ — แบบนั้นจะช้ามาก!",
        "ในระบบจริงเราทำ **Offline Indexing** ล่วงหน้า (อ่านไฟล์ → ล้าง → หั่น chunk → เก็บดัชนี) เตรียมไว้ก่อน พอผู้ใช้พิมพ์ถามเข้ามา (**Online Query**) ระบบแค่แปลงคำถามสั้น ๆ แล้วไปค้นจากดัชนีที่เตรียมไว้ จึงตอบได้ภายในไม่กี่ร้อยมิลลิวินาที",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจำลอง Naive RAG ขนาดเล็กบนเอกสารนโยบายและตารางราคาภาษาไทย 3 ชิ้น เพื่อดูกับตาว่า Naive Fixed-Char Chunking + Vector-only Retrieval พังอย่างไรใน 3 เคสจริง",
    steps: [
      {
        title: "1 · จำลอง Naive Fixed-Char Splitter ที่หั่นตารางราคาขาดครึ่ง",
        explain:
          "เมื่อเราหั่นเอกสาร Markdown ที่มีตารางราคาด้วยจำนวนตัวอักษรคงที่ (`chunk_size=90`) หัวตารางและชื่อแพ็กเกจจะหลุดออกจากแถวราคาทันที",
        code: {
          language: "python",
          filename: "worked_naive_rag.py",
          code: `doc_pricing = """# ตารางราคาแพ็กเกจรายเดือน (2026)
| แพ็กเกจ | ราคา/เดือน | โควตาข้อความ |
| --- | --- | --- |
| Starter | 490 บาท | 5,000 ข้อความ |
| Pro | 1,490 บาท | 50,000 ข้อความ |
"""


def naive_char_split(text: str, size: int = 90) -> list[str]:
    return [text[i : i + size] for i in range(0, len(text), size)]


chunks = naive_char_split(doc_pricing, size=90)
for idx, ch in enumerate(chunks, start=1):
    print(f"--- Chunk {idx} ({len(ch)} chars) ---")
    print(ch.strip())`,
        },
        output: `--- Chunk 1 (90 chars) ---
# ตารางราคาแพ็กเกจรายเดือน (2026)
| แพ็กเกจ | ราคา/เดือน | โควตาข้อความ |
| --- | --- | ---
--- Chunk 2 (90 chars) ---
|
| Starter | 490 บาท | 5,000 ข้อความ |
| Pro | 1,490 บาท | 50,000 ข้อความ |`,
      },
      {
        title: "2 · ตรวจจับอาการพังของ Chunk และเอกสารเก่าชนเอกสารใหม่",
        explain:
          "เขียนฟังก์ชันตรวจสอบอย่างง่ายเพื่อเช็กว่า chunk ที่ดึงมาเป็นแถวตารางกำพร้า (มี `|` แต่ไม่มีหัวตาราง `---`) หรือมีเอกสารคนละปีปนกันใน `top_k`",
        code: {
          language: "python",
          filename: "worked_naive_rag.py",
          code: `def is_broken_table_chunk(chunk: str) -> bool:
    lines = [ln.strip() for ln in chunk.splitlines() if ln.strip()]
    pipe_lines = [ln for ln in lines if ln.startswith("|") and ln.endswith("|")]
    has_separator = any("---" in ln for ln in pipe_lines)
    return len(pipe_lines) > 0 and not has_separator


retrieved_docs = [
    {"doc_id": "refund-2024", "updated_year": 2024, "is_active": False, "text": "คืนเงินได้ภายใน 14 วัน"},
    {"doc_id": "refund-2026", "updated_year": 2026, "is_active": True, "text": "คืนเงินได้ภายใน 7 วัน"},
]

print("Chunk 2 broken table?:", is_broken_table_chunk(chunks[1]))
has_stale_doc = any(not d["is_active"] for d in retrieved_docs)
print("Contains stale doc?  :", has_stale_doc)`,
        },
        output: `Chunk 2 broken table?: True
Contains stale doc?  : True`,
      },
      {
        title: "3 · ตรวจการขาด Citation และการไม่ยอม Abstain",
        explain:
          "หากคำตอบของ LLM ไม่มี citation ในรูปแบบ `[doc_id#chunk]` หรือบริบทที่ดึงมาว่างเปล่าแต่โมเดลกลับตอบตัวเลขมั่นใจ นี่คือสัญญาณชัดเจนของ Generation Failure",
        code: {
          language: "python",
          filename: "worked_naive_rag.py",
          code: `import re

CITATION_RE = re.compile(r"\\[[a-zA-Z0-9_-]+#c\\d+\\]")


def check_groundedness(answer: str, retrieved_chunks: list[str]) -> str:
    if not retrieved_chunks and "ไม่พบข้อมูล" not in answer:
        return "ungrounded_hallucination (should abstain)"
    if retrieved_chunks and not CITATION_RE.search(answer):
        return "missing_citation"
    return "ok"


print("Case A (empty ctx):", check_groundedness("ลูกค้า VIP ได้ส่วนลด 25%", []))
print("Case B (no cite)  :", check_groundedness("คืนเงินได้ภายใน 7 วัน", ["คืนเงินได้ภายใน 7 วัน"]))
print("Case C (grounded) :", check_groundedness("คืนเงินได้ภายใน 7 วัน [refund-2026#c1]", ["คืนเงินได้ภายใน 7 วัน"]))`,
        },
        output: `Case A (empty ctx): ungrounded_hallucination (should abstain)
Case B (no cite)  : missing_citation
Case C (grounded) : ok`,
      },
    ],
    gotcha:
      "จุดสังเกต: ในขั้นตอนที่ 1 ถึงแม้ Chunk 2 จะมีข้อความ `Pro | 1,490 บาท | 50,000 ข้อความ` แต่ไม่มีชื่อคอลัมน์และไม่มีหัวข้อ `ปี 2026` ติดมาด้วย หากคลังมีตารางราคาปี 2024 และ 2026 ปนกัน โมเดลจะแยกไม่ออกเลยว่าแถวราคานี้เป็นของปีไหนหรือคอลัมน์ใด",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างเครื่องมือวินิจฉัย `diagnose_rag_trace` ด้วย `Pydantic v2` เพื่อรับข้อมูล Trace ของระบบ Naive RAG 1 เคส แล้วระบุสาเหตุหลัก (`failure_type`) และชั้นวิศวกรรมที่ต้องแก้ (`fix_layer`) ตามลำดับความสำคัญของท่อข้อมูล",
    requirements: [
      "สร้าง `RetrievedChunk(BaseModel)` เก็บ `doc_id: str`, `chunk_id: str`, `text: str`, `is_active: bool = True` และ `RagTrace(BaseModel)` เก็บ `query: str`, `expected_doc_id: str | None`, `required_exact_token: str | None = None`, `retrieved: list[RetrievedChunk]`, `answer: str`",
      "สร้าง `DiagnosisReport(BaseModel)` เก็บ `failure_type: Literal[\"ok\", \"broken_structure\", \"stale_conflict\", \"exact_id_miss\", \"ungrounded_answer\"]` และ `fix_layer: Literal[\"none\", \"ingestion_chunking\", \"metadata_indexing\", \"retrieval\", \"generation\"]` พร้อม `reason: str`",
      "ลำดับการวินิจฉัยใน `diagnose_rag_trace(trace: RagTrace) -> DiagnosisReport` ต้องตรวจตามลำดับท่อข้อมูลจากต้นทางไปปลายทาง: (1) **`broken_structure`** หาก chunk ใดใน `retrieved` มีบรรทัดตาราง Markdown (`|` หัวท้าย) แต่ไม่มีเส้นคั่นหัวตาราง (`---`) → `fix_layer=\"ingestion_chunking\"`",
      "(2) **`stale_conflict`** หากมี chunk ใน `retrieved` ที่ `is_active is False` → `fix_layer=\"metadata_indexing\"`; (3) **`exact_id_miss`** หาก `required_exact_token` ถูกกำหนด (ไม่เป็น `None`) และไม่มี chunk ใดใน `retrieved` ที่มี token นั้น (case-insensitive) หรือ `expected_doc_id` ไม่ติดใน `retrieved` เมื่อมี `required_exact_token` → `fix_layer=\"retrieval\"`",
      "(4) **`ungrounded_answer`** หาก `retrieved` ว่างเปล่าแต่ `answer` ไม่มีคำว่า `\"ไม่พบข้อมูล\"` หรือเมื่อ `retrieved` ไม่ว่างแต่ `answer` ไม่มี citation รูปแบบ `[doc_id#chunk_id]` → `fix_layer=\"generation\"`; หากผ่านทั้งหมดให้คืน `failure_type=\"ok\"`, `fix_layer=\"none\"`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day093.py",
      code: `from __future__ import annotations
import re
from typing import Literal
from pydantic import BaseModel

CITATION_RE = re.compile(r"\\[[a-zA-Z0-9_-]+#[a-zA-Z0-9_-]+\\]")


class RetrievedChunk(BaseModel):
    doc_id: str
    chunk_id: str
    text: str
    is_active: bool = True


class RagTrace(BaseModel):
    query: str
    expected_doc_id: str | None = None
    required_exact_token: str | None = None
    retrieved: list[RetrievedChunk]
    answer: str


class DiagnosisReport(BaseModel):
    failure_type: Literal[
        "ok",
        "broken_structure",
        "stale_conflict",
        "exact_id_miss",
        "ungrounded_answer",
    ]
    fix_layer: Literal[
        "none",
        "ingestion_chunking",
        "metadata_indexing",
        "retrieval",
        "generation",
    ]
    reason: str


def has_broken_table(text: str) -> bool:
    """คืน True เมื่อข้อความมีแถวตาราง Markdown แต่ไม่มีเส้นคั่นหัวตาราง '---'"""
    # TODO: ตรวจบรรทัดที่ขึ้นต้นและลงท้ายด้วย '|'
    raise NotImplementedError


def diagnose_rag_trace(trace: RagTrace) -> DiagnosisReport:
    """วินิจฉัยจุดพังของ Naive RAG ตามลำดับต้นทาง -> ปลายทาง"""
    # TODO: 1) broken_structure -> ingestion_chunking
    # TODO: 2) stale_conflict -> metadata_indexing
    # TODO: 3) exact_id_miss -> retrieval
    # TODO: 4) ungrounded_answer -> generation
    # TODO: 5) ok -> none
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day093.py",
      code: `from exercise_day093 import RagTrace, RetrievedChunk, diagnose_rag_trace


def test_detects_broken_table_chunk():
    trace = RagTrace(
        query="แพ็กเกจ Pro ราคาเท่าไร",
        expected_doc_id="pricing-2026",
        retrieved=[
            RetrievedChunk(
                doc_id="pricing-2026",
                chunk_id="c2",
                text="| Pro | 1,490 บาท | 50,000 ข้อความ |",
            )
        ],
        answer="แพ็กเกจ Pro ราคา 1,490 บาท [pricing-2026#c2]",
    )
    report = diagnose_rag_trace(trace)
    assert report.failure_type == "broken_structure"
    assert report.fix_layer == "ingestion_chunking"


def test_detects_stale_doc_conflict():
    trace = RagTrace(
        query="คืนเงินได้ภายในกี่วัน",
        expected_doc_id="refund-2026",
        retrieved=[
            RetrievedChunk(
                doc_id="refund-2024",
                chunk_id="c1",
                text="นโยบายปี 2024: คืนเงินภายใน 14 วัน",
                is_active=False,
            ),
            RetrievedChunk(
                doc_id="refund-2026",
                chunk_id="c1",
                text="นโยบายปี 2026: คืนเงินภายใน 7 วัน",
                is_active=True,
            ),
        ],
        answer="คืนเงินได้ภายใน 14 วัน [refund-2024#c1]",
    )
    report = diagnose_rag_trace(trace)
    assert report.failure_type == "stale_conflict"
    assert report.fix_layer == "metadata_indexing"


def test_detects_exact_id_miss_in_thai_code_switching():
    trace = RagTrace(
        query="เช็กสถานะ #INV-2026-009 หน่อย",
        expected_doc_id="inv-009",
        required_exact_token="#INV-2026-009",
        retrieved=[
            RetrievedChunk(
                doc_id="inv-019",
                chunk_id="c1",
                text="ใบแจ้งหนี้ #INV-2026-019 สถานะชำระแล้ว",
            )
        ],
        answer="ไม่พบข้อมูล #INV-2026-009",
    )
    report = diagnose_rag_trace(trace)
    assert report.failure_type == "exact_id_miss"
    assert report.fix_layer == "retrieval"


def test_detects_ungrounded_answer_when_empty_or_missing_citation():
    hallucinated = RagTrace(
        query="มีส่วนลด VIP ไหม",
        retrieved=[],
        answer="ลูกค้า VIP ได้รับส่วนลด 25% ทันที",
    )
    rep1 = diagnose_rag_trace(hallucinated)
    assert rep1.failure_type == "ungrounded_answer"
    assert rep1.fix_layer == "generation"

    no_cite = RagTrace(
        query="คืนเงินได้กี่วัน",
        retrieved=[
            RetrievedChunk(doc_id="refund-2026", chunk_id="c1", text="คืนเงินได้ภายใน 7 วัน")
        ],
        answer="คืนเงินได้ภายใน 7 วัน",
    )
    rep2 = diagnose_rag_trace(no_cite)
    assert rep2.failure_type == "ungrounded_answer"
    assert rep2.fix_layer == "generation"


def test_healthy_grounded_rag_trace_passes():
    valid_table = (
        "| แพ็กเกจ | ราคา |\n"
        "| --- | --- |\n"
        "| Pro | 1,490 บาท |"
    )
    trace = RagTrace(
        query="แพ็กเกจ Pro ราคาเท่าไร",
        expected_doc_id="pricing-2026",
        required_exact_token="Pro",
        retrieved=[
            RetrievedChunk(doc_id="pricing-2026", chunk_id="c1", text=valid_table, is_active=True)
        ],
        answer="แพ็กเกจ Pro ราคา 1,490 บาท [pricing-2026#c1]",
    )
    report = diagnose_rag_trace(trace)
    assert report.failure_type == "ok"
    assert report.fix_layer == "none"
`,
    },
    selfCheck: [
      "`has_broken_table` คืน `False` สำหรับข้อความธรรมดาที่ไม่มีตาราง และคืน `False` เมื่อตารางมีเส้นคั่นหัวตาราง `---` ครบ",
      "การตรวจเรียงลำดับต้นทางไปปลายทาง: `broken_structure` → `stale_conflict` → `exact_id_miss` → `ungrounded_answer` → `ok`",
      "กรณี `required_exact_token` ตรวจแบบ case-insensitive และเช็กด้วยว่า `expected_doc_id` (หากระบุ) ติดอยู่ใน `retrieved`",
      "กรณี `retrieved` ว่างเปล่าและ `answer` มีคำว่า `\"ไม่พบข้อมูล\"` (abstention) จะผ่านเป็น `ok`",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .` โดยไม่ต่อ API ภายนอก",
    hints: [
      {
        body: "ใน `has_broken_table(text)` ให้แยกบรรทัดด้วย `text.splitlines()` แล้ว `strip()` จากนั้นกรองเฉพาะบรรทัดที่ `line.startswith('|') and line.endswith('|')` — ถ้ามีอย่างน้อย 1 บรรทัดแต่ไม่มีบรรทัดไหนมี `'---'` ให้คืน `True`",
      },
      {
        body: "ใน `diagnose_rag_trace` ให้ใช้ early return ตามลำดับ 4 ด่าน เพื่อป้องกันไม่ให้อาการปลายทางไปกลบต้นตอที่แท้จริงจากต้นทาง",
      },
      {
        body: "โครงฟังก์ชันเกือบสมบูรณ์ — เหลือเติมด่านที่ 3 (`exact_id_miss`) และด่านที่ 4 (`ungrounded_answer`) แล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_day093.py",
          code: `def has_broken_table(text: str) -> bool:
    pipe_lines = [
        ln.strip()
        for ln in text.splitlines()
        if ln.strip().startswith("|") and ln.strip().endswith("|")
    ]
    return bool(pipe_lines) and not any("---" in ln for ln in pipe_lines)


def diagnose_rag_trace(trace: RagTrace) -> DiagnosisReport:
    if any(has_broken_table(c.text) for c in trace.retrieved):
        return DiagnosisReport(
            failure_type="broken_structure",
            fix_layer="ingestion_chunking",
            reason="พบแถวตารางที่ขาดหัวตารางใน retrieved chunks",
        )
    if any(not c.is_active for c in trace.retrieved):
        return DiagnosisReport(
            failure_type="stale_conflict",
            fix_layer="metadata_indexing",
            reason="พบเอกสารที่หมดอายุ (is_active=False) ปนเข้ามาในผลค้นหา",
        )
    # TODO: ตรวจ exact_id_miss (required_exact_token และ expected_doc_id)
    # TODO: ตรวจ ungrounded_answer (abstention เมื่อ retrieved ว่าง / citation เมื่อไม่ว่าง)
    return DiagnosisReport(failure_type="ok", fix_layer="none", reason="ผ่านการตรวจสอบทุกชั้น")`,
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
      title: "เห็น RAG ตอบผิดแล้วรีบแก้ System Prompt หรือเปลี่ยนเป็นโมเดลแพงที่สุดทันที",
      symptom: "เสียเงินค่า API เพิ่มหลายเท่าและปรับ prompt ไป 10 รอบ แต่คำถามเกี่ยวกับตารางราคาหรือเลขที่เอกสารก็ยังตอบผิดเหมือนเดิม",
      fix: "เปิดดู `retrieved_chunks` ดิบก่อนเสมอ ถ้าข้อมูลที่ถูกไม่เคยติดเข้ามาใน {{top-k}} หรือถูกตัดขาดครึ่ง ให้แก้ที่ Ingestion/Chunking หรือ Retrieval แทน",
    },
    {
      title: "ทดสอบ Naive RAG ด้วยคำถามสวย ๆ แค่ 3 ข้อบนไฟล์ .txt สั้น ๆ",
      symptom: "ตอนเดโมในห้องประชุมทำงานดีมาก แต่พออัปโหลด PDF นโยบายไทยจริง 50 ไฟล์ ระบบตอบมั่วและหาเลขเอกสารไม่เจอ",
      fix: "ทดสอบด้วยเอกสารจริงที่มีตาราง PDF, ภาษาไทยปนอังกฤษ, รหัสเฉพาะ และเอกสารเวอร์ชันเก่าปนอยู่ด้วยตั้งแต่วันแรก",
    },
    {
      title: "ใส่ไฟล์เวอร์ชันใหม่เข้า Vector Store โดยไม่ลบหรือปิดสถานะเวอร์ชันเก่า",
      symptom: "ระบบดึงนโยบายปี 2024 และปี 2026 ขึ้นมาคู่กัน แล้วโมเดลเลือกตัวเลขผิดปีมาตอบลูกค้า",
      fix: "เก็บ `doc_id`, `updated_at` และ `is_active` ใน metadata พร้อมทำ incremental upsert/soft-delete ทุกครั้งที่เอกสารเปลี่ยน",
    },
    {
      title: "ปล่อยให้โมเดลตอบทุกคำถามโดยไม่มีกลไก Abstention และ Citation",
      symptom: "เมื่อคลังไม่มีคำตอบ โมเดลกลับใช้ความรู้ทั่วไปแต่งนโยบายบริษัทขึ้นมาเองอย่างน่าเชื่อถือ ({{hallucination}})",
      fix: "บังคับการตอบจากบริบทเท่านั้น พร้อมแนบ `[doc_id#chunk]` และกำหนดกฎ {{abstention}} ให้ตอบว่า \"ไม่พบข้อมูลในเอกสาร\" เมื่อไม่มีหลักฐาน",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d093-q1",
        "พนักงานถามระบบ RAG ว่า `\"แพ็กเกจ Pro ปี 2026 โควตากี่ข้อความ\"` เมื่อเปิดดู `retrieved_chunks` พบว่ามีแค่ข้อความ `\"| Pro | 1,490 บาท | 50,000 |\"` โดยไม่มีหัวตารางและไม่มีหัวข้อปี 2026 ปัญหานี้อยู่ที่ชั้นใด?",
        [
          ["ชั้น Generation — ต้องเพิ่ม temperature ของ LLM", "การปรับ temperature ไม่ช่วยให้หัวตารางที่หายไปกลับคืนมาได้"],
          [
            "ชั้น Ingestion & Chunking — การหั่นข้อความแบบหยาบทำลายโครงสร้างตารางและตัดหัวข้อขาดจากเนื้อหา",
            "ถูก — ต้องแก้ที่การพาร์สและการแบ่ง chunk แบบคงโครงสร้าง (Structural Chunking) พร้อมแนบหัวข้อกำกับ",
          ],
          ["ชั้น Embedding — ต้องเปลี่ยนมิติเวกเตอร์ให้เล็กลง", "ขนาดมิติเวกเตอร์ไม่ได้ช่วยซ่อมตารางที่ถูกตัดขาด"],
          ["ชั้น Network — ต้องเพิ่ม retry timeout", "ไม่ใช่ปัญหาเครือข่าย แต่เป็นปัญหาโครงสร้างข้อมูลต้นทาง"],
        ],
        "B",
        "อาการหัวตารางและหัวข้อหลุดจากแถวข้อมูลคือจุดตายคลาสสิกของ Naive Fixed-Char Chunking ต้องแก้ที่ชั้น Ingestion & Chunking (Day 94–95)",
        "เมื่อ retrieved chunk มีแค่แถวตัวเลขตารางโดยไม่มีหัวตารางหรือหัวข้อ ควรแก้ที่ชั้นใดของ RAG?",
        "ชั้น Ingestion & Chunking — ใช้ parser ที่คงตาราง Markdown และ structural chunker ที่แนบหัวข้อพ่อ (parent heading) และไม่ตัดกลางตาราง",
      ),
      mc(
        "d093-q2",
        "ทำไม Naive RAG ที่ใช้ Dense Vector Search เพียงอย่างเดียวมักพลาดคำถามไทยปนอังกฤษอย่าง `\"ขอใบกำกับภาษีออเดอร์ #INV-2026-009\"`?",
        [
          ["เพราะ Vector Database เก็บตัวเลขไม่ได้", "Vector Database เก็บข้อความที่มีตัวเลขได้ใน payload แต่เวกเตอร์ความหมายไม่แม่นกับการจับคู่รหัสตรงตัว"],
          [
            "เพราะ Dense Embedding เน้นความหมายภาพรวม จึงแยกรหัสเฉพาะที่คล้ายกันอย่าง `#INV-2026-009` กับ `#INV-2026-019` ไม่คมเท่าการค้นหาคำตรงตัวแบบ BM25",
            "ถูก — จึงต้องใช้ Hybrid Search (PyThaiNLP BM25 + Dense Vector + RRF) ในระบบ Production",
          ],
          ["เพราะภาษาไทยใช้กับ Embedding ไม่ได้", "Multilingual embeddings รองรับภาษาไทยได้ดี แต่ยังมีจุดอ่อนเรื่อง exact ID match"],
          ["เพราะคำถามสั้นเกินกว่าจะส่งเข้า LLM", "ปัญหาเกิดที่ชั้น Retriever ก่อนถึง LLM"],
        ],
        "B",
        "Dense Vector เก่งความหมายและคำพ้อง แต่จับรหัสเฉพาะตรงตัวได้ไม่คม — นี่คือเหตุผลที่ Production Thai RAG ต้องผสาน BM25 เข้ากับ Vector Search",
        "ทำไม Dense Vector อย่างเดียวจึงไม่พอสำหรับคำถามที่มีรหัสเอกสารหรือ SKU?",
        "Dense Vector จับความหมายภาพรวมได้ดี แต่แยกรหัสที่หน้าตาคล้ายกัน (เช่น #INV-2026-009 vs 019) ไม่คม ต้องใช้ BM25 ร่วมในแบบ Hybrid Search",
      ),
      mc(
        "d093-q3",
        "เมื่อผู้ใช้ถามคำถามที่ **ไม่มีคำตอบอยู่ในคลังเอกสารเลย** และ Retriever คืนรายการว่าง แต่ระบบ RAG กลับตอบตัวเลขเงื่อนไขบริษัทขึ้นมาอย่างมั่นใจ ปัญหานี้คืออะไรและควรแก้ที่ชั้นใด?",
        [
          ["Stale Conflict — แก้ที่ Metadata Filtering", "ไม่ใช่เอกสารเก่าชนกัน เพราะคลังไม่มีเอกสารเรื่องนั้นเลย"],
          ["Broken Table — แก้ที่ PDF Parser", "ไม่ได้เกิดจากตารางแตก"],
          [
            "Ungrounded Hallucination — แก้ที่ชั้น Generation ด้วยกฎ Abstention และบังคับ Inline Citations",
            "ถูก — ต้องสั่งให้โมเดลตอบเฉพาะจากบริบทพร้อมอ้างอิง `[doc_id#chunk]` และปฏิเสธการตอบ (abstain) เมื่อไม่มีหลักฐาน",
          ],
          ["Token Limit Error — แก้ด้วยการลด top_k เหลือ 1", "บริบทว่างอยู่แล้ว ไม่ใช่ปัญหา token ล้น"],
        ],
        "C",
        "เมื่อไม่มีบริบทสนับสนุน โมเดลที่ไม่ได้ถูกบังคับกฎ Groundedness & Abstention จะใช้ความรู้เดิมเดาคำตอบขึ้นมาเอง ซึ่งอันตรายมากในงานซัพพอร์ตและนโยบายองค์กร",
        "ระบบ RAG ควรทำอย่างไรเมื่อไม่พบหลักฐานรองรับคำถามใน retrieved chunks?",
        "ต้องทำ Abstention (ตอบว่าไม่พบข้อมูลในเอกสารที่อ้างอิงได้) แทนการเดาคำตอบ เพื่อป้องกัน ungrounded hallucination",
      ),
      mc(
        "d093-q4",
        "เมื่อระบบ RAG ตอบผิด ขั้นตอนแรกสุดที่วิศวกร AI ควรทำก่อนแก้ Prompt หรือเปลี่ยนโมเดลคือข้อใด?",
        [
          ["เพิ่มค่า temperature เป็น 1.0 เพื่อเพิ่มความหลากหลาย", "การเพิ่ม temperature ยิ่งทำให้คำตอบเพี้ยนและไม่คงที่มากขึ้น"],
          ["เปลี่ยนไปใช้โมเดล LLM ที่แพงที่สุดทันที", "ถ้าชั้น Ingestion หรือ Retrieval พัง โมเดลแพงที่สุดก็ยังตอบผิด"],
          [
            "เปิดตรวจสอบ `retrieved_chunks` ดิบว่ามีคำตอบที่ถูกต้อง ครบโครงสร้าง และเป็นเวอร์ชันล่าสุดติดเข้ามาใน top-k หรือไม่",
            "ถูก — การตรวจ `retrieved_chunks` ก่อนจะแยกได้ทันทีว่าเป็นปัญหาต้นทาง (Ingestion/Retrieval) หรือปลายทาง (Generation)",
          ],
          ["เพิ่มจำนวน top_k เป็น 100 chunks ทุกคำถาม", "การยัด 100 chunks เพิ่มต้นทุน ช้า และทำให้เกิด noise กลบคำตอบจริง"],
        ],
        "C",
        "Inspect Chunks First คือนิสัยสำคัญที่สุดของวิศวกร RAG เพราะช่วยแยก Ingestion/Retrieval failure ออกจาก Generation failure ได้ภายในไม่กี่วินาที",
        "ขั้นตอนแรกสุดในการดีบั๊กเมื่อระบบ RAG ตอบผิดคืออะไร?",
        "เปิดดู retrieved_chunks ดิบก่อน เพื่อเช็กว่าข้อมูลที่ถูกต้อง สดใหม่ และครบโครงสร้างติดเข้ามาใน top-k จริงหรือไม่",
      ),
    ],
  },

  takeaways: [
    "**Naive RAG** (`Load → Split → Embed → Retrieve → Prompt`) ใช้ได้ดีในเดโม แต่พังง่ายบนเอกสารองค์กรไทยจริง",
    "4 จุดตายหลักคือ **ตาราง/หัวข้อแตก**, **พลาดรหัสเฉพาะเพราะไร้ BM25**, **เอกสารเก่าชนเอกสารใหม่**, และ **คำตอบมั่วไร้ Citation/Abstention**",
    "ยึดกฎ **Inspect Chunks First**: แยกปัญหาให้ออกระหว่าง `ingestion_chunking`, `metadata_indexing`, `retrieval` และ `generation` ก่อนลงมือแก้",
    "วันพรุ่งนี้ (Day 94) เราจะเริ่มซ่อมตั้งแต่ต้นน้ำด้วย Document Ingestion & Parsing สำหรับ Markdown, HTML และ Thai PDF",
  ],

  reviewCards: [
    rc(
      "d093-rc-1",
      "สรุป 4 จุดตายหลักของ Naive RAG บนเอกสารองค์กรไทย",
      "1) ตาราง/หัวข้อแตกจาก parser+fixed split, 2) พลาดรหัสเฉพาะ/ไทยปนอังกฤษเพราะไม่มี BM25, 3) เอกสารเก่าชนใหม่เพราะไร้ metadata freshness, 4) คำตอบมั่วไม่มี citation และไม่ยอม abstain",
    ),
    rc(
      "d093-rc-2",
      "แยกความแตกต่างระหว่าง Offline Indexing กับ Online Query ในระบบ RAG",
      "Offline Indexing ทำล่วงหน้า (Load → Clean → Chunk → Embed → Store) เมื่อเอกสารเปลี่ยน ส่วน Online Query ทำตอนผู้ใช้ถาม (Query → Retrieve → Rerank → Grounded Answer)",
    ),
    rc(
      "d093-rc-3",
      "ทำไมเมื่อระบบ RAG ตอบผิดจึงต้องตรวจ `retrieved_chunks` ก่อนแก้ Prompt?",
      "เพื่อแยกให้ชัดว่าปัญหาอยู่ที่ต้นทาง (chunk แตก / เอกสารเก่า / retrieval พลาด) หรือปลายทาง (โมเดลได้บริบทถูกแล้วแต่ยังมั่ว) จะได้แก้ถูกชั้นไม่เสียเวลา",
    ),
  ],

  sources: [
    { label: "Anthropic — Contextual Retrieval (Why Naive RAG Loses Context)", href: "https://www.anthropic.com/news/contextual-retrieval" },
    { label: "LlamaIndex Documentation — Production RAG Concepts", href: "https://docs.llamaindex.ai/en/stable/getting_started/concepts/" },
    { label: "Pydantic v2 Documentation — Models & Validation", href: "https://docs.pydantic.dev/latest/concepts/models/" },
    { label: "Eugene Yan — Patterns for Building LLM-based Systems & Products", href: "https://eugeneyan.com/writing/llm-patterns/" },
  ],

  glossary: ["rag", "chunking", "embedding", "bm25", "hallucination", "groundedness", "abstention", "top-k"],
});
