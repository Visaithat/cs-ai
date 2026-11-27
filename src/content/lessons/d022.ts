import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D022 — Phase 1 / Block B06
 * Packaging & Project Structure (src/ layout, pyproject.toml).
 */
export const d022: Lesson = defineLesson({
  day: 22,
  titleTh: "จัดโครงสร้างแพ็กเกจ Python แบบ src/ Layout และ pyproject.toml",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · จัดระเบียบโปรเจกต์ AI ด้วย src/ layout, editable install ผ่าน uv sync และ [project.scripts] ให้ import นิ่งทุกเครื่อง",
  icon: "package",
  visual: {
    id: "git-package-cli",
    title: "โครงสร้างโปรเจกต์แบบ src/ Layout และ pyproject.toml",
    caption: "ดูเหตุผลที่ src/ layout ป้องกัน import เพี้ยนตอนรัน pytest และเปิดทางให้ติดตั้งเป็นแพ็กเกจได้",
    alt: "แผนภาพโครงสร้างโฟลเดอร์ src/ layout และ pyproject.toml",
  },
  requiresApiKey: false,
  tools: ["uv", "pyproject.toml", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "ยกระดับจากสคริปต์เดี่ยวสู่ Python Package ที่ขยายได้ถึง Production",
      body: "สคริปต์ 1 ไฟล์ (`main.py`) ใช้งานได้ดีตอนทดลอง 1 วัน แต่พอเริ่มมีทั้ง schema, HTTP client, cache และชุดเทสต์ ไฟล์เดี่ยวจะพองโตและ import พันกันจนแก้ยาก",
      lessonNote: "วันนี้เราเปลี่ยนโปรเจกต์ให้เป็นแพ็กเกจมาตรฐานด้วย `src/` layout และ `{{pyproject}}` ที่รองรับการเติบโตยาวถึง Phase 6",
    },
    {
      node: 1,
      heading: "แยกโมดูลตามหน้าที่: Schema, Core Logic, I/O และ Entry Point",
      body: "งาน AI ที่ดูแลรักษาง่ายจะแยก {{pydantic}} {{schema}} (`models.py`), logic ประมวลผล (`service.py`), และการเชื่อมต่อภายนอก (`client.py`) ออกจากกันชัดเจน",
      lessonNote: "โครงสร้างโมดูลที่สะอาดทำให้หยิบ `models.py` ไปใช้ซ้ำได้ทั้งใน CLI, FastAPI และ Eval Harness",
    },
    {
      node: 3,
      heading: "ป้องกันภาพลวงตา 'เทสต์ผ่านในเครื่องฉัน แต่พังตอนติดตั้งจริง'",
      body: "ในโครงสร้างแบบวางโฟลเดอร์โค้ดไว้รากโปรเจกต์ (flat layout) {{pytest}} มักเผลอ import โฟลเดอร์ดิบใน working directory แทนแพ็กเกจที่ติดตั้งใน `{{venv}}` ทำให้มองไม่เห็นบั๊กเรื่อง packaging",
      lessonNote: "`src/` layout บังคับให้เทสต์ import ผ่านแพ็กเกจที่ติดตั้งด้วย `uv sync` เสมอ ลดความเสี่ยงตอน build Docker และ deploy",
    },
    {
      node: 4,
      heading: "เปิดทางสู่คำสั่ง CLI ที่ติดตั้งและเรียกใช้ได้จากทุกที่",
      body: "การประกาศ `[project.scripts]` ใน `{{pyproject}}` แปลงฟังก์ชัน Python ธรรมดาให้เป็นคำสั่งใน terminal (เช่น `ticket-kit`) โดยไม่ต้องจำพาธ `python src/...`",
      lessonNote: "นี่คือฐานโดยตรงสำหรับสร้าง CLI ด้วย {{typer}} ใน Day 23 และแพ็กเกจ Ticket Processor ใน Day 24",
    },
  ],

  objectives: [
    "**อธิบาย** เหตุผลที่ `src/<package>/` layout ปลอดภัยกว่า flat layout ในแง่กลไก `sys.path` และการรัน {{pytest}}",
    "**กำหนดค่า** `{{pyproject}}` ให้ครบทั้ง `[project]`, `dependencies`, `[build-system]` และ `[project.scripts]` พร้อมติดตั้งแบบ editable install ด้วย `uv sync`",
    "**จัดระเบียบ** โค้ดโปรเจกต์ AI ออกเป็นโมดูลที่ชัดเจน (`models.py`, `service.py`, `cli.py`, `tests/`) และยืนยันการติดตั้งด้วยชุดเทสต์ที่ตรวจทั้ง import path และ metadata ของ `pyproject.toml`",
  ],

  prerequisites: [
    "ผ่าน Day 1 (`uv`, `pyproject.toml`, `uv.lock`) และ Day 9 (`pytest` พื้นฐาน)",
    "มี `uv` และ Python 3.11+ (ใช้โมดูลมาตรฐาน `tomllib` อ่านไฟล์ TOML ได้ในตัว)",
    "ไม่ต้องใช้ API key — ทดลองสร้างและติดตั้งแพ็กเกจบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "ลองใช้แฟล็ก `--package` ของ {{uv}} ซึ่งสร้างโครงสร้าง `src/` layout พร้อม `[build-system]` และ `[project.scripts]` ให้โดยอัตโนมัติในคำสั่งเดียว",
    commands: `# uv init --package สร้าง src/<pkg>/ และ [build-system] ให้ครบ
uv init --package ticket-kit && cd ticket-kit
uv add pydantic
uv add --dev pytest ruff

# ติดตั้งแพ็กเกจแบบ editable เข้า .venv และสร้าง uv.lock
uv sync
uv run ticket-kit`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ticket-kit` ด้วย `uv init --package ticket-kit`"],
      ["deps", "เพิ่ม `pydantic` และ dev tools (`pytest`, `ruff`) แล้วรัน `uv sync`"],
      ["verify", "ลองรัน `uv run ticket-kit` เพื่อเห็น entry point ทำงานจริงจาก `[project.scripts]`"],
    ],
    note: "สังเกตความต่างของชื่อ: ชื่อโปรเจกต์/แพ็กเกจบน PyPI นิยมใช้ขีดกลาง (`ticket-kit`) แต่ชื่อโฟลเดอร์โมดูลใน `src/` ต้องใช้ขีดล่าง (`src/ticket_kit/`) เพราะ Python import ชื่อที่มี `-` ไม่ได้",
  },

  concepts: [
    {
      id: "why-src-layout-beats-flat",
      title: "1 · ทำไม `src/` Layout ถึงชนะ Flat Layout ในโปรเจกต์จริง",
      paragraphs: [
        "Python จะใส่โฟลเดอร์ปัจจุบัน (working directory) ไว้ที่ตำแหน่งแรกของ `sys.path` เสมอ หากคุณวางโฟลเดอร์โค้ดไว้ที่รากโปรเจกต์โดยตรง (`my_repo/ticket_kit/`) เวลาคุณรัน `pytest` หรือ `python` ที่รากโปรเจกต์ Python จะ **import โฟลเดอร์ดิบใน working directory** แทนแพ็กเกจที่ติดตั้งอยู่ใน `{{venv|.venv/}}`",
        "ผลเสียคือเทสต์บนเครื่องคุณจะผ่านหมด แต่พอ build ไปรันใน Docker หรือ CI อาจพังทันทีเพราะคุณลืมประกาศ `{{dependency}}`, ลืมรวมไฟล์ข้อมูลไว้ในแพ็กเกจ หรือลืม `__init__.py` — ในทางกลับกัน **`src/` layout** (`my_repo/src/ticket_kit/`) ซ่อนโฟลเดอร์โค้ดไว้ใต้ `src/` ทำให้ import ตรง ๆ จากรากไม่ได้ บังคับให้ต้องติดตั้งผ่าน `uv sync` (editable install) ก่อนเสมอ เทสต์จึงสะท้อนความจริง 100%",
      ],
      analogy:
        "Flat layout เหมือนเชฟที่ชิมซุปจากหม้อหลังครัวโดยไม่ได้ตรวจว่าพนักงานจัดใส่กล่องเดลิเวอรีครบช้อนครบซอสหรือไม่ ส่วน `src/` layout คือการบังคับให้ชิมจากกล่องเดลิเวอรีที่แพ็กพร้อมส่งลูกค้าจริงเท่านั้น",
      code: {
        language: "text",
        filename: "project_tree.txt",
        code: `ticket-kit/
├── .gitignore
├── .env.example
├── pyproject.toml          # ศูนย์กลาง metadata, dependencies, build-system, scripts
├── uv.lock                 # ล็อกเวอร์ชันทุก dependency เพื่อ reproducibility
├── src/
│   └── ticket_kit/         # โฟลเดอร์แพ็กเกจจริง (ใช้ underscore)
│       ├── __init__.py     # ประกาศ public API ที่อยากให้ภายนอก import
│       ├── models.py       # Pydantic BaseModel & data contracts
│       ├── service.py      # Core business / AI pipeline logic
│       └── cli.py          # Entry point บาง ๆ สำหรับ [project.scripts]
└── tests/                  # แยกอยู่นอก src/ เพื่อไม่ให้ติดไปใน wheel ตอน build
    └── test_ticket_kit.py`,
        caption: "โครงสร้างมาตรฐานของ PyPA (Python Packaging Authority) และ `uv init --package` — โค้ดอยู่ใน `src/` และเทสต์อยู่ใน `tests/` แยกกันชัดเจน",
      },
      whyTitle: "Why this matters — แก้ปัญหา `ModuleNotFoundError` แบบถาวร",
      whyParagraphs: [
        "มือใหม่ Python มักแก้ปัญหา `ModuleNotFoundError` ด้วยการยัด `sys.path.append('..')` ลงในไฟล์เทสต์ ซึ่งทำให้โค้ดเปราะบางและพังเมื่อย้ายโฟลเดอร์หรือรันจากเครื่องอื่น",
        "เมื่อใช้ `src/` layout คู่กับ `uv sync` แพ็กเกจของคุณจะถูกติดตั้งแบบ editable ใน `.venv` ทำให้รัน `uv run pytest` หรือ `uv run python` จากโฟลเดอร์ไหนก็ได้โดยไม่ต้องแฮ็ก `sys.path` เลย",
      ],
    },
    {
      id: "pyproject-toml-build-and-scripts",
      title: "2 · เจาะลึก `pyproject.toml`: `[build-system]` และ `[project.scripts]`",
      paragraphs: [
        "ไฟล์ `{{pyproject}}` ในยุค Python 3.12 คือแหล่งความจริงเดียว (Single Source of Truth) ของโปรเจกต์ แทนที่ไฟล์เก่าหลายไฟล์อย่าง `setup.py`, `setup.cfg` และ `requirements.txt` ส่วนสำคัญที่ทำให้โปรเจกต์ติดตั้งเป็นแพ็กเกจได้จริงคือบล็อก **`[build-system]`** (เช่น `uv_build` หรือ `hatchling`) ที่บอกเครื่องมือ build ว่าจะแพ็กโค้ดใน `src/` อย่างไร",
        "และส่วนที่ทำให้โค้ดของคุณเรียกใช้เป็นคำสั่ง CLI ได้ทันทีคือ **`[project.scripts]`** เช่น `ticket-kit = \"ticket_kit.cli:main\"` ซึ่งหมายถึงเมื่อรันคำสั่ง `ticket-kit` ระบบจะไป import โมดูล `ticket_kit.cli` แล้วเรียกฟังก์ชัน `main()` ให้อัตโนมัติ",
      ],
      analogy:
        "`pyproject.toml` เหมือนใบทะเบียนและคู่มือติดตั้งเครื่องใช้ไฟฟ้า: `[project]` บอกชื่อรุ่นและอะไหล่ที่ต้องใช้ (`dependencies`), `[build-system]` บอกโรงงานวิธีประกอบกล่อง, และ `[project.scripts]` คือปุ่มเปิดเครื่องที่หน้าตัวถัง",
      code: {
        language: "text",
        filename: "pyproject.toml",
        code: `[project]
name = "ticket-kit"
version = "0.1.0"
description = "Typed Thai support ticket processing package"
requires-python = ">=3.11"
dependencies = [
    "pydantic>=2.10",
]

[project.scripts]
ticket-kit = "ticket_kit.cli:main"

[dependency-groups]
dev = [
    "pytest>=8.0",
    "ruff>=0.8",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/ticket_kit"]

[tool.ruff]
line-length = 100`,
        caption: "แยก runtime `dependencies` ออกจาก `[dependency-groups]` (`dev`) เพื่อให้ Docker image ใน production ไม่ต้องแบก `pytest` และ `ruff` ไปด้วย",
      },
      whyTitle: "Why this matters — Editable Install ทำงานอย่างไรกับ `uv sync`",
      whyParagraphs: [
        "เมื่อ `pyproject.toml` มี `[build-system]` การรัน `uv sync` จะติดตั้งแพ็กเกจ `ticket-kit` แบบ **editable** เข้า `.venv/lib/.../site-packages/` หมายความว่าคุณแก้ไฟล์ใน `src/ticket_kit/` แล้วผลเปลี่ยนทันทีโดยไม่ต้องสั่ง reinstall ทุกรอบ",
        "แต่มีข้อยกเว้น 1 กรณีที่ต้องจำ: เมื่อคุณ **เพิ่มหรือเปลี่ยนชื่อคำสั่งใน `[project.scripts]`** หรือเปลี่ยน `dependencies` ต้องรัน `uv sync` อีกรอบเพื่อสร้างตัวรันคำสั่งและอัปเดต `{{lockfile|uv.lock}}` สำหรับ {{reproducibility}} ของทั้งทีม",
      ],
    },
    {
      id: "clean-module-boundaries",
      title: "3 · แบ่งขอบเขตโมดูลให้ชัด: `models.py`, `service.py`, `cli.py` และ `__init__.py`",
      paragraphs: [
        "การจัดโครงสร้างที่ดีไม่ใช่แค่การย้ายไฟล์เข้าไปใน `src/` แต่คือการแยก **ขอบเขตความรับผิดชอบ (Separation of Concerns)**: ให้ `models.py` ถือเฉพาะ {{pydantic}} schema, `service.py` ถือ logic การคำนวณ/ประมวลผลที่รับ-คืนชนิดข้อมูลชัดเจน (ไม่ผูกกับ `print` หรือ `sys.argv`), และ `cli.py` ทำหน้าที่แค่รับอินพุตจากผู้ใช้แล้วส่งต่อให้ `service.py`",
        "ส่วน `__init__.py` ทำหน้าที่เหมือน \"หน้าร้าน\" ของแพ็กเกจ — export เฉพาะคลาสและฟังก์ชันหลักผ่าน `__all__` เพื่อให้ภายนอก import สั้น ๆ เช่น `from ticket_kit import TicketItem, summarize_tickets` ได้อย่างสะอาด",
      ],
      analogy:
        "เหมือนร้านกาแฟที่แยกพื้นที่ชัดเจน: ห้องเก็บวัตถุดิบและสูตร (`models.py`), บาร์ชงกาแฟ (`service.py`), และเคาน์เตอร์รับออเดอร์ (`cli.py`) — ต่อให้วันหน้าเปิดช่องทางสั่งผ่านแอปเดลิเวอรี (`FastAPI`) บาร์ชงกาแฟก็ยังใช้สูตรเดิมได้ทันที",
      code: {
        language: "python",
        filename: "src/ticket_kit/__init__.py",
        code: `"""Public API for ticket_kit package."""

from ticket_kit.models import TicketItem, TicketSummary
from ticket_kit.service import summarize_tickets

__all__ = ["TicketItem", "TicketSummary", "summarize_tickets"]`,
        caption: "การประกาศ `__all__` ใน `__init__.py` ช่วยให้ทั้งคนอ่าน, IDE autocomplete และ Ruff รู้ว่าฟังก์ชันไหนคือ Public API อย่างเป็นทางการ",
      },
      whyTitle: "Why this matters — พร้อมต่อยอดเป็นทั้ง CLI และ FastAPI Service",
      whyParagraphs: [
        "ใน Phase 1 คุณจะหุ้ม `service.py` ด้วย `Typer` CLI แต่ใน Phase 5 คุณจะหุ้ม logic เดียวกันด้วย `FastAPI` HTTP endpoint และเรียกทดสอบจาก Eval Harness",
        "หาก `service.py` สะอาดและไม่ผูกติดกับ terminal หรือ HTTP โค้ดทั้งก้อนจะย้ายไปใช้ในทุกบริบทได้โดยแทบไม่ต้องรื้อใหม่เลย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ `src/` + `pyproject.toml` กับโปรเจกต์ TypeScript/Node",
      body: [
        "แนวคิดของ Python packaging ยุคใหม่ใกล้เคียงกับโลก Node/TypeScript มากจนแทบเทียบกันได้บรรทัดต่อบรรทัด:",
      ],
      table: [
        ["`pyproject.toml`", "`package.json` + `tsconfig.json`"],
        ["`dependencies` vs `[dependency-groups].dev`", "`dependencies` vs `devDependencies`"],
        ["`[project.scripts]` (`ticket-kit = 'ticket_kit.cli:main'`)", "`\"bin\": { \"ticket-kit\": \"./dist/cli.js\" }`"],
        ["`src/ticket_kit/__init__.py` (`__all__`)", "`src/index.ts` (barrel export)"],
        ["`uv sync` (editable install เข้า `.venv`)", "`pnpm install` + `workspace:*` linking"],
      ],
    },
    student: {
      title: "First-Year Note — ไฟล์ `__init__.py` มีไว้ทำไม และทำไมห้ามตั้งชื่อไฟล์ซ้ำไลบรารี?",
      body: [
        "ไฟล์ `__init__.py` บอก Python ว่าโฟลเดอร์นี้คือ **regular package** ที่ import ข้ามโมดูลข้างในได้ เช่น `from ticket_kit.models import TicketItem` (ถึงแม้จะเป็นไฟล์ว่างก็ยังควรใส่ไว้เสมอ)",
        "อีกจุดที่มือใหม่พลาดบ่อย: อย่าตั้งชื่อไฟล์หรือแพ็กเกจของคุณให้ซ้ำกับไลบรารีมาตรฐานหรือแพ็กเกจที่ติดตั้ง เช่น `json.py`, `pydantic.py`, หรือ `typing.py` เพราะ Python จะ import ไฟล์ของคุณเองแทนไลบรารีจริงจนเกิด `AttributeError` ชวนงง",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองเดินตามขั้นตอนการสร้างแพ็กเกจ `ticket-kit` แบบ `src/` layout ตั้งแต่ตั้งโปรเจกต์ แยกโมดูล ติดตั้งแบบ editable จนถึงพิสูจน์ว่า `import ticket_kit` โหลดจากแพ็กเกจที่ติดตั้งจริง",
    steps: [
      {
        title: "1 · สร้างโมดูล `models.py` และ `service.py` ใต้ `src/ticket_kit/`",
        explain:
          "แยกโมเดลข้อมูลกับฟังก์ชันสรุปผลออกจากกันอย่างชัดเจน โดยไม่มีคำสั่ง `print()` ปนอยู่ใน core logic",
        code: {
          language: "python",
          filename: "src/ticket_kit/models.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field


class TicketItem(BaseModel):
    ticket_id: str = Field(min_length=3)
    channel: Literal["line", "email", "web"]
    urgent: bool = False


class TicketSummary(BaseModel):
    total: int
    urgent_count: int
    by_channel: dict[str, int]`,
        },
        output: `# บันทึกไฟล์ src/ticket_kit/models.py เรียบร้อย`,
      },
      {
        title: "2 · เขียน `service.py` และ `cli.py` ให้เชื่อมกับ `[project.scripts]`",
        explain:
          "`service.py` รับ `list[TicketItem]` และคืน `TicketSummary` ส่วน `cli.py` เป็นตัวครอบบาง ๆ ที่ประกาศ `main()` เพื่อผูกกับ `ticket-kit = \"ticket_kit.cli:main\"`",
        code: {
          language: "python",
          filename: "src/ticket_kit/service.py",
          code: `from collections import Counter
from ticket_kit.models import TicketItem, TicketSummary


def summarize_tickets(items: list[TicketItem]) -> TicketSummary:
    counts = dict(Counter(item.channel for item in items))
    urgent_count = sum(1 for item in items if item.urgent)
    return TicketSummary(
        total=len(items),
        urgent_count=urgent_count,
        by_channel=counts,
    )`,
        },
        output: `# พร้อมผูกเข้ากับ src/ticket_kit/cli.py และ __init__.py`,
      },
      {
        title: "3 · รัน `uv sync` แล้วตรวจแหล่งที่มาของโมดูลและคำสั่ง Entry Point",
        explain:
          "ตรวจสอบ `ticket_kit.__file__` และรันคำสั่ง `uv run ticket-kit` เพื่อยืนยันว่าแพ็กเกจถูกติดตั้งแบบ editable ใน `.venv` และเรียกใช้ได้จากทุกโฟลเดอร์",
        code: {
          language: "bash",
          filename: "verify_install.sh",
          code: `uv sync

# ตรวจว่า Python import เจอจาก src/ticket_kit ผ่าน editable install
uv run python -c "import ticket_kit; print(ticket_kit.__file__)"

# เรียกคำสั่งที่ลงทะเบียนไว้ใน [project.scripts]
uv run ticket-kit`,
        },
        output: `/workspace/ticket-kit/src/ticket_kit/__init__.py
ticket-kit v0.1.0 ready (total=2, urgent=1)`,
      },
    ],
    gotcha:
      "ถ้าคุณสร้างโฟลเดอร์ `src/ticket_kit/` ขึ้นมาเองโดยไม่ได้ประกาศ `[build-system]` ใน `pyproject.toml` คำสั่ง `uv sync` จะมองโปรเจกต์เป็นแค่ virtual project ที่ไม่ติดตั้งตัวเองเข้า `.venv` — ผลคือ `uv run pytest` จะฟ้อง `ModuleNotFoundError: No module named 'ticket_kit'` ทันที!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างแพ็กเกจ `ticket-kit` ตามมาตรฐาน `src/` layout (`pyproject.toml`, `src/ticket_kit/{__init__,models,service,cli}.py`) พร้อมทดสอบด้วย `pytest` ว่าโครงสร้าง `pyproject.toml`, import path, core logic และ entry point ทำงานถูกต้องครบทุกจุด",
    requirements: [
      "จัดโครงสร้างโฟลเดอร์ให้มี `pyproject.toml` (มี `[build-system]` และ `[project.scripts]` ที่ผูก `ticket-kit = \"ticket_kit.cli:main\"`) และซอร์สโค้ดทั้งหมดอยู่ใต้ `src/ticket_kit/`",
      "สร้าง `src/ticket_kit/models.py` ที่มี `TicketItem(BaseModel)` (`ticket_id: str`, `channel: Literal[\"line\", \"email\", \"web\"]`, `urgent: bool = False`) และ `TicketSummary(BaseModel)` (`total: int`, `urgent_count: int`, `by_channel: dict[str, int]`)",
      "สร้าง `src/ticket_kit/service.py` ที่มีฟังก์ชัน `summarize_tickets(items: list[TicketItem]) -> TicketSummary` และฟังก์ชัน `filter_urgent(items: list[TicketItem]) -> list[TicketItem]`",
      "สร้าง `src/ticket_kit/cli.py` ที่มี `format_summary_line(summary: TicketSummary) -> str` (คืนข้อความรูปแบบ `\"total=<n> urgent=<u_count>\"`) และ `main() -> int` ที่คืน exit code `0`",
      "Export `TicketItem`, `TicketSummary`, `summarize_tickets`, `filter_urgent` ใน `src/ticket_kit/__init__.py` ผ่าน `__all__` แล้วรัน `uv sync && uv run pytest -q` ให้ผ่านทุกข้อ",
    ],
    starter: {
      language: "python",
      filename: "src/ticket_kit/service.py",
      code: `"""Core business logic for ticket_kit (วางไฟล์นี้ใน src/ticket_kit/service.py)."""

from collections import Counter
from ticket_kit.models import TicketItem, TicketSummary


def summarize_tickets(items: list[TicketItem]) -> TicketSummary:
    # TODO: นับจำนวนทั้งหมด, จำนวน urgent และจำนวนแยกตาม channel
    raise NotImplementedError


def filter_urgent(items: list[TicketItem]) -> list[TicketItem]:
    # TODO: คืนเฉพาะรายการที่ item.urgent เป็น True โดยคงลำดับเดิม
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_ticket_kit.py",
      code: `from pathlib import Path
import tomllib

import ticket_kit
from ticket_kit import TicketItem, TicketSummary, filter_urgent, summarize_tickets
from ticket_kit.cli import format_summary_line, main


def test_package_installed_from_src_layout():
    pkg_file = Path(ticket_kit.__file__).resolve()
    assert "src" in pkg_file.parts
    assert pkg_file.parent.name == "ticket_kit"
    assert set(ticket_kit.__all__) >= {
        "TicketItem",
        "TicketSummary",
        "summarize_tickets",
        "filter_urgent",
    }


def test_pyproject_has_build_system_and_script_entry():
    project_root = Path(ticket_kit.__file__).resolve().parents[2]
    pyproject = tomllib.loads((project_root / "pyproject.toml").read_text(encoding="utf-8"))

    assert "build-system" in pyproject
    scripts = pyproject.get("project", {}).get("scripts", {})
    assert scripts.get("ticket-kit") == "ticket_kit.cli:main"


def test_summarize_and_filter_urgent():
    items = [
        TicketItem(ticket_id="TKT-1", channel="line", urgent=True),
        TicketItem(ticket_id="TKT-2", channel="web", urgent=False),
        TicketItem(ticket_id="TKT-3", channel="line", urgent=True),
    ]
    summary = summarize_tickets(items)
    assert isinstance(summary, TicketSummary)
    assert summary.total == 3
    assert summary.urgent_count == 2
    assert summary.by_channel == {"line": 2, "web": 1}

    urgent_ids = [t.ticket_id for t in filter_urgent(items)]
    assert urgent_ids == ["TKT-1", "TKT-3"]


def test_cli_formatter_and_main_returns_zero():
    summary = summarize_tickets(
        [TicketItem(ticket_id="TKT-9", channel="email", urgent=False)]
    )
    assert format_summary_line(summary) == "total=1 urgent=0"
    assert main() == 0
`,
    },
    selfCheck: [
      "โฟลเดอร์โค้ดอยู่ใต้ `src/ticket_kit/` และโฟลเดอร์เทสต์อยู่แยกใน `tests/` ที่รากโปรเจกต์",
      "`pyproject.toml` มีทั้ง `[build-system]` และ `[project.scripts]` ระบุ `ticket-kit = \"ticket_kit.cli:main\"`",
      "`uv sync` ติดตั้งแพ็กเกจแบบ editable สำเร็จโดยไม่ต้องแฮ็ก `sys.path` ในไฟล์เทสต์",
      "คำสั่ง `uv run ticket-kit` รันได้จริงจาก terminal โดยไม่ error",
      "รัน `uv run pytest -q` ผ่าน 4/4 และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q`, รัน `uv run ticket-kit` สำเร็จ และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "เริ่มจาก `uv init --package ticket-kit` เพื่อให้ `uv` สร้าง `pyproject.toml` พร้อม `[build-system]` และโครง `src/ticket_kit/` ให้เลย จากนั้นเติม `[project.scripts]` ให้ชี้ไปที่ `\"ticket_kit.cli:main\"` แล้วรัน `uv sync`",
      },
      {
        body: "ใน `src/ticket_kit/cli.py` ให้ประกาศ `format_summary_line(summary: TicketSummary) -> str` ที่คืน `f\"total={summary.total} urgent={summary.urgent_count}\"` และให้ `main() -> int` พิมพ์สรุปแล้ว `return 0`",
      },
      {
        body: "ตัวอย่างไฟล์ `src/ticket_kit/cli.py` และ `src/ticket_kit/__init__.py` ที่เชื่อมกับ `models.py` และ `service.py` — นำไปวางให้ตรงพาธแล้วรัน `uv sync && uv run pytest -q`",
        code: {
          language: "python",
          filename: "src/ticket_kit/cli.py",
          code: `from ticket_kit.models import TicketItem, TicketSummary
from ticket_kit.service import summarize_tickets


def format_summary_line(summary: TicketSummary) -> str:
    return f"total={summary.total} urgent={summary.urgent_count}"


def main() -> int:
    demo = [
        TicketItem(ticket_id="TKT-101", channel="line", urgent=True),
        TicketItem(ticket_id="TKT-102", channel="web", urgent=False),
    ]
    summary = summarize_tickets(demo)
    print(format_summary_line(summary))
    return 0`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# รัน uv sync ทุกครั้งหลังแก้ [project.scripts] หรือ [build-system]
uv sync
uv run pytest -q
uv run ticket-kit
uv run ruff check .`,
      caption: "ถ้าใช้ `tomllib` ในเทสต์ไม่ต้องลงแพ็กเกจเพิ่ม เพราะอยู่ใน Python Standard Library ตั้งแต่ 3.11",
    },
  },

  mistakes: [
    {
      title: "สร้างโฟลเดอร์ `src/ticket_kit/` แต่ลืมใส่ `[build-system]` ใน `pyproject.toml`",
      symptom: "รัน `uv run pytest` แล้วเจอ `ModuleNotFoundError: No module named 'ticket_kit'` ทั้งที่ไฟล์อยู่ครบ",
      fix: "เพิ่มบล็อก `[build-system]` (เช่น `hatchling` หรือ `uv_build`) หรือสร้างโปรเจกต์ด้วย `uv init --package` แล้วรัน `uv sync`",
    },
    {
      title: "แก้ `[project.scripts]` ใน `pyproject.toml` แต่ลืมรัน `uv sync`",
      symptom: "พิมพ์ `uv run ticket-kit` แล้วขึ้นว่าไม่พบคำสั่ง หรือยังเรียกฟังก์ชันชื่อเก่าอยู่",
      fix: "รัน `uv sync` เพื่อสร้าง executable wrapper ใหม่ใน `.venv/bin/` (หรือ `.venv/Scripts/` บน Windows)",
    },
    {
      title: "ตั้งชื่อโฟลเดอร์ใน `src/` ด้วยขีดกลาง (`src/ticket-kit/`) แทนขีดล่าง (`src/ticket_kit/`)",
      symptom: "Python ไม่สามารถ `import ticket-kit` ได้และเกิด `SyntaxError` หรือหาแพ็กเกจไม่เจอ",
      fix: "ชื่อโปรเจกต์ใน `[project] name` ใช้ขีดกลางได้ (`ticket-kit`) แต่ชื่อโฟลเดอร์ Python package ใต้ `src/` ต้องเป็นขีดล่าง (`ticket_kit`) เสมอ",
    },
    {
      title: "วางไฟล์เทสต์ไว้ใน `src/ticket_kit/tests/` ปนกับโค้ด production",
      symptom: "ไฟล์เทสต์และข้อมูลจำลองติดเข้าไปในแพ็กเกจ/wheel ตอน deploy ทำให้ image ใหญ่ขึ้นและเสี่ยงมีชื่อโมดูลชนกัน",
      fix: "วางโฟลเดอร์ `tests/` ไว้ที่รากโปรเจกต์คู่ขนานกับ `src/` เสมอ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อทบทวนเหตุผลของ `src/` layout, `pyproject.toml`, editable install และ `[project.scripts]`",
    questions: [
      mc(
        "d022-q1",
        "เหตุผลทางเทคนิคหลักที่ PyPA และทีมวิศวกรรมแนะนำให้ใช้ `src/<pkg>/` layout แทนการวางโฟลเดอร์ `<pkg>/` ไว้ที่รากโปรเจกต์ (flat layout) คือข้อใด?",
        [
          ["เพราะ Python 3.12 ยกเลิกการรองรับ flat layout แล้ว", "Python ยังรองรับ flat layout ได้ แต่ไม่แนะนำเพราะเสี่ยง import เพี้ยนตอนทดสอบ"],
          ["ป้องกันไม่ให้ `pytest` เผลอ import โฟลเดอร์ดิบจาก working directory โดยข้ามแพ็กเกจที่ติดตั้งจริงใน `.venv`", "ถูก — `src/` layout บังคับให้เทสต์รันกับแพ็กเกจที่ติดตั้งผ่าน `uv sync` จริง จึงจับบั๊ก packaging ได้ตั้งแต่บนเครื่อง"],
          ["ทำให้โค้ด Python รันเร็วขึ้น 2 เท่า", "โครงสร้างโฟลเดอร์ไม่ได้เปลี่ยนความเร็ว runtime ของ Python"],
          ["เพราะ `ruff` ตรวจได้เฉพาะไฟล์ที่อยู่ในโฟลเดอร์ `src/`", "`ruff` ตรวจไฟล์ `.py` ได้ทุกโฟลเดอร์ในโปรเจกต์"],
        ],
        "B",
        "เพราะ Python ใส่ working directory ไว้หน้าสุดของ `sys.path` ใน flat layout การรัน `pytest` จะ import โฟลเดอร์ดิบแทนแพ็กเกจที่ติดตั้งจริง ทำให้พลาดบั๊ก packaging — `src/` layout ปิดช่องโหว่นี้โดยสมบูรณ์",
        "ทำไม `src/` layout จึงปลอดภัยกว่า flat layout เวลารัน `pytest`?",
        "เพราะซ่อนแพ็กเกจไว้ใต้ `src/` ไม่ให้ `sys.path` เผลอ import โฟลเดอร์ดิบจาก working directory บังคับให้เทสต์รันกับแพ็กเกจที่ติดตั้งจริงใน `.venv`",
      ),
      mc(
        "d022-q2",
        "ในไฟล์ `pyproject.toml` บรรทัด `ticket-kit = \"ticket_kit.cli:main\"` ใต้ `[project.scripts]` มีความหมายว่าอย่างไร?",
        [
          ["สั่งให้สร้างไฟล์ชื่อ `ticket_kit.cli` อัตโนมัติทุกครั้งที่รัน", "ไม่ได้สร้างไฟล์ซอร์สโค้ด — เป็นการชี้ตำแหน่งฟังก์ชันที่มีอยู่แล้ว"],
          ["ลงทะเบียนคำสั่ง CLI ชื่อ `ticket-kit` ซึ่งเมื่อถูกเรียกจะ import `ticket_kit.cli` แล้วรันฟังก์ชัน `main()`", "ถูก — รูปแบบ `<command> = \"<module.path>:<callable>\"` คือมาตรฐาน PEP 621 สำหรับสร้าง CLI entry point"],
          ["สั่งให้ `pytest` รันเฉพาะฟังก์ชัน `main()` ใน `cli.py`", "`[project.scripts]` ไม่ได้กำหนดพฤติกรรมของ `pytest`"],
          ["ติดตั้งแพ็กเกจภายนอกชื่อ `ticket_kit` จาก PyPI", "การติดตั้งแพ็กเกจภายนอกระบุใน `dependencies` ไม่ใช่ `[project.scripts]`"],
        ],
        "B",
        "`[project.scripts]` ใช้รูปแบบ `command-name = \"package.module:function\"` เมื่อติดตั้งด้วย `uv sync` ระบบจะสร้างตัวรันคำสั่งใน `.venv` ให้เรียก `uv run ticket-kit` ได้ทันที",
        "รูปแบบ `cmd = \"pkg.cli:main\"` ใน `[project.scripts]` ของ `pyproject.toml` ทำงานอย่างไร?",
        "สร้างคำสั่ง CLI ชื่อ `cmd` ใน `.venv` ที่เมื่อรันจะ import โมดูล `pkg.cli` และเรียกฟังก์ชัน `main()`",
      ),
      mc(
        "d022-q3",
        "คุณจัดโฟลเดอร์แบบ `src/ticket_kit/` เรียบร้อยแล้ว แต่พอรัน `uv run pytest` กลับเกิด `ModuleNotFoundError: No module named 'ticket_kit'` สาเหตุที่เป็นไปได้มากที่สุดคือข้อใด?",
        [
          ["ลืมใส่ `sys.path.append('src')` ไว้หัวไฟล์เทสต์ทุกไฟล์", "ไม่ควรแฮ็ก `sys.path` — ควรแก้ที่การติดตั้งแพ็กเกจให้ถูกต้อง"],
          ["ยังไม่ได้ประกาศ `[build-system]` ใน `pyproject.toml` หรือยังไม่ได้รัน `uv sync` เพื่อติดตั้งแพ็กเกจแบบ editable", "ถูก — ถ้าไม่มี `[build-system]` `uv` จะไม่ติดตั้งโปรเจกต์ของคุณเข้า `.venv` เป็นแพ็กเกจ"],
          ["ไฟล์เทสต์ต้องย้ายไปวางไว้ใน `src/ticket_kit/` ถึงจะ import ได้", "ห้ามย้าย `tests/` เข้า `src/` — `tests/` ควรอยู่นอก `src/` เสมอ"],
          ["Python ไม่รองรับการ import แพ็กเกจที่มี `__init__.py`", "`__init__.py` คือมาตรฐานการประกาศ regular package ใน Python"],
        ],
        "B",
        "แพ็กเกจใต้ `src/` จะถูกมองเห็นก็ต่อเมื่อมี `[build-system]` ใน `pyproject.toml` และได้รับการติดตั้งแบบ editable เข้า `.venv` ผ่าน `uv sync`",
        "หากใช้ `src/` layout แล้วเจอ `ModuleNotFoundError` ตอนรัน `uv run pytest` ควรเช็กอะไรเป็นอย่างแรก?",
        "เช็กว่า `pyproject.toml` มี `[build-system]` และรัน `uv sync` เพื่อติดตั้งแพ็กเกจแบบ editable เข้า `.venv` แล้วหรือยัง",
      ),
      mc(
        "d022-q4",
        "เหตุใดเราจึงแยก `pytest` และ `ruff` ไปไว้ใน `[dependency-groups]` (`dev`) แทนที่จะใส่รวมใน `[project].dependencies`?",
        [
          ["เพราะ `uv` ไม่อนุญาตให้ติดตั้ง `pytest` ใน `[project].dependencies`", "ติดตั้งได้ทางเทคนิค แต่ผิดหลักปฏิบัติและทำให้ production image บวม"],
          ["เพื่อให้แพ็กเกจหรือ Docker image ใน production ติดตั้งเฉพาะ runtime dependency ที่จำเป็นจริง ลดขนาดและพื้นที่เสี่ยงด้านความปลอดภัย", "ถูก — production service ไม่จำเป็นต้องมี test runner หรือ linter ติดไปใน container"],
          ["เพราะไฟล์ใน `[dependency-groups]` ไม่ต้องล็อกเวอร์ชันใน `uv.lock`", "`uv.lock` ล็อกเวอร์ชันให้ทั้ง runtime และ dev dependency เพื่อให้ทีมรันเทสต์ได้ตรงกัน"],
          ["เพื่อให้รัน `pytest` ได้โดยไม่ต้องใช้ `.venv`", "เครื่องมือทั้งหมดยังคงรันอยู่ใน `.venv` ของโปรเจกต์ผ่าน `uv run`"],
        ],
        "B",
        "การแยก runtime `dependencies` ออกจาก dev `dependency-groups` ทำให้ production build (`uv sync --no-dev`) เล็ก เร็ว และปลอดภัยกว่ามาก",
        "ทำไมต้องแยก `pytest` และ `ruff` ไว้ใน dev dependency group แทน `[project].dependencies`?",
        "เพื่อให้ production install (`uv sync --no-dev`) ติดตั้งเฉพาะไลบรารีที่จำเป็นต่อการรันจริง ลดขนาด image และความเสี่ยงด้านความปลอดภัย",
      ),
    ],
  },

  takeaways: [
    "ใช้ `src/<pkg>/` layout คู่กับโฟลเดอร์ `tests/` แยกที่รากโปรเจกต์ เพื่อให้ `pytest` ทดสอบแพ็กเกจที่ติดตั้งจริงเสมอและไม่ต้องแฮ็ก `sys.path`",
    "`pyproject.toml` เป็นศูนย์กลางเดียวสำหรับ `[project]`, `dependencies`, `[dependency-groups]` (`dev`), `[build-system]` และ `[project.scripts]`",
    "รัน `uv sync` ทุกครั้งหลังแก้ `[build-system]`, `[project.scripts]` หรือ `dependencies` เพื่ออัปเดต editable install และ `uv.lock`",
    "แบ่งโมดูลให้ชัด (`models.py`, `service.py`, `cli.py`, `__init__.py`) เพื่อให้ core logic ใช้ซ้ำได้ทั้งใน CLI, FastAPI และ Eval Suite",
  ],

  reviewCards: [
    rc(
      "d022-rc-1",
      "ต่างกันอย่างไรระหว่าง flat layout (`pkg/`) กับ `src/` layout (`src/pkg/`) ตอนรัน `pytest`?",
      "Flat layout ทำให้ Python เผลอ import โฟลเดอร์ดิบจาก working directory แทนแพ็กเกจที่ติดตั้งใน `.venv` จึงพลาดบั๊ก packaging ส่วน `src/` layout บังคับให้เทสต์กับแพ็กเกจที่ติดตั้งจริงผ่าน `uv sync`",
    ),
    rc(
      "d022-rc-2",
      "ต้องมีบล็อกใดบ้างใน `pyproject.toml` เพื่อให้ `uv sync` ติดตั้งโปรเจกต์ใต้ `src/` เป็นแพ็กเกจพร้อมคำสั่ง CLI?",
      "ต้องมี `[project]`, `[build-system]` (เช่น `hatchling` หรือ `uv_build`) และ `[project.scripts]` เช่น `my-cli = \"my_pkg.cli:main\"`",
    ),
    rc(
      "d022-rc-3",
      "ทำไมจึงไม่ควรใส่คำสั่ง `print()` หรือการอ่าน `sys.argv` ปนอยู่ใน `service.py`?",
      "เพื่อให้ core logic แยกขาดจากหน้าตาอินเทอร์เฟซ สามารถเขียน unit test ได้ง่าย และนำไปหุ้มด้วยทั้ง Typer CLI, FastAPI หรือ Eval Harness โดยไม่ต้องรื้อโค้ดใหม่",
    ),
  ],

  sources: [
    { label: "Python Packaging User Guide — src layout vs flat layout", href: "https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/" },
    { label: "Python Packaging User Guide — Writing your pyproject.toml", href: "https://packaging.python.org/en/latest/guides/writing-pyproject-toml/" },
    { label: "uv Official Docs — Creating & Structuring Projects (`--package`)", href: "https://docs.astral.sh/uv/concepts/projects/init/" },
    { label: "Python 3 Official Docs — tomllib (Parse TOML files)", href: "https://docs.python.org/3/library/tomllib.html" },
  ],

  glossary: [
    "uv",
    "venv",
    "pyproject",
    "lockfile",
    "dependency",
    "reproducibility",
    "pytest",
    "pydantic",
  ],
});
