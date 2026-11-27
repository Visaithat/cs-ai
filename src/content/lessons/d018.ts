import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D018 — Phase 1 / Block B05
 * Concurrent Requests with asyncio.gather & Semaphore.
 */
export const d018: Lesson = defineLesson({
  day: 18,
  titleTh: "ยิงคำขอพร้อมกันอย่างปลอดภัยด้วย asyncio.gather และ Semaphore",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% · ใช้ httpx.AsyncClient คู่ asyncio.Semaphore(n) และ gather เพื่อเร่งความเร็ว batch โดยไม่ชน 429",
  icon: "layers",
  visual: {
    id: "semaphore-stream",
    title: "Bounded Concurrency — คุมแรงยิงด้วย asyncio.Semaphore + gather",
    caption:
      "เลื่อนจำนวน concurrency limit เพื่อเห็นความเร็วที่เพิ่มขึ้นโดยไม่ทะลุเพดาน rate limit 429",
    alt: "แผนภาพการใช้ asyncio.Semaphore จำกัดจำนวนคำขอพร้อมกัน",
  },
  requiresApiKey: false,
  tools: ["asyncio", "httpx", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ดึงและเสริมข้อมูลชุดใหญ่โดยไม่ทำต้นทางล่ม",
      body: "งานเตรียมข้อมูลให้ AI เช่น ดึงข้อมูลสินค้า 100 รายการหรือเรียก API แปล/สรุปเอกสารทีละชุด หากยิงพร้อมกันหมดทีเดียวจะชน {{rate-limit}} (HTTP 429) แต่ถ้ายิงทีละชิ้นก็ช้าเกินไป",
      lessonNote:
        "วันนี้เราใช้ {{semaphore|asyncio.Semaphore(n)}} คู่กับ `httpx.AsyncClient` ใบเดียวเพื่อคุมจำนวนคำขอที่วิ่งพร้อมกันให้อยู่ในเพดานปลอดภัย",
    },
    {
      node: 2,
      heading: "เร่งความเร็ว Batch Inference และ Embedding หลายเท่าตัว",
      body: "เวลาส่งข้อความหลายสิบรายการไปขอ {{embedding}} หรือเรียก {{llm}} การเปิดช่องทาง concurrent แบบคุมเพดานช่วยลดเวลารอรวมจากหลายนาทีเหลือไม่กี่สิบวินาที",
      lessonNote:
        "`asyncio.gather(..., return_exceptions=True)` ช่วยให้รัน batch พร้อมกันและคัดแยกคำขอที่พังบางชิ้นออกได้โดยไม่ทิ้งงานที่เหลือ",
    },
    {
      node: 4,
      heading: "ออกแบบ Backend ที่แยกแยะงาน All-or-Nothing กับ Partial Batch",
      body: "ในแอปจริง บางคำขอต้องได้ข้อมูลครบทุกชิ้นถึงจะตอบได้ (fail-fast) แต่บางงานเช่น batch ingestion ควรเก็บผลลัพธ์ของรายการที่สำเร็จไว้แม้อีกไม่กี่รายการจะล้มเหลว",
      lessonNote:
        "คุณจะได้เทียบข้อดี-ข้อเสียของ `asyncio.TaskGroup` ({{fail-fast}}) กับ `asyncio.gather(..., return_exceptions=True)` (fault isolation)",
    },
    {
      node: 5,
      heading: "ควบคุม Peak Concurrency และลดการรั่วไหลของ Socket",
      body: "การสร้าง HTTP client ใหม่ในทุก coroutine ทำให้เปิด TCP/TLS connection ซ้ำซ้อนจนพอร์ตเต็มและ latency แกว่งใน production",
      lessonNote:
        "การแชร์ `httpx.AsyncClient` ใบเดียวข้าม task และวัดค่า `peak_in_flight` ในเทสต์คือเกราะป้องกันที่ทดสอบได้บนเครื่อง 100%",
    },
  ],

  objectives: [
    "**ใช้งาน** `httpx.AsyncClient` แบบแชร์อินสแตนซ์เดียว (connection pooling) ข้ามหลาย coroutine แทนการเปิด client ใหม่ทุกคำขอ",
    "**จำกัดจำนวนคำขอพร้อมกัน (Bounded Concurrency)** ด้วย {{semaphore|asyncio.Semaphore(n)}} เพื่อเร่งความเร็ว batch โดยไม่ละเมิด {{rate-limit}}",
    "**เลือกใช้** `asyncio.gather(..., return_exceptions=True)` เทียบกับ `asyncio.TaskGroup` เพื่อจัดการความล้มเหลวบางส่วน (partial batch failure) ได้อย่างถูกต้อง",
  ],

  prerequisites: [
    "เข้าใจ Event Loop, coroutine และ `await` จาก Day 17",
    "รู้จัก `httpx`, HTTP status code และ `httpx.MockTransport` จาก Block B04",
    "มี Python 3.11+ และ `uv` พร้อม `httpx`, `pytest`, `ruff` บนเครื่อง",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — จำลอง API ด้วย `httpx.MockTransport` 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ขนาดเล็กด้วย {{uv}} และติดตั้ง {{httpx}} พร้อม `pytest` และ `ruff` สำหรับทดลองยิงคำขอ concurrent แบบ 100% local ผ่าน `httpx.MockTransport`",
    commands: `uv init ai-day18-semaphore && cd ai-day18-semaphore
uv add httpx
uv add --dev pytest ruff

# ตรวจเวอร์ชัน Python และ httpx
uv run python -c "import httpx, sys; print(sys.version.split()[0], httpx.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day18-semaphore` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `httpx` และ dev tools (`pytest`, `ruff`) ด้วย `uv add`"],
      ["verify", "รันคำสั่งเช็กเวอร์ชัน Python 3.11+ และ `httpx` สำเร็จ"],
    ],
    note: "ตัวอย่างและเทสต์ทั้งหมดในบทนี้ใช้ `httpx.MockTransport` จำลองเซิร์ฟเวอร์ที่มีเพดาน concurrency ในหน่วยความจำ จึงรันได้เร็ว แม่นยำ และไม่ต้องต่อเน็ต",
  },

  concepts: [
    {
      id: "shared-async-client",
      title: "1 · แชร์ `httpx.AsyncClient` ใบเดียวเพื่อใช้ Connection Pool ร่วมกัน",
      paragraphs: [
        "ความผิดพลาดที่พบบ่อยเวลาเพิ่งเริ่มใช้ {{httpx}} แบบ async คือการเขียน `async with httpx.AsyncClient() as client:` ไว้ **ข้างใน** ฟังก์ชันที่ถูกเรียกซ้ำ 50 ครั้ง ผลคือทุกคำขอต้องจับมือ TCP และ TLS ใหม่ตั้งแต่ต้น เสียเวลาเพิ่มหลายร้อยมิลลิวินาที และอาจเปิด socket ค้างเกินขีดจำกัดของ OS",
        "แนวทางมาตรฐานคือสร้าง `httpx.AsyncClient` **ใบเดียว** ไว้ที่ขอบนอกของ batch (หรือช่วง lifespan ของ {{fastapi}}) แล้วส่ง `client` เข้าไปให้ทุก coroutine ใช้ร่วมกัน เพื่อให้ไลบรารีรีไซเคิลการเชื่อมต่อผ่าน HTTP Keep-Alive connection pool ได้เต็มประสิทธิภาพ",
      ],
      analogy:
        "เหมือนสำนักงานที่มีตู้สายโทรศัพท์คู่สายตรงกับคู่ค้าไว้ใช้ร่วมกันทั้งแผนก แทนที่พนักงาน 50 คนจะต้องขอติดตั้งเบอร์โทรศัพท์ใหม่แล้วรื้อทิ้งทุกครั้งที่โทรเสร็จ",
      bullets: [
        "**เปิดครั้งเดียวที่ขอบงาน**: ใช้ `async with httpx.AsyncClient(timeout=5.0) as client:` ครอบการรันทั้ง batch",
        "**ตั้ง Timeout ชัดเจนเสมอ**: ส่ง `httpx.Timeout(5.0)` เพื่อกัน coroutine แขวนค้างไม่จบ",
        "**ทดสอบ 100% Offline**: ส่ง `transport=httpx.MockTransport(handler)` เข้า `AsyncClient` เพื่อ {{mocking|mock}} API โดยไม่ต้องแก้โค้ดธุรกิจ",
      ],
      whyTitle: "Why this matters — Connection Pooling คือต้นทุนแฝงของ AI Pipeline",
      whyParagraphs: [
        "เมื่อยิงเรียก {{llm}} API หรือ Vector DB หลายร้อยคำขอต่อนาที การตั้ง TLS handshake ใหม่ทุกครั้งทำให้ P95 latency พุ่งสูงและอาจเจอ `Too many open files` ใน container ที่มี limit ต่ำ",
        "การรับ `client: httpx.AsyncClient` เป็นพารามิเตอร์ยังทำให้โค้ดของคุณทดสอบง่าย (Dependency Injection) เพราะใน {{pytest}} เราแค่ส่ง `AsyncClient(transport=MockTransport(...))` เข้าไปแทนเครือข่ายจริง",
      ],
    },
    {
      id: "bounded-concurrency-semaphore",
      title: "2 · คุมแรงยิงด้วย `asyncio.Semaphore(n)` ไม่ให้ทะลุ Rate Limit",
      paragraphs: [
        "เมื่อรู้วิธีรัน concurrent แล้ว กับดักถัดมาคือ **Unbounded Concurrency** — โยนงาน 500 ชิ้นเข้า `asyncio.gather(*tasks)` พร้อมกันหมดในเสี้ยววินาที ผลที่ตามมาแทบจะแน่นอนคือเซิร์ฟเวอร์ปลายทางส่ง HTTP `429 Too Many Requests` กลับมาเป็นแผง หรือตัดการเชื่อมต่อเพราะรับภาระไม่ไหว",
        "{{semaphore|asyncio.Semaphore(n)}} คือตัวนับสิทธิ์แบบ non-blocking ที่อนุญาตให้มี coroutine เข้าไปทำงานในบล็อก `async with sem:` ได้พร้อมกันสูงสุด `n` ตัวเท่านั้น ตัวที่ `n + 1` จะพักรอบน Event Loop โดยไม่ block thread และจะถูกปลุกทันทีที่มีตัวใดตัวหนึ่งออกจากบล็อก `async with`",
      ],
      analogy:
        "เหมือนลานจอดรถที่มีบัตรผ่านเข้าออกแค่ 3 ใบ (`Semaphore(3)`) — รถคันที่ 1–3 ขับเข้าไปจอดพร้อมกันได้ ส่วนคันที่ 4 ต้องรอที่ไม้กั้นจนกว่าจะมีรถสักคันขับออกและคืนบัตร",
      code: {
        language: "python",
        filename: "semaphore_demo.py",
        code: `import asyncio
import httpx


async def fetch_item(
    client: httpx.AsyncClient,
    item_id: str,
    sem: asyncio.Semaphore,
) -> dict[str, str]:
    # จำกัดจำนวนคำขอที่วิ่งออกไปยังเซิร์ฟเวอร์พร้อมกันไม่เกินเพดานของ sem
    async with sem:
        resp = await client.get(f"https://api.example.local/items/{item_id}")
        resp.raise_for_status()
        return resp.json()


async def main() -> None:
    async def mock_handler(request: httpx.Request) -> httpx.Response:
        await asyncio.sleep(0.08)
        item_id = request.url.path.rsplit("/", 1)[-1]
        return httpx.Response(200, json={"id": item_id, "status": "ok"})

    sem = asyncio.Semaphore(3)  # แชร์ใบเดียวให้ทุก task
    ids = [f"doc-{i}" for i in range(6)]
    async with httpx.AsyncClient(transport=httpx.MockTransport(mock_handler)) as client:
        results = await asyncio.gather(*(fetch_item(client, i, sem) for i in ids))
    print(f"Fetched {len(results)} items:", [r["id"] for r in results])


asyncio.run(main())`,
        caption:
          "6 คำขอที่แต่ละคำขอใช้เวลา 0.08s เมื่อจำกัดด้วย `Semaphore(3)` จะวิ่งเป็น 2 ระลอก จบใน ~0.16s (เร็วกว่า sequential ~3 เท่า) โดยไม่เคยมีคำขอค้างพร้อมกันเกิน 3",
      },
      whyTitle: "Why this matters — เร็วแบบควบคุมได้ดีกว่าเร็วแล้วพัง",
      whyParagraphs: [
        "ผู้ให้บริการ LLM และ Embedding แทบทุกรายกำหนดเพดานทั้ง requests-per-minute (RPM) และจำนวนการเชื่อมต่อพร้อมกัน การคุมด้วย `Semaphore(n)` คือด่านแรกที่ช่วยป้องกันไม่ให้โค้ดเราสร้าง DDoS ใส่ API ของตัวเอง",
        "นอกจากนี้ ค่า `n` ยังเป็นปุ่มปรับจูนที่ชัดเจน (เช่น ตั้งผ่าน config `MAX_CONCURRENCY=5`) เพื่อให้ทีมปรับตามโควต้าของแต่ละ environment (dev vs prod) ได้โดยไม่ต้องแก้โค้ด",
      ],
    },
    {
      id: "gather-vs-taskgroup",
      title: "3 · เลือกใช้ `asyncio.gather(..., return_exceptions=True)` เทียบกับ `TaskGroup`",
      paragraphs: [
        "ใน Day 17 เราใช้ `asyncio.TaskGroup()` ซึ่งทำงานแบบ **{{fail-fast}}**: หาก 1 ใน 10 task โยน exception ตัว `TaskGroup` จะสั่งยกเลิก task อีก 9 ตัวที่เหลือทันทีแล้วโยน `ExceptionGroup` ออกมา เหมาะมากกับงานที่ต้องการข้อมูลครบทุกชิ้นถึงจะไปต่อได้ (เช่น ดึง `profile` + `permissions` ก่อนตอบคำถามเดียว)",
        "แต่สำหรับงาน **Batch Processing** (เช่น ดึงข้อมูลเอกสาร 20 รายการเพื่อทำดัชนี) ถ้าเอกสารใบที่ 7 คืน `404` หรือ `500` เราไม่ควรทิ้งผลลัพธ์ของอีก 19 ใบที่สำเร็จแล้ว `asyncio.gather(*coros, return_exceptions=True)` จะรอทุกงานให้จบ โดย **คืนออบเจกต์ exception ไว้ในตำแหน่งเดิมของ list** แทนที่จะโยนออกมากลางคัน เพื่อให้เราคัดแยกด้วย `isinstance(res, Exception)` อย่างเป็นระเบียบ",
      ],
      analogy:
        "TaskGroup เหมือนทีมส่งเอกสารสัญญาชุดเดียวที่ถ้าขาดหน้าใดหน้าหนึ่งต้องยกเลิกการเซ็นทั้งหมด ส่วน `gather(return_exceptions=True)` เหมือนไปรษณีย์ส่งพัสดุ 20 กล่อง — ถ้ากล่องที่ 7 บ้านปิด ก็จดใบแจ้งเหตุผลแยกไว้แล้วส่งอีก 19 กล่องต่อจนครบ",
      code: {
        language: "python",
        filename: "gather_isolation.py",
        code: `import asyncio


async def classify(text: str) -> str:
    await asyncio.sleep(0.05)
    if not text.strip():
        raise ValueError("empty input")
    return f"ok:{text}"


async def main() -> None:
    inputs = ["ขอใบเสร็จ", "   ", "ติดตามพัสดุ"]
    raw_results = await asyncio.gather(
        *(classify(t) for t in inputs),
        return_exceptions=True,
    )

    succeeded: list[str] = []
    failed: list[tuple[int, str]] = []
    for idx, item in enumerate(raw_results):
        if isinstance(item, Exception):
            failed.append((idx, str(item)))
        else:
            succeeded.append(item)

    print("succeeded:", succeeded)
    print("failed:", failed)


asyncio.run(main())`,
        caption:
          "`asyncio.gather` รักษาลำดับผลลัพธ์ตรงตามลำดับ input เสมอ แม้บางงานจะเสร็จช้าหรือเร็วไม่เท่ากัน",
      },
      whyTitle: "Why this matters — ระวัง `BaseException` vs `Exception`",
      whyParagraphs: [
        "เมื่อตั้ง `return_exceptions=True` ตัว `gather` จะจับ `BaseException` ทั้งหมดรวมถึง `asyncio.CancelledError` หากคุณตรวจแค่ `isinstance(item, Exception)` อย่างเดียวแล้วหลงลืม `CancelledError` ระบบอาจไม่รู้ว่า task ถูกยกเลิก",
        "ในโค้ดระดับ production หากเจอ `isinstance(item, BaseException)` ที่ไม่ใช่ `Exception` (เช่น `CancelledError`) ควรโยนต่อ (`raise item`) เสมอ เพื่อไม่ขัดขวางการปิดระบบอย่างสะอาด",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ `gather` และ `Semaphore` กับโลก JS/TS",
      body: [
        "ถ้าคุณเคยใช้ `Promise.all`, `Promise.allSettled` หรือแพ็กเกจ `p-limit` ใน Node.js/TypeScript แนวคิดแทบจะตรงกันแบบ 1 ต่อ 1 ต่างกันแค่ Python มี `asyncio.Semaphore` มากับ standard library โดยไม่ต้องลงแพ็กเกจเพิ่ม:",
      ],
      table: [
        ["`await asyncio.gather(*coros)`", "`await Promise.all(promises)` (หยุดทันทีเมื่อมีตัว reject)"],
        [
          "`await asyncio.gather(*coros, return_exceptions=True)`",
          "`await Promise.allSettled(promises)` (เก็บทั้งผลสำเร็จและ error)",
        ],
        ["`asyncio.TaskGroup()` (Python 3.11+)", "Structured concurrency ที่ยกเลิก sibling tasks อัตโนมัติเมื่อพัง"],
        ["`sem = asyncio.Semaphore(5)` + `async with sem:`", "`const limit = pLimit(5); limit(() => fetch(...))`"],
        ["แชร์ `httpx.AsyncClient` ใบเดียว", "ใช้ `undici.Pool` หรือ HTTP Keep-Alive Agent ร่วมกัน"],
      ],
    },
    student: {
      title: "First-Year Note — `Semaphore(n)` ทำงานข้างในอย่างไร",
      body: [
        "ลองจินตนาการว่า `Semaphore(n)` มีตัวเลขเคาน์เตอร์ข้างในเริ่มที่ `n` (เช่น `3`) ทุกครั้งที่ coroutine เข้า `async with sem:` เคาน์เตอร์จะลดลง 1 (`3 → 2 → 1 → 0`)",
        "เมื่อเคาน์เตอร์เป็น `0` coroutine ที่มาทีหลังจะยังไม่เข้าไปทำงาน แต่จะไปต่อแถวรออย่างเงียบ ๆ บน Event Loop (ไม่เปลือง CPU) พอ coroutine ข้างในจบงานหรือเกิด error ตัว `async with` จะรับประกันการบวกเคาน์เตอร์กลับ +1 เสมอแล้วปลุกตัวถัดไปในคิวขึ้นมาทันที",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามี mock API ที่อนุญาตให้มีคำขอค้างพร้อมกันได้ไม่เกิน **3 คำขอ** (ถ้าเกินจะคืน HTTP `429`) และมี 1 รายการที่เซิร์ฟเวอร์คืน HTTP `500` ลองดูการพัฒนาทีละขั้นจากโค้ดที่ชน 429 ไปจนถึง batch fetcher ที่เร็ว ปลอดภัย และแยก error รายชิ้นได้ครบ",
    steps: [
      {
        title: "1 · จำลองเซิร์ฟเวอร์ที่มีเพดาน Concurrency = 3 และดูปัญหา Unbounded gather",
        explain:
          "สร้าง `MockTransport` ที่นับ `in_flight` และ `peak_in_flight` — เมื่อยิง 6 คำขอพร้อมกันโดยไม่มี `Semaphore` ค่า `in_flight` จะพุ่งเป็น 6 และชน HTTP 429 ทันที",
        code: {
          language: "python",
          filename: "worked_d018_step1.py",
          code: `import asyncio
import httpx


def make_rate_limited_transport(max_allowed: int = 3) -> tuple[httpx.MockTransport, dict[str, int]]:
    stats = {"in_flight": 0, "peak": 0, "status_429": 0}

    async def handler(request: httpx.Request) -> httpx.Response:
        stats["in_flight"] += 1
        stats["peak"] = max(stats["peak"], stats["in_flight"])
        try:
            if stats["in_flight"] > max_allowed:
                stats["status_429"] += 1
                return httpx.Response(429, json={"error": "too many concurrent requests"})
            await asyncio.sleep(0.08)
            item_id = request.url.path.rsplit("/", 1)[-1]
            if item_id == "bad-1":
                return httpx.Response(500, json={"error": "upstream crash"})
            return httpx.Response(200, json={"id": item_id, "summary": f"สรุป-{item_id}"})
        finally:
            stats["in_flight"] -= 1

    return httpx.MockTransport(handler), stats


async def unbounded_run() -> None:
    transport, stats = make_rate_limited_transport(max_allowed=3)
    ids = ["doc-1", "doc-2", "doc-3", "doc-4", "doc-5", "doc-6"]
    async with httpx.AsyncClient(transport=transport) as client:
        responses = await asyncio.gather(*(client.get(f"https://api.local/items/{i}") for i in ids))
    print("Statuses:", [r.status_code for r in responses], "stats:", stats)


asyncio.run(unbounded_run())`,
        },
        output: `Statuses: [200, 200, 200, 429, 429, 429] stats: {'in_flight': 0, 'peak': 6, 'status_429': 3}`,
      },
      {
        title: "2 · ใส่ `asyncio.Semaphore(3)` คุมเพดาน Peak Concurrency ให้รอดจาก 429",
        explain:
          "หุ้มการเรียก `client.get(...)` ด้วย `async with sem:` ที่แชร์อินสแตนซ์เดียวข้ามทุก task — ค่า `peak` จะไม่เกิน 3 และไม่มี 429 เกิดขึ้นเลย โดยเวลารวมอยู่ที่ ~0.16s (เร็วกว่า sequential ~3 เท่า)",
        code: {
          language: "python",
          filename: "worked_d018_step2.py",
          code: `import asyncio
import time
import httpx
from worked_d018_step1 import make_rate_limited_transport


async def bounded_get(
    client: httpx.AsyncClient,
    item_id: str,
    sem: asyncio.Semaphore,
) -> dict[str, str]:
    async with sem:
        resp = await client.get(f"https://api.local/items/{item_id}")
        resp.raise_for_status()
        return resp.json()


async def bounded_run() -> None:
    transport, stats = make_rate_limited_transport(max_allowed=3)
    sem = asyncio.Semaphore(3)
    ids = ["doc-1", "doc-2", "doc-3", "doc-4", "doc-5", "doc-6"]

    t0 = time.perf_counter()
    async with httpx.AsyncClient(transport=transport) as client:
        items = await asyncio.gather(*(bounded_get(client, i, sem) for i in ids))
    elapsed = time.perf_counter() - t0
    print(f"OK={len(items)} elapsed={elapsed:.2f}s stats={stats}")


asyncio.run(bounded_run())`,
        },
        output: `OK=6 elapsed=0.17s stats={'in_flight': 0, 'peak': 3, 'status_429': 0}`,
      },
      {
        title: "3 · แยกความล้มเหลวบางส่วนด้วย `return_exceptions=True` เมื่อเจอ `bad-1`",
        explain:
          "เมื่อมีรายการ `bad-1` ที่คืน HTTP 500 ปนอยู่ การตั้ง `return_exceptions=True` จะเก็บ exception ไว้ในผลลัพธ์แทนที่จะทำลายอีก 5 รายการที่ดี",
        code: {
          language: "python",
          filename: "worked_d018_step3.py",
          code: `import asyncio
import httpx
from worked_d018_step1 import make_rate_limited_transport
from worked_d018_step2 import bounded_get


async def resilient_batch() -> None:
    transport, stats = make_rate_limited_transport(max_allowed=3)
    sem = asyncio.Semaphore(3)
    ids = ["doc-1", "bad-1", "doc-2", "doc-3", "doc-4"]

    async with httpx.AsyncClient(transport=transport) as client:
        raw = await asyncio.gather(
            *(bounded_get(client, i, sem) for i in ids),
            return_exceptions=True,
        )

    ok: list[dict[str, str]] = []
    errors: list[tuple[str, str]] = []
    for item_id, res in zip(ids, raw, strict=True):
        if isinstance(res, BaseException):
            if not isinstance(res, Exception):
                raise res
            errors.append((item_id, type(res).__name__))
        else:
            ok.append(res)

    print("Succeeded IDs:", [x["id"] for x in ok])
    print("Errors:", errors, "peak:", stats["peak"])


asyncio.run(resilient_batch())`,
        },
        output: `Succeeded IDs: ['doc-1', 'doc-2', 'doc-3', 'doc-4']
Errors: [('bad-1', 'HTTPStatusError')] peak: 3`,
      },
    ],
    gotcha:
      "บั๊กลวงตายอดฮิต: เผลอเขียน `sem = asyncio.Semaphore(3)` ไว้ **ข้างใน** ฟังก์ชัน `bounded_get` แทนที่จะสร้างนอกลูปแล้วส่งเข้าไป — ผลคือทุก task ได้ Semaphore ส่วนตัวคนละใบที่มีสิทธิ์ 3 ใบเท่ากัน ทำให้ไม่มีการจำกัด concurrency เลยแม้แต่น้อย!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `bounded_fetcher.py` ที่รับ `httpx.AsyncClient` แบบแชร์อินสแตนซ์และดึงข้อมูลเป็น batch ด้วย `asyncio.Semaphore` คู่กับ `asyncio.gather(..., return_exceptions=True)` พร้อมแยกผลสำเร็จกับข้อผิดพลาดรายชิ้นอย่างชัดเจน",
    requirements: [
      "ประกาศ dataclass `FetchError(item_id: str, reason: str)` และ `BatchSummary(succeeded: list[dict[str, str]], failed: list[FetchError])`",
      "สร้าง `async def fetch_one(client: httpx.AsyncClient, item_id: str, sem: asyncio.Semaphore, base_url: str = 'https://api.local') -> dict[str, str]` ที่ใช้ `async with sem:` ครอบ `client.get(f'{base_url}/items/{item_id}')` เรียก `resp.raise_for_status()` และคืน `resp.json()`",
      "สร้าง `async def fetch_batch(client: httpx.AsyncClient, item_ids: list[str], *, max_concurrency: int = 3, base_url: str = 'https://api.local') -> BatchSummary` ที่ตรวจ `if max_concurrency < 1: raise ValueError(...)`, สร้าง `Semaphore(max_concurrency)` **ใบเดียว** แล้วรันทุกงานด้วย `asyncio.gather(..., return_exceptions=True)`",
      "แยกผลลัพธ์ลง `succeeded` และ `failed` โดย **รักษาลำดับตาม `item_ids`**, โยนต่อ (`raise`) หากเจอ `BaseException` ที่ไม่ใช่ `Exception` (เช่น `CancelledError`), และคืนค่า `BatchSummary([], [])` อย่างปลอดภัยเมื่อ `item_ids` ว่าง",
    ],
    starter: {
      language: "python",
      filename: "bounded_fetcher.py",
      code: `import asyncio
from dataclasses import dataclass
import httpx


@dataclass(frozen=True)
class FetchError:
    item_id: str
    reason: str


@dataclass(frozen=True)
class BatchSummary:
    succeeded: list[dict[str, str]]
    failed: list[FetchError]


async def fetch_one(
    client: httpx.AsyncClient,
    item_id: str,
    sem: asyncio.Semaphore,
    base_url: str = "https://api.local",
) -> dict[str, str]:
    # TODO: ครอบ client.get ด้วย async with sem:, ตรวจ status และคืน resp.json()
    raise NotImplementedError


async def fetch_batch(
    client: httpx.AsyncClient,
    item_ids: list[str],
    *,
    max_concurrency: int = 3,
    base_url: str = "https://api.local",
) -> BatchSummary:
    # TODO: ตรวจ max_concurrency >= 1, แชร์ Semaphore ใบเดียว, ใช้ gather(return_exceptions=True)
    # แล้วแยก succeeded กับ failed โดยรักษาลำดับเดิม
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_bounded_fetcher.py",
      code: `import asyncio
import time
import httpx
import pytest
from bounded_fetcher import BatchSummary, fetch_batch


def make_mock_transport(delay: float = 0.08, max_allowed: int = 3):
    stats = {"in_flight": 0, "peak": 0, "rate_limited": 0}

    async def handler(request: httpx.Request) -> httpx.Response:
        stats["in_flight"] += 1
        stats["peak"] = max(stats["peak"], stats["in_flight"])
        try:
            if stats["in_flight"] > max_allowed:
                stats["rate_limited"] += 1
                return httpx.Response(429, json={"error": "rate limit"})
            await asyncio.sleep(delay)
            item_id = request.url.path.rsplit("/", 1)[-1]
            if item_id.startswith("bad-"):
                return httpx.Response(500, json={"error": "server error"})
            return httpx.Response(200, json={"id": item_id, "label": f"ok-{item_id}"})
        finally:
            stats["in_flight"] -= 1

    return httpx.MockTransport(handler), stats


def test_bounded_concurrency_and_speedup():
    async def run() -> tuple[BatchSummary, dict[str, int], float]:
        transport, stats = make_mock_transport(delay=0.08, max_allowed=3)
        ids = [f"doc-{i}" for i in range(9)]
        t0 = time.perf_counter()
        async with httpx.AsyncClient(transport=transport) as client:
            summary = await fetch_batch(client, ids, max_concurrency=3)
        return summary, stats, time.perf_counter() - t0

    summary, stats, elapsed = asyncio.run(run())
    assert len(summary.succeeded) == 9
    assert summary.failed == []
    assert [item["id"] for item in summary.succeeded] == [f"doc-{i}" for i in range(9)]
    assert stats["peak"] <= 3
    assert stats["rate_limited"] == 0
    # 9 คำขอ x 0.08s แบบเรียงลำดับคือ 0.72s; แบบ Semaphore(3) จบใน ~0.24s
    assert elapsed < 0.45


def test_partial_failure_isolation_preserves_order():
    async def run() -> BatchSummary:
        transport, _ = make_mock_transport(delay=0.03, max_allowed=3)
        ids = ["doc-1", "bad-1", "doc-2", "bad-2", "doc-3"]
        async with httpx.AsyncClient(transport=transport) as client:
            return await fetch_batch(client, ids, max_concurrency=3)

    summary = asyncio.run(run())
    assert [item["id"] for item in summary.succeeded] == ["doc-1", "doc-2", "doc-3"]
    assert [err.item_id for err in summary.failed] == ["bad-1", "bad-2"]
    assert all("500" in err.reason or "HTTPStatusError" in err.reason for err in summary.failed)


def test_invalid_concurrency_and_empty_batch():
    async def run() -> None:
        transport, _ = make_mock_transport(delay=0.01, max_allowed=3)
        async with httpx.AsyncClient(transport=transport) as client:
            empty = await fetch_batch(client, [], max_concurrency=3)
            assert empty == BatchSummary(succeeded=[], failed=[])
            with pytest.raises(ValueError):
                await fetch_batch(client, ["doc-1"], max_concurrency=0)

    asyncio.run(run())
`,
    },
    selfCheck: [
      "การดึง 9 รายการด้วย `max_concurrency=3` มี `peak_in_flight <= 3`, ไม่มี `429` และเสร็จเร็วกว่า `0.45s`",
      "เมื่อ `bad-1` และ `bad-2` คืน HTTP 500 รายการดีอีก 3 รายการยังอยู่ใน `succeeded` ตามลำดับเดิม",
      "ส่ง `max_concurrency=0` แล้วฟังก์ชันโยน `ValueError` ทันที (ไม่ค้าง deadlock)",
      "ส่ง `item_ids=[]` แล้วคืน `BatchSummary([], [])` โดยไม่เกิด error",
      "ผ่านทั้ง `uv run pytest -W error -q` และ `uv run ruff check .`",
    ],
    acceptance:
      "ผ่านเทสต์ทั้ง 3 ฟังก์ชันด้วย `uv run pytest -W error -q` และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ตรวจ `if max_concurrency < 1: raise ValueError(...)` ก่อนสร้าง `sem = asyncio.Semaphore(max_concurrency)` ไว้ใบเดียวใน `fetch_batch` แล้วส่ง `sem` เข้าไปในทุก `fetch_one`",
      },
      {
        body: "เรียก `raw_results = await asyncio.gather(*(fetch_one(client, i, sem, base_url) for i in item_ids), return_exceptions=True)` แล้วใช้ `zip(item_ids, raw_results, strict=True)` คู่กันตอนแยก `succeeded` กับ `failed`",
      },
      {
        body: "โครงของ `fetch_one` และส่วนต้นของ `fetch_batch` พร้อมแล้ว เหลือเติมลูปคัดแยก `succeeded` กับ `failed` ให้ครบ",
        code: {
          language: "python",
          filename: "hint-d018-l3.py",
          code: `async def fetch_one(
    client: httpx.AsyncClient,
    item_id: str,
    sem: asyncio.Semaphore,
    base_url: str = "https://api.local",
) -> dict[str, str]:
    async with sem:
        resp = await client.get(f"{base_url}/items/{item_id}")
        resp.raise_for_status()
        return resp.json()


async def fetch_batch(
    client: httpx.AsyncClient,
    item_ids: list[str],
    *,
    max_concurrency: int = 3,
    base_url: str = "https://api.local",
) -> BatchSummary:
    if max_concurrency < 1:
        raise ValueError("max_concurrency must be >= 1")
    if not item_ids:
        return BatchSummary(succeeded=[], failed=[])

    sem = asyncio.Semaphore(max_concurrency)
    raw_results = await asyncio.gather(
        *(fetch_one(client, item_id, sem, base_url) for item_id in item_ids),
        return_exceptions=True,
    )
    # TODO: วน zip(item_ids, raw_results, strict=True) แยก succeeded / failed
    # อย่าลืม raise ถ้า isinstance(res, BaseException) และไม่ใช่ Exception
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -W error -q
uv run ruff check .`,
      caption: "แฟล็ก `-W error` ช่วยยืนยันว่าไม่มี coroutine ที่ถูกสร้างแล้วไม่ได้ await",
    },
  },

  mistakes: [
    {
      title: "สร้าง `asyncio.Semaphore(n)` ไว้ข้างในฟังก์ชัน worker",
      symptom: "ใส่ `Semaphore(3)` แล้วแต่เซิร์ฟเวอร์ยังเจอคำขอวิ่งเข้าพร้อมกัน 50 เส้นและคืน `429`",
      fix: "สร้าง `sem = asyncio.Semaphore(n)` เพียง **อินสแตนซ์เดียว** นอกลูปแล้วส่งเป็นพารามิเตอร์ให้ทุก worker แชร์ร่วมกัน",
    },
    {
      title: "เปิด `async with httpx.AsyncClient()` ใหม่ในทุกคำขอ",
      symptom: "งาน batch ช้าผิดปกติเพราะเสียเวลาทำ TLS handshake ซ้ำทุกครั้ง และอาจเจอ `Too many open files` เมื่อยิงจำนวนมาก",
      fix: "เปิด `httpx.AsyncClient` ใบเดียวครอบทั้ง batch (หรือตอนแอปเริ่มทำงาน) เพื่อให้ใช้ connection pool ร่วมกัน",
    },
    {
      title: "ส่ง `max_concurrency=0` เข้า `asyncio.Semaphore(0)` โดยไม่ตรวจค่า",
      symptom: "โปรแกรมหยุดค้างตลอดกาล (deadlock) ตรงบรรทัด `async with sem:` เพราะไม่มีใครมาปล่อยสิทธิ์เลย",
      fix: "ตรวจเงื่อนไข `if max_concurrency < 1: raise ValueError(...)` ตั้งแต่ต้นฟังก์ชันเสมอ",
    },
    {
      title: "ใช้ `asyncio.gather(*coros)` ค่าเริ่มต้นกับงาน batch ที่มีโอกาสพังบางรายการ",
      symptom: "รายการที่ 19 พังแค่ใบเดียวแต่ `gather` โยน exception ทิ้งผลลัพธ์ของอีก 19 รายการที่ดึงเสร็จแล้ว",
      fix: "สำหรับงาน batch ให้ส่ง `return_exceptions=True` แล้วแยก `succeeded` กับ `failed` ออกมาบันทึกอย่างชัดเจน",
    },
  ],

  quiz: {
    intro:
      "4 ข้อ ทดสอบความเข้าใจเรื่อง Shared `AsyncClient`, `Semaphore` และ `gather` vs `TaskGroup` — กดเลือกคำตอบแล้วตรวจทันที",
    questions: [
      mc(
        "d018-q1",
        "ทำไมการยิง API 50 คำขอพร้อมกันจึงควรแชร์ `httpx.AsyncClient` เพียงใบเดียวแทนการสร้าง `async with httpx.AsyncClient()` ข้างในทุก task?",
        [
          ["เพราะ `httpx` ไม่อนุญาตให้สร้าง `AsyncClient` เกิน 1 ตัวต่อโปรเซส", "`httpx` สร้างหลายตัวได้ แต่สิ้นเปลืองทรัพยากรโดยไม่จำเป็น"],
          ["เพื่อรีไซเคิลการเชื่อมต่อ TCP/TLS ผ่าน Connection Pool ลด latency และป้องกัน socket เต็ม", "ถูก — Connection pooling ลดเวลาทำ handshake ซ้ำและคุมจำนวน socket ของระบบได้"],
          ["เพราะ `AsyncClient` จะช่วยจำกัด concurrency ให้เองเป็น 1 เสมอ", "ไม่เกี่ยว — `AsyncClient` ไม่ได้ลด concurrency เหลือ 1 ต้องใช้ `Semaphore` คุมเอง"],
          ["เพื่อให้โค้ดเปลี่ยนไปทำงานแบบ synchronous แทน", "`AsyncClient` ทำงานแบบ async บน Event Loop เสมอ"],
        ],
        "B",
        "การแชร์ `httpx.AsyncClient` ใบเดียวทำให้ทุก coroutine ใช้ HTTP Keep-Alive connection pool ร่วมกัน ลดต้นทุน TCP/TLS handshake และป้องกัน socket leak",
        "เหตุใดจึงควรแชร์ `httpx.AsyncClient` ใบเดียวข้ามหลาย coroutine?",
        "เพื่อใช้ TCP/TLS connection pool ร่วมกัน ลด latency และป้องกันการเปิด socket ซ้ำซ้อนจนเต็ม",
      ),
      mc(
        "d018-q2",
        "นักพัฒนาเขียนฟังก์ชัน `async def fetch(id): sem = asyncio.Semaphore(3); async with sem: ...` แล้วสั่ง `await asyncio.gather(*(fetch(i) for i in range(15)))` จะมีคำขอวิ่งพร้อมกันสูงสุดกี่คำขอ?",
        [
          ["สูงสุด 3 คำขอ เพราะตั้งค่า `Semaphore(3)` ไว้แล้ว", "ผิด — `sem` ถูกสร้างใหม่ทุกครั้งที่เรียก `fetch(id)` จึงไม่ได้แชร์ตัวนับร่วมกัน"],
          ["สูงสุด 15 คำขอ เพราะแต่ละ task สร้าง `Semaphore` ของตัวเองคนละใบ", "ถูก — ต้องสร้าง `Semaphore(3)` ใบเดียวด้านนอกแล้วส่งเข้าไปให้ทุก task แชร์กัน"],
          ["สูงสุด 1 คำขอ เพราะ Python รันทีละ task", "`gather` จัดตารางทั้ง 15 tasks ลง Event Loop พร้อมกัน"],
          ["เกิด `RuntimeError` ทันทีตอนสร้าง `Semaphore` ตัวที่ 2", "Python ไม่ห้ามสร้างหลาย `Semaphore` โค้ดจึงรันผ่านแต่ไม่คุมเพดานเลย"],
        ],
        "B",
        "การสร้าง `Semaphore` ข้างใน worker คือบั๊กเงียบที่เจอบ่อยที่สุด — ต้องสร้างอินสแตนซ์เดียวด้านนอกแล้วส่งผ่าน argument ให้ทุก task ใช้ร่วมกัน",
        "จะเกิดอะไรขึ้นถ้าสร้าง `asyncio.Semaphore(3)` ไว้ข้างในฟังก์ชัน worker?",
        "ทุก task จะได้ Semaphore คนละใบ ทำให้ไม่จำกัด concurrency เลย — ต้องสร้างใบเดียวข้างนอกแล้วส่งเข้าไปแชร์",
      ),
      mc(
        "d018-q3",
        "งานใดเหมาะกับ `asyncio.gather(..., return_exceptions=True)` มากกว่า `asyncio.TaskGroup()`?",
        [
          ["ดึง `user_profile` และ `access_acl` ซึ่งต้องได้ครบทั้งสองอย่างถึงจะอนุญาตให้ตอบคำถามได้", "งานนี้เป็น all-or-nothing (fail-fast) จึงเหมาะกับ `TaskGroup` มากกว่า"],
          ["ดึงและสรุปบทความ 50 ชิ้นเป็น batch โดยต้องการให้ชิ้นที่สำเร็จบันทึกต่อได้แม้บาง URL จะคืน 404", "ถูก — `gather(..., return_exceptions=True)` แยกความล้มเหลวรายชิ้นโดยไม่ยกเลิกอีก 49 ชิ้นที่เหลือ"],
          ["รันฟังก์ชัน CPU-bound หนัก ๆ บนหลาย core", "ทั้ง `gather` และ `TaskGroup` รันบน Event Loop thread เดียว ไม่ได้เพิ่ม CPU core"],
          ["ต้องการให้ทุก task รันทีละตัวตามลำดับห้ามซ้อนกัน", "ทั้งสองตัวรันแบบ concurrent หากอยากรันทีละตัวให้ `await` เรียงลำดับ"],
        ],
        "B",
        "`TaskGroup` ออกแบบมาเพื่องาน fail-fast (พังหนึ่งยกเลิกทั้งหมด) ส่วน `gather(..., return_exceptions=True)` ออกแบบมาเพื่องาน batch ที่ต้องการ partial-failure isolation",
        "เมื่อไรควรเลือก `asyncio.gather(..., return_exceptions=True)` แทน `asyncio.TaskGroup()`?",
        "เมื่อทำงาน batch ที่ต้องการเก็บผลลัพธ์ของรายการที่สำเร็จไว้แม้บางรายการจะล้มเหลว (partial-failure isolation)",
      ),
      mc(
        "d018-q4",
        "เมื่อใช้ `results = await asyncio.gather(*coros, return_exceptions=True)` ข้อใดถูกต้องเกี่ยวกับลำดับของสมาชิกใน `results`?",
        [
          ["เรียงตามลำดับที่แต่ละ coroutine ทำงานเสร็จก่อน-หลัง", "ไม่ใช่ — นั่นคือพฤติกรรมของ `asyncio.as_completed(...)`"],
          ["รักษาลำดับตรงตามลำดับของ `coros` ที่ส่งเข้าไปเสมอ ไม่ว่าตัวไหนจะเสร็จก่อน", "ถูก — จึงสามารถจับคู่ `zip(item_ids, results)` ได้อย่างแม่นยำ"],
          ["ผลลัพธ์ที่เป็น exception จะถูกย้ายไปต่อท้ายลิสต์ทั้งหมด", "exception จะอยู่ในตำแหน่งดัชนีเดิมของ coroutine ตัวที่พัง"],
          ["ลำดับสุ่มทุกครั้งที่รัน", "`asyncio.gather` รับประกันการรักษาลำดับ input แบบ deterministic"],
        ],
        "B",
        "`asyncio.gather` คืนลิสต์ผลลัพธ์ในลำดับเดียวกับ coroutine ที่ส่งเข้าเสมอ ทำให้จับคู่กับ `item_ids` เดิมด้วย `zip(..., strict=True)` ได้ตรงตำแหน่งทุกตัว",
        "`asyncio.gather` คืนผลลัพธ์เรียงตามลำดับอะไร?",
        "เรียงตามลำดับของ coroutine ที่ส่งเข้าไปเสมอ (ไม่ใช่ลำดับที่เสร็จก่อน-หลัง)",
      ),
    ],
  },

  takeaways: [
    "แชร์ `httpx.AsyncClient` ใบเดียวข้าม task เพื่อให้รีไซเคิล TCP/TLS connection pool และส่ง `MockTransport` เข้ามาทดสอบได้ 100% บนเครื่อง",
    "ใช้ `asyncio.Semaphore(n)` อินสแตนซ์เดียวร่วมกันทุก worker เพื่อคุม peak concurrency ไม่ให้ชน {{rate-limit}} 429",
    "เลือก `asyncio.TaskGroup()` เมื่อต้องการ {{fail-fast}} (all-or-nothing) และเลือก `asyncio.gather(..., return_exceptions=True)` เมื่องาน batch ต้องการแยก error รายชิ้น",
    "`gather` รักษาลำดับผลลัพธ์ตรงตาม input เสมอ — แต่ต้องตรวจและ re-raise `BaseException` ที่ไม่ใช่ `Exception` เช่น `CancelledError`",
  ],

  reviewCards: [
    rc(
      "d018-rc-1",
      "ทำไมต้องสร้าง `asyncio.Semaphore(n)` นอกลูปแล้วส่งเข้าไปแชร์ แทนที่จะสร้างในฟังก์ชัน worker?",
      "เพราะถ้าสร้างใน worker ทุก task จะได้ตัวนับของตัวเองคนละใบ ทำให้ไม่จำกัด concurrency เลย — ต้องแชร์อินสแตนซ์เดียวร่วมกัน",
    ),
    rc(
      "d018-rc-2",
      "ต่างกันอย่างไรระหว่าง `asyncio.TaskGroup()` กับ `asyncio.gather(..., return_exceptions=True)` เมื่อ 1 ใน 10 task โยน error?",
      "`TaskGroup` เป็น fail-fast (ยกเลิกอีก 9 task ที่เหลือทันที) ส่วน `gather(..., return_exceptions=True)` รอทุก task จบแล้วคืน exception ปะปนในตำแหน่งเดิมเพื่อแยกเก็บผลสำเร็จกับ error",
    ),
    rc(
      "d018-rc-3",
      "ข้อดีของการแชร์ `httpx.AsyncClient` ใบเดียวแทนการเปิดใหม่ทุกคำขอคืออะไร?",
      "ได้ใช้ HTTP Keep-Alive connection pool ร่วมกัน ลดเวลาทำ TCP/TLS handshake ซ้ำ ป้องกัน socket เต็ม และฉีด `MockTransport` เพื่อทดสอบได้ง่าย",
    ),
  ],

  sources: [
    {
      label: "Python 3 Official Docs — asyncio.gather & TaskGroup",
      href: "https://docs.python.org/3/library/asyncio-task.html#running-tasks-concurrently",
    },
    {
      label: "Python 3 Official Docs — asyncio.Semaphore",
      href: "https://docs.python.org/3/library/asyncio-sync.html#asyncio.Semaphore",
    },
    {
      label: "HTTPX Documentation — Async Support & Connection Pooling",
      href: "https://www.python-httpx.org/async/",
    },
    {
      label: "HTTPX Documentation — Advanced MockTransport",
      href: "https://www.python-httpx.org/advanced/transports/#mock-transports",
    },
  ],

  glossary: [
    "asyncio",
    "httpx",
    "semaphore",
    "rate-limit",
    "fail-fast",
    "mocking",
    "pytest",
    "llm",
  ],
});
