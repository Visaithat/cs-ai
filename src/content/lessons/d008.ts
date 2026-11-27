import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D008 — Phase 1 / Block B02 (Review Day)
 * Interleaved recall of D5–D7 + D1–D3; refactor messy script with config, pathlib JSONL & structlog.
 */
export const d008: Lesson = defineLesson({
  day: 8,
  titleTh: "ทบทวน B02: รีแฟกเตอร์สคริปต์ดิบด้วย Config, JSONL Stream และ Structured Logs",
  tagline: "30 นาที · รอบทบทวน D5–D7 (ผสาน D1–D3) · แปลงสคริปต์ print() + os.environ ให้พร้อมใช้งานระดับทีมแบบ 100% local",
  icon: "git-branch",
  visual: {
    id: "structlog-flow",
    title: "ทบทวน B02: ผสาน pathlib JSONL + pydantic-settings + structlog",
    caption: "ทบทวนเส้นทางข้อมูลจาก .env และไฟล์ JSONL สู่ structured logs ที่แยกประเภท error ชัดเจน",
    alt: "แผนภาพทบทวนการรวม config, JSONL streaming และ structlog",
  },
  requiresApiKey: false,
  tools: ["pathlib", "structlog", "pydantic-settings", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "เปลี่ยนสคริปต์ต้นแบบที่พังง่ายให้เป็น Data Pipeline ที่เชื่อถือได้",
      body: "สคริปต์ทดลองในงาน AI มักเริ่มจาก path แบบ hardcode, โหลด JSON ทั้งไฟล์, และใช้ `os.environ` แบบไม่ตรวจค่า เมื่อข้อมูลจริงโตขึ้นหรือย้ายเครื่อง สคริปต์เหล่านี้จะพังเป็นโดมิโน",
      lessonNote: "วันนี้เรานำ {{pathlib}} + {{jsonl}} streaming (D5) และ {{pydantic}} (D1–D3) มาวางแทนโค้ดดิบแบบเป็นระบบ",
    },
    {
      node: 2,
      heading: "แยกคอนฟิกโมเดลและเส้นทางไฟล์ออกจากตรรกะประมวลผล",
      body: "เมื่อเข้าสู่ Phase 2–3 คุณต้องสลับชุดข้อมูล ชื่อโมเดล และโควต้า retry ได้ทันทีโดยไม่ต้องไล่แก้ตัวเลขที่ฝังกระจายอยู่ในไฟล์ `.py`",
      lessonNote: "`BaseSettings` + `SecretStr` (D7) ทำให้ทุกพารามิเตอร์ถูกตรวจแบบ {{fail-fast}} ก่อนเริ่มสตรีมแม้แต่บรรทัดเดียว",
    },
    {
      node: 4,
      heading: "แยกประเภท Error ชัดเจนเพื่อให้ระบบอัตโนมัติตัดสินใจต่อได้",
      body: "ไฟล์ต้นทางหายไป (`SourceNotFoundError`) ต้องหยุดงานทันทีและแจ้งเตือนทีม ต่างจากแถว JSON เสีย 1 บรรทัดที่ควรแยกเก็บลง dead-letter แล้วรันแถวอื่นต่อ",
      lessonNote: "การใช้ {{custom-exception}} (D6) แยก fatal error ออกจาก row-level {{validation-error}} ทำให้ท่อทำงานอย่างมีวินัย",
    },
    {
      node: 5,
      heading: "ทิ้งร่องรอย JSON Log ที่ตรวจสอบได้โดยไม่รั่วไหล Secret",
      body: "หลังจบงาน batch ทุกครั้ง ทีมต้องตอบได้ทันทีจาก log ว่า run ไหนประมวลผลกี่แถว ผ่านกี่แถว พังกี่แถว โดยไม่มี API key หรือข้อมูลส่วนบุคคลหลุดลง log",
      lessonNote: "{{structlog}} ที่ผูก `run_id` ช่วยเชื่อมทุกเหตุการณ์ตั้งแต่เริ่มเปิดไฟล์จนสรุปยอดจบงาน",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิมแบบผสม (Interleaved Recall)** จาก D5–D7 และ D1–D3 เพื่อวินิจฉัยจุดอ่อน 5 แบบของสคริปต์ต้นแบบ (hardcoded paths, raw `os.environ`, `print()`, bare `except:`, non-streaming I/O)",
    "**รีแฟกเตอร์** สคริปต์ประมวลผลทิกเก็ตภาษาไทยให้ใช้ `BaseSettings` + `SecretStr`, `pathlib.Path` UTF-8 JSONL streaming, Nested/Validated {{pydantic}} และ {{custom-exception}}",
    "**ตรวจสอบคุณภาพหลังรีแฟกเตอร์** ด้วยชุดเทสต์ `pytest` (`tmp_path`, `monkeypatch`, `capture_logs`) และ `ruff check` ให้ผ่านครบทุกกรณี",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D5 (`pathlib` + JSONL streaming), D6 (`custom-exception` + `structlog`) และ D7 (`pydantic-settings` + `SecretStr`)",
    "จำพื้นฐาน D1–D3 (`uv`, `BaseModel`, `field_validator`, `model_validate_json`) ได้",
    "มี `uv` พร้อม `pydantic`, `pydantic-settings`, `structlog`, `pytest` และ `ruff` บนเครื่อง (ไม่ต้องใช้ API key)",
  ],

  setup: {
    intro:
      "ตั้งโฟลเดอร์งานทบทวน Block B02 ด้วย {{uv}} โดยติดตั้งเครื่องมือทั้ง 3 ตัวของบล็อกนี้ (`pydantic-settings`, `structlog`) พร้อมชุดเทสต์และ linter",
    commands: `uv init ai-day8-review && cd ai-day8-review
uv add pydantic-settings structlog
uv add --dev pytest ruff

# ตรวจว่าทุกไลบรารีของ B02 พร้อมทำงานร่วมกัน
uv run python -c "import pydantic_settings, structlog; print('B02 stack ready!')"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day8-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic-settings`, `structlog` และ `--dev pytest ruff`"],
      ["verify", "รันคำสั่งเช็ก import ทั้งหมดผ่าน `uv run python` สำเร็จ"],
    ],
    note: "รอบทบทวน Day 8 แบ่งเวลา 30 นาที: ทำ Interleaved Recall Quiz 10 นาที → ลงมือรีแฟกเตอร์สคริปต์และรันเทสต์ 15 นาที → จดข้อผิดพลาดที่พบเข้า Error Log 5 นาที",
  },

  concepts: [
    {
      id: "spotting-prototype-smells",
      title: "1 · วินิจฉัย 5 จุดอ่อนของสคริปต์ต้นแบบก่อนลงมือรีแฟกเตอร์",
      paragraphs: [
        "สคริปต์ที่เขียนรีบ ๆ เพื่อพิสูจน์ไอเดียมักมีลักษณะร่วมกัน 5 อย่าง: (1) ดึง `os.environ[\"API_KEY\"]` ตรง ๆ แล้วพิมพ์ลงหน้าจอ, (2) hardcode path สตริงแบบ `\"data\\\\in.jsonl\"` โดยไม่ใส่ `encoding=\"utf-8\"`, (3) โหลดไฟล์ทั้งหมดด้วย `readlines()` เข้า RAM, (4) ใช้ `except:` กลืนทุก error เงียบ ๆ, และ (5) ใช้ `print()` ลอย ๆ ไม่มี `run_id`",
        "หัวใจของการรีแฟกเตอร์อย่างวิศวกรคือ **เปลี่ยนทีละชั้นอย่างมีเป้าหมาย**: แยกคอนฟิกออกมาก่อน (D7) → แยกโมเดลข้อมูลและ error (D3, D6) → เปลี่ยน I/O เป็น streaming `pathlib` (D5) → เปลี่ยน `print()` เป็น `structlog` (D6)",
      ],
      analogy:
        "เหมือนการรีโนเวตบ้านเก่าโดยมีแบบแปลน — เราไม่ทุบกำแพงทุกด้านพร้อมกัน แต่เดินระบบไฟ (config) ต่อท่อน้ำ (streaming I/O) ติดเบรกเกอร์ (custom exceptions) และติดมิเตอร์วัด (structlog) ทีละระบบพร้อมทดสอบทุกขั้น",
      bullets: [
        "**Raw `os.environ` + `print(key)`** → เปลี่ยนเป็น `BaseSettings` + `SecretStr` ({{env-config}})",
        "**`open(\"a\\\\b.jsonl\").readlines()`** → เปลี่ยนเป็น `Path` + `encoding=\"utf-8\"` + generator ({{pathlib}}, {{jsonl}})",
        "**`except: print(\"err\")`** → เปลี่ยนเป็น {{custom-exception}} + `ValidationError` รายบรรทัด + {{structlog}}",
      ],
      whyTitle: "Why this matters — งานจริง 70% คือการยกระดับโค้ดต้นแบบให้ขึ้น Production ได้",
      whyParagraphs: [
        "ในทีม AI Engineer โค้ดต้นแบบจาก Notebook หรือ Hackathon มักทำงานได้บนข้อมูลตัวอย่าง 10 แถว แต่ล้มทันทีเมื่อเจอข้อมูลภาษาไทย 100,000 แถวหรือย้ายไปรันบนเซิร์ฟเวอร์ Linux",
        "ทักษะการรีแฟกเตอร์สคริปต์ให้สะอาดและมีเทสต์รองรับคือสิ่งที่แยกวิศวกร AI ที่ทีมไว้ใจออกจากคนที่เขียนได้แค่ demo",
      ],
    },
    {
      id: "layered-b02-architecture",
      title: "2 · สถาปัตยกรรม 4 ชั้นที่ร้อยต่อ B01 + B02 เข้าด้วยกัน",
      paragraphs: [
        "เมื่อรวมความรู้ Day 1–7 เราจะได้โครงสร้างสคริปต์ batch ที่อ่านง่ายและนำกลับมาใช้ซ้ำได้ในทุกโปรเจกต์ AI: **ชั้นที่ 1 Config** (`BaseSettings` ตรวจครบตั้งแต่สตาร์ต), **ชั้นที่ 2 Contract & Errors** (`BaseModel` + `AppError` hierarchy), **ชั้นที่ 3 Streaming I/O** (`pathlib.Path` UTF-8 generator อ่านทีละบรรทัด), และ **ชั้นที่ 4 Observability** (`structlog` ผูก `run_id` รายงานต้นทาง-ระหว่างทาง-สรุปจบ)",
        "สังเกตการแยกบทบาทของ error ให้คม: ถ้าไฟล์ `input_path` ไม่มีอยู่จริง ต้องโยน `SourceNotFoundError(AppError)` แบบ {{fail-fast}} ทันที แต่ถ้าไฟล์มีอยู่จริงและบรรทัดที่ 42 JSON พัง ให้ log `warning` และเขียนบรรทัดนั้นลง `dead_letter_path` แล้วสตรีมบรรทัดที่ 43 ต่อ",
      ],
      analogy:
        "เหมือนโรงงานบรรจุสินค้า: ถ้าวัตถุดิบทั้งล็อตมาไม่ถึงโกดัง (`SourceNotFoundError`) ต้องหยุดสายพานและโทรแจ้งผู้จัดการทันที แต่ถ้าสินค้าชิ้นที่ 42 บุบ (`ValidationError`) แค่ดีดลงกล่องคัดทิ้งแล้วเดินสายพานต่อ",
      code: {
        language: "python",
        filename: "b02_flow.py",
        code: `from pathlib import Path
from pydantic import BaseModel, ConfigDict, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class PipelineError(Exception):
    """Base error for this batch pipeline."""


class SourceNotFoundError(PipelineError):
    """Fatal error: input file does not exist."""


class JobSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="JOB_", env_file_encoding="utf-8", extra="ignore")

    api_key: SecretStr
    input_path: Path
    output_path: Path
    dead_letter_path: Path
    run_id: str = Field(default="run-local", min_length=3)


class CleanTicket(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    message_th: str = Field(min_length=5)`,
        caption: "แยก Config (`JobSettings`), Error (`SourceNotFoundError`) และ Data Contract (`CleanTicket`) ออกจากกันชัดเจนตั้งแต่หัวไฟล์",
      },
      whyTitle: "Why this matters — เตรียมพร้อมสำหรับ Day 9–12 (Testing & Coverage 90%)",
      whyParagraphs: [
        "เมื่อทุกชั้นมีขอบเขตชัดเจนและรับ `JobSettings` เข้ามาเป็นพารามิเตอร์แทนการอ่านตัวแปร global คุณสามารถเขียนเทสต์ `pytest` จำลองได้ครบทุกสถานการณ์ในไม่กี่มิลลิวินาที",
        "โครงสร้าง 4 ชั้นนี้จะถูกต่อยอดตรง ๆ สู่แพ็กเกจ `src/` และ Typer CLI ใน Block B06 และ FastAPI Service ใน Phase 5",
      ],
    },
    {
      id: "safe-observability-summary",
      title: "3 · สรุปผลการทำงานด้วย Structured Log ที่ปลอดภัยและตรวจสอบได้",
      paragraphs: [
        "ทุก batch run ที่ดีควรบันทึกเหตุการณ์หลักอย่างน้อย 3 จุดด้วย `log = structlog.get_logger(...).bind(run_id=settings.run_id)`: (1) `pipeline_started` (ระบุ `input_path`, `api_key_masked` ไม่ใช่คีย์จริง), (2) `line_rejected` เมื่อเจอแถวเสีย (ระบุ `line_no`, `error_type`), และ (3) `pipeline_finished` (ระบุ `valid_count`, `error_count`)",
        "การทดสอบพฤติกรรมทั้งหมดนี้ทำได้ 100% แบบ local โดยใช้ `tmp_path` สร้างไฟล์ `.jsonl` และ `.env` ชั่วคราว ใช้ `monkeypatch` สลับตัวแปร env และใช้ `structlog.testing.capture_logs()` ตรวจว่าไม่มีความลับหลุดลง log แม้แต่ตัวอักษรเดียว",
      ],
      analogy:
        "เหมือนสมุดบันทึกเที่ยวบิน (Flight Log) ที่บันทึกเวลาออกเดินทาง เหตุการณ์ผิดปกติระหว่างทาง และสรุปเมื่อถึงปลายทาง โดยมีรหัสเที่ยวบิน (`run_id`) กำกับทุกบรรทัด",
      whyTitle: "Why this matters — หลักฐานครบทั้งเมื่อสำเร็จและเมื่อเกิดปัญหา",
      whyParagraphs: [
        "หากพรุ่งนี้ทีมข้อมูลถามว่า \"เมื่อคืนรัน batch `run-20261122` หลุดไปกี่แถว และทำไมแถวที่ 88 ไม่เข้าฐานข้อมูล\" คุณสามารถตอบได้ใน 5 วินาทีจาก JSON log และไฟล์ dead-letter โดยไม่ต้องเดา",
        "และในทางกลับกัน หากทีมความปลอดภัยมาตรวจสอบ คุณก็มี automated test ยืนยันว่า `api_key` ไม่มีวันหลุดเข้าไปใน log stream",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบการรีแฟกเตอร์สคริปต์ Python กับ Node.js CLI/Worker",
      body: [
        "รูปแบบการรีแฟกเตอร์วันนี้ตรงกับการยกระดับสคริปต์ Node.js ดิบให้เป็น production worker ในทีม backend:",
      ],
      table: [
        ["`os.environ` → `BaseSettings` + `SecretStr`", "`process.env` → `dotenv` + Zod validated config"],
        ["`open().readlines()` → `Path` + `yield` generator", "`fs.readFileSync()` → `createReadStream` + `readline`"],
        ["`except:` → `SourceNotFoundError` + `ValidationError`", "`catch (e) {}` → Custom Error classes + `safeParse`"],
        ["`print()` → `structlog.get_logger().bind(run_id=...)`", "`console.log()` → `pino.child({ runId })`"],
      ],
    },
    student: {
      title: "First-Year Note — ลำดับการรีแฟกเตอร์ไม่ให้โค้ดพังคามือ",
      body: [
        "มือใหม่มักพยายามแก้ทั้งไฟล์ในคราวเดียวแล้วเจอ error 5 จุดพร้อมกันจนงง วิธีที่ได้ผลกว่าคือทำทีละขั้นแล้วรัน `uv run pytest -q` เช็กทุกขั้น:",
        "ขั้น 1: สร้าง `Settings` และ `Custom Exceptions` ให้ผ่านเทสต์ config ก่อน → ขั้น 2: เขียน `iter_nonempty_lines` ด้วย `pathlib` + UTF-8 → ขั้น 3: ใส่ `CleanTicket.model_validate_json` แยกแถวดี-แถวเสีย → ขั้น 4: เติม `structlog` แล้วตรวจด้วย `capture_logs()`",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองเปรียบเทียบสคริปต์ดิบแบบ \"Before\" กับเวอร์ชันที่รีแฟกเตอร์ครบทั้ง `pydantic-settings`, `pathlib` JSONL streaming, custom exception และ `structlog`",
    steps: [
      {
        title: "1 · สคริปต์ \"Before\" — ลองจับจุดอ่อนให้ครบ 5 จุด",
        explain:
          "โค้ดด้านล่างดูเหมือนสั้นและทำงานได้ แต่ซ่อนบั๊กไว้ครบทุกจุด: ไม่มี `encoding=\"utf-8\"`, โหลดทั้งไฟล์เข้า RAM, กลืน error ด้วย bare `except:`, ใช้ `os.environ` ดิบ และพิมพ์ `api_key` ออกหน้าจอ",
        code: {
          language: "python",
          filename: "messy_before.py",
          code: `import json, os

# สคริปต์ดิบ (ห้ามใช้เป็นแบบอย่าง!)
def bad_run():
    key = os.environ["JOB_API_KEY"]
    print("Starting with key:", key)          # 1) รั่วไหล secret + ใช้ print()
    lines = open("data\\\\raw.jsonl").readlines()  # 2) hardcode backslash + ไม่มี UTF-8 + กิน RAM
    out = open("out\\\\clean.jsonl", "w")     # 3) โฟลเดอร์อาจไม่มี + ไม่ใช้ with
    for line in lines:
        try:
            row = json.loads(line)
            if row["ticket_id"].startswith("TKT-"):
                out.write(json.dumps(row) + "\\n")  # 4) ภาษาไทยถูก escape เป็น \\u0e...
        except:                               # 5) bare except กลืนทุกอย่างเงียบ ๆ!
            pass`,
        },
        output: `# จุดอ่อนทั้ง 5 จุดพร้อมพังทันทีบน Windows, ไฟล์ใหญ่ หรือ CI`,
      },
      {
        title: "2 · รีแฟกเตอร์ชั้น Config, Schema และ Custom Exception",
        explain:
          "เปลี่ยน `os.environ` เป็น `JobSettings(BaseSettings)` พร้อม `SecretStr`, กำหนด `SourceNotFoundError(PipelineError)` และใช้ `TicketItem(BaseModel)` ตรวจสัญญาข้อมูล",
        code: {
          language: "python",
          filename: "refactored_after.py",
          code: `import json
from pathlib import Path
import structlog
from pydantic import BaseModel, ConfigDict, Field, SecretStr, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class PipelineError(Exception):
    """Base error for ticket refactor pipeline."""


class SourceNotFoundError(PipelineError):
    """Raised when input JSONL path does not exist."""


class JobSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="JOB_", env_file_encoding="utf-8", extra="ignore")

    api_key: SecretStr
    input_path: Path
    output_path: Path
    dead_letter_path: Path
    run_id: str = Field(default="run-001", min_length=3)


class TicketItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    message_th: str = Field(min_length=5)

    @field_validator("ticket_id")
    @classmethod
    def check_prefix(cls, value: str) -> str:
        if not value.startswith("TKT-"):
            raise ValueError("ticket_id must start with 'TKT-'")
        return value`,
        },
        output: `# แยก Config, Contract และ Fatal Error ออกจากกันชัดเจน`,
      },
      {
        title: "3 · รีแฟกเตอร์ชั้น Streaming I/O และ Structured Logging",
        explain:
          "ตรวจ `input_path.exists()` ก่อนเริ่มงาน, สตรีมอ่าน-เขียนทีละบรรทัดด้วย UTF-8 และ log เหตุการณ์สำคัญพร้อม `run_id` โดยซ่อน `api_key` อัตโนมัติ",
        code: {
          language: "python",
          filename: "refactored_after.py",
          code: `def run_job(settings: JobSettings) -> dict[str, int]:
    log = structlog.get_logger("ticket_job").bind(run_id=settings.run_id)
    if not settings.input_path.exists():
        log.error("source_missing", input_path=str(settings.input_path))
        raise SourceNotFoundError(f"ไม่พบไฟล์ต้นทาง: {settings.input_path}")

    log.info(
        "pipeline_started",
        input_path=str(settings.input_path),
        api_key=str(settings.api_key),  # ได้ "**********" เสมอ
    )
    settings.output_path.parent.mkdir(parents=True, exist_ok=True)
    settings.dead_letter_path.parent.mkdir(parents=True, exist_ok=True)

    valid_count = 0
    error_count = 0
    with (
        settings.input_path.open("r", encoding="utf-8") as fin,
        settings.output_path.open("w", encoding="utf-8") as fout,
        settings.dead_letter_path.open("w", encoding="utf-8") as fdead,
    ):
        for line_no, raw_line in enumerate(fin, start=1):
            stripped = raw_line.strip()
            if not stripped:
                continue
            try:
                item = TicketItem.model_validate_json(stripped)
            except ValidationError as err:
                reason = err.errors()[0]["msg"]
                log.warning("line_rejected", line_no=line_no, reason=reason)
                fdead.write(
                    json.dumps({"line_no": line_no, "error": reason, "raw": stripped}, ensure_ascii=False)
                    + "\\n"
                )
                error_count += 1
                continue
            fout.write(item.model_dump_json() + "\\n")
            valid_count += 1

    log.info("pipeline_finished", valid_count=valid_count, error_count=error_count)
    return {"valid_count": valid_count, "error_count": error_count}`,
        },
        output: `{"input_path": "raw.jsonl", "api_key": "**********", "run_id": "run-001", "event": "pipeline_started", "level": "info"}
{"line_no": 2, "reason": "Value error, ticket_id must start with 'TKT-'", "run_id": "run-001", "event": "line_rejected", "level": "warning"}
{"valid_count": 2, "error_count": 1, "run_id": "run-001", "event": "pipeline_finished", "level": "info"}`,
      },
    ],
    gotcha:
      "ระหว่างรีแฟกเตอร์อย่าเผลอจับ `Exception` กว้าง ๆ ครอบทั้งฟังก์ชัน `run_job` เพราะจะทำให้ `SourceNotFoundError` ถูกกลืนกลายเป็นผลลัพธ์ปกติแทนที่จะหยุดงานแบบ fail-fast!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + Refactoring Lab (15 นาที): นำสคริปต์ดิบใน `refactor_pipeline.py` มารีแฟกเตอร์ให้ใช้ `pydantic-settings` (`SecretStr`), `pathlib.Path` UTF-8 JSONL streaming, custom exception (`SourceNotFoundError`) และ `structlog` ที่ผูก `run_id` ครบทุกจุด",
    requirements: [
      "สร้าง `PipelineError(Exception)` และ `SourceNotFoundError(PipelineError)` รวมถึง `JobSettings(BaseSettings)` ที่ตั้ง `env_prefix=\"JOB_\"`, `extra=\"ignore\"`, มีฟิลด์ `api_key: SecretStr`, `input_path: Path`, `output_path: Path`, `dead_letter_path: Path` และ `run_id: str = \"run-local\"`",
      "สร้าง `load_job_settings(env_file: Path | None = None) -> JobSettings` ที่โหลดจากไฟล์ `.env` (ถ้าส่งมา) หรือ OS env vars โดยไม่สร้าง global instance ตอน import",
      "สร้าง `TicketItem(BaseModel)` (`ConfigDict(str_strip_whitespace=True)`) ที่มี `ticket_id: str` (ยาว ≥ 7, ขึ้นต้นด้วย `\"TKT-\"`), `channel: Literal[\"line\", \"email\", \"web\"]` และ `message_th: str` (ยาว ≥ 5)",
      "สร้าง `RunSummary(BaseModel)` (`run_id: str`, `valid_count: int`, `error_count: int`) และรีแฟกเตอร์ `run_pipeline(settings: JobSettings) -> RunSummary` ให้: (1) โยน `SourceNotFoundError` พร้อม log ระดับ `error` ชื่อ `\"source_missing\"` หาก `input_path` ไม่มีอยู่จริง, (2) log `\"pipeline_started\"` (ระดับ `info`) โดยมี `api_key` เป็นค่า masked (`str(settings.api_key)`) ห้ามมี secret ดิบ, (3) สตรีมอ่าน-เขียน JSONL ทีละบรรทัดด้วย UTF-8 แยกแถวดีลง `output_path` และแถวเสียลง `dead_letter_path` (พร้อม log `warning` ชื่อ `\"line_rejected\"` ที่มี `line_no`), และ (4) log `\"pipeline_finished\"` (ระดับ `info`) พร้อม `valid_count` และ `error_count`",
      "ลบการใช้ `print()`, bare `except:` และ `os.environ` ดิบออกทั้งหมดจาก `refactor_pipeline.py`",
    ],
    starter: {
      language: "python",
      filename: "refactor_pipeline.py",
      code: `"""สคริปต์ต้นแบบก่อนรีแฟกเตอร์ — ปรับปรุงให้ผ่านข้อกำหนดทั้งหมดของ Day 8"""
import json
from pathlib import Path
from typing import Literal
import structlog
from pydantic import BaseModel, ConfigDict, Field, SecretStr, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class PipelineError(Exception):
    """Base exception for pipeline."""


class SourceNotFoundError(PipelineError):
    """Raised when input JSONL file does not exist."""


class JobSettings(BaseSettings):
    # TODO: แทนที่ raw os.environ ด้วย BaseSettings (env_prefix="JOB_", extra="ignore")
    pass


class TicketItem(BaseModel):
    # TODO: กำหนด ticket_id (prefix 'TKT-'), channel, message_th พร้อม strip whitespace
    pass


class RunSummary(BaseModel):
    run_id: str
    valid_count: int
    error_count: int


def load_job_settings(env_file: Path | None = None) -> JobSettings:
    # TODO: โหลด JobSettings จาก env_file (ถ้ามี) หรือ OS env vars
    raise NotImplementedError


def run_pipeline(settings: JobSettings) -> RunSummary:
    # TODO: รีแฟกเตอร์จาก print()/readlines()/bare except เป็น pathlib UTF-8 streaming + structlog
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_refactor_pipeline.py",
      code: `import json
from pathlib import Path
import pytest
from pydantic import ValidationError
from structlog.testing import capture_logs
from refactor_pipeline import (
    JobSettings,
    PipelineError,
    RunSummary,
    SourceNotFoundError,
    load_job_settings,
    run_pipeline,
)


def test_settings_load_and_fail_fast(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    for var in ("JOB_API_KEY", "JOB_INPUT_PATH", "JOB_OUTPUT_PATH", "JOB_DEAD_LETTER_PATH", "JOB_RUN_ID"):
        monkeypatch.delenv(var, raising=False)

    empty_env = tmp_path / "empty.env"
    empty_env.write_text("", encoding="utf-8")
    with pytest.raises(ValidationError):
        load_job_settings(env_file=empty_env)

    env_file = tmp_path / ".env"
    env_file.write_text(
        f"JOB_API_KEY=sk-refactored-9090\\n"
        f"JOB_INPUT_PATH={tmp_path / 'raw.jsonl'}\\n"
        f"JOB_OUTPUT_PATH={tmp_path / 'out' / 'clean.jsonl'}\\n"
        f"JOB_DEAD_LETTER_PATH={tmp_path / 'out' / 'dead.jsonl'}\\n"
        f"JOB_RUN_ID=run-b02\\n",
        encoding="utf-8",
    )
    cfg = load_job_settings(env_file=env_file)
    assert isinstance(cfg, JobSettings)
    assert cfg.run_id == "run-b02"
    assert str(cfg.api_key) == "**********"


def test_missing_source_raises_custom_exception_and_logs(tmp_path: Path):
    assert issubclass(SourceNotFoundError, PipelineError)
    cfg = JobSettings(
        api_key="sk-secret-1111",
        input_path=tmp_path / "does_not_exist.jsonl",
        output_path=tmp_path / "clean.jsonl",
        dead_letter_path=tmp_path / "dead.jsonl",
        run_id="run-missing",
    )
    with capture_logs() as cap:
        with pytest.raises(SourceNotFoundError):
            run_pipeline(cfg)

    assert any(
        e["event"] == "source_missing" and e["log_level"] == "error" and e["run_id"] == "run-missing"
        for e in cap
    )


def test_refactored_pipeline_streams_thai_jsonl_and_masks_secret(tmp_path: Path):
    raw_secret = "sk-do-not-log-7777"
    src = tmp_path / "raw.jsonl"
    src.write_text(
        "\\n".join(
            [
                '{"ticket_id": "  TKT-801 ", "channel": "line", "message_th": "ขอใบกำกับภาษีเต็มรูปครับ"}',
                "",
                '{"ticket_id": "TKT-802", "channel": "line", "message_th": "broken json',
                '{"ticket_id": "BAD-003", "channel": "web", "message_th": "รหัสขึ้นต้นผิด"}',
                '{"ticket_id": "TKT-804", "channel": "email", "message_th": "ติดตามสถานะพัสดุครับ"}',
            ]
        )
        + "\\n",
        encoding="utf-8",
    )
    cfg = JobSettings(
        api_key=raw_secret,
        input_path=src,
        output_path=tmp_path / "nested" / "clean.jsonl",
        dead_letter_path=tmp_path / "nested" / "dead.jsonl",
        run_id="run-808",
    )

    with capture_logs() as cap:
        summary = run_pipeline(cfg)

    assert isinstance(summary, RunSummary)
    assert summary == RunSummary(run_id="run-808", valid_count=2, error_count=2)

    clean_text = cfg.output_path.read_text(encoding="utf-8")
    assert "ขอใบกำกับภาษีเต็มรูปครับ" in clean_text
    clean_rows = [json.loads(line) for line in clean_text.splitlines()]
    assert [r["ticket_id"] for r in clean_rows] == ["TKT-801", "TKT-804"]

    dead_rows = [json.loads(line) for line in cfg.dead_letter_path.read_text(encoding="utf-8").splitlines()]
    assert [d["line_no"] for d in dead_rows] == [3, 4]

    # ตรวจ structured logs และยืนยันว่า secret ดิบไม่หลุดใน log ใดเลย
    assert all(raw_secret not in str(entry) for entry in cap)
    assert all(entry.get("run_id") == "run-808" for entry in cap)
    events = [entry["event"] for entry in cap]
    assert "pipeline_started" in events
    assert events.count("line_rejected") == 2
    assert "pipeline_finished" in events
`,
    },
    selfCheck: [
      "ไม่มี `print()`, bare `except:` หรือ `os.environ` ดิบเหลืออยู่ใน `refactor_pipeline.py`",
      "`load_job_settings` โยน `ValidationError` ทันทีเมื่อขาดค่าจำเป็น และ `api_key` ถูก mask เป็น `**********` ในทุก log",
      "เมื่อไฟล์ `input_path` ไม่มีอยู่จริง `run_pipeline` log event `\"source_missing\"` ระดับ `error` แล้วโยน `SourceNotFoundError`",
      "ไฟล์ภาษาไทยถูกสตรีมทีละบรรทัดด้วย `encoding=\"utf-8\"` โดยแยกแถวพัง (บรรทัด 3 และ 4) ลง `dead_letter_path` และบันทึก `line_rejected` ครบ 2 ครั้ง",
      "รัน `uv run pytest -q` ผ่านครบ 3 เทสต์ และ `uv run ruff check .` ผ่านไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 3 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ตรวจ `if not settings.input_path.exists():` เป็นสิ่งแรกใน `run_pipeline` หลังจากสร้าง `log = structlog.get_logger(\"refactor_pipeline\").bind(run_id=settings.run_id)`",
      },
      {
        body: "อย่าลืมเรียก `.parent.mkdir(parents=True, exist_ok=True)` ให้ทั้ง `settings.output_path` และ `settings.dead_letter_path` ก่อนเปิดไฟล์ทั้ง 3 ไฟล์ในบล็อก `with` เดียวกัน",
      },
      {
        body: "โครงของ `JobSettings`, `TicketItem` และ `load_job_settings` พร้อมแล้ว — เหลือเติมลูปสตรีมและ log ใน `run_pipeline`",
        code: {
          language: "python",
          filename: "hint-d008-l3.py",
          code: `from pathlib import Path
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class JobSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="JOB_",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_key: SecretStr
    input_path: Path
    output_path: Path
    dead_letter_path: Path
    run_id: str = "run-local"


class TicketItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    channel: Literal["line", "email", "web"]
    message_th: str = Field(min_length=5)

    @field_validator("ticket_id")
    @classmethod
    def check_tkt(cls, v: str) -> str:
        if not v.startswith("TKT-"):
            raise ValueError("ticket_id must start with 'TKT-'")
        return v


def load_job_settings(env_file: Path | None = None) -> JobSettings:
    if env_file is not None:
        return JobSettings(_env_file=env_file)
    return JobSettings()`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "ลองรัน `uv run ruff check .` เพื่อตรวจว่าไม่มี unused import หรือ bare except หลงเหลืออยู่",
    },
  },

  mistakes: [
    {
      title: "ยังเก็บ `JOB_SETTINGS = load_job_settings()` ไว้ระดับโมดูลหลังรีแฟกเตอร์",
      symptom: "`test_refactor_pipeline.py` พังตั้งแต่ตอน import เพราะยังไม่ได้ตั้ง `JOB_API_KEY`",
      fix: "ให้ `run_pipeline(settings: JobSettings)` รับคอนฟิกผ่านพารามิเตอร์ และเรียก `load_job_settings()` เฉพาะในจุดเริ่มต้นของสคริปต์ (`if __name__ == \"__main__\":`)",
    },
    {
      title: "เผลอใส่ `except Exception:` ครอบทั้งฟังก์ชัน `run_pipeline`",
      symptom: "`SourceNotFoundError` ถูกกลืนเงียบหรือถูกเข้าใจผิดว่าเป็นแถวข้อมูลเสีย แทนที่จะหยุดงานแบบ fail-fast",
      fix: "วาง `try / except ValidationError` เฉพาะรอบบรรทัด `TicketItem.model_validate_json(stripped)` ข้างในลูปเท่านั้น",
    },
    {
      title: "ส่ง `api_key=settings.api_key.get_secret_value()` เข้าไปใน `log.info(...)`",
      symptom: "ความลับดิบหลุดเข้า JSON log และเทสต์ `raw_secret not in str(entry)` ไม่ผ่าน",
      fix: "ส่ง `str(settings.api_key)` (ซึ่งได้ `\"**********\"`) หรือไม่ log ฟิลด์ secret เลย",
    },
    {
      title: "ลืม `encoding=\"utf-8\"` หรือ `ensure_ascii=False` ตอนเขียนไฟล์ dead-letter",
      symptom: "ข้อความภาษาไทยใน `dead_letter.jsonl` ถูกแปลงเป็น `\\u0e...` หรือพังบน Windows",
      fix: "ใส่ `encoding=\"utf-8\"` ในทุก `.open()` และใส่ `ensure_ascii=False` ใน `json.dumps(...)` เสมอ",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ จาก D5–D7 และ D1–D3) — ลองตอบจากความจำก่อนเช็กเฉลย",
    questions: [
      mc(
        "d008-q1",
        "[ทบทวน D5] คุณต้องประมวลผลไฟล์ทิกเก็ตภาษาไทย `.jsonl` ขนาด 800 MB บน Windows ให้ปลอดภัยทั้ง RAM และอักษรภาษาไทย ข้อใดถูกต้องที่สุด?",
        [
          ["เรียก `Path(p).read_text().splitlines()` แล้ววนลูป", "ผิดสองจุด: โหลดทั้ง 800 MB เข้า RAM และไม่ระบุ `encoding=\"utf-8\"`"],
          ["เปิดด้วย `with path.open(\"r\", encoding=\"utf-8\") as f:` แล้วสตรีมทีละบรรทัดด้วย `yield` และ `model_validate_json`", "ถูก — ใช้ RAM คงที่ $O(1)$ ปลอดภัยกับภาษาไทยบน Windows และตรวจ JSON + schema ในรอบเดียว"],
          ["เปลี่ยนนามสกุลไฟล์เป็น `.json` แล้วเรียก `json.load(f)`", "JSONL ไม่ใช่ JSON array จึง `json.load` ไม่ได้ และถ้าเป็น array ก็กิน RAM ทั้งไฟล์"],
          ["ใช้ `open(p, \"r\", encoding=\"ascii\")` เพื่อให้เร็วที่สุด", "ASCII อ่านภาษาไทยไม่ได้ จะเกิด `UnicodeDecodeError` ทันที"],
        ],
        "B",
        "การจับคู่ `pathlib.Path` + `encoding=\"utf-8\"` + generator + `model_validate_json` คือมาตรฐานสำหรับไฟล์ JSONL ภาษาไทยขนาดใหญ่",
        "4 องค์ประกอบหลักของการอ่านไฟล์ JSONL ภาษาไทยขนาดใหญ่อย่างปลอดภัยคืออะไร?",
        "`pathlib.Path`, `encoding=\"utf-8\"`, generator (`yield` ทีละบรรทัด), และ `Model.model_validate_json`",
      ),
      mc(
        "d008-q2",
        "[ทบทวน D6] ในท่อประมวลผลไฟล์ batch เหตุใดจึงควรแยก `SourceNotFoundError` ออกจาก `ValidationError` รายบรรทัด?",
        [
          ["เพราะไฟล์ต้นทางหายคือ fatal error ที่ต้องหยุดงานทันที แต่แถวเสีย 1 บรรทัดควรบันทึก log + แยกเก็บลง dead-letter แล้วทำแถวที่เหลือต่อ", "ถูก — แยกการตัดสินใจระดับงาน (fail-fast) ออกจากความทนทานระดับแถว (row fault isolation)"],
          ["เพราะ Pydantic ไม่สามารถจับ `FileNotFoundError` ได้", "Python จับได้ทั้งคู่ แต่พฤติกรรมการรับมือที่ถูกต้องต่างกัน"],
          ["เพราะ `structlog` บันทึก `ValidationError` ไม่ได้", "`structlog` บันทึกได้ทุก error เพียงส่งรายละเอียดเป็น keyword arguments"],
          ["ไม่จำเป็นต้องแยก ใช้ bare `except: pass` สั้นกว่า", "Bare `except: pass` กลืนทั้งไฟล์หายและบั๊กอื่นจนระบบพังเงียบ"],
        ],
        "A",
        "การแยก fatal error ออกจาก row-level validation error ทำให้ pipeline ทั้ง fail-fast เมื่อสภาพแวดล้อมพัง และทนทานต่อข้อมูลเสียบางแถว",
        "ใน batch pipeline ควรรับมือกับ \"ไฟล์ต้นทางหาย\" ต่างจาก \"แถวที่ 42 JSON พัง\" อย่างไร?",
        "ไฟล์หายต้อง log error แล้วโยน custom exception หยุดงานทันที (fail-fast) ส่วนแถวเสียให้ log warning + แยกลง dead-letter แล้วสตรีมแถวถัดไปต่อ",
      ),
      mc(
        "d008-q3",
        "[ทบทวน D7] ใน `JobSettings(BaseSettings)` มีฟิลด์ `api_key: SecretStr` ข้อใดเป็นวิธีบันทึก log ตอนเริ่มงานที่ **ปลอดภัย** และ **สืบค้นได้**?",
        [
          ["`print(\"API KEY:\", settings.api_key.get_secret_value())`", "อันตรายมาก — พิมพ์ความลับจริงออก stdout และไม่ใช่ structured log"],
          ["`log.info(f\"started run {settings.run_id} key={settings.api_key.get_secret_value()}\")`", "ผิดสองจุด: ความลับรั่วและฝังตัวแปรในชื่อ event"],
          ["`log.info(\"pipeline_started\", run_id=settings.run_id, api_key=str(settings.api_key))`", "ถูก — ชื่อ event คงที่, มี `run_id` ค้นหาได้, และ `str(SecretStr)` แสดงเป็น `**********` เสมอ"],
          ["ไม่ต้องเขียน log เลยเพื่อความปลอดภัย", "ระบบ production ต้องการ audit trail ของการเริ่ม-จบงาน เพียงแค่ต้องไม่ log secret หรือ PII"],
        ],
        "C",
        "Structured log ที่ดีให้ร่องรอยครบถ้วน (`run_id`, path, จำนวนแถว) ในขณะที่ `SecretStr` รับประกันว่าความลับจะไม่รั่วออกมา",
        "จะ log ข้อมูลเริ่มต้นของ `JobSettings` อย่างปลอดภัยโดยไม่ให้ `api_key` รั่วได้อย่างไร?",
        "ใช้ `structlog` ด้วยชื่อ event คงที่ ส่งฟิลด์ที่จำเป็นเป็น kwargs และพึ่งพา `SecretStr` (`str(settings.api_key)` → `**********`) ห้ามเรียก `.get_secret_value()` ใน log",
      ),
      mc(
        "d008-q4",
        "[ทบทวน D1–D7] คุณกำลังจะเขียน `pytest` ให้สคริปต์ที่เพิ่งรีแฟกเตอร์ซึ่งใช้ `.env`, ไฟล์ `.jsonl` และ `structlog` เครื่องมือมาตรฐาน 3 ตัวของ `pytest` และ `structlog` ที่ควรจับคู่ใช้คือข้อใด?",
        [
          ["สร้างไฟล์จริงบน Desktop, แก้ `.env` จริงของเครื่อง, แล้วเปิดตาอ่าน `print()` เอง", "เทสต์แบบนี้พังง่ายเมื่อรันใน CI และทำไฟล์เครื่องเลอะเทอะ"],
          ["ใช้ `sleep(5)` รอไฟล์เขียนเสร็จแล้วเช็กขนาดไฟล์อย่างเดียว", "ไม่ตรวจเนื้อหา ไม่ตรวจ log และช้าโดยไม่จำเป็น"],
          ["ปิด validation ชั่วคราวตอนรันเทสต์เพื่อให้ผ่านง่ายขึ้น", "ห้ามปิด validation — เทสต์ต้องยืนยันว่า validation จับข้อมูลเสียได้จริง"],
          ["`tmp_path` (ไฟล์ชั่วคราว) + `monkeypatch` (สลับ env var) + `structlog.testing.capture_logs()` (ตรวจ JSON log events)", "ถูก — ทั้ง 3 ตัวช่วยให้เทสต์รันได้เร็ว ซ้ำได้ 100% บนทุกเครื่อง และไม่ทิ้งไฟล์ขยะ"],
        ],
        "D",
        "การจับคู่ `tmp_path` + `monkeypatch` + `capture_logs()` ทำให้คุณทดสอบทั้ง config, file I/O และ observability ได้ครบใน unit test เดียว และพร้อมต่อยอดสู่ Block B03 (Day 9–12)",
        "เครื่องมือทดสอบ 3 ตัวใดที่เหมาะที่สุดสำหรับเทสต์สคริปต์ที่ใช้ `pathlib`, `pydantic-settings` และ `structlog`?",
        "`tmp_path` (สร้างไฟล์ชั่วคราว), `monkeypatch` (จำลอง/ลบ env vars) และ `structlog.testing.capture_logs()` (ดักตรวจ log events)",
      ),
    ],
  },

  takeaways: [
    "การรีแฟกเตอร์สคริปต์ AI ให้พร้อมใช้งานจริงอาศัย 4 เสาหลักจาก B02: `BaseSettings` + `SecretStr`, `pathlib` UTF-8 JSONL streaming, Custom Exception Hierarchy และ `structlog`",
    "แยก Fatal Error (`SourceNotFoundError` → หยุดทันที) ออกจาก Row Error (`ValidationError` → log warning + แยกลง dead-letter) เพื่อความทนทานที่ไม่ซ่อนปัญหา",
    "ส่งคอนฟิกเข้าฟังก์ชันผ่านพารามิเตอร์แทน global variable เพื่อให้ทดสอบครบทุกเส้นทางได้ด้วย `tmp_path`, `monkeypatch` และ `capture_logs()`",
    "พร้อมก้าวเข้าสู่ Block B03 (Day 9–12) เพื่อยกระดับการเขียน `pytest` fixtures, mocking และ automation ด้วย Ruff อย่างเต็มรูปแบบ",
  ],

  reviewCards: [
    rc(
      "d008-rc-1",
      "5 สัญญาณอันตราย (code smells) ในสคริปต์ต้นแบบที่ควรรีแฟกเตอร์ด้วยเครื่องมือ Block B02 คืออะไร?",
      "1) raw `os.environ` 2) hardcode path + ไม่ใส่ `encoding=\"utf-8\"` 3) โหลดไฟล์ทั้งหมดเข้า RAM แทน streaming 4) bare `except:` กลืน error 5) `print()` ลอย ๆ หรือพิมพ์ secret ลง log",
    ),
    rc(
      "d008-rc-2",
      "ทำไมการจับ `try/except ValidationError` จึงควรอยู่ **ข้างใน** ลูปอ่านไฟล์ ไม่ใช่ครอบ `run_pipeline` ทั้งฟังก์ชัน?",
      "เพื่อให้แถวที่พังถูกแยกไป dead-letter โดยแถวอื่นยังไหลต่อได้ ขณะที่ fatal error อย่าง `SourceNotFoundError` ยังฟ้องออกมาทันทีแบบ fail-fast",
    ),
    rc(
      "d008-rc-3",
      "ชุดเครื่องมือ 3 ตัวสำหรับเขียน unit test ท่อข้อมูลที่รวม `pathlib`, `pydantic-settings` และ `structlog` คืออะไร?",
      "`tmp_path` (ไฟล์ชั่วคราว), `monkeypatch` (จัดการ env vars) และ `structlog.testing.capture_logs()` (ตรวจ structured log events)",
    ),
  ],

  sources: [
    { label: "Python 3 Official Docs — pathlib", href: "https://docs.python.org/3/library/pathlib.html" },
    { label: "structlog Official Docs — Context Variables & Binding", href: "https://www.structlog.org/en/stable/contextvars.html" },
    { label: "Pydantic Settings Official Docs — BaseSettings", href: "https://docs.pydantic.dev/latest/concepts/pydantic_settings/" },
    { label: "Pydantic v2 Docs — Validators & JSON Parsing", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
  ],

  glossary: [
    "pathlib",
    "jsonl",
    "structlog",
    "custom-exception",
    "env-config",
    "fail-fast",
    "pydantic",
    "validation-error",
  ],
});
