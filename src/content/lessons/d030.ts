import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D030 — Phase 1 / Block B08
 * Build Async Ingestion & Validation Pipeline (httpx.AsyncClient + Semaphore + Pydantic Quarantine + JSONL).
 */
export const d030: Lesson = defineLesson({
  day: 30,
  titleTh: "สร้างท่อ Async Ingestion & Validation พร้อม Semaphore และไฟล์ Quarantine",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · ต่อท่อ httpx.AsyncClient + asyncio.Semaphore + Pydantic validation และเขียน output.jsonl แยกจาก quarantine.jsonl",
  icon: "workflow",
  visual: {
    id: "phase1-capstone-arch",
    title: "ต่อท่อ Async Ingestion + Bounded Semaphore + Pydantic Quarantine",
    caption:
      "ดูการดึงข้อมูลขนานพร้อมแยก record ที่ผ่านลง output.jsonl และ record ที่พังลง quarantine.jsonl",
    alt: "แผนภาพท่อ async ingestion และ quarantine สำหรับข้อมูลไม่สมบูรณ์",
  },
  requiresApiKey: false,
  tools: ["asyncio", "httpx", "Pydantic v2", "pathlib", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ดึงข้อมูลจำนวนมากอย่างมีวินัยและไม่ทำ API ปลายทางล่ม",
      body: "การยิง HTTP แบบขนานโดยไม่จำกัดจำนวนงานพร้อมกันอาจถูกปลายทางบล็อกทันที ขณะที่การยิงทีละรายการก็ช้าเกินไปสำหรับชุดข้อมูลหลักพันรายการ",
      lessonNote:
        "วันนี้เราต่อ `httpx.AsyncClient` เข้ากับ {{semaphore|asyncio.Semaphore}} เพื่อคุมจำนวนงาน in-flight ให้วิ่งเร็วอย่างปลอดภัย",
    },
    {
      node: 2,
      heading: "คัดกรองข้อมูลสะอาดก่อนส่งต่อให้โมเดลและ Pipeline ถัดไป",
      body: "ข้อมูลดิบจากปลายทางอาจมีบางรายการขาดฟิลด์ ชนิดข้อมูลผิด หรือไม่ใช่ JSON หากหลุดไปถึงขั้นฝึกโมเดลหรือทำ RAG จะสร้างบั๊กที่ตามแก้ยาก",
      lessonNote:
        "ทุกรายการต้องผ่านด่าน {{pydantic}} — ของดีลง `output.jsonl` ส่วนของเสียถูกกักไว้ใน `quarantine.jsonl` โดยไม่หยุด batch",
    },
    {
      node: 4,
      heading: "จัดการ Resource Lifecycle ของ HTTP Client และไฟล์อย่างถูกต้อง",
      body: "การเปิด connection pool ค้างไว้หรือเปิดไฟล์โดยไม่ระบุ UTF-8 คือสาเหตุคลาสสิกของหน่วยความจำรั่วและภาษาไทยเพี้ยนข้ามระบบปฏิบัติการ",
      lessonNote:
        "เราใช้ `async with httpx.AsyncClient(...)` แชร์ connection pool เดียวทั้ง batch และเขียน {{jsonl}} ด้วย {{pathlib}} แบบ UTF-8",
    },
    {
      node: 5,
      heading: "ตรวจสอบย้อนหลังได้ครบทุกรายการผ่าน Quarantine และ Summary",
      body: "เมื่อท่อรันจบ ทีมต้องเห็นทันทีว่ากี่รายการสำเร็จ กี่รายการพัง และพังที่ขั้นตอน `fetch`, `parse` หรือ `validate`",
      lessonNote:
        "ท่อวันนี้คืน `RunSummary` ที่รับประกันยอดตรงเป๊ะ พร้อมเตรียมจุดเชื่อมสำหรับเพิ่ม retry และ SQLite cache ใน Day 31",
    },
  ],

  objectives: [
    "**ประกอบท่อ Async Ingestion** ด้วย `httpx.AsyncClient` ที่แชร์ connection pool ร่วมกับ {{semaphore|asyncio.Semaphore}} เพื่อคุมเพดาน concurrency อย่างแม่นยำ",
    "**จัดการ Partial Failure ด้วย Quarantine Pattern** — ดักข้อผิดพลาดแยกตามขั้นตอน (`fetch` / `parse` / `validate`) เพื่อให้รายการที่พังไม่ทำลาย batch ที่เหลือ",
    "**เขียนผลลัพธ์แบบ Streaming {{jsonl}}** ด้วย {{pathlib}} (`encoding='utf-8'`) แยก `output.jsonl` และ `quarantine.jsonl` พร้อมทดสอบแบบออฟไลน์ 100% ด้วย `httpx.MockTransport`",
  ],

  prerequisites: [
    "ผ่าน Day 29 (เข้าใจ `FetchTarget`, `FetchedRecord`, `QuarantineRecord`, `RunSummary`) หรือพร้อมใช้โมเดลเดียวกัน",
    "เข้าใจพื้นฐาน `asyncio`, `Semaphore`, `httpx.AsyncClient` และ `pathlib` จาก Block B02, B04 และ B05",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — จำลอง HTTP server ด้วย `httpx.MockTransport` บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "ทำงานต่อในโปรเจกต์ `resilient-fetcher` จาก Day 29 (หรือสร้างโฟลเดอร์ใหม่ด้วย {{uv}}) โดยตรวจว่ามี `httpx`, `pydantic`, `pytest` และ `ruff` พร้อมใช้งาน",
    commands: `# กรณีเริ่มโฟลเดอร์ใหม่สำหรับ Day 30 (ข้ามได้ถ้าทำต่อใน resilient-fetcher)
uv init ai-day30-pipeline && cd ai-day30-pipeline
uv add httpx pydantic
uv add --dev pytest ruff

# ตรวจเวอร์ชันเครื่องมือ
uv run python -c "import httpx, pydantic; print('httpx:', httpx.__version__, '| pydantic:', pydantic.__version__)"`,
    steps: [
      ["dir", "เข้าโฟลเดอร์ `resilient-fetcher` จาก Day 29 หรือสร้างโฟลเดอร์ `ai-day30-pipeline`"],
      ["deps", "ยืนยันว่าติดตั้ง `httpx`, `pydantic`, `pytest` และ `ruff` ครบแล้ว"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน `httpx` และ `pydantic` ผ่าน `uv run python` สำเร็จ"],
    ],
    note: "ทุกตัวอย่างและชุดเทสต์ในบทนี้ใช้ `httpx.MockTransport` จึงรันได้แม้ปิด Wi-Fi และจบภายในไม่ถึง 1 วินาที",
  },

  concepts: [
    {
      id: "bounded-async-ingestion",
      title: "1 · แชร์ `httpx.AsyncClient` หนึ่งตัว + คุมเพดานด้วย `asyncio.Semaphore`",
      paragraphs: [
        "เมื่อต้องดึงข้อมูล 200 URL พร้อมกัน ข้อผิดพลาดแรกของมือใหม่คือสร้าง `async with httpx.AsyncClient()` **ข้างใน** ฟังก์ชัน `fetch_one` ทำให้เปิด–ปิด TCP/TLS connection ใหม่ 200 รอบ ช้าและสิ้นเปลือง socket แทนที่จะเปิด `AsyncClient` **ครั้งเดียวข้างนอก** แล้วส่งเข้าทุก task เพื่อใช้ HTTP connection pooling ร่วมกัน",
        "ข้อผิดพลาดที่สองคือปล่อย `asyncio.gather` ยิง 200 คำขอพร้อมกันโดยไม่มีตัวกั้น — ซึ่งจะชน {{rate-limit}} หรือทำให้เซิร์ฟเวอร์ปลายทางปฏิเสธการเชื่อมต่อ การครอบเฉพาะช่วงยิง HTTP ด้วย `async with semaphore:` จะจำกัดจำนวนคำขอที่วิ่งอยู่ในเวลาเดียวกันไม่ให้เกิน `max_concurrency` (เช่น 5 หรือ 10)",
      ],
      analogy:
        "เหมือนด่านเก็บค่าผ่านทางที่มี 5 ช่อง (`Semaphore(5)`) และใช้บัตรผ่านร่วมกัน (Connection Pool) — รถ 200 คันไม่ต้องต่อแถวทีละคันเหมือน sync และไม่พุ่งชนพร้อมกัน 200 คันจนด่านพัง",
      code: {
        language: "python",
        filename: "bounded_fetch.py",
        code: `import asyncio
import httpx


async def fetch_raw_json(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    url: str,
) -> dict:
    # ถือ semaphore เฉพาะช่วงรอเครือข่าย — ปล่อยทันทีที่ได้ response
    async with semaphore:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()`,
        caption: "แชร์ `client` ใบเดียวทั้ง batch และถือ `semaphore` เฉพาะช่วง Network I/O",
      },
      whyTitle: "Why this matters — ถือ Semaphore ให้สั้นที่สุดเท่าที่จำเป็น",
      whyParagraphs: [
        "หากคุณนำขั้นตอนประมวลผลหนักหรือเขียนไฟล์ไปใส่ไว้ **ข้างใน** บล็อก `async with semaphore:` ช่องทางเครือข่ายจะถูกกักไว้โดยเปล่าประโยชน์",
        "การปล่อย `semaphore` ทันทีที่ได้ HTTP response แล้วค่อยส่งข้อมูลไป validate กับ {{pydantic}} ด้านนอก ทำให้ throughput สูงสุดภายใต้เพดาน concurrency เดิม",
      ],
    },
    {
      id: "fault-isolation-quarantine",
      title: "2 · Fault Isolation & Quarantine Pattern: ของพัง 1 ชิ้นห้ามล้มทั้ง Batch",
      paragraphs: [
        "ในโลกจริง หากดึง 50 รายการ มักเจอความผิดพลาดได้ 3 จุดต่างกัน: (1) **stage=`fetch`** เช่น HTTP 404/500 หรือ `httpx.TimeoutException`, (2) **stage=`parse`** เมื่อปลายทางส่ง HTML หรือ JSON พังจน `response.json()` โยน `ValueError` และ (3) **stage=`validate`** เมื่อ JSON อ่านได้แต่โครงสร้างผิด {{schema}} จน Pydantic โยน {{validation-error}}",
        "แทนที่จะปล่อยให้ exception หลุดไปล้ม `asyncio.gather(...)` ทั้งชุด เราออกแบบฟังก์ชัน `process_target` ให้ดักความผิดพลาดทั้ง 3 ขั้นภายในตัวมันเอง แล้วคืนผลลัพธ์แบบชัดเจนว่าเป็น `FetchedRecord` หรือ `QuarantineRecord` เสมอ — ทำให้ทุก task จบลงอย่างสงบและนับยอดได้ครบ 100%",
      ],
      analogy:
        "เหมือนสายพานตรวจสินค้าที่มี 3 ด่าน: ด่านรับกล่อง (`fetch`), ด่านเปิดกล่อง (`parse`) และด่านตรวจคุณภาพ (`validate`) — ชิ้นไหนตกด่านไหนก็ติดป้ายเหตุผลแล้วแยกไปตะกร้าตรวจสอบ โดยสายพานหลักยังวิ่งต่อไม่หยุด",
      code: {
        language: "python",
        filename: "process_one.py",
        code: `import asyncio
import httpx
from pydantic import ValidationError


async def process_one(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    target: dict[str, str],
) -> tuple[str, dict]:
    """คืน ('ok', record_dict) หรือ ('quarantine', error_dict) โดยไม่ปล่อย exception ล้ม batch"""
    try:
        async with semaphore:
            resp = await client.get(target["url"])
        if resp.status_code >= 400:
            return "quarantine", {
                "item_id": target["item_id"],
                "url": target["url"],
                "stage": "fetch",
                "reason": f"HTTP {resp.status_code}",
            }
    except httpx.HTTPError as exc:
        return "quarantine", {
            "item_id": target["item_id"],
            "url": target["url"],
            "stage": "fetch",
            "reason": f"{type(exc).__name__}: {exc}",
        }

    try:
        payload = resp.json()
    except ValueError as exc:
        return "quarantine", {
            "item_id": target["item_id"],
            "url": target["url"],
            "stage": "parse",
            "reason": f"Invalid JSON: {exc}",
        }

    try:
        # ในโค้ดจริงแทนที่ด้วย FetchedRecord.model_validate(...)
        if not isinstance(payload, dict) or "title" not in payload:
            raise ValueError("missing required field: title")
        return "ok", payload
    except (ValidationError, ValueError) as exc:
        return "quarantine", {
            "item_id": target["item_id"],
            "url": target["url"],
            "stage": "validate",
            "reason": str(exc),
        }`,
        caption: "แยก `try/except` ทีละขั้น (`fetch` → `parse` → `validate`) เพื่อระบุสาเหตุใน quarantine ได้ตรงจุด",
      },
      whyTitle: "Why this matters — ดีกว่า `gather(..., return_exceptions=True)` อย่างไร",
      whyParagraphs: [
        "การใช้ `return_exceptions=True` เฉย ๆ จะได้เพียงก้อน exception ดิบกลับมา โดยอาจไม่รู้ว่าเกิดกับ `item_id` หรือ `url` ไหนและอยู่ในขั้นตอนใดของท่อ",
        "การแปลงความผิดพลาดเป็น `QuarantineRecord` ภายใน `process_target` ทำให้ข้อมูลบริบท (`item_id`, `url`, `stage`, `reason`) อยู่ครบและพร้อม {{serialization|serialize}} ลงไฟล์ได้ทันที",
      ],
    },
    {
      id: "streaming-jsonl-writer",
      title: "3 · เขียนผลลัพธ์แบบ Streaming JSONL ด้วย `pathlib` และ UTF-8",
      paragraphs: [
        "เมื่อแต่ละ task ทำงานเสร็จด้วย `asyncio.as_completed(tasks)` เราไม่จำเป็นต้องรอให้ทั้ง 10,000 รายการเสร็จก่อนแล้วค่อยกักเก็บทุกอย่างไว้ใน RAM — แต่สามารถเขียนแต่ละ `FetchedRecord` ลง `output.jsonl` หรือ `QuarantineRecord` ลง `quarantine.jsonl` ทีละบรรทัดทันทีที่พร้อม",
        "สิ่งสำคัญสำหรับข้อมูลภาษาไทยบน Windows/Linux คือต้องระบุ `encoding='utf-8'` ทุกครั้งเมื่อเปิดไฟล์ผ่าน {{pathlib}} (`Path.open('w', encoding='utf-8')`), สร้างโฟลเดอร์ปลายทางล่วงหน้าด้วย `path.parent.mkdir(parents=True, exist_ok=True)` และใช้ `model.model_dump_json() + '\\n'`",
      ],
      analogy:
        "เหมือนแคชเชียร์ที่พิมพ์ใบเสร็จทีละใบลงกล่องทันทีที่ลูกค้าจ่ายเงิน แทนที่จะจำรายการลูกค้าทั้งวันไว้ในหัวแล้วค่อยเขียนตอนร้านปิด (ซึ่งเสี่ยงความจำเต็มหรือไฟดับแล้วหายหมด)",
      bullets: [
        "**`parent.mkdir(parents=True, exist_ok=True)`** — ป้องกัน `FileNotFoundError` เมื่อโฟลเดอร์ `data/` ยังไม่ถูกสร้าง",
        "**`encoding='utf-8'`** — ป้องกัน `UnicodeEncodeError` บน Windows เมื่อเนื้อหามีอักษรไทย",
        "**`model_dump_json()`** — ใน Pydantic v2 ได้ UTF-8 JSON แท้ที่อ่านภาษาไทยออกทันที ไม่ถูก escape เป็น `\\u0e...`",
        "**`asyncio.as_completed`** — รับผลทันทีที่แต่ละ task จบและเขียนลงไฟล์ทีละบรรทัด ลด peak memory ได้มาก",
      ],
      whyTitle: "Why this matters — ปูทางสู่ Dataset ขนาดใหญ่ใน Phase 2",
      whyParagraphs: [
        "ไฟล์ `output.jsonl` ที่สะอาดและเป็น UTF-8 100% จากท่อนี้สามารถนำไปอ่านเข้า `polars.read_ndjson()` หรือ `DuckDB` ใน Day 33–35 ได้ทันทีโดยไม่ต้องแปลงรูปแบบซ้ำ",
        "และไฟล์ `quarantine.jsonl` ที่มีโครงสร้างสม่ำเสมอสามารถนำมาวิเคราะห์หา root cause ของข้อมูลเสียได้ด้วยเครื่องมือชุดเดียวกัน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Async Ingestion + Quarantine กับ Node.js/TypeScript",
      body: [
        "รูปแบบนี้ตรงกับงาน ETL / ingestion worker ในฝั่ง Node.js ที่ใช้ concurrency limiter คู่กับ NDJSON stream:",
      ],
      table: [
        ["`asyncio.Semaphore(5)`", "`p-limit(5)` คุมจำนวน Promise ที่วิ่งพร้อมกัน"],
        ["`async with httpx.AsyncClient(timeout=5.0)`", "`undici.Agent` / shared HTTP keep-alive pool"],
        ["`asyncio.as_completed(tasks)`", "ทยอยรับผลเมื่อแต่ละ Promise resolve แล้วเขียนลง stream"],
        ["`output.jsonl` + `quarantine.jsonl`", "NDJSON output stream + Dead-Letter Queue (DLQ) file"],
        ["`httpx.MockTransport(handler)`", "`msw` หรือ `undici.MockAgent` สำหรับเทสต์ออฟไลน์"],
      ],
    },
    student: {
      title: "First-Year Note — `asyncio.gather` vs `asyncio.as_completed` ต่างกันอย่างไร",
      body: [
        "`asyncio.gather(*tasks)` จะรอให้ **ทุกงานเสร็จครบก่อน** แล้วคืนลิสต์ผลลัพธ์ตามลำดับเดิม — ใช้ง่ายเมื่อข้อมูลมีขนาดเล็กและอยากคงลำดับตรงเป๊ะ",
        "`asyncio.as_completed(tasks)` จะทยอยส่งผลลัพธ์ของงานที่ **เสร็จก่อน** ออกมาทีละชิ้นทันที — เหมาะมากกับท่อ streaming JSONL เพราะเขียนลงดิสก์ได้ทันทีและแสดงความคืบหน้า (progress) ให้ผู้ใช้เห็นได้แบบเรียลไทม์",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองต่อท่อ ingestion ครบวงจรด้วย `httpx.MockTransport` (รันออฟไลน์ได้ 100%) กับชุดข้อมูล 4 รายการที่มีทั้งของดีภาษาไทย, HTTP 404, JSON พัง และข้อมูลที่ผิด Pydantic schema",
    steps: [
      {
        title: "1 · นิยามโมเดลและจำลอง Mock API ด้วย `httpx.MockTransport`",
        explain:
          "สร้าง handler แบบ `async def` ที่จำลองความหน่วงเล็กน้อยและคืนผลลัพธ์ 4 แบบต่างกันเพื่อทดสอบทุกเส้นทางของท่อ",
        code: {
          language: "python",
          filename: "worked_d030.py",
          code: `import asyncio
from pathlib import Path
from typing import Literal
import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class FetchTarget(BaseModel):
    item_id: str
    url: str


class FetchedRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    title: str = Field(min_length=1)
    category: Literal["faq", "policy", "ticket", "product"]
    body_th: str = Field(min_length=5)


class QuarantineRecord(BaseModel):
    item_id: str
    url: str
    stage: Literal["fetch", "parse", "validate"]
    reason: str


async def mock_handler(request: httpx.Request) -> httpx.Response:
    await asyncio.sleep(0.05)  # จำลองความหน่วงเครือข่าย
    path = request.url.path
    if path == "/docs/1":
        return httpx.Response(200, json={
            "item_id": "DOC-001", "title": "วิธีเปลี่ยนที่อยู่จัดส่ง",
            "category": "faq", "body_th": "เข้าเมนูคำสั่งซื้อแล้วกดแก้ไขที่อยู่ก่อนจัดส่ง",
        })
    if path == "/docs/2":
        return httpx.Response(404, text="Not Found")
    if path == "/docs/3":
        return httpx.Response(200, text="<html>Gateway Error</html>")
    return httpx.Response(200, json={
        "item_id": "DOC-004", "title": "สั้นเกิน", "category": "unknown", "body_th": "สั้น",
    })`,
        },
        output: `# เตรียมโมเดลและ MockTransport จำลอง 4 กรณีสำเร็จ`,
      },
      {
        title: "2 · เขียนฟังก์ชัน `process_target` และท่อ `run_ingestion` พร้อม Semaphore",
        explain:
          "ใช้ `asyncio.Semaphore(max_concurrency)` คุมจำนวนงานพร้อมกัน และใช้ `asyncio.as_completed` ทยอยเขียนลง `output.jsonl` กับ `quarantine.jsonl` ทันทีที่แต่ละงานเสร็จ",
        code: {
          language: "python",
          filename: "worked_d030.py",
          code: `async def process_target(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    target: FetchTarget,
) -> FetchedRecord | QuarantineRecord:
    try:
        async with sem:
            resp = await client.get(target.url)
        if resp.status_code >= 400:
            return QuarantineRecord(
                item_id=target.item_id, url=target.url,
                stage="fetch", reason=f"HTTP {resp.status_code}",
            )
    except httpx.HTTPError as exc:
        return QuarantineRecord(
            item_id=target.item_id, url=target.url,
            stage="fetch", reason=f"{type(exc).__name__}: {exc}",
        )

    try:
        payload = resp.json()
    except ValueError as exc:
        return QuarantineRecord(
            item_id=target.item_id, url=target.url,
            stage="parse", reason=f"Invalid JSON: {exc}",
        )

    try:
        return FetchedRecord.model_validate(payload)
    except ValidationError as exc:
        first = exc.errors()[0]
        loc = ".".join(str(p) for p in first["loc"])
        return QuarantineRecord(
            item_id=target.item_id, url=target.url,
            stage="validate", reason=f"{loc}: {first['msg']}",
        )


async def run_ingestion(
    targets: list[FetchTarget],
    client: httpx.AsyncClient,
    output_path: Path,
    quarantine_path: Path,
    max_concurrency: int = 2,
) -> dict[str, int]:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    quarantine_path.parent.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(max_concurrency)

    succeeded = 0
    quarantined = 0
    tasks = [asyncio.create_task(process_target(client, sem, t)) for t in targets]

    with (
        output_path.open("w", encoding="utf-8") as out_f,
        quarantine_path.open("w", encoding="utf-8") as q_f,
    ):
        for coro in asyncio.as_completed(tasks):
            result = await coro
            if isinstance(result, FetchedRecord):
                out_f.write(result.model_dump_json() + "\\n")
                succeeded += 1
            else:
                q_f.write(result.model_dump_json() + "\\n")
                quarantined += 1

    return {"total": len(targets), "succeeded": succeeded, "quarantined": quarantined}`,
        },
        output: `# ประกาศท่อ ingestion แบบ streaming JSONL เรียบร้อย`,
      },
      {
        title: "3 · รันท่อทั้งหมดแบบออฟไลน์แล้วตรวจไฟล์ JSONL ทั้งสองฝั่ง",
        explain:
          "ส่ง `httpx.MockTransport(mock_handler)` เข้า `httpx.AsyncClient` แล้วรันทั้ง 4 รายการ จากนั้นอ่านไฟล์ผลลัพธ์กลับมาดู",
        code: {
          language: "python",
          filename: "worked_d030.py",
          code: `async def main() -> None:
    targets = [
        FetchTarget(item_id=f"DOC-00{i}", url=f"https://mock.local/docs/{i}")
        for i in range(1, 5)
    ]
    out_p = Path("data/output.jsonl")
    q_p = Path("data/quarantine.jsonl")

    transport = httpx.MockTransport(mock_handler)
    async with httpx.AsyncClient(transport=transport, timeout=2.0) as client:
        summary = await run_ingestion(targets, client, out_p, q_p, max_concurrency=2)

    print("Summary:", summary)
    print("--- output.jsonl ---")
    print(out_p.read_text(encoding="utf-8").strip())
    print("--- quarantine.jsonl ---")
    print(q_p.read_text(encoding="utf-8").strip())


asyncio.run(main())`,
        },
        output: `Summary: {'total': 4, 'succeeded': 1, 'quarantined': 3}
--- output.jsonl ---
{"item_id":"DOC-001","title":"วิธีเปลี่ยนที่อยู่จัดส่ง","category":"faq","body_th":"เข้าเมนูคำสั่งซื้อแล้วกดแก้ไขที่อยู่ก่อนจัดส่ง"}
--- quarantine.jsonl ---
{"item_id":"DOC-002","url":"https://mock.local/docs/2","stage":"fetch","reason":"HTTP 404"}
{"item_id":"DOC-003","url":"https://mock.local/docs/3","stage":"parse","reason":"Invalid JSON: Expecting value: line 1 column 1 (char 0)"}
{"item_id":"DOC-004","url":"https://mock.local/docs/4","stage":"validate","reason":"category: Input should be 'faq', 'policy', 'ticket' or 'product'"}`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมากบน Windows: เปิดไฟล์ด้วย `path.open('w')` โดยลืมใส่ `encoding='utf-8'` — Python บน Windows จะใช้ cp874/cp1252 เป็นค่าเริ่มต้น ทำให้เขียนข้อความภาษาไทยพังด้วย `UnicodeEncodeError` หรืออ่านกลับออกมาเป็นภาษาต่างดาว!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (15 นาที): สร้างโมดูล `async_pipeline.py` ที่ต่อท่อ `httpx.AsyncClient` + `asyncio.Semaphore` + Pydantic Validation + Streaming JSONL Writer พร้อมชุดเทสต์ `pytest` ที่พิสูจน์ว่า concurrency ไม่เกินเพดานและ quarantine แยกความผิดพลาดครบทุกขั้น",
    requirements: [
      "ประกาศโมเดล `FetchTarget` (`item_id`, `url`), `FetchedRecord` (`item_id`, `title`, `category: Literal['faq', 'policy', 'ticket', 'product']`, `body_th` ยาว ≥ 5), `QuarantineRecord` (`item_id`, `url`, `stage: Literal['fetch', 'parse', 'validate']`, `reason`) และ `PipelineSummary` (`total`, `succeeded`, `quarantined`)",
      "สร้าง `async def process_target(client: httpx.AsyncClient, semaphore: asyncio.Semaphore, target: FetchTarget) -> FetchedRecord | QuarantineRecord` ที่ถือ `semaphore` เฉพาะตอนเรียก `client.get(target.url)` และดักแยก 3 stage: `fetch` (HTTP ≥ 400 หรือ `httpx.HTTPError`), `parse` (`ValueError` จาก `resp.json()`), และ `validate` (`ValidationError` จาก Pydantic)",
      "สร้าง `async def run_pipeline(targets: list[FetchTarget], client: httpx.AsyncClient, output_path: Path, quarantine_path: Path, max_concurrency: int = 3) -> PipelineSummary` ที่สร้างโฟลเดอร์ปลายทางอัตโนมัติ รันทุก target ภายใต้ `asyncio.Semaphore(max_concurrency)` และเขียนผลลง `output_path` / `quarantine_path` เป็น UTF-8 JSONL",
      "รองรับกรณี `targets = []` โดยสร้างไฟล์ว่างทั้งสองไฟล์และคืน `PipelineSummary(total=0, succeeded=0, quarantined=0)`",
      "ต้องผ่านชุดเทสต์ `MockTransport` ที่วัด `max_in_flight <= max_concurrency`, ทดสอบทุก stage ของ quarantine และอ่านไฟล์ภาษาไทย UTF-8 กลับมาตรวจได้ถูกต้อง",
    ],
    starter: {
      language: "python",
      filename: "async_pipeline.py",
      code: `import asyncio
from pathlib import Path
from typing import Literal
import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class FetchTarget(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    url: str


class FetchedRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    title: str = Field(min_length=1, max_length=300)
    category: Literal["faq", "policy", "ticket", "product"]
    body_th: str = Field(min_length=5)


class QuarantineRecord(BaseModel):
    item_id: str
    url: str
    stage: Literal["fetch", "parse", "validate"]
    reason: str


class PipelineSummary(BaseModel):
    total: int = Field(ge=0)
    succeeded: int = Field(ge=0)
    quarantined: int = Field(ge=0)


async def process_target(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    target: FetchTarget,
) -> FetchedRecord | QuarantineRecord:
    # TODO: ถือ semaphore เฉพาะช่วง client.get แล้วแยกจับ fetch / parse / validate
    raise NotImplementedError


async def run_pipeline(
    targets: list[FetchTarget],
    client: httpx.AsyncClient,
    output_path: Path,
    quarantine_path: Path,
    max_concurrency: int = 3,
) -> PipelineSummary:
    # TODO: สร้าง parent dirs, รัน tasks ด้วย Semaphore + as_completed และเขียน UTF-8 JSONL
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_async_pipeline.py",
      code: `import asyncio
import json
from pathlib import Path
import httpx
from async_pipeline import FetchTarget, PipelineSummary, run_pipeline


def test_bounded_concurrency_and_quarantine_stages(tmp_path: Path):
    in_flight = 0
    max_seen = 0

    async def handler(request: httpx.Request) -> httpx.Response:
        nonlocal in_flight, max_seen
        in_flight += 1
        max_seen = max(max_seen, in_flight)
        try:
            await asyncio.sleep(0.03)
            path = request.url.path
            if path.startswith("/ok/"):
                idx = path.split("/")[-1]
                return httpx.Response(200, json={
                    "item_id": f"DOC-{idx}",
                    "title": f"เอกสารภาษาไทย #{idx}",
                    "category": "faq",
                    "body_th": f"เนื้อหาคู่มือใช้งานฉบับภาษาไทยหมายเลข {idx}",
                })
            if path == "/err/404":
                return httpx.Response(404, text="missing")
            if path == "/err/bad-json":
                return httpx.Response(200, text="NOT_JSON")
            if path == "/err/bad-schema":
                return httpx.Response(200, json={
                    "item_id": "DOC-999",
                    "title": "พัง",
                    "category": "invalid_cat",
                    "body_th": "สั้น",
                })
            raise httpx.ReadTimeout("simulated timeout")
        finally:
            in_flight -= 1

    targets = [
        FetchTarget(item_id="DOC-1", url="https://mock.local/ok/1"),
        FetchTarget(item_id="DOC-2", url="https://mock.local/ok/2"),
        FetchTarget(item_id="DOC-3", url="https://mock.local/ok/3"),
        FetchTarget(item_id="DOC-4", url="https://mock.local/ok/4"),
        FetchTarget(item_id="DOC-5", url="https://mock.local/err/404"),
        FetchTarget(item_id="DOC-6", url="https://mock.local/err/bad-json"),
        FetchTarget(item_id="DOC-7", url="https://mock.local/err/bad-schema"),
        FetchTarget(item_id="DOC-8", url="https://mock.local/err/timeout"),
    ]

    out_path = tmp_path / "out" / "output.jsonl"
    q_path = tmp_path / "out" / "quarantine.jsonl"

    async def _run() -> PipelineSummary:
        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport) as client:
            return await run_pipeline(targets, client, out_path, q_path, max_concurrency=2)

    summary = asyncio.run(_run())
    assert summary == PipelineSummary(total=8, succeeded=4, quarantined=4)
    assert max_seen <= 2
    assert max_seen == 2  # ยืนยันว่าวิ่งขนานจริง ไม่ใช่ sequential

    ok_lines = out_path.read_text(encoding="utf-8").splitlines()
    assert len(ok_lines) == 4
    first_ok = json.loads(ok_lines[0])
    assert "เอกสารภาษาไทย" in first_ok["title"]

    q_records = [json.loads(line) for line in q_path.read_text(encoding="utf-8").splitlines()]
    assert len(q_records) == 4
    stages = {r["item_id"]: r["stage"] for r in q_records}
    assert stages == {
        "DOC-5": "fetch",
        "DOC-6": "parse",
        "DOC-7": "validate",
        "DOC-8": "fetch",
    }


def test_empty_targets_creates_empty_files(tmp_path: Path):
    out_path = tmp_path / "output.jsonl"
    q_path = tmp_path / "quarantine.jsonl"

    async def _run() -> PipelineSummary:
        transport = httpx.MockTransport(lambda req: httpx.Response(200))
        async with httpx.AsyncClient(transport=transport) as client:
            return await run_pipeline([], client, out_path, q_path, max_concurrency=3)

    summary = asyncio.run(_run())
    assert summary == PipelineSummary(total=0, succeeded=0, quarantined=0)
    assert out_path.exists() and out_path.read_text(encoding="utf-8") == ""
    assert q_path.exists() and q_path.read_text(encoding="utf-8") == ""
`,
    },
    selfCheck: [
      "ค่า `max_seen` ในเทสต์เท่ากับ `max_concurrency` (`2`) — ยืนยันว่าวิ่งขนานจริงและไม่ทะลุเพดาน",
      "HTTP 404 และ `ReadTimeout` ลง quarantine ที่ `stage='fetch'`, JSON พังลง `stage='parse'` และ schema ผิดลง `stage='validate'`",
      "ข้อความภาษาไทยใน `output.jsonl` เขียนและอ่านกลับด้วย UTF-8 ได้สมบูรณ์โดยไม่เพี้ยน",
      "กรณี `targets = []` สร้างไฟล์ว่างได้โดยไม่ error และคืนยอดเป็นศูนย์ทั้งหมด",
      "`uv run pytest -W error -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance: "ผ่านเทสต์ทั้งหมดด้วย `uv run pytest -W error -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `process_target` ให้ดัก `httpx.HTTPError` เป็น catch-all สำหรับปัญหาเครือข่าย/timeout (เพราะ `ReadTimeout`, `ConnectError` ล้วนสืบทอดมาจาก `httpx.HTTPError`)",
      },
      {
        body: "ใน `run_pipeline` สร้าง `tasks = [asyncio.create_task(process_target(client, sem, t)) for t in targets]` ก่อนเข้าลูป `for coro in asyncio.as_completed(tasks):` เพื่อให้ทุก task ถูกจัดตารางบน Event Loop พร้อมกัน",
      },
      {
        body: "โค้ด `process_target` เกือบสมบูรณ์แล้ว เหลือเติมลูปเขียนไฟล์ใน `run_pipeline` และคืน `PipelineSummary`",
        code: {
          language: "python",
          filename: "hint-d030-l3.py",
          code: `async def process_target(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    target: FetchTarget,
) -> FetchedRecord | QuarantineRecord:
    try:
        async with semaphore:
            resp = await client.get(target.url)
        if resp.status_code >= 400:
            return QuarantineRecord(
                item_id=target.item_id,
                url=target.url,
                stage="fetch",
                reason=f"HTTP {resp.status_code}",
            )
    except httpx.HTTPError as exc:
        return QuarantineRecord(
            item_id=target.item_id,
            url=target.url,
            stage="fetch",
            reason=f"{type(exc).__name__}: {exc}",
        )

    try:
        payload = resp.json()
    except ValueError as exc:
        return QuarantineRecord(
            item_id=target.item_id,
            url=target.url,
            stage="parse",
            reason=f"Invalid JSON: {exc}",
        )

    try:
        return FetchedRecord.model_validate(payload)
    except ValidationError as exc:
        first = exc.errors()[0]
        loc = ".".join(str(p) for p in first["loc"])
        return QuarantineRecord(
            item_id=target.item_id,
            url=target.url,
            stage="validate",
            reason=f"{loc}: {first['msg']}",
        )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -W error -v
uv run ruff check .`,
      caption: "เปิด `-W error` เพื่อรับประกันว่าไม่มี coroutine ใดถูกสร้างทิ้งไว้โดยไม่ `await`",
    },
  },

  mistakes: [
    {
      title: "สร้าง `async with httpx.AsyncClient()` ข้างใน `process_target` ทุกรอบ",
      symptom: "ยิ่งมี target เยอะยิ่งช้าและกิน file descriptor สูง เพราะต้องทำ TCP/TLS handshake ใหม่ทุกคำขอแทนที่จะใช้ connection pool",
      fix: "สร้าง `httpx.AsyncClient` ครั้งเดียวด้านนอกแล้วส่งต่อเข้าทุก task ผ่านพารามิเตอร์ `client`",
    },
    {
      title: "ไม่ดัก exception ภายใน task แล้วปล่อยให้ `asyncio.gather` พังทั้งชุด",
      symptom: "แค่ 1 URL เกิด `ReadTimeout` หรือ `ValidationError` รายการอีก 99 ตัวที่เหลือถูกยกเลิกและไม่ได้เขียนไฟล์เลย",
      fix: "หุ้ม `fetch` / `parse` / `validate` ด้วย `try/except` ภายใน `process_target` แล้วคืน `QuarantineRecord` แทนการโยน exception ออกมา",
    },
    {
      title: "ลืมใส่ `encoding='utf-8'` ตอนเปิดไฟล์เขียน JSONL ภาษาไทย",
      symptom: "รันบน macOS/Linux ผ่าน แต่พอมารันบน Windows เกิด `UnicodeEncodeError` หรือภาษาไทยเพี้ยน",
      fix: "ระบุ `encoding='utf-8'` เสมอทั้งตอน `.open('w', encoding='utf-8')` และ `.read_text(encoding='utf-8')`",
    },
    {
      title: "ถือ `asyncio.Semaphore` ครอบยาวไปถึงขั้น validate และเขียนดิสก์",
      symptom: "สล็อตเครือข่ายถูกกักไว้นานเกินจำเป็น ทำให้ประสิทธิภาพลดลงโดยไม่ได้ช่วยลดโหลดฝั่งเซิร์ฟเวอร์",
      fix: "วาง `async with semaphore:` เฉพาะบรรทัดที่รอเครือข่าย (`await client.get(...)`) แล้วปล่อยออกทันที",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความเข้าใจเรื่อง Bounded Concurrency, Quarantine Pattern และ Streaming JSONL",
    questions: [
      mc(
        "d030-q1",
        "เมื่อต้องดึง 100 URL ด้วย `httpx.AsyncClient` เหตุใดจึงควรสร้าง `AsyncClient` แค่ครั้งเดียวด้านนอกแล้วแชร์ให้ทุก task?",
        [
          ["เพราะ `httpx` ไม่อนุญาตให้สร้าง `AsyncClient` เกิน 1 ตัวในโปรแกรมเดียว", "สร้างหลายตัวได้ แต่จะสูญเสียประโยชน์ของ connection pooling"],
          ["เพื่อใช้ TCP/TLS connection pool ร่วมกัน ลดต้นทุน handshake และควบคุมจำนวน socket ที่เปิด", "ถูก — การแชร์ client เดียวช่วยทั้งความเร็วและความเสถียรของระบบปฏิบัติการ"],
          ["เพื่อให้ `asyncio.Semaphore` ทำงานได้ เพราะ Semaphore ผูกติดกับ `AsyncClient`", "Semaphore ทำงานอิสระจาก `AsyncClient`"],
          ["เพราะถ้าสร้างข้างในจะใช้ `MockTransport` ไม่ได้", "สร้างข้างในก็ส่ง transport ได้ แต่ยังคงเสีย connection pooling"],
        ],
        "B",
        "`httpx.AsyncClient` ดูแล connection pool ภายในตัวมันเอง การเปิดหนึ่งครั้งต่อ batch (หรือต่อ lifespan ของแอป) คือแนวปฏิบัติมาตรฐาน",
        "ทำไมควรแชร์ `httpx.AsyncClient` หนึ่งตัวแทนการสร้างใหม่ทุกคำขอ?",
        "เพื่อใช้ TCP/TLS connection pool ร่วมกัน ลดเวลา handshake และป้องกันการเปิด socket เกินขีดจำกัด",
      ),
      mc(
        "d030-q2",
        "ถ้า API ส่งกลับสถานะ `200 OK` แต่เนื้อหาเป็น `<html>502 Bad Gateway</html>` แทน JSON รายการนี้ควรถูกบันทึกใน `quarantine.jsonl` ด้วย `stage` ใด?",
        [
          ["`stage='fetch'` เพราะ HTTP status code ผิดพลาด", "สถานะเป็น `200 OK` ดึง response กลับมาสำเร็จแล้ว แต่ล้มเหลวตอนแปลง JSON"],
          ["`stage='parse'` เพราะ `resp.json()` โยน `ValueError` เนื่องจากเนื้อหาไม่ใช่ JSON ที่ถูกต้อง", "ถูก — การแยก `parse` ออกจาก `validate` ช่วยให้รู้ทันทีว่าปลายทางส่งหน้า error HTML แทน JSON"],
          ["`stage='validate'` เพราะ Pydantic ตรวจ `category` ไม่ผ่าน", "ยังไม่ทันส่งเข้า Pydantic เพราะแปลง JSON ไม่ผ่านก่อนแล้ว"],
          ["ไม่ต้องบันทึก ให้ข้ามไปเงียบ ๆ", "ห้ามข้ามเงียบ — ทุกความล้มเหลวต้องลง quarantine เพื่อให้ยอดบัญชีครบ 100%"],
        ],
        "B",
        "การแยก 3 ขั้น `fetch` → `parse` → `validate` ทำให้ทีมแยกออกทันทีว่าปัญหาคือเครือข่าย/status, รูปแบบไม่ใช่ JSON, หรือโครงสร้างฟิลด์ผิดสัญญา",
        "3 ขั้นของ Quarantine (`fetch`, `parse`, `validate`) แยกปัญหาต่างกันอย่างไร?",
        "`fetch` = HTTP ≥ 400 / network error; `parse` = body ไม่ใช่ JSON; `validate` = JSON อ่านได้แต่ผิด Pydantic schema",
      ),
      mc(
        "d030-q3",
        "ในชุดเทสต์ `test_bounded_concurrency_and_quarantine_stages` เหตุใดเราจึง assert ทั้ง `max_seen <= 2` **และ** `max_seen == 2`?",
        [
          ["เพื่อเช็กว่าข้อมูลอินพุตมีจำนวนเป็นเลขคู่", "ไม่เกี่ยวกับจำนวนอินพุตว่าเป็นเลขคู่หรือคี่"],
          ["`<= 2` พิสูจน์ว่าไม่ทะลุเพดาน Semaphore และ `== 2` พิสูจน์ว่าท่อวิ่งขนานจริง ไม่ได้เผลอเขียนเป็น sequential (`max_seen == 1`)", "ถูก — ถ้าเผลอใส่ `await` ในลูปทีละตัว `max_seen` จะเป็น 1 ซึ่งผ่าน `<= 2` แต่ไม่ผ่าน `== 2`"],
          ["เพราะ `httpx.MockTransport` บังคับให้มีงานพร้อมกันอย่างน้อย 2 งานเสมอ", "`MockTransport` ไม่ได้บังคับจำนวนงานพร้อมกัน"],
          ["เพื่อตรวจสอบว่าไฟล์ `output.jsonl` มี exactly 2 บรรทัด", "`max_seen` วัดจำนวน coroutine ที่อยู่ใน handler พร้อมกัน ไม่ใช่จำนวนบรรทัดไฟล์"],
        ],
        "B",
        "การเช็กทั้งขอบบน (`<= max_concurrency`) และขอบล่าง (`> 1` หรือ `== max_concurrency`) เป็นเทคนิคทดสอบ concurrency ที่ช่วยจับบั๊ก 'เผลอรันแบบ sequential' ได้แม่นยำ",
        "ทำไมการเทสต์ Semaphore จึงควรเช็กทั้ง `max_seen <= limit` และ `max_seen == limit`?",
        "`<= limit` ยืนยันว่าไม่ทะลุเพดาน ส่วน `== limit` ยืนยันว่าท่อรันแบบ concurrent จริง ไม่ใช่เผลอ `await` ทีละรายการ",
      ),
      mc(
        "d030-q4",
        "เหตุใดการใช้ `asyncio.as_completed(tasks)` ร่วมกับการเขียน JSONL ทีละบรรทัดจึงเหมาะกับท่อ ingestion ขนาดใหญ่?",
        [
          ["เพราะ `as_completed` รับประกันลำดับผลลัพธ์ตรงกับลิสต์อินพุตทุกประการ", "`as_completed` คืนตามลำดับที่เสร็จก่อน ไม่ใช่ลำดับอินพุต"],
          ["เพราะทยอยเขียนผลลัพธ์ที่เสร็จแล้วลงดิสก์ได้ทันที ลดการใช้ RAM และแสดงความคืบหน้าได้ระหว่างรัน", "ถูก — ไม่ต้องรอให้ทุกหมื่นรายการเสร็จพร้อมกันและไม่ต้องกักเก็บ payload ทั้งหมดไว้ในหน่วยความจำ"],
          ["เพราะ `as_completed` ไม่ต้องใช้ `asyncio.Semaphore`", "ยังคงต้องใช้ `Semaphore` เพื่อคุมเพดาน concurrency เช่นเดิม"],
          ["เพราะ `pathlib` เขียนไฟล์ได้เฉพาะเมื่อใช้คู่กับ `as_completed` เท่านั้น", "`pathlib` ใช้ได้กับทุกวิธี แต่จับคู่กับ `as_completed` แล้วได้ streaming write ทันที"],
        ],
        "B",
        "การเขียนแบบ streaming ทันทีที่แต่ละ task จบช่วยให้ peak memory คงที่และหากเกิดเหตุขัดข้องกลางทางก็ยังมีผลลัพธ์ที่เสร็จแล้วอยู่ในไฟล์",
        "ข้อดีของการจับคู่ `asyncio.as_completed` กับการเขียนไฟล์ JSONL ทีละบรรทัดคืออะไร?",
        "ทยอยเขียนผลลัพธ์ลงดิสก์ทันทีที่แต่ละงานเสร็จ ลดการใช้ RAM และเห็นความคืบหน้าได้เร็วโดยไม่ต้องรอจบทั้ง batch",
      ),
    ],
  },

  takeaways: [
    "เปิด `httpx.AsyncClient` ครั้งเดียวต่อ batch แล้วแชร์ให้ทุก task เพื่อใช้ connection pooling ร่วมกัน",
    "วาง `async with asyncio.Semaphore(max_concurrency):` เฉพาะรอบการเรียกเครือข่าย เพื่อคุมโหลดปลายทางโดยไม่ถ่วงขั้น validate/write",
    "แยกการจับข้อผิดพลาดเป็น 3 ขั้น (`fetch` → `parse` → `validate`) และส่งรายการที่พังเข้า `quarantine.jsonl` เพื่อไม่ให้ 1 ชิ้นพังทำลายทั้ง batch",
    "เขียนไฟล์ JSONL ภาษาไทยด้วย {{pathlib}} พร้อม `encoding='utf-8'` เสมอ และทดสอบทั้ง concurrency กับ quarantine แบบ 100% offline ด้วย `httpx.MockTransport`",
  ],

  reviewCards: [
    rc(
      "d030-rc-1",
      "ตำแหน่งที่เหมาะสมในการวาง `async with semaphore:` ในท่อ async ingestion คือตรงไหน และเพราะอะไร?",
      "วางเฉพาะรอบการรอ Network I/O (`await client.get(...)`) แล้วปล่อยทันที เพื่อให้สล็อตเครือข่ายว่างสำหรับ task ถัดไปขณะที่เรา validate และเขียนไฟล์",
    ),
    rc(
      "d030-rc-2",
      "Quarantine Pattern ในท่อ batch ingestion แยกความผิดพลาดเป็นกี่ stage อะไรบ้าง?",
      "3 stage: `fetch` (HTTP ≥ 400 หรือ network/timeout), `parse` (response ไม่ใช่ JSON ที่ถูกต้อง) และ `validate` (JSON อ่านได้แต่ผิด Pydantic schema)",
    ),
    rc(
      "d030-rc-3",
      "ทำไมต้องระบุ `encoding='utf-8'` ทุกครั้งเมื่ออ่าน–เขียนไฟล์ JSONL ภาษาไทยด้วย `pathlib`?",
      "เพราะบน Windows ค่าเริ่มต้นของระบบไม่ใช่ UTF-8 หากลืมระบุอาจเกิด `UnicodeEncodeError` หรือภาษาไทยเพี้ยนเมื่อเปิดข้ามเครื่อง",
    ),
  ],

  sources: [
    { label: "HTTPX Documentation — Async Support & MockTransport", href: "https://www.python-httpx.org/advanced/transports/#mock-transport" },
    { label: "Python 3 Official Docs — asyncio.Semaphore & as_completed", href: "https://docs.python.org/3/library/asyncio-sync.html#asyncio.Semaphore" },
    { label: "Python 3 Official Docs — pathlib: Object-oriented filesystem paths", href: "https://docs.python.org/3/library/pathlib.html" },
    { label: "Pydantic v2 Docs — JSON Serialization (`model_dump_json`)", href: "https://docs.pydantic.dev/latest/concepts/serialization/" },
  ],

  glossary: [
    "asyncio",
    "httpx",
    "semaphore",
    "pydantic",
    "validation-error",
    "jsonl",
    "pathlib",
    "serialization",
  ],
});
