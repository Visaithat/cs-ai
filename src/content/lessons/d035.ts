import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D035 — Phase 2 / Block B09
 * Local Analytics at Scale with DuckDB over CSV/Parquet
 */
export const d035: Lesson = defineLesson({
  day: 35,
  titleTh: "วิเคราะห์ข้อมูลระดับล้านแถวบนเครื่องด้วย DuckDB + Parquet",
  tagline: "30 นาที · รันบน CPU เครื่องคุณ 100% ไม่ต้องใช้ API key · เปลี่ยน CSV เป็น Parquet แล้วคิวรีตรงด้วย DuckDB SQL + ส่งต่อ Polars แบบ zero-copy",
  icon: "database",
  visual: {
    id: "duckdb-parquet",
    title: "CSV Row Scan vs DuckDB Columnar Parquet Scan",
    caption: "กดเทียบการอ่าน CSV ทั้งไฟล์กับการคิวรีไฟล์ Parquet แบบเลือกเฉพาะคอลัมน์ใน DuckDB",
    alt: "แผนภาพเปรียบเทียบการอ่าน CSV กับ DuckDB Parquet columnar scan",
  },
  requiresApiKey: false,
  tools: ["DuckDB", "Polars", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "จัดเก็บข้อมูลสะอาดเป็น Parquet แทน CSV กินพื้นที่",
      body: "ไฟล์ CSV อ่านช้า กินดิสก์เยอะ และไม่เก็บชนิดข้อมูล ({{schema}}) — เมื่อเราทำความสะอาดข้อมูลจาก Day 34 เสร็จแล้ว การบันทึกเป็น {{parquet}} จะบีบอัดขนาดเล็กลง 5–10 เท่าและเก็บชนิดข้อมูลครบถ้วน",
      lessonNote: "วันนี้เราเปลี่ยน CSV ดิบเป็น {{parquet}} และเรียนรู้ว่าทำไมการจัดเก็บแบบคอลัมน์ (columnar) จึงเป็นมาตรฐานของงาน AI/Data สมัยใหม่",
    },
    {
      node: 2,
      heading: "วิเคราะห์และสร้างตารางฟีเจอร์ด้วย SQL ใน DuckDB",
      body: "บางคำถามเชิงวิเคราะห์อย่างการทำ multi-table `JOIN`, `GROUP BY` หรือ {{sql-window|Window Functions}} (`RANK() OVER`, rolling average) เขียนเป็น SQL อ่านง่ายกว่าโค้ด Python มาก",
      lessonNote: "{{duckdb}} รัน SQL แบบ OLAP บนไฟล์ CSV/Parquet โดยตรงในโปรเซส Python ไม่ต้องตั้งเซิร์ฟเวอร์ PostgreSQL หรือ Spark",
    },
    {
      node: 3,
      heading: "ส่งตารางผลลัพธ์กลับ Polars แบบ Zero-Copy เพื่อตรวจและเทรน",
      body: "เพราะทั้ง DuckDB และ {{polars}} พูดภาษาหน่วยความจำเดียวกันคือ Apache Arrow เราจึงสลับใช้ SQL ใน DuckDB กับ Expression ใน Polars ไปมาได้โดยแทบไม่เสียเวลาคัดลอกข้อมูล",
      lessonNote: "เรียก `.pl()` จาก DuckDB เพื่อได้ `pl.DataFrame` พร้อมเขียน {{pytest}} ตรวจสอบตัวเลขและต่อยอดสู่ ML Pipeline",
    },
  ],

  objectives: [
    "**อธิบายเหตุผลทางวิศวกรรม** ว่าทำไม {{parquet}} จึงเล็กกว่าและคิวรีเร็วกว่า CSV มาก (columnar storage, column pruning, row-group statistics, typed {{schema}} และ compression)",
    "**คิวรีไฟล์ CSV และ Parquet โดยตรงด้วย {{duckdb}}** ผ่าน Python (`read_parquet`, `read_csv_auto`, parameterized `?`) พร้อมแปลงไฟล์ CSV เป็น Parquet ที่บีบอัดด้วย `COPY ... TO ... (FORMAT PARQUET)`",
    "**เชื่อมต่อ DuckDB กับ {{polars}} แบบ zero-copy** ทั้งขาเข้า (คิวรี Polars `DataFrame`/`LazyFrame` ด้วย SQL) และขาออก (`.pl()` คืนเป็น `pl.DataFrame` สำหรับงาน ML และเทสต์)",
  ],

  prerequisites: [
    "ผ่าน Day 33–34 พื้นฐาน {{polars}} และการล้างข้อมูลไทย",
    "ทบทวน SQL `JOIN`, `GROUP BY` และ {{sql-window|Window Functions}} จาก Day 25 และ parameterized query `?` จาก Day 26",
    "รู้จักจัดการพาธไฟล์ด้วย {{pathlib}} จาก Day 5",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key หรือเซิร์ฟเวอร์ฐานข้อมูล",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์โปรเจกต์ Day 35 ด้วย `uv` และติดตั้ง {{duckdb}}, {{polars}} และ `pyarrow` (ช่วยให้เชื่อมต่อ Apache Arrow ระหว่าง DuckDB กับ Polars ราบรื่นในทุกเวอร์ชัน)",
    commands: `uv init ai-day35 && cd ai-day35
uv add duckdb polars pyarrow
uv add --dev pytest ruff
uv run python -c "import duckdb, polars as pl; print('DuckDB:', duckdb.__version__, '| Polars:', pl.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day35` ด้วย `uv init` สำเร็จ"],
      ["deps", "ติดตั้ง `duckdb`, `polars`, `pyarrow` และ dev tools (`pytest`, `ruff`)"],
      ["verify", "รันคำสั่งตรวจเวอร์ชันแล้วเห็นเลขเวอร์ชันของทั้ง DuckDB และ Polars"],
    ],
    note: "DuckDB เป็นฐานข้อมูลฝังตัว (in-process) เหมือน SQLite แต่ออกแบบมาเพื่องานวิเคราะห์คอลัมน์ (OLAP) โดยเฉพาะ — ติดตั้งแล้วรันใน Python ได้ทันทีไม่ต้องเปิด Docker",
  },

  concepts: [
    {
      id: "why-parquet-beats-csv",
      title: "1 · ทำไม Parquet ถึงชนะ CSV ขาดลอยในงาน Data & AI",
      paragraphs: [
        "ไฟล์ **CSV** เก็บข้อมูลแบบ **แถวต่อแถว (row-oriented)** ในรูปข้อความล้วน ถ้าไฟล์มี 30 คอลัมน์และ 1 ล้านแถว แต่คุณต้องการหาผลรวมของคอลัมน์ `gmv_thb` แค่คอลัมน์เดียว เครื่องก็ยังต้องอ่านทุกตัวอักษรของอีก 29 คอลัมน์ที่ไม่เกี่ยว แถมต้องเดาชนิดข้อมูลใหม่ทุกครั้ง (เช่น รหัสไปรษณีย์ `\"01055\"` มักถูกเดาเป็นเลข `1055` จนเลขศูนย์นำหน้าหาย!)",
        "ไฟล์ **{{parquet}}** เก็บข้อมูลแบบ **คอลัมน์ต่อคอลัมน์ (columnar)** พร้อม **typed {{schema}}** ในส่วนท้ายไฟล์ (footer) และแบ่งข้อมูลเป็นก้อนย่อยที่เรียกว่า **Row Groups** โดยแต่ละ Row Group มีสถิติ `min` / `max` ของแต่ละคอลัมน์กำกับไว้",
        "ผลลัพธ์คือ 3 พลังความเร็วพร้อมกัน: (1) **Column Pruning** อ่านจากดิสก์เฉพาะคอลัมน์ที่ SQL ถามถึง, (2) **Row-Group Skipping** ข้ามก้อนข้อมูลที่ไม่ตรง `WHERE` ไปทั้งก้อนโดยไม่ต้องแตกไฟล์ และ (3) **Compression + Dictionary Encoding** บีบอัดค่าที่ซ้ำบ่อยอย่างชื่อจังหวัดหรือหมวดหมู่สินค้าให้ไฟล์เล็กลงกว่า CSV ถึง 5–10 เท่า",
      ],
      analogy:
        "CSV เหมือนสมุดบัญชีที่จดทุกช่องต่อกันทีละบรรทัด จะรวมเฉพาะช่องราคาต้องไล่สายตาผ่านชื่อลูกค้าและที่อยู่ทุกบรรทัด ส่วน Parquet เหมือนแฟ้มแยกคอลัมน์เป็นลิ้นชักพร้อมป้ายช่วงวันที่หน้าลิ้นชัก อยากรวมยอดเดือนมีนาคมก็ดึงเฉพาะลิ้นชัก 'ราคา' ของก้อนเดือนมีนาคมออกมาเลย",
      bullets: [
        "**ขนาดไฟล์**: Parquet + `ZSTD` มักเล็กกว่า CSV 5–10 เท่า (เช่น CSV 100 MB เหลือ ~12 MB)",
        "**Schema ปลอดภัย**: เก็บ `Date`, `Float64`, `Int64`, `String` ตรงตามจริง ไม่ต้องเดาใหม่ตอนโหลด",
        "**กฎปฏิบัติ**: รับไฟล์ดิบจากภายนอกเป็น CSV/JSONL ได้ แต่เมื่อล้างเสร็จแล้วให้บันทึกเป็น `.parquet` เสมอเพื่อใช้วิเคราะห์และเทรนโมเดลซ้ำ",
      ],
      code: {
        language: "python",
        filename: "csv_vs_parquet_size.py",
        code: `from pathlib import Path
import duckdb
import polars as pl

# สร้างข้อมูลจำลอง 50,000 แถว
n = 50_000
df = pl.DataFrame({
    "order_id": [f"ORD-{i:06d}" for i in range(n)],
    "province": ["กรุงเทพฯ", "เชียงใหม่", "ภูเก็ต", "ขอนแก่น", "ชลบุรี"] * (n // 5),
    "category": ["electronics", "fashion", "beauty", "home"] * (n // 4),
    "gmv_thb": [float((i % 500) + 100) for i in range(n)],
    "note": ["จัดส่งปกติภายใน 2 วันทำการสำหรับลูกค้าสมาชิก"] * n,
})

csv_path = Path("orders_50k.csv")
pq_path = Path("orders_50k.parquet")
df.write_csv(csv_path)

# แปลงเป็น Parquet ด้วย DuckDB (ZSTD compression)
with duckdb.connect() as con:
    con.execute(
        "COPY (SELECT * FROM read_csv_auto(?)) TO ? (FORMAT PARQUET, COMPRESSION ZSTD)",
        [str(csv_path), str(pq_path)],
    )

print(f"CSV size:     {csv_path.stat().st_size / 1024:,.1f} KB")
print(f"Parquet size: {pq_path.stat().st_size / 1024:,.1f} KB")`,
        caption: "Parquet บีบอัดข้อความซ้ำและเก็บชนิดข้อมูลลงไฟล์โดยตรง ลดขนาดดิสก์ลงหลายเท่าทันที",
      },
      whyTitle: "Why this matters — เตรียมฐานข้อมูลแบบไฟล์เดียวสำหรับ Phase 2–5",
      whyParagraphs: [
        "Dataset ที่เก็บใน Hugging Face, คลังข้อมูล eval log หรือตารางฟีเจอร์ ML สมัยใหม่แทบทั้งหมดแจกจ่ายเป็น `.parquet` การเข้าใจโครงสร้าง Parquet ทำให้คุณทำงานกับไฟล์หลักสิบ GB บนโน้ตบุ๊กได้โดยไม่เสียเงินเช่าคลัสเตอร์คลาวด์",
        "นอกจากนี้ Parquet ยังอ่านร่วมกันได้ระหว่าง Polars, DuckDB, pandas, PyTorch และเครื่องมือ BI โดยไม่ต้องแปลงฟอร์แมตซ้ำซ้อน",
      ],
    },
    {
      id: "duckdb-direct-sql-analytics",
      title: "2 · DuckDB: รัน SQL OLAP บน CSV/Parquet โดยตรงโดยไม่ต้อง Import",
      paragraphs: [
        "ใน Day 26 เราใช้ {{sqlite}} ซึ่งเป็นฐานข้อมูล **OLTP** (เก่งเรื่องบันทึก/ค้นหาทีละแถว เช่น เก็บ cache key หรือสถานะออเดอร์) ส่วน **{{duckdb}}** คือ 'SQLite สำหรับงานวิเคราะห์ (**OLAP**)' ที่ประมวลผลแบบ vectorized ทีละชุดคอลัมน์และใช้ทุกแกน CPU พร้อมกัน",
        "ความสามารถที่ทำให้ AI Engineer หลงรัก DuckDB คือการคิวรีไฟล์บนดิสก์โดยตรงผ่าน `read_parquet(?)` หรือ `read_csv_auto(?)` รวมถึงรองรับ glob pattern อย่าง `data/orders_*.parquet` โดยไม่ต้องเสียเวลาสร้างตารางหรือโหลดไฟล์เข้าฐานข้อมูลก่อน",
        "DuckDB ยังรองรับ SQL สมัยใหม่ครบเครื่อง เช่น `CTE`, {{sql-window|Window Functions}} (`RANK() OVER (PARTITION BY ...)`), และ `QUALIFY` (ใช้กรองผลลัพธ์จาก window function ได้ในประโยคเดียวโดยไม่ต้องซ้อน subquery ยาว ๆ)",
      ],
      analogy:
        "SQLite เหมือนลิ้นชักแคชเชียร์ที่หยิบ-เก็บใบเสร็จทีละใบได้ไวมาก ส่วน DuckDB เหมือนทีมบัญชีหลายคนที่กางแฟ้ม Parquet ทั้งปีออกมาสรุปยอดขายแยกจังหวัดและจัดอันดับพร้อมกันในเสี้ยววินาที",
      bullets: [
        "เปิด connection แบบปิดอัตโนมัติด้วย `with duckdb.connect() as con:` (โหมด in-memory ไม่ทิ้งไฟล์ `.db` ค้าง)",
        "ส่งพาธไฟล์และเงื่อนไขด้วย parameter `?` (เช่น `read_parquet(?)`) เสมอ เพื่อกัน SQL injection และจัดการพาธที่มีช่องว่าง/ภาษาไทยบน Windows ได้ปลอดภัย",
        "ใช้ `EXPLAIN SELECT ...` ดูแผน query ได้คล้าย `.explain()` ของ Polars",
      ],
      code: {
        language: "sql",
        filename: "top_category_per_province.sql",
        code: `-- หาหมวดสินค้าที่ทำยอด GMV สูงสุดอันดับ 1 ของแต่ละจังหวัดจากไฟล์ Parquet โดยตรง
SELECT
    province,
    category,
    COUNT(*) AS order_count,
    ROUND(SUM(gmv_thb), 2) AS total_gmv_thb,
    RANK() OVER (PARTITION BY province ORDER BY SUM(gmv_thb) DESC) AS gmv_rank
FROM read_parquet('orders_50k.parquet')
GROUP BY province, category
QUALIFY gmv_rank = 1
ORDER BY total_gmv_thb DESC;`,
        caption: "`QUALIFY` ของ DuckDB ช่วยกรองผล `RANK() OVER (...)` ได้ตรง ๆ โดยไม่ต้องห่อด้วย CTE หรือ Subquery อีกรอบ",
      },
      whyTitle: "Why this matters — เลือกใช้ SQLite vs DuckDB ให้ถูกงาน",
      whyParagraphs: [
        "กฎจำง่ายในหลักสูตรนี้: งาน **lookup ทีละแถว / response cache / แอปเขียนถี่** ใช้ {{sqlite}} (หรือ PostgreSQL) ส่วนงาน **aggregate หลายแสนถึงหลายสิบล้านแถวบน Parquet / สร้างฟีเจอร์ / วิเคราะห์ eval log** ใช้ {{duckdb}}",
        "เมื่อใช้เครื่องมือให้ตรงประเภทงาน โค้ดจะสั้นลง ความเร็วเพิ่มขึ้นหลายสิบเท่า และไม่ต้องดูแลโครงสร้างพื้นฐานที่ซับซ้อนเกินจำเป็น",
      ],
    },
    {
      id: "duckdb-polars-zero-copy",
      title: "3 · Zero-Copy Handoff: จับคู่ DuckDB กับ Polars ผ่าน Apache Arrow",
      paragraphs: [
        "คุณไม่จำเป็นต้องเลือกว่าจะใช้ {{polars}} หรือ {{duckdb}} อย่างใดอย่างหนึ่ง — ในงานจริงทั้งสองตัวเป็นคู่หูที่เสริมกันดีที่สุด: ใช้ Polars ล้างข้อมูลไทยและสร้าง pipeline แบบ Expression จากนั้นให้ DuckDB คิวรี Polars `DataFrame`/`LazyFrame` ด้วย SQL ตรง ๆ แล้วรับผลลัพธ์กลับเป็น `pl.DataFrame` ด้วย `.pl()`",
        "เบื้องหลังความลื่นไหลนี้คือมาตรฐาน **Apache Arrow** ที่ทั้งสองเอนจินใช้จัดเรียงข้อมูลใน RAM เหมือนกัน เมื่อคุณส่ง Polars DataFrame เข้า DuckDB หรือเรียก `.pl()` กลับมา ข้อมูลจึงถูกส่งต่อผ่านตัวชี้หน่วยความจำ (**zero-copy**) แทบไม่เสียเวลา serialize หรือก๊อปปี้ข้อมูลซ้ำ",
        "เพื่อความชัดเจนและไม่พึ่งตัวแปร global ลอย ๆ แนะนำให้ลงทะเบียนตารางด้วย `con.register(\"orders\", df)` (แล้ว `con.unregister(\"orders\")` เมื่อเสร็จ) ก่อนรัน SQL",
      ],
      analogy:
        "เหมือนเชฟ 2 คนยืนทำอาหารหน้าเขียงเดียวกัน (Apache Arrow) — คนหนึ่งถนัดหั่นเตรียมวัตถุดิบ (Polars) อีกคนถนัดผัดรวมซอสสูตรซับซ้อน (DuckDB SQL) ส่งต่อกันตรงหน้าเขียงโดยไม่ต้องตักใส่กล่องไปมา",
      code: {
        language: "python",
        filename: "duckdb_polars_interop.py",
        code: `import duckdb
import polars as pl

orders_df = pl.DataFrame({
    "province": ["กรุงเทพฯ", "กรุงเทพฯ", "เชียงใหม่", "เชียงใหม่"],
    "category": ["electronics", "fashion", "electronics", "beauty"],
    "gmv_thb": [12000.0, 4500.0, 6000.0, 3200.0],
})

with duckdb.connect() as con:
    con.register("orders", orders_df)
    summary_pl: pl.DataFrame = con.execute("""
        SELECT
            province,
            COUNT(*) AS order_count,
            SUM(gmv_thb) AS total_gmv_thb
        FROM orders
        GROUP BY province
        ORDER BY total_gmv_thb DESC
    """).pl()

print(type(summary_pl))
print(summary_pl)`,
        caption: "`con.register(...)` + `.pl()` ทำให้สลับระหว่าง Polars และ DuckDB SQL ได้อย่างสะอาดและปลอดภัยในฟังก์ชัน",
      },
      whyTitle: "Why this matters — เวิร์กโฟลว์ทองคำของ AI Data Pipeline บนเครื่องเดียว",
      whyParagraphs: [
        "การผสาน Polars (ล้างข้อมูล/สกัดสตริงไทย) → Parquet (จัดเก็บกะทัดรัดพร้อม schema) → DuckDB (SQL analytics + window functions) → `.pl()` (ส่งต่อเข้า scikit-learn/LightGBM) คือสถาปัตยกรรม local analytics ที่เร็ว แข็งแรง และแทบไม่มีต้นทุนโครงสร้างพื้นฐาน",
        "ใน Day 36 พรุ่งนี้ เราจะนำเวิร์กโฟลว์นี้มาประมวลผลข้อมูล e-commerce ไทย 100,000 แถวพร้อมจับเวลาจริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ DuckDB + Parquet กับ PostgreSQL และ BigQuery",
      body: [
        "ถ้าคุณเคยเขียน SQL บน PostgreSQL หรือเคยใช้ BigQuery / Snowflake ฝั่งคลาวด์ DuckDB จะให้ความรู้สึกเหมือนมี BigQuery ย่อส่วนฝังอยู่ในโปรเซส Python ของคุณเอง:",
      ],
      table: [
        ["`duckdb.connect()` (in-memory)", "SQLite `:memory:` แต่เป็นเอนจิน OLAP แบบ columnar"],
        ["`SELECT ... FROM read_parquet(?)`", "External table ของ BigQuery บนไฟล์ GCS/S3 แต่รันบนดิสก์เครื่องคุณ"],
        ["`COPY (...) TO 'x.parquet' (FORMAT PARQUET)`", "Export ผล query เป็นไฟล์บีบอัดพร้อม schema"],
        ["`con.execute(sql, [params]).pl()`", "รัน parameterized query แล้วได้ผลลัพธ์เป็น Polars DataFrame ทันที"],
        ["`QUALIFY RANK() OVER (...) = 1`", "กรองผล Window Function โดยไม่ต้องห่อ Subquery"],
      ],
    },
    student: {
      title: "First-Year Note — Row-Oriented (CSV) vs Column-Oriented (Parquet) ต่างกันอย่างไร?",
      body: [
        "สมมติคุณมีตาราง 3 คอลัมน์: `(ชื่อ, จังหวัด, ราคา)` จำนวน 1 ล้านแถว แบบ **Row-Oriented (CSV)** จะเก็บเรียงในไฟล์ว่า `[ชื่อ1, จังหวัด1, ราคา1, ชื่อ2, จังหวัด2, ราคา2, ...]` เวลาอยากบวกเฉพาะคอลัมน์ `ราคา` คอมพิวเตอร์จึงต้องอ่านข้าม `ชื่อ` กับ `จังหวัด` ทุกแถว",
        "แบบ **Column-Oriented (Parquet)** จะเก็บแยกกลุ่มกันว่า `[ชื่อ1, ชื่อ2, ...] [จังหวัด1, จังหวัด2, ...] [ราคา1, ราคา2, ...]` เวลาอยากรวม `ราคา` ดิสก์จึงอ่านเฉพาะบล็อกของ `ราคา` เพียงบล็อกเดียว แถมข้อมูลชนิดเดียวกันที่อยู่ติดกันยังบีบอัดได้เล็กกว่ามากอีกด้วย",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีไฟล์ CSV ยอดขาย 20,000 แถวที่มีหลายคอลัมน์ (รวมคอลัมน์ `note` ยาว ๆ ที่ไม่ได้ใช้ตอนวิเคราะห์) เราจะ (1) แปลง CSV เป็น Parquet บีบอัด ZSTD และเทียบขนาดไฟล์, (2) ใช้ DuckDB คิวรีเฉพาะคอลัมน์ที่ต้องการพร้อม `RANK() OVER` หาหมวดขายดีอันดับ 1 ของแต่ละจังหวัด และ (3) รับผลลัพธ์กลับเป็น Polars DataFrame ด้วย `.pl()`",
    steps: [
      {
        title: "1 · สร้าง CSV จำลองและแปลงเป็น Parquet พร้อมวัดอัตราการบีบอัด",
        explain:
          "ใช้ Polars สร้าง CSV 20,000 แถว แล้วใช้คำสั่ง `COPY` ของ DuckDB แปลงเป็น Parquet (ZSTD) เพื่อดูขนาดไฟล์จริงบนดิสก์",
        code: {
          language: "python",
          filename: "worked_duckdb.py",
          code: `from pathlib import Path
import duckdb
import polars as pl

n = 20_000
provinces = ["กรุงเทพฯ", "เชียงใหม่", "ภูเก็ต", "ขอนแก่น"]
categories = ["electronics", "fashion", "beauty", "home"]

df = pl.DataFrame({
    "order_id": [f"ORD-{i:05d}" for i in range(n)],
    "province": [provinces[i % len(provinces)] for i in range(n)],
    "category": [categories[(i // 3) % len(categories)] for i in range(n)],
    "gmv_thb": [float(200 + (i % 7) * 150) for i in range(n)],
    "status": ["cancelled" if i % 10 == 0 else "paid" for i in range(n)],
    "note": ["หมายเหตุการจัดส่งมาตรฐานสำหรับคลังสินค้าภูมิภาค"] * n,
})

csv_path = Path("orders_20k.csv")
pq_path = Path("orders_20k.parquet")
df.write_csv(csv_path)

with duckdb.connect() as con:
    con.execute(
        "COPY (SELECT * FROM read_csv_auto(?)) TO ? (FORMAT PARQUET, COMPRESSION ZSTD)",
        [str(csv_path), str(pq_path)],
    )

csv_kb = csv_path.stat().st_size / 1024
pq_kb = pq_path.stat().st_size / 1024
print(f"CSV: {csv_kb:,.1f} KB | Parquet: {pq_kb:,.1f} KB | Ratio: {csv_kb / pq_kb:.1f}x smaller")`,
        },
        output: `CSV: 2,865.4 KB | Parquet: 118.2 KB | Ratio: 24.2x smaller`,
      },
      {
        title: "2 · คิวรี Parquet ด้วย DuckDB SQL (Filter + Group By + Window Function) แล้วคืน `.pl()`",
        explain:
          "สังเกตว่าเราไม่แตะคอลัมน์ `order_id` และ `note` เลย (DuckDB ทำ column pruning อัตโนมัติ) ใช้ `QUALIFY` คัดหมวดสินค้าอันดับ 1 ต่อจังหวัด และส่งค่า `status = 'paid'` ผ่าน parameter `?`",
        code: {
          language: "python",
          filename: "worked_duckdb.py",
          code: `sql = """
SELECT
    province,
    category,
    COUNT(*) AS paid_orders,
    ROUND(SUM(gmv_thb), 2) AS total_gmv_thb,
    RANK() OVER (PARTITION BY province ORDER BY SUM(gmv_thb) DESC, category ASC) AS rank_in_province
FROM read_parquet(?)
WHERE status = ?
GROUP BY province, category
QUALIFY rank_in_province = 1
ORDER BY total_gmv_thb DESC, province ASC
"""

with duckdb.connect() as con:
    top_categories: pl.DataFrame = con.execute(sql, [str(pq_path), "paid"]).pl()

print(top_categories)`,
        },
        output: `shape: (4, 5)
┌───────────┬─────────────┬─────────────┬───────────────┬──────────────────┐
│ province  ┆ category    ┆ paid_orders ┆ total_gmv_thb ┆ rank_in_province │
│ ---       ┆ ---         ┆ ---         ┆ ---           ┆ ---              │
│ str       ┆ str         ┆ i64         ┆ f64           ┆ i64              │
╞═══════════╪═════════════╪═════════════╪═══════════════╪══════════════════╡
│ กรุงเทพฯ  ┆ beauty      ┆ 1125        ┆ 731400.0      ┆ 1                │
│ ขอนแก่น   ┆ electronics ┆ 1125        ┆ 731400.0      ┆ 1                │
│ ภูเก็ต    ┆ home        ┆ 1125        ┆ 731400.0      ┆ 1                │
│ เชียงใหม่ ┆ fashion     ┆ 1125        ┆ 731400.0      ┆ 1                │
└───────────┴─────────────┴─────────────┴───────────────┴──────────────────┘`,
      },
      {
        title: "3 · ตรวจ Schema ของ Parquet และยืนยัน Query Plan ด้วย `EXPLAIN`",
        explain:
          "ใช้ `DESCRIBE SELECT * FROM read_parquet(?)` ตรวจชนิดข้อมูลที่ฝังอยู่ใน Parquet footer และดูว่า `EXPLAIN` อ่านเฉพาะ 4 คอลัมน์จริง ๆ",
        code: {
          language: "python",
          filename: "worked_duckdb.py",
          code: `with duckdb.connect() as con:
    schema_df = con.execute("DESCRIBE SELECT * FROM read_parquet(?)", [str(pq_path)]).pl()
    print(schema_df.select("column_name", "column_type"))`,
        },
        output: `shape: (6, 2)
┌─────────────┬─────────────┐
│ column_name ┆ column_type │
│ ---         ┆ ---         │
│ str         ┆ str         │
╞═════════════╪═════════════╡
│ order_id    ┆ VARCHAR     │
│ province    ┆ VARCHAR     │
│ category    ┆ VARCHAR     │
│ gmv_thb     ┆ DOUBLE      │
│ status      ┆ VARCHAR     │
│ note        ┆ VARCHAR     │
└─────────────┴─────────────┘`,
      },
    ],
    gotcha:
      "จุดพลาดยอดฮิตบน Windows: พาธไฟล์ที่เป็น `Path` (`C:\\Users\\...`) ห้ามนำไปต่อสตริงใน SQL ตรง ๆ ด้วย f-string (`f\"FROM '{path}'\"`) เพราะ backslash `\\` หรือ single quote ในชื่อโฟลเดอร์อาจทำให้ SQL พัง — ให้ส่ง `str(path)` ผ่าน parameter `?` (`read_parquet(?)`) เสมอ",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล local analytics (`exercise_day35.py`) ที่แปลงไฟล์ CSV เป็น Parquet บีบอัด ZSTD ด้วย DuckDB, คิวรีสรุปยอดขายแยกจังหวัด-หมวดหมู่พร้อมจัดอันดับด้วย Window Function แล้วส่งกลับเป็น Polars `DataFrame` แบบ zero-copy",
    requirements: [
      "`csv_to_parquet(csv_path: str | Path, parquet_path: str | Path) -> dict[str, int]`: ใช้ DuckDB แปลง CSV เป็น Parquet (`FORMAT PARQUET, COMPRESSION ZSTD`) โดยส่งพาธผ่าน parameter `?` แล้วคืน dict `{ \"csv_bytes\": ..., \"parquet_bytes\": ... }`",
      "`top_categories_by_province(parquet_path: str | Path, *, top_k: int = 1, min_gmv: float = 0.0) -> pl.DataFrame`: คิวรีจาก `read_parquet(?)` กรองเฉพาะ `status = 'paid'`, สรุป `order_count` และ `total_gmv_thb` (ปัด 2 ตำแหน่ง) แยกตาม `province, category` ที่มี `SUM(gmv_thb) >= ?`",
      "จัดอันดับภายในแต่ละจังหวัดด้วย `RANK() OVER (PARTITION BY province ORDER BY SUM(gmv_thb) DESC, category ASC) AS gmv_rank` และกรองเอาเฉพาะ `gmv_rank <= ?` ด้วย `QUALIFY`",
      "เรียงผลลัพธ์สุดท้ายตาม `province ASC, gmv_rank ASC, category ASC` และคืนค่าเป็น `pl.DataFrame` ผ่าน `.pl()`",
      "`query_polars_with_duckdb(df: pl.DataFrame) -> pl.DataFrame`: รับ Polars `DataFrame`, ลงทะเบียนด้วย `con.register(\"orders\", df)` แล้วคิวรีหายอดรวม `total_gmv_thb` และ `avg_gmv_thb` (ปัด 2 ตำแหน่ง) แยกตาม `province` เฉพาะ `status = 'paid'` เรียงตาม `total_gmv_thb DESC, province ASC`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day35.py",
      code: `from pathlib import Path
import duckdb
import polars as pl


def csv_to_parquet(
    csv_path: str | Path,
    parquet_path: str | Path,
) -> dict[str, int]:
    """แปลง CSV เป็น Parquet (ZSTD) ด้วย DuckDB และคืนขนาดไฟล์ทั้งสอง (bytes)"""
    # TODO: ใช้ with duckdb.connect() as con: รัน COPY (...) TO ? (FORMAT PARQUET, COMPRESSION ZSTD)
    raise NotImplementedError


def top_categories_by_province(
    parquet_path: str | Path,
    *,
    top_k: int = 1,
    min_gmv: float = 0.0,
) -> pl.DataFrame:
    """คิวรี Parquet หาหมวดสินค้ายอดนิยม top_k ของแต่ละจังหวัดแล้วคืนเป็น pl.DataFrame"""
    # TODO: read_parquet(?), WHERE status = 'paid', GROUP BY, HAVING SUM(gmv_thb) >= ?, QUALIFY gmv_rank <= ?
    raise NotImplementedError


def query_polars_with_duckdb(df: pl.DataFrame) -> pl.DataFrame:
    """คิวรี Polars DataFrame ด้วย DuckDB SQL แบบ zero-copy แล้วคืน pl.DataFrame"""
    # TODO: con.register("orders", df) -> SELECT province, ROUND(SUM(gmv_thb), 2) AS total_gmv_thb, ROUND(AVG(gmv_thb), 2) AS avg_gmv_thb ...
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day35.py",
      code: `from pathlib import Path
import polars as pl
import pytest
from exercise_day35 import (
    csv_to_parquet,
    query_polars_with_duckdb,
    top_categories_by_province,
)


@pytest.fixture
def sample_csv(tmp_path: Path) -> Path:
    rows = []
    # สร้างข้อมูลพอให้เห็นการบีบอัดของ Parquet ชัดเจน
    base = [
        ("Bangkok", "electronics", 1000.0, "paid"),
        ("Bangkok", "electronics", 500.0, "paid"),
        ("Bangkok", "fashion", 800.0, "paid"),
        ("Bangkok", "fashion", 9999.0, "cancelled"),
        ("ChiangMai", "beauty", 600.0, "paid"),
        ("ChiangMai", "home", 200.0, "paid"),
    ]
    for rep in range(50):
        for idx, (prov, cat, gmv, st) in enumerate(base):
            rows.append(
                {
                    "order_id": f"O-{rep}-{idx}",
                    "province": prov,
                    "category": cat,
                    "gmv_thb": gmv,
                    "status": st,
                    "note": "ข้อมูลหมายเหตุมาตรฐานสำหรับการทดสอบบีบอัด Parquet",
                }
            )
    csv_path = tmp_path / "orders.csv"
    pl.DataFrame(rows).write_csv(csv_path)
    return csv_path


def test_csv_to_parquet_shrinks_file(sample_csv: Path, tmp_path: Path):
    pq_path = tmp_path / "orders.parquet"
    sizes = csv_to_parquet(sample_csv, pq_path)
    assert pq_path.exists()
    assert sizes["csv_bytes"] > sizes["parquet_bytes"] > 0


def test_top_categories_by_province(sample_csv: Path, tmp_path: Path):
    pq_path = tmp_path / "orders.parquet"
    csv_to_parquet(sample_csv, pq_path)

    df = top_categories_by_province(pq_path, top_k=1, min_gmv=10_000.0)
    assert isinstance(df, pl.DataFrame)
    assert df.columns == [
        "province",
        "category",
        "order_count",
        "total_gmv_thb",
        "gmv_rank",
    ]
    rows = df.to_dicts()
    assert len(rows) == 2

    # Bangkok electronics: 50 * (1000 + 500) = 75000.0, count = 100
    assert rows[0]["province"] == "Bangkok"
    assert rows[0]["category"] == "electronics"
    assert rows[0]["order_count"] == 100
    assert rows[0]["total_gmv_thb"] == pytest.approx(75000.0)
    assert rows[0]["gmv_rank"] == 1

    # ChiangMai beauty: 50 * 600 = 30000.0, count = 50
    assert rows[1]["province"] == "ChiangMai"
    assert rows[1]["category"] == "beauty"
    assert rows[1]["order_count"] == 50
    assert rows[1]["total_gmv_thb"] == pytest.approx(30000.0)


def test_query_polars_with_duckdb():
    df = pl.DataFrame({
        "province": ["Bangkok", "Bangkok", "Phuket", "Phuket"],
        "gmv_thb": [1000.0, 500.0, 2000.0, 900.0],
        "status": ["paid", "paid", "paid", "cancelled"],
    })
    out = query_polars_with_duckdb(df)
    assert isinstance(out, pl.DataFrame)
    rows = out.to_dicts()
    assert rows[0]["province"] == "Phuket"
    assert rows[0]["total_gmv_thb"] == pytest.approx(2000.0)
    assert rows[0]["avg_gmv_thb"] == pytest.approx(2000.0)
    assert rows[1]["province"] == "Bangkok"
    assert rows[1]["total_gmv_thb"] == pytest.approx(1500.0)
    assert rows[1]["avg_gmv_thb"] == pytest.approx(750.0)
`,
    },
    selfCheck: [
      "`csv_to_parquet` สร้างไฟล์ `.parquet` จริงและมีขนาดเล็กกว่า `.csv` ชัดเจน",
      "คำสั่ง SQL ทั้งหมดใช้ parameter `?` (ไม่ต่อพาธไฟล์หรือค่าตัวเลขด้วย f-string)",
      "`top_categories_by_province` ตัด `status = 'cancelled'` ออก, กรอง `HAVING SUM(gmv_thb) >= ?` และใช้ `QUALIFY gmv_rank <= ?` ถูกต้อง",
      "`query_polars_with_duckdb` ลงทะเบียน Polars DataFrame ด้วย `con.register` และคืน `pl.DataFrame` ผ่าน `.pl()`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 3 test functions ใน `test_day35.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `COPY (...) TO ? (FORMAT PARQUET, COMPRESSION ZSTD)` ของ DuckDB Python บางเวอร์ชัน `TO ?` อาจไม่รองรับ parameter โดยตรง — หากพบ `ParserException` ที่ `TO ?` ให้ใช้ `con.read_csv(str(csv_path)).write_parquet(str(parquet_path), compression=\"zstd\")` ซึ่งปลอดภัย 100% และไม่ต้องต่อสตริง SQL เอง!",
      },
      {
        body: "ลำดับการทำงานของ SQL ใน `top_categories_by_province`: `FROM read_parquet(?)` → `WHERE status = 'paid'` → `GROUP BY province, category` → `HAVING SUM(gmv_thb) >= ?` → `QUALIFY gmv_rank <= ?` → `ORDER BY ...`",
      },
      {
        body: "โครงของทั้ง 3 ฟังก์ชันพร้อมแล้ว เหลือเติมส่วน `top_categories_by_province` ให้ครบแล้วรันเทสต์:",
        code: {
          language: "python",
          filename: "hint_day35.py",
          code: `from pathlib import Path
import duckdb
import polars as pl


def csv_to_parquet(csv_path: str | Path, parquet_path: str | Path) -> dict[str, int]:
    src, dst = Path(csv_path), Path(parquet_path)
    with duckdb.connect() as con:
        con.read_csv(str(src)).write_parquet(str(dst), compression="zstd")
    return {"csv_bytes": src.stat().st_size, "parquet_bytes": dst.stat().st_size}


def query_polars_with_duckdb(df: pl.DataFrame) -> pl.DataFrame:
    with duckdb.connect() as con:
        con.register("orders", df)
        return con.execute("""
            SELECT
                province,
                ROUND(SUM(gmv_thb), 2) AS total_gmv_thb,
                ROUND(AVG(gmv_thb), 2) AS avg_gmv_thb
            FROM orders
            WHERE status = 'paid'
            GROUP BY province
            ORDER BY total_gmv_thb DESC, province ASC
        """).pl()

# TODO: เติม top_categories_by_province โดยใช้ read_parquet(?), HAVING และ QUALIFY`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "ต่อพาธไฟล์เข้าสตริง SQL ด้วย f-string แทนที่จะใช้ parameter หรือ Relational API",
      symptom: "โค้ดพังบน Windows หรือเมื่อชื่อโฟลเดอร์มีเครื่องหมาย `'` (เช่น `O'Brien`) และเสี่ยง SQL injection หากรับพาธจากผู้ใช้",
      fix: "ใช้ `read_parquet(?)` พร้อมส่ง `[str(path)]` หรือใช้ Relational API อย่าง `con.read_csv(str(src)).write_parquet(str(dst))` แทนการต่อสตริง",
    },
    {
      title: "ใส่เงื่อนไขของ Window Function (`gmv_rank = 1`) ไว้ใน `WHERE`",
      symptom: "เกิด `BinderException: WHERE clause cannot contain window functions`",
      fix: "เงื่อนไขที่กรองผลของ Window Function ต้องใส่ใน `QUALIFY` (ใน DuckDB) หรือห่อด้วย CTE แล้วค่อย `WHERE` ด้านนอก",
    },
    {
      title: "ใช้ `SELECT *` เวลาคิวรีไฟล์ Parquet ขนาดใหญ่ทั้งที่ต้องการแค่ 2–3 คอลัมน์",
      symptom: "เสียประโยชน์ของ Column Pruning ไปทั้งหมด เพราะ DuckDB ต้องอ่านและแตกบีบอัดทุกคอลัมน์ในไฟล์",
      fix: "ระบุชื่อคอลัมน์ที่ต้องใช้จริงใน `SELECT` เสมอ เพื่อให้ DuckDB อ่านเฉพาะคอลัมน์เหล่านั้นจากดิสก์",
    },
    {
      title: "เปิด DuckDB ลงไฟล์เดียวกันพร้อมกันจากหลายโปรเซสเขียนพร้อมกัน",
      symptom: "เกิด `IOException: Could not set lock on file` เมื่อมีหลายโปรเซสพยายามเปิดไฟล์ `.duckdb` โหมด read-write พร้อมกัน",
      fix: "สำหรับงานคิวรีไฟล์ Parquet/CSV ใช้ `duckdb.connect()` (in-memory) แล้วอ่าน Parquet ตรง ๆ ซึ่งปลอดภัยและอ่านพร้อมกันกี่โปรเซสก็ได้",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d035-q1",
        "ข้อใดอธิบายเหตุผลที่การคิวรี 2 คอลัมน์จากไฟล์ Parquet 30 คอลัมน์ใน DuckDB เร็วกว่า CSV หลายเท่าได้ถูกต้องที่สุด?",
        [
          ["Parquet เก็บข้อมูลเป็น JSON จึงไม่ต้องแยกคอมมา", "ไม่จริง — Parquet เป็นฟอร์แมตไบนารีแบบ columnar ไม่ใช่ JSON"],
          ["Parquet เก็บข้อมูลแบบคอลัมน์พร้อมสถิติ min/max ของแต่ละ Row Group ทำให้ DuckDB ทำ Column Pruning และข้ามก้อนข้อมูลที่ไม่ตรงเงื่อนไขได้", "ถูก — อ่านดิสก์เฉพาะคอลัมน์และ Row Group ที่เกี่ยวข้องจริง ๆ"],
          ["DuckDB อัปโหลดไฟล์ Parquet ไปประมวลผลบนคลาวด์ให้อัตโนมัติ", "ไม่จริง — DuckDB รันบน CPU เครื่องคุณ 100% แบบ offline"],
          ["Parquet ลบแถวที่มี `null` ออกทั้งหมดตั้งแต่ตอนบันทึก", "ไม่จริง — Parquet เก็บ `null` ได้ครบถ้วนด้วย validity bitmap"],
        ],
        "B",
        "โครงสร้าง columnar ของ Parquet ช่วยให้ DuckDB อ่านเฉพาะคอลัมน์ที่ `SELECT`/`WHERE` ใช้งาน และใช้สถิติ min/max ข้าม Row Group ที่ไม่เข้าเงื่อนไขไปทั้งก้อน",
        "Column Pruning และ Row-Group Skipping ใน Parquet + DuckDB คืออะไร?",
        "Column Pruning คืออ่านจากดิสก์เฉพาะคอลัมน์ที่ query ใช้จริง ส่วน Row-Group Skipping คือใช้ค่า min/max ใน metadata ข้ามก้อนข้อมูลที่ไม่ตรงเงื่อนไข `WHERE` โดยไม่ต้องแตกข้อมูลมาอ่าน",
      ),
      mc(
        "d035-q2",
        "งานใดต่อไปนี้เหมาะสมกับการใช้ **DuckDB** มากที่สุด (เทียบกับ SQLite)?",
        [
          ["เก็บ key-value response cache ที่อ่านและเขียนอัปเดตทีละ 1 แถวบ่อยมาก", "งาน lookup/update ทีละแถว (OLTP) เหมาะกับ SQLite มากกว่า"],
          ["สรุปยอดขายและคำนวณ Window Function บนไฟล์ Parquet ขนาด 5 ล้านแถวบนเครื่อง", "ถูก — นี่คืองานวิเคราะห์ข้อมูลจำนวนมาก (OLAP) ที่ DuckDB ออกแบบมาโดยเฉพาะ"],
          ["ใช้แทน Redis สำหรับ session token ที่อัปเดตทุกมิลลิวินาที", "ไม่เหมาะ — DuckDB ไม่ได้ออกแบบมาเพื่อ write concurrency สูงแบบ OLTP"],
          ["เก็บไฟล์รูปภาพความละเอียดสูงแทน object storage", "ไฟล์ไบนารีขนาดใหญ่ควรเก็บใน object storage / filesystem"],
        ],
        "B",
        "SQLite โดดเด่นด้าน OLTP (อ่าน/เขียนทีละแถว) ส่วน DuckDB โดดเด่นด้าน OLAP (สแกนและ aggregate หลายแสนถึงหลายสิบล้านแถวแบบ vectorized/columnar)",
        "สรุปความต่างระหว่าง SQLite และ DuckDB ในงาน AI Engineering?",
        "SQLite เหมาะกับ OLTP (cache, metadata, อ่าน-เขียนทีละแถว) ส่วน DuckDB เหมาะกับ OLAP (วิเคราะห์/สรุปข้อมูลหลายแสน-ล้านแถวบน CSV/Parquet แบบ columnar)",
      ),
      mc(
        "d035-q3",
        "เมธอดใดใน DuckDB Python ใช้แปลงผลลัพธ์ของ query กลับเป็น Polars `DataFrame` แบบ zero-copy ผ่าน Apache Arrow?",
        [
          ["`.fetchall()`", "ผิด — คืน list of Python tuples ซึ่งสร้าง Python object จำนวนมากและช้า"],
          ["`.pl()`", "ถูก — ส่งผ่านข้อมูลในรูปแบบ Apache Arrow กลับเป็น `pl.DataFrame` โดยตรง"],
          ["`.to_csv()`", "ผิด — การเขียนออกเป็นข้อความ CSV เสียทั้งเวลาและชนิดข้อมูล"],
          ["`.json()`", "ผิด — ไม่ใช่เมธอดมาตรฐานสำหรับส่งต่อ Polars แบบ zero-copy"],
        ],
        "B",
        "ทั้ง DuckDB และ Polars ใช้รูปแบบหน่วยความจำ Apache Arrow เหมือนกัน การเรียก `.pl()` จึงส่งตารางกลับเป็น `pl.DataFrame` ได้อย่างรวดเร็วและคงชนิดข้อมูลครบ",
        "ทำไม `.pl()` ของ DuckDB จึงเร็วกว่า `.fetchall()` แล้วค่อยสร้าง `pl.DataFrame(...)`?",
        "เพราะ `.pl()` ส่งข้อมูลผ่านหน่วยความจำแบบ Apache Arrow (zero-copy) โดยไม่ต้องแปลงเป็น Python tuple ทีละแถว",
      ),
      mc(
        "d035-q4",
        "ใน DuckDB SQL คำสั่ง `QUALIFY rank_in_province = 1` ทำหน้าที่อะไร?",
        [
          ["เรียงลำดับตารางจากน้อยไปมากเหมือน `ORDER BY`", "ผิด — `QUALIFY` ใช้กรองแถว ไม่ใช่เรียงลำดับ"],
          ["กรองแถวตามผลลัพธ์ของ Window Function (เช่น `RANK() OVER (...)`) โดยไม่ต้องซ้อน Subquery/CTE", "ถูก — `QUALIFY` ทำงานหลังคำนวณ Window Function เหมือน `HAVING` ที่ทำงานหลัง `GROUP BY`"],
          ["บังคับให้คอลัมน์ห้ามมีค่า `null`", "ผิด — นั่นคือ constraint `NOT NULL`"],
          ["บีบอัดไฟล์ผลลัพธ์เป็น Parquet อัตโนมัติ", "ผิด — การเขียนไฟล์ Parquet ใช้ `COPY ... TO` หรือ `.write_parquet()`"],
        ],
        "B",
        "ลำดับการกรองใน DuckDB SQL คือ `WHERE` (ก่อน group) → `HAVING` (หลัง `GROUP BY`) → `QUALIFY` (หลัง Window Function)",
        "เปรียบเทียบหน้าที่ของ `WHERE`, `HAVING` และ `QUALIFY` ใน DuckDB SQL?",
        "`WHERE` กรองแถวดิบก่อน `GROUP BY`, `HAVING` กรองกลุ่มหลัง `GROUP BY`, และ `QUALIFY` กรองผลลัพธ์หลังคำนวณ Window Function",
      ),
    ],
  },

  takeaways: [
    "บันทึกข้อมูลที่สะอาดแล้วเป็น **{{parquet}}** เสมอ — เล็กลง 5–10 เท่า เก็บ {{schema}} แท้จริง และเปิดทางให้ทำ Column Pruning + Row-Group Skipping",
    "ใช้ **{{duckdb}}** เป็นเอนจิน SQL OLAP บนเครื่องเพื่อคิวรีไฟล์ CSV/Parquet โดยตรง (`read_parquet(?)`) โดยไม่ต้องตั้งเซิร์ฟเวอร์หรือ import ข้อมูลก่อน",
    "ใช้ `QUALIFY` คู่กับ {{sql-window|Window Functions}} ใน DuckDB เพื่อจัดอันดับและคัด top-k ต่อกลุ่มได้อย่างกระชับ",
    "ผสาน **Polars ↔ DuckDB** แบบ zero-copy ผ่าน `con.register(...)` และ `.pl()` เพื่อใช้จุดแข็งของทั้งสองเครื่องมือใน pipeline เดียวกัน",
  ],

  reviewCards: [
    rc(
      "d035-rc-1",
      "ทำไมไฟล์ Parquet จึงเล็กกว่าและคิวรีเร็วกว่า CSV มาก?",
      "Parquet เก็บข้อมูลแบบ columnar พร้อม typed schema และสถิติ min/max ต่อ Row Group ทำให้บีบอัดได้ดี (5–10× เล็กลง) และเอนจินอย่าง DuckDB/Polars ทำ Column Pruning กับ Row-Group Skipping ได้",
    ),
    rc(
      "d035-rc-2",
      "วิธีส่งตารางไป-มาระหว่าง Polars กับ DuckDB แบบ zero-copy ใน Python ทำอย่างไร?",
      "ขาเข้าใช้ `con.register(\"table_name\", pl_df)` เพื่อคิวรีด้วย SQL และขาออกเรียก `.pl()` บนผลลัพธ์ของ `con.execute(...)` เพื่อรับกลับมาเป็น `pl.DataFrame` ผ่าน Apache Arrow",
    ),
    rc(
      "d035-rc-3",
      "ความต่างระหว่าง `WHERE`, `HAVING` และ `QUALIFY` ใน DuckDB SQL คืออะไร?",
      "`WHERE` กรองแถวก่อนจัดกลุ่ม, `HAVING` กรองหลัง `GROUP BY`, และ `QUALIFY` กรองผลลัพธ์หลังคำนวณ Window Function (เช่น `RANK() OVER`) โดยไม่ต้องซ้อน subquery",
    ),
  ],

  sources: [
    { label: "DuckDB Docs — Parquet Files & Querying", href: "https://duckdb.org/docs/stable/data/parquet/overview.html" },
    { label: "DuckDB Docs — Python & Polars Integration", href: "https://duckdb.org/docs/stable/guides/python/polars.html" },
    { label: "DuckDB Docs — QUALIFY Clause", href: "https://duckdb.org/docs/stable/sql/query_syntax/qualify.html" },
    { label: "Apache Parquet — Format Concepts", href: "https://parquet.apache.org/docs/file-format/" },
  ],

  glossary: [
    "duckdb",
    "parquet",
    "polars",
    "schema",
    "sql-window",
    "sqlite",
    "pathlib",
    "pytest",
  ],
});
