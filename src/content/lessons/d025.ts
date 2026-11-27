import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D025 — Phase 1 / Block B07
 * SQL Refresher for AI Engineers (JOIN, GROUP BY, Window basics).
 */
export const d025: Lesson = defineLesson({
  day: 25,
  titleTh: "SQL สำหรับวิศวกร AI: JOIN, GROUP BY และ Window Functions",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ไม่ต้องใช้ API key · วิเคราะห์ log ทิกเก็ต ต้นทุนโทเคน และผลรันล่าสุดของโมเดลด้วย SQLite",
  icon: "database",
  visual: {
    id: "sql-cache-arch",
    title: "SQL Analytics, Parameterized Queries & SQLite Response Cache",
    caption: "กดสลับดู Window Functions สำหรับ log AI, ความปลอดภัยของ ? placeholder และ Cache Hit vs Miss",
    alt: "แผนภาพ SQL analytics, parameterized queries และ SQLite cache",
  },
  requiresApiKey: false,
  tools: ["SQL", "SQLite", "Python 3.12", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "เชื่อมข้อมูลทิกเก็ตกับประวัติการรันโมเดลด้วย JOIN",
      body: "ในระบบ AI จริง ข้อมูลลูกค้า ทิกเก็ต และบันทึกการเรียก {{llm}} ไม่ได้อยู่ในตารางเดียวกัน การเชื่อมตารางอย่างถูกประเภทช่วยให้เห็นทั้งงานที่เสร็จแล้วและงานที่ตกหล่น",
      lessonNote: "วันนี้เราใช้ `INNER JOIN` และ `LEFT JOIN` บน {{sqlite}} เพื่อจับคู่ `tickets` กับ `model_runs` และหาทิกเก็ตที่ยังไม่ถูกประมวลผล",
    },
    {
      node: 3,
      heading: "สรุปต้นทุน Latency และอัตรา Error แยกรายโมเดล",
      body: "ก่อนตัดสินใจเปลี่ยนโมเดลหรือปรับ prompt ทีมต้องมีตัวเลขเทียบชัด ๆ ว่าแต่ละโมเดลพลาดกี่เปอร์เซ็นต์และใช้ค่าใช้จ่ายเท่าไร",
      lessonNote: "ใช้ `GROUP BY` ร่วมกับ `HAVING` และ `SUM(CASE WHEN ...)` เพื่อสร้างรายงานเปรียบเทียบโมเดลในคำสั่ง SQL เดียว",
    },
    {
      node: 5,
      heading: "ติดตามเหตุการณ์ล่าสุดและงบสะสมด้วย Window Functions",
      body: "ทิกเก็ตหนึ่งใบอาจถูกส่งให้โมเดลรันซ้ำหลายรอบเมื่อมี retry หากดึงมาทุกแถวจะนับซ้ำ และถ้าใช้ `GROUP BY` เฉย ๆ จะเสียรายละเอียดของรอบล่าสุด",
      lessonNote: "ใช้ {{sql-window|Window Functions}} อย่าง `ROW_NUMBER()` เพื่อหยิบผลรันล่าสุดต่อทิกเก็ต และ `SUM(...) OVER (...)` สำหรับต้นทุนสะสมรายวัน",
    },
    {
      node: 6,
      heading: "ต่อยอดสู่คลังข้อมูลขนาดใหญ่ใน Phase 2",
      body: "ไวยากรณ์ SQL ที่ฝึกบน SQLite วันนี้ใช้ต่อได้ทันทีกับ PostgreSQL, {{duckdb}} และ {{polars}} SQL เมื่อข้อมูลขยายเป็นหลักล้านแถว",
      lessonNote: "วางรากฐาน SQL analytics ตั้งแต่ Phase 1 เพื่อลดโค้ด `for` loop ที่ช้าและซับซ้อนใน Python",
    },
  ],

  objectives: [
    "**เลือกใช้** `INNER JOIN` และ `LEFT JOIN` เพื่อเชื่อมตาราง `tickets` กับ `model_runs` รวมถึงค้นหารายการที่ยังไม่มีผลรัน (`IS NULL`)",
    "**เขียนคำสั่ง** `GROUP BY`, `HAVING` และ conditional aggregation (`SUM(CASE WHEN ...)`) เพื่อคำนวณค่าใช้จ่ายและ error rate แยกรายโมเดล",
    "**ประยุกต์** {{sql-window|Window Functions}} (`ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` และ `SUM(...) OVER (...)`) ผ่าน CTE บน Python `sqlite3`",
  ],

  prerequisites: [
    "เขียนฟังก์ชัน Python พื้นฐาน (dict, list, type hints) และคุ้นเคยกับ `pytest` / `ruff`",
    "มี Python 3.11+ และ `uv` บนเครื่อง (โมดูล `sqlite3` มากับ Python อยู่แล้ว ไม่ต้องลงเพิ่ม)",
    "ไม่จำเป็นต้องจำไวยากรณ์ SQL ได้ครบทุกคำสั่ง — บทนี้ทบทวนเฉพาะท่าที่ใช้จริงในงาน AI Engineering",
    "ไม่ต้องใช้ API key — รันฐานข้อมูลในหน่วยความจำ (`:memory:`) ได้ 100%",
  ],

  setup: {
    intro:
      "Python มีโมดูล `sqlite3` ติดมากับ standard library อยู่แล้ว เราจึงสร้างฐานข้อมูล {{sqlite}} ใน RAM หรือไฟล์ `.db` เพื่อฝึก SQL ได้ทันทีผ่านโปรเจกต์ `uv`",
    commands: `uv init ai-day25-sql && cd ai-day25-sql
uv add --dev pytest ruff

# ตรวจเวอร์ชัน SQLite ที่มากับ Python (3.25+ รองรับ Window Functions เต็มรูปแบบ)
uv run python -c "import sqlite3; print('SQLite:', sqlite3.sqlite_version)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day25-sql` ด้วย `uv init`"],
      ["dev", "เพิ่ม `pytest` และ `ruff` สำหรับตรวจโค้ดแบบฝึกหัด"],
      ["version", "ตรวจว่า `sqlite3.sqlite_version` เป็น 3.25.0 ขึ้นไป (รองรับ Window Functions)"],
    ],
    note: "ใช้ฐานข้อมูลในหน่วยความจำ `sqlite3.connect(':memory:')` ระหว่างฝึกและรันเทสต์ เพื่อความเร็วและไม่ต้องตามลบไฟล์เก่า",
  },

  concepts: [
    {
      id: "inner-vs-left-join",
      title: "1 · INNER JOIN vs LEFT JOIN — เชื่อมตารางโดยไม่ทำข้อมูลตกหล่น",
      paragraphs: [
        "ในระบบ AI ข้อมูลมักแยกเป็นหลายตาราง เช่น `tickets` เก็บคำถามลูกค้า และ `model_runs` เก็บประวัติการเรียก {{llm}} (อาจมี 0, 1 หรือหลายรอบต่อทิกเก็ต) การเลือกชนิดของ `JOIN` จะกำหนดว่าทิกเก็ตที่ยังไม่มีผลรันจะหายไปจากรายงานหรือไม่",
        "`INNER JOIN` คืนเฉพาะแถวที่มีคู่ตรงกันทั้งสองฝั่ง เหมาะกับการวิเคราะห์งานที่รันแล้ว ส่วน `LEFT JOIN` เก็บทุกแถวของตารางซ้ายไว้เสมอและเติม `NULL` ในคอลัมน์ฝั่งขวาเมื่อยังไม่มีคู่ — เมื่อเติมเงื่อนไข `WHERE m.run_id IS NULL` คุณจะเจอคิวงานค้างทันที",
      ],
      analogy:
        "เหมือนเทียบสมุดรับออร์เดอร์หน้าร้าน (ตารางซ้าย) กับบิลที่ครัวทำเสร็จแล้ว (ตารางขวา) — `INNER JOIN` เห็นเฉพาะโต๊ะที่ได้อาหารแล้ว แต่ `LEFT JOIN` ยังเห็นโต๊ะที่สั่งไว้แต่ครัวยังไม่ได้ทำ",
      code: {
        language: "sql",
        filename: "join_backlog.sql",
        code: `-- หาทิกเก็ตที่ยังไม่เคยถูกส่งให้โมเดลประมวลผลเลย
SELECT
    t.ticket_id,
    t.channel,
    t.created_at
FROM tickets AS t
LEFT JOIN model_runs AS m
    ON t.ticket_id = m.ticket_id
WHERE m.run_id IS NULL
ORDER BY t.ticket_id;`,
        caption: "ข้อควรระวัง: ถ้าใส่เงื่อนไขกรองคอลัมน์ฝั่งขวา เช่น `WHERE m.status = 'ok'` หลัง `LEFT JOIN` โดยไม่เช็ก `IS NULL` มันจะกลายเป็น `INNER JOIN` โดยไม่ตั้งใจ",
      },
      whyTitle: "Why this matters — ป้องกัน Silent Drop ในงานประเมิน AI",
      whyParagraphs: [
        "หากคุณใช้ `INNER JOIN` เสมอตอนทำรายงานประจำวัน ทิกเก็ตที่ค้างอยู่ในคิวหรือพังก่อนบันทึก `model_runs` จะหายไปจากกราฟเงียบ ๆ ทำให้ทีมเข้าใจผิดว่าระบบทำงานครบ 100%",
        "การตรวจหา orphan/unprocessed records ด้วย `LEFT JOIN ... WHERE right.id IS NULL` เป็นคำสั่งแรกที่วิศวกรข้อมูลและวิศวกร AI ใช้ตรวจสุขภาพ pipeline",
      ],
    },
    {
      id: "group-by-having",
      title: "2 · GROUP BY + HAVING — สรุปต้นทุนและ Error Rate รายโมเดล",
      paragraphs: [
        "`GROUP BY` ยุบหลายแถวที่มีค่าคอลัมน์จัดกลุ่มตรงกันให้เหลือ 1 แถวสรุปต่อกลุ่ม เพื่อคำนวณค่าสถิติอย่าง `COUNT(*)`, `SUM(cost_usd)` และ `AVG(latency_ms)` สำหรับนับเฉพาะแถวที่เข้าเงื่อนไข (เช่น รอบที่ `status = 'error'`) ให้ใช้ `SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END)`",
        "จุดที่มือใหม่สับสนบ่อยคือ `WHERE` กับ `HAVING`: **`WHERE` กรองทีละแถวก่อนจัดกลุ่ม** (เช่น เลือกเฉพาะข้อมูลเดือนนี้) ส่วน **`HAVING` กรองผลลัพธ์หลังจัดกลุ่มแล้ว** (เช่น แสดงเฉพาะโมเดลที่มีอย่างน้อย 2 รอบการรัน หรือมี error rate เกิน 10%)",
      ],
      analogy:
        "เหมือนฝ่ายบัญชีสรุปค่าไฟแยกตามสาขา — `WHERE` คือคัดบิลที่ยกเลิกออกก่อนเริ่มบวกเลข ส่วน `HAVING` คือเลือกดูเฉพาะสาขาที่รวมยอดแล้วเกิน 50,000 บาท",
      code: {
        language: "sql",
        filename: "model_summary.sql",
        code: `-- สรุปจำนวนรัน, จำนวน error และต้นทุนรวมของแต่ละโมเดล (เฉพาะโมเดลที่รัน >= 2 ครั้ง)
SELECT
    model,
    COUNT(*) AS total_runs,
    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS error_count,
    ROUND(SUM(cost_usd), 4) AS total_cost_usd,
    ROUND(AVG(latency_ms), 1) AS avg_latency_ms
FROM model_runs
GROUP BY model
HAVING COUNT(*) >= 2
ORDER BY total_cost_usd DESC, model ASC;`,
        caption: "Conditional aggregation ด้วย `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` ใช้งานได้เหมือนกันทั้งใน SQLite, PostgreSQL และ DuckDB",
      },
      whyTitle: "Why this matters — ตัวเลขจริงสำหรับการเลือกโมเดล",
      whyParagraphs: [
        "ใน Phase 3–5 คุณจะต้องเทียบโมเดลขนาดเล็กกับโมเดลขนาดใหญ่ทั้งด้านความเร็ว ค่าใช้จ่ายต่อ 1,000 ทิกเก็ต และอัตราการล้มเหลว การสรุปในฐานข้อมูลโดยตรงเร็วกว่าการดึงแถวทั้งหมดมาวนลูปใน Python หลายสิบเท่า",
        "นอกจากนี้ `HAVING` ช่วยตัด noise จากโมเดลทดลองที่เพิ่งรันไปแค่ 1–2 ครั้งออกจากการจัดอันดับอัตโนมัติ",
      ],
    },
    {
      id: "window-functions",
      title: "3 · Window Functions — จัดอันดับและสะสมยอดโดยไม่ยุบแถว",
      paragraphs: [
        "{{sql-window|Window Function}} คือฟังก์ชันที่คำนวณข้ามกลุ่มของแถวผ่านคำสั่ง `OVER (PARTITION BY ... ORDER BY ...)` **โดยยังคงจำนวนแถวเดิมไว้ครบทุกแถว** ต่างจาก `GROUP BY` ที่ยุบแถวทิ้งเหลือแค่ผลรวม",
        "สองท่าที่วิศวกร AI ใช้แทบทุกสัปดาห์คือ (1) `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC)` เพื่อติดเลข `1` ให้ผลรันล่าสุดของแต่ละทิกเก็ต แล้วคัดออกด้วย CTE (`WITH ranked AS (...) SELECT ... WHERE rn = 1`) และ (2) `SUM(cost_usd) OVER (ORDER BY run_date)` เพื่อคำนวณงบสะสม (running total) ไล่ตามวัน",
      ],
      analogy:
        "เหมือนประกาศอันดับคะแนนของนักเรียนแยกตามแต่ละห้อง (`PARTITION BY room`) — นักเรียนทุกคนยังมีรายชื่ออยู่ในตารางครบพร้อมเลขที่อันดับของตัวเอง ไม่ได้ถูกยุบเหลือแค่ค่าเฉลี่ยประจำห้อง",
      bullets: [
        "**`PARTITION BY col`** — แบ่งหน้าต่างการคำนวณแยกตามกลุ่ม (เช่น แยกทีละ `ticket_id`)",
        "**`ORDER BY col DESC`** — กำหนดลำดับภายในหน้าต่าง (เช่น เอาเวลาล่าสุดขึ้นเป็นอันดับ 1)",
        "**CTE (`WITH ... AS (...)`)** — ช่วยให้กรองคอลัมน์ผลลัพธ์จาก Window Function อย่าง `WHERE rn = 1` ได้อย่างสะอาด",
      ],
      code: {
        language: "sql",
        filename: "latest_run_window.sql",
        code: `-- ดึงผลรันล่าสุดของแต่ละทิกเก็ต (ตัดรอบเก่าที่เคย retry ทิ้ง)
WITH ranked_runs AS (
    SELECT
        run_id,
        ticket_id,
        model,
        status,
        cost_usd,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY ticket_id
            ORDER BY created_at DESC, run_id DESC
        ) AS rn
    FROM model_runs
)
SELECT run_id, ticket_id, model, status, cost_usd, created_at
FROM ranked_runs
WHERE rn = 1
ORDER BY ticket_id;`,
        caption: "ใส่คอลัมน์ tie-breaker (`run_id DESC`) ต่อท้าย `created_at DESC` เสมอ เพื่อให้ผลลัพธ์นิ่งแม้สองแถวมี timestamp เดียวกัน",
      },
      whyTitle: "Why this matters — แก้ปัญหาข้อมูลซ้ำจาก Retry & Re-run",
      whyParagraphs: [
        "ระบบ AI ที่มี retry (Block B04) มักบันทึกประวัติการรันทุกครั้งลงตาราง log เพื่อใช้สืบค้นย้อนหลัง แต่เวลาคิดความแม่นยำหรือส่งผลให้แดชบอร์ด เราต้องการเฉพาะ *ผลล่าสุดของแต่ละทิกเก็ต*",
        "`ROW_NUMBER() OVER (PARTITION BY ...)` ใน CTE แก้โจทย์นี้ได้ใน 10 บรรทัดโดยไม่ต้องเขียน self-join ซับซ้อนหรือดึงทั้งตารางเข้า RAM",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ SQL Analytics กับ ORM และ JS Array Methods",
      body: [
        "นักพัฒนาเว็บหลายคนคุ้นเคยกับการดึงข้อมูลผ่าน ORM (`findMany()`) แล้วค่อยมา `.filter()` / `.reduce()` ใน JavaScript แต่เมื่อตาราง log มีหลายแสนแถว การผลักงานรวมยอดและจัดอันดับไปให้ฐานข้อมูลทำจะประหยัดทั้ง RAM และเวลาเครือข่าย:",
      ],
      table: [
        ["`LEFT JOIN ... WHERE m.run_id IS NULL`", "`tickets.filter(t => !runSet.has(t.id))`"],
        ["`GROUP BY model` + `SUM(...)`", "`Object.groupBy` + `.reduce(...)`"],
        ["`ROW_NUMBER() OVER (PARTITION BY ...)`", "จัดกลุ่มแล้ว `.sort()` หยิบสมาชิกตัวแรก (`[0]`)"],
        ["`conn.row_factory = sqlite3.Row`", "คืนแถวแบบเข้าถึงชื่อคอลัมน์ได้ (`row['model']`) คล้าย ORM object"],
      ],
    },
    student: {
      title: "First-Year Note — ลำดับการทำงานจริงของคำสั่ง SQL",
      body: [
        "แม้เราจะเขียน `SELECT` ไว้บรรทัดแรก แต่ฐานข้อมูลไม่ได้เริ่มทำงานจาก `SELECT`! ลำดับจริงคือ: `FROM / JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` (และ Window Functions) → `ORDER BY` → `LIMIT`",
        "นี่คือเหตุผลที่คุณเขียน `WHERE rn = 1` ใน query เดียวกับ `ROW_NUMBER() ... AS rn` ไม่ได้ เพราะ `WHERE` รันก่อน `SELECT` เสมอ — การห่อด้วย `WITH ranked AS (...)` (CTE) จึงเป็นวิธีมาตรฐานที่อ่านง่ายที่สุด",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองสร้างฐานข้อมูล {{sqlite}} ในหน่วยความจำผ่าน Python `sqlite3` ใส่ข้อมูลทิกเก็ตภาษาไทยและการรันโมเดล (รวมทิกเก็ตที่ยังไม่รันและทิกเก็ตที่รันซ้ำหลัง error) แล้วรันครบทั้ง 3 ท่า SQL",
    steps: [
      {
        title: "1 · สร้างตารางและใส่ข้อมูลจำลองใน Python `sqlite3`",
        explain:
          "กำหนด `conn.row_factory = sqlite3.Row` เพื่อให้แปลงผลลัพธ์เป็น `dict(row)` ได้ทันที อ่านง่ายกว่าการอ้างอิงดัชนี `row[0]`, `row[1]`",
        code: {
          language: "python",
          filename: "worked_d025.py",
          code: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row

conn.executescript("""
CREATE TABLE tickets (
    ticket_id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    message_th TEXT NOT NULL
);

CREATE TABLE model_runs (
    run_id INTEGER PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    model TEXT NOT NULL,
    status TEXT NOT NULL,
    cost_usd REAL NOT NULL,
    latency_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

INSERT INTO tickets VALUES
    ('TKT-001', 'line',  'ขอใบกำกับภาษีใหม่ครับ'),
    ('TKT-002', 'web',   'โอนเงินแล้วสถานะยังไม่ปรับ'),
    ('TKT-003', 'email', 'เข้าสู่ระบบไม่ได้ ลืมรหัสผ่าน');

INSERT INTO model_runs VALUES
    (1, 'TKT-001', 'mini-v1', 'error', 0.0010, 820, '2026-05-01T09:00:00'),
    (2, 'TKT-001', 'mini-v1', 'ok',    0.0012, 310, '2026-05-01T09:01:00'),
    (3, 'TKT-002', 'pro-v1',  'ok',    0.0065, 640, '2026-05-02T10:00:00');
""")
print("Seeded tickets:", conn.execute("SELECT COUNT(*) FROM tickets").fetchone()[0])`,
        },
        output: `Seeded tickets: 3`,
      },
      {
        title: "2 · ใช้ LEFT JOIN หาทิกเก็ตค้าง และ GROUP BY + HAVING สรุปรายโมเดล",
        explain:
          "`TKT-003` ยังไม่มีแถวใน `model_runs` จึงโผล่ขึ้นมาเมื่อใช้ `LEFT JOIN ... WHERE m.run_id IS NULL` ส่วน `GROUP BY model` แสดงจำนวน error และต้นทุนรวมของแต่ละโมเดล",
        code: {
          language: "python",
          filename: "worked_d025.py",
          code: `unprocessed = [
    row["ticket_id"]
    for row in conn.execute("""
        SELECT t.ticket_id
        FROM tickets AS t
        LEFT JOIN model_runs AS m ON t.ticket_id = m.ticket_id
        WHERE m.run_id IS NULL
        ORDER BY t.ticket_id
    """)
]
print("Unprocessed:", unprocessed)

summary = [
    dict(row)
    for row in conn.execute("""
        SELECT
            model,
            COUNT(*) AS total_runs,
            SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS error_count,
            ROUND(SUM(cost_usd), 4) AS total_cost_usd
        FROM model_runs
        GROUP BY model
        HAVING COUNT(*) >= 1
        ORDER BY total_cost_usd DESC
    """)
]
print("Model summary:", summary)`,
        },
        output: `Unprocessed: ['TKT-003']
Model summary: [{'model': 'pro-v1', 'total_runs': 1, 'error_count': 0, 'total_cost_usd': 0.0065}, {'model': 'mini-v1', 'total_runs': 2, 'error_count': 1, 'total_cost_usd': 0.0022}]`,
      },
      {
        title: "3 · ใช้ Window Functions หาผลรันล่าสุดและต้นทุนสะสมรายวัน",
        explain:
          "`ROW_NUMBER()` คัดเหลือเฉพาะรอบล่าสุดของ `TKT-001` (`run_id=2`, `status='ok'`) และ `SUM(daily_cost) OVER (ORDER BY run_date)` ไล่บวกยอดสะสมทีละวัน",
        code: {
          language: "python",
          filename: "worked_d025.py",
          code: `latest = [
    dict(row)
    for row in conn.execute("""
        WITH ranked AS (
            SELECT
                run_id, ticket_id, model, status, created_at,
                ROW_NUMBER() OVER (
                    PARTITION BY ticket_id
                    ORDER BY created_at DESC, run_id DESC
                ) AS rn
            FROM model_runs
        )
        SELECT run_id, ticket_id, model, status
        FROM ranked
        WHERE rn = 1
        ORDER BY ticket_id
    """)
]
print("Latest per ticket:", latest)

running = [
    dict(row)
    for row in conn.execute("""
        WITH daily AS (
            SELECT substr(created_at, 1, 10) AS run_date, SUM(cost_usd) AS daily_cost
            FROM model_runs
            GROUP BY substr(created_at, 1, 10)
        )
        SELECT
            run_date,
            ROUND(daily_cost, 4) AS daily_cost,
            ROUND(SUM(daily_cost) OVER (ORDER BY run_date), 4) AS running_cost
        FROM daily
        ORDER BY run_date
    """)
]
print("Running cost:", running)
conn.close()`,
        },
        output: `Latest per ticket: [{'run_id': 2, 'ticket_id': 'TKT-001', 'model': 'mini-v1', 'status': 'ok'}, {'run_id': 3, 'ticket_id': 'TKT-002', 'model': 'pro-v1', 'status': 'ok'}]
Running cost: [{'run_date': '2026-05-01', 'daily_cost': 0.0022, 'running_cost': 0.0022}, {'run_date': '2026-05-02', 'daily_cost': 0.0065, 'running_cost': 0.0087}]`,
      },
    ],
    gotcha:
      "ข้อควรระวังเรื่อง `ROUND()` และ float ใน SQLite: การบวกตัวเลขทศนิยมหลายแถวอาจเกิดเศษทศนิยมแบบ floating-point (เช่น `0.008700000000000001`) ควรใช้ `ROUND(..., 4)` ใน SQL หรือ `pytest.approx(...)` ตอนเขียนเทสต์เปรียบเทียบค่าเงิน",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `ticket_analytics.py` ที่มีฟังก์ชัน SQL Analytics 4 ตัวบน Python `sqlite3` เพื่อตรวจคิวทิกเก็ตค้าง สรุปต้นทุนรายโมเดล คัดผลรันล่าสุด และคำนวณงบสะสมรายวัน",
    requirements: [
      "สร้าง `find_unprocessed_tickets(conn: sqlite3.Connection) -> list[str]` โดยใช้ `LEFT JOIN` หา `ticket_id` ที่ยังไม่มีแถวใน `model_runs` เรียงตาม `ticket_id` จากน้อยไปมาก",
      "สร้าง `summarize_models(conn: sqlite3.Connection, min_runs: int = 1) -> list[dict[str, object]]` ใช้ `GROUP BY model` + `HAVING COUNT(*) >= ?` คืน dict ที่มีคีย์ `model`, `total_runs`, `error_count`, `total_cost_usd` (ปัดเศษ 4 ตำแหน่ง) เรียงตาม `total_cost_usd DESC, model ASC`",
      "สร้าง `latest_run_per_ticket(conn: sqlite3.Connection) -> list[dict[str, object]]` ใช้ CTE และ `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC)` คัดเฉพาะ `rn = 1` คืนคีย์ `run_id`, `ticket_id`, `model`, `status` เรียงตาม `ticket_id ASC`",
      "สร้าง `running_cost_by_day(conn: sqlite3.Connection) -> list[dict[str, object]]` รวมต้นทุนรายวัน (`substr(created_at, 1, 10)`) แล้วคำนวณ `running_cost_usd` ด้วย `SUM(...) OVER (ORDER BY run_date)` คืนคีย์ `run_date`, `daily_cost_usd`, `running_cost_usd` (ปัดเศษ 4 ตำแหน่ง)",
      "ทุกฟังก์ชันต้องทำงานได้โดยตั้ง `conn.row_factory = sqlite3.Row` และไม่ดึงทั้งตารางมาทำจัดกลุ่มหรือจัดอันดับเองใน Python",
    ],
    starter: {
      language: "python",
      filename: "ticket_analytics.py",
      code: `import sqlite3


def find_unprocessed_tickets(conn: sqlite3.Connection) -> list[str]:
    # TODO: ใช้ LEFT JOIN ระหว่าง tickets กับ model_runs แล้วกรอง m.run_id IS NULL
    raise NotImplementedError


def summarize_models(
    conn: sqlite3.Connection, min_runs: int = 1
) -> list[dict[str, object]]:
    # TODO: ใช้ GROUP BY model, SUM(CASE WHEN status = 'error' ...), HAVING COUNT(*) >= ?
    raise NotImplementedError


def latest_run_per_ticket(conn: sqlite3.Connection) -> list[dict[str, object]]:
    # TODO: ใช้ CTE + ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC)
    raise NotImplementedError


def running_cost_by_day(conn: sqlite3.Connection) -> list[dict[str, object]]:
    # TODO: รวมยอดรายวันใน CTE แล้วใช้ SUM(daily_cost) OVER (ORDER BY run_date)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_analytics.py",
      code: `import sqlite3
import pytest
from ticket_analytics import (
    find_unprocessed_tickets,
    latest_run_per_ticket,
    running_cost_by_day,
    summarize_models,
)


@pytest.fixture
def db_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        CREATE TABLE tickets (
            ticket_id TEXT PRIMARY KEY,
            channel TEXT NOT NULL,
            message_th TEXT NOT NULL
        );
        CREATE TABLE model_runs (
            run_id INTEGER PRIMARY KEY,
            ticket_id TEXT NOT NULL,
            model TEXT NOT NULL,
            status TEXT NOT NULL,
            cost_usd REAL NOT NULL,
            latency_ms INTEGER NOT NULL,
            created_at TEXT NOT NULL
        );
        INSERT INTO tickets VALUES
            ('TKT-001', 'line', 'ขอใบกำกับภาษี'),
            ('TKT-002', 'web', 'ชำระเงินไม่ผ่าน'),
            ('TKT-003', 'email', 'เปลี่ยนที่อยู่จัดส่ง'),
            ('TKT-004', 'line', 'แอปค้างหน้าล็อกอิน');
        INSERT INTO model_runs VALUES
            (1, 'TKT-001', 'mini-v1', 'error', 0.0010, 900, '2026-05-01T08:00:00'),
            (2, 'TKT-001', 'mini-v1', 'ok',    0.0015, 300, '2026-05-01T08:02:00'),
            (3, 'TKT-002', 'pro-v1',  'ok',    0.0080, 620, '2026-05-02T11:00:00'),
            (4, 'TKT-003', 'mini-v1', 'ok',    0.0015, 290, '2026-05-03T14:00:00');
    """)
    yield conn
    conn.close()


def test_find_unprocessed_tickets(db_conn):
    assert find_unprocessed_tickets(db_conn) == ["TKT-004"]


def test_summarize_models_with_having(db_conn):
    all_models = summarize_models(db_conn, min_runs=1)
    assert [m["model"] for m in all_models] == ["pro-v1", "mini-v1"]
    assert all_models[1] == {
        "model": "mini-v1",
        "total_runs": 3,
        "error_count": 1,
        "total_cost_usd": 0.004,
    }

    frequent = summarize_models(db_conn, min_runs=2)
    assert len(frequent) == 1
    assert frequent[0]["model"] == "mini-v1"


def test_latest_run_per_ticket(db_conn):
    rows = latest_run_per_ticket(db_conn)
    assert rows == [
        {"run_id": 2, "ticket_id": "TKT-001", "model": "mini-v1", "status": "ok"},
        {"run_id": 3, "ticket_id": "TKT-002", "model": "pro-v1", "status": "ok"},
        {"run_id": 4, "ticket_id": "TKT-003", "model": "mini-v1", "status": "ok"},
    ]


def test_running_cost_by_day(db_conn):
    rows = running_cost_by_day(db_conn)
    assert rows == [
        {"run_date": "2026-05-01", "daily_cost_usd": 0.0025, "running_cost_usd": 0.0025},
        {"run_date": "2026-05-02", "daily_cost_usd": 0.008, "running_cost_usd": 0.0105},
        {"run_date": "2026-05-03", "daily_cost_usd": 0.0015, "running_cost_usd": 0.012},
    ]
`,
    },
    selfCheck: [
      "`find_unprocessed_tickets` คืน `['TKT-004']` โดยใช้ `LEFT JOIN ... WHERE m.run_id IS NULL`",
      "`summarize_models(db_conn, min_runs=2)` กรอง `pro-v1` ออกด้วย `HAVING COUNT(*) >= ?`",
      "`latest_run_per_ticket` เลือก `run_id=2` (รอบที่ผ่าน) แทน `run_id=1` สำหรับ `TKT-001`",
      "`running_cost_by_day` คำนวณยอดสะสม `0.0025 -> 0.0105 -> 0.012` ด้วย `SUM(...) OVER (ORDER BY run_date)`",
      "รัน `uv run pytest -q` ผ่านครบ 4 ข้อ และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "สำหรับ `find_unprocessed_tickets` ให้เอาตาราง `tickets` ไว้ฝั่งซ้ายของ `LEFT JOIN model_runs` แล้วกรองแถวที่ `m.run_id IS NULL`",
      },
      {
        body: "ใน `summarize_models` ส่ง `(min_runs,)` เป็นพารามิเตอร์ตัวที่สองของ `conn.execute(sql, (min_runs,))` เพื่อใช้กับ `HAVING COUNT(*) >= ?` และแปลงทุกแถวด้วย `[dict(row) for row in cursor]`",
      },
      {
        body: "โครงของ 3 ฟังก์ชันแรกพร้อมแล้ว เหลือเติม CTE + `SUM(...) OVER (ORDER BY run_date)` ใน `running_cost_by_day`",
        code: {
          language: "python",
          filename: "hint-d025-l3.py",
          code: `import sqlite3


def find_unprocessed_tickets(conn: sqlite3.Connection) -> list[str]:
    sql = """
        SELECT t.ticket_id
        FROM tickets AS t
        LEFT JOIN model_runs AS m ON t.ticket_id = m.ticket_id
        WHERE m.run_id IS NULL
        ORDER BY t.ticket_id ASC
    """
    return [row["ticket_id"] for row in conn.execute(sql)]


def summarize_models(
    conn: sqlite3.Connection, min_runs: int = 1
) -> list[dict[str, object]]:
    sql = """
        SELECT
            model,
            COUNT(*) AS total_runs,
            SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS error_count,
            ROUND(SUM(cost_usd), 4) AS total_cost_usd
        FROM model_runs
        GROUP BY model
        HAVING COUNT(*) >= ?
        ORDER BY total_cost_usd DESC, model ASC
    """
    return [dict(row) for row in conn.execute(sql, (min_runs,))]


def latest_run_per_ticket(conn: sqlite3.Connection) -> list[dict[str, object]]:
    sql = """
        WITH ranked AS (
            SELECT
                run_id, ticket_id, model, status,
                ROW_NUMBER() OVER (
                    PARTITION BY ticket_id
                    ORDER BY created_at DESC, run_id DESC
                ) AS rn
            FROM model_runs
        )
        SELECT run_id, ticket_id, model, status
        FROM ranked
        WHERE rn = 1
        ORDER BY ticket_id ASC
    """
    return [dict(row) for row in conn.execute(sql)]


def running_cost_by_day(conn: sqlite3.Connection) -> list[dict[str, object]]:
    # TODO: ใช้ CTE รวมยอดรายวันด้วย substr(created_at, 1, 10) แล้วใช้ SUM(...) OVER (ORDER BY run_date)
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
      caption: "ใช้ `-v` ต่อท้าย `pytest` เพื่อดูชื่อฟังก์ชันเทสต์ที่ผ่านทีละข้อ",
    },
  },

  mistakes: [
    {
      title: "ใส่เงื่อนไขฝั่งขวาของ `LEFT JOIN` ไว้ใน `WHERE` แทนที่จะไว้ใน `ON`",
      symptom: "แถวที่ยังไม่มีคู่ (ฝั่งขวาเป็น `NULL`) หายไปหมด กลายเป็น `INNER JOIN` โดยไม่รู้ตัว",
      fix: "ถ้าต้องการกรองตารางขวาแต่ยังเก็บแถวซ้ายที่ไม่มีคู่ไว้ ให้วางเงื่อนไขฝั่งขวาไว้ในเงื่อนไข `ON ... AND m.status = 'ok'` แทน `WHERE`",
    },
    {
      title: "พยายามกรองผล `ROW_NUMBER() ... AS rn` ใน `WHERE` ของ query เดียวกัน",
      symptom: "SQLite โยน `OperationalError: misuse of window function ROW_NUMBER()` หรือ `no such column: rn`",
      fix: "ห่อ query ที่คำนวณ Window Function ด้วย CTE (`WITH ranked AS (...)`) แล้วค่อยเขียน `SELECT ... FROM ranked WHERE rn = 1` ด้านนอก",
    },
    {
      title: "สับสนระหว่าง `WHERE` กับ `HAVING`",
      symptom: "เขียน `WHERE COUNT(*) >= 5` แล้วเกิด `OperationalError: misuse of aggregate: COUNT()`",
      fix: "ใช้ `WHERE` กรองแถวดิบก่อนจัดกลุ่ม และใช้ `HAVING` กรองเงื่อนไขที่มี aggregate function (`COUNT`, `SUM`, `AVG`) หลัง `GROUP BY`",
    },
    {
      title: "ลืมใส่ tie-breaker ใน `ORDER BY` ของ `ROW_NUMBER()`",
      symptom: "เมื่อสองแถวมี `created_at` เท่ากัน ผลรันที่ถูกเลือกเป็น `rn = 1` อาจไม่แน่นอน",
      fix: "ใส่คอลัมน์ unique อย่าง `run_id DESC` เป็นตัวตัดสินรองใน `ORDER BY created_at DESC, run_id DESC` เสมอ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความแม่นยำของ `JOIN`, `GROUP BY/HAVING` และ Window Functions ในงาน log ของระบบ AI",
    questions: [
      mc(
        "d025-q1",
        "ต้องการหา `ticket_id` ทั้งหมดในตาราง `tickets` ที่ **ยังไม่เคยมีประวัติการรัน** ในตาราง `model_runs` ควรใช้รูปแบบ SQL ใด?",
        [
          ["`INNER JOIN model_runs` แล้ว `WHERE m.run_id IS NULL`", "ไม่ได้ผลลัพธ์เลย เพราะ `INNER JOIN` ตัดแถวที่ไม่มีคู่ออกตั้งแต่ต้น"],
          ["`LEFT JOIN model_runs` แล้ว `WHERE m.run_id IS NULL`", "ถูก — `LEFT JOIN` เก็บทุกทิกเก็ตไว้แล้วเติม `NULL` ฝั่งขวา ทำให้ `WHERE m.run_id IS NULL` จับทิกเก็ตค้างได้ตรงจุด"],
          ["`GROUP BY ticket_id HAVING COUNT(*) = 0` บน `model_runs`", "ทิกเก็ตที่ไม่เคยอยู่ใน `model_runs` จะไม่มีกลุ่มให้ `GROUP BY` นับได้เลย"],
          ["`SELECT DISTINCT ticket_id FROM model_runs`", "คำสั่งนี้คืนเฉพาะทิกเก็ตที่เคยรันแล้ว ตรงข้ามกับสิ่งที่ต้องการ"],
        ],
        "B",
        "`LEFT JOIN` คู่กับ `WHERE right_table.key IS NULL` (เรียกว่า anti-join) เป็นวิธีมาตรฐานในการหาข้อมูลฝั่งซ้ายที่ยังไม่มีคู่ฝั่งขวา",
        "จะหาแถวในตารางซ้าย (`tickets`) ที่ยังไม่มีคู่ในตารางขวา (`model_runs`) ด้วย SQL อย่างไร?",
        "ใช้ `LEFT JOIN model_runs ON ... WHERE model_runs.run_id IS NULL`",
      ),
      mc(
        "d025-q2",
        "ข้อใดอธิบายความต่างระหว่าง `WHERE` กับ `HAVING` ในคำสั่ง SQL ได้ถูกต้องที่สุด?",
        [
          ["ใช้แทนกันได้ทุกกรณี ต่างกันแค่สไตล์การเขียน", "ไม่จริง — `WHERE` ใช้ aggregate function อย่าง `COUNT(*)` ไม่ได้"],
          ["`WHERE` กรองแถวดิบ **ก่อน** `GROUP BY` ส่วน `HAVING` กรองกลุ่ม **หลัง** `GROUP BY`", "ถูก — เช่น กรองเฉพาะทิกเก็ตเดือนนี้ด้วย `WHERE` แล้วคัดเฉพาะโมเดลที่รันอย่างน้อย 10 ครั้งด้วย `HAVING COUNT(*) >= 10`"],
          ["`HAVING` ทำงานเร็วกว่า `WHERE` เสมอ", "ตรงข้าม — การกรองแถวทิ้งเร็ว ๆ ด้วย `WHERE` ก่อนจัดกลุ่มช่วยลดงานของ `GROUP BY`"],
          ["`HAVING` ใช้ได้เฉพาะกับ Window Functions เท่านั้น", "`HAVING` ใช้กับ `GROUP BY` ส่วน Window Functions ใช้ CTE + `WHERE` ด้านนอก"],
        ],
        "B",
        "ลำดับการทำงานของ SQL คือ `WHERE` → `GROUP BY` → `HAVING` การเข้าใจลำดับนี้ช่วยให้วางเงื่อนไขได้ถูกที่และเร็วขึ้น",
        "`WHERE` และ `HAVING` ต่างกันอย่างไรในลำดับการทำงานของ SQL?",
        "`WHERE` กรองทีละแถวก่อน `GROUP BY` ส่วน `HAVING` กรองผลสรุปหลัง `GROUP BY` (ใช้กับ `COUNT`, `SUM`, `AVG` ได้)",
      ),
      mc(
        "d025-q3",
        "เหตุใดเราจึงใช้ `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC)` ใน CTE แทน `GROUP BY ticket_id` เมื่อต้องการดึง **ผลรันล่าสุดพร้อมคอลัมน์ `model` และ `status`** ของแต่ละทิกเก็ต?",
        [
          ["เพราะ `GROUP BY` ใช้ใน SQLite ไม่ได้", "SQLite รองรับ `GROUP BY` เต็มรูปแบบ"],
          ["เพราะ `GROUP BY` ยุบแถวและไม่ได้รับประกันว่าคอลัมน์อื่นอย่าง `model`/`status` จะมาจากแถวที่เวลาล่าสุดจริง ๆ แต่ Window Function จัดอันดับครบทุกแถวแล้วคัด `rn = 1` ได้แม่นยำ", "ถูก — `ROW_NUMBER()` เก็บข้อมูลทั้งแถวของรอบล่าสุดไว้อย่างถูกต้องและใช้ได้เหมือนกันทั้ง SQLite, PostgreSQL และ DuckDB"],
          ["เพราะ `ROW_NUMBER()` ลบแถวเก่าออกจากฐานข้อมูลให้ด้วย", "คำสั่ง `SELECT` ไม่เคยแก้ไขหรือลบข้อมูลในตาราง"],
          ["เพราะ Window Function ไม่ต้องใส่ `ORDER BY`", "`ROW_NUMBER()` จำเป็นต้องมี `ORDER BY` ใน `OVER (...)` เพื่อกำหนดว่าแถวไหนคืออันดับ 1"],
        ],
        "B",
        "ใน SQL มาตรฐาน (เช่น PostgreSQL) การ `SELECT` คอลัมน์ที่ไม่ได้อยู่ใน `GROUP BY` จะ error ทันที ส่วนใน SQLite อาจคืนค่าแบบไม่แน่นอน — ใช้ CTE + `ROW_NUMBER()` จึงปลอดภัยและแม่นยำที่สุด",
        "จะดึงแถวข้อมูลล่าสุดทั้งแถวของแต่ละ `ticket_id` อย่างแม่นยำใน SQL ได้อย่างไร?",
        "ใช้ CTE คำนวณ `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC) AS rn` แล้วกรอง `WHERE rn = 1`",
      ),
      mc(
        "d025-q4",
        "ใน Python `sqlite3` การตั้งค่า `conn.row_factory = sqlite3.Row` มีประโยชน์อย่างไร?",
        [
          ["ทำให้ SQLite ทำงานแบบ asynchronous อัตโนมัติ", "`sqlite3` เป็น synchronous; `row_factory` เปลี่ยนเฉพาะรูปแบบออบเจกต์แถวที่คืนกลับมา"],
          ["ช่วยให้เข้าถึงค่าในแต่ละแถวด้วยชื่อคอลัมน์ เช่น `row['model']` และแปลงเป็น `dict(row)` ได้ทันที", "ถูก — อ่านง่ายและลดบั๊กสลับตำแหน่งคอลัมน์เมื่อเทียบกับ tuple index `row[0]`"],
          ["ป้องกัน SQL Injection ได้โดยไม่ต้องใช้ `?` placeholder", "ไม่ใช่ — การป้องกัน SQL Injection ต้องใช้ parameterized queries (Day 26)"],
          ["เปิดโหมด WAL อัตโนมัติ", "โหมด WAL ต้องเปิดด้วย `PRAGMA journal_mode = WAL`"],
        ],
        "B",
        "ค่าเริ่มต้นของ `sqlite3` คืนแถวเป็น `tuple` ซึ่งเปราะบางเมื่อมีการสลับหรือเพิ่มคอลัมน์ใน `SELECT` การตั้ง `conn.row_factory = sqlite3.Row` ทำให้โค้ดอ่านและดูแลรักษาง่ายขึ้นมาก",
        "`conn.row_factory = sqlite3.Row` ใน Python `sqlite3` ทำหน้าที่อะไร?",
        "เปลี่ยนแถวผลลัพธ์จาก tuple เป็นออบเจกต์ `sqlite3.Row` ที่เข้าถึงด้วยชื่อคอลัมน์และแปลงเป็น `dict(row)` ได้",
      ),
    ],
  },

  takeaways: [
    "ใช้ `LEFT JOIN ... WHERE right.id IS NULL` เพื่อหาทิกเก็ตค้างหรือข้อมูลที่ตกหล่นจาก pipeline โดยไม่ถูก `INNER JOIN` ตัดทิ้งเงียบ ๆ",
    "`WHERE` กรองแถวดิบก่อนจัดกลุ่ม ส่วน `HAVING` กรองกลุ่มหลัง `GROUP BY` — จับคู่กับ `SUM(CASE WHEN ...)` เพื่อคิด error rate และต้นทุนต่อโมเดล",
    "Window Functions (`ROW_NUMBER()`, `SUM() OVER (...)`) คำนวณข้ามกลุ่มโดยไม่ยุบแถว ใช้คู่กับ CTE (`WITH ...`) เพื่อดึงผลรันล่าสุดและยอดสะสมรายวัน",
    "ตั้ง `conn.row_factory = sqlite3.Row` ใน Python `sqlite3` เพื่อให้ได้ผลลัพธ์แบบเข้าถึงตามชื่อคอลัมน์และแปลงเป็น `dict(row)` ได้สะอาดตา",
  ],

  reviewCards: [
    rc(
      "d025-rc-1",
      "ทำไม `LEFT JOIN model_runs ... WHERE m.status = 'ok'` จึงทำตัวเหมือน `INNER JOIN` และควรแก้อย่างไร?",
      "เพราะแถวที่ไม่มีคู่จะมี `m.status` เป็น `NULL` จึงถูก `WHERE m.status = 'ok'` ตัดทิ้ง — ต้องย้ายเงื่อนไข `m.status = 'ok'` ไปไว้ในเงื่อนไข `ON` แทน",
    ),
    rc(
      "d025-rc-2",
      "ต่างกันอย่างไรระหว่าง `GROUP BY` กับ Window Function (`OVER (PARTITION BY ...)`)?",
      "`GROUP BY` ยุบหลายแถวให้เหลือ 1 แถวสรุปต่อกลุ่ม ส่วน Window Function คำนวณข้ามกลุ่มแต่ยังคงทุกแถวเดิมไว้ครบ",
    ),
    rc(
      "d025-rc-3",
      "จะดึงผลรันล่าสุดของแต่ละทิกเก็ตด้วย `ROW_NUMBER()` โดยไม่เกิด error เรื่องคอลัมน์ `rn` ใน `WHERE` ได้อย่างไร?",
      "คำนวณ `ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at DESC, run_id DESC) AS rn` ไว้ใน CTE (`WITH ranked AS (...)`) แล้วกรอง `WHERE rn = 1` ใน `SELECT` ด้านนอก",
    ),
  ],

  sources: [
    { label: "Python 3 Official Docs — sqlite3 DB-API 2.0 Interface", href: "https://docs.python.org/3/library/sqlite3.html" },
    { label: "SQLite Official Docs — Window Functions", href: "https://www.sqlite.org/windowfunctions.html" },
    { label: "SQLite Official Docs — WITH Clause (Common Table Expressions)", href: "https://www.sqlite.org/lang_with.html" },
    { label: "PostgreSQL Docs — Window Functions Tutorial", href: "https://www.postgresql.org/docs/current/tutorial-window.html" },
  ],

  glossary: [
    "sqlite",
    "sql-window",
    "llm",
    "pytest",
    "ruff",
    "duckdb",
    "polars",
  ],
});
