import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D171 — Phase 6 / Block B43
 * Integrate Langfuse Traces & Cost/Latency Telemetry
 */
export const d171: Lesson = defineLesson({
  day: 171,
  titleTh: "เชื่อมต่อ Langfuse Traces และระบบวัดผล Cost / Latency Telemetry",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ติด Span Waterfall ครบทุกชั้น (PDPA → Router → RAG/MCP), คำนวณ P50/P95 Latency และงบต่อ 1,000 คำถาม",
  icon: "activity",
  visual: {
    id: "capstone-eval-telemetry",
    title: "Langfuse Trace Waterfall & Cost/Latency Telemetry ของ Capstone",
    caption: "ติดตามทุกคำขอ 100% ผ่าน trace_id: แยกดูเวลาแต่ละ span (PDPA, Router, Hybrid RAG, Rerank, LLM, MCP) พร้อมคำนวณ P95 และ Cost/1k queries",
    alt: "แผนภาพแสดงการติดตาม trace, latency และต้นทุนของระบบ Capstone ร่วมกับผลการประเมิน 40 เคส",
  },
  requiresApiKey: false,
  apiKeyNote: "รันด้วย Offline CapstoneTracer บนเครื่องคุณได้ 100% (ออกแบบ metadata & spans ตรงสเปก Langfuse SDK / OpenTelemetry)",
  tools: ["Langfuse", "OpenTelemetry", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 5,
      heading: "เปลี่ยนกล่องดำให้เป็น Trace Waterfall ที่สืบสวนได้ 100%",
      body: "ต่อให้ระบบผ่าน Eval 40 ข้อใน D170 แต่ถ้าผู้ใช้จริงบ่นว่า *\"วันนี้อืดจัง\"* หรือ *\"ค่า API เดือนนี้พุ่งผิดปกติ\"* แล้วเราไม่มี trace ดูว่าเสียเวลาหรือ token ตรงขั้นตอนไหน ก็แก้ปัญหาไม่ได้",
      lessonNote: "วันนี้เราติด {{langfuse}} Tracing ตามมาตรฐาน {{otel|OpenTelemetry GenAI}} ให้ครอบคลุมทุกคำขอของ `CoreFlowPipeline` (`trace_id` 100%)",
    },
    {
      node: 4,
      heading: "วัดคอขวดจริงด้วย P50 / P95 Latency แยกราย Span",
      body: "ค่าเฉลี่ย Latency มักซ่อนอาการกระตุกหนักใน 5% สุดท้ายของผู้ใช้ (เช่น รอนาน 6 วินาทีเวลาเจอ Hybrid Search + Rerank + Retry)",
      lessonNote: "ตาม ADR-001 เราตั้งเกณฑ์ **`P95 <= 3,500 ms`** และแยกจับเวลา {{ttft}} กับทุก span (`router`, `retrieval`, `rerank`, `llm`, `mcp`)",
    },
    {
      node: 3,
      heading: "คำนวณ Cost per 1,000 Queries และเชื่อมคะแนน Eval เข้า Trace",
      body: "วิศวกร AI ต้องบอกผู้บริหารได้ทันทีว่าถ้ายิง 10,000 คำถามต่อวันจะมีค่าใช้จ่ายเท่าไร และคำขอไหนที่ได้คะแนน {{groundedness}} ต่ำ",
      lessonNote: "เราบันทึก `input_tokens`, `output_tokens`, `cached_tokens` ({{prompt-caching}}) เพื่อคำนวณ **Cost / 1,000 queries** และแปะ score ลง trace",
    },
    {
      node: 6,
      heading: "ปกป้อง PDPA ก่อนส่ง Telemetry ออกนอกเครื่อง",
      body: "จุดรั่วของข้อมูลที่คนมักลืมไม่ใช่ตัวคำตอบแชตบอต แต่คือ **Observability Logs** ที่เผลอบันทึกเบอร์โทรหรือเลขบัตรประชาชนดิบของลูกค้าลงใน span input",
      lessonNote: "เราจะใส่ตัวตรวจ {{pdpa}} Masking ในชั้น Tracer เพื่อบังคับห้ามเลขบัตร 13 หลักหรือเบอร์มือถือดิบหลุดเข้า {{langfuse}} เด็ดขาด",
    },
  ],

  objectives: [
    "**ออกแบบ Trace & Span Hierarchy** ให้ `CoreFlowPipeline` ตั้งแต่ `pdpa_gate` → `router` → `retrieval`/`mcp` → `llm_generation` พร้อม `trace_id` ครบ 100% และ `prompt_version`",
    "**คำนวณตัวชี้วัดประสิทธิภาพและเศรษฐศาสตร์**: `P50 Latency`, `P95 Latency` (เทียบเกณฑ์ `<= 3,500 ms`), และ **Cost per 1,000 Queries** จากการใช้งาน token จริง",
    "**บังคับ PDPA Privacy Guard ใน Telemetry** เพื่อให้มั่นใจว่าข้อมูลส่วนบุคคลดิบไม่ถูกบันทึกใน trace metadata หรือ span payload ก่อนส่งออก {{langfuse}}",
  ],

  prerequisites: [
    "ผ่านการประเมินและแก้ Top 3 Failure Modes ใน D170 และเข้าใจโครงสร้าง `CoreFlowPipeline` (D168)",
    "เข้าใจแนวคิด Trace, Span, OpenTelemetry GenAI และ Langfuse (แนะนำ Day 133–135)",
    "ใช้งาน `time.perf_counter()`, `Pydantic v2` และ `pytest` ได้",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "สร้างโมดูล `src/telemetry_langfuse.py` ในโปรเจกต์ `thai-enterprise-assistant/` เพื่อบันทึก spans, คำนวณ P50/P95 และประเมินต้นทุนต่อ 1,000 คำถามแบบ offline 100%",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv add pydantic
uv add --dev pytest ruff
# (ทางเลือกเมื่อต่อ Langfuse server จริงผ่าน Docker Compose ใน B44)
# uv add langfuse opentelemetry-sdk`,
    steps: [
      ["deps", "ยืนยันว่า `pydantic`, `pytest` และ `ruff` พร้อมใช้งานในโปรเจกต์"],
      ["env", "เข้าใจการแยกใช้ `CapstoneTracer` แบบ local/memory ใน CI กับ Langfuse SDK จริงใน Staging"],
      ["ready", "พร้อมสร้าง Trace Waterfall, Latency Percentiles และ Cost Calculator"],
    ],
    note: "โครงสร้าง `SpanRecord` และ `TraceSummary` ออกแบบให้แมปกับ `langfuse.observe()` และ `langfuse.score_current_trace()` ได้ตรงตัวโดยไม่ต้องรัน Docker ของ Langfuse ระหว่างรัน unit tests",
  },

  concepts: [
    {
      id: "langfuse-trace-hierarchy",
      title: "1 · โครงสร้าง Trace & Span Waterfall ของ Capstone บน Langfuse",
      paragraphs: [
        "เมื่อผู้ใช้ส่งคำถามเข้ามา 1 ครั้ง ระบบของเราไม่ควรถูกบันทึกเป็นกล่องเดียวทึบ ๆ แต่ควรแตกเป็น **Trace Tree (Parent–Child Spans)** เพื่อให้มองเห็นทันทีว่าเวลาถูกใช้ไปตรงไหน: `root_request` เป็นพ่อใหญ่ ครอบลูก ๆ ได้แก่ `pdpa_gate`, `langgraph_router`, และตามด้วยเส้นทางจริง (`hybrid_retrieval` + `cross_encoder_rerank` + `llm_generation` หรือ `mcp_tool_call`)",
        "แต่ละ Span ต้องพก metadata มาตรฐานตาม {{otel|OpenTelemetry GenAI SemConv}} และ {{langfuse}}: `trace_id` (unique ทุกคำขอ), `parent_span_id`, `span_kind` (`chain` | `retriever` | `generation` | `tool`), `model_name`, {{prompt-versioning|prompt_version}}, `input_tokens`, `output_tokens`, และ `latency_ms`",
        "สิ่งสำคัญที่สุดใน Production คือ **ห้ามส่ง PII ดิบเข้า Telemetry** — ตราบใดที่ span `pdpa_gate` ทำงานก่อนบันทึก payload และ Tracer มีตัวตรวจ regex คัดกรองเลขบัตรประชาชน 13 หลัก/เบอร์โทรไทยซ้ำอีกชั้น คุณจะรอดจากการรั่วข้อมูลใน log 100%",
      ],
      analogy:
        "เหมือนใบเสร็จและกล้องติดตามพัสดุแบบแยกขั้นตอน: ไม่ได้บอกแค่ 'ส่งถึงใน 3 วัน' แต่บอกละเอียดว่าอยู่ที่โกดังคัดแยกกี่นาที, รอศุลกากรเท่าไร, และวิ่งบนถนนเท่าไร — พอช้าปุ๊บชี้ตัวคอขวดได้ทันที",
      code: {
        language: "python",
        filename: "trace_hierarchy.py",
        code: `from contextlib import contextmanager
from dataclasses import dataclass, field
import time
from typing import Iterator


@dataclass
class Span:
    name: str
    kind: str
    parent: str | None
    latency_ms: float = 0.0
    metadata: dict = field(default_factory=dict)


class SimpleWaterfall:
    def __init__(self, trace_id: str) -> None:
        self.trace_id = trace_id
        self.spans: list[Span] = []
        self._stack: list[str] = []

    @contextmanager
    def span(self, name: str, kind: str = "chain", **meta) -> Iterator[Span]:
        parent = self._stack[-1] if self._stack else None
        sp = Span(name=name, kind=kind, parent=parent, metadata=dict(meta))
        self._stack.append(name)
        t0 = time.perf_counter()
        try:
            yield sp
        finally:
            sp.latency_ms = round((time.perf_counter() - t0) * 1000, 3)
            self.spans.append(sp)
            self._stack.pop()`,
        caption: "Context manager สร้าง Parent-Child Spans และจับเวลาด้วย perf_counter() อัตโนมัติแม้เกิด Exception",
      },
      whyTitle: "Why this matters — แยกเวลาระหว่าง Retrieval, Rerank และ LLM ได้แม่นยำ",
      whyParagraphs: [
        "ถ้าไม่แยก span เมื่อ request ช้าลงจาก 1.2 วินาทีเป็น 4.0 วินาที ทีมมักเดาว่าโมเดล LLM ช้า ทั้งที่จริง ๆ แล้วอาจเป็น MCP SQLite query หรือ Reranker ที่ค้าง",
        "นอกจากนี้ การแนบ `prompt_version` กับ `citation_valid` score ลงบน {{langfuse}} trace ช่วยให้ทีมกรองดูเฉพาะเคสที่ตก eval ใน Production เพื่อดึงกลับมาใส่ {{golden-dataset}} ได้ทันที",
      ],
    },
    {
      id: "p50-p95-latency-bottlenecks",
      title: "2 · P50 / P95 Latency และ TTFT: ทำไมค่าเฉลี่ยจึงหลอกตา",
      paragraphs: [
        "สมมติระบบตอบ 95 คำขอเร็วที่ `900 ms` แต่อีก 5 คำขอช้าที่ `5,200 ms` (เพราะ retry หรือ document ยาว): ค่าเฉลี่ย (Mean) จะอยู่ที่ `1,115 ms` ซึ่งดูผ่านเกณฑ์สบาย ๆ แต่ผู้ใช้จริง 1 ใน 20 คนต้องรอนานเกิน 5 วินาที!",
        "วิศวกร Production จึงใช้ **Percentiles** แทน Mean เสมอ: **`P50` (Median)** บอกประสบการณ์ของผู้ใช้ทั่วไป และ **`P95`** (ค่าที่ 95% ของคำขอทำได้เร็วกว่านี้) เป็นตัวคุมเพดาน SLA ใน ADR-001 (`P95 <= 3,500 ms`) ส่วนระบบสตรีมมิ่งยังต้องติดตาม **{{ttft|TTFT (Time to First Token)}}** แยกจาก Total Generation Latency ด้วย",
        "หมายเหตุสำคัญเรื่องการคำนวณ: สำหรับชุดตัวอย่างขนาดเล็ก (เช่น 40 เคส) ควรใช้สูตร Nearest-Rank Percentile (`index = math.ceil(p * n) - 1` บนลิสต์ที่เรียงจากน้อยไปมาก) เพื่อให้ผลลัพธ์ตรงไปตรงมาและ deterministic 100% ใน CI",
      ],
      analogy:
        "ถ้าถามว่าเดินทางไปทำงานใช้เวลาเท่าไร: P50 คือวันที่รถติดปกติ (30 นาที) ส่วน P95 คือวันที่ฝนตกหนักและต้องเผื่อเวลาไปให้ทันประชุมสำคัญ (55 นาที) — การตั้ง SLA ต้องอิง P95 ไม่ใช่ค่าเฉลี่ยวันแดดออก",
      bullets: [
        "**`P50 Latency`**: บอกความเร็วปกติในเส้นทาง `faq_rag` และ `mcp_lookup`",
        "**`P95 Latency <= 3,500 ms`**: เกณฑ์ผ่าน SLA ของ Capstone ตาม ADR-001",
        "**`TTFT` (Time to First Token)**: วัดความรู้สึกเร็วของการสตรีม {{sse}} (จะนำไปใช้จริงใน B44)",
      ],
      whyTitle: "Why this matters — เตรียมข้อมูลรับมือ Load Test และ Final Defense",
      whyParagraphs: [
        "ใน Capstone Rubric (เสาที่ 3: Observability & Cost) คุณต้องรายงานทั้ง P50 และ P95 latency พร้อมระบุได้ว่าระบบส่วนไหนกินเวลาเยอะที่สุด",
        "การมีฟังก์ชันคำนวณ P50/P95 ที่ deterministic ในโค้ดช่วยให้สคริปต์ Milestone 4 (D172) ตรวจสอบ SLA Latency Gate ได้อัตโนมัติใน CI",
      ],
    },
    {
      id: "token-economics-and-cost-per-1k",
      title: "3 · คำนวณต้นทุนจริง: Cost per 1,000 Queries และ Prompt Caching",
      paragraphs: [
        "ระบบ AI ที่ตอบแม่น 95% แต่ต้นทุนพุ่งถึง $150 ต่อ 1,000 คำถามอาจไม่มีวันได้ขึ้นใช้งานจริงในองค์กรไทย การติดตาม Token Economics จึงสำคัญเทียบเท่ากับ Latency",
        "ในแต่ละ `generation` span เราต้องแยกเก็บ 3 ค่าหลัก: **`input_tokens`** (รวม system prompt + 5 chunks + query), **`cached_tokens`** (ส่วน system prompt หรือบริบทซ้ำที่ได้ส่วนลดจาก {{prompt-caching}}), และ **`output_tokens`** (ซึ่งมักแพงกว่า input 3–5 เท่า)",
        "เมื่อรวมราคาต่อ 1M tokens ของโมเดลที่เลือก (เช่น `gpt-4o-mini` หรือ model tier ที่ใช้อยู่) เราจะได้สูตรตรงตัวสำหรับ **Cost per Query** และ **Cost per 1,000 Queries** รวมถึงเห็นผลทันทีว่าถ้าเปิด `Prompt Caching` หรือย่อ `top_k` จาก 8 เหลือ 5 จะประหยัดงบไปกี่เปอร์เซ็นต์",
      ],
      analogy:
        "เหมือนการติดมิเตอร์น้ำ-มิเตอร์ไฟแยกตามเครื่องจักรในโรงงาน: รู้ทันทีว่าเตาอบตัวไหนกินไฟสุด และถ้าเปลี่ยนมาอุ่นเตาแบบประหยัดพลังงาน (Prompt Caching / Model Tiering) จะลดบิลค่าไฟสิ้นเดือนได้กี่บาท",
      code: {
        language: "python",
        filename: "cost_calculator.py",
        code: `def calc_query_cost_usd(
    input_tokens: int,
    output_tokens: int,
    *,
    cached_tokens: int = 0,
    input_per_1m: float = 0.15,
    cached_per_1m: float = 0.075,
    output_per_1m: float = 0.60,
) -> float:
    billable_input = max(0, input_tokens - cached_tokens)
    return (
        (billable_input / 1_000_000) * input_per_1m
        + (cached_tokens / 1_000_000) * cached_per_1m
        + (output_tokens / 1_000_000) * output_per_1m
    )`,
        caption: "แยกคำนวณ uncached input, cached input และ output tokens เพื่อให้ประมาณการงบได้แม่นยำ",
      },
      whyTitle: "Why this matters — ตัดสินใจ Model Tiering และ Caching ด้วยตัวเลขจริง",
      whyParagraphs: [
        "คำถามยอดฮิตในห้องสัมภาษณ์คือ *\"ระบบของคุณใช้งบเท่าไรต่อ 1,000 คำถาม และถ้าทราฟฟิกโต 10 เท่าจะลดต้นทุนตรงไหน?\"*",
        "ตัวเลขจากการติดตาม Token & Cost Telemetry ในวันนี้จะกลายเป็นคอลัมน์สำคัญในตาราง Eval/Cost Metrics ของ `README.md`",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก APM (Datadog/Sentry) สู่ LLM Observability (Langfuse + OTel)",
      body: [
        "ถ้าคุณเคยใช้ APM อย่าง Datadog, Sentry หรือ OpenTelemetry เพื่อดู API endpoint latency และ error rate ในเว็บแอป, Langfuse คือ APM ที่เพิ่มมิติเฉพาะของ LLM เข้ามา:",
      ],
      table: [
        ["HTTP Request Trace ID", "Langfuse `trace_id` (ผูกตั้งแต่ API → Router → Tool)"],
        ["DB Query / External API Span", "`retriever`, `mcp_tool`, และ `generation` Span"],
        ["Endpoint P95 Latency SLA", "`P50 / P95 Latency <= 3,500 ms` + `TTFT`"],
        ["Cloud CPU/Memory Cost", "Token Usage & `Cost / 1,000 Queries` (+ Prompt Cache)"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Mean Latency ถึงใช้ตั้ง SLA ไม่ได้",
      body: [
        "ในวิชาสถิติเบื้องต้นเราคุ้นเคยกับค่าเฉลี่ย (Average/Mean) แต่เวลา Latency มีความเบ้ขวา (Right-skewed) — เช่น 19 คนรอ 0.5 วินาที แต่ 1 คนรอ 10 วินาที — ค่าเฉลี่ยจะหลอกว่าเร็วเพียง 0.975 วินาที",
        "การใช้ **P95** (เปอร์เซ็นไทล์ที่ 95) บอกเราได้ตรงไปตรงมาว่า 95% ของผู้ใช้ทั้งหมดได้รับคำตอบเร็วกว่าเท่าไร ซึ่งสะท้อนประสบการณ์จริงได้ดีกว่ามาก",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองรัน `CapstoneTracer` แบบ offline ที่บันทึก span waterfall, ป้องกัน PII หลุดเข้า telemetry, คำนวณ P50/P95 และสรุป Cost per 1,000 Queries กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · บันทึก Trace Waterfall พร้อมตัวกรอง PDPA ใน Span Metadata",
        explain:
          "ทุกครั้งที่เปิด trace ระบบสร้าง `trace_id` และบังคับ mask เลขบัตรประชาชน 13 หลัก/เบอร์มือถือไทยในข้อความ metadata ก่อนบันทึกลง span",
        code: {
          language: "python",
          filename: "worked_telemetry.py",
          code: `import re

THAI_ID_RE = re.compile(r"\\b\\d{13}\\b")
THAI_PHONE_RE = re.compile(r"\\b0[689]\\d{8}\\b")


def sanitize_telemetry_text(text: str) -> str:
    text = THAI_ID_RE.sub("[REDACTED_THAI_ID]", text)
    return THAI_PHONE_RE.sub("[REDACTED_PHONE]", text)


sample_meta = sanitize_telemetry_text("ลูกค้าโทร 0812345678 บัตร 1100700123456 ถามเรื่องคืนเงิน")
print(sample_meta)`,
        },
        output: `ลูกค้าโทร [REDACTED_PHONE] บัตร [REDACTED_THAI_ID] ถามเรื่องคืนเงิน`,
      },
      {
        title: "2 · คำนวณ P50 / P95 Latency ด้วย Nearest-Rank Percentile",
        explain:
          "ใช้สูตร `math.ceil(p * n) - 1` บนลิสต์ latency ที่เรียงลำดับแล้ว เพื่อตรวจเทียบกับเพดาน SLA (`<= 3,500 ms`)",
        code: {
          language: "python",
          filename: "worked_telemetry.py",
          code: `import math


def percentile(values: list[float], p: float) -> float:
    ordered = sorted(values)
    idx = max(0, math.ceil(p * len(ordered)) - 1)
    return ordered[idx]


latencies_ms = [420.0, 810.0, 950.0, 1100.0, 1250.0, 1400.0, 1580.0, 1900.0, 2400.0, 3150.0]
p50 = percentile(latencies_ms, 0.50)
p95 = percentile(latencies_ms, 0.95)
print(f"P50={p50} ms | P95={p95} ms | SLA<=3500: {p95 <= 3500}")`,
        },
        output: `P50=1250.0 ms | P95=3150.0 ms | SLA<=3500: True`,
      },
      {
        title: "3 · สรุป Token & Cost per 1,000 Queries เทียบมีและไม่มี Prompt Caching",
        explain:
          "จำลอง 1,000 คำขอที่มี input เฉลี่ย 1,200 tokens (เป็น system prompt ซ้ำ 600 tokens) และ output 220 tokens — จะเห็นว่า Prompt Caching ลดต้นทุนฝั่ง input ได้ชัดเจน",
        code: {
          language: "python",
          filename: "worked_telemetry.py",
          code: `def cost_per_1k(avg_in: int, avg_cached: int, avg_out: int) -> float:
    billable_in = max(0, avg_in - avg_cached)
    per_query = (
        (billable_in / 1_000_000) * 0.15
        + (avg_cached / 1_000_000) * 0.075
        + (avg_out / 1_000_000) * 0.60
    )
    return round(per_query * 1000, 4)


no_cache = cost_per_1k(1200, 0, 220)
with_cache = cost_per_1k(1200, 600, 220)
print(f"No cache: \${no_cache}/1k | With cache: \${with_cache}/1k")`,
        },
        output: `No cache: $0.312/1k | With cache: $0.267/1k`,
      },
    ],
    gotcha:
      "จุดสังเกต: ห้ามคำนวณ Cost จาก `input_tokens` อย่างเดียวโดยลืม `output_tokens` — สำหรับโมเดลส่วนใหญ่ output token แพงกว่า input token 3–4 เท่า คำตอบที่เยิ่นเย้อจึงทำให้งบบานเร็วกว่าที่คิด",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/telemetry_langfuse.py` สำหรับเก็บ Trace & Span Waterfall ของระบบ Capstone พร้อมตัวป้องกัน PDPA ใน telemetry, ตัวคำนวณ P50/P95 Latency และตัวประมาณการ Cost per 1,000 Queries",
    requirements: [
      "สร้าง `ModelPricing(BaseModel)` (default: `input_per_1m=0.15`, `cached_per_1m=0.075`, `output_per_1m=0.60`) และ `SpanRecord(BaseModel)` ที่เก็บ `span_id`, `parent_span_id`, `name`, `kind` (`\"chain\" | \"retriever\" | \"generation\" | \"tool\"`), `latency_ms`, `input_tokens`, `cached_tokens`, `output_tokens`, และ `metadata: dict[str, str]`",
      "สร้างคลาส `CapstoneTracer` ที่จัดการ trace (`start_trace(trace_id, route, prompt_version)`), context manager `span(trace_id, name, kind=\"chain\", **metadata)` ที่จับเวลาอัตโนมัติ, เมธอด `record_score(trace_id, name, value)` (ค่าต้องอยู่ใน `0.0..1.0`), และบังคับ **mask เลขบัตรประชาชน 13 หลัก (`\\b\\d{13}\\b`) กับเบอร์มือถือไทย (`\\b0[689]\\d{8}\\b`)** ในค่า string ทุกตัวของ `metadata` ก่อนเก็บ",
      "สร้าง `compute_latency_summary(latencies_ms: list[float], p95_sla_ms: float = 3500.0) -> dict` (โยน `ValueError` ถ้าว่าง) คืน `count`, `p50_ms`, `p95_ms`, และ `within_sla: bool` (`p95_ms <= p95_sla_ms`) โดยใช้ Nearest-Rank Percentile",
      "สร้าง `summarize_telemetry(tracer: CapstoneTracer, pricing: ModelPricing | None = None, p95_sla_ms: float = 3500.0) -> dict` คืน `total_traces`, `trace_coverage` (`1.0` เมื่อทุก trace มี >= 1 span และ `trace_id` ไม่ว่าง), `p50_ms`, `p95_ms`, `within_sla`, `total_cost_usd`, และ `cost_per_1k_queries_usd`",
    ],
    starter: {
      language: "python",
      filename: "src/telemetry_langfuse.py",
      code: `from __future__ import annotations

from contextlib import contextmanager
import math
import re
import time
from typing import Iterator, Literal
from pydantic import BaseModel, Field

THAI_ID_RE = re.compile(r"\\b\\d{13}\\b")
THAI_PHONE_RE = re.compile(r"\\b0[689]\\d{8}\\b")


class ModelPricing(BaseModel):
    input_per_1m: float = 0.15
    cached_per_1m: float = 0.075
    output_per_1m: float = 0.60


class SpanRecord(BaseModel):
    span_id: str
    parent_span_id: str | None = None
    name: str
    kind: Literal["chain", "retriever", "generation", "tool"]
    latency_ms: float = Field(ge=0.0)
    input_tokens: int = Field(default=0, ge=0)
    cached_tokens: int = Field(default=0, ge=0)
    output_tokens: int = Field(default=0, ge=0)
    metadata: dict[str, str] = Field(default_factory=dict)


class CapstoneTracer:
    def __init__(self) -> None:
        self.traces: dict[str, dict] = {}
        self._stacks: dict[str, list[str]] = {}
        self._seq: int = 0

    def start_trace(self, trace_id: str, *, route: str, prompt_version: str) -> None:
        # TODO: ลงทะเบียน trace ใหม่ (ห้าม trace_id ว่าง)
        raise NotImplementedError

    @contextmanager
    def span(
        self,
        trace_id: str,
        name: str,
        *,
        kind: Literal["chain", "retriever", "generation", "tool"] = "chain",
        input_tokens: int = 0,
        cached_tokens: int = 0,
        output_tokens: int = 0,
        latency_override_ms: float | None = None,
        **metadata: object,
    ) -> Iterator[SpanRecord]:
        # TODO: จับเวลา/ใช้ override, mask PDPA ใน metadata, บันทึก parent_span_id และคืน SpanRecord
        raise NotImplementedError

    def record_score(self, trace_id: str, name: str, value: float) -> None:
        # TODO: ตรวจช่วง 0.0..1.0 และผูกคะแนนเข้า trace
        raise NotImplementedError


def compute_latency_summary(latencies_ms: list[float], p95_sla_ms: float = 3500.0) -> dict:
    raise NotImplementedError


def summarize_telemetry(
    tracer: CapstoneTracer,
    pricing: ModelPricing | None = None,
    p95_sla_ms: float = 3500.0,
) -> dict:
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_telemetry_langfuse.py",
      code: `import pytest
from src.telemetry_langfuse import (
    CapstoneTracer,
    ModelPricing,
    compute_latency_summary,
    summarize_telemetry,
)


def test_tracer_records_parent_child_spans_and_masks_pii():
    tracer = CapstoneTracer()
    tracer.start_trace("tr-001", route="faq_rag", prompt_version="v2")

    with tracer.span("root_request", kind="chain", query_preview="โทร 0812345678 บัตร 1100700123456"):
        with tracer.span("hybrid_retrieval", kind="retriever", latency_override_ms=180.0):
            pass
        with tracer.span(
            "llm_generation",
            kind="generation",
            input_tokens=1000,
            cached_tokens=500,
            output_tokens=200,
            latency_override_ms=820.0,
        ):
            pass

    tracer.record_score("tr-001", "faithfulness", 0.92)
    spans = tracer.traces["tr-001"]["spans"]
    assert len(spans) == 3
    assert spans[0].parent_span_id is None
    assert spans[1].parent_span_id == spans[0].span_id
    assert spans[2].parent_span_id == spans[0].span_id
    assert "0812345678" not in spans[0].metadata["query_preview"]
    assert "1100700123456" not in spans[0].metadata["query_preview"]
    assert tracer.traces["tr-001"]["scores"]["faithfulness"] == 0.92


def test_latency_percentiles_and_sla_check():
    values = [500.0, 700.0, 900.0, 1100.0, 1300.0, 1500.0, 1700.0, 1900.0, 2100.0, 3200.0]
    summary = compute_latency_summary(values, p95_sla_ms=3500.0)
    assert summary["count"] == 10
    assert summary["p50_ms"] == 1300.0
    assert summary["p95_ms"] == 3200.0
    assert summary["within_sla"] is True

    slow = compute_latency_summary([1000.0, 4200.0], p95_sla_ms=3500.0)
    assert slow["within_sla"] is False


def test_summarize_telemetry_calculates_cost_per_1k_and_coverage():
    tracer = CapstoneTracer()
    for idx, lat in enumerate([800.0, 1200.0], start=1):
        tid = f"tr-{idx:03d}"
        tracer.start_trace(tid, route="faq_rag", prompt_version="v2")
        with tracer.span(tid, "root", kind="chain", latency_override_ms=lat):
            with tracer.span(
                tid,
                "llm",
                kind="generation",
                input_tokens=1200,
                cached_tokens=600,
                output_tokens=220,
                latency_override_ms=lat - 100.0,
            ):
                pass

    report = summarize_telemetry(tracer, pricing=ModelPricing(), p95_sla_ms=3500.0)
    assert report["total_traces"] == 2
    assert report["trace_coverage"] == 1.0
    assert report["p95_ms"] == 1200.0
    assert report["within_sla"] is True
    assert report["cost_per_1k_queries_usd"] == pytest.approx(0.267, rel=1e-3)


def test_invalid_score_or_empty_latency_raises():
    tracer = CapstoneTracer()
    tracer.start_trace("tr-x", route="mcp_lookup", prompt_version="v1")
    with pytest.raises(ValueError):
        tracer.record_score("tr-x", "faithfulness", 1.5)
    with pytest.raises(ValueError):
        compute_latency_summary([])
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_telemetry_langfuse.py` แล้วผ่านครบทั้ง 4 test cases",
      "ตรวจว่า `metadata` ใน span ที่รับเบอร์โทรไทย `0812345678` และเลขบัตร 13 หลักถูก mask ก่อนบันทึกจริง",
      "ตรวจว่า `cost_per_1k_queries_usd` แยกหัก `cached_tokens` ออกจาก `input_tokens` ถูกต้อง",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ใน `tests/test_telemetry_langfuse.py` และคำนวณ `trace_coverage`, `p50_ms`, `p95_ms`, และ `cost_per_1k_queries_usd` ได้ถูกต้อง",
    hints: [
      {
        body: "ใน `summarize_telemetry` ให้ใช้ latency ของ root span (span ที่ `parent_span_id is None`) เป็น total latency ของแต่ละ trace (หรือผลรวม span ที่ไม่มี parent) จะได้ไม่นับเวลาของ child span ซ้ำกับ parent span!",
      },
      {
        body: "ใน `CapstoneTracer.span`: ใช้ `self._stacks[trace_id][-1]` เป็น `parent_span_id` ก่อน append `span_id` ใหม่ลง stack, แล้วใน `finally:` ค่อย `pop()` และบันทึกเวลา (`latency_override_ms` ถ้ามี หรือ `(perf_counter() - t0) * 1000`)",
      },
      {
        body: "ตัวอย่าง helper สำหรับ mask PII และคำนวณ cost ใน `summarize_telemetry`",
        code: {
          language: "python",
          filename: "hint_day171.py",
          code: `def _mask_pii(val: object) -> str:
    text = str(val)
    text = THAI_ID_RE.sub("[REDACTED_THAI_ID]", text)
    return THAI_PHONE_RE.sub("[REDACTED_PHONE]", text)


def _trace_cost_usd(spans: list[SpanRecord], pricing: ModelPricing) -> float:
    total = 0.0
    for sp in spans:
        billable_in = max(0, sp.input_tokens - sp.cached_tokens)
        total += (billable_in / 1_000_000) * pricing.input_per_1m
        total += (sp.cached_tokens / 1_000_000) * pricing.cached_per_1m
        total += (sp.output_tokens / 1_000_000) * pricing.output_per_1m
    return total`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_telemetry_langfuse.py
uv run ruff check .`,
      caption: "ทดสอบระบบ Langfuse Tracer จำลองและตัวคำนวณ Latency/Cost ของ Capstone",
    },
  },

  mistakes: [
    {
      title: "บวกเวลาของ Parent Span กับ Child Span รวมกันเป็น Latency รวม",
      symptom: "ระบบใช้เวลาจริงแค่ 1.0 วินาที (`root=1000ms` ที่มี `retrieval=200ms` + `llm=800ms`) แต่ดันบวกทุก span รวมกันได้ 2.0 วินาทีจนดูเหมือนช้าเกิน SLA",
      fix: "ใช้เวลาของ **Root Span** (`parent_span_id is None`) เป็น Total Request Latency เสมอ ส่วน Child Spans ใช้สำหรับดูสัดส่วนคอขวดภายใน",
    },
    {
      title: "ส่งคำถามดิบของผู้ใช้ที่มีเลขบัตรประชาชน/เบอร์โทรเข้า Langfuse โดยไม่ Redact",
      symptom: "API แชตบอต mask ข้อมูลก่อนตอบแล้ว แต่ในหน้าจอ Dashboard ของ Langfuse ยังโชว์เบอร์มือถือและเลขบัตร 13 หลักเต็ม ๆ ละเมิด {{pdpa}}",
      fix: "ทำ PII Sanitization ทั้งที่ HTTP Middleware และในชั้น Tracer ก่อนบันทึกลง span metadata",
    },
    {
      title: "ลืมบันทึก `prompt_version` ลงบน Generation Span",
      symptom: "ดูกราฟใน Langfuse แล้วเห็นว่าวันที่ 12 คุณภาพตก แต่ไม่รู้ว่าเกิดจากการเปลี่ยน system prompt, การเปลี่ยน chunking, หรือตัวโมเดล",
      fix: "แนบ `prompt_version`, `model_name`, และ `route` ในทุก trace เพื่อเปรียบเทียบผลตามเวอร์ชันได้ทันที",
    },
    {
      title: "ใช้ Mean Latency แทน P95 Latency ในการตั้ง Alert และตรวจ SLA",
      symptom: "Mean Latency ดูดีที่ `1,100 ms` แต่ 5% ของคำขอรอนานเกิน `5,000 ms` จนผู้ใช้กดปิดหน้าเว็บหนี",
      fix: "รายงานและตั้ง Alert บน **P95 Latency** (`<= 3,500 ms` สำหรับ Capstone) ควบคู่กับ `P50` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d171-q1",
        "เหตุใดเราจึงต้องทำ **PII Redaction (Masking)** ในชั้น Telemetry ก่อนส่งข้อมูลเข้า Langfuse หรือ log แม้ว่าเราจะทำ Redaction ก่อนส่งเข้า LLM API ไปแล้วก็ตาม?",
        [
          ["เพราะ Langfuse เก็บข้อมูลไม่ได้ถ้ามีตัวเลข 13 หลัก", "Langfuse เก็บได้ แต่นั่นคือความเสี่ยงด้านความปลอดภัยและการปฏิบัติตามกฎหมาย PDPA"],
          ["เพราะ Trace payload มักถูกส่งไปยังระบบ observability ภายนอกหรือทีมงานหลายคนเปิดดูได้ หากไม่ mask อาจเกิดการรั่วไหลข้อมูลส่วนบุคคลใน log ละเมิด PDPA", "ถูก — Telemetry และ Logs ต้องปลอดจาก PII ดิบเสมอ (PDPA + OWASP LLM02)"],
          ["เพราะการ mask ทำให้จำนวน token ลดลง 90%", "การ mask แทนที่สตริงเดิม ไม่ได้ลดขนาด payload อย่างมีนัยสำคัญ"],
          ["เพราะ OpenTelemetry บังคับให้ทุกข้อความต้องสั้นกว่า 10 ตัวอักษร", "OpenTelemetry ไม่ได้จำกัดความยาวข้อความแบบนั้น"],
        ],
        "B",
        "Observability Logs เป็นจุดที่ PII มักหลุดรอดบ่อยที่สุด การ sanitize ทั้งก่อนเข้า LLM และก่อนส่งเข้า Langfuse ช่วยปิดช่องโหว่ OWASP LLM02 และ PDPA ได้ครบ",
        "ทำไม Telemetry / Langfuse Trace จึงต้องผ่านการ mask PII ตามหลัก PDPA ด้วย?",
        "เพราะ trace metadata อาจถูกเก็บใน server ภายนอกหรือเปิดดูโดยทีมงาน การไม่บันทึกเลขบัตร 13 หลัก/เบอร์โทรดิบใน log ช่วยป้องกัน PII leak และปฏิบัติตาม PDPA",
      ),
      mc(
        "d171-q2",
        "คำขอหนึ่งมี `root_request` latency `1,000 ms` โดยข้างในมี `retrieval` `200 ms` และ `llm_generation` `750 ms` ในการคำนวณ P95 Latency ของทั้งระบบ เราควรใช้ตัวเลขใดเป็น Latency ของคำขอนี้?",
        [
          ["200 + 750 + 1000 = 1,950 ms", "ผิด — เป็นการนับเวลาของลูกซ้ำกับเวลาของพ่อ"],
          ["1,000 ms (เวลาของ Root Span)", "ถูก — Root Span ครอบคลุมตั้งแต่เริ่มรับคำขอจนตอบเสร็จ ส่วน Child Spans ใช้ดูสัดส่วนเวลาภายใน"],
          ["200 ms (เฉพาะ Retrieval)", "ไม่ครบ — ผู้ใช้ต้องรอทั้ง Retrieval และ Generation"],
          ["750 ms (เฉพาะ LLM)", "ไม่ครบ — ตัดเวลา Retrieval และ overhead อื่นทิ้ง"],
        ],
        "B",
        "Root Span แสดงเวลาจริงทั้งหมดที่ผู้ใช้รอ (end-to-end) จึงต้องใช้เวลาของ Root Span ไม่ใช่เอาทุก span มาบวกซ้ำกัน",
        "เวลาคำนวณ P50/P95 Latency ของคำขอหนึ่ง ๆ จาก Trace Waterfall ควรใช้เวลาจาก span ใด?",
        "ใช้เวลาของ Root Span (`parent_span_id is None`) เพราะครอบคลุมเวลาจริงตั้งแต่ต้นจนจบโดยไม่นับเวลา child span ซ้ำ",
      ),
      mc(
        "d171-q3",
        "โมเดลคิดราคา `input = $0.15/1M`, `cached_input = $0.075/1M`, `output = $0.60/1M` หากคำขอเฉลี่ยใช้ `input_tokens = 1,000` (เป็น `cached_tokens = 400`) และ `output_tokens = 250` ต้นทุนต่อ **1,000 คำขอ** เท่ากับเท่าไร?",
        [
          ["$0.120", "ผิด — ยังไม่ได้รวมค่า output หรือคิดส่วนลด cache ผิด"],
          ["$0.270", "ถูก — uncached input 600*0.15/1M ($0.00009) + cached 400*0.075/1M ($0.00003) + output 250*0.60/1M ($0.00015) = $0.00027/query → $0.270 per 1k queries"],
          ["$0.300", "ตัวเลขนี้คือกรณีที่ไม่ได้หักส่วนลดของ cached_tokens ออก"],
          ["$2.700", "คำนวณพลาดไป 1 หลักทศนิยม (10,000 queries ไม่ใช่ 1,000 queries)"],
        ],
        "B",
        "`((600 * 0.15) + (400 * 0.075) + (250 * 0.60)) / 1,000,000 * 1,000 = (90 + 30 + 150) / 1,000 = $0.270`",
        "เหตุใดจึงต้องแยก `cached_tokens` ออกจาก `input_tokens` เวลาคำนวณ Cost per 1,000 Queries?",
        "เพราะ Prompt Caching คิดราคาถูกกว่า uncached input (มักลด ~50%) จึงต้องหัก `cached_tokens` ออกก่อนคูณราคา input ปกติ",
      ),
      mc(
        "d171-q4",
        "ข้อใดคือประโยชน์ของการผูก `prompt_version` และ `eval score` เข้าด้วยกันใน Trace ของ Langfuse?",
        [
          ["ช่วยให้ไม่ต้องเขียน unit test ใน pytest อีกต่อไป", "ไม่จริง — Langfuse trace ช่วยสังเกตการณ์และคัดเคสจริง แต่ยังต้องมี pytest + eval gates ใน CI"],
          ["ช่วยให้เปรียบเทียบคุณภาพ ต้นทุน และ latency ระหว่าง prompt รุ่นเก่ากับรุ่นใหม่บนข้อมูลจริง และดึง trace ที่คะแนนตกกลับมาเพิ่มใน Golden Dataset ได้", "ถูก — เป็นการปิด Feedback Loop จาก Production กลับสู่การพัฒนา (Node 5 → Node 6 → Node 1)"],
          ["ช่วยให้โมเดล LLM ตอบเร็วขึ้นโดยไม่ต้องจูนโค้ด", "การติด tag ไม่ได้ทำให้ inference เร็วขึ้นด้วยตัวเอง แต่ช่วยให้หาจุดจูนได้ตรงเป้า"],
          ["ช่วยให้ปิดการใช้งาน MCP Server ได้อัตโนมัติ", "ไม่มีส่วนเกี่ยวข้องกับการปิด MCP Server"],
        ],
        "B",
        "การบันทึก lineage (`prompt_version`) คู่กับคะแนน (`faithfulness`, `citation_present`) คือหัวใจของ Feedback Loop ที่เปลี่ยนการใช้งานจริงเป็น Golden Dataset ที่แข็งแรงขึ้นเรื่อย ๆ",
        "การผูก `prompt_version` และ `score` ลงใน Langfuse Trace ช่วยปิด AI Engineering Loop อย่างไร?",
        "ช่วยให้เทียบประสิทธิภาพและต้นทุนข้ามเวอร์ชันบนทราฟฟิกจริง และคัดกรอง trace ที่ได้คะแนนต่ำกลับมาเป็นเคสทดสอบใหม่ใน Golden Dataset",
      ),
    ],
  },

  takeaways: [
    "ติด {{langfuse}} / {{otel}} Tracing ให้ครบทุกคำขอ (`trace_coverage = 100%`) แบบมีโครงสร้าง Parent–Child Spans และแนบ {{prompt-versioning}} เสมอ",
    "ใช้เวลาของ **Root Span** คำนวณ **`P50`** และ **`P95 Latency`** (คุม `P95 <= 3,500 ms` ตาม ADR-001) แทนค่าเฉลี่ยที่มักซ่อนปัญหาคอขวด",
    "คำนวณ **Cost per 1,000 Queries** โดยแยก `uncached_input`, `cached_tokens` ({{prompt-caching}}) และ `output_tokens` เพื่อคุมงบประมาณ",
    "บังคับ **{{pdpa}} Redaction** ก่อนบันทึกข้อความใด ๆ ลง telemetry metadata เพื่อป้องกันข้อมูลส่วนบุคคลรั่วไหลใน Observability Dashboard",
  ],

  reviewCards: [
    rc(
      "d171-rc-1",
      "Span หลักที่ควรมีใน Trace Waterfall ของระบบ Capstone มีอะไรบ้าง?",
      "root_request (chain) ครอบ pdpa_gate, langgraph_router, และเส้นทางจริงอย่าง hybrid_retrieval (retriever), cross_encoder_rerank, llm_generation (generation) หรือ mcp_tool_call (tool)",
    ),
    rc(
      "d171-rc-2",
      "ทำไมจึงต้องรายงาน P95 Latency แทน Mean Latency?",
      "เพราะ Latency มีการกระจายแบบเบ้ขวา ค่าเฉลี่ยมักหลอกตาเมื่อมี 5% ที่ช้ามาก (เช่น retry/timeout) P95 จึงสะท้อนเกณฑ์ SLA ของผู้ใช้ 95% ได้จริง",
    ),
    rc(
      "d171-rc-3",
      "วิธีคิด Cost per 1,000 Queries ที่แม่นยำต้องแยก token เป็นกี่ส่วน?",
      "3 ส่วน: 1) uncached input tokens (input - cached), 2) cached_tokens (Prompt Caching มักถูกกว่า), และ 3) output_tokens (มักแพงสุด)",
    ),
  ],

  sources: [
    { label: "Langfuse Documentation — Tracing & Python SDK", href: "https://langfuse.com/docs/tracing" },
    { label: "Langfuse Documentation — Token & Cost Tracking", href: "https://langfuse.com/docs/model-usage-and-cost" },
    { label: "OpenTelemetry Semantic Conventions for GenAI", href: "https://opentelemetry.io/docs/specs/semconv/gen-ai/" },
    { label: "Anthropic — Prompt Caching Pricing & Mechanics", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" },
  ],

  glossary: ["langfuse", "otel", "ttft", "prompt-caching", "prompt-versioning", "pdpa", "groundedness", "golden-dataset", "sse", "pydantic"],
});
