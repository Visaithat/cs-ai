import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D017 — Phase 1 / Block B05
 * asyncio Mental Model (Event Loop, Coroutines, await).
 */
export const d017: Lesson = defineLesson({
  day: 17,
  titleTh: "เข้าใจ asyncio อย่างทะลุปรุโปร่ง: Event Loop, Coroutine และ await",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · เปลี่ยนงาน I/O ที่ต้องยืนรอทีละคำขอให้สลับทำงานบน Event Loop อย่างไม่ค้าง",
  icon: "cpu",
  visual: {
    id: "asyncio-loop",
    title: "Sync vs asyncio Event Loop — ทำไม I/O ไม่ต้องยืนรอ",
    caption: "กดสลับโหมด Sync กับ Async เพื่อเห็นการทำงานสลับ coroutine ระหว่างรอ API ตอบกลับ",
    alt: "แผนภาพเปรียบเทียบการทำงานแบบซิงโครนัสกับ asyncio event loop",
  },
  requiresApiKey: false,
  tools: ["asyncio", "Python 3.12", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ดึงข้อมูลหลายแหล่งพร้อมกันโดยไม่ยืนรอทีละเส้น",
      body: "งานเตรียมข้อมูลให้ AI เช่น ดึงเอกสาร 20 หน้า ค้นข้อมูลลูกค้าจาก API และดึงประวัติคำสั่งซื้อ ล้วนใช้เวลาส่วนใหญ่ไปกับการรอเครือข่าย (Network I/O)",
      lessonNote: "วันนี้เราสร้าง mental model ของ {{asyncio}} เพื่อเข้าใจว่าทำไม thread เดียวจึงจัดการการรอ I/O หลายงานพร้อมกันได้",
    },
    {
      node: 2,
      heading: "รองรับการเรียก LLM และ Embedding ที่ใช้เวลานาน",
      body: "การเรียก {{llm}} หนึ่งครั้งอาจใช้เวลา 1–8 วินาที หากโค้ดรันแบบ sync ทีละคำขอ งานชุด 20 รายการจะใช้เวลาเกือบ 2 นาที ทั้งที่ CPU แทบไม่ได้คำนวณอะไรเลย",
      lessonNote: "Coroutine และ `await` คือกุญแจเปิดทางสู่การยิง batch พร้อมกันด้วย `gather` และ {{semaphore}} ใน Day 18",
    },
    {
      node: 4,
      heading: "รากฐานของ FastAPI Backend และ SSE Streaming",
      body: "เว็บเซิร์ฟเวอร์ AI สมัยใหม่อย่าง {{fastapi}} และระบบส่งคำตอบทีละคำแบบ {{sse}} ทำงานบน Event Loop เดียวกันเพื่อรับผู้ใช้พร้อมกันหลายร้อยคน",
      lessonNote: "การรู้จักว่าอะไร yield ได้และอะไร block loop จะช่วยกันไม่ให้ฟังก์ชันเดียวทำทั้ง API ค้าง",
    },
    {
      node: 5,
      heading: "วินิจฉัยปัญหา Latency พุ่งจาก Event Loop ถูกขวาง",
      body: "อาการ P95 latency พุ่งสูงใน production มักไม่ได้เกิดจากโมเดลช้า แต่เกิดจากโค้ด synchronous เผลอไปขวาง Event Loop จนคิว request อื่นติดแหง็ก",
      lessonNote: "วันนี้คุณจะได้เห็นความต่างของ `time.sleep` กับ `await asyncio.sleep` และวิธีโยกงาน blocking ออกด้วย `asyncio.to_thread`",
    },
  ],

  objectives: [
    "**อธิบาย** ความต่างระหว่างงาน I/O-bound กับ CPU-bound และวิธีที่ {{asyncio}} Event Loop สลับการทำงานของ coroutine บน thread เดียว",
    "**แยกแยะ** ความต่างระหว่างการสร้าง coroutine, การ `await` แบบเรียงลำดับ และการรันแบบ concurrent ด้วย `asyncio.create_task` / `asyncio.TaskGroup`",
    "**ตรวจจับและแก้ไข** จุดที่ทำให้ Event Loop ค้าง (blocking calls เช่น `time.sleep` หรือ sync I/O) ด้วย async API หรือ `await asyncio.to_thread(...)`",
  ],

  prerequisites: [
    "เขียนฟังก์ชัน Python พื้นฐานและเข้าใจการเรียก HTTP API จาก Block B04 (`httpx`, timeout)",
    "มี Python 3.11+ และ `uv` พร้อม `pytest` กับ `ruff` บนเครื่อง",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — จำลองความหน่วงด้วย `asyncio.sleep` บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "`asyncio` เป็นไลบรารีมาตรฐานที่มากับ Python อยู่แล้ว ไม่ต้องติดตั้งแพ็กเกจเพิ่ม แค่ตั้งโปรเจกต์ด้วย {{uv}} พร้อม `pytest` และ `ruff` สำหรับรันแบบฝึกหัด",
    commands: `uv init ai-day17-asyncio && cd ai-day17-asyncio
uv add --dev pytest ruff

# เช็กว่าใช้ Python 3.11+ (รองรับ asyncio.TaskGroup)
uv run python --version`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day17-asyncio` ด้วย `uv init`"],
      ["dev-tools", "เพิ่ม `pytest` และ `ruff` ด้วย `uv add --dev pytest ruff`"],
      ["version", "ตรวจว่า `uv run python --version` เป็น Python 3.11 ขึ้นไป"],
    ],
    note: "บทนี้จำลองการรอ API ด้วย `asyncio.sleep` เพื่อให้เห็นภาพ Event Loop ชัดเจนก่อนนำไปจับคู่กับ `httpx.AsyncClient` ใน Day 18",
  },

  concepts: [
    {
      id: "io-bound-vs-cpu-bound",
      title: "1 · ทำไมงาน AI ส่วนใหญ่เป็น I/O-bound และ Event Loop ช่วยอย่างไร",
      paragraphs: [
        "เวลาแอป AI เรียก {{llm}} API, ค้นข้อมูลใน Vector DB หรือยิง REST API ผ่าน {{httpx}} เวลาเกิน 90% คือ **การนั่งรอข้อมูลวิ่งข้ามเครือข่าย** (I/O-bound) ไม่ใช่เวลาที่ CPU เครื่องเรากำลังคิดเลขหนัก ๆ (CPU-bound)",
        "{{asyncio}} แก้ปัญหานี้ด้วย **Event Loop** บน thread เดียวแบบ *Cooperative Multitasking*: เมื่อ coroutine หนึ่งเจอจุด `await` ที่ต้องรอ I/O มันจะ \"คืนสิทธิ์\" ให้ Event Loop สลับไปปลุก coroutine อื่นขึ้นมาทำงานต่อทันที เมื่อข้อมูลเครือข่ายกลับมา Event Loop ค่อยสลับกลับมาทำบรรทัดถัดไป",
      ],
      analogy:
        "เหมือนเชฟคนเดียวในครัวที่ตั้งหม้อต้มน้ำซุปไว้แล้วหันไปหั่นผักและอุ่นเตาอบระหว่างรอน้ำเดือด — ไม่ต้องจ้างเชฟเพิ่มเป็น 3 คน (multi-thread) และไม่ยืนจ้องหม้อนิ่ง ๆ จนเสียเวลา (sync)",
      bullets: [
        "**Sync (ทีละงาน)**: งาน A รอ 0.3s → จบแล้วค่อยเริ่มงาน B รอ 0.3s → รวม **0.6s**",
        "**Async Event Loop (I/O-bound)**: เริ่มงาน A (รอ I/O) → สลับไปเริ่มงาน B (รอ I/O) → ผลกลับมาไล่เลี่ยกัน รวม **~0.3s**",
        "**ข้อจำกัดสำคัญ (CPU-bound)**: ถ้างานเป็นการคูณเมทริกซ์หรือประมวลผลภาพหนัก ๆ บน CPU `asyncio` ไม่ช่วยให้เร็วขึ้น เพราะมี thread เดียว — งาน CPU หนักต้องส่งออกไปยัง thread/process pool",
      ],
      whyTitle: "Why this matters — ทำไมไม่ใช้ Multi-threading กับทุกอย่าง",
      whyParagraphs: [
        "Thread ของ OS กินหน่วยความจำและมีต้นทุนสลับบริบทสูง รวมถึงเกิด race condition ได้ง่ายเมื่อแชร์ตัวแปรระหว่างหลาย thread ในขณะที่ coroutine เบากว่ามาก สามารถเปิดรอการเชื่อมต่อได้เป็นพัน ๆ เส้นพร้อมกัน",
        "ในระบบ AI ยุคใหม่ทั้ง `httpx.AsyncClient`, Official LLM SDKs, `MCP` และ {{fastapi}} ล้วนสร้างบน `asyncio` ทั้งหมด การเข้าใจ Event Loop จึงเป็นทักษะพื้นฐานที่เลี่ยงไม่ได้",
      ],
    },
    {
      id: "coroutines-and-await",
      title: "2 · Coroutine, `await` และกับดัก \"เขียน async แต่ยังรันทีละตัว\"",
      paragraphs: [
        "ฟังก์ชันที่ประกาศด้วย `async def` เรียกว่า **coroutine function** จุดสำคัญที่คนย้ายมาจาก JavaScript มักตกใจคือ: การเรียก `fetch_doc()` เฉย ๆ **ยังไม่รันโค้ดข้างใน** แต่มันจะคืนเพียง *coroutine object* ที่นอนนิ่งรอคนสั่งรัน",
        "นอกจากนี้ การเขียน `a = await fetch(1)` แล้วต่อด้วย `b = await fetch(2)` ถึงแม้จะอยู่ใน `async def` ก็ยัง **รันเรียงทีละตัวเหมือน sync** เพราะบรรทัดแรกสั่งให้รอจนจบก่อนถึงจะสร้างงานที่สอง หากต้องการให้วิ่งซ้อนกันต้องจัดตารางลง Event Loop ด้วย `asyncio.create_task(...)` หรือ `asyncio.TaskGroup()` ก่อนแล้วค่อยรอผล",
      ],
      analogy:
        "การเรียก `fetch_doc()` เฉย ๆ เหมือนแค่เขียนใบสั่งอาหารวางไว้บนเคาน์เตอร์ ยังไม่ได้ส่งเข้าครัว; `await fetch_doc()` ทีละใบคือสั่งทีละจานรอเสิร์ฟเสร็จค่อยสั่งจานถัดไป; ส่วน `create_task()` คือยื่นใบสั่งทั้ง 3 จานเข้าครัวพร้อมกัน!",
      code: {
        language: "python",
        filename: "coroutines_demo.py",
        code: `import asyncio
import time


async def fake_llm_call(name: str, delay: float) -> str:
    await asyncio.sleep(delay)  # จำลองเวลารอ API ตอบกลับ
    return f"{name}: ok"


async def main() -> None:
    t0 = time.perf_counter()

    # จัดตารางงานลง Event Loop พร้อมกันด้วย create_task
    task1 = asyncio.create_task(fake_llm_call("classify", 0.3))
    task2 = asyncio.create_task(fake_llm_call("summarize", 0.3))

    res1 = await task1
    res2 = await task2

    elapsed = time.perf_counter() - t0
    print(res1, "|", res2, f"| elapsed={elapsed:.2f}s")


asyncio.run(main())`,
        caption: "งานสองชิ้นที่แต่ละชิ้นรอ 0.3s ใช้เวลารวมเพียง ~0.30s เพราะ `create_task` สั่งให้ทั้งคู่เริ่มรอบน Event Loop พร้อมกัน",
      },
      whyTitle: "Why this matters — `asyncio.TaskGroup` ใน Python 3.11+",
      whyParagraphs: [
        "ถ้าคุณสร้างหลาย task เองด้วย `create_task` แล้วงานหนึ่งโยน exception อีกงานอาจค้างลอยอยู่ในพื้นหลังจนเกิด resource leak",
        "`async with asyncio.TaskGroup() as tg:` (Structured Concurrency) จัดการให้ครบ: รอจนทุก task จบ และถ้าตัวใดตัวหนึ่งพัง มันจะยกเลิก task ที่เหลือให้อัตโนมัติอย่างสะอาด",
      ],
    },
    {
      id: "blocking-the-event-loop",
      title: "3 · กฎเหล็กของ asyncio: ห้ามวางโค้ด Blocking ขวาง Event Loop",
      paragraphs: [
        "เพราะ Event Loop มีแค่ **thread เดียว** หากคุณเผลอใส่คำสั่ง synchronous ที่รอค้าง เช่น `time.sleep(2)`, `httpx.get(...)` (แบบ sync) หรืออ่านไฟล์ใหญ่แบบ sync ไว้ใน `async def` คำสั่งนั้นจะยึด thread ไว้คนเดียวโดยไม่คืนสิทธิ์ให้ loop — ส่งผลให้ **ทุก coroutine และผู้ใช้คนอื่นทั้งเซิร์ฟเวอร์ค้างตามทั้งหมด**",
        "วิธีแก้อย่างถูกหลักมี 2 ทาง: (1) เปลี่ยนไปใช้ไลบรารีแบบ async (`await asyncio.sleep`, `httpx.AsyncClient`) หรือ (2) ถ้าจำเป็นต้องเรียกไลบรารีเก่าที่เป็น sync/blocking จริง ๆ ให้ส่งไปรันใน worker thread ด้วย `await asyncio.to_thread(sync_func, arg)` เพื่อให้ Event Loop ยังหมุนต่อได้",
      ],
      analogy:
        "เหมือนลูกค้าคนหนึ่งยืนโทรศัพท์คุยธุระส่วนตัวขวางช่องจ่ายเงินเดียวของร้าน — แคชเชียร์รับคิวคนอื่นต่อไม่ได้เลย จนกว่าจะเชิญเขาไปยืนคุยข้าง ๆ (`to_thread`)",
      code: {
        language: "python",
        filename: "avoid_blocking.py",
        code: `import asyncio
import time


def legacy_sync_check(text: str) -> bool:
    """สมมติเป็นไลบรารีเก่าที่เป็น sync ล้วน แก้โค้ดต้นฉบับไม่ได้"""
    time.sleep(0.25)
    return "ด่วน" in text


async def good_async_handler(text: str) -> tuple[str, bool]:
    # โยกงาน sync ออกไปรันใน thread pool — Event Loop ไม่ค้าง!
    async with asyncio.TaskGroup() as tg:
        api_task = tg.create_task(asyncio.sleep(0.25, result="api-done"))
        legacy_task = tg.create_task(asyncio.to_thread(legacy_sync_check, text))
    return api_task.result(), legacy_task.result()


async def main() -> None:
    t0 = time.perf_counter()
    result = await good_async_handler("ลูกค้าแจ้งปัญหาด่วน")
    print(result, f"elapsed={time.perf_counter() - t0:.2f}s")


asyncio.run(main())`,
        caption: "แม้ `legacy_sync_check` จะใช้ `time.sleep(0.25)` แต่เมื่อหุ้มด้วย `asyncio.to_thread` งานทั้งสองยังวิ่งซ้อนกันจบใน ~0.25s แทนที่จะเป็น 0.50s",
      },
      whyTitle: "Why this matters — บั๊กอันดับหนึ่งของ FastAPI + AI Libraries",
      whyParagraphs: [
        "ใน Phase 4–5 คุณจะได้ใช้ไลบรารีอย่าง `PyThaiNLP`, PDF parser หรือโมเดล local ที่เป็นฟังก์ชัน synchronous — หากเรียกตรง ๆ ใน `async def` endpoint ของ {{fastapi}} แอปจะตอบช้าลงทันทีเมื่อมีผู้ใช้พร้อมกันแค่ 2–3 คน",
        "การแยกให้ออกตั้งแต่ Day 17 ว่าฟังก์ชันไหนเป็น `async` และฟังก์ชันไหนต้องครอบ `asyncio.to_thread` จะช่วยป้องกัน production incident ได้มหาศาล",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ asyncio กับ JavaScript/TypeScript Promise",
      body: [
        "ถ้าคุณเคยเขียน `async/await` ใน Node.js หรือ Browser คุณรู้จัก Event Loop อยู่แล้ว แต่มี **ความต่างสำคัญ 1 จุดที่ต้องจำให้แม่น**: ใน JS การเรียก `fetch()` จะ **เริ่มยิงทันที** (eager Promise) แต่ใน Python การเรียก `async def` จะ **ยังไม่เริ่มทำงาน** (lazy coroutine) จนกว่าคุณจะ `await` หรือส่งเข้า `create_task()`",
      ],
      table: [
        ["`async def fetch():`", "`async function fetch()`"],
        ["Coroutine object (ยังไม่รันจนกว่าจะ `await`/`create_task`)", "`Promise` (เริ่มรันทันทีที่เรียกฟังก์ชัน)"],
        ["`asyncio.run(main())`", "Node.js / Browser เปิด Event Loop ให้เองอัตโนมัติ"],
        ["`asyncio.create_task(coro)`", "เรียก `const p = fetch(...)` เก็บไว้ก่อนค่อย `await p`"],
        ["`await asyncio.sleep(1)`", "`await new Promise(r => setTimeout(r, 1000))`"],
        ["`await asyncio.to_thread(sync_fn)`", "โยกงานหนักไป Worker Thread ไม่ให้ block main thread"],
      ],
    },
    student: {
      title: "First-Year Note — Concurrency ไม่เท่ากับ Parallelism",
      body: [
        "**Concurrency (`asyncio`)** คือการที่คนทำงาน 1 คน (1 thread) สลับจัดการหลายงานในช่วงที่แต่ละงานกำลัง \"รอ\" (เช่น รอเน็ตเวิร์ก) จึงเหมาะกับงาน I/O มาก",
        "**Parallelism (multiprocessing)** คือการมีคนทำงาน 4 คน (4 CPU cores) คิดเลขพร้อมกันจริง ๆ ในเสี้ยววินาทีเดียวกัน ซึ่งเหมาะกับงานคำนวณหนัก ๆ",
        "ไม่ต้องตกใจกับคำว่า Event Loop: ให้จินตนาการว่าเป็น \"ตารางเวร\" ที่คอยเช็กว่างานไหนรอ I/O เสร็จแล้ว ก็เรียกงานนั้นกลับมาทำต่อทีละจังหวะ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ระบบผู้ช่วย AI ต้องดึงข้อมูลประกอบ 3 แหล่งก่อนสร้างคำตอบ (`profile`, `orders`, `kb_hits`) ซึ่งแต่ละแหล่งมีความหน่วงเครือข่าย 0.2s–0.3s ลองเทียบ 3 แบบตั้งแต่แบบช้า แบบ concurrent จนถึงการรับมือฟังก์ชัน blocking",
    steps: [
      {
        title: "1 · แบบ Sequential `await` — ถูกต้องแต่ช้าเท่า Sync",
        explain:
          "แม้จะเขียน `async def` และ `await` แต่เพราะรอทีละบรรทัด เวลารวมจึงเท่ากับผลบวกของทุกคำขอ (`0.2 + 0.3 + 0.2 = 0.70s`)",
        code: {
          language: "python",
          filename: "worked_d017_step1.py",
          code: `import asyncio
import time


async def fetch_source(name: str, delay: float) -> tuple[str, str]:
    await asyncio.sleep(delay)
    return name, f"{name}-ready"


async def sequential_pipeline() -> dict[str, str]:
    t0 = time.perf_counter()
    r1 = await fetch_source("profile", 0.20)
    r2 = await fetch_source("orders", 0.30)
    r3 = await fetch_source("kb_hits", 0.20)
    print(f"Sequential elapsed: {time.perf_counter() - t0:.2f}s")
    return dict([r1, r2, r3])


print(asyncio.run(sequential_pipeline()))`,
        },
        output: `Sequential elapsed: 0.70s
{'profile': 'profile-ready', 'orders': 'orders-ready', 'kb_hits': 'kb_hits-ready'}`,
      },
      {
        title: "2 · แบบ Concurrent ด้วย `asyncio.TaskGroup` — เร็วขึ้นกว่า 2 เท่า",
        explain:
          "สั่ง `tg.create_task(...)` ทั้ง 3 งานก่อนออกจากบล็อก `async with` ทำให้การรอ I/O ทั้ง 3 เส้นซ้อนทับกัน เวลารวมลดเหลือเท่างานที่ช้าที่สุด (`~0.30s`)",
        code: {
          language: "python",
          filename: "worked_d017_step2.py",
          code: `import asyncio
import time


async def fetch_source(name: str, delay: float) -> tuple[str, str]:
    await asyncio.sleep(delay)
    return name, f"{name}-ready"


async def concurrent_pipeline() -> dict[str, str]:
    t0 = time.perf_counter()
    async with asyncio.TaskGroup() as tg:
        tasks = [
            tg.create_task(fetch_source("profile", 0.20)),
            tg.create_task(fetch_source("orders", 0.30)),
            tg.create_task(fetch_source("kb_hits", 0.20)),
        ]
    print(f"Concurrent elapsed: {time.perf_counter() - t0:.2f}s")
    return dict(task.result() for task in tasks)


print(asyncio.run(concurrent_pipeline()))`,
        },
        output: `Concurrent elapsed: 0.30s
{'profile': 'profile-ready', 'orders': 'orders-ready', 'kb_hits': 'kb_hits-ready'}`,
      },
      {
        title: "3 · ป้องกัน Event Loop ค้างเมื่อต้องเรียกฟังก์ชัน Sync เก่า",
        explain:
          "หากมีฟังก์ชัน `sync_pii_scan` ที่ใช้ `time.sleep(0.25)` การเรียกตรง ๆ ใน `async def` จะทำให้เวลารวมพุ่งกลับไป `0.55s` แต่เมื่อครอบด้วย `asyncio.to_thread` มันจะวิ่งขนานไปกับ I/O จบใน `~0.30s`",
        code: {
          language: "python",
          filename: "worked_d017_step3.py",
          code: `import asyncio
import time


def sync_pii_scan(message: str) -> bool:
    time.sleep(0.25)  # จำลอง blocking call
    return "08" in message


async def fetch_source(name: str, delay: float) -> tuple[str, str]:
    await asyncio.sleep(delay)
    return name, f"{name}-ready"


async def safe_mixed_pipeline(message: str) -> dict[str, object]:
    t0 = time.perf_counter()
    async with asyncio.TaskGroup() as tg:
        orders_task = tg.create_task(fetch_source("orders", 0.30))
        pii_task = tg.create_task(asyncio.to_thread(sync_pii_scan, message))
    print(f"Mixed safe elapsed: {time.perf_counter() - t0:.2f}s")
    return {"orders": orders_task.result()[1], "has_phone": pii_task.result()}


print(asyncio.run(safe_mixed_pipeline("ติดต่อ 081-234-5678")))`,
        },
        output: `Mixed safe elapsed: 0.30s
{'orders': 'orders-ready', 'has_phone': True}`,
      },
    ],
    gotcha:
      "จุดสังเกตที่พบบ่อย: ถ้าลืมเขียน `await` หน้า coroutine เช่น `fetch_source('profile', 0.2)` Python จะไม่รันงานนั้นเลยและพ่นคำเตือน `RuntimeWarning: coroutine 'fetch_source' was never awaited` — ต่างจาก JavaScript ที่ Promise ยังคงยิงออกไปเงียบ ๆ",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `async_workflow.py` เพื่อเปรียบเทียบการรันงานจำลอง I/O แบบ sequential vs concurrent และหุ้มฟังก์ชัน synchronous ตัวสแกนคำสำคัญไม่ให้ block Event Loop",
    requirements: [
      "สร้าง `async def fetch_signal(name: str, delay: float, value: str) -> tuple[str, str]` ที่รอแบบ non-blocking ด้วย `await asyncio.sleep(delay)` แล้วคืน `(name, value)`",
      "สร้าง `async def run_sequential(specs: list[tuple[str, float, str]]) -> dict[str, str]` ที่เรียกและ `await fetch_signal(...)` ทีละรายการตามลำดับแล้วคืน `dict[str, str]`",
      "สร้าง `async def run_concurrent(specs: list[tuple[str, float, str]]) -> dict[str, str]` ที่จัดตารางทุก coroutine ให้รันพร้อมกันบน Event Loop ด้วย `asyncio.TaskGroup` (หรือ `asyncio.create_task`) โดยรักษาลำดับผลลัพธ์และใช้เวลารวมใกล้เคียง `max(delay)`",
      "สร้าง `async def run_with_legacy_scanner(specs: list[tuple[str, float, str]], text: str, sync_scanner: Callable[[str], list[str]]) -> dict[str, object]` ที่รัน `run_concurrent(specs)` และเรียก `sync_scanner(text)` ผ่าน `await asyncio.to_thread(...)` พร้อมกัน คืน `{\"signals\": ..., \"matches\": ...}`",
      "ห้ามใช้ `time.sleep` ในฟังก์ชัน `async def` โดยตรง และต้องไม่มี `RuntimeWarning: coroutine ... was never awaited` เมื่อรันเทสต์",
    ],
    starter: {
      language: "python",
      filename: "async_workflow.py",
      code: `import asyncio
from collections.abc import Callable


async def fetch_signal(name: str, delay: float, value: str) -> tuple[str, str]:
    # TODO: รอแบบ async ด้วย asyncio.sleep(delay) แล้วคืน (name, value)
    raise NotImplementedError


async def run_sequential(specs: list[tuple[str, float, str]]) -> dict[str, str]:
    # TODO: await fetch_signal ทีละรายการแล้วรวมเป็น dict[str, str]
    raise NotImplementedError


async def run_concurrent(specs: list[tuple[str, float, str]]) -> dict[str, str]:
    # TODO: จัดตารางทุกงานด้วย asyncio.TaskGroup / create_task ให้วิ่งซ้อนกัน
    raise NotImplementedError


async def run_with_legacy_scanner(
    specs: list[tuple[str, float, str]],
    text: str,
    sync_scanner: Callable[[str], list[str]],
) -> dict[str, object]:
    # TODO: รัน async signals ขนานกับ sync_scanner ผ่าน asyncio.to_thread
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_async_workflow.py",
      code: `import asyncio
import time
from async_workflow import (
    fetch_signal,
    run_concurrent,
    run_sequential,
    run_with_legacy_scanner,
)

SPECS = [
    ("profile", 0.15, "vip"),
    ("orders", 0.15, "3-recent"),
    ("intent", 0.15, "billing"),
]


def test_fetch_signal_returns_pair():
    result = asyncio.run(fetch_signal("intent", 0.01, "billing"))
    assert result == ("intent", "billing")


def test_concurrent_is_much_faster_than_sequential():
    t0 = time.perf_counter()
    seq_result = asyncio.run(run_sequential(SPECS))
    seq_time = time.perf_counter() - t0

    t1 = time.perf_counter()
    conc_result = asyncio.run(run_concurrent(SPECS))
    conc_time = time.perf_counter() - t1

    expected = {"profile": "vip", "orders": "3-recent", "intent": "billing"}
    assert seq_result == expected
    assert conc_result == expected
    assert seq_time >= 0.40
    assert conc_time < 0.30


def test_legacy_scanner_does_not_block_event_loop():
    def blocking_thai_scanner(text: str) -> list[str]:
        time.sleep(0.15)  # จำลองไลบรารี sync ที่ block
        keywords = ["ใบกำกับภาษี", "คืนเงิน", "ด่วน"]
        return [kw for kw in keywords if kw in text]

    t0 = time.perf_counter()
    output = asyncio.run(
        run_with_legacy_scanner(
            SPECS,
            "ลูกค้าแจ้งด่วน ขอใบกำกับภาษีใหม่ครับ",
            blocking_thai_scanner,
        )
    )
    elapsed = time.perf_counter() - t0

    assert output["signals"] == {"profile": "vip", "orders": "3-recent", "intent": "billing"}
    assert output["matches"] == ["ใบกำกับภาษี", "ด่วน"]
    # ถ้าไม่ใช้ to_thread จะใช้เวลา >= 0.30s; เมื่อใช้ to_thread จะวิ่งซ้อนกันจบ < 0.28s
    assert elapsed < 0.28


def test_empty_specs():
    assert asyncio.run(run_concurrent([])) == {}
`,
    },
    selfCheck: [
      "`run_sequential(SPECS)` ใช้เวลา >= 0.40s ขณะที่ `run_concurrent(SPECS)` ใช้เวลา < 0.30s และได้ dict ผลลัพธ์ตรงกัน",
      "`run_with_legacy_scanner` รัน `blocking_thai_scanner` (ที่มี `time.sleep(0.15)`) ขนานกับ `SPECS` เสร็จภายใน < 0.28s",
      "ไม่มี `RuntimeWarning` เรื่อง coroutine ที่ไม่ถูก await เมื่อรัน `uv run pytest -W error`",
      "รองรับกรณี `specs = []` โดยไม่โยน error",
      "ผ่านทั้ง `uv run pytest -q` และ `uv run ruff check .`",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -W error -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `run_concurrent` อย่าเขียน `await fetch_signal(...)` ในลูปตรง ๆ เพราะจะกลายเป็น sequential — ให้สร้าง task ทั้งหมดก่อนแล้วค่อยดึงผลลัพธ์หลังทุก task เริ่มทำงานแล้ว",
      },
      {
        body: "ใช้ `async with asyncio.TaskGroup() as tg:` แล้วสร้าง `tasks = [tg.create_task(fetch_signal(n, d, v)) for n, d, v in specs]` จากนั้นคืน `dict(t.result() for t in tasks)` หลังออกจากบล็อก `async with`",
      },
      {
        body: "โครงของ 3 ฟังก์ชันแรกพร้อมแล้ว เหลือเติมการสร้าง 2 tasks ใน `run_with_legacy_scanner` ให้รัน `run_concurrent(specs)` คู่กับ `asyncio.to_thread(sync_scanner, text)`",
        code: {
          language: "python",
          filename: "hint-d017-l3.py",
          code: `import asyncio
from collections.abc import Callable


async def fetch_signal(name: str, delay: float, value: str) -> tuple[str, str]:
    await asyncio.sleep(delay)
    return name, value


async def run_sequential(specs: list[tuple[str, float, str]]) -> dict[str, str]:
    results: dict[str, str] = {}
    for name, delay, value in specs:
        key, val = await fetch_signal(name, delay, value)
        results[key] = val
    return results


async def run_concurrent(specs: list[tuple[str, float, str]]) -> dict[str, str]:
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_signal(n, d, v)) for n, d, v in specs]
    return dict(task.result() for task in tasks)


async def run_with_legacy_scanner(
    specs: list[tuple[str, float, str]],
    text: str,
    sync_scanner: Callable[[str], list[str]],
) -> dict[str, object]:
    # TODO: เปิด TaskGroup สั่ง run_concurrent(specs) คู่กับ asyncio.to_thread(sync_scanner, text)
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# รัน pytest โดยเปิด -W error เพื่อจับ RuntimeWarning หากลืม await
uv run pytest -W error -q
uv run ruff check .`,
      caption: "แฟล็ก `-W error` จะเปลี่ยน warning `coroutine was never awaited` ให้กลายเป็น test failure ทันที",
    },
  },

  mistakes: [
    {
      title: "ลืมเขียน `await` หน้า coroutine",
      symptom: "ฟังก์ชันไม่ทำงานเลย ได้ออบเจกต์ `<coroutine object ...>` แทนผลลัพธ์จริง พร้อม `RuntimeWarning: coroutine '...' was never awaited`",
      fix: "ทุกครั้งที่เรียกฟังก์ชัน `async def` ต้อง `await` หรือส่งเข้า `asyncio.create_task` / `TaskGroup.create_task` เสมอ และเปิด `pytest -W error` ช่วยดักใน CI",
    },
    {
      title: "เขียน `await` ใน `for` loop แล้วคิดว่ามันวิ่งพร้อมกัน",
      symptom: "ย้ายโค้ดเป็น `async def` แล้วแต่เวลาทำงานยังช้าเท่าเดิม (ผลบวกของทุก request)",
      fix: "สร้าง task ทั้งหมดก่อนด้วย `asyncio.TaskGroup()` หรือ `asyncio.gather(...)` (Day 18) เพื่อให้ I/O ทุกเส้นเริ่มรอพร้อมกัน",
    },
    {
      title: "ใส่ `time.sleep()` หรือ `httpx.get()` ในฟังก์ชัน `async def`",
      symptom: "Event Loop หยุดชะงักทั้งระบบจนกว่าฟังก์ชันนั้นจะจบ ทำให้ request อื่นและ SSE stream ค้างตามทั้งหมด",
      fix: "เปลี่ยนไปใช้ `await asyncio.sleep(...)` หรือ `httpx.AsyncClient` — หากเป็นไลบรารี sync ที่เลี่ยงไม่ได้ให้ครอบด้วย `await asyncio.to_thread(...)`",
    },
    {
      title: "เรียก `asyncio.run(...)` ซ้อนภายในฟังก์ชันที่กำลังรันบน Event Loop อยู่แล้ว",
      symptom: "เกิด `RuntimeError: asyncio.run() cannot be called from a running event loop` (เจอบ่อยใน FastAPI หรือ Jupyter Notebook)",
      fix: "เรียก `asyncio.run(...)` เฉพาะจุดเริ่มต้น (entry point) ของสคริปต์เท่านั้น ภายในโค้ด async ให้ใช้ `await` ตรง ๆ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อตรวจ mental model ของ Event Loop, Coroutines และ Blocking Calls — กดเลือกคำตอบแล้วตรวจทันที",
    questions: [
      mc(
        "d017-q1",
        "เมื่อประกาศ `async def fetch_doc(): ...` แล้วเราเรียก `x = fetch_doc()` โดย **ไม่ใส่ `await`** จะเกิดอะไรขึ้นใน Python?",
        [
          ["โค้ดใน `fetch_doc` เริ่มรันทันทีในพื้นหลังเหมือน JavaScript Promise", "ต่างจาก JS! ใน Python การเรียก coroutine function ยังไม่รันโค้ดข้างในจนกว่าจะ await หรือ schedule"],
          ["ได้ coroutine object กลับมาโดยโค้ดข้างใน **ยังไม่เริ่มรัน** และหากไม่ await จะเกิด `RuntimeWarning`", "ถูก — Coroutine ใน Python เป็นแบบ lazy ต้อง await หรือส่งเข้า Task/Event Loop ก่อนถึงจะเริ่มทำงาน"],
          ["เกิด `SyntaxError` ทันทีตอนรัน", "ไม่ผิดไวยากรณ์ (Syntax ถูกต้อง) แต่จะได้ coroutine object แทนค่าผลลัพธ์จริง"],
          ["โปรแกรมจะบล็อกรอจนกว่า `fetch_doc` จะเสร็จโดยอัตโนมัติ", "Python ไม่ auto-await ให้ — ต้องเขียน `await` เองอย่างชัดเจน"],
        ],
        "B",
        "จุดต่างสำคัญจาก JS Promise: Coroutine ของ Python จะยังไม่เริ่มรันจนกว่าจะถูก `await` หรือจัดตารางด้วย `create_task` / `TaskGroup` / `asyncio.run`",
        "การเรียก `async def` ใน Python โดยไม่ใส่ `await` ต่างจาก Promise ใน JavaScript อย่างไร?",
        "JS Promise เริ่มรันทันที (eager) แต่ Python คืน coroutine object ที่ยังไม่รัน (lazy) จนกว่าจะ await หรือ schedule",
      ),
      mc(
        "d017-q2",
        "ถ้า `fetch(i)` ใช้เวลารอ I/O 0.5 วินาที โค้ด `results = [await fetch(i) for i in range(4)]` จะใช้เวลารวมประมาณเท่าไร?",
        [
          ["ประมาณ 0.5 วินาที เพราะอยู่ใน list comprehension", "ไม่เกี่ยว — `await` ใน comprehension ยังรอทีละรอบเหมือน `for` loop ปกติ"],
          ["ประมาณ 2.0 วินาที เพราะแต่ละรอบต้องรอ `await fetch(i)` เสร็จก่อนจึงเริ่มรอบถัดไป", "ถูก — นี่คือ sequential async; ต้องจัดตารางด้วย `TaskGroup` หรือ `gather` ก่อนถึงจะซ้อนเวลา I/O ได้"],
          ["ประมาณ 0.0 วินาที เพราะไม่รอผล", "`await` จะหยุดรอผลทุกครั้งก่อนไปต่อ"],
          ["จะ error เพราะใช้ `await` ใน comprehension ไม่ได้", "Python รองรับ async comprehension ได้ แต่ไม่ได้ทำให้มันรันพร้อมกัน"],
        ],
        "B",
        "การใส่ `await` ข้างในลูปหรือ comprehension ทีละตัวคือการรันเรียงลำดับ หากต้องการ concurrency ต้องสร้าง tasks ลง Event Loop พร้อมกันก่อน",
        "ทำไม `[await fetch(i) for i in range(4)]` จึงยังไม่รันแบบ concurrent?",
        "เพราะ `await` หยุดรอให้แต่ละรอบเสร็จก่อนจะสร้าง coroutine ของรอบถัดไป เวลารวมจึงเป็นผลบวก (`N × delay`)",
      ),
      mc(
        "d017-q3",
        "ใน {{fastapi}} endpoint ที่ประกาศเป็น `async def chat():` หากมีนักพัฒนาเผลอเขียน `time.sleep(3)` ลงไป จะเกิดผลกระทบอย่างไรเมื่อมีผู้ใช้ 10 คนยิงเข้ามาพร้อมกัน?",
        [
          ["ไม่มีผลกระทบ เพราะ `async def` จะเปลี่ยน `time.sleep` เป็น non-blocking ให้อัตโนมัติ", "Python ไม่แปลง blocking call ให้เอง — `time.sleep` จะหยุดทั้ง OS thread"],
          ["ทั้ง Event Loop จะค้างระหว่างที่ `time.sleep(3)` ทำงาน ทำให้ผู้ใช้คนอื่นต้องรอคิวต่อกันรวมเกือบ 30 วินาที", "ถูก — Event Loop มี thread เดียว การเรียก blocking call จะขวางทุก coroutine อื่นทั้งหมด"],
          ["FastAPI จะสร้าง 10 CPU process ใหม่ให้อัตโนมัติ", "FastAPI ไม่ spawn process ใหม่ต่อ request"],
          ["จะเกิด `SyntaxError` ตอนสตาร์ตเซิร์ฟเวอร์", "โค้ดรันผ่านไม่แจ้ง error แต่ประสิทธิภาพจะพังเงียบ ๆ เมื่อมี traffic พร้อมกัน"],
        ],
        "B",
        "ห้ามวาง blocking I/O หรือ `time.sleep` ใน `async def` โดยตรง เพราะจะหยุด Event Loop ทั้งหมด — ใช้ `await asyncio.sleep` หรือ `httpx.AsyncClient` แทน",
        "จะเกิดอะไรขึ้นถ้าเรียก `time.sleep(3)` ใน `async def` ของ FastAPI?",
        "Event Loop ทั้ง thread จะถูก block นาน 3 วินาที ทำให้ทุก request และ stream อื่นที่แชร์ loop เดียวกันค้างทั้งหมด",
      ),
      mc(
        "d017-q4",
        "คุณจำเป็นต้องเรียกไลบรารีแปลง PDF เก่าที่เป็นฟังก์ชัน synchronous (`parse_pdf(path)`) จากภายใน `async def ingest():` แนวทางมาตรฐานใน Python 3.12 คือข้อใด?",
        [
          ["เติมคำว่า `await parse_pdf(path)` หน้าฟังก์ชันได้เลย", "ทำไม่ได้ — จะเกิด `TypeError: object ... can't be used in 'await' expression`"],
          ["เรียก `await asyncio.to_thread(parse_pdf, path)` เพื่อโยกงาน blocking ไปรันใน worker thread", "ถูก — `asyncio.to_thread` คืนสิทธิ์ให้ Event Loop ทำงานอื่นต่อได้ระหว่างรอฟังก์ชัน sync จบ"],
          ["ครอบด้วย `asyncio.run(parse_pdf(path))`", "ผิดสองชั้น: `parse_pdf` ไม่ใช่ coroutine และห้ามเรียก `asyncio.run` ซ้อนใน Event Loop"],
          ["ใส่ `time.sleep(0)` ก่อนเรียกเพื่อให้ loop พัก", "`time.sleep(0)` ไม่ได้คืนสิทธิ์ให้ Event Loop และไม่แก้การ block ของ `parse_pdf`"],
        ],
        "B",
        "`await asyncio.to_thread(fn, *args, **kwargs)` เป็นวิธีที่สะอาดและปลอดภัยที่สุดในการเรียกโค้ด sync/blocking จากภายในโลก `asyncio`",
        "จะเรียกฟังก์ชัน synchronous ที่ blocking จากภายใน `async def` โดยไม่ให้ Event Loop ค้างได้อย่างไร?",
        "ใช้ `await asyncio.to_thread(sync_fn, *args)` เพื่อโยกไปรันใน worker thread",
      ),
    ],
  },

  takeaways: [
    "`asyncio` ออกแบบมาเพื่องาน **I/O-bound** (เรียก LLM, HTTP API, DB) โดยใช้ Event Loop thread เดียวสลับทำงานระหว่างช่วงรอ I/O",
    "การเรียก `async def` คืนเพียง coroutine object (lazy) — และการ `await` ทีละบรรทัดยังรันเรียงลำดับ ต้องจัดตารางด้วย `TaskGroup` / `create_task` เพื่อให้วิ่งซ้อนกัน",
    "ห้ามวาง blocking calls (`time.sleep`, sync `httpx.get`) ไว้ใน `async def` ตรง ๆ เพราะจะแช่แข็งทั้ง Event Loop",
    "เมื่อต้องเรียกไลบรารี synchronous เก่า ให้หุ้มด้วย `await asyncio.to_thread(...)` และพร้อมต่อยอดสู่ `asyncio.gather` + `Semaphore` ใน Day 18",
  ],

  reviewCards: [
    rc(
      "d017-rc-1",
      "ทำไม `asyncio` จึงเร่งความเร็วงานเรียก LLM API ได้หลายเท่า ทั้งที่ทำงานบน thread เดียว?",
      "เพราะงานเรียก API เป็น I/O-bound (เสียเวลารอเครือข่ายเป็นหลัก) Event Loop จึงสลับไปเริ่มและรับผล coroutine อื่นระหว่างรอ I/O แทนที่จะยืนรอทีละคำขอ",
    ),
    rc(
      "d017-rc-2",
      "ต่างกันอย่างไรระหว่าง `await f1(); await f2()` กับการใช้ `asyncio.TaskGroup` สร้าง 2 tasks?",
      "`await f1(); await f2()` รันเรียงทีละตัว (เวลา = ผลบวก) ส่วน `TaskGroup` จัดตารางทั้งสองลง Event Loop พร้อมกัน (เวลา ≈ ตัวที่ช้าที่สุด)",
    ),
    rc(
      "d017-rc-3",
      "ทำอย่างไรเมื่อจำเป็นต้องเรียกฟังก์ชัน sync ที่ blocking ภายใน `async def` โดยไม่ให้ Event Loop ค้าง?",
      "เรียกผ่าน `await asyncio.to_thread(sync_func, *args)` เพื่อส่งไปรันใน thread pool แยกจาก Event Loop",
    ),
  ],

  sources: [
    { label: "Python 3 Official Docs — asyncio: Asynchronous I/O", href: "https://docs.python.org/3/library/asyncio.html" },
    { label: "Python 3 Official Docs — Coroutines, Tasks & TaskGroup", href: "https://docs.python.org/3/library/asyncio-task.html" },
    { label: "Python 3 Official Docs — Developing with asyncio (Blocking Code)", href: "https://docs.python.org/3/library/asyncio-dev.html" },
    { label: "HTTPX Documentation — Async Support", href: "https://www.python-httpx.org/async/" },
  ],

  glossary: [
    "asyncio",
    "httpx",
    "semaphore",
    "sse",
    "fastapi",
    "llm",
    "pytest",
  ],
});
