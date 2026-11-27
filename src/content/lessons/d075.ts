import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D075 — Phase 3 / Block B19
 * Streaming UX (SSE), Time-to-First-Token (TTFT) & Cancellation
 */
export const d075: Lesson = defineLesson({
  day: 75,
  titleTh: "Streaming UX ด้วย SSE: ลดเวลาคำแรก (TTFT), จัดการ UTF-8 ไทย และยกเลิกอย่างสะอาด",
  tagline: "30 นาที · รองรับทั้ง API จริง, Local Ollama และโหมด mock · อ่าน async SSE stream, วัด TTFT/tokens-per-sec และปิด stream เมื่อ cancel",
  icon: "zap",
  visual: {
    id: "streaming-ttft",
    title: "Non-Streaming (จอนิ่ง 4.2s) vs SSE Streaming (TTFT 0.35s + Cancel)",
    caption: "กดสลับเทียบประสบการณ์ผู้ใช้และดูวิธีคำนวณ TTFT, tokens/sec และการยกเลิก stream กลางทางอย่างสะอาด",
    alt: "แผนภาพเปรียบเทียบ Non-Streaming กับ SSE Streaming และ TTFT",
  },
  requiresApiKey: true,
  apiKeyNote: "รองรับทั้ง LLM API จริงและโหมด mock / local Ollama บนเครื่องเพื่อฝึกและรันเทสต์ฟรี",
  tools: ["Official LLM SDK", "httpx", "asyncio", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "LLM สร้างคำตอบทีละ Token — Streaming จึงปลดล็อก UX ทันที",
      body: "เนื่องจาก {{llm}} แบบ Decoder สร้างคำตอบแบบ autoregressive ทีละ token การรอให้จบทั้งย่อหน้าอาจใช้เวลา 4–8 วินาที แต่ถ้าส่งออกทันทีผ่าน {{sse}} ผู้ใช้จะเห็นตัวอักษรแรกภายในไม่กี่ร้อยมิลลิวินาที ({{ttft}})",
      lessonNote: "วันนี้เราเปรียบเทียบ Non-Streaming กับ SSE Streaming และวัดทั้ง `TTFT`, `total_sec` และ throughput (`tokens/sec`)",
    },
    {
      node: 3,
      heading: "ทดสอบ UTF-8 ภาษาไทยที่ถูกหั่นกลางไบต์และการยกเลิกกลางทาง",
      body: "ตัวอักษรภาษาไทย 1 ตัวใช้ 3 ไบต์ใน UTF-8 หาก network packet ตัดแบ่งกลางอักขระแล้ว decode ตรง ๆ จะพังด้วย `UnicodeDecodeError` หรือได้อักขระ ``",
      lessonNote: "เราจะใช้ `codecs.getincrementaldecoder('utf-8')` และเขียน {{pytest}} จำลองทั้งไบต์ไทยที่โดนหั่นและการ cancel stream",
    },
    {
      node: 4,
      heading: "จัดการ `asyncio.CancelledError` และปิด Stream ให้สะอาด",
      body: "เมื่อผู้ใช้กดปุ่ม Stop หรือปิดหน้าต่าง แอปต้องยกเลิกงาน {{asyncio}} และปิดการเชื่อมต่อ HTTP/async generator ทันที เพื่อหยุดการคิดเงิน output tokens และป้องกัน connection leak",
      lessonNote: "เราจะใช้ `contextlib.aclosing(...)` และไม่กลืน `asyncio.CancelledError` เพื่อให้ระบบคืนทรัพยากรครบทุกครั้ง",
    },
    {
      node: 5,
      heading: "แยกวัด `TTFT` ออกจาก `Total Latency` บน Monitoring Dashboard",
      body: "ค่า P95 ของ `TTFT` สะท้อนความเร็ว prefill และคิวของโมเดล ส่วน `inter-token latency` (ITL) สะท้อนความเร็วตอนสร้างคำตอบ — การวัดแยกกันช่วยหาคอขวดได้ตรงจุด",
      lessonNote: "ตัววัด `StreamMetrics` จากวันนี้จะถูกนำไปประกอบเป็น Streaming CLI Chat พร้อมตัวนับต้นทุนใน Day 76",
    },
  ],

  objectives: [
    "**อธิบายและวัดค่า** {{ttft}} (Time-to-First-Token), Total Latency และ Throughput (`tokens/sec`) จาก async {{sse}} stream ด้วย `time.perf_counter()`",
    "**ถอดรหัส UTF-8 แบบ Incremental** (`codecs.getincrementaldecoder('utf-8')`) เพื่อรับประกันว่าตัวอักษรภาษาไทย 3 ไบต์จะไม่แตกหรือโยน `UnicodeDecodeError` เมื่อถูกแบ่งข้าม chunk",
    "**จัดการ Cancellation อย่างสะอาด** ด้วย `contextlib.aclosing(...)`, `try/finally` และการ re-raise `asyncio.CancelledError` โดยไม่ทำให้ connection รั่วไหล",
  ],

  prerequisites: [
    "พื้นฐาน `asyncio`, Async Generators และ {{sse}} จาก Block B05 (Days 17–19)",
    "การเรียก LLM API และ `httpx` จาก Day 73",
    "มีหรือไม่มี API key ก็เรียนได้ 100% — ใช้ {{mocking}} async stream และ `pytest` บนเครื่อง",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ด้วย `uv` พร้อม `httpx`, `openai` และ `pytest` เพื่อฝึกอ่าน SSE stream, จัดการ UTF-8 ภาษาไทย และทดสอบการยกเลิกกลางทางบนเครื่อง",
    commands: `uv init ai-day75 && cd ai-day75
uv add openai httpx
uv add --dev pytest ruff
uv run python -c "import asyncio, codecs, httpx; print('Streaming lab ready, httpx:', httpx.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์โปรเจกต์ `ai-day75` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `openai`, `httpx`, `pytest` และ `ruff`"],
      ["verify", "ยืนยันว่า `asyncio`, `codecs` และ `httpx` พร้อมใช้งาน"],
    ],
    note: "การทดสอบทุกอย่างในบทนี้รันได้ 100% บนเครื่องด้วย mock async stream — และโค้ดรูปแบบเดียวกันใช้กับ `AsyncOpenAI(..., stream=True)` หรือ local Ollama ได้ทันที",
  },

  concepts: [
    {
      id: "ttft-vs-total-latency",
      title: "1 · Perceived Latency: ทำไม `TTFT` จึงสำคัญกว่า Total Latency ในงานแชต",
      paragraphs: [
        "สมมติโมเดลใช้เวลาสร้างคำตอบยาว 150 tokens ทั้งหมด `4.2 วินาที`: แบบ **Non-Streaming** ผู้ใช้จะจ้องหน้าจอว่างเปล่า (spinner หมุนนิ่ง) ตลอด 4.2 วินาทีเต็ม ๆ ทำให้รู้สึกว่าระบบช้าหรือค้าง แต่แบบ **{{sse}} Streaming** โมเดลส่งคำแรกออกมาทันทีที่จบช่วง Prefill ในเวลาเพียง **`0.35 วินาที` ({{ttft}})** แล้วค่อย ๆ ไหลคำตอบต่อจนจบ — แม้เวลารวมยังใกล้เคียง 4.2 วินาทีเท่าเดิม แต่ผู้ใช้เริ่มอ่านได้ทันทีและรู้สึกว่าระบบตอบสนองไวกว่าหลายเท่า",
        "ในทางวิศวกรรม เราวัด Streaming ด้วย 3 ตัวชี้วัดหลักเสมอ: (1) **TTFT** = เวลาตั้งแต่ส่ง request จนได้รับ **delta แรกที่ไม่ว่าง** (ไม่ใช่แค่ได้รับ HTTP header `200 OK` หรือ chunk แรกที่เป็น role เปล่า!), (2) **Total Latency** = เวลาตั้งแต่เริ่มส่งจนจบ `[DONE]`, และ (3) **Decode Speed** = จำนวน output chunks/tokens หารด้วยเวลาหลังคำแรก (`total_sec - ttft_sec`)",
      ],
      analogy: "Non-Streaming เหมือนไปร้านอาหารตามสั่งที่ครัวไม่เสิร์ฟอะไรเลยจนกว่าจะทำครบทั้ง 5 จาน (ลูกค้ารอหิวจนอยากลุกหนี) แต่ Streaming เหมือนเสิร์ฟน้ำและจานแรกมาภายใน 2 นาที (`TTFT`) ให้ลูกค้าเริ่มทานได้ก่อนระหว่างที่จานถัดไปกำลังผัด",
      bullets: [
        "**วัด TTFT ให้ถูกจุด**: บันทึกเวลาครั้งแรกเฉพาะเมื่อ `delta != \"\"` — อย่าจับตอนได้ chunk แรกที่มีแค่ `{\"role\": \"assistant\"}` และ `content: \"\"`",
        "**ใช้ `time.perf_counter()` เสมอ**: ห้ามใช้ `time.time()` หรือ `datetime.now()` จับเวลา latency เพราะนาฬิการะบบอาจเดินถอยหลังเมื่อซิงก์ NTP",
        "**ต้นทุนไม่ลด แต่ Cancel ได้เร็ว**: ถ้าผู้ใช้เห็น 2 บรรทัดแรกว่าตอบผิดทางก็กด Stop ได้ทันที ประหยัดทั้งเวลาและ output tokens ที่เหลือ",
      ],
      whyTitle: "Why this matters — ตัวชี้วัด TTFT คือ SLA หลักของ AI Chat UX",
      whyParagraphs: [
        "งานวิจัยด้าน UX ชี้ว่าผู้ใช้เริ่มรู้สึกว่าระบบ \"ช้า\" เมื่อจอนิ่งเกิน 1 วินาที การกด {{ttft}} ให้ต่ำกว่า `0.5–0.8s` ด้วย streaming (และ prompt ที่กระชับใน Day 74) ส่งผลต่อความพึงพอใจของผู้ใช้มากกว่าการลด total latency เล็กน้อย",
        "เมื่อขึ้น production ใน Phase 5 คุณจะตั้ง alert แยกสำหรับ `TTFT P95` เพื่อจับปัญหา prefill ช้าหรือคิวโมเดลหนาแน่นได้ทันที",
      ],
    },
    {
      id: "sse-parsing-and-thai-utf8",
      title: "2 · อ่าน Async SSE Stream และป้องกันตัวอักษรไทย 3 ไบต์แตกกลางทาง",
      paragraphs: [
        "LLM API แทบทุกค่ายส่งคำตอบแบบ streaming ผ่านโปรโตคอล **Server-Sent Events ({{sse}})** โดยแต่ละบรรทัดข้อมูลขึ้นต้นด้วย `data: ` ตามด้วย JSON ของ delta (เช่น `data: {\"choices\":[{\"delta\":{\"content\":\"สวัส\"}}]}`), มีบรรทัดว่างคั่นระหว่าง event, อาจมีบรรทัดคอมเมนต์ keep-alive อย่าง `: ping`, และจบด้วยสัญญาณ `data: [DONE]`",
        "กับดักเฉพาะของภาษาไทยคือการเข้ารหัส **UTF-8**: ตัวอักษรภาษาอังกฤษ 1 ตัวใช้ 1 ไบต์ แต่ตัวอักษรไทยอย่าง `ก` ใช้ **3 ไบต์** (`\\xe0\\xb8\\x81`) และอิโมจิใช้ 4 ไบต์! หาก TCP packet ตัดแบ่งระหว่างไบต์ที่ 2 กับ 3 แล้วคุณเรียก `chunk.decode('utf-8')` ทีละก้อน โค้ดจะพังทันทีด้วย `UnicodeDecodeError` หรือถ้าใช้ `errors='replace'` ตัวหนังสือไทยจะกลายเป็น `` — วิธีที่ถูกต้องคือใช้ **`codecs.getincrementaldecoder('utf-8')()`** (หรือใช้ `response.aiter_text()` ของ {{httpx}} ซึ่งใช้ตัวเดียวกันข้างใน) เพื่อพักไบต์ที่ยังไม่ครบตัวอักษรไว้รวมกับ chunk ถัดไป",
      ],
      analogy: "ตัวอักษรไทย 1 ตัวเหมือนตัวต่อเลโก้ 3 ชิ้นที่ส่งมาทางสายพานทีละชิ้น — Incremental UTF-8 Decoder คือถาดพักที่รอให้ครบ 3 ชิ้นก่อนแล้วค่อยประกอบเป็นตัว `ก` ออกมาโชว์ ไม่รีบโยนชิ้นส่วนครึ่ง ๆ กลาง ๆ ขึ้นหน้าจอ",
      code: {
        language: "python",
        filename: "thai_utf8_stream.py",
        code: `import codecs
from collections.abc import AsyncIterator


async def decode_utf8_chunks(raw_chunks: AsyncIterator[bytes]) -> AsyncIterator[str]:
    """ถอดรหัส UTF-8 แบบ incremental ไม่ให้ตัวอักษรไทย 3 ไบต์แตกเมื่อโดนหั่นข้าม packet"""
    decoder = codecs.getincrementaldecoder("utf-8")(errors="strict")
    async for raw in raw_chunks:
        text = decoder.decode(raw, final=False)
        if text:
            yield text
    tail = decoder.decode(b"", final=True)
    if tail:
        yield tail`,
        caption: "อย่าลืมเรียก `decoder.decode(b'', final=True)` ตอนจบ stream เพื่อตรวจว่าไม่มีไบต์ค้างไม่ครบตัวอักษรหลงเหลืออยู่",
      },
      whyTitle: "Why this matters — บั๊ก UTF-8 ไทยจะโผล่แบบสุ่มเฉพาะบนเน็ตจริง",
      whyParagraphs: [
        "ตอนเทสต์บนเครื่องกับข้อความสั้น ๆ packet มักไม่โดนตัดกลางตัวอักษร คุณจึงไม่เคยเห็นบั๊กนี้จนกระทั่งขึ้น production แล้วลูกค้าเจอข้อความภาษาไทยกลายเป็น `` หรือเซิร์ฟเวอร์พังเป็นบางครั้ง",
        "การเขียน unit test จงใจหั่น `\"สวัสดี\".encode(\"utf-8\")` ออกเป็นชิ้นละ 2 ไบต์แล้วผ่าน `decode_utf8_chunks` จะรับประกันว่าโค้ดคุณรอดจากปัญหานี้ 100%",
      ],
    },
    {
      id: "graceful-cancellation",
      title: "3 · ยกเลิก Stream กลางทางอย่างสะอาด (`CancelledError` & `aclosing`)",
      paragraphs: [
        "ข้อได้เปรียบสำคัญของ Streaming คือผู้ใช้สามารถกดปุ่ม **Stop** หรือ **Ctrl+C** ยกเลิกคำตอบที่ยาวหรือหลงประเด็นได้ทันที แต่ใน {{asyncio}} ถ้าคุณยกเลิก Task โดยไม่ปิด async generator หรือ HTTP stream ฝั่งปลายทาง เซิร์ฟเวอร์จะยังสร้าง token ต่อไปและ connection pool ของ {{httpx}} อาจค่อย ๆ รั่วจนเต็ม",
        "รูปแบบระดับ production มีกฎ 2 ข้อที่ต้องทำคู่กัน: (1) ครอบ async generator ด้วย **`async with contextlib.aclosing(stream):`** (หรือ `try ... finally: await stream.aclose()`) เพื่อให้โค้ด cleanup ฝั่ง producer รันเสมอทั้งตอนจบปกติ ตอน break กลางทาง และตอนถูก cancel, และ (2) เมื่อจับ `asyncio.CancelledError` เพื่อบันทึก log หรือคืนทรัพยากรแล้ว **ต้อง `raise` ต่อเสมอ** ยกเว้นที่ขอบเขตบนสุดของแอป (เช่น CLI loop หรือ FastAPI endpoint handler)",
      ],
      analogy: "การกด Stop โดยไม่ปิด stream เหมือนวางสายโทรศัพท์โดยไม่กดปุ่มแดง — คุณไม่ได้ฟังแล้ว แต่ปลายสายยังพูดต่อและค่าโทรยังเดินอยู่ การใช้ `aclosing()` คือการกดวางสายให้เรียบร้อยทุกครั้ง",
      code: {
        language: "python",
        filename: "safe_cancel.py",
        code: `import asyncio
from collections.abc import AsyncIterator
from contextlib import aclosing


async def read_until_limit(stream: AsyncIterator[str], limit: int) -> list[str]:
    collected: list[str] = []
    async with aclosing(stream):  # รับประกันเรียก stream.aclose() เสมอแม้ break หรือ cancel
        async for token in stream:
            collected.append(token)
            if len(collected) >= limit:
                break
    return collected`,
        caption: "`contextlib.aclosing` (มาตรฐานตั้งแต่ Python 3.10) ปิด async generator อย่างสะอาดทันทีที่ออกจากบล็อก ไม่ว่าจะจบปกติ, `break` หรือโดน `CancelledError`",
      },
      whyTitle: "Why this matters — หยุดค่าใช้จ่ายและป้องกัน Resource Leak ในบริการจริง",
      whyParagraphs: [
        "ในระบบเว็บที่มีผู้ใช้กดยกเลิกหรือรีเฟรชหน้าจอบ่อยครั้ง หากไม่ปิด upstream LLM stream ให้เร็วที่สุด คุณจะเสียเงินค่า output token ที่ไม่มีใครอ่านและเกิด `RuntimeWarning` หรือ connection pool เต็ม",
        "ทักษะการปิด stream อย่างสะอาดวันนี้จะถูกใช้โดยตรงทั้งใน CLI ของ Day 76 และ FastAPI SSE Endpoint ใน Phase 5 (Day 138)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — `asyncio` SSE + `aclosing` ≈ `EventSource` / `ReadableStream` + `AbortController`",
      body: [
        "ฝั่ง JavaScript/TypeScript เวลาคุณทำ streaming chat ด้วย `fetch()` คุณใช้ `TextDecoder('utf-8', { stream: true })` เพื่อไม่ให้ตัวอักษรไทยขาดกลาง chunk และส่ง `AbortController.signal` เพื่อยกเลิกคำขอเมื่อผู้ใช้กดปุ่ม Stop",
        "ใน Python โมเดลแนวคิดเหมือนกันทุกประการ: `codecs.getincrementaldecoder('utf-8')` ทำหน้าที่เหมือน `TextDecoder({ stream: true })` และ `task.cancel()` + `aclosing(stream)` ทำหน้าที่เหมือน `AbortController` + `reader.cancel()`",
      ],
      table: [
        ["`codecs.getincrementaldecoder('utf-8')`", "`new TextDecoder('utf-8')` + `{ stream: true }`"],
        ["`async for chunk in stream:`", "`for await (const chunk of stream)`"],
        ["`task.cancel()` + `asyncio.CancelledError`", "`abortController.abort()` + `AbortError`"],
        ["`async with aclosing(stream):`", "`try { ... } finally { await reader.cancel() }`"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมภาษาไทย 1 ตัวถึงมี 3 ไบต์ใน UTF-8?",
      body: [
        "มาตรฐาน UTF-8 ออกแบบให้ตัวอักษรภาษาอังกฤษพื้นฐาน (ASCII `A-Z`, `0-9`) ใช้แค่ 1 ไบต์เพื่อประหยัดพื้นที่และเข้ากันได้กับระบบเก่า ส่วนอักษรภาษาอื่นอย่างอักษรไทย (`U+0E00`–`U+0E7F`) ถูกจัดอยู่ในช่วง 3 ไบต์ เช่น `ก` = `0xE0 0xB8 0x81`",
        "เวลาข้อมูลวิ่งผ่านเครือข่ายทีละ packet ตัวแบ่ง packet อาจผ่ากลาง 3 ไบต์นี้ตรงไหนก็ได้ นั่นคือเหตุผลที่เราห้ามเรียก `.decode('utf-8')` แยกชิ้นบน raw bytes เด็ดขาด แต่ต้องใช้ incremental decoder เสมอ",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: สร้างตัวรับ SSE stream ภาษาไทยที่ทดสอบได้ออฟไลน์ 100% — เริ่มจากถอดรหัสไบต์ไทยที่โดนหั่นกลางตัวอักษร, วัด TTFT vs Total Latency และทดสอบการ cancel กลางทางพร้อมยืนยันว่า stream ถูกปิดจริง",
    steps: [
      {
        title: "1 · ถอดรหัสไบต์ภาษาไทยที่โดนหั่นชิ้นละ 2 ไบต์โดยไม่พัง",
        explain: "จงใจหั่นสตริงภาษาไทย `\"สวัสดีครับ\"` ออกเป็นก้อนละ 2 ไบต์ (ตัดผ่ากลางตัวอักษร 3 ไบต์ทุกตัว!) แล้วส่งผ่าน `decode_utf8_chunks` จะได้ภาษาไทยสมบูรณ์ 100%",
        code: {
          language: "python",
          filename: "worked_day75.py",
          code: `import asyncio
import codecs
from collections.abc import AsyncIterator


async def sliced_thai_bytes(text: str, step: int = 2) -> AsyncIterator[bytes]:
    raw = text.encode("utf-8")
    for i in range(0, len(raw), step):
        yield raw[i : i + step]
        await asyncio.sleep(0)


async def decode_utf8_chunks(raw_chunks: AsyncIterator[bytes]) -> AsyncIterator[str]:
    decoder = codecs.getincrementaldecoder("utf-8")(errors="strict")
    async for raw in raw_chunks:
        piece = decoder.decode(raw, final=False)
        if piece:
            yield piece
    tail = decoder.decode(b"", final=True)
    if tail:
        yield tail


async def demo_utf8() -> None:
    parts = [p async for p in decode_utf8_chunks(sliced_thai_bytes("สวัสดีครับ AI ไทย", step=2))]
    print("Decoded chunks:", parts)
    print("Joined:", "".join(parts))


asyncio.run(demo_utf8())`,
        },
        output: `Decoded chunks: ['ส', 'วั', 'ส', 'ดี', 'ค', 'รั', 'บ ', 'AI', ' ไ', 'ท', 'ย']
Joined: สวัสดีครับ AI ไทย`,
      },
      {
        title: "2 · พาร์ส SSE Lines และวัด `TTFT` vs `Total Latency` อย่างแม่นยำ",
        explain: "ข้ามบรรทัดว่าง คอมเมนต์ `: keep-alive` และ chunk แรกที่ `content` เป็นสตริงว่าง จากนั้นจับเวลา `TTFT` ที่ delta แรกที่มีเนื้อหาจริง",
        code: {
          language: "python",
          filename: "worked_day75.py",
          code: `import json
import time


async def mock_sse_lines() -> AsyncIterator[str]:
    # จำลอง prefill delay 0.12s ก่อนคำแรกจะมา
    await asyncio.sleep(0.12)
    events = [
        ": keep-alive",
        'data: {"choices":[{"delta":{"role":"assistant","content":""}}]}',
        'data: {"choices":[{"delta":{"content":"สวัสดี"}}]}',
        'data: {"choices":[{"delta":{"content":"ครับ "}}]}',
        'data: {"choices":[{"delta":{"content":"ยินดีให้บริการ"}}]}',
        "data: [DONE]",
    ]
    for line in events:
        yield line
        await asyncio.sleep(0.04)


async def demo_metrics() -> None:
    t0 = time.perf_counter()
    ttft: float | None = None
    tokens: list[str] = []

    async for line in mock_sse_lines():
        if not line.startswith("data:"):
            continue
        payload = line.removeprefix("data:").strip()
        if payload == "[DONE]":
            break
        delta = json.loads(payload)["choices"][0]["delta"].get("content", "")
        if delta:
            if ttft is None:
                ttft = time.perf_counter() - t0
            tokens.append(delta)

    total = time.perf_counter() - t0
    print(f"TTFT={ttft:.3f}s | Total={total:.3f}s | Chunks={len(tokens)} | Text={''.join(tokens)}")


asyncio.run(demo_metrics())`,
        },
        output: `TTFT=0.162s | Total=0.285s | Chunks=3 | Text=สวัสดีครับ ยินดีให้บริการ`,
      },
      {
        title: "3 · ยกเลิก Stream กลางทางและตรวจว่า Cleanup ทำงานครบด้วย `aclosing`",
        explain: "ใช้ `contextlib.aclosing` ครอบ async generator — เมื่อ `task.cancel()` ถูกเรียกกลางทาง บล็อก `finally` ในฝั่ง producer จะรันทันทีเพื่อคืนทรัพยากร",
        code: {
          language: "python",
          filename: "worked_day75.py",
          code: `from contextlib import aclosing

cleanup_state = {"closed": False}


async def slow_token_stream() -> AsyncIterator[str]:
    try:
        for word in ["คำที่1 ", "คำที่2 ", "คำที่3 ", "คำที่4 ", "คำที่5 "]:
            await asyncio.sleep(0.05)
            yield word
    finally:
        cleanup_state["closed"] = True


async def demo_cancel() -> None:
    collected: list[str] = []

    async def consumer() -> None:
        async with aclosing(slow_token_stream()) as stream:
            async for tok in stream:
                collected.append(tok)

    task = asyncio.create_task(consumer())
    await asyncio.sleep(0.12)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print(f"Cancelled cleanly! Partial={''.join(collected)!r} | Stream closed={cleanup_state['closed']}")


asyncio.run(demo_cancel())`,
        },
        output: `Cancelled cleanly! Partial='คำที่1 คำที่2 ' | Stream closed=True`,
      },
    ],
    gotcha: "กับดักคลาสสิกตอนวัด TTFT: หลาย SDK ส่ง chunk แรกที่มี `delta = {\"role\": \"assistant\", \"content\": \"\"}` ออกมาก่อนจะมีตัวอักษรจริง หากไม่เช็ก `if delta:` ก่อนจับเวลา `ttft` คุณจะได้ตัวเลข TTFT ที่เร็วหลอกตากว่าความเป็นจริงที่ผู้ใช้เห็นบนหน้าจอ",
  },

  practice: {
    intro: "สร้างโมดูล `stream_consumer.py` ที่รวมความสามารถครบทั้ง 3 ด้านของ Streaming UX: ถอดรหัส UTF-8 ภาษาไทยแบบ incremental, พาร์ส SSE delta lines, และบริโภค async stream พร้อมวัด `TTFT` และปิด stream อย่างสะอาดเมื่อถูกยกเลิก",
    requirements: [
      "สร้าง dataclass `StreamMetrics(text: str, ttft_sec: float | None, total_sec: float, chunk_count: int)`",
      "สร้าง async generator `decode_utf8_chunks(raw_chunks: AsyncIterator[bytes]) -> AsyncIterator[str]` ที่ใช้ `codecs.getincrementaldecoder('utf-8')(errors='strict')` และเรียก `decoder.decode(b'', final=True)` ตอนจบ เพื่อให้ตัวอักษรไทย 3 ไบต์ที่ถูกแบ่งข้ามก้อนถอดรหัสได้อย่างถูกต้อง",
      "สร้าง async generator `iter_sse_deltas(lines: AsyncIterator[str]) -> AsyncIterator[str]` ที่รับบรรทัด SSE: ข้ามบรรทัดว่างและคอมเมนต์ที่ขึ้นต้นด้วย `:`, อ่านเฉพาะบรรทัดที่ขึ้นต้นด้วย `data:`, หยุดทันทีเมื่อเจอ `data: [DONE]`, และ `yield` เฉพาะค่า `choices[0]['delta'].get('content')` ที่ไม่ว่าง (ใช้ `contextlib.aclosing` ดูแล `lines` หากปิดกลางทาง)",
      "สร้าง `async def consume_stream(deltas: AsyncIterator[str], *, on_delta: Callable[[str], None] | None = None, max_chunks: int | None = None) -> StreamMetrics` ที่ครอบ `deltas` ด้วย `aclosing(deltas)` (หรือ `try/finally: await aclose()`), จับเวลา `ttft_sec` เฉพาะเมื่อได้รับ delta แรกที่ไม่ว่าง (`None` ถ้าไม่มี delta ใดเลย), เรียก `on_delta(chunk)` ทีละก้อน, หยุดเมื่อครบ `max_chunks` (ถ้ากำหนด), และเมื่อโดน `asyncio.CancelledError` ต้องปิด stream แล้ว re-raise `CancelledError` เสมอ",
    ],
    starter: {
      language: "python",
      filename: "stream_consumer.py",
      code: `import asyncio
import codecs
from collections.abc import AsyncIterator, Callable
from contextlib import aclosing
from dataclasses import dataclass
import json
import time


@dataclass(frozen=True)
class StreamMetrics:
    text: str
    ttft_sec: float | None
    total_sec: float
    chunk_count: int


async def decode_utf8_chunks(raw_chunks: AsyncIterator[bytes]) -> AsyncIterator[str]:
    """ถอดรหัส bytes stream เป็น str ด้วย incremental UTF-8 decoder"""
    # TODO: ใช้ codecs.getincrementaldecoder("utf-8")(errors="strict")
    raise NotImplementedError
    yield ""  # pragma: no cover


async def iter_sse_deltas(lines: AsyncIterator[str]) -> AsyncIterator[str]:
    """ดึง content delta ที่ไม่ว่างจากบรรทัด SSE และหยุดที่ data: [DONE]"""
    # TODO: ข้ามบรรทัดว่าง/คอมเมนต์, พาร์ส JSON หลัง 'data:', หยุดเมื่อเจอ '[DONE]'
    raise NotImplementedError
    yield ""  # pragma: no cover


async def consume_stream(
    deltas: AsyncIterator[str],
    *,
    on_delta: Callable[[str], None] | None = None,
    max_chunks: int | None = None,
) -> StreamMetrics:
    """บริโภค delta stream พร้อมวัด TTFT, total_sec และปิด stream อย่างสะอาดแม้โดน cancel"""
    # TODO: ใช้ aclosing(deltas), จับเวลาด้วย time.perf_counter(), ตรวจ max_chunks และ re-raise CancelledError
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_stream_consumer.py",
      code: `import asyncio
from collections.abc import AsyncIterator
import pytest
from stream_consumer import consume_stream, decode_utf8_chunks, iter_sse_deltas


def test_decode_utf8_chunks_handles_split_thai_bytes():
    thai_text = "ระบบตอบกลับอัตโนมัติภาษาไทย 100% 🚀"
    raw = thai_text.encode("utf-8")

    async def byte_gen() -> AsyncIterator[bytes]:
        # จงใจหั่นทีละ 2 ไบต์เพื่อผ่ากลางตัวอักษรไทย 3 ไบต์และอิโมจิ 4 ไบต์
        for i in range(0, len(raw), 2):
            yield raw[i : i + 2]

    async def run() -> str:
        return "".join([piece async for piece in decode_utf8_chunks(byte_gen())])

    assert asyncio.run(run()) == thai_text


def test_iter_sse_deltas_parses_events_and_stops_at_done():
    async def sse_gen() -> AsyncIterator[str]:
        yield ": ping"
        yield ""
        yield 'data: {"choices":[{"delta":{"role":"assistant","content":""}}]}'
        yield 'data: {"choices":[{"delta":{"content":"สวัสดี"}}]}'
        yield 'data: {"choices":[{"delta":{"content":"ครับ"}}]}'
        yield "data: [DONE]"
        yield 'data: {"choices":[{"delta":{"content":"ไม่ควรถูกอ่าน"}}]}'

    async def run() -> list[str]:
        return [d async for d in iter_sse_deltas(sse_gen())]

    assert asyncio.run(run()) == ["สวัสดี", "ครับ"]


def test_consume_stream_measures_ttft_and_flushes_incrementally():
    seen: list[str] = []

    async def gen() -> AsyncIterator[str]:
        await asyncio.sleep(0.06)
        yield ""
        await asyncio.sleep(0.04)
        yield "คำแรก "
        await asyncio.sleep(0.06)
        yield "คำสอง"

    metrics = asyncio.run(consume_stream(gen(), on_delta=seen.append))
    assert metrics.text == "คำแรก คำสอง"
    assert seen == ["คำแรก ", "คำสอง"]
    assert metrics.chunk_count == 2
    assert metrics.ttft_sec is not None
    assert 0.08 <= metrics.ttft_sec < metrics.total_sec


def test_consume_stream_closes_generator_on_cancel_and_limit():
    state = {"closed_cancel": False, "closed_limit": False}

    async def slow_gen(key: str) -> AsyncIterator[str]:
        try:
            for i in range(20):
                await asyncio.sleep(0.03)
                yield f"tok-{i} "
        finally:
            state[key] = True

    async def run_limit() -> None:
        m = await consume_stream(slow_gen("closed_limit"), max_chunks=2)
        assert m.chunk_count == 2
        assert state["closed_limit"] is True

    async def run_cancel() -> None:
        task = asyncio.create_task(consume_stream(slow_gen("closed_cancel")))
        await asyncio.sleep(0.05)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert state["closed_cancel"] is True

    asyncio.run(run_limit())
    asyncio.run(run_cancel())
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases",
      "ตรวจว่า `decode_utf8_chunks` ประกอบตัวอักษรไทย 3 ไบต์และอิโมจิ 4 ไบต์ที่ถูกหั่นทีละ 2 ไบต์กลับมาได้ครบ 100%",
      "ตรวจว่า `iter_sse_deltas` ข้าม `: ping`, บรรทัดว่าง, `content == \"\"` และหยุดอ่านทันทีที่ `data: [DONE]`",
      "ตรวจว่า `ttft_sec` น้อยกว่า `total_sec` และจับเวลาเฉพาะเมื่อได้ delta แรกที่ไม่ว่าง",
      "ตรวจว่าเมื่อ `max_chunks` ครบหรือโดน `task.cancel()` บล็อก `finally` ของ producer ถูกรัน (`closed == True`) และ `CancelledError` ถูก re-raise",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_stream_consumer.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `decode_utf8_chunks` ใช้ `decoder = codecs.getincrementaldecoder('utf-8')(errors='strict')` แล้วเรียก `decoder.decode(chunk, final=False)` ในลูป ปิดท้ายด้วย `decoder.decode(b'', final=True)`",
      },
      {
        body: "ใน `consume_stream` ให้ครอบด้วย `async with aclosing(deltas):` — ถ้า `max_chunks is not None and count >= max_chunks: break` ออกจากลูป `aclosing` จะเรียก `await deltas.aclose()` ให้อัตโนมัติทั้งกรณี `break` และ `CancelledError`",
      },
      {
        body: "โครงของ `consume_stream` เกือบสมบูรณ์แล้ว — นำไปปรับให้ครบและเติม `decode_utf8_chunks` กับ `iter_sse_deltas`",
        code: {
          language: "python",
          filename: "hint_day75.py",
          code: `from collections.abc import AsyncIterator, Callable
from contextlib import aclosing
import time


async def consume_stream(
    deltas: AsyncIterator[str],
    *,
    on_delta: Callable[[str], None] | None = None,
    max_chunks: int | None = None,
):
    t0 = time.perf_counter()
    ttft: float | None = None
    parts: list[str] = []

    async with aclosing(deltas):
        async for chunk in deltas:
            if not chunk:
                continue
            if ttft is None:
                ttft = time.perf_counter() - t0
            parts.append(chunk)
            if on_delta is not None:
                on_delta(chunk)
            if max_chunks is not None and len(parts) >= max_chunks:
                break

    return StreamMetrics(
        text="".join(parts),
        ttft_sec=ttft,
        total_sec=time.perf_counter() - t0,
        chunk_count=len(parts),
    )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "เรียก `raw_chunk.decode('utf-8')` ตรง ๆ บน byte stream ภาษาไทย",
      symptom: "บางครั้งข้อความไทยพังด้วย `UnicodeDecodeError: unexpected end of data` หรือแสดงสัญลักษณ์ `` กลางคำ",
      fix: "ใช้ `codecs.getincrementaldecoder('utf-8')` (หรือ `httpx` `response.aiter_text()`) เพื่อสะสมไบต์ที่ไม่ครบอักขระข้าม chunk",
    },
    {
      title: "วัด `TTFT` ทันทีที่ได้ HTTP `200 OK` หรือ chunk แรกที่ `content` ว่าง",
      symptom: "แดชบอร์ดรายงาน TTFT = `0.05s` แต่ผู้ใช้จริงเห็นหน้าจอนิ่งอยู่เกือบ `1.0s` กว่าตัวอักษรแรกจะโผล่",
      fix: "บันทึก `ttft_sec` เฉพาะเมื่อได้รับ `delta` แรกที่ `content` ไม่ใช่สตริงว่างเท่านั้น",
    },
    {
      title: "กลืน `asyncio.CancelledError` ด้วย `except Exception` หรือ `except BaseException: pass`",
      symptom: "ผู้ใช้กดยกเลิกแล้วแต่ coroutine ไม่ยอมหยุด ทำงานค้างอยู่ในพื้นหลังและยังคงดึง stream ต่อ",
      fix: "ใช้ `async with aclosing(stream):` เพื่อปิด stream ใน `finally` และหากต้องจับ `CancelledError` เพื่อ log ให้ `raise` ต่อเสมอ",
    },
    {
      title: "ใช้ `client.post(...)` แบบปกติแทน `client.stream('POST', ...)` เมื่ออ่าน SSE",
      symptom: "โค้ดรอโหลด body ทั้งหมดจนจบ `[DONE]` ก่อนค่อยเริ่มลูป ทำให้ไม่ได้ประโยชน์จาก streaming และ TTFT เท่ากับ total latency",
      fix: "ใช้ `async with client.stream('POST', ...)` ของ {{httpx}} (หรือ `stream=True` ของ Official SDK) เพื่อให้ได้ chunk แรกทันทีที่เซิร์ฟเวอร์เริ่มส่ง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d075-q1",
        "ทำไม SSE Streaming จึงทำให้ UX ของแอปแชต AI รู้สึกเร็วขึ้นมาก แม้ Total Latency จะใกล้เคียงกับแบบ Non-Streaming?",
        [
          ["เพราะ SSE ทำให้โมเดลข้ามขั้นตอน Self-Attention", "ไม่จริง — โมเดลยังคำนวณ Self-Attention และสร้างทีละ token เหมือนเดิม"],
          ["เพราะลด Time-to-First-Token (TTFT) ให้ผู้ใช้เห็นและเริ่มอ่านคำตอบได้ทันทีภายในไม่กี่ร้อยมิลลิวินาที แทนการจ้องหน้าจอนิ่งหลายวินาที", "ถูก — ผู้ใช้เริ่มอ่านได้ตั้งแต่ token แรกออก และสามารถกดยกเลิกได้ทันทีถ้าคำตอบหลงประเด็น"],
          ["เพราะ SSE บีบอัดจำนวน output tokens ลง 50%", "จำนวน output tokens เท่าเดิม (เว้นแต่ผู้ใช้กดยกเลิกกลางทาง)"],
          ["เพราะ SSE ไม่ต้องใช้การเชื่อมต่อ HTTP", "SSE ทำงานบน HTTP streaming response ปกติ"],
        ],
        "B",
        "Streaming เปลี่ยนประสบการณ์จากการรอจนจบ (Total Latency) เป็นการเห็นคำแรกอย่างรวดเร็ว (TTFT) ทำให้ perceived latency ลดลงอย่างมาก",
        "TTFT แตกต่างจาก Total Latency อย่างไร และทำไม Streaming จึงช่วย UX?",
        "TTFT คือเวลารอจนถึง token แรกที่มีเนื้อหา ส่วน Total Latency คือเวลาจนจบคำตอบทั้งหมด — Streaming ทำให้ผู้ใช้เริ่มอ่านได้ตั้งแต่ TTFT แทนการรอจอนิ่งจนจบ",
      ),
      mc(
        "d075-q2",
        "เมื่ออ่าน raw byte stream ของคำตอบภาษาไทยผ่านเครือข่าย เหตุใดการเรียก `chunk.decode('utf-8')` ทีละก้อนจึงเสี่ยงเกิด `UnicodeDecodeError`?",
        [
          ["เพราะ UTF-8 ไม่รองรับภาษาไทย", "UTF-8 รองรับภาษาไทยสมบูรณ์ แต่ใช้ 3 ไบต์ต่ออักษรไทย 1 ตัว"],
          ["เพราะตัวอักษรไทย 1 ตัวใช้ 3 ไบต์ใน UTF-8 และขอบเขตของ network chunk อาจตัดผ่ากลาง 3 ไบต์นั้น — จึงต้องใช้ `codecs.getincrementaldecoder('utf-8')`", "ถูก — incremental decoder จะพักไบต์เศษไว้รวมกับ chunk ถัดไปจนครบอักขระ"],
          ["เพราะ Python `asyncio` ส่งได้เฉพาะรหัส ASCII", "`asyncio` ส่ง `bytes` อะไรก็ได้ ปัญหาอยู่ที่การ decode ก้อนที่ถูกหั่นกลางอักขระ"],
          ["เพราะ SSE ห้ามส่งข้อมูลภาษาไทย", "SSE ส่งข้อความ UTF-8 ภาษาไทยได้ตามมาตรฐาน"],
        ],
        "B",
        "ตัวอักษรไทยใช้ 3 ไบต์ใน UTF-8 หาก chunk ตัดกลางอักขระ การ decode แยกก้อนจะพัง จึงต้องใช้ incremental UTF-8 decoder เสมอ",
        "ทำไมจึงควรใช้ `codecs.getincrementaldecoder('utf-8')` เวลาอ่าน byte stream ภาษาไทย?",
        "เพราะอักษรไทย 1 ตัวใช้ 3 ไบต์ใน UTF-8 หาก packet ตัดแบ่งกลางตัวอักษร incremental decoder จะพักไบต์ค้างไว้รวมกับ chunk ถัดไปโดยไม่พังหรือเกิด ``",
      ),
      mc(
        "d075-q3",
        "ใน SSE stream ของ LLM API ควรจับเวลา `TTFT` ณ จังหวะใดจึงจะสะท้อนประสบการณ์ผู้ใช้จริงที่สุด?",
        [
          ["ทันทีที่สร้าง `httpx.AsyncClient()` เสร็จ", "ตอนนั้นยังไม่ได้ส่งคำขอไปยังโมเดลเลย"],
          ["ทันทีที่ได้รับ HTTP header `200 OK` หรือ chunk แรกที่ `content` เป็นสตริงว่าง", "ผิดพลาดพบบ่อย — หน้าจอยังไม่มีตัวอักษรใด ๆ โผล่ให้ผู้ใช้เห็น"],
          ["ทันทีที่ได้รับ delta แรกที่มีข้อความจริง (`content != ''`)", "ถูก — ตรงกับวินาทีแรกที่ตัวอักษรคำตอบปรากฏบนหน้าจอผู้ใช้"],
          ["หลังจากได้รับ `data: [DONE]` แล้วหารด้วย 2", "นั่นไม่ใช่ TTFT เพราะ prefill กับ decode ใช้เวลาไม่เท่ากัน"],
        ],
        "C",
        "TTFT ต้องวัดจากเวลาที่ส่งคำขอจนถึงเวลาที่ได้รับ content delta แรกที่ไม่ว่าง เพื่อให้ตรงกับสิ่งที่ผู้ใช้มองเห็นจริง",
        "ควรจับเวลา `TTFT` ณ จังหวะใดของ SSE stream?",
        "วัดจากตอนเริ่มส่งคำขอจนถึงตอนได้รับ content delta แรกที่ไม่ใช่สตริงว่าง (ข้าม role-only หรือ keep-alive chunks)",
      ),
      mc(
        "d075-q4",
        "เมื่อต้องหยุดอ่าน async generator ของ SSE stream กลางทาง (เช่น ผู้ใช้กด Stop หรือครบ `max_chunks`) วิธีใดรับประกันว่าทรัพยากรของ stream จะถูกปิดอย่างสะอาด?",
        [
          ["ใช้ `async with contextlib.aclosing(stream):` และเมื่อจับ `asyncio.CancelledError` ให้ re-raise ต่อเสมอ", "ถูก — `aclosing` เรียก `await stream.aclose()` ทันทีเมื่อออกจากบล็อกไม่ว่าจะ `break` หรือถูก cancel"],
          ["ปล่อยให้ Python garbage collector ค่อยตามเก็บเองทีหลังโดยไม่ต้องปิด", "ทำให้ HTTP connection ค้างและ upstream ยังสร้าง token ต่อจนเสียเงิน"],
          ["ครอบด้วย `except BaseException: pass` เพื่อไม่ให้เกิด error", "การกลืน `CancelledError` ทำให้ระบบยกเลิก task ไม่ได้และเกิดงานค้าง"],
          ["เรียก `time.sleep(5)` ก่อนออกจากลูป", "`time.sleep` บล็อก Event Loop และไม่ได้ปิด async generator"],
        ],
        "A",
        "`contextlib.aclosing` รับประกันการเรียก `aclose()` บน async generator ทุกเส้นทางออก และต้องไม่กลืน `asyncio.CancelledError`",
        "วิธีปิด async SSE stream อย่างสะอาดเมื่อถูก `break` หรือ `task.cancel()` คืออะไร?",
        "ครอบด้วย `async with contextlib.aclosing(stream):` เพื่อให้ `await stream.aclose()` รันในทุกกรณี และ re-raise `asyncio.CancelledError` เสมอ",
      ),
    ],
  },

  takeaways: [
    "วัด `TTFT` (ที่ content delta แรกที่ไม่ว่าง) แยกจาก `Total Latency` ด้วย `time.perf_counter()` เพื่อสะท้อน UX จริง",
    "ใช้ `codecs.getincrementaldecoder('utf-8')` (หรือ `aiter_text()`) เสมอเมื่อรับ byte stream เพื่อกันตัวอักษรไทย 3 ไบต์แตกกลาง packet",
    "พาร์ส {{sse}} อย่างรัดกุม: ข้ามบรรทัดว่าง/`:` คอมเมนต์, อ่าน JSON หลัง `data:` และหยุดทันทีที่ `data: [DONE]`",
    "ครอบ async stream ด้วย `contextlib.aclosing(...)` และไม่กลืน `asyncio.CancelledError` เพื่อหยุดต้นทุนและป้องกัน connection leak",
  ],

  reviewCards: [
    rc(
      "d075-rc-1",
      "ความแตกต่างระหว่าง `TTFT` กับ `Total Latency` ใน LLM Streaming คืออะไร และต้องระวังจุดพลาดใดตอนวัด `TTFT`?",
      "`TTFT` คือเวลารอถึง token แรกที่มีเนื้อหาจริง ส่วน `Total Latency` คือเวลาจนจบคำตอบ — ระวังอย่าจับ `TTFT` ตอนได้แค่ role chunk ที่มี `content == ''`",
    ),
    rc(
      "d075-rc-2",
      "ทำไมการ decode raw bytes ทีละก้อนจึงพังกับภาษาไทย และแก้อย่างไร?",
      "อักษรไทย 1 ตัวใช้ 3 ไบต์ใน UTF-8 หาก chunk ตัดกลางอักขระจะเกิด `UnicodeDecodeError` — แก้ด้วย `codecs.getincrementaldecoder('utf-8')` และปิดท้ายด้วย `final=True`",
    ),
    rc(
      "d075-rc-3",
      "เมื่อผู้ใช้กดยกเลิก streaming กลางทาง ต้องจัดการ async generator และ `CancelledError` อย่างไร?",
      "ครอบ async generator ด้วย `async with contextlib.aclosing(stream):` เพื่อให้ `aclose()` คืนทรัพยากรทันที และ re-raise `asyncio.CancelledError` เสมอ",
    ),
  ],

  sources: [
    { label: "OpenAI API Docs — Streaming API Responses", href: "https://platform.openai.com/docs/guides/streaming-responses" },
    { label: "Python Docs — contextlib.aclosing", href: "https://docs.python.org/3/library/contextlib.html#contextlib.aclosing" },
    { label: "Python Docs — codecs.getincrementaldecoder", href: "https://docs.python.org/3/library/codecs.html#codecs.getincrementaldecoder" },
    { label: "HTTPX Docs — Streaming Responses", href: "https://www.python-httpx.org/async/#streaming-responses" },
  ],

  glossary: ["sse", "ttft", "asyncio", "httpx", "llm", "mocking", "pytest"],
});
