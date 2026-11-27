import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D063 — Phase 3 / Block B16
 * Loss Functions, Softmax, Temperature & Overfitting Controls
 */
export const d063: Lesson = defineLesson({
  day: 63,
  titleTh: "Loss Functions, Softmax, Temperature และการคุม Overfitting ใน PyTorch",
  tagline: "30 นาที · รันบน CPU 100% ไม่ใช้ API key · ใช้ CrossEntropyLoss ให้ถูก, ปรับ Temperature แบบ LLM และคุม overfitting + gradient ระเบิด",
  icon: "sliders-horizontal",
  visual: {
    id: "softmax-temperature",
    title: "Softmax & Temperature — ปรับความมั่นใจของ Logits และคุม Overfitting",
    caption: "เลื่อนแถบ Temperature เพื่อดูการกระจายความน่าจะเป็นที่คมชัด (T ต่ำ) หรือกระจายตัว (T สูง) พร้อมกราฟป้องกัน gradient ระเบิด",
    alt: "แผนภาพ Softmax และ Temperature ใน PyTorch",
  },
  requiresApiKey: false,
  tools: ["PyTorch", "uv", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "เลือก Loss Function ให้ตรงงานและส่ง Raw Logits ให้ถูก",
      body: "Loss คือเข็มทิศที่บอก {{autograd}} ว่าความผิดพลาดแบบไหนมีโทษหนักแค่ไหน — งานหลายคลาสใช้ `nn.CrossEntropyLoss` ซึ่งรับ **raw logits** เสมอ (ห้ามผ่าน {{softmax}} มาก่อนเด็ดขาด)",
      lessonNote: "วันนี้เราจะพิสูจน์ด้วยตัวเลขจริงว่า \"Double Softmax\" ทำลายทั้งค่า loss และความชันอย่างไร",
    },
    {
      node: 3,
      heading: "ควบคุมความเสถียรและกัน Overfitting ด้วยข้อมูล Validation",
      body: "โครงข่ายประสาทจำข้อมูลเทรนเก่งมากจนเสี่ยง overfit ได้ง่าย เราจึงใช้ Weight Decay (`AdamW`), `Dropout`, Gradient Clipping (`clip_grad_norm_`) และ Early Stopping โดยเฝ้าดูเฉพาะ Validation Loss เพื่อไม่ให้เกิด {{data-leakage}}",
      lessonNote: "เราจะเขียน `clip_and_step` และ `EarlyStopper` ที่นำไปใช้ซ้ำได้จริงในทุกโปรเจกต์ PyTorch",
    },
    {
      node: 4,
      heading: "Temperature ใน PyTorch เชื่อมตรงกับพารามิเตอร์ของ LLM API",
      body: "เวลาคุณปรับ `temperature=0.0` หรือ `temperature=0.8` ตอนเรียก {{llm}} API ในช่วงหลังของ Phase 3 สิ่งที่เกิดขึ้นข้างใต้คือการหาร raw logits ด้วย `T` ก่อนเข้า {{softmax}} และสุ่ม token (ร่วมกับ {{top-k}}) นั่นเอง",
      lessonNote: "เราจะเขียน `softmax_with_temperature(logits, T)` เพื่อเห็นภาพชัดว่า `T` ต่ำทำให้กราฟคมชัด และ `T` สูงทำให้กระจายตัวอย่างไร",
    },
    {
      node: 5,
      heading: "จับสัญญาณ Gradient พุ่งสูงก่อนระบบเทรนล่มเป็น NaN",
      body: "การบันทึก `grad_norm` และจำกัดขนาดความชันด้วย `clip_grad_norm_` เปรียบเสมือนเบรกเกอร์ไฟฟ้าที่ช่วยกันไม่ให้ batch ที่ข้อมูลเพี้ยนเพียงชุดเดียวทำลายน้ำหนักทั้งโมเดล",
      lessonNote: "ความรู้ทั้ง 3 เรื่องวันนี้จะถูกนำมาใช้ดีบักโมเดลที่พังจริงในรอบทบทวน Day 64",
    },
  ],

  objectives: [
    "**อธิบายและพิสูจน์ด้วยโค้ด** ว่าเหตุใด `nn.CrossEntropyLoss` จึงต้องรับ raw logits เท่านั้น (ห้ามใส่ `Softmax` ท้าย `forward()`)",
    "**คำนวณและตีความ** {{softmax}} พร้อม {{temperature}} (`softmax(logits / T)`) และเชื่อมโยงไปยังการสุ่มคำตอบของ {{llm}} ได้อย่างชัดเจน",
    "**ประยุกต์ใช้** มาตรการคุม overfitting และความเสถียร 4 อย่าง: `AdamW` weight decay, `nn.Dropout`, `clip_grad_norm_` และ Early Stopping บน Validation Loss",
  ],

  prerequisites: [
    "`nn.Module`, ลูปเทรน 5 บรรทัดทอง และ `model.train()` vs `model.eval()` (Day 62)",
    "Train/Val/Test split และแนวคิดการกัน {{data-leakage}} (Day 42)",
    "MSE / {{mae-rmse}} สำหรับงานถดถอย (Day 46)",
    "รันได้ 100% บน CPU ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ `ai-day63` ด้วย `uv` (หรือใช้สภาพแวดล้อม `torch` เดิมจาก Day 62) แล้วตรวจว่าพร้อมรันบน CPU",
    commands: `uv init ai-day63 && cd ai-day63
uv add torch
uv add --dev pytest ruff
uv run python -c "import torch; print('Softmax test:', torch.softmax(torch.tensor([2.0, 1.0]), dim=-1).tolist())"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day63` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `torch`, `pytest` และ `ruff`"],
      ["verify", "รันคำสั่งเช็ก `torch.softmax` สำเร็จบน CPU"],
    ],
  },

  concepts: [
    {
      id: "loss-functions-raw-logits",
      title: "1 · เลือก Loss ให้ตรงงาน และเหตุผลที่ CrossEntropyLoss ต้องรับ Raw Logits เท่านั้น",
      paragraphs: [
        "เลือก Loss Function ให้ตรงประเภทปัญหา: งานทำนายตัวเลขต่อเนื่องใช้ **`nn.MSELoss()`** (หรือ `nn.L1Loss()` คู่กับ {{mae-rmse}}), งานจำแนก 2 คลาส / หลายป้ายพร้อมกัน (multi-label) ใช้ **`nn.BCEWithLogitsLoss()`**, และงานจำแนกหลายคลาส (multi-class — รวมถึงการทาย token ถัดไปของ {{llm}}!) ใช้ **`nn.CrossEntropyLoss()`**",
        "กฎเหล็กอันดับ 1 ของ PyTorch ที่มือใหม่พลาดบ่อยที่สุดคือ: **`nn.CrossEntropyLoss()` และ `nn.BCEWithLogitsLoss()` รวมขั้นตอน Softmax/Sigmoid ไว้ข้างในแล้ว!** มันต้องการ **raw logits** (คะแนนดิบช่วง `-∞` ถึง `+∞`) โดยตรง เพื่อใช้เทคนิคคณิตศาสตร์ *Log-Sum-Exp* ที่แม่นยำและไม่เกิด overflow/underflow",
        "หากคุณเผลอใส่ `torch.softmax(x, dim=-1)` ไว้ท้าย `forward()` แล้วส่งเข้า `nn.CrossEntropyLoss()` จะเกิดอาการ **Double Softmax**: ค่าความน่าจะเป็น `[0.99, 0.01]` จะถูกจับเข้า Softmax อีกรอบจนยุบเหลือ `[0.73, 0.27]` ทำให้ loss ไม่มีวันลดต่ำกว่า ~0.31 แม้โมเดลจะทายถูก 100% และความชันหดเล็กลงจนโมเดลแทบไม่เรียนรู้",
      ],
      analogy: "การส่งผล `softmax()` เข้า `CrossEntropyLoss()` เหมือนการเอาไฟล์ที่บีบอัดเป็น `.zip` แล้วไปซิปซ้ำอีกรอบก่อนส่งให้ระบบที่ตั้งใจจะซิปให้คุณอยู่แล้ว — ผลลัพธ์เพี้ยนและระบบปลายทางอ่านค่าความมั่นใจจริงไม่ได้เลย",
      code: {
        language: "python",
        filename: "double_softmax_trap.py",
        code: `import torch
import torch.nn as nn

criterion = nn.CrossEntropyLoss()
target = torch.tensor([0])  # คลาสที่ถูกคือ 0

# โมเดลมั่นใจมาก: logit คลาส 0 = 8.0, คลาส 1 = -2.0
raw_logits = torch.tensor([[8.0, -2.0]])
probs = torch.softmax(raw_logits, dim=-1)  # ≈ [0.99995, 0.00005]

loss_correct = criterion(raw_logits, target)
loss_buggy = criterion(probs, target)  # ❌ Double Softmax!

print(f"Raw logits -> CrossEntropyLoss : {loss_correct.item():.6f}")
print(f"Pre-softmax -> CrossEntropyLoss: {loss_buggy.item():.6f}  <-- ตันอยู่แถว 0.31!")`,
        caption: "แม้โมเดลจะมั่นใจ 99.995% แต่ถ้าเผลอผ่าน Softmax ก่อนเข้า `CrossEntropyLoss` ค่า loss จะยังค้างสูงถึง `0.313` เสมอ!",
      },
      whyTitle: "Why this matters — แยกตอนเทรนออกจากตอนแสดงผล",
      whyParagraphs: [
        "แนวปฏิบัติมาตรฐานใน PyTorch คือให้ `model.forward(x)` คืน **raw logits เสมอ** — ตอนเทรนส่ง raw logits เข้า `nn.CrossEntropyLoss` ตรง ๆ ส่วนตอนแสดงผลเป็นเปอร์เซ็นต์ให้ผู้ใช้หรือส่งทำนายค่อยเรียก `torch.softmax(logits, dim=-1)` นอกโมเดล",
        "วิธีนี้ยังช่วยให้คุณนำ raw logits ไปหารด้วย `temperature` หรือปรับ threshold ภายหลังได้อิสระโดยไม่ต้องแก้ตัวโมเดลเลย",
      ],
    },
    {
      id: "softmax-and-temperature",
      title: "2 · Softmax + Temperature (T) — สะพานจาก PyTorch สู่การสุ่มคำตอบของ LLM",
      paragraphs: [
        "{{softmax}} แปลงเวกเตอร์คะแนนดิบ `z` (logits) ให้กลายเป็นความน่าจะเป็นที่ทุกช่องเป็นบวกและรวมกันได้ `1.0` ด้วยสูตร `exp(z_i) / sum(exp(z_j))` แต่ก่อนจะส่งเข้า `exp()` เราสามารถหาร logits ทั้งหมดด้วยพารามิเตอร์ **`T > 0`** เรียกว่า **{{temperature}}**: `softmax(z / T)`",
        "ผลของ `T` อ่านได้ทันทีจากคณิตศาสตร์: เมื่อ **`T < 1.0`** (เช่น `0.2`) ช่องว่างระหว่างคะแนนจะถูกขยายกว้างขึ้น ทำให้คลาสที่คะแนนสูงสุดกินส่วนแบ่งความน่าจะเป็นเกือบ 100% (คมชัด, คาดเดาได้), เมื่อ **`T = 1.0`** คือความน่าจะเป็นดั้งเดิม, และเมื่อ **`T > 1.0`** (เช่น `2.0`) ช่องว่างถูกบีบให้แคบลง ทำให้คลาสอื่นมีโอกาสถูกสุ่มมากขึ้น (หลากหลาย/สร้างสรรค์ขึ้น)",
        "นี่คือกลไกเดียวกับพารามิเตอร์ `temperature` ใน OpenAI / Anthropic / Ollama API ทุกประการ! เมื่อคุณสั่ง `temperature=0` ใน LLM API (ซึ่งจริง ๆ คือใช้ `argmax` แทนการหารด้วยศูนย์) โมเดลจะเลือก token ที่ logit สูงสุดเสมอ ส่วนงานเขียนสร้างสรรค์ที่ใช้ `T=0.7–1.0` จะเปิดทางให้สุ่มคำที่หลากหลายขึ้นร่วมกับ {{top-k}}",
      ],
      analogy: "{{temperature}} เหมือนปุ่มปรับความต่างสี (Contrast) ของภาพคะแนน: หมุนลงต่ำ (`T=0.2`) ผู้ชนะจะเด่นชัดสุด ๆ แทบไม่เหลือคู่แข่ง, หมุนขึ้นสูง (`T=2.0`) ภาพจะนุ่มลงจนตัวเลือกรอง ๆ มีสิทธิ์ถูกหยิบมาใช้มากขึ้น",
      bullets: [
        "**`T → 0+` (เช่น `0.1–0.2`)**: ความน่าจะเป็นกระจุกที่ตัวเลือกอันดับ 1 เหมาะกับงานสกัด JSON, จัดหมวดหมู่ และตอบข้อเท็จจริง",
        "**`T = 1.0`**: รักษาการกระจายความน่าจะเป็นเดิมที่โมเดลเรียนรู้มา",
        "**`T > 1.0` (เช่น `1.5–2.0`)**: กระจายความน่าจะเป็นให้แบนลง เพิ่มความหลากหลายแต่เสี่ยงคำตอบหลุดกรอบหากตั้งสูงเกินไป",
        "**ข้อควรระวัง**: ห้ามหารด้วย `T <= 0` โดยตรงเพราะจะเกิด `ZeroDivisionError` หรือ `NaN` (หากต้องการโหมด deterministic 100% ให้ใช้ `logits.argmax(dim=-1)`)",
      ],
      whyTitle: "Why this matters — เข้าใจ LLM Sampling จากรากไม่ใช่จำคำบอกเล่า",
      whyParagraphs: [
        "หลายคนท่องจำว่า \"temperature สูงแปลว่าโมเดลฉลาดขึ้นหรือสร้างสรรค์ขึ้น\" ซึ่งไม่แม่นยำ — จริง ๆ แล้วโมเดลคำนวณ raw logits ชุดเดิมทุกประการ `temperature` เพียงแค่ปรับความแบนของกราฟ {{softmax}} ก่อนสุ่มคำถัดไปเท่านั้น",
        "เมื่อเข้าใจสูตร `softmax(logits / T)` คุณจะตั้งค่า sampling ของ {{llm}} ใน Block B19–B20 ได้อย่างมีเหตุผลทันที",
      ],
    },
    {
      id: "overfitting-and-stability-controls",
      title: "3 · 4 เกราะคุม Overfitting และความเสถียรของ Gradient",
      paragraphs: [
        "Neural Network มีความยืดหยุ่นสูงมากจนสามารถ *ท่องจำ* ชุดเทรน (train loss เข้าใกล้ 0) แต่ไปทายพลาดบนข้อมูลจริง (validation loss กลับพุ่งขึ้น) — ใน PyTorch เรามีเครื่องมือมาตรฐาน 4 ชิ้นที่ทำงานเสริมกัน:",
        "(1) **Weight Decay** (`AdamW(..., weight_decay=1e-2)`): ลงโทษพารามิเตอร์ที่มีค่าใหญ่เกินจำเป็น ช่วยให้เส้นขอบเขตการตัดสินใจเรียบขึ้น, (2) **`nn.Dropout(p=0.3)`**: สุ่มปิด neuron บางส่วนเป็นศูนย์ระหว่าง `model.train()` เพื่อบังคับให้โครงข่ายไม่พึ่งพาโหนดใดโหนดหนึ่งมากเกินไป (และปิดอัตโนมัติเมื่อเรียก `model.eval()`)",
        "(3) **Gradient Clipping** (`torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)`): เรียก **หลัง `loss.backward()` และก่อน `optimizer.step()`** เพื่อตัดเพดานขนาดความชันรวมไม่ให้ทะลุ `max_norm` ป้องกันอาการ exploding gradients, และ (4) **Early Stopping**: เฝ้าดู Validation Loss ทุก epoch แล้วหยุดเทรนอัตโนมัติเมื่อไม่ดีขึ้นติดต่อกันครบ `patience` รอบ (ห้ามดู Test Loss เพื่อป้องกัน {{data-leakage}}!)",
      ],
      analogy: "`Dropout` เหมือนการซ้อมทีมฟุตบอลโดยสุ่มให้ผู้เล่น 30% นั่งพักข้างสนาม เพื่อให้ทุกคนในทีมเล่นแทนกันได้ ไม่พึ่งดาราคนเดียว, `clip_grad_norm_` เหมือนตัวจำกัดความเร็วรถไม่ให้พุ่งชนกำแพงตอนเจอถนนลื่น, และ `Early Stopping` คือโค้ชที่เป่านกหวีดหยุดซ้อมเมื่อเห็นว่าซ้อมต่อแล้วฟอร์มลงสนามจริงเริ่มตก",
      code: {
        language: "python",
        filename: "regularized_step.py",
        code: `import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Dropout(p=0.3), nn.Linear(32, 3))
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-2, weight_decay=1e-2)
criterion = nn.CrossEntropyLoss()

x = torch.randn(16, 8)
y = torch.randint(0, 3, (16,))

model.train()
optimizer.zero_grad(set_to_none=True)
loss = criterion(model(x), y)
loss.backward()
# เรียก clip_grad_norm_ หลัง backward() และก่อน step() เสมอ!
grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()
print(f"loss={loss.item():.4f} | pre-clip grad_norm={float(grad_norm):.4f}")`,
        caption: "ตำแหน่งที่ถูกต้องของ `clip_grad_norm_` คือคั่นระหว่าง `loss.backward()` กับ `optimizer.step()` เสมอ",
      },
      whyTitle: "Why this matters — เคล็ดลับที่ทำให้เทรนโมเดลจริงนิ่งไม่พังกลางทาง",
      whyParagraphs: [
        "แม้แต่การเทรน {{transformer}} หรือ LoRA fine-tuning ในงานจริงก็ยังคงใช้สูตร 4 อย่างนี้เป็นค่ามาตรฐาน: `AdamW` + `weight_decay`, `Dropout`, `clip_grad_norm_(..., max_norm=1.0)` และ Early Stopping บน Validation Set",
        "ที่สำคัญคือ `clip_grad_norm_` คืนค่าความชันรวม *ก่อนตัด* ออกมาให้เราด้วย ซึ่งเหมาะมากสำหรับเก็บเป็น metric เฝ้าดูว่าโมเดลเริ่มมีความเสี่ยง gradient ระเบิดหรือไม่",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — มอง Double Softmax เป็น Double Escaping และ Clipping เป็น Rate Clamping",
      body: [
        "ความผิดพลาดแบบ Double Softmax คล้ายการนำข้อความที่ผ่าน `encodeURIComponent()` แล้วไปส่งเข้า HTTP client ที่ encode ให้อีกรอบจน URL เพี้ยน — วิธีแก้คือรู้ชัดว่าเลเยอร์ไหนเป็นคนแปลง (ใน PyTorch คือ `CrossEntropyLoss`) แล้วส่งค่าดิบ (`raw logits`) ให้มันเพียงครั้งเดียว",
        "ส่วน `EarlyStopper` ก็เหมือน Circuit Breaker / Timeout Guard สำหรับลูปเทรน ที่ตัดจบงานทันทีเมื่อไม่เห็นความคืบหน้าบนชุด Validation เพื่อไม่ให้เปลืองงบ compute และไม่ให้โมเดลจำข้อสอบจนพัง",
      ],
      table: [
        ["`CrossEntropyLoss(raw_logits, y)`", "ส่ง raw string ให้ parameterized query (ห้าม double-escape)"],
        ["`softmax(logits / T)`", "พารามิเตอร์ `temperature` ใน LLM API SDK"],
        ["`clip_grad_norm_(params, max_norm)`", "`Math.min(delta, MAX_STEP)` — กันค่ากระชากทำ state พัง"],
        ["`EarlyStopper(patience=5)`", "Timeout / retry budget ที่หยุดงานเมื่อ metric หยุดดีขึ้น"],
      ],
    },
    student: {
      title: "First-Year Note — Logits กับ Probabilities ต่างกันอย่างไร?",
      body: [
        "**Logits** คือคะแนนดิบที่ชั้น `nn.Linear` สุดท้ายพ่นออกมา เป็นเลขอะไรก็ได้ทั้งบวกและลบ เช่น `[2.4, -0.5, 0.1]` เราบอกได้แค่ว่าคลาสแรกคะแนนนำ แต่ยังอ่านเป็นเปอร์เซ็นต์ไม่ได้",
        "**Probabilities** คือผลลัพธ์หลังผ่าน {{softmax}} เช่น `[0.87, 0.05, 0.08]` ที่ทุกตัวอยู่ระหว่าง `0` ถึง `1` และรวมกันได้ `1.0` พอดี — จำง่าย ๆ ว่า *\"ตอนเทรนส่ง Logits ให้ Loss, ตอนโชว์คนหรือสุ่มคำตอบค่อยแปลงเป็น Probabilities ด้วย Softmax\"*",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ทดลองดูผลของ Temperature ต่อการกระจายความน่าจะเป็นของหมวดทิกเก็ตลูกค้าไทย, ตรวจผลของ Gradient Clipping ต่อความชันขนาดใหญ่ และใช้ `EarlyStopper` หยุดลูปเทรนอัตโนมัติ",
    steps: [
      {
        title: "1 · เปรียบเทียบ Softmax ที่ Temperature 0.2, 1.0 และ 2.0",
        explain: "ใช้ raw logits เดียวกัน `[3.0, 1.5, 0.2]` สำหรับหมวด `[\"billing\", \"shipping\", \"account\"]` แล้วดูความเปลี่ยนแปลงของความน่าจะเป็นเมื่อเปลี่ยนค่า `T`",
        code: {
          language: "python",
          filename: "worked_day63.py",
          code: `import torch

labels = ["billing", "shipping", "account"]
logits = torch.tensor([3.0, 1.5, 0.2], dtype=torch.float32)

for temp in (0.2, 1.0, 2.0):
    probs = torch.softmax(logits / temp, dim=-1)
    pairs = ", ".join(f"{name}={p:.3f}" for name, p in zip(labels, probs.tolist()))
    print(f"T={temp:3.1f} -> {pairs} (sum={probs.sum().item():.1f})")`,
        },
        output: `T=0.2 -> billing=0.999, shipping=0.001, account=0.000 (sum=1.0)
T=1.0 -> billing=0.779, shipping=0.174, account=0.047 (sum=1.0)
T=2.0 -> billing=0.583, shipping=0.275, account=0.142 (sum=1.0)`,
      },
      {
        title: "2 · ทดสอบ Gradient Clipping เมื่อเกิดความชันขนาดใหญ่ผิดปกติ",
        explain: "จำลองสถานการณ์ที่พารามิเตอร์มี gradient พุ่งสูงถึง `~100` แล้วเรียก `clip_grad_norm_(..., max_norm=1.0)` จะเห็นขนาดความชันถูกกดลงเหลือ `1.0` พอดีก่อนอัปเดตน้ำหนัก",
        code: {
          language: "python",
          filename: "worked_day63.py",
          code: `import torch
import torch.nn as nn

layer = nn.Linear(2, 1)
# จำลอง gradient ขนาดใหญ่มาก (เช่นจาก batch ที่มี outlier)
layer.weight.grad = torch.tensor([[60.0, 80.0]])  # L2 norm = 100.0
layer.bias.grad = torch.tensor([0.0])

pre_clip_norm = float(torch.nn.utils.clip_grad_norm_(layer.parameters(), max_norm=1.0))
post_clip_norm = float(torch.linalg.vector_norm(layer.weight.grad))
print(f"Before clip: {pre_clip_norm:.2f} -> After clip: {post_clip_norm:.4f}")
print("Clipped weight.grad:", [round(v, 3) for v in layer.weight.grad[0].tolist()])`,
        },
        output: `Before clip: 100.00 -> After clip: 1.0000
Clipped weight.grad: [0.6, 0.8]`,
      },
      {
        title: "3 · ใช้งาน EarlyStopper เฝ้าดู Validation Loss",
        explain: "จำลองเส้น validation loss ที่ลดลงช่วงแรกแล้วเริ่มนิ่ง/เด้งขึ้น (สัญญาณ overfitting) — `EarlyStopper(patience=2)` จะสั่งหยุดทันทีเมื่อไม่ดีขึ้นครบ 2 รอบติดกัน",
        code: {
          language: "python",
          filename: "worked_day63.py",
          code: `class EarlyStopper:
    def __init__(self, patience: int = 2, min_delta: float = 0.0) -> None:
        self.patience = patience
        self.min_delta = min_delta
        self.best_loss = float("inf")
        self.bad_epochs = 0

    def step(self, val_loss: float) -> bool:
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.bad_epochs = 0
            return False
        self.bad_epochs += 1
        return self.bad_epochs >= self.patience


stopper = EarlyStopper(patience=2, min_delta=0.01)
for epoch, v_loss in enumerate([0.82, 0.61, 0.54, 0.55, 0.58], start=1):
    should_stop = stopper.step(v_loss)
    print(f"epoch={epoch} | val_loss={v_loss:.2f} | best={stopper.best_loss:.2f} | bad={stopper.bad_epochs} | stop={should_stop}")`,
        },
        output: `epoch=1 | val_loss=0.82 | best=0.82 | bad=0 | stop=False
epoch=2 | val_loss=0.61 | best=0.61 | bad=0 | stop=False
epoch=3 | val_loss=0.54 | best=0.54 | bad=0 | stop=False
epoch=4 | val_loss=0.55 | best=0.54 | bad=1 | stop=False
epoch=5 | val_loss=0.58 | best=0.54 | bad=2 | stop=True`,
      },
    ],
    gotcha: "สังเกตผลของ `clip_grad_norm_` ใน Step 2: ความชัน `[60.0, 80.0]` ถูกย่อส่วนเป็น `[0.6, 0.8]` — มัน **รักษาทิศทางเดิมเป๊ะ** แต่ลดขนาดก้าวลงให้ไม่เกิน `max_norm`! แตกต่างจากการตัดทีละแกน (value clipping) ซึ่งอาจทำให้ทิศทางความชันเบี้ยวได้",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day63.py` ที่รวบรวมเครื่องมือคุมความน่าจะเป็นและความเสถียรในการเทรน 3 ตัว: `softmax_with_temperature`, `clip_and_step`, และ `EarlyStopper`",
    requirements: [
      "`softmax_with_temperature(logits: torch.Tensor, temperature: float = 1.0) -> torch.Tensor` ตรวจสอบว่า `temperature > 0` (มิฉะนั้น `raise ValueError`) แล้วคืน `torch.softmax(logits.to(dtype=torch.float32) / temperature, dim=-1)`",
      "`clip_and_step(model: nn.Module, optimizer: torch.optim.Optimizer, max_norm: float = 1.0) -> float` ตรวจสอบว่า `max_norm > 0` (มิฉะนั้น `raise ValueError`), เรียก `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_norm)` ก่อนเรียก `optimizer.step()`, แล้วคืนค่า pre-clip total grad norm เป็น Python `float`",
      "สร้างคลาส `EarlyStopper` ที่รับ `(patience: int = 3, min_delta: float = 0.0)` โดยตรวจสอบ `patience > 0` และ `min_delta >= 0.0` (`ValueError`), เก็บแอตทริบิวต์ `best_loss` (เริ่มที่ `float(\"inf\")`) และ `bad_epochs` (เริ่มที่ `0`)",
      "เมธอด `EarlyStopper.step(self, val_loss: float) -> bool` อัปเดต `best_loss` และรีเซ็ต `bad_epochs = 0` เมื่อ `val_loss < self.best_loss - self.min_delta`, มิฉะนั้นเพิ่ม `bad_epochs += 1`, และคืน `True` เมื่อ `bad_epochs >= patience`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day63.py",
      code: `import torch
import torch.nn as nn


def softmax_with_temperature(logits: torch.Tensor, temperature: float = 1.0) -> torch.Tensor:
    """คำนวณ Softmax หลังปรับสเกล logits ด้วย temperature > 0."""
    # TODO: ตรวจสอบ temperature > 0 แล้วคืน torch.softmax(logits / temperature, dim=-1)
    raise NotImplementedError


def clip_and_step(
    model: nn.Module,
    optimizer: torch.optim.Optimizer,
    max_norm: float = 1.0,
) -> float:
    """ตัดเพดาน gradient norm ก่อนเรียก optimizer.step() และคืนค่า norm ก่อนตัด."""
    # TODO: ตรวจ max_norm > 0, เรียก clip_grad_norm_, เรียก optimizer.step(), คืน float
    raise NotImplementedError


class EarlyStopper:
    """ตัวช่วยหยุดการเทรนเมื่อ validation loss ไม่ดีขึ้นครบ patience รอบ."""

    def __init__(self, patience: int = 3, min_delta: float = 0.0) -> None:
        # TODO: ตรวจค่า input และตั้ง best_loss, bad_epochs
        raise NotImplementedError

    def step(self, val_loss: float) -> bool:
        # TODO: อัปเดตสถานะและคืน True เมื่อควรหยุดเทรน
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day63.py",
      code: `import math
import pytest
import torch
import torch.nn as nn
from exercise_day63 import EarlyStopper, clip_and_step, softmax_with_temperature


def test_softmax_with_temperature_sharpness_and_validation():
    logits = torch.tensor([[3.0, 1.0, 0.0]])
    p_low = softmax_with_temperature(logits, temperature=0.2)
    p_mid = softmax_with_temperature(logits, temperature=1.0)
    p_high = softmax_with_temperature(logits, temperature=2.5)

    for p in (p_low, p_mid, p_high):
        assert math.isclose(p.sum().item(), 1.0, abs_tol=1e-5)

    assert p_low[0, 0] > p_mid[0, 0] > p_high[0, 0]

    with pytest.raises(ValueError):
        softmax_with_temperature(logits, temperature=0.0)
    with pytest.raises(ValueError):
        softmax_with_temperature(logits, temperature=-0.5)


def test_clip_and_step_caps_huge_gradients_and_updates_params():
    torch.manual_seed(1)
    model = nn.Linear(2, 1)
    opt = torch.optim.SGD(model.parameters(), lr=0.1)
    before = model.weight.detach().clone()

    model.weight.grad = torch.tensor([[30.0, 40.0]])  # norm = 50.0
    model.bias.grad = torch.tensor([0.0])

    pre_norm = clip_and_step(model, opt, max_norm=1.0)
    post_norm = float(torch.linalg.vector_norm(model.weight.grad))

    assert math.isclose(pre_norm, 50.0, rel_tol=1e-4)
    assert post_norm <= 1.0 + 1e-5
    assert not torch.equal(before, model.weight)

    with pytest.raises(ValueError):
        clip_and_step(model, opt, max_norm=0.0)


def test_early_stopper_triggers_and_resets():
    stopper = EarlyStopper(patience=2, min_delta=0.05)
    assert stopper.step(1.00) is False
    assert stopper.step(0.98) is False  # ลดน้อยกว่า min_delta -> bad_epochs=1
    assert stopper.step(0.80) is False  # ดีขึ้นจริง -> รีเซ็ต bad_epochs=0
    assert stopper.bad_epochs == 0
    assert stopper.step(0.81) is False  # bad_epochs=1
    assert stopper.step(0.82) is True   # bad_epochs=2 -> หยุด!

    with pytest.raises(ValueError):
        EarlyStopper(patience=0)
    with pytest.raises(ValueError):
        EarlyStopper(patience=2, min_delta=-0.1)


def test_raw_logits_beat_double_softmax_loss():
    criterion = nn.CrossEntropyLoss()
    logits = torch.tensor([[6.0, -1.0]])
    target = torch.tensor([0])
    raw_loss = criterion(logits, target).item()
    double_softmax_loss = criterion(torch.softmax(logits, dim=-1), target).item()
    assert raw_loss < 0.01
    assert double_softmax_loss > 0.30
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases บน CPU",
      "ตรวจว่า `softmax_with_temperature` ปฏิเสธ `temperature <= 0` ด้วย `ValueError`",
      "ตรวจว่า `clip_and_step` ตัดความชันขนาด `50.0` ลงเหลือ `<= 1.0` ก่อนอัปเดตพารามิเตอร์",
      "ตรวจว่า `EarlyStopper` รีเซ็ตตัวนับ `bad_epochs` เป็น `0` เมื่อ validation loss ลดลงมากกว่า `min_delta`",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day63.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `softmax_with_temperature` ให้ตรวจ `if temperature <= 0: raise ValueError(...)` แล้วคำนวณ `torch.softmax(logits.to(dtype=torch.float32) / temperature, dim=-1)`",
      },
      {
        body: "ใน `clip_and_step` เรียก `total_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_norm)` ก่อน แล้วค่อยเรียก `optimizer.step()` และคืน `float(total_norm)`",
      },
      {
        body: "โครงของ `EarlyStopper` ที่ครบเงื่อนไข `min_delta` — เหลือให้คุณเติมอีก 2 ฟังก์ชันให้สมบูรณ์",
        code: {
          language: "python",
          filename: "hint_day63.py",
          code: `class EarlyStopper:
    def __init__(self, patience: int = 3, min_delta: float = 0.0) -> None:
        if patience <= 0 or min_delta < 0.0:
            raise ValueError("patience > 0 and min_delta >= 0.0 required")
        self.patience = patience
        self.min_delta = min_delta
        self.best_loss = float("inf")
        self.bad_epochs = 0

    def step(self, val_loss: float) -> bool:
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.bad_epochs = 0
            return False
        self.bad_epochs += 1
        return self.bad_epochs >= self.patience`,
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
      title: "ใส่ `nn.Softmax(dim=-1)` ไว้ท้าย `forward()` แล้วใช้คู่กับ `nn.CrossEntropyLoss()`",
      symptom: "loss ลดช้ามากและค้างสูงกว่า 0.3 แม้โมเดลจะแยกข้อมูลได้แล้ว เพราะเกิด Double Softmax",
      fix: "ให้ `forward()` คืน raw logits เสมอ และเรียก `torch.softmax(logits, dim=-1)` เฉพาะตอนแปลงเป็นความน่าจะเป็นเพื่อแสดงผลหรือ inference",
    },
    {
      title: "เรียก `clip_grad_norm_` ผิดตำแหน่ง (ก่อน `backward()` หรือหลัง `step()`)",
      symptom: "ความชันยังระเบิดเหมือนเดิมเพราะตอนเรียก clip ยังไม่มี `.grad` หรืออัปเดตน้ำหนักพังไปแล้วค่อยมาตัด",
      fix: "วาง `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)` ไว้หลัง `loss.backward()` และก่อน `optimizer.step()` เสมอ",
    },
    {
      title: "ส่ง `temperature=0.0` เข้าสูตร `logits / temperature` ตรง ๆ",
      symptom: "เกิด `ZeroDivisionError` หรือได้เทนเซอร์เต็มไปด้วย `NaN` / `Inf`",
      fix: "ปฏิเสธ `temperature <= 0` ในฟังก์ชัน softmax ส่วนกรณีที่ต้องการโหมด deterministic (`T=0`) ให้เลือกคำตอบด้วย `logits.argmax(dim=-1)` โดยตรง",
    },
    {
      title: "ใช้ Training Loss แทน Validation Loss ใน Early Stopping",
      symptom: "โมเดลไม่ยอมหยุดเทรนเพราะ train loss ลดลงเรื่อย ๆ ขณะที่ความแม่นยำบนข้อมูลใหม่พังยับ (overfitting)",
      fix: "ส่งเฉพาะ Validation Loss เข้า `EarlyStopper.step(val_loss)` เสมอ และเก็บ Test Set ไว้ประเมินครั้งเดียวตอนจบเพื่อกัน {{data-leakage}}",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d063-q1",
        "ทำไม `nn.CrossEntropyLoss()` ของ PyTorch จึงต้องรับ raw logits โดยตรง ห้ามผ่าน `torch.softmax()` มาก่อน?",
        [
          ["เพราะ `nn.CrossEntropyLoss()` ไม่รองรับเลขทศนิยมที่มีค่าน้อยกว่า 1", "ไม่จริง — มันรับ raw logits ที่มีค่าใดก็ได้ทั้งบวกและลบ"],
          ["เพราะ `nn.CrossEntropyLoss()` รวม `LogSoftmax` ไว้ข้างในแล้ว การใส่ Softmax ซ้ำจะทำให้เกิด Double Softmax จน loss ตันสูงและ gradient อ่อนลง", "ถูก — และการใช้ Log-Sum-Exp ภายใน PyTorch ยังปลอดภัยจาก numerical overflow กว่าด้วย"],
          ["เพราะ `torch.softmax()` ลบ `requires_grad` ออกจากเทนเซอร์", "`torch.softmax()` ยังรองรับ autograd ปกติ ปัญหาคือความผิดพลาดทางคณิตศาสตร์ของ Double Softmax"],
          ["เพราะ `nn.CrossEntropyLoss()` ใช้ได้เฉพาะงาน regression", "งาน regression ใช้ `MSELoss` / `L1Loss` ส่วน `CrossEntropyLoss` ใช้กับงานจำแนกหลายคลาส"],
        ],
        "B",
        "`nn.CrossEntropyLoss` ผสาน `LogSoftmax + NLLLoss` ไว้ในตัว การส่งค่าที่ผ่าน Softmax แล้วเข้าไปซ้ำจะทำให้การกระจายความน่าจะเป็นเพี้ยนและขวางการเรียนรู้",
        "ทำไมห้ามใส่ `nn.Softmax` ท้าย `forward()` เมื่อใช้ `nn.CrossEntropyLoss()`?",
        "เพราะ `CrossEntropyLoss` คำนวณ `LogSoftmax` ภายในอยู่แล้ว การใส่ Softmax ก่อนจะเกิด Double Softmax ทำให้ loss มีพื้นสูงผิดปกติและ gradient อ่อน",
      ),
      mc(
        "d063-q2",
        "หากเรามี raw logits ชุดเดิม `[3.0, 1.5, 0.2]` แล้วลดค่า `temperature` จาก `1.0` ลงเหลือ `0.2` จะเกิดผลอย่างไรกับผลลัพธ์ของ `softmax(logits / T)`?",
        [
          ["ความน่าจะเป็นของทุกคลาสจะเท่ากันหมดเป็น `0.333`", "นั่นคือกรณีที่ `T` สูงมาก ๆ (`T → ∞`) ไม่ใช่ `T` ต่ำ"],
          ["ผลรวมความน่าจะเป็นจะลดลงเหลือ `0.2`", "ผลรวมของ Softmax จะเท่ากับ `1.0` เสมอไม่ว่า `T > 0` จะเป็นเท่าใด"],
          ["คลาสที่คะแนนสูงสุด (`3.0`) จะได้ความน่าจะเป็นพุ่งใกล้ `1.0` มากขึ้น (การกระจายคมชัดและคาดเดาได้มากขึ้น)", "ถูก — การหารด้วย `T < 1` ขยายช่องว่างระหว่าง logits ก่อนเข้า `exp()`"],
          ["ลำดับคลาสที่คะแนนสูงสุดจะสลับกลับด้าน", "ตราบใดที่ `T > 0` ลำดับของคลาสจะเหมือนเดิมไม่เปลี่ยน"],
        ],
        "C",
        "เมื่อลด `T` ลงเข้าใกล้ศูนย์ ช่องว่างระหว่าง logits จะกว้างขึ้น ทำให้ Softmax เทน้ำหนักเกือบทั้งหมดไปที่คลาสอันดับ 1 (คมชัด/deterministic ขึ้น)",
        "`temperature` ต่ำ (`T < 1`) กับสูง (`T > 1`) ส่งผลต่อ `softmax(logits / T)` ต่างกันอย่างไร?",
        "`T < 1` ขยายความต่างของ logits ทำให้ความน่าจะเป็นกระจุกที่อันดับ 1 (คมชัด) ส่วน `T > 1` บีบความต่างทำให้การกระจายแบนและหลากหลายขึ้น",
      ),
      mc(
        "d063-q3",
        "ตำแหน่งที่ถูกต้องในการเรียก `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)` ในลูปเทรนคือข้อใด?",
        [
          ["ก่อน `logits = model(x)`", "ผิด — ช่วงนั้นยังไม่ได้คำนวณความชันของรอบปัจจุบัน"],
          ["หลัง `loss.backward()` และก่อน `optimizer.step()`", "ถูก — ต้องรอให้ `backward()` คำนวณ `.grad` เสร็จก่อน แล้วตัดเพดานให้เรียบร้อยก่อนให้ `step()` นำไปอัปเดตน้ำหนัก"],
          ["หลัง `optimizer.step()` และก่อน `optimizer.zero_grad()`", "สายไปแล้ว — น้ำหนักถูกอัปเดตด้วยความชันที่ระเบิดไปแล้ว"],
          ["ภายใน `with torch.inference_mode():` ตอนประเมินผล", "ตอน inference ไม่มีการคำนวณ gradient จึงไม่ต้อง clip"],
        ],
        "B",
        "Gradient Clipping ต้องทำงานหลัง `loss.backward()` เพื่อให้มี `.grad` อยู่แล้ว และต้องเสร็จก่อน `optimizer.step()` เพื่อกันไม่ให้ความชันขนาดยักษ์ไปทำลายค่าน้ำหนัก",
        "ควรเรียก `clip_grad_norm_` ตรงไหนในลูปเทรน PyTorch?",
        "เรียกหลัง `loss.backward()` และก่อน `optimizer.step()` เสมอ",
      ),
      mc(
        "d063-q4",
        "ข้อใดคือชุดมาตรการคุม overfitting ที่ถูกต้องและไม่ก่อให้เกิด Data Leakage?",
        [
          ["เปิด `Dropout` ทิ้งไว้ตอนทำนายผลจริงและใช้ Test Loss ตัดสินใจ Early Stopping", "ผิดทั้งคู่ — ต้องปิด Dropout ด้วย `model.eval()` และห้ามใช้ Test Set ตัดสินใจระหว่างเทรน"],
          ["ใช้ `AdamW(weight_decay=...)` + `nn.Dropout` (เปิดเฉพาะ `train()`) + Early Stopping บน Validation Loss", "ถูก — คุมความซับซ้อนของโมเดลอย่างครบถ้วนโดยกัน Test Set ไว้ประเมินตอนจบเท่านั้น"],
          ["ตั้ง `learning rate = 10.0` เพื่อให้โมเดลจำข้อมูลเทรนไม่ได้", "lr ที่สูงเกินจะทำให้ loss ระเบิดเป็น NaN ไม่ใช่วิธีคุม overfitting"],
          ["ลบ `optimizer.zero_grad()` ออกเพื่อไม่ให้พารามิเตอร์ขยับตาม batch ล่าสุดมากเกินไป", "การลืม `zero_grad()` เป็นบั๊กที่ทำให้ความชันสะสมจนการเทรนพัง"],
        ],
        "B",
        "Weight decay ใน `AdamW`, `Dropout` ที่ปิดตอน `eval()` และ Early Stopping บน Validation Loss คือแนวทางมาตรฐานที่ปลอดภัยจาก Data Leakage",
        "ควรใช้ข้อมูลชุดใดในการตัดสินใจ Early Stopping และเพราะอะไร?",
        "ใช้ Validation Loss เสมอ — ไม่ใช้ Train Loss (เพราะลดต่อได้แม้ overfit) และไม่ใช้ Test Loss (เพื่อป้องกัน Data Leakage)",
      ),
    ],
  },

  takeaways: [
    "ให้ `model.forward()` คืน **raw logits เสมอ** และส่งตรงเข้า `nn.CrossEntropyLoss` โดยห้ามผ่าน {{softmax}} มาก่อนเพื่อกันบั๊ก Double Softmax",
    "{{temperature}} ใน `softmax(logits / T)` ควบคุมความคมชัดของการกระจายความน่าจะเป็น: `T < 1` คมชัดเน้นอันดับ 1, `T > 1` กระจายตัวหลากหลาย — กลไกเดียวกับ {{llm}} API",
    "วาง `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)` ไว้หลัง `loss.backward()` และก่อน `optimizer.step()` เสมอเพื่อกัน exploding gradients",
    "คุม overfitting ด้วย `AdamW` weight decay, `nn.Dropout` (ปิดอัตโนมัติใน `model.eval()`), และ Early Stopping บน Validation Loss โดยไม่แตะ Test Set",
  ],

  reviewCards: [
    rc(
      "d063-rc-1",
      "จะเกิดอะไรขึ้นถ้าส่งผล `torch.softmax(logits)` เข้า `nn.CrossEntropyLoss()`?",
      "เกิด Double Softmax เพราะ `CrossEntropyLoss` ทำ `LogSoftmax` ภายในอยู่แล้ว ทำให้ค่า loss มีพื้นค้างสูงผิดปกติและ gradient อ่อนลงจนโมเดลเรียนช้ามาก",
    ),
    rc(
      "d063-rc-2",
      "การลด `temperature` จาก `1.0` เหลือ `0.2` ใน `softmax(logits / T)` เปลี่ยนความน่าจะเป็นอย่างไร?",
      "ขยายความต่างระหว่าง logits ทำให้คลาสอันดับ 1 กินความน่าจะเป็นเกือบ 100% (คมชัด/deterministic ขึ้น) โดยผลรวมยังเท่ากับ 1.0 เสมอ",
    ),
    rc(
      "d063-rc-3",
      "ตำแหน่งที่ถูกต้องของ `clip_grad_norm_` ในลูปเทรน 5 บรรทัดคือตรงไหน?",
      "อยู่หลัง `loss.backward()` และก่อน `optimizer.step()` เพื่อลดขนาดความชันที่พุ่งสูงโดยยังคงทิศทางเดิมไว้",
    ),
  ],

  sources: [
    { label: "PyTorch Docs — nn.CrossEntropyLoss", href: "https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html" },
    { label: "PyTorch Docs — torch.nn.functional.softmax", href: "https://pytorch.org/docs/stable/generated/torch.nn.functional.softmax.html" },
    { label: "PyTorch Docs — torch.nn.utils.clip_grad_norm_", href: "https://pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html" },
    { label: "PyTorch Docs — nn.Dropout", href: "https://pytorch.org/docs/stable/generated/torch.nn.Dropout.html" },
  ],

  glossary: ["softmax", "temperature", "tensor", "autograd", "llm", "top-k", "data-leakage", "mae-rmse"],
});
