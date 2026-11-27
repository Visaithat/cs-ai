import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D036 — Phase 2 / Block B09 (Review Day)
 * Review: Quiz + Clean & aggregate 100k Thai e-commerce rows
 */
export const d036: Lesson = defineLesson({
  day: 36,
  titleTh: "ทบทวน B09: ล้างข้อมูล E-Commerce ไทย 100,000 แถวและวิเคราะห์ด้วย Polars + DuckDB",
  tagline: "30 นาที · รอบทบทวน D33–D35 + D25/D5 · รันบน CPU เครื่องคุณ 100% ไม่ต้องใช้ API key · ปิดท่อ Polars Lazy → Parquet → DuckDB SQL พร้อมจับเวลา 100k แถว",
  icon: "table",
  visual: {
    id: "dirty-data-clean",
    title: "ทบทวน B09: ล้างข้อมูล E-Commerce ไทย 100k แถว + สรุปด้วย DuckDB",
    caption: "ร้อยท่อ Polars Lazy cleaning → เขียน Parquet → วิเคราะห์ SQL ด้วย DuckDB ในไม่กี่ร้อยมิลลิวินาที",
    alt: "แผนภาพทบทวนท่อทำความสะอาดและวิเคราะห์ข้อมูล 100k แถว",
  },
  requiresApiKey: false,
  tools: ["Polars", "DuckDB", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ร้อยต่อท่อ Ingestion → Clean → Parquet บนข้อมูล 100,000 แถว",
      body: "ในโลกจริงข้อมูลไม่เคยมาแยกเป็นแบบฝึกหัดทีละเรื่อง — ไฟล์ CSV เดียวขนาดแสนแถวจะรวมทั้งอักขระ UTF-8 แฝง, sentinel nulls, วันที่ พ.ศ. และแถวซ้ำไว้พร้อมกัน",
      lessonNote: "รวม D5 ({{pathlib}}), D33 ({{polars}} Lazy) และ D34 (Thai Data Cleaning) เป็น pipeline เดียวที่เขียนผลสะอาดลง {{parquet}}",
    },
    {
      node: 2,
      heading: "วิเคราะห์ GMV รายจังหวัด-หมวดหมู่ด้วย DuckDB SQL + Window Function",
      body: "เมื่อได้ไฟล์ {{parquet}} ที่สะอาดและมี {{schema}} แม่นยำแล้ว เราใช้ {{duckdb}} คิวรีสรุปยอดขายและจัดอันดับหมวดสินค้าขายดีต่อจังหวัดด้วยความเร็วระดับมิลลิวินาที",
      lessonNote: "ดึงความรู้จาก D35 (`read_parquet`, `.pl()`) ผสานกับ D25 (`GROUP BY`, {{sql-window|Window Functions}})",
    },
    {
      node: 3,
      heading: "วัดผลจริงด้วย Benchmark และชุดเทสต์อัตโนมัติ",
      body: "วิศวกร AI ยืนยันทั้งความถูกต้อง (correctness) และประสิทธิภาพ (size/latency) ของ pipeline ก่อนส่งข้อมูลต่อไปสร้างฟีเจอร์และเทรนโมเดลใน Block B10–B12",
      lessonNote: "พิสูจน์ว่าทั้ง pipeline รัน 100,000 แถวได้ในระดับไม่กี่ร้อยมิลลิวินาทีบน CPU เครื่องเดียว พร้อม {{pytest}} ยืนยันตัวเลข",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิมแบบผสม (Interleaved Recall)** จาก D33 (Polars Lazy Pushdown), D34 (ล้าง UTF-8/Nulls/พ.ศ./Duplicates), D35 (Parquet + DuckDB `.pl()`), D25 (SQL {{sql-window|Window Functions}}) และ D5 ({{pathlib}})",
    "**ประกอบ end-to-end pipeline** ที่สร้างชุดข้อมูล e-commerce ไทยสกปรก 100,000 แถวแบบทำซ้ำได้ ({{reproducibility}}), ล้างข้อมูลด้วย Polars Lazy mode, เขียนลง {{parquet}} และวิเคราะห์ GMV แยกจังหวัด-หมวดหมู่ด้วย DuckDB",
    "**จับเวลาและเทียบขนาดไฟล์จริง** ระหว่าง CSV ดิบกับ Parquet สะอาด พร้อมเขียน {{pytest}} ตรวจสอบความถูกต้องของทั้ง pipeline",
  ],

  prerequisites: [
    "ทบทวนหรือเคยผ่าน D33 (Polars Expressions & Lazy), D34 (Thai Dirty Data Cleaning) และ D35 (DuckDB + Parquet)",
    "จำพื้นฐาน SQL `GROUP BY` / `RANK() OVER` (D25) และการใช้ {{pathlib}} (D5) ได้",
    "มี `uv`, `polars`, `duckdb`, `pyarrow`, `pytest` และ `ruff` พร้อมใช้งาน",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์รอบทบทวน Block B09 ด้วย `uv` แล้วติดตั้ง `polars`, `duckdb`, `pyarrow` พร้อม dev tools (`pytest`, `ruff`) เพื่อประกอบท่อ 100k แถว",
    commands: `uv init ai-day36-review && cd ai-day36-review
uv add polars duckdb pyarrow
uv add --dev pytest ruff
uv run python -c "import duckdb, polars as pl; print('Ready:', pl.__version__, duckdb.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day36-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `polars`, `duckdb`, `pyarrow`, `pytest`, `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็น Polars และ DuckDB พร้อมทำงาน"],
    ],
    note: "แบ่งเวลาตามสูตร Review Day 30 นาที: 10 นาทีทำ Interleaved Recall Quiz → 15 นาทีประกอบและรัน benchmark ท่อ 100,000 แถว + pytest → 5 นาทีสรุป Error Log ก่อนเข้าสู่ Block B10 (Math Intuition & NumPy)",
  },

  concepts: [
    {
      id: "b09-end-to-end-architecture",
      title: "1 · ร้อยต่อจิ๊กซอว์ B09 + D25/D5: สถาปัตยกรรม Local Data Pipeline",
      paragraphs: [
        "ตลอด Block B09 คุณได้เครื่องมือหลักของงานข้อมูลตารางครบทั้ง 3 ชิ้น: **D33** สอนคิดแบบ Polars Expressions & Lazy Query Plan, **D34** สอนล้างความเลอะเทอะของข้อมูลไทยจริง (UTF-8 noise, sentinel nulls, พ.ศ. → ค.ศ., deterministic dedup), และ **D35** สอนเก็บเป็น {{parquet}} แล้ววิเคราะห์ด้วย {{duckdb}} + `.pl()`",
        "วันนี้เรานำทั้ง 3 ชิ้นมาประกบกับ **D5** ({{pathlib}} จัดการโฟลเดอร์ `raw/` และ `clean/` แบบ cross-platform) และ **D25** (SQL `GROUP BY` + {{sql-window|Window Functions}}) เพื่อให้เห็นภาพจริงว่า pipeline จากไฟล์ดิบสู่ตารางวิเคราะห์ 100,000 แถวหน้าตาเป็นอย่างไร",
      ],
      analogy:
        "เหมือนโรงคัดแยกและบรรจุผลไม้มาตรฐานส่งออก: สายพาน Polars Lazy คัดลูกร้าว ล้างฝุ่น แปะวันที่สากล แล้วแพ็กลงลังกะทัดรัด (Parquet) จากนั้นทีมสถิติ DuckDB หยิบเฉพาะข้อมูลที่ต้องใช้มาสรุปยอดส่งออกรายจังหวัดในพริบตา",
      bullets: [
        "**Stage 1 — Bronze (Raw CSV)**: ไฟล์ดิบที่มี BOM, `\\u200b`, `N/A`, พ.ศ. `2569`, ออเดอร์ซ้ำ และแถว `cancelled`",
        "**Stage 2 — Silver (Clean Parquet via Polars Lazy)**: ล้างสตริง → แปลง sentinel → แปลง พ.ศ. → ค.ศ. → deduplicate เก็บแถวล่าสุด → กรองแถวสมบูรณ์ → บันทึก `.parquet` (ZSTD)",
        "**Stage 3 — Gold (Analytics via DuckDB → `.pl()`)**: คิวรี Parquet สรุป `order_count`, `total_gmv_thb`, `avg_order_thb` และ `RANK() OVER (PARTITION BY province ...)`",
      ],
      whyTitle: "Why this matters — มาตรฐาน Medallion (Bronze → Silver → Gold) บนเครื่องเดียว",
      whyParagraphs: [
        "แนวคิดแยกชั้น Raw CSV (ไม่แก้ทับไฟล์ต้นฉบับ) → Clean Parquet (ข้อมูลสะอาดใช้ซ้ำได้หลายงาน) → Gold Summary (ตารางสรุป/ฟีเจอร์) เป็นสถาปัตยกรรมเดียวกับ Data Lakehouse ระดับองค์กร แต่คุณทำได้ครบในเครื่องตัวเองด้วยแค่ Polars + DuckDB",
        "เมื่อเข้าสู่ Block B11–B14 คุณจะดึงไฟล์ Silver Parquet นี้ไปสร้างชุด Train/Val/Test และเทรนโมเดล LightGBM ได้ทันทีโดยไม่ต้องเสียเวลาล้าง CSV ใหม่ทุกรอบ",
      ],
    },
    {
      id: "deterministic-synthetic-benchmark",
      title: "2 · สร้างข้อมูลจำลอง 100,000 แถวอย่างทำซ้ำได้ (`seed`) เพื่อวัดผลจริง",
      paragraphs: [
        "เวลาออกแบบ pipeline อย่าทดสอบแค่ข้อมูล 5 แถวแล้วสรุปว่าเร็ว — การสร้าง **synthetic benchmark dataset 100,000 แถว** ด้วย fixed random seed (`random.Random(42)`) ช่วยให้คุณทดสอบทั้งความเร็ว, การกินหน่วยความจำ, อัตราการบีบอัด CSV → Parquet และกรณีขอบ (edge cases) อย่างครบถ้วนและทำซ้ำได้ทุกเครื่อง ({{reproducibility}})",
        "เทคนิคสำคัญคือจงใจฉีด \"ความสกปรก\" ตามสัดส่วนที่เจอจริงในธุรกิจไทย: เช่น แถวซ้ำ ~5% ที่มี `updated_at` ใหม่กว่า, ราคาที่เป็น `\"N/A\"` / `\"ไม่ระบุ\"` ~3%, ออเดอร์ที่ `cancelled` ~10%, ชื่อจังหวัดที่มี `\\u200b` / ช่องว่างเกิน และวันที่ปี พ.ศ. รวมถึงวันอธิกสุรทิน `29/02/2567`",
      ],
      analogy:
        "เหมือนสนามทดสอบรถก่อนส่งมอบลูกค้า — ไม่ใช่แค่สตาร์ตเครื่องในโรงรถ 5 เมตร แต่สร้างสนามจำลองหลุมบ่อและทางโค้ง 100 กิโลเมตรที่สภาพเดิมเป๊ะทุกครั้งเพื่อวัดเวลาและจุดบกพร่องจริง",
      code: {
        language: "python",
        filename: "generate_100k_snippet.py",
        code: `import random
from pathlib import Path
import polars as pl


def generate_dirty_thai_ecommerce_csv(path: Path, n_rows: int = 100_000, seed: int = 42) -> Path:
    rng = random.Random(seed)
    provinces = ["กรุงเทพฯ", " กรุง\\u200bเทพฯ ", "เชียงใหม่", "เชียงใหม่\\u00a0", "ภูเก็ต", "ขอนแก่น", "ชลบุรี"]
    categories = ["electronics", "fashion", "beauty", "home"]
    dates_raw = ["15/03/2569", "29/02/2567", "16/03/2026", "20/04/2569", "ไม่ระบุ"]

    # ใช้ n_unique_orders น้อยกว่า n_rows ~5% เพื่อจำลองแถวซ้ำ
    n_unique = int(n_rows * 0.95)
    order_ids = [f"ORD-{i:06d}" for i in range(n_unique)]
    order_ids += [f"ORD-{rng.randrange(n_unique):06d}" for _ in range(n_rows - n_unique)]

    prices = [
        "N/A" if i % 40 == 0 else ("ไม่ระบุ" if i % 67 == 0 else f"{rng.randint(150, 4500):,}.00 บาท")
        for i in range(n_rows)
    ]
    df = pl.DataFrame({
        "order_id": order_ids,
        "province": [provinces[i % len(provinces)] for i in range(n_rows)],
        "category": [categories[i % len(categories)] for i in range(n_rows)],
        "order_date_raw": [dates_raw[i % len(dates_raw)] if i % 50 == 0 else dates_raw[i % 4] for i in range(n_rows)],
        "price_raw": prices,
        "qty": [rng.randint(1, 3) for _ in range(n_rows)],
        "status": ["cancelled" if i % 10 == 0 else "paid" for i in range(n_rows)],
        "updated_at": [f"2026-03-{(i % 28) + 1:02d} {(i % 24):02d}:{(i % 60):02d}" for i in range(n_rows)],
    })
    path.parent.mkdir(parents=True, exist_ok=True)
    df.write_csv(path)
    return path`,
        caption: "ใช้ `random.Random(seed)` และ `path.parent.mkdir(parents=True, exist_ok=True)` (D5) เพื่อให้รันซ้ำได้ผลตรงกัน 100%",
      },
      whyTitle: "Why this matters — รู้ตัวเลข Latency จริงก่อนเลือกเครื่องมือ",
      whyParagraphs: [
        "หลายคนมักรีบตั้ง Spark หรือฐานข้อมูลคลาวด์ราคาแพงตั้งแต่ข้อมูลยังมีแค่หลักแสนหรือหลักล้านแถว แต่พอได้จับเวลาจริงจะเห็นว่า Polars + DuckDB จัดการ 100,000 แถวบนโน้ตบุ๊กจบใน **0.2–0.5 วินาที**",
        "การวัดเวลาด้วย `time.perf_counter()` และบันทึกขนาดไฟล์ไว้เป็นนิสัย จะช่วยให้คุณตัดสินใจเชิงสถาปัตยกรรมด้วยข้อมูลจริง (evidence-based engineering)",
      ],
    },
    {
      id: "verify-invariants-not-just-smoke",
      title: "3 · ตรวจความถูกต้องด้วย Data Invariants: อะไรต้องเป็นจริงหลังจบท่อ?",
      paragraphs: [
        "เมื่อข้อมูลมีถึง 100,000 แถว คุณไม่สามารถเปิดไฟล์ไล่ดูด้วยตาทีละบรรทัดได้ สิ่งที่วิศวกรข้อมูลใช้แทนคือการเขียน **Data Invariants** (เงื่อนไขที่ต้องเป็นจริงเสมอ 100% ของตาราง) ลงในชุดเทสต์ {{pytest}}",
        "ตัวอย่าง Invariants ที่ต้องเช็กหลังท่อ B09 จบงาน: (1) `order_id` ใน Parquet สะอาดต้องไม่ซ้ำเลย (`n_unique == height`), (2) ไม่มี `\\u200b` หรือช่องว่างหัว-ท้ายหลงเหลือใน `province`, (3) ปีของ `order_date` ทุกแถวต้องเป็น ค.ศ. (`< 2400`), (4) `gmv_thb > 0` และไม่มี `null` ในคอลัมน์หลัก, และ (5) ผลรวม `total_gmv_thb` จาก DuckDB ต้องเท่ากับผลรวม `gmv_thb` ใน Parquet เป๊ะ",
      ],
      analogy:
        "เหมือนการตรวจสมดุลบัญชี (งบดุล): ไม่ต้องนั่งตรวจใบเสร็จแสนใบด้วยมือทีละใบ แต่ตรวจเงื่อนไขเหล็กว่ายอดรวมฝั่งเดบิตต้องเท่ากับเครดิตเป๊ะ และห้ามมีใบเสร็จเลขที่ซ้ำหรือยอดติดลบหลุดเข้ามา",
      bullets: [
        "**Uniqueness invariant**: `clean_df[\"order_id\"].n_unique() == clean_df.height`",
        "**Domain invariant**: `clean_df[\"order_date\"].dt.year().max() < 2400` และ `clean_df[\"gmv_thb\"].min() > 0`",
        "**Conservation invariant**: ผลรวม `total_gmv_thb` หลัง DuckDB `GROUP BY` ต้องเท่ากับ `clean_df[\"gmv_thb\"].sum()` (พิสูจน์ว่าไม่มีแถวตกหล่นหรือนับเบิ้ล)",
      ],
      whyTitle: "Why this matters — สร้างความเชื่อมั่นให้ทั้งทีมและตัวคุณเอง",
      whyParagraphs: [
        "Invariant tests ตรวจจับบั๊กที่ subtle ที่สุดได้ทันที เช่น เผลอทำ `JOIN` ผิดจนแถวบวมขึ้นสองเท่า หรือเผลอลืมล้าง `\\u200b` จนจำนวนจังหวัดเกินจาก 5 เป็น 7 จังหวัด",
        "ชุดเทสต์แนวนี้จะถูกยกระดับต่อใน Phase 2 Checkpoint (Day 60) และ Phase 5 Automated Eval Gates (CI)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Batch ETL Pipeline (Polars + DuckDB) กับ Backend Jobs",
      body: [
        "ท่อข้อมูล 3 ขั้นในวันนี้เหมือน cron job / ETL worker ที่รับไฟล์ export ดิบมาทำความสะอาดแล้วทำรายงานสรุป เทียบแนวคิดได้ดังนี้:",
      ],
      table: [
        ["Bronze CSV → Silver Parquet → Gold Summary", "Raw upload → Normalized DB table → Materialized View"],
        ["`pl.scan_csv(...).collect().write_parquet(...)`", "Streaming ETL transform + write compressed artifact"],
        ["`duckdb.connect()` + `read_parquet(?)`", "Read-only analytics query worker (zero DB setup)"],
        ["Data Invariant assertions ใน `pytest`", "Contract / integration tests ตรวจสมดุลยอดรวมและ uniqueness"],
        ["`time.perf_counter()` benchmark", "Performance budget check ของ batch job"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมถึงใช้ `time.perf_counter()` ไม่ใช่ `time.time()` ตอนจับเวลา?",
      body: [
        "`time.time()` อ่านเวลาจากนาฬิกาของระบบ (wall clock) ซึ่งอาจกระโดดถอยหลังหรือเดินหน้าได้เวลาระบบซิงก์เวลาอินเทอร์เน็ต (NTP) จึงไม่เหมาะกับการวัดระยะเวลาการทำงานของโค้ด",
        "`time.perf_counter()` เป็นนาฬิกาความละเอียดสูงแบบเดินหน้าอย่างเดียว (monotonic) ที่ออกแบบมาเพื่อจับเวลา benchmark โดยเฉพาะ — สูตรมาตรฐานคือ `t0 = time.perf_counter(); ...; elapsed_ms = (time.perf_counter() - t0) * 1000`",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองรันท่อสมบูรณ์ตั้งแต่ต้นจนจบกับข้อมูล e-commerce ไทย 100,000 แถว: (1) สร้าง CSV สกปรก, (2) ล้างด้วย Polars Lazy และบันทึก Parquet, และ (3) คิวรีสรุป GMV รายจังหวัด-หมวดหมู่พร้อมจัดอันดับด้วย DuckDB แล้วดูขนาดไฟล์กับเวลาจริง",
    steps: [
      {
        title: "1 · สร้างฟังก์ชัน Polars Lazy Cleaning → เขียน Silver Parquet",
        explain:
          "ใช้ `pl.scan_csv` เพื่อเริ่มในโหมด Lazy (D33), ล้าง UTF-8/sentinels/พ.ศ. และ deduplicate (D34), คำนวณ `gmv_thb = price_thb * qty` แล้วเขียนลง Parquet (ZSTD)",
        code: {
          language: "python",
          filename: "worked_b09_pipeline.py",
          code: `from pathlib import Path
import polars as pl

SENTINELS = ["", "n/a", "na", "-", "null", "none", "ไม่ระบุ"]


def _parse_thai_date(col: str) -> pl.Expr:
    parts = pl.col(col).str.split_exact("/", 2)
    d = parts.struct.field("field_0").cast(pl.Int32, strict=False)
    m = parts.struct.field("field_1").cast(pl.Int32, strict=False)
    y = parts.struct.field("field_2").cast(pl.Int32, strict=False)
    y_ce = pl.when(y >= 2400).then(y - 543).otherwise(y)
    return pl.date(y_ce, m, d)


def clean_csv_to_parquet(raw_csv: Path, clean_parquet: Path) -> pl.DataFrame:
    lf = pl.scan_csv(raw_csv)
    clean_df = (
        lf.with_columns(
            pl.col(pl.String)
            .str.replace_all(r"[\\u200b\\ufeff]+", "")
            .str.replace_all(r"[\\u00a0\\s]+", " ")
            .str.strip_chars()
        )
        .with_columns(
            pl.when(pl.col(pl.String).str.to_lowercase().is_in(SENTINELS))
            .then(None)
            .otherwise(pl.col(pl.String))
            .name.keep()
        )
        .with_columns(
            pl.col("price_raw")
            .str.replace_all(r"[^0-9.\\-]", "")
            .cast(pl.Float64, strict=False)
            .alias("price_thb"),
            _parse_thai_date("order_date_raw").alias("order_date"),
        )
        .sort(["order_id", "updated_at"])
        .unique(subset=["order_id"], keep="last", maintain_order=True)
        .filter(
            (pl.col("status") == "paid")
            & pl.col("order_id").is_not_null()
            & pl.col("province").is_not_null()
            & pl.col("order_date").is_not_null()
            & (pl.col("price_thb") > 0)
            & (pl.col("qty") > 0)
        )
        .with_columns((pl.col("price_thb") * pl.col("qty")).round(2).alias("gmv_thb"))
        .select("order_id", "province", "category", "order_date", "price_thb", "qty", "gmv_thb")
        .collect()
    )
    clean_parquet.parent.mkdir(parents=True, exist_ok=True)
    clean_df.write_parquet(clean_parquet, compression="zstd")
    return clean_df`,
        },
        output: `# clean_csv_to_parquet พร้อมใช้งานกับไฟล์ 100,000 แถว`,
      },
      {
        title: "2 · วิเคราะห์ Silver Parquet ด้วย DuckDB SQL + Window Function → `.pl()`",
        explain:
          "ใช้ `read_parquet(?)` ของ DuckDB สรุปยอด GMV, จำนวนออเดอร์ และอันดับหมวดสินค้าในแต่ละจังหวัดด้วย `RANK() OVER (...)` แล้วคืนเป็น `pl.DataFrame`",
        code: {
          language: "python",
          filename: "worked_b09_pipeline.py",
          code: `import duckdb


def aggregate_gmv_with_duckdb(clean_parquet: Path) -> pl.DataFrame:
    sql = """
    SELECT
        province,
        category,
        COUNT(*) AS order_count,
        ROUND(SUM(gmv_thb), 2) AS total_gmv_thb,
        ROUND(AVG(gmv_thb), 2) AS avg_order_thb,
        RANK() OVER (
            PARTITION BY province
            ORDER BY SUM(gmv_thb) DESC, category ASC
        ) AS category_rank
    FROM read_parquet(?)
    GROUP BY province, category
    ORDER BY province ASC, category_rank ASC, category ASC
    """
    with duckdb.connect() as con:
        return con.execute(sql, [str(clean_parquet)]).pl()`,
        },
        output: `# aggregate_gmv_with_duckdb พร้อมคิวรี Parquet โดยตรงและคืน pl.DataFrame`,
      },
      {
        title: "3 · รัน Benchmark 100,000 แถวและตรวจ Conservation Invariant",
        explain:
          "จับเวลาแยกทั้งขั้น Polars Clean→Parquet และขั้น DuckDB Query พร้อมเทียบขนาดไฟล์และตรวจว่าผลรวม GMV ตรงกันเป๊ะ",
        code: {
          language: "python",
          filename: "worked_b09_pipeline.py",
          code: `import time

raw_csv = Path("data/raw_100k.csv")
clean_pq = Path("data/clean_100k.parquet")

# สมมติเรียก generate_dirty_thai_ecommerce_csv(raw_csv, n_rows=100_000, seed=42) จาก Concept 2
t0 = time.perf_counter()
clean_df = clean_csv_to_parquet(raw_csv, clean_pq)
t1 = time.perf_counter()
summary_df = aggregate_gmv_with_duckdb(clean_pq)
t2 = time.perf_counter()

csv_mb = raw_csv.stat().st_size / (1024 * 1024)
pq_mb = clean_pq.stat().st_size / (1024 * 1024)
print(f"Clean rows: {clean_df.height:,} | Provinces: {clean_df['province'].n_unique()}")
print(f"CSV: {csv_mb:.2f} MB -> Parquet: {pq_mb:.2f} MB ({csv_mb / pq_mb:.1f}x smaller)")
print(f"Polars clean+write: {(t1 - t0) * 1000:.1f} ms | DuckDB agg: {(t2 - t1) * 1000:.1f} ms")
print(f"GMV check diff: {abs(clean_df['gmv_thb'].sum() - summary_df['total_gmv_thb'].sum()):.4f}")
print(summary_df.head(5))`,
        },
        output: `Clean rows: 80,412 | Provinces: 5
CSV: 9.84 MB -> Parquet: 1.42 MB (6.9x smaller)
Polars clean+write: 185.4 ms | DuckDB agg: 14.2 ms
GMV check diff: 0.0000
shape: (5, 6)
┌──────────┬─────────────┬─────────────┬───────────────┬───────────────┬───────────────┐
│ province ┆ category    ┆ order_count ┆ total_gmv_thb ┆ avg_order_thb ┆ category_rank │
│ ---      ┆ ---         ┆ ---         ┆ ---           ┆ ---           ┆ ---           │
│ str      ┆ str         ┆ i64         ┆ f64           ┆ f64           ┆ i64           │
╞══════════╪═════════════╪═════════════╪═══════════════╪═══════════════╪═══════════════╡
│ กรุงเทพฯ ┆ beauty      ┆ 6521        ┆ 30321450.0    ┆ 4649.82       ┆ 1             │
│ กรุงเทพฯ ┆ electronics ┆ 6489        ┆ 30118900.0    ┆ 4641.53       ┆ 2             │
│ กรุงเทพฯ ┆ fashion     ┆ 6412        ┆ 29804200.0    ┆ 4648.19       ┆ 3             │
│ กรุงเทพฯ ┆ home        ┆ 6385        ┆ 29641750.0    ┆ 4642.40       ┆ 4             │
│ ขอนแก่น  ┆ electronics ┆ 3418        ┆ 15912400.0    ┆ 4655.47       ┆ 1             │
└──────────┴─────────────┴─────────────┴───────────────┴───────────────┴───────────────┘`,
      },
    ],
    gotcha:
      "จุดสังเกตเรื่องลำดับการกรอง `status == 'paid'` กับการ deduplicate: ต้องทำ `.sort(['order_id', 'updated_at']).unique(subset=['order_id'], keep='last')` **ก่อน** กรอง `status == 'paid'`! เพราะถ้าออเดอร์เดิมเคย `paid` แล้วตอนหลังถูกเปลี่ยนเป็น `cancelled` การกรอง `paid` ก่อน deduplicate จะเผลอเก็บแถว `paid` เก่าที่ถูกยกเลิกไปแล้วเข้ามาคิดเป็นยอดขาย!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + Mini-Integration (15 นาที): สร้าง `b09_ecommerce_pipeline.py` ที่ร้อยท่อ Polars Lazy cleaning → Silver Parquet → DuckDB SQL aggregation พร้อม benchmark บนชุดข้อมูล e-commerce ไทย 100,000 แถว และผ่าน Data Invariant tests ครบทุกข้อ",
    requirements: [
      "`generate_dirty_orders_csv(csv_path: Path, n_rows: int = 100_000, seed: int = 42) -> Path`: สร้าง CSV ข้อมูล e-commerce ไทยสกปรกที่มี 5 จังหวัดจริง (ปน `\\u200b`, `\\u00a0`, ช่องว่างเกิน), 4 หมวดหมู่, แถวซ้ำ ~5%, ราคาปน `\"N/A\"`/`\"ไม่ระบุ\"`/ลูกน้ำ/บาท, วันที่ พ.ศ. รวม `29/02/2567` และ `status` ปน `paid`/`cancelled`",
      "`clean_orders_to_parquet(raw_csv: Path, clean_parquet: Path) -> dict[str, int | float]`: ใช้ `pl.scan_csv` (Lazy) ล้าง UTF-8/sentinels/พ.ศ., ทำ deterministic deduplication (`.sort([\"order_id\", \"updated_at\"]).unique(subset=[\"order_id\"], keep=\"last\")`) **ก่อน** กรอง `status == \"paid\"` และค่าที่สมบูรณ์, คำนวณ `gmv_thb = price_thb * qty`, เขียน Parquet (ZSTD) และคืนสถิติ `{ \"clean_rows\", \"csv_bytes\", \"parquet_bytes\", \"clean_ms\" }`",
      "`aggregate_province_category(clean_parquet: Path) -> pl.DataFrame`: ใช้ DuckDB คิวรี `read_parquet(?)` สรุป `province`, `category`, `order_count`, `total_gmv_thb` (ปัด 2 ตำแหน่ง), `avg_order_thb` (ปัด 2 ตำแหน่ง), และ `category_rank` (`RANK() OVER (PARTITION BY province ORDER BY SUM(gmv_thb) DESC, category ASC)`) เรียงตาม `province ASC, category_rank ASC, category ASC` คืนเป็น `pl.DataFrame` ด้วย `.pl()`",
      "`run_benchmark(work_dir: Path, n_rows: int = 100_000, seed: int = 42) -> dict[str, object]`: รันครบทั้ง 3 ขั้นใน `work_dir` แล้วคืน dict ที่มี `clean_rows`, `csv_bytes`, `parquet_bytes`, `clean_ms`, `query_ms`, `summary_df`",
      "ผ่าน Data Invariant tests ทั้งหมด รวมถึงกรณีออเดอร์ที่เปลี่ยนสถานะจาก `paid` → `cancelled` ต้องไม่ถูกนับเป็นยอดขาย และรัน 100,000 แถวจบภายในไม่กี่วินาทีบน CPU เครื่องเดียว",
    ],
    starter: {
      language: "python",
      filename: "b09_ecommerce_pipeline.py",
      code: `import random
import time
from pathlib import Path
import duckdb
import polars as pl

SENTINELS = ["", "n/a", "na", "-", "null", "none", "ไม่ระบุ"]


def generate_dirty_orders_csv(
    csv_path: Path, n_rows: int = 100_000, seed: int = 42
) -> Path:
    """สร้างไฟล์ CSV ข้อมูล e-commerce ไทยสกปรกแบบทำซ้ำได้ด้วย seed"""
    # TODO: สร้างข้อมูล n_rows แถวที่มี UTF-8 noise, sentinel nulls, พ.ศ. + 29/02/2567, duplicates, paid/cancelled
    raise NotImplementedError


def clean_orders_to_parquet(
    raw_csv: Path, clean_parquet: Path
) -> dict[str, int | float]:
    """ล้างข้อมูลด้วย Polars Lazy -> deduplicate ก่อน filter paid -> เขียน Parquet (ZSTD)"""
    # TODO: คืน {"clean_rows": int, "csv_bytes": int, "parquet_bytes": int, "clean_ms": float}
    raise NotImplementedError


def aggregate_province_category(clean_parquet: Path) -> pl.DataFrame:
    """คิวรี Silver Parquet ด้วย DuckDB (GROUP BY + RANK() OVER) แล้วคืน pl.DataFrame"""
    # TODO: คืน DataFrame ที่มีคอลัมน์ province, category, order_count, total_gmv_thb, avg_order_thb, category_rank
    raise NotImplementedError


def run_benchmark(
    work_dir: Path, n_rows: int = 100_000, seed: int = 42
) -> dict[str, object]:
    """รันครบทั้งท่อ (Generate -> Clean/Parquet -> DuckDB Agg) พร้อมจับเวลา"""
    # TODO: เชื่อมทั้ง 3 ฟังก์ชันเข้าด้วยกันและคืนรายงานพร้อม summary_df
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_b09_pipeline.py",
      code: `from pathlib import Path
import polars as pl
import pytest
from b09_ecommerce_pipeline import (
    aggregate_province_category,
    clean_orders_to_parquet,
    run_benchmark,
)


def test_dedup_happens_before_paid_filter(tmp_path: Path):
    """ถ้าออเดอร์เคย paid แล้วตอนหลังเปลี่ยนเป็น cancelled ต้องไม่ถูกนับเป็นยอดขาย"""
    csv_path = tmp_path / "edge.csv"
    csv_path.write_text(
        "order_id,province,category,order_date_raw,price_raw,qty,status,updated_at\\n"
        "O-1, กรุง\\u200bเทพฯ ,electronics,29/02/2567,\\\"1,000 บาท\\\",2,paid,2026-03-01 09:00\\n"
        "O-1,กรุงเทพฯ,electronics,29/02/2567,\\\"1,000 บาท\\\",2,cancelled,2026-03-01 10:00\\n"
        "O-2,เชียงใหม่\\u00a0,beauty,15/03/2569,500,3,paid,2026-03-15 11:00\\n",
        encoding="utf-8",
    )
    pq_path = tmp_path / "clean.parquet"
    stats = clean_orders_to_parquet(csv_path, pq_path)
    assert stats["clean_rows"] == 1

    clean_df = pl.read_parquet(pq_path)
    assert clean_df["order_id"].to_list() == ["O-2"]
    assert clean_df["gmv_thb"].to_list() == [1500.0]

    summary = aggregate_province_category(pq_path)
    assert summary.height == 1
    assert summary["total_gmv_thb"][0] == pytest.approx(1500.0)
    assert summary["category_rank"][0] == 1


def test_100k_end_to_end_invariants_and_compression(tmp_path: Path):
    report = run_benchmark(tmp_path, n_rows=100_000, seed=42)
    parquet_files = list(tmp_path.rglob("*.parquet"))
    assert len(parquet_files) == 1
    clean_df = pl.read_parquet(parquet_files[0])

    # 1. Parquet ต้องเล็กกว่า CSV และมีแถวสะอาดมากกว่า 50,000 แถว
    assert report["parquet_bytes"] < report["csv_bytes"]
    assert report["clean_rows"] == clean_df.height
    assert clean_df.height > 50_000

    # 2. Data Invariants บน Silver Parquet
    assert clean_df["order_id"].n_unique() == clean_df.height
    assert clean_df["province"].n_unique() == 5
    assert clean_df["order_date"].dt.year().max() < 2400
    assert clean_df["gmv_thb"].min() > 0

    # 3. Conservation Invariant: ยอดรวม GMV จาก DuckDB ต้องตรงกับ Silver Parquet เป๊ะ
    summary_df = report["summary_df"]
    assert isinstance(summary_df, pl.DataFrame)
    assert summary_df.columns == [
        "province",
        "category",
        "order_count",
        "total_gmv_thb",
        "avg_order_thb",
        "category_rank",
    ]
    assert summary_df["total_gmv_thb"].sum() == pytest.approx(
        clean_df["gmv_thb"].sum(), rel=1e-6
    )
    assert summary_df["order_count"].sum() == clean_df.height
`,
    },
    selfCheck: [
      "กรณีขอบ `O-1` (`paid` เวลา 09:00 → `cancelled` เวลา 10:00) ถูกตัดออกหลัง deduplicate ไม่หลุดเข้าไปนับเป็นยอดขาย",
      "Silver Parquet ของ 100,000 แถวมีขนาดเล็กกว่า CSV ดิบหลายเท่า และผ่านทุก invariant (`n_unique == height`, 5 จังหวัดสะอาด, ปี ค.ศ. `< 2400`, `gmv_thb > 0`)",
      "Conservation invariant ผ่าน: `summary_df['total_gmv_thb'].sum()` เท่ากับ `clean_df['gmv_thb'].sum()` เป๊ะ",
      "เวลาทำงานรวมทั้ง Polars cleaning + Parquet write + DuckDB aggregation อยู่ระดับไม่กี่ร้อยมิลลิวินาทีบนเครื่องของคุณ",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 2 test functions (รวม benchmark 100,000 แถว) ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "วางลำดับใน `clean_orders_to_parquet` ให้แม่น: (1) ล้างชื่อคอลัมน์และสตริง UTF-8 → (2) แปลง sentinel เป็น `null` → (3) แปลง `price_thb` และ `order_date` → (4) `.sort([\"order_id\", \"updated_at\"]).unique(subset=[\"order_id\"], keep=\"last\", maintain_order=True)` → (5) `.filter((pl.col(\"status\") == \"paid\") & ...)`",
      },
      {
        body: "ใน `generate_dirty_orders_csv` ให้แน่ใจว่าชุดชื่อจังหวัดทั้งแบบสะอาดและแบบมีขยะ (เช่น `\" กรุง\\u200bเทพฯ \"`, `\"เชียงใหม่\\u00a0\"`) เมื่อล้างแล้วต้องยุบเหลือ **5 จังหวัดพอดี** เพื่อให้ `clean_df[\"province\"].n_unique() == 5` ผ่าน",
      },
      {
        body: "โครงของ `run_benchmark` และการจับเวลาด้วย `time.perf_counter()`:",
        code: {
          language: "python",
          filename: "hint_day36.py",
          code: `def run_benchmark(
    work_dir: Path, n_rows: int = 100_000, seed: int = 42
) -> dict[str, object]:
    raw_csv = work_dir / "raw_orders.csv"
    clean_pq = work_dir / "clean_orders.parquet"

    generate_dirty_orders_csv(raw_csv, n_rows=n_rows, seed=seed)
    stats = clean_orders_to_parquet(raw_csv, clean_pq)

    t0 = time.perf_counter()
    summary_df = aggregate_province_category(clean_pq)
    query_ms = (time.perf_counter() - t0) * 1000

    return {
        **stats,
        "query_ms": round(query_ms, 2),
        "summary_df": summary_df,
    }`,
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
      title: "กรอง `status == 'paid'` ก่อนทำ deduplicate ตาม `order_id`",
      symptom: "ออเดอร์ที่เคยจ่ายเงินแล้วต่อมาลูกค้ายกเลิก (`paid` → `cancelled`) ยังคงค้างอยู่ในตารางยอดขาย ทำให้ตัวเลข GMV สูงเกินจริง",
      fix: "ต้อง `.sort([\"order_id\", \"updated_at\"]).unique(subset=[\"order_id\"], keep=\"last\")` ให้ได้สถานะล่าสุดของแต่ละออเดอร์ก่อน แล้วค่อย `.filter(pl.col(\"status\") == \"paid\")`",
    },
    {
      title: "เขียนทับไฟล์ CSV ดิบหรือสร้างข้อมูลสุ่มโดยไม่กำหนด `seed`",
      symptom: "รันเทสต์รอบแรกราบรื่นแต่รอบสองตัวเลขเปลี่ยนไป หรือย้อนกลับมาตรวจสอบข้อมูลต้นฉบับไม่ได้",
      fix: "แยกพาธ `raw_orders.csv` กับ `clean_orders.parquet` ออกจากกันเสมอ และใช้ `random.Random(seed)` สำหรับข้อมูลจำลองเพื่อ {{reproducibility}}",
    },
    {
      title: "ไม่เช็ก Conservation Invariant ระหว่าง Silver Parquet กับผล DuckDB Aggregation",
      symptom: "เผลอใส่ `WHERE` ซ้ำซ้อนหรือ `JOIN` ที่ทำให้แถวคูณสอง แต่ไม่รู้ตัวเพราะไม่ได้เทียบยอดรวมกับตารางต้นทาง",
      fix: "เขียน assertion เทียบ `summary_df[\"total_gmv_thb\"].sum() == pytest.approx(clean_df[\"gmv_thb\"].sum())` และ `summary_df[\"order_count\"].sum() == clean_df.height` เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d036-q1",
        "ออเดอร์ `O-999` มี 2 แถวในไฟล์ดิบ: เวลา 09:00 `status='paid'` และเวลา 10:00 `status='cancelled'` ลำดับการทำงานใดใน Polars ที่ให้ยอดขายถูกต้อง?",
        [
          ["`.filter(pl.col('status') == 'paid')` ก่อน แล้วค่อย `.unique(subset=['order_id'], keep='last')`", "ผิด — แถว `cancelled` จะถูกตัดทิ้งก่อน ทำให้ `O-999` ที่ถูกยกเลิกไปแล้วกลับมาถูกนับเป็น `paid`!"],
          ["`.sort(['order_id', 'updated_at']).unique(subset=['order_id'], keep='last')` ก่อน แล้วค่อย `.filter(pl.col('status') == 'paid')`", "ถูก — ได้สถานะล่าสุด (`cancelled`) ก่อน จากนั้นจึงถูกกรองออกจากยอดขายอย่างถูกต้อง"],
          ["`.unique(subset=['status'])` ก่อนแล้วค่อยเรียงเวลา", "ผิด — จะเหลือแค่ 2 แถวทั้งตาราง (`paid` กับ `cancelled`)"],
          ["ไม่ว่าจะทำลำดับไหนก็ได้ผลลัพธ์เท่ากันเสมอ", "ผิด — ลำดับของ `filter` กับ `dedup` เปลี่ยนคำตอบทางธุรกิจโดยตรง"],
        ],
        "B",
        "เมื่อข้อมูลเป็น event/update log ที่มีหลายสถานะต่อ 1 `order_id` ต้องยุบให้เหลือสถานะล่าสุดก่อนเสมอ แล้วจึงกรองตามสถานะธุรกิจ",
        "ทำไมต้อง deduplicate ตาม `order_id` ล่าสุดก่อนกรอง `status == 'paid'`?",
        "เพื่อป้องกันไม่ให้ออเดอร์ที่เคย `paid` แล้วถูกเปลี่ยนเป็น `cancelled` ภายหลังหลุดกลับเข้ามาถูกนับเป็นยอดขาย",
      ),
      mc(
        "d036-q2",
        "เมื่อคุณรัน `pl.scan_csv('raw_100k.csv').filter(...).select(...).explain()` ข้อความใดยืนยันว่า Polars ทำทั้ง Projection Pushdown และ Predicate Pushdown แล้ว?",
        [
          ["เห็นคำว่า `EAGER_COLLECT` และ `PYTHON_UDF`", "ไม่ใช่ — นั่นไม่ได้บ่งบอกการทำ pushdown"],
          ["เห็น `PROJECT x/y COLUMNS` และ `SELECTION: [...]` อยู่ใต้ขั้น `Csv SCAN`", "ถูก — `PROJECT` คืออ่านเฉพาะคอลัมน์ที่ใช้ และ `SELECTION` คือดันเงื่อนไขกรองลงไปตั้งแต่ตอนสแกนไฟล์"],
          ["เห็น `SORT BY` อยู่บรรทัดล่างสุด", "ผิด — `SORT BY` มักอยู่ด้านบนหลัง aggregation"],
          ["แผน query ว่างเปล่าไม่มีข้อความใด ๆ", "ไม่จริง — `.explain()` จะพิมพ์โครงสร้างแผน query เสมอ"],
        ],
        "B",
        "การอ่านผล `.explain()` ใน D33 ช่วยยืนยันได้ทันทีว่า query optimizer ดันรายการคอลัมน์ (`PROJECT`) และตัวกรอง (`SELECTION`) ลงไปที่ขั้นสแกนไฟล์แล้ว",
        "ใน `.explain()` ของ Polars `PROJECT` กับ `SELECTION` ใต้ `Csv SCAN` หมายถึงอะไร?",
        "`PROJECT` คือ Projection Pushdown (อ่านเฉพาะคอลัมน์ที่ปลายทางใช้) และ `SELECTION` คือ Predicate Pushdown (กรองแถวตั้งแต่ตอนสแกนไฟล์)",
      ),
      mc(
        "d036-q3",
        "หลังจบท่อ Polars → Silver Parquet → DuckDB Aggregation วิธีใดตรวจจับได้เร็วที่สุดว่าไม่มีแถวตกหล่นหรือถูกนับซ้ำระหว่างขั้น DuckDB?",
        [
          ["เปิดไฟล์ Parquet ด้วย Notepad แล้วนับแถวด้วยมือ", "Parquet เป็นไฟล์ไบนารีเปิดด้วย Notepad ไม่ได้ และนับมือกับ 100k แถวไม่ได้"],
          ["ตรวจ Conservation Invariant: ผลรวม `total_gmv_thb` และ `order_count` ของตารางสรุป DuckDB ต้องเท่ากับผลรวม `gmv_thb` และจำนวนแถวของ Silver Parquet เป๊ะ", "ถูก — หากยอดรวมและจำนวนแถวตรงกันเป๊ะ ยืนยันได้ว่าไม่มีแถวหายหรือนับเบิ้ล"],
          ["ดูแค่ว่าขนาดไฟล์ Parquet เล็กกว่า CSV ก็เพียงพอแล้ว", "ไม่พอ — ขนาดไฟล์เล็กไม่ได้รับประกันว่า SQL `GROUP BY` คำนวณถูก"],
          ["สุ่มดูแค่แถวแรกแถวเดียวของผลลัพธ์", "ไม่พอ — อาจมีบั๊กในจังหวัดหรือหมวดหมู่อื่น"],
        ],
        "B",
        "Conservation Invariants (ยอดรวมและจำนวนแถวต้องคงที่ข้ามขั้น aggregation) เป็นการตรวจสุขภาพ pipeline ที่ทรงพลังและเขียนเป็น assertion ใน `pytest` ได้ใน 2 บรรทัด",
        "Conservation Invariant ในงาน data aggregation คืออะไร?",
        "การตรวจสอบว่าผลรวมของยอด (`SUM`) และจำนวนแถว (`COUNT`) ในตารางสรุปปลายทางต้องเท่ากับตารางต้นทางที่สะอาดแล้วเป๊ะ เพื่อกันบั๊กแถวหายหรือนับเบิ้ล",
      ),
      mc(
        "d036-q4",
        "ข้อใดคือจุดแข็งหลักของการจับคู่ **Polars** กับ **DuckDB + Parquet** ในสถาปัตยกรรม B09?",
        [
          ["ไม่ต้องเขียนเทสต์เพราะทั้งคู่การันตีว่าไม่มีบั๊กทางธุรกิจ", "ไม่จริง — ยังต้องเขียน `pytest` และ data-quality audit เสมอ"],
          ["Polars ล้างข้อมูล/สตริงไทยแบบ vectorized → บันทึก Parquet ขนาดเล็กพร้อม schema → DuckDB คิวรี SQL/Window Functions บน Parquet โดยตรงแล้วคืน `.pl()` แบบ zero-copy", "ถูก — ได้ทั้งความเร็ว ความประหยัดดิสก์ และความอ่านง่ายของทั้ง Expression และ SQL"],
          ["บังคับให้ต้องใช้ GPU ในการรันทุกคำสั่ง", "ไม่จริง — ทั้ง Polars และ DuckDB รันบน CPU ปกติได้เต็มประสิทธิภาพ"],
          ["เปลี่ยนไฟล์ CSV เป็นฐานข้อมูล NoSQL อัตโนมัติ", "ไม่จริง — Parquet เป็นไฟล์ตารางแบบ columnar ที่มี schema ชัดเจน"],
        ],
        "B",
        "ท่อ Polars → Parquet → DuckDB → `.pl()` รวมจุดแข็งของแต่ละเครื่องมือไว้ครบโดยใช้หน่วยความจำร่วมผ่าน Apache Arrow และรันได้บนเครื่องเดียว",
        "สรุปบทบาทของ Polars, Parquet และ DuckDB ในท่อข้อมูล B09?",
        "Polars ทำ cleaning & transformation แบบ vectorized, Parquet จัดเก็บตารางสะอาดแบบ columnar บีบอัดพร้อม schema, และ DuckDB คิวรี SQL/Window Functions แล้วส่งกลับ Polars ด้วย `.pl()`",
      ),
    ],
  },

  takeaways: [
    "ท่อมาตรฐานของ Block B09 คือ **Raw CSV → Polars Lazy Cleaning → Silver Parquet (ZSTD) → DuckDB SQL + Window Function → `.pl()`**",
    "ลำดับการล้างข้อมูลสำคัญมาก: **ล้าง UTF-8/sentinels → แปลง พ.ศ. → ค.ศ. → `sort` + `unique(keep='last')` → ค่อย `filter(status == 'paid')`**",
    "ตรวจสอบ pipeline ขนาดแสนแถวด้วย **Data Invariants** (uniqueness, domain range, conservation of GMV/count) และวัดเวลาจริงด้วย `time.perf_counter()`",
    "จบ Block B09 แล้วคุณพร้อมเข้าสู่ **Block B10 (Vectors, Cosine Similarity & Probability ด้วย NumPy)** ใน Day 37",
  ],

  reviewCards: [
    rc(
      "d036-rc-1",
      "เรียงลำดับที่ถูกต้องของขั้นล้างข้อมูล 4 ขั้นนี้: (ก) filter `status == 'paid'`, (ข) ล้าง UTF-8/whitespace, (ค) `sort` + `unique(keep='last')`, (ง) เขียน Parquet",
      "(ข) ล้าง UTF-8/whitespace → (ค) `sort` + `unique(keep='last')` → (ก) filter `status == 'paid'` → (ง) เขียน Parquet",
    ),
    rc(
      "d036-rc-2",
      "3 Data Invariants หลักที่ควรตรวจบน Silver Parquet และผลสรุป DuckDB คืออะไร?",
      "(1) Uniqueness (`order_id` ไม่ซ้ำเลย), (2) Domain validity (จำนวนจังหวัดถูกต้อง, ปี ค.ศ. `< 2400`, `gmv_thb > 0`), และ (3) Conservation (ผลรวม `total_gmv_thb` และ `order_count` ในผลสรุป DuckDB เท่ากับ Silver Parquet เป๊ะ)",
    ),
    rc(
      "d036-rc-3",
      "ทำไมจึงควรใช้ `time.perf_counter()` แทน `time.time()` ในการทำ benchmark สคริปต์ Python?",
      "เพราะ `time.perf_counter()` เป็นนาฬิกาความละเอียดสูงแบบ monotonic (เดินหน้าอย่างเดียว ไม่กระโดดตามการซิงก์เวลาของระบบ)",
    ),
  ],

  sources: [
    { label: "Polars User Guide — Parquet I/O & Streaming", href: "https://docs.pola.rs/user-guide/io/parquet/" },
    { label: "DuckDB Docs — Performance Guide", href: "https://duckdb.org/docs/stable/guides/performance/overview.html" },
    { label: "Python Docs — time.perf_counter", href: "https://docs.python.org/3/library/time.html#time.perf_counter" },
  ],

  glossary: [
    "polars",
    "duckdb",
    "parquet",
    "schema",
    "sql-window",
    "pathlib",
    "reproducibility",
    "pytest",
  ],
});
