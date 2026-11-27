import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D034 — Phase 2 / Block B09
 * Cleaning Dirty Real-World Data (Nulls, Duplicates, Thai Dates/UTF-8)
 */
export const d034: Lesson = defineLesson({
  day: 34,
  titleTh: "ทำความสะอาดข้อมูลไทยสกปรก: Nulls, Duplicates, UTF-8 และวันที่ พ.ศ.",
  tagline: "30 นาที · รันบน CPU เครื่องคุณ 100% ไม่ต้องใช้ API key · ล้าง BOM, ช่องว่างล่องหน, sentinel nulls, ข้อมูลซ้ำ และแปลง พ.ศ. → ค.ศ. ใน Polars",
  icon: "filter",
  visual: {
    id: "dirty-data-clean",
    title: "ทำความสะอาดข้อมูลไทยสกปรก: Nulls, Duplicates & พ.ศ. → ค.ศ.",
    caption: "กดสลับระหว่างข้อมูลดิบที่เลอะเทอะกับตารางสะอาดหลังล้างช่องว่าง UTF-8, deduplicate และแปลงวันที่ พ.ศ.",
    alt: "แผนภาพเปรียบเทียบข้อมูลไทยดิบกับข้อมูลที่ทำความสะอาดแล้วใน Polars",
  },
  requiresApiKey: false,
  tools: ["Polars", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ล้างข้อมูลดิบให้ตรง Data Contract ก่อนเข้าทุกปลายทาง",
      body: "ไฟล์ CSV ที่ส่งออกจาก Excel, ERP หรือระบบหน้าร้านไทยแทบไม่เคยสะอาด: มีอักขระ BOM ที่หัวคอลัมน์, ช่องว่างล่องหน (zero-width space), คำว่า `\"N/A\"` หรือ `\"ไม่ระบุ\"` ปนกับค่าว่าง, แถวซ้ำจากการกดส่งเบิ้ล และวันที่ปี พ.ศ. (`2569`) ปะปนกับ ค.ศ. (`2026`)",
      lessonNote: "วันนี้เราสร้าง cleaning pipeline ใน {{polars}} ที่บังคับ {{data-contract}} และ {{schema}} ให้สะอาดก่อนส่งต่อทุกขั้น",
    },
    {
      node: 2,
      heading: "ป้องกัน Garbage-In, Garbage-Out ก่อนเทรนโมเดล",
      body: "ถ้าคำว่า `\"กรุงเทพฯ \"` กับ `\"กรุงเทพฯ\"` (ต่างกันแค่ช่องว่างท้ายคำ) ถูกแยกเป็น 2 หมวดหมู่ หรือยอดสั่งซื้อถูกนับเบิ้ลจากแถวซ้ำ โมเดล ML และรายงานธุรกิจจะเรียนรู้สัญญาณผิดทันที",
      lessonNote: "เราทำ string normalization และ `.unique(subset=..., keep=\"last\")` บนคอลัมน์ที่เรียงลำดับแล้วเพื่อให้ผลลัพธ์คงที่ทุกครั้ง",
    },
    {
      node: 3,
      heading: "ตรวจสุขภาพข้อมูล (Data-Quality Audit) แบบอัตโนมัติ",
      body: "วิศวกรข้อมูลไม่เดาด้วยตาเปล่าว่าไฟล์สะอาดแล้ว แต่สร้างรายงาน audit ที่นับจำนวน `null`, แถวซ้ำ, วันที่แปลงไม่ได้ และราคาติดลบ พร้อมเขียน {{pytest}} คอยกัน regression",
      lessonNote: "แบบฝึกหัดวันนี้สร้างทั้งฟังก์ชัน `clean_thai_orders` และ `audit_data_quality` เพื่อจับข้อมูลพังแบบ {{fail-fast}}",
    },
  ],

  objectives: [
    "**ล้างอักขระขยะ UTF-8 และมาตรฐานสตริง** (BOM `\\ufeff`, zero-width space `\\u200b`, non-breaking space `\\u00a0`, ช่องว่างหัว-ท้าย) ด้วย Polars `.str` Expressions โดยไม่หลุดไปใช้ Python loop",
    "**แยกแยะและจัดการค่าว่างอย่างถูกต้อง** ระหว่าง `null` จริง, สตริงว่าง `\"\"`, และ sentinel values (`\"N/A\"`, `\"-\"`, `\"ไม่ระบุ\"`) พร้อมแปลงสตริงตัวเลขปนลูกน้ำ/สกุลเงินอย่างปลอดภัย",
    "**แปลงวันที่ปี พ.ศ. (`2569`) เป็น ค.ศ. (`2026`) และตัดแถวซ้ำอย่างมีหลักการ** ด้วย `pl.date(...)` ที่ไม่พังวันอธิกสุรทิน (29 ก.พ. 2567) และ `.sort(...).unique(subset=..., keep=\"last\")`",
  ],

  prerequisites: [
    "ผ่าน Day 33 พื้นฐาน {{polars}} Expressions (`pl.col`, `with_columns`, `filter`, `pl.when`) และ `LazyFrame`",
    "เข้าใจแนวคิด {{schema}} และ {{validation}} จาก Phase 1",
    "มี {{uv}}, `polars`, `pytest` และ `ruff` พร้อมใช้งานบนเครื่อง",
    "รันบน CPU เครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์โปรเจกต์สำหรับ Day 34 ด้วย {{uv}} และติดตั้ง {{polars}} พร้อมเครื่องมือทดสอบ `pytest` และ `ruff`",
    commands: `uv init ai-day34 && cd ai-day34
uv add polars
uv add --dev pytest ruff
uv run python -c "import polars as pl; print('Polars ready:', pl.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day34` ด้วย `uv init` สำเร็จ"],
      ["deps", "ติดตั้ง `polars` และ dev tools (`pytest`, `ruff`) ผ่าน `uv add`"],
      ["verify", "รันคำสั่งตรวจเวอร์ชันแล้วเห็น `Polars ready: 1.x`"],
    ],
    note: "ไฟล์ตัวอย่างในบทนี้ใช้ UTF-8 รวมทั้งกรณีจำลอง BOM และ zero-width space บนเครื่องของคุณโดยไม่ต้องเชื่อมต่ออินเทอร์เน็ต",
  },

  concepts: [
    {
      id: "utf8-bom-and-invisible-chars",
      title: "1 · ขยะ UTF-8 ในข้อมูลไทย: BOM, Zero-Width Space และช่องว่างหลอกตา",
      paragraphs: [
        "ข้อมูลจาก Excel (\"CSV UTF-8\") หรือข้อความที่พนักงานก๊อปปี้จาก LINE/เว็บเบราว์เซอร์มักพก **อักขระล่องหน** ติดมาด้วย 3 ตัวร้าย: **UTF-8 BOM** (`\\ufeff`) ที่เกาะหน้าชื่อคอลัมน์แรกจน `pl.col(\"order_id\")` หาไม่เจอ, **Zero-Width Space** (`\\u200b`) ที่ใช้ช่วยตัดบรรทัดภาษาไทยในเว็บ และ **Non-Breaking Space** (`\\u00a0`) ที่หน้าตาเหมือนช่องว่างปกติแต่ `.strip_chars()` เปล่า ๆ ไม่ได้ลบออก",
        "ผลลัพธ์คือในสายตามนุษย์ `\"เชียงใหม่\"` กับ `\"เชียง\\u200bใหม่ \"` ดูเหมือนกันเป๊ะ แต่เวลาทำ `group_by(\"province\")` หรือ `join` ระบบจะแยกเป็น 2 จังหวัดคนละบรรทัดทันที",
        "ใน {{polars}} เราจัดการเรื่องนี้ด้วย native Expression 100%: ล้างชื่อคอลัมน์ด้วย `.rename(lambda c: c.lstrip(\"\\ufeff\").strip())` และล้างค่าในคอลัมน์สตริงด้วย `.str.replace_all(...)` ต่อด้วย `.str.strip_chars()` ซึ่งรันใน Rust ได้หลายแสนแถวต่อวินาที",
      ],
      analogy:
        "เหมือนการติดป้ายชื่อกล่องในโกดังด้วยหมึกที่มองไม่เห็น — สายตาคนอ่านว่า 'เชียงใหม่' เหมือนกัน แต่เครื่องสแกนบาร์โค้ดอ่านรหัสไม่ตรงกันจนแยกกองผิดชั้น",
      bullets: [
        "ล้างชื่อคอลัมน์ทุกครั้งหลังโหลด CSV: `.rename(lambda c: c.lstrip(\"\\ufeff\").strip())`",
        "ลบ `\\u200b` และ `\\ufeff` ออกจากเนื้อหาสตริง และแปลง `\\u00a0` / ช่องว่างซ้อนหลายตัวให้เหลือช่องว่างเดียวก่อน `.str.strip_chars()`",
        "ใน Polars 1.x ใช้ `.str.strip_chars()` (ไม่ใช่ `.str.strip()` แบบ pandas)",
      ],
      code: {
        language: "python",
        filename: "clean_utf8_demo.py",
        code: `import polars as pl

raw = pl.DataFrame({
    "\\ufefforder_id": [" ORD-01 ", "ORD-02\\u200b"],
    "province": ["กรุงเทพฯ\\u00a0 ", "กรุง\\u200bเทพฯ"],
})

clean = (
    raw.rename(lambda c: c.lstrip("\\ufeff").strip())
    .with_columns(
        pl.col(pl.String)
        .str.replace_all(r"[\\u200b\\ufeff]+", "")
        .str.replace_all(r"[\\u00a0\\s]+", " ")
        .str.strip_chars()
    )
)
print("Columns:", clean.columns)
print("Unique provinces:", clean["province"].n_unique())
print(clean)`,
        caption: "`pl.col(pl.String)` ช่วยใช้สูตรทำความสะอาดกับทุกคอลัมน์ที่เป็นสตริงพร้อมกันในครั้งเดียว",
      },
      whyTitle: "Why this matters — บั๊กเงียบที่ทำให้รายงานและ ML Group ผิด",
      whyParagraphs: [
        "บั๊กจากอักขระล่องหนอันตรายเพราะโปรแกรม **ไม่โยน error** แต่จะแยกกลุ่มข้อมูลที่ควรเป็นกลุ่มเดียวกันออกเป็นหลายแถว ทำให้ยอดขายรายจังหวัดเพี้ยน หรือทำให้ one-hot encoder สร้างฟีเจอร์ซ้ำซ้อน",
        "การเขียนกฎ normalize สตริงไว้เป็นขั้นแรกของทุก pipeline จึงเป็นเกราะป้องกันพื้นฐานของงาน Data Engineering ภาษาไทย",
      ],
    },
    {
      id: "nulls-sentinels-and-coercion",
      title: "2 · `null` vs `\"\"` vs `\"N/A\"` และการแปลงชนิดข้อมูลอย่างปลอดภัย",
      paragraphs: [
        "ในข้อมูลดิบ ค่าที่หายไปไม่ได้มาเป็น `null` เสมอไป บางระบบส่งเป็นสตริงว่าง `\"\"`, บางฟอร์มใส่ `\"N/A\"`, `\"-\"`, `\"NULL\"` หรือคำไทยอย่าง `\"ไม่ระบุ\"` ซึ่งถ้าปล่อยค้างไว้ Polars จะมองทั้งคอลัมน์ราคาเป็น `String` แทน `Float64` และไม่สามารถหาผลรวมหรือค่าเฉลี่ยได้",
        "แนวทางที่เป็นระบบมี 2 ชั้น: (1) ระบุ `null_values=[\"\", \"N/A\", \"n/a\", \"-\", \"null\", \"NULL\", \"ไม่ระบุ\"]` ตั้งแต่ตอน `pl.scan_csv(...)` เพื่อแปลงเป็น `null` ทันทีตอนอ่านไฟล์ และ (2) หลัง strip ช่องว่างแล้ว ให้แปลงค่าสตริงที่เป็น sentinel (เช่น `\"  -  \"` ที่ตอนแรกมีช่องว่างหุ้มอยู่) ให้กลายเป็น `None` ด้วย `pl.when(...).then(None).otherwise(...)`",
        "สำหรับคอลัมน์ตัวเลขที่ปนลูกน้ำหรือหน่วยเงิน (เช่น `\"1,250.50 บาท\"`) ให้ลบอักขระที่ไม่ใช่ตัวเลข/จุดทศนิยมออกก่อน แล้วแปลงชนิด ({{coercion}}) ด้วย `.cast(pl.Float64, strict=False)` — ค่าที่แปลงไม่ได้จะกลายเป็น `null` อย่างโปร่งใสเพื่อให้ขั้น audit ตรวจนับได้แทนที่จะพังกลางไฟล์",
      ],
      analogy:
        "เหมือนการคัดแยกใบเสร็จก่อนลงบัญชี: ใบที่เขียนว่า '-', 'N/A' หรือ 'ไม่ระบุ' ล้วนแปลว่า 'ไม่มีตัวเลข' ต้องจัดเข้ากอง 'ข้อมูลว่าง (null)' กองเดียวกันทั้งหมด ไม่ใช่เอาไปปนกับตัวเลขจริง",
      bullets: [
        "แยกความต่างให้ชัด: `null` แปลว่า *ไม่ทราบค่า/ไม่มีข้อมูล* ส่วน `0` แปลว่า *ค่าเป็นศูนย์จริง ๆ* — อย่าเผลอ `.fill_null(0)` กับคอลัมน์ราคาโดยไม่คิด เพราะจะดึงค่าเฉลี่ยให้ต่ำหลอกตา!",
        "ใช้ `.cast(pl.Float64, strict=False)` เมื่อล้างข้อมูลดิบ และตามด้วยการตรวจ `null_count()` เสมอเพื่อไม่ให้ข้อมูลพังหายไปเงียบ ๆ",
        "หลังล้างแล้วให้กรองหรือแยกแถวที่ละเมิดกฎธุรกิจ (เช่น `price <= 0`) ออกไปลงตาราง quarantine/audit",
      ],
      code: {
        language: "python",
        filename: "null_sentinels_demo.py",
        code: `import polars as pl

SENTINELS = ["", "n/a", "na", "-", "null", "none", "ไม่ระบุ"]

df = pl.DataFrame({
    "order_id": ["O-1", "O-2", "O-3", "O-4"],
    "price_raw": ["1,250.50 บาท", "  N/A ", "ไม่ระบุ", "490"],
})

cleaned = df.with_columns(
    pl.col("price_raw")
    .str.strip_chars()
    .pipe(
        lambda s: pl.when(s.str.to_lowercase().is_in(SENTINELS))
        .then(None)
        .otherwise(s)
    )
    .str.replace_all(r"[^0-9.\\-]", "")
    .cast(pl.Float64, strict=False)
    .alias("price_thb")
)
print(cleaned)`,
        caption: "ล้าง sentinel ก่อนลบหน่วยเงินแล้วค่อย `.cast(..., strict=False)` เพื่อให้ได้ `Float64` ที่มี `null` ชัดเจน",
      },
      whyTitle: "Why this matters — ตัดสินใจอย่างมีเหตุผลว่าจะ drop, impute หรือ quarantine",
      whyParagraphs: [
        "เมื่อข้อมูลที่หายไปทั้งหมดถูกแปลงเป็น `null` มาตรฐานเดียวกันแล้ว ฟังก์ชันอย่าง `.mean()`, `.sum()`, `.null_count()` ของ Polars จะข้าม `null` ให้อัตโนมัติอย่างถูกต้องและไม่ปนเปื้อนค่าเฉลี่ย",
        "ใน Phase 2 ตอนเทรนโมเดล ML คุณจะเลือกได้ชัดว่าแถวไหนต้องตัดทิ้ง (drop) แถวไหนควรเติมค่ามัธยฐาน (impute ใน pipeline) และแถวไหนต้องแจ้งเตือนทีมต้นทางเพราะอัตรา `null` สูงผิดปกติ",
      ],
    },
    {
      id: "thai-be-dates-and-dedup",
      title: "3 · แปลงวันที่ พ.ศ. → ค.ศ. (ไม่พังปีอธิกสุรทิน) และ Deduplication อย่างคงที่",
      paragraphs: [
        "กับดักใหญ่ของข้อมูลองค์กรไทยคือ **ปีพุทธศักราช (พ.ศ. = ค.ศ. + 543)** เช่น `\"15/03/2569\"` หรือ `\"29/02/2567\"` หลายคนพยายามสั่ง `.str.to_date(\"%d/%m/%Y\")` ก่อนแล้วค่อยลบ 543 ปี ซึ่งจะ **พังทันที** เมื่อเจอวันที่ `29/02/2567` เพราะ ค.ศ. `2024` เป็นปีอธิกสุรทิน (มี 29 ก.พ.) แต่ตัวเลข `2567` หาร 4 ไม่ลงตัว parser จึงมองว่าเป็นวันที่ผิด!",
        "วิธีที่ปลอดภัย 100% และรันใน Rust เต็มความเร็วคือแยกส่วน `วัน / เดือน / ปี` ออกเป็น `Int32` ก่อน แล้วใช้ `pl.when(year >= 2400).then(year - 543).otherwise(year)` แปลงเป็น ค.ศ. ให้เรียบร้อย จากนั้นค่อยประกอบเป็นชนิด `Date` จริงด้วย `pl.date(year_ce, month, day)`",
        "สำหรับแถวซ้ำ (Duplicates) ที่เกิดจาก webhook ยิงซ้ำหรืออัปเดตสถานะหลายรอบ ห้ามเรียก `.unique(subset=[\"order_id\"])` ลอย ๆ เพราะ Polars ไม่การันตีว่าแถวไหนจะถูกเก็บไว้หากไม่ระบุเกณฑ์ — ต้อง **`.sort(\"updated_at\")`** ก่อนแล้วตามด้วย **`.unique(subset=[\"order_id\"], keep=\"last\", maintain_order=True)`** เสมอเพื่อให้เก็บสถานะล่าสุดได้อย่างแม่นยำ",
      ],
      analogy:
        "เหมือนการเทียบปฏิทินไทยกับปฏิทินสากล: ต้องแปลงปี พ.ศ. 2567 เป็น ค.ศ. 2024 ก่อนเปิดปฏิทินตรวจว่ามีวันที่ 29 กุมภาพันธ์ไหม — และเวลาเจอใบออเดอร์เลขเดียวกันหลายใบ ต้องเรียงตามเวลาแก้ไขแล้วหยิบใบล่าสุดเก็บไว้",
      bullets: [
        "รองรับข้อมูลผสม (บางแถวเป็น พ.ศ. `2569` บางแถวเป็น ค.ศ. `2026`) ด้วยเกณฑ์ `year >= 2400` → ลบ `543`",
        "ใช้ `pl.date(year_ce, month, day)` แทน `.map_elements(datetime.strptime)` เพื่อความเร็วระดับ Rust และจัดการ `null` อัตโนมัติ",
        "สูตร deduplicate มาตรฐาน: `.sort([\"order_id\", \"updated_at\"]).unique(subset=[\"order_id\"], keep=\"last\", maintain_order=True)`",
      ],
      code: {
        language: "python",
        filename: "thai_date_and_dedup.py",
        code: `import polars as pl

df = pl.DataFrame({
    "order_id": ["O-1", "O-1", "O-2"],
    "order_date_raw": ["29/02/2567", "29/02/2567", "15/03/2026"],
    "status": ["pending", "paid", "paid"],
    "updated_at": ["2026-03-15 09:00", "2026-03-15 09:05", "2026-03-15 10:00"],
})

parts = pl.col("order_date_raw").str.strip_chars().str.split_exact("/", 2)
day_i = parts.struct.field("field_0").cast(pl.Int32, strict=False)
month_i = parts.struct.field("field_1").cast(pl.Int32, strict=False)
year_raw = parts.struct.field("field_2").cast(pl.Int32, strict=False)
year_ce = pl.when(year_raw >= 2400).then(year_raw - 543).otherwise(year_raw)

result = (
    df.with_columns(pl.date(year_ce, month_i, day_i).alias("order_date"))
    .sort(["order_id", "updated_at"])
    .unique(subset=["order_id"], keep="last", maintain_order=True)
)
print(result)`,
        caption: "`29/02/2567` ถูกแปลงเป็น `2024-02-29` ได้โดยไม่พัง และ `O-1` เก็บแถวล่าสุด (`paid`) ไว้อย่างถูกต้อง",
      },
      whyTitle: "Why this matters — ข้อมูลซ้ำและวันที่เพี้ยนทำลายทั้ง KPI และ ML Split",
      whyParagraphs: [
        "หากไม่ตัดแถวซ้ำก่อนแยก Train/Test ใน Block B11 แถวเดียวกันอาจไปโผล่ทั้งฝั่ง Train และฝั่ง Test จนทำให้เกิด Data Leakage และคะแนนวัดผลหลอกตา",
        "และเมื่อวันที่ทั้งหมดอยู่ในมาตรฐาน ISO ค.ศ. (`pl.Date`) เดียวกันแล้ว คุณจะสามารถแบ่งข้อมูลตามเวลา (time-based split) หรือคิวรีรายเดือนใน DuckDB วันพรุ่งนี้ได้อย่างแม่นยำ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Data Cleaning ใน Polars กับ Input Sanitization ใน Backend",
      body: [
        "งานทำความสะอาดข้อมูลตารางคือการทำ Input Sanitization + Schema Validation ระดับหลายแสนแถวพร้อมกัน (vectorized) เทียบกับงานฝั่ง TypeScript/Node ได้ตรง ๆ ดังนี้:",
      ],
      table: [
        ["`.str.replace_all(...)` + `.str.strip_chars()`", "`str.replace(/[\\u200b\\ufeff]/g, '').trim()`"],
        ["`null_values=[...]` + `pl.when(...).then(None)`", "Zod `z.preprocess` แปลง `''` / `'N/A'` เป็น `null`"],
        ["`.cast(pl.Float64, strict=False)`", "`Number.isFinite(val) ? val : null`"],
        ["`.sort('updated_at').unique(subset=['id'], keep='last')`", "`Map` ที่เก็บ record ล่าสุดต่อ `order_id` หลัง sort"],
        ["`df.null_count()` + data-quality audit dict", "Validation summary report ของ batch import job"],
      ],
    },
    student: {
      title: "First-Year Note — BOM และ Zero-Width Space มาจากไหน?",
      body: [
        "**UTF-8 BOM** (`\\ufeff`) คือรหัสไบต์พิเศษ 3 ไบต์ (`EF BB BF`) ที่โปรแกรมอย่าง Microsoft Excel ชอบแปะไว้ต้นไฟล์ CSV เพื่อบอกว่าไฟล์นี้เป็น UTF-8 แต่หลายโปรแกรมอ่านมันติดมาเป็นส่วนหนึ่งของชื่อคอลัมน์แรก ทำให้ชื่อคอลัมน์ไม่ใช่ `order_id` แต่กลายเป็น `\\ufefforder_id`",
        "**Zero-Width Space** (`\\u200b`) เป็นอักขระความกว้าง 0 พิกเซลที่ใช้แทรกระหว่างคำภาษาไทยในหน้าเว็บเพื่อให้ตัดบรรทัดสวย พอมีคนก๊อปปี้ข้อความจากหน้าเว็บมาวางในสเปรดชีต มันจึงติดมาแบบมองด้วยตาเปล่าไม่เห็น — วิธีเช็กเวลาสงสัยคือพิมพ์ `repr(text)` ใน Python จะเห็น `\\u200b` หรือ `\\ufeff` โผล่ชัดทันที",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: คุณได้รับไฟล์ `raw_thai_orders.csv` จากระบบหลังบ้านร้านค้าไทยที่รวมปัญหาทุกอย่างไว้ครบ — มี UTF-8 BOM ที่หัวคอลัมน์, zero-width space ในชื่อจังหวัด, ราคาแบบ `\"1,250 บาท\"` ปน `\"N/A\"` และ `\"ไม่ระบุ\"`, วันที่ปี พ.ศ. รวมถึงวันอธิกสุรทิน `29/02/2567`, และออเดอร์ซ้ำที่ต้องเก็บสถานะล่าสุด มาดูวิธีล้างและทำ audit ทีละขั้น",
    steps: [
      {
        title: "1 · สร้างไฟล์ CSV สกปรกจำลองและตรวจชื่อคอลัมน์ / อักขระแฝง",
        explain:
          "เขียนไฟล์ที่มี `utf-8-sig` (มี BOM นำหน้าจริง) พร้อม zero-width space, sentinel nulls, วันที่ พ.ศ. และแถวซ้ำ แล้วลองอ่านด้วย `pl.scan_csv`",
        code: {
          language: "python",
          filename: "worked_clean_thai.py",
          code: `from pathlib import Path
import polars as pl

dirty_csv = (
    "\\ufefforder_id,province,order_date_raw,price_raw,status,updated_at\\n"
    "O-101, กรุง\\u200bเทพฯ ,29/02/2567,\\\"1,250.00 บาท\\\",pending,2026-03-01 09:00\\n"
    "O-101,กรุงเทพฯ\\u00a0,29/02/2567,\\\"1,250.00 บาท\\\",paid,2026-03-01 09:15\\n"
    "O-102,เชียงใหม่,15/03/2569,N/A,paid,2026-03-15 10:00\\n"
    "O-103,ภูเก็ต,16/03/2026,ไม่ระบุ,paid,2026-03-16 11:00\\n"
    "O-104,เชียงใหม่ ,17/03/2569,890,paid,2026-03-17 12:00\\n"
)
Path("raw_thai_orders.csv").write_text(dirty_csv, encoding="utf-8")

raw_df = pl.read_csv("raw_thai_orders.csv")
print("Raw columns (repr):", [repr(c) for c in raw_df.columns])
print("Raw shape:", raw_df.shape)`,
        },
        output: `Raw columns (repr): ["'order_id'", "'province'", "'order_date_raw'", "'price_raw'", "'status'", "'updated_at'"]
Raw shape: (5, 6)`,
      },
      {
        title: "2 · เขียน Expression ล้าง UTF-8, Null Sentinels, ราคา และวันที่ พ.ศ. → ค.ศ.",
        explain:
          "แม้ Polars 1.x จะตัด BOM ที่หัวไฟล์ให้อัตโนมัติ แต่เรายังใส่ `.rename(...)` เผื่อกรณีรับ DataFrame จากแหล่งอื่น จากนั้นล้างสตริงทุกคอลัมน์ แปลง sentinel เป็น `null`, แยกตัวเลขราคา และแปลง พ.ศ. เป็น `pl.Date`",
        code: {
          language: "python",
          filename: "worked_clean_thai.py",
          code: `SENTINELS = ["", "n/a", "na", "-", "null", "none", "ไม่ระบุ"]


def parse_thai_date_expr(col_name: str) -> pl.Expr:
    parts = pl.col(col_name).str.split_exact("/", 2)
    day_i = parts.struct.field("field_0").cast(pl.Int32, strict=False)
    month_i = parts.struct.field("field_1").cast(pl.Int32, strict=False)
    year_raw = parts.struct.field("field_2").cast(pl.Int32, strict=False)
    year_ce = pl.when(year_raw >= 2400).then(year_raw - 543).otherwise(year_raw)
    return pl.date(year_ce, month_i, day_i)


normalized = (
    raw_df.rename(lambda c: c.lstrip("\\ufeff").strip())
    .with_columns(
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
        parse_thai_date_expr("order_date_raw").alias("order_date"),
    )
)
print(normalized.select("order_id", "province", "order_date", "price_thb", "status"))`,
        },
        output: `shape: (5, 5)
┌──────────┬───────────┬────────────┬───────────┬─────────┐
│ order_id ┆ province  ┆ order_date ┆ price_thb ┆ status  │
│ ---      ┆ ---       ┆ ---        ┆ ---       ┆ ---     │
│ str      ┆ str       ┆ date       ┆ f64       ┆ str     │
╞══════════╪═══════════╪════════════╪═══════════╪═════════╡
│ O-101    ┆ กรุงเทพฯ  ┆ 2024-02-29 ┆ 1250.0    ┆ pending │
│ O-101    ┆ กรุงเทพฯ  ┆ 2024-02-29 ┆ 1250.0    ┆ paid    │
│ O-102    ┆ เชียงใหม่ ┆ 2026-03-15 ┆ null      ┆ paid    │
│ O-103    ┆ ภูเก็ต    ┆ 2026-03-16 ┆ null      ┆ paid    │
│ O-104    ┆ เชียงใหม่ ┆ 2026-03-17 ┆ 890.0     ┆ paid    │
└──────────┴───────────┴────────────┴───────────┴─────────┘`,
      },
      {
        title: "3 · ตัดแถวซ้ำเก็บสถานะล่าสุด และสรุปรายงาน Data-Quality Audit",
        explain:
          "นับจำนวนแถวซ้ำและค่า `null` ก่อนคัดกรอง จากนั้น `.sort(...).unique(subset=[\"order_id\"], keep=\"last\")` แล้วเก็บเฉพาะแถวที่ `price_thb` และ `order_date` สมบูรณ์",
        code: {
          language: "python",
          filename: "worked_clean_thai.py",
          code: `raw_rows = normalized.height
duplicate_rows = raw_rows - normalized.select("order_id").n_unique()

deduped = (
    normalized.sort(["order_id", "updated_at"])
    .unique(subset=["order_id"], keep="last", maintain_order=True)
)
null_prices = deduped["price_thb"].null_count()
null_dates = deduped["order_date"].null_count()

clean_df = deduped.filter(
    pl.col("price_thb").is_not_null()
    & (pl.col("price_thb") > 0)
    & pl.col("order_date").is_not_null()
).select("order_id", "province", "order_date", "price_thb", "status")

audit = {
    "raw_rows": raw_rows,
    "duplicate_rows_removed": duplicate_rows,
    "null_price_after_dedup": null_prices,
    "null_date_after_dedup": null_dates,
    "clean_rows": clean_df.height,
}
print("Audit:", audit)
print(clean_df)`,
        },
        output: `Audit: {'raw_rows': 5, 'duplicate_rows_removed': 1, 'null_price_after_dedup': 2, 'null_date_after_dedup': 0, 'clean_rows': 2}
shape: (2, 5)
┌──────────┬───────────┬────────────┬───────────┬─────────┐
│ order_id ┆ province  ┆ order_date ┆ price_thb ┆ status  │
│ ---      ┆ ---       ┆ ---        ┆ ---       ┆ ---     │
│ str      ┆ str       ┆ date       ┆ f64       ┆ str     │
╞══════════╪═══════════╪════════════╪═══════════╪═════════╡
│ O-101    ┆ กรุงเทพฯ  ┆ 2024-02-29 ┆ 1250.0    ┆ paid    │
│ O-104    ┆ เชียงใหม่ ┆ 2026-03-17 ┆ 890.0     ┆ paid    │
└──────────┴───────────┴────────────┴───────────┴─────────┘`,
      },
    ],
    gotcha:
      "จุดพลาดยอดฮิต: ใช้ `pl.when(pl.col(pl.String)...).then(None).otherwise(pl.col(pl.String))` แล้วลืมต่อ `.name.keep()`! ใน Polars Expression แบบหลายคอลัมน์ การใช้ `.name.keep()` ช่วยให้แต่ละคอลัมน์คงชื่อเดิมของตัวเองไว้ไม่ชนกันจนเกิด `DuplicateError`",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูลทำความสะอาดและตรวจสอบคุณภาพข้อมูลออเดอร์ไทย (`exercise_day34.py`) ด้วย Polars ที่ล้างอักขระ UTF-8 แฝง, แปลง sentinel nulls, แปลงวันที่ พ.ศ. → ค.ศ., ตัดแถวซ้ำเก็บแถวล่าสุด และคืนรายงาน Data-Quality Audit",
    requirements: [
      "ฟังก์ชัน `parse_thai_date(col_name: str) -> pl.Expr` แปลงสตริงรูปแบบ `DD/MM/YYYY` ที่ปนทั้งปี พ.ศ. (`>= 2400`, ลบ `543`) และปี ค.ศ. ให้เป็นชนิด `pl.Date` โดยต้องรองรับวันอธิกสุรทิน `29/02/2567` → `2024-02-29` และคืน `null` เมื่อรูปแบบไม่ถูกต้อง",
      "ฟังก์ชัน `clean_thai_orders(df: pl.DataFrame) -> tuple[pl.DataFrame, dict[str, int]]` ล้าง BOM/ช่องว่างที่ชื่อคอลัมน์, ลบ `\\u200b` / `\\ufeff` และ normalize ช่องว่าง (`\\u00a0`, ช่องว่างซ้อน, หัว-ท้าย) ในทุกคอลัมน์สตริง",
      "แปลงค่า sentinel (`\"\"`, `\"n/a\"`, `\"na\"`, `\"-\"`, `\"null\"`, `\"ไม่ระบุ\"` แบบไม่สนตัวพิมพ์เล็ก-ใหญ่) เป็น `null` แล้วสกัดคอลัมน์ `price_thb` (`Float64`, ลบลูกน้ำ/คำว่าบาท) และ `order_date` (`Date`)",
      "เรียงตาม `[\"order_id\", \"updated_at\"]` แล้วตัดแถวซ้ำด้วย `.unique(subset=[\"order_id\"], keep=\"last\", maintain_order=True)` จากนั้นกรองเก็บเฉพาะแถวที่ `order_id`, `province`, `order_date` ไม่เป็น `null` และ `price_thb > 0`",
      "คืน `(clean_df, audit)` โดย `clean_df` มี 5 คอลัมน์เรียงตามลำดับ `[\"order_id\", \"province\", \"order_date\", \"price_thb\", \"status\"]` และ `audit` มีคีย์ `raw_rows`, `duplicates_removed`, `invalid_rows_dropped`, `clean_rows`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day34.py",
      code: `import polars as pl

SENTINELS = ["", "n/a", "na", "-", "null", "none", "ไม่ระบุ"]


def parse_thai_date(col_name: str) -> pl.Expr:
    """แปลงสตริง DD/MM/YYYY (รองรับทั้ง พ.ศ. >= 2400 และ ค.ศ.) เป็น pl.Date"""
    # TODO: แยก DD/MM/YYYY ด้วย str.split_exact("/", 2), แปลง Int32, ลบ 543 ถ้า >= 2400 แล้วคืน pl.date(...)
    raise NotImplementedError


def clean_thai_orders(df: pl.DataFrame) -> tuple[pl.DataFrame, dict[str, int]]:
    """ล้างข้อมูลออเดอร์ไทยสกปรกและคืน (clean_df, audit_dict)"""
    # TODO:
    # 1. ล้าง BOM/whitespace ชื่อคอลัมน์ และ normalize ทุกคอลัมน์ pl.String
    # 2. แปลง SENTINELS เป็น null
    # 3. สร้าง price_thb (Float64) และ order_date (Date)
    # 4. นับ duplicates_removed, sort ตาม ["order_id", "updated_at"] แล้ว unique(subset=["order_id"], keep="last")
    # 5. กรองแถวที่ order_id, province, order_date ไม่ null และ price_thb > 0
    # 6. คืน (clean_df, {"raw_rows": ..., "duplicates_removed": ..., "invalid_rows_dropped": ..., "clean_rows": ...})
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day34.py",
      code: `from datetime import date
import polars as pl
import pytest
from exercise_day34 import clean_thai_orders, parse_thai_date


def test_parse_thai_date_handles_be_leap_year_and_ce():
    df = pl.DataFrame({
        "d": ["29/02/2567", "15/03/2569", "01/04/2026", "ไม่ระบุ", None]
    })
    out = df.select(parse_thai_date("d").alias("parsed"))["parsed"].to_list()
    assert out == [date(2024, 2, 29), date(2026, 3, 15), date(2026, 4, 1), None, None]


def test_clean_thai_orders_utf8_dedup_and_audit():
    raw = pl.DataFrame({
        "\\ufefforder_id": [" O-1 ", "O-1\\u200b", "O-2", "O-3", "O-4"],
        "province": ["กรุง\\u200bเทพฯ", "กรุงเทพฯ\\u00a0 ", "เชียงใหม่", "ภูเก็ต", "ขอนแก่น"],
        "order_date_raw": ["29/02/2567", "29/02/2567", "15/03/2569", "ไม่ระบุ", "16/03/2569"],
        "price_raw": ["1,200.50 บาท", "1,500 บาท", "  N/A ", "500", "-20"],
        "status": ["pending", "paid", "paid", "paid", "paid"],
        "updated_at": [
            "2026-03-01 08:00",
            "2026-03-01 09:00",
            "2026-03-15 10:00",
            "2026-03-15 11:00",
            "2026-03-16 12:00",
        ],
    })

    clean_df, audit = clean_thai_orders(raw)

    assert clean_df.columns == ["order_id", "province", "order_date", "price_thb", "status"]
    assert clean_df.height == 1
    row = clean_df.to_dicts()[0]
    assert row["order_id"] == "O-1"
    assert row["province"] == "กรุงเทพฯ"
    assert row["order_date"] == date(2024, 2, 29)
    assert row["price_thb"] == pytest.approx(1500.0)
    assert row["status"] == "paid"

    assert audit == {
        "raw_rows": 5,
        "duplicates_removed": 1,
        "invalid_rows_dropped": 3,
        "clean_rows": 1,
    }
`,
    },
    selfCheck: [
      "`parse_thai_date` แปลง `29/02/2567` เป็น `date(2024, 2, 29)` ได้โดยไม่โยน error และคืน `None` สำหรับค่าสกปรก",
      "ชื่อคอลัมน์ที่มี `\\ufeff` นำหน้าและค่าที่มี `\\u200b` / `\\u00a0` ถูกล้างหมดจน `O-1` ทั้ง 2 แถวถูกมองเป็นออเดอร์เดียวกัน",
      "หลัง deduplicate แถว `O-1` เก็บแถวล่าสุด (`1500.0`, `paid`) ไม่ใช่แถวเก่า (`1200.5`, `pending`)",
      "แถวที่ราคาเป็น `N/A`, ราคาติดลบ (`-20`) และวันที่เป็น `ไม่ระบุ` ถูกตัดออกและนับรวมใน `invalid_rows_dropped == 3`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 2 test functions ใน `test_day34.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ควรล้างสตริง (`\\u200b`, `\\ufeff`, `\\u00a0`, strip) ให้เรียบร้อย **ก่อน** นับและทำ `.unique(subset=[\"order_id\"])` ไม่เช่นนั้น `\" O-1 \"` กับ `\"O-1\\u200b\"` จะถูกมองเป็นคนละออเดอร์!",
      },
      {
        body: "ใช้ `pl.when(pl.col(pl.String).str.to_lowercase().is_in(SENTINELS)).then(None).otherwise(pl.col(pl.String)).name.keep()` เพื่อเปลี่ยน sentinel เป็น `null` พร้อมกันทุกคอลัมน์สตริง",
      },
      {
        body: "โครงของ `parse_thai_date` และครึ่งแรกของ `clean_thai_orders` พร้อมแล้ว — เหลือเติมการ deduplicate, กรองแถว และคำนวณ `audit`:",
        code: {
          language: "python",
          filename: "hint_day34.py",
          code: `def parse_thai_date(col_name: str) -> pl.Expr:
    parts = pl.col(col_name).str.strip_chars().str.split_exact("/", 2)
    day_i = parts.struct.field("field_0").cast(pl.Int32, strict=False)
    month_i = parts.struct.field("field_1").cast(pl.Int32, strict=False)
    year_raw = parts.struct.field("field_2").cast(pl.Int32, strict=False)
    year_ce = pl.when(year_raw >= 2400).then(year_raw - 543).otherwise(year_raw)
    return pl.date(year_ce, month_i, day_i)


def clean_thai_orders(df: pl.DataFrame) -> tuple[pl.DataFrame, dict[str, int]]:
    raw_rows = df.height
    step1 = (
        df.rename(lambda c: c.lstrip("\\ufeff").strip())
        .with_columns(
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
            parse_thai_date("order_date_raw").alias("order_date"),
        )
    )
    # TODO: sort(["order_id", "updated_at"]).unique(subset=["order_id"], keep="last", maintain_order=True)
    # TODO: filter แถวที่ valid แล้วคืน (clean_df, audit)
    raise NotImplementedError`,
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
      title: "แปลงสตริงวันที่ พ.ศ. ด้วย `.str.to_date(\"%d/%m/%Y\")` ก่อนลบ 543",
      symptom: "ข้อมูลส่วนใหญ่ผ่าน แต่จู่ ๆ โปรแกรมพัง (หรือคืน `null`) เฉพาะวันที่ `29/02/2567` และ `29/02/2563`",
      fix: "แยกวัน/เดือน/ปีเป็นตัวเลขก่อน ลบ `543` เมื่อ `year >= 2400` ให้เป็นปี ค.ศ. แล้วค่อยสร้างวันที่ด้วย `pl.date(year_ce, month, day)`",
    },
    {
      title: "ทำ `.unique(subset=[\"order_id\"])` ก่อนล้างช่องว่าง/อักขระล่องหน หรือไม่ `.sort()` ก่อน",
      symptom: "`\" O-1 \"` กับ `\"O-1\\u200b\"` ไม่ถูกยุบรวมกัน หรือบางครั้งได้แถว `pending` เก่าแทนแถว `paid` ล่าสุด",
      fix: "ล้างสตริงของคีย์หลักให้สะอาดก่อน จากนั้น `.sort([\"order_id\", \"updated_at\"])` แล้วค่อยเรียก `.unique(subset=[\"order_id\"], keep=\"last\", maintain_order=True)`",
    },
    {
      title: "รีบ `.fill_null(0)` กับคอลัมน์ตัวเลขอย่างราคาหรือระยะเวลาตอบกลับ",
      symptom: "ค่าเฉลี่ย (`mean`) ลดต่ำลงผิดปกติเพราะแถวที่ข้อมูลหายถูกนับเป็น `0 บาท` หรือ `0 นาที`",
      fix: "คงค่าที่หายไปไว้เป็น `null` (Polars ข้าม `null` ตอนคำนวณ `mean` ให้เอง) หรือแยกออกในรายงาน audit แล้วค่อยตัดสินใจวิธี impute ใน ML pipeline",
    },
    {
      title: "เรียก `.str.strip()` แบบ pandas ใน Polars 1.x",
      symptom: "เกิด `AttributeError: 'ExprStringNameSpace' object has no attribute 'strip'`",
      fix: "ใน Polars 1.x ใช้ `.str.strip_chars()` (และ `.str.strip_chars_start()` / `.str.strip_chars_end()`)",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d034-q1",
        "ทำไมการแปลงวันที่ พ.ศ. `\"29/02/2567\"` ด้วย `.str.to_date(\"%d/%m/%Y\")` ก่อนแล้วค่อยลบ 543 ปีจึงเป็นวิธีที่ผิดพลาด?",
        [
          ["เพราะ Polars ไม่รองรับปีที่มีค่ามากกว่า 2500", "ไม่จริง — Polars รองรับปีถึงหลักพัน ปัญหาอยู่ที่กฎปีอธิกสุรทิน"],
          ["เพราะปี ค.ศ. 2024 เป็นปีอธิกสุรทิน (มี 29 ก.พ.) แต่ตัวเลข 2567 ไม่ใช่ปีอธิกสุรทินในปฏิทินเกรกอเรียน ทำให้ parser มองว่าเป็นวันที่ผิด", "ถูก — ต้องแยกปีออกมาลบ 543 ก่อนแล้วค่อยประกอบวันที่ด้วย `pl.date(year_ce, month, day)`"],
          ["เพราะรูปแบบ `%d/%m/%Y` ใช้ได้เฉพาะกับภาษาอังกฤษเท่านั้น", "ไม่เกี่ยวกัน — ตัวเลขวัน/เดือน/ปีไม่ขึ้นกับภาษา"],
          ["เพราะ `.str.to_date` ใช้ไม่ได้ในโหมด Lazy", "ไม่จริง — `.str.to_date` ใช้ได้ใน Lazy mode แต่ไม่เหมาะกับปี พ.ศ."],
        ],
        "B",
        "2024 หาร 4 ลงตัวจึงมี 29 กุมภาพันธ์ แต่ 2024 + 543 = 2567 หาร 4 ไม่ลงตัว การแปลงปีเป็น ค.ศ. ก่อนเรียก `pl.date(year_ce, month, day)` จึงเป็นวิธีเดียวที่ถูกต้องทุกวันในปฏิทิน",
        "ทำไมห้าม parse วันที่ พ.ศ. เป็น `Date` ก่อนลบ 543 ปี?",
        "เพราะวันอธิกสุรทินอย่าง 29/02/2567 (ค.ศ. 2024) จะพัง เนื่องจาก 2567 ไม่ใช่ปีอธิกสุรทินในปฏิทินเกรกอเรียน — ต้องแยกตัวเลขปีมาลบ 543 ก่อนแล้วค่อยเรียก `pl.date(...)`",
      ),
      mc(
        "d034-q2",
        "ตารางมี `\"กรุงเทพฯ\"` กับ `\"กรุง\\u200bเทพฯ\"` ปนกัน เมื่อสั่ง `group_by(\"province\")` แล้วเกิด 2 แถวที่หน้าตาเหมือนกันในเทอร์มินัล ควรแก้อย่างไรใน Polars?",
        [
          ["ใช้ `.str.strip_chars()` อย่างเดียวก็พอ", "ไม่พอ — `.str.strip_chars()` ลบเฉพาะหัว-ท้าย และไม่ลบ `\\u200b` ที่อยู่กลางคำ"],
          ["ลบอักขระล่องหนด้วย `.str.replace_all(r\"[\\u200b\\ufeff]+\", \"\")` พร้อม normalize `\\u00a0` และ `.str.strip_chars()` ก่อน `group_by`", "ถูก — ล้างทั้งอักขระความกว้างศูนย์กลางคำ, BOM และช่องว่างหัว-ท้ายใน Rust expression เดียว"],
          ["ใช้ `.cast(pl.Int64)` เพื่อบังคับให้เป็นตัวเลข", "ชื่อจังหวัดเป็นข้อความ ไม่สามารถ cast เป็นตัวเลขได้"],
          ["เขียน `for` loop ทีละแถวแล้วเรียก `.unique()`", "ไม่จำเป็นและช้ามาก — Polars `.str.replace_all` รันแบบ vectorized ใน Rust"],
        ],
        "B",
        "Zero-width space (`\\u200b`) มักแทรกอยู่กลางคำภาษาไทยจากระบบตัดบรรทัดเว็บ ต้องใช้ `.str.replace_all` ลบออกก่อนตามด้วย normalize ช่องว่างและ `.str.strip_chars()`",
        "อักขระล่องหน 3 ตัวที่พบบ่อยในข้อมูลไทยคืออะไร และล้างอย่างไรใน Polars?",
        "BOM (`\\ufeff`), Zero-Width Space (`\\u200b`) และ Non-Breaking Space (`\\u00a0`) — ล้างด้วย `.str.replace_all(r\"[\\u200b\\ufeff]+\", \"\")`, แปลง `\\u00a0` เป็นช่องว่างปกติ แล้ว `.str.strip_chars()`",
      ),
      mc(
        "d034-q3",
        "หากออเดอร์ `O-101` มี 2 แถวในตาราง (`status=\"pending\"` เวลา 09:00 และ `status=\"paid\"` เวลา 09:15) วิธี deduplicate ใดรับประกันว่าจะได้แถว `paid` เสมอ?",
        [
          ["`df.unique(subset=[\"order_id\"])`", "ผิด — ค่า default `keep=\"any\"` ไม่การันตีว่าจะเก็บแถวไหน"],
          ["`df.sort([\"order_id\", \"updated_at\"]).unique(subset=[\"order_id\"], keep=\"last\", maintain_order=True)`", "ถูก — เรียงเวลาจากเก่าไปใหม่ก่อนแล้วเลือก `keep=\"last\"` เพื่อให้ได้สถานะล่าสุดแน่นอน"],
          ["`df.drop_nulls(subset=[\"order_id\"])`", "ผิด — `drop_nulls` ลบเฉพาะค่าว่าง ไม่ได้ลบแถวซ้ำ"],
          ["`df.filter(pl.col(\"order_id\").is_unique())`", "ผิด — `is_unique()` จะทิ้ง `O-101` ออกไปทั้งสองแถวเลย!"],
        ],
        "B",
        "การตัดแถวซ้ำแบบมีลำดับเวลา (deterministic deduplication) ต้องเรียงตามคอลัมน์เวลาก่อนเสมอแล้วค่อยใช้ `keep=\"last\"`",
        "ทำไมต้อง `.sort(\"updated_at\")` ก่อนเรียก `.unique(subset=[\"order_id\"], keep=\"last\")`?",
        "เพราะ `keep=\"last\"` ยึดตามลำดับแถวปัจจุบันของตาราง หากไม่เรียงเวลาก่อนอาจเผลอเก็บแถวสถานะเก่าแทนแถวล่าสุด",
      ),
      mc(
        "d034-q4",
        "คอลัมน์ราคาสินค้ามีค่า `\"N/A\"` และ `\"ไม่ระบุ\"` ปนอยู่ 15% ของแถวทั้งหมด ข้อใดคือแนวปฏิบัติที่ถูกต้องที่สุด?",
        [
          ["แปลงเป็น `0.0` ทันทีเพื่อไม่ให้มี `null` ในตาราง", "อันตราย — การแทนค่าที่หายไปด้วย 0 จะดึงค่าเฉลี่ยราคาและโมเดลทำนายให้ต่ำผิดความจริง"],
          ["แปลง sentinel strings เหล่านั้นเป็น `null` ที่แท้จริงก่อน แล้วบันทึกสัดส่วนใน data-quality audit เพื่อตัดสินใจกรองหรือ impute อย่างโปร่งใส", "ถูก — แยก 'ไม่มีข้อมูล' (`null`) ออกจาก 'ราคาศูนย์บาท' (`0.0`) อย่างชัดเจน"],
          ["ปล่อยไว้เป็นชนิด `String` ต่อไปจะได้ไม่เสียข้อมูล", "ผิด — คอลัมน์ `String` คำนวณสถิติหรือส่งเข้าโมเดลตัวเลขไม่ได้"],
          ["ลบทั้งคอลัมน์ราคาทิ้งทันที", "เกินเหตุ — 85% ของข้อมูลยังใช้งานได้หากจัดการ `null` อย่างเหมาะสม"],
        ],
        "B",
        "การแปลง sentinel เป็น `null` มาตรฐานและเก็บตัวเลขใน audit report ทำให้ทั้งการคำนวณสถิติ (`mean`, `sum`) และการตรวจสอบคุณภาพข้อมูลมีความโปร่งใสและตรวจสอบย้อนหลังได้",
        "เหตุใดจึงไม่ควรรีบ `.fill_null(0)` กับคอลัมน์ราคาที่แปลงมาจาก `\"N/A\"`?",
        "เพราะ `null` หมายถึง 'ไม่มีข้อมูล' ไม่ใช่ 'ราคา 0 บาท' การใส่ 0 จะบิดเบือนค่าเฉลี่ยและสัญญาณที่ส่งเข้าโมเดล ML",
      ),
    ],
  },

  takeaways: [
    "ล้าง **UTF-8 noise** (`\\ufeff`, `\\u200b`, `\\u00a0`, ช่องว่างซ้อน) ในชื่อคอลัมน์และทุกคอลัมน์สตริงก่อนทำ `group_by`, `join` หรือ `unique` เสมอ",
    "แปลงค่า sentinel (`\"\"`, `\"N/A\"`, `\"-\"`, `\"ไม่ระบุ\"`) ให้เป็น `null` จริง และใช้ `.cast(..., strict=False)` หลังลบลูกน้ำ/หน่วยเงิน",
    "แปลงวันที่ **พ.ศ. → ค.ศ.** โดยแยกวัน/เดือน/ปีเป็นตัวเลขและลบ `543` เมื่อ `year >= 2400` ก่อนเรียก `pl.date(year_ce, month, day)` เพื่อไม่ให้พังวันอธิกสุรทิน `29/02/2567`",
    "ทำ **deterministic deduplication** ด้วย `.sort([key, time_col]).unique(subset=[key], keep=\"last\")` คู่กับรายงาน data-quality audit ที่นับแถวซ้ำและแถวไม่สมบูรณ์ทุกครั้ง",
  ],

  reviewCards: [
    rc(
      "d034-rc-1",
      "วิธีแปลงสตริงวันที่ พ.ศ. (`DD/MM/YYYY`) เป็น `pl.Date` ใน Polars ที่ไม่พังวันที่ `29/02/2567` ทำอย่างไร?",
      "แยก `day`, `month`, `year` ด้วย `.str.split_exact(\"/\", 2)` แล้ว cast เป็น `Int32`, ลบ `543` เมื่อ `year >= 2400` ให้เป็นปี ค.ศ. ก่อน แล้วค่อยประกอบเป็นวันที่ด้วย `pl.date(year_ce, month, day)`",
    ),
    rc(
      "d034-rc-2",
      "ทำไมต้องล้าง `\\u200b` (zero-width space) และ `\\u00a0` (non-breaking space) ก่อนทำ `unique` หรือ `group_by` ในข้อมูลไทย?",
      "เพราะอักขระเหล่านี้มองไม่เห็นด้วยตาเปล่าแต่ทำให้สตริงไม่เท่ากัน ส่งผลให้คีย์เดียวกันไม่ถูก deduplicate หรือชื่อจังหวัดเดียวกันถูกแยกออกเป็นหลายกลุ่ม",
    ),
    rc(
      "d034-rc-3",
      "สูตร deduplicate ที่รับประกันว่าจะเก็บแถวสถานะล่าสุดของแต่ละ `order_id` ใน Polars คืออะไร?",
      "ล้างคีย์ `order_id` ให้สะอาดก่อน แล้วสั่ง `.sort([\"order_id\", \"updated_at\"]).unique(subset=[\"order_id\"], keep=\"last\", maintain_order=True)`",
    ),
  ],

  sources: [
    { label: "Polars User Guide — Missing Data (null vs NaN)", href: "https://docs.pola.rs/user-guide/expressions/missing-data/" },
    { label: "Polars User Guide — Strings & Regex Expressions", href: "https://docs.pola.rs/user-guide/expressions/strings/" },
    { label: "Polars API Reference — pl.date & DataFrame.unique", href: "https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.date.html" },
  ],

  glossary: [
    "polars",
    "schema",
    "validation",
    "coercion",
    "fail-fast",
    "data-contract",
    "pytest",
    "uv",
  ],
});
