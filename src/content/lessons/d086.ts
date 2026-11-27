import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D086 — Phase 3 / Block B22
 * LoRA / QLoRA Intuition & Dataset Quality Requirements
 */
export const d086: Lesson = defineLesson({
  day: 86,
  titleTh: "เข้าใจ LoRA / QLoRA แบบเห็นภาพ และกฎเหล็กคุณภาพข้อมูลสำหรับ Fine-Tuning",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · คำนวณขนาด Adapter, งบ VRAM และสร้างตัวตรวจคุณภาพชุดข้อมูล SFT ภาษาไทย",
  icon: "brain",
  visual: {
    id: "finetune-vs-rag-lora",
    title: "LoRA / QLoRA — แช่แข็งน้ำหนักเดิม (W) แล้วฝึกเมทริกซ์เล็ก A×B (<1%)",
    caption: "ดูวิธีที่ Low-Rank Adaptation ลด VRAM มหาศาล และเหตุผลที่ข้อมูลสะอาด 500 แถวชนะข้อมูลมั่ว 50,000 แถว",
    alt: "แผนภาพโครงสร้าง LoRA และ QLoRA",
  },
  requiresApiKey: false,
  tools: ["Pydantic v2", "SDK", "Ollama", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อมูลสะอาด 500 แถว ชนะข้อมูลมั่ว 50,000 แถวเสมอ",
      body: "ในการทำ Fine-Tuning คุณภาพของชุดข้อมูล {{jsonl}} (ไม่มีแถวซ้ำ, label สอดคล้อง, สะอาดตามหลักภาษาไทย, และไม่เกิด {{data-leakage}} ข้าม train/val) มีผลต่อความแม่นยำมากกว่าการจูน hyperparameter ทุกตัวรวมกัน",
      lessonNote: "วันนี้เราสร้าง SFT Dataset Auditor ด้วย {{pydantic}} เพื่อดักจับแถวซ้ำ JSON พัง และ data leakage ก่อนเริ่มเทรน",
    },
    {
      node: 2,
      heading: "LoRA / QLoRA แช่แข็งน้ำหนักเดิมแล้วฝึกเฉพาะเมทริกซ์เล็ก A × B",
      body: "แทนที่จะอัปเดตน้ำหนักทั้ง 8 พันล้านตัวของ {{llm}} (ซึ่งกิน VRAM มหาศาล) {{lora}} แช่แข็งเมทริกซ์เดิม `W` แล้วฝึกเฉพาะส่วนต่าง `ΔW = A @ B` ที่มีพารามิเตอร์ไม่ถึง 1% ส่วน QLoRA เพิ่มการบีบอัดฐานเป็น 4-bit ({{quantization}}) เพื่อให้เทรนได้บน GPU ใบเดียว",
      lessonNote: "เราจะคำนวณสัดส่วนพารามิเตอร์ที่ลดลงและการประหยัด VRAM ระหว่าง Full Fine-Tune, LoRA และ QLoRA ด้วย Python",
    },
    {
      node: 3,
      heading: "แยกชุด Validation ที่ปลอด Data Leakage เพื่อวัดผลจริง",
      body: "หากข้อความลูกค้าเดิมหลุดไปอยู่ทั้งฝั่ง train และ val โมเดลจะ \"ท่องจำ\" คำตอบจนได้คะแนน eval สวยหรูแต่พังทันทีเมื่อเจอเอกสารจริง",
      lessonNote: "Auditor ของวันนี้ตรวจ overlap ด้วย normalized prompt hash เพื่อให้การประเมินผล {{reproducibility|ทำซ้ำได้}} และตรงความจริง",
    },
    {
      node: 4,
      heading: "Merge Adapter กลับเข้าฐานเพื่อให้ Inference เร็วเท่าเดิมเป๊ะ",
      body: "ข้อดีเยี่ยมยอดของ {{lora}} คือเมื่อฝึกเสร็จ เราสามารถบวก `W_merged = W + (α/r) · (A @ B)` กลับเข้าโมเดลเดิม ทำให้ตอนรันจริง (เช่น แปลงเป็น GGUF รันบน Ollama) **ไม่มี latency เพิ่มขึ้นเลย**",
      lessonNote: "เข้าใจวงจรตั้งแต่เตรียม JSONL → ฝึก LoRA/QLoRA → Merge น้ำหนัก เพื่อพร้อมคุยและวางแผนร่วมกับทีม ML ได้ทันที",
    },
  ],

  objectives: [
    "**อธิบายและคำนวณ** กลไก Low-Rank Decomposition ของ {{lora}} (`ΔW = (α/r) · (A @ B)`, rank `r=8/16`, การตั้งต้น `B=0`) และเหตุผลที่ลดพารามิเตอร์ที่ต้องฝึกลงเหลือต่ำกว่า 1%",
    "**เปรียบเทียบ** ความต้องการ VRAM ระหว่าง Full Fine-Tuning, LoRA (FP16) และ QLoRA (4-bit NF4 + FP16 adapters) เพื่อให้เลือกฮาร์ดแวร์ได้แม่นยำ",
    "**สร้าง** สคริปต์ตรวจคุณภาพชุดข้อมูล SFT ({{jsonl}}) สำหรับงานภาษาไทย เพื่อจับแถวซ้ำ, target JSON ผิด {{schema}}, และ {{data-leakage}} ระหว่าง train/val",
  ],

  prerequisites: [
    "กรอบตัดสินใจ Prompt vs RAG vs Fine-Tune (Day 85)",
    "{{tensor}}, {{autograd}} และพื้นฐาน {{quantization}} จาก Day 61 & Day 83",
    "{{data-leakage}} และ {{jsonl}} + {{pydantic}} v2 (Days 5, 42 & 77)",
    "รันได้ 100% บน CPU ของเครื่องคุณ ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์เบา ๆ บน CPU ด้วย {{uv}} เพื่อทดลองคณิตศาสตร์ของ LoRA, คำนวณงบ VRAM ของ QLoRA และเขียนตัวตรวจคุณภาพชุดข้อมูล SFT",
    commands: `uv init ai-day86 && cd ai-day86
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('Day 86 Ready | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day86` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันเช็กเวอร์ชันสำเร็จ พร้อมทดลองบน CPU 100%"],
    ],
    note: "ตัวอย่างและแบบฝึกหัดวันนี้ใช้ Python มาตรฐาน + Pydantic v2 จึงรันได้ในเวลาไม่ถึง 1 วินาทีโดยไม่ต้องมี NVIDIA GPU — แต่สูตร VRAM และกฎตรวจข้อมูลทั้งหมดคือสูตรเดียวกับที่ใช้เทรนจริงบน Hugging Face PEFT / Unsloth",
  },

  concepts: [
    {
      id: "lora-matrix-intuition",
      title: "1 · สัญชาตญาณของ LoRA: แช่แข็งเมทริกซ์ใหญ่ W แล้วฝึกคู่เมทริกซ์เล็ก A × B",
      paragraphs: [
        "ใน {{transformer}} น้ำหนักแต่ละชั้น Linear (เช่น Q, K, V, O projection) คือเมทริกซ์ขนาดใหญ่ `W` รูปทรง `d × k` (เช่น `4096 × 4096` = **16.77 ล้านพารามิเตอร์** ต่อเมทริกซ์เดียว) การทำ **Full Fine-Tuning** ต้องคำนวณ gradient และเก็บ optimizer states (เช่น AdamW ต้องเก็บทั้ง momentum และ variance) ของน้ำหนักทุกตัว ทำให้โมเดล 8B ต้องใช้ VRAM สูงถึง ~128 GB!",
        "งานวิจัย **{{lora}} (Low-Rank Adaptation)** ค้นพบว่าการเปลี่ยนแปลงของน้ำหนัก `ΔW` ที่จำเป็นต่อการปรับตัวเข้ากับงานเฉพาะทางนั้น *ไม่ได้ต้องการมิติเต็ม* แต่ซ่อนอยู่ในมิติย่อยขนาดเล็ก (low intrinsic rank) เราจึงแช่แข็ง `W` ไว้ แล้วแทน `ΔW` ด้วยผลคูณของเมทริกซ์แคบ ๆ สองตัว: `A` ขนาด `d × r` และ `B` ขนาด `r × k` โดยตั้งค่า **rank `r`** เล็ก ๆ เช่น `8` หรือ `16`",
        "ผลลัพธ์สุดทึ่ง: จาก `4096 × 4096 = 16,777,216` พารามิเตอร์ เหลือเพียง `(4096 × 16) + (16 × 4096) = 131,072` พารามิเตอร์ — **ลดลงเหลือแค่ 0.78%!** โดยกำหนดค่าเริ่มต้นให้ `A` เป็นเลขสุ่มแบบ Gaussian และ `B = 0` เพื่อให้ช่วงเริ่มต้น `ΔW = A @ B = 0` (โมเดลเริ่มต้นด้วยพฤติกรรมเดิม 100% ไม่พัง) แล้วคูณด้วยตัวปรับสเกล `α / r` (เช่น `alpha = 32, r = 16` → scale `= 2.0`) และเมื่อเทรนเสร็จสามารถบวก `W + (α/r)(A @ B)` รวมกลับเป็นเมทริกซ์เดียวได้โดยไม่มี latency เพิ่มตอน inference",
      ],
      analogy: "เหมือนการใส่แผ่นใส (Overlay) ทับพิมพ์เขียวอาคารขนาดยักษ์: คุณไม่ต้องวาดพิมพ์เขียวทั้งตึกใหม่ (แช่แข็ง `W`) แค่ขีดเส้นแก้ไขจุดที่ต้องการลงบนแผ่นใสบาง ๆ (`A × B`) เก็บง่าย แชร์ง่าย สลับแผ่นใสตามลูกค้าได้ และพอสรุปแบบเสร็จก็พิมพ์รวมลงแผ่นเดียวได้เลย",
      code: {
        language: "python",
        filename: "lora_math.py",
        code: `def lora_reduction(d_in: int, d_out: int, rank: int) -> dict[str, float]:
    full_params = d_in * d_out
    lora_params = (d_in * rank) + (rank * d_out)
    ratio_pct = (lora_params / full_params) * 100.0
    return {
        "full_params": float(full_params),
        "lora_params": float(lora_params),
        "trainable_pct": round(ratio_pct, 3),
    }


for r in [4, 8, 16, 32]:
    print(f"r={r:2d} ->", lora_reduction(4096, 4096, r))`,
        caption: "ด้วย rank `r=16` บนเมทริกซ์ `4096 × 4096` จำนวนพารามิเตอร์ที่ต้องฝึกเหลือเพียง 0.781% ของเดิม",
      },
      whyTitle: "Why this matters — สลับหลาย Adapter บนฐานโมเดลเดียวได้",
      whyParagraphs: [
        "เพราะไฟล์ LoRA Adapter มีขนาดเพียง 20–150 MB (เทียบกับฐานโมเดล 16 GB) ทีมวิศวกรจึงสามารถเก็บบันทึก adapter แยกตามงาน (เช่น ใบเสร็จไทย vs ทิกเก็ตธนาคาร) แล้วโหลดสลับบนฐานโมเดลเดียวกันได้โดยไม่เปลืองพื้นที่ดิสก์",
        "และการที่ `B` เริ่มต้นที่ศูนย์ช่วยป้องกันไม่ให้โมเดลเสียความสามารถเดิมในช่วงก้าวแรกของการเทรน",
      ],
    },
    {
      id: "qlora-vram-budget",
      title: "2 · QLoRA: แช่แข็งฐานแบบ 4-bit NF4 + ฝึก Adapter แบบ 16-bit บน GPU ใบเดียว",
      paragraphs: [
        "แม้ LoRA จะลดหน่วยความจำของ gradient และ optimizer states ลงมหาศาล แต่เรายังต้องโหลดน้ำหนักฐาน `W` ที่แช่แข็งไว้ขึ้น GPU ด้วย — สำหรับโมเดล 8B ในรูปแบบ FP16/BF16 (2 bytes/พารามิเตอร์) แค่น้ำหนักฐานอย่างเดียวก็กิน VRAM ไปแล้ว ~16 GB",
        "**QLoRA (Quantized LoRA)** ต่อยอดโดยนำเทคนิค {{quantization}} มาบีบน้ำหนักฐาน `W` ที่แช่แข็งไว้ให้เหลือ **4-bit NormalFloat (NF4)** (~0.5 bytes/พารามิเตอร์) พร้อม Double Quantization ทำให้ฐาน 8B ใช้ VRAM เหลือเพียง ~4–5 GB ส่วนเมทริกซ์ adapter `A, B` และช่วงคำนวณ forward/backward ยังทำใน BF16/FP16 เพื่อรักษาความแม่นยำ และใช้ **Paged Optimizers** ย้ายข้อมูลชั่วคราวไป RAM เมื่อเกิด memory spike",
        "ผลลัพธ์คือวิศวกรสามารถทดลอง Fine-Tune โมเดล 7B–8B ได้บน GPU ใบเดียวขนาด 12–16 GB (เช่น RTX 4060 Ti 16GB / L4 / T4) แทนที่จะต้องเช่าคลัสเตอร์ A100 ราคาแพง",
      ],
      analogy: "เหมือนการเก็บคลังหนังสืออ้างอิงทั้งห้องสมุดในรูปไมโครฟิล์มบีบอัด (4-bit NF4) ให้วางบนโต๊ะเล็ก ๆ ได้ แล้วใช้สมุดจดกระดาษดี ๆ (FP16 LoRA Adapter) ไว้เขียนบันทึกการแก้ไขเฉพาะจุดที่ต้องใช้จริง",
      bullets: [
        "**Full Fine-Tune (FP16 + AdamW)**: ~16–18 bytes/พารามิเตอร์ (Weights 2B + Gradients 2B + FP32 Master/Adam States 12B+) → 8B ใช้ ~128+ GB VRAM",
        "**LoRA (FP16 Base + 1% Adapter)**: ฐาน 2 bytes/พารามิเตอร์ + overhead นิดหน่อย → 8B ใช้ ~18–22 GB VRAM",
        "**QLoRA (4-bit NF4 Base + 1% FP16 Adapter)**: ฐาน ~0.55 bytes/พารามิเตอร์ + activation buffer → 8B ใช้ ~8–12 GB VRAM (รันบน GPU 16 GB ได้สบาย)",
      ],
      whyTitle: "Why this matters — เลือกสเปกเครื่องได้แม่นยำไม่ติด OOM กลางทาง",
      whyParagraphs: [
        "ก่อนกดเช่า GPU บนคลาวด์ วิศวกร AI ควรคำนวณงบ VRAM คร่าว ๆ ได้ทันทีว่าโมเดล 8B / 14B / 32B จะพอดีกับ GPU 16 GB, 24 GB หรือ 80 GB หรือไม่",
        "ข้อแลกเปลี่ยนของ QLoRA คือเวลาเทรนช้ากว่า LoRA FP16 เล็กน้อย (ราว 20%–35%) เพราะต้อง dequantize น้ำหนักฐานจาก 4-bit กลับเป็น 16-bit ระหว่างคำนวณ แต่แลกกับการประหยัดค่าเช่า GPU ลงหลายเท่า",
      ],
    },
    {
      id: "dataset-quality-hygiene",
      title: "3 · กฎเหล็กชุดข้อมูล SFT: ข้อมูลสะอาด 500 แถว ชนะข้อมูลมั่ว 50,000 แถว",
      paragraphs: [
        "มือใหม่ที่เริ่มทำ Fine-Tuning มักทุ่มเวลา 90% ไปกับการจูนค่า `r`, `lora_alpha`, `learning_rate` แต่ในทางปฏิบัติ **คุณภาพของชุดข้อมูล (Dataset Curation) กำหนดผลลัพธ์มากกว่า 80%** — โมเดลที่เทรนด้วยตัวอย่างคุณภาพสูง 500–1,000 แถวที่ผ่านการตรวจทานอย่างเข้มงวด มักเอาชนะโมเดลที่เทรนด้วยข้อมูลกวาดมั่ว 50,000 แถวได้ขาดลอย",
        "สำหรับงานเอกสารภาษาไทย มี 5 ด่านตรวจความสะอาดของไฟล์ {{jsonl}} ที่ต้องทำก่อนเทรนทุกครั้ง: (1) **Deduplication** ลบข้อความซ้ำที่ทำให้โมเดลจำขึ้นใจและ overfit, (2) **Schema & Label Consistency** ตรวจคำตอบฝั่ง `assistant` ทุกแถวด้วย {{pydantic}} หากแม้แต่ 5% มี JSON เพี้ยนหรือใช้คนละมาตรฐานปี พ.ศ./ค.ศ. โมเดลจะเรียนรู้ความสับสนนั้นทันที, (3) **Thai Formatting Hygiene** ล้างช่องว่างแปลกปลอม zero-width space (`\\u200b`) และสระลอย, (4) **Balanced Coverage** ครอบคลุมทั้งเคสปกติ เคสค่า `null` และเคสขอบ (edge cases), และ (5) **Leak-Free Train/Val Split** แยกเอกสารและเทมเพลตที่คล้ายกันไม่ให้รั่วข้ามชุด train กับ val ({{data-leakage}})",
      ],
      analogy: "เหมือนสอนเชฟฝึกหัดทำต้มยำกุ้ง: ให้ดูสูตรมาตรฐานเป๊ะ ๆ 50 ชามที่ชั่งตวงถูกต้อง เชฟจะทำอร่อยสม่ำเสมอ แต่ถ้าให้ดู 5,000 ชามที่บางชามเค็มปี๋ บางชามลืมใส่กุ้ง เชฟจะสับสนและทำรสชาติมั่วทุกครั้ง",
      bullets: [
        "**Garbage In, Garbage Out**: ถ้าในชุดเทรนมี 10% ที่แต่งเลขใบแจ้งหนี้ขึ้นมาเอง โมเดลหลัง Fine-Tune จะเรียนรู้ที่จะ {{hallucination}} อย่างมั่นใจ",
        "**Zero-Width & Whitespace Hygiene**: ข้อความไทยที่ก๊อปจาก PDF/LINE มักติด `\\u200b` หรือช่องว่างซ้ำ ควร normalize ให้เป็นมาตรฐานเดียวกับตอน inference",
        "**Automated Gate**: เขียนสคริปต์ {{validation}} รันใน CI/CLI ก่อนส่งไฟล์ขึ้นเทรนทุกครั้งเพื่อความ {{reproducibility|ทำซ้ำได้}}",
      ],
      whyTitle: "Why this matters — ลดความเสี่ยงเทรนเสียเงินฟรีและจับปัญหาได้ตั้งแต่ก่อนเปิด GPU",
      whyParagraphs: [
        "การตรวจพบว่า 12% ของแถวในชุดเทรนมี `subtotal + vat != total` หรือมีแถว train หลุดไปอยู่ใน val ตั้งแต่ตอนรันสคริปต์บน CPU ใน 1 วินาที ช่วยประหยัดเวลาดีบักหลังเทรนได้เป็นสัปดาห์",
        "และชุดข้อมูลที่สะอาดนี้เองยังใช้เป็นรากฐานสร้าง {{golden-dataset}} และงานประเมินผลใน Phase 5 ต่อได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — LoRA ≈ CSS Override / Git Patch + Dataset Audit ≈ DB Migration Validator",
      body: [
        "มองฐานโมเดล 8B เหมือน **Design System หลักขนาดใหญ่** ส่วน LoRA Adapter คือ **Theme Override Patch เล็ก ๆ** ที่วางทับเฉพาะจุดที่ต้องการเปลี่ยน ไม่ต้อง fork โค้ดทั้งโปรเจกต์ใหม่ทั้งหมด และพอสร้าง build จริงก็ bundle รวมกันได้ไร้ overhead",
        "ส่วน SFT Dataset Auditor ก็เหมือน **Schema & Migration Linter** ก่อนนำเข้าฐานข้อมูล production — ถ้ายอมให้ข้อมูลซ้ำหรือ JSON พังหลุดเข้าไฟล์เทรน บั๊กจะถูกฝังถาวรลงในน้ำหนักโมเดล",
      ],
      table: [
        ["Frozen Base Weights (`W`)", "Immutable Base Docker Image / Core Library"],
        ["LoRA Adapter (`A @ B`, `< 1%`)", "Thin Override Layer / Git Patch (~50 MB)"],
        ["QLoRA (4-bit NF4 Base)", "Compressed Read-Only Base Image เพื่อลด RAM"],
        ["SFT JSONL Auditor (Pydantic)", "Pre-Import Data Linter & Deduplication Gate"],
      ],
    },
    student: {
      title: "First-Year Note — เชื่อม Linear Algebra (Matrix Rank) กับ LoRA",
      body: [
        "วิชาพีชคณิตเชิงเส้น (Linear Algebra) ที่เรียนเรื่อง **Matrix Rank** และการแยกตัวประกอบเมทริกซ์ ถูกนำมาใช้จริงตรง ๆ ใน LoRA! เมทริกซ์ขนาด `4096 × 4096` มีตัวเลขกว่า 16.7 ล้านตัว แต่ถ้าเราบังคับให้มันเกิดจาก `(4096 × 16) @ (16 × 4096)` มันจะมี rank ไม่เกิน `16` และใช้ตัวเลขเก็บเพียง 131,072 ตัวเท่านั้น",
        "นี่คือเหตุผลที่คณิตศาสตร์พื้นฐานใน Phase 2 (Vectors & Matrices) ช่วยให้เราเข้าใจเทคนิค AI ล่าสุดได้ทะลุปรุโปร่งในไม่กี่นาที",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ทีมกำลังเตรียม Fine-Tune โมเดล 8B สำหรับสกัดใบเสร็จไทย เราจะ (1) คำนวณขนาดและสเกลของ LoRA, (2) ประเมินงบ VRAM ของ Full vs LoRA vs QLoRA, และ (3) รัน SFT Dataset Quality Auditor จับแถวซ้ำ, JSON ผิด schema, และ data leakage",
    steps: [
      {
        title: "1 · คำนวณพารามิเตอร์ที่ต้องฝึกใน LoRA และตรวจสมบัติ `B = 0`",
        explain: "เทียบจำนวนพารามิเตอร์ของชั้น Linear `4096 × 4096` เมื่อใช้ rank `r = 16` พร้อมยืนยันว่าเมื่อ `B` เป็นศูนย์หมด ค่าเริ่มต้น `ΔW = (α/r) · (A @ B)` เท่ากับศูนย์เป๊ะ",
        code: {
          language: "python",
          filename: "worked_day86.py",
          code: `def lora_layer_report(d_in: int, d_out: int, rank: int, alpha: float) -> dict[str, float]:
    full = d_in * d_out
    adapter = rank * (d_in + d_out)
    scale = alpha / rank
    return {
        "full_params": float(full),
        "lora_params": float(adapter),
        "trainable_pct": round((adapter / full) * 100.0, 4),
        "scaling_factor": round(scale, 4),
    }


print("r=8,  alpha=16:", lora_layer_report(4096, 4096, rank=8, alpha=16))
print("r=16, alpha=32:", lora_layer_report(4096, 4096, rank=16, alpha=32))`,
        },
        output: `r=8,  alpha=16: {'full_params': 16777216.0, 'lora_params': 65536.0, 'trainable_pct': 0.3906, 'scaling_factor': 2.0}
r=16, alpha=32: {'full_params': 16777216.0, 'lora_params': 131072.0, 'trainable_pct': 0.7812, 'scaling_factor': 2.0}`,
      },
      {
        title: "2 · ประเมินงบ VRAM: Full Fine-Tune vs LoRA (FP16) vs QLoRA (4-bit)",
        explain: "ใช้สูตรประมาณการหน่วยความจำ (GB) จากจำนวนพารามิเตอร์ (พันล้านตัว) โดยรวม weights + trainable states + activation overhead เพื่อให้เห็นภาพชัดเจนสำหรับโมเดล 8B",
        code: {
          language: "python",
          filename: "worked_day86.py",
          code: `from typing import Literal


def estimate_vram_gb(
    params_billion: float,
    mode: Literal["full_fp16", "lora_fp16", "qlora_4bit"],
    adapter_fraction: float = 0.01,
    activation_buffer_gb: float = 3.0,
) -> float:
    # 1B params * bytes_per_param ≈ bytes_per_param GB (โดยประมาณ 10^9 bytes)
    if mode == "full_fp16":
        # FP16 weights (2B) + FP16 grads (2B) + FP32 master & AdamW moments (12B) = 16 bytes/param
        model_gb = params_billion * 16.0
    elif mode == "lora_fp16":
        # Frozen FP16 base (2B) + trainable adapter states (~16B * adapter_fraction)
        model_gb = params_billion * (2.0 + 16.0 * adapter_fraction)
    else:
        # Frozen 4-bit NF4 base (~0.55B รวม quant constants) + FP16 adapter states
        model_gb = params_billion * (0.55 + 16.0 * adapter_fraction)
    return round(model_gb + activation_buffer_gb, 2)


for m in ("full_fp16", "lora_fp16", "qlora_4bit"):
    print(f"8B {m:10s} -> ~{estimate_vram_gb(8.0, m):6.2f} GB VRAM")`,
        },
        output: `8B full_fp16  -> ~131.00 GB VRAM
8B lora_fp16  -> ~ 20.28 GB VRAM
8B qlora_4bit -> ~  8.68 GB VRAM`,
      },
      {
        title: "3 · สร้าง SFT Dataset Auditor ตรวจแถวซ้ำ, JSON พัง และ Data Leakage",
        explain: "ล้าง `\\u200b` และช่องว่างซ้ำก่อนแฮช prompt เพื่อจับแถวซ้ำและเช็ก overlap ระหว่าง train กับ val พร้อมตรวจว่าคำตอบ `assistant` ทุกแถวผ่าน Pydantic target schema",
        code: {
          language: "python",
          filename: "worked_day86.py",
          code: `import re
from typing import Literal
from pydantic import BaseModel, ConfigDict, ValidationError


class TargetLabel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    doc_type: Literal["receipt", "ticket"]
    total_thb: float | None = None


def normalize_thai_text(text: str) -> str:
    cleaned = text.replace("\\u200b", "")
    return re.sub(r"\\s+", " ", cleaned).strip()


def audit_splits(train_rows: list[dict[str, str]], val_rows: list[dict[str, str]]) -> dict[str, int]:
    seen_train: set[str] = set()
    dup_train = 0
    invalid_schema = 0

    for row in train_rows:
        norm_q = normalize_thai_text(row["prompt"])
        if norm_q in seen_train:
            dup_train += 1
        seen_train.add(norm_q)
        try:
            TargetLabel.model_validate_json(row["completion"])
        except ValidationError:
            invalid_schema += 1

    leakage = 0
    for row in val_rows:
        if normalize_thai_text(row["prompt"]) in seen_train:
            leakage += 1
        try:
            TargetLabel.model_validate_json(row["completion"])
        except ValidationError:
            invalid_schema += 1

    return {"duplicates_in_train": dup_train, "invalid_schema": invalid_schema, "train_val_leakage": leakage}


train = [
    {"prompt": "ใบเสร็จ  ร้านกาแฟ 120 บาท", "completion": '{"doc_type": "receipt", "total_thb": 120.0}'},
    {"prompt": "ใบเสร็จ\\u200b ร้านกาแฟ 120 บาท", "completion": '{"doc_type": "receipt", "total_thb": 120.0}'},
    {"prompt": "แอปค้างเข้าไม่ได้", "completion": '{"doc_type": "unknown_type"}'},
]
val = [
    {"prompt": "ใบเสร็จ ร้านกาแฟ 120 บาท", "completion": '{"doc_type": "receipt", "total_thb": 120.0}'},
]
print("Audit Report:", audit_splits(train, val))`,
        },
        output: `Audit Report: {'duplicates_in_train': 1, 'invalid_schema': 1, 'train_val_leakage': 1}`,
      },
    ],
    gotcha: "สังเกตตัวอย่างที่ 3: ข้อความ `\"ใบเสร็จ\\u200b ร้านกาแฟ 120 บาท\"` (ติด zero-width space จากการก๊อป PDF ไทย) ดูด้วยตาเปล่าเหมือนข้อความปกติเป๊ะ ถ้าไม่ทำ `normalize_thai_text` ก่อนตรวจ duplicate และ train/val leakage สคริปต์เช็กแบบ `==` ธรรมดาจะพลาดและปล่อยข้อมูลซ้ำหลุดเข้าชุดเทรนทันที!",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day86.py` ที่รวมตัวคำนวณพารามิเตอร์ LoRA, ตัวประมาณการ VRAM ของ Full/LoRA/QLoRA, และ SFT Dataset Quality Auditor สำหรับชุดข้อมูลเอกสารภาษาไทย",
    requirements: [
      "`lora_param_stats(d_in: int, d_out: int, rank: int, alpha: float = 16.0) -> dict[str, float]`: ตรวจว่า `d_in > 0`, `d_out > 0`, `rank > 0`, `rank < min(d_in, d_out)`, `alpha > 0` (ไม่งั้น `raise ValueError`) แล้วคืน `full_params`, `lora_params`, `trainable_pct` (ปัด 4 ตำแหน่ง), `scaling_factor` (`alpha / rank` ปัด 4 ตำแหน่ง)",
      "`estimate_training_vram_gb(params_billion: float, mode: Literal[\"full_fp16\", \"lora_fp16\", \"qlora_4bit\"], *, adapter_fraction: float = 0.01, activation_buffer_gb: float = 3.0) -> float`: ตรวจ `params_billion > 0`, `0 < adapter_fraction <= 0.25`, `activation_buffer_gb >= 0` (ไม่งั้น `raise ValueError`) และคำนวณ VRAM (GB) ปัดทศนิยม 2 ตำแหน่งตามสูตร (`full_fp16`: `16B/param`, `lora_fp16`: `2B + 16B * adapter_fraction`, `qlora_4bit`: `0.55B + 16B * adapter_fraction`, บวก `activation_buffer_gb`)",
      "`normalize_thai_prompt(text: str) -> str`: ลบ zero-width characters (`\\u200b`, `\\ufeff`) และยุบ whitespace ซ้ำทั้งหมดให้เหลือช่องว่างเดียวแล้ว `strip()`",
      "`audit_sft_dataset(train_rows: list[dict[str, str]], val_rows: list[dict[str, str]]) -> dict[str, int | bool]`: ตรวจแต่ละแถวที่มีคีย์ `prompt` และ `completion` (ต้อง validate ผ่าน `SftTarget(doc_type: Literal[\"receipt\", \"support_ticket\", \"tax_invoice_request\"], confidence: float)` ตั้ง `extra=\"forbid\"` และ `0.0 <= confidence <= 1.0`), นับ `train_duplicates`, `invalid_completions`, `empty_prompts`, `train_val_leakage`, และคืน `ready_for_training: bool` เป็น `True` เฉพาะเมื่อตัวนับความผิดพลาดทั้ง 4 เป็น `0` และ `len(train_rows) > 0` และ `len(val_rows) > 0`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day86.py",
      code: `import re
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class SftTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    doc_type: Literal["receipt", "support_ticket", "tax_invoice_request"]
    confidence: float = Field(ge=0.0, le=1.0)


def lora_param_stats(d_in: int, d_out: int, rank: int, alpha: float = 16.0) -> dict[str, float]:
    """คำนวณจำนวนพารามิเตอร์และสัดส่วนของ LoRA Adapter."""
    # TODO: implement
    raise NotImplementedError


def estimate_training_vram_gb(
    params_billion: float,
    mode: Literal["full_fp16", "lora_fp16", "qlora_4bit"],
    *,
    adapter_fraction: float = 0.01,
    activation_buffer_gb: float = 3.0,
) -> float:
    """ประมาณขนาด VRAM (GB) สำหรับ Full Fine-Tune, LoRA FP16 และ QLoRA 4-bit."""
    # TODO: implement
    raise NotImplementedError


def normalize_thai_prompt(text: str) -> str:
    """ล้าง zero-width characters และจัดระเบียบช่องว่างข้อความไทย."""
    # TODO: implement
    raise NotImplementedError


def audit_sft_dataset(
    train_rows: list[dict[str, str]],
    val_rows: list[dict[str, str]],
) -> dict[str, int | bool]:
    """ตรวจคุณภาพชุดข้อมูล SFT ก่อนเทรน LoRA/QLoRA."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day86.py",
      code: `import pytest
from exercise_day86 import (
    audit_sft_dataset,
    estimate_training_vram_gb,
    lora_param_stats,
    normalize_thai_prompt,
)


def test_lora_param_stats_and_validation():
    stats = lora_param_stats(4096, 4096, rank=16, alpha=32.0)
    assert stats["full_params"] == 16_777_216.0
    assert stats["lora_params"] == 131_072.0
    assert stats["trainable_pct"] == pytest.approx(0.7812, abs=1e-4)
    assert stats["scaling_factor"] == 2.0

    with pytest.raises(ValueError):
        lora_param_stats(64, 64, rank=64)
    with pytest.raises(ValueError):
        lora_param_stats(64, 64, rank=0)


def test_vram_ordering_full_gt_lora_gt_qlora():
    v_full = estimate_training_vram_gb(8.0, "full_fp16")
    v_lora = estimate_training_vram_gb(8.0, "lora_fp16")
    v_qlora = estimate_training_vram_gb(8.0, "qlora_4bit")
    assert v_full > 100.0
    assert v_lora < 25.0
    assert v_qlora < 12.0
    assert v_full > v_lora > v_qlora


def test_thai_prompt_normalization():
    raw = "  \\ufeffใบเสร็จ\\u200b   ร้านกาแฟ\\n\\t120 บาท  "
    assert normalize_thai_prompt(raw) == "ใบเสร็จ ร้านกาแฟ 120 บาท"


def test_audit_catches_dups_invalid_and_leakage():
    train = [
        {"prompt": "ใบเสร็จ ร้าน A 100 บาท", "completion": '{"doc_type": "receipt", "confidence": 0.95}'},
        {"prompt": "ใบเสร็จ\\u200b  ร้าน A 100 บาท", "completion": '{"doc_type": "receipt", "confidence": 0.95}'},
        {"prompt": "ขอใบกำกับภาษีเต็มรูป", "completion": '{"doc_type": "bad_label", "confidence": 0.9}'},
        {"prompt": "   \\u200b  ", "completion": '{"doc_type": "support_ticket", "confidence": 0.8}'},
    ]
    val = [
        {"prompt": "ใบเสร็จ ร้าน A 100 บาท", "completion": '{"doc_type": "receipt", "confidence": 0.99}'},
    ]
    report = audit_sft_dataset(train, val)
    assert report["train_duplicates"] == 1
    assert report["invalid_completions"] == 1
    assert report["empty_prompts"] == 1
    assert report["train_val_leakage"] == 1
    assert report["ready_for_training"] is False


def test_audit_passes_clean_dataset():
    train = [
        {"prompt": "ใบเสร็จ 7-11 ยอด 85 บาท", "completion": '{"doc_type": "receipt", "confidence": 0.98}'},
        {"prompt": "ขอออกใบกำกับภาษี เลขผู้เสียภาษี 0105560001234", "completion": '{"doc_type": "tax_invoice_request", "confidence": 0.96}'},
    ]
    val = [
        {"prompt": "แอปโอนเงินค้างช่วยเช็กให้หน่อย", "completion": '{"doc_type": "support_ticket", "confidence": 0.92}'},
    ]
    report = audit_sft_dataset(train, val)
    assert report["train_duplicates"] == 0
    assert report["invalid_completions"] == 0
    assert report["empty_prompts"] == 0
    assert report["train_val_leakage"] == 0
    assert report["ready_for_training"] is True
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 5 test cases บน CPU ในเวลา < 1 วินาที",
      "ตรวจว่า `lora_param_stats(4096, 4096, 16, 32)` ให้ `trainable_pct` ราว `0.7812%` และปฏิเสธ `rank >= min(d_in, d_out)`",
      "ตรวจว่าลำดับ VRAM เป็น `full_fp16 > lora_fp16 > qlora_4bit` และ QLoRA 8B อยู่ต่ำกว่า 12 GB",
      "ตรวจว่า `audit_sft_dataset` จับ duplicate ที่แฝง `\\u200b` และจับ `train_val_leakage` ได้ครบถ้วน",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day86.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `normalize_thai_prompt` ลบ `\\u200b` และ `\\ufeff` ออกก่อน แล้วใช้ `re.sub(r\"\\s+\", \" \", s).strip()` เพื่อยุบช่องว่าง, tab และขึ้นบรรทัดใหม่ให้เหลือช่องว่างเดียว",
      },
      {
        body: "ใน `audit_sft_dataset` หาก `norm_prompt == \"\"` ให้นับ `empty_prompts += 1` และไม่ต้องเพิ่มสตริงว่างลงใน `seen_train` เพื่อไม่ให้นับซ้ำซ้อนเป็น duplicate ส่วน `completion` ให้ตรวจด้วย `SftTarget.model_validate_json(...)` ทั้งฝั่ง train และ val",
      },
      {
        body: "โครงของ `audit_sft_dataset` พร้อมแล้ว — เหลือเติม `lora_param_stats`, `estimate_training_vram_gb` และ `normalize_thai_prompt`",
        code: {
          language: "python",
          filename: "hint_day86.py",
          code: `def audit_sft_dataset(
    train_rows: list[dict[str, str]],
    val_rows: list[dict[str, str]],
) -> dict[str, int | bool]:
    seen_train: set[str] = set()
    train_duplicates = 0
    invalid_completions = 0
    empty_prompts = 0
    train_val_leakage = 0

    for row in train_rows:
        norm = normalize_thai_prompt(row.get("prompt", ""))
        if not norm:
            empty_prompts += 1
        elif norm in seen_train:
            train_duplicates += 1
        else:
            seen_train.add(norm)
        try:
            SftTarget.model_validate_json(row.get("completion", ""))
        except ValidationError:
            invalid_completions += 1

    for row in val_rows:
        norm = normalize_thai_prompt(row.get("prompt", ""))
        if not norm:
            empty_prompts += 1
        elif norm in seen_train:
            train_val_leakage += 1
        try:
            SftTarget.model_validate_json(row.get("completion", ""))
        except ValidationError:
            invalid_completions += 1

    ready = (
        len(train_rows) > 0
        and len(val_rows) > 0
        and train_duplicates == 0
        and invalid_completions == 0
        and empty_prompts == 0
        and train_val_leakage == 0
    )
    return {
        "train_duplicates": train_duplicates,
        "invalid_completions": invalid_completions,
        "empty_prompts": empty_prompts,
        "train_val_leakage": train_val_leakage,
        "ready_for_training": ready,
    }`,
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
      title: "สุ่มค่าเริ่มต้นทั้ง A และ B ใน LoRA แทนที่จะตั้ง B = 0",
      symptom: "ก้าวแรกของการเทรนค่า loss พุ่งสูงผิดปกติและโมเดลลืมความรู้ภาษาไทยเดิมทันที",
      fix: "ต้องตั้งต้น `B = 0` เสมอ เพื่อให้ช่วงเริ่มต้น `ΔW = A @ B = 0` และโมเดลค่อย ๆ ปรับตัวจากฐานเดิมอย่างนุ่มนวล",
    },
    {
      title: "ทุ่มเวลาจูน rank `r` จาก 8 → 16 → 64 ทั้งที่ข้อมูลเทรนยังมีแถวผิดปนอยู่ 15%",
      symptom: "เปลี่ยน hyperparameter กี่รอบผล eval ก็ไม่ขยับ หรือโมเดลยังตอบ JSON ผิดรูปซ้ำ ๆ",
      fix: "หยุดจูน hyperparameter แล้วตรวจและล้างข้อมูลด้วย SFT Auditor (Pydantic validation + deduplication) ก่อนเสมอ",
    },
    {
      title: "ทำ Train/Val Split แบบสุ่มหลังทำ Data Augmentation หรือมีเอกสารซ้ำแฝง `\\u200b`",
      symptom: "Validation loss ต่ำมากจนดูเหมือนแม่น 99% แต่พอขึ้น production เจอเอกสารใหม่กลับแม่นแค่ 72%",
      fix: "Normalize ข้อความไทยและ deduplicate ก่อนแบ่ง split เสมอ เพื่อป้องกัน {{data-leakage}} ข้ามชุด train/val",
    },
    {
      title: "คิดว่า QLoRA ทำให้ Inference เร็วขึ้นและไม่จำเป็นต้อง Merge",
      symptom: "รัน production โดยไม่ merge adapter หรือโหลดฐาน 4-bit โดยไม่เทียบ latency แล้วพบว่า throughput ต่ำกว่าคาด",
      fix: "เข้าใจว่า QLoRA ลด VRAM ตอน *เทรน* ส่วนตอน *deploy* ให้ merge LoRA กลับเข้าฐาน (หรือ quantize ใหม่เป็น GGUF/AWQ หลัง merge) เพื่อไม่ให้มี overhead ของ adapter layer",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d086-q1",
        "เมทริกซ์น้ำหนักเดิม `W` มีขนาด `4096 × 4096` หากใช้ LoRA rank `r = 16` จำนวนพารามิเตอร์ที่ต้องฝึกในชั้นนี้จะลดลงเหลือประมาณกี่เปอร์เซ็นต์?",
        [
          ["ประมาณ 50%", "มากเกินไป — LoRA แยกเป็นเมทริกซ์แคบสองตัว `4096×16` และ `16×4096`"],
          ["ประมาณ 0.78% (131,072 จาก 16,777,216 พารามิเตอร์)", "ถูก — `(4096*16 + 16*4096) / (4096*4096) = 32 / 4096 ≈ 0.781%`"],
          ["ประมาณ 16%", "ค่า rank `r=16` ไม่ได้แปลว่า 16% แต่คือมิติแกนกลางของเมทริกซ์ `A` และ `B`"],
          ["0% เพราะ LoRA ไม่ได้ฝึกพารามิเตอร์ใดเลย", "ไม่จริง — LoRA แช่แข็ง `W` แต่ฝึก `A` และ `B`"],
        ],
        "B",
        "สูตรพารามิเตอร์ของ LoRA คือ `r * (d_in + d_out)` เมื่อเทียบกับ `d_in * d_out` จึงลดพารามิเตอร์ที่ต้องฝึกและเก็บ optimizer states ลงเหลือต่ำกว่า 1%",
        "สูตรคำนวณจำนวนพารามิเตอร์ของ LoRA Adapter สำหรับเมทริกซ์ขนาด `d × k` ที่ rank `r` คืออะไร?",
        "`r × (d + k)` — เช่น `4096 × 4096` ที่ `r=16` ใช้เพียง `16 × 8192 = 131,072` พารามิเตอร์ (~0.78%)",
      ),
      mc(
        "d086-q2",
        "เหตุใด LoRA จึงต้องกำหนดค่าเริ่มต้นของเมทริกซ์ `B` เป็นศูนย์ทั้งหมด (`B = 0`) ในขณะที่สุ่มค่าเริ่มต้นของ `A`?",
        [
          ["เพื่อประหยัดพื้นที่ฮาร์ดดิสก์ตอนเซฟไฟล์", "เมทริกซ์ศูนย์ยังใช้ขนาดเมทริกซ์เท่าเดิม"],
          ["เพื่อให้ช่วงเริ่มต้น `ΔW = A @ B = 0` โมเดลจึงเริ่มเทรนจากพฤติกรรมของฐานเดิม `W` 100% โดยไม่ถูกสัญญาณสุ่มทำลาย", "ถูก — หากทั้ง `A` และ `B` สุ่มตั้งแต่ก้าวแรก น้ำหนักจะเพี้ยนทันทีและเทรนไม่เสถียร"],
          ["เพราะ GPU คูณเมทริกซ์ที่ไม่ใช่ศูนย์ไม่ได้", "ไม่เกี่ยวกัน — GPU คูณเมทริกซ์ได้ทุกค่า"],
          ["เพื่อให้ `gradient` ของทุกชั้นเป็นศูนย์ตลอดการเทรน", "หากตั้งทั้ง `A=0` และ `B=0` gradient จะเป็นศูนย์จริง แต่เมื่อสุ่ม `A` และตั้ง `B=0` gradient ของ `B` จะไม่เป็นศูนย์และเรียนรู้ได้ทันที"],
        ],
        "B",
        "การตั้ง `A ~ N(0, σ²)` และ `B = 0` ทำให้ `ΔW = 0` ที่ step 0 (ไม่ทำลายความรู้เดิมของโมเดล) ขณะเดียวกันยังมี gradient ไหลเข้าปรับ `B` ได้ตั้งแต่ batch แรก",
        "ทำไม LoRA จึงตั้งค่าเริ่มต้นให้ `A` เป็นเลขสุ่ม และ `B = 0`?",
        "เพื่อให้ `ΔW = A @ B = 0` ในก้าวแรก (รักษาพฤติกรรมฐานเดิมไว้ 100%) แต่ยังคงมี gradient ไหลเข้าปรับค่า `B` ได้ทันที",
      ),
      mc(
        "d086-q3",
        "QLoRA แตกต่างจาก LoRA แบบ FP16 อย่างไร และช่วยแก้ข้อจำกัดใดได้มากที่สุด?",
        [
          ["QLoRA แช่แข็งน้ำหนักฐาน `W` ในรูปแบบ 4-bit (NF4) แล้วฝึก Adapter `A, B` ใน 16-bit จึงลด VRAM ลงจนเทรนโมเดล 8B บน GPU 12–16 GB ใบเดียวได้", "ถูก — การบีบอัดฐานที่แช่แข็งไว้เป็น 4-bit ตัดหน่วยความจำฐานลง ~4 เท่าโดยยังรักษาความแม่นยำของ adapter ใน 16-bit"],
          ["QLoRA เปลี่ยนฐานโมเดลเป็น 64-bit เพื่อความละเอียดสูงสุด", "ตรงกันข้าม — QLoRA ใช้ 4-bit quantization เพื่อประหยัด VRAM"],
          ["QLoRA ไม่ต้องใช้ชุดข้อมูลเทรนเพราะสร้างข้อมูลเองอัตโนมัติ", "ไม่จริง — QLoRA ยังต้องการชุดข้อมูล SFT คุณภาพสูงเหมือนเดิม"],
          ["QLoRA ใช้ได้เฉพาะกับโมเดลภาษาอังกฤษเท่านั้น", "ไม่จริง — ใช้ได้กับโมเดลเปิดทุกตัวรวมถึงโมเดลที่รองรับภาษาไทยอย่าง Qwen หรือ Typhoon/Llama"],
        ],
        "A",
        "QLoRA ผสาน 4-bit NF4 quantization สำหรับฐานที่แช่แข็งเข้ากับ 16-bit LoRA adapters และ Paged Optimizers เพื่อลด VRAM จาก ~20 GB เหลือ ~8–12 GB สำหรับโมเดล 8B",
        "หัวใจที่ทำให้ QLoRA ใช้ VRAM น้อยกว่า LoRA FP16 มากคืออะไร?",
        "เก็บน้ำหนักฐาน `W` ที่แช่แข็งไว้ในรูป 4-bit NF4 (~0.55 bytes/param) แทน FP16 (2 bytes/param) ขณะที่ยังฝึกเมทริกซ์ LoRA `A, B` ด้วยความละเอียด 16-bit",
      ),
      mc(
        "d086-q4",
        "ในการเตรียมชุดข้อมูล SFT ภาษาไทย 1,000 แถวเพื่อ Fine-Tune ตัวสกัดใบเสร็จ ข้อใดสำคัญที่สุดและช่วยป้องกันความล้มเหลวได้มากที่สุด?",
        [
          ["เพิ่มจำนวนแถวเป็น 50,000 แถวโดยคัดลอกแถวเดิมซ้ำ 50 รอบ", "การทำซ้ำทำให้โมเดล overfit หนักและสูญเสียความสามารถในการรับมือเอกสารใหม่"],
          ["ตรวจ `completion` ทุกแถวผ่าน Pydantic Strict Schema, ล้าง `\\u200b`/ช่องว่างซ้ำ, ลบแถวซ้ำ, และกัน data leakage ระหว่าง train กับ val", "ถูก — ชุดข้อมูลที่สะอาด สอดคล้อง และปลอด leakage มีผลต่อคุณภาพมากกว่าการปรับ rank หรือ learning rate"],
          ["ตั้ง rank `r = 512` เพื่อให้โมเดลจำทุกอย่างได้หมด", "rank สูงเกินไปกิน VRAM และเสี่ยง overfit ง่าย โดยเฉพาะเมื่อชุดข้อมูลยังมี noise"],
          ["ไม่ต้องมี validation split เพื่อนำทุกแถวไปเทรนให้หมด", "หากไม่มี val split ที่ปลอด leakage จะไม่มีทางรู้เลยว่าโมเดล overfit หรือแม่นขึ้นจริง"],
        ],
        "B",
        "ในงาน Fine-Tuning ข้อมูลสะอาด 500–1,000 แถวที่ผ่านการตรวจ schema, deduplication, Thai text hygiene และ leak-free split จะชนะข้อมูลขนาดใหญ่ที่สกปรกเสมอ",
        "4 สิ่งที่ต้องตรวจในชุดข้อมูล SFT ภาษาไทยก่อนกดเริ่มเทรน LoRA คืออะไร?",
        "1) ลบแถวซ้ำหลัง normalize ภาษาไทย (`\\u200b`/ช่องว่าง), 2) ตรวจคำตอบทุกแถวผ่าน Pydantic schema, 3) ครอบคลุมเคสขอบ/`null`, และ 4) แยก train/val ให้ปลอด data leakage",
      ),
    ],
  },

  takeaways: [
    "{{lora}} แช่แข็งเมทริกซ์ฐาน `W` แล้วฝึกเฉพาะส่วนต่าง Low-Rank `ΔW = (α/r) · (A @ B)` (ตั้งต้น `B = 0`) ลดพารามิเตอร์ที่ต้องฝึกลงเหลือ `< 1%` และ merge กลับเข้า `W` ได้โดยไม่เพิ่ม inference latency",
    "**QLoRA** บีบน้ำหนักฐานที่แช่แข็งเป็น 4-bit NF4 ({{quantization}}) คู่กับ adapter 16-bit ลด VRAM สำหรับโมเดล 8B จาก ~130 GB (Full) เหลือ ~8–12 GB ให้เทรนบน GPU ใบเดียวได้",
    "ข้อมูลสะอาด 500 แถวชนะข้อมูลมั่ว 50,000 แถว: ต้องรัน SFT Auditor ตรวจ {{pydantic}} {{schema}}, Thai whitespace/`\\u200b` hygiene, deduplication และ {{data-leakage}} ก่อนเทรนทุกครั้ง",
    "พรุ่งนี้ (Day 87) เรานำองค์ความรู้ตลอด Phase 3 มาออกแบบพิมพ์เขียว **Phase 3 Mini-Project: Typed Thai Document Classifier & Extractor**",
  ],

  reviewCards: [
    rc(
      "d086-rc-1",
      "LoRA ลดพารามิเตอร์ที่ต้องฝึกได้อย่างไร และทำไมจึงไม่เพิ่ม latency ตอน inference หลังเทรนเสร็จ?",
      "แทนที่จะฝึกเมทริกซ์เต็ม `W (d×k)` LoRA แช่แข็ง `W` แล้วฝึกเมทริกซ์แคบ `A (d×r)` กับ `B (r×k)` ที่มีพารามิเตอร์ <1% — เมื่อเทรนเสร็จสามารถบวก `W + (α/r)(A @ B)` รวมเป็นเมทริกซ์เดียวได้เลย",
    ),
    rc(
      "d086-rc-2",
      "ประมาณขนาด VRAM ของโมเดล 8B สำหรับ Full Fine-Tune (FP16) vs LoRA (FP16) vs QLoRA (4-bit)",
      "Full FP16 ≈ 128+ GB · LoRA FP16 ≈ 18–22 GB · QLoRA 4-bit ≈ 8–12 GB (พอดีกับ GPU 12–16 GB ใบเดียว)",
    ),
    rc(
      "d086-rc-3",
      "ทำไมข้อความไทยที่ก๊อปจาก PDF/LINE ถึงมักทำให้การตรวจ duplicate และ train/val leakage พลาด?",
      "เพราะมักมีอักขระล่องหนอย่าง zero-width space (`\\u200b`), BOM (`\\ufeff`) หรือช่องว่างซ้ำปะปน — ต้อง normalize ข้อความไทยก่อนแฮชเทียบเสมอ",
    ),
  ],

  sources: [
    { label: "Hu et al. — LoRA: Low-Rank Adaptation of Large Language Models (arXiv)", href: "https://arxiv.org/abs/2106.09685" },
    { label: "Dettmers et al. — QLoRA: Efficient Finetuning of Quantized LLMs (arXiv)", href: "https://arxiv.org/abs/2305.14314" },
    { label: "Hugging Face PEFT Documentation — LoRA Conceptual Guide", href: "https://huggingface.co/docs/peft/conceptual_guides/lora" },
    { label: "Pydantic v2 Documentation — Validation & JSON Parsing", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
  ],

  glossary: ["lora", "quantization", "tensor", "data-leakage", "jsonl", "pydantic", "validation", "reproducibility"],
});
