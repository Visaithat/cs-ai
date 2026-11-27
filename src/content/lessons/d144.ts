import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const tests = `import asyncio

import httpx
import pytest

from staging_smoke import (
    build_traceparent,
    make_demo_staging_app,
    parse_traceparent,
    run_staging_smoke,
)


def test_build_and_parse_w3c_traceparent():
    trace_id, header = build_traceparent()
    parsed_trace, parent_id, flags = parse_traceparent(header)
    assert parsed_trace == trace_id
    assert len(parsed_trace) == 32
    assert len(parent_id) == 16
    assert flags == "01"


@pytest.mark.parametrize(
    "bad_header",
    [
        "",
        "01-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
        "00-00000000000000000000000000000000-00f067aa0ba902b7-01",
        "00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01",
        "00-4BF92F3577B34DA6A3CE929D0E0E4736-00f067aa0ba902b7-01",
        "00-short-00f067aa0ba902b7-01",
    ],
)
def test_parse_traceparent_rejects_invalid_headers(bad_header):
    with pytest.raises(ValueError):
        parse_traceparent(bad_header)


def test_full_staging_smoke_passes_with_eventual_trace_delivery():
    app = make_demo_staging_app(ready=True, delivery_delay_polls=2)

    async def scenario():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://staging.test") as client:
            return await run_staging_smoke(
                client,
                max_trace_polls=4,
                poll_interval_seconds=0.0,
            )

    report = asyncio.run(scenario())
    assert report.passed is True
    assert report.health_ok is True
    assert report.ready_ok is True
    assert report.query_ok is True
    assert report.trace_echoed is True
    assert report.trace_delivered is True
    assert report.delivery_attempts == 2
    assert report.failed_checks == []
    assert len(report.trace_id) == 32


def test_unready_staging_fails_closed_before_query():
    app = make_demo_staging_app(ready=False)

    async def scenario():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://staging.test") as client:
            return await run_staging_smoke(client, poll_interval_seconds=0.0)

    report = asyncio.run(scenario())
    assert report.passed is False
    assert report.health_ok is True
    assert report.ready_ok is False
    assert report.query_ok is False
    assert "readyz" in report.failed_checks


def test_broken_healthz_fails_smoke():
    app = make_demo_staging_app(alive=False, ready=True)

    async def scenario():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://staging.test") as client:
            return await run_staging_smoke(client, poll_interval_seconds=0.0)

    report = asyncio.run(scenario())
    assert report.passed is False
    assert report.health_ok is False
    assert "healthz" in report.failed_checks


def test_trace_echo_mismatch_is_caught():
    app = make_demo_staging_app(ready=True, echo_wrong_trace=True)

    async def scenario():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://staging.test") as client:
            return await run_staging_smoke(client, poll_interval_seconds=0.0)

    report = asyncio.run(scenario())
    assert report.passed is False
    assert report.query_ok is True
    assert report.trace_echoed is False
    assert "trace_echo" in report.failed_checks


def test_dropped_trace_fails_delivery_after_bounded_polls():
    app = make_demo_staging_app(ready=True, drop_trace=True)

    async def scenario():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://staging.test") as client:
            return await run_staging_smoke(
                client,
                max_trace_polls=3,
                poll_interval_seconds=0.0,
            )

    report = asyncio.run(scenario())
    assert report.passed is False
    assert report.query_ok is True
    assert report.trace_echoed is True
    assert report.trace_delivered is False
    assert report.delivery_attempts == 3
    assert "trace_delivery" in report.failed_checks


def test_transport_error_fails_without_leaking_auth_header():
    def broken_handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("dial tcp staging.internal:443: connection refused")

    async def scenario():
        transport = httpx.MockTransport(broken_handler)
        headers = {"Authorization": "Bearer super-secret-staging-token"}
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://staging.test",
            headers=headers,
        ) as client:
            return await run_staging_smoke(client, poll_interval_seconds=0.0)

    report = asyncio.run(scenario())
    assert report.passed is False
    assert report.health_ok is False
    assert "super-secret-staging-token" not in report.model_dump_json()`;

export const d144: Lesson = defineLesson({
  day: 144,
  titleTh: "ทบทวน B36 · Deploy Staging API และตรวจ /healthz กับ Trace Delivery",
  tagline: "30 นาที · รวบผลจาก D141–D143 สร้างสคริปต์ staging smoke test ตรวจ /healthz, /readyz และ W3C traceparent แบบทดสอบออฟไลน์ได้ 100%",
  icon: "shield-check",
  visual: {
    id: "cloud-deploy-health",
    title: "เส้นทางตรวจรับ Staging: Health, Readiness และ Trace Delivery",
    caption: "ตามคำขอ smoke test ตั้งแต่สร้าง W3C traceparent ยิงผ่าน /healthz, /readyz, /v1/query จนยืนยัน trace_id ที่ปลายทาง Langfuse",
    alt: "แผนภาพ smoke test ส่งคำขอไปยัง staging revision ตรวจ /healthz และ /readyz จากนั้นยิง /v1/query พร้อม traceparent และตรวจสอบการส่งถึง trace collector ด้วย trace_id เดียวกัน",
  },
  requiresApiKey: false,
  apiKeyNote: "รันทดสอบ staging_smoke.py กับ FastAPI ASGI app จำลองบนเครื่องผ่าน httpx.ASGITransport ได้ 100% ส่วนการ deploy จริงใช้คำสั่ง Cloud Run / Fly.io ของคุณ",
  tools: ["Python 3.12", "uv", "FastAPI", "httpx", "Pydantic v2", "pytest", "Cloud Run / Fly.io"],

  bigPicture: [
    {
      node: 0,
      heading: "ทวนภาพรวมบล็อก B36 (D141–D143) ก่อนอนุมัติ Staging",
      body: "ตลอดสามวันของบล็อก B36 คุณแพ็ก API ถามระเบียบเบิกค่าเดินทางลง {{dockerfile}} แบบ multi-stage non-root (D141), ประกอบ local stack กับ pgvector และ {{langfuse}} ด้วย Docker Compose (D142) และวางกติกา secrets กับ `/healthz` และ `/readyz` บน Cloud Run หรือ Fly.io (D143) วันนี้เราเชื่อมทั้งสามวันเป็นด่านตรวจรับเดียวก่อนเปิดให้ผู้ทดสอบเข้าใช้งาน",
      lessonNote: "ใช้ smoke test แบบอัตโนมัติแทนการกด curl มือทีละ route เพื่อให้ตรวจซ้ำได้ทุก revision",
    },
    {
      node: 4,
      heading: "ตรวจทั้งสุขภาพ container และเส้นทางงานจริง",
      body: "`/healthz` ยืนยันว่าโปรเซส Uvicorn ไม่ค้าง และ `/readyz` ยืนยันว่า boot ครบและ dependency พร้อม แต่ทั้งสองยังไม่พิสูจน์ว่า route `POST /v1/query` ตอบคำถามสังเคราะห์ได้ถูกต้องและแนบ {{otel}} context ครบ",
      lessonNote: "รัน smoke gate ตามลำดับ `/healthz` → `/readyz` → `POST /v1/query` และหยุดแบบ {{fail-fast}} เมื่อฐานยังไม่พร้อม",
    },
    {
      node: 5,
      heading: "พิสูจน์ Trace Delivery ด้วย W3C traceparent",
      body: "การเปิดหน้าเว็บ Langfuse ได้ยังไม่เท่ากับว่า trace ของคำขอจาก staging ส่งถึงจริง สคริปต์วันนี้สร้าง header `traceparent` ตามมาตรฐาน W3C Trace Context แล้วเช็กทั้งการสะท้อน `trace_id` กลับจาก API และการค้นเจอ `trace_id` เดียวกันที่ฝั่ง collector แบบมี retry budget",
      lessonNote: "Worker ของ Langfuse ประมวลผลแบบ async การ poll แบบจำกัดจำนวนครั้งช่วยแยก delay ปกติออกจาก trace หายจริง",
    },
    {
      node: 6,
      heading: "เก็บหลักฐาน Staging และส่งไม้ต่อสู่ Block B37 (D145)",
      body: "เมื่อ smoke ผ่านพร้อม latency และ token metadata ที่ปรากฏครบใน trace เราจึงค่อยย้าย traffic ใน staging และนำตัวเลข latency กับความยาว token จาก trace เหล่านี้ไปใช้คำนวณต้นทุน API เทียบ {{vllm}} บน GPU ใน Day 145 เพื่อเดินหน้าสู่ **Evaluated & Guarded AI Microservice v0.5.0** ที่ Day 156",
      lessonNote: "ทุกผล smoke เก็บคู่กับ image digest, revision name และ secret version เพื่อย้อนตรวจสอบได้",
    },
  ],

  objectives: [
    "**สรุปและเชื่อมโยงความรู้บล็อก B36 (D141–D143)** ตั้งแต่ multi-stage Dockerfile, Docker Compose local stack, runtime secrets จนถึงการแยก `/healthz` กับ `/readyz` บน Cloud Run / Fly.io",
    "**สร้างและตรวจสอบ W3C `traceparent` header** (`00-<trace_id>-<parent_id>-<flags>`) เพื่อผูกคำขอ smoke test กับ response ของ {{fastapi}} และการส่ง trace ถึงปลายทาง observability",
    "**เขียนสคริปต์ `staging_smoke.py` แบบ Fail-Closed** ที่ทดสอบครบทั้ง `/healthz`, `/readyz`, `POST /v1/query` และ trace delivery พร้อมรันทดสอบแบบออฟไลน์ผ่าน `httpx.ASGITransport` ด้วย {{pytest}}",
  ],

  prerequisites: [
    "Day 141 · Multi-stage {{dockerfile}} สำหรับ {{uv}} และ non-root UID 10001",
    "Day 142 · `docker compose` local stack (`vector-db`, `api`, `langfuse-web`, `langfuse-worker`)",
    "Day 143 · Cloud Run / Fly.io deployment, runtime {{env-config}} secrets และ `/healthz` vs `/readyz`",
    "Day 133–134 · {{otel}} trace context และ {{langfuse}} trace lookup ด้วย `trace_id`",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์สำหรับแลบทบทวน Day 144 ใช้ {{uv}} รัน FastAPI, {{httpx}}, {{pydantic}} และ {{pytest}} ในโปรเซสเดียวกัน จึงทดสอบ smoke gate ได้แม้เครื่องไม่มี Docker daemon หรือบัญชี cloud",
    commands: `uv --version
uv run --with fastapi --with httpx --with pydantic --with pytest python -c "import fastapi, httpx, pydantic; print('B36 review env ready')"
# ถ้าจะรันกับ staging จริงหลังทดสอบออฟไลน์ผ่าน ให้ตรวจ CLI ที่ใช้
gcloud --version
fly version`,
    steps: [
      ["recall", "ใช้ 10 นาทีแรกทำ Quiz ทบทวน B36 (D141–D144) เพื่อดึงความจำเรื่อง Dockerfile, Compose, Probes และ Trace Context"],
      ["offline", "สร้าง `staging_smoke.py` และ `test_staging_smoke.py` แล้วทดสอบทุกเคสผ่าน `httpx.ASGITransport` โดยไม่แตะเครือข่ายภายนอก"],
      ["staging", "หากมี staging บน Cloud Run หรือ Fly.io ให้ deploy candidate แล้วชี้ `staging_smoke.py` ไปยัง URL จริงด้วย token ของผู้ทดสอบ"],
    ],
    note: "จังหวะเวลา 30 นาทีของวัน Review: Quiz ทบทวน B36 (10 นาที) → เขียนและทดสอบ `staging_smoke.py` (15 นาที) → จด Error Log และเชื่อมเข้า B37 (5 นาที)",
  },

  concepts: [
    {
      id: "d144-b36-recap",
      title: "1 · ภาพรวม 4 ชั้นของบล็อก B36 (D141 → D144)",
      paragraphs: [
        "ก่อนเขียนด่านตรวจรับ ลองเรียง 4 ชั้นที่เราสร้างตลอดสัปดาห์นี้ให้ต่อกันเป็นเส้นเดียว: **D141** ทำให้ artifact ทำซ้ำได้ด้วย multi-stage {{dockerfile}}, {{lockfile}} (`uv sync --frozen` / `--locked`), `.dockerignore` และ `USER 10001:10001` เพื่อไม่ให้ค่าลับหรือสิทธิ์ root หลุดเข้าไปใน image",
        "**D142** นำ image นั้นมาวิ่งร่วมกับ Postgres/`pgvector` (`vector-db`) และ {{langfuse}} ผ่าน `docker compose` โดยใช้ DNS ภายใน network, `condition: service_healthy` ที่ตรวจ extension จริง และ named volume เก็บข้อมูลข้ามการ recreate",
        "**D143** ยก image digest เดิมขึ้น staging บน Cloud Run หรือ Fly.io แยกค่าลับออกจาก build ไปฉีดที่ runtime ผ่าน Secret Manager / Fly secrets และแยก `/healthz` (process alive) ออกจาก `/readyz` (booted + dependency ready ภายใน timeout budget) คู่กับ tagged candidate revision — และ **D144** วันนี้คือด่านตรวจรับอัตโนมัติที่ยืนยันว่าทุกชั้นทำงานประสานกันจริงก่อนย้าย traffic",
      ],
      analogy: "เหมือนปล่อยดาวเทียมขึ้นวงโคจร: D141 คือประกอบตัวถังให้เบาและแน่น, D142 คือทดสอบบนแท่นจำลองพร้อมระบบสื่อสาร, D143 คือปล่อยขึ้นแท่นยิงพร้อมระบบนิรภัย และ D144 คือส่งสัญญาณ ping ไปเช็กทั้งพลังงานและข้อมูล telemetry ที่ส่งกลับมายังสถานีภาคพื้นดิน",
      bullets: [
        "**Artifact integrity (D141)**: อ้าง image ด้วย `sha256` digest และตรวจ non-root",
        "**Local parity (D142)**: แยกชื่อ service ภายใน network ออกจาก host loopback และใช้ `service_healthy`",
        "**Runtime safety (D143)**: แยก `/healthz` กับ `/readyz`, ฉีด secrets ที่ runtime และทดสอบผ่าน `--no-traffic --tag candidate`",
        "**Release proof (D144)**: สคริปต์ smoke test ที่ตรวจทั้ง HTTP health และ trace delivery ในรอบเดียว",
      ],
      whyTitle: "ทำไมต้องรวมทุกชั้นไว้ในด่านตรวจรับเดียว?",
      whyParagraphs: [
        "ในงานจริงปัญหาแทบไม่เคยเกิดจากชั้นเดียวโดด ๆ เช่น image build ผ่าน (D141) และ `/healthz` ตอบ 200 (D143) แต่ `LANGFUSE_BASE_URL` ยังชี้ไป `localhost` จากตอนลองบนเครื่อง (D142) ทำให้ API ตอบลูกค้าได้แต่ทีมตาบอดไม่มี trace เก็บไว้เลย",
        "การมีสคริปต์ smoke test หนึ่งตัวที่รันได้ทั้งใน CI (แบบ ASGI offline) และหลัง deploy staging จริง ช่วยจับจุดรอยต่อระหว่างโค้ดกับ config ได้ทันที",
      ],
    },
    {
      id: "d144-traceparent",
      title: "2 · มาตรฐาน W3C traceparent และการยืนยัน Trace Delivery",
      paragraphs: [
        "ตามสเปก W3C Trace Context header ชื่อ `traceparent` มีรูปแบบคงที่ 4 ส่วนคั่นด้วยขีดกลางคือ `version-trace_id-parent_id-trace_flags` เช่น `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01` โดย version `00` คือรุ่นมาตรฐานปัจจุบัน, `trace_id` เป็นเลขฐานสิบหกตัวพิมพ์เล็ก 32 ตัวอักษร (16 ไบต์) ที่ห้ามเป็นศูนย์ทั้งหมด, `parent_id` เป็นฐานสิบหกตัวพิมพ์เล็ก 16 ตัวอักษร (8 ไบต์) ที่ห้ามเป็นศูนย์ทั้งหมด และ `01` หมายถึงเปิด flag sampled เพื่อให้ระบบเก็บ trace นี้",
        "เมื่อสคริปต์ smoke test สร้าง `trace_id` เองแล้วส่งไปใน header `traceparent` ของ `POST /v1/query` ฝั่ง {{fastapi}} middleware จะดึง `trace_id` เดียวกันไปสร้าง root span, สะท้อนกลับใน response (`X-Trace-Id` และฟิลด์ `trace_id` ใน JSON) และส่ง span ออกไปยัง {{langfuse}} หรือ OTel collector",
        "การยืนยัน **Trace Delivery** จึงมีสองขั้นตอนที่ห้ามสลับหรือตัดทอน: (1) ยืนยันว่า API อ่านและสะท้อน `trace_id` ตรงกับที่เราส่งไป (trace propagation) และ (2) ยิงตรวจไปยังปลายทาง trace store ด้วย `trace_id` นั้นแบบจำกัดจำนวนครั้ง (bounded polling) เพราะ worker ของ Langfuse ใช้เวลาสั้น ๆ ในการ ingest แบบ async",
      ],
      analogy: "เหมือนส่งพัสดุลงทะเบียนพร้อมแปะบาร์โค้ดเลขติดตามเองตั้งแต่ต้นทาง: ขั้นแรกตรวจใบเสร็จรับของหน้าเคาน์เตอร์ว่ายิงเลขบาร์โค้ดตรงกัน (trace echo) ขั้นสองเปิดระบบติดตามพัสดุดูว่ากล่องหมายเลขเดียวกันไปโผล่ที่ศูนย์คัดแยกจริงไหม (trace delivery)",
      code: {
        language: "python",
        filename: "trace_context_check.py",
        caption: "สร้างและตรวจความถูกต้องของ W3C traceparent ตามสเปก (ปฏิเสธ all-zero และตัวพิมพ์ใหญ่)",
        code: `import re
import secrets

TRACE_ID_RE = re.compile(r"^[0-9a-f]{32}$")
PARENT_ID_RE = re.compile(r"^[0-9a-f]{16}$")
FLAGS_RE = re.compile(r"^[0-9a-f]{2}$")


def build_traceparent(sampled: bool = True) -> tuple[str, str]:
    trace_id = secrets.token_hex(16)
    parent_id = secrets.token_hex(8)
    flags = "01" if sampled else "00"
    return trace_id, f"00-{trace_id}-{parent_id}-{flags}"


def parse_traceparent(header: str) -> tuple[str, str, str]:
    parts = header.strip().split("-")
    if len(parts) != 4 or parts[0] != "00":
        raise ValueError("invalid W3C traceparent version or format")
    _, trace_id, parent_id, flags = parts
    if not TRACE_ID_RE.fullmatch(trace_id) or trace_id == "0" * 32:
        raise ValueError("invalid trace_id")
    if not PARENT_ID_RE.fullmatch(parent_id) or parent_id == "0" * 16:
        raise ValueError("invalid parent_id")
    if not FLAGS_RE.fullmatch(flags):
        raise ValueError("invalid trace_flags")
    return trace_id, parent_id, flags`,
      },
      whyTitle: "ทำไมไม่ใช้ UUID ธรรมดาหรือปล่อยให้เซิร์ฟเวอร์สุ่ม ID เองอย่างเดียว?",
      whyParagraphs: [
        "W3C `traceparent` เป็นมาตรฐานที่ทั้ง {{otel}}, Cloud Run, Fly Proxy และ SDK ของ {{langfuse}} เข้าใจตรงกันโดยอัตโนมัติ การให้ smoke client กำหนด `traceparent` เองและตั้ง flag `01` ช่วยให้เราตามหา trace ของคำขอทดสอบนั้นได้แม่นยำ 100% แม้จะมีคำขออื่นวิ่งปนอยู่ใน staging พร้อมกัน",
        "และถ้า API ลืม propagate `traceparent` แล้วเผลอสร้าง `trace_id` ใหม่เอง สคริปต์จะจับความคลาดเคลื่อนที่ด่าน `trace_echo` ได้ทันที",
      ],
    },
    {
      id: "d144-smoke-gate",
      title: "3 · ออกแบบ Smoke Gate แบบ Fail-Closed และทดสอบออฟไลน์ด้วย ASGITransport",
      paragraphs: [
        "ด่าน smoke test ที่มีประโยชน์ต้อง **Fail-Closed** และรายงานชัดว่าพังที่ขั้นไหน: ขั้นที่ 1 ยิง `GET /healthz` ต้องได้ HTTP 200 และ `{\"status\": \"ok\"}` ขั้นที่ 2 ยิง `GET /readyz` ต้องได้ HTTP 200 และ `{\"ready\": true}` หาก `/readyz` ตอบ 503 ให้หยุดก่อนส่ง query จริงเพื่อไม่ให้เกิด error ซ้ำซ้อนบน instance ที่ยังไม่พร้อม",
        "ขั้นที่ 3 ยิง `POST /v1/query` ด้วยคำถามสังเคราะห์เรื่องระเบียบเบิกค่าเดินทางพร้อม header `traceparent` ตรวจ status 200, ตรวจว่ามีข้อความคำตอบ และตรวจว่า `X-Trace-Id` กับ `body[\"trace_id\"]` ตรงกับ `trace_id` ที่ส่งไป ขั้นที่ 4 เรียก endpoint ตรวจ trace (`GET /traces/{trace_id}` ในแลบ หรือ Langfuse Public API `/api/public/traces/{trace_id}` บน staging) วนตรวจไม่เกิน `max_trace_polls` ครั้ง",
        "ข้อดีของการเขียน `run_staging_smoke(client: httpx.AsyncClient, ...)` โดยรับ {{httpx}} client จากภายนอกคือ ตอนรันบน staging จริงเราส่ง client ที่ต่อ HTTPS จริงพร้อม Bearer token ส่วนตอนทดสอบใน `pytest` บนเครื่องที่ไม่มี Docker daemon เราเสียบ `httpx.ASGITransport(app=app)` เข้าไปยิง FastAPI ในหน่วยความจำได้ตรง ๆ เร็วระดับมิลลิวินาทีและจำลองได้ทั้งกรณี `ready=False`, `echo_wrong_trace=True`, `delivery_delay_polls=2` และ `drop_trace=True`",
      ],
      analogy: "เหมือนเครื่องทดสอบสายไฟรถยนต์ที่เสียบกับกล่องจำลองบนโต๊ะช่างได้ก่อนเอาไปเสียบกับรถคันจริงบนถนน ใช้หัวปลั๊กและโปรโตคอลเดียวกันเป๊ะแต่ทดสอบเคสสายขาดได้ปลอดภัยกว่า",
      code: {
        language: "python",
        filename: "asgi_smoke_preview.py",
        caption: "ส่ง httpx.ASGITransport เข้า smoke runner เพื่อทดสอบ FastAPI ในโปรเซสโดยไม่ต้องเปิดพอร์ตหรือ Docker",
        code: `import asyncio
import httpx
from staging_smoke import make_demo_staging_app, run_staging_smoke


async def demo() -> None:
    app = make_demo_staging_app(ready=True, delivery_delay_polls=2)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://staging.test") as client:
        report = await run_staging_smoke(client, max_trace_polls=4, poll_interval_seconds=0.0)
        print(report.model_dump_json(indent=2))


asyncio.run(demo())`,
      },
      whyTitle: "ห้ามพิมพ์ Authorization Header หรือ Secret ลงรายงานเมื่อ Smoke ล้ม",
      whyParagraphs: [
        "สคริปต์ smoke test มักรันใน GitHub Actions หรือ terminal ที่แชร์ log ให้ทีมอ่าน หากเกิด `httpx.HTTPError` ให้บันทึกเฉพาะชื่อด่านที่ล้ม (`healthz`, `readyz`, `query`, `trace_echo`, `trace_delivery`) และสรุปสถานะ โดยไม่ dump `request.headers` หรือ Bearer token ลง stdout/JSON เด็ดขาด",
      ],
    },
    {
      id: "d144-deploy-to-b37",
      title: "4 · ขั้นตอน Deploy จริงบน Cloud Run / Fly.io และสะพานสู่ Block B37 (D145)",
      paragraphs: [
        "เมื่อ `pytest` ของสคริปต์ smoke ผ่านบนเครื่องแล้ว ขั้นตอน deploy จริงบน staging มีจังหวะที่ชัดเจน: บน **Cloud Run** ใช้ `gcloud run deploy --image \"$IMAGE\" --no-traffic --tag candidate` พร้อม `--update-secrets` ที่ pin version สำหรับทั้ง `LANGFUSE_SECRET_KEY` และค่าคอนฟิกที่จำเป็น จากนั้นขอ identity token แล้วรัน `staging_smoke.py` ยิงไปยัง `CANDIDATE_URL` เมื่อ `passed: true` ค่อยขยับ traffic ด้วย `gcloud run services update-traffic`",
        "บน **Fly.io** ตรวจ `fly.toml` ให้ `internal_port = 8080` และ `[[http_service.checks]]` ชี้ไป `/readyz`, นำเข้า secrets ผ่าน `fly secrets import --stage`, สั่ง `fly deploy --app \"$FLY_APP\" --image \"$IMAGE\" --strategy rolling`, เช็ก `fly checks list` แล้วรัน `staging_smoke.py` ยืนยันการตอบกลับและ trace delivery",
        "เมื่อจบบล็อก B36 วันนี้ คุณมี AI Microservice ที่แพ็กเป็น container, ขึ้น staging ได้ และส่ง trace พร้อม latency + token usage ครบถ้วน ในวันพรุ่งนี้ (**Day 145 — เปิดบล็อก B37: Inference Economics**) เราจะหยิบตัวเลขความยาว input/output token, {{ttft}} และ peak RPS ที่เก็บได้จากระบบ staging นี้ไปคำนวณจุดคุ้มทุนระหว่างการจ่าย API ต่อ token กับการโฮสต์โมเดลเองด้วย {{vllm}} และ PagedAttention เพื่อเดินหน้าสู่ **Evaluated & Guarded AI Microservice v0.5.0** ที่ Day 156",
      ],
      analogy: "วันนี้เราติดมาตรวัดความเร็วและมิเตอร์น้ำมันบนรถที่วิ่งออกถนน staging ได้จริงแล้ว พรุ่งนี้ใน B37 เราจะเอาตัวเลขจากมิเตอร์มาคำนวณว่าวิ่งกี่กิโลเมตรต่อเดือนถึงจะคุ้มซื้อรถเองแทนเรียกแท็กซี่",
      code: {
        language: "bash",
        filename: "deploy_and_smoke.sh",
        caption: "ขั้นตอน Deploy candidate บน Cloud Run หรือ Fly.io แล้วตามด้วยสคริปต์ smoke gate",
        code: `# เส้นทาง A: Cloud Run — deploy candidate แบบยังไม่สลับ traffic หลัก
gcloud run deploy "$SERVICE" --project "$PROJECT" --region "$REGION" \\
  --image "$IMAGE" --service-account "$RUNTIME_SA" \\
  --no-allow-unauthenticated --port 8080 \\
  --update-secrets LANGFUSE_SECRET_KEY=staging-langfuse-sk:1 \\
  --startup-probe="httpGet.path=/readyz,httpGet.port=8080,periodSeconds=20,failureThreshold=3,timeoutSeconds=2" \\
  --liveness-probe="httpGet.path=/healthz,httpGet.port=8080,periodSeconds=10,failureThreshold=3,timeoutSeconds=2" \\
  --no-traffic --tag candidate

# ยิง smoke gate เข้า tagged candidate URL ก่อนโปรโมต traffic
TOKEN=$(gcloud auth print-identity-token)
uv run --with httpx --with pydantic python staging_smoke.py \\
  --base-url "$CANDIDATE_URL" --bearer-env TOKEN
unset TOKEN

# เมื่อ smoke ผ่าน (exit 0) จึงค่อยขยับ traffic
gcloud run services update-traffic "$SERVICE" --region "$REGION" \\
  --to-revisions "$PREVIOUS=95,$CANDIDATE=5"

# เส้นทาง B: Fly.io — deploy แบบ rolling แล้วตรวจ checks + smoke gate
fly deploy --app "$FLY_APP" --image "$IMAGE" --strategy rolling
fly checks list --app "$FLY_APP"
uv run --with httpx --with pydantic python staging_smoke.py \\
  --base-url "https://$FLY_APP.fly.dev"`,
      },
      whyTitle: "เก็บ Output ของ Smoke Report ไว้เป็น Release Artifact",
      whyParagraphs: [
        "บันทึก JSON ของ `SmokeReport` (`trace_id`, `delivery_attempts`, `latency_ms`, `passed`) คู่กับ `IMAGE` digest และชื่อ revision ใน pull request หรือ release log เพื่อให้ทีมพิสูจน์ย้อนหลังได้เสมอว่า revision นี้ผ่านทั้ง health และ observability จริงก่อนรับทราฟฟิก",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · Post-Deploy Smoke Test ของเว็บ vs AI Microservice",
      body: [
        "ฝั่งเว็บเวลา deploy เสร็จมักรัน Playwright หรือ synthetic check เปิดหน้าแรกเพื่อดูว่า HTTP 200 และ DOM เรนเดอร์ได้ ส่วนฝั่ง AI Microservice ต้องตรวจเพิ่มอีกสองชั้นคือ dependency readiness (`/readyz`) และ observability delivery (`traceparent` → `trace_id` ถึง Langfuse/OTel)",
        "การใช้ `httpx.ASGITransport` ใน `pytest` เทียบได้กับการใช้ `supertest` ยิง Express/Fastify app ในหน่วยความจำก่อนนำไปยิง staging URL จริงใน pipeline CD",
      ],
      table: [
        ["`supertest(app)` (Node.js)", "`httpx.AsyncClient(transport=ASGITransport(app=app))`"],
        ["Vercel Preview Check", "Cloud Run `--no-traffic --tag candidate` + `staging_smoke.py`"],
        ["Synthetic Ping 200", "`/healthz` + `/readyz` + `POST /v1/query` + `trace_id` lookup"],
      ],
    },
    student: {
      title: "First-Year Note · หมายเลขพัสดุ (trace_id) ที่ตามข้ามระบบได้",
      body: [
        "ลองนึกว่า `traceparent` คือใบจ่าหน้าพัสดุที่มีเลขติดตาม 32 หลัก (`trace_id`) ซึ่งเราพิมพ์ติดกล่องเองก่อนส่งเข้าแอป FastAPI",
        "การเช็กว่า API ตอบ 200 เหมือนดูว่าพนักงานรับกล่องแล้ว ส่วนการเอา `trace_id` ไปค้นที่ endpoint ตรวจ trace เหมือนเช็กในแอปขนส่งว่ากล่องหมายเลขเดียวกันเข้าระบบบันทึกประวัติจริง ไม่ได้ตกหล่นระหว่างทาง",
      ],
    },
  },

  workedExample: {
    intro: "ประกอบแอป FastAPI staging จำลอง (ที่มีทั้ง `/healthz`, `/readyz`, `POST /v1/query` และ trace sink `/traces/{trace_id}`) แล้วรันสคริปต์ `staging_smoke.py` ทดสอบครบทั้งกรณีผ่านและกรณี trace หล่น โดยไม่ต้องเปิด Docker หรือบัญชี cloud",
    steps: [
      {
        title: "1 · สร้าง FastAPI staging จำลองที่รองรับ W3C traceparent และหน่วงเวลาการส่ง trace",
        explain: "ใช้ `make_demo_staging_app` จำลองพฤติกรรมของ staging จริง: อ่าน `traceparent` จาก request header, สะท้อน `X-Trace-Id`, และจำลอง Langfuse worker ที่ต้องรอครบ `delivery_delay_polls` รอบจึงจะมองเห็น trace",
        code: {
          language: "python",
          filename: "demo_app_snippet.py",
          code: `from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from staging_smoke import parse_traceparent

# ตัวอย่าง handler หลักใน make_demo_staging_app:
# 1) GET /healthz -> 200 {"status": "ok"} (ไม่แตะ dependency)
# 2) GET /readyz  -> 200 {"ready": True} หรือ 503 {"ready": False}
# 3) POST /v1/query -> อ่าน header traceparent, สะท้อน X-Trace-Id และเก็บลง in-memory trace store
# 4) GET /traces/{trace_id} -> คืน 404 จนกว่าจะถูก poll ครบ delivery_delay_polls แล้วจึงคืน 200`,
        },
      },
      {
        title: "2 · รัน smoke gate ผ่าน httpx.ASGITransport ในกรณีปกติและกรณี trace หล่น",
        explain: "เทียบผลระหว่าง staging ปกติ (worker ใช้ 2 รอบกว่าจะ index เสร็จ) กับ staging ที่ลืมตั้ง Langfuse key จน trace ไม่ถูกส่ง (`drop_trace=True`)",
        code: {
          language: "python",
          filename: "run_smoke_demo.py",
          code: `import asyncio
import httpx
from staging_smoke import make_demo_staging_app, run_staging_smoke


async def main() -> None:
    for label, kwargs in [
        ("healthy-eventual", {"ready": True, "delivery_delay_polls": 2}),
        ("missing-trace", {"ready": True, "drop_trace": True}),
    ]:
        app = make_demo_staging_app(**kwargs)
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://staging.test") as client:
            rep = await run_staging_smoke(client, max_trace_polls=3, poll_interval_seconds=0.0)
            print(
                f"{label}: passed={rep.passed} ready={rep.ready_ok} "
                f"echo={rep.trace_echoed} delivered={rep.trace_delivered} "
                f"attempts={rep.delivery_attempts} failed={rep.failed_checks}"
            )


asyncio.run(main())`,
        },
        output: `healthy-eventual: passed=True ready=True echo=True delivered=True attempts=2 failed=[]
missing-trace: passed=False ready=True echo=True delivered=False attempts=3 failed=['trace_delivery']`,
      },
      {
        title: "3 · รันชุดทดสอบ pytest และคำสั่งยิง Staging จริง (Cloud Run / Fly.io)",
        explain: "ทดสอบทุกเงื่อนไขขอบบนเครื่องก่อน แล้วจึงนำ CLI ของไฟล์เดียวกันไปยิง candidate URL บน Cloud Run หรือแอปบน Fly.io",
        code: {
          language: "bash",
          filename: "terminal",
          code: `# 1) ทดสอบออฟไลน์บนเครื่อง 100%
uv run --with pytest --with fastapi --with httpx --with pydantic pytest -v test_staging_smoke.py
uv run --with fastapi --with httpx --with pydantic python run_smoke_demo.py

# 2) เมื่อ deploy staging จริงแล้ว ยิงตรวจ candidate URL (Cloud Run ตัวอย่าง)
# TOKEN=$(gcloud auth print-identity-token)
# uv run --with httpx --with pydantic python staging_smoke.py \\
#   --base-url "$CANDIDATE_URL" --bearer-env TOKEN
# unset TOKEN`,
        },
        output: `test_staging_smoke.py::test_build_and_parse_w3c_traceparent PASSED
test_staging_smoke.py::test_full_staging_smoke_passes_with_eventual_trace_delivery PASSED
test_staging_smoke.py::test_dropped_trace_fails_delivery_after_bounded_polls PASSED
...
13 passed in 0.45s`,
      },
    ],
    gotcha: "ถ้าใช้ Cloud Run ที่เปิด `--no-allow-unauthenticated` อย่านำ identity token ไปพิมพ์ลง terminal หรือแนบใน JSON report และเวลาชี้ไป Langfuse บน staging จริงให้แยก `trace_client` หรือ endpoint ที่ใช้ Basic Auth ของ Langfuse Public API ออกจาก Bearer token ของ Cloud Run",
  },

  practice: {
    intro: "ภารกิจทบทวน B36 (15 นาที): เขียน `staging_smoke.py` ที่สร้าง/ตรวจ W3C `traceparent`, จัดเตรียม FastAPI staging app จำลอง (`make_demo_staging_app`) และรันด่านตรวจรับ `run_staging_smoke` แบบ Fail-Closed ครบทั้ง `/healthz`, `/readyz`, `POST /v1/query` และ trace delivery",
    requirements: [
      "`build_traceparent(sampled=True)` สร้าง `(trace_id, header)` ตามรูปแบบ W3C `00-<32 hex>-<16 hex>-<01|00>` และ `parse_traceparent(header)` ปฏิเสธ version อื่น, ตัวพิมพ์ใหญ่, ความยาวผิด หรือค่า all-zero ด้วย `ValueError`",
      "`make_demo_staging_app(alive=True, ready=True, echo_wrong_trace=False, drop_trace=False, delivery_delay_polls=1)` สร้าง FastAPI app ที่มี `/healthz`, `/readyz`, `POST /v1/query` (อ่าน `traceparent` และตอบ `X-Trace-Id` + JSON `trace_id`) และ `GET /traces/{trace_id}` ที่คืน 200 เมื่อถูก poll ครบ `delivery_delay_polls` ครั้ง (หรือ 404 หาก `drop_trace=True`)",
      "`run_staging_smoke(client, query_text=..., max_trace_polls=3, poll_interval_seconds=0.05)` ตรวจตามลำดับ `/healthz` → `/readyz` → `POST /v1/query` (พร้อม `traceparent`) → ตรวจ `trace_echo` → poll `GET /traces/{trace_id}` ไม่เกิน `max_trace_polls` ครั้ง และคืน `SmokeReport` (Pydantic `BaseModel`)",
      "Fail-Closed: `passed` เป็น `True` เฉพาะเมื่อ `failed_checks == []`, หยุดก่อนยิง query เมื่อ `/healthz` หรือ `/readyz` ไม่ผ่าน และเมื่อเกิด `httpx.HTTPError` ต้องจับ cleanly โดยไม่รั่ว `Authorization` header ลงใน `SmokeReport`",
    ],
    starter: {
      filename: "staging_smoke.py",
      language: "python",
      code: `import asyncio
import re
import secrets
import time

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

TRACE_ID_RE = re.compile(r"^[0-9a-f]{32}$")
PARENT_ID_RE = re.compile(r"^[0-9a-f]{16}$")
FLAGS_RE = re.compile(r"^[0-9a-f]{2}$")


class SmokeReport(BaseModel):
    trace_id: str
    health_ok: bool = False
    ready_ok: bool = False
    query_ok: bool = False
    trace_echoed: bool = False
    trace_delivered: bool = False
    delivery_attempts: int = 0
    latency_ms: float = 0.0
    failed_checks: list[str] = Field(default_factory=list)
    passed: bool = False


def build_traceparent(sampled: bool = True) -> tuple[str, str]:
    # TODO: สร้าง trace_id (32 hex) และ parent_id (16 hex) ที่ไม่เป็นศูนย์ล้วน
    raise NotImplementedError


def parse_traceparent(header: str) -> tuple[str, str, str]:
    # TODO: ตรวจ version 00, lowercase hex, ความยาว และปฏิเสธ all-zero
    raise NotImplementedError


def make_demo_staging_app(
    *,
    alive: bool = True,
    ready: bool = True,
    echo_wrong_trace: bool = False,
    drop_trace: bool = False,
    delivery_delay_polls: int = 1,
) -> FastAPI:
    # TODO: สร้าง FastAPI app ที่มี /healthz, /readyz, POST /v1/query และ GET /traces/{trace_id}
    raise NotImplementedError


async def run_staging_smoke(
    client: httpx.AsyncClient,
    *,
    query_text: str = "ยื่นใบเสร็จเบิกค่าเดินทางภายในกี่วัน",
    max_trace_polls: int = 3,
    poll_interval_seconds: float = 0.05,
) -> SmokeReport:
    # TODO: ตรวจ /healthz -> /readyz -> POST /v1/query -> trace_echo -> bounded trace delivery poll
    raise NotImplementedError`,
    },
    verification: {
      filename: "test_staging_smoke.py",
      language: "python",
      code: tests,
    },
    selfCheck: [
      "`parse_traceparent` ปฏิเสธทั้ง `00-000...000-...`, ตัวพิมพ์ใหญ่ และ version `01` ด้วย `ValueError` ใช่ไหม?",
      "เมื่อ `ready=False` สคริปต์หยุดก่อนส่ง `POST /v1/query` และใส่ `'readyz'` ใน `failed_checks` ใช่ไหม?",
      "เมื่อ `delivery_delay_polls=2` และ `max_trace_polls=4` สคริปต์ poll 2 รอบแล้วผ่าน (`passed=True`, `delivery_attempts=2`) ใช่ไหม?",
      "เมื่อเกิด `httpx.ConnectError` พร้อม `Authorization: Bearer ...` ไม่มี token หลุดใน `report.model_dump_json()` ใช่ไหม?",
    ],
    acceptance: "pytest ผ่านครบทุกกรณี (13 tests) ทั้ง W3C traceparent validation, health/readiness gate, eventual trace delivery, trace mismatch, dropped trace และการกัน token รั่วเมื่อเครือข่ายล้ม",
    hints: [
      {
        body: "ใน `make_demo_staging_app` เก็บ `trace_polls: dict[str, int]` เพื่อบันทึกจำนวนครั้งที่ `GET /traces/{trace_id}` ถูกเรียก และคืน 200 เมื่อจำนวนครั้ง >= `delivery_delay_polls`",
      },
      {
        body: "ใน `run_staging_smoke` ห่อการเรียก HTTP แต่ละด่านด้วย `try ... except httpx.HTTPError:` เพื่อแปลง error เครือข่ายเป็น fail-closed check name โดยไม่นำ exception detail ที่มี header หรือ secret ใส่ลง `SmokeReport`",
      },
      {
        body: "คัดลอกส่วนแรกเป็น `staging_smoke.py` และส่วนหลังบรรทัดคั่นเป็น `test_staging_smoke.py` แล้วรันด้วย `uv run --with pytest --with fastapi --with httpx --with pydantic pytest -v`",
        code: {
          filename: "staging_smoke.py",
          language: "python",
          code: `import argparse
import asyncio
import os
import re
import secrets
import time

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

TRACE_ID_RE = re.compile(r"^[0-9a-f]{32}$")
PARENT_ID_RE = re.compile(r"^[0-9a-f]{16}$")
FLAGS_RE = re.compile(r"^[0-9a-f]{2}$")


class SmokeReport(BaseModel):
    trace_id: str
    health_ok: bool = False
    ready_ok: bool = False
    query_ok: bool = False
    trace_echoed: bool = False
    trace_delivered: bool = False
    delivery_attempts: int = 0
    latency_ms: float = 0.0
    failed_checks: list[str] = Field(default_factory=list)
    passed: bool = False


def build_traceparent(sampled: bool = True) -> tuple[str, str]:
    trace_id = secrets.token_hex(16)
    while trace_id == "0" * 32:
        trace_id = secrets.token_hex(16)
    parent_id = secrets.token_hex(8)
    while parent_id == "0" * 16:
        parent_id = secrets.token_hex(8)
    flags = "01" if sampled else "00"
    return trace_id, f"00-{trace_id}-{parent_id}-{flags}"


def parse_traceparent(header: str) -> tuple[str, str, str]:
    parts = header.strip().split("-")
    if len(parts) != 4 or parts[0] != "00":
        raise ValueError("invalid W3C traceparent version or format")
    _, trace_id, parent_id, flags = parts
    if not TRACE_ID_RE.fullmatch(trace_id) or trace_id == "0" * 32:
        raise ValueError("invalid trace_id")
    if not PARENT_ID_RE.fullmatch(parent_id) or parent_id == "0" * 16:
        raise ValueError("invalid parent_id")
    if not FLAGS_RE.fullmatch(flags):
        raise ValueError("invalid trace_flags")
    return trace_id, parent_id, flags


def make_demo_staging_app(
    *,
    alive: bool = True,
    ready: bool = True,
    echo_wrong_trace: bool = False,
    drop_trace: bool = False,
    delivery_delay_polls: int = 1,
) -> FastAPI:
    app = FastAPI(title="Expense QA Staging Demo")
    stored_traces: dict[str, dict[str, str]] = {}
    poll_counts: dict[str, int] = {}

    @app.get("/healthz")
    async def healthz():
        if not alive:
            return JSONResponse(status_code=500, content={"status": "error"})
        return {"status": "ok"}

    @app.get("/readyz")
    async def readyz():
        return JSONResponse(
            status_code=200 if ready else 503,
            content={"ready": ready},
        )

    @app.post("/v1/query")
    async def query(request: Request, response: Response):
        body = await request.json()
        incoming = request.headers.get("traceparent", "")
        trace_id, _, _ = parse_traceparent(incoming)
        echoed_id = ("f" * 32) if echo_wrong_trace else trace_id
        response.headers["X-Trace-Id"] = echoed_id
        if not drop_trace:
            stored_traces[trace_id] = {
                "trace_id": trace_id,
                "question": str(body.get("question", "")),
                "citation": "expense#03",
            }
        return {
            "answer": "ยื่นใบเสร็จเบิกค่าเดินทางภายใน 30 วัน [expense#03]",
            "trace_id": echoed_id,
        }

    @app.get("/traces/{trace_id}")
    async def get_trace(trace_id: str):
        if trace_id not in stored_traces:
            return JSONResponse(status_code=404, content={"found": False})
        poll_counts[trace_id] = poll_counts.get(trace_id, 0) + 1
        if poll_counts[trace_id] < max(1, delivery_delay_polls):
            return JSONResponse(status_code=404, content={"found": False})
        return {"found": True, "trace": stored_traces[trace_id]}

    return app


async def run_staging_smoke(
    client: httpx.AsyncClient,
    *,
    query_text: str = "ยื่นใบเสร็จเบิกค่าเดินทางภายในกี่วัน",
    max_trace_polls: int = 3,
    poll_interval_seconds: float = 0.05,
) -> SmokeReport:
    started = time.perf_counter()
    trace_id, traceparent = build_traceparent(sampled=True)
    report = SmokeReport(trace_id=trace_id)

    try:
        health_res = await client.get("/healthz")
        report.health_ok = (
            health_res.status_code == 200
            and health_res.json().get("status") == "ok"
        )
    except (httpx.HTTPError, ValueError):
        report.health_ok = False
    if not report.health_ok:
        report.failed_checks.append("healthz")

    try:
        ready_res = await client.get("/readyz")
        report.ready_ok = (
            ready_res.status_code == 200
            and ready_res.json().get("ready") is True
        )
    except (httpx.HTTPError, ValueError):
        report.ready_ok = False
    if not report.ready_ok:
        report.failed_checks.append("readyz")

    if not report.health_ok or not report.ready_ok:
        report.latency_ms = round((time.perf_counter() - started) * 1000, 2)
        report.passed = False
        return report

    try:
        query_res = await client.post(
            "/v1/query",
            json={"question": query_text},
            headers={"traceparent": traceparent},
        )
        payload = query_res.json() if query_res.status_code == 200 else {}
        report.query_ok = (
            query_res.status_code == 200
            and isinstance(payload.get("answer"), str)
            and len(payload["answer"].strip()) > 0
        )
        header_trace = query_res.headers.get("x-trace-id")
        body_trace = payload.get("trace_id")
        report.trace_echoed = header_trace == trace_id and body_trace == trace_id
    except (httpx.HTTPError, ValueError):
        report.query_ok = False
        report.trace_echoed = False

    if not report.query_ok:
        report.failed_checks.append("query")
    if not report.trace_echoed:
        report.failed_checks.append("trace_echo")

    if report.query_ok and report.trace_echoed:
        for attempt in range(1, max(1, max_trace_polls) + 1):
            report.delivery_attempts = attempt
            try:
                trace_res = await client.get(f"/traces/{trace_id}")
                if trace_res.status_code == 200 and trace_res.json().get("found") is True:
                    report.trace_delivered = True
                    break
            except (httpx.HTTPError, ValueError):
                pass
            if attempt < max_trace_polls and poll_interval_seconds > 0:
                await asyncio.sleep(poll_interval_seconds)

        if not report.trace_delivered:
            report.failed_checks.append("trace_delivery")

    report.latency_ms = round((time.perf_counter() - started) * 1000, 2)
    report.passed = len(report.failed_checks) == 0
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Staging smoke gate for health + trace delivery")
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--bearer-env", default="")
    parser.add_argument("--max-polls", type=int, default=5)
    parser.add_argument("--poll-interval", type=float, default=1.0)
    args = parser.parse_args(argv)

    headers: dict[str, str] = {}
    if args.bearer_env:
        token = os.getenv(args.bearer_env, "")
        if token:
            headers["Authorization"] = f"Bearer {token}"

    async def _run() -> SmokeReport:
        async with httpx.AsyncClient(
            base_url=args.base_url,
            headers=headers,
            timeout=10.0,
        ) as client:
            return await run_staging_smoke(
                client,
                max_trace_polls=args.max_polls,
                poll_interval_seconds=args.poll_interval,
            )

    report = asyncio.run(_run())
    print(report.model_dump_json(indent=2))
    return 0 if report.passed else 1


if __name__ == "__main__":
    raise SystemExit(main())

# แยกเป็น test_staging_smoke.py
${tests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run --with pytest --with fastapi --with httpx --with pydantic pytest -v test_staging_smoke.py
uv run --with fastapi --with httpx --with pydantic python run_smoke_demo.py`,
    },
  },

  mistakes: [
    {
      title: "ตรวจแค่ `/healthz` 200 แล้วอนุมัติสลับ traffic ทันที",
      symptom: "container เปิดติดแต่ฐานข้อมูลต่อไม่ติดหรือ Langfuse key ผิด ทำให้ผู้ใช้เจอ 500 หรือไม่มี trace เลยหลังสลับ traffic",
      fix: "รัน smoke gate ครบทั้ง `/healthz`, `/readyz`, `POST /v1/query` และการยืนยัน `trace_id` ที่ปลายทางก่อนขยับ traffic",
    },
    {
      title: "เช็ก trace delivery แค่ครั้งเดียวทันทีหลัง `POST /v1/query` จบ",
      symptom: "สคริปต์รายงานว่า trace หายแบบสุ่ม (flaky) ทั้งที่ Langfuse worker กำลังประมวลผลคิวอยู่",
      fix: "ใช้ bounded polling (`max_trace_polls` + `poll_interval_seconds`) เพื่อรองรับ eventual consistency ของ trace ingestion",
    },
    {
      title: "พิมพ์ `request.headers` หรือ exception ดิบลง CI log เมื่อ smoke ล้ม",
      symptom: "Bearer identity token ของ Cloud Run หรือ key ของ Langfuse รั่วเข้าไปใน log ของ GitHub Actions",
      fix: "รายงานเฉพาะชื่อด่านที่ล้ม (`failed_checks`), `trace_id` และ latency แล้วสั่ง `unset TOKEN` หลังใช้งานใน shell",
    },
    {
      title: "ส่ง `traceparent` ที่ไม่ตรงสเปก W3C (เช่น มีตัวพิมพ์ใหญ่หรือ `trace_id` เป็นศูนย์ล้วน)",
      symptom: "Proxy หรือ OpenTelemetry SDK เมิน header นั้นแล้วสุ่ม `trace_id` ใหม่ ทำให้ smoke test หา trace ของตัวเองไม่เจอ",
      fix: "ใช้ `secrets.token_hex` ตัวพิมพ์เล็กและ validate ด้วย `parse_traceparent` ตามสเปก W3C Trace Context (`00-<32 hex>-<16 hex>-01`)",
    },
  ],

  quiz: {
    intro: "ทบทวนรวมทั้งบล็อก B36 (D141–D144) 4 ข้อ เลือกคำตอบที่ตรงกับหลักฐานทางวิศวกรรมที่สุดแล้วกดตรวจเพื่อดูเหตุผล",
    questions: [
      mc(
        "d144-q1",
        "(ทวน D141) เมื่อแก้โค้ดใน `ai_service.py` เพียง 1 บรรทัดโดยไม่แก้ `pyproject.toml` หรือ `uv.lock` ทำไม multi-stage Dockerfile ถึง build รอบใหม่ได้เร็วมาก?",
        [
          ["เพราะ `COPY pyproject.toml uv.lock ./` และ `uv sync --no-install-project` อยู่ก่อน `COPY . .` จึงได้ layer cache hit", "อินพุตของชั้นติดตั้ง dependencies ไม่เปลี่ยน BuildKit จึงข้ามขั้นนั้นได้ทันที"],
          ["เพราะเปลี่ยนไปใช้ `USER root` ทำให้ไม่ต้องเช็กสิทธิ์ไฟล์", "ผู้ใช้ไม่ได้ทำให้ layer cache ทำงาน และขัดกับหลัก non-root"],
          ["เพราะ `.dockerignore` ลบ `ai_service.py` ออกจาก build context", "ถ้าตัดไฟล์แอปออก image จะไม่มีโค้ดใหม่"],
          ["เพราะ `EXPOSE 8080` บันทึกไฟล์ wheel เก็บไว้", "EXPOSE เป็นเพียง metadata ของพอร์ต ไม่ใช่ cache"],
        ],
        "A",
        "การจัดลำดับ layer ให้ manifest + lockfile มาก่อน source code ทำให้การแก้โค้ดแอปไม่ทำลาย cache ของการติดตั้งแพ็กเกจ",
        "วาง `COPY pyproject.toml uv.lock` ไว้ตรงไหนใน Dockerfile?",
        "ก่อน `COPY . .` และก่อน `RUN uv sync --frozen --no-dev --no-install-project`",
      ),
      mc(
        "d144-q2",
        "(ทวน D142) ใน `docker compose` local stack ทำไม API container ถึงต่อ Postgres ด้วย `vector-db:5432` แต่ต่อด้วย `127.0.0.1:5432` ไม่ได้?",
        [
          ["เพราะ Postgres ไม่อนุญาตให้เชื่อมต่อผ่าน TCP", "Postgres รับ TCP ปกติแต่ต้องชี้ไปยัง host ที่ถูกต้อง"],
          ["เพราะ `127.0.0.1` ภายใน API container ชี้กลับไปยังตัว API เอง ส่วน `vector-db` ถูก resolve ด้วย Compose DNS ไปยัง container ของฐานข้อมูล", "แต่ละ container มี loopback ของตัวเอง ต้องใช้ชื่อ service ใน network เดียวกัน"],
          ["เพราะ named volume ปิดการใช้งาน loopback", "volume เกี่ยวกับการเก็บไฟล์ข้อมูล ไม่ใช่ DNS"],
          ["เพราะ `condition: service_healthy` บังคับเปลี่ยน IP เป็นชื่อโดเมน", "service_healthy คุมลำดับการเริ่ม ไม่ได้เป็นตัวสร้าง loopback"],
        ],
        "B",
        "ใน Compose network แต่ละ container มี network namespace ของตัวเอง ชื่อ service เช่น `vector-db` หรือ `langfuse-web` คือ DNS ที่ใช้คุยข้าม container",
        "จากใน API container ต้องเรียก Langfuse SDK ไปที่ host ใด?",
        "`http://langfuse-web:3000` (ไม่ใช่ `127.0.0.1:3000`)",
      ),
      mc(
        "d144-q3",
        "(ทวน D143) หลัง deploy candidate revision บน Cloud Run ด้วย `--no-traffic --tag candidate` พบว่า `/healthz` ตอบ 200 แต่ `/readyz` ตอบ 503 ข้อสรุปและการกระทำใดถูกต้อง?",
        [
          ["สลับ traffic 100% ไป candidate ได้เลยเพราะ `/healthz` ผ่านแล้ว", "โปรเซสรันอยู่แต่ dependency ยังไม่พร้อม การสลับ traffic จะทำให้ผู้ใช้เจอ error"],
          ["ลบ baseline revision ทิ้งเพื่อบังคับให้แพลตฟอร์มรีสตาร์ต", "จะทำให้เสียเป้าหมาย rollback โดยไม่แก้ต้นเหตุ"],
          ["คง traffic หลักไว้ที่ baseline ตรวจ runtime secrets/การต่อ dependency ของ candidate และยังไม่ย้าย traffic จนกว่า `/readyz` จะตอบ 200", "นี่คือประโยชน์ของ tagged revision + readiness separation"],
          ["แก้ `/readyz` ให้คืน 200 ตลอดเวลาเพื่อผ่าน smoke", "เป็นการซ่อนปัญหาจริงและทำให้ระบบ fail-open"],
        ],
        "C",
        "`/healthz` บอกว่าโปรเซสไม่ค้าง ส่วน `/readyz` 503 เตือนว่า dependency หรือ config ของ candidate ยังไม่พร้อม จึงต้องคง baseline ไว้และตรวจต้นเหตุก่อน",
        "ถ้า candidate ตอบ `/readyz` 503 ต้องทำอย่างไรกับ traffic หลัก?",
        "คง traffic ไว้ที่ baseline แล้วตรวจ runtime config/dependency ของ candidate ก่อน",
      ),
      mc(
        "d144-q4",
        "(D144) ข้อใดคือเหตุผลหลักที่ `staging_smoke.py` สร้าง W3C `traceparent` เองและทำ bounded polling ไปยัง trace endpoint หลัง `POST /v1/query`?",
        [
          ["เพื่อเพิ่มขนาด HTTP header ให้ใกล้เคียงโหลดจริง", "ขนาด header ไม่ใช่เป้าหมายของการตรวจ trace"],
          ["เพื่อข้ามการตรวจ `/healthz` และ `/readyz`", "smoke gate ยังต้องตรวจทั้งสุขภาพและ trace"],
          ["เพื่อแทนที่การตั้งค่า Secret Manager บน Cloud Run", "traceparent ไม่เกี่ยวข้องกับการเก็บ secret"],
          ["เพื่อยืนยันทั้งว่า API ส่งต่อ `trace_id` เดียวกันจริง และ trace นั้นถูก worker ประมวลผลจนค้นเจอที่ระบบปลายทางภายในเวลาที่กำหนด", "พิสูจน์ครบทั้ง propagation (echo) และ asynchronous delivery (lookup)"],
        ],
        "D",
        "HTTP 200 จาก API ยืนยันแค่ฝั่งแอปตอบได้ การแนบ `traceparent` ที่กำหนดเองแล้ว poll หา `trace_id` เดียวกันที่ปลายทางคือหลักฐานครบวงจรว่า observability ใช้งานได้จริง",
        "ทำไมต้องใช้ bounded polling แทนการเช็ก trace ครั้งเดียวทันที?",
        "เพราะ worker ฝั่ง observability ประมวลผลแบบ async การ poll แบบจำกัดรอบช่วยแยกความหน่วงปกติออกจาก trace ที่หายจริง",
      ),
    ],
  },

  takeaways: [
    "บล็อก B36 เชื่อมครบ 4 ชั้น: reproducible non-root image (D141) → local Compose parity (D142) → runtime secrets & health/readiness rollout (D143) → automated staging smoke gate (D144)",
    "W3C `traceparent` (`00-<32-hex>-<16-hex>-01`) ผูกคำขอ smoke เข้ากับ response ของ FastAPI และ trace ใน Langfuse/OTel ด้วย `trace_id` เดียวกัน",
    "ด่าน smoke ที่ดีต้อง Fail-Closed, รองรับ bounded polling สำหรับ eventual consistency, ไม่พิมพ์ secret ลง log และทดสอบออฟไลน์ได้ด้วย `httpx.ASGITransport`",
    "พรุ่งนี้ใน Day 145 (Block B37) เราจะนำตัวเลข latency และ token usage จาก staging ไปวิเคราะห์จุดคุ้มทุนของ self-hosted `vLLM` เทียบกับ LLM API",
  ],

  reviewCards: [
    rc("d144-b36-flow", "ลำดับ 4 ด่านใน `staging_smoke.py` คืออะไร?", "`/healthz` → `/readyz` → `POST /v1/query` (พร้อม `traceparent` และตรวจ echo) → bounded poll หา `trace_id` ที่ trace endpoint"),
    rc("d144-w3c", "องค์ประกอบ 4 ส่วนของ W3C `traceparent` คืออะไร?", "`version` (`00`), `trace_id` (32 lowercase hex ไม่เป็นศูนย์ล้วน), `parent_id` (16 lowercase hex ไม่เป็นศูนย์ล้วน), `trace_flags` (`01` สำหรับ sampled)"),
    rc("d144-asgi", "จะทดสอบสคริปต์ `httpx` smoke test กับ FastAPI โดยไม่ต้องเปิด Docker หรือพอร์ตได้อย่างไร?", "ส่ง `httpx.ASGITransport(app=app)` เข้า `httpx.AsyncClient` แล้วเรียกฟังก์ชัน smoke ตรง ๆ ใน `pytest`"),
    rc("d144-poll", "ทำไมการตรวจ trace delivery บน staging ต้องใช้ bounded polling?", "เพราะ trace exporter และ Langfuse worker ทำงานแบบ async การ poll แบบจำกัดครั้งช่วยรับมือความหน่วงสั้น ๆ โดยไม่ค้างตลอดไป"),
    rc("d144-b37", "ข้อมูลจาก B36 Staging Smoke เชื่อมต่อไปยัง Day 145 (B37) อย่างไร?", "ให้ค่า latency, TTFT และจำนวน input/output token จริงเพื่อนำไปคำนวณจุดคุ้มทุนระหว่าง API ต่อ token กับ GPU-hour ของ vLLM"),
  ],

  sources: [
    { label: "W3C · Trace Context Specification (traceparent)", href: "https://www.w3.org/TR/trace-context/" },
    { label: "Cloud Run · Rollouts, revisions, and traffic migration", href: "https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration" },
    { label: "Fly.io · App configuration & HTTP health checks", href: "https://fly.io/docs/reference/configuration/" },
    { label: "Docker · Healthcheck & Compose startup order", href: "https://docs.docker.com/compose/how-tos/startup-order/" },
    { label: "HTTPX · Calling into Python ASGI apps (ASGITransport)", href: "https://www.python-httpx.org/async/#calling-into-python-web-apps" },
  ],

  glossary: ["dockerfile", "uv", "lockfile", "env-config", "fastapi", "httpx", "otel", "langfuse", "pydantic", "pytest", "fail-fast", "vllm", "ttft"],
});
