import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D064 — Phase 3 / Block B16 (Review Day)
 * Interleaved recall of D61–D63 + D42/D59 + Debug exploding/vanishing loss in tiny PyTorch net
 */
export const d064: Lesson = defineLesson({
  day: 64,
  titleTh: "ทบทวน B16: ดีบัก Exploding & Vanishing Loss ใน PyTorch Neural Net",
  tagline: "30 นาที · รอบทบทวน D61–D63 + D42/D59 · รันบน CPU 100% · จับและแก้ 4 บั๊กคลาสสิกที่ทำให้ loss เป็น NaN หรือไม่ลง",
  icon: "wrench",
  visual: {
    id: "softmax-temperature",
    title: "ทบทวน B16: แก้บั๊ก Exploding / Vanishing Loss ใน PyTorch Net",
    caption: "เทียบเส้น Loss ที่พุ่งเป็น NaN (lr สูง + ลืม zero_grad + double softmax) กับการเทรนที่นิ่งด้วย gradient clipping",
    alt: "แผนภาพการดีบัก exploding และ vanishing loss ใน PyTorch",
  },
  requiresApiKey: false,
  tools: ["PyTorch", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "แยก Train / Validation ให้ขาดก่อนจับผิดลูปเทรน (ทบทวน D42)",
      body: "ต่อให้ลูป PyTorch ไม่มีบั๊กทางคณิตศาสตร์ แต่หากประเมินบนข้อมูลเทรนหรือปล่อยให้ข้อมูลรั่วระหว่าง train กับ val ({{data-leakage}}) คุณจะแยกไม่ออกเลยว่าโมเดลกำลังเรียนรู้จริงหรือแค่ท่องจำ",
      lessonNote: "ในแล็บดีบักวันนี้ เราแยกชุด Train และ Validation ออกจากกันชัดเจนก่อนวัดผลหลังแก้บั๊กทั้ง 4 จุด",
    },
    {
      node: 2,
      heading: "ตรวจสุขภาพลูป PyTorch ทีละชั้น: Logits, LR, zero_grad และ Clipping (D61–D63)",
      body: "โครงข่ายประสาทมักไม่โยน Python exception เวลาเขียนลูปผิด แต่มักแสดงอาการเงียบ ๆ เป็น loss พุ่งเป็น `NaN` (exploding) หรือค้างนิ่งไม่ลด (vanishing / double softmax)",
      lessonNote: "วันนี้คุณจะได้ลงมือซ่อมโมเดลจิ๋วที่ฝังบั๊กคลาสสิกไว้ครบ 4 จุด จนกลับมาลู่เข้าและแม่นยำเกิน 85%",
    },
    {
      node: 3,
      heading: "ล็อกคุณภาพด้วย Reproducible Training Tests (ทบทวน D59)",
      body: "เหมือนที่ทำใน Phase 2 (Day 59) โค้ดเทรน PyTorch ที่ดีต้องมีชุดเทสต์ {{pytest}} ที่ล็อก seed เพื่อ {{reproducibility}} และตรวจเงื่อนไขพื้นฐานอย่าง `isfinite(loss)`, loss ลดลงจริง และ `model.eval()`",
      lessonNote: "เราจะใช้ `test_day64.py` เป็นตัวตรวจแบบ Red → Green: รันครั้งแรกเห็นพังครบ แล้วแก้ทีละบั๊กจนเขียวทุกข้อ",
    },
    {
      node: 5,
      heading: "ดัก NaN/Inf แบบ Fail-Fast ก่อนเสียค่า GPU หรือบันทึกโมเดลพัง",
      body: "การใส่เกราะ {{fail-fast}} ด้วย `torch.isfinite(loss)` และการบันทึก `grad_norm` ช่วยหยุดการเทรนที่เริ่มเบี่ยงเบนตั้งแต่นาทีแรก แทนที่จะปล่อยรันข้ามคืนแล้วได้ไฟล์น้ำหนักเต็มไปด้วย `NaN`",
      lessonNote: "จบบล็อก B16 วันนี้คุณจะพร้อมก้าวเข้าสู่ Block B17 (Transformer, Self-Attention และ BPE Tokenizer) อย่างมั่นใจ",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบสลับหัวข้อ (Interleaved Recall)** เชื่อมโยง PyTorch B16 (D61–D63) เข้ากับ Train/Val Split กัน {{data-leakage}} (D42) และ Reproducible Training Tests (D59)",
    "**วินิจฉัยและแยกแยะ** ต้นเหตุของ **Exploding Loss (`NaN`/`Inf`)** กับ **Vanishing / Stalled Loss** จากอาการของกราฟ loss และค่า `grad_norm` ได้อย่างเป็นระบบ",
    "**ดีบักและซ่อม** ลูปเทรน PyTorch ที่มี 4 บั๊กพร้อมกัน (ลืม `zero_grad()`, Double Softmax, `lr=10.0`, ขาด `clip_grad_norm_` & `eval()`/`inference_mode()`) จนผ่านชุดเทสต์ `pytest` ครบ 100%",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D61 ({{tensor}} + {{autograd}}), D62 (`nn.Module` + 5-line loop) และ D63 (`CrossEntropyLoss` + {{softmax}} + clipping)",
    "ทบทวน D42 (Train/Val split กัน {{data-leakage}}) และ D59 (Reproducible training tests ด้วย `pytest`)",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์รอบทบทวน Day 64 ด้วย `uv` (หรือใช้สภาพแวดล้อม `torch` เดิมจาก B16) แล้วจัดเวลา 30 นาที: ควิซทบทวน 10 นาที → แล็บดีบัก 15 นาที → สรุป Error Log & Review Cards 5 นาที",
    commands: `uv init ai-day64-review && cd ai-day64-review
uv add torch
uv add --dev pytest ruff
uv run python -c "import torch, pytest; print('B16 Review Ready! PyTorch:', torch.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day64-review` หรือใช้โปรเจกต์ B16 เดิม"],
      ["deps", "ติดตั้ง `torch`, `pytest` และ `ruff`"],
      ["verify", "รันคำสั่งยืนยันเห็น `B16 Review Ready!` บน CPU"],
    ],
    note: "ในแล็บวันนี้ โค้ดเริ่มต้น (`exercise_day64.py`) จงใจใส่บั๊กไว้ 4 จุดเพื่อให้คุณลองรัน `uv run pytest -q` ดูอาการพังจริงก่อน แล้วค่อยไล่ซ่อมทีละจุดจนผ่านทั้งหมด",
  },

  concepts: [
    {
      id: "b16-interleaved-recall-map",
      title: "1 · แผนที่เชื่อมโยง B16 (D61–D63) + D42 & D59",
      paragraphs: [
        "ตลอด 3 วันที่ผ่านมาใน Block B16 คุณได้สร้างรากฐาน PyTorch ครบทั้งวงจร: **Day 61** คือการเข้าใจ {{tensor}} (`shape/dtype/device`), {{autograd}} และเหตุผลที่ `.grad` สะสมทับกัน, **Day 62** คือการประกอบ `nn.Module` + ลูป 5 บรรทัดทอง + `model.eval()`/`inference_mode()`, และ **Day 63** คือการเลือก `CrossEntropyLoss` (raw logits), {{softmax}} + {{temperature}} และเกราะคุมความเสถียรอย่าง `clip_grad_norm_`",
        "เมื่อนำมาประกบกับวินัยวิศวกรรมจาก Phase 2 — **Day 42** (แยก train/val เพื่อกัน {{data-leakage}}) และ **Day 59** (เขียนชุดเทสต์การเทรนที่ {{reproducibility|ทำซ้ำได้}} ด้วย {{pytest}}) — คุณจะได้มาตรฐานการเขียนโมเดล Deep Learning ที่ไม่พังเงียบและตรวจสอบย้อนกลับได้ทุกบรรทัด",
      ],
      analogy: "การดีบักโมเดล Deep Learning โดยไม่มีเช็กลิสต์เหมือนช่างซ่อมรถที่ลองเปลี่ยนอะไหล่สุ่มไปเรื่อย ๆ แต่แผนที่ 5 วันนี้คือเครื่องสแกน OBD-II ที่ชี้จุดเสียได้ตรงจุดในไม่กี่นาที",
      bullets: [
        "**D61 (`autograd` & `.grad`)**: ถ้าลืมล้าง `.grad` ความชันเก่าจะบวกพอกพูนจนพารามิเตอร์ระเบิด",
        "**D62 (`nn.Module` & modes)**: ต้องมี `ReLU`, ยึดลำดับ 5 บรรทัดทอง และสลับ `train()` / `eval()` + `inference_mode()` ให้ชัด",
        "**D63 (`CrossEntropyLoss` & `clip`)**: ห้ามใส่ Softmax ท้าย `forward()` และวาง `clip_grad_norm_` ระหว่าง `backward()` กับ `step()`",
        "**D42 & D59 (Split & Tests)**: ประเมินบน Val Set แยกขาด และล็อก seed + ตรวจ `isfinite(loss)` ใน `pytest`",
      ],
      whyTitle: "Why this matters — 90% ของอาการเทรนไม่ลงมาจากบั๊กพื้นฐานไม่กี่จุด",
      whyParagraphs: [
        "เวลาเทรนโครงข่ายประสาทแล้วความแม่นยำค้างอยู่ที่การเดาสุ่ม หรือ loss กลายเป็น `NaN` มือใหม่มักรีบเปลี่ยนสถาปัตยกรรมโมเดลให้ใหญ่ขึ้น ทั้งที่ต้นเหตุจริงคือบั๊กพื้นฐานในลูป 5 บรรทัดหรือ loss function",
        "การฝึกสายตาให้จับ 4 บั๊กวันนี้ได้ในไม่กี่วินาทีจะช่วยประหยัดเวลาดีบักได้หลายสิบชั่วโมงตลอดสายอาชีพ AI Engineer",
      ],
    },
    {
      id: "exploding-vs-vanishing-triage",
      title: "2 · เช็กลิสต์แยกอาการ: Exploding Loss (NaN) vs Vanishing / Stalled Loss",
      paragraphs: [
        "อาการพังของลูปเทรน PyTorch แบ่งได้เป็น 2 กลุ่มใหญ่ที่ต่างกันชัดเจน: กลุ่มแรกคือ **Exploding Loss** — ค่า loss พุ่งสูงขึ้นเรื่อย ๆ (`0.7 → 45 → 1e9 → NaN`) และ `grad_norm` พุ่งทะลุหลักร้อยถึง `inf` ต้นเหตุหลักคือ (1) **Learning Rate สูงเกินไป** (เช่น `lr=10.0` แทน `1e-2`–`5e-2`), (2) **ลืม `optimizer.zero_grad()`** ทำให้ความชันสะสมเป็นสโนว์บอล, และ (3) **ไม่มี `clip_grad_norm_`** คุมเพดานความชัน",
        "กลุ่มที่สองคือ **Vanishing / Stalled Loss** — ค่า loss แทบไม่ขยับหรือค้างอยู่สูงผิดปกติแม้เทรนหลายร้อยรอบ (เช่นค้างแถว `0.55–1.09` ในงาน 3 คลาส) ต้นเหตุคลาสสิกคือ **Double Softmax** (ใส่ `torch.softmax` ท้าย `forward()` แล้วส่งเข้า `nn.CrossEntropyLoss`), `lr` ต่ำเกินไป (`1e-7`), หรือลืมใส่ non-linearity (`nn.ReLU()`) ระหว่างชั้น `nn.Linear`",
        "วิธีวินิจฉัยที่ได้ผลเร็วที่สุดคือใส่ **{{fail-fast}} guard** (`if not torch.isfinite(loss): raise RuntimeError(...)`) พร้อมพิมพ์ `loss`, `grad_norm` และช่วงค่า `(logits.min(), logits.max())` ตั้งแต่ 5 รอบแรก — ถ้าเห็น `logits` อยู่ใน `[0, 1]` และผลรวมแถวเท่ากับ `1.0` ให้สงสัย Double Softmax ทันที!",
      ],
      analogy: "Exploding Loss เหมือนหม้อน้ำเดือดจนเข็มความร้อนทะลุขีดแดง (`NaN`) เพราะเหยียบคันเร่งจมมิด (`lr=10`) แถมไม่ยอมถอนคันเร่ง (`ลืม zero_grad`) ส่วน Vanishing/Double Softmax เหมือนรถที่ลืมปลดเบรกมือ — เหยียบคันเร่งเท่าไรรถก็คลานอยู่กับที่",
      code: {
        language: "python",
        filename: "triage_snippet.py",
        code: `import torch


def assert_healthy_step(logits: torch.Tensor, loss: torch.Tensor) -> None:
    # 1) Fail-fast หาก loss เป็น NaN หรือ Inf
    if not torch.isfinite(loss):
        raise RuntimeError(f"Exploding loss detected: {loss.item()}")
    # 2) เตือนหาก raw logits ดูเหมือนผ่าน Softmax มาแล้ว (ทุกค่าอยู่ใน [0, 1] และแถวรวมเป็น 1)
    row_sums = logits.detach().sum(dim=-1)
    if (logits.detach() >= 0).all() and torch.allclose(row_sums, torch.ones_like(row_sums), atol=1e-3):
        raise ValueError("Suspected Double Softmax: forward() should return raw logits, not probabilities!")`,
        caption: "ตัวเช็กสุขภาพ 2 บรรทัดที่ช่วยจับทั้ง Exploding `NaN` และ Double Softmax ได้ตั้งแต่ epoch แรก",
      },
      whyTitle: "Why this matters — รู้ตัวตั้งแต่ Epoch 1 ดีกว่าปล่อยเทรนทิ้งฟรี",
      whyParagraphs: [
        "ตอนทดลองบน CPU ใช้เวลาแค่ไม่กี่วินาที แต่เมื่อคุณเทรนโมเดลใหญ่หรือ fine-tune บน GPU คลาวด์ การมี `torch.isfinite(loss)` และ `grad_norm` log ช่วยหยุดงานที่พังได้ทันทีในวินาทีแรก",
        "นี่คือการนำหลัก **Fail-Fast** จาก Phase 1 มาประยุกต์ใช้กับ Deep Learning โดยตรง",
      ],
    },
    {
      id: "pytest-sanity-tests-for-pytorch",
      title: "3 · เขียน PyTorch Sanity Tests ด้วย pytest (ต่อยอด D59)",
      paragraphs: [
        "เทคนิคคลาสสิกที่วิศวกร Deep Learning ระดับโลกใช้ก่อนเทรนข้อมูลจริงคือ **\"Overfit a Tiny Batch Test\"**: ลองเทรนโมเดลกับชุดข้อมูลจำลองขนาดเล็ก (เช่น 60–120 แถว) ด้วย seed คงที่ — ถ้าโมเดลและลูปเทรนเขียนถูก 100% ค่า loss ต้องเป็นตัวเลขปกติ (`isfinite`), ลดลงอย่างชัดเจน, และความแม่นยำบนชุด validation ที่แยกไว้ต้องสูงขึ้นชัดเจน",
        "เราสามารถแปลง Sanity Test นี้ให้เป็น `pytest` อัตโนมัติ 4 ข้อที่รันจบใน 1 วินาทีบน CPU: (1) เช็กว่า `forward()` คืน raw logits จริง (ไม่ถูกบีบเป็น probability), (2) เช็กว่าทุก loss ในประวัติเป็น finite และลดลงเกินเกณฑ์, (3) เช็กว่าหลัง `clip_grad_norm_` ความชันไม่เกิน `max_norm`, และ (4) เช็ก {{reproducibility}} (รันซ้ำด้วย seed เดิมได้ผลเท่ากันเป๊ะ) + โมเดลจบในโหมด `eval()`",
      ],
      analogy: "เหมือนการเช็กไมโครโฟนว่า \"เทสต์ 1-2-3\" ก่อนขึ้นเวทีคอนเสิร์ต — ถ้าชุดข้อมูลเล็ก ๆ ยังเทรนไม่ลง ก็ไม่ต้องเสียเวลาเอาข้อมูลเป็นล้านแถวไปโยนเข้าโมเดล",
      whyTitle: "Why this matters — สะพานจาก Experiment สู่ Production Engineering",
      whyParagraphs: [
        "โค้ด PyTorch ใน Notebook มักพังเงียบ ๆ เวลาคนอื่นมาแก้ `lr` หรือเพิ่มเลเยอร์ใหม่ แต่เมื่อมี `pytest` คุม 4 เงื่อนไขนี้ไว้ใน CI ทุกบั๊กคลาสสิกจะถูกจับได้ทันทีก่อน merge โค้ด",
        "วินัยการทดสอบแบบนี้จะอยู่กับคุณต่อไปตลอด Phase 4–6 จนถึง Capstone",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — 4-Bug Triage ≈ Debugging Silent State Corruption ใน Backend",
      body: [
        "บั๊กใน PyTorch มักไม่แครชด้วย `500 Internal Server Error` แต่มักคล้ายบั๊ก state mutation ในเว็บแอป: ลืม `zero_grad()` ≈ ลืมเคลียร์ state เก่าก่อนคำนวณรอบใหม่จนตัวเลขเบิ้ลทบต้น, `lr=10.0` ≈ retry loop ที่ไม่มี backoff จนระบบพัง, และ Double Softmax ≈ double-encoding ข้อมูลก่อนบันทึก",
        "ดังนั้นการเขียน `pytest` ตรวจ raw logits, `isfinite`, gradient cap และ `reproducibility` จึงทำหน้าที่เหมือน regression test suite ใน backend API",
      ],
      table: [
        ["`lr=10.0` → `NaN`", "Step size / multiplier ใหญ่เกินจนตัวเลข overflow เป็น `Infinity`/`NaN`"],
        ["ลืม `optimizer.zero_grad()`", "ลืมรีเซ็ต accumulator ข้าม request จน state พอกพูน"],
        ["Double Softmax", "Double-encode payload (เช่น `JSON.stringify` ซ้ำสองรอบ)"],
        ["Overfit Tiny Batch `pytest`", "Smoke test บน fixture จิ๋วก่อนปล่อยขึ้น production"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีฝึกดีบักแบบนักวิทยาศาสตร์: แก้ทีละข้อแล้วสังเกตผล",
      body: [
        "เมื่อเจอโค้ดที่มีหลายบั๊กพร้อมกัน อย่าเพิ่งเดาสุ่มแก้ทุกบรรทัดพร้อมกันโดยไม่อ่านผลเทสต์ ให้รัน `pytest` อ่านข้อความ error ทีละข้อ: เริ่มจากแก้ `forward()` ให้คืน raw logits ก่อน แล้วค่อยตรวจ `lr`, ใส่ `optimizer.zero_grad()`, เติม `clip_grad_norm_` และสลับ `model.eval()` + `inference_mode()`",
        "จดบั๊กที่คุณเคยพลาดหรือเกือบมองข้ามลงใน Error Log ส่วนตัว — การเห็นอาการพังด้วยตาตัวเอง 1 ครั้งจะทำให้คุณจำได้แม่นกว่าอ่านตำรา 10 รอบ",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เรามีสคริปต์เทรนโมเดลจำแนก 3 คลาสขนาดจิ๋วที่พังยับ (loss พุ่งหรือค้าง และความแม่นยำตก) — มาดูอาการพังจริง วิธีส่องหาต้นเหตุ 4 จุด และผลลัพธ์หลังซ่อมเรียบร้อย",
    steps: [
      {
        title: "1 · รันโค้ดที่พัง (4 บั๊กพร้อมกัน) เพื่อดูอาการจริง",
        explain: "โค้ดนี้จงใจรวม 4 บั๊กคลาสสิก: (1) คืน `torch.softmax` จาก `forward`, (2) `lr=10.0`, (3) ลืม `optimizer.zero_grad()`, และ (4) ไม่มี `clip_grad_norm_` — สังเกต `grad_norm` และ `loss` ที่เพี้ยนทันที",
        code: {
          language: "python",
          filename: "debug_demo_day64.py",
          code: `import torch
import torch.nn as nn

torch.manual_seed(42)
X = torch.randn(90, 4)
y = ((X[:, 0] + X[:, 1] > 0).long() + (X[:, 2] > 0).long())  # 3 classes: 0, 1, 2

class BrokenNet(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.fc1 = nn.Linear(4, 16)
        self.fc2 = nn.Linear(16, 3)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.softmax(self.fc2(torch.relu(self.fc1(x))), dim=-1)  # ❌ Bug 1: Double Softmax

model = BrokenNet()
opt = torch.optim.SGD(model.parameters(), lr=10.0)  # ❌ Bug 2: lr สูงเกินไป
loss_fn = nn.CrossEntropyLoss()

for epoch in range(1, 6):
    # ❌ Bug 3: ลืม opt.zero_grad()
    out = model(X)
    loss = loss_fn(out, y)
    loss.backward()
    # ❌ Bug 4: ไม่มี clip_grad_norm_
    gnorm = sum(p.grad.pow(2).sum().item() for p in model.parameters()) ** 0.5
    opt.step()
    print(f"[BROKEN] epoch={epoch} | loss={loss.item():.4f} | grad_norm={gnorm:.2f} | row_sum={out[0].sum().item():.2f}")`,
        },
        output: `[BROKEN] epoch=1 | loss=1.0974 | grad_norm=0.14 | row_sum=1.00
[BROKEN] epoch=2 | loss=1.0641 | grad_norm=0.41 | row_sum=1.00
[BROKEN] epoch=3 | loss=1.1835 | grad_norm=1.12 | row_sum=1.00
[BROKEN] epoch=4 | loss=1.2298 | grad_norm=1.74 | row_sum=1.00
[BROKEN] epoch=5 | loss=1.2412 | grad_norm=2.36 | row_sum=1.00`,
      },
      {
        title: "2 · อ่านสัญญาณจาก Log เพื่อระบุตัวการทั้ง 4 จุด",
        explain: "ดูจาก log แค่ 5 บรรทัดก็จับได้ครบ: `row_sum=1.00` ฟ้องว่าเกิด Double Softmax, `loss` แทนที่จะลดกลับพุ่งขึ้น (`1.09 → 1.24`), และ `grad_norm` โตขึ้นเรื่อย ๆ ทุก epoch เพราะลืม `zero_grad()` ร่วมกับ `lr=10.0`",
        code: {
          language: "python",
          filename: "debug_demo_day64.py",
          code: `print("Triage findings:")
print("1. row_sum == 1.00 -> ลบ torch.softmax ออกจาก forward() ให้คืน raw logits")
print("2. lr=10.0         -> เปลี่ยนเป็น AdamW(lr=0.03)")
print("3. grad_norm โตสะสม -> เพิ่ม opt.zero_grad(set_to_none=True) ต้นลูป")
print("4. กัน gradient ระเบิด -> เพิ่ม clip_grad_norm_(model.parameters(), max_norm=1.0) ก่อน step()")`,
        },
        output: `Triage findings:
1. row_sum == 1.00 -> ลบ torch.softmax ออกจาก forward() ให้คืน raw logits
2. lr=10.0         -> เปลี่ยนเป็น AdamW(lr=0.03)
3. grad_norm โตสะสม -> เพิ่ม opt.zero_grad(set_to_none=True) ต้นลูป
4. กัน gradient ระเบิด -> เพิ่ม clip_grad_norm_(model.parameters(), max_norm=1.0) ก่อน step()`,
      },
      {
        title: "3 · รันเวอร์ชันที่ซ่อมแล้วพร้อมแยก Train/Val และ eval() + inference_mode()",
        explain: "แยกข้อมูล 90 แถวเป็น 70 Train / 20 Val (กัน {{data-leakage}}), ซ่อมบั๊กทั้ง 4 จุด แล้ววัดผลบน Val Set ในโหมด `eval()` + `inference_mode()`",
        code: {
          language: "python",
          filename: "debug_demo_day64.py",
          code: `torch.manual_seed(42)
X_train, y_train = X[:70], y[:70]
X_val, y_val = X[70:], y[70:]

class FixedNet(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.fc1 = nn.Linear(4, 16)
        self.fc2 = nn.Linear(16, 3)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.fc2(torch.relu(self.fc1(x)))  # ✅ Raw logits

fixed = FixedNet()
opt = torch.optim.AdamW(fixed.parameters(), lr=0.03)
loss_fn = nn.CrossEntropyLoss()

fixed.train()
for epoch in range(1, 101):
    opt.zero_grad(set_to_none=True)
    loss = loss_fn(fixed(X_train), y_train)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(fixed.parameters(), max_norm=1.0)
    opt.step()
    if epoch in (1, 25, 60, 100):
        print(f"[FIXED] epoch={epoch:3d} | train_loss={loss.item():.4f}")

fixed.eval()
with torch.inference_mode():
    val_acc = (fixed(X_val).argmax(dim=-1) == y_val).float().mean().item()
print(f"[FIXED] Val accuracy: {val_acc * 100:.1f}% | training={fixed.training}")`,
        },
        output: `[FIXED] epoch=  1 | train_loss=1.1243
[FIXED] epoch= 25 | train_loss=0.3186
[FIXED] epoch= 60 | train_loss=0.1429
[FIXED] epoch=100 | train_loss=0.0794
[FIXED] Val accuracy: 95.0% | training=False`,
      },
    ],
    gotcha: "ถ้าแก้แค่ `lr` อย่างเดียวแต่ยังปล่อย Double Softmax ทิ้งไว้ กราฟ loss อาจดูเหมือนลดลงนิดหน่อยในช่วงแรกแล้วหยุดนิ่งอยู่แถว `0.55` ทำให้หลงคิดว่าข้อมูลยาก — ต้องตรวจให้ครบทั้ง 4 จุดเสมอ!",
  },

  practice: {
    intro: "แล็บดีบักประจำบล็อก B16: โค้ดเริ่มต้นใน `exercise_day64.py` มีบั๊กคลาสสิกซ่อนอยู่ 4 จุด ทำให้ `test_day64.py` พัง! ภารกิจของคุณคือรัน `uv run pytest -q` ดูอาการพังก่อน แล้วซ่อมโค้ดให้ผ่านครบทุกเทสต์โดยยังคงชื่อคลาสและ signature เดิมไว้",
    requirements: [
      "ซ่อม **Bug 1 (Double Softmax)** ใน `TinyClassifier.forward(x)` ให้คืน **raw logits** (ลบ `torch.softmax` ออก)",
      "ซ่อม **Bug 2 (Exploding LR)** ใน `train_and_eval` โดยปรับค่าเริ่มต้นของ `lr` ให้เหมาะสม (เช่น `lr: float = 0.03` ร่วมกับ `AdamW` แทน `lr=10.0`)",
      "ซ่อม **Bug 3 (Missing zero_grad)** โดยเรียก `optimizer.zero_grad(set_to_none=True)` ทุกสเต็ปก่อนรัน forward และเพิ่ม {{fail-fast}} guard `if not torch.isfinite(loss): raise RuntimeError(...)`",
      "ซ่อม **Bug 4 (Missing Clipping & Eval Mode)** โดยเรียก `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_norm)` หลัง `loss.backward()` ก่อน `optimizer.step()`, บันทึก `max_post_clip_norm` จริงหลังตัด, และสลับ `model.eval()` + `with torch.inference_mode():` ตอนคำนวณ `val_acc`",
      "คงโครงสร้างการคืนค่า `dict` ของ `train_and_eval`: `{\"model\": model, \"loss_history\": loss_history, \"val_acc\": val_acc, \"max_post_clip_norm\": max_post_clip_norm}` ให้ตรงกับ `test_day64.py`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day64.py",
      code: `import torch
import torch.nn as nn


class TinyClassifier(nn.Module):
    def __init__(self, in_dim: int = 4, hidden_dim: int = 16, num_classes: int = 3) -> None:
        super().__init__()
        self.fc1 = nn.Linear(in_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # BUG 1: เผลอใส่ softmax ท้าย forward ทั้งที่ใช้คู่กับ CrossEntropyLoss!
        return torch.softmax(self.fc2(self.relu(self.fc1(x))), dim=-1)


def make_synthetic_dataset(seed: int = 42) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
    g = torch.Generator().manual_seed(seed)
    x = torch.randn(160, 4, generator=g)
    y = ((x[:, 0] + 0.8 * x[:, 1] > 0).long() + (x[:, 2] - 0.5 * x[:, 3] > 0).long())
    return x[:120], y[:120], x[120:], y[120:]


def _total_grad_norm(model: nn.Module) -> float:
    sq = sum(p.grad.detach().pow(2).sum().item() for p in model.parameters() if p.grad is not None)
    return float(sq ** 0.5)


def train_and_eval(
    seed: int = 42,
    epochs: int = 120,
    lr: float = 10.0,  # BUG 2: learning rate สูงเกินไปจน loss พัง/แกว่ง!
    max_norm: float = 1.0,
) -> dict[str, object]:
    """เทรน TinyClassifier บนชุด train และประเมินบนชุด val (ซ่อมบั๊กทั้ง 4 จุด)."""
    torch.manual_seed(seed)
    x_train, y_train, x_val, y_val = make_synthetic_dataset(seed=seed)

    model = TinyClassifier(in_dim=4, hidden_dim=16, num_classes=3)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=lr)

    loss_history: list[float] = []
    max_post_clip_norm = 0.0

    model.train()
    for _ in range(epochs):
        # BUG 3: ลืมเรียก optimizer.zero_grad() ทำให้ความชันสะสมทับกันทุก epoch!
        logits = model(x_train)
        loss = criterion(logits, y_train)
        loss.backward()
        # BUG 4: ลืมเรียก clip_grad_norm_ ก่อน optimizer.step()!
        max_post_clip_norm = max(max_post_clip_norm, _total_grad_norm(model))
        optimizer.step()
        loss_history.append(float(loss.item()))

    # BUG 4 (ต่อ): ลืมสลับ model.eval() และ torch.inference_mode() ตอนประเมินผล!
    val_preds = model(x_val).argmax(dim=-1)
    val_acc = float((val_preds == y_val).float().mean().item())

    return {
        "model": model,
        "loss_history": loss_history,
        "val_acc": val_acc,
        "max_post_clip_norm": max_post_clip_norm,
    }
`,
    },
    verification: {
      language: "python",
      filename: "test_day64.py",
      code: `import math
import torch
from exercise_day64 import TinyClassifier, train_and_eval


def test_model_outputs_raw_logits_not_probabilities():
    torch.manual_seed(0)
    model = TinyClassifier(4, 16, 3)
    out = model(torch.randn(10, 4))
    assert out.shape == (10, 3)
    row_sums = out.sum(dim=-1)
    # Raw logits ไม่ควรถูกบังคับให้ทุกแถวเป็นบวกและรวมได้ 1.0 เหมือน Softmax
    assert not ((out >= 0).all() and torch.allclose(row_sums, torch.ones_like(row_sums), atol=1e-4))


def test_training_converges_without_nan_or_exploding_grad():
    res = train_and_eval(seed=42, epochs=120)
    history: list[float] = res["loss_history"]  # type: ignore[assignment]
    val_acc: float = res["val_acc"]  # type: ignore[assignment]
    max_post_clip: float = res["max_post_clip_norm"]  # type: ignore[assignment]

    assert len(history) == 120
    assert all(math.isfinite(v) for v in history)
    assert history[-1] < history[0] * 0.35
    assert val_acc >= 0.85
    assert max_post_clip <= 1.0 + 1e-4


def test_eval_mode_is_active_after_training():
    res = train_and_eval(seed=42, epochs=60)
    model: TinyClassifier = res["model"]  # type: ignore[assignment]
    assert model.training is False


def test_training_is_reproducible_across_runs():
    r1 = train_and_eval(seed=7, epochs=80)
    r2 = train_and_eval(seed=7, epochs=80)
    assert math.isclose(r1["loss_history"][-1], r2["loss_history"][-1], rel_tol=1e-6)  # type: ignore[index]
    assert math.isclose(r1["val_acc"], r2["val_acc"], rel_tol=1e-6)  # type: ignore[arg-type]
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` ก่อนแก้โค้ด เพื่อเห็นว่าทั้ง 4 บั๊กทำให้เทสต์พังจริงอย่างไร",
      "แก้ครบทั้ง 4 จุดแล้วรัน `uv run pytest -q` จนผ่านเขียวครบ 4/4 test cases",
      "ตรวจว่า `loss_history[-1]` ลดลงต่ำกว่า 35% ของค่าเริ่มต้น และ `val_acc >= 0.85` บนชุด validation ที่แยกขาด",
      "ตรวจว่า `max_post_clip_norm <= 1.0` และ `model.training is False` หลังประเมินผลเสร็จ",
      "รัน `uv run ruff check .` แล้วไม่มี lint warning",
    ],
    acceptance: "ซ่อมครบทั้ง 4 บั๊กใน `exercise_day64.py` จนผ่าน `uv run pytest -q` ครบทั้ง 4 test cases และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "เริ่มจาก `TinyClassifier.forward` ก่อน: ลบ `torch.softmax(..., dim=-1)` ออกให้เหลือแค่ `return self.fc2(self.relu(self.fc1(x)))` แล้วรัน `pytest` จะเห็น test แรกผ่านทันที",
      },
      {
        body: "ใน `train_and_eval` เปลี่ยนค่าเริ่มต้นเป็น `lr: float = 0.03` และใช้ `torch.optim.AdamW(model.parameters(), lr=lr)`, เพิ่ม `optimizer.zero_grad(set_to_none=True)` ต้นลูป, เพิ่ม `torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_norm)` หลัง `loss.backward()` ก่อนวัด `_total_grad_norm(model)` และ `optimizer.step()`",
      },
      {
        body: "ตัวอย่างส่วนลูปเทรนและประเมินผลที่ซ่อมเรียบร้อยแล้ว — นำไปเทียบกับโค้ดของคุณ",
        code: {
          language: "python",
          filename: "hint_day64.py",
          code: `    model.train()
    for _ in range(epochs):
        optimizer.zero_grad(set_to_none=True)
        logits = model(x_train)
        loss = criterion(logits, y_train)
        if not torch.isfinite(loss):
            raise RuntimeError(f"Non-finite loss encountered: {loss.item()}")
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_norm)
        max_post_clip_norm = max(max_post_clip_norm, _total_grad_norm(model))
        optimizer.step()
        loss_history.append(float(loss.item()))

    model.eval()
    with torch.inference_mode():
        val_preds = model(x_val).argmax(dim=-1)
        val_acc = float((val_preds == y_val).float().mean().item())`,
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
      title: "เพิ่มขนาดโมเดลหรือเพิ่ม epoch แทนที่จะตรวจ 4 บั๊กพื้นฐานในลูป",
      symptom: "ขยาย `hidden_dim` เป็น 512 และเทรน 2,000 รอบแต่ loss ยังค้างหรือเป็น `NaN` เหมือนเดิม",
      fix: "ไล่เช็ก 4 จุดก่อนเสมอ: raw logits (ไม่ double softmax), `lr` เหมาะสม, มี `zero_grad()`, และมี `clip_grad_norm_`",
    },
    {
      title: "วัด `_total_grad_norm` ก่อนเรียก `clip_grad_norm_` แทนที่จะวัดหลังตัด (หรือสับสนค่า return ของ `clip_grad_norm_`)",
      symptom: "เข้าใจผิดว่า `clip_grad_norm_` ไม่ทำงานเพราะค่าที่คืนออกมามีค่ามากกว่า `max_norm`",
      fix: "จำให้แม่นว่า `clip_grad_norm_` คืนค่า **pre-clip norm** (ความชันก่อนตัด) เพื่อใช้ monitor ส่วน `.grad` ในตัวโมเดลถูกตัดลงเหลือ `<= max_norm` เรียบร้อยแล้ว",
    },
    {
      title: "ลืมตรวจสอบ `torch.isfinite(loss)` ในลูปเทรน",
      symptom: "loss กลายเป็น `NaN` ตั้งแต่ epoch ที่ 4 แต่ลูปยังรันต่อไปอีก 500 รอบโดยไม่แจ้งเตือน",
      fix: "ใส่ `if not torch.isfinite(loss): raise RuntimeError(...)` เพื่อ {{fail-fast}} ทันทีที่พบความผิดปกติ",
    },
    {
      title: "ลืมตั้ง `torch.manual_seed(seed)` ตอนเขียนเทสต์ดีบัก (ทบทวน D59)",
      symptom: "รัน `pytest` รอบแรกผ่าน รอบสองตก ทำให้ไม่แน่ใจว่าบั๊กถูกซ่อมจริงหรือแค่โชคดีจากการสุ่มน้ำหนัก",
      fix: "ล็อก seed ทั้งฝั่งข้อมูลและฝั่งน้ำหนักโมเดลทุกครั้งใน unit test เพื่อให้ผลทดสอบมี {{reproducibility}} 100%",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d064-q1",
        "คุณเทรนโมเดล 3 คลาสด้วย `nn.CrossEntropyLoss()` แล้วเห็นว่าทุกแถวของเอาต์พุตจาก `model(x)` มีค่าเป็นบวกและรวมกันได้ `1.000` ขณะที่ loss ตันอยู่แถว `0.58` ไม่ยอมลง — ต้นเหตุที่น่าจะเป็นที่สุดคืออะไร?",
        [
          ["ลืมตั้ง `torch.manual_seed`", "seed ไม่ได้บังคับให้เอาต์พุตทุกแถวรวมกันได้ 1.0"],
          ["เกิด Double Softmax เพราะ `forward()` เรียก `torch.softmax()` ก่อนส่งเข้า `nn.CrossEntropyLoss()`", "ถูก — ลบ Softmax ออกจาก `forward()` ให้คืน raw logits ตรง ๆ"],
          ["`DataLoader` สลับข้อมูลมากเกินไป", "การสลับข้อมูลไม่ได้ทำให้เอาต์พุตโมเดลรวมกันได้ 1.0"],
          ["CPU คำนวณ `float32` ช้ากว่า GPU", "ความเร็วอุปกรณ์ไม่เกี่ยวกับอาการ loss ตันจาก Double Softmax"],
        ],
        "B",
        "เมื่อเอาต์พุตของ `forward()` รวมกันได้ `1.0` ทุกแถว แสดงว่ามันผ่าน Softmax มาแล้ว ซึ่งไม่ควรส่งเข้า `nn.CrossEntropyLoss()` ซ้ำ",
        "อาการใดที่ชี้ชัดว่าคุณกำลังเจอ Double Softmax ใน PyTorch?",
        "เอาต์พุตของ `forward()` อยู่ระหว่าง 0–1 และรวมกันได้ 1.0 ทุกแถว พร้อมกับค่า `CrossEntropyLoss` ที่ลดช้าและมีพื้นค้างสูงผิดปกติ",
      ),
      mc(
        "d064-q2",
        "ระหว่างดีบักลูปเทรน คุณเห็น `grad_norm` โตขึ้นเรื่อย ๆ แบบ `0.5 → 1.2 → 2.4 → 5.1 → NaN` ในไม่กี่สเต็ป ทั้งที่ข้อมูลปกติ — คู่ต้นเหตุใดที่ควรเช็กก่อนเพื่อน?",
        [
          ["ลืม `optimizer.zero_grad()` และ/หรือตั้ง `learning rate` สูงเกินไปโดยไม่มี `clip_grad_norm_`", "ถูก — ความชันที่บวกสะสมไม่ถูกล้างร่วมกับก้าวที่ใหญ่เกินไปคือสูตรสำเร็จของ Exploding Loss"],
          ["เรียก `model.eval()` บ่อยเกินไป", "`model.eval()` ไม่ได้ทำให้ gradient สะสมเป็น NaN"],
          ["ใช้ `torch.float32` แทน `torch.int64` สำหรับน้ำหนักโมเดล", "น้ำหนักโมเดลต้องเป็นทศนิยม (`float32`) อยู่แล้ว"],
          ["ลืมเรียก `loss.item()` ตอนพิมพ์ log", "การลืม `.item()` ทำให้กิน RAM (memory leak) แต่ไม่ได้ทำให้ `grad_norm` ระเบิดเป็น NaN"],
        ],
        "A",
        "การลืม `optimizer.zero_grad()` ทำให้ความชันพอกพูนทุกสเต็ป และ `lr` ที่สูงเกินไปโดยไม่มี `clip_grad_norm_` จะเร่งให้น้ำหนักทะลุเพดานเป็น `NaN`",
        "3 จุดที่ต้องเช็กทันทีเมื่อเจอ Exploding Loss (`NaN`) คืออะไร?",
        "1) มี `optimizer.zero_grad()` ทุกสเต็ปหรือไม่, 2) `lr` สูงเกินไปหรือไม่, และ 3) มี `clip_grad_norm_` หลัง `backward()` ก่อน `step()` หรือไม่",
      ),
      mc(
        "d064-q3",
        "ทบทวนข้ามบท (D42 + D62 + D63): เหตุใดในฟังก์ชัน `train_and_eval` เราจึงต้องแยก `x_val, y_val` ออกจาก `x_train, y_train` และประเมินใน `model.eval()` + `torch.inference_mode()`?",
        [
          ["เพื่อทำให้ `loss.backward()` รันเร็วขึ้นบนชุด validation", "ตอนประเมินผลบน validation เราไม่เรียก `backward()` เลย"],
          ["เพื่อป้องกัน Data Leakage (วัดความสามารถบนข้อมูลที่ไม่เคยเห็น) พร้อมปิดพฤติกรรมช่วงเทรนอย่าง Dropout และงดสร้างกราฟ autograd", "ถูก — เป็นการรวมวินัย D42 และ D62 เข้าด้วยกันอย่างสมบูรณ์"],
          ["เพราะ `AdamW` ห้ามใช้กับข้อมูลที่เกิน 100 แถว", "ไม่จริง — `AdamW` ใช้ได้กับชุดข้อมูลทุกขนาด"],
          ["เพื่อให้ค่า `temperature` ถูกรีเซ็ตเป็น `0.0` อัตโนมัติ", "`eval()` และ `inference_mode()` ไม่ได้เปลี่ยนค่า temperature"],
        ],
        "B",
        "การแยกชุด validation ป้องกัน Data Leakage (D42) ส่วน `model.eval()` + `torch.inference_mode()` รับประกันผลประเมินที่นิ่ง ถูกต้อง และไม่เปลืองหน่วยความจำ (D62)",
        "ทำไมการประเมินโมเดล PyTorch ต้องทำบน Val Set แยกขาดภายใน `model.eval()` + `torch.inference_mode()`?",
        "เพื่อกัน Data Leakage (วัดผลบนข้อมูลใหม่จริง), ปิด Dropout/BatchNorm training behavior, และงดสร้างกราฟ autograd เพื่อความเร็วและความถูกต้อง",
      ),
      mc(
        "d064-q4",
        "ทบทวนข้ามบท (D59 + D63): ข้อใดคือค่าคืนกลับของคำสั่ง `norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)`?",
        [
          ["ค่า loss หลังอัปเดตน้ำหนัก", "ไม่ใช่ — คำสั่งนี้ทำงานกับ `.grad` ไม่ใช่ `loss`"],
          ["ค่าความชันรวม (total gradient norm) *ก่อนถูกตัด* ส่วน `.grad` ในตัวโมเดลจะถูกปรับลดลงไม่เกิน `max_norm` แบบ in-place", "ถูก — ค่าที่คืนออกมาจึงมีประโยชน์มากในการเฝ้าดูว่าโมเดลมีแนวโน้ม gradient ระเบิดหรือไม่"],
          ["ค่า `True` หรือ `False` บอกว่าถูกตัดหรือไม่", "ไม่คืน `bool` — คืน Tensor/float ของ pre-clip total norm"],
          ["จำนวนพารามิเตอร์ทั้งหมดในโมเดล", "จำนวนพารามิเตอร์ต้องนับด้วย `p.numel()`"],
        ],
        "B",
        "`clip_grad_norm_` แก้ไข `.grad` แบบ in-place ให้ขนาดรวมไม่เกิน `max_norm` และคืนค่าขนาดรวม *ก่อนตัด* ออกมาเพื่อให้เรา log และติดตามเสถียรภาพได้",
        "`clip_grad_norm_` คืนค่าอะไรกลับมา และส่งผลอย่างไรกับ `.grad` ของโมเดล?",
        "คืนค่า total gradient norm *ก่อนถูกตัด* เพื่อใช้ monitor ส่วน `.grad` ภายในโมเดลถูกย่อขนาดแบบ in-place ให้ไม่เกิน `max_norm` โดยคงทิศทางเดิม",
      ),
    ],
  },

  takeaways: [
    "เมื่อเทรน PyTorch แล้ว loss พังหรือนิ่ง อย่าเพิ่งเดาแก้สถาปัตยกรรม — ให้ตรวจ **4 บั๊กคลาสสิก** ก่อนเสมอ: Double Softmax, Learning Rate, ลืม `optimizer.zero_grad()`, และขาด `clip_grad_norm_`",
    "ใส่เกราะ {{fail-fast}} ด้วย `torch.isfinite(loss)` และบันทึก `grad_norm` เพื่อจับอาการ Exploding Loss ตั้งแต่รอบแรก ๆ",
    "แยกชุด Train/Val ให้ขาด (D42) และประเมินผลภายใน `model.eval()` + `with torch.inference_mode():` เสมอ",
    "เขียน `pytest` sanity test ที่ล็อก seed ({{reproducibility}}, D59) ตรวจ raw logits, การลู่เข้าของ loss และเพดาน gradient เพื่อให้มั่นใจว่าลูปเทรนสะอาดก่อนขยายขนาดงาน",
  ],

  reviewCards: [
    rc(
      "d064-rc-1",
      "เช็กลิสต์ 4 ข้อเวลาเจอ Exploding (`NaN`) หรือ Vanishing/Stalled Loss ใน PyTorch คืออะไร?",
      "1) `forward()` คืน raw logits (ไม่ Double Softmax), 2) มี `optimizer.zero_grad()`, 3) `lr` เหมาะสม (ไม่สูงถึง `10.0`), 4) มี `clip_grad_norm_` หลัง `backward()` ก่อน `step()`",
    ),
    rc(
      "d064-rc-2",
      "\"Overfit a Tiny Batch\" Sanity Test ใน `pytest` ตรวจอะไรบ้าง?",
      "ล็อก seed แล้วเทรนบนชุดข้อมูลเล็ก ๆ เพื่อยืนยันว่า (1) loss เป็น finite ทุกสเต็ป, (2) loss ลดลงชัดเจน, (3) gradient norm อยู่ใต้เพดานหลัง clip, และ (4) ผลลัพธ์ทำซ้ำได้เมื่อรันด้วย seed เดิม",
    ),
    rc(
      "d064-rc-3",
      "ทำไม `clip_grad_norm_(..., max_norm=1.0)` ถึงคืนค่าที่อาจมากกว่า `1.0` ออกมา?",
      "เพราะมันคืนค่า **pre-clip total gradient norm** (ขนาดความชันก่อนตัด) เพื่อใช้ติดตามเสถียรภาพ ส่วนค่า `.grad` จริงในโมเดลถูกตัดลงเหลือ `<= 1.0` แบบ in-place แล้ว",
    ),
  ],

  sources: [
    { label: "PyTorch Docs — Autograd Mechanics & Gradient Accumulation", href: "https://pytorch.org/docs/stable/notes/autograd.html" },
    { label: "PyTorch Docs — torch.nn.utils.clip_grad_norm_", href: "https://pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html" },
    { label: "PyTorch Docs — Reproducibility", href: "https://pytorch.org/docs/stable/notes/randomness.html" },
    { label: "A Recipe for Training Neural Networks (Andrej Karpathy)", href: "https://karpathy.github.io/2019/04/25/recipe/" },
  ],

  glossary: ["tensor", "autograd", "softmax", "temperature", "data-leakage", "reproducibility", "fail-fast", "pytest"],
});
