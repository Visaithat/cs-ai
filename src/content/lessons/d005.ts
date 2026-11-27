import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D005 — Phase 1 / Block B02
 * File I/O, pathlib & Streaming JSONL Datasets.
 */
export const d005: Lesson = defineLesson({
  day: 5,
  titleTh: "จัดการไฟล์ด้วย pathlib และสตรีมชุดข้อมูล JSONL ทีละบรรทัด",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ใช้ pathlib.Path + UTF-8 และ generator อ่านเขียน JSONL ใหญ่โดยไม่กิน RAM",
  icon: "folder-open",
  visual: {
    id: "jsonl-stream",
    title: "JSON Array (กิน RAM ทั้งไฟล์) vs Streaming JSONL ทีละบรรทัด",
    caption: "กดเทียบการใช้หน่วยความจำเมื่ออ่านชุดข้อมูล 100,000 แถวด้วย generator + pathlib",
    alt: "แผนภาพเปรียบเทียบการโหลด JSON ทั้งไฟล์กับการสตรีม JSONL ทีละบรรทัด",
  },
  requiresApiKey: false,
  tools: ["pathlib", "Pydantic v2", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "อ่าน-เขียนชุดข้อมูล AI ขนาดใหญ่จากดิสก์อย่างปลอดภัย",
      body: "ข้อมูลแชท ทิกเก็ตลูกค้า และเอกสารภาษาไทยมักถูกเก็บเป็นไฟล์หลายหมื่นถึงหลายแสนแถว การเปิดไฟล์ข้ามระบบปฏิบัติการ (Windows/macOS/Linux) โดยไม่พังเรื่อง path หรือภาษาไทยต่างดาวคือพื้นฐานสำคัญของ Data Pipeline",
      lessonNote: "วันนี้เราใช้ {{pathlib}} คู่กับ `encoding=\"utf-8\"` และ generator เพื่อสตรีม {{jsonl}} ทีละบรรทัดโดยใช้ RAM คงที่",
    },
    {
      node: 2,
      heading: "ป้อนข้อมูลทีละชิ้นให้ขั้นเตรียม Feature หรือ Batch Inference",
      body: "ทั้งตอนเตรียมชุดเทรนโมเดล ML ใน Phase 2 และตอนสร้างไฟล์ยิง LLM Batch API ใน Phase 3 รูปแบบมาตรฐานที่เครื่องมือทั่วโลกใช้ร่วมกันคือ JSON Lines (`.jsonl`)",
      lessonNote: "การเชื่อม generator เข้ากับ {{pydantic}} ช่วยให้คุณคัดกรองแถวดี-แถวเสียไหลผ่านท่อได้ทันทีโดยไม่ต้องรอโหลดครบทั้งไฟล์",
    },
    {
      node: 3,
      heading: "จัดเก็บ Golden Dataset และผลลัพธ์การประเมินเป็นไฟล์ที่ diff ได้",
      body: "ชุดทดสอบประเมินโมเดล ({{golden-dataset}}) ที่เก็บเป็น `.jsonl` สามารถเปิดอ่านทีละบรรทัด ทำ version control ใน Git และต่อท้ายผลรันใหม่ได้ง่ายกว่าไฟล์ JSON ก้อนยักษ์",
      lessonNote: "รูปแบบ 1 บรรทัด = 1 เรคคอร์ดทำให้เห็นการเปลี่ยนแปลงรายเคสได้ชัดเจน",
    },
    {
      node: 5,
      heading: "แยกแถวที่พังออกเป็น Dead-Letter File เพื่อตรวจสอบย้อนหลัง",
      body: "เมื่อไฟล์จากระบบภายนอกมี JSON ขาดปีกกาหรือฟิลด์ไม่ครบเพียง 1 บรรทัดในแสนแถว ระบบผลิตจริงต้องไม่ล่มกลางทาง แต่บันทึกเลขบรรทัดและสาเหตุเก็บไว้ให้ทีมวิเคราะห์",
      lessonNote: "คุณจะได้เขียนตัวอ่าน JSONL แบบ fault-tolerant ที่รายงานเลขบรรทัด (`line_no`) ของข้อมูลเสียทุกจุด",
    },
  ],

  objectives: [
    "**จัดการเส้นทางไฟล์ข้ามระบบปฏิบัติการ** ด้วย {{pathlib|pathlib.Path}} (`/` operator, `.mkdir(parents=True, exist_ok=True)`, `.glob()`) และระบุ `encoding=\"utf-8\"` เสมอเพื่อป้องกันภาษาไทยเพี้ยนบน Windows",
    "**สร้างฟังก์ชันสตรีมข้อมูล** ด้วย Python generator (`yield`) เพื่ออ่านและเขียนไฟล์ {{jsonl}} ทีละบรรทัดด้วยหน่วยความจำคงที่ $O(1)$ แทนการโหลดทั้งไฟล์เข้า RAM",
    "**ออกแบบตัวอ่าน JSONL แบบทนต่อข้อผิดพลาด (Fault-Tolerant)** ที่ข้ามบรรทัดว่าง แยกจับทั้ง `json.JSONDecodeError` และ {{validation-error}} รายบรรทัดโดยไม่ทำลายงานทั้งไฟล์",
  ],

  prerequisites: [
    "สร้าง {{basemodel}} และเรียก `model_validate` / `model_dump_json` จาก Block B01 ได้คล่อง",
    "รู้จัก `for` loop, `try/except` และ {{type-hint}} พื้นฐานใน Python 3.11+",
    "มี {{uv}}, `pydantic`, `pytest` และ `ruff` พร้อมใช้งานบนเครื่อง (ไม่ต้องใช้ API key)",
  ],

  setup: {
    intro:
      "ตั้งโฟลเดอร์งาน Day 5 ด้วย {{uv}} โดย `pathlib` และ `json` เป็นไลบรารีมาตรฐานใน Python อยู่แล้ว เพิ่มเพียง `pydantic` และ dev tools สำหรับรันเทสต์",
    commands: `uv init ai-day5-jsonl && cd ai-day5-jsonl
uv add pydantic
uv add --dev pytest ruff

# ตรวจว่าสภาพแวดล้อมพร้อมใช้งาน
uv run python -c "from pathlib import Path; print('CWD:', Path.cwd())"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day5-jsonl` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic` และ `--dev pytest ruff`"],
      ["verify", "ทดสอบ `Path.cwd()` ผ่าน `uv run python` สำเร็จ"],
    ],
    note: "แบบฝึกหัดวันนี้ใช้ไฟล์ชั่วคราวผ่าน `tmp_path` ของ pytest จึงไม่ต้องเตรียมไฟล์ข้อมูลเองและไม่ทิ้งไฟล์ขยะไว้บนเครื่อง",
  },

  concepts: [
    {
      id: "pathlib-and-utf8",
      title: "1 · ใช้ pathlib.Path และ encoding=\"utf-8\" เสมอสำหรับภาษาไทย",
      paragraphs: [
        "โค้ด Python ยุคเก่ามักต่อ path ด้วยสตริง เช่น `\"data/\" + name` หรือ `os.path.join(...)` ซึ่งแตกง่ายเมื่อรันสลับระหว่าง Windows (`\\`) กับ Linux/macOS (`/`) โมดูลมาตรฐาน {{pathlib}} แก้ปัญหานี้ด้วยการแทน path เป็นออบเจกต์ `Path` ที่ต่อเส้นทางได้ด้วยเครื่องหมาย `/` และมีเมธอดครบในตัว เช่น `.exists()`, `.suffix`, `.parent.mkdir(parents=True, exist_ok=True)` และ `.glob(\"*.jsonl\")`",
        "กฎเหล็กสำหรับนักพัฒนาไทยบน Windows: **ระบุ `encoding=\"utf-8\"` ทุกครั้งที่เปิด อ่าน หรือเขียนไฟล์** เพราะค่าเริ่มต้นของ Windows มักเป็น `cp874` หรือ `cp1252` ทำให้ภาษาไทยเกิด `UnicodeDecodeError` หรือกลายเป็นตัวอักษรต่างดาวทันทีเมื่อเปิดไฟล์ข้ามเครื่อง",
      ],
      analogy:
        "เหมือนการใช้รหัสไปรษณีย์และจ่าหน้าซองมาตรฐานสากลแทนการเขียนแผนที่ด้วยมือ — ไม่ว่าส่งจาก Windows หรือ Linux ปลายทางเปิดอ่านภาษาไทยได้ตรงทุกตัวอักษร",
      bullets: [
        "**ต่อ path ปลอดภัย**: `data_dir / \"raw\" / \"tickets.jsonl\"` ทำงานถูกต้องทั้ง Windows, macOS และ Linux",
        "**สร้างโฟลเดอร์ปลายทางอัตโนมัติ**: `out_path.parent.mkdir(parents=True, exist_ok=True)` กัน `FileNotFoundError` ก่อนเขียนไฟล์",
        "**UTF-8 ทุกจุด**: ใส่ `encoding=\"utf-8\"` ทั้งใน `path.open(...)`, `path.read_text(...)` และ `path.write_text(...)`",
      ],
      code: {
        language: "python",
        filename: "pathlib_utf8_demo.py",
        code: `from pathlib import Path

base_dir = Path("data")
output_path = base_dir / "processed" / "greeting.txt"

# สร้างโฟลเดอร์แม่ให้อัตโนมัติหากยังไม่มี
output_path.parent.mkdir(parents=True, exist_ok=True)

# ระบุ encoding="utf-8" เสมอทั้งตอนเขียนและอ่าน
output_path.write_text("สวัสดี Neural Path — ทดสอบภาษาไทย UTF-8\\n", encoding="utf-8")
content = output_path.read_text(encoding="utf-8")
print(output_path.resolve(), "->", content.strip())`,
        caption: "ใช้ `Path` คู่กับ `.parent.mkdir(parents=True, exist_ok=True)` และ `encoding=\"utf-8\"` เพื่อป้องกันบั๊กข้าม OS",
      },
      whyTitle: "Why this matters — บั๊ก UnicodeEncodeError บน Windows ที่มือใหม่เจอบ่อยสุด",
      whyParagraphs: [
        "โค้ดที่ไม่ได้ใส่ `encoding=\"utf-8\"` มักรันผ่านฉลุยบนเครื่อง Mac/Linux ของเพื่อนร่วมทีม แต่พอรันบน Windows ของทีมธุรกิจหรือเครื่องทดสอบภาษาไทยกลับพังทันทีด้วย `UnicodeDecodeError: 'charmap' codec can't decode byte`",
        "การฝึกนิสัยใส่ `encoding=\"utf-8\"` และใช้ `Path` ตั้งแต่วันนี้จะช่วยให้ทุก pipeline ของคุณพร้อมย้ายขึ้น Docker Linux ใน Phase 5 โดยไม่ต้องมานั่งแก้โค้ดย้อนหลัง",
      ],
    },
    {
      id: "streaming-jsonl-generators",
      title: "2 · สตรีมไฟล์ JSONL ทีละบรรทัดด้วย Generator (`yield`)",
      paragraphs: [
        "ไฟล์ JSON ปกติที่ห่อข้อมูลทั้งหมดไว้ใน array `[ {...}, {...} ]` บังคับให้โปรแกรมต้องอ่านทั้งไฟล์เข้าหน่วยความจำก่อนจึงเริ่มประมวลผลได้ หากชุดข้อมูลมีขนาด 2 GB เครื่องหรือ container ที่มี RAM จำกัดจะโดนฆ่าด้วย Out-of-Memory (OOM) ทันที",
        "{{jsonl}} (JSON Lines) เก็บข้อมูล 1 ออบเจกต์ต่อ 1 บรรทัด เมื่อจับคู่กับ **Generator function** ที่ใช้คำสั่ง `yield` ภายในบล็อก `with path.open(\"r\", encoding=\"utf-8\") as f:` โปรแกรมจะอ่านและคืนข้อมูลเพียงทีละ 1 บรรทัด ทำให้ใช้หน่วยความจำคงที่ $O(1)$ ไม่ว่าไฟล์จะมี 100 แถวหรือ 10,000,000 แถว",
      ],
      analogy:
        "การอ่าน JSON Array ทั้งไฟล์เหมือนยกถังน้ำ 1,000 ลิตรทีเดียวจนหลังหัก ส่วนการสตรีม JSONL ด้วย generator เหมือนเปิดก๊อกน้ำให้ไหลผ่านทีละแก้ว — ใช้แรงเท่าเดิมไม่ว่าถังจะใหญ่แค่ไหน",
      code: {
        language: "python",
        filename: "jsonl_generator.py",
        code: `import json
from collections.abc import Iterable, Iterator
from pathlib import Path


def iter_jsonl(path: Path) -> Iterator[dict]:
    """อ่านไฟล์ JSONL ทีละบรรทัดแบบ lazy (ใช้ RAM คงที่ O(1))"""
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if not stripped:
                continue  # ข้ามบรรทัดว่างอย่างปลอดภัย
            yield json.loads(stripped)


def write_jsonl(path: Path, records: Iterable[dict]) -> int:
    """เขียนข้อมูลทีละรายการลงไฟล์ JSONL และคืนจำนวนแถวที่เขียน"""
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8") as handle:
        for item in records:
            # ensure_ascii=False เพื่อคงตัวอักษรไทยอ่านง่ายและไฟล์เล็กลง
            handle.write(json.dumps(item, ensure_ascii=False) + "\\n")
            count += 1
    return count`,
        caption: "สังเกตว่า `write_jsonl` รับ `Iterable[dict]` จึงต่อท่อรับผลจาก generator ตรง ๆ ได้โดยไม่ต้องแปลงเป็น `list` ก่อน",
      },
      whyTitle: "Why this matters — `ensure_ascii=False` กับขนาดไฟล์ภาษาไทย",
      whyParagraphs: [
        "ค่าเริ่มต้นของ `json.dumps` ใน Python คือ `ensure_ascii=True` ซึ่งแปลงตัวอักษรไทย 1 ตัว (3 bytes ใน UTF-8) ให้กลายเป็น `\\u0e01` (6 bytes) ทำให้ไฟล์ภาษาไทยใหญ่ขึ้นเกือบ 2 เท่าและอ่านใน editor ไม่รู้เรื่อง",
        "การกำหนด `ensure_ascii=False` (หรือใช้ `model.model_dump_json()` ของ Pydantic v2 ซึ่งคง UTF-8 ให้เอง) ทำให้ไฟล์ JSONL ภาษาไทยอ่านออกได้ทันทีและประหยัดพื้นที่ดิสก์",
      ],
    },
    {
      id: "fault-tolerant-streaming",
      title: "3 · อ่านและตรวจ Schema แบบ Fault-Tolerant ทีละบรรทัด",
      paragraphs: [
        "ในข้อมูลจริงที่เก็บสะสมข้ามเดือน ไฟล์ `.jsonl` อาจมีทั้งบรรทัดว่าง บรรทัดที่ JSON ขาดเครื่องหมายปิด (`json.JSONDecodeError`) หรือบรรทัดที่ JSON ถูกต้องแต่ไม่ผ่าน {{schema}} ของ {{pydantic}} ({{validation-error}})",
        "หากเราจับข้อผิดพลาดทั้งสองชนิดไว้ **ภายในลูปของแต่ละบรรทัด** พร้อมบันทึกหมายเลขบรรทัดด้วย `enumerate(handle, start=1)` ท่อประมวลผลจะสามารถเขียนรายการที่ผ่านลงไฟล์ปลายทาง (`clean.jsonl`) และคัดรายการที่พังออกไปเก็บในรายงานหรือไฟล์ dead-letter แยกต่างหากได้อย่างสะอาด",
      ],
      analogy:
        "เหมือนสายพานคัดแยกไปรษณีย์อัตโนมัติ — ซองที่ฉีกขาดหรือจ่าหน้าไม่ครบจะถูกดีดลงกล่องพักพร้อมเลขลำดับซอง ส่วนซองที่สมบูรณ์ไหลต่อสู่ปลายทางไม่สะดุด",
      code: {
        language: "python",
        filename: "fault_tolerant_stream.py",
        code: `import json
from dataclasses import dataclass
from pathlib import Path
from pydantic import BaseModel, ValidationError


class ChatLog(BaseModel):
    msg_id: str
    text_th: str


@dataclass(frozen=True)
class LineError:
    line_no: int
    kind: str
    detail: str


def stream_validate_jsonl(
    src: Path, dst: Path
) -> tuple[int, list[LineError]]:
    dst.parent.mkdir(parents=True, exist_ok=True)
    ok_count = 0
    errors: list[LineError] = []

    with (
        src.open("r", encoding="utf-8") as fin,
        dst.open("w", encoding="utf-8") as fout,
    ):
        for line_no, raw_line in enumerate(fin, start=1):
            stripped = raw_line.strip()
            if not stripped:
                continue
            try:
                record = ChatLog.model_validate_json(stripped)
            except ValidationError as err:
                # Pydantic v2 model_validate_json ดักได้ทั้ง JSON syntax พังและ schema พัง!
                kind = "json_error" if err.errors()[0]["type"] == "json_invalid" else "schema_error"
                errors.append(LineError(line_no=line_no, kind=kind, detail=err.errors()[0]["msg"]))
                continue
            fout.write(record.model_dump_json() + "\\n")
            ok_count += 1

    return ok_count, errors`,
        caption: "`model_validate_json(stripped)` ใน Pydantic v2 parse JSON ด้วย Rust ตรง ๆ เร็วกว่าการเรียก `json.loads` แล้วค่อย `model_validate` และดักได้ทั้ง JSON พังและ schema พังในจุดเดียว",
      },
      whyTitle: "Why this matters — ทำไม `model_validate_json` จึงเหมาะกับ JSONL ที่สุด",
      whyParagraphs: [
        "การเรียก `json.loads` แล้วส่ง dict เข้า `model_validate` ต้องสร้าง Python dict ชั่วคราวทีละแสนก้อน แต่ `model_validate_json(line)` ให้แกน Rust (`pydantic-core`) แปลงและตรวจ schema ในรอบเดียว เร็วกว่าและประหยัดหน่วยความจำกว่ามาก",
        "เมื่อรวมกับ `with src.open(...) as fin, dst.open(...) as fout:` คุณได้ท่อแปลงไฟล์สตรีมมิ่งแบบ zero-buffering ที่พร้อมใช้งานระดับ production",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ pathlib & JSONL Generator กับ Node.js",
      body: [
        "ถ้าคุณเคยใช้ `node:path`, `fs.createReadStream` และ `readline` เพื่ออ่านไฟล์ NDJSON ใน Node.js แนวคิดใน Python แทบเหมือนกันแต่สั้นและอ่านง่ายกว่ามาก:",
      ],
      table: [
        ["`Path(\"data\") / \"raw\" / \"a.jsonl\"`", "`path.join(\"data\", \"raw\", \"a.jsonl\")`"],
        ["`path.parent.mkdir(parents=True, exist_ok=True)`", "`fs.mkdirSync(path.dirname(p), { recursive: true })`"],
        ["`with path.open(\"r\", encoding=\"utf-8\") as f:`", "`fs.createReadStream(p, { encoding: \"utf8\" })`"],
        ["`for line in f: yield ...` (Generator)", "`for await (const line of rl) { ... }` (AsyncIterable)"],
        ["`record.model_dump_json() + \"\\n\"`", "`JSON.stringify(record) + \"\\n\"` (NDJSON)"],
      ],
    },
    student: {
      title: "First-Year Note — Generator (`yield`) ต่างจาก `return list` อย่างไร?",
      body: [
        "ฟังก์ชันปกติที่สร้าง `items = []` แล้ว `return items` จะทำงานจนครบทุกแถวและเก็บทุกอย่างไว้ใน RAM ก่อนส่งกลับทีเดียว",
        "ส่วนฟังก์ชันที่ใช้ `yield` จะหยุดชั่วคราวทุกครั้งที่ส่งค่าออกมา 1 ตัว และจำตำแหน่งเดิมไว้ พอ `for` loop ขอตัวถัดไปมันค่อยอ่านบรรทัดถัดไปจากไฟล์ — เปรียบเหมือนอ่านหนังสือทีละหน้าแทนการถ่ายเอกสารทั้งเล่มมากองบนโต๊ะ",
        "ข้อควรระวังเดียวของ generator คือ **มันใช้ได้รอบเดียว (one-shot)** ถ้าวน `for` จบแล้วลองวนซ้ำอีกครั้งจะได้ความว่างเปล่า เพราะตัวชี้ไฟล์อ่านไปถึงท้ายไฟล์แล้ว",
      ],
    },
  },

  workedExample: {
    intro:
      "มาดูตัวอย่างแบบครบวงจร: สร้างไฟล์ทิกเก็ตภาษาไทยแบบ `.jsonl` ที่มีทั้งแถวปกติ บรรทัดว่าง JSON พัง และ schema พัง แล้วสตรีมคัดกรองออกเป็น `clean.jsonl` พร้อมรายงานบรรทัดที่เสีย",
    steps: [
      {
        title: "1 · เตรียมไฟล์ตัวอย่างด้วย pathlib และ encoding=\"utf-8\"",
        explain:
          "ใช้ `Path` สร้างโฟลเดอร์ `work_d005` และเขียนไฟล์ `raw_tickets.jsonl` ที่มี 5 บรรทัด (รวมบรรทัดว่างและบรรทัดที่พัง) เพื่อจำลองข้อมูลจริง",
        code: {
          language: "python",
          filename: "worked_d005.py",
          code: `from pathlib import Path

work_dir = Path("work_d005")
raw_path = work_dir / "raw_tickets.jsonl"
raw_path.parent.mkdir(parents=True, exist_ok=True)

sample_lines = [
    '{"ticket_id": "TKT-001", "message_th": "โอนเงินแล้วแต่ระบบยังไม่ยืนยัน", "priority": "high"}',
    "",
    '{"ticket_id": "TKT-002", "message_th": "JSON ขาดปีกกาปิด',
    '{"ticket_id": "TKT-003", "message_th": "สั้น", "priority": "invalid"}',
    '{"ticket_id": "TKT-004", "message_th": "ขอเปลี่ยนที่อยู่จัดส่งใบเสร็จครับ", "priority": "normal"}',
]
raw_path.write_text("\\n".join(sample_lines) + "\\n", encoding="utf-8")
print("Wrote:", raw_path, "bytes:", raw_path.stat().st_size)`,
        },
        output: `Wrote: work_d005/raw_tickets.jsonl bytes: 392`,
      },
      {
        title: "2 · นิยาม Schema และ Generator อ่านไฟล์ทีละบรรทัด",
        explain:
          "เขียน `iter_raw_lines(path)` ที่ `yield (line_no, stripped_text)` โดยข้ามบรรทัดว่างและรักษาเลขบรรทัดจริงจากไฟล์ต้นฉบับ",
        code: {
          language: "python",
          filename: "worked_d005.py",
          code: `from collections.abc import Iterator
from typing import Literal
from pydantic import BaseModel, Field, ValidationError


class TicketLine(BaseModel):
    ticket_id: str = Field(min_length=7)
    message_th: str = Field(min_length=5)
    priority: Literal["low", "normal", "high"] = "normal"


def iter_nonempty_lines(path: Path) -> Iterator[tuple[int, str]]:
    with path.open("r", encoding="utf-8") as handle:
        for line_no, raw_line in enumerate(handle, start=1):
            stripped = raw_line.strip()
            if stripped:
                yield line_no, stripped`,
        },
        output: `# พร้อมสตรีมไฟล์ทีละบรรทัดโดยรู้หมายเลขบรรทัดจริง (1-based)`,
      },
      {
        title: "3 · สตรีมตรวจ Schema แยกออกเป็น clean.jsonl และ dead_letter.jsonl",
        explain:
          "วนรับผลจาก `iter_nonempty_lines` ทีละบรรทัด แถวที่ผ่านเขียนลง `clean.jsonl` ด้วย `model_dump_json()` แถวที่พังเขียนเก็บเลขบรรทัดและสาเหตุลง `dead_letter.jsonl`",
        code: {
          language: "python",
          filename: "worked_d005.py",
          code: `import json

clean_path = work_dir / "clean.jsonl"
dead_path = work_dir / "dead_letter.jsonl"
valid_count = 0
error_count = 0

with (
    clean_path.open("w", encoding="utf-8") as clean_out,
    dead_path.open("w", encoding="utf-8") as dead_out,
):
    for line_no, payload in iter_nonempty_lines(raw_path):
        try:
            ticket = TicketLine.model_validate_json(payload)
        except ValidationError as err:
            first_err = err.errors()[0]
            dead_record = {
                "line_no": line_no,
                "error_type": first_err["type"],
                "message": first_err["msg"],
                "raw": payload,
            }
            dead_out.write(json.dumps(dead_record, ensure_ascii=False) + "\\n")
            error_count += 1
            continue

        clean_out.write(ticket.model_dump_json() + "\\n")
        valid_count += 1

print(f"Done: valid={valid_count}, errors={error_count}")
print("--- clean.jsonl ---")
print(clean_path.read_text(encoding="utf-8").strip())
print("--- dead_letter.jsonl ---")
print(dead_path.read_text(encoding="utf-8").strip())`,
        },
        output: `Done: valid=2, errors=2
--- clean.jsonl ---
{"ticket_id":"TKT-001","message_th":"โอนเงินแล้วแต่ระบบยังไม่ยืนยัน","priority":"high"}
{"ticket_id":"TKT-004","message_th":"ขอเปลี่ยนที่อยู่จัดส่งใบเสร็จครับ","priority":"normal"}
--- dead_letter.jsonl ---
{"line_no": 3, "error_type": "json_invalid", "message": "Invalid JSON: EOF while parsing a string at line 1 column 55", "raw": "{\"ticket_id\": \"TKT-002\", \"message_th\": \"JSON ขาดปีกกาปิด"}
{"line_no": 4, "error_type": "string_too_short", "message": "String should have at least 5 characters", "raw": "{\"ticket_id\": \"TKT-003\", \"message_th\": \"สั้น\", \"priority\": \"invalid\"}"}`,
      },
    ],
    gotcha:
      "ระวังการเก็บผลจาก generator ไว้ในตัวแปร `rows = iter_jsonl(path)` แล้วเอาไปวน 2 รอบ (เช่น รอบแรกนับจำนวน `len(list(rows))` รอบสองวนเขียนไฟล์) — รอบสองจะได้ 0 แถวเพราะ generator ถูกใช้หมดไปแล้วตั้งแต่รอบแรก!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `jsonl_stream.py` สำหรับสตรีมไฟล์ชุดข้อมูลทิกเก็ตภาษาไทยแบบ JSONL ด้วย `pathlib.Path` + generator และคัดแยกแถวที่ผ่านกับแถวที่เสียลงไฟล์ปลายทางโดยใช้หน่วยความจำคงที่",
    requirements: [
      "สร้าง `TicketRecord(BaseModel)` ที่มี `ticket_id: str` (ยาว ≥ 7, ขึ้นต้นด้วย `\"TKT-\"` หลัง strip), `text_th: str` (strip แล้วต้องยาว ≥ 5) และ `channel: Literal[\"line\", \"email\", \"web\"]`",
      "สร้าง generator `iter_jsonl_lines(path: Path) -> Iterator[tuple[int, str]]` ที่เปิดไฟล์ด้วย `encoding=\"utf-8\"` แล้ว `yield (line_no, stripped_line)` โดยเริ่มนับบรรทัดที่ `1` และข้ามบรรทัดว่างล้วน",
      "สร้าง `write_jsonl_models(path: Path, records: Iterable[BaseModel]) -> int` ที่สร้างโฟลเดอร์แม่ให้อัตโนมัติ (`parents=True, exist_ok=True`) เขียนทีละบรรทัดด้วย `encoding=\"utf-8\"` และ `model_dump_json() + \"\\n\"` แล้วคืนจำนวนแถวที่เขียน",
      "สร้าง `StreamSummary(BaseModel)` (`total_nonempty: int`, `valid_count: int`, `error_count: int`) และฟังก์ชัน `clean_jsonl_file(input_path: Path, clean_path: Path, dead_letter_path: Path) -> StreamSummary`",
      "`clean_jsonl_file` ต้องสตรีมอ่านจาก `input_path` ทีละบรรทัด เขียนแถวที่ผ่านลง `clean_path` และเขียนแถวที่พัง (ทั้ง JSON ผิดรูปและ schema ผิดกฎ) ลง `dead_letter_path` เป็น JSON ที่มีคีย์ `line_no`, `error`, `raw` พร้อมคงภาษาไทย UTF-8 (`ensure_ascii=False`)",
    ],
    starter: {
      language: "python",
      filename: "jsonl_stream.py",
      code: `import json
from collections.abc import Iterable, Iterator
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class TicketRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    # TODO: กำหนด ticket_id, text_th, channel และ validator ตรวจ prefix 'TKT-'
    pass


class StreamSummary(BaseModel):
    total_nonempty: int
    valid_count: int
    error_count: int


def iter_jsonl_lines(path: Path) -> Iterator[tuple[int, str]]:
    # TODO: เปิดไฟล์ด้วย encoding="utf-8" แล้ว yield (line_no, stripped) โดยข้ามบรรทัดว่าง
    raise NotImplementedError


def write_jsonl_models(path: Path, records: Iterable[BaseModel]) -> int:
    # TODO: สร้างโฟลเดอร์แม่ เขียน record.model_dump_json() + "\\n" ทีละรายการ แล้วคืนจำนวนแถว
    raise NotImplementedError


def clean_jsonl_file(
    input_path: Path,
    clean_path: Path,
    dead_letter_path: Path,
) -> StreamSummary:
    # TODO: สตรีมอ่าน input_path, แยกแถวดีลง clean_path และแถวเสียลง dead_letter_path
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_jsonl_stream.py",
      code: `import inspect
import json
from pathlib import Path
from jsonl_stream import (
    StreamSummary,
    TicketRecord,
    clean_jsonl_file,
    iter_jsonl_lines,
    write_jsonl_models,
)


def test_iter_jsonl_lines_is_generator_and_skips_blanks(tmp_path: Path):
    src = tmp_path / "sample.jsonl"
    src.write_text('{"a": 1}\\n\\n   \\n{"b": "ไทย"}\\n', encoding="utf-8")

    gen = iter_jsonl_lines(src)
    assert inspect.isgenerator(gen)
    items = list(gen)
    assert items == [(1, '{"a": 1}'), (4, '{"b": "ไทย"}')]


def test_write_jsonl_models_creates_parent_and_preserves_thai(tmp_path: Path):
    out = tmp_path / "nested" / "dir" / "out.jsonl"
    records = (
        TicketRecord(ticket_id="TKT-101", text_th="ขอใบเสร็จรับเงินครับ", channel="line")
        for _ in range(2)
    )
    written = write_jsonl_models(out, records)
    assert written == 2

    raw_text = out.read_text(encoding="utf-8")
    assert "ขอใบเสร็จรับเงินครับ" in raw_text
    lines = raw_text.splitlines()
    assert len(lines) == 2
    assert json.loads(lines[0])["ticket_id"] == "TKT-101"


def test_clean_jsonl_file_isolates_json_and_schema_errors(tmp_path: Path):
    src = tmp_path / "raw.jsonl"
    src.write_text(
        "\\n".join(
            [
                '{"ticket_id": "  TKT-201 ", "text_th": "แอปค้างตอนอัปโหลดสลิป", "channel": "line"}',
                "   ",
                '{"ticket_id": "TKT-202", "text_th": "ขาดปีกกา',
                '{"ticket_id": "BAD-001", "text_th": "รหัสขึ้นต้นผิด", "channel": "web"}',
                '{"ticket_id": "TKT-203", "text_th": "สอบถามรอบจัดส่งสินค้า", "channel": "email"}',
            ]
        )
        + "\\n",
        encoding="utf-8",
    )
    clean_path = tmp_path / "out" / "clean.jsonl"
    dead_path = tmp_path / "out" / "dead.jsonl"

    summary = clean_jsonl_file(src, clean_path, dead_path)
    assert isinstance(summary, StreamSummary)
    assert summary.total_nonempty == 4
    assert summary.valid_count == 2
    assert summary.error_count == 2

    clean_rows = [json.loads(line) for line in clean_path.read_text(encoding="utf-8").splitlines()]
    assert [r["ticket_id"] for r in clean_rows] == ["TKT-201", "TKT-203"]

    dead_rows = [json.loads(line) for line in dead_path.read_text(encoding="utf-8").splitlines()]
    assert [d["line_no"] for d in dead_rows] == [3, 4]
    assert all("error" in d and "raw" in d for d in dead_rows)
    assert "ขาดปีกกา" in dead_path.read_text(encoding="utf-8")
`,
    },
    selfCheck: [
      "`iter_jsonl_lines` เป็น generator จริง (`inspect.isgenerator(...)` เป็น `True`) และข้ามบรรทัดว่างโดยยังคงเลขบรรทัดจริง",
      "`write_jsonl_models` สร้างโฟลเดอร์แม่ที่ยังไม่มีได้เอง รับ generator ได้ตรง ๆ และคงอักษรภาษาไทย UTF-8 ไม่ escape เป็น `\\u0e...`",
      "`clean_jsonl_file` แยกแถวที่ JSON ขาดปีกกา (บรรทัด 3) และแถวที่ผิด prefix (บรรทัด 4) ลง `dead_letter_path` โดยแถวดี (บรรทัด 1 และ 5) ยังถูกเขียนครบ",
      "ทุกการเปิดอ่านและเขียนไฟล์ระบุ `encoding=\"utf-8\"` อย่างชัดเจน",
      "รัน `uv run pytest -q` ผ่านครบ 3 เทสต์ และ `uv run ruff check .` ผ่านไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้งหมดด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `iter_jsonl_lines` ให้ใช้ `with path.open(\"r\", encoding=\"utf-8\") as f:` แล้ววน `for line_no, line in enumerate(f, start=1):` — ถ้า `stripped := line.strip()` ไม่ว่างให้ `yield line_no, stripped`",
      },
      {
        body: "ใน `clean_jsonl_file` ให้เรียก `clean_path.parent.mkdir(parents=True, exist_ok=True)` และ `dead_letter_path.parent.mkdir(parents=True, exist_ok=True)` จากนั้นเปิดไฟล์ปลายทางทั้งคู่ใน `with` เดียวกันแล้ววนรับจาก `iter_jsonl_lines(input_path)`",
      },
      {
        body: "ตัวอย่างโครงของ `TicketRecord`, `iter_jsonl_lines` และ `write_jsonl_models` พร้อมแล้ว — เหลือเติมลูปคัดแยกใน `clean_jsonl_file` ด้วย `TicketRecord.model_validate_json(raw_line)`",
        code: {
          language: "python",
          filename: "hint-d005-l3.py",
          code: `import json
from collections.abc import Iterable, Iterator
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class TicketRecord(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    text_th: str = Field(min_length=5)
    channel: Literal["line", "email", "web"]

    @field_validator("ticket_id")
    @classmethod
    def must_start_with_tkt(cls, value: str) -> str:
        if not value.startswith("TKT-"):
            raise ValueError("ticket_id must start with 'TKT-'")
        return value


def iter_jsonl_lines(path: Path) -> Iterator[tuple[int, str]]:
    with path.open("r", encoding="utf-8") as handle:
        for line_no, line in enumerate(handle, start=1):
            stripped = line.strip()
            if stripped:
                yield line_no, stripped


def write_jsonl_models(path: Path, records: Iterable[BaseModel]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8") as handle:
        for rec in records:
            handle.write(rec.model_dump_json() + "\\n")
            count += 1
    return count`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "`tmp_path` เป็น built-in fixture ของ pytest ที่สร้างและลบโฟลเดอร์ชั่วคราวให้อัตโนมัติ",
    },
  },

  mistakes: [
    {
      title: "เปิดไฟล์โดยไม่ระบุ `encoding=\"utf-8\"`",
      symptom: "รันบน macOS/Linux ผ่าน แต่พอเปิดไฟล์ภาษาไทยบน Windows เกิด `UnicodeDecodeError` หรือได้ตัวอักษรต่างดาว",
      fix: "ใส่ `encoding=\"utf-8\"` ทุกครั้งที่เรียก `.open()`, `.read_text()` หรือ `.write_text()`",
    },
    {
      title: "วนอ่านตัวแปร generator ซ้ำ 2 รอบ",
      symptom: "รอบแรกนับแถวได้ 100 แต่พอนำตัวแปรเดิมไปเขียนลงไฟล์กลับได้ไฟล์ว่าง 0 แถวโดยไม่แจ้ง error",
      fix: "ประมวลผลและนับจำนวนในรอบเดียวกัน (single-pass) หรือสร้าง generator ใหม่เมื่อจำเป็นต้องอ่านซ้ำ",
    },
    {
      title: "เรียก `path.read_text().splitlines()` กับไฟล์ JSONL ขนาดใหญ่",
      symptom: "ไฟล์ขนาดหลักร้อย MB กิน RAM พุ่งสูงหลายเท่าตัวเพราะโหลดทั้งไฟล์และแตกเป็น list ของ string ไว้พร้อมกัน",
      fix: "ใช้ `with path.open(\"r\", encoding=\"utf-8\") as f:` แล้ววน `for line in f:` เพื่อให้ระบบอ่านทีละบรรทัด",
    },
    {
      title: "เขียนไฟล์ไปยังโฟลเดอร์ย่อยที่ยังไม่ได้สร้าง",
      symptom: "เกิด `FileNotFoundError: [Errno 2] No such file or directory: 'out/clean.jsonl'`",
      fix: "เรียก `output_path.parent.mkdir(parents=True, exist_ok=True)` ก่อนเปิดไฟล์โหมด `\"w\"` เสมอ",
    },
  ],

  quiz: {
    intro: "4 ข้อ ตรวจความเข้าใจเรื่อง `pathlib`, UTF-8 บน Windows และ Streaming JSONL",
    questions: [
      mc(
        "d005-q1",
        "เหตุใดจึงต้องระบุ `encoding=\"utf-8\"` ทุกครั้งเมื่อเปิดอ่านหรือเขียนไฟล์ข้อความภาษาไทยด้วย `pathlib.Path`?",
        [
          ["เพราะ Python 3 ไม่รองรับภาษาไทยหากไม่ติดตั้งแพ็กเกจเสริม", "Python 3 รองรับ Unicode/UTF-8 ในตัวอยู่แล้ว ไม่ต้องติดตั้งแพ็กเกจเสริม"],
          ["เพราะบน Windows ค่า encoding เริ่มต้นอาจเป็น `cp874`/`cp1252` ทำให้เปิดไฟล์ UTF-8 ภาษาไทยแล้วพังหรือเพี้ยนข้ามเครื่อง", "ถูก — การระบุ `encoding=\"utf-8\"` ทำให้พฤติกรรมเหมือนกัน 100% ทั้ง Windows, macOS และ Linux"],
          ["เพราะ `pathlib` จะไม่ยอมสร้างไฟล์หากไม่ส่งอาร์กิวเมนต์ `encoding`", "`pathlib` ยอมสร้างไฟล์ได้โดยไม่ส่ง `encoding` แต่จะใช้ locale ของเครื่องซึ่งเสี่ยงพัง"],
          ["เพราะ `encoding=\"utf-8\"` ช่วยบีบอัดไฟล์เป็น `.zip` อัตโนมัติ", "UTF-8 คือรูปแบบการเข้ารหัสอักขระ ไม่ใช่การบีบอัดไฟล์"],
        ],
        "B",
        "ค่าเริ่มต้นของ `open()` ขึ้นกับ locale ของ OS บน Windows จึงมักไม่ใช่ UTF-8 การกำหนด `encoding=\"utf-8\"` ทุกจุดคือมาตรฐานของงานข้อมูลภาษาไทย",
        "ทำไมโค้ดอ่านไฟล์ภาษาไทยที่รันผ่านบน Linux จึงอาจเกิด `UnicodeDecodeError` บน Windows?",
        "เพราะไม่ได้ระบุ `encoding=\"utf-8\"` ทำให้ Windows ใช้ encoding ประจำเครื่อง (เช่น cp874/cp1252) แทน UTF-8",
      ),
      mc(
        "d005-q2",
        "เปรียบเทียบการอ่านชุดข้อมูล 500,000 แถวระหว่าง `json.load(f)` (ไฟล์ JSON array) กับการวน `for line in f:` ด้วย generator บนไฟล์ `.jsonl` ข้อใดถูกต้อง?",
        [
          ["ทั้งสองแบบใช้ RAM เท่ากันเพราะจำนวนแถวเท่ากัน", "ไม่เท่ากัน — `json.load` ต้องเก็บทั้ง 500,000 dict ไว้ใน RAM พร้อมกัน"],
          ["ไฟล์ `.jsonl` ใช้ไม่ได้กับภาษาไทย", "`.jsonl` รองรับ UTF-8 ภาษาไทยเต็มรูปแบบ"],
          ["การสตรีม `.jsonl` ด้วย generator ใช้ RAM คงที่ $O(1)$ เพราะโหลดและประมวลผลทีละ 1 บรรทัด", "ถูก — เมื่อประมวลผลบรรทัดเดิมเสร็จก็คืนหน่วยความจำได้ทันที เหมาะกับ dataset ขนาดใหญ่"],
          ["`json.load` เร็วกว่าเสมอและไม่มีโอกาส RAM เต็ม", "ไฟล์ JSON array ขนาดใหญ่มักทำให้เกิด OOM ได้ง่ายกว่าการสตรีมมาก"],
        ],
        "C",
        "หัวใจของ JSONL + generator คือการประมวลผลทีละเรคคอร์ดด้วยหน่วยความจำ $O(1)$ แทน $O(N)$",
        "ข้อได้เปรียบหลักด้านหน่วยความจำของการสตรีมไฟล์ JSONL ด้วย generator คืออะไร?",
        "ใช้หน่วยความจำคงที่ $O(1)$ เพราะอ่านและประมวลผลทีละ 1 บรรทัด แทนการโหลดทั้งไฟล์เข้า RAM",
      ),
      mc(
        "d005-q3",
        "ถ้าคุณเขียนฟังก์ชัน `rows = iter_jsonl_lines(path)` ที่ใช้ `yield` แล้วเรียก `n = len(list(rows))` จากนั้นวน `for line_no, text in rows:` ในบรรทัดถัดมา จะเกิดอะไรขึ้น?",
        [
          ["ลูปที่สองจะไม่ทำงานเลย (ได้ 0 รอบ) เพราะ generator ถูกบริโภคจนหมดแล้วตอนแปลงเป็น `list(rows)`", "ถูก — generator เป็น iterator แบบใช้ครั้งเดียว (single-pass)"],
          ["ลูปที่สองจะอ่านไฟล์ใหม่ตั้งแต่บรรทัดที่ 1 อัตโนมัติ", "generator ไม่รีเซ็ตตัวเอง — ต้องเรียก `iter_jsonl_lines(path)` ใหม่หากต้องการวนอีกรอบ"],
          ["Python จะโยน `StopIteration` ออกมาจนโปรแกรมพัง", "`for` loop ดัก `StopIteration` ให้เองและจบลูปเงียบ ๆ ด้วย 0 รอบ"],
          ["ไฟล์ต้นฉบับจะถูกลบออกหลัง `list(rows)` ทำงานเสร็จ", "การอ่านไฟล์ไม่เคยลบไฟล์ต้นฉบับ"],
        ],
        "A",
        "Generator ถูกออกแบบมาให้สตรีมผ่านรอบเดียว หากต้องการทั้งนับจำนวนและเขียนไฟล์ ควรนับไปพร้อมกันในลูปเดียว",
        "จะเกิดอะไรขึ้นถ้าวน `for` บนตัวแปร generator เดิมซ้ำเป็นรอบที่สอง?",
        "รอบที่สองจะได้ 0 รายการ เพราะ generator ถูกอ่านจนถึงจุดสิ้นสุดไปแล้วในรอบแรก",
      ),
      mc(
        "d005-q4",
        "วิธีใดใน Pydantic v2 ที่สะอาดและเร็วที่สุดในการตรวจแต่ละบรรทัดของไฟล์ `.jsonl` โดยดักได้ทั้ง JSON syntax พังและ schema ผิดกฎในจุดเดียว?",
        [
          ["ใช้ `eval(line)` แล้วส่งเข้า `TicketRecord(**data)`", "อันตรายมาก — `eval` เปิดช่องโหว่รันโค้ดแปลกปลอม (Code Injection) ห้ามใช้กับข้อมูลภายนอกเด็ดขาด"],
          ["ใช้ `str.split(',')` แยกฟิลด์เองโดยไม่ parse JSON", "พังทันทีเมื่อข้อความภาษาไทยมีเครื่องหมายจุลภาคหรือปีกกาข้างใน"],
          ["ใช้ `TicketRecord.model_validate(line)` ส่ง string เข้าไปตรง ๆ", "`model_validate` รับ Python `dict` ไม่ใช่ JSON string ต้องใช้ `model_validate_json`"],
          ["ใช้ `TicketRecord.model_validate_json(line)` ภายใน `try / except ValidationError`", "ถูก — `model_validate_json` แปลง JSON และตรวจ schema ในแกน Rust รอบเดียว และรายงานทั้ง `json_invalid` และ schema error ผ่าน `ValidationError`"],
        ],
        "D",
        "`Model.model_validate_json(line)` ใน Pydantic v2 หลีกเลี่ยงการสร้าง dict กลางและจัดการทั้งความผิดพลาดของ JSON syntax และ schema ได้ครบใน `ValidationError`",
        "ใน Pydantic v2 ควรใช้เมธอดใด parse และ validate สตริง JSON แต่ละบรรทัดจากไฟล์ JSONL?",
        "`Model.model_validate_json(line)` ภายใต้ `try / except ValidationError`",
      ),
    ],
  },

  takeaways: [
    "ใช้ {{pathlib|pathlib.Path}} ต่อเส้นทางด้วย `/` และเตรียมโฟลเดอร์ด้วย `.parent.mkdir(parents=True, exist_ok=True)` เพื่อโค้ดที่รันได้ทุก OS",
    "ระบุ `encoding=\"utf-8\"` ทุกจุดที่อ่านหรือเขียนไฟล์ข้อความภาษาไทย และใส่ `ensure_ascii=False` เมื่อใช้ `json.dumps`",
    "สตรีมไฟล์ {{jsonl}} ด้วย generator (`yield`) เพื่อคุมการใช้ RAM ให้อยู่ที่ $O(1)$ และจำไว้ว่า generator วนได้รอบเดียว",
    "ใช้ `Model.model_validate_json(line)` ภายในลูปพร้อม `enumerate(..., start=1)` เพื่อแยกแถวเสียลง dead-letter file โดยไม่ทำให้งานทั้งไฟล์ล่ม",
  ],

  reviewCards: [
    rc(
      "d005-rc-1",
      "วิธีสร้างโฟลเดอร์แม่ก่อนเขียนไฟล์ด้วย `pathlib.Path` โดยไม่ error แม้โฟลเดอร์จะมีอยู่แล้วคือคำสั่งใด?",
      "`out_path.parent.mkdir(parents=True, exist_ok=True)`",
    ),
    rc(
      "d005-rc-2",
      "เหตุใดจึงควรใช้ `ensure_ascii=False` กับ `json.dumps` (หรือ `model_dump_json()`) เมื่อเขียนไฟล์ JSONL ภาษาไทย?",
      "เพื่อเก็บอักษรภาษาไทยเป็น UTF-8 ตรง ๆ อ่านง่ายและขนาดไฟล์เล็กกว่าการ escape เป็น `\\u0e...` เกือบเท่าตัว",
    ),
    rc(
      "d005-rc-3",
      "การอ่านไฟล์ JSONL แบบ fault-tolerant ควรจัดการบรรทัดที่ JSON พังหรือผิด schema อย่างไร?",
      "จับ `ValidationError` (จาก `model_validate_json`) ภายในลูปรายบรรทัด บันทึก `line_no`, สาเหตุ และข้อความดิบลง dead-letter file แล้วสตรีมบรรทัดถัดไปต่อ",
    ),
  ],

  sources: [
    { label: "Python 3 Official Docs — pathlib: Object-oriented filesystem paths", href: "https://docs.python.org/3/library/pathlib.html" },
    { label: "Python 3 Official Docs — Reading and Writing Files (UTF-8)", href: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files" },
    { label: "JSON Lines Specification (jsonlines.org)", href: "https://jsonlines.org/" },
    { label: "Pydantic v2 Docs — JSON Parsing (`model_validate_json`)", href: "https://docs.pydantic.dev/latest/concepts/json/" },
  ],

  glossary: [
    "pathlib",
    "jsonl",
    "pydantic",
    "schema",
    "validation-error",
    "serialization",
    "pytest",
  ],
});
