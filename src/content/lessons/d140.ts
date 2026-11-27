import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const serviceCode = `import asyncio
import json
from collections.abc import AsyncGenerator
from contextlib import aclosing, asynccontextmanager
from dataclasses import dataclass
from typing import Annotated, Any, Literal

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field


FAQ_QUESTION = "ขอใบกำกับภาษีอย่างไร"
MISS_QUESTION = "ขอคืนเงินอย่างไร"
CACHED_FAQ = {FAQ_QUESTION: "แจ้งเลขคำสั่งซื้อผ่านศูนย์ช่วยเหลือ [billing#2]"}


class StreamQuery(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    question: str = Field(min_length=3, max_length=400)
    scenario: Literal["normal", "slow-start", "slow-middle"] = "normal"


class ContendedThaiModel:
    """โมเดลจำลองที่ตอบช้าลงเมื่อจำนวน stream พร้อมกันเกิน safe_concurrency"""

    def __init__(
        self,
        safe_concurrency: int = 4,
        base_first_delay: float = 0.02,
        next_token_delay: float = 0.02,
        overload_step: float = 0.10,
    ) -> None:
        self.safe_concurrency = safe_concurrency
        self.base_first_delay = base_first_delay
        self.next_token_delay = next_token_delay
        self.overload_step = overload_step
        self.open_streams = 0
        self.peak_open_streams = 0

    async def tokens(self, scenario: str) -> AsyncGenerator[str, None]:
        self.open_streams += 1
        self.peak_open_streams = max(self.peak_open_streams, self.open_streams)
        load = self.open_streams
        try:
            excess = max(0, load - self.safe_concurrency)
            first_wait = 1.0 if scenario == "slow-start" else self.base_first_delay + excess * self.overload_step
            await asyncio.sleep(first_wait)
            yield "แจ้งเลขคำสั่งซื้อ"
            await asyncio.sleep(1.0 if scenario == "slow-middle" else self.next_token_delay)
            yield "ผ่านศูนย์ช่วยเหลือ [billing#2]"
        finally:
            self.open_streams -= 1


def sse(event: str, payload: dict[str, Any]) -> str:
    return f"event: {event}\\ndata: {json.dumps(payload, ensure_ascii=False)}\\n\\n"


class ManagedStream(StreamingResponse):
    async def stream_response(self, send: Any) -> None:
        async with aclosing(self.body_iterator):
            await super().stream_response(send)`;

const streamEngineCode = `async def answer_events(
    query: StreamQuery,
    model: ContendedThaiModel,
    semaphore: asyncio.Semaphore | None = None,
    first_timeout: float = 0.30,
    idle_timeout: float = 0.15,
    total_timeout: float = 0.80,
) -> AsyncGenerator[str, None]:
    loop = asyncio.get_running_loop()
    started_at = loop.time()
    first_deadline = started_at + first_timeout
    total_deadline = started_at + total_timeout
    sent_token, failure, acquired = False, "", False

    yield sse("meta", {"mode": "stream"})

    if semaphore is not None:
        now = loop.time()
        total_rem, first_rem = total_deadline - now, first_deadline - now
        if total_rem <= 0:
            failure = "deadline_exceeded"
        elif first_rem <= 0:
            failure = "queue_timeout"
        else:
            try:
                async with asyncio.timeout(min(first_rem, total_rem)):
                    await semaphore.acquire()
                acquired = True
            except TimeoutError:
                failure = "deadline_exceeded" if total_rem <= first_rem else "queue_timeout"

    if not failure:
        try:
            async with aclosing(model.tokens(query.scenario)) as tokens:
                while True:
                    now = loop.time()
                    total_rem = total_deadline - now
                    if total_rem <= 0:
                        failure = "deadline_exceeded"
                        break
                    step_budget = idle_timeout if sent_token else max(0.0, first_deadline - now)
                    if step_budget <= 0:
                        failure = "upstream_timeout"
                        break
                    try:
                        async with asyncio.timeout(min(step_budget, total_rem)):
                            token = await anext(tokens)
                    except StopAsyncIteration:
                        if not sent_token:
                            failure = "empty_answer"
                        break
                    except TimeoutError:
                        failure = "deadline_exceeded" if total_rem <= step_budget else "upstream_timeout"
                        break
                    if token:
                        if not sent_token:
                            sent_token = True
                            ttft_ms = round((loop.time() - started_at) * 1000, 1)
                            yield sse("token", {"text": token, "ttft_ms": ttft_ms})
                        else:
                            yield sse("token", {"text": token})
        finally:
            if acquired and semaphore is not None:
                semaphore.release()

    if not failure:
        yield sse("done", {"source": "primary"})
        return

    cached = CACHED_FAQ.get(query.question)
    if not sent_token and cached is not None:
        ttft_ms = round((loop.time() - started_at) * 1000, 1)
        yield sse("degraded", {"reason": failure})
        yield sse("token", {"text": cached, "ttft_ms": ttft_ms})
        yield sse("done", {"source": "cache"})
    else:
        yield sse("stream-error", {"code": failure})


def create_app(
    concurrency_limit: int | None = None,
    first_timeout: float = 0.30,
    idle_timeout: float = 0.15,
    total_timeout: float = 0.80,
    safe_concurrency: int = 4,
    overload_step: float = 0.10,
) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.model = ContendedThaiModel(safe_concurrency=safe_concurrency, overload_step=overload_step)
        app.state.semaphore = asyncio.Semaphore(concurrency_limit) if concurrency_limit is not None else None
        app.state.ready = True
        try:
            yield
        finally:
            app.state.ready = False

    app = FastAPI(title="Evaluated & Guarded AI Microservice", lifespan=lifespan)

    def get_model(request: Request) -> ContendedThaiModel:
        return request.app.state.model

    def get_semaphore(request: Request) -> asyncio.Semaphore | None:
        return request.app.state.semaphore

    @app.get("/healthz")
    async def healthz() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/readyz")
    async def readyz(request: Request) -> dict[str, bool]:
        if not getattr(request.app.state, "ready", False):
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Service not ready")
        return {"ready": True}

    @app.post("/v1/query/stream", response_class=StreamingResponse)
    async def query_stream(
        body: StreamQuery,
        model: Annotated[ContendedThaiModel, Depends(get_model)],
        semaphore: Annotated[asyncio.Semaphore | None, Depends(get_semaphore)],
    ) -> StreamingResponse:
        return ManagedStream(
            answer_events(body, model, semaphore=semaphore, first_timeout=first_timeout, idle_timeout=idle_timeout, total_timeout=total_timeout),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
        )

    return app`;

const harnessCode = `def percentile(values: list[float], p: int) -> float:
    """Nearest-rank percentile: rank = ceil((p / 100) * n), 1-indexed."""
    if not values or not 1 <= p <= 100:
        raise ValueError("expected non-empty values and p in 1..100")
    ordered = sorted(values)
    rank = (p * len(ordered) + 99) // 100
    return ordered[rank - 1]


def parse_sse_frames(body: str) -> list[tuple[str, dict[str, Any]]]:
    if not body.endswith("\\n\\n"):
        raise ValueError("incomplete SSE stream")
    events: list[tuple[str, dict[str, Any]]] = []
    for raw in body[:-2].split("\\n\\n"):
        event_line, data_line = raw.split("\\n")
        events.append((event_line.removeprefix("event: "), json.loads(data_line.removeprefix("data: "))))
    return events


@dataclass(frozen=True)
class RequestMetric:
    status_code: int
    outcome: Literal["primary", "cache", "error"]
    ttft_ms: float | None
    total_ms: float
    error_code: str | None = None


@dataclass(frozen=True)
class LoadSummary:
    label: str
    concurrency_limit: int | None
    users: int
    primary_count: int
    degraded_count: int
    error_count: int
    peak_open_streams: int
    ttft_p50_ms: float | None
    ttft_p95_ms: float | None
    total_p50_ms: float
    total_p95_ms: float


async def send_one(
    client: httpx.AsyncClient,
    question: str,
    scenario: Literal["normal", "slow-start", "slow-middle"] = "normal",
) -> RequestMetric:
    loop = asyncio.get_running_loop()
    start = loop.time()
    async with client.stream("POST", "/v1/query/stream", json={"question": question, "scenario": scenario}) as response:
        if response.status_code != 200:
            await response.aread()
            return RequestMetric(response.status_code, "error", None, round((loop.time() - start) * 1000, 1), f"http_{response.status_code}")
        body = (await response.aread()).decode("utf-8")
        total_ms = round((loop.time() - start) * 1000, 1)

    events = parse_sse_frames(body)
    ttft_ms = next((float(d["ttft_ms"]) for n, d in events if n == "token" and "ttft_ms" in d), None)
    last_name, last_data = events[-1]
    if last_name == "done":
        outcome: Literal["primary", "cache", "error"] = "cache" if last_data.get("source") == "cache" else "primary"
        return RequestMetric(200, outcome, ttft_ms, total_ms)
    return RequestMetric(200, "error", ttft_ms, total_ms, error_code=str(last_data.get("code", "unknown")))


async def run_load_test(
    concurrency_limit: int | None,
    users: int = 12,
    first_timeout: float = 0.30,
    total_timeout: float = 0.80,
) -> tuple[LoadSummary, list[RequestMetric], ContendedThaiModel]:
    app = create_app(concurrency_limit=concurrency_limit, first_timeout=first_timeout, total_timeout=total_timeout)
    questions = [FAQ_QUESTION if idx % 2 == 0 else MISS_QUESTION for idx in range(users)]
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            metrics = list(await asyncio.gather(*(send_one(client, q) for q in questions)))
        model: ContendedThaiModel = app.state.model

    ttft_values = [m.ttft_ms for m in metrics if m.ttft_ms is not None]
    total_values = [m.total_ms for m in metrics]
    label = "unlimited" if concurrency_limit is None else f"semaphore={concurrency_limit}"
    summary = LoadSummary(
        label=label, concurrency_limit=concurrency_limit, users=users,
        primary_count=sum(1 for m in metrics if m.outcome == "primary"),
        degraded_count=sum(1 for m in metrics if m.outcome == "cache"),
        error_count=sum(1 for m in metrics if m.outcome == "error"),
        peak_open_streams=model.peak_open_streams,
        ttft_p50_ms=percentile(ttft_values, 50) if ttft_values else None,
        ttft_p95_ms=percentile(ttft_values, 95) if ttft_values else None,
        total_p50_ms=percentile(total_values, 50),
        total_p95_ms=percentile(total_values, 95),
    )
    return summary, metrics, model


async def main() -> None:
    for limit in (None, 4, 1):
        s, _, model = await run_load_test(concurrency_limit=limit, users=12)
        print(
            f"{s.label:12s} | peak={s.peak_open_streams:2d} | primary={s.primary_count:2d} "
            f"cache={s.degraded_count:2d} err={s.error_count:2d} | "
            f"TTFT P50={s.ttft_p50_ms}ms P95={s.ttft_p95_ms}ms | Total P95={s.total_p95_ms}ms | open={model.open_streams}"
        )


if __name__ == "__main__":
    asyncio.run(main())`;

const harnessStarter = `def percentile(values: list[float], p: int) -> float:
    # TODO 1: ตรวจความถูกต้องของ values และ p (1..100) แล้วคำนวณ nearest-rank
    raise NotImplementedError("compute nearest-rank percentile")


def parse_sse_frames(body: str) -> list[tuple[str, dict[str, Any]]]:
    # TODO 2: แยกเฟรม SSE ด้วยบรรทัดว่างและ parse JSON ในฟิลด์ data:
    raise NotImplementedError("parse SSE frames")


@dataclass(frozen=True)
class RequestMetric:
    status_code: int
    outcome: Literal["primary", "cache", "error"]
    ttft_ms: float | None
    total_ms: float
    error_code: str | None = None


@dataclass(frozen=True)
class LoadSummary:
    label: str
    concurrency_limit: int | None
    users: int
    primary_count: int
    degraded_count: int
    error_count: int
    peak_open_streams: int
    ttft_p50_ms: float | None
    ttft_p95_ms: float | None
    total_p50_ms: float
    total_p95_ms: float


async def send_one(
    client: httpx.AsyncClient,
    question: str,
    scenario: Literal["normal", "slow-start", "slow-middle"] = "normal",
) -> RequestMetric:
    # TODO 3: ยิง POST /v1/query/stream ด้วย client.stream, วัด total_ms, อ่าน ttft_ms และ outcome
    raise NotImplementedError("send one streaming request")


async def run_load_test(
    concurrency_limit: int | None,
    users: int = 12,
    first_timeout: float = 0.30,
    total_timeout: float = 0.80,
) -> tuple[LoadSummary, list[RequestMetric], ContendedThaiModel]:
    # TODO 4: สร้าง app ด้วย create_app, เปิด lifespan_context และยิง users คำขอพร้อมกันด้วย asyncio.gather
    # TODO 5: สรุป primary/degraded/error counts, peak_open_streams และ nearest-rank P50/P95
    raise NotImplementedError("run concurrent SSE load test")`;

const testCode = `import asyncio

import httpx
import pytest

from sse_load_lab import (
    FAQ_QUESTION, MISS_QUESTION, ContendedThaiModel, StreamQuery,
    answer_events, create_app, parse_sse_frames, percentile, run_load_test, sse,
)


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


def test_percentile_nearest_rank_and_validation():
    values = [20.0, 20.0, 20.0, 20.0, 60.0, 60.0, 60.0, 60.0, 100.0, 100.0, 100.0, 115.0]
    assert percentile(values, 50) == 60.0   # rank = ceil(0.50 * 12) = 6
    assert percentile(values, 95) == 115.0  # rank = ceil(0.95 * 12) = 12
    assert percentile([float(i) for i in range(1, 21)], 95) == 19.0
    for bad_vals, bad_p in (([], 95), (values, 0), (values, 101)):
        with pytest.raises(ValueError):
            percentile(bad_vals, bad_p)


def test_parse_sse_frames_preserves_thai_and_ttft():
    raw = sse("meta", {"mode": "stream"}) + sse("token", {"text": "แจ้งเลขคำสั่งซื้อ", "ttft_ms": 21.5}) + sse("done", {"source": "primary"})
    events = parse_sse_frames(raw)
    assert [name for name, _ in events] == ["meta", "token", "done"]
    assert events[1][1] == {"text": "แจ้งเลขคำสั่งซื้อ", "ttft_ms": 21.5}


async def test_unlimited_load_overloads_upstream_and_fails_tail():
    summary, metrics, model = await run_load_test(concurrency_limit=None, users=12)
    assert summary.peak_open_streams == 12
    assert summary.primary_count < 12 and summary.degraded_count >= 1 and summary.error_count >= 1
    assert any(m.error_code == "upstream_timeout" for m in metrics)
    assert model.open_streams == 0


async def test_semaphore_bounds_concurrency_and_cuts_p95_ttft():
    unlimited, _, m_unlim = await run_load_test(concurrency_limit=None, users=12)
    bounded, _, m_bound = await run_load_test(concurrency_limit=4, users=12)
    assert bounded.peak_open_streams <= 4
    assert (bounded.primary_count, bounded.degraded_count, bounded.error_count) == (12, 0, 0)
    assert bounded.ttft_p95_ms is not None and unlimited.ttft_p95_ms is not None
    assert bounded.ttft_p95_ms < unlimited.ttft_p95_ms
    assert m_unlim.open_streams == 0 and m_bound.open_streams == 0


async def test_too_small_semaphore_triggers_queue_timeout():
    summary, metrics, model = await run_load_test(concurrency_limit=1, users=8, first_timeout=0.18)
    assert summary.peak_open_streams == 1
    assert summary.degraded_count + summary.error_count >= 1
    assert any(m.error_code == "queue_timeout" for m in metrics)
    assert model.open_streams == 0


async def test_healthz_readyz_and_validation_contract():
    app = create_app(concurrency_limit=4)
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            assert (await client.get("/healthz")).json() == {"status": "ok"}
            assert (await client.get("/readyz")).json() == {"ready": True}
            assert (await client.post("/v1/query/stream", json={"question": "  "})).status_code == 422
            app.state.ready = False
            assert (await client.get("/readyz")).status_code == 503
    assert app.state.ready is False


async def test_cancel_while_waiting_for_semaphore_preserves_permits():
    model = ContendedThaiModel()
    sem = asyncio.Semaphore(1)
    await sem.acquire()
    try:
        gen = answer_events(StreamQuery(question=MISS_QUESTION), model, semaphore=sem, first_timeout=1.0)
        assert (await anext(gen)).startswith("event: meta")
        waiter = asyncio.create_task(anext(gen))
        await asyncio.sleep(0)
        waiter.cancel()
        with pytest.raises(asyncio.CancelledError):
            await waiter
        await gen.aclose()
    finally:
        sem.release()

    ok_events = [f async for f in answer_events(StreamQuery(question=FAQ_QUESTION), model, semaphore=sem)]
    assert parse_sse_frames("".join(ok_events))[-1] == ("done", {"source": "primary"})
    assert model.open_streams == 0`;

/** D140 — Phase 5 / Block B35 (Review Day) */
export const d140: Lesson = defineLesson({
  day: 140,
  titleTh: "ทบทวน B35 · ทดสอบโหลด FastAPI SSE ด้วยผู้ใช้พร้อมกัน",
  tagline: "30 นาที · ทวน D137–D139 แล้วยิงโหลด SSE ด้วย httpx + asyncio.gather เพื่อวัด TTFT และ P50/P95 เทียบก่อน-หลังคุมด้วย Semaphore",
  icon: "gauge",
  visual: {
    id: "fastapi-sse",
    title: "FastAPI SSE ภายใต้ผู้ใช้พร้อมกันและขีดจำกัด Semaphore",
    caption: "เทียบภาพการไหลของหลายคำขอจาก lifespan ผ่าน route เข้าสู่ upstream เมื่อปล่อยเต็มที่เทียบกับจำกัดด้วย asyncio.Semaphore",
    alt: "แผนภาพ FastAPI Lifespan และ SSE Streaming รองรับผู้ใช้พร้อมกันพร้อมตัวคุม concurrency",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องได้ 100% ด้วยโมเดลสตรีมจำลอง ContendedThaiModel และ httpx.ASGITransport ไม่ต้องใช้ API key",
  tools: ["FastAPI", "Uvicorn", "httpx", "asyncio", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "ผู้ใช้หลายคนยิงคำถามพร้อมกันหลังปล่อยบริการจริง",
      body: "ระบบ Thai Knowledge RAG จาก Phase 4 ผ่านเทสต์คำขอเดี่ยวใน D137–D139 แล้ว แต่วันเปิดใช้งานจริงจะมีลูกค้าถามเรื่องใบกำกับภาษีและขอคืนเงินเข้ามาพร้อมกันหลายสิบคน",
      lessonNote: "จำลองผู้ใช้ 12 คนพร้อมกันด้วย `asyncio.gather` เพื่อพิสูจน์ว่า API รับโหลดได้โดยไม่ล่มเป็นลูกโซ่",
    },
    {
      node: 4,
      heading: "รวมสามเสาหลัก B35 และใส่ Semaphore คุมเส้นแชต",
      body: "D137 จัดการ {{fastapi}} lifespan + DI, D138 คุมสัญญา {{sse}} + timeout/fallback และ D139 แยก ingestion ไปคิวเบื้องหลัง วันนี้เพิ่ม {{semaphore}} คุมจำนวน stream ที่เข้าถึงโมเดลพร้อมกัน",
      lessonNote: "เปรียบเทียบ `unlimited`, `Semaphore(4)` และ `Semaphore(1)` บนชุดคำขอเดียวกันเพื่อหาจุดสมดุล",
    },
    {
      node: 5,
      heading: "อ่าน TTFT P50/P95 คู่กับอัตรา Degraded และ Error",
      body: "HTTP 200 ที่ตอบตอนเปิดสตรีมไม่ได้รับประกันคำตอบครบ และ P95 ของ {{ttft}} ที่ลดลงอาจหลอกตาถ้าคำขอท้ายแถวพังด้วย `stream-error` ไปก่อน",
      lessonNote: "ใช้วิธี Nearest-Rank คำนวณ P50/P95 คู่กับจำนวน `primary`, `cache`, `error` และ `peak_open_streams`",
    },
    {
      node: 6,
      heading: "ใช้ตัวเลขโหลดเทสต์วางสเปกก่อนแพ็ก Docker ใน B36",
      body: "ผลวัดวันนี้คือหลักฐานว่า 1 worker รับ concurrency ได้กี่ช่องและต้องตั้ง timeout เท่าไร ก่อนนำ API ไปสร้าง Multi-stage {{dockerfile}} ใน D141",
      lessonNote: "ต่อยอดสู่ **Evaluated & Guarded AI Microservice** เวอร์ชัน `v0.5.0` ที่ D156 อย่างมีตัวเลขยืนยัน",
    },
  ],

  objectives: [
    "ทบทวนสถาปัตยกรรม B35 (D137–D139) และแยกบทบาทระหว่าง {{semaphore}} บนเส้นแชต {{sse}} กับ `asyncio.Queue` บนเส้น ingestion",
    "สร้างชุดทดสอบโหลดออฟไลน์ด้วย `{{httpx|httpx.AsyncClient}}` (`ASGITransport`) + `asyncio.gather` เพื่อวัด {{ttft}} และ P50/P95 แบบ Nearest-Rank",
    "เปรียบเทียบผลโหลดเมื่อไม่จำกัด concurrency กับเมื่อใช้ `asyncio.Semaphore` แล้วตรวจว่าไม่เกิด stream หรือ permit รั่วด้วย {{pytest}}",
  ],

  prerequisites: [
    "D17–D19 · `asyncio.gather`, `asyncio.Semaphore` และ Async Generators",
    "D135–D136 · การคำนวณ P50/P95 แบบ Nearest-Rank และการอ่าน latency คู่กับ error rate",
    "D137–D139 · FastAPI `lifespan`/`Depends`, สัญญา SSE + timeout/fallback และ Background Ingestion Queue",
  ],

  setup: {
    intro: "ใช้โฟลเดอร์ `ai-fastapi-lab` จาก D137–D139 (Python 3.12) สร้างไฟล์ `sse_load_lab.py` และ `test_sse_load_lab.py` สำหรับรอบทบทวน 30 นาที",
    commands: `uv add fastapi uvicorn httpx pydantic
uv add --dev pytest
uv run python --version`,
    steps: [
      ["recall", "10 นาทีแรก: ทำ Micro-Quiz 4 ข้อทวน D137–D139 + การคำนวณ P95 และ Semaphore"],
      ["bench", "15 นาทีถัดมา: เขียนและรัน `sse_load_lab.py` + `test_sse_load_lab.py` เทียบ unlimited กับ Semaphore"],
      ["notes", "5 นาทีสุดท้าย: บันทึกตัวเลข P50/P95 และ error rate เตรียมส่งต่อเข้า D141 Dockerfile"],
    ],
    note: "เวลาในแล็บใช้ `asyncio.sleep` ระดับหลักสิบมิลลิวินาทีเพื่อให้รันจบใน ~2 วินาทีและทำซ้ำได้บนทุกเครื่องโดยไม่ต้องต่ออินเทอร์เน็ต",
  },

  concepts: [
    {
      id: "b35-recap",
      title: "1 · ทบทวน B35 (D137–D139) — สามชั้นของ Production AI API",
      paragraphs: [
        "ตลอดสามวันที่ผ่านมา เราเปลี่ยนต้นแบบ Thai Knowledge RAG จาก Phase 4 ให้กลายเป็นโครงกระดูกของ **Evaluated & Guarded AI Microservice** โดยแบ่งความรับผิดชอบออกเป็น 3 ชั้นที่ทำงานสอดประสานกัน:",
        "**D137 (Lifespan, DI & Health)** สร้างทรัพยากรหนักครั้งเดียวใน `@asynccontextmanager lifespan` เก็บลง `app.state` ฉีดผ่าน `Depends(...)` และแยก `/healthz` (process ยังอยู่) จาก `/readyz` (ทรัพยากรพร้อมรับงาน) · **D138 (SSE Streaming)** ส่งเฟรม `meta` → `token` → `done`/`stream-error` พร้อม budget 3 ชั้น (first-token, idle, total), ปิด upstream ด้วย `aclosing`/`ManagedStream` และลดระดับไป FAQ {{caching|cache}} เฉพาะก่อนส่ง token แรก · **D139 (Background Queue)** แยกงานนำเข้าเอกสารหนักออกจากเส้นแชตด้วย `202 Accepted`, `asyncio.Queue(maxsize=...)`, `{{idempotency|Idempotency-Key}}` และ retry เฉพาะ error ชั่วคราว",
      ],
      analogy: "เหมือนร้านอาหารที่เตรียมเตาครั้งเดียวตอนเปิดร้าน (D137), เสิร์ฟอาหารทีละจานทันทีที่เสร็จพร้อมแจ้งลูกค้าหากวัตถุดิบหมด (D138) และแยกเคาน์เตอร์รับวัตถุดิบหลังร้านพร้อมใบรับของ (D139)",
      bullets: [
        "**Chat SSE Path (D138 + D140)**: ผู้ใช้ถือ connection รอคำตอบทันที → คุมโหลดเข้าโมเดลด้วย `asyncio.Semaphore` + timeout/fallback",
        "**Ingestion Path (D139)**: งานหนักและรอได้ → รับด้วย `202` + `Idempotency-Key` เข้า bounded `asyncio.Queue` แล้ว poll `/jobs/{job_id}`",
        "**Shared Foundation (D137)**: ทั้งสองเส้นพึ่ง `lifespan` เดียวกันในการสร้างและปิดทรัพยากรอย่างสะอาด",
      ],
      whyTitle: "แยกทางเดินงานหนักออกจากเส้นแชตก่อนวัดโหลด",
      whyParagraphs: [
        "หากนำงานแปลง PDF หรือสร้าง embedding มาขวางบน event loop เดียวกับ `/v1/query/stream` ค่า {{ttft}} ของผู้ใช้ทุกคนจะกระโดดทันที การแยกเส้นทางใน D139 ทำให้วันนี้เราวัดพฤติกรรมของเส้นแชตได้ตรงจุด",
      ],
    },
    {
      id: "ttft-and-nearest-rank",
      title: "2 · วัด TTFT และ P50/P95 ด้วยวิธี Nearest-Rank ให้ตรงกันทั้งทีม",
      paragraphs: [
        "ในการทดสอบโหลด 12 คำขอ (`n = 12`) เราใช้วิธี **Nearest-Rank** (เดียวกับ D135–D136) เพื่อหลีกเลี่ยงตัวเลขคลาดเคลื่อนจากการเฉลี่ยหรือการประมาณช่วง: เรียงค่าเวลาจากน้อยไปมาก แล้วหาลำดับแบบเริ่มที่ 1 ด้วยสูตร `rank = math.ceil((p / 100) * n)` หรือในเลขจำนวนเต็ม `(p * n + 99) // 100` จากนั้นหยิบสมาชิก `ordered[rank - 1]`",
        "สำหรับ `n = 12`: **P50** อยู่ที่ `rank = ceil(0.50 × 12) = 6` (`ordered[5]`) และ **P95** อยู่ที่ `rank = ceil(0.95 × 12) = 12` (`ordered[11]` — ตัวที่ช้าที่สุดของชุด 12 คำขอ) และหาก `n = 20` ค่า P95 จะอยู่ที่ `rank = 19` (`ordered[18]`) เมื่อประกาศสูตรชัด ทุกกราฟและทุกเทสต์จะได้ตัวเลขตรงกันเสมอ",
      ],
      analogy: "เหมือนเรียงแถวลูกค้า 12 คนตามเวลารออาหารจากเร็วสุดไปช้าสุด แล้วชี้คนที่ 6 เป็นตัวแทน P50 และคนที่ 12 เป็นตัวแทน P95 โดยไม่เอาเวลาทุกคนมาบวกหารเฉลี่ยจนหางยาวหายไป",
      code: {
        language: "python",
        filename: "nearest_rank_demo.py",
        code: `def percentile(values: list[float], p: int) -> float:
    if not values or not 1 <= p <= 100:
        raise ValueError("expected non-empty values and p in 1..100")
    ordered = sorted(values)
    rank = (p * len(ordered) + 99) // 100
    return ordered[rank - 1]


ttfts = [20, 20, 20, 20, 60, 60, 60, 60, 100, 100, 100, 115]
print("P50:", percentile(ttfts, 50), "ms")  # rank 6  -> 60 ms
print("P95:", percentile(ttfts, 95), "ms")  # rank 12 -> 115 ms`,
        caption: "สูตรจำนวนเต็ม `(p * n + 99) // 100` ให้ผลเท่ากับ `math.ceil((p / 100) * n)` โดยไม่มีปัญหา floating-point rounding",
      },
      whyTitle: "ข้อควรรู้ของ httpx.ASGITransport เมื่อวัด TTFT แบบออฟไลน์",
      whyParagraphs: [
        "ต่อเนื่องจากข้อควรระวังใน D138: `httpx.ASGITransport` จะรัน ASGI app จนจบและเก็บ body ทั้งหมดลง buffer ก่อนส่งคืน `Response` ให้ client ดังนั้นถ้าจับเวลาใน client ตอนเริ่มอ่าน `aiter_lines()` ผ่าน `ASGITransport` ค่าที่ได้จะเป็น **total duration** ไม่ใช่ TTFT จริง",
        "ในแล็บออฟไลน์นี้ เซิร์ฟเวอร์จึงวัด `ttft_ms` ด้วย monotonic clock ของ event loop ตั้งแต่เข้าคำขอ (ก่อนรอ Semaphore) จนถึงจังหวะ yield เฟรม `token` แรกแล้วแนบมากับ payload ส่วนเมื่อยิงใส่ Uvicorn จริงผ่าน TCP socket ให้จับเวลาฝั่ง client ตอนรับเฟรม `token` แรกเพื่อรวม latency เครือข่ายด้วย",
      ],
    },
    {
      id: "semaphore-concurrency-limit",
      title: "3 · เทียบ Unlimited กับ asyncio.Semaphore — จุดสมดุลของ Concurrency",
      paragraphs: [
        "โมเดล LLM หรือ GPU backend มีความจุที่รับงานพร้อมกันได้ดีระดับหนึ่ง (ในแล็บคือ `safe_concurrency = 4`) หากปล่อยให้ผู้ใช้ 12 คนพุ่งเข้าโมเดลพร้อมกันโดยไม่มีตัวกั้น (`concurrency_limit = None`) ค่า `peak_open_streams` จะพุ่งเป็น 12 เกินกำลังรับ 3 เท่า ทำให้คำขอที่เกินโควตาโดนความหน่วงสะสมจนชน `first_timeout` (300 ms) ผลคือคำขอ FAQ ต้องลดระดับไป `cache` ส่วนคำขอที่ไม่ตรง FAQ ล้มด้วย `stream-error (upstream_timeout)`",
        "เมื่อวาง `{{semaphore|asyncio.Semaphore(4)}}` ไว้ใน `lifespan` คำขอ 12 รายการจะเข้าโมเดลทีละ 4 รายการเป็น 3 รอบ (wave ละ ~40–60 ms): รอบแรกได้ `TTFT ≈ 20–30 ms`, รอบสองรอคิว 1 รอบ, รอบสามรอคิว 2 รอบ ทุกคนได้คำตอบจาก `primary` ครบ 12/12 และ `TTFT P95` ลดลงจาก ~300–312 ms เหลือ ~105–156 ms พร้อมอัตรา error เป็น 0%",
      ],
      analogy: "เหมือนเคาน์เตอร์ทำกาแฟที่มีเครื่องชง 4 หัว การจัดแถวให้สั่งทีละ 4 แก้วทำให้ทุกคนได้กาแฟร้อนครบและเร็วกว่าปล่อย 12 คนรุมสั่งพร้อมกันจนบาริสต้าสับสนและยกเลิกออเดอร์ท้ายแถว",
      code: {
        language: "python",
        filename: "semaphore_guard.py",
        code: `import asyncio


async def acquire_with_budget(sem: asyncio.Semaphore, budget_s: float) -> bool:
    try:
        async with asyncio.timeout(budget_s):
            await sem.acquire()
        return True
    except TimeoutError:
        return False  # แปลงเป็น queue_timeout แล้วเข้า fallback ได้`,
        caption: "จำกัดเวลารอ permit ด้วย `asyncio.timeout` และคืน permit ในบล็อก `finally` เฉพาะเมื่อ acquire สำเร็จแล้วเท่านั้น",
      },
      whyTitle: "อย่าตั้ง Semaphore เล็กเกินไป และอย่าลืมอ่านผลคู่ Error Rate",
      whyParagraphs: [
        "ถ้าลดเหลือ `Semaphore(1)` กับ 12 คำขอ คำขอจะเข้าแถวทีละคนจนคำขอท้ายแถวรอคิวนานเกิน `first_timeout` และติด `queue_timeout` — การแยก error code `queue_timeout` ออกจาก `upstream_timeout` ทำให้ทีมรู้ทันทีว่าคอขวดอยู่ที่ตัวกั้นของเราเองหรือที่ปลายทาง",
        "นอกจากนี้ควรรายงาน `TTFT P95` คู่กับ `primary / cache / error` เสมอ เพราะคำขอที่ล้มก่อนได้ token จะไม่มีค่า `ttft_ms` หากดูเฉพาะค่าเฉลี่ยหรือ P95 ของคำขอที่รอดอาจเข้าใจผิดว่าระบบเร็ว ทั้งที่ลูกค้า 25–50% ไม่ได้คำตอบ",
      ],
    },
    {
      id: "bridge-to-b36-docker",
      title: "4 · นำหลักฐานโหลดเทสต์ไปเตรียมแพ็ก Docker ใน B36 (D141)",
      paragraphs: [
        "ตัวเลขจาก D140 ไม่ใช่แค่คะแนนในแล็บ แต่เป็นอินพุตสำคัญสำหรับ **Block B36 (Docker & Cloud Deploy)**: เมื่อเรารู้ว่า 1 Uvicorn worker รับ concurrency ได้อย่างเสถียรที่ `Semaphore(4)` โดยไม่ให้ `/healthz` ค้างและไม่ปล่อย stream รั่ว เราก็สามารถตั้งค่าผ่าน environment variable ในคอนเทนเนอร์ได้ทันที",
        "ในวันพรุ่งนี้ (D141) เราจะนำ FastAPI service จาก B35 มาแพ็กลง Multi-stage {{dockerfile}} ด้วย `uv` บน `python:3.12-slim-bookworm` รันด้วย non-root `UID 10001` และผูก `HEALTHCHECK` เข้ากับ `/healthz` ที่เราสร้างและทดสอบแล้วใน D137 และ D140 ก่อนขยายต่อเป็น `docker compose` (API + Postgres/pgvector + Langfuse) ใน D142",
      ],
      analogy: "เหมือนทดสอบเครื่องยนต์บนแท่นวัดแรงม้าและตั้งรอบสูงสุดให้ปลอดภัยก่อนยกเครื่องลงตัวถังรถ (Docker Image) เพื่อส่งออกไปวิ่งบนถนนจริง",
      bullets: [
        "**Concurrency ต่อ Worker**: เก็บค่า `CONCURRENCY_LIMIT` แยกเป็น env config เพื่อให้ปรับตามจำนวน GPU/โควตา {{rate-limit}} ของแต่ละ environment",
        "**Health & Graceful Shutdown**: `/healthz` ต้องตอบไวแม้เส้นแชตมีโหลดเต็ม และ `lifespan` + `aclosing` ต้องคืนทรัพยากรครบเมื่อคอนเทนเนอร์ได้รับ `SIGTERM`",
        "**Regression Load Test ใน CI**: ชุดเทสต์ออฟไลน์ด้วย `ASGITransport` รันจบใน ~2 วินาที ใช้เป็นด่านตรวจก่อน build image ใน B36 ได้ทันที",
      ],
      whyTitle: "วัดก่อนแพ็ก แก้ง่ายกว่าแก้บน Cloud หลายเท่า",
      whyParagraphs: [
        "ปัญหา concurrency หรือการลืมปิด generator/permit จะแสดงอาการชัดที่สุดเมื่อมีโหลดพร้อมกัน การมีเทสต์จำลองโหลดที่รันได้ใน CI ช่วยกันไม่ให้ regression หลุดขึ้น staging ใน D143–D144",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — httpx + asyncio.gather ≈ k6 / autocannon + p-limit",
      body: [
        "ฝั่ง Node/TypeScript เรามักใช้ `Promise.all` ยิงโหลดจำลองและใช้ `p-limit` จำกัดจำนวนงานพร้อมกัน ส่วนใน Python `asyncio.gather` ทำหน้าที่ยิงพร้อมกัน และ `asyncio.Semaphore` ทำหน้าที่เป็น bulkhead จำกัดจำนวนงานที่เข้าถึง upstream",
      ],
      table: [
        ["`httpx.AsyncClient` + `asyncio.gather`", "`fetch` + `Promise.all` หรือสคริปต์โหลดเทสต์แบบย่อ (k6)"],
        ["`asyncio.Semaphore(4)`", "`p-limit(4)` หรือ concurrency bulkhead ต่อ instance"],
        ["`httpx.ASGITransport` (ออฟไลน์)", "Supertest / `app.request()` ใน Hono (ไม่ผ่าน TCP socket จริง)"],
        ["Nearest-Rank P50 / P95", "Percentile metrics ใน k6 (`http_req_duration p(95)`)"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม P95 ของ 12 คำขอคืออันดับที่ 12 ไม่ใช่ 11?",
      body: [
        "ลองคำนวณ `0.95 × 12 = 11.4` วิธี Nearest-Rank ใช้การปัดขึ้นเสมอ (`ceil(11.4) = 12`) เพื่อให้มั่นใจว่ามีข้อมูลอย่างน้อย 95% ที่เร็วกว่าหรือเท่ากับค่านี้ (ถ้าเลือกอันดับ 11 จะครอบคลุมแค่ `11/12 = 91.7%` ซึ่งยังไม่ถึง 95%)",
        "และเหตุผลที่ `Semaphore(4)` เร็วกว่าไม่จำกัดเลย ทั้งที่มีการเข้าแถวรอ ก็เพราะการรุมเข้าโมเดลพร้อมกัน 12 งานทำให้งานท้ายแถวโดนความหน่วงสะสมสูงกว่าการผลัดกันเข้าทีละ 4 งานอย่างเป็นระเบียบ",
      ],
    },
  },

  workedExample: {
    intro: "ต่อยอด `stream_api.py` จาก D138 เป็น `sse_load_lab.py` เพื่อทดสอบ 12 ผู้ใช้พร้อมกัน (6 คำถาม FAQ + 6 คำถามนอก FAQ) ภายใต้ 3 โหมด: ไม่จำกัด, `Semaphore(4)` และ `Semaphore(1)`",
    steps: [
      {
        title: "1 · สร้าง ContendedThaiModel และเฟรม SSE พื้นฐาน",
        explain: "ขยาย `FakeThaiModel` จาก D138 เป็น `ContendedThaiModel` ที่บันทึก `peak_open_streams` และเพิ่มความหน่วง `overload_step = 0.10s` ต่อแต่ละ stream ที่เกิน `safe_concurrency = 4`",
        code: { language: "python", filename: "sse_load_lab.py", code: serviceCode },
        output: "โมเดลจะเริ่มช้าลงทันทีเมื่อ open_streams > 4 และต้องคืน open_streams เป็น 0 เสมอใน finally",
      },
      {
        title: "2 · เพิ่ม Semaphore Guard ใน answer_events และโรงงาน create_app",
        explain: "ต่อโค้ดส่วนนี้ลงในไฟล์เดิม `answer_events` จะบันทึก `started_at` ก่อนรอ permit เพื่อให้ `ttft_ms` นับรวมเวลารอคิวด้วย และใช้ `try/finally` คืน permit เสมอแม้ผู้ใช้ยกเลิกกลางคัน",
        code: { language: "python", filename: "sse_load_lab.py", code: streamEngineCode },
        output: "สร้าง FastAPI app ที่เลือก concurrency_limit=None หรือ int ได้ พร้อม /healthz, /readyz และ /v1/query/stream",
      },
      {
        title: "3 · ยิงโหลด 12 ผู้ใช้ด้วย httpx + asyncio.gather แล้วเทียบ P50/P95",
        explain: "ต่อส่วน harness ลงท้าย `sse_load_lab.py` แล้วรัน `uv run python sse_load_lab.py` เพื่อเทียบทั้ง 3 การตั้งค่าบนคำขอชุดเดียวกัน (วิธี Nearest-Rank: n=12 → P50=อันดับ 6, P95=อันดับ 12)",
        code: { language: "python", filename: "sse_load_lab.py", code: harnessCode },
        output: `unlimited    | peak=12 | primary= 6 cache= 3 err= 3 | TTFT P50=125.0ms P95=312.0ms | Total P95=328.0ms | open=0
semaphore=4  | peak= 4 | primary=12 cache= 0 err= 0 | TTFT P50=94.0ms P95=156.0ms | Total P95=203.0ms | open=0
semaphore=1  | peak= 1 | primary= 5 cache= 3 err= 4 | TTFT P50=219.0ms P95=313.0ms | Total P95=329.0ms | open=0`,
      },
    ],
    gotcha: "ตัวเลขมิลลิวินาทีจริงจะแกว่งเล็กน้อยตาม OS timer (บน Windows event loop มีความละเอียด ~15.6 ms) แต่รูปแบบเชิงเปรียบเทียบจะคงที่เสมอ: `semaphore=4` ได้ `primary=12, err=0, peak<=4` และ `TTFT P95` ต่ำกว่า `unlimited` ชัดเจน ส่วนถ้าต้องการวัด client-perceived TTFT ผ่าน TCP จริง ให้เปิด Uvicorn แล้วชี้ `AsyncClient(base_url=\"http://127.0.0.1:8000\")` แทน `ASGITransport`",
  },

  practice: {
    intro: "ภารกิจทบทวน 15 นาที: เติม TODO ทั้ง 5 จุดใน `sse_load_lab.py` เพื่อสร้าง load-test harness และตัวคำนวณ Nearest-Rank P50/P95 แล้วตรวจผ่าน `pytest` 7 เคส",
    requirements: [
      "เขียน `percentile(values, p)` แบบ Nearest-Rank (`rank = (p * n + 99) // 100`) และโยน `ValueError` เมื่อ `values` ว่างหรือ `p` อยู่นอกช่วง `1..100`",
      "เขียน `parse_sse_frames(body)` ตรวจว่าสตรีมปิดด้วย `\\n\\n` และแยก `(event_name, json_payload)` ให้ครบถ้วนโดยคงข้อความภาษาไทย",
      "เขียน `send_one(client, question, scenario)` ยิง `POST /v1/query/stream` ด้วย `client.stream`, วัด `total_ms`, ดึง `ttft_ms` จากเฟรม `token` แรก และจำแนกผลลัพธ์เป็น `primary`, `cache` หรือ `error` พร้อม `error_code`",
      "เขียน `run_load_test(...)` ที่สร้าง app ด้วย `create_app`, เปิด `app.router.lifespan_context(app)` ยิง `users` คำขอพร้อมกัน (สลับ FAQ กับ non-FAQ) ด้วย `httpx.AsyncClient(transport=httpx.ASGITransport(app=app))` และ `asyncio.gather`",
      "สรุป `LoadSummary` ด้วยจำนวน `primary/degraded/error`, `peak_open_streams` และ Nearest-Rank `P50/P95` ของทั้ง `ttft_ms` และ `total_ms` โดยไม่มี stream ค้าง (`open_streams == 0`)",
    ],
    starter: {
      language: "python",
      filename: "sse_load_lab.py",
      code: [serviceCode, streamEngineCode, harnessStarter].join("\n\n\n"),
    },
    verification: {
      language: "python",
      filename: "test_sse_load_lab.py",
      code: testCode,
    },
    selfCheck: [
      "`percentile` ผ่านทั้งเคส `n=12` (P50=อันดับ 6, P95=อันดับ 12), `n=20` (P95=อันดับ 19) และโยน `ValueError` เมื่อลิสต์ว่าง",
      "โหมด `unlimited` แสดง `peak_open_streams == 12` และเกิดทั้ง `cache` fallback และ `upstream_timeout` error",
      "โหมด `semaphore=4` คุม `peak_open_streams <= 4`, ได้ `primary=12, err=0` และลด `TTFT P95` ต่ำกว่า `unlimited`",
      "โหมด `semaphore=1` เกิด `queue_timeout` ชัดเจน และการยกเลิกระหว่างรอ permit ไม่ทำให้ permit หรือ `open_streams` รั่ว",
    ],
    acceptance: "pytest ผ่านครบ 7 เคส และสคริปต์ `sse_load_lab.py` พิมพ์ตารางเทียบ `unlimited`, `semaphore=4` และ `semaphore=1` โดย `open=0` ทุกรายการ",
    hints: [
      {
        body: "ใน `percentile` ให้เรียงลิสต์ใหม่ด้วย `sorted(values)` ก่อนคำนวณ `rank = (p * len(ordered) + 99) // 100` แล้วคืน `ordered[rank - 1]` อย่าแก้ลิสต์ต้นฉบับและอย่าลืมเช็ก `not values`",
      },
      {
        body: "ใน `run_load_test` ต้องเปิด `async with app.router.lifespan_context(app):` ก่อนสร้าง `httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=\"http://test\")` มิฉะนั้น `app.state.model` และ `app.state.semaphore` จะยังไม่ถูกสร้าง",
      },
      {
        body: "คัดลอกเฉลยฉบับสมบูรณ์ของ `sse_load_lab.py` ด้านล่าง แล้วรันคู่กับ `test_sse_load_lab.py` เพื่อยืนยันทั้ง 7 เคส",
        code: {
          language: "python",
          filename: "sse_load_lab.py",
          code: [serviceCode, streamEngineCode, harnessCode].join("\n\n\n"),
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v test_sse_load_lab.py
uv run python sse_load_lab.py`,
    },
  },

  mistakes: [
    {
      title: "วัดเวลา HTTP 200 หรือ ASGITransport แล้วเรียกว่า TTFT จริง",
      symptom: "รายงาน TTFT ต่ำผิดปกติ (วัดแค่ header) หรือเท่ากับเวลารวมทั้งคำตอบ (เพราะ ASGITransport buffer จนจบ)",
      fix: "ใช้วิธีวัด TTFT ที่จุด yield เฟรม `token` แรกฝั่งเซิร์ฟเวอร์ในเทสต์ออฟไลน์ และวัดที่เฟรม `token` แรกผ่าน TCP socket จริงเมื่อรันกับ Uvicorn",
    },
    {
      title: "ดูแต่ P95 TTFT โดยไม่ดูจำนวน Error และ Degraded",
      symptom: "ระบบที่ fail เร็วใน 150 ms อาจโชว์ตัวเลข latency ดูดีทั้งที่ลูกค้าครึ่งหนึ่งเจอ `stream-error`",
      fix: "แสดง `primary_count`, `degraded_count`, `error_count` และ `peak_open_streams` ข้างตัวเลข P50/P95 ทุกครั้ง",
    },
    {
      title: "ปล่อย Semaphore ค้างหรือตั้งค่าแคบเกินโดยไม่มี Queue Timeout",
      symptom: "เมื่อผู้ใช้ปิดแท็บระหว่างรอ permit หรือโหลดพุ่ง คิวสะสมจนทุกคำขอค้างไม่มีวันหลุด",
      fix: "ครอบ `await semaphore.acquire()` ด้วย `asyncio.timeout` ตามงบเวลาที่เหลือ และคืน permit ในบล็อก `finally` เฉพาะเมื่อ acquire สำเร็จ",
    },
    {
      title: "รัน ASGITransport โดยไม่เปิด Lifespan",
      symptom: "ยิงโหลดเทสต์แล้วพังทันทีด้วย `AttributeError: 'State' object has no attribute 'model'`",
      fix: "ครอบ `httpx.AsyncClient` ด้วย `async with app.router.lifespan_context(app):` เสมอเมื่อใช้ `ASGITransport`",
    },
  ],

  quiz: {
    intro: "ทบทวน B35 ครบทั้ง 4 วัน (D137–D140) — ลองคำนวณและตอบเองก่อนเปิดดูเฉลย",
    questions: [
      mc(
        "d140-q1",
        "ผลโหลดเทสต์ 12 คำขอเรียง TTFT จากน้อยไปมากได้ `[20, 20, 20, 20, 60, 60, 60, 60, 100, 100, 100, 115]` ms หากใช้วิธี Nearest-Rank ค่า P50 และ P95 คือเท่าไร?",
        [
          ["P50 = 60 ms, P95 = 100 ms", "อันดับ 11 ครอบคลุมเพียง 91.7% ยังไม่ถึง 95% ตามกติกา Nearest-Rank"],
          ["P50 = 60 ms, P95 = 115 ms", "ถูก — rank ของ P50 คือ ceil(0.50×12)=6 (60 ms) และ P95 คือ ceil(0.95×12)=12 (115 ms)"],
          ["P50 = 64.6 ms, P95 = 115 ms", "64.6 ms คือค่าเฉลี่ย (mean) ไม่ใช่ P50"],
          ["P50 = 20 ms, P95 = 100 ms", "20 ms อยู่ที่อันดับ 4 ยังไม่ถึงครึ่งหนึ่งของชุดข้อมูล"],
        ],
        "B",
        "Nearest-Rank คำนวณ `rank = ceil((p / 100) * n)` (1-indexed) สำหรับ n=12 จะได้ P50 ที่อันดับ 6 (60 ms) และ P95 ที่อันดับ 12 (115 ms)",
        "สูตร Nearest-Rank สำหรับข้อมูล n ค่าที่เปอร์เซ็นไทล์ p คืออะไร?",
        "เรียงจากน้อยไปมากแล้วหยิบอันดับ `ceil((p / 100) * n)` แบบเริ่มที่ 1 (`ordered[(p * n + 99) // 100 - 1]`)",
      ),
      mc(
        "d140-q2",
        "เมื่อยิง 12 คำขอพร้อมกันเข้าโมเดลที่รับโหลดได้ดี 4 stream (`safe_concurrency=4`) ทำไมการจำกัดด้วย `asyncio.Semaphore(4)` จึงทำให้ P95 TTFT ดีขึ้นและ error เป็น 0?",
        [
          ["เพราะ Semaphore ทำให้โมเดลประมวลผลเร็วขึ้น 4 เท่าต่อคำขอ", "ความเร็วต่อคำขอของโมเดลเท่าเดิม แต่ไม่เกิดความหน่วงจากการแย่งทรัพยากรเกินขีดจำกัด"],
          ["เพราะ Semaphore ตัดคำขอที่เกิน 4 ทิ้งด้วย HTTP 429 ทันที", "ในแล็บนี้คำขอที่เกินจะรอ permit ชั่วครู่ตามงบเวลา ไม่ได้ทิ้งทันที"],
          ["เพราะ Semaphore คุม peak concurrency ให้อยู่ในช่วงที่ upstream รับไหว คำขอที่เหลือจึงรอคิวสั้น ๆ แล้วได้คำตอบ primary ครบแทนที่จะชน timeout พร้อมกัน", "ถูก — ลด contention ที่ upstream ทำให้ทั้ง primary rate และ P95 TTFT ดีกว่าปล่อยไม่จำกัด"],
          ["เพราะ Semaphore ปิดการตรวจสอบ Pydantic schema เพื่อลด overhead", "ไม่เกี่ยวกัน — validation ยังทำงานก่อนเปิดสตรีมตามปกติ"],
        ],
        "C",
        "`asyncio.Semaphore(4)` ทำหน้าที่เป็น bulkhead คุมจำนวนงานเข้าสู่ upstream ไม่ให้เกินความจุที่รับไหว จึงกัน cascading timeout และลด P95 TTFT",
        "จะเกิดอะไรขึ้นถ้าตั้ง Semaphore แคบเกินไป (เช่น `Semaphore(1)`) ภายใต้โหลด 12 คำขอ?",
        "คำขอท้ายแถวจะรอ permit นานจนเกิน `first_timeout` และเกิด `queue_timeout`",
      ),
      mc(
        "d140-q3",
        "ในการทบทวน D137–D138 หาก endpoint `/v1/query/stream` ส่ง HTTP 200 และ `event: meta` ออกไปแล้ว แต่ต่อมารอ permit หรือ upstream เกินงบเวลาโดยยังไม่ได้ส่ง `token` แรก และคำถามไม่ตรง FAQ ควรตอบสนองอย่างไร?",
        [
          ["เปลี่ยน HTTP status เป็น 504 Gateway Timeout", "ทำไม่ได้เพราะส่ง HTTP 200 headers ออกไปแล้ว"],
          ["ส่ง `event: stream-error` พร้อมรหัสเหตุผลแล้วปิดสตรีมโดยไม่มี `done` และคืนทรัพยากรทั้งหมด", "ถูก — สื่อสารความล้มเหลวผ่านสัญญา SSE ชัดเจนและไม่ปล่อย stream หรือ permit รั่ว"],
          ["ส่ง `event: done` พร้อมข้อความว่างเพื่อไม่ให้หน้าเว็บขึ้น error", "จะทำให้ monitoring และ UI เข้าใจผิดว่าได้คำตอบสมบูรณ์"],
          ["จับ `CancelledError` แล้ววน retry ไปเรื่อย ๆ จนกว่าจะได้คำตอบ", "จะกลืนการยกเลิกของ client และทำให้ทรัพยากรค้าง"],
        ],
        "B",
        "หลังส่ง HTTP 200 แล้ว ต้องรายงานปัญหาผ่าน `stream-error` แยกจาก `done` พร้อมปิด generator และคืน permit ใน `finally`",
        "เมื่อไรจึงอนุญาตให้ลดระดับไปตอบจาก FAQ cache ในสัญญา D138/D140?",
        "เฉพาะเมื่อยังไม่เคยส่ง `token` แรกออกไปและคำถามตรงกับ FAQ ใน scope ที่อนุญาตเท่านั้น",
      ),
      mc(
        "d140-q4",
        "หากทีมต้องรองรับทั้งการอัปโหลดไฟล์ PDF นโยบาย 50 หน้า (ใช้เวลาทำ index 40 วินาที) และการแชตถามตอบแบบ SSE ในแอป FastAPI เดียวกัน ควรเลือกโครงสร้างจาก B35 อย่างไร?",
        [
          ["ใช้ `asyncio.Semaphore` ตัวเดียวคุมทั้งอัปโหลด PDF และแชต SSE", "งาน PDF นาน 40 วินาทีจะยึด permit จนเส้นแชตค้างและ timeout"],
          ["ให้ endpoint อัปโหลดรอจน index เสร็จแล้วค่อยคืน HTTP 200", "ผู้ใช้จะ timeout และกดส่งซ้ำจนเกิดงานซ้ำซ้อน"],
          ["แยก ingestion ไป `POST /ingest` (`202` + `Idempotency-Key` + bounded queue + worker จาก D139) และใช้ `Semaphore` + timeout/fallback คุมเส้นแชต SSE (D138/D140)", "ถูก — แยกงานยาวแบบ async job ออกจากเส้นแชตที่ต้องการ TTFT ต่ำ"],
          ["เพิ่ม Uvicorn workers เป็น 8 ตัวแล้วเก็บคิวและ job registry ไว้ใน RAM ของแต่ละ worker", "GET `/jobs/{id}` ที่ไปโดนคนละ worker จะตอบ 404 เพราะไม่ได้แชร์ state ข้าม process"],
        ],
        "C",
        "B35 แยกงานหนักที่รอได้ไป background queue (D139) เพื่อปกป้อง latency ของเส้นแชต SSE ที่คุม concurrency ด้วย Semaphore (D138/D140)",
        "ความต่างหลักระหว่าง `asyncio.Queue` (D139) กับ `asyncio.Semaphore` (D140) ใน API ของเราคืออะไร?",
        "Queue แยกงานหนักไปทำเบื้องหลังแล้วคืน 202 ให้ติดตามทีหลัง ส่วน Semaphore คุมจำนวนคำขอที่เข้าถึงโมเดลพร้อมกันในเส้นแชตที่ยังถือ connection รออยู่",
      ),
    ],
  },

  takeaways: [
    "ครบ Block B35 (D137–D140): เรามี FastAPI lifespan + DI + `/healthz`/`/readyz`, เส้นแชต SSE พร้อม timeout/fallback, เส้น ingestion queue แบบ idempotent และชุดทดสอบโหลด",
    "ประกาศสูตร Percentile ให้ชัด (Nearest-Rank) และอ่าน `TTFT P50/P95` คู่กับ `primary / cache / error` และ `peak_open_streams` เสมอ",
    "`asyncio.Semaphore` ที่สอดคล้องกับความจุ upstream ช่วยกัน overload และลด P95 TTFT แต่ต้องมี timeout คุมเวลารอคิวและคืน permit ใน `finally`",
    "พรุ่งนี้ขึ้น Block B36 (D141): นำ FastAPI service นี้ไปแพ็กลง Production Multi-stage Dockerfile ด้วย `uv` และรันแบบ non-root",
  ],

  reviewCards: [
    rc("d140-rc-1", "ทำไม `httpx.ASGITransport` จึงวัด client-side TTFT โดยตรงไม่ได้?", "เพราะ ASGITransport รัน ASGI app จนจบและเก็บ body ทั้งก้อนลง buffer ก่อนส่งกลับ จึงต้องใช้ timestamp จากเซิร์ฟเวอร์ในเทสต์ออฟไลน์ หรือยิงผ่าน Uvicorn TCP socket จริง"),
    rc("d140-rc-2", "Nearest-Rank P50 และ P95 ของข้อมูล 12 ตัวอยู่ที่อันดับใด?", "P50 อยู่ที่อันดับ ceil(0.50×12) = 6 และ P95 อยู่ที่อันดับ ceil(0.95×12) = 12 (แบบเริ่มนับที่ 1)"),
    rc("d140-rc-3", "ข้อแตกต่างระหว่าง `upstream_timeout` กับ `queue_timeout` คืออะไร?", "`queue_timeout` คือรอ permit จาก Semaphore เกินงบเวลา ส่วน `upstream_timeout` คือได้ permit แล้วแต่โมเดลปลายทางส่ง token ไม่ทันเวลา"),
    rc("d140-rc-4", "ข้อมูลใดจาก D140 ที่ต้องพกต่อไปยัง D141 (Production Dockerfile)?", "ค่า concurrency limit ต่อ worker, พฤติกรรม `/healthz` ภายใต้โหลด และความมั่นใจว่า lifespan/stream คืนทรัพยากรสะอาดเมื่อปิดโปรเซส"),
  ],

  sources: [
    { label: "Python 3.12 — asyncio Synchronization Primitives (Semaphore)", href: "https://docs.python.org/3.12/library/asyncio-sync.html#asyncio.Semaphore" },
    { label: "Python 3.12 — asyncio Coroutines and Tasks (gather & timeouts)", href: "https://docs.python.org/3.12/library/asyncio-task.html" },
    { label: "HTTPX — Async Support & Streaming Responses", href: "https://www.python-httpx.org/async/" },
    { label: "HTTPX — ASGI Transport", href: "https://www.python-httpx.org/advanced/transports/#asgi-transport" },
    { label: "FastAPI — Lifespan Events", href: "https://fastapi.tiangolo.com/advanced/events/" },
    { label: "FastAPI — StreamingResponse", href: "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse" },
  ],

  glossary: ["fastapi", "sse", "asyncio", "semaphore", "httpx", "ttft", "rate-limit", "pydantic", "pytest", "caching", "idempotency", "dockerfile"],
});
