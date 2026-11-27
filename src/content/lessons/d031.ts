import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D031 — Phase 1 / Block B08
 * Add Retries (tenacity), Persistent SQLite Cache, structlog Metrics & Offline pytest Suite.
 */
export const d031: Lesson = defineLesson({
  day: 31,
  titleTh: "เสริมเกราะ Production: tenacity Retry, SQLite Cache และชุดเทสต์ pytest แบบ Offline",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · เพิ่ม selective retry เฉพาะ 429/5xx, แคชผลลัพธ์ลง SQLite, เก็บ metrics ด้วย structlog และทดสอบครบทุกกรณีด้วย MockTransport",
  icon: "shield-check",
  visual: {
    id: "phase1-capstone-arch",
    title: "เสริมเกราะ Production: tenacity Retry + SQLite Cache + pytest Suite",
    caption:
      "ดูลำดับการทำงาน Cache Lookup → Retryable Fetch → Save Cache → Verify ด้วย MockTransport",
    alt: "แผนภาพการผสาน retry, SQLite cache และ pytest suite",
  },
  requiresApiKey: false,
  tools: ["tenacity", "SQLite", "structlog", "httpx", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ทนทานต่อความผันผวนของ API และลดการยิงซ้ำด้วย Cache",
      body: "API ภายนอกในโลกจริงมักมีอาการสะดุดชั่วคราว (`429`, `503`, timeout) และการรันงานซ้ำระหว่างพัฒนาหรือกู้คืนระบบไม่ควรเสียเวลาและค่าใช้จ่ายยิงปลายทางซ้ำ",
      lessonNote:
        "วันนี้เราผสาน `tenacity` ({{exponential-backoff}} + jitter) เข้ากับ {{sqlite}} {{caching}} เพื่อให้ท่อ ingestion พร้อมรับมือสถานการณ์จริง",
    },
    {
      node: 3,
      heading: "ยืนยันพฤติกรรมทุกเส้นทางด้วย Offline pytest Suite",
      body: "โค้ด retry และ cache ที่ไม่เคยถูกทดสอบมักซ่อนบั๊กอันตราย เช่น เผลอ retry `404` หรือแคชหน้า error `500` เก็บไว้เป็นของดี",
      lessonNote:
        "เราใช้ {{pytest}} + {{mocking|httpx.MockTransport}} + `tmp_path` จำลองทั้ง 429→200, 404 fail-fast และ cache hit โดยไม่ต้องต่ออินเทอร์เน็ต",
    },
    {
      node: 4,
      heading: "ประกอบเป็นบริการ CLI ที่เชื่อถือได้และทำซ้ำได้",
      body: "เมื่อรวม Cache Lookup → Retryable Fetch → Pydantic Validation → Save Cache → JSONL เข้าด้วยกัน เราจะได้เครื่องมือ CLI ที่มีพฤติกรรมคาดเดาได้ทุกรอบ",
      lessonNote:
        "ลำดับการวาง cache *ก่อน* network และบันทึก cache เฉพาะข้อมูลที่ผ่าน validation คือหลักการสำคัญที่ทำให้ระบบปลอดภัย",
    },
    {
      node: 5,
      heading: "บันทึก Telemetry เชิงโครงสร้างด้วย structlog",
      body: "ข้อความ log ที่เป็น JSON พร้อมตัวเลข `cache_hits`, `retries`, `succeeded`, `quarantined` ช่วยให้ติดตามต้นทุนและความเสถียรได้ง่ายทั้งในเครื่องและในระบบ production",
      lessonNote:
        "ท้ายรอบการทำงาน ท่อจะพ่น structured event ผ่าน {{structlog}} เพื่อใช้วัดผลและตรวจสุขภาพใน Checkpoint Day 32",
    },
  ],

  objectives: [
    "**เพิ่ม Selective Async Retry** ด้วย `tenacity.AsyncRetrying` (Exponential Backoff + Jitter) ที่ retry เฉพาะความผิดพลาดชั่วคราว (`408`/`429`/`5xx`/timeout) และ {{fail-fast}} ทันทีกับ `400`/`401`/`404`",
    "**เชื่อมต่อ Persistent {{sqlite}} Response Cache** ด้วย parameterized query พร้อม TTL — ตรวจแคชก่อนยิง HTTP และบันทึกเฉพาะข้อมูลที่ validate ผ่านแล้วเท่านั้น",
    "**บันทึก Metrics ด้วย {{structlog}} และเขียน Offline {{pytest}} Suite** ด้วย `httpx.MockTransport` เพื่อพิสูจน์ cache hit, retry recovery และ non-retryable fail-fast ภายในไม่ถึง 1 วินาที",
  ],

  prerequisites: [
    "ผ่าน Day 30 (ท่อ `httpx.AsyncClient` + `asyncio.Semaphore` + Pydantic Quarantine)",
    "คุ้นเคยกับ `tenacity` (Block B04), `structlog` (Block B02) และ `sqlite3` parameterized queries (Block B07)",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — รันบนเครื่องและทดสอบออฟไลน์ได้ 100%",
  ],

  setup: {
    intro:
      "ทำต่อในโปรเจกต์ `resilient-fetcher` หรือติดตั้งแพ็กเกจเพิ่มเติม (`tenacity`, `structlog`, `pytest-cov`) ด้วย {{uv}} โดย `sqlite3` มากับ Python อยู่แล้วไม่ต้องติดตั้งเพิ่ม",
    commands: `# ตรวจให้แน่ใจว่ามีแพ็กเกจครบในโปรเจกต์
uv add httpx pydantic tenacity structlog
uv add --dev pytest pytest-cov ruff

# ยืนยันว่า import ได้ครบ
uv run python -c "import tenacity, sqlite3, structlog; print('All ready!')"`,
    steps: [
      ["deps", "ยืนยันว่ามี `tenacity`, `structlog`, `httpx`, `pydantic` และ `pytest-cov` ในโปรเจกต์"],
      ["sqlite", "ทดสอบว่า `sqlite3` (standard library) พร้อมใช้งานผ่าน `uv run python`"],
      ["ready", "เห็นข้อความ `All ready!` พร้อมลงมือผสาน Cache + Retry + Tests"],
    ],
    note: "เคล็ดลับความเร็วในเทสต์: ให้ `wait` policy ของ `tenacity` ปรับเป็นพารามิเตอร์ได้ เพื่อให้ production ใช้ backoff จริง (เช่น 0.5–8s + jitter) ส่วนใน `pytest` ส่ง `wait_none()` หรือ backoff 0.001s เพื่อให้ชุดเทสต์รันจบในเสี้ยววินาที",
  },

  concepts: [
    {
      id: "selective-async-retry",
      title: "1 · Selective Async Retry ด้วย `tenacity.AsyncRetrying` (เฉพาะ 429/5xx)",
      paragraphs: [
        "ในโลก async เราใช้ `async for attempt in AsyncRetrying(...):` ของ `tenacity` แทนการเขียนลูป `while` เอง เพื่อรองรับ **Exponential Backoff + Random Jitter** (`wait_exponential_jitter`) ที่ช่วยกระจายจังหวะยิงซ้ำไม่ให้ทุก worker ถล่มเซิร์ฟเวอร์พร้อมกัน (Thundering Herd)",
        "กฎเหล็กของการ retry คือ **Retry เฉพาะ Transient Errors เท่านั้น**: เราโยน `RetryableFetchError` เมื่อเจอ `408`/`429`/`5xx` หรือ `httpx.TimeoutException`/`ConnectError` แล้วตั้ง `retry=retry_if_exception_type(RetryableFetchError)` ส่วน `400`/`401`/`404` โยน `NonRetryableFetchError` เพื่อให้หยุดทันทีใน 1 ครั้ง (0 retries)",
      ],
      analogy:
        "เหมือนการโทรหาร้านอาหาร: ถ้าสายไม่ว่าง (`429`/`503`) ให้รอสักครู่แล้วค่อยโทรใหม่โดยเว้นระยะนานขึ้นทีละนิด แต่ถ้าได้ยินเสียงว่า 'หมายเลขนี้ยังไม่เปิดให้บริการ' (`404`) การโทรซ้ำอีก 5 ครั้งก็ไม่มีทางติด",
      code: {
        language: "python",
        filename: "retry_fetch.py",
        code: `import httpx
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter


class RetryableFetchError(Exception):
    pass


class NonRetryableFetchError(Exception):
    pass


async def fetch_json_with_retry(
    client: httpx.AsyncClient,
    url: str,
    max_retries: int = 3,
    wait_strategy=None,
) -> tuple[dict, int]:
    """คืน (json_payload, retry_count) โดย retry เฉพาะ RetryableFetchError"""
    wait = wait_strategy or wait_exponential_jitter(initial=0.2, max=4.0)
    retries = 0

    async for attempt in AsyncRetrying(
        stop=stop_after_attempt(max_retries + 1),
        wait=wait,
        retry=retry_if_exception_type(RetryableFetchError),
        reraise=True,
    ):
        with attempt:
            if attempt.retry_state.attempt_number > 1:
                retries += 1
            try:
                resp = await client.get(url)
            except (httpx.TimeoutException, httpx.TransportError) as exc:
                raise RetryableFetchError(str(exc)) from exc

            if resp.status_code in (408, 429) or resp.status_code >= 500:
                raise RetryableFetchError(f"HTTP {resp.status_code}")
            if resp.status_code >= 400:
                raise NonRetryableFetchError(f"HTTP {resp.status_code}")

            return resp.json(), retries

    raise AssertionError("unreachable")`,
        caption: "แยก `RetryableFetchError` กับ `NonRetryableFetchError` ชัดเจน และนับ `retries` จาก `attempt_number > 1`",
      },
      whyTitle: "Why this matters — ทำไมต้องวาง `Semaphore` ไว้ในจังหวะยิง ไม่ใช่ครอบลูปรอ backoff",
      whyParagraphs: [
        "หากคุณถือ `asyncio.Semaphore` ค้างไว้ตลอดช่วง `tenacity` นอนรอ backoff 2–4 วินาที ช่อง concurrency จะถูกกักไว้เฉย ๆ ทั้งที่ไม่ได้ส่งข้อมูลผ่านเครือข่ายเลย",
        "แนวทางที่ดีคือเปิด `async with semaphore:` เฉพาะตอนเรียก `await client.get(url)` ภายในแต่ละ attempt เพื่อให้ช่วงเวลานอนรอ backoff คืนสล็อตให้ task อื่นวิ่งต่อไปได้",
      ],
    },
    {
      id: "sqlite-persistent-cache",
      title: "2 · ชั้น SQLite Persistent Cache: ตรวจก่อนยิง และแคชเฉพาะของที่ผ่านด่าน",
      paragraphs: [
        "การแคชคำตอบลง {{sqlite}} (ไฟล์เดียวบนดิสก์ ไม่ต้องตั้ง Redis server) ช่วยให้การรัน CLI รอบที่สองหรือรันซ้ำหลังแก้บั๊กในส่วนปลายทางแทบไม่ต้องยิงเครือข่ายเลย ลดเวลาและลดโอกาสชน {{rate-limit}}",
        "หลักความปลอดภัย 3 ข้อของ `SQLiteResponseCache`: (1) ใช้ **parameterized query (`?`)** ทุกคำสั่ง SQL ห้ามต่อสตริงเอง, (2) เก็บคอลัมน์ `fetched_at` เพื่อตรวจอายุแคช (**TTL**), และ (3) **บันทึกเฉพาะ `FetchedRecord` ที่ผ่าน Pydantic validation แล้วเท่านั้น** — ห้ามแคช HTTP 500 หรือ JSON พังลงฐานข้อมูลเด็ดขาด",
      ],
      analogy:
        "เหมือนสมุดจดสูตรอาหารที่ชิมแล้วว่าอร่อยจริงพร้อมลงวันที่ — ก่อนจะออกไปซื้อวัตถุดิบมาลองทำใหม่ ให้เปิดสมุดดูก่อนว่ายังไม่หมดอายุ (`TTL`) และจดลงสมุดเฉพาะจานที่ทำสำเร็จแล้วเท่านั้น",
      code: {
        language: "python",
        filename: "sqlite_cache.py",
        code: `import sqlite3
import time
from pathlib import Path


class SQLiteResponseCache:
    def __init__(self, db_path: Path, ttl_s: int = 3600) -> None:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.db_path = db_path
        self.ttl_s = ttl_s
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS response_cache (
                    cache_key TEXT PRIMARY KEY,
                    payload_json TEXT NOT NULL,
                    fetched_at REAL NOT NULL
                )
                """
            )

    def get(self, key: str, now: float | None = None) -> str | None:
        current = time.time() if now is None else now
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload_json, fetched_at FROM response_cache WHERE cache_key = ?",
                (key,),
            ).fetchone()
        if row is None:
            return None
        payload_json, fetched_at = row
        if self.ttl_s > 0 and (current - fetched_at) > self.ttl_s:
            return None
        return payload_json

    def set(self, key: str, payload_json: str, now: float | None = None) -> None:
        current = time.time() if now is None else now
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO response_cache (cache_key, payload_json, fetched_at)
                VALUES (?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    fetched_at = excluded.fetched_at
                """,
                (key, payload_json, current),
            )`,
        caption: "ใช้ `INSERT ... ON CONFLICT DO UPDATE` (Upsert) และ `?` placeholders เพื่อความปลอดภัยและรองรับการอัปเดตแคชที่หมดอายุ",
      },
      whyTitle: "Why this matters — แคชบนดิสก์ช่วยลดค่า LLM API ใน Phase 3 ได้มหาศาล",
      whyParagraphs: [
        "รูปแบบ `SQLiteResponseCache` เดียวกันนี้สามารถนำคีย์เป็น hash ของ `(model, prompt)` ไปใช้แคชคำตอบจาก LLM หรือ embedding ใน Phase 3–4 ได้ทันที ช่วยประหยัดค่า API ระหว่างการทดลองซ้ำได้กว่า 70–90%",
        "การรับพารามิเตอร์ `now: float | None = None` ใน `get()` และ `set()` ยังทำให้เราทดสอบกรณีแคชหมดอายุ (TTL expiry) ใน `pytest` ได้ทันทีโดยไม่ต้อง `time.sleep` รอจริง",
      ],
    },
    {
      id: "structlog-metrics-and-mock-pytest",
      title: "3 · บันทึก Metrics ด้วย `structlog` และทดสอบครบทุกกรณีด้วย `pytest`",
      paragraphs: [
        "แทนที่จะพิมพ์ข้อความธรรมดาแบบ `print('done 10 items')` เราใช้ {{structlog}} บันทึก structured JSON event เช่น `logger.info('pipeline_completed', total=..., succeeded=..., quarantined=..., cache_hits=..., retries=...)` เพื่อให้ทั้งมนุษย์อ่านง่ายและระบบ monitoring เอาไปทำกราฟหรือแจ้งเตือนต่อได้",
        "สำหรับชุดเทสต์ {{pytest}} เป้าหมายของ Phase 1 Milestone คือ **รันออฟไลน์ได้ 100% และมี test coverage ≥ 90%** โดยต้องครอบคลุมอย่างน้อย 4 เส้นทางหลัก: (1) Happy path + เขียนแคช, (2) Second run = Cache Hit ไม่แตะ network, (3) 429/503 recovery ด้วย retry, และ (4) 404/invalid schema fail-fast โดยไม่ retry และไม่บันทึกลงแคช",
      ],
      analogy:
        "เหมือนกล่องดำของเครื่องบิน (`structlog`) คู่กับห้องจำลองการบิน (`pytest` + `MockTransport`) — คุณทดสอบพายุและเครื่องยนต์ดับในห้องจำลองจนมั่นใจก่อนขึ้นบินจริง และมีกล่องดำบันทึกตัวเลขทุกเที่ยวบิน",
      bullets: [
        "**`cache_hits`** — นับจำนวนรายการที่ได้คำตอบจาก SQLite cache โดยไม่ต้องยิง `httpx`",
        "**`retries`** — นับจำนวนครั้งที่ต้องลองใหม่จาก `429`/`5xx`/timeout เพื่อจับสัญญาณว่าปลายทางเริ่มไม่เสถียร",
        "**`quarantined`** — นับจำนวนรายการที่พังและถูกแยกไว้ใน `quarantine.jsonl`",
        "**`tmp_path` fixture** — แยกไฟล์ SQLite และ JSONL ของแต่ละเทสต์ออกจากกัน ไม่ทิ้งไฟล์ขยะใน repo",
      ],
      whyTitle: "Why this matters — เทสต์ที่ต้องพึ่งอินเทอร์เน็ตคือเทสต์ที่พังใน CI",
      whyParagraphs: [
        "ถ้าชุดเทสต์ยิงไปที่เว็บจริงภายนอก เมื่อเว็บนั้นช้า ล่ม หรือเปลี่ยนข้อมูล CI ของคุณจะแดงทั้งที่โค้ดไม่ได้ผิดอะไรเลย (flaky tests)",
        "การใช้ `httpx.MockTransport` + `tmp_path` + `wait_none()` ทำให้ชุดเทสต์ทั้งหมดทำซ้ำได้ 100% (deterministic) และรันจบภายในไม่กี่ร้อยมิลลิวินาที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ tenacity + SQLite Cache + structlog กับฝั่ง JS/TS",
      body: [
        "ชุดเครื่องมือเสริมเกราะ Production ใน Python วางชั้นการทำงานตรงกับ stack ของ Node.js/TypeScript ที่คุณคุ้นเคย:",
      ],
      table: [
        ["`tenacity.AsyncRetrying` + `wait_exponential_jitter`", "`p-retry` / `cockatiel` retry policy + jitter"],
        ["`sqlite3` + parameterized `?` + TTL", "`better-sqlite3` / Redis TTL cache"],
        ["`structlog` JSON renderer", "`pino` / `winston` structured JSON logger"],
        ["`pytest` + `tmp_path` + `httpx.MockTransport`", "`vitest` + temp dir + `msw` / `undici MockAgent`"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมในเทสต์จึงส่ง `wait_none()` แทนการรอ Backoff จริง",
      body: [
        "ใน production เราอยากให้ระบบรอ 0.5s → 1s → 2s ก่อนยิงซ้ำเพื่อลดภาระเซิร์ฟเวอร์ แต่ใน unit test เราแค่ต้องการพิสูจน์ว่า **กลไก retry ทำงานครบตามจำนวนครั้งและหยุดเมื่อสำเร็จหรือเจอ 404**",
        "การฉีด `wait_none()` เข้าไปตอนรัน `pytest` ทำให้เทสต์วิ่งผ่านใน 0.05 วินาทีแทนที่จะต้องนั่งรอ 10 วินาทีต่อเคส ส่งผลให้คุณอยากรันเทสต์บ่อย ๆ ทุกครั้งที่แก้โค้ด",
      ],
    },
  },

  workedExample: {
    intro:
      "มาดูการทำงานร่วมกันของ **Cache Lookup → Retryable Fetch → Pydantic Validation → Save Cache → structlog Summary** ผ่านสคริปต์เดียวที่จำลองทั้ง 429 recovery, 404 fail-fast และ cache hit ในรอบที่สอง",
    steps: [
      {
        title: "1 · ผสาน `SQLiteResponseCache` เข้ากับ `fetch_one_resilient`",
        explain:
          "ตรวจแคชก่อนเสมอ: ถ้าเจอและยังไม่หมดอายุให้คืน `FetchedRecord(..., source='cache')` ทันทีโดยไม่แตะ `httpx` ถ้าไม่เจอค่อยยิงผ่าน `AsyncRetrying` + `Semaphore` และบันทึกแคชหลัง validate ผ่านแล้วเท่านั้น",
        code: {
          language: "python",
          filename: "worked_d031.py",
          code: `import asyncio
import sqlite3
import time
from pathlib import Path
from typing import Literal
import httpx
import structlog
from pydantic import BaseModel, Field, ValidationError
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_none


class RetryableError(Exception):
    pass


class NonRetryableError(Exception):
    pass


class FetchedRecord(BaseModel):
    item_id: str = Field(min_length=3)
    title: str = Field(min_length=1)
    source: Literal["network", "cache"] = "network"


class SQLiteResponseCache:
    def __init__(self, db_path: Path, ttl_s: int = 3600) -> None:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.db_path = db_path
        self.ttl_s = ttl_s
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, ts REAL NOT NULL)"
            )

    def get(self, key: str) -> str | None:
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute("SELECT v, ts FROM cache WHERE k = ?", (key,)).fetchone()
        if not row or (self.ttl_s > 0 and time.time() - row[1] > self.ttl_s):
            return None
        return row[0]

    def set(self, key: str, value: str) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO cache (k, v, ts) VALUES (?, ?, ?) "
                "ON CONFLICT(k) DO UPDATE SET v = excluded.v, ts = excluded.ts",
                (key, value, time.time()),
            )`,
        },
        output: `# เตรียม SQLiteResponseCache และ Custom Exceptions เรียบร้อย`,
      },
      {
        title: "2 · เขียนตัวดึงข้อมูลที่แยก retryable vs non-retryable และคืนจำนวน retry",
        explain:
          "สังเกตว่า `async with sem:` อยู่ในบล็อก `with attempt:` เฉพาะตอนเรียก `client.get(url)` เพื่อไม่ให้ถือ semaphore ค้างระหว่างรอ backoff",
        code: {
          language: "python",
          filename: "worked_d031.py",
          code: `async def fetch_with_cache_and_retry(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    cache: SQLiteResponseCache,
    url: str,
    max_retries: int = 2,
) -> tuple[FetchedRecord | None, bool, int, str | None]:
    """คืน (record_or_none, cache_hit, retries, error_reason)"""
    cached = cache.get(url)
    if cached is not None:
        rec = FetchedRecord.model_validate_json(cached).model_copy(update={"source": "cache"})
        return rec, True, 0, None

    retries = 0
    try:
        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(max_retries + 1),
            wait=wait_none(),
            retry=retry_if_exception_type(RetryableError),
            reraise=True,
        ):
            with attempt:
                if attempt.retry_state.attempt_number > 1:
                    retries += 1
                async with sem:
                    resp = await client.get(url)
                if resp.status_code in (408, 429) or resp.status_code >= 500:
                    raise RetryableError(f"HTTP {resp.status_code}")
                if resp.status_code >= 400:
                    raise NonRetryableError(f"HTTP {resp.status_code}")
                record = FetchedRecord.model_validate(resp.json())
                cache.set(url, record.model_dump_json())
                return record, False, retries, None
    except (RetryableError, NonRetryableError, ValidationError, ValueError) as exc:
        return None, False, retries, str(exc)

    raise AssertionError("unreachable")`,
        },
        output: `# ผสาน Cache Lookup → Selective Retry → Validation → Cache Save สำเร็จ`,
      },
      {
        title: "3 · ทดสอบ Cold Run (429→200 & 404) ต่อด้วย Warm Run (Cache Hit) + `structlog`",
        explain:
          "รอบแรก URL `/doc/1` โดน 429 หนึ่งครั้งแล้วสำเร็จในรอบ retry (บันทึกลงแคช) ส่วน `/doc/404` ล้มเหลวทันทีด้วย 0 retries; พอวิ่งรอบสอง `/doc/1` ได้ cache hit โดยไม่แตะ network เลย",
        code: {
          language: "python",
          filename: "worked_d031.py",
          code: `structlog.configure(processors=[structlog.processors.JSONRenderer()])
log = structlog.get_logger()


async def demo() -> None:
    calls = {"/doc/1": 0, "/doc/404": 0}

    async def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        calls[path] += 1
        if path == "/doc/1" and calls[path] == 1:
            return httpx.Response(429, text="rate limited")
        if path == "/doc/1":
            return httpx.Response(200, json={"item_id": "DOC-1", "title": "คู่มือใช้งาน"})
        return httpx.Response(404, text="not found")

    cache = SQLiteResponseCache(Path("data/demo_cache.sqlite3"))
    sem = asyncio.Semaphore(2)
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        for run_no in (1, 2):
            r1 = await fetch_with_cache_and_retry(client, sem, cache, "https://mock.local/doc/1")
            r2 = await fetch_with_cache_and_retry(client, sem, cache, "https://mock.local/doc/404")
            log.info(
                "run_summary",
                run=run_no,
                doc1_source=r1[0].source if r1[0] else None,
                doc1_cache_hit=r1[1],
                doc1_retries=r1[2],
                doc404_retries=r2[2],
                network_calls=dict(calls),
            )


asyncio.run(demo())`,
        },
        output: `{"run": 1, "doc1_source": "network", "doc1_cache_hit": false, "doc1_retries": 1, "doc404_retries": 0, "network_calls": {"/doc/1": 2, "/doc/404": 1}, "event": "run_summary"}
{"run": 2, "doc1_source": "cache", "doc1_cache_hit": true, "doc1_retries": 0, "doc404_retries": 0, "network_calls": {"/doc/1": 2, "/doc/404": 2}, "event": "run_summary"}`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมาก: เก็บ HTTP response ดิบลง SQLite cache **ก่อน** ผ่าน `FetchedRecord.model_validate(...)` — ผลคือถ้าปลายทางส่ง JSON ผิด schema หรือหน้า 500 มาครั้งหนึ่ง ระบบจะแคชของเสียตัวนั้นไว้และพังซ้ำทุกรอบจนกว่าจะหมด TTL!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (15 นาที): สร้างโมดูล `resilient_fetcher.py` ที่รวม `SQLiteResponseCache`, `tenacity.AsyncRetrying` (selective retry 429/5xx/timeout), `asyncio.Semaphore`, `structlog` และเขียน `output.jsonl` / `quarantine.jsonl` พร้อมผ่านชุดเทสต์ offline ทั้งหมด",
    requirements: [
      "สร้าง `SQLiteResponseCache(db_path: Path, ttl_s: int = 3600)` ที่ใช้ parameterized SQL (`?`) มีเมธอด `get(key: str, now: float | None = None) -> str | None` และ `set(key: str, payload_json: str, now: float | None = None) -> None` รองรับ TTL expiry",
      "สร้าง `FetchTarget`, `FetchedRecord` (มี `source: Literal['network', 'cache'] = 'network'`), `QuarantineRecord` (`item_id`, `url`, `stage`, `reason`) และ `RunMetrics` (`total`, `succeeded`, `failed`, `cache_hits`, `retries`)",
      "สร้าง `async def run_resilient_batch(...) -> RunMetrics` ที่ตรวจ SQLite cache ก่อนยิง HTTP, ถ้า cache hit ให้เพิ่ม `cache_hits` และไม่แตะ network, ถ้า cache miss ให้ยิงผ่าน `tenacity.AsyncRetrying` โดย retry เฉพาะ `408`/`429`/`5xx`/`httpx.TimeoutException`/`httpx.TransportError` และ fail-fast ทันทีเมื่อเจอ `400`/`401`/`404`",
      "บันทึกข้อมูลลง `SQLiteResponseCache` เฉพาะรายการที่ผ่าน `FetchedRecord.model_validate(...)` แล้วเท่านั้น พร้อมเขียน `output.jsonl` และ `quarantine.jsonl` แบบ UTF-8",
      "บันทึก structured summary event ผ่าน `structlog` (`pipeline_finished` พร้อม `total`, `succeeded`, `failed`, `cache_hits`, `retries`) และรองรับการส่ง `wait_strategy` เข้ามาเพื่อให้เทสต์รันเร็วด้วย `wait_none()`",
    ],
    starter: {
      language: "python",
      filename: "resilient_fetcher.py",
      code: `import asyncio
import sqlite3
import time
from pathlib import Path
from typing import Literal
import httpx
import structlog
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter

logger = structlog.get_logger()


class RetryableFetchError(Exception):
    pass


class NonRetryableFetchError(Exception):
    pass


class FetchTarget(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    url: str


class FetchedRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    title: str = Field(min_length=1)
    category: Literal["faq", "policy", "ticket", "product"]
    body_th: str = Field(min_length=5)
    source: Literal["network", "cache"] = "network"


class QuarantineRecord(BaseModel):
    item_id: str
    url: str
    stage: Literal["fetch", "parse", "validate"]
    reason: str


class RunMetrics(BaseModel):
    total: int = Field(ge=0)
    succeeded: int = Field(ge=0)
    failed: int = Field(ge=0)
    cache_hits: int = Field(ge=0)
    retries: int = Field(ge=0)


class SQLiteResponseCache:
    def __init__(self, db_path: Path, ttl_s: int = 3600) -> None:
        # TODO: สร้างตาราง response_cache ด้วย parameterized SQL
        raise NotImplementedError

    def get(self, key: str, now: float | None = None) -> str | None:
        # TODO: อ่านจาก SQLite และตรวจ TTL
        raise NotImplementedError

    def set(self, key: str, payload_json: str, now: float | None = None) -> None:
        # TODO: บันทึกแบบ UPSERT ด้วย ? placeholders
        raise NotImplementedError


async def run_resilient_batch(
    targets: list[FetchTarget],
    client: httpx.AsyncClient,
    cache: SQLiteResponseCache,
    output_path: Path,
    quarantine_path: Path,
    *,
    max_concurrency: int = 3,
    max_retries: int = 2,
    wait_strategy=None,
) -> RunMetrics:
    # TODO: ผสาน Cache Lookup -> Semaphore + tenacity Retry -> Validation -> Save Cache -> JSONL + structlog
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_resilient_fetcher.py",
      code: `import asyncio
import json
from pathlib import Path
import httpx
from tenacity import wait_none
from resilient_fetcher import (
    FetchTarget,
    RunMetrics,
    SQLiteResponseCache,
    run_resilient_batch,
)


def test_sqlite_cache_ttl_expiry(tmp_path: Path):
    cache = SQLiteResponseCache(tmp_path / "cache.sqlite3", ttl_s=60)
    cache.set("https://mock.local/a", '{"ok": true}', now=1000.0)
    assert cache.get("https://mock.local/a", now=1030.0) == '{"ok": true}'
    assert cache.get("https://mock.local/a", now=1061.0) is None


def test_retry_429_failfast_404_and_cache_hit_on_second_run(tmp_path: Path):
    attempts: dict[str, int] = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        attempts[path] = attempts.get(path, 0) + 1
        if path == "/flaky":
            if attempts[path] <= 2:
                return httpx.Response(429, text="slow down")
            return httpx.Response(200, json={
                "item_id": "DOC-001",
                "title": "นโยบายการรับประกัน",
                "category": "policy",
                "body_th": "สินค้ารับประกันศูนย์ไทย 1 ปีเต็มทุกชิ้น",
            })
        if path == "/missing":
            return httpx.Response(404, text="not found")
        return httpx.Response(503, text="down")

    targets = [
        FetchTarget(item_id="DOC-001", url="https://mock.local/flaky"),
        FetchTarget(item_id="DOC-002", url="https://mock.local/missing"),
        FetchTarget(item_id="DOC-003", url="https://mock.local/always-503"),
    ]
    cache = SQLiteResponseCache(tmp_path / "cache.sqlite3", ttl_s=3600)
    out_p = tmp_path / "output.jsonl"
    q_p = tmp_path / "quarantine.jsonl"

    async def run_once() -> RunMetrics:
        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport) as client:
            return await run_resilient_batch(
                targets,
                client,
                cache,
                out_p,
                q_p,
                max_concurrency=2,
                max_retries=2,
                wait_strategy=wait_none(),
            )

    # รอบที่ 1: /flaky สำเร็จหลัง retry 2 ครั้ง, /missing fail-fast (0 retry), /always-503 retry 2 ครั้งแล้วยอมแพ้
    m1 = asyncio.run(run_once())
    assert m1 == RunMetrics(total=3, succeeded=1, failed=2, cache_hits=0, retries=4)
    assert attempts["/flaky"] == 3
    assert attempts["/missing"] == 1
    assert attempts["/always-503"] == 3

    # รอบที่ 2: /flaky ต้องได้ cache hit (จำนวน call ไม่เพิ่ม!)
    m2 = asyncio.run(run_once())
    assert m2.cache_hits == 1
    assert m2.succeeded == 1
    assert m2.failed == 2
    assert attempts["/flaky"] == 3  # ไม่ยิง network ซ้ำ!

    saved_ok = json.loads(out_p.read_text(encoding="utf-8").strip())
    assert saved_ok["source"] == "cache"
    assert saved_ok["item_id"] == "DOC-001"
`,
    },
    selfCheck: [
      "`SQLiteResponseCache` คืน `None` เมื่อเวลาผ่านไปเกิน `ttl_s` โดยไม่ต้อง `time.sleep`",
      "URL ที่ตอบ `429` สองครั้งแรกแล้วตอบ `200` ในครั้งที่ 3 สำเร็จพร้อมนับ `retries == 2`",
      "URL ที่ตอบ `404` ถูกยิงเพียง **1 ครั้ง** (`retries == 0`) และไม่ถูกเก็บลง SQLite cache",
      "การรันรอบที่ 2 ได้ `cache_hits == 1`, `source == 'cache'` และจำนวน network call ของ `/flaky` ไม่เพิ่มขึ้น",
      "รัน `uv run pytest --cov=resilient_fetcher -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance: "ผ่านเทสต์ทั้งหมดด้วย `uv run pytest -W error -q` (coverage ≥ 90%) และ `uv run ruff check .` สะอาด 0 error",
    hints: [
      {
        body: "นับจำนวน retry ภายในลูป `AsyncRetrying` ด้วย `if attempt.retry_state.attempt_number > 1: retries += 1` เพื่อให้พยายามครั้งแรกไม่ถูกนับเป็น retry",
      },
      {
        body: "ใน `run_resilient_batch` เมื่อได้ `cached_json = cache.get(target.url)` ที่ไม่ใช่ `None` ให้ parse ด้วย `FetchedRecord.model_validate_json(cached_json).model_copy(update={'source': 'cache'})` แล้วคืนทันทีพร้อม `cache_hit=True, retries=0`",
      },
      {
        body: "โค้ด `SQLiteResponseCache` พร้อมแล้ว เหลือเชื่อม `AsyncRetrying` กับการเขียน JSONL และเรียก `logger.info('pipeline_finished', **metrics.model_dump())`",
        code: {
          language: "python",
          filename: "hint-d031-l3.py",
          code: `class SQLiteResponseCache:
    def __init__(self, db_path: Path, ttl_s: int = 3600) -> None:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.db_path = db_path
        self.ttl_s = ttl_s
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS response_cache (
                    cache_key TEXT PRIMARY KEY,
                    payload_json TEXT NOT NULL,
                    fetched_at REAL NOT NULL
                )
                """
            )

    def get(self, key: str, now: float | None = None) -> str | None:
        current = time.time() if now is None else now
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute(
                "SELECT payload_json, fetched_at FROM response_cache WHERE cache_key = ?",
                (key,),
            ).fetchone()
        if row is None:
            return None
        payload_json, fetched_at = row
        if self.ttl_s > 0 and (current - fetched_at) > self.ttl_s:
            return None
        return payload_json

    def set(self, key: str, payload_json: str, now: float | None = None) -> None:
        current = time.time() if now is None else now
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO response_cache (cache_key, payload_json, fetched_at)
                VALUES (?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    fetched_at = excluded.fetched_at
                """,
                (key, payload_json, current),
            )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -W error --cov=resilient_fetcher --cov-report=term-missing -v
uv run ruff check .`,
      caption: "ดูบรรทัดที่ยังไม่ได้รับการทดสอบด้วย `--cov-report=term-missing` เพื่อดัน coverage ให้ถึง ≥ 90%",
    },
  },

  mistakes: [
    {
      title: "ตั้ง `retry=retry_if_exception_type(Exception)` แบบกวาดหมดทุก error",
      symptom: "HTTP 400, 401, 404 และแม้แต่ `ValidationError` ถูกยิงซ้ำ 3–4 รอบโดยไม่มีทางสำเร็จ สิ้นเปลืองเวลาและโควตา API",
      fix: "กำหนด exception เฉพาะ `RetryableFetchError` สำหรับ `408`/`429`/`5xx`/timeout และตั้ง `retry_if_exception_type(RetryableFetchError)` เท่านั้น",
    },
    {
      title: "ใช้ `wait_exponential` โดยไม่มี Jitter เมื่อรันหลาย worker พร้อมกัน",
      symptom: "เมื่อ API สะดุด ทุก coroutine ตื่นขึ้นมายิงซ้ำพร้อมกันในวินาทีเดียวกัน (Thundering Herd) จนปลายทางล่มซ้ำ",
      fix: "ใช้ `wait_exponential_jitter(initial=..., max=...)` ของ `tenacity` เพื่อสุ่มกระจายจังหวะยิงซ้ำ",
    },
    {
      title: "ต่อสตริง URL เข้าไปใน SQL โดยตรง (`f\"WHERE cache_key = '{key}'\"`)",
      symptom: "เสี่ยง SQL Injection และพังทันทีเมื่อ URL มีเครื่องหมาย single quote (`'`)",
      fix: "ใช้ parameterized query (`?` พร้อม tuple `(key,)`) ในทุกคำสั่ง `sqlite3` เสมอ",
    },
    {
      title: "บันทึกผลลัพธ์ลง SQLite cache ก่อนตรวจสอบด้วย Pydantic",
      symptom: "ข้อมูลพังหรือ error payload ถูกแคชไว้เป็นผลลัพธ์ถาวรจนกว่าจะหมด TTL",
      fix: "เรียก `cache.set(...)` หลัง `FetchedRecord.model_validate(...)` ผ่านแล้วเท่านั้น",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อตรวจความแม่นยำเรื่อง Selective Retry, SQLite Cache, structlog และ Offline Testing",
    questions: [
      mc(
        "d031-q1",
        "เมื่อตั้งค่า `max_retries=2` (รวมยิงสูงสุด 3 ครั้ง) แล้วยิง 2 URL: `/flaky` (ตอบ 429 สองครั้งแล้วตอบ 200) กับ `/missing` (ตอบ 404) จำนวน network call และ `retries` ที่ถูกต้องคือข้อใด?",
        [
          ["`/flaky` 3 ครั้ง (`retries=2`), `/missing` 3 ครั้ง (`retries=2`)", "ผิด — `404` เป็น non-retryable error ต้องหยุดตั้งแต่ครั้งแรก"],
          ["`/flaky` 3 ครั้ง (`retries=2`), `/missing` 1 ครั้ง (`retries=0`)", "ถูก — `429` retry จนสำเร็จในครั้งที่ 3 ส่วน `404` fail-fast ทันทีโดยไม่ retry"],
          ["`/flaky` 1 ครั้ง (`retries=0`), `/missing` 1 ครั้ง (`retries=0`)", "ผิด — `429` เป็น transient error ที่ควร retry"],
          ["`/flaky` 2 ครั้ง (`retries=1`), `/missing` 0 ครั้ง (`retries=0`)", "ต้องยิง `/missing` 1 ครั้งก่อนถึงจะรู้ว่าเป็น `404` และ `/flaky` ต้องยิงถึงครั้งที่ 3 ถึงจะได้ `200`"],
        ],
        "B",
        "Selective retry จะลองใหม่เฉพาะ `408`/`429`/`5xx`/timeout และ fail-fast ทันทีเมื่อเจอ `400`/`401`/`404`",
        "เมื่อตั้ง `max_retries=2` จะยิง HTTP สูงสุดกี่ครั้งสำหรับ `429` และกี่ครั้งสำหรับ `404`?",
        "สำหรับ `429`: สูงสุด 3 ครั้ง (ครั้งแรก + 2 retries) | สำหรับ `404`: 1 ครั้งถ้วน (0 retries)",
      ),
      mc(
        "d031-q2",
        "เหตุใดจึงควรเรียก `cache.set(url, record.model_dump_json())` **หลัง** จาก `FetchedRecord.model_validate(...)` ผ่านแล้วเท่านั้น?",
        [
          ["เพราะ `sqlite3` ไม่สามารถเก็บข้อความ JSON ดิบได้", "`sqlite3` เก็บข้อความอะไรก็ได้ในคอลัมน์ `TEXT`"],
          ["เพื่อป้องกันไม่ให้ข้อมูลพังหรือ HTTP error payload ถูกแคชไว้และส่งต่อความผิดพลาดซ้ำในรอบถัดไป", "ถูก — Cache ควรเก็บเฉพาะข้อมูลที่ผ่านสัญญาแล้ว (known-good data) เพื่อไม่ให้เกิด cache poisoning"],
          ["เพราะ `tenacity` บังคับให้เรียก `cache.set` หลัง validate เสมอ", "`tenacity` ไม่ได้บังคับ แต่เป็นหลักออกแบบ cache hygiene"],
          ["เพื่อให้ `cache.get` ทำงานเร็วขึ้น 10 เท่า", "ความเร็ว lookup ใกล้เคียงกัน ประโยชน์หลักคือความถูกต้องของข้อมูลในแคช"],
        ],
        "B",
        "การแคชเฉพาะข้อมูลที่ผ่าน Pydantic validation แล้วช่วยป้องกัน cache poisoning และรับประกันว่าทุก cache hit คือข้อมูลสะอาดพร้อมใช้",
        "ทำไมห้ามบันทึก response ลง SQLite cache ก่อนผ่าน Pydantic validation?",
        "เพื่อป้องกัน cache poisoning ที่ทำให้ข้อมูลเสียหรือ error payload ถูกส่งกลับซ้ำ ๆ จนกว่าจะหมด TTL",
      ),
      mc(
        "d031-q3",
        "เหตุใดใน `AsyncRetrying` จึงควรใช้ `wait_exponential_jitter` แทน `wait_fixed(1)` เมื่อมี 20 coroutines ทำงานพร้อมกัน?",
        [
          ["เพราะ `wait_fixed` ใช้กับฟังก์ชัน `async def` ไม่ได้", "`wait_fixed` ใช้กับ async ได้ แต่เสี่ยงเกิด Thundering Herd"],
          ["เพื่อเพิ่มระยะเวลารอแบบทวีคูณพร้อมสุ่มกระจายจังหวะ ลดโอกาสที่ทุก coroutine จะยิงถล่มเซิร์ฟเวอร์พร้อมกันซ้ำอีกครั้ง", "ถูก — Exponential backoff + jitter คือมาตรฐานอุตสาหกรรมสำหรับการรับมือ rate limit และ outage"],
          ["เพื่อยกเลิกการใช้ `asyncio.Semaphore`", "ยังต้องใช้ `Semaphore` คุมเพดาน concurrency เช่นเดิม"],
          ["เพื่อให้ชุดเทสต์ `pytest` รันเร็วขึ้นโดยไม่ต้องใช้ `wait_none()`", "ในเทสต์ยังคงควรส่ง `wait_none()` เพื่อความเร็วสูงสุด"],
        ],
        "B",
        "Jitter เพิ่มค่าสุ่มเล็กน้อยในเวลารอของแต่ละ coroutine ทำให้คำขอไม่กรูกลับไปชน API พร้อมกันในเสี้ยววินาทีเดียวกัน",
        "Jitter ใน Exponential Backoff ช่วยแก้ปัญหาใดในระบบ async?",
        "ช่วยกระจายจังหวะการยิงซ้ำของหลาย coroutines ไม่ให้พุ่งชนเซิร์ฟเวอร์พร้อมกัน (Thundering Herd)",
      ),
      mc(
        "d031-q4",
        "ในชุดเทสต์ `test_sqlite_cache_ttl_expiry` เหตุใดการออกแบบ `cache.get(key, now=...)` ให้รับพารามิเตอร์เวลาได้จึงดีกว่าการใช้ `time.sleep(61)` ในเทสต์?",
        [
          ["เพราะ `pytest` ไม่อนุญาตให้เรียก `time.sleep` ในไฟล์เทสต์", "เรียกได้ แต่จะทำให้ชุดเทสต์ช้ามาก"],
          ["ทำให้ทดสอบการหมดอายุ TTL ได้แม่นยำในไม่กี่มิลลิวินาทีและทำซ้ำได้ 100% โดยไม่ต้องรอเวลาจริง", "ถูก — การฉีดเวลา (clock injection) ทำให้ unit test ทั้งเร็วและไม่แกว่ง (deterministic)"],
          ["เพราะ `sqlite3` ไม่รองรับฟังก์ชัน `time.time()`", "`sqlite3` ทำงานร่วมกับ `time.time()` ได้ตามปกติ"],
          ["เพราะ `time.sleep` ทำให้ไฟล์ SQLite เสียหาย", "`time.sleep` ไม่ทำให้ไฟล์เสีย แต่ทำให้ CI ช้าลงโดยไม่จำเป็น"],
        ],
        "B",
        "การฉีดพารามิเตอร์ `now` (หรือ mock clock) คือรูปแบบ testability ที่ช่วยให้ทดสอบเงื่อนไขเวลา เช่น TTL 1 ชั่วโมง ได้ใน 0.001 วินาที",
        "ทำไมการส่ง `now: float | None = None` เข้าเมธอดของ Cache จึงช่วยให้เขียนเทสต์ TTL ได้ดีกว่า `time.sleep`?",
        "ทดสอบกรณีหมดอายุได้ทันทีในไม่กี่มิลลิวินาทีแบบ deterministic โดยไม่ต้องนั่งรอเวลาจริง",
      ),
    ],
  },

  takeaways: [
    "ใช้ `tenacity.AsyncRetrying` กับ `wait_exponential_jitter` และ `retry_if_exception_type(RetryableFetchError)` เพื่อ retry เฉพาะ `408`/`429`/`5xx`/timeout และ fail-fast ทันทีกับ `4xx`",
    "วาง `SQLiteResponseCache` ไว้หน้าด่านเครือข่าย ใช้ parameterized SQL (`?`) + TTL และบันทึกเฉพาะข้อมูลที่ผ่าน Pydantic validation แล้วเท่านั้น",
    "ปล่อย `asyncio.Semaphore` ระหว่างช่วงนอนรอ backoff โดยครอบเฉพาะบรรทัด `await client.get(...)` ภายในแต่ละ attempt",
    "เก็บ telemetry (`cache_hits`, `retries`, `succeeded`, `failed`) ผ่าน `structlog` และทดสอบทุก failure path แบบออฟไลน์ 100% ด้วย `httpx.MockTransport` + `tmp_path` + `wait_none()`",
  ],

  reviewCards: [
    rc(
      "d031-rc-1",
      "ลำดับการทำงานที่ถูกต้องของ 1 รายการใน Resilient Fetcher ที่รวม Cache, Retry และ Validation คืออะไร?",
      "1) Cache Lookup (ถ้า hit คืน `source='cache'`) → 2) Selective Retry (`429`/`5xx`/timeout) ภายใต้ Semaphore → 3) Pydantic Validation → 4) Save ลง SQLite Cache → 5) เขียน JSONL",
    ),
    rc(
      "d031-rc-2",
      "ทำไมใน `AsyncRetrying` จึงไม่ควรครอบ `async with semaphore:` ไว้นอกลูปรอ backoff?",
      "เพราะจะกักสล็อต concurrency ค้างไว้เฉย ๆ ระหว่างที่ coroutine กำลังนอนรอ backoff ทำให้ task อื่นวิ่งไม่ได้",
    ),
    rc(
      "d031-rc-3",
      "3 เครื่องมือสำคัญที่ทำให้ชุดเทสต์ `pytest` ของ async HTTP fetcher รันออฟไลน์ได้เร็วและนิ่ง 100% คืออะไร?",
      "`httpx.MockTransport` (จำลอง response/error), `tmp_path` fixture (แยก SQLite/JSONL ต่อเทสต์) และ `wait_none()` / clock injection (ไม่ต้องรอเวลาจริง)",
    ),
  ],

  sources: [
    { label: "Tenacity Documentation — Async and Retry Strategies", href: "https://tenacity.readthedocs.io/en/latest/#async-and-retry" },
    { label: "Python 3 Official Docs — sqlite3 DB-API 2.0 Interface", href: "https://docs.python.org/3/library/sqlite3.html" },
    { label: "structlog Official Documentation — Structured Logging for Python", href: "https://www.structlog.org/en/stable/" },
    { label: "pytest Documentation — Temporary Directories (`tmp_path`)", href: "https://docs.pytest.org/en/stable/how-to/tmp_path.html" },
  ],

  glossary: [
    "exponential-backoff",
    "rate-limit",
    "fail-fast",
    "sqlite",
    "caching",
    "structlog",
    "pytest",
    "mocking",
  ],
});
