import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D015 — Phase 1 / Block B04
 * Rate Limiting, Idempotency & Circuit Breaker Patterns.
 */
export const d015: Lesson = defineLesson({
  day: 15,
  titleTh: "ป้องกันระบบพังซ้ำซ้อน: Rate Pacing, Idempotency Key และ Circuit Breaker",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · คุมจังหวะการยิงฝั่งไคลเอนต์, กันสร้างข้อมูลซ้ำตอน retry และตัดวงจรคืน fallback เมื่อปลายทางล่มยาว",
  icon: "gauge",
  visual: {
    id: "circuit-breaker",
    title: "Circuit Breaker State Machine (Closed → Open → Half-Open) & Idempotency",
    caption: "กดจำลองความล้มเหลวต่อเนื่องเพื่อดูเบรกเกอร์ตัดวงจรคืน fallback และทดสอบฟื้นตัวแบบ Half-Open",
    alt: "แผนภาพสถานะ Circuit Breaker และ Idempotency Key",
  },
  requiresApiKey: false,
  tools: ["httpx", "tenacity", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ควบคุมจังหวะการดึงและส่งข้อมูลก่อนโดน 429",
      body: "Retry ช่วยแก้ปัญหาหลังโดน {{rate-limit}} ไปแล้ว แต่ถ้า pipeline ยิงคำขอถี่เกินเพดานอยู่ตลอดเวลา เราก็จะชน 429 ซ้ำซากไม่จบสิ้น",
      lessonNote: "Client-side Rate Pacing ช่วยเว้นจังหวะคำขอตั้งแต่ต้นทางให้พอดีกับโควตาที่ปลายทางรับได้",
    },
    {
      node: 4,
      heading: "ป้องกัน \"การสร้างทิกเก็ตหรือตัดเงินซ้ำ\" เมื่อ Retry งานประเภท Write",
      body: "เวลา AI Agent เรียก API สร้างทิกเก็ต คืนเงิน หรือส่งแจ้งเตือน หากคำขอแรกทำงานบนเซิร์ฟเวอร์สำเร็จแล้วแต่คำตอบ timeout กลางทาง การ retry โดยไม่มีตัวกันซ้ำจะทำให้เกิดรายการเบิ้ล 2 ครั้ง!",
      lessonNote: "วันนี้เราใช้หลัก {{idempotency}} โดยสร้าง `Idempotency-Key` คงที่ **นอกลูป retry** และส่งแนบใน HTTP header ทุกครั้ง",
    },
    {
      node: 5,
      heading: "ตัดวงจรอย่างสง่างามเมื่อบริการปลายทางล่มต่อเนื่อง",
      body: "หากผู้ให้บริการ LLM หรือ API หลักล่มยาว 10 นาที การปล่อยให้ทุกคำขอลอง retry 4 รอบ × 15 วินาที จะทำให้ระบบเราคิวตันและล่มตามไปด้วย (Cascading Failure)",
      lessonNote: "{{circuit-breaker}} (`Closed → Open → Half-Open`) ช่วยตัดวงจรให้ {{fail-fast}} คืน fallback ทันที และแอบส่งคำขอทดสอบเมื่อครบเวลาพัก",
    },
  ],

  objectives: [
    "**ออกแบบ** Client-side Rate Pacing (`MinIntervalRateLimiter`) เพื่อคุมอัตราการยิงคำขอไม่ให้เกินโควตาที่กำหนดและทดสอบได้แบบไม่ต้องรอเวลาจริง",
    "**ประยุกต์ใช้** `Idempotency-Key` header อย่างถูกตำแหน่ง (สร้าง 1 ครั้งต่อ 1 งานนอกลูป retry) เพื่อรับประกัน {{idempotency}} ไม่ให้เกิดรายการซ้ำเมื่อเกิด timeout/retry",
    "**สร้างและทดสอบ** State Machine ของ {{circuit-breaker}} (`closed` → `open` → `half_open` → `closed`) ที่นับเฉพาะความล้มเหลวของปลายทางและคืน error แบบ fail-fast ระหว่างวงจรเปิด",
  ],

  prerequisites: [
    "เข้าใจ `httpx.Client` + `MockTransport` (Day 13) และ `tenacity` retry + `TransientAPIError` (Day 14)",
    "คุ้นเคยกับการฉีด dependency (`clock`, `sleeper`) สำหรับการทดสอบใน `pytest`",
    "ไม่ต้องใช้ API key — ทดสอบ state machine และ rate pacing บนเครื่อง 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ Day 15 พร้อม `httpx`, `tenacity`, `pytest` และ `ruff` เพื่อฝึกสร้างชุดป้องกัน 3 ชั้น (Rate Pacing + Idempotency Key + Circuit Breaker)",
    commands: `uv init ai-day15-resilience && cd ai-day15-resilience
uv add httpx tenacity
uv add --dev pytest ruff

uv run python -c "import httpx, tenacity; print('Resilience lab ready')"`,
    steps: [
      ["init", "สร้างโฟลเดอร์โปรเจกต์ `ai-day15-resilience` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `httpx`, `tenacity`, `pytest` และ `ruff`"],
      ["verify", "ทดสอบ import ผ่าน `uv run python` สำเร็จ"],
    ],
    note: "จุดสำคัญของการเขียนโค้ดที่เกี่ยวกับเวลา (Rate Limiter และ Circuit Breaker) คือการรับ `clock=time.monotonic` เข้ามาเป็นพารามิเตอร์ เพื่อให้ unit test เลื่อนเวลาจำลองได้ทันทีโดยไม่ใช้ `time.sleep`",
  },

  concepts: [
    {
      id: "client-rate-pacing",
      title: "1 · Client-side Rate Pacing — ชะลอตั้งแต่ฝั่งเรา แทนการชน 429 ซ้ำซาก",
      paragraphs: [
        "ใน Day 14 เราเรียนรู้วิธีรับมือหลังเจอ `429 Too Many Requests` แต่แนวทางที่สุภาพและเสถียรกว่าคือ **คุมจังหวะตั้งแต่ฝั่งผู้เรียก (Client-side Pacing)** เช่น หากโควตาอนุญาต 5 requests/วินาที เราควรเว้นช่องไฟอย่างน้อย `1 / 5 = 0.20` วินาทีต่อคำขอ",
        "หลักสำคัญคือต้องใช้ **`time.monotonic()`** (นาฬิกาเดินหน้าอย่างเดียว ไม่ถอยหลังเมื่อเครื่องซิงก์ NTP) ไม่ใช่ `time.time()` และเปิดช่องให้ฉีด `clock` กับ `sleeper` เข้ามาเพื่อให้ทดสอบใน `pytest` ได้แบบ deterministic 100%",
      ],
      analogy:
        "เหมือนการขับรถตามความเร็วที่ป้ายจำกัดไว้ (90 กม./ชม.) แทนที่จะเหยียบ 160 แล้วรอโดนใบสั่ง (`429`) ค่อยจอดพักข้างทาง",
      code: {
        language: "python",
        filename: "rate_pacer.py",
        code: `from collections.abc import Callable
import time


class MinIntervalRateLimiter:
    """คุมจังหวะไม่ให้ยิงถี่เกิน max_per_second คำขอต่อวินาที"""

    def __init__(
        self,
        max_per_second: float,
        clock: Callable[[], float] = time.monotonic,
        sleeper: Callable[[float], None] = time.sleep,
    ) -> None:
        if max_per_second <= 0:
            raise ValueError("max_per_second must be positive")
        self._interval = 1.0 / max_per_second
        self._clock = clock
        self._sleeper = sleeper
        self._next_allowed: float | None = None

    def acquire(self) -> float:
        now = self._clock()
        if self._next_allowed is None or now >= self._next_allowed:
            self._next_allowed = now + self._interval
            return 0.0
        wait = self._next_allowed - now
        self._sleeper(wait)
        self._next_allowed += self._interval
        return wait`,
        caption: "ใช้ `time.monotonic` เป็นค่าเริ่มต้น และฉีด `clock`/`sleeper` ได้เพื่อทดสอบการเว้นจังหวะโดยไม่ต้องรอเวลาจริง",
      },
      whyTitle: "Why this matters — ป้องกันโควตาเต็มทั้งทีมในงาน Batch AI",
      whyParagraphs: [
        "เวลาคุณรันสคริปต์สร้าง embedding หรือจัดหมวดหมู่เอกสาร 5,000 ชิ้นบน API key เดียวกับระบบ production หากไม่มี rate pacer สคริปต์ของคุณจะกินโควตาทั้งหมดจนผู้ใช้จริงโดน 429 ไปด้วย",
        "เมื่อเข้าสู่ Day 18 (`asyncio.Semaphore`) คุณจะนำแนวคิดนี้ไปจับคู่กับการจำกัด concurrency เพื่อคุมทั้งจำนวนงานพร้อมกันและอัตราการยิงต่อวินาที",
      ],
    },
    {
      id: "idempotency-keys",
      title: "2 · `Idempotency-Key` — ทำไม Retry งาน `POST` ถึงอันตรายถ้าไม่มีตัวกันซ้ำ",
      paragraphs: [
        "คำขอแบบอ่าน (`GET`) มีคุณสมบัติ {{idempotency}} โดยธรรมชาติอยู่แล้ว (เรียกซ้ำ 3 ครั้งข้อมูลก็ไม่เปลี่ยน) แต่คำขอแบบสร้างหรือแก้ไข (`POST /v1/tickets`, `POST /v1/refunds`) **ไม่ idempotent โดยธรรมชาติ**: หากเซิร์ฟเวอร์สร้างทิกเก็ตสำเร็จแล้วแต่การเชื่อมต่อขาดก่อนส่ง 201 กลับมา การ retry จะสร้างทิกเก็ตซ้ำเป็นใบที่ 2!",
        "ทางแก้มาตรฐาน (ใช้โดย Stripe, Adyen และระบบ AI Tool Calling ยุคใหม่) คือแนบ header **`Idempotency-Key`** ที่มีค่าเฉพาะเจาะจงต่อ 1 การทำงาน โดยกฎเหล็กคือ: **ต้องสร้าง key 1 ครั้งนอกลูป retry** เพื่อส่ง key เดิมซ้ำในทุกรอบ retry — เซิร์ฟเวอร์จะจำผลลัพธ์เดิมไว้และคืนคำตอบเดิมโดยไม่สร้างรายการใหม่ซ้ำ",
      ],
      analogy:
        "เหมือนการเขียน \"เลขที่คำสั่งซื้อ #ORD-8821\" ไว้บนใบโอนเงิน — ถึงแม้ส่งสลิปซ้ำไปให้พนักงาน 2 รอบเพราะเน็ตหลุด พนักงานเห็นเลขเดิมก็จะรู้ทันทีว่าทำรายการนี้ไปแล้ว ไม่หักเงินซ้ำ",
      bullets: [
        "**ถูก**: สร้าง `key = idempotency_key or str(uuid.uuid4())` **ก่อนเข้า** `Retrying` → รอบ 1, 2, 3 ส่ง `Idempotency-Key` ค่าเดียวกันทุกครั้ง",
        "**ผิดร้ายแรง**: เรียก `str(uuid.uuid4())` **ข้างใน** ลูป retry → ทุกรอบได้ key ใหม่ กลายเป็นสร้างทิกเก็ตหรือตัดเงินเบิ้ลหลายรอบ!",
        "**Tip**: ถ้างานมีตัวระบุธุรกิจชัดเจน เช่น `ticket_id` สามารถใช้ key เชิงกำหนด เช่น `f\"ticket-create-{ticket_id}\"` เพื่อให้แม้โปรเซสพังแล้วรันใหม่ก็ยังไม่สร้างซ้ำ",
      ],
      whyTitle: "Why this matters — หัวใจของ Safe AI Agents ใน Phase 4",
      whyParagraphs: [
        "ใน Phase 4 (Day 110) เมื่อคุณให้ LLM เรียกเครื่องมือ (Tool Calling) เช่น ส่งอีเมล สร้างใบแจ้งหนี้ หรือเปิดเคสซัพพอร์ต หากโมเดลหรือเครือข่ายสั่ง retry โดยไม่มี `Idempotency-Key` เอเจนต์ของคุณอาจส่งอีเมลหรือคืนเงินลูกค้าซ้ำหลายรอบได้จริง",
        "การวางวินัยสร้าง `Idempotency-Key` นอกลูป retry ตั้งแต่วันนี้ทำให้โค้ดฝั่งไคลเอนต์ปลอดภัยต่อทั้ง network timeout และ LLM retry ในอนาคต",
      ],
    },
    {
      id: "circuit-breaker-state-machine",
      title: "3 · Circuit Breaker (`Closed` → `Open` → `Half-Open`) — ตัดวงจรเมื่อปลายทางล่มยาว",
      paragraphs: [
        "{{exponential-backoff}} มีไว้รับมือ \"อาการสะดุดสั้น ๆ\" แต่ถ้า API ปลายทางล่มจริงจัง 10 นาที การปล่อยให้คำขอใหม่ทุกตัวรอ retry 4 รอบจะยิ่งถ่วงระบบเราจนล่มตามไปด้วย {{circuit-breaker}} จึงเข้ามาคั่นกลางเหมือนเบรกเกอร์ไฟฟ้าในบ้าน",
        "วงจรมี 3 สถานะ: **`closed`** (ปกติ ปล่อยคำขอผ่านและนับความล้มเหลวต่อเนื่อง), **`open`** (เมื่อพังต่อเนื่องถึง `failure_threshold` ให้ตัดวงจรโยน `CircuitOpenError` ทันทีแบบ {{fail-fast}} โดยไม่ยิงปลายทางจนกว่าจะครบ `recovery_timeout`) และ **`half_open`** (ครบเวลาพักแล้ว ปล่อยคำขอทดสอบ 1 ตัว ถ้าผ่าน → ปิดวงจรกลับ `closed`, ถ้าพัง → เปิดวงจรกลับ `open` ต่อ)",
      ],
      analogy:
        "เหมือนสะพานไฟในบ้าน: ไฟปกติจ่ายไฟผ่าน (`closed`), พอไฟลัดวงจรหลายครั้งสวิตช์ดีดตัดทันทีเพื่อกันไฟไหม้ (`open`), พักตรวจเช็กแล้วลองยกสวิตช์ทดสอบ 1 ครั้ง (`half_open`) ถ้าไฟนิ่งก็ใช้งานต่อได้ ถ้าช็อตอีกก็ตัดทันที",
      code: {
        language: "python",
        filename: "circuit_breaker.py",
        code: `from collections.abc import Callable
import time
from typing import Literal

BreakerState = Literal["closed", "open", "half_open"]


class CircuitOpenError(Exception):
    """เบรกเกอร์กำลังเปิดอยู่ — fail fast เพื่อไม่ซ้ำเติมปลายทาง"""


class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 3,
        recovery_timeout: float = 30.0,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self._clock = clock
        self._state: BreakerState = "closed"
        self._failures = 0
        self._opened_at: float | None = None

    @property
    def state(self) -> BreakerState:
        if (
            self._state == "open"
            and self._opened_at is not None
            and (self._clock() - self._opened_at) >= self.recovery_timeout
        ):
            self._state = "half_open"
        return self._state

    def before_call(self) -> None:
        if self.state == "open":
            raise CircuitOpenError("Circuit breaker is OPEN; failing fast")

    def record_success(self) -> None:
        self._failures = 0
        self._opened_at = None
        self._state = "closed"

    def record_failure(self) -> None:
        if self._state == "half_open":
            self._state = "open"
            self._opened_at = self._clock()
            return
        self._failures += 1
        if self._failures >= self.failure_threshold:
            self._state = "open"
            self._opened_at = self._clock()`,
        caption: "State machine ของ Circuit Breaker ที่อ่านง่าย ไม่มี external dependency และเลื่อนเวลาจำลองได้ด้วย `clock`",
      },
      whyTitle: "Why this matters — อย่าให้ 400 Bad Request ไปทริป Circuit Breaker",
      whyParagraphs: [
        "รายละเอียดสำคัญมากในงานจริง: Circuit Breaker วัด **สุขภาพของบริการปลายทาง** ไม่ใช่วัดความถูกต้องของข้อมูลผู้ใช้ หากผู้ใช้กรอกฟอร์มผิดจน API คืน `400 Bad Request` 3 ครั้งติดกัน นั่นแปลว่าเซิร์ฟเวอร์ยังทำงานดีอยู่ — ห้ามเรียก `record_failure()` ให้เบรกเกอร์ตัดวงจรทั้งระบบ!",
        "เรียก `record_failure()` เฉพาะเมื่อเจอ `TransientAPIError` (5xx, 429, timeout, network error) เท่านั้น",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบกับ Backend Resilience ในโลก Node.js / Microservices",
      body: [
        "ทั้ง 3 รูปแบบนี้คือตำราสากลของ Distributed Systems (Release It! / Stripe API Design) ที่ใช้เหมือนกันทุกภาษา:",
      ],
      table: [
        ["`MinIntervalRateLimiter`", "`bottleneck` / `p-limit` + token bucket"],
        ["`headers={'Idempotency-Key': key}` นอกลูป retry", "Stripe `idempotencyKey` option ใน `POST /charges`"],
        ["`CircuitBreaker` (`closed`/`open`/`half_open`)", "`opossum` / `cockatiel` circuit breaker ใน Node.js"],
        ["`clock=time.monotonic`", "ฉีด `Date.now` / `vi.useFakeTimers()` ใน Vitest/Jest"],
      ],
    },
    student: {
      title: "First-Year Note — แยกให้ออกว่า 3 เครื่องมือนี้แก้ปัญหาคนละชั้นกัน",
      body: [
        "มือใหม่มักสับสนว่ามี Retry แล้วทำไมยังต้องมี Rate Limiter และ Circuit Breaker — จำง่าย ๆ ตามช่วงเวลาที่เกิดปัญหา:",
        "1) **Rate Pacing** = ป้องกัน **ก่อน** ยิง (ไม่ยิงถี่เกินโควตา), 2) **Retry + Idempotency-Key** = แก้ไข **เมื่อสะดุดชั่วคราว** โดยไม่สร้างข้อมูลเบิ้ล, 3) **Circuit Breaker** = ตัดจบเร็ว **เมื่อปลายทางล่มยาว** เพื่อคืน fallback และไม่ให้ระบบเราล่มตาม",
      ],
    },
  },

  workedExample: {
    intro:
      "มารวมทั้ง 3 ชั้น (Rate Pacing + `Idempotency-Key` + Circuit Breaker) เข้ากับ `httpx.MockTransport` และ `tenacity` เพื่อดูการทำงานครบวงจรตั้งแต่ปกติ → ทริปเบรกเกอร์ → พักฟื้น Half-Open → กลับมา Closed",
    steps: [
      {
        title: "1 · จำลองเซิร์ฟเวอร์ที่รองรับ `Idempotency-Key` (Deduplication)",
        explain:
          "เซิร์ฟเวอร์จำลองเก็บ `processed_keys` ไว้: ถ้ารอบแรก timeout หลังบันทึกข้อมูลแล้ว และรอบสองส่ง `Idempotency-Key` เดิมกลับมา จะคืนทิกเก็ตเดิมโดยไม่สร้างใบใหม่ซ้ำ",
        code: {
          language: "python",
          filename: "worked_d015.py",
          code: `import json
import httpx


class MockTicketServer:
    def __init__(self) -> None:
        self.created: list[dict] = []
        self.by_key: dict[str, dict] = {}
        self.fail_next_after_write = False
        self.force_503 = False

    def handle(self, request: httpx.Request) -> httpx.Response:
        if self.force_503:
            return httpx.Response(503, text="service unavailable")

        key = request.headers.get("Idempotency-Key")
        body = json.loads(request.content.decode("utf-8"))

        if key and key in self.by_key:
            return httpx.Response(200, json={**self.by_key[key], "deduplicated": True})

        record = {"id": f"SRV-{len(self.created) + 1}", "subject": body["subject"]}
        self.created.append(record)
        if key:
            self.by_key[key] = record

        if self.fail_next_after_write:
            self.fail_next_after_write = False
            raise httpx.ReadTimeout("Lost response after write!", request=request)

        return httpx.Response(201, json={**record, "deduplicated": False})`,
        },
        output: `# MockTicketServer พร้อมจำลอง timeout หลังเขียนสำเร็จ และ 503 outage`,
      },
      {
        title: "2 · ทดสอบ Retry พร้อม `Idempotency-Key` คงที่นอกลูป — ไม่สร้างทิกเก็ตซ้ำ!",
        explain:
          "แม้รอบแรกจะเกิด `ReadTimeout` หลังจากเซิร์ฟเวอร์บันทึกข้อมูลไปแล้ว แต่เพราะส่ง `Idempotency-Key` เดิมในรอบที่ 2 เซิร์ฟเวอร์จึงคืนรายการเดิม (`len(server.created) == 1`)",
        code: {
          language: "python",
          filename: "worked_d015.py",
          code: `import uuid
from tenacity import Retrying, retry_if_exception_type, stop_after_attempt


def create_ticket_idempotent(
    client: httpx.Client, subject: str, idempotency_key: str | None = None
) -> dict:
    # สร้าง key 1 ครั้ง "นอก" ลูป retry!
    key = idempotency_key or f"idem-{uuid.uuid4().hex[:8]}"

    for attempt in Retrying(
        retry=retry_if_exception_type(httpx.TimeoutException),
        stop=stop_after_attempt(3),
        sleep=lambda _: None,
        reraise=True,
    ):
        with attempt:
            resp = client.post(
                "/v1/tickets",
                json={"subject": subject},
                headers={"Idempotency-Key": key},
            )
            return resp.json()
    raise RuntimeError("Unreachable")


server = MockTicketServer()
server.fail_next_after_write = True

with httpx.Client(base_url="https://api.example.test", transport=httpx.MockTransport(server.handle)) as cli:
    result = create_ticket_idempotent(cli, "โอนเงินซ้ำขอคืนยอด")

print("Result:", result)
print("Total tickets created on server:", len(server.created))`,
        },
        output: `Result: {'id': 'SRV-1', 'subject': 'โอนเงินซ้ำขอคืนยอด', 'deduplicated': True}
Total tickets created on server: 1`,
      },
      {
        title: "3 · ดูวงจร Circuit Breaker ตัดวงจรตอนล่มยาว แล้วฟื้นตัวเมื่อครบเวลาพัก",
        explain:
          "จำลองนาฬิกาปลอม (`now = [0.0]`): หลังพัง 2 ครั้งติดกันเบรกเกอร์จะเปิด (`open`), คำขอที่ 3 fail fast ทันทีโดยไม่ยิงเซิร์ฟเวอร์, พอเลื่อนเวลาไป `+30s` เบรกเกอร์เข้า `half_open` และพอยิงผ่านก็กลับมา `closed`",
        code: {
          language: "python",
          filename: "worked_d015.py",
          code: `now = [0.0]


class SimpleBreaker:
    def __init__(self, threshold: int = 2, recovery_s: float = 30.0) -> None:
        self.threshold = threshold
        self.recovery_s = recovery_s
        self.failures = 0
        self.opened_at: float | None = None
        self.state = "closed"

    def check(self) -> None:
        if self.state == "open":
            if self.opened_at is not None and now[0] - self.opened_at >= self.recovery_s:
                self.state = "half_open"
            else:
                raise RuntimeError("CircuitOpenError: fail fast!")

    def on_success(self) -> None:
        self.failures = 0
        self.opened_at = None
        self.state = "closed"

    def on_failure(self) -> None:
        self.failures += 1
        if self.state == "half_open" or self.failures >= self.threshold:
            self.state = "open"
            self.opened_at = now[0]


cb = SimpleBreaker(threshold=2, recovery_s=30.0)
cb.on_failure()
cb.on_failure()
print("After 2 failures ->", cb.state)

try:
    cb.check()
except RuntimeError as e:
    print("Call 3 at t=5s ->", e)

now[0] = 35.0
cb.check()
print("At t=35s before probe ->", cb.state)
cb.on_success()
print("After successful probe ->", cb.state)`,
        },
        output: `After 2 failures -> open
Call 3 at t=5s -> CircuitOpenError: fail fast!
At t=35s before probe -> half_open
After successful probe -> closed`,
      },
    ],
    gotcha:
      "ข้อผิดพลาดอันดับหนึ่งของ `Idempotency-Key`: เขียน `headers={\"Idempotency-Key\": str(uuid.uuid4())}` ไว้ **ข้างใน** ฟังก์ชันที่ถูก `@retry` — ทำให้ทุกครั้งที่ retry มันสุ่ม key ใหม่หมดและสร้างข้อมูลซ้ำบนเซิร์ฟเวอร์เหมือนเดิมเป๊ะ!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `resilient_patterns.py` ที่รวม 3 องค์ประกอบเข้าด้วยกัน: `MinIntervalRateLimiter`, `CircuitBreaker` (Closed/Open/Half-Open) และฟังก์ชัน `submit_ticket_safely(...)` ที่แนบ `Idempotency-Key` นอกลูป retry และไม่ให้ 4xx ไปทริปเบรกเกอร์",
    requirements: [
      "สร้าง `MinIntervalRateLimiter(max_per_second, clock=time.monotonic, sleeper=time.sleep)` ที่มีเมธอด `acquire() -> float` คืนจำนวนวินาทีที่ต้องรอเพื่อไม่ให้ยิงถี่กว่า `1 / max_per_second`",
      "สร้าง `CircuitOpenError(Exception)`, `ClientAPIError(Exception)` (เก็บ `status_code`), `TransientAPIError(Exception)` (เก็บ `status_code=None`)",
      "สร้าง `CircuitBreaker(failure_threshold=3, recovery_timeout=30.0, clock=time.monotonic)` ที่มี property `state` (`\"closed\" | \"open\" | \"half_open\"`) และเมธอด `before_call()`, `record_success()`, `record_failure()` ครบทุก transition (รวมถึงถ้าพังขณะ `half_open` ต้องกลับเป็น `open` ทันที)",
      "สร้าง `submit_ticket_safely(client, payload, *, idempotency_key=None, limiter=None, breaker=None, max_attempts=3, sleep_fn=time.sleep) -> dict` ที่: (1) ตรวจ `breaker.before_call()` ก่อนเสมอ, (2) สร้าง `Idempotency-Key` 1 ครั้งนอกลูป retry แล้วส่งใน header ทุก attempt, (3) เรียก `limiter.acquire()` ก่อนยิงแต่ละ attempt",
      "เมื่อสำเร็จเรียก `breaker.record_success()`; เมื่อเจอ `TransientAPIError` ครบทุก attempt เรียก `breaker.record_failure()` แล้วโยนต่อ; เมื่อเจอ `ClientAPIError` (4xx ยกเว้น 408/429) ให้ fail fast ทันทีโดย **ไม่** เรียก `breaker.record_failure()`",
    ],
    starter: {
      language: "python",
      filename: "resilient_patterns.py",
      code: `from collections.abc import Callable
import time
from typing import Literal
import uuid
import httpx
from tenacity import Retrying, retry_if_exception_type, stop_after_attempt

BreakerState = Literal["closed", "open", "half_open"]


class CircuitOpenError(Exception):
    pass


class ClientAPIError(Exception):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(f"HTTP {status_code}: {message}")
        self.status_code = status_code


class TransientAPIError(Exception):
    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class MinIntervalRateLimiter:
    def __init__(
        self,
        max_per_second: float,
        clock: Callable[[], float] = time.monotonic,
        sleeper: Callable[[float], None] = time.sleep,
    ) -> None:
        # TODO: เก็บ interval, clock, sleeper และเวลาอนุญาตถัดไป
        raise NotImplementedError

    def acquire(self) -> float:
        # TODO: คำนวณเวลารอ เรียก sleeper เมื่อจำเป็น และคืนจำนวนวินาทีที่รอ
        raise NotImplementedError


class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 3,
        recovery_timeout: float = 30.0,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        # TODO: กำหนด state เริ่มต้น "closed" และตัวนับความล้มเหลว
        raise NotImplementedError

    @property
    def state(self) -> BreakerState:
        # TODO: เปลี่ยน open -> half_open อัตโนมัติเมื่อเวลาผ่าน >= recovery_timeout
        raise NotImplementedError

    def before_call(self) -> None:
        # TODO: โยน CircuitOpenError หาก state == "open"
        raise NotImplementedError

    def record_success(self) -> None:
        # TODO: รีเซ็ตตัวนับและตั้ง state = "closed"
        raise NotImplementedError

    def record_failure(self) -> None:
        # TODO: เพิ่มตัวนับ และเปิดวงจรเมื่อครบ threshold หรือพังใน half_open
        raise NotImplementedError


def submit_ticket_safely(
    client: httpx.Client,
    payload: dict,
    *,
    idempotency_key: str | None = None,
    limiter: MinIntervalRateLimiter | None = None,
    breaker: CircuitBreaker | None = None,
    max_attempts: int = 3,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> dict:
    # TODO: ตรวจ breaker -> สร้าง Idempotency-Key นอกลูป -> retry เฉพาะ TransientAPIError
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_resilient_patterns.py",
      code: `import httpx
import pytest
from resilient_patterns import (
    CircuitBreaker,
    CircuitOpenError,
    ClientAPIError,
    MinIntervalRateLimiter,
    TransientAPIError,
    submit_ticket_safely,
)


def test_rate_limiter_enforces_min_interval():
    now = [100.0]
    slept: list[float] = []

    def fake_sleep(sec: float) -> None:
        slept.append(sec)
        now[0] += sec

    limiter = MinIntervalRateLimiter(max_per_second=4.0, clock=lambda: now[0], sleeper=fake_sleep)
    assert limiter.acquire() == 0.0
    now[0] += 0.10  # ผ่านไปแค่ 0.10s จากช่วง 0.25s -> ต้องรออีก 0.15s
    waited = limiter.acquire()
    assert pytest.approx(waited, abs=1e-6) == 0.15
    assert len(slept) == 1


def test_idempotency_key_stays_identical_across_retries():
    seen_keys: list[str | None] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen_keys.append(request.headers.get("Idempotency-Key"))
        if len(seen_keys) < 3:
            return httpx.Response(503, text="try again")
        return httpx.Response(201, json={"created": True, "key": seen_keys[-1]})

    with httpx.Client(base_url="https://api.example.test", transport=httpx.MockTransport(handler)) as cli:
        res = submit_ticket_safely(cli, {"msg": "ขอคืนเงิน"}, max_attempts=3, sleep_fn=lambda _: None)

    assert res["created"] is True
    assert len(seen_keys) == 3
    assert seen_keys[0] is not None
    assert len(set(seen_keys)) == 1  # ต้องเป็น key เดียวกันทุก attempt!


def test_circuit_breaker_full_lifecycle_and_4xx_does_not_trip():
    now = [0.0]
    breaker = CircuitBreaker(failure_threshold=2, recovery_timeout=10.0, clock=lambda: now[0])
    server_mode = {"status": 400}
    http_calls = 0

    def handler(_req: httpx.Request) -> httpx.Response:
        nonlocal http_calls
        http_calls += 1
        if server_mode["status"] == 200:
            return httpx.Response(200, json={"ok": True})
        return httpx.Response(server_mode["status"], text="err")

    with httpx.Client(base_url="https://api.example.test", transport=httpx.MockTransport(handler)) as cli:
        # 1) 400 สองครั้งติด ต้องไม่ทริปเบรกเกอร์
        for _ in range(2):
            with pytest.raises(ClientAPIError):
                submit_ticket_safely(cli, {"msg": "bad"}, breaker=breaker, max_attempts=2, sleep_fn=lambda _: None)
        assert breaker.state == "closed"

        # 2) 503 สองครั้งติด -> ทริปเป็น open
        server_mode["status"] = 503
        for _ in range(2):
            with pytest.raises(TransientAPIError):
                submit_ticket_safely(cli, {"msg": "x"}, breaker=breaker, max_attempts=1, sleep_fn=lambda _: None)
        assert breaker.state == "open"

        # 3) ขณะ open ต้อง fail fast โดยไม่ยิง HTTP เลย
        calls_before = http_calls
        with pytest.raises(CircuitOpenError):
            submit_ticket_safely(cli, {"msg": "x"}, breaker=breaker, max_attempts=1, sleep_fn=lambda _: None)
        assert http_calls == calls_before

        # 4) เลื่อนเวลาเกิน recovery_timeout -> half_open -> พอยิงผ่านกลับมา closed
        now[0] = 12.0
        assert breaker.state == "half_open"
        server_mode["status"] = 200
        out = submit_ticket_safely(cli, {"msg": "ok"}, breaker=breaker, max_attempts=1, sleep_fn=lambda _: None)
        assert out == {"ok": True}
        assert breaker.state == "closed"
`,
    },
    selfCheck: [
      "`MinIntervalRateLimiter` คำนวณช่วงรอถูกต้องเมื่อเวลาเดินไปไม่ครบ `1 / max_per_second`",
      "`Idempotency-Key` ถูกสร้างเพียง 1 ครั้งนอกลูป retry และมีค่าเหมือนกันทุก attempt (`len(set(seen_keys)) == 1`)",
      "`400 Bad Request` ไม่ทำให้ `CircuitBreaker` ทริปเปิดวงจร",
      "เมื่อ `CircuitBreaker` อยู่ในสถานะ `open` คำขอถัดไปโยน `CircuitOpenError` ทันทีโดยจำนวน HTTP call ไม่เพิ่มขึ้น",
      "หลังผ่าน `recovery_timeout` เบรกเกอร์เข้าสู่ `half_open` และกลับเป็น `closed` เมื่อคำขอทดสอบสำเร็จ (รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด)",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 3 กรณีใน `test_resilient_patterns.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `submit_ticket_safely` เรียก `if breaker is not None: breaker.before_call()` เป็นบรรทัดแรก และสร้าง `key = idempotency_key or str(uuid.uuid4())` ไว้นอก `for attempt in Retrying(...)`",
      },
      {
        body: "ครอบลูป `Retrying` ด้วย `try / except TransientAPIError:` เพื่อให้เรียก `breaker.record_failure()` เพียง 1 ครั้งเมื่อ retry ครบแล้วยังพัง (ส่วน `ClientAPIError` ให้ปล่อยผ่านออกไปโดยไม่เรียก `record_failure()`)",
      },
      {
        body: "โครงสร้างหลักของ `submit_ticket_safely` — เหลือเติมการแยก status code 2xx / 408,429,>=500 / 4xx ด้านใน",
        code: {
          language: "python",
          filename: "hint-d015-l3.py",
          code: `def submit_ticket_safely(
    client: httpx.Client,
    payload: dict,
    *,
    idempotency_key: str | None = None,
    limiter: MinIntervalRateLimiter | None = None,
    breaker: CircuitBreaker | None = None,
    max_attempts: int = 3,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> dict:
    if breaker is not None:
        breaker.before_call()

    key = idempotency_key or f"idem-{uuid.uuid4().hex}"
    retrying = Retrying(
        retry=retry_if_exception_type(TransientAPIError),
        stop=stop_after_attempt(max_attempts),
        sleep=sleep_fn,
        reraise=True,
    )
    try:
        for attempt in retrying:
            with attempt:
                if limiter is not None:
                    limiter.acquire()
                resp = client.post(
                    "/v1/tickets",
                    json=payload,
                    headers={"Idempotency-Key": key},
                )
                # TODO: แยก 2xx -> คืน json, 408/429/>=500 -> TransientAPIError, อื่น ๆ -> ClientAPIError
                raise NotImplementedError
    except TransientAPIError:
        if breaker is not None:
            breaker.record_failure()
        raise`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "ทุกเคสใช้ fake clock และ fake sleeper จึงทดสอบช่วง recovery 10 วินาทีจบได้ในไม่กี่มิลลิวินาที",
    },
  },

  mistakes: [
    {
      title: "สร้าง `Idempotency-Key` ใหม่ข้างในลูป retry",
      symptom: "เมื่อคำขอแรก timeout หลังเซิร์ฟเวอร์เขียนเสร็จ รอบ retry ส่ง key ใหม่ไปจนเกิดทิกเก็ตหรือรายการตัดเงินซ้ำ 2 รายการ",
      fix: "สร้าง `Idempotency-Key` 1 ครั้ง **ก่อน** เข้าลูป retry แล้วส่ง header เดิมซ้ำในทุก attempt",
    },
    {
      title: "ปล่อยให้ 400/401/403 ไปเพิ่มตัวนับความล้มเหลวของ Circuit Breaker",
      symptom: "แค่ผู้ใช้ 3 คนส่งฟอร์มผิดติดกัน เบรกเกอร์กลับตัดวงจรทั้งระบบจนผู้ใช้คนอื่นที่ส่งข้อมูลถูกต้องใช้งานไม่ได้ไปด้วย",
      fix: "เรียก `breaker.record_failure()` เฉพาะเมื่อเกิดความล้มเหลวฝั่งปลายทาง/เครือข่าย (`TransientAPIError`) เท่านั้น",
    },
    {
      title: "ใช้ `time.time()` แทน `time.monotonic()` ในการจับเวลา Rate Limiter / Circuit Breaker",
      symptom: "เมื่อระบบปรับเวลาเครื่อง (NTP clock drift) นาฬิกาอาจถอยหลัง ทำให้เบรกเกอร์ค้างเปิดนานกว่าที่กำหนดหรือคำนวณเวลารอติดลบ",
      fix: "ใช้ `time.monotonic()` เสมอสำหรับการวัดระยะเวลาที่ผ่านไป (elapsed duration)",
    },
    {
      title: "ไม่รีเซ็ตตัวนับความล้มเหลวเมื่อมีคำขอสำเร็จในสถานะ `closed`",
      symptom: "ความล้มเหลวกระจัดกระจาย 3 ครั้งตลอดทั้งวันถูกสะสมจนเปิดเบรกเกอร์ ทั้งที่บริการปลายทางไม่ได้ล่มต่อเนื่อง",
      fix: "เรียก `record_success()` เพื่อรีเซ็ต `self._failures = 0` เมื่อคำขอทำงานสำเร็จ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อตรวจความเข้าใจเรื่อง Rate Pacing, Idempotency Key และ Circuit Breaker",
    questions: [
      mc(
        "d015-q1",
        "เหตุใดจึงต้องสร้าง `Idempotency-Key` **นอกลูป retry** แทนการสร้างใหม่ในแต่ละรอบการยิง?",
        [
          ["เพื่อประหยัดเวลา CPU ของ `uuid.uuid4()`", "เหตุผลหลักไม่ใช่ความเร็ว CPU แต่คือความถูกต้องของข้อมูลบนเซิร์ฟเวอร์"],
          ["เพื่อให้ทุกรอบ retry ส่ง key เดิม เซิร์ฟเวอร์จะได้รู้ว่าเป็นคำขอเดียวกันและไม่สร้างรายการ/ตัดเงินซ้ำ", "ถูก — หากสร้าง key ใหม่ในทุกรอบ เซิร์ฟเวอร์จะมองว่าเป็นคำขอคนละรายการและทำซ้ำ"],
          ["เพราะ `httpx` ไม่อนุญาตให้เปลี่ยน header ระหว่างรอบ", "`httpx` เปลี่ยน header ได้ แต่การเปลี่ยน key จะทำลายคุณสมบัติ idempotency"],
          ["เพราะ `Idempotency-Key` ใช้ได้เฉพาะกับคำขอ `GET`", "`GET` idempotent อยู่แล้ว — `Idempotency-Key` สำคัญที่สุดสำหรับ `POST`/write operations"],
        ],
        "B",
        "หัวใจของ `Idempotency-Key` คือทุก attempt ของงานเดียวกันต้องพกบัตรประจำตัวใบเดียวกัน เพื่อให้ปลายทาง deduplicate ได้เมื่อเกิด timeout หลังบันทึกสำเร็จ",
        "ควรสร้าง `Idempotency-Key` ไว้ที่ตำแหน่งไหนเทียบกับลูป retry และเพราะอะไร?",
        "สร้าง 1 ครั้งนอกลูป retry เพื่อให้ทุกรอบส่ง key เดิม เซิร์ฟเวอร์จะได้ไม่สร้างรายการหรือตัดเงินซ้ำ",
      ),
      mc(
        "d015-q2",
        "ใน State Machine ของ {{circuit-breaker}} สถานะ **`Half-Open`** มีหน้าที่อะไร?",
        [
          ["บล็อกคำขอทั้งหมดตลอดไปจนกว่าวิศวกรจะรีสตาร์ตเซิร์ฟเวอร์", "นั่นคือการปิดตาย ไม่ใช่ Half-Open"],
          ["หลังครบ `recovery_timeout` จะยอมปล่อยคำขอทดสอบผ่านไปเช็กว่าปลายทางฟื้นหรือยัง ถ้าผ่านจะกลับเป็น `Closed` ถ้าพังจะกลับเป็น `Open`", "ถูก — Half-Open คือกลไกทดสอบการฟื้นตัวอัตโนมัติโดยไม่ปล่อยทราฟฟิกทั้งหมดพุ่งเข้าใส่ปลายทางทันที"],
          ["ยอมให้ยิงซ้ำได้ครึ่งหนึ่งของจำนวน retry ปกติ", "ไม่เกี่ยวกับจำนวนรอบ retry"],
          ["ข้ามการตรวจ `400 Bad Request` ชั่วคราว", "400 ยังต้อง fail fast ตามปกติทุกสถานะ"],
        ],
        "B",
        "`Half-Open` ทำให้ระบบฟื้นตัวได้เอง (self-healing) อย่างปลอดภัย: ทดสอบปลายทางด้วยคำขอเล็กน้อยก่อนเปิดรับทราฟฟิกเต็มรูปแบบอีกครั้ง",
        "อธิบายลำดับสถานะของ Circuit Breaker (`Closed`, `Open`, `Half-Open`) แบบสั้น ๆ",
        "`Closed` (ปกติ) → พังครบ threshold → `Open` (fail fast ไม่ยิงปลายทาง) → ครบ `recovery_timeout` → `Half-Open` (ลองยิงทดสอบ: ผ่านกลับ `Closed`, พังกลับ `Open`)",
      ),
      mc(
        "d015-q3",
        "หากผู้ใช้ส่ง payload ผิดรูปแบบจน API คืน `400 Bad Request` ติดกัน 5 ครั้ง Circuit Breaker ควรเปลี่ยนสถานะเป็น `Open` หรือไม่?",
        [
          ["ควรเปิดวงจรทันที เพราะมี HTTP error 5 ครั้งติดกัน", "ผิด — เซิร์ฟเวอร์ปลายทางยังสุขภาพดี 100% แค่ข้อมูลผู้ใช้ไม่ผ่าน validation"],
          ["ไม่ควร — ควรนับเฉพาะความล้มเหลวของบริการปลายทาง (`5xx`, `429`, timeout, network error) เท่านั้น", "ถูก — มิฉะนั้นผู้ใช้เพียงคนเดียวที่ส่งข้อมูลผิดซ้ำ ๆ จะทำให้ระบบล่มกระทบผู้ใช้ทุกคน"],
          ["ควรเปลี่ยนเป็น `Half-Open` แทน", "ไม่ควรเปลี่ยนสถานะเบรกเกอร์จาก 400 เลย"],
          ["ควรสั่ง retry 400 ก่อนแล้วค่อยเปิดวงจร", "ห้าม retry 400 และห้ามนำ 400 ไปทริปเบรกเกอร์"],
        ],
        "B",
        "Circuit Breaker ป้องกัน cascading failure จากความล่มของปลายทาง จึงต้องแยก `ClientAPIError` (ปัญหาฝั่งอินพุต) ออกจาก `TransientAPIError` (ปัญหาปลายทาง) เสมอ",
        "ทำไม `400 Bad Request` จึงไม่ควรไปทริป Circuit Breaker?",
        "เพราะ 400 แปลว่าเซิร์ฟเวอร์ปลายทางยังทำงานปกติ แค่ข้อมูลผู้เรียกผิด หากให้นับรวมจะทำให้บั๊กจากผู้ใช้คนเดียวไปตัดวงจรผู้ใช้ทั้งระบบ",
      ),
      mc(
        "d015-q4",
        "ทำไมโค้ดจับเวลาใน `MinIntervalRateLimiter` และ `CircuitBreaker` จึงควรใช้ `time.monotonic()` แทน `time.time()`?",
        [
          ["เพราะ `time.monotonic()` คืนเวลาเป็นโซนเวลาประเทศไทย (UTC+7)", "`time.monotonic()` ไม่ได้คืนเวลาปฏิทิน แต่คืนค่าตัวนับวินาทีแบบเดินหน้าอย่างเดียว"],
          ["เพราะ `time.monotonic()` เดินหน้าอย่างเดียว ไม่ถอยหลังหรือกระโดดเมื่อระบบปฏิบัติการซิงก์นาฬิกา (NTP)", "ถูก — ปลอดภัยต่อการคำนวณ elapsed duration (`now - opened_at`) เสมอ"],
          ["เพราะ `time.time()` ใช้ไม่ได้ใน Python 3.12", "`time.time()` ยังใช้ได้สำหรับ wall-clock timestamp เช่น logging แต่ไม่เหมาะกับการจับช่วงเวลา"],
          ["เพราะ `time.monotonic()` ไม่ต้อง `import time`", "ทั้งคู่อยู่ในโมดูลมาตรฐาน `time`"],
        ],
        "B",
        "กฎมาตรฐานของ Python: ใช้ `time.time()` / `datetime.now(UTC)` สำหรับเวลาปฏิทิน และใช้ `time.monotonic()` หรือ `time.perf_counter()` สำหรับวัดระยะเวลาที่ผ่านไป",
        "ควรใช้ `time.monotonic()` แทน `time.time()` เมื่อไร?",
        "เมื่อวัดระยะเวลาที่ผ่านไป (timeout, rate limiter, circuit breaker recovery) เพราะเดินหน้าอย่างเดียวไม่กระโดดถอยหลังเมื่อซิงก์นาฬิกา",
      ),
    ],
  },

  takeaways: [
    "ใช้ Client-side Rate Pacing (`MinIntervalRateLimiter`) คุมจังหวะการยิงตั้งแต่ต้นทางด้วย `time.monotonic()` เพื่อลดโอกาสชน `429`",
    "งาน `POST`/write ที่มีการ retry ต้องแนบ **`Idempotency-Key` ที่สร้าง 1 ครั้งนอกลูป retry** เสมอ เพื่อกันสร้างทิกเก็ตหรือตัดเงินซ้ำ",
    "{{circuit-breaker}} (`Closed → Open → Half-Open`) ช่วยตัดวงจรให้ fail fast คืน fallback เมื่อปลายทางล่มต่อเนื่อง และทดสอบฟื้นตัวอัตโนมัติเมื่อครบ `recovery_timeout`",
    "นับเฉพาะ `TransientAPIError` เข้า Circuit Breaker — ห้ามปล่อยให้ `400/401/403` จากผู้เรียกไปตัดวงจรทั้งระบบ",
  ],

  reviewCards: [
    rc(
      "d015-rc-1",
      "ต่างกันอย่างไรระหว่าง Retry (Day 14), Rate Pacing และ Circuit Breaker (Day 15)?",
      "Rate Pacing ชะลอจังหวะก่อนยิงกันชน 429; Retry รับมืออาการสะดุดสั้น ๆ ชั่วคราว; Circuit Breaker ตัดวงจร fail fast เมื่อปลายทางล่มต่อเนื่อง",
    ),
    rc(
      "d015-rc-2",
      "ทำไมการสร้าง `Idempotency-Key` ข้างในฟังก์ชันที่ถูก `@retry` จึงเป็นบั๊กร้ายแรง?",
      "เพราะทุกรอบ retry จะได้ key ใหม่ไม่ซ้ำกัน เซิร์ฟเวอร์จึงมองเป็นคนละคำขอและสร้างรายการ/ตัดเงินซ้ำ — ต้องสร้าง key นอกลูป retry",
    ),
    rc(
      "d015-rc-3",
      "ใน Circuit Breaker ถ้าคำขอทดสอบในสถานะ `Half-Open` ล้มเหลว จะเกิดอะไรขึ้นต่อ?",
      "สถานะจะกลับเป็น `Open` ทันทีและเริ่มนับ `recovery_timeout` รอบใหม่เพื่อพักปลายทางต่อ",
    ),
  ],

  sources: [
    { label: "Martin Fowler — CircuitBreaker Pattern", href: "https://martinfowler.com/bliki/CircuitBreaker.html" },
    { label: "Stripe Docs — Designing Robust and Predictable APIs with Idempotency", href: "https://stripe.com/blog/idempotency" },
    { label: "Python Official Docs — time.monotonic()", href: "https://docs.python.org/3/library/time.html#time.monotonic" },
    { label: "HTTPX Documentation — Custom Headers & Client Usage", href: "https://www.python-httpx.org/quickstart/#custom-headers" },
  ],

  glossary: [
    "rate-limit",
    "idempotency",
    "circuit-breaker",
    "fail-fast",
    "httpx",
    "exponential-backoff",
    "custom-exception",
    "mocking",
  ],
});
