import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D067 — Phase 3 / Block B17
 * Pre-training vs SFT vs RLHF/DPO (How models become instruction-following)
 */
export const d067: Lesson = defineLesson({
  day: 67,
  titleTh: "จาก Base Model สู่ผู้ช่วยที่คุยรู้เรื่อง: Pre-training, SFT และ RLHF/DPO",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · เข้าใจ 3 ขั้น Post-training, Chat Template และคำนวณ DPO Loss ด้วย NumPy",
  icon: "sparkles",
  visual: {
    id: "post-training-stages",
    title: "3 ขั้นสร้าง LLM ให้คุยรู้เรื่อง: Pre-training → SFT → RLHF/DPO",
    caption: "กดสลับแต่ละขั้นเพื่อเห็นว่าคำถามเดียวกันได้คำตอบต่างกันอย่างไรจาก Base model สู่ Chat assistant",
    alt: "แผนภาพเปรียบเทียบ Pre-training, SFT และ RLHF/DPO",
  },
  requiresApiKey: false,
  tools: ["transformers", "tiktoken", "NumPy", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อมูลต่างชนิดสร้างพฤติกรรมโมเดลต่างโลก",
      body: "Pre-training ใช้ข้อความดิบหลายล้านล้าน tokens เพื่ออัดความรู้โลก แต่ขั้น Post-training ใช้ข้อมูลขนาดเล็กกว่ามากแต่คัดคุณภาพสูง — ชุดคำสั่ง-คำตอบแบบ {{jsonl}} สำหรับ SFT และคู่คำตอบ `chosen` vs `rejected` สำหรับ {{rlhf-dpo}}",
      lessonNote: "วันนี้เราออกแบบฟังก์ชันจัดรูป Chat Template พร้อม SFT loss mask และตัวตรวจสอบคู่ข้อมูล DPO ก่อนส่งเข้าเทรน",
    },
    {
      node: 2,
      heading: "Post-training เปลี่ยนเครื่องเดาคำถัดไปให้เป็น Chat Assistant",
      body: "{{transformer}} หลังจบ Pre-training (Base model) รู้แค่การต่อประโยคให้เหมือนเอกสารในเน็ต — ขั้น SFT สอนให้ทำตามคำสั่งและตอบตามโครงสร้าง ส่วน {{rlhf-dpo}} ขัดเกลาให้ตอบกระชับ ปลอดภัย และรู้จักปฏิเสธ",
      lessonNote: "เราจะคำนวณสมการ DPO Loss ด้วย NumPy เพื่อเห็นคณิตศาสตร์เบื้องหลังการดันคำตอบ `chosen` และกดคำตอบ `rejected`",
    },
    {
      node: 3,
      heading: "พฤติกรรมการปฏิเสธและการปฏิบัติตาม Schema เกิดจากขั้นนี้",
      body: "อาการตอบอ้อมโลก พูดเข้าข้างผู้ใช้เกินจริง (sycophancy) หรือไม่ยอมคืน JSON ตามสั่ง ล้วนผูกอยู่กับวิธีจัดชุดข้อมูล Post-training และวิธีประเมินคุณภาพคำตอบ",
      lessonNote: "เข้าใจจุดแข็งและข้อจำกัดของแต่ละขั้น เพื่อให้รู้ว่าเมื่อไรควรแก้ด้วย prompt/schema และเมื่อไรต้องปรับโมเดล",
    },
    {
      node: 4,
      heading: "เลือก Checkpoint และ Chat Template ให้ถูกในแอปจริง",
      body: "การโหลดไฟล์โมเดลลงท้าย `-Base` แทน `-Instruct` หรือส่ง Chat Template ผิดรูปแบบเป็นสาเหตุคลาสสิกที่ทำให้ {{llm}} ใน production ตอบเพี้ยนหรือพูดต่อไม่หยุด",
      lessonNote: "คุณจะได้กฎตรวจสอบ checkpoint และการใช้ Chat Template ที่ช่วยลดบั๊กตั้งแต่ Day 83 (Ollama) จนถึง Phase 5",
    },
  ],

  objectives: [
    "**เปรียบเทียบและอธิบาย** บทบาท ข้อมูลที่ใช้ และลักษณะผลลัพธ์ของทั้ง 3 ขั้นตอน: Pre-training (Base Model), SFT (Supervised Fine-Tuning) และ Preference Alignment ({{rlhf-dpo}})",
    "**จัดรูป** บทสนทนาหลายรอบด้วย Chat Template และสร้าง SFT token loss mask (`-100` บน prompt tokens) เพื่อให้โมเดลเรียนรู้เฉพาะส่วนคำตอบของ assistant",
    "**คำนวณและตีความ** สมการ DPO Loss และ implicit reward margin ด้วย NumPy บนคู่ข้อมูล `(prompt, chosen, rejected)` ได้อย่างถูกต้อง",
  ],

  prerequisites: [
    "ความเข้าใจ {{transformer}} (Causal Self-Attention) และ {{softmax}} (Days 63 & 65)",
    "แนวคิด {{bpe-tokenizer}} และ special tokens จาก Day 66",
    "Python พื้นฐาน, NumPy และ `pytest`",
    "รันบน CPU ของเครื่องคุณได้ 100% ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์เบา ๆ ด้วย {{uv}} เพื่อทดลองสร้าง Chat Template, SFT loss mask และคำนวณ DPO Loss ด้วย NumPy (รันได้ทันทีบน CPU โดยไม่ต้องดาวน์โหลดน้ำหนักโมเดลขนาดใหญ่)",
    commands: `uv init ai-day67 && cd ai-day67
uv add numpy
uv add --dev pytest ruff
uv run python -c "import numpy as np; print('NumPy ready:', np.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์โปรเจกต์ `ai-day67` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `numpy`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน NumPy แล้วไม่มี error"],
    ],
    note: "ในงานจริงที่โหลดโมเดล open-weights คุณจะใช้ `transformers` (`tokenizer.apply_chat_template(...)`) — บทนี้จำลองกลไกเดียวกันด้วย Python/NumPy ล้วนเพื่อให้ทดสอบได้ 100% ออฟไลน์ในไม่กี่มิลลิวินาที",
  },

  concepts: [
    {
      id: "pretraining-base-model",
      title: "1 · Pre-training (Base Model): เครื่องเดาคำถัดไปที่ไม่รู้จักคำว่า \"ผู้ช่วย\"",
      paragraphs: [
        "ขั้นแรกของการสร้าง {{llm}} คือ **Pre-training** — นำ {{transformer}} ขนาดใหญ่ไปฝึกด้วยเป้าหมายเดียวที่เรียบง่ายมากคือ **Next-Token Prediction** บนข้อความดิบหลายล้านล้าน tokens จากเว็บ หนังสือ โค้ด และเอกสารวิชาการ ผลลัพธ์ที่ได้เรียกว่า **Base Model**",
        "Base Model เต็มไปด้วยความรู้โลกและไวยากรณ์ภาษา แต่ **มันไม่ได้ถูกฝึกให้ตอบคำถามคุณ** — มันถูกฝึกให้ *\"เดาข้อความที่น่าจะปรากฏถัดไปในเอกสาร\"* หากคุณส่งข้อความว่า *\"สรุปนโยบายคืนเงินเป็น 3 ข้อ\"* Base Model อาจพิมพ์ต่อว่า *\"และอธิบายวิธีขอใบกำกับภาษี พร้อมยกตัวอย่าง 2 กรณี หมายเหตุ: คะแนนเต็ม 10 คะแนน\"* เพราะมันคิดว่ากำลังต่อโจทย์ข้อสอบ!",
        "นอกจากนี้ Base Model ยังไม่รู้ว่าควร **หยุดพูดเมื่อไร** ในรูปแบบแชต มันจึงมักไหลต่อไปเรื่อย ๆ (ramble) หรือสร้างบทสนทนาถามเอง-ตอบเองยาวเหยียด จนกว่าจะชนขีดจำกัดความยาว",
      ],
      analogy: "Base Model เหมือนคนที่อ่านหนังสือในหอสมุดแห่งชาติจนจบทุกเล่มแต่ไม่เคยฝึกมารยาทการสนทนา พอคุณถามคำถามหนึ่งข้อ เขาอาจท่องต่อย่อหน้าถัดไปจากหนังสือแทนที่จะสรุปคำตอบให้คุณตรง ๆ",
      bullets: [
        "**Objective**: ลด Cross-Entropy Loss ของการทาย token ถัดไป (Self-Supervised Learning — ไม่ต้องให้คนมานั่งติดป้าย)",
        "**ต้นทุน**: ใช้ GPU หลายพันตัวนานหลายสัปดาห์ เป็นขั้นที่แพงที่สุด (>95% ของ compute ทั้งหมด)",
        "**สัญญาณสังเกตบน Hugging Face**: ชื่อโมเดลมักไม่มีคำว่า `-Instruct` หรือ `-Chat` (เช่น `Qwen2.5-7B` vs `Qwen2.5-7B-Instruct`)",
      ],
      whyTitle: "Why this matters — อย่าเผลอเอา Base Model ไปต่อแชตบอตโดยตรง",
      whyParagraphs: [
        "มือใหม่ที่รันโมเดล open-weights บนเครื่องมักเผลอดาวน์โหลดตัว Base แล้วตกใจว่าทำไมสั่งงานเป็นภาษาไทยไม่ได้ผลหรือพิมพ์ซ้ำไปเรื่อย ๆ",
        "Base Model เหมาะกับงานต่อข้อความ (code autocomplete) หรือเป็นจุดตั้งต้นสำหรับนำไปทำ fine-tuning ต่อ ส่วนงานแชต, สกัด JSON หรือ RAG แทบทั้งหมดต้องใช้ **Instruct / Chat Model** ที่ผ่าน Post-training แล้ว",
      ],
    },
    {
      id: "sft-chat-templates",
      title: "2 · SFT (Supervised Fine-Tuning) และ Chat Templates: สอนบทบาทและรูปแบบคำตอบ",
      paragraphs: [
        "ขั้นที่สองคือ **SFT (Supervised Fine-Tuning)** — เราสอน Base Model ด้วยชุดตัวอย่างการสนทนาคุณภาพสูงหลักหมื่นถึงหลักแสนคู่ (`system` / `user` → `assistant`) ที่เขียนโดยมนุษย์หรือคัดกรองอย่างเข้มงวด เพื่อให้โมเดลเปลี่ยนโหมดจาก *\"นักต่อเอกสาร\"* มาเป็น *\"ผู้ช่วยที่ทำตามคำสั่ง\"*",
        "หัวใจทางเทคนิคของ SFT มี 2 อย่างที่วิศวกร AI ต้องรู้: (1) **Chat Template** คือการใช้ special tokens กำหนดขอบเขตผู้พูด เช่น `<|im_start|>user\n...<|im_end|>` เพื่อให้โมเดลรู้ชัดเจนว่าคำสั่งจบตรงไหน คำตอบเริ่มตรงไหน และต้องพ่น stop token (`<|im_end|>`) เมื่อตอบเสร็จ และ (2) **Assistant-only Loss Masking** — ตอนคำนวณ loss ใน PyTorch เราจะตั้งป้ายคำตอบ (`labels`) ของ token ฝั่ง `system` และ `user` เป็น `-100` เพื่อไม่ให้โมเดลเสียแรงไปจำคำถาม แต่โฟกัสการเรียนรู้ 100% ที่คำตอบของ `assistant`",
        "ความสามารถในการตอบตรงคำถาม, ใช้ภาษาไทยสุภาพ, และทำตามรูปแบบ {{structured-output}} (เช่น ตอบเป็น JSON ล้วนโดยไม่เกริ่นนำ) ล้วนถูกปลูกฝังอย่างเข้มข้นในขั้น SFT นี้ — และใน Day 86 คุณจะได้เห็นว่าเราสามารถทำ SFT ขนาดย่อมเฉพาะโดเมนของบริษัทได้ด้วย {{lora}}",
      ],
      analogy: "SFT เหมือนการส่งบัณฑิตที่อ่านตำรามาเยอะเข้าคอร์สฝึกงาน Call Center พร้อมสคริปต์ตัวอย่าง 10,000 เคส — รู้ว่าเมื่อลูกค้าถามแบบนี้ ต้องตอบอย่างไร ใช้น้ำเสียงแบบไหน และจบประโยคตรงไหน",
      code: {
        language: "python",
        filename: "chat_template_preview.py",
        code: `messages = [
    {"role": "system", "content": "คุณคือผู้ช่วยฝ่ายบริการลูกค้า ตอบกระชับเป็นภาษาไทย"},
    {"role": "user", "content": "ขอคืนสินค้าภายในกี่วันครับ"},
    {"role": "assistant", "content": "ลูกค้าสามารถขอคืนสินค้าได้ภายใน 7 วันหลังได้รับพัสดุครับ"},
]

def to_chatml(msgs: list[dict[str, str]]) -> str:
    return "".join(f"<|im_start|>{m['role']}\\n{m['content']}<|im_end|>\\n" for m in msgs)

print(to_chatml(messages))`,
        caption: "โครงสร้าง ChatML แบบเดียวกับที่ `tokenizer.apply_chat_template()` ใน Hugging Face `transformers` สร้างให้โดยอัตโนมัติ",
      },
      whyTitle: "Why this matters — Chat Template ผิด = คุณภาพคำตอบตกฮวบ",
      whyParagraphs: [
        "ถ้าโมเดลถูก SFT ด้วย template ของ Llama 3 แต่ตอน deploy เราส่งสตริงแบบ ChatML หรือต่อข้อความดิบ ๆ เข้าไปโดยไม่ใส่ special tokens โมเดลจะสับสนขอบเขตระหว่างคำสั่งกับคำตอบ ทำให้เกิดอาการพูดต่อไม่หยุดหรือหลุดรูปแบบ JSON",
        "กฎเหล็กเมื่อใช้ `transformers` หรือ local runner: ใช้ `tokenizer.apply_chat_template(messages, add_generation_prompt=True)` เสมอ อย่าต่อสตริง role เองด้วยมือแบบเดาสุ่ม",
      ],
    },
    {
      id: "rlhf-and-dpo",
      title: "3 · Preference Alignment ({{rlhf-dpo}}): สอนความชอบ การปฏิเสธ และวินัย JSON",
      paragraphs: [
        "หลังจบ SFT โมเดลทำตามคำสั่งได้แล้ว แต่ยังมีจุดอ่อน: คำตอบหลายแบบอาจถูกไวยากรณ์เหมือนกันแต่คุณภาพต่างกันมาก เช่น ตอบเยิ่นเย้อ vs กระชับ, เดาข้อมูลมั่ว ({{hallucination}}) vs ยอมรับว่าไม่รู้, หรือเผลอตอบคำขออันตราย ขั้นที่สามจึงใช้ข้อมูล **การเปรียบเทียบความชอบ (Preference Pairs)** รูปแบบ `(prompt, chosen, rejected)` เพื่อขัดเกลาพฤติกรรม",
        "แนวทางดั้งเดิมคือ **RLHF (Reinforcement Learning from Human Feedback)** ซึ่งต้องเทรนโมเดลแยกเพิ่มอีกตัวคือ **Reward Model** เพื่อให้คะแนนคำตอบ แล้วใช้ Reinforcement Learning (เช่น PPO) ปรับนโยบายของ LLM ให้ได้คะแนนสูงสุดโดยไม่ให้เพี้ยนไกลจากโมเดลอ้างอิง (`ref_model`) — วิธีนี้ทรงพลังแต่ซับซ้อน เทรนยาก และกิน VRAM มหาศาลเพราะต้องโหลดหลายโมเดลพร้อมกัน",
        "ต่อมาเกิดเทคนิค **DPO (Direct Preference Optimization)** ซึ่งพิสูจน์ทางคณิตศาสตร์ได้ว่าเราสามารถยุบ Reward Model ทิ้ง แล้วอัปเดต LLM โดยตรงจากคู่ `(chosen, rejected)` ด้วยสมการ loss แบบปิด: เปรียบเทียบ log-probability ของโมเดลปัจจุบัน (`pi`) กับโมเดลอ้างอิง (`ref`) แล้วขยายส่วนต่างระหว่างคำตอบที่เลือกกับคำตอบที่ปัดทิ้งให้กว้างขึ้นโดยคุมระดับความเข้มด้วยค่า `beta` — แนวทางนี้เรียบง่าย เสถียร และเป็นที่นิยมมากในโมเดล open-weights ยุคใหม่",
      ],
      analogy: "SFT เหมือนหัดทำอาหารตามสูตรเป๊ะ ๆ ส่วน RLHF/DPO เหมือนมีหัวหน้าเชฟชิมอาหาร 2 จานเทียบกันแล้วบอกว่า \"จานซ้ายกลมกล่อมกว่าจานขวา\" จนเชฟจับรสนิยมและมาตรฐานร้านได้โดยไม่ต้องมีสูตรตายตัวทุกจาน",
      bullets: [
        "**สิ่งที่ Alignment ขัดเกลาได้ชัด**: การปฏิเสธคำขอเสี่ยง ({{guardrails}}), การตอบ \"ไม่พบข้อมูล\" แทนการแต่งเรื่อง, น้ำเสียงสุภาพ, และการคืน {{structured-output}} ที่ไม่แถมคำเกริ่นนำ",
        "**ผลข้างเคียงที่ต้องระวัง**: หากชุด preference ให้คะแนนคำตอบยาว ๆ หรือคำตอบที่ชมผู้ใช้สูงเกินไป โมเดลจะติดนิสัย **Verbosity Bias** (ตอบยาวเกินจำเป็น) และ **Sycophancy** (คล้อยตามผู้ใช้แม้ผู้ใช้เข้าใจผิด)",
        "**สูตร DPO Loss**: `loss = -log(sigmoid(beta * ((logp_pi_w - logp_ref_w) - (logp_pi_l - logp_ref_l))))` โดย `w` = chosen (winner) และ `l` = rejected (loser)",
      ],
      whyTitle: "Why this matters — เข้าใจนิสัย LLM ที่คุณเรียกใช้ผ่าน API ทุกวัน",
      whyParagraphs: [
        "เมื่อคุณเห็น LLM ชอบเกริ่นว่า *\"แน่นอนครับ! นี่คือคำตอบที่ยอดเยี่ยม...\"* หรือยอมเออออเมื่อผู้ใช้ทักว่าคำตอบผิดทั้งที่จริง ๆ โมเดลตอบถูกแล้ว นั่นคือร่องรอยของขั้นตอน Preference Alignment ไม่ใช่ความบังเอิญ",
        "ใน Phase 3–5 คุณจะใช้ความเข้าใจนี้คู่กับ {{context-engineering}} และ {{guardrails}} เพื่อคุมโทนคำตอบ บังคับ JSON schema และออกแบบ evals ที่ไม่หลงกลความยาวคำตอบ (Verbosity Bias)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — มอง 3 ขั้น Post-training เป็นการสร้างบริการ Production API",
      body: [
        "ถ้าคุณมาจากสาย Web/Backend ให้มอง **Pre-training** เหมือนการโหลดความรู้มหาศาลเข้าฐานข้อมูลดิบที่ยังไม่มี API endpoint, **SFT** เหมือนการสร้าง REST/JSON Controller ที่รู้ว่าจะรับ request รูปแบบไหนและตอบกลับด้วยโครงสร้างอะไร, และ **RLHF/DPO** เหมือนชั้น Policy, UX Copywriting และ Security Guardrails ที่ทำให้ระบบตอบลูกค้าได้สุภาพและปลอดภัย",
        "ส่วน **Chat Template** ก็เหมือน HTTP framing (headers + body delimiter) — ถ้าส่ง delimiter ผิด ฝั่งเซิร์ฟเวอร์ (โมเดล) จะแยกไม่ออกว่าส่วนไหนคือ system policy และส่วนไหนคือ input ของผู้ใช้",
      ],
      table: [
        ["Pre-training (Base Model)", "คลังความรู้ดิบขนาดยักษ์ ยังไม่มี API contract"],
        ["SFT + Chat Template", "กำหนด Request/Response Schema และ role framing"],
        ["Loss Masking (`-100`)", "ให้ระบบฝึกเฉพาะ output ที่ต้องตอบ ไม่ต้องเสียแรงทาย input"],
        ["RLHF / DPO Alignment", "A/B Preference Tuning + Safety Policy & Tone Calibration"],
      ],
    },
    student: {
      title: "First-Year Note — ไม่ต้องมี 1,000 GPUs ก็เช็กและเข้าใจ Post-training ได้",
      body: [
        "หลายคนเห็นคำว่า Pre-training / RLHF แล้วคิดว่าเป็นเรื่องไกลตัวของห้องแล็บยักษ์ใหญ่เท่านั้น แต่ในทางปฏิบัติ AI Engineer ทุกคนต้องเจอกับผลของมันทุกวัน: ตั้งแต่การเลือกโมเดล `-Instruct` ให้ถูก, การเตรียมไฟล์ SFT/DPO แบบ {{jsonl}} ให้สะอาด, ไปจนถึงการเข้าใจว่าทำไมโมเดลถึงตอบปฏิเสธหรือแถมคำอธิบายนอก JSON",
        "และสมการ DPO Loss ที่ดูเหมือนงานวิจัยระดับสูง จริง ๆ แล้วเขียนด้วย NumPy แค่ 3 บรรทัดโดยใช้ฟังก์ชัน `logaddexp` ที่เรียนพื้นฐานคณิตศาสตร์มาแล้ว!",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เราจะจำลองท่อเตรียมข้อมูลและคำนวณคณิตศาสตร์ของ Post-training ครบ 3 ขั้นบน CPU โดยไม่ต้องใช้ GPU — ตั้งแต่การทำ Chat Template + SFT Loss Mask, การตรวจคู่ข้อมูล DPO, ไปจนถึงการคำนวณ DPO Loss ด้วย NumPy",
    steps: [
      {
        title: "1 · จัดรูป Chat Template และสร้าง Assistant-Only SFT Loss Mask",
        explain: "สมมติว่าแต่ละ turn ถูกแปลงเป็น token IDs แล้ว — เราจะประกอบเป็นลำดับเดียวและตั้ง `labels = -100` สำหรับ `system` และ `user` เพื่อให้โมเดลคำนวณ Cross-Entropy Loss เฉพาะคำตอบของ `assistant`",
        code: {
          language: "python",
          filename: "worked_day67.py",
          code: `turn_tokens = [
    ("system", [101, 102, 103]),
    ("user", [201, 202, 203, 204]),
    ("assistant", [301, 302, 303, 999]),  # 999 = stop token (<|im_end|>)
]

input_ids: list[int] = []
labels: list[int] = []
for role, toks in turn_tokens:
    input_ids.extend(toks)
    if role == "assistant":
        labels.extend(toks)
    else:
        labels.extend([-100] * len(toks))

print("input_ids:", input_ids)
print("labels:   ", labels)
active = sum(1 for x in labels if x != -100)
print(f"Tokens trained on: {active}/{len(labels)}")`,
        },
        output: `input_ids: [101, 102, 103, 201, 202, 203, 204, 301, 302, 303, 999]
labels:    [-100, -100, -100, -100, -100, -100, -100, 301, 302, 303, 999]
Tokens trained on: 4/11`,
      },
      {
        title: "2 · ตรวจสอบคุณภาพคู่ข้อมูล Preference สำหรับ DPO",
        explain: "ข้อมูล DPO มักเก็บเป็น {{jsonl}} ที่มี `prompt`, `chosen` (คำตอบที่ต้องการ เช่น JSON กระชับ/ไม่เดามั่ว) และ `rejected` (คำตอบเยิ่นเย้อหรือหลุดรูปแบบ) — ต้องกรองคู่ที่ซ้ำหรือว่างทิ้งก่อนเทรน",
        code: {
          language: "python",
          filename: "worked_day67.py",
          code: `dpo_sample = {
    "prompt": "สรุปปัญหาจากข้อความ: 'แอปค้างตอนสแกน QR' เป็น JSON ที่มี key เดียวคือ issue",
    "chosen": '{"issue": "แอปค้างระหว่างสแกน QR"}',
    "rejected": 'แน่นอนครับ! นี่คือ JSON ของคุณ:\\n{"issue": "แอปค้างและหักเงินซ้ำ"}',
}

def is_valid_pair(item: dict[str, str]) -> bool:
    keys = ("prompt", "chosen", "rejected")
    if not all(isinstance(item.get(k), str) and item[k].strip() for k in keys):
        return False
    return item["chosen"].strip() != item["rejected"].strip()

print("Valid DPO pair:", is_valid_pair(dpo_sample))`,
        },
        output: `Valid DPO pair: True`,
      },
      {
        title: "3 · คำนวณ DPO Loss และ Reward Margin ด้วย NumPy",
        explain: "เทียบ 2 สถานการณ์: ตอนเริ่มเทรน (`policy == ref`) ส่วนต่าง margin เป็น `0.0` และ DPO loss = `ln(2) ≈ 0.6931` แต่เมื่อโมเดลเริ่มชอบ `chosen` มากกว่า `rejected` เทียบกับ `ref` ค่า reward margin จะเป็นบวกและ loss ลดลงทันที",
        code: {
          language: "python",
          filename: "worked_day67.py",
          code: `import numpy as np


def compute_dpo_loss(
    pi_chosen: float,
    pi_rejected: float,
    ref_chosen: float,
    ref_rejected: float,
    beta: float = 0.1,
) -> tuple[float, float]:
    margin = beta * ((pi_chosen - ref_chosen) - (pi_rejected - ref_rejected))
    # -log(sigmoid(margin)) == log(1 + exp(-margin)) == np.logaddexp(0.0, -margin)
    loss = float(np.logaddexp(0.0, -margin))
    return loss, float(margin)


# กรณี 1: ก่อนอัปเดต (policy ยังเท่ากับ ref)
loss_init, margin_init = compute_dpo_loss(-12.0, -14.0, -12.0, -14.0, beta=0.1)
# กรณี 2: หลังอัปเดต (policy ดัน chosen สูงขึ้น และกด rejected ต่ำลง)
loss_good, margin_good = compute_dpo_loss(-8.0, -22.0, -12.0, -14.0, beta=0.1)

print(f"Initial -> margin={margin_init:+.3f}, loss={loss_init:.4f}")
print(f"Aligned -> margin={margin_good:+.3f}, loss={loss_good:.4f}")`,
        },
        output: `Initial -> margin=+0.000, loss=0.6931
Aligned -> margin=+1.200, loss=0.2633`,
      },
    ],
    gotcha: "ระวังตอนคำนวณ `-np.log(1 / (1 + np.exp(-margin)))` ตรง ๆ: หาก `margin` ติดลบมาก ๆ (เช่น `-1000.0`) ค่า `np.exp(1000)` จะ overflow เป็น `inf` และอาจเกิด `NaN` — ให้ใช้ `np.logaddexp(0.0, -margin)` แทนเสมอ เพราะให้ค่าทางคณิตศาสตร์เท่ากันเป๊ะและปลอดภัยจาก overflow 100%",
  },

  practice: {
    intro: "สร้างชุดยูทิลิตี้ Post-training ใน `exercise_day67.py` ที่ครอบคลุมครบทั้ง ChatML Template, Assistant-only SFT Loss Masking, ตัวตรวจสอบข้อมูล DPO และการคำนวณ DPO Loss แบบ numerically stable",
    requirements: [
      "`render_chatml(messages: list[dict[str, str]], add_generation_prompt: bool = False) -> str` แปลงรายการข้อความ (`role`, `content`) เป็นสตริง `<|im_start|>{role}\\n{content}<|im_end|>\\n` — อนุญาตเฉพาะ `role` ใน `{\"system\", \"user\", \"assistant\"}` (หาก `messages` ว่างหรือ role/content ไม่ถูกต้องให้ `raise ValueError`) และหาก `add_generation_prompt=True` ให้ต่อท้ายด้วย `<|im_start|>assistant\\n`",
      "`build_sft_loss_mask(turn_tokens: list[tuple[str, list[int]]]) -> tuple[list[int], list[int]]` รวม token IDs ทุก turn เป็น `(input_ids, labels)` โดย token ที่ไม่ใช่ `\"assistant\"` ต้องถูก mask เป็น `-100` และ token ของ `\"assistant\"` คงค่าเดิม (raise `ValueError` หาก `turn_tokens` ว่าง, มี role นอก `{\"system\", \"user\", \"assistant\"}`, หรือไม่มี token ของ `\"assistant\"` เลย)",
      "`validate_dpo_pair(record: dict[str, str]) -> dict[str, str]` ตรวจสอบว่า `prompt`, `chosen`, `rejected` เป็น string ที่ไม่ว่างหลัง `strip()` และ `chosen.strip() != rejected.strip()` แล้วคืน dict ที่ `strip()` ค่าเรียบร้อย (หากไม่ผ่านเงื่อนไขให้ `raise ValueError`)",
      "`dpo_loss(policy_chosen_logp: float, policy_rejected_logp: float, ref_chosen_logp: float, ref_rejected_logp: float, beta: float = 0.1) -> tuple[float, float]` คำนวณ `(loss, reward_margin)` ด้วยสูตรที่ปลอดภัยจาก overflow (`np.logaddexp`) และ `raise ValueError` หาก `beta <= 0`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day67.py",
      code: `import numpy as np

ALLOWED_ROLES = {"system", "user", "assistant"}


def render_chatml(
    messages: list[dict[str, str]],
    add_generation_prompt: bool = False,
) -> str:
    """แปลงข้อความสนทนาเป็นรูปแบบ ChatML."""
    # TODO: ตรวจสอบ messages, role, content แล้วประกอบสตริง ChatML
    raise NotImplementedError


def build_sft_loss_mask(
    turn_tokens: list[tuple[str, list[int]]],
) -> tuple[list[int], list[int]]:
    """สร้าง (input_ids, labels) โดย mask non-assistant tokens ด้วย -100."""
    # TODO: ตรวจสอบ turn_tokens และ mask token ที่ไม่ใช่ assistant ด้วย -100
    raise NotImplementedError


def validate_dpo_pair(record: dict[str, str]) -> dict[str, str]:
    """ตรวจสอบและทำความสะอาดคู่ข้อมูล DPO (prompt, chosen, rejected)."""
    # TODO: ตรวจ key ครบ ไม่ว่างหลัง strip และ chosen != rejected
    raise NotImplementedError


def dpo_loss(
    policy_chosen_logp: float,
    policy_rejected_logp: float,
    ref_chosen_logp: float,
    ref_rejected_logp: float,
    beta: float = 0.1,
) -> tuple[float, float]:
    """คำนวณ (loss, reward_margin) ของ Direct Preference Optimization."""
    # TODO: ตรวจ beta > 0 และคำนวณ margin + np.logaddexp(0.0, -margin)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day67.py",
      code: `import math
import pytest
from exercise_day67 import (
    build_sft_loss_mask,
    dpo_loss,
    render_chatml,
    validate_dpo_pair,
)


def test_render_chatml_with_generation_prompt():
    msgs = [
        {"role": "system", "content": "ตอบเป็น JSON"},
        {"role": "user", "content": "สวัสดี"},
    ]
    out = render_chatml(msgs, add_generation_prompt=True)
    expected = (
        "<|im_start|>system\\nตอบเป็น JSON<|im_end|>\\n"
        "<|im_start|>user\\nสวัสดี<|im_end|>\\n"
        "<|im_start|>assistant\\n"
    )
    assert out == expected


def test_render_chatml_rejects_bad_role_or_empty():
    with pytest.raises(ValueError):
        render_chatml([])
    with pytest.raises(ValueError):
        render_chatml([{"role": "admin", "content": "hack"}])


def test_sft_loss_mask_only_trains_on_assistant():
    turns = [
        ("system", [1, 2]),
        ("user", [3, 4, 5]),
        ("assistant", [6, 7, 99]),
    ]
    input_ids, labels = build_sft_loss_mask(turns)
    assert input_ids == [1, 2, 3, 4, 5, 6, 7, 99]
    assert labels == [-100, -100, -100, -100, -100, 6, 7, 99]

    with pytest.raises(ValueError):
        build_sft_loss_mask([("user", [1, 2])])


def test_validate_dpo_pair():
    cleaned = validate_dpo_pair({
        "prompt": "  สรุปใบแจ้งหนี้  ",
        "chosen": ' {"total": 1070} ',
        "rejected": "ยอดรวมประมาณพันกว่าบาทครับ",
    })
    assert cleaned["prompt"] == "สรุปใบแจ้งหนี้"
    assert cleaned["chosen"] == '{"total": 1070}'

    with pytest.raises(ValueError):
        validate_dpo_pair({"prompt": "hi", "chosen": "same", "rejected": " same "})
    with pytest.raises(ValueError):
        validate_dpo_pair({"prompt": "", "chosen": "a", "rejected": "b"})


def test_dpo_loss_behavior_and_stability():
    loss_eq, margin_eq = dpo_loss(-10.0, -12.0, -10.0, -12.0, beta=0.1)
    assert margin_eq == pytest.approx(0.0)
    assert loss_eq == pytest.approx(math.log(2), rel=1e-6)

    loss_good, margin_good = dpo_loss(-6.0, -20.0, -10.0, -12.0, beta=0.1)
    assert margin_good == pytest.approx(1.2)
    assert loss_good < loss_eq

    # ทดสอบ stability เมื่อ margin ติดลบมาก ๆ ต้องไม่คืน inf หรือ NaN
    loss_extreme, _ = dpo_loss(-5000.0, -10.0, -10.0, -10.0, beta=1.0)
    assert math.isfinite(loss_extreme)

    with pytest.raises(ValueError):
        dpo_loss(-10.0, -12.0, -10.0, -12.0, beta=0.0)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 5 test cases โดยไม่ต้องใช้ GPU หรือ API key",
      "ตรวจว่า `render_chatml(..., add_generation_prompt=True)` ปิดท้ายด้วย `<|im_start|>assistant\\n` อย่างถูกต้อง",
      "ตรวจว่า `build_sft_loss_mask` ใส่ `-100` บนทุก token ของ `system` และ `user` และคง token IDs จริงไว้เฉพาะ `assistant`",
      "ตรวจว่า `dpo_loss` คืนค่าประมาณ `ln(2) ≈ 0.6931` เมื่อ `policy == ref` และไม่เกิด overflow แม้ `margin` ติดลบหลายพัน",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day67.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `render_chatml` ให้วนเช็กทุก message ว่ามี key `role` อยู่ใน `ALLOWED_ROLES` และ `content` เป็น `str` ที่ไม่ว่างหลัง `strip()` ก่อนประกอบชิ้นส่วนด้วย `\"\".join(...)`",
      },
      {
        body: "ใน `build_sft_loss_mask` ให้เก็บตัวแปรนับ `assistant_count` ไว้ด้วย ถ้าจบลูปแล้วไม่มี token ฝั่ง `assistant` เลยให้ `raise ValueError` ส่วนใน `dpo_loss` ใช้ `margin = beta * ((policy_chosen_logp - ref_chosen_logp) - (policy_rejected_logp - ref_rejected_logp))` และ `loss = float(np.logaddexp(0.0, -margin))`",
      },
      {
        body: "โครงของ `render_chatml` และ `dpo_loss` เกือบครบแล้ว — เติม `build_sft_loss_mask` และ `validate_dpo_pair` แล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_day67.py",
          code: `import numpy as np

ALLOWED_ROLES = {"system", "user", "assistant"}


def render_chatml(messages: list[dict[str, str]], add_generation_prompt: bool = False) -> str:
    if not messages:
        raise ValueError("messages must not be empty")
    parts: list[str] = []
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if role not in ALLOWED_ROLES or not isinstance(content, str) or not content.strip():
            raise ValueError(f"Invalid message: {msg}")
        parts.append(f"<|im_start|>{role}\\n{content}<|im_end|>\\n")
    if add_generation_prompt:
        parts.append("<|im_start|>assistant\\n")
    return "".join(parts)


def dpo_loss(
    policy_chosen_logp: float,
    policy_rejected_logp: float,
    ref_chosen_logp: float,
    ref_rejected_logp: float,
    beta: float = 0.1,
) -> tuple[float, float]:
    if beta <= 0:
        raise ValueError("beta must be > 0")
    margin = beta * (
        (policy_chosen_logp - ref_chosen_logp) - (policy_rejected_logp - ref_rejected_logp)
    )
    loss = float(np.logaddexp(0.0, -margin))
    return loss, float(margin)`,
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
      title: "ดาวน์โหลด Base Model มาใช้แทน Instruct/Chat Model",
      symptom: "ส่งคำถามภาษาไทยเข้าโมเดล open-weights แล้วโมเดลไม่ตอบคำถาม แต่กลับพิมพ์คำถามข้อ 2 ข้อ 3 ต่อเนื่องไปเรื่อย ๆ ไม่หยุด",
      fix: "ตรวจสอบชื่อ checkpoint เสมอ — งานสนทนา/สกัดข้อมูลต้องเลือกโมเดลที่ลงท้ายด้วย `-Instruct` หรือ `-Chat` ที่ผ่าน SFT และ Alignment แล้ว",
    },
    {
      title: "ส่ง Prompt ผิด Chat Template หรือไม่ใส่ Stop Token",
      symptom: "โมเดลเริ่มตอบดีแต่พอจบคำตอบกลับพิมพ์ `User:` แล้วจำลองบทสนทนาของลูกค้าต่อเองจนเต็ม `max_tokens`",
      fix: "ใช้ `tokenizer.apply_chat_template(messages, add_generation_prompt=True)` ของโมเดลนั้นโดยตรง (หรือใช้ Chat Completions API ของ Ollama/vLLM) เพื่อให้ special tokens และ stop tokens ตรงกับตอน SFT",
    },
    {
      title: "ลืม Mask Prompt Tokens ตอนทำ SFT",
      symptom: "ตอนทำ fine-tuning โมเดลเสีย capacity ไปท่องจำ system prompt ยาว ๆ แทนที่จะเรียนรู้รูปแบบคำตอบ และ overfit เร็วมาก",
      fix: "ตั้ง `labels = -100` บนทุก token ของ `system` และ `user` เพื่อให้ PyTorch `CrossEntropyLoss(ignore_index=-100)` คิด loss เฉพาะฝั่ง `assistant`",
    },
    {
      title: "คิดว่า RLHF/DPO ใช้เติมความรู้ใหม่ให้โมเดลได้ดีเท่า RAG",
      symptom: "พยายามทำ DPO เพื่อยัดราคาสินค้าหรือนโยบายใหม่ของบริษัทลงในน้ำหนักโมเดล แต่โมเดลยังจำข้อมูลผิดและอัปเดตยาก",
      fix: "ใช้ Post-training/Alignment เพื่อปรับ **พฤติกรรม สไตล์ และรูปแบบการตอบ** ส่วนข้อเท็จจริงที่เปลี่ยนแปลงบ่อยให้ดึงผ่าน RAG (Phase 4) แทน",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d067-q1",
        "เมื่อส่งคำสั่ง \"ช่วยสรุปจุดเด่นของสินค้านี้เป็น 3 ข้อ\" เข้าสู่ **Base Model** (ที่ผ่านแค่ Pre-training ยังไม่ผ่าน SFT) เหตุใดโมเดลมักพิมพ์ประโยคต่อแบบข้อสอบหรือไหลยาวแทนที่จะตอบคำถามตรง ๆ?",
        [
          ["เพราะ Base Model ไม่รองรับภาษาไทยใน tokenizer", "ไม่เกี่ยว — Base Model มี tokenizer เดียวกับตัว Instruct อ่านภาษาไทยออกครบ"],
          ["เพราะ Base Model ถูกฝึกด้วยเป้าหมายเดียวคือทาย token ถัดไปให้เหมือนเอกสารในชุดฝึก ไม่ได้ถูกฝึกบทบาทผู้ช่วยที่ต้องตอบคำถามแล้วหยุด", "ถูก — Base Model เห็นข้อความเป็นเพียงต้นเอกสารที่ต้องต่อให้จบ จึงอาจต่อโจทย์หรือบทความแทนการตอบคำถาม"],
          ["เพราะ Base Model ไม่ได้ใช้สถาปัตยกรรม Transformer", "Base Model คือ Transformer เต็มรูปแบบเหมือนตัว Instruct ทุกประการ ต่างกันที่ขั้นตอนการฝึกหลัง Pre-training"],
          ["เพราะยังไม่ได้ตั้งค่า `temperature = 0`", "ต่อให้ตั้ง `temperature = 0` โมเดล Base ก็ยังคงเลือก token ที่ต่อเอกสาร ไม่ใช่ตอบแบบผู้ช่วย"],
        ],
        "B",
        "Pre-training สอนแค่การทำนายคำถัดไปจากข้อความดิบ — การเปลี่ยนให้เป็นโมเดลที่เข้าใจบทบาทคำสั่ง-คำตอบและรู้จักหยุดพูดเกิดในขั้น SFT และ Alignment",
        "ทำไม Base Model จึงมักพิมพ์ต่อเอกสารหรือไหลยาวแทนที่จะตอบคำถามตรง ๆ?",
        "เพราะถูกฝึกมาเพื่อทายคำถัดไป (Next-Token Prediction) ให้เหมือนเอกสาร ไม่ได้ถูกฝึกบทบาท assistant ที่ต้องตอบคำสั่งแล้วจบด้วย stop token",
      ),
      mc(
        "d067-q2",
        "ในการทำ SFT (Supervised Fine-Tuning) เหตุใดเราจึงตั้งค่า `labels = -100` ให้กับ token ของฝั่ง `system` และ `user`?",
        [
          ["เพื่อลบข้อความของ `system` และ `user` ออกจาก input ของโมเดล", "ไม่ลบ — โมเดลยังต้องอ่าน `system` และ `user` ใน `input_ids` เพื่อใช้เป็นบริบทในการตอบ"],
          ["เพื่อให้ฟังก์ชัน loss คำนวณความผิดพลาดและอัปเดตน้ำหนักเฉพาะส่วนคำตอบของ `assistant` ไม่เสียแรงไปฝึกทายคำถามของผู้ใช้", "ถูก — `ignore_index=-100` ใน Cross-Entropy Loss ทำให้โมเดลโฟกัสที่การสร้างคำตอบที่ถูกต้องตามบริบท"],
          ["เพื่อแปลงคำถามภาษาไทยเป็นภาษาอังกฤษอัตโนมัติ", "ไม่เกี่ยวข้องกับการแปลภาษา"],
          ["เพื่อบังคับให้โมเดลลดความยาว context window ลงครึ่งหนึ่ง", "ความยาว context ยังเท่าเดิม เป็นเพียงการปิดการคิด loss บนตำแหน่งที่ไม่ใช่คำตอบ"],
        ],
        "B",
        "Assistant-only loss masking (`-100`) ทำให้โมเดลยังคงเห็นบริบท `system`/`user` ครบถ้วน แต่คำนวณ gradient จากเฉพาะ token ที่ `assistant` ต้องสร้าง",
        "การตั้ง `labels = -100` บน token ของ `system` และ `user` ใน SFT มีจุดประสงค์อะไร?",
        "เพื่อให้ Cross-Entropy Loss คำนวณและอัปเดตน้ำหนักเฉพาะส่วนคำตอบของ `assistant` โดยยังเก็บ prompt ไว้เป็นบริบทอินพุต",
      ),
      mc(
        "d067-q3",
        "ข้อแตกต่างสำคัญที่สุดระหว่าง **DPO (Direct Preference Optimization)** กับ **RLHF แบบดั้งเดิม (Reward Model + PPO)** คืออะไร?",
        [
          ["DPO ไม่ต้องใช้ข้อมูลคู่เปรียบเทียบ `(chosen, rejected)` เลย", "DPO ยังต้องใช้คู่ `(prompt, chosen, rejected)` เหมือนกัน ต่างกันที่วิธีคำนวณการอัปเดต"],
          ["DPO ตัดขั้นตอนการเทรน Reward Model แยกและลูป PPO ออก แล้วปรับ LLM โดยตรงจาก log-probability ของคู่ `(chosen, rejected)` เทียบกับโมเดลอ้างอิง", "ถูก — ทำให้ขั้นตอนเสถียรกว่า ง่ายกว่า และกินหน่วยความจำ GPU น้อยกว่า RLHF แบบ PPO มาก"],
          ["DPO ใช้ได้เฉพาะกับโมเดลที่ยังไม่ได้ผ่าน Pre-training", "DPO ทำหลัง SFT (หรือบนโมเดลที่ผ่าน Pre-training + SFT แล้ว) ไม่ใช่ก่อน Pre-training"],
          ["DPO ทำให้โมเดลไม่จำเป็นต้องใช้ Chat Template อีกต่อไป", "ยังต้องใช้ Chat Template เดียวกับตอน SFT เพื่อรักษาขอบเขตบทสนทนา"],
        ],
        "B",
        "DPO แปลงโจทย์ RLHF ให้อยู่ในรูปสมการ loss แบบปิดบนคู่ `(chosen, rejected)` โดยเทียบกับ `ref_model` ทำให้ไม่ต้องเทรน Reward Model แยก",
        "DPO ต่างจาก RLHF (Reward Model + PPO) อย่างไร?",
        "DPO ไม่ต้องเทรน Reward Model แยกและไม่ใช้ลูป PPO แต่คำนวณ loss อัปเดต LLM โดยตรงจากส่วนต่าง log-prob ของคู่ `(chosen, rejected)` เทียบกับ reference model",
      ),
      mc(
        "d067-q4",
        "ในสมการ DPO Loss หากโมเดลปัจจุบัน (`policy`) ยังมีพารามิเตอร์เหมือนโมเดลอ้างอิง (`ref`) ทุกประการ (`policy_logp == ref_logp`) ค่า `reward_margin` และ `dpo_loss` จะมีค่าเท่าใด?",
        [
          ["`margin = 0.0` และ `loss = 0.0`", "ไม่ถูก — เมื่อ margin = 0 ค่า `-log(sigmoid(0)) = -log(0.5) = ln(2) ≈ 0.6931` ไม่ใช่ 0"],
          ["`margin = 0.0` และ `loss = ln(2) ≈ 0.6931`", "ถูก — เพราะ `sigmoid(0) = 0.5` โมเดลยังแยกความชอบระหว่าง `chosen` กับ `rejected` ไม่ได้เทียบกับจุดตั้งต้น"],
          ["`margin = 1.0` และ `loss = 1.0`", "ผลต่างระหว่าง policy กับ ref เป็น 0 ดังนั้น margin จึงเป็น 0"],
          ["เกิด `ZeroDivisionError` เพราะตัวหารเป็นศูนย์", "สมการ DPO ใช้ `logaddexp(0, -margin)` ไม่มีตัวหารที่เป็นศูนย์"],
        ],
        "B",
        "เมื่อ `policy == ref` เทอมส่วนต่าง log-prob เป็น `0.0` ทำให้ `margin = 0.0` และ `loss = -log(0.5) = ln(2) ≈ 0.6931` ซึ่งเป็นจุดอ้างอิงที่ดีเวลาตรวจ sanity check ตอนเทรน",
        "จุด sanity check ตอนเริ่มเทรน DPO (`policy == ref`) ค่า loss ควรเริ่มต้นที่เท่าไร?",
        "`ln(2) ≈ 0.6931` (เพราะ `reward_margin = 0` และ `-log(sigmoid(0)) = -log(0.5)`)",
      ),
    ],
  },

  takeaways: [
    "**Pre-training** สร้างความรู้โลกผ่าน Next-Token Prediction (ได้ Base Model), **SFT** สอนบทบาทคำสั่ง-คำตอบด้วย Chat Template และ Assistant-only loss masking, และ **{{rlhf-dpo}}** ขัดเกลาความชอบ การปฏิเสธ และวินัยรูปแบบคำตอบ",
    "ในงาน production ต้องเลือกโมเดล `-Instruct` / `-Chat` และใช้ `tokenizer.apply_chat_template()` ให้ตรงกับตอน SFT เสมอ เพื่อป้องกันอาการตอบไหลไม่หยุดหรือหลุดรูปแบบ JSON",
    "DPO ลดความซับซ้อนของ RLHF ลงอย่างมากด้วยการคำนวณ loss โดยตรงจากคู่ `(prompt, chosen, rejected)` เทียบกับ `ref_model` ด้วยสูตร `np.logaddexp(0.0, -margin)`",
    "Post-training ปรับ *พฤติกรรมและสไตล์* — หากต้องการให้โมเดลตอบข้อเท็จจริงเฉพาะองค์กรที่อัปเดตบ่อย ให้ใช้ RAG และ {{structured-output}} ควบคู่กัน",
  ],

  reviewCards: [
    rc(
      "d067-rc-1",
      "เปรียบเทียบเป้าหมายและข้อมูลที่ใช้ของ 3 ขั้น: Pre-training vs SFT vs RLHF/DPO",
      "Pre-training: ข้อความดิบมหาศาล → ทาย token ถัดไป; SFT: ตัวอย่างคำสั่ง-คำตอบคุณภาพสูง + Chat Template → ทำตามคำสั่ง; RLHF/DPO: คู่ `(chosen, rejected)` → ขัดเกลาความชอบ ความปลอดภัย และความกระชับ",
    ),
    rc(
      "d067-rc-2",
      "ทำไม SFT จึงต้อง mask token ของ `system` และ `user` ด้วย `-100` ใน `labels`?",
      "เพื่อให้ Cross-Entropy Loss (`ignore_index=-100`) คิด gradient เฉพาะคำตอบของ `assistant` ไม่เสียแรงไปจำคำถามผู้ใช้",
    ),
    rc(
      "d067-rc-3",
      "สูตร DPO Loss ที่ปลอดภัยจาก overflow เขียนอย่างไร และทำไม DPO จึงง่ายกว่า RLHF แบบ PPO?",
      "`margin = beta * ((pi_w - ref_w) - (pi_l - ref_l))`, `loss = np.logaddexp(0.0, -margin)` — ง่ายกว่า PPO เพราะไม่ต้องเทรน Reward Model แยก",
    ),
  ],

  sources: [
    { label: "Direct Preference Optimization (Rafailov et al., 2023 — DPO Paper)", href: "https://arxiv.org/abs/2305.18290" },
    { label: "Training language models to follow instructions with human feedback (InstructGPT / RLHF Paper)", href: "https://arxiv.org/abs/2203.02155" },
    { label: "Hugging Face Transformers — Chat Templates Guide", href: "https://huggingface.co/docs/transformers/chat_templating" },
    { label: "Hugging Face TRL — DPOTrainer Documentation", href: "https://huggingface.co/docs/trl/main/en/dpo_trainer" },
  ],

  glossary: ["rlhf-dpo", "llm", "transformer", "structured-output", "guardrails", "hallucination", "jsonl", "lora"],
});
