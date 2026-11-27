import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D011 — Phase 1 / Block B03
 * Code Quality Automation (Ruff lint/format + pre-commit basics).
 */
export const d011: Lesson = defineLesson({
  day: 11,
  titleTh: "สร้างด่านตรวจคุณภาพโค้ดอัตโนมัติด้วย Ruff และ pre-commit",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · ตั้งค่า [tool.ruff] ใน pyproject.toml จับบั๊กตั้งแต่ยังไม่รัน และล็อกมาตรฐานก่อน commit",
  icon: "badge-check",
  visual: {
    id: "mock-parametrize",
    title: "ด่านตรวจคุณภาพอัตโนมัติ — Ruff Check/Format + pre-commit",
    caption: "ดูขั้นตอนตรวจจับ unused imports, bug patterns และฟอร์แมตโค้ดอัตโนมัติก่อน commit",
    alt: "แผนภาพด่านตรวจโค้ดด้วย Ruff และ pre-commit",
  },
  requiresApiKey: false,
  tools: ["Ruff", "pre-commit", "uv", "pyproject.toml"],

  bigPicture: [
    {
      node: 1,
      heading: "ดักบั๊ก Python ยอดฮิตในท่อข้อมูลตั้งแต่ยังไม่ทันรัน",
      body: "โค้ด AI Pipeline มักเต็มไปด้วยสคริปต์แปลงข้อมูลที่ถูกแก้เร่งด่วนจนหลงเหลือ import ค้าง, ตัวแปรสะกดผิด หรือกับดักร้ายแรงอย่าง mutable default argument (`def fn(tags=[]):`)",
      lessonNote: "วันนี้เราตั้งค่า {{ruff}} ให้เป็นด่าน {{fail-fast}} ระดับซอร์สโค้ดที่ตรวจจับ bug patterns ได้ในไม่กี่มิลลิวินาที",
    },
    {
      node: 4,
      heading: "ทำให้โค้ดทั้งทีมและทุก Pull Request มีมาตรฐานเดียว",
      body: "เมื่อทีมเริ่มสร้าง CLI, RAG pipeline และ API service ร่วมกัน การเสียเวลาคอมเมนต์เรื่องการเว้นวรรค เรียง import หรือสไตล์โค้ดใน PR จะกินพลังของทีมไปกับเรื่องที่ไม่ใช่ตรรกะ",
      lessonNote: "การรวมกฎไว้ใน {{pyproject|pyproject.toml}} และผูกกับ {{pre-commit}} ทำให้เครื่องมือจัดรูปและตรวจโค้ดให้เองก่อนทุก commit",
    },
    {
      node: 5,
      heading: "ลดต้นทุนการดูแลระบบระยะยาวและการไล่ diff ใน Git",
      body: "โค้ดที่ถูกจัดฟอร์แมตสม่ำเสมอด้วย `ruff format` ทำให้ `git diff` เห็นเฉพาะบรรทัดที่เปลี่ยนตรรกะจริง ช่วยให้ย้อนหาต้นเหตุ incident ได้เร็วขึ้นมาก",
      lessonNote: "การตั้งค่าในวันนี้จะติดตัวไปเป็นเทมเพลตมาตรฐานของทุกโปรเจกต์ตั้งแต่ Phase 1 จนถึง Capstone ใน Phase 6",
    },
  ],

  objectives: [
    "**ตั้งค่า `[tool.ruff]`** ใน {{pyproject|pyproject.toml}} โดยเลือกชุดกฎหลัก (`E`, `F`, `I`, `B`, `UP`) และ `target-version` ให้เหมาะกับโปรเจกต์ Python สมัยใหม่",
    "**ใช้คำสั่ง `ruff check --fix` และ `ruff format`** เพื่อแยกแยะระหว่างการแก้บั๊กเชิงโครงสร้าง (linting) กับการจัดรูปแบบโค้ด (formatting) อย่างถูกต้อง",
    "**วางโครง `.pre-commit-config.yaml`** เพื่อรันด่านตรวจคุณภาพโค้ดอัตโนมัติทุกครั้งก่อน `git commit` พร้อมเข้าใจวิธีใช้ `--check` ใน CI",
  ],

  prerequisites: [
    "มีโปรเจกต์ที่สร้างด้วย `uv` และเข้าใจบทบาทของ `pyproject.toml` (จาก D1)",
    "เคยรัน `uv run ruff check .` ขั้นพื้นฐานจากบทก่อนหน้า",
    "มี Git ติดตั้งบนเครื่อง — รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์ทดลองตั้งค่า {{ruff}} และ {{pre-commit}} ผ่าน {{uv}} เพื่อให้เห็นการทำงานของกฎแต่ละตระกูลกับโค้ดตัวอย่างจริง",
    commands: `uv init ai-day11-quality && cd ai-day11-quality
git init
uv add --dev ruff pre-commit

# ตรวจสอบเวอร์ชันเครื่องมือ
uv run ruff --version`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day11-quality` และเริ่ม Git repo ด้วย `git init`"],
      ["deps", "ติดตั้ง `ruff` และ `pre-commit` เป็น dev dependency ด้วย `uv add --dev`"],
      ["verify", "ตรวจเวอร์ชันด้วย `uv run ruff --version`"],
    ],
    note: "หากเครื่องคุณไม่มีอินเทอร์เน็ตสำหรับดาวน์โหลด hook repository ของ `pre-commit` สามารถรัน `uv run ruff check` / `format` และเขียนไฟล์ `.pre-commit-config.yaml` ฝึกโครงสร้างได้ครบ 100%",
  },

  concepts: [
    {
      id: "ruff-lint-vs-format",
      title: "1 · ทำไมทีม Python ยุคใหม่เลือก Ruff และความต่างของ Check vs Format",
      paragraphs: [
        "ในอดีตทีม Python ต้องติดตั้งเครื่องมือ 4–5 ตัวพร้อมกันคือ `flake8` (ตรวจ lint), `isort` (เรียง import), `black` (จัดรูปแบบ), `pyupgrade` (อัปเดตไวยากรณ์ใหม่) และ `flake8-bugbear` ซึ่งช้าและไฟล์ config กระจัดกระจาย {{ruff}} (เขียนด้วยภาษา Rust โดยทีม Astral เจ้าเดียวกับ {{uv}}) รวมทุกบทบาทนั้นไว้ในไบนารีเดียวที่รันเร็วกว่าเดิม 10–100 เท่า",
        "Ruff แบ่งหน้าที่ชัดเจนเป็น 2 คำสั่งที่ทำงานคู่กัน: **`ruff check`** คือ **Linter** ที่ตรวจจับความผิดพลาดเชิงความหมายและ bug patterns (เช่น import ไม่ได้ใช้, ตัวแปรไม่ถูกนิยาม, `except:` เปล่า, mutable default) ส่วน **`ruff format`** คือ **Formatter** ที่จัดย่อหน้า ความยาวบรรทัด และเครื่องหมายคำพูดให้เป็นมาตรฐานเดียวทั้งทีมโดยไม่เปลี่ยนตรรกะของโค้ด",
      ],
      analogy:
        "เหมือนกองบรรณาธิการหนังสือที่มี 2 แผนก — `ruff check` คือบรรณาธิการตรวจเนื้อหาและข้อเท็จจริงที่ผิดพลาด ส่วน `ruff format` คือฝ่ายจัดหน้าหนังสือให้ฟอนต์และระยะขอบสวยงามสม่ำเสมอทุกหน้า",
      bullets: [
        "**`uv run ruff check .`** — รายงานปัญหาทั้งหมดโดยยังไม่แก้ไฟล์ (เหมาะสำหรับ CI)",
        "**`uv run ruff check --fix .`** — แก้ปัญหาที่ปลอดภัยให้อัตโนมัติ (เช่น ลบ unused import, เรียง import ใหม่)",
        "**`uv run ruff format .`** — จัดรูปแบบโค้ดทุกไฟล์ทันที (ใช้ `--check` ใน CI เพื่อให้ fail ถ้ามีไฟล์ยังไม่จัดรูป)",
      ],
      whyTitle: "Why this matters — Fast Feedback Loop เปลี่ยนนิสัยการเขียนโค้ด",
      whyParagraphs: [
        "เมื่อ linter รันช้า 15 วินาที นักพัฒนามักขี้เกียจรันก่อน commit แต่เมื่อ Ruff รันจบทั้งโปรเจกต์ใน 20 มิลลิวินาที คุณสามารถรันได้ทุกครั้งที่เซฟไฟล์หรือก่อนทุก commit โดยไม่สะดุดจังหวะคิด",
        "นอกจากนี้การแยก `check` กับ `format` ออกจากกันช่วยให้ทีมอ่าน diff ได้ง่าย: เรามักรัน `ruff check --fix` ก่อนแล้วตามด้วย `ruff format`",
      ],
    },
    {
      id: "pyproject-rule-families",
      title: "2 · ตั้งค่า [tool.ruff] ใน pyproject.toml และ 5 ตระกูลกฎที่ต้องรู้จัก",
      paragraphs: [
        "กฎการตรวจโค้ดทั้งหมดควรเก็บไว้ที่จุดเดียวใน {{pyproject|pyproject.toml}} ใต้ส่วน `[tool.ruff]` เพื่อให้ทุกคนในทีม Editor (VS Code / Cursor) และ GitHub Actions ใช้กติกาชุดเดียวกัน 100% ({{reproducibility}})",
        "ค่าเริ่มต้นของ Ruff เปิดเฉพาะ `E` และ `F` ซึ่งยังไม่จับ bug patterns สำคัญในงานจริง ทีม AI Engineering มักเปิดเพิ่มเป็น 5 ตระกูลพื้นฐานที่คุ้มค่าและไม่จุกจิกเกินไปคือ **`E`** (pycodestyle errors), **`F`** (Pyflakes — unused import/undefined name), **`I`** (isort — เรียง import), **`B`** (flake8-bugbear — จับกับดักบั๊กจริง เช่น `def f(x=[]):` หรือ `except:` เปล่า) และ **`UP`** (pyupgrade — ช่วยอัปเกรด {{type-hint}} เช่น `List[str]` → `list[str]` สำหรับ Python 3.12)",
      ],
      analogy:
        "เหมือนรายการตรวจสภาพรถประจำปีในคู่มือเดียวกัน — ไม่ใช่ตรวจแค่สีรถสวย (`E`), แต่ตรวจเบรกและยางที่อาจทำให้เกิดอุบัติเหตุจริงด้วย (`F`, `B`)",
      code: {
        language: "text",
        filename: "pyproject.toml",
        code: `[tool.ruff]
target-version = "py312"
line-length = 88

[tool.ruff.lint]
# E: สไตล์พื้นฐาน, F: บั๊ก import/ตัวแปร, I: เรียง import,
# B: bugbear (กับดัก Python), UP: ไวยากรณ์ Python สมัยใหม่
select = ["E", "F", "I", "B", "UP"]
ignore = ["E501"]  # ปล่อยให้ ruff format จัดการความยาวบรรทัดแทน

[tool.ruff.format]
quote-style = "double"
indent-style = "space"`,
        caption: "โครง `[tool.ruff]` ขนาดกะทัดรัดที่พร้อมใช้เป็นมาตรฐานสำหรับทุกโปรเจกต์ Phase 1–6",
      },
      whyTitle: "Why this matters — กฎตระกูล `B` (Bugbear) ช่วยชีวิตจากบั๊กที่ซ่อนลึกที่สุดใน Python",
      whyParagraphs: [
        "ตัวอย่างคลาสสิกคือ `def add_tag(tag: str, tags: list[str] = []):` (`B006`) ซึ่ง Python สร้างลิสต์ default เพียงครั้งเดียวตอนประกาศฟังก์ชัน ทำให้ข้อมูลลูกค้าคนแรกแอบรั่วไปปนกับลูกค้าคนที่สอง — Ruff กฎ `B006` จับได้ทันทีตั้งแต่ยังไม่รัน!",
        "ส่วนกฎ `UP` ช่วยให้โค้ดของทั้งทีมใช้ `str | None` และ `list[str]` แบบ Python 3.10+ สม่ำเสมอ ไม่ปะปนกับ `Optional[str]` หรือ `List[str]` รุ่นเก่า",
      ],
    },
    {
      id: "pre-commit-basics",
      title: "3 · ด่านตรวจอัตโนมัติก่อน Commit ด้วย .pre-commit-config.yaml",
      paragraphs: [
        "ถึงจะมี Ruff ติดตั้งไว้ แต่ในวันที่รีบส่งงาน ใคร ๆ ก็เผลอลืมรัน `uv run ruff check .` ก่อน `git commit` ได้ {{pre-commit}} คือเฟรมเวิร์กที่เสียบ Git hook เข้ากับ `.git/hooks/pre-commit` เพื่อให้รันด่านตรวจอัตโนมัติทุกครั้งที่คุณสั่ง `git commit` — หากมีไฟล์ไม่ผ่านกฎ การ commit จะถูกหยุดไว้ก่อนจนกว่าจะแก้สะอาด",
        "สำหรับทีมที่ใช้ `ruff-pre-commit` ลำดับของ hook มีความสำคัญมาก: ต้องวาง **`ruff` (linter พร้อม `--fix`) ก่อน `ruff-format`** เสมอ เพราะการแก้ lint (เช่น ลบ import หรือเปลี่ยนไวยากรณ์ `UP`) อาจทำให้ความยาวบรรทัดเปลี่ยน จึงควรจัดรูปด้วย `ruff-format` เป็นขั้นตอนสุดท้าย",
      ],
      analogy:
        "เหมือนเครื่องสแกนกระเป๋าอัตโนมัติหน้าประตูขึ้นเครื่อง — ไม่ต้องพึ่งความจำผู้โดยสารว่าจะหยิบขวดน้ำออกเองไหม เพราะระบบตรวจซ้ำให้ทุกครั้งก่อนผ่านประตู",
      code: {
        language: "yaml",
        filename: ".pre-commit-config.yaml",
        code: `repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ["--maxkb=500"]

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.11.0
    hooks:
      # 1. รัน linter + auto-fix ก่อน
      - id: ruff
        args: ["--fix"]
      # 2. แล้วจัดรูปแบบโค้ดเป็นลำดับถัดไป
      - id: ruff-format`,
        caption: "ใส่ `check-added-large-files` ไว้ใน `.pre-commit-config.yaml` ช่วยกันไม่ให้เผลอ commit ไฟล์ dataset หรือโมเดลขนาดใหญ่ขึ้น Git ด้วย",
      },
      whyTitle: "Why this matters — Pre-commit คือด่านแรก แต่ CI คือด่านบังคับจริง",
      whyParagraphs: [
        "นักพัฒนาสามารถข้าม pre-commit บนเครื่องตัวเองได้ด้วย `git commit --no-verify` (เช่น ตอนรีบเซฟงานชั่วคราว) ดังนั้นในทีมจริงเราจะรันคำสั่งเดียวกันใน GitHub Actions CI (`ruff check .` + `ruff format --check .`) เป็นด่านสุดท้ายก่อน merge PR เสมอ",
        "การมีทั้ง pre-commit (แจ้งเตือนเร็วใน 1 วินาทีบนเครื่อง) และ CI gate (บังคับจริงบนเซิร์ฟเวอร์) คือคู่หูมาตรฐานของวิศวกรรมซอฟต์แวร์ระดับ production",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Ruff + pre-commit กับ Biome / ESLint + Husky",
      body: [
        "ถ้าคุณมาจากโลก TypeScript/React ชุดเครื่องมือ `Ruff + pre-commit` คือคู่เทียบตรงตัวกับ `Biome` (หรือ `ESLint + Prettier`) + `Husky + lint-staged`:",
      ],
      table: [
        ["`uv run ruff check .`", "`npx eslint .` หรือ `npx biome lint .`"],
        ["`uv run ruff format .`", "`npx prettier --write .` หรือ `npx biome format --write .`"],
        ["`[tool.ruff]` ใน `pyproject.toml`", "`biome.json` / `eslint.config.js` + `.prettierrc`"],
        ["`.pre-commit-config.yaml` + `pre-commit install`", "`husky` + `lint-staged`"],
        ["`ruff check . && ruff format --check .` (CI)", "`biome ci .` หรือ `eslint . && prettier --check .`"],
      ],
    },
    student: {
      title: "First-Year Note — Linter ไม่ใช่ครูที่คอยจับผิด แต่คือเพื่อนช่วยรีวิวฟรี",
      body: [
        "ตอนเปิด `B` กับ `UP` ครั้งแรก คุณอาจเห็นคำเตือนแดงหลายบรรทัดแล้วรู้สึกตกใจ แต่ให้ลองอ่านรหัสกฎแต่ละตัว เช่น `F401` (import ค้างไม่ได้ใช้) หรือ `B006` (ค่า default เป็นลิสต์ว่างซึ่งเป็นบั๊กร้ายแรง)",
        "คุณสามารถถาม Ruff ได้ทันทีว่ากฎแต่ละรหัสหมายถึงอะไรและทำไมถึงอันตรายด้วยคำสั่ง `uv run ruff rule B006` — นี่คือวิธีเรียนรู้ best practice ของ Python ที่เร็วที่สุดวิธีหนึ่ง",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองนำไฟล์ Python ที่เต็มไปด้วยปัญหา 5 ตระกูล (`E`, `F`, `I`, `B`, `UP`) มาผ่านด่าน `[tool.ruff]` แล้วดูว่า `ruff check`, `ruff check --fix` และ `ruff format` จัดการอะไรให้อัตโนมัติ และจุดไหนที่คนต้องตัดสินใจแก้เอง",
    steps: [
      {
        title: "1 · สร้างไฟล์ที่มีทั้งปัญหาสไตล์, Import รก และบั๊กจริง (B006)",
        explain:
          "สังเกต 5 ปัญหาในโค้ดด้านล่าง: import `os`/`sys` ไม่ได้ใช้ (`F401`), เรียง import ผิดลำดับ (`I001`), ใช้ `List`/`Optional` แบบเก่า (`UP035`/`UP007`), ค่า default เป็น `[]` (`B006`) และใช้ `except:` เปล่า (`E722`)",
        code: {
          language: "python",
          filename: "messy_ticket.py",
          code: `import sys
from typing import List, Optional
import os
import json


def append_tag(tag: str, tags: List[str] = []) -> List[str]:
    tags.append(tag.strip().lower())
    return tags


def safe_load_id(raw_json: str) -> Optional[str]:
    try:
        data = json.loads(raw_json)
        return str(data['ticket_id'])
    except:
        return None`,
        },
        output: `$ uv run ruff check messy_ticket.py
messy_ticket.py:1:1: I001 [*] Import block is un-sorted or un-formatted
messy_ticket.py:1:8: F401 [*] \`sys\` imported but unused
messy_ticket.py:2:20: UP035 \`typing.List\` is deprecated, use \`list\` instead
messy_ticket.py:3:8: F401 [*] \`os\` imported but unused
messy_ticket.py:7:44: B006 Do not use mutable data structures for argument defaults
messy_ticket.py:12:34: UP007 Use \`X | Y\` for type annotations
messy_ticket.py:16:5: E722 Do not use bare \`except\`
Found 7 errors.
[*] 3 fixable with the \`--fix\` option.`,
      },
      {
        title: "2 · รัน `ruff check --fix` เพื่อแก้สิ่งที่ปลอดภัยอัตโนมัติ",
        explain:
          "เครื่องหมาย `[*]` บอกว่า Ruff แก้ให้อัตโนมัติได้ทันทีโดยไม่เปลี่ยนความหมายของโปรแกรม (ลบ `os`, `sys` และเรียง import) ส่วน `B006` และ `E722` เป็นบั๊กเชิงตรรกะที่ต้องให้นักพัฒนาแก้เองอย่างตั้งใจ",
        code: {
          language: "bash",
          filename: "terminal",
          code: `# ให้ Ruff ช่วยแก้ส่วนที่ปลอดภัยก่อน แล้วค่อยตรวจดูรายการที่เหลือ
uv run ruff check --fix messy_ticket.py`,
        },
        output: `Found 7 errors (3 fixed, 4 remaining).
messy_ticket.py:4:44: B006 Do not use mutable data structures for argument defaults
messy_ticket.py:9:34: UP007 Use \`X | Y\` for type annotations
messy_ticket.py:13:5: E722 Do not use bare \`except\``,
      },
      {
        title: "3 · แก้บั๊ก B006, E722, UP แล้วปิดท้ายด้วย `ruff format`",
        explain:
          "เปลี่ยน default `tags: list[str] | None = None`, จับเฉพาะ `(json.JSONDecodeError, KeyError)` แทน bare `except:`, แล้วรัน `ruff format` และเช็กซ้ำแบบเดียวกับ CI",
        code: {
          language: "python",
          filename: "messy_ticket.py",
          code: `import json


def append_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    result = list(tags) if tags is not None else []
    result.append(tag.strip().lower())
    return result


def safe_load_id(raw_json: str) -> str | None:
    try:
        data = json.loads(raw_json)
        return str(data["ticket_id"])
    except (json.JSONDecodeError, KeyError, TypeError):
        return None`,
        },
        output: `$ uv run ruff format messy_ticket.py
1 file reformatted
$ uv run ruff check messy_ticket.py && uv run ruff format --check messy_ticket.py
All checks passed!
1 file already formatted`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อย: เปิดใช้กฎ `B` แล้วเจอ `B006` หรือ `B008` แล้วไปปิดกฎทิ้งด้วย `# noqa` แบบไม่ดูสาเหตุ — กฎในตระกูล `B` ถูกสร้างจากบั๊กจริงที่พบบ่อยใน production เสมอ หากสงสัยให้รัน `uv run ruff rule <CODE>` อ่านคำอธิบายก่อนตัดสินใจ!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): ตั้งค่า `[tool.ruff]` ใน `pyproject.toml`, สร้าง `.pre-commit-config.yaml` และทำความสะอาดโมดูล `dirty_pipeline.py` ให้ผ่านทั้ง `ruff check`, `ruff format --check` และชุดเทสต์ `pytest`",
    requirements: [
      "เพิ่มส่วน `[tool.ruff]`, `[tool.ruff.lint]` (`select = [\"E\", \"F\", \"I\", \"B\", \"UP\"]`, `ignore = [\"E501\"]`) และ `[tool.ruff.format]` ลงใน `pyproject.toml` โดยตั้ง `target-version = \"py312\"` และ `line-length = 88`",
      "สร้างไฟล์ `.pre-commit-config.yaml` ที่มี hook `trailing-whitespace`, `end-of-file-fixer`, `check-yaml`, `check-added-large-files` และ `ruff-pre-commit` โดยวาง `ruff --fix` ไว้ก่อน `ruff-format`",
      "นำโค้ดเริ่มต้น `dirty_pipeline.py` มาแก้ไขปัญหาทุกข้อที่ Ruff แจ้ง (ลบ unused imports, อัปเดต type hints เป็น Python 3.12, แก้ `B006` mutable default และแทนที่ bare `except:` ด้วย exception ที่เฉพาะเจาะจง)",
      "รัน `uv run ruff format .` แล้วตรวจให้ผ่านทั้ง `uv run ruff check .` และ `uv run ruff format --check .` โดยห้ามใส่ `# noqa` เพื่อเลี่ยงกฎ",
      "รัน `uv run pytest -q` ด้วยไฟล์ตรวจสอบเพื่อยืนยันว่าแก้ `B006` แล้วไม่เกิดการรั่วไหลของข้อมูลข้ามการเรียกฟังก์ชัน",
    ],
    starter: {
      language: "python",
      filename: "dirty_pipeline.py",
      code: `import os
import json
from typing import Dict, List, Optional
import math


def collect_thai_tags(raw_tag: str, existing: List[str] = []) -> List[str]:
    cleaned = raw_tag.strip().lower()
    if cleaned and cleaned not in existing:
        existing.append(cleaned)
    return existing


def parse_ticket_json(line: str) -> Optional[Dict[str, str]]:
    try:
        obj = json.loads(line)
        return {'ticket_id': str(obj['ticket_id']), 'channel': str(obj['channel'])}
    except:
        return None
`,
    },
    verification: {
      language: "python",
      filename: "test_dirty_pipeline.py",
      code: `import tomllib
from pathlib import Path
from dirty_pipeline import collect_thai_tags, parse_ticket_json


def test_collect_thai_tags_has_no_mutable_default_leak() -> None:
    first = collect_thai_tags(" Billing ")
    second = collect_thai_tags("VIP")

    assert first == ["billing"]
    assert second == ["vip"]


def test_parse_ticket_json_valid_and_invalid() -> None:
    valid = parse_ticket_json('{"ticket_id": "TKT-01", "channel": "line"}')
    assert valid == {"ticket_id": "TKT-01", "channel": "line"}
    assert parse_ticket_json("{bad json") is None
    assert parse_ticket_json('{"ticket_id": "TKT-01"}') is None


def test_pyproject_has_ruff_rule_families() -> None:
    data = tomllib.loads(Path("pyproject.toml").read_text(encoding="utf-8"))
    ruff_cfg = data["tool"]["ruff"]
    assert ruff_cfg["target-version"] == "py312"
    selected = set(ruff_cfg["lint"]["select"])
    assert {"E", "F", "I", "B", "UP"}.issubset(selected)


def test_pre_commit_config_exists_and_orders_ruff_before_format() -> None:
    text = Path(".pre-commit-config.yaml").read_text(encoding="utf-8")
    assert "ruff-pre-commit" in text
    assert text.index("id: ruff\n") < text.index("id: ruff-format")
`,
    },
    selfCheck: [
      "`pyproject.toml` มี `[tool.ruff]` ครบ `target-version = \"py312\"` และ `select = [\"E\", \"F\", \"I\", \"B\", \"UP\"]`",
      "`.pre-commit-config.yaml` วาง `id: ruff` (`--fix`) ไว้ก่อน `id: ruff-format`",
      "ใน `dirty_pipeline.py` ไม่มีการใช้ `# noqa` เพื่อปิดกฎ และแก้ `B006` ด้วย `existing: list[str] | None = None`",
      "`uv run ruff check .` และ `uv run ruff format --check .` คืน exit code 0 ทั้งคู่",
      "`uv run pytest -q` ผ่านครบทั้ง 4 ข้อ รวมถึงเทสต์ตรวจไม่ให้ mutable default รั่วไหล",
    ],
    acceptance: "ผ่านครบทั้ง `uv run ruff check .`, `uv run ruff format --check .` และ `uv run pytest -q`",
    hints: [
      {
        body: "เริ่มจากเพิ่ม `[tool.ruff]` ใน `pyproject.toml` ก่อน แล้วรัน `uv run ruff check dirty_pipeline.py` เพื่อดูรายชื่อรหัสปัญหาทั้งหมดที่ต้องแก้",
      },
      {
        body: "สำหรับ `collect_thai_tags` เปลี่ยนพารามิเตอร์เป็น `existing: list[str] | None = None` แล้วสร้างลิสต์ใหม่ `tags = list(existing) if existing is not None else []` ส่วน `parse_ticket_json` ให้จับ `(json.JSONDecodeError, KeyError, TypeError)`",
      },
      {
        body: "ตัวอย่าง `dirty_pipeline.py` ที่สะอาดผ่านครบ 5 ตระกูลกฎ — อย่าลืมสร้าง `.pre-commit-config.yaml` และเพิ่ม `[tool.ruff]` ใน `pyproject.toml` ด้วย",
        code: {
          language: "python",
          filename: "hint-d011-l3.py",
          code: `import json


def collect_thai_tags(raw_tag: str, existing: list[str] | None = None) -> list[str]:
    tags = list(existing) if existing is not None else []
    cleaned = raw_tag.strip().lower()
    if cleaned and cleaned not in tags:
        tags.append(cleaned)
    return tags


def parse_ticket_json(line: str) -> dict[str, str] | None:
    try:
        obj = json.loads(line)
        return {"ticket_id": str(obj["ticket_id"]), "channel": str(obj["channel"])}
    except (json.JSONDecodeError, KeyError, TypeError):
        return None`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# รันด่านตรวจคุณภาพเหมือนใน CI แล้วตามด้วยชุดเทสต์
uv run ruff check .
uv run ruff format --check .
uv run pytest -q

# (เสริมเมื่อมีเน็ต) ติดตั้ง Git pre-commit hook ลงใน repo นี้
# uv run pre-commit install`,
      caption: "ใช้ `uv run ruff rule B006` เพื่ออ่านคำอธิบายละเอียดของกฎตัวใดก็ได้แบบออฟไลน์ทันที",
    },
  },

  mistakes: [
    {
      title: "รันเฉพาะ `ruff format` โดยไม่รัน `ruff check`",
      symptom: "โค้ดจัดหน้าสวยงาม แต่ยังมี unused import, ตัวแปรสะกดผิด (`F821`) หรือ mutable default (`B006`) หลุดขึ้น production",
      fix: "รันทั้งสองคำสั่งคู่กันเสมอ: `ruff check` จับบั๊กเชิงตรรกะ และ `ruff format` จัดรูปแบบโค้ด",
    },
    {
      title: "วาง `ruff-format` ไว้ก่อน `ruff --fix` ใน `.pre-commit-config.yaml`",
      symptom: "pre-commit แก้ไฟล์รอบแรกไม่จบ ต้องสั่ง `git commit` ซ้ำสองรอบเพราะ `--fix` เปลี่ยนโครงสร้างบรรทัดหลังจากจัดรูปไปแล้ว",
      fix: "วาง `id: ruff` (พร้อม `args: [\"--fix\"]`) ไว้ก่อน `id: ruff-format` เสมอ",
    },
    {
      title: "แปะ `# noqa` ทับทุกคำเตือนโดยไม่เข้าใจรหัสกฎ",
      symptom: "ปิดตาเดินข้ามบั๊กจริงอย่าง `B006` (mutable default) หรือ `E722` (bare except ที่กลืน `KeyboardInterrupt`)",
      fix: "รัน `uv run ruff rule <CODE>` เพื่อเข้าใจสาเหตุและแก้ที่ต้นตอ ใช้ `# noqa: <CODE>` เฉพาะกรณีที่มีเหตุผลชัดเจนและระบุรหัสกฎเสมอ",
    },
    {
      title: "ไม่ระบุ `target-version` ใน `[tool.ruff]`",
      symptom: "กฎตระกูล `UP` ไม่แนะนำไวยากรณ์ใหม่ หรือแนะนำฟีเจอร์ที่เวอร์ชัน Python ของทีมยังไม่รองรับ",
      fix: "ระบุ `target-version = \"py312\"` (ให้ตรงกับ `requires-python` ของโปรเจกต์) ใน `pyproject.toml` เสมอ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อตรวจความเข้าใจเรื่อง Ruff check vs format, ตระกูลกฎหลัก และ pre-commit",
    questions: [
      mc(
        "d011-q1",
        "ความแตกต่างหลักระหว่าง `uv run ruff check .` กับ `uv run ruff format .` คืออะไร?",
        [
          ["ทั้งสองคำสั่งทำหน้าที่เหมือนกันทุกประการ แค่ชื่อต่างกัน", "ไม่เหมือนกัน — `check` เป็น linter ส่วน `format` เป็น code formatter"],
          ["`ruff check` ตรวจหาปัญหา/bug patterns (เช่น unused import, B006, bare except) ส่วน `ruff format` จัดรูปแบบการเว้นวรรคและขึ้นบรรทัด", "ถูก — ต้องใช้งานทั้งสองคำสั่งคู่กันเพื่อให้โค้ดทั้งปลอดภัยและอ่านง่ายสม่ำเสมอ"],
          ["`ruff format` รัน unit test ให้ด้วย ส่วน `ruff check` ไม่รัน", "Ruff ไม่ใช่ test runner — การรัน unit test เป็นหน้าที่ของ `pytest`"],
          ["`ruff check` ใช้ได้เฉพาะไฟล์ YAML ส่วน `ruff format` ใช้กับ Python", "Ruff ทำงานกับซอร์สโค้ด Python (`.py`, `.pyi`, `.ipynb`)"],
        ],
        "B",
        "`ruff check` คือ linter ที่จับปัญหาเชิงโค้ดและ bug patterns ส่วน `ruff format` คือ formatter ที่จัดสไตล์ให้ตรงกันทั้งทีม",
        "หน้าที่ของ `ruff check` ต่างจาก `ruff format` อย่างไร?",
        "`ruff check` ตรวจจับปัญหา/bug patterns (linting) ส่วน `ruff format` จัดรูปแบบย่อหน้าและบรรทัด (formatting)",
      ),
      mc(
        "d011-q2",
        "กฎ Ruff ตระกูลใดที่ช่วยดักจับกับดักบั๊กจริงใน Python เช่น `def f(items=[]):` (mutable default argument `B006`)?",
        [
          ["`I` (isort)", "`I` ใช้จัดเรียงลำดับบรรทัด `import` เท่านั้น"],
          ["`B` (flake8-bugbear)", "ถูก — ตระกูล `B` รวบรวมรูปแบบโค้ดที่มักก่อให้เกิดบั๊กจริงใน Python"],
          ["`E` (pycodestyle)", "`E` เน้นกติกาความเรียบร้อยพื้นฐานของ PEP 8 ไม่รวม `B006`"],
          ["`UP` (pyupgrade)", "`UP` ช่วยปรับไวยากรณ์เก่าให้ทันสมัยตามเวอร์ชัน Python เช่น `list[str]`"],
        ],
        "B",
        "การเปิด `select = [\"E\", \"F\", \"I\", \"B\", \"UP\"]` ใน `[tool.ruff.lint]` ช่วยให้ได้ทั้งสไตล์สะอาด การเรียง import ไวยากรณ์สมัยใหม่ และการดักบั๊กจาก Bugbear",
        "ใน `[tool.ruff.lint]` กฎตระกูล `E`, `F`, `I`, `B`, `UP` ตัวใดคือชุดดักบั๊ก Bugbear และตัวใดคือเรียง import?",
        "`B` = flake8-bugbear (ดักบั๊กอย่าง mutable default `B006`), `I` = isort (เรียง import)",
      ),
      mc(
        "d011-q3",
        "ใน `.pre-commit-config.yaml` ที่ใช้ `ruff-pre-commit` ควรเรียงลำดับ hook อย่างไร?",
        [
          ["วาง `ruff-format` ก่อน แล้วค่อย `ruff --fix`", "ถ้า `--fix` เปลี่ยนโค้ดทีหลัง อาจทำให้ผลจัดรูปของ `ruff-format` เพี้ยนและต้อง commit ซ้ำ"],
          ["วาง `ruff` (พร้อม `--fix`) ก่อน แล้วตามด้วย `ruff-format`", "ถูก — แก้ lint และเรียง import ให้เรียบร้อยก่อน แล้วค่อยจัดรูปแบบขั้นสุดท้าย"],
          ["เลือกใส่ได้แค่ตัวเดียว ห้ามใช้พร้อมกัน", "ใช้คู่กันได้และเป็นแนวทางแนะนำอย่างเป็นทางการของ Ruff"],
          ["ต้องวาง `pytest` ไว้ใน `ruff-pre-commit` repo", "`ruff-pre-commit` มีเฉพาะ hook ของ Ruff"],
        ],
        "B",
        "การรัน linter (`ruff --fix`) ก่อน formatter (`ruff-format`) รับประกันว่าไฟล์สุดท้ายผ่านทั้งกฎ lint และการจัดรูปแบบในรอบเดียว",
        "ใน `.pre-commit-config.yaml` ควรรัน `ruff --fix` หรือ `ruff-format` ก่อน และเพราะอะไร?",
        "รัน `ruff --fix` ก่อน `ruff-format` เพราะการแก้ lint/เรียง import อาจเปลี่ยนความยาวบรรทัด จึงควรจัดรูปเป็นขั้นตอนสุดท้าย",
      ),
      mc(
        "d011-q4",
        "คำสั่งใดเหมาะสำหรับนำไปใส่ใน GitHub Actions CI เพื่อ **ตรวจสอบโดยไม่แก้ไขไฟล์** และให้ build ล้มเหลวทันทีถ้ามีโค้ดที่ยังไม่จัดรูปแบบ?",
        [
          ["`uv run ruff format .`", "คำสั่งนี้จะแก้ไฟล์ใน CI runner แล้วคืน exit code 0 ทำให้ build ผ่านโดยไม่ได้เตือนผู้พัฒนา"],
          ["`uv run ruff check . && uv run ruff format --check .`", "ถูก — ทั้งคู่ตรวจแบบอ่านอย่างเดียวและคืน exit code ไม่ใช่ 0 ทันทีเมื่อพบปัญหา"],
          ["`uv run ruff check --fix .`", "CI ควรตรวจสอบความถูกต้อง ไม่ควรแอบแก้ไฟล์เงียบ ๆ แล้วปล่อยผ่าน"],
          ["`uv run ruff --version`", "เช็กแค่เวอร์ชัน ไม่ได้ตรวจโค้ดในโปรเจกต์"],
        ],
        "B",
        "ใน CI เราใช้ `ruff check .` คู่กับ `ruff format --check .` เพื่อทำหน้าที่เป็น quality gate ที่เข้มงวดและโปร่งใส",
        "คำสั่ง Ruff คู่ใดที่ควรใช้ใน CI เพื่อให้ build ล้มเหลวทันทีเมื่อมี lint error หรือไฟล์ยังไม่จัดรูป?",
        "`uv run ruff check . && uv run ruff format --check .`",
      ),
    ],
  },

  takeaways: [
    "Ruff รวมทั้ง Linter (`ruff check`) และ Formatter (`ruff format`) ไว้ในเครื่องมือเดียวที่ทำงานเร็วระดับมิลลิวินาที",
    "เก็บ config ไว้ที่จุดเดียวใน `pyproject.toml` (`[tool.ruff]`) โดยเปิดชุดกฎ `[\"E\", \"F\", \"I\", \"B\", \"UP\"]` เพื่อดักทั้ง unused import และบั๊กจริงอย่าง `B006`",
    "ผูก `.pre-commit-config.yaml` โดยวาง `ruff --fix` ก่อน `ruff-format` และใส่ `check-added-large-files` เพื่อกันไฟล์ข้อมูลใหญ่หลุดเข้า Git",
    "ใช้ pre-commit เป็นด่านช่วยเร็วบนเครื่อง และใช้ `ruff check . && ruff format --check .` เป็นด่านบังคับจริงใน CI",
  ],

  reviewCards: [
    rc(
      "d011-rc-1",
      "5 ตระกูลกฎพื้นฐานของ Ruff (`E`, `F`, `I`, `B`, `UP`) แต่ละตัวตรวจอะไร?",
      "`E` = สไตล์ pycodestyle, `F` = Pyflakes (unused/undefined), `I` = เรียง import (isort), `B` = Bugbear (บั๊กยอดฮิตเช่น mutable default), `UP` = อัปเกรดไวยากรณ์ Python รุ่นใหม่",
    ),
    rc(
      "d011-rc-2",
      "ทำไม `def fn(tags: list[str] = []):` ถึงติดกฎ `B006` และวิธีแก้ที่ถูกต้องคืออะไร?",
      "เพราะ Python สร้างลิสต์ default เพียงครั้งเดียวตอนประกาศฟังก์ชัน ทำให้ข้อมูลรั่วข้ามการเรียก → แก้เป็น `tags: list[str] | None = None` แล้วสร้างลิสต์ใหม่ข้างในฟังก์ชัน",
    ),
    rc(
      "d011-rc-3",
      "คำสั่ง Ruff สำหรับรันใน CI ต่างจากคำสั่งรันแก้บนเครื่องอย่างไร?",
      "บนเครื่องใช้ `ruff check --fix .` แล้ว `ruff format .` เพื่อแก้ให้ทันที ส่วนใน CI ใช้ `ruff check . && ruff format --check .` เพื่อ fail ทันทีโดยไม่แก้ไฟล์",
    ),
  ],

  sources: [
    { label: "Ruff Official Docs — Configuring Ruff (`pyproject.toml`)", href: "https://docs.astral.sh/ruff/configuration/" },
    { label: "Ruff Official Docs — Rules Reference (E, F, I, B, UP)", href: "https://docs.astral.sh/ruff/rules/" },
    { label: "Ruff Official Docs — The Ruff Formatter", href: "https://docs.astral.sh/ruff/formatter/" },
    { label: "pre-commit Official Documentation", href: "https://pre-commit.com/" },
  ],

  glossary: [
    "ruff",
    "pre-commit",
    "pyproject",
    "uv",
    "type-hint",
    "reproducibility",
    "fail-fast",
  ],
});
