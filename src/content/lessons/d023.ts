import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D023 — Phase 1 / Block B06
 * CLI Tooling with Typer + Progress Reporting.
 */
export const d023: Lesson = defineLesson({
  day: 23,
  titleTh: "สร้าง CLI ระดับโปรดักชันด้วย Typer: Type Hints, Progress และ Exit Codes",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · แปลงฟังก์ชัน Python ที่มี type hints ให้เป็น CLI พร้อม --help, แยก stdout/stderr และทดสอบได้ด้วย CliRunner",
  icon: "rocket",
  visual: {
    id: "git-package-cli",
    title: "สร้าง CLI จาก Type Hints ด้วย Typer + Progress & Exit Codes",
    caption: "ดูการแปลงฟังก์ชัน Python typed ให้เป็นคำสั่ง CLI พร้อม --help, validation และ exit code มาตรฐาน",
    alt: "แผนภาพการทำงานของ Typer CLI จาก type hints",
  },
  requiresApiKey: false,
  tools: ["Typer", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ควบคุมงาน Data Ingestion และ Batch Pipeline ผ่านคำสั่งมาตรฐาน",
      body: "ในทีม AI งานดึงข้อมูล ล้างไฟล์ {{jsonl}} หรือสร้างดัชนีเอกสาร (indexing) แทบทั้งหมดถูกรันผ่าน CLI ทั้งบนเครื่องนักพัฒนาและในตารางงานอัตโนมัติ (cron / CI)",
      lessonNote: "วันนี้เราใช้ {{typer}} เปลี่ยนฟังก์ชันที่มี {{type-hint}} ให้เป็น CLI ที่ใช้งานง่ายและตรวจพารามิเตอร์ผิดแบบ {{fail-fast}}",
    },
    {
      node: 3,
      heading: "สื่อสารผลลัพธ์กับ CI/CD ด้วย Exit Codes ที่ถูกต้อง",
      body: "สคริปต์ประเมินคุณภาพ AI (eval runner) ต้องส่งสัญญาณให้ GitHub Actions รู้ทันทีว่าผ่าน (`exit 0`) หรือไม่ผ่านเกณฑ์ (`exit 1`) ไม่ใช่พิมพ์คำว่า Error แล้วจบด้วย exit 0 เงียบ ๆ",
      lessonNote: "คุณจะได้ใช้ `raise typer.Exit(code=1)` และเขียนเทสต์อัตโนมัติด้วย `CliRunner` + {{pytest}}",
    },
    {
      node: 4,
      heading: "สร้างประสบการณ์ผู้ใช้ (DX) ที่ดีด้วย `--help` และ Progress Reporting",
      body: "งาน batch ที่ประมวลผลเอกสาร 5,000 ชิ้นจะดูเหมือนโปรแกรมค้างหากไม่มี progress indicator แต่ถ้าพิมพ์ progress ปนลง `stdout` ก็จะทำลาย output JSON ที่ถูก pipe ต่อ",
      lessonNote: "เราเรียนรู้วินัย UNIX CLI: ส่ง **ข้อมูล** ออก `stdout` และส่ง **progress/log/error** ออก `stderr`",
    },
    {
      node: 5,
      heading: "เชื่อมต่อท่อประมวลผล (Pipes) และเก็บ Log แยกจากข้อมูลได้อย่างสะอาด",
      body: "เมื่อ CLI แยก `stdout` กับ `stderr` ชัดเจน คุณสามารถสั่ง `my-cli stats data.jsonl --json-out | jq .` ได้ทันทีโดยไม่มีข้อความ progress หรือ warning ปนเข้าไปทำให้ JSON พัง",
      lessonNote: "วินัยนี้เป็นมาตรฐานเดียวกับที่เครื่องมือระดับโลกอย่าง `uv`, `ruff` และ `curl` ใช้ทุกวัน",
    },
  ],

  objectives: [
    "**สร้าง** CLI แบบหลายคำสั่งด้วย `typer.Typer()` โดยใช้ {{type-hint}} (`Path`, `int`, `bool`) และ `Annotated` สำหรับ Argument/Option พร้อม `--help` อัตโนมัติ",
    "**ประยุกต์ใช้วินัย UNIX CLI**: แยกข้อมูลผลลัพธ์ออก `stdout`, ส่ง progress และข้อความ error ออก `stderr` (`err=True`), และกำหนด exit code ด้วย `typer.Exit(code=...)`",
    "**เขียนเทสต์อัตโนมัติ** สำหรับคำสั่ง CLI ด้วย `typer.testing.CliRunner` และ {{pytest}} โดยไม่ต้อง spawn subprocess ช้า ๆ",
  ],

  prerequisites: [
    "คุ้นเคยกับ `Path` จาก Day 5 (`pathlib`), JSONL และ `pytest` จาก Day 9",
    "เข้าใจ `type hints` (`Annotated`, `Path`, `int`, `bool`) และ `[project.scripts]` จาก Day 22",
    "ไม่ต้องใช้ API key — รันและทดสอบ CLI บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ด้วย {{uv}} แล้วติดตั้ง {{typer}} พร้อม `pytest` และ {{ruff}} เพื่อเริ่มสร้างและทดสอบ CLI ที่อ่านไฟล์ด้วย {{pathlib}} บนเครื่อง",
    commands: `uv init ai-day23-typer && cd ai-day23-typer
uv add typer
uv add --dev pytest ruff

# ตรวจว่าติดตั้ง Typer สำเร็จ
uv run python -c "import typer; print('Typer:', typer.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day23-typer` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `typer` และ dev tools (`pytest`, `ruff`)"],
      ["verify", "รันเช็กเวอร์ชัน Typer ด้วย `uv run python` สำเร็จ"],
    ],
    note: "`typer` สร้างโดยผู้พัฒนาคนเดียวกับ `FastAPI` — หากคุณชินกับ `Annotated[...]` และ type hints ของ Typer วันนี้ คุณจะอ่านและเขียน FastAPI ใน Phase 5 ได้คล่องทันที",
  },

  concepts: [
    {
      id: "typer-from-type-hints",
      title: "1 · แปลง Python Type Hints เป็น CLI อัตโนมัติด้วย `Typer`",
      paragraphs: [
        "แทนที่จะต้องเขียนโค้ด `argparse` ยืดยาวเพื่อ parse อาร์กิวเมนต์และแปลงชนิดข้อมูลเอง {{typer}} อ่าน {{type-hint}} ของฟังก์ชัน Python โดยตรง: พารามิเตอร์ที่ไม่มีค่าเริ่มต้นจะกลายเป็น **Argument** (บังคับส่งตามตำแหน่ง) ส่วนพารามิเตอร์ที่มีค่าเริ่มต้นจะกลายเป็น **Option** (`--limit 10` หรือ `--verbose`)",
        "เมื่อใช้คู่กับ `typing.Annotated` คุณสามารถแนบคำอธิบาย `help=...`, ตรวจขอบเขตตัวเลข (`min=1`), หรือเช็กว่าไฟล์อินพุตมีอยู่จริง (`exists=True`) ทำให้ CLI สร้างหน้า `--help` ที่สวยงามและปฏิเสธอินพุตผิดแบบ {{fail-fast}} ตั้งแต่ก่อนเข้าโค้ดหลัก",
      ],
      analogy:
        "เหมือนเครื่องพิมพ์แบบฟอร์มอัตโนมัติ — แค่คุณระบุประเภทช่องกรอกไว้ในลายเซ็นฟังก์ชัน (`Path`, `int`, `bool`) Typer ก็สร้างหน้าคู่มือ `--help`, ตัวตรวจข้อมูลผิด และข้อความแจ้งเตือนให้ครบชุดทันที",
      code: {
        language: "python",
        filename: "demo_typer.py",
        code: `from pathlib import Path
from typing import Annotated
import typer

app = typer.Typer(help="เครื่องมือจัดการชุดข้อมูลทิกเก็ตภาษาไทย")


@app.command()
def inspect(
    input_path: Annotated[Path, typer.Argument(help="พาธไฟล์ JSONL ต้นทาง")],
    limit: Annotated[int, typer.Option("--limit", "-n", min=1, help="จำนวนบรรทัดสูงสุดที่จะอ่าน")] = 10,
    json_out: Annotated[bool, typer.Option("--json-out", help="พิมพ์ผลลัพธ์เป็น JSON")] = False,
) -> None:
    """ตรวจสอบจำนวนบรรทัดในไฟล์ JSONL"""
    if not input_path.is_file():
        typer.echo(f"Error: ไม่พบไฟล์ {input_path}", err=True)
        raise typer.Exit(code=1)

    lines = input_path.read_text(encoding="utf-8").splitlines()[:limit]
    if json_out:
        typer.echo(f'{{"file": "{input_path.name}", "shown": {len(lines)}}}')
    else:
        typer.echo(f"{input_path.name}: แสดง {len(lines)} บรรทัด")


if __name__ == "__main__":
    app()`,
        caption: "สังเกตว่าไม่ต้องเขียน parser เองเลย — Typer แปลง `Path`, `int`, `bool` และสร้าง `--help` จาก docstring กับ `help=` ให้อัตโนมัติ",
      },
      whyTitle: "Why this matters — ชนิดข้อมูลตรงตั้งแต่ขอบ CLI",
      whyParagraphs: [
        "ใน `argparse` หากคุณลืมกำหนด `type=int` ค่า `--limit` จะเข้ามาเป็น `str` แล้วไปพังกลางลูปตอนเทียบเลข แต่ใน Typer Type Hint บังคับให้แปลงเป็น `int` และตรวจ `min=1` ก่อนเข้าฟังก์ชันเสมอ",
        "เมื่อต้องเพิ่มคำสั่งย่อย (`parse`, `stats`, `eval`) แค่ติด `@app.command()` เพิ่มบนฟังก์ชันใหม่ ไม่ต้องสร้าง subparser ซับซ้อน",
      ],
    },
    {
      id: "stdout-stderr-progress-exit-codes",
      title: "2 · วินัย UNIX CLI: แยก `stdout` vs `stderr`, Progress และ Exit Codes",
      paragraphs: [
        "หัวใจของ CLI ที่นำไปต่อท่อ (pipe) หรือรันใน CI ได้จริงคือการแยก 2 ช่องสัญญาณออกจากกันอย่างเด็ดขาด: **`stdout`** ใช้สำหรับ *ข้อมูลผลลัพธ์หลัก* (เช่น JSON, JSONL, ตารางผลลัพธ์) ส่วน **`stderr`** (`typer.echo(..., err=True)`) ใช้สำหรับ *ข้อความสถานะ, progress reporting, warning และข้อความ error*",
        "อีกกฎที่ห้ามลืมคือ **Exit Code**: คืน `0` เมื่อสำเร็จเท่านั้น และโยน `raise typer.Exit(code=1)` เมื่อเกิดข้อผิดพลาดระหว่างทำงาน (เช่น ไฟล์ไม่พบ, JSON เสียทั้งหมด, หรือผล eval ต่ำกว่าเกณฑ์) ส่วนอาร์กิวเมนต์ที่ผิดรูปแบบ Typer/Click จะคืน exit code `2` ให้อัตโนมัติ",
      ],
      analogy:
        "เหมือนสายพานโรงงานที่มี 2 ช่องออก: ช่องสินค้าสำเร็จรูป (`stdout`) ส่งตรงไปเครื่องแพ็กเกจถัดไป ส่วนหน้าจอบอกสถานะเครื่องจักรและสัญญาณไฟแดง (`stderr` + exit code) มีไว้ให้ช่างดูโดยไม่ปะปนลงไปในกล่องสินค้า",
      code: {
        language: "python",
        filename: "progress_stderr.py",
        code: `import json
import sys
from pathlib import Path
import typer

app = typer.Typer()


@app.command()
def count_lines(input_path: Path) -> None:
    if not input_path.is_file():
        typer.echo(f"Error: file not found: {input_path}", err=True)
        raise typer.Exit(code=1)

    lines = [ln for ln in input_path.read_text(encoding="utf-8").splitlines() if ln.strip()]
    processed = 0
    # ส่ง progress bar ไปที่ sys.stderr เพื่อไม่ให้ปนกับ JSON บน stdout
    with typer.progressbar(lines, label="Processing", file=sys.stderr) as bar:
        for _ in bar:
            processed += 1

    # stdout ส่งเฉพาะข้อมูล JSON สะอาด พร้อม pipe เข้า jq หรือไฟล์อื่นได้ทันที
    typer.echo(json.dumps({"file": input_path.name, "rows": processed}, ensure_ascii=False))`,
        caption: "กำหนด `file=sys.stderr` ให้ `typer.progressbar` เสมอเมื่อคำสั่งของคุณพิมพ์ข้อมูล JSON ออก `stdout`",
      },
      whyTitle: "Why this matters — ทำไม CLI ที่พังเงียบ ๆ ด้วย Exit Code 0 ถึงอันตราย",
      whyParagraphs: [
        "ถ้าสคริปต์ ingest ข้อมูลพังแต่คุณแค่ `typer.echo('Error')` แล้ว `return` เฉย ๆ โปรแกรมจะจบด้วย exit code `0` — ระบบ CI/CD หรือ cron จะเข้าใจผิดว่างานสำเร็จแล้วเดินหน้า deploy โมเดลบนข้อมูลว่างเปล่า!",
        "การโยน `raise typer.Exit(code=1)` คู่กับข้อความอธิบายบน `stderr` ทำให้ทั้งคนและเครื่องจักรรู้ทันทีว่าเกิดอะไรขึ้น",
      ],
    },
    {
      id: "testing-cli-with-clirunner",
      title: "3 · ทดสอบ CLI อย่างรวดเร็วและแม่นยำด้วย `CliRunner`",
      paragraphs: [
        "หลายคนหลีกเลี่ยงการเขียนเทสต์ให้ CLI เพราะคิดว่าต้องเรียก `subprocess.run(...)` ซึ่งช้าและจัดการพาธยาก แต่ {{typer}} มี **`typer.testing.CliRunner`** ที่จำลองการรันคำสั่งในหน่วยความจำโดยตรงภายในไม่กี่มิลลิวินาที",
        "เมื่อเรียก `result = runner.invoke(app, [\"stats\", str(sample_file), \"--json-out\"])` คุณสามารถ `assert result.exit_code == 0`, แปลง `json.loads(result.stdout)` เพื่อตรวจโครงสร้างข้อมูล, และตรวจข้อความ progress/error ได้ครบทั้งกรณีสำเร็จและกรณีล้มเหลวร่วมกับ `tmp_path` ของ {{pytest}}",
      ],
      analogy:
        "เหมือนเครื่องจำลองการบิน (flight simulator) สำหรับ CLI — คุณกดปุ่มสั่งงานและจำลองสถานการณ์ฉุกเฉิน (ไฟล์หาย, อินพุตพัง) ได้ร้อยรอบใน 1 วินาทีโดยไม่ต้องเปิดโปรเซส terminal จริงทุกครั้ง",
      code: {
        language: "python",
        filename: "test_cli_example.py",
        code: `import inspect
import json
from pathlib import Path
from typer.testing import CliRunner
from demo_typer import app


def make_runner() -> CliRunner:
    # รองรับทั้ง Click 8.1 (ต้องระบุ mix_stderr=False) และ Click 8.2+ (แยกให้อัตโนมัติ)
    if "mix_stderr" in inspect.signature(CliRunner.__init__).parameters:
        return CliRunner(mix_stderr=False)
    return CliRunner()


def test_inspect_json_output(tmp_path: Path):
    sample = tmp_path / "tickets.jsonl"
    sample.write_text('{"id": 1}\\n{"id": 2}\\n', encoding="utf-8")

    runner = make_runner()
    result = runner.invoke(app, ["inspect", str(sample), "--limit", "1", "--json-out"])

    assert result.exit_code == 0
    assert json.loads(result.stdout) == {"file": "tickets.jsonl", "shown": 1}


def test_inspect_missing_file_exits_nonzero(tmp_path: Path):
    runner = make_runner()
    result = runner.invoke(app, ["inspect", str(tmp_path / "missing.jsonl")])
    assert result.exit_code == 1
    assert "ไม่พบไฟล์" in result.stderr`,
        caption: "เมื่อแยก `stdout` ออกจาก `stderr` อย่างถูกต้อง `json.loads(result.stdout)` จะผ่านเสมอแม้คำสั่งจะพิมพ์ progress ออก `stderr`",
      },
      whyTitle: "Why this matters — มั่นใจทุกครั้งที่เพิ่ม Option ใหม่",
      whyParagraphs: [
        "CLI ที่มี option เยอะมักพังจากเรื่องเล็ก ๆ เช่น ชื่อ flag ชนกัน, ลืมค่า default, หรือพิมพ์ log หลุดไปปนกับ `--json-out`",
        "ชุดเทสต์ `CliRunner` ที่รันจบใน < 0.2 วินาทีจะคอยเฝ้าสัญญา (contract) ของ CLI คุณทุกครั้งก่อนเปิด PR",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Typer กับ Commander.js / Yargs / Oclif",
      body: [
        "ถ้าคุณเคยสร้าง Node CLI ด้วย `commander` หรือ `yargs` คุณจะชอบ `Typer` เพราะไม่ต้องกำหนด schema แยกจากฟังก์ชัน TypeScript/Python:",
      ],
      table: [
        ["`app = typer.Typer()` + `@app.command()`", "`program.command('stats')` ใน Commander.js"],
        ["`Annotated[int, typer.Option('--limit')] = 10`", "`.option('--limit <n>', '...', parseInt, 10)`"],
        ["`typer.echo(data)` vs `typer.echo(msg, err=True)`", "`process.stdout.write` vs `console.error`"],
        ["`raise typer.Exit(code=1)`", "`process.exit(1)` (แต่ `typer.Exit` ทดสอบใน unit test ได้สะอาดกว่า)"],
        ["`CliRunner().invoke(app, [...])`", "รัน CLI ใน memory test แทนการ `execa` / `child_process`"],
      ],
    },
    student: {
      title: "First-Year Note — `stdout` กับ `stderr` คืออะไร และทำไมหน้าจอจึงแสดงปนกัน?",
      body: [
        "เวลาคุณรันโปรแกรมใน terminal ปกติ ทั้ง `stdout` (Standard Output) และ `stderr` (Standard Error) จะถูกพิมพ์ขึ้นมาบนหน้าจอเดียวกัน ทำให้ดูเหมือนไม่มีความต่าง",
        "ความต่างจะโผล่ทันทีเมื่อคุณส่งผลลัพธ์ลงไฟล์ด้วย `>` เช่น `uv run python app.py > result.json` — เครื่องหมาย `>` จะจับเฉพาะ **`stdout`** ลงไฟล์ `result.json` ส่วน progress หรือข้อความ error บน **`stderr`** จะยังแสดงบนหน้าจอให้คุณเห็น ทำให้ไฟล์ `result.json` สะอาด 100%!",
      ],
    },
  },

  workedExample: {
    intro:
      "สร้าง CLI ขนาดกะทัดรัดสำหรับนับและสรุปทิกเก็ตภาษาไทยในไฟล์ {{jsonl}} โดยใช้ {{typer}} แยก `stdout`/`stderr`, รายงานความคืบหน้า และทดสอบด้วย `CliRunner`",
    steps: [
      {
        title: "1 · ประกาศ Typer App พร้อม Subcommand และ Typed Options",
        explain:
          "ใช้ `Annotated` เพื่อกำหนด argument `input_path: Path` และ option `--min-len: int`, `--json-out: bool` พร้อมตรวจไฟล์ไม่พบด้วย `raise typer.Exit(code=1)`",
        code: {
          language: "python",
          filename: "worked_d023_cli.py",
          code: `import json
from pathlib import Path
from typing import Annotated
import typer

app = typer.Typer(help="Thai Ticket JSONL CLI Utility")


@app.command()
def summary(
    input_path: Annotated[Path, typer.Argument(help="ไฟล์ JSONL ต้นทาง")],
    min_len: Annotated[int, typer.Option("--min-len", min=1, help="ความยาวข้อความขั้นต่ำ")] = 5,
    json_out: Annotated[bool, typer.Option("--json-out", help="ส่งออกผลสรุปเป็น JSON")] = False,
) -> None:
    """สรุปจำนวนทิกเก็ตที่ผ่านความยาวขั้นต่ำ"""
    if not input_path.is_file():
        typer.echo(f"Error: ไม่พบไฟล์ {input_path}", err=True)
        raise typer.Exit(code=1)

    total = 0
    matched = 0
    for idx, line in enumerate(input_path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        total += 1
        row = json.loads(line)
        if len(str(row.get("message_th", "")).strip()) >= min_len:
            matched += 1
        typer.echo(f"[progress] scanned row {idx}", err=True)

    payload = {"total": total, "matched": matched, "min_len": min_len}
    if json_out:
        typer.echo(json.dumps(payload, ensure_ascii=False))
    else:
        typer.echo(f"Summary: matched {matched}/{total} rows (min_len={min_len})")`,
        },
        output: `# พร้อมเรียกผ่าน python worked_d023_cli.py summary ... หรือทดสอบด้วย CliRunner`,
      },
      {
        title: "2 · ดูหน้า `--help` และการแยกท่อ `stdout` / `stderr` ตอนรันจริง",
        explain:
          "เมื่อส่ง `--json-out` ข้อมูล JSON จะออกที่ `stdout` เพียว ๆ ส่วนบรรทัด `[progress]` ออกที่ `stderr` สามารถ redirect `> out.json` ได้อย่างปลอดภัย",
        code: {
          language: "bash",
          filename: "run_cli.sh",
          code: `uv run python worked_d023_cli.py summary --help
uv run python worked_d023_cli.py summary sample.jsonl --min-len 5 --json-out > out.json
cat out.json`,
        },
        output: `[progress] scanned row 1
[progress] scanned row 2
{"total": 2, "matched": 2, "min_len": 5}`,
      },
      {
        title: "3 · ทดสอบทั้งกรณีสำเร็จและไฟล์หายด้วย `CliRunner`",
        explain:
          "ใช้ `CliRunner` เรียกคำสั่งโดยตรงในหน่วยความจำ ตรวจ `exit_code`, `stdout` (parse JSON ได้จริง) และ `stderr` (มี progress/error)",
        code: {
          language: "python",
          filename: "test_worked_d023.py",
          code: `import inspect
import json
from pathlib import Path
from typer.testing import CliRunner
from worked_d023_cli import app


def make_runner() -> CliRunner:
    if "mix_stderr" in inspect.signature(CliRunner.__init__).parameters:
        return CliRunner(mix_stderr=False)
    return CliRunner()


def test_summary_separates_stdout_and_stderr(tmp_path: Path):
    data = tmp_path / "tickets.jsonl"
    data.write_text(
        '{"message_th": "ขอใบกำกับภาษีครับ"}\\n{"message_th": "สั้น"}\\n',
        encoding="utf-8",
    )
    res = make_runner().invoke(app, ["summary", str(data), "--min-len", "5", "--json-out"])
    assert res.exit_code == 0
    assert json.loads(res.stdout) == {"total": 2, "matched": 1, "min_len": 5}
    assert "[progress]" in res.stderr`,
        },
        output: `1 passed in 0.08s`,
      },
    ],
    gotcha:
      "ข้อควรระวังเมื่อใช้ `typer.Typer()` ที่มี **คำสั่งเดียว**: ถ้ามี `@app.command()` แค่ 1 ฟังก์ชัน Typer จะยุบชื่อ subcommand ทิ้ง (เรียก `app sample.jsonl` แทน `app summary sample.jsonl`) — หากต้องการให้เรียกแบบมีชื่อ subcommand เสมอแม้จะมีคำสั่งเดียว ให้เพิ่ม `@app.callback()` หรือเพิ่มคำสั่งที่ 2!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างเครื่องมือ CLI `ticket_stats_cli.py` ด้วย `Typer` ที่มี 2 คำสั่งย่อย (`stats` และ `filter-channel`) พร้อมแยก `stdout`/`stderr`, รายงาน progress, จัดการ exit code เมื่อเกิดข้อผิดพลาด และผ่านเทสต์ `CliRunner` ครบทุกกรณี",
    requirements: [
      "สร้าง `app = typer.Typer(help=\"Ticket JSONL CLI\")` ที่มี 2 คำสั่งย่อย: `stats` และ `filter-channel` (`def filter_channel(...)`)",
      "คำสั่ง `stats(input_path: Path, min_len: int = 5, json_out: bool = False)`: ถ้าไฟล์ไม่พบให้พิมพ์ error ลง `stderr` และ `raise typer.Exit(code=1)`; อ่านไฟล์ {{jsonl}} ทีละบรรทัด (ข้ามบรรทัดว่าง), นับ `total`, `valid_len` (จำนวนแถวที่ `len(str(row.get('message_th', '')).strip()) >= min_len`) และ `bad_json` (บรรทัดที่ `json.loads` พัง), พิมพ์บรรทัดความคืบหน้าลง `stderr` (`err=True`), และพิมพ์ผลลัพธ์ลง `stdout` (เป็น JSON เมื่อ `--json-out` หรือข้อความสรุปปกติ)",
      "ถ้าในคำสั่ง `stats` มี `total == 0` (ไฟล์ว่าง) ให้พิมพ์ข้อความเตือนลง `stderr` และ `raise typer.Exit(code=1)`",
      "คำสั่ง `filter_channel(input_path: Path, channel: str, output: Path)`: กรองเฉพาะบรรทัด JSONL ที่อ่านได้และ `row.get('channel') == channel` แล้วเขียนออกไปยังไฟล์ `output` (UTF-8), พิมพ์ข้อความสถานะจำนวนแถวที่เขียนลง `stderr` และพิมพ์ JSON `{\"written\": <count>, \"channel\": <channel>}` ลง `stdout`; หาก `input_path` ไม่พบให้คืน `typer.Exit(code=1)`",
      "รันเทสต์ `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    starter: {
      language: "python",
      filename: "ticket_stats_cli.py",
      code: `import json
from pathlib import Path
from typing import Annotated
import typer

app = typer.Typer(help="Ticket JSONL CLI")


@app.command()
def stats(
    input_path: Annotated[Path, typer.Argument(help="ไฟล์ JSONL ต้นทาง")],
    min_len: Annotated[int, typer.Option("--min-len", min=1, help="ความยาวข้อความขั้นต่ำ")] = 5,
    json_out: Annotated[bool, typer.Option("--json-out", help="ส่งออกผลสรุปเป็น JSON")] = False,
) -> None:
    """คำนวณสถิติทิกเก็ตในไฟล์ JSONL"""
    # TODO: ตรวจไฟล์, อ่านทีละบรรทัด, รายงาน progress ลง stderr, พิมพ์ผลลง stdout
    raise NotImplementedError


@app.command("filter-channel")
def filter_channel(
    input_path: Annotated[Path, typer.Argument(help="ไฟล์ JSONL ต้นทาง")],
    channel: Annotated[str, typer.Option("--channel", "-c", help="ช่องทางที่ต้องการกรอง")],
    output: Annotated[Path, typer.Option("--output", "-o", help="พาธไฟล์ JSONL ปลายทาง")],
) -> None:
    """กรองเฉพาะทิกเก็ตตาม channel ที่ระบุไปยังไฟล์ปลายทาง"""
    # TODO: ตรวจไฟล์, กรองตาม channel, เขียน output JSONL, รายงานสถานะลง stderr และสรุป JSON ลง stdout
    raise NotImplementedError


if __name__ == "__main__":
    app()
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_stats_cli.py",
      code: `import inspect
import json
from pathlib import Path
from typer.testing import CliRunner
from ticket_stats_cli import app


def make_runner() -> CliRunner:
    if "mix_stderr" in inspect.signature(CliRunner.__init__).parameters:
        return CliRunner(mix_stderr=False)
    return CliRunner()


def test_stats_json_stdout_and_progress_stderr(tmp_path: Path):
    src = tmp_path / "tickets.jsonl"
    src.write_text(
        '{"ticket_id": "T1", "channel": "line", "message_th": "ขอใบเสร็จรับเงินครับ"}\\n'
        '{"ticket_id": "T2", "channel": "web", "message_th": "สั้น"}\\n'
        '{bad json line\\n',
        encoding="utf-8",
    )
    res = make_runner().invoke(app, ["stats", str(src), "--min-len", "5", "--json-out"])
    assert res.exit_code == 0
    data = json.loads(res.stdout)
    assert data == {"total": 3, "valid_len": 1, "bad_json": 1}
    assert res.stderr.strip() != ""


def test_stats_missing_and_empty_file_return_exit_1(tmp_path: Path):
    runner = make_runner()

    res_missing = runner.invoke(app, ["stats", str(tmp_path / "nope.jsonl")])
    assert res_missing.exit_code == 1
    assert res_missing.stderr.strip() != ""

    empty_file = tmp_path / "empty.jsonl"
    empty_file.write_text("   \\n\\n", encoding="utf-8")
    res_empty = runner.invoke(app, ["stats", str(empty_file)])
    assert res_empty.exit_code == 1


def test_filter_channel_writes_filtered_jsonl(tmp_path: Path):
    src = tmp_path / "tickets.jsonl"
    out = tmp_path / "line_only.jsonl"
    src.write_text(
        '{"ticket_id": "T1", "channel": "line", "message_th": "ทักจากไลน์ 1"}\\n'
        '{"ticket_id": "T2", "channel": "email", "message_th": "ทักจากอีเมล"}\\n'
        '{"ticket_id": "T3", "channel": "line", "message_th": "ทักจากไลน์ 2"}\\n'
        'not-json\\n',
        encoding="utf-8",
    )
    res = make_runner().invoke(
        app,
        ["filter-channel", str(src), "--channel", "line", "--output", str(out)],
    )
    assert res.exit_code == 0
    assert json.loads(res.stdout) == {"written": 2, "channel": "line"}
    assert out.is_file()
    written_rows = [json.loads(ln) for ln in out.read_text(encoding="utf-8").splitlines()]
    assert [r["ticket_id"] for r in written_rows] == ["T1", "T3"]


def test_help_displays_both_subcommands():
    res = make_runner().invoke(app, ["--help"])
    assert res.exit_code == 0
    assert "stats" in res.stdout
    assert "filter-channel" in res.stdout
`,
    },
    selfCheck: [
      "`stats --json-out` ส่งเฉพาะ JSON สะอาดออก `stdout` (`json.loads(res.stdout)` ผ่าน) ส่วน progress ออก `stderr`",
      "`stats` คืน exit code `1` ทั้งกรณีไฟล์ไม่พบและกรณีไฟล์ว่างเปล่า (0 แถว)",
      "`filter-channel` ข้ามบรรทัด JSON เสียได้อย่างปลอดภัย เขียนเฉพาะแถวที่ตรง `channel` ลงไฟล์ปลายทางด้วย UTF-8",
      "คำสั่ง `--help` แสดงทั้ง `stats` และ `filter-channel` พร้อมคำอธิบายครบถ้วน",
      "รัน `uv run pytest -q` ผ่าน 4/4 และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "อย่าลืมจับ `json.JSONDecodeError` ทีละบรรทัดในทั้ง `stats` และ `filter-channel` เพื่อไม่ให้บรรทัดพัง 1 บรรทัดทำให้ทั้ง CLI แครชด้วย traceback",
      },
      {
        body: "ทุกข้อความแจ้งเตือน, error และ progress ให้ส่งผ่าน `typer.echo(..., err=True)` เสมอ และใช้ `ensure_ascii=False` ใน `json.dumps(...)` เพื่อให้ภาษาไทยอ่านง่าย",
      },
      {
        body: "โครงของคำสั่ง `stats` พร้อมแล้ว — เติมคำสั่ง `filter_channel` ด้วยแนวทางเดียวกันแล้วรัน `uv run pytest -q`",
        code: {
          language: "python",
          filename: "hint-d023-l3.py",
          code: `@app.command()
def stats(
    input_path: Annotated[Path, typer.Argument(help="ไฟล์ JSONL ต้นทาง")],
    min_len: Annotated[int, typer.Option("--min-len", min=1)] = 5,
    json_out: Annotated[bool, typer.Option("--json-out")] = False,
) -> None:
    if not input_path.is_file():
        typer.echo(f"Error: file not found: {input_path}", err=True)
        raise typer.Exit(code=1)

    total = valid_len = bad_json = 0
    for idx, line in enumerate(input_path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        total += 1
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            bad_json += 1
            continue
        if len(str(row.get("message_th", "")).strip()) >= min_len:
            valid_len += 1
        typer.echo(f"processed row {idx}", err=True)

    if total == 0:
        typer.echo("Error: empty input file", err=True)
        raise typer.Exit(code=1)

    summary = {"total": total, "valid_len": valid_len, "bad_json": bad_json}
    if json_out:
        typer.echo(json.dumps(summary, ensure_ascii=False))
    else:
        typer.echo(f"total={total} valid_len={valid_len} bad_json={bad_json}")`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .
uv run python ticket_stats_cli.py --help`,
      caption: "ลองรัน `--help` ของทั้งคำสั่งหลักและคำสั่งย่อย (`stats --help`) เพื่อตรวจความอ่านง่าย",
    },
  },

  mistakes: [
    {
      title: "พิมพ์ข้อความ progress หรือ debug ด้วย `print(...)` ลง `stdout` ปนกับผลลัพธ์ JSON",
      symptom: "เมื่อนำ CLI ไป pipe เข้า `jq` หรือทดสอบ `json.loads(result.stdout)` เกิด `JSONDecodeError` ทันที",
      fix: "ส่งเฉพาะข้อมูลหลักลง `stdout` (`typer.echo(...)`) และส่ง progress/log/error ทั้งหมดลง `stderr` (`typer.echo(..., err=True)` หรือ `file=sys.stderr`)",
    },
    {
      title: "พิมพ์ข้อความ error แล้ว `return` เฉย ๆ โดยไม่โยน `typer.Exit(code=1)`",
      symptom: "CLI จบด้วย exit code `0` ทำให้ GitHub Actions / CI คิดว่างานผ่านทั้งที่จริง ๆ พัง",
      fix: "เมื่อเกิด error ในการทำงานต้องจบด้วย `raise typer.Exit(code=1)` เสมอ",
    },
    {
      title: "งงเมื่อ Typer ยุบชื่อ subcommand ทิ้งตอนมี `@app.command()` แค่คำสั่งเดียว",
      symptom: "เรียก `my-cli stats file.jsonl` แล้วโดนฟ้อง `Got unexpected extra argument (file.jsonl)`",
      fix: "ถ้ามีคำสั่งเดียวแต่ต้องการชื่อ subcommand ให้ประกาศ `@app.callback()` เปล่าไว้ 1 ตัว หรือเพิ่มคำสั่งย่อยที่ 2",
    },
    {
      title: "เรียก `sys.exit(1)` หรือ `subprocess.run` ใน unit test แทน `typer.Exit` + `CliRunner`",
      symptom: "ชุดเทสต์ช้ามาก พึ่งพาพาธ environment และจับแยก `stdout`/`stderr` ลำบาก",
      fix: "ใช้ `raise typer.Exit(code=1)` ในโค้ดจริง และทดสอบผ่าน `CliRunner().invoke(app, [...])` ใน `pytest`",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อทบทวน Typer Type Hints, การแยก `stdout`/`stderr`, Exit Codes และ `CliRunner`",
    questions: [
      mc(
        "d023-q1",
        "ในฟังก์ชัน `@app.command() def run(path: Path, limit: int = 20):` ของ Typer พารามิเตอร์ `path` และ `limit` จะถูกแปลงเป็นอะไรใน CLI?",
        [
          ["ทั้งคู่เป็น positional argument บังคับส่ง", "ไม่ถูก — พารามิเตอร์ที่มีค่า default จะกลายเป็น option"],
          ["`path` เป็น required Argument และ `limit` เป็น Option (`--limit`) ที่มีค่าเริ่มต้น 20 และตรวจชนิดเป็น `int` อัตโนมัติ", "ถูก — นี่คือกฎมาตรฐานของ Typer ที่ทำให้โค้ดสั้นและอ่านง่ายจาก type hints"],
          ["ทั้งคู่เป็น option (`--path` และ `--limit`)", "พารามิเตอร์ที่ไม่มีค่า default (และไม่ได้ระบุ `typer.Option`) จะเป็น positional Argument"],
          ["Typer จะรับทั้งคู่เป็น `str` แล้วให้ผู้เขียนแปลงเป็น `Path` กับ `int` เอง", "Typer แปลงและ validate ชนิดข้อมูลจาก type hints ให้ก่อนเข้าฟังก์ชัน"],
        ],
        "B",
        "Typer ใช้ลายเซ็นฟังก์ชันเป็นตัวกำหนด CLI: ไม่มีค่าเริ่มต้น = Argument (บังคับ), มีค่าเริ่มต้น = Option (`--limit`), และแปลง/ตรวจชนิดตาม type hints ให้อัตโนมัติ",
        "Typer แยกความต่างระหว่าง CLI Argument กับ Option จากลายเซ็นฟังก์ชัน Python อย่างไร?",
        "พารามิเตอร์ที่ไม่มีค่าเริ่มต้นจะเป็น required Argument ส่วนพารามิเตอร์ที่มีค่าเริ่มต้น (หรือระบุ `typer.Option`) จะเป็น `--option`",
      ),
      mc(
        "d023-q2",
        "CLI ของคุณมีโหมด `--json-out` ที่ผู้ใช้จะนำไป pipe ต่อ (`my-cli stats data.jsonl --json-out | jq .`) ควรส่ง progress bar และข้อความ error ไปที่ช่องทางใด?",
        [
          ["ส่งทุกอย่างไปที่ `stdout` เพื่อให้เห็นพร้อมกัน", "ผิด — จะทำให้ข้อความ progress ปนเข้า JSON จน `jq` หรือตัวรับปลายทางพังทันที"],
          ["ส่งเฉพาะ JSON ผลลัพธ์ไปที่ `stdout` และส่ง progress กับ error ไปที่ `stderr` (`err=True` / `file=sys.stderr`)", "ถูก — นี่คือวินัย UNIX CLI ที่ทำให้ท่อ pipe สะอาดและยังรายงานความคืบหน้าให้ผู้ใช้เห็นได้"],
          ["ปิด progress bar และห้ามพิมพ์ error เลย", "ผู้ใช้และ CI ต้องการรู้ความคืบหน้าและสาเหตุเมื่อพัง เพียงแค่ต้องส่งไปที่ `stderr`"],
          ["เขียน progress ลงไฟล์ `progress.txt` แทนทุกครั้ง", "สร้างไฟล์ขยะใน working directory โดยไม่จำเป็น — ใช้ `stderr` คือมาตรฐานสากล"],
        ],
        "B",
        "การแยก Data (`stdout`) ออกจาก Diagnostics/Progress (`stderr`) ทำให้ CLI ทำงานได้ทั้งสำหรับมนุษย์และสำหรับการต่อท่ออัตโนมัติ",
        "ใน UNIX CLI มาตรฐาน `stdout` กับ `stderr` มีหน้าที่ต่างกันอย่างไร?",
        "`stdout` ใช้ส่งข้อมูลผลลัพธ์หลัก (เช่น JSON/JSONL สำหรับ pipe ต่อ) ส่วน `stderr` ใช้ส่ง progress, log, warning และ error",
      ),
      mc(
        "d023-q3",
        "ใน GitHub Actions CI สคริปต์ `eval-cli` ตรวจพบว่าคะแนนความแม่นยำต่ำกว่าเกณฑ์ที่ตั้งไว้ คำสั่งใดใน Typer ที่ควรใช้เพื่อหยุด pipeline และแจ้งว่างานไม่ผ่าน?",
        [
          ["`typer.echo('FAIL')` แล้ว `return`", "ผิด — โปรแกรมจะจบด้วย exit code `0` ทำให้ CI คิดว่าผ่าน!"],
          ["`typer.echo('FAIL: score below threshold', err=True)` แล้ว `raise typer.Exit(code=1)`", "ถูก — ส่งเหตุผลออก `stderr` และคืน exit code ไม่ใช่ศูนย์ (`1`) เพื่อให้ CI หยุดและฟ้อง failure ทันที"],
          ["`raise typer.Exit(code=0)`", "exit code `0` หมายถึงสำเร็จ (success) ไม่ใช่ failure"],
          ["`print('ERROR')` แล้ว `return 1`", "ใน Typer การ `return 1` จากฟังก์ชัน command ไม่ได้เปลี่ยน process exit code เป็น 1"],
        ],
        "B",
        "ต้องใช้ `raise typer.Exit(code=1)` (หรือ non-zero code อื่น) เสมอเมื่อต้องการส่งสัญญาณล้มเหลวให้ shell หรือ CI",
        "จะทำให้คำสั่ง Typer CLI จบด้วย non-zero exit code เมื่อเกิดข้อผิดพลาดได้อย่างไร?",
        "พิมพ์สาเหตุออก `stderr` (`err=True`) แล้วโยน `raise typer.Exit(code=1)`",
      ),
      mc(
        "d023-q4",
        "ข้อดีหลักของการทดสอบ Typer CLI ด้วย `typer.testing.CliRunner` ใน `pytest` คือข้อใด?",
        [
          ["ช่วย deploy CLI ขึ้น PyPI อัตโนมัติหลังเทสต์ผ่าน", "`CliRunner` ใช้สำหรับทดสอบ ไม่ใช่ deploy"],
          ["รันคำสั่ง CLI ในหน่วยความจำได้อย่างรวดเร็ว พร้อมตรวจ `result.exit_code`, `result.stdout` และ `result.stderr` ได้ตรง ๆ", "ถูก — ไม่ต้องเปิด subprocess ใหม่ทุกเคส จึงเร็ว นิ่ง และทำงานร่วมกับ `tmp_path` fixture ได้ลงตัว"],
          ["ช่วยข้ามการตรวจ type hints ของ Typer", "`CliRunner` รันผ่าน pipeline การ parse และ validate จริงของ Typer/Click ทุกขั้นตอน"],
          ["ใช้แทนการเขียน unit test ให้ `service.py` ได้ทั้งหมด", "ควรมีทั้ง unit test ของ core logic และ integration test ผ่าน `CliRunner` ควบคู่กัน"],
        ],
        "B",
        "`CliRunner` จำลองการเรียก CLI เต็มรูปแบบในหน่วยความจำ ทำให้ตรวจ exit code, stdout, stderr และ `--help` ได้ในไม่กี่มิลลิวินาที",
        "ใช้เครื่องมือใดของ Typer สำหรับทดสอบคำสั่ง CLI ใน `pytest` และตรวจฟิลด์ใดเป็นหลัก?",
        "ใช้ `typer.testing.CliRunner().invoke(app, [...])` แล้วตรวจ `result.exit_code`, `result.stdout` และ `result.stderr`",
      ),
    ],
  },

  takeaways: [
    "`Typer` ใช้ Python type hints (`Path`, `int`, `bool`) และ `Annotated` สร้าง CLI, validation และ `--help` โดยอัตโนมัติ",
    "ยึดวินัย UNIX CLI เสมอ: ข้อมูลหลักออก `stdout` ส่วน progress/log/error ออก `stderr` (`err=True` / `file=sys.stderr`)",
    "เมื่อเกิดข้อผิดพลาดหรือผลไม่ผ่านเกณฑ์ ให้โยน `raise typer.Exit(code=1)` เพื่อส่งสัญญาณให้ shell และ CI รับรู้",
    "ทดสอบ CLI ทุกคำสั่งอย่างรวดเร็วด้วย `typer.testing.CliRunner` คู่กับ `tmp_path` ใน `pytest`",
  ],

  reviewCards: [
    rc(
      "d023-rc-1",
      "ทำไมจึงห้ามพิมพ์ progress bar หรือข้อความสถานะลง `stdout` ใน CLI ที่มีโหมด `--json-out`?",
      "เพราะจะปะปนเข้ากับข้อมูล JSON ทำให้การ pipe (`| jq`) หรือ `json.loads(result.stdout)` พัง — ต้องส่ง progress/status ออก `stderr` (`err=True` / `file=sys.stderr`) เสมอ",
    ),
    rc(
      "d023-rc-2",
      "ต่างกันอย่างไรระหว่าง `return` หลังพิมพ์ error กับ `raise typer.Exit(code=1)` ใน Typer?",
      "`return` เฉย ๆ จะคืน exit code `0` (shell/CI เข้าใจว่าสำเร็จ) ส่วน `raise typer.Exit(code=1)` คืน non-zero exit code ให้ CI หยุดและรายงาน failure ทันที",
    ),
    rc(
      "d023-rc-3",
      "ทำไมเมื่อมี `@app.command()` แค่ 1 ฟังก์ชันใน `typer.Typer()` ชื่อ subcommand จึงหายไป และแก้ได้อย่างไร?",
      "Typer ออกแบบให้แอปที่มีคำสั่งเดียวเรียกตรงได้โดยไม่ต้องพิมพ์ชื่อ subcommand — หากต้องการชื่อ subcommand ให้เพิ่ม `@app.callback()` หรือเพิ่มคำสั่งที่ 2",
    ),
  ],

  sources: [
    { label: "Typer Official Docs — First Steps & Type Hints", href: "https://typer.tiangolo.com/tutorial/first-steps/" },
    { label: "Typer Official Docs — Printing, stderr & Progress Bar", href: "https://typer.tiangolo.com/tutorial/progressbar/" },
    { label: "Typer Official Docs — Terminating & Exit Codes", href: "https://typer.tiangolo.com/tutorial/terminating/" },
    { label: "Typer Official Docs — Testing with CliRunner", href: "https://typer.tiangolo.com/tutorial/testing/" },
  ],

  glossary: [
    "typer",
    "type-hint",
    "pathlib",
    "jsonl",
    "fail-fast",
    "pytest",
    "ruff",
    "uv",
  ],
});
