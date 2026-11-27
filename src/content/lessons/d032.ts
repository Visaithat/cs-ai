import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D032 — Phase 1 / Block B08 (Checkpoint Day)
 * Phase 1 Demo, Code Review Checklist & Cumulative Quiz (B01–B08) + Bridge to Phase 2.
 */
export const d032: Lesson = defineLesson({
  day: 32,
  titleTh: "Checkpoint Phase 1: เดโมผลงาน, Code Review Checklist และควิซประมวลผล B01–B08",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · ตรวจความพร้อม Portfolio Milestone #1 ตามเกณฑ์วิศวกรรม ทบทวนรวม 32 วัน และเปิดประตูสู่ Phase 2 (Polars/DuckDB/ML)",
  icon: "award",
  visual: {
    id: "phase1-capstone-arch",
    title: "Phase 1 Checkpoint — ตรวจความพร้อมก่อนก้าวสู่ Phase 2 (Data & ML)",
    caption:
      "คลิกตรวจเช็กครบทุกชั้นของ Resilient Async Data Fetcher CLI ตาม Engineering Code Review Checklist",
    alt: "แผนภาพตรวจสอบความพร้อม Phase 1 Checkpoint",
  },
  requiresApiKey: false,
  tools: ["uv", "Pydantic v2", "httpx", "tenacity", "asyncio", "Typer", "SQLite", "structlog", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "ปิดรอบ Portfolio Milestone #1 ด้วยมาตรฐานวิศวกรรมจริง",
      body: "โค้ดที่รันผ่านแค่บนเครื่องผู้เขียนยังไม่ใช่ผลงานระดับ production — ทีมวิศวกรรมวัดความพร้อมจาก reproducibility, ความปลอดภัยของ secrets, การจัดการ error และคุณภาพเทสต์",
      lessonNote:
        "วันนี้เราตรวจ Resilient Async Data Fetcher CLI ผ่าน **6-Point Engineering Code Review Checklist** ก่อนก้าวเข้าสู่ Phase 2",
    },
    {
      node: 1,
      heading: "ส่งมอบข้อมูลสะอาด (`output.jsonl`) เข้าสู่ท่อ Data & ML ใน Phase 2",
      body: "ตลอด Phase 1 คุณสร้างเครื่องมือดึงและคัดกรองข้อมูลที่เชื่อถือได้แล้ว ใน Phase 2 (Day 33–60) เราจะนำไฟล์ JSONL ที่สะอาดนี้เข้าสู่ {{polars}}, {{duckdb}} และ Classical ML",
      lessonNote:
        "ไฟล์ `output.jsonl` ที่ผ่าน Pydantic validation ในวันนี้คืออินพุตพร้อมใช้สำหรับ `polars.read_ndjson()` ใน Day 33 ทันที",
    },
    {
      node: 3,
      heading: "วัดความครอบคลุมด้วย Automated Quality Gate (pytest + coverage + Ruff)",
      body: "ก่อน merge โค้ดหรือเผยแพร่พอร์ตโฟลิโอ ต้องมีคำสั่งชุดเดียวที่ทั้งคนอื่นและ CI รันแล้วได้ผลเหมือนกัน 100%",
      lessonNote:
        "วันนี้คุณจะได้สร้าง **Phase 1 Readiness Auditor** ตรวจ repo อัตโนมัติและทำ Cumulative Quiz ครอบคลุม Block B01–B08",
    },
    {
      node: 5,
      heading: "สรุป Error Log และสร้างนิสัยการทบทวนแบบ Spaced Repetition",
      body: "จุดอ่อนที่มักหลุดในระบบจริง เช่น ลืม timeout, เผลอ block Event Loop หรือหลุด commit `.env` จะลดลงอย่างมากเมื่อถูกบันทึกและทบทวนอย่างเป็นระบบ",
      lessonNote:
        "ปิดท้ายด้วยควิซรวม 8 บล็อกและการ์ดทบทวนเพื่อปักหมุดความรู้ Phase 1 ให้แน่นก่อนขึ้น Phase 2",
    },
  ],

  objectives: [
    "**ตรวจสอบผลงาน Phase 1 Milestone (`Resilient Async Data Fetcher CLI`)** ตาม Engineering Code Review Checklist 6 ด้าน: {{reproducibility}}, `.env` hygiene, timeouts/retries, bounded concurrency, coverage ≥ 90% และ {{ruff}} clean",
    "**ประเมินความเข้าใจเชิงบูรณาการ (Cumulative Recall)** ครบทั้ง 8 บล็อกของ Phase 1 (B01–B08) ตั้งแต่ `uv` + Pydantic จนถึง `asyncio`, `Typer` และ `SQLite` cache",
    "**สร้างสคริปต์ตรวจสอบความพร้อมอัตโนมัติ (Phase 1 Readiness Auditor)** และเชื่อมโยงผลลัพธ์ `output.jsonl` เข้าสู่เครื่องมือ Phase 2 ({{polars}} และ {{duckdb}})",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน Block B01–B08 (โดยเฉพาะ Day 29–31 ของ Resilient Async Data Fetcher CLI)",
    "มี `uv`, `pydantic`, `pytest`, `pytest-cov` และ `ruff` พร้อมใช้งานบนเครื่อง",
    "ไม่ต้องใช้ API key — ตรวจเช็ก repo เดโม และทำควิซบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "เปิดโฟลเดอร์โปรเจกต์ `resilient-fetcher` ของคุณ (หรือโฟลเดอร์ฝึกปฏิบัติ Day 32) เพื่อรันชุดคำสั่ง Quality Gate ครบชุดในรอบเดียว",
    commands: `# รัน Quality Gate ครบชุดของ Phase 1 Milestone
uv sync --frozen
uv run ruff check .
uv run ruff format --check .
uv run pytest -W error --cov --cov-report=term-missing`,
    steps: [
      ["sync", "ตรวจสอบ {{reproducibility}} ด้วย `uv sync --frozen` (ต้องมี {{lockfile|uv.lock}} ตรงกับ `pyproject.toml`)"],
      ["lint", "รัน `uv run ruff check .` และ `uv run ruff format --check .` จนได้ 0 issues"],
      ["test", "รัน `uv run pytest -W error --cov` โดยผ่านทุกข้อแบบ offline และได้ coverage ≥ 90%"],
    ],
    note: "วัน Checkpoint ออกแบบตามจังหวะ 30 นาที: ทำ Cumulative Quiz ก่อน 10 นาที → รัน Audit & Demo เช็กลิสต์บนเครื่อง 15 นาที → บันทึกจุดที่ต้องย้ำเข้า Error Log 5 นาที",
  },

  concepts: [
    {
      id: "phase1-code-review-rubric",
      title: "1 · Engineering Code Review Checklist 6 ด้านของ Phase 1 Milestone",
      paragraphs: [
        "ก่อนกดแท็ก `v0.1.0` หรือส่งลิงก์ GitHub ให้ผู้สัมภาษณ์ดู วิศวกร AI จะตรวจผลงานตัวเองด้วย **Code Review Rubric 6 ด้าน** ไม่ใช่ดูแค่ว่า 'รันแล้วมีผลลัพธ์ออกหน้าจอ'",
        "เช็กลิสต์นี้กลั่นมาจากทุกบล็อกใน Phase 1 (B01–B08): ตั้งแต่การทำซ้ำได้ด้วย {{uv}} + {{lockfile|uv.lock}}, การรักษาความลับใน {{env-config}}, ความทนทานของเครือข่าย, การคุม concurrency, ความน่าเชื่อถือของชุดเทสต์ {{pytest}} ไปจนถึงความสะอาดของโค้ดด้วย {{ruff}}",
      ],
      analogy:
        "เหมือนการตรวจสภาพรถก่อนออกทางไกล — ไม่ใช่แค่สตาร์ตเครื่องติดแล้วออกรถเลย แต่ต้องเช็กเบรก (timeout/retry), ยาง (lockfile), เข็มขัดนิรภัย (no secrets) และไฟหน้า (structured logs)",
      bullets: [
        "**1. Reproducibility (B01, B06)** — มี `pyproject.toml` + `uv.lock`, ใช้ `src/` layout, ติดตั้งได้ด้วย `uv sync --frozen` และมีคำสั่ง CLI ชัดเจนใน `README.md`",
        "**2. Config & Secrets Hygiene (B02, B06)** — อ่านค่าผ่าน `pydantic-settings`, มี `.env.example` ไม่มี secret จริงในโค้ด และใส่ `.env` / `.venv` / `*.sqlite3` ใน `.gitignore`",
        "**3. Strict Contracts & Quarantine (B01, B02)** — ตรวจ input/output ด้วย Pydantic v2, เขียน `output.jsonl` + `quarantine.jsonl` แบบ UTF-8 โดยของเสีย 1 ชิ้นไม่ล้มทั้ง batch",
        "**4. Network Resilience & Bounded Concurrency (B04, B05)** — กำหนด `httpx.Timeout` ชัดเจน, retry เฉพาะ `408`/`429`/`5xx`/timeout ด้วย backoff+jitter, คุมงานพร้อมกันด้วย `asyncio.Semaphore`",
        "**5. Persistent Cache & Observability (B02, B07)** — แคชคำตอบลง `SQLite` ด้วย parameterized `?` + TTL และบันทึก metrics (`cache_hits`, `retries`, `failed`) ผ่าน `structlog`",
        "**6. Verification & Lint Gate (B03)** — ชุดเทสต์ `pytest` รันออฟไลน์ได้ 100% ด้วย `MockTransport`, coverage ≥ 90%, ไม่มี `RuntimeWarning` และ `ruff check` สะอาด",
      ],
      whyTitle: "Why this matters — ทำไมพอร์ตโฟลิโอ 1 โปรเจกต์ที่ผ่าน Rubric นี้ถึงโดดเด่น",
      whyParagraphs: [
        "ผู้สมัครสาย AI ส่วนใหญ่มักส่ง Jupyter Notebook ที่รันได้เฉพาะเครื่องตัวเอง ไม่มี lockfile, ไม่มี timeout และไม่มีเทสต์ — เมื่อทีมวิศวกรเห็น CLI ที่มี `uv.lock`, `MockTransport` tests, quarantine JSONL และ structured logs จะเห็นความต่างด้านความเป็นมืออาชีพทันที",
        "เช็กลิสต์ 6 ข้อนี้ยังจะขยายต่อเป็น Production-Readiness Audit ใน Phase 5 (Day 156) และ Capstone Rubric ใน Phase 6 (Day 180)",
      ],
    },
    {
      id: "demo-and-release-checklist",
      title: "2 · แผนการเดโม 3 นาที: แสดงให้เห็น Cold Run vs Warm Cache Run",
      paragraphs: [
        "การเดโมเครื่องมือ CLI ที่ดีควรเล่าเรื่องเป็น 3 ฉากสั้น ๆ ที่พิสูจน์คุณค่าทางวิศวกรรมได้ทันที: **(1) Cold Run** รันคำสั่ง CLI บนชุดเป้าหมายจำลองที่มีทั้งของดี, `429` ชั่วคราว, `404` และ schema เพี้ยน → ให้เห็น `structlog` รายงานการ retry อัตโนมัติและแยก `quarantine.jsonl` อย่างสะอาด",
        "**(2) Warm Cache Run** รันคำสั่งเดิมซ้ำทันที → ให้เห็น `cache_hits` ขึ้นมาครบ 100% ของรายการที่สำเร็จ เวลาทำงานลดเหลือเสี้ยววินาที และ **(3) Automated Quality Gate** รัน `uv run pytest --cov` + `uv run ruff check .` ให้เห็นผลเขียวครบทุกข้อแบบปิดอินเทอร์เน็ต",
      ],
      analogy:
        "เหมือนการสาธิตเสื้อกันฝน — แค่พูดว่า 'กันน้ำได้' ไม่มีใครเชื่อเท่ากับการราดน้ำให้ดูจริง (Cold Run), เช็ดแล้วใช้ซ้ำได้ทันที (Warm Run) และโชว์ใบรับรองมาตรฐาน (pytest + Ruff)",
      code: {
        language: "bash",
        filename: "demo_commands.sh",
        code: `# ฉากที่ 1: Cold Run (ดึงข้อมูล + retry อัตโนมัติ + แยก quarantine)
uv run resilient-fetcher fetch inputs/sample_targets.jsonl --concurrency 4

# ฉากที่ 2: Warm Cache Run (รันซ้ำทันที — ได้ cache_hits เต็มและเร็วกว่าเดิมหลายเท่า)
uv run resilient-fetcher fetch inputs/sample_targets.jsonl --concurrency 4

# ฉากที่ 3: Quality Gate (ยืนยัน 0 lint error และ coverage >= 90% แบบ offline)
uv run ruff check . && uv run pytest -W error --cov --cov-report=term-missing`,
        caption: "โครงเดโม 3 ขั้นที่เหมาะทั้งสำหรับอัดวิดีโอ 3 นาทีและใส่ในส่วน Quickstart ของ `README.md`",
      },
      whyTitle: "Why this matters — เตรียมทักษะการสื่อสารเชิงเทคนิคตั้งแต่ Phase 1",
      whyParagraphs: [
        "การอธิบายสถาปัตยกรรมและ trade-off (เช่น ทำไมเลือก SQLite cache แทน Redis ใน CLI, ทำไมไม่ retry 404) ภายใน 3 นาที คือทักษะเดียวกับที่ต้องใช้ในงานจริงและใน Final Capstone Defense (Day 180)",
        "การเก็บตัวเลขจริงจากเดโม (latency cold vs warm, cache hit rate, test coverage) ไว้ใน `README.md` ทำให้ผลงานมีน้ำหนักกว่าคำบรรยายลอย ๆ หลายเท่า",
      ],
    },
    {
      id: "bridge-to-phase2",
      title: "3 · สะพานเชื่อมสู่ Phase 2: จาก JSONL สะอาดสู่ Polars, DuckDB และ Classical ML",
      paragraphs: [
        "ยินดีด้วยที่คุณเดินทางครบ **Phase 1 (Modern Python & Async Foundation)**! ทุกเครื่องมือที่คุณฝึกมาตลอด 32 วันไม่ได้ถูกทิ้งไว้ข้างหลัง แต่คือฐานรากของทุก Phase ถัดไป",
        "ตั้งแต่วันพรุ่งนี้ (Day 33 — Block B09) เราจะเข้าสู่ **Phase 2: Data, Math Intuition & Classical ML** โดยหยิบไฟล์ `output.jsonl` จากท่อ ingestion ของคุณมาวิเคราะห์ข้อมูลหลักแสนแถวในเครื่องด้วย {{polars}} และ {{duckdb}}, สร้างความเข้าใจเรื่องเวกเตอร์และ Cosine Similarity (NumPy), ก่อนลงมือฝึกโมเดลจำแนกความสำคัญของทิกเก็ตภาษาไทยด้วย `PyThaiNLP` + `scikit-learn` + `LightGBM`",
      ],
      analogy:
        "Phase 1 คือการสร้างโรงน้ำประปาและท่อส่งน้ำที่สะอาดไม่รั่วซึม — ส่วน Phase 2 คือการนำน้ำสะอาดนั้นมาตรวจวัดคุณภาพ วิเคราะห์สถิติ และกลั่นเป็นโมเดลพยากรณ์ที่ทำงานเร็วในระดับมิลลิวินาที",
      code: {
        language: "python",
        filename: "preview_phase2.py",
        code: `# ตัวอย่างการต่อยอด output.jsonl จาก Phase 1 เข้าสู่ Phase 2 (Day 33–35)
# หมายเหตุ: จะเริ่มติดตั้งและใช้งานจริงใน Day 33
#
# import polars as pl
# df = pl.read_ndjson("data/output.jsonl")
# summary = df.group_by("category").len().sort("len", descending=True)
# print(summary)`,
        caption: "ไฟล์ `output.jsonl` ที่ผ่าน Pydantic validation ใน Phase 1 พร้อมอ่านเข้า Polars / DuckDB ได้ใน 1 บรรทัด",
      },
      whyTitle: "Why this matters — ทำไมต้องเรียน Data & Classical ML ก่อนกระโดดไป LLM",
      whyParagraphs: [
        "งานจริงจำนวนมาก เช่น จัดลำดับความเร่งด่วนของทิกเก็ตหรือพยากรณ์ลูกค้าเลิกใช้บริการ สามารถทำด้วย Classical ML ที่เร็ว `< 10ms` และต้นทุนเกือบเป็นศูนย์ แทนที่จะยิง LLM แพง ๆ ทุกคำขอ",
        "นอกจากนี้ แนวคิดเรื่อง vector, cosine similarity, train/val/test split และ precision/recall จาก Phase 2 คือหัวใจของ Embeddings, RAG และ Evaluation ใน Phase 3–5",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Phase 1 Quality Gate กับ Production PR Checklist",
      body: [
        "ชุดตรวจสอบก่อนจบ Phase 1 ตรงกับ CI Quality Gate ที่ทีมวิศวกรรมซอฟต์แวร์ใช้ตรวจ Pull Request ก่อน merge ขึ้น `main`:",
      ],
      table: [
        ["`uv sync --frozen` (`uv.lock`)", "`npm ci` / `pnpm install --frozen-lockfile`"],
        ["`ruff check .` + `ruff format --check .`", "`eslint` + `prettier --check`"],
        ["`pytest -W error --cov` (≥ 90%)", "`vitest run --coverage` (≥ 90%)"],
        ["`.env` ใน `.gitignore` + `.env.example`", "`.env.local` ใน `.gitignore` + `.env.example`"],
        ["`output.jsonl` + `quarantine.jsonl`", "Validated NDJSON export + DLQ report"],
      ],
    },
    student: {
      title: "First-Year Note — ก้าวข้ามจาก 'เขียนโค้ดส่งการบ้าน' สู่ 'ส่งมอบซอฟต์แวร์'",
      body: [
        "ความต่างระหว่างโค้ดส่งการบ้านกับผลงานระดับวิศวกรไม่ได้อยู่ที่ความซับซ้อนของอัลกอริทึม แต่อยู่ที่ **ความใส่ใจในรายละเอียดรอบข้าง**: คนอื่น clone repo แล้วรันตาม README ได้ใน 2 คำสั่งไหม? ถ้าอินเทอร์เน็ตหลุดหรือข้อมูลแหว่งโปรแกรมพังเงียบหรือจัดการอย่างมีสติ?",
        "หากโปรเจกต์ `resilient-fetcher` ของคุณผ่านเช็กลิสต์ในวันนี้ได้ครบ คุณได้สร้างนิสัยวิศวกรที่เหนือกว่าพื้นฐานทั่วไปไปไกลแล้ว",
      ],
    },
  },

  workedExample: {
    intro:
      "แทนที่จะตรวจเช็กลิสต์ด้วยตาเปล่า มาลองสร้างสคริปต์ตรวจสอบ repo อัตโนมัติ (**Phase 1 Readiness Audit**) ที่ตรวจทั้ง reproducibility, `.gitignore`, ความปลอดภัยจาก secret ที่เผลอ hardcode และความสมบูรณ์ของไฟล์ `output.jsonl`",
    steps: [
      {
        title: "1 · นิยามโมเดลรายงานผล `AuditCheck` และ `Phase1AuditReport`",
        explain:
          "ใช้ Pydantic เก็บผลการตรวจแต่ละข้อ (`name`, `passed`, `detail`) พร้อมคำนวณ `score_pct` และสถานะรวม `ready_for_phase2`",
        code: {
          language: "python",
          filename: "worked_d032.py",
          code: `import json
import re
from pathlib import Path
from pydantic import BaseModel, Field


SECRET_PATTERN = re.compile(r"(sk-[A-Za-z0-9]{12,}|API_KEY\s*=\s*['\"][^'\"]{8,}['\"])")


class AuditCheck(BaseModel):
    name: str
    passed: bool
    detail: str


class Phase1AuditReport(BaseModel):
    checks: list[AuditCheck] = Field(min_length=1)

    @property
    def passed_count(self) -> int:
        return sum(1 for c in self.checks if c.passed)

    @property
    def score_pct(self) -> float:
        return round((self.passed_count / len(self.checks)) * 100.0, 1)

    @property
    def ready_for_phase2(self) -> bool:
        return all(c.passed for c in self.checks)`,
        },
        output: `# นิยาม AuditCheck และ Phase1AuditReport สำเร็จ`,
      },
      {
        title: "2 · เขียนฟังก์ชันสแกนโปรเจกต์ 4 ด้านหลักด้วย `pathlib`",
        explain:
          "ตรวจว่ามี `pyproject.toml` + `uv.lock`, `.gitignore` กัน `.env` กับ `.venv`, ไม่มี secret หลุดในไฟล์ `.py`, และไฟล์ JSONL ทุกบรรทัด parse ได้จริง",
        code: {
          language: "python",
          filename: "worked_d032.py",
          code: `def audit_phase1_repo(repo_dir: Path, jsonl_path: Path | None = None) -> Phase1AuditReport:
    checks: list[AuditCheck] = []

    # 1) Reproducibility files
    has_lock = (repo_dir / "pyproject.toml").is_file() and (repo_dir / "uv.lock").is_file()
    checks.append(AuditCheck(
        name="reproducibility_lockfile",
        passed=has_lock,
        detail="พบ pyproject.toml และ uv.lock ครบ" if has_lock else "ขาด pyproject.toml หรือ uv.lock",
    ))

    # 2) .gitignore hygiene
    gi_path = repo_dir / ".gitignore"
    gi_text = gi_path.read_text(encoding="utf-8") if gi_path.is_file() else ""
    gi_lines = {line.strip().rstrip("/") for line in gi_text.splitlines() if line.strip()}
    gi_ok = ".env" in gi_lines and ".venv" in gi_lines
    checks.append(AuditCheck(
        name="gitignore_hygiene",
        passed=gi_ok,
        detail=".gitignore ครอบคลุม .env และ .venv" if gi_ok else "กรุณาเพิ่ม .env และ .venv ใน .gitignore",
    ))

    # 3) No hardcoded secrets in .py files
    leaked: list[str] = []
    for py_file in repo_dir.rglob("*.py"):
        if ".venv" in py_file.parts:
            continue
        if SECRET_PATTERN.search(py_file.read_text(encoding="utf-8")):
            leaked.append(py_file.name)
    checks.append(AuditCheck(
        name="no_hardcoded_secrets",
        passed=len(leaked) == 0,
        detail="ไม่พบ secret hardcode ในโค้ด" if not leaked else f"พบ pattern เสี่ยงใน: {', '.join(leaked)}",
    ))

    # 4) Valid UTF-8 JSONL output (ถ้ามีการส่ง path มาตรวจ)
    if jsonl_path is not None:
        valid_jsonl = jsonl_path.is_file()
        bad_line = None
        if valid_jsonl:
            for idx, line in enumerate(jsonl_path.read_text(encoding="utf-8").splitlines(), start=1):
                if not line.strip():
                    continue
                try:
                    json.loads(line)
                except ValueError:
                    valid_jsonl = False
                    bad_line = idx
                    break
        checks.append(AuditCheck(
            name="valid_jsonl_output",
            passed=valid_jsonl,
            detail="JSONL ทุกบรรทัดสมบูรณ์" if valid_jsonl else f"JSONL ไม่พบหรือพังที่บรรทัด {bad_line}",
        ))

    return Phase1AuditReport(checks=checks)`,
        },
        output: `# พร้อมสแกนโฟลเดอร์โปรเจกต์ใด ๆ บนเครื่องโดยไม่ต้องต่ออินเทอร์เน็ต`,
      },
      {
        title: "3 · รันตรวจโปรเจกต์จำลองและแสดงรายงานพร้อมคะแนน",
        explain:
          "จำลองโฟลเดอร์โปรเจกต์ที่ผ่านครบทุกเกณฑ์แล้วพิมพ์รายงานสรุปความพร้อมเข้าสู่ Phase 2",
        code: {
          language: "python",
          filename: "worked_d032.py",
          code: `import tempfile

with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    (root / "pyproject.toml").write_text('[project]\\nname = "resilient-fetcher"\\n', encoding="utf-8")
    (root / "uv.lock").write_text("version = 1\\n", encoding="utf-8")
    (root / ".gitignore").write_text(".venv/\\n.env\\ndata/*.sqlite3\\n", encoding="utf-8")
    (root / "app.py").write_text("import os\\nAPI_KEY = os.getenv('API_KEY')\\n", encoding="utf-8")
    out_jsonl = root / "output.jsonl"
    out_jsonl.write_text('{"item_id": "DOC-1", "title": "คู่มือ"}\\n', encoding="utf-8")

    report = audit_phase1_repo(root, jsonl_path=out_jsonl)
    for c in report.checks:
        mark = "PASS" if c.passed else "FAIL"
        print(f"[{mark}] {c.name}: {c.detail}")
    print(f"Score: {report.score_pct}% | Ready for Phase 2: {report.ready_for_phase2}")`,
        },
        output: `[PASS] reproducibility_lockfile: พบ pyproject.toml และ uv.lock ครบ
[PASS] gitignore_hygiene: .gitignore ครอบคลุม .env และ .venv
[PASS] no_hardcoded_secrets: ไม่พบ secret hardcode ในโค้ด
[PASS] valid_jsonl_output: JSONL ทุกบรรทัดสมบูรณ์
Score: 100.0% | Ready for Phase 2: True`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยเวลาสแกนไฟล์ด้วย `repo_dir.rglob('*.py')`: ลืมข้ามโฟลเดอร์ `.venv` — ทำให้สคริปต์ไปสแกนโค้ดไลบรารีภายนอกนับพันไฟล์จนช้ามากและอาจเจอข้อความตัวอย่างที่ทำให้เกิด false positive!",
  },

  practice: {
    intro:
      "โจทย์ Checkpoint (15 นาที): สร้างเครื่องมือ `phase1_audit.py` สำหรับตรวจสอบความพร้อมของโปรเจกต์ Phase 1 (และลองรันตรวจกับโฟลเดอร์ `resilient-fetcher` จริงของคุณด้วย!)",
    requirements: [
      "สร้าง `AuditCheck(BaseModel)` (`name: str`, `passed: bool`, `detail: str`) และ `Phase1AuditReport(BaseModel)` (`checks: list[AuditCheck]`) พร้อม properties `passed_count`, `score_pct` (ปัดทศนิยม 1 ตำแหน่ง) และ `ready_for_phase2` (True เมื่อทุกข้อผ่าน)",
      "สร้างฟังก์ชัน `audit_repo(repo_dir: Path, output_jsonl: Path | None = None) -> Phase1AuditReport` ที่ตรวจครบ 4 ข้อ: `reproducibility_lockfile` (มีทั้ง `pyproject.toml` และ `uv.lock`), `gitignore_hygiene` (`.gitignore` มีทั้ง `.env` และ `.venv`), `no_hardcoded_secrets` (ไม่มี `sk-...` หรือ `API_KEY = \"...\"` ในไฟล์ `.py` โดยข้าม `.venv`), และ `has_tests` (มีไฟล์ `test_*.py` อย่างน้อย 1 ไฟล์ใน repo)",
      "หากส่ง `output_jsonl` เข้ามาด้วย ให้เพิ่มข้อตรวจ `valid_jsonl_output` ที่ตรวจสอบว่าไฟล์มีอยู่จริงและทุกบรรทัดที่ไม่ว่างสามารถ `json.loads(...)` ได้เป็น `dict`",
      "สร้างฟังก์ชัน `audit_repo` ให้ทำงานกับ `Path` บนเครื่องได้อย่างปลอดภัยด้วย `encoding='utf-8'` และไม่พังเมื่อขาดไฟล์ `.gitignore`",
      "รันผ่านชุดเทสต์ `test_phase1_audit.py` ครบทุกข้อและนำไปรันตรวจโปรเจกต์ `resilient-fetcher` ของคุณเองจนได้ `Ready for Phase 2: True`",
    ],
    starter: {
      language: "python",
      filename: "phase1_audit.py",
      code: `import json
import re
from pathlib import Path
from pydantic import BaseModel, Field

SECRET_PATTERN = re.compile(r"(sk-[A-Za-z0-9]{12,}|API_KEY\s*=\s*['\"][^'\"]{8,}['\"])")


class AuditCheck(BaseModel):
    name: str
    passed: bool
    detail: str


class Phase1AuditReport(BaseModel):
    checks: list[AuditCheck] = Field(min_length=1)

    @property
    def passed_count(self) -> int:
        # TODO: นับจำนวน check ที่ passed == True
        raise NotImplementedError

    @property
    def score_pct(self) -> float:
        # TODO: คืนเปอร์เซ็นต์ที่ผ่าน ปัดทศนิยม 1 ตำแหน่ง
        raise NotImplementedError

    @property
    def ready_for_phase2(self) -> bool:
        # TODO: คืน True เมื่อผ่านครบทุกข้อ
        raise NotImplementedError


def audit_repo(repo_dir: Path, output_jsonl: Path | None = None) -> Phase1AuditReport:
    # TODO: ตรวจ reproducibility_lockfile, gitignore_hygiene, no_hardcoded_secrets, has_tests
    # และ valid_jsonl_output (เมื่อ output_jsonl ไม่เป็น None)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_phase1_audit.py",
      code: `from pathlib import Path
from phase1_audit import audit_repo


def _make_clean_repo(root: Path) -> Path:
    (root / "pyproject.toml").write_text('[project]\\nname = "demo"\\n', encoding="utf-8")
    (root / "uv.lock").write_text("version = 1\\n", encoding="utf-8")
    (root / ".gitignore").write_text(".venv/\\n.env\\n", encoding="utf-8")
    (root / "src").mkdir()
    (root / "src" / "main.py").write_text("import os\\nTOKEN = os.getenv('API_KEY')\\n", encoding="utf-8")
    (root / "tests").mkdir()
    (root / "tests" / "test_main.py").write_text("def test_ok():\\n    assert True\\n", encoding="utf-8")
    jsonl = root / "output.jsonl"
    jsonl.write_text('{"id": 1, "msg": "สวัสดี"}\\n', encoding="utf-8")
    return jsonl


def test_clean_repo_passes_all_checks(tmp_path: Path):
    jsonl = _make_clean_repo(tmp_path)
    report = audit_repo(tmp_path, output_jsonl=jsonl)
    assert report.ready_for_phase2 is True
    assert report.score_pct == 100.0
    assert report.passed_count == 5


def test_catches_missing_lockfile_and_hardcoded_secret(tmp_path: Path):
    _make_clean_repo(tmp_path)
    (tmp_path / "uv.lock").unlink()
    (tmp_path / "src" / "leak.py").write_text('KEY = "sk-live1234567890abcd"\\n', encoding="utf-8")

    report = audit_repo(tmp_path)
    results = {c.name: c.passed for c in report.checks}
    assert results["reproducibility_lockfile"] is False
    assert results["no_hardcoded_secrets"] is False
    assert results["gitignore_hygiene"] is True
    assert results["has_tests"] is True
    assert report.ready_for_phase2 is False
    assert report.score_pct == 50.0


def test_ignores_venv_and_detects_corrupt_jsonl(tmp_path: Path):
    jsonl = _make_clean_repo(tmp_path)
    venv_dir = tmp_path / ".venv" / "lib"
    venv_dir.mkdir(parents=True)
    # ไฟล์ใน .venv ต้องถูกข้ามไม่ให้ฟ้อง secret
    (venv_dir / "example.py").write_text('SAMPLE = "sk-venv1234567890abcd"\\n', encoding="utf-8")
    jsonl.write_text('{"id": 1}\\n{corrupt_json\\n', encoding="utf-8")

    report = audit_repo(tmp_path, output_jsonl=jsonl)
    results = {c.name: c.passed for c in report.checks}
    assert results["no_hardcoded_secrets"] is True
    assert results["valid_jsonl_output"] is False
    assert report.ready_for_phase2 is False
`,
    },
    selfCheck: [
      "Repo ที่ครบองค์ประกอบผ่านทั้ง 5 ข้อ (`score_pct == 100.0` และ `ready_for_phase2 is True`)",
      "จับกรณีขาด `uv.lock` และจับ secret pattern (`sk-...` / `API_KEY = \"...\"`) ใน `.py` ได้แม่นยำ",
      "ข้ามโฟลเดอร์ `.venv` ระหว่างสแกนไฟล์ `.py` ไม่เกิด false positive",
      "จับบรรทัด JSONL ที่พังใน `output.jsonl` ได้โดยไม่ crash",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100% รวมถึงลองสแกนโปรเจกต์ `resilient-fetcher` ของคุณเองแล้ว",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 3 กลุ่มด้วย `uv run pytest -q`, `uv run ruff check .` ไร้ warning และรันตรวจ repo ของตัวเองครบทุกข้อ",
    hints: [
      {
        body: "สำหรับ `.gitignore` ให้ normalize แต่ละบรรทัดด้วย `line.strip().rstrip('/')` เพื่อให้รองรับทั้ง `.venv` และ `.venv/`",
      },
      {
        body: "ใช้ `any(p.name.startswith('test_') and '.venv' not in p.parts for p in repo_dir.rglob('*.py'))` เพื่อตรวจว่ามีไฟล์เทสต์อย่างน้อย 1 ไฟล์โดยไม่ไปนับไฟล์ใน `.venv`",
      },
      {
        body: "โครงสร้าง property ของ `Phase1AuditReport` และเงื่อนไข 3 ข้อแรกพร้อมแล้ว เหลือเติมข้อ `has_tests` และ `valid_jsonl_output`",
        code: {
          language: "python",
          filename: "hint-d032-l3.py",
          code: `class Phase1AuditReport(BaseModel):
    checks: list[AuditCheck] = Field(min_length=1)

    @property
    def passed_count(self) -> int:
        return sum(1 for c in self.checks if c.passed)

    @property
    def score_pct(self) -> float:
        return round((self.passed_count / len(self.checks)) * 100.0, 1)

    @property
    def ready_for_phase2(self) -> bool:
        return all(c.passed for c in self.checks)


def _iter_project_py_files(repo_dir: Path) -> list[Path]:
    return [p for p in repo_dir.rglob("*.py") if ".venv" not in p.parts]`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .
# ทดลองรัน audit กับโฟลเดอร์ปัจจุบัน
uv run python -c "from pathlib import Path; from phase1_audit import audit_repo; r = audit_repo(Path('.')); print(r.score_pct, r.ready_for_phase2)"`,
      caption: "คุณสามารถนำ `phase1_audit.py` ไปตรวจโปรเจกต์ทุก Phase ในอนาคตได้ทันที",
    },
  },

  mistakes: [
    {
      title: "ลืม commit `uv.lock` หรือเผลอ commit `.env` / `.venv` เข้า Git",
      symptom: "คนอื่น clone repo ไปแล้วติดตั้งไม่ได้เวอร์ชันตรงกัน หรือที่ร้ายแรงกว่าคือ API key หลุดขึ้น public repo",
      fix: "ตรวจ `git status` ก่อน commit ทุกครั้ง, ใส่ `.env` และ `.venv/` ใน `.gitignore`, และทดสอบติดตั้งใหม่ด้วย `uv sync --frozen`",
    },
    {
      title: "เขียนเทสต์เฉพาะ happy path แล้วไม่ตรวจ branch ของ error/quarantine",
      symptom: "Coverage ต่ำกว่า 90% และบั๊กในโค้ด retry/quarantine โผล่ครั้งแรกตอนรันจริงบน production",
      fix: "รัน `uv run pytest --cov --cov-report=term-missing` เพื่อดูบรรทัดที่ยังไม่ได้เทสต์ แล้วเพิ่มเคส `MockTransport` ให้ครบทุก failure mode",
    },
    {
      title: "ปล่อยให้ชุดเทสต์ต้องต่ออินเทอร์เน็ตจริง",
      symptom: "เทสต์รันช้าและพังสุ่มเวลาเน็ตช้าหรือเว็บปลายทางเปลี่ยนข้อมูล (flaky CI)",
      fix: "ใช้ `httpx.MockTransport` และ `tmp_path` แยก I/O ออกทั้งหมด เพื่อให้ `pytest` รันผ่าน 100% แม้ปิด Wi-Fi",
    },
    {
      title: "ไม่มี `README.md` ที่ระบุวิธีติดตั้ง คำสั่งเดโม และโครงสร้างสถาปัตยกรรม",
      symptom: "โค้ดดีแค่ไหนแต่ผู้ตรวจหรือเพื่อนร่วมทีมไม่รู้วิธีรันและไม่เห็นคุณค่าของงานที่สร้าง",
      fix: "เขียน `README.md` สั้นกระชับ 3 ส่วน: Architecture overview, Quickstart (`uv sync` + คำสั่ง CLI Cold/Warm run), และ Test/Coverage verification",
    },
  ],

  quiz: {
    intro:
      "Phase 1 Cumulative Quiz (4 ข้อ ครอบคลุม Block B01–B08) — ทดสอบความแม่นยำจากการเชื่อมโยงทุกหัวข้อตลอด 32 วันก่อนขึ้น Phase 2",
    questions: [
      mc(
        "d032-q1",
        "[B01–B02] ข้อใดเป็นชุดแนวปฏิบัติที่ถูกต้อง **ทั้งหมด** สำหรับการทำซ้ำได้ ({{reproducibility}}), การตั้งค่าความลับ และ Logging ในโปรเจกต์ AI Python?",
        [
          ["Commit `pyproject.toml` + `.venv/`, อ่าน secret จาก `os.environ` แบบ hardcode fallback, พิมพ์ log ด้วย `print()`", "ผิดทุกจุด: ห้าม commit `.venv/`, ห้าม hardcode secret และควรใช้ structured log"],
          ["Commit `pyproject.toml` + `uv.lock`, โหลด config ผ่าน `pydantic-settings` (ใส่ `.env` ใน `.gitignore`), และบันทึก event JSON ด้วย `structlog`", "ถูก — นี่คือมาตรฐานครบชุดของ Block B01–B02 ที่ใช้ต่อเนื่องไปจนถึง production"],
          ["Commit `.env` ที่มี key จริงเพื่อให้เพื่อนรันได้ทันที และไม่ต้องมี `uv.lock`", "อันตรายมาก — ห้าม commit `.env` ที่มี secret จริงเด็ดขาด"],
          ["ใช้ `requirements.txt` เปล่า ๆ ไม่ระบุเวอร์ชัน และใช้ `try/except: pass` ซ่อน error ทั้งหมด", "ไม่รับประกัน reproducibility และการกลืน error เงียบทำให้ดีบักไม่ได้"],
        ],
        "B",
        "โครงสร้าง `pyproject.toml` + `uv.lock` + `pydantic-settings` (`.env` ignored) + `structlog` คือฐานรากที่ทำให้โปรเจกต์ทั้งปลอดภัย ทำซ้ำได้ และตรวจสอบย้อนหลังได้",
        "องค์ประกอบหลัก 3 อย่างด้าน environment, config และ logging จาก Block B01–B02 คืออะไร?",
        "`pyproject.toml` + `uv.lock` (reproducibility), `pydantic-settings` + `.env` ใน `.gitignore` (config/secrets), และ `structlog` JSON logs",
      ),
      mc(
        "d032-q2",
        "[B03–B04] ในการทดสอบ HTTP Client ที่มี retry policy ด้วย `pytest` ข้อใดคือพฤติกรรมที่ถูกต้องและวิธีทดสอบที่เหมาะสมที่สุด?",
        [
          ["Retry ทุก status code รวมถึง 404 โดยยิงเว็บจริงในเทสต์", "ผิดทั้งสองเรื่อง: ห้าม retry 404 และห้ามพึ่งเว็บจริงใน unit test"],
          ["กำหนด explicit `httpx.Timeout`, retry เฉพาะ `408`/`429`/`5xx`/timeout ด้วย backoff+jitter, fail-fast กับ `400`/`401`/`404` และทดสอบ offline ด้วย `httpx.MockTransport`", "ถูก — ครอบคลุมทั้งความทนทานใน production และความเร็ว/ความนิ่งของชุดเทสต์"],
          ["ปิด timeout (`timeout=None`) เพื่อไม่ให้เกิด `ReadTimeout` และไม่จำเป็นต้องเขียนเทสต์ error path", "ห้ามปิด timeout เด็ดขาด เพราะ worker จะค้างตลอดกาลเมื่อปลายทางไม่ตอบ"],
          ["ใช้ `time.sleep(5)` คงที่ทุกครั้งที่พังและให้เทสต์รอเวลาจริงทุกเคส", "ไม่มี jitter (เสี่ยง Thundering Herd) และทำให้ชุดเทสต์ช้าเกินไป"],
        ],
        "B",
        "Explicit timeout + selective retry + `MockTransport` offline tests คือแกนหลักของ Block B03–B04 ที่ป้องกันทั้งระบบค้างและ CI flaky",
        "กฎ 3 ข้อของ HTTP Client ระดับ production จาก Block B03–B04 คืออะไร?",
        "1) ตั้ง explicit timeout เสมอ, 2) retry เฉพาะ 408/429/5xx/timeout พร้อม backoff+jitter (fail-fast กับ 4xx), 3) ทดสอบ offline ด้วย `MockTransport`",
      ),
      mc(
        "d032-q3",
        "[B05–B06] คุณกำลังห่อท่อ `asyncio` ให้เป็น CLI package ด้วย `src/` layout และ `Typer` ข้อใดกล่าวถูกต้อง?",
        [
          ["ควรใช้ `time.sleep()` ใน `async def` และรัน `asyncio.gather` 1,000 งานพร้อมกันโดยไม่จำกัดจำนวน", "`time.sleep()` จะแช่แข็ง Event Loop และไม่มีตัวกั้นจะถล่ม API ปลายทาง"],
          ["วาง `async with asyncio.Semaphore(limit):` คุมเพดาน concurrency, แยก core logic ใน `src/<pkg>/` ออกจาก `cli.py` และประกาศ entry point ใน `[project.scripts]` ของ `pyproject.toml`", "ถูก — ครบทั้ง async ที่ปลอดภัยและโครงสร้าง package CLI ที่ติดตั้งใช้งานได้จริง"],
          ["ต้องวางโค้ดทั้งหมดใน `cli.py` ไฟล์เดียวที่ root folder เพื่อให้ `Typer` ทำงานได้", "ควรใช้ `src/` layout และแยก `cli.py` ให้บางที่สุด"],
          ["ห้ามใช้ `asyncio.to_thread` เมื่อจำเป็นต้องเรียกฟังก์ชัน sync ภายในโค้ด async", "ตรงกันข้าม — `asyncio.to_thread` คือวิธีมาตรฐานในการโยก blocking call ไม่ให้ขวาง Event Loop"],
        ],
        "B",
        "การผสาน bounded concurrency (`Semaphore`), non-blocking async และ `src/` layout + `[project.scripts]` ทำให้ได้ CLI ที่ทั้งเร็ว ปลอดภัย และแพ็กแจกจ่ายได้จริง",
        "ทำไมควรประกาศ `[project.scripts]` ใน `pyproject.toml` และแยก `cli.py` ออกจาก `fetcher.py`?",
        "เพื่อให้ติดตั้งและเรียกคำสั่ง CLI ได้ตรง ๆ (`uv run <cmd>`) และให้ core logic แยกทดสอบ/นำไปใช้ซ้ำใน FastAPI ได้ง่าย",
      ),
      mc(
        "d032-q4",
        "[B07–B08 → Phase 2] ท่อ Resilient Fetcher ของคุณเก็บแคชใน SQLite และส่งออก `output.jsonl` + `quarantine.jsonl` ข้อใดอธิบายการออกแบบและการต่อยอดสู่ Phase 2 ได้ถูกต้องที่สุด?",
        [
          ["แคชทั้งข้อมูลดีและ HTTP 500 ลง SQLite ด้วย f-string SQL แล้วส่ง `quarantine.jsonl` เข้าฝึกโมเดล ML", "ผิดทุกจุด: เสี่ยง SQL injection, cache poisoning และห้ามนำข้อมูลเสียเข้าฝึกโมเดล"],
          ["ใช้ parameterized SQL (`?`) + TTL แคชเฉพาะข้อมูลที่ผ่าน Pydantic, แยกของเสียลง `quarantine.jsonl`, และนำ `output.jsonl` (UTF-8) ไปอ่านต่อใน `Polars` / `DuckDB` ใน Phase 2", "ถูก — นี่คือสายพานที่เชื่อม Phase 1 เข้าสู่ Phase 2 (Data & Classical ML) อย่างสมบูรณ์"],
          ["ต้องแปลง `output.jsonl` เป็นไฟล์ `.txt` ธรรมดาก่อนเพราะ `Polars` และ `DuckDB` อ่าน JSONL ไม่ได้", "ทั้ง Polars (`read_ndjson`) และ DuckDB (`read_json_auto`) อ่าน JSONL ได้เร็วมากในตัว"],
          ["ไม่จำเป็นต้องมี `quarantine.jsonl` เพราะสามารถปล่อยให้โปรแกรม crash เมื่อเจอแถวเสีย 1 แถวได้", "การ crash ทั้ง batch ทำให้งานส่วนที่เหลือสูญเปล่า ต้องใช้ fault isolation + quarantine"],
        ],
        "B",
        "ข้อมูลที่ผ่านการคัดกรองเป็น UTF-8 JSONL ใน Phase 1 พร้อมไหลเข้าสู่ `Polars` และ `DuckDB` ใน Day 33 ทันทีโดยไม่ต้องรื้อสร้างท่อใหม่",
        "ผลลัพธ์จาก Phase 1 Mini-Project เชื่อมต่อกับ Phase 2 (`Polars` / `DuckDB`) อย่างไร?",
        "ไฟล์ `output.jsonl` (UTF-8 ที่ผ่าน Pydantic validation แล้ว) สามารถโหลดเข้า `Polars` (`read_ndjson`) และ `DuckDB` เพื่อทำความสะอาด วิเคราะห์ และฝึกโมเดล ML ใน Phase 2 ได้ทันที",
      ),
    ],
  },

  takeaways: [
    "ผลงานระดับวิศวกรต้องผ่าน Code Review 6 ด้าน: Reproducibility (`uv.lock`), Config/Secrets Hygiene, Strict Pydantic + Quarantine, Selective Retry + Bounded Concurrency, SQLite Cache + `structlog`, และ Offline `pytest` (≥ 90%) + `Ruff`",
    "การเดโมที่มีน้ำหนักแสดงครบ 3 ฉาก: Cold Run (retry + quarantine), Warm Cache Run (cache hit 100%) และ Automated Quality Gate",
    "จบ Phase 1 อย่างสมบูรณ์ — คุณพร้อมแล้วสำหรับการก้าวสู่ **Phase 2 (Day 33–60): Data, Math Intuition & Classical ML** ด้วย `Polars`, `DuckDB`, `NumPy`, `PyThaiNLP`, `scikit-learn` และ `LightGBM`",
    "อย่าลืมจดจุดที่พลาดจาก Cumulative Quiz ลง Error Log ของคุณเพื่อให้ระบบ Spaced Repetition ดึงกลับมาทบทวนในอีก +3, +8 และ +16 วัน",
  ],

  reviewCards: [
    rc(
      "d032-rc-1",
      "6 ด้านของ Phase 1 Engineering Code Review Checklist มีอะไรบ้าง?",
      "1) Reproducibility (`pyproject.toml` + `uv.lock`), 2) Secrets/`.env` hygiene, 3) Strict Pydantic + Quarantine JSONL, 4) Explicit timeout + Selective retry + Semaphore, 5) Parameterized SQLite cache + `structlog`, 6) Offline `pytest` ≥ 90% + `Ruff` clean",
    ),
    rc(
      "d032-rc-2",
      "ชุดคำสั่ง Quality Gate 3 บรรทัดที่ควรรันก่อน commit หรือส่งผลงาน Phase 1 คืออะไร?",
      "`uv sync --frozen`, `uv run ruff check . && uv run ruff format --check .`, และ `uv run pytest -W error --cov --cov-report=term-missing`",
    ),
    rc(
      "d032-rc-3",
      "ผลลัพธ์จาก Resilient Async Data Fetcher CLI ใน Phase 1 จะถูกนำไปต่อยอดใน Phase 2 (Day 33+) อย่างไร?",
      "ไฟล์ `output.jsonl` ที่สะอาดและเป็น UTF-8 จะถูกอ่านเข้า `Polars` (`read_ndjson`) และ `DuckDB` เพื่อวิเคราะห์ข้อมูลและสร้าง feature สำหรับฝึกโมเดล Classical ML",
    ),
  ],

  sources: [
    { label: "uv Official Guide — Locking and Syncing (`--frozen`)", href: "https://docs.astral.sh/uv/concepts/projects/sync/" },
    { label: "Ruff Official Documentation — Linter & Formatter", href: "https://docs.astral.sh/ruff/" },
    { label: "Polars User Guide — Reading NDJSON / JSONL (Phase 2 Preview)", href: "https://docs.pola.rs/user-guide/io/json/" },
    { label: "DuckDB Documentation — Querying JSON/JSONL Files (Phase 2 Preview)", href: "https://duckdb.org/docs/data/json/overview.html" },
  ],

  glossary: [
    "reproducibility",
    "lockfile",
    "env-config",
    "ruff",
    "pytest",
    "caching",
    "polars",
    "duckdb",
  ],
});
