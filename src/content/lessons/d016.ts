import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D016 — Phase 1 / Block B04 (Review Day)
 * Interleaved recall of D13–D15 + D6/D10; Debug flaky mock API client under rate limits.
 */
export const d016: Lesson = defineLesson({
  day: 16,
  titleTh: "ทบทวน B04: ไล่ล่าและแก้บั๊ก Flaky API Client ภายใต้ Rate Limit & Timeout",
  tagline: "30 นาที · รอบทบทวน D13–D15 + D6/D10 · ดีบัก 5 บั๊กยอดฮิตบน MockTransport ให้ทนทานครบทั้ง timeout, jitter, idempotency และ circuit breaker",
  icon: "shield-check",
  visual: {
    id: "retry-backoff",
    title: "ทบทวน B04: แก้บั๊ก Flaky Mock API Client ภายใต้ 429 & Timeout",
    caption: "ไล่เช็กอาการยอดฮิต: ลืม timeout, retry ใส่ 400, และไม่มี jitter จนทุกเครื่องยิงชนกัน",
    alt: "แผนภาพการดีบัก API client ภายใต้ rate limit",
  },
  requiresApiKey: false,
  tools: ["httpx", "tenacity", "structlog", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ทบทวนชั้นเชื่อมต่อเครือข่ายให้พร้อมก่อนก้าวสู่ `asyncio`",
      body: "ตั้งแต่พรุ่งนี้ (Block B05) คุณจะเริ่มยิงคำขอหลายสิบเส้นพร้อมกันด้วย `asyncio` หากชั้น HTTP client พื้นฐานยังมีบั๊กลืม timeout หรือ retry ผิดประเภท ความเสียหายจะทวีคูณเป็น 10 เท่าเมื่อรันพร้อมกัน",
      lessonNote: "วันนี้เราทบทวนครบทั้ง D13 (`httpx` + timeout), D14 (`tenacity` + backoff/jitter) และ D15 (`Idempotency-Key` + {{circuit-breaker}})",
    },
    {
      node: 3,
      heading: "เปลี่ยนอาการ \"Flaky\" ให้กลายเป็นเคสทดสอบเชิงกำหนด",
      body: "บั๊กเครือข่ายมักถูกเรียกว่า \"flaky\" (เดี๋ยวผ่านเดี๋ยวพัง) เพราะทีมทดสอบกับเซิร์ฟเวอร์จริงโดยไม่คุมตัวแปร",
      lessonNote: "เราเชื่อมความรู้ Day 10 ({{mocking}} + {{parametrize}}) เข้ากับ `httpx.MockTransport` และ fake clock/sleeper เพื่อจำลองทุกอาการเสียแบบ 100% ทำซ้ำได้",
    },
    {
      node: 4,
      heading: "ตรวจสอบ Resilience Checklist ก่อนนำ Client ขึ้นใช้งานจริง",
      body: "API client ที่ผ่านแค่ happy path `200 OK` ไม่เพียงพอสำหรับแอป AI ที่ต้องเจอ 429, timeout และ outage เป็นเรื่องปกติ",
      lessonNote: "คุณจะได้ลงมือซ่อม `flaky_client.py` ที่มีบั๊กซ่อนอยู่ 5 จุดจริง ๆ จนผ่านชุดเทสต์ครบทุกสถานการณ์",
    },
    {
      node: 5,
      heading: "อ่าน Structured Logs และ Exception Hierarchy เพื่อวินิจฉัยต้นตอ",
      body: "เวลา API client ทำงานผิดพลาดใน production สิ่งแรกที่วิศวกรเปิดดูคือ log ของรอบ retry และชนิดของ exception ที่ถูกโยนออกมา",
      lessonNote: "ทบทวน Day 6 ({{custom-exception}} + {{structlog}}) ควบคู่กับการตรวจ `before_sleep` และสถานะของ Circuit Breaker",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบ Interleaved Recall** จาก D13–D15 และเชื่อมโยงกับ D6 (`custom-exception`, `structlog`) และ D10 (`mocking`, `parametrize`)",
    "**วินิจฉัย 5 บั๊กคลาสสิก** ของ Flaky HTTP Client: ลืมตั้ง timeout, เผลอ retry ใส่ 400/401, สร้าง `Idempotency-Key` ใหม่ในลูป retry, ใช้ fixed sleep ไม่มี jitter/ไม่เคารพ `Retry-After`, และไม่มี Circuit Breaker ป้องกัน outage",
    "**แก้ไขและยืนยัน** ให้ `flaky_client.py` ผ่านชุด `pytest` ออฟไลน์บน `httpx.MockTransport` ครบทุกกรณีพร้อมบันทึก structured log ทุกรอบ retry",
  ],

  prerequisites: [
    "เคยผ่านหรือทบทวน D13 (`httpx`), D14 (`tenacity`), D15 (Rate Pacing, Idempotency, Circuit Breaker) รวมถึง D6 และ D10",
    "มีโปรเจกต์ `uv` ที่ติดตั้ง `httpx`, `tenacity`, `structlog`, `pytest`, `ruff` แล้ว",
    "ไม่ต้องใช้ API key — ฝึกดีบักออฟไลน์บนเครื่อง 100%",
  ],

  setup: {
    intro:
      "ตั้งโฟลเดอร์สำหรับรอบทบทวน Day 16 ด้วย `uv` (หรือต่อในโปรเจกต์ Block B04 เดิม) โดยให้มี `httpx`, `tenacity`, `structlog`, `pytest` และ `ruff` ครบชุด",
    commands: `uv init ai-day16-review && cd ai-day16-review
uv add httpx tenacity structlog
uv add --dev pytest ruff

uv run python -c "import httpx, tenacity, structlog; print('Day 16 Debug Lab Ready')"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์โปรเจกต์สำหรับรอบทบทวน Day 16"],
      ["deps", "ติดตั้ง `httpx`, `tenacity`, `structlog` และ dev tools (`pytest`, `ruff`)"],
      ["verify", "เช็ก import แพ็กเกจหลักทั้งหมดผ่าน `uv run python` สำเร็จ"],
    ],
    note: "จังหวะ 30 นาทีของวันทบทวน: ทำ Interleaved Quiz ก่อน 10 นาที → ลงมือไล่แก้บั๊ก 5 จุดใน `flaky_client.py` 15 นาที → จดข้อที่พลาดเข้า Error Log 5 นาที",
  },

  concepts: [
    {
      id: "resilient-client-checklist",
      title: "1 · เช็กลิสต์ 5 ข้อของ Production HTTP Client (รวมร่าง D13–D15)",
      paragraphs: [
        "ก่อนจะนำ HTTP client ตัวใดไปเรียก LLM หรือบริการภายนอกในงานจริง วิศวกร AI จะไล่ตรวจ 5 ชั้นป้องกันเสมอเหมือนนักบินตรวจเช็กลิสต์ก่อนขึ้นบิน หากขาดไปแม้แต่ข้อเดียวระบบมักดูปกติในเครื่องพัฒนาแต่พังทันทีเมื่อเจอทราฟฟิกจริง",
        "สังเกตว่าทั้ง 5 ชั้นไม่ได้ทำงานแยกกัน แต่ต่อกันเป็นเกราะป้องกันทีละด่าน: **Circuit Breaker (ด่านนอก) → Idempotency-Key (สร้างนอกลูป) → Tenacity Retry + Backoff/Jitter (ด่านกลาง) → Granular Timeout + Status Classifier (ด่านใน) → Structlog (สังเกตการณ์)**",
      ],
      analogy:
        "เหมือนระบบความปลอดภัยรถยนต์: ป้ายจำกัดความเร็ว (Rate Pacing), เข็มขัดนิรภัยที่รั้งครั้งเดียวไม่รัดซ้ำ (Idempotency), เบรก ABS ที่ผ่อนจังหวะไม่ให้ล้อล็อก (Backoff + Jitter) และถุงลมนิรภัยเมื่อชนหนัก (Circuit Breaker)",
      bullets: [
        "**D13 (Timeout & Pooling)** — ใช้ `httpx.Client` พร้อม `httpx.Timeout(connect=..., read=..., write=..., pool=...)` และแยก `ClientAPIError` vs `TransientAPIError`",
        "**D14 (Selective Retry + Jitter)** — Retry เฉพาะ `TransientAPIError` ด้วย `wait_exponential_jitter`, เคารพ `Retry-After` (มีเพดาน `max_wait`), และใส่ `reraise=True`",
        "**D15 (Idempotency & Breaker)** — สร้าง `Idempotency-Key` นอกลูป retry และป้องกัน outage ด้วย `CircuitBreaker` ที่ไม่ทริปเพราะ 4xx",
        "**D6 + D10 (Observability & Testing)** — Log ทุกรอบ retry ด้วย `structlog` และทดสอบทุกเคสออฟไลน์ด้วย `MockTransport` + `parametrize`",
      ],
      whyTitle: "Why this matters — แก้บั๊กเป็นคือทักษะที่แยก Junior ออกจาก Mid/Senior",
      whyParagraphs: [
        "ในงานจริงคุณไม่ได้เขียนโค้ดใหม่จากศูนย์ทุกวัน แต่กว่าครึ่งหนึ่งของเวลาคือการเข้าไปอ่านโค้ด API client เดิมที่เริ่ม \"flaky\" ใต้โหลดสูงแล้วหาให้เจอว่าพลาดชั้นไหน",
        "การฝึกดีบักวันนี้จะทำให้คุณมองเห็น antipattern 5 แบบนี้ได้ทันทีภายใน 10 วินาทีตอนทำ Code Review",
      ],
    },
    {
      id: "anatomy-of-flaky-bugs",
      title: "2 · ผ่าตัด 5 อาการเสียยอดฮิตของ Flaky API Client",
      paragraphs: [
        "อาการพังที่พบบ่อยที่สุดในโลกจริงมักซ่อนอยู่ในบรรทัดสั้น ๆ ที่ดูเหมือนไม่มีพิษภัย เช่น `httpx.Client(timeout=None)` ที่ทำให้ worker ค้างเงียบ หรือ `@retry(retry=retry_if_exception_type(Exception))` ที่เผลอ retry ใส่ `400 Bad Request` จนกินโควตาและหน่วงผู้ใช้",
        "อีกสองบั๊กที่แสบมากเพราะมองไม่เห็นตอนเทสต์ happy path คือการสุ่ม `Idempotency-Key` ไว้ **ข้างใน** ลูป retry (สร้างรายการซ้ำตอน timeout) และการตั้ง `wait_fixed(0.1)` แทน `wait_exponential_jitter` (ยิงซ้ำรัวเกินไปและเกิด Thundering Herd)",
      ],
      analogy:
        "เหมือนท่อน้ำรั่ว 5 จุดในบ้าน — ถ้าอุดแค่จุดเดียว (เช่น ใส่ retry) แต่มิเตอร์ยังหมุนฟรีเพราะไม่แยก 400 กับ 503 ค่าน้ำก็ยังบานปลายอยู่ดี ต้องตรวจไล่ครบทุกข้อต่อ",
      code: {
        language: "python",
        filename: "bug_patterns_comparison.py",
        code: `# ❌ BEFORE (รวม 4 บั๊กยอดฮิตใน 6 บรรทัด)
# client = httpx.Client(timeout=None)                     # บั๊ก 1: ค้างตลอดกาล
# for _ in range(5):
#     headers = {"Idempotency-Key": str(uuid.uuid4())}    # บั๊ก 2: เปลี่ยน key ทุกรอบ!
#     resp = client.post(url, json=data, headers=headers)
#     if resp.status_code != 200:                         # บั๊ก 3: retry แม้กระทั่ง 400/401!
#         time.sleep(0.1)                                 # บั๊ก 4: fixed wait ไม่มี backoff/jitter

# ✅ AFTER (แยกชั้นชัดเจน ทดสอบได้)
# 1) timeout = httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)
# 2) key = idempotency_key or f"idem-{uuid.uuid4().hex}"  # สร้าง 1 ครั้งนอกลูป
# 3) Retrying(retry=retry_if_exception_type(TransientAPIError), wait=..., reraise=True)
# 4) CircuitBreaker ครอบข้างนอก (นับเฉพาะ TransientAPIError)`,
        caption: "เทียบโค้ดแบบเร่งรีบที่เต็มไปด้วยบั๊กแฝง กับโครงสร้างที่แยกความรับผิดชอบครบทุกชั้น",
      },
      whyTitle: "Why this matters — เตรียมความพร้อมสู่ Phase 1 Capstone (Day 29–32)",
      whyParagraphs: [
        "ในโปรเจกต์จบ Phase 1 (Resilient Async Data Fetcher CLI) คุณต้องนำทุกชิ้นส่วนจาก B01–B07 มาร้อยต่อกัน โค้ดที่คุณซ่อมจนสะอาดในวันนี้คือแม่แบบโดยตรงของชั้น HTTP Resilience ในโปรเจกต์นั้น",
        "ยิ่งไปกว่านั้น เมื่อย้ายไปใช้ `httpx.AsyncClient` ใน Block B05 แพตเทิร์นการแยก status code, retry ด้วย jitter และ circuit breaker ทั้งหมดจะถูกนำไปใช้ต่อได้ทันทีโดยไม่ต้องเริ่มใหม่",
      ],
    },
    {
      id: "deterministic-debugging-tests",
      title: "3 · วิธีเขียน Test จับ Flaky Bug แบบ 100% Deterministic (เชื่อม D10 + D13–D15)",
      paragraphs: [
        "วิธีดีบักที่ดีที่สุดไม่ใช่การนั่งจ้องโค้ดแล้วเดา แต่คือการเขียน **regression test** ให้แต่ละบั๊กแดงก่อน (Red) แล้วค่อยซ่อมโค้ดจนเขียว (Green)",
        "ด้วย `httpx.MockTransport`, `@pytest.mark.parametrize` (Day 10), fake `sleep_fn` (Day 14) และ fake `clock` (Day 15) คุณสามารถพิสูจน์ได้ครบทุกเงื่อนไข — ตั้งแต่เช็กว่า 400/401/403 ยิงแค่ 1 ครั้ง, `Idempotency-Key` เหมือนเดิมทุกรอบ, `Retry-After` ถูกเคารพ ไปจนถึง Circuit Breaker ตัดวงจรจริงโดยไม่ยิง HTTP",
      ],
      analogy:
        "เหมือนช่างซ่อมเครื่องยนต์ที่ใช้เครื่องวินิจฉัยจำลองรอบเครื่องบนแท่นทดสอบ แทนการขับออกไปลุ้นบนทางด่วนตอนฝนตก",
      whyTitle: "Why this matters — ทุกบั๊กที่เคยเจอต้องกลายเป็นเทสต์ถาวร",
      whyParagraphs: [
        "ในทีมวิศวกรรม AI เมื่อแก้บั๊ก production เช่น \"เผลอ retry 400\" หรือ \"ลืมส่ง Idempotency-Key เดิม\" เสร็จ เราจะเก็บเทสต์นั้นไว้ใน CI ตลอดไป เพื่อรับประกันว่าไม่มีใครเผลอทำบั๊กเดิมกลับมาอีกในอนาคต",
        "ชุดเทสต์ที่ใช้ `MockTransport` และ fake clock/sleeper ยังรันได้เร็วระดับมิลลิวินาที ทำให้ทีมรันเช็กก่อนทุก commit ได้โดยไม่เสียเวลา",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — มุมมอง Debug API Client ของ Backend / Full-Stack Dev",
      body: [
        "ตารางอาการที่ทีมเว็บเจอบ่อยเวลาดีบักปัญหา production กับวิธีซ่อมฝั่ง Python (`httpx` + `tenacity`):",
      ],
      table: [
        ["API ค้างจน worker ตายหมด", "ตรวจ `client.timeout` — ห้ามเป็น `None` ต้องตั้ง granular timeout"],
        ["Log เห็น 400/401 พุ่งเป็น 4 เท่าของ traffic จริง", "เช็ก `retry_if_exception_type` — หลง retry 4xx อยู่หรือไม่"],
        ["ลูกค้าบ่นว่าได้ทิกเก็ตหรือออเดอร์เบิ้ล 2 ใบ", "ตรวจตำแหน่งสร้าง `Idempotency-Key` — ต้องอยู่นอกลูป retry"],
        ["ปลายทางล่มทีไร แอปเราช้าค้างตามไปด้วย", "เช็ก `CircuitBreaker` — เปิดวงจร fail fast เมื่อพังต่อเนื่องหรือยัง"],
      ],
    },
    student: {
      title: "First-Year Note — ลำดับการไล่ดีบักเมื่อเห็น Test แดงหลายข้อพร้อมกัน",
      body: [
        "เวลาเปิดไฟล์บั๊กแล้วรัน `pytest` เจอแดง 5 ข้อ อย่าเพิ่งตกใจและอย่าแก้ทุกอย่างพร้อมกันทีเดียว ให้ไล่แก้ทีละชั้นจากข้างในออกข้างนอก:",
        "1) แก้ `timeout` และ status classification (4xx vs 429/5xx) ให้ผ่านก่อน → 2) แก้ตำแหน่ง `Idempotency-Key` และ `tenacity` wait/jitter/`Retry-After` → 3) เชื่อม `CircuitBreaker` และ `before_sleep` logging — รัน `uv run pytest -q` ทุกครั้งหลังแก้ 1 จุด คุณจะเห็นเทสต์เขียวเพิ่มขึ้นทีละข้ออย่างมั่นใจ",
      ],
    },
  },

  workedExample: {
    intro:
      "มาซ้อมอ่านอาการจากผลเทสต์ที่พังแล้วไล่ชี้ตำแหน่งบั๊ก 3 ขั้นตอน ก่อนลงมือซ่อมไฟล์จริง 5 บั๊กในโจทย์ฝึกปฏิบัติ",
    steps: [
      {
        title: "1 · อ่านโค้ดต้นทางที่ดูเหมือนทำงานได้ แต่ซ่อนบั๊กไว้ 3 จุด",
        explain:
          "ลองสแกนโค้ดสั้น ๆ ด้านล่างก่อนดูเฉลยในขั้นที่ 2: สังเกต `timeout`, ตำแหน่ง `uuid4()`, และเงื่อนไข `if resp.status_code != 200`",
        code: {
          language: "python",
          filename: "snippet_buggy.py",
          code: `import time
import uuid
import httpx


def buggy_send(client: httpx.Client, payload: dict) -> dict:
    # บั๊ก A: ไม่ได้ตรวจ timeout ของ client (อาจเป็น None)
    for _ in range(4):
        # บั๊ก B: สุ่ม Idempotency-Key ใหม่ทุกรอบ!
        key = str(uuid.uuid4())
        resp = client.post("/v1/jobs", json=payload, headers={"Idempotency-Key": key})
        if resp.status_code == 200:
            return resp.json()
        # บั๊ก C: retry แม้กระทั่ง 400/401 และรอคงที่ไม่มี jitter!
        time.sleep(0.2)
    raise RuntimeError("failed")`,
        },
        output: `# สแกนเจอ 3 จุด: timeout, key ในลูป, และ retry เหมารวม + fixed sleep`,
      },
      {
        title: "2 · ซ่อมทีละจุดด้วย `TransientAPIError` + `Retrying` + `Idempotency-Key` นอกลูป",
        explain:
          "ย้ายการสร้าง `key` ออกนอกลูป แยก 4xx เป็น `ClientAPIError` และเปลี่ยนลูปมือเป็น `tenacity.Retrying` ที่เคารพ `Retry-After` พร้อม `wait_exponential_jitter`",
        code: {
          language: "python",
          filename: "snippet_fixed.py",
          code: `from collections.abc import Callable
import time
import uuid
import httpx
from tenacity import (
    RetryCallState,
    Retrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
)


class ClientAPIError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(f"HTTP {status_code}: {detail}")
        self.status_code = status_code


class TransientAPIError(Exception):
    def __init__(
        self, detail: str, status_code: int | None = None, retry_after: float | None = None
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.retry_after = retry_after


def fixed_send(
    client: httpx.Client,
    payload: dict,
    *,
    idempotency_key: str | None = None,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> dict:
    key = idempotency_key or f"idem-{uuid.uuid4().hex}"
    backoff = wait_exponential_jitter(initial=0.5, max=10.0, jitter=0.25)

    def _wait(state: RetryCallState) -> float:
        exc = state.outcome.exception() if state.outcome else None
        if isinstance(exc, TransientAPIError) and exc.retry_after is not None:
            return min(exc.retry_after, 10.0)
        return backoff(state)

    for attempt in Retrying(
        retry=retry_if_exception_type(TransientAPIError),
        stop=stop_after_attempt(4),
        wait=_wait,
        sleep=sleep_fn,
        reraise=True,
    ):
        with attempt:
            try:
                resp = client.post("/v1/jobs", json=payload, headers={"Idempotency-Key": key})
            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                raise TransientAPIError(str(exc)) from exc
            if 200 <= resp.status_code < 300:
                return resp.json()
            if resp.status_code in (408, 429) or resp.status_code >= 500:
                raw = resp.headers.get("Retry-After")
                after = float(raw) if raw and raw.replace(".", "", 1).isdigit() else None
                raise TransientAPIError(f"HTTP {resp.status_code}", resp.status_code, after)
            raise ClientAPIError(resp.status_code, resp.text[:120])
    raise RuntimeError("Unreachable")`,
        },
        output: `# ซ่อมครบทั้ง 3 จุดแล้ว — พร้อมรันพิสูจน์บน MockTransport`,
      },
      {
        title: "3 · พิสูจน์บน `MockTransport` ว่า 400 หยุดทันที และ 429 ส่ง key เดิม + รอตาม `Retry-After`",
        explain:
          "จำลอง 2 สถานการณ์ติดกัน: เคส 400 (ต้องยิง 1 ครั้ง) และเคส 429 → 200 (ต้องยิง 2 ครั้งด้วย key เดียวกันและรอ 2.0 วินาที)",
        code: {
          language: "python",
          filename: "snippet_fixed.py",
          code: `keys: list[str | None] = []
seq = [httpx.Response(429, headers={"Retry-After": "2"}), httpx.Response(201, json={"job": "J-1"})]

def handler(req: httpx.Request) -> httpx.Response:
    keys.append(req.headers.get("Idempotency-Key"))
    return seq.pop(0)

sleeps: list[float] = []
with httpx.Client(
    base_url="https://api.example.test",
    timeout=httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0),
    transport=httpx.MockTransport(handler),
) as cli:
    out = fixed_send(cli, {"task": "embed"}, sleep_fn=sleeps.append)

print("Output:", out)
print("Same key across retries?", len(set(keys)) == 1)
print("Recorded sleeps:", sleeps)`,
        },
        output: `Output: {'job': 'J-1'}
Same key across retries? True
Recorded sleeps: [2.0]`,
      },
    ],
    gotcha:
      "อย่าลืมเช็กสถานะ `201 Created` ด้วย! โค้ดบั๊กหลายตัวเขียน `if resp.status_code == 200:` พอ API สร้างทรัพยากรสำเร็จแล้วตอบ `201` กลับมองว่าพังแล้วสั่ง retry ซ้ำเฉยเลย — ควรเช็ก `200 <= resp.status_code < 300` เสมอ",
  },

  practice: {
    intro:
      "โจทย์ดีบักรอบทบทวน (15 นาที): ไฟล์ `flaky_client.py` ด้านล่างเป็น API client ที่มี **5 บั๊กตั้งใจซ่อนไว้** ภายใต้สถานการณ์ `429`, `503`, `ReadTimeout` และ `400/401` — ภารกิจของคุณคือวางไฟล์ starter + test ลงเครื่อง รัน `pytest` ดูจุดที่แดง แล้วแก้ทุกบั๊กจนเทสต์เขียวครบ 100%",
    requirements: [
      "**แก้บั๊ก 1 (Missing Timeout)**: กำหนด `DEFAULT_TIMEOUT = httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)` ให้ `httpx.Client` แทน `timeout=None` และปิด client อย่างถูกต้องใน `__exit__`",
      "**แก้บั๊ก 2 (Status Classification & Fail-Fast)**: ยอมรับ 2xx ทุกตัว (`200 <= code < 300`), โยน `ClientAPIError` และ **ห้าม retry** เมื่อเจอ 4xx อื่น ๆ (`400/401/403/404/422`), โยน `TransientAPIError` เมื่อเจอ `408/429/5xx` หรือ `TimeoutException`/`NetworkError`",
      "**แก้บั๊ก 3 (Idempotency-Key Inside Retry Loop)**: ย้ายการสร้าง `Idempotency-Key` ออกนอกลูป retry เพื่อให้ทุกรอบ retry ส่ง header ค่าเดียวกันเป๊ะ",
      "**แก้บั๊ก 4 (No Backoff+Jitter / Ignoring Retry-After / Swallowing Error)**: เปลี่ยนมาใช้ `tenacity.Retrying` ที่มี `wait_exponential_jitter(initial=0.5, max=max_wait, jitter=0.25)`, เคารพ `Retry-After` (ไม่เกิน `max_wait`), ใช้ `reraise=True` และบันทึก log ผ่าน `structlog` ใน `before_sleep`",
      "**แก้บั๊ก 5 (Missing Circuit Breaker Integration)**: เชื่อม `CircuitBreaker` (`before_call`, `record_success`, `record_failure`) โดยให้นับความล้มเหลวเฉพาะ `TransientAPIError` (ไม่ทริปเพราะ `ClientAPIError`) และ fail fast ด้วย `CircuitOpenError` เมื่อวงจรเปิด",
    ],
    starter: {
      language: "python",
      filename: "flaky_client.py",
      code: `"""
ไฟล์นี้มี 5 บั๊กตั้งใจซ่อนไว้ — รัน pytest เพื่อดูอาการ แล้วไล่ซ่อมทีละข้อ!
"""
from collections.abc import Callable
import time
from typing import Literal
import uuid
import httpx
import structlog

log = structlog.get_logger()
BreakerState = Literal["closed", "open", "half_open"]

# BUG 1: ไม่ได้ตั้ง granular timeout (ปล่อย None เสี่ยงค้างตลอดกาล)
DEFAULT_TIMEOUT = None


class CircuitOpenError(Exception):
    pass


class ClientAPIError(Exception):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(f"HTTP {status_code}: {message}")
        self.status_code = status_code


class TransientAPIError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.retry_after = retry_after


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
            raise CircuitOpenError("Circuit breaker is open")

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
            self._opened_at = self._clock()


class FlakyTicketClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        *,
        timeout: httpx.Timeout | None = DEFAULT_TIMEOUT,
        transport: httpx.BaseTransport | None = None,
        breaker: CircuitBreaker | None = None,
        max_attempts: int = 4,
        max_wait: float = 10.0,
        sleep_fn: Callable[[float], None] = time.sleep,
    ) -> None:
        self._client = httpx.Client(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=timeout,
            transport=transport,
        )
        self.breaker = breaker
        self.max_attempts = max_attempts
        self.max_wait = max_wait
        self.sleep_fn = sleep_fn

    def __enter__(self) -> "FlakyTicketClient":
        return self

    def __exit__(self, *args: object) -> None:
        self._client.close()

    def create_ticket(
        self, payload: dict, *, idempotency_key: str | None = None
    ) -> dict:
        # BUG 5: ยังไม่ได้เช็ก self.breaker.before_call() และไม่ได้อัปเดต success/failure
        for _ in range(self.max_attempts):
            # BUG 3: สร้าง Idempotency-Key ใหม่ข้างในลูป retry!
            key = idempotency_key or str(uuid.uuid4())
            resp = self._client.post(
                "/v1/tickets",
                json=payload,
                headers={"Idempotency-Key": key},
            )
            # BUG 2: เช็กแค่ == 200 (พลาด 201) และ retry แม้กระทั่ง 400/401!
            if resp.status_code == 200:
                return resp.json()
            # BUG 4: fixed sleep ไม่มี exponential backoff + jitter และไม่สน Retry-After
            self.sleep_fn(0.1)

        raise RuntimeError("Request failed after retries")
`,
    },
    verification: {
      language: "python",
      filename: "test_flaky_client.py",
      code: `import httpx
import pytest
from flaky_client import (
    CircuitBreaker,
    CircuitOpenError,
    ClientAPIError,
    DEFAULT_TIMEOUT,
    FlakyTicketClient,
    TransientAPIError,
)


def test_bug1_granular_timeout_is_configured():
    assert isinstance(DEFAULT_TIMEOUT, httpx.Timeout)
    assert DEFAULT_TIMEOUT.connect == 3.0
    assert DEFAULT_TIMEOUT.read == 15.0
    assert DEFAULT_TIMEOUT.write == 5.0
    assert DEFAULT_TIMEOUT.pool == 5.0


@pytest.mark.parametrize("bad_status", [400, 401, 403, 404, 422])
def test_bug2_4xx_fails_fast_and_does_not_trip_breaker(bad_status: int):
    calls = 0
    sleeps: list[float] = []
    breaker = CircuitBreaker(failure_threshold=2, recovery_timeout=10.0)

    def handler(_req: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(bad_status, json={"error": "client_bug"})

    with FlakyTicketClient(
        "https://api.example.test",
        "key",
        transport=httpx.MockTransport(handler),
        breaker=breaker,
        sleep_fn=sleeps.append,
    ) as cli:
        with pytest.raises(ClientAPIError) as exc_info:
            cli.create_ticket({"subject": "bad"})

    assert exc_info.value.status_code == bad_status
    assert calls == 1
    assert sleeps == []
    assert breaker.state == "closed"


def test_bug3_and_bug4_idempotency_backoff_retry_after_and_201():
    seen_keys: list[str | None] = []
    sleeps: list[float] = []
    scripted = [
        httpx.Response(503, text="overloaded"),
        httpx.Response(429, headers={"Retry-After": "3.5"}, text="slow down"),
        httpx.Response(429, headers={"Retry-After": "600"}, text="too long"),
        httpx.Response(201, json={"ticket_id": "TKT-901"}),
    ]

    def handler(req: httpx.Request) -> httpx.Response:
        seen_keys.append(req.headers.get("Idempotency-Key"))
        return scripted[len(seen_keys) - 1]

    with FlakyTicketClient(
        "https://api.example.test",
        "key",
        transport=httpx.MockTransport(handler),
        max_attempts=4,
        max_wait=10.0,
        sleep_fn=sleeps.append,
    ) as cli:
        result = cli.create_ticket({"subject": "ขอคืนเงิน"})

    assert result == {"ticket_id": "TKT-901"}
    assert len(seen_keys) == 4
    assert seen_keys[0] is not None
    assert len(set(seen_keys)) == 1  # key เดิมทุก attempt
    assert len(sleeps) == 3
    assert 0.5 <= sleeps[0] <= 0.75  # exponential initial 0.5 + jitter <= 0.25
    assert sleeps[1] == 3.5  # honored Retry-After
    assert sleeps[2] == 10.0  # capped at max_wait


def test_bug5_timeout_retries_reraises_and_trips_circuit_breaker():
    now = [0.0]
    breaker = CircuitBreaker(failure_threshold=2, recovery_timeout=15.0, clock=lambda: now[0])
    calls = 0
    mode = {"fail": True}

    def handler(req: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        if mode["fail"]:
            raise httpx.ReadTimeout("upstream hung", request=req)
        return httpx.Response(201, json={"recovered": True})

    with FlakyTicketClient(
        "https://api.example.test",
        "key",
        transport=httpx.MockTransport(handler),
        breaker=breaker,
        max_attempts=2,
        sleep_fn=lambda _: None,
    ) as cli:
        # พัง 2 รอบของ client calls -> ทริปเบรกเกอร์เป็น open
        for _ in range(2):
            with pytest.raises(TransientAPIError):
                cli.create_ticket({"subject": "ping"})
        assert breaker.state == "open"

        # ระหว่าง open ต้องโยน CircuitOpenError โดยไม่ยิง handler เพิ่ม
        calls_when_opened = calls
        with pytest.raises(CircuitOpenError):
            cli.create_ticket({"subject": "ping"})
        assert calls == calls_when_opened

        # ผ่าน recovery_timeout -> half_open -> พอยิงผ่านกลับมา closed
        now[0] = 20.0
        mode["fail"] = False
        assert cli.create_ticket({"subject": "ping"}) == {"recovered": True}
        assert breaker.state == "closed"
`,
    },
    selfCheck: [
      "ก่อนแก้: รัน `uv run pytest -q` เห็นเทสต์พังครบทั้ง 5 กลุ่มบั๊ก (ยืนยันว่าเทสต์จับบั๊กได้จริง)",
      "หลังแก้: `DEFAULT_TIMEOUT` เป็น `httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)`",
      "`400/401/403/404/422` หยุดทันทีใน 1 call, ไม่ sleep และไม่ทริป `CircuitBreaker`",
      "`503 → 429 (Retry-After: 3.5) → 429 (Retry-After: 600) → 201` ใช้ `Idempotency-Key` เดิมทุก attempt, รอด้วย backoff+jitter และเคารพ `Retry-After` ภายใต้เพดาน `max_wait=10.0`",
      "หลังแก้ครบ รัน `uv run pytest -v` ผ่านทุกข้อและ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ซ่อมครบทั้ง 5 บั๊กจน `uv run pytest -v` ผ่านทุกกรณี (รวม parametrize 4xx ทั้ง 5 รหัส) และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "เริ่มจากแก้ `DEFAULT_TIMEOUT` ก่อน จากนั้นเพิ่ม `from tenacity import RetryCallState, Retrying, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter` แล้วแทนที่ `for _ in range(...)` ด้วย `Retrying(..., reraise=True)`",
      },
      {
        body: "ย้าย `key = idempotency_key or f\"idem-{uuid.uuid4().hex}\"` ขึ้นมาวางก่อนลูป `Retrying` และครอบการเรียก `self._client.post(...)` ด้วย `try / except (httpx.TimeoutException, httpx.NetworkError) as exc: raise TransientAPIError(...) from exc`",
      },
      {
        body: "โครงของ `create_ticket` ที่แก้ครบทั้ง 5 บั๊กแล้ว (เหลือเติมตัวแปลง `Retry-After` สั้น ๆ)",
        code: {
          language: "python",
          filename: "hint-d016-l3.py",
          code: `def create_ticket(
    self, payload: dict, *, idempotency_key: str | None = None
) -> dict:
    if self.breaker is not None:
        self.breaker.before_call()

    key = idempotency_key or f"idem-{uuid.uuid4().hex}"
    backoff = wait_exponential_jitter(initial=0.5, max=self.max_wait, jitter=0.25)

    def _wait(state: RetryCallState) -> float:
        exc = state.outcome.exception() if state.outcome else None
        if isinstance(exc, TransientAPIError) and exc.retry_after is not None:
            return min(exc.retry_after, self.max_wait)
        return backoff(state)

    def _before_sleep(state: RetryCallState) -> None:
        exc = state.outcome.exception() if state.outcome else None
        wait_s = state.next_action.sleep if state.next_action else 0.0
        log.warning("ticket_retry", attempt=state.attempt_number, wait_s=round(wait_s, 3), error=str(exc))

    retrying = Retrying(
        retry=retry_if_exception_type(TransientAPIError),
        stop=stop_after_attempt(self.max_attempts),
        wait=_wait,
        before_sleep=_before_sleep,
        sleep=self.sleep_fn,
        reraise=True,
    )

    try:
        for attempt in retrying:
            with attempt:
                try:
                    resp = self._client.post(
                        "/v1/tickets", json=payload, headers={"Idempotency-Key": key}
                    )
                except (httpx.TimeoutException, httpx.NetworkError) as exc:
                    raise TransientAPIError(f"Transport error: {exc}") from exc

                if 200 <= resp.status_code < 300:
                    if self.breaker is not None:
                        self.breaker.record_success()
                    return resp.json()
                if resp.status_code in (408, 429) or resp.status_code >= 500:
                    # TODO: แปลง resp.headers.get("Retry-After") เป็น float | None
                    raise TransientAPIError(f"HTTP {resp.status_code}", resp.status_code)
                raise ClientAPIError(resp.status_code, resp.text[:200])
    except TransientAPIError:
        if self.breaker is not None:
            self.breaker.record_failure()
        raise
    raise RuntimeError("Unreachable")`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# 1) รันครั้งแรกก่อนแก้เพื่อดูอาการพังของทั้ง 5 บั๊ก
uv run pytest -v

# 2) หลังซ่อมครบ รันตรวจซ้ำพร้อม ruff
uv run pytest -v
uv run ruff check .`,
      caption: "ฝึกวินัย Red → Green: ดูเหตุผลที่แต่ละเทสต์แดงก่อน แล้วแก้ทีละบั๊กจนเขียวทั้งหมด",
    },
  },

  mistakes: [
    {
      title: "เช็กความสำเร็จด้วย `resp.status_code == 200` แทน `200 <= resp.status_code < 300`",
      symptom: "API ที่สร้างทรัพยากรสำเร็จแล้วคืน `201 Created` ถูกมองว่าพังจนถูกลองใหม่ซ้ำ ๆ",
      fix: "ใช้ `200 <= resp.status_code < 300` (หรือ `resp.is_success` ของ `httpx`) เสมอ",
    },
    {
      title: "เรียก `breaker.record_failure()` ในทุก attempt ของ retry แทนที่จะเรียก 1 ครั้งเมื่อ retry ครบแล้วยังพัง",
      symptom: "แค่คำขอเดียวที่สะดุดชั่วคราว 3 attempt กลับทำให้เบรกเกอร์ทริปเปิดทันที ทั้งที่เพิ่งล้มเหลวแค่ 1 operation",
      fix: "วาง `try / except TransientAPIError:` ครอบ **นอก** ลูป `Retrying` เพื่อให้ 1 operation ที่ลองจนสุดแล้วพังนับเป็น 1 failure ของ Circuit Breaker",
    },
    {
      title: "ลืมส่ง `from exc` ตอนแปลง `httpx.TimeoutException` เป็น `TransientAPIError`",
      symptom: "เวลาดู traceback ใน production มองไม่เห็นสาเหตุเดิมว่าเป็น `ConnectTimeout` หรือ `ReadTimeout`",
      fix: "ใช้ `raise TransientAPIError(...) from exc` เสมอ (ทบทวน Day 6 Exception Chaining)",
    },
    {
      title: "ลืมบันทึก log ใน `before_sleep` หลังเปลี่ยนมาใช้ `tenacity`",
      symptom: "ระบบผ่านเทสต์ทั้งหมด แต่เวลาขึ้น production ทีมไม่รู้เลยว่า API ติด 429 บ่อยแค่ไหน",
      fix: "ผูก `before_sleep` เข้ากับ `structlog` ให้บันทึก `attempt`, `wait_s` และ `error` ทุกรอบที่เกิด retry",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ จาก D6, D10 และ D13–D15) — ลองตอบจากความจำก่อนเช็กเฉลย ข้อที่พลาดจะเข้าคิวทบทวนอัตโนมัติ",
    questions: [
      mc(
        "d016-q1",
        "[ทบทวน D6 + D13] เมื่อดัก `httpx.ReadTimeout` แล้วแปลงเป็น {{custom-exception}} `TransientAPIError` ข้อใดเขียนถูกต้องตามหลัก Exception Chaining ของ Python?",
        [
          ["`except httpx.ReadTimeout: raise TransientAPIError('timeout')`", "ไม่ได้ chain exception เดิม ทำให้ trace ระบุได้ยากขึ้นว่าสาเหตุต้นตอคืออะไร"],
          ["`except httpx.ReadTimeout as exc: raise TransientAPIError('timeout') from exc`", "ถูก — `from exc` รักษา `__cause__` และ traceback ต้นฉบับไว้ครบถ้วนสำหรับดีบักและ logging"],
          ["`except Exception: return {'error': 'timeout'}`", "กลืนทุก exception (รวมถึง bug ในโค้ดเรา) และไม่โยน error ให้ชั้น retry ทำงาน"],
          ["`except httpx.ReadTimeout: pass`", "ห้ามกลืน exception เงียบ ๆ ด้วย `pass`"],
        ],
        "B",
        "การใช้ `raise CustomError(...) from exc` (Day 6) ช่วยให้ชั้นบนแยกชนิด error ได้ง่ายขึ้น ขณะที่ยังคง traceback ต้นเหตุของ `httpx` ไว้ครบ",
        "ทำไมควรใช้ `raise TransientAPIError(...) from exc` แทนการ `raise` เฉย ๆ?",
        "เพื่อรักษา exception cause (`__cause__`) และ traceback ต้นฉบับไว้ช่วยวินิจฉัยสาเหตุจริงตอนดีบัก",
      ),
      mc(
        "d016-q2",
        "[ทบทวน D10 + D13] คุณอยากทดสอบว่ารหัส `400`, `401`, `403`, `404` และ `422` ทั้งหมดโยน `ClientAPIError` โดยไม่ retry วิธีเขียนเทสต์ใน {{pytest}} ข้อใดสะอาดและลดโค้ดซ้ำได้ดีที่สุด?",
        [
          ["คัดลอกฟังก์ชันเทสต์ 5 ฟังก์ชันที่เหมือนกันทุกบรรทัดต่างแค่เลข status", "ซ้ำซ้อนและดูแลยากเมื่อต้องปรับโครงสร้าง client"],
          ["ใช้ `@pytest.mark.parametrize('status', [400, 401, 403, 404, 422])` ร่วมกับ `httpx.MockTransport`", "ถูก — รันแยกเป็น 5 test case อิสระ อ่านง่าย และรู้ทันทีว่า status ไหนพัง"],
          ["รวมทั้ง 5 status ไว้ใน `for` loop เดียวในเทสต์เดียว", "ถ้าเคสแรกพัง ลูปจะหยุดทันทีโดยไม่รู้ผลของอีก 4 status ที่เหลือ"],
          ["ยิงไปยังเซิร์ฟเวอร์จริง 5 endpoint ที่พัง", "ช้า ไม่เสถียร และต้องพึ่งเครือข่ายภายนอก"],
        ],
        "B",
        "`@pytest.mark.parametrize` (Day 10) จับคู่กับ `httpx.MockTransport` (Day 13) คือชุดคอมโบมาตรฐานสำหรับทดสอบทุกขอบเขตของ API Client",
        "ทำไม `@pytest.mark.parametrize` จึงดีกว่าการวน `for` loop ในฟังก์ชันเทสต์เดียว?",
        "เพราะ pytest รายงานผลแยกทีละกรณีอิสระ หากเคสหนึ่งพังเคสที่เหลือยังถูกรันและรายงานครบทุกตัว",
      ),
      mc(
        "d016-q3",
        "[ทบทวน D14 + D15] ใน production พบว่าลูกค้าถูกสร้างทิกเก็ตซ้ำ 2 ใบทุกครั้งที่ API ตอบช้าจน `ReadTimeout` ในรอบแรก สาเหตุที่เป็นไปได้มากที่สุดคือข้อใด?",
        [
          ["ตั้ง `connect` timeout สั้นเกินไป", "ถ้า `connect` timeout คำขอยังไปไม่ถึงเซิร์ฟเวอร์ จึงไม่เกิดการเขียนซ้ำ"],
          ["สร้าง `Idempotency-Key` ใหม่ข้างในลูป retry (หรือไม่ได้ส่งเลย) ทำให้รอบ retry ถูกเซิร์ฟเวอร์มองว่าเป็นคำขอใหม่", "ถูก — เมื่อรอบแรกบันทึกสำเร็จแล้วแต่ตอบกลับไม่ทัน `ReadTimeout` รอบสองต้องส่ง `Idempotency-Key` เดิมเท่านั้น"],
          ["ตั้ง `reraise=True` ใน `tenacity`", "`reraise=True` มีผลเฉพาะตอนพังครบทุกรอบ ไม่ได้ทำให้สร้างข้อมูลซ้ำ"],
          ["ใช้ `time.monotonic()` ใน `CircuitBreaker`", "ไม่เกี่ยวกับการสร้างรายการซ้ำ"],
        ],
        "B",
        "`ReadTimeout` หลังส่งคำขอไปแล้วเป็นจุดอันตรายของคำขอ `POST` เพราะเราไม่รู้ว่าปลายทางบันทึกไปหรือยัง — `Idempotency-Key` คงที่นอกลูป retry คือวิธีป้องกันที่ถูกต้อง",
        "ทำไม `ReadTimeout` ตอนเรียก `POST` ถึงทำให้ข้อมูลซ้ำได้หากไม่มี `Idempotency-Key` ที่คงที่?",
        "เพราะเซิร์ฟเวอร์อาจประมวลผลและบันทึกคำขอแรกเสร็จแล้วแต่คำตอบส่งกลับมาไม่ทัน timeout การ retry โดยไม่มี key เดิมจะทำให้ปลายทางสร้างรายการซ้ำ",
      ),
      mc(
        "d016-q4",
        "[ทบทวน D14 + D15] หลังเปิดใช้งานระบบใหม่ พบอาการ 2 อย่างพร้อมกัน: (1) เมื่อปลายทางล่ม ทุกเครื่องยิงซ้ำพร้อมกันทุก 1.0 วินาทีเป๊ะ และ (2) แค่ผู้ใช้ส่ง JSON ผิด 3 ครั้ง เบรกเกอร์ก็ตัดวงจรทั้งระบบ ควรแก้อย่างไร?",
        [
          ["เปลี่ยนเป็น `wait_exponential_jitter` และเรียก `breaker.record_failure()` เฉพาะเมื่อเกิด `TransientAPIError` (ไม่นับ 4xx)", "ถูก — Jitter แก้ Thundering Herd และแยก `ClientAPIError` ออกจาก Circuit Breaker ป้องกันการตัดวงจรผิดพลาด"],
          ["ปิดทั้ง Retry และ Circuit Breaker ทิ้งให้หมด", "ทำให้ระบบเปราะบางเมื่อเจอ 429 หรือ outage จริง"],
          ["เพิ่ม `failure_threshold` เป็น 1,000 แล้วใช้ `wait_fixed(1.0)` ต่อไป", "ยังไม่แก้ Thundering Herd และเบรกเกอร์จะช้าเกินกว่าจะช่วยตัดวงจรได้ทัน"],
          ["เปลี่ยน `ClientAPIError` ให้เป็น `TransientAPIError` ทั้งหมด", "ยิ่งแย่ลงเพราะจะไป retry ใส่ 400 ด้วย"],
        ],
        "A",
        "ทั้งสองอาการเป็นคลาสสิกเคสของ B04: แก้ retry storm ด้วย `wait_exponential_jitter` และปกป้อง Circuit Breaker ด้วยการนับเฉพาะความล้มเหลวของปลายทาง",
        "แก้สองอาการพร้อมกันอย่างไร: (1) เครื่องยิงซ้ำพร้อมกันทุก 1s เป๊ะ และ (2) 400 Bad Request ทำให้ Circuit Breaker เปิด?",
        "(1) ใช้ `wait_exponential_jitter` เพื่อเพิ่ม backoff+jitter; (2) เรียก `breaker.record_failure()` เฉพาะ `TransientAPIError` ห้ามนับ 4xx",
      ),
    ],
  },

  takeaways: [
    "เช็กลิสต์ 5 ชั้นของ HTTP Client ที่ทนทาน: **Granular Timeout → 2xx/4xx/Transient Classifier → Idempotency-Key นอกลูป → Backoff+Jitter + Retry-After → Circuit Breaker + Structlog**",
    "การดีบักโค้ดเครือข่ายให้เร็วที่สุดคือเปลี่ยนทุกอาการ flaky เป็น regression test บน `httpx.MockTransport` + fake `sleep_fn` + fake `clock`",
    "วาง `breaker.record_failure()` ไว้ระดับ **1 failure ต่อ 1 operation ที่ retry ครบแล้วยังพัง** และห้ามให้ `4xx` (`ClientAPIError`) ไปทริปเบรกเกอร์",
    "จบบล็อก B04 อย่างสมบูรณ์ — พรุ่งนี้ (Day 17) คุณพร้อมก้าวเข้าสู่โลก `asyncio` Event Loop และ `httpx.AsyncClient` แล้ว!",
  ],

  reviewCards: [
    rc(
      "d016-rc-1",
      "5 บั๊กคลาสสิกที่ต้องตรวจเช็กทุกครั้งเวลารีวิวโค้ด HTTP API Client คืออะไรบ้าง?",
      "1) ลืม granular timeout (`timeout=None`), 2) retry ใส่ 400/401 หรือเช็กแค่ `== 200` พลาด `201`, 3) สร้าง `Idempotency-Key` ข้างในลูป retry, 4) fixed wait ไม่มี exponential backoff+jitter / ไม่เคารพ `Retry-After`, 5) ไม่มี Circuit Breaker หรือปล่อยให้ 4xx ไปทริปเบรกเกอร์",
    ),
    rc(
      "d016-rc-2",
      "ควรวาง `breaker.record_failure()` ไว้ข้างในหรือข้างนอกลูป `Retrying` และเพราะเหตุใด?",
      "วาง **ข้างนอก** ลูป `Retrying` (จับ `TransientAPIError` ที่หลุดออกมาเมื่อลองครบแล้ว) เพื่อให้นับเป็น 1 operation failure ไม่ใช่พังรอบเดียวแต่ทริปเบรกเกอร์ทันทีจาก retry ย่อย",
    ),
    rc(
      "d016-rc-3",
      "เครื่องมือ 3 ตัวที่ช่วยให้ทดสอบโค้ด HTTP + Retry + Circuit Breaker ได้ใน < 0.2 วินาทีแบบออฟไลน์คืออะไร?",
      "`httpx.MockTransport` (จำลอง HTTP/timeout), fake `sleep_fn` (ตรวจเวลารอของ `tenacity` โดยไม่ sleep จริง) และ fake `clock` (เลื่อนเวลา `recovery_timeout` ของ Circuit Breaker ทันที)",
    ),
  ],

  sources: [
    { label: "HTTPX Documentation — Timeouts & MockTransport", href: "https://www.python-httpx.org/advanced/timeouts/" },
    { label: "Tenacity Documentation — Retrying & Custom Wait", href: "https://tenacity.readthedocs.io/en/latest/" },
    { label: "pytest Documentation — Parametrizing Fixtures and Test Functions", href: "https://docs.pytest.org/en/stable/how-to/parametrize.html" },
    { label: "AWS Builders' Library — Timeouts, Retries, and Backoff with Jitter", href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/" },
  ],

  glossary: [
    "httpx",
    "exponential-backoff",
    "rate-limit",
    "idempotency",
    "circuit-breaker",
    "custom-exception",
    "structlog",
    "mocking",
  ],
});
