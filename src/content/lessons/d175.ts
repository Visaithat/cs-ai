import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D175 — Phase 6 / Block B44
 * Containerize (Docker) & Deploy to Staging Cloud + GitHub Actions CI
 */
export const d175: Lesson = defineLesson({
  day: 175,
  titleTh: "ทำ Container ด้วย Docker และ Deploy ขึ้น Staging Cloud พร้อม GitHub Actions CI",
  tagline: "30 นาที · Packaging & CI/CD · บิลด์ Multi-stage Docker แบบ non-root, แยก Readiness Probe และตั้ง Gate ใน GitHub Actions",
  icon: "server",
  visual: {
    id: "capstone-secure-deploy",
    title: "ท่อส่งขึ้น Staging — Multi-stage Docker + GitHub Actions CI/CD Gate",
    caption: "เลือกด่าน D175 เพื่อดูการแพ็กเกจด้วย uv + Docker แบบ non-root, รัน CI Gate (ruff + pytest + eval), และปล่อยขึ้น Staging Cloud",
    alt: "แผนภาพสายพานความปลอดภัยและ Deploy ของ Capstone โดยเน้นด่าน D175 Docker และ Staging CI",
  },
  requiresApiKey: false,
  tools: ["Docker", "uv", "GitHub Actions", "FastAPI", "pytest"],

  bigPicture: [
    {
      node: 4,
      heading: "แพ็กเกจแอป FastAPI + RAG ให้รันเหมือนกันทุกเครื่องด้วย Docker",
      body: "โค้ดที่รันบนเครื่องคุณผ่านแต่อาจพังบนเซิร์ฟเวอร์เพราะเวอร์ชัน Python, C-extension ของ PyThaiNLP/tokenizer หรือ library ต่างกัน",
      lessonNote: "วันนี้เราเขียน Multi-stage {{dockerfile}} ที่ล็อก dependency ผ่าน {{lockfile}} (`uv.lock`) และรันด้วย user สิทธิ์ต่ำ (non-root) เพื่อพร้อมส่งขึ้น Cloud Run หรือ Fly.io",
    },
    {
      node: 3,
      heading: "บังคับ Eval & Security Gate บน GitHub Actions ก่อน Deploy เสมอ",
      body: "การ deploy ด้วยมือจากเครื่องตัวเองเสี่ยงต่อการเผลอส่งโค้ดที่ยังไม่ได้รันเทสต์หรือมี secret หลุดติด image ขึ้นไปบนอินเทอร์เน็ต",
      lessonNote: "เราตั้ง pipeline ใน GitHub Actions ให้ตรวจ `ruff` + `pytest` (รวมเทสต์ PDPA/OWASP และ retrieval/eval gate) ก่อนอนุญาตให้ build และ deploy สู่ Staging",
    },
    {
      node: 5,
      heading: "แยก Healthcheck (Liveness vs Readiness) และ Config แบบ Twelve-Factor",
      body: "เมื่อ container เปิดพอร์ตขึ้นมาแล้ว ไม่ได้แปลว่าเชื่อมต่อ vector DB หรือโหลด {{env-config}} ครบพร้อมรับทราฟฟิกทันที",
      lessonNote: "เราแยก `/healthz` ออกจาก `/readyz` และบังคับตรวจ staging config แบบ {{fail-fast}} เพื่อไม่ให้ Staging รับ traffic ทั้งที่ยังตั้งค่าไม่สมบูรณ์",
    },
  ],

  objectives: [
    "**เขียน** Multi-stage {{dockerfile}} สำหรับโปรเจกต์ Python/{{uv}} ที่ใช้ `uv.lock` (`--frozen`), ขนาดเล็ก, ไม่ฝัง secret, มี `HEALTHCHECK`, และรันด้วย non-root user",
    "**ออกแบบ** GitHub Actions CI/CD workflow ที่บังคับผ่าน `ruff` + `pytest` + security/eval checks ก่อนสร้าง container และ deploy ขึ้น Staging Cloud",
    "**สร้างระบบตรวจสอบ** Staging Readiness & Preflight Guard ด้วย Python เพื่อเช็กความปลอดภัยของ Dockerfile และ {{env-config}} แบบ {{reproducibility}} ก่อนปล่อยขึ้น Staging (ทดสอบ offline 100%)",
  ],

  prerequisites: [
    "มี FastAPI SSE app (`src/api_sse.py`) และ Security Middleware (`src/security_middleware.py`) จาก D173–D174",
    "เคยเรียน Production Dockerfile และ Cloud Deployment จาก Phase 5 (D141–D143)",
    "มี `uv`, `pytest` และ `ruff` พร้อมใช้งาน (ไม่จำเป็นต้องมีบัญชี cloud หรือ Docker daemon ก็ทำแบบฝึกหัดได้)",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมไฟล์กำหนดค่าการ Deploy และ Pre-flight Gate ในรีโป Capstone เพื่อให้ CI ตรวจจับข้อผิดพลาดก่อนส่งขึ้น Staging ทุกครั้ง",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p .github/workflows src tests
uv add pydantic
uv add --dev pytest ruff
uv lock --check || uv lock`,
    steps: [
      ["dir", "ตรวจโฟลเดอร์ `.github/workflows/`, `src/`, `tests/` ในรีโป"],
      ["lock", "ตรวจสอบว่า `uv.lock` เป็นปัจจุบันตรงกับ `pyproject.toml`"],
      ["ready", "พร้อมเขียน Multi-stage Dockerfile, CI Workflow และ Deployment Gate"],
    ],
    note: "แบบฝึกหัดวันนี้ตรวจสอบทั้ง Dockerfile security rules และ staging config validation ด้วย `pytest` แบบ offline จึงทำได้ครบแม้ไม่ได้เปิด Docker Desktop หรือผูกบัตรเครดิต Cloud",
  },

  concepts: [
    {
      id: "multistage-uv-dockerfile",
      title: "1 · Production Multi-stage Dockerfile สำหรับ Python + uv",
      paragraphs: [
        "การเขียน {{dockerfile}} แบบง่าย ๆ (`FROM python:3.12` + `COPY . .` + `pip install .`) มักได้ image ขนาดใหญ่เกิน 1 GB, ติด build tools (`gcc`, header files) ค้างไว้ใน production, รันด้วยสิทธิ์ `root` ซึ่งอันตรายมากหากถูกเจาะ, และสร้าง cache พังทุกครั้งที่แก้โค้ด 1 บรรทัด",
        "มาตรฐาน Production สำหรับระบบ Capstone ใช้ **2-Stage Build**: Stage แรก (`builder`) ใช้ `uv sync --frozen --no-dev --no-install-project` โดย copy เฉพาะ `pyproject.toml` กับ `uv.lock` ({{lockfile}}) เข้ามาก่อนเพื่อให้ Docker cache layer การติดตั้ง library ไว้ได้; Stage ที่สอง (`runtime`) ใช้ `python:3.12-slim`, ก๊อปปี้เฉพาะ `.venv` และ `src/` เข้ามา, สร้าง user ไร้สิทธิ์ `appuser` (`USER appuser`), และกำหนด `HEALTHCHECK` เรียก `/healthz`",
        "อย่าลืมสร้างไฟล์ **`.dockerignore`** ตัด `.git/`, `.env*`, `.venv/`, `tests/`, `__pycache__/`, และ `evals/` ออก เพื่อไม่ให้ secret หรือไฟล์ชั่วคราวหลุดเข้าไปฝังใน Docker image layer",
      ],
      analogy: "เหมือนครัวร้านอาหารที่แยก 'ห้องเตรียมวัตถุดิบ' (builder stage ที่มีเครื่องมือหนักและกล่องแพ็กเกจ) ออกจาก 'เคาน์เตอร์เสิร์ฟจริง' (runtime stage ที่มีแค่อาหารพร้อมเสิร์ฟ สะอาด เบา และล็อกห้องเก็บกุญแจไว้)",
      bullets: [
        "**`--frozen --no-dev`**: บังคับใช้เวอร์ชันเป๊ะตาม `uv.lock` และไม่ลง `pytest`/`ruff` ใน container จริง",
        "**Non-root (`USER appuser`)**: ลดความเสียหายหากเกิด vulnerability ใน runtime",
        "**No Secrets in `ENV` / `ARG`**: ห้ามเขียน `ENV OPENAI_API_KEY=...` ลงใน Dockerfile เพราะใครดึง image ไป `docker history` ก็เห็นทันที",
      ],
      code: {
        language: "dockerfile",
        filename: "Dockerfile",
        code: `# Stage 1: Builder (ติดตั้ง dependency จาก uv.lock)
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Stage 2: Minimal Non-Root Runtime
FROM python:3.12-slim AS runtime
WORKDIR /app
RUN useradd --create-home --shell /bin/bash appuser
COPY --from=builder /app/.venv /app/.venv
COPY src/ /app/src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz')" || exit 1
CMD ["uvicorn", "src.api_sse:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]`,
        caption: "Multi-stage Dockerfile ที่ทั้งเล็ก, cache ดี, รันแบบ non-root, และมี HEALTHCHECK ในตัว",
      },
      whyTitle: "Why this matters — Image ดีช่วยลดทั้งเวลา Deploy และพื้นที่โจมตี",
      whyParagraphs: [
        "บน Cloud Run หรือ Fly.io ขนาด image มีผลตรงต่อ **Cold Start Time**: ยิ่ง image เล็กและ compile bytecode ไว้ (`UV_COMPILE_BYTECODE=1`) แอปยิ่งสตาร์ทรับคำขอแรกได้เร็ว",
        "การไม่ใส่ `.env` และไม่รันเป็น `root` เป็นเช็กลิสต์แรก ๆ ที่ผู้สัมภาษณ์สาย Cloud / DevSecOps เปิดดูในรีโปของคุณ",
      ],
    },
    {
      id: "staging-secrets-and-probes",
      title: "2 · Staging Cloud Config, Secrets และ Liveness vs Readiness",
      paragraphs: [
        "เมื่อนำ container ขึ้น Staging Cloud (เช่น Google Cloud Run, Fly.io, หรือ Render) ค่าตั้งต้นต้องมาจาก **Runtime Environment Variables** ตามหลัก {{env-config}} โดยแยกเป็น 2 กลุ่ม: ค่าตั้งทั่วไป (`APP_ENV=staging`, `LOG_LEVEL=INFO`, `ALLOWED_ORIGINS=https://staging.example.com`) และความลับ (`LLM_API_KEY`, `LANGFUSE_SECRET_KEY`) ที่ฉีดผ่าน Secret Manager ของแพลตฟอร์มเท่านั้น",
        "และต้องแยก endpoint ตรวจสอบสุขภาพเป็น 2 ตัวเสมอ: **`/healthz` (Liveness)** ตอบ `200 OK` เพื่อบอกว่า process FastAPI ยังไม่ค้างตาย (อย่าเอา query DB หนัก ๆ มาใส่ที่นี่ ไม่งั้น DB กระตุกทีเดียว container โดนฆ่าวนลูป!) ส่วน **`/readyz` (Readiness)** ตรวจว่า config ครบและ vector store/upstream พร้อมรับทราฟฟิกจริง ก่อนให้ Load Balancer ส่งผู้ใช้เข้ามา",
      ],
      analogy: "`/healthz` เหมือนการเช็กชีพจรว่าคนยังตื่นอยู่ไหม ส่วน `/readyz` เหมือนการเช็กว่าพ่อครัวเปิดเตาและเตรียมวัตถุดิบครบพร้อมรับออเดอร์โต๊ะแรกแล้วหรือยัง",
      bullets: [
        "**Fail-Fast on Bad Config**: ถ้า `APP_ENV=staging` แต่ใช้ค่า `CORS_ALLOW_ORIGINS=*` คู่กับ credentials หรือ key ยังเป็น `changeme` / `sk-test-placeholder` ให้ปฏิเสธตั้งแต่ start",
        "**Dynamic `PORT`**: Cloud PaaS หลายเจ้ากำหนดพอร์ตผ่าน `$PORT` (เช่น `8080` บน Cloud Run) จึงควรอ่านจาก environment แทนการ hardcode `8000` ตายตัวใน production script",
        "**Graceful Shutdown**: ตั้ง `--timeout-graceful-shutdown 15` ให้ SSE ที่ค้างอยู่ปิดตัวสะอาดก่อน container ถูกหมุนเวียนเวอร์ชัน",
      ],
      whyTitle: "Why this matters — Zero-Downtime Rollout และปลอดภัยจากค่าตั้งหลุด",
      whyParagraphs: [
        "หากไม่มี `/readyz` เวลาคุณ deploy เวอร์ชันใหม่ ระบบ cloud จะส่งทราฟฟิกลูกค้าเข้าไปทันทีที่พอร์ตเปิด ทั้งที่ index ยังโหลดไม่เสร็จ ทำให้ผู้ใช้เจอ `500` เป็นช่วง ๆ",
        "การตรวจ secret placeholder ฝั่งโค้ดช่วยกันอุบัติเหตุ deploy ขึ้น Staging แล้วระบบพังเพราะลืมตั้ง secret ใน dashboard",
      ],
    },
    {
      id: "github-actions-cicd-gate",
      title: "3 · GitHub Actions CI/CD: ห้ามข้าม Gate ขึ้น Staging",
      paragraphs: [
        "หัวใจของ B44 คือ **การทำให้คุณภาพและความปลอดภัยทำงานอัตโนมัติทุกครั้งที่ push โค้ด** ใน `.github/workflows/ci-staging.yml` เราแบ่งงานเป็น 2 jobs ที่ต่อกันด้วย `needs`: Job แรกคือ **`quality-and-security-gate`** (รัน `uv sync --frozen`, `ruff check .`, `pytest -q` ครอบคลุม PDPA, OWASP และ Eval Gate) และ Job ที่สองคือ **`deploy-staging`** ซึ่งจะทำงานเฉพาะเมื่อ Job แรกผ่าน 100% และเป็น branch `main` เท่านั้น",
        "ใน Job Deploy เราสามารถใส่ขั้นตอนตรวจ build `docker build -t app:ci .` และส่งออก URL ของ Staging ที่ deploy เสร็จแล้วไปให้ขั้นตอน Smoke Test ตรวจ `/healthz` และ `/readyz` ต่อทันที เพื่อยืนยันว่าการปล่อยรอบล่าสุดใช้งานได้จริง",
      ],
      analogy: "เหมือนสายพานโรงงานที่รถทุกคันต้องผ่านด่านตรวจเบรกและถุงลมนิรภัย (`quality-and-security-gate`) ก่อนประตูห้องพ่นสีและลานส่งมอบ (`deploy-staging`) จะเปิดอัตโนมัติ",
      code: {
        language: "yaml",
        filename: ".github/workflows/ci-staging.yml",
        code: `name: CI & Staging Deploy
on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality-and-security-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5
        with:
          enable-cache: true
      - run: uv sync --frozen
      - run: uv run ruff check .
      - run: uv run pytest -q
      - run: docker build -t thai-assistant:ci .

  deploy-staging:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: quality-and-security-gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging Cloud (example hook)
        env:
          DEPLOY_TOKEN: \${{ secrets.STAGING_DEPLOY_TOKEN }}
        run: echo "Deploy verified image to staging URL and verify /healthz + /readyz"`,
        caption: "แยก PR validation ออกจาก main deploy ด้วย `needs:` และดึง credential จาก GitHub Secrets เท่านั้น",
      },
      whyTitle: "Why this matters — หลักฐานการทำงานแบบทีมวิศวกรรมมืออาชีพ",
      whyParagraphs: [
        "โปรเจกต์ที่มีป้ายเขียวจาก GitHub Actions CI + Dockerfile ที่ผ่าน lint/security check ทำให้ผู้ประเมินมั่นใจว่าโค้ดของคุณไม่ได้แค่ 'รันได้บนเครื่องฉัน' (works on my machine)",
        "และใน Day 176 (Milestone 5) เราจะใช้ระบบนี้เป็นฐานในการรัน Red-Team Suite ใส่ Staging URL จริง",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Dockerize Node/Next.js สู่ AI Python Container",
      body: [
        "โครงสร้าง Multi-stage Docker และ GitHub Actions ของ AI Backend แทบจะเหมือนฝั่ง Web App แต่มีจุดต่างเฉพาะของ Python AI: ต้องใช้ `uv.lock` (`--frozen`) แทน `package-lock.json`, คัดลอก `.venv` แทน `node_modules`, และอย่าลืมตั้ง timeout ให้เหมาะกับ SSE streaming",
      ],
      table: [
        ["`npm ci` + `.next/standalone`", "`uv sync --frozen --no-dev` + `.venv` ใน slim stage"],
        ["`node` non-root user", "`useradd appuser` + `USER appuser`"],
        ["`GET /api/health`", "แยก `/healthz` (Liveness) กับ `/readyz` (Index/Config Readiness)"],
        ["`jest` + `eslint` in CI", "`pytest` (Unit + PDPA/OWASP + Eval) + `ruff` in CI"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมต้องมี Multi-stage Build และ Non-root User",
      body: [
        "ตอนหัดใช้ Docker ครั้งแรก เรามักใส่ทุกคำสั่งไว้ใน stage เดียวและรันเป็น `root` ซึ่งทำให้ไฟล์อิมเมจหนักมากและถ้าโค้ดเว็บมีบั๊ก แฮกเกอร์ที่หลุดเข้ามาจะได้สิทธิ์ `root` คุมทั้ง container",
        "**Multi-stage** ช่วยทิ้งเครื่องมือติดตั้งที่ไม่จำเป็นไว้ข้างหลัง ส่วน **`USER appuser`** จำกัดสิทธิ์ให้น้อยที่สุด — เป็น 2 นิสัยง่าย ๆ ที่แยกงานมือสมัครเล่นออกจากงาน Production",
      ],
    },
  },

  workedExample: {
    intro:
      "มาสร้างตัวตรวจสอบความปลอดภัยของ Dockerfile และ Staging Config แบบอัตโนมัติ เพื่อใช้เป็น pre-flight gate ใน CI ก่อน build และ deploy จริง",
    steps: [
      {
        title: "1 · เขียนตัวตรวจความแข็งแรงของ Dockerfile (Security & Reproducibility Lint)",
        explain:
          "ตรวจสอบเงื่อนไขสำคัญ 5 ข้อใน `Dockerfile`: มี multi-stage (`AS`), ใช้ `--frozen`, สลับเป็น non-root (`USER`), มี `HEALTHCHECK`, และไม่มีการฝัง secret ใน `ENV`/`ARG`",
        code: {
          language: "python",
          filename: "worked_deploy_gate.py",
          code: `import re

SECRET_IN_DOCKER_RE = re.compile(r"^(?:ENV|ARG)\\s+\\w*(?:API_KEY|SECRET|PASSWORD|TOKEN)\\s*=", re.I | re.M)

def audit_dockerfile(content: str) -> list[str]:
    issues: list[str] = []
    if len(re.findall(r"^FROM\\s+.+\\s+AS\\s+\\w+", content, re.I | re.M)) < 2:
        issues.append("missing multi-stage build (expected >= 2 named stages)")
    if "--frozen" not in content:
        issues.append("missing '--frozen' flag for lockfile reproducibility")
    user_matches = re.findall(r"^USER\\s+(\\S+)", content, re.I | re.M)
    if not user_matches or user_matches[-1].lower() in {"root", "0"}:
        issues.append("container must end with a non-root USER")
    if "HEALTHCHECK" not in content:
        issues.append("missing HEALTHCHECK instruction")
    if SECRET_IN_DOCKER_RE.search(content):
        issues.append("hardcoded secret detected in ENV/ARG")
    return issues`,
        },
      },
      {
        title: "2 · ทดสอบตรวจ Dockerfile ที่สมบูรณ์เทียบกับ Dockerfile ที่เสี่ยง",
        explain:
          "เปรียบเทียบผลระหว่าง Dockerfile มาตรฐานของ Capstone กับ Dockerfile ที่ลืม non-root และเผลอใส่ `ENV LLM_API_KEY`",
        code: {
          language: "python",
          filename: "worked_deploy_gate.py",
          code: `good_df = """
FROM ghcr.io/astral-sh/uv:python3.12-slim AS builder
RUN uv sync --frozen --no-dev
FROM python:3.12-slim AS runtime
RUN useradd -m appuser
USER appuser
HEALTHCHECK CMD python -c "print(1)"
"""

bad_df = """
FROM python:3.12 AS app
ENV LLM_API_KEY=sk-live-oops
RUN uv sync
"""

print("good issues:", audit_dockerfile(good_df))
print("bad issues:", audit_dockerfile(bad_df))`,
        },
        output: `good issues: []
bad issues: ['missing multi-stage build (expected >= 2 named stages)', "missing '--frozen' flag for lockfile reproducibility", 'container must end with a non-root USER', 'missing HEALTHCHECK instruction', 'hardcoded secret detected in ENV/ARG']`,
      },
      {
        title: "3 · ตรวจ Staging Env Config และสร้างคำตอบ `/readyz` แบบ Fail-Fast",
        explain:
          "ตรวจสอบตัวแปรสภาพแวดล้อมสำหรับ Staging เพื่อไม่ให้ deploy ขึ้นไปพร้อม placeholder key หรือ wildcard CORS `*`",
        code: {
          language: "python",
          filename: "worked_deploy_gate.py",
          code: `def check_staging_readiness(env: dict[str, str]) -> tuple[bool, list[str]]:
    errors: list[str] = []
    if env.get("APP_ENV") not in {"staging", "production"}:
        errors.append("APP_ENV must be 'staging' or 'production'")
    key = env.get("LLM_API_KEY", "")
    if len(key) < 8 or "changeme" in key.lower() or "placeholder" in key.lower():
        errors.append("LLM_API_KEY missing or placeholder")
    if env.get("ALLOWED_ORIGINS", "*") == "*":
        errors.append("ALLOWED_ORIGINS must not be wildcard '*' in staging")
    return (len(errors) == 0, errors)

print(check_staging_readiness({"APP_ENV": "staging", "LLM_API_KEY": "live-key-9988", "ALLOWED_ORIGINS": "https://staging.corp.th"}))
print(check_staging_readiness({"APP_ENV": "staging", "LLM_API_KEY": "changeme", "ALLOWED_ORIGINS": "*"}))`,
        },
        output: `(True, [])
(False, ['LLM_API_KEY missing or placeholder', "ALLOWED_ORIGINS must not be wildcard '*' in staging"])`,
      },
    ],
    gotcha:
      "จุดสังเกต: การเอา `.env` ใส่ใน `.gitignore` อย่างเดียว **ไม่พอ** — ถ้าไม่ใส่ใน `.dockerignore` ด้วย คำสั่ง `COPY . .` ใน Dockerfile จะก๊อปปี้ `.env` จากเครื่องคุณเข้าไปฝังใน Docker image ทันที!",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/deploy_gate.py` เพื่อใช้ตรวจคุณภาพและความปลอดภัยก่อน Deploy (Dockerfile Audit, CI Workflow Gate Check, และ Staging Readiness Report) ให้รันผ่าน `pytest` ได้แบบ 100% offline",
    requirements: [
      "`validate_dockerfile_security(dockerfile_text: str) -> DockerfileAudit` ({{basemodel}}): คืน `passed: bool` และ `issues: list[str]` โดยตรวจครบ 5 กฎ: (1) multi-stage (`>= 2` stage ที่มี `AS`), (2) มี `--frozen`, (3) `USER` สุดท้ายไม่ใช่ `root`/`0`, (4) มี `HEALTHCHECK`, และ (5) ไม่มี `ENV`/`ARG` ที่ชื่อลงท้าย/ประกอบด้วย `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN` แบบกำหนดค่าตายตัว",
      "`validate_ci_workflow(workflow_yaml: str) -> list[str]`: ตรวจว่า GitHub Actions YAML มีทั้ง `ruff`, `pytest`, และมีการผูก dependency (`needs:`) ระหว่าง test/gate job กับ deploy job — คืนรายการข้อบกพร่อง (ว่างแปลว่าผ่าน)",
      "`validate_staging_config(env: dict[str, str]) -> StagingConfigStatus` ({{basemodel}}): ตรวจ `APP_ENV` (`staging`|`production`), `LLM_API_KEY` (ยาว `>= 10` และไม่มีคำว่า `changeme`/`placeholder`/`dummy`), `ALLOWED_ORIGINS` (ต้องไม่เป็น `*` และขึ้นต้น `https://`), และ `PORT` (แปลงเป็น int อยู่ระหว่าง `1..65535`); คืน `ready: bool` และ `errors: list[str]`",
      "`build_readiness_payload(dockerfile_text: str, workflow_yaml: str, env: dict[str, str]) -> dict`: รวมผลตรวจทั้ง 3 ส่วนและคืน `{\"status\": \"ready\" | \"not_ready\", \"dockerfile_issues\": ..., \"ci_issues\": ..., \"config_errors\": ...}`",
    ],
    starter: {
      language: "python",
      filename: "src/deploy_gate.py",
      code: `import re
from pydantic import BaseModel, Field


class DockerfileAudit(BaseModel):
    passed: bool
    issues: list[str] = Field(default_factory=list)


class StagingConfigStatus(BaseModel):
    ready: bool
    errors: list[str] = Field(default_factory=list)


def validate_dockerfile_security(dockerfile_text: str) -> DockerfileAudit:
    # TODO: ตรวจ multi-stage, --frozen, non-root USER, HEALTHCHECK, และ hardcoded secrets
    raise NotImplementedError


def validate_ci_workflow(workflow_yaml: str) -> list[str]:
    # TODO: ตรวจว่ามี ruff, pytest, และ needs: ใน workflow
    raise NotImplementedError


def validate_staging_config(env: dict[str, str]) -> StagingConfigStatus:
    # TODO: ตรวจ APP_ENV, LLM_API_KEY, ALLOWED_ORIGINS, และ PORT
    raise NotImplementedError


def build_readiness_payload(
    dockerfile_text: str,
    workflow_yaml: str,
    env: dict[str, str],
) -> dict:
    # TODO: รวมผลตรวจทั้ง 3 ส่วนเป็น readiness report
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_deploy_gate.py",
      code: `from src.deploy_gate import (
    build_readiness_payload,
    validate_ci_workflow,
    validate_dockerfile_security,
    validate_staging_config,
)

GOOD_DOCKERFILE = """
FROM ghcr.io/astral-sh/uv:python3.12-slim AS builder
WORKDIR /app
RUN uv sync --frozen --no-dev --no-install-project
FROM python:3.12-slim AS runtime
RUN useradd -m appuser
USER appuser
HEALTHCHECK CMD python -c "print('ok')"
"""

GOOD_CI = """
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - run: uv run ruff check .
      - run: uv run pytest -q
  deploy:
    needs: gate
    runs-on: ubuntu-latest
    steps:
      - run: echo deploy
"""

GOOD_ENV = {
    "APP_ENV": "staging",
    "LLM_API_KEY": "sk-staging-valid-key-01",
    "ALLOWED_ORIGINS": "https://staging-ai.example.com",
    "PORT": "8080",
}


def test_dockerfile_security_passes_hardened_file():
    audit = validate_dockerfile_security(GOOD_DOCKERFILE)
    assert audit.passed is True
    assert audit.issues == []


def test_dockerfile_security_catches_root_secret_and_missing_frozen():
    bad = """
    FROM python:3.12 AS single
    ENV LLM_API_KEY=sk-1234567890
    RUN uv sync
    USER root
    """
    audit = validate_dockerfile_security(bad)
    assert audit.passed is False
    assert len(audit.issues) == 5


def test_ci_workflow_validation():
    assert validate_ci_workflow(GOOD_CI) == []
    issues = validate_ci_workflow("jobs:\\n  deploy:\\n    steps:\\n      - run: echo hi")
    assert len(issues) == 3


def test_staging_config_validation():
    ok = validate_staging_config(GOOD_ENV)
    assert ok.ready is True
    bad = validate_staging_config({
        "APP_ENV": "dev",
        "LLM_API_KEY": "placeholder",
        "ALLOWED_ORIGINS": "*",
        "PORT": "99999",
    })
    assert bad.ready is False
    assert len(bad.errors) == 4


def test_build_readiness_payload_ready_and_not_ready():
    ready = build_readiness_payload(GOOD_DOCKERFILE, GOOD_CI, GOOD_ENV)
    assert ready["status"] == "ready"
    not_ready = build_readiness_payload(GOOD_DOCKERFILE, GOOD_CI, {**GOOD_ENV, "ALLOWED_ORIGINS": "*"})
    assert not_ready["status"] == "not_ready"
    assert len(not_ready["config_errors"]) == 1
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_deploy_gate.py` แล้วผ่านครบทั้ง 5 test cases",
      "สร้างไฟล์ `Dockerfile`, `.dockerignore`, และ `.github/workflows/ci-staging.yml` จริงในรีโปของคุณแล้วลองรัน gate ตรวจไฟล์จริงเหล่านั้น",
      "ตรวจสอบว่า `.dockerignore` มี `.env`, `.git`, `.venv`, และ `tests` อยู่ครบ",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_deploy_gate.py` และสร้าง `Dockerfile` + CI workflow ที่ผ่านการตรวจ",
    hints: [
      {
        body: "ใช้ `re.MULTILINE` (`re.M`) เวลามองหา `FROM ... AS ...` หรือ `USER ...` ที่ต้นบรรทัด และใช้ `.strip()` หากมี indent นำหน้าใน test string เช่น `^\\s*FROM\\s+`",
      },
      {
        body: "สำหรับ `validate_staging_config` อย่าลืมรองรับ `ALLOWED_ORIGINS` กรณีที่มีหลายโดเมนคั่นด้วยลูกน้ำ (`.split(\",\")`) โดยตรวจว่าไม่มี `*` และทุกโดเมนขึ้นต้นด้วย `https://` และแปลง `PORT` ด้วย `try...except ValueError`",
      },
      {
        body: "ตัวอย่างแกนของ `validate_dockerfile_security` และ `validate_ci_workflow` — เติม `validate_staging_config` และ `build_readiness_payload` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `SECRET_RE = re.compile(r"^\\s*(?:ENV|ARG)\\s+\\w*(?:API_KEY|SECRET|PASSWORD|TOKEN)\\s*=", re.I | re.M)
STAGE_RE = re.compile(r"^\\s*FROM\\s+\\S+\\s+AS\\s+\\w+", re.I | re.M)
USER_RE = re.compile(r"^\\s*USER\\s+(\\S+)", re.I | re.M)


def validate_dockerfile_security(dockerfile_text: str) -> DockerfileAudit:
    issues: list[str] = []
    if len(STAGE_RE.findall(dockerfile_text)) < 2:
        issues.append("missing multi-stage build")
    if "--frozen" not in dockerfile_text:
        issues.append("missing --frozen")
    users = USER_RE.findall(dockerfile_text)
    if not users or users[-1].lower() in {"root", "0"}:
        issues.append("must run as non-root USER")
    if "HEALTHCHECK" not in dockerfile_text:
        issues.append("missing HEALTHCHECK")
    if SECRET_RE.search(dockerfile_text):
        issues.append("hardcoded secret in ENV/ARG")
    return DockerfileAudit(passed=not issues, issues=issues)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_deploy_gate.py
uv run ruff check .`,
      caption: "รันจาก root ของโฟลเดอร์ `thai-enterprise-assistant/`",
    },
  },

  mistakes: [
    {
      title: "ลืมเพิ่ม `.env` และ `.git` ลงใน `.dockerignore`",
      symptom: "แม้ไม่ได้ใส่ `ENV SECRET=...` ใน Dockerfile แต่คำสั่ง `COPY . .` ดันก๊อปปี้ไฟล์ `.env` และประวัติ git เข้าไปใน container",
      fix: "สร้าง `.dockerignore` ที่มี `.env*`, `.git`, `.venv`, `__pycache__`, `tests/` และใช้วิธี `COPY src/ /app/src/` แบบเจาะจงโฟลเดอร์",
    },
    {
      title: "ใส่การเช็ก Vector DB / LLM Ping ลงใน `/healthz` (Liveness Probe)",
      symptom: "เมื่อ network ของ DB กระตุกแค่ 2 วินาที Cloud Run/Kubernetes คิดว่า container ตายแล้วสั่งฆ่าและรีสตาร์ท container วนลูป (CrashLoopBackOff)",
      fix: "แยก `/healthz` ให้เช็กแค่ process ยังตอบสนองได้ ส่วนการเช็ก DB/Config ให้ย้ายไปไว้ที่ `/readyz`",
    },
    {
      title: "รัน `uv sync` ใน Dockerfile และ CI โดยไม่ใส่ `--frozen`",
      symptom: "การ build วันอังคารได้ package เวอร์ชันใหม่ที่ทำโค้ดพัง ทั้งที่ไม่ได้แก้โค้ด Python เลย",
      fix: "ใช้ `uv sync --frozen` เสมอทั้งใน Dockerfile และ GitHub Actions เพื่อล็อก dependency ให้ตรงกับ `uv.lock` 100%",
    },
    {
      title: "Deploy งานขึ้น Staging โดยไม่ผูก `needs:` กับ Job ทดสอบ",
      symptom: "แม้ `pytest` หรือ `ruff` จะแดงใน CI แต่ job deploy ยังทำงานควบคู่กันแล้วส่งโค้ดเสียขึ้น Staging อยู่ดี",
      fix: "ตั้ง `needs: quality-and-security-gate` และจำกัดเงื่อนไข `if: github.ref == 'refs/heads/main'` บน job deploy เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d175-q1",
        "เหตุใด Production Dockerfile สำหรับโปรเจกต์ `uv` จึงควร `COPY pyproject.toml uv.lock ./` และรัน `uv sync --frozen --no-dev` **ก่อน** `COPY src/`?",
        [
          ["เพื่อใช้ Docker layer cache ไม่ต้องดาวน์โหลด library ใหม่ทุกครั้งที่แก้โค้ดใน `src/` และล็อกเวอร์ชันตาม `uv.lock`", "ถูก — ช่วยให้ CI build เร็วขึ้นมากและรับประกัน reproducibility"],
          ["เพราะ Docker ไม่อนุญาตให้มีโฟลเดอร์ `src/` ก่อนติดตั้ง Python", "ไม่เกี่ยวกัน — เป็นการจัดลำดับเพื่อประสิทธิภาพของ layer cache"],
          ["เพื่อให้ `pytest` และ `ruff` ถูกติดตั้งลงใน production image ด้วย", "`--no-dev` ตั้งใจตัด dev dependencies อย่าง pytest/ruff ออกเพื่อลดขนาด image"],
          ["เพื่อให้ container รันด้วยสิทธิ์ `root` ได้เร็วขึ้น", "ไม่เกี่ยวกับสิทธิ์ user — ใน production stage เรายังต้องสลับเป็น non-root `USER`"],
        ],
        "A",
        "การคัดลอก lockfile มารัน `uv sync --frozen --no-dev` ก่อนคัดลอกซอร์สโค้ดทำให้ Docker cache ชั้น dependency ไว้ได้เมื่อแก้เฉพาะไฟล์โค้ด",
        "ทำไมควร `COPY pyproject.toml uv.lock` แล้ว `uv sync --frozen --no-dev` ก่อน `COPY src/` ใน Dockerfile?",
        "เพื่อให้ Docker cache ชั้น dependency ไว้ได้ (build เร็วขึ้นเมื่อแก้แค่โค้ด), ล็อกเวอร์ชันเป๊ะตาม `uv.lock`, และตัด dev packages ออกด้วย `--no-dev`",
      ),
      mc(
        "d175-q2",
        "ความแตกต่างที่สำคัญที่สุดระหว่าง `/healthz` (Liveness) กับ `/readyz` (Readiness) ในการ Deploy Staging Cloud คืออะไร?",
        [
          ["`/healthz` ใช้ตรวจสอบว่า process ยังไม่ค้างตาย ส่วน `/readyz` ตรวจว่า dependency/config พร้อมรับทราฟฟิกหรือยัง", "ถูก — ถ้า `/healthz` พังระบบจะสั่งรีสตาร์ท container แต่ถ้า `/readyz` ยังไม่พร้อม Load Balancer จะแค่รอไม่ส่งทราฟฟิกเข้ามา"],
          ["`/healthz` เปิดให้เฉพาะแอดมินเรียก ส่วน `/readyz` เปิดให้ลูกค้าแชต", "ทั้งคู่เป็น health probe สำหรับระบบ orchestrator/load balancer ไม่ใช่ endpoint แชตของลูกค้า"],
          ["`/healthz` คืน HTML ของ Swagger UI ส่วน `/readyz` คืนไฟล์ Dockerfile", "ทั้งคู่คืน JSON status code (200 / 503) ตามปกติ"],
          ["ไม่มีความต่าง ใช้แทนกันได้ทุกกรณี", "หากเอา DB check หนัก ๆ ไปไว้ใน liveness อาจทำให้ container ถูกรีสตาร์ทวนลูปตอน DB ช้าชั่วคราว"],
        ],
        "A",
        "การแยก liveness (`/healthz`) กับ readiness (`/readyz`) ป้องกันอาการ container รีสตาร์ทวนลูปเมื่อ dependency ภายนอกช้าชั่วคราว และช่วยทำ zero-downtime rollout",
        "Liveness (`/healthz`) กับ Readiness (`/readyz`) ต่างกันอย่างไร?",
        "Liveness (`/healthz`) เช็กว่า process ยังมีชีวิต (ล้มเหลว → restart container); Readiness (`/readyz`) เช็กว่า config และ dependency พร้อมรับ request (ล้มเหลว → พักการส่ง traffic จนกว่าจะพร้อม)",
      ),
      mc(
        "d175-q3",
        "เหตุใดจึงห้ามเขียน `ENV LLM_API_KEY=sk-prod-xxx` หรือ `ARG API_KEY=...` ลงใน `Dockerfile` แม้จะเป็น private repository?",
        [
          ["เพราะ FastAPI อ่านค่าจาก `ENV` ไม่ได้", "FastAPI อ่าน `os.environ` ได้ตามปกติ ปัญหาคือเรื่องความปลอดภัยของ image layer"],
          ["เพราะค่า secret จะถูกฝังถาวรอยู่ใน image layer/history ใครมี image ก็ดึงอ่านได้ทันที และเปลี่ยนค่าข้าม env (staging/prod) ไม่ได้โดยไม่ build ใหม่", "ถูก — Secret ต้องฉีดตอน runtime ผ่าน Secret Manager ของ Cloud หรือ GitHub Secrets เท่านั้น"],
          ["เพราะคำสั่ง `ENV` ทำให้ `uv.lock` ใช้ไม่ได้", "ไม่เกี่ยวกับ `uv.lock`"],
          ["เพราะ Docker จำกัดความยาวตัวแปร `ENV` ไม่เกิน 8 ตัวอักษร", "ไม่มีข้อจำกัด 8 ตัวอักษร"],
        ],
        "B",
        "Image ที่ build เสร็จแล้วควรไม่ผูกกับ secret หรือ environment เฉพาะ (build once, run anywhere) และ secret ที่ใส่ใน `ARG`/`ENV` จะหลุดค้างใน metadata/layer ของ image",
        "ทำไมห้ามใส่ Secret ลงใน `ENV` หรือ `ARG` ของ Dockerfile?",
        "เพราะ secret จะฝังอยู่ใน image history/layers ถาวร ทำให้รั่วไหลได้ง่ายและขัดหลักแยก config/secrets ไปฉีดตอน runtime",
      ),
      mc(
        "d175-q4",
        "ในไฟล์ GitHub Actions `.github/workflows/ci-staging.yml` หากต้องการให้ Job `deploy-staging` ทำงานเฉพาะเมื่อผ่าน `ruff`, `pytest` และเป็น branch `main` เท่านั้น ต้องกำหนดคีย์ใด?",
        [
          ["`needs: quality-and-security-gate` และ `if: github.ref == 'refs/heads/main'`", "ถูก — `needs` บังคับให้รอและต้องผ่าน job ตรวจสอบก่อน ส่วน `if` กันไม่ให้ PR ทั่วไปสั่ง deploy ทับ Staging"],
          ["`continue-on-error: true` ใน job deploy", "`continue-on-error: true` จะปล่อยผ่านแม้คำสั่งพัง ซึ่งอันตรายมาก"],
          ["`strategy: matrix` บน `pull_request`", "จะทำให้ทุกรายการ PR รัน deploy ชนกันเอง"],
          ["`runs-on: self-hosted` โดยไม่ต้องมี `needs:`", "หากไม่มี `needs:` job deploy จะรันขนานกับ job test ทันทีโดยไม่รอผล"],
        ],
        "A",
        "การใช้ `needs:` ผูกกับ job ตรวจคุณภาพ/ความปลอดภัย ร่วมกับเงื่อนไข branch `main` เป็นมาตรฐาน CI/CD Gate ที่ป้องกันโค้ดเสียหลุดขึ้น Staging",
        "ใน GitHub Actions จะบังคับให้ deploy ขึ้น Staging เฉพาะเมื่อเทสต์ผ่านทั้งหมดและอยู่บน `main` ได้อย่างไร?",
        "ใช้ `needs: <test_job>` เพื่อรอให้ test/lint/eval ผ่านก่อน และใส่ `if: github.ref == 'refs/heads/main' && github.event_name == 'push'` บน job deploy",
      ),
    ],
  },

  takeaways: [
    "ใช้ **Multi-stage {{dockerfile}}** กับ `uv sync --frozen --no-dev`, `.dockerignore` ที่ตัด `.env`/`.git`, `USER appuser` (non-root), และ `HEALTHCHECK`",
    "แยก **`/healthz` (Liveness)** ออกจาก **`/readyz` (Readiness)** และตรวจ {{env-config}} แบบ {{fail-fast}} ก่อนรับทราฟฟิก Staging",
    "ห้ามฝัง secret ใน Dockerfile — ให้ฉีดผ่าน Cloud Secret Manager และ GitHub Secrets ตอน runtime เท่านั้น",
    "ผูก **GitHub Actions CI/CD** ด้วย `needs:` ให้ `ruff`, `pytest` (PDPA/OWASP/Eval) และ `docker build` ผ่านก่อนปล่อยขึ้น Staging เสมอ",
  ],

  reviewCards: [
    rc(
      "d175-rc-1",
      "5 ข้อกำหนดของ Production Dockerfile ที่ปลอดภัยสำหรับ Python + `uv` คืออะไร?",
      "1) Multi-stage build, 2) `uv sync --frozen --no-dev` จาก `uv.lock`, 3) รันด้วย non-root `USER`, 4) มี `HEALTHCHECK`, 5) ไม่มี secret ใน `ENV`/`ARG` และมี `.dockerignore`",
    ),
    rc(
      "d175-rc-2",
      "ถ้า `.env` อยู่ใน `.gitignore` แล้ว จำเป็นต้องใส่ใน `.dockerignore` อีกไหม เพราะเหตุใด?",
      "จำเป็นอย่างยิ่ง! `.gitignore` กันแค่ Git ไม่ได้กันคำสั่ง `COPY . .` ของ Docker — ถ้าไม่ใส่ใน `.dockerignore` ไฟล์ `.env` จะถูกแพ็กเข้าไปใน container image",
    ),
    rc(
      "d175-rc-3",
      "เหตุใดใน Cloud Staging จึงไม่ควรเช็กความพร้อมของ LLM/Vector DB ใน `/healthz`?",
      "เพราะ `/healthz` คือ liveness probe — หาก dependency ภายนอกสะดุดชั่วคราวแล้ว `/healthz` คืน error ระบบ cloud จะสั่งฆ่าและรีสตาร์ท container วนลูป ควรย้ายไปเช็กที่ `/readyz` แทน",
    ),
  ],

  sources: [
    { label: "uv Documentation — Using uv in Docker", href: "https://docs.astral.sh/uv/guides/integration/docker/" },
    { label: "Docker Docs — Multi-stage Builds & Best Practices", href: "https://docs.docker.com/build/building/multi-stage/" },
    { label: "GitHub Actions — Using Jobs & Needs", href: "https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-jobs-in-a-workflow" },
    { label: "Google Cloud Run — Container Health Checks", href: "https://cloud.google.com/run/docs/configuring/healthchecks" },
  ],

  glossary: ["dockerfile", "uv", "lockfile", "env-config", "fastapi", "sse", "reproducibility", "fail-fast", "ruff", "pytest"],
});
