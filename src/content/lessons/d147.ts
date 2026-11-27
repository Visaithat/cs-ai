import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const practiceTests = `from dataclasses import replace

import pytest


WORKLOAD = Workload(10_000, 54, 30, D("12"), D("2.4"))
STRONG = TokenRate(D("120"), D("480"))
CHEAP = TokenRate(D("80"), D("400"))
FREE = TokenRate(D("0"), D("0"))

BASELINE = [Lane("strong", D("1"), 1500, 250, STRONG)]
OPTIMIZED = [
    Lane("hit", D("0.2"), 0, 0, FREE),
    Lane("cheap", D("0.4"), 1000, 250, CHEAP),
    Lane("strong", D("0.4"), 1000, 250, STRONG),
]
LOOKUP_THB = D("0.012")
USER_CAP = D("12.00")


def test_capacity_uses_full_day_seconds_and_consistent_latency():
    c = capacity(WORKLOAD)
    assert c.monthly_requests == 540_000
    assert c.avg_rps.quantize(D("0.0001")) == D("0.2083")
    assert c.peak_rps == D("2.5")
    assert c.peak_in_flight == D("6")


def test_peak_factor_changes_capacity_but_keeps_monthly_budget():
    busier = replace(WORKLOAD, peak_factor=D("24"))
    assert capacity(busier).peak_rps == D("5")
    assert capacity(busier).peak_in_flight == D("12")
    assert budget(busier, BASELINE) == budget(WORKLOAD, BASELINE)


def test_prices_by_lane():
    assert token_cost(BASELINE[0]) == D("0.30")
    assert [token_cost(lane) for lane in OPTIMIZED] == [D("0"), D("0.18"), D("0.24")]


def test_monthly_and_per_user_budget():
    base = budget(WORKLOAD, BASELINE)
    candidate = budget(WORKLOAD, OPTIMIZED, LOOKUP_THB)
    assert base == Budget(D("0.30"), D("162000"), D("16.20"))
    assert candidate == Budget(D("0.18"), D("97200"), D("9.72"))
    assert candidate.thb_per_user <= USER_CAP < base.thb_per_user
    assert (base.thb_per_month - candidate.thb_per_month) / base.thb_per_month == D("0.4")


def test_empty_month_still_has_a_unit_price():
    quiet = replace(WORKLOAD, requests_per_user=0)
    assert capacity(quiet) == Capacity(0, D("0"), D("0"), D("0"))
    assert budget(quiet, BASELINE) == Budget(D("0.30"), D("0"), D("0"))


def test_rejects_inconsistent_shares_and_bad_assumptions():
    with pytest.raises(ValueError, match="shares"):
        budget(WORKLOAD, OPTIMIZED[1:], LOOKUP_THB)
    with pytest.raises(ValueError, match="overhead"):
        budget(WORKLOAD, BASELINE, D("-0.01"))
    with pytest.raises(ValueError, match="peak factor"):
        replace(WORKLOAD, peak_factor=D("0.5"))
    with pytest.raises(ValueError, match="rates"):
        TokenRate(D("NaN"), D("0"))`;

const workloadType = `@dataclass(frozen=True)
class Workload:
    users: int
    requests_per_user: int
    days: int
    peak_factor: Decimal
    mean_seconds: Decimal

    def __post_init__(self):
        if self.users <= 0 or self.days <= 0 or self.requests_per_user < 0:
            raise ValueError("positive users and days; non-negative requests")
        if not self.peak_factor.is_finite() or self.peak_factor < 1:
            raise ValueError("peak factor must be finite and at least one")
        if not self.mean_seconds.is_finite() or self.mean_seconds < 0:
            raise ValueError("mean duration must be finite and non-negative")
`;

const pricingTypes = `@dataclass(frozen=True)
class TokenRate:
    input_per_million: Decimal
    output_per_million: Decimal

    def __post_init__(self):
        for rate in (self.input_per_million, self.output_per_million):
            if not rate.is_finite() or rate < 0:
                raise ValueError("rates must be finite and non-negative")


@dataclass(frozen=True)
class Lane:
    name: str
    share: Decimal
    input_tokens: int
    output_tokens: int
    rate: TokenRate

    def __post_init__(self):
        if not self.share.is_finite() or not 0 <= self.share <= 1:
            raise ValueError("share must be between zero and one")
        if min(self.input_tokens, self.output_tokens) < 0:
            raise ValueError("token counts must be non-negative")
`;

export const d147: Lesson = defineLesson({
  day: 147,
  titleTh: "วาง Capacity และคำนวณงบบาทต่อผู้ใช้ต่อเดือน",
  tagline: "30 นาที · ใช้ยอดรวมรายเดือนคิดเงิน ใช้ peak RPS และ Little’s Law วางโหลดทดสอบ",
  icon: "gauge",
  visual: {
    id: "capacity-cost-calc",
    title: "จาก token และ traffic สู่ capacity กับงบ",
    caption: "แยกสายโหลดที่ใช้ peak RPS และเวลาเฉลี่ย ออกจากสายงบที่ใช้จำนวนคำขอทั้งเดือนและราคาต่อ token",
    alt: "แผนภาพตัวคำนวณจำนวนคำขอพร้อมกันและต้นทุนต่อผู้ใช้ต่อเดือนจาก workload",
  },
  requiresApiKey: false,
  apiKeyNote: "แบบจำลองใช้ Decimal และราคาสมมติเป็น THB รันได้ออฟไลน์",
  tools: ["Python 3.12", "uv", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "ตั้งงบให้บริการนักศึกษา",
      body: "ทีมต้องคุมต้นทุนแปรผันให้อยู่ในงบสมมติ 12 บาทต่อผู้ใช้ต่อเดือน และรับโหลดในช่วงลงทะเบียน",
      lessonNote: "นิยามผู้ใช้ในโจทย์ว่าเป็นผู้ใช้ active ต่อเดือนก่อนหารต้นทุน",
    },
    {
      node: 5,
      heading: "อ่าน traffic และ latency จากระบบ",
      body: "ยอดทั้งเดือนใช้คิดเงิน ยอดในหน้าต่างพีกใช้คิดโหลด ให้ยึดขอบเขตที่กำหนดจาก trace",
      lessonNote: "D135 ให้แยก p95 ออกจาก mean และดึง input กับ output token เป็นคนละคอลัมน์",
    },
    {
      node: 4,
      heading: "วางขนาดโหลดทดสอบ",
      body: "คูณ peak RPS กับเวลาที่คำขออยู่ในระบบโดยเฉลี่ยเพื่อประมาณ in-flight ในช่วงพีกที่เสถียร",
      lessonNote: "ตรวจ throughput, error และ TTFT แบบ D145 ก่อนเลือก replica หรือ quota",
    },
    {
      node: 6,
      heading: "นำงบและข้อจำกัดกลับมาปรับระบบ",
      body: "ใช้สัดส่วน hit/cheap/strong จาก D146 ช่วยประมาณต้นทุนและบอกว่าจะวัดอะไรเพิ่มก่อนเปลี่ยน traffic",
      lessonNote: "เก็บสมมติฐานเป็นรายงานของ Evaluated & Guarded AI Microservice v0.5.0 ที่ D156",
    },
  ],
  objectives: [
    "คำนวณคำขอต่อเดือน average RPS และ peak RPS จากผู้ใช้และ peak factor",
    "ใช้ Little’s Law หา in-flight เฉลี่ยจาก rate และเวลาที่วัดในขอบเขตเดียวกัน",
    "คำนวณค่า token และ lookup แบบถ่วงน้ำหนักเป็น THB ต่อคำขอ ต่อเดือน และต่อผู้ใช้",
  ],
  prerequisites: [
    "D135 เคยอ่าน token, latency และ cost dashboard",
    "D140 เคยโหลดทดสอบ SSE แบบ concurrent และ D145 เคยคัดแถว benchmark ตาม SLO",
    "D146 เคยแยก semantic hit, cheap miss และ strong miss เป็นเส้นทางที่นับได้",
  ],

  setup: {
    intro: "ใช้ Python 3.12, uv และ standard library สำหรับเครื่องคิดงบ สร้างไฟล์ตัวอย่างสามขั้นและเทียบผลกับตาราง",
    commands: "uv run --python 3.12 python capacity_budget_demo.py",
    steps: [
      ["copy", "คัดลอกโค้ดตัวอย่างทั้งสามขั้นลงไฟล์เดียวตามลำดับ"],
      ["run", "รันตัวอย่างและเทียบค่ากับ output ที่อยู่ใต้แต่ละขั้น"],
      ["practice", "สร้างไฟล์จาก starter และไฟล์ pytest ในส่วนลองทำ"],
    ],
    note: "ราคา THB, ปริมาณงาน และเป้าต่อผู้ใช้เป็น illustrative assumptions สำหรับแล็บ แยกจากราคาและ SLA ของผู้ให้บริการจริง",
  },

  concepts: [
    {
      id: "arrival-rate",
      title: "แปลง active users เป็น average และ peak RPS",
      paragraphs: [
        "ผู้ใช้ active 10,000 คน แต่ละคนทำ 54 คำขอต่อเดือน ได้ 540,000 คำขอในช่วง 30 วัน",
        "ช่วงเดียวกันมี 2,592,000 วินาที อัตราเฉลี่ยประมาณ 0.2083 requests/sec ถ้าปัจจัยพีกเป็น 12 จะได้ peak 2.5 requests/sec จากค่าก่อนปัด",
        "ในระบบจริง นิยามหน้าต่างพีก เช่น หนึ่งนาทีช่วงลงทะเบียน แล้ววัด peak factor จาก rate ในหน้าต่างเทียบกับค่าเฉลี่ยของฐานเดียวกัน",
      ],
      analogy: "เหมือนยอดผู้โดยสารตลอดเดือนกับคนที่มาถึงชานชาลาต่อนาทีตอนเลิกงาน",
      code: {
        language: "python",
        filename: "capacity_arrivals.py",
        code: `from decimal import Decimal as D

monthly_requests = 10_000 * 54
month_seconds = 30 * 24 * 60 * 60
average = D(monthly_requests) / month_seconds
peak = D(monthly_requests * 12) / month_seconds

print(f"{monthly_requests:,} requests/month")
print(f"{average:.4f} avg req/s, {peak:.2f} peak req/s")
# 540,000 requests/month
# 0.2083 avg req/s, 2.50 peak req/s`,
      },
      whyTitle: "อย่าปัดก่อนเอาค่าไปใช้",
      whyParagraphs: [
        "ถ้าใช้ 0.2083 ที่ปัดเพื่อแสดงไปคูณ 12 จะได้ 2.4996 แทน 2.5 เก็บค่ากลางไว้จนถึงตอนรายงาน",
        "peak factor ตั้งจากเหตุการณ์ที่คาดว่าจะเจอและตรวจทานเมื่อ traffic เปลี่ยน",
      ],
    },
    {
      id: "little-law",
      title: "Little’s Law และ concurrency เฉลี่ย",
      paragraphs: [
        "L = λ × W โดย λ เป็นอัตราคำขอต่อวินาทีและ W เป็นเวลาเฉลี่ยต่อคำขอในระบบ หน่วยที่เหลือคือจำนวนคำขอ",
        "ที่อัตราพีก 2.5 RPS และเวลาเฉลี่ยแบบ end-to-end 2.4 วินาที ในช่วงพีกที่คิวเสถียรได้ in-flight เฉลี่ย 6 คำขอ",
        "ถ้าขอบเขตคือ request ทั้งหมดในแอป ให้นับทั้งเวลารอคิวและเวลาให้บริการรวมถึง streaming จนจบ ถ้าขอบเขตคือ GPU ให้ใช้ rate และ residence time ของคำขอที่ถึง GPU เท่านั้น",
      ],
      analogy: "เหมือนนับคนที่อยู่ทั้งในคิวและที่ช่องบริการช่วงที่คนเข้าออกสม่ำเสมอ",
      code: {
        language: "python",
        filename: "capacity_little.py",
        code: `from decimal import Decimal as D
from math import ceil

lambda_peak = D("2.5")
mean_seconds = D("2.4")
mean_in_flight = lambda_peak * mean_seconds

print(f"L = {mean_in_flight:.1f} requests")
print(f"first stress-test point with 25% headroom: {ceil(mean_in_flight * D('1.25'))}")
# L = 6.0 requests
# first stress-test point with 25% headroom: 8`,
      },
      whyTitle: "แปลงค่าเฉลี่ยเป็นจุดเริ่มทดสอบ",
      whyParagraphs: [
        "ใช้ 8 concurrency เป็นจุดเริ่มทดลองกรณีเผื่อ 25% จาก 6 แล้วปัดขึ้น ผล stress test ยังต้องยืนยัน p95, error, quota และการสะสมคิว",
        "ถ้าคิวเพิ่มต่อเนื่องในหน้าต่างทดลอง rate และ latency อาจยังไม่เสถียร ให้แก้ overload แล้ววัดใหม่ก่อนอ้างค่าประมาณ",
      ],
    },
    {
      id: "token-unit-cost",
      title: "แยกราคา input, output และค่า lookup",
      paragraphs: [
        "ราคาสมมติ strong 120 บาทต่อล้าน input token และ 480 บาทต่อล้าน output token ถ้าใช้ 1,500 และ 250 จะรวม 0.30 บาท",
        "หลัง trim ใช้ 1,000 input กับ 250 output ต้นทุน strong 0.24 บาท และ cheap ที่ราคา 80 กับ 400 ต่อล้าน token เป็น 0.18 บาท",
        "สำหรับแผนเปิด cache สมมติคิด overhead 0.012 บาทต่อคำขอที่เข้า service เพื่อรวมค่า lookup เฉลี่ยทั้งงานที่ hit และงานที่ไม่ hit",
      ],
      analogy: "เหมือนบิลวัสดุที่มีราคาต่อหน่วยแยกตามชนิด และค่าดำเนินการที่ทุกงานมีส่วนรับผิดชอบ",
      code: {
        language: "python",
        filename: "capacity_token_bill.py",
        code: `from decimal import Decimal as D

def unit_cost(in_tokens, out_tokens, in_rate, out_rate):
    return D(in_tokens * in_rate + out_tokens * out_rate) / 1_000_000

print(f"strong baseline: {unit_cost(1500, 250, 120, 480):.2f}")
print(f"strong trimmed: {unit_cost(1000, 250, 120, 480):.2f}")
print(f"cheap trimmed: {unit_cost(1000, 250, 80, 400):.2f}")
# strong baseline: 0.30
# strong trimmed: 0.24
# cheap trimmed: 0.18`,
      },
      whyTitle: "เพิ่มต้นทุนตามขอบเขตรายงาน",
      whyParagraphs: [
        "แบบฝึกคิดต้นทุนแปรผัน token และ lookup overhead เท่านั้น ถ้าทีมตั้งงบรวมให้เพิ่ม fixed infra, storage, network และ observability",
        "การ retry และ fallback มี usage ของแต่ละ attempt ให้นับต้นทุนจริงแยกจากจำนวนคำขอฝั่งผู้ใช้",
      ],
    },
    {
      id: "mix-and-budget",
      title: "ถ่วงน้ำหนักทุกคำขอก่อนหารผู้ใช้",
      paragraphs: [
        "ใช้สัดส่วนจากคำขอทั้งหมด hit 20%, cheap 40%, strong 40% รวม 100% ค่า model token ของ hit เป็น 0",
        "ต้นทุนคาดหมายคือ 0.012 + (0.20 × 0) + (0.40 × 0.18) + (0.40 × 0.24) = 0.18 บาทต่อคำขอ คูณ 540,000 ได้ 97,200 บาทต่อเดือน",
        "เมื่อหารผู้ใช้ active 10,000 คน ได้ 9.72 บาทต่อคน เทียบ baseline 16.20 บาทต่อคน ประหยัด 40% ภายใต้สมมติฐานเดียวกัน",
      ],
      analogy: "เหมือนเอาอัตราใช้ช่องบริการแต่ละแบบมาถ่วงก่อนเฉลี่ยค่าใช้จ่ายต่อสมาชิก",
      code: {
        language: "python",
        filename: "capacity_weighted_cost.py",
        code: `from decimal import Decimal as D

shares = [(D("0.20"), D("0")), (D("0.40"), D("0.18")), (D("0.40"), D("0.24"))]
per_request = D("0.012") + sum(share * cost for share, cost in shares)
print(f"{per_request:.2f} THB/request")
print(f"{per_request * 540_000:,.0f} THB/month")
print(f"{per_request * 54:.2f} THB/user/month")
# 0.18 THB/request
# 97,200 THB/month
# 9.72 THB/user/month`,
      },
      whyTitle: "ทดสอบความไวของผลลัพธ์",
      whyParagraphs: [
        "ถ้าเดือนลงทะเบียน hit rate ต่ำลง ให้ย้ายสัดส่วนไป lane ที่รับจริงและรันเครื่องคิดงบใหม่",
        "สัดส่วนที่ใช้คาดการณ์ต้นทุนรายเดือนอาจต่างจากสัดส่วนระหว่างพีก อย่าคูณด้วย hit rate ทั้งเดือนเพื่อรับปากโหลด GPU ช่วงพีกโดยไม่มีข้อมูล",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · ใช้ Little’s Law ใน boundary ที่ประกาศไว้",
      body: [
        "ถ้าคำนวณคำขอค้างใน FastAPI ให้ใช้ end-to-end duration ของแอป เช่น จากเริ่มคำขอจนจบ SSE ส่วนการวาง pool ฝั่ง model ต้องดูเฉพาะช่วงเวลาที่การเรียก model ค้าง",
        "ตั้ง {{rate-limit}} และคิวให้มีโหลดทดสอบประกอบ ดู quota ต่อวินาทีและ token แยกกัน โดยใช้พื้นที่เผื่อให้ส่ง error ที่อธิบายได้เมื่อเกินความจุ",
      ],
      table: [
        ["Usage export","tokens/request แยกขาเข้าและขาออก"],
        ["Trace","mean duration เพื่อประมาณ L และ p95 เพื่อทดสอบ SLO"],
        ["Billing note","THB ต่อคนและสมมติฐานผู้ใช้ active"],
      ],
    },
    student: {
      title: "First-Year Note · ตัดหน่วยก่อนแทนตัวเลข",
      body: [
        "เอา requests ต่อวินาทีคูณวินาทีต่อ request ในความหมายเวลาเฉลี่ยของแต่ละคำขอ แล้วอ่านผลเป็นจำนวนรายการที่อยู่ในระบบพร้อมกันโดยเฉลี่ย",
        "ฝั่งราคาเอา token ต่อคำขอคูณบาทต่อหนึ่งล้าน token แล้วหารด้วยหนึ่งล้าน สุดท้ายคูณคำขอต่อผู้ใช้ในเดือนเพื่อได้บาทต่อผู้ใช้ต่อเดือน",
      ],
    },
  },

  workedExample: {
    intro: "รวบโค้ดสามขั้นลงไฟล์ capacity_budget_demo.py วางฐานไว้ที่ผู้ใช้ active 10,000 คนและกำหนดงบ token กับ lookup ที่ 12.00 บาทต่อผู้ใช้ต่อเดือน",
    steps: [
      {
        title: "ประเมินคำขอและโหลด",
        explain: "จุดเริ่มของ load test ใช้ 2.50 RPS ช่วงพีก โดยเวลาเฉลี่ย 2.4 วินาทีทำให้ L ได้ 6.0",
        code: {
          language: "python",
          filename: "capacity_budget_demo.py",
          code: `from dataclasses import dataclass
from decimal import Decimal


D = Decimal
MILLION = D("1000000")
SECONDS_PER_DAY = 86_400


${workloadType}

@dataclass(frozen=True)
class Capacity:
    monthly_requests: int
    avg_rps: Decimal
    peak_rps: Decimal
    peak_in_flight: Decimal


def capacity(w: Workload) -> Capacity:
    requests = w.users * w.requests_per_user
    seconds = w.days * SECONDS_PER_DAY
    average = D(requests) / seconds
    # Multiply before dividing to avoid rounding a recurring average first.
    peak = D(requests) * w.peak_factor / seconds
    return Capacity(requests, average, peak, peak * w.mean_seconds)


WORKLOAD = Workload(10_000, 54, 30, D("12"), D("2.4"))
plan = capacity(WORKLOAD)
print(f"Monthly requests: {plan.monthly_requests:,}")
print(f"Average/peak: {plan.avg_rps:.4f}/{plan.peak_rps:.2f} req/s")
print(f"Peak in-flight: {plan.peak_in_flight:.1f}")`,
        },
        output: "Monthly requests: 540,000\nAverage/peak: 0.2083/2.50 req/s\nPeak in-flight: 6.0",
      },
      {
        title: "คำนวณ baseline",
        explain: "0.30 บาทต่อคำขอเมื่อทุกคำขอใช้ strong และยังไม่ trim จึงได้ 162,000 บาทต่อเดือนหรือ 16.20 บาทต่อคน",
        code: {
          language: "python",
          filename: "capacity_budget_demo.py",
          code: `${pricingTypes}

@dataclass(frozen=True)
class Budget:
    thb_per_request: Decimal
    thb_per_month: Decimal
    thb_per_user: Decimal


def token_cost(lane: Lane) -> Decimal:
    input_cost = lane.input_tokens * lane.rate.input_per_million
    output_cost = lane.output_tokens * lane.rate.output_per_million
    return (input_cost + output_cost) / MILLION


def budget(w: Workload, lanes: list[Lane], overhead: Decimal = D("0")) -> Budget:
    if sum(lane.share for lane in lanes) != 1:
        raise ValueError("all-traffic shares must sum to one")
    if not overhead.is_finite() or overhead < 0:
        raise ValueError("overhead must be finite and non-negative")

    per_request = overhead + sum(lane.share * token_cost(lane) for lane in lanes)
    monthly = per_request * w.users * w.requests_per_user
    return Budget(per_request, monthly, monthly / w.users)

STRONG = TokenRate(D("120"), D("480"))
BASELINE = [Lane("strong", D("1"), 1500, 250, STRONG)]
base = budget(WORKLOAD, BASELINE)
print(f"Baseline: {base.thb_per_request:.2f} THB/request")
print(f"Baseline: {base.thb_per_month:,.0f} THB/month, {base.thb_per_user:.2f} THB/user")`,
        },
        output: "Baseline: 0.30 THB/request\nBaseline: 162,000 THB/month, 16.20 THB/user",
      },
      {
        title: "เปรียบเทียบแผนใหม่กับงบ",
        explain: "คิด lookup ทุกคำขอ และใช้ราคาที่ลด input แล้วภายใต้สัดส่วนเดียวกับที่ตั้งไว้สำหรับ D148",
        code: {
          language: "python",
          filename: "capacity_budget_demo.py",
          code: `CHEAP = TokenRate(D("80"), D("400"))
FREE = TokenRate(D("0"), D("0"))

OPTIMIZED = [
    Lane("hit", D("0.2"), 0, 0, FREE),
    Lane("cheap", D("0.4"), 1000, 250, CHEAP),
    Lane("strong", D("0.4"), 1000, 250, STRONG),
]
LOOKUP_THB = D("0.012")
USER_CAP = D("12.00")

candidate = budget(WORKLOAD, OPTIMIZED, LOOKUP_THB)
savings = 1 - candidate.thb_per_month / base.thb_per_month
print(f"Candidate: {candidate.thb_per_request:.2f} THB/request")
print(f"Candidate: {candidate.thb_per_month:,.0f} THB/month, {candidate.thb_per_user:.2f} THB/user")
print(f"Savings: {savings:.0%}; within {USER_CAP:.2f} THB cap: {candidate.thb_per_user <= USER_CAP}")`,
        },
        output: "Candidate: 0.18 THB/request\nCandidate: 97,200 THB/month, 9.72 THB/user\nSavings: 40%; within 12.00 THB cap: True",
      },
    ],
    gotcha: "เปลี่ยน peak factor โดยคงยอดรวมทั้งเดือนไว้จะเปลี่ยน concurrency แต่ค่า token รายเดือนเท่าเดิมในแบบจำลองนี้ ค่า latency และสัดส่วน route ต้องวัดใหม่ถ้าจะประเมิน capacity ของแผน optimized",
  },

  practice: {
    intro: "เติมสามฟังก์ชันเพื่อส่งรายงาน capacity กับงบที่แยกหน่วยได้และมีการตรวจ assumptions",
    requirements: [
      "คำนวณ monthly requests, avg RPS และ peak RPS สำหรับวันละ 86,400 วินาที โดยเก็บค่ากลางก่อนจัดรูปแบบ",
      "ใช้เวลาเฉลี่ยในขอบเขตเดียวกันคำนวณ peak in-flight ด้วย Little’s Law",
      "คิด input และ output แยกกันตามราคาต่อล้าน token แล้วใช้ Decimal ตลอดทาง",
      "ปฏิเสธสัดส่วนที่ไม่รวมเป็น 1 และค่า overhead ติดลบหรือไม่ finite จากนั้นคูณต้นทุนเฉลี่ยด้วยจำนวนคำขอและหารผู้ใช้ active",
    ],
    starter: {
      language: "python",
      filename: "capacity_budget.py",
      code: `from dataclasses import dataclass
from decimal import Decimal


D = Decimal
MILLION = D("1000000")
SECONDS_PER_DAY = 86_400


${workloadType}

${pricingTypes}

@dataclass(frozen=True)
class Capacity:
    monthly_requests: int
    avg_rps: Decimal
    peak_rps: Decimal
    peak_in_flight: Decimal


@dataclass(frozen=True)
class Budget:
    thb_per_request: Decimal
    thb_per_month: Decimal
    thb_per_user: Decimal


def capacity(w: Workload) -> Capacity:
    # TODO: derive monthly requests and rates, then apply Little's Law
    raise NotImplementedError


def token_cost(lane: Lane) -> Decimal:
    # TODO: price input and output tokens separately
    raise NotImplementedError


def budget(w: Workload, lanes: list[Lane], overhead: Decimal = D("0")) -> Budget:
    # TODO: validate the mix and compute all-traffic weighted cost
    raise NotImplementedError`,
    },
    verification: {
      language: "python",
      filename: "test_capacity_budget.py",
      code: `from capacity_budget import (
    D, Budget, Capacity, Lane, TokenRate, Workload, budget, capacity, token_cost,
)


${practiceTests}`,
    },
    selfCheck: [
      "เทียบ 540,000 คำขอต่อเดือนกับ 2.50 peak RPS และ 6.0 in-flight",
      "แผนใหม่ 9.72 บาทต่อผู้ใช้ต่ำกว่าเพดาน 12.00 บาท ส่วน baseline 16.20 บาทเกินงบ",
      "เพิ่ม peak factor สองเท่า ผล capacity เพิ่มสองเท่าและงบเท่าเดิมเมื่อยอดรายเดือนคงที่",
    ],
    acceptance: "pytest ผ่าน 6 เคส ครอบคลุม capacity, ราคา, mix, ค่าใช้จ่าย, เดือนที่ไม่มีคำขอ และ input ผิด",
    hints: [
      {
        body: "เริ่มจากเขียนหน่วยให้ครบทุกพจน์ แยก requests/month ออกจาก requests/sec",
      },
      {
        body: "สร้าง Decimal จากสตริง คำนวณ peak โดยคูณ peak factor ที่ตัวเศษก่อนหารวินาที และจัดรูปแบบเฉพาะตอนพิมพ์",
      },
      {
        body: "เฉลยรวม implementation กับ pytest ในไฟล์เดียว คัดลอกแล้วระบุชื่อไฟล์นี้ตอนรัน",
        code: {
          language: "python",
          filename: "capacity_budget_solution.py",
          code: `from dataclasses import dataclass
from decimal import Decimal


D = Decimal
MILLION = D("1000000")
SECONDS_PER_DAY = 86_400


${workloadType}

${pricingTypes}

@dataclass(frozen=True)
class Capacity:
    monthly_requests: int
    avg_rps: Decimal
    peak_rps: Decimal
    peak_in_flight: Decimal


@dataclass(frozen=True)
class Budget:
    thb_per_request: Decimal
    thb_per_month: Decimal
    thb_per_user: Decimal


def capacity(w: Workload) -> Capacity:
    requests = w.users * w.requests_per_user
    seconds = w.days * SECONDS_PER_DAY
    average = D(requests) / seconds
    # Multiply before dividing to avoid rounding a recurring average first.
    peak = D(requests) * w.peak_factor / seconds
    return Capacity(requests, average, peak, peak * w.mean_seconds)


def token_cost(lane: Lane) -> Decimal:
    input_cost = lane.input_tokens * lane.rate.input_per_million
    output_cost = lane.output_tokens * lane.rate.output_per_million
    return (input_cost + output_cost) / MILLION


def budget(w: Workload, lanes: list[Lane], overhead: Decimal = D("0")) -> Budget:
    if sum(lane.share for lane in lanes) != 1:
        raise ValueError("all-traffic shares must sum to one")
    if not overhead.is_finite() or overhead < 0:
        raise ValueError("overhead must be finite and non-negative")

    per_request = overhead + sum(lane.share * token_cost(lane) for lane in lanes)
    monthly = per_request * w.users * w.requests_per_user
    return Budget(per_request, monthly, monthly / w.users)

# Solution tests
${practiceTests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: "uv run --python 3.12 --with pytest pytest -q test_capacity_budget.py\nuv run --python 3.12 --with pytest pytest -q capacity_budget_solution.py",
    },
  },

  mistakes: [
    {
      title: "ใช้ peak RPS คูณทั้งเดือน",
      symptom: "ประมาณยอดคำขอสูงเกิน workload",
      fix: "ใช้ active users คูณคำขอต่อคนสำหรับงบ และ peak สำหรับ capacity",
    },
    {
      title: "ใช้ p95 TTFT แทน W",
      symptom: "L สื่อถึงคนรอจนจบทั้งระบบไม่ได้",
      fix: "ใช้ mean end-to-end ใน boundary เดียวกัน และเก็บ p95 TTFT ดูประสบการณ์แยก",
    },
    {
      title: "เอาเปอร์เซ็นต์เฉพาะ miss มารวมกับ hit",
      symptom: "ผลรวมสัดส่วนมากกว่า 100% และงบเพี้ยน",
      fix: "แปลงให้ทุก lane หารด้วยคำขอเข้า service ทั้งหมด",
    },
    {
      title: "คิดว่า hit ฟรีทุกด้าน",
      symptom: "lookup, embedding หรือ infrastructure หายจากรายงาน",
      fix: "ใส่ overhead ตามขอบเขตที่ระบุและเก็บ trace usage แยกตาม route",
    },
  ],
  quiz: {
    intro: "ลองคิดหน่วยและตัวหารก่อนเลือกคำตอบทั้งสี่ข้อ",
    questions: [
      mc(
        "d147-q1",
        "ผู้ใช้ 10,000 คน คนละ 54 คำขอต่อเดือน ยอดรวมเท่าไร?",
        [
          ["2.50","เป็น peak RPS"],
          ["54,000","จำนวนผู้ใช้ถูกคูณไม่ครบ"],
          ["540,000","คูณจำนวนคนด้วยคำขอต่อคน"],
          ["2,592,000","เป็นจำนวนวินาทีใน 30 วัน"],
        ],
        "C",
        "ผลในหน่วย requests/month คือ 10,000 × 54",
        "ตัวเลขวินาทีต่อเดือนใช้กับอะไร?",
        "แปลงยอดคำขอเป็น average RPS",
      ),
      mc(
        "d147-q2",
        "พีก 2.5 RPS ใช้เวลาเฉลี่ย 2.4 วินาที ได้ L เท่าไร?",
        [
          ["6.0 คำขอ","อัตราคูณเวลา"],
          ["4.9 คำขอ","ไม่ใช้การบวก"],
          ["1.04 คำขอ","ไม่ใช้การหาร"],
          ["2.4 คำขอ","ยังไม่ได้คูณอัตรา"],
        ],
        "A",
        "2.5 × 2.4 = 6.0 in-flight โดยเฉลี่ยในช่วงพีกที่ใช้วัด",
        "L คือเพดาน concurrency ไหม?",
        "เป็นค่าเฉลี่ย ต้องทดสอบขนาดระบบและ headroom แยก",
      ),
      mc(
        "d147-q3",
        "แผนใหม่เสียค่า token กับ lookup ต่อคน active เท่าไร?",
        [
          ["12.00 บาท","นี่คือเพดาน"],
          ["16.20 บาท","นี่คือ baseline"],
          ["0.18 บาท","ราคานี้ต่อคำขอ"],
          ["9.72 บาท","0.18 คูณ 54 คำขอต่อคน"],
        ],
        "D",
        "97,200 บาทต่อเดือนหาร 10,000 ผู้ใช้ ได้ 9.72 บาทต่อคน",
        "แผนใหม่ประหยัดเท่าไรในแล็บ?",
        "40% จาก baseline 162,000 บาทต่อเดือน",
      ),
      mc(
        "d147-q4",
        "ถ้า peak factor เพิ่มจาก 12 เป็น 24 และสมมติฐานอื่นเท่าเดิม?",
        [
          ["งบเป็นสองเท่า","ยอดคำขอทั้งเดือนไม่ขยับ"],
          ["L เพิ่มเป็น 12 ค่าใช้จ่ายรายเดือนเท่าเดิม","peak RPS เพิ่มเป็น 5"],
          ["L คงที่เพราะยอดรายเดือนเท่าเดิม","rate ช่วงพีกสูงขึ้น"],
          ["ค่าเฉลี่ย RPS เพิ่มสองเท่า","average มาจากยอดเดิมและช่วงเวลาเดิม"],
        ],
        "B",
        "เพิ่มความกระจุกตัวโดยรักษาปริมาณทั้งเดือนคงเดิม ผลคือ peak RPS และ L ในสมมติฐานเดิมเพิ่มสองเท่า",
        "อะไรต้องวัดใหม่ตอนเปิดระบบ?",
        "mean latency และ SLO ภายใต้พีกจริง",
      ),
    ],
  },
  takeaways: [
    "แยกยอดคำขอรายเดือนสำหรับงบออกจาก peak RPS สำหรับ capacity",
    "ใช้ L = λ × W กับค่าเฉลี่ยในขอบเขตเดียวกันก่อนยืนยันด้วย load test",
    "เก็บราคาสมมติและ share ทุก lane พร้อมงบต่อผู้ใช้ ก่อนนำไปเทียบกับ eval ใน D148",
  ],
  reviewCards: [
    rc(
      "d147-r1",
      "ทำไมใช้ Decimal ในงานนี้?",
      "ให้คำนวณราคาฐานสิบและเกณฑ์งบอย่างสอดคล้อง ปัดเมื่อแสดงผล",
    ),
    rc(
      "d147-r2",
      "ถ้า hit มีศูนย์ output token คือฟรีไหม?",
      "อาจยังมีค่า lookup และพื้นที่แคช คิดตามต้นทุนในขอบเขตที่ประกาศ",
    ),
    rc(
      "d147-r3",
      "ใช้ peak RPS หรือ average RPS หางบ?",
      "ใช้ยอดเดือน หรือ average RPS คูณวินาทีในช่วงเดียวกัน",
    ),
  ],
  sources: [
    {
      label: "J. D. C. Little · A Proof for the Queuing Formula L = λW",
      href: "https://doi.org/10.1287/opre.9.3.383",
    },
    {
      label: "Python · Decimal fixed-point and floating-point arithmetic",
      href: "https://docs.python.org/3/library/decimal.html",
    },
    {
      label: "OpenTelemetry · GenAI metrics",
      href: "https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/",
    },
  ],
  glossary: ["rate-limit","caching","ttft","golden-dataset"],
});
