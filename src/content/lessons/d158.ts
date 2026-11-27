import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D158 — Phase 6 / Block B40
 * Repo Scaffold (uv, Ruff, pytest, docker compose)
 */
export const d158: Lesson = defineLesson({
  day: 158,
  titleTh: "วางโครงสร้าง Repo มาตรฐาน Production ด้วย uv, Ruff, pytest และ Docker Compose",
  tagline: "30 นาที · โครงสร้างโปรเจกต์ที่รันซ้ำได้ทุกเครื่อง · แยกโมดูล Capstone ชัดเจนและบูตฐานข้อมูลในคำสั่งเดียว",
  icon: "package",
  visual: {
    id: "capstone-scaffold-corpus",
    title: "B40 ขั้นที่ 1 — Repo Scaffold ของระบบ Capstone",
    caption: "วางโครงสร้าง src/, tests/, pyproject.toml, uv.lock, Ruff และ Docker Compose ให้พร้อมต่อยอดตลอด 24 วัน",
    alt: "แผนภาพขั้นตอน B40 แสดงส่วน D158 Repo Scaffold ที่ประกอบด้วย uv.lock, Ruff, pytest และ Docker Compose",
  },
  requiresApiKey: false,
  tools: ["uv", "Ruff", "pytest", "Docker Compose", "Pydantic"],

  bigPicture: [
    {
      node: 0,
      heading: "แปลงพิมพ์เขียว ADR เป็นโครงสร้างโค้ดที่แยกหน้าที่ชัดเจน",
      body: "พิมพ์เขียว {{adr}} จาก Day 157 จะไร้พลังหากทุกไฟล์ถูกโยนรวมกันในโฟลเดอร์เดียว จนชั้น API, RAG, MCP และ Eval พันกันยุ่งเหยิงตั้งแต่สัปดาห์แรก",
      lessonNote: "วันนี้เราสร้างโครง `src/` layout ที่แยกโมดูล `ingest/`, `retrieval/`, `agents/`, `mcp/`, `app/` และ `evals/` ออกจากกันตั้งแต่วันที่ 2 ของ Capstone",
    },
    {
      node: 3,
      heading: "ฝัง Quality Gate อัตโนมัติไว้ที่ระดับ Repo",
      body: "โปรเจกต์ที่ไม่มี linter และ test runner ตั้งค่าไว้ตั้งแต่ต้น มักสะสม technical debt และ import พังเมื่อไฟล์เริ่มเกิน 10 ไฟล์",
      lessonNote: "เราตั้งค่า {{ruff}} และ {{pytest}} ใน {{pyproject}} พร้อม {{pre-commit}} hook เพื่อให้ทุก commit ผ่านการตรวจรูปแบบและความถูกต้องภายในไม่กี่วินาที",
    },
    {
      node: 4,
      heading: "จำลองสภาพแวดล้อม Production บนเครื่องด้วย Docker Compose",
      body: "ระบบ {{rag}} องค์กรต้องมีทั้ง API service และฐานข้อมูล vector/metadata ที่คุยกันผ่านเครือข่ายภายในและสตาร์ตตามลำดับที่ปลอดภัย",
      lessonNote: "เราวาง {{dockerfile}} แบบ multi-stage คู่กับ `docker-compose.yml` ที่มี `pgvector` + healthcheck เพื่อให้เพื่อนร่วมทีมหรือผู้สัมภาษณ์บูตระบบได้ด้วยคำสั่งเดียว",
    },
    {
      node: 5,
      heading: "สร้างความสามารถในการรันซ้ำได้ (Reproducibility) ตั้งแต่วันแรก",
      body: "คำว่า *\"เครื่องผมรันได้นะ\"* คือสัญญาณเตือนของโปรเจกต์ที่ขาด {{lockfile}} และ {{env-config}} ที่ชัดเจน",
      lessonNote: "การล็อกเวอร์ชันด้วย {{uv}} (`uv.lock`) และแยกความลับไปไว้ใน `.env` พร้อม `.env.example` ช่วยให้ทั้ง CI และ Cloud Staging รันพฤติกรรมเดียวกัน 100%",
    },
  ],

  objectives: [
    "**ออกแบบโครงสร้างโฟลเดอร์** แบบ `src/` layout ที่รองรับทุกชั้นของ Capstone (`app`, `ingest`, `retrieval`, `mcp`, `agents`, `evals`) โดยไม่เกิด circular import",
    "**ตั้งค่าเครื่องมือคุณภาพ** ใน {{pyproject}} ด้วย {{uv}}, {{lockfile}}, {{ruff}} และ {{pytest}} ให้รันตรวจโค้ดและเทสต์แบบ offline ได้ทันที",
    "**เขียน `docker-compose.yml` และ {{env-config}}** ที่ตรวจค่า environment แบบ {{fail-fast}} และรอฐานข้อมูล `pgvector` พร้อมใช้งานด้วย `healthcheck`",
  ],

  prerequisites: [
    "ผ่าน Day 157 (ADR-001 และ SLA Contract) รวมถึง Docker/Compose พื้นฐานจาก Phase 5 (B36)",
    "ติดตั้ง `uv` และ Python 3.11+ (หรือ 3.12) บนเครื่องเรียบร้อย",
    "มี Docker Desktop หรือ Docker Engine สำหรับทดลองรัน `docker compose` (ส่วนแบบฝึกหัด Python/pytest รันได้แม้ยังไม่เปิด Docker)",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "ต่อยอดจากโฟลเดอร์ `thai-enterprise-assistant/` ที่สร้างไว้ใน Day 157 ให้กลายเป็นโครงสร้างโปรเจกต์ Python ระดับ Production",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p src/app src/ingest src/retrieval src/mcp src/agents evals data/corpus tests docs
touch src/__init__.py src/app/__init__.py src/ingest/__init__.py src/retrieval/__init__.py src/mcp/__init__.py src/agents/__init__.py
uv add pydantic pydantic-settings fastapi uvicorn
uv add --dev pytest pytest-asyncio ruff
uv lock`,
    steps: [
      ["dirs", "สร้างโครงสร้างแพ็กเกจ `src/` (`app`, `ingest`, `retrieval`, `mcp`, `agents`), `evals/`, `data/corpus/` และ `tests/`"],
      ["lock", "เพิ่ม dependencies และรัน `uv lock` เพื่อสร้างไฟล์ `uv.lock` สำเร็จ"],
      ["check", "พร้อมตั้งค่า `pyproject.toml`, `.env.example`, `docker-compose.yml` และรัน `uv run pytest` + `uv run ruff check .`"],
    ],
    note: "หากเครื่องของคุณยังไม่มี Docker เปิดอยู่ สามารถทำแบบฝึกหัดตรวจสอบโครงสร้าง Repo และ `pytest` ให้ผ่าน 100% ก่อน แล้วค่อยทดสอบ `docker compose up` เมื่อพร้อม",
  },

  concepts: [
    {
      id: "src-layout-and-uv",
      title: "1 · src/ Layout, pyproject.toml และ uv.lock เพื่อ Reproducibility",
      paragraphs: [
        "มือใหม่มักวางโค้ดไว้ที่ root ของโปรเจกต์ตรง ๆ (เช่น `main.py`, `rag.py` ข้าง ๆ `tests/`) ซึ่งทำให้เกิดบั๊กคลาสสิก: `pytest` ดัน import โค้ดจาก current directory แทนที่จะ import แพ็กเกจที่ติดตั้งจริงใน {{venv}} พอเอาไปรันใน Docker หรือ CI ก็พังด้วย `ModuleNotFoundError`",
        "การใช้ **`src/` layout** ร่วมกับ {{pyproject}} (ระบุ `build-system` และ `pythonpath = [\"src\"]` หรือติดตั้งแบบ editable ผ่าน {{uv}}) บังคับให้ import เส้นทางเดียวเสมอ และไฟล์ `uv.lock` ({{lockfile}}) จะล็อก hash ของทุกไลบรารีไว้ให้เครื่องของคุณ, GitHub Actions, และ Cloud Server ได้เวอร์ชันตรงกันทุกตัวอักษร",
      ],
      analogy: "เหมือนห้องครัวร้านอาหารที่มีโซนเตรียมวัตถุดิบ, โซนปรุงร้อน, และโซนจัดจานแยกกัน พร้อมสูตรตวงมาตรฐาน (`uv.lock`) — ไม่ว่าเชฟคนไหนเข้ากะก็ปรุงรสชาติออกมาเหมือนกันเป๊ะ",
      bullets: [
        "`src/app/` — FastAPI routes, SSE streaming, PDPA middleware, config",
        "`src/ingest/` & `src/retrieval/` — ตัวโหลดเอกสาร, chunking, PyThaiNLP BM25, Hybrid RRF & Reranker",
        "`src/mcp/` & `src/agents/` — MCP Server (read-only + HITL write) และ LangGraph router",
        "`data/corpus/`, `evals/`, `tests/` — แยกข้อมูลดิบ ชุดทดสอบคุณภาพ และ unit/integration tests ออกจากโค้ดแอป",
      ],
      code: {
        language: "text",
        filename: "pyproject.toml",
        code: `[project]
name = "thai-enterprise-assistant"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["pydantic>=2.7", "pydantic-settings>=2.2", "fastapi>=0.115", "uvicorn>=0.30"]

[dependency-groups]
dev = ["pytest>=8.0", "pytest-asyncio>=0.24", "ruff>=0.6"]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]

[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]
asyncio_mode = "auto"`,
        caption: "รวมการตั้งค่า dependency, Ruff linter และ pytest ไว้จุดเดียวใน pyproject.toml — ลดไฟล์ config กระจัดกระจาย",
      },
      whyTitle: "Why this matters — โครงสร้างสะอาดตั้งแต่วันแรกช่วยประหยัดเวลาหลายสิบชั่วโมง",
      whyParagraphs: [
        "ตลอด Days 161–180 คุณจะต้องเพิ่มทั้ง Hybrid Search, MCP Server, LangGraph, Ragas Eval, และ PDPA Middleware หากแยกโฟลเดอร์ตามหน้าที่ตั้งแต่ Day 158 ทุกฟีเจอร์ใหม่จะมีที่อยู่ชัดเจนและเขียน unit test แยกได้โดยไม่ต้องเปิด database จริง",
        "เมื่อผู้สัมภาษณ์เปิด GitHub repo ของคุณ โครงสร้าง `src/` + `uv.lock` + `pyproject.toml` จะสื่อทันทีว่าคุณทำงานแบบวิศวกรซอฟต์แวร์มืออาชีพ",
      ],
    },
    {
      id: "ruff-pytest-env-gate",
      title: "2 · Ruff, pytest และ Fail-Fast Env Config",
      paragraphs: [
        "ความสม่ำเสมอของโค้ดไม่ควรพึ่งความจำของคนเขียน {{ruff}} ทำหน้าที่ทั้งจัดรูปแบบ (`ruff format`) และตรวจจุดเสี่ยง (`ruff check`: import ไม่ได้ใช้, ตัวแปรลอย, bug-bear patterns `B`) ด้วยความเร็วระดับมิลลิวินาที ส่วน {{pytest}} เป็นตัวพิสูจน์ว่าพฤติกรรมโค้ดไม่พังเมื่อแก้ไฟล์อื่น",
        "ด้านการตั้งค่าค่าลับและโหมดการทำงาน เราใช้ {{env-config}} ผ่าน `pydantic-settings` เพื่ออ่านค่าจาก `.env` และ environment variables แบบ {{fail-fast}} — พร้อมเก็บไฟล์ `.env.example` (ที่มีเฉพาะชื่อตัวแปรและค่าตัวอย่าง ไม่มี secret จริง) ลง Git และใส่ `.env` ไว้ใน `.gitignore` เสมอ",
      ],
      analogy: "Ruff เหมือนเครื่องตรวจไวยากรณ์และระบบไฟก่อนออกรถ, pytest เหมือนสนามทดสอบเบรก, และ `.env.example` เหมือนแบบฟอร์มเปล่าที่บอกคนขับใหม่ว่าต้องเติมช่องไหนบ้างโดยไม่แจกกุญแจจริงให้ใคร",
      bullets: [
        "เปิดโหมด `OFFLINE_MOCK_LLM=true` เป็นค่าเริ่มต้นสำหรับการทดสอบ local และ CI เพื่อรันได้โดยไม่เสียค่า token",
        "ใช้ `SecretStr` หรือ validator ห้ามใส่ key จริงใน `.env.example` และ `git status` ต้องไม่เห็น `.env`",
        "รัน `uv run ruff check . && uv run pytest -q` เป็นนิสัยก่อนทุก `git commit` (หรือผูกใน {{pre-commit}})",
      ],
      whyTitle: "Why this matters — ตรวจเจอปัญหาตั้งแต่บนเครื่อง ก่อนระเบิดบน Cloud",
      whyParagraphs: [
        "การขาดค่า environment เพียงตัวเดียวใน production อาจทำให้ FastAPI สตาร์ตขึ้นมาก่อนแล้วค่อยไป crash กลาง request แรกของลูกค้า การ validate config ตั้งแต่ boot time ช่วยให้เจอทันที",
        "นอกจากนี้ การแยก `LLM_PROVIDER=mock` ออกจาก `openai`/`anthropic` ตั้งแต่ขั้น scaffold ทำให้ชุดเทสต์ B41–B45 รันเร็ว 100% offline",
      ],
    },
    {
      id: "docker-compose-local-stack",
      title: "3 · Docker Compose + Healthcheck เพื่อบูตทั้ง Stack ด้วยคำสั่งเดียว",
      paragraphs: [
        "แอป AI ของเราต้องพึ่งพา Postgres พร้อมส่วนขยาย `pgvector` (สำหรับเก็บ vector และ metadata/ACL) และในระยะถัดไปอาจมี {{langfuse}} หรือ Redis เพิ่มเข้ามา การสั่งรันทีละ container ด้วยมือจึงไม่ยั่งยืน",
        "ใน `docker-compose.yml` และ {{dockerfile}} เราต้องใส่ **2 สิ่งที่มักถูกลืม**: (1) การรอ dependency ด้วย `healthcheck` (`pg_isready`) คู่กับ `depends_on: condition: service_healthy` เพื่อไม่ให้ FastAPI พังเพราะต่อ DB ก่อน Postgres พร้อม, และ (2) การรัน container ด้วย **non-root user** พร้อม multi-stage build จากภาพ `python:3.12-slim` + `uv` เพื่อให้อิมเมจเล็กและปลอดภัย",
      ],
      analogy: "เหมือนการเปิดร้านอาหารที่มีลำดับชัดเจน: ต้องจุดเตาและเช็กว่าไฟติดเสถียร (`service_healthy`) ก่อนเปิดรับออเดอร์หน้าร้าน (`api`) ไม่ใช่เปิดประตูรับลูกค้าทั้งที่ครัวยังไม่ติดไฟ",
      code: {
        language: "yaml",
        filename: "docker-compose.yml",
        code: `services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-capstone}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-capstone_dev}
      POSTGRES_DB: \${POSTGRES_DB:-enterprise_ai}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-capstone} -d \${POSTGRES_DB:-enterprise_ai}"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    env_file:
      - .env.example
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz')"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  pgdata:`,
        caption: "ใช้ condition: service_healthy ให้ Postgres พร้อมรับการเชื่อมต่อจริงก่อนที่ api service จะเริ่มทำงาน",
      },
      whyTitle: "Why this matters — 1-Command Local Stack คือมาตรฐานพอร์ตโฟลิโอ",
      whyParagraphs: [
        "ผู้รีวิวโปรเจกต์หรือ HR ทางเทคนิคแทบไม่เคยมีเวลาตั้ง Postgres เองทีละขั้น ถ้าโปรเจกต์คุณรัน `docker compose up --build` แล้วใช้งาน `/healthz` ได้เลย โอกาสผ่านการคัดเลือกจะสูงขึ้นทันที",
        "และโครง `docker-compose.yml` ชุดนี้จะถูกใช้ต่อเนื่องไปจนถึง Day 175 (Containerize & Deploy Staging) และ Day 180 (Final Demo)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก npm/pnpm + ESLint + Compose สู่ Python AI Stack",
      body: [
        "ถ้าคุณมาจากสาย Node.js / Next.js / NestJS เครื่องมือในวันนี้แทบจะเป็นฝาแฝดกันทั้งหมด เพียงเปลี่ยนชุดคำสั่งให้เข้ากับระบบนิเวศ Python สำหรับงาน AI",
      ],
      table: [
        ["uv + pyproject.toml + uv.lock", "pnpm / npm + package.json + pnpm-lock.yaml"],
        ["Ruff (check + format)", "ESLint + Prettier (รวมในตัวเดียวที่เร็วกว่ามาก)"],
        ["pytest + pytest-asyncio", "Vitest / Jest"],
        ["pydantic-settings (.env)", "zod env validation + dotenv"],
        ["docker-compose.yml + pgvector", "Postgres local stack สำหรับ Prisma/Drizzle"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมไฟล์ `main.py` เดียวถึงไม่พอสำหรับ Capstone",
      body: [
        "ในงานส่งอาจารย์ขนาดเล็ก เรามักเขียนโค้ดทั้งหมดลงในไฟล์ `main.py` เดียวและติดตั้งไลบรารีด้วย `pip install` ตรง ๆ ซึ่งใช้ได้ดีสำหรับสคริปต์ 100 บรรทัด",
        "แต่โปรเจกต์ระดับองค์กรที่มีทั้งฐานข้อมูล, ตัวค้นหาภาษาไทย, API, และชุดทดสอบ 40 ข้อ ถ้าไม่แยกโฟลเดอร์และล็อกเวอร์ชันด้วย `uv.lock` แค่แก้ไฟล์เดียวอาจทำส่วนอื่นพังโดยไม่รู้ตัว",
      ],
    },
  },

  workedExample: {
    intro:
      "มาสร้างตัวตรวจสอบความสมบูรณ์ของ Repo Scaffold แบบอัตโนมัติ (ใช้แค่ Python มาตรฐาน `tomllib` + `pathlib` + `pydantic`) เพื่อตรวจ `pyproject.toml`, `docker-compose.yml`, และ `.env.example` ก่อนเริ่มเตรียมเอกสารใน Day 159 กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · สร้าง Config Schema แบบ Fail-Fast สำหรับแอป Capstone",
        explain:
          "นิยาม `AppSettings` ที่บังคับค่าเริ่มต้นปลอดภัย (`llm_mode` เป็น `mock` หรือ `live`, ถ้าเป็น `live` ต้องมี `llm_api_key` ไม่ว่าง) เพื่อตรวจจับ config ผิดพลาดตั้งแต่ตอนบูต",
        code: {
          language: "python",
          filename: "worked_scaffold.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field, model_validator


class AppSettings(BaseModel):
    app_env: Literal["local", "staging", "prod"] = "local"
    llm_mode: Literal["mock", "live"] = "mock"
    llm_api_key: str = ""
    database_url: str = Field(min_length=12)
    top_k: int = Field(default=5, ge=1, le=20)

    @model_validator(mode="after")
    def require_key_when_live(self) -> "AppSettings":
        if self.llm_mode == "live" and not self.llm_api_key.strip():
            raise ValueError("llm_api_key is required when llm_mode='live'")
        return self


ok_cfg = AppSettings(database_url="postgresql://capstone:dev@postgres:5432/enterprise_ai")
print(f"Boot OK | env={ok_cfg.app_env} | llm_mode={ok_cfg.llm_mode} | top_k={ok_cfg.top_k}")`,
        },
        output: `Boot OK | env=local | llm_mode=mock | top_k=5`,
      },
      {
        title: "2 · ตรวจ `pyproject.toml` ด้วย `tomllib` ว่ามี Ruff และ pytest ครบ",
        explain:
          "ใช้ `tomllib` (มากับ Python 3.11+) อ่าน `pyproject.toml` แล้วเช็กว่าตั้งค่า `[tool.ruff]` และ `[tool.pytest.ini_options]` ไว้เรียบร้อย",
        code: {
          language: "python",
          filename: "worked_scaffold.py",
          code: `import tomllib

SAMPLE_TOML = """
[project]
name = "thai-enterprise-assistant"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["pydantic>=2.7", "fastapi>=0.115"]

[tool.ruff]
line-length = 100

[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]
"""

data = tomllib.loads(SAMPLE_TOML)
has_ruff = "ruff" in data.get("tool", {})
has_pytest = "pytest" in data.get("tool", {})
has_src_path = "src" in data.get("tool", {}).get("pytest", {}).get("pythonpath", [])
print(f"pyproject valid | ruff={has_ruff} | pytest={has_pytest} | src_pythonpath={has_src_path}")`,
        },
        output: `pyproject valid | ruff=True | pytest=True | src_pythonpath=True`,
      },
      {
        title: "3 · ตรวจความปลอดภัย `.env.example` ไม่ให้เผลอหลุด API Key จริง",
        explain:
          "ก่อน commit โค้ดทุกครั้ง สคริปต์ควรสแกนไฟล์ตัวอย่างอย่าง `.env.example` เพื่อรับประกันว่าไม่มี token จริงอย่าง `sk-...` หรือ `pk-lf-...` หลุดลง Git",
        code: {
          language: "python",
          filename: "worked_scaffold.py",
          code: `import re

SECRET_PATTERNS = [re.compile(r"sk-[A-Za-z0-9]{16,}"), re.compile(r"pk-lf-[A-Za-z0-9]{12,}")]


def find_exposed_secrets(env_example_text: str) -> list[str]:
    hits = []
    for line in env_example_text.splitlines():
        if any(pat.search(line) for pat in SECRET_PATTERNS):
            hits.append(line.split("=", 1)[0].strip())
    return hits


clean = "LLM_MODE=mock\nOPENAI_API_KEY=your-key-here\n"
leaked = "LLM_MODE=live\nOPENAI_API_KEY=sk-proj1234567890abcdef\n"
print("clean:", find_exposed_secrets(clean))
print("leaked:", find_exposed_secrets(leaked))`,
        },
        output: `clean: []
leaked: ['OPENAI_API_KEY']`,
      },
    ],
    gotcha:
      "จุดสังเกต: อย่าใช้ `env_file: .env` แบบบังคับใน `docker-compose.yml` โดยไม่มีไฟล์ fallback หรือ `.env.example` เพราะใครที่ clone repo ใหม่มาลองรัน `docker compose up` จะเจอ error ทันทีว่าหา `.env` ไม่เจอ",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/scaffold_validator.py` สำหรับตรวจสอบความพร้อมของโครงสร้าง Repo Scaffold (`pyproject.toml`, `docker-compose.yml`, โครงสร้างโฟลเดอร์, และความปลอดภัย `.env.example`) แบบอัตโนมัติใน CI",
    requirements: [
      "สร้าง `ScaffoldReport(BaseModel)` ที่มี `missing_paths: list[str]`, `has_ruff_config: bool`, `has_pytest_src_path: bool`, `compose_has_healthcheck: bool`, `leaked_secret_keys: list[str]`, และ `passed: bool`",
      "สร้าง `audit_pyproject(toml_text: str) -> tuple[bool, bool]` ใช้ `tomllib.loads` คืน `(has_ruff_config, has_pytest_src_path)` โดยตรวจว่า `[tool.ruff]` มีอยู่ และ `[tool.pytest.ini_options].pythonpath` มี `\"src\"` (หาก TOML syntax ผิด ให้คืน `(False, False)`)",
      "สร้าง `audit_compose(compose_text: str) -> bool` ตรวจว่ามีบริการฐานข้อมูล (`pgvector` หรือ `postgres`), มี `healthcheck:`, และมี `service_healthy` เพื่อรอ DB พร้อมก่อนเปิด API",
      "สร้าง `audit_repo_scaffold(existing_paths: set[str], toml_text: str, compose_text: str, env_example_text: str) -> ScaffoldReport` ตรวจหา path ที่ขาดจากชุดบังคับ (`{\"pyproject.toml\", \"uv.lock\", \"docker-compose.yml\", \".env.example\", \"src\", \"tests\", \"data/corpus\", \"evals\"}`), ตรวจ secret pattern (`sk-[A-Za-z0-9]{16,}` หรือ `ghp_[A-Za-z0-9]{16,}`), และตั้ง `passed = True` เฉพาะเมื่อไม่มี `missing_paths`, `has_ruff_config`, `has_pytest_src_path`, `compose_has_healthcheck` เป็นจริงทั้งหมด และ `leaked_secret_keys` ว่าง",
    ],
    starter: {
      language: "python",
      filename: "src/scaffold_validator.py",
      code: `import re
import tomllib
from pydantic import BaseModel

REQUIRED_PATHS = {
    "pyproject.toml",
    "uv.lock",
    "docker-compose.yml",
    ".env.example",
    "src",
    "tests",
    "data/corpus",
    "evals",
}


class ScaffoldReport(BaseModel):
    missing_paths: list[str]
    has_ruff_config: bool
    has_pytest_src_path: bool
    compose_has_healthcheck: bool
    leaked_secret_keys: list[str]
    passed: bool


def audit_pyproject(toml_text: str) -> tuple[bool, bool]:
    # TODO: parse ด้วย tomllib.loads และตรวจ [tool.ruff] + [tool.pytest.ini_options].pythonpath
    raise NotImplementedError


def audit_compose(compose_text: str) -> bool:
    # TODO: ตรวจว่ามี postgres/pgvector, healthcheck: และ service_healthy
    raise NotImplementedError


def audit_repo_scaffold(
    existing_paths: set[str],
    toml_text: str,
    compose_text: str,
    env_example_text: str,
) -> ScaffoldReport:
    # TODO: รวมผลตรวจทั้งหมดเป็น ScaffoldReport
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_scaffold_validator.py",
      code: `from src.scaffold_validator import REQUIRED_PATHS, audit_compose, audit_pyproject, audit_repo_scaffold

VALID_TOML = """
[project]
name = "thai-enterprise-assistant"
version = "0.1.0"

[tool.ruff]
line-length = 100

[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]
"""

VALID_COMPOSE = """
services:
  postgres:
    image: pgvector/pgvector:pg16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
  api:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
"""


def test_complete_scaffold_passes():
    report = audit_repo_scaffold(
        existing_paths=set(REQUIRED_PATHS),
        toml_text=VALID_TOML,
        compose_text=VALID_COMPOSE,
        env_example_text="LLM_MODE=mock\nOPENAI_API_KEY=your-key-here\n",
    )
    assert report.passed is True
    assert report.missing_paths == []
    assert report.leaked_secret_keys == []


def test_missing_lockfile_and_corpus_dir_fails():
    incomplete = set(REQUIRED_PATHS) - {"uv.lock", "data/corpus"}
    report = audit_repo_scaffold(
        existing_paths=incomplete,
        toml_text=VALID_TOML,
        compose_text=VALID_COMPOSE,
        env_example_text="LLM_MODE=mock\n",
    )
    assert report.passed is False
    assert report.missing_paths == ["data/corpus", "uv.lock"]


def test_missing_pytest_src_path_or_ruff_fails():
    bad_toml = "[project]\nname = 'x'\n[tool.pytest.ini_options]\ntestpaths = ['tests']\n"
    has_ruff, has_src = audit_pyproject(bad_toml)
    assert has_ruff is False
    assert has_src is False


def test_compose_without_service_healthy_fails():
    naive_compose = "services:\n  postgres:\n    image: postgres:16\n  api:\n    depends_on:\n      - postgres\n"
    assert audit_compose(naive_compose) is False


def test_exposed_api_key_in_env_example_fails():
    report = audit_repo_scaffold(
        existing_paths=set(REQUIRED_PATHS),
        toml_text=VALID_TOML,
        compose_text=VALID_COMPOSE,
        env_example_text="OPENAI_API_KEY=sk-testsecretkey12345678\n",
    )
    assert report.passed is False
    assert report.leaked_secret_keys == ["OPENAI_API_KEY"]
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_scaffold_validator.py` แล้วผ่านครบทั้ง 5 test cases",
      "รัน `uv run ruff check .` บนโปรเจกต์ `thai-enterprise-assistant` แล้วไม่พบ warning หรือ error",
      "ตรวจสอบว่าโฟลเดอร์จริงบนเครื่องมี `src/`, `tests/`, `docs/`, `data/corpus/`, `evals/`, `uv.lock`, `.env.example`, และ `docker-compose.yml` ครบถ้วน",
      "ลองรัน `docker compose config` (ถ้ามี Docker) เพื่อยืนยันว่า `docker-compose.yml` syntax ถูกต้อง",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_scaffold_validator.py` และ `uv run ruff check .` คืน exit code 0",
    hints: [
      {
        body: "ใน `audit_pyproject` ให้ครอบ `tomllib.loads(toml_text)` ด้วย `try ... except tomllib.TOMLDecodeError:` และตรวจ `tool = data.get(\"tool\", {})` จากนั้นเช็ก `\"ruff\" in tool` และ `\"src\" in tool.get(\"pytest\", {}).get(\"ini_options\", {}).get(\"pythonpath\", [])`",
      },
      {
        body: "ใน `audit_compose` ให้เช็กว่าข้อความมีทั้งคำว่า `postgres` (หรือ `pgvector`), `healthcheck:`, และ `service_healthy` และใน `audit_repo_scaffold` อย่าลืม `sorted(REQUIRED_PATHS - existing_paths)` เพื่อให้ `missing_paths` เรียงลำดับสม่ำเสมอ",
      },
      {
        body: "ตัวอย่างโครงร่างของ `audit_repo_scaffold` และการสแกน secret — เติม `audit_pyproject` และ `audit_compose` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `SECRET_RES = [
    re.compile(r"sk-[A-Za-z0-9]{16,}"),
    re.compile(r"ghp_[A-Za-z0-9]{16,}"),
]


def audit_repo_scaffold(
    existing_paths: set[str],
    toml_text: str,
    compose_text: str,
    env_example_text: str,
) -> ScaffoldReport:
    missing = sorted(REQUIRED_PATHS - existing_paths)
    has_ruff, has_src = audit_pyproject(toml_text)
    compose_ok = audit_compose(compose_text)
    leaked: list[str] = []
    for line in env_example_text.splitlines():
        if "=" in line and any(p.search(line) for p in SECRET_RES):
            leaked.append(line.split("=", 1)[0].strip())
    passed = not missing and has_ruff and has_src and compose_ok and not leaked
    return ScaffoldReport(
        missing_paths=missing,
        has_ruff_config=has_ruff,
        has_pytest_src_path=has_src,
        compose_has_healthcheck=compose_ok,
        leaked_secret_keys=leaked,
        passed=passed,
    )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_scaffold_validator.py
uv run ruff check .`,
      caption: "รันจาก root ของโปรเจกต์ `thai-enterprise-assistant/`",
    },
  },

  mistakes: [
    {
      title: "ไม่ใช้ `uv.lock` และเขียนแค่ `fastapi` โดยไม่ล็อกสภาพแวดล้อม",
      symptom: "รันบนเครื่องตัวเองผ่าน แต่พอเอาไปรันบน GitHub Actions หรือเครื่องเพื่อนแล้ว library เวอร์ชันใหม่เปลี่ยน API จนพัง",
      fix: "รัน `uv lock` และ commit ไฟล์ `uv.lock` ลง Git ทุกครั้งที่เพิ่มหรืออัปเดต dependency",
    },
    {
      title: "ลืมใส่ `healthcheck` + `condition: service_healthy` ใน `docker-compose.yml`",
      symptom: "สั่ง `docker compose up` แล้ว container `api` รีบสตาร์ตก่อน `postgres` จะพร้อมรับ connection ทำให้ crash วนลูป",
      fix: "ใส่ `healthcheck` ให้ Postgres (`pg_isready`) และตั้ง `depends_on: postgres: condition: service_healthy` ที่บริการ `api`",
    },
    {
      title: "ตั้งชื่อโมดูลหรือรัน `pytest` โดยไม่กำหนด `pythonpath = [\"src\"]`",
      symptom: "`pytest` โวยว่า `ModuleNotFoundError: No module named 'src'` หรือ `No module named 'app'` เวลาเปลี่ยนโฟลเดอร์รัน",
      fix: "กำหนด `pythonpath = [\"src\"]` และ `testpaths = [\"tests\"]` ใน `[tool.pytest.ini_options]` ของ `pyproject.toml`",
    },
    {
      title: "เผลอใส่ API Key จริงใน `.env.example` หรือ commit ไฟล์ `.env` ลง Git",
      symptom: "GitHub Secret Scanning แจ้งเตือนหรือ API key รั่วไหลสู่สาธารณะ",
      fix: "ใส่ `.env` ใน `.gitignore` ตั้งแต่วันแรก ใช้ `.env.example` เฉพาะค่าตัวอย่าง และมี automated test สแกน secret pattern",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d158-q1",
        "เหตุใดโปรเจกต์ Python AI ระดับ Production จึงนิยมใช้ **`src/` layout** คู่กับ `pyproject.toml` และ `uv.lock` แทนการวางไฟล์ทั้งหมดไว้ที่ root?",
        [
          ["เพราะ Python 3.11+ บังคับให้ทุกโปรเจกต์ต้องมีโฟลเดอร์ `src/` มิฉะนั้นรันไม่ได้", "ไม่จริง — Python ไม่ได้บังคับ แต่ `src/` เป็น best practice ของแพ็กเกจมาตรฐาน"],
          ["เพื่อแยกซอร์สโค้ดออกจากไฟล์ config/tests, ป้องกันปัญหา import ผิดตัวใน local path, และให้ `uv.lock` รับประกันเวอร์ชันตรงกันทุกเครื่อง", "ถูก — ช่วยให้โครงสร้างแยกสัดส่วนชัดเจนและ reproducible ทั้งบนเครื่อง, CI และ Docker"],
          ["เพื่อทำให้ขนาดของ Docker image ลดลงเหลือ 0 MB", "โครง `src/` ไม่ได้ลดขนาด image เป็น 0 MB แต่ multi-stage build + slim base image ต่างหากที่ช่วยลดขนาด"],
          ["เพื่อหลีกเลี่ยงไม่ต้องเขียน `pytest` ในโปรเจกต์", "ตรงข้าม — `src/` layout ทำให้การจัดโครง `tests/` แยกจากซอร์สโค้ดและรัน `pytest` สะอาดขึ้น"],
        ],
        "B",
        "`src/` layout ป้องกันความสับสนระหว่างแพ็กเกจที่ติดตั้งใน environment กับไฟล์ที่ root และ `uv.lock` ล็อก dependency tree ให้ทุกสภาพแวดล้อมตรงกัน",
        "ข้อดีหลักของการใช้ `src/` layout ร่วมกับ `uv.lock` ในโปรเจกต์ Capstone คืออะไร?",
        "แยกซอร์สโค้ดออกจากไฟล์ config/tests ลดปัญหา import สับสน และล็อกเวอร์ชัน dependency ให้รันซ้ำได้เหมือนกันทุกเครื่องและ CI",
      ),
      mc(
        "d158-q2",
        "ใน `docker-compose.yml` การใส่แค่ `depends_on: [postgres]` (แบบสั้น) มักเกิดปัญหาใดเวลาบูต `api` คู่กับ `pgvector`?",
        [
          ["Docker จะไม่ยอมดาวน์โหลด image `pgvector`", "Docker ดาวน์โหลด image ได้ตามปกติ แต่ไม่รู้จังหวะที่ DB พร้อมรับ connection"],
          ["Docker รอแค่ container `postgres` 'เริ่มรัน' แต่ยังไม่รอให้ฐานข้อมูลเปิดพอร์ตพร้อมรับการเชื่อมต่อจริง ทำให้ `api` พังตอน startup", "ถูก — ต้องใช้ `healthcheck` คู่กับ `condition: service_healthy` เพื่อรอให้ `pg_isready` ผ่านก่อน"],
          ["ทำให้ `api` ไม่สามารถเข้าถึง environment variables ใน `.env` ได้", "การส่ง env vars ไม่ได้ขึ้นกับรูปแบบ `depends_on`"],
          ["ทำให้ข้อมูลใน Postgres หายทันทีแม้จะมี `volumes`", "การหายของข้อมูลขึ้นกับการผูก volume ไม่ใช่ `depends_on`"],
        ],
        "B",
        "`depends_on` แบบ list รอเพียง container start เท่านั้น ไม่ได้รอให้ Postgres init database เสร็จ จึงต้องพึ่ง `healthcheck` + `condition: service_healthy`",
        "ทำไมต้องใช้ `healthcheck` คู่กับ `condition: service_healthy` ใน `docker-compose.yml`?",
        "เพราะ `depends_on` แบบปกติรอแค่ container เริ่มทำงาน ไม่ได้รอให้ฐานข้อมูลพร้อมรับ query จึงต้องใช้ `healthcheck` (`pg_isready`) กัน `api` crash ตอนบูต",
      ),
      mc(
        "d158-q3",
        "การตั้งค่า `llm_mode: Literal[\"mock\", \"live\"] = \"mock\"` พร้อม `@model_validator` ที่บังคับต้องมี `llm_api_key` เมื่อ `llm_mode == \"live\"` สอดคล้องกับหลักการวิศวกรรมใด?",
        [
          ["Fail-Fast Configuration Validation และ Offline Testability", "ถูก — ถ้า config ผิดให้พังทันทีตอน boot พร้อมเปิดทางให้ local/CI รันในโหมด mock ได้โดยไม่ต้องใช้ API key"],
          ["Prompt Injection Mitigation", "การตรวจ API key ตอน startup ไม่ใช่กลไกป้องกัน prompt injection"],
          ["Hybrid Search Reciprocal Rank Fusion", "RRF เป็นสูตรรวมอันดับการค้นหา ไม่เกี่ยวกับการโหลด config"],
          ["Model Quantization", "Quantization คือการลดบิตน้ำหนักโมเดล ไม่ใช่การตั้งค่า env"],
        ],
        "A",
        "การตรวจสอบ environment ตั้งแต่เริ่มบูตด้วย Pydantic (`fail-fast`) ช่วยป้องกัน runtime crash กลางทาง ส่วน `mock` mode ช่วยให้เทสต์ CI รันได้ฟรีและรวดเร็ว",
        "เหตุใดการออกแบบ Settings ให้รองรับ `llm_mode = \"mock\"` และตรวจ `llm_api_key` ตอน boot เมื่อเป็น `\"live\"` จึงสำคัญ?",
        "ช่วยตรวจ config ผิดพลาดแบบ fail-fast ตั้งแต่แอปเริ่มทำงาน และทำให้ unit/CI tests รันโหมด mock ได้ 100% offline",
      ),
      mc(
        "d158-q4",
        "ไฟล์ใดต่อไปนี้ **ห้าม** commit ลง Git repository เด็ดขาด แต่ควรเก็บเฉพาะไฟล์แม่แบบที่ไม่มีรหัสลับจริงแทน?",
        [
          ["`pyproject.toml`", "`pyproject.toml` ต้อง commit ลง Git เพื่อให้ทีมรู้ dependencies และการตั้งค่า Ruff/pytest"],
          ["`uv.lock`", "`uv.lock` ต้อง commit ลง Git เพื่อรับประกัน reproducibility"],
          ["`.env` ที่มี API key และรหัสผ่านจริง (ควร commit เฉพาะ `.env.example`)", "ถูก — `.env` ต้องอยู่ใน `.gitignore` เสมอ และเก็บ `.env.example` ที่ใส่ค่า placeholder ไว้เป็นคู่มือ"],
          ["`docker-compose.yml`", "`docker-compose.yml` ต้อง commit ลง Git เพื่อให้ทุกคนรัน local stack ได้"],
        ],
        "C",
        "`.env` มักบรรจุ API keys และ credentials จริง จึงต้องใส่ใน `.gitignore` และแชร์เฉพาะ `.env.example` ที่มีค่าจำลองแทน",
        "ในโปรเจกต์ Git ควรจัดการกับไฟล์ `.env` และ `.env.example` อย่างไร?",
        "ใส่ `.env` ใน `.gitignore` เสมอเพื่อไม่ให้ secrets รั่วไหล และ commit เฉพาะ `.env.example` ที่มีชื่อตัวแปรกับค่า placeholder",
      ),
    ],
  },

  takeaways: [
    "แยกโครงสร้าง Capstone เป็น `src/` layout (`app`, `ingest`, `retrieval`, `mcp`, `agents`) คู่กับ `evals/`, `data/corpus/`, `tests/` และล็อกเวอร์ชันด้วย {{uv}} + {{lockfile}}",
    "รวมการตั้งค่า {{ruff}} และ {{pytest}} ไว้ใน {{pyproject}} เพื่อเป็น quality gate ที่รันซ้ำได้ในเสี้ยววินาที",
    "ใช้ {{env-config}} แบบ {{fail-fast}} ที่รองรับโหมด `mock` สำหรับ offline CI และห้าม commit `.env` ที่มี secret จริง",
    "เขียน `docker-compose.yml` ที่มี `healthcheck` (`pg_isready`) + `condition: service_healthy` และ {{dockerfile}} non-root เพื่อให้บูต stack ได้ด้วยคำสั่งเดียว",
  ],

  reviewCards: [
    rc(
      "d158-rc-1",
      "เหตุใดใน `pyproject.toml` ของโปรเจกต์ `src/` layout จึงนิยมกำหนด `pythonpath = [\"src\"]` ใน `[tool.pytest.ini_options]`?",
      "เพื่อให้ pytest มองเห็นแพ็กเกจภายใน `src/` ได้ตรงกันทุกเครื่องและใน CI โดยไม่พึ่งการวางไฟล์ปนกันที่ root",
    ),
    rc(
      "d158-rc-2",
      "ใน `docker-compose.yml` การใส่ `depends_on` แบบ `condition: service_healthy` ดีกว่าแบบรายชื่อเฉย ๆ อย่างไร?",
      "แบบรายชื่อรอแค่ container ฐานข้อมูล start แต่ `service_healthy` รอจน healthcheck (`pg_isready`) ผ่านจริง ลดอาการ API crash ตอนบูต",
    ),
    rc(
      "d158-rc-3",
      "การออกแบบ `AppSettings` สำหรับโปรเจกต์ AI ควรแยกโหมด mock กับ live อย่างไร?",
      "ตั้งค่า default เป็นโหมด mock สำหรับ local/CI offline tests และใช้ validator บังคับให้ต้องมี API key ทันทีแบบ fail-fast เมื่อตั้งโหมด live",
    ),
  ],

  sources: [
    { label: "uv Documentation — Working on Projects & Lockfiles", href: "https://docs.astral.sh/uv/concepts/projects/" },
    { label: "Ruff Documentation — Configuration & Rules", href: "https://docs.astral.sh/ruff/" },
    { label: "Docker Compose Docs — Control Startup Order (healthcheck)", href: "https://docs.docker.com/compose/how-tos/startup-order/" },
    { label: "Pydantic Settings Documentation", href: "https://docs.pydantic.dev/latest/concepts/pydantic_settings/" },
  ],

  glossary: ["uv", "pyproject", "lockfile", "ruff", "pytest", "dockerfile", "env-config", "reproducibility", "pre-commit", "fail-fast"],
});
