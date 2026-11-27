import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const models = `import asyncio
import logging
from contextlib import asynccontextmanager, suppress
from dataclasses import dataclass
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field


QUEUE_CAPACITY = 2
MAX_ATTEMPTS = 3
ATTEMPT_TIMEOUT = 0.5
BASE_BACKOFF = 0.05
JobState = Literal["queued", "running", "retrying", "succeeded", "failed"]
log = logging.getLogger(__name__)


class IngestRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, frozen=True)
    document_id: str = Field(pattern=r"^[a-z0-9-]{1,48}$")
    text: str = Field(min_length=1, max_length=4_000)
    scenario: Literal["normal", "retry", "exhaust", "invalid"] = "normal"


class AcceptedJob(BaseModel):
    job_id: str
    status_url: str


class JobStatus(BaseModel):
    job_id: str
    status: JobState
    attempts: int
    chunks_indexed: int | None
    error: str | None


@dataclass
class Job:
    job_id: str
    document: IngestRequest
    status: JobState = "queued"
    attempts: int = 0
    chunks_indexed: int | None = None
    error: str | None = None

    def snapshot(self) -> JobStatus:
        return JobStatus(
            job_id=self.job_id,
            status=self.status,
            attempts=self.attempts,
            chunks_indexed=self.chunks_indexed,
            error=self.error,
        )


class TransientIndexError(Exception):
    pass


class InvalidDocument(Exception):
    pass


class LocalIndex:
    def __init__(self):
        self.documents: dict[str, tuple[str, ...]] = {}

    async def index(self, document: IngestRequest, attempt: int) -> int:
        # จำลองเวลารอ embedding service ห้ามใช้ time.sleep ใน event loop
        await asyncio.sleep(0.04)
        if document.scenario == "invalid":
            raise InvalidDocument()
        if document.scenario == "exhaust" or (
            document.scenario == "retry" and attempt == 1
        ):
            raise TransientIndexError()

        chunks = tuple(line.strip() for line in document.text.splitlines() if line.strip())
        # แทนที่ทั้งเอกสารด้วย key คงที่หลังเตรียมผลครบ (จำลอง upsert)
        self.documents[document.document_id] = chunks
        return len(chunks)


class IngestRuntime:
    def __init__(self):
        self.queue: asyncio.Queue[Job] = asyncio.Queue(maxsize=QUEUE_CAPACITY)
        self.jobs: dict[str, Job] = {}
        self.key_to_job: dict[str, str] = {}
        self.index = LocalIndex()`;

const worker = `async def run_job(job: Job, index: LocalIndex) -> None:
    for attempt in range(1, MAX_ATTEMPTS + 1):
        job.status, job.attempts = "running", attempt
        try:
            async with asyncio.timeout(ATTEMPT_TIMEOUT):
                count = await index.index(job.document, attempt)
        except InvalidDocument:
            job.status, job.error = "failed", "invalid_document"
            return
        except (TransientIndexError, TimeoutError):
            if attempt == MAX_ATTEMPTS:
                job.status, job.error = "failed", "retry_exhausted"
                return
            job.status = "retrying"
            await asyncio.sleep(BASE_BACKOFF * 2 ** (attempt - 1))
        else:
            job.status, job.chunks_indexed = "succeeded", count
            return


async def worker(runtime: IngestRuntime) -> None:
    while True:
        job = await runtime.queue.get()
        try:
            await run_job(job, runtime.index)
        except Exception:
            log.exception("ingestion failed for job %s", job.job_id)
            job.status, job.error = "failed", "internal_error"
        finally:
            runtime.queue.task_done()


@asynccontextmanager
async def lifespan(app: FastAPI):
    runtime = IngestRuntime()
    app.state.ingest = runtime
    task = asyncio.create_task(worker(runtime), name="ingestion-worker")
    try:
        yield
    finally:
        try:
            await asyncio.wait_for(runtime.queue.join(), timeout=2)
        except TimeoutError:
            log.warning("ingestion shutdown deadline exceeded")
        finally:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task`;

const routes = `app = FastAPI(title="Thai Knowledge RAG ingestion", lifespan=lifespan)


def submit(runtime: IngestRuntime, key: str, document: IngestRequest) -> Job:
    # ทั้งการตรวจ key, enqueue และบันทึก registry อยู่ใน event-loop turn เดียว
    existing_id = runtime.key_to_job.get(key)
    if existing_id is not None:
        job = runtime.jobs[existing_id]
        if job.document != document:
            raise HTTPException(status_code=409, detail="idempotency_key_conflict")
        return job

    job = Job(job_id=uuid4().hex, document=document)
    try:
        runtime.queue.put_nowait(job)
    except asyncio.QueueFull as exc:
        raise HTTPException(
            status_code=503,
            detail="ingest_queue_full",
            headers={"Retry-After": "1"},
        ) from exc
    runtime.jobs[job.job_id] = job
    runtime.key_to_job[key] = job.job_id
    return job


@app.post("/ingest", status_code=202, response_model=AcceptedJob)
async def ingest(
    document: IngestRequest,
    request: Request,
    response: Response,
    key: Annotated[
        str, Header(alias="Idempotency-Key", pattern=r"^[A-Za-z0-9._-]{1,80}$")
    ],
) -> AcceptedJob:
    job = submit(request.app.state.ingest, key, document)
    status_url = f"/jobs/{job.job_id}"
    response.headers["Location"] = status_url
    return AcceptedJob(job_id=job.job_id, status_url=status_url)


@app.get("/jobs/{job_id}", response_model=JobStatus)
async def read_job(job_id: str, request: Request) -> JobStatus:
    job = request.app.state.ingest.jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job_not_found")
    return job.snapshot()`;

const workerStarter = `async def run_job(job: Job, index: LocalIndex) -> None:
    # TODO 1: run attempts with a timeout, state transitions and backoff.
    raise NotImplementedError("process one job")


async def worker(runtime: IngestRuntime) -> None:
    while True:
        job = await runtime.queue.get()
        try:
            await run_job(job, runtime.index)
        except Exception:
            log.exception("ingestion failed for job %s", job.job_id)
            job.status, job.error = "failed", "internal_error"
        finally:
            # TODO 2: mark the item complete even on failure.
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    runtime = IngestRuntime()
    app.state.ingest = runtime
    task = asyncio.create_task(worker(runtime), name="ingestion-worker")
    try:
        yield
    finally:
        # TODO 3: drain accepted jobs with a bounded shutdown budget.
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task`;

const routesStarter = `app = FastAPI(title="Thai Knowledge RAG ingestion", lifespan=lifespan)


def submit(runtime: IngestRuntime, key: str, document: IngestRequest) -> Job:
    # TODO 4: check key and payload before adding work.
    # TODO 5: reject a full queue without reserving the key.
    raise NotImplementedError("submit a job")


@app.post("/ingest", status_code=202, response_model=AcceptedJob)
async def ingest(
    document: IngestRequest,
    request: Request,
    response: Response,
    key: Annotated[
        str, Header(alias="Idempotency-Key", pattern=r"^[A-Za-z0-9._-]{1,80}$")
    ],
) -> AcceptedJob:
    job = submit(request.app.state.ingest, key, document)
    status_url = f"/jobs/{job.job_id}"
    response.headers["Location"] = status_url
    return AcceptedJob(job_id=job.job_id, status_url=status_url)


@app.get("/jobs/{job_id}", response_model=JobStatus)
async def read_job(job_id: str, request: Request) -> JobStatus:
    job = request.app.state.ingest.jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job_not_found")
    return job.snapshot()`;

/** D139 — Phase 5 / Block B35 */
export const d139: Lesson = defineLesson({
  day: 139,
  titleTh: "ทำงานนำเข้าเอกสารเบื้องหลังด้วย Job Queue",
  tagline: "30 นาที · ตอบ 202 ทันที ติดตามงานด้วย job_id และ retry งานเดิมโดยไม่สร้างงานซ้ำ",
  icon: "zap",
  visual: {
    id: "ingestion-job-queue",
    title: "รับงาน เข้าคิว ประมวลผล และติดตามผล",
    caption: "กดส่งไฟล์ซ้ำด้วย key เดิม แล้วเดิน worker ทีละรอบเพื่อสังเกตสถานะและจำนวนครั้งที่ลอง",
    alt: "แผนภาพ POST ingest ส่งงานเข้าคิวและ client อ่านสถานะจาก job endpoint",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้เอกสารไทยจำลองและ LocalIndex ในหน่วยความจำ คำตอบ SSE ยังใช้ FakeThaiModel จาก D138",
  tools: ["FastAPI", "asyncio", "Uvicorn", "HTTPX", "pytest"],

  bigPicture: [
    {
      node: 0, heading: "ผู้ใช้อยากรู้ว่าไฟล์ถูกรับแล้ว",
      body: "การแบ่งเอกสาร สร้าง embedding และอัปเดต index อาจนานเกินเวลาที่หน้าอัปโหลดจะรอได้",
      lessonNote: "ตอบ 202 พร้อม job_id และ URL ติดตาม แยกการรับงานออกจากผลของงาน",
    },
    {
      node: 1, heading: "เตรียมหลักฐานก่อน RAG หยิบไปใช้",
      body: "เอกสารฉบับใหม่ต้องผ่านการแบ่งข้อความและจัดเก็บผลลัพธ์ครบก่อนเปิดให้ค้น",
      lessonNote: "แล็บแทนที่เอกสารด้วย document_id คงที่หลังเตรียมผลครบ เพื่อให้ retry โดยไม่เพิ่ม chunk ซ้ำ",
    },
    {
      node: 4, heading: "แยกทางเดินของ ingestion จาก chat",
      body: "เส้นแชต SSE ของ D138 อ่านข้อมูลที่พร้อม ส่วน upload ส่งงานให้ worker ที่สร้างใน lifespan จาก D137",
      lessonNote: "ใช้ {{asyncio}} Queue ที่คุมจำนวนงานรอได้ และให้ retry ของ POST ใช้ {{idempotency}} key",
    },
    {
      node: 5, heading: "เห็นคิวสะสมและงานที่หมดสิทธิ์ retry",
      body: "HTTP 202 บอกว่ารับไว้แล้ว ส่วน job status บอกว่าเริ่ม รอลองใหม่ หรือบันทึกเสร็จ",
      lessonNote: "ติดตาม queue depth, queue age และ retry rate เพื่อประกอบการตัดสินใจเพิ่ม worker หรือจำกัดงานเข้า",
    },
  ],
  objectives: [
    "สร้าง POST /ingest ที่ตอบ 202 พร้อม Location และ GET /jobs/{job_id} ที่คืนสถานะปัจจุบัน",
    "ใช้คิวขนาดจำกัดและ idempotency key ให้ request ซ้ำได้ job_id เดิม พร้อมแยก 409 และ 503",
    "เขียน worker ที่ retry เฉพาะความล้มเหลวชั่วคราวด้วย {{exponential-backoff}} แล้วตรวจเส้นทางจบงานด้วย pytest",
  ],
  prerequisites: [
    "D17–D19 · HTTPX timeout, exponential backoff และ idempotency",
    "D107 · Incremental indexing, deduplication และ access-control filtering ของ Thai Knowledge RAG",
    "D137–D138 · FastAPI lifespan, async route และสัญญา SSE",
  ],
  setup: {
    intro: "ใช้ ai-fastapi-lab จาก D137 และ Python 3.12 จาก D138 สร้าง ingest_api.py แยกจาก stream_api.py เพื่อให้รันแล็บแยกกันได้",
    commands: `uv add fastapi uvicorn httpx pydantic
uv add --dev pytest
uv run python --version`,
    steps: [
      ["files", "เตรียม ingest_api.py, poll_job.py และ test_ingest_api.py"],
      ["shells", "เปิดเทอร์มินัลสำหรับ Uvicorn และอีกอันสำหรับ HTTPX หรือ pytest"],
      ["fixture", "ใช้ข้อความไทยสองบรรทัดและ document_id ที่เป็นตัวอักษรเล็กตามตัวอย่าง"],
    ],
    note: "แล็บรับ JSON แทนไฟล์จริง ใช้ Uvicorn หนึ่ง worker ข้อมูลหายเมื่อ process หยุด และไม่ต้องติดตั้ง Redis หรือเรียก LLM",
  },

  concepts: [
    {
      id: "ingest-receipt",
      title: "1 · HTTP 202 คือใบรับงาน",
      paragraphs: [
        "ผู้ใช้ส่ง document_id, text และ Idempotency-Key แล้วได้ 202 กับ job_id หลังเพิ่มงานสำเร็จ งานอาจยังอยู่ในคิวหรือเพิ่งถูก worker หยิบไปทำ",
        "ใส่ Location ชี้ไปที่ GET /jobs/{job_id} และคืน status_url ใน body เพื่อให้หน้าเว็บเก็บลิงก์ข้ามการ reload ได้ เส้น status คืน 200 สำหรับงานที่รู้จัก แม้สถานะข้างในจะเป็น failed",
      ],
      analogy: "เคาน์เตอร์ออกใบรับเอกสารพร้อมเลขติดตามก่อนเจ้าหน้าที่ตรวจและจัดเก็บ",
        code: { language: "python", filename: "job_receipt.py", code: `from fastapi import FastAPI, Response

app = FastAPI()


@app.post("/receipt", status_code=202)
async def receipt(response: Response):
    response.headers["Location"] = "/jobs/demo-17"
    return {"job_id": "demo-17", "status_url": "/jobs/demo-17"}` },
      whyTitle: "แยกผลคำขอ HTTP กับผลประมวลผล",
      whyParagraphs: [
        "ให้ UI แจ้งว่ารับข้อมูลแล้ว พอ GET เจอสถานะ succeeded หรือ failed ให้หยุด polling ระบบจริงตรวจสิทธิ์ผู้เรียกทั้งตอน submit และอ่าน status เพราะ ID ที่เดายากอย่างเดียวใช้แทน authorization ไม่ได้",
      ],
    },
    {
      id: "ingest-bounded-queue",
      title: "2 · คิวจำกัดจำนวนงานรอ",
      paragraphs: [
        "คิวแล็บมีสองช่องสำหรับงานที่ยังไม่ได้หยิบ งานที่ worker กำลังทำอีกหนึ่งงานนับแยก เมื่อไม่มีช่องให้ตอบ 503 พร้อม Retry-After เพื่อให้ client กลับมาลองใหม่",
        "worker ใช้ await queue.get และเรียก task_done หนึ่งครั้งต่อ item ใน finally แม้ job ล้มเหลว shutdown ใช้ queue.join พร้อม deadline แล้ว cancel worker",
      ],
      analogy: "รางรับแฟ้มมีสองช่อง แฟ้มบนโต๊ะคนทำงานใช้พื้นที่ของโต๊ะเอง",
        code: { language: "python", filename: "bounded_queue.py", code: `import asyncio


async def main():
    queue = asyncio.Queue(maxsize=1)
    queue.put_nowait("billing-v3")
    try:
        queue.put_nowait("billing-v4")
    except asyncio.QueueFull:
        print("503: wait for a slot")
    print("worker:", await queue.get())
    queue.task_done()
    await queue.join()


asyncio.run(main())` },
      whyTitle: "ปกป้อง latency และหน่วยความจำ",
      whyParagraphs: [
        "await I/O เปิดโอกาสให้ loop ทำคำขออื่น การแปลง PDF หรือทำ embedding บน CPU อาจบล็อก loop จึงควรแยกไป process worker หรือบริการเฉพาะตามลักษณะงาน",
        "maxsize จำกัดเฉพาะจำนวนงานรอ ขนาด body, ประวัติ job และ index ใน memory ต้องจำกัดแยกกัน ระบบจริงติดตามอายุงานเก่าสุดด้วยเพื่อเห็นว่าคนรอนานเท่าไร",
      ],
    },
    {
      id: "ingest-idempotency",
      title: "3 · Idempotency key ผูกกับเจตนาการส่งงาน",
      paragraphs: [
        "ถ้า client หมดเวลารอ response ย่อมไม่รู้ว่า server เพิ่มงานแล้วหรือยัง ให้ส่ง key เดิมกับ payload เดิมแล้วรับ job_id เดิม แม้งานจะจบไปแล้ว",
        "key เดิมกับ payload ที่ต่างกันคืน 409 ตรวจ key ก่อนดูว่าคิวเต็มหรือไม่ เพื่อให้ยังค้นงานเดิมได้เมื่อรับงานใหม่ไม่ได้",
      ],
      analogy: "ใบส่งงานหนึ่งใบตามเลขอ้างอิงเดิม ถ้ายื่นเอกสารคนละฉบับต้องขอเลขใหม่",
        code: { language: "python", filename: "key_scope.py", code: `def classify(existing, incoming):
    if existing is None:
        return "enqueue"
    return "replay" if existing == incoming else "409 conflict"


assert classify(None, "v3") == "enqueue"
assert classify("v3", "v3") == "replay"
assert classify("v3", "v4") == "409 conflict"` },
      whyTitle: "คุมงานซ้ำทุกชั้น",
      whyParagraphs: [
        "แล็บทำ check, put_nowait และเขียน registry ใน event-loop turn เดียวโดยไม่มี await ถ้ามีหลาย process ใช้ unique constraint ตาม tenant และวิธีส่งจาก registry ไป queue ที่กู้คืนได้ เช่น transactional outbox",
        "idempotency ของ POST ป้องกัน job ซ้ำ ส่วน upsert ป้องกันผลซ้ำเมื่อ job เดิมถูกลองหลายครั้ง ระบบจริงใช้ version และ chunk ID คงที่ แล้วเปิด version ใหม่หลังเขียนครบ",
      ],
    },
    {
      id: "ingest-retry",
      title: "4 · ลองใหม่เฉพาะความผิดพลาดชั่วคราว",
      paragraphs: [
        "timeout และ upstream ที่ช้าชั่วคราวมีโอกาสดีขึ้นเมื่อเว้นเวลา ส่วนเอกสารเสียต้องแก้ input ก่อน",
        "แล็บลองสูงสุดสามครั้ง โดยรอ 50 และ 100 มิลลิวินาทีหลังครั้งที่หนึ่งและสอง สถานะ retrying ใช้ job_id เดิมและกลับ running เมื่อเริ่มรอบถัดไป",
      ],
      analogy: "นัดโทรกลับเมื่อปลายสายไม่ว่างได้ ถ้าหมายเลขผิดต้องขอข้อมูลใหม่",
        code: { language: "python", filename: "retry_delays.py", code: `base = 0.05
max_attempts = 3
delays = [base * 2 ** (attempt - 1) for attempt in range(1, max_attempts)]
print(delays)  # [0.05, 0.1]` },
      whyTitle: "เลือกที่วางงานตามความเสี่ยงของการสูญหาย",
      whyParagraphs: [
        "worker เดียวถือ job ช่วง backoff เพื่อให้เดินแล็บง่าย งานถัดไปจึงยังรอ ในระบบจริง broker สามารถนัด retry ให้ worker ทำงานอื่นก่อน และใส่ jitter เพื่อลดการลองซ้ำพร้อมกัน",
        "FastAPI BackgroundTasks เหมาะกับงานสั้นหลังส่ง response ภายใน process เดิม คิวในแล็บเพิ่ม backpressure, polling และ retry policy ภายใน memory",
        "arq ใช้ Redis และ asyncio เหมาะกับ async I/O, RQ ใช้ Redis หรือ Valkey พร้อม job/worker ที่ตรงไปตรงมา, Celery รองรับหลาย broker และปรับ routing/worker ได้ละเอียด ทั้งหมดต้องดูแล broker, การเก็บผล และการส่งงานซ้ำเมื่อกู้คืน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Upload Button สู่ Job Status",
      body: [
        "สร้าง Idempotency-Key หนึ่งครั้งต่อเจตนาส่งงาน เก็บไว้สำหรับ retry เมื่อ network สะดุด หากผู้ใช้แก้ payload เพื่อเริ่มงานใหม่ ให้สร้าง key ใหม่",
        "พอได้ 202 ให้อ่าน Location แล้ว poll โดยเว้นช่วงและหยุดเมื่อออกจากหน้าหรือเห็น terminal state",
      ],
      table: [
        ["POST /ingest", "อัปโหลดและเก็บ job_id จากใบรับ"],
        ["Retry-After", "เว้นเวลาก่อนลองส่งซ้ำด้วย key เดิม"],
        ["GET /jobs/{job_id}", "แสดง progress state ที่อ่านล่าสุด"],
      ],
    },
    student: {
      title: "First-Year Note — งานในมือกับงานในคิว",
      body: [
        "ลองวางกระดาษสองแผ่นแทนคิว แล้วหยิบหนึ่งแผ่นไว้ในมือ กระดาษในมือไม่กินช่องรอ แต่ยังต้องคืนสัญญาณ task_done หลังจัดการเสร็จ",
        "ในภาพมีสอง worker และปุ่ม retry ด้วยมือ ส่วนโค้ดมี worker เดียวและลองใหม่อัตโนมัติขณะเป็น retrying การส่ง POST ซ้ำด้วย key เดิมมีหน้าที่หาใบรับเดิม",
      ],
    },
  },

  workedExample: {
    intro: "นำเข้าเอกสารใบกำกับภาษีของ Thai Knowledge RAG ฉบับ v3 ให้รอบแรก fail ชั่วคราว และตาม job เดียวจนสร้างสอง chunk สำเร็จ",
    steps: [
      {
        title: "1 · สร้าง contract และ index จำลอง",
        explain: "คัดลอกส่วนนี้ลง ingest_api.py สัญญา IngestRequest ทำ normalization และทำข้อมูล immutable สำหรับเทียบ key ส่วน LocalIndex แทนที่เอกสารหลังเตรียม chunk ครบ",
        code: { language: "python", filename: "ingest_api.py", code: models },
        output: "Input billing-v3 + ข้อความไทยสองบรรทัด → สอง chunk เมื่อเจอรอบที่สำเร็จ",
      },
      {
        title: "2 · ต่อ worker กับ API",
        explain: "ต่อโค้ดในไฟล์เดิม ให้ lifespan เปิด consumer ก่อนรับ request จากนั้นเปิดเซิร์ฟเวอร์ด้วย uv run uvicorn ingest_api:app --workers 1",
        code: { language: "python", filename: "ingest_api.py", code: [worker, routes].join("\n\n\n") },
        output: "POST /ingest → 202 Accepted, Location: /jobs/<job_id> ส่วน GET URL เดิมคืนสถานะ",
      },
      {
        title: "3 · ส่งซ้ำและ poll ด้วย HTTPX",
        explain: "รัน uv run python poll_job.py ในอีกเทอร์มินัล ผลขึ้นกับจังหวะ polling ซึ่งอาจข้าม queued หรือ retrying ได้",
        code: { language: "python", filename: "poll_job.py", code: `import asyncio

import httpx


async def main():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        payload = {
            "document_id": "billing-v3",
            "text": "ออกใบกำกับภาษี\\nแจ้งเลขคำสั่งซื้อผ่านศูนย์ช่วยเหลือ",
            "scenario": "retry",
        }
        headers = {"Idempotency-Key": "billing-v3-upload"}
        first = await client.post("/ingest", json=payload, headers=headers)
        first.raise_for_status()
        again = await client.post("/ingest", json=payload, headers=headers)
        again.raise_for_status()
        print(first.status_code, first.headers["location"])
        print("same job:", first.json()["job_id"] == again.json()["job_id"])

        async with asyncio.timeout(3):
            while True:
                result = await client.get(first.headers["location"])
                result.raise_for_status()
                job = result.json()
                print(job["status"], job["attempts"], job["chunks_indexed"])
                if job["status"] in {"succeeded", "failed"}:
                    break
                await asyncio.sleep(0.025)


if __name__ == "__main__":
    asyncio.run(main())` },
        output: `202 /jobs/da799c15009e4d788021617750735dd8
same job: True
running 1 None
retrying 1 None
running 2 None
succeeded 2 2`,
      },
    ],
    gotcha: "polling ไม่รับประกันว่าจะเห็นทุก intermediate state ให้ใช้เทสต์ที่จับ worker ไว้ด้วย Event เมื่อจำเป็นต้องพิสูจน์สถานะหนึ่งโดยเฉพาะ",
  },

  practice: {
    intro: "เติม TODO ให้ endpoint ตอบรับทันที และให้ worker เขียนผลสำเร็จหรือรหัสล้มเหลวโดยไม่ทำงานซ้ำ",
    requirements: [
      "POST คืน 202, Location และ job_id ส่วน GET คืน snapshot หรือ 404",
      "POST ซ้ำด้วย key และ payload เดิมคืน job_id เดิม ส่วน payload ต่างกันคืน 409",
      "คิวเต็มคืน 503 และ Retry-After โดยไม่เก็บ key ของงานที่ยังไม่รับ",
      "ใช้ timeout ต่อ attempt และ backoff เมื่อ error ชั่วคราว ล้มถาวรให้หยุดทันที",
      "ส่ง task_done หนึ่งครั้งต่อ item ที่หยิบ และรอ drain แบบมีเวลาสูงสุดตอน shutdown",
    ],
    starter: { language: "python", filename: "ingest_api.py", code: [models, workerStarter, routesStarter].join("\n\n\n") },
    verification: { language: "python", filename: "test_ingest_api.py", code: `import asyncio

import httpx
import pytest

from ingest_api import QUEUE_CAPACITY, LocalIndex, app, lifespan


pytestmark = pytest.mark.anyio
PAYLOAD = {"document_id": "billing-v3", "text": "ใบกำกับภาษี\\nติดต่อศูนย์ช่วยเหลือ"}


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with lifespan(app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as session:
            yield session


async def post(client, key, **changes):
    return await client.post(
        "/ingest", headers={"Idempotency-Key": key}, json={**PAYLOAD, **changes}
    )


async def finished(client, accepted):
    assert accepted.status_code == 202
    async with asyncio.timeout(1):
        await app.state.ingest.queue.join()
    result = await client.get(accepted.headers["location"])
    assert result.status_code == 200
    return result.json()


async def test_concurrent_duplicate_is_one_job(client):
    first, second = await asyncio.gather(post(client, "upload-a"), post(client, "upload-a"))
    assert first.status_code == second.status_code == 202
    assert first.json() == second.json()
    assert first.headers["location"] == first.json()["status_url"]
    job = await finished(client, first)
    assert job["status"] == "succeeded" and job["attempts"] == 1
    assert job["chunks_indexed"] == 2
    assert len(app.state.ingest.jobs) == 1


async def test_key_conflict_and_not_found(client):
    original = await post(client, "upload-a")
    conflict = await post(client, "upload-a", text="คนละเอกสาร")
    assert conflict.status_code == 409
    assert original.status_code == 202
    assert (await client.get("/jobs/missing")).status_code == 404


@pytest.mark.parametrize(
    "scenario, expected_status, attempts, error",
    [
        ("retry", "succeeded", 2, None),
        ("exhaust", "failed", 3, "retry_exhausted"),
        ("invalid", "failed", 1, "invalid_document"),
    ],
)
async def test_retry_policy(client, scenario, expected_status, attempts, error):
    accepted = await post(client, "policy", scenario=scenario)
    job = await finished(client, accepted)
    assert (job["status"], job["attempts"], job["error"]) == (
        expected_status, attempts, error
    )
    replay = await post(client, "policy", scenario=scenario)
    assert replay.json() == accepted.json()
    assert (await client.get(replay.headers["location"])).json() == job


async def test_full_queue_preserves_replay_and_does_not_reserve_key(client, monkeypatch):
    started = asyncio.Event()
    release = asyncio.Event()
    original = LocalIndex.index

    async def gated_index(self, document, attempt):
        if document.document_id == "hold":
            started.set()
            await release.wait()
        return await original(self, document, attempt)

    monkeypatch.setattr(LocalIndex, "index", gated_index)
    held = await post(client, "held", document_id="hold")
    try:
        await asyncio.wait_for(started.wait(), timeout=1)
        status = await client.get(held.headers["location"])
        assert status.json()["status"] == "running"
        for n in range(QUEUE_CAPACITY):
            queued = await post(client, f"queued-{n}", document_id=f"queued-{n}")
            assert queued.status_code == 202
            status = await client.get(queued.headers["location"])
            assert status.json()["status"] == "queued"

        full = await post(client, "later")
        assert full.status_code == 503 and full.headers["retry-after"] == "1"
        assert "later" not in app.state.ingest.key_to_job
        replay = await post(client, "held", document_id="hold")
        assert replay.status_code == 202
        assert replay.json() == held.json()
    finally:
        release.set()

    await finished(client, held)
    assert (await post(client, "later")).status_code == 202


async def test_validation_and_drain_on_shutdown():
    async with lifespan(app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            assert (await client.post("/ingest", json=PAYLOAD)).status_code == 422
            assert (await post(client, "empty", text=" ")).status_code == 422
            assert (await post(client, "drain")).status_code == 202
            runtime = app.state.ingest
    assert runtime.index.documents["billing-v3"] == ("ใบกำกับภาษี", "ติดต่อศูนย์ช่วยเหลือ")
    assert runtime.queue.empty()` },
    selfCheck: [
      "เทสต์สอง POST พร้อมกันด้วย key เดียว สุดท้าย registry มีงานเดียว",
      "scenario retry สำเร็จรอบสอง, exhaust ล้มรอบสาม, invalid หยุดรอบแรก",
      "รัน poll_job.py แล้วเทียบ Location กับ status_url และจำนวน chunk",
    ],
    acceptance: "pytest ผ่าน 7 เคส และไคลเอนต์ตามงาน v3 ไปจน succeeded ที่ attempts = 2, chunks_indexed = 2",
    hints: [
      { body: "เขียนสถานะลง job เดิมทุกครั้ง ให้ task_done อยู่กับ queue item และ attempts อยู่กับแต่ละรอบของงาน" },
      { body: "ตรวจ key ก่อน put_nowait แล้วค่อยบันทึก registry เมื่อ put สำเร็จ ดัก TimeoutError นอก asyncio.timeout" },
      {
        body: "คัดลอก ingest_api.py ด้านล่าง จากนั้นรันชุด pytest ในช่องตรวจผลเพื่อยืนยัน HTTP และ lifecycle",
        code: { language: "python", filename: "ingest_api.py", code: [models, worker, routes].join("\n\n\n") },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q test_ingest_api.py
uv run uvicorn ingest_api:app --host 127.0.0.1 --port 8000 --workers 1
# In another terminal:
uv run python poll_job.py`,
    },
  },

  mistakes: [
    {
      title: "รายงานว่า index สำเร็จตั้งแต่ตอบ 202",
      symptom: "หน้าเว็บเริ่มค้นเอกสารที่ worker ยังไม่ได้จัดเก็บ",
      fix: "แสดงเลขรับงาน แล้วตรวจสถานะ terminal จาก GET",
    },
    {
      title: "จอง key ก่อนรู้ว่าคิวรับได้",
      symptom: "client ได้ 503 แล้วส่งซ้ำพบ job ที่ไม่เคยอยู่ในคิว",
      fix: "ตรวจ replay ก่อน แล้วบันทึก registry หลัง put_nowait สำเร็จใน event-loop turn เดียว",
    },
    {
      title: "retry error ทุกชนิดหรือ append chunk ทุกครั้ง",
      symptom: "เอกสารเสียหน่วงคิว หรือผลค้นเจอ chunk เดิมหลายรายการ",
      fix: "จำกัดจำนวนครั้ง แยก error ถาวร และใช้ upsert ตาม ID คงที่",
    },
    {
      title: "เพิ่ม Uvicorn worker เพื่อหวังแชร์คิวเดิม",
      symptom: "POST ได้ job_id แต่ GET จาก process อื่นตอบ 404",
      fix: "ใช้หนึ่ง worker ในแล็บ เมื่อแยก process ให้ย้าย queue, status และ idempotency ไป storage ที่แชร์ร่วมกัน",
    },
  ],
  quiz: {
    questions: [
      mc(
        "d139-q1", "เมื่อ POST คืน 202 ควรแจ้งอะไรกับผู้ใช้?",
        [
          ["ค้นเอกสารได้แล้ว", "ต้องตรวจผล indexing ก่อน"],
          ["รับงานและมี URL สำหรับติดตาม", "job อาจยังอยู่ในคิวหรือกำลังทำ"],
          ["เอกสารผิดรูปแบบ", "validation error ใช้ 422"],
          ["ต้องส่งเอกสารเดิมทันที", "การส่งซ้ำไม่ทำให้งานเร็วขึ้น"],
        ],
        "B", "202 คือการตอบรับ ส่วน succeeded คือผลประมวลผล",
        "สถานะไหนบอกว่า index เสร็จ?", "succeeded จาก GET status",
      ),
      mc(
        "d139-q2", "ถ้า client ส่ง key และ payload เดิมตอนคิวเต็มควรได้อะไร?",
        [
          ["503 เสมอ", "นี่เป็นการอ่านใบรับเดิม"],
          ["เพิ่มงานเป็นกรณีพิเศษ", "จะทำลายขอบเขตคิว"],
          ["409 แม้เนื้อหาเหมือนเดิม", "409 ใช้เมื่อ payload ต่าง"],
          ["202 พร้อม ID เดิม", "ตรวจ replay ก่อนเพิ่มงานใหม่"],
        ],
        "D", "replay ใช้ registry และไม่ใช้ช่องคิวเพิ่ม",
        "payload ต่างกับ key เดิมตอบอะไร?", "409",
      ),
      mc(
        "d139-q3", "สาม attempts กับฐาน 50 มิลลิวินาทีมีเวลารอกี่ช่วง?",
        [
          ["สองช่วง 50 และ 100", "ครั้งที่สามจบด้วยผลสำเร็จหรือล้มเหลว"],
          ["สามช่วง 50, 100 และ 200", "ไม่ต้องรอหลังรอบสุดท้าย"],
          ["หนึ่งช่วง 150", "ต้องรอก่อนรอบสองและสามแยกกัน"],
          ["ศูนย์ช่วง", "จะลองซ้ำทันที"],
        ],
        "A", "รอก่อน attempt ถัดไปเมื่อเป็น error ชั่วคราวและยังเหลือรอบให้ลอง",
        "ทำไม invalid document หยุดทันที?", "input เดิมไม่เปลี่ยน รอนานขึ้นก็ไม่ช่วย",
      ),
      mc(
        "d139-q4", "เมื่อมีหลาย API process ควรแชร์อะไรเพื่ออ่านผลและกันงานซ้ำ?",
        [
          ["app.state ของแต่ละ process", "อยู่คนละ address space"],
          ["localhost port", "พอร์ตใช้รับ connection"],
          ["queue/broker และ registry ของงานกับ key", "ทุก process ใช้ข้อมูลอ้างอิงเดียวกัน"],
          ["HTTP timeout", "เวลาไม่ทำให้เห็น registry ข้าม process"],
        ],
        "C", "broker ทำงานร่วมกับสถานะงาน กฎ idempotency และวิธีกู้คืนงาน",
        "คิวแล็บอยู่ได้นานเท่าไร?", "อยู่ใน memory ของ process ที่เปิด lifespan",
      ),
    ],
  },

  takeaways: [
    "202 กับ Location คือใบรับงาน ส่วน GET ใช้ดู queued, running, retrying และสถานะจบ",
    "จัดขอบเขตความจุคิว กติกา key และผลของ POST ซ้ำก่อน deploy",
    "retry เฉพาะ error ชั่วคราว จำกัด attempts และทำให้ผลข้างเคียงรองรับ retry",
    "D140 กลับไปวัด SSE หลายผู้ใช้พร้อมกันผ่าน chat path ที่แยกจาก ingestion",
  ],
  reviewCards: [
    rc("d139-rc-1", "งานที่หยิบไปแล้วนับใน maxsize ไหม?", "ไม่นับ maxsize จำกัดงานรอ ส่วนจำนวน worker จำกัดงานที่ทำอยู่"),
    rc("d139-rc-2", "ทำไม task_done อยู่ใน finally?", "ส่งสัญญาณหนึ่งครั้งต่อ item ที่ get มา แม้ job จะล้ม"),
    rc("d139-rc-3", "idempotency ของ POST กับ upsert ของ worker ต่างกันอย่างไร?", "ข้อแรกกัน job ซ้ำ ข้อหลังกันผลซ้ำเมื่อ job ถูกประมวลผลใหม่"),
    rc("d139-rc-4", "เมื่อไรควรแยก worker บน broker?", "เมื่อต้องทน restart, ทำงานข้าม process หรือปรับจำนวน worker แยกจาก API"),
  ],
  sources: [
    { label: "RFC 9110 — 202 Accepted", href: "https://www.rfc-editor.org/rfc/rfc9110.html#name-202-accepted" },
    { label: "Python 3.12 — asyncio Queues", href: "https://docs.python.org/3.12/library/asyncio-queue.html" },
    { label: "FastAPI — Background Tasks", href: "https://fastapi.tiangolo.com/tutorial/background-tasks/" },
    { label: "arq — Job queues with asyncio and Redis", href: "https://arq-docs.helpmanual.io/" },
    { label: "Celery — Introduction", href: "https://docs.celeryq.dev/en/stable/getting-started/introduction.html" },
    { label: "RQ — Documentation", href: "https://python-rq.org/docs/" },
  ],
  glossary: ["fastapi", "asyncio", "httpx", "pydantic", "idempotency", "exponential-backoff", "embedding", "rag", "pytest"],
});
