import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D061 — Phase 3 / Block B16
 * Tensors, Autograd & Gradient Descent in PyTorch
 */
export const d061: Lesson = defineLesson({
  day: 61,
  titleTh: "พื้นฐาน PyTorch: Tensors, Autograd และ Gradient Descent",
  tagline: "30 นาที · รันบน CPU 100% ไม่ใช้ API key · สร้าง Tensor, แกะรอย Autograd และเขียน Gradient Descent ด้วยมือ",
  icon: "brain",
  visual: {
    id: "pytorch-autograd",
    title: "PyTorch Autograd & Training Step — Forward → Loss → Backward → Step",
    caption: "กดเดินทีละขั้นเพื่อดูการไหลของ Tensor, การคำนวณความชันย้อนกลับ และเหตุผลที่ต้องเรียก zero_grad()",
    alt: "แผนภาพกราฟคำนวณ PyTorch Autograd และขั้นตอน Gradient Descent",
  },
  requiresApiKey: false,
  tools: ["PyTorch", "uv", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "แทนข้อมูลทุกชนิดด้วย Tensor ที่มี shape, dtype และ device ชัดเจน",
      body: "ไม่ว่าจะเป็นฟีเจอร์ตาราง ภาพ หรือเวกเตอร์ข้อความภาษาไทย โครงข่ายประสาทรับข้อมูลเป็น {{tensor}} ที่กำหนดชนิดตัวเลข (`float32`) และอุปกรณ์ประมวลผล (`cpu` หรือ `cuda`) อย่างแม่นยำ",
      lessonNote: "วันนี้เราจะฝึกตรวจสอบ `shape`, `dtype`, `device` และการคูณเมทริกซ์ใน PyTorch เพื่อป้องกันบั๊กมิติไม่ตรงตั้งแต่ด่านแรก",
    },
    {
      node: 2,
      heading: "Autograd คำนวณความชันอัตโนมัติให้โมเดลปรับน้ำหนักเองได้",
      body: "หัวใจที่ทำให้ Deep Learning และ {{llm}} เรียนรู้พารามิเตอร์นับล้านถึงพันล้านตัวได้คือ {{autograd}} ซึ่งบันทึกกราฟการคำนวณตอน forward แล้วไล่หาอนุพันธ์ย้อนกลับเมื่อเรียก `loss.backward()`",
      lessonNote: "เราจะลงมือเขียน Gradient Descent ด้วยมือ (ยังไม่ใช้ `nn.Module` หรือ optimizer) เพื่อเห็นชัดว่า `requires_grad`, `torch.no_grad()` และ `.grad.zero_()` ทำงานประสานกันอย่างไร",
    },
    {
      node: 3,
      heading: "วัดความคลาดเคลื่อนด้วย Loss และตรวจความเสถียรของ Gradient",
      body: "ค่า Loss อย่าง MSE (ญาติเดียวกับ {{mae-rmse}} ใน Phase 2) บอกว่าโมเดลทายเพี้ยนแค่ไหน ส่วน `.grad` บอกทิศทางที่ต้องขยับพารามิเตอร์เพื่อลดความคลาดเคลื่อนนั้น",
      lessonNote: "เราจะเขียน `pytest` ตรวจว่า gradient ที่ PyTorch คำนวณตรงกับสูตรอนุพันธ์จริง และตรวจว่า loss ลดลงต่อเนื่องเมื่อฝึกด้วย Gradient Descent",
    },
    {
      node: 5,
      heading: "ปูฐานความเข้าใจก่อนต่อยอดสู่ Transformer และ Fine-Tuning",
      body: "เมื่อขึ้นระบบจริงหรือทำ Fine-Tuning ในช่วงปลาย Phase 3 อาการอย่าง memory leak จากการเก็บกราฟค้างไว้ หรือ gradient สะสมผิดพลาด ล้วนแก้ได้เร็วถ้าเข้าใจกลไก {{autograd}} วันนี้",
      lessonNote: "การแยก `loss.item()` ออกจากกราฟและการล้าง `.grad` ทุกสเต็ปคือวินัยพื้นฐานของวิศวกร PyTorch",
    },
  ],

  objectives: [
    "**สร้างและตรวจสอบ** `torch.Tensor` (`shape`, `dtype`, `device`) รวมถึงแปลงข้อมูลระหว่าง Python list / NumPy กับ PyTorch `float32` ได้อย่างถูกต้อง",
    "**อธิบายและใช้งาน** {{autograd}} (`requires_grad=True`, `loss.backward()`, `.grad`, `.item()`) เพื่อคำนวณความชันของฟังก์ชันสูญเสียอัตโนมัติ",
    "**เขียน** ลูป Gradient Descent ด้วยมือภายใน `with torch.no_grad():` พร้อมเรียก `.grad.zero_()` ทุกสเต็ป และอธิบายผลเสียหากลืมล้าง gradient",
  ],

  prerequisites: [
    "Vectors, {{dot-product}} และ Matrix Multiplication พื้นฐานด้วย NumPy (Day 37)",
    "แนวคิดความคลาดเคลื่อน MSE / {{mae-rmse}} จาก Phase 2 (Day 46)",
    "Python พื้นฐาน, {{uv}} และ `pytest` (Phase 1)",
    "รันได้ 100% บน CPU ของเครื่องคุณ ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์เบา ๆ ด้วย `uv` และติดตั้ง `torch` (เวอร์ชัน CPU ใช้งานได้ทันทีบน macOS, Windows และ Linux โดยไม่ต้องตั้งค่า CUDA)",
    commands: `uv init ai-day61 && cd ai-day61
uv add torch
uv add --dev pytest ruff
uv run python -c "import torch; print('PyTorch:', torch.__version__, '| CPU ok:', torch.tensor([1.0]).device)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์โปรเจกต์ `ai-day61` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `torch`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน PyTorch บน CPU แล้วไม่พบ error"],
    ],
    note: "บน Linux หากต้องการดาวน์โหลดเฉพาะล้อ PyTorch รุ่น CPU ที่ไฟล์เล็กลงมาก สามารถใช้ `--index-url https://download.pytorch.org/whl/cpu` ได้ ส่วนบน Windows/macOS `uv add torch` ทำงานบน CPU ได้ทันที",
  },

  concepts: [
    {
      id: "torch-tensor-basics",
      title: "1 · torch.Tensor — อาเรย์หลายมิติที่มี shape, dtype และ device",
      paragraphs: [
        "ถ้าคุณคุ้นเคยกับ `np.ndarray` จาก Phase 2 แล้ว {{tensor}} ของ PyTorch คือญาติสนิทที่เพิ่มความสามารถสำคัญ 2 อย่างเข้ามา: (1) ย้ายไปรันบน GPU/Accelerator ได้ และ (2) รองรับการติดตามความชันอัตโนมัติ ({{autograd}})",
        "คุณสมบัติ 3 อย่างที่ต้องเช็กเป็นนิสัยทุกครั้งที่เจอ error คือ **`shape`** (ขนาดแต่ละมิติ เช่น `(32, 4)`), **`dtype`** (ชนิดตัวเลข — Deep Learning ใช้ `torch.float32` เป็นมาตรฐานเพื่อประหยัดหน่วยความจำและเร็วกว่า `float64` ของ NumPy), และ **`device`** (`cpu`, `cuda`, หรือ `mps`)",
        "การคำนวณเชิงเส้นอย่าง {{dot-product}} (`a @ b`), element-wise operations และ broadcasting ทำงานเหมือน NumPy แทบทุกประการ แต่ต้องระวังเรื่องชนิดข้อมูล: ถ้าส่ง `int64` เข้าฟังก์ชันที่ต้องการทศนิยม หรือคูณ `float32` กับ `float64` ข้ามกัน PyTorch จะโยน `RuntimeError` ทันที",
      ],
      analogy: "เหมือนตาราง Excel ที่ทุกเซลล์ต้องเป็นชนิดข้อมูลเดียวกันทั้งชีต (`dtype`), มีจำนวนแถว-คอลัมน์แน่นอน (`shape`), และระบุได้ว่าชีตนี้อยู่บนโต๊ะทำงานไหน (`cpu` หรือ `gpu`) — จะจับสองชีตมาบวกกันต้องวางอยู่โต๊ะเดียวกันและชนิดเลขตรงกัน",
      code: {
        language: "python",
        filename: "tensor_basics.py",
        code: `import torch

# กำหนด dtype=torch.float32 อย่างชัดเจน (มาตรฐานของ PyTorch)
x = torch.tensor([[1.0, 2.0], [3.0, 4.0]], dtype=torch.float32)
w = torch.tensor([[0.5], [-1.0]], dtype=torch.float32)

y = x @ w  # matrix multiplication: (2, 2) @ (2, 1) -> (2, 1)
print("shape:", tuple(y.shape), "| dtype:", y.dtype, "| device:", y.device)
print("result:\n", y)`,
        caption: "เช็ก `shape`, `dtype` และ `device` เสมอเมื่อดีบัก PyTorch — กว่าครึ่งของบั๊กมือใหม่มาจาก shape หรือ dtype ไม่ตรงกัน",
      },
      whyTitle: "Why this matters — float32 คือภาษาหลักของ Neural Networks",
      whyParagraphs: [
        "NumPy สร้างเลขทศนิยมเป็น `float64` โดยค่าเริ่มต้น แต่ PyTorch สร้างเป็น `float32` เพราะโมเดลประสาทมีพารามิเตอร์นับล้านตัว การใช้ `float32` ลดขนาดหน่วยความจำลงครึ่งหนึ่งและคำนวณเร็วกว่ามากโดยความแม่นยำไม่ตก",
        "เวลาคุณดึงข้อมูลจาก NumPy/Polars เข้า PyTorch ด้วย `torch.as_tensor(arr, dtype=torch.float32)` การระบุ `dtype=torch.float32` ชัดเจนตั้งแต่ต้นจะช่วยกัน error เรื่อง `Double` vs `Float` ได้เกือบหมด",
      ],
    },
    {
      id: "autograd-computational-graph",
      title: "2 · Autograd — บันทึกกราฟตอน Forward แล้วไล่ความชันตอน Backward",
      paragraphs: [
        "เมื่อคุณสร้าง {{tensor}} พารามิเตอร์โดยตั้ง `requires_grad=True` PyTorch จะเปิดโหมด **{{autograd}}** บันทึกทุกการคำนวณที่เกิดขึ้นกับเทนเซอร์นั้นลงใน **Dynamic Computational Graph** (กราฟที่สร้างใหม่ทุกครั้งที่รัน forward)",
        "เมื่อคำนวณจนได้ค่า loss ที่เป็นสเกลาร์ตัวเดียวแล้วเรียก `loss.backward()` PyTorch จะใช้กฎลูกโซ่ (Chain Rule) ไล่ย้อนกลับจากปลายกราฟไปหาทุกพารามิเตอร์ที่เป็นใบไม้ (leaf tensor) แล้วเก็บค่าอนุพันธ์ไว้ในแอตทริบิวต์ **`.grad`** ของแต่ละตัว",
        "ข้อสำคัญมากเรื่องหน่วยความจำ: หากคุณต้องการเก็บค่า loss ไปบันทึก log หรือใส่ `list` เพื่อพล็อตกราฟ ให้เรียก **`loss.item()`** เพื่อดึงเป็น Python `float` ธรรมดา ห้ามเก็บอ็อบเจกต์ `loss` ทั้งก้อนใส่ลิสต์ เพราะมันจะตรึงกราฟคำนวณทั้งรอบไว้ใน RAM ไม่ยอมคืนหน่วยความจำ",
      ],
      analogy: "เหมือนการเดินป่าพร้อมโปรยเศษขนมปังไว้ตามทาง (Forward pass) — พอถึงจุดหมายแล้วอยากรู้ว่าต้องหันกลับไปแก้ตรงไหน (Backward pass) แค่เดินย้อนรอยเศษขนมปังกลับมาทุกแยก ก็จะรู้ทันทีว่าแต่ละก้าวส่งผลต่อปลายทางเท่าไร",
      code: {
        language: "python",
        filename: "autograd_demo.py",
        code: `import torch

w = torch.tensor(2.0, requires_grad=True)
x = torch.tensor(3.0)
y_true = torch.tensor(10.0)

y_pred = w * x                # 2.0 * 3.0 = 6.0
loss = (y_pred - y_true) ** 2  # (6.0 - 10.0)^2 = 16.0
loss.backward()

# d(loss)/dw = 2 * (w*x - y_true) * x = 2 * (-4) * 3 = -24.0
print("loss:", loss.item(), "| w.grad:", w.grad.item())`,
        caption: "PyTorch คำนวณอนุพันธ์ `d(loss)/dw = -24.0` ให้อัตโนมัติตรงกับแคลคูลัสเป๊ะ โดยเราไม่ต้องเขียนสูตรอนุพันธ์เอง",
      },
      whyTitle: "Why this matters — ไม่ต้องดิฟมือเวลาโมเดลมี 100 ชั้น",
      whyParagraphs: [
        "กับสมการเส้นตรง 1 ตัวแปรเราดิฟมือได้ง่าย แต่ใน {{transformer}} หรือโครงข่ายหลายชั้นที่มีทั้งคูณเมทริกซ์, ReLU, LayerNorm และ Softmax ซ้อนกัน การเขียนอนุพันธ์เองแทบเป็นไปไม่ได้และผิดพลาดง่ายมาก",
        "{{autograd}} ช่วยให้วิศวกรโฟกัสที่การออกแบบการคำนวณขาไป (forward) ส่วนขากลับ (backward) PyTorch จัดการให้อย่างแม่นยำและเร็วระดับ C++/CUDA",
      ],
    },
    {
      id: "manual-gradient-descent",
      title: "3 · Gradient Descent ด้วยมือ, torch.no_grad() และกับดักลืม zero_grad()",
      paragraphs: [
        "ค่า `w.grad` บอกทิศทางที่ทำให้ loss **เพิ่มขึ้น** ดังนั้นถ้าอยากให้ loss **ลดลง** เราต้องขยับพารามิเตอร์ไปในทิศตรงข้ามทีละก้าวเล็ก ๆ ด้วยอัตราการเรียนรู้ `lr` (learning rate): **`w -= lr * w.grad`**",
        "แต่การอัปเดตพารามิเตอร์ด้วยมือมีกฎเหล็ก 2 ข้อที่ห้ามพลาดเด็ดขาด: ข้อแรก ต้องหุ้มบรรทัด `w -= lr * w.grad` ไว้ใน **`with torch.no_grad():`** เพราะการปรับน้ำหนักไม่ใช่งานส่วนหนึ่งของสมการโมเดล หากไม่ปิด autograd PyTorch จะโยน `RuntimeError` (ห้ามแก้ leaf tensor ที่ต้องใช้ grad แบบ in-place) หรือสร้างกราฟซ้อนไม่รู้จบ",
        "ข้อสอง **PyTorch สะสมค่า `.grad` แบบบวกทับ (accumulate) โดยตั้งใจ** ทุกครั้งที่เรียก `loss.backward()` มันจะนำความชันรอบใหม่ไป *บวกเพิ่ม* เข้ากับ `.grad` เดิม ไม่ได้เขียนทับ! หากคุณลืมเรียก **`w.grad.zero_()`** หลังจบแต่ละสเต็ป ความชันเก่าจากหลายรอบก่อนจะทับถมกันจนพารามิเตอร์กระโดดมั่วหรือระเบิดเป็น `NaN`",
      ],
      analogy: "เหมือนนักปีนเขาที่เดินลงหุบเขาตอนหมอกลง: คุณวัดความลาดชันใต้เท้า (`backward()`), ก้าวลงไป 1 ก้าวโดยไม่จดบันทึกการก้าวเป็นแผนที่ใหม่ (`torch.no_grad()`), แล้วรีเซ็ตเข็มวัดความชันเป็นศูนย์ก่อนก้าวถัดไป (`grad.zero_()`) — ถ้าไม่รีเซ็ต เข็มจะบวกความชันเก่าสะสมจนพาคุณวิ่งพุ่งตกเหว",
      bullets: [
        "**`with torch.no_grad():`**: ปิดการสร้างกราฟชั่วคราวตอนอัปเดตน้ำหนัก `w -= lr * w.grad` และตอน inference",
        "**`w.grad.zero_()`**: ล้างค่าความชันสะสมให้เป็น `0` ก่อนเริ่มสเต็ปถัดไปเสมอ (เหตุผลที่ PyTorch ออกแบบให้สะสมไว้ก็เพื่อรองรับเทคนิค gradient accumulation ตอนเทรนโมเดลใหญ่)",
        "**`torch.manual_seed(42)`**: ล็อกตัวสุ่มเพื่อให้ผลลัพธ์การทดลองมีความ {{reproducibility|ทำซ้ำได้}} เหมือนกันทุกเครื่อง",
      ],
      whyTitle: "Why this matters — เบื้องหลังทุก Optimizer ในโลก Deep Learning",
      whyParagraphs: [
        "ในวันพรุ่งนี้ (Day 62) เราจะเปลี่ยนไปใช้ `optimizer.step()` และ `optimizer.zero_grad()` ซึ่งช่วยลดโค้ดซ้ำซ้อน แต่สิ่งที่อยู่ข้างใต้คือ 3 ขั้นตอนวันนี้เป๊ะ: `backward()` → อัปเดตใน `no_grad()` → ล้าง `.grad`",
        "คนที่เคยเขียนลูปมือวันนี้จะเข้าใจทันทีใน Day 64 ว่าทำไมการลืม `optimizer.zero_grad()` ถึงทำให้ loss แกว่งและระเบิดเป็น `NaN` ได้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — มอง Tensor เป็น TypedArray และ Autograd เป็น Reactive Dependency Graph",
      body: [
        "ถ้าคุณมาจากฝั่ง JavaScript/TypeScript ให้มอง `torch.Tensor` เป็น `Float32Array` หลายมิติที่ย้ายไปรันบน GPU ได้ ส่วน `autograd` คล้ายระบบ Reactivity อย่าง Signals / Vue / MobX ที่แอบจดว่าค่าปลายทาง (`loss`) ผูกอยู่กับตัวแปรต้นทาง (`w`, `b`) ตัวไหนบ้าง",
        "ดังนั้น `with torch.no_grad():` ก็เหมือน `untrack(() => ...)` ในระบบ Signals ที่บอกว่า \"อัปเดตค่านี้ได้เลย ไม่ต้องจด dependency เพิ่ม\" ส่วน `w.grad.zero_()` คือการล้าง accumulator ก่อนเริ่ม tick ถัดไป",
      ],
      table: [
        ["`torch.Tensor` (`float32`)", "`Float32Array` หลายมิติที่รองรับการคูณเมทริกซ์และ GPU"],
        ["`requires_grad=True` + `backward()`", "Reactive dependency graph ที่คำนวณอนุพันธ์ย้อนกลับได้"],
        ["`with torch.no_grad():`", "`untrack()` — แก้ค่าโดยไม่บันทึกเข้า dependency graph"],
        ["`w.grad.zero_()`", "ล้าง accumulator buffer ก่อนเริ่มรอบคำนวณใหม่"],
      ],
    },
    student: {
      title: "First-Year Note — Gradient Descent ไม่ต้องจำสูตรแคลคูลัสยาว ๆ",
      body: [
        "หลายคนเห็นคำว่า *อนุพันธ์ย่อย (Partial Derivative)* แล้วตกใจ แต่ภาพจริงง่ายมาก: `w.grad` คือ **ความชันของภูเขา Loss** ตรงจุดที่พารามิเตอร์ `w` ยืนอยู่ ถ้าความชันเป็นบวกแปลว่าเดินไปทางขวาแล้วภูเขาสูงขึ้น เราเลยต้องลบออก (`w -= lr * grad`) เพื่อเดินลงทางซ้าย",
        "ขนาดก้าว `lr` (learning rate) ต้องพอดี: เล็กไปก็เดินลงช้ามาก ใหญ่ไปก็ก้าวข้ามก้นหลุมไปเด้งขึ้นอีกฝั่งจน loss พุ่งสูงกว่าเดิม (ซึ่งเราจะได้ทดลองดีบักเต็ม ๆ ใน Day 64)",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: เราต้องการสอนโมเดลเส้นตรงจิ๋วใน PyTorch ให้เรียนรู้สูตรค่าจัดส่งพัสดุไทย `fee = 25 + 8 * distance_km` จากข้อมูลตัวอย่าง โดยลงมือเช็ก Tensor, ทดสอบกับดักลืม `zero_()`, และเขียน Gradient Descent loop ด้วยมือ",
    steps: [
      {
        title: "1 · สร้างข้อมูล Tensor พร้อมเช็ก shape, dtype และ device",
        explain: "เตรียมระยะทาง `x` (กิโลเมตร) และค่าจัดส่ง `y` (บาท) เป็น `torch.float32` พร้อมตรวจสอบคุณสมบัติพื้นฐานก่อนเริ่มคำนวณ",
        code: {
          language: "python",
          filename: "worked_day61.py",
          code: `import torch

x = torch.tensor([1.0, 2.0, 4.0, 5.0, 8.0], dtype=torch.float32)
y = torch.tensor([33.0, 41.0, 57.0, 65.0, 89.0], dtype=torch.float32)  # 25 + 8*x

print("x shape:", tuple(x.shape), "| dtype:", x.dtype, "| device:", x.device)
print("dot product x·y:", (x @ y).item())`,
        },
        output: `x shape: (5,) | dtype: torch.float32 | device: cpu
dot product x·y: 1380.0`,
      },
      {
        title: "2 · พิสูจน์กับดักการสะสม .grad เมื่อเรียก backward() ซ้ำโดยไม่ล้าง",
        explain: "ลองคำนวณ `loss.backward()` สองครั้งติดกันโดยไม่เรียก `w.grad.zero_()` จะเห็นว่า `w.grad` เพิ่มเป็น 2 เท่าทันที — นี่คือเหตุผลที่ต้องล้างความชันทุกรอบ",
        code: {
          language: "python",
          filename: "worked_day61.py",
          code: `w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

for step in range(1, 3):
    pred = w * x + b
    loss = ((pred - y) ** 2).mean()
    loss.backward()
    print(f"Call {step} (NO zero_): loss={loss.item():.2f}, w.grad={w.grad.item():.2f}, b.grad={b.grad.item():.2f}")

# ล้าง gradient ให้สะอาดก่อนเริ่มเทรนจริง
w.grad.zero_()
b.grad.zero_()
print("After zero_(): w.grad =", w.grad.item(), "| b.grad =", b.grad.item())`,
        },
        output: `Call 1 (NO zero_): loss=3633.00, w.grad=-552.00, b.grad=-114.00
Call 2 (NO zero_): loss=3633.00, w.grad=-1104.00, b.grad=-228.00
After zero_(): w.grad = 0.0 | b.grad = 0.0`,
      },
      {
        title: "3 · เขียนลูป Gradient Descent ด้วยมือใน torch.no_grad() จนลู่เข้าสูตรจริง",
        explain: "รัน 300 สเต็ปด้วย `lr = 0.02` อัปเดต `w` และ `b` ภายใต้ `with torch.no_grad():` แล้วล้าง `.grad.zero_()` ทุกครั้ง — จะเห็นค่า `w` เข้าใกล้ `8.0` และ `b` เข้าใกล้ `25.0` อย่างสวยงาม",
        code: {
          language: "python",
          filename: "worked_day61.py",
          code: `w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)
lr = 0.02

for step in range(1, 301):
    pred = w * x + b
    loss = ((pred - y) ** 2).mean()
    loss.backward()

    with torch.no_grad():
        w -= lr * w.grad
        b -= lr * b.grad

    w.grad.zero_()
    b.grad.zero_()

    if step in (1, 50, 150, 300):
        print(f"step={step:3d} | loss={loss.item():8.4f} | w={w.item():.3f} | b={b.item():.3f}")`,
        },
        output: `step=  1 | loss=3633.0000 | w=11.040 | b=2.280
step= 50 | loss= 102.9871 | w=10.352 | b=11.737
step=150 | loss=  12.1425 | w=8.807 | b=20.445
step=300 | loss=   0.4892 | w=8.162 | b=24.086`,
      },
    ],
    gotcha: "ห้ามเขียน `w = w - lr * w.grad` แม้จะอยู่ใน `with torch.no_grad():` เพราะการกำหนดค่าใหม่ (`w = ...`) จะสร้างเทนเซอร์ใหม่ที่ `requires_grad=False` แทนตัวเดิม! ให้ใช้ in-place `w -= lr * w.grad` (หรือ `w.sub_(lr * w.grad)`) ภายใน `with torch.no_grad():` เสมอ",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day61.py` ที่มีฟังก์ชันพื้นฐานของ PyTorch 3 ตัว: ตัวตรวจสอบ Tensor, ตัวคำนวณ MSE gradient ด้วย Autograd และตัวเทรนสมการเส้นตรงด้วย Manual Gradient Descent",
    requirements: [
      "`inspect_tensor(t: torch.Tensor) -> dict[str, object]` คืน dict ที่มีคีย์ `\"shape\"` (`tuple[int, ...]`), `\"dtype\"` (`str(t.dtype)`), `\"device\"` (`str(t.device)`), และ `\"requires_grad\"` (`bool(t.requires_grad)`)",
      "`compute_mse_gradients(x: torch.Tensor, y: torch.Tensor, w_init: float, b_init: float) -> tuple[float, float, float]` คำนวณ `pred = w * x + b` และ `loss = ((pred - y) ** 2).mean()` ด้วย `autograd` โดยบังคับ `x`, `y` เป็น `torch.float32` แล้วคืน `(loss_val, dw, db)` เป็น Python `float`",
      "`fit_linear_gd(x: torch.Tensor, y: torch.Tensor, lr: float = 0.02, steps: int = 300) -> tuple[float, float, list[float]]` เริ่มจาก `w = 0.0`, `b = 0.0` (`requires_grad=True`) เทรนด้วย manual gradient descent ใน `with torch.no_grad():` พร้อม `.grad.zero_()` ทุกสเต็ป เก็บ `loss.item()` ลง `loss_history` แล้วคืน `(w_val, b_val, loss_history)`",
      "ใน `fit_linear_gd` หาก `lr <= 0` หรือ `steps <= 0` หรือ `x.shape != y.shape` ให้ `raise ValueError`",
      "รันผ่าน 100% บน CPU ด้วย `uv run pytest -q` โดยไม่สร้าง tensor ที่ค้างกราฟไว้ใน `loss_history`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day61.py",
      code: `import torch


def inspect_tensor(t: torch.Tensor) -> dict[str, object]:
    """คืนข้อมูล shape, dtype, device และ requires_grad ของ Tensor."""
    # TODO: คืน dict ตามสเปก
    raise NotImplementedError


def compute_mse_gradients(
    x: torch.Tensor,
    y: torch.Tensor,
    w_init: float,
    b_init: float,
) -> tuple[float, float, float]:
    """คำนวณ MSE loss และอนุพันธ์ (dw, db) ด้วย PyTorch autograd."""
    # TODO: แปลง x, y เป็น float32, สร้าง w/b ที่ requires_grad=True, เรียก backward() แล้วคืน float
    raise NotImplementedError


def fit_linear_gd(
    x: torch.Tensor,
    y: torch.Tensor,
    lr: float = 0.02,
    steps: int = 300,
) -> tuple[float, float, list[float]]:
    """เทรนโมเดลเส้นตรง y = w*x + b ด้วย manual gradient descent."""
    # TODO: ตรวจเงื่อนไข input, วนลูป forward -> backward -> no_grad update -> zero_()
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day61.py",
      code: `import math
import pytest
import torch
from exercise_day61 import compute_mse_gradients, fit_linear_gd, inspect_tensor


def test_inspect_tensor_metadata():
    t = torch.zeros((2, 3), dtype=torch.float32, requires_grad=True)
    info = inspect_tensor(t)
    assert info == {
        "shape": (2, 3),
        "dtype": "torch.float32",
        "device": "cpu",
        "requires_grad": True,
    }


def test_compute_mse_gradients_matches_calculus():
    x = torch.tensor([1.0, 2.0, 3.0])
    y = torch.tensor([5.0, 8.0, 11.0])  # true: w=3, b=2
    loss_val, dw, db = compute_mse_gradients(x, y, w_init=1.0, b_init=0.0)
    # pred = [1, 2, 3], err = [-4, -6, -8], mse = (16+36+64)/3 = 38.6667
    assert math.isclose(loss_val, 116.0 / 3.0, rel_tol=1e-5)
    # dw = mean(2 * err * x) = 2 * (-4*1 - 6*2 - 8*3) / 3 = -80/3
    assert math.isclose(dw, -80.0 / 3.0, rel_tol=1e-5)
    # db = mean(2 * err) = 2 * (-18) / 3 = -12.0
    assert math.isclose(db, -12.0, rel_tol=1e-5)


def test_fit_linear_gd_converges_cleanly():
    x = torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0])
    y = 3.0 * x + 5.0
    w_val, b_val, history = fit_linear_gd(x, y, lr=0.05, steps=400)
    assert len(history) == 400
    assert all(isinstance(v, float) and math.isfinite(v) for v in history)
    assert history[-1] < 1e-3
    assert math.isclose(w_val, 3.0, abs_tol=0.05)
    assert math.isclose(b_val, 5.0, abs_tol=0.1)


def test_fit_linear_gd_validates_inputs():
    x = torch.tensor([1.0, 2.0])
    y = torch.tensor([3.0, 4.0])
    with pytest.raises(ValueError):
        fit_linear_gd(x, y, lr=0.0, steps=10)
    with pytest.raises(ValueError):
        fit_linear_gd(x, y, lr=0.01, steps=0)
    with pytest.raises(ValueError):
        fit_linear_gd(x, torch.tensor([1.0, 2.0, 3.0]), lr=0.01, steps=10)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases บน CPU",
      "ลองคอมเมนต์บรรทัด `w.grad.zero_()` ออกชั่วคราวแล้วรันเทสต์ — สังเกตว่า `test_fit_linear_gd_converges_cleanly` พังทันที (loss แกว่งหรือกลายเป็น `NaN`) แล้วค่อยนำกลับมาใส่เหมือนเดิม",
      "ตรวจว่า `loss_history` เก็บเฉพาะ Python `float` (`loss.item()`) ไม่ใช่ `torch.Tensor`",
      "รัน `uv run ruff check .` แล้วไม่มี lint error",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day61.py` ด้วย `uv run pytest -q` และไม่มีคำเตือนจาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `compute_mse_gradients` ให้แปลงอินพุตด้วย `x_f = x.to(dtype=torch.float32)` และสร้าง `w = torch.tensor(float(w_init), dtype=torch.float32, requires_grad=True)` ก่อนคำนวณแล้วเรียก `loss.backward()`",
      },
      {
        body: "ใน `fit_linear_gd` ใช้ `with torch.no_grad():` ครอบ `w -= lr * w.grad` และ `b -= lr * b.grad` แล้วอย่าลืมเรียก `w.grad.zero_()` และ `b.grad.zero_()` ท้ายทุก iteration",
      },
      {
        body: "ตัวอย่างโครงฟังก์ชัน `fit_linear_gd` เกือบสมบูรณ์ — เหลือให้คุณเติม `inspect_tensor` และ `compute_mse_gradients` เอง",
        code: {
          language: "python",
          filename: "hint_day61.py",
          code: `import torch


def fit_linear_gd(
    x: torch.Tensor,
    y: torch.Tensor,
    lr: float = 0.02,
    steps: int = 300,
) -> tuple[float, float, list[float]]:
    if lr <= 0 or steps <= 0 or x.shape != y.shape:
        raise ValueError("lr > 0, steps > 0, and matching shapes required")
    xf = x.to(dtype=torch.float32)
    yf = y.to(dtype=torch.float32)
    w = torch.tensor(0.0, dtype=torch.float32, requires_grad=True)
    b = torch.tensor(0.0, dtype=torch.float32, requires_grad=True)
    history: list[float] = []

    for _ in range(steps):
        loss = ((w * xf + b) - yf).pow(2).mean()
        history.append(float(loss.item()))
        loss.backward()
        with torch.no_grad():
            w -= lr * w.grad
            b -= lr * b.grad
        w.grad.zero_()
        b.grad.zero_()

    return float(w.item()), float(b.item()), history`,
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
      title: "ลืมเรียก .grad.zero_() หลังอัปเดตน้ำหนัก",
      symptom: "ช่วงแรก loss เหมือนจะลดแต่ไม่กี่สเต็ปก็เริ่มแกว่งแรงหรือพุ่งเป็น `NaN` เพราะ `.grad` บวกทบกันทุกรอบ",
      fix: "ล้างความชันด้วย `w.grad.zero_()` (หรือ `optimizer.zero_grad()` ใน Day 62) ทุกครั้งหลังอัปเดตพารามิเตอร์เสร็จ",
    },
    {
      title: "อัปเดตพารามิเตอร์ด้วย `w = w - lr * w.grad` แทน `w -= lr * w.grad` ใน `torch.no_grad()`",
      symptom: "รอบถัดไป `w.grad` กลายเป็น `None` หรือ PyTorch ฟ้องว่าเทนเซอร์ไม่มี `requires_grad=True`",
      fix: "ใช้การอัปเดตแบบ in-place `w -= lr * w.grad` ภายใต้ `with torch.no_grad():` เพื่อคงอ็อบเจกต์ leaf tensor เดิมที่เปิด `requires_grad=True` ไว้",
    },
    {
      title: "เก็บอ็อบเจกต์ `loss` ตรง ๆ ลงใน list แทน `loss.item()`",
      symptom: "เทรนไปหลายพันสเต็ปแล้ว RAM/VRAM โตขึ้นเรื่อย ๆ จนเครื่องอืดหรือ Out-Of-Memory",
      fix: "เรียก `loss.item()` (หรือ `loss.detach().cpu()`) เสมอก่อนเก็บค่าลง log หรือ list เพื่อให้ Python ปล่อยกราฟคำนวณทิ้งทันที",
    },
    {
      title: "ปล่อยให้ข้อมูลจาก NumPy เป็น `float64` แล้วมาคูณกับ `float32` ของ PyTorch",
      symptom: "เจอ `RuntimeError: expected scalar type Float but found Double` ตอนคูณเมทริกซ์",
      fix: "แปลงอินพุตด้วย `torch.as_tensor(arr, dtype=torch.float32)` ตั้งแต่ด่านโหลดข้อมูล",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d061-q1",
        "หากคุณเรียก `loss.backward()` สองครั้งติดต่อกันใน PyTorch โดยไม่ได้เรียก `w.grad.zero_()` คั่นกลาง จะเกิดอะไรขึ้นกับค่า `w.grad`?",
        [
          ["PyTorch จะเขียนทับค่า `w.grad` ด้วยความชันของรอบล่าสุดโดยอัตโนมัติ", "ไม่จริง — PyTorch ออกแบบให้สะสม (accumulate) ความชัน ไม่ใช่เขียนทับ"],
          ["PyTorch จะนำความชันรอบใหม่ไปบวกสะสมเข้ากับค่า `w.grad` เดิม ทำให้ความชันใหญ่ขึ้นผิดปกติ", "ถูก — นี่คือเหตุผลที่ต้องล้างความชันด้วย `.grad.zero_()` ทุกสเต็ปของ Gradient Descent"],
          ["PyTorch จะโยน `ZeroDivisionError` ทันที", "ไม่โยน error นี้ — มันบวกสะสมให้เงียบ ๆ ทำให้ดีบักยากถ้าไม่รู้พฤติกรรมนี้"],
          ["ค่า `w.grad` จะถูกรีเซ็ตเป็น `None` อัตโนมัติหลัง `backward()`", "ไม่ใช่ — `.grad` ยังคงอยู่จนกว่าคุณจะสั่งล้างเอง"],
        ],
        "B",
        "PyTorch สะสมค่าอนุพันธ์ลงใน `.grad` แบบบวกเพิ่มทุกครั้งที่เรียก `backward()` เพื่อให้รองรับ gradient accumulation ดังนั้นในลูปเทรนปกติต้องล้าง `.grad` ทุกรอบ",
        "ทำไมต้องเรียก `.grad.zero_()` ทุกสเต็ปใน PyTorch?",
        "เพราะ `loss.backward()` จะบวกความชันใหม่สะสมทับ `.grad` เดิม หากไม่ล้างความชันเก่าจะค้างและทำให้การอัปเดตพารามิเตอร์ผิดเพี้ยนหรือระเบิด",
      ),
      mc(
        "d061-q2",
        "เหตุใดขั้นตอนอัปเดตน้ำหนัก `w -= lr * w.grad` ด้วยมือจึงต้องอยู่ภายใน `with torch.no_grad():`?",
        [
          ["เพื่อให้ PyTorch เปลี่ยนไปใช้ CPU แทน GPU", "`torch.no_grad()` ไม่ได้เปลี่ยนอุปกรณ์ประมวลผล มันควบคุมเฉพาะการบันทึกกราฟ autograd"],
          ["เพราะการอัปเดตพารามิเตอร์ไม่ควรถูกบันทึกเข้ากราฟคำนวณ autograd และ PyTorch ห้ามแก้ leaf tensor ที่เปิด grad แบบ in-place ขณะ tracking", "ถูก — `no_grad()` ปิดการสร้างกราฟชั่วคราวขณะขยับค่าน้ำหนัก ทำให้ปลอดภัยและประหยัดหน่วยความจำ"],
          ["เพื่อทำให้ `w.grad` กลายเป็นศูนย์โดยอัตโนมัติ", "`no_grad()` ไม่ได้ล้าง `.grad` คุณยังต้องเรียก `.grad.zero_()` แยกต่างหาก"],
          ["เพื่อให้ `loss` เปลี่ยนชนิดจาก `float32` เป็น `float64`", "ไม่เกี่ยวกัน — `no_grad()` ไม่เปลี่ยน `dtype` ของเทนเซอร์"],
        ],
        "B",
        "การอัปเดตพารามิเตอร์อยู่นอกสมการ forward ของโมเดล จึงต้องปิด autograd ด้วย `with torch.no_grad():` เพื่อไม่ให้เกิด RuntimeError หรือสร้างกราฟซ้อน",
        "ทำไมตอนอัปเดตน้ำหนักด้วยมือต้องใช้ `with torch.no_grad():`?",
        "เพื่อปิดการบันทึกกราฟ autograd ชั่วคราวตอนแก้ค่า leaf tensor แบบ in-place (`w -= lr * w.grad`) ไม่ให้เกิด RuntimeError หรือเปลืองหน่วยความจำ",
      ),
      mc(
        "d061-q3",
        "ถ้าคุณเขียน `loss_history.append(loss)` แทน `loss_history.append(loss.item())` ในลูปเทรน 10,000 สเต็ป จะเกิดปัญหาใด?",
        [
          ["ค่า loss ที่เก็บได้จะผิดเพี้ยนจากความจริง", "ตัวเลขเท่ากัน แต่ปัญหาคือหน่วยความจำ"],
          ["Python จะกอด computational graph ของทุกสเต็ปไว้ในหน่วยความจำ ทำให้เกิด memory leak", "ถูก — เพราะ `loss` ยังอ้างอิงถึงกราฟ autograd ทั้งหมด การเรียก `.item()` จะดึงเฉพาะ Python float ออกมาแล้วปล่อยกราฟทิ้งได้"],
          ["PyTorch จะหยุดคำนวณ `backward()` ตั้งแต่สเต็ปที่ 2", "โค้ดยังรันต่อได้ปกติจนกว่าหน่วยความจำจะเต็ม"],
          ["`pytest` จะไม่สามารถอ่านค่าจาก `list` ได้", "`list` ยังอ่านได้แต่จะกิน RAM มหาศาล"],
        ],
        "B",
        "อ็อบเจกต์ `loss` (ที่ `requires_grad=True`) เก็บ reference ไปยังกราฟ autograd ของรอบนั้นทั้งหมด การเก็บไว้ใน list โดยไม่เรียก `.item()` จึงทำให้หน่วยความจำไม่ถูกคืน",
        "ทำไมควรเก็บ `loss.item()` ลง list แทนการเก็บ `loss` ตรง ๆ?",
        "เพราะ `loss` เก็บ reference ของ computational graph ทั้งรอบไว้ด้วย การใช้ `.item()` จะดึงเฉพาะ Python float ออกมาป้องกัน memory leak",
      ),
      mc(
        "d061-q4",
        "ข้อใดคือชุดคุณสมบัติพื้นฐาน 3 อย่างที่ควรเช็กก่อนเพื่อนเมื่อเจอ error จาก `torch.Tensor`?",
        [
          ["`url`, `timeout`, `status_code`", "นั่นคือคุณสมบัติของ HTTP request จาก `httpx`"],
          ["`shape`, `dtype`, `device`", "ถูก — มิติไม่ตรง (`shape`), `float32` vs `float64` (`dtype`), หรือ `cpu` vs `cuda` (`device`) คือต้นเหตุหลักของ error ใน PyTorch"],
          ["`columns`, `index`, `parquet`", "นั่นคือคุณสมบัติของ DataFrame ใน Polars/Pandas"],
          ["`temperature`, `top_k`, `seed`", "นั่นคือพารามิเตอร์ตอนสุ่มคำตอบของ LLM"],
        ],
        "B",
        "การตรวจ `t.shape`, `t.dtype` และ `t.device` ช่วยจับบั๊กส่วนใหญ่ของ PyTorch ได้ภายในไม่กี่วินาที",
        "คุณสมบัติ 3 อย่างของ `torch.Tensor` ที่ควรเช็กทันทีเมื่อเจอ error คืออะไร?",
        "`shape` (ขนาดมิติ), `dtype` (ชนิดตัวเลข เช่น `torch.float32`), และ `device` (เช่น `cpu` หรือ `cuda`)",
      ),
    ],
  },

  takeaways: [
    "เช็ก `shape`, `dtype` (`torch.float32`) และ `device` ของ {{tensor}} ให้ติดเป็นนิสัยเพื่อตัดบั๊กมิติและชนิดตัวเลขตั้งแต่ต้น",
    "{{autograd}} บันทึกกราฟคำนวณตอน forward สำหรับเทนเซอร์ที่ตั้ง `requires_grad=True` และคำนวณอนุพันธ์ทั้งหมดเก็บใน `.grad` เมื่อเรียก `loss.backward()`",
    "ในการทำ Gradient Descent ด้วยมือ ต้องอัปเดตพารามิเตอร์แบบ in-place (`w -= lr * w.grad`) ภายใน `with torch.no_grad():` และเรียก `.grad.zero_()` ทุกสเต็ปเพื่อไม่ให้ความชันสะสมทับกัน",
    "ดึงค่า scalar ด้วย `loss.item()` เสมอก่อนเก็บเข้า log หรือ list เพื่อป้องกัน memory leak จากการตรึง computational graph ไว้ใน RAM",
  ],

  reviewCards: [
    rc(
      "d061-rc-1",
      "ลำดับ 4 ขั้นตอนของ Manual Gradient Descent 1 สเต็ปใน PyTorch คืออะไร?",
      "1) Forward หา `loss` → 2) `loss.backward()` หาความชัน → 3) อัปเดต `w -= lr * w.grad` ใน `with torch.no_grad():` → 4) ล้าง `w.grad.zero_()`",
    ),
    rc(
      "d061-rc-2",
      "ทำไม PyTorch ถึงออกแบบให้ `loss.backward()` บวกสะสมลงใน `.grad` แทนการเขียนทับ?",
      "เพื่อรองรับ Gradient Accumulation (รวมความชันจากหลาย micro-batch ก่อนอัปเดตน้ำหนัก) แต่หมายความว่าในลูปปกติเราต้องเรียก `.grad.zero_()` เองทุกสเต็ป",
    ),
    rc(
      "d061-rc-3",
      "ต่างกันอย่างไรระหว่างเก็บ `loss` กับเก็บ `loss.item()` ใส่ list ระหว่างเทรน?",
      "`loss` เป็น Tensor ที่ผูกกับ computational graph ทั้งรอบ (เก็บไว้จะกิน RAM/VRAM จน leak) ส่วน `loss.item()` เป็น Python `float` ธรรมดาที่ปล่อยกราฟทิ้งได้ทันที",
    ),
  ],

  sources: [
    { label: "PyTorch Docs — Tensors Tutorial", href: "https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html" },
    { label: "PyTorch Docs — A Gentle Introduction to torch.autograd", href: "https://pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html" },
    { label: "PyTorch Docs — Locally Disabling Gradient Computation (no_grad)", href: "https://pytorch.org/docs/stable/notes/autograd.html" },
    { label: "PyTorch Docs — Reproducibility Guide", href: "https://pytorch.org/docs/stable/notes/randomness.html" },
  ],

  glossary: ["tensor", "autograd", "dot-product", "mae-rmse", "reproducibility", "pytest", "uv"],
});
