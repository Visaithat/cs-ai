import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D137 — Phase 5 / Block B35
 * Production AI API with FastAPI (Async Lifespan, Dependency Injection)
 */
export const d137: Lesson = defineLesson({
  day: 137,
  titleTh: "สร้าง AI API ระดับ Production ด้วย FastAPI (Async Lifespan และ Dependency Injection)",
  tagline: "30 นาที · โหลดทรัพยากรครั้งเดียวตอนสตาร์ต แยก dependency ให้เทสต์ง่าย และเตรียมพร้อมรับโหลดพร้อมกัน",
  icon: "zap",
  visual: {
    id: "fastapi-sse",
    title: "FastAPI Lifespan + Dependency Injection & SSE Streaming",
    caption: "กดดูวงจรชีวิตของ API: โหลดโมเดลและ HTTP pool ครั้งเดียวตอนสตาร์ต แล้วสตรีมคำตอบให้หลายผู้ใช้พร้อมกัน",
    alt: "แผนภาพ FastAPI Async Lifespan และสตรีม SSE",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ไม่ต้องใช้ API key",
  tools: ["FastAPI", "Uvicorn", "httpx", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "เชื่อมต่อโมเดลและ HTTP pool อย่างคุ้มค่า",
      body: "ทุกครั้งที่เรียก LLM API หรือ Embedding model มีต้นทุนการเปิด connection (TLS handshake) หรือโหลด weights เข้า RAM",
      lessonNote: "`lifespan` ของ {{fastapi}} เปิด `{{httpx|httpx.AsyncClient}}` และทรัพยากรหนักครั้งเดียวตอนบูต แล้วแชร์ใช้ซ้ำข้ามทุก request",
    },
    {
      node: 4,
      heading: "เปลี่ยนสคริปต์ AI ให้เป็น Web Service ที่พร้อมใช้งานจริง",
      body: "โค้ดที่รันในโน้ตบุ๊กหรือ CLI ยังรับผู้ใช้พร้อมกันหลายสิบคนไม่ได้ ต้องห่อด้วย HTTP API ที่มีสัญญาข้อมูลชัดเจนและไม่บล็อก event loop",
      lessonNote: "รวม {{pydantic}} request/response contracts + {{asyncio}} + `Depends(...)` ให้รองรับทั้ง JSON endpoint และต่อยอดเป็น {{sse}} streaming ใน D138",
    },
    {
      node: 5,
      heading: "เช็กความพร้อมก่อนส่งทราฟฟิกจริงด้วย /healthz และ /readyz",
      body: "Load balancer และแพลตฟอร์มคลาวด์ต้องรู้ว่าเซิร์ฟเวอร์แค่เปิดพอร์ตติด หรือโหลดโมเดล/connection เสร็จพร้อมรับคำขอจริงแล้ว",
      lessonNote: "แยก liveness (`/healthz`) ออกจาก readiness (`/readyz`) ที่ตรวจสถานะจาก `app.state` เพื่อกันคำขอแรกพังระหว่างสตาร์ต",
    },
    {
      node: 6,
      heading: "ทดสอบ API ได้เร็วและเสถียรทุกครั้งที่แก้โค้ด",
      body: "ถ้า endpoint ผูกตายกับตัวแปร global หรือยิง LLM API จริงตอนเทสต์ ทีมจะไม่อยากรันเทสต์เพราะช้าและเสียเงิน",
      lessonNote: "`app.dependency_overrides` ร่วมกับ {{pytest}} และ {{mocking}} ทำให้ทดสอบ route ทั้งหมดในไม่กี่มิลลิวินาทีโดยไม่ต่อเน็ต",
    },
  ],

  objectives: [
    "**จัดการวงจรชีวิตทรัพยากร** ของ AI Microservice ด้วย `@asynccontextmanager` `lifespan` ใน {{fastapi}} เพื่อโหลด client/model ครั้งเดียวตอนสตาร์ตและปิดสะอาดตอน shutdown",
    "**ออกแบบ Dependency Injection** ด้วย `Depends(...)` และ `app.dependency_overrides` เพื่อให้แยกธุรกิจหลักออกจากโครงสร้างพื้นฐานและทำ {{mocking}} ใน {{pytest}} ได้ทันที",
    "**สร้างสัญญาข้อมูลและจุดตรวจสุขภาพ** (`Pydantic` request/response models, `/healthz`, `/readyz`) ที่พร้อมรับทราฟฟิกจริงและต่อยอดสู่ {{sse}} streaming",
  ],

  prerequisites: [
    "เข้าใจ event loop, `async/await` และ `httpx.AsyncClient` (Phase 1: D13, D17–D19)",
    "ออกแบบ `Pydantic v2` `BaseModel` และ validator ได้คล่อง (D1–D3)",
    "เขียน unit test และ mock ด้วย `pytest` ได้ (D9–D10)",
    "เข้าใจพื้นฐาน HTTP status codes (`200`, `422`, `503`)",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-fastapi-lab` ด้วย `uv` ติดตั้ง `fastapi`, `uvicorn` และ `httpx` (จำเป็นสำหรับ `TestClient` ด้วย) ทั้งหมดรันบนเครื่องได้ 100%",
    commands: `uv init ai-fastapi-lab && cd ai-fastapi-lab
uv add fastapi uvicorn httpx pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-fastapi-lab` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `fastapi`, `uvicorn`, `httpx`, `pydantic` และ dev tools สำเร็จ"],
      ["check", "รัน `uv run python -c \"import fastapi; print(fastapi.__version__)\"` แล้วเห็นเลขเวอร์ชัน"],
    ],
    note: "อย่าลืมติดตั้ง `httpx` เพราะ `fastapi.testclient.TestClient` ใช้งาน `httpx` อยู่เบื้องหลัง (ถ้าลืมจะขึ้น error ตอน import TestClient)",
  },

  concepts: [
    {
      id: "async-lifespan",
      title: "1 · Async Lifespan — โหลดทรัพยากรหนักครั้งเดียวตอนสตาร์ต",
      paragraphs: [
        "ความผิดพลาดยอดฮิตตอนย้ายโค้ด AI มาเป็น API คือการสร้าง `httpx.AsyncClient()`, เปิด DB pool หรือโหลด embedding model ใหม่ทุกครั้งที่มี request เข้ามา ผลคือ {{ttft}} พุ่งสูง RAM บวม และเกิด socket exhaustion เมื่อมีผู้ใช้พร้อมกันไม่กี่สิบคน",
        "ใน {{fastapi}} สมัยใหม่ เราใช้ `@asynccontextmanager async def lifespan(app: FastAPI)` (แทน `@app.on_event(\"startup\")` ที่ถูก deprecated แล้ว) โค้ด **ก่อน `yield`** รันครั้งเดียวตอนบูตเพื่อเก็บทรัพยากรลง `app.state` และโค้ด **หลัง `yield`** รันตอนปิดเซิร์ฟเวอร์เพื่อคืน connection อย่างปลอดภัย",
      ],
      analogy: "เหมือนเปิดเตาและตั้งหม้อน้ำซุปครั้งเดียวตอนเปิดร้านตอนเช้า (`startup`) ใช้เสิร์ฟลูกค้าทั้งวัน แล้วค่อยปิดแก๊สล้างครัวตอนปิดร้าน (`shutdown`) — ไม่ใช่จุดเตาใหม่ทุกจานที่มีลูกค้าสั่ง",
      code: {
        language: "python",
        filename: "lifespan_pattern.py",
        code: `from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: เปิด HTTP connection pool ครั้งเดียว
    app.state.http_client = httpx.AsyncClient(timeout=httpx.Timeout(10.0))
    app.state.ready = True
    try:
        yield
    finally:
        # Shutdown: ปิด connection pool อย่างสะอาดเสมอแม้เกิด error
        app.state.ready = False
        await app.state.http_client.aclose()


app = FastAPI(title="Thai Support AI API", lifespan=lifespan)`,
        caption: "ใส่ `try ... finally` ครอบ `yield` เพื่อให้มั่นใจว่าทรัพยากรจะถูกปิดเสมอตอน shutdown",
      },
      whyTitle: "Why this matters — เสถียรภาพภายใต้ Concurrent Traffic",
      whyParagraphs: [
        "เมื่อแชร์ `httpx.AsyncClient` ผ่าน `app.state` การเรียก LLM API และ Vector DB จะ reuse TCP/TLS connection เดิม ลด latency ไปได้หลายสิบถึงหลายร้อยมิลลิวินาทีต่อ request และลดความเสี่ยงที่ระบบล่มจาก `Too many open files`",
        "นอกจากนี้การผูก `app.state.ready` เข้ากับ `lifespan` ทำให้แพลตฟอร์มอย่าง Cloud Run หรือ Kubernetes รอจนกว่าโมเดลจะโหลดเสร็จจริงก่อนส่งทราฟฟิกลูกค้าเข้ามา",
      ],
    },
    {
      id: "dependency-injection",
      title: "2 · Dependency Injection ด้วย Depends(...) เพื่อให้โค้ดสะอาดและเทสต์ง่าย",
      paragraphs: [
        "แทนที่จะให้ route handler อ้างตัวแปร global หรือสร้าง LLM client เองตรง ๆ {{fastapi}} มีระบบ **Dependency Injection (`Depends`)** ที่ส่งบริการเข้าไปให้ endpoint ผ่านพารามิเตอร์ฟังก์ชันอย่างเป็นระเบียบ",
        "พลังที่แท้จริงของ `Depends` ปรากฏตอนเขียนเทสต์ด้วย {{pytest}}: เราสามารถสั่ง `app.dependency_overrides[get_llm_service] = lambda: FakeLLMService()` เพื่อสลับบริการจริงเป็นตัวจำลอง ({{mocking}}) ได้โดยไม่ต้องแตะโค้ด production หรือใช้ `monkeypatch` ที่เปราะบาง",
      ],
      analogy: "เหมือนปลั๊กไฟมาตรฐานในห้องครัว: ปกติเสียบเครื่องปั่นของจริง แต่ตอนซ้อมระบบก็ถอดออกแล้วเสียบเครื่องจำลองแทนได้ทันทีโดยไม่ต้องรื้อสายไฟในผนัง",
      bullets: [
        "**อ่านจาก `request.app.state`** — เขียนฟังก์ชันผู้ให้บริการ เช่น `def get_engine(request: Request) -> QAEngine` แล้วส่งเข้า route ด้วย `engine: Annotated[QAEngine, Depends(get_engine)]`",
        "**อย่าบล็อก Event Loop** — ใน `async def` endpoint ให้ใช้เฉพาะ I/O แบบ async (`await httpx...`, `await db...`) ห้ามใส่ `time.sleep()` หรือ `requests.get()` เพราะจะแช่แข็งผู้ใช้ทุกคนที่ต่ออยู่กับ worker เดียวกัน",
        "**คืนค่า override หลังเทสต์เสมอ** — ใช้ `try ... finally: app.dependency_overrides.clear()` เพื่อไม่ให้ mock รั่วไปกระทบ test case ถัดไป",
      ],
      whyTitle: "Why this matters — แยก Business Logic ออกจาก Vendor",
      whyParagraphs: [
        "ในระบบ AI จริง คุณอาจต้องสลับจาก OpenAI ไป Anthropic หรือ Local Ollama หรือใส่ชั้น caching/PDPA guardrail คั่นกลาง ถ้า route พึ่งพา Protocol/Interface ผ่าน `Depends` การสลับผู้ให้บริการจะแก้แค่จุดเดียวใน `lifespan`",
        "ขณะเดียวกัน CI pipeline สามารถรัน integration tests ของ API ทุกเส้นได้ในเวลาไม่ถึง 1 วินาที โดยไม่ต้องใส่ API key ลับไว้ในทุก job",
      ],
    },
    {
      id: "contracts-and-health",
      title: "3 · สัญญาข้อมูล Pydantic, /healthz vs /readyz และเส้นทางสู่ SSE",
      paragraphs: [
        "ทุก endpoint ของ AI API ควรใช้ {{pydantic}} ทั้งขาเข้า (Request body) และขาออก (`response_model`) เพื่อบังคับ input bounding (เช่น จำกัดความยาวคำถามและ `max_tokens`) และรับประกันว่า response จะไม่เผลอรั่วฟิลด์ภายในออกไปให้ client",
        "สำหรับระบบ production ควรแยกจุดตรวจสุขภาพเป็น 2 เส้นเสมอ: `GET /healthz` (**Liveness** — ตอบ `200 OK` ทันทีถ้าโปรเซสยังทำงาน) และ `GET /readyz` (**Readiness** — ตรวจว่า `app.state.ready` และ client พร้อมจริงหรือไม่ ถ้ายังไม่พร้อมตอบ `503 Service Unavailable`)",
      ],
      analogy: "`/healthz` คือถามว่า \"พนักงานมาถึงร้านหรือยัง\" ส่วน `/readyz` คือถามว่า \"เปิดเตาเตรียมวัตถุดิบพร้อมรับออเดอร์แรกหรือยัง\"",
      bullets: [
        "**422 Unprocessable Entity อัตโนมัติ** — เมื่อผู้ใช้ส่ง `query` ว่างหรือ `top_k=999` FastAPI + Pydantic จะปฏิเสธตั้งแต่หน้าประตูก่อนเสียเงินเรียก LLM",
        "**OpenAPI Docs ฟรี** — ทุก schema ที่ประกาศด้วย Pydantic จะสร้างหน้า `/docs` (Swagger UI) ให้ทีม Frontend และ QA ทดลองยิงได้ทันที",
        "**ปูทางสู่ D138 (SSE)** — โครงสร้าง `lifespan` + `Depends` เดียวกันนี้คือฐานที่วันพรุ่งนี้เราจะต่อ `StreamingResponse(..., media_type=\"text/event-stream\")` เพื่อลด {{ttft}} ให้ผู้ใช้เห็นคำตอบไหลทีละคำ",
      ],
      whyTitle: "Why this matters — พร้อมขึ้น Docker และ Cloud โดยไม่รื้อโค้ด",
      whyParagraphs: [
        "เมื่อเข้าสู่ Block B36 (Dockerfile & Cloud Run) แพลตฟอร์มจะยิง probe มาที่ `/healthz` และ `/readyz` อัตโนมัติตอน rolling deploy หากไม่มี readiness check คำขอแรกระหว่างที่เซิร์ฟเวอร์กำลังบูตจะล้มด้วย `500 Internal Server Error`",
        "การวางโครงสร้าง API ให้สะอาดตั้งแต่ D137 ทำให้ D138 (SSE), D141 (Docker) และ D151 (PDPA Middleware) เสียบต่อกันได้เหมือนต่อเลโก้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — FastAPI ≈ Express / Hono + Zod + NestJS DI",
      body: [
        "หากคุณเคยเขียน Node/TypeScript backend มาก่อน โครงสร้างของ FastAPI จะคุ้นมือมาก เพียงเปลี่ยนเครื่องมือเป็นฝั่ง Python:",
      ],
      table: [
        ["FastAPI + Uvicorn", "Hono / Express / Fastify บน Node/Bun"],
        ["Pydantic request & response_model", "Zod validation middleware + OpenAPI generator"],
        ["@asynccontextmanager lifespan", "server bootstrap + graceful SIGTERM shutdown hook"],
        ["Depends(...) & dependency_overrides", "NestJS DI container / testing module providers"],
        ["GET /healthz & /readyz", "Kubernetes / Cloud Run liveness & readiness probes"],
      ],
    },
    student: {
      title: "First-Year Note — app.state กับตัวแปร global ต่างกันอย่างไร?",
      body: [
        "หลายคนสงสัยว่าทำไมไม่ประกาศ `client = httpx.AsyncClient()` ไว้บนสุดของไฟล์เลย? เหตุผลคือตอน import ไฟล์ event loop ของเซิร์ฟเวอร์ยังไม่เริ่มทำงาน และไม่มีจุดปิด connection ตอนจบโปรแกรม",
        "การสร้างใน `lifespan` แล้วเก็บไว้ใน `app.state` ทำให้มั่นใจว่าทรัพยากรถูกสร้างเมื่อเซิร์ฟเวอร์เริ่มทำงานจริง และถูกปิดคืนหน่วยความจำทุกครั้งที่ปิดเซิร์ฟเวอร์หรือจบ test",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: สร้าง AI Support API ขนาดกะทัดรัดที่มี `lifespan` จัดการ `httpx.AsyncClient`, ใช้ `Depends` ฉีด service, มี `/readyz` และทดสอบครบทั้งเส้นทางด้วย `TestClient` โดยไม่ต้องต่อเน็ต",
    steps: [
      {
        title: "1 · สร้าง Service, Lifespan และ Pydantic Contracts",
        explain:
          "แยกชั้น `SupportAIEngine` ที่รับ `httpx.AsyncClient` เข้ามา แล้วให้ `lifespan` สร้างและปิด client ให้เรียบร้อย",
        code: {
          language: "python",
          filename: "app_worked.py",
          code: `from contextlib import asynccontextmanager
from typing import Annotated, Protocol
import httpx
from fastapi import Depends, FastAPI, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field


class AskRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    query: str = Field(min_length=3, max_length=300)
    top_k: int = Field(default=3, ge=1, le=10)


class AskResponse(BaseModel):
    answer: str
    sources: list[str]
    model: str


class AIEngine(Protocol):
    async def answer(self, query: str, top_k: int) -> AskResponse: ...


class DefaultAIEngine:
    def __init__(self, client: httpx.AsyncClient, model_name: str = "thai-rag-v1") -> None:
        self._client = client
        self._model_name = model_name

    async def answer(self, query: str, top_k: int) -> AskResponse:
        # ในระบบจริงจะใช้ self._client เรียก LLM/Retrieval API แบบ async
        return AskResponse(
            answer=f"สรุปคำตอบสำหรับ: {query}",
            sources=[f"policy#chunk-{i}" for i in range(1, top_k + 1)],
            model=self._model_name,
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = httpx.AsyncClient(timeout=10.0)
    app.state.http_client = client
    app.state.engine = DefaultAIEngine(client)
    app.state.ready = True
    try:
        yield
    finally:
        app.state.ready = False
        await client.aclose()


app = FastAPI(title="Neural Path AI API", lifespan=lifespan)`,
        },
        output: `# โมเดล Lifespan และ AIEngine Protocol พร้อมเชื่อมต่อกับ routes ในขั้นถัดไป`,
      },
      {
        title: "2 · ผูก Dependency Injection กับ Endpoints และ /readyz",
        explain:
          "route `POST /v1/ask` ไม่รู้จัก `app.state` โดยตรง แต่ขอ `engine` ผ่าน `Depends(get_engine)` ส่วน `/readyz` คืน `503` หาก `ready` ยังไม่เป็น `True`",
        code: {
          language: "python",
          filename: "app_worked.py",
          code: `def get_engine(request: Request) -> AIEngine:
    engine = getattr(request.app.state, "engine", None)
    if engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI engine not initialized",
        )
    return engine


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readyz")
async def readyz(request: Request) -> dict[str, bool]:
    if not getattr(request.app.state, "ready", False):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not ready",
        )
    return {"ready": True}


@app.post("/v1/ask", response_model=AskResponse)
async def ask(
    body: AskRequest,
    engine: Annotated[AIEngine, Depends(get_engine)],
) -> AskResponse:
    return await engine.answer(body.query, body.top_k)`,
        },
        output: `# ลองรันจริงได้ด้วย: uv run uvicorn app_worked:app --reload
# แล้วเปิดดู Swagger UI ที่ http://127.0.0.1:8000/docs`,
      },
      {
        title: "3 · ทดสอบด้วย TestClient (เปิด Lifespan) และ Dependency Override",
        explain:
          "สังเกตการใช้ `with TestClient(app) as client:` เพื่อกระตุ้นให้ `lifespan` ทำงานจริง และใช้ `dependency_overrides` สลับเป็น Fake Engine ตอนเทสต์",
        code: {
          language: "python",
          filename: "test_app_worked.py",
          code: `from fastapi.testclient import TestClient
from app_worked import AskResponse, app, get_engine


class FakeEngine:
    async def answer(self, query: str, top_k: int) -> AskResponse:
        return AskResponse(answer=f"MOCK: {query}", sources=["mock#1"], model="fake")


with TestClient(app) as client:
    print("readyz:", client.get("/readyz").status_code, client.get("/readyz").json())

    # Override dependency เพื่อเทสต์โดยไม่แตะ engine จริง
    app.dependency_overrides[get_engine] = lambda: FakeEngine()
    try:
        res = client.post("/v1/ask", json={"query": "  ขอเช็กนโยบายคืนเงิน  ", "top_k": 2})
        print("ask 200:", res.status_code, res.json())
        bad = client.post("/v1/ask", json={"query": "  ", "top_k": 50})
        print("ask 422:", bad.status_code)
    finally:
        app.dependency_overrides.clear()`,
        },
        output: `readyz: 200 {'ready': True}
ask 200: 200 {'answer': 'MOCK: ขอเช็กนโยบายคืนเงิน', 'sources': ['mock#1'], 'model': 'fake'}
ask 422: 422`,
      },
    ],
    gotcha:
      "จุดสังเกตสำคัญ: ถ้าเขียน `client = TestClient(app)` เฉย ๆ **โดยไม่ใช้ `with TestClient(app) as client:`** FastAPI จะไม่รัน `lifespan` เลย ทำให้ `app.state.ready` และ `app.state.http_client` ไม่ถูกสร้างและ `/readyz` จะคืน 503 ทันที!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้าง Production AI Microservice ในไฟล์ `ai_service.py` ที่จัดการ `lifespan`, มี `/healthz`, `/readyz`, `POST /v1/query` และรองรับ Dependency Injection สำหรับการทดสอบ",
    requirements: [
      "สร้าง Pydantic model `QueryRequest` (ตัดช่องว่างหัวท้ายอัตโนมัติ): `question: str` (ยาว 3–400 ตัวอักษร), `top_k: int` (ค่าเริ่มต้น `3`, ช่วง `1..10`) และ `QueryResponse`: `answer: str`, `citations: list[str]`, `latency_ms: int` (`ge=0`)",
      "เขียน `@asynccontextmanager async def lifespan(app: FastAPI)` ที่สร้าง `app.state.http_client = httpx.AsyncClient(timeout=5.0)`, `app.state.qa_service = LocalQAService(app.state.http_client)` และ `app.state.ready = True` โดยปิด `http_client` และตั้ง `ready = False` ในบล็อก `finally`",
      "สร้างฟังก์ชัน `get_qa_service(request: Request)` สำหรับใช้กับ `Depends(...)` เพื่อดึง `request.app.state.qa_service` (ถ้าไม่มีให้คืน HTTP `503`)",
      "สร้าง endpoints: `GET /healthz` คืน `{\"status\": \"ok\"}`, `GET /readyz` คืน `{\"ready\": True}` (หรือ `503` ถ้าไม่พร้อม) และ `POST /v1/query` ที่รับ `QueryRequest` และ `service = Depends(get_qa_service)` แล้วคืน `QueryResponse`",
    ],
    starter: {
      language: "python",
      filename: "ai_service.py",
      code: `from contextlib import asynccontextmanager
from typing import Annotated, Protocol
import httpx
from fastapi import Depends, FastAPI, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field


class QueryRequest(BaseModel):
    # TODO: กำหนด str_strip_whitespace=True, question (3..400), top_k (default=3, 1..10)
    pass


class QueryResponse(BaseModel):
    # TODO: กำหนด answer, citations, latency_ms (>=0)
    pass


class QAServiceProtocol(Protocol):
    async def run(self, question: str, top_k: int) -> QueryResponse: ...


class LocalQAService:
    def __init__(self, http_client: httpx.AsyncClient) -> None:
        self.http_client = http_client

    async def run(self, question: str, top_k: int) -> QueryResponse:
        return QueryResponse(
            answer=f"คำตอบเบื้องต้น: {question}",
            citations=[f"doc#{i}" for i in range(1, top_k + 1)],
            latency_ms=12,
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # TODO: สร้าง http_client, qa_service และ ready=True แล้วปิดอย่างสะอาดใน finally
    yield


app = FastAPI(title="Production AI Service", lifespan=lifespan)


def get_qa_service(request: Request) -> QAServiceProtocol:
    # TODO: คืน request.app.state.qa_service หรือ raise HTTPException 503
    raise NotImplementedError


# TODO: สร้าง routes GET /healthz, GET /readyz และ POST /v1/query
`,
    },
    verification: {
      language: "python",
      filename: "test_ai_service.py",
      code: `from fastapi.testclient import TestClient
from ai_service import QueryResponse, app, get_qa_service


class StubQAService:
    async def run(self, question: str, top_k: int) -> QueryResponse:
        return QueryResponse(
            answer=f"STUB:{question}:{top_k}",
            citations=["kb#99"],
            latency_ms=1,
        )


def test_lifespan_sets_ready_and_closes_client():
    with TestClient(app) as client:
        assert client.get("/healthz").json() == {"status": "ok"}
        res = client.get("/readyz")
        assert res.status_code == 200
        assert res.json() == {"ready": True}
        assert app.state.http_client.is_closed is False

    # หลังออกจาก context manager lifespan shutdown ต้องปิด client และปรับ ready=False
    assert app.state.ready is False
    assert app.state.http_client.is_closed is True


def test_query_with_dependency_override_and_stripping():
    with TestClient(app) as client:
        app.dependency_overrides[get_qa_service] = lambda: StubQAService()
        try:
            res = client.post("/v1/query", json={"question": "  วิธีออกใบกำกับภาษี  ", "top_k": 4})
            assert res.status_code == 200
            data = res.json()
            assert data["answer"] == "STUB:วิธีออกใบกำกับภาษี:4"
            assert data["citations"] == ["kb#99"]
            assert data["latency_ms"] == 1
        finally:
            app.dependency_overrides.clear()


def test_reject_invalid_payload():
    with TestClient(app) as client:
        res_empty = client.post("/v1/query", json={"question": "   "})
        assert res_empty.status_code == 422

        res_oob = client.post("/v1/query", json={"question": "ทดสอบคำถาม", "top_k": 99})
        assert res_oob.status_code == 422


def test_readyz_returns_503_when_not_ready():
    with TestClient(app) as client:
        app.state.ready = False
        res = client.get("/readyz")
        assert res.status_code == 503
`,
    },
    selfCheck: [
      "`lifespan` ปิด `httpx.AsyncClient` ในบล็อก `finally` จน `app.state.http_client.is_closed` เป็น `True` หลัง shutdown",
      "`QueryRequest` ตัดช่องว่างหัวท้ายและปฏิเสธคำถามว่าง (`\"   \"`) หรือ `top_k=99` ด้วย HTTP `422`",
      "`/readyz` ตรวจจาก `app.state.ready` และคืน `503` เมื่อยังไม่พร้อม",
      "`POST /v1/query` รับ service ผ่าน `Depends(get_qa_service)` ทำให้ override ด้วย `StubQAService` ได้สำเร็จ",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านครบทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ใน `test_ai_service.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ตั้ง `model_config = ConfigDict(str_strip_whitespace=True)` ใน `QueryRequest` เพื่อให้ Pydantic ตัดช่องว่างก่อนตรวจ `min_length=3` และใช้ `try: yield finally:` ใน `lifespan` เพื่อรับประกันว่า `await client.aclose()` จะถูกรันตอนปิดแอป",
      },
      {
        body: "ใช้ `getattr(request.app.state, \"qa_service\", None)` ใน `get_qa_service` และ `getattr(request.app.state, \"ready\", False)` ใน `/readyz` หากไม่พร้อมให้ `raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=...)`",
      },
      {
        body: "โครงของ Pydantic models และ `lifespan` พร้อมแล้ว — เติม `get_qa_service` และ 3 routes (`/healthz`, `/readyz`, `/v1/query`) ให้ครบ",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `class QueryRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    question: str = Field(min_length=3, max_length=400)
    top_k: int = Field(default=3, ge=1, le=10)


class QueryResponse(BaseModel):
    answer: str
    citations: list[str]
    latency_ms: int = Field(ge=0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = httpx.AsyncClient(timeout=5.0)
    app.state.http_client = client
    app.state.qa_service = LocalQAService(client)
    app.state.ready = True
    try:
        yield
    finally:
        app.state.ready = False
        await client.aclose()`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# วาง ai_service.py และ test_ai_service.py ในโฟลเดอร์ ai-fastapi-lab/
uv run pytest -q
uv run ruff check .
# ทดลองรันเซิร์ฟเวอร์จริง:
uv run uvicorn ai_service:app --reload`,
      caption: "เปิดเบราว์เซอร์ไปที่ `http://127.0.0.1:8000/docs` เพื่อลองยิง API ผ่าน Swagger UI",
    },
  },

  mistakes: [
    {
      title: "สร้าง httpx.AsyncClient หรือโหลดโมเดลใหม่ทุก Request",
      symptom: "API ช้ามากตอนมีผู้ใช้พร้อมกัน RAM เพิ่มไม่หยุด และเกิด `Too many open files` เมื่อรันไปสักพัก",
      fix: "ย้ายการสร้าง HTTP client, DB pool และโมเดลไปไว้ใน `@asynccontextmanager` `lifespan` แล้วแชร์ผ่าน `app.state` + `Depends`",
    },
    {
      title: "ใส่ Blocking Call (เช่น requests.get / time.sleep) ใน async def Route",
      symptom: "เมื่อมีผู้ใช้ 1 คนยิงคำถามที่รอ LLM 5 วินาที ผู้ใช้อีก 20 คนรวมถึง `/healthz` ค้างรอทั้งหมดจน timeout",
      fix: "ใน `async def` ต้องใช้ไลบรารี async (`httpx.AsyncClient`) เท่านั้น หรือถ้าจำเป็นต้องเรียกฟังก์ชัน sync ที่แก้ไม่ได้ให้ประกาศ route เป็น `def` ธรรมดา หรือรันผ่าน `asyncio.to_thread(...)`",
    },
    {
      title: "ใช้ TestClient(app) โดยไม่เปิด Context Manager",
      symptom: "รันเทสต์แล้วเจอ `AttributeError: 'State' object has no attribute 'engine'` หรือ `/readyz` คืน `503` ทั้งที่โค้ดถูก",
      fix: "เขียน `with TestClient(app) as client:` เสมอ เพื่อให้ Starlette/FastAPI เรียก startup และ shutdown ของ `lifespan`",
    },
    {
      title: "ลืมล้าง app.dependency_overrides หลังจบเทสต์",
      symptom: "เทสต์ไฟล์ที่ 1 ผ่าน แต่เทสต์ไฟล์ที่ 2 ดันได้ค่า mock จากไฟล์ที่ 1 ติดมาด้วยแบบงง ๆ",
      fix: "วาง `app.dependency_overrides.clear()` ใน `finally` หรือใน pytest fixture ที่ทำ cleanup อัตโนมัติหลัง `yield`",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d137-q1",
        "ทำไม Production AI API จึงควรสร้าง `httpx.AsyncClient` ใน FastAPI `lifespan` แทนการสร้างใหม่ในแต่ละ endpoint?",
        [
          ["เพราะ FastAPI ห้ามสร้างตัวแปรภายในฟังก์ชัน route", "FastAPI ไม่ได้ห้าม แต่การสร้าง client ใหม่ทุก request สิ้นเปลืองทรัพยากรอย่างมาก"],
          ["เพื่อ reuse TCP/TLS connection pool ลด latency และปิด connection อย่างสะอาดตอน shutdown", "ถูก — ลด overhead ของ handshake ลดโอกาส socket รั่ว และจัดการ shutdown ในบล็อก `finally` ได้แน่นอน"],
          ["เพื่อทำให้โมเดล LLM ตอบคำถามแม่นยำขึ้นอัตโนมัติ", "connection pooling ช่วยเรื่อง latency และเสถียรภาพ ไม่ได้เปลี่ยนความฉลาดของโมเดล"],
          ["เพื่อให้สามารถข้ามการตรวจสอบ Pydantic schema ได้", "ไม่เกี่ยวกัน — Pydantic ยังตรวจสอบ request/response ตามปกติ"],
        ],
        "B",
        "การสร้างและปิด `httpx.AsyncClient` ใน `lifespan` ช่วย reuse connection pool ทำให้ latency ต่ำลงและไม่เกิด file descriptor leak ภายใต้โหลดสูง",
        "ทำไมควรเปิด `httpx.AsyncClient` ใน FastAPI `lifespan` แทนใน route handler?",
        "เพื่อ reuse TCP/TLS connection pool ลด latency กัน socket รั่ว และปิด connection อย่างสะอาดตอน shutdown",
      ),
      mc(
        "d137-q2",
        "หากคุณวางคำสั่ง `requests.post(...)` (แบบ synchronous blocking) ไว้ใน `async def ask(...)` ของ FastAPI จะเกิดผลกระทบใดเมื่อมีผู้ใช้หลายคนพร้อมกัน?",
        [
          ["FastAPI แปลง `requests.post` ให้เป็น async ให้อัตโนมัติ", "ไม่จริง — Python ไม่แปลง blocking call ใน `async def` ให้เป็น async เอง"],
          ["Event loop ของ worker นั้นจะถูกบล็อก ทำให้ request อื่น ๆ (รวมถึง `/healthz`) ต้องรอจนกว่า call นั้นจะเสร็จ", "ถูก — นี่คือกับดักอันดับหนึ่งของ `asyncio` ใน FastAPI ต้องใช้ `httpx.AsyncClient` หรือแยกไปรันใน thread pool"],
          ["เซิร์ฟเวอร์จะคืน HTTP 422 ทันที", "ไม่เกิด 422 เพราะโค้ดรันได้ตามปกติ เพียงแต่ประสิทธิภาพและ concurrency พังอย่างเงียบ ๆ"],
          ["ไม่ส่งผลอะไรเพราะ LLM API ตอบกลับภายใน 1 มิลลิวินาทีเสมอ", "LLM API ใช้เวลาเป็นวินาที ยิ่งช้ายิ่งบล็อก event loop นาน"],
        ],
        "B",
        "ใน `async def` โค้ดจะรันบน event loop หลักโดยตรง การวาง blocking I/O ลงไปจึงหยุดการทำงานของทุก coroutine อื่นบน worker เดียวกัน",
        "เกิดอะไรขึ้นถ้าเรียก blocking I/O (เช่น `requests.post`) ภายใน `async def` route ของ FastAPI?",
        "Event loop ของ worker จะถูกบล็อก ทำให้ request อื่นทั้งหมด (รวมถึง `/healthz`) ค้างรอจนกว่า call นั้นจะเสร็จ",
      ),
      mc(
        "d137-q3",
        "ข้อใดคือประโยชน์หลักของการใช้ `Depends(get_qa_service)` ร่วมกับ `app.dependency_overrides` ในการทดสอบ AI API?",
        [
          ["ทำให้ไม่ต้องเขียนไฟล์ `test_*.py` อีกต่อไป", "ยังต้องเขียนเทสต์ แต่เขียนได้ง่าย รวดเร็ว และไม่ต้องพึ่งภายนอก"],
          ["สลับบริการจริงเป็น Stub/Mock ใน `pytest` ได้สะอาดโดยไม่ต้องแก้โค้ด route และไม่ต้องยิง LLM API จริง", "ถูก — ช่วยให้ CI รันเทสต์ API ได้ในระดับมิลลิวินาที ฟรี และผลคงที่ 100%"],
          ["บีบอัดขนาด Docker image ให้เล็กลง 50%", "Dependency Injection เป็นโครงสร้างซอฟต์แวร์ ไม่เกี่ยวกับขนาด image"],
          ["เพิ่มจำนวน token limit ของโมเดล LLM", "ไม่เกี่ยวข้องกับ context window ของโมเดล"],
        ],
        "B",
        "`Depends` แยกการสร้าง dependency ออกจาก business logic ทำให้ `app.dependency_overrides` สลับเป็น mock ได้ทันทีในระหว่างรันเทสต์",
        "`Depends(...)` + `app.dependency_overrides` ช่วยงานทดสอบ AI API อย่างไร?",
        "สลับบริการจริงเป็น mock/stub ได้โดยไม่แก้โค้ด production และไม่ต้องยิง LLM API จริงตอนรัน `pytest`",
      ),
      mc(
        "d137-q4",
        "ความแตกต่างที่สำคัญระหว่าง `GET /healthz` (Liveness) กับ `GET /readyz` (Readiness) ใน AI Microservice คืออะไร?",
        [
          ["`/healthz` ใช้เฉพาะตอน dev บนเครื่อง ส่วน `/readyz` ใช้เฉพาะบน production", "ทั้งคู่ใช้บน production (เช่น Kubernetes / Cloud Run) แต่ทำหน้าที่ต่างกัน"],
          ["`/healthz` เช็กว่าโปรเซสยังทำงานอยู่ ส่วน `/readyz` เช็กว่าทรัพยากรสำคัญ (เช่น client/model ใน `app.state`) พร้อมรับทราฟฟิกจริงแล้ว", "ถูก — ถ้าโมเดลกำลังโหลด `/healthz` ยังควรเป็น 200 เพื่อไม่ให้โดนสั่ง restart วน แต่ `/readyz` คืน 503 เพื่อไม่ให้ส่งผู้ใช้เข้ามาก่อนพร้อม"],
          ["`/readyz` จะส่งคำถามทดสอบไปเรียก Paid LLM API ทุก 5 วินาที", "ห้ามทำแบบนั้นใน readiness probe เพราะจะเปลืองค่า API และทำให้แอปโดนตัดออกจาก load balancer ทันทีที่ vendor ช้าชั่วคราว"],
          ["ทั้งสองเส้นเหมือนกันทุกประการ แค่ตั้งชื่อสองแบบไว้เผื่อเรียกผิด", "ต่างกันชัดเจน: Liveness ตัดสินใจเรื่อง restart container ส่วน Readiness ตัดสินใจเรื่องการส่ง traffic"],
        ],
        "B",
        "การแยก Liveness ออกจาก Readiness ช่วยให้ระบบโหลดโมเดลหรือ warm-up ได้จนเสร็จโดยไม่ถูก orchestrator ฆ่าทิ้ง และไม่รับทราฟฟิกลูกค้าก่อนพร้อม",
        "ต่างกันอย่างไรระหว่าง `/healthz` (Liveness) กับ `/readyz` (Readiness)?",
        "`/healthz` เช็กว่าโปรเซสยังมีชีวิต (ตัดสินใจ restart); `/readyz` เช็กว่าทรัพยากร/โมเดลพร้อมรับทราฟฟิกแล้วหรือยัง (คืน 503 ถ้ายังไม่พร้อม)",
      ),
    ],
  },

  takeaways: [
    "**ใช้ `@asynccontextmanager` `lifespan`** เปิด `httpx.AsyncClient` / โมเดลครั้งเดียวตอนบูตลง `app.state` และปิดใน `finally` ตอน shutdown",
    "**ใช้ `Depends(...)` + `dependency_overrides`** แยกบริการออกจาก route เพื่อสลับเป็น mock ใน `pytest` ได้ทันทีโดยไม่ต้องต่อเน็ต",
    "**ห้ามวาง blocking call ใน `async def`** เพราะจะแช่แข็ง event loop ของผู้ใช้ทุกคนบน worker เดียวกัน",
    "**แยก `/healthz` (liveness) กับ `/readyz` (readiness)** และเปิด `TestClient` ด้วย `with TestClient(app) as client:` เสมอเพื่อให้ `lifespan` ทำงาน",
  ],

  reviewCards: [
    rc(
      "d137-rc-1",
      "ใน FastAPI `lifespan` โค้ดก่อน `yield` และหลัง `yield` ทำงานเมื่อไร และควรครอบ `yield` ด้วยอะไร?",
      "ก่อน `yield` รันครั้งเดียวตอน startup, หลัง `yield` รันตอน shutdown — ควรครอบด้วย `try: yield finally:` เพื่อปิด connection/client เสมอ",
    ),
    rc(
      "d137-rc-2",
      "ทำไมตอนเขียนเทสต์ FastAPI ที่ใช้ `lifespan` ต้องเขียน `with TestClient(app) as client:`?",
      "เพราะหากไม่ใช้ context manager (`with`) FastAPI จะไม่รัน startup/shutdown ของ `lifespan` ทำให้ `app.state` ว่างและ client ไม่ถูกปิด",
    ),
    rc(
      "d137-rc-3",
      "หลังใช้ `app.dependency_overrides[dep] = fake` ใน `pytest` ต้องทำอะไรเสมอ?",
      "เรียก `app.dependency_overrides.clear()` ใน `finally` หรือ fixture teardown เพื่อไม่ให้ mock รั่วไปกระทบ test อื่น",
    ),
  ],

  sources: [
    { label: "FastAPI Official Docs — Lifespan Events", href: "https://fastapi.tiangolo.com/advanced/events/" },
    { label: "FastAPI Official Docs — Dependencies & Testing Overrides", href: "https://fastapi.tiangolo.com/advanced/testing-dependencies/" },
    { label: "FastAPI Official Docs — Concurrency and async / await", href: "https://fastapi.tiangolo.com/async/" },
    { label: "HTTPX Official Docs — Async Support & Client Pooling", href: "https://www.python-httpx.org/async/" },
  ],

  glossary: ["fastapi", "asyncio", "pydantic", "httpx", "sse", "mocking", "pytest", "ttft"],
});
