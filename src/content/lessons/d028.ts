import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D028 — Phase 1 / Block B07 (Review Day)
 * Interleaved recall of D25–D27 (+ D23 Typer CLI) + Add persistent SQLite response cache to CLI.
 */
export const d028: Lesson = defineLesson({
  day: 28,
  titleTh: "ทบทวน B07: ติดตั้ง Persistent SQLite Cache ให้ Ticket CLI และวัด Hit Rate",
  tagline: "30 นาที · รอบทบทวน D25–D27 + D23 · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · พิสูจน์รอบสองยิง API เหลือ 0 ครั้งด้วย pytest",
  icon: "hard-drive",
  visual: {
    id: "sql-cache-arch",
    title: "ทบทวน B07: ติดตั้ง Persistent SQLite Cache ให้ CLI และวัด Cache Hit Rate",
    caption: "รันคำสั่งเดิมซ้ำรอบสองแล้วเห็นจำนวนการยิง API ลดเหลือ 0 พร้อมรายงาน hit/miss",
    alt: "แผนภาพการเพิ่ม SQLite cache ให้ CLI",
  },
  requiresApiKey: false,
  tools: ["SQLite", "SQL", "Typer", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "อ่านชุดทิกเก็ต JSONL และจัดเก็บผลลัพธ์ลง SQLite อย่างปลอดภัย",
      body: "ทิกเก็ตลูกค้าจากไฟล์ {{jsonl}} ถูกส่งเข้าท่อประมวลผลและบันทึกผลลัพธ์ลงฐานข้อมูล {{sqlite}} ที่มี migration และ parameterized queries ครบชุด",
      lessonNote: "รวม D26 (`?` placeholder, WAL, `PRAGMA user_version`) เข้ากับ D27 (`SHA-256` + TTL) เป็นชั้นแคชที่พร้อมใช้งานจริง",
    },
    {
      node: 2,
      heading: "ตัดการเรียกโมเดลซ้ำให้เหลือ 0 เมื่อรันข้อมูลชุดเดิม",
      body: "ระหว่างพัฒนาหรือรัน batch ประจำวัน ทิกเก็ตเดิมที่เคยจัดหมวดหมู่แล้วไม่ควรถูกส่งไปเสียค่า API ซ้ำอีก",
      lessonNote: "ใช้ deterministic cache key ที่รวม `message_th`, `model` และ `prompt_version` เพื่อให้รอบที่สองได้ `api_calls == 0`",
    },
    {
      node: 4,
      heading: "ควบคุมแคชได้จากปลายนิ้วผ่าน Typer CLI",
      body: "เครื่องมือ CLI ที่ดีต้องให้วิศวกรกำหนดตำแหน่งไฟล์แคช อายุ TTL, เวอร์ชัน prompt และมีปุ่มข้ามแคชเมื่อต้องการผลสดใหม่",
      lessonNote: "เชื่อมกลับไปทบทวน D23 ({{typer}}) โดยเพิ่มแฟล็ก `--cache-db`, `--ttl`, `--prompt-version` และ `--no-cache`",
    },
    {
      node: 5,
      heading: "รายงาน Hit/Miss Rate และตรวจสอบประวัติแคชด้วย SQL",
      body: "ทุกครั้งที่ CLI ทำงานจบควรพิมพ์สรุป `api_calls`, `hits`, `misses`, `hit_rate` และใช้ SQL จาก D25 วิเคราะห์สถิติย้อนหลังได้ทันที",
      lessonNote: "พิสูจน์พฤติกรรมทั้งหมดแบบอัตโนมัติด้วย {{pytest}} และ `CliRunner` ก่อนเข้าสู่ Phase 1 Capstone (Block B08)",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิม (Interleaved Recall)** จาก D25 (SQL JOIN / GROUP BY / {{sql-window|Window Functions}}), D26 (Parameterized Queries + Migrations), D27 (SHA-256 + TTL Cache) และ D23 ({{typer}} CLI)",
    "**ผสาน** ชั้น persistent {{sqlite}} {{caching|cache}} ที่มี TTL และ `PRAGMA user_version` migration เข้ากับ Ticket Classifier CLI พร้อมแฟล็ก `--cache-db`, `--prompt-version` และ `--no-cache`",
    "**พิสูจน์ด้วย `pytest`** ว่าการรันคำสั่งเดิมซ้ำรอบสองมียอด `api_calls == 0` (`hit_rate == 1.0`), เปลี่ยน `prompt_version` แล้ว miss อย่างถูกต้อง และ `--no-cache` ข้ามแคชได้จริง",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D25 (SQL Analytics), D26 (Parameterized Queries & Migrations), D27 (Caching Patterns) และ D23 (Typer CLI)",
    "มี `uv`, `typer`, `pytest` และ `ruff` พร้อมใช้งานในโปรเจกต์",
    "ไม่ต้องใช้ API key — ใช้ตัวจำลอง classifier ที่นับจำนวนการเรียกบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งานทบทวน Day 28 ด้วย `uv` แล้วติดตั้ง `typer` พร้อม dev tools (`pytest`, `ruff`) เพื่อประกอบ SQLite Cache เข้ากับ CLI",
    commands: `uv init ai-day28-review && cd ai-day28-review
uv add typer
uv add --dev pytest ruff

# ตรวจว่า Typer และ sqlite3 พร้อมทำงาน
uv run python -c "import sqlite3, typer; print('SQLite:', sqlite3.sqlite_version, '| Typer:', typer.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day28-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `typer` และ dev tools (`pytest`, `ruff`) ผ่าน `uv add`"],
      ["verify", "เช็กเวอร์ชันของ `sqlite3` และ `typer` สำเร็จ"],
    ],
    note: "รอบทบทวน Day 28 แบ่งเวลาตามสูตร 30 นาที: 10 นาทีทำ Interleaved Recall Quiz → 15 นาทีประกอบ SQLite Cache เข้ากับ Ticket CLI + รันเทสต์ → 5 นาทีสรุป Error Log เตรียมพร้อมสู่ Block B08",
  },

  concepts: [
    {
      id: "b07-integration-blueprint",
      title: "1 · ร้อยต่อจิ๊กซอว์ B07 + D23 ให้เป็น CLI พร้อม Cache ระดับ Production",
      paragraphs: [
        "สามวันที่ผ่านมาใน Block B07 คุณได้สร้างอาวุธข้อมูลครบ 3 ชิ้น: วันแรก (D25) วิเคราะห์ log ด้วย `JOIN`, `GROUP BY/HAVING` และ {{sql-window|Window Functions}}, วันที่สอง (D26) เขียน SQL ปลอดภัยด้วย `?` placeholder, WAL, transactions และ `PRAGMA user_version` migrations, วันที่สาม (D27) สร้าง deterministic `SHA-256` cache key และ TTL {{sqlite}} cache",
        "วันนี้เรานำทั้งสามชิ้นมาประกบกับ {{typer}} CLI จาก D23 เพื่อแก้ปัญหาจริงของทีม AI: **ทำอย่างไรให้รันคำสั่งจัดหมวดหมู่ทิกเก็ตไฟล์เดิมรอบสองแล้วไม่ยิง API ซ้ำเลย (`api_calls == 0`)** พร้อมมีรายงาน hit/miss ชัดเจนทุกครั้ง",
      ],
      analogy:
        "เหมือนเคาน์เตอร์รับเรื่องที่มีแฟ้มคำตอบสำเร็จรูปอยู่หน้าโต๊ะ (SQLite Cache) — รอบแรกอาจต้องโทรถามผู้เชี่ยวชาญ (API) 3 สาย แต่รอบสองถ้าลูกค้าถามเรื่องเดิมในสูตรเดิมและยังไม่หมดอายุ เจ้าหน้าที่หยิบคำตอบให้ทันทีโดยไม่ต้องโทรเลยสักสาย",
      bullets: [
        "**D26 (Safety & Migration)** — เปิด WAL + รัน `PRAGMA user_version` migration สร้างตารางแคชแบบ {{idempotency|idempotent}} และใช้ `?` ทุกคำสั่ง",
        "**D27 (Key & TTL)** — สร้าง key จาก `SHA-256(normalized_message + model + prompt_version)` และตรวจ `expires_at > now`",
        "**D23 (CLI UX)** — รับอินพุตไฟล์ {{jsonl}} และแฟล็ก `--cache-db`, `--ttl`, `--prompt-version`, `--no-cache` ผ่าน {{typer}}",
        "**D25 (Audit SQL)** — คิวรีดูจำนวนแคชแยกตามรุ่นหรือหาแคชที่หมดอายุได้ด้วย SQL ตรง ๆ",
      ],
      whyTitle: "Why this matters — ก้าวสุดท้ายก่อน Phase 1 Capstone (Block B08)",
      whyParagraphs: [
        "ใน Day 29–32 คุณจะประกอบทุกทักษะของ Phase 1 เป็น Resilient Async Data Fetcher CLI ที่มีทั้ง validation, retry, concurrency และ caching",
        "การแยกชั้น Cache + Processor ออกจากชั้น Typer CLI ให้เรียบร้อยในวันนี้ จะทำให้คุณยกโค้ดไปต่อยอดใน Capstone ได้ทันทีโดยแทบไม่ต้องรื้อใหม่",
      ],
    },
    {
      id: "controllable-cli-cache-flags",
      title: "2 · ออกแบบ CLI Cache ให้ควบคุมได้จริง (`--no-cache`, `--prompt-version`, `--ttl`)",
      paragraphs: [
        "แคชที่ปิดไม่ได้คือฝันร้ายตอนดีบัก! CLI งาน AI ในทีมจริงจึงมักแยก **แกนตรรกะ** (`process_tickets` ที่รับ `cache` และ `classifier` แบบ dependency injection) ออกจาก **เปลือก CLI** (`@app.command()` ของ {{typer}}) พร้อมเปิดสวิตช์ควบคุมสำคัญ 4 ตัว",
        "เมื่อผู้ใช้ส่ง `--no-cache` ระบบจะข้ามการอ่านแคชเพื่อบังคับเรียกโมเดลใหม่ (และสามารถเลือกได้ว่าจะไม่เขียนทับหรืออัปเดตค่าใหม่) ส่วนการส่ง `--prompt-version v2` จะเปลี่ยน cache key ทันที ทำให้ทดสอบ prompt รุ่นใหม่ได้โดยไม่ทำลายแคชของ `v1`",
      ],
      analogy:
        "เหมือนปุ่ม Hard Reload (`Ctrl+Shift+R`) บนเบราว์เซอร์ — ปกติเราอยากให้แคชช่วยโหลดไว แต่เวลาแก้โค้ดหรือสงสัยว่าคำตอบเก่าค้าง ต้องมีสวิตช์สั่งข้ามแคชได้ทันที",
      code: {
        language: "python",
        filename: "cli_flags_pattern.py",
        code: `from pathlib import Path
import typer

app = typer.Typer(help="Thai Support Ticket Classifier CLI with SQLite Cache")


@app.command()
def classify(
    input_file: Path = typer.Option(..., "--input", exists=True, readable=True),
    cache_db: Path = typer.Option(Path("ticket_cache.db"), "--cache-db"),
    model: str = typer.Option("mock-mini", "--model"),
    prompt_version: str = typer.Option("v1", "--prompt-version"),
    ttl: float = typer.Option(3600.0, "--ttl", min=1.0),
    no_cache: bool = typer.Option(False, "--no-cache", help="ข้ามการอ่านแคชเพื่อยิงใหม่ทั้งหมด"),
) -> None:
    typer.echo(
        f"input={input_file.name} db={cache_db.name} model={model} "
        f"ver={prompt_version} ttl={ttl} use_cache={not no_cache}"
    )`,
        caption: "ใช้ `typer.Option(...)` พร้อมชนิด `Path`, `float`, `bool` เพื่อให้ Typer ตรวจอินพุตและสร้าง `--help` ให้อัตโนมัติ",
      },
      whyTitle: "Why this matters — แยก Logic ออกจาก CLI ช่วยให้เทสต์ง่ายขึ้น 10 เท่า",
      whyParagraphs: [
        "หากยัดโค้ด SQLite, การอ่าน JSONL และการเรียกโมเดลทั้งหมดไว้ในฟังก์ชัน CLI เดียว คุณจะ inject นาฬิกาจำลอง (`clock`) หรือตัวนับ `api_calls` ใน {{pytest}} ได้ยากมาก",
        "เมื่อแยก `process_tickets(...)` ออกมาเป็นฟังก์ชันอิสระ คุณสามารถเขียนทั้ง unit test ระดับฟังก์ชัน และ end-to-end test ระดับ CLI ด้วย `typer.testing.CliRunner` ได้อย่างสะอาด",
      ],
    },
    {
      id: "proving-zero-api-calls",
      title: "3 · พิสูจน์ผลประหยัดจริงด้วย `pytest` (`api_calls == 0`) และ SQL Audit",
      paragraphs: [
        "การมีแคชที่ดีต้อง **พิสูจน์ได้ด้วยตัวเลขในชุดเทสต์อัตโนมัติ** แนวทางมาตรฐานคือสร้าง fake classifier ที่มีตัวนับ `api_calls` แล้วรัน `process_tickets` 2 รอบบนไฟล์ `tmp_path / 'cache.db'` เดียวกัน: รอบแรกต้องได้ `api_calls == 3, hits == 0, misses == 3` และรอบสองต้องได้ `api_calls == 0, hits == 3, misses == 0, hit_rate == 1.0`",
        "และเพราะเราเก็บแคชใน {{sqlite}} ที่มีคอลัมน์ `model` และ `prompt_version` กำกับไว้ด้วย คุณจึงใช้ SQL จาก D25 อย่าง `GROUP BY model, prompt_version` เพื่อตรวจสอบได้ว่ามีคำตอบถูกแคชไว้กี่รายการในแต่ละรุ่น",
      ],
      analogy:
        "เหมือนติดมิเตอร์วัดจำนวนการโทรออก — ไม่ใช่แค่เดาว่า 'น่าจะประหยัดขึ้น' แต่เห็นตัวเลขชัด ๆ ว่ารอบสองยอดโทรออกเป็น `0` เต็ม ๆ",
      code: {
        language: "sql",
        filename: "audit_cache.sql",
        code: `-- ใช้ SQL จาก D25 ตรวจจำนวนรายการแคชที่ยังไม่หมดอายุแยกตามโมเดลและเวอร์ชัน
SELECT
    model,
    prompt_version,
    COUNT(*) AS active_entries
FROM response_cache
WHERE expires_at > ?
GROUP BY model, prompt_version
ORDER BY active_entries DESC;`,
        caption: "การเก็บ metadata เล็ก ๆ อย่าง `model` และ `prompt_version` ไว้ข้าง `cache_key` ทำให้สืบค้นและทำรายงานสุขภาพแคชด้วย SQL ได้ง่ายมาก",
      },
      whyTitle: "Why this matters — สังเกตการณ์ได้ (Observability) ตั้งแต่วันแรก",
      whyParagraphs: [
        "ใน Phase 5 คุณจะส่งตัวเลข Cache Hit Rate ไปยังแดชบอร์ด Observability เพื่อคำนวณงบประมาณต่อเดือน การออกแบบให้ CLI พิมพ์สรุป `hits / misses / hit_rate` และเก็บ metadata ใน SQLite ตั้งแต่ Phase 1 คือการสร้างนิสัยวิศวกรที่วัดผลทุกอย่างด้วยตัวเลข",
        "นอกจากนี้ การรันเทสต์ผ่าน `CliRunner` ของ Typer ช่วยยืนยันว่าแฟล็ก `--no-cache` และ `--cache-db` ทำงานตรงตามเอกสาร `--help` จริง ๆ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Typer CLI + SQLite Cache กับ Node CLI + Local Cache",
      body: [
        "โครงสร้าง CLI ที่แยก core processor ออกจาก command parser และทดสอบด้วย spy/counter เหมือนฝั่ง TypeScript ทุกประการ:",
      ],
      table: [
        ["`typer.Typer()` + `@app.command()`", "`commander` / `cac` / `yargs`"],
        ["`typer.testing.CliRunner().invoke(app, [...])`", "รัน CLI ใน memory test runner โดยไม่ต้อง spawn shell"],
        ["`calls` counter ใน fake `classifier`", "`const spy = vi.fn(...)` เช็ก `toHaveBeenCalledTimes(0)`"],
        ["`tmp_path / 'cache.db'` ใน `pytest`", "`fs.mkdtempSync(...)` ใน Vitest / Jest"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม CLI รอบสองต้องเปิดไฟล์ `.db` บนดิสก์ ไม่ใช่ `:memory:`?",
      body: [
        "ฐานข้อมูล `:memory:` หายไปทันทีที่ `conn.close()` หรือเมื่อคำสั่ง CLI รันจบ หากส่ง `:memory:` ให้ CLI รอบที่สองจะเจอฐานข้อมูลเปล่าและ miss ทั้งหมด",
        "ดังนั้นในแบบฝึกหัดวันนี้เราใช้ `tmp_path / 'cache.db'` (ไฟล์จริงในโฟลเดอร์ชั่วคราวของ `pytest`) เพื่อจำลองการรัน CLI รอบที่ 1 และรอบที่ 2 ที่เปิดไฟล์เดียวกันข้ามโปรเซสจริง ๆ",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองประกอบครบทั้งวงจร: (1) SQLite Cache ที่มี migration v1 และ WAL, (2) ฟังก์ชัน `process_tickets` ที่วัด `api_calls` และ `hit_rate`, และ (3) การเรียกผ่าน Typer CLI สองรอบติดกัน",
    steps: [
      {
        title: "1 · สร้าง `SQLiteTicketCache` ที่รวม Migration v1 + Parameterized Upsert + TTL",
        explain:
          "ใช้ `PRAGMA user_version` สร้างตาราง `response_cache` (เก็บ `model` และ `prompt_version` เพื่อทำ SQL audit ได้ด้วย) และรับ `clock` สำหรับทดสอบ TTL",
        code: {
          language: "python",
          filename: "worked_d028.py",
          code: `import hashlib
import json
import sqlite3
import time
from collections.abc import Callable
from pathlib import Path
from typing import Self


def make_ticket_cache_key(message_th: str, model: str, prompt_version: str) -> str:
    payload = {
        "message_th": " ".join(message_th.split()),
        "model": model,
        "prompt_version": prompt_version,
    }
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class SQLiteTicketCache:
    def __init__(
        self,
        db_path: Path,
        ttl_seconds: float = 3600.0,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._ttl = ttl_seconds
        self._clock = clock
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA journal_mode = WAL")
        self._migrate()

    def _migrate(self) -> None:
        ver = self._conn.execute("PRAGMA user_version").fetchone()[0]
        if ver < 1:
            with self._conn:
                self._conn.execute("""
                    CREATE TABLE response_cache (
                        cache_key TEXT PRIMARY KEY,
                        model TEXT NOT NULL,
                        prompt_version TEXT NOT NULL,
                        category TEXT NOT NULL,
                        expires_at REAL NOT NULL
                    )
                """)
                self._conn.execute("PRAGMA user_version = 1")

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def close(self) -> None:
        self._conn.close()

    def get(self, key: str) -> str | None:
        row = self._conn.execute(
            "SELECT category, expires_at FROM response_cache WHERE cache_key = ?",
            (key,),
        ).fetchone()
        if row is None or row["expires_at"] <= self._clock():
            return None
        return str(row["category"])

    def set(self, key: str, model: str, prompt_version: str, category: str) -> None:
        expires_at = self._clock() + self._ttl
        with self._conn:
            self._conn.execute(
                """
                INSERT INTO response_cache (cache_key, model, prompt_version, category, expires_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    category = excluded.category,
                    expires_at = excluded.expires_at
                """,
                (key, model, prompt_version, category, expires_at),
            )`,
        },
        output: `# สร้าง SQLiteTicketCache พร้อม WAL + PRAGMA user_version = 1 สำเร็จ`,
      },
      {
        title: "2 · เขียน `process_tickets` และรันซ้ำสองรอบเพื่อดู `api_calls` ลดเหลือ 0",
        explain:
          "แยกตัวจำลอง `mock_classifier` ที่นับจำนวนการเรียกจริง รอบแรกเรียก 2 ครั้ง รอบสองเปิดไฟล์ `.db` เดิมแล้วยิง 0 ครั้ง",
        code: {
          language: "python",
          filename: "worked_d028.py",
          code: `import tempfile


def mock_classifier(message_th: str, model: str) -> str:
    if "ใบกำกับภาษี" in message_th or "โอนเงิน" in message_th:
        return "billing"
    return "technical"


def process_tickets(
    tickets: list[dict[str, str]],
    cache: SQLiteTicketCache,
    classifier: Callable[[str, str], str],
    *,
    model: str = "mock-mini",
    prompt_version: str = "v1",
    use_cache: bool = True,
) -> dict[str, object]:
    results: list[dict[str, object]] = []
    hits = misses = api_calls = 0

    for item in tickets:
        key = make_ticket_cache_key(item["message_th"], model, prompt_version)
        cached = cache.get(key) if use_cache else None
        if cached is not None:
            hits += 1
            results.append({"ticket_id": item["ticket_id"], "category": cached, "from_cache": True})
        else:
            misses += 1
            api_calls += 1
            category = classifier(item["message_th"], model)
            if use_cache:
                cache.set(key, model, prompt_version, category)
            results.append({"ticket_id": item["ticket_id"], "category": category, "from_cache": False})

    total = hits + misses
    hit_rate = round(hits / total, 4) if total else 0.0
    return {"results": results, "api_calls": api_calls, "hits": hits, "misses": misses, "hit_rate": hit_rate}


sample = [
    {"ticket_id": "TKT-01", "message_th": "ขอใบกำกับภาษีครับ"},
    {"ticket_id": "TKT-02", "message_th": "แอปเด้งหน้าล็อกอิน"},
]
db_file = Path(tempfile.mkdtemp()) / "cli_cache.db"

with SQLiteTicketCache(db_file) as c1:
    r1 = process_tickets(sample, c1, mock_classifier)
with SQLiteTicketCache(db_file) as c2:
    r2 = process_tickets(sample, c2, mock_classifier)

print("Run 1:", {k: r1[k] for k in ("api_calls", "hits", "misses", "hit_rate")})
print("Run 2:", {k: r2[k] for k in ("api_calls", "hits", "misses", "hit_rate")})`,
        },
        output: `Run 1: {'api_calls': 2, 'hits': 0, 'misses': 2, 'hit_rate': 0.0}
Run 2: {'api_calls': 0, 'hits': 2, 'misses': 0, 'hit_rate': 1.0}`,
      },
      {
        title: "3 · ผูกเข้ากับ Typer CLI และตรวจผลลัพธ์ JSON จากเทอร์มินัล",
        explain:
          "คำสั่ง `classify` อ่านไฟล์ JSONL ส่งต่อให้ `process_tickets` แล้วพิมพ์สรุป JSON ออกทาง stdout เพื่อให้สคริปต์อื่นหรือ `CliRunner` ตรวจผลได้ทันที",
        code: {
          language: "python",
          filename: "worked_d028_cli.py",
          code: `import json
from pathlib import Path
import typer

app = typer.Typer()


@app.command()
def classify(
    input_file: Path = typer.Option(..., "--input"),
    cache_db: Path = typer.Option(..., "--cache-db"),
    model: str = typer.Option("mock-mini", "--model"),
    prompt_version: str = typer.Option("v1", "--prompt-version"),
    ttl: float = typer.Option(3600.0, "--ttl"),
    no_cache: bool = typer.Option(False, "--no-cache"),
) -> None:
    tickets = [
        json.loads(line)
        for line in input_file.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    with SQLiteTicketCache(cache_db, ttl_seconds=ttl) as cache:
        report = process_tickets(
            tickets,
            cache,
            mock_classifier,
            model=model,
            prompt_version=prompt_version,
            use_cache=not no_cache,
        )
    typer.echo(json.dumps(report, ensure_ascii=False))`,
        },
        output: `# รอบที่ 1 -> {"results": [...], "api_calls": 2, "hits": 0, "misses": 2, "hit_rate": 0.0}
# รอบที่ 2 -> {"results": [...], "api_calls": 0, "hits": 2, "misses": 0, "hit_rate": 1.0}`,
      },
    ],
    gotcha:
      "จุดพลาดยอดฮิตใน Typer CLI: ลืมรองรับบรรทัดว่างในไฟล์ JSONL (`if line.strip()`) หรือลืมปิด `SQLiteTicketCache` ด้วย `with` — ทำให้ `json.loads('')` พัง หรือไฟล์ `.db` ค้างล็อกบน Windows ระหว่างรัน `CliRunner` รอบที่สอง",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + Mini-Integration (15 นาที): สร้าง `ticket_cache_cli.py` ที่ติดตั้ง Persistent SQLite Response Cache (พร้อม migration + WAL + TTL) เข้ากับ Typer CLI แล้วพิสูจน์ใน `pytest` ว่ารอบที่สองมียอด `api_calls == 0`",
    requirements: [
      "สร้าง `make_ticket_cache_key(message_th: str, model: str, prompt_version: str) -> str` โดย normalize ช่องว่างใน `message_th` แล้วแฮช canonical JSON ด้วย `hashlib.sha256`",
      "สร้างคลาส `SQLiteTicketCache(db_path: Path, ttl_seconds: float = 3600.0, clock: Callable[[], float] = time.time)` ที่เปิด WAL, รัน `PRAGMA user_version = 1` migration สร้างตาราง `response_cache`, รองรับ `with` / `close()` และมีเมธอด `get(key)` / `set(key, model, prompt_version, category)` แบบ parameterized `?`",
      "สร้าง `process_tickets(tickets, cache, classifier, *, model='mock-mini', prompt_version='v1', use_cache=True) -> dict[str, object]` ที่คืน `results` (รายการ dict ที่มี `ticket_id`, `category`, `from_cache`), `api_calls`, `hits`, `misses`, `hit_rate`",
      "สร้าง `app = typer.Typer()` ที่มีคำสั่ง `classify` รับ `--input`, `--cache-db`, `--model`, `--prompt-version`, `--ttl`, `--no-cache` อ่านไฟล์ JSONL แล้วพิมพ์รายงาน JSON ด้วย `typer.echo(json.dumps(report, ensure_ascii=False))`",
      "ผ่านการทดสอบครบทั้ง 4 สถานการณ์: รอบสอง `api_calls == 0`, เปลี่ยน `--prompt-version` แล้ว miss, TTL หมดอายุแล้ว miss และ `--no-cache` บังคับยิงใหม่ผ่าน `CliRunner`",
    ],
    starter: {
      language: "python",
      filename: "ticket_cache_cli.py",
      code: `import hashlib
import json
import sqlite3
import time
from collections.abc import Callable
from pathlib import Path
from typing import Self
import typer

app = typer.Typer(help="Ticket Classifier CLI with Persistent SQLite Cache")


def default_classifier(message_th: str, model: str) -> str:
    if any(kw in message_th for kw in ("ใบกำกับภาษี", "โอนเงิน", "คืนเงิน")):
        return "billing"
    if any(kw in message_th for kw in ("รหัสผ่าน", "ล็อกอิน", "เข้าสู่ระบบ")):
        return "account"
    return "technical"


def make_ticket_cache_key(
    message_th: str, model: str, prompt_version: str
) -> str:
    # TODO: normalize whitespace + canonical JSON + SHA-256 hex digest
    raise NotImplementedError


class SQLiteTicketCache:
    def __init__(
        self,
        db_path: Path,
        ttl_seconds: float = 3600.0,
        clock: Callable[[], float] = time.time,
    ) -> None:
        # TODO: เปิด SQLite (WAL) + PRAGMA user_version migration v1
        raise NotImplementedError

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def close(self) -> None:
        raise NotImplementedError

    def get(self, key: str) -> str | None:
        # TODO: parameterized SELECT พร้อมตรวจ expires_at > self._clock()
        raise NotImplementedError

    def set(
        self, key: str, model: str, prompt_version: str, category: str
    ) -> None:
        # TODO: parameterized UPSERT ลง response_cache
        raise NotImplementedError


def process_tickets(
    tickets: list[dict[str, str]],
    cache: SQLiteTicketCache,
    classifier: Callable[[str, str], str],
    *,
    model: str = "mock-mini",
    prompt_version: str = "v1",
    use_cache: bool = True,
) -> dict[str, object]:
    # TODO: วนทีละทิกเก็ต เช็กแคช (เมื่อ use_cache=True) นับ hits/misses/api_calls และ hit_rate
    raise NotImplementedError


@app.command()
def classify(
    input_file: Path = typer.Option(..., "--input"),
    cache_db: Path = typer.Option(..., "--cache-db"),
    model: str = typer.Option("mock-mini", "--model"),
    prompt_version: str = typer.Option("v1", "--prompt-version"),
    ttl: float = typer.Option(3600.0, "--ttl"),
    no_cache: bool = typer.Option(False, "--no-cache"),
) -> None:
    # TODO: อ่าน JSONL จาก input_file, เรียก process_tickets กับ SQLiteTicketCache แล้ว typer.echo JSON
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_cache_cli.py",
      code: `import json
from pathlib import Path
from typer.testing import CliRunner
from ticket_cache_cli import (
    SQLiteTicketCache,
    app,
    default_classifier,
    process_tickets,
)

runner = CliRunner()

SAMPLE_TICKETS = [
    {"ticket_id": "TKT-01", "message_th": "ขอใบกำกับภาษีอิเล็กทรอนิกส์ครับ"},
    {"ticket_id": "TKT-02", "message_th": "ลืมรหัสผ่านเข้าสู่ระบบไม่ได้"},
    {"ticket_id": "TKT-03", "message_th": "แอปค้างตอนอัปโหลดรูป"},
]


def _write_jsonl(path: Path, rows: list[dict[str, str]]) -> Path:
    path.write_text(
        "\\n".join(json.dumps(r, ensure_ascii=False) for r in rows) + "\\n",
        encoding="utf-8",
    )
    return path


def test_second_cli_run_hits_cache_with_zero_api_calls(tmp_path: Path):
    jsonl_file = _write_jsonl(tmp_path / "tickets.jsonl", SAMPLE_TICKETS)
    cache_db = tmp_path / "cache.db"

    res1 = runner.invoke(
        app, ["--input", str(jsonl_file), "--cache-db", str(cache_db)]
    )
    assert res1.exit_code == 0, res1.output
    report1 = json.loads(res1.stdout)
    assert report1["api_calls"] == 3
    assert report1["hits"] == 0
    assert report1["misses"] == 3
    assert report1["hit_rate"] == 0.0

    # รันคำสั่งเดิมซ้ำรอบที่ 2 -> ต้องดึงจาก SQLite Cache ทั้งหมด (api_calls == 0)
    res2 = runner.invoke(
        app, ["--input", str(jsonl_file), "--cache-db", str(cache_db)]
    )
    assert res2.exit_code == 0, res2.output
    report2 = json.loads(res2.stdout)
    assert report2["api_calls"] == 0
    assert report2["hits"] == 3
    assert report2["misses"] == 0
    assert report2["hit_rate"] == 1.0
    assert all(item["from_cache"] is True for item in report2["results"])


def test_prompt_version_bump_invalidates_cache(tmp_path: Path):
    jsonl_file = _write_jsonl(tmp_path / "tickets.jsonl", SAMPLE_TICKETS)
    cache_db = tmp_path / "cache.db"

    runner.invoke(
        app, ["--input", str(jsonl_file), "--cache-db", str(cache_db), "--prompt-version", "v1"]
    )
    res_v2 = runner.invoke(
        app, ["--input", str(jsonl_file), "--cache-db", str(cache_db), "--prompt-version", "v2"]
    )
    assert res_v2.exit_code == 0, res_v2.output
    report_v2 = json.loads(res_v2.stdout)
    assert report_v2["api_calls"] == 3
    assert report_v2["hits"] == 0


def test_no_cache_flag_forces_fresh_calls(tmp_path: Path):
    jsonl_file = _write_jsonl(tmp_path / "tickets.jsonl", SAMPLE_TICKETS)
    cache_db = tmp_path / "cache.db"

    runner.invoke(app, ["--input", str(jsonl_file), "--cache-db", str(cache_db)])
    res_bypass = runner.invoke(
        app, ["--input", str(jsonl_file), "--cache-db", str(cache_db), "--no-cache"]
    )
    assert res_bypass.exit_code == 0, res_bypass.output
    report = json.loads(res_bypass.stdout)
    assert report["api_calls"] == 3
    assert report["hits"] == 0


def test_ttl_expiration_triggers_recompute(tmp_path: Path):
    now = [1000.0]
    cache_db = tmp_path / "ttl.db"

    with SQLiteTicketCache(cache_db, ttl_seconds=60.0, clock=lambda: now[0]) as cache:
        r1 = process_tickets(SAMPLE_TICKETS, cache, default_classifier)
        assert r1["api_calls"] == 3

        now[0] = 1030.0
        r2 = process_tickets(SAMPLE_TICKETS, cache, default_classifier)
        assert r2["api_calls"] == 0
        assert r2["hit_rate"] == 1.0

        now[0] = 1065.0
        r3 = process_tickets(SAMPLE_TICKETS, cache, default_classifier)
        assert r3["api_calls"] == 3
        assert r3["hits"] == 0
`,
    },
    selfCheck: [
      "รัน CLI รอบที่ 1 ได้ `api_calls == 3, hits == 0` และรอบที่ 2 บน `--cache-db` เดิมได้ `api_calls == 0, hits == 3, hit_rate == 1.0`",
      "เปลี่ยน `--prompt-version` จาก `v1` เป็น `v2` แล้วเกิด cache miss (`api_calls == 3`) โดยไม่ต้องลบไฟล์ `.db`",
      "ส่งแฟล็ก `--no-cache` แล้วบังคับเรียก classifier ใหม่ทั้ง 3 ทิกเก็ต",
      "หมุนนาฬิกาจำลองเกิน TTL 60 วินาทีแล้ว `process_tickets` คำนวณใหม่และอัปเดตแคชได้ถูกต้อง",
      "รัน `uv run pytest -q` ผ่านครบ 4 ข้อ และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `Typer` เมื่อแอปมีคำสั่งเดียว (`@app.command()`) `CliRunner().invoke(app, ['--input', ...])` จะส่งอาร์กิวเมนต์เข้าคำสั่งนั้นโดยตรง ไม่ต้องใส่ชื่อคำสั่ง `classify` นำหน้า",
      },
      {
        body: "ใน `process_tickets` เมื่อ `use_cache=False` ให้ข้ามทั้ง `cache.get(key)` และ `cache.set(...)` หรืออย่างน้อยข้าม `cache.get(key)` เพื่อบังคับเรียก `classifier` ใหม่ทุกแถว",
      },
      {
        body: "โครงหลักของ `SQLiteTicketCache` และ `process_tickets` พร้อมแล้ว เหลือเติมตัวอ่านไฟล์ JSONL ในคำสั่ง `classify` ของ Typer",
        code: {
          language: "python",
          filename: "hint-d028-l3.py",
          code: `import hashlib
import json
import sqlite3
import time
from collections.abc import Callable
from pathlib import Path
from typing import Self
import typer

app = typer.Typer()


def make_ticket_cache_key(message_th: str, model: str, prompt_version: str) -> str:
    payload = {
        "message_th": " ".join(message_th.split()),
        "model": model,
        "prompt_version": prompt_version,
    }
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class SQLiteTicketCache:
    def __init__(
        self,
        db_path: Path,
        ttl_seconds: float = 3600.0,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._ttl = ttl_seconds
        self._clock = clock
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA journal_mode = WAL")
        ver = self._conn.execute("PRAGMA user_version").fetchone()[0]
        if ver < 1:
            with self._conn:
                self._conn.execute("""
                    CREATE TABLE response_cache (
                        cache_key TEXT PRIMARY KEY,
                        model TEXT NOT NULL,
                        prompt_version TEXT NOT NULL,
                        category TEXT NOT NULL,
                        expires_at REAL NOT NULL
                    )
                """)
                self._conn.execute("PRAGMA user_version = 1")

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def close(self) -> None:
        self._conn.close()

    def get(self, key: str) -> str | None:
        row = self._conn.execute(
            "SELECT category, expires_at FROM response_cache WHERE cache_key = ?",
            (key,),
        ).fetchone()
        if row is None or row["expires_at"] <= self._clock():
            return None
        return str(row["category"])

    def set(self, key: str, model: str, prompt_version: str, category: str) -> None:
        with self._conn:
            self._conn.execute(
                """
                INSERT INTO response_cache (cache_key, model, prompt_version, category, expires_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    category = excluded.category,
                    expires_at = excluded.expires_at
                """,
                (key, model, prompt_version, category, self._clock() + self._ttl),
            )


# TODO: เติม process_tickets และ @app.command() def classify(...)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
      caption: "ลองรัน CLI จริง 2 รอบในเทอร์มินัลด้วย `uv run python -m typer ticket_cache_cli run --input tickets.jsonl --cache-db cache.db` เพื่อดูยอด `api_calls` ลดเหลือ 0 ด้วยตาตัวเอง",
    },
  },

  mistakes: [
    {
      title: "พิมพ์ข้อความ debug ปะปนกับ JSON บน `stdout` ของ CLI",
      symptom: "`json.loads(res.stdout)` ในเทสต์พังเพราะมีข้อความอื่นเช่น `Loaded 3 rows` แทรกอยู่ข้างหน้า JSON",
      fix: "ให้ `stdout` ของคำสั่งที่ส่งออก JSON มีเฉพาะผลลัพธ์ JSON ล้วน ๆ ส่วน log หรือ progress bar ให้ส่งออกทาง `stderr` (`typer.echo(..., err=True)`)",
    },
    {
      title: "ลืมปิด `SQLiteTicketCache` หลังจบคำสั่ง CLI",
      symptom: "เทสต์บน Windows เกิด `PermissionError` ตอนลบ `tmp_path` เพราะไฟล์ `.db` ยังถูกเปิดค้างอยู่",
      fix: "ครอบการใช้งานด้วย `with SQLiteTicketCache(...) as cache:` เสมอเพื่อให้เรียก `close()` อัตโนมัติแม้เกิด error",
    },
    {
      title: "สร้างตารางใน CLI ด้วย `CREATE TABLE` ธรรมดาโดยไม่เช็ก `PRAGMA user_version`",
      symptom: "CLI รันรอบแรกผ่าน แต่พอรันรอบสองบน `--cache-db` เดิมพังด้วย `OperationalError: table response_cache already exists`",
      fix: "ตรวจ `PRAGMA user_version` (หรือ `CREATE TABLE IF NOT EXISTS` สำหรับตารางเริ่มต้น + versioned migrations เมื่อมี schema เปลี่ยน)",
    },
    {
      title: "ใช้ `hash()` ของ Python ทำ Cache Key ใน CLI",
      symptom: "รันคำสั่งเดิมผ่าน `CliRunner` หรือเปิดเทอร์มินัลใหม่แล้ว `api_calls` ไม่ลดลงเป็น 0",
      fix: "ใช้ `hashlib.sha256` บน canonical JSON ที่มี `sort_keys=True` เสมอ",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ จาก D25, D26, D27 และ D23) — ลองดึงความรู้จากความจำก่อนกดตรวจคำตอบ",
    questions: [
      mc(
        "d028-q1",
        "[ทบทวน D25] ตาราง `model_runs` เก็บประวัติการรันทุกครั้งรวมถึงรอบที่ retry อยากได้ **ผลรันล่าสุดของแต่ละ `ticket_id`** พร้อมคอลัมน์ `model` และ `status` ควรใช้ท่า SQL ใด?",
        [
          ["`SELECT ticket_id, model, status FROM model_runs GROUP BY ticket_id`", "ไม่รับประกันว่า `model` และ `status` จะมาจากแถวที่เวลาล่าสุด (และ error ใน PostgreSQL)"],
          ["CTE คำนวณ `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC) AS rn` แล้วกรอง `WHERE rn = 1`", "ถูก — Window Function คัดแถวล่าสุดทั้งแถวของแต่ละทิกเก็ตได้อย่างแม่นยำและมี tie-breaker ชัดเจน"],
          ["`INNER JOIN tickets` แล้ว `LIMIT 1`", "`LIMIT 1` จะคืนแค่ 1 แถวทั้งตาราง ไม่ใช่ 1 แถวต่อทิกเก็ต"],
          ["`HAVING MAX(created_at)` โดยไม่ใส่ `GROUP BY`", "ผิดไวยากรณ์ SQL และไม่แยกตาม `ticket_id`"],
        ],
        "B",
        "การใช้ CTE + `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC)` แล้วเลือก `rn = 1` เป็นรูปแบบมาตรฐานสำหรับ deduplicate log ล่าสุดต่อกลุ่ม",
        "จะดึงแถวผลรันล่าสุดของแต่ละ `ticket_id` จากตาราง log ใน SQL อย่างไร?",
        "ใช้ CTE + `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC) AS rn` แล้วกรอง `WHERE rn = 1`",
      ),
      mc(
        "d028-q2",
        "[ทบทวน D26] ข้อใดกล่าวถูกต้องที่สุดเกี่ยวกับการใช้งาน SQLite อย่างปลอดภัยใน Python?",
        [
          ["ใช้ f-string ได้ถ้าข้อความมาจากไฟล์ JSONL ภายในบริษัท", "ข้อความลูกค้าใน JSONL ก็คือ untrusted input ที่มี `'` หรือสตริงโจมตีได้ — ต้องใช้ `?` เสมอ"],
          ["ใช้ `?` placeholder ส่งค่าเป็น tuple `(val,)`, เปิด WAL + `foreign_keys = ON`, และรัน schema upgrades ผ่าน `PRAGMA user_version` ใน `with conn:`", "ถูก — ครบทั้งความปลอดภัยจาก SQL Injection, concurrency, atomic transaction และ idempotent migration"],
          ["`with conn:` จะปิดการเชื่อมต่อฐานข้อมูลให้อัตโนมัติ ไม่ต้องเรียก `conn.close()`", "`with conn:` ทำเฉพาะ commit/rollback ไม่ได้ปิด connection"],
          ["SQLite เปิด `PRAGMA foreign_keys = ON` ไว้เป็นค่าเริ่มต้นอยู่แล้ว", "SQLite ปิด `foreign_keys` ไว้เป็นค่าเริ่มต้น ต้องเปิดเองทุกครั้งที่สร้าง connection"],
        ],
        "B",
        "หลัก 4 ประการของ SQLite ระดับ production คือ Parameterized queries (`?`), `with conn:` + `close()`, WAL + `foreign_keys = ON`, และ versioned migrations",
        "4 แนวปฏิบัติหลักในการใช้ Python `sqlite3` อย่างปลอดภัยสำหรับ production คืออะไร?",
        "(1) ใช้ `?` placeholder แทน f-string, (2) จัดการ transaction ด้วย `with conn:` และปิดด้วย `close()`, (3) เปิด WAL + `foreign_keys = ON`, (4) ทำ migration แบบ versioned ด้วย `PRAGMA user_version`",
      ),
      mc(
        "d028-q3",
        "[ทบทวน D27] CLI ที่ติด SQLite Cache รันไฟล์ `tickets.jsonl` เดิมซ้ำรอบสองแต่กลับมี `hits == 0` และยิง API ใหม่หมด ทั้งที่ไฟล์ `.db` เดิมมีข้อมูลอยู่และยังไม่หมด TTL สาเหตุใดมีโอกาสเกิดขึ้นสูงที่สุด?",
        [
          ["ใช้ `hashlib.sha256` ยาวเกินไปจน SQLite อ่านไม่ได้", "SQLite เก็บ `TEXT` ยาว 64 ตัวอักษรเป็น PRIMARY KEY ได้สบายมาก"],
          ["ใช้ `hash()` ของ Python สร้าง Cache Key หรือลืมส่ง `--prompt-version` / `model` ตรงกับรอบแรก", "ถูก — `hash()` เปลี่ยนค่าทุกโปรเซส ส่วนพารามิเตอร์ที่เปลี่ยนไปจะสร้าง SHA-256 key ใหม่โดยตั้งใจ"],
          ["เปิดโหมด WAL แล้วทำให้แคชอ่านไม่ได้", "WAL ช่วยให้อ่านพร้อมเขียนได้ดีขึ้น ไม่ได้ทำให้ข้อมูลหาย"],
          ["ใช้ `sort_keys=True` ใน `json.dumps`", "`sort_keys=True` ช่วยให้ key นิ่งขึ้น ไม่ใช่สาเหตุของ cache miss"],
        ],
        "B",
        "หาก Cache Hit เป็น 0 ในรอบที่สอง จุดแรกที่ต้องตรวจคือ Cache Key deterministic ข้ามโปรเซสหรือไม่ (`sha256` vs `hash()`) และค่าพารามิเตอร์ (`model`, `prompt_version`, `temperature`) ตรงกันหรือไม่",
        "ถ้ารัน CLI รอบสองบนไฟล์ SQLite Cache เดิมแล้วได้ `hits == 0` ควรเช็กอะไรเป็นอันดับแรก?",
        "ตรวจว่า Cache Key ใช้ `hashlib.sha256` (ไม่ใช่ `hash()`), เช็กว่า `model`/`prompt_version` ตรงกัน และเช็กว่าไม่หมด TTL",
      ),
      mc(
        "d028-q4",
        "[ทบทวน D23 + D28] เมื่อต้องการเขียน unit test ด้วย `pytest` เพื่อพิสูจน์ว่า Typer CLI ที่มี SQLite Cache ยิง API เป็น `0` ครั้งในรอบที่สอง ควรออกแบบอย่างไร?",
        [
          ["ยิง API จริงไปที่ผู้ให้บริการ LLM สองรอบแล้วดูบิลบัตรเครดิตสิ้นเดือน", "เสียเงิน ช้า และรันแบบ offline ใน CI ไม่ได้"],
          ["แยกแกน `process_tickets` ให้รับ `classifier` และ `SQLiteTicketCache` แล้วใช้ `CliRunner` + `tmp_path / 'cache.db'` รัน 2 รอบเพื่อ assert `api_calls == 0` และ `hit_rate == 1.0`", "ถูก — รันเร็ว 100% local ไม่ต้องใช้ API key และตรวจได้ทั้งระดับฟังก์ชันและระดับ CLI"],
          ["ใช้ `sqlite3.connect(':memory:')` ระหว่างการรัน `CliRunner` 2 ครั้ง", "`:memory:` หายไปทันทีหลังจบการรันรอบแรก จึงทดสอบ persistence ข้ามรอบไม่ได้"],
          ["ใส่ `time.sleep(3600)` เพื่อรอทดสอบ TTL", "ควร inject `clock` จำลองแทน `time.sleep`"],
        ],
        "B",
        "`CliRunner` ของ Typer คู่กับ `tmp_path` ของ `pytest` และ fake/mock classifier ทำให้ทดสอบพฤติกรรม persistent cache ของ CLI ได้ครบทุกกรณีภายในไม่กี่มิลลิวินาที",
        "จะทดสอบ persistent SQLite Cache ของ Typer CLI ใน `pytest` แบบไม่ต้องใช้ API key อย่างไร?",
        "ใช้ `CliRunner` + `tmp_path / 'cache.db'` รัน CLI 2 รอบกับ mock classifier แล้ว assert รอบแรกว่า `api_calls == N` และรอบสองว่า `api_calls == 0, hit_rate == 1.0`",
      ),
    ],
  },

  takeaways: [
    "Block B07 มอบชุดทักษะฐานข้อมูลครบวงจรให้วิศวกร AI: วิเคราะห์ log ด้วย SQL (D25), เขียน SQL ปลอดภัยพร้อม migration (D26) และลดค่า API ด้วย SHA-256 + TTL SQLite Cache (D27)",
    "การแยก `SQLiteTicketCache` และ `process_tickets` ออกจากเปลือก Typer CLI ทำให้ทดสอบ `api_calls == 0`, `--prompt-version`, `--no-cache` และ TTL expiration ได้อย่างรวดเร็วใน `pytest`",
    "เปิดสวิตช์ควบคุมแคช (`--cache-db`, `--ttl`, `--prompt-version`, `--no-cache`) เสมอ เพื่อให้ทั้งประหยัดต้นทุนในงานปกติและดีบักได้ง่ายเมื่อต้องการผลสดใหม่",
    "คุณพร้อมเข้าสู่ **Block B08 (Day 29–32)** — ประกอบทักษะทั้งหมดของ Phase 1 เป็น Resilient Async Data Fetcher CLI!",
  ],

  reviewCards: [
    rc(
      "d028-rc-1",
      "แฟล็กสำคัญ 4 ตัวที่ควรมีใน AI CLI ที่ติดตั้ง Persistent SQLite Cache คืออะไร?",
      "`--cache-db` (ตำแหน่งไฟล์ SQLite), `--ttl` (อายุแคชเป็นวินาที), `--prompt-version` (invalidate แคชเมื่อแก้ prompt) และ `--no-cache` (ข้ามแคชตอนดีบัก)",
    ),
    rc(
      "d028-rc-2",
      "ทำไมการทดสอบ persistence ของ CLI Cache ใน `pytest` จึงต้องใช้ `tmp_path / 'cache.db'` แทน `':memory:'`?",
      "เพราะ `:memory:` จะหายทันทีเมื่อจบคำสั่งรอบแรก ส่วนไฟล์ใน `tmp_path` อยู่รอดข้ามการเรียก `CliRunner` รอบที่ 1 และรอบที่ 2 แล้วถูกลบอัตโนมัติหลังจบเทสต์",
    ),
    rc(
      "d028-rc-3",
      "ถ้า CLI พิมพ์รายงานผลลัพธ์เป็น JSON ออกทาง `stdout` ควรส่งข้อความ log หรือ progress bar ไปที่ช่องทางใด?",
      "ส่งออกทาง `stderr` (เช่น `typer.echo(..., err=True)`) เพื่อไม่ให้ข้อความปนเปื้อนจน `json.loads(stdout)` พัง",
    ),
  ],

  sources: [
    { label: "Typer Official Docs — Testing CLI Apps (`CliRunner`)", href: "https://typer.tiangolo.com/tutorial/testing/" },
    { label: "Python 3 Official Docs — sqlite3 & Context Managers", href: "https://docs.python.org/3/library/sqlite3.html" },
    { label: "pytest Official Docs — Temporary Directories (`tmp_path`)", href: "https://docs.pytest.org/en/stable/how-to/tmp_path.html" },
    { label: "SQLite Official Docs — UPSERT & WAL Mode", href: "https://www.sqlite.org/lang_upsert.html" },
  ],

  glossary: [
    "sqlite",
    "caching",
    "typer",
    "sql-window",
    "jsonl",
    "idempotency",
    "pytest",
    "ruff",
  ],
});
