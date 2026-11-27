import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D024 — Phase 1 / Block B06 (Review Day)
 * Interleaved recall of D21–D23 + D5/D9: Package Ticket Processor as installable CLI.
 */
export const d024: Lesson = defineLesson({
  day: 24,
  titleTh: "ทบทวน B06: แพ็กเกจ Ticket Processor เป็น CLI ที่ติดตั้งและทดสอบได้",
  tagline: "30 นาที · รอบทบทวน D21–D23 + D5/D9 · รวม Git hygiene, src/ layout, pyproject.toml และ Typer CLI เป็นแพ็กเกจ ticket-cli ที่รันและเทสต์ได้จริง",
  icon: "package",
  visual: {
    id: "git-package-cli",
    title: "ทบทวน B06: แพ็กเกจ Ticket Processor เป็น CLI ที่ติดตั้งและทดสอบได้",
    caption: "รวม Git hygiene + src/ layout + Typer CLI + CliRunner tests ครบในแพ็กเกจเดียว",
    alt: "แผนภาพการแพ็กเกจ Ticket Processor เป็น CLI",
  },
  requiresApiKey: false,
  tools: ["Git", "uv", "Typer", "Pydantic v2", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "รวมวินัยวิศวกรรมซอฟต์แวร์ทั้ง Block B06 ไว้ในแพ็กเกจเดียว",
      body: "โค้ด AI ที่ใช้งานได้จริงในทีมไม่ได้จบแค่ฟังก์ชันที่รันผ่านบน notebook แต่ต้องมี Git hygiene ที่ปลอดภัย, โครงสร้าง `src/` ที่ติดตั้งได้ และ CLI ที่เพื่อนร่วมทีมสั่งรันได้ทันที",
      lessonNote: "วันนี้เราทบทวน D21–D23 ร่วมกับ D5 (`pathlib`/JSONL) และ D9 (`pytest`) เพื่อสร้างแพ็กเกจ `ticket-cli` แบบครบวงจร",
    },
    {
      node: 1,
      heading: "อ่าน–ตรวจ–ส่งออกชุดข้อมูลทิกเก็ต JSONL แบบทนทานต่อข้อมูลเสีย",
      body: "ไฟล์ {{jsonl}} จากระบบจริงมักปนทั้งบรรทัด JSON เสียและฟิลด์ไม่ตรง {{schema}} ท่อประมวลผลต้องอ่านด้วย {{pathlib}} ตรวจด้วย {{pydantic}} และแยกของดี–ของเสียได้อย่างปลอดภัย",
      lessonNote: "Core module `processor.py` รับผิดชอบ streaming + validation แยกขาดจากชั้น CLI",
    },
    {
      node: 3,
      heading: "ยืนยันคุณภาพครบทุกชั้นด้วย Automated Tests",
      body: "ก่อน merge PR เราตรวจได้อัตโนมัติทั้ง `.gitignore`, `{{pyproject}}` (`[project.scripts]`), core logic และพฤติกรรม CLI (`exit_code`, `stdout`, `stderr`)",
      lessonNote: "ชุดเทสต์ {{pytest}} + {{fixture|tmp_path}} + `CliRunner` คือเกราะกัน regression ก่อนขยับไป Block B07 (SQLite & Caching)",
    },
    {
      node: 4,
      heading: "ส่งมอบคำสั่ง `ticket-cli` ที่ติดตั้งผ่าน `uv sync` ได้ในคำสั่งเดียว",
      body: "เมื่อกำหนด `[project.scripts]` และสร้างคำสั่ง `parse` ด้วย {{typer}} ใครในทีมที่โคลน repo ไปแค่รัน `uv sync` ก็เรียก `uv run ticket-cli parse ...` ได้ทันที",
      lessonNote: "นี่คือแม่แบบโครงสร้างเดียวกับที่เราจะต่อยอดเพิ่ม SQLite cache ใน Day 28 และ Phase 1 Mini-Project ใน Day 29–32",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิม (Active Recall)** จาก D21–D23 และ D5/D9 มาประกอบกัน: Git `.gitignore` hygiene, `src/` package layout, `pyproject.toml`, streaming JSONL และ `Typer` CLI",
    "**ออกแบบและสร้าง** แพ็กเกจ `ticket-cli` ตามหลัก *Thin CLI, Fat Core* ที่แยก `models.py`, `processor.py` และ `cli.py` ออกจากกันอย่างชัดเจน",
    "**ติดตั้งและทดสอบ** คำสั่ง `ticket-cli parse` (รองรับ `--output`, `--strict`, แยก `stdout`/`stderr` และ exit codes) ด้วย `uv sync`, `CliRunner` และ `pytest`",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D21 (Git workflow & `.gitignore`), D22 (`src/` layout & `pyproject.toml`), D23 (`Typer` & `CliRunner`)",
    "คุ้นเคยกับการอ่านเขียนไฟล์ JSONL ด้วย `pathlib` (D5) และการเขียน `pytest` ด้วย `tmp_path` (D9)",
    "ไม่ต้องใช้ API key — สร้าง ติดตั้ง และทดสอบแพ็กเกจบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างแพ็กเกจ `ticket-cli` ด้วย {{uv}} (`uv init --package`) พร้อมติดตั้ง `pydantic`, `typer`, `pytest` และ `ruff` ให้พร้อมสำหรับรอบทบทวน 30 นาที",
    commands: `uv init --package ticket-cli && cd ticket-cli
uv add pydantic typer
uv add --dev pytest ruff
git init -b main
uv sync`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ticket-cli` แบบ `src/` layout ด้วย `uv init --package`"],
      ["deps", "ติดตั้ง `pydantic`, `typer` และ dev tools (`pytest`, `ruff`)"],
      ["sync", "รัน `uv sync` เพื่อสร้าง `uv.lock` และติดตั้งแพ็กเกจแบบ editable"],
    ],
    note: "รอบทบทวน Day 24 แบ่งเวลาเป็น 3 ช่วง: 10 นาทีแรกทำ Interleaved Recall Quiz, 15 นาทีลงมือประกอบและทดสอบแพ็กเกจ `ticket-cli`, และ 5 นาทีสุดท้ายตรวจ Error Log",
  },

  concepts: [
    {
      id: "b06-capstone-package-architecture",
      title: "1 · ร้อยต่อทั้ง Block B06 + D5/D9 ให้เป็นแพ็กเกจ `ticket-cli`",
      paragraphs: [
        "สามวันที่ผ่านมาคุณฝึกแยกทีละชิ้น: **D21** วางวินัย Git branch + `.gitignore` ป้องกันคีย์และข้อมูลดิบหลุด, **D22** จัดระเบียบแพ็กเกจด้วย `src/` layout + `{{pyproject}}` + `[project.scripts]`, และ **D23** สร้างอินเทอร์เฟซคำสั่งที่รองรับ type hints, `stdout`/`stderr` และ `CliRunner` ด้วย {{typer}}",
        "วันนี้เรานำทั้งสามส่วนมาหุ้มรอบท่อประมวลผลทิกเก็ตภาษาไทย ({{pydantic}} + {{pathlib}} + {{jsonl}}) ให้กลายเป็นเครื่องมือที่ **โคลน → `uv sync` → รัน `ticket-cli parse` → ผ่าน `pytest`** ได้จบในชุดเดียว",
      ],
      analogy:
        "เหมือนการนำเครื่องยนต์ที่ทดสอบบนโต๊ะแล้ว (Ticket Parser) มาประกอบลงตัวถังที่แข็งแรง (`src/` package), ติดหน้าปัดและพวงมาลัยที่ขับง่าย (`Typer` CLI), และมีคู่มือความปลอดภัยก่อนออกถนน (`.gitignore` + `pytest`)",
      bullets: [
        "**D21 (Git Hygiene)**: มี `.gitignore` กัน `.env`, `.venv/`, `data/raw/`, `*.parquet`, `*.pt` และ commit `pyproject.toml` + `uv.lock` + `.env.example`",
        "**D22 (Packaging)**: แยก `src/ticket_cli/{models,processor,cli}.py` และลงทะเบียน `ticket-cli = \"ticket_cli.cli:app\"` ใน `[project.scripts]`",
        "**D23 (Typer CLI)**: คำสั่ง `parse` แยก JSON summary ออก `stdout`, progress/error ออก `stderr` และคืน exit code `1` เมื่อไฟล์หายหรือโหมด `--strict` พบข้อมูลเสีย",
      ],
      whyTitle: "Why this matters — แม่แบบโปรเจกต์ที่คุณจะใช้ซ้ำไปตลอด 180 วัน",
      whyParagraphs: [
        "โครงสร้าง `ticket-cli` ในวันนี้คือโครงกระดูกหลักของ Phase 1 Mini-Project (Day 29–32) และจะถูกขยายเพิ่ม SQLite response cache ทันทีใน Block B07 (Day 25–28)",
        "การทำรอบทบทวนแบบลงมือประกอบจริงช่วยให้คุณจำได้เป็นระบบว่าไฟล์ไหนควรวางตรงไหนและเชื่อมกันอย่างไร",
      ],
    },
    {
      id: "thin-cli-fat-core-pattern",
      title: "2 · แพตเทิร์น Thin CLI, Fat Core: แยก `processor.py` ออกจาก `cli.py`",
      paragraphs: [
        "ความผิดพลาดที่เจอบ่อยเวลาเริ่มใช้ {{typer}} คือการเขียนโค้ดเปิดไฟล์, parse JSON, ดัก {{validation-error}} และนับสถิติทั้งหมดยัดไว้ในฟังก์ชัน `@app.command()` ผลคือฟังก์ชันยาวเป็นร้อยบรรทัดและนำ logic ไปใช้ที่อื่นไม่ได้",
        "แนวทางที่สะอาดคือ **Thin CLI, Fat Core**: ให้ `processor.py` ถือฟังก์ชัน `process_jsonl_file(input_path: Path, output_path: Path | None) -> ProcessReport` ที่ทำงานกับ `Path` และ `BaseModel` ตรง ๆ ส่วน `cli.py` มีแค่ ~25 บรรทัดเพื่อรับ argument, เรียก `process_jsonl_file(...)`, พิมพ์ผลลง `stdout`/`stderr` และตัดสินใจโยน `typer.Exit`",
      ],
      analogy:
        "เหมือนพนักงานเสิร์ฟ (`cli.py`) กับห้องครัว (`processor.py`) — พนักงานเสิร์ฟมีหน้าที่รับออเดอร์และยกจานเสิร์ฟ ไม่ได้ลงมือหั่นผักและผัดกับข้าวที่โต๊ะลูกค้า",
      code: {
        language: "python",
        filename: "src/ticket_cli/processor.py",
        code: `import json
from pathlib import Path
from pydantic import BaseModel, ValidationError
from ticket_cli.models import SupportTicket


class ProcessReport(BaseModel):
    total: int
    valid: int
    errors: int
    error_lines: list[str]


def process_jsonl_file(
    input_path: Path,
    output_path: Path | None = None,
) -> ProcessReport:
    valid_tickets: list[SupportTicket] = []
    error_lines: list[str] = []
    total = 0

    with input_path.open("r", encoding="utf-8") as fh:
        for line_no, raw_line in enumerate(fh, start=1):
            stripped = raw_line.strip()
            if not stripped:
                continue
            total += 1
            try:
                payload = json.loads(stripped)
                valid_tickets.append(SupportTicket.model_validate(payload))
            except (json.JSONDecodeError, ValidationError) as exc:
                error_lines.append(f"line {line_no}: {type(exc).__name__}")

    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        out_text = "\\n".join(t.model_dump_json() for t in valid_tickets)
        output_path.write_text(f"{out_text}\\n" if out_text else "", encoding="utf-8")

    return ProcessReport(
        total=total,
        valid=len(valid_tickets),
        errors=len(error_lines),
        error_lines=error_lines,
    )`,
        caption: "อ่านไฟล์แบบ streaming ทีละบรรทัดด้วย `input_path.open(...)` (D5) และแยกของดี–ของเสียโดยไม่ให้ 1 แถวพังหยุดทั้งไฟล์",
      },
      whyTitle: "Why this matters — เทสต์ง่ายขึ้นและใช้ซ้ำใน FastAPI ได้ทันที",
      whyParagraphs: [
        "เมื่อ logic อยู่ใน `processor.py` คุณสามารถเขียน unit test ทดสอบ `process_jsonl_file` ตรง ๆ และเขียน integration test ผ่าน `CliRunner` ที่ตรวจเฉพาะชั้น CLI ได้แยกจากกันอย่างคมชัด",
        "ใน Phase 5 เมื่อต้องสร้าง {{fastapi}} endpoint รับอัปโหลดไฟล์ JSONL คุณแค่เรียก `process_jsonl_file` เดิมโดยไม่ต้องคัดลอกโค้ดแม้แต่บรรทัดเดียว",
      ],
    },
    {
      id: "release-readiness-audit-b06",
      title: "3 · เช็กลิสต์ก่อนเปิด PR ของแพ็กเกจ CLI",
      paragraphs: [
        "ก่อนส่งมอบแพ็กเกจ `ticket-cli` ให้ทีม ควรตรวจสอบ 4 มิติทุกครั้ง: (1) **Git hygiene** — `.gitignore` กัน `.env`, `.venv/`, `data/raw/` และไม่มีไฟล์ต้องห้ามค้างใน staging, (2) **Packaging** — `pyproject.toml` มี `[build-system]` และ `[project.scripts]` ชี้ไปที่ `ticket_cli.cli:app` พร้อม `{{lockfile|uv.lock}}` ที่อัปเดตล่าสุด",
        "(3) **CLI Contract** — คำสั่ง `parse` ส่ง JSON report ออก `stdout`, ส่ง progress/error ออก `stderr`, และรองรับ `--strict` เพื่อคืน exit code `1` ใน CI เมื่อมีแถวเสียแม้แต่ 1 แถว, (4) **Quality Gate** — `uv run ruff check .` และ `uv run pytest -q` ผ่าน 100%",
      ],
      analogy:
        "เหมือน Pre-flight Checklist ของนักบินก่อนเครื่องขึ้น — แม้จะบินเส้นทางนี้มาแล้วสิบครั้ง ก็ยังต้องไล่เช็กทีละข้อเพื่อไม่ให้พลาดเรื่องพื้นฐานที่ก่อความเสียหายใหญ่",
      bullets: [
        "**โหมดปกติ (`parse file.jsonl`)**: แยกของดีลง `--output` และจบด้วย exit code `0` (fault-tolerant batch processing)",
        "**โหมดเข้มงวด (`parse file.jsonl --strict`)**: หาก `report.errors > 0` ให้พิมพ์รายละเอียดบรรทัดเสียลง `stderr` และ `raise typer.Exit(code=1)` (เหมาะสำหรับ CI quality gate)",
        "**การผูก Typer กับ `[project.scripts]`**: ใน `pyproject.toml` สามารถชี้ `ticket-cli = \"ticket_cli.cli:app\"` ได้ตรง ๆ เพราะออบเจกต์ `Typer` เป็น callable อยู่แล้ว",
      ],
      whyTitle: "Why this matters — `--strict` Mode คือสะพานสู่ Automated Eval Gate",
      whyParagraphs: [
        "ในการรัน batch รายวันคุณมักต้องการให้ทิกเก็ตที่ดีไหลต่อไปก่อน (ไม่หยุดเพราะของเสีย 1 ใบ) แต่ในการรัน CI ตรวจ dataset หรือ Golden Eval คุณต้องการให้พังทันที (`--strict` → exit code `1`) หากมีข้อมูลเสียหลุดเข้ามา",
        "การออกแบบ flag `--strict` ตั้งแต่วันนี้คือรูปแบบมาตรฐานที่ใช้กันแพร่หลายใน data & AI engineering CLI",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบแพ็กเกจ `ticket-cli` กับ CLI Package ใน Node/TS",
      body: [
        "ภาพรวมทั้งหมดของวันนี้เหมือนการสร้าง TypeScript CLI package ที่มี `bin` entry point, Zod validation, NDJSON streaming และ Vitest test suite:",
      ],
      table: [
        ["`ticket-cli = 'ticket_cli.cli:app'`", "`\"bin\": { \"ticket-cli\": \"./dist/cli.js\" }`"],
        ["`src/ticket_cli/processor.py` (Fat Core)", "`src/core/processor.ts` (pure business logic)"],
        ["`src/ticket_cli/cli.py` (Thin Typer CLI)", "`src/cli.ts` (Commander wrapper)"],
        ["`--strict` → `raise typer.Exit(code=1)`", "`--strict` → `process.exitCode = 1`"],
        ["`CliRunner` + `pytest` `tmp_path`", "CLI test harness + `fs.mkdtempSync`"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม `[project.scripts]` ชี้ไปที่ `cli:app` ได้เลยทั้งที่ `app` ไม่ใช่ `def`?",
      body: [
        "ใน Python ไม่ใช่แค่ฟังก์ชัน (`def`) เท่านั้นที่เรียกใช้งานด้วยวงเล็บ `app()` ได้ — ออบเจกต์ใด ๆ ที่นิยามเมธอด `__call__` (เรียกว่า **callable**) ก็สามารถถูกเรียกเหมือนฟังก์ชันได้",
        "`app = typer.Typer()` มี `__call__` อยู่ข้างใน ดังนั้นเมื่อคุณตั้งค่า `ticket-cli = \"ticket_cli.cli:app\"` ใน `pyproject.toml` ระบบจึงสามารถสั่ง `app()` เพื่อสตาร์ต Typer CLI ได้ทันที!",
      ],
    },
  },

  workedExample: {
    intro:
      "ประกอบแพ็กเกจ `ticket-cli` ทีละส่วนตั้งแต่ `pyproject.toml` + `models.py`, ชั้น `cli.py` ที่บางเฉียบ, จนถึงการติดตั้งด้วย `uv sync` และทดสอบผ่าน terminal + `CliRunner`",
    steps: [
      {
        title: "1 · ตั้งค่า `pyproject.toml` และสร้าง `src/ticket_cli/models.py`",
        explain:
          "ผูกคำสั่ง `ticket-cli` เข้ากับ `ticket_cli.cli:app` และนิยาม `SupportTicket` ด้วย Pydantic v2 พร้อม `ConfigDict(str_strip_whitespace=True)`",
        code: {
          language: "python",
          filename: "src/ticket_cli/models.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class SupportTicket(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=4)
    channel: Literal["line", "email", "web"]
    message_th: str = Field(min_length=5, max_length=500)`,
        },
        output: `# วางคู่กับ pyproject.toml ที่ระบุ:
# [project.scripts]
# ticket-cli = "ticket_cli.cli:app"`,
      },
      {
        title: "2 · เขียน Thin CLI ใน `src/ticket_cli/cli.py`",
        explain:
          "ให้คำสั่ง `parse` เรียก `process_jsonl_file`, ส่งรายงาน JSON ออก `stdout`, ส่งสถานะ/บรรทัดเสียออก `stderr`, และรองรับ `--strict`",
        code: {
          language: "python",
          filename: "src/ticket_cli/cli.py",
          code: `from pathlib import Path
from typing import Annotated
import typer
from ticket_cli.processor import process_jsonl_file

app = typer.Typer(help="Installable Thai Support Ticket Processor CLI")


@app.callback()
def main_callback() -> None:
    """Thai Support Ticket CLI."""


@app.command()
def parse(
    input_path: Annotated[Path, typer.Argument(help="ไฟล์ JSONL ต้นทาง")],
    output: Annotated[Path | None, typer.Option("--output", "-o", help="เขียนทิกเก็ตที่ผ่านลงไฟล์ JSONL")] = None,
    strict: Annotated[bool, typer.Option("--strict", help="คืน exit code 1 หากพบแถวเสีย")] = False,
) -> None:
    """ตรวจสอบและแปลงไฟล์ทิกเก็ต JSONL"""
    if not input_path.is_file():
        typer.echo(f"Error: file not found: {input_path}", err=True)
        raise typer.Exit(code=1)

    report = process_jsonl_file(input_path, output_path=output)
    typer.echo(f"Processed {report.total} rows (valid={report.valid}, errors={report.errors})", err=True)
    for err in report.error_lines:
        typer.echo(f"  - {err}", err=True)

    typer.echo(report.model_dump_json())

    if strict and report.errors > 0:
        raise typer.Exit(code=1)`,
        },
        output: `# ใส่ @app.callback() เพื่อให้เรียก 'ticket-cli parse <file>' ได้เสมอแม้จะมี 1 subcommand`,
      },
      {
        title: "3 · ติดตั้งแบบ Editable ด้วย `uv sync` แล้วทดลองรันจริง",
        explain:
          "รัน `uv sync` เพื่อลงทะเบียนคำสั่ง `ticket-cli` เข้า `.venv` จากนั้นทดสอบทั้งโหมดปกติและโหมด `--strict`",
        code: {
          language: "bash",
          filename: "run_ticket_cli.sh",
          code: `uv sync
uv run ticket-cli --help
uv run ticket-cli parse sample_tickets.jsonl --output clean.jsonl
echo "exit=$?"
uv run ticket-cli parse sample_tickets.jsonl --strict
echo "strict_exit=$?"`,
        },
        output: `Processed 2 rows (valid=1, errors=1)
  - line 2: ValidationError
{"total":2,"valid":1,"errors":1,"error_lines":["line 2: ValidationError"]}
exit=0
Processed 2 rows (valid=1, errors=1)
  - line 2: ValidationError
{"total":2,"valid":1,"errors":1,"error_lines":["line 2: ValidationError"]}
strict_exit=1`,
      },
    ],
    gotcha:
      "อย่าลืมใส่ `@app.callback()` เปล่าไว้บน `app = typer.Typer()` เมื่อมีคำสั่ง `parse` เพียงคำสั่งเดียว — มิฉะนั้น Typer จะยุบคำสั่ง `parse` ออกและเวลาเรียก `ticket-cli parse data.jsonl` จะเกิด error ทันที!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + Mini-Integration (15 นาที): ประกอบแพ็กเกจ `ticket-cli` ภายใต้ `src/ticket_cli/` ให้ครบทั้ง `.gitignore`, `pyproject.toml`, `models.py`, `processor.py` และ `cli.py` พร้อมผ่านชุดเทสต์ตรวจโครงสร้างแพ็กเกจ, `.gitignore` และ `CliRunner`",
    requirements: [
      "จัดโครงสร้าง `src/` layout: `pyproject.toml` (มี `[build-system]` และ `[project.scripts]` ระบุ `ticket-cli = \"ticket_cli.cli:app\"`), `.gitignore` (มีอย่างน้อย `.env`, `.venv/`, `data/raw/`, `*.parquet`), และซอร์สโค้ดใต้ `src/ticket_cli/`",
      "สร้าง `src/ticket_cli/models.py` ที่มี `SupportTicket(BaseModel)` (`ConfigDict(str_strip_whitespace=True)`, `ticket_id: str` ยาว >= 4 และขึ้นต้นด้วย `\"TKT-\"`, `channel: Literal[\"line\", \"email\", \"web\"]`, `message_th: str` ยาว 5–500 ตัวอักษร)",
      "สร้าง `src/ticket_cli/processor.py` ที่มี `ProcessReport(BaseModel)` (`total`, `valid`, `errors`, `error_lines`) และ `process_jsonl_file(input_path: Path, output_path: Path | None = None) -> ProcessReport` ที่อ่านไฟล์แบบ streaming ด้วย `Path.open`, จับทั้ง `json.JSONDecodeError` และ `ValidationError` ต่อแถว, และเขียนทิกเก็ตที่ผ่านเป็น JSONL เมื่อระบุ `output_path`",
      "สร้าง `src/ticket_cli/cli.py` ที่มี `app = typer.Typer()` (ใส่ `@app.callback()`) และคำสั่ง `parse` รับ `input_path: Path`, `--output: Path | None = None`, `--strict: bool = False` — ส่ง JSON ของ `ProcessReport` ออก `stdout`, ส่ง progress/error ออก `stderr`, คืน exit code `1` เมื่อไฟล์ไม่พบหรือเมื่อ `--strict` มี `errors > 0`",
      "รัน `uv sync`, `uv run pytest -q`, `uv run ticket-cli parse --help` และ `uv run ruff check .` ให้ผ่านทั้งหมด",
    ],
    starter: {
      language: "python",
      filename: "src/ticket_cli/cli.py",
      code: `"""Thin Typer CLI wrapper for ticket_cli (วางใน src/ticket_cli/cli.py)."""

from pathlib import Path
from typing import Annotated
import typer

from ticket_cli.processor import process_jsonl_file

app = typer.Typer(help="Thai Support Ticket Processor CLI")


@app.callback()
def main_callback() -> None:
    """Manage and validate Thai support ticket JSONL files."""


@app.command()
def parse(
    input_path: Annotated[Path, typer.Argument(help="ไฟล์ JSONL ต้นทาง")],
    output: Annotated[
        Path | None, typer.Option("--output", "-o", help="พาธไฟล์ JSONL ปลายทาง")
    ] = None,
    strict: Annotated[
        bool, typer.Option("--strict", help="คืน exit code 1 หากมีแถวไม่ผ่านการตรวจ")
    ] = False,
) -> None:
    """ตรวจสอบและคัดกรองทิกเก็ตภาษาไทยจากไฟล์ JSONL"""
    # TODO: ตรวจว่า input_path มีอยู่จริง, เรียก process_jsonl_file,
    # พิมพ์ progress/errors ลง stderr, พิมพ์ report.model_dump_json() ลง stdout,
    # และโยน typer.Exit(code=1) เมื่อ strict=True และ report.errors > 0
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_ticket_cli.py",
      code: `import inspect
import json
from pathlib import Path
import tomllib
from typer.testing import CliRunner

import ticket_cli
from ticket_cli.cli import app


def make_runner() -> CliRunner:
    if "mix_stderr" in inspect.signature(CliRunner.__init__).parameters:
        return CliRunner(mix_stderr=False)
    return CliRunner()


def test_package_layout_pyproject_and_gitignore():
    pkg_file = Path(ticket_cli.__file__).resolve()
    assert "src" in pkg_file.parts
    repo_root = pkg_file.parents[2]

    pyproject = tomllib.loads((repo_root / "pyproject.toml").read_text(encoding="utf-8"))
    assert "build-system" in pyproject
    assert pyproject["project"]["scripts"]["ticket-cli"] == "ticket_cli.cli:app"

    ignore_lines = {
        ln.strip()
        for ln in (repo_root / ".gitignore").read_text(encoding="utf-8").splitlines()
        if ln.strip() and not ln.strip().startswith("#")
    }
    for required in (".env", ".venv/", "data/raw/", "*.parquet"):
        assert required in ignore_lines


def test_parse_command_normal_mode_writes_clean_jsonl(tmp_path: Path):
    raw = tmp_path / "raw.jsonl"
    out = tmp_path / "clean.jsonl"
    raw.write_text(
        '{"ticket_id": " TKT-101 ", "channel": "line", "message_th": "ขอใบกำกับภาษีครับ"}\\n'
        '{"ticket_id": "BAD-1", "channel": "web", "message_th": "รหัสผิดรูปแบบ"}\\n'
        '{broken-json\\n',
        encoding="utf-8",
    )

    res = make_runner().invoke(app, ["parse", str(raw), "--output", str(out)])
    assert res.exit_code == 0

    report = json.loads(res.stdout)
    assert report["total"] == 3
    assert report["valid"] == 1
    assert report["errors"] == 2
    assert res.stderr.strip() != ""

    clean_lines = out.read_text(encoding="utf-8").splitlines()
    assert len(clean_lines) == 1
    assert json.loads(clean_lines[0])["ticket_id"] == "TKT-101"


def test_parse_command_strict_mode_exits_1_on_errors(tmp_path: Path):
    raw = tmp_path / "raw.jsonl"
    raw.write_text(
        '{"ticket_id": "TKT-201", "channel": "email", "message_th": "   "}\\n',
        encoding="utf-8",
    )
    res = make_runner().invoke(app, ["parse", str(raw), "--strict"])
    assert res.exit_code == 1
    report = json.loads(res.stdout)
    assert report["valid"] == 0
    assert report["errors"] == 1


def test_parse_command_missing_file_exits_1(tmp_path: Path):
    res = make_runner().invoke(app, ["parse", str(tmp_path / "missing.jsonl")])
    assert res.exit_code == 1
    assert "not found" in res.stderr.lower() or "ไม่พบ" in res.stderr
`,
    },
    selfCheck: [
      "`src/ticket_cli/` ถูกติดตั้งแบบ editable ผ่าน `uv sync` และ `[project.scripts]` ชี้ไปที่ `ticket_cli.cli:app`",
      "`.gitignore` มีกฎกัน `.env`, `.venv/`, `data/raw/` และ `*.parquet` ครบถ้วน",
      "คำสั่ง `ticket-cli parse` แยก JSON report ออก `stdout` และ progress/errors ออก `stderr` อย่างเด็ดขาด",
      "โหมดปกติเขียนเฉพาะทิกเก็ตที่ผ่านลง `--output` และจบด้วย exit code `0` ส่วนโหมด `--strict` คืน exit code `1` เมื่อพบแถวเสีย",
      "รัน `uv run pytest -q` ผ่าน 4/4, `uv run ticket-cli parse --help` แสดงคู่มือชัดเจน และ `uv run ruff check .` สะอาด",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q`, รัน `uv run ticket-cli parse --help` ได้จริง และ `uv run ruff check .` ไม่มี warning",
    hints: [
      {
        body: "วาง `SupportTicket` ใน `src/ticket_cli/models.py` (เพิ่ม `@field_validator('ticket_id')` ตรวจ `startswith('TKT-')`), วาง `process_jsonl_file` ใน `src/ticket_cli/processor.py` และอย่าลืมใส่ไฟล์ `src/ticket_cli/__init__.py`",
      },
      {
        body: "ใน `pyproject.toml` ตรวจว่ามี `[project.scripts]` บรรทัด `ticket-cli = \"ticket_cli.cli:app\"` และ `[build-system]` แล้วรัน `uv sync` อีกรอบเพื่อให้เทสต์ `tomllib` และคำสั่ง `uv run ticket-cli` ทำงานตรงกัน",
      },
      {
        body: "ตัวอย่าง `src/ticket_cli/models.py` พร้อม validator ตรวจ `TKT-` — นำไปเชื่อมกับ `processor.py` (จากหัวข้อ Concepts) และ `cli.py`",
        code: {
          language: "python",
          filename: "src/ticket_cli/models.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class SupportTicket(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=4)
    channel: Literal["line", "email", "web"]
    message_th: str = Field(min_length=5, max_length=500)

    @field_validator("ticket_id")
    @classmethod
    def check_prefix(cls, value: str) -> str:
        if not value.startswith("TKT-"):
            raise ValueError("ticket_id must start with 'TKT-'")
        return value`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv sync
uv run pytest -q
uv run ruff check .
uv run ticket-cli parse --help`,
      caption: "ลองเช็ก `git status -sb` ปิดท้ายเพื่อยืนยันว่าไม่มีไฟล์ `.env` หรือไฟล์ชั่วคราวหลุดรอ commit",
    },
  },

  mistakes: [
    {
      title: "ยัดโค้ดอ่านไฟล์และ validate Pydantic ทั้งหมดลงใน `cli.py` โดยไม่แยก `processor.py`",
      symptom: "ฟังก์ชัน `parse` ยาวและผูกติดกับ `typer.echo` ทำให้เขียน unit test หรือนำไปใช้ต่อใน FastAPI ลำบาก",
      fix: "ใช้แพตเทิร์น *Thin CLI, Fat Core* — แยก `process_jsonl_file` ไว้ใน `processor.py` แล้วให้ `cli.py` ทำหน้าที่แค่รับอินพุตและจัดการ stdout/stderr/exit code",
    },
    {
      title: "ลืมใส่ `@app.callback()` เมื่อ Typer app มีคำสั่ง `parse` เพียงคำสั่งเดียว",
      symptom: "เรียก `uv run ticket-cli parse raw.jsonl` แล้วฟ้อง `Got unexpected extra argument (raw.jsonl)`",
      fix: "เพิ่ม `@app.callback()` เปล่า 1 ตัวบน `app = typer.Typer()` เพื่อให้ Typer คงชื่อ subcommand `parse` ไว้",
    },
    {
      title: "ลืมรัน `uv sync` หลังแก้ `[project.scripts]` ใน `pyproject.toml`",
      symptom: "คำสั่ง `uv run ticket-cli` หาไม่เจอหรือยังชี้ไปที่ entry point เดิม",
      fix: "รัน `uv sync` ทุกครั้งที่มีการแก้ไข `[project.scripts]` หรือ `[build-system]`",
    },
    {
      title: "ใช้ `input_path.read_text()` โหลดไฟล์ JSONL ขนาดใหญ่ทั้งก้อนเข้า RAM แทน `open()` ทีละบรรทัด",
      symptom: "กับไฟล์ทดสอบเล็ก ๆ ทำงานปกติ แต่เมื่อเจอไฟล์ production ขนาดหลายร้อย MB หน่วยความจำพุ่งสูง",
      fix: "ใช้ `with input_path.open('r', encoding='utf-8') as fh:` วนอ่านทีละบรรทัดตามหลัก streaming ของ Day 5",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ ครอบคลุม D21–D23 + D5/D9) — ตอบจากความจำก่อนตรวจเฉลยเพื่อวัดความแม่นยำทั้ง Block B06",
    questions: [
      mc(
        "d024-q1",
        "[ทบทวน D21] ก่อนเปิด PR ของแพ็กเกจ `ticket-cli` คุณรัน `git status` แล้วเห็นไฟล์ 4 ตัวนี้กำลังจะถูก commit: `pyproject.toml`, `uv.lock`, `.env`, `data/raw/tickets.parquet` ควรจัดการอย่างไร?",
        [
          ["Commit ทั้งหมดเพื่อให้เพื่อนร่วมทีมมีข้อมูลและคีย์รันได้ทันที", "อันตรายมาก — `.env` มีความลับและ `data/raw/*.parquet` เป็นข้อมูลดิบขนาดใหญ่ ห้าม commit ทั้งคู่"],
          ["Commit เฉพาะ `pyproject.toml` และ `uv.lock`; ถอน `.env` กับ `data/raw/tickets.parquet` ออกแล้วใส่ใน `.gitignore`", "ถูก — เก็บเฉพาะไฟล์กำหนดสภาพแวดล้อมที่ทำซ้ำได้ ส่วนความลับและ raw data ต้องกันด้วย `.gitignore`"],
          ["Commit เฉพาะ `pyproject.toml` แล้วใส่ `uv.lock` ลง `.gitignore`", "ต้อง commit `uv.lock` เสมอเพื่อล็อกเวอร์ชัน dependency ให้ตรงกันทุกเครื่อง"],
          ["ลบไฟล์ `.env` และ `tickets.parquet` ออกจากเครื่องให้หมด", "ไม่จำเป็นต้องลบไฟล์บนเครื่อง — แค่ unstage (`git restore --staged`) และกันไว้ใน `.gitignore`"],
        ],
        "B",
        "Repo AI ที่สะอาดต้อง commit `pyproject.toml`, `uv.lock`, `.gitignore`, `.env.example` และกัน `.env`, `.venv/`, `data/raw/`, `*.parquet`, `*.pt` ไว้ใน `.gitignore` เสมอ",
        "ไฟล์ใดในรายการ `pyproject.toml`, `uv.lock`, `.env`, `data/raw/*.parquet` ที่ต้อง commit และไฟล์ใดต้อง ignore?",
        "Commit `pyproject.toml` + `uv.lock` | Ignore `.env` + `data/raw/*.parquet`",
      ),
      mc(
        "d024-q2",
        "[ทบทวน D22] คุณต้องการให้คำสั่ง `uv run ticket-cli` เรียกใช้ `app = typer.Typer()` ใน `src/ticket_cli/cli.py` ต้องตั้งค่า `[project.scripts]` ใน `pyproject.toml` อย่างไร และต้องรันคำสั่งใดตามมา?",
        [
          ["`ticket-cli = \"src/ticket_cli/cli.py\"` แล้วรัน `python cli.py`", "ผิดรูปแบบ — `[project.scripts]` ใช้ dotted module path ไม่ใช่ file path"],
          ["`ticket-cli = \"ticket_cli.cli:app\"` แล้วรัน `uv sync` เพื่อติดตั้ง entry point เข้า `.venv`", "ถูก — ชี้ด้วย `<pkg.module>:<callable>` และรัน `uv sync` เพื่อสร้างตัวรันคำสั่งใน `.venv`"],
          ["`ticket-cli = \"ticket-cli.cli:app\"` โดยไม่ต้องรัน `uv sync`", "ชื่อโมดูล Python ต้องใช้ขีดล่าง (`ticket_cli`) และต้องรัน `uv sync` หลังแก้ `[project.scripts]`"],
          ["ใส่ไว้ใน `.gitignore` แทน `pyproject.toml`", "`.gitignore` ไม่ได้ใช้ประกาศ entry point ของแพ็กเกจ"],
        ],
        "B",
        "รูปแบบมาตรฐานใน `[project.scripts]` คือ `command = \"package.module:callable\"` และต้องรัน `uv sync` เพื่อให้ `uv` สร้างตัวรันคำสั่งและเชื่อม editable install",
        "จะลงทะเบียน Typer `app` ใน `src/ticket_cli/cli.py` ให้เรียกผ่าน `uv run ticket-cli` ได้อย่างไร?",
        "เพิ่ม `ticket-cli = \"ticket_cli.cli:app\"` ใน `[project.scripts]` ของ `pyproject.toml` (พร้อมมี `[build-system]`) แล้วรัน `uv sync`",
      ),
      mc(
        "d024-q3",
        "[ทบทวน D23] เมื่อรัน `ticket-cli parse data.jsonl --strict` แล้วพบทิกเก็ตที่ validate ไม่ผ่าน 2 จาก 100 แถว พฤติกรรมใดถูกต้องตามวินัย UNIX CLI?",
        [
          ["พิมพ์ progress และ error ลง `stdout` แล้วจบด้วย exit code `0`", "ผิดทั้งสองจุด: ห้ามพิมพ์ progress/error ปนลง `stdout` และ `--strict` ต้องคืน non-zero exit code"],
          ["ส่งรายงาน JSON ออก `stdout`, ส่ง progress และรายละเอียดบรรทัดเสียออก `stderr`, แล้วโยน `raise typer.Exit(code=1)`", "ถูก — แยก data (`stdout`) ออกจาก diagnostics (`stderr`) และส่งสัญญาณ failure (`exit 1`) ให้ CI รับรู้"],
          ["ปล่อยให้ `ValidationError` พังกลางทางตั้งแต่แถวแรกโดยไม่สร้างรายงานสรุป", "การอ่านจนจบแล้วสรุปรายงานครบทุกแถวเสียช่วยให้ทีมแก้ข้อมูลได้ทีเดียว ไม่ต้องรันแก้ทีละแถว"],
          ["ส่งทุกอย่างลง `stderr` และปล่อย `stdout` ว่างเสมอ", "ถ้า caller ต้องการ parse รายงาน JSON ผ่าน pipe ต้องส่งข้อมูลหลักออก `stdout`"],
        ],
        "B",
        "CLI ระดับโปรดักชันต้องแยก `stdout` (ข้อมูลหลัก) ออกจาก `stderr` (progress/errors) และคืน exit code `1` ในโหมด `--strict` เมื่อพบความผิดพลาด",
        "ในโหมด `--strict` ของ `ticket-cli parse` เมื่อพบแถวเสีย ควรจัดการ `stdout`, `stderr` และ exit code อย่างไร?",
        "ส่ง JSON report ออก `stdout`, ส่ง progress/error ออก `stderr`, และจบด้วย `raise typer.Exit(code=1)`",
      ),
      mc(
        "d024-q4",
        "[ทบทวน D5/D9/D24] เหตุใดเราจึงแยก `process_jsonl_file(input_path, output_path)` ไว้ใน `processor.py` และใช้ `tmp_path` ใน `pytest` แทนการเขียน logic ทั้งหมดลง `cli.py` และทดสอบกับไฟล์จริงในโฟลเดอร์โปรเจกต์?",
        [
          ["เพราะ Typer ไม่อนุญาตให้ import `pydantic` ในไฟล์ `cli.py`", "Import ได้ตามปกติ แต่การแยกโมดูลทำให้สถาปัตยกรรมสะอาดกว่ามาก"],
          ["ทำให้ core logic นำไปใช้ซ้ำได้ทั้ง CLI และ FastAPI และ `tmp_path` สร้างโฟลเดอร์ชั่วคราวที่แยกขาดและลบทิ้งให้อัตโนมัติหลังจบเทสต์", "ถูก — Thin CLI, Fat Core เพิ่มการนำกลับมาใช้ซ้ำ ส่วน `tmp_path` ทำให้เทสต์สะอาดและไม่ทิ้งไฟล์ขยะใน repo"],
          ["เพราะ `pytest` อ่านไฟล์ในโฟลเดอร์โปรเจกต์ไม่ได้", "`pytest` อ่านได้ แต่การเขียนไฟล์ทดสอบทับโฟลเดอร์โปรเจกต์จะทำให้ `git status` สกปรกและเทสต์ชนกันเอง"],
          ["เพราะ `Path.open()` ใช้ได้เฉพาะในไฟล์ที่ชื่อ `processor.py`", "`pathlib.Path` ใช้ได้ในทุกไฟล์ Python"],
        ],
        "B",
        "การแยก Thin CLI / Fat Core ทำให้โค้ดขยายต่อสู่ Phase 5 ได้ราบรื่น และ `tmp_path` fixture ของ `pytest` รับประกันว่าเทสต์ทุกข้อแยกอิสระและไม่สร้างไฟล์ขยะค้างใน Git repo",
        "ประโยชน์ของการแยก `processor.py` ออกจาก `cli.py` และการทดสอบด้วย `tmp_path` fixture คืออะไร?",
        "`processor.py` นำไปใช้ซ้ำได้ทั้ง CLI/API/Eval และทดสอบง่าย ส่วน `tmp_path` ให้โฟลเดอร์ชั่วคราวที่สะอาดและไม่ทิ้งไฟล์ขยะไว้ใน repo",
      ),
    ],
  },

  takeaways: [
    "แพ็กเกจ Python AI ที่พร้อมส่งมอบประกอบด้วย 4 เสาหลัก: Git hygiene (`.gitignore` + `uv.lock`), `src/` layout, `[project.scripts]` และ Typer CLI ที่แยก `stdout`/`stderr`",
    "ยึดหลัก **Thin CLI, Fat Core**: เก็บ logic การอ่าน streaming JSONL และ Pydantic validation ไว้ใน `processor.py` เพื่อให้ใช้ซ้ำได้ทั้งใน CLI และ FastAPI",
    "รองรับทั้งโหมดทนทานต่อของเสีย (exit 0 + แยกของดีลง `--output`) และโหมด `--strict` (exit 1 สำหรับ CI quality gate)",
    "ทดสอบครบทั้งโครงสร้างแพ็กเกจ (`tomllib`, `.gitignore`) และพฤติกรรม CLI (`CliRunner` + `tmp_path`) ในชุด `pytest` เดียวก่อนเปิด PR",
  ],

  reviewCards: [
    rc(
      "d024-rc-1",
      "หลักการ *Thin CLI, Fat Core* ในแพ็กเกจ `ticket-cli` หมายถึงอะไร และมีประโยชน์อย่างไร?",
      "แยก logic การประมวลผลทั้งหมด (`process_jsonl_file`) ไว้ใน `processor.py` และให้ `cli.py` ทำแค่รับอินพุต, แสดงผล `stdout`/`stderr` และคืน exit code — ทำให้เทสต์ง่ายและนำไปหุ้มด้วย FastAPI ต่อได้ทันที",
    ),
    rc(
      "d024-rc-2",
      "ทำไมคำสั่ง `ticket-cli parse` จึงควรมีทั้งโหมดปกติและโหมด `--strict`?",
      "โหมดปกติแยกของดีออกและจบด้วย exit 0 เพื่อไม่ให้แถวเสีย 1 แถวทำ batch รายวันล่ม ส่วนโหมด `--strict` คืน exit 1 ทันทีเมื่อมี error เพื่อใช้เป็น quality gate ใน CI",
    ),
    rc(
      "d024-rc-3",
      "หลังประกอบแพ็กเกจ `src/ticket_cli/` และตั้ง `[project.scripts]` เสร็จแล้ว 4 คำสั่งใดที่ควรรันเพื่อยืนยันความพร้อมก่อนเปิด PR?",
      "`uv sync` (ติดตั้ง editable + entry point), `uv run pytest -q` (ผ่านทุกเทสต์), `uv run ruff check .` (ไม่มี lint error), และ `git status -sb` (ไม่มีไฟล์ต้องห้ามหลุดเข้า staging)",
    ),
  ],

  sources: [
    { label: "Python Packaging User Guide — src layout vs flat layout", href: "https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/" },
    { label: "Typer Official Docs — SubCommands & Testing with CliRunner", href: "https://typer.tiangolo.com/tutorial/testing/" },
    { label: "pytest Official Docs — Temporary directories (`tmp_path`)", href: "https://docs.pytest.org/en/stable/how-to/tmp_path.html" },
    { label: "uv Official Docs — Working on Projects", href: "https://docs.astral.sh/uv/guides/projects/" },
  ],

  glossary: [
    "uv",
    "pyproject",
    "lockfile",
    "typer",
    "pydantic",
    "jsonl",
    "pathlib",
    "pytest",
  ],
});
