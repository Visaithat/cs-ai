import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D014 — Phase 1 / Block B04
 * Retry with Exponential Backoff & Jitter (tenacity).
 */
export const d014: Lesson = defineLesson({
  day: 14,
  titleTh: "Retry อย่างฉลาดด้วย Exponential Backoff, Jitter และ tenacity",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ลองใหม่เฉพาะ transient error, กัน Thundering Herd ด้วย jitter, เคารพ Retry-After และเก็บ log ทุกรอบ",
  icon: "refresh-cw",
  visual: {
    id: "retry-backoff",
    title: "Exponential Backoff + Jitter — กัน Thundering Herd เมื่อ API ติด 429",
    caption: "กดสลับเทียบการลองใหม่แบบยิงซ้ำทันที vs Backoff + Random Jitter ด้วย tenacity",
    alt: "แผนภาพเปรียบเทียบเวลาการ retry แบบคงที่กับ exponential backoff บวก jitter",
  },
  requiresApiKey: false,
  tools: ["httpx", "tenacity", "structlog", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "รับมือความผันผวนของเครือข่ายระหว่างดึงข้อมูลชุดใหญ่",
      body: "เวลา ingestion pipeline ดึงเอกสารหรือทิกเก็ตหลายพันรายการจาก API ภายนอก โอกาสที่จะเจอ 429 ชั่วคราวหรือ 503 สั้น ๆ เกือบจะเป็น 100% หากไม่มีระบบลองใหม่ งานทั้ง batch จะพังกลางทางซ้ำแล้วซ้ำเล่า",
      lessonNote: "วันนี้เราต่อยอด `TransientAPIError` จาก Day 13 ด้วย `tenacity` เพื่อ retry เฉพาะความผิดพลาดชั่วคราวอย่างมีขีดจำกัด",
    },
    {
      node: 2,
      heading: "อยู่ร่วมกับ Rate Limit ของ LLM API อย่างสุภาพ",
      body: "ผู้ให้บริการ {{llm}} แทบทุกเจ้ามีโควตา RPM/TPM เมื่อทราฟฟิกพุ่งจะคืน `429` พร้อม header `Retry-After` หากไคลเอนต์ทุกเครื่องยิงซ้ำพร้อมกันทันที เซิร์ฟเวอร์จะล่มหนักกว่าเดิม (Thundering Herd)",
      lessonNote: "ใช้ {{exponential-backoff}} บวก **Random Jitter** และเคารพ `Retry-After` เพื่อกระจายจังหวะการยิงใหม่ไม่ให้ชนกัน",
    },
    {
      node: 4,
      heading: "ควบคุมงบเวลา (Latency Budget) ของแอปฝั่งผู้ใช้",
      body: "การ retry แบบไม่มีเพดาน (`while True`) ทำให้ผู้ใช้ต้องจ้องหน้าโหลดนานหลายนาทีจนปิดแอปหนี",
      lessonNote: "จำกัดจำนวนรอบด้วย `stop_after_attempt(n)` และเพดานเวลารอ (`max=...`) พร้อม `reraise=True` เพื่อคืน error จริงเมื่อลองครบแล้ว",
    },
    {
      node: 5,
      heading: "มองเห็นความถี่ของการ Retry ผ่าน Structured Logs",
      body: "หากระบบ retry เงียบ ๆ โดยไม่บันทึก log ทีมจะไม่รู้เลยว่าความจริง API ปลายทางกำลังติด {{rate-limit}} หนักจนระบบช้าลง 5 เท่า",
      lessonNote: "ผูก callback `before_sleep` เข้ากับ {{structlog}} เพื่อบันทึกเลขรอบ, ชนิด error และเวลารอในรูปแบบ JSON ทุกครั้งที่เกิด retry",
    },
  ],

  objectives: [
    "**อธิบาย** เหตุผลที่ต้องใช้ {{exponential-backoff}} ร่วมกับ **Random Jitter** เพื่อป้องกันปัญหา Thundering Herd เมื่อหลายไคลเอนต์เจอ 429/503 พร้อมกัน",
    "**กำหนดค่า** `tenacity` (`Retrying` / `@retry`, `retry_if_exception_type`, `stop_after_attempt`, `wait_exponential_jitter`, `reraise=True`) ให้ retry **เฉพาะ** `TransientAPIError` และไม่แตะ `ClientAPIError`",
    "**พัฒนา** custom wait strategy ที่เคารพ `Retry-After` จากเซิร์ฟเวอร์ บันทึก log ทุกครั้งก่อนนอนรอ และทดสอบได้เร็วระดับมิลลิวินาทีโดยไม่ต้องรอเวลาจริง",
  ],

  prerequisites: [
    "เข้าใจ `httpx.Client`, `httpx.MockTransport` และการแยก `ClientAPIError` vs `TransientAPIError` จาก Day 13",
    "รู้จักการบันทึก structured log ด้วย `structlog` (Day 6) และพื้นฐาน `pytest` (Day 9–10)",
    "ไม่ต้องใช้ API key — ทดสอบ `tenacity` แบบ inject fake sleeper บนเครื่อง 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ Day 14 แล้วเพิ่ม `httpx`, `tenacity` และ `structlog` ด้วย `uv` พร้อมเครื่องมือทดสอบ `pytest` และ `ruff`",
    commands: `uv init ai-day14-retry && cd ai-day14-retry
uv add httpx tenacity structlog
uv add --dev pytest ruff

# ตรวจว่าทุกแพ็กเกจพร้อมใช้งาน
uv run python -c "import httpx, tenacity, structlog; print('Ready!')"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day14-retry` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `httpx`, `tenacity`, `structlog` และ dev tools (`pytest`, `ruff`)"],
      ["verify", "รัน import ทดสอบทั้ง 3 แพ็กเกจสำเร็จ"],
    ],
    note: "ในบทนี้เราจะใช้เทคนิคฉีด `sleep` function เข้าไปใน `tenacity.Retrying` เพื่อให้ unit test ตรวจค่าเวลารอจริงได้ครบทุกรอบโดยใช้เวลารันไม่ถึง 0.1 วินาที",
  },

  concepts: [
    {
      id: "exponential-backoff-jitter",
      title: "1 · Exponential Backoff + Jitter — ทำไมการรอแบบคงที่ถึงทำ API ล่มซ้ำ",
      paragraphs: [
        "สมมติเซิร์ฟเวอร์ AI สะดุดไป 1 วินาที ทำให้ worker 50 ตัวได้รับ `503` พร้อมกัน หากทุกตัวใช้ **Fixed Retry** (รอ 2 วินาทีเป๊ะแล้วยิงใหม่) วินาทีที่ 2 ทั้ง 50 ตัวจะพุ่งชนเซิร์ฟเวอร์พร้อมกันอีกรอบจนล่มซ้ำ อาการนี้เรียกว่า **Thundering Herd**",
        "ทางแก้มาตรฐานอุตสาหกรรมคือ **{{exponential-backoff}} + Jitter**: เพิ่มเวลารอแบบทวีคูณในแต่ละรอบ (เช่น `0.5s → 1s → 2s → 4s` แต่ไม่เกินเพดาน `max`) แล้ว **บวกค่าสุ่ม (jitter)** ลงไป เพื่อให้ worker ทั้ง 50 ตัวกระจายจังหวะการยิงใหม่ไม่ให้ชนกันเป็นคลื่น",
      ],
      analogy:
        "เหมือนคน 50 คนหลุดสายพร้อมกันตอนจองตั๋วคอนเสิร์ต — ถ้าทุกคนกดโทรซ้ำทุก 5 วินาทีเป๊ะ สายก็จะล่มซ้ำทุก 5 วินาที แต่ถ้าแต่ละคนเว้นช่วงนานขึ้นเรื่อย ๆ บวกเวลาสุ่มไม่เท่ากัน คู่สายจะค่อย ๆ ระบายได้จนสำเร็จ",
      bullets: [
        "**Exponential**: รอบ 1 รอ ~0.5s → รอบ 2 รอ ~1.0s → รอบ 3 รอ ~2.0s (เปิดโอกาสให้ปลายทางฟื้นตัว)",
        "**Cap (`max`)**: กำหนดเพดานสูงสุด เช่น `max=10.0` วินาที เพื่อไม่ให้รอเป็นชั่วโมง",
        "**Jitter**: บวกเวลาสุ่ม เช่น `+ uniform(0, 0.5)` วินาที เพื่อสลายคลื่นการยิงพร้อมกัน",
        "**Stop Condition**: จำกัดจำนวนครั้งเสมอ เช่น `stop_after_attempt(4)` — อย่า retry ไม่รู้จบ",
      ],
      whyTitle: "Why this matters — กฎเหล็กที่ผู้ให้บริการ LLM ทุกเจ้าระบุในคู่มือ",
      whyParagraphs: [
        "เอกสารทางการของ OpenAI, Anthropic, Google Cloud และ AWS ล้วนแนะนำสูตรเดียวกันเป๊ะ: **Truncated Exponential Backoff with Jitter** สำหรับ 429 และ 5xx",
        "การเขียนลูป `for` + `time.sleep` เองมักลืมเพดาน ลืม jitter หรือทำ code รก การใช้ `tenacity` ทำให้ policy การ retry อ่านรู้เรื่องใน 5 บรรทัดและตรวจสอบได้ง่าย",
      ],
    },
    {
      id: "tenacity-selective-retry",
      title: "2 · ตั้งค่า `tenacity` ให้ Retry เฉพาะ Transient Error และใช้ `reraise=True`",
      paragraphs: [
        "พลังของ `tenacity` อยู่ที่การแยก **กฎการ retry** ออกจาก **ตรรกะธุรกิจ** คุณประกอบ 4 ชิ้นส่วนเข้าด้วยกัน: `retry=retry_if_exception_type(TransientAPIError)`, `stop=stop_after_attempt(3)`, `wait=wait_exponential_jitter(...)` และ `reraise=True`",
        "จุดที่มือใหม่พลาดบ่อยคือลืมใส่ **`reraise=True`**: โดยค่าเริ่มต้นเมื่อลองครบจำนวนรอบแล้ว `tenacity` จะห่อ error เดิมไว้ใน `tenacity.RetryError` ทำให้โค้ดชั้นบนที่ดัก `except TransientAPIError:` จับไม่เจอ!",
      ],
      analogy:
        "เหมือนป้ายเงื่อนไขหน้าเครื่องรับบัตรคิว: รับเฉพาะคนที่มีบัตร \"รอคิวชั่วคราว\" (`TransientAPIError`), ให้กดใหม่ได้ไม่เกิน 3 รอบ (`stop_after_attempt`), และถ้าครบแล้วยังไม่ได้ให้คืนใบแจ้งเหตุผลเดิม (`reraise=True`)",
      code: {
        language: "python",
        filename: "tenacity_basics.py",
        code: `from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
)


class ClientAPIError(Exception):
    """400/401/403 — ห้าม retry"""


class TransientAPIError(Exception):
    """408/429/5xx/timeout — ลองใหม่ได้"""


@retry(
    retry=retry_if_exception_type(TransientAPIError),
    stop=stop_after_attempt(3),
    wait=wait_exponential_jitter(initial=0.5, max=8.0, jitter=0.5),
    reraise=True,
)
def call_model_endpoint() -> dict:
    # ถ้าโยน ClientAPIError -> หลุดออกทันทีในรอบที่ 1 (fail fast)
    # ถ้าโยน TransientAPIError -> ลองใหม่สูงสุด 3 รอบพร้อม backoff + jitter
    return {"ok": True}`,
        caption: "`retry_if_exception_type(TransientAPIError)` รับประกันว่า `ClientAPIError` จะ fail fast ทันทีโดยไม่ลองซ้ำแม้แต่ครั้งเดียว",
      },
      whyTitle: "Why this matters — แยกนโยบาย Retry ให้ทดสอบได้ด้วย `Retrying(...)`",
      whyParagraphs: [
        "แม้ decorator `@retry(...)` จะเขียนสั้นมาก แต่เวลาเขียน unit test เรามักอยากฉีด `sleep=fake_sleep` เพื่อไม่ต้องรอนอนหลับจริง 15 วินาที",
        "`tenacity` มีคลาส `Retrying(...)` ที่ใช้พารามิเตอร์ชุดเดียวกับ `@retry` เป๊ะ แต่ให้คุณส่ง `sleep=...` เข้ามาตอนสร้างออบเจกต์ได้ ทำให้เทสต์รันครบทุกรอบในพริบตา!",
      ],
    },
    {
      id: "retry-after-and-logging",
      title: "3 · เคารพ `Retry-After` และบันทึก Structured Log ทุกรอบก่อนนอนรอ",
      paragraphs: [
        "เมื่อเซิร์ฟเวอร์ส่ง `429 Too Many Requests` พร้อม header `Retry-After: 5` นั่นคือคำบอกใบ้ตรงจากปลายทางว่า \"กรุณารออย่างน้อย 5 วินาทีแล้วค่อยมาใหม่\" หากเราดื้อยิงซ้ำใน 0.5 วินาที ก็จะโดน 429 ซ้ำและเปลืองรอบ retry ไปฟรี ๆ",
        "ใน `tenacity` เราเขียนฟังก์ชัน `wait` เองที่รับ `retry_state: RetryCallState` เพื่อดึง `exc.retry_after` ออกมาใช้ (โดยคุมไม่ให้เกินเพดาน `max_wait` เผื่อปลายทางส่งเลขสูงเกินไป) และผูก `before_sleep` เพื่อเขียน {{structlog}} บอกเลขรอบ, เหตุผล และจำนวนวินาทีที่จะรอ",
      ],
      analogy:
        "เหมือนป้ายไฟหน้าร้านบอกว่า \"รอคิว 5 นาที\" — ลูกค้าที่ฉลาดจะดูป้ายนั้นก่อน ไม่ใช่เดินเข้าไปถามทุก 10 วินาที พร้อมจดลงสมุดบันทึกว่ารอไปกี่รอบแล้ว",
      code: {
        language: "python",
        filename: "retry_after_log.py",
        code: `import structlog
from tenacity import RetryCallState, wait_exponential_jitter

log = structlog.get_logger()


class TransientAPIError(Exception):
    def __init__(self, msg: str, retry_after: float | None = None) -> None:
        super().__init__(msg)
        self.retry_after = retry_after


def make_wait_strategy(
    initial: float = 0.5, max_wait: float = 10.0, jitter: float = 0.5
):
    fallback_wait = wait_exponential_jitter(initial=initial, max=max_wait, jitter=jitter)

    def _wait(retry_state: RetryCallState) -> float:
        exc = retry_state.outcome.exception() if retry_state.outcome else None
        if isinstance(exc, TransientAPIError) and exc.retry_after is not None:
            return min(exc.retry_after, max_wait)
        return fallback_wait(retry_state)

    return _wait


def log_before_sleep(retry_state: RetryCallState) -> None:
    exc = retry_state.outcome.exception() if retry_state.outcome else None
    sleep_sec = retry_state.next_action.sleep if retry_state.next_action else 0.0
    log.warning(
        "api_retry_scheduled",
        attempt=retry_state.attempt_number,
        sleep_seconds=round(sleep_sec, 3),
        error=str(exc),
    )`,
        caption: "เคารพ `Retry-After` แบบมีเพดาน `max_wait` และ log ทุกรอบผ่าน `structlog` ด้วย `before_sleep`",
      },
      whyTitle: "Why this matters — ทำไมต้องครอบ `min(exc.retry_after, max_wait)`",
      whyParagraphs: [
        "บาง API ส่ง `Retry-After: 3600` (รอ 1 ชั่วโมง) เมื่อโควตารายวันหมด หากโค้ดเราเชื่อตามโดยไม่ตั้งเพดาน worker จะหลับค้างไปทั้งชั่วโมงโดยไม่แจ้งเตือนใคร",
        "การคุมเพดานไว้ (หรือโยน error ทันทีเมื่อ `retry_after > max_wait`) ช่วยรักษา SLA ของระบบและเปิดทางให้ fallback ทำงานแทนได้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ `tenacity` กับ `p-retry` / `axios-retry` ใน JS/TS",
      body: [
        "แนวคิดของ `tenacity` เหมือน `p-retry` หรือ `axios-retry` ในโลก Node.js แต่ยืดหยุ่นกว่าเพราะใช้ได้กับฟังก์ชัน Python ใดก็ได้ ไม่ผูกกับ HTTP client ตัวเดียว:",
      ],
      table: [
        ["`stop_after_attempt(4)`", "`retries: 3` (1 รอบแรก + 3 รอบ retry = 4 attempts)"],
        ["`wait_exponential_jitter(initial=0.5, max=10, jitter=0.5)`", "`factor: 2, minTimeout: 500, maxTimeout: 10000, randomize: true`"],
        ["`retry_if_exception_type(TransientAPIError)`", "`shouldRetry: (err) => isTransient(err)`"],
        ["`before_sleep=log_before_sleep`", "`onFailedAttempt: (err) => logger.warn(...)`"],
      ],
    },
    student: {
      title: "First-Year Note — ระวังความต่างระหว่าง \"attempts\" กับ \"retries\"",
      body: [
        "จุดที่ทำให้งงและเขียนเทสต์ผิดบ่อยมากคือคำว่า **attempt** vs **retry**:",
        "`stop_after_attempt(3)` หมายถึง **รันทั้งหมดไม่เกิน 3 ครั้ง** = ยิงรอบแรก 1 ครั้ง + ลองใหม่ (retry) อีก 2 ครั้ง ดังนั้น `before_sleep` จะถูกเรียกเพียง **2 ครั้ง** (ระหว่างรอบ 1→2 และ 2→3) ไม่ใช่ 3 ครั้ง!",
      ],
    },
  },

  workedExample: {
    intro:
      "มาร้อยต่อ `httpx.Client` (Day 13) เข้ากับ `tenacity.Retrying` และ `structlog` เพื่อสร้าง Resilient Client ที่ผ่านด่าน 503 → 429 (`Retry-After: 3`) → 200 ได้อัตโนมัติ แต่ fail fast ทันทีเมื่อเจอ 400",
    steps: [
      {
        title: "1 · สร้าง Custom Wait Strategy ที่เคารพ `Retry-After` + Backoff Jitter",
        explain:
          "ใช้ `wait_exponential_jitter` เป็นตัวหลัก และสลับไปใช้ `exc.retry_after` เมื่อเซิร์ฟเวอร์ส่ง header `Retry-After` มาพร้อม 429/503",
        code: {
          language: "python",
          filename: "worked_d014.py",
          code: `import httpx
import structlog
from tenacity import (
    RetryCallState,
    Retrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
)

log = structlog.get_logger()


class ClientAPIError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(f"HTTP {status_code}: {detail}")
        self.status_code = status_code


class TransientAPIError(Exception):
    def __init__(
        self,
        detail: str,
        status_code: int | None = None,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.retry_after = retry_after


def build_wait(initial: float = 0.5, max_wait: float = 10.0, jitter: float = 0.25):
    backoff = wait_exponential_jitter(initial=initial, max=max_wait, jitter=jitter)

    def _wait(state: RetryCallState) -> float:
        exc = state.outcome.exception() if state.outcome else None
        if isinstance(exc, TransientAPIError) and exc.retry_after is not None:
            return min(exc.retry_after, max_wait)
        return backoff(state)

    return _wait`,
        },
        output: `# สร้าง exception และ custom wait function สำเร็จ`,
      },
      {
        title: "2 · หุ้มการยิง `httpx` ด้วย `Retrying` ที่ฉีด `sleep` ได้และ Log ทุกรอบ",
        explain:
          "ใช้ `Retrying(..., sleep=sleep_fn, reraise=True)` เพื่อให้นำไปทดสอบแบบเร็วได้โดยไม่ต้องรอเวลาจริง และบันทึก `before_sleep` ทุกรอบ",
        code: {
          language: "python",
          filename: "worked_d014.py",
          code: `from collections.abc import Callable
import time


def post_with_retry(
    client: httpx.Client,
    path: str,
    payload: dict,
    *,
    max_attempts: int = 4,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> dict:
    def _log_retry(state: RetryCallState) -> None:
        exc = state.outcome.exception() if state.outcome else None
        wait_s = state.next_action.sleep if state.next_action else 0.0
        log.warning("retrying_request", attempt=state.attempt_number, wait_s=round(wait_s, 3), error=str(exc))

    retrying = Retrying(
        retry=retry_if_exception_type(TransientAPIError),
        stop=stop_after_attempt(max_attempts),
        wait=build_wait(initial=0.5, max_wait=10.0, jitter=0.25),
        before_sleep=_log_retry,
        sleep=sleep_fn,
        reraise=True,
    )

    for attempt in retrying:
        with attempt:
            try:
                resp = client.post(path, json=payload)
            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                raise TransientAPIError(f"Transport error: {exc}") from exc

            if 200 <= resp.status_code < 300:
                return resp.json()
            if resp.status_code in (408, 429) or resp.status_code >= 500:
                raw = resp.headers.get("Retry-After")
                retry_after = float(raw) if raw and raw.replace(".", "", 1).isdigit() else None
                raise TransientAPIError(f"HTTP {resp.status_code}", resp.status_code, retry_after)
            raise ClientAPIError(resp.status_code, resp.text[:120])

    raise RuntimeError("Unreachable")`,
        },
        output: `# post_with_retry พร้อมลองใหม่แบบมี backoff + Retry-After + logging`,
      },
      {
        title: "3 · จำลอง 503 → 429 (Retry-After: 3) → 200 และตรวจเวลารอที่บันทึกไว้",
        explain:
          "ส่ง `recorded_sleeps.append` เป็น `sleep_fn` เพื่อตรวจว่ารอบแรกใช้ backoff+jitter (~0.5–0.75s) รอบสองเคารพ `Retry-After` (3.0s) และรอบสามสำเร็จ 200",
        code: {
          language: "python",
          filename: "worked_d014.py",
          code: `responses = [
    httpx.Response(503, text="overloaded"),
    httpx.Response(429, headers={"Retry-After": "3"}, text="rate limited"),
    httpx.Response(200, json={"label": "refund", "ok": True}),
]
call_count = 0


def flaky_handler(_request: httpx.Request) -> httpx.Response:
    global call_count
    resp = responses[call_count]
    call_count += 1
    return resp


recorded_sleeps: list[float] = []
with httpx.Client(base_url="https://api.example.test", transport=httpx.MockTransport(flaky_handler)) as cli:
    result = post_with_retry(cli, "/v1/classify", {"text": "ขอคืนเงิน"}, sleep_fn=recorded_sleeps.append)

print("Result:", result)
print("Total calls:", call_count)
print("Sleeps (sec):", [round(s, 3) for s in recorded_sleeps])`,
        },
        output: `2026-11-22 10:00:01 [warning  ] retrying_request               attempt=1 error='HTTP 503' wait_s=0.614
2026-11-22 10:00:01 [warning  ] retrying_request               attempt=2 error='HTTP 429' wait_s=3.0
Result: {'label': 'refund', 'ok': True}
Total calls: 3
Sleeps (sec): [0.614, 3.0]`,
      },
    ],
    gotcha:
      "ถ้าคุณลืมตั้ง `reraise=True` ใน `Retrying(...)` เมื่อยิงครบ `max_attempts` แล้วไม่ผ่าน โค้ดจะโยน `tenacity.RetryError` แทน `TransientAPIError` ทำให้ข้อความ error และ status code เดิมถูกซ่อนอยู่ข้างใน `err.last_attempt.exception()`",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `resilient_caller.py` ที่ใช้ `tenacity.Retrying` ห่อการเรียก `httpx.Client` โดย retry เฉพาะ `TransientAPIError`, เคารพ `Retry-After` แบบมีเพดาน `max_wait`, บันทึกเหตุการณ์ทุกครั้งก่อน retry และผ่านการทดสอบทั้งหมดในเสี้ยววินาทีด้วย fake sleeper",
    requirements: [
      "ประกาศ `ClientAPIError` และ `TransientAPIError(message, status_code=None, retry_after=None)`",
      "สร้าง `make_wait_strategy(initial: float = 0.5, max_wait: float = 10.0, jitter: float = 0.25)` ที่คืนฟังก์ชัน `wait(retry_state)` ซึ่งใช้ `min(exc.retry_after, max_wait)` หาก `exc` เป็น `TransientAPIError` ที่มี `retry_after` ไม่เป็น `None` มิฉะนั้นใช้ `wait_exponential_jitter(initial=initial, max=max_wait, jitter=jitter)`",
      "สร้าง `request_json_with_retry(client, method, path, *, json_body=None, max_attempts=4, initial_wait=0.5, max_wait=10.0, jitter=0.25, sleep_fn=time.sleep, on_retry=None) -> dict`",
      "เมื่อเจอ `400/401/403/404/422` ต้องโยน `ClientAPIError` ทันทีในรอบแรก (ห้าม retry); เมื่อเจอ `408/429/5xx` หรือ `TimeoutException`/`NetworkError` ให้ retry สูงสุด `max_attempts` ครั้ง และโยน `TransientAPIError` เดิมออกมา (`reraise=True`) เมื่อครบจำนวนรอบแล้ว",
      "ทุกครั้งก่อนนอนรอต้องเรียก `on_retry(attempt_number, sleep_seconds, exc)` หากมีการส่ง `on_retry` เข้ามา (และสามารถ log ด้วย `structlog` ควบคู่ได้)",
    ],
    starter: {
      language: "python",
      filename: "resilient_caller.py",
      code: `from collections.abc import Callable
import time
import httpx
import structlog
from tenacity import (
    RetryCallState,
    Retrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
)

log = structlog.get_logger()


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


def make_wait_strategy(
    initial: float = 0.5, max_wait: float = 10.0, jitter: float = 0.25
) -> Callable[[RetryCallState], float]:
    # TODO: คืนฟังก์ชันที่ใช้ min(exc.retry_after, max_wait) เมื่อมี retry_after
    # มิฉะนั้น fallback ไปที่ wait_exponential_jitter(initial=initial, max=max_wait, jitter=jitter)
    raise NotImplementedError


def request_json_with_retry(
    client: httpx.Client,
    method: str,
    path: str,
    *,
    json_body: dict | None = None,
    max_attempts: int = 4,
    initial_wait: float = 0.5,
    max_wait: float = 10.0,
    jitter: float = 0.25,
    sleep_fn: Callable[[float], None] = time.sleep,
    on_retry: Callable[[int, float, BaseException | None], None] | None = None,
) -> dict:
    # TODO: ใช้ Retrying(...) ครอบ client.request(method, path, json=json_body)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_resilient_caller.py",
      code: `import httpx
import pytest
from resilient_caller import (
    ClientAPIError,
    TransientAPIError,
    request_json_with_retry,
)


def test_retries_transient_errors_and_honors_retry_after():
    scripted = [
        httpx.Response(503, text="busy"),
        httpx.Response(429, headers={"Retry-After": "4.0"}, text="quota"),
        httpx.Response(429, headers={"Retry-After": "999"}, text="capped"),
        httpx.Response(200, json={"status": "ok"}),
    ]
    calls = 0

    def handler(_req: httpx.Request) -> httpx.Response:
        nonlocal calls
        resp = scripted[calls]
        calls += 1
        return resp

    sleeps: list[float] = []
    events: list[tuple[int, float]] = []

    with httpx.Client(base_url="https://api.example.test", transport=httpx.MockTransport(handler)) as cli:
        data = request_json_with_retry(
            cli,
            "POST",
            "/v1/extract",
            json_body={"text": "ใบเสร็จ"},
            max_attempts=4,
            initial_wait=0.5,
            max_wait=10.0,
            jitter=0.25,
            sleep_fn=sleeps.append,
            on_retry=lambda att, sec, _exc: events.append((att, sec)),
        )

    assert data == {"status": "ok"}
    assert calls == 4
    assert len(sleeps) == 3
    assert 0.5 <= sleeps[0] <= 0.75  # exponential initial + jitter
    assert sleeps[1] == 4.0  # honored Retry-After
    assert sleeps[2] == 10.0  # capped at max_wait
    assert [a for a, _ in events] == [1, 2, 3]


def test_never_retries_client_4xx_error():
    calls = 0

    def handler(_req: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(400, json={"error": "bad_schema"})

    sleeps: list[float] = []
    with httpx.Client(base_url="https://api.example.test", transport=httpx.MockTransport(handler)) as cli:
        with pytest.raises(ClientAPIError) as exc_info:
            request_json_with_retry(cli, "POST", "/v1/extract", max_attempts=4, sleep_fn=sleeps.append)

    assert exc_info.value.status_code == 400
    assert calls == 1
    assert sleeps == []


def test_reraises_original_transient_error_when_exhausted():
    calls = 0

    def handler(req: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        raise httpx.ReadTimeout("slow model", request=req)

    sleeps: list[float] = []
    with httpx.Client(base_url="https://api.example.test", transport=httpx.MockTransport(handler)) as cli:
        with pytest.raises(TransientAPIError):
            request_json_with_retry(cli, "POST", "/v1/extract", max_attempts=3, sleep_fn=sleeps.append)

    assert calls == 3
    assert len(sleeps) == 2
`,
    },
    selfCheck: [
      "เมื่อเจอ `503 → 429 (Retry-After: 4.0) → 429 (Retry-After: 999) → 200` ฟังก์ชันลองใหม่ครบ 4 รอบ, รอตาม `Retry-After` และจำกัดไม่เกิน `max_wait=10.0`",
      "เมื่อเจอ `400 Bad Request` ฟังก์ชันโยน `ClientAPIError` ทันทีโดยเรียก handler เพียง 1 ครั้งและ `sleeps == []`",
      "เมื่อ `ReadTimeout` เกิดครบ `max_attempts=3` ฟังก์ชันโยน `TransientAPIError` เดิม (ไม่ใช่ `tenacity.RetryError`)",
      "`on_retry` ถูกเรียกทุกครั้งก่อน sleep พร้อมเลขรอบและจำนวนวินาทีที่ถูกต้อง",
      "รัน `uv run pytest -q` ผ่านทั้ง 3 ข้อภายใน < 0.2 วินาที และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านเทสต์ครบ 3 กรณีด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `make_wait_strategy` ให้สร้าง `fallback = wait_exponential_jitter(initial=initial, max=max_wait, jitter=jitter)` ไว้นอกฟังก์ชันย่อย แล้วเช็ก `retry_state.outcome.exception()` ข้างในว่ามี `retry_after is not None` หรือไม่",
      },
      {
        body: "สำหรับ `before_sleep` ให้สร้างฟังก์ชัน `_before_sleep(state: RetryCallState)` ที่ดึง `wait_s = state.next_action.sleep if state.next_action else 0.0` แล้วเรียกทั้ง `log.warning(...)` และ `if on_retry is not None: on_retry(state.attempt_number, wait_s, exc)`",
      },
      {
        body: "โครงของ `Retrying` และ `before_sleep` พร้อมแล้ว — เหลือเติมการเรียก `client.request(...)` และแยก status code ด้านในบล็อก `with attempt:`",
        code: {
          language: "python",
          filename: "hint-d014-l3.py",
          code: `def _before_sleep(state: RetryCallState) -> None:
    exc = state.outcome.exception() if state.outcome else None
    wait_s = state.next_action.sleep if state.next_action else 0.0
    log.warning("api_retry", attempt=state.attempt_number, wait_s=round(wait_s, 3), error=str(exc))
    if on_retry is not None:
        on_retry(state.attempt_number, wait_s, exc)

retrying = Retrying(
    retry=retry_if_exception_type(TransientAPIError),
    stop=stop_after_attempt(max_attempts),
    wait=make_wait_strategy(initial=initial_wait, max_wait=max_wait, jitter=jitter),
    before_sleep=_before_sleep,
    sleep=sleep_fn,
    reraise=True,
)

for attempt in retrying:
    with attempt:
        # TODO: เรียก client.request(method, path, json=json_body) และแยก 2xx / transient / 4xx
        raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "เพราะฉีด `sleep_fn=sleeps.append` เทสต์จึงเช็กเวลารอ 4s และ 10s ได้โดยไม่ต้องรอจริงแม้แต่วินาทีเดียว",
    },
  },

  mistakes: [
    {
      title: "ลืมใส่ `reraise=True` ใน `tenacity`",
      symptom: "พอ retry ครบจำนวนรอบแล้ว โค้ดชั้นนอกที่ดัก `except TransientAPIError:` กลับจับไม่ได้ เพราะ `tenacity` โยน `tenacity.RetryError` ออกมาแทน",
      fix: "ใส่ `reraise=True` เสมอเมื่อคุณออกแบบ custom exception ให้ผู้เรียกชั้นบนรับไปจัดการต่อ",
    },
    {
      title: "ใช้ `retry_if_exception_type(Exception)` เหมารวมทุกข้อผิดพลาด",
      symptom: "แม้แต่ `401 Invalid API Key`, `400 Bad Request` หรือ `KeyError` ก็ถูกลองใหม่ 4 รอบจนระบบช้าและเปลืองโควตา",
      fix: "ระบุเฉพาะ `retry_if_exception_type(TransientAPIError)` เพื่อให้ 4xx และ programming bugs โยนออกทันที (fail fast)",
    },
    {
      title: "ใช้ Exponential Backoff โดยไม่มี Jitter",
      symptom: "เวลาปลายทางล่มชั่วคราว หลาย worker จะพร้อมใจกันรอ 1s, 2s, 4s เท่ากันเป๊ะแล้วยิงชนเซิร์ฟเวอร์เป็นระลอก (Thundering Herd)",
      fix: "ใช้ `wait_exponential_jitter(...)` แทน `wait_exponential(...)` เสมอในระบบที่มีมากกว่า 1 worker",
    },
    {
      title: "ปล่อยให้เทสต์รัน `time.sleep` จริงของ retry",
      symptom: "ชุด unit test ช้าลงจาก 0.2 วินาทีกลายเป็น 20 วินาที จนทีมไม่อยากรันเทสต์บ่อย ๆ",
      fix: "ออกแบบฟังก์ชันให้รับ `sleep_fn=time.sleep` แล้วส่ง `sleeps.append` ใน `pytest` เพื่อทั้งรันเร็วและตรวจค่าเวลารอได้แม่นยำ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความแม่นยำเรื่อง Exponential Backoff, Jitter, `tenacity` และ `Retry-After`",
    questions: [
      mc(
        "d014-q1",
        "ทำไมการเพิ่ม **Random Jitter** เข้าไปใน {{exponential-backoff}} จึงสำคัญมากในระบบที่มีหลาย worker เรียก API เดียวกัน?",
        [
          ["เพื่อให้เวลารอเป็น 0 วินาทีเสมอ", "Jitter เพิ่มความสุ่มเล็กน้อย ไม่ได้ทำให้เวลารอเป็นศูนย์"],
          ["เพื่อกระจายจังหวะการยิงใหม่ของแต่ละ worker ไม่ให้พุ่งชนเซิร์ฟเวอร์พร้อมกันเป็นคลื่น (Thundering Herd)", "ถูก — ลดโอกาสที่เซิร์ฟเวอร์ที่เพิ่งฟื้นตัวจะล่มซ้ำเพราะ retry storm"],
          ["เพื่อหลบการตรวจสอบ `401 Unauthorized`", "Jitter ไม่เกี่ยวกับการยืนยันตัวตนและห้าม retry 401"],
          ["เพราะ `tenacity` ไม่รองรับการรอแบบไม่มี jitter", "`tenacity` มีทั้ง `wait_exponential` และ `wait_exponential_jitter` แต่แบบมี jitter ปลอดภัยกว่าในงานจริง"],
        ],
        "B",
        "Exponential backoff ช่วยเว้นช่วงให้นานขึ้น ส่วน Random Jitter ช่วยสลายการซิงก์จังหวะของหลายไคลเอนต์ไม่ให้เกิด retry storm",
        "Random Jitter ใน Exponential Backoff ช่วยแก้ปัญหาอะไร?",
        "แก้ปัญหา Thundering Herd (retry storm) ที่หลายไคลเอนต์รอเวลาเท่ากันเป๊ะแล้วยิงชนเซิร์ฟเวอร์ซ้ำพร้อมกัน",
      ),
      mc(
        "d014-q2",
        "หากตั้ง `Retrying(stop=stop_after_attempt(4), retry=retry_if_exception_type(TransientAPIError), reraise=True)` และเซิร์ฟเวอร์ส่ง `503` ทุกครั้ง ข้อใดถูกต้อง?",
        [
          ["ฟังก์ชันจะยิงทั้งหมด 4 ครั้ง นอนรอ 3 ครั้ง แล้วโยน `TransientAPIError`", "ถูก — 4 attempts = ยิง 4 ครั้ง, นอนรอระหว่างรอบ 3 ครั้ง, และ `reraise=True` คืน exception เดิม"],
          ["ฟังก์ชันจะยิงทั้งหมด 5 ครั้ง นอนรอ 4 ครั้ง แล้วโยน `RetryError`", "ผิดทั้งจำนวนรอบและชนิด exception (4 attempts ไม่ใช่ 5 และตั้ง `reraise=True` ไว้แล้ว)"],
          ["ฟังก์ชันจะยิงทั้งหมด 4 ครั้ง แล้วคืน `None` เงียบ ๆ", "`tenacity` ไม่คืน `None` เมื่อพังครบทุกรอบ"],
          ["ฟังก์ชันจะหยุดทันทีตั้งแต่รอบแรกเพราะ 503 ไม่ใช่ timeout", "503 ถูกจัดเป็น `TransientAPIError` จึงถูก retry ตามเงื่อนไข"],
        ],
        "A",
        "`stop_after_attempt(N)` นับรวมรอบแรกด้วยเสมอ จึงมีการยิง N ครั้งและการนอนรอ N-1 ครั้ง และ `reraise=True` จะโยน exception ต้นฉบับออกมา",
        "`stop_after_attempt(4)` กับ `reraise=True` จะยิงกี่ครั้ง นอนรอกี่ครั้ง และโยน error ชนิดไหนเมื่อพังหมด?",
        "ยิง 4 ครั้ง, นอนรอ 3 ครั้ง และโยน exception ต้นฉบับ (`TransientAPIError`) แทน `tenacity.RetryError`",
      ),
      mc(
        "d014-q3",
        "เมื่อ API ตอบ `429 Too Many Requests` พร้อม header `Retry-After: 3600` (1 ชั่วโมง) ในงาน API backend ที่ตอบผู้ใช้แบบเรียลไทม์ ควรจัดการอย่างไรดีที่สุด?",
        [
          ["สั่ง worker นอนรอ 3,600 วินาทีเต็ม ๆ ตาม header", "worker จะถูกยึดค้างเป็นชั่วโมงจนระบบตอบผู้ใช้คนอื่นไม่ได้"],
          ["จำกัดเวลารอด้วยเพดาน `max_wait` (หรือ fail fast คืน fallback เมื่อเกิน SLA) แทนที่จะรอ 1 ชั่วโมง", "ถูก — เคารพ `Retry-After` ภายใต้เพดาน `max_wait` ที่สอดคล้องกับ latency budget ของระบบ"],
          ["ไม่สนใจ `Retry-After` เลยแล้วยิงรัวทุก 0.01 วินาที", "ยิ่งทำให้โดน 429 ซ้ำและเสี่ยงถูกบล็อก API key"],
          ["เปลี่ยน status 429 ให้เป็น 200 แล้วส่งค่าว่างกลับให้ผู้ใช้", "ห้ามปลอมความสำเร็จเมื่อคำขอล้มเหลว"],
        ],
        "B",
        "การเคารพ `Retry-After` ต้องทำควบคู่กับเพดาน `max_wait` เสมอ เพื่อปกป้อง latency budget และไม่ให้ worker ค้างยาว",
        "ทำไมการเคารพ `Retry-After` จึงต้องครอบด้วยเพดาน `max_wait`?",
        "เพื่อป้องกันไม่ให้ค่า `Retry-After` ที่สูงมาก (เช่น 3600 วินาที) ทำให้ worker นอนรอค้างจนเกิน SLA ของระบบ",
      ),
      mc(
        "d014-q4",
        "เหตุใดจึงควรผูก callback `before_sleep` ของ `tenacity` เข้ากับ {{structlog}}?",
        [
          ["เพราะ `tenacity` จะไม่ยอม retry ถ้าไม่ใส่ `before_sleep`", "`before_sleep` เป็นพารามิเตอร์เสริม ไม่ได้บังคับ"],
          ["เพื่อบันทึกเลขรอบ, ชนิด error และเวลารอเป็น structured log ทำให้ทีมตรวจจับอาการ rate-limit spike และ latency พุ่งได้", "ถูก — ช่วยให้เห็นปัญหาที่ถูกกลบไว้ใต้การ retry ที่สำเร็จในรอบหลัง ๆ"],
          ["เพื่อให้ `structlog` ลดเวลารอของเซิร์ฟเวอร์ปลายทาง", "logging ไม่ได้เปลี่ยนความเร็วของปลายทาง แต่มอบความโปร่งใสในการ monitor"],
          ["เพื่อแปลง `ClientAPIError` ให้กลายเป็น `TransientAPIError`", "`before_sleep` ใช้สังเกตการณ์ ไม่ใช่เปลี่ยนชนิด error"],
        ],
        "B",
        "Retry ที่เงียบสนิทอาจซ่อนปัญหาใหญ่ เช่น โควตา API ใกล้เต็มจน P95 latency พุ่ง — การ log ใน `before_sleep` ทำให้ทีมเห็นสัญญาณเตือนได้ทัน",
        "callback `before_sleep` ใน `tenacity` มีประโยชน์อย่างไรในระบบ production?",
        "ใช้ออก structured log (attempt, sleep_seconds, error) ทุกรอบที่เกิด retry เพื่อ monitor อาการ 429/5xx และหาต้นตอ latency",
      ),
    ],
  },

  takeaways: [
    "ใช้ **Exponential Backoff + Random Jitter** (`wait_exponential_jitter`) เพื่อเปิดโอกาสให้ปลายทางฟื้นตัวและป้องกัน Thundering Herd",
    "Retry **เฉพาะ** `TransientAPIError` (`retry_if_exception_type`) พร้อม `stop_after_attempt(n)` และ `reraise=True` — ห้าม retry 400/401/403 เด็ดขาด",
    "เคารพ `Retry-After` จากเซิร์ฟเวอร์แต่ต้องมีเพดาน `max_wait` เสมอ และบันทึก log ทุกรอบผ่าน `before_sleep`",
    "ฉีด `sleep_fn` เข้าไปใน `tenacity.Retrying` เพื่อให้ `pytest` ตรวจสอบพฤติกรรมการรอได้แม่นยำโดยไม่ต้องรอนอนหลับจริง",
  ],

  reviewCards: [
    rc(
      "d014-rc-1",
      "Exponential Backoff + Jitter ทำงานอย่างไร และทำไมต้องใส่ทั้งคู่?",
      "Backoff ขยายเวลารอแบบทวีคูณ (เช่น 0.5s → 1s → 2s) พร้อมเพดาน `max` เพื่อลดภาระปลายทาง ส่วน Jitter บวกค่าสุ่มเพื่อกันไม่ให้หลายไคลเอนต์ยิงชนกันพร้อมกัน (Thundering Herd)",
    ),
    rc(
      "d014-rc-2",
      "4 พารามิเตอร์สำคัญของ `tenacity.Retrying` สำหรับ HTTP API Client คืออะไรบ้าง?",
      "`retry=retry_if_exception_type(TransientAPIError)`, `stop=stop_after_attempt(n)`, `wait=wait_exponential_jitter(...)` (หรือ custom wait ที่เคารพ `Retry-After`) และ `reraise=True`",
    ),
    rc(
      "d014-rc-3",
      "จะเขียน unit test ทดสอบ `tenacity` ที่รอหลายวินาทีให้รันเสร็จในไม่กี่มิลลิวินาทีได้อย่างไร?",
      "ใช้ `Retrying(..., sleep=recorded_sleeps.append)` แทน `time.sleep` จริง เพื่อบันทึกค่าเวลารอไว้ assert โดยไม่เสียเวลารอจริง",
    ),
  ],

  sources: [
    { label: "Tenacity Documentation — Retrying Library for Python", href: "https://tenacity.readthedocs.io/en/latest/" },
    { label: "AWS Architecture Blog — Timeouts, Retries, and Backoff with Jitter", href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/" },
    { label: "MDN Web Docs — Retry-After HTTP Header", href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After" },
    { label: "structlog Official Documentation", href: "https://www.structlog.org/en/stable/" },
  ],

  glossary: [
    "exponential-backoff",
    "rate-limit",
    "httpx",
    "custom-exception",
    "fail-fast",
    "structlog",
    "mocking",
    "llm",
  ],
});
