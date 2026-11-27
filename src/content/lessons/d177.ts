import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D177 — Phase 6 / Block B45
 * Load & Failure Testing (Fallback when LLM times out)
 */
export const d177: Lesson = defineLesson({
  day: 177,
  titleTh: "ทดสอบ Load & Failure (ตั้ง Timeout, Circuit Breaker และ Fallback เมื่อ LLM ล่ม)",
  tagline: "30 นาที · Portfolio Polish · ยิง Concurrent Load จำลอง, ฉีด Failure เมื่อ LLM ค้าง และยืนยันว่า Fallback คง Schema + PDPA ได้ 100%",
  icon: "gauge",
  visual: {
    id: "capstone-load-defense",
    title: "ปราการป้องกันระบบล่ม — Concurrent Load, Circuit Breaker & Safe Fallback",
    caption: "เมื่อ LLM หลักตอบช้าหรือ Timeout ระบบต้องตัดวงจรอัตโนมัติ (Circuit Breaker) และสลับสู่ Fallback โดยไม่หลุด PDPA หรือ Schema",
    alt: "แผนภาพสถาปัตยกรรม Load & Failure Testing แสดงการทดสอบโหลดพร้อมกันและการทำงานของ Timeout, Retry, Circuit Breaker และ Safe Fallback",
  },
  requiresApiKey: false,
  apiKeyNote: "ทดสอบโหลดและฉีด Timeout/503 Failure บนเครื่อง 100% ด้วย asyncio + httpx MockTransport + pytest (สลับยิง staging API จริงได้)",
  tools: ["asyncio", "httpx", "pytest", "Circuit Breaker", "FastAPI"],

  bigPicture: [
    {
      node: 4,
      heading: "ป้องกันคอขวดและ Cascade Failure ในชั้น FastAPI App",
      body: "โค้ดที่ตอบ 1 request ได้ใน 1.2 วินาที อาจพังทั้งโปรเซสเมื่อมีผู้ใช้ 20 คนกดส่งคำถามพร้อมกันแล้ว LLM provider เกิดอาการค้าง (hanging socket) จน worker ถูกจองเต็ม",
      lessonNote: "วันนี้เราจำลอง concurrent traffic ด้วย {{asyncio}} + {{semaphore}} และบังคับ timeout ทุกขาออกด้วย {{httpx}} เพื่อพิสูจน์ว่า API ยังตอบกลับทันเวลา",
    },
    {
      node: 2,
      heading: "สร้างทางหนีทีไล่ให้ชั้น Model ผ่าน Circuit Breaker และ Safe Fallback",
      body: "เมื่อโมเดลหลักล่มหรือติด {{rate-limit}} การยิง retry รัว ๆ แบบไร้ขีดจำกัดยิ่งซ้ำเติมระบบ และทำให้ผู้ใช้รอนานเกิน {{ttft}} SLA",
      lessonNote: "เราติดตั้ง {{circuit-breaker}} คู่กับ jittered {{exponential-backoff}} และออกแบบ Fallback Hierarchy ที่ยังรักษากฎ {{abstention}} และ {{structured-output}} ไว้ครบ",
    },
    {
      node: 3,
      heading: "วัด Tail Latency (P95/P99) และ Fault Recovery Rate ใน Evaluation",
      body: "ค่าเฉลี่ย (mean latency) มักหลอกตา เพราะแค่ 5% ของคำขอที่ติด timeout 30 วินาทีก็ทำลายประสบการณ์ผู้ใช้จริงได้แล้ว",
      lessonNote: "เราคำนวณ P50, P95, Error Rate และ Fallback Success Rate จากผล load test เพื่อนำไปลงตารางใน `README.md` (Day 178) และ Defense (Day 180)",
    },
    {
      node: 5,
      heading: "บันทึกเหตุการณ์ Degraded Mode ลง Observability Trace",
      body: "ระบบที่ดีไม่ใช่แค่ไม่ล่ม แต่ต้องบอกทีมได้ว่าตอนไหนกำลังวิ่งบน fallback เพื่อให้ตรวจจับ outage ของ provider ได้ภายในไม่กี่นาที",
      lessonNote: "ทุกคำตอบในโหมด fallback ต้องติด flag `degraded=True`, `fallback_reason` และ `trace_id` สำหรับ {{langfuse}} / {{structlog}}",
    },
  ],

  objectives: [
    "**รัน Concurrent Load Test แบบออฟไลน์** ด้วย `asyncio` + `httpx` เพื่อคำนวณ Throughput, Error Rate, P50 และ P95 Latency เทียบกับ SLA (`P95 <= 3,500 ms`)",
    "**ฉีดความผิดพลาด (Fault Injection)** จำลองกรณี LLM `ReadTimeout`, HTTP `429` / `503` และตรวจการทำงานของ bounded retry + {{circuit-breaker}} (Closed → Open → Half-Open)",
    "**สร้าง Safe Fallback Hierarchy** ที่ยังคงบังคับ {{pydantic}} {{schema}}, {{pdpa}} Redaction, และกฎไม่เดาคำตอบ ({{abstention}}) แม้โมเดลหลักใช้งานไม่ได้",
  ],

  prerequisites: [
    "สร้าง FastAPI endpoint และ middleware จาก Block B44 แล้ว (D173–D176)",
    "เข้าใจ {{asyncio}}, {{httpx}} timeout, {{exponential-backoff}} และ {{circuit-breaker}} จาก Phase 1 และ Phase 5",
    "ใช้งาน `pytest` และ `asyncio` พื้นฐานได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมชุดเครื่องมือทดสอบโหลดและ Fault Injection ในโฟลเดอร์ `thai-enterprise-assistant/` โดยใช้ `httpx` และ `pytest-asyncio` (หรือ `asyncio.run` มาตรฐาน)",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv add httpx pydantic structlog
uv add --dev pytest pytest-asyncio ruff
uv run pytest -q`,
    steps: [
      ["deps", "ตรวจว่ามี `httpx`, `pydantic` และ `pytest` พร้อมใช้งานใน `.venv`"],
      ["baseline", "รัน `uv run pytest -q` ให้เทสต์เดิมทั้งหมดเป็นสีเขียวก่อนเริ่มฉีด failure"],
      ["ready", "พร้อมสร้างโมดูล Resilience Gateway และ Load/Failure Test Suite"],
    ],
    note: "สามารถใช้ `httpx.MockTransport` ทดสอบพฤติกรรม timeout, 429 และ latency spike ได้สมจริง 100% บนเครื่องโดยไม่ต้องยิง API เสียเงิน",
  },

  concepts: [
    {
      id: "concurrent-load-tail-latency",
      title: "1 · Concurrent Load Testing และความจริงเบื้องหลัง P50 vs P95 Latency",
      paragraphs: [
        "การกดยิง `/chat` ทีละ 1 คำขอใน Swagger UI บอกได้แค่ว่า *\"โค้ดทำงานได้\"* แต่ไม่ได้พิสูจน์ว่าระบบรับโหลดจริงไหว เมื่อมีพนักงานซัพพอร์ต 15–30 คนถามพร้อมกัน คอขวดจะโผล่ทันทีที่ event loop, connection pool, vector DB หรือโควตา LLM API",
        "ในการอ่านผล load test ห้ามดูแค่ **Average (Mean)** เด็ดขาด เพราะหาก 19 คำขอตอบใน `400 ms` แต่ 1 คำขอค้าง `25,000 ms` ค่าเฉลี่ยจะดูเหมือนดี (`1,630 ms`) ทั้งที่ **P95 latency ทะลุ `25,000 ms`** ไปแล้ว ทีมวิศวกรรมจึงใช้ **P50 (ค่ากลาง)** เพื่อดูความเร็วปกติ และ **P95/P99 (หางกราฟ)** เพื่อจับอาการค้างในสถานการณ์เลวร้าย",
        "นอกจากนี้ การใช้ `asyncio.Semaphore` คุม concurrency ฝั่งตัวทดสอบ (และฝั่ง upstream LLM client) ช่วยแยกแยะว่าอาการช้าเกิดจากคอขวดในเครื่องของเราเอง หรือเกิดจากปลายทางเริ่มปล่อย {{rate-limit}} (`429`)",
      ],
      analogy: "เหมือนการตรวจถนนหน้าห้าง — ถ้าวัดเวลาเดินทางเฉลี่ยตอนตี 3 แล้วบอกว่า 'รถไม่ติด' ย่อมใช้ไม่ได้ ต้องลองปล่อยรถเข้าพร้อมกันช่วงเย็นวันศุกร์แล้วดูเวลาของคันที่ช้าสุด 5% ท้ายสุด (P95) ถึงจะรู้ว่าทางออกระบายทันไหม",
      code: {
        language: "python",
        filename: "latency_percentiles.py",
        code: `import math


def percentile_ms(samples_ms: list[float], p: float) -> float:
    """คำนวณ percentile (เช่น 50 หรือ 95) ด้วย nearest-rank ที่แม่นยำกับชุดข้อมูลขนาดเล็ก"""
    if not samples_ms:
        raise ValueError("samples_ms must not be empty")
    ordered = sorted(samples_ms)
    idx = max(0, math.ceil((p / 100.0) * len(ordered)) - 1)
    return round(ordered[idx], 2)


latencies = [420.0, 510.0, 480.0, 620.0, 550.0, 490.0, 530.0, 610.0, 580.0, 4200.0]
print("P50:", percentile_ms(latencies, 50), "ms")
print("P95:", percentile_ms(latencies, 95), "ms")`,
        caption: "แยกดู P50 และ P95 เสมอ — ค่าเดียวที่หางกราฟสูงสามารถทำให้ SLA P95 ล้มเหลวได้",
      },
      bullets: [
        "**Throughput (RPS)**: จำนวนคำขอที่ประมวลผลจบต่อวินาทีภายใต้ concurrency เป้าหมาย",
        "**P50 vs P95**: P50 สะท้อนประสบการณ์ทั่วไป, P95 ใช้ตรวจว่าเข้าเป้า `<= 3,500 ms` ของ Capstone หรือไม่",
        "**Concurrency Cap**: ใช้ {{semaphore}} จำกัดคำขอขาออกพร้อมกันเพื่อไม่ให้ connection pool ล้น",
      ],
      whyTitle: "Why this matters — ตัวเลขจริงสำหรับ Rubric และห้องสัมภาษณ์",
      whyParagraphs: [
        "ใน Capstone Rubric เสาที่ 3 (Observability & Cost) บังคับรายงานทั้ง P50 และ P95 latency ไม่ใช่แค่ประมาณการลอย ๆ",
        "เมื่อผู้สัมภาษณ์ถามว่า *\"คุณรู้ได้อย่างไรว่าระบบรับโหลดไหว\"* การโชว์ผล concurrent test พร้อมวิธีคำนวณ P95 และวิธีกำจัด tail spike จะแยกคุณออกจากคนที่ทำแค่เดโมทันที",
      ],
    },
    {
      id: "timeout-retry-circuit-breaker",
      title: "2 · Fault Injection: Timeout, Jittered Retry และ Circuit Breaker",
      paragraphs: [
        "ในระบบ AI การรอ LLM ที่ไม่มี timeout คือหายนะที่พบบ่อยที่สุด หาก socket ค้าง 60 วินาทีต่อคำขอ เพียงไม่กี่สิบ request ก็ทำให้ FastAPI worker หมดคลังจน endpoint `/healthz` พลอยล่มไปด้วย เราจึงต้องตั้ง {{httpx}} timeout แยกชัดเจน (`connect=2.0s`, `read=4.0s`) เพื่อตัดคำขอที่ค้างตั้งแต่ต้น",
        "สำหรับความผิดพลาดชั่วคราว (`429 Rate Limit`, `503 Service Unavailable`, `ReadTimeout`) เราทำ bounded retry ไม่เกิน 1–2 ครั้งด้วย {{exponential-backoff}} บวก **random jitter** เพื่อไม่ให้ทุก client ยิงซ้ำพร้อมกันเป็นคลื่น (thundering herd) และ **ห้าม retry** กับ error ที่แก้ไม่ได้ด้วยการยิงซ้ำ เช่น `400 Bad Request` หรือ `401 Unauthorized`",
        "เมื่อปลายทางล่มต่อเนื่องจนถึงเกณฑ์ (เช่น พัง 3 ครั้งติดกัน) **{{circuit-breaker}}** จะเปิดวงจร (`OPEN`) เพื่อปฏิเสธการยิง LLM หลักทันที (`fail-fast` ใน < 5 ms) แล้วสลับเข้าสู่ Fallback นานตาม `cooldown_sec` จากนั้นจึงเปิดให้ลองยิงทดสอบ 1 ครั้งในสถานะ `HALF_OPEN` เพื่อดูว่า provider ฟื้นตัวหรือยัง",
      ],
      analogy: "เหมือนเบรกเกอร์ไฟบ้าน — ถ้าเครื่องทำน้ำอุ่นช็อต 3 ครั้งติด เบรกเกอร์จะตัดไฟทันทีเพื่อไม่ให้ไหม้ทั้งบ้าน (OPEN) แทนที่จะพยายามเปิดสวิตช์ซ้ำทุกวินาที",
      code: {
        language: "python",
        filename: "circuit_breaker_flow.py",
        code: `from enum import Enum


class BreakerState(str, Enum):
    CLOSED = "closed"        # ปกติ: ยิง primary LLM ได้
    OPEN = "open"            # ตัดวงจร: ข้าม primary ไป fallback ทันที
    HALF_OPEN = "half_open"  # ทดลองฟื้นตัว: ปล่อย 1 request ไปเช็ก primary


# กติกาการเปลี่ยนสถานะ:
# CLOSED --(failures >= threshold)--> OPEN
# OPEN   --(elapsed >= cooldown)----> HALF_OPEN
# HALF_OPEN --(success)--> CLOSED | --(fail)--> OPEN`,
        caption: "วงจร 3 สถานะของ Circuit Breaker ช่วยลดเวลาคอยของผู้ใช้จากหลักวินาทีเหลือ < 5 ms ช่วง provider ล่ม",
      },
      bullets: [
        "**Bounded Retry**: จำกัดจำนวนครั้ง (เช่น `max_retries=2`) และเช็ก total deadline ไม่ให้รวม retry เกินงบ latency",
        "**Retryable vs Non-Retryable**: Retry เฉพาะ `Timeout`, `429`, `5xx` — ห้าม retry `400/401/403`",
        "**Circuit Breaker States**: `CLOSED` → `OPEN` (fail-fast เข้า fallback) → `HALF_OPEN` (probe 1 ครั้ง)",
      ],
      whyTitle: "Why this matters — ป้องกัน Retry Storm ที่ทำให้ระบบล่มหนักกว่าเดิม",
      whyParagraphs: [
        "มือใหม่มักคิดว่า \"ใส่ retry เยอะ ๆ ไว้ก่อนดีกว่า\" แต่ถ้าผู้ใช้ 30 คนเจอช้าพร้อมกันแล้วแต่ละคน retry 5 รอบ เท่ากับยิงซ้ำ 150 ครั้งใส่ระบบที่กำลังป่วยอยู่แล้ว",
        "การรวม **Timeout + Jittered Backoff + Circuit Breaker** เป็นมาตรฐานอุตสาหกรรมที่พิสูจน์ว่าระบบคุณปกป้องทั้งผู้ใช้และค่าใช้จ่ายได้พร้อมกัน",
      ],
    },
    {
      id: "graceful-degradation-safe-fallback",
      title: "3 · Graceful Degradation: ออกแบบ Fallback ที่ไม่ทำลาย Schema, Groundedness และ PDPA",
      paragraphs: [
        "เมื่อ LLM หลัก timeout หรือ Circuit Breaker เปิด ระบบไม่ควรพ่น HTTP `500 Internal Server Error` หรือ stack trace ใส่หน้าผู้ใช้ แต่ต้องทำ **Graceful Degradation** (ลดระดับความสามารถอย่างนุ่มนวล) ตามลำดับชั้น Fallback ที่ออกแบบไว้ล่วงหน้า",
        "ลำดับ Fallback ที่ปลอดภัยสำหรับระบบองค์กรไทยมี 3 ขั้น: **ขั้น 1** สลับไป Secondary/Local Fallback Model (เช่น local Ollama/รุ่นเล็กที่เร็ว) หากยังมีโควตา · **ขั้น 2** สำหรับเส้นทาง `faq_rag` คืนเฉพาะข้อความสรุปจาก Top Retrieved Chunks ที่ผ่าน {{bm25}}/Hybrid Search แล้วพร้อม `[doc_id#chunk]` citation และข้อความแจ้งว่าระบบสรุปอัตโนมัติกำลังขัดข้อง · **ขั้น 3** สำหรับ `mcp_lookup` คืนข้อมูลดิบแบบ formatted + {{pdpa}} masked จาก SQLite ได้โดยไม่ต้องง้อ LLM เลย หรือส่งต่อเจ้าหน้าที่ (`escalated`) พร้อม `ticket_ref`",
        "กฎเหล็กที่ **ห้ามละเมิดเด็ดขาดในโหมด Fallback**: (1) โครงสร้างคำตอบยังต้องผ่าน {{pydantic}} {{schema}} เดิม 100%, (2) ห้ามปิด PDPA Redaction Middleware, (3) ห้ามข้าม {{hitl}} gate สำหรับ write action, และ (4) ต้องติด `degraded=True` กับ `fallback_reason` เพื่อให้ {{langfuse}} / {{structlog}} แจ้งเตือนได้",
      ],
      analogy: "เหมือนระบบจ่ายไฟสำรองของโรงพยาบาล — เมื่อไฟดับ ห้องผ่าตัด (PDPA, HITL, Schema) ยังต้องมีไฟใช้ครบ 100% ส่วนป้ายไฟโฆษณาหน้าตึก (การเรียบเรียงสำนวนสวย ๆ จาก LLM ใหญ่) ยอมหรี่ลงชั่วคราวได้",
      bullets: [
        "**Degraded RAG Mode**: คืน Top-2 grounded snippets พร้อม citation จริง + แจ้งผู้ใช้ว่าอยู่ในโหมดสำรอง",
        "**Deterministic Tool Mode**: `mcp_lookup` ยังตอบสถานะคำสั่งซื้อจาก DB พร้อม masked phone ได้โดยไม่ต้องใช้ LLM",
        "**Security Invariants Unchanged**: {{pdpa}} masking, {{hitl}} approval และ {{schema}} validation ต้องทำงาน 100% แม้ใน fallback",
      ],
      whyTitle: "Why this matters — Fallback ที่อันตรายกว่าการล่มคือ Fallback ที่ข้าม Guardrail",
      whyParagraphs: [
        "ความผิดพลาดที่พบบ่อยในระบบจริงคือสร้าง `except Exception:` นอก try-block แล้วคืน raw exception หรือเรียก fallback model ตัวสำรองโดยลืมส่งผ่าน PDPA scrubber ทำให้เลขบัตรประชาชนหลุดตอนระบบหลักล่ม",
        "การทดสอบ Failure Testing บน `pytest` จึงต้องตรวจทั้ง **Availability** (ไม่พัง 500) และ **Invariants** (Schema ผ่าน + PDPA ถูก mask + flag `degraded=True` ครบ)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก API Gateway Resilience สู่ LLM Gateway Resilience",
      body: [
        "ถ้าคุณเคยทำ Microservices หรือ Payment Gateway มาก่อน แนวคิด Timeout, Retry with Jitter และ Circuit Breaker คือเรื่องเดียวกันเป๊ะ แต่ฝั่ง AI มีจุดต่างสำคัญตรงที่ **แต่ละ request ช้ากว่า DB query 100–1,000 เท่า** และ **ผลลัพธ์จาก Fallback ต้องคุมทั้ง Schema กับ Groundedness**",
      ],
      table: [
        ["DB / REST API Timeout (~100–500 ms)", "LLM API Timeout (`connect=2s`, `read=4s`–`10s`)"],
        ["Static JSON / Cached Response Fallback", "Secondary Model / Grounded Snippet + Escalation"],
        ["HTTP 503 Retry-After Header", "Bounded Exponential Backoff + Jitter + Circuit Breaker"],
        ["Load Test (k6 / Locust) ดู RPS & P95", "Async Load Test ดู RPS, P95, Fallback Rate & Token Cost"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมแค่ try/except รอบเดียวถึงยังไม่พอ",
      body: [
        "ตอนเขียนโปรเจกต์แรก ๆ เรามักเขียนแค่ `try: call_llm() except Exception: return \"ระบบขัดข้อง\"` ซึ่งช่วยไม่ให้โปรแกรม crash แต่ไม่ช่วยเรื่องความเร็ว: ถ้าคน 20 คนกดเข้ามาตอน LLM ค้าง ทุกคนต้องรอ timeout เต็ม 30 วินาทีก่อนจะเห็นข้อความ",
        "การใช้ `CircuitBreaker` ร่วมกับ Fallback ที่มีประโยชน์ (เช่น คืนย่อหน้าเอกสารที่ค้นเจอพร้อมแหล่งอ้างอิง หรือแสดงสถานะคำสั่งซื้อจาก DB ตรง ๆ) ทำให้ผู้ใช้ยังทำงานต่อได้ทันทีโดยไม่ต้องรอค้าง",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองสร้าง **Resilient LLM Gateway** แบบครบวงจรใน Python แล้วทดสอบ Fault Injection (Timeout + 503 ต่อเนื่อง) พร้อมวัด P50/P95 ภายใต้ concurrent load กด **ขั้นต่อไป** เพื่อดูทีละส่วน",
    steps: [
      {
        title: "1 · สร้าง CircuitBreaker และ Response Schema ที่รองรับ Degraded Mode",
        explain:
          "นิยาม `ResilientReply` ด้วย Pydantic เพื่อบังคับให้ทั้งคำตอบปกติและคำตอบ Fallback ใช้โครงสร้างเดียวกัน จากนั้นสร้าง `CircuitBreaker` ที่มี state `closed`, `open`, `half_open` โดยใช้ `clock` แบบฉีดได้ (injectable clock) เพื่อให้ทดสอบ cooldown ใน pytest ได้ทันทีโดยไม่ต้อง `sleep()` จริง",
        code: {
          language: "python",
          filename: "worked_resilience.py",
          code: `import time
from typing import Callable, Literal
from pydantic import BaseModel, Field


class ResilientReply(BaseModel):
    answer: str = Field(min_length=1)
    citations: list[str] = Field(default_factory=list)
    degraded: bool = False
    fallback_reason: str | None = None
    mode: Literal["primary", "fallback_snippet", "escalated"]


class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 3,
        cooldown_sec: float = 10.0,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.cooldown_sec = cooldown_sec
        self.clock = clock
        self.failures = 0
        self.opened_at: float | None = None
        self.state: Literal["closed", "open", "half_open"] = "closed"

    def allow_request(self) -> bool:
        if self.state == "closed":
            return True
        if self.state == "open" and self.opened_at is not None:
            if self.clock() - self.opened_at >= self.cooldown_sec:
                self.state = "half_open"
                return True
        return self.state == "half_open"

    def record_success(self) -> None:
        self.failures = 0
        self.opened_at = None
        self.state = "closed"

    def record_failure(self) -> None:
        self.failures += 1
        if self.state == "half_open" or self.failures >= self.failure_threshold:
            self.state = "open"
            self.opened_at = self.clock()`,
        },
      },
      {
        title: "2 · ห่อ Async Call ด้วย Timeout + Retry + Safe Grounded Fallback",
        explain:
          "ฟังก์ชัน `ask_with_fallback` จะเช็ก `breaker.allow_request()` ก่อนเสมอ ถ้าวงจรเปิดให้ข้ามไป `build_grounded_fallback` ทันที แต่ถ้ายอมให้เรียก ให้ครอบด้วย `asyncio.wait_for(..., timeout=timeout_sec)` และคืน `ResilientReply` เสมอ",
        code: {
          language: "python",
          filename: "worked_resilience.py",
          code: `import asyncio


def build_grounded_fallback(snippets: list[tuple[str, str]], reason: str) -> ResilientReply:
    if not snippets:
        return ResilientReply(
            answer="ขออภัย ระบบ AI ขัดข้องชั่วคราวและไม่พบเอกสารอ้างอิงที่ตรงกัน กรุณาติดต่อเจ้าหน้าที่",
            citations=[],
            degraded=True,
            fallback_reason=reason,
            mode="escalated",
        )
    top_id, top_text = snippets[0]
    return ResilientReply(
        answer=f"[โหมดสำรอง] ข้อมูลจากเอกสารอ้างอิง: {top_text}",
        citations=[top_id],
        degraded=True,
        fallback_reason=reason,
        mode="fallback_snippet",
    )


async def ask_with_fallback(
    call_primary,
    snippets: list[tuple[str, str]],
    breaker: CircuitBreaker,
    timeout_sec: float = 0.05,
    max_retries: int = 1,
) -> ResilientReply:
    if not breaker.allow_request():
        return build_grounded_fallback(snippets, "circuit_open")

    last_reason = "unknown_error"
    for attempt in range(max_retries + 1):
        try:
            text = await asyncio.wait_for(call_primary(), timeout=timeout_sec)
            breaker.record_success()
            return ResilientReply(
                answer=text,
                citations=[s[0] for s in snippets[:1]],
                degraded=False,
                mode="primary",
            )
        except asyncio.TimeoutError:
            last_reason = "llm_timeout"
            breaker.record_failure()
        except RuntimeError:
            last_reason = "provider_error"
            breaker.record_failure()
        if not breaker.allow_request():
            break
    return build_grounded_fallback(snippets, last_reason)`,
        },
      },
      {
        title: "3 · จำลอง Timeout 3 ครั้งติดเพื่อดู Breaker เปิดและฟื้นตัวหลัง Cooldown",
        explain:
          "รันการจำลองด้วย `fake_clock` ที่เลื่อนเวลาเองได้: ช่วงแรก LLM ค้างจนเปิดวงจร (`open`), คำขอถัดมาจึงได้ fallback ทันทีโดยไม่เสียเวลารอ timeout, และเมื่อเวลาผ่านไปจนครบ cooldown ก็ฟื้นกลับสู่ `closed`",
        code: {
          language: "python",
          filename: "worked_resilience.py",
          code: `async def demo() -> None:
    now = [0.0]
    breaker = CircuitBreaker(failure_threshold=2, cooldown_sec=10.0, clock=lambda: now[0])
    snippets = [("pol-refund#1", "คืนสินค้าได้ภายใน 14 วันพร้อมใบเสร็จ")]
    should_hang = True

    async def mock_llm() -> str:
        if should_hang:
            await asyncio.sleep(0.2)
        return "คุณสามารถคืนสินค้าได้ภายใน 14 วันครับ [pol-refund#1]"

    r1 = await ask_with_fallback(mock_llm, snippets, breaker, timeout_sec=0.01, max_retries=1)
    print("Call 1:", r1.mode, r1.fallback_reason, "breaker=", breaker.state)

    r2 = await ask_with_fallback(mock_llm, snippets, breaker, timeout_sec=0.01, max_retries=1)
    print("Call 2 (fast-fail):", r2.mode, r2.fallback_reason, "breaker=", breaker.state)

    now[0] = 12.0
    should_hang = False
    r3 = await ask_with_fallback(mock_llm, snippets, breaker, timeout_sec=0.05, max_retries=1)
    print("Call 3 (recovered):", r3.mode, "degraded=", r3.degraded, "breaker=", breaker.state)


asyncio.run(demo())`,
        },
        output: `Call 1: fallback_snippet llm_timeout breaker= open
Call 2 (fast-fail): fallback_snippet circuit_open breaker= open
Call 3 (recovered): primary degraded= False breaker= closed`,
      },
    ],
    gotcha:
      "จุดสังเกต: ใน `CircuitBreaker` อย่าลืมบันทึก `record_failure()` ในตำแหน่งที่นับความล้มเหลวของแต่ละครั้งอย่างถูกต้อง และต้องฉีด `clock` แทนการเรียก `time.sleep()` ใน unit test มิฉะนั้น test suite ของคุณจะช้าและ flaky",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/load_resilience.py` สำหรับระบบ Capstone เพื่อรวม `CircuitBreaker`, Async Resilient LLM Caller (Timeout + Bounded Retry + PDPA-safe Grounded Fallback) และ `run_load_benchmark` ที่คำนวณ P50/P95/Fallback Rate พร้อมตรวจ SLA",
    requirements: [
      "สร้าง `ChatFallbackResponse(BaseModel)` ที่มี `answer: str`, `citations: list[str]`, `degraded: bool`, `fallback_reason: str | None`, `mode: Literal[\"primary\", \"fallback_snippet\", \"escalated\"]` และ `trace_id: str` (ขึ้นต้น `\"tr-\"`)",
      "สร้าง `CircuitBreaker(failure_threshold=3, cooldown_sec=10.0, clock=time.monotonic)` ที่รองรับ `closed`, `open`, `half_open` พร้อมเมธอด `allow_request()`, `record_success()`, `record_failure()`",
      "สร้าง `async def invoke_with_resilience(llm_coro_fn, snippets: list[tuple[str, str]], breaker: CircuitBreaker, trace_id: str, timeout_sec: float = 0.05, max_retries: int = 1, redactor=None) -> ChatFallbackResponse`: ต้องคุม timeout ด้วย `asyncio.wait_for`, ห้ามส่ง retry ถ้าเป็น `ValueError` (non-retryable), คืน `fallback_snippet` เมื่อมี `snippets` หรือ `escalated` เมื่อไม่มี `snippets`, และเรียก `redactor(text)` (ถ้ามี) กับคำตอบเสมอแม้ในโหมด fallback",
      "สร้าง `async def run_load_benchmark(queries: list[str], handler, concurrency: int = 5) -> dict`: ใช้ `asyncio.Semaphore(concurrency)` คุม concurrency, คืน dict ที่มี `total`, `succeeded`, `degraded_count`, `error_count`, `p50_ms`, `p95_ms`, `fallback_rate`",
    ],
    starter: {
      language: "python",
      filename: "src/load_resilience.py",
      code: `import asyncio
import math
import time
from typing import Awaitable, Callable, Literal
from pydantic import BaseModel, Field, field_validator


class NonRetryableLLMError(ValueError):
    """Error ที่ไม่ควร retry เช่น bad payload หรือ auth error"""


class ChatFallbackResponse(BaseModel):
    answer: str = Field(min_length=1)
    citations: list[str] = Field(default_factory=list)
    degraded: bool
    fallback_reason: str | None = None
    mode: Literal["primary", "fallback_snippet", "escalated"]
    trace_id: str

    @field_validator("trace_id")
    @classmethod
    def check_trace_prefix(cls, v: str) -> str:
        if not v.startswith("tr-"):
            raise ValueError("trace_id must start with 'tr-'")
        return v


class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 3,
        cooldown_sec: float = 10.0,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        # TODO: เก็บ state, failures, opened_at
        pass

    def allow_request(self) -> bool:
        raise NotImplementedError

    def record_success(self) -> None:
        raise NotImplementedError

    def record_failure(self) -> None:
        raise NotImplementedError


async def invoke_with_resilience(
    llm_coro_fn: Callable[[], Awaitable[str]],
    snippets: list[tuple[str, str]],
    breaker: CircuitBreaker,
    trace_id: str,
    timeout_sec: float = 0.05,
    max_retries: int = 1,
    redactor: Callable[[str], str] | None = None,
) -> ChatFallbackResponse:
    raise NotImplementedError


def percentile_ms(samples: list[float], p: float) -> float:
    if not samples:
        return 0.0
    ordered = sorted(samples)
    idx = max(0, math.ceil((p / 100.0) * len(ordered)) - 1)
    return round(ordered[idx], 2)


async def run_load_benchmark(
    queries: list[str],
    handler: Callable[[str], Awaitable[ChatFallbackResponse]],
    concurrency: int = 5,
) -> dict:
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_load_resilience.py",
      code: `import asyncio
import pytest
from src.load_resilience import (
    CircuitBreaker,
    NonRetryableLLMError,
    invoke_with_resilience,
    run_load_benchmark,
)


def test_timeout_triggers_breaker_and_preserves_pdpa_in_fallback():
    now = [0.0]
    breaker = CircuitBreaker(failure_threshold=2, cooldown_sec=5.0, clock=lambda: now[0])
    calls = 0

    async def slow_llm() -> str:
        nonlocal calls
        calls += 1
        await asyncio.sleep(0.1)
        return "never reached"

    def mask_phone(text: str) -> str:
        return text.replace("0812345678", "[PHONE_MASKED]")

    snippets = [("pol-contact#1", "ติดต่อฝ่ายเคลมที่ 0812345678 ทุกวัน")]

    r1 = asyncio.run(
        invoke_with_resilience(
            slow_llm, snippets, breaker, "tr-001", timeout_sec=0.01, max_retries=1, redactor=mask_phone
        )
    )
    assert r1.degraded is True
    assert r1.mode == "fallback_snippet"
    assert r1.citations == ["pol-contact#1"]
    assert "[PHONE_MASKED]" in r1.answer
    assert "0812345678" not in r1.answer
    assert breaker.state == "open"
    calls_before_fast_fail = calls

    # รอบถัดไปต้อง fast-fail โดยไม่เรียก slow_llm เพิ่ม
    r2 = asyncio.run(
        invoke_with_resilience(
            slow_llm, snippets, breaker, "tr-002", timeout_sec=0.01, max_retries=1, redactor=mask_phone
        )
    )
    assert r2.fallback_reason == "circuit_open"
    assert calls == calls_before_fast_fail


def test_non_retryable_error_stops_immediately_and_escalates_when_no_snippets():
    breaker = CircuitBreaker(failure_threshold=3)
    calls = 0

    async def bad_request() -> str:
        nonlocal calls
        calls += 1
        raise NonRetryableLLMError("invalid prompt payload")

    res = asyncio.run(
        invoke_with_resilience(bad_request, [], breaker, "tr-003", max_retries=3)
    )
    assert calls == 1
    assert res.degraded is True
    assert res.mode == "escalated"
    assert res.fallback_reason == "non_retryable"


def test_breaker_half_open_recovery():
    now = [0.0]
    breaker = CircuitBreaker(failure_threshold=1, cooldown_sec=10.0, clock=lambda: now[0])
    fail = True

    async def flaky_llm() -> str:
        if fail:
            raise RuntimeError("503 upstream")
        return "คำตอบปกติ [pol-faq#2]"

    r1 = asyncio.run(
        invoke_with_resilience(flaky_llm, [("pol-faq#2", "faq")], breaker, "tr-004", max_retries=0)
    )
    assert r1.degraded is True
    assert breaker.state == "open"

    now[0] = 11.0
    fail = False
    r2 = asyncio.run(
        invoke_with_resilience(flaky_llm, [("pol-faq#2", "faq")], breaker, "tr-005", max_retries=0)
    )
    assert r2.degraded is False
    assert r2.mode == "primary"
    assert breaker.state == "closed"


def test_concurrent_load_benchmark_metrics():
    async def run_test() -> dict:
        breaker = CircuitBreaker(failure_threshold=10)

        async def handler(q: str):
            async def llm() -> str:
                await asyncio.sleep(0.005)
                if "timeout" in q:
                    await asyncio.sleep(0.05)
                return f"ตอบ: {q}"

            return await invoke_with_resilience(
                llm, [("pol-1#1", "ข้อมูลสำรอง")], breaker, f"tr-{q}", timeout_sec=0.02, max_retries=0
            )

        queries = [f"q{i}" for i in range(8)] + ["timeout-1", "timeout-2"]
        return await run_load_benchmark(queries, handler, concurrency=4)

    summary = asyncio.run(run_test())
    assert summary["total"] == 10
    assert summary["succeeded"] == 10
    assert summary["degraded_count"] == 2
    assert summary["error_count"] == 0
    assert summary["p95_ms"] >= summary["p50_ms"] > 0
    assert summary["fallback_rate"] == pytest.approx(0.2)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_load_resilience.py` ผ่านครบทั้ง 4 test cases",
      "ยืนยันว่าเมื่อ `breaker.state == \"open\"` จำนวนครั้งการเรียก `slow_llm` ไม่เพิ่มขึ้นเลย (fast-fail)",
      "ยืนยันว่า `redactor` ทำงานกับคำตอบในโหมด `fallback_snippet` ไม่หลุดเบอร์โทร 0812345678",
      "ยืนยันว่า `NonRetryableLLMError` ไม่ถูก retry ซ้ำแม้ตั้ง `max_retries=3`",
      "รัน `uv run ruff check .` ไม่พบ lint warning หรือ error",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ใน `tests/test_load_resilience.py` และคำนวณ P50/P95/Fallback Rate ภายใต้ concurrent load ได้ถูกต้อง",
    hints: [
      {
        body: "แยก exception handling ใน `invoke_with_resilience` เป็น 2 กลุ่ม: `NonRetryableLLMError` ให้ break ออกจากการ retry ทันทีโดยไม่นับซ้ำ ส่วน `asyncio.TimeoutError` และ `RuntimeError` ให้นับ `breaker.record_failure()` แล้ววน retry เฉพาะเมื่อ `breaker.allow_request()` ยังเป็น True",
      },
      {
        body: "อย่าลืมเรียก `redactor(answer)` เป็นขั้นตอนสุดท้ายก่อนสร้าง `ChatFallbackResponse` ทั้งกรณี `primary`, `fallback_snippet` และ `escalated` เพื่อรับประกันว่า PDPA ไม่รั่วในทุกเส้นทาง",
      },
      {
        body: "ตัวอย่างโครง `run_load_benchmark` ที่ใช้ `asyncio.Semaphore` และ `time.perf_counter()` เพื่อวัด latency ต่อ request:",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `async def run_load_benchmark(queries, handler, concurrency: int = 5) -> dict:
    sem = asyncio.Semaphore(concurrency)
    latencies: list[float] = []
    degraded_count = 0
    error_count = 0

    async def _one(q: str) -> None:
        nonlocal degraded_count, error_count
        async with sem:
            t0 = time.perf_counter()
            try:
                res = await handler(q)
                if res.degraded:
                    degraded_count += 1
            except Exception:
                error_count += 1
            finally:
                latencies.append((time.perf_counter() - t0) * 1000.0)

    await asyncio.gather(*(_one(q) for q in queries))
    total = len(queries)
    succeeded = total - error_count
    return {
        "total": total,
        "succeeded": succeeded,
        "degraded_count": degraded_count,
        "error_count": error_count,
        "p50_ms": percentile_ms(latencies, 50),
        "p95_ms": percentile_ms(latencies, 95),
        "fallback_rate": round(degraded_count / total, 4) if total else 0.0,
    }`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_load_resilience.py
uv run ruff check .`,
      caption: "ทดสอบ Fault Injection และ Concurrent Load Benchmark บนเครื่อง 100% ออฟไลน์",
    },
  },

  mistakes: [
    {
      title: "วัดผล Load Test ด้วยค่าเฉลี่ย (Mean) อย่างเดียวโดยไม่ดู P95/P99",
      symptom: "รายงานว่า API เร็วเฉลี่ย 800 ms แต่ผู้ใช้จริงบ่นว่าค้าง 15 วินาทีเป็นระยะ",
      fix: "เก็บ latency ทุก request แล้วคำนวณ `P50` และ `P95` เสมอ เพื่อเปิดโปง tail latency จาก timeout หรือ cold start",
    },
    {
      title: "ส่งคำขอเข้า Fallback โดยข้าม PDPA Redaction Middleware",
      symptom: "ตอนระบบปกติซ่อนเบอร์โทร/บัตรประชาชนครบ แต่พอ LLM หลักล่มแล้วคืน snippet ดิบจาก DB กลับหลุด PII ออกไป",
      fix: "วาง PDPA Redaction เป็นชั้นสุดท้ายก่อนส่ง response ออกทุกเส้นทาง และเขียน pytest ยืนยันว่า fallback output ถูก mask เสมอ",
    },
    {
      title: "Retry ทุก Error แบบไม่แยกแยะและไม่มี Circuit Breaker",
      symptom: "เมื่อ API key หมดอายุ (401) หรือ provider ล่ม 100% ระบบยังยิงซ้ำ 3–5 รอบต่อผู้ใช้หนึ่งคน เกิด retry storm",
      fix: "แยก Non-Retryable (`400/401/403`) ออกจากการ retry และติดตั้ง {{circuit-breaker}} ให้ตัดวงจรเมื่อพังติดกันถึงเกณฑ์",
    },
    {
      title: "ใช้ `time.sleep()` ในฟังก์ชัน `async def` ระหว่าง backoff",
      symptom: "ขณะรอ retry ของผู้ใช้ 1 คน ทั้งเซิร์ฟเวอร์ FastAPI ค้างหยุดรับผู้ใช้คนอื่นทั้งหมดเพราะ event loop ถูกบล็อก",
      fix: "ใช้ `await asyncio.sleep(...)` เสมอในโค้ด async และใช้ injectable clock ใน unit test เพื่อไม่ต้องรอเวลาจริง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d177-q1",
        "ในการทำ Load Test ระบบ AI ที่มี 20 concurrent users ทำไมจึงต้องตรวจ **P95 Latency** ควบคู่กับ **P50** แทนการดูค่าเฉลี่ย (Mean) อย่างเดียว?",
        [
          ["เพราะ P95 คำนวณได้เร็วกว่า Mean ใน Python", "ไม่ใช่เรื่องความเร็วการคำนวณ — ทั้งคู่คำนวณในระดับไมโครวินาที"],
          ["เพราะค่าเฉลี่ยมักถูกบดบังเมื่อมี 5% ของคำขอค้างนานมาก (Tail Latency) ซึ่งกระทบผู้ใช้จริงและ SLA", "ถูก — P95 บอกเวลาของคำขอ 95% แรก จึงจับอาการ timeout spike หรือ rate-limit stall ได้แม่นกว่าค่าเฉลี่ย"],
          ["เพราะ P95 จะให้ตัวเลขที่ต่ำกว่า Mean เสมอทำให้รายงานดูสวยขึ้น", "ตรงข้าม — P95 มักสูงกว่า Mean/P50 เมื่อกราฟเบ้ขวา"],
          ["เพราะ FastAPI บังคับส่ง P95 กลับไปใน HTTP header ทุกครั้ง", "ไม่จริง — FastAPI ไม่ได้บังคับ แต่เป็นตัวชี้วัดมาตรฐานด้าน SRE/Observability"],
        ],
        "B",
        "ค่า Mean ถูกดึงลงด้วยคำขอส่วนใหญ่ที่เร็ว ทำให้ซ่อนปัญหา 5% ของคำขอที่ค้างนานมาก P95 จึงเป็นตัววัด SLA ที่ตรงกับประสบการณ์ผู้ใช้จริงมากกว่า",
        "ทำไม Load Test จึงต้องรายงาน P95 Latency แทนการดู Mean Latency อย่างเดียว?",
        "เพราะ Mean ซ่อนอาการค้างที่หางกราฟ (tail latency) ได้ ส่วน P95 สะท้อนขีดจำกัดความเร็วที่ผู้ใช้ 95% ได้รับจริง",
      ),
      mc(
        "d177-q2",
        "เมื่อ {{circuit-breaker}} เปลี่ยนสถานะจาก `CLOSED` เป็น `OPEN` หลังจาก LLM provider เกิด `Timeout` ติดต่อกัน 3 ครั้ง พฤติกรรมของคำขอที่ 4 ทันทีหลังจากนั้นควรเป็นอย่างไร?",
        [
          ["ยังยิงไปหา LLM provider เดิมพร้อมเพิ่ม timeout เป็น 60 วินาที", "ผิด — ยิ่งทำให้ผู้ใช้รอนานและเพิ่มภาระให้ปลายทางที่กำลังล่ม"],
          ["ข้ามการยิง LLM หลักทันที (Fail-Fast) แล้วสลับเข้าสู่ Safe Fallback จนกว่าจะครบเวลา cooldown", "ถูก — นี่คือหน้าที่หลักของสถานะ OPEN เพื่อลด latency ช่วง outage และปล่อยให้ปลายทางได้พักฟื้น"],
          ["ลบข้อมูลใน vector database เพื่อลดโหลด", "ไม่เกี่ยวข้องและทำให้ข้อมูลเอกสารหาย"],
          ["ปิด PDPA middleware ชั่วคราวเพื่อให้ตอบเร็วขึ้น", "อันตรายมาก — กฎความปลอดภัยและ PDPA ห้ามปิดในทุกกรณี"],
        ],
        "B",
        "ในสถานะ OPEN Circuit Breaker จะ short-circuit คำขอไปที่ Safe Fallback ทันทีโดยไม่รอ timeout จนกว่าจะพ้นช่วง cooldown เพื่อเข้าสู่ HALF_OPEN",
        "Circuit Breaker ในสถานะ OPEN ทำงานอย่างไรกับคำขอใหม่ที่เข้ามา?",
        "ปฏิเสธการเรียก primary LLM ทันที (fail-fast) และสลับไปใช้ Safe Fallback จนกว่าจะครบเวลา cooldown จึงค่อยลองยิง 1 ครั้งในสถานะ HALF_OPEN",
      ),
      mc(
        "d177-q3",
        "ข้อใดคือพฤติกรรมของ **Graceful Degradation** ที่ถูกต้องเมื่อ LLM หลักล่มระหว่างให้บริการระบบ AI องค์กร?",
        [
          ["ปล่อยให้ FastAPI พ่น `500 Internal Server Error` พร้อม Python traceback ให้ผู้ใช้ดู", "ไม่เป็นมิตรต่อผู้ใช้และเสี่ยงเปิดเผยโครงสร้างโค้ดภายใน"],
          ["ให้ระบบสลับไปตอบแบบเดาจากคำที่พบบ่อยโดยไม่ต้องอ้างอิงเอกสารและไม่ต้องเช็ก Schema", "ผิด — การละเมิดกฎ Groundedness และ Schema ทำให้เกิดความเสี่ยงทางธุรกิจ"],
          ["คืน Grounded Snippet จาก Top-k เอกสารพร้อม citation (หรือข้อมูล DB แบบ masked) ภายใต้ Pydantic Schema เดิม และติด flag `degraded=True`", "ถูก — ผู้ใช้ยังได้ข้อมูลที่มีหลักฐาน ปลอดภัยตาม PDPA และระบบ observability รู้ทันทีว่าเกิดโหมดสำรอง"],
          ["อนุญาตให้ write tool แก้ไขฐานข้อมูลไปก่อนโดยข้าม HITL gate", "ผิดร้ายแรง — ห้ามข้าม HITL gate สำหรับ write action เด็ดขาด"],
        ],
        "C",
        "Graceful Degradation ที่ดีต้องรักษากฎเหล็ก (Schema, PDPA, Groundedness, HITL) ไว้ครบ 100% พร้อมแจ้งสถานะ `degraded=True`",
        "ในการออกแบบ Safe Fallback เราห้ามลดมาตรฐานข้อใดบ้างแม้ระบบ LLM หลักจะล่ม?",
        "ห้ามข้าม Pydantic Schema validation, ห้ามปิด PDPA redaction, ห้ามเดาคำตอบไร้แหล่งอ้างอิง และห้ามข้าม HITL gate ของ write action",
      ),
      mc(
        "d177-q4",
        "ข้อใดคือ Error ที่ **ไม่ควร** ทำ Automatic Retry และควรส่งเข้า Fallback หรือรายงานทันที?",
        [
          ["`asyncio.TimeoutError` ชั่วคราวจาก network jitter", "Timeout ชั่วคราวสามารถ retry แบบจำกัด 1–2 ครั้งได้"],
          ["HTTP `503 Service Unavailable` จาก provider", "503 เป็น transient server error ที่เหมาะกับการทำ backoff retry"],
          ["HTTP `429 Too Many Requests` พร้อม `Retry-After`", "429 สามารถรอตาม backoff/Retry-After แล้วลองใหม่ได้"],
          ["HTTP `400 Bad Request` หรือ `401 Unauthorized` (API Key ผิด / Payload ไม่ผ่าน schema)", "ถูก — การยิงซ้ำไม่มีทางทำให้ 400 หรือ 401 กลายเป็นสำเร็จ มีแต่เสียเวลาและโควตาเปล่า"],
        ],
        "D",
        "การ retry ควรทำเฉพาะ transient error (`Timeout`, `429`, `5xx`) เท่านั้น ส่วน client/auth error (`400`, `401`, `403`) ต้อง fail-fast ทันที",
        "Error ประเภทใดที่ไม่ควรทำ Retry และควร Fail-Fast ทันที?",
        "Non-retryable client/auth errors เช่น 400 Bad Request, 401 Unauthorized, 403 Forbidden หรือ ValidationError เพราะยิงซ้ำก็ยังผิดเหมือนเดิม",
      ),
    ],
  },

  takeaways: [
    "การทดสอบ Load ต้องใช้ {{asyncio}} ยิงแบบ concurrent และวัด **P50 กับ P95 Latency** ไม่ใช่แค่ค่าเฉลี่ย",
    "ตั้ง {{httpx}} timeout ชัดเจน, จำกัด retry เฉพาะ transient error ด้วย jittered {{exponential-backoff}}, และใช้ {{circuit-breaker}} ป้องกัน cascade failure",
    "Safe Fallback ต้องคง **Pydantic Schema, {{pdpa}} Masking, Grounded Citations และ {{hitl}}** ไว้ 100% พร้อมติด `degraded=True` ลง log/trace",
    "ใช้ mock transport และ injectable clock เพื่อทดสอบความทนทานของระบบใน `pytest` ได้เร็วและฟรี 100%",
  ],

  reviewCards: [
    rc(
      "d177-rc-1",
      "วงจร 3 สถานะของ Circuit Breaker (Closed, Open, Half-Open) เปลี่ยนผ่านอย่างไร?",
      "Closed (ปกติ) → พังครบ threshold เปลี่ยนเป็น Open (fail-fast เข้า fallback) → ครบ cooldown เปลี่ยนเป็น Half-Open (ลองยิง 1 ครั้ง) → สำเร็จกลับ Closed / พังกลับ Open",
    ),
    rc(
      "d177-rc-2",
      "ทำไม Load Test ต้องดู P95 Latency และ Error/Fallback Rate ควบคู่กัน?",
      "เพราะ P50/Mean ซ่อนคำขอ 5% ท้ายที่ค้างนาน (tail latency) และระบบอาจตอบเร็วขึ้นหลอกตาหากมัน fail-fast เป็น error หมด จึงต้องดู Error/Fallback Rate ประกอบเสมอ",
    ),
    rc(
      "d177-rc-3",
      "ในระบบ Capstone ของเรา ถ้า LLM Timeout ในเส้นทาง `faq_rag` และ `mcp_lookup` ควร Fallback อย่างไร?",
      "`faq_rag` คืน Top retrieved snippets ที่ผ่าน hybrid search พร้อม `[doc#chunk]` citation + แจ้ง `degraded=True`; `mcp_lookup` คืนข้อมูลจาก DB พร้อม PDPA mask โดยไม่ต้องใช้ LLM",
    ),
  ],

  sources: [
    { label: "HTTPX — Timeouts & Async Client", href: "https://www.python-httpx.org/advanced/timeouts/" },
    { label: "Python asyncio — Synchronization & Timeouts", href: "https://docs.python.org/3/library/asyncio-task.html#timeouts" },
    { label: "Martin Fowler — Circuit Breaker Pattern", href: "https://martinfowler.com/bliki/CircuitBreaker.html" },
    { label: "FastAPI — Handling Errors & Lifespan", href: "https://fastapi.tiangolo.com/tutorial/handling-errors/" },
  ],

  glossary: [
    "asyncio",
    "semaphore",
    "httpx",
    "exponential-backoff",
    "circuit-breaker",
    "rate-limit",
    "ttft",
    "pdpa",
    "structured-output",
    "abstention",
  ],
});
