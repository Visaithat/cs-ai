import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const compose = `services:
  vector-db:
    image: pgvector/pgvector:pg16
    env_file:
      - .env.vector
    volumes:
      - vector-data:/var/lib/postgresql/data
      - ./db/01-vector.sql:/docker-entrypoint-initdb.d/01-vector.sql:ro
    healthcheck:
      test:
        - CMD-SHELL
        - >-
          PGPASSWORD="$$POSTGRES_PASSWORD"
          psql -w -h 127.0.0.1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"
          -Atqc "SELECT 1 FROM pg_extension WHERE extname = 'vector'"
          | grep -qx 1
      interval: 5s
      timeout: 3s
      retries: 12
      start_period: 10s
  api:
    build: .
    env_file:
      - .env.api
    ports:
      - "127.0.0.1:8080:8080"
    depends_on:
      vector-db:
        condition: service_healthy
    healthcheck:
      test:
        - CMD
        - python
        - -c
        - >-
          from urllib.request import urlopen;
          urlopen('http://127.0.0.1:8080/readyz', timeout=2).close()
      interval: 5s
      timeout: 3s
      retries: 6
      start_period: 10s

volumes:
  vector-data:`;

const tests = `import copy
import json

import pytest

from compose_policy import audit, main


@pytest.fixture
def model():
    return {
        "services": {
            "api": {
                "depends_on": {
                    "vector-db": {"condition": "service_healthy"},
                },
                "healthcheck": {"test": ["CMD", "python", "probe.py"]},
            },
            "vector-db": {
                "healthcheck": {"test": ["CMD-SHELL", "pg_isready"]},
                "volumes": [
                    {
                        "type": "volume",
                        "source": "vector-data",
                        "target": "/var/lib/postgresql/data",
                    },
                    {
                        "type": "bind",
                        "source": "./db/01-vector.sql",
                        "target": "/docker-entrypoint-initdb.d/01-vector.sql",
                    },
                ],
            },
        },
        "volumes": {"vector-data": {"name": "b36_vector-data"}},
    }


def test_accepts_normalized_configuration_without_mutating_it(model):
    before = copy.deepcopy(model)
    assert audit(model) == []
    assert model == before


def test_lists_both_missing_services():
    assert audit({"services": {}}) == [
        "service:api",
        "service:vector-db",
    ]


@pytest.mark.parametrize("value", ["service_started", None, 1])
def test_requires_healthy_dependency(model, value):
    model["services"]["api"]["depends_on"]["vector-db"]["condition"] = value
    assert audit(model) == ["dependency:api->vector-db"]


@pytest.mark.parametrize("health", [
    {"disable": True, "test": ["CMD", "true"]},
    {"test": ["NONE"]},
    {"test": []},
    {"test": ["CMD"]},
    {},
])
def test_requires_enabled_probe(model, health):
    model["services"]["vector-db"]["healthcheck"] = health
    assert audit(model) == ["healthcheck:vector-db"]


def test_requires_api_probe_too(model):
    del model["services"]["api"]["healthcheck"]
    assert audit(model) == ["healthcheck:api"]


def test_does_not_count_bind_mount_as_persistent_volume(model):
    model["services"]["vector-db"]["volumes"][0]["type"] = "bind"
    assert audit(model) == ["volume:vector-db"]


def test_requires_volume_declaration(model):
    model["volumes"] = {}
    assert audit(model) == ["volume:vector-db"]


def test_cli_returns_zero_for_clean_model(tmp_path, model, capsys):
    path = tmp_path / "compose.json"
    path.write_text(json.dumps(model), encoding="utf-8")
    assert main([str(path)]) == 0
    assert capsys.readouterr().out.strip() == "Compose policy OK"


def test_cli_reports_findings_without_dumping_env(tmp_path, model, capsys):
    model["services"]["api"]["healthcheck"] = {}
    model["services"]["api"]["environment"] = {"TOKEN": "sample-marker"}
    path = tmp_path / "compose.json"
    path.write_text(json.dumps(model), encoding="utf-8")
    assert main([str(path)]) == 1
    assert capsys.readouterr().out.strip() == "healthcheck:api"


@pytest.mark.parametrize("data", ["null", "{", '{"services": []}'])
def test_cli_invalid_input(tmp_path, data, capsys):
    path = tmp_path / "compose.json"
    path.write_text(data, encoding="utf-8")
    assert main([str(path)]) == 2
    assert capsys.readouterr().err.strip() == "Cannot read Compose model"


def test_cli_missing_file(tmp_path, capsys):
    assert main([str(tmp_path / "missing.json")]) == 2
    assert capsys.readouterr().err.strip() == "Cannot read Compose model"`;

export const d142: Lesson = defineLesson({
  day: 142,
  titleTh: "ประกอบ Local Stack ด้วย Docker Compose",
  tagline: "รัน FastAPI กับ Postgres/pgvector และ Langfuse ในเครือข่ายเดียวกัน แล้วหาหลักฐานว่าแต่ละ service พร้อมทำงาน",
  icon: "boxes",
  visual: {
    id: "compose-local-stack",
    title: "เครือข่ายและลำดับเริ่มบริการของ Local Stack",
    caption: "แยกเส้นทางคำขอ ข้อมูลถาวร และ trace เพื่อหาจุดเสียทีละชั้น",
    alt: "คำขอจากเครื่อง host เข้า API ผ่านพอร์ตที่ map ไว้ API ใช้ DNS ของ Compose ไปยัง Postgres กับ Langfuse โดยข้อมูล Postgres อยู่ใน volume",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ Postgres และทดสอบ policy ได้บนเครื่อง ส่วนการส่ง trace ใช้ project key ของ Langfuse ที่สร้างเอง",
  tools: ["Docker Compose v2", "Postgres 16", "pgvector", "Langfuse", "pytest"],
  bigPicture: [
    {
      node: 0,
      heading: "ทำให้ทีมเปิดระบบเดียวกันได้",
      body: "หลังทดสอบ image วัน 141 ทีมต้องเปิด API และฐานข้อมูลทดลองด้วยลำดับเดียวกัน แม้เริ่มจากเครื่องใหม่",
      lessonNote: "ให้ Compose บันทึก services, config และเงื่อนไข startup ไว้ในไฟล์เดียว",
    },
    {
      node: 1,
      heading: "เก็บดัชนีเวกเตอร์ข้ามการสร้าง container ใหม่",
      body: "Postgres เป็นที่เก็บข้อมูลทดลองของงานถามระเบียบเบิกค่าเดินทาง ต้องมี extension vector ก่อนเริ่มฝึก retrieval",
      lessonNote: "ใช้ init SQL กับ volume ใหม่ แล้วพิสูจน์ด้วย query ที่อ่าน pg_extension",
    },
    {
      node: 4,
      heading: "ผูก API เข้ากับชื่อ service",
      body: "ทีมเรียก API จาก host ส่วน API เชื่อมบริการข้างเคียงด้วย DNS ใน Compose network",
      lessonNote: "แยก host port ออกจาก container port และส่ง config ตอน runtime",
    },
    {
      node: 5,
      heading: "ดู trace แยกจากความพร้อมของ API",
      body: "Langfuse ช่วยตามคำขอสังเคราะห์จากการตอบ API ไปยังการประมวลผล trace",
      lessonNote: "วันนี้ตรวจเส้นทางและตั้ง project ในเครื่อง วัน 144 ใช้ trace ID ยืนยันการส่งถึงปลายทาง",
    },
  ],
  objectives: [
    "ประกอบ API จาก {{dockerfile}} กับ Postgres/pgvector โดยใช้ healthcheck และเงื่อนไข service_healthy",
    "อธิบาย DNS, named volume และ env_file พร้อมเปิด {{langfuse}} ด้วย Compose bundle ทางการ",
    "เขียน Python policy checker สำหรับผลจาก docker compose config และทดสอบได้แม้ไม่มี Docker daemon",
  ],
  prerequisites: [
    "Day 97 สำหรับ HNSW และ Day 101 สำหรับการค้นแบบผสม",
    "Day 134 สำหรับ Langfuse trace waterfall และ Day 137 สำหรับ /healthz กับ /readyz",
    "Day 141 สำหรับ Dockerfile, .dockerignore และพอร์ตเริ่มต้น 8080",
  ],
  setup: {
    intro: "ใช้โฟลเดอร์ Python เดิมจาก Day 141 และ Git Bash หรือ WSL สำหรับคำสั่งด้านล่าง ปิด container ตัวอย่างตัวเดิมหากยังใช้พอร์ต 8080",
    commands: `docker version
docker compose version
uv --version
mkdir -p db
git check-ignore .env.api .env.vector`,
    steps: [
      ["daemon", "docker version แสดงข้อมูลของ Server และใช้ Compose v2.20.0 ขึ้นไปสำหรับ include"],
      ["image", "โฟลเดอร์มี Dockerfile และ ai_service.py พร้อม routes จาก Day 137"],
      ["ignore", "เพิ่ม .env.api, .env.vector และโฟลเดอร์ langfuse/ ใน .gitignore และ .dockerignore ก่อนสร้างค่าทดลอง"],
      ["data", "ใช้เอกสารและ query สังเคราะห์ใน stack นี้"],
    ],
    note: "Python lab ใช้ไฟล์ JSON fixture ที่แนบมากับ pytest จึงทำได้บนเครื่องที่ไม่มี Docker ส่วน Langfuse อาจใช้เวลาสองสามนาทีในการเริ่มครั้งแรก",
  },
  concepts: [
    {
      id: "d142-network",
      title: "1 · DNS ใน Compose และพอร์ตของแต่ละฝั่ง",
      paragraphs: [
        "Compose สร้าง default network ให้โปรเจกต์ และให้ container ค้นปลายทางด้วยชื่อ service เมื่อ vector-db ถูกสร้างใหม่ IP อาจเปลี่ยน แต่ชื่อเดิมยังใช้ได้",
        "curl จาก host ใช้ 127.0.0.1:8080 เพราะ API publish พอร์ตไว้ ส่วน API คุยกับ vector-db:5432 โดยตรง จึงไม่ต้อง publish Postgres ออก host",
        "API จาก Day 137 ยังทำงานกับ mock ได้ ตัวอย่างส่ง DATABASE_URL ไว้สำหรับ retrieval adapter ที่จะใช้ pgvector และตรวจ extension แยกด้วย SQL เพื่อให้หลักฐานตรงกับสิ่งที่รันจริง",
      ],
      analogy: "เบอร์ต่อภายในออฟฟิศใช้ระหว่างโต๊ะ ส่วนเบอร์หน้าอาคารใช้รับสายจากข้างนอก",
      bullets: [
        "127.0.0.1 ใน container ชี้กลับมาที่ container เดิม",
        "พอร์ตที่ host publish เปลี่ยนได้โดยไม่เปลี่ยน container port",
        "Langfuse SDK ใน container ใช้ http://langfuse-web:3000 ส่วน browser ใช้ http://127.0.0.1:3000",
      ],
      code: {
        filename: ".env.api",
        language: "text",
        code: `PORT=8080
DATABASE_URL=postgresql://ai_app:local_vector_only@vector-db:5432/ai_lab
LANGFUSE_BASE_URL=http://langfuse-web:3000`,
      },
      whyTitle: "แกะ connection error จากตำแหน่งที่รัน",
      whyParagraphs: [
        "Connection refused บน localhost จากใน API อาจแปลว่า API กำลังเรียกตัวเอง ตรวจชื่อปลายทางและพอร์ตด้านในก่อนแก้ firewall",
        "ถ้าเปลี่ยนจาก mock มาใช้ฐานข้อมูลจริง ให้ต่อ readiness เข้ากับ adapter ตาม Day 143 และทดสอบผ่าน route งานจริงด้วย",
      ],
    },
    {
      id: "d142-startup",
      title: "2 · รอ healthcheck ก่อนเริ่ม API",
      paragraphs: [
        "depends_on แบบรายชื่อจัดลำดับเริ่ม container ส่วน condition: service_healthy รอให้ probe ของ service ต้นทางผ่านก่อนเริ่ม service ที่อาศัยมัน",
        "Postgres อาจเปิด process แล้วแต่ยังเตรียม schema อยู่ ตัวอย่างใช้ psql ทาง TCP ด้วย user กับ database ที่ตั้งไว้ และยืนยันว่า extension vector อยู่จริง",
        "Compose จะส่ง dollar คู่ลงไปเป็น dollar เดียว เพื่อให้ shell ใน vector-db ขยาย POSTGRES_USER จาก env_file ตอนรัน probe",
      ],
      analogy: "ล็อกประตูไว้จนคนตรวจนับของในคลังผ่าน จากนั้นค่อยให้หน้าร้านเปิดรับคำสั่ง",
      code: { filename: "compose.yaml", language: "yaml", code: compose },
      whyTitle: "ใช้ startup gate คู่กับการรับมือหลัง startup",
      whyParagraphs: [
        "หลัง API เริ่มแล้ว depends_on ไม่ได้ตรวจแล้วหยุด API แทนเรา เมื่อฐานข้อมูลหลุด ให้ adapter มี timeout และคืนข้อผิดพลาดที่กำกับได้",
        "docker compose up --wait รอ services ให้ running หรือ healthy ตาม healthcheck ที่มี ถ้าต้องการหลักฐานว่าฟังก์ชันงานจริงผ่าน ให้เพิ่ม smoke request หลังคำสั่งนี้",
      ],
    },
    {
      id: "d142-data",
      title: "3 · แยกข้อมูลถาวรออกจากค่ากำหนด",
      paragraphs: [
        "named volume vector-data ถือ data directory ของ Postgres 16 เมื่อใช้ down ตามปกติแล้ว up กลับมา record ยังคงอยู่ ตราบใดที่ใช้ project และ volume เดิม",
        "สคริปต์ init ทำงานเฉพาะตอนเริ่ม data directory ว่าง ถ้าเพิ่ม SQL หลังเคยสร้าง volume ให้รัน migration กับฐานข้อมูลนั้นตามขั้นตอนของโปรเจกต์",
        "env_file ใน service ฉีดค่าให้ process ตอนสร้าง container ส่วน .env ของ Compose และ --env-file ที่ระดับคำสั่งใช้เป็นแหล่ง interpolation สำหรับไฟล์ Compose แยกบทบาททั้งสองจุด",
      ],
      analogy: "ตู้เอกสารอยู่ต่อเมื่อเปลี่ยนกะ ส่วนใบตั้งค่าสำหรับคนเข้ากะใหม่ถูกส่งแยกกัน",
      code: {
        filename: ".env.vector",
        language: "text",
        code: `POSTGRES_USER=ai_app
POSTGRES_PASSWORD=local_vector_only
POSTGRES_DB=ai_lab`,
      },
      bullets: [
        "รหัสตัวอย่างใช้กับฐานข้อมูลทดลองที่ไม่ publish พอร์ต",
        "แก้ env แล้วใช้ docker compose up เพื่อ recreate service ที่ได้รับผล",
        "ผล docker compose config อาจมีค่าจริงจาก env_file ใช้ config --quiet เมื่อแค่เช็ก syntax และอย่าแนบไฟล์ JSON ที่มีค่าลับ",
      ],
      whyTitle: "รักษาข้อมูลและตั้งค่าซ้ำได้",
      whyParagraphs: [
        "การแก้ POSTGRES_PASSWORD ในไฟล์ env หลัง initialize ไม่ได้เปลี่ยนรหัส role ในฐานข้อมูลเดิมโดยอัตโนมัติ อัปเดต credential ที่ฐานข้อมูลและ client ให้สอดคล้องกัน",
        "เวลาเช็ก persistence ให้ใช้ record เดิมกับ project name เดิม ใช้ query ตรวจผลแทนการเดาจากชื่อ container",
      ],
    },
    {
      id: "d142-langfuse",
      title: "4 · ต่อ Langfuse ด้วย bundle ทางการ",
      paragraphs: [
        "ใช้ Compose bundle รุ่นเดียวกับคู่มือ self-hosting แล้วบันทึก Git commit ที่เลือก Langfuse รุ่นปัจจุบันมี web และ worker พร้อมบริการเก็บข้อมูลหลายตัว ให้ bundle จัดความสัมพันธ์ภายในของมัน",
        "ไฟล์เสริมใช้ include ให้ Compose อ่าน bundle ในโฟลเดอร์ของ bundle เอง ชื่อ vector-db ตั้งแยกเพื่อให้ต่างจากฐานข้อมูล postgres ของ Langfuse ภายใน project เดียวกัน",
        "เปิด langfuse-web และ langfuse-worker พร้อม dependency ของมันเพื่อฝึก trace ท้องถิ่น เปลี่ยนค่าที่ upstream ระบุให้เปลี่ยน และจำกัด host bindings ของ bundle ไว้บน loopback",
      ],
      analogy: "เอาชุดอุปกรณ์ที่ผู้ผลิตประกอบมาแล้วมาต่อกับโต๊ะงาน แยกวงจรภายในของชุดออกจากวงจรของโต๊ะ",
      code: {
        filename: "compose.observability.yaml",
        language: "yaml",
        code: `include:
  - ./langfuse/docker-compose.yml`,
      },
      whyTitle: "ตามปัญหา trace โดยที่ API ยังตอบได้",
      whyParagraphs: [
        "API ขึ้นได้กับฐานข้อมูลของตัวเองแม้ telemetry ปิดอยู่ เมื่อเปิด trace ค่อยเพิ่ม project key ใน .env.api และสร้าง API container ใหม่",
        "หน้าเว็บ Langfuse ตอบได้เป็นเพียงสัญญาณว่า web service เปิดอยู่ worker อาจยังประมวลผลอยู่ ใช้ trace ID เดียวกันค้นยืนยันปลายทางใน Day 144",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge · localhost คนละตัว",
      body: [
        "เหมือนแยก URL ที่ฝั่ง browser เข้าถึงได้จาก URL ที่ server ใช้คุยกัน แม้ทั้งสองจะทำงานอยู่บน laptop เดียว",
        "เอา docker compose exec api เป็นมุมมองฝั่ง server แล้วลอง resolve vector-db จากตรงนั้นเมื่อตรวจปัญหา DNS",
      ],
      table: [
        ["Browser", "127.0.0.1:3000 สำหรับ Langfuse UI"],
        ["API container", "langfuse-web:3000 สำหรับ SDK"],
        ["Database client ใน API", "vector-db:5432 สำหรับ Postgres"],
      ],
    },
    student: {
      title: "First-Year Note · วาดลูกศรก่อนลองคำสั่ง",
      body: [
        "วาด host และกล่อง container คนละช่อง เขียนชื่อ service ที่ต้นลูกศรใช้เรียกปลายทางทุกเส้น",
        "วาด volume เป็นกล่องแยกจาก Postgres แล้วลองตอบว่ากล่องไหนจะหายเมื่อสร้าง container ใหม่",
      ],
    },
  },
  workedExample: {
    intro: "เปิด Local Stack ของระบบถามระเบียบเบิกค่าเดินทางโดยยังใช้คำตอบ mock ทำไฟล์ compose.yaml, .env.api และ .env.vector จากส่วนแนวคิดก่อน",
    steps: [
      {
        title: "1 · สร้าง extension บน volume ใหม่",
        explain: "สร้าง db/01-vector.sql ก่อนสั่ง up ใช้ IF NOT EXISTS เพื่อให้คำสั่งนี้เรียกซ้ำใน migration ท้องถิ่นได้",
        code: {
          language: "sql",
          filename: "db/01-vector.sql",
          code: `CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS demo_embedding (
    id integer PRIMARY KEY,
    embedding vector(3) NOT NULL
);
INSERT INTO demo_embedding (id, embedding)
VALUES (1, '[1,0,0]')
ON CONFLICT (id) DO NOTHING;`,
        },
        output: "CREATE EXTENSION\nCREATE TABLE\nINSERT 0 1",
      },
      {
        title: "2 · เปิด API และพิสูจน์ฐานข้อมูลกับ readiness",
        explain: "ล็อกชื่อ project ให้ผลทดลองซ้ำได้ และอ่านทั้งคำตอบของ API กับ SQL จากคนละ service",
        code: {
          language: "bash",
          filename: "terminal",
          code: `docker compose -p b36 config --quiet
docker compose -p b36 up -d --build --wait --wait-timeout 120 api
docker compose -p b36 ps
curl -fsS http://127.0.0.1:8080/readyz
docker compose -p b36 exec -T vector-db psql -U ai_app -d ai_lab -Atqc \\
  "SELECT id, embedding <=> '[1,0,0]' FROM demo_embedding;"
docker compose -p b36 exec -T api python -c \\
  "from socket import gethostbyname; print(gethostbyname('vector-db'))"`,
        },
        output: "b36-vector-db-1   Up (healthy)\nb36-api-1         Up (healthy)\n{\"ready\":true}\n1|0\n172.19.0.2",
      },
      {
        title: "3 · เพิ่ม Langfuse และยืนยันเส้นทางใน network",
        explain: "clone bundle ใน langfuse/ ตามคู่มือ upstream ตั้งค่าที่ระบุ CHANGEME แล้วให้ port ที่ publish bind 127.0.0.1 สร้างไฟล์ compose.observability.yaml จากส่วนแนวคิดและรันชุดคำสั่งนี้",
        code: {
          language: "bash",
          filename: "terminal",
          code: `git -C langfuse rev-parse HEAD
docker compose -p b36 -f compose.yaml -f compose.observability.yaml config --quiet
docker compose -p b36 -f compose.yaml -f compose.observability.yaml up -d langfuse-web langfuse-worker
docker compose -p b36 -f compose.yaml -f compose.observability.yaml logs --tail 15 langfuse-web
docker compose -p b36 -f compose.yaml -f compose.observability.yaml exec -T api python -c \\
  "from urllib.request import urlopen; print(urlopen('http://langfuse-web:3000', timeout=3).status)"`,
        },
        output: "langfuse-web-1  | Ready\n200",
      },
    ],
    gotcha: "สร้าง project จาก UI ที่ 127.0.0.1:3000 ก่อนใส่ LANGFUSE_PUBLIC_KEY และ LANGFUSE_SECRET_KEY ใน .env.api ถ้า API ยังไม่มี exporter ให้จดแค่ผล DNS/HTTP แล้วต่อ instrumentation วัน 144 เมื่อหยุดชุดที่มี Langfuse ใช้ flags -f ทั้งสองไฟล์เดิมกับ down",
  },
  practice: {
    intro: "โจทย์ 12 นาที เขียน compose_policy.py เพื่อตรวจผล JSON ของ Compose สำหรับโปรไฟล์ของบทนี้ ทดสอบด้วย fixture โดยไม่ต้องเปิด service",
    requirements: [
      "audit รับ Compose model แบบ normalized จาก docker compose config --format json ตรวจว่ามี services api และ vector-db",
      "API ต้อง depends_on vector-db แบบ service_healthy และทั้งสอง service ต้องมี healthcheck test แบบ array ที่เปิดใช้งาน",
      "vector-db ต้องมี named volume ที่ประกาศไว้และ mount ที่ /var/lib/postgresql/data สำหรับ Postgres 16",
      "CLI คืน 0 เมื่อผ่าน 1 เมื่อผิด policy และ 2 เมื่อ JSON อ่านไม่ได้หรือไม่มี services mapping พิมพ์เฉพาะชื่อ finding",
    ],
    starter: {
      filename: "compose_policy.py",
      language: "python",
      code: `import argparse
import json
from pathlib import Path

DB_DIR = "/var/lib/postgresql/data"


def audit(model: dict) -> list[str]:
    services = model["services"]
    # TODO: ตรวจก่อนว่ามีทั้งสอง service แล้วค่อยตรวจ policy ของแต่ละตัว
    raise NotImplementedError


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("model", type=Path)
    args = parser.parse_args(argv)
    # TODO: อ่านและตรวจ shape ขั้นต้น พิมพ์เฉพาะชื่อ finding
    raise NotImplementedError


if __name__ == "__main__":
    raise SystemExit(main())`,
    },
    verification: { filename: "test_compose_policy.py", language: "python", code: tests },
    selfCheck: [
      "ลองแก้ condition จาก healthy เป็น started โดยคงข้อมูลอื่นเดิม",
      "ลองใส่ test เป็น NONE แล้วดูชื่อ service ที่รายงาน",
      "ลองใช้ bind mount แทน named volume ที่ data directory",
      "redirect ผล config ไปไฟล์ชั่วคราวเฉพาะ stack ที่ใช้ค่าทดลอง",
    ],
    acceptance: "เทสต์ผ่านและ CLI แสดง Compose policy OK เมื่อใช้ชุดไฟล์ตัวอย่าง จากนั้นดูสถานะ healthy จาก compose ps อีกชั้น",
    hints: [
      { body: "ตรวจ JSON หลัง Compose ขยาย short syntax แล้ว เช่น depends_on ที่กลายเป็น mapping" },
      { body: "ตรวจ healthcheck.disable กับคำแรกของ test แยกกัน ใช้ any ค้น mount ที่ match ทั้ง type, source และ target" },
      {
        body: "คัดลอกส่วนแรกเป็น compose_policy.py และส่วนหลังบรรทัดคั่นเป็น test_compose_policy.py",
        code: {
          filename: "compose_policy.py",
          language: "python",
          code: `import argparse
import json
import sys
from pathlib import Path

DB_DIR = "/var/lib/postgresql/data"
REQUIRED_SERVICES = ("api", "vector-db")


def has_probe(service: dict) -> bool:
    check = service.get("healthcheck", {})
    command = check.get("test", [])
    return (
        not check.get("disable", False)
        and isinstance(command, list)
        and len(command) >= 2
        and command[0] in ("CMD", "CMD-SHELL")
    )


def audit(model: dict) -> list[str]:
    services = model["services"]
    missing = [f"service:{name}" for name in REQUIRED_SERVICES if name not in services]
    if missing:
        return missing

    findings = []
    dependency = services["api"].get("depends_on", {}).get("vector-db", {})
    if dependency.get("condition") != "service_healthy":
        findings.append("dependency:api->vector-db")

    for name in REQUIRED_SERVICES:
        if not has_probe(services[name]):
            findings.append(f"healthcheck:{name}")

    volumes = model.get("volumes", {})
    if not any(
        mount.get("type") == "volume"
        and mount.get("source") in volumes
        and mount.get("target") == DB_DIR
        for mount in services["vector-db"].get("volumes", [])
    ):
        findings.append("volume:vector-db")
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check the B36 Compose profile")
    parser.add_argument("model", type=Path)
    args = parser.parse_args(argv)
    try:
        model = json.loads(args.model.read_text(encoding="utf-8"))
        if not isinstance(model, dict) or not isinstance(model.get("services"), dict):
            raise ValueError("Expected a services mapping")
    except (OSError, ValueError):
        print("Cannot read Compose model", file=sys.stderr)
        return 2

    findings = audit(model)
    if findings:
        print("\\n".join(findings))
        return 1
    print("Compose policy OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

# แยกเป็น test_compose_policy.py
${tests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run --with pytest pytest -q test_compose_policy.py
# ใช้ส่วนต่อไปนี้กับค่า local สังเคราะห์เท่านั้น
model=$(mktemp)
docker compose -p b36 config --format json > "$model" &&
  uv run python compose_policy.py "$model"
rm "$model"`,
    },
  },
  mistakes: [
    {
      title: "ใส่ localhost ใน DATABASE_URL ของ API",
      symptom: "API คุยฐานข้อมูลไม่ได้ แต่ psql จาก container ของฐานข้อมูลผ่าน",
      fix: "ใช้ vector-db:5432 ใน API แล้วทดสอบ resolve ชื่อนั้นจาก API container",
    },
    {
      title: "ใช้ depends_on แบบรายชื่อแล้วคาดหวังว่า schema พร้อม",
      symptom: "เริ่มระบบใหม่แล้วแอปบูตเร็วกว่าการสร้าง extension",
      fix: "ตั้ง healthcheck ที่ query จริงและใช้ condition: service_healthy",
    },
    {
      title: "เปลี่ยน init script หลัง volume ถูกสร้าง",
      symptom: "ไฟล์ SQL ใหม่อยู่ใน container แล้ว แต่ query ไม่พบ schema ที่เพิ่ม",
      fix: "ใช้ migration บน volume เดิม และตรวจจาก psql ว่า object ถูกสร้างครบ",
    },
    {
      title: "SDK ใช้ URL ที่เปิดได้เฉพาะจาก browser",
      symptom: "เปิดหน้า Langfuse ได้ แต่ API ส่ง trace ไป localhost ใน container ของตัวเอง",
      fix: "ใช้ langfuse-web:3000 ใน SDK และตรวจ worker กับ project key เมื่อ trace ยังมาไม่ถึง",
    },
  ],
  quiz: {
    questions: [
      mc("d142-q1", "API container ใช้ปลายทางใดเพื่อไป Postgres?", [
        ["127.0.0.1:5432", "ชี้กลับมายัง API container"],
        ["vector-db:5432", "ชื่อ service resolve ได้จาก network เดียวกัน"],
        ["127.0.0.1:8080", "เป็นปลายทางของ API ที่ publish บน host"],
        ["vector-data:5432", "เป็นชื่อ volume ที่เก็บไฟล์"],
      ], "B", "Compose DNS resolve ชื่อ service ให้ client ภายใน network เดียวกัน", "DATABASE_URL ใช้ host อะไร?", "ใช้ชื่อ service vector-db"),
      mc("d142-q2", "อะไรทำให้ Compose รอ Postgres ผ่าน probe ก่อนเปิด API?", [
        ["env_file", "กำหนด environment ตอนสร้าง container"],
        ["ports", "เผยพอร์ตไปที่ host"],
        ["ลำดับ service ใน YAML", "ตำแหน่งในไฟล์ไม่สร้าง health gate"],
        ["condition: service_healthy", "รอผล healthcheck ที่ service ต้นทาง"],
      ], "D", "ตั้ง healthy condition คู่กับ probe ที่สะท้อนเงื่อนไขของ dependency จริง", "health gate ต้องใช้ค่าใด?", "condition: service_healthy"),
      mc("d142-q3", "แก้ init SQL แต่ฐานข้อมูลใช้ volume เดิม ควรทำอย่างไร?", [
        ["รัน migration แล้วตรวจด้วย query", "อัปเดต schema ของฐานข้อมูลที่ initialize แล้ว"],
        ["เปลี่ยน host port", "ไม่กระทบ schema"],
        ["เปลี่ยน order ของ services", "ไม่ทำให้ init รันใหม่"],
        ["เปลี่ยน timeout ของ API", "ไม่รันคำสั่ง SQL เพิ่ม"],
      ], "A", "สคริปต์ใน init directory ทำงานเมื่อ data directory ว่าง ส่วนข้อมูลเดิมขยับด้วย migration", "init script ทำงานเมื่อไหร่?", "เมื่อ Postgres เปิด data directory ใหม่ที่ว่าง"),
      mc("d142-q4", "หน้า Langfuse เปิดได้แล้ว อะไรยืนยันว่า trace ส่งถึง?", [
        ["API มี container ID", "บอกว่า container ถูกสร้าง"],
        ["เวอร์ชัน Compose ตรงกัน", "บอกสภาพแวดล้อมของเครื่อง"],
        ["ค้นเจอ trace ID ของคำขอจริงใน project", "ผูกงานตั้งแต่ API จนถึงปลายทางได้"],
        ["Postgres ตอบ SELECT 1", "ยืนยันเส้นทางฐานข้อมูลบางส่วน"],
      ], "C", "ตรวจ trace ID ที่มาจากคำขอเดียวกันใน project จึงบอกเรื่อง delivery ได้", "เปิด UI ได้แล้วควรพิสูจน์อะไรเพิ่ม?", "ค้น trace ID จากคำขอ smoke ใน project"),
    ],
  },
  takeaways: [
    "ใช้ service name กับ container port ให้ตรงกับตำแหน่งของ client",
    "ใช้ healthcheck และ service_healthy จัด startup แล้วคุม timeout ระหว่างรันด้วย",
    "แยก named volume, init SQL, runtime env และ Langfuse bundle ตามหน้าที่",
    "Day 143 นำ image เดิมขึ้น staging พร้อม secrets และ probes ของแพลตฟอร์ม",
  ],
  reviewCards: [
    rc("d142-dns", "localhost จากใน API หมายถึงเครื่องไหน?", "loopback ของ API container เอง"),
    rc("d142-gate", "depends_on แบบ service_healthy ช่วยช่วงไหน?", "ช่วงเริ่ม service ที่พึ่ง dependency รอผล healthcheck"),
    rc("d142-volume", "เก็บอะไรใน vector-data?", "Postgres 16 data directory ซึ่งอยู่ต่อหลัง down ตามปกติ"),
    rc("d142-env", "service env_file ต่างจาก .env ของ Compose อย่างไร?", "env_file ฉีดเข้า process ส่วน .env เป็นแหล่ง interpolation ของ Compose"),
  ],
  sources: [
    { label: "Docker · Control startup and shutdown order", href: "https://docs.docker.com/compose/how-tos/startup-order/" },
    { label: "Docker · Include Compose files", href: "https://docs.docker.com/compose/how-tos/multiple-compose-files/include/" },
    { label: "Docker · Set environment variables", href: "https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/" },
    { label: "pgvector · Docker and extension setup", href: "https://github.com/pgvector/pgvector" },
    { label: "Langfuse · Self-hosting with Docker Compose", href: "https://langfuse.com/self-hosting/deployment/docker-compose" },
  ],
  glossary: ["dockerfile", "env-config", "fastapi", "langfuse", "uv"],
});
