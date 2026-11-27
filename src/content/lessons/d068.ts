import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D068 — Phase 3 / Block B17 (Review Day)
 * Review: Quiz + Benchmark Thai vs English token cost across tokenizers
 */
export const d068: Lesson = defineLesson({
  day: 68,
  titleTh: "ทบทวน B17: วัดต้นทุน Token ไทย vs อังกฤษข้าม Tokenizer และวางงบ 10,000 ทิกเก็ต",
  tagline: "30 นาที · รอบทบทวน D65–D67 + D33 · รันบน CPU 100% ไม่ต้องใช้ API key · สร้างสคริปต์ Benchmark ต้นทุนภาษาไทยพร้อม pytest",
  icon: "coins",
  visual: {
    id: "post-training-stages",
    title: "ทบทวน B17: วัดต้นทุน Token ไทย vs อังกฤษข้าม Tokenizer และคำนวณงบ Context",
    caption: "ทบทวน Self-Attention O(n^2), BPE inflation และ Post-training พร้อมสคริปต์วัดอัตราส่วน token ไทยต่ออังกฤษจริง",
    alt: "แผนภาพทบทวน B17 และวัดต้นทุน token ภาษาไทย",
  },
  requiresApiKey: false,
  tools: ["tiktoken", "Polars", "NumPy", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "วัด Token ไทยเทียบอังกฤษจากชุดทิกเก็ตจริงก่อนเดางบ",
      body: "ตลอด Block B17 เราเห็นแล้วว่า {{bpe-tokenizer}} แตกอักษรไทย (3 bytes ใน UTF-8) เป็นจำนวน token มากกว่าอังกฤษ 1.5x–3x การวัดจากชุดข้อความคู่ขนานจริงช่วยตัดการเดาผิดจากสูตร `len(text) / 4`",
      lessonNote: "วันนี้เรารวม D66 (`tiktoken`) เข้ากับ D33 ({{polars}} Expressions) เพื่อสร้างตาราง benchmark ที่ {{reproducibility|ทำซ้ำได้}} บนทุกเครื่อง",
    },
    {
      node: 2,
      heading: "เชื่อม Token Inflation กับต้นทุน O(n²) และ Chat Template Overhead",
      body: "ทุก token ที่เพิ่มขึ้นจากภาษาไทยและจาก Chat Template ของขั้น SFT/{{rlhf-dpo}} ไม่ได้เพิ่มแค่ค่า API เชิงเส้น แต่ยังดันงาน Prefill ของ {{transformer}} โตแบบ `O(n²)` และกินพื้นที่ Context Window เร็วขึ้น",
      lessonNote: "สคริปต์ของวันนี้คำนวณทั้ง `mean_inflation_ratio`, `max_context_fill_pct` และ `attention_prefill_multiplier` ครบในชุดเดียว",
    },
    {
      node: 3,
      heading: "ประเมินงบจริงเป็น USD และ THB ต่อ 10,000 ทิกเก็ตซัพพอร์ต",
      body: "โมเดลที่ตั้งราคาต่อ 1M tokens ถูกกว่าอาจ **จ่ายจริงแพงกว่า** บนงานภาษาไทย หาก tokenizer รุ่นเก่าทำให้จำนวน token พุ่งเป็น 2 เท่า",
      lessonNote: "เราจะเปรียบเทียบราคาสุทธิต่อ 10,000 ทิกเก็ตไทยเป็นบาทและดอลลาร์ พร้อมเขียน {{pytest}} ล็อกความถูกต้องของสูตรคำนวณ",
    },
    {
      node: 5,
      heading: "สร้าง Baseline สำหรับวางงบและเฝ้าระวังต้นทุนใน Production",
      body: "ตาราง benchmark ที่ได้วันนี้คือต้นแบบของเครื่องมือประเมินงบประมาณที่จะใช้ต่อยอดกับ {{prompt-caching}}, Embedding Context Limits (B18) และ Cost Dashboard ใน Phase 5",
      lessonNote: "จบ B17 พร้อมหลักฐานตัวเลขและ Error Log ที่ป้องกันความผิดพลาดเรื่องงบบริบทภาษาไทยตลอดเส้นทาง",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบผสม (Interleaved Recall)** ครบทั้ง D65 (Self-Attention `O(n²)` + Causal Mask), D66 ({{bpe-tokenizer}} & Thai Token Inflation), D67 (Pre-training / SFT / {{rlhf-dpo}} + Chat Template) และ D33 ({{polars}} `with_columns` / `group_by().agg()`)",
    "**สร้างสคริปต์ Benchmark ที่ทำซ้ำได้** เพื่อวัด `tokens_th / tokens_en` inflation ratio, อัตราการกินพื้นที่ Context Window (`context_fill_pct`) รวม system prompt, และต้นทุนรวม USD/THB ต่อ 10,000 ทิกเก็ตภาษาไทยข้ามหลาย tokenizers",
    "**ตัดสินใจเลือกโมเดลและวาง Context Budget** จากต้นทุนสุทธิต่อ 10,000 คำขอจริง ไม่ใช่ดูแค่ราคาต่อ 1M tokens บนหน้าเว็บผู้ให้บริการ",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D65 (Transformer & O(n²)), D66 (BPE Tokenizer), D67 (Pre-training/SFT/DPO) และ D33 (Polars)",
    "มี `uv`, `tiktoken`, `polars`, `pytest` และ `ruff` พร้อมใช้งาน",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์รอบทบทวน Block B17 ด้วย {{uv}} พร้อมติดตั้ง `tiktoken` และ `polars` เพื่อประกอบสคริปต์วัดต้นทุน token ภาษาไทยเทียบอังกฤษ",
    commands: `uv init ai-day68-review && cd ai-day68-review
uv add tiktoken polars
uv add --dev pytest ruff
uv run python -c "import tiktoken, polars as pl; print('B17 Review Ready:', pl.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day68-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `tiktoken`, `polars`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็น `B17 Review Ready`"],
    ],
    note: "จัดเวลา Review Day 30 นาที: 10 นาทีทำ Interleaved Recall Quiz → 15 นาทีสร้างสคริปต์ Benchmark 10,000 ทิกเก็ตและรัน `pytest` → 5 นาทีสรุป Error Log ก่อนก้าวสู่ Block B18 (Dense Embeddings)",
  },

  concepts: [
    {
      id: "b17-synthesis-loop",
      title: "1 · ร้อยต่อจิ๊กซอว์ B17 (D65–D67) + D33: จาก 1 Token สู่บิลค่า AI รายเดือน",
      paragraphs: [
        "ตลอด 3 วันที่ผ่านมาใน Block B17 คุณเห็นกลไกเบื้องหลัง {{llm}} ครบทั้ง 3 ชั้น: **D65** อธิบายว่าทำไม {{transformer}} ใช้ Self-Attention ที่มีต้นทุนเมทริกซ์ `O(n²)` และต้องบังอนาคตด้วย Causal Mask `-inf`, **D66** พิสูจน์ด้วย `tiktoken` ว่า {{bpe-tokenizer}} ทำให้ภาษาไทยเกิด Token Inflation `1.5x–3x` เพราะ UTF-8 3 bytes/ตัวอักษร + merge rules ที่น้อยกว่า, และ **D67** อธิบายว่าขั้น SFT + {{rlhf-dpo}} สร้างบทบาทผู้ช่วยพร้อมโครงสร้าง Chat Template ที่ช่วยคุมความกระชับและรูปแบบคำตอบ",
        "วันนี้เราจะผสานทั้ง 3 วันเข้ากับ **D33 ({{polars}})** เพื่อวัดผลเชิงปริมาณจริง: ถ้าเราเปลี่ยน tokenizer หรือเปิดใช้ system prompt ยาวขึ้น จะกระทบ **จำนวน token เฉลี่ย**, **เปอร์เซ็นต์พื้นที่ Context Window**, **ภาระการคำนวณ Prefill แบบ `O(n²)`**, และ **ค่าใช้จ่ายจริงเป็นเงินบาทต่อ 10,000 ทิกเก็ต** มากน้อยแค่ไหน",
      ],
      analogy: "เหมือนการคิดต้นทุนขนส่งสินค้าก่อนเซ็นสัญญาโลจิสติกส์: D65 คือสูตรกินน้ำมันของรถเมื่อบรรทุกหนักขึ้น, D66 คือขนาดกล่องพัสดุภาษาไทยที่ใหญ่กว่าอังกฤษ, D67 คือขนาดลังหุ้ม (Chat Template) และความกระชับในการแพ็ก ส่วน D33 (Polars) คือตาราง Excel ความเร็วสูงที่สรุปยอดเทียบทุกเจ้าให้ผู้บริหารดูในหน้าเดียว",
      bullets: [
        "**D65 (Attention Cost)**: ถ้า tokenizer รุ่นเก่ากิน token ไทยเป็น `2×` ของรุ่นใหม่ ภาระ attention ช่วง prefill จะพุ่งเป็น `2² = 4×` และกระทบ {{ttft}}",
        "**D66 (BPE Inflation)**: วัด `inflation_ratio = tokens_th / tokens_en` บนประโยคความหมายเดียวกันจริง ๆ ข้าม `cl100k_base` และ `o200k_base`",
        "**D67 (Post-training & Template)**: อย่านับแค่ข้อความลูกค้า — ต้องรวม `system_prompt` + Chat Template overhead และเผื่อ `output_tokens` ที่กระชับตามสไตล์ Instruct model",
        "**D33 (Polars Aggregation)**: ใช้ `pl.DataFrame`, `with_columns`, และ `group_by().agg()` สรุปค่าเฉลี่ย ค่าสูงสุด และเรียงลำดับตามต้นทุนจริงอย่างสะอาด",
      ],
      whyTitle: "Why this matters — เลิกคุยเรื่องต้นทุน AI ด้วยความรู้สึก",
      whyParagraphs: [
        "ในทีมจริงคำถามยอดฮิตจาก Product Manager คือ *\"ถ้าลูกค้าทักแชตเข้ามาเดือนละ 10,000 ทิกเก็ต เราต้องตั้งงบ LLM กี่บาท และควรใช้โมเดลไหน?\"*",
        "การมีสคริปต์ benchmark ที่รันบนตัวอย่างทิกเก็ตภาษาไทยจริงและโชว์ตัวเลขเป็นบาท/ดอลลาร์พร้อม `context_fill_pct` ทำให้คุณตอบคำถามนี้ได้อย่างมืออาชีพภายใน 30 วินาที",
      ],
    },
    {
      id: "benchmark-metrics-design",
      title: "2 · ออกแบบตัวชี้วัด Benchmark 4 ตัวที่วิศวกร AI ไทยต้องวัดทุกครั้ง",
      paragraphs: [
        "การทำ Token-Cost Benchmark ที่ใช้งานได้จริงต้องวัดครบ 4 ตัวชี้วัดต่อ 1 โปรไฟล์โมเดล/tokenizer: (1) **`mean_inflation_ratio`** คือค่าเฉลี่ยของ `tokens_th / tokens_en` เพื่อรู้ว่า tokenizer นี้เป็นมิตรกับภาษาไทยแค่ไหน, (2) **`max_context_fill_pct`** คือ `max((system_tokens + th_tokens) / context_window * 100)` เพื่อเช็กว่าทิกเก็ตยาวสุดใกล้ชนขีดจำกัดบริบทหรือไม่",
        "(3) **`cost_usd_per_10k` และ `cost_thb_per_10k`** คำนวณจากต้นทุน input (`(system_tokens + avg_th_tokens) * 10_000`) บวกต้นทุน output (`avg_output_tokens_th * 10_000`) แล้วแปลงเป็นเงินบาทด้วยอัตราแลกเปลี่ยนที่กำหนด เช่น `35.0 THB/USD` และ (4) **`attention_prefill_multiplier`** = `(tokens_a / tokens_b) ** 2` เพื่อประเมินภาระ `O(n²)` ที่ลดลงเมื่อย้ายไปใช้ tokenizer ที่บีบอัดภาษาไทยได้ดีกว่า",
        "สำหรับโมเดล open-weights ใน `transformers` (เช่น Qwen หรือ Llama) คุณสามารถใช้หลักการเดียวกันเป๊ะ เพียงเปลี่ยนตัวนับ token จาก `tiktoken.get_encoding(...)` เป็น `AutoTokenizer.from_pretrained(...)` — โครงสร้างตาราง Polars และสูตรคำนวณงบทั้งหมดใช้ซ้ำได้ 100%",
      ],
      analogy: "เหมือนเทียบโปรอินเทอร์เน็ตมือถือ 2 ค่าย: อย่าดูแค่ราคาต่อ GB ต้องดูด้วยว่าค่ายไหนคิดปัดเศษทบทุกแพ็กเกจ (Inflation) และความเร็วโหลดหน้าเว็บจริง (Prefill O(n²)) ต่างกันแค่ไหน",
      code: {
        language: "python",
        filename: "cost_formula_snippet.py",
        code: `def ticket_batch_cost_usd(
    avg_input_tokens: float,
    avg_output_tokens: float,
    input_per_1m_usd: float,
    output_per_1m_usd: float,
    num_tickets: int = 10_000,
) -> float:
    total_in = avg_input_tokens * num_tickets
    total_out = avg_output_tokens * num_tickets
    return (total_in / 1_000_000) * input_per_1m_usd + (total_out / 1_000_000) * output_per_1m_usd

# ทิกเก็ตไทย 10,000 เคส (input เฉลี่ย 320 tokens, output 120 tokens)
usd = ticket_batch_cost_usd(320, 120, input_per_1m_usd=0.40, output_per_1m_usd=1.60)
print(f"10k tickets -> USD {usd:.2f} (THB {usd * 35.0:.2f})")`,
        caption: "แยกคิดราคา input และ output tokens ออกจากกันเสมอ เพราะราคา output มักแพงกว่า input 3x–5x",
      },
      whyTitle: "Why this matters — Output Tokens คือตัวดูดงบเงียบของภาษาไทย",
      whyParagraphs: [
        "ผู้ให้บริการ LLM ส่วนใหญ่คิดราคา `output_tokens` แพงกว่า `input_tokens` ถึง 3–5 เท่า เมื่อรวมกับ Token Inflation ของภาษาไทยและนิสัยตอบยาวเกินจำเป็น (Verbosity Bias จาก D67) บิลค่า API อาจบานเพราะฝั่งคำตอบมากกว่าฝั่งคำถาม",
        "นี่คือเหตุผลที่ใน Phase 3 ตอนต่อไป เราต้องใช้ {{context-engineering}} เพื่อคุม System Prompt ให้ตอบกระชับ, ใช้ JSON keys เป็นภาษาอังกฤษ, และใช้ {{prompt-caching}} กับส่วน prefix ที่ซ้ำกันทุกคำขอ",
      ],
    },
    {
      id: "price-per-million-trap",
      title: "3 · กับดักราคา `$/1M Tokens`: เมื่อโมเดลที่ดูแพงกว่ากลับถูกกว่าจริงในภาษาไทย",
      paragraphs: [
        "ลองจินตนาการว่าคุณต้องเลือกระหว่าง **Model A** ราคา input `$0.30 / 1M` (ใช้ tokenizer รุ่นเก่าแบบ `cl100k_base` ที่กินภาษาไทย ~3.2x ของอังกฤษ) กับ **Model B** ราคา input `$0.40 / 1M` (ใช้ tokenizer รุ่นใหม่แบบ `o200k_base` ที่กินภาษาไทย ~1.7x ของอังกฤษ)",
        "ถ้าดูแค่ตารางราคา Model A ดูถูกกว่า 25% แต่พอรัน benchmark บนทิกเก็ตภาษาไทยจริง Model A ใช้ token มากกว่าเกือบ 1.9 เท่า ส่งผลให้ **ค่าใช้จ่ายจริงต่อ 10,000 ทิกเก็ตของ Model B ถูกกว่า Model A** แถม {{ttft}} ยังเร็วกว่าและเหลือพื้นที่ Context Window ไว้ใส่เอกสาร {{rag}} ได้มากกว่าเกือบเท่าตัว",
      ],
      analogy: "เหมือนซื้อข้าวสารที่ร้าน A ขายถุงละ 100 บาท (หนัก 2 กก.) เทียบกับร้าน B ขายถุงละ 130 บาท (หนัก 4 กก.) — ดูแค่ราคาต่อถุง (`$/1M tokens`) จะเลือกผิดร้านทันที ต้องเทียบราคาต่อกิโลกรัม (ราคาต่อ 10,000 ทิกเก็ตไทย)",
      bullets: [
        "**เช็ก 1 — Effective Cost**: เทียบ `cost_thb_per_10k` บนข้อความภาษาไทยของโดเมนคุณเอง",
        "**เช็ก 2 — Context Headroom**: เช็กว่า `max_context_fill_pct` เหลือพื้นที่พอสำหรับเอกสาร {{chunking}} และประวัติแชตหลายรอบ",
        "**เช็ก 3 — Reproducibility**: เก็บชุดประโยค benchmark และสคริปต์ไว้ใน repo พร้อม {{pytest}} เพื่อให้รันซ้ำได้ทันทีเมื่อมีโมเดลรุ่นใหม่ออกมา",
      ],
      whyTitle: "Why this matters — เชื่อมตรงไปสู่ Block B18 (Embeddings) และ Phase 5 (Cost Control)",
      whyParagraphs: [
        "ในวันพรุ่งนี้ (Day 69) เราจะเข้าสู่เรื่อง Dense Embeddings สำหรับภาษาไทย ซึ่งโมเดล embedding มี Context Limit แคบกว่า LLM มาก (เช่น 512 หรือ 8,192 tokens) การวัด token ไทยจริงเป็นนิสัยจะช่วยคุณเลือกโมเดล embedding ได้ไม่พลาด",
        "และใน Phase 5 เมื่อต้องทำ Capacity Planning (Day 147) คุณสามารถต่อยอดสคริปต์วันนี้ให้รองรับ `prompt_cache_hit_rate` และ model routing ได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Token-Cost Benchmark ≈ Load & Cost Profiling ก่อนเลือก Cloud SKU",
      body: [
        "เวลาเลือก Cloud Database หรือ Serverless Function นักพัฒนาเว็บไม่เลือกแค่ดูราคาต่อ vCPU แต่จะรัน benchmark ด้วย workload จริงของแอปเพื่อดูค่าใช้จ่ายต่อ 10,000 requests และ P95 latency",
        "Token-Cost Benchmark ในงาน AI Engineering คือเรื่องเดียวกันเป๊ะ: ใช้ชุดทิกเก็ตภาษาไทยเป็น workload, ใช้ `tiktoken` วัดหน่วยบริโภคจริง, และใช้ `Polars` สรุปตารางเปรียบเทียบก่อนตัดสินใจเลือกโมเดล",
      ],
      table: [
        ["`cost_thb_per_10k`", "Cost per 10,000 HTTP requests (unit economics)"],
        ["`mean_inflation_ratio`", "Payload overhead ratio (เช่น XML vs Protobuf)"],
        ["`max_context_fill_pct`", "Memory / payload buffer utilization %"],
        ["`attention_prefill_multiplier`", "CPU work scaling factor (`O(n²)`)"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีใช้ Review Day ให้จำแม่นที่สุด (Interleaved Recall)",
      body: [
        "งานวิจัยด้านการเรียนรู้พบว่า การหยิบความรู้จากหลายวันมาใช้รวมกัน (เช่น เอา `Polars` จาก Day 33 มารวมกับ `O(n²)` ของ Day 65, `tiktoken` ของ Day 66 และ `Chat Template` ของ Day 67) ช่วยให้สมองเชื่อมโยงความรู้ได้แน่นกว่าการอ่านทวนทีละบทแบบแยกส่วน",
        "ลองทำควิซ 4 ข้อด้านล่างก่อนเปิดดูเฉลย จากนั้นลงมือเขียนสคริปต์ benchmark และรัน `pytest` จนเขียวครบทุกข้อ — แค่นี้คุณก็พร้อมลุย Block B18 แล้ว!",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ทีมซัพพอร์ตไทยรับทิกเก็ตเดือนละ 10,000 เคส เราจะเขียนสคริปต์ด้วย `tiktoken` + `Polars` เพื่อวัด `tokens_th / tokens_en`, เปอร์เซ็นต์พื้นที่ Context Window, ภาระ Prefill `O(n²)` และค่าใช้จ่ายเป็น USD/THB ข้าม 2 Tokenizers",
    steps: [
      {
        title: "1 · นับ Token คู่ขนานไทย–อังกฤษข้าม Tokenizer แล้วสร้าง Polars DataFrame",
        explain: "ใช้ `tiktoken` นับจำนวน token ของทิกเก็ตคู่ขนานภาษาไทยและอังกฤษบน `cl100k_base` และ `o200k_base` พร้อมเก็บลงตาราง `Polars` (ทบทวน D33 + D66)",
        code: {
          language: "python",
          filename: "worked_day68.py",
          code: `import polars as pl
import tiktoken

TICKET_PAIRS = [
    {
        "id": "T1",
        "en": "The mobile app froze during QR payment and charged my card twice.",
        "th": "แอปมือถือค้างระหว่างจ่ายเงินด้วยคิวอาร์โค้ดและตัดเงินซ้ำสองรอบ",
    },
    {
        "id": "T2",
        "en": "Please issue a revised tax invoice for order INV-2026-009.",
        "th": "กรุณาออกใบกำกับภาษีฉบับแก้ไขสำหรับคำสั่งซื้อ INV-2026-009",
    },
    {
        "id": "T3",
        "en": "My parcel arrived damaged. How many days do I have to request a refund?",
        "th": "พัสดุมาถึงในสภาพเสียหาย สามารถขอคืนเงินได้ภายในกี่วันครับ",
    },
]

SYSTEM_PROMPT = "คุณคือผู้ช่วยฝ่ายซัพพอร์ต ตอบสั้น กระชับ และคืน JSON ตาม schema เท่านั้น"

rows = []
for enc_name in ("cl100k_base", "o200k_base"):
    enc = tiktoken.get_encoding(enc_name)
    sys_toks = len(enc.encode(SYSTEM_PROMPT))
    for p in TICKET_PAIRS:
        th_toks = len(enc.encode(p["th"]))
        en_toks = len(enc.encode(p["en"]))
        rows.append({
            "encoding": enc_name,
            "ticket_id": p["id"],
            "sys_tokens": sys_toks,
            "th_tokens": th_toks,
            "en_tokens": en_toks,
        })

df = pl.DataFrame(rows).with_columns(
    (pl.col("th_tokens") / pl.col("en_tokens")).alias("inflation_ratio"),
    (pl.col("sys_tokens") + pl.col("th_tokens")).alias("total_input_th"),
)
print(df)`,
        },
        output: `shape: (6, 7)
┌─────────────┬───────────┬────────────┬───────────┬───────────┬─────────────────┬────────────────┐
│ encoding    ┆ ticket_id ┆ sys_tokens ┆ th_tokens ┆ en_tokens ┆ inflation_ratio ┆ total_input_th │
│ ---         ┆ ---       ┆ ---        ┆ ---       ┆ ---       ┆ ---             ┆ ---            │
│ str         ┆ str       ┆ i64        ┆ i64       ┆ i64       ┆ f64             ┆ i64            │
╞═════════════╪═══════════╪════════════╪═══════════╪═══════════╪═════════════════╪════════════════╡
│ cl100k_base ┆ T1        ┆ 49         ┆ 44        ┆ 13        ┆ 3.384615        ┆ 93             │
│ cl100k_base ┆ T2        ┆ 49         ┆ 36        ┆ 13        ┆ 2.769231        ┆ 85             │
│ cl100k_base ┆ T3        ┆ 49         ┆ 39        ┆ 15        ┆ 2.6             ┆ 88             │
│ o200k_base  ┆ T1        ┆ 21         ┆ 20        ┆ 13        ┆ 1.538462        ┆ 41             │
│ o200k_base  ┆ T2        ┆ 21         ┆ 19        ┆ 13        ┆ 1.461538        ┆ 40             │
│ o200k_base  ┆ T3        ┆ 21         ┆ 17        ┆ 15        ┆ 1.133333        ┆ 38             │
└─────────────┴───────────┴────────────┴───────────┴───────────┴─────────────────┴────────────────┘`,
      },
      {
        title: "2 · สรุปด้วย Polars `group_by().agg()` และคำนวณงบ 10,000 ทิกเก็ต (USD & THB)",
        explain: "เทียบ 2 โปรไฟล์ราคาที่จงใจตั้งให้รุ่นเก่า (`cl100k_base`) ราคา input ถูกกว่าเล็กน้อย แต่พอคูณจำนวน token จริงของภาษาไทยจะเห็นทันทีว่าตัวไหนคุ้มกว่า",
        code: {
          language: "python",
          filename: "worked_day68.py",
          code: `pricing = pl.DataFrame([
    {"encoding": "cl100k_base", "context_window": 8192, "in_per_1m": 0.30, "out_per_1m": 1.20},
    {"encoding": "o200k_base", "context_window": 128000, "in_per_1m": 0.40, "out_per_1m": 1.60},
])

# สมมติคำตอบภาษาไทยเฉลี่ย 180 tokens บน cl100k และ 95 tokens บน o200k (หรือใช้ค่าคงที่ 120 เทียบเฉพาะฝั่ง input)
summary = (
    df.group_by("encoding")
    .agg(
        pl.col("th_tokens").mean().round(2).alias("avg_th_toks"),
        pl.col("en_tokens").mean().round(2).alias("avg_en_toks"),
        pl.col("inflation_ratio").mean().round(2).alias("mean_inflation"),
        pl.col("total_input_th").mean().alias("avg_total_in"),
        pl.col("total_input_th").max().alias("max_total_in"),
    )
    .join(pricing, on="encoding")
    .with_columns(
        (pl.col("max_total_in") / pl.col("context_window") * 100.0).round(3).alias("max_ctx_pct"),
        (
            (pl.col("avg_total_in") * 10_000 / 1_000_000) * pl.col("in_per_1m")
            + (120 * 10_000 / 1_000_000) * pl.col("out_per_1m")
        ).round(4).alias("cost_usd_10k"),
    )
    .with_columns((pl.col("cost_usd_10k") * 35.0).round(2).alias("cost_thb_10k"))
    .select("encoding", "avg_th_toks", "mean_inflation", "max_ctx_pct", "cost_usd_10k", "cost_thb_10k")
    .sort("cost_thb_10k")
)
print(summary)`,
        },
        output: `shape: (2, 6)
┌─────────────┬─────────────┬────────────────┬─────────────┬──────────────┬──────────────┐
│ encoding    ┆ avg_th_toks ┆ mean_inflation ┆ max_ctx_pct ┆ cost_usd_10k ┆ cost_thb_10k │
│ ---         ┆ ---         ┆ ---            ┆ ---         ┆ ---          ┆ ---          │
│ str         ┆ f64         ┆ f64            ┆ f64         ┆ f64          ┆ f64          │
╞═════════════╪═════════════╪════════════════╪═════════════╪══════════════╪══════════════╡
│ cl100k_base ┆ 39.67       ┆ 2.92           ┆ 1.135       ┆ 1.706        ┆ 59.71        │
│ o200k_base  ┆ 18.67       ┆ 1.38           ┆ 0.032       ┆ 2.0787       ┆ 72.75        │
└─────────────┴─────────────┴────────────────┴─────────────┴──────────────┴──────────────┘`,
      },
      {
        title: "3 · เช็กภาระ Attention Prefill แบบ O(n²) ระหว่าง 2 Tokenizers",
        explain: "ทบทวน Day 65: ในขั้นที่ 1 `total_input_th` เฉลี่ยของ `cl100k_base` อยู่ที่ ~88.7 tokens ส่วน `o200k_base` อยู่ที่ ~39.7 tokens — ภาระเมทริกซ์ attention `n × n` ต่างกันถึง ~5 เท่า!",
        code: {
          language: "python",
          filename: "worked_day68.py",
          code: `avg_cl100k = df.filter(pl.col("encoding") == "cl100k_base")["total_input_th"].mean()
avg_o200k = df.filter(pl.col("encoding") == "o200k_base")["total_input_th"].mean()
prefill_ratio = (avg_cl100k / avg_o200k) ** 2
print(f"Input tokens: cl100k={avg_cl100k:.1f} vs o200k={avg_o200k:.1f}")
print(f"O(n^2) attention work multiplier: {prefill_ratio:.2f}x")`,
        },
        output: `Input tokens: cl100k=88.7 vs o200k=39.7
O(n^2) attention work multiplier: 5.00x`,
      },
    ],
    gotcha: "สังเกตผลในขั้นที่ 2 ให้ดี! เมื่อตั้ง `output_tokens = 120` เท่ากันทั้งสองโมเดล ตัวเลข `cost_thb_10k` ของ `o200k_base` สูงกว่าเพราะราคา output สูงกว่า — แต่ในความจริงคำตอบภาษาไทยข้อความเดียวกันบน `cl100k_base` จะกิน output tokens มากกว่าเกือบ 2 เท่าด้วย! ดังนั้นเวลาเทียบต้นทุนจริง **ต้องวัดจำนวน output tokens ของคำตอบตัวอย่างด้วย tokenizer ของแต่ละโมเดลเอง** ไม่ใช่ใส่เลขคงที่เท่ากัน",
  },

  practice: {
    intro: "ประกอบสคริปต์ Benchmark ต้นทุนภาษาไทยข้าม Tokenizer ใน `exercise_day68.py` ที่ร้อยรวมความรู้ D65 (`O(n²)`), D66 (`tiktoken`), D67 (system/output template) และ D33 (`Polars`) พร้อมชุดเทสต์ `pytest` ที่รันได้ 100% ออฟไลน์",
    requirements: [
      "`attention_prefill_multiplier(tokens_a: int, tokens_b: int) -> float` คืนอัตราส่วนภาระเมทริกซ์ attention `round((tokens_a / tokens_b) ** 2, 2)` และ `raise ValueError` หากค่าใด `<= 0`",
      "`benchmark_tokenizers(pairs: list[dict[str, str]], profiles: list[dict], *, system_prompt: str = \"\", sample_output_th: str = \"\", num_tickets: int = 10_000, usd_to_thb: float = 35.0) -> pl.DataFrame` โดยแต่ละรายการใน `pairs` มี key `\"th\"` และ `\"en\"`, และแต่ละรายการใน `profiles` มี `\"name\"`, `\"encoding_name\"`, `\"context_window\"`, `\"input_per_1m_usd\"`, `\"output_per_1m_usd\"`",
      "สำหรับแต่ละ profile ให้ใช้ `tiktoken.get_encoding(profile[\"encoding_name\"])` นับ token ของ `system_prompt`, `sample_output_th`, และทุกคู่ `th`/`en` — คำนวณ `inflation_ratio = th_tokens / en_tokens`, `total_input_th = sys_tokens + th_tokens`, `context_fill_pct = (total_input_th / context_window) * 100.0`, และต้นทุนรวม 10,000 ทิกเก็ต (`cost_usd_per_10k` และ `cost_thb_per_10k = cost_usd_per_10k * usd_to_thb`) โดยปัดเศษทศนิยมที่เหมาะสม (`round(..., 2)` สำหรับค่าเฉลี่ย/ratio/THB และ `round(..., 4)` สำหรับ USD และ `max_context_fill_pct`)",
      "คืน `pl.DataFrame` ที่เรียงตาม `cost_thb_per_10k` จากน้อยไปมาก และมีคอลัมน์ครบตามลำดับ: `[\"name\", \"encoding_name\", \"avg_th_tokens\", \"avg_en_tokens\", \"mean_inflation_ratio\", \"max_context_fill_pct\", \"cost_usd_per_10k\", \"cost_thb_per_10k\"]`",
      "ตรวจ input validation: `raise ValueError` หาก `pairs` ว่าง, `profiles` ว่าง, `num_tickets <= 0`, `usd_to_thb <= 0`, `context_window <= 0`, ราคาติดลบ หรือข้อความ `en` มี 0 tokens",
    ],
    starter: {
      language: "python",
      filename: "exercise_day68.py",
      code: `import polars as pl
import tiktoken


def attention_prefill_multiplier(tokens_a: int, tokens_b: int) -> float:
    """คำนวณอัตราส่วนภาระเมทริกซ์ Self-Attention แบบ O(n^2) ระหว่าง tokens_a กับ tokens_b."""
    # TODO: ตรวจค่า > 0 แล้วคืน round((tokens_a / tokens_b) ** 2, 2)
    raise NotImplementedError


def benchmark_tokenizers(
    pairs: list[dict[str, str]],
    profiles: list[dict],
    *,
    system_prompt: str = "",
    sample_output_th: str = "",
    num_tickets: int = 10_000,
    usd_to_thb: float = 35.0,
) -> pl.DataFrame:
    """วัด Token Inflation, Context Fill % และต้นทุนต่อ N ทิกเก็ตภาษาไทยข้ามหลาย tokenizers."""
    # TODO: ตรวจสอบ input, นับ token ด้วย tiktoken, สรุปด้วย Polars และเรียงตาม cost_thb_per_10k
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day68.py",
      code: `import polars as pl
import pytest
from exercise_day68 import attention_prefill_multiplier, benchmark_tokenizers

SAMPLE_PAIRS = [
    {
        "th": "กรุณาตรวจสอบใบกำกับภาษีซ้ำซ้อนสำหรับคำสั่งซื้อ INV-2026-009",
        "en": "Please check the duplicate tax invoice for order INV-2026-009.",
    },
    {
        "th": "แอปมือถือค้างตอนสแกนคิวอาร์โค้ดและตัดเงินซ้ำสองรอบ",
        "en": "The mobile app froze during QR scanning and charged me twice.",
    },
]

PROFILES = [
    {
        "name": "legacy-cl100k",
        "encoding_name": "cl100k_base",
        "context_window": 8192,
        "input_per_1m_usd": 0.30,
        "output_per_1m_usd": 1.20,
    },
    {
        "name": "modern-o200k",
        "encoding_name": "o200k_base",
        "context_window": 128_000,
        "input_per_1m_usd": 0.40,
        "output_per_1m_usd": 1.60,
    },
]


def test_attention_prefill_multiplier():
    assert attention_prefill_multiplier(200, 100) == 4.0
    assert attention_prefill_multiplier(300, 100) == 9.0
    with pytest.raises(ValueError):
        attention_prefill_multiplier(0, 100)
    with pytest.raises(ValueError):
        attention_prefill_multiplier(100, -5)


def test_benchmark_o200k_beats_cl100k_on_thai_effective_cost():
    df = benchmark_tokenizers(
        SAMPLE_PAIRS,
        PROFILES,
        system_prompt="คุณคือผู้ช่วยฝ่ายซัพพอร์ตภาษาไทย ตอบสั้นและชัดเจน",
        sample_output_th="รับเรื่องตรวจสอบใบกำกับภาษีและยอดตัดเงินซ้ำให้เรียบร้อยแล้วครับ เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง",
        num_tickets=10_000,
        usd_to_thb=35.0,
    )
    assert isinstance(df, pl.DataFrame)
    assert df.columns == [
        "name",
        "encoding_name",
        "avg_th_tokens",
        "avg_en_tokens",
        "mean_inflation_ratio",
        "max_context_fill_pct",
        "cost_usd_per_10k",
        "cost_thb_per_10k",
    ]
    # เรียงตาม cost_thb_per_10k จากน้อยไปมาก — modern-o200k ที่ราคาต่อ 1M แพงกว่ากลับจ่ายจริงถูกกว่าบนภาษาไทย!
    assert df["name"].to_list()[0] == "modern-o200k"

    old_row = df.filter(pl.col("name") == "legacy-cl100k").to_dicts()[0]
    new_row = df.filter(pl.col("name") == "modern-o200k").to_dicts()[0]
    assert old_row["mean_inflation_ratio"] > new_row["mean_inflation_ratio"]
    assert old_row["avg_th_tokens"] > new_row["avg_th_tokens"]
    assert old_row["max_context_fill_pct"] > new_row["max_context_fill_pct"]
    assert new_row["cost_thb_per_10k"] == pytest.approx(round(new_row["cost_usd_per_10k"] * 35.0, 2))


def test_benchmark_validation_errors():
    with pytest.raises(ValueError):
        benchmark_tokenizers([], PROFILES)
    with pytest.raises(ValueError):
        benchmark_tokenizers(SAMPLE_PAIRS, [])
    with pytest.raises(ValueError):
        benchmark_tokenizers([{"th": "สวัสดี", "en": ""}], PROFILES)
    with pytest.raises(ValueError):
        benchmark_tokenizers(SAMPLE_PAIRS, PROFILES, num_tickets=0)
    with pytest.raises(ValueError):
        benchmark_tokenizers(SAMPLE_PAIRS, PROFILES, usd_to_thb=-1.0)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 3 test functions โดยไม่ต้องใช้ API key",
      "สังเกตใน `test_benchmark_o200k_beats_cl100k_on_thai_effective_cost`: แม้ `modern-o200k` จะมีราคาต่อ 1M tokens แพงกว่า 33% แต่พอวัดทั้ง input และ output ภาษาไทยด้วย tokenizer ของตัวเอง กลับจ่ายจริงถูกกว่า `legacy-cl100k`",
      "ตรวจสอบว่าชื่อและลำดับคอลัมน์ของ `pl.DataFrame` ตรงตามสเปกทั้ง 8 คอลัมน์และเรียงจากถูกไปแพง",
      "รัน `uv run ruff check .` แล้วไม่มี warning",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day68.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "อย่าลืมวัด `out_tokens = len(enc.encode(sample_output_th))` ด้วย tokenizer ของแต่ละ profile เอง (ไม่ใช่ใช้ค่าคงที่เท่ากัน) เพื่อให้สะท้อน Token Inflation ฝั่งคำตอบภาษาไทยอย่างสมจริง",
      },
      {
        body: "คุณสามารถเก็บผลระดับทิกเก็ตลง `raw_rows` แล้วสร้าง `pl.DataFrame(raw_rows)` จากนั้นใช้ `group_by([\"name\", \"encoding_name\", \"context_window\", \"in_rate\", \"out_rate\", \"out_tokens\"])` แล้วตามด้วย `.agg(...)`, `.with_columns(...)`, `.select(...)`, `.sort(\"cost_thb_per_10k\")` ได้ในสายโซ่ Polars เดียว",
      },
      {
        body: "โครงของ `benchmark_tokenizers` เกือบครบแล้ว — ตรวจสอบการ validate ราคาและ `context_window` เพิ่มเติม แล้วเติม `attention_prefill_multiplier` ให้สมบูรณ์",
        code: {
          language: "python",
          filename: "hint_day68.py",
          code: `import polars as pl
import tiktoken


def benchmark_tokenizers(
    pairs: list[dict[str, str]],
    profiles: list[dict],
    *,
    system_prompt: str = "",
    sample_output_th: str = "",
    num_tickets: int = 10_000,
    usd_to_thb: float = 35.0,
) -> pl.DataFrame:
    if not pairs or not profiles or num_tickets <= 0 or usd_to_thb <= 0:
        raise ValueError("Invalid benchmark arguments")

    rows: list[dict] = []
    for prof in profiles:
        ctx = prof["context_window"]
        in_rate = prof["input_per_1m_usd"]
        out_rate = prof["output_per_1m_usd"]
        if ctx <= 0 or in_rate < 0 or out_rate < 0:
            raise ValueError("Invalid profile pricing or context_window")
        enc = tiktoken.get_encoding(prof["encoding_name"])
        sys_toks = len(enc.encode(system_prompt))
        out_toks = len(enc.encode(sample_output_th))
        for p in pairs:
            en_toks = len(enc.encode(p["en"]))
            th_toks = len(enc.encode(p["th"]))
            if en_toks == 0:
                raise ValueError("English text must produce > 0 tokens")
            total_in = sys_toks + th_toks
            rows.append({
                "name": prof["name"],
                "encoding_name": prof["encoding_name"],
                "th_tokens": th_toks,
                "en_tokens": en_toks,
                "inflation_ratio": th_toks / en_toks,
                "context_fill_pct": (total_in / ctx) * 100.0,
                "total_in": total_in,
                "out_tokens": out_toks,
                "in_rate": in_rate,
                "out_rate": out_rate,
            })

    return (
        pl.DataFrame(rows)
        .group_by("name", "encoding_name", "out_tokens", "in_rate", "out_rate")
        .agg(
            pl.col("th_tokens").mean().round(2).alias("avg_th_tokens"),
            pl.col("en_tokens").mean().round(2).alias("avg_en_tokens"),
            pl.col("inflation_ratio").mean().round(2).alias("mean_inflation_ratio"),
            pl.col("context_fill_pct").max().round(4).alias("max_context_fill_pct"),
            pl.col("total_in").mean().alias("avg_total_in"),
        )
        .with_columns(
            (
                (pl.col("avg_total_in") * num_tickets / 1_000_000) * pl.col("in_rate")
                + (pl.col("out_tokens") * num_tickets / 1_000_000) * pl.col("out_rate")
            )
            .round(4)
            .alias("cost_usd_per_10k")
        )
        .with_columns((pl.col("cost_usd_per_10k") * usd_to_thb).round(2).alias("cost_thb_per_10k"))
        .select(
            "name",
            "encoding_name",
            "avg_th_tokens",
            "avg_en_tokens",
            "mean_inflation_ratio",
            "max_context_fill_pct",
            "cost_usd_per_10k",
            "cost_thb_per_10k",
        )
        .sort("cost_thb_per_10k")
    )`,
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
      title: "เทียบต้นทุน 2 โมเดลโดยใช้จำนวน `output_tokens` คงที่เท่ากันทั้งสองฝั่ง",
      symptom: "ตั้ง `output_tokens = 150` เท่ากันทั้ง `cl100k_base` และ `o200k_base` ทำให้มองไม่เห็นความประหยัดมหาศาลของ tokenizer รุ่นใหม่ในฝั่งคำตอบภาษาไทย",
      fix: "ใช้ตัวอย่างคำตอบภาษาไทยจริง (`sample_output_th`) แล้วนับจำนวน token ด้วย tokenizer ของแต่ละโมเดลเองทุกครั้ง",
    },
    {
      title: "ลืมนับ System Prompt และ Chat Template Overhead ในการคิดงบ Context",
      symptom: "นับเฉพาะข้อความลูกค้าว่ายาว 100 tokens แต่ลืมว่า system prompt + few-shot + template ยาวอีก 1,200 tokens ทุกคำขอ ทำให้งบประมาณต่ำกว่าความจริงกว่า 10 เท่า",
      fix: "รวม `system_prompt` และโครงสร้าง Chat Template เข้าไปใน `total_input_tokens` ตั้งแต่ขั้น benchmark (และใช้ {{prompt-caching}} ลดต้นทุนส่วนนี้ใน Day 79)",
    },
    {
      title: "ประเมินเฉพาะต้นทุนเงินโดยลืมผลกระทบ `O(n²)` ต่อ TTFT",
      symptom: "เลือกโมเดลที่ราคาต่อ 1M ถูกกว่าแต่มี Thai Token Inflation สูงกว่า 2 เท่า พอขึ้นระบบจริงผู้ใช้บ่นว่าเว็บหมุนรอนานขึ้นมาก",
      fix: "เช็กทั้ง `cost_thb_per_10k` และ `attention_prefill_multiplier` (`(tokens_a / tokens_b) ** 2`) ควบคู่กัน",
    },
    {
      title: "ทดสอบกับประโยคภาษาไทยแค่ประโยคสั้น ๆ 1 ประโยค",
      symptom: "ประโยคสั้นที่มีเลขรหัสอังกฤษปนเยอะให้ `inflation_ratio = 1.2x` เลยนึกว่าภาษาไทยไม่เปลือง แต่พอเจอทิกเก็ตจริงที่เป็นภาษาไทยล้วน ratio พุ่งเป็น `2.8x`",
      fix: "ใช้ชุดตัวอย่างทิกเก็ตจริงที่ครอบคลุมทั้งไทยล้วน, code-switching ไทย–อังกฤษ, และข้อความยาวหลายย่อหน้า",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d068-q1",
        "[ทบทวน D65 + D66] หากโมเดล A ใช้ tokenizer ที่แปลงเอกสารภาษาไทยเป็น 6,000 tokens ขณะที่โมเดล B แปลงเอกสารเดียวกันเป็น 3,000 tokens ภาระของเมทริกซ์ Self-Attention `n × n` ช่วง prefill ของโมเดล A จะเป็นกี่เท่าของโมเดล B?",
        [
          ["2 เท่า", "ไม่ใช่ — 2 เท่าคือความต่างเชิงเส้นของจำนวน token แต่เมทริกซ์ Self-Attention โตแบบ O(n²)"],
          ["4 เท่า", "ถูก — `(6000 / 3000)² = 2² = 4` เท่า ส่งผลตรงต่อหน่วยความจำและ TTFT ช่วง prefill"],
          ["6 เท่า", "ไม่ใช่ — O(n²) คือยกกำลังสอง ไม่ใช่คูณสาม"],
          ["เท่ากันเพราะเป็นเอกสารความหมายเดียวกัน", "Transformer คำนวณตามจำนวน token IDs ไม่ใช่ตามความหมายของมนุษย์"],
        ],
        "B",
        "Self-Attention มีความซับซ้อนระดับ `O(n²)` เมื่อ Token Inflation ทำให้จำนวน token ไทยเพิ่มเป็น 2 เท่า ขนาดเมทริกซ์ attention จะขยายเป็น 4 เท่าทันที",
        "ถ้า Token Inflation ทำให้ความยาว input ไทยเพิ่ม 2 เท่า ภาระเมทริกซ์ Self-Attention เพิ่มกี่เท่า?",
        "4 เท่า (`2²`) ตามความซับซ้อนแบบ `O(n²)` ของ Self-Attention",
      ),
      mc(
        "d068-q2",
        "[ทบทวน D66] โมเดล X คิดราคา `$0.30 / 1M tokens` (เฉลี่ยทิกเก็ตไทยละ 400 tokens) ส่วนโมเดล Y คิดราคา `$0.45 / 1M tokens` (เฉลี่ยทิกเก็ตไทยละ 200 tokens) หากประมวลผล 10,000 ทิกเก็ต โมเดลใดจ่ายจริงถูกกว่า?",
        [
          ["โมเดล X ถูกกว่าเพราะราคาต่อ 1M tokens ต่ำกว่า", "ผิด — โมเดล X ใช้ `4M` tokens = `$1.20` แต่โมเดล Y ใช้ `2M` tokens = `$0.90`"],
          ["โมเดล Y ถูกกว่า (`$0.90` เทียบกับ `$1.20`) แม้ราคาต่อ 1M tokens จะแพงกว่า 50%", "ถูก — เพราะ tokenizer ของโมเดล Y บีบอัดภาษาไทยได้ดีกว่า 2 เท่า ต้นทุนสุทธิต่อ 10,000 ทิกเก็ตจึงต่ำกว่า"],
          ["เท่ากันเป๊ะที่ `$1.00`", "ไม่เท่า — X = `$1.20`, Y = `$0.90`"],
          ["คำนวณไม่ได้เพราะไม่รู้จำนวนตัวอักษรภาษาไทย", "LLM คิดเงินตามจำนวน token จริง ไม่ใช่จำนวนตัวอักษร"],
        ],
        "B",
        "ต้องคำนวณ Effective Cost จากจำนวน token จริงบนข้อความภาษาไทยเสมอ: `400 × 10k × $0.30/1M = $1.20` vs `200 × 10k × $0.45/1M = $0.90`",
        "ทำไมโมเดลที่ราคา `$/1M tokens` แพงกว่า 50% จึงอาจจ่ายจริงถูกกว่าบนงานภาษาไทย?",
        "ถ้า tokenizer ของมันใช้จำนวน token ภาษาไทยน้อยกว่า 2 เท่า ต้นทุนสุทธิต่อ 10,000 คำขอจะต่ำกว่า (เช่น `$0.90` vs `$1.20`)",
      ),
      mc(
        "d068-q3",
        "[ทบทวน D67] ข้อใดอธิบายความแตกต่างระหว่าง Base Model, SFT Model และโมเดลที่ผ่าน RLHF/DPO ได้ถูกต้องที่สุด?",
        [
          ["Base Model ผ่าน DPO แล้ว, SFT ผ่าน Pre-training อย่างเดียว, ส่วน RLHF ใช้ตัดคำภาษาไทย", "สลับลำดับและบทบาททั้งหมด"],
          ["Base Model ฝึกทาย token ถัดไป, SFT สอนทำตามคำสั่งด้วย Chat Template + loss masking, และ RLHF/DPO ขัดเกลาความชอบ การปฏิเสธ และความกระชับจากคู่ `(chosen, rejected)`", "ถูก — นี่คือลำดับ 3 ขั้นของ Post-training ที่เปลี่ยนเครื่องเดาคำถัดไปให้เป็นผู้ช่วยใน production"],
          ["ทั้งสามแบบให้คำตอบเหมือนกันเป๊ะ ต่างกันแค่ขนาด Context Window", "พฤติกรรมการตอบต่างกันอย่างสิ้นเชิง โดยเฉพาะการทำตามคำสั่งและการหยุดพูด"],
          ["RLHF/DPO เป็นขั้นตอนที่ใช้แทนที่ Pre-training ทั้งหมด", "RLHF/DPO ทำต่อจาก Pre-training และ SFT ไม่สามารถแทนที่ Pre-training ได้"],
        ],
        "B",
        "Pre-training สร้างความรู้ฐาน, SFT สอนการสนทนาและโครงสร้างคำตอบด้วย Chat Template, และ RLHF/DPO ปรับจูนพฤติกรรมให้สอดคล้องกับความต้องการและความปลอดภัย",
        "เรียงลำดับและสรุปบทบาทของ Pre-training → SFT → RLHF/DPO",
        "Pre-training (ความรู้โลก/ทายคำถัดไป) → SFT (ทำตามคำสั่ง/Chat Template) → RLHF/DPO (ขัดเกลาความชอบ ความปลอดภัย และความกระชับ)",
      ),
      mc(
        "d068-q4",
        "[ทบทวน D33 + D66] เมื่อต้องการสรุปผล benchmark ทิกเก็ตหลายพันรายการข้ามหลาย tokenizers ด้วย Polars รูปแบบใดเหมาะสมและเร็วที่สุด?",
        [
          ["วน `for` loop ซ้อนกันใน Python เพื่อคำนวณค่าเฉลี่ยทีละเซลล์แล้วค่อยแปลงเป็น Polars ตอนจบ", "ช้าและอ่านยาก ไม่ได้ใช้ประโยชน์จาก Expression ของ Polars"],
          ["เก็บแถวผลวัดใน `pl.DataFrame` แล้วใช้ `group_by(...).agg(...)` ต่อด้วย `with_columns(...)` และ `sort(...)` แบบ declarative chain", "ถูก — อ่านง่าย รันแบบ multi-threaded อัตโนมัติ และตรวจสอบคอลัมน์ผลลัพธ์ด้วย `pytest` ได้ชัดเจน"],
          ["ใช้สูตร `len(text) / 4` ใน Polars แทนการเรียก `tiktoken` เพื่อให้เร็วขึ้น", "เร็วขึ้นจริงแต่ตัวเลขภาษาไทยผิดเพี้ยน 2x–3x ใช้งานวางงบจริงไม่ได้"],
          ["เก็บผลทั้งหมดเป็น string เดียวแล้วใช้ regex ดึงตัวเลข", "เปราะบางและเสี่ยง parse พลาด ไม่เหมาะกับงานวิเคราะห์ข้อมูล"],
        ],
        "B",
        "การผสานการนับ token จริงด้วย `tiktoken` เข้ากับ Polars `group_by().agg()` + `with_columns()` ได้ทั้งความแม่นยำ ความเร็ว และโค้ดที่อ่านและเทสต์ง่าย",
        "ทำไมจึงควรใช้ Polars `group_by().agg()` ร่วมกับ `tiktoken` ในสคริปต์ benchmark?",
        "ได้ตัวเลข token ภาษาไทยที่แม่นยำจาก `tiktoken` พร้อมการสรุปตารางเปรียบเทียบแบบ multi-threaded ที่อ่านง่ายและเทสต์ซ้ำได้ด้วย `pytest`",
      ),
    ],
  },

  takeaways: [
    "Block B17 เชื่อม 3 แกนหลักของ LLM เข้าด้วยกัน: **Transformer `O(n²)`** (D65) × **Thai BPE Token Inflation** (D66) × **Post-training & Chat Template** (D67)",
    "อย่าเลือกโมเดลสำหรับงานภาษาไทยจากราคา `$/1M tokens` เพียงอย่างเดียว — ให้รัน benchmark วัด **Effective Cost ต่อ 10,000 ทิกเก็ต (USD/THB)** ที่นับทั้ง system prompt, input และ output ด้วย tokenizer ของแต่ละโมเดลเอง",
    "การรวม `tiktoken` กับ {{polars}} และ {{pytest}} ทำให้คุณมีสคริปต์ประเมินงบที่ {{reproducibility|ทำซ้ำได้}} ทุกครั้งที่มีโมเดลใหม่ออกสู่ตลาด",
    "พร้อมก้าวสู่ Block B18 (Day 69): Dense Text Embeddings สำหรับภาษาไทย โดยนำวินัยการวัด token และ context limit ติดตัวไปด้วย",
  ],

  reviewCards: [
    rc(
      "d068-rc-1",
      "เวลาเทียบงบประมาณ LLM สำหรับระบบภาษาไทย 4 ตัวชี้วัดหลักในสคริปต์ Benchmark คืออะไรบ้าง?",
      "1) `mean_inflation_ratio` (`tokens_th / tokens_en`), 2) `max_context_fill_pct` (รวม system prompt), 3) `cost_usd/thb_per_10k` (แยกคิด input/output ด้วย tokenizer ของโมเดลเอง), 4) `attention_prefill_multiplier` (`O(n²)`)",
    ),
    rc(
      "d068-rc-2",
      "ทำไมจึงห้ามใส่ค่า `output_tokens` คงที่เท่ากันเวลาเทียบต้นทุนระหว่าง `cl100k_base` กับ `o200k_base`?",
      "เพราะคำตอบภาษาไทยข้อความเดียวกันจะถูกแตกเป็นจำนวน output tokens ต่างกันเกือบ 2 เท่า และราคา output มักแพงกว่า input 3x–5x",
    ),
    rc(
      "d068-rc-3",
      "สรุปความเชื่อมโยงระหว่าง D65 (Attention), D66 (BPE) และ D67 (Post-training) เมื่อออกแบบระบบ AI ภาษาไทย",
      "BPE ที่ดีลด token ไทย → ลดทั้งค่า API เชิงเส้นและภาระ Attention `O(n²)` (TTFT เร็วขึ้น) ส่วน SFT/DPO + Chat Template ที่ถูกต้องช่วยให้คำตอบกระชับ ตรง JSON และไม่เปลือง output tokens",
    ),
  ],

  sources: [
    { label: "tiktoken Official Repository (OpenAI BPE Tokenizer)", href: "https://github.com/openai/tiktoken" },
    { label: "Polars Official User Guide — Expressions & GroupBy", href: "https://docs.pola.rs/user-guide/expressions/" },
    { label: "Hugging Face Transformers — Tokenizer & Chat Templating Docs", href: "https://huggingface.co/docs/transformers/main_classes/tokenizer" },
    { label: "Attention Is All You Need (Vaswani et al., 2017)", href: "https://arxiv.org/abs/1706.03762" },
  ],

  glossary: ["bpe-tokenizer", "transformer", "rlhf-dpo", "polars", "ttft", "context-engineering", "reproducibility", "pytest"],
});
