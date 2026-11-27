import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D082 — Phase 3 / Block B21
 * Batch APIs & Offline Async Processing for Cost Reduction
 */
export const d082: Lesson = defineLesson({
  day: 82,
  titleTh: "ลดต้นทุน LLM ลง 50% ด้วย Batch API และการประมวลผลออฟไลน์แบบ Idempotent",
  tagline: "30 นาที · รันสร้างไฟล์ Batch JSONL และจับคู่ผลลัพธ์บนเครื่องได้ 100% · ออกแบบคิวออฟไลน์ด้วย custom_id ที่ไม่พังเมื่อผลสลับลำดับ",
  icon: "boxes",
  visual: {
    id: "multimodal-batch-flow",
    title: "Batch API Workflow — แพ็ก JSONL ส่งประมวลผลออฟไลน์ประหยัดงบ 50%",
    caption: "ดูขั้นตอนสร้าง batch_input.jsonl ด้วย custom_id → submit → poll → จับคู่ผลลัพธ์กลับอย่างปลอดภัย",
    alt: "แผนภาพขั้นตอนการทำงานของ Batch API ด้วยไฟล์ JSONL",
  },
  requiresApiKey: true,
  apiKeyNote: "สร้างไฟล์ Batch JSONL และจำลองการจับคู่ผลลัพธ์ด้วย custom_id บนเครื่องได้ 100%",
  tools: ["Official SDK", "Pydantic v2", "JSONL", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "แพ็กเอกสารจำนวนมากเป็นไฟล์ JSONL พร้อม `custom_id` ที่ไม่ซ้ำ",
      body: "งานที่ไม่ต้องการคำตอบทันที (เช่น สกัดใบเสร็จย้อนหลัง 50,000 ใบ, สรุปรีวิวรายคืน, หรือรันชุดประเมินผล) สามารถแพ็กเป็นไฟล์ {{jsonl}} 1 บรรทัดต่อ 1 request แล้วส่งเข้า {{batch-api}} ในรอบเดียว",
      lessonNote: "วันนี้เราสร้างตัวผลิต `batch_input.jsonl` ที่ผูก `custom_id` เชิงธุรกิจ (เช่น `doc:INV-2026-001:v1`) เพื่อรองรับการรันซ้ำอย่างปลอดภัย",
    },
    {
      node: 2,
      heading: "แลกเวลาคิว 24 ชั่วโมงกับส่วนลดค่า API 50% และโควตา Rate Limit แยกต่างหาก",
      body: "ผู้ให้บริการ {{llm}} นำงาน {{batch-api}} ไปรันในช่วงที่ GPU ว่าง จึงลดราคาลง ~50% และแยกโควตา {{rate-limit}} ออกจากทราฟฟิก real-time ทำให้ไม่กระทบผู้ใช้ที่กำลังแชตอยู่หน้าเว็บ",
      lessonNote: "เราจะคำนวณจุดคุ้มทุนเทียบระหว่าง Real-Time API กับ Batch API และเรียนรู้วิธีส่ง-ติดตามสถานะงานอย่างเป็นระบบ",
    },
    {
      node: 3,
      heading: "จับคู่ผลลัพธ์ที่สลับลำดับและจัดการ Partial Failures แบบ Idempotent",
      body: "ไฟล์ผลลัพธ์จาก Batch API **ไม่รับประกันลำดับบรรทัด** เหมือนตอนส่งเข้าไป และอาจมีบางรายการ error หรือหลุดหาย การจับคู่กลับด้วย `custom_id` และแยกคิว retry เฉพาะรายการที่ตกหล่นคือหัวใจของ {{idempotency}}",
      lessonNote: "แบบฝึกหัดวันนี้สร้างตัว reconciler ที่จับคู่ผลลัพธ์นอกลำดับ ตรวจสคีมาด้วย {{pydantic}} และคัดเฉพาะ `custom_id` ที่ต้องส่งซ่อม",
    },
    {
      node: 5,
      heading: "ติดตามต้นทุนและอัตราความสำเร็จของ Batch Job ใน Production",
      body: "งาน batch ขนาดใหญ่ต้องบันทึกสรุปจำนวน `succeeded`, `failed`, `missing` และต้นทุนรวมหลังส่วนลด 50% เพื่อให้ย้อนตรวจสอบและทำซ้ำได้อย่างมี {{reproducibility}}",
      lessonNote: "โครงสร้าง Batch Reconciler ของวันนี้พร้อมนำไปใช้กับงานสกัดเอกสารและงานรัน Evals ใน Phase 5 ทันที",
    },
  ],

  objectives: [
    "**ตัดสินใจ** เลือกระหว่าง Real-Time API กับ {{batch-api}} ได้อย่างเหมาะสมตามเงื่อนไข Latency, ต้นทุน 50% และโควตา {{rate-limit}}",
    "**สร้าง** ไฟล์ `batch_input.jsonl` ที่มีโครงสร้าง {{payload}} ถูกต้องและกำหนด `custom_id` แบบ deterministic เพื่อรองรับ {{idempotency}}",
    "**เขียนโค้ด** Batch Reconciler ที่รับมือกับผลลัพธ์สลับลำดับ (out-of-order), รายการที่ error บางส่วน (partial failures) และรายการที่สูญหาย พร้อมคำนวณงบที่ประหยัดได้",
  ],

  prerequisites: [
    "การอ่าน/เขียนไฟล์ {{jsonl}} แบบ streaming (Day 5)",
    "{{idempotency}} และ {{rate-limit}} (Day 15)",
    "{{pydantic}} v2 Strict {{schema}} สำหรับงาน extraction (Day 77)",
    "Python พื้นฐานและ `pytest` — แบบฝึกหัดทั้งหมดรันออฟไลน์บนเครื่องได้ 100%",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ด้วย `uv` พร้อม `pydantic` และ `openai` SDK — เราจะสร้างไฟล์ `batch_input.jsonl` และจำลองผลลัพธ์ `batch_output.jsonl` บนเครื่อง 100% โดยไม่เสียค่า API",
    commands: `uv init ai-day82 && cd ai-day82
uv add pydantic openai
uv add --dev pytest ruff
uv run python -c "import json, pydantic; print('Ready for Batch API lab | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day82` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `openai` และ `pytest` สำเร็จ"],
      ["verify", "รันคำสั่งทดสอบสภาพแวดล้อมผ่านโดยไม่มี error"],
    ],
    note: "โครงสร้างไฟล์ Batch JSONL ของ OpenAI (`custom_id`, `method`, `url`, `body`) เป็นรูปแบบมาตรฐานที่ Anthropic Message Batches และ Gemini Batch API ใช้แนวคิดเดียวกันแทบทั้งหมด (ต่างเพียงชื่อ field ย่อยเล็กน้อย)",
  },

  concepts: [
    {
      id: "when-batch-api-wins",
      title: "1 · เมื่อไรควรใช้ Batch API (ประหยัด 50% + แยกโควตา Rate Limit)",
      paragraphs: [
        "ความผิดพลาดด้านต้นทุนที่เจอบ่อยที่สุดในทีม AI คือการนำงาน **เบื้องหลัง (Offline / Async)** เช่น แปลงใบเสร็จย้อนหลัง 20,000 ใบ, จัดหมวดรีวิวลูกค้าประจำคืน, หรือสร้างข้อมูลทดสอบ 5,000 ข้อ ไปยิงใส่ Real-Time Chat API ด้วย `asyncio` จนทั้งจ่ายแพงเต็มราคาและไปแย่งโควตา {{rate-limit}} ของผู้ใช้หน้าเว็บ",
        "**{{batch-api}}** ออกแบบมาเพื่องานที่ไม่ต้องตอบภายในวินาทีนี้: คุณส่งคำขอทั้งหมดเป็นชุดเดียวในไฟล์ {{jsonl}} ผู้ให้บริการรับประกันว่าจะประมวลผลเสร็จภายในหน้าต่างเวลา (โดยทั่วไป ≤ 24 ชั่วโมง แต่มักเสร็จจริงในไม่กี่นาทีถึงไม่กี่ชั่วโมง) แลกกับ **ส่วนลด ~50% ของราคาทั้ง Input และ Output tokens** และโควตาคิวที่สูงกว่า Real-Time หลายเท่า",
        "เกณฑ์ตัดสินใจง่าย ๆ: ถ้ามนุษย์กำลังจ้องหน้าจอรอคำตอบอยู่ (Chatbot, Autocomplete) → ใช้ Real-Time + Streaming แต่ถ้างานรอได้เกิน 15–60 นาที (Backfill, Nightly ETL, Offline Evals, Document Indexing) → ส่งเข้า Batch API แทบทุกกรณี",
      ],
      analogy: "Real-Time API เหมือนส่งพัสดุด่วนมอเตอร์ไซค์ถึงภายใน 30 นาทีแต่จ่ายราคาเต็ม ส่วน Batch API เหมือนส่งพัสดุรวมกล่องรอบค่ำถึงพรุ่งนี้เช้าแต่ค่าส่งลดครึ่งราคาและไม่แย่งคนขับกับออเดอร์ด่วน",
      bullets: [
        "**เหมาะมากกับ Batch API**: Backfill เอกสารเก่า, สรุปรีวิวรายวัน, สกัด metadata เข้า RAG, รันชุด Evals ขนาดใหญ่",
        "**ไม่เหมาะกับ Batch API**: แชตบอตหน้าเว็บ, แจ้งเตือนฉุกเฉิน, งานที่ต้องรู้ผลทันทีใน request-response cycle",
        "**ข้อดีที่ซ่อนอยู่**: ลดโค้ดจัดการ `429 Too Many Requests` และการคุม concurrency เองบนเครื่องคุณ",
      ],
      whyTitle: "Why this matters — 50% ที่ประหยัดได้คือความแตกต่างระหว่างโปรเจกต์ที่คุ้มทุนกับขาดทุน",
      whyParagraphs: [
        "สมมติบริษัทต้องสกัดเอกสารไทยเดือนละ 500,000 หน้า ค่า Real-Time API อยู่ที่ $600/เดือน แค่ย้ายงานรอบกลางคืนไปใช้ Batch API ยอดบิลจะเหลือ $300/เดือนทันทีโดยใช้โมเดลคุณภาพเท่าเดิม 100%",
        "และเพราะ Batch API มีโควตาแยกต่างหาก คุณสามารถรันงาน backfill ใหญ่ได้โดยไม่ต้องกังวลว่าจะทำให้ระบบแชตลูกค้าหน้าบ้านติด HTTP 429",
      ],
    },
    {
      id: "batch-jsonl-custom-id",
      title: "2 · โครงสร้าง `batch_input.jsonl` และการออกแบบ `custom_id` ที่ปลอดภัย",
      paragraphs: [
        "ไฟล์อินพุตของ {{batch-api}} คือไฟล์ {{jsonl}} ที่แต่ละบรรทัดเป็น JSON object 1 รายการ ประกอบด้วย 4 คีย์หลัก: `custom_id` (รหัสอ้างอิงเฉพาะที่ไม่ซ้ำกันภายในไฟล์), `method` (`\"POST\"`), `url` (เช่น `\"/v1/chat/completions\"`), และ `body` ({{payload}} คำขอ API ปกติที่รวม `model`, `messages`, `temperature`, `response_format` สำหรับ {{structured-output}})",
        "หัวใจที่ทำให้ระบบไม่พังคือการออกแบบ **`custom_id`** ให้มีคุณสมบัติ **Unique + Deterministic** เช่น `f\"inv:{doc_id}:schema_v2\"` ไม่ควรใช้เลขลำดับ `\"row-0\"`, `\"row-1\"` เพราะถ้าลำดับไฟล์ต้นฉบับเปลี่ยนหรือมีการรันซ้ำเฉพาะบางรายการ คุณจะจับคู่ผลลัพธ์กลับเข้าฐานข้อมูลผิดแถวทันที",
      ],
      analogy: "`custom_id` คือบาร์โค้ดป้ายติดกระเป๋าเดินทาง — ต่อให้สายพานส่งกระเป๋าออกมาสลับลำดับกับตอนเช็กอิน เราก็ยังรู้ 100% ว่าใบไหนเป็นของใคร",
      code: {
        language: "python",
        filename: "batch_builder.py",
        code: `import json
from pathlib import Path


def make_batch_line(custom_id: str, prompt_text: str, model: str = "gpt-4o-mini") -> dict:
    return {
        "custom_id": custom_id,
        "method": "POST",
        "url": "/v1/chat/completions",
        "body": {
            "model": model,
            "temperature": 0.0,
            "messages": [
                {"role": "system", "content": "สกัดเลขใบแจ้งหนี้และยอดรวมเป็น JSON"},
                {"role": "user", "content": prompt_text},
            ],
            "response_format": {"type": "json_object"},
        },
    }


def write_batch_jsonl(records: list[tuple[str, str]], out_path: Path) -> int:
    seen: set[str] = set()
    with out_path.open("w", encoding="utf-8") as f:
        for custom_id, text in records:
            if custom_id in seen:
                raise ValueError(f"Duplicate custom_id: {custom_id}")
            seen.add(custom_id)
            f.write(json.dumps(make_batch_line(custom_id, text), ensure_ascii=False) + "\\n")
    return len(seen)`,
        caption: "ตรวจสอบ `custom_id` ซ้ำตั้งแต่ก่อนเขียนไฟล์ (`fail-fast`) เพราะ Batch API จะปฏิเสธทั้งไฟล์หรือทับผลลัพธ์หากมี `custom_id` ซ้ำกัน",
      },
      whyTitle: "Why this matters — กันบิลสูญเปล่าก่อนอัปโหลดไฟล์ใหญ่",
      whyParagraphs: [
        "ไฟล์ Batch 1 ไฟล์อาจบรรจุคำขอถึง 50,000 บรรทัด (หรือขนาดสูงสุด ~100–200 MB ตามข้อจำกัดผู้ให้บริการ) หากมี JSON พังหรือ `custom_id` ซ้ำแม้แต่บรรทัดเดียว งานทั้งก้อนอาจถูกปฏิเสธหลังรอคิวไปหลายนาที",
        "การตรวจความถูกต้องของ `custom_id` และขนาด batch (chunking ไฟล์ใหญ่เป็นหลาย batch ย่อย) บนเครื่องก่อนอัปโหลดช่วยประหยัดเวลาดีบักได้มหาศาล",
      ],
    },
    {
      id: "reconcile-out-of-order-idempotent",
      title: "3 · จับคู่ผลลัพธ์สลับลำดับและจัดการ Partial Failures แบบ Idempotent",
      paragraphs: [
        "เมื่อ Batch Job เสร็จสมบูรณ์ คุณจะได้ไฟล์ผลลัพธ์ (`output_file_id`) และอาจมีไฟล์ข้อผิดพลาด (`error_file_id`) แยกต่างหาก กฎสำคัญที่สุดที่ห้ามลืมคือ **ลำดับบรรทัดในไฟล์ผลลัพธ์ไม่จำเป็นต้องตรงกับไฟล์อินพุต** เพราะฝั่งเซิร์ฟเวอร์ประมวลผลแบบขนานบนหลาย worker — ห้ามใช้ `zip(input_rows, output_rows)` เด็ดขาด!",
        "วิธีที่ถูกต้องคือ **Reconcile ด้วย `custom_id`**: อ่านผลลัพธ์ทั้งหมดเข้า dictionary ที่คีย์ด้วย `custom_id`, ตรวจ `status_code == 200` และ `error is None`, จากนั้นส่งเนื้อหา JSON เข้า {{pydantic}} `model_validate_json()` เพื่อกรองผลที่ผิดสคีมาออก แล้วสรุปรายการเป็น 3 กองชัดเจน:",
      ],
      analogy: "เหมือนฝ่ายตรวจข้อสอบที่ได้รับกระดาษคำตอบคืนมาแบบสลับกอง — เราเช็กชื่อ-รหัสนักศึกษาบนหัวกระดาษ (`custom_id`) เพื่อกรอกคะแนนลงตารางให้ตรงคน ใครกระดาษหายหรือเขียนผิดรูปก็แยกชื่อไว้สอบซ่อมเฉพาะคนนั้น ไม่ต้องเรียกทั้งห้องมาสอบใหม่",
      bullets: [
        "**`succeeded`**: ผ่าน HTTP 200 + ผ่าน Pydantic schema → บันทึกผลลงฐานข้อมูลแบบ upsert (เขียนทับด้วย `custom_id` อย่าง {{idempotency|idempotent}})",
        "**`failed`**: มี `error` จาก API, `status_code != 200`, หรือพังตอน `ValidationError` → เก็บสาเหตุเพื่อนำไปสร้าง retry batch",
        "**`missing`**: มีอยู่ใน `expected_ids` ตอนส่ง แต่ไม่โผล่ในผลลัพธ์ (เช่น expired) → รวมเข้าคิว retry เฉพาะรายการที่ขาด ไม่ยิงซ้ำรายการที่สำเร็จแล้ว",
      ],
      whyTitle: "Why this matters — ประหยัดงบสองต่อด้วย Selective Retry",
      whyParagraphs: [
        "ถ้าคุณส่ง 10,000 เอกสารแล้วพังไป 42 เอกสาร ระบบที่ไม่มี `custom_id` reconciliation มักเผลอสั่งรันใหม่ทั้ง 10,000 เอกสาร ทำให้เสียเงินซ้ำและข้อมูลเบิ้ลในฐานข้อมูล",
        "เมื่อคัดแยกเฉพาะ `failed + missing` ออกมาสร้าง retry batch ขนาด 42 บรรทัด และบันทึกด้วยคีย์ `custom_id` ระบบจะทนทานต่อความผิดพลาดและรันซ้ำกี่รอบผลลัพธ์ก็ยังสะอาดเหมือนเดิม",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Batch API ≈ Async Job Queue (SQS/BullMQ) + Bulk Upsert",
      body: [
        "ถ้าคุณเคยออกแบบระบบ Background Job ในฝั่งเว็บ (ส่ง job ลงคิว → ได้ `job_id` → poll สถานะหรือรับ webhook → ดึงผลมาอัปเดตฐานข้อมูลด้วย `correlation_id`) นั่นคือสถาปัตยกรรมเดียวกับ LLM Batch API ทุกประการ",
        "กฎ *\"ห้ามเชื่อลำดับผลลัพธ์ ให้จับคู่ด้วย `custom_id`\"* เหมือนกับการจับคู่ผลจาก `Promise.allSettled` หรือ message queue ที่ worker เสร็จไม่พร้อมกัน และบันทึกด้วย `INSERT ... ON CONFLICT (custom_id) DO UPDATE`",
      ],
      table: [
        ["`batch_input.jsonl`", "Bulk job payload ที่อัปโหลดเข้า Object Storage/Queue"],
        ["`custom_id`", "`correlation_id` / Idempotency Key ต่อรายการ"],
        ["`client.batches.retrieve(batch_id)`", "Poll status ของ async background job"],
        ["Selective Retry (`failed + missing`)", "Dead-Letter Queue (DLQ) replay เฉพาะรายการที่พลาด"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมไฟล์ผลลัพธ์ถึงสลับลำดับและ `zip()` ถึงอันตราย",
      body: [
        "จินตนาการว่าคุณส่งการบ้าน 3 ข้อให้เพื่อน 3 คนช่วยกันทำพร้อมกัน คนที่ทำข้อ 3 อาจส่งเสร็จก่อนคนที่ทำข้อ 1 — ฝั่งเซิร์ฟเวอร์ Batch API ก็มีคอมพิวเตอร์หลายเครื่องช่วยกันรันแต่ละบรรทัดพร้อมกัน ผลลัพธ์จึงถูกเขียนลงไฟล์ตามลำดับที่ *\"เสร็จ\"* ไม่ใช่ลำดับที่ *\"ส่ง\"*",
        "ถ้าคุณใช้ `zip(inputs, outputs)` จับคู่บรรทัดที่ 1 กับบรรทัดที่ 1 ตรง ๆ คำตอบของข้อ 3 จะถูกไปแปะให้ข้อ 1 ทันที! นี่จึงเป็นเหตุผลว่าต้องจับคู่ด้วย `custom_id` เสมอ",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เราต้องสกัดข้อมูลใบแจ้งหนี้ไทย 4 ใบแบบออฟไลน์ เริ่มจากสร้าง `batch_input.jsonl` ด้วย `custom_id` ที่ไม่ซ้ำ → คำนวณงบที่ประหยัดได้ 50% → จำลองไฟล์ `batch_output.jsonl` ที่สลับลำดับและมี 1 รายการพัง + 1 รายการหาย เพื่อทดสอบการจับคู่กลับอย่างปลอดภัย",
    steps: [
      {
        title: "1 · สร้าง `batch_input.jsonl` และตรวจความไม่ซ้ำของ `custom_id`",
        explain: "แปลงเอกสาร 4 ใบเป็นบรรทัด JSONL พร้อม `custom_id` รูปแบบ `inv:{doc_id}:v1` และตรวจให้แน่ใจว่าไม่มี `custom_id` ซ้ำกัน",
        code: {
          language: "python",
          filename: "worked_day82.py",
          code: `import json
from pathlib import Path

DOCS = [
    ("INV-001", "ใบแจ้งหนี้ INV-001 ค่าโฮสติ้ง 1,070 บาท"),
    ("INV-002", "ใบแจ้งหนี้ INV-002 ค่าโดเมน 450 บาท"),
    ("INV-003", "ใบแจ้งหนี้ INV-003 ค่าบริการ API 2,140 บาท"),
    ("INV-004", "ใบแจ้งหนี้ INV-004 ค่าอบรมทีม 8,500 บาท"),
]


def build_batch_lines(docs: list[tuple[str, str]], model: str = "gpt-4o-mini") -> list[str]:
    seen: set[str] = set()
    lines: list[str] = []
    for doc_id, text in docs:
        cid = f"inv:{doc_id}:v1"
        if cid in seen:
            raise ValueError(f"Duplicate custom_id: {cid}")
        seen.add(cid)
        record = {
            "custom_id": cid,
            "method": "POST",
            "url": "/v1/chat/completions",
            "body": {
                "model": model,
                "temperature": 0.0,
                "messages": [
                    {"role": "system", "content": "คืน JSON ที่มี invoice_no และ total_thb"},
                    {"role": "user", "content": text},
                ],
                "response_format": {"type": "json_object"},
            },
        }
        lines.append(json.dumps(record, ensure_ascii=False))
    return lines


batch_lines = build_batch_lines(DOCS)
Path("batch_input.jsonl").write_text("\\n".join(batch_lines) + "\\n", encoding="utf-8")
print(f"Wrote {len(batch_lines)} JSONL requests. First custom_id:", json.loads(batch_lines[0])["custom_id"])`,
        },
        output: `Wrote 4 JSONL requests. First custom_id: inv:INV-001:v1`,
      },
      {
        title: "2 · คำนวณส่วนต่างต้นทุน Real-Time API vs Batch API (ลด 50%)",
        explain: "ประเมินงบสำหรับสกัดเอกสาร 50,000 ใบ (เฉลี่ย 1,200 input tokens, 180 output tokens) ด้วยอัตราค่าบริการมาตรฐานและส่วนลด Batch 50%",
        code: {
          language: "python",
          filename: "worked_day82.py",
          code: `def estimate_batch_savings(
    num_docs: int,
    avg_input_tokens: int,
    avg_output_tokens: int,
    input_per_1m_usd: float,
    output_per_1m_usd: float,
    batch_discount: float = 0.50,
) -> dict[str, float]:
    rt_in = (num_docs * avg_input_tokens / 1_000_000) * input_per_1m_usd
    rt_out = (num_docs * avg_output_tokens / 1_000_000) * output_per_1m_usd
    realtime_usd = rt_in + rt_out
    batch_usd = realtime_usd * (1.0 - batch_discount)
    return {
        "realtime_usd": round(realtime_usd, 4),
        "batch_usd": round(batch_usd, 4),
        "saved_usd": round(realtime_usd - batch_usd, 4),
    }


cost = estimate_batch_savings(50_000, 1200, 180, input_per_1m_usd=0.15, output_per_1m_usd=0.60)
print("50,000 docs cost report:", cost)`,
        },
        output: `50,000 docs cost report: {'realtime_usd': 14.4, 'batch_usd': 7.2, 'saved_usd': 7.2}`,
      },
      {
        title: "3 · จับคู่ `batch_output.jsonl` ที่สลับลำดับ มี Error และมีรายการหาย",
        explain: "จำลองผลลัพธ์ที่ `INV-003` มาก่อน `INV-001`, `INV-002` เจอ HTTP 500, และ `INV-004` หายไป — ตัว reconciler จับคู่ด้วย `custom_id` และแยก `retry_ids` อย่างแม่นยำ",
        code: {
          language: "python",
          filename: "worked_day82.py",
          code: `from pydantic import BaseModel, ConfigDict, Field, ValidationError


class MiniInvoice(BaseModel):
    model_config = ConfigDict(extra="forbid")
    invoice_no: str
    total_thb: float = Field(ge=0.0)


mock_output_lines = [
    json.dumps({
        "custom_id": "inv:INV-003:v1",
        "response": {"status_code": 200, "body": {"choices": [{"message": {"content": '{"invoice_no":"INV-003","total_thb":2140.0}'}}]}},
        "error": None,
    }),
    json.dumps({
        "custom_id": "inv:INV-001:v1",
        "response": {"status_code": 200, "body": {"choices": [{"message": {"content": '{"invoice_no":"INV-001","total_thb":1070.0}'}}]}},
        "error": None,
    }),
    json.dumps({
        "custom_id": "inv:INV-002:v1",
        "response": {"status_code": 500, "body": {}},
        "error": {"code": "server_error", "message": "temporary failure"},
    }),
]

expected_ids = [f"inv:{doc_id}:v1" for doc_id, _ in DOCS]
succeeded: dict[str, MiniInvoice] = {}
failed: dict[str, str] = {}

for raw_line in mock_output_lines:
    row = json.loads(raw_line)
    cid = row["custom_id"]
    resp = row.get("response") or {}
    if row.get("error") or resp.get("status_code") != 200:
        failed[cid] = str(row.get("error") or f"HTTP {resp.get('status_code')}")
        continue
    try:
        content = resp["body"]["choices"][0]["message"]["content"]
        succeeded[cid] = MiniInvoice.model_validate_json(content)
    except (KeyError, IndexError, ValidationError) as err:
        failed[cid] = f"parse_error: {err}"

missing = [cid for cid in expected_ids if cid not in succeeded and cid not in failed]
print("Succeeded:", sorted(succeeded.keys()))
print("Failed   :", failed)
print("Missing  :", missing)`,
        },
        output: `Succeeded: ['inv:INV-001:v1', 'inv:INV-003:v1']
Failed   : {'inv:INV-002:v1': "{'code': 'server_error', 'message': 'temporary failure'}"}
Missing  : ['inv:INV-004:v1']`,
      },
    ],
    gotcha: "อย่าลืมกรณีที่ HTTP `status_code == 200` แต่ `content` ข้างในพังตอน `model_validate_json()` (เช่น โมเดลคืนยอดติดลบหรือ JSON ขาดคีย์) — ต้องดักทั้ง API error และ Pydantic `ValidationError` ให้ไหลเข้ากลุ่ม `failed` เหมือนกัน เพื่อให้ระบบ selective retry เก็บตกได้ครบทุกเคส",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day82.py` สำหรับจัดการ LLM Batch API Pipeline แบบครบวงจรบนเครื่อง: สร้างไฟล์ `batch_input.jsonl` อย่างปลอดภัย, คำนวณส่วนลด 50%, และจับคู่ผลลัพธ์ `batch_output.jsonl` ที่สลับลำดับ/มี error/มีรายการหายเข้ากับ Pydantic schema",
    requirements: [
      "สร้าง `InvoiceBatchItem(BaseModel)` ที่ตั้ง `ConfigDict(extra=\"forbid\")` และมีฟิลด์ `invoice_no: str = Field(min_length=1)`, `category: Literal[\"cloud\", \"office\", \"travel\", \"other\"]`, `total_thb: float = Field(ge=0.0)`",
      "สร้าง `@dataclass(frozen=True) class BatchReconcileResult` ที่มีฟิลด์ `succeeded: dict[str, InvoiceBatchItem]`, `failed: dict[str, str]`, `missing_ids: tuple[str, ...]`, `retry_ids: tuple[str, ...]` (เรียงตามตัวอักษร รวมทั้ง `failed` และ `missing_ids`)",
      "สร้างฟังก์ชัน `build_batch_jsonl(items: list[tuple[str, str]], *, model: str = \"gpt-4o-mini\") -> list[str]`: ตรวจว่า `items` ไม่ว่างและ `custom_id` ไม่ซ้ำ/ไม่ว่าง (raise `ValueError`), คืนรายการ JSONL strings รูปแบบ `{\"custom_id\", \"method\": \"POST\", \"url\": \"/v1/chat/completions\", \"body\": {\"model\", \"temperature\": 0.0, \"messages\": [...], \"response_format\": {\"type\": \"json_object\"}}}`",
      "สร้างฟังก์ชัน `reconcile_batch_output(expected_ids: list[str], output_jsonl_lines: list[str]) -> BatchReconcileResult`: จับคู่ด้วย `custom_id` (ไม่พึ่งลำดับ), ข้ามบรรทัดว่าง, ตรวจ `error is None` และ `status_code == 200`, validate ด้วย `InvoiceBatchItem.model_validate_json(...)`, เก็บเคส error/validation failure ลง `failed`, หา `missing_ids` จาก `expected_ids` ที่ไม่พบใน `succeeded` หรือ `failed`, และสร้าง `retry_ids` แบบเรียงลำดับไม่ซ้ำ",
      "สร้างฟังก์ชัน `calculate_batch_cost(input_tokens: int, output_tokens: int, *, input_per_1m_usd: float, output_per_1m_usd: float, discount_rate: float = 0.50) -> dict[str, float]` ที่ตรวจค่าไม่ติดลบและ `0.0 <= discount_rate < 1.0` แล้วคืน `{\"realtime_usd\", \"batch_usd\", \"saved_usd\"}`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day82.py",
      code: `from dataclasses import dataclass
import json
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class InvoiceBatchItem(BaseModel):
    # TODO: ConfigDict(extra="forbid"), invoice_no, category, total_thb
    pass


@dataclass(frozen=True)
class BatchReconcileResult:
    succeeded: dict[str, InvoiceBatchItem]
    failed: dict[str, str]
    missing_ids: tuple[str, ...]
    retry_ids: tuple[str, ...]


def build_batch_jsonl(
    items: list[tuple[str, str]],
    *,
    model: str = "gpt-4o-mini",
) -> list[str]:
    """สร้างบรรทัด JSONL สำหรับ Batch API พร้อมกัน custom_id ซ้ำ."""
    # TODO: implement
    raise NotImplementedError


def reconcile_batch_output(
    expected_ids: list[str],
    output_jsonl_lines: list[str],
) -> BatchReconcileResult:
    """จับคู่ผลลัพธ์ Batch JSONL ด้วย custom_id (รองรับสลับลำดับ, partial failures และ missing)."""
    # TODO: implement
    raise NotImplementedError


def calculate_batch_cost(
    input_tokens: int,
    output_tokens: int,
    *,
    input_per_1m_usd: float,
    output_per_1m_usd: float,
    discount_rate: float = 0.50,
) -> dict[str, float]:
    """คำนวณงบ Real-Time vs Batch API และยอดที่ประหยัดได้."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day82.py",
      code: `import json
import pytest
from exercise_day82 import (
    build_batch_jsonl,
    calculate_batch_cost,
    reconcile_batch_output,
)


def test_build_batch_jsonl_and_duplicate_guard():
    lines = build_batch_jsonl([("inv:1", "บิล 1"), ("inv:2", "บิล 2")], model="gpt-4o-mini")
    assert len(lines) == 2
    first = json.loads(lines[0])
    assert first["custom_id"] == "inv:1"
    assert first["method"] == "POST"
    assert first["url"] == "/v1/chat/completions"
    assert first["body"]["temperature"] == 0.0

    with pytest.raises(ValueError):
        build_batch_jsonl([("inv:1", "a"), ("inv:1", "b")])
    with pytest.raises(ValueError):
        build_batch_jsonl([])


def test_reconcile_out_of_order_partial_failure_and_missing():
    expected = ["inv:1", "inv:2", "inv:3", "inv:4"]
    output_lines = [
        # สลับลำดับ: inv:3 มาก่อน inv:1
        json.dumps({
            "custom_id": "inv:3",
            "response": {"status_code": 200, "body": {"choices": [{"message": {"content": '{"invoice_no":"INV-3","category":"travel","total_thb":850.0}'}}]}},
            "error": None,
        }),
        # HTTP 200 แต่ยอดติดลบ -> Pydantic ValidationError -> ต้องลง failed
        json.dumps({
            "custom_id": "inv:2",
            "response": {"status_code": 200, "body": {"choices": [{"message": {"content": '{"invoice_no":"INV-2","category":"office","total_thb":-50.0}'}}]}},
            "error": None,
        }),
        json.dumps({
            "custom_id": "inv:1",
            "response": {"status_code": 200, "body": {"choices": [{"message": {"content": '{"invoice_no":"INV-1","category":"cloud","total_thb":1200.0}'}}]}},
            "error": None,
        }),
        "",  # บรรทัดว่างต้องข้ามได้
    ]
    res = reconcile_batch_output(expected, output_lines)
    assert set(res.succeeded.keys()) == {"inv:1", "inv:3"}
    assert res.succeeded["inv:1"].total_thb == pytest.approx(1200.0)
    assert "inv:2" in res.failed
    assert res.missing_ids == ("inv:4",)
    assert res.retry_ids == ("inv:2", "inv:4")


def test_reconcile_api_error_status():
    lines = [
        json.dumps({
            "custom_id": "inv:9",
            "response": {"status_code": 429, "body": {}},
            "error": {"code": "rate_limit", "message": "quota"},
        })
    ]
    res = reconcile_batch_output(["inv:9"], lines)
    assert res.succeeded == {}
    assert "inv:9" in res.failed
    assert res.missing_ids == ()
    assert res.retry_ids == ("inv:9",)


def test_calculate_batch_cost_50_percent_discount():
    report = calculate_batch_cost(
        2_000_000,
        500_000,
        input_per_1m_usd=0.15,
        output_per_1m_usd=0.60,
        discount_rate=0.50,
    )
    # realtime = 0.30 + 0.30 = 0.60, batch = 0.30, saved = 0.30
    assert report["realtime_usd"] == pytest.approx(0.60)
    assert report["batch_usd"] == pytest.approx(0.30)
    assert report["saved_usd"] == pytest.approx(0.30)
    with pytest.raises(ValueError):
        calculate_batch_cost(-1, 100, input_per_1m_usd=0.15, output_per_1m_usd=0.60)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases แบบออฟไลน์",
      "ตรวจว่า `build_batch_jsonl` ปฏิเสธ `custom_id` ซ้ำและ list ว่างด้วย `ValueError`",
      "ตรวจว่า `reconcile_batch_output` จับคู่ `inv:1` กับ `inv:3` ถูกต้องแม้บรรทัดในไฟล์ผลลัพธ์จะสลับลำดับ",
      "ตรวจว่าทั้งรายการที่พัง Pydantic validation (`inv:2`) และรายการที่หายไป (`inv:4`) ถูกรวมอยู่ใน `retry_ids`",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day82.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `reconcile_batch_output` ให้สร้าง `succeeded: dict[str, InvoiceBatchItem] = {}` และ `failed: dict[str, str] = {}` แล้ววนอ่านแต่ละบรรทัดที่ไม่ว่าง (`if not line.strip(): continue`) ดึง `cid = row[\"custom_id\"]`",
      },
      {
        body: "ตรวจเงื่อนไขสำเร็จ 3 ขั้น: `row.get(\"error\") is None`, `resp.get(\"status_code\") == 200`, และ `InvoiceBatchItem.model_validate_json(content)` อยู่ใน `try ... except (KeyError, IndexError, TypeError, ValidationError)` เพื่อส่งเคสพังลง `failed[cid]`",
      },
      {
        body: "โครงของ `reconcile_batch_output` และ `calculate_batch_cost` — เติม `InvoiceBatchItem` และ `build_batch_jsonl` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day82.py",
          code: `def reconcile_batch_output(
    expected_ids: list[str],
    output_jsonl_lines: list[str],
) -> BatchReconcileResult:
    succeeded: dict[str, InvoiceBatchItem] = {}
    failed: dict[str, str] = {}
    for line in output_jsonl_lines:
        if not line.strip():
            continue
        row = json.loads(line)
        cid = str(row["custom_id"])
        resp = row.get("response") or {}
        if row.get("error") is not None or resp.get("status_code") != 200:
            failed[cid] = str(row.get("error") or f"HTTP {resp.get('status_code')}")
            continue
        try:
            content = resp["body"]["choices"][0]["message"]["content"]
            succeeded[cid] = InvoiceBatchItem.model_validate_json(content)
        except (KeyError, IndexError, TypeError, ValidationError) as err:
            failed[cid] = str(err)
    missing = tuple(sorted(cid for cid in expected_ids if cid not in succeeded and cid not in failed))
    retry = tuple(sorted(set(failed.keys()) | set(missing)))
    return BatchReconcileResult(succeeded=succeeded, failed=failed, missing_ids=missing, retry_ids=retry)`,
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
      title: "จับคู่ผลลัพธ์ Batch ด้วย `zip(input_rows, output_rows)` ตามลำดับบรรทัด",
      symptom: "ข้อมูลของลูกค้า A ถูกสลับไปแปะให้ลูกค้า B เงียบ ๆ เพราะ Batch API ประมวลผลขนานแล้วเขียนผลลัพธ์ไม่เรียงตามลำดับเดิม",
      fix: "จับคู่ด้วย `custom_id` เสมอ และเก็บผลลัพธ์ใน dictionary ที่อ้างอิงตาม `custom_id`",
    },
    {
      title: "ใช้ `custom_id` เป็นเลขแถวชั่วคราว (`\"0\"`, `\"1\"`) หรือมีค่าซ้ำกัน",
      symptom: "ส่ง retry batch รอบสองแล้วจับคู่กลับตารางฐานข้อมูลไม่ถูก หรือ Batch API ปฏิเสธไฟล์ทั้งก้อน",
      fix: "ใช้คีย์เชิงธุรกิจแบบ deterministic เช่น `f\"doc:{doc_id}:v1\"` และตรวจความไม่ซ้ำก่อนเขียนไฟล์ JSONL",
    },
    {
      title: "รันซ้ำทั้ง Batch เมื่อมีรายการพลาดเพียง 1–2%",
      symptom: "เสียค่า API ซ้ำซ้อน 98% สำหรับรายการที่ผ่านไปแล้ว และอาจสร้างข้อมูลซ้ำในระบบปลายทาง",
      fix: "คัดแยก `retry_ids = failed | missing` เพื่อส่งซ้ำเฉพาะรายการที่ตกหล่น และเขียนลงฐานข้อมูลแบบ idempotent upsert",
    },
    {
      title: "นำงานแชต Real-Time ที่ผู้ใช้รออยู่หน้าจอไปส่งเข้า Batch API",
      symptom: "ผู้ใช้ต้องรอนานหลายนาทีถึงหลายชั่วโมงเพราะ Batch API มี SLA สูงสุด 24 ชั่วโมง",
      fix: "ใช้ Batch API เฉพาะงานออฟไลน์/เบื้องหลัง (backfill, nightly indexing, offline evals) ส่วนงาน interactive ให้ใช้ Real-Time + Streaming",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d082-q1",
        "งานใดต่อไปนี้เหมาะสมที่สุดที่จะย้ายจาก Real-Time API ไปใช้ Batch API เพื่อลดต้นทุน 50%?",
        [
          ["แชตบอตตอบคำถามลูกค้าแบบสดบนหน้าเว็บที่ต้องเริ่มสตรีมภายใน 1 วินาที", "ไม่เหมาะ — Batch API เป็นคิวออฟไลน์ที่มี SLA สูงสุด 24 ชั่วโมง"],
          ["งานสกัดข้อมูลใบเสร็จย้อนหลัง 30,000 ใบประจำคืน และงานรันชุดประเมินผลโมเดล (Offline Evals)", "ถูก — ทั้งสองงานไม่ต้องการคำตอบในทันที จึงได้ส่วนลด ~50% และโควตาแยกต่างหากเต็มที่"],
          ["ระบบตรวจสอบรหัส OTP ระหว่างล็อกอิน", "ไม่เหมาะทั้งเรื่อง latency และไม่ควรใช้ LLM ตรวจ OTP ตั้งแต่แรก"],
          ["ฟีเจอร์ Autocomplete เติมคำระหว่างที่ผู้ใช้กำลังพิมพ์", "ต้องตอบภายในหลักร้อยมิลลิวินาที จึงใช้ Batch API ไม่ได้"],
        ],
        "B",
        "Batch API คุ้มค่าที่สุดสำหรับงานเบื้องหลังจำนวนมากที่รอได้หลายนาทีถึง 24 ชั่วโมง เช่น backfill เอกสาร, nightly ETL, และ offline evaluations",
        "เงื่อนไขหลักในการเลือกใช้ Batch API แทน Real-Time API คืออะไร?",
        "งานออฟไลน์จำนวนมากที่รอคิวได้ (≤ 24 ชม.) เพื่อแลกส่วนลด ~50% และโควตา rate limit แยกจากทราฟฟิกหน้าบ้าน",
      ),
      mc(
        "d082-q2",
        "เหตุใดจึงห้ามใช้ `zip(input_lines, output_lines)` ในการจับคู่ผลลัพธ์จาก `batch_output.jsonl`?",
        [
          ["เพราะ Python ไม่รองรับ `zip()` กับ list ของ string", "Python รองรับ `zip()` ปกติ ปัญหาไม่ได้อยู่ที่ภาษา Python"],
          ["เพราะ Batch API ประมวลผลแบบขนาน ผลลัพธ์อาจสลับลำดับและบางรายการที่ error อาจถูกแยกออกไป ทำให้บรรทัดเลื่อนไม่ตรงกัน", "ถูก — ต้องจับคู่ผ่าน `custom_id` เสมอเพื่อไม่ให้ข้อมูลสลับเจ้าของ"],
          ["เพราะไฟล์ `batch_output.jsonl` เป็นไฟล์ CSV ไม่ใช่ JSONL", "ผลลัพธ์เป็น JSONL เหมือนกัน แต่ไม่รับประกันลำดับบรรทัด"],
          ["เพราะ `zip()` ทำให้เสียค่า API เพิ่มอีก 50%", "ไม่เกี่ยวกับค่า API แต่ทำให้ข้อมูลปลายทางผิดเพี้ยนร้ายแรง"],
        ],
        "B",
        "Batch API ไม่รับประกันลำดับบรรทัดของผลลัพธ์ และอาจมีรายการที่ตกหล่นหรือแยกไปไฟล์ error จึงต้องจับคู่ด้วย `custom_id` เท่านั้น",
        "ทำไมต้องจับคู่ผลลัพธ์ของ Batch API ด้วย `custom_id` แทนลำดับบรรทัด?",
        "เพราะเซิร์ฟเวอร์ประมวลผลแบบขนาน ลำดับบรรทัดในไฟล์ผลลัพธ์จึงสลับได้และรายการที่ error อาจขาดหายไป",
      ),
      mc(
        "d082-q3",
        "ใน Batch ขนาด 10,000 เอกสาร พบว่าสำเร็จ 9,920 รายการ, API error 50 รายการ, พัง Pydantic validation 20 รายการ และไม่พบในผลลัพธ์ 10 รายการ ควรจัดการอย่างไรแบบ Idempotent?",
        [
          ["สั่งส่งใหม่ทั้ง 10,000 เอกสารเพื่อให้ได้ไฟล์ผลลัพธ์เดียวที่ครบถ้วน", "สิ้นเปลืองงบ 99.2% โดยเปล่าประโยชน์และเสี่ยงข้อมูลซ้ำ"],
          ["บันทึก 9,920 รายการที่ผ่านด้วยคีย์ `custom_id` แบบ upsert แล้วสร้าง retry batch เฉพาะ 80 รายการที่ failed หรือ missing", "ถูก — Selective Retry + Idempotent Upsert ประหยัดงบและปลอดภัยต่อการรันซ้ำ"],
          ["ทิ้ง 80 รายการที่พลาดไปเลยเพราะถือว่าเกิน 99% แล้ว", "ในงานบัญชีและเอกสารองค์กร การปล่อยเอกสารหายเงียบ ๆ 80 ใบยอมรับไม่ได้"],
          ["ปิด Pydantic validation เพื่อให้ 20 รายการนั้นผ่านเข้าไปด้วย", "การปิด validation จะทำให้ข้อมูลพังไหลเข้าฐานข้อมูล"],
        ],
        "B",
        "การบันทึกเฉพาะรายการที่ผ่านทั้ง HTTP 200 และ Pydantic validation แบบ upsert แล้วส่งซ้ำเฉพาะ `failed | missing` (80 รายการ) คือแนวทาง production ที่ประหยัดและปลอดภัย",
        "Selective Retry ใน Batch API ทำงานอย่างไรเมื่อมี Partial Failures?",
        "บันทึกผลที่ผ่านแล้วด้วย `custom_id` แบบ idempotent upsert และส่ง batch ซ่อมเฉพาะรายการในกลุ่ม `failed` และ `missing`",
      ),
      mc(
        "d082-q4",
        "ถ้างานสกัดเอกสารมีต้นทุน Real-Time API อยู่ที่ Input $0.15/1M tokens และ Output $0.60/1M tokens เมื่อส่ง 4,000,000 input tokens และ 1,000,000 output tokens ผ่าน Batch API (ลด 50%) จะจ่ายจริงเท่าไร?",
        [
          ["$1.20", "นี่คือราคา Real-Time เต็ม (`$0.60 + $0.60`) ยังไม่ได้หักส่วนลด Batch 50%"],
          ["$0.60", "ถูก — Real-Time = `(4 × 0.15) + (1 × 0.60) = $1.20` ลด 50% เหลือ `$0.60`"],
          ["$0.30", "คำนวณต่ำเกินไป (คิดแค่ฝั่ง input หรือ output เพียงฝั่งเดียว)"],
          ["$0.90", "นี่คือลดเพียง 25% แต่ Batch API ลดทั้ง input และ output 50%"],
        ],
        "B",
        "ต้นทุน Real-Time = `4 × $0.15 + 1 × $0.60 = $1.20` เมื่อใช้ Batch API ที่ลดราคา 50% จะเหลือ `$0.60` ประหยัดไป `$0.60`",
        "สูตรคำนวณต้นทุน Batch API เทียบกับ Real-Time API คืออะไร?",
        "`batch_usd = realtime_usd * (1 - 0.50)` โดย `realtime_usd = (in_tokens/1e6)*in_rate + (out_tokens/1e6)*out_rate`",
      ),
    ],
  },

  takeaways: [
    "ย้ายงานออฟไลน์ที่ไม่ต้องการคำตอบทันที (Backfill, Nightly ETL, Document Indexing, Offline Evals) ไปใช้ {{batch-api}} เพื่อลดต้นทุน ~50% และแยกโควตา {{rate-limit}}",
    "ออกแบบ `custom_id` ในไฟล์ {{jsonl}} ให้ไม่ซ้ำและเป็น deterministic (เช่น `inv:{doc_id}:v1`) เพื่อเชื่อมโยงผลลัพธ์กลับอย่างปลอดภัย",
    "ห้ามใช้ลำดับบรรทัดจับคู่ผลลัพธ์เด็ดขาด — ให้ reconcile ด้วย `custom_id`, ตรวจทั้ง HTTP status และ {{pydantic}} schema, แล้วทำ Selective Retry เฉพาะ `failed | missing`",
    "บันทึกผลลัพธ์ด้วยคีย์ `custom_id` แบบ {{idempotency|idempotent}} upsert เพื่อให้รันซ้ำกี่รอบก็ไม่เกิดแถวเบิ้ล",
  ],

  reviewCards: [
    rc(
      "d082-rc-1",
      "ประโยชน์หลัก 2 ข้อของการใช้ Batch API สำหรับงานออฟไลน์คืออะไร และแลกกับอะไร?",
      "ได้ส่วนลดค่า token ~50% และโควตา rate limit แยกต่างหากจากทราฟฟิก real-time — แลกกับเวลาประมวลผลแบบ async (SLA สูงสุด 24 ชั่วโมง)",
    ),
    rc(
      "d082-rc-2",
      "4 คีย์หลักในแต่ละบรรทัดของ `batch_input.jsonl` (รูปแบบ OpenAI) มีอะไรบ้าง?",
      "`custom_id` (รหัสไม่ซ้ำ), `method` (`POST`), `url` (เช่น `/v1/chat/completions`), และ `body` (request payload ปกติ)",
    ),
    rc(
      "d082-rc-3",
      "เมื่อรับ `batch_output.jsonl` กลับมา ต้องแยกผลลัพธ์เป็น 3 กลุ่มใดบ้างเพื่อทำ Selective Retry?",
      "`succeeded` (HTTP 200 + ผ่าน Pydantic schema), `failed` (API error หรือ ValidationError), และ `missing` (อยู่ใน `expected_ids` แต่ไม่พบในผลลัพธ์)",
    ),
  ],

  sources: [
    { label: "OpenAI API Docs — Batch API Guide", href: "https://platform.openai.com/docs/guides/batch" },
    { label: "Anthropic Docs — Message Batches API", href: "https://docs.anthropic.com/en/docs/build-with-claude/batch-processing" },
    { label: "Google Gemini API — Batch Mode Documentation", href: "https://ai.google.dev/gemini-api/docs/batch-api" },
    { label: "JSON Lines (JSONL) Specification", href: "https://jsonlines.org/" },
  ],

  glossary: ["batch-api", "jsonl", "idempotency", "rate-limit", "payload", "structured-output", "pydantic", "reproducibility"],
});
