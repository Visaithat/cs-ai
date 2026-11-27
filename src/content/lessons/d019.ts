import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D019 — Phase 1 / Block B05
 * Async Generators & Streaming Responses (SSE basics).
 */
export const d019: Lesson = defineLesson({
  day: 19,
  titleTh: "Async Generators และ Streaming Responses: พื้นฐาน SSE สำหรับงาน AI",
  tagline:
    "30 นาที · รันบนเครื่องคุณ 100% · ใช้ async def + yield และ httpx.AsyncClient.stream อ่าน SSE ทีละ token พร้อมรองรับการยกเลิกกลางทาง",
  icon: "zap",
  visual: {
    id: "semaphore-stream",
    title: "Async Generators & SSE Streaming — ส่ง token ทีละชิ้นลดเวลารอ",
    caption:
      "ดูการไหลของ event `data: ...` จาก `async def` + `yield` เพื่อแสดงคำตอบทันทีและยกเลิกได้กลางทาง",
    alt: "แผนภาพ Async Generator และ Server-Sent Events streaming",
  },
  requiresApiKey: false,
  tools: ["asyncio", "httpx", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 2,
      heading: "รับคำตอบจาก LLM ทีละ Token แทนการรอจนจบย่อหน้า",
      body: "โมเดล {{llm}} สร้างคำตอบทีละ token อาจใช้เวลารวม 6–12 วินาที หากแอปต้องรอให้สร้างครบ 100% ก่อนค่อยแสดงผล ผู้ใช้จะรู้สึกว่าแอปค้าง",
      lessonNote:
        "วันนี้เราเรียนรู้โปรโตคอล {{sse}} และ `async def` + `yield` ซึ่งเป็นกลไกเบื้องหลังการสตรีม token ของ LLM API แทบทุกเจ้า",
    },
    {
      node: 4,
      heading: "ลด Time-to-First-Token (TTFT) และรองรับปุ่ม Stop Generating",
      body: "UX ของแอปแชต AI ที่ดีต้องแสดงตัวอักษรแรกให้ไวที่สุด ({{ttft}}) และต้องหยุดดึงข้อมูลจากปลายทางได้ทันทีเมื่อผู้ใช้ปิดหน้าจอหรือกดปุ่มหยุด",
      lessonNote:
        "การใช้ `httpx.AsyncClient.stream(...)` + `aiter_lines()` คู่กับ `contextlib.aclosing` และ `asyncio.CancelledError` คือหัวใจของ Streaming Client และ {{fastapi}} SSE ใน Phase 3–5",
    },
    {
      node: 5,
      heading: "จับตา Connection Leak เมื่อ Stream ถูกตัดกลางคัน",
      body: "หากโค้ดหลุดออกจากลูป `async for` กลางทางโดยไม่ปิด async generator หรือกลืน `CancelledError` เงียบ ๆ การเชื่อมต่อ HTTP จะค้างอยู่จนระบบล่ม",
      lessonNote:
        "คุณจะได้ฝึกวาง `try / finally` และตรวจสอบการทำความสะอาดทรัพยากรใน {{pytest}} ทั้งกรณีจบปกติ `[DONE]` และกรณียกเลิกกลางทาง",
    },
    {
      node: 6,
      heading: "เก็บสัญญาณคุณภาพจาก Stream เพื่อปรับปรุงประสบการณ์ผู้ใช้",
      body: "การวัดเวลาของ token แรก (`TTFT`) แยกจากเวลารวม และบันทึกว่าผู้ใช้กดยกเลิกบ่อยแค่ไหน ช่วยให้ทีมตัดสินใจเลือกขนาดโมเดลและปรับ prompt ได้ตรงจุด",
      lessonNote:
        "โครงสร้าง `AsyncIterator[str]` ที่เขียนวันนี้จะถูกนำไปต่อยอดเป็น Streaming CLI Chat (Day 76) และ FastAPI SSE Endpoint (Day 138)",
    },
  ],

  objectives: [
    "**เขียน** Async Generator ด้วย `async def` + `yield` (`AsyncIterator[T]`) และบริโภคค่าทีละชิ้นด้วย `async for`",
    "**อ่านสตรีม HTTP แบบไม่บัฟเฟอร์ทั้งก้อน** ด้วย `httpx.AsyncClient.stream(...)` + `resp.aiter_lines()` เพื่อแกะเฟรม {{sse}} (`data: ...`, comment, `[DONE]`)",
    "**จัดการการหยุดและยกเลิกกลางทาง** ด้วย `try / finally`, `contextlib.aclosing` และการส่งต่อ `asyncio.CancelledError` อย่างสะอาด",
  ],

  prerequisites: [
    "เข้าใจ `asyncio` Event Loop, `await` และ `httpx.AsyncClient` จาก Day 17–18",
    "รู้จัก generator ปกติ (`yield`) และ JSON ใน Python",
    "มี Python 3.11+ และ `uv` พร้อม `httpx`, `pytest`, `ruff` บนเครื่อง",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — จำลองสตรีม SSE ด้วย `httpx.AsyncByteStream` 100%",
  ],

  setup: {
    intro:
      "ตั้งโฟลเดอร์งานด้วย {{uv}} และติดตั้ง {{httpx}} พร้อม `pytest` และ `ruff` เพื่อทดลองสร้างและทดสอบ SSE stream แบบ 100% local",
    commands: `uv init ai-day19-sse && cd ai-day19-sse
uv add httpx
uv add --dev pytest ruff

# ตรวจให้แน่ใจว่ามี contextlib.aclosing (มากับ Python 3.10+)
uv run python -c "import contextlib, httpx; print(hasattr(contextlib, 'aclosing'), httpx.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day19-sse` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `httpx`, `pytest` และ `ruff` ผ่าน `uv add`"],
      ["verify", "ยืนยันว่า `contextlib.aclosing` และ `httpx` พร้อมใช้งาน"],
    ],
    note: "บทนี้ใช้คลาส `httpx.AsyncByteStream` ร่วมกับ `httpx.MockTransport` เพื่อจำลองเซิร์ฟเวอร์ LLM ที่ทยอยส่ง `data: ...` ทีละบรรทัดเหมือน API จริงทุกประการ",
  },

  concepts: [
    {
      id: "async-generators",
      title: "1 · Async Generator (`async def` + `yield`) และ `async for`",
      paragraphs: [
        "ฟังก์ชัน `async def` ปกติที่ใช้ `return` จะต้องรอจนทำงานเสร็จครบทั้งหมดก่อนจึงส่งผลลัพธ์กลับทีเดียว แต่เมื่อเราเปลี่ยนมาใช้ `yield` ภายใน `async def` ฟังก์ชันนั้นจะกลายเป็น **Async Generator** (มีชนิดเป็น `AsyncIterator[T]` หรือ `AsyncGenerator[T, None]`)",
        "ทุกครั้งที่ผู้เรียกวนลูปด้วย `async for token in stream:` ตัว generator จะทำงานต่อจนเจอ `yield` เพื่อส่งข้อมูล 1 ชิ้นทันที แล้วหยุดรอแบบไม่ขวาง Event Loop — ส่งผลให้ {{ttft|Time-to-First-Token (TTFT)}} ลดลงทันทีและใช้ RAM คงที่แม้คำตอบจะยาวหลายพันคำ",
      ],
      analogy:
        "เหมือนร้านซูชิสายพาน (`yield` + `async for`) ที่เชฟปั้นเสร็จทีละคำก็วางส่งให้ลูกค้ากินได้ทันที ไม่ต้องรอเชฟปั้นครบ 20 คำแล้วค่อยยกมาเสิร์ฟทีเดียว (`return list`)",
      code: {
        language: "python",
        filename: "async_gen_basics.py",
        code: `import asyncio
from collections.abc import AsyncIterator


async def fake_token_stream(words: list[str]) -> AsyncIterator[str]:
    for word in words:
        await asyncio.sleep(0.05)  # จำลองเวลาที่โมเดลสร้าง 1 token
        yield word


async def main() -> None:
    async for token in fake_token_stream(["สวัสดี", "ครับ", "ยินดี", "ให้บริการ"]):
        print(token, end=" ", flush=True)
    print()


asyncio.run(main())`,
        caption:
          "ผู้เรียกได้คำว่า `'สวัสดี'` ตั้งแต่ 0.05s แรก โดยไม่ต้องรอครบ 0.20s จนจบประโยค",
      },
      whyTitle: "Why this matters — แยกการผลิต (Producer) ออกจากการแสดงผล (Consumer)",
      whyParagraphs: [
        "การคืน `AsyncIterator[str]` ทำให้ฟังก์ชันเรียก {{llm}} ไม่ต้องผูกติดกับ UI: จะเอาไปพิมพ์ใน CLI, ส่งต่อไปยัง {{fastapi}} `StreamingResponse`, หรือเก็บเข้า buffer ใน {{pytest}} ก็ใช้ `async for` แบบเดียวกันทั้งหมด",
        "นอกจากนี้ Async Generator ยังทำงานแบบ **lazy** — หากผู้เรียกหยุดอ่านกลางทาง โค้ดส่วนที่เหลือจะไม่ถูกประมวลผลต่อ ช่วยประหยัดทั้งเวลาและทรัพยากร",
      ],
    },
    {
      id: "httpx-stream-sse",
      title: "2 · อ่าน Server-Sent Events (SSE) ทีละบรรทัดด้วย `httpx.AsyncClient.stream`",
      paragraphs: [
        "**{{sse|Server-Sent Events (SSE)}}** คือมาตรฐานการส่งข้อมูลทางเดียวจากเซิร์ฟเวอร์มายังไคลเอนต์ผ่าน HTTP ปกติ (`Content-Type: text/event-stream`) โดยข้อมูลแต่ละเหตุการณ์จะอยู่ในบรรทัดที่ขึ้นต้นด้วย `data:` คั่นด้วยบรรทัดว่าง `\\n\\n` อาจมีบรรทัดคอมเมนต์ keep-alive ที่ขึ้นต้นด้วย `:` และปิดท้ายด้วยสัญญาณเช่น `data: [DONE]`",
        "จุดสำคัญที่สุดใน {{httpx}}: **ห้ามใช้ `await client.get(url)` กับ SSE** เพราะ `client.get` จะรอโหลด body ทั้งหมดจนจบก่อนค่อยคืนค่า! ต้องใช้ `async with client.stream('GET', url) as resp:` แล้ววนอ่านด้วย `async for line in resp.aiter_lines():` เพื่อรับข้อมูลทันทีที่เซิร์ฟเวอร์ส่งแต่ละบรรทัดออกมา",
      ],
      analogy:
        "การใช้ `client.get()` เหมือนรอให้ถ่ายทอดสดฟุตบอลจบ 90 นาทีแล้วค่อยดาวน์โหลดไฟล์วิดีโอมาดู ส่วน `client.stream()` + `aiter_lines()` คือเปิดดูสตรีมสดทีละวินาที",
      code: {
        language: "python",
        filename: "sse_wire_format.py",
        code: `# ตัวอย่างเฟรม SSE ดิบที่ LLM API ส่งกลับมาทีละช่วงเวลา:
#
# : keep-alive
#
# data: {"token": "ระบบ"}
#
# data: {"token": "พร้อม"}
#
# data: [DONE]


def parse_sse_line(line: str) -> str | None:
    """ดึงเนื้อหาหลัง 'data:' ของ 1 บรรทัด SSE; คืน None ถ้าเป็นบรรทัดว่างหรือ comment"""
    if not line or line.startswith(":"):
        return None
    if not line.startswith("data:"):
        return None
    payload = line[5:]
    # ตามสเปก SSE ให้ตัดช่องว่างนำหน้าได้สูงสุด 1 ตัวหลังเครื่องหมาย ':'
    return payload[1:] if payload.startswith(" ") else payload`,
        caption:
          "ตามสเปก WHATWG SSE ถ้าหลัง `data:` มีช่องว่าง 1 ตัวให้ตัดออก 1 ตัวเท่านั้น เพื่อไม่ให้ช่องว่างจริงของ token หายไป",
      },
      whyTitle: "Why this matters — ทำไมไม่ใช้ `.strip()` กับ payload ของ SSE",
      whyParagraphs: [
        "Token ภาษาอังกฤษจาก LLM มักมีช่องว่างนำหน้าอยู่ในตัว เช่น `\" world\"` หากคุณเผลอเขียน `line.removeprefix('data:').strip()` ช่องว่างระหว่างคำจะหายหมดจนคำติดกันเป็น `\"Helloworld\"`!",
        "การตัดเฉพาะช่องว่างตัวแรกหลัง `data:` (หรือห่อ token ไว้ใน JSON เช่น `{\"token\": \" world\"}`) จึงเป็นรายละเอียดเล็ก ๆ ที่ทำให้ข้อความสตรีมออกมาถูกต้อง 100%",
      ],
    },
    {
      id: "cancellation-and-cleanup",
      title: "3 · รับมือ `[DONE]`, การหยุดกลางทาง (`aclosing`) และ `asyncio.CancelledError`",
      paragraphs: [
        "ในระบบแชต AI จริง สตรีมไม่ได้จบสวย ๆ ที่ `[DONE]` เสมอไป ผู้ใช้อาจกดปุ่ม Stop, ปิดแท็บเบราว์เซอร์ หรือระบบตั้ง timeout ตัดสตรีมกลางคัน เมื่อ Task ที่กำลัง `async for` ถูกสั่ง `.cancel()` Python จะโยน **`asyncio.CancelledError`** เข้าไปตรงจุด `await` หรือ `yield` ปัจจุบัน",
        "กฎเหล็ก 2 ข้อที่ต้องยึดไว้เสมอ: (1) วางโค้ดคืนทรัพยากรหรือบันทึก log ไว้ใน `try / finally` และ **ห้ามกลืน `CancelledError`** (ถ้าจับไว้เพื่อบันทึกสถานะต้อง `raise` ต่อทันที) และ (2) หากผู้เรียก `break` ออกจาก `async for` ก่อนสตรีมจบ ให้ครอบด้วย `async with contextlib.aclosing(stream):` เพื่อปิด async generator และคืนการเชื่อมต่อ HTTP ทันทีโดยไม่รอ Garbage Collector",
      ],
      analogy:
        "เหมือนเวลาเปิดก๊อกน้ำเติมแก้วแล้วน้ำเต็มก่อนถังจะหมด (`break`) — `contextlib.aclosing` คือการหมุนปิดก๊อกทันทีที่ยกแก้วออก แทนที่จะปล่อยน้ำไหลทิ้งรอคนอื่นมาปิดให้ทีหลัง",
      code: {
        language: "python",
        filename: "cancellation_cleanup.py",
        code: `import asyncio
from collections.abc import AsyncIterator
from contextlib import aclosing


async def guarded_stream(events: list[str]) -> AsyncIterator[str]:
    status = "incomplete"
    try:
        for item in events:
            await asyncio.sleep(0.05)
            yield item
        status = "done"
    except asyncio.CancelledError:
        status = "cancelled"
        raise  # สำคัญมาก: ต้อง re-raise เสมอเพื่อให้ task ยกเลิกจริง!
    finally:
        print(f"[stream cleanup] status={status}")


async def main() -> None:
    async with aclosing(guarded_stream(["a", "b", "c", "d"])) as stream:
        async for tok in stream:
            print("got:", tok)
            if tok == "b":
                break  # ปิด stream ทันทีที่ออกจาก with block


asyncio.run(main())`,
        caption:
          "เมื่อ `break` ออกจากลูป `contextlib.aclosing` จะเรียก `await stream.aclose()` ทำให้บล็อก `finally` ทำงานทันที",
      },
      whyTitle: "Why this matters — ใน Python 3.8+ `CancelledError` สืบทอดจาก `BaseException`",
      whyParagraphs: [
        "ใน Python ยุคใหม่ `asyncio.CancelledError` ไม่ได้เป็น subclass ของ `Exception` แต่เป็น subclass ของ `BaseException` จึงไม่ถูกจับโดย `except Exception:` โดยบังเอิญ แต่ยังคงถูกจับได้ถ้าคุณเขียน `except:` เปล่าหรือ `except BaseException:`",
        "หากเผลอกลืน `CancelledError` ไว้โดยไม่ `raise` ต่อ Task นั้นจะปฏิเสธการถูกยกเลิก ส่งผลให้เซิร์ฟเวอร์ {{fastapi}} ค้างตอน shutdown หรือผลาญค่า {{llm}} API ต่อทั้งที่ผู้ใช้ปิดหน้าจอไปแล้ว",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Async Generator + SSE กับ JS/TS",
      body: [
        "หากคุณเคยทำสตรีมมิ่งแชตใน Next.js หรือ Node.js ด้วย `EventSource` / `ReadableStream` โครงสร้างใน Python แทบจะสมมาตรกันทั้งหมด:",
      ],
      table: [
        ["`async def stream() -> AsyncIterator[str]: yield x`", "`async function* stream() { yield x; }`"],
        ["`async for chunk in stream():`", "`for await (const chunk of stream())`"],
        ["`async with client.stream(...) as resp:` + `resp.aiter_lines()`", "`fetch()` + `response.body.getReader()` + `TextDecoder`"],
        ["`async with contextlib.aclosing(gen):`", "`try { ... } finally { await gen.return(); }`"],
        ["`task.cancel()` → `asyncio.CancelledError`", "`AbortController.abort()` → `AbortError`"],
      ],
    },
    student: {
      title: "First-Year Note — `return` กับ `yield` ต่างกันตรงไหน",
      body: [
        "ฟังก์ชันที่มี `return` จะทำงานตั้งแต่บรรทัดแรกจนจบรอบเดียวแล้วคืนผลลัพธ์พร้อมล้างตัวแปรภายในทั้งหมด",
        "ฟังก์ชันที่มี `yield` จะทำงานจนเจอ `yield` แล้ว **หยุดพักพร้อมจำตำแหน่งบรรทัดและค่าตัวแปรทั้งหมดไว้** เมื่อผู้เรียกขอค่าถัดไปผ่านลูป `async for` มันจะกลับมาทำงานต่อจากบรรทัดถัดจาก `yield` เดิมทันที",
      ],
    },
  },

  workedExample: {
    intro:
      "เราจะจำลองเซิร์ฟเวอร์ SSE ในเครื่องด้วย `httpx.AsyncByteStream` + `httpx.MockTransport` ที่ทยอยส่ง token ภาษาไทยทีละคำ (ห่างกัน 0.05s) พร้อมบรรทัด `: keep-alive` และ `[DONE]` เพื่อวัด TTFT และทดสอบการยกเลิกกลางทางแบบ 100% local",
    steps: [
      {
        title: "1 · สร้าง Mock SSE Server ด้วย `httpx.AsyncByteStream`",
        explain:
          "สืบทอด `httpx.AsyncByteStream` แล้วนิยาม `__aiter__` ให้ `yield` ทีละก้อน `bytes` พร้อม `await asyncio.sleep(0.05)` เพื่อให้ `httpx.AsyncClient.stream` ได้รับข้อมูลทีละเฟรมจริง ๆ",
        code: {
          language: "python",
          filename: "worked_d019_step1.py",
          code: `import asyncio
import json
from collections.abc import AsyncIterator
import httpx


class FakeSSEStream(httpx.AsyncByteStream):
    def __init__(self, tokens: list[str], delay: float = 0.05) -> None:
        self._tokens = tokens
        self._delay = delay

    async def __aiter__(self) -> AsyncIterator[bytes]:
        yield b": keep-alive\\n\\n"
        for tok in self._tokens:
            await asyncio.sleep(self._delay)
            payload = json.dumps({"token": tok}, ensure_ascii=False)
            yield f"data: {payload}\\n\\n".encode("utf-8")
        yield b"data: [DONE]\\n\\n"


def make_sse_transport(tokens: list[str], delay: float = 0.05) -> httpx.MockTransport:
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            headers={"content-type": "text/event-stream"},
            stream=FakeSSEStream(tokens, delay=delay),
        )

    return httpx.MockTransport(handler)`,
        },
        output: `# สร้าง MockTransport ที่สตรีม bytes ทีละเฟรมพร้อมใช้งานโดยไม่ต้องเปิดพอร์ตเครือข่าย`,
      },
      {
        title: "2 · อ่านสตรีมทีละบรรทัดด้วย `client.stream()` และวัด TTFT",
        explain:
          "ใช้ `async with client.stream(...) as resp:` และ `resp.aiter_lines()` แกะเฟรม `data:` เป็น token ทันที จะเห็นว่า token แรกมาถึงภายใน ~0.05s ขณะที่ทั้งประโยคใช้เวลา ~0.25s",
        code: {
          language: "python",
          filename: "worked_d019_step2.py",
          code: `import asyncio
import json
import time
from collections.abc import AsyncIterator
import httpx
from worked_d019_step1 import make_sse_transport


async def iter_sse_tokens(client: httpx.AsyncClient, url: str) -> AsyncIterator[str]:
    async with client.stream("GET", url) as resp:
        resp.raise_for_status()
        async for line in resp.aiter_lines():
            if not line or line.startswith(":") or not line.startswith("data:"):
                continue
            raw = line[5:].lstrip(" ") if line[5:].startswith(" ") else line[5:]
            if raw == "[DONE]":
                break
            yield json.loads(raw)["token"]


async def main() -> None:
    tokens = ["สวัสดี", "ครับ", " ยินดี", "ช่วย", "เหลือ"]
    transport = make_sse_transport(tokens, delay=0.05)

    t0 = time.perf_counter()
    ttft: float | None = None
    received: list[str] = []

    async with httpx.AsyncClient(transport=transport) as client:
        async for tok in iter_sse_tokens(client, "https://llm.local/stream"):
            if ttft is None:
                ttft = time.perf_counter() - t0
            received.append(tok)

    total = time.perf_counter() - t0
    print(f"TTFT={ttft:.2f}s | total={total:.2f}s | text={''.join(received)}")


asyncio.run(main())`,
        },
        output: `TTFT=0.05s | total=0.26s | text=สวัสดีครับ ยินดีช่วยเหลือ`,
      },
      {
        title: "3 · ยกเลิก Task กลางทางและตรวจว่า Cleanup ทำงานครบ",
        explain:
          "สร้าง Task ที่อ่านสตรีมแล้วสั่ง `task.cancel()` หลังผ่านไป 0.12s (เพิ่งได้ 2 token) สังเกตว่า `CancelledError` ถูกโยนผ่าน `finally` และทำความสะอาดการเชื่อมต่อเรียบร้อย",
        code: {
          language: "python",
          filename: "worked_d019_step3.py",
          code: `import asyncio
import httpx
from worked_d019_step1 import make_sse_transport
from worked_d019_step2 import iter_sse_tokens


async def consume_stream(client: httpx.AsyncClient, collected: list[str]) -> None:
    try:
        async for tok in iter_sse_tokens(client, "https://llm.local/stream"):
            collected.append(tok)
    except asyncio.CancelledError:
        print(f"Cancelled after {len(collected)} tokens: {collected}")
        raise


async def main() -> None:
    transport = make_sse_transport(["คำ1", "คำ2", "คำ3", "คำ4", "คำ5"], delay=0.05)
    collected: list[str] = []
    async with httpx.AsyncClient(transport=transport) as client:
        task = asyncio.create_task(consume_stream(client, collected))
        await asyncio.sleep(0.12)
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            print("Caller confirmed task cancelled cleanly.")


asyncio.run(main())`,
        },
        output: `Cancelled after 2 tokens: ['คำ1', 'คำ2']
Caller confirmed task cancelled cleanly.`,
      },
    ],
    gotcha:
      "ข้อผิดพลาดร้ายแรงที่พบบ่อย: เรียก `resp = await client.get(url)` แล้วค่อยวน `for line in resp.text.splitlines():` — โค้ดนี้ดูเหมือนทำงานได้ในเครื่อง แต่ความจริงมัน **รอโหลดทั้งสตรีมจนจบ** ทำให้ TTFT เท่ากับ total latency และพังทันทีเมื่อเจอสตรีมยาว ๆ!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `sse_streamer.py` ที่มีฟังก์ชันแกะบรรทัด SSE, Async Generator อ่าน token ทีละชิ้นจาก `httpx.AsyncClient.stream(...)` พร้อม hook บันทึกสถานะการปิด และตัวช่วยอ่านแบบจำกัดจำนวน token ที่ปิดสตรีมสะอาดด้วย `contextlib.aclosing`",
    requirements: [
      "สร้าง `parse_sse_data(line: str) -> str | None`: คืน `None` เมื่อเป็นบรรทัดว่าง, บรรทัด comment (`:`), หรือไม่ได้ขึ้นต้นด้วย `data:` — หากขึ้นต้นด้วย `data:` ให้ตัด prefix `data:` ออกและตัดช่องว่างนำหน้าได้สูงสุด 1 ตัว (รักษาช่องว่างส่วนที่เหลือไว้ครบ)",
      "สร้าง `async def stream_sse_tokens(client: httpx.AsyncClient, url: str, on_close: Callable[[str], None] | None = None) -> AsyncIterator[str]` ที่ใช้ `async with client.stream('GET', url) as resp:`, เรียก `resp.raise_for_status()`, และวน `resp.aiter_lines()`",
      "ใน `stream_sse_tokens`: เมื่อเจอ `'[DONE]'` ให้หยุดลูปปกติแล้วแจ้ง `on_close('done')` ใน `finally`; เมื่อเจอ `asyncio.CancelledError` ให้แจ้ง `on_close('cancelled')` แล้ว **`raise` ต่อเสมอ**; หากปิดก่อนจบ (เช่น `aclosing` / `GeneratorExit`) ให้แจ้ง `on_close('closed_early')`",
      "สร้าง `async def collect_with_limit(stream: AsyncIterator[str], max_tokens: int) -> list[str]` ที่ใช้ `async with contextlib.aclosing(stream):` อ่านไม่เกิน `max_tokens` ชิ้น (ถ้า `max_tokens <= 0` คืน `[]` ทันที)",
    ],
    starter: {
      language: "python",
      filename: "sse_streamer.py",
      code: `import asyncio
import json
from collections.abc import AsyncIterator, Callable
from contextlib import aclosing
import httpx


def parse_sse_data(line: str) -> str | None:
    # TODO: คืน None ถ้าบรรทัดว่าง/comment/ไม่ขึ้นต้นด้วย 'data:'
    # มิฉะนั้นตัด 'data:' และช่องว่างนำหน้าสูงสุด 1 ตัว
    raise NotImplementedError


async def stream_sse_tokens(
    client: httpx.AsyncClient,
    url: str,
    on_close: Callable[[str], None] | None = None,
) -> AsyncIterator[str]:
    # TODO: ใช้ client.stream('GET', url) + resp.aiter_lines()
    # yield json.loads(data)['token'], หยุดที่ '[DONE]', จัดการ CancelledError + finally
    raise NotImplementedError
    yield ""  # pragma: no cover (ช่วยให้ type checker รู้ว่าเป็น AsyncIterator)


async def collect_with_limit(
    stream: AsyncIterator[str],
    max_tokens: int,
) -> list[str]:
    # TODO: ใช้ async with aclosing(stream): เก็บไม่เกิน max_tokens ชิ้น
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_sse_streamer.py",
      code: `import asyncio
import json
import time
from collections.abc import AsyncIterator
import httpx
import pytest
from sse_streamer import collect_with_limit, parse_sse_data, stream_sse_tokens


class MockSSEByteStream(httpx.AsyncByteStream):
    def __init__(self, tokens: list[str], delay: float = 0.04) -> None:
        self._tokens = tokens
        self._delay = delay

    async def __aiter__(self) -> AsyncIterator[bytes]:
        yield b": keep-alive\\n\\n"
        for tok in self._tokens:
            await asyncio.sleep(self._delay)
            frame = json.dumps({"token": tok}, ensure_ascii=False)
            yield f"data: {frame}\\n\\n".encode("utf-8")
        yield b"data: [DONE]\\n\\n"


def make_client(tokens: list[str], delay: float = 0.04) -> httpx.AsyncClient:
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            headers={"content-type": "text/event-stream"},
            stream=MockSSEByteStream(tokens, delay=delay),
        )

    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


def test_parse_sse_data_spec_edges():
    assert parse_sse_data("") is None
    assert parse_sse_data(": keep-alive") is None
    assert parse_sse_data("event: message") is None
    assert parse_sse_data("data: [DONE]") == "[DONE]"
    # ตัดช่องว่างหลัง 'data:' แค่ 1 ตัว เพื่อรักษาช่องว่างนำหน้าของข้อความจริง
    assert parse_sse_data("data:  leading-space") == " leading-space"


def test_stream_tokens_ttft_and_done_cleanup():
    events: list[str] = []

    async def run() -> tuple[list[str], float, float]:
        tokens = ["AI", " ", "พร้อม", "ใช้งาน", "แล้ว"]
        t0 = time.perf_counter()
        ttft = 0.0
        got: list[str] = []
        async with make_client(tokens, delay=0.05) as client:
            async for tok in stream_sse_tokens(client, "https://llm.local/sse", on_close=events.append):
                if not got:
                    ttft = time.perf_counter() - t0
                got.append(tok)
        return got, ttft, time.perf_counter() - t0

    got, ttft, total = asyncio.run(run())
    assert got == ["AI", " ", "พร้อม", "ใช้งาน", "แล้ว"]
    assert ttft < total * 0.6
    assert events == ["done"]


def test_collect_with_limit_closes_stream_early():
    events: list[str] = []

    async def run() -> list[str]:
        async with make_client(["t1", "t2", "t3", "t4"], delay=0.02) as client:
            stream = stream_sse_tokens(client, "https://llm.local/sse", on_close=events.append)
            return await collect_with_limit(stream, max_tokens=2)

    got = asyncio.run(run())
    assert got == ["t1", "t2"]
    assert events == ["closed_early"]


def test_cancellation_propagates_and_runs_cleanup():
    events: list[str] = []
    got: list[str] = []

    async def run() -> None:
        async with make_client(["a", "b", "c", "d", "e"], delay=0.05) as client:
            async def consumer() -> None:
                async for tok in stream_sse_tokens(client, "https://llm.local/sse", on_close=events.append):
                    got.append(tok)

            task = asyncio.create_task(consumer())
            await asyncio.sleep(0.08)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task

    asyncio.run(run())
    assert 1 <= len(got) < 5
    assert events == ["cancelled"]
`,
    },
    selfCheck: [
      "`parse_sse_data('data:  leading-space')` คืน `' leading-space'` (ตัดช่องว่างหลัง `data:` เพียง 1 ตัว)",
      "Token แรกมาถึงไวกว่าเวลารวมอย่างชัดเจน (`ttft < total * 0.6`) และ `on_close` ได้รับ `'done'` เมื่อเจอ `[DONE]`",
      "`collect_with_limit(stream, 2)` หยุดอ่านที่ 2 token และปิดสตรีมทันทีจน `on_close` ได้รับ `'closed_early'`",
      "เมื่อสั่ง `task.cancel()` กลางทาง `CancelledError` ถูกโยนออกถึงผู้เรียกและ `on_close` ได้รับ `'cancelled'`",
      "ผ่านทั้ง `uv run pytest -W error -q` และ `uv run ruff check .`",
    ],
    acceptance:
      "ผ่านเทสต์ทั้ง 4 กรณีด้วย `uv run pytest -W error -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `stream_sse_tokens` ให้ประกาศตัวแปร `close_reason = 'closed_early'` ไว้ก่อน `try:` — ถ้าเจอ `'[DONE]'` หรือจบลูปปกติให้ตั้ง `close_reason = 'done'`, ถ้าเข้า `except asyncio.CancelledError:` ให้ตั้ง `close_reason = 'cancelled'` แล้ว `raise` และเรียก `on_close(close_reason)` ใน `finally:`",
      },
      {
        body: "อย่าลืมว่าใน `collect_with_limit` หาก `max_tokens <= 0` ควรปิดสตรีมด้วย `async with aclosing(stream): return []` เพื่อไม่ให้ generator ค้างเปิดอยู่",
      },
      {
        body: "โครงของ `parse_sse_data` และ `stream_sse_tokens` เกือบครบแล้ว — เติมส่วน `collect_with_limit` แล้วรัน `uv run pytest -W error -q`",
        code: {
          language: "python",
          filename: "hint-d019-l3.py",
          code: `def parse_sse_data(line: str) -> str | None:
    if not line or line.startswith(":") or not line.startswith("data:"):
        return None
    payload = line[5:]
    return payload[1:] if payload.startswith(" ") else payload


async def stream_sse_tokens(
    client: httpx.AsyncClient,
    url: str,
    on_close: Callable[[str], None] | None = None,
) -> AsyncIterator[str]:
    close_reason = "closed_early"
    try:
        async with client.stream("GET", url) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                data = parse_sse_data(line)
                if data is None:
                    continue
                if data == "[DONE]":
                    close_reason = "done"
                    return
                yield json.loads(data)["token"]
            close_reason = "done"
    except asyncio.CancelledError:
        close_reason = "cancelled"
        raise
    finally:
        if on_close is not None:
            on_close(close_reason)


async def collect_with_limit(
    stream: AsyncIterator[str],
    max_tokens: int,
) -> list[str]:
    # TODO: ใช้ async with aclosing(stream): อ่านสูงสุด max_tokens ชิ้นแล้วคืน list
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -W error -q
uv run ruff check .`,
      caption: "ถ้าผ่านครบโดยไม่ขึ้น warning แปลว่า async generator ของคุณปิดทรัพยากรสะอาดทุกเส้นทาง",
    },
  },

  mistakes: [
    {
      title: "ใช้ `await client.get(url)` แทน `async with client.stream(...)`",
      symptom: "ข้อความไม่ทยอยโผล่ทีละคำ แต่รอค้างหลายวินาทีแล้วโผล่พรวดทีเดียวทั้งหมด (TTFT พังเท่ากับ total latency)",
      fix: "ใช้ `async with client.stream('GET', url) as resp:` คู่กับ `async for line in resp.aiter_lines():` เสมอสำหรับ SSE",
    },
    {
      title: "กลืน `asyncio.CancelledError` ด้วย `except asyncio.CancelledError: return`",
      symptom: "เมื่อสั่ง `task.cancel()` หรือผู้ใช้กดหยุด สตรีมไม่ยอมหยุดหรือผู้เรียกไม่รับรู้ว่า task ถูกยกเลิก",
      fix: "หากต้องจับ `CancelledError` เพื่อบันทึกสถานะหรือ cleanup ให้จบด้วยคำสั่ง `raise` เสมอ",
    },
    {
      title: "ใช้ `.strip()` ตัดช่องว่างทั้งหัวท้ายหลัง `data:`",
      symptom: "ช่องว่างนำหน้าของ token ภาษาอังกฤษหายไป ทำให้ประโยคที่ต่อกันออกมาติดเป็นพืด เช่น `'HelloWorld'`",
      fix: "ตัดเฉพาะช่องว่างตัวแรกหลัง `data:` ตามสเปก SSE (`payload[1:] if payload.startswith(' ') else payload`) และส่ง token ในรูป JSON field",
    },
    {
      title: "สั่ง `break` ออกจาก `async for` โดยไม่ใช้ `contextlib.aclosing`",
      symptom: "บล็อก `finally` และ HTTP connection ใน async generator ไม่ถูกปิดทันที แต่ค้างรอจน Garbage Collector ทำงาน",
      fix: "ครอบ async generator ด้วย `async with contextlib.aclosing(stream):` ทุกครั้งที่มีโอกาสหยุดอ่านก่อนจบ",
    },
  ],

  quiz: {
    intro:
      "4 ข้อ ทดสอบความเข้าใจเรื่อง Async Generators, SSE Framing และการยกเลิกกลางทาง — กดเลือกคำตอบแล้วตรวจทันที",
    questions: [
      mc(
        "d019-q1",
        "เหตุใดการรับสตรีม {{sse}} จาก {{llm}} API จึงต้องใช้ `async with client.stream(...) as resp:` แทน `resp = await client.get(...)`?",
        [
          ["เพราะ `client.get()` ไม่รองรับ HTTPS", "`client.get()` รองรับ HTTPS ตามปกติ"],
          ["เพราะ `client.get()` จะบัฟเฟอร์รอ body จนจบทั้งคำตอบก่อนคืนค่า ทำให้เสียประโยชน์ของ TTFT", "ถูก — `client.stream()` เปิดให้เราอ่านทีละบรรทัดผ่าน `aiter_lines()` ทันทีที่เซิร์ฟเวอร์ส่งข้อมูล"],
          ["เพราะ `client.stream()` จะแปลง JSON เป็น Pydantic ให้เองอัตโนมัติ", "`client.stream()` ส่ง bytes/lines ดิบ เราต้อง parse JSON เอง"],
          ["เพราะ `client.get()` ทำงานใน `async def` ไม่ได้", "`await client.get()` ใช้ใน `async def` ได้ แต่ไม่เหมาะกับ streaming"],
        ],
        "B",
        "`client.stream()` ไม่ดึง body ทั้งหมดเข้าหน่วยความจำล่วงหน้า ทำให้เริ่มประมวลผลและแสดง token แรกได้ทันทีที่เซิร์ฟเวอร์ส่งเฟรมแรกมาถึง",
        "ความต่างหลักระหว่าง `client.get()` กับ `client.stream()` สำหรับ SSE คืออะไร?",
        "`client.get()` รอโหลด body ทั้งหมดจนจบก่อนคืนค่า ส่วน `client.stream()` อ่านทีละ chunk/line ทันทีเพื่อลด TTFT",
      ),
      mc(
        "d019-q2",
        "ในโปรโตคอล SSE บรรทัดที่ขึ้นต้นด้วยเครื่องหมาย `:` เช่น `: keep-alive` หมายถึงอะไร และตัว parser ควรจัดการอย่างไร?",
        [
          ["เป็นสัญญาณ error ที่ต้องโยน exception ทันที", "ไม่ใช่ error — เป็นกลไกปกติของ SSE"],
          ["เป็นบรรทัด comment (มักใช้ส่ง heartbeat กัน connection หลุด) ให้ข้ามไปได้โดยไม่ parse เป็น JSON", "ถูก — ตามสเปก SSE บรรทัดที่ขึ้นต้นด้วย `:` คือ comment ที่ client ควรข้ามอย่างปลอดภัย"],
          ["เป็น token ตัวแรกของคำตอบจากโมเดล", "ข้อมูลจริงอยู่ในบรรทัดที่ขึ้นต้นด้วย `data:`"],
          ["เป็นสัญญาณสิ้นสุดสตรีมแทน `[DONE]`", "ไม่ได้แปลว่าจบสตรีม — แค่แจ้งว่าเซิร์ฟเวอร์ยังเชื่อมต่ออยู่"],
        ],
        "B",
        "เซิร์ฟเวอร์และ proxy มักส่ง `: keep-alive` ระหว่างที่โมเดลกำลังคิดเพื่อกัน idle timeout — parser ที่ดีต้องข้ามบรรทัดว่างและบรรทัดที่ขึ้นต้นด้วย `:` เสมอ",
        "บรรทัด `: keep-alive` ใน SSE คืออะไรและควรจัดการอย่างไร?",
        "เป็นบรรทัด comment สำหรับ heartbeat เพื่อกัน connection หลุด — ให้ parser ข้ามไปโดยไม่ส่งเข้า `json.loads`",
      ),
      mc(
        "d019-q3",
        "เมื่อผู้เรียก `break` ออกจาก `async for tok in stream:` ก่อนสตรีมจะจบ เครื่องมือมาตรฐานใดใน Python 3.10+ ที่รับประกันว่าบล็อก `finally` ของ async generator จะทำงานทันที?",
        [
          ["`asyncio.gather(stream)`", "`gather` ใช้รัน coroutines พร้อมกัน ไม่ได้ใช้ปิด async generator"],
          ["`async with contextlib.aclosing(stream):`", "ถูก — `aclosing` จะเรียก `await stream.aclose()` ทันทีเมื่อออกจากบล็อก แม้จะออกด้วย `break` หรือ error"],
          ["`stream.close()` แบบ sync", "Async generator ต้องปิดแบบ async ด้วย `await stream.aclose()`"],
          ["`del stream` แล้วรอ Python จัดการเอง", "การรอ Garbage Collector ทำให้ HTTP connection ค้างเปิดอยู่โดยไม่จำเป็น"],
        ],
        "B",
        "`contextlib.aclosing` เป็น async context manager มาตรฐานที่เรียก `await obj.aclose()` ทันทีเมื่อออกจากบล็อก ทำให้ HTTP stream และไฟล์ถูกปิดตรงเวลาเสมอ",
        "ทำอย่างไรให้ async generator ปิดทรัพยากรและรัน `finally` ทันทีเมื่อผู้เรียก `break` กลางลูป?",
        "ครอบด้วย `async with contextlib.aclosing(stream):` เพื่อให้เรียก `await stream.aclose()` ทันทีเมื่อออกจากบล็อก",
      ),
      mc(
        "d019-q4",
        "ภายใน async generator ที่จับ `except asyncio.CancelledError:` เพื่อบันทึก log การยกเลิก บรรทัดสุดท้ายในบล็อก `except` ควรทำอะไร?",
        [
          ["`return` ออกไปเงียบ ๆ เพื่อไม่ให้ขึ้น traceback", "ผิด — การไม่ re-raise เท่ากับกลืนสัญญาณยกเลิก ทำให้ผู้เรียกคิดว่างานจบปกติ"],
          ["`raise` เพื่อส่งต่อ `CancelledError` ให้ผู้เรียกและ Event Loop รับรู้การยกเลิกอย่างถูกต้อง", "ถูก — ตามแนวทางมาตรฐานของ `asyncio` ต้องส่งต่อ `CancelledError` เสมอหลังทำความสะอาดเสร็จ"],
          ["`yield 'cancelled'` ส่งข้อความแทน", "ห้าม `yield` ภายในบล็อกจัดการ `CancelledError` และไม่ควรกลืนการยกเลิก"],
          ["เรียก `asyncio.sleep(1)` เพื่อรอ", "การรอเพิ่มจะทำให้การยกเลิกช้าลงโดยไม่จำเป็น"],
        ],
        "B",
        "การบันทึกสถานะแล้ว `raise` ต่อทันทีทำให้ทั้ง cleanup ทำงานครบและ task ถูกยกเลิกตามสัญญาของ `asyncio` อย่างสมบูรณ์",
        "เมื่อจับ `asyncio.CancelledError` เพื่อบันทึกสถานะหรือ cleanup ภายใน async generator ต้องทำอะไรต่อ?",
        "ต้อง `raise` เพื่อส่งต่อ `CancelledError` เสมอ ห้ามกลืนทิ้ง",
      ),
    ],
  },

  takeaways: [
    "`async def` + `yield` สร้าง `AsyncIterator` ที่ส่งข้อมูลทีละชิ้นผ่าน `async for` ช่วยลด {{ttft}} และควบคุมการใช้หน่วยความจำ",
    "อ่าน {{sse}} ด้วย `async with client.stream(...) as resp:` และ `resp.aiter_lines()` เสมอ — ห้ามใช้ `client.get()` ที่บัฟเฟอร์รอจนจบ",
    "Parser SSE ที่รัดกุมต้องข้ามบรรทัดว่างและ `: comment`, ตัดช่องว่างหลัง `data:` สูงสุด 1 ตัว และหยุดสะอาดเมื่อเจอ `[DONE]`",
    "เมื่อหยุดอ่านกลางทางให้ใช้ `contextlib.aclosing(stream)` และหากจับ `asyncio.CancelledError` เพื่อ cleanup ต้อง `raise` ต่อทุกครั้ง",
  ],

  reviewCards: [
    rc(
      "d019-rc-1",
      "ทำไมห้ามใช้ `await client.get(url)` เมื่ออ่าน SSE stream จาก LLM API?",
      "เพราะ `client.get()` จะรอโหลด response body ทั้งหมดจนจบก่อนคืนค่า ทำให้ TTFT เท่ากับเวลารวม — ต้องใช้ `async with client.stream(...) as resp:` คู่ `resp.aiter_lines()`",
    ),
    rc(
      "d019-rc-2",
      "กฎการแกะบรรทัด `data:` ของ SSE คืออะไร และทำไมไม่ควรเรียก `.strip()` ทิ้งทั้งหมด?",
      "ตัด prefix `data:` แล้วตัดช่องว่างนำหน้าได้สูงสุด 1 ตัวเท่านั้น เพื่อไม่ให้ช่องว่างจริงของ token (เช่น `' world'`) หายไป",
    ),
    rc(
      "d019-rc-3",
      "ต้องทำ 2 อย่างอะไรเพื่อป้องกัน connection leak เมื่อผู้ใช้หยุดอ่าน async generator กลางทาง?",
      "1) ครอบผู้บริโภคด้วย `async with contextlib.aclosing(stream):` 2) ใน generator วาง cleanup ใน `finally` และหากจับ `asyncio.CancelledError` ต้อง `raise` ต่อเสมอ",
    ),
  ],

  sources: [
    {
      label: "HTTPX Documentation — Streaming Responses (Async)",
      href: "https://www.python-httpx.org/async/#streaming-responses",
    },
    {
      label: "Python 3 Official Docs — contextlib.aclosing",
      href: "https://docs.python.org/3/library/contextlib.html#contextlib.aclosing",
    },
    {
      label: "Python 3 Official Docs — Task Cancellation & CancelledError",
      href: "https://docs.python.org/3/library/asyncio-task.html#task-cancellation",
    },
    {
      label: "WHATWG HTML Living Standard — Server-Sent Events (SSE)",
      href: "https://html.spec.whatwg.org/multipage/server-sent-events.html",
    },
  ],

  glossary: [
    "asyncio",
    "httpx",
    "sse",
    "ttft",
    "llm",
    "fastapi",
    "mocking",
    "pytest",
  ],
});
