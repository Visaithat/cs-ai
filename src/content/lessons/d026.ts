import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D026 — Phase 1 / Block B07
 * SQLite / PostgreSQL Parameterized Queries & Migrations.
 */
export const d026: Lesson = defineLesson({
  day: 26,
  titleTh: "SQL ที่ปลอดภัยสำหรับ Production: Parameterized Queries, Transactions และ Migrations",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ไม่ต้องใช้ API key · กัน SQL Injection ด้วย `?`, ใช้ WAL/Transaction และทำ Schema Migration แบบ versioned",
  icon: "lock",
  visual: {
    id: "sql-cache-arch",
    title: "Parameterized Queries (?) กัน SQL Injection & Schema Migrations",
    caption: "ดูความต่างระหว่าง f-string SQL ที่เสี่ยง injection กับการใช้ placeholder `?` และตาราง schema_version",
    alt: "แผนภาพ parameterized query และ schema migration ใน SQLite",
  },
  requiresApiKey: false,
  tools: ["SQLite", "SQL", "Python 3.12", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "จัดเก็บข้อมูลลูกค้าและอัปเกรดตารางโดยไม่ทำข้อมูลเก่าหาย",
      body: "ระบบ AI ไม่เคยหยุดนิ่ง — วันแรกตาราง `tickets` อาจมีแค่ข้อความ แต่สัปดาห์หน้าทีมอาจต้องเพิ่มคอลัมน์ `priority` หรือดัชนีค้นหาใหม่โดยไม่ลบข้อมูลเดิม",
      lessonNote: "วันนี้เราสร้างกลไก versioned {{schema}} migration ด้วย `PRAGMA user_version` ที่รันซ้ำกี่ครั้งก็ปลอดภัย ({{idempotency}})",
    },
    {
      node: 4,
      heading: "ป้องกัน SQL Injection และรับประกันความสมบูรณ์ของข้อมูลด้วย Transaction",
      body: "ข้อความจากลูกค้าหรือผลลัพธ์จากโมเดลอาจมีเครื่องหมายคำพูด `'` หรือข้อความโจมตีปะปนมา การต่อสตริง SQL ตรง ๆ เปิดช่องโหว่ร้ายแรงทันที",
      lessonNote: "ใช้ parameterized queries (`?` ใน {{sqlite}} หรือ `$1`/`%s` ใน PostgreSQL) คู่กับ `with conn:` transaction และโหมด WAL",
    },
    {
      node: 5,
      heading: "สืบค้นประวัติย้อนหลังได้เร็วและตรวจสอบเวอร์ชันฐานข้อมูลได้",
      body: "เมื่อข้อมูล log โตเป็นแสนแถว การไม่มี index ทำให้ query ช้าจนกระทบแอป และการไม่รู้เวอร์ชัน schema ทำให้ดีบักปัญหาข้ามเครื่องได้ยาก",
      lessonNote: "สร้าง index บนคอลัมน์ที่ใช้กรองบ่อยและตรวจ `PRAGMA user_version` เพื่อยืนยันสถานะฐานข้อมูลทุกครั้งที่เปิดแอป",
    },
  ],

  objectives: [
    "**ป้องกัน** ช่องโหว่ SQL Injection ด้วยการใช้ parameterized queries (`?` ใน {{sqlite}} และรู้ความต่างของ `$1`/`%s` ใน PostgreSQL) แทนการต่อ f-string",
    "**จัดการ** Transaction อย่างปลอดภัยด้วย `with conn:` (atomic commit/rollback) รวมถึงตั้งค่า `PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON` และสร้าง `INDEX`",
    "**ออกแบบ** ระบบ versioned {{schema}} migrations แบบ {{idempotency|idempotent}} ด้วย `PRAGMA user_version` ที่อัปเกรดฐานข้อมูลทีละขั้นได้อย่างปลอดภัย",
  ],

  prerequisites: [
    "ผ่าน Day 25 (ใช้งาน Python `sqlite3`, `row_factory` และคำสั่ง SQL พื้นฐาน)",
    "เข้าใจการจัดการไฟล์ด้วย {{pathlib}} (Day 5) และการรันเทสต์ด้วย {{pytest}}",
    "มี Python 3.11+ และ `uv` บนเครื่อง — ไม่ต้องติดตั้ง PostgreSQL จริงและไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `uv` ใหม่หรือใช้ workspace เดิมจาก Block B07 เพื่อทดสอบ Parameterized Queries, Transaction Rollback และ Schema Migrations บน {{sqlite}} แบบ 100% local",
    commands: `uv init ai-day26-migrations && cd ai-day26-migrations
uv add --dev pytest ruff

# ยืนยันว่า Python sqlite3 พร้อมใช้งาน
uv run python -c "import sqlite3; print('sqlite3 ok:', sqlite3.sqlite_version)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day26-migrations` ด้วย `uv init`"],
      ["dev", "เพิ่ม `pytest` และ `ruff` ผ่าน `uv add --dev`"],
      ["check", "รันตรวจโมดูล `sqlite3` ใน environment ของ `uv`"],
    ],
    note: "แนวคิดทั้งหมดในบทนี้ (Parameterized Queries, Transactions, Indexes, Sequential Migrations) ใช้หลักการเดียวกันทั้งบน SQLite และ PostgreSQL ใน Phase 4–5",
  },

  concepts: [
    {
      id: "parameterized-queries",
      title: "1 · Parameterized Queries — กฎเหล็กห้ามต่อ f-string ลง SQL",
      paragraphs: [
        "ความผิดพลาดด้านความปลอดภัยที่พบบ่อยที่สุดคือการเขียน `f\"SELECT * FROM tickets WHERE ticket_id = '{user_input}'\"` เพราะถ้าผู้ใช้ส่งค่า `' OR '1'='1` เข้ามา ฐานข้อมูลจะตีความว่ามันคือ **คำสั่ง SQL** ไม่ใช่ข้อมูล ทำให้ดึงข้อมูลลูกค้าทุกคนหรือแม้แต่ลบตารางได้",
        "วิธีแก้ที่ถูกต้องเพียงหนึ่งเดียวคือใช้ **Parameterized Queries** โดยวาง placeholder `?` (ใน {{sqlite}}) หรือ `%s` / `$1` (ใน PostgreSQL `psycopg` / `asyncpg`) แล้วส่งค่าจริงแยกเป็นอาร์กิวเมนต์ที่สองของ `conn.execute(sql, params)` ไดรเวอร์ฐานข้อมูลจะแยกโค้ดออกจากข้อมูลโดยสมบูรณ์และจัดการเครื่องหมาย `'` ให้เองอัตโนมัติ",
      ],
      analogy:
        "เหมือนแบบฟอร์มโอนเงินที่ช่อง 'ชื่อผู้รับ' กับช่อง 'คำสั่งดำเนินการ' แยกขาดจากกัน — ต่อให้ลูกค้าเขียนคำว่า 'โอนเงินทั้งหมดออก' ลงในช่องชื่อ พนักงานก็มองเป็นแค่ชื่อตัวอักษร ไม่ใช่คำสั่ง",
      bullets: [
        "**SQLite**: ใช้ `?` (positional) เช่น `execute(sql, (ticket_id,))` หรือ `:name` (named) เช่น `execute(sql, {\"id\": ticket_id})`",
        "**PostgreSQL**: `psycopg` ใช้ `%s` ส่วน `asyncpg` ใช้ `$1, $2` — หลักการส่งพารามิเตอร์แยกเหมือนกันทุกตัว",
        "**ข้อควรจำของ tuple 1 ตัวใน Python**: ต้องมีเครื่องหมายจุลภาคต่อท้าย `(ticket_id,)` เสมอ ไม่ใช่ `(ticket_id)`",
      ],
      code: {
        language: "python",
        filename: "safe_query.py",
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE tickets (ticket_id TEXT PRIMARY KEY, message_th TEXT)")
conn.execute("INSERT INTO tickets VALUES (?, ?)", ("TKT-001", "ลูกค้าแจ้งลืมรหัสผ่าน"))

malicious = "' OR '1'='1"

# อันตราย (ห้ามทำ!): f-string เปิดช่องโหว่ SQL Injection
unsafe_rows = conn.execute(
    f"SELECT ticket_id FROM tickets WHERE ticket_id = '{malicious}'"
).fetchall()

# ปลอดภัย: ส่งค่าผ่าน placeholder ? เป็น tuple
safe_rows = conn.execute(
    "SELECT ticket_id FROM tickets WHERE ticket_id = ?",
    (malicious,),
).fetchall()

print("Unsafe count:", len(unsafe_rows))  # 1 (ข้อมูลรั่ว!)
print("Safe count:  ", len(safe_rows))    # 0 (ปลอดภัย!)`,
        caption: "แม้ `malicious` จะมีโค้ด SQL Injection อยู่ข้างใน แต่เมื่อส่งผ่าน `?` SQLite จะค้นหาข้อความ `\"' OR '1'='1\"` ตรงตัวและไม่คืนข้อมูลใครทั้งสิ้น",
      },
      whyTitle: "Why this matters — ข้อความ AI และ LLM Output คือ Untrusted Input",
      whyParagraphs: [
        "ในแอป AI ข้อมูลที่ถูกบันทึกลงฐานข้อมูลไม่ได้มีแค่ข้อความจากลูกค้า แต่ยังรวมถึงข้อความที่ LLM สร้างขึ้นซึ่งอาจมีเครื่องหมาย quote, JSON หรือข้อความจาก prompt injection ฝังอยู่",
        "นอกจากป้องกันการโจมตีแล้ว Parameterized Query ยังทำให้ประโยคภาษาไทยที่มีเครื่องหมาย `'` หรือคำพูดไม่ทำให้ SQL พังกลางทางด้วย",
      ],
    },
    {
      id: "transactions-wal-indexes",
      title: "2 · Transactions (`with conn:`), โหมด WAL และ Indexes",
      paragraphs: [
        "เมื่อคุณต้องบันทึกข้อมูลหลายแถวที่ต้องสำเร็จพร้อมกัน (เช่น บันทึกทิกเก็ตชุดหนึ่ง หรืออัปเกรดตารางพร้อมอัปเดตเลขเวอร์ชัน) ให้ครอบด้วย **Transaction** ใน Python `sqlite3` บล็อก `with conn:` จะ `COMMIT` อัตโนมัติเมื่อจบโดยไม่มี error และ `ROLLBACK` ย้อนคืนทั้งหมดทันทีหากเกิด exception กลางคัน",
        "สำหรับ SQLite ที่ใช้จริงบนดิสก์ มีการตั้งค่าพื้นฐาน 3 อย่างที่ควรทำเสมอตอนเปิดการเชื่อมต่อ: (1) `PRAGMA journal_mode = WAL;` เพื่อให้อ่านและเขียนพร้อมกันได้โดยไม่ค่อยติดล็อก `database is locked`, (2) `PRAGMA foreign_keys = ON;` เพราะ SQLite ปิดการตรวจ foreign key ไว้เป็นค่าเริ่มต้น, และ (3) สร้าง `INDEX` บนคอลัมน์ที่ใช้ใน `WHERE` / `JOIN` บ่อย ๆ",
      ],
      analogy:
        "Transaction เหมือนการย้ายของข้ามห้องแบบ 'ไปหมดหรืออยู่หมด' ถ้ากล่องใบที่ 3 แตกกลางทาง ระบบจะเก็บทุกกล่องกลับที่เดิมไม่ให้ข้อมูลครึ่ง ๆ กลาง ๆ ส่วน Index เหมือนสารบัญท้ายเล่มที่เปิดหาหน้าได้ทันทีไม่ต้องพลิกทีละหน้า",
      code: {
        language: "python",
        filename: "wal_transaction.py",
        code: `import sqlite3
from pathlib import Path


def open_connection(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


# ตัวอย่าง Transaction: ถ้าแถวใดแถวหนึ่งพัง ระบบจะ ROLLBACK ทั้งชุด
def insert_batch(conn: sqlite3.Connection, rows: list[tuple[str, str]]) -> None:
    with conn:
        conn.executemany(
            "INSERT INTO tickets (ticket_id, channel) VALUES (?, ?)",
            rows,
        )`,
        caption: "ระวัง: `with conn:` ใน Python `sqlite3` จัดการเฉพาะ commit/rollback ของ transaction เท่านั้น **ไม่ได้ปิดการเชื่อมต่อ** — อย่าลืมเรียก `conn.close()` เมื่อเลิกใช้งาน",
      },
      whyTitle: "Why this matters — ป้องกันฐานข้อมูลค้างและข้อมูลแหว่ง",
      whyParagraphs: [
        "ถ้าไม่มี transaction และโปรแกรมหยุดกะทันหันระหว่างบันทึก 500 ทิกเก็ต คุณจะได้ข้อมูลครึ่ง ๆ กลาง ๆ ที่แก้ยากมาก ส่วนการไม่เปิด WAL ทำให้กระบวนการอ่าน (เช่น แดชบอร์ดหรือ CLI อีกตัว) ชนกับกระบวนการเขียนจนเกิด `OperationalError: database is locked`",
        "การสร้าง index ที่เหมาะสมช่วยให้ query ค้นหาทิกเก็ตตาม `channel` หรือ `created_at` วิ่งเร็วคงที่ในระดับมิลลิวินาทีแม้ตารางจะโตเป็นแสนแถว",
      ],
    },
    {
      id: "schema-migrations",
      title: "3 · Versioned Schema Migrations ด้วย `PRAGMA user_version`",
      paragraphs: [
        "หลายคนเริ่มสร้างตารางด้วย `CREATE TABLE IF NOT EXISTS` แต่พอวันรุ่งขึ้นต้องการเพิ่มคอลัมน์ `priority` หรือเพิ่ม index ใหม่ คำสั่ง `CREATE TABLE IF NOT EXISTS` จะไม่แก้ตารางเดิมที่สร้างไว้แล้ว ทำให้ฐานข้อมูลบนเครื่องเพื่อนร่วมทีมหรือบนเซิร์ฟเวอร์มีโครงสร้างไม่ตรงกับโค้ดใหม่",
        "ทางออกที่เป็นมาตรฐานคือ **Versioned Migrations**: เก็บรายการคำสั่ง SQL เรียงตามเลขเวอร์ชัน (`v1`, `v2`, `v3`, ...) และบันทึกเวอร์ชันปัจจุบันไว้ในฐานข้อมูล (SQLite มีช่อง `PRAGMA user_version` ในตัว ส่วน PostgreSQL นิยมใช้ตาราง `schema_migrations` หรือเครื่องมืออย่าง Alembic) เมื่อเปิดแอป ระบบจะรันเฉพาะเวอร์ชันที่มากกว่าค่าปัจจุบันภายใน transaction เดียวกัน",
      ],
      analogy:
        "เหมือนประวัติการอัปเดตซอฟต์แวร์มือถือ — เครื่องรู้ว่าตอนนี้ติดตั้งถึงเวอร์ชัน 1 แล้ว เมื่อออกเวอร์ชัน 2 และ 3 ระบบจะติดตั้งเฉพาะแพตช์ 2 และ 3 ตามลำดับโดยไม่ล้างข้อมูลเดิมในเครื่อง",
      code: {
        language: "python",
        filename: "migrations.py",
        code: `import sqlite3

MIGRATIONS: list[tuple[int, list[str]]] = [
    (
        1,
        [
            """
            CREATE TABLE tickets (
                ticket_id TEXT PRIMARY KEY,
                channel TEXT NOT NULL,
                message_th TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """,
        ],
    ),
    (
        2,
        [
            "ALTER TABLE tickets ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'",
            "CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel)",
        ],
    ),
]


def apply_migrations(conn: sqlite3.Connection) -> int:
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for version, statements in MIGRATIONS:
        if version > current:
            with conn:
                for stmt in statements:
                    conn.execute(stmt)
                conn.execute(f"PRAGMA user_version = {int(version)}")
            current = version
    return current`,
        caption: "สังเกตว่า `PRAGMA user_version` ไม่รองรับ placeholder `?` จึงต้องแปลง `int(version)` จากค่าที่ควบคุมโดยโค้ดเท่านั้น (ห้ามรับจากผู้ใช้เด็ดขาด!)",
      },
      whyTitle: "Why this matters — รันซ้ำกี่ครั้งก็ได้ผลเดิม (Idempotency)",
      whyParagraphs: [
        "การทำ migration แบบมีเลขเวอร์ชันทำให้คุณเรียก `apply_migrations(conn)` ทุกครั้งที่เปิด CLI หรือสตาร์ต FastAPI ได้อย่างมั่นใจ — ถ้าฐานข้อมูลอัปเดตแล้วฟังก์ชันจะข้ามทันทีไม่เกิด error `duplicate column name`",
        "เมื่อขยับไปใช้ PostgreSQL + `pgvector` ใน Phase 4–5 แนวคิด sequential migrations นี้จะต่อยอดไปยัง Alembic หรือ SQL migration files ได้ทันทีโดยไม่ต้องเรียนใหม่",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ SQLite + Python กับ PostgreSQL / Prisma / Drizzle",
      body: [
        "หากคุณเคยใช้ Prisma Migrate, Drizzle Kit หรือ Knex ในฝั่งเว็บ โครงสร้างที่ทำในบทนี้คือกลไกเบื้องหลังแบบโปร่งใสที่ไม่ซ่อนเวทมนตร์:",
      ],
      table: [
        ["`conn.execute('... WHERE id = ?', (x,))`", "`sql` tag หรือ `pool.query('... WHERE id = $1', [x])`"],
        ["`with conn:` (auto commit/rollback)", "`await db.transaction(async (tx) => { ... })`"],
        ["`PRAGMA user_version` + `MIGRATIONS` list", "`_prisma_migrations` table + `migrations/*.sql`"],
        ["`PRAGMA journal_mode = WAL`", "PostgreSQL ใช้ MVCC + WAL เป็นค่าเริ่มต้นอยู่แล้ว"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม `(ticket_id,)` ต้องมีลูกน้ำต่อท้าย?",
      body: [
        "ใน Python วงเล็บธรรมดา `(\"TKT-001\")` ไม่ใช่ tuple แต่มันคือ string `\"TKT-001\"` เฉย ๆ หากคุณส่งเข้า `conn.execute(sql, (ticket_id))` SQLite จะมอง string ยาว 7 ตัวอักษรเป็น 7 พารามิเตอร์แล้วโยน `ProgrammingError: Incorrect number of bindings supplied`!",
        "การใส่ลูกน้ำต่อท้าย `(ticket_id,)` บอก Python ชัดเจนว่านี่คือ tuple ที่มีสมาชิก 1 ตัว — เป็นบั๊กคลาสสิกที่จำไว้ครั้งเดียวช่วยประหยัดเวลาดีบักไปตลอดชีวิต",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองรันครบทั้ง 3 สถานการณ์จริงบนไฟล์ฐานข้อมูล {{sqlite}} ชั่วคราว: กัน SQL Injection, ทดสอบ Rollback เมื่อเกิด duplicate key กลาง batch และทดสอบรัน Migration ซ้ำ 2 รอบ",
    steps: [
      {
        title: "1 · เปิดการเชื่อมต่อพร้อม WAL, Foreign Keys และรัน Migration v1 → v2",
        explain:
          "รัน `apply_migrations` สองรอบติดกันเพื่อพิสูจน์ {{idempotency}}: รอบแรกอัปเกรดจาก 0 → 2 รอบสองตรวจเจอเวอร์ชัน 2 แล้วไม่รันซ้ำ",
        code: {
          language: "python",
          filename: "worked_d026.py",
          code: `import sqlite3
import tempfile
from pathlib import Path

MIGRATIONS: list[tuple[int, list[str]]] = [
    (
        1,
        [
            """
            CREATE TABLE tickets (
                ticket_id TEXT PRIMARY KEY,
                channel TEXT NOT NULL,
                message_th TEXT NOT NULL
            )
            """,
        ],
    ),
    (
        2,
        [
            "ALTER TABLE tickets ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'",
            "CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel)",
        ],
    ),
]


def apply_migrations(conn: sqlite3.Connection) -> int:
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for version, statements in MIGRATIONS:
        if version > current:
            with conn:
                for stmt in statements:
                    conn.execute(stmt)
                conn.execute(f"PRAGMA user_version = {int(version)}")
            current = version
    return current


tmp_dir = Path(tempfile.mkdtemp())
db_file = tmp_dir / "tickets.db"
conn = sqlite3.connect(db_file)
conn.row_factory = sqlite3.Row
conn.execute("PRAGMA foreign_keys = ON")
mode = conn.execute("PRAGMA journal_mode = WAL").fetchone()[0]

v_first = apply_migrations(conn)
v_second = apply_migrations(conn)
print(f"journal_mode={mode}, v_first={v_first}, v_second={v_second}")`,
        },
        output: `journal_mode=wal, v_first=2, v_second=2`,
      },
      {
        title: "2 · พิสูจน์ Atomic Rollback เมื่อแถวที่สองใน Batch พัง",
        explain:
          "ใส่ข้อมูล 1 แถวสำเร็จก่อน จากนั้นลองแทรก batch 2 แถวที่แถวหลังมี `ticket_id` ซ้ำ — บล็อก `with conn:` จะย้อนคืนทั้ง batch ทำให้แถวแรกของ batch นั้นไม่หลงเหลืออยู่",
        code: {
          language: "python",
          filename: "worked_d026.py",
          code: `with conn:
    conn.execute(
        "INSERT INTO tickets (ticket_id, channel, message_th, priority) VALUES (?, ?, ?, ?)",
        ("TKT-001", "line", "ขอใบกำกับภาษีครับ", "high"),
    )

try:
    with conn:
        conn.execute(
            "INSERT INTO tickets (ticket_id, channel, message_th) VALUES (?, ?, ?)",
            ("TKT-002", "web", "ปุ่มจ่ายเงินกดไม่ได้"),
        )
        # แถวนี้ชน PRIMARY KEY 'TKT-001' -> โยน IntegrityError และ rollback TKT-002 ด้วย!
        conn.execute(
            "INSERT INTO tickets (ticket_id, channel, message_th) VALUES (?, ?, ?)",
            ("TKT-001", "email", "รหัสซ้ำ"),
        )
except sqlite3.IntegrityError as exc:
    print("Caught IntegrityError:", exc)

ids = [r["ticket_id"] for r in conn.execute("SELECT ticket_id FROM tickets ORDER BY ticket_id")]
print("Tickets after rollback:", ids)`,
        },
        output: `Caught IntegrityError: UNIQUE constraint failed: tickets.ticket_id
Tickets after rollback: ['TKT-001']`,
      },
      {
        title: "3 · ทดสอบ Parameterized Query กับอินพุตที่พยายามทำ SQL Injection",
        explain:
          "ส่งสตริงโจมตี `\"' OR '1'='1\"` ผ่าน placeholder `?` และตรวจว่าไม่ได้ข้อมูลรั่ว แถมชื่อคอลัมน์ `priority` จาก migration v2 พร้อมใช้งาน",
        code: {
          language: "python",
          filename: "worked_d026.py",
          code: `def get_ticket(conn: sqlite3.Connection, ticket_id: str) -> dict[str, str] | None:
    row = conn.execute(
        "SELECT ticket_id, channel, message_th, priority FROM tickets WHERE ticket_id = ?",
        (ticket_id,),
    ).fetchone()
    return dict(row) if row is not None else None


print("Legit lookup:", get_ticket(conn, "TKT-001"))
print("Injection attempt:", get_ticket(conn, "' OR '1'='1"))
conn.close()`,
        },
        output: `Legit lookup: {'ticket_id': 'TKT-001', 'channel': 'line', 'message_th': 'ขอใบกำกับภาษีครับ', 'priority': 'high'}
Injection attempt: None`,
      },
    ],
    gotcha:
      "ข้อควรระวังใหญ่บน Windows และใน `pytest`: บล็อก `with conn:` ใน Python `sqlite3` **ไม่ได้ปิดการเชื่อมต่อไฟล์** — ถ้าลืมเรียก `conn.close()` ใน fixture หรือโค้ดจริง ไฟล์ `.db` และ `.db-wal` อาจถูกล็อกจนลบหรือย้ายไม่ได้",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `ticket_db.py` ที่จัดการเปิด {{sqlite}} (WAL + foreign keys), รัน versioned migrations v1 → v2 แบบ idempotent, แทรกทิกเก็ตแบบ atomic transaction และค้นหาด้วย parameterized query อย่างปลอดภัย",
    requirements: [
      "ประกาศ `MIGRATIONS: list[tuple[int, list[str]]]` ที่มี v1 สร้างตาราง `tickets(ticket_id TEXT PRIMARY KEY, channel TEXT NOT NULL, message_th TEXT NOT NULL, created_at TEXT NOT NULL)` และ v2 เพิ่มคอลัมน์ `priority TEXT NOT NULL DEFAULT 'normal'` พร้อมสร้าง index `idx_tickets_channel` บน `tickets(channel)`",
      "สร้าง `open_db(db_path: Path) -> sqlite3.Connection` ที่ตั้งค่า `row_factory = sqlite3.Row`, `PRAGMA foreign_keys = ON` และ `PRAGMA journal_mode = WAL`",
      "สร้าง `apply_migrations(conn: sqlite3.Connection) -> int` ที่อ่าน `PRAGMA user_version` รันเฉพาะ migration ที่เวอร์ชันสูงกว่าใน `with conn:` อัปเดต `PRAGMA user_version` และคืนเวอร์ชันล่าสุด (รันซ้ำได้โดยไม่ error)",
      "สร้าง `insert_tickets_atomic(conn: sqlite3.Connection, rows: list[dict[str, str]]) -> int` ที่แทรกทุกแถวด้วย parameterized `?` query ภายใน transaction เดียวกัน (`with conn:`) และคืนจำนวนแถวที่แทรก หากมีแถวใดพังต้อง rollback ทั้งหมด",
      "สร้าง `find_ticket_by_id(conn: sqlite3.Connection, ticket_id: str) -> dict[str, str] | None` ที่ใช้ parameterized `?` query ป้องกัน SQL Injection และคืน `dict(row)` หรือ `None`",
    ],
    starter: {
      language: "python",
      filename: "ticket_db.py",
      code: `import sqlite3
from pathlib import Path

MIGRATIONS: list[tuple[int, list[str]]] = [
    # TODO: v1 สร้างตาราง tickets และ v2 เพิ่มคอลัมน์ priority + index idx_tickets_channel
]


def open_db(db_path: Path) -> sqlite3.Connection:
    # TODO: เปิดการเชื่อมต่อ ตั้ง row_factory = sqlite3.Row, foreign_keys = ON, journal_mode = WAL
    raise NotImplementedError


def apply_migrations(conn: sqlite3.Connection) -> int:
    # TODO: อ่าน PRAGMA user_version แล้วรันเฉพาะ migration ที่ใหม่กว่าใน transaction
    raise NotImplementedError


def insert_tickets_atomic(
    conn: sqlite3.Connection, rows: list[dict[str, str]]
) -> int:
    # TODO: แทรกทุกแถวใน with conn: ด้วย placeholder ? (default priority = 'normal')
    raise NotImplementedError


def find_ticket_by_id(
    conn: sqlite3.Connection, ticket_id: str
) -> dict[str, str] | None:
    # TODO: ค้นหาด้วย parameterized query (?) แล้วคืน dict(row) หรือ None
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_db.py",
      code: `import sqlite3
from pathlib import Path
import pytest
from ticket_db import (
    apply_migrations,
    find_ticket_by_id,
    insert_tickets_atomic,
    open_db,
)


def test_open_db_and_idempotent_migrations(tmp_path: Path):
    conn = open_db(tmp_path / "app.db")
    try:
        assert conn.execute("PRAGMA foreign_keys").fetchone()[0] == 1
        assert conn.execute("PRAGMA journal_mode").fetchone()[0].lower() == "wal"

        assert apply_migrations(conn) == 2
        # รันซ้ำรอบสองต้อง idempotent ไม่ error
        assert apply_migrations(conn) == 2

        indexes = {
            r["name"]
            for r in conn.execute("PRAGMA index_list('tickets')").fetchall()
        }
        assert "idx_tickets_channel" in indexes
    finally:
        conn.close()


def test_insert_atomic_rollback_on_duplicate(tmp_path: Path):
    conn = open_db(tmp_path / "app.db")
    try:
        apply_migrations(conn)
        count = insert_tickets_atomic(
            conn,
            [
                {
                    "ticket_id": "TKT-101",
                    "channel": "line",
                    "message_th": "ขอใบเสร็จรับเงิน",
                    "created_at": "2026-05-01T10:00:00",
                    "priority": "high",
                }
            ],
        )
        assert count == 1

        # แถวที่สองซ้ำ TKT-101 -> TKT-102 ต้องถูก rollback ไปด้วย
        with pytest.raises(sqlite3.IntegrityError):
            insert_tickets_atomic(
                conn,
                [
                    {
                        "ticket_id": "TKT-102",
                        "channel": "web",
                        "message_th": "ลืมรหัสผ่าน",
                        "created_at": "2026-05-01T10:05:00",
                    },
                    {
                        "ticket_id": "TKT-101",
                        "channel": "email",
                        "message_th": "รหัสซ้ำ",
                        "created_at": "2026-05-01T10:06:00",
                    },
                ],
            )

        assert find_ticket_by_id(conn, "TKT-102") is None
        found = find_ticket_by_id(conn, "TKT-101")
        assert found is not None
        assert found["priority"] == "high"
    finally:
        conn.close()


def test_find_ticket_blocks_sql_injection(tmp_path: Path):
    conn = open_db(tmp_path / "app.db")
    try:
        apply_migrations(conn)
        insert_tickets_atomic(
            conn,
            [
                {
                    "ticket_id": "TKT-201",
                    "channel": "web",
                    "message_th": "สอบถามการคืนเงิน",
                    "created_at": "2026-05-02T09:00:00",
                }
            ],
        )
        assert find_ticket_by_id(conn, "' OR '1'='1") is None
        assert find_ticket_by_id(conn, "TKT-201; DROP TABLE tickets; --") is None
        # ตารางต้องยังอยู่ครบและค้นหาตัวจริงได้
        row = find_ticket_by_id(conn, "TKT-201")
        assert row is not None
        assert row["priority"] == "normal"
    finally:
        conn.close()
`,
    },
    selfCheck: [
      "`open_db` เปิดทั้ง `PRAGMA foreign_keys = ON` และ `PRAGMA journal_mode = WAL` สำเร็จ",
      "`apply_migrations(conn)` รันซ้ำสองครั้งได้เวอร์ชัน `2` ทั้งสองครั้งโดยไม่เกิด error `duplicate column name`",
      "`insert_tickets_atomic` ย้อนคืนทั้งชุดเมื่อเกิด `sqlite3.IntegrityError` กลาง batch (`TKT-102` ไม่หลงเหลือ)",
      "`find_ticket_by_id` คืน `None` เมื่อรับสตริง SQL Injection และไม่ทำให้ตารางเสียหาย",
      "ผ่าน `uv run pytest -q` ครบ 3 ข้อ และ `uv run ruff check .` สะอาด",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 3 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `insert_tickets_atomic` ให้ดึงค่า `row.get('priority', 'normal')` เพื่อรองรับกรณีที่ผู้เรียกไม่ได้ระบุ `priority` มาใน dict",
      },
      {
        body: "ใน `find_ticket_by_id` อย่าลืมใส่จุลภาคใน tuple 1 ตัว `(ticket_id,)` และแปลงผลด้วย `dict(row) if row is not None else None`",
      },
      {
        body: "โครงของ `MIGRATIONS`, `open_db` และ `apply_migrations` พร้อมแล้ว เหลือเติม `insert_tickets_atomic` และ `find_ticket_by_id`",
        code: {
          language: "python",
          filename: "hint-d026-l3.py",
          code: `import sqlite3
from pathlib import Path

MIGRATIONS: list[tuple[int, list[str]]] = [
    (
        1,
        [
            """
            CREATE TABLE tickets (
                ticket_id TEXT PRIMARY KEY,
                channel TEXT NOT NULL,
                message_th TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """,
        ],
    ),
    (
        2,
        [
            "ALTER TABLE tickets ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'",
            "CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel)",
        ],
    ),
]


def open_db(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def apply_migrations(conn: sqlite3.Connection) -> int:
    current = conn.execute("PRAGMA user_version").fetchone()[0]
    for version, statements in MIGRATIONS:
        if version > current:
            with conn:
                for stmt in statements:
                    conn.execute(stmt)
                conn.execute(f"PRAGMA user_version = {int(version)}")
            current = version
    return current


def insert_tickets_atomic(
    conn: sqlite3.Connection, rows: list[dict[str, str]]
) -> int:
    # TODO: ใช้ with conn: + conn.executemany(...) ด้วย placeholder ?
    raise NotImplementedError


def find_ticket_by_id(
    conn: sqlite3.Connection, ticket_id: str
) -> dict[str, str] | None:
    # TODO: SELECT ด้วย WHERE ticket_id = ? และส่ง (ticket_id,)
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
      caption: "`tmp_path` ของ pytest จะสร้างโฟลเดอร์ชั่วคราวให้แต่ละเทสต์โดยไม่ทิ้งไฟล์ `.db` ไว้รกโฟลเดอร์งาน",
    },
  },

  mistakes: [
    {
      title: "ต่อค่าตัวแปรลงใน SQL ด้วย f-string หรือ `+`",
      symptom: "เสี่ยง SQL Injection ทันที และโค้ดพังด้วย `OperationalError` แค่ลูกค้าพิมพ์เครื่องหมาย `'` ในข้อความ",
      fix: "ใช้ placeholder `?` ใน SQLite (หรือ `%s` / `$1` ใน PostgreSQL) และส่งข้อมูลเป็นอาร์กิวเมนต์ตัวที่สองเสมอ",
    },
    {
      title: "ลืมลูกน้ำใน tuple 1 ตัว `(ticket_id)`",
      symptom: "เกิด `sqlite3.ProgrammingError: Incorrect number of bindings supplied` เพราะ Python แตก string ออกเป็นทีละตัวอักษร",
      fix: "เขียนเป็น `(ticket_id,)` (มีเครื่องหมายจุลภาค) หรือใช้ลิสต์ `[ticket_id]`",
    },
    {
      title: "นึกว่า `with conn:` ปิดการเชื่อมต่อฐานข้อมูลให้แล้ว",
      symptom: "ไฟล์ `.db` และ `.db-wal` ค้างล็อกอยู่บน Windows หรือจำนวน file descriptor รั่วเมื่อเปิดหลายรอบ",
      fix: "`with conn:` ทำแค่ commit/rollback transaction — ให้ปิดการเชื่อมต่อด้วย `try ... finally: conn.close()` หรือ `contextlib.closing(conn)` เสมอ",
    },
    {
      title: "เขียน `ALTER TABLE` ลงในสคริปต์สตาร์ตอัปตรง ๆ โดยไม่เช็กเลขเวอร์ชัน",
      symptom: "รันรอบแรกรอด แต่พอสตาร์ตแอปซ้ำรอบสองพังทันทีด้วย `OperationalError: duplicate column name`",
      fix: "ใช้ระบบ versioned migrations ด้วย `PRAGMA user_version` เพื่อรันแต่ละขั้นเพียงครั้งเดียวแบบ {{idempotency|idempotent}}",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อย้ำความปลอดภัยของ Parameterized Queries, Transactions และ Schema Migrations",
    questions: [
      mc(
        "d026-q1",
        "ข้อใดคือวิธีเขียนคำสั่งค้นหาทิกเก็ตใน Python `sqlite3` ที่ปลอดภัยจาก SQL Injection และถูกต้องตามไวยากรณ์?",
        [
          ["`conn.execute(f\"SELECT * FROM tickets WHERE ticket_id = '{tid}'\")`", "เสี่ยง SQL Injection และพังทันทีเมื่อ `tid` มีเครื่องหมาย `'`"],
          ["`conn.execute(\"SELECT * FROM tickets WHERE ticket_id = ?\", (tid))`", "ขาดเครื่องหมายจุลภาคใน tuple 1 ตัว — Python จะแยก string `tid` เป็นพารามิเตอร์ทีละตัวอักษร"],
          ["`conn.execute(\"SELECT * FROM tickets WHERE ticket_id = ?\", (tid,))`", "ถูก — ใช้ `?` placeholder แยกโค้ดออกจากข้อมูล และส่ง tuple 1 ตัวอย่างถูกต้อง"],
          ["`conn.execute(\"SELECT * FROM tickets WHERE ticket_id = \" + tid)`", "อันตรายเหมือน f-string และผิดไวยากรณ์ SQL เมื่อ `tid` เป็นข้อความ"],
        ],
        "C",
        "Parameterized query ด้วย `?` และส่ง `(tid,)` แยกต่างหากทำให้ไดรเวอร์ส่งค่าเป็นข้อมูลล้วน ๆ ไม่ถูกตีความเป็นคำสั่ง SQL",
        "จะเขียน parameterized query ที่มี 1 พารามิเตอร์ใน Python `sqlite3` ให้ปลอดภัยและไม่ติดบั๊ก tuple อย่างไร?",
        "`conn.execute(\"SELECT ... WHERE id = ?\", (value,))` — ต้องใช้ `?` และมีลูกน้ำใน tuple 1 ตัวเสมอ",
      ),
      mc(
        "d026-q2",
        "ภายในบล็อก `with conn:` ของ Python `sqlite3` หากคำสั่ง `INSERT` แถวที่ 1 สำเร็จ แต่แถวที่ 2 โยน `sqlite3.IntegrityError` จะเกิดอะไรขึ้น?",
        [
          ["แถวที่ 1 ยังถูกบันทึกค้างไว้ในตาราง ส่วนแถวที่ 2 ถูกข้าม", "ไม่จริง — บล็อก `with conn:` ครอบทั้งสองคำสั่งเป็น transaction เดียวกัน"],
          ["`with conn:` จะสั่ง `ROLLBACK` ย้อนคืนทั้งแถวที่ 1 และแถวที่ 2 ให้อัตโนมัติ และปล่อย exception ออกไป", "ถูก — นี่คือคุณสมบัติ Atomicity ของ transaction ทำให้ข้อมูลไม่แหว่งครึ่ง ๆ กลาง ๆ"],
          ["`with conn:` จะกลืน `IntegrityError` เงียบ ๆ และปิดการเชื่อมต่อให้ทันที", "ไม่ใช่ทั้งคู่: `with conn:` ไม่กลืน exception และไม่ได้ปิด connection"],
          ["SQLite จะลบทั้งตารางออกแล้วสร้างใหม่", "Rollback ย้อนเฉพาะการเปลี่ยนแปลงใน transaction ปัจจุบันเท่านั้น"],
        ],
        "B",
        "Context manager `with conn:` ของ `sqlite3` จะ `COMMIT` เมื่อออกจากบล็อกโดยไม่มี error และ `ROLLBACK` เมื่อมี exception เกิดขึ้น แต่ไม่ปิด connection",
        "บล็อก `with conn:` ใน Python `sqlite3` ทำหน้าที่อะไรเมื่อเกิด exception กลางคัน?",
        "สั่ง `ROLLBACK` ย้อนคืนการเปลี่ยนแปลงทั้งหมดใน transaction นั้นอัตโนมัติ (แต่ไม่ได้ปิด connection)",
      ),
      mc(
        "d026-q3",
        "ทำไมควรตั้งค่า `PRAGMA journal_mode = WAL` และ `PRAGMA foreign_keys = ON` เมื่อใช้งาน SQLite บนไฟล์จริง?",
        [
          ["เพื่อเข้ารหัสไฟล์ `.db` ด้วยรหัสผ่าน", "SQLite มาตรฐานไม่ได้เข้ารหัสไฟล์ผ่าน PRAGMA สองตัวนี้"],
          ["WAL ช่วยให้อ่านและเขียนพร้อมกันได้โดยลดปัญหาล็อก ส่วน `foreign_keys = ON` บังคับให้ SQLite ตรวจความสัมพันธ์ระหว่างตารางจริง ๆ", "ถูก — SQLite ปิดการตรวจ foreign keys ไว้เป็นค่าเริ่มต้น และโหมด rollback journal เดิมจะบล็อกการอ่านระหว่างเขียน"],
          ["เพื่อให้ SQLite รองรับการใช้ f-string แทน `?` ได้อย่างปลอดภัย", "ไม่มี PRAGMA ใดที่ทำให้ f-string SQL ปลอดภัย"],
          ["เพื่อลบข้อมูลเก่าที่อายุเกิน 24 ชั่วโมงอัตโนมัติ", "การล้างข้อมูลหมดอายุต้องทำในตรรกะ TTL ของแอปเอง (Day 27)"],
        ],
        "B",
        "WAL (Write-Ahead Logging) เพิ่ม concurrency ของการอ่าน-เขียนบน SQLite ได้อย่างมาก และต้องเปิด `PRAGMA foreign_keys = ON` ทุกครั้งที่เปิดการเชื่อมต่อใหม่หากต้องการบังคับ referential integrity",
        "ทำไมต้องเปิด `PRAGMA journal_mode = WAL` และ `PRAGMA foreign_keys = ON` ใน SQLite?",
        "WAL ลดปัญหา `database is locked` เมื่ออ่าน-เขียนพร้อมกัน และ `foreign_keys = ON` เปิดการตรวจ foreign key ซึ่ง SQLite ปิดไว้เป็นค่าเริ่มต้น",
      ),
      mc(
        "d026-q4",
        "เหตุใดระบบ migration จึงควรบันทึกเลขเวอร์ชัน (เช่น `PRAGMA user_version`) แทนการใช้ `CREATE TABLE IF NOT EXISTS` เพียงอย่างเดียว?",
        [
          ["เพราะ `CREATE TABLE IF NOT EXISTS` ใช้ใน SQLite ไม่ได้", "SQLite รองรับ `CREATE TABLE IF NOT EXISTS` ตามปกติ"],
          ["เพราะเมื่อต้องเพิ่มคอลัมน์ (`ALTER TABLE`) หรือแก้โครงสร้างตารางที่มีข้อมูลอยู่แล้ว ต้องรู้ว่าฐานข้อมูลถึงเวอร์ชันไหน เพื่อรันเฉพาะขั้นที่ยังไม่ได้รันแบบ idempotent", "ถูก — ช่วยอัปเกรดฐานข้อมูลทุกเครื่องให้ตรงกันโดยไม่ลบข้อมูลเก่าและไม่ error เมื่อสตาร์ตซ้ำ"],
          ["เพราะ `PRAGMA user_version` ช่วยบีบอัดขนาดฐานข้อมูลลง 50%", "`user_version` เป็นเพียงเลขจำนวนเต็ม 32-bit ใน header ของไฟล์ SQLite"],
          ["เพราะ PostgreSQL ไม่รองรับ `CREATE TABLE`", "PostgreSQL รองรับ `CREATE TABLE` และใช้ตาราง version migration ด้วยหลักการเดียวกัน"],
        ],
        "B",
        "การเก็บเวอร์ชันของ {{schema}} ช่วยให้ทุกการเปลี่ยนแปลง (`ALTER TABLE`, `CREATE INDEX`, backfill) รันตามลำดับเป๊ะและรันซ้ำกี่ครั้งก็ไม่พัง",
        "ข้อจำกัดของ `CREATE TABLE IF NOT EXISTS` คืออะไร และ versioned migration แก้ปัญหานี้อย่างไร?",
        "`CREATE TABLE IF NOT EXISTS` ไม่สามารถอัปเกรดตารางเดิม (เช่น เพิ่มคอลัมน์) ได้ — versioned migration เก็บเลขเวอร์ชัน (`PRAGMA user_version`) แล้วรันเฉพาะขั้นที่ใหม่กว่าใน transaction",
      ),
    ],
  },

  takeaways: [
    "ห้ามใช้ f-string หรือ `+` ต่อค่าตัวแปรลงใน SQL เด็ดขาด — ใช้ parameterized queries (`?` ใน SQLite / `%s` หรือ `$1` ใน PostgreSQL) พร้อม tuple `(value,)` เสมอ",
    "ครอบการเขียนเป็นชุดด้วย `with conn:` เพื่อรับประกัน atomic commit/rollback และอย่าลืมเรียก `conn.close()` แยกต่างหากเมื่อเลิกใช้",
    "เปิด `PRAGMA journal_mode = WAL` และ `PRAGMA foreign_keys = ON` ตอนเปิดการเชื่อมต่อ พร้อมสร้าง `INDEX` บนคอลัมน์ที่ค้นหาบ่อย",
    "ใช้ versioned migrations ด้วย `PRAGMA user_version` (รันเฉพาะ `version > current` ใน transaction) เพื่ออัปเกรด schema แบบ idempotent โดยไม่ทำข้อมูลเก่าหาย",
  ],

  reviewCards: [
    rc(
      "d026-rc-1",
      "Placeholder ของ Parameterized Query ใน SQLite กับ PostgreSQL (`psycopg` / `asyncpg`) ต่างกันอย่างไร?",
      "SQLite ใช้ `?` (หรือ `:name`), `psycopg` ใช้ `%s`, `asyncpg` ใช้ `$1, $2` — ทุกตัวส่งค่าข้อมูลแยกจากคำสั่ง SQL เพื่อกัน SQL Injection",
    ),
    rc(
      "d026-rc-2",
      "ต่างกันอย่างไรระหว่าง `with conn:` กับ `conn.close()` ใน Python `sqlite3`?",
      "`with conn:` จัดการเฉพาะ transaction (`COMMIT` เมื่อสำเร็จ / `ROLLBACK` เมื่อ error) แต่ไม่ได้ปิดการเชื่อมต่อ — ต้องเรียก `conn.close()` เองต่างหาก",
    ),
    rc(
      "d026-rc-3",
      "รูปแบบ versioned migration ด้วย `PRAGMA user_version` ทำงานอย่างไรให้ปลอดภัยและ idempotent?",
      "อ่าน `user_version` ปัจจุบัน แล้ววนรันเฉพาะ migration ที่ `version > current` ภายใน `with conn:` พร้อมอัปเดต `PRAGMA user_version = version` เมื่อรันซ้ำจึงข้ามขั้นเดิมทั้งหมด",
    ),
  ],

  sources: [
    { label: "Python 3 Official Docs — sqlite3 How-To & Parameterized Queries", href: "https://docs.python.org/3/library/sqlite3.html#how-to-use-placeholders-to-bind-values-in-sql-queries" },
    { label: "SQLite Official Docs — Write-Ahead Logging (WAL)", href: "https://www.sqlite.org/wal.html" },
    { label: "SQLite Official Docs — PRAGMA Statements (`user_version`, `foreign_keys`)", href: "https://www.sqlite.org/pragma.html" },
    { label: "OWASP Cheat Sheet — SQL Injection Prevention", href: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
  ],

  glossary: [
    "sqlite",
    "schema",
    "idempotency",
    "pathlib",
    "pydantic",
    "pytest",
    "ruff",
  ],
});
