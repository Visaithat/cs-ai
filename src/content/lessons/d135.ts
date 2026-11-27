import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const setupCode = `from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class Generation(BaseModel):
    model: str
    input_tokens: int | None = Field(default=None, ge=0)
    output_tokens: int | None = Field(default=None, ge=0)


class RequestSample(BaseModel):
    route: Literal["expense-policy", "leave-policy"] = "expense-policy"
    duration_ms: int = Field(ge=0)
    ok: bool = True
    generations: list[Generation] = Field(default_factory=list)


class Window(BaseModel):
    minute: int = Field(ge=0)
    requests: int = Field(ge=0)
    errors: int = Field(ge=0)
    p50_ms: int | None
    p95_ms: int | None
    input_tokens: int
    output_tokens: int
    priced_calls: int
    total_calls: int
    known_cost_usd: Decimal


# Fictional USD per million tokens: (input, output).
RATES = {"mock-thai-mini": (Decimal("0.25"), Decimal("1.00"))}
MILLION = Decimal("1000000")`;

const testCode = `from decimal import Decimal

import pytest

from rag_dashboard import (
    Generation, RequestSample, alerting_minutes, fixture, nearest_rank, summarize,
)


def test_nearest_rank_checks_exact_rank_and_small_sample():
    assert nearest_rank(list(range(20, 0, -1)), 50) == 10
    assert nearest_rank(list(range(1, 21)), 95) == 19
    assert nearest_rank([15, 9], 95) == 15
    with pytest.raises(ValueError):
        nearest_rank([], 95)


def test_cost_counts_retries_and_keeps_unknown_price_separate():
    known = Generation(model="mock-thai-mini", input_tokens=420, output_tokens=38)
    unknown = Generation(model="unknown", input_tokens=5, output_tokens=1)
    sample = RequestSample(duration_ms=100, ok=False, generations=[known, known, unknown])
    row = summarize(1, [sample])
    assert (row.requests, row.errors, row.total_calls, row.priced_calls) == (1, 1, 3, 2)
    assert (row.input_tokens, row.output_tokens) == (845, 77)
    assert row.known_cost_usd == Decimal("0.000286")


def test_alerts_only_on_second_breach_and_resets_at_gap():
    slow = [fixture(minute, (1600, 1900)) for minute in [1, 2, 3, 5, 6]]
    assert alerting_minutes(list(reversed(slow))) == [2, 6]


def test_low_volume_and_exact_threshold_break_streak():
    slow = fixture(1, (1600, 1900))
    low_n = summarize(2, [RequestSample(duration_ms=2000)])
    threshold = fixture(4, (1200, 1500))
    assert alerting_minutes([slow, low_n, fixture(3, (1600, 1900)), threshold]) == []


def test_duplicate_minute_rejected():
    with pytest.raises(ValueError):
        alerting_minutes([fixture(9, (450, 900)), fixture(9, (1600, 1900))])`;

/** Day 135 · Phase 5 · Block B34 */
export const d135: Lesson = defineLesson({
  day: 135,
  titleTh: "อ่าน Dashboard ต้นทุน, Latency (P50/P95) และ Token พร้อมตั้ง Alert",
  tagline: "30 นาที · คำนวณ tail latency และต้นทุนต่อหน้าต่างเวลา ตั้ง alert ที่มีเงื่อนไขชัดเจน",
  icon: "bar-chart-3",
  visual: {
    id: "latency-cost-dashboard",
    title: "Latency, Cost และ Token Dashboard",
    caption: "เทียบ P50 กับ P95 ในหน้าต่างเดียวกัน อ่านจำนวน request และ coverage ก่อนเปิด waterfall ของคำขอช้า",
    alt: "แดชบอร์ดแสดง latency เปอร์เซ็นไทล์ P50 และ P95 พร้อม request count, token usage, cost และเส้น threshold",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ request fixtures และตารางราคาสมมติบนเครื่อง ไม่มี API key หรือค่าโทรโมเดล",
  tools: ["Python 3.12","uv","Pydantic v2","pytest","Langfuse Dashboards"],

  bigPicture: [
    {
      node: 0,
      heading: "ความเร็วช่วงปกติยังดี แต่มีคนเจอหางช้า",
      body: "ทีม RAG ได้เรื่องร้องเรียนช่วงเที่ยงแม้คนส่วนใหญ่ตอบกลับในสามร้อยมิลลิวินาที ต้องวัดการกระจายของเวลาที่ระดับ request",
      lessonNote: "ตั้งฐานเทียบโดยเลือก route และ environment เดียวกัน",
    },
    {
      node: 1,
      heading: "กำหนดหน่วยและตัวหาร",
      body: "ระยะ request วัดเป็นมิลลิวินาที ส่วน token และราคาวัดที่ระดับแต่ละ generation แล้วบวกข้าม retry ที่คิดเงิน",
      lessonNote: "หนึ่ง request อาจมีหลาย generation หรือไม่มีเลยเมื่อ abstain",
    },
    {
      node: 5,
      heading: "เปลี่ยนเวลาให้เห็นช่วงปัญหา",
      body: "ใช้ P50/P95 พร้อม volume และอัตรา error และวาง cost/usage coverage คู่กัน",
      lessonNote: "ระวังกราฟจาก trace ที่ sample อาจมองไม่เห็น traffic ทั้งหมด",
    },
    {
      node: 6,
      heading: "แจ้งเตือนเมื่อช้ามีน้ำหนักพอ",
      body: "ตั้งเกณฑ์จำนวนตัวอย่างขั้นต่ำและรอสองหน้าต่างติดกันก่อนแจ้ง",
      lessonNote: "D136 จะใช้หน้าต่างช้าเปิด trace เพื่อแยกว่าเวลาหายไปส่วนใด",
    },
  ],

  objectives: [
    "คำนวณ P50/P95 แบบ nearest rank จาก request duration และอธิบายผลด้วยจำนวนตัวอย่าง",
    "รวม input/output token และต้นทุน USD แยกตาม generation พร้อมรายงานส่วนที่คำนวณราคาได้",
    "เขียนเงื่อนไข alert แบบหน้าต่างต่อเนื่อง และเลือก trace จากช่วงเวลาที่ตรงกับเหตุการณ์",
  ],

  prerequisites: [
    "D66 · ความยาวข้อความกับ token count เป็นคนละเรื่อง",
    "D75–D76 · Streaming, {{ttft}} และตัวนับ token/cost",
    "D133–D134 · Span duration, usage fields และ generation ใน {{langfuse}}",
  ],

  setup: {
    intro: "สร้างแดชบอร์ดแบบพิมพ์ตารางบน terminal โดยจำลอง request ต่อนาทีของ route ถามนโยบายเบิกค่าเดินทาง",
    commands: `uv init --python 3.12 b34-d135
cd b34-d135
uv add pydantic
uv add --dev pytest
uv run python --version`,
    steps: [
      ["python", "ตรวจว่า Python เป็นรุ่น 3.12"],
      ["deps", "ติดตั้ง pydantic และ pytest สำเร็จ"],
      ["files", "เตรียม rag_dashboard.py และ test_rag_dashboard.py ตามขั้นตอนของบทเรียน"],
    ],
    note: "ตัวอย่างถือว่าแต่ละนาทีเป็นหน้าต่างที่จบแล้วและกำหนด minute เป็นเลขนับต่อเนื่อง ราคาต่อหนึ่งล้าน token ตั้งไว้เพื่อฝึกและใช้ Decimal รักษาความแม่นของการรวม",
  },

  concepts: [
    {
      id: "nearest-rank",
      title: "1 · P50 และ P95 จากหน้าต่างเวลาหนึ่งช่วง",
      paragraphs: [
        "เรียง duration จากน้อยไปมาก ใช้ตำแหน่งแบบหนึ่งฐานเท่ากับการปัดขึ้นของ p คูณ n แล้วหารด้วยหนึ่งร้อย จากนั้นอ่าน ordered ที่ index ตำแหน่งลบหนึ่ง สำหรับยี่สิบคำขอ P50 คือตัวที่สิบ และ P95 คือตัวที่สิบเก้า",
        "P50 สะท้อนประสบการณ์ตรงกลางของชุดตัวอย่าง ส่วน P95 เป็นเกณฑ์ที่มีคำขออย่างน้อยเก้าสิบห้าเปอร์เซ็นต์ทำเสร็จในเวลานั้นหรือน้อยกว่า ค่า P95 ยังอาจต่ำกว่าเวลาของคำขอที่ช้าที่สุด",
        "งานจริงใช้ histogram หรือ distribution เพื่อรวมข้อมูลข้าม instance แล้วค่อยประมาณ percentile เปรียบเทียบกราฟที่นิยามวิธีคำนวณตรงกัน ผลประมาณจาก bucket อาจต่างจาก nearest rank ที่คำนวณจากข้อมูลดิบในแลบ",
      ],
      analogy: "เหมือนจัดนักวิ่งตามเวลาถึงเส้นชัยแล้วชี้คนลำดับที่สิบเก้าจากยี่สิบคน เราเห็นเส้นแบ่งก่อนกลุ่มท้ายสุด โดยยังเก็บเวลาของคนสุดท้ายแยกได้",
      bullets: [
        "ดูเวลาที่ root ของ request และกำหนดชัดว่ารวมเวลาที่ error/timeout ไหม แลบนี้รวมทุก request แล้วพิมพ์ errors แยกได้",
        "TTFT วัดเวลาถึง token แรกและ total latency วัดจนจบคำตอบ การ streaming อาจทำให้ทั้งสองค่าเคลื่อนไหวต่างกัน",
        "เมื่อมีตัวอย่างน้อย P95 มักเท่ากับค่าสูงสุด ให้แสดง n และใช้ขั้นต่ำใน alert",
      ],
      code: {
        language: "python",
        filename: "rank_demo.py",
        code: `from rag_dashboard import nearest_rank

baseline = [300] * 18 + [450, 900]
incident = [300] * 18 + [1600, 1900]
for values in (baseline, incident):
    print(
        "n", len(values),
        "p50", nearest_rank(values, 50),
        "p95", nearest_rank(values, 95),
        "max", max(values),
    )`,
        caption: "หลังประกอบ worked example จะได้ 300/450 และ 300/1600 สำหรับ P50/P95",
      },
      whyTitle: "ดู tail โดยใช้ชุดข้อมูลที่มีความหมาย",
      whyParagraphs: [
        "อย่าเฉลี่ย P95 ของหลาย instance เพื่อหา P95 รวม เพราะ instance เล็กและใหญ่มีจำนวนคำขอไม่เท่ากัน และ percentile ไม่ใช่ค่าที่รวมด้วยการเฉลี่ย",
        "ปรับช่วงเวลาและ route ให้ตรงกันก่อนเทียบ release ถ้า traffic mix เปลี่ยน ค่า aggregate อาจขยับแม้ทุก route เร็วเท่าเดิม",
      ],
    },
    {
      id: "cost-and-coverage",
      title: "2 · คิดต้นทุนและ token จาก generation ที่เกิดจริง",
      paragraphs: [
        "ในราคาแบบแยก input กับ output ให้นำ input tokens คูณ input rate และ output tokens คูณ output rate แล้วหารด้วยหนึ่งล้าน ถ้าราคาอยู่ใน USD ต่อหนึ่งล้าน token ตัวอย่าง 420 และ 38 รวมเป็น 0.000143 USD ต่อ generation",
        "ในคำขอหนึ่งอาจเรียกโมเดลครั้งแรกแล้ว retry อีกหนึ่งครั้ง ถ้า provider คิดเงินทั้งคู่ ให้รวม usage ทั้งสองรายการแม้ผลสุดท้ายตอบครั้งเดียว เคสที่ abstain ก่อนเรียกโมเดลมีจำนวน generation เป็นศูนย์",
        "คอลัมน์ priced_calls เทียบกับ total_calls บอก coverage ของยอด known_cost_usd ถ้าไม่มีราคาโมเดลหรือ usage ขาดไปส่วนหนึ่ง ต้นทุนของ call นั้นยังไม่ทราบ แต่ token ด้านที่รายงานแล้วนับเข้ายอด known usage ได้",
      ],
      analogy: "เหมือนรวมบิลร้านค้าตามรายการ ซื้อสองชิ้นต้องรวมทั้งสองใบ แต่ใบที่ยังไม่ออกไม่ควรเขียนราคาศูนย์ลงไป",
      bullets: [
        "ราคาจริงอาจแยก cache read, cache write หรือ service tier แลบใช้โมเดลราคาแบนเพื่อให้เห็นหน่วยและสูตรก่อน",
        "Langfuse รับ usage_details หรือ cost_details จาก SDK และอาจประมาณตาม model definitions ตรวจรุ่นและ coverage เทียบใบแจ้งหนี้",
        "เก็บยอดรวมและค่าเฉลี่ยต่อ request แยกกัน หาก normalize ต่อพันคำขอ ให้หารด้วยจำนวน request ตามขอบเขตที่รายงานแล้วคูณหนึ่งพัน",
      ],
      code: {
        language: "python",
        filename: "cost_demo.py",
        code: `from rag_dashboard import Generation, RequestSample, summarize

sample = RequestSample(duration_ms=310, generations=[
    Generation(model="mock-thai-mini", input_tokens=420, output_tokens=38),
    Generation(model="unknown-model", input_tokens=200, output_tokens=18),
])
row = summarize(10, [sample])
assert str(row.known_cost_usd) == "0.000143"
print(row.input_tokens, row.output_tokens)
print(row.priced_calls, row.total_calls)`,
        caption: "ราคาที่ทราบรวมเพียงหนึ่งรายการ แม้เรานับ usage ที่รู้ครบทั้งสองรายการ",
      },
      whyTitle: "ต้นทุนต้องอ่านร่วมกับ coverage",
      whyParagraphs: [
        "ถ้าเปลี่ยนชื่อรุ่นแล้ว dashboard ราคาเป็นศูนย์ ให้ตรวจ mapping ก่อนฉลองว่าค่าใช้จ่ายลดลง",
        "ต้นทุนสูงขึ้นพร้อม input tokens อาจสัมพันธ์กับ prompt/context โตขึ้น ให้เปิด trace จาก route เดียวกันดู prompt version กับจำนวนหลักฐานก่อนเลือกจุดปรับ",
      ],
    },
    {
      id: "window-alerts",
      title: "3 · Alert ต้องมีช่วงเวลา เกณฑ์ volume และข้อมูลสืบเหตุ",
      paragraphs: [
        "นิยามของแลบคือ P95 มากกว่า 1,200 มิลลิวินาทีและมีอย่างน้อย 20 คำขอต่อหน้าต่างหนึ่งนาที แจ้งเมื่อผ่านเงื่อนไขสองหน้าต่างติดกัน และแจ้งครั้งเดียวจน streak ขาด",
        "ถ้าหน้าต่างข้อมูลหายไปหรือมีคำขอน้อยกว่าขั้นต่ำ ให้รีเซ็ต streak แทนการต่อช่วงที่ยังไม่มีหลักฐาน ตั้งสัญญาณ no-data แยกสำหรับ production เพื่อรู้ว่า collector หรือ ingestion มีปัญหา",
        "ใน Langfuse ทำกราฟ latency, volume, token, cost และแบ่งตามคุณลักษณะที่รองรับ ส่วนกติกาสองหน้าต่างเป็น implementation ของแลบ หากใช้ monitoring system ภายนอกให้ map เป็นเงื่อนไขการแจ้งเตือนตาม semantics ของระบบนั้น",
      ],
      analogy: "เหมือนวัดอุณหภูมิซ้ำสองรอบก่อนโทรหาคนดูแล ต้องมีค่าจากทั้งสองรอบ ถ้ารอบใดเครื่องวัดดับ แยกเรื่องเครื่องวัดออกจากเรื่องอุณหภูมิ",
      bullets: [
        "แนบเวลา environment, route, P95, n และลิงก์ไปยัง filter ของ trace ในข้อความแจ้งเตือน",
        "ใช้ bounded labels เช่น route และ release ที่จัดการได้ หลีกเลี่ยงการใส่ trace ID หรือข้อความผู้ใช้เป็น label ของ metric",
        "ถ้าใช้ sampled tracing ให้วัด request latency และ volume จาก metrics ที่ครอบคลุม traffic ตามนิยาม แล้วใช้ waterfall เป็นหลักฐานจากตัวอย่าง",
      ],
      code: {
        language: "python",
        filename: "alert_snapshot.py",
        code: `from rag_dashboard import breaches, fixture, summarize

healthy = fixture(10, (450, 900))
slow = fixture(11, (1600, 1900))
no_data = summarize(12, [])
for window in (healthy, slow, no_data):
    if breaches(window):
        print(f"breach minute={window.minute} n={window.requests}")
    elif window.p95_ms is None:
        print(f"no data minute={window.minute}")`,
        caption: "รายงาน breach ที่นาที 11 และ no data ที่นาที 12 แยกกัน",
      },
      whyTitle: "ส่งสัญญาณที่ on-call เปิดหลักฐานต่อได้",
      whyParagraphs: [
        "P95 สูงรอบเดียวอาจเป็น burst ที่หายเอง การรอสองหน้าต่างลด noise แลกกับเวลารอก่อนแจ้ง",
        "ถ้าเวลาทั้งหมดช้าแต่ TTFT คงที่ ให้ตรวจความยาวคำตอบหรือการส่ง streaming หลัง token แรก ส่วน TTFT ช้าด้วยอาจต้องดู queue และขั้นก่อนเรียกโมเดล",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — APM Dashboard กับ insight ที่มาจาก LLM",
      body: [
        "คิดเหมือนดู Sentry Performance หรือ Datadog APM ที่แจกแจง request latency ตาม route งาน LLM เพิ่ม input/output usage และ model price เพื่ออ่านการใช้จ่ายคู่กับเวลา",
      ],
      table: [
        ["P50/P95","การกระจายเวลา response แยก route และ environment"],
        ["Token usage","ขนาดงานของ model call แยก input กับ output"],
        ["Coverage","กี่ calls ที่ประเมินค่าใช้จ่ายได้"],
        ["Alert context","ช่วงเวลาของเคสสำหรับ drill down ไป trace"],
      ],
    },
    student: {
      title: "First-Year Note — ลำดับแบบหนึ่งฐานกับ index แบบศูนย์ฐาน",
      body: [
        "เมื่อ n เท่ากับ 20 P95 ชี้ตำแหน่งที่ 19 เพราะ 95 คูณ 20 หาร 100 ได้ 19 พอดี แต่ Python list ต้องเข้าที่ index 18",
        "ถ้า n เท่ากับ 21 ตำแหน่งที่คำนวณได้ 19.95 ปัดขึ้นเป็น 20 จึงเข้าที่ index 19",
      ],
    },
  },

  workedExample: {
    intro: "ก่อนและหลังช่วงเที่ยง ให้จำลองสามหน้าต่างที่คำขอส่วนใหญ่ใช้เวลา 300 มิลลิวินาที ดูว่ากลุ่มท้ายขยับแค่ไหน และค่าใช้จ่ายต่อหน้าต่างเปลี่ยนหรือไม่ ให้ต่อโค้ด Python จากทั้งสามขั้นเรียงลงในไฟล์ rag_dashboard.py แล้วรันด้วย uv run python rag_dashboard.py ครับ",
    steps: [
      {
        title: "1 · ระบุขอบเขตของ request และ generation",
        explain: "ใช้ schema แยก request duration จาก model calls เพื่อรวม retry ได้โดย latency ยังนับหนึ่ง sample ต่อ request ตั้งราคา input/output แยกด้วย Decimal",
        code: {
          language: "python",
          filename: "rag_dashboard.py",
          code: setupCode,
        },
      },
      {
        title: "2 · รวมเปอร์เซ็นไทล์และค่าใช้จ่ายที่ทราบ",
        explain: "ใช้ integer ceiling สำหรับ nearest rank และรวม token ที่รายงาน ส่วน cost ต้องมี usage ทั้งสองด้านและราคา การกรอง route/เวลาอยู่ที่ผู้เรียก",
        code: {
          language: "python",
          filename: "rag_dashboard.py",
          code: `def nearest_rank(values: list[int], percent: int) -> int:
    if not 1 <= percent <= 100 or not values:
        raise ValueError("expected samples and a percentile from 1 to 100")
    ordered = sorted(values)
    rank = (percent * len(ordered) + 99) // 100
    return ordered[rank - 1]


def estimate_cost(call: Generation) -> Decimal | None:
    rates = RATES.get(call.model)
    if rates is None or call.input_tokens is None or call.output_tokens is None:
        return None
    input_rate, output_rate = rates
    return (call.input_tokens * input_rate + call.output_tokens * output_rate) / MILLION


def summarize(minute: int, samples: list[RequestSample]) -> Window:
    # The caller has already filtered the intended time window and route.
    latency = [sample.duration_ms for sample in samples]
    calls = [call for sample in samples for call in sample.generations]
    costs = [cost for call in calls if (cost := estimate_cost(call)) is not None]
    return Window(
        minute=minute,
        requests=len(samples),
        errors=sum(not sample.ok for sample in samples),
        p50_ms=nearest_rank(latency, 50) if latency else None,
        p95_ms=nearest_rank(latency, 95) if latency else None,
        input_tokens=sum(call.input_tokens or 0 for call in calls),
        output_tokens=sum(call.output_tokens or 0 for call in calls),
        priced_calls=len(costs),
        total_calls=len(calls),
        known_cost_usd=sum(costs, Decimal("0")),
    )`,
        },
      },
      {
        title: "3 · สร้างหน้าต่างจำลองแล้วตรวจ breach ทีละนาที",
        explain: "baseline มี P95 450 มิลลิวินาที อีกสองช่วงอยู่ที่ 1600 และ 1650 มิลลิวินาที ทุกช่วงมี token เท่ากัน จึงต้องดู trace ต่อเพื่อหาเวลาที่เพิ่มขึ้น แบบฝึกหัดจะเพิ่มการนับ streak",
        code: {
          language: "python",
          filename: "rag_dashboard.py",
          code: `def breaches(window: Window) -> bool:
    return window.requests >= 20 and window.p95_ms is not None and window.p95_ms > 1200


def fixture(minute: int, tail: tuple[int, int]) -> Window:
    model_call = Generation(model="mock-thai-mini", input_tokens=420, output_tokens=38)
    samples = [
        RequestSample(duration_ms=duration, generations=[model_call])
        for duration in [300] * 18 + list(tail)
    ]
    return summarize(minute, samples)


def main() -> None:
    healthy = fixture(10, (450, 900))
    slow = fixture(11, (1600, 1900))
    second_slow = fixture(12, (1650, 1800))
    for row in (healthy, slow, second_slow):
        print(
            f"minute={row.minute} n={row.requests} "
            f"p50={row.p50_ms}ms p95={row.p95_ms}ms "
            f"in={row.input_tokens} out={row.output_tokens} "
            f"cost_usd={row.known_cost_usd:.5f} "
            f"priced={row.priced_calls}/{row.total_calls} "
            f"breach={breaches(row)}"
        )


if __name__ == "__main__":
    main()`,
        },
        output: `minute=10 n=20 p50=300ms p95=450ms in=8400 out=760 cost_usd=0.00286 priced=20/20 breach=False
minute=11 n=20 p50=300ms p95=1600ms in=8400 out=760 cost_usd=0.00286 priced=20/20 breach=True
minute=12 n=20 p50=300ms p95=1650ms in=8400 out=760 cost_usd=0.00286 priced=20/20 breach=True`,
      },
    ],
    gotcha: "ตัวอย่างเก็บระยะ root รวมทั้ง request ที่ล้มเหลว ถ้า response ผิดพลาดเร็วมาก P95 อาจดีขึ้นทั้งที่ระบบแย่ลง ให้แสดง error count และ rate คู่กับกราฟเสมอ",
  },

  practice: {
    intro: "ต่อจากการตรวจ breach ของแต่ละนาที ให้เขียน alerting_minutes เพื่อแจ้งเฉพาะเมื่อมี breach ต่อเนื่องสองนาทีใน route เดียว",
    requirements: [
      "รับ Window ที่เรียงไม่แน่นอนและเรียงตาม minute เอง ปฏิเสธ minute ซ้ำเพื่อกันนับซ้ำ",
      "ใช้ breaches ที่นิยาม volume อย่างน้อย 20 และ P95 สูงกว่า 1,200 มิลลิวินาที",
      "เมื่อมี minute ขาดหรือเงื่อนไขไม่ผ่านให้เริ่ม streak ใหม่ แจ้งเมื่อ streak ถึงสองและงดแจ้งซ้ำในช่วงต่อเนื่องเดียวกัน",
      "ใช้ nearest rank เท่าเดิม และคงการรายงาน usage กับต้นทุนที่ทราบเพื่อเทียบก่อนหลัง",
    ],
    starter: {
      language: "python",
      filename: "rag_dashboard.py",
      code: `${setupCode}

def nearest_rank(values: list[int], percent: int) -> int:
    if not 1 <= percent <= 100 or not values:
        raise ValueError("expected samples and a percentile from 1 to 100")
    ordered = sorted(values)
    rank = (percent * len(ordered) + 99) // 100
    return ordered[rank - 1]


def estimate_cost(call: Generation) -> Decimal | None:
    rates = RATES.get(call.model)
    if rates is None or call.input_tokens is None or call.output_tokens is None:
        return None
    input_rate, output_rate = rates
    return (call.input_tokens * input_rate + call.output_tokens * output_rate) / MILLION


def summarize(minute: int, samples: list[RequestSample]) -> Window:
    # The caller has already filtered the intended time window and route.
    latency = [sample.duration_ms for sample in samples]
    calls = [call for sample in samples for call in sample.generations]
    costs = [cost for call in calls if (cost := estimate_cost(call)) is not None]
    return Window(
        minute=minute,
        requests=len(samples),
        errors=sum(not sample.ok for sample in samples),
        p50_ms=nearest_rank(latency, 50) if latency else None,
        p95_ms=nearest_rank(latency, 95) if latency else None,
        input_tokens=sum(call.input_tokens or 0 for call in calls),
        output_tokens=sum(call.output_tokens or 0 for call in calls),
        priced_calls=len(costs),
        total_calls=len(calls),
        known_cost_usd=sum(costs, Decimal("0")),
    )

def breaches(window: Window) -> bool:
    return window.requests >= 20 and window.p95_ms is not None and window.p95_ms > 1200

def alerting_minutes(windows: list[Window]) -> list[int]:
    # TODO: sort and reject duplicate minute values.
    # TODO: reset the streak for a missing minute or non-breach.
    # TODO: emit only when a streak reaches two.
    raise NotImplementedError("implement the two-window alert")

def fixture(minute: int, tail: tuple[int, int]) -> Window:
    model_call = Generation(model="mock-thai-mini", input_tokens=420, output_tokens=38)
    samples = [
        RequestSample(duration_ms=duration, generations=[model_call])
        for duration in [300] * 18 + list(tail)
    ]
    return summarize(minute, samples)


def main() -> None:
    healthy = fixture(10, (450, 900))
    slow = fixture(11, (1600, 1900))
    second_slow = fixture(12, (1650, 1800))
    for row in (healthy, slow, second_slow):
        print(
            f"minute={row.minute} n={row.requests} "
            f"p50={row.p50_ms}ms p95={row.p95_ms}ms "
            f"in={row.input_tokens} out={row.output_tokens} "
            f"cost_usd={row.known_cost_usd:.5f} "
            f"priced={row.priced_calls}/{row.total_calls} "
            f"breach={breaches(row)}"
        )


if __name__ == "__main__":
    main()`,
    },
    verification: {
      language: "python",
      filename: "test_rag_dashboard.py",
      code: testCode,
    },
    selfCheck: [
      "ข้อมูล 20 ค่าใช้ลำดับที่ 19 เป็น P95",
      "เมื่อมีราคาหายไป รู้ได้จาก priced_calls และ cost รวมเฉพาะยอดที่รู้",
      "หน้าต่างเตือนติดกันสามช่วงแจ้งครั้งเดียว และเมื่อมี gap ต้องสะสมใหม่",
    ],
    acceptance: "ผ่าน pytest ห้าเคสและเห็น alert_minutes เป็น [12] เมื่อรันเฉลยกับ fixture หลัก",
    hints: [
      { body: "แยก state ของตัวนับ streak จาก Window ซึ่งแทนเฉพาะผลสรุปหนึ่งนาที เมื่อเงื่อนไขขาดให้ streak เป็นศูนย์" },
      { body: "เปรียบเทียบ minute กับ last_minute ทั้งค่าซ้ำและข้ามช่วง เมื่อ breaches เป็นจริงให้บวกหนึ่ง แล้ว append เฉพาะตอน streak เท่ากับสอง" },
      {
        body: "เฉลยเต็มรวมชุดทดสอบ แยกสองส่วนตามชื่อไฟล์ rag_dashboard.py และ test_rag_dashboard.py ก่อนรัน pytest",
        code: {
          language: "python",
          filename: "rag_dashboard.py / test_rag_dashboard.py",
          code: `# rag_dashboard.py
${setupCode}


def nearest_rank(values: list[int], percent: int) -> int:
    if not 1 <= percent <= 100 or not values:
        raise ValueError("expected samples and a percentile from 1 to 100")
    ordered = sorted(values)
    rank = (percent * len(ordered) + 99) // 100
    return ordered[rank - 1]


def estimate_cost(call: Generation) -> Decimal | None:
    rates = RATES.get(call.model)
    if rates is None or call.input_tokens is None or call.output_tokens is None:
        return None
    input_rate, output_rate = rates
    return (call.input_tokens * input_rate + call.output_tokens * output_rate) / MILLION


def summarize(minute: int, samples: list[RequestSample]) -> Window:
    # The caller has already filtered the intended time window and route.
    latency = [sample.duration_ms for sample in samples]
    calls = [call for sample in samples for call in sample.generations]
    costs = [cost for call in calls if (cost := estimate_cost(call)) is not None]
    return Window(
        minute=minute,
        requests=len(samples),
        errors=sum(not sample.ok for sample in samples),
        p50_ms=nearest_rank(latency, 50) if latency else None,
        p95_ms=nearest_rank(latency, 95) if latency else None,
        input_tokens=sum(call.input_tokens or 0 for call in calls),
        output_tokens=sum(call.output_tokens or 0 for call in calls),
        priced_calls=len(costs),
        total_calls=len(calls),
        known_cost_usd=sum(costs, Decimal("0")),
    )


def breaches(window: Window) -> bool:
    return window.requests >= 20 and window.p95_ms is not None and window.p95_ms > 1200


def alerting_minutes(windows: list[Window]) -> list[int]:
    triggered = []
    streak = 0
    last_minute = None
    for window in sorted(windows, key=lambda item: item.minute):
        if last_minute is not None and window.minute == last_minute:
            raise ValueError("expected one window per minute")
        if last_minute is None or window.minute != last_minute + 1:
            streak = 0
        streak = streak + 1 if breaches(window) else 0
        if streak == 2:
            triggered.append(window.minute)
        last_minute = window.minute
    return triggered


def fixture(minute: int, tail: tuple[int, int]) -> Window:
    model_call = Generation(model="mock-thai-mini", input_tokens=420, output_tokens=38)
    samples = [
        RequestSample(duration_ms=duration, generations=[model_call])
        for duration in [300] * 18 + list(tail)
    ]
    return summarize(minute, samples)


def main() -> None:
    healthy = fixture(10, (450, 900))
    slow = fixture(11, (1600, 1900))
    second_slow = fixture(12, (1650, 1800))
    rows = [healthy, slow, second_slow]
    for row in rows:
        print(
            f"minute={row.minute} n={row.requests} "
            f"p50={row.p50_ms}ms p95={row.p95_ms}ms "
            f"in={row.input_tokens} out={row.output_tokens} "
            f"cost_usd={row.known_cost_usd:.5f} "
            f"priced={row.priced_calls}/{row.total_calls} "
            f"breach={breaches(row)}"
        )
    print("alert_minutes", alerting_minutes(rows))


if __name__ == "__main__":
    main()

# test_rag_dashboard.py — copy the block below into its own file

${testCode}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run python rag_dashboard.py
uv run pytest -q`,
    },
  },

  mistakes: [
    {
      title: "เฉลี่ย P95 ที่แต่ละ pod ส่งมา",
      symptom: "ค่าไม่ตรงกับการกระจายรวมของ request",
      fix: "รวมข้อมูลระดับ distribution ด้วย histogram ที่เข้ากัน แล้วคำนวณ percentile",
    },
    {
      title: "รวม token ทุก request เหมือนมี call เดียว",
      symptom: "retry ทำให้ตัวเลขที่คิดต่ำกว่าบิล",
      fix: "รวม usage ต่อ generation และนับ request count แยก",
    },
    {
      title: "ใช้เลขศูนย์แทนราคาไม่ทราบ",
      symptom: "ยอดดูครบทั้งที่ราคาของบางรุ่นยังว่าง",
      fix: "เก็บ raw usage ที่มีและรายงาน cost coverage",
    },
    {
      title: "เอาข้อมูลจากสองช่วงที่ข้ามนาทีมานับติดกัน",
      symptom: "แจ้งเตือนทั้งที่ไม่มีหลักฐานต่อเนื่อง",
      fix: "ตรวจ minute และแยก no-data signal ออกจาก latency breach",
    },
  ],

  quiz: {
    intro: "ตอบตามกติกา nearest rank, cost coverage และ streak ที่ใช้ในแลบ",
    questions: [
      mc(
        "d135-q1",
        "P95 ของข้อมูลเรียงแล้ว 20 ค่าชี้ตำแหน่งที่เท่าไร?",
        [
          ["ตำแหน่ง 18","นี่คือ index แบบเริ่มที่ศูนย์"],
          ["ตำแหน่ง 20","เป็นค่าสูงสุดเมื่อ n เท่ากับยี่สิบ"],
          ["ตำแหน่ง 19","ceil ของ 95 คูณ 20 หาร 100 เท่ากับ 19"],
          ["ตำแหน่ง 10","นี่คือ P50 ตามสูตรเดียวกัน"],
        ],
        "C",
        "ตำแหน่งเริ่มที่หนึ่งและ index เริ่มที่ศูนย์ จึงเข้าที่ ordered[18]",
        "Nearest rank แปลงเป็น index อย่างไร?",
        "หาตำแหน่งแบบปัดขึ้น แล้วลบหนึ่ง",
      ),
      mc(
        "d135-q2",
        "คำขอเดียวมี model call ครั้งแรกและ retry อีกหนึ่งครั้ง โดยทั้งคู่คิดเงิน ควรวัดอย่างไร?",
        [
          ["เก็บ latency หนึ่งค่าและ usage/ต้นทุนทั้งสอง calls","รักษาหน่วย request และ generation แยกกัน"],
          ["เก็บ latency สองค่าจาก request เดียวกัน","ทำให้ request count สูงขึ้นผิดจริง"],
          ["คิดแค่ call สุดท้าย","ตกหล่น token ที่ provider คิดเงิน"],
          ["ไม่คิดเงินเพราะ retry","provider ยังอาจคิดค่าประมวลผล"],
        ],
        "A",
        "เวลา user-facing อยู่ที่ request level ส่วนราคาเกิดตาม calls ที่มีการใช้งาน",
        "คำขอมีหลาย generations ต้องรวมอะไร?",
        "รวม usage/cost ของทุก call ที่คิดเงิน และถือว่าเป็น request เดียว",
      ),
      mc(
        "d135-q3",
        "สองหน้าต่างช้าในนาที 8 และ 10 แต่ไม่มีข้อมูลนาที 9 ควรเตือนตามแลบไหม?",
        [
          ["เตือนนาที 8","ยังไม่ครบสองหน้าต่าง"],
          ["เตือนนาที 10","สองนาทีไม่ต่อเนื่อง"],
          ["เตือนย้อนหลังนาที 9","ช่วงข้อมูลขาดไม่ใช่ breach"],
          ["ยังไม่เตือน latency และติดตาม no-data แยก","ไม่มีหลักฐานครบสองหน้าต่างติดกัน"],
        ],
        "D",
        "การขาดนาทีต้อง reset streak ส่วนคุณภาพ ingestion เป็นคนละสัญญาณ",
        "จะทำอย่างไรถ้าข้อมูลของหนึ่งหน้าต่างขาด?",
        "รีเซ็ต streak และตรวจการรับข้อมูลด้วยสัญญาณแยก",
      ),
      mc(
        "d135-q4",
        "P50 คงเดิม P95 สูง ตัวอย่างคำขอเพียงพอ ควรตรวจอะไรต่อ?",
        [
          ["ลด model size ทันที","ยังไม่มีหลักฐานว่าโมเดลคือคอขวด"],
          ["เปิด traces จาก tail ในหน้าต่างและ route ที่ตรงกัน","ช่วยระบุขั้นที่ยาวและสมมติฐานจาก timeline"],
          ["เพิ่มราคาโมเดลที่ใช้","ราคาไม่บอกว่า operation ไหนช้า"],
          ["ใช้ค่าเฉลี่ยเพื่อยกเลิก alert","ค่าเฉลี่ยกลบอาการของกลุ่มท้ายได้"],
        ],
        "B",
        "เลือก trace จากกลุ่มที่ขยับแล้วเปรียบเทียบกับ baseline ที่เข้าเงื่อนไขเดียวกัน",
        "หลัง tail alert ควรเลือก trace อย่างไร?",
        "เลือกจากช่วงเวลาที่แจ้งเตือนใน route เดียวกัน และเทียบกับ baseline ที่ตรงกัน",
      ),
    ],
  },

  takeaways: [
    "รายงานนิยาม percentile, หน่วยเวลา และ n คู่กับ P50/P95",
    "จัด cost ตาม generation ที่เกิดขึ้นและระบุ coverage เสมอ",
    "Alert มีเงื่อนไขเวลาและ volume พร้อมแนบ context ที่เปิด trace ต่อได้",
    "D136 จะใช้ P95 1600 มิลลิวินาทีเป็นจุดเริ่มต้นตรวจ waterfall ของ route ค่าเดินทาง",
  ],

  reviewCards: [
    rc(
      "d135-rc1",
      "P95 แปลว่าอะไรใน nearest rank?",
      "เวลาที่ตำแหน่ง ceil ของ 95 คูณ n หาร 100 ในข้อมูลเรียงแล้ว",
    ),
    rc(
      "d135-rc2",
      "350 input tokens ที่ 1 USD ต่อหนึ่งล้านคิดเป็นเท่าไร?",
      "0.00035 USD ก่อนรวมค่า output",
    ),
    rc(
      "d135-rc3",
      "เหตุใดต้องมีขั้นต่ำของ request count?",
      "เมื่อ n น้อย tail percentile ไวต่อคำขอเดียว และอาจเตือนจากตัวอย่างไม่พอ",
    ),
  ],

  sources: [
    {
      label: "Langfuse · Metrics",
      href: "https://langfuse.com/docs/metrics/overview",
    },
    {
      label: "Langfuse · Custom Dashboards",
      href: "https://langfuse.com/docs/metrics/features/custom-dashboards",
    },
    {
      label: "Langfuse · Token & Cost Tracking",
      href: "https://langfuse.com/docs/observability/features/token-and-cost-tracking",
    },
    {
      label: "Prometheus · Histograms and Summaries",
      href: "https://prometheus.io/docs/practices/histograms/",
    },
  ],

  glossary: [
    "langfuse",
    "otel",
    "ttft",
    "rag",
    "caching",
    "rate-limit",
  ],
});
