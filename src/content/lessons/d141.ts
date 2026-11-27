import type { Lesson, LessonVisualId } from "../types";
import { defineLesson, mc, rc } from "./builder";

// B36 visual registration is handled in the shared curriculum integration.
export const d141: Lesson = defineLesson({
  day: 141,
  titleTh: "แพ็ก FastAPI ลง Production Docker Image ด้วย uv",
  tagline: "30 นาที · ทำ multi-stage build แยก dependency cache แล้วรัน API ด้วย non-root",
  icon: "package",
  visual: {
    id: "docker-multistage" as LessonVisualId,
    title: "Docker Multi-Stage Build",
    caption: "ไล่จาก build context ผ่าน builder ไป runtime แล้วดูว่าอะไรติดไปกับ image และอะไรช่วยให้ build รอบถัดไปเร็วขึ้น",
    alt: "แผนภาพ manifest และ lockfile เข้าชั้นติดตั้ง dependencies ก่อน source code แล้วส่งแอปกับ virtual environment ไปยัง runtime ที่รันด้วย UID 10001",
  },
  requiresApiKey: false,
  apiKeyNote: "ทำบนเครื่องตัวเองโดยดาวน์โหลด base image และ dependency สาธารณะได้โดยไม่ต้องมี API key",
  tools: [
    "Docker",
    "BuildKit",
    "uv",
    "Python 3.12",
    "pytest",
  ],
  bigPicture: [
    {
      node: 0,
      heading: "ส่ง API ชุดเดิมให้ทีมรันได้",
      body: "ระบบถามระเบียบเบิกค่าเดินทางผ่านโหลดเทสต์บนเครื่องเราแล้ว แต่ staging อาจใช้ Python หรือ binary dependencies คนละรุ่น",
      lessonNote: "สร้าง image ตัวเดียวที่ทีมตรวจและนำขึ้น staging ใน Day 143",
    },
    {
      node: 1,
      heading: "กำหนดสิ่งที่เข้าชั้น build",
      body: "manifest และ lockfile กำหนดสภาพแวดล้อม Python ส่วน corpus และ connection string จัดการแยกจาก source",
      lessonNote: "ให้ .dockerignore ตัดไฟล์ท้องถิ่นและค่าลับก่อนส่ง context",
    },
    {
      node: 4,
      heading: "ใช้ runtime ที่เล็กและสิทธิ์จำกัด",
      body: "builder ส่งไฟล์แอปกับ virtual environment ไปยัง Python slim ที่ตรงกัน แล้วสลับ UID ก่อนเปิด Uvicorn",
      lessonNote: "ตรวจทั้ง route สุขภาพและ UID ภายใน container เพื่อยืนยันว่า config มีผล",
    },
    {
      node: 5,
      heading: "อ่านสุขภาพและต้นทุน artifact",
      body: "ตรวจ cache hit ใน build log และอ่าน health status หลังเริ่มโปรเซส เก็บ image tag คู่กับค่าที่วัดจริง",
      lessonNote: "ใช้หลักฐานนี้ในบันทึก staging ของ Evaluated & Guarded AI Microservice",
    },
  ],
  objectives: [
    "ประกอบ {{dockerfile}} สอง stages ที่ใช้ {{lockfile}} แล้วรัน Uvicorn ใน runtime โดยไม่ติดตั้งแพ็กเกจใหม่ตอน startup",
    "อธิบาย .dockerignore, layer cache และ uv download cache พร้อมพิสูจน์ cache hit เมื่อแก้เฉพาะ source",
    "ตรวจ non-root และ health check จาก container จริง พร้อมทดสอบ Python policy checker",
  ],
  prerequisites: [
    "Day 5 สำหรับ {{uv}} และ dependency locking",
    "Day 137 สำหรับ FastAPI lifespan และ /healthz ใน ai_service.py",
    "Day 138–140 สำหรับ SSE, ingestion job และโหลดเทสต์ API ก่อนแพ็ก",
  ],
  setup: {
    intro: "ทำในโฟลเดอร์ Python ของ API จาก B35 ที่มี ai_service.py ซึ่ง export app และเปิด /healthz ตัวอย่างใช้โปรเจกต์ uv เดี่ยวบน Python 3.12 และคำสั่ง Bash ใช้ Git Bash หรือ WSL ได้",
    commands: `docker version
docker buildx version
uv lock --check
uv run python -c 'from ai_service import app; print(app.title)'
git status --short`,
    steps: [
      [
        "engine",
        "Docker ตอบทั้ง Client และ Server ก่อน build",
      ],
      [
        "lock",
        "uv.lock อยู่คู่กับ pyproject.toml และ Python 3.12 อยู่ในช่วง requires-python",
      ],
      [
        "layout",
        "ตรวจว่า fixtures สังเคราะห์ที่จำเป็นต่อ lifespan อยู่ใน source ที่จะ COPY",
      ],
    ],
    note: "ถ้าไฟล์ของคุณชื่อ app_worked.py ให้ปรับ import target ทั้งคำสั่งบนเครื่องและ Dockerfile เก็บ corpus จริงและน้ำหนักโมเดลขนาดใหญ่แยกจาก build context",
  },
  concepts: [
    {
      id: "image-stages",
      title: "1 · แยก builder และ runtime",
      paragraphs: [
        "Image คือชุด filesystem layers พร้อมค่าเริ่มต้นสำหรับรันโปรเซส Container คือ instance ที่ใช้ image นั้น เมื่อแก้ไฟล์ข้างใน container การเปลี่ยนแปลงอยู่ใน writable layer ของ instance จึงต้อง build ใหม่เพื่อแจกโค้ดที่แก้ให้ทีม",
        "ใช้ Python slim รุ่นกับดิสโทรเดียวกันทั้งสอง stages และย้าย virtual environment ไปตำแหน่งเดิม เพื่อรักษา path interpreter และความเข้ากันได้ของ wheel ที่มี native code ถ้า wheel ต้องการ shared library เพิ่ม ให้ติดตั้งตัว runtime library ใน runtime โดยเฉพาะ",
        "ให้ builder ใช้ binary uv จาก GHCR ของ Astral แล้วส่งเฉพาะต้นไม้ /app ไป runtime การ build จึงไม่พา executable ของ uv หรือ cache ใน home ไปด้วย",
      ],
      analogy: "เหมือนครัวกลางเตรียมเครื่องปรุง ส่วนสาขารับเฉพาะของที่ใช้ประกอบและเสิร์ฟ",
      bullets: [
        "ระบุชื่อ builder ใน COPY --from เพื่อให้เจตนาชัด",
        "สำหรับ artifact ที่ต้องตรวจย้อนกลับ ให้บันทึก digest ของ image ที่ทดสอบและตรึง digest ของ base image ใน CI",
        "กำหนดสถาปัตยกรรมเป้าหมายก่อน build เมื่อใช้เครื่อง ARM เพื่อส่งงานไป Cloud Run",
      ],
      code: {
        filename: "Dockerfile",
        language: "text",
        code: `# syntax=docker/dockerfile:1
ARG PYTHON_IMAGE=python:3.12-slim-bookworm
FROM \${PYTHON_IMAGE} AS builder
COPY --from=ghcr.io/astral-sh/uv:0.11.1 /uv /uvx /bin/
WORKDIR /app
ENV UV_PYTHON_DOWNLOADS=never \\
    UV_LINK_MODE=copy \\
    UV_COMPILE_BYTECODE=1

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \\
    uv sync --frozen --no-dev --no-install-project
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \\
    uv sync --locked --no-dev

FROM \${PYTHON_IMAGE} AS runtime
RUN groupadd --gid 10001 app && \\
    useradd --uid 10001 --gid app --no-create-home app
WORKDIR /app
COPY --from=builder /app /app
ENV PATH="/app/.venv/bin:$PATH" \\
    PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1
EXPOSE 8080
USER 10001:10001
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \\
    CMD ["python", "-c", "from urllib.request import urlopen; import os; urlopen('http://127.0.0.1:' + os.getenv('PORT', '8080') + '/healthz', timeout=2).close()"]
CMD ["sh", "-c", "exec uvicorn ai_service:app --host 0.0.0.0 --port \\"\${PORT:-8080}\\""]`,
      },
      whyTitle: "ดูว่าแต่ละ stage ต้องใช้อะไรจริง",
      whyParagraphs: [
        "โปรเจกต์ที่ต้องใช้ compiler อาจเพิ่ม build tools ใน builder โดย runtime เก็บเฉพาะ shared libraries ที่แอปยังต้องใช้",
        "การแพ็ก dependencies ล่วงหน้าช่วยให้ startup ไม่ขึ้นกับ registry",
      ],
    },
    {
      id: "layer-cache",
      title: "2 · ล็อก dependencies และใช้ cache สองระดับ",
      paragraphs: [
        "COPY pyproject.toml กับ uv.lock ก่อน source เมื่อแก้คำตอบเรื่องเบี้ยเลี้ยงใน ai_service.py ชั้นติดตั้ง dependencies แรกยังมี input เดิม ส่วน COPY source และชั้นที่ตามมาจะประเมินใหม่",
        "uv sync --frozen ยึด lockfile ที่มีโดยข้ามการตรวจว่าล็อกทัน manifest ส่วน --locked ใน sync สุดท้ายตรวจความสอดคล้องและปฏิเสธการอัปเดต lockfile จึงตรวจพบกรณีทีม commit manifest มาอย่างเดียว",
        "BuildKit cache mount เก็บไฟล์ดาวน์โหลดและ wheel ไว้เมื่อจำเป็นต้องรัน uv ใหม่ ส่วน layer cache ข้าม RUN ทั้งบรรทัดได้ UV_LINK_MODE=copy ช่วยให้การคัดลอกข้าม filesystem ของ mount ตรงตามที่ตั้งใจ",
      ],
      analogy: "ร้านพิมพ์เก็บทั้งงานที่พิมพ์เสร็จแล้วและม้วนกระดาษ งานเดิมหยิบส่งได้เลย งานใหม่ยังใช้กระดาษเดิมได้",
      bullets: [
        "--no-dev กันกลุ่มแพ็กเกจทดสอบออกจาก runtime",
        "UV_COMPILE_BYTECODE=1 ลงทุนเวลา build กับพื้นที่เพิ่มเพื่อให้ startup มีงานคอมไพล์น้อยลง",
        "แก้เวอร์ชันแพ็กเกจด้วย uv lock บนเครื่องแล้ว commit manifest กับ lockfile คู่กัน",
      ],
      code: {
        filename: "cache.sh",
        language: "bash",
        code: `uv lock --check
docker build --progress=plain -t thai-knowledge-api:b36 .
docker build --progress=plain -t thai-knowledge-api:b36 .`,
      },
      whyTitle: "อ่าน log ก่อนลงมือจูน",
      whyParagraphs: [
        "หา CACHED ที่บรรทัด sync แรกเมื่อแก้ source การอ่านชื่อ layer ช่วยแยกผลจากความเร็วเครือข่าย",
        "รอบที่เปลี่ยน lockfile ช่วยเห็นความแตกต่างระหว่าง layer reuse กับการใช้ cache ดาวน์โหลด",
      ],
    },
    {
      id: "context",
      title: "3 · ตัดไฟล์ออกก่อนส่ง build context",
      paragraphs: [
        "Docker CLI ส่ง context จากไดเรกทอรีท้ายคำสั่ง docker build ใช้ .dockerignore ที่ root เพื่อตัด virtual environment, env files, Git history, test output และสำเนา Langfuse ที่เพิ่มใน Day 142",
        ".venv จาก Windows หรือ macOS อาจมี executable หรือ native module คนละแบบกับ Linux การตัดออกจึงช่วยทั้งความถูกต้องและขนาด",
        "หากไฟล์ลับหลุดเข้า COPY แล้ว rm ใน layer ถัดมา ผู้ที่เข้าถึง layer เดิมอาจยังอ่านได้ หลีกเลี่ยงค่าลับใน ARG และ ENV ของ build ถ้าต้องใช้ private dependency ให้ใช้ BuildKit secret mount เฉพาะคำสั่งที่ต้องอ่าน",
      ],
      analogy: "คัดกล่องก่อนขึ้นรถส่งของ ถ้าเอกสารบัญชีหลุดขึ้นรถ การดึงออกที่ปลายทางแก้การเผยแพร่ครั้งแรกไม่ได้",
      bullets: [
        ".gitignore คุมไฟล์ที่ Git เห็น ส่วน .dockerignore คุม context",
        "เพิ่ม pattern สำหรับ corpus จริงตาม layout แล้วเช็กว่า fixture สังเคราะห์ยังอยู่",
        "คำสั่ง COPY จำกัดขอบเขตเพิ่มได้ เช่นคัดลอกเฉพาะ package และ manifest",
      ],
      code: {
        filename: ".dockerignore",
        language: "text",
        code: `.git
.github
.venv
**/__pycache__
**/*.py[cod]
.pytest_cache
.ruff_cache
.coverage
.env
.env.*
*.env
**/.env
**/.env.*
**/*.env
.local
test_*.py
tests
dist
build`,
      },
      whyTitle: "ตรวจขนาด context ที่ CI ต้องส่ง",
      whyParagraphs: [
        "ถ้า transferring context มีหลายร้อยเมกะไบต์ทั้งที่แอปมี source ไม่กี่ไฟล์ ให้ตรวจ corpus, .venv และ checkout ที่ซ้อนอยู่",
        "การตัด context ลดเวลาอัปโหลดและลดโอกาสนำไฟล์ที่ไม่เกี่ยวเข้า image",
      ],
    },
    {
      id: "runtime",
      title: "4 · จำกัดสิทธิ์และตรวจ HTTP จาก runtime",
      paragraphs: [
        "USER 10001:10001 ใช้บัญชีที่สร้างไว้ใน base runtime ไฟล์ /app เป็นของ root และแอปอ่านได้ ถ้าต้องเขียนไฟล์ชั่วคราวให้ใช้ /tmp หรือ volume ที่จัดสิทธิ์ให้ UID แอป",
        "CMD ใช้ shell เพื่อขยาย PORT แล้ว exec Uvicorn ให้รับสัญญาณหยุดโดยตรง EXPOSE บันทึกพอร์ตที่แอปตั้งใจใช้ ส่วน docker run ต้อง publish host port เอง ให้ Uvicorn bind 0.0.0.0 ภายใน container",
        "HEALTHCHECK ใช้ urllib ที่มากับ Python ยิง /healthz บน loopback ภายใน container แยกจาก readiness ซึ่งจะตรวจ dependencies ใน Day 143 ค่า unhealthy เป็นสถานะที่ผู้ดูแลหรือ orchestrator ใช้ประกอบการตัดสินใจ",
      ],
      analogy: "เหมือนให้พนักงานถือบัตรเข้าเคาน์เตอร์บริการแล้วโทรเช็กว่าเคาน์เตอร์รับสาย เก็บกุญแจสำนักงานกับระบบบัญชีไว้อีกชั้น",
      bullets: [
        "probe ตั้ง timeout สองวินาที และ Docker สรุปสถานะตามจำนวนครั้งที่ตั้งไว้",
        "start period ให้เวลาแอปเริ่มต้นก่อนนับความล้มเหลวตามปกติ",
        "inspect runtime จาก container จริงเพื่อจับความต่างของ port, ownership และ user",
      ],
      code: {
        filename: "inspect.sh",
        language: "bash",
        code: `docker exec thai-api python -c 'import os; print(os.getuid())'
docker inspect --format '{{.State.Health.Status}}' thai-api
docker image ls thai-knowledge-api:b36`,
      },
      whyTitle: "แยกปัญหาที่โปรเซสกับ host",
      whyParagraphs: [
        "ถ้า probe ภายในผ่านแต่ host ติดต่อไม่ได้ ให้ดู bind address และ port mapping",
        "ถ้า probe ภายในล้ม ให้เริ่มจาก Uvicorn logs และเช็กว่า /healthz ตอบตาม contract",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge · Node builder กับ Python runtime",
      body: [
        "ถ้าเคย build Next.js ด้วย npm tooling แล้วส่ง standalone artifact ไป runtime ให้เทียบ builder กับขั้น uv sync และ runtime กับ Python slim",
      ],
      table: [
        [
          "npm ci กับ package-lock.json",
          "uv sync --locked ตรวจความสอดคล้องกับ lockfile",
        ],
        [
          "node:alpine ใน runtime",
          "python:3.12-slim-bookworm ให้ glibc และใช้ base เดียวกันทั้งสอง stages",
        ],
        [
          "docker run -p สำหรับเว็บ",
          "publish host port แล้วให้ Uvicorn bind ทุก interface ใน container",
        ],
        [
          "เวลา build บน CI",
          "แยก dependency layer จาก source ก่อนจับเวลา",
        ],
      ],
    },
    student: {
      title: "First-Year Note · โปรแกรมกับสภาพแวดล้อมรัน",
      body: [
        ".venv เหมือนชุดเครื่องมือของวิชาหนึ่ง ส่วน image บันทึกทั้งเครื่องมือและ Python ที่ใช้กับมัน",
        "ตรวจด้วย import และ /healthz ก่อนเพิ่มระบบฐานข้อมูลในวันถัดไป",
      ],
    },
  },
  workedExample: {
    intro: "แพ็ก API จาก B35 ด้วย Dockerfile และ .dockerignore ข้างต้น ผลลัพธ์เป็นตัวอย่างจากเครื่องที่ port 8080 ว่าง หากแอปต้องใช้ runtime config ให้ส่งไฟล์ที่มีเฉพาะค่าทดลองผ่าน docker run --env-file",
    steps: [
      {
        title: "1 · Build แล้วดู artifact",
        explain: "ตรวจ lockfile ก่อน build ใช้ progress แบบ plain เพื่ออ่านชื่อขั้นตอน เก็บขนาดและค่า default user จาก image",
        code: {
          filename: "build.sh",
          language: "bash",
          code: `uv lock --check
docker build --progress=plain -t thai-knowledge-api:b36 .
docker image inspect --format '{{.Size}} bytes; user={{.Config.User}}' thai-knowledge-api:b36`,
        },
        output: "126784512 bytes; user=10001:10001",
      },
      {
        title: "2 · เปิด API บน localhost",
        explain: "publish port ให้เครื่องตัวเอง จากนั้นเช็ก endpoint เทียบกับ UID ใน container รอ health check รอบแรกเพื่อดูสถานะ healthy",
        code: {
          filename: "run.sh",
          language: "bash",
          code: `docker run -d --name thai-api -p 127.0.0.1:8080:8080 thai-knowledge-api:b36
curl --retry 6 --retry-connrefused -fsS http://127.0.0.1:8080/healthz
docker exec thai-api python -c 'import os; print(os.getuid())'
docker inspect --format '{{.State.Health.Status}}' thai-api`,
        },
        output: `{"status":"ok"}
10001
healthy`,
      },
      {
        title: "3 · แก้ source เล็กน้อยแล้ว build ซ้ำ",
        explain: "เพิ่ม newline ที่ท้าย ai_service.py ใน working copy ทดลอง ดูว่า sync แรกได้ cache hit แล้วหยุด container ชุดทดลองเพื่อให้ Compose ใช้ port ต่อได้",
        code: {
          filename: "rebuild.sh",
          language: "bash",
          code: `printf '\\n' >> ai_service.py
docker build --progress=plain -t thai-knowledge-api:b36 .
docker stop thai-api
docker rm thai-api`,
        },
        output: `#8 [builder 3/6] COPY pyproject.toml uv.lock ./
#8 CACHED
#9 [builder 4/6] RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev --no-install-project
#9 CACHED
#10 [builder 5/6] COPY . .
#10 DONE 0.1s`,
      },
    ],
    gotcha: "ถ้า inspect ยังแสดง starting ให้รอ probe รอบถัดไปและดู docker logs thai-api ตัวเลขขนาดและหมายเลข layer เปลี่ยนตามเครื่องและ dependency ที่ลง",
  },
  practice: {
    intro: "โจทย์ 12 นาที เขียน image_policy.py สำหรับตรวจ profile ของ Dockerfile ตัวอย่างด้วยข้อความและทดสอบโดยไม่พึ่ง daemon",
    requirements: [
      "อ่าน instruction แบบ case-insensitive ข้าม comment เต็มบรรทัดและรองรับบรรทัดที่ลงท้ายด้วย backslash",
      "นับ FROM และใช้ USER กับ HEALTHCHECK ตัวสุดท้ายหลัง FROM สุดท้าย ถือ root, UID 0, ค่าว่าง และ HEALTHCHECK NONE เป็น failure ตามเงื่อนไขที่เกี่ยวข้อง",
      "ตรวจ exact patterns สำหรับ .git, .venv, .env, .env.* และปฏิเสธ ignore negation ในโปรไฟล์นี้",
      "ใช้ pathlib อ่านทั้งสองไฟล์และคืน exit code 0 เมื่อผ่าน, 1 เมื่อมี findings และ 2 เมื่ออ่านไฟล์ไม่ได้",
    ],
    starter: {
      filename: "image_policy.py",
      language: "python",
      code: `from pathlib import Path

REQUIRED_IGNORES = (".git", ".venv", ".env", ".env.*")


def audit(dockerfile: str, dockerignore: str) -> list[str]:
    # TODO: รวมบรรทัดต่อเนื่องก่อนตรวจ keyword
    # TODO: รีเซ็ต USER และ HEALTHCHECK เมื่อเจอ FROM ใหม่
    # TODO: ตรวจ ignore patterns และ negation
    raise NotImplementedError


def main(argv: list[str] | None = None) -> int:
    # TODO: อ่านไฟล์ใน directory แล้วรายงาน exit code
    raise NotImplementedError


if __name__ == "__main__":
    raise SystemExit(main())`,
    },
    verification: {
      filename: "test_image_policy.py",
      language: "python",
      code: `from pathlib import Path

import pytest

from image_policy import audit, main

VALID = (
    "FROM python:3.12-slim AS builder\\n"
    "RUN echo building\\n"
    "FROM python:3.12-slim AS runtime\\n"
    "COPY --from=builder /app /app\\n"
    "USER 10001:10001\\n"
    "HEALTHCHECK CMD python probe.py\\n"
    'CMD ["python", "app.py"]\\n'
)
IGNORES = ".git\\n.venv\\n.env\\n.env.*\\n"


def test_good_image():
    assert audit(VALID, IGNORES) == []


@pytest.mark.parametrize("instruction", ["USER root", "USER 0:app", "USER ROOT:root"])
def test_last_user_controls_runtime(instruction):
    assert "runtime-user" in audit(VALID + instruction, IGNORES)


def test_builder_user_and_probe_do_not_count():
    recipe = VALID.replace(
        "RUN echo building", "USER app\\nHEALTHCHECK CMD python probe.py"
    ).replace(
        "USER 10001:10001\\nHEALTHCHECK CMD python probe.py",
        "HEALTHCHECK NONE",
    )
    assert audit(recipe, IGNORES) == ["runtime-user", "runtime-healthcheck"]


def test_missing_ignore():
    assert audit(VALID, ".git\\n.venv\\n.env\\n") == ["ignore:.env.*"]


def test_reinclude_pattern_fails():
    assert audit(VALID, IGNORES + "!.env.production\\n") == ["ignore:negation"]


def test_continued_probe():
    continued = "HEALTHCHECK --timeout=3s " + chr(92) + "\\n    CMD"
    assert audit(VALID.replace("HEALTHCHECK CMD", continued), IGNORES) == []


def test_cli_reads_files(tmp_path: Path):
    (tmp_path / "Dockerfile").write_text(VALID, encoding="utf-8")
    (tmp_path / ".dockerignore").write_text(IGNORES, encoding="utf-8")
    assert main([str(tmp_path)]) == 0`,
    },
    selfCheck: [
      "Dockerfile ตัวอย่างผ่าน audit แล้วตรวจ UID ใน container ได้ 10001",
      "ใส่ USER root ท้าย stage สุดท้ายแล้วพบ runtime-user",
      "ทดสอบ .env.* หายและ negation แยกกันเพื่อให้รายงานตรงเหตุ",
    ],
    acceptance: "pytest ผ่านทั้งหมด และ CLI แสดง Image policy OK บนโฟลเดอร์ตัวอย่าง",
    hints: [
      {
        body: "มอง FROM เป็นเส้นแบ่งขอบเขตที่เริ่มบันทึกค่า USER และ HEALTHCHECK ใหม่",
      },
      {
        body: "รวมบรรทัดต่อเนื่องก่อน split ชื่อ instruction แยก USER ที่ colon ก่อนตรวจ UID",
      },
      {
        body: "คัดลอกสองไฟล์ตามบรรทัดคั่น โค้ดตรวจเฉพาะ profile ของห้องเรียน เช่น กำหนด USER ใน final stage โดยตรง แล้วใช้ Docker build และ inspect ตรวจจริงอีกชั้น",
        code: {
          filename: "image_policy.py",
          language: "python",
          code: `from __future__ import annotations

import argparse
from collections.abc import Iterator
from pathlib import Path

REQUIRED_IGNORES = (".git", ".venv", ".env", ".env.*")


def instructions(dockerfile: str) -> Iterator[tuple[str, str]]:
    parts: list[str] = []
    for line in dockerfile.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.endswith(chr(92)):
            parts.append(line[:-1].rstrip())
            continue
        parts.append(line)
        words = " ".join(parts).split(maxsplit=1)
        yield words[0].upper(), words[1].strip() if len(words) == 2 else ""
        parts.clear()


def audit(dockerfile: str, dockerignore: str) -> list[str]:
    stages = 0
    runtime_user = ""
    runtime_healthcheck = ""
    for instruction, value in instructions(dockerfile):
        if instruction == "FROM":
            stages += 1
            runtime_user = ""
            runtime_healthcheck = ""
        elif instruction == "USER":
            runtime_user = value.partition(":")[0].lower()
        elif instruction == "HEALTHCHECK":
            runtime_healthcheck = value.upper()

    findings: list[str] = []
    if stages < 2:
        findings.append("multi-stage")
    if runtime_user in {"", "root", "0"}:
        findings.append("runtime-user")
    if runtime_healthcheck in {"", "NONE"}:
        findings.append("runtime-healthcheck")

    patterns = {
        line.strip()
        for line in dockerignore.splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }
    for pattern in REQUIRED_IGNORES:
        if pattern not in patterns:
            findings.append(f"ignore:{pattern}")
    if any(pattern.startswith("!") for pattern in patterns):
        findings.append("ignore:negation")
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check the course Docker profile")
    parser.add_argument("directory", type=Path, nargs="?", default=Path("."))
    directory = parser.parse_args(argv).directory
    try:
        findings = audit(
            (directory / "Dockerfile").read_text(encoding="utf-8"),
            (directory / ".dockerignore").read_text(encoding="utf-8"),
        )
    except OSError as exc:
        parser.exit(2, f"Cannot read the build files: {exc.strerror}\\n")
    if findings:
        print("\\n".join(findings))
        return 1
    print("Image policy OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# แยกบรรทัดด้านล่างเป็น test_image_policy.py

from pathlib import Path

import pytest

from image_policy import audit, main

VALID = (
    "FROM python:3.12-slim AS builder\\n"
    "RUN echo building\\n"
    "FROM python:3.12-slim AS runtime\\n"
    "COPY --from=builder /app /app\\n"
    "USER 10001:10001\\n"
    "HEALTHCHECK CMD python probe.py\\n"
    'CMD ["python", "app.py"]\\n'
)
IGNORES = ".git\\n.venv\\n.env\\n.env.*\\n"


def test_good_image():
    assert audit(VALID, IGNORES) == []


@pytest.mark.parametrize("instruction", ["USER root", "USER 0:app", "USER ROOT:root"])
def test_last_user_controls_runtime(instruction):
    assert "runtime-user" in audit(VALID + instruction, IGNORES)


def test_builder_user_and_probe_do_not_count():
    recipe = VALID.replace(
        "RUN echo building", "USER app\\nHEALTHCHECK CMD python probe.py"
    ).replace(
        "USER 10001:10001\\nHEALTHCHECK CMD python probe.py",
        "HEALTHCHECK NONE",
    )
    assert audit(recipe, IGNORES) == ["runtime-user", "runtime-healthcheck"]


def test_missing_ignore():
    assert audit(VALID, ".git\\n.venv\\n.env\\n") == ["ignore:.env.*"]


def test_reinclude_pattern_fails():
    assert audit(VALID, IGNORES + "!.env.production\\n") == ["ignore:negation"]


def test_continued_probe():
    continued = "HEALTHCHECK --timeout=3s " + chr(92) + "\\n    CMD"
    assert audit(VALID.replace("HEALTHCHECK CMD", continued), IGNORES) == []


def test_cli_reads_files(tmp_path: Path):
    (tmp_path / "Dockerfile").write_text(VALID, encoding="utf-8")
    (tmp_path / ".dockerignore").write_text(IGNORES, encoding="utf-8")
    assert main([str(tmp_path)]) == 0`,
        },
      },
    ],
    localRun: {
      filename: "verify.sh",
      language: "bash",
      code: `uv run --with pytest pytest -q test_image_policy.py
uv run python image_policy.py .`,
    },
  },
  mistakes: [
    {
      title: "COPY source ก่อน dependencies",
      symptom: "แก้คำตอบหนึ่งบรรทัดแล้ว BuildKit รัน sync แรกใหม่",
      fix: "COPY manifest กับ lockfile แยกก่อน RUN uv sync --no-install-project",
    },
    {
      title: "ย้าย .venv ไปคนละ path",
      symptom: "build ผ่านแต่ uvicorn หา interpreter ไม่พบ",
      fix: "ใช้ /app/.venv ตรงกันบน Python base เดียวกัน",
    },
    {
      title: "ลบ .env หลัง COPY",
      symptom: "ค่า env ยังอาจติดอยู่กับ layer ที่เผยแพร่ไปแล้ว",
      fix: "exclude ตั้งแต่ context และหมุน secret ที่เผยแพร่",
    },
    {
      title: "ให้โปรเซสเขียนใต้ /app",
      symptom: "lifespan ล้มด้วย PermissionError",
      fix: "กำหนด cache ไป /tmp หรือ volume ที่จัดสิทธิ์ให้ UID 10001",
    },
  ],
  quiz: {
    intro: "เลือกจากสิ่งที่สังเกตได้ใน build และ runtime",
    questions: [
      mc(
        "d141-q1",
        "แก้เฉพาะ ai_service.py โดย manifest กับ lockfile เหมือนเดิม ชั้นไหนควร cache hit?",
        [
          [
            "sync dependencies ก่อน COPY source",
            "input ยังเหมือนเดิม",
          ],
          [
            "COPY source",
            "เนื้อหาที่คัดลอกเปลี่ยน",
          ],
          [
            "ทุกชั้นหลัง COPY source",
            "ชั้นที่ใช้ผล COPY ต้องประเมินใหม่",
          ],
          [
            "เฉพาะ RUN ใน runtime",
            "ชื่อ stage ไม่ได้กำหนด cache key",
          ],
        ],
        "A",
        "แยก input ที่คงที่สุดไว้ก่อน source เพื่อให้แก้แอปโดยไม่ติดตั้ง dependencies รอบแรกใหม่",
        "วาง COPY uv.lock ตรงไหน?",
        "ก่อน COPY source และก่อน sync dependencies",
      ),
      mc(
        "d141-q2",
        "flag ใดจับ lockfile ค้างหลัง manifest เปลี่ยน?",
        [
          [
            "--no-dev",
            "เลือกกลุ่มแพ็กเกจ",
          ],
          [
            "--frozen",
            "ข้ามการตรวจความสด",
          ],
          [
            "--locked",
            "ปฏิเสธเมื่อจำเป็นต้องเปลี่ยน lockfile",
          ],
          [
            "--no-install-project",
            "ข้าม package ตัวโปรเจกต์",
          ],
        ],
        "C",
        "sync สุดท้ายตรวจความสอดคล้องของล็อกกับโปรเจกต์ก่อนให้ออก artifact",
        "flag ใดไม่เขียนล็อกใหม่และตรวจความสดด้วย?",
        "--locked",
      ),
      mc(
        "d141-q3",
        "ทำไมต้อง exclude .env ก่อน COPY?",
        [
          [
            "เพื่อให้ EXPOSE รับพอร์ต",
            "พอร์ตไม่เกี่ยวกับ context",
          ],
          [
            "เพื่อกัน secret จาก image layers",
            "การลบใน layer ถัดไปยังทิ้งไฟล์ใน layer เดิม",
          ],
          [
            "เพื่อใช้ root",
            "USER กำหนดต่างหาก",
          ],
          [
            "เพื่ออ่าน JSON",
            "JSON ไม่พึ่งไฟล์นี้",
          ],
        ],
        "B",
        "Docker layers เก็บการเปลี่ยนแปลงแต่ละขั้น ควรตัดไฟล์ลับออกจาก context ก่อน",
        "ลบ secret ใน RUN หลัง COPY พอไหม?",
        "layer ก่อนหน้ายังมีเนื้อหาเดิม",
      ),
      mc(
        "d141-q4",
        "เมื่อ inspect เห็น unhealthy ควรตรวจอะไรก่อน?",
        [
          [
            "ลง test dependencies",
            "ยังไม่มีหลักฐานว่าขาดแพ็กเกจ",
          ],
          [
            "เปลี่ยนเป็น root",
            "ยังไม่มีหลักฐานเรื่อง permission",
          ],
          [
            "เพิ่มขนาด image",
            "ขนาดไม่ชี้ว่า probe ล้มที่ไหน",
          ],
          [
            "ดู logs, bind address และ probe port",
            "แยกบูตผิดพลาดกับยิงผิดปลายทางได้",
          ],
        ],
        "D",
        "เริ่มจาก Uvicorn และ probe ภายใน แล้วค่อยตรวจ mapping จาก host",
        "EXPOSE publish port หรือไม่?",
        "ต้อง publish แยกด้วย -p หรือ Compose ports",
      ),
    ],
  },
  takeaways: [
    "จัด dependency layer ก่อน source แล้วอ่าน CACHED จาก build log",
    "รักษา Python base และ path ข้าม stages ใช้ UID ที่จำกัดสิทธิ์และส่งสัญญาณตรงถึง Uvicorn",
    "ตัดค่าลับออกจาก context ทดสอบ /healthz จาก image จริง",
    "นำ image นี้ไปต่อ Postgres กับ Langfuse ใน Day 142",
  ],
  reviewCards: [
    rc(
      "d141-r1",
      "cache mount กับ layer cache ต่างกันอย่างไร?",
      "mount ลดการดาวน์โหลดซ้ำเมื่อ RUN ต้องทำ ส่วน layer cache ช่วยข้าม RUN",
    ),
    rc(
      "d141-r2",
      "ทำไม .venv ต้องคง path?",
      "console scripts อาจอ้าง interpreter แบบ absolute และ wheel ต้องใช้ Python กับระบบที่เข้ากัน",
    ),
    rc(
      "d141-r3",
      "ตรวจ non-root ด้วยอะไร?",
      "ตรวจ UID ภายใน container คู่กับ .Config.User",
    ),
  ],
  sources: [
    {
      label: "Docker Docs · Multi-stage builds",
      href: "https://docs.docker.com/build/building/multi-stage/",
    },
    {
      label: "Docker Docs · Build context",
      href: "https://docs.docker.com/build/concepts/context/",
    },
    {
      label: "Docker Docs · Optimize cache usage",
      href: "https://docs.docker.com/build/cache/optimize/",
    },
    {
      label: "Astral · Using uv in Docker",
      href: "https://docs.astral.sh/uv/guides/integration/docker/",
    },
  ],
  glossary: [
    "dockerfile",
    "uv",
    "lockfile",
    "reproducibility",
    "fastapi",
    "env-config",
  ],
});
