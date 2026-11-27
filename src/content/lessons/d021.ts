import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D021 — Phase 1 / Block B06
 * Git Workflow for AI Teams (Branches, PRs, .gitignore for data/keys).
 */
export const d021: Lesson = defineLesson({
  day: 21,
  titleTh: "Git Workflow สำหรับทีม AI: แตก Branch, ทำ PR เล็ก และ .gitignore กันคีย์–ดาต้าหลุด",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · จัดระเบียบ feature branch, PR ที่รีวิวง่าย และ .gitignore ป้องกัน API key, .venv และไฟล์ข้อมูลขนาดใหญ่หลุดขึ้น repo",
  icon: "git-branch",
  visual: {
    id: "git-package-cli",
    title: "Git Workflow, src/ Package & Typer CLI สำหรับทีม AI",
    caption: "กดสลับแท็บเพื่อดูการแตก branch/PR ที่ปลอดภัย (ไม่หลุด .env/data), โครงสร้าง src/ และคำสั่ง Typer CLI",
    alt: "แผนภาพ Git workflow, โครงสร้างโปรเจกต์ src/ และ Typer CLI",
  },
  requiresApiKey: false,
  tools: ["Git", "uv", "Ruff", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "วางวินัยการทำงานร่วมกันตั้งแต่สร้าง Repository",
      body: "โปรเจกต์ AI ไม่ได้มีแค่ไฟล์ `.py` แต่มีทั้ง prompt template, config, ชุดข้อมูลทดสอบ และไฟล์ระบุ {{dependency}} หากทุกคน push ทับกันบน `main` งานจะชนกันและตามหาจุดที่พังไม่เจอ",
      lessonNote: "วันนี้เราวางมาตรฐาน Feature Branch + Small PR + การ commit `{{pyproject}}` คู่กับ `{{lockfile|uv.lock}}` เพื่อ {{reproducibility}} ของทั้งทีม",
    },
    {
      node: 1,
      heading: "กันความลับ ข้อมูลลูกค้า และไฟล์ขนาดใหญ่ไม่ให้หลุดเข้า Git History",
      body: "ความผิดพลาดราคาแพงที่สุดใน repo ของทีม AI คือการเผลอ commit ไฟล์ `.env` ที่มี API key, ข้อมูลลูกค้าที่ติดกฎหมาย {{pdpa}}, หรือไฟล์ข้อมูลดิบ/น้ำหนักโมเดลขนาดหลายร้อย MB",
      lessonNote: "การตั้งค่า `.gitignore` ที่ครอบคลุมตั้งแต่ commit แรกคือด่านป้องกันข้อมูลและคีย์รั่วไหลก่อนถึงมือคนอื่น",
    },
    {
      node: 3,
      heading: "ตรวจคุณภาพโค้ดและเทสต์อัตโนมัติก่อน Merge ทุก PR",
      body: "Pull Request ขนาดเล็กที่พ่วงการรัน {{ruff}}, {{pytest}} และ {{pre-commit}} ช่วยให้เพื่อนร่วมทีมรีวิวเหตุผลเชิงวิศวกรรมได้จริง แทนการมานั่งจับผิดช่องว่างหรือ import ที่ลืมลบ",
      lessonNote: "คุณจะได้ฝึกเช็กลิสต์ก่อนเปิด PR เพื่อลดความเสี่ยงในการ merge โค้ดพังเข้า `main`",
    },
    {
      node: 5,
      heading: "ประวัติ Commit ที่สะอาดช่วยให้สืบ Regression และ Rollback ได้ทันที",
      body: "เมื่อคุณภาพคำตอบของ AI ตกลงใน production หรือ latency พุ่ง ทีมต้องไล่ `git log` และ `git diff` กลับไปดูได้ทันทีว่าเปลี่ยน prompt หรือโค้ดส่วนไหนใน PR ล่าสุด",
      lessonNote: "1 PR ต่อ 1 วัตถุประสงค์พร้อมข้อความ commit ที่ชัดเจน คือรากฐานของการดูแลระบบ AI ระยะยาว",
    },
  ],

  objectives: [
    "**ใช้งาน** Git feature-branch workflow (`feat/...`, `fix/...`) และแตก Pull Request ขนาดเล็กที่รีวิวและย้อนกลับได้ง่ายโดยไม่ push ตรงเข้า `main`",
    "**ออกแบบและตรวจสอบ** `.gitignore` สำหรับโปรเจกต์ AI ให้กันไฟล์ความลับ (`.env`), สภาพแวดล้อม (`{{venv|.venv/}}`) และไฟล์ข้อมูล/น้ำหนักโมเดลขนาดใหญ่ได้ครบถ้วน ขณะที่ยัง commit `{{pyproject}}` และ `{{lockfile|uv.lock}}`",
    "**ตรวจสอบความปลอดภัย** ก่อน commit/push ด้วย `git status`, `git diff --staged`, `git check-ignore -v` และเขียนสคริปต์ตรวจ repo hygiene อัตโนมัติด้วย `pathlib` + `pytest`",
  ],

  prerequisites: [
    "ติดตั้ง `git` และ `uv` บนเครื่องแล้ว และเคยใช้ `git init`, `git add`, `git commit` พื้นฐาน",
    "เข้าใจแนวคิดไฟล์ `.env` จาก Day 7 (`pydantic-settings`) และ `ruff`/`pre-commit` จาก Day 11",
    "ไม่ต้องใช้ API key หรือ GitHub account — ฝึกสร้างและตรวจ Git repo บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์ฝึกปฏิบัติและตั้งค่า Git repo เปล่าพร้อม {{uv}} เพื่อทดสอบการแตก branch, ตรวจ `.gitignore` และรันสคริปต์ตรวจสอบ repo hygiene",
    commands: `uv init ai-day21-git && cd ai-day21-git
uv add --dev pytest ruff

# ตั้ง Git repo บนเครื่อง (ถ้า uv init ยังไม่ได้สร้าง)
git init -b main
git --version`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day21-git` ด้วย `uv init` และติดตั้ง `pytest` กับ `ruff`"],
      ["git-init", "ตรวจสอบว่ามี branch `main` และ `git --version` ทำงานปกติ"],
      ["ready", "พร้อมทดลองเขียน `.gitignore`, แตก feature branch และรันชุดตรวจอัตโนมัติ"],
    ],
    note: "บทนี้รันบนเครื่อง 100% ไม่ต้อง push ขึ้น GitHub จริง — เมื่อพร้อมทำงานทีมจริง เพียงเพิ่ม remote แล้วเปิด Pull Request จาก feature branch เข้า `main` ตามขั้นตอนเดียวกัน",
  },

  concepts: [
    {
      id: "git-feature-branches-and-prs",
      title: "1 · Feature Branches และ Pull Request ขนาดเล็กสำหรับทีม AI",
      paragraphs: [
        "กฎเหล็กข้อแรกของทีมวิศวกรรมคือ **`main` ต้องอยู่ในสถานะที่รันเทสต์ผ่านและพร้อม deploy เสมอ** งานใหม่ทุกชิ้นไม่ว่าจะเป็นการเพิ่ม parser, แก้ prompt หรือปรับ retry logic ให้แตก branch แยกจาก `main` ด้วยชื่อที่สื่อความหมาย เช่น `feat/thai-ticket-cli`, `fix/retry-429-backoff`, หรือ `chore/upgrade-pydantic`",
        "เมื่อทำงานเสร็จให้เปิด **Pull Request (PR)** ที่มีขอบเขตเล็กและชัด (แนะนำไม่เกิน ~200–400 บรรทัดต่อ 1 PR) แทนการดองโค้ดไว้ 2 สัปดาห์แล้วเปิด PR ก้อนยักษ์ 3,000 บรรทัด เพราะ PR ที่ใหญ่เกินไปทำให้คนรีวิวมองข้ามบั๊กสำคัญและเกิด merge conflict ซ้ำซ้อน",
      ],
      analogy:
        "เหมือนการปรับปรุงสูตรอาหารในครัวทดสอบ — คุณแยกหม้อทดลองออกมาชิมและให้หัวหน้าเชฟตรวจก่อน (`feature branch` + `PR`) แทนที่จะเทเครื่องปรุงใหม่ลงหม้อหลักที่กำลังเสิร์ฟลูกค้าอยู่ (`main`)",
      bullets: [
        "**ตั้งชื่อ Branch ให้บอกชนิดงาน**: `feat/<slug>` (ฟีเจอร์ใหม่), `fix/<slug>` (แก้บั๊ก), `chore/<slug>` (config/deps), `docs/<slug>` (เอกสาร) — ใช้ตัวพิมพ์เล็กและขีดกลาง (`kebab-case`)",
        "**1 PR = 1 วัตถุประสงค์**: อย่าปนการย้ายโฟลเดอร์ refactor ครั้งใหญ่เข้ากับการเปลี่ยน logic ใน PR เดียวกัน",
        "**เช็กก่อนเปิด PR ทุกครั้ง**: รัน `uv run ruff check .` และ `uv run pytest -q` ให้เขียว และอ่าน `git diff main...HEAD` ด้วยตาตัวเองหนึ่งรอบ",
      ],
      whyTitle: "Why this matters — ทำไมงาน AI ยิ่งต้องทำ PR เล็ก",
      whyParagraphs: [
        "ในระบบ AI การเปลี่ยนโค้ดแค่ไม่กี่บรรทัด (เช่น เปลี่ยน system prompt, ปรับ chunk size หรือเปลี่ยนโมเดล) สามารถทำให้คุณภาพคำตอบเปลี่ยนไปทั้งระบบได้",
        "หากคุณแยก PR ชัดเจนทีละเรื่อง เมื่อระบบ evaluation ใน Phase 5 พบว่าคะแนนตก คุณสามารถ `git revert` เฉพาะ PR ต้นเหตุได้ในไม่กี่วินาทีโดยไม่กระทบงานอื่น",
      ],
    },
    {
      id: "ai-repo-gitignore-hygiene",
      title: "2 · `.gitignore` สำหรับโปรเจกต์ AI: อะไรห้ามขึ้น Git และอะไรต้อง Commit",
      paragraphs: [
        "Git ถูกออกแบบมาเพื่อเก็บ **ซอร์สโค้ดและไฟล์ข้อความขนาดเล็ก** ไม่ใช่ที่เก็บความลับหรือไฟล์ไบนารีขนาดใหญ่ ในโปรเจกต์ AI มีไฟล์ 3 กลุ่มที่ต้องใส่ใน `.gitignore` ตั้งแต่วันแรก: (1) ความลับและ {{env-config}} เฉพาะเครื่อง (`.env`, `.env.local`, `*.pem`), (2) สภาพแวดล้อมและแคช (`{{venv|.venv/}}`, `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`), และ (3) ไฟล์ข้อมูลดิบ/น้ำหนักโมเดลขนาดใหญ่ (`data/raw/`, `*.parquet`, `*.pt`, `*.safetensors`, `*.gguf`, `*.onnx`)",
        "ในทางกลับกัน ไฟล์ที่ **ต้อง commit** เพื่อให้ทุกคนในทีมและ CI สร้างสภาพแวดล้อมได้เหมือนกันเป๊ะ ({{reproducibility}}) ได้แก่ `{{pyproject}}`, `{{lockfile|uv.lock}}`, `.gitignore`, และ `.env.example` (ไฟล์แม่แบบที่ใส่เฉพาะชื่อตัวแปร ไม่มีค่า key จริง)",
      ],
      analogy:
        "เหมือนการส่งพิมพ์เขียวบ้านให้ผู้รับเหมา — คุณส่งแบบแปลน (`pyproject.toml`, `uv.lock`) และรายการช่องปลั๊กไฟที่ต้องเตรียม (`.env.example`) แต่ไม่ส่งกุญแจตู้เซฟ (`.env`) หรืออิฐหินปูนจริงเป็นคันรถ (`data/raw/`, `*.pt`) ใส่ซองจดหมายไปด้วย",
      code: {
        language: "text",
        filename: ".gitignore",
        code: `# 1) Secrets & local environment config (NEVER commit real keys!)
.env
.env.*
!.env.example
*.pem
*.key

# 2) Python virtual environments & tool caches
.venv/
__pycache__/
*.py[cod]
.pytest_cache/
.ruff_cache/
.coverage
dist/
build/

# 3) AI datasets, local databases & model weights (use object storage / DVC / HF Hub)
data/raw/
data/interim/
*.parquet
*.sqlite
*.db
*.pt
*.pth
*.safetensors
*.gguf
*.onnx`,
        caption: "สังเกตบรรทัด `!.env.example` — ยกเว้นเฉพาะไฟล์แม่แบบให้ commit ได้ ส่วน `.env` และ `.env.local` ทุกตัวถูกกันไว้อย่างปลอดภัย",
      },
      whyTitle: "Why this matters — เผลอ Push คีย์ขึ้น Git แค่ 1 วินาที ลบทีหลังไม่ทันแล้ว",
      whyParagraphs: [
        "แม้คุณจะลบไฟล์ `.env` ใน commit ถัดไป แต่ค่า API key ยังฝังอยู่ใน Git history เดิม และบอตสแกน public repo สามารถดึงคีย์ไปใช้ได้ภายในไม่กี่วินาที — หากหลุดแล้วต้อง **revoke และออกคีย์ใหม่ทันที** เสมอ",
        "เช่นเดียวกัน หากเผลอ commit ไฟล์ `data/raw/tickets.parquet` ขนาด 500 MB หรือข้อมูลลูกค้าที่ติด {{pdpa}} โคลน repo ของทุกคนในทีมจะอืดถาวรและอาจละเมิดนโยบายความปลอดภัยองค์กร",
      ],
    },
    {
      id: "git-safety-and-pre-merge-checks",
      title: "3 · คำสั่งตรวจความปลอดภัยก่อน Commit และการใช้ `pre-commit` ช่วยกันพลาด",
      paragraphs: [
        "นิสัยที่แยกวิศวกรมืออาชีพออกจากมือใหม่คือ **ไม่เคยรัน `git add .` แล้ว `git commit` แบบหลับตา** ก่อน commit ทุกครั้งให้ตรวจ `git status` และ `git diff --staged` เพื่อยืนยันว่ามีเฉพาะไฟล์ที่ตั้งใจจริง ๆ และใช้ `git check-ignore -v <path>` เมื่อต้องการพิสูจน์ว่า `.gitignore` จับไฟล์ต้องห้ามได้ตรงกฎบรรทัดไหน",
        "หากเผลอ `git add .env` ไปแล้วแต่ยังไม่ได้ push สามารถถอนออกจาก staging ได้ทันทีด้วย `git restore --staged .env` (หรือ `git rm --cached .env` ถ้าเผลอ track ไว้แล้ว) และควรผูก {{pre-commit}} hooks เพื่อตรวจ {{ruff}}, ไฟล์ขนาดใหญ่ และแพตเทิร์นความลับโดยอัตโนมัติก่อนสร้างทุก commit",
      ],
      analogy:
        "เหมือนการตรวจเช็กกระเป๋าเดินทางก่อนรูดซิปปิดที่เคาน์เตอร์เช็กอิน (`git status` + `git diff --staged`) พร้อมเครื่องสแกนอัตโนมัติหน้าเกต (`pre-commit`) ช่วยเตือนก่อนเผลอพกของต้องห้ามขึ้นเครื่อง",
      code: {
        language: "bash",
        filename: "git_safety_checks.sh",
        code: `# 1. ตรวจว่าไฟล์ความลับและดาต้าถูก .gitignore จับไว้จริง (จะแสดงเลขบรรทัดใน .gitignore)
git check-ignore -v .env .venv/ data/raw/customers.parquet

# 2. ตรวจไฟล์ที่กำลังจะถูก commit ทุกครั้งก่อนสั่ง commit
git status -sb
git diff --staged --stat

# 3. กรณีเผลอ git add ไฟล์ที่ห้าม commit (ถอนจาก staging โดยไม่ลบไฟล์จริงบนเครื่อง)
git restore --staged .env

# 4. รัน lint + test ก่อนเปิด Pull Request
uv run ruff check .
uv run pytest -q`,
        caption: "`git restore --staged <file>` ถอนไฟล์ออกจาก staging area โดยไฟล์บนดิสก์ยังอยู่ครบ เหมาะมากเมื่อเผลอ stage ผิดไฟล์",
      },
      whyTitle: "Why this matters — กันพลาดด้วยระบบ ดีกว่าพึ่งความจำคน",
      whyParagraphs: [
        "วันที่คุณรีบแก้บั๊กตอน 5 โมงเย็น โอกาสเผลอ `git add .` ติดไฟล์ debug หรือไฟล์ CSV ชั่วคราวมีสูงมาก การวาง `.gitignore` + `pre-commit` + เช็ก `git status` คือระบบป้องกันหลายชั้น (defense in depth)",
        "ตั้งแต่ Day 22–32 และโปรเจกต์จบใน Phase 6 ทุก repo ของคุณจะใช้กฎความสะอาดนี้เป็นค่าเริ่มต้นทั้งหมด",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Git Hygiene ของทีม AI กับทีม JS/TS Web",
      body: [
        "ถ้าคุณเคยทำโปรเจกต์ Next.js / Node.js คุณคุ้นกับหลักการไม่ commit `node_modules/` และ `.env.local` อยู่แล้ว โลก Python AI ใช้ตรรกะเดียวกันเป๊ะ ต่างกันแค่ชื่อไฟล์และเพิ่มหมวด **ชุดข้อมูล/น้ำหนักโมเดล**:",
      ],
      table: [
        ["`pyproject.toml` + `uv.lock` (ต้อง commit)", "`package.json` + `pnpm-lock.yaml` / `package-lock.json`"],
        ["`.venv/` (ใส่ใน `.gitignore`)", "`node_modules/` (ใส่ใน `.gitignore`)"],
        ["`.env` + `!.env.example`", "`.env.local` + `!.env.example`"],
        ["`data/raw/`, `*.parquet`, `*.pt`, `*.gguf`", "สื่อขนาดใหญ่/dump DB (ไม่เก็บใน Git เก็บใน S3/GCS แทน)"],
        ["`pre-commit` + `ruff` + `pytest`", "`husky` + `lint-staged` + `eslint` + `vitest`"],
      ],
    },
    student: {
      title: "First-Year Note — อย่ากลัวการแตก Branch และอย่าทำลายไฟล์บนเครื่อง",
      body: [
        "หลายคนในโปรเจกต์มหาลัยเคยชินกับการทำทุกอย่างบน branch `main` หรือส่งโค้ดกันผ่านไฟล์ zip เพราะกลัว Git พัง — แต่จริง ๆ แล้ว **Branch ใน Git แค่เป็นป้ายชี้ไปยัง commit หนึ่งเท่านั้น** สร้างและลบได้ในเสี้ยววินาที",
        "จำคำสั่งช่วยชีวิตไว้ 2 คำสั่ง: `git switch -c feat/my-task` เพื่อสร้าง branch ใหม่ก่อนเริ่มแก้โค้ด และ `git restore --staged <file>` เพื่อยกเลิกการ `git add` โดยไม่ลบไฟล์บนเครื่องของคุณ",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองจำลองการตั้ง repo AI ใหม่จากศูนย์ แตก feature branch ตรวจสอบ `.gitignore` ด้วย `git check-ignore -v` และฝึกกู้สถานการณ์เมื่อเผลอ stage ไฟล์ต้องห้าม",
    steps: [
      {
        title: "1 · สร้างฐาน Repo สะอาดพร้อม `.gitignore` และ `.env.example`",
        explain:
          "วาง `.gitignore` และ `.env.example` ตั้งแต่ commit แรก แล้ว commit คู่กับ `pyproject.toml` และ `uv.lock` เพื่อล็อกสภาพแวดล้อมให้ทั้งทีม",
        code: {
          language: "bash",
          filename: "step1_bootstrap.sh",
          code: `cat << 'EOF' > .gitignore
.env
.env.*
!.env.example
.venv/
__pycache__/
.pytest_cache/
.ruff_cache/
data/raw/
*.parquet
*.pt
*.gguf
EOF

cat << 'EOF' > .env.example
OPENAI_API_KEY=replace-me
APP_ENV=dev
EOF

git status -sb`,
        },
        output: `## No commits yet on main
?? .env.example
?? .gitignore
?? pyproject.toml
?? uv.lock`,
      },
      {
        title: "2 · พิสูจน์ว่า `.gitignore` กัน `.env`, `.venv/` และไฟล์ข้อมูลดิบได้จริง",
        explain:
          "สร้างไฟล์จำลอง `.env` และ `data/raw/tickets.parquet` บนเครื่อง แล้วรัน `git check-ignore -v` เพื่อยืนยันกฎแต่ละบรรทัดก่อนเริ่มแตก feature branch",
        code: {
          language: "bash",
          filename: "step2_verify_ignore.sh",
          code: `mkdir -p data/raw
echo "OPENAI_API_KEY=sk-secret-demo" > .env
echo "dummy-binary-data" > data/raw/tickets.parquet

# ตรวจว่า Git เมินไฟล์ต้องห้ามทั้งหมด แต่ยังเห็น .env.example
git check-ignore -v .env .env.example data/raw/tickets.parquet
git status -sb`,
        },
        output: `.gitignore:1:.env	.env
.gitignore:8:data/raw/	data/raw/tickets.parquet
## No commits yet on main
?? .env.example
?? .gitignore
?? pyproject.toml
?? uv.lock`,
      },
      {
        title: "3 · แตก Feature Branch และรัน Pre-PR Check ก่อน Commit",
        explain:
          "แตก branch `feat/repo-hygiene` แยกจาก `main` ทำ commit ที่สะอาด และรัน `ruff` กับ `pytest` ทุกครั้งก่อนเปิด PR",
        code: {
          language: "bash",
          filename: "step3_branch_and_check.sh",
          code: `# Commit ฐานบน main (ทำครั้งเดียวตอนสร้าง repo)
git add .gitignore .env.example pyproject.toml uv.lock
git commit -m "chore: bootstrap repo with uv and AI gitignore"

# แตก feature branch สำหรับงานใหม่ทุกชิ้น
git switch -c feat/add-ticket-schema
git branch --show-current

# รัน quality gate ก่อนเปิด PR
uv run ruff check . && uv run pytest -q`,
        },
        output: `[main (root-commit) a1b2c3d] chore: bootstrap repo with uv and AI gitignore
 4 files changed, 48 insertions(+)
Switched to a new branch 'feat/add-ticket-schema'
feat/add-ticket-schema
All checks passed!`,
      },
    ],
    gotcha:
      "กับดักคลาสสิก: ถ้าคุณเผลอ `git commit .env` ไปแล้วครั้งหนึ่ง การมาเพิ่ม `.env` ลงใน `.gitignore` ทีหลัง **จะไม่หยุด Git จากการ track ไฟล์นั้น**! คุณต้องรัน `git rm --cached .env` เพื่อเลิก track ใน Git (พร้อม revoke คีย์ที่หลุดไปแล้วทันที)",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างเครื่องมือตรวจสอบความสะอาดของ AI Git Repo (`repo_hygiene_audit.py`) ที่ตรวจชื่อ feature branch, ตรวจไฟล์ต้องห้ามก่อน commit, ตรวจกฎจำเป็นใน `.gitignore`, และตรวจไฟล์มาตรฐานของโปรเจกต์ `uv`",
    requirements: [
      "สร้าง `is_valid_branch_name(name: str) -> bool` ที่อนุญาตเฉพาะรูปแบบ `<prefix>/<slug>` โดย `<prefix>` เป็นหนึ่งใน `{\"feat\", \"fix\", \"chore\", \"docs\", \"refactor\"}` และ `<slug>` มีเฉพาะตัวอักษรพิมพ์เล็ก `a-z`, ตัวเลข `0-9` และ `-` (ยาวอย่างน้อย 3 ตัวอักษร ไม่ขึ้นต้นหรือลงท้ายด้วย `-`)",
      "สร้าง `find_forbidden_staged_files(paths: list[str]) -> list[str]` ที่คืนรายชื่อไฟล์ต้องห้ามที่ไม่ควรถูก commit: `.env` หรือ `.env.*` (ยกเว้น `.env.example`), ไฟล์ใด ๆ ใต้ `.venv/` หรือ `data/raw/`, และไฟล์นามสกุล `.parquet`, `.pt`, `.safetensors`, `.gguf`, `.onnx` (รองรับ path ที่มีทั้ง `/` และ `\\`)",
      "สร้าง `missing_gitignore_rules(gitignore_path: Path) -> list[str]` ที่อ่านไฟล์ `.gitignore` (ข้ามบรรทัดว่างและคอมเมนต์ `#`) แล้วคืนรายการกฎจำเป็นที่ยังขาดจาก `[\".env\", \".venv/\", \"__pycache__/\", \"data/raw/\", \"*.parquet\", \"*.pt\"]` โดยคงลำดับเดิม",
      "สร้าง `missing_required_repo_files(repo_root: Path) -> list[str]` ที่ตรวจว่าโฟลเดอร์รากมีไฟล์มาตรฐานครบทั้ง `[\"pyproject.toml\", \"uv.lock\", \".gitignore\", \".env.example\"]` และคืนเฉพาะชื่อไฟล์ที่ขาด",
      "รันชุดเทสต์ `uv run pytest -q` และ `uv run ruff check .` ให้ผ่านทั้งหมดโดยไม่มี warning",
    ],
    starter: {
      language: "python",
      filename: "repo_hygiene_audit.py",
      code: `import re
from pathlib import Path

ALLOWED_PREFIXES = {"feat", "fix", "chore", "docs", "refactor"}
BRANCH_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$")

FORBIDDEN_SUFFIXES = {".parquet", ".pt", ".safetensors", ".gguf", ".onnx"}
REQUIRED_GITIGNORE_RULES = [
    ".env",
    ".venv/",
    "__pycache__/",
    "data/raw/",
    "*.parquet",
    "*.pt",
]
REQUIRED_REPO_FILES = [
    "pyproject.toml",
    "uv.lock",
    ".gitignore",
    ".env.example",
]


def is_valid_branch_name(name: str) -> bool:
    # TODO: ตรวจรูปแบบ <prefix>/<kebab-case-slug>
    raise NotImplementedError


def find_forbidden_staged_files(paths: list[str]) -> list[str]:
    # TODO: คืนรายชื่อไฟล์ต้องห้าม (ยกเว้น .env.example)
    raise NotImplementedError


def missing_gitignore_rules(gitignore_path: Path) -> list[str]:
    # TODO: อ่าน .gitignore และคืนรายการใน REQUIRED_GITIGNORE_RULES ที่ยังขาด
    raise NotImplementedError


def missing_required_repo_files(repo_root: Path) -> list[str]:
    # TODO: ตรวจว่ามีไฟล์ใน REQUIRED_REPO_FILES ครบใน repo_root หรือไม่
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_repo_hygiene_audit.py",
      code: `from pathlib import Path
from repo_hygiene_audit import (
    find_forbidden_staged_files,
    is_valid_branch_name,
    missing_gitignore_rules,
    missing_required_repo_files,
)


def test_branch_name_validation():
    assert is_valid_branch_name("feat/thai-ticket-cli") is True
    assert is_valid_branch_name("fix/retry-429") is True
    assert is_valid_branch_name("chore/update-uv-lock") is True

    assert is_valid_branch_name("main") is False
    assert is_valid_branch_name("feature/wrong-prefix") is False
    assert is_valid_branch_name("feat/HasUpperCase") is False
    assert is_valid_branch_name("feat/a") is False
    assert is_valid_branch_name("feat/-bad-slug-") is False


def test_find_forbidden_staged_files():
    staged = [
        "pyproject.toml",
        "uv.lock",
        ".env.example",
        ".env",
        ".env.local",
        ".venv/bin/python",
        "data/raw/tickets.jsonl",
        "data\\\\raw\\\\export.csv",
        "models/classifier.pt",
        "artifacts/dataset.parquet",
        "weights/qwen.gguf",
        "src/app/main.py",
    ]
    forbidden = find_forbidden_staged_files(staged)
    assert forbidden == [
        ".env",
        ".env.local",
        ".venv/bin/python",
        "data/raw/tickets.jsonl",
        "data\\\\raw\\\\export.csv",
        "models/classifier.pt",
        "artifacts/dataset.parquet",
        "weights/qwen.gguf",
    ]


def test_missing_gitignore_rules(tmp_path: Path):
    gitignore = tmp_path / ".gitignore"
    gitignore.write_text(
        "# Secrets & env\\n.env\\n.venv/\\n\\n# Cache\\n__pycache__/\\n",
        encoding="utf-8",
    )
    assert missing_gitignore_rules(gitignore) == ["data/raw/", "*.parquet", "*.pt"]


def test_missing_required_repo_files(tmp_path: Path):
    (tmp_path / "pyproject.toml").write_text("[project]\\nname='demo'\\n", encoding="utf-8")
    (tmp_path / ".gitignore").write_text(".env\\n", encoding="utf-8")
    assert missing_required_repo_files(tmp_path) == ["uv.lock", ".env.example"]
`,
    },
    selfCheck: [
      "`is_valid_branch_name` ปฏิเสธ `main`, prefix นอกรายการ, ตัวพิมพ์ใหญ่ และ slug ที่สั้นหรือมีขีดนำหน้า/ลงท้าย",
      "`find_forbidden_staged_files` จับ `.env`, `.env.local`, `.venv/...`, `data/raw/...` และไฟล์โมเดล/Parquet แต่ **ปล่อยผ่าน** `.env.example`, `pyproject.toml`, `uv.lock`",
      "`missing_gitignore_rules` อ่านไฟล์ด้วย `UTF-8`, ข้ามบรรทัดคอมเมนต์ `#`, และคืนกฎที่ขาดตามลำดับ",
      "`missing_required_repo_files` ตรวจการมีอยู่ของทั้ง 4 ไฟล์มาตรฐานด้วย `(repo_root / filename).is_file()`",
      "รัน `uv run pytest -q` ผ่าน 4/4 และ `uv run ruff check .` ไม่มี error",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `find_forbidden_staged_files` ให้ normalize path ก่อนตรวจด้วย `norm = raw.replace('\\\\', '/')` และใช้ `PurePosixPath(norm)` เพื่อดึง `name`, `parts`, และ `suffix` ได้ตรงกันทั้งบน Windows และ macOS/Linux",
      },
      {
        body: "เงื่อนไขไฟล์ `.env`: `name == '.env'` หรือ (`name.startswith('.env.')` และ `name != '.env.example'`) ส่วนโฟลเดอร์ต้องห้ามให้เช็ก `'.venv' in parts` หรือ `'data/raw/' in f'{norm}/'` (หรือ `parts[:2] == ('data', 'raw')`)",
      },
      {
        body: "โครงของ `is_valid_branch_name` และ `missing_gitignore_rules` พร้อมแล้ว เติมตรรกะของ `find_forbidden_staged_files` และ `missing_required_repo_files` ให้ครบ",
        code: {
          language: "python",
          filename: "hint-d021-l3.py",
          code: `from pathlib import Path, PurePosixPath
import re

ALLOWED_PREFIXES = {"feat", "fix", "chore", "docs", "refactor"}
BRANCH_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$")
REQUIRED_GITIGNORE_RULES = [".env", ".venv/", "__pycache__/", "data/raw/", "*.parquet", "*.pt"]


def is_valid_branch_name(name: str) -> bool:
    if name.count("/") != 1:
        return False
    prefix, slug = name.split("/", 1)
    return prefix in ALLOWED_PREFIXES and bool(BRANCH_SLUG_RE.match(slug))


def missing_gitignore_rules(gitignore_path: Path) -> list[str]:
    if not gitignore_path.is_file():
        return list(REQUIRED_GITIGNORE_RULES)
    lines = {
        line.strip()
        for line in gitignore_path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.strip().startswith("#")
    }
    return [rule for rule in REQUIRED_GITIGNORE_RULES if rule not in lines]`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .
# ทดสอบกับ .gitignore จริงในโฟลเดอร์คุณ
git check-ignore -v .env .venv/ data/raw/sample.parquet || true`,
      caption: "ลองนำฟังก์ชัน `missing_gitignore_rules` ไปตรวจไฟล์ `.gitignore` ในโปรเจกต์จริงของคุณด้วย",
    },
  },

  mistakes: [
    {
      title: "เผลอ `git add .` โดยไม่ตรวจ `git status` จนไฟล์ `.env` หรือไฟล์ CSV ข้อมูลลูกค้าหลุดขึ้น repo",
      symptom: "API key ถูกสแกนเจอหรือข้อมูลลูกค้าที่ติด PDPA ฝังอยู่ใน Git history ของทีม",
      fix: "วาง `.gitignore` ตั้งแต่วันแรก ตรวจ `git status` + `git diff --staged` ก่อนทุก commit และถ้าคีย์หลุดแล้วให้ **revoke คีย์ทันที**",
    },
    {
      title: "เพิ่ม `.env` ลง `.gitignore` ทีหลัง แต่ไฟล์ยังโผล่ใน `git diff` อยู่เรื่อย ๆ",
      symptom: "แก้ `.gitignore` แล้วแต่ Git ยังคงตามเก็บการเปลี่ยนแปลงของ `.env` ต่อไป",
      fix: "`.gitignore` มีผลเฉพาะกับไฟล์ที่ยังไม่ถูก track — ให้รัน `git rm --cached .env` แล้ว commit เพื่อให้ Git เลิก track โดยไม่ลบไฟล์จริงบนเครื่อง",
    },
    {
      title: "Commit โฟลเดอร์ `.venv/` หรือลืม commit `uv.lock`",
      symptom: "ถ้า commit `.venv/` repo จะใหญ่เป็นร้อย MB และพังข้าม OS; แต่ถ้าไม่ commit `uv.lock` เพื่อนร่วมทีมจะได้แพ็กเกจคนละเวอร์ชัน",
      fix: "ใส่ `.venv/` ใน `.gitignore` เสมอ และ commit ทั้ง `pyproject.toml` กับ `uv.lock` คู่กันทุกครั้งที่เพิ่ม/อัปเดต dependency",
    },
    {
      title: "ทำ PR ก้อนเดียว 2,000 บรรทัดที่ปนทั้งแก้บั๊ก, จัดฟอร์แมต และเพิ่มฟีเจอร์ใหม่",
      symptom: "เพื่อนร่วมทีมรีวิวไม่ไหวจนกด approve ผ่าน ๆ ทำให้บั๊กหลุดขึ้น `main` และย้อนกลับยาก",
      fix: "แตก branch และ PR ให้เล็ก (1 PR = 1 วัตถุประสงค์) แยก PR จัดฟอร์แมต/refactor ออกจาก PR ที่เปลี่ยน behavior",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อตรวจความเข้าใจ Git Workflow, `.gitignore` สำหรับโปรเจกต์ AI และการจัดการไฟล์ที่เผลอ track — ลองตอบแล้วตรวจเหตุผลทันที",
    questions: [
      mc(
        "d021-q1",
        "ในโปรเจกต์ AI ที่ใช้ `uv` ชุดไฟล์ใดต่อไปนี้ที่ **ควร commit เข้า Git** ทั้งหมด?",
        [
          ["`.env`, `pyproject.toml`, `.venv/`", "ผิด — ห้าม commit ทั้ง `.env` (ความลับ) และ `.venv/` (สภาพแวดล้อมผูก OS)"],
          ["`pyproject.toml`, `uv.lock`, `.gitignore`, `.env.example`", "ถูก — ชุดนี้ให้ reproducibility ครบถ้วน โดยไม่มีความลับหรือไฟล์ไบนารีขนาดใหญ่หลุดขึ้น repo"],
          ["`data/raw/tickets.parquet`, `uv.lock`, `.env.example`", "ไม่ควรเก็บไฟล์ข้อมูลดิบ `.parquet` ขนาดใหญ่ใน Git — ควรเก็บใน object storage แทน"],
          ["เฉพาะไฟล์ `.py` ไม่ต้อง commit `uv.lock` เพื่อลด diff", "ถ้าไม่ commit `uv.lock` เพื่อนร่วมทีมและ CI อาจได้ transitive dependency คนละเวอร์ชัน"],
        ],
        "B",
        "มาตรฐานโปรเจกต์ Python AI สมัยใหม่คือ commit `pyproject.toml`, `uv.lock`, `.gitignore` และ `.env.example` ส่วนความลับ `.env`, `.venv/` และ raw data/model weights ต้องอยู่ใน `.gitignore`",
        "4 ไฟล์พื้นฐานที่ควร commit ในทุกโปรเจกต์ Python AI ที่ใช้ `uv` คืออะไร?",
        "`pyproject.toml`, `uv.lock`, `.gitignore`, และ `.env.example` (ห้าม commit `.env`, `.venv/`, raw data หรือ model weights)",
      ),
      mc(
        "d021-q2",
        "เพื่อนร่วมทีมเผลอ commit ไฟล์ `.env` (ที่มี API key จริง) ขึ้น GitHub repository แล้วเพิ่งมาเพิ่ม `.env` ลงใน `.gitignore` ใน commit ถัดไป ข้อใดกล่าวถูกต้องที่สุด?",
        [
          ["ปลอดภัยแล้ว เพราะ `.gitignore` จะลบไฟล์และประวัติเก่าออกจาก GitHub ให้อัตโนมัติ", "ไม่จริง — `.gitignore` ไม่ลบไฟล์ที่ถูก track อยู่แล้ว และไม่ลบประวัติ commit เก่า"],
          ["ต้องรัน `git rm --cached .env` เพื่อเลิก track และ **revoke/rotate API key นั้นทันที** เพราะคีย์ยังอยู่ใน Git history", "ถูก — คีย์ที่เคยขึ้น remote ถือว่ารั่วแล้ว ต้องเพิกถอนและออกคีย์ใหม่ทันที พร้อมเลิก track ไฟล์ใน Git"],
          ["แค่ลบไฟล์ `.env` ในเครื่องแล้ว push ก็พอ ไม่ต้องเปลี่ยนคีย์", "ประวัติ commit ก่อนหน้ายังเก็บค่าคีย์เดิมอยู่ครบ ใครดึง `git log -p` ก็เห็นได้ทันที"],
          ["เปลี่ยนชื่อไฟล์เป็น `.env.prod` ก็ปลอดภัยแล้ว", "การเปลี่ยนชื่อไม่ลบคีย์เดิมที่หลุดไปแล้ว และ `.env.*` ก็ไม่ควร commit เช่นกัน"],
        ],
        "B",
        "กฎความปลอดภัยสำคัญ: `.gitignore` ไม่มีผลย้อนหลังกับไฟล์ที่ถูก track แล้ว และคีย์ที่เคยหลุดขึ้น remote ต้องถือว่าถูกเปิดเผยแล้ว — ต้อง revoke/rotate ทันทีและใช้ `git rm --cached` เลิก track",
        "หากเผลอ commit และ push ไฟล์ `.env` ขึ้น remote แล้ว ต้องทำ 2 อย่างใดทันที?",
        "1) Revoke/rotate API key ที่หลุดทันที (เพราะยังอยู่ใน Git history) และ 2) ใช้ `git rm --cached .env` + ใส่ `.env` ใน `.gitignore` เพื่อเลิก track",
      ),
      mc(
        "d021-q3",
        "คุณเผลอรัน `git add .` แล้วพบใน `git status` ว่าไฟล์ `scratch_notes.txt` ที่ไม่อยาก commit ติดเข้าไปใน staging area ด้วย แต่คุณยังต้องการเก็บไฟล์นี้ไว้บนเครื่อง ควรใช้คำสั่งใด?",
        [
          ["`git rm -f scratch_notes.txt`", "อันตราย — คำสั่งนี้จะลบไฟล์จริงออกจากเครื่องคุณด้วย"],
          ["`git restore --staged scratch_notes.txt`", "ถูก — ถอนไฟล์ออกจาก staging area เท่านั้น โดยไฟล์จริงใน working directory ยังอยู่ครบเหมือนเดิม"],
          ["`git reset --hard HEAD`", "อันตรายมาก — จะล้างการแก้ไขทุกไฟล์ที่ยังไม่ commit ทิ้งทั้งหมด"],
          ["`git push --force`", "ไม่เกี่ยวข้องกับการ unstage และไม่ควรใช้ force push บน branch หลัก"],
        ],
        "B",
        "`git restore --staged <path>` คือคำสั่งสมัยใหม่ที่ปลอดภัยที่สุดในการนำไฟล์ออกจาก staging area โดยไม่แตะต้องเนื้อหาไฟล์บนดิสก์",
        "จะถอนไฟล์ออกจาก Git staging area โดยไม่ลบไฟล์จริงบนเครื่องด้วยคำสั่งใด?",
        "`git restore --staged <file>`",
      ),
      mc(
        "d021-q4",
        "ในทีม AI ที่ต้องปรับปรุง prompt, schema และ pipeline ต่อเนื่อง เหตุใดจึงควรแตก feature branch และเปิด Pull Request ขนาดเล็ก แทนการ push ตรงเข้า `main`?",
        [
          ["เพราะ Git ไม่อนุญาตให้ commit บน `main` เกินวันละ 1 ครั้ง", "Git ไม่ได้จำกัดจำนวน commit บน `main` แต่ทีมจำกัดผ่าน branch protection เพื่อคุณภาพ"],
          ["ช่วยให้ `main` พร้อมใช้งานเสมอ รีวิวผลกระทบได้ละเอียด และสามารถ `git revert` เฉพาะ PR ที่ทำให้คุณภาพ AI ตกได้ทันที", "ถูก — PR ขนาดเล็กที่มี automated checks คือรากฐานของการพัฒนาและดูแลระบบ AI อย่างปลอดภัย"],
          ["เพราะ branch ย่อยทำงานเร็วกว่า branch `main` ตอนรัน Python", "ชื่อ branch ไม่มีผลต่อความเร็วการรัน Python"],
          ["เพื่อให้ไม่ต้องเขียน unit test ในโปรเจกต์", "PR ยิ่งต้องมาคู่กับ automated checks (`ruff`, `pytest`) เพื่อตรวจคุณภาพก่อน merge"],
        ],
        "B",
        "Feature branch + Small PR + Automated Checks (`ruff`, `pytest`) ทำให้ `main` เสถียร รีวิวง่าย และย้อนกลับ (rollback) เมื่อเกิด regression ได้อย่างแม่นยำ",
        "ประโยชน์หลักของการทำ Feature Branch + Small PR ในทีม AI คืออะไร?",
        "รักษาให้ `main` เสถียรพร้อม deploy เสมอ รีวิวการเปลี่ยนแปลงได้ทั่วถึง และ revert เฉพาะ PR ที่ก่อ regression ได้ทันที",
      ),
    ],
  },

  takeaways: [
    "แยกงานใหม่ทุกชิ้นออกเป็น feature branch (`feat/...`, `fix/...`, `chore/...`) และเปิด PR ขนาดเล็กเพื่อให้รีวิวและ rollback ได้ง่าย",
    "ตั้ง `.gitignore` สำหรับโปรเจกต์ AI ตั้งแต่วันแรก: กัน `.env*` (ยกเว้น `!.env.example`), `.venv/`, แคชเครื่องมือ, และ `data/raw/` / `*.parquet` / `*.pt` / `*.gguf`",
    "Commit `pyproject.toml`, `uv.lock`, `.gitignore` และ `.env.example` เสมอเพื่อรับประกัน reproducibility ของทั้งทีมและ CI",
    "ตรวจ `git status`, `git diff --staged`, `git check-ignore -v` และรัน `uv run ruff check . && uv run pytest -q` ก่อนเปิดทุก PR",
  ],

  reviewCards: [
    rc(
      "d021-rc-1",
      "ไฟล์ 3 กลุ่มใดในโปรเจกต์ AI ที่ **ต้อง** อยู่ใน `.gitignore` และชุดไฟล์ใดที่ **ต้อง** commit เข้า Git?",
      "ต้อง ignore: (1) `.env`/keys (ยกเว้น `!.env.example`), (2) `.venv/` และแคช, (3) raw data/model weights (`data/raw/`, `*.parquet`, `*.pt`, `*.gguf`) | ต้อง commit: `pyproject.toml`, `uv.lock`, `.gitignore`, `.env.example`",
    ),
    rc(
      "d021-rc-2",
      "ทำไมการเพิ่มชื่อไฟล์ลงใน `.gitignore` ทีหลังจึงไม่หยุด Git จากการ track ไฟล์ที่เคย commit ไปแล้ว และต้องแก้อย่างไร?",
      "`.gitignore` มีผลเฉพาะกับไฟล์ untracked — ต้องรัน `git rm --cached <file>` เพื่อเลิก track โดยไม่ลบไฟล์บนเครื่อง (และหากเป็น API key ที่เคย push แล้วต้อง revoke คีย์ทันที)",
    ),
    rc(
      "d021-rc-3",
      "ใช้คำสั่ง Git ใดเพื่อเช็กว่า `.gitignore` บรรทัดไหนกำลังเมินไฟล์อยู่ และคำสั่งใดเพื่อถอนไฟล์ที่เผลอ `git add` ออกจาก staging?",
      "เช็กกฎ ignore: `git check-ignore -v <path>` | ถอนจาก staging โดยไม่ลบไฟล์จริง: `git restore --staged <path>`",
    ),
  ],

  sources: [
    { label: "Git Official Docs — gitignore Pattern Format", href: "https://git-scm.com/docs/gitignore" },
    { label: "Git Official Docs — git-check-ignore", href: "https://git-scm.com/docs/git-check-ignore" },
    { label: "GitHub Docs — GitHub Flow (Branches & Pull Requests)", href: "https://docs.github.com/en/get-started/using-github/github-flow" },
    { label: "uv Official Docs — Locking and Syncing (Committing uv.lock)", href: "https://docs.astral.sh/uv/concepts/projects/sync/" },
  ],

  glossary: [
    "uv",
    "venv",
    "lockfile",
    "reproducibility",
    "pyproject",
    "env-config",
    "pre-commit",
    "pdpa",
  ],
});
