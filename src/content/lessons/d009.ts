import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D009 — Phase 1 / Block B03
 * Unit Testing Fundamentals with pytest & Fixtures.
 */
export const d009: Lesson = defineLesson({
  day: 9,
  titleTh: "พื้นฐาน Unit Testing ด้วย pytest, Fixtures และ tmp_path",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · วางโครงเทสต์แบบ Arrange-Act-Assert, pytest.raises และ fixture ที่แยกอิสระ",
  icon: "flask-conical",
  visual: {
    id: "pytest-fixtures",
    title: "วงจรชีวิต pytest Fixture — Setup → Arrange/Act/Assert → Teardown",
    caption: "กดเดินทีละขั้นเพื่อดูการเตรียมข้อมูลทดสอบด้วย @pytest.fixture และ tmp_path อย่างแยกอิสระ",
    alt: "แผนภาพวงจรชีวิต pytest fixture และ Arrange-Act-Assert",
  },
  requiresApiKey: false,
  tools: ["pytest", "uv", "pathlib", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ป้องกันบั๊กเงียบในขั้นเตรียมและทำความสะอาดข้อมูล",
      body: "โค้ดทำความสะอาดข้อความภาษาไทย, แยกแท็ก และอ่านไฟล์ {{jsonl}} มักถูกแก้ไขบ่อยเมื่อมีช่องทางข้อมูลใหม่เข้ามา หากไม่มีชุดทดสอบอัตโนมัติ การแก้บั๊กหนึ่งจุดอาจไปพังกฎเดิมโดยไม่รู้ตัว",
      lessonNote: "วันนี้เราวางฐานการเขียน unit test ด้วย {{pytest}} เพื่อให้มั่นใจว่าฟังก์ชัน normalize ทิกเก็ตทำงานคงที่ (deterministic) ทุกครั้ง",
    },
    {
      node: 3,
      heading: "ฐานรากของ Evaluation Pipeline แบบเชิงกำหนด",
      body: "ก่อนจะก้าวไปประเมินคำตอบ {{llm}} ด้วย metrics เชิงความน่าจะเป็นใน Phase 5 วิศวกร AI ต้องมีชั้นทดสอบเชิงกำหนด (deterministic unit tests) ที่รันจบในไม่กี่มิลลิวินาทีและได้ผลเหมือนเดิม 100%",
      lessonNote: "รูปแบบ Arrange-Act-Assert และ `pytest.raises` คือเครื่องมือหลักที่ใช้ตรวจทั้งพฤติกรรมปกติและเส้นทาง error ({{fail-fast}})",
    },
    {
      node: 4,
      heading: "ทำให้การรีแฟกเตอร์แอปปลอดภัยและกล้าปรับโครงสร้าง",
      body: "เมื่อโปรเจกต์โตขึ้นเป็น CLI หรือ FastAPI service การมี {{fixture}} และ `tmp_path` ที่แยกสภาพแวดล้อมต่อเทสต์ช่วยให้รันชุดทดสอบซ้ำได้ทุกเครื่องโดยไม่ทิ้งไฟล์ขยะ",
      lessonNote: "คุณจะได้ใช้ `tmp_path` คู่กับ {{pathlib}} เพื่อทดสอบการอ่าน-เขียนไฟล์ทิกเก็ตแบบไม่แตะโฟลเดอร์จริงของเครื่อง",
    },
  ],

  objectives: [
    "**เขียน unit test** ด้วย {{pytest}} ตามโครงสร้าง **Arrange–Act–Assert (AAA)** และตรวจจับข้อผิดพลาดที่คาดหวังอย่างแม่นยำด้วย `pytest.raises(..., match=...)`",
    "**ออกแบบและนำกลับมาใช้ซ้ำ** ข้อมูลทดสอบผ่าน `@pytest.fixture` พร้อมเข้าใจวงจรชีวิต Setup → Yield → Teardown ที่แยกสถานะอิสระต่อแต่ละเทสต์",
    "**ทดสอบการอ่าน-เขียนไฟล์** อย่างปลอดภัยและ {{reproducibility|ทำซ้ำได้}} ด้วย built-in fixture `tmp_path` ร่วมกับ {{pathlib}}",
  ],

  prerequisites: [
    "เขียนฟังก์ชัน Python, {{type-hint}} และ {{custom-exception}} พื้นฐานได้ (จาก D2 และ D6)",
    "คุ้นเคยกับการอ่าน-เขียนไฟล์ UTF-8 ด้วย `pathlib.Path` (จาก D5)",
    "มี `uv` ติดตั้งบนเครื่อง — รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ฝึกปฏิบัติสำหรับ Block B03 ด้วย {{uv}} และติดตั้ง {{pytest}} กับ {{ruff}} เป็น dev dependency เพื่อให้พร้อมรันเทสต์ทันที",
    commands: `uv init ai-day09-pytest && cd ai-day09-pytest
uv add pydantic
uv add --dev pytest ruff

# ตรวจว่า pytest พร้อมทำงานในสภาพแวดล้อมของโปรเจกต์
uv run pytest --version`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day09-pytest` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic` และ dev tools (`pytest`, `ruff`) ด้วย `uv add`"],
      ["verify", "รัน `uv run pytest --version` เพื่อยืนยันว่าเรียก `pytest` ผ่าน `.venv` ได้"],
    ],
    note: "การใส่ `pytest` ไว้ในกลุ่ม `--dev` ช่วยแยกเครื่องมือทดสอบออกจาก dependency ที่ต้องส่งขึ้น production container",
  },

  concepts: [
    {
      id: "aaa-and-pytest-raises",
      title: "1 · โครงสร้าง Arrange–Act–Assert และ pytest.raises",
      paragraphs: [
        "{{pytest}} ค้นหาไฟล์ที่ขึ้นต้นด้วย `test_` (หรือลงท้ายด้วย `_test.py`) และฟังก์ชันที่ขึ้นต้นด้วย `test_` โดยอัตโนมัติ จุดเด่นของ `pytest` คือคุณใช้คำสั่ง `assert` มาตรฐานของ Python ได้เลยโดยไม่ต้องจำเมธอดตระกูล `assertEqual` — เมื่อเทสต์ไม่ผ่าน `pytest` จะคลี่ค่าซ้าย-ขวาให้เห็นส่วนต่างอย่างละเอียด",
        "เพื่อให้เทสต์อ่านง่ายเหมือนเอกสารสเปก ควรแบ่งเนื้อหาในทุกฟังก์ชันทดสอบออกเป็น 3 จังหวะคือ **Arrange** (เตรียมข้อมูลและสถานะตั้งต้น), **Act** (เรียกฟังก์ชันที่ต้องการทดสอบ 1 พฤติกรรม) และ **Assert** (ตรวจผลลัพธ์ที่คาดหวัง) ส่วนกรณีที่ฟังก์ชัน *ควร* โยนข้อผิดพลาด เช่น ส่งทิกเก็ตว่างหรือ {{schema}} ผิด ให้ตรวจด้วย `with pytest.raises(ExpectedError, match=...):` เพื่อยืนยันทั้งชนิดของ exception และข้อความแจ้งเตือน",
      ],
      analogy:
        "เหมือนใบตรวจรับงานช่างไฟ — เตรียมเครื่องวัดและจ่ายไฟทดสอบ (Arrange) → กดสวิตช์ตัวที่ต้องการ (Act) → ตรวจว่าไฟติดหรือเบรกเกอร์ตัดตามสเปกจริงไหม (Assert)",
      code: {
        language: "python",
        filename: "test_normalize_basic.py",
        code: `import pytest


def normalize_ticket_text(raw: str) -> str:
    cleaned = " ".join(raw.split())
    if len(cleaned) < 5:
        raise ValueError("ข้อความทิกเก็ตต้องยาวอย่างน้อย 5 ตัวอักษร")
    return cleaned


def test_normalize_collapses_thai_whitespace() -> None:
    # Arrange
    raw = "  โอนเงินแล้ว   แต่ระบบ\tยังไม่ปรับสถานะ  "

    # Act
    result = normalize_ticket_text(raw)

    # Assert
    assert result == "โอนเงินแล้ว แต่ระบบ ยังไม่ปรับสถานะ"


def test_normalize_rejects_too_short_message() -> None:
    # Arrange
    raw = "   สวัส   "

    # Act & Assert — ต้องโยน ValueError ที่มีข้อความตรงเงื่อนไข
    with pytest.raises(ValueError, match="อย่างน้อย 5 ตัวอักษร"):
        normalize_ticket_text(raw)`,
        caption: "การใช้ `match=` ใน `pytest.raises` กันไม่ให้เทสต์ผ่านผิดพลาดจาก `ValueError` ที่เกิดจากสาเหตุอื่น",
      },
      whyTitle: "Why this matters — ทำไมต้องทดสอบทั้ง Happy Path และ Error Path",
      whyParagraphs: [
        "โค้ดที่รับข้อมูลลูกค้าภาษาไทยมักพังกับเคสขอบ เช่น ข้อความมีแต่ช่องว่าง, แท็บซ้อน หรือรหัสไม่ครบตาม {{data-contract}} — หากเทสต์แต่ข้อมูลที่ถูกต้อง ระบบ {{fail-fast}} อาจพังเงียบเมื่อมีคนเผลอลบเงื่อนไขตรวจสอบออก",
        "การเขียน `pytest.raises` ควบคู่กับ happy path ทำให้กติกาของระบบถูกตรึงไว้เป็นโค้ดที่รันตรวจซ้ำได้ทุกครั้งก่อน merge",
      ],
    },
    {
      id: "reusable-fixtures-and-isolation",
      title: "2 · @pytest.fixture และการแยกสถานะอิสระ (Test Isolation)",
      paragraphs: [
        "เมื่อชุดเทสต์เริ่มมี 5–10 ฟังก์ชันที่ใช้ข้อมูลตัวอย่างชุดเดียวกัน การคัดลอก `dict` ทิกเก็ตไว้ทุกฟังก์ชันจะทำให้แก้ยากและรกสายตา {{fixture}} (`@pytest.fixture`) แก้ปัญหานี้ด้วยการแยกฟังก์ชัน \"ผู้เตรียมวัตถุดิบ\" ออกมา แล้วให้ `pytest` ฉีด (dependency injection) เข้าไปทางชื่อพารามิเตอร์ของฟังก์ชันเทสต์โดยอัตโนมัติ",
        "ค่าเริ่มต้นของ `@pytest.fixture` คือ `scope=\"function\"` ซึ่งหมายความว่า `pytest` จะสร้างออบเจกต์ใหม่เอี่ยมให้ **ทุกฟังก์ชันเทสต์** — หากเทสต์แรกแก้ไขลิสต์หรือ `dict` ที่ได้รับไป เทสต์ถัดไปจะไม่ได้รับผลกระทบ และหาก fixture ต้องการเก็บกวาดทรัพยากร (เช่น ปิดไฟล์หรือรีเซ็ตสถานะ) ให้ใช้ `yield` แทน `return` เพื่อรันโค้ดส่วน teardown เสมอแม้เทสต์จะพัง",
      ],
      analogy:
        "เหมือนห้องครัวเชฟที่มีผู้ช่วยจัดเตรียมชุดเครื่องปรุงใหม่เอี่ยมใส่ถาดแยกให้ทีละจาน (Setup) เมื่อทำจานนั้นเสร็จก็เก็บถาดไปล้างทันที (Teardown) เพื่อไม่ให้กลิ่นอาหารจานก่อนปนเปื้อนจานถัดไป",
      bullets: [
        "**ชื่อพารามิเตอร์ต้องตรงชื่อ fixture** — `pytest` จับคู่ด้วยชื่ออัตโนมัติ ไม่ต้อง import ฟังก์ชันมาเรียกเอง",
        "**ห้ามใช้ mutable global variable แชร์ข้ามเทสต์** — สร้างใหม่ใน fixture ทุกครั้งเพื่อให้ลำดับการรันเทสต์ไม่ส่งผลต่อผลลัพธ์",
        "**ใช้ `conftest.py`** — เมื่อต้องการแชร์ fixture ร่วมกันข้ามหลายไฟล์ `test_*.py` ในโฟลเดอร์เดียวกัน",
      ],
      code: {
        language: "python",
        filename: "test_fixture_lifecycle.py",
        code: `import pytest


@pytest.fixture
def sample_ticket() -> dict[str, object]:
    # Setup: สร้าง dict ใหม่ทุกครั้งที่เทสต์ร้องขอ
    return {
        "ticket_id": "TKT-101",
        "channel": "line",
        "message_th": "ขอใบกำกับภาษีอิเล็กทรอนิกส์ครับ",
        "tags": ["Billing", "vip"],
    }


def test_first_mutates_copy(sample_ticket: dict[str, object]) -> None:
    tags = sample_ticket["tags"]
    assert isinstance(tags, list)
    tags.append("urgent")
    assert len(tags) == 3


def test_second_gets_fresh_fixture(sample_ticket: dict[str, object]) -> None:
    # ไม่ได้รับผลกระทบจาก test_first_mutates_copy เลย
    assert sample_ticket["tags"] == ["Billing", "vip"]`,
        caption: "เพราะ fixture มี default scope เป็น `function` การแก้ `sample_ticket` ในเทสต์แรกจึงไม่รั่วไหลไปยังเทสต์ที่สอง",
      },
      whyTitle: "Why this matters — ป้องกัน Flaky Tests ที่ขึ้นกับลำดับการรัน",
      whyParagraphs: [
        "เทสต์ที่แอบแชร์ตัวแปร global มัก \"ผ่านเวลารันรวม แต่พังเวลารันเดี่ยว\" (order-dependent flaky test) ซึ่งเป็นฝันร้ายตอนดีบักใน CI",
        "การสร้างข้อมูลผ่าน `@pytest.fixture` บังคับให้ทุกเทสต์เป็นหน่วยอิสระ (isolated unit) คุณจึงรันเฉพาะ 1 เทสต์ด้วย `pytest -k ...` หรือรันสลับลำดับได้อย่างมั่นใจ",
      ],
    },
    {
      id: "tmp-path-file-testing",
      title: "3 · ทดสอบการอ่าน-เขียนไฟล์อย่างปลอดภัยด้วย tmp_path",
      paragraphs: [
        "ในงานวิศวกรรม AI เราต้องทดสอบโค้ดที่อ่านไฟล์ชุดข้อมูล {{jsonl}} หรือเขียนไฟล์รายงานผลอยู่เสมอ แต่การเขียนลงโฟลเดอร์โปรเจกต์จริงอย่าง `data/output.jsonl` เป็นอันตรายเพราะอาจเขียนทับข้อมูลจริง ทิ้งไฟล์ค้าง และทำให้รันเทสต์ขนานกันแล้วชนกัน",
        "`pytest` มี built-in fixture ชื่อ `tmp_path` ซึ่งเป็นออบเจกต์ `pathlib.Path` ชี้ไปยังโฟลเดอร์ชั่วคราวที่สร้างแยกเฉพาะให้แต่ละเทสต์ คุณสามารถสร้างไฟล์อินพุต UTF-8 ด้วย `(tmp_path / \"tickets.jsonl\").write_text(..., encoding=\"utf-8\")` แล้วส่ง path นั้นให้ฟังก์ชันที่ต้องการทดสอบได้ทันทีโดยไม่ต้องเขียนโค้ดลบไฟล์เอง",
      ],
      analogy:
        "เหมือนกระดานไวท์บอร์ดส่วนตัวที่แจกให้ห้องสอบคนละแผ่น — เขียนทดลองได้เต็มที่ ไม่ไปขีดทับเอกสารตัวจริงของออฟฟิศ และพอจบสอบเจ้าหน้าที่เก็บล้างให้เรียบร้อย",
      code: {
        language: "python",
        filename: "test_jsonl_io.py",
        code: `import json
from pathlib import Path


def count_valid_lines(jsonl_path: Path) -> int:
    text = jsonl_path.read_text(encoding="utf-8")
    return sum(1 for line in text.splitlines() if line.strip())


def test_count_valid_lines_with_tmp_path(tmp_path: Path) -> None:
    # Arrange: สร้างไฟล์ JSONL ภาษาไทยในโฟลเดอร์ชั่วคราว
    sample_file = tmp_path / "tickets.jsonl"
    records = [
        {"ticket_id": "TKT-001", "message_th": "โอนเงินแล้วครับ"},
        {"ticket_id": "TKT-002", "message_th": "ขอเปลี่ยนที่อยู่จัดส่ง"},
    ]
    content = "\\n".join(json.dumps(r, ensure_ascii=False) for r in records) + "\\n\\n"
    sample_file.write_text(content, encoding="utf-8")

    # Act
    total = count_valid_lines(sample_file)

    # Assert
    assert total == 2`,
        caption: "ระบุ `encoding=\"utf-8\"` ทุกครั้งเมื่ออ่าน-เขียนไฟล์ภาษาไทย เพื่อให้ผ่านทั้งบน Windows, macOS และ Linux CI",
      },
      whyTitle: "Why this matters — ทดสอบ I/O ได้จริงโดยไม่ทำให้ Repository สกปรก",
      whyParagraphs: [
        "ปัญหาคลาสสิกบน Windows คือ default encoding อาจเป็น `cp874` หรือ `cp1252` ไม่ใช่ `utf-8` การเขียนเทสต์ผ่าน `tmp_path` ด้วยข้อความภาษาไทยจริงจะจับบั๊ก encoding ได้ตั้งแต่ในเครื่องก่อนขึ้นเซิร์ฟเวอร์",
        "นอกจากนี้ `tmp_path` ยังรองรับการสร้างโฟลเดอร์ซ้อน เช่น `(tmp_path / \"nested\" / \"out.jsonl\")` เพื่อทดสอบว่าฟังก์ชันของคุณสร้าง parent directory ให้เรียบร้อยหรือไม่",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ pytest กับ Vitest / Jest",
      body: [
        "ถ้าคุณเคยเขียนเทสต์ฝั่ง JS/TS ด้วย Vitest หรือ Jest จะเห็นว่าแนวคิด AAA และ isolation เหมือนกัน แต่ `pytest` ไม่ต้องครอบบล็อก `describe(...)` และใช้ fixture injection แทนตัวแปร `let` ที่เซตใน `beforeEach`:",
      ],
      table: [
        ["`def test_normalize():`", "`test('normalize', () => { ... })`"],
        ["`assert actual == expected`", "`expect(actual).toEqual(expected)`"],
        ["`with pytest.raises(ValueError, match=...):`", "`expect(() => fn()).toThrow(/.../)`"],
        ["`@pytest.fixture` + ใส่ชื่อในพารามิเตอร์", "`beforeEach()` / `afterEach()` + ตัวแปรแชร์"],
        ["`tmp_path: Path` (built-in fixture)", "`fs.mkdtempSync(path.join(os.tmpdir(), ...))`"],
        ["`uv run pytest -q` / `-k name`", "`npx vitest run` / `-t name`"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมแค่ `print()` ดูผลเองถึงไม่พอ",
      body: [
        "ตอนเริ่มเขียนโปรแกรม เรามักลองเรียกฟังก์ชันแล้ว `print(...)` ดูด้วยตาว่าคำตอบถูกไหม วิธีนั้นใช้ได้เมื่อมีโค้ด 20 บรรทัด แต่พอมี 10 ฟังก์ชันและต้องแก้โค้ด 5 รอบ คุณจะไม่มีทางจำได้ทุกเคสที่เคยทดสอบ",
        "Unit test ด้วย `pytest` คือการเปลี่ยนการ \"เช็กด้วยตา\" ให้เป็นคำสั่ง `assert` ที่คอมพิวเตอร์ตรวจแทนคุณครบทุกเคสในเสี้ยววินาที และแจ้งทันทีหากการแก้โค้ดใหม่เผลอทำของเดิมพัง (regression)",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองสร้างโมดูลขนาดเล็กสำหรับทำความสะอาดและบันทึกทิกเก็ตภาษาไทยเป็นไฟล์ {{jsonl}} แล้วเขียนชุดเทสต์ `pytest` ที่ใช้ครบทั้ง AAA, `pytest.raises`, `@pytest.fixture` และ `tmp_path`",
    steps: [
      {
        title: "1 · เขียนฟังก์ชันเป้าหมายที่มีทั้ง logic และ file I/O",
        explain:
          "ฟังก์ชัน `normalize_ticket` ทำความสะอาดข้อความและแท็กพร้อมตรวจสอบความยาว ส่วน `save_tickets_jsonl` เขียนลิสต์ทิกเก็ตที่ผ่านการทำความสะอาดลงไฟล์ UTF-8",
        code: {
          language: "python",
          filename: "ticket_cleaner.py",
          code: `import json
from pathlib import Path


class TicketFormatError(ValueError):
    """โยนเมื่อทิกเก็ตขาดฟิลด์สำคัญหรือข้อความสั้นเกินกำหนด"""


def normalize_ticket(raw: dict[str, object]) -> dict[str, object]:
    ticket_id = str(raw.get("ticket_id", "")).strip().upper()
    if not ticket_id.startswith("TKT-"):
        raise TicketFormatError("ticket_id ต้องขึ้นต้นด้วย 'TKT-'")

    message = " ".join(str(raw.get("message_th", "")).split())
    if len(message) < 5:
        raise TicketFormatError("message_th ต้องยาวอย่างน้อย 5 ตัวอักษร")

    raw_tags = raw.get("tags", [])
    if not isinstance(raw_tags, list):
        raise TicketFormatError("tags ต้องเป็น list")

    cleaned_tags = list(
        dict.fromkeys(str(t).strip().lower() for t in raw_tags if str(t).strip())
    )
    return {
        "ticket_id": ticket_id,
        "message_th": message,
        "tags": cleaned_tags,
    }


def save_tickets_jsonl(tickets: list[dict[str, object]], out_path: Path) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    lines = [json.dumps(item, ensure_ascii=False) for item in tickets]
    out_path.write_text("\\n".join(lines), encoding="utf-8")
    return len(lines)`,
        },
        output: `# บันทึกไฟล์ ticket_cleaner.py เรียบร้อย — พร้อมเขียนชุดเทสต์`,
      },
      {
        title: "2 · สร้าง Fixture และทดสอบ Happy Path + Error Path",
        explain:
          "สร้าง `@pytest.fixture` คืนทิกเก็ตดิบที่มีช่องว่างเกินและแท็กซ้ำ เพื่อใช้ร่วมกันในหลายเทสต์ และใช้ `pytest.raises(TicketFormatError, match=...)` ตรวจเคสผิดกฎ",
        code: {
          language: "python",
          filename: "test_ticket_cleaner.py",
          code: `import json
from pathlib import Path
import pytest
from ticket_cleaner import TicketFormatError, normalize_ticket, save_tickets_jsonl


@pytest.fixture
def dirty_ticket() -> dict[str, object]:
    return {
        "ticket_id": "  tkt-204  ",
        "message_th": "  โอนเงินแล้ว\\t\\tแต่ยังไม่ได้รับอีเมลยืนยัน  ",
        "tags": [" Billing ", "billing", "", "URGENT"],
    }


def test_normalize_ticket_happy_path(dirty_ticket: dict[str, object]) -> None:
    cleaned = normalize_ticket(dirty_ticket)
    assert cleaned == {
        "ticket_id": "TKT-204",
        "message_th": "โอนเงินแล้ว แต่ยังไม่ได้รับอีเมลยืนยัน",
        "tags": ["billing", "urgent"],
    }


def test_normalize_rejects_bad_prefix(dirty_ticket: dict[str, object]) -> None:
    dirty_ticket["ticket_id"] = "ORD-999"
    with pytest.raises(TicketFormatError, match="TKT-"):
        normalize_ticket(dirty_ticket)`,
        },
        output: `# สังเกตว่า test_normalize_rejects_bad_prefix แก้ dirty_ticket ได้อย่างอิสระ`,
      },
      {
        title: "3 · เพิ่มเทสต์ File I/O ด้วย tmp_path แล้วรัน pytest",
        explain:
          "ส่ง path ภายใต้ `tmp_path / \"exports\" / \"clean.jsonl\"` เพื่อตรวจทั้งการสร้างโฟลเดอร์ย่อยและการเขียนภาษาไทยแบบ UTF-8 ที่อ่านกลับด้วย `json.loads` ได้ตรงทุกตัวอักษร",
        code: {
          language: "python",
          filename: "test_ticket_cleaner.py",
          code: `def test_save_tickets_jsonl_creates_utf8_file(
    dirty_ticket: dict[str, object],
    tmp_path: Path,
) -> None:
    cleaned = normalize_ticket(dirty_ticket)
    output_file = tmp_path / "exports" / "clean.jsonl"

    written = save_tickets_jsonl([cleaned], output_file)

    assert written == 1
    assert output_file.exists()
    lines = output_file.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 1
    assert json.loads(lines[0])["message_th"] == "โอนเงินแล้ว แต่ยังไม่ได้รับอีเมลยืนยัน"`,
        },
        output: `$ uv run pytest -v
collected 3 items

test_ticket_cleaner.py::test_normalize_ticket_happy_path PASSED          [ 33%]
test_ticket_cleaner.py::test_normalize_rejects_bad_prefix PASSED         [ 66%]
test_ticket_cleaner.py::test_save_tickets_jsonl_creates_utf8_file PASSED [100%]

============================== 3 passed in 0.04s ==============================`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยมาก: สร้าง fixture ชื่อ `sample_ticket` แล้วเผลอเรียก `sample_ticket()` เองในฟังก์ชันเทสต์แทนที่จะรับผ่านพารามิเตอร์ `def test_x(sample_ticket):` — ใน pytest เวอร์ชันใหม่การเรียกฟังก์ชันที่ติด `@pytest.fixture` ตรง ๆ จะโยน `Failed: Fixture 'sample_ticket' called directly` ทันที!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): เขียนโมดูล `thai_normalizer.py` พร้อมชุดเทสต์ `test_thai_normalizer.py` ที่ใช้ `@pytest.fixture`, `pytest.raises` และ `tmp_path` อย่างครบถ้วน",
    requirements: [
      "ใน `thai_normalizer.py` สร้าง {{custom-exception}} ชื่อ `EmptyTicketError(ValueError)` และฟังก์ชัน `clean_thai_message(text: str) -> str` ที่ยุบช่องว่าง/แท็บ/ขึ้นบรรทัดใหม่หลายตัวให้เหลือช่องว่างเดียว ตัดหัวท้าย และโยน `EmptyTicketError` หากข้อความหลังทำความสะอาดสั้นกว่า 5 ตัวอักษร",
      "สร้าง `normalize_tags(tags: list[str]) -> list[str]` ที่ตัดช่องว่าง แปลงเป็นตัวพิมพ์เล็ก กรองค่าว่าง และตัดตัวซ้ำแบบคงลำดับเดิมด้วย `dict.fromkeys`",
      "สร้าง `export_normalized_jsonl(records: list[dict[str, object]], target: Path) -> int` ที่ทำความสะอาดฟิลด์ `message_th` และ `tags` ของทุกแถว สร้างโฟลเดอร์แม่ถ้ายังไม่มี และเขียนเป็นไฟล์ UTF-8 JSONL แล้วคืนจำนวนแถวที่เขียน",
      "ใน `test_thai_normalizer.py` สร้าง `@pytest.fixture` ชื่อ `sample_records` อย่างน้อย 1 ตัว, เขียนเทสต์ `pytest.raises(EmptyTicketError)` อย่างน้อย 2 เคส (สตริงว่างล้วน และข้อความสั้นกว่า 5 ตัวอักษร) และเขียนเทสต์ I/O ด้วย `tmp_path`",
      "รัน `uv run pytest -v` ผ่านครบทุกข้อและ `uv run ruff check .` ไม่มี warning",
    ],
    starter: {
      language: "python",
      filename: "thai_normalizer.py",
      code: `import json
from pathlib import Path


class EmptyTicketError(ValueError):
    """โยนเมื่อข้อความทิกเก็ตว่างหรือสั้นกว่าเกณฑ์ขั้นต่ำ"""


def clean_thai_message(text: str) -> str:
    # TODO: ยุบช่องว่างซ้ำด้วย " ".join(text.split()) และโยน EmptyTicketError ถ้าสั้นกว่า 5 ตัวอักษร
    raise NotImplementedError


def normalize_tags(tags: list[str]) -> list[str]:
    # TODO: strip + lower + กรองค่าว่าง + ตัดซ้ำแบบคงลำดับ
    raise NotImplementedError


def export_normalized_jsonl(records: list[dict[str, object]], target: Path) -> int:
    # TODO: ทำความสะอาด message_th และ tags ของทุกรายการแล้วเขียนลง target แบบ UTF-8 JSONL
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_thai_normalizer.py",
      code: `import json
from pathlib import Path
import pytest
from thai_normalizer import (
    EmptyTicketError,
    clean_thai_message,
    export_normalized_jsonl,
    normalize_tags,
)


@pytest.fixture
def sample_records() -> list[dict[str, object]]:
    return [
        {
            "ticket_id": "TKT-001",
            "message_th": "  สอบถาม\\tสถานะ   พัสดุครับ  ",
            "tags": [" Shipping ", "shipping", "", "VIP"],
        },
        {
            "ticket_id": "TKT-002",
            "message_th": "ขอออกใบเสร็จ\\nใหม่ในนามบริษัท",
            "tags": ["Billing", "TAX", "billing"],
        },
    ]


def test_clean_thai_message_collapses_spaces() -> None:
    assert clean_thai_message("  แจ้ง   ปัญหา\\nแอปค้าง  ") == "แจ้ง ปัญหา แอปค้าง"


def test_clean_thai_message_raises_on_whitespace_only() -> None:
    with pytest.raises(EmptyTicketError, match="อย่างน้อย 5"):
        clean_thai_message("    \\t\\n  ")


def test_clean_thai_message_raises_on_short_text() -> None:
    with pytest.raises(EmptyTicketError):
        clean_thai_message("สวัส")


def test_normalize_tags_preserves_order() -> None:
    assert normalize_tags([" VIP ", "billing", "  ", "vip", "Bug"]) == [
        "vip",
        "billing",
        "bug",
    ]


def test_export_normalized_jsonl_uses_tmp_path(
    sample_records: list[dict[str, object]],
    tmp_path: Path,
) -> None:
    out_file = tmp_path / "out" / "normalized.jsonl"
    count = export_normalized_jsonl(sample_records, out_file)

    assert count == 2
    lines = out_file.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2

    first = json.loads(lines[0])
    assert first["message_th"] == "สอบถาม สถานะ พัสดุครับ"
    assert first["tags"] == ["shipping", "vip"]
`,
    },
    selfCheck: [
      "`clean_thai_message` ยุบช่องว่าง, `\\t` และ `\\n` เหลือช่องว่างเดียว และโยน `EmptyTicketError` พร้อมข้อความชัดเจนเมื่อสั้นกว่า 5 ตัวอักษร",
      "`normalize_tags` คืนลิสต์ตัวพิมพ์เล็กที่ไม่มีค่าว่างและรักษาลำดับเดิมเสมอ",
      "`export_normalized_jsonl` สร้างโฟลเดอร์แม่ให้อัตโนมัติและเขียนภาษาไทยด้วย `encoding=\"utf-8\"` + `ensure_ascii=False`",
      "ไม่มีไฟล์ `.jsonl` ค้างอยู่ในโฟลเดอร์โปรเจกต์หลังรัน `pytest` เพราะทดสอบผ่าน `tmp_path`",
      "รัน `uv run pytest -v` ผ่านครบ 5 ข้อ และ `uv run ruff check .` ไม่มีข้อผิดพลาด",
    ],
    acceptance: "ผ่านเทสต์ครบ 5 ข้อด้วย `uv run pytest -v` และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน Python คำสั่ง `' '.join(text.split())` จัดการได้พร้อมกันทั้งช่องว่างหัวท้าย ช่องว่างหลายตัวติดกัน แท็บ (`\\t`) และขึ้นบรรทัดใหม่ (`\\n`) ในบรรทัดเดียว",
      },
      {
        body: "ใน `export_normalized_jsonl` อย่าแก้ `dict` ต้นฉบับใน `records` โดยตรง (mutate input) — ให้สร้าง `dict` ใหม่ด้วย `{**rec, 'message_th': ..., 'tags': ...}` และเรียก `target.parent.mkdir(parents=True, exist_ok=True)` ก่อนเขียนไฟล์",
      },
      {
        body: "โค้ดของ 2 ฟังก์ชันแรกพร้อมแล้ว — เติมการวนสร้าง JSONL และเขียนลง `target` ใน `export_normalized_jsonl` แล้วรัน `uv run pytest -v`",
        code: {
          language: "python",
          filename: "hint-d009-l3.py",
          code: `import json
from pathlib import Path


class EmptyTicketError(ValueError):
    """โยนเมื่อข้อความทิกเก็ตว่างหรือสั้นกว่าเกณฑ์ขั้นต่ำ"""


def clean_thai_message(text: str) -> str:
    cleaned = " ".join(text.split())
    if len(cleaned) < 5:
        raise EmptyTicketError("ข้อความทิกเก็ตต้องยาวอย่างน้อย 5 ตัวอักษร")
    return cleaned


def normalize_tags(tags: list[str]) -> list[str]:
    cleaned = [t.strip().lower() for t in tags if t.strip()]
    return list(dict.fromkeys(cleaned))


def export_normalized_jsonl(records: list[dict[str, object]], target: Path) -> int:
    # TODO: แปลงทุกรายการด้วย clean_thai_message + normalize_tags แล้วเขียน UTF-8 JSONL ลง target
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# รันชุดทดสอบแบบแสดงชื่อทีละข้อ
uv run pytest -v
uv run ruff check .`,
      caption: "ลองรันเฉพาะบางเทสต์ด้วย `uv run pytest -k tmp_path -v` เพื่อดูความเร็วของเทสต์ที่แยกอิสระ",
    },
  },

  mistakes: [
    {
      title: "ตั้งชื่อไฟล์หรือฟังก์ชันทดสอบไม่ขึ้นต้นด้วย `test_`",
      symptom: "รัน `uv run pytest` แล้วขึ้น `collected 0 items` ทั้งที่เขียนโค้ดทดสอบไว้เต็มไฟล์",
      fix: "ตั้งชื่อไฟล์เป็น `test_*.py` (หรือ `*_test.py`) และชื่อฟังก์ชันเป็น `def test_...():` ตามกติกาการค้นหาของ `pytest`",
    },
    {
      title: "ใช้ `pytest.raises(Exception)` กว้างเกินไปโดยไม่ระบุ `match`",
      symptom: "เทสต์ผ่านทั้งที่โค้ดพังเพราะ `KeyError` หรือ `TypeError` ที่ไม่ได้ตั้งใจ ไม่ใช่ error ทางธุรกิจที่ต้องการตรวจ",
      fix: "ระบุคลาส exception ที่เฉพาะเจาะจง เช่น `pytest.raises(EmptyTicketError, match=\"อย่างน้อย 5\")` เสมอ",
    },
    {
      title: "แชร์ `list` หรือ `dict` แบบ global ข้ามหลายเทสต์แทนการใช้ `@pytest.fixture`",
      symptom: "เทสต์หนึ่งแก้ค่าใน `dict` แล้วทำให้เทสต์ถัดไปพังแบบสุ่มเมื่อรันต่างลำดับ",
      fix: "ห่อการสร้างข้อมูลไว้ใน `@pytest.fixture` (scope เริ่มต้นคือ `function`) เพื่อให้ทุกเทสต์ได้รับข้อมูลสดใหม่เสมอ",
    },
    {
      title: "เขียนไฟล์ทดสอบลงโฟลเดอร์โปรเจกต์จริงแทน `tmp_path`",
      symptom: "หลังรัน `pytest` มีไฟล์ขยะโผล่ใน `git status` หรือเทสต์พังเมื่อรันซ้ำเพราะไฟล์เดิมค้างอยู่",
      fix: "รับพารามิเตอร์ `tmp_path: Path` จาก `pytest` เสมอเมื่อต้องทดสอบการอ่าน-เขียนไฟล์",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความเข้าใจเรื่อง AAA, `pytest.raises`, Fixture Isolation และ `tmp_path`",
    questions: [
      mc(
        "d009-q1",
        "เหตุใดการใช้ `with pytest.raises(EmptyTicketError, match='อย่างน้อย 5'):` จึงดีกว่า `with pytest.raises(Exception):`?",
        [
          ["เพราะ `pytest.raises` ไม่รองรับคลาส `Exception`", "`pytest.raises` รองรับ `Exception` ได้ แต่จะกว้างเกินไปจนบังบั๊กอื่น"],
          ["เพราะช่วยยืนยันทั้งชนิดของ exception ที่เฉพาะเจาะจงและสาเหตุของ error ไม่ให้เทสต์ผ่านผิดพลาดจากบั๊กอื่น", "ถูก — ถ้าเกิด `KeyError` หรือ `ValueError` จากเหตุอื่น เทสต์จะฟ้องทันที"],
          ["เพราะทำให้ `pytest` รันเร็วขึ้น 10 เท่า", "ความต่างด้านเวลาแทบไม่มี จุดประสงค์หลักคือความแม่นยำในการตรวจจับบั๊ก"],
          ["เพราะ `match=` จะช่วยแก้ข้อความ error ให้โดยอัตโนมัติ", "`match=` ใช้ตรวจจับด้วย regex เท่านั้น ไม่ได้แก้ไขข้อความ"],
        ],
        "B",
        "การระบุชนิด exception ที่แคบที่สุดร่วมกับ `match=` ทำให้เทสต์ตรวจจับได้จริงว่าโค้ดล้มเหลวด้วยเหตุผลที่เราออกแบบไว้",
        "ทำไมควรระบุชนิด exception เฉพาะเจาะจงและ `match=` ใน `pytest.raises`?",
        "เพื่อป้องกันไม่ให้เทสต์ผ่านผิดพลาดจาก exception อื่นที่ไม่ตั้งใจ (เช่น `TypeError` หรือ `ValueError` จากจุดอื่น)",
      ),
      mc(
        "d009-q2",
        "เมื่อประกาศ `@pytest.fixture` โดยไม่ระบุ `scope` หากมี 3 ฟังก์ชันเทสต์รับ fixture ชื่อนี้เป็นพารามิเตอร์ `pytest` จะเรียกฟังก์ชัน fixture กี่ครั้ง?",
        [
          ["1 ครั้ง แล้วแชร์ออบเจกต์เดิมให้ทั้ง 3 เทสต์", "นั่นคือพฤติกรรมของ `scope='module'` หรือ `scope='session'` ไม่ใช่ค่าเริ่มต้น"],
          ["3 ครั้ง (สร้างใหม่แยกให้ทีละฟังก์ชันเทสต์)", "ถูก — ค่าเริ่มต้นคือ `scope='function'` เพื่อรับประกัน test isolation"],
          ["0 ครั้ง จนกว่าจะเรียกชื่อฟังก์ชัน fixture เองในโค้ด", "ห้ามเรียก fixture function ตรง ๆ — `pytest` จะฉีดค่าให้เมื่อใส่ชื่อเป็นพารามิเตอร์"],
          ["6 ครั้ง (ก่อนและหลังทุกเทสต์)", "fixture ถูกเรียก 1 ครั้งต่อเทสต์ โดยโค้ดหลัง `yield` (ถ้ามี) คือส่วน teardown"],
        ],
        "B",
        "ค่าเริ่มต้น `scope=\"function\"` ช่วยแยกสถานะของแต่ละเทสต์ออกจากกัน ทำให้การแก้ข้อมูลในเทสต์หนึ่งไม่รั่วไหลไปพังเทสต์อื่น",
        "ค่าเริ่มต้นของ `scope` ใน `@pytest.fixture` คืออะไร และมีประโยชน์อย่างไร?",
        "`scope='function'` — สร้างข้อมูลใหม่แยกให้ทุกฟังก์ชันเทสต์ เพื่อป้องกันสถานะรั่วไหลข้ามเทสต์ (test isolation)",
      ),
      mc(
        "d009-q3",
        "คุณต้องการทดสอบฟังก์ชันที่อ่านไฟล์ทิกเก็ตภาษาไทยรูปแบบ JSONL จากดิสก์ แนวทางใดใน `pytest` ที่สะอาดและปลอดภัยที่สุด?",
        [
          ["เขียนไฟล์ลง `data/test_tmp.jsonl` ในโปรเจกต์แล้วจำไว้ว่าต้องลบหลังรัน", "หากเทสต์พังกลางคันไฟล์ขยะจะค้างใน repo และเสี่ยงชนกันเมื่อรันขนาน"],
          ["ใช้ built-in fixture `tmp_path: Path` สร้างไฟล์ชั่วคราวด้วย `encoding='utf-8'`", "ถูก — `tmp_path` แยกโฟลเดอร์ชั่วคราวให้แต่ละเทสต์และเป็นออบเจกต์ `pathlib.Path` พร้อมใช้"],
          ["สร้างไฟล์ไว้ใน `C:\\temp\\test.jsonl` แบบ hard-code", "ผูกกับ OS เดียว จะพังทันทีบน macOS/Linux CI"],
          ["ไม่ต้องทดสอบโค้ดที่แตะไฟล์เลย", "โค้ด I/O คือจุดที่เจอบั๊ก encoding ภาษาไทยและ path บ่อยที่สุด ควรทดสอบเสมอ"],
        ],
        "B",
        "`tmp_path` ให้ `pathlib.Path` ที่แยกอิสระต่อเทสต์ ใช้ได้ทุก OS และไม่ทำให้ working directory ของโปรเจกต์สกปรก",
        "built-in fixture ตัวใดใน `pytest` ที่ให้โฟลเดอร์ชั่วคราวแบบ `pathlib.Path` แยกต่อเทสต์?",
        "`tmp_path` — เหมาะสำหรับทดสอบการอ่าน-เขียนไฟล์โดยไม่แตะไฟล์จริงและไม่ทิ้งขยะใน repo",
      ),
      mc(
        "d009-q4",
        "ใน `@pytest.fixture` ที่ต้องสร้างทรัพยากรชั่วคราวแล้วเก็บกวาด (teardown) หลังเทสต์จบแม้เทสต์จะ fail ต้องใช้คีย์เวิร์ดใดแทน `return`?",
        [
          ["`break`", "`break` ใช้หยุดลูป ไม่เกี่ยวกับวงจรชีวิต fixture"],
          ["`yield`", "ถูก — โค้ดก่อน `yield` คือ Setup, ค่าหลัง `yield` ถูกส่งให้เทสต์ และโค้ดหลัง `yield` คือ Teardown ที่รันเสมอ"],
          ["`raise`", "`raise` จะทำให้ fixture พังทันทีก่อนเทสต์เริ่มรัน"],
          ["`finally` โดยไม่ต้องคืนค่า", "fixture ต้องส่งค่าให้เทสต์ผ่าน `yield` (สามารถหุ้มด้วย `try/finally` รอบ `yield` ได้)"],
        ],
        "B",
        "`yield` ใน `@pytest.fixture` แบ่งขั้นตอน Setup และ Teardown อย่างชัดเจน โดย `pytest` รับประกันว่าจะรันโค้ดหลัง `yield` เพื่อเก็บกวาดเสมอ",
        "จะเขียน Teardown ใน `@pytest.fixture` ให้รันเก็บกวาดหลังเทสต์จบได้อย่างไร?",
        "ใช้ `yield <value>` แทน `return` แล้ววางโค้ดเก็บกวาดไว้หลังบรรทัด `yield`",
      ),
    ],
  },

  takeaways: [
    "เขียนทุก unit test ตามจังหวะ **Arrange → Act → Assert** เพื่อให้โค้ดทดสอบอ่านง่ายเหมือนเอกสารสเปก",
    "ตรวจจับ error path ด้วย `pytest.raises(SpecificError, match=...)` เพื่อยืนยันทั้งชนิดและเหตุผลของข้อผิดพลาด",
    "ใช้ `@pytest.fixture` (default `scope='function'`) แทนตัวแปร global เพื่อรับประกัน test isolation และใช้ `yield` เมื่อต้องการ teardown",
    "ใช้ built-in fixture `tmp_path` ร่วมกับ `pathlib.Path` และ `encoding='utf-8'` สำหรับทุกเทสต์ที่อ่าน-เขียนไฟล์ภาษาไทย",
  ],

  reviewCards: [
    rc(
      "d009-rc-1",
      "รูปแบบ Arrange–Act–Assert (AAA) ใน unit testing แต่ละขั้นทำหน้าที่อะไร?",
      "Arrange = เตรียมข้อมูล/สถานะตั้งต้น, Act = เรียกพฤติกรรมเป้าหมาย 1 อย่าง, Assert = ตรวจสอบผลลัพธ์หรือ exception ที่คาดหวัง",
    ),
    rc(
      "d009-rc-2",
      "ความต่างระหว่าง `return` กับ `yield` ภายใน `@pytest.fixture` คืออะไร?",
      "`return` ส่งค่าให้เทสต์แล้วจบเลย ส่วน `yield` ส่งค่าให้เทสต์และกลับมารันโค้ดด้านล่างต่อเป็น Teardown เสมอหลังเทสต์จบ (แม้เทสต์ fail)",
    ),
    rc(
      "d009-rc-3",
      "ทำไมจึงควรใช้ `tmp_path` แทนการเขียนไฟล์ลงโฟลเดอร์โปรเจกต์เวลาเทสต์ฟังก์ชันอ่าน-เขียน JSONL?",
      "เพราะ `tmp_path` สร้างโฟลเดอร์ชั่วคราวแบบ `pathlib.Path` แยกอิสระให้แต่ละเทสต์ ไม่ทิ้งไฟล์ขยะใน repo ไม่ชนกันข้ามเทสต์ และใช้ได้ทุก OS",
    ),
  ],

  sources: [
    { label: "pytest Official Docs — Get Started", href: "https://docs.pytest.org/en/stable/getting-started.html" },
    { label: "pytest Official Docs — How to use fixtures", href: "https://docs.pytest.org/en/stable/how-to/fixtures.html" },
    { label: "pytest Official Docs — Temporary directories (`tmp_path`)", href: "https://docs.pytest.org/en/stable/how-to/tmp_path.html" },
    { label: "pytest Official Docs — Assertions about expected exceptions", href: "https://docs.pytest.org/en/stable/how-to/assert.html#assertions-about-expected-exceptions" },
  ],

  glossary: [
    "pytest",
    "fixture",
    "pathlib",
    "jsonl",
    "custom-exception",
    "fail-fast",
    "uv",
    "ruff",
  ],
});
