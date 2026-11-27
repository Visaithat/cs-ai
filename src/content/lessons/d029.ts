import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D029 — Phase 1 / Block B08
 * Phase 1 Mini-Project Spec & Architecture (Resilient Async Data Fetcher CLI).
 */
export const d029: Lesson = defineLesson({
  day: 29,
  titleTh: "ออกแบบสเปกและสถาปัตยกรรม Phase 1 Mini-Project: Resilient Async Data Fetcher CLI",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · วางสัญญาข้อมูล Pydantic แบ่งโมดูลใน src/ layout และกำหนด Failure Modes ก่อนลงมือเขียนท่อ async",
  icon: "file-text",
  visual: {
    id: "phase1-capstone-arch",
    title: "สถาปัตยกรรม Resilient Async Data Fetcher CLI (Phase 1 Milestone)",
    caption:
      "คลิกสำรวจแต่ละชั้นตั้งแต่ Typer CLI + pydantic-settings → SQLite Cache → Async httpx/tenacity/Semaphore → JSONL & structlog",
    alt: "แผนภาพสถาปัตยกรรม Phase 1 Mini-Project Resilient Async Data Fetcher CLI",
  },
  requiresApiKey: false,
  tools: ["uv", "Pydantic v2", "pydantic-settings", "Typer", "SQLite", "httpx", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "กำหนดขอบเขตปัญหาและเกณฑ์ยอมรับก่อนเขียนโค้ด",
      body: "โปรเจกต์ AI ที่ล้มเหลวมักไม่ได้พังเพราะเขียน Python ไม่ได้ แต่พังเพราะไม่เคยตกลงสัญญาข้อมูล (input/output) และวิธีรับมือเมื่อต้นทางล่มหรือส่งข้อมูลเพี้ยน",
      lessonNote:
        "วันนี้เราวางสเปกของ Portfolio Milestone #1 (**Resilient Async Data Fetcher CLI**) ให้ครบทั้ง {{data-contract}}, โครงสร้างโมดูล และ Acceptance Criteria",
    },
    {
      node: 1,
      heading: "วางท่อ Ingestion ที่มีขอบเขตชัดเจนสำหรับข้อมูลภาษาไทย",
      body: "ก่อนส่งข้อมูลเข้าวิเคราะห์ใน Phase 2 หรือสร้างดัชนี RAG ใน Phase 4 ระบบต้องดึงข้อมูลจำนวนมากอย่างปลอดภัย ตรวจ {{schema}} ทุกชิ้น และแยกข้อมูลเสียออกไม่ให้ปนเปื้อน",
      lessonNote:
        "การนิยาม `FetchTarget`, `FetchedItem` และ `QuarantineRecord` ด้วย {{pydantic}} ทำให้ท่อ ingestion ที่จะสร้างใน Day 30 มีกรอบชัดเจนตั้งแต่วันแรก",
    },
    {
      node: 3,
      heading: "ออกแบบเพื่อทดสอบได้แบบ Offline ตั้งแต่ชั้นสถาปัตยกรรม",
      body: "ถ้าโค้ด CLI, การอ่านไฟล์, การยิง HTTP และฐานข้อมูลปนกันอยู่ในไฟล์เดียว จะไม่สามารถเขียน unit test ที่รวดเร็วและทำซ้ำได้",
      lessonNote:
        "การแยก `config.py`, `models.py`, `cache.py`, `fetcher.py`, `cli.py` ช่วยให้ Day 31 ฉีด `httpx.MockTransport` และ `tmp_path` ใน {{pytest}} ได้ทันที",
    },
    {
      node: 5,
      heading: "วางโครงสร้าง Error และ Metrics ที่พร้อมสังเกตการณ์",
      body: "ในระบบจริง วิศวกรต้องรู้ทันทีว่ารันงาน 1 รอบสำเร็จกี่รายการ, ติด quarantine กี่รายการ, cache hit กี่ครั้ง และ retry ไปกี่รอบ",
      lessonNote:
        "เรากำหนด `RunSummary` และลำดับชั้น {{custom-exception}} ไว้ล่วงหน้าเพื่อให้ {{structlog}} รายงานสถานะงานได้อย่างเป็นระบบ",
    },
  ],

  objectives: [
    "**กำหนดสเปกและสัญญาข้อมูล ({{data-contract}})** ของ Resilient Async Data Fetcher CLI ด้วย {{pydantic}} ครอบคลุม Input, Valid Output, Quarantine Record และ Run Summary",
    "**ออกแบบขอบเขตโมดูล (Module Boundaries)** ภายใน `src/` layout (`config.py`, `models.py`, `errors.py`, `cache.py`, `fetcher.py`, `cli.py`) โดยแยก Pure Logic ออกจาก I/O",
    "**ระบุ Failure Modes และ Acceptance Criteria** ของระบบดึงข้อมูลแบบ async ที่ทนทานต่อ timeout, rate limit และข้อมูลเพี้ยน พร้อมตรวจความถูกต้องของสเปกด้วย {{pytest}}",
  ],

  prerequisites: [
    "ผ่านหรือคุ้นเคยกับเครื่องมือหลักใน Phase 1: `uv`, Pydantic v2, `pydantic-settings`, `httpx`, `asyncio`, `Typer` และ `SQLite`",
    "มี Python 3.11+ และ `uv` พร้อมใช้งานบนเครื่อง",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — ออกแบบและทดสอบสัญญาข้อมูลบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโครงสร้างโปรเจกต์สำหรับ Phase 1 Mini-Project (`resilient-fetcher`) ด้วย {{uv}} และติดตั้ง {{dependency}} ครบชุดที่ต้องใช้ตลอด Day 29–32",
    commands: `# สร้างโปรเจกต์แบบ package (src/ layout) สำหรับ Phase 1 Milestone
uv init --package resilient-fetcher && cd resilient-fetcher

# ติดตั้ง runtime dependencies และ dev tools
uv add pydantic pydantic-settings httpx tenacity typer structlog
uv add --dev pytest pytest-cov ruff

# ตรวจสภาพแวดล้อม
uv run python -c "import pydantic, httpx, typer; print('Ready!')"`,
    steps: [
      ["init", "สร้างโปรเจกต์ด้วย `uv init --package resilient-fetcher` จนได้ `pyproject.toml` และโฟลเดอร์ `src/`"],
      ["deps", "ติดตั้ง runtime packages (`pydantic`, `pydantic-settings`, `httpx`, `tenacity`, `typer`, `structlog`) และ dev tools (`pytest`, `pytest-cov`, `ruff`)"],
      ["verify", "รันคำสั่ง `uv run python -c ...` แล้วแสดง `Ready!` พร้อมสร้าง {{lockfile|uv.lock}}"],
    ],
    note: "โปรเจกต์ `resilient-fetcher` นี้จะถูกใช้ต่อเนื่องตลอด Block B08 (Day 29–32) เพื่อเป็น Portfolio Milestone #1 ที่พร้อมนำไปอ้างอิงใน GitHub และต่อยอดเข้าสู่ Phase 2",
  },

  concepts: [
    {
      id: "project-scope-and-contracts",
      title: "1 · ขอบเขตงานและ Data Contracts ด้วย Pydantic v2",
      paragraphs: [
        "เป้าหมายของ **Resilient Async Data Fetcher CLI** คือเครื่องมือบรรทัดคำสั่ง (CLI) ที่รับรายการแหล่งข้อมูล (URL/ID) จากไฟล์อินพุต, ดึงข้อมูลแบบ concurrent ด้วย {{asyncio}} + {{httpx}} ภายใต้เพดาน {{semaphore}}, ตรวจ {{schema}} ด้วย {{pydantic}}, แคชผลลัพธ์ลง {{sqlite}}, และส่งออกรายการที่ผ่านลง `output.jsonl` พร้อมแยกข้อมูลเสียลง `quarantine.jsonl`",
        "ก่อนเขียนโค้ดเครือข่ายแม้แต่บรรทัดเดียว เราต้องนิยาม **4 สัญญาข้อมูลหลัก** ด้วย {{basemodel}} ได้แก่ (1) `FetchTarget` สำหรับอินพุตแต่ละรายการ, (2) `FetchedRecord` สำหรับข้อมูลที่ผ่านการตรวจแล้ว, (3) `QuarantineRecord` สำหรับรายการที่ล้มเหลวพร้อมเหตุผล และ (4) `RunSummary` สำหรับตัวเลขสรุปรอบการทำงาน",
      ],
      analogy:
        "เหมือนการเขียนแบบแปลนและสเปกขนาดประตู–หน้าต่างก่อนสร้างบ้าน — ช่างไฟฟ้า ช่างประปา และช่างปูน (แต่ละโมดูล) จะทำงานสอดประสานกันได้โดยไม่ต้องมารื้อแก้กลางทาง",
      code: {
        language: "python",
        filename: "src/resilient_fetcher/models.py",
        code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class FetchTarget(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    url: str

    @field_validator("url")
    @classmethod
    def must_be_http_url(cls, value: str) -> str:
        if not value.startswith(("http://", "https://")):
            raise ValueError("url must start with http:// or https://")
        return value


class FetchedRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    title: str = Field(min_length=1, max_length=300)
    category: Literal["faq", "policy", "ticket", "product"]
    body_th: str = Field(min_length=5)
    source: Literal["network", "cache"] = "network"


class QuarantineRecord(BaseModel):
    item_id: str
    url: str
    stage: Literal["fetch", "parse", "validate"]
    reason: str


class RunSummary(BaseModel):
    total: int = Field(ge=0)
    succeeded: int = Field(ge=0)
    quarantined: int = Field(ge=0)
    cache_hits: int = Field(ge=0)
    retries: int = Field(ge=0)`,
        caption: "สัญญาข้อมูลทั้ง 4 รุ่นแยกบทบาทชัดเจน ทำให้ทุกชั้นสื่อสารกันด้วยชนิดข้อมูลที่มี {{type-hint}} ครบ",
      },
      whyTitle: "Why this matters — ทำไมต้องแยก QuarantineRecord แทนการทิ้งข้อมูลเสีย",
      whyParagraphs: [
        "ในงาน AI data pipeline จริง ข้อมูลจาก API ภายนอกมักมีบางแถวที่ขาดฟิลด์หรือส่ง HTML error page กลับมาแทน JSON หากปล่อยให้พังทั้ง batch งานที่ดึงไปแล้ว 99% จะสูญเปล่า แต่ถ้าเงียบข้ามไปเฉย ๆ ทีมก็จะไม่รู้ว่าข้อมูลหายไปกี่เปอร์เซ็นต์",
        "การบันทึก `QuarantineRecord` ลง {{jsonl}} พร้อม `stage` (`fetch` / `parse` / `validate`) และ `reason` ทำให้ตรวจสอบย้อนหลังและซ่อมเฉพาะรายการที่พังได้ทันที",
      ],
    },
    {
      id: "clean-module-boundaries",
      title: "2 · แบ่งชั้นโมดูลใน src/ layout ให้แยก Logic ออกจาก I/O",
      paragraphs: [
        "กับดักใหญ่ของโปรเจกต์ CLI แรกคือการโยนทุกอย่าง — การอ่าน `.env`, การเปิด SQLite, การยิง `httpx`, การ parse Pydantic และการพิมพ์หน้าจอ — ลงในไฟล์ `cli.py` ไฟล์เดียวจนยาวหลายร้อยบรรทัดและแก้ตรงไหนก็พังลามไปหมด",
        "สถาปัตยกรรมที่ดีแบ่งความรับผิดชอบออกเป็น 6 โมดูลขนาดเล็กภายใต้ `src/resilient_fetcher/` โดยให้ **ลูกศรการพึ่งพาไหลทางเดียว**: `cli.py` เป็นชั้นบาง ๆ ที่ประกอบ `Settings` + `Cache` + `Fetcher` เข้าด้วยกัน ส่วนแต่ละโมดูลข้างล่างไม่รู้จัก {{typer}} และสามารถทดสอบแยกชิ้นได้ 100%",
      ],
      analogy:
        "เหมือนครัวร้านอาหารที่แยกสถานีเตรียมวัตถุดิบ (models), ห้องเย็นเก็บของ (cache), เตาผัด (fetcher) และเคาน์เตอร์รับออเดอร์ (cli) — ถ้าอยากเปลี่ยนวิธีรับออเดอร์จาก CLI เป็น FastAPI ในอนาคต ก็ไม่ต้องรื้อเตาผัดใหม่",
      bullets: [
        "**`config.py`** — โหลดค่าตั้งต้นจาก environment / `.env` ด้วย `pydantic-settings` (`max_concurrency`, `timeout_s`, `max_retries`, `cache_db_path`, `cache_ttl_s`)",
        "**`models.py`** — นิยาม {{data-contract}} ทั้ง 4 รุ่น (`FetchTarget`, `FetchedRecord`, `QuarantineRecord`, `RunSummary`) โดยไม่มี I/O ใด ๆ",
        "**`errors.py`** — ลำดับชั้น {{custom-exception}} (`FetcherError`, `RetryableFetchError`, `NonRetryableFetchError`) เพื่อแยกความผิดพลาดที่ควร retry ออกจากที่ควร {{fail-fast}}",
        "**`cache.py`** — จัดการตาราง {{sqlite}} response cache ด้วย parameterized query และ TTL",
        "**`fetcher.py`** — ท่อ {{asyncio}} + {{httpx}} + {{semaphore}} + `tenacity` + quarantine writer ที่รับ `httpx.AsyncClient` จากภายนอกได้ (Dependency Injection)",
        "**`cli.py`** — ชั้น {{typer}} รับแฟล็กจากผู้ใช้ ตั้งค่า {{structlog}} แล้วเรียก `fetcher.py` พร้อมคืน exit code ที่ถูกต้อง",
      ],
      whyTitle: "Why this matters — Dependency Injection ทำให้ทดสอบได้เร็วในไม่กี่มิลลิวินาที",
      whyParagraphs: [
        "สังเกตว่า `fetcher.py` ไม่ควรสร้าง `httpx.AsyncClient()` แบบ hardcode ปิดตายข้างใน แต่ควรอนุญาตให้ส่ง `client` หรือ `transport` เข้ามาได้ — นี่คือจุดที่ทำให้ Day 31 ใช้ `httpx.MockTransport` จำลอง HTTP 429, 503 และ timeout ได้โดยไม่แตะอินเทอร์เน็ตจริงเลย",
        "โครงสร้าง {{pyproject|pyproject.toml}} + `src/` layout เดียวกันนี้ยังเป็นแม่แบบที่คุณจะใช้ซ้ำใน Phase 2–6 ทุกโปรเจกต์",
      ],
    },
    {
      id: "failure-modes-and-acceptance",
      title: "3 · ระบุ Failure Modes และ Acceptance Criteria ล่วงหน้า",
      paragraphs: [
        "คำว่า **Resilient** ไม่ใช่แค่คำสวยหรู แต่ต้องระบุให้ชัดว่าเมื่อเจอปัญหาแต่ละชนิด ระบบจะตอบสนองอย่างไร: เช่น timeout หรือ HTTP `429`/`503` ต้อง retry แบบ {{exponential-backoff}} พร้อม jitter, ส่วน HTTP `400`/`404` หรือ JSON ผิด {{schema}} ต้อง **ไม่ retry** และส่งเข้า quarantine ทันที",
        "ก่อนปิดสเปก เราต้องเขียน **Acceptance Criteria** ที่วัดผลได้จริงเป็นตัวเลข เช่น รันซ้ำครั้งที่สองต้องได้ `cache_hits == total`, ความขนานสูงสุดต้องไม่เกิน `max_concurrency`, เทสต์ผ่าน 100% แบบ offline พร้อม coverage ≥ 90% และ {{ruff}} ผ่านไร้ warning",
      ],
      analogy:
        "เหมือนคู่มือรับมือเหตุฉุกเฉินของสายการบิน — นักบินไม่ได้รอให้เครื่องยนต์ดับก่อนแล้วค่อยคิดว่าต้องกดปุ่มไหน แต่มีเช็กลิสต์ระบุชัดสำหรับทุกอาการตั้งแต่ก่อนขึ้นบิน",
      code: {
        language: "python",
        filename: "src/resilient_fetcher/errors.py",
        code: `class FetcherError(Exception):
    """Base exception สำหรับข้อผิดพลาดทั้งหมดใน resilient_fetcher"""


class RetryableFetchError(FetcherError):
    """ข้อผิดพลาดชั่วคราวที่ควรลองใหม่ เช่น HTTP 429, 5xx หรือ timeout"""

    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class NonRetryableFetchError(FetcherError):
    """ข้อผิดพลาดถาวรที่ต้อง fail-fast และส่งเข้า quarantine เช่น 400, 401, 404"""

    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


def classify_http_status(status_code: int) -> str:
    """จำแนก HTTP status code เป็น 'ok' | 'retryable' | 'non_retryable'"""
    if 200 <= status_code < 300:
        return "ok"
    if status_code in (408, 429) or status_code >= 500:
        return "retryable"
    return "non_retryable"`,
        caption: "แยกฟังก์ชัน `classify_http_status` เป็น pure logic เพื่อให้ทั้ง `fetcher.py` และชุดเทสต์ใช้กฎเดียวกัน",
      },
      whyTitle: "Why this matters — แยกความผิดพลาดชั่วคราวกับถาวรตั้งแต่ออกแบบ",
      whyParagraphs: [
        "ความผิดพลาดที่พบบ่อยที่สุดใน production client คือการสั่ง retry ทุก exception — ส่งผลให้ URL ที่ตอบ `404 Not Found` ถูกยิงซ้ำ 4–5 รอบโดยเปล่าประโยชน์ เสียทั้งเวลาและโควตา {{rate-limit}}",
        "เมื่อกำหนด `RetryableFetchError` กับ `NonRetryableFetchError` ตั้งแต่วันออกแบบ โค้ด retry ใน Day 31 จะสั้น ชัดเจน และไม่ต้องมาเดาเงื่อนไข status code กระจัดกระจาย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบสถาปัตยกรรม Python CLI กับ TypeScript/Node CLI",
      body: [
        "โครงสร้าง `src/resilient_fetcher/` ใช้แนวคิด Clean Architecture เดียวกับโปรเจกต์ TypeScript ฝั่ง Backend/CLI แต่ใช้เครื่องมือมาตรฐานของระบบนิเวศ Python สมัยใหม่:",
      ],
      table: [
        ["`src/resilient_fetcher/` + `pyproject.toml`", "`src/` + `package.json` + `tsconfig.json`"],
        ["`models.py` (Pydantic `BaseModel`)", "`schemas.ts` (Zod schemas + `z.infer`)"],
        ["`config.py` (`pydantic-settings` + `.env`)", "`env.ts` (`zod` parsing `process.env`)"],
        ["`errors.py` (Custom Exception hierarchy)", "Custom `Error` subclasses (`RetryableError`)"],
        ["`cli.py` (`Typer`) แยกจาก `fetcher.py`", "`cli.ts` (`commander`/`cac`) แยกจาก `service.ts`"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Day 29 ยังไม่ยิง HTTP จริงแต่ใช้เวลาออกแบบก่อน",
      body: [
        "มือใหม่มักอยากรีบเขียนโค้ดยิง HTTP ให้วิ่งได้เร็วที่สุดใน 5 นาทีแรก แต่พอต้องเพิ่ม cache, retry, quarantine และ unit test ภายหลัง โค้ดจะพันกันจนต้องรื้อเขียนใหม่ทั้งหมด",
        "การลงทุน 30 นาทีวาง `config.py`, `models.py` และ `errors.py` ให้ชัดก่อน เปรียบเหมือนการวางโครงกระดูก — ใน Day 30 และ Day 31 คุณจะเติมเนื้อโค้ดลงแต่ละไฟล์ได้เร็วและแทบไม่เจอบั๊กโครงสร้างเลย",
      ],
    },
  },

  workedExample: {
    intro:
      "มาสร้างโครงกระดูกของโปรเจกต์ `resilient-fetcher` ทีละชั้น ตั้งแต่ `config.py` (`pydantic-settings`), `models.py` + `errors.py`, ไปจนถึงการรันตรวจสเปกบนชุดเป้าหมายจำลองแบบ 100% offline",
    steps: [
      {
        title: "1 · สร้าง `config.py` ด้วย `pydantic-settings` และกฎ fail-fast",
        explain:
          "กำหนดขอบเขตค่าที่ปลอดภัยไว้ใน `FetcherSettings` เช่น `max_concurrency` ต้องอยู่ระหว่าง 1–50 และ `timeout_s` ต้องมากกว่า 0 เพื่อป้องกันการตั้งค่าผิดพลาดจาก `.env`",
        code: {
          language: "python",
          filename: "src/resilient_fetcher/config.py",
          code: `from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class FetcherSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FETCHER_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    max_concurrency: int = Field(default=5, ge=1, le=50)
    timeout_s: float = Field(default=5.0, gt=0.0, le=60.0)
    max_retries: int = Field(default=3, ge=0, le=10)
    cache_db_path: Path = Field(default=Path("data/cache.sqlite3"))
    cache_ttl_s: int = Field(default=3600, ge=0)
    output_path: Path = Field(default=Path("data/output.jsonl"))
    quarantine_path: Path = Field(default=Path("data/quarantine.jsonl"))`,
        },
        output: `# ตั้งค่าจาก env เช่น FETCHER_MAX_CONCURRENCY=10 โดยตรวจช่วงค่าอัตโนมัติ`,
      },
      {
        title: "2 · รวมสัญญาข้อมูลและตัวจำแนก Failure Modes",
        explain:
          "ตรวจสอบว่าอินพุตที่เข้ามา (`FetchTarget`) และผลลัพธ์ (`FetchedRecord`) ผ่านการตัดช่องว่าง ตรวจชนิดข้อมูล และแยก status code ที่ retry ได้กับไม่ได้อย่างแม่นยำ",
        code: {
          language: "python",
          filename: "verify_spec.py",
          code: `from resilient_fetcher.config import FetcherSettings
from resilient_fetcher.errors import classify_http_status
from resilient_fetcher.models import FetchTarget, FetchedRecord, QuarantineRecord, RunSummary

settings = FetcherSettings(max_concurrency=4, timeout_s=3.5)
target = FetchTarget(item_id="  DOC-001 ", url=" https://api.local/docs/1 ")
record = FetchedRecord(
    item_id=target.item_id,
    title="  คู่มือการคืนสินค้า  ",
    category="policy",
    body_th="ลูกค้าสามารถขอคืนสินค้าได้ภายใน 7 วันหลังได้รับพัสดุ",
)
quarantine = QuarantineRecord(
    item_id="DOC-002",
    url="https://api.local/docs/2",
    stage="fetch",
    reason="HTTP 404 Not Found",
)
summary = RunSummary(total=2, succeeded=1, quarantined=1, cache_hits=0, retries=2)

print("Config concurrency:", settings.max_concurrency)
print("Record JSON:", record.model_dump_json())
print("Quarantine JSON:", quarantine.model_dump_json())
print("Status 429 ->", classify_http_status(429), "| Status 404 ->", classify_http_status(404))
print("Summary:", summary.model_dump())`,
        },
        output: `Config concurrency: 4
Record JSON: {"item_id":"DOC-001","title":"คู่มือการคืนสินค้า","category":"policy","body_th":"ลูกค้าสามารถขอคืนสินค้าได้ภายใน 7 วันหลังได้รับพัสดุ","source":"network"}
Quarantine JSON: {"item_id":"DOC-002","url":"https://api.local/docs/2","stage":"fetch","reason":"HTTP 404 Not Found"}
Status 429 -> retryable | Status 404 -> non_retryable
Summary: {'total': 2, 'succeeded': 1, 'quarantined': 1, 'cache_hits': 0, 'retries': 2}`,
      },
      {
        title: "3 · ตรวจสอบความสมเหตุสมผลของ `RunSummary` ด้วย invariant check",
        explain:
          "ในสเปกจริง เราสามารถเพิ่ม property หรือ validator เพื่อให้แน่ใจว่า `succeeded + quarantined == total` เสมอ — ไม่มีรายการใดตกหล่นหายไประหว่างท่อ",
        code: {
          language: "python",
          filename: "check_invariant.py",
          code: `from pydantic import BaseModel, Field, model_validator


class StrictRunSummary(BaseModel):
    total: int = Field(ge=0)
    succeeded: int = Field(ge=0)
    quarantined: int = Field(ge=0)
    cache_hits: int = Field(ge=0)
    retries: int = Field(ge=0)

    @model_validator(mode="after")
    def verify_totals(self) -> "StrictRunSummary":
        if self.succeeded + self.quarantined != self.total:
            raise ValueError("succeeded + quarantined must equal total")
        if self.cache_hits > self.succeeded:
            raise ValueError("cache_hits cannot exceed succeeded")
        return self


s = StrictRunSummary(total=10, succeeded=8, quarantined=2, cache_hits=5, retries=3)
print("Valid summary:", s.model_dump())`,
        },
        output: `Valid summary: {'total': 10, 'succeeded': 8, 'quarantined': 2, 'cache_hits': 5, 'retries': 3}`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อย: ตั้ง `extra='forbid'` บน `BaseSettings` เมื่อไฟล์ `.env` ในเครื่องมีตัวแปรอื่นที่ไม่เกี่ยวข้อง (เช่น `PATH` หรือ `EDITOR`) อาจทำให้โหลด config พังได้ — สำหรับ `pydantic-settings` แนะนำใช้ `extra='ignore'` คู่กับ `env_prefix='FETCHER_'` เสมอ",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `fetcher_spec.py` ที่นิยามสเปกและสัญญาข้อมูลครบชุดของ Resilient Async Data Fetcher CLI พร้อม `FetcherSettings`, `classify_http_status`, `load_targets_jsonl` และกฎ invariant ของ `RunSummary`",
    requirements: [
      "สร้าง `FetcherSettings(BaseSettings)` ที่ใช้ `env_prefix='FETCHER_'`, `extra='ignore'` และมีฟิลด์ `max_concurrency: int` (1–50, default 5), `timeout_s: float` (>0 และ ≤60, default 5.0), `max_retries: int` (0–10, default 3), `cache_ttl_s: int` (≥0, default 3600)",
      "สร้าง `FetchTarget(BaseModel)` (`item_id` ยาว ≥ 3, `url` ต้องขึ้นต้นด้วย `http://` หรือ `https://` หลัง strip ช่องว่าง) และ `FetchedRecord(BaseModel)` (`item_id`, `title` 1–300 ตัวอักษร, `category: Literal['faq', 'policy', 'ticket', 'product']`, `body_th` ยาว ≥ 5, `source: Literal['network', 'cache'] = 'network'`)",
      "สร้าง `QuarantineRecord(BaseModel)` (`item_id`, `url`, `stage: Literal['fetch', 'parse', 'validate']`, `reason`) และ `RunSummary(BaseModel)` (`total`, `succeeded`, `quarantined`, `cache_hits`, `retries`) ที่มี `@model_validator(mode='after')` ตรวจว่า `succeeded + quarantined == total` และ `cache_hits <= succeeded`",
      "สร้างฟังก์ชัน `classify_http_status(status_code: int) -> Literal['ok', 'retryable', 'non_retryable']` โดย 200–299 → `'ok'`, 408/429/500–599 → `'retryable'`, อื่น ๆ → `'non_retryable'`",
      "สร้างฟังก์ชัน `load_targets(raw_lines: list[str]) -> tuple[list[FetchTarget], list[QuarantineRecord]]` ที่อ่านข้อความ JSONL ทีละบรรทัด ข้ามบรรทัดว่าง แยก JSON/schema ที่พังเข้า `QuarantineRecord` (ตั้ง `stage='parse'` เมื่อ JSON พัง และ `stage='validate'` เมื่อ Pydantic พัง)",
    ],
    starter: {
      language: "python",
      filename: "fetcher_spec.py",
      code: `import json
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class FetcherSettings(BaseSettings):
    # TODO: กำหนด model_config (env_prefix="FETCHER_", extra="ignore") และฟิลด์พร้อมข้อจำกัดช่วงค่า
    pass


class FetchTarget(BaseModel):
    # TODO: กำหนด str_strip_whitespace, item_id, url และ validator ตรวจ http:// / https://
    pass


class FetchedRecord(BaseModel):
    # TODO: กำหนด item_id, title, category, body_th, source
    pass


class QuarantineRecord(BaseModel):
    item_id: str
    url: str
    stage: Literal["fetch", "parse", "validate"]
    reason: str


class RunSummary(BaseModel):
    # TODO: กำหนดฟิลด์ตัวเลข >= 0 และ @model_validator ตรวจ invariant
    pass


def classify_http_status(status_code: int) -> Literal["ok", "retryable", "non_retryable"]:
    # TODO: แยก 2xx -> ok, 408/429/5xx -> retryable, อื่น ๆ -> non_retryable
    raise NotImplementedError


def load_targets(raw_lines: list[str]) -> tuple[list[FetchTarget], list[QuarantineRecord]]:
    # TODO: แปลง JSONL ทีละบรรทัด แยก valid FetchTarget และ QuarantineRecord
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_fetcher_spec.py",
      code: `import pytest
from pydantic import ValidationError
from fetcher_spec import (
    FetcherSettings,
    FetchTarget,
    FetchedRecord,
    RunSummary,
    classify_http_status,
    load_targets,
)


def test_settings_env_override_and_bounds(monkeypatch):
    monkeypatch.setenv("FETCHER_MAX_CONCURRENCY", "12")
    monkeypatch.setenv("FETCHER_TIMEOUT_S", "8.5")
    settings = FetcherSettings()
    assert settings.max_concurrency == 12
    assert settings.timeout_s == 8.5

    with pytest.raises(ValidationError):
        FetcherSettings(max_concurrency=0)


def test_fetch_target_and_fetched_record_contracts():
    target = FetchTarget(item_id="  DOC-01 ", url=" https://example.local/1 ")
    assert target.item_id == "DOC-01"
    assert target.url == "https://example.local/1"

    with pytest.raises(ValidationError):
        FetchTarget(item_id="DOC-02", url="ftp://invalid.local/2")

    rec = FetchedRecord(
        item_id="DOC-01",
        title=" นโยบายจัดส่ง ",
        category="policy",
        body_th="จัดส่งสินค้าภายใน 1-2 วันทำการทั่วประเทศ",
    )
    assert rec.title == "นโยบายจัดส่ง"
    assert rec.source == "network"


def test_run_summary_invariants():
    ok = RunSummary(total=5, succeeded=4, quarantined=1, cache_hits=2, retries=3)
    assert ok.total == 5

    with pytest.raises(ValidationError):
        RunSummary(total=5, succeeded=3, quarantined=1, cache_hits=0, retries=0)

    with pytest.raises(ValidationError):
        RunSummary(total=2, succeeded=1, quarantined=1, cache_hits=2, retries=0)


@pytest.mark.parametrize(
    ("code", "expected"),
    [
        (200, "ok"),
        (201, "ok"),
        (400, "non_retryable"),
        (401, "non_retryable"),
        (404, "non_retryable"),
        (408, "retryable"),
        (429, "retryable"),
        (500, "retryable"),
        (503, "retryable"),
    ],
)
def test_classify_http_status(code, expected):
    assert classify_http_status(code) == expected


def test_load_targets_separates_bad_json_and_bad_schema():
    lines = [
        '{"item_id": "DOC-100", "url": "https://api.local/100"}',
        "   ",
        "{broken-json",
        '{"item_id": "DOC-101", "url": "not-a-url"}',
    ]
    valid, quarantined = load_targets(lines)
    assert len(valid) == 1
    assert valid[0].item_id == "DOC-100"
    assert len(quarantined) == 2
    assert quarantined[0].stage == "parse"
    assert quarantined[1].stage == "validate"
    assert quarantined[1].item_id == "DOC-101"
`,
    },
    selfCheck: [
      "`FetcherSettings` อ่านตัวแปร `FETCHER_*` จาก environment ได้และปฏิเสธค่าที่อยู่นอกช่วงปลอดภัย",
      "`FetchTarget` ปฏิเสธ URL ที่ไม่ใช่ `http://` หรือ `https://` และตัดช่องว่างหัวท้ายอัตโนมัติ",
      "`RunSummary` ปฏิเสธผลรวมที่ `succeeded + quarantined != total` หรือ `cache_hits > succeeded`",
      "`classify_http_status` แยก `408`/`429`/`5xx` เป็น `retryable` และ `400`/`401`/`404` เป็น `non_retryable`",
      "`uv run pytest -q` ผ่านครบทุกข้อและ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 5 กลุ่ม (รวม parametrize) ด้วย `uv run pytest -q` และ `uv run ruff check .` สะอาด 0 error",
    hints: [
      {
        body: "วาง `model_config = ConfigDict(str_strip_whitespace=True)` ใน `FetchTarget` และ `FetchedRecord` เพื่อให้ strip ทำงานก่อน `@field_validator` และ `min_length`",
      },
      {
        body: "ใน `load_targets` ให้ข้ามบรรทัดที่ `not line.strip()` ก่อน จากนั้นใช้ `try: data = json.loads(line)` ดัก `json.JSONDecodeError` (ตั้ง `stage='parse'`) แล้วค่อยเรียก `FetchTarget.model_validate(data)` ดัก `ValidationError` (ตั้ง `stage='validate'`)",
      },
      {
        body: "โครงของโมเดลและ `classify_http_status` ครบแล้ว เหลือเติมลูปใน `load_targets` เพื่อแยก parse error กับ validation error",
        code: {
          language: "python",
          filename: "hint-d029-l3.py",
          code: `import json
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class FetcherSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FETCHER_", extra="ignore")

    max_concurrency: int = Field(default=5, ge=1, le=50)
    timeout_s: float = Field(default=5.0, gt=0.0, le=60.0)
    max_retries: int = Field(default=3, ge=0, le=10)
    cache_ttl_s: int = Field(default=3600, ge=0)


class FetchTarget(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    url: str

    @field_validator("url")
    @classmethod
    def check_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("url must start with http:// or https://")
        return v


class FetchedRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    item_id: str = Field(min_length=3)
    title: str = Field(min_length=1, max_length=300)
    category: Literal["faq", "policy", "ticket", "product"]
    body_th: str = Field(min_length=5)
    source: Literal["network", "cache"] = "network"


class QuarantineRecord(BaseModel):
    item_id: str
    url: str
    stage: Literal["fetch", "parse", "validate"]
    reason: str


class RunSummary(BaseModel):
    total: int = Field(ge=0)
    succeeded: int = Field(ge=0)
    quarantined: int = Field(ge=0)
    cache_hits: int = Field(ge=0)
    retries: int = Field(ge=0)

    @model_validator(mode="after")
    def check_invariants(self) -> "RunSummary":
        if self.succeeded + self.quarantined != self.total:
            raise ValueError("succeeded + quarantined must equal total")
        if self.cache_hits > self.succeeded:
            raise ValueError("cache_hits cannot exceed succeeded")
        return self


def classify_http_status(status_code: int) -> Literal["ok", "retryable", "non_retryable"]:
    if 200 <= status_code < 300:
        return "ok"
    if status_code in (408, 429) or status_code >= 500:
        return "retryable"
    return "non_retryable"


def load_targets(raw_lines: list[str]) -> tuple[list[FetchTarget], list[QuarantineRecord]]:
    # TODO: วนแต่ละบรรทัด ข้ามบรรทัดว่าง แยก JSONDecodeError (stage='parse') กับ ValidationError (stage='validate')
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "ใช้ `-v` เพื่อดูผล parametrize ของทุก HTTP status code ทีละกรณี",
    },
  },

  mistakes: [
    {
      title: "รวม CLI, HTTP Client, Cache และ Validation ไว้ในไฟล์ `cli.py` ไฟล์เดียว",
      symptom: "โค้ดยาวเกิน 300 บรรทัด ทดสอบ retry หรือ cache แยกไม่ได้ ต้องรัน CLI และต่อเน็ตจริงทุกครั้งที่แก้โค้ด",
      fix: "แยกโมดูลตามความรับผิดชอบ (`config.py`, `models.py`, `errors.py`, `cache.py`, `fetcher.py`, `cli.py`) และรับ `AsyncClient` / `Cache` ผ่าน parameter",
    },
    {
      title: "Hardcode ค่า `timeout`, `max_concurrency` หรือ path ของไฟล์ลงในโค้ด",
      symptom: "เวลาทดสอบต้องไปแก้ซอร์สโค้ด หรือย้ายไปรันบนเครื่องอื่นแล้วไฟล์ cache เขียนทับข้อมูลจริง",
      fix: "รวมค่าปรับแต่งทั้งหมดไว้ใน `FetcherSettings(BaseSettings)` ที่ override ได้ทั้งผ่าน environment variable และ parameter ตอนเทสต์",
    },
    {
      title: "ไม่นิยาม Quarantine Schema ไว้ตั้งแต่ต้น",
      symptom: "รายการที่ดึงไม่ได้หรือพังถูกพิมพ์แค่ `print('error')` หายไปใน terminal ตรวจสอบย้อนหลังไม่ได้ว่าพังที่ขั้น fetch, parse หรือ validate",
      fix: "สร้าง `QuarantineRecord` ที่มี `item_id`, `url`, `stage`, `reason` เพื่อส่งออกเป็น `quarantine.jsonl` ที่มีโครงสร้างสม่ำเสมอ",
    },
    {
      title: "จำแนก HTTP 404 หรือ 401 เป็น retryable error",
      symptom: "ระบบเสียเวลายิง URL ที่ไม่มีอยู่จริงหรือ token ผิดซ้ำ 3–5 รอบต่อรายการ ทำให้ batch ช้าลงหลายเท่า",
      fix: "ใช้ฟังก์ชัน `classify_http_status` แยก `408`/`429`/`5xx` เป็น `retryable` และให้ `4xx` อื่น ๆ `fail-fast` ทันที",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความแม่นยำด้านการออกแบบสถาปัตยกรรม สัญญาข้อมูล และ Failure Modes ก่อนลงมือสร้างท่อใน Day 30",
    questions: [
      mc(
        "d029-q1",
        "เหตุใดเราจึงควรแยก `fetcher.py` ออกจาก `cli.py` และรับ `httpx.AsyncClient` เข้ามาเป็นพารามิเตอร์แทนการสร้างข้างในแบบปิดตาย?",
        [
          ["เพราะ Typer ไม่อนุญาตให้ import `httpx` ในไฟล์เดียวกับคำสั่ง CLI", "Typer ไม่ได้ห้าม แต่การแยกช่วยด้านสถาปัตยกรรมและการทดสอบ"],
          ["เพื่อแยก business logic ออกจากชั้น CLI และสามารถฉีด `httpx.MockTransport` เข้ามาทดสอบแบบ offline ได้ทันที", "ถูก — นี่คือ Dependency Injection ที่ทำให้เทสต์เร็ว นิ่ง และนำ `fetcher.py` ไปใช้ซ้ำใน FastAPI ได้ด้วย"],
          ["เพื่อให้โปรแกรมรันเร็วขึ้น 10 เท่าโดยอัตโนมัติ", "การแยกไฟล์ไม่ได้เร่งความเร็วรันไทม์ แต่ช่วยด้าน maintainability และ testability"],
          ["เพราะ Python ห้ามมีฟังก์ชัน `async def` ในไฟล์ `cli.py`", "ไฟล์ `cli.py` สามารถเรียก `asyncio.run(...)` ได้ตามปกติ"],
        ],
        "B",
        "การแยกชั้น I/O และฉีด dependency อย่าง `AsyncClient` ทำให้ทดสอบทุก failure mode ได้ 100% offline และนำ core fetcher ไปใช้ต่อในเว็บ API ได้โดยไม่ต้องรื้อโค้ด",
        "ประโยชน์หลักของการแยก `fetcher.py` ออกจาก `cli.py` และรับ `AsyncClient` เป็นพารามิเตอร์คืออะไร?",
        "ทำให้ core logic แยกจากชั้น CLI, นำไปใช้ซ้ำได้ และฉีด `httpx.MockTransport` เพื่อทดสอบแบบ offline ได้ง่าย",
      ),
      mc(
        "d029-q2",
        "ในการออกแบบ Failure Modes ของ Resilient Fetcher เมื่อ API ตอบกลับสถานะใดต่อไปนี้ควร **fail-fast** เข้า quarantine ทันทีโดย **ไม่ retry**?",
        [
          ["HTTP `429 Too Many Requests`", "`429` เป็น rate limit ชั่วคราว ควร retry พร้อม exponential backoff และ jitter"],
          ["HTTP `503 Service Unavailable`", "`503` เป็นความขัดข้องชั่วคราวฝั่งเซิร์ฟเวอร์ ควร retry"],
          ["HTTP `404 Not Found` และ `401 Unauthorized`", "ถูก — `404` และ `401` เป็นข้อผิดพลาดถาวร การยิงซ้ำไม่ได้ช่วยให้สำเร็จและเสียโควตาเปล่า"],
          ["`httpx.ReadTimeout`", "Timeout เป็นปัญหาเครือข่ายชั่วคราวที่ควร retry ภายใต้จำนวนครั้งสูงสุดที่กำหนด"],
        ],
        "C",
        "Retry ควรใช้เฉพาะ transient errors (`408`, `429`, `5xx`, network timeout) ส่วน client errors ถาวรอย่าง `400`/`401`/`403`/`404` ต้อง fail-fast ทันที",
        "HTTP status code กลุ่มใดควร retry และกลุ่มใดควร fail-fast?",
        "Retry: `408`, `429`, `5xx` (และ timeout) | Fail-fast: `400`, `401`, `403`, `404`",
      ),
      mc(
        "d029-q3",
        "เหตุใดใน `FetcherSettings(BaseSettings)` จึงควรตั้ง `env_prefix='FETCHER_'` คู่กับ `extra='ignore'`?",
        [
          ["เพื่อให้ `pydantic-settings` ข้ามการ validate ชนิดข้อมูลทั้งหมด", "Pydantic ยังคง validate ชนิดและช่วงค่าของฟิลด์ที่ประกาศไว้ครบทุกตัว"],
          ["เพื่อป้องกันชื่อตัวแปรชนกับ environment ของระบบ และไม่ให้พังเมื่อในเครื่องมี env อื่นที่ไม่เกี่ยวข้อง", "ถูก — prefix ช่วยแยก namespace ชัดเจน และ `extra='ignore'` กัน error จากตัวแปรระบบอื่นใน `.env`/OS"],
          ["เพื่อบังคับให้ต้องสร้างไฟล์ `.env` ทุกครั้งก่อนรันเทสต์", "ไม่บังคับ — ถ้าไม่มี `.env` ก็ใช้ค่า default หรือ `monkeypatch.setenv` ในเทสต์ได้"],
          ["เพื่อให้เก็บ secret key ลงใน Git ได้อย่างปลอดภัย", "ห้าม commit secret ลง Git ไม่ว่ากรณีใด — ใส่ `.env` ใน `.gitignore` เสมอ"],
        ],
        "B",
        "`env_prefix` กันชื่อตัวแปรชนกับระบบปฏิบัติการ ส่วน `extra='ignore'` ช่วยให้โหลดค่าเฉพาะตัวแปรของแอปโดยไม่พังเพราะ env อื่นในเครื่องหรือ CI",
        "ทำไมควรใช้ `env_prefix` และ `extra='ignore'` กับ `pydantic-settings`?",
        "ป้องกันชื่อ env ชนกับระบบอื่น และไม่ให้การโหลด config พังเมื่อมีตัวแปรแวดล้อมอื่นอยู่ในเครื่องหรือไฟล์ `.env`",
      ),
      mc(
        "d029-q4",
        "ข้อใดคือประโยชน์ของ `@model_validator(mode='after')` บน `RunSummary` ที่ตรวจว่า `succeeded + quarantined == total`?",
        [
          ["ช่วยให้แปลงไฟล์ JSONL เป็น SQLite อัตโนมัติ", "Validator ตรวจความถูกต้องของข้อมูลในโมเดลเท่านั้น ไม่ได้เขียนฐานข้อมูล"],
          ["รับประกันความครบถ้วนของบัญชี (accounting invariant) ว่าไม่มีรายการใดหายเงียบไปกลางท่อโดยไม่รู้ตัว", "ถูก — ถ้าโค้ดลืมบันทึกผลลัพธ์ของบาง task `RunSummary` จะฟ้องทันทีตั้งแต่ในเทสต์และตอนรันจริง"],
          ["ทำให้ `asyncio` ทำงานเร็วขึ้นเมื่อดึงข้อมูลจำนวนมาก", "Validator ทำงานตอนสร้างสรุปผลท้ายรอบ ไม่เกี่ยวกับความเร็ว event loop"],
          ["ใช้แทนการเขียน unit test ด้วย `pytest` ได้ทั้งหมด", "Invariant ช่วยจับบั๊กตอนรันไทม์ แต่ยังต้องมีชุดเทสต์ `pytest` ตรวจพฤติกรรมแต่ละชั้น"],
        ],
        "B",
        "Cross-field invariant บน `RunSummary` เป็นตาข่ายนิรภัยชั้นดีที่จับบั๊กประเภท 'เงียบข้าม exception แล้วลืมนับยอด' ได้ทันที",
        "Invariant `succeeded + quarantined == total` บน `RunSummary` ช่วยจับบั๊กแบบใด?",
        "จับบั๊กที่บางรายการหายเงียบไประหว่างท่อโดยไม่ได้ถูกนับทั้งในฝั่งสำเร็จและฝั่ง quarantine",
      ),
    ],
  },

  takeaways: [
    "เริ่มโปรเจกต์วิศวกรรม AI ด้วยการวาง **Data Contracts** (`FetchTarget`, `FetchedRecord`, `QuarantineRecord`, `RunSummary`) ก่อนเขียนโค้ด I/O",
    "จัดโครงสร้าง `src/` layout แยก `config.py`, `models.py`, `errors.py`, `cache.py`, `fetcher.py`, `cli.py` เพื่อให้แต่ละชั้นทดสอบแยกชิ้นแบบ offline ได้",
    "แยกความผิดพลาดชั่วคราว (`408`/`429`/`5xx`/timeout → retry) ออกจากความผิดพลาดถาวร (`400`/`401`/`404` → fail-fast + quarantine) ตั้งแต่วันออกแบบ",
    "ใช้ `FetcherSettings(BaseSettings)` พร้อม `env_prefix` และช่วงค่าที่ปลอดภัย เพื่อให้ปรับจูน concurrency/timeout ได้โดยไม่ต้องแก้ซอร์สโค้ด",
  ],

  reviewCards: [
    rc(
      "d029-rc-1",
      "โมดูลหลัก 6 ตัวในสถาปัตยกรรม Resilient Async Data Fetcher CLI มีอะไรบ้าง และทำไมต้องแยก `cli.py` ออกจาก `fetcher.py`?",
      "`config.py`, `models.py`, `errors.py`, `cache.py`, `fetcher.py`, `cli.py` — แยกเพื่อให้ core fetcher ไม่ผูกกับ Typer และสามารถทดสอบด้วย `MockTransport` แบบ offline ได้",
    ),
    rc(
      "d029-rc-2",
      "สัญญาข้อมูลทั้ง 4 รุ่นของ Phase 1 Mini-Project มีบทบาทอะไรบ้าง?",
      "`FetchTarget` (อินพุต), `FetchedRecord` (ข้อมูลที่ผ่าน schema), `QuarantineRecord` (รายการที่พังพร้อม stage และ reason), และ `RunSummary` (สรุปยอดพร้อม invariant)",
    ),
    rc(
      "d029-rc-3",
      "ทำไม `RunSummary` จึงควรมี `@model_validator` ตรวจ `succeeded + quarantined == total`?",
      "เพื่อรับประกันว่าไม่มีรายการใดตกหล่นหายเงียบกลางท่อ async — ถ้านับยอดไม่ครบ โมเดลจะ fail-fast ทันที",
    ),
  ],

  sources: [
    { label: "Pydantic v2 Docs — Models & Model Validators", href: "https://docs.pydantic.dev/latest/concepts/validators/#model-validators" },
    { label: "Pydantic Settings — Settings Management", href: "https://docs.pydantic.dev/latest/concepts/pydantic_settings/" },
    { label: "uv Official Guide — Creating Packaged Projects (src/ layout)", href: "https://docs.astral.sh/uv/concepts/projects/init/" },
    { label: "Typer Official Documentation — CLI Applications", href: "https://typer.tiangolo.com/" },
  ],

  glossary: [
    "uv",
    "pyproject",
    "pydantic",
    "data-contract",
    "env-config",
    "typer",
    "custom-exception",
    "jsonl",
  ],
});
