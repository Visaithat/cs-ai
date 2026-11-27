import type { Lesson, LessonVisualId } from "../types";
import { defineLesson, mc, rc } from "./builder";

export const d145: Lesson = defineLesson({
  day: 145,
  titleTh: "คุ้มไหมถ้าโฮสต์ LLM เองด้วย vLLM",
  tagline: "30 นาที · อ่าน benchmark แล้วหาจุดคุ้มทุนระหว่าง GPU-hour กับค่า API ต่อ token",
  icon: "cpu",
  visual: {
    id: "vllm-paged-attention" as LessonVisualId,
    title: "PagedAttention และต้นทุน GPU ต่อเดือน",
    caption: "ติดตาม KV blocks ของแต่ละคำขอ แล้วใช้ throughput ที่ยังผ่านเพดาน TTFT มาประกอบการคำนวณต้นทุน",
    alt: "คำขอสองรายการมี block table แยกกัน โดยบล็อกจริงอยู่คนละตำแหน่งในหน่วยความจำ GPU และ scheduler รับคำขอใหม่เมื่อคิวมีที่ว่าง",
  },
  requiresApiKey: false,
  apiKeyNote: "อ่าน benchmark จำลองและคำนวณด้วย Python ในเครื่อง ใช้ CPU และไม่มีการเรียก vLLM server",
  tools: [
    "Python 3.12",
    "uv",
    "Pydantic v2",
    "pytest",
    "vLLM benchmark (อ่านผลจำลอง)",
    "Decimal",
  ],

  bigPicture: [
    {
      node: 0,
      heading: "ตั้งโจทย์ก่อนเช่า GPU",
      body: "หลัง D144 เรามี staging ของ Thai Knowledge RAG แล้ว ทีมศูนย์บริการมหาวิทยาลัยอยากรู้ว่าควรจ่าย API ตามการใช้งานหรือเช่า GPU เปิดทั้งเดือน",
      lessonNote: "กำหนดปริมาณคำขอและเพดานเวลาถึง token แรกก่อนเทียบค่าใช้จ่าย",
    },
    {
      node: 2,
      heading: "เสิร์ฟโมเดลด้วย vLLM",
      body: "{{vllm}} จัดสรร KV cache เป็นบล็อกตามจำนวน token ที่เพิ่มขึ้น และจัด batch ให้เปลี่ยนสมาชิกระหว่างการสร้างคำตอบ",
      lessonNote: "แยกหน่วยความจำของน้ำหนักโมเดลออกจาก KV cache ที่โตตาม token ของคำขอที่ยังทำงาน",
    },
    {
      node: 3,
      heading: "วัดภายใต้เงื่อนไขเดียวกัน",
      body: "benchmark ต้องใช้รุ่นโมเดล ความยาว input/output และรูปแบบการส่งโหลดที่เทียบกันได้",
      lessonNote: "อ่าน completed RPS คู่กับ p95 TTFT และจำนวนคำขอที่ล้มเหลว ก่อนเลือก config",
    },
    {
      node: 5,
      heading: "เทียบค่าใช้จ่ายและตัดสินใจ",
      body: "นำราคาสมมติและ peak RPS จาก trace มาตัดสินว่าจะอยู่กับ API หรือทดสอบ deployment แบบเช่า GPU ต่อ",
      lessonNote: "บันทึกสมมติฐานกับผลวัดไว้กับแผนส่งมอบ Evaluated & Guarded AI Microservice เวอร์ชัน v0.5.0 ใน D156",
    },
  ],
  objectives: [
    "อธิบายความสัมพันธ์ระหว่าง KV cache, PagedAttention และ continuous batching ขณะตอบผู้ใช้หลายคน",
    "อ่าน completed request throughput, p95 TTFT และ error count โดยเทียบกับโหลดเป้าหมาย",
    "คำนวณจุดคุ้มทุนเป็นจำนวนคำขอต่อเดือนด้วยราคา input/output ต่อหนึ่งล้าน token และราคา GPU ต่อชั่วโมง",
  ],
  prerequisites: [
    "D79 เคยจัด prompt prefix ให้ใช้ {{prompt-caching}} และเลือกขนาดโมเดลตามงาน",
    "D83–D84 เคยทดลอง Ollama และ {{quantization}} กับงานภาษาไทย",
    "D73 เคยวัด {{ttft}} ของ streaming และ D144 เคยตรวจ staging กับ trace",
  ],

  setup: {
    intro: "สร้างไฟล์ inference_economics_demo.py จากตัวอย่างสามขั้น หัวข้อนี้ใช้ตัวเลข benchmark สมมติแทน GPU จริง",
    commands: "uv python install 3.12\nuv run --python 3.12 --with pydantic --with pytest python inference_economics_demo.py",
    steps: [
      ["env", "ใช้ uv เลือก Python 3.12 และติดตั้ง Pydantic v2 กับ pytest ในสภาพแวดล้อมชั่วคราว"],
      ["read", "ดูคอลัมน์ completed RPS, p95 TTFT และ errors ของตารางจำลองก่อนรัน"],
      ["run", "รันตัวอย่าง แล้วลองเปลี่ยนราคา GPU หรือ peak RPS ทีละค่า"],
    ],
    note: "กรณีเปิด GPU ตลอด 30 วันคิด 720 ชั่วโมงต่อ replica ตัวเลขราคาในบทเป็นสมมติฐานสำหรับฝึกคำนวณ",
  },

  concepts: [
    {
      id: "kv-pages",
      title: "KV cache กับการจัดสรรเป็นหน้า",
      paragraphs: [
        "ตอน prefill โมเดลอ่าน input และสร้าง key/value สำหรับ attention ของ token ที่อ่านไปแล้ว ตอน decode มันนำ key/value ที่เก็บไว้มาช่วยสร้าง token ถัดไปและเพิ่มรายการใหม่เข้า cache",
        "PagedAttention ใช้ block table จับคู่บล็อกตามลำดับ token กับตำแหน่งจริงใน GPU หน่วยความจำจริงของลำดับเดียวกันจึงกระจายได้ บล็อกสุดท้ายอาจเหลือช่องว่างตามขนาดบล็อก",
        "ตัวอย่างสมมติใช้บล็อกละ 16 token คำขอขนาด 17 token ต้องการสองบล็อก คำขอขนาด 32 token ก็ใช้สองบล็อกแต่ใช้ช่องครบ ชุดตัวเลขนี้ใช้อธิบายวิธีนับและไม่ใช่การตั้งค่าบังคับของ vLLM",
      ],
      analogy: "เหมือนชั้นเก็บแฟ้มที่ใช้สารบัญบอกตำแหน่ง คนละคำขอมีสารบัญของตนเอง",
      code: {
        language: "python",
        filename: "inference_economics_kv_pages.py",
        code: `from math import ceil


def block_usage(token_count: int, block_size: int) -> tuple[int, int]:
    count = ceil(token_count / block_size)
    unused_slots = count * block_size - token_count
    return count, unused_slots


for n in (17, 32, 33):
    print(n, block_usage(n, 16))
# 17 (2, 15)
# 32 (2, 0)
# 33 (3, 15)`,
      },
      whyTitle: "หน่วยความจำที่เห็นใน trace",
      whyParagraphs: [
        "จำนวน token ของ prompt และคำตอบที่กำลังสร้างมีผลต่อจำนวนช่องที่ต้องใช้ เมื่อใช้บล็อกให้คืนได้ตามวงจรชีวิตของคำขอ ระบบใช้หน่วยความจำร่วมกันได้ยืดหยุ่นขึ้น",
        "D79 เน้น reuse ส่วนต้นของ prompt ส่วนการจัดวาง KV blocks ในบทนี้ช่วยจัดหน่วยความจำของคำขอที่กำลังเสิร์ฟ ทั้งสองเรื่องอาจเกี่ยวกันใน prefix caching ของ engine",
      ],
    },
    {
      id: "batch-quant",
      title: "Continuous batching และ quantization",
      paragraphs: [
        "ถ้าใช้ batch แบบรอทุกคำขอจบ ผู้ใช้ที่ขอคำตอบสั้นอาจว่างก่อนเพื่อนหลายรอบ Continuous batching เปิดให้ scheduler จัดสมาชิกใหม่ระหว่างรอบ decode ตามงบ token และพื้นที่ KV ที่เหลือ",
        "สมมติว่ามีสองช่องในแบบจำลอง คำขอ ก ใช้หนึ่งรอบ ข ใช้สามรอบ พอ ก เสร็จ ค เข้ารอบถัดไปได้ การจัดคิวจริงยังต้องคิดงาน prefill และข้อจำกัดของเครื่องด้วย",
        "ต่อยอดจาก D83: quantization ลดบิตที่ใช้แทนน้ำหนัก ขนาดน้ำหนักที่ลดลงอาจเหลือ VRAM ให้ KV cache เพิ่ม ส่วน dtype ของ KV cache มีการตั้งค่าแยก ต้องวัดทั้งคุณภาพและ latency บนฮาร์ดแวร์จริง",
      ],
      analogy: "เหมือนให้ผู้ใช้รายถัดไปเข้าช่องบริการทันทีที่ช่องหนึ่งว่าง",
      code: {
        language: "python",
        filename: "inference_economics_batch_quant.py",
        code: `active = {"A": 1, "B": 3}
waiting = [("C", 2)]

for tick in range(1, 4):
    print(tick, list(active))
    active = {key: left - 1 for key, left in active.items() if left > 1}
    if len(active) < 2 and waiting:
        key, left = waiting.pop(0)
        active[key] = left

# 1 ['A', 'B']
# 2 ['B', 'C']
# 3 ['B', 'C']`,
      },
      whyTitle: "วัดโมเดลที่ quantize กับภาษาไทย",
      whyParagraphs: [
        "ตัวอย่าง weights ดิบ 7 พันล้านพารามิเตอร์: 16 บิตใช้ 14 GB, 8 บิตใช้ 7 GB, 4 บิตใช้ 3.5 GB (1 GB = 10^9 ไบต์) ก่อนรวม quantization metadata, KV cache และ workspace",
        "น้ำหนักที่เล็กลงช่วยด้านพื้นที่ แต่ throughput จริงขึ้นกับ kernel, GPU และรูปทรงโหลด เก็บชื่อรุ่นและ precision ไว้กับผลวัดเพื่อเปรียบเทียบได้",
        "ทวนเคสตัวเลขไทยและ citation จาก D125 ก่อนอนุมัติรุ่น quantized โดยเฉพาะคำถามที่การตอบผิดกระทบผู้ใช้",
      ],
    },
    {
      id: "bench-read",
      title: "อ่าน benchmark ที่มี SLO",
      paragraphs: [
        "completed RPS เป็นคำขอสำเร็จต่อวินาที ส่วน output tokens ต่อวินาทีบอกปริมาณ decode ตัวเลขทั้งสองเทียบกันได้เมื่อรู้สัดส่วนความยาวคำตอบ",
        "p95 TTFT เป็นเวลาที่เวลาถึง token แรกของคำขอส่วนใหญ่ไม่เกิน ใช้คู่กับ latency จนจบคำตอบและ error rate หากต้องวัดประสบการณ์จริง",
        "บันทึก hardware, รุ่นโมเดล, concurrency, อัตราขาเข้า, การอุ่นเครื่อง และการใช้ prefix cache ในรอบ benchmark เพื่อให้ผลที่นำมาเทียบตอบคำถามเดียวกัน",
      ],
      analogy: "เหมือนดูทั้งจำนวนคิวที่ร้านทำเสร็จและเวลาที่ลูกค้ารออาหารจานแรก",
      code: {
        language: "python",
        filename: "inference_economics_bench_read.py",
        code: `target_rps = 1.5
slo_ms = 500
rows = [
    ("baseline", 1.1, 480, 0),
    ("paged", 1.8, 430, 0),
    ("overloaded", 2.3, 920, 12),
]

for name, completed_rps, p95_ttft, failures in rows:
    meets_slo = completed_rps >= target_rps and p95_ttft <= slo_ms
    print(name, meets_slo and failures == 0)

# baseline False
# paged True
# overloaded False`,
      },
      whyTitle: "throughput สูงสุดอาจเกินงบเวลา",
      whyParagraphs: [
        "แถว overloaded ทำงานสำเร็จได้มากต่อวินาที แต่ p95 เกิน 500 มิลลิวินาทีและพบ error จึงใช้แถวนั้นทำ capacity commitment ไม่ได้",
        "ตารางจำลองใช้เพดาน 500 มิลลิวินาที โหลด 1.5 RPS และ error ศูนย์ เมื่อใช้งานจริงให้ระบุช่วงเวลาวัดและเกณฑ์ tail latency ที่ทีมรับได้",
      ],
    },
    {
      id: "break-even",
      title: "จุดคุ้มทุน GPU-hour กับ token",
      paragraphs: [
        "ราคา API ต่อคำขอเท่ากับจำนวน token ฝั่ง input คูณราคาฝั่ง input บวกจำนวน token ฝั่ง output คูณราคาฝั่ง output แล้วหารหนึ่งล้าน",
        "ค่าคงที่ของโฮสต์ในแบบฝึกนี้มาจากราคา GPU ต่อชั่วโมงคูณชั่วโมงที่เรียกเก็บและจำนวน replica ค่าโฮสต์จริงอาจมี CPU, storage, network และเวลาของทีมปฏิบัติการเพิ่ม",
        "ที่จุดเท่าทุน ค่า API และ GPU เท่ากันพอดี ถ้าหารแล้วมีเศษต้องปัดขึ้นเพื่อหาจำนวนคำขอเต็มขั้นต่ำที่ค่า API อย่างน้อยเท่าค่าโฮสต์",
      ],
      analogy: "เหมือนเทียบค่าเดินทางรายเที่ยวกับค่าเหมารถทั้งเดือนที่ต้องจ่ายแม้วันนั้นรถจอด",
      code: {
        language: "python",
        filename: "inference_economics_break_even.py",
        code: `from decimal import Decimal
from math import ceil

api = Decimal(1500 * 120 + 250 * 480) / 1_000_000
fixed = Decimal(100 * 720)
threshold = ceil(fixed / api)
print(f"{api:.2f} THB/request")
print(f"{fixed:.0f} THB/month, {threshold:,} requests")
# 0.30 THB/request
# 72000 THB/month, 240,000 requests`,
      },
      whyTitle: "แยกยอดรายเดือนออกจาก peak",
      whyParagraphs: [
        "240,000 คำขอต่อ 30 วันมีค่าเฉลี่ยประมาณ 0.0926 RPS แต่คำขอลงทะเบียนมากระจุกตัวจนถึง 1.5 RPS ได้ ขนาดเครื่องจึงต้องดู benchmark ในช่วงโหลดสูง",
        "ถ้า API มีราคา cached input แบบ D79 ให้ใช้ต้นทุนถ่วงน้ำหนักตามสัดส่วนจริงก่อนเปรียบเทียบกับ GPU ที่เปิดไว้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · เทียบกับเครื่องเซิร์ฟเวอร์ที่เปิดประจำและ serverless",
      body: [
        "งาน RAG มีทั้งโหลดพื้นฐานและโหลดกระชากช่วงประกาศผล การแยกค่าใช้จ่ายรายเดือนจากเพดานคิวช่วยให้ตัดสินใจได้ทั้งฝั่งงบและฝั่งผู้ใช้",
      ],
      table: [
        ["Serverless per invocation", "API คิดตาม input/output token โดยค่าเรียกหนึ่งครั้งเปลี่ยนตามความยาว"],
        ["Reserved compute", "ค่า GPU-hour เดินตามเวลาที่เปิดเครื่องแม้คิวว่าง"],
        ["Load test + SLO", "completed RPS ต้องอ่านร่วมกับ p95 TTFT และ error"],
      ],
    },
    student: {
      title: "First-Year Note · คูณหน่วยแล้วอ่านคำตอบ",
      body: [
        "จด token ต่อคำขอคูณบาทต่อหนึ่งล้าน token จะออกมาเป็นบาทต่อคำขอ ส่วนบาทต่อชั่วโมงคูณชั่วโมงต่อเดือนจะออกมาเป็นบาทต่อเดือน",
        "เมื่อเอาค่าต่อเดือนหารค่าต่อคำขอ ผลคือจำนวนคำขอต่อเดือนที่ต้องการ",
      ],
    },
  },

  workedExample: {
    intro: "ทีมศูนย์บริการนักศึกษาประเมินบริการ RAG ที่มี input 1,500 token และ output 250 token ต่อคำขอ โดยใช้ GPU 100 บาท/ชั่วโมงและราคา API สมมติ 120 กับ 480 บาทต่อล้าน token คัดลอกโค้ดทั้งสามขั้นตามลำดับลงไฟล์เดียว inference_economics_demo.py แล้วรันจากหัวข้อ Setup",
    steps: [
      {
        title: "ตั้งข้อมูลที่ตรวจหน่วยได้",
        explain: "สร้าง Pydantic model สำหรับขนาดคำขอ ราคา ชั่วโมง และเงื่อนไข benchmark จากนั้นพิมพ์สรุปเพื่อให้ทีมเห็น workload เดียวกัน",
        code: {
          language: "python",
          filename: "inference_economics_demo.py",
          code: `from decimal import Decimal
from math import ceil

import pytest
from pydantic import BaseModel, Field


MILLION = 1_000_000
SECONDS_PER_MONTH = 30 * 24 * 3600


class Workload(BaseModel):
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(gt=0)
    input_thb_per_million: Decimal = Field(ge=0)
    output_thb_per_million: Decimal = Field(ge=0)
    gpu_thb_per_hour: Decimal = Field(gt=0)
    billed_hours: int = Field(gt=0)
    replicas: int = Field(gt=0)
    peak_rps: float = Field(gt=0)
    ttft_limit_ms: int = Field(gt=0)


class BenchRow(BaseModel):
    name: str
    completed_rps: float = Field(gt=0)
    p95_ttft_ms: int = Field(ge=0)
    errors: int = Field(ge=0)


WORKLOAD = Workload(
    input_tokens=1500,
    output_tokens=250,
    input_thb_per_million=120,
    output_thb_per_million=480,
    gpu_thb_per_hour=100,
    billed_hours=720,
    replicas=1,
    peak_rps=1.5,
    ttft_limit_ms=500,
)

ROWS = [
    BenchRow(name="baseline", completed_rps=1.1, p95_ttft_ms=480, errors=0),
    BenchRow(name="paged", completed_rps=1.8, p95_ttft_ms=430, errors=0),
    BenchRow(name="overloaded", completed_rps=2.3, p95_ttft_ms=920, errors=12),
]

print(f"{WORKLOAD.input_tokens:,} input / {WORKLOAD.output_tokens} output tokens")
print(f"{WORKLOAD.billed_hours} billed hours, peak {WORKLOAD.peak_rps} requests/s")`,
        },
        output: `1,500 input / 250 output tokens
720 billed hours, peak 1.5 requests/s`,
      },
      {
        title: "คำนวณจุดที่ค่าใช้จ่ายเท่ากัน",
        explain: "ราคาต่อครั้งออกมา 0.30 บาท ค่า GPU ต่อเดือน 72,000 บาท จึงเท่าทุนที่ 240,000 คำขอ หากมี 180,000 คำขอ API จะคิด 54,000 บาทหรือถูกกว่า GPU 18,000 บาท",
        code: {
          language: "python",
          filename: "inference_economics_demo.py",
          code: `def api_cost_per_request(w: Workload) -> Decimal:
    input_cost = w.input_tokens * w.input_thb_per_million
    output_cost = w.output_tokens * w.output_thb_per_million
    return (input_cost + output_cost) / MILLION


def hosted_monthly(w: Workload) -> Decimal:
    return w.replicas * w.billed_hours * w.gpu_thb_per_hour


def break_even_requests(w: Workload) -> int | None:
    per_request = api_cost_per_request(w)
    if per_request == 0:
        return None
    # จำนวนเต็มแรกที่ค่า API มากกว่าหรือเท่ากับค่าโฮสต์
    return ceil(hosted_monthly(w) / per_request)


def feasible_rows(w: Workload, rows: list[BenchRow]) -> list[str]:
    return [
        row.name
        for row in rows
        if row.errors == 0
        and row.p95_ttft_ms <= w.ttft_limit_ms
        and row.completed_rps >= w.peak_rps
    ]

cost = api_cost_per_request(WORKLOAD)
print(f"API: {cost:.2f} THB/request")
print(f"GPU: {hosted_monthly(WORKLOAD):,.0f} THB/month")
print(f"Break-even: {break_even_requests(WORKLOAD):,} requests/month")
print(f"API at 180k: {180_000 * cost:,.0f} THB/month")`,
        },
        output: `API: 0.30 THB/request
GPU: 72,000 THB/month
Break-even: 240,000 requests/month
API at 180k: 54,000 THB/month`,
      },
      {
        title: "คัดแถว benchmark ที่รับ peak ได้",
        explain: "แถว paged ผ่านทั้งสามเกณฑ์ ส่วน baseline รองรับ peak ไม่พอและ overloaded ผิดเงื่อนไข p95 กับ error ดังนั้นเริ่มจาก paged ถ้าจะทดลองโฮสต์และใช้ตัวเลขค่าใช้จ่ายประกอบ",
        code: {
          language: "python",
          filename: "inference_economics_demo.py",
          code: `for row in ROWS:
    print(f"{row.name}: {row.completed_rps:.1f} req/s, p95 {row.p95_ttft_ms} ms, errors {row.errors}")

print("Eligible:", ", ".join(feasible_rows(WORKLOAD, ROWS)))
average_rps = break_even_requests(WORKLOAD) / SECONDS_PER_MONTH
print(f"Break-even average load: {average_rps:.4f} req/s")`,
        },
        output: `baseline: 1.1 req/s, p95 480 ms, errors 0
paged: 1.8 req/s, p95 430 ms, errors 0
overloaded: 2.3 req/s, p95 920 ms, errors 12
Eligible: paged
Break-even average load: 0.0926 req/s`,
      },
    ],
    gotcha: "ทุกแถวเป็นข้อมูลสมมติจาก benchmark ของ deployment หนึ่ง replica การคูณจำนวน replica ในสูตรค่าใช้จ่ายไม่ได้ทำให้ throughput เพิ่มแบบเส้นตรงโดยอัตโนมัติ ต้องวัด deployment ใหม่",
  },

  practice: {
    intro: "เขียนตัวคำนวณและตัวคัด benchmark สำหรับรายงานเปรียบเทียบ API กับ GPU ของศูนย์บริการนักศึกษา",
    requirements: [
      "คิด input/output แยกและคืน Decimal โดยยังไม่ปัดค่ากลาง",
      "คำนวณค่า GPU จากจำนวน replica ชั่วโมงที่จ่าย และตัวเลขบาทต่อ GPU-hour",
      "ปัดจำนวนคำขอเท่าทุนขึ้นเป็นจำนวนเต็ม คืน None เมื่อ API ต่อคำขอมีค่าเป็นศูนย์",
      "คืนชื่อ benchmark ที่ผ่าน peak RPS, p95 TTFT และ error ศูนย์ตามลำดับเดิม",
    ],
    starter: {
      language: "python",
      filename: "inference_economics.py",
      code: `from decimal import Decimal
from math import ceil

import pytest
from pydantic import BaseModel, Field


MILLION = 1_000_000
SECONDS_PER_MONTH = 30 * 24 * 3600


class Workload(BaseModel):
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(gt=0)
    input_thb_per_million: Decimal = Field(ge=0)
    output_thb_per_million: Decimal = Field(ge=0)
    gpu_thb_per_hour: Decimal = Field(gt=0)
    billed_hours: int = Field(gt=0)
    replicas: int = Field(gt=0)
    peak_rps: float = Field(gt=0)
    ttft_limit_ms: int = Field(gt=0)


class BenchRow(BaseModel):
    name: str
    completed_rps: float = Field(gt=0)
    p95_ttft_ms: int = Field(ge=0)
    errors: int = Field(ge=0)


WORKLOAD = Workload(
    input_tokens=1500,
    output_tokens=250,
    input_thb_per_million=120,
    output_thb_per_million=480,
    gpu_thb_per_hour=100,
    billed_hours=720,
    replicas=1,
    peak_rps=1.5,
    ttft_limit_ms=500,
)

ROWS = [
    BenchRow(name="baseline", completed_rps=1.1, p95_ttft_ms=480, errors=0),
    BenchRow(name="paged", completed_rps=1.8, p95_ttft_ms=430, errors=0),
    BenchRow(name="overloaded", completed_rps=2.3, p95_ttft_ms=920, errors=12),
]


def api_cost_per_request(w: Workload) -> Decimal:
    # TODO: แปลงราคารายล้าน token เป็นราคารวมต่อคำขอ
    raise NotImplementedError


def hosted_monthly(w: Workload) -> Decimal:
    # TODO: รวม GPU-hour ที่จ่ายทุก replica
    raise NotImplementedError


def break_even_requests(w: Workload) -> int | None:
    # TODO: จัดการ API ฟรีก่อนหาร แล้วปัดขึ้น
    raise NotImplementedError


def feasible_rows(w: Workload, rows: list[BenchRow]) -> list[str]:
    # TODO: คัดตาม throughput, p95 TTFT และ errors
    raise NotImplementedError`,
    },
    verification: {
      language: "python",
      filename: "test_inference_economics.py",
      code: `from decimal import Decimal

from inference_economics import (
    ROWS,
    WORKLOAD,
    BenchRow,
    api_cost_per_request,
    break_even_requests,
    feasible_rows,
    hosted_monthly,
)


def test_weighted_token_cost_and_monthly_gpu_bill():
    assert api_cost_per_request(WORKLOAD) == Decimal("0.30")
    assert hosted_monthly(WORKLOAD) == Decimal("72000")
    assert break_even_requests(WORKLOAD) == 240_000


def test_break_even_rounds_up():
    changed = WORKLOAD.model_copy(update={"input_thb_per_million": Decimal("130")})
    count = break_even_requests(changed)
    assert count == 228_572
    assert (count - 1) * api_cost_per_request(changed) < hosted_monthly(changed)
    assert count * api_cost_per_request(changed) >= hosted_monthly(changed)


def test_zero_api_price_has_no_break_even():
    free = WORKLOAD.model_copy(
        update={"input_thb_per_million": Decimal(0), "output_thb_per_million": Decimal(0)}
    )
    assert break_even_requests(free) is None


def test_replicas_raise_fixed_bill():
    doubled = WORKLOAD.model_copy(update={"replicas": 2})
    assert hosted_monthly(doubled) == Decimal("144000")
    assert break_even_requests(doubled) == 480_000


def test_only_rows_meeting_peak_and_latency_and_errors_qualify():
    assert feasible_rows(WORKLOAD, ROWS) == ["paged"]
    at_limit = BenchRow(name="edge", completed_rps=1.5, p95_ttft_ms=500, errors=0)
    has_error = at_limit.model_copy(update={"name": "error", "errors": 1})
    assert feasible_rows(WORKLOAD, [at_limit, has_error]) == ["edge"]`,
    },
    selfCheck: [
      "ตรวจว่าตัวเลขหลักคือ 0.30 บาทต่อคำขอ, 72,000 บาทต่อเดือน และ 240,000 คำขอ",
      "ตรวจว่าแถวที่เร็วที่สุดอาจถูกตัดเพราะ p95 และ error",
      "ลองขึ้นราคา input เป็น 130 บาทต่อล้าน token แล้วตรวจทั้งคำขอที่อยู่ก่อนและหลังจุดเท่าทุน",
    ],
    acceptance: "pytest ผ่านทั้งจุดเท่าทุนพอดี การปัดขึ้น กรณี API ฟรี จำนวน replica และเงื่อนไข benchmark",
    hints: [
      {
        body: "วางหน่วยของ token ข้างราคาและแปลงให้เกิดบาทต่อคำขอก่อนหาร",
      },
      {
        body: "ใช้ Decimal สำหรับเงิน, ceil สำหรับคำขอเต็ม และเชื่อมเกณฑ์ benchmark ทั้งสามด้วย and",
      },
      {
        body: "เฉลยใช้กรณีขอบที่แถว benchmark มีค่าเท่ากับเพดานพอดี และตรวจว่าคำขอก่อนจุดปัดขึ้นยังไม่คุ้ม คัดลอกไฟล์นี้ไฟล์เดียวแล้วใช้ pytest ระบุชื่อไฟล์เพื่อรัน implementation และ tests ที่มาด้วยกัน",
        code: {
          language: "python",
          filename: "inference_economics_solution.py",
          code: `from decimal import Decimal
from math import ceil

import pytest
from pydantic import BaseModel, Field


MILLION = 1_000_000
SECONDS_PER_MONTH = 30 * 24 * 3600


class Workload(BaseModel):
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(gt=0)
    input_thb_per_million: Decimal = Field(ge=0)
    output_thb_per_million: Decimal = Field(ge=0)
    gpu_thb_per_hour: Decimal = Field(gt=0)
    billed_hours: int = Field(gt=0)
    replicas: int = Field(gt=0)
    peak_rps: float = Field(gt=0)
    ttft_limit_ms: int = Field(gt=0)


class BenchRow(BaseModel):
    name: str
    completed_rps: float = Field(gt=0)
    p95_ttft_ms: int = Field(ge=0)
    errors: int = Field(ge=0)


WORKLOAD = Workload(
    input_tokens=1500,
    output_tokens=250,
    input_thb_per_million=120,
    output_thb_per_million=480,
    gpu_thb_per_hour=100,
    billed_hours=720,
    replicas=1,
    peak_rps=1.5,
    ttft_limit_ms=500,
)

ROWS = [
    BenchRow(name="baseline", completed_rps=1.1, p95_ttft_ms=480, errors=0),
    BenchRow(name="paged", completed_rps=1.8, p95_ttft_ms=430, errors=0),
    BenchRow(name="overloaded", completed_rps=2.3, p95_ttft_ms=920, errors=12),
]


def api_cost_per_request(w: Workload) -> Decimal:
    input_cost = w.input_tokens * w.input_thb_per_million
    output_cost = w.output_tokens * w.output_thb_per_million
    return (input_cost + output_cost) / MILLION


def hosted_monthly(w: Workload) -> Decimal:
    return w.replicas * w.billed_hours * w.gpu_thb_per_hour


def break_even_requests(w: Workload) -> int | None:
    per_request = api_cost_per_request(w)
    if per_request == 0:
        return None
    # จำนวนเต็มแรกที่ค่า API มากกว่าหรือเท่ากับค่าโฮสต์
    return ceil(hosted_monthly(w) / per_request)


def feasible_rows(w: Workload, rows: list[BenchRow]) -> list[str]:
    return [
        row.name
        for row in rows
        if row.errors == 0
        and row.p95_ttft_ms <= w.ttft_limit_ms
        and row.completed_rps >= w.peak_rps
    ]


def test_weighted_token_cost_and_monthly_gpu_bill():
    assert api_cost_per_request(WORKLOAD) == Decimal("0.30")
    assert hosted_monthly(WORKLOAD) == Decimal("72000")
    assert break_even_requests(WORKLOAD) == 240_000


def test_break_even_rounds_up():
    changed = WORKLOAD.model_copy(update={"input_thb_per_million": Decimal("130")})
    count = break_even_requests(changed)
    assert count == 228_572
    assert (count - 1) * api_cost_per_request(changed) < hosted_monthly(changed)
    assert count * api_cost_per_request(changed) >= hosted_monthly(changed)


def test_zero_api_price_has_no_break_even():
    free = WORKLOAD.model_copy(
        update={"input_thb_per_million": Decimal(0), "output_thb_per_million": Decimal(0)}
    )
    assert break_even_requests(free) is None


def test_replicas_raise_fixed_bill():
    doubled = WORKLOAD.model_copy(update={"replicas": 2})
    assert hosted_monthly(doubled) == Decimal("144000")
    assert break_even_requests(doubled) == 480_000


def test_only_rows_meeting_peak_and_latency_and_errors_qualify():
    assert feasible_rows(WORKLOAD, ROWS) == ["paged"]
    at_limit = BenchRow(name="edge", completed_rps=1.5, p95_ttft_ms=500, errors=0)
    has_error = at_limit.model_copy(update={"name": "error", "errors": 1})
    assert feasible_rows(WORKLOAD, [at_limit, has_error]) == ["edge"]`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run --python 3.12 --with pydantic --with pytest pytest -q test_inference_economics.py
uv run --python 3.12 --with pydantic --with pytest pytest -q inference_economics_solution.py`,
    },
  },

  mistakes: [
    {
      title: "ใช้ราคา input กับทุก token",
      symptom: "ค่า API ต่ำกว่าจริงในโจทย์ที่ output แพงกว่า",
      fix: "แยก usage สองฝั่งและตรวจหน่วยราคาเป็นบาทต่อล้าน token",
    },
    {
      title: "ดู output tokens ต่อวินาทีเป็น RPS",
      symptom: "เผลอรับปากรองรับผู้ใช้ได้มากกว่า benchmark",
      fix: "อ่าน completed requests ต่อวินาทีและบันทึกความยาวคำตอบ",
    },
    {
      title: "ใช้แถว throughput สูงสุดทันที",
      symptom: "ผู้ใช้รอ token แรกนานและมีคำขอล้มเหลว",
      fix: "คัดผ่าน p95 และ error ก่อนใช้ค่าความจุ",
    },
    {
      title: "นับ GPU เฉพาะตอนมี traffic",
      symptom: "รายงานงบต่ำกว่าบิลเครื่องที่เปิดค้าง",
      fix: "ใช้ชั่วโมงที่ผู้ให้บริการเรียกเก็บและคูณ replica ทั้งหมด",
    },
  ],
  quiz: {
    questions: [
      mc(
        "d145-q1",
        "PagedAttention ช่วยจัดการอะไรโดยตรง?",
        [
          ["ราคา API", "ราคาขึ้นกับผู้ให้บริการ"],
          ["บล็อกของ KV cache", "block table แม็ปลำดับ token ไปยังบล็อกจริง"],
          ["เกณฑ์ eval", "เกณฑ์กำหนดโดยทีม"],
          ["สิทธิ์เอกสาร", "ACL อยู่ชั้นแอปและ retrieval"],
        ],
        "B",
        "PagedAttention ช่วยให้ KV cache ของแต่ละลำดับเติบโตเป็นบล็อกและใช้ตำแหน่งจริงที่กระจายได้",
        "บล็อกละ 16 token สำหรับ 17 token ต้องใช้กี่บล็อก?",
        "สองบล็อก เหลือช่องในบล็อกท้าย 15 ช่อง",
      ),
      mc(
        "d145-q2",
        "ต้องการ 1.5 RPS และ p95 TTFT ไม่เกิน 500 ms ไม่มี error เลือกใคร?",
        [
          ["baseline", "ทำได้ 1.1 RPS"],
          ["overloaded", "p95 920 ms และ 12 errors"],
          ["paged", "ทำได้ 1.8 RPS และ 430 ms โดยไม่มี error"],
          ["ทั้งสาม", "แต่ละแถวต้องผ่านทุกเกณฑ์"],
        ],
        "C",
        "มีเพียง paged ที่ผ่าน throughput, p95 และ error พร้อมกัน",
        "ถ้าเพดาน p95 ลดเหลือ 400 ms ผลคืออะไร?",
        "ไม่มีแถวผ่าน",
      ),
      mc(
        "d145-q3",
        "72,000 บาทต่อเดือน เทียบ API 0.30 บาทต่อ request เท่าทุนที่เท่าไร?",
        [
          ["24,000", "API รวม 7,200 บาท"],
          ["21,600", "ค่านี้มาจากคูณแทนหาร"],
          ["240,001", "240,000 เท่าทุนแล้ว"],
          ["240,000", "หารค่าโฮสต์ด้วยต้นทุนต่อครั้ง"],
        ],
        "D",
        "240,000 คูณ 0.30 ได้ 72,000 บาทพอดี",
        "ถ้าเพิ่ม replica เป็นสองและราคาเดิม?",
        "480,000 คำขอต่อเดือน",
      ),
      mc(
        "d145-q4",
        "หลังลดบิตของน้ำหนักโมเดล ควรตรวจอะไร?",
        [
          ["คุณภาพและ benchmark บนเครื่องเป้าหมาย", "ผลขึ้นกับงานและฮาร์ดแวร์"],
          ["ขนาดไฟล์อย่างเดียว", "ขนาดยังตอบเรื่อง latency และคุณภาพไม่ได้"],
          ["ราคา input อย่างเดียว", "ราคา API ไม่ได้บอกว่าโฮสต์รุ่นนี้ดีขึ้น"],
          ["จำนวนผู้ใช้ที่สมัคร", "ผู้สมัครยังไม่บอกการใช้จริง"],
        ],
        "A",
        "ความแม่นยำและความเร็วอาจเปลี่ยน จึงต้องเทียบงานภาษาไทยและโหลดเดิม",
        "weight quantization บังคับเปลี่ยน dtype ของ KV cache ไหม?",
        "ค่า dtype ของ KV cache พิจารณาแยกจาก precision ของน้ำหนัก",
      ),
    ],
  },

  takeaways: [
    "KV cache เก็บ key/value ของ token ที่คำนวณแล้ว PagedAttention จัด allocation ระดับบล็อก",
    "Continuous batching จัดสมาชิกได้ระหว่าง generation และ quantization ต้องยืนยันด้วย benchmark กับ eval",
    "เก็บตัวเลขราคาไว้พร้อมหน่วยและใช้ค่าใช้จ่ายรายเดือนตัดสินควบคู่กับ peak RPS และ SLO",
  ],
  reviewCards: [
    rc(
      "d145-r1",
      "คำนวณราคา API ต่อคำขออย่างไร?",
      "คูณ token กับราคาแยก input และ output แล้วรวมก่อนหารหนึ่งล้าน",
    ),
    rc(
      "d145-r2",
      "p95 TTFT คืออะไร?",
      "เปอร์เซ็นไทล์ที่ 95 ของเวลาถึง token แรกในกลุ่มคำขอที่วัด",
    ),
    rc(
      "d145-r3",
      "เมื่อ API ต่อคำขอราคาเป็นศูนย์ มีจุดคุ้มทุนไหม?",
      "ไม่มีจุดที่ค่า API เท่ากับค่า GPU คงที่ซึ่งมากกว่าศูนย์",
    ),
    rc(
      "d145-r4",
      "ต้องบันทึกอะไรกับผล benchmark?",
      "โมเดล hardware precision รูปแบบโหลด ความยาว token การใช้ cache error และ latency",
    ),
  ],
  sources: [
    {
      label: "vLLM Benchmark CLI",
      href: "https://docs.vllm.ai/en/stable/benchmarking/cli/",
    },
    {
      label: "PagedAttention paper (Kwon et al.)",
      href: "https://arxiv.org/abs/2309.06180",
    },
    {
      label: "vLLM Quantization",
      href: "https://docs.vllm.ai/en/stable/features/quantization/",
    },
    {
      label: "OpenAI Prompt Caching",
      href: "https://developers.openai.com/api/docs/guides/prompt-caching",
    },
  ],
  glossary: ["vllm", "quantization", "prompt-caching", "ttft", "golden-dataset"],
});
