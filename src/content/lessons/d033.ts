import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D033 — Phase 2 / Block B09
 * Tabular Data with Polars (DataFrames, Expressions, Lazy mode)
 */
export const d033: Lesson = defineLesson({
  day: 33,
  titleTh: "จัดการข้อมูลตารางความเร็วสูงด้วย Polars (Expressions & Lazy Mode)",
  tagline: "30 นาที · โครงสร้าง Expression ที่อ่านง่าย + Lazy Query Plan ที่กรองข้อมูลก่อนโหลดเข้า RAM",
  icon: "table",
  visual: {
    id: "polars-lazy",
    title: "Polars Eager vs Lazy Query Plan — กรองก่อนอ่านทั้งไฟล์",
    caption: "กดเทียบแผนการทำงานแบบ Eager กับ Lazy ที่ทำ predicate & projection pushdown อัตโนมัติ",
    alt: "แผนภาพเปรียบเทียบ Polars Eager และ Lazy query optimization",
  },
  requiresApiKey: false,
  tools: ["Polars", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "ตั้งคำถามจากข้อมูลธุรกิจจริง",
      body: "ก่อนจะสร้างโมเดลทำนายหรือระบบ RAG เราต้องรู้สภาพข้อมูลจริงก่อน เช่น หมวดทิกเก็ตไหนใช้เวลาตอบนานที่สุด หรือสินค้ากลุ่มใดมียอดคืนเงินสูงผิดปกติ",
      lessonNote: "วันนี้เราเปลี่ยนไฟล์ CSV/Log ดิบของร้านค้าและทิกเก็ตซัพพอร์ตให้เป็นสรุปเชิงสถิติที่เชื่อถือได้ในไม่กี่บรรทัด",
    },
    {
      node: 1,
      heading: "ทำความสะอาดและย่อยข้อมูลตาราง",
      body: "ข้อมูลธุรกิจในโลกจริงมาในรูปตารางหลายแสนแถว (CSV, Parquet, {{jsonl}}) ถ้าโหลดทั้งก้อนเข้า RAM แบบไร้แผน เครื่องจะช้าหรือหน่วยความจำเต็มก่อนเริ่มงาน ML",
      lessonNote: "{{polars}} ใช้ Expression และ `LazyFrame` เพื่อทำ Predicate/Projection Pushdown — อ่านเฉพาะคอลัมน์และแถวที่จำเป็นจริง ๆ",
    },
    {
      node: 2,
      heading: "เตรียมฟีเจอร์ก่อนส่งต่อเข้าโมเดล",
      body: "โมเดล Classical ML ใน Phase 2 (และระบบวิเคราะห์ eval log ใน Phase 5) ต้องการตารางฟีเจอร์ที่มีชนิดข้อมูล ({{schema}}) ชัดเจนและคำนวณซ้ำได้ตรงกันทุกครั้ง",
      lessonNote: "Expression ของ Polars เขียนเป็น pipeline แบบ declarative ที่ต่อยอดไปใช้ร่วมกับ {{duckdb}} ใน Day 35 และ scikit-learn ใน Block B11 ได้ทันที",
    },
    {
      node: 3,
      heading: "ตรวจสอบคุณภาพข้อมูลด้วยเทสต์",
      body: "ข้อมูลที่คำนวณผิดตั้งแต่ขั้น aggregation ทำให้ทั้งแดชบอร์ดและโมเดลเพี้ยนตาม — การเขียน {{pytest}} ตรวจตารางผลลัพธ์ช่วยจับบั๊กตั้งแต่เนิ่น ๆ",
      lessonNote: "แบบฝึกหัดวันนี้สร้างฟังก์ชันวิเคราะห์ทิกเก็ตด้วย `LazyFrame` พร้อมเทสต์ยืนยัน {{schema}} และตัวเลขสรุป",
    },
  ],

  objectives: [
    "**เขียน Expression ของ Polars** (`pl.col`, `filter`, `with_columns`, `group_by`, `agg`) เพื่อแปลงและสรุปข้อมูลตารางแบบอ่านง่ายและรันแบบ multi-threaded อัตโนมัติ",
    "**แยกแยะและเลือกใช้** โหมด Eager (`DataFrame` / `read_csv`) กับโหมด Lazy (`LazyFrame` / `scan_csv`) พร้อมอ่านผลจาก `.explain()` เพื่อยืนยันการทำ query optimization",
    "**สร้าง data pipeline ขนาดกะทัดรัด** ที่กรอง เลือกคอลัมน์ และจัดกลุ่มข้อมูลทิกเก็ตซัพพอร์ตภาษาไทยโดยไม่เปลือง RAM เกินจำเป็น",
  ],

  prerequisites: [
    "ผ่าน Phase 1 พื้นฐาน Python, {{uv}} และ {{pytest}}",
    "คุ้นเคยโครงสร้างตาราง (แถว, คอลัมน์, CSV) และ SQL `WHERE` / `GROUP BY` จาก Block B07",
    "ไม่ต้องมีพื้นฐาน pandas มาก่อน (ถ้าเคยใช้จะมีตารางเทียบให้)",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่สำหรับ Phase 2 ด้วย {{uv}} แล้วติดตั้ง {{polars}} พร้อมเครื่องมือทดสอบ ใช้เวลาไม่เกิน 3 นาที",
    commands: `uv init ai-day33 && cd ai-day33
uv add polars
uv add --dev pytest ruff
uv run python -c "import polars as pl; print('Polars:', pl.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day33` ด้วย `uv init` สำเร็จ"],
      ["polars", "ติดตั้ง `polars` และ `pytest` / `ruff` ผ่าน `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชันแล้วเห็นเลขเวอร์ชัน Polars 1.x"],
    ],
    note: "Polars เป็นไบนารีที่คอมไพล์จาก Rust จึงติดตั้งเร็วมากและไม่ต้องมี Rust compiler บนเครื่อง",
  },

  concepts: [
    {
      id: "polars-expressions",
      title: "1 · Expression-First: คิดเป็นสูตรคอลัมน์ ไม่ใช่ลูปทีละแถว",
      paragraphs: [
        "{{polars}} เป็นไลบรารี DataFrame ที่เขียนด้วย Rust ออกแบบมาให้ใช้ทุกแกน CPU พร้อมกันอัตโนมัติ (multi-threaded) และจัดเก็บข้อมูลแบบคอลัมน์ (Apache Arrow) ทำให้เร็วและใช้หน่วยความจำน้อยกว่า pandas หลายเท่าในชุดข้อมูลขนาดกลางถึงใหญ่",
        "หัวใจของ Polars คือ **Expression** (`pl.col(...)`) — แทนที่จะวนลูปทีละแถวหรือแก้ไขตารางเดิมทีละช่อง เราประกาศ *สูตรแปลงข้อมูล* แล้วส่งเข้าบริบท (context) 4 ตัวหลัก ได้แก่ `select`, `with_columns`, `filter` และ `group_by().agg()`",
        "จุดเด่นคือ Expression หลายตัวใน `with_columns([...])` หรือ `agg([...])` จะถูก Polars จัดตารางให้รันขนานกัน (parallel) เองโดยเราไม่ต้องเขียนโค้ด thread หรือ multiprocessing",
      ],
      analogy:
        "เหมือนสั่งครัวว่า 'หั่นผักทุกถาด + ต้มซุป + อุ่นจานพร้อมกัน' (ประกาศเป้าหมาย) แทนที่จะเดินไปสั่งเชฟทีละชิ้นทีละก้าวแบบ for-loop",
      bullets: [
        "`select(...)` — เลือกเฉพาะคอลัมน์หรือสูตรใหม่ที่ต้องการ (เหมือน SQL `SELECT`)",
        "`with_columns(...)` — เพิ่มหรือแทนที่คอลัมน์โดยเก็บคอลัมน์เดิมไว้ครบ",
        "`filter(...)` — คัดเฉพาะแถวที่เงื่อนไขเป็นจริง (เหมือน SQL `WHERE`)",
        "`group_by(...).agg(...)` — จัดกลุ่มแล้วสรุปค่า เช่น `pl.len()`, `.mean()`, `.sum()`",
      ],
      code: {
        language: "python",
        filename: "expressions_intro.py",
        code: `import polars as pl

df = pl.DataFrame({
    "order_id": ["ORD-01", "ORD-02", "ORD-03", "ORD-04"],
    "category": ["electronics", "fashion", "electronics", "fashion"],
    "price_thb": [1200.0, 450.0, 800.0, 550.0],
    "qty": [2, 3, 1, 2],
    "status": ["paid", "paid", "refunded", "paid"],
})

summary = (
    df.filter(pl.col("status") == "paid")
    .with_columns((pl.col("price_thb") * pl.col("qty")).alias("revenue_thb"))
    .group_by("category")
    .agg(
        pl.len().alias("paid_orders"),
        pl.col("revenue_thb").sum().alias("total_revenue_thb"),
    )
    .sort("total_revenue_thb", descending=True)
)
print(summary)`,
        caption: "Expression สามารถต่อเป็นโซ่ (method chaining) อ่านจากบนลงล่างคล้ายคำสั่ง SQL",
      },
      whyTitle: "Why this matters — ทำไมไม่เขียน Python loop หรือ pandas ทุกงาน",
      whyParagraphs: [
        "เมื่อระบบ AI เริ่มเก็บ log การถาม-ตอบหรือทิกเก็ตลูกค้าหลักแสนถึงหลักล้านแถว การวนลูปด้วย Python ปกติอาจใช้เวลาเป็นนาที และ pandas แบบ Eager มักสร้างสำเนาตารางใน RAM หลายรอบจนเครื่องค้าง",
        "Expression ของ Polars บังคับให้เราคิดแบบเวกเตอร์/คอลัมน์ตั้งแต่แรก โค้ดจึงสั้น ชัดเจน ตรวจ {{schema}} ได้ง่าย และไม่มีบั๊กกวนใจแบบ `SettingWithCopyWarning` ที่เจอบ่อยใน pandas",
      ],
    },
    {
      id: "eager-vs-lazy",
      title: "2 · Eager vs Lazy Mode: วางแผน Query ก่อนค่อยอ่านไฟล์จริง",
      paragraphs: [
        "ในโหมด **Eager** (`pl.read_csv(...)` → `DataFrame`) ทุกบรรทัดจะรันทันทีที่ถูกเรียก ถ้าไฟล์มี 50 คอลัมน์และ 1 ล้านแถว แต่คุณต้องการแค่ 3 คอลัมน์ของหมวด `billing` โหมด Eager ก็ยังโหลดทั้ง 50 คอลัมน์ 1 ล้านแถวเข้า RAM ก่อนแล้วค่อยทิ้ง",
        "ในโหมด **Lazy** (`pl.scan_csv(...)` หรือ `df.lazy()` → `LazyFrame`) Polars จะยังไม่คำนวณทันที แต่เก็บขั้นตอนทั้งหมดไว้เป็น **Query Plan** จนกว่าคุณจะเรียก `.collect()` ณ จุดนั้นเอนจิน Query Optimizer จะจัดลำดับงานใหม่ให้เร็วและประหยัด RAM ที่สุด",
        "เทคนิคสำคัญสองอย่างที่เกิดขึ้นอัตโนมัติคือ **Predicate Pushdown** (ดันเงื่อนไข `filter` ลงไปกรองตั้งแต่ตอนอ่านไฟล์) และ **Projection Pushdown** (อ่านเฉพาะคอลัมน์ที่ปลายทางใช้จริง ไม่โหลดคอลัมน์อื่นเลย)",
      ],
      analogy:
        "โหมด Eager เหมือนขนหนังสือทั้งห้องสมุดมากองที่โต๊ะก่อนค่อยเลือกเล่มที่ต้องการ ส่วนโหมด Lazy เหมือนจดรายการค้นหาก่อน แล้วเดินไปหยิบเฉพาะเล่มที่ตรงเงื่อนไขจากชั้นวาง",
      code: {
        language: "python",
        filename: "lazy_plan_demo.py",
        code: `import polars as pl

# scan_csv สร้าง LazyFrame — ยังไม่อ่านไฟล์จริงจนกว่าจะเรียก .collect()
lazy_query = (
    pl.scan_csv("tickets.csv")
    .filter(pl.col("priority") == "high")
    .group_by("category")
    .agg(pl.col("response_min").mean().alias("avg_response_min"))
)

# ดูแผนที่ Polars ปรับปรุงให้แล้ว (จะเห็น PROJECT และ SELECTION ถูกดันลงไปที่ Csv SCAN)
print(lazy_query.explain())

# รันจริงเมื่อพร้อม
# result = lazy_query.collect()`,
        caption: "ใช้ `.explain()` ตรวจดูเสมอว่า filter และคอลัมน์ถูก pushdown ลงไปที่ขั้น SCAN แล้วจริง",
      },
      whyTitle: "Why this matters — รับมือข้อมูลโตโดยไม่ต้องรีบซื้อเครื่องใหญ่",
      whyParagraphs: [
        "ในงาน AI Engineering ไฟล์ชุดข้อมูลมักโตขึ้นทุกเดือน (เช่น chat logs, evaluation runs, คลังเอกสารหลายแสน chunk) การใช้ `scan_csv` / `scan_parquet` กับ `LazyFrame` ทำให้สคริปต์เดิมยังรันบนโน้ตบุ๊กหรือ container RAM น้อย ๆ ได้สบาย",
        "นอกจากนี้ยังมี `collect(engine=\"streaming\")` สำหรับข้อมูลที่ใหญ่กว่า RAM จริง ช่วยให้คุณยังไม่ต้องตั้งคลัสเตอร์ Spark ก่อนเวลาอันควร (ตรงตามเกณฑ์เลือกเครื่องมือของหลักสูตร)",
      ],
    },
    {
      id: "polars-schema-and-nulls",
      title: "3 · Strict Schema & Expression Safety: ป้องกันชนิดข้อมูลเพี้ยนเงียบ",
      paragraphs: [
        "เหมือนที่เราใช้ {{pydantic}} ตรวจ JSON ที่ขอบระบบ ในงานตารางเราก็ต้องคุม {{schema}} ของคอลัมน์ให้ชัด เพราะไฟล์ CSV จากระบบภายนอกมักมีค่าว่าง (`null`) หรือเลขที่ถูกอ่านเป็นสตริง (เช่น `\"15\"` แทน `15`)",
        "Polars มีชนิดข้อมูลเข้มงวด (`Int64`, `Float64`, `String`, `Boolean`) และไม่แอบแปลงชนิดปนกันในคอลัมน์เดียวเหมือน `object` dtype ของ pandas หากต้องแปลงชนิดเราสั่งชัดเจนด้วย `.cast(pl.Float64, strict=False)` และจัดการค่าว่างด้วย `.fill_null(...)` หรือ `.drop_nulls(...)`",
        "เวลาต้องการสร้างเงื่อนไขหลายกรณีในคอลัมน์เดียว ให้ใช้ `pl.when(...).then(...).otherwise(...)` แทนการเขียนฟังก์ชัน Python แล้วส่งเข้า `.map_elements(...)` เพราะ `pl.when` รันใน Rust เต็มความเร็ว",
      ],
      analogy:
        "เหมือนรางคัดแยกพัสดุอัตโนมัติในโกดัง — ถ้าใช้ `pl.when` พัสดุวิ่งบนสายพานความเร็วสูง แต่ถ้าใช้ `.map_elements` เหมือนหยิบพัสดุลงมาตรวจด้วยมือทีละกล่อง",
      bullets: [
        "ตรวจโครงสร้างตารางทันทีด้วย `df.schema` หรือ `lf.collect_schema()` (ไม่เสียเวลาอ่านข้อมูลทั้งหมด)",
        "ใช้ `pl.when(cond).then(a).otherwise(b).alias(\"col\")` สำหรับ logic แบบ if/else บนคอลัมน์",
        "หลีกเลี่ยง `.map_elements(...)` ยกเว้นไม่มี expression รองรับจริง ๆ เพราะจะดึงข้อมูลกลับมาทำงานบน Python single-thread",
      ],
      whyTitle: "Why this matters — เตรียมข้อมูลสะอาดก่อนเข้า ML และ LLM",
      whyParagraphs: [
        "ใน Day 34 เราจะเจาะลึกการล้างข้อมูลสกปรก (null, duplicate, วันที่ภาษาไทย, UTF-8) และใน Block B11–B12 เราจะป้อนตารางเข้าโมเดล ML ถ้าคอลัมน์ตัวเลขมีค่าว่างหรือชนิดข้อมูลผิดปนอยู่ โมเดลจะพังหรือให้ค่าทำนายเพี้ยนทันที",
        "การคุม schema ตั้งแต่ขั้น `scan_csv` ช่วยให้ปัญหาโผล่เร็ว (fail-fast) และแก้ที่ต้นทางได้ก่อนส่งต่อไปยัง {{duckdb}} หรือ scikit-learn",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Polars กับ SQL และ JS Array Methods",
      body: [
        "ถ้าคุณคุ้นเคยกับการเขียน SQL query หรือต่อ `.filter().map().reduce()` ใน TypeScript คุณจะอ่านโค้ด Polars ออกเกือบจะทันที ต่างกันแค่ Polars ทำทุกอย่างบนคอลัมน์แบบขนานและวางแผน query ก่อนรัน:",
      ],
      table: [
        ["pl.scan_csv('a.csv')", "เตรียม query ยังไม่ยิง (คล้าย ORM query builder ก่อน await)"],
        [".filter(pl.col('x') > 0)", "SQL WHERE x > 0 / Array.filter()"],
        [".with_columns(...)", "เพิ่มฟิลด์ใหม่ใน object โดยคงฟิลด์เดิมไว้"],
        [".group_by('k').agg(...)", "SQL GROUP BY k + SUM/AVG/COUNT"],
        [".collect()", "สั่ง execute query จริงและได้ผลลัพธ์"],
      ],
    },
    student: {
      title: "First-Year Note — DataFrame, CSV และ RAM เกี่ยวกันอย่างไร",
      body: [
        "ลองนึกว่า `DataFrame` คือชีต Excel ในหน่วยความจำ RAM ที่เราสั่งคำนวณด้วยโค้ดแทนการคลิกเมาส์ ส่วน `CSV` คือไฟล์ข้อความธรรมดาที่คั่นแต่ละช่องด้วยเครื่องหมายจุลภาค (`,`)",
        "ปัญหาของไฟล์ขนาดใหญ่คือถ้าใช้ `read_csv` อ่านทุกบรรทัดเข้า RAM ทีเดียว เครื่องอาจอืดหรือหน่วยความจำเต็ม การใช้ `scan_csv` (Lazy mode) จึงเหมือนบอกคอมพิวเตอร์ว่า 'อ่านเงื่อนไขให้จบก่อน แล้วค่อยดึงเฉพาะข้อมูลที่ต้องใช้เข้ามา'",
        "คำว่า **multi-threaded** หมายถึงการแบ่งงานให้หลายแกนประมวลผล (CPU cores) ช่วยกันทำพร้อมกัน ซึ่ง Polars จัดการให้เองเบื้องหลัง",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ทีมซัพพอร์ต e-commerce ไทยมีไฟล์ทิกเก็ตลูกค้า (`tickets.csv`) เราต้องการวิเคราะห์เฉพาะทิกเก็ตที่ปิดงานแล้ว (`status == \"closed\"`) เพื่อหาเวลาตอบกลับเฉลี่ยและอัตราที่ตอบช้ากว่า SLA (เกิน 30 นาที) แยกตามหมวดหมู่ เดินทีละขั้นดังนี้",
    steps: [
      {
        title: "1 · สร้างไฟล์ข้อมูลจำลองและตรวจ Schema",
        explain:
          "เริ่มจากเขียน CSV ตัวอย่างลงดิสก์ (ในงานจริงไฟล์นี้อาจใหญ่หลายร้อย MB) เพื่อให้ลอง `scan_csv` ได้เหมือนสถานการณ์จริง",
        code: {
          language: "python",
          filename: "worked_polars.py",
          code: `from pathlib import Path
import polars as pl

csv_text = """ticket_id,category,channel,status,response_min
T-001,billing,line,closed,12.0
T-002,billing,email,closed,45.0
T-003,delivery,line,closed,20.0
T-004,delivery,chat,open,50.0
T-005,delivery,email,closed,40.0
T-006,technical,chat,closed,15.0
"""
Path("tickets.csv").write_text(csv_text, encoding="utf-8")

lf = pl.scan_csv("tickets.csv")
print("Schema:", lf.collect_schema())`,
        },
        output: `Schema: Schema({'ticket_id': String, 'category': String, 'channel': String, 'status': String, 'response_min': Float64})`,
      },
      {
        title: "2 · เขียน Lazy Pipeline พร้อมเช็กแผนการทำงานด้วย .explain()",
        explain:
          "กรองเฉพาะ `status == \"closed\"`, สร้างคอลัมน์บูลีน `sla_breached` (`response_min > 30`), แล้วสรุปจำนวนทิกเก็ต เวลาเฉลี่ย และจำนวนที่เกิน SLA แยกตามหมวดหมู่ — สังเกตว่าคอลัมน์ `ticket_id` และ `channel` ไม่ถูกใช้เลย",
        code: {
          language: "python",
          filename: "worked_polars.py",
          code: `plan = (
    lf.filter(pl.col("status") == "closed")
    .with_columns((pl.col("response_min") > 30.0).alias("sla_breached"))
    .group_by("category")
    .agg(
        pl.len().alias("closed_count"),
        pl.col("response_min").mean().round(1).alias("avg_response_min"),
        pl.col("sla_breached").sum().alias("breach_count"),
    )
    .sort("avg_response_min", descending=True)
)

print(plan.explain())`,
        },
        output: `SORT BY [descending: [true]] [col("avg_response_min")]
  AGGREGATE[maintain_order: false]
    [len().alias("closed_count"), col("response_min").mean().round([1]).alias("avg_response_min"), col("sla_breached").sum().alias("breach_count")] BY [col("category")]
    FROM
     WITH_COLUMNS:
     [[(col("response_min")) > (30.0)].alias("sla_breached")]
      Csv SCAN [tickets.csv]
      PROJECT 3/5 COLUMNS
      SELECTION: [(col("status")) == ("closed")]`,
      },
      {
        title: "3 · สั่ง .collect() เพื่อคำนวณและแสดงตารางผลลัพธ์",
        explain:
          "ดูบรรทัดล่างของแผนในขั้นที่ 2: `PROJECT 3/5 COLUMNS` (อ่านแค่ `category`, `status`, `response_min` ไม่อ่าน `ticket_id` กับ `channel`) และ `SELECTION` กรอง `closed` ตั้งแต่ตอนสแกนไฟล์ เมื่อเรียก `.collect()` จะได้ `DataFrame` พร้อมใช้งาน",
        code: {
          language: "python",
          filename: "worked_polars.py",
          code: `result = plan.collect()
print(result)`,
        },
        output: `shape: (3, 4)
┌───────────┬──────────────┬──────────────────┬──────────────┐
│ category  ┆ closed_count ┆ avg_response_min ┆ breach_count │
│ ---       ┆ ---          ┆ ---              ┆ ---          │
│ str       ┆ u32          ┆ f64              ┆ u32          │
╞═══════════╪══════════════╪══════════════════╪══════════════╡
│ delivery  ┆ 2            ┆ 30.0             ┆ 1            │
│ billing   ┆ 2            ┆ 28.5             ┆ 1            │
│ technical ┆ 1            ┆ 15.0             ┆ 0            │
└───────────┴──────────────┴──────────────────┴──────────────┘`,
      },
    ],
    gotcha:
      "จุดสังเกต: `group_by` ใน Polars ไม่การันตีลำดับแถวของผลลัพธ์ (เพราะรันแบบ multi-threaded) ถ้าต้องเปรียบเทียบในเทสต์หรือแสดงผลให้คงที่ ให้ปิดท้ายด้วย `.sort(...)` เสมอ",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างฟังก์ชัน `summarize_thai_orders(csv_path: str | Path) -> pl.DataFrame` ด้วย Polars **Lazy mode** เพื่อสรุปยอดขายคำสั่งซื้อ e-commerce ไทยที่ชำระเงินแล้วแยกตามจังหวัด",
    requirements: [
      "อ่านไฟล์ด้วย `pl.scan_csv(csv_path)` (Lazy mode) ห้ามใช้ `pl.read_csv` เพื่อให้เกิด Projection & Predicate Pushdown",
      "กรองเฉพาะแถวที่ `status == \"paid\"` และตัดแถวที่ `unit_price_thb` หรือ `qty` เป็น `null` ออก",
      "คำนวณคอลัมน์ `line_total_thb = unit_price_thb * qty` ด้วย `with_columns`",
      "จัดกลุ่มตาม `province` แล้วสรุป 3 คอลัมน์: `order_count` (จำนวนแถว), `total_revenue_thb` (ผลรวมปัด 2 ตำแหน่ง), `avg_order_thb` (ค่าเฉลี่ยต่อแถวปัด 2 ตำแหน่ง)",
      "เรียงลำดับตาม `total_revenue_thb` จากมากไปน้อย (ถ้าเท่ากันให้เรียง `province` จากน้อยไปมาก) แล้วเรียก `.collect()` คืน `pl.DataFrame`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day33.py",
      code: `from pathlib import Path
import polars as pl


def build_orders_plan(csv_path: str | Path) -> pl.LazyFrame:
    """สร้าง LazyFrame query plan สำหรับสรุปยอดขายที่ชำระเงินแล้วรายจังหวัด"""
    # TODO: ใช้ pl.scan_csv(csv_path) -> filter -> with_columns -> group_by -> agg -> sort
    raise NotImplementedError


def summarize_thai_orders(csv_path: str | Path) -> pl.DataFrame:
    """รัน LazyFrame plan แล้วคืน DataFrame ผลลัพธ์"""
    return build_orders_plan(csv_path).collect()
`,
    },
    verification: {
      language: "python",
      filename: "test_day33.py",
      code: `from pathlib import Path
import polars as pl
import pytest
from exercise_day33 import build_orders_plan, summarize_thai_orders


@pytest.fixture
def sample_csv(tmp_path: Path) -> Path:
    data = """order_id,province,status,unit_price_thb,qty,note
O-1,Bangkok,paid,500.0,2,ส่งด่วน
O-2,Bangkok,paid,300.0,1,ปกติ
O-3,Bangkok,cancelled,900.0,1,ลูกค้ายกเลิก
O-4,ChiangMai,paid,400.0,2,
O-5,ChiangMai,paid,,3,ราคาหาย
O-6,Phuket,paid,800.0,1,ส่งด่วน
"""
    p = tmp_path / "orders.csv"
    p.write_text(data, encoding="utf-8")
    return p


def test_uses_lazy_pushdown(sample_csv: Path):
    lf = build_orders_plan(sample_csv)
    assert isinstance(lf, pl.LazyFrame)
    plan_text = lf.explain()
    assert "PROJECT" in plan_text
    assert "SELECTION" in plan_text


def test_summary_values_and_order(sample_csv: Path):
    df = summarize_thai_orders(sample_csv)
    assert df.columns == [
        "province",
        "order_count",
        "total_revenue_thb",
        "avg_order_thb",
    ]
    rows = df.to_dicts()
    assert len(rows) == 3

    # Bangkok: (500*2 + 300*1) = 1300.0, count=2, avg=650.0
    assert rows[0]["province"] == "Bangkok"
    assert rows[0]["order_count"] == 2
    assert rows[0]["total_revenue_thb"] == pytest.approx(1300.0)
    assert rows[0]["avg_order_thb"] == pytest.approx(650.0)

    # ChiangMai vs Phuket: ทั้งคู่ 800.0 -> เรียง province น้อยไปมาก (ChiangMai ก่อน Phuket)
    assert rows[1]["province"] == "ChiangMai"
    assert rows[1]["order_count"] == 1
    assert rows[2]["province"] == "Phuket"
    assert rows[2]["total_revenue_thb"] == pytest.approx(800.0)
`,
    },
    selfCheck: [
      "`build_orders_plan` คืน `pl.LazyFrame` และใน `.explain()` มีทั้ง `PROJECT` (ไม่อ่าน `order_id`, `note`) และ `SELECTION`",
      "แถวที่ `status == \"cancelled\"` และแถวที่ `unit_price_thb` เป็นค่าว่างถูกตัดออกก่อนคำนวณยอดรวม",
      "ชื่อคอลัมน์ผลลัพธ์ตรงเป๊ะ 4 คอลัมน์: `province`, `order_count`, `total_revenue_thb`, `avg_order_thb`",
      "เมื่อ `total_revenue_thb` เท่ากัน (ChiangMai กับ Phuket) เรียงชื่อจังหวัดจาก A→Z อย่างคงที่ทุกครั้งที่รัน",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมดโดยไม่มี warning",
    ],
    acceptance: "ผ่านทั้ง 2 test functions ใน `test_day33.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "แยกส่วนสร้างแผน (`build_orders_plan`) ออกจาก `.collect()` เพื่อให้เทสต์ตรวจ `.explain()` ได้ และอย่าลืมกรองทั้งเงื่อนไข `status == \"paid\"` กับเงื่อนไขไม่เป็น null ก่อนคูณราคาและจำนวน",
      },
      {
        body: "ใน Polars ใช้ `pl.col(\"unit_price_thb\").is_not_null()` หรือ `.drop_nulls(subset=[\"unit_price_thb\", \"qty\"])`, ใช้ `pl.len().alias(\"order_count\")`, และเรียงหลายคอลัมน์ด้วย `.sort([\"total_revenue_thb\", \"province\"], descending=[True, False])`",
      },
      {
        body: "โครงของ `build_orders_plan` เกือบสมบูรณ์ — เหลือเติม expression ใน `.agg(...)` และ `.sort(...)` แล้วลองรันเทสต์:",
        code: {
          language: "python",
          filename: "hint_day33.py",
          code: `def build_orders_plan(csv_path: str | Path) -> pl.LazyFrame:
    return (
        pl.scan_csv(csv_path)
        .filter(
            (pl.col("status") == "paid")
            & pl.col("unit_price_thb").is_not_null()
            & pl.col("qty").is_not_null()
        )
        .with_columns(
            (pl.col("unit_price_thb") * pl.col("qty")).alias("line_total_thb")
        )
        .group_by("province")
        .agg(
            pl.len().alias("order_count"),
            pl.col("line_total_thb").sum().round(2).alias("total_revenue_thb"),
            # TODO: เติม avg_order_thb (mean ปัด 2 ตำแหน่ง)
        )
        # TODO: เติม .sort(["total_revenue_thb", "province"], descending=[True, False])
    )`,
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
      title: "ลืม .alias() ตอนสร้างคอลัมน์ใหม่ใน with_columns หรือ agg",
      symptom: "คอลัมน์ใหม่ไปทับชื่อคอลัมน์ต้นทาง (เช่น `unit_price_thb` ถูกเขียนทับด้วยผลคูณ) หรือเกิด `DuplicateError` เมื่อสรุปคอลัมน์เดียวกันสองแบบ (`sum` กับ `mean`)",
      fix: "ใส่ `.alias(\"ชื่อคอลัมน์ใหม่\")` เสมอทุกครั้งที่คำนวณสูตรหรือสรุปค่าใน `with_columns` และ `agg`",
    },
    {
      title: "ใช้ Python `and` / `or` แทน `&` / `|` ใน filter",
      symptom: "เกิด `TypeError: the truth value of an Expr is ambiguous` เมื่อเขียน `filter(pl.col('a') > 0 and pl.col('b') > 0)`",
      fix: "ใช้ตัวดำเนินการระดับ expression คือ `&`, `|`, `~` พร้อมใส่วงเล็บครอบแต่ละเงื่อนไข เช่น `(pl.col('a') > 0) & (pl.col('b') > 0)` หรือส่งหลายเงื่อนไขคั่นด้วยคอมมาใน `.filter(cond1, cond2)`",
    },
    {
      title: "เรียก .collect() เร็วเกินไปตั้งแต่ต้น pipeline",
      symptom: "เขียน `pl.scan_csv(...).collect().filter(...)` ทำให้ Polars โหลดทุกคอลัมน์ทุกแถวเข้า RAM ก่อนจะกรอง เสียประโยชน์ของ Lazy mode ไปทั้งหมด",
      fix: "ต่อ `filter`, `with_columns`, `group_by`, `select`, `sort` ให้ครบทั้ง pipeline ก่อน แล้วค่อยเรียก `.collect()` เพียงครั้งเดียวที่ปลายทาง",
    },
    {
      title: "ไม่ใส่ .sort() หลัง group_by แล้วเทสต์ผ่านบ้างพังบ้าง",
      symptom: "รันเทสต์รอบแรกลำดับจังหวัดตรง แต่รันอีกรอบลำดับสลับจน assert ล้มเหลว",
      fix: "`group_by` ทำงานแบบขนานหลาย thread จึงไม่รักษาลำดับเดิม ให้ใส่ `.sort(...)` ปิดท้ายเสมอเมื่อลำดับแถวมีความหมาย",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d033-q1",
        "ข้อใดอธิบายประโยชน์หลักของ `pl.scan_csv(...)` (Lazy mode) เทียบกับ `pl.read_csv(...)` (Eager mode) ได้ถูกต้องที่สุด?",
        [
          ["Lazy mode แปลงไฟล์ CSV เป็นฐานข้อมูล PostgreSQL ให้อัตโนมัติ", "ไม่จริง — Polars อ่านไฟล์ CSV/Parquet โดยตรง ไม่ได้ตั้งเซิร์ฟเวอร์ฐานข้อมูล"],
          ["Lazy mode วางแผน query ก่อนรันจริง ทำให้ทำ Predicate & Projection Pushdown อ่านเฉพาะคอลัมน์และแถวที่จำเป็น", "ถูก — ช่วยลดทั้งเวลาอ่านดิสก์และปริมาณ RAM ที่ต้องใช้ลงอย่างมาก"],
          ["Lazy mode ทำให้ไม่ต้องใส่ชื่อคอลัมน์เวลาเขียน `filter`", "ไม่เกี่ยวกัน — เรายังต้องระบุ `pl.col(...)` ตามปกติ"],
          ["Lazy mode ใช้ได้เฉพาะไฟล์ที่มีไม่เกิน 10,000 แถวเท่านั้น", "ตรงกันข้าม — Lazy mode ยิ่งเห็นผลชัดเจนเมื่อไฟล์ใหญ่ขึ้น"],
        ],
        "B",
        "เมื่อใช้ `LazyFrame` เอนจินของ Polars จะเห็นภาพรวมทั้ง query ก่อนเรียก `.collect()` จึงดันเงื่อนไข `filter` และรายการคอลัมน์ที่ต้องใช้ลงไปตั้งแต่ขั้นอ่านไฟล์ได้",
        "Predicate Pushdown และ Projection Pushdown ใน Polars Lazy mode คืออะไร?",
        "Predicate Pushdown คือดัน `filter` ลงไปกรองตั้งแต่ตอนอ่านไฟล์ ส่วน Projection Pushdown คืออ่านเฉพาะคอลัมน์ที่ปลายทางใช้จริง เพื่อประหยัด RAM และเวลา",
      ),
      mc(
        "d033-q2",
        "หากต้องการกรองแถวที่ `status == \"paid\"` **และ** `qty >= 2` ใน Polars ข้อใดเขียนได้ถูกต้อง?",
        [
          ["`df.filter(pl.col(\"status\") == \"paid\" and pl.col(\"qty\") >= 2)`", "ผิด — `and` ของ Python ใช้กับ Expression ไม่ได้ จะโยน `TypeError`"],
          ["`df.filter((pl.col(\"status\") == \"paid\") & (pl.col(\"qty\") >= 2))`", "ถูก — ใช้ `&` พร้อมวงเล็บครอบแต่ละเงื่อนไข (หรือคั่นด้วยคอมมาใน `.filter(c1, c2)`)"],
          ["`df.select(pl.col(\"status\") == \"paid\", pl.col(\"qty\") >= 2)`", "ผิด — `.select()` คืนตารางคอลัมน์บูลีน ไม่ได้กรองแถวออก"],
          ["`df.with_columns(status=\"paid\", qty=2)`", "ผิด — นี่ไม่ใช่การกรอง และ syntax แบบนี้ไม่ถูกต้องใน Polars"],
        ],
        "B",
        "ใน Polars Expression ต้องใช้ `&` (และ), `|` (หรือ), `~` (นิเสธ) พร้อมวงเล็บครอบแต่ละเงื่อนไข หรือส่งหลายเงื่อนไขคั่นด้วยคอมมาเข้า `.filter(cond1, cond2)`",
        "ทำไมห้ามใช้ `and` / `or` ของ Python ใน `df.filter(...)` ของ Polars และควรเขียนอย่างไร?",
        "เพราะ Expression ไม่ใช่ bool เดี่ยว ๆ จะเกิด `TypeError` ให้ใช้ `&` / `|` พร้อมวงเล็บ หรือคั่นเงื่อนไขด้วยคอมมาใน `.filter(cond1, cond2)`",
      ),
      mc(
        "d033-q3",
        "เมื่อเขียน `df.group_by(\"category\").agg(pl.col(\"price\").sum(), pl.col(\"price\").mean())` จะเกิดอะไรขึ้น?",
        [
          ["Polars ตั้งชื่อคอลัมน์เป็น `price_sum` และ `price_mean` ให้อัตโนมัติ", "ไม่ — Polars ไม่เปลี่ยนชื่อให้เอง ทั้งสอง expression ยังคงใช้ชื่อต้นทางว่า `price`"],
          ["เกิด `DuplicateError` เพราะคอลัมน์ผลลัพธ์ทั้งสองตัวมีชื่อว่า `price` ซ้ำกัน", "ถูก — ต้องต่อท้ายด้วย `.alias(\"total_price\")` และ `.alias(\"avg_price\")`"],
          ["คอลัมน์ที่สองจะถูกข้ามไปเงียบ ๆ", "Polars ยึดหลัก fail-fast จะไม่ทิ้งคอลัมน์ของคุณเงียบ ๆ"],
          ["ทำงานได้ปกติและคืนตารางที่มีคอลัมน์ชื่อ `price` ซ้ำกัน 2 คอลัมน์", "DataFrame ไม่อนุญาตให้มีชื่อคอลัมน์ซ้ำกัน"],
        ],
        "B",
        "ชื่อของ Expression ใน Polars สืบทอดมาจากคอลัมน์ตั้งต้น (`pl.col(\"price\")`) เสมอ หากคำนวณหลายค่าจากคอลัมน์เดียวกันต้องใช้ `.alias(...)` ตั้งชื่อใหม่ให้ไม่ซ้ำ",
        "ทำไม `agg(pl.col(\"x\").sum(), pl.col(\"x\").mean())` จึงพัง และแก้อย่างไร?",
        "เกิด `DuplicateError` เพราะผลลัพธ์ทั้งคู่ใช้ชื่อคอลัมน์เดิม `x` ซ้ำกัน → ต้องใส่ `.alias(...)` ตั้งชื่อใหม่ให้แต่ละคอลัมน์",
      ),
      mc(
        "d033-q4",
        "เหตุใดจึงควรหลีกเลี่ยง `.map_elements(python_func)` ใน Polars เมื่อสามารถเขียนด้วย `pl.when(...).then(...).otherwise(...)` แทนได้?",
        [
          ["`.map_elements` ไม่รองรับภาษาไทย (UTF-8)", "ไม่จริง — มันรองรับ UTF-8 แต่ติดคอขวดเรื่องความเร็ว"],
          ["`.map_elements` ดึงข้อมูลทีละค่ากลับมาประมวลผลใน Python single-thread ทำให้ช้ากว่า Expression ที่รันแบบ parallel ใน Rust หลายสิบเท่า", "ถูก — การคง logic ไว้ใน Polars Expression ช่วยให้รันใน Rust ด้วย multi-threading และ optimize แผนได้"],
          ["`pl.when` ใช้ได้เฉพาะในโหมด Eager เท่านั้น", "ไม่จริง — `pl.when` ใช้ได้ทั้ง Eager และ Lazy mode"],
          ["`.map_elements` ลบคอลัมน์อื่นใน DataFrame ทิ้งทั้งหมด", "ไม่จริง — มันแค่แปลงคอลัมน์ที่ระบุ แต่ช้ามากเมื่อแถวเยอะ"],
        ],
        "B",
        "กฎเหล็กของ Polars คือพยายามเขียนทุกอย่างด้วย native Expressions (`pl.col`, `pl.when`, `.str.*`, `.dt.*`) เพื่อให้งานทั้งหมดอยู่ใน Rust engine แบบขนาน",
        "เมื่อไรควรใช้ `pl.when().then().otherwise()` แทน `.map_elements()` ใน Polars?",
        "ใช้ `pl.when` เสมอเมื่อทำเงื่อนไข if/else เพราะรันแบบ parallel ใน Rust ส่วน `.map_elements` วนใน Python single-thread ทำให้ช้าลงหลายสิบเท่า",
      ),
    ],
  },

  takeaways: [
    "คิดแบบ **Expression-first**: ใช้ `pl.col`, `filter`, `with_columns`, `group_by().agg()` แล้วใส่ `.alias(...)` ตั้งชื่อคอลัมน์ใหม่ให้ชัดเสมอ",
    "เริ่มต้นด้วย **Lazy mode** (`pl.scan_csv` / `scan_parquet`) เพื่อได้ Predicate & Projection Pushdown อัตโนมัติ และตรวจแผนด้วย `.explain()` ก่อน `.collect()`",
    "ใส่ `.sort(...)` ปิดท้ายหลัง `group_by` เพื่อให้ลำดับผลลัพธ์คงที่ทุกครั้งที่รันหรือเขียนเทสต์",
    "เก็บ logic ให้อยู่ใน native Expression (`pl.when`, `.str`, `.is_not_null`) แทนการวนลูป Python หรือ `.map_elements`",
  ],

  reviewCards: [
    rc(
      "d033-rc-1",
      "`pl.read_csv()` กับ `pl.scan_csv()` ต่างกันอย่างไร และ `.explain()` ช่วยเช็กอะไร?",
      "`read_csv` อ่านทั้งไฟล์เข้า RAM ทันที (Eager) ส่วน `scan_csv` สร้าง `LazyFrame` เพื่อวางแผน query ก่อน `.collect()`; `.explain()` ใช้ตรวจว่าเกิด `PROJECT` (อ่านเฉพาะคอลัมน์ที่ใช้) และ `SELECTION` (กรองตั้งแต่ตอนสแกนไฟล์) แล้วจริง",
    ),
    rc(
      "d033-rc-2",
      "สรุปความต่างระหว่าง `.select(...)` กับ `.with_columns(...)` ใน Polars?",
      "`.select()` คืนเฉพาะคอลัมน์หรือสูตรที่ระบุ ส่วน `.with_columns()` เพิ่มหรือแทนที่คอลัมน์ใหม่โดยคงคอลัมน์เดิมทั้งหมดไว้",
    ),
    rc(
      "d033-rc-3",
      "ทำไมหลัง `group_by().agg()` ใน Polars จึงควรต่อท้ายด้วย `.sort(...)`?",
      "เพราะ Polars ทำ `group_by` แบบ multi-threaded จึงไม่การันตีลำดับแถวของผลลัพธ์ การใส่ `.sort()` ทำให้ผลลัพธ์ deterministic และเทสต์ผ่านสม่ำเสมอ",
    ),
  ],

  sources: [
    { label: "Polars User Guide — Expressions & Contexts", href: "https://docs.pola.rs/user-guide/concepts/expressions-and-contexts/" },
    { label: "Polars User Guide — Lazy API & Query Optimization", href: "https://docs.pola.rs/user-guide/lazy/" },
    { label: "Polars API Reference — LazyFrame.explain", href: "https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.explain.html" },
  ],

  glossary: [
    "polars",
    "duckdb",
    "schema",
    "jsonl",
    "pydantic",
    "uv",
    "pytest",
  ],
});
