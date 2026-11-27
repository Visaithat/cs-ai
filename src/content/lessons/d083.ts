import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D083 — Phase 3 / Block B21
 * Running Local Open-Weights Models with Ollama (Quantization GGUF basics)
 */
export const d083: Lesson = defineLesson({
  day: 83,
  titleTh: "รันโมเดล Open-Weights บนเครื่องด้วย Ollama และเข้าใจ Quantization (GGUF)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · คุม RAM/VRAM ด้วย Q4_K_M และเรียก Ollama ผ่าน OpenAI-compatible SDK",
  icon: "hard-drive",
  visual: {
    id: "ollama-quantization",
    title: "Local Open-Weights ด้วย Ollama & Quantization (FP16 → Q8 → Q4_K_M)",
    caption: "คลิกเลือกระดับ Quantization เพื่อดูขนาด VRAM, ความเร็ว tok/s และคุณภาพที่คงเหลือบนเครื่องโน้ตบุ๊ก",
    alt: "แผนภาพเปรียบเทียบ Quantization GGUF สำหรับรันโมเดลโลคัลด้วย Ollama",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณ 100% ด้วย Ollama หรือโหมด mock HTTP (ไม่ต้องใช้ Cloud API key)",
  tools: ["Ollama", "Official SDK", "httpx", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "โจทย์ข้อมูลลับองค์กร PDPA และงบพัฒนาเป็นศูนย์ (Zero-Cost Local Dev)",
      body: "หลายองค์กรไทย (ธนาคาร โรงพยาบาล กฎหมาย) ห้ามส่งข้อมูลลูกค้าหรือเอกสาร {{pdpa}} ออกไปยังเซิร์ฟเวอร์ต่างประเทศ และการทดลอง prompt นับพันรอบบน Cloud API ก็กินงบเร็ว — การรัน Open-Weights {{llm}} บนเครื่องหรือเซิร์ฟเวอร์ในองค์กรจึงเป็นทักษะจำเป็น",
      lessonNote: "วันนี้เราติดตั้งและเชื่อมต่อ Ollama เพื่อรันโมเดลอย่าง `qwen2.5:7b` หรือ `gemma3:4b` บนโน้ตบุ๊กของคุณเอง",
    },
    {
      node: 2,
      heading: "Quantization (GGUF) บีบน้ำหนักโมเดลให้พอดีกับ RAM/VRAM โน้ตบุ๊ก",
      body: "โมเดล 7B ที่เก็บน้ำหนักแบบ FP16 ใช้หน่วยความจำ ~14 GB ซึ่งแน่นเกินโน้ตบุ๊กทั่วไป แต่เทคนิค {{quantization}} แบบ 4-bit (`Q4_K_M`) ลดขนาดเหลือ ~4.5 GB โดยยังรักษาคุณภาพภาษาไทยและงานสกัดข้อมูลไว้ได้เกือบครบ",
      lessonNote: "เราจะเขียนสูตรคำนวณ RAM/VRAM (Weights + KV Cache + Runtime Overhead) เพื่อเลือกระดับ quantization ที่ไม่ทำให้เครื่องสลับลงดิสก์จนอืด",
    },
    {
      node: 4,
      heading: "สลับระหว่าง Cloud API กับ Local Ollama โดยแก้แค่ `base_url` และ `model`",
      body: "Ollama เปิดพอร์ต HTTP ที่เข้ากันได้กับ OpenAI API (`http://localhost:11434/v1`) ทำให้โค้ด Python ที่เขียนด้วย Official SDK และ {{structured-output}} สามารถสลับ provider ผ่านตัวแปรแวดล้อมได้ทันทีโดยไม่ติด vendor lock-in",
      lessonNote: "แบบฝึกหัดวันนี้สร้าง Local/Cloud Config Resolver, VRAM Estimator และ Mock Ollama Client ที่เทสต์ผ่าน `pytest` ได้แม้เครื่องยังไม่ได้ดาวน์โหลดโมเดล",
    },
    {
      node: 5,
      heading: "เฝ้าระวัง {{ttft}}, ความเร็ว `tok/s` และจุดเปลี่ยนเมื่อต้องย้ายไป vLLM",
      body: "Ollama เหมาะยอดเยี่ยมสำหรับการพัฒนาบนเครื่องและการใช้งานภายในที่มีผู้ใช้พร้อมกันไม่มาก (low concurrency) แต่เมื่อต้องรองรับผู้ใช้หลายสิบคนพร้อมกันใน production เราจะต่อยอดสู่ `vLLM` ใน Phase 5",
      lessonNote: "วันพรุ่งนี้ (Day 84) เราจะนำ Local Ollama มาวัดชนกับ Cloud API ด้วยตัวเลขจริงบนงานสกัดเอกสารไทย",
    },
  ],

  objectives: [
    "**อธิบาย** หลักการของ {{quantization}} และรูปแบบไฟล์ **GGUF** (`FP16` vs `Q8_0` vs `Q4_K_M`) พร้อมคำนวณขนาด RAM/VRAM ที่ต้องใช้รวม KV Cache ได้อย่างแม่นยำ",
    "**เชื่อมต่อ** Local Open-Weights model (`Qwen2.5`, `Llama 3`, `Gemma`) ผ่าน `Ollama` OpenAI-compatible endpoint (`http://localhost:11434/v1`) โดยไม่ต้องรื้อโครงสร้างโค้ด SDK เดิม",
    "**ประเมิน** ข้อดีและข้อจำกัดของ Local LLM (ความเป็นส่วนตัว {{pdpa}}, ค่าใช้จ่ายต่อ token เป็น 0, แต่ติดเพดานฮาร์ดแวร์และ concurrency) เพื่อเลือกใช้ให้ตรงบริบท",
  ],

  prerequisites: [
    "การเรียก Official LLM SDK และตั้งค่า {{temperature}} (Day 73)",
    "{{structured-output}} ด้วย Pydantic v2 (Day 77)",
    "พื้นฐาน HTTP client ({{httpx}}) และการทำ {{mocking}} ใน `pytest` (Days 10 & 13)",
    "รันแบบฝึกหัดและ `pytest` บน CPU ได้ 100% (หากติดตั้ง Ollama และดึงโมเดล 3B–7B จะลองยิงจริงบนเครื่องได้ทันที)",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ด้วย `uv` และ (ถ้าต้องการรันโมเดลจริงบนเครื่อง) ติดตั้ง Ollama จาก `https://ollama.com` แล้วดึงโมเดลขนาดเล็กที่เก่งภาษาไทยอย่าง `qwen2.5:3b` หรือ `qwen2.5:7b`",
    commands: `uv init ai-day83 && cd ai-day83
uv add openai httpx pydantic
uv add --dev pytest ruff
# (ทางเลือก) หากติดตั้ง Ollama แล้ว ลองดึงโมเดล 3B (~2 GB) เพื่อทดสอบจริง:
# ollama pull qwen2.5:3b
uv run python -c "import openai, httpx; print('Ready for Local Ollama lab')"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day83` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `openai`, `httpx`, `pydantic` และ `pytest` สำเร็จ"],
      ["verify", "ทดสอบนำเข้าไลบรารีผ่าน (และตรวจสอบ `ollama list` หากติดตั้ง Ollama บนเครื่อง)"],
    ],
    note: "โน้ตบุ๊กที่มี RAM 8 GB แนะนำ `qwen2.5:3b` หรือ `gemma3:4b` (ระดับ Q4_K_M ใช้ ~2.5–3.2 GB) ส่วนเครื่อง RAM 16 GB+ สามารถรัน `qwen2.5:7b` (~4.7 GB) ได้ลื่นสบาย — และแบบฝึกหัด `pytest` วันนี้รันได้ 100% แม้ยังไม่ได้ติดตั้ง Ollama",
  },

  concepts: [
    {
      id: "gguf-quantization-intuition",
      title: "1 · Quantization & GGUF คืออะไร: บีบโมเดล 14 GB ให้เหลือ 4.5 GB",
      paragraphs: [
        "น้ำหนัก (weights) ของ {{llm}} ตอนเทรนเสร็จมักเก็บเป็นทศนิยม 16-bit (`FP16` หรือ `BF16` = 2 bytes ต่อ 1 พารามิเตอร์) นั่นหมายความว่าโมเดลขนาด 7 พันล้านพารามิเตอร์ (7B) จะกินหน่วยความจำเฉพาะค่าน้ำหนักอย่างเดียวถึง `7 × 2 = 14 GB` ยังไม่รวม KV Cache และระบบปฏิบัติการ ทำให้เปิดบนโน้ตบุ๊ก 16 GB แทบไม่ได้",
        "**{{quantization}}** คือการลดความละเอียดในการเก็บตัวเลขน้ำหนักจาก 16 บิตลงมาเหลือ **8 บิต (`Q8_0`)** หรือ **4 บิต (`Q4_K_M`)** ภายใต้ฟอร์แมตไฟล์ **GGUF** (ของระบบนิเวศ `llama.cpp` ที่ Ollama ใช้เป็นเครื่องยนต์ข้างใต้) โดย `Q4_K_M` ใช้เทคนิคผสมความละเอียด (K-quantization) เก็บชั้นสำคัญไว้ที่บิตสูงกว่าและชั้นทั่วไปที่ ~4.5–4.8 บิต/พารามิเตอร์ ทำให้ขนาดไฟล์หดลงเกือบ **3.2×** และอ่านจากหน่วยความจำเร็วขึ้นมาก (เพราะ LLM inference ติดคอขวด memory bandwidth) ขณะที่คุณภาพยังใกล้เคียงเดิมอย่างน่าทึ่ง",
      ],
      analogy: "เหมือนการเก็บภาพถ่ายดิจิทัล: `FP16` คือไฟล์ RAW 50 MB, `Q8_0` คือ PNG/JPEG คุณภาพ 98% ที่แยกด้วยตาเปล่าไม่ออก, ส่วน `Q4_K_M` คือ JPEG คุณภาพ 85% ที่ไฟล์เล็กลง 3 เท่า โหลดเร็วขึ้นมาก แต่รายละเอียดสำคัญยังคมชัดครบถ้วน (ส่วน 2-bit อย่าง `Q2_K` จะเริ่มแตกเป็นปื้นจนภาษาไทยเพี้ยน)",
      bullets: [
        "**`FP16` (~2.0 bytes/param)**: มาตรฐานอ้างอิง ไม่มี loss จาก quantization แต่กิน VRAM สูงสุด",
        "**`Q8_0` (~1.05 bytes/param)**: คุณภาพแทบเท่า FP16 ลดขนาดครึ่งหนึ่ง เหมาะเมื่อ VRAM เหลือเฟือ",
        "**`Q4_K_M` (~0.60 bytes/param)**: จุดสมดุลยอดนิยม (ค่าเริ่มต้นของ Ollama แทบทุกโมเดล) — โมเดล 7B เหลือ ~4.5–4.7 GB",
        "**ระวังต่ำกว่า 4-bit (`Q2_K` / `Q3_K_S`)**: มักทำให้คำสั่ง JSON/Structured Output และภาษาไทยเสื่อมคุณภาพชัดเจน",
      ],
      whyTitle: "Why this matters — รู้สูตรคำนวณ VRAM ก่อนโหลดโมเดลไม่ให้เครื่องค้าง",
      whyParagraphs: [
        "ความผิดพลาดที่พบบ่อยที่สุดเมื่อเล่น Ollama คือโหลดโมเดลที่ใหญ่กว่า VRAM/RAM ที่มีอยู่ ผลคือระบบต้องย้ายบางเลเยอร์ลง CPU หรือสลับหน่วยความจำลง SSD (swapping) จนความเร็วหล่นจาก 40 tok/s เหลือ 1–2 tok/s",
        "กฎคำนวณเร็วในใจ: `Total Memory (GB) ≈ (Params_B × bytes_per_param) × 1.15 + kv_cache_gb` — ถ้าตัวเลขนี้ไม่เกิน 75–80% ของ RAM/VRAM ที่ว่างอยู่ โมเดลจะรันได้ลื่นมาก",
      ],
    },
    {
      id: "ollama-openai-compatible-api",
      title: "2 · เรียก Ollama ผ่าน OpenAI-Compatible API โดยไม่ล็อกค่าย",
      paragraphs: [
        "**Ollama** ทำหน้าที่เป็นตัวจัดการและเซิร์ฟเวอร์โลคัลสำหรับ Open-Weights LLM (ครอบทับ `llama.cpp`) ข้อดีเชิงสถาปัตยกรรมที่วิศวกร AI ชอบมากคือ Ollama เปิด endpoint ที่ใช้สัญญาเดียวกับ OpenAI API ที่ `http://localhost:11434/v1`",
        "หมายความว่าโค้ด Python ทั้งหมดที่คุณเขียนไว้ด้วย `openai` Official SDK (รวมถึง `messages`, `temperature`, และ `response_format` สำหรับ {{structured-output}}) สามารถสลับจาก Cloud API มารันบนเครื่องได้ทันทีโดยเปลี่ยนแค่ 2 ค่า: `base_url=\"http://localhost:11434/v1\"` และ `model=\"qwen2.5:7b\"` (พร้อมใส่ `api_key=\"ollama\"` เป็นค่าหลอกเพราะ SDK บังคับให้ส่ง string ไม่ว่าง)",
      ],
      analogy: "เหมือนปลั๊กไฟมาตรฐานเดียวกันทั้งบ้าน — ไม่ว่าคุณจะเสียบไฟจากการไฟฟ้า (Cloud API) หรือเครื่องปั่นไฟในบ้าน (Local Ollama) เครื่องใช้ไฟฟ้า (โค้ด Python SDK ของคุณ) ก็ทำงานได้ทันทีโดยไม่ต้องเดินสายไฟใหม่",
      code: {
        language: "python",
        filename: "ollama_client.py",
        code: `from openai import OpenAI


def build_llm_client(provider: str = "ollama", api_key: str | None = None) -> tuple[OpenAI, str]:
    if provider == "ollama":
        client = OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama",  # Ollama ไม่ตรวจ key แต่ SDK ต้องการค่าที่ไม่ว่าง
            timeout=60.0,
        )
        return client, "qwen2.5:7b"
    if provider == "cloud":
        if not api_key:
            raise ValueError("Cloud provider requires api_key")
        return OpenAI(api_key=api_key, timeout=30.0), "gpt-4o-mini"
    raise ValueError(f"Unsupported provider: {provider}")`,
        caption: "Factory pattern ง่าย ๆ ทำให้ทั้งโปรเจกต์สลับระหว่าง Local Ollama (dev/PDPA) กับ Cloud API (prod) ผ่านตัวแปรคอนฟิกเดียว",
      },
      whyTitle: "Why this matters — เลือกโมเดล Open-Weights ที่เก่งภาษาไทยจริง",
      whyParagraphs: [
        "ไม่ใช่โมเดล Open-Weights ทุกตัวจะเข้าใจภาษาไทยเท่ากัน: ตระกูล **Qwen2.5** (3B/7B/14B) และ **Gemma 3** (4B/12B) มักมี tokenizer และข้อมูลเทรนภาษาไทยแข็งแรงกว่าโมเดลที่เน้นอังกฤษล้วน จึงเหมาะมากสำหรับงานสกัดเอกสารไทยบนเครื่อง",
        "นอกจากนี้ควรกำหนด `temperature=0.0` และส่ง JSON Schema ชัดเจน เพราะโมเดลขนาด 3B–7B อ่อนไหวต่อ prompt ที่คลุมเครือมากกว่าโมเดล Frontier บนคลาวด์",
      ],
    },
    {
      id: "privacy-cost-and-limits",
      title: "3 · เมื่อไรควรใช้ Local Ollama vs Cloud API (PDPA, ต้นทุน และ Concurrency)",
      paragraphs: [
        "จุดแข็งที่ไม่มี Cloud API ไหนเทียบได้ของ Local Ollama คือ **Data Privacy 100%** (ข้อมูลบัตรประชาชน เอกสารการแพทย์ สัญญาภายในตาม {{pdpa}} ไม่เคยออกจากเครื่องหรือเครือข่ายองค์กร) และ **Zero Marginal Cost** (รันเทสต์ prompt 1,000 รอบ หรือทำงานบนเครื่องบินโดยไม่ต่อเน็ตก็ได้ในราคา 0 บาท)",
        "แต่ Local Ollama ก็มีข้อจำกัดที่ต้องเข้าใจตรงไปตรงมา: (1) โมเดล 3B–8B บนโน้ตบุ๊กมีความฉลาดและการให้เหตุผลซับซ้อนน้อยกว่า Frontier model บนคลาวด์, (2) {{ttft}} และความเร็วสร้างคำขึ้นกับ GPU/Unified Memory ของเครื่องโดยตรง, และ (3) Ollama ออกแบบมาสำหรับผู้ใช้เดี่ยวหรือทีมเล็ก (concurrency ต่ำ) หากต้องให้บริการผู้ใช้พร้อมกัน 50+ คนบนเซิร์ฟเวอร์ GPU จริงควรย้ายไปใช้ **vLLM** (Phase 5) ที่มี Continuous Batching และ PagedAttention",
      ],
      analogy: "Local Ollama เหมือนมีเครื่องชงกาแฟส่วนตัวบนโต๊ะทำงาน: ชงฟรีทุกแก้ว สูตรลับไม่รั่วไหล แต่ถ้าต้องชงให้ลูกค้า 200 คนพร้อมกันในชั่วโมงเร่งด่วน คุณต้องใช้เครื่องชงระดับโรงงาน (vLLM) หรือสั่งร้านใหญ่ (Cloud API)",
      bullets: [
        "**ใช้ Local Ollama**: พัฒนาและทดลอง prompt ฟรี, งานเอกสารลับ {{pdpa}} ในองค์กร, ใช้งานออฟไลน์, งานสกัด/จัดหมวดที่โมเดล 7B ทำได้แม่นพอ",
        "**ใช้ Cloud API**: งานให้เหตุผลซับซ้อน (reasoning), เอกสารยาก/ภาพเบลอมาก, ทราฟฟิกพุ่งสูงไม่สม่ำเสมอโดยไม่อยากดูแล GPU เอง",
        "**Hybrid Routing**: ส่งเคสง่าย/เอกสารลับเข้า Local 7B และส่งเฉพาะเคสยาก (หลัง redaction แล้ว) ขึ้น Cloud Frontier",
      ],
      whyTitle: "Why this matters — เตรียมพร้อมสำหรับ Benchmark วันพรุ่งนี้ (Day 84)",
      whyParagraphs: [
        "วิศวกร AI ที่ดีไม่ฟันธงจากความเชื่อว่า \"Local ถูกกว่าเลยดีกว่าเสมอ\" หรือ \"Cloud แพงแต่ฉลาดกว่าเสมอ\" แต่จะวัดทั้ง 4 แกนคู่กัน: Schema Pass Rate, Field Accuracy, P95 Latency และ Cost per 1,000 docs",
        "พรุ่งนี้ใน Day 84 เราจะสร้าง Benchmark Harness เทียบ Cloud API กับ Local Ollama บนชุดเอกสารไทยชุดเดียวกันเป๊ะ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Ollama ≈ Local Docker Postgres/Redis สำหรับ Dev & On-Prem",
      body: [
        "เวลาพัฒนาเว็บแอป คุณไม่ได้ยิงตรงไป RDS/Production Database บนคลาวด์ทุกครั้งที่แก้โค้ด แต่รัน Postgres โลคัลบน `localhost:5432` แล้วสลับ connection string ผ่าน `.env` ตอนขึ้น staging/prod",
        "Ollama ทำบทบาทเดียวกันเป๊ะสำหรับ AI Engineer: เป็น Local LLM server บน `localhost:11434/v1` ที่สลับด้วย `LLM_BASE_URL` และ `LLM_MODEL` ใน `.env` โดยไม่ต้องแก้โค้ดธุรกิจเลย",
      ],
      table: [
        ["`http://localhost:11434/v1`", "`postgres://localhost:5432/dev` (Local Dev Server)"],
        ["`ollama pull qwen2.5:7b`", "`docker pull postgres:16-alpine`"],
        ["Quantization (`FP16` → `Q4_K_M`)", "Image/Asset compression ลดขนาดไฟล์ 3× เพื่อคุม RAM/Bandwidth"],
        ["`OpenAI(base_url=...)`", "Dependency Injection / Swappable HTTP Provider Adapter"],
      ],
    },
    student: {
      title: "First-Year Note — 1 พารามิเตอร์กินกี่ไบต์? คณิตศาสตร์ง่าย ๆ ที่ช่วยคำนวณ VRAM",
      body: [
        "คำว่า **7B** ย่อมาจาก **7 Billion (7 พันล้าน)** ตัวเลขทศนิยมที่เป็นน้ำหนักของโมเดล: ในคอมพิวเตอร์ 16-bit = 2 bytes ดังนั้น `7B × 2 bytes = 14 GB`, 8-bit = 1 byte ดังนั้น `7B × 1 byte = 7 GB`, และ 4-bit = 0.5 byte ดังนั้น `7B × 0.5 byte = 3.5 GB` (เมื่อบวกค่า scale factor ของ `Q4_K_M` จะอยู่ที่ ~0.60 byte/param ≈ `4.2–4.7 GB`)",
        "แค่คูณเลข 1 บรรทัดนี้ คุณจะตอบได้ทันทีว่าคอมพิวเตอร์ RAM 8 GB หรือการ์ดจอ VRAM 12 GB ของคุณรันโมเดลขนาดไหนได้บ้างโดยไม่ต้องเดา!",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เขียนเครื่องมือช่วยวางแผนรัน Local Ollama บนเครื่อง — คำนวณขนาด RAM/VRAM ของแต่ละระดับ Quantization, ตรวจสอบความเข้ากันได้กับฮาร์ดแวร์, และสร้าง client ที่เรียก `/v1/chat/completions` ของ Ollama (พร้อมโหมด mock `httpx.MockTransport` เพื่อทดสอบออฟไลน์)",
    steps: [
      {
        title: "1 · คำนวณ RAM/VRAM ที่ต้องใช้สำหรับ FP16 vs Q8_0 vs Q4_K_M",
        explain: "เทียบขนาดหน่วยความจำของโมเดล 7B และ 14B ภายใต้บริบท 8k tokens (`kv_cache_gb` ประมาณ 0.6 GB สำหรับ 7B) เพื่อดูว่าพอดีกับโน้ตบุ๊ก 16 GB หรือไม่",
        code: {
          language: "python",
          filename: "worked_day83.py",
          code: `BYTES_PER_PARAM = {
    "FP16": 2.00,
    "Q8_0": 1.06,
    "Q4_K_M": 0.60,
}


def estimate_ram_gb(
    params_b: float,
    quant: str,
    *,
    kv_cache_gb: float = 0.6,
    overhead_ratio: float = 1.15,
) -> float:
    bpp = BYTES_PER_PARAM[quant]
    weights_gb = params_b * bpp
    return round(weights_gb * overhead_ratio + kv_cache_gb, 2)


for params in [3.0, 7.0, 14.0]:
    row = " | ".join(f"{q}: {estimate_ram_gb(params, q):5.2f} GB" for q in ["FP16", "Q8_0", "Q4_K_M"])
    print(f"{params:4.1f}B -> {row}")`,
        },
        output: ` 3.0B -> FP16:  7.50 GB | Q8_0:  4.26 GB | Q4_K_M:  2.67 GB
 7.0B -> FP16: 16.70 GB | Q8_0:  9.13 GB | Q4_K_M:  5.43 GB
14.0B -> FP16: 32.80 GB | Q8_0: 17.67 GB | Q4_K_M: 10.26 GB`,
      },
      {
        title: "2 · แนะนำ Quantization ที่เหมาะสมกับงบ RAM/VRAM ที่มี",
        explain: "เลือกระดับความละเอียดสูงสุดที่ยังปลอดภัย (ไม่เกิน 80% ของหน่วยความจำที่ว่าง) เพื่อให้ได้คุณภาพดีที่สุดโดยไม่เกิด disk swapping",
        code: {
          language: "python",
          filename: "worked_day83.py",
          code: `def recommend_quant(params_b: float, available_mem_gb: float, *, kv_cache_gb: float = 0.6) -> str | None:
    safe_budget = available_mem_gb * 0.80
    for quant in ["FP16", "Q8_0", "Q4_K_M"]:
        if estimate_ram_gb(params_b, quant, kv_cache_gb=kv_cache_gb) <= safe_budget:
            return quant
    return None


for mem in [8.0, 16.0, 24.0]:
    print(f"RAM {mem:4.1f} GB -> 7B best quant: {recommend_quant(7.0, mem)} | 14B best quant: {recommend_quant(14.0, mem)}")`,
        },
        output: `RAM  8.0 GB -> 7B best quant: Q4_K_M | 14B best quant: None
RAM 16.0 GB -> 7B best quant: Q8_0 | 14B best quant: Q4_K_M
RAM 24.0 GB -> 7B best quant: FP16 | 14B best quant: Q8_0`,
      },
      {
        title: "3 · เรียก Ollama OpenAI-Compatible Endpoint พร้อม `httpx.MockTransport`",
        explain: "ยิง POST ไปยัง `http://localhost:11434/v1/chat/completions` ผ่าน `httpx.Client` — ในตัวอย่างนี้เสียบ `MockTransport` เพื่อจำลองคำตอบจาก `qwen2.5:7b` โดยไม่ต้องเปิดเซิร์ฟเวอร์จริง",
        code: {
          language: "python",
          filename: "worked_day83.py",
          code: `import httpx


def call_ollama_chat(
    prompt: str,
    *,
    model: str = "qwen2.5:7b",
    base_url: str = "http://localhost:11434/v1",
    client: httpx.Client | None = None,
) -> str:
    payload = {
        "model": model,
        "temperature": 0.0,
        "messages": [
            {"role": "system", "content": "ตอบสั้นกระชับเป็น JSON"},
            {"role": "user", "content": prompt},
        ],
    }
    own_client = client is None
    http = client or httpx.Client(timeout=60.0)
    try:
        resp = http.post(f"{base_url.rstrip('/')}/chat/completions", json=payload)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
    finally:
        if own_client:
            http.close()


mock_transport = httpx.MockTransport(
    lambda req: httpx.Response(
        200,
        json={"choices": [{"message": {"content": '{"status":"ok","provider":"ollama"}'}}]},
    )
)
with httpx.Client(transport=mock_transport) as mock_http:
    reply = call_ollama_chat("สกัดสถานะคำขอนี้", client=mock_http)
print("Ollama reply:", reply)`,
        },
        output: `Ollama reply: {"status":"ok","provider":"ollama"}`,
      },
    ],
    gotcha: "ถ้าเปิดใช้ Ollama แล้วเจอ error `ConnectionRefusedError` ที่ `localhost:11434` แปลว่า Ollama daemon ยังไม่รันอยู่เบื้องหลัง (ให้เปิดแอป Ollama หรือรัน `ollama serve`) และถ้าเพิ่งดึงโมเดลใหม่ครั้งแรก รอบแรกจะใช้เวลาโหลดน้ำหนักเข้า RAM/VRAM 2–8 วินาที (`cold start`) ก่อนที่รอบถัดไปจะเร็วขึ้นมาก",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day83.py` สำหรับจัดการ Local Open-Weights LLM ด้วย Ollama: คำนวณขนาด RAM/VRAM ตามระดับ GGUF Quantization, เลือกระดับ quantization ที่ปลอดภัย, สร้างคอนฟิกสลับ provider (`ollama` vs `cloud`), และเรียก Ollama OpenAI-compatible API พร้อมรองรับ `httpx.MockTransport` ใน `pytest`",
    requirements: [
      "ประกาศตาราง `QUANT_BYTES_PER_PARAM = {\"FP16\": 2.00, \"Q8_0\": 1.06, \"Q4_K_M\": 0.60, \"Q4_0\": 0.56}` และสร้างฟังก์ชัน `estimate_model_memory_gb(params_b: float, quant: str, *, kv_cache_gb: float = 0.6, overhead_ratio: float = 1.15) -> float` ที่ตรวจ `params_b > 0`, `kv_cache_gb >= 0`, `overhead_ratio >= 1.0`, และ `quant in QUANT_BYTES_PER_PARAM` (มิฉะนั้น raise `ValueError`) แล้วคืนค่า `round(params_b * bpp * overhead_ratio + kv_cache_gb, 2)`",
      "สร้างฟังก์ชัน `select_safe_quant(params_b: float, available_mem_gb: float, *, kv_cache_gb: float = 0.6, headroom_ratio: float = 0.80) -> str | None`: ตรวจ `available_mem_gb > 0` และ `0 < headroom_ratio <= 1.0`, ค้นหาระดับคุณภาพสูงสุดจากลำดับ `[\"FP16\", \"Q8_0\", \"Q4_K_M\", \"Q4_0\"]` ที่ `estimate_model_memory_gb(...) <= available_mem_gb * headroom_ratio` (ถ้าไม่มีระดับใดพอดีให้คืน `None`)",
      "สร้าง `@dataclass(frozen=True) class ProviderConfig` (`provider: str`, `base_url: str`, `api_key: str`, `model: str`, `is_local: bool`) และฟังก์ชัน `resolve_provider_config(provider: str, *, model: str | None = None, cloud_api_key: str | None = None, ollama_host: str = \"http://localhost:11434\") -> ProviderConfig`: เมื่อ `provider == \"ollama\"` คืน `base_url=f\"{ollama_host.rstrip('/')}/v1\"`, `api_key=\"ollama\"`, `model=model or \"qwen2.5:7b\"`, `is_local=True`; เมื่อ `provider == \"cloud\"` ต้องตรวจ `cloud_api_key` ไม่ว่าง แล้วคืน `base_url=\"https://api.openai.com/v1\"`, `model=model or \"gpt-4o-mini\"`, `is_local=False`",
      "สร้างฟังก์ชัน `query_openai_compatible(cfg: ProviderConfig, system_prompt: str, user_prompt: str, *, client: httpx.Client) -> str` ที่ส่ง POST ไปยัง `f\"{cfg.base_url}/chat/completions\"` พร้อม header `Authorization: Bearer {cfg.api_key}`, `temperature: 0.0`, ตรวจ `raise_for_status()`, และคืน `choices[0].message.content`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day83.py",
      code: `from dataclasses import dataclass
import httpx

QUANT_BYTES_PER_PARAM: dict[str, float] = {
    "FP16": 2.00,
    "Q8_0": 1.06,
    "Q4_K_M": 0.60,
    "Q4_0": 0.56,
}


@dataclass(frozen=True)
class ProviderConfig:
    provider: str
    base_url: str
    api_key: str
    model: str
    is_local: bool


def estimate_model_memory_gb(
    params_b: float,
    quant: str,
    *,
    kv_cache_gb: float = 0.6,
    overhead_ratio: float = 1.15,
) -> float:
    """คำนวณขนาด RAM/VRAM (GB) รวม weights, overhead และ KV cache."""
    # TODO: implement
    raise NotImplementedError


def select_safe_quant(
    params_b: float,
    available_mem_gb: float,
    *,
    kv_cache_gb: float = 0.6,
    headroom_ratio: float = 0.80,
) -> str | None:
    """เลือกระดับ Quantization คุณภาพสูงสุดที่พอดีกับหน่วยความจำอย่างปลอดภัย."""
    # TODO: implement
    raise NotImplementedError


def resolve_provider_config(
    provider: str,
    *,
    model: str | None = None,
    cloud_api_key: str | None = None,
    ollama_host: str = "http://localhost:11434",
) -> ProviderConfig:
    """สร้างคอนฟิก OpenAI-compatible สำหรับ Local Ollama หรือ Cloud API."""
    # TODO: implement
    raise NotImplementedError


def query_openai_compatible(
    cfg: ProviderConfig,
    system_prompt: str,
    user_prompt: str,
    *,
    client: httpx.Client,
) -> str:
    """เรียก /chat/completions ของ Ollama หรือ Cloud ผ่าน httpx.Client."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day83.py",
      code: `import json
import httpx
import pytest
from exercise_day83 import (
    estimate_model_memory_gb,
    query_openai_compatible,
    resolve_provider_config,
    select_safe_quant,
)


def test_estimate_memory_and_validation():
    assert estimate_model_memory_gb(7.0, "FP16") == pytest.approx(16.70)
    assert estimate_model_memory_gb(7.0, "Q4_K_M") == pytest.approx(5.43)
    with pytest.raises(ValueError):
        estimate_model_memory_gb(7.0, "Q2_UNKNOWN")
    with pytest.raises(ValueError):
        estimate_model_memory_gb(-3.0, "Q4_K_M")


def test_select_safe_quant_respects_headroom():
    assert select_safe_quant(7.0, 8.0) == "Q4_K_M"
    assert select_safe_quant(7.0, 16.0) == "Q8_0"
    assert select_safe_quant(7.0, 24.0) == "FP16"
    assert select_safe_quant(14.0, 8.0) is None


def test_resolve_provider_config_local_vs_cloud():
    local_cfg = resolve_provider_config("ollama", ollama_host="http://localhost:11434/")
    assert local_cfg.is_local is True
    assert local_cfg.base_url == "http://localhost:11434/v1"
    assert local_cfg.model == "qwen2.5:7b"
    assert local_cfg.api_key == "ollama"

    cloud_cfg = resolve_provider_config("cloud", cloud_api_key="sk-test-123")
    assert cloud_cfg.is_local is False
    assert cloud_cfg.base_url == "https://api.openai.com/v1"
    assert cloud_cfg.model == "gpt-4o-mini"

    with pytest.raises(ValueError):
        resolve_provider_config("cloud", cloud_api_key=None)
    with pytest.raises(ValueError):
        resolve_provider_config("unknown")


def test_query_openai_compatible_with_mock_transport():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        captured["auth"] = request.headers.get("Authorization")
        captured["body"] = json.loads(request.content.decode("utf-8"))
        return httpx.Response(
            200,
            json={"choices": [{"message": {"content": '{"vendor":"PTT","total":500.0}'}}]},
        )

    cfg = resolve_provider_config("ollama", model="qwen2.5:3b")
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        out = query_openai_compatible(cfg, "สกัดใบเสร็จ", "บิล ปตท. 500 บาท", client=client)

    assert out == '{"vendor":"PTT","total":500.0}'
    assert captured["url"] == "http://localhost:11434/v1/chat/completions"
    assert captured["auth"] == "Bearer ollama"
    assert captured["body"]["model"] == "qwen2.5:3b"
    assert captured["body"]["temperature"] == 0.0
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases โดยไม่ต้องต่อเน็ตหรือมี API key",
      "ตรวจว่า `estimate_model_memory_gb(7.0, \"Q4_K_M\")` คืน `5.43` GB เทียบกับ `FP16` ที่ `16.70` GB",
      "ตรวจว่า `select_safe_quant(14.0, 8.0)` คืน `None` เพื่อเตือนว่าเครื่อง 8 GB รันโมเดล 14B ไม่ไหว",
      "ตรวจว่า `query_openai_compatible` ส่ง `Authorization: Bearer ollama` ไปยัง `/v1/chat/completions` ได้ถูกต้อง",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day83.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `estimate_model_memory_gb` เช็ก `if params_b <= 0 or kv_cache_gb < 0 or overhead_ratio < 1.0 or quant not in QUANT_BYTES_PER_PARAM: raise ValueError(...)` ก่อนคำนวณ `round(params_b * QUANT_BYTES_PER_PARAM[quant] * overhead_ratio + kv_cache_gb, 2)`",
      },
      {
        body: "ใน `select_safe_quant` คำนวณ `budget = available_mem_gb * headroom_ratio` แล้ววน `for q in (\"FP16\", \"Q8_0\", \"Q4_K_M\", \"Q4_0\"):` คืน `q` ตัวแรกที่มีหน่วยความจำ `<= budget`",
      },
      {
        body: "ตัวอย่าง `resolve_provider_config` และ `query_openai_compatible` — เติมฟังก์ชันคำนวณหน่วยความจำสองตัวแรกให้ครบ",
        code: {
          language: "python",
          filename: "hint_day83.py",
          code: `def resolve_provider_config(
    provider: str,
    *,
    model: str | None = None,
    cloud_api_key: str | None = None,
    ollama_host: str = "http://localhost:11434",
) -> ProviderConfig:
    if provider == "ollama":
        return ProviderConfig(
            provider="ollama",
            base_url=f"{ollama_host.rstrip('/')}/v1",
            api_key="ollama",
            model=model or "qwen2.5:7b",
            is_local=True,
        )
    if provider == "cloud":
        if not cloud_api_key or not cloud_api_key.strip():
            raise ValueError("cloud_api_key is required for cloud provider")
        return ProviderConfig(
            provider="cloud",
            base_url="https://api.openai.com/v1",
            api_key=cloud_api_key,
            model=model or "gpt-4o-mini",
            is_local=False,
        )
    raise ValueError(f"Unsupported provider: {provider}")`,
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
      title: "ดึงโมเดลใหญ่เกิน RAM/VRAM ที่มีแล้วสงสัยว่าทำไมช้าแค่ 1–2 tok/s",
      symptom: "เครื่อง RAM 16 GB แต่ดึงโมเดล 32B Q4 (~20 GB) มารัน พัดลมดังสนั่นและกว่าจะตอบจบประโยคใช้เวลาเป็นนาที",
      fix: "คำนวณขนาดหน่วยความจำก่อนดึงโมเดลเสมอ (`params_b × bytes_per_param × 1.15 + kv_cache`) ให้ไม่เกิน 80% ของ RAM/VRAM ที่ว่าง",
    },
    {
      title: "ใช้ Quantization ต่ำเกินไป (`Q2_K`) กับงานสกัดเอกสารภาษาไทย",
      symptom: "ประหยัด RAM จริง แต่โมเดลเริ่มพ่นภาษาไทยเพี้ยน, ลืมปิดปีกกา JSON หรือหลุดคำสั่งระบบบ่อยมาก",
      fix: "ใช้ `Q4_K_M` เป็นค่าพื้นฐานขั้นต่ำสำหรับงานจริง (หรือ `Q8_0` หากหน่วยความจำพอ) และหลีกเลี่ยง 2-bit สำหรับงาน production",
    },
    {
      title: "ผูกโค้ดทั้งโปรเจกต์เข้ากับ REST API เฉพาะของ Ollama จนสลับไป Cloud ไม่ได้",
      symptom: "เขียนเรียก `/api/generate` แบบเฉพาะของ Ollama ไว้ทั่วโปรเจกต์ พอต้องการเทียบหรือ fallback ไป Cloud API ต้องแก้โค้ดใหม่ทั้งหมด",
      fix: "ใช้ OpenAI-compatible endpoint (`http://localhost:11434/v1`) เพื่อให้สลับระหว่าง Local Ollama และ Cloud API ได้ด้วยคอนฟิก `base_url` + `model` เท่านั้น",
    },
    {
      title: "นำ Ollama บนโน้ตบุ๊กไปรองรับทราฟฟิก Production ที่มีผู้ใช้พร้อมกันหลายสิบคน",
      symptom: "คิวรอคำตอบยาวเหยียดและ {{ttft}} พุ่งทะลุ 30 วินาทีเมื่อมี request เข้ามาพร้อมกัน",
      fix: "ใช้ Ollama สำหรับ local dev, internal tools ที่มี concurrency ต่ำ, หรือ batch ส่วนตัว — หากต้องการ self-host รองรับผู้ใช้จำนวนมาก ให้ใช้ vLLM ใน Phase 5",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d083-q1",
        "Quantization ระดับ `Q4_K_M` ในไฟล์ GGUF ช่วยให้รันโมเดลขนาด 7B บนโน้ตบุ๊กทั่วไปได้อย่างไร?",
        [
          ["ตัดพารามิเตอร์ครึ่งหนึ่งของโมเดลทิ้งไปเลย", "ไม่ใช่การตัดชั้นหรือพารามิเตอร์ทิ้ง แต่เป็นการลดจำนวนบิตที่ใช้เก็บตัวเลขแต่ละค่าน้ำหนัก"],
          ["ลดความละเอียดการเก็บน้ำหนักจาก 16-bit (`~2.0 bytes/param`) ลงเหลือเฉลี่ย ~4.8-bit (`~0.60 bytes/param`) ทำให้ขนาดหดจาก ~14 GB เหลือ ~4.5 GB โดยยังรักษาคุณภาพไว้ได้สูง", "ถูก — ลดทั้งการใช้ RAM/VRAM และลดปริมาณข้อมูลที่ต้องอ่านจากหน่วยความจำในแต่ละ token"],
          ["ย้ายการประมวลผลทั้งหมดไปฝากไว้บน Cloud Server ของ Ollama", "Ollama รันบนเครื่องของคุณ 100% ไม่ได้ส่งข้อมูลไปคลาวด์"],
          ["เปลี่ยนภาษาไทยทั้งหมดให้เป็นภาษาอังกฤษก่อนเข้าโมเดล", "ไม่เกี่ยวกับการแปลภาษา เป็นการบีบอัดตัวเลขค่าน้ำหนักของโมเดล"],
        ],
        "B",
        "GGUF `Q4_K_M` บีบอัดน้ำหนักจาก 16-bit ลงเหลือ ~4.8-bit เฉลี่ย ทำให้ขนาดไฟล์และหน่วยความจำลดลงกว่า 3 เท่าในขณะที่ความแม่นยำลดลงน้อยมาก",
        "เหตุใด `Q4_K_M` จึงเป็นระดับ Quantization ยอดนิยมสำหรับการรัน Local LLM?",
        "ลดขนาดหน่วยความจำลงกว่า 3× เมื่อเทียบกับ FP16 (เช่น 7B จาก ~14 GB เหลือ ~4.5 GB) โดยยังคงคุณภาพภาษาและ JSON ไว้ได้ใกล้เคียงเดิม",
      ),
      mc(
        "d083-q2",
        "เหตุใดการเชื่อมต่อ Ollama ผ่าน `http://localhost:11434/v1` ด้วย Official OpenAI SDK จึงเป็นแนวปฏิบัติที่ดีกว่าการเขียนโค้ดเฉพาะค่าย?",
        [
          ["เพราะจะทำให้ได้ใช้โควตา Cloud API ฟรีจาก OpenAI", "ไม่ใช่ — request วิ่งเข้า `localhost` บนเครื่องคุณ ไม่ได้เชื่อมต่อ OpenAI Cloud"],
          ["เพราะใช้สัญญา HTTP/JSON มาตรฐานเดียวกัน ทำให้สลับระหว่าง Local Ollama (dev/PDPA) กับ Cloud API (prod) ได้โดยแก้แค่ `base_url`, `api_key` และ `model`", "ถูก — ลด vendor lock-in และทำให้ benchmark เทียบสองฝั่งบนโค้ดชุดเดียวกันได้ง่ายมาก"],
          ["เพราะ endpoint `/v1` บีบอัดโมเดลเป็น `Q4_K_M` ให้อัตโนมัติ", "ระดับ quantization ถูกกำหนดตอนเลือก tag ของโมเดลที่ `ollama pull`"],
          ["เพราะ Ollama ไม่รองรับการเรียกผ่าน HTTP ปกติ", "Ollama รองรับ HTTP ทั้งแบบ native (`/api/chat`) และ OpenAI-compatible (`/v1/chat/completions`)"],
        ],
        "B",
        "การใช้ OpenAI-compatible interface (`base_url=\"http://localhost:11434/v1\"`) ทำให้โค้ดแอปและชุดทดสอบเป็น provider-agnostic สลับ Local/Cloud ได้ทันที",
        "ข้อดีของการเรียก Ollama ผ่าน `http://localhost:11434/v1` คืออะไร?",
        "ใช้โค้ด Official SDK ชุดเดียวกับ Cloud API ได้เลย แค่เปลี่ยน `base_url` และ `model` ไม่ติด vendor lock-in",
      ),
      mc(
        "d083-q3",
        "เครื่องโน้ตบุ๊กมีหน่วยความจำที่จัดสรรให้โมเดลได้ 16 GB และตั้งเกณฑ์ปลอดภัยไม่เกิน 80% (12.8 GB) หากต้องการรันโมเดล 7B (`kv_cache = 0.6 GB`, `overhead = 1.15`) ควรเลือกระดับ Quantization ใด?",
        [
          ["`FP16` (~16.70 GB)", "เกิน 12.8 GB และเกิน 16 GB ทั้งเครื่อง จะเกิด disk swapping จนช้ามาก"],
          ["`Q8_0` (~9.13 GB)", "ถูก — 9.13 GB อยู่ในงบปลอดภัย 12.8 GB และให้คุณภาพสูงสุดใกล้เคียง FP16"],
          ["`Q2_K` (~2.5 GB) เท่านั้น", "ไม่จำเป็นต้องลดคุณภาพลงไปถึง 2-bit เพราะเครื่อง 16 GB รัน `Q8_0` หรือ `Q4_K_M` ได้สบาย"],
          ["รันโมเดล 7B บนเครื่อง 16 GB ไม่ได้เลย", "รันได้สบายมากทั้ง `Q8_0` และ `Q4_K_M`"],
        ],
        "B",
        "โมเดล 7B ที่ `Q8_0` ใช้ `7 × 1.06 × 1.15 + 0.6 ≈ 9.13 GB` ซึ่งต่ำกว่างบปลอดภัย 12.8 GB จึงได้คุณภาพแทบเท่า FP16 โดยไม่กินเกิน RAM",
        "สูตรประมาณ RAM/VRAM ที่ต้องใช้สำหรับรันโมเดล GGUF คืออะไร?",
        "`(params_b × bytes_per_param) × 1.15 + kv_cache_gb` และควรคุมให้อยู่ใน ~80% ของหน่วยความจำที่ว่าง",
      ),
      mc(
        "d083-q4",
        "สถานการณ์ใดที่ Local Open-Weights (Ollama) ได้เปรียบ Cloud API อย่างชัดเจนที่สุด?",
        [
          ["ต้องการโมเดลที่ฉลาดระดับ Frontier ที่สุดสำหรับการวิจัยปัญหาคณิตศาสตร์ขั้นสูง", "งานที่ต้องการความฉลาดระดับสูงสุดยังเป็นจุดแข็งของ Frontier Cloud models"],
          ["ต้องประมวลผลเอกสารสัญญาและข้อมูลส่วนบุคคล {{pdpa}} ที่ห้ามส่งออกนอกเครือข่ายองค์กร รวมถึงการรันพัฒนาและทดลอง prompt บนเครื่องแบบฟรี 0 บาท", "ถูก — ข้อมูลไม่เคยหลุดออกนอกเครื่องและไม่มีค่าใช้จ่ายต่อ token"],
          ["ต้องรองรับผู้ใช้แชตพร้อมกัน 500 คนโดยใช้โน้ตบุ๊กเครื่องเดียว", "โน้ตบุ๊กเครื่องเดียวรับ concurrency สูงไม่ได้ ต้องใช้คลัสเตอร์ GPU + vLLM หรือ Cloud API"],
          ["ไม่อยากใช้ RAM หรือพื้นที่ดิสก์บนเครื่องเลยแม้แต่เมกะไบต์เดียว", "Local LLM ต้องดาวน์โหลดไฟล์น้ำหนักขนาดหลาย GB และใช้ RAM/VRAM ของเครื่อง"],
        ],
        "B",
        "จุดแข็งหลักของ Local Ollama คือ Data Privacy ตามนโยบาย PDPA/องค์กร, การทำงานออฟไลน์ และต้นทุนพัฒนาต่อ token เป็นศูนย์",
        "2 ข้อได้เปรียบหลักของ Local Ollama เมื่อเทียบกับ Cloud API คืออะไร?",
        "1) ข้อมูลไม่เคยออกนอกเครื่อง (ตอบโจทย์ PDPA/ความลับองค์กร) และ 2) ต้นทุนต่อ token เป็น 0 บาท เหมาะกับการพัฒนาและงานภายใน",
      ),
    ],
  },

  takeaways: [
    "{{quantization}} ในฟอร์แมต GGUF (โดยเฉพาะ `Q4_K_M` ที่ ~0.60 bytes/param) ลดขนาดโมเดลลงกว่า 3× ทำให้รัน Open-Weights {{llm}} อย่าง `Qwen2.5:7B` บนโน้ตบุ๊กได้ลื่นโดยคุณภาพแทบไม่ตก",
    "คำนวณขนาดหน่วยความจำก่อนโหลดโมเดลเสมอด้วยสูตร `(params_b × bytes_per_param) × 1.15 + kv_cache_gb` และคุมให้อยู่ใน ~80% ของ RAM/VRAM ที่ว่าง",
    "เชื่อมต่อ Ollama ผ่าน OpenAI-compatible API (`http://localhost:11434/v1`) เพื่อให้โค้ดแอปสลับระหว่าง Local และ Cloud ได้โดยแก้แค่คอนฟิก",
    "Local Ollama เด่นเรื่องความเป็นส่วนตัว {{pdpa}} และงบพัฒนา 0 บาท แต่มีเพดานด้านความฉลาดของโมเดลเล็กและ concurrency เมื่อเทียบกับ Cloud หรือ vLLM",
  ],

  reviewCards: [
    rc(
      "d083-rc-1",
      "ขนาดหน่วยความจำโดยประมาณของโมเดล 7B ในระดับ `FP16`, `Q8_0` และ `Q4_K_M` (รวม overhead + KV cache) ต่างกันอย่างไร?",
      "`FP16` ≈ 16.7 GB, `Q8_0` ≈ 9.1 GB, `Q4_K_M` ≈ 5.4 GB — ดังนั้น `Q4_K_M` รันได้แม้บนเครื่อง 8–16 GB",
    ),
    rc(
      "d083-rc-2",
      "ต้องตั้งค่าใดใน Official OpenAI Python SDK เพื่อยิงเข้า Local Ollama แทน OpenAI Cloud?",
      "ตั้ง `base_url=\"http://localhost:11434/v1\"`, `api_key=\"ollama\"` (ค่าไม่ว่าง) และ `model` เป็นชื่อโมเดลใน Ollama เช่น `qwen2.5:7b`",
    ),
    rc(
      "d083-rc-3",
      "ข้อจำกัดหลัก 2 อย่างของ Ollama ที่ต้องรู้ก่อนนำไปขึ้น Production คืออะไร?",
      "1) โมเดลขนาดเล็ก (3B–8B) บนเครื่องทั่วไปมีความแม่นยำบนงานซับซ้อนต่ำกว่า Frontier Cloud และ 2) ไม่ได้ออกแบบมาเพื่อ high concurrency (ต้องใช้ vLLM บน GPU server ใน Phase 5)",
    ),
  ],

  sources: [
    { label: "Ollama Documentation — OpenAI Compatibility", href: "https://github.com/ollama/ollama/blob/main/docs/openai.md" },
    { label: "Ollama Model Library (Qwen2.5, Gemma, Llama)", href: "https://ollama.com/library" },
    { label: "llama.cpp — GGUF Format & Quantization Guide", href: "https://github.com/ggerganov/llama.cpp/blob/master/tools/quantize/README.md" },
    { label: "HTTPX Documentation — MockTransport for Offline Testing", href: "https://www.python-httpx.org/advanced/transports/#mock-transport" },
  ],

  glossary: ["quantization", "llm", "pdpa", "structured-output", "ttft", "httpx", "temperature", "mocking"],
});
