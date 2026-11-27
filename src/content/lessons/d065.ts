import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D065 — Phase 3 / Block B17
 * Transformer Architecture Intuition (Self-Attention, Positional Info)
 */
export const d065: Lesson = defineLesson({
  day: 65,
  titleTh: "เข้าใจสถาปัตยกรรม Transformer: Self-Attention, ตำแหน่งคำ และต้นทุน O(n²)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · จำลอง Self-Attention และวัดต้นทุน context ด้วย NumPy",
  icon: "sparkles",
  visual: {
    id: "self-attention",
    title: "Self-Attention — โมเดลเชื่อมความหมายระหว่างคำอย่างไร",
    caption: "คลิกเลือกคำในประโยคเพื่อดูน้ำหนัก attention ที่โยงไปยังคำสำคัญอื่นในบริบทเดียวกัน",
    alt: "แผนภาพเส้นเชื่อมน้ำหนัก Self-Attention ระหว่างคำในประโยค",
  },
  requiresApiKey: false,
  tools: ["NumPy", "PyTorch", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "โมเดลเชื่อมบริบททั้งประโยคด้วย Self-Attention",
      body: "{{transformer}} อ่านทุก token พร้อมกันแล้วคำนวณน้ำหนักความสัมพันธ์ระหว่างคำทุกคู่ ทำให้ตีความคำกำกวมหรือคำสรรพนามข้ามประโยคได้แม่นยำกว่าสถาปัตยกรรมรุ่นเก่า",
      lessonNote: "วันนี้เราลงมือเขียน Scaled Dot-Product Attention และ Causal Mask ด้วย NumPy เพื่อให้เห็นภาพจริงว่า Q, K, V ทำงานอย่างไร",
    },
    {
      node: 3,
      heading: "ตำแหน่งคำและขอบเขตบริบทส่งผลต่อคุณภาพคำตอบ",
      body: "ข้อมูลที่อยู่ต้นหรือท้าย prompt มักได้น้ำหนัก attention ต่างจากข้อมูลที่ฝังอยู่ตรงกลาง และหากลืม Positional Encoding โมเดลจะแยกความหมายของลำดับคำไม่ได้เลย",
      lessonNote: "เราจะทดสอบการสลับตำแหน่ง token เพื่อพิสูจน์ว่าทำไม Positional Encoding จึงเปลี่ยนผลลัพธ์ของโมเดลได้ทันที",
    },
    {
      node: 4,
      heading: "ต้นทุน O(n²) กำหนดความเร็ว TTFT และงบ Context ของแอป",
      body: "เมื่อส่งบริบทยาวขึ้น 2 เท่า เมทริกซ์ attention ขยายตัว 4 เท่า ส่งผลตรงต่อ {{ttft}} และหน่วยความจำ GPU ในช่วง prefill",
      lessonNote: "เราจะคำนวณขนาดหน่วยความจำของ attention matrix ตามความยาวบริบท เพื่อใช้ตัดสินใจออกแบบ {{context-engineering}} และ {{prompt-caching}}",
    },
    {
      node: 5,
      heading: "เฝ้าดูความยาว prompt เพื่อกัน latency พุ่งใน production",
      body: "ระบบที่ยัดประวัติแชตและเอกสารทั้งหมดเข้า {{llm}} โดยไม่ตัดแต่งจะเห็น P95 latency พุ่งแบบไม่เป็นเส้นตรงเมื่อบริบทโตขึ้น",
      lessonNote: "สูตรประเมินต้นทุน O(n²) ของวันนี้คือพื้นฐานสำหรับการตั้ง context budget ใน Phase 4–5",
    },
  ],

  objectives: [
    "**อธิบายและเขียนโค้ด** Scaled Dot-Product Self-Attention ด้วย Query (Q), Key (K), Value (V) และ Causal Mask ได้อย่างถูกต้อง",
    "**พิสูจน์ด้วยโค้ด** ว่าเหตุใด Self-Attention จึงต้องการ Positional Encoding เพื่อแยกแยะลำดับคำในประโยค",
    "**ประเมิน** ผลกระทบของความซับซ้อนระดับ O(n²) ต่อ {{ttft}} หน่วยความจำ และการออกแบบ context budget ของระบบ {{llm}}",
  ],

  prerequisites: [
    "Vectors, {{dot-product}} และ Matrix Multiplication ใน NumPy (Day 37)",
    "{{tensor}} และ Softmax จาก PyTorch พื้นฐาน (Days 61–63)",
    "Python พื้นฐานและ `pytest`",
    "รันได้ 100% บน CPU ของเครื่องคุณ ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "ใช้ `uv` สร้างโปรเจกต์เบา ๆ บน CPU เพื่อทดลองเขียน Self-Attention ด้วย NumPy (ไม่จำเป็นต้องติดตั้ง GPU driver)",
    commands: `uv init ai-day65 && cd ai-day65
uv add numpy
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('NumPy:', np.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์โปรเจกต์ `ai-day65` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `numpy` และ `pytest` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน NumPy แล้วไม่มี error"],
    ],
  },

  concepts: [
    {
      id: "self-attention-qkv",
      title: "1 · Self-Attention และสัญชาตญาณของ Q, K, V",
      paragraphs: [
        "ปัญหาหลักของภาษาคือคำเดียวกันเปลี่ยนความหมายตามบริบท เช่น คำว่า *\"มัน\"* ในประโยค *\"ลูกค้าแจ้งว่าแอปค้างตอนจ่ายเงิน และมันหักเงินซ้ำ\"* — โมเดลต้องเชื่อมคำว่า *\"มัน\"* กลับไปยัง *\"แอป\"* ไม่ใช่ *\"ลูกค้า\"* กลไก **Self-Attention** ใน {{transformer}} แก้ปัญหานี้โดยให้ทุก token เปรียบเทียบความเกี่ยวข้องกับทุก token อื่นในประโยคพร้อมกัน",
        "แต่ละ token จะถูกแปลงผ่านเมทริกซ์น้ำหนักเป็นเวกเตอร์ 3 บทบาท: **Query (Q)** คือคำถามว่า *\"ฉันกำลังมองหาข้อมูลแบบไหน\"*, **Key (K)** คือป้ายระบุว่า *\"ฉันมีข้อมูลเรื่องอะไร\"*, และ **Value (V)** คือ *\"เนื้อหาจริงที่จะส่งมอบให้\"*",
        "โมเดลคำนวณความเข้ากันของทุกคู่ด้วย {{dot-product}} ระหว่าง Q กับ K หารด้วย `sqrt(d_k)` เพื่อไม่ให้ตัวเลขใหญ่เกินไป ผ่าน Softmax ให้กลายเป็นน้ำหนักความน่าจะเป็นรวมกันได้ 1 แล้วนำไปถ่วงน้ำหนักรวมกับ V — สำหรับ {{llm}} แบบ Decoder (เช่น GPT/Claude) จะใส่ **Causal Mask** บังคำในอนาคตไว้ด้วยค่า `-inf` ก่อนเข้า Softmax เพื่อไม่ให้แอบดูคำตอบล่วงหน้า",
      ],
      analogy: "เหมือนการค้นแฟ้มเอกสารในออฟฟิศ: Query คือหัวข้อที่คุณกำลังหา, Key คือป้ายสันแฟ้มของแต่ละเล่ม, ส่วน Value คือเนื้อหาข้างในแฟ้ม — แฟ้มที่ป้ายตรงกับหัวข้อมากที่สุดจะได้น้ำหนักอ่านมากที่สุด",
      code: {
        language: "python",
        filename: "attention_intuition.py",
        code: `import numpy as np


def softmax(x: np.ndarray) -> np.ndarray:
    shifted = x - np.max(x, axis=-1, keepdims=True)
    exp_x = np.exp(shifted)
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)


def scaled_dot_product_attention(
    q: np.ndarray, k: np.ndarray, v: np.ndarray, causal: bool = False
) -> tuple[np.ndarray, np.ndarray]:
    d_k = q.shape[-1]
    scores = (q @ k.T) / np.sqrt(d_k)
    if causal:
        mask = np.triu(np.ones_like(scores, dtype=bool), k=1)
        scores = np.where(mask, -1e9, scores)
    weights = softmax(scores)
    return weights @ v, weights`,
        caption: "แกนกลางของ Self-Attention เขียนด้วย NumPy ไม่ถึง 15 บรรทัด — ใน PyTorch จริงมี `F.scaled_dot_product_attention` ที่เร่งความเร็วด้วย FlashAttention",
      },
      whyTitle: "Why this matters — ทำไมต้องหารด้วย √d_k",
      whyParagraphs: [
        "เมื่อมิติของเวกเตอร์ `d_k` ใหญ่ขึ้น (เช่น 64 หรือ 128) ผลรวมของ {{dot-product}} จะมีค่ากระจายกว้างมาก หากส่งเข้า Softmax ทันที ค่าน้ำหนักจะกระจุกเป็น `1.0` ที่คำเดียวและ `0.0` ที่คำอื่น ทำให้ gradient แทบเป็นศูนย์และโมเดลเรียนรู้ไม่ได้",
        "การหารด้วย `np.sqrt(d_k)` ช่วยคุมความแปรปรวนของคะแนนให้อยู่ในช่วงที่ Softmax แยกแยะน้ำหนักหลายคำได้อย่างนุ่มนวล — นี่คือเหตุผลที่ชื่อเต็มของมันคือ **Scaled** Dot-Product Attention",
      ],
    },
    {
      id: "positional-encoding",
      title: "2 · ทำไมตำแหน่งคำ (Positional Encoding) จึงขาดไม่ได้",
      paragraphs: [
        "ข้อสังเกตสำคัญของสูตร `softmax(Q @ K.T / sqrt(d_k)) @ V` คือมันทำงานแบบ **Permutation-Invariant** (ไม่แคร์ลำดับก่อนหลัง) — หากเราย้ายตำแหน่งคำในประโยคโดยไม่บอกลำดับ โมเดลจะเห็นประโยค *\"ลูกค้าคืนสินค้าให้ร้าน\"* และ *\"ร้านคืนสินค้าให้ลูกค้า\"* เป็นชุดคำเดียวกันเป๊ะ",
        "สถาปัตยกรรม {{transformer}} จึงต้องเติมข้อมูลตำแหน่งเข้าไปใน {{embedding}} ของแต่ละ token เช่น **Sinusoidal Positional Encoding** (ใช้คลื่น `sin`/`cos` หลายความถี่บวกเข้าไปที่เวกเตอร์) หรือในโมเดลยุคใหม่อย่าง Llama/Qwen ที่นิยมใช้ **RoPE (Rotary Position Embedding)** ซึ่งหมุนเวกเตอร์ Q และ K ตามมุมของตำแหน่ง เพื่อให้ dot-product สะท้อน **ระยะห่างสัมพัทธ์** ระหว่างคำได้โดยตรง",
      ],
      analogy: "เหมือนกองกระดาษสไลด์ที่ร่วงกระจายบนพื้น — ถ้าไม่ได้พิมพ์เลขหน้าไว้ที่มุมกระดาษ ต่อให้เนื้อหาครบทุกแผ่นก็เรียงลำดับเรื่องราวไม่ได้",
      bullets: [
        "**Sinusoidal PE**: บวกเวกเตอร์คลื่น `sin`/`cos` ประจำตำแหน่งลงใน input embedding โดยตรง ไม่ต้องเรียนรู้พารามิเตอร์เพิ่ม",
        "**RoPE (Rotary PE)**: หมุน Q และ K ตามตำแหน่ง ช่วยขยายความยาวบริบท (context extension) ได้ดีกว่าและเป็นมาตรฐานของ open-weights LLM ยุคปัจจุบัน",
        "**Causal Mask + Position**: ทำงานคู่กัน — ตำแหน่งบอก *\"อยู่ห่างกันแค่ไหน\"* ส่วน mask บอก *\"ห้ามมองไปข้างหน้า\"*",
      ],
      whyTitle: "Why this matters — ตำแหน่งใน Prompt มีผลต่อคุณภาพคำตอบ",
      whyParagraphs: [
        "งานวิจัยด้าน Long Context พบปรากฏการณ์ *Lost in the Middle*: แม้โมเดลจะรองรับบริบท 128k tokens แต่ข้อมูลสำคัญที่วางไว้ตรงกลางเอกสารยาว ๆ มักถูก attention จับได้น้อยกว่าข้อมูลที่วางไว้ตอนต้นหรือตอนท้าย",
        "ในงาน {{context-engineering}} จริง เราจึงมักวางคำสั่งหลักไว้ต้น prompt และวางเอกสารที่เกี่ยวข้องที่สุดไว้ใกล้คำถามผู้ใช้ แทนการโยนข้อมูลทุกอย่างเรียงสุ่มเข้าไป",
      ],
    },
    {
      id: "quadratic-cost",
      title: "3 · ต้นทุน O(n²) ของ Context Window กับ TTFT และหน่วยความจำ",
      paragraphs: [
        "ในเมทริกซ์คะแนน `Q @ K.T` หากความยาวข้อความคือ `n` tokens โมเดลต้องคำนวณความสัมพันธ์ครบทุกคู่เท่ากับ `n × n` ช่อง นั่นคือความซับซ้อนระดับ **O(n²)** ทั้งในแง่การคำนวณ (FLOPs) และหน่วยความจำของ attention matrix (ก่อนใช้เทคนิค tiling อย่าง FlashAttention)",
        "ผลกระทบในหน้างานจริงคือช่วง **Prefill** (ตอนโมเดลอ่าน prompt ทั้งหมดก่อนจะพ่นคำตอบตัวแรกออกมา) ยิ่ง prompt ยาวขึ้น `2×` เวลา {{ttft}} และต้นทุนการประมวลผลจะพุ่งขึ้นแบบไม่เป็นเส้นตรง นอกจากนี้ตอนสร้างคำตอบทีละ token โมเดลต้องเก็บ **KV Cache** ของทุก token ก่อนหน้าไว้ใน VRAM ซึ่งโตเป็นสัดส่วนกับความยาวบริบทและจำนวนผู้ใช้พร้อมกัน",
      ],
      analogy: "เหมือนการประชุมทีมที่ทุกคนต้องจับคู่คุยกับทุกคนทีละคู่: 4 คนคุยกัน 16 คู่, 8 คนเพิ่มเป็น 64 คู่, แต่ถ้า 40 คนจะพุ่งเป็น 1,600 คู่ — เพิ่มคนแค่ 10 เท่า แต่งานเพิ่ม 100 เท่า",
      bullets: [
        "**n = 1,000 tokens** → `1,000,000` คู่ต่อ 1 head ต่อ 1 layer",
        "**n = 10,000 tokens** → `100,000,000` คู่ (เพิ่ม 100 เท่า ไม่ใช่ 10 เท่า)",
        "**ทางแก้ฝั่งวิศวกรแอป**: ทำ {{chunking}} + ดึงเฉพาะส่วนที่เกี่ยวข้อง (RAG), สรุปประวัติแชตเก่า, และใช้ {{prompt-caching}} สำหรับ system prompt/เอกสารที่ซ้ำกัน",
      ],
      whyTitle: "Why this matters — Context Window ใหญ่ไม่ได้แปลว่าควรยัดทุกอย่างเข้าไป",
      whyParagraphs: [
        "มือใหม่มักคิดว่า \"โมเดลรับได้ 200k tokens งั้นส่งคู่มือ PDF ทั้งเล่มเข้าทุก request เลย\" ผลลัพธ์คือค่า API พุ่งสูง, {{ttft}} ช้าจนผู้ใช้ปิดหน้าเว็บ, และความแม่นยำลดลงเพราะสัญญาณรบกวนกลบเนื้อหาสำคัญ",
        "การเข้าใจต้นทุน `O(n²)` ช่วยให้คุณตัดสินใจเชิงสถาปัตยกรรมได้อย่างมีเหตุผลใน Phase 4–5 ว่าเมื่อไรควรใช้ RAG, เมื่อไรควรใช้ {{prompt-caching}}, และเมื่อไรควรลดความยาวบริบท",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — มอง Self-Attention เป็น Soft Lookup และ Nested Loop",
      body: [
        "ในฐานข้อมูลหรือ JavaScript `Map.get(key)` คุณเทียบคีย์แบบตรงเป๊ะ (`===`) แล้วดึง value มาตัวเดียว แต่ Self-Attention คือ **Soft Map Lookup** ที่เทียบ Query กับทุก Key ด้วยความคล้ายคลึง (dot-product) แล้วผสม Value ของทุกตัวตามเปอร์เซ็นต์ความเหมือน",
        "ส่วนต้นทุน `O(n²)` ก็เหมือนโค้ดที่มี `for` ซ้อน `for` บนรายการยาว `n` — ตอนเทสต์กับ 20 รายการดูเร็วมาก แต่พอขึ้น production เจอ 20,000 รายการ เซิร์ฟเวอร์จะค้างทันที",
      ],
      table: [
        ["Self-Attention (Q, K, V)", "Fuzzy Map lookup ที่คืน weighted average ของทุก value"],
        ["Causal Mask (`-1e9`)", "กรองรายการที่ timestamp > current_time ออกก่อนคำนวณ"],
        ["Positional Encoding", "แนบ `index` ให้ element ก่อนส่งเข้าชุดประมวลผลแบบขนาน"],
        ["Attention Matrix `O(n²)`", "Nested loop `n × n` ที่ทำให้ latency โตแบบกำลังสอง"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Transformer ถึงมาแทน RNN",
      body: [
        "โมเดลภาษาสมัยก่อน (RNN/LSTM) อ่านคำทีละคำเรียงจากซ้ายไปขวาเหมือน `for` loop จึงทำงานแบบขนานบน GPU ได้ยาก และมักลืมคำที่อยู่ไกล ๆ ต้นประโยค",
        "Transformer ตัด loop ตามลำดับเวลาออก แล้วใช้การคูณเมทริกซ์ `Q @ K.T` คำนวณทุกคำพร้อมกันในครั้งเดียว (parallelize ได้เต็มประสิทธิภาพบน GPU) แลกมากับต้นทุนเมทริกซ์ขนาด `n × n` ที่ต้องบริหารจัดการอย่างรอบคอบ",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เราจะสร้าง Self-Attention ขนาดจิ๋วด้วย NumPy เพื่อดู 3 อย่างด้วยตาตัวเอง — น้ำหนัก attention พร้อม Causal Mask, ผลของ Positional Encoding เมื่อสลับลำดับคำ, และขนาดหน่วยความจำแบบ O(n²)",
    steps: [
      {
        title: "1 · รัน Causal Self-Attention และเช็กว่าน้ำหนักไม่รั่วไปอนาคต",
        explain: "สร้างเวกเตอร์จำลอง 4 tokens (เช่น `[\"ลูกค้า\", \"จ่าย\", \"เงิน\", \"ซ้ำ\"]`) มิติ `d_k = 4` แล้วเปิด `causal=True` จะเห็นว่าครึ่งบนของเมทริกซ์น้ำหนักเป็น `0.0` ทั้งหมด",
        code: {
          language: "python",
          filename: "worked_day65.py",
          code: `import numpy as np

rng = np.random.default_rng(42)
tokens = ["ลูกค้า", "จ่าย", "เงิน", "ซ้ำ"]
q = rng.normal(size=(4, 4))
k = rng.normal(size=(4, 4))
v = rng.normal(size=(4, 4))


def softmax(x: np.ndarray) -> np.ndarray:
    shifted = x - np.max(x, axis=-1, keepdims=True)
    exp_x = np.exp(shifted)
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)


def sdpa(q: np.ndarray, k: np.ndarray, v: np.ndarray, causal: bool = False):
    scores = (q @ k.T) / np.sqrt(q.shape[-1])
    if causal:
        mask = np.triu(np.ones_like(scores, dtype=bool), k=1)
        scores = np.where(mask, -1e9, scores)
    weights = softmax(scores)
    return weights @ v, weights


out, weights = sdpa(q, k, v, causal=True)
print("Causal attention weights (rows sum to 1):")
print(np.round(weights, 3))
print("Row sums:", np.round(weights.sum(axis=-1), 3))`,
        },
        output: `Causal attention weights (rows sum to 1):
[[1.    0.    0.    0.   ]
 [0.412 0.588 0.    0.   ]
 [0.178 0.369 0.453 0.   ]
 [0.341 0.122 0.251 0.286]]
Row sums: [1. 1. 1. 1.]`,
      },
      {
        title: "2 · เพิ่ม Sinusoidal Positional Encoding เพื่อแยกแยะลำดับคำ",
        explain: "สร้างเมทริกซ์คลื่น `sin`/`cos` ขนาด `(seq_len, d_model)` แล้วบวกเข้ากับ embedding — เมื่อสลับคำตำแหน่งที่ 0 กับ 2 ค่าเวกเตอร์รวมจะเปลี่ยนทันที ต่างจากตอนไม่ใส่ PE",
        code: {
          language: "python",
          filename: "worked_day65.py",
          code: `def sinusoidal_pe(seq_len: int, d_model: int) -> np.ndarray:
    pos = np.arange(seq_len)[:, None]
    i = np.arange(0, d_model, 2)[None, :]
    angles = pos / np.power(10000.0, i / d_model)
    pe = np.zeros((seq_len, d_model), dtype=np.float64)
    pe[:, 0::2] = np.sin(angles)
    pe[:, 1::2] = np.cos(angles)
    return pe


pe = sinusoidal_pe(seq_len=4, d_model=4)
x_order_a = np.array([[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]])
x_order_b = x_order_a[[2, 1, 0, 3]]  # สลับคำที่ 0 กับคำที่ 2

out_a, _ = sdpa(x_order_a + pe, x_order_a + pe, x_order_a + pe)
out_b, _ = sdpa(x_order_b + pe, x_order_b + pe, x_order_b + pe)
diff = np.linalg.norm(out_a[0] - out_b[2])
print(f"Vector diff for same word at different position: {diff:.4f}")`,
        },
        output: `Vector diff for same word at different position: 0.6842`,
      },
      {
        title: "3 · คำนวณการเติบโตของ Attention Matrix แบบ O(n²)",
        explain: "จำลองเมทริกซ์ attention ของโมเดลขนาดกลาง (32 heads, 32 layers, FP16 = 2 bytes) เมื่อเพิ่มบริบทจาก 512 เป็น 16,384 tokens จะเห็นหน่วยความจำโตจากไม่กี่สิบ MB เป็นหลายสิบ GB",
        code: {
          language: "python",
          filename: "worked_day65.py",
          code: `def attention_matrix_mb(seq_len: int, heads: int = 32, layers: int = 32, bytes_per_elem: int = 2) -> float:
    total_elements = layers * heads * seq_len * seq_len
    return (total_elements * bytes_per_elem) / (1024 ** 2)


for n in [512, 2048, 8192, 16384]:
    mb = attention_matrix_mb(n)
    print(f"n={n:5d} tokens -> {mb:10.1f} MB ({mb / 1024:6.2f} GB)")`,
        },
        output: `n=  512 tokens ->      512.0 MB (  0.50 GB)
n= 2048 tokens ->     8192.0 MB (  8.00 GB)
n= 8192 tokens ->   131072.0 MB (128.00 GB)
n=16384 tokens ->   524288.0 MB (512.00 GB)`,
      },
    ],
    gotcha: "จุดพลาดคลาสสิกตอนเขียน Causal Mask: อย่าแทนช่องอนาคตด้วยเลข `0.0` ก่อนเข้า Softmax เพราะ `exp(0) = 1` ซึ่งยังให้น้ำหนักแก่อนาคตอยู่ดี! ต้องใส่ค่าติดลบมาก ๆ อย่าง `-1e9` (หรือ `-np.inf`) เพื่อให้ `exp(-inf) = 0.0`",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day65.py` ที่รวมฟังก์ชันพื้นฐาน 3 ตัวของ Transformer: Causal Self-Attention, Sinusoidal Positional Encoding และตัวประมาณการหน่วยความจำ O(n²)",
    requirements: [
      "`scaled_dot_product_attention(q, k, v, causal=False)` คืน tuple `(output, weights)` โดย `weights` ทุกแถวรวมกันได้ `1.0` และเมื่อ `causal=True` ค่าเหนือเส้นทแยงมุมหลักต้องเป็น `0.0`",
      "`sinusoidal_positional_encoding(seq_len, d_model)` คืน `np.ndarray` รูปทรง `(seq_len, d_model)` ที่คอลัมน์เลขคู่ใช้ `sin` คอลัมน์เลขคี่ใช้ `cos` (รองรับ `d_model` เลขคู่บวก และ raise `ValueError` ถ้า `d_model % 2 != 0` หรือ `seq_len <= 0`)",
      "`estimate_attention_mb(seq_len, num_heads, num_layers, bytes_per_elem=2)` คำนวณขนาดหน่วยความจำของ attention scores (MB) เป็น `float` และ raise `ValueError` หากพารามิเตอร์ใด `<= 0`",
      "โค้ดต้องใช้ NumPy อย่างเดียวและรันผ่านบน CPU ในเวลาต่ำกว่า 1 วินาที",
    ],
    starter: {
      language: "python",
      filename: "exercise_day65.py",
      code: `import numpy as np


def scaled_dot_product_attention(
    q: np.ndarray,
    k: np.ndarray,
    v: np.ndarray,
    causal: bool = False,
) -> tuple[np.ndarray, np.ndarray]:
    """คำนวณ Scaled Dot-Product Attention และคืน (output, weights)."""
    # TODO: คำนวณ scores = (q @ k.T) / sqrt(d_k), ใส่ causal mask ด้วย -1e9 ถ้า causal=True
    raise NotImplementedError


def sinusoidal_positional_encoding(seq_len: int, d_model: int) -> np.ndarray:
    """สร้าง Sinusoidal Positional Encoding ขนาด (seq_len, d_model)."""
    # TODO: ตรวจสอบ input และสร้างเมทริกซ์ sin/cos
    raise NotImplementedError


def estimate_attention_mb(
    seq_len: int,
    num_heads: int,
    num_layers: int,
    bytes_per_elem: int = 2,
) -> float:
    """ประมาณขนาด attention matrix (MB) แบบ O(n^2)."""
    # TODO: ตรวจสอบค่า > 0 แล้วคำนวณขนาดในหน่วย MB (หารด้วย 1024**2)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day65.py",
      code: `import numpy as np
import pytest
from exercise_day65 import (
    estimate_attention_mb,
    scaled_dot_product_attention,
    sinusoidal_positional_encoding,
)


def test_attention_weights_sum_to_one_and_shape():
    rng = np.random.default_rng(7)
    q = rng.normal(size=(5, 8))
    k = rng.normal(size=(5, 8))
    v = rng.normal(size=(5, 6))
    out, weights = scaled_dot_product_attention(q, k, v, causal=False)
    assert out.shape == (5, 6)
    assert weights.shape == (5, 5)
    assert np.allclose(weights.sum(axis=-1), np.ones(5), atol=1e-6)


def test_causal_mask_blocks_future_tokens():
    rng = np.random.default_rng(11)
    q = rng.normal(size=(4, 4))
    k = rng.normal(size=(4, 4))
    v = rng.normal(size=(4, 4))
    _, weights = scaled_dot_product_attention(q, k, v, causal=True)
    upper = np.triu(weights, k=1)
    assert np.allclose(upper, 0.0, atol=1e-7)
    assert np.isclose(weights[0, 0], 1.0)


def test_positional_encoding_distinct_and_validates():
    pe = sinusoidal_positional_encoding(6, 8)
    assert pe.shape == (6, 8)
    assert not np.allclose(pe[0], pe[1])
    with pytest.raises(ValueError):
        sinusoidal_positional_encoding(4, 7)
    with pytest.raises(ValueError):
        sinusoidal_positional_encoding(0, 8)


def test_quadratic_memory_growth():
    mb_1k = estimate_attention_mb(1024, num_heads=16, num_layers=12)
    mb_2k = estimate_attention_mb(2048, num_heads=16, num_layers=12)
    assert np.isclose(mb_2k / mb_1k, 4.0)
    with pytest.raises(ValueError):
        estimate_attention_mb(-1, 16, 12)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases",
      "ลองเปลี่ยน `causal=False` เป็น `causal=True` แล้วเห็นค่าเหนือเส้นทแยงมุมหลักเป็น `0.0`",
      "ตรวจสอบว่า `sinusoidal_positional_encoding` ปฏิเสธ `d_model` ที่เป็นเลขคี่ด้วย `ValueError`",
      "ตรวจสอบว่าเมื่อ `seq_len` เพิ่ม 2 เท่า ค่า `estimate_attention_mb` เพิ่มเป็น 4 เท่าเป๊ะ",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day65.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "สำหรับ Softmax ที่ไม่ล้นตัวเลข (numerically stable) ให้ลบ `np.max(scores, axis=-1, keepdims=True)` ออกก่อนเรียก `np.exp` และใช้ `np.triu(..., k=1)` เพื่อระบุตำแหน่งเหนือเส้นทแยงมุมหลัก",
      },
      {
        body: "ใน `scaled_dot_product_attention` ใช้ `np.where(mask, -1e9, scores)` เมื่อ `causal=True` ส่วนใน `sinusoidal_positional_encoding` ใช้ `pos = np.arange(seq_len)[:, None]` และ `i = np.arange(0, d_model, 2)[None, :]` แล้วเติมคอลัมน์ `0::2` ด้วย `sin` และ `1::2` ด้วย `cos`",
      },
      {
        body: "โครงฟังก์ชันสองตัวแรกเกือบสมบูรณ์ — เหลือให้คุณเติมสูตรคูณใน `estimate_attention_mb` และเช็ก input validation เอง",
        code: {
          language: "python",
          filename: "hint_day65.py",
          code: `import numpy as np


def _softmax(x: np.ndarray) -> np.ndarray:
    shifted = x - np.max(x, axis=-1, keepdims=True)
    exps = np.exp(shifted)
    return exps / np.sum(exps, axis=-1, keepdims=True)


def scaled_dot_product_attention(q, k, v, causal: bool = False):
    d_k = q.shape[-1]
    scores = (q @ k.T) / np.sqrt(d_k)
    if causal:
        mask = np.triu(np.ones_like(scores, dtype=bool), k=1)
        scores = np.where(mask, -1e9, scores)
    weights = _softmax(scores)
    return weights @ v, weights


def sinusoidal_positional_encoding(seq_len: int, d_model: int) -> np.ndarray:
    if seq_len <= 0 or d_model <= 0 or d_model % 2 != 0:
        raise ValueError("seq_len > 0 and even d_model > 0 required")
    pos = np.arange(seq_len)[:, None]
    i = np.arange(0, d_model, 2)[None, :]
    angles = pos / np.power(10000.0, i / d_model)
    pe = np.zeros((seq_len, d_model), dtype=np.float64)
    pe[:, 0::2] = np.sin(angles)
    pe[:, 1::2] = np.cos(angles)
    return pe`,
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
      title: "ใส่ 0 แทน -inf ใน Causal Mask",
      symptom: "ตั้งใจบังคำในอนาคตด้วย `scores[mask] = 0.0` แต่หลัง Softmax ค่าน้ำหนักของคำในอนาคตยังไม่เป็นศูนย์",
      fix: "ต้องแทนค่าด้วย `-1e9` หรือ `-np.inf` ก่อนเข้า Softmax เพราะ `exp(0) = 1` ในขณะที่ `exp(-inf) = 0`",
    },
    {
      title: "ลืมหารด้วย √d_k ก่อน Softmax",
      symptom: "เมื่อมิติ `d_k` ใหญ่ (เช่น 64–128) น้ำหนัก attention แข็งกระด้างเป็น `1.0` กับ `0.0` และเวลาเทรน gradient หาย",
      fix: "หาร `q @ k.T` ด้วย `np.sqrt(d_k)` ทุกครั้งตามสูตร Scaled Dot-Product Attention",
    },
    {
      title: "คิดว่า Context Window 128k แปลว่าส่งเอกสารทั้งหมดได้ฟรี",
      symptom: "ส่งเอกสารยาว 80k tokens ทุก request ทำให้ {{ttft}} ช้าลงหลายวินาที ค่า API พุ่ง และคำตอบหลุดรายละเอียดตรงกลางเอกสาร",
      fix: "คัดกรองเฉพาะบริบทที่เกี่ยวข้องด้วย {{chunking}} + RAG และใช้ {{prompt-caching}} กับส่วน prefix ที่คงที่",
    },
    {
      title: "เข้าใจว่า Softmax โดยไม่ลบค่า max จะไม่มีวัน overflow",
      symptom: "เจอ `NaN` เมื่อค่าใน `scores` สูงเกิน ~709 ใน float64 เพราะ `np.exp(1000)` เกิด overflow",
      fix: "ลบ `np.max(x, axis=-1, keepdims=True)` ออกก่อนเรียก `np.exp` เสมอ — ค่าผลลัพธ์ทางคณิตศาสตร์เท่าเดิมแต่ปลอดภัยจาก overflow",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d065-q1",
        "ในกลไก Self-Attention ของ Transformer เวกเตอร์ Query (Q), Key (K) และ Value (V) ทำหน้าที่ต่างกันอย่างไร?",
        [
          ["Q คือคำตอบสุดท้าย, K คือรหัสผ่าน API, V คือขนาด batch", "ไม่ใช่ — ทั้ง Q, K, V เป็นเวกเตอร์ที่ฉายมาจาก token embeddings เพื่อคำนวณความสัมพันธ์ภายในประโยค"],
          ["Q แทนสิ่งที่ token กำลังมองหา, K แทนป้ายระบุข้อมูลของแต่ละ token, และ V แทนเนื้อหาที่จะถูกนำมาถ่วงน้ำหนักรวมกัน", "ถูก — dot-product ของ Q กับ K สร้างค่าน้ำหนัก attention แล้วนำไปคูณถ่วงน้ำหนักกับ V"],
          ["Q และ K ใช้เฉพาะตอนเทรน ส่วนตอน inference ใช้เฉพาะ V", "ไม่จริง — ตอน inference โมเดลต้องคำนวณ Q กับ K เหมือนเดิม (และเก็บ K, V ไว้ใน KV Cache)"],
          ["Q แทนตำแหน่งคำ, K แทนภาษาไทย, V แทนภาษาอังกฤษ", "ไม่เกี่ยวกัน — ตำแหน่งคำมาจาก Positional Encoding ไม่ใช่ Q"],
        ],
        "B",
        "Self-Attention เปรียบเทียบ Query ของคำปัจจุบันกับ Key ของทุกคำในบริบทเพื่อหาค่าน้ำหนัก แล้วนำค่าน้ำหนักนั้นมาผสม Value เข้าด้วยกัน",
        "บทบาทของ Q, K, V ใน Self-Attention คืออะไร?",
        "Q = สิ่งที่คำนี้กำลังมองหา, K = ป้ายบอกว่าแต่ละคำมีข้อมูลอะไร, V = เนื้อหาจริงที่จะดึงมาถ่วงน้ำหนักรวม",
      ),
      mc(
        "d065-q2",
        "หากตัด Positional Encoding ออกจากชั้น Self-Attention โดยไม่ใส่ Causal Mask จะเกิดผลอย่างไรกับประโยค *\"หมากัดคน\"* และ *\"คนกัดหมา\"*?",
        [
          ["โมเดลจะแยกความหมายได้แม่นยำขึ้นเพราะลดสัญญาณรบกวน", "ไม่จริง — หากไม่มีข้อมูลตำแหน่ง โมเดลไม่รู้ว่าใครเป็นประธานหรือกรรม"],
          ["โมเดลจะโยน `ValueError` ทันทีตอนคูณเมทริกซ์", "เมทริกซ์ยังคูณกันได้ปกติ ไม่มี error แต่ความหมายเชิงลำดับจะหายไป"],
          ["Self-Attention จะมองเห็นชุด token ทั้งสองประโยคเหมือนกันทุกประการ (permutation-invariant)", "ถูก — เพราะ dot-product คิดทุกคู่พร้อมกันโดยไม่รู้จักลำดับก่อนหลัง จึงต้องเติม Positional Encoding"],
          ["โมเดลจะอ่านได้เฉพาะคำแรกและคำสุดท้ายของประโยค", "Self-Attention เชื่อมทุกคำถึงกันหมด ปัญหาคือมันไม่รู้ว่าคำไหนมาก่อนหรือมาหลัง"],
        ],
        "C",
        "Self-Attention โดยลำพังเป็น permutation-invariant จึงต้องเติมข้อมูลตำแหน่ง (เช่น Sinusoidal PE หรือ RoPE) เพื่อให้โมเดลเข้าใจลำดับคำ",
        "ทำไม Transformer จึงขาด Positional Encoding ไม่ได้?",
        "เพราะ Self-Attention ไม่แคร์ลำดับคำ (permutation-invariant) — ถ้าไม่เติมตำแหน่ง \"หมากัดคน\" กับ \"คนกัดหมา\" จะให้ผลลัพธ์ชุดเดียวกัน",
      ),
      mc(
        "d065-q3",
        "ในการทำ Causal Mask เพื่อป้องกันไม่ให้ token ปัจจุบันแอบดู token ในอนาคต ควรเติมค่าใดลงในช่องอนาคตของเมทริกซ์คะแนนก่อนเข้า Softmax?",
        [
          ["`0.0` เพื่อให้คะแนนเป็นศูนย์", "ผิดพลาดยอดฮิต — เพราะ `exp(0) = 1` ทำให้น้ำหนักหลัง Softmax ไม่เป็นศูนย์และข้อมูลอนาคตยังรั่วเข้ามา"],
          ["`1.0` เพื่อให้น้ำหนักเท่ากันทุกคำ", "ยิ่งทำให้คำในอนาคตได้น้ำหนักสูงขึ้น ไม่ใช่การบัง"],
          ["`-inf` (หรือค่าติดลบมาก ๆ เช่น `-1e9`) เพื่อให้หลังผ่าน Softmax กลายเป็น `0.0`", "ถูก — `exp(-inf) = 0` ทำให้น้ำหนักของ token ในอนาคตเป็นศูนย์สนิท"],
          ["`None` เพื่อข้ามช่องนั้น", "NumPy/PyTorch ไม่รองรับ `None` ในเมทริกซ์ตัวเลข float"],
        ],
        "C",
        "ต้องกำหนดคะแนนของตำแหน่งอนาคตเป็น `-inf` (หรือ `-1e9`) ก่อน Softmax เพื่อให้ค่าความน่าจะเป็นออกมาเป็น `0.0` อย่างสมบูรณ์",
        "ทำไม Causal Mask ต้องใช้ `-inf` แทน `0` ก่อนเข้า Softmax?",
        "เพราะ `exp(0) = 1` (น้ำหนักยังไม่เป็นศูนย์) ส่วน `exp(-inf) = 0` ปิดกั้น token ในอนาคตได้ 100%",
      ),
      mc(
        "d065-q4",
        "ถ้าเราเพิ่มความยาวบริบท (input tokens) จาก 4,000 tokens เป็น 12,000 tokens (เพิ่มขึ้น 3 เท่า) ขนาดเมทริกซ์ attention `n × n` จะเพิ่มขึ้นกี่เท่า?",
        [
          ["3 เท่า", "ไม่ใช่ — นั่นคือการเติบโตแบบเชิงเส้น O(n) แต่ attention จับคู่ทุก token กับทุก token"],
          ["6 เท่า", "ไม่ใช่ — O(n²) คือยกกำลังสอง ไม่ใช่คูณสอง"],
          ["9 เท่า", "ถูก — `3² = 9` นี่คือเหตุผลที่การส่งบริบทยาวเกินจำเป็นทำให้ TTFT และต้นทุนพุ่งขึ้นแบบก้าวกระโดด"],
          ["ไม่เพิ่มขึ้นเลยเพราะน้ำหนักโมเดลมีขนาดคงที่", "พารามิเตอร์โมเดลคงที่จริง แต่เมทริกซ์ activation ของ attention และ KV Cache ขยายตามความยาว input"],
        ],
        "C",
        "ความซับซ้อนของ attention matrix เป็น `O(n²)` เมื่อความยาวบริบทเพิ่ม `3×` จำนวนคู่ที่ต้องคำนวณจะเพิ่ม `3² = 9×`",
        "ถ้าความยาว context เพิ่ม 3 เท่า เมทริกซ์ Self-Attention โตขึ้นกี่เท่า และกระทบอะไรในระบบจริง?",
        "โตขึ้น 9 เท่า (`O(n²)`) กระทบเวลา TTFT ช่วง prefill หน่วยความจำ และต้นทุน API — จึงต้องควบคุมความยาวบริบทอย่างมีวินัย",
      ),
    ],
  },

  takeaways: [
    "Self-Attention คำนวณความสัมพันธ์ระหว่างทุกคู่คำด้วย `softmax((Q @ K.T) / sqrt(d_k)) @ V` และใช้ Causal Mask (`-inf`) ป้องกันไม่ให้โมเดลแอบดูคำในอนาคต",
    "Positional Encoding (Sinusoidal / RoPE) คือสิ่งที่ทำให้ {{transformer}} แยกแยะลำดับคำได้ เพราะ Self-Attention โดยลำพังไม่รู้จักตำแหน่ง",
    "เมทริกซ์ attention เติบโตแบบ `O(n²)` ตามความยาวบริบท ส่งผลโดยตรงต่อ {{ttft}} หน่วยความจำ และความจำเป็นในการทำ {{context-engineering}} กับ {{prompt-caching}}",
    "การเข้าใจกลไกภายในแบบเห็นภาพช่วยให้ตัดสินใจเลือกขนาดบริบทและการจัดวางข้อมูลใน prompt ได้อย่างมีเหตุผล ไม่ต้องเดาสุ่ม",
  ],

  reviewCards: [
    rc(
      "d065-rc-1",
      "สูตร Scaled Dot-Product Attention คืออะไร และทำไมต้องหารด้วย `sqrt(d_k)`?",
      "`softmax((Q @ K.T) / sqrt(d_k)) @ V` — หารด้วย `sqrt(d_k)` เพื่อไม่ให้ค่า dot-product ใหญ่เกินจน Softmax อิ่มตัวและ gradient หาย",
    ),
    rc(
      "d065-rc-2",
      "Causal Mask ใช้ค่าอะไรแทนตำแหน่งอนาคตก่อนเข้า Softmax และทำไมไม่ใช้ `0`?",
      "ใช้ `-inf` (หรือ `-1e9`) เพราะ `exp(-inf) = 0` ส่วน `exp(0) = 1` จะทำให้ข้อมูลอนาคตรั่วเข้ามา",
    ),
    rc(
      "d065-rc-3",
      "ทำไม AI Engineer ไม่ควรยัดเอกสารทั้งเล่มเข้า Context Window ทุก request แม้โมเดลจะรองรับ 128k tokens?",
      "เพราะต้นทุน attention โตแบบ `O(n²)` ทำให้ TTFT ช้าลง ค่า API แพงขึ้น และเสี่ยงเกิด Lost in the Middle ที่ความแม่นยำลดลง",
    ),
  ],

  sources: [
    { label: "Attention Is All You Need (Vaswani et al., 2017 — Original Paper)", href: "https://arxiv.org/abs/1706.03762" },
    { label: "PyTorch Docs — scaled_dot_product_attention", href: "https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html" },
    { label: "Hugging Face Transformers Documentation", href: "https://huggingface.co/docs/transformers/index" },
    { label: "vLLM Documentation — PagedAttention & KV Cache Economics", href: "https://docs.vllm.ai/" },
  ],

  glossary: ["transformer", "tensor", "dot-product", "llm", "embedding", "context-engineering", "ttft", "prompt-caching"],
});
