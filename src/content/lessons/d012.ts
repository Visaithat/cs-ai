import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D012 — Phase 1 / Block B03 (Review Day)
 * Interleaved recall of D9–D11 + D4–D6 and 90% coverage test suite for Thai Ticket Parser.
 */
export const d012: Lesson = defineLesson({
  day: 12,
  titleTh: "ทบทวน B03: สร้างชุดทดสอบ 90% Coverage ให้ Thai Ticket Parser",
  tagline: "30 นาที · รอบทบทวน D9–D11 + D4–D6 · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · สร้างชุดเทสต์ pytest + pytest-cov ครบทั้ง happy path, malformed JSONL และ error branches",
  icon: "shield-check",
  visual: {
    id: "pytest-fixtures",
    title: "ทบทวน B03: สร้างชุดทดสอบ 90% Coverage ให้ Thai Ticket Parser",
    caption: "ดูภาพรวมการครอบคลุม happy path, malformed JSONL และ edge cases ด้วย pytest + coverage",
    alt: "แผนภาพการวัด test coverage 90% ของ Ticket parser",
  },
  requiresApiKey: false,
  tools: ["pytest", "pytest-cov", "Ruff", "Pydantic v2"],

  bigPicture: [
    {
      node: 1,
      heading: "รับประกันความน่าเชื่อถือของท่อรับข้อมูล Thai Support Ticket",
      body: "ตั้งแต่ Day 4–6 เราสร้าง Thai Ticket Parser ที่อ่านไฟล์ {{jsonl}} ผ่าน {{pathlib}}, ตรวจ {{schema}} ด้วย {{pydantic}} และแยกของเสียออก — แต่โค้ดที่ไม่มีชุดทดสอบครอบคลุมคือโค้ดที่พร้อมพังเงียบทุกครั้งที่แก้ไข",
      lessonNote: "วันนี้เราสร้างชุดทดสอบระดับ production ที่ครอบคลุมอย่างน้อย 90% ของโค้ดพาร์เซอร์ทั้งไฟล์",
    },
    {
      node: 3,
      heading: "ใช้ Coverage เป็นเรดาร์หาจุดบอด ไม่ใช่แค่ตัวเลขสวย ๆ",
      body: "การวัด test coverage ช่วยชี้ให้เห็นบรรทัดและสาขา `if / except` ที่ยังไม่เคยถูกทดสอบเลย เช่น บรรทัด JSON พัง, ไฟล์หาไม่เจอ หรือฟิลด์ nested ขาดหาย",
      lessonNote: "เราจะใช้ `pytest --cov --cov-report=term-missing` เพื่อไล่ปิดทุก branch สำคัญควบคู่กับ `assert` ที่มีคุณภาพ",
    },
    {
      node: 4,
      heading: "รวมด่าน Test + Coverage + Lint เป็นประตูเดียวก่อนส่งมอบ",
      body: "ระบบ AI ที่พร้อมขยายใน Block ถัดไปต้องผ่านทั้ง 3 ด่านอัตโนมัติ: `pytest` (พฤติกรรมถูก), `--cov-fail-under=90` (ไม่มีสาขาสำคัญหลุดรอด) และ {{ruff}} (โค้ดสะอาดไร้ bug patterns)",
      lessonNote: "ชุดทดสอบวันนี้จะเป็นตาข่ายนิรภัยให้คุณกล้าต่อยอดโปรเจกต์สู่ HTTP client, async และ CLI ในครึ่งหลังของ Phase 1",
    },
  ],

  objectives: [
    "**ทบทวนแบบผสมผสาน (Interleaved Recall)** เนื้อหาจาก D9–D11 (`pytest`, {{fixture}}, `tmp_path`, {{parametrize}}, {{mocking}}, {{ruff}}, {{pre-commit}}) ร่วมกับ D4–D6 ({{pydantic}}, {{pathlib}}, {{jsonl}}, {{custom-exception}})",
    "**สร้างชุดทดสอบครบวงจร** ให้ Thai Support Ticket Parser ที่ครอบคลุม happy path, malformed JSONL, {{validation-error}} ในชั้น nested และไฟล์ไม่พบด้วย `pytest-cov` จนได้ **>= 90% coverage**",
    "**อ่านรายงาน `term-missing`** เพื่อระบุบรรทัดและ branch ที่ยังขาดการทดสอบ แล้วเขียนเทสต์ที่มี `assert` แม่นยำพร้อมผ่านด่าน `ruff check` และ `ruff format --check`",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D9 (`pytest` + fixtures + `tmp_path`), D10 (`parametrize` + mocking) และ D11 (`Ruff` + `pre-commit`)",
    "จำโครงสร้าง Thai Support Ticket Parser ที่ใช้ `Pydantic v2` + `pathlib` + JSONL จาก D4–D6 ได้",
    "มี `uv` ติดตั้งบนเครื่อง — รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์รอบทบทวน Day 12 ด้วย {{uv}} และติดตั้ง `pydantic`, `pytest`, `pytest-cov` และ `ruff` ให้พร้อมวัด coverage บนเครื่อง",
    commands: `uv init ai-day12-review && cd ai-day12-review
uv add pydantic
uv add --dev pytest pytest-cov ruff

# ยืนยันว่าปลั๊กอิน pytest-cov พร้อมใช้งาน
uv run pytest --cov --version`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day12-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic` และ dev tools (`pytest`, `pytest-cov`, `ruff`)"],
      ["verify", "รัน `uv run pytest --cov --version` เพื่อเช็กว่า `pytest-cov` โหลดได้ปกติ"],
    ],
    note: "จังหวะ 30 นาทีของวันทบทวน: ทำ Interleaved Quiz 10 นาที → ลงมือเขียนชุดเทสต์ให้ถึง >= 90% coverage 15 นาที → ปิดท้ายด้วย `ruff check` และจดจุดที่พลาดเข้า Error Log 5 นาที",
  },

  concepts: [
    {
      id: "review-b03-interleaving",
      title: "1 · ร้อยต่อคลังอาวุธ B03 (D9–D11) เข้ากับ Parser จาก B01–B02 (D4–D6)",
      paragraphs: [
        "ใน Block B03 เราสร้างเกราะป้องกันโค้ดครบ 3 ชั้น: **ชั้นที่ 1 (D9)** คือ `pytest`, AAA, `pytest.raises`, {{fixture}} และ `tmp_path`; **ชั้นที่ 2 (D10)** คือ {{parametrize|@pytest.mark.parametrize}} และ {{mocking}} เพื่อคุมเคสขอบและ error ภายนอก; **ชั้นที่ 3 (D11)** คือ {{ruff}} + {{pre-commit}} เพื่อคุมคุณภาพโค้ดอัตโนมัติ",
        "เมื่อนำทั้ง 3 ชั้นมาสวมทับลงบน Thai Support Ticket Parser ที่รับไฟล์ {{jsonl}} ผ่าน {{pathlib}} (D5), ตรวจ {{schema}} ซ้อนด้วย {{pydantic}} (D4) และโยน {{custom-exception}} เมื่ออินพุตพังระดับไฟล์ (D6) คุณจะได้โมดูลที่ทั้งอ่านง่าย ทนทาน และกล้าแก้ไขโดยไม่กลัวพังเงียบ",
      ],
      analogy:
        "เหมือนโรงงานผลิตอาหารที่สร้างสายพานเสร็จแล้ว (D4–D6) วันนี้เราติดตั้งห้องแล็บตรวจคุณภาพครบวงจร (D9–D11) เพื่อตรวจทุกจุดเสี่ยงก่อนส่งสินค้าจริง",
      bullets: [
        "**`@pytest.fixture` + `tmp_path`** — สร้างไฟล์ `.jsonl` ตัวอย่างที่ผสมทั้งแถวดี แถวว่าง แถว JSON พัง และแถวผิด schema",
        "**`@pytest.mark.parametrize`** — ไล่ตรวจกฎ prefix (`TKT-`, `CUS-`), ความยาวข้อความภาษาไทย และการทำความสะอาดแท็กครบทุกเคสขอบ",
        "**`monkeypatch` / Fake** — จำลอง notifier/sink ภายนอกเมื่อเกิด error โดยไม่ยิงเน็ตจริง",
        "**`Ruff` (`E, F, I, B, UP`)** — ตรวจทั้งไฟล์โค้ดหลักและไฟล์เทสต์ให้สะอาดไร้ warning",
      ],
      whyTitle: "Why this matters — โค้ดทดสอบก็เป็นซอร์สโค้ดที่ต้องดูแลเหมือนกัน",
      whyParagraphs: [
        "หลายคนเขียนโค้ดหลักอย่างประณีต แต่เขียนไฟล์ `test_*.py` แบบลวก ๆ จนมี unused import หรือ fixture ซ้ำซ้อน — การรัน Ruff ครอบคลุมทั้งโค้ดหลักและเทสต์ช่วยให้ชุดทดสอบอ่านง่ายและแก้ต่อง่าย",
        "ใน Phase 5 และ Capstone คุณจะต้องดูแลชุดเทสต์และ eval harness หลายสิบไฟล์ วินัยจาก Block B03 นี้จึงคุ้มค่าในระยะยาวมาก",
      ],
    },
    {
      id: "understanding-test-coverage",
      title: "2 · วัดจุดบอดด้วย pytest-cov และอ่านรายงาน term-missing",
      paragraphs: [
        "**Code Coverage (Line & Branch Coverage)** คือสัดส่วนบรรทัดหรือเงื่อนไข `if / else / except` ในซอร์สโค้ดที่ถูกรันผ่านจริงระหว่างการรัน `pytest` คำสั่ง `uv run pytest --cov=ticket_parser --cov-report=term-missing` จะพิมพ์ตารางเปอร์เซ็นต์พร้อมคอลัมน์ **`Missing`** ที่ชี้เลขบรรทัดซึ่งยังไม่มีเทสต์ใดวิ่งผ่านเลย",
        "กฎสำคัญที่ต้องจำให้ขึ้นใจ: **90% coverage เป็นเกณฑ์ช่วยหาจุดบอด ไม่ใช่เป้าหมายให้โกงตัวเลข** — การเขียนเทสต์ที่เรียกฟังก์ชันเฉย ๆ โดยไม่ `assert` ผลลัพธ์อาจดัน coverage ถึง 100% แต่จับบั๊กไม่ได้เลย เทสต์ที่ดีต้องทั้ง *วิ่งผ่านสาขานั้น* และ *ตรวจผลลัพธ์หรือ exception อย่างเข้มงวด*",
      ],
      analogy:
        "เหมือนการเช็กแผนที่ไฟฉายในห้องเก็บของ — `Missing` บอกว่ามุมไหนยังมืดไม่เคยส่องไฟไปถึง แต่คุณยังต้องมองดูจริง ๆ (`assert`) ว่าของในมุมนั้นไม่เสียหาย ไม่ใช่แค่กวาดไฟฉายผ่าน ๆ",
      code: {
        language: "bash",
        filename: "terminal",
        code: `# วัด coverage พร้อมแสดงเลขบรรทัดที่ยังไม่ได้ทดสอบ และบังคับเกณฑ์ขั้นต่ำ 90%
uv run pytest --cov=ticket_parser --cov-report=term-missing --cov-fail-under=90`,
        caption: "แฟล็ก `--cov-fail-under=90` จะทำให้คำสั่งคืน exit code 1 ทันทีใน CI หาก coverage ต่ำกว่า 90%",
      },
      whyTitle: "Why this matters — Branch ที่ถูกลืมมักเป็นจุดที่พังใน Production",
      whyParagraphs: [
        "เกือบทุกครั้งที่รัน `--cov-report=term-missing` ครั้งแรก บรรทัดที่โผล่ในคอลัมน์ `Missing` มักจะเป็น `except FileNotFoundError:`, `except json.JSONDecodeError:`, บรรทัดว่างในไฟล์ หรือกรณีลิสต์ว่าง `[]`",
        "จุดเหล่านั้นคือเคสที่เกิดขึ้นจริงบน production เสมอเมื่อลูกค้าอัปโหลดไฟล์เสียหรือไฟล์ว่าง การไล่ปิดคอลัมน์ `Missing` อย่างมีสติจึงช่วยลดอุบัติเหตุได้ตรงจุด",
      ],
    },
    {
      id: "testing-error-branches-cleanly",
      title: "3 · กลยุทธ์ไล่เก็บ Error Branches ของ Ticket Parser ให้ครบ >= 90%",
      paragraphs: [
        "เวลาต้องเขียนชุดเทสต์ให้โมดูล parser ที่มีทั้ง Pydantic model, JSONL file streaming และการแจ้งเตือน error ภายนอก ให้แบ่งเคสออกเป็น 4 กลุ่มอย่างเป็นระบบ: (1) **Happy Path + Normalization** (ตัดช่องว่าง, แปลงแท็ก, นับช่องทาง), (2) **Schema Edge Cases** (`@pytest.mark.parametrize` กับฟิลด์ผิดกฎ), (3) **File & JSONL Failures** (ไฟล์ไม่มี, บรรทัดว่าง, JSON พังครึ่งบรรทัด, แถวที่ไม่ใช่ JSON object เช่น `[1, 2]`) และ (4) **External Hook / Callback** (ใช้ Fake หรือ `monkeypatch` ตรวจว่าเมื่อเจอ error ระบบส่งรายงานออกครบโดยไม่แครช)",
        "เมื่อจัดกลุ่ม 4 หมวดนี้ครบ โค้ดแทบทุกบรรทัดและทุก `except` branch จะถูกทดสอบตามธรรมชาติจนทะลุ 95–100% โดยไม่ต้องฝืนเขียนเทสต์แปลก ๆ เลย",
      ],
      analogy:
        "เหมือนเช็กลิสต์ตรวจรับบ้าน 4 หมวด (โครงสร้าง, ไฟฟ้า, ประปา, ระบบเตือนภัย) — แค่ตรวจครบ 4 หมวดก็ครอบคลุมจุดสำคัญเกือบ 100% โดยไม่ตกหล่น",
      whyTitle: "Why this matters — เตรียมพร้อมก่อนเข้าสู่ Network & Retry ใน Block B04",
      whyParagraphs: [
        "ตั้งแต่ Day 13 เป็นต้นไป โค้ดของคุณจะเริ่มสื่อสารผ่านเครือข่ายด้วย `httpx` ซึ่งมีสาขาความล้มเหลวซับซ้อนกว่าเดิม (timeout, 429, 5xx, circuit open)",
        "การฝึกวางแผนเทสต์ 4 หมวดและตรวจด้วย `pytest-cov` จนคล่องในวันนี้ จะทำให้คุณคุมคุณภาพของโค้ดเครือข่ายและ async ได้อย่างมั่นใจ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ pytest-cov กับ Vitest / Jest Coverage",
      body: [
        "หากคุณเคยใช้ `vitest --coverage` (v8 / istanbul) ฝั่ง Python ใช้ `pytest-cov` ที่มีกลไกและเกณฑ์ threshold เหมือนกัน:",
      ],
      table: [
        ["`pytest --cov=ticket_parser`", "`vitest run --coverage`"],
        ["`--cov-report=term-missing`", "ตาราง Uncovered Line #s ใน terminal"],
        ["`--cov-fail-under=90`", "`coverage.thresholds.lines: 90` ใน `vitest.config.ts`"],
        ["`--cov-branch` (วัดสาขา `if/else`)", "`coverage.thresholds.branches`"],
      ],
    },
    student: {
      title: "First-Year Note — Coverage 95% ไม่ได้แปลว่าไม่มีบั๊ก 0 ตัว",
      body: [
        "Coverage บอกได้แค่ว่า \"บรรทัดนี้เคยถูกรันตอนทดสอบแล้ว\" แต่ไม่ได้การันตีว่าคุณคิดเคสขอบครบทุกแบบในโลกจริง เช่น โค้ดอาจรันผ่านบรรทัด `len(msg) >= 5` แล้ว แต่คุณอาจลืมทดสอบกรณีข้อความที่มีช่องว่างล้วน `\"     \"`",
        "ดังนั้นให้ใช้ coverage เป็น \"ไฟฉายหาบรรทัดที่ลืมเทสต์\" คู่กับสมองของคุณในการออกแบบเคสขอบและ `assert` ที่ตรวจผลลัพธ์จริงเสมอ",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองดูวิธีอ่านผล `pytest --cov` จาก 62% แล้วค่อย ๆ เพิ่มเทสต์สำหรับ malformed JSONL และ `FileNotFoundError` จน coverage ขยับขึ้นเกิน 95%",
    steps: [
      {
        title: "1 · รอบแรก: มีเฉพาะ Happy Path — Coverage อยู่ที่ 62%",
        explain:
          "เมื่อเขียนเทสต์แค่เคสข้อมูลสมบูรณ์ 1 เคส รายงาน `term-missing` จะชี้เลขบรรทัดของสาขา error (`FileNotFoundError`, `JSONDecodeError`, `ValidationError`) ที่ยังไม่เคยถูกแตะเลย",
        code: {
          language: "bash",
          filename: "terminal",
          code: `uv run pytest --cov=ticket_parser --cov-report=term-missing`,
        },
        output: `Name               Stmts   Miss  Cover   Missing
------------------------------------------------
ticket_parser.py      58     22    62%   39, 54, 71-88, 95-102
------------------------------------------------
TOTAL                 58     22    62%`,
      },
      {
        title: "2 · รอบสอง: เติม `tmp_path` + Malformed JSONL + `parametrize`",
        explain:
          "สร้างไฟล์ `.jsonl` ใน `tmp_path` ที่ใส่ครบทั้งบรรทัดว่าง, JSON เสีย (`{broken`), JSON ที่ไม่ใช่ dict (`[1, 2]`) และทิกเก็ตที่ผิด nested schema พร้อมทดสอบ `FileNotFoundError` ด้วย `pytest.raises`",
        code: {
          language: "python",
          filename: "test_error_branches_snippet.py",
          code: `from pathlib import Path
import pytest
from ticket_parser import TicketSourceNotFoundError, parse_jsonl_file


def test_missing_file_raises_custom_error(tmp_path: Path) -> None:
    missing = tmp_path / "does_not_exist.jsonl"
    with pytest.raises(TicketSourceNotFoundError, match="ไม่พบไฟล์"):
        parse_jsonl_file(missing)


def test_malformed_jsonl_and_non_object_are_isolated(tmp_path: Path) -> None:
    bad_file = tmp_path / "mixed.jsonl"
    bad_file.write_text(
        '\\n'
        '{not valid json\\n'
        '["list-not-dict"]\\n'
        '{"ticket_id": "TKT-001", "channel": "line", "message_th": "โอนเงินแล้วครับ", "customer": {"customer_id": "CUS-1001"}}\\n',
        encoding="utf-8",
    )
    report = parse_jsonl_file(bad_file)
    assert len(report.valid) == 1
    assert len(report.errors) == 2`,
        },
        output: `# ปิดสาขา FileNotFoundError, บรรทัดว่าง, JSONDecodeError และ non-dict ครบใน 2 เทสต์`,
      },
      {
        title: "3 · รอบสาม: รันตรวจพร้อมเกณฑ์ `--cov-fail-under=90` และ Ruff",
        explain:
          "เมื่อเพิ่มเทสต์สำหรับ `to_jsonl`, `channel_counts` และ error hook ครบทุกสาขา รายงาน coverage จะทะลุ 95% และผ่านทั้งเกณฑ์ coverage กับ Ruff",
        code: {
          language: "bash",
          filename: "terminal",
          code: `uv run pytest --cov=ticket_parser --cov-report=term-missing --cov-fail-under=90
uv run ruff check . && uv run ruff format --check .`,
        },
        output: `Name               Stmts   Miss  Cover   Missing
------------------------------------------------
ticket_parser.py      58      1    98%   104
------------------------------------------------
TOTAL                 58      1    98%
Required test coverage of 90% reached. Total coverage: 98.28%
All checks passed!
2 files already formatted`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อย: หลงเขียนเทสต์ที่เรียกฟังก์ชันแล้วไม่ `assert` อะไรเลยเพียงเพื่อดันตัวเลข coverage ให้ถึง 90% — ตัวเลขจะสวยหลอกตาแต่ถ้าแก้ตรรกะพังเทสต์ก็ยังเขียวอยู่ดี ทุกเทสต์ต้องมี `assert` ที่ตรวจผลลัพธ์หรือ `pytest.raises` เสมอ!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน B03 (15 นาที): นำโมดูล `ticket_parser.py` ด้านล่างไปวางในโปรเจกต์ แล้วเขียนชุดเทสต์ `test_ticket_parser.py` ให้ครบทั้ง 4 หมวด (fixtures + `tmp_path`, `parametrize`, error branches และ mocking `on_error` callback) จนได้ **>= 90% coverage** และผ่าน `ruff check` + `ruff format --check`",
    requirements: [
      "บันทึก `ticket_parser.py` จากโค้ดเริ่มต้นลงในโปรเจกต์ (ไม่ต้องแก้ logic ของพาร์เซอร์ ยกเว้นหากต้องการจัด format ด้วย Ruff)",
      "เขียน `test_ticket_parser.py` ที่มี `@pytest.fixture` อย่างน้อย 1 ตัวสำหรับสร้างไฟล์ JSONL ด้วย `tmp_path` และทดสอบ happy path (`valid`, `tags` normalization, `to_jsonl()`, `channel_counts()`)",
      "ใช้ `@pytest.mark.parametrize` ทดสอบเคสผิดกฎ schema อย่างน้อย 4 เคส (เช่น `ticket_id` ไม่ขึ้นต้น `TKT-`, `customer_id` ไม่ขึ้นต้น `CUS-`, `message_th` ช่องว่างล้วน, `channel` ไม่อยู่ใน Literal)",
      "ทดสอบทุก error branch ของไฟล์และ JSONL: ไฟล์ไม่พบ (`TicketSourceNotFoundError`), บรรทัดว่าง, JSON รูปแบบผิด (`JSONDecodeError`), JSON ที่ไม่ใช่ object (`[1, 2]`), และทดสอบ callback `on_error` ด้วย fake collector",
      "รัน `uv run pytest --cov=ticket_parser --cov-report=term-missing --cov-fail-under=90` ผ่านเกณฑ์ >= 90% และรัน `uv run ruff check . && uv run ruff format --check .` ผ่านสะอาด",
    ],
    starter: {
      language: "python",
      filename: "ticket_parser.py",
      code: `import json
from collections import Counter
from collections.abc import Callable
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator


class TicketSourceNotFoundError(FileNotFoundError):
    """โยนเมื่อไม่พบไฟล์ JSONL ต้นทาง"""


class CustomerInfo(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    customer_id: str = Field(min_length=7)
    tier: Literal["standard", "vip"] = "standard"

    @field_validator("customer_id")
    @classmethod
    def check_customer_prefix(cls, value: str) -> str:
        if not value.startswith("CUS-"):
            raise ValueError("customer_id ต้องขึ้นต้นด้วย 'CUS-'")
        return value


class SupportTicket(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ticket_id: str = Field(min_length=7)
    channel: Literal["line", "email", "web"]
    message_th: str = Field(min_length=5, max_length=500)
    tags: list[str] = Field(default_factory=list)
    customer: CustomerInfo

    @field_validator("ticket_id")
    @classmethod
    def check_ticket_prefix(cls, value: str) -> str:
        if not value.startswith("TKT-"):
            raise ValueError("ticket_id ต้องขึ้นต้นด้วย 'TKT-'")
        return value

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, values: list[str]) -> list[str]:
        cleaned = [t.strip().lower() for t in values if t.strip()]
        return list(dict.fromkeys(cleaned))


class TicketParseError(BaseModel):
    line_no: int
    ticket_id: str | None = None
    messages: list[str]


class ParseReport(BaseModel):
    valid: list[SupportTicket]
    errors: list[TicketParseError]

    def to_jsonl(self) -> str:
        return "\\n".join(ticket.model_dump_json() for ticket in self.valid)

    def channel_counts(self) -> dict[str, int]:
        return dict(Counter(ticket.channel for ticket in self.valid))


def parse_jsonl_file(
    source: Path,
    on_error: Callable[[TicketParseError], None] | None = None,
) -> ParseReport:
    if not source.exists():
        raise TicketSourceNotFoundError(f"ไม่พบไฟล์ทิกเก็ต: {source}")

    valid: list[SupportTicket] = []
    errors: list[TicketParseError] = []

    for line_no, raw_line in enumerate(
        source.read_text(encoding="utf-8").splitlines(),
        start=1,
    ):
        stripped = raw_line.strip()
        if not stripped:
            continue

        try:
            payload = json.loads(stripped)
        except json.JSONDecodeError as exc:
            err = TicketParseError(
                line_no=line_no,
                messages=[f"invalid JSON: {exc.msg}"],
            )
            errors.append(err)
            if on_error is not None:
                on_error(err)
            continue

        if not isinstance(payload, dict):
            err = TicketParseError(
                line_no=line_no,
                messages=["JSON record ต้องเป็น object (dict)"],
            )
            errors.append(err)
            if on_error is not None:
                on_error(err)
            continue

        try:
            valid.append(SupportTicket.model_validate(payload))
        except ValidationError as exc:
            msgs = [
                f"{'.'.join(str(p) for p in item['loc'])}: {item['msg']}"
                for item in exc.errors()
            ]
            raw_tid = payload.get("ticket_id")
            err = TicketParseError(
                line_no=line_no,
                ticket_id=str(raw_tid) if raw_tid is not None else None,
                messages=msgs,
            )
            errors.append(err)
            if on_error is not None:
                on_error(err)

    return ParseReport(valid=valid, errors=errors)
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_parser.py",
      code: `import json
from pathlib import Path

import pytest

from ticket_parser import (
    TicketParseError,
    TicketSourceNotFoundError,
    parse_jsonl_file,
)


@pytest.fixture
def valid_record() -> dict[str, object]:
    return {
        "ticket_id": "  TKT-101  ",
        "channel": "line",
        "message_th": "  โอนเงินแล้วแต่สถานะยังไม่ปรับครับ  ",
        "tags": [" Billing ", "billing", "", "VIP"],
        "customer": {"customer_id": " CUS-5001 ", "tier": "vip"},
    }


def test_parse_valid_jsonl_and_report_helpers(
    valid_record: dict[str, object],
    tmp_path: Path,
) -> None:
    second = {
        "ticket_id": "TKT-102",
        "channel": "web",
        "message_th": "ขอใบกำกับภาษีอิเล็กทรอนิกส์",
        "customer": {"customer_id": "CUS-5002"},
    }
    src = tmp_path / "tickets.jsonl"
    src.write_text(
        json.dumps(valid_record, ensure_ascii=False)
        + "\\n\\n"
        + json.dumps(second, ensure_ascii=False)
        + "\\n",
        encoding="utf-8",
    )

    report = parse_jsonl_file(src)

    assert len(report.valid) == 2
    assert report.errors == []
    assert report.valid[0].ticket_id == "TKT-101"
    assert report.valid[0].tags == ["billing", "vip"]
    assert report.channel_counts() == {"line": 1, "web": 1}

    exported = report.to_jsonl().splitlines()
    assert len(exported) == 2
    assert json.loads(exported[0])["customer"]["customer_id"] == "CUS-5001"


@pytest.mark.parametrize(
    ("overrides", "expected_loc"),
    [
        pytest.param({"ticket_id": "BAD-101"}, "ticket_id", id="bad-ticket-prefix"),
        pytest.param({"channel": "sms"}, "channel", id="invalid-channel"),
        pytest.param({"message_th": "     "}, "message_th", id="blank-message"),
        pytest.param(
            {"customer": {"customer_id": "USR-9999"}},
            "customer.customer_id",
            id="bad-customer-prefix",
        ),
    ],
)
def test_validation_error_branches(
    valid_record: dict[str, object],
    overrides: dict[str, object],
    expected_loc: str,
    tmp_path: Path,
) -> None:
    broken = {**valid_record, **overrides}
    src = tmp_path / "invalid.jsonl"
    src.write_text(json.dumps(broken, ensure_ascii=False) + "\\n", encoding="utf-8")

    captured: list[TicketParseError] = []
    report = parse_jsonl_file(src, on_error=captured.append)

    assert report.valid == []
    assert len(report.errors) == 1
    assert len(captured) == 1
    assert expected_loc in " | ".join(report.errors[0].messages)


def test_malformed_json_and_non_object_invoke_callback(tmp_path: Path) -> None:
    src = tmp_path / "corrupt.jsonl"
    src.write_text('{bad json\\n["not", "a", "dict"]\\n', encoding="utf-8")

    captured: list[TicketParseError] = []
    report = parse_jsonl_file(src, on_error=captured.append)

    assert report.valid == []
    assert len(report.errors) == 2
    assert len(captured) == 2
    assert "invalid JSON" in report.errors[0].messages[0]
    assert "object (dict)" in report.errors[1].messages[0]
    assert report.to_jsonl() == ""
    assert report.channel_counts() == {}


def test_missing_source_file_raises_custom_error(tmp_path: Path) -> None:
    with pytest.raises(TicketSourceNotFoundError, match="ไม่พบไฟล์ทิกเก็ต"):
        parse_jsonl_file(tmp_path / "missing.jsonl")
`,
    },
    selfCheck: [
      "รัน `uv run pytest --cov=ticket_parser --cov-report=term-missing --cov-fail-under=90` ได้ coverage >= 90% (เฉลยอ้างอิงทำได้ถึง 100%)",
      "ทุกเคส error (`TicketSourceNotFoundError`, `JSONDecodeError`, non-dict JSON, nested `ValidationError`) มี `assert` ตรวจข้อความหรือตำแหน่ง field ชัดเจน",
      "ทดสอบ callback `on_error` ด้วย fake list (`captured.append`) โดยไม่พึ่งระบบภายนอก",
      "ไม่มีไฟล์ `.jsonl` ชั่วคราวหลงเหลือในโฟลเดอร์โปรเจกต์เพราะสร้างผ่าน `tmp_path` ทั้งหมด",
      "`uv run ruff check . && uv run ruff format --check .` ผ่านสะอาด 0 warnings",
    ],
    acceptance: "ผ่านครบทุกเทสต์ด้วย coverage >= 90% (`--cov-fail-under=90`) และผ่านทั้ง `ruff check` กับ `ruff format --check`",
    hints: [
      {
        body: "เริ่มจากเขียนเทสต์ happy path 1 ข้อแล้วรัน `uv run pytest --cov=ticket_parser --cov-report=term-missing` ทันที เพื่อดูคอลัมน์ `Missing` ว่าเหลือสาขาไหนบ้างที่ยังไม่ถูกรัน",
      },
      {
        body: "สาขาที่มักหลุดในคอลัมน์ `Missing` คือ: (1) บรรทัดว่าง `if not stripped: continue`, (2) `JSONDecodeError`, (3) `if not isinstance(payload, dict):`, (4) `on_error is not None` ในทุกจุดที่สร้าง error และ (5) `TicketSourceNotFoundError`",
      },
      {
        body: "โครงของ fixture และเทสต์ `parametrize` ด้านล่างครอบคลุม schema errors — เติมเทสต์สำหรับ malformed JSONL (`{bad json`, `[\"list\"]`) และ `TicketSourceNotFoundError` ก็จะแตะ 95–100% ทันที",
        code: {
          language: "python",
          filename: "hint-d012-l3.py",
          code: `import json
from pathlib import Path
import pytest
from ticket_parser import TicketParseError, parse_jsonl_file


@pytest.fixture
def valid_record() -> dict[str, object]:
    return {
        "ticket_id": "TKT-101",
        "channel": "line",
        "message_th": "โอนเงินแล้วแต่สถานะยังไม่ปรับครับ",
        "tags": ["Billing", "billing", "VIP"],
        "customer": {"customer_id": "CUS-5001", "tier": "vip"},
    }


@pytest.mark.parametrize(
    ("overrides", "expected_loc"),
    [
        pytest.param({"ticket_id": "BAD-101"}, "ticket_id", id="bad-ticket-prefix"),
        pytest.param({"channel": "sms"}, "channel", id="bad-channel"),
        pytest.param({"message_th": "   "}, "message_th", id="blank-message"),
        pytest.param(
            {"customer": {"customer_id": "BAD-999"}},
            "customer.customer_id",
            id="bad-customer-prefix",
        ),
    ],
)
def test_schema_errors(
    valid_record: dict[str, object],
    overrides: dict[str, object],
    expected_loc: str,
    tmp_path: Path,
) -> None:
    src = tmp_path / "bad.jsonl"
    src.write_text(
        json.dumps({**valid_record, **overrides}, ensure_ascii=False) + "\\n",
        encoding="utf-8",
    )
    seen: list[TicketParseError] = []
    report = parse_jsonl_file(src, on_error=seen.append)
    assert len(report.errors) == 1
    assert len(seen) == 1
    assert expected_loc in " | ".join(report.errors[0].messages)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# รันชุดเทสต์พร้อมวัด coverage และเกณฑ์ 90%
uv run pytest -v --cov=ticket_parser --cov-report=term-missing --cov-fail-under=90

# รันด่านตรวจคุณภาพโค้ดทั้งโปรเจกต์
uv run ruff check .
uv run ruff format --check .`,
      caption: "ลองเติม `--cov-branch` เพิ่มเพื่อดู branch coverage ของเงื่อนไข `if / else` ทุกจุดด้วย",
    },
  },

  mistakes: [
    {
      title: "รัน `--cov=.` กว้างทั้งโฟลเดอร์จนรวมไฟล์เทสต์และ `.venv` เข้าไปด้วย",
      symptom: "เปอร์เซ็นต์ coverage เพี้ยนหรือช้ามากเพราะวัดรวมไฟล์ที่ไม่ใช่ซอร์สโค้ดเป้าหมาย",
      fix: "ระบุชื่อโมดูลหรือแพ็กเกจเป้าหมายให้ชัด เช่น `--cov=ticket_parser` (หรือ `--cov=src` เมื่อใช้ `src/` layout)",
    },
    {
      title: "ไล่ปั๊มตัวเลข coverage โดยไม่เขียน `assert` ที่ตรวจพฤติกรรมจริง",
      symptom: "Coverage แตะ 100% แต่พอแก้โค้ดให้คืนค่าผิด เทสต์ทั้งหมดก็ยังผ่าน",
      fix: "ทุกบรรทัดที่รันผ่านต้องจับคู่กับ `assert` ค่าผลลัพธ์, `pytest.raises(..., match=...)` หรือการตรวจสถานะของ fake callback เสมอ",
    },
    {
      title: "ลืมทดสอบกรณี JSON ที่ parse ได้แต่ไม่ใช่ `dict` (เช่น `[1, 2]` หรือ `\"hello\"`)",
      symptom: "บรรทัด `if not isinstance(payload, dict):` ค้างอยู่ในคอลัมน์ `Missing` และใน production อาจทำให้ `.get(...)` โยน `AttributeError`",
      fix: "ใส่แถวที่ไม่ใช่ JSON object ลงในไฟล์ทดสอบ `tmp_path` ด้วยเสมอ",
    },
    {
      title: "ตรวจ Ruff เฉพาะโค้ดหลักแต่ปล่อยไฟล์ `test_*.py` รก",
      symptom: "รัน `uv run ruff check .` ใน CI แล้วพังจาก unused import หรือการจัดเรียง import ในไฟล์ทดสอบ",
      fix: "รัน `uv run ruff check . && uv run ruff format --check .` ครอบทั้งโปรเจกต์ก่อนจบงานทุกครั้ง",
    },
  ],

  quiz: {
    intro: "Interleaved Recall Quiz (4 ข้อ ผสม D4–D6 และ D9–D11) — ทดสอบความจำก่อนลงมือทำแล็บ 90% coverage",
    questions: [
      mc(
        "d012-q1",
        "[ทบทวน D5 + D9] คุณต้องทดสอบฟังก์ชัน `parse_jsonl_file(source: Path)` ที่อ่านไฟล์ภาษาไทยจากดิสก์ วิธีสร้างไฟล์ทดสอบข้อใดปลอดภัยและทำงานได้ทุก OS?",
        [
          ["เขียนลง `C:\\tmp\\tickets.jsonl` โดยไม่ระบุ `encoding`", "ผูกกับ Windows และไม่ระบุ `encoding='utf-8'` ทำให้ข้อความภาษาไทยเพี้ยนได้"],
          ["ใช้ fixture `tmp_path: Path` แล้วเรียก `(tmp_path / 'tickets.jsonl').write_text(..., encoding='utf-8')`", "ถูก — แยกโฟลเดอร์ชั่วคราวต่อเทสต์ ใช้ได้ทุก OS และรับประกัน UTF-8 สำหรับภาษาไทย"],
          ["เก็บไฟล์ไว้ใน `.venv/tickets.jsonl`", "ห้ามเก็บข้อมูลทดสอบไว้ใน `.venv/` เพราะจะถูกลบเมื่อสร้าง environment ใหม่"],
          ["ใช้ `monkeypatch` ปิดการอ่านไฟล์ทั้งหมดแล้วไม่ต้องทดสอบ `Path`", "หากไม่ทดสอบการอ่านไฟล์จริงจะพลาดบั๊ก encoding และ `FileNotFoundError`"],
        ],
        "B",
        "การจับคู่ `tmp_path` + `pathlib.Path` + `encoding='utf-8'` คือมาตรฐานทองคำสำหรับการทดสอบ File I/O ภาษาไทย",
        "ควรสร้างไฟล์ JSONL ภาษาไทยสำหรับทดสอบใน `pytest` อย่างไร?",
        "ใช้ fixture `tmp_path: Path` และเขียนไฟล์ด้วย `.write_text(..., encoding='utf-8')`",
      ),
      mc(
        "d012-q2",
        "[ทบทวน D4 + D10] ต้องการทดสอบว่า `SupportTicket` ปฏิเสธเคสผิดกฎ 4 แบบ (`ticket_id` ผิด, `channel` ผิด, `message_th` ว่างล้วน, `customer.customer_id` ผิด) วิธีเขียนเทสต์ใดสะอาดและวินิจฉัยผลง่ายที่สุด?",
        [
          ["เขียน 1 ฟังก์ชันแล้วใส่ `for` loop ตรวจ 4 เคสรวดเดียว", "เมื่อเคสแรกพัง ลูปจะหยุดทันทีและไม่เห็นผลของอีก 3 เคสที่เหลือ"],
          ["ใช้ `@pytest.mark.parametrize` คู่กับ `pytest.param(..., id=...)` โดยสร้าง dict สดจาก `@pytest.fixture`", "ถูก — รันครบทุกเคสแยกอิสระ แสดงชื่อเคสชัดเจน และไม่เกิด state leakage"],
          ["สร้าง global dict 1 ตัวแล้วแก้ค่าไปเรื่อย ๆ ใน 4 ฟังก์ชันเทสต์", "เสี่ยงเกิด order-dependent flaky test เมื่อแก้ค่า dict ร่วมกัน"],
          ["ทดสอบแค่เคสเดียวก็พอ เพราะ Pydantic ตรวจให้อยู่แล้ว", "custom `@field_validator` และ `ConfigDict` เป็นโค้ดที่เราเขียนเอง ต้องทดสอบทุกเงื่อนไข"],
        ],
        "B",
        "การผสาน `@pytest.fixture` + `@pytest.mark.parametrize` + `pytest.param(..., id=...)` ทำให้ชุดทดสอบ schema ขยายเคสใหม่ได้ง่ายและอ่านผลได้ทันที",
        "ทำไมควรผสม `@pytest.fixture` กับ `@pytest.mark.parametrize` เวลาทดสอบ schema หลายเคส?",
        "fixture ช่วยเตรียมฐานข้อมูลตั้งต้นที่สดใหม่แยกต่อเคส ส่วน `parametrize` แตกแต่ละเคสผิดกฎให้รันและรายงานผลอิสระ",
      ),
      mc(
        "d012-q3",
        "[ทบทวน D11] ทีมเปิด `[tool.ruff.lint] select = ['E', 'F', 'I', 'B', 'UP']` แล้วพบโค้ด `def parse(items, errors=[]):` Ruff จะแจ้งเตือนกฎใดและเพราะเหตุใด?",
        [
          ["`F401` เพราะยังไม่ได้ import `list`", "`list` เป็น built-in ไม่ต้อง import"],
          ["`B006` เพราะใช้ mutable default argument (`[]`) ซึ่งจะแชร์ลิสต์เดิมข้ามการเรียกฟังก์ชัน", "ถูก — ตระกูล Bugbear (`B006`) ดักจับบั๊กข้อมูลรั่วไหลข้ามการเรียกฟังก์ชันได้ตั้งแต่ยังไม่รัน"],
          ["`I001` เพราะเรียงลำดับพารามิเตอร์ไม่ตามตัวอักษร", "`I001` ตรวจการเรียงบรรทัด `import` ไม่ใช่พารามิเตอร์ฟังก์ชัน"],
          ["ไม่แจ้งเตือน เพราะเป็นไวยากรณ์ที่ถูกต้องและปลอดภัย", "แม้เป็นไวยากรณ์ที่รันได้ แต่เป็นบั๊กคลาสสิกที่อันตรายมากใน Python"],
        ],
        "B",
        "กฎ `B006` ช่วยป้องกันบั๊กลิสต์/ดิกต์ default รั่วไหลข้าม request โดยให้เปลี่ยนเป็น `errors: list[str] | None = None` แทน",
        "Ruff กฎ `B006` เตือนเรื่องอะไร และควรแก้อย่างไร?",
        "เตือนการใช้ mutable default argument (เช่น `=[]` หรือ `={}`) → แก้เป็นค่า default `None` แล้วสร้างออบเจกต์ใหม่ในฟังก์ชัน",
      ),
      mc(
        "d012-q4",
        "[ทบทวน D6 + D12] หลังรัน `uv run pytest --cov=ticket_parser --cov-report=term-missing` ผลแสดง `Cover 78%` และคอลัมน์ `Missing` ชี้บรรทัดของ `except json.JSONDecodeError:` และ `TicketSourceNotFoundError` สิ่งที่ควรทำที่สุดคือข้อใด?",
        [
          ["เติม `# pragma: no cover` ทับทุกบล็อก `except` เพื่อให้ตัวเลขเด้งเป็น 100%", "การซ่อน error branches จาก coverage เท่ากับปิดตาเดินข้ามจุดที่พังบ่อยที่สุดใน production"],
          ["เขียนเทสต์เพิ่มด้วย `tmp_path` ที่มีบรรทัด JSON พัง และเทสต์ `pytest.raises(TicketSourceNotFoundError)` พร้อม `assert` ผลลัพธ์จริง", "ถูก — ใช้รายงาน `Missing` เป็นเข็มทิศเพื่อปิดจุดบอดของระบบอย่างแท้จริง"],
          ["ลบโค้ดจัดการ `JSONDecodeError` ออกเพื่อลดจำนวนบรรทัด", "จะทำให้ทั้ง batch พังทันทีเมื่อเจอข้อมูลเสียเพียงบรรทัดเดียว"],
          ["ลด `--cov-fail-under` ลงเหลือ `50`", "ไม่ช่วยลดความเสี่ยงของโค้ด — error branches ของ parser ควรถูกทดสอบเสมอ"],
        ],
        "B",
        "รายงาน `term-missing` มีไว้ชี้จุดบอดจริงของชุดทดสอบ การเขียนเทสต์ครอบคลุม error branches ทำให้ parser แข็งแรงพร้อมใช้งานจริง",
        "เมื่อคอลัมน์ `Missing` ของ `pytest-cov` ชี้ไปที่บล็อก `except` ควรจัดการอย่างไร?",
        "เขียน unit test ที่จำลองอินพุตผิดรูป/ไฟล์หายเพื่อให้โค้ดวิ่งเข้าสาขา `except` จริง พร้อมตรวจผลลัพธ์หรือ `pytest.raises`",
      ),
    ],
  },

  takeaways: [
    "จบบล็อก B03 คุณมีด่านคุณภาพครบ 3 ชั้นแล้ว: **pytest + fixtures/parametrize/mocking** (ความถูกต้อง), **pytest-cov >= 90%** (ความครอบคลุม) และ **Ruff + pre-commit** (ความสะอาดและดัก bug patterns)",
    "ใช้ `pytest --cov=<module> --cov-report=term-missing --cov-fail-under=90` เพื่อหาสาขา `if / except` ที่ยังไม่ถูกทดสอบอย่างตรงจุด",
    "ตัวเลข coverage สูงจะมีความหมายก็ต่อเมื่อทุกเทสต์มี `assert` หรือ `pytest.raises` ที่ตรวจพฤติกรรมจริง ไม่ใช่แค่รันผ่านบรรทัดเฉย ๆ",
    "พร้อมก้าวสู่ Block B04 (Day 13): เรียก HTTP API ด้วย `httpx`, ตั้ง timeout และทดสอบด้วยทักษะ mocking ที่ปูไว้ครบในบล็อกนี้",
  ],

  reviewCards: [
    rc(
      "d012-rc-1",
      "คำสั่งใดใช้รัน `pytest` พร้อมวัด coverage ของ `ticket_parser`, แสดงเลขบรรทัดที่ขาด และบังคับเกณฑ์ขั้นต่ำ 90%?",
      "`uv run pytest --cov=ticket_parser --cov-report=term-missing --cov-fail-under=90`",
    ),
    rc(
      "d012-rc-2",
      "4 หมวดเคสทดสอบที่ควรมีให้ครบสำหรับ File/JSONL Ticket Parser มีอะไรบ้าง?",
      "1) Happy path + normalization, 2) Schema edge cases (`parametrize`), 3) File/JSONL failures (ไฟล์หาย, บรรทัดว่าง, JSON พัง, non-dict), 4) External callback/hook (Fake/mock)",
    ),
    rc(
      "d012-rc-3",
      "เหตุใด coverage 100% จึงยังอาจปล่อยบั๊กหลุดไปได้หากเขียนเทสต์ไม่ดี?",
      "เพราะ coverage วัดเพียงว่าบรรทัดโค้ดถูกรันผ่านหรือไม่ แต่ไม่ได้วัดความแข็งแรงของ `assert` หรือความครบถ้วนของเคสขอบ (edge cases)",
    ),
  ],

  sources: [
    { label: "pytest-cov Documentation — Usage & Reporting", href: "https://pytest-cov.readthedocs.io/en/latest/reporting.html" },
    { label: "pytest Official Docs — Full Documentation", href: "https://docs.pytest.org/en/stable/" },
    { label: "Ruff Official Docs — Linter & Formatter", href: "https://docs.astral.sh/ruff/" },
    { label: "Pydantic v2 Docs — Error Handling (`ValidationError`)", href: "https://docs.pydantic.dev/latest/errors/errors/" },
  ],

  glossary: [
    "pytest",
    "fixture",
    "parametrize",
    "mocking",
    "ruff",
    "pydantic",
    "jsonl",
    "pathlib",
  ],
});
