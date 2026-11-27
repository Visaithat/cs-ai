import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D062 — Phase 3 / Block B16
 * Building & Training a 2-Layer Neural Net Loop
 */
export const d062: Lesson = defineLesson({
  day: 62,
  titleTh: "สร้างและเทรนโครงข่ายประสาท 2 ชั้นด้วย nn.Module และ PyTorch Training Loop",
  tagline: "30 นาที · รันบน CPU 100% ไม่ใช้ API key · เขียน nn.Module, ลูปเทรน 5 บรรทัดทองกับ AdamW และสลับ train/eval mode",
  icon: "cpu",
  visual: {
    id: "pytorch-autograd",
    title: "2-Layer Neural Net Training Loop (nn.Module + AdamW)",
    caption: "ดูลำดับ 5 บรรทัดทองของ PyTorch loop: zero_grad → forward → loss → backward → optimizer.step()",
    alt: "แผนภาพลูปการเทรนโครงข่ายประสาท 2 ชั้นใน PyTorch",
  },
  requiresApiKey: false,
  tools: ["PyTorch", "uv", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "จัดชุดข้อมูลเป็น Mini-Batch Tensor พร้อมป้อนเข้าโมเดล",
      body: "แทนที่จะป้อนข้อมูลทีละแถวหรือยัดทั้งฐานข้อมูลทีเดียว โครงข่ายประสาทรับอินพุตเป็น {{tensor}} รูปทรง `(batch_size, num_features)` ผ่าน `TensorDataset` และ `DataLoader` เพื่อสมดุลความเร็วและความเสถียรของความชัน",
      lessonNote: "วันนี้เราจะเตรียมข้อมูลจำแนกคลาสแบบไม่เป็นเส้นตรง (non-linear) เป็น batch tensor เพื่อทดสอบโครงข่าย 2 ชั้นบน CPU",
    },
    {
      node: 2,
      heading: "ประกอบชั้นของโมเดลด้วย nn.Module และอัปเดตน้ำหนักด้วย AdamW",
      body: "เมื่อโมเดลมีพารามิเตอร์หลายพันถึงหลายล้านตัว เราไม่จัดการ `w1, b1, w2, b2` ด้วยมืออีกต่อไป แต่ห่อไว้ใน `nn.Module` แล้วปล่อยให้ {{autograd}} + `torch.optim.AdamW` ดูแลการอัปเดตทั้งหมดในลูป 5 บรรทัดมาตรฐาน",
      lessonNote: "เราจะเขียน `TwoLayerMLP(nn.Module)` ที่ประกอบด้วย `nn.Linear → nn.ReLU → nn.Linear` และเทรนด้วยลูป 5 บรรทัดทองของ PyTorch",
    },
    {
      node: 3,
      heading: "สลับโหมดประเมินผลด้วย model.eval() และ torch.inference_mode()",
      body: "ช่วงเทรนกับช่วงประเมินผลมีพฤติกรรมของเลเยอร์ต่างกัน (เช่น Dropout และ BatchNorm) และตอนประเมินผลเราไม่ต้องการกราฟ {{autograd}} จึงต้องสลับโหมดให้ถูกต้องทุกครั้ง",
      lessonNote: "เราจะเขียนฟังก์ชัน `evaluate_accuracy` ที่ใช้ `model.eval()` คู่กับ `with torch.inference_mode():` และตรวจด้วย `pytest`",
    },
    {
      node: 4,
      heading: "รูปแบบมาตรฐานเดียวกับที่ใช้เทรนและรัน Transformer / LLM",
      body: "ไม่ว่าคุณจะรันโมเดลจิ๋ว 2 ชั้นวันนี้ หรือรัน {{transformer}} ที่มี 32 ชั้นใน Phase 3–4 ทุกอย่างในระบบนิเวศ PyTorch ล้วนสืบทอด `nn.Module` และใช้รูปแบบ `eval()` + `inference_mode()` เหมือนกันหมด",
      lessonNote: "ลูปเทรนที่สะอาดและทดสอบได้ในวันนี้คือรากฐานสำหรับการเพิ่ม Loss, Temperature และ Regularization ใน Day 63",
    },
  ],

  objectives: [
    "**สร้าง** โครงข่ายประสาท 2 ชั้นโดยสืบทอด `nn.Module` (`nn.Linear`, `nn.ReLU`, `forward()`) และอธิบายได้ว่าเหตุใด activation function แบบไม่เป็นเส้นตรงจึงขาดไม่ได้",
    "**เขียน** ลูปเทรนมาตรฐาน 5 บรรทัดของ PyTorch (`zero_grad → forward → loss → backward → step`) ร่วมกับ `torch.optim.AdamW` ได้อย่างถูกต้อง",
    "**สลับ** ระหว่างโหมดเทรน (`model.train()`) และโหมดประเมินผล (`model.eval()` + `with torch.inference_mode():`) เพื่อความถูกต้องและประหยัดหน่วยความจำ",
  ],

  prerequisites: [
    "`torch.Tensor`, `requires_grad`, `loss.backward()` และ `.grad.zero_()` (Day 61)",
    "แนวคิดการจำแนกประเภทและความแม่นยำเบื้องต้น (Phase 2)",
    "Python OOP (`class`, `super().__init__()`) และ `pytest`",
    "รันได้ 100% บน CPU ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ใหม่สำหรับ Day 62 (หรือใช้สภาพแวดล้อม `torch` เดิมจาก Day 61) แล้วตรวจว่า `torch.nn` และ `torch.optim` พร้อมใช้งานบน CPU",
    commands: `uv init ai-day62 && cd ai-day62
uv add torch
uv add --dev pytest ruff
uv run python -c "import torch, torch.nn as nn; print('nn.Linear ok:', nn.Linear(2, 4))"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day62` ด้วย `uv init` (หรือใช้โปรเจกต์จาก Day 61)"],
      ["deps", "ติดตั้ง `torch`, `pytest` และ `ruff`"],
      ["verify", "รันคำสั่งสร้าง `nn.Linear(2, 4)` สำเร็จบน CPU"],
    ],
  },

  concepts: [
    {
      id: "nn-module-and-relu",
      title: "1 · สร้างโมเดลด้วย nn.Module และเหตุผลที่ต้องมี ReLU คั่นกลาง",
      paragraphs: [
        "ใน Day 61 เราสร้าง `w` กับ `b` ทีละตัว แต่ในงานจริงเราจะสร้างคลาสที่สืบทอด **`nn.Module`** โดยประกาศเลเยอร์ต่าง ๆ ใน `__init__` (หลังเรียก `super().__init__()` เสมอ!) และเขียนลำดับการไหลของข้อมูลในเมธอด **`forward(self, x)`**",
        "เมื่อประกาศ `self.fc1 = nn.Linear(in_dim, hidden_dim)` PyTorch จะลงทะเบียนน้ำหนัก `weight` และ `bias` เป็น `nn.Parameter` ให้อัตโนมัติ ทำให้ `model.parameters()` ดึงพารามิเตอร์ทุกตัวในโมเดลส่งให้ optimizer ได้ในคำสั่งเดียว — และตอนเรียกใช้งานจริงให้เรียก **`model(x)`** เสมอ (อย่าเรียก `model.forward(x)` ตรง ๆ) เพื่อให้ hook ของ PyTorch ทำงานครบ",
        "หัวใจของโครงข่าย 2 ชั้นคือฟังก์ชันไม่เป็นเส้นตรงอย่าง **`nn.ReLU()`** (`max(0, x)`) ที่คั่นระหว่าง `fc1` กับ `fc2`: หากไม่มี ReLU การคูณเมทริกซ์สองชั้นติดกัน `W2 @ (W1 @ x)` จะยุบรวมทางพีชคณิตกลายเป็นเส้นตรงชั้นเดียว `(W2 @ W1) @ x` ทำให้โมเดลไม่มีวันเรียนรู้รูปแบบที่ซับซ้อนอย่างปัญหา XOR หรือความสัมพันธ์ข้ามฟีเจอร์ได้เลย",
      ],
      analogy: "การซ้อน `nn.Linear` หลายชั้นโดยไม่ใส่ `ReLU` เหมือนการหมุนและยืดแผ่นกระดาษแบน ๆ ซ้ำหลายครั้ง — ยังไงมันก็ยังเป็นแผ่นแบนอยู่ดี แต่ `ReLU` คือการพับกระดาษ ทำให้เราสร้างรูปทรงโค้งหรือขอบเขตการตัดสินใจที่ซับซ้อนได้",
      code: {
        language: "python",
        filename: "two_layer_net.py",
        code: `import torch
import torch.nn as nn


class TwoLayerClassifier(nn.Module):
    def __init__(self, in_dim: int, hidden_dim: int, num_classes: int) -> None:
        super().__init__()
        self.fc1 = nn.Linear(in_dim, hidden_dim)
        self.act = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # คืนค่า raw logits (ยังไม่ผ่าน Softmax — จะขยายความเต็ม ๆ ใน Day 63)
        return self.fc2(self.act(self.fc1(x)))


model = TwoLayerClassifier(in_dim=4, hidden_dim=16, num_classes=3)
total_params = sum(p.numel() for p in model.parameters())
print("Total parameters:", total_params)
print("Output shape:", tuple(model(torch.randn(5, 4)).shape))`,
        caption: "`nn.Module` จัดการลงทะเบียนพารามิเตอร์ทั้งหมดให้อัตโนมัติ และคืนค่าเป็น raw logits รูปทรง `(batch_size, num_classes)`",
      },
      whyTitle: "Why this matters — ชิ้นส่วนเดียวกับ Feed-Forward Network ใน Transformer",
      whyParagraphs: [
        "โครงสร้าง `Linear → Activation → Linear` ที่คุณเขียนใน 10 บรรทัดนี้ ไม่ใช่แค่โมเดลฝึกหัด — มันคือบล็อก **MLP / Feed-Forward Network (FFN)** ที่วางซ้อนอยู่ภายในทุกชั้นของ {{transformer}} และ {{llm}} ยุคปัจจุบัน",
        "ความเข้าใจเรื่องมิติเข้า-ออก `(batch, in_dim) → (batch, hidden_dim) → (batch, out_dim)` จึงใช้ต่อยอดได้ตรง ๆ ตลอดทั้ง Phase 3",
      ],
    },
    {
      id: "five-line-training-loop",
      title: "2 · ลูปเทรน 5 บรรทัดทองของ PyTorch กับ AdamW",
      paragraphs: [
        "เมื่อมี `model`, `criterion` (ฟังก์ชันคำนวณ loss เช่น `nn.CrossEntropyLoss()`), และ `optimizer` (เช่น `torch.optim.AdamW(model.parameters(), lr=1e-2)`) ขั้นตอนการเทรน 1 batch ใน PyTorch ทั้งโลกจะยึด **5 บรรทัดทอง** ตามลำดับเป๊ะดังนี้:",
        "1) `optimizer.zero_grad(set_to_none=True)` ล้างความชันเก่าให้เกลี้ยง (ตั้ง `set_to_none=True` เร็วกว่าและประหยัดหน่วยความจำกว่าการเขียนเลข 0 ทับ), 2) `logits = model(xb)` รันขาไป, 3) `loss = criterion(logits, yb)` คำนวณความคลาดเคลื่อน, 4) `loss.backward()` ไล่ความชันด้วย {{autograd}}, และ 5) `optimizer.step()` อัปเดตน้ำหนักทั้งหมด",
        "ทำไมยุคปัจจุบันจึงนิยมใช้ **`AdamW`** แทน SGD ธรรมดา? เพราะ `AdamW` ปรับขนาดก้าวของแต่ละพารามิเตอร์ให้อัตโนมัติตามประวัติความชันที่ผ่านมา (adaptive learning rate + momentum) พร้อมแยกส่วน weight decay ออกมาอย่างถูกต้อง ทำให้ลู่เข้าเร็วและจูน `lr` ง่ายกว่า SGD มาก",
      ],
      analogy: "ถ้า Gradient Descent ด้วยมือใน Day 61 คือการขับรถเกียร์กระปุกที่ต้องเหยียบคลัตช์เปลี่ยนเกียร์เองทุกรอบ `AdamW` คือเกียร์อัตโนมัติอัจฉริยะที่ปรับอัตราทดให้แต่ละล้อตามความลาดชันของถนน ส่วน 5 บรรทัดทองคือเช็กลิสต์ก่อนออกตัวที่ไม่สลับลำดับเด็ดขาด",
      bullets: [
        "**บรรทัด 1**: `optimizer.zero_grad(set_to_none=True)` — ล้าง `.grad` จากรอบก่อน",
        "**บรรทัด 2**: `logits = model(xb)` — Forward pass",
        "**บรรทัด 3**: `loss = criterion(logits, yb)` — คำนวณ loss (สเกลาร์)",
        "**บรรทัด 4**: `loss.backward()` — Backward pass คำนวณความชันทุกพารามิเตอร์",
        "**บรรทัด 5**: `optimizer.step()` — อัปเดตพารามิเตอร์ทุกตัวใน `model.parameters()`",
      ],
      whyTitle: "Why this matters — ลำดับที่สลับกันเพียงบรรทัดเดียวพังเงียบทั้งโมเดล",
      whyParagraphs: [
        "ถ้าเผลอเรียก `optimizer.step()` ก่อน `loss.backward()` โมเดลจะอัปเดตด้วยความชันเก่า (หรือศูนย์) ถ้าเผลอลืม `zero_grad()` ความชันจะพอกพูนทุกรอบ การจำลำดับ 5 บรรทัดนี้จนขึ้นใจช่วยป้องกันบั๊กเทรนไม่ลงได้มากที่สุด",
        "ในการเทรนข้อมูลขนาดใหญ่ เราเพียงครอบ 5 บรรทัดนี้ด้วย `for xb, yb in dataloader:` เพื่อแบ่งข้อมูลเป็น mini-batch และวนซ้ำหลาย `epoch`",
      ],
    },
    {
      id: "train-eval-and-inference-mode",
      title: "3 · สลับโหมด model.train() vs model.eval() และ torch.inference_mode()",
      paragraphs: [
        "PyTorch แยกสถานะของโมเดลกับสถานะของ {{autograd}} ออกจากกันเป็น 2 สวิตช์อิสระที่มือใหม่มักสับสน: สวิตช์แรกคือ **`model.train()` / `model.eval()`** ซึ่งเปลี่ยนพฤติกรรมของเลเยอร์บางชนิด เช่น `Dropout` (สุ่มปิดโหนดตอนเทรน แต่เปิดครบ 100% ตอนประเมินผล) และ `BatchNorm` (ใช้สถิติของ batch ตอนเทรน แต่ใช้ค่าเฉลี่ยสะสมตอนประเมินผล)",
        "สวิตช์ที่สองคือ **`with torch.inference_mode():`** (รุ่นใหม่ที่เร็วกว่าและประหยัด RAM กว่า `torch.no_grad()`) ซึ่งสั่งปิดระบบติดตามกราฟ {{autograd}} ทั้งหมดชั่วคราว — โปรดจำให้แม่นว่า **`model.eval()` ไม่ได้ปิด autograd!** ถ้าเรียกแต่ `model.eval()` โดยไม่ครอบ `torch.inference_mode()` โมเดลจะยังสร้างกราฟคำนวณเปลืองหน่วยความจำตอนทำนายผล",
        "ดังนั้นกฎเหล็กก่อนประเมินผลหรือให้บริการ production คือเปิดคู่กันเสมอ: เรียก `model.eval()` แล้วครอบการทำนายด้วย `with torch.inference_mode():` และเมื่อจะกลับไปเทรนรอบถัดไป อย่าลืมเรียก `model.train()` คืนกลับมา",
      ],
      analogy: "`model.eval()` เหมือนการถอดถ่วงน้ำหนักที่ข้อเท้าออกก่อนลงสนามแข่งจริง (ปิด Dropout ให้วิ่งเต็มกำลัง) ส่วน `torch.inference_mode()` เหมือนการปิดกล้องวิดีโอที่คอยอัดภาพซ้อมไว้หลังบ้าน (ไม่ต้องเก็บกราฟคำนวณ) — วันแข่งจริงต้องทำทั้งสองอย่างคู่กัน",
      code: {
        language: "python",
        filename: "eval_mode_pattern.py",
        code: `import torch


def predict_classes(model: torch.nn.Module, x: torch.Tensor) -> torch.Tensor:
    model.eval()  # สวิตช์ที่ 1: ปิด Dropout / ล็อก BatchNorm
    with torch.inference_mode():  # สวิตช์ที่ 2: ปิด autograd ประหยัด RAM และเร็วขึ้น
        logits = model(x)
        return logits.argmax(dim=-1)`,
        caption: "รูปแบบมาตรฐานของ inference ใน PyTorch: `model.eval()` + `with torch.inference_mode():` เสมอ",
      },
      whyTitle: "Why this matters — บั๊กเงียบที่ทำคะแนน Validation แกว่งไม่นิ่ง",
      whyParagraphs: [
        "ถ้าคุณลืมเรียก `model.eval()` ตอนทำนายข้อมูลลูกค้าใน production (โดยเฉพาะเมื่อโมเดลมี Dropout) ข้อมูลชุดเดิมที่ส่งเข้ามาซ้ำ 2 ครั้งจะได้คำตอบไม่เหมือนกัน!",
        "และถ้าลืม `with torch.inference_mode():` ใน API server ที่รับ request ต่อเนื่อง หน่วยความจำจะพุ่งสูงและ latency ช้าลงโดยไม่จำเป็น",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — nn.Module ≈ Component Class และ 5-Line Loop ≈ State Update Cycle",
      body: [
        "สำหรับนักพัฒนาเว็บ/แอป `nn.Module` คล้ายคลาส Component ที่ประกาศชิ้นส่วนลูกใน constructor (`__init__`) แล้วกำหนดการไหลของข้อมูลใน `forward(x)` — การเรียก `model(x)` แทน `model.forward(x)` เหมือนการเรียก framework render wrapper แทนการเรียกเมธอดภายในตรง ๆ เพื่อไม่ให้ข้าม lifecycle hooks",
        "ส่วน `DataLoader` คือ paginated batch iterator ที่สุ่มสลับลำดับ (`shuffle=True`) ตอนเทรน และปิดสลับ (`shuffle=False`) ตอนประเมินผล",
      ],
      table: [
        ["`class Net(nn.Module)` + `forward()`", "Component class + `render()` / `transform()`"],
        ["`model.parameters()`", "DI registry ที่รวบรวม state ปรับค่าได้ทุกตัวอัตโนมัติ"],
        ["`optimizer.zero_grad()` → `step()`", "Reset dirty flags → compute diff → commit state update"],
        ["`model.eval()` + `inference_mode()`", "Read-only production mode ที่ปิด dev/training hooks"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมโจทย์ XOR ถึงเป็นบททดสอบคลาสสิกของ Neural Network",
      body: [
        "ลองวาดจุด 4 จุดบนกระดาษ: `(0,0)` กับ `(1,1)` เป็นคลาส `0` ส่วน `(0,1)` กับ `(1,0)` เป็นคลาส `1` (ตารางตรรกศาสตร์ XOR) — คุณจะไม่มีวันลากเส้นตรงแค่เส้นเดียวแยกคลาส `0` ออกจากคลาส `1` ได้เลย",
        "โมเดลเชิงเส้นชั้นเดียว (เช่น Logistic Regression พื้นฐาน) จึงได้ความแม่นยำตันอยู่ที่ 50% แต่ทันทีที่คุณใช้โครงข่าย 2 ชั้นที่มี `nn.ReLU()` คั่นกลาง ชั้นซ่อน (hidden layer) จะพับพื้นที่ 2 มิติให้แยกจุดทั้ง 4 ออกจากกันได้ 100%!",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เราจะพิสูจน์พลังของโครงข่าย 2 ชั้น (`Linear → ReLU → Linear`) บนโจทย์จำแนกคลาสแบบไม่เป็นเส้นตรง (XOR 4 มุม) ด้วย `AdamW` และลูป 5 บรรทัดทองบน CPU",
    steps: [
      {
        title: "1 · นิยาม TwoLayerMLP และตั้ง seed เพื่อ Reproducibility",
        explain: "ตั้ง `torch.manual_seed(42)` เพื่อความ {{reproducibility|ทำซ้ำได้}} สร้างข้อมูล XOR 4 จุด (ฟีเจอร์ `float32` และป้ายคลาส `long`/`int64` ตามข้อกำหนดของ `CrossEntropyLoss`) พร้อมสร้างโมเดลขนาด `2 → 16 → 2`",
        code: {
          language: "python",
          filename: "worked_day62.py",
          code: `import torch
import torch.nn as nn

torch.manual_seed(42)

X = torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]], dtype=torch.float32)
y = torch.tensor([0, 1, 1, 0], dtype=torch.long)


class TwoLayerMLP(nn.Module):
    def __init__(self, in_dim: int, hidden_dim: int, out_dim: int) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, out_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


model = TwoLayerMLP(2, 16, 2)
print(model)
print("Initial logits shape:", tuple(model(X).shape))`,
        },
        output: `TwoLayerMLP(
  (net): Sequential(
    (0): Linear(in_features=2, out_features=16, bias=True)
    (1): ReLU()
    (2): Linear(in_features=16, out_features=2, bias=True)
  )
)
Initial logits shape: (4, 2)`,
      },
      {
        title: "2 · รันลูปเทรน 5 บรรทัดทองด้วย AdamW + CrossEntropyLoss",
        explain: "ใช้ `AdamW(model.parameters(), lr=0.05)` และ `nn.CrossEntropyLoss()` เทรน 200 epochs — สังเกตว่า loss ลดจาก `~0.70` (เดาสุ่ม 2 คลาส) ลงเข้าใกล้ `0.0`",
        code: {
          language: "python",
          filename: "worked_day62.py",
          code: `criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=0.05)

model.train()
for epoch in range(1, 201):
    optimizer.zero_grad(set_to_none=True)  # 1. ล้างความชันเก่า
    logits = model(X)                       # 2. Forward
    loss = criterion(logits, y)             # 3. Loss
    loss.backward()                         # 4. Backward
    optimizer.step()                        # 5. Update weights

    if epoch in (1, 50, 100, 200):
        print(f"epoch={epoch:3d} | loss={loss.item():.4f}")`,
        },
        output: `epoch=  1 | loss=0.6987
epoch= 50 | loss=0.0894
epoch=100 | loss=0.0112
epoch=200 | loss=0.0029`,
      },
      {
        title: "3 · ประเมินผลอย่างสะอาดด้วย model.eval() + torch.inference_mode()",
        explain: "สลับโมเดลเข้าโหมด `eval()` และปิด autograd ด้วย `torch.inference_mode()` แล้วตรวจคำทำนายและค่าความน่าจะเป็นหลังผ่าน {{softmax}}",
        code: {
          language: "python",
          filename: "worked_day62.py",
          code: `model.eval()
with torch.inference_mode():
    logits = model(X)
    probs = torch.softmax(logits, dim=-1)
    preds = logits.argmax(dim=-1)
    acc = (preds == y).float().mean().item()

print("Predictions:", preds.tolist(), "| Targets:", y.tolist())
print("Class-1 probs:", [round(p, 4) for p in probs[:, 1].tolist()])
print(f"Eval accuracy: {acc * 100:.1f}% | training flag: {model.training}")`,
        },
        output: `Predictions: [0, 1, 1, 0] | Targets: [0, 1, 1, 0]
Class-1 probs: [0.0031, 0.9968, 0.9974, 0.0024]
Eval accuracy: 100.0% | training flag: False`,
      },
    ],
    gotcha: "จุดพลาดที่พบบ่อยมากใน `nn.CrossEntropyLoss()`: ป้ายคำตอบ `y` ต้องเป็น `torch.long` (`int64`) รูปทรง 1 มิติ `(batch_size,)` เช่น `[0, 1, 1, 0]` ไม่ใช่ `float32` และไม่ใช่ `(batch_size, 1)` มิฉะนั้น PyTorch จะโยน `RuntimeError` ทันที",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day62.py` ที่นิยามโครงข่ายประสาท 2 ชั้น (`TwoLayerMLP`) พร้อมฟังก์ชันเทรน 1 epoch, ฟังก์ชันประเมินความแม่นยำในโหมด inference และฟังก์ชันเทรนโจทย์ XOR ให้ผ่านครบด้วย `pytest`",
    requirements: [
      "สร้างคลาส `TwoLayerMLP(nn.Module)` ที่รับ `(in_dim: int, hidden_dim: int, out_dim: int)` โดยตรวจสอบว่าทุกมิติ `> 0` (มิฉะนั้น `raise ValueError`) ประกอบด้วย `nn.Linear(in_dim, hidden_dim)` → `nn.ReLU()` → `nn.Linear(hidden_dim, out_dim)` และคืนค่า raw logits ใน `forward(x)`",
      "สร้าง `train_epoch(model, x, y, optimizer, criterion) -> float` ที่ตั้ง `model.train()` แล้วรันลูป 5 บรรทัดทอง (`zero_grad` → `forward` → `loss` → `backward` → `step`) คืน `float(loss.item())`",
      "สร้าง `evaluate_accuracy(model, x, y) -> float` ที่ตั้ง `model.eval()` และรันภายใน `with torch.inference_mode():` คำนวณสัดส่วนที่ `logits.argmax(dim=-1) == y` คืนเป็น Python `float` ในช่วง `[0.0, 1.0]`",
      "สร้าง `train_xor_classifier(seed: int = 42, epochs: int = 250, lr: float = 0.05) -> tuple[TwoLayerMLP, float, float]` ที่ล็อก `torch.manual_seed(seed)`, เทรน `TwoLayerMLP(2, 16, 2)` ด้วย `AdamW` และ `nn.CrossEntropyLoss()`, แล้วคืน `(model, final_loss, eval_acc)` โดยให้จบในโหมด `eval()`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day62.py",
      code: `import torch
import torch.nn as nn


class TwoLayerMLP(nn.Module):
    def __init__(self, in_dim: int, hidden_dim: int, out_dim: int) -> None:
        super().__init__()
        # TODO: ตรวจว่าทุกมิติ > 0 แล้วประกาศ Linear -> ReLU -> Linear
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # TODO: ส่งผ่านทั้ง 2 ชั้นโดยคืน raw logits
        raise NotImplementedError


def train_epoch(
    model: nn.Module,
    x: torch.Tensor,
    y: torch.Tensor,
    optimizer: torch.optim.Optimizer,
    criterion: nn.Module,
) -> float:
    """รันลูปเทรนมาตรฐาน 5 บรรทัด 1 รอบ แล้วคืนค่า loss เป็น float."""
    # TODO: model.train() -> zero_grad -> forward -> loss -> backward -> step
    raise NotImplementedError


def evaluate_accuracy(model: nn.Module, x: torch.Tensor, y: torch.Tensor) -> float:
    """ประเมินความแม่นยำในโหมด eval() + inference_mode()."""
    # TODO: สลับเป็น eval(), ปิด grad, หา argmax เทียบกับ y
    raise NotImplementedError


def train_xor_classifier(
    seed: int = 42,
    epochs: int = 250,
    lr: float = 0.05,
) -> tuple[TwoLayerMLP, float, float]:
    """เทรน TwoLayerMLP บนข้อมูล XOR ด้วย AdamW + CrossEntropyLoss."""
    # TODO: ล็อก seed, สร้างข้อมูล XOR, วนเรียก train_epoch แล้วประเมินด้วย evaluate_accuracy
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day62.py",
      code: `import pytest
import torch
import torch.nn as nn
from exercise_day62 import (
    TwoLayerMLP,
    evaluate_accuracy,
    train_epoch,
    train_xor_classifier,
)


def test_two_layer_mlp_shape_and_validation():
    model = TwoLayerMLP(4, 12, 3)
    out = model(torch.randn(5, 4))
    assert out.shape == (5, 3)
    assert sum(p.numel() for p in model.parameters()) == (4 * 12 + 12) + (12 * 3 + 3)

    with pytest.raises(ValueError):
        TwoLayerMLP(0, 8, 2)
    with pytest.raises(ValueError):
        TwoLayerMLP(4, -2, 2)


def test_train_epoch_updates_weights_and_sets_train_mode():
    torch.manual_seed(0)
    model = TwoLayerMLP(2, 8, 2)
    model.eval()  # จงใจตั้งเป็น eval ก่อน เพื่อเช็กว่า train_epoch สลับกลับเป็น train()
    x = torch.tensor([[0.0, 1.0], [1.0, 0.0]])
    y = torch.tensor([1, 0], dtype=torch.long)
    before = [p.detach().clone() for p in model.parameters()]

    opt = torch.optim.AdamW(model.parameters(), lr=0.05)
    loss_val = train_epoch(model, x, y, opt, nn.CrossEntropyLoss())

    assert isinstance(loss_val, float) and loss_val > 0.0
    assert model.training is True
    assert any(not torch.equal(a, b) for a, b in zip(before, model.parameters()))


def test_evaluate_accuracy_uses_eval_mode_without_grad():
    model = TwoLayerMLP(2, 8, 2)
    model.train()
    x = torch.tensor([[0.0, 0.0], [1.0, 1.0]])
    y = torch.tensor([0, 1], dtype=torch.long)
    acc = evaluate_accuracy(model, x, y)
    assert model.training is False
    assert 0.0 <= acc <= 1.0


def test_train_xor_classifier_reaches_perfect_accuracy():
    model, final_loss, eval_acc = train_xor_classifier(seed=42, epochs=250, lr=0.05)
    assert final_loss < 0.1
    assert eval_acc == 1.0
    assert model.training is False
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases ในเวลาไม่ถึง 2 วินาที",
      "ตรวจว่าจำนวนพารามิเตอร์ของ `TwoLayerMLP(4, 12, 3)` เท่ากับ `(4*12 + 12) + (12*3 + 3) = 99` ตัว",
      "ลองเปลี่ยน `nn.ReLU()` เป็น `nn.Identity()` ชั่วคราวแล้วรันเทสต์ — สังเกตว่าโครงข่ายเชิงเส้นล้วนแก้โจทย์ XOR ไม่ได้เลย (`eval_acc < 1.0`) แล้วค่อยคืนกลับเป็น `nn.ReLU()`",
      "รัน `uv run ruff check .` แล้วไม่มี warning",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day62.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `TwoLayerMLP.__init__` อย่าลืมเรียก `super().__init__()` เป็นบรรทัดแรก และตรวจ `if in_dim <= 0 or hidden_dim <= 0 or out_dim <= 0: raise ValueError(...)`",
      },
      {
        body: "ใน `train_epoch` ลำดับคือ `model.train()` → `optimizer.zero_grad(set_to_none=True)` → `logits = model(x)` → `loss = criterion(logits, y)` → `loss.backward()` → `optimizer.step()` → `return float(loss.item())`",
      },
      {
        body: "โครงของ `TwoLayerMLP` และ `evaluate_accuracy` — เติม `train_epoch` และ `train_xor_classifier` ให้ครบแล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_day62.py",
          code: `import torch
import torch.nn as nn


class TwoLayerMLP(nn.Module):
    def __init__(self, in_dim: int, hidden_dim: int, out_dim: int) -> None:
        super().__init__()
        if in_dim <= 0 or hidden_dim <= 0 or out_dim <= 0:
            raise ValueError("All layer dimensions must be positive")
        self.fc1 = nn.Linear(in_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, out_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.fc2(self.relu(self.fc1(x)))


def evaluate_accuracy(model: nn.Module, x: torch.Tensor, y: torch.Tensor) -> float:
    model.eval()
    with torch.inference_mode():
        preds = model(x).argmax(dim=-1)
        return float((preds == y).float().mean().item())`,
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
      title: "ลืมเรียก `super().__init__()` ในคลาสลูกของ `nn.Module`",
      symptom: "PyTorch โยน `AttributeError: cannot assign module before Module.__init__() call` ทันทีที่ประกาศ `self.fc1 = nn.Linear(...)`",
      fix: "เรียก `super().__init__()` เป็นบรรทัดแรกใน `__init__` ของทุกคลาสที่สืบทอด `nn.Module` เสมอ",
    },
    {
      title: "เรียก `model.forward(x)` แทน `model(x)`",
      symptom: "forward hooks, backward hooks และกลไกภายในบางอย่างของ PyTorch ไม่ทำงานตามที่คาด",
      fix: "เรียก `model(x)` ผ่าน `__call__` เสมอ เพื่อให้ PyTorch จัดการ hooks ก่อนและหลัง `forward` อย่างครบถ้วน",
    },
    {
      title: "คิดว่าเรียก `model.eval()` อย่างเดียวก็ปิด Autograd แล้ว",
      symptom: "ตอนรันประเมินผลหรือเสิร์ฟ API หน่วยความจำ RAM/VRAM ยังพุ่งขึ้นเรื่อย ๆ และช้ากว่าปกติ",
      fix: "ใช้ `model.eval()` คู่กับ `with torch.inference_mode():` เสมอ — ทั้งสองตัวทำหน้าที่คนละอย่างกัน",
    },
    {
      title: "วาง `nn.Linear` สองชั้นติดกันโดยลืมใส่ Activation Function",
      symptom: "เพิ่มจำนวน hidden units เท่าไร โมเดลก็ยังแก้ข้อมูลที่ไม่เป็นเส้นตรงอย่าง XOR ไม่ได้",
      fix: "คั่นระหว่างชั้นเชิงเส้นด้วย non-linear activation เช่น `nn.ReLU()` หรือ `nn.GELU()` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d062-q1",
        "เหตุใดโครงข่าย 2 ชั้นจึงต้องมี `nn.ReLU()` (หรือ activation แบบไม่เป็นเส้นตรงอื่น) คั่นระหว่าง `nn.Linear` ชั้นที่ 1 และชั้นที่ 2?",
        [
          ["เพราะ PyTorch ไม่อนุญาตให้วาง `nn.Linear` สองตัวติดกันใน `nn.Sequential`", "PyTorch ยอมให้วางติดกันได้โดยไม่ error แต่ประสิทธิภาพจะตัน"],
          ["เพราะหากไม่มี non-linearity การซ้อนชั้นเชิงเส้นหลายชั้นจะยุบทางคณิตศาสตร์เหลือเท่ากับสมการเส้นตรงชั้นเดียว", "ถูก — `W2 @ (W1 @ x) = (W2 @ W1) @ x` จึงไม่สามารถเรียนรู้ขอบเขตตัดสินใจแบบไม่เป็นเส้นตรงได้"],
          ["เพื่อแปลง raw logits ให้กลายเป็นความน่าจะเป็นที่รวมกันได้ 1", "นั่นคือหน้าที่ของ Softmax ไม่ใช่ ReLU"],
          ["เพื่อปิดการทำงานของ autograd ในชั้นที่ 1", "ReLU ยังส่งผ่านความชันได้ตามปกติสำหรับค่าที่เป็นบวก"],
        ],
        "B",
        "หากไม่มีฟังก์ชันไม่เป็นเส้นตรงคั่นกลาง การคูณเมทริกซ์หลายชั้นจะยุบรวมเป็นฟังก์ชันเชิงเส้นเพียงชั้นเดียว ทำให้ความลึกของโครงข่ายไร้ประโยชน์",
        "ทำไม Neural Network ต้องมี non-linear activation อย่าง ReLU คั่นระหว่างชั้น Linear?",
        "เพราะถ้าไม่มี การซ้อนชั้น Linear หลายชั้นจะยุบรวมเป็นสมการเชิงเส้นชั้นเดียวและไม่สามารถเรียนรู้รูปแบบที่ไม่เป็นเส้นตรง (เช่น XOR) ได้",
      ),
      mc(
        "d062-q2",
        "ลำดับ 5 บรรทัดทองของ PyTorch Training Loop 1 สเต็ปข้อใดถูกต้อง?",
        [
          ["`forward → backward → step → zero_grad → loss`", "ผิดลำดับ — จะคำนวณ `backward()` ก่อนหา `loss` ไม่ได้"],
          ["`zero_grad → forward → loss → backward → step`", "ถูก — ล้างความชันเก่า → รันโมเดล → หา loss → ไล่ความชันย้อนกลับ → อัปเดตน้ำหนัก"],
          ["`forward → loss → step → backward → zero_grad`", "ผิด — เรียก `step()` ก่อน `backward()` ทำให้ยังไม่มีความชันใหม่ให้อัปเดต"],
          ["`zero_grad → step → forward → loss → backward`", "ผิด — `step()` ถูกเรียกตอนความชันเพิ่งถูกล้างเป็นศูนย์"],
        ],
        "B",
        "ลำดับมาตรฐานที่ปลอดภัยที่สุดคือ `optimizer.zero_grad(set_to_none=True)` → `logits = model(x)` → `loss = criterion(logits, y)` → `loss.backward()` → `optimizer.step()`",
        "5 บรรทัดทองของ PyTorch Training Loop เรียงลำดับอย่างไร?",
        "`optimizer.zero_grad()` → `logits = model(x)` → `loss = criterion(logits, y)` → `loss.backward()` → `optimizer.step()`",
      ),
      mc(
        "d062-q3",
        "ข้อใดกล่าวถึงความแตกต่างระหว่าง `model.eval()` กับ `with torch.inference_mode():` ได้ถูกต้องที่สุด?",
        [
          ["ทั้งสองคำสั่งทำหน้าที่เหมือนกันเป๊ะ เลือกใช้อย่างใดอย่างหนึ่งก็พอ", "ไม่จริง — มันเป็นสวิตช์คนละตัว ต้องใช้คู่กัน"],
          ["`model.eval()` เปลี่ยนพฤติกรรมเลเยอร์อย่าง Dropout/BatchNorm ส่วน `torch.inference_mode()` ปิดการบันทึกกราฟ autograd เพื่อความเร็วและประหยัดหน่วยความจำ", "ถูก — จึงต้องเปิดทั้งสองอย่างคู่กันตอนประเมินผลหรือ inference จริง"],
          ["`model.eval()` ใช้เฉพาะบน CPU ส่วน `torch.inference_mode()` ใช้เฉพาะบน GPU", "ทั้งสองคำสั่งใช้ได้ทั้งบน CPU และ GPU"],
          ["`torch.inference_mode()` จะลบน้ำหนักทั้งหมดของโมเดลหลังรันเสร็จ", "ไม่จริง — มันแค่งดสร้างกราฟ autograd ชั่วคราว ไม่ได้แตะน้ำหนักโมเดล"],
        ],
        "B",
        "`model.eval()` ควบคุมโหมดของเลเยอร์ (เช่นปิด Dropout) แต่ไม่ได้ปิด autograd จึงต้องครอบด้วย `with torch.inference_mode():` คู่กันทุกครั้งที่ทำนายผล",
        "ทำไมตอน inference ต้องใช้ทั้ง `model.eval()` และ `with torch.inference_mode():` คู่กัน?",
        "`model.eval()` ปิดพฤติกรรมเฉพาะช่วงเทรนอย่าง Dropout/BatchNorm ส่วน `torch.inference_mode()` ปิด autograd ช่วยประหยัดหน่วยความจำและเร็วขึ้น",
      ),
      mc(
        "d062-q4",
        "เมื่อสร้างคลาส `MyNet(nn.Module)` และกำหนดเมธอด `forward(self, x)` แล้ว ตอนรันโมเดลควรเรียกด้วยวิธีใด?",
        [
          ["`MyNet.forward(x)`", "ผิด — `forward` เป็น instance method ต้องเรียกผ่านอ็อบเจกต์โมเดล"],
          ["`model.forward(x)` เพื่อให้ข้ามโค้ดภายในของ PyTorch", "ไม่แนะนำ — การเรียกตรง ๆ จะข้าม forward/backward hooks ของ PyTorch"],
          ["`model(x)` เพื่อให้ผ่าน `__call__` ของ `nn.Module` ซึ่งจะเรียก hooks และ `forward(x)` ให้อย่างครบถ้วน", "ถูก — นี่คือวิธีมาตรฐานของ PyTorch ทุกเวอร์ชัน"],
          ["`model.predict(x)` เหมือน scikit-learn", "`nn.Module` ของ PyTorch ไม่มีเมธอด `.predict()` ในตัว"],
        ],
        "C",
        "ใน PyTorch ต้องเรียก `model(x)` เสมอ (ไม่ใช่ `model.forward(x)`) เพื่อให้ระบบ hooks และการจัดการภายในของ `nn.Module` ทำงานครบถ้วน",
        "ทำไมควรเรียก `model(x)` แทน `model.forward(x)`?",
        "เพราะ `model(x)` เรียกผ่าน `nn.Module.__call__` ซึ่งรัน forward/backward hooks ที่ลงทะเบียนไว้ครบถ้วนก่อนและหลังเรียก `forward(x)`",
      ),
    ],
  },

  takeaways: [
    "สืบทอด `nn.Module` โดยเรียก `super().__init__()` เสมอ คั่นชั้น `nn.Linear` ด้วย non-linearity อย่าง `nn.ReLU()` และเรียกใช้งานผ่าน `model(x)` แทน `model.forward(x)`",
    "ยึด **5 บรรทัดทอง** ของ PyTorch Training Loop: `optimizer.zero_grad(set_to_none=True)` → `logits = model(xb)` → `loss = criterion(logits, yb)` → `loss.backward()` → `optimizer.step()`",
    "ใช้ `torch.optim.AdamW` เป็นค่าเริ่มต้นที่เชื่อถือได้สำหรับการเทรนโครงข่ายประสาทส่วนใหญ่",
    "ตอนประเมินผลหรือรันจริงต้องใช้ **`model.eval()` คู่กับ `with torch.inference_mode():`** เสมอ และสลับกลับเป็น `model.train()` เมื่อเริ่มเทรนรอบใหม่",
  ],

  reviewCards: [
    rc(
      "d062-rc-1",
      "5 บรรทัดทองใน PyTorch Training Loop มีอะไรบ้างตามลำดับ?",
      "1) `optimizer.zero_grad(set_to_none=True)` → 2) `logits = model(xb)` → 3) `loss = criterion(logits, yb)` → 4) `loss.backward()` → 5) `optimizer.step()`",
    ),
    rc(
      "d062-rc-2",
      "ความต่างระหว่าง `model.eval()` กับ `with torch.inference_mode():` คืออะไร?",
      "`model.eval()` เปลี่ยนพฤติกรรมเลเยอร์ (เช่นปิด Dropout / ใช้ running stats ใน BatchNorm) ส่วน `torch.inference_mode()` ปิดการบันทึกกราฟ autograd — ต้องใช้คู่กันตอนประเมินผล",
    ),
    rc(
      "d062-rc-3",
      "ถ้าตัด `nn.ReLU()` ออกจาก `TwoLayerMLP` จะเกิดผลอย่างไร?",
      "ชั้น `nn.Linear` สองชั้นจะยุบรวมเป็นสมการเชิงเส้นชั้นเดียว โมเดลจะไม่สามารถเรียนรู้ข้อมูลที่ไม่เป็นเส้นตรงอย่าง XOR ได้",
    ),
  ],

  sources: [
    { label: "PyTorch Docs — Build the Neural Network (nn.Module)", href: "https://pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html" },
    { label: "PyTorch Docs — Optimizing Model Parameters", href: "https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html" },
    { label: "PyTorch Docs — torch.optim.AdamW", href: "https://pytorch.org/docs/stable/generated/torch.optim.AdamW.html" },
    { label: "PyTorch Docs — torch.inference_mode", href: "https://pytorch.org/docs/stable/generated/torch.inference_mode.html" },
  ],

  glossary: ["tensor", "autograd", "softmax", "reproducibility", "transformer", "llm", "pytest", "uv"],
});
