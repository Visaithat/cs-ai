import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/** D153 — Phase 5 / Block B39 · FastAPI Guardrails, PDPA & Langfuse */
export const d153: Lesson = defineLesson({
  day: 153,
  titleTh: "มินิโปรเจกต์ Phase 5: ต่อ Guardrails, PII Masking และ Langfuse เข้ากับ FastAPI",
  tagline: "30 นาที · ครอบ Thai Knowledge RAG ด้วยด่านข้อมูลเข้าและออก พร้อม trace ที่เชื่อมด้วย request ID",
  icon: "shield-check",
  visual: {
    id: "phase5-prod-arch",
    title: "เส้นทางคำขอของ Evaluated & Guarded AI Microservice",
    caption: "ตามคำถามจาก API ผ่าน policy และ PII masking ไปยัง engine แล้วผ่านด่านคำตอบก่อนออกจากระบบ",
    alt: "แผนผัง FastAPI รับคำขอ ผ่าน guard และ redactor ไปยัง RAG แล้วส่งผลที่ตรวจแล้ว พร้อมลูกศรไปยัง trace เมทาดาทา",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ engine, policy และ trace sink ในหน่วยความจำ ทดสอบผ่าน ASGI โดยไม่ต้องมี API key ส่วน adapter Langfuse ใช้กับ stack จาก Day 142 ได้เมื่อมี credentials ของสภาพแวดล้อมนั้น",
  tools: ["Python 3.12","uv","FastAPI","Pydantic v2","pytest","HTTPX","Langfuse","OpenTelemetry"],

  bigPicture: [
    {
      node: 0,
      heading: "คงสัญญาเดิมของผู้ช่วยเอกสาร",
      body: "หลังส่ง Thai Knowledge RAG & Agent v0.4.0 เราจะเพิ่มด่านให้ API ตอบเรื่องคืนสินค้าและอ้างเอกสารได้เหมือนเดิม แม้ข้อความจะแนบข้อมูลติดต่อ",
      lessonNote: "คงเส้นทาง FAQ และพฤติกรรมไม่พบข้อมูลจาก Day 122 เป็นสัญญาที่ Day 154 จะตรวจ",
    },
    {
      node: 1,
      heading: "ตั้งขอบเขตข้อมูลก่อนข้ามบริการ",
      body: "คำถามภาษาไทยอาจติดชื่อ เบอร์ หรือเลขบัตรมาด้วย ข้อมูลพวกนี้ข้ามไปทั้ง provider และระบบเก็บ trace ได้ถ้าใส่ request body ลง span",
      lessonNote: "นำ redaction จาก Day 151 มาวางก่อน engine และหลังตรวจ schema คำตอบ พร้อมบันทึกจำนวนการปิดบัง",
    },
    {
      node: 4,
      heading: "ตัดสินสิทธิ์ก่อนเรียก engine",
      body: "ใช้ dependency ของ {{fastapi}} ตรวจ scope และสัญญาณ policy จากฝั่งเซิร์ฟเวอร์ แล้วประกอบ input/output {{guardrails}} ของ Day 150",
      lessonNote: "request ที่ถูกบล็อกได้ HTTP 403 และ engine ต้องถูกเรียกศูนย์ครั้งในกรณี input ถูกบล็อก",
    },
    {
      node: 5,
      heading: "ผูกเหตุการณ์ด้วยรหัสสุ่ม",
      body: "middleware เริ่มจับเวลาและเปิด span ของ {{langfuse}} ตาม Day 134 รับ status กับจำนวนช่องที่ปิดบังกลับมาจาก handler",
      lessonNote: "ส่ง X-Request-ID ให้ผู้เรียกใช้เทียบกับ event ได้โดยใช้ request ID เป็นตัวค้นเฉพาะรายการ",
    },
  ],

  objectives: [
    "วาง middleware สำหรับ request ID และ latency กับ dependency สำหรับ policy และการปิดบังคำถาม",
    "ตรวจคำตอบที่อ้างหลักฐานและปิดบังข้อมูลก่อนส่งออก พร้อมทำให้ validation error และ fallback มีข้อความมาตรฐาน",
    "เปลี่ยน MemoryTrace เป็น adapter Langfuse ตาม Day 134 และพิสูจน์ขอบเขตทั้ง provider input, response และ trace ด้วย pytest",
  ],
  prerequisites: [
    "Day 121–124 มี Thai Knowledge RAG & Agent v0.4.0 พร้อม citations, abstention และสัญญา tool",
    "Day 134 เข้าใจ span และการเปิด observation ใน Langfuse รวมถึง Day 137 เรื่อง dependency injection กับ TestClient",
    "Day 150 ทำ policy แบบ least privilege และ Day 151 มีตัวตรวจเลขบัตรแบบ checksum กับการปิดบังเบอร์และชื่อ",
  ],

  setup: {
    intro: "เปิดโฟลเดอร์บริการจาก Phase 4 แล้วเพิ่ม guarded_api.py ในโฟลเดอร์เดียวกับแบบฝึกของวันนี้",
    commands: `uv python install 3.12
uv add "fastapi" "pydantic>=2,<3" uvicorn
uv add --dev pytest httpx`,
    steps: [
      ["API","ใช้สัญญา POST /query ที่รับ question และ operation เริ่มต้นเป็น faq"],
      ["Fake","วางตัวอย่างใน guarded_api.py แล้วรัน Client ในหน่วยความจำเพื่อดู event ของคำขอ"],
      ["Integration","เมื่อเชื่อม stack Day 142 เพิ่ม Langfuse SDK ตาม lockfile และสร้าง client จาก config ฝั่งเซิร์ฟเวอร์"],
    ],
    note: "รัน worked example ตามลำดับในโฟลเดอร์เดียวกัน ตัวอย่างใช้ TestClient จึงเริ่มจาก Python 3.12 กับ dependency ในรายการได้",
  },

  concepts: [
    {
      id: "boundary",
      title: "1 · ลำดับของ middleware, dependency และ engine",
      paragraphs: [
        "middleware ครอบทั้ง request เพื่อจับรหัสและเวลา รวมถึงคำขอที่จบที่ validation หรือ policy ก่อนถึง route ส่วน dependency รับ Query ที่ Pydantic ตรวจ schema แล้ว จึงรู้ว่ากำลังขอ operation อะไรและตัดสินจาก scope ที่เซิร์ฟเวอร์ให้",
        "ทำ operation ให้เป็น enum แบบ Literal แล้วให้ policy ปฏิเสธสิทธิ์เริ่มต้นที่เกิน FAQ ตัวอย่างออฟไลน์จำลองคำตัดสินผ่าน dependency override ในชุดทดสอบเท่านั้น การต่อระบบจริงต้องเรียก policy ของ Day 150 จาก dependency ที่รับ ParsedQuery พร้อม scopes จาก session ที่ผ่านการยืนยัน",
        "เส้นทาง order_status อยู่ใน schema เพื่อทดสอบสิทธิ์ที่ไม่อนุญาต ตัวอย่างยังไม่เปิด tool จริง เมื่อย้าย engine เดิมมาใช้ ให้ตัว executor ตรวจ allowlist และสิทธิ์ทรัพยากรอีกครั้งก่อนเรียก MCP",
      ],
      analogy: "เหมือนบัตรคิวบอกว่าคนนี้มาตอนไหน ส่วนเจ้าหน้าที่คนละจุดเช็กสิทธิ์ก่อนเปิดเอกสาร",
      bullets: [
        "403 หมายถึงด่านปฏิเสธคำขอตามนโยบาย",
        "422 คือ schema หรือข้อจำกัดความยาวไม่ผ่าน",
        "503 คือเส้นทาง engine มีปัญหาและต้องให้ fallback",
      ],
      code: {
        language: "python",
        filename: "policy_contract.py",
        code: `from guarded_api import Gate, PolicyDenied, Query, check

check(Query(question="สาขาเปิดกี่โมง"), Gate())
try:
    check(Query(question="ตรวจสถานะ", operation="order_status"), Gate())
except PolicyDenied:
    print("policy_block")`,
      },
      whyTitle: "วัดผลได้แม้ handler ไม่ทำงาน",
      whyParagraphs: [
        "หากจับเวลาใน handler อย่างเดียว จะหายไปทั้งคำขอที่ถูกบล็อกและ validation error ทำให้ dashboard Day 135 สะท้อนเฉพาะคำขอที่ผ่านประตู",
        "ผลทดสอบบล็อกควรตรวจทั้งสถานะและการไม่เรียก engine เพราะสถานะเพียงอย่างเดียวอาจถูกตั้งหลังผลข้างเคียงเกิดขึ้นแล้ว",
      ],
    },
    {
      id: "mask",
      title: "2 · ปิดบังข้อมูลทั้งขาเข้าและขาออก",
      paragraphs: [
        "เริ่มจากเลขบัตร 13 หลักก่อนเบอร์โทรเพื่อให้ลำดับตรวจสอดคล้องกับ Day 151 ชุดออฟไลน์ใช้ checksum และตรวจชื่อแบบมีคำนำหน้าแทนชุดข้อมูลจริง ในการต่อโปรเจกต์ นำ redact_for_ai ของ Day 151 มาแปลงผลเป็นข้อความที่ปิดบังกับจำนวนฟิลด์ แล้วฉีดผ่าน mask",
        "ต้องทำที่สองจุดเพราะเอกสารหรือผลจากเครื่องมืออาจมีเบอร์อยู่แม้คำถามจะสะอาด สำหรับ FAQ จำกัด citation เป็น ID ที่อนุญาตในตัวอย่าง และตรวจว่าคำตอบแบบ answered มี citation ก่อนส่ง การต่อ RAG จริงยังต้องใช้ตัวตรวจอ้างอิงจาก Day 122 และปิดบัง passage ก่อนส่งให้ provider",
        "ตอบ error ด้วยรหัสคงที่และ override validation handler เพราะรายละเอียด error เริ่มต้นอาจมีค่าที่ผู้ใช้ส่งมา คงจุดตรวจนี้ไว้เมื่อเพิ่ม field หรือเปลี่ยน response schema",
      ],
      analogy: "เหมือนปิดข้อมูลในสำเนาก่อนส่งต่อ แล้วตรวจเอกสารที่ได้กลับมาอีกครั้งก่อนส่งให้ลูกค้า",
      bullets: [
        "บันทึกจำนวน field ที่ปิดบัง",
        "ตรวจที่ข้อความที่ engine รับจริง",
        "ทดสอบด้วย canary สังเคราะห์และเก็บผลเท่าที่จำเป็น",
      ],
      code: {
        language: "python",
        filename: "mask_example.py",
        code: `from guarded_api import redact

safe, count = redact("คุณ สมมติ ทดสอบ, 1234567890121 081-000-0000")
assert safe == "[NAME], [THAI_ID] [PHONE]"
assert count == 3
print(safe, count)`,
      },
      whyTitle: "การปิดบังขาเดียวทิ้งช่องในอีกทาง",
      whyParagraphs: [
        "คำตอบที่ผ่าน schema ยังอาจมีข้อมูลส่วนบุคคลใน field ข้อความ การตรวจ schema กับการปิดบังจึงเป็นคนละขั้น",
        "regex ใน lab ครอบคลุมรูปแบบของ fixture เท่านั้น เมื่อใช้กับผลิตภัณฑ์ให้เพิ่มกรณีภาษาไทยและข้อมูลจากช่องเอกสารที่เจอจริง",
      ],
    },
    {
      id: "trace",
      title: "3 · Trace ที่มีประโยชน์โดยเก็บ metadata เท่าที่จำเป็น",
      paragraphs: [
        "span ชื่อ query-request เปิดก่อนเรียก downstream แล้วเติม status code กับเวลาเป็นมิลลิวินาทีเมื่อคำขอจบ ใช้รหัสสุ่มต่อคำขอเพื่อค้นเหตุการณ์เดียวกันจาก header และ trace โดยไม่ต้องใช้อีเมลหรือเบอร์เป็นตัวค้น",
        "ใช้ MemoryTrace เป็น test double และเปลี่ยนเป็น langfuse_trace ตอนประกอบแอป โดย adapter เรียก start_as_current_observation และอัปเดตเฉพาะชุด metadata ที่เราสร้างไว้ สำหรับ trace ของ RAG ที่ลึกขึ้น ให้เปิด child span ตาม Day 134 ด้วยชื่อขั้นและค่าตัวเลข",
        "เมื่อมี instrumentation อัตโนมัติ ต้องตรวจว่ามันเก็บอะไร การทำ allowlist ใน span นี้ไม่ครอบคลุม span อื่น ตัวอย่างจึงไม่เปิดการจับ prompt หรือคำตอบจาก integration อื่น สำหรับ offline MemoryTrace เก็บในหน่วยความจำเพื่อให้ assert ได้ ใช้ sink ของโครงการเมื่อทดสอบ staging ต่อ",
      ],
      analogy: "เหมือนกล้องจับเวลาช่องบริการที่บันทึกเวลารอและหมายเลขคิว โดยไม่ถ่ายหน้ากระดาษที่ลูกค้านำมา",
      bullets: [
        "request ID ใช้ค้น trace รายรายการ",
        "สถานะและระยะเวลาใช้สรุป dashboard",
        "จำนวน input และ output masks ช่วยบอกว่าด่านทำงานในเส้นทางใด",
      ],
      code: {
        language: "python",
        filename: "trace_example.py",
        code: `from guarded_api import MemoryTrace

sink = MemoryTrace()
with sink("demo-request") as meta:
    meta.update(status_code=200, latency_ms=18, input_mask_count=1)

assert sink.events[0]["request_id"] == "demo-request"
print(sink.events[0]["status_code"])`,
      },
      whyTitle: "เก็บหลักฐานสำหรับการแกะปัญหาโดยลดข้อมูลที่กระจาย",
      whyParagraphs: [
        "incident วันที่ 155 จะใช้ตัวนับ policy block และเวลาโดยอ่าน aggregate ส่วน request ID ใช้เข้าไปดูเหตุการณ์หนึ่งรายการเมื่อจำเป็น",
        "ตัวทดสอบ trace ควรตรวจชุด key ทั้งชุดเพื่อจับ auto-capture หรือการเพิ่ม field ที่เล็ดลอดเข้ามา",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จับคู่กับ middleware และ route guard",
      body: [
        "ถ้าคุ้นกับ Express middleware ให้คิดว่า request ID เป็น concern ทุกเส้นทาง ส่วน dependency เป็น precondition ที่ใช้กับเส้นทางที่ต้องมี policy",
        "ใช้ API contract ตัวเดียวกับ Day 154 เพื่อให้ regression test จับการเปลี่ยน status หรือรูปคำตอบได้",
      ],
      table: [
        ["Middleware / request context","สร้าง correlation ID จับเวลา และเขียน status"],
        ["Route guard","ตรวจ scope จากเซิร์ฟเวอร์ก่อน engine ทำงาน"],
        ["Response serializer","ตรวจโครงคำตอบและส่ง field ที่อนุญาต"],
        ["APM adapter","ส่ง metadata สู่ Langfuse หรือใช้ sink ในหน่วยความจำ"],
      ],
    },
    student: {
      title: "First-Year Note — ตามข้อมูลหนึ่งชิ้นก่อนเขียนหลายไฟล์",
      body: [
        "ใช้ปากกาสามสีเขียนคำถามดิบ คำถามที่ปิดบัง และคำตอบที่พร้อมส่งบนกระดาษ แล้วทำเครื่องหมายว่าแต่ละสีปรากฏในจุดไหนได้",
        "เริ่มจาก assert ว่า fake engine ได้คำถามที่ปิดบัง แล้วตั้ง test ให้ engine ใช้ข้อมูลสังเคราะห์ในคำตอบเพื่อพิสูจน์ว่าด่านขาออกทำงานแยกกัน",
      ],
    },
  },

  workedExample: {
    intro: "ใช้บริการเดียวกับที่ Day 154 จะทดสอบ โดยเริ่มด้วย fake engine สำหรับเอกสารคืนสินค้าและ traceback ที่ไม่ส่งกลับผู้เรียก",
    steps: [
      {
        title: "สร้าง API และ adapter สองแบบ",
        explain: "บันทึกไฟล์ guarded_api.py รัน import เพื่อตรวจว่าการประกอบ app สำเร็จ จากนั้นใช้ fake engine ในขั้นที่สอง ส่วน adapter Langfuse พร้อมรับ client จาก Day 134 ผ่าน create_app",
        code: {
          language: "python",
          filename: "guarded_api.py",
          code: `from collections import Counter
from collections.abc import Awaitable, Callable
from contextlib import AbstractContextManager, contextmanager
from dataclasses import dataclass
import re
from time import perf_counter
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field


class Query(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid", strict=True)

    question: str = Field(min_length=1, max_length=600)
    operation: Literal["faq", "order_status"] = "faq"


class Answer(BaseModel):
    status: Literal["answered", "abstained"]
    answer: str
    citation: Literal["[returns#2]"] | None = None


@dataclass(frozen=True)
class Gate:
    # Trusted signals from the server policy adapter, never JSON fields.
    risk: Literal["allow", "blocked"] = "allow"
    scopes: frozenset[str] = frozenset({"faq"})


ID_RE = re.compile(r"(?<!\\d)[1-8](?:[ -]?\\d){12}(?!\\d)")
PHONE_RE = re.compile(r"(?<!\\d)(?:0|[+]66[ -]?)[689](?:[ -]?\\d){8}(?!\\d)")
NAME_RE = re.compile(r"(?:คุณ|นาย|นางสาว)\\s+[ก-๙]+(?:[ ]+[ก-๙]+)?")


def redact(text: str) -> tuple[str, int]:
    counts: Counter[str] = Counter()

    def token(kind: str) -> str:
        counts[kind] += 1
        return f"[{kind}]"

    def mask_id(match: re.Match[str]) -> str:
        digits = re.sub(r"[^0-9]", "", match[0])
        if len(digits) != 13:
            return match[0]
        total = sum(int(digit) * weight for digit, weight in zip(digits[:12], range(13, 1, -1)))
        valid = (11 - total % 11) % 10 == int(digits[-1])
        return token("THAI_ID") if valid else match[0]

    text = ID_RE.sub(mask_id, text)
    text = PHONE_RE.sub(lambda _: token("PHONE"), text)
    text = NAME_RE.sub(lambda _: token("NAME"), text)
    return text, sum(counts.values())


class PolicyDenied(Exception):
    pass


def check(query: Query, gate: Gate) -> None:
    if gate.risk != "allow" or query.operation not in gate.scopes:
        raise PolicyDenied


async def parse_query(query: Query) -> Query:
    return query


ParsedQuery = Annotated[Query, Depends(parse_query)]


async def server_gate(_query: ParsedQuery) -> Gate:
    # Offline policy port with FAQ-only permissions.
    return Gate()





async def fake_engine(query: Query) -> Answer:
    if "คืนสินค้า" in query.question:
        return Answer(status="answered", answer="คืนสินค้าได้ภายใน 7 วัน", citation="[returns#2]")
    return Answer(status="abstained", answer="ไม่พบข้อมูล")


Event = dict[str, str | int | float]
Trace = Callable[[str], AbstractContextManager[Event]]
Engine = Callable[[Query], Awaitable[Answer]]
Redactor = Callable[[str], tuple[str, int]]


class MemoryTrace:
    def __init__(self) -> None:
        self.events: list[Event] = []

    @contextmanager
    def __call__(self, request_id: str):
        fields: Event = {"request_id": request_id}
        try:
            yield fields
        finally:
            self.events.append(fields.copy())


def langfuse_trace(client) -> Trace:
    @contextmanager
    def trace(request_id: str):
        fields: Event = {"request_id": request_id}
        with client.start_as_current_observation(name="query-request", as_type="span") as span:
            try:
                yield fields
            finally:
                span.update(metadata=fields)

    return trace


def create_app(
    engine: Engine = fake_engine,
    trace: Trace | None = None,
    mask: Redactor = redact,
) -> FastAPI:
    app = FastAPI()
    observe = trace if trace is not None else MemoryTrace()

    @app.middleware("http")
    async def request_metadata(request: Request, call_next):
        if request.url.path != "/query":
            return await call_next(request)

        request_id = uuid4().hex
        started = perf_counter()
        with observe(request_id) as event:
            request.state.event = event
            try:
                response = await call_next(request)
            except Exception:
                response = JSONResponse({"detail": "service_unavailable"}, status_code=503)
            event["status_code"] = response.status_code
            event["latency_ms"] = round((perf_counter() - started) * 1000, 2)

        response.headers["X-Request-ID"] = request_id
        return response

    @app.exception_handler(RequestValidationError)
    async def invalid_request(_request, _exc):
        # Default validation details can include the rejected input.
        return JSONResponse({"detail": "invalid_request"}, status_code=422)

    @app.exception_handler(PolicyDenied)
    async def rejected_request(_request, _exc):
        return JSONResponse({"detail": "policy_block"}, status_code=403)

    @app.get("/healthz")
    async def health():
        return {"status": "ok"}

    @app.get("/readyz")
    async def ready():
        # Offline engine is initialized at construction.
        return {"status": "ready"}

    async def safe_query(
        query: ParsedQuery, gate: Annotated[Gate, Depends(server_gate)],
    ) -> tuple[Query, int]:
        check(query, gate)
        question, count = mask(query.question)
        return query.model_copy(update={"question": question}), count

    @app.post("/query", response_model=Answer)
    async def run_query(
        request: Request,
        sanitized: Annotated[tuple[Query, int], Depends(safe_query)],
    ) -> Answer:
        query, input_count = sanitized
        request.state.event["input_mask_count"] = input_count
        result = await engine(query)
        if (result.status == "answered") != (result.citation is not None):
            raise PolicyDenied
        answer, output_count = mask(result.answer)
        request.state.event["output_mask_count"] = output_count
        return result.model_copy(update={"answer": answer})

    return app


app = create_app()`,
        },
        output: `นำเข้า guarded_api และสร้าง FastAPI app สำเร็จ`,
      },
      {
        title: "ตรวจ FAQ และ safe metadata",
        explain: "ส่งคำถามเรื่องคืนสินค้าพร้อมโทรศัพท์สังเคราะห์ คำตอบต้องมี citation จากเอกสาร returns ส่วน event เก็บเพียงจำนวน mask และ ID ตรงกับ header",
        code: {
          language: "python",
          filename: "demo_query.py",
          code: `from fastapi.testclient import TestClient

from guarded_api import MemoryTrace, create_app

sink = MemoryTrace()
with TestClient(create_app(trace=sink)) as client:
    response = client.post("/query", json={"question": "คืนสินค้า 081-000-0000"})
    print(response.status_code, response.json())
    print(sink.events[0]["input_mask_count"])
    print(response.headers["X-Request-ID"] == sink.events[0]["request_id"])`,
        },
        output: `200 {'status': 'answered', 'answer': 'คืนสินค้าได้ภายใน 7 วัน', 'citation': '[returns#2]'}
1
True`,
      },
      {
        title: "จำลองคำตัดสิน deny จาก policy",
        explain: "ใช้ override เฉพาะใน TestClient ดังนั้นคำขอเหมือนเดิมถูกบล็อกตั้งแต่ก่อนเรียก engine ตัวอย่างนี้วัดจำนวนการเรียกแยกจากสถานะ HTTP",
        code: {
          language: "python",
          filename: "demo_block.py",
          code: `from fastapi.testclient import TestClient

from guarded_api import Gate, create_app, fake_engine, server_gate

calls = []

async def record(query):
    calls.append(query.question)
    return await fake_engine(query)

service = create_app(record)
service.dependency_overrides[server_gate] = lambda: Gate(risk="blocked")
with TestClient(service) as client:
    response = client.post("/query", json={"question": "คืนสินค้า"})
print(response.status_code, response.json(), len(calls))`,
        },
        output: `403 {'detail': 'policy_block'} 0`,
      },
    ],
    gotcha: "mask ที่ endpoint นี้ครอบเฉพาะ field ที่กำหนดไว้ ถ้าต่อ SSE จาก Day 138 ต้องตรวจข้อความก่อนเผยแพร่แต่ละส่วน และถ้าตัวเลขอาจถูกแบ่งข้ามส่วน ให้ buffer ก่อนตรวจหรือส่งเฉพาะส่วนที่ยืนยันว่าปลอดภัย",
  },

  practice: {
    intro: "ประกอบ guard และ trace boundary แล้วรันชุดทดสอบในเครื่อง คง guarded_api.py เป็นฐานของ Day 154",
    requirements: [
      "นำ worked example ไปไว้ใน guarded_api.py แล้วเติม TODO ในแบบฝึกให้ครบ",
      "ทดสอบ 403 ก่อนเรียก engine, 422 ที่ไร้ค่าจาก body และ 503 ที่ไม่ส่งรายละเอียด provider",
      "ตรวจทั้งข้อความที่ engine ได้ คำตอบที่ผู้ใช้ได้ และรายการ metadata ของ trace",
    ],
    starter: {
      language: "python",
      filename: "test_guarded_boundary.py",
      code: `from fastapi.testclient import TestClient

from guarded_api import Answer, Gate, MemoryTrace, Query, create_app, server_gate

PHONE = "081-000-0000"

def test_boundary():
    received = []
    trace = MemoryTrace()

    async def provider(query: Query) -> Answer:
        # TODO: บันทึกคำถามที่ engine ได้จริง แล้วคืนข้อความสังเคราะห์ที่มีเบอร์
        raise NotImplementedError

    service = create_app(provider, trace)
    with TestClient(service) as client:
        response = client.post("/query", json={"question": f"คืนสินค้า {PHONE}"})

    # TODO: ตรวจ status, masked provider input, masked output และ request ID
    assert received
    assert response.status_code == 200

def test_policy_block():
    service = create_app()
    # TODO: override server_gate ด้วย Gate(risk="blocked")
    with TestClient(service) as client:
        response = client.post("/query", json={"question": "คืนสินค้า"})
    assert response.status_code == 403`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q test_guarded_boundary.py`,
    },
    selfCheck: [
      "ส่ง query เดิมซ้ำแล้วตรวจว่ารหัส request เปลี่ยน",
      "ลองปล่อยชื่อ เบอร์ และเลขบัตรสังเคราะห์คนละ field หรือคนละทาง แล้วตรวจฝั่งที่ควรปิดบัง",
      "ถ้าต่อบริการจริง ให้ทดสอบ raw provider payload และ metadata ที่ export ภายใต้ workload สังเคราะห์",
    ],
    acceptance: "ชุดเฉลยครบเจ็ดเคสผ่าน โดยไม่มีค่าจาก fixture ดิบใน response หรือ trace ที่ตรวจ และคำขอถูกบล็อกก่อนเรียก engine เมื่อ policy ปฏิเสธ",
    hints: [
      {
        body: "ลองเก็บ inputs ไว้ใน list ของ test double แล้ว assert โดยตรงหลังปิด TestClient",
      },
      {
        body: "ใช้ set ของ event keys เพื่อทดสอบ allowlist และ inject policy ผ่าน dependency_overrides",
      },
      {
        body: "บันทึกไฟล์ standalone นี้เป็น test_guarded_boundary.py เพื่อรันเฉลยพร้อม tests ในไฟล์เดียว",
        code: {
          language: "python",
          filename: "test_guarded_boundary.py",
          code: `from collections import Counter
from collections.abc import Awaitable, Callable
from contextlib import AbstractContextManager, contextmanager
from dataclasses import dataclass
import re
from time import perf_counter
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field


class Query(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid", strict=True)

    question: str = Field(min_length=1, max_length=600)
    operation: Literal["faq", "order_status"] = "faq"


class Answer(BaseModel):
    status: Literal["answered", "abstained"]
    answer: str
    citation: Literal["[returns#2]"] | None = None


@dataclass(frozen=True)
class Gate:
    # Trusted signals from the server policy adapter, never JSON fields.
    risk: Literal["allow", "blocked"] = "allow"
    scopes: frozenset[str] = frozenset({"faq"})


ID_RE = re.compile(r"(?<!\\d)[1-8](?:[ -]?\\d){12}(?!\\d)")
PHONE_RE = re.compile(r"(?<!\\d)(?:0|[+]66[ -]?)[689](?:[ -]?\\d){8}(?!\\d)")
NAME_RE = re.compile(r"(?:คุณ|นาย|นางสาว)\\s+[ก-๙]+(?:[ ]+[ก-๙]+)?")


def redact(text: str) -> tuple[str, int]:
    counts: Counter[str] = Counter()

    def token(kind: str) -> str:
        counts[kind] += 1
        return f"[{kind}]"

    def mask_id(match: re.Match[str]) -> str:
        digits = re.sub(r"[^0-9]", "", match[0])
        if len(digits) != 13:
            return match[0]
        total = sum(int(digit) * weight for digit, weight in zip(digits[:12], range(13, 1, -1)))
        valid = (11 - total % 11) % 10 == int(digits[-1])
        return token("THAI_ID") if valid else match[0]

    text = ID_RE.sub(mask_id, text)
    text = PHONE_RE.sub(lambda _: token("PHONE"), text)
    text = NAME_RE.sub(lambda _: token("NAME"), text)
    return text, sum(counts.values())


class PolicyDenied(Exception):
    pass


def check(query: Query, gate: Gate) -> None:
    if gate.risk != "allow" or query.operation not in gate.scopes:
        raise PolicyDenied


async def parse_query(query: Query) -> Query:
    return query


ParsedQuery = Annotated[Query, Depends(parse_query)]


async def server_gate(_query: ParsedQuery) -> Gate:
    # Offline policy port with FAQ-only permissions.
    return Gate()





async def fake_engine(query: Query) -> Answer:
    if "คืนสินค้า" in query.question:
        return Answer(status="answered", answer="คืนสินค้าได้ภายใน 7 วัน", citation="[returns#2]")
    return Answer(status="abstained", answer="ไม่พบข้อมูล")


Event = dict[str, str | int | float]
Trace = Callable[[str], AbstractContextManager[Event]]
Engine = Callable[[Query], Awaitable[Answer]]
Redactor = Callable[[str], tuple[str, int]]


class MemoryTrace:
    def __init__(self) -> None:
        self.events: list[Event] = []

    @contextmanager
    def __call__(self, request_id: str):
        fields: Event = {"request_id": request_id}
        try:
            yield fields
        finally:
            self.events.append(fields.copy())


def langfuse_trace(client) -> Trace:
    @contextmanager
    def trace(request_id: str):
        fields: Event = {"request_id": request_id}
        with client.start_as_current_observation(name="query-request", as_type="span") as span:
            try:
                yield fields
            finally:
                span.update(metadata=fields)

    return trace


def create_app(
    engine: Engine = fake_engine,
    trace: Trace | None = None,
    mask: Redactor = redact,
) -> FastAPI:
    app = FastAPI()
    observe = trace if trace is not None else MemoryTrace()

    @app.middleware("http")
    async def request_metadata(request: Request, call_next):
        if request.url.path != "/query":
            return await call_next(request)

        request_id = uuid4().hex
        started = perf_counter()
        with observe(request_id) as event:
            request.state.event = event
            try:
                response = await call_next(request)
            except Exception:
                response = JSONResponse({"detail": "service_unavailable"}, status_code=503)
            event["status_code"] = response.status_code
            event["latency_ms"] = round((perf_counter() - started) * 1000, 2)

        response.headers["X-Request-ID"] = request_id
        return response

    @app.exception_handler(RequestValidationError)
    async def invalid_request(_request, _exc):
        # Default validation details can include the rejected input.
        return JSONResponse({"detail": "invalid_request"}, status_code=422)

    @app.exception_handler(PolicyDenied)
    async def rejected_request(_request, _exc):
        return JSONResponse({"detail": "policy_block"}, status_code=403)

    @app.get("/healthz")
    async def health():
        return {"status": "ok"}

    @app.get("/readyz")
    async def ready():
        # Offline engine is initialized at construction.
        return {"status": "ready"}

    async def safe_query(
        query: ParsedQuery, gate: Annotated[Gate, Depends(server_gate)],
    ) -> tuple[Query, int]:
        check(query, gate)
        question, count = mask(query.question)
        return query.model_copy(update={"question": question}), count

    @app.post("/query", response_model=Answer)
    async def run_query(
        request: Request,
        sanitized: Annotated[tuple[Query, int], Depends(safe_query)],
    ) -> Answer:
        query, input_count = sanitized
        request.state.event["input_mask_count"] = input_count
        result = await engine(query)
        if (result.status == "answered") != (result.citation is not None):
            raise PolicyDenied
        answer, output_count = mask(result.answer)
        request.state.event["output_mask_count"] = output_count
        return result.model_copy(update={"answer": answer})

    return app


app = create_app()


from fastapi.testclient import TestClient

PHONE = "081-000-0000"
THAI_ID = "1234567890121"
NAME = "คุณ สมมติ ทดสอบ"


def test_input_output_and_trace_boundaries():
    observed = MemoryTrace()
    engine_inputs = []

    async def fake(query: Query) -> Answer:
        engine_inputs.append(query.question)
        return Answer(status="answered", answer=f"ติดต่อ {PHONE}", citation="[returns#2]")

    with TestClient(create_app(fake, observed)) as client:
        result = client.post("/query", json={"question": f"{NAME}, {THAI_ID} {PHONE}"})
    assert result.status_code == 200
    assert engine_inputs == ["[NAME], [THAI_ID] [PHONE]"]
    assert result.json()["answer"] == "ติดต่อ [PHONE]"
    event, = observed.events
    assert event["request_id"] == result.headers["X-Request-ID"]
    assert event["input_mask_count"] == 3
    assert event["output_mask_count"] == 1
    assert set(event) == {"request_id", "input_mask_count", "output_mask_count", "status_code", "latency_ms"}
    for value in (NAME, THAI_ID, PHONE):
        assert value not in str(event)
        assert value not in result.text


def test_guard_stops_engine_before_it_runs():
    observed = MemoryTrace()

    async def should_not_run(_query: Query) -> Answer:
        raise AssertionError("engine should not run")

    service = create_app(should_not_run, observed)
    service.dependency_overrides[server_gate] = lambda: Gate(risk="blocked")
    with TestClient(service) as client:
        result = client.post("/query", json={"question": "วันคืนสินค้า"})
    assert result.status_code == 403
    assert result.json() == {"detail": "policy_block"}
    assert observed.events[0]["status_code"] == 403


def test_unsupported_scope_and_validation_do_not_echo_data():
    with TestClient(create_app()) as client:
        unauthorized = client.post("/query", json={"question": "สถานะ", "operation": "order_status"})
        invalid = client.post("/query", json={"question": "สถานะ", "risk": PHONE})
    assert unauthorized.status_code == 403
    assert invalid.json() == {"detail": "invalid_request"}
    assert invalid.status_code == 422
    assert PHONE not in invalid.text


def test_engine_error_has_only_safe_metadata():
    observed = MemoryTrace()

    async def offline(_query: Query) -> Answer:
        raise TimeoutError(f"timeout: {PHONE}")

    with TestClient(create_app(offline, observed)) as client:
        result = client.post("/query", json={"question": "คืนสินค้า"})
        assert client.get("/healthz").json() == {"status": "ok"}
        assert client.get("/readyz").json() == {"status": "ready"}
    assert result.status_code == 503
    assert result.json() == {"detail": "service_unavailable"}
    assert len(observed.events) == 1
    assert PHONE not in str(observed.events) + result.text


def test_d151_id_checksum_preserves_synthetic_barcode():
    assert redact("1234567890121")[0] == "[THAI_ID]"
    assert redact("8850123456789") == ("8850123456789", 0)


def test_no_match_uses_abstention():
    with TestClient(create_app()) as client:
        response = client.post("/query", json={"question": "สาขาต่างประเทศเปิดกี่โมง"})
    assert response.json() == {"status": "abstained", "answer": "ไม่พบข้อมูล", "citation": None}

def test_output_guard_rejects_answer_without_citation():
    async def missing_citation(_query: Query) -> Answer:
        return Answer(status="answered", answer="ข้อความภายนอกหลักฐาน")

    observed = MemoryTrace()
    with TestClient(create_app(missing_citation, observed)) as client:
        response = client.post("/query", json={"question": "วันคืนสินค้า"})
    assert response.json() == {"detail": "policy_block"}
    assert response.status_code == 403
    assert "ข้อความภายนอกหลักฐาน" not in str(observed.events)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q test_guarded_boundary.py`,
    },
  },

  mistakes: [
    {
      title: "บล็อกหลัง engine ทำงาน",
      symptom: "ได้ 403 แต่ provider call count เป็นหนึ่ง วางการตัดสินในขั้นสุดท้าย",
      fix: "ย้าย policy ไปไว้ใน dependency ก่อนเรียก engine แล้วเพิ่ม test ที่ต้องได้ 403 โดยไม่มีการเรียก",
    },
    {
      title: "ใส่ raw body ใน observation",
      symptom: "trace มีเบอร์หรือเลขบัตรสังเคราะห์ การ serialize request ถูกเปิดเพื่อ debug",
      fix: "ส่งเฉพาะ metadata ที่ระบุไว้ ตรวจ sink และ instrumentation อื่นด้วย fixture เดียวกัน",
    },
    {
      title: "เชื่อแค่ success response",
      symptom: "422 ส่งค่าที่ผู้ใช้กรอกกลับไป ตัวจัดการ validation ใช้รายละเอียดเริ่มต้น",
      fix: "ดัก RequestValidationError แล้วส่ง error code คงที่",
    },
    {
      title: "ตรวจแค่ข้อความขาเข้า",
      symptom: "provider ได้ข้อความปิดบังแล้ว แต่ผู้เรียกเห็นเลขในคำตอบ เอกสารหรือผลเครื่องมือเป็นแหล่งข้อมูลอีกทาง",
      fix: "ทำ output masking หลังตรวจสัญญาคำตอบและเพิ่ม synthetic output canary",
    },
  ],

  quiz: {
    intro: "ลองไล่เส้นทางของคำขอก่อนเลือกคำตอบ นึกถึงจุดที่ side effect แรกเกิดขึ้น",
    questions: [
      mc(
        "d153-q1",
        "ควรตรวจ scope ของ operation ที่ใด",
[
          ["ใน dependency ก่อน engine","ถูกต้อง เพราะหยุดผลข้างเคียงได้"],
          ["ใน response header","สายเกินไปเมื่อ engine ถูกเรียก"],
          ["ใน dashboard","dashboard ใช้ตรวจเหตุการณ์ย้อนหลัง"],
          ["ใน log collector","collector รับข้อมูลที่ส่งออกไปแล้ว"],
        ],
        "A",
        "scope มาจากเซิร์ฟเวอร์และต้องตัดสินก่อน downstream call",
        "ทำไมต้องใช้ dependency ก่อน engine",
        "เพื่อไม่ให้คำขอที่ถูกปฏิเสธไปถึง provider หรือ tool",
      ),
      mc(
        "d153-q2",
        "เมื่อเอกสารต้นทางมีเบอร์โทร แม้คำถามไม่มีเบอร์ ควรตรวจอะไร",
[
          ["เฉพาะ request ID","รหัสไม่ได้บอกเนื้อหาคำตอบ"],
          ["ขาออกและข้อมูลที่ส่งเข้า provider","ถูกต้อง เพราะเอกสารเป็นแหล่ง PII อีกทาง"],
          ["เฉพาะชื่อ span","ชื่อ span ไม่ใช่เนื้อหาคำตอบ"],
          ["ค่า latency","เวลาไม่ยืนยันว่าปิดข้อมูลแล้ว"],
        ],
        "B",
        "ข้อมูลส่วนบุคคลอาจเข้ามาจาก passage หรือผล tool จึงต้องตรวจทุกขอบเขตที่ส่งต่อ",
        "ต้องตรวจ PII ที่ขอบเขตใด",
        "ก่อนส่ง provider ก่อนตอบผู้ใช้ และก่อน export telemetry",
      ),
      mc(
        "d153-q3",
        "ข้อมูลใดใช้เชื่อม response กับ trace ได้",
[
          ["เลขบัตร","มีความเสี่ยงและไม่จำเป็น"],
          ["ชื่อจริง","ซ้ำได้และเสี่ยงข้อมูลรั่ว broadly"],
          ["request ID สุ่ม","ถูกต้อง ค้นเหตุการณ์ได้จากรหัสเดียว"],
          ["ข้อความคำถาม","ไม่จำเป็นและอาจมีข้อมูลส่วนตัว"],
        ],
        "C",
        "สร้าง request ID ต่อคำขอแล้วใช้ค่าเดียวกันใน header กับ span metadata",
        "request ID ถูกส่งออกตรงไหน",
        "header ฝั่ง HTTP และ metadata ฝั่ง trace",
      ),
      mc(
        "d153-q4",
        "เคส input ที่ถูกบล็อกต้อง assert อะไรคู่กับ status",
[
          ["จำนวน span ต้องเป็นศูนย์","เราต้องการ trace สำหรับบล็อกด้วย"],
          ["เวลาเท่ากับศูนย์","การตรวจด่านยังใช้เวลา"],
          ["Health check ล้ม","การปฏิเสธคำขอหนึ่งไม่ทำให้ระบบล่ม"],
          ["จำนวนการเรียก engine เท่ากับศูนย์","ถูกต้อง จับผลข้างเคียงโดยตรง"],
        ],
        "D",
        "การตรวจจำนวน call ช่วยจับ regression ที่มีการเรียก engine ก่อนตัดสินนโยบาย",
        "สถานะ 403 อย่างเดียวพอไหม",
        "เพิ่มการตรวจ engine call count ด้วย",
      ),
    ],
  },

  takeaways: [
    "ให้ middleware รับผิดชอบ ID เวลา และสถานะ และให้ dependency ตรวจ payload กับ scope ก่อน engine",
    "ปิดบัง PII ก่อน engine และก่อนคืนข้อความ ตรวจ error payload และ telemetry ด้วย",
    "นำสัญญา 200, 403, 422 และ 503 พร้อมหลักฐาน call count ไปใช้สร้าง Promptfoo gate วันที่ 154",
  ],
  reviewCards: [
    rc(
      "d153-rc1",
      "ก่อนเปิด observation สำหรับ request เก็บ field ใดได้",
      "เริ่มจาก request ID สุ่ม เพิ่มเฉพาะ status ระยะเวลา และจำนวน field ที่ปิดบัง",
    ),
    rc(
      "d153-rc2",
      "หยุดคำขอที่เสี่ยงก่อนเกิด side effect อย่างไร",
      "ตรวจ policy กับ scopes ใน dependency ก่อนเรียก engine แล้วใช้ test double ตรวจ call count",
    ),
    rc(
      "d153-rc3",
      "Output masking จำเป็นในเคสใด",
      "เมื่อคำตอบอาจรับข้อมูลจากโมเดล เอกสาร หรือผลเครื่องมือ แม้ input จะสะอาด",
    ),
    rc(
      "d153-rc4",
      "เปลี่ยน trace sink โดยไม่แก้ route อย่างไร",
      "ฉีด Langfuse adapter ที่มีสัญญาเดียวกับ MemoryTrace ตอนสร้างแอป",
    ),
  ],
  sources: [
    {
      label: "FastAPI — Middleware",
      href: "https://fastapi.tiangolo.com/tutorial/middleware/",
    },
    {
      label: "FastAPI — Testing Dependencies with Overrides",
      href: "https://fastapi.tiangolo.com/advanced/testing-dependencies/",
    },
    {
      label: "Langfuse — Python SDK Instrumentation",
      href: "https://langfuse.com/docs/observability/sdk/instrumentation",
    },
    {
      label: "Pydantic — Models",
      href: "https://docs.pydantic.dev/latest/concepts/models/",
    },
  ],
  glossary: ["fastapi","pydantic","guardrails","pdpa","langfuse","otel","mcp","rag","pytest"],
});
