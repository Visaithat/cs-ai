import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D092 — Phase 3 / Block B23 (Checkpoint Day)
 * Checkpoint: Phase 3 Demo (Compare ML Baseline vs LLM Extractor)
 */
export const d092: Lesson = defineLesson({
  day: 92,
  titleTh: "Checkpoint Phase 3: เดโมระบบเทียบ ML Baseline vs LLM Extractor และควิซรวม B16–B23",
  tagline:
    "30 นาที · รันบนเครื่องได้ 100% ไม่ต้องใช้ API key · ปิด Portfolio Milestone #3 เทียบหมัดต่อหมัดกับ Phase 2 ML Baseline และเปิดประตูสู่ Phase 4 (Hybrid RAG & Agents)",
  icon: "award",
  visual: {
    id: "phase3-extractor-arch",
    title: "Phase 3 Checkpoint — เทียบ Phase 2 ML Baseline vs Phase 3 LLM Extractor",
    caption:
      "สรุปผลเปรียบเทียบความแม่นยำ ความเร็ว และต้นทุนต่อ 1,000 เอกสาร พร้อมความพร้อมก่อนก้าวสู่ Phase 4 (Hybrid RAG & Agents)",
    alt: "แผนภาพ Phase 3 Checkpoint เปรียบเทียบ ML Baseline กับ LLM Extractor",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องได้ 100% ด้วยข้อมูลผลทดสอบและโหมด mock ไม่ต้องใช้ API key",
  tools: [
    "PyTorch",
    "tiktoken",
    "Sentence-Transformers",
    "Pydantic v2",
    "Ollama",
    "PyYAML",
    "pytest",
    "Ruff",
  ],

  bigPicture: [
    {
      node: 0,
      heading: "ตัดสินใจเลือกสถาปัตยกรรมด้วยข้อมูลจริง: ML Baseline vs LLM vs Hybrid",
      body: "จุดเด่นของ AI Engineer ที่ผ่านครบทั้ง Phase 2 และ Phase 3 คือไม่ยึดติดกับเครื่องมือเดียว แต่เทียบ **Classical ML (`<5ms`, แทบฟรี)**, **Frontier LLM (แม่นยำและสกัดฟิลด์ซับซ้อนได้)** และ **Hybrid Routing** ด้วยตัวเลขจริงบนชุดเอกสารไทยเดียวกัน",
      lessonNote:
        "วันนี้คุณสร้างตารางเปรียบเทียบหมัดต่อหมัดของ 3 สถาปัตยกรรมสำหรับ Portfolio Milestone #3 Demo",
    },
    {
      node: 2,
      heading: "ปิดรอบ Portfolio Milestone #3: Typed Thai Document Classifier & Extractor",
      body: "ตลอด 32 วันของ Phase 3 (Days 61–92) คุณก้าวจาก PyTorch Autograd, Transformer/BPE, Dense Embeddings มาสู่ระบบสกัดเอกสารไทยที่มี {{structured-output}}, Validation-Repair, {{prompt-caching}}, Model Routing, Local Ollama และ {{prompt-versioning}}",
      lessonNote:
        "เราจะตรวจเช็กผลงานครบทั้ง 6 เกณฑ์ด้วย **Phase 3 Readiness Auditor** ก่อนติดแท็ก `v0.3.0`",
    },
    {
      node: 3,
      heading: "ทบทวนเชิงบูรณาการ (Cumulative Quiz B16–B23) ยืนยันความพร้อมก่อนขึ้น Phase 4",
      body: "ก่อนต่อยอดไปสร้างระบบค้นหาเอกสารและ Agent ใน Phase 4 ความเข้าใจเรื่อง {{bpe-tokenizer}}, {{quantization}}, {{lora}}, Strict Schema และต้นทุน 3 แกนต้องแน่นโดยไม่ต้องเปิดโพย",
      lessonNote:
        "ทำ Cumulative Quiz รวม B16–B23 (4 ข้อ) และสร้างรายงานเปรียบเทียบพร้อมเดโมใน 3 นาที",
    },
    {
      node: 5,
      heading: "เปิดประตูสู่ Phase 4: จาก Single-Document Extractor สู่ Thai Hybrid RAG & Agents",
      body: "เมื่อข้อมูลคำตอบไม่ได้อยู่ในเอกสารใบเดียวแต่อยู่กระจายในคู่มือนโยบาย 500 ไฟล์และฐานข้อมูลออเดอร์ ระบบต้องก้าวสู่ {{rag}}, Hybrid Search (BM25 + Vector + Rerank), {{mcp}} และ {{langgraph}}",
      lessonNote:
        "ทุกชิ้นส่วนของ Phase 3 (Embeddings, Structured Output, Caching, Prompt Versioning) จะถูกนำไปประกอบเป็นแกนกลางของ Phase 4 ตั้งแต่วันพรุ่งนี้ (Day 93)!",
    },
  ],

  objectives: [
    "**ตรวจสอบความพร้อมของ Phase 3 Portfolio Milestone (`Typed Thai Document Classifier & Extractor`)** ครบทั้ง 6 เกณฑ์วิศวกรรม: Strict Schema & Repair, Thai Edge-Case Guards, 3-Axis Benchmark, Prompt Versioning (`sha256`), Cost Budget และ Offline Test Suite",
    "**เปรียบเทียบแบบหมัดต่อหมัด** ระหว่าง **Phase 2 Classical ML Baseline**, **Phase 3 Frontier LLM Only** และ **Hybrid ML+LLM Extractor** บนแกน Macro-F1, Field Extraction, P50/P95 Latency และ Cost/1k Docs (USD & THB)",
    "**ประเมินความเข้าใจรวม Block B16–B23** ผ่าน Cumulative Quiz และเชื่อมภาพสถาปัตยกรรมไปสู่ **Phase 4 (Thai Hybrid RAG, MCP & LangGraph)**",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน Block B16–B23 (PyTorch, Transformers/BPE, Embeddings, LLM APIs, Structured Outputs, Ollama, LoRA Decision & Versioned Prompts)",
    "มีตัวเลขผลลัพธ์ Phase 2 ML Baseline (Day 60) และ Phase 3 Benchmark (Day 90) หรือใช้ชุดข้อมูลจำลองในบทนี้",
    "ติดตั้ง `pydantic`, `pytest`, `ruff` ผ่าน `uv` แล้ว — รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "เปิดโฟลเดอร์โปรเจกต์ `Typed Thai Document Classifier & Extractor` ของคุณ (หรือสร้างโฟลเดอร์ Checkpoint Day 92) เพื่อรัน Quality Gate ครบชุดและสร้างรายงานเปรียบเทียบสำหรับเดโม 3 นาที",
    commands: `# 1) รัน Quality Gate ครบชุดของ Phase 3 Portfolio Milestone
uv sync --frozen
uv run ruff check .
uv run pytest -v

# 2) (กรณีเริ่มโฟลเดอร์แยกสำหรับแบบฝึกหัด Checkpoint Day 92)
# uv init ai-day92 && cd ai-day92 && uv add pydantic && uv add --dev pytest ruff`,
    steps: [
      ["sync", "ตรวจ `uv sync --frozen` และยืนยันว่าไม่มี API key หรือไฟล์ข้อมูลลูกค้าหลุดเข้า Git"],
      ["gate", "รัน `uv run ruff check .` และ `uv run pytest -v` ผ่านครบทั้ง Edge Cases, Eval Benchmark และ Prompt Registry"],
      ["demo", "เตรียมตัวเลขเปรียบเทียบ Phase 2 ML Baseline vs Phase 3 LLM/Hybrid สำหรับสร้าง Demo Report"],
    ],
    note: "จังหวะ 30 นาทีของวัน Checkpoint: ทำ Cumulative Quiz B16–B23 (10 นาที) → เขียนสคริปต์ Phase 3 Readiness Audit + Comparison Report และซ้อมเดโม 3 นาที (15 นาที) → ทบทวน Error Log ก่อนเริ่ม Phase 4 (5 นาที)",
  },

  concepts: [
    {
      id: "phase3-milestone-six-gates",
      title: "1 · เช็กลิสต์ 6 ด้านของ Phase 3 Portfolio Milestone (`Typed Thai Document Classifier & Extractor`)",
      paragraphs: [
        "ก่อนปิดบท Phase 3 และติดแท็ก `v0.3.0` บน GitHub ให้ตรวจผลงานด้วย **Phase 3 Readiness Checklist 6 ด้าน** เพื่อให้มั่นใจว่านี่คือระบบ LLM ระดับวิศวกรรมจริง ไม่ใช่แค่สคริปต์เรียก API แปะ prompt ไว้ในโค้ด:",
        "แต่ละเกณฑ์สะท้อนแก่นของ Block B16–B23 ครบถ้วน ตั้งแต่ความน่าเชื่อถือของ {{structured-output}} + Repair/Fallback, การล้างและป้องกันข้อความไทยสกปรก, การวัดผล 3 แกนจริงจาก token ภาษาไทย, การทำ {{prompt-versioning}} พร้อม SHA-256, การคุมต้นทุนด้วย {{prompt-caching}}/Routing/Local Ollama, ไปจนถึงชุด `pytest` ที่รันออฟไลน์ได้ 100%",
      ],
      analogy:
        "เหมือนการตรวจรับเครื่องบินก่อนบินพาณิชย์: ต้องตรวจครบทั้งโครงสร้างตัวถัง (Strict Schema), ระบบกันสภาพอากาศแปรปรวน (Thai Edge Cases), มาตรวัดเชื้อเพลิง (3-Axis Cost/Latency), กล่องดำบันทึกการบิน (Prompt Version + SHA-256) และการทดสอบในซิมูเลเตอร์ (Offline pytest)",
      bullets: [
        "**1. Strict Schema & Validation-Repair (B20)** — `ConfigDict(extra=\"forbid\")`, ช่อง `| None` ลด hallucination, `@model_validator` เช็กกฎธุรกิจ และ `schema_pass_rate >= 0.99`",
        "**2. Thai Edge-Case Resilience (B19, B23)** — Pre-normalizer (NFC, ลบ Zero-Width, เลขไทย, ยุบเฉพาะตัวอักษรไทย) + Targeted Few-Shot + Short-Circuit `needs_review`",
        "**3. Versioned Prompts & Audit Trail (B23)** — แยกพรอมต์เป็นไฟล์ YAML/TXT, strict variable check และบันทึก `prompt_version` + `sha256[:8]` ลงทุกผลลัพธ์",
        "**4. 3-Axis Benchmark Report (B17, B23)** — รายงาน Macro-F1 (`>= 0.88`), Field Exact Accuracy, P50/P95 Latency และ USD/THB per 1,000 docs จากจำนวน Thai tokens จริง",
        "**5. Cost & Privacy Architecture (B20–B22)** — ใช้ {{prompt-caching}} + Model Routing (Small/Frontier) หรือ Local Ollama ({{quantization}} GGUF) คุมต้นทุน `<= $0.60 / 1k docs`",
        "**6. Reproducible Offline Tests (B20, B23)** — ชุด `pytest` ผ่าน 100% แบบไม่ต้องยิง API จริง และ `ruff check .` สะอาด",
      ],
      whyTitle: "Why this matters — พอร์ตโฟลิโอชิ้นที่ 3 ที่แยก AI Engineer ออกจาก Prompt Wrapper",
      whyParagraphs: [
        "ใคร ๆ ก็เขียนโค้ด 10 บรรทัดยิง OpenAI API ได้ แต่มีไม่กี่คนที่แสดงให้ผู้สัมภาษณ์เห็นได้ว่า \"ผมวัด Macro-F1, P95 และ Cost/1k Thai Docs แล้ว ลดต้นทุนลง 79% ด้วย Hybrid Routing + Prompt Caching และทุกผลลัพธ์ย้อนรอยกลับไปถึงไฟล์พรอมต์และ SHA-256 ได้\"",
        "นี่คือผลงานชิ้นเอกของ Phase 3 ที่พร้อมแสดงทั้งบน GitHub README และเดโมสดใน 3 นาที",
      ],
    },
    {
      id: "head-to-head-ml-vs-llm-vs-hybrid",
      title: "2 · เทียบหมัดต่อหมัด: Phase 2 Classical ML Baseline vs Phase 3 LLM Extractor vs Hybrid",
      paragraphs: [
        "คำถามสำคัญที่สุดของวันนี้คือ *\"เมื่อเทียบกับ Phase 2 Classical ML Baseline (PyThaiNLP + TF-IDF + LogisticRegression/LightGBM) ตัว LLM Extractor ของ Phase 3 ดีกว่าตรงไหน และแพงกว่าแค่ไหน?\"* คำตอบที่คมที่สุดคือการแยกงานเป็น 2 มิติ: **การจัดหมวดหมู่ (Classification)** กับ **การสกัดฟิลด์ซับซ้อน (Structured Field Extraction)**",
        "สำหรับงานจัดหมวดหมู่ล้วน ๆ Classical ML ทำความเร็วได้ระดับ **`~2 ms` P95** ด้วยต้นทุนแทบศูนย์ (`~$0.0001 / 1k docs`) และรันออฟไลน์ได้ 100% แต่ Classical ML **ไม่สามารถสกัดฟิลด์ซ้อน** (เช่น ชื่อรายการสินค้า + เลขใบแจ้งหนี้ + สรุปภาษาไทย + เหตุผล) หรือเข้าใจคำสแลง/ไทยปนอังกฤษที่ไม่เคยอยู่ใน training set ได้ดีเท่า LLM",
        "ในขณะที่ **Frontier LLM Only** ได้ Macro-F1 สูงสุด (`~0.94`) และสกัดฟิลด์แม่น (`~0.93`) แต่มี P95 สูงถึง **`~1,150 ms`** และแพงราว **`~$2.40 / 1k docs` (~84 บาท/พันเอกสาร)** — คำตอบที่ชนะในระบบจริงคือ **Hybrid ML + Routed/Cached LLM**: ให้ Classical ML + Pre-cleaner คัดกรองเคสชัดเจนและ short-circuit อีโมจิล้วนก่อน, ให้ Small Model + {{prompt-caching}} สกัดเคสส่วนใหญ่ (~75%), และส่งเฉพาะเคสยาก/ความมั่นใจต่ำ (~15%) ขึ้น Frontier Model ผลคือได้ความแม่นยำใกล้เคียง Frontier (`~0.93`) แต่ **ลดต้นทุนลง ~75%–80%**!",
      ],
      analogy:
        "Phase 2 ML คือจักรยานยนต์ส่งด่วนในซอยที่เร็วและแทบไม่กินน้ำมัน, Frontier LLM คือรถบรรทุกคอนเทนเนอร์ที่ขนของซับซ้อนได้ทุกชนิดแต่แพงและช้า, ส่วน Hybrid คือศูนย์กระจายสินค้าที่เลือกรถให้ตรงกับขนาดพัสดุแต่ละกล่อง",
      code: {
        language: "text",
        filename: "PHASE3_COMPARISON_TABLE.md",
        code: `| Architecture | Macro-F1 | Field Exact | P50 / P95 (ms) | Cost / 1k Docs | PDPA / Offline |
|---|---:|---:|---:|---:|---|
| Phase 2: Classical ML Baseline | 0.86 | N/A (Classify only) | 1.2 / 2.4 ms | ~$0.0001 (0.004 ฿) | 100% Local |
| Phase 3: Frontier LLM Only | 0.94 | 0.93 | 980 / 1,280 ms | ~$2.40 (84.0 ฿) | Cloud API |
| Phase 3: Local Ollama (Q4_K_M) | 0.89 | 0.87 | 420 / 780 ms | ~$0.05* (1.8 ฿) | 100% Local |
| Phase 3: Hybrid ML + Routed/Cached | 0.93 | 0.92 | 210 / 1,120 ms | ~$0.48 (16.8 ฿, -80%) | Selective / Local Option |
(*ประมาณการค่า compute/GPU สำหรับ local self-hosted inference)`,
        caption:
          "ตารางเปรียบเทียบ 4 ทางเลือกสำหรับเอกสารไทย 1,000 ฉบับ — ชัดเจนทั้งคุณภาพ ความเร็ว ต้นทุน และข้อกำหนด PDPA",
      },
      whyTitle: "Why this matters — รู้ว่าเมื่อไร *ไม่* ต้องใช้ LLM และเมื่อไร *ไม่* ต้อง Fine-Tune",
      whyParagraphs: [
        "ตารางนี้พิสูจน์บทเรียนจาก Day 85 (Fine-Tune vs Prompt vs RAG) ด้วยตัวเลขจริง: ก่อนจะลงทุนเทรน {{lora}} หรือจ่ายค่า Frontier เต็มราคา การทำ Pre-Normalization + Few-Shot + Prompt Caching + Hybrid Routing แก้ปัญหาได้กว่า 90% ในเวลาและงบประมาณเพียงเศษเสี้ยว",
        "นอกจากนี้ ถ้าองค์กรมีข้อบังคับ PDPA เข้มงวดห้ามส่งข้อมูลออกนอกประเทศ ตัวเลือก **Local Ollama ({{quantization}})** ก็มีตัวเลขเปรียบเทียบพร้อมเสนอผู้บริหารทันที",
      ],
    },
    {
      id: "bridge-to-phase4-rag-mcp-agents",
      title: "3 · สะพานเชื่อมสู่ Phase 4: จาก Single-Doc Extractor สู่ Thai Hybrid RAG, MCP และ LangGraph",
      paragraphs: [
        "ยินดีด้วยที่คุณเดินทางจบ **Phase 3: Neural Nets, Embeddings & Core LLM** ครบทั้ง 32 วัน (และผ่านมาครึ่งทางของเส้นทาง 180 วันแล้ว)! วันนี้คุณเข้าใจตั้งแต่วิธีที่โมเดลคำนวณ gradient และ Self-Attention ไปจนถึงการสร้างระบบสกัดเอกสารภาษาไทยที่เสถียร วัดผลได้ และคุมต้นทุนได้จริง",
        "แต่ลองสังเกตข้อจำกัดหนึ่งของ Phase 3: งานสกัดเอกสารส่ง *เอกสาร 1 ฉบับ* เข้า prompt ได้โดยตรง — แล้วถ้าลูกค้าถามคำถามที่คำตอบซ่อนอยู่ในคู่มือนโยบาย PDF ภาษาไทย 300 หน้า หรือต้องไปเช็กสถานะออเดอร์สดจากฐานข้อมูลก่อนตอบล่ะ? นั่นคือโจทย์ของ **Phase 4 (Days 93–124: Thai Hybrid RAG, Tools, MCP & Agents)**",
        "ตั้งแต่วันพรุ่งนี้ (Day 93 — Block B24) คุณจะนำ Dense Embeddings (B18), Thai Tokenization/BM25 (Phase 2), และ Strict Structured Outputs (B20) มาต่อยอดเป็นระบบ **Thai Hybrid {{rag}}** (Document Parsing, Token-Aware Chunking, Qdrant/pgvector + PyThaiNLP BM25 + RRF + Reranker + Grounded Citations + ACL), สร้างมาตรฐานเชื่อมต่อเครื่องมือด้วย **{{mcp}}** และคุมวงจร Agent อย่างปลอดภัยด้วย **{{langgraph}}**!",
      ],
      analogy:
        "Phase 3 สอนให้คุณสร้าง \"พนักงานอ่านเอกสารทีละแผ่นได้อย่างแม่นยำ\" — Phase 4 จะมอบ \"ห้องสมุดค้นหาความเร็วสูง (Hybrid RAG)\" และ \"โทรศัพท์ต่อสายเช็กระบบหลังบ้าน (MCP Tools + LangGraph)\" ให้พนักงานคนนั้นทำงานตอบลูกค้าได้ครบวงจร",
      bullets: [
        "**Dense Embeddings (B18) + PyThaiNLP (Phase 2)** → รวมพลังเป็น **Thai Hybrid Search (Dense + BM25 + RRF + Rerank)** ใน B25–B26",
        "**Strict Pydantic Outputs (B20)** → ต่อตรงไปยัง **Grounded Citations, Native Tool Calling และ MCP Server** ใน B27–B29",
        "**Validation-Repair & Safe Fallback (B20, B23)** → ต่อตรงไปยัง **Guarded {{langgraph}} Agent Loops & Human-in-the-Loop** ใน B30",
      ],
      whyTitle: "Why this matters — ทุก Phase ที่ผ่านมาไม่ได้แยกส่วน แต่ซ้อนทับเป็นชั้นเดียวกัน",
      whyParagraphs: [
        "ผู้เรียนที่ผ่าน Phase 1 (Async/Pydantic/pytest) → Phase 2 (Polars/Thai NLP/Classical ML) → Phase 3 (Embeddings/Structured LLM/Benchmarking) จะเข้า Phase 4 โดยไม่หลงทางกับคำศัพท์หรือ framework เพราะเข้าใจทุกชั้นตั้งแต่รากฐาน",
        "เก็บโปรเจกต์ Phase 3 นี้ไว้เป็นส่วนประกอบจริง — คุณจะดึง schema, normalizer และ prompt registry ของมันไปใช้งานต่อใน Phase 4–6 ได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Hybrid ML+LLM เหมือน Tiered Architecture และ Phase 4 คือ Search + RPC Layer",
      body: [
        "เมื่อเทียบกับระบบเว็บขนาดใหญ่: Phase 2 Classical ML คือ Edge Fast-Path, Phase 3 LLM Extractor คือ Structured Compute Tier ที่มีการแคชและทำเวอร์ชันคอนฟิก ส่วน Phase 4 ที่กำลังจะเริ่มคือการเพิ่ม Search Engine (Hybrid RAG) และ Standardized RPC/API Protocol (MCP) ภายใต้ State Machine (LangGraph)",
      ],
      table: [
        ["Phase 2 Classical ML Baseline", "Edge Rule / Lightweight Fast-Path (`<5ms`)"],
        ["Phase 3 Hybrid LLM Extractor", "Cached & Versioned Compute Service (`Prompt + Schema`)"],
        ["Phase 4 Thai Hybrid RAG", "Elasticsearch (BM25) + Vector DB + Rerank Search Layer"],
        ["Phase 4 MCP + LangGraph", "Typed Tool RPC Protocol + Deterministic State Machine"],
      ],
    },
    student: {
      title: "First-Year Note — สรุปครึ่งทาง 92 วัน (3 Phases) ใน 3 ประโยค",
      body: [
        "**Phase 1** สอนสร้างซอฟต์แวร์ Python ที่แข็งแรงและทดสอบได้, **Phase 2** สอนวิเคราะห์ข้อมูลและสร้างโมเดล ML ภาษาไทยที่เร็ว `<10ms`, และ **Phase 3** สอนเข้าใจกลไก Neural Net/LLM พร้อมสร้างตัวสกัดเอกสารไทยที่แม่นยำและคุมต้นทุนได้จริง",
        "คุณผ่านมาเกินครึ่งทางของเส้นทาง AI Engineer แล้ว — พักทบทวนการ์ดความจำให้แน่น แล้วพรุ่งนี้ไปลุยสร้างระบบ RAG + Agent ภาษาไทยใน **Phase 4** กันต่อ!",
      ],
    },
  },

  workedExample: {
    intro:
      "มาเขียนสคริปต์ Checkpoint สำหรับสร้าง **ตารางเทียบ Phase 2 ML vs Phase 3 LLM vs Hybrid**, รัน **Phase 3 Readiness Auditor (6 เกณฑ์)** และสร้างไฟล์ `PHASE3_DEMO_REPORT.md` สำหรับนำเสนอผลงานใน 3 นาที",
    steps: [
      {
        title: "1 · คำนวณส่วนต่าง F1, Speedup และเปอร์เซ็นต์ประหยัดต้นทุนของ Hybrid เทียบ Frontier",
        explain:
          "รับผล benchmark ของ 3 สถาปัตยกรรม แล้วคำนวณ `f1_gain_vs_ml`, `cost_savings_vs_frontier_pct` และ `p50_speedup_vs_frontier`",
        code: {
          language: "python",
          filename: "worked_d092.py",
          code: `def compare_phase3_architectures(ml: dict, frontier: dict, hybrid: dict) -> dict:
    f1_gain_vs_ml = round(hybrid["macro_f1"] - ml["macro_f1"], 4)
    f1_gap_vs_frontier = round(hybrid["macro_f1"] - frontier["macro_f1"], 4)
    savings_pct = round(
        ((frontier["cost_usd_per_1k"] - hybrid["cost_usd_per_1k"]) / frontier["cost_usd_per_1k"]) * 100.0,
        1,
    )
    p50_speedup = round(frontier["p50_ms"] / hybrid["p50_ms"], 2)
    return {
        "hybrid_f1_gain_vs_ml": f1_gain_vs_ml,
        "hybrid_f1_gap_vs_frontier": f1_gap_vs_frontier,
        "cost_savings_vs_frontier_pct": savings_pct,
        "p50_speedup_vs_frontier": p50_speedup,
    }


ml_base = {"macro_f1": 0.86, "p50_ms": 1.2, "p95_ms": 2.4, "cost_usd_per_1k": 0.0001}
frontier_only = {"macro_f1": 0.94, "p50_ms": 980.0, "p95_ms": 1280.0, "cost_usd_per_1k": 2.40}
hybrid_routed = {"macro_f1": 0.93, "p50_ms": 210.0, "p95_ms": 1120.0, "cost_usd_per_1k": 0.48}

diff = compare_phase3_architectures(ml_base, frontier_only, hybrid_routed)
print("Comparison:", diff)`,
        },
        output: `Comparison: {'hybrid_f1_gain_vs_ml': 0.07, 'hybrid_f1_gap_vs_frontier': -0.01, 'cost_savings_vs_frontier_pct': 80.0, 'p50_speedup_vs_frontier': 4.67}`,
      },
      {
        title: "2 · รัน Phase 3 Readiness Auditor ตรวจครบ 6 Quality Gates",
        explain:
          "ตรวจเกณฑ์สำคัญก่อนขึ้น Phase 4: `schema_pass_rate >= 0.99`, `macro_f1 >= 0.88`, `edge_cases_tested`, `prompts_versioned_hashed`, `cost_usd_per_1k <= 0.60` และ `offline_tests_passed`",
        code: {
          language: "python",
          filename: "worked_d092.py",
          code: `def audit_phase3(m: dict) -> dict:
    gates = [
        ("schema_pass_gate", m["schema_pass_rate"] >= 0.99),
        ("macro_f1_gate", m["macro_f1"] >= 0.88),
        ("edge_cases_tested", bool(m["edge_cases_tested"])),
        ("prompts_versioned_hashed", bool(m["prompts_versioned_hashed"])),
        ("cost_budget_gate", m["cost_usd_per_1k"] <= 0.60),
        ("offline_tests_passed", bool(m["offline_tests_passed"])),
    ]
    failed = [name for name, ok in gates if not ok]
    score = round(((len(gates) - len(failed)) / len(gates)) * 100.0, 1)
    return {"score_pct": score, "ready_for_phase4": len(failed) == 0, "failed_gates": failed}


audit = audit_phase3({
    "schema_pass_rate": 0.995,
    "macro_f1": 0.93,
    "edge_cases_tested": True,
    "prompts_versioned_hashed": True,
    "cost_usd_per_1k": 0.48,
    "offline_tests_passed": True,
})
print("Phase 3 Audit:", audit)`,
        },
        output: `Phase 3 Audit: {'score_pct': 100.0, 'ready_for_phase4': True, 'failed_gates': []}`,
      },
      {
        title: "3 · สร้างรายงาน Markdown Demo Report พร้อมตารางเปรียบเทียบ",
        explain:
          "รวมตัวเลขจากทั้ง 3 สถาปัตยกรรมและสถานะ Readiness Audit เป็น Markdown ที่พร้อมแปะลง `README.md` ของ Portfolio Milestone #3",
        code: {
          language: "python",
          filename: "worked_d092.py",
          code: `report = f"""# Phase 3 Demo Report: Typed Thai Document Classifier & Extractor
- Readiness Score: {audit['score_pct']}% | Ready for Phase 4: {audit['ready_for_phase4']}
- Hybrid vs ML Baseline: +{diff['hybrid_f1_gain_vs_ml']:.2f} Macro-F1 (พร้อมสกัดฟิลด์ซับซ้อน)
- Hybrid vs Frontier Only: ประหยัดต้นทุน {diff['cost_savings_vs_frontier_pct']:.1f}% | P50 เร็วขึ้น {diff['p50_speedup_vs_frontier']:.2f}x
"""
print(report.strip())`,
        },
        output: `# Phase 3 Demo Report: Typed Thai Document Classifier & Extractor
- Readiness Score: 100.0% | Ready for Phase 4: True
- Hybrid vs ML Baseline: +0.07 Macro-F1 (พร้อมสกัดฟิลด์ซับซ้อน)
- Hybrid vs Frontier Only: ประหยัดต้นทุน 80.0% | P50 เร็วขึ้น 4.67x`,
      },
    ],
    gotcha:
      "จุดที่ห้ามเผลอตอนนำเสนอเดโม Phase 3: อย่าเทียบเฉพาะความแม่นยำโดยปิดบังว่า Phase 2 Classical ML ทำ **Classification** ได้ใน `~2ms` ในขณะที่ Phase 3 LLM ทำเพิ่มคือ **Structured Field Extraction + Code-Switching + Zero/Few-Shot Reasoning** — การสื่อสารให้ชัดว่าแต่ละเครื่องมือเก่งคนละงานและประกอบเป็น Hybrid ได้อย่างไร คือสัญญาณของ AI Engineer มืออาชีพ",
  },

  practice: {
    intro:
      "โจทย์ Checkpoint (15 นาที): สร้างโมดูล `phase3_checkpoint.py` ที่เปรียบเทียบ Phase 2 ML Baseline vs Frontier LLM vs Hybrid Extractor, ตรวจความพร้อม 6 Quality Gates ของ Portfolio Milestone #3 และสร้าง Markdown Demo Report อัตโนมัติ",
    requirements: [
      "ประกาศ `ArchBenchmark(BaseModel)` มี `name: str`, `macro_f1: float` (`0..1`), `field_exact_acc: float | None = None`, `p50_ms: float` (`>= 0`), `p95_ms: float` (`>= 0`), `cost_usd_per_1k: float` (`>= 0`) และ `Phase3Metrics(BaseModel)` มี `schema_pass_rate: float` (`0..1`), `macro_f1: float` (`0..1`), `edge_cases_tested: bool`, `prompts_versioned_hashed: bool`, `cost_usd_per_1k: float` (`>= 0`), `offline_tests_passed: bool`",
      "สร้าง `compare_ml_vs_llm(ml: ArchBenchmark, frontier: ArchBenchmark, hybrid: ArchBenchmark) -> dict`: โยน `ValueError` หาก `frontier.cost_usd_per_1k <= 0` หรือ `hybrid.p50_ms <= 0`; คืน dict ที่มี `hybrid_f1_gain_vs_ml` (ปัด 4 ตำแหน่ง), `hybrid_f1_gap_vs_frontier` (ปัด 4 ตำแหน่ง), `cost_savings_vs_frontier_pct` (ปัด 1 ตำแหน่ง), และ `p50_speedup_vs_frontier` (ปัด 2 ตำแหน่ง)",
      "สร้าง `audit_phase3_milestone(metrics: Phase3Metrics, min_schema_pass: float = 0.99, min_f1: float = 0.88, max_cost_usd_per_1k: float = 0.60) -> Phase3AuditReport` ที่ตรวจครบ 6 เกณฑ์ตามลำดับ: `schema_pass_gate`, `macro_f1_gate`, `edge_cases_tested`, `prompts_versioned_hashed`, `cost_budget_gate`, `offline_tests_passed` คืน `score_pct` (ปัด 1 ตำแหน่ง), `ready_for_phase4: bool` และ `failed_gates: list[str]`",
      "สร้าง `render_phase3_demo_report(project_name: str, ml: ArchBenchmark, frontier: ArchBenchmark, hybrid: ArchBenchmark, comparison: dict, audit: Phase3AuditReport, thb_per_usd: float = 35.0) -> str`: สร้าง Markdown ที่มีชื่อโปรเจกต์, ตารางเทียบทั้ง 3 สถาปัตยกรรม (รวมบาท/1k docs), เปอร์เซ็นต์ที่ประหยัดได้ และบรรทัด `Ready for Phase 4: True/False`",
    ],
    starter: {
      language: "python",
      filename: "phase3_checkpoint.py",
      code: `from pydantic import BaseModel, Field


class ArchBenchmark(BaseModel):
    name: str
    macro_f1: float = Field(ge=0.0, le=1.0)
    field_exact_acc: float | None = Field(default=None, ge=0.0, le=1.0)
    p50_ms: float = Field(ge=0.0)
    p95_ms: float = Field(ge=0.0)
    cost_usd_per_1k: float = Field(ge=0.0)


class Phase3Metrics(BaseModel):
    schema_pass_rate: float = Field(ge=0.0, le=1.0)
    macro_f1: float = Field(ge=0.0, le=1.0)
    edge_cases_tested: bool
    prompts_versioned_hashed: bool
    cost_usd_per_1k: float = Field(ge=0.0)
    offline_tests_passed: bool


class Phase3AuditReport(BaseModel):
    score_pct: float = Field(ge=0.0, le=100.0)
    ready_for_phase4: bool
    failed_gates: list[str]


def compare_ml_vs_llm(
    ml: ArchBenchmark,
    frontier: ArchBenchmark,
    hybrid: ArchBenchmark,
) -> dict[str, float]:
    """เทียบ Phase 2 ML Baseline vs Frontier LLM vs Hybrid Extractor"""
    # TODO: validate denominators & compute comparison deltas
    raise NotImplementedError


def audit_phase3_milestone(
    metrics: Phase3Metrics,
    min_schema_pass: float = 0.99,
    min_f1: float = 0.88,
    max_cost_usd_per_1k: float = 0.60,
) -> Phase3AuditReport:
    """ตรวจ 6 Quality Gates ของ Phase 3 Portfolio Milestone"""
    # TODO: check 6 ordered gates and return Phase3AuditReport
    raise NotImplementedError


def render_phase3_demo_report(
    project_name: str,
    ml: ArchBenchmark,
    frontier: ArchBenchmark,
    hybrid: ArchBenchmark,
    comparison: dict[str, float],
    audit: Phase3AuditReport,
    thb_per_usd: float = 35.0,
) -> str:
    """สร้าง Markdown Demo Report เทียบ 3 สถาปัตยกรรมพร้อม Readiness Summary"""
    # TODO: format portfolio-ready markdown report
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_phase3_checkpoint.py",
      code: `import pytest
from phase3_checkpoint import (
    ArchBenchmark,
    Phase3Metrics,
    audit_phase3_milestone,
    compare_ml_vs_llm,
    render_phase3_demo_report,
)

ML = ArchBenchmark(
    name="Phase 2 ML Baseline",
    macro_f1=0.86,
    field_exact_acc=None,
    p50_ms=1.2,
    p95_ms=2.4,
    cost_usd_per_1k=0.0001,
)
FRONTIER = ArchBenchmark(
    name="Frontier LLM Only",
    macro_f1=0.94,
    field_exact_acc=0.93,
    p50_ms=980.0,
    p95_ms=1280.0,
    cost_usd_per_1k=2.40,
)
HYBRID = ArchBenchmark(
    name="Hybrid ML + Routed LLM",
    macro_f1=0.93,
    field_exact_acc=0.92,
    p50_ms=210.0,
    p95_ms=1120.0,
    cost_usd_per_1k=0.48,
)


def test_compare_ml_vs_llm_and_validation():
    comp = compare_ml_vs_llm(ML, FRONTIER, HYBRID)
    assert comp["hybrid_f1_gain_vs_ml"] == pytest.approx(0.07)
    assert comp["hybrid_f1_gap_vs_frontier"] == pytest.approx(-0.01)
    assert comp["cost_savings_vs_frontier_pct"] == pytest.approx(80.0)
    assert comp["p50_speedup_vs_frontier"] == pytest.approx(4.67)

    bad_frontier = FRONTIER.model_copy(update={"cost_usd_per_1k": 0.0})
    with pytest.raises(ValueError):
        compare_ml_vs_llm(ML, bad_frontier, HYBRID)


def test_audit_phase3_milestone_pass_and_partial_fail():
    good = Phase3Metrics(
        schema_pass_rate=0.995,
        macro_f1=0.93,
        edge_cases_tested=True,
        prompts_versioned_hashed=True,
        cost_usd_per_1k=0.48,
        offline_tests_passed=True,
    )
    res = audit_phase3_milestone(good)
    assert res.ready_for_phase4 is True
    assert res.score_pct == 100.0
    assert res.failed_gates == []

    weak = Phase3Metrics(
        schema_pass_rate=0.95,
        macro_f1=0.91,
        edge_cases_tested=True,
        prompts_versioned_hashed=False,
        cost_usd_per_1k=1.20,
        offline_tests_passed=True,
    )
    res2 = audit_phase3_milestone(weak)
    assert res2.ready_for_phase4 is False
    assert res2.score_pct == 50.0
    assert res2.failed_gates == [
        "schema_pass_gate",
        "prompts_versioned_hashed",
        "cost_budget_gate",
    ]


def test_render_phase3_demo_report():
    comp = compare_ml_vs_llm(ML, FRONTIER, HYBRID)
    audit = audit_phase3_milestone(
        Phase3Metrics(
            schema_pass_rate=0.995,
            macro_f1=0.93,
            edge_cases_tested=True,
            prompts_versioned_hashed=True,
            cost_usd_per_1k=0.48,
            offline_tests_passed=True,
        )
    )
    md = render_phase3_demo_report("Typed Thai Document Classifier & Extractor", ML, FRONTIER, HYBRID, comp, audit)
    assert "Typed Thai Document Classifier & Extractor" in md
    assert "Phase 2 ML Baseline" in md
    assert "Frontier LLM Only" in md
    assert "Hybrid ML + Routed LLM" in md
    assert "80.0%" in md
    assert "Ready for Phase 4: True" in md
`,
    },
    selfCheck: [
      "`compare_ml_vs_llm` คำนวณ F1 delta, cost savings (`80.0%`) และ P50 speedup (`4.67x`) ได้ถูกต้อง พร้อมโยน `ValueError` เมื่อตัวหาร `<= 0`",
      "`audit_phase3_milestone` ตรวจครบ 6 เกณฑ์และคืน `failed_gates` ตามลำดับคงที่เมื่อมีเกณฑ์ตก",
      "`render_phase3_demo_report` แสดงตารางครบทั้ง 3 สถาปัตยกรรม (ทั้ง USD และ THB/1k docs) พร้อมสถานะ `Ready for Phase 4`",
      "รัน `uv run pytest -v` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance:
      "ผ่านครบทั้ง 3 test functions ใน `test_phase3_checkpoint.py` ด้วย `uv run pytest -v` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `compare_ml_vs_llm` เช็ก `if frontier.cost_usd_per_1k <= 0 or hybrid.p50_ms <= 0: raise ValueError(...)` ก่อนคำนวณสัดส่วน",
      },
      {
        body: "ใน `audit_phase3_milestone` เก็บทั้ง 6 เกณฑ์ในลิสต์ของ tuple `(gate_name, passed_bool)` ตามลำดับที่โจทย์กำหนด แล้วคำนวณ `score_pct = round((passed / len(gates)) * 100.0, 1)`",
      },
      {
        body: "โครงของ `audit_phase3_milestone` และ `render_phase3_demo_report` พร้อมแล้ว — เหลือเติม `compare_ml_vs_llm`:",
        code: {
          language: "python",
          filename: "hint_day92.py",
          code: `def audit_phase3_milestone(
    metrics: Phase3Metrics,
    min_schema_pass: float = 0.99,
    min_f1: float = 0.88,
    max_cost_usd_per_1k: float = 0.60,
) -> Phase3AuditReport:
    gates = [
        ("schema_pass_gate", metrics.schema_pass_rate >= min_schema_pass),
        ("macro_f1_gate", metrics.macro_f1 >= min_f1),
        ("edge_cases_tested", metrics.edge_cases_tested),
        ("prompts_versioned_hashed", metrics.prompts_versioned_hashed),
        ("cost_budget_gate", metrics.cost_usd_per_1k <= max_cost_usd_per_1k),
        ("offline_tests_passed", metrics.offline_tests_passed),
    ]
    failed = [name for name, ok in gates if not ok]
    passed = len(gates) - len(failed)
    return Phase3AuditReport(
        score_pct=round((passed / len(gates)) * 100.0, 1),
        ready_for_phase4=len(failed) == 0,
        failed_gates=failed,
    )


def render_phase3_demo_report(
    project_name: str,
    ml: ArchBenchmark,
    frontier: ArchBenchmark,
    hybrid: ArchBenchmark,
    comparison: dict[str, float],
    audit: Phase3AuditReport,
    thb_per_usd: float = 35.0,
) -> str:
    rows = []
    for arch in (ml, frontier, hybrid):
        field_str = f"{arch.field_exact_acc:.2f}" if arch.field_exact_acc is not None else "N/A"
        thb = arch.cost_usd_per_1k * thb_per_usd
        rows.append(
            f"| {arch.name} | {arch.macro_f1:.2f} | {field_str} | "
            f"{arch.p50_ms:.1f} / {arch.p95_ms:.1f} ms | "
            f"\${arch.cost_usd_per_1k:.4f} ({thb:.2f} THB) |"
        )
    return (
        f"# Phase 3 Demo Report: {project_name}\\n\\n"
        f"- Readiness Score: {audit.score_pct}% | Ready for Phase 4: {audit.ready_for_phase4}\\n\\n"
        "| Architecture | Macro-F1 | Field Exact | P50 / P95 | Cost / 1k Docs |\\n"
        "|---|---:|---:|---:|---:|\\n"
        + "\\n".join(rows)
        + f"\\n\\nHybrid ประหยัดต้นทุน {comparison['cost_savings_vs_frontier_pct']:.1f}% เทียบกับ Frontier LLM Only\\n"
    )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "สรุปว่า \"LLM แทนที่ Classical ML ได้ทั้งหมด\" โดยไม่ดูต้นทุนและ Latency",
      symptom: "โยนทุกทิกเก็ตแสนใบต่อเดือนเข้า Frontier LLM ทำให้ค่า API พุ่งสูงและ latency ช้าลงหลายร้อยเท่าทั้งที่ 70%+ เป็นเคสง่าย",
      fix: "ใช้ Classical ML เป็น fast-path สำหรับงานจำแนกที่ชัดเจน และใช้ Hybrid Routing + Prompt Caching เพื่อเอาข้อดีของทั้งสองโลก",
    },
    {
      title: "รีบตัดสินใจทำ Fine-Tuning (LoRA) ตั้งแต่ยังไม่วัด Prompt + Few-Shot + Routing Baseline",
      symptom: "เสียเวลาหลายสัปดาห์เก็บ dataset และเทรนโมเดล ทั้งที่การเพิ่ม Pre-Normalizer + Few-Shot 4 เคสแก้ความแม่นยำได้สูงกว่าใน 1 วัน",
      fix: "ทำ Prompt + Strict Schema + Edge-Case Guards + Eval Benchmark ก่อนเสมอ แล้วค่อยพิจารณา {{lora}} เมื่อวัดผลแล้วพบว่า prompt/RAG ถึงเพดานจริง ๆ",
    },
    {
      title: "ปิด Phase 3 โดยไม่มีไฟล์ Versioned Prompts และตัวเลข Benchmark ที่รันซ้ำได้",
      symptom: "เวลาสัมภาษณ์หรือนำเสนอเดโม ตอบไม่ได้ว่าต้นทุนต่อ 1,000 เอกสารไทยอยู่ที่กี่บาท และไม่สามารถย้อนดูพรอมต์ที่ให้คะแนนสูงสุดได้",
      fix: "เก็บบันทึก `PHASE3_DEMO_REPORT.md` คู่กับไฟล์ `prompts/extract_v*.yaml` ที่มี `sha256[:8]` ไว้ใน repository",
    },
    {
      title: "เปรียบเทียบเฉพาะ Classification F1 โดยลืมระบุข้อได้เปรียบด้าน Structured Extraction ของ LLM",
      symptom: "ทีมธุรกิจเห็นว่า ML ได้ F1 0.86 vs LLM 0.93 แล้วเข้าใจผิดว่า LLM เพิ่มแค่ 7% จึงไม่เห็นความคุ้มค่า",
      fix: "แสดงให้ชัดว่า LLM Extractor เพิ่มความสามารถในการสกัดฟิลด์ซ้อน (รหัสออเดอร์ ยอดเงิน รายการสินค้า สรุปภาษาไทย) ที่ Classical ML ทำไม่ได้",
    },
  ],

  quiz: {
    intro:
      "Phase 3 Cumulative Quiz (4 ข้อ ครอบคลุม Block B16–B23) — ทดสอบการเชื่อมโยงความรู้ตั้งแต่ PyTorch/Transformer/BPE, Embeddings/Context Engineering, Structured Outputs/Ollama ไปจนถึง LoRA และ Hybrid Economics ก่อนขึ้น Phase 4",
    questions: [
      mc(
        "d092-q1",
        "[B16–B17] ข้อใดจับคู่หลักการของ **Temperature ใน Softmax**, **Self-Attention `O(n²)`** และ **Thai BPE Tokenizer** ได้ถูกต้องทั้งหมด?",
        [
          ["Temperature ต่ำทำให้คำตอบสุ่มมากขึ้น; Self-Attention โตแบบเส้นตรง `O(n)`; ภาษาไทยใช้ token น้อยกว่าอังกฤษ", "ผิดทั้งสามส่วน — Temperature ต่ำทำให้นิ่งขึ้น, Attention โต `O(n²)`, และภาษาไทยใช้ token มากกว่าอังกฤษ"],
          ["Temperature ใกล้ `0` ทำให้การแจกแจง Softmax แหลมคมเหมาะกับ extraction; Attention Matrix โตแบบ `O(n²)` ตามความยาวบริบท; และภาษาไทยมักใช้ token มากกว่าอังกฤษ 1.5×–3×", "ถูก — เชื่อมโยงครบทั้งแก่นของ B16 และ B17"],
          ["Temperature ใช้เฉพาะตอนเทรน PyTorch; `O(n²)` เกิดเฉพาะใน RNN; BPE ตัดคำไทยตามพจนานุกรมราชบัณฑิตฯ", "ไม่จริงทั้งสามข้อ"],
          ["Temperature ควบคุมขนาดไฟล์ GGUF; `O(n²)` ลดลงเมื่อเพิ่มจำนวน layer; BPE ใช้ได้เฉพาะภาษาอังกฤษ", "สับสนข้ามหัวข้อกันทั้งหมด"],
        ],
        "B",
        "Temperature ต่ำช่วยให้งาน extraction นิ่ง, Self-Attention มีต้นทุน `O(n²)` ต่อความยาวบริบท (กระทบ TTFT), และ BPE มักตัดภาษาไทยเปลือง token กว่าอังกฤษ 1.5×–3×",
        "สรุปผลกระทบของ Temperature=0, Self-Attention `O(n²)` และ Thai BPE ต่อระบบ LLM Production?",
        "Temp≈0 ทำผลสกัดนิ่ง, Attention `O(n²)` ทำให้บริบทยาวกิน TTFT/VRAM พุ่งแบบกำลังสอง, และ Thai BPE ทำให้ต้นทุนต่อเอกสารไทยแพงกว่าอังกฤษ 1.5×–3×",
      ),
      mc(
        "d092-q2",
        "[B18–B19] เหตุใด **Multilingual Dense Embeddings** จึงค้นหาคำถามไทยปนอังกฤษได้ดีกว่า TF-IDF และเหตุใดเราจึงควรใช้ **SSE Streaming** ในแอปแชต?",
        [
          ["Dense Embeddings เก็บความหมายเชิงเวกเตอร์จึงจับคำพ้องความหมายข้ามภาษา (ไทย↔อังกฤษ) ได้; SSE Streaming ลดเวลา TTFT ที่ผู้ใช้เห็นคำตอบแรกทันที", "ถูก — เป็นเหตุผลหลักของทั้ง B18 (Embeddings) และ B19 (Streaming UX)"],
          ["Dense Embeddings ทำงานเร็วกว่าการเทียบสตริงตรง ๆ เสมอ; SSE Streaming ลดจำนวน output tokens ลงครึ่งหนึ่ง", "ไม่จริง — SSE ไม่ได้ลดจำนวน token แต่ลดเวลาที่ผู้ใช้ต้องรอเห็นตัวอักษรแรก (TTFT)"],
          ["Dense Embeddings ไม่ต้องใช้ Cosine Similarity; SSE Streaming ใช้ได้เฉพาะกับโมเดลในเครื่อง", "Dense Embeddings ใช้ Cosine Similarity เป็นหลัก และ SSE ใช้ได้ทั้ง Cloud API และ local"],
          ["TF-IDF จับความหมายข้ามภาษาได้อยู่แล้ว; SSE Streaming ทำให้ไม่ต้องใช้ Pydantic", "TF-IDF จับได้เฉพาะคำที่สะกดตรงกัน (lexical overlap) ไม่ใช่ความหมายข้ามภาษา"],
        ],
        "A",
        "Multilingual Dense Embeddings แมพข้อความที่มีความหมายใกล้กัน (แม้ต่างภาษาหรือใช้คำพ้อง) ให้อยู่ใกล้กันในปริภูมิเวกเตอร์ ส่วน SSE Streaming ลด Perceived Latency ผ่าน TTFT ที่เร็วขึ้น",
        "ความต่างหลักของ Multilingual Dense Embeddings เทียบกับ TF-IDF และประโยชน์ของ SSE Streaming คืออะไร?",
        "Embeddings จับความหมาย/คำพ้อง/ไทย-อังกฤษได้แม้คำไม่ซ้ำกัน ส่วน SSE Streaming ลดเวลา TTFT ให้ผู้ใช้เริ่มอ่านคำตอบได้ทันที",
      ),
      mc(
        "d092-q3",
        "[B20–B21] ข้อใดอธิบายการทำงานร่วมกันของ **Strict Pydantic Schema**, **Prompt Caching** และ **Ollama Quantization (เช่น Q4_K_M)** ได้ถูกต้อง?",
        [
          ["Strict Schema การันตีข้อเท็จจริง 100%; Prompt Caching แคชเฉพาะคำตอบสุดท้าย; Quantization เพิ่มขนาดไฟล์โมเดลให้ใหญ่ขึ้น 4 เท่า", "ผิดทั้งสามส่วน — Strict Schema คุมแค่โครงสร้าง, Prompt Caching แคช prefix ที่ซ้ำกัน, และ Quantization บีบอัดน้ำหนักให้เล็กลง"],
          ["Strict Schema คุมโครงสร้าง JSON + `@model_validator` คุมกฎธุรกิจ; Prompt Caching ลดต้นทุนและ TTFT ของ prefix ที่ซ้ำกัน; Quantization (GGUF) บีบอัดน้ำหนักโมเดลให้รันแบบ local ได้บน RAM/VRAM จำกัดและเก็บข้อมูลไว้ในองค์กร", "ถูก — ครบถ้วนทั้งด้าน Reliability, Cost และ Privacy"],
          ["Prompt Caching ใช้ได้เฉพาะกับ Ollama; Quantization ทำให้ไม่ต้องทำ Validation-Repair อีกต่อไป", "Prompt Caching เป็นฟีเจอร์หลักของ Cloud LLM APIs และโมเดล quantized ยิ่งต้องมี validation-repair ช่วยคุมคุณภาพ"],
          ["Strict Schema ปิดการใช้งาน `None`; Quantization แปลงภาษาไทยเป็นภาษาอังกฤษอัตโนมัติ", "ไม่จริง — ช่อง `| None` สำคัญมากเพื่อลด hallucination"],
        ],
        "B",
        "B20–B21 มอบเครื่องมือครบทั้ง 3 มิติ: Strict Schema + Validator คุมความน่าเชื่อถือ, Prompt Caching ลดต้นทุน/TTFT ของ prefix ซ้ำ, และ Quantized Local Models (Ollama) ตอบโจทย์ privacy และต้นทุนคงที่",
        "บทบาทของ Strict Schema, Prompt Caching และ Quantization (GGUF) ในระบบ LLM คืออะไร?",
        "Strict Schema คุมโครงสร้าง + Validator คุมกฎธุรกิจ; Prompt Caching ลดค่า/TTFT ของ prefix ซ้ำ; Quantization บีบอัดโมเดลให้รัน local ได้บนฮาร์ดแวร์จำกัด",
      ),
      mc(
        "d092-q4",
        "[B22–B23] ทีมต้องการสกัดเอกสารไทย 100,000 ฉบับ/เดือน โดย 75% เป็นเคสมาตรฐานและ 25% เป็นเคสกำกวมหรือไทยปนอังกฤษ — แนวทางใดเหมาะสมที่สุดก่อนลงทุนทำ Fine-Tuning (LoRA)?",
        [
          ["Fine-tune โมเดล 70B ด้วย LoRA ทันทีตั้งแต่วันแรกโดยยังไม่สร้าง Golden Dataset", "อันตรายและสิ้นเปลือง — ขาดทั้ง baseline และชุดข้อมูลวัดผลคุณภาพ"],
          ["วาง Pre-Normalizer + Versioned Prompts (YAML + SHA-256) + Hybrid Routing (ML/Small+Cache จัดการเคสส่วนใหญ่ ส่งเคสกำกวมขึ้น Frontier) แล้ววัดผล 3 แกนเทียบกับ Phase 2 ML Baseline", "ถูก — ได้ความแม่นยำสูง ประหยัดต้นทุน ~75%–80% รันซ้ำได้ และได้ข้อมูลจริงสำหรับตัดสินใจขั้นถัดไป"],
          ["ส่งทุกเอกสารเข้า Frontier LLM โดยไม่เปิด Prompt Caching และไม่ตรวจ edge cases", "ต้นทุนบานปลายและเสี่ยง hallucination บนเคสอีโมจิล้วน/ข้อความสกปรก"],
          ["ใช้ Classical ML อย่างเดียวสกัดฟิลด์ JSON ซ้อน 6 ฟิลด์", "Classical ML เหมาะกับการจำแนก (classification) แต่ไม่เหมาะกับการสกัดโครงสร้างข้อความอิสระซับซ้อน"],
        ],
        "B",
        "ลำดับวิศวกรรมที่ถูกต้องคือวัด Baseline → ทำ Pre-Normalizer + Few-Shot + Prompt Versioning + Caching/Routing → วัด 3 แกน แล้วค่อยพิจารณา RAG หรือ LoRA เมื่อเห็นคอขวดจริงจากข้อมูล",
        "ก่อนลงทุนทำ Fine-Tuning (LoRA) ควรทำขั้นตอนใดให้ครบก่อนในระบบสกัดเอกสารไทย?",
        "ทำ Pre-Normalizer + Strict Schema + Targeted Few-Shot + Versioned Prompts + Prompt Caching/Hybrid Routing และวัดผล 3 แกนบน Golden Dataset เทียบกับ Baseline",
      ),
    ],
  },

  takeaways: [
    "ยินดีด้วยที่จบ **Phase 3 (Days 61–92)** และปิด **Portfolio Milestone #3 (`Typed Thai Document Classifier & Extractor`)** ครบทุกเกณฑ์!",
    "การเปรียบเทียบ **Phase 2 ML Baseline vs Phase 3 Frontier LLM vs Hybrid** พิสูจน์ว่า Hybrid Routing + {{prompt-caching}} ให้ความแม่นยำใกล้เคียง Frontier แต่ประหยัดต้นทุนลงได้ ~75%–80%",
    "ระบบ LLM ระดับ production ต้องมีครบ 4 เสาหลัก: **Strict Schema + Repair**, **Thai Edge-Case Guards**, **3-Axis Benchmark (Accuracy/Latency/Cost)** และ **Versioned Prompts + SHA-256**",
    "พรุ่งนี้ (Day 93) เราจะเปิดบท **Phase 4: Thai Hybrid RAG, Tools, MCP & Agents** — นำ Embeddings, PyThaiNLP และ Structured Outputs ไปสร้างผู้ช่วยค้นหาความรู้และเรียกเครื่องมือจริง!",
  ],

  reviewCards: [
    rc(
      "d092-rc-1",
      "6 Quality Gates ของ Phase 3 Portfolio Milestone (`Typed Thai Document Classifier & Extractor`) มีอะไรบ้าง?",
      "1) Strict Schema Pass >= 99%, 2) Macro-F1 >= 0.88, 3) Thai Edge-Case Guards & Tests, 4) Versioned Prompt Files + SHA-256 Audit, 5) Cost/1k Docs ในงบ (Caching/Routing/Local), 6) Offline pytest & Ruff ผ่าน 100%",
    ),
    rc(
      "d092-rc-2",
      "ทำไม Hybrid ML + Routed/Cached LLM จึงมักชนะทั้ง Classical ML ล้วน และ Frontier LLM ล้วนในงานเอกสารองค์กร?",
      "Classical ML ล้วนเร็วและถูกแต่สกัดฟิลด์ซับซ้อนไม่ได้; Frontier ล้วนแม่นแต่ช้าและแพง (~84฿/1k docs) — Hybrid ใช้ fast-path/small+cache กับเคสส่วนใหญ่และส่งเฉพาะเคสยากขึ้น Frontier จึงได้ทั้งความแม่นยำสูงและลดต้นทุน ~75%–80%",
    ),
    rc(
      "d092-rc-3",
      "ข้อจำกัดใดของ Phase 3 Single-Document Extractor ที่นำเราเข้าสู่ Phase 4 (Thai Hybrid RAG, MCP & LangGraph)?",
      "Phase 3 รับเอกสารทีละชิ้นเข้า prompt แต่เมื่อคำตอบกระจายอยู่ในเอกสารองค์กรหลายร้อยไฟล์หรือต้องดึงข้อมูลสดจากระบบหลังบ้าน ต้องใช้ Hybrid RAG + MCP Tools + Guarded LangGraph Agents",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Documentation — Structured Data Validation", href: "https://docs.pydantic.dev/latest/" },
    { label: "OpenAI Docs — Structured Outputs & Prompt Caching", href: "https://platform.openai.com/docs/guides/structured-outputs" },
    { label: "Ollama Documentation — Local Open-Weights Models", href: "https://github.com/ollama/ollama/tree/main/docs" },
    { label: "Anthropic Research — Building Effective Agents (Bridge to Phase 4)", href: "https://www.anthropic.com/research/building-effective-agents" },
  ],

  glossary: [
    "structured-output",
    "bpe-tokenizer",
    "prompt-caching",
    "quantization",
    "lora",
    "prompt-versioning",
    "rag",
    "langgraph",
  ],
});
