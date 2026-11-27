import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D002 — Phase 1 / Block B01
 * Python Collections, Comprehensions & Type Hints.
 */
export const d002: Lesson = defineLesson({
  day: 2,
  titleTh: "จัดการข้อมูลด้วย Python Collections, Comprehensions และ Type Hints สมัยใหม่",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% · ไม่ต้องมี API key · ทำความสะอาดและจัดรูปคำถามลูกค้าภาษาไทยอย่างกระชับและไม่ทำลายข้อมูลต้นฉบับ",
  icon: "list-filter",
  visual: {
    id: "collections-pipeline",
    title: "สายพาน Collections & Comprehensions พร้อม Type Hints",
    caption: "กดสลับขั้นตอนเพื่อดูการกรอง ตัดซ้ำด้วย set และแปลงรายการทิกเก็ตเป็น dict lookup ในบรรทัดเดียว",
    alt: "แผนภาพสายพาน list, set และ dict comprehension พร้อม Python type hints",
  },
  requiresApiKey: false,
  tools: ["Python 3.12", "uv", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ทำความสะอาดและคัดกรองข้อมูลดิบก่อนส่งต่อ",
      body: "คำถามลูกค้าจาก LINE, อีเมล และฟอร์มเว็บมักเต็มไปด้วยช่องว่างซ้ำ บรรทัดว่าง และแท็กซ้ำซ้อน ก่อนส่งเข้าด่านตรวจ {{schema}} เราต้องจัดรูปคอลเลกชันให้สะอาดโดยไม่ทำลายข้อมูลดิบต้นฉบับ",
      lessonNote:
        "วันนี้คุณใช้ `list`, `set`, `dict` และ {{comprehension}} สร้างสายพานทำความสะอาดข้อมูลภาษาไทยแบบ pure function",
    },
    {
      node: 2,
      heading: "เตรียมบริบทและ metadata ให้กระชับก่อนส่งเข้าโมเดล",
      body: "ทุกข้อความว่างหรือแท็กซ้ำที่หลุดเข้าไปใน prompt ของ {{llm}} ทำให้เปลืองโทเคนและรบกวนคุณภาพคำตอบ การตัดซ้ำและกรองข้อมูลตั้งแต่ต้นช่วยลดทั้งต้นทุนและ noise",
      lessonNote:
        "การเลือก `set` หรือ `dict.fromkeys` ให้ถูกงานช่วยให้คัดกรองคำหยุด (stopwords) และแท็กซ้ำได้อย่างรวดเร็ว",
    },
    {
      node: 3,
      heading: "ทำชุดทดสอบและตัวชี้วัดให้นิ่ง (Deterministic)",
      body: "เมื่อรันชุดเทสต์ {{pytest}} หรือวัดผลบน {{golden-dataset}} ลำดับของผลลัพธ์และข้อมูลต้นฉบับต้องไม่แกว่งไปมาระหว่างรอบการรัน",
      lessonNote:
        "การไม่ mutate อินพุตและการใช้ `dict.fromkeys(...)` แทน `set` เมื่อต้องรักษาลำดับช่วยให้เทสต์ผ่านคงที่ทุกครั้ง",
    },
    {
      node: 4,
      heading: "สร้างดัชนีค้นหา O(1) และสัญญาชนิดข้อมูลให้ทีมอ่านง่าย",
      body: "ในแอป AI จริง เรามักต้องค้นหาทิกเก็ตตาม `ticket_id` หรือตรวจสิทธิ์ผู้ใช้หลายพันรายการต่อวินาที การสร้าง `dict` lookup และระบุ {{type-hint}} ชัดเจนช่วยลดบั๊กและทำให้โค้ดดูแลง่าย",
      lessonNote:
        "ฝึกเขียน Python 3.12 {{type-hint}} (`list[str]`, `str | None`, `TypedDict`) ที่ทำงานเข้าคู่กับ {{ruff}} และ {{pydantic}} ในวันถัดไป",
    },
  ],

  objectives: [
    "**เลือกใช้** โครงสร้างข้อมูลหลักของ Python (`list`, `dict`, `set`, `tuple`) ได้ตรงกับโจทย์งานข้อมูล AI ทั้งความเร็วการค้นหา ($O(1)$ vs $O(n)$) และการป้องกันการแก้ไขค่าโดยไม่ตั้งใจ",
    "**เขียน** list, set และ dict {{comprehension}} เพื่อกรอง ทำความสะอาด และจัดดัชนีคำถามภาษาไทยโดย **ไม่ mutate** ข้อมูลต้นฉบับ",
    "**ระบุ** {{type-hint}} สมัยใหม่แบบ Python 3.12 (`list[str]`, `dict[str, int]`, `str | None`, `TypedDict`) และแยกออกว่าเมื่อไหร่ควรใช้ `TypedDict` vs {{pydantic}} `BaseModel`",
  ],

  prerequisites: [
    "ผ่าน Day 1 หรือมี `uv`, `pytest` และ `ruff` พร้อมใช้งานบนเครื่องแล้ว",
    "รู้จักตัวแปร ฟังก์ชัน `def` และลูป `for` พื้นฐานใน Python",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — รันบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์โปรเจกต์ใหม่ด้วย {{uv}} สำหรับ Day 2 (หรือต่อใน workspace เดิมก็ได้) วันนี้ใช้เฉพาะมาตรฐานของ Python 3.12+ คู่กับ {{pytest}} และ {{ruff}}",
    commands: `uv init ai-day2-collections && cd ai-day2-collections
uv add --dev pytest ruff

# ตรวจว่าใช้ Python 3.10+ (แนะนำ 3.12) เพื่อรองรับ syntax แบบ str | None และ list[str]
uv run python --version`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day2-collections` ด้วย `uv init`"],
      ["dev-tools", "เพิ่ม `pytest` และ `ruff` ด้วย `uv add --dev pytest ruff`"],
      ["version", "ตรวจว่า `uv run python --version` เป็น Python 3.10 ขึ้นไป (แนะนำ 3.12)"],
    ],
    note: "เนื้อหาวันนี้ใช้ Python standard library ล้วน 100% เป็นพื้นฐานตรงก่อนเข้าสู่ Nested Pydantic Validators ใน Day 3 และ Batch Ticket Parser ใน Day 4",
  },

  concepts: [
    {
      id: "collections-mental-model",
      title: "1 · เลือก Collection ให้ถูกงาน: list, dict, set และ tuple",
      paragraphs: [
        "โครงสร้างข้อมูล 4 ตัวหลักใน Python ไม่ได้ต่างกันแค่สัญลักษณ์วงเล็บ แต่ต่างกันที่ **ลำดับ (order)**, **การแก้ไขค่าได้ (mutability)** และ **ความเร็วในการค้นหา**: `list` เก็บตามลำดับและแก้ได้, `tuple` เก็บตามลำดับแต่แก้ไม่ได้ (immutable), `set` เก็บค่าไม่ซ้ำและเช็กสมาชิกในเวลา $O(1)$ แต่ไม่รับประกันลำดับข้ามรอบ, ส่วน `dict` จับคู่ key→value ในเวลา $O(1)$ และ **รักษาลำดับการแทรก** ตั้งแต่ Python 3.7",
        "ในงาน AI ที่ต้องคัดกรองคำถามหรือเอกสารทีละหมื่นชิ้น การเลือกผิดแค่ตัวเดียวสร้างความต่างมหาศาล เช่น เช็ก `word in stopwords_list` จะไล่เทียบทีละตัว ($O(n)$) แต่เปลี่ยนเป็น `word in stopwords_set` จะค้นหาได้ทันที ($O(1)$) และถ้าอยากตัดตัวซ้ำโดย **คงลำดับเดิม** ให้ใช้ `list(dict.fromkeys(items))` แทน `list(set(items))`",
      ],
      analogy:
        "เหมือนเครื่องมือในร้านกาแฟ: `list` คือแถวใบออเดอร์ที่เรียงตามคิว, `tuple` คือสูตรมาตรฐานที่ห้ามใครแอบแก้, `dict` คือสมุดรหัสสมาชิกที่เปิดหาชื่อได้ทันทีจากเบอร์โทร, และ `set` คือกล่องเช็กรายการวัตถุดิบว่ามีครบไหมโดยไม่สนลำดับ",
      bullets: [
        "**`list[T]`**: เหมาะกับลำดับรายการที่อาจมีค่าซ้ำ เช่น ข้อความสนทนาทีละเทิร์น หรือรายการ chunk ของเอกสาร",
        "**`tuple[str, int]`**: เหมาะกับข้อมูลคู่คงที่ที่ไม่ควรเผลอแก้ เช่น `(ticket_id, priority_score)` และใช้เป็น key ของ `dict` ได้",
        "**`set[str]`**: เหมาะกับการเช็กสมาชิกเร็ว ๆ (`in`) เช่น stopwords, ช่องทางที่อนุญาต หรือ ID ที่เคยประมวลผลแล้ว",
        "**`dict[str, T]`**: เหมาะกับตารางค้นหา O(1) เช่น `ticket_by_id[tid]` และการนับความถี่แยกตามหมวดหมู่",
      ],
      code: {
        language: "python",
        filename: "collections_choice.py",
        code: `# 1) set สำหรับเช็กสมาชิกเร็วแบบ O(1)
allowed_channels: set[str] = {"line", "email", "web"}
print("line" in allowed_channels)  # True (O(1))

# 2) tuple สำหรับข้อมูลคงที่ (แก้ไม่ได้ และใช้เป็น key ของ dict ได้)
route_key: tuple[str, str] = ("line", "vip")
sla_minutes: dict[tuple[str, str], int] = {route_key: 15}
print("SLA:", sla_minutes[("line", "vip")], "นาที")

# 3) dict.fromkeys ตัดตัวซ้ำโดยคงลำดับเดิม (deterministic)
raw_tags = ["billing", "vip", "billing", "refund"]
unique_tags = list(dict.fromkeys(raw_tags))
print("Ordered unique tags:", unique_tags)`,
        caption: "เลือก `set` เมื่อเช็กสมาชิกเร็ว ๆ, `tuple` เมื่อต้องการความคงที่ และ `dict.fromkeys` เมื่อต้องตัดซ้ำแบบคงลำดับ",
      },
      whyTitle: "Why this matters — ความต่างระหว่าง $O(n)$ กับ $O(1)$ ในงานข้อมูล AI",
      whyParagraphs: [
        "ตอนทดลองกับข้อมูล 10 แถว `list` กับ `set` ดูเร็วเท่ากัน แต่เมื่อเข้าสู่ Phase 2 และ Phase 4 ที่ต้องตัดคำซ้ำหรือเช็ก document ID ที่เคยจัดทำดัชนีแล้ว 50,000 รายการ การค้นหาใน `list` ภายในลูปจะช้าลงเป็น $O(n^2)$ จนงานค้างหลายนาที ขณะที่ `set` หรือ `dict` จบในเสี้ยววินาที",
        "นอกจากนี้ การใช้ `dict.fromkeys` แทน `list(set(...))` ป้องกันบั๊กลำดับสลับแบบสุ่ม (hash randomization) ซึ่งทำให้ snapshot test และผล JSON แกว่งไปมาใน CI",
      ],
    },
    {
      id: "comprehensions-no-mutation",
      title: "2 · Comprehensions และกฎเหล็ก: ห้าม Mutate ข้อมูลต้นฉบับ",
      paragraphs: [
        "**{{comprehension|Comprehension}}** คือไวยากรณ์ของ Python สำหรับสร้าง `list`, `set` หรือ `dict` ก้อนใหม่จากการแปลงและกรองคอลเลกชันเดิมในนิพจน์เดียว อ่านจากซ้ายไปขวาเหมือนประโยคภาษาอังกฤษ: `[ผลลัพธ์ for สมาชิก in ชุดเดิม if เงื่อนไข]`",
        "กฎเหล็กของงาน data pipeline คือ **ห้ามแก้ไข (mutate) ข้อมูลต้นฉบับที่ผู้เรียกส่งเข้ามา** — การสร้างคอลเลกชันใหม่ผ่าน comprehension ร่วมกับการสร้าง `dict` ใหม่ (`{**row, \"message_th\": cleaned}`) ทำให้ฟังก์ชันสะอาด ตรวจสอบย้อนหลังได้ และไม่ทิ้งผลข้างเคียง (side effect) ให้ส่วนอื่นของโปรแกรมพังเงียบ ๆ",
      ],
      analogy:
        "เหมือนการถ่ายเอกสารใบเสร็จลูกค้ามาเขียนโน้ตและไฮไลต์บนฉบับสำเนา แทนที่จะเอาปากกาเมจิกขีดทับลงบนใบเสร็จตัวจริง — ถ้าฝ่ายบัญชีขอดูต้นฉบับทีหลัง ทุกอย่างยังอยู่ครบเหมือนเดิม",
      code: {
        language: "python",
        filename: "comprehensions_clean.py",
        code: `raw_queries = [
    {"ticket_id": " TKT-001 ", "channel": "LINE", "message_th": "  โอนเงิน   ไม่เข้าครับ  "},
    {"ticket_id": "TKT-002", "channel": "web", "message_th": "     "},
    {"ticket_id": "TKT-003", "channel": "Email", "message_th": "ขอใบกำกับภาษี\nด่วนครับ"},
]

# List comprehension: กรองข้อความว่าง และสร้าง dict ใหม่โดยไม่ mutate raw_queries
cleaned_queries = [
    {
        "ticket_id": q["ticket_id"].strip(),
        "channel": q["channel"].strip().lower(),
        "message_th": " ".join(q["message_th"].split()),
    }
    for q in raw_queries
    if q["message_th"].strip()
]

# Set comprehension: หาช่องทางทั้งหมดที่ไม่ซ้ำ
channels = {q["channel"] for q in cleaned_queries}

# Dict comprehension: สร้างตารางค้นหา O(1) ด้วย ticket_id
by_id = {q["ticket_id"]: q for q in cleaned_queries}

print("Count:", len(cleaned_queries), "Channels:", sorted(channels))
print("Lookup TKT-003:", by_id["TKT-003"]["message_th"])
print("Original untouched:", repr(raw_queries[0]["ticket_id"]))`,
        caption: "`\" \".join(text.split())` จัดการทั้งช่องว่างหัวท้าย ช่องว่างซ้ำ และ `\\n`/`\\t` ในครั้งเดียว และสร้าง dict ก้อนใหม่โดยไม่แก้ `raw_queries`",
      },
      whyTitle: "Why this matters — เมื่อไหร่ควรใช้ Comprehension และเมื่อไหร่ควรหยุด",
      whyParagraphs: [
        "Comprehension เหมาะที่สุดเมื่อมีเงื่อนไขกรองและแปลง 1–2 ขั้นตรงไปตรงมา หากเริ่มมี `for` ซ้อนเกิน 2 ชั้นหรือมี `if/else` ยาวหลายบรรทัด การแยกเป็นฟังก์ชันช่วย (`helper`) หรือลูป `for` ปกติจะอ่านง่ายและดีบักได้เร็วกว่ามาก",
        "รูปแบบการสร้างข้อมูลใหม่โดยไม่ mutate ต้นฉบับยังสอดคล้องกับแนวคิดของ DataFrame (Polars ใน Phase 2) และระบบ audit log ที่ต้องเก็บ raw {{payload}} ต้นทางไว้เทียบกับข้อมูลหลังทำความสะอาดเสมอ",
      ],
    },
    {
      id: "modern-type-hints",
      title: "3 · Type Hints ยุค Python 3.12: `list[str]`, `str | None` และ `TypedDict`",
      paragraphs: [
        "Python สมัยใหม่ (3.10–3.12+) เลิกใช้ `typing.List`, `typing.Dict` และ `typing.Optional` แบบเก่าแล้ว คุณสามารถเขียนชนิดข้อมูลได้ตรง ๆ ด้วย built-in generics เช่น `list[str]`, `dict[str, int]`, `set[str]`, `tuple[str, int]` และใช้เครื่องหมาย `|` สำหรับ union เช่น `str | None`",
        "เมื่อต้องทำงานกับข้อมูล `dict` ที่มีโครงสร้างคีย์คงที่แต่ยังไม่ต้องการสร้างคลาสเต็มรูปแบบ ให้ใช้ **`TypedDict`** เพื่อประกาศชื่อคีย์และชนิดค่าให้ชัดเจน ทำให้ IDE เติมชื่อคีย์ให้อัตโนมัติและจับการพิมพ์ชื่อคีย์ผิดได้ทันที — แต่ต้องจำให้แม่นว่า **{{type-hint|Type Hints}} และ `TypedDict` ไม่ได้ตรวจข้อมูลตอนรัน (runtime)** หากข้อมูลมาจากภายนอกระบบยังต้องใช้ {{pydantic}} `BaseModel` เป็นด่านตรวจจริง",
      ],
      analogy:
        "{{type-hint|Type Hints}} เหมือนป้ายฉลากบนลังสินค้าที่ช่วยให้พนักงานและคอมพิวเตอร์วางแผนจัดเรียงไม่ผิดช่องก่อนออกรถ ส่วน {{pydantic}} คือด่านตาชั่งและเครื่องสแกนจริงหน้าคลังที่เปิดเช็กของข้างในตอนรับสินค้า",
      code: {
        language: "python",
        filename: "modern_typing.py",
        code: `from typing import TypedDict


class RawQuery(TypedDict):
    ticket_id: str
    channel: str
    message_th: str
    tag: str | None


def normalize_tag(tag: str | None) -> str | None:
    if tag is None:
        return None
    cleaned = tag.strip().lower()
    return cleaned if cleaned else None


def summarize_channels(queries: list[RawQuery]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for q in queries:
        ch = q["channel"].strip().lower()
        counts[ch] = counts.get(ch, 0) + 1
    return counts


sample: list[RawQuery] = [
    {"ticket_id": "TKT-1", "channel": "LINE", "message_th": "เช็กพัสดุครับ", "tag": " Shipping "},
    {"ticket_id": "TKT-2", "channel": "line", "message_th": "ขอใบเสร็จ", "tag": "   "},
]
print("Normalized tags:", [normalize_tag(q["tag"]) for q in sample])
print("Channel counts:", summarize_channels(sample))`,
        caption: "ใช้ `TypedDict`, `list[RawQuery]`, `dict[str, int]` และ `str | None` ตามมาตรฐาน Python 3.12 (สะอาดและผ่านกฎของ Ruff UP007/UP006)",
      },
      whyTitle: "Why this matters — `TypedDict` vs `Pydantic BaseModel` ใช้ต่างกันอย่างไร",
      whyParagraphs: [
        "ใช้ **`TypedDict`** สำหรับโครงสร้างข้อมูลภายในโค้ดที่คุณควบคุมเองและอยากได้ต้นทุนการทำงานเป็นศูนย์ (zero runtime overhead) — เหมาะกับ state ใน LangGraph (Phase 4) หรือ helper function ที่ส่ง `dict` ไปมา",
        "ใช้ **{{pydantic}} {{basemodel}}** ทุกครั้งที่ข้อมูลข้ามขอบระบบ (API request, ไฟล์ JSONL, คำตอบจาก {{llm}}) เพราะต้องการ {{validation}} จริงตอนรันและข้อความ error ที่ชี้ตำแหน่งชัดเจน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Python Collections & Type Hints กับ JS/TS",
      body: [
        "ถ้าคุณคุ้นกับ `.filter().map()` และ TypeScript อยู่แล้ว คุณจะปรับตัวกับ Python 3.12 ได้เร็วมาก เพียงสังเกตว่า Python นิยม comprehension แทน method chaining และ type hints จะถูกตรวจโดยเครื่องมือภายนอกไม่ต่างจาก TS ที่ถูกลบออกตอนรัน:",
      ],
      table: [
        ["`[f(x) for x in xs if ok(x)]`", "`xs.filter(ok).map(f)`"],
        ["`{x['id']: x for x in xs}`", "`Object.fromEntries(xs.map(x => [x.id, x]))`"],
        ["`{x['ch'] for x in xs}`", "`new Set(xs.map(x => x.ch))`"],
        ["`str | None`", "`string | null`"],
        ["`class RawQuery(TypedDict): ...`", "`interface RawQuery { ... }` (static only)"],
        ["`{**row, 'channel': ch}`", "`{ ...row, channel: ch }` (สร้าง object ใหม่ไม่ mutate)"],
      ],
    },
    student: {
      title: "First-Year Note — ระวังเรื่อง Aliasing (ตัวแปรสองชื่อชี้ไปที่ list/dict เดียวกัน)",
      body: [
        "ใน Python การเขียน `b = a` เมื่อ `a` เป็น `list` หรือ `dict` **ไม่ได้ก๊อปปี้ข้อมูลใหม่** แต่ทำให้ทั้ง `a` และ `b` ชี้ไปที่กล่องเดียวกันในหน่วยความจำ ถ้าคุณแก้ `b.append('x')` ค่าใน `a` ก็จะเปลี่ยนตามไปด้วยทันที",
        "ยิ่งไปกว่านั้น แม้จะสร้าง `list` ใหม่ด้วย `[q for q in raw_queries]` แต่ถ้าข้างในยังมี `dict` เดิมอยู่แล้วคุณไปแก้ `q['channel'] = 'line'` มันก็จะไปเปลี่ยน `dict` ใน `raw_queries` ด้วย! วิธีที่ปลอดภัยที่สุดคือสร้าง `dict` ใหม่ด้วย `{**q, 'channel': 'line'}` ทุกครั้งที่แปลงค่า",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองสร้างสายพานทำความสะอาดคำถามลูกค้าภาษาไทย 3 ขั้น ตั้งแต่รับชุด `RawQuery` ดิบที่เลอะเทอะ กรองและจัดดัชนี ไปจนถึงพิสูจน์ว่าข้อมูลต้นฉบับไม่ถูกแก้ไขแม้แต่ตัวอักษรเดียว",
    steps: [
      {
        title: "1 · ประกาศ `TypedDict` และฟังก์ชันทำความสะอาดข้อความภาษาไทย",
        explain:
          "เริ่มจากระบุ {{type-hint}} ของข้อมูลดิบด้วย `TypedDict` และเขียนฟังก์ชัน `clean_message` ที่ยุบช่องว่างซ้ำและบรรทัดใหม่ให้เหลือช่องว่างเดียวด้วย `\" \".join(text.split())`",
        code: {
          language: "python",
          filename: "worked_d002.py",
          code: `from typing import TypedDict


class RawQuery(TypedDict):
    ticket_id: str
    channel: str
    message_th: str
    tag: str | None


def clean_message(text: str) -> str:
    return " ".join(text.split())


raw_batch: list[RawQuery] = [
    {
        "ticket_id": " TKT-101 ",
        "channel": " LINE ",
        "message_th": "  โอนเงินแล้ว   ยอดไม่ขึ้นครับ \nช่วยเช็กหน่อย ",
        "tag": " Billing ",
    },
    {
        "ticket_id": "TKT-102",
        "channel": "web",
        "message_th": "   \t\n  ",
        "tag": "general",
    },
    {
        "ticket_id": "TKT-103",
        "channel": "Email",
        "message_th": "ขอใบกำกับภาษีรอบเดือนนี้ครับ",
        "tag": "billing",
    },
    {
        "ticket_id": "TKT-104",
        "channel": "line",
        "message_th": "เปลี่ยนที่อยู่จัดส่งได้ไหมคะ",
        "tag": "   ",
    },
]
print("Cleaned #1:", repr(clean_message(raw_batch[0]["message_th"])))`,
        },
        output: `Cleaned #1: 'โอนเงินแล้ว ยอดไม่ขึ้นครับ ช่วยเช็กหน่อย'`,
      },
      {
        title: "2 · กรองและสร้างชุดข้อมูลใหม่โดยไม่ Mutate ข้อมูลต้นฉบับ",
        explain:
          "ใช้ list comprehension คู่กับ dict literal ใหม่ (`RawQuery`) เพื่อตัดแถวที่ข้อความว่างหลังทำความสะอาด ปรับ `channel` เป็นตัวพิมพ์เล็ก และเปลี่ยนแท็กที่เป็นช่องว่างล้วนให้เป็น `None`",
        code: {
          language: "python",
          filename: "worked_d002.py",
          code: `def normalize_tag(tag: str | None) -> str | None:
    if tag is None:
        return None
    stripped = tag.strip().lower()
    return stripped if stripped else None


def filter_valid_queries(queries: list[RawQuery]) -> list[RawQuery]:
    return [
        {
            "ticket_id": q["ticket_id"].strip(),
            "channel": q["channel"].strip().lower(),
            "message_th": clean_message(q["message_th"]),
            "tag": normalize_tag(q["tag"]),
        }
        for q in queries
        if clean_message(q["message_th"])
    ]


cleaned = filter_valid_queries(raw_batch)
print("Valid count:", len(cleaned))
for item in cleaned:
    print(item["ticket_id"], "|", item["channel"], "|", item["tag"], "|", item["message_th"])`,
        },
        output: `Valid count: 3
TKT-101 | line | billing | โอนเงินแล้ว ยอดไม่ขึ้นครับ ช่วยเช็กหน่อย
TKT-103 | email | billing | ขอใบกำกับภาษีรอบเดือนนี้ครับ
TKT-104 | line | None | เปลี่ยนที่อยู่จัดส่งได้ไหมคะ`,
      },
      {
        title: "3 · สร้าง `set`, `dict` lookup และพิสูจน์ว่าต้นฉบับไม่ถูกแก้",
        explain:
          "ใช้ set comprehension หาช่องทางทั้งหมด, `dict.fromkeys` ตัดแท็กซ้ำแบบคงลำดับ (ข้าม `None`), และ dict comprehension สร้างตารางค้นหา O(1) จากนั้นเช็กว่า `raw_batch[0]` ยังคงช่องว่างเดิมอยู่ครบ",
        code: {
          language: "python",
          filename: "worked_d002.py",
          code: `channels: set[str] = {q["channel"] for q in cleaned}
ordered_tags: list[str] = list(
    dict.fromkeys(q["tag"] for q in cleaned if q["tag"] is not None)
)
by_id: dict[str, RawQuery] = {q["ticket_id"]: q for q in cleaned}

print("Channels:", sorted(channels))
print("Ordered tags:", ordered_tags)
print("Lookup TKT-103:", by_id["TKT-103"]["message_th"])
print("Raw input still untouched:", repr(raw_batch[0]["ticket_id"]), repr(raw_batch[0]["tag"]))`,
        },
        output: `Channels: ['email', 'line']
Ordered tags: ['billing']
Lookup TKT-103: ขอใบกำกับภาษีรอบเดือนนี้ครับ
Raw input still untouched: ' TKT-101 ' ' Billing '`,
      },
    ],
    gotcha:
      "กับดักที่พบบ่อยที่สุด: เขียน `new_list = [q for q in raw_batch]` แล้วแก้ `q['channel'] = q['channel'].lower()` ข้างใน — แม้ `new_list` จะเป็น list ก้อนใหม่ แต่ `dict` แต่ละตัวข้างในยังเป็นก้อนเดียวกับ `raw_batch` ทำให้ข้อมูลต้นฉบับถูกแก้ตามไปด้วย! ต้องสร้าง `dict` ใหม่ทุกครั้ง",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `query_cleaner.py` สำหรับทำความสะอาด กรอง ตัดซ้ำ และจัดดัชนีคำถามลูกค้าภาษาไทยด้วย Python 3.12 type hints และ comprehensions โดยห้าม mutate อินพุต",
    requirements: [
      "ประกาศ `class RawQuery(TypedDict)` ที่มี 4 คีย์: `ticket_id: str`, `channel: str`, `message_th: str`, `tag: str | None`",
      "สร้าง `clean_message(text: str) -> str` ที่ตัดช่องว่างหัวท้ายและยุบช่องว่างซ้ำ / `\\n` / `\\t` ให้เหลือช่องว่างเดียวด้วย `\" \".join(text.split())`",
      "สร้าง `filter_valid_queries(raw_queries: list[RawQuery]) -> list[RawQuery]` ที่กรองแถวซึ่ง `clean_message(q[\"message_th\"])` ว่างทิ้ง, strip `ticket_id`, strip + lowercase `channel`, และ strip + lowercase `tag` (ถ้าเป็น `None` หรือช่องว่างล้วนให้เป็น `None`) โดย **ต้องไม่ mutate `raw_queries` หรือ `dict` ข้างใน**",
      "สร้าง `index_by_ticket_id(queries: list[RawQuery]) -> dict[str, RawQuery]` (ใช้ dict comprehension) และ `unique_channels(queries: list[RawQuery]) -> set[str]` (ใช้ set comprehension)",
      "สร้าง `unique_ordered_tags(queries: list[RawQuery]) -> list[str]` ที่ดึง `tag` ที่ไม่ใช่ `None` และตัดซ้ำแบบคงลำดับเดิมด้วย `dict.fromkeys(...)`",
    ],
    starter: {
      language: "python",
      filename: "query_cleaner.py",
      code: `from typing import TypedDict


class RawQuery(TypedDict):
    ticket_id: str
    channel: str
    message_th: str
    tag: str | None


def clean_message(text: str) -> str:
    # TODO: ตัดช่องว่างหัวท้ายและยุบช่องว่างซ้ำ / ขึ้นบรรทัดใหม่ให้เหลือช่องว่างเดียว
    raise NotImplementedError


def filter_valid_queries(raw_queries: list[RawQuery]) -> list[RawQuery]:
    # TODO: กรองแถวที่ข้อความว่างทิ้ง และคืน list ของ RawQuery ก้อนใหม่โดยไม่ mutate อินพุต
    raise NotImplementedError


def index_by_ticket_id(queries: list[RawQuery]) -> dict[str, RawQuery]:
    # TODO: สร้าง dict lookup ticket_id -> RawQuery ด้วย dict comprehension
    raise NotImplementedError


def unique_channels(queries: list[RawQuery]) -> set[str]:
    # TODO: คืน set ของ channel ที่ไม่ซ้ำด้วย set comprehension
    raise NotImplementedError


def unique_ordered_tags(queries: list[RawQuery]) -> list[str]:
    # TODO: คืน list ของ tag ที่ไม่ใช่ None และตัดซ้ำแบบคงลำดับเดิม
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_query_cleaner.py",
      code: `import copy
from query_cleaner import (
    RawQuery,
    clean_message,
    filter_valid_queries,
    index_by_ticket_id,
    unique_channels,
    unique_ordered_tags,
)


def sample_raw() -> list[RawQuery]:
    return [
        {
            "ticket_id": " TKT-001 ",
            "channel": " LINE ",
            "message_th": "  โอนเงินแล้ว   แต่สถานะไม่เปลี่ยน \nครับ ",
            "tag": " Billing ",
        },
        {
            "ticket_id": "TKT-002",
            "channel": "web",
            "message_th": "   \t\n  ",
            "tag": "spam",
        },
        {
            "ticket_id": "TKT-003",
            "channel": "Email",
            "message_th": "ขอใบกำกับภาษี",
            "tag": "billing",
        },
        {
            "ticket_id": "TKT-004",
            "channel": "line",
            "message_th": "สอบถามรอบจัดส่งสินค้า",
            "tag": "   ",
        },
        {
            "ticket_id": "TKT-005",
            "channel": "WEB",
            "message_th": "ขอเปลี่ยนแพ็กเกจเป็นรายปี",
            "tag": "VIP",
        },
    ]


def test_clean_message_collapses_whitespace():
    assert clean_message("  สวัสดี\t\tครับ\n\n  ") == "สวัสดี ครับ"
    assert clean_message("   ") == ""


def test_filter_valid_queries_cleans_without_mutating_input():
    raw = sample_raw()
    snapshot = copy.deepcopy(raw)

    cleaned = filter_valid_queries(raw)

    # ห้าม mutate อินพุตต้นฉบับแม้แต่ช่องเดียว
    assert raw == snapshot
    assert len(cleaned) == 4
    assert cleaned[0] == {
        "ticket_id": "TKT-001",
        "channel": "line",
        "message_th": "โอนเงินแล้ว แต่สถานะไม่เปลี่ยน ครับ",
        "tag": "billing",
    }
    assert cleaned[2]["tag"] is None
    assert cleaned[3]["tag"] == "vip"


def test_index_channels_and_ordered_tags():
    cleaned = filter_valid_queries(sample_raw())

    by_id = index_by_ticket_id(cleaned)
    assert set(by_id.keys()) == {"TKT-001", "TKT-003", "TKT-004", "TKT-005"}
    assert by_id["TKT-003"]["channel"] == "email"

    assert unique_channels(cleaned) == {"line", "email", "web"}
    assert unique_ordered_tags(cleaned) == ["billing", "vip"]


def test_empty_input():
    assert filter_valid_queries([]) == []
    assert index_by_ticket_id([]) == {}
    assert unique_channels([]) == set()
    assert unique_ordered_tags([]) == []
`,
    },
    selfCheck: [
      "`clean_message` ยุบช่องว่างซ้ำ, `\\t` และ `\\n` ให้เหลือช่องว่างเดียว และคืน `\"\"` สำหรับข้อความว่างล้วน",
      "`filter_valid_queries` คืนข้อมูลที่สะอาดโดย `raw == copy.deepcopy(raw)` หลังเรียกฟังก์ชัน (ไม่ mutate ต้นฉบับ)",
      "`tag` ที่เป็น `\"   \"` ถูกแปลงเป็น `None` และไม่หลุดเข้ามาใน `unique_ordered_tags`",
      "`unique_ordered_tags` คืน `[\"billing\", \"vip\"]` โดยคงลำดับที่พบครั้งแรกเสมอ",
      "รัน `uv run pytest -q` ผ่านครบ 4 ข้อ และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q` และผ่านการตรวจสไตล์จาก `uv run ruff check .` โดยไม่มี error",
    hints: [
      {
        body: "ใน `filter_valid_queries` ให้สร้าง `dict` ใหม่สำหรับแต่ละรายการแทนการแก้ค่าใน `q` เดิม และเขียน helper เล็ก ๆ สำหรับแปลง `tag: str | None` ให้เป็นพิมพ์เล็กหรือ `None`",
      },
      {
        body: "ใน `unique_ordered_tags` ใช้ `list(dict.fromkeys(q[\"tag\"] for q in queries if q[\"tag\"] is not None))` และใน `index_by_ticket_id` ใช้ `{q[\"ticket_id\"]: q for q in queries}`",
      },
      {
        body: "โครงของ 3 ฟังก์ชันหลักพร้อมแล้ว เหลือเติม `index_by_ticket_id`, `unique_channels` และ `unique_ordered_tags` ด้วย comprehension บรรทัดเดียว",
        code: {
          language: "python",
          filename: "hint-d002-l3.py",
          code: `from typing import TypedDict


class RawQuery(TypedDict):
    ticket_id: str
    channel: str
    message_th: str
    tag: str | None


def clean_message(text: str) -> str:
    return " ".join(text.split())


def _normalize_tag(tag: str | None) -> str | None:
    if tag is None:
        return None
    stripped = tag.strip().lower()
    return stripped if stripped else None


def filter_valid_queries(raw_queries: list[RawQuery]) -> list[RawQuery]:
    return [
        {
            "ticket_id": q["ticket_id"].strip(),
            "channel": q["channel"].strip().lower(),
            "message_th": cleaned,
            "tag": _normalize_tag(q["tag"]),
        }
        for q in raw_queries
        if (cleaned := clean_message(q["message_th"]))
    ]


# TODO: เติม index_by_ticket_id, unique_channels และ unique_ordered_tags`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# วาง query_cleaner.py และ test_query_cleaner.py ในโฟลเดอร์โปรเจกต์
uv run pytest -q
uv run ruff check .`,
      caption: "ใช้ `uv run ruff check --select UP,F,E .` เพื่อตรวจว่าใช้ Python 3.12 type hints ทันสมัยครบทุกจุด",
    },
  },

  mistakes: [
    {
      title: "แก้ค่า `dict` ข้างในระหว่างวนลูปแล้วคิดว่าไม่กระทบต้นฉบับ",
      symptom: "ฟังก์ชันคืน `list` ใหม่ก็จริง แต่เมื่อผู้เรียกกลับไปอ่าน `raw_queries` ตัวเดิม ค่า `channel` และ `message_th` ถูกเปลี่ยนทับไปแล้ว",
      fix: "สร้าง `dict` ก้อนใหม่ด้วย literal หรือ `{**q, \"channel\": ...}` ทุกครั้งใน comprehension แทนการแก้ `q[...] = ...` ในที่เดิม",
    },
    {
      title: "ใช้ `list(set(tags))` เมื่อลำดับข้อมูลมีความสำคัญ",
      symptom: "ผลลัพธ์จาก `unique_ordered_tags` สลับตำแหน่งไปมาในแต่ละรอบการรัน ทำให้ unit test และผล JSON ไม่นิ่ง",
      fix: "ใช้ `list(dict.fromkeys(...))` เมื่อต้องตัดตัวซ้ำแบบคงลำดับเดิม และเก็บ `set` ไว้ใช้กับการเช็กสมาชิก (`in`) หรือเปรียบเทียบเซตที่ไม่สนลำดับ",
    },
    {
      title: "ตั้งค่าเริ่มต้นของพารามิเตอร์เป็น `list` หรือ `dict` ว่าง (`def f(tags: list[str] = []):`)",
      symptom: "ค่าที่เพิ่มในรอบแรกค้างติดไปโผล่ในการเรียกฟังก์ชันรอบที่สองและสาม (Mutable Default Argument Trap)",
      fix: "ใช้ `tags: list[str] | None = None` แล้วค่อยสร้าง `tags = [] if tags is None else list(tags)` ภายในฟังก์ชัน",
    },
    {
      title: "เข้าใจผิดว่า `TypedDict` และ `list[str]` จะโยน Error ตอนรันเมื่อข้อมูลผิดชนิด",
      symptom: "ส่ง `{\"ticket_id\": 123}` เข้าฟังก์ชันที่รับ `RawQuery` แล้วโปรแกรมไม่แจ้งเตือนจนไปพัง `AttributeError: 'int' object has no attribute 'strip'` ลึกเข้าไปในระบบ",
      fix: "จำไว้ว่า Python {{type-hint}} ช่วยตรวจแบบ static (IDE/linter) เท่านั้น — สำหรับข้อมูลดิบจากภายนอกให้ส่งผ่าน {{pydantic}} `BaseModel` ที่ขอบระบบเสมอ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความเข้าใจเรื่อง Collections, Non-Mutating Comprehensions และ Python 3.12 Type Hints",
    questions: [
      mc(
        "d002-q1",
        "คุณมีรายชื่อ `blocked_user_ids` จำนวน 50,000 รหัส และต้องตรวจว่า `user_id` ของแต่ละคำถามอยู่ในรายชื่อนี้หรือไม่ ควรเก็บ `blocked_user_ids` ในโครงสร้างข้อมูลใด?",
        [
          ["`list[str]` เพราะค้นหาจากต้นถึงท้ายได้ตรงไปตรงมา", "การเช็ก `in` บน `list` ใช้เวลา $O(n)$ — เมื่อทำในลูปจะช้ามาก"],
          ["`tuple[str, ...]` เพราะแก้ค่าไม่ได้จึงค้นหาได้เร็วกว่า `set`", "แม้ `tuple` จะ immutable แต่การเช็ก `in` ยังต้องไล่เทียบทีละตัวเป็น $O(n)$ อยู่ดี"],
          ["`set[str]` เพราะใช้ hash table เช็กสมาชิก `in` ได้ในเวลาเฉลี่ย $O(1)$", "ถูก — `set` ออกแบบมาเพื่อ membership check ที่รวดเร็วและเก็บค่าไม่ซ้ำ"],
          ["`str` ที่ต่อกันด้วยเครื่องหมายจุลภาคแล้วใช้ `in`", "เสี่ยงจับสตริงย่อยผิด เช่น `'10'` ไปตรงกับ `'105'` และยังเป็น $O(n)$"],
        ],
        "C",
        "สำหรับงานเช็กสมาชิก (`in`) จากชุดข้อมูลขนาดใหญ่ `set` (หรือคีย์ของ `dict`) ทำงานในเวลาเฉลี่ย $O(1)$ เร็วกว่า `list`/`tuple` ที่เป็น $O(n)$ หลายพันเท่า",
        "เหตุใดจึงควรเก็บ stopwords หรือ blocklist ขนาดใหญ่ไว้ใน `set` แทน `list`?",
        "เพราะ `x in my_set` ใช้ hash lookup เฉลี่ย $O(1)$ ขณะที่ `x in my_list` ต้องไล่เทียบทีละตัวเป็น $O(n)$",
      ),
      mc(
        "d002-q2",
        "หาก `raw` เป็น `list[dict[str, str]]` โค้ดข้อใดที่แปลง `channel` เป็นตัวพิมพ์เล็ก **โดยไม่ mutate ข้อมูลใน `raw`**?",
        [
          ["`for q in raw: q['channel'] = q['channel'].lower()`", "แก้ `dict` ข้างใน `raw` โดยตรง ทำให้ข้อมูลต้นฉบับเปลี่ยนทั้งหมด"],
          ["`cleaned = raw.copy(); cleaned[0]['channel'] = 'line'`", "`list.copy()` เป็นเพียง shallow copy — `dict` ข้างในยังเป็นก้อนเดียวกับ `raw`"],
          ["`cleaned = [{**q, 'channel': q['channel'].lower()} for q in raw]`", "ถูก — สร้างทั้ง `list` ใหม่และ `dict` ก้อนใหม่สำหรับทุกรายการ จึงไม่แตะต้อง `raw`"],
          ["`cleaned = [q.update({'channel': q['channel'].lower()}) for q in raw]`", "`dict.update()` แก้ข้อมูลเดิมในที่เดิมและคืนค่า `None`!"],
        ],
        "C",
        "การสร้าง `list` ใหม่ยังไม่พอหากข้างในเป็น `dict` — ต้องสร้าง `dict` ใหม่ด้วย `{**q, ...}` หรือ dict literal เพื่อให้ข้อมูลต้นฉบับปลอดภัย 100%",
        "ทำไม `raw.copy()` จึงยังไม่พอป้องกันการ mutate เมื่อ `raw` เป็น `list[dict]`?",
        "เพราะ `.copy()` เป็น shallow copy ที่ก๊อปปี้เฉพาะ list ชั้นนอก แต่ dict ข้างในยังชี้ไปที่ออบเจกต์เดิม ต้องสร้าง dict ก้อนใหม่เช่น `{**q, ...}`",
      ),
      mc(
        "d002-q3",
        "ข้อใดอธิบายพฤติกรรมของ `TypedDict` และ Python 3.12 {{type-hint}} อย่าง `str | None` ได้ถูกต้องที่สุด?",
        [
          ["Python จะโยน `TypeError` ทันทีตอนรันหากส่ง `int` เข้าฟิลด์ที่ระบุเป็น `str | None`", "ไม่จริง — Python ไม่บังคับตรวจ type hint ตอนรันโดยอัตโนมัติ"],
          ["ช่วยตรวจความถูกต้องแบบ static ใน IDE / type checker / Ruff แต่ตอนรันจริงยังเป็น `dict` ธรรมดา ต้องใช้ Pydantic หากต้องการ runtime validation", "ถูก — `TypedDict` ไม่มี runtime overhead แต่ไม่ทำหน้าที่เป็น runtime validator"],
          ["`str | None` ใช้ได้เฉพาะใน Pydantic เท่านั้น ใช้กับฟังก์ชัน Python ปกติไม่ได้", "ตั้งแต่ Python 3.10 เป็นต้นมา `str | None` เป็นไวยากรณ์มาตรฐานของภาษาที่ใช้ได้ทุกที่"],
          ["ต้อง `from typing import List, Optional` เสมอใน Python 3.12", "ไม่จำเป็นแล้ว — Python 3.12 ใช้ `list[str]` และ `str | None` ได้โดยตรง"],
        ],
        "B",
        "`TypedDict` และ built-in generics (`list[str]`, `str | None`) ทำให้โค้ดสะอาดและตรวจข้อผิดพลาดได้ตั้งแต่ตอนเขียน ส่วนการตรวจข้อมูลจากภายนอกตอนรันให้ใช้ Pydantic `BaseModel`",
        "`TypedDict` ต่างจาก `Pydantic BaseModel` อย่างไรในแง่การทำงานตอนรัน?",
        "`TypedDict` ตรวจเฉพาะตอน static analysis (runtime เป็น `dict` ธรรมดา ไม่มี overhead) ส่วน `BaseModel` ตรวจและแปลงชนิดข้อมูลจริงตอนรันพร้อมโยน `ValidationError`",
      ),
      mc(
        "d002-q4",
        "ต้องการสกัด `tag` ที่ไม่ใช่ `None` จาก `queries` แล้วตัดตัวซ้ำ **โดยรักษาลำดับที่พบครั้งแรก** นิพจน์ใดเหมาะสมที่สุด?",
        [
          ["`list({q['tag'] for q in queries if q['tag'] is not None})`", "set comprehension ไม่รับประกันลำดับคงที่เมื่อแปลงกลับเป็น `list`"],
          ["`list(dict.fromkeys(q['tag'] for q in queries if q['tag'] is not None))`", "ถูก — กรอง `None` ออกและใช้ `dict.fromkeys` ตัดซ้ำในเวลา $O(n)$ โดยคงลำดับเดิม 100%"],
          ["`sorted(set(q['tag'] for q in queries))`", "เรียงตามตัวอักษรใหม่แทนลำดับเดิม และจะพัง `TypeError` เมื่อเทียบ `str` กับ `None`"],
          ["`[q['tag'] for q in queries if q['tag']]`", "ไม่ได้ตัดตัวซ้ำออก"],
        ],
        "B",
        "`dict` ของ Python รักษาลำดับการแทรกตั้งแต่เวอร์ชัน 3.7 ทำให้ `list(dict.fromkeys(...))` เป็นวิธีมาตรฐานที่ทั้งเร็วและ deterministic",
        "สำนวน Python มาตรฐานสำหรับตัดสมาชิกซ้ำใน list โดยรักษาลำดับเดิมคืออะไร?",
        "`list(dict.fromkeys(items))` — ทำงานในเวลา $O(n)$ และคงลำดับเดิมทุกครั้ง",
      ),
    ],
  },

  takeaways: [
    "เลือก collection ให้ตรงงาน: `list` สำหรับลำดับ, `tuple` สำหรับค่าคงที่, `set` สำหรับเช็กสมาชิก $O(1)$ และ `dict` สำหรับตารางค้นหา $O(1)$ ที่คงลำดับ",
    "ใช้ list/set/dict {{comprehension}} คู่กับการสร้าง `dict` ก้อนใหม่ (`{**q, ...}`) เพื่อทำความสะอาดข้อมูลภาษาไทยโดยไม่ mutate อินพุตต้นฉบับ",
    "เขียน {{type-hint}} แบบ Python 3.12 (`list[str]`, `dict[str, int]`, `str | None`, `TypedDict`) ให้ชัดทุกฟังก์ชัน และจำไว้ว่า `TypedDict` ไม่ได้ตรวจข้อมูลตอนรันเหมือน {{pydantic}}",
    "ตัดตัวซ้ำแบบคงลำดับด้วย `list(dict.fromkeys(...))` เพื่อให้ข้อมูลและเทสต์นิ่งทุกครั้งก่อนนำไปต่อยอดใน Day 3–4",
  ],

  reviewCards: [
    rc(
      "d002-rc-1",
      "ต่างกันอย่างไรระหว่างการเช็ก `x in items` เมื่อ `items` เป็น `list` เทียบกับ `set`?",
      "`list` ไล่ค้นหาทีละตัวใช้เวลา $O(n)$ ส่วน `set` ใช้ hash lookup เฉลี่ย $O(1)$ จึงเร็วกว่ามากเมื่อข้อมูลมีขนาดใหญ่",
    ),
    rc(
      "d002-rc-2",
      "ทำไมการแปลง `list[dict]` ด้วย comprehension จึงยังอาจ mutate ข้อมูลต้นฉบับได้ และป้องกันอย่างไร?",
      "หากแก้คีย์ของ `dict` ตัวเดิมในที่เดิม (`q['k'] = ...`) ข้อมูลต้นฉบับจะเปลี่ยนตาม ต้องสร้าง `dict` ใหม่ด้วย `{**q, 'k': new_val}` หรือ dict literal ใหม่เสมอ",
    ),
    rc(
      "d002-rc-3",
      "เมื่อไหร่ควรใช้ `TypedDict` และเมื่อไหร่ควรใช้ `Pydantic BaseModel`?",
      "ใช้ `TypedDict` สำหรับ `dict` ภายในระบบที่ต้องการ static type hint โดยไม่มี runtime overhead; ใช้ `BaseModel` ที่ขอบระบบเมื่อต้องการ runtime validation และ `ValidationError`",
    ),
  ],

  sources: [
    { label: "Python 3.12 Docs — Data Structures (Lists, Tuples, Sets, Dicts & Comprehensions)", href: "https://docs.python.org/3/tutorial/datastructures.html" },
    { label: "Python 3.12 Docs — typing & TypedDict", href: "https://docs.python.org/3/library/typing.html#typing.TypedDict" },
    { label: "PEP 604 — Allow writing union types as X | Y", href: "https://peps.python.org/pep-0604/" },
    { label: "Ruff Rules — pyupgrade (Modern Python Type Hints)", href: "https://docs.astral.sh/ruff/rules/#pyupgrade-up" },
  ],

  glossary: [
    "comprehension",
    "type-hint",
    "data-contract",
    "payload",
    "pydantic",
    "validation",
    "pytest",
    "ruff",
  ],
});
