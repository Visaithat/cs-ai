import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const streamModel = `import asyncio
import json
from collections.abc import AsyncGenerator
from contextlib import aclosing, asynccontextmanager
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field


class StreamQuery(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    question: str = Field(min_length=3, max_length=400)
    scenario: Literal["normal", "slow-start", "slow-middle"] = "normal"


FAQ_QUESTION = "ขอใบกำกับภาษีอย่างไร"
CACHED_FAQ = {FAQ_QUESTION: "แจ้งเลขคำสั่งซื้อผ่านศูนย์ช่วยเหลือ [billing#2]"}


class FakeThaiModel:
    def __init__(self):
        self.open_streams = 0

    async def tokens(self, scenario: str) -> AsyncGenerator[str, None]:
        self.open_streams += 1
        try:
            await asyncio.sleep(1 if scenario == "slow-start" else 0.02)
            yield "แจ้งเลขคำสั่งซื้อ"
            await asyncio.sleep(1 if scenario == "slow-middle" else 0.03)
            yield "ผ่านศูนย์ช่วยเหลือ [billing#2]"
        finally:
            self.open_streams -= 1


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = FakeThaiModel()
    yield


app = FastAPI(title="Evaluated & Guarded AI Microservice", lifespan=lifespan)


async def get_model(request: Request) -> FakeThaiModel:
    return request.app.state.model`;

const streamEvents = `def sse(event: str, payload: dict[str, str]) -> str:
    data = json.dumps(payload, ensure_ascii=False)
    return f"event: {event}\\ndata: {data}\\n\\n"


async def answer_events(
    query: StreamQuery,
    model: FakeThaiModel,
    first_timeout: float = 0.15,
    idle_timeout: float = 0.15,
    total_timeout: float = 0.5,
) -> AsyncGenerator[str, None]:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + total_timeout
    sent_token = False
    failure = ""
    yield sse("meta", {"mode": "stream"})

    # ปิด generator ของ upstream เมื่อจบ, timeout หรือถูก cancel
    async with aclosing(model.tokens(query.scenario)) as tokens:
        while True:
            remaining = deadline - loop.time()
            if remaining <= 0:
                failure = "deadline_exceeded"
                break
            wait = idle_timeout if sent_token else first_timeout
            try:
                # ออกจาก timeout ก่อน yield ให้ ASGI ส่งข้อมูล
                async with asyncio.timeout(min(wait, remaining)):
                    token = await anext(tokens)
            except StopAsyncIteration:
                if not sent_token:
                    failure = "empty_answer"
                break
            except TimeoutError:
                failure = "deadline_exceeded" if remaining <= wait else "upstream_timeout"
                break

            if token:
                sent_token = True
                yield sse("token", {"text": token})

    if not failure:
        yield sse("done", {"source": "primary"})
        return

    cached = CACHED_FAQ.get(query.question)
    if not sent_token and cached is not None:
        yield sse("degraded", {"reason": failure})
        yield sse("token", {"text": cached})
        yield sse("done", {"source": "cache"})
    else:
        yield sse("stream-error", {"code": failure})`;

const streamRoute = `class ManagedStream(StreamingResponse):
    async def stream_response(self, send):
        # หากการส่งไปยัง socket ล้มเหลว ให้ปิด iterator ด้วย
        async with aclosing(self.body_iterator):
            await super().stream_response(send)


@app.post("/v1/query/stream", response_class=StreamingResponse)
async def query_stream(
    body: StreamQuery,
    model: Annotated[FakeThaiModel, Depends(get_model)],
) -> StreamingResponse:
    return ManagedStream(
        answer_events(body, model),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )`;

const practiceEvents = `def sse(event: str, payload: dict[str, str]) -> str:
    # TODO 1: encode payload as JSON and delimit the frame.
    raise NotImplementedError("format SSE frame")


async def answer_events(
    query: StreamQuery,
    model: FakeThaiModel,
    first_timeout: float = 0.15,
    idle_timeout: float = 0.15,
    total_timeout: float = 0.5,
) -> AsyncGenerator[str, None]:
    # TODO 2: bound each upstream read, close upstream, relay tokens.
    # TODO 3: use an exact FAQ cache only before the first token.
    # TODO 4: emit done on success or stream-error on incomplete output.
    yield sse("meta", {"mode": "stream"})
    raise NotImplementedError("stream, degrade or fail")`;

/** D138 — Phase 5 / Block B35 */
export const d138: Lesson = defineLesson({
  day: 138,
  titleTh: "สตรีมคำตอบด้วย SSE พร้อม Timeout และ Fallback",
  tagline: "30 นาที · ส่งคำตอบทีละส่วน คืนทรัพยากรเมื่อผู้ใช้หลุด และใช้ FAQ สำรองอย่างมีสัญญาที่ชัดเจน",
  icon: "zap",
  visual: {
    id: "fastapi-sse",
    title: "จาก FastAPI ถึงผู้ใช้ผ่าน SSE",
    caption: "ไล่จาก lifespan ไปยัง request แล้วดูว่า token แรกและการปิด stream เกิดเมื่อไร",
    alt: "แผนภาพ FastAPI ส่ง SSE และปิดการอ่านจากโมเดลเมื่อ stream จบ",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้โมเดลจำลองและ FAQ ภาษาไทยในเครื่อง คุมจังหวะช้าด้วย scenario",
  tools: ["FastAPI", "Uvicorn", "httpx", "Pydantic v2", "pytest"],
  bigPicture: [
    {
      node: 0,
      heading: "ลูกค้าต้องรู้ว่าระบบกำลังตอบ",
      body: "ผู้ใช้ถามเรื่องใบกำกับภาษีบนมือถือแล้วรอหน้าว่างนาน มักกดส่งซ้ำ",
      lessonNote: "ส่งข้อความเมื่อได้จากโมเดลและบอกสถานะเมื่อคำตอบขาดช่วง",
    },
    {
      node: 2,
      heading: "เลือกแหล่งคำตอบก่อนเริ่มแสดงข้อความ",
      body: "คลัง Thai Knowledge RAG มี FAQ ที่รับรองเนื้อหาและ citation ไว้แล้ว",
      lessonNote: "เมื่อ upstream ช้าก่อน token แรก ใช้คำตอบตรงคำถามจาก {{caching|cache}} พร้อมระบุที่มา",
    },
    {
      node: 4,
      heading: "ออกแบบสัญญาที่ UI และเทสต์อ่านได้",
      body: "ใช้ lifespan และ dependency injection จาก D137 แล้วเพิ่มเส้นทางสำหรับข้อมูลที่ไหลทีละส่วน",
      lessonNote: "กำหนดชนิดเฟรม {{sse}} สำหรับ token, degraded, done และ stream-error",
    },
    {
      node: 5,
      heading: "วัดเวลาถึงข้อความจริง",
      body: "HTTP 200 อาจออกไปก่อน upstream เริ่มตอบหรือก่อนเกิด timeout",
      lessonNote: "วัด {{ttft}} จาก token ที่แสดงได้ และนับ stream ที่ไม่มี done แยกจาก HTTP สำเร็จ",
    },
  ],
  objectives: [
    "สร้าง `POST /v1/query/stream` ที่ส่ง named events ผ่าน `StreamingResponse` และจบเฟรมด้วยบรรทัดว่าง",
    "กำหนด first-token, idle และ total generation budget พร้อมปิด generator เมื่อยกเลิก",
    "แยก fallback คำตอบครบ และคำตอบค้างกลางทาง แล้วทดสอบด้วย {{pytest}}",
  ],
  prerequisites: [
    "D17–D19 · ใช้ async/await, timeout และ cancellation",
    "D105–D106 · ตอบพร้อม citation และเลือกเมื่อไรควร abstain",
    "D135 และ D137 · อ่าน latency dashboard และใช้ lifespan, Pydantic, DI",
  ],
  setup: {
    intro: "ใช้โฟลเดอร์ `ai-fastapi-lab` จาก D137 ถ้าเริ่มใหม่ให้รัน `uv init ai-fastapi-lab` แล้วเข้าโฟลเดอร์ก่อน",
    commands: `uv python pin 3.12
uv add fastapi uvicorn httpx pydantic
uv add --dev pytest
uv run python --version`,
    steps: [
      ["python", "เห็น Python 3.12.x"],
      ["module", "เตรียม `stream_api.py` สำหรับขั้นที่ 1 และ 2"],
      ["terminal", "แยกเทอร์มินัลสำหรับ Uvicorn และไคลเอนต์"],
    ],
    note: "โมเดลจำลองตอบข้อความเดิมเพื่อทดสอบ protocol ใช้ `scenario` ฉีดความล้มเหลวเฉพาะในแลบ",
  },
  concepts: [
    {
      id: "sse-wire",
      title: "1 · ขอบเขตของเฟรม SSE",
      paragraphs: ["`StreamingResponse` เริ่ม HTTP response แล้วส่งข้อมูลที่ async generator yield ทีละส่วน ตั้ง media type `text/event-stream` และเว้นบรรทัดว่างหลังหนึ่ง event เพื่อให้ parser dispatch", "`event:` ตั้งชื่อ event และ `data:` คือ payload ตัวอย่าง encode JSON เพื่อ escape newline ในข้อความจริง ถ้ามีหลายบรรทัด `data:` ตัว parser จะเชื่อมค่าด้วย newline ส่วนบรรทัดขึ้นต้น `:` เป็น comment สำหรับ heartbeat ได้"],
      analogy: "เหมือนใบสั่งของที่เว้นบรรทัดก่อนเริ่มใบถัดไป ลูกค้าอ่านจบรายการก่อนแสดงผล",
      code: {
        language: "python",
        filename: "sse_format.py",
        code: `import json


def encode_token(text: str) -> str:
    payload = json.dumps({"text": text}, ensure_ascii=False)
    return f"event: token\\ndata: {payload}\\n\\n"


if __name__ == "__main__":
    print(repr(encode_token("ใบกำกับภาษี\\nฉบับย่อ")))`,
      },
      whyTitle: "ผลต่อ UI และการเชื่อมต่อ",
      whyParagraphs: ["หนึ่ง TCP chunk อาจมีหลายเฟรมหรือครึ่งเฟรม ประกอบบรรทัดและ dispatch เมื่อเจอบรรทัดว่าง", "`EventSource` เชื่อมด้วย GET และ reconnect อัตโนมัติ สำหรับ POST พร้อม JSON ใช้ `fetch` อ่าน `response.body` และ parse SSE เมื่อได้รับ `done` ให้หยุดตามสัญญา", "FastAPI มี `fastapi.sse.EventSourceResponse` สำหรับสร้าง SSE โดยตรงด้วย ในแล็บนี้เราประกอบเฟรมเองด้วย `StreamingResponse` เพื่อเห็นขอบเขต byte และจุดปิด generator"],
    },
    {
      id: "sse-budget",
      title: "2 · First token, idle และ generation deadline",
      paragraphs: ["กำหนดเวลารอข้อความแรกเพื่อลดการรอหน้าจอเปล่า เมื่อส่งข้อความแล้วใช้ idle budget คุมช่วงเงียบก่อนข้อมูลชิ้นถัดไป", "คำนวณเวลาที่เหลือจาก deadline ด้วย monotonic clock และใช้ค่าต่ำสุดของ budget ที่เกี่ยวข้อง `asyncio.timeout` แปลง cancellation ที่ตัวมันก่อเป็น `TimeoutError` เมื่อออกจาก context"],
      analogy: "นัดรับเอกสารมีทั้งเวลารอกระดาษแผ่นแรก เวลารอแผ่นถัดไป และเวลาปิดเคาน์เตอร์",
      code: {
        language: "python",
        filename: "timeout_demo.py",
        code: `import asyncio


async def main():
    deadline = asyncio.get_running_loop().time() + 0.08
    try:
        async with asyncio.timeout_at(deadline):
            await asyncio.sleep(0.5)
    except TimeoutError:
        print("first chunk exceeded budget")


if __name__ == "__main__":
    asyncio.run(main())`,
      },
      whyTitle: "จำกัดช่วง await ให้ตรงกับคอขวด",
      whyParagraphs: ["ออกจาก timeout ก่อน yield ให้ ASGI ส่งเฟรม เวลารวมนี้ใช้คุมการผลิต token และตรวจซ้ำเมื่อ generator ทำงานต่อ", "client และ reverse proxy กำหนด network timeout ของตัวเองแยกได้"],
    },
    {
      id: "sse-close",
      title: "3 · ปิด upstream เมื่อผู้ใช้หยุดฟัง",
      paragraphs: ["เมื่อปิดแท็บ connection อาจถูกตัดขณะรอโมเดลหรือขณะส่งเฟรม ใช้ `try/finally` หรือ `aclosing` กำกับ iterator ทั้งสองชั้น", "การจับ `CancelledError` แล้วเริ่ม fallback ทำให้ทรัพยากรยังทำงานแม้ผู้ใช้ไปแล้ว ปล่อยให้ cancellation ไหลออกและปิด iterator ใน context manager"],
      analogy: "คนรับสายวางโทรศัพท์แล้ว พนักงานปิดงานที่รออยู่และคืนสายให้คิวถัดไป",
      code: {
        language: "python",
        filename: "close_demo.py",
        code: `import asyncio
from contextlib import aclosing


async def upstream():
    try:
        yield "กำลังตอบ"
        await asyncio.sleep(1)
        yield "ตอบต่อ"
    finally:
        print("released upstream")


async def main():
    async with aclosing(upstream()) as tokens:
        print(await anext(tokens))


asyncio.run(main())`,
      },
      whyTitle: "คืนทรัพยากรทั้งขณะรอและขณะส่ง",
      whyParagraphs: ["ใน provider จริงวาง `async with client.stream(...)` ภายใน upstream generator เพื่อคืน connection ไปยัง pool เมื่อ iterator ปิด", "`request.is_disconnected()` มีประโยชน์ใน loop ที่ดูแล disconnect เอง ที่นี่ใช้การยกเลิกหรือ send failure ของ StreamingResponse จึงไม่เพิ่มตัวอ่าน ASGI event แข่งกัน"],
    },
    {
      id: "sse-fallback",
      title: "4 · แสดงที่มาของ fallback และสถานะ partial",
      paragraphs: ["หลังส่ง headers แล้วให้รายงานผ่าน SSE `stream-error` และหยุดโดยไม่มี `done` ผู้ใช้จึงเห็นว่าคำตอบยังไม่ครบ", "ก่อน token แรกใช้โมเดลเล็กใน budget สำรอง หรือ FAQ cache ที่ตรงคำถามและ scope ได้ ตัวอย่างส่ง cache ที่มี citation พร้อมใช้และติดป้าย `source=cache`"],
      analogy: "ถ้ายังไม่เริ่มอ่านประกาศ เปลี่ยนฉบับได้ ถ้าอ่านไปครึ่งหนึ่งแล้วให้แจ้งว่าสะดุดก่อนจบ",
      code: {
        language: "python",
        filename: "fallback_policy.py",
        code: `def choose_outcome(sent_token: bool, has_exact_faq: bool) -> str:
    if not sent_token and has_exact_faq:
        return "cache"
    return "stream-error"


assert choose_outcome(False, True) == "cache"
assert choose_outcome(True, True) == "stream-error"
assert choose_outcome(False, False) == "stream-error"`,
      },
      whyTitle: "เก็บหลักฐานการลดระดับ",
      whyParagraphs: ["เชื่อม cache จริงด้วย tenant และเวอร์ชันเอกสารตาม D107–D108 เพื่อรักษาสิทธิ์และความสดของหลักฐาน", "เก็บ source และ outcome ลง tracing จาก D133–D136 ให้ดูค่า cache rate และ stream error rate ได้"],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge — ส่ง SSE ผ่าน Next.js Route Handler",
      body: [
        "ส่งต่อ `upstream.body` ผ่าน `new Response(...)` ใน Route Handler รักษา content type และส่ง abort signal ต่อไปถึง upstream",
      ],
      table: [
        ["FastAPI `StreamingResponse`", "`Response` ที่ body เป็น `ReadableStream`"],
        ["`event: token`", "listener ชื่อ token บน GET EventSource หรือ parser จาก POST fetch"],
        ["ปิด generator", "`AbortController` และการคืน reader"],
        ["`curl -N`", "อ่านสตรีมทันทีโดยไม่รอ body สมบูรณ์"],
      ],
    },
    student: {
      title: "First-Year Note — บรรทัดว่างอยู่ตรงไหน",
      body: ["วางสอง event ติดกันในไฟล์ข้อความ ลบบรรทัดว่างระหว่างนั้น แล้วดูว่า parser ไม่มีหลักให้ตัดเฟรมตรงกลาง", "ชื่อ event บอกว่าต้องจัดการอย่างไร บรรทัดว่างบอกว่าเมื่อไรเริ่มจัดการได้"],
    },
  },
  workedExample: {
    intro: "ต่อยอดฐาน D137 เป็นสตรีมช่วยเหลือเรื่องใบกำกับภาษี วางขั้น 1 และ 2 ลง `stream_api.py` ตามลำดับ",
    steps: [
      {
        title: "1 · เตรียมโมเดลใน lifespan",
        explain: "ตั้งสัญญาคำถามและฉีดโมเดล โหมดช้าก่อนหรือหลังข้อความแรกช่วยให้ทดสอบแต่ละ branch ได้ซ้ำ",
        code: {
          language: "python",
          filename: "stream_api.py",
          code: streamModel,
        },
        output: "เมื่อเปิด lifespan จะได้ FakeThaiModel หนึ่งตัวต่อ process",
      },
      {
        title: "2 · สร้างเฟรมและต่อ endpoint",
        explain: "ต่อท้ายไฟล์เดิม จำกัดเวลารอ upstream และปิด iterator แม้ ASGI ส่งไม่สำเร็จ",
        code: {
          language: "python",
          filename: "stream_api.py",
          code: [streamEvents, streamRoute].join("\n\n\n"),
        },
        output: "คำถามว่างได้ HTTP 422 ก่อนเปิด stream ส่วนคำถามที่ผ่าน validation เริ่มด้วย event: meta",
      },
      {
        title: "3 · อ่านเฟรมจาก socket จริง",
        explain: "เปิด `uv run uvicorn stream_api:app` แล้วรันคำสั่งนี้ในเทอร์มินัล Bash อีกหน้าต่าง",
        code: {
          language: "bash",
          filename: "terminal",
          code: `curl -N http://127.0.0.1:8000/v1/query/stream \\
  -H 'Content-Type: application/json' \\
  --data '{"question":"ขอใบกำกับภาษีอย่างไร","scenario":"slow-start"}'`,
        },
        output: `event: meta
data: {"mode": "stream"}

event: degraded
data: {"reason": "upstream_timeout"}

event: token
data: {"text": "แจ้งเลขคำสั่งซื้อผ่านศูนย์ช่วยเหลือ [billing#2]"}

event: done
data: {"source": "cache"}`,
      },
    ],
    gotcha: "ถ้าใช้ PowerShell ให้บันทึก JSON เป็น UTF-8 ใน `request.json` แล้วใช้ `curl.exe -N http://127.0.0.1:8000/v1/query/stream -H 'Content-Type: application/json' --data-binary '@request.json'` ส่วน HTTPX ASGITransport เก็บ body มาตรวจทีเดียว ใช้ตรวจสัญญาเฟรม แต่ใช้ socket จริงเมื่อต้องการเห็นจังหวะส่ง",
  },
  practice: {
    intro: "ภารกิจ 12 นาที: เติมตัวประกอบเฟรมและ policy timeout/fallback ใน `stream_api.py` แล้วตรวจด้วยเทสต์",
    requirements: [
      "เปิดด้วย `meta` ส่ง `token` เป็น JSON ทีละเฟรมและคงข้อความภาษาไทย",
      "ใช้เวลาจาก deadline ตัดกับ first/idle budget แล้วปิด iterator ด้วย `aclosing`",
      "ก่อน token แรกและเจอ FAQ ตรง ให้ส่ง `degraded` → `token` → `done` พร้อม source",
      "เมื่อไม่มี cache หรือมีข้อความแล้ว ส่ง `stream-error` และจบ stream",
    ],
    starter: {
      language: "python",
      filename: "stream_api.py",
      code: [streamModel, practiceEvents, streamRoute].join("\n\n\n"),
    },
    verification: {
      language: "python",
      filename: "test_stream_api.py",
      code: `import asyncio
import json
from contextlib import aclosing

import httpx
import pytest

from stream_api import (
    FAQ_QUESTION, FakeThaiModel, ManagedStream, StreamQuery,
    answer_events, app, lifespan, sse,
)


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    # ASGITransport does not trigger startup/shutdown.
    async with lifespan(app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as session:
            yield session


def parse_frame(frame):
    event, data = frame.split("\\n")
    assert event.startswith("event: ")
    assert data.startswith("data: ")
    return event.removeprefix("event: "), json.loads(data.removeprefix("data: "))


def frames(response):
    assert response.status_code == 200
    assert response.headers["content-type"].split(";")[0] == "text/event-stream"
    assert response.text.endswith("\\n\\n")
    return [parse_frame(frame) for frame in response.text[:-2].split("\\n\\n")]


async def test_primary_stream_and_validation(client):
    result = await client.post(
        "/v1/query/stream", json={"question": f"  {FAQ_QUESTION}  "}
    )
    events = frames(result)
    assert [name for name, _ in events] == ["meta", "token", "token", "done"]
    assert "[billing#2]" in events[2][1]["text"]
    assert events[-1] == ("done", {"source": "primary"})
    bad = await client.post("/v1/query/stream", json={"question": "  "})
    assert bad.status_code == 422
    assert app.state.model.open_streams == 0


async def test_slow_start_uses_exact_cached_question_only(client):
    cached = await client.post(
        "/v1/query/stream",
        json={"question": FAQ_QUESTION, "scenario": "slow-start"},
    )
    events = frames(cached)
    assert [name for name, _ in events] == ["meta", "degraded", "token", "done"]
    assert events[-1] == ("done", {"source": "cache"})

    miss = await client.post(
        "/v1/query/stream",
        json={"question": "ขอคืนเงินอย่างไร", "scenario": "slow-start"},
    )
    assert frames(miss)[-1] == ("stream-error", {"code": "upstream_timeout"})
    assert [name for name, _ in frames(miss)] == ["meta", "stream-error"]
    assert app.state.model.open_streams == 0


async def test_slow_middle_never_splices_in_cache(client):
    partial = await client.post(
        "/v1/query/stream",
        json={"question": FAQ_QUESTION, "scenario": "slow-middle"},
    )
    assert [name for name, _ in frames(partial)] == ["meta", "token", "stream-error"]
    assert app.state.model.open_streams == 0


async def test_total_deadline_wins_over_first_token_budget():
    model = FakeThaiModel()
    query = StreamQuery(question="ขอคืนเงินอย่างไร", scenario="slow-start")
    events = [frame async for frame in answer_events(query, model, total_timeout=0.01)]
    assert parse_frame(events[-1][:-2]) == (
        "stream-error", {"code": "deadline_exceeded"}
    )
    assert model.open_streams == 0


async def test_newlines_and_thai_round_trip_in_one_frame():
    text = "ใบกำกับภาษี\\nฉบับย่อ"
    frame = sse("token", {"text": text})
    assert frame.count("\\n\\n") == 1
    assert parse_frame(frame[:-2]) == ("token", {"text": text})


async def test_closing_suspended_stream_closes_upstream():
    model = FakeThaiModel()
    query = StreamQuery(question=FAQ_QUESTION)
    async with aclosing(answer_events(query, model)) as events:
        assert (await anext(events)).startswith("event: meta")
        assert (await anext(events)).startswith("event: token")
        assert model.open_streams == 1
    assert model.open_streams == 0


async def test_socket_send_failure_closes_upstream():
    model = FakeThaiModel()
    query = StreamQuery(question=FAQ_QUESTION)
    response = ManagedStream(answer_events(query, model))

    async def send(message):
        if message.get("body", b"").startswith(b"event: token"):
            raise OSError("client closed socket")

    with pytest.raises(OSError, match="client closed socket"):
        await response.stream_response(send)
    assert model.open_streams == 0


async def test_cancel_while_waiting_for_upstream():
    model = FakeThaiModel()
    query = StreamQuery(question=FAQ_QUESTION, scenario="slow-start")
    async with aclosing(answer_events(query, model)) as events:
        assert (await anext(events)).startswith("event: meta")
        read = asyncio.create_task(anext(events))
        await asyncio.sleep(0)
        assert model.open_streams == 1
        read.cancel()
        with pytest.raises(asyncio.CancelledError):
            await read
    assert model.open_streams == 0`,
    },
    selfCheck: [
      "รันเทสต์ 8 เคส",
      "ลอง `slow-middle` กับคำถามที่มี cache และตรวจว่ามี `stream-error`",
      "กด Ctrl+C ขณะรอ curl แล้วระบุ context manager ที่ปิด upstream",
    ],
    acceptance: "เทสต์ 8 เคสผ่านและ Uvicorn แสดงลำดับ event ทั้ง normal, slow-start และ slow-middle",
    hints: [
      {
        body: "ใช้ `json.dumps(payload, ensure_ascii=False)` และ newline สองตัวท้ายข้อมูล",
      },
      {
        body: "ดัก `TimeoutError` นอก context และใช้ `sent_token` ตัดสินว่า cache ยังใช้ได้หรือไม่",
      },
      {
        body: "คัดลอกเฉลยไฟล์ `stream_api.py` แล้วใช้ชุด pytest `test_stream_api.py` ในช่องตรวจผลด้านบน",
        code: {
          language: "python",
          filename: "stream_api.py",
          code: [streamModel, streamEvents, streamRoute].join("\n\n\n"),
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q test_stream_api.py
uv run uvicorn stream_api:app --host 127.0.0.1 --port 8000`,
    },
  },
  mistakes: [
    {
      title: "ขาดบรรทัดว่าง",
      symptom: "curl เห็นข้อความแต่ listener ยังรอ",
      fix: "เติม newline สองตัวท้ายเฟรม",
    },
    {
      title: "ครอบ yield ด้วย upstream timeout",
      symptom: "timer ยังเดินระหว่าง ASGI ส่ง",
      fix: "ครอบเฉพาะ `await anext(tokens)`",
    },
    {
      title: "กลืน cancellation",
      symptom: "โมเดลค้างหลังปิดแท็บ",
      fix: "ปล่อย cancellation ออกและ cleanup iterator",
    },
    {
      title: "คืน HTTP 504 หลังเริ่ม stream",
      symptom: "headers ออกไปแล้ว",
      fix: "ส่ง `stream-error` และนับผลลัพธ์จาก event",
    },
  ],
  quiz: {
    questions: [
      mc(
        "d138-q1",
        "อะไรทำให้ parser dispatch `token`?",
        [
          ["บรรทัดว่างหลังฟิลด์", "ใช่ เป็นตัวแบ่ง event"],
          ["ชื่อ event", "ใช้เลือก listener"],
          ["TCP packet ใหม่", "packet แบ่งได้ทุกตำแหน่ง"],
          ["HTTP body ปิด", "รอปิดจะเสีย streaming"],
        ],
        "A",
        "SSE dispatch เมื่ออ่านบรรทัดว่าง",
        "SSE ตัดเฟรมด้วยอะไร?",
        "บรรทัดว่าง",
      ),
      mc(
        "d138-q2",
        "ได้ token แรกแล้ว แต่ upstream หมดเวลาและมี cache ทำอย่างไร?",
        [
          ["ต่อ cache", "ข้อความสองแหล่งอาจขัดกัน"],
          ["ส่ง done", "ข้อความไม่ครบ"],
          ["ส่ง stream-error แล้วจบ", "ใช่ UI แสดง partial ได้"],
          ["เปลี่ยน status เป็น 504", "headers ออกไปแล้ว"],
        ],
        "C",
        "terminal event ระบุว่าคำตอบจบไม่สมบูรณ์",
        "ทำไมไม่เติม cache กลางทาง?",
        "ข้อความและหลักฐานอาจขัดกัน",
      ),
      mc(
        "d138-q3",
        "จับ TimeoutError ของ asyncio.timeout ตรงไหน?",
        [
          ["ใน lifespan", "เป็นเหตุการณ์ราย request"],
          ["นอก timeout context", "ใช่ exception แปลงตอนออกจาก context"],
          ["ใน context ก่อน await", "ยังอยู่ในขอบเขตการยกเลิก"],
          ["ดัก BaseException", "จะกลืน cancellation"],
        ],
        "B",
        "ให้ context แปลง cancellation ก่อนเข้า error branch",
        "TimeoutError จาก context เห็นที่ใด?",
        "นอก `async with asyncio.timeout`",
      ),
      mc(
        "d138-q4",
        "วัด TTFT จริงที่จุดใด?",
        [
          ["ได้ HTTP 200", "เป็นแค่ headers"],
          ["ได้ meta", "ไม่มีเนื้อหาคำตอบ"],
          ["ได้รับ body ครบ", "เป็น completion"],
          ["ได้ token frame ที่มีข้อความผ่าน socket จริง", "ใช่ client เริ่มแสดงผลได้"],
        ],
        "D",
        "จับเวลาเริ่ม request ถึง token ที่ประกอบเฟรมครบ",
        "TTFT เริ่มและจบตรงไหน?",
        "เริ่มส่ง request จนได้ token แรกที่แสดงได้",
      ),
    ],
  },
  takeaways: [
    "HTTP 200 เปิดช่องสื่อสาร ส่วน `done` และ `stream-error` บอกผลคำตอบ",
    "จำกัด first-token wait, idle wait และ generation deadline พร้อมปิด upstream",
    "ใช้ cache ที่ตรง scope และคำถามก่อนเริ่มส่งคำตอบ พร้อมเผยที่มา",
    "เก็บ endpoint นี้ไว้ใช้ทดสอบโหลด D140 ส่วน ingestion ออกจาก request path ใน D139",
  ],
  reviewCards: [
    rc(
      "d138-rc-1",
      "ทำไม route POST ใช้ fetch?",
      "EventSource เชื่อมด้วย GET ส่วน fetch ส่ง JSON body ได้",
    ),
    rc(
      "d138-rc-2",
      "บอก timeout หลังเปิด stream อย่างไร?",
      "ส่ง stream-error แล้วจบโดยไม่มี done",
    ),
    rc(
      "d138-rc-3",
      "aclosing ทำอะไร?",
      "เรียก aclose เพื่อให้ cleanup ของ generator ทำงาน",
    ),
  ],
  sources: [
    {
      label: "FastAPI — StreamingResponse",
      href: "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse",
    },
    {
      label: "HTML Standard — Server-sent events",
      href: "https://html.spec.whatwg.org/multipage/server-sent-events.html",
    },
    {
      label: "Python 3.12 — asyncio timeouts",
      href: "https://docs.python.org/3.12/library/asyncio-task.html#timeouts",
    },
    {
      label: "FastAPI — Server-Sent Events",
      href: "https://fastapi.tiangolo.com/tutorial/server-sent-events/",
    },
    {
      label: "HTTPX — ASGI Transport",
      href: "https://www.python-httpx.org/advanced/transports/#asgi-transport",
    },
    {
      label: "HTTPX — Streaming Responses",
      href: "https://www.python-httpx.org/async/#streaming-responses",
    },
  ],
  glossary: ["fastapi", "sse", "asyncio", "httpx", "pydantic", "pytest", "caching", "ttft"],
});
