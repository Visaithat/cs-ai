import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D020 — Phase 1 / Block B05 (Review Day)
 * Interleaved recall of D17–D19 + D14; Speed up 20-call batch pipeline 5x safely.
 */
export const d020: Lesson = defineLesson({
  day: 20,
  titleTh: "ทบทวน B05: เร่งความเร็ว Batch 20 คำขอให้ไวขึ้น 5 เท่าอย่างปลอดภัย",
  tagline:
    "30 นาที · รอบทบทวน D17–D19 + D14 · อัปเกรดท่อ batch 20 คำขอจากช้าทีละตัวเป็น Semaphore(5) ที่เร็วขึ้น 4–5 เท่าและรอดจาก 429",
  icon: "cpu",
  visual: {
    id: "semaphore-stream",
    title: "ทบทวน B05: เร่งความเร็ว Batch 20 คำขอให้ไวขึ้น 5 เท่าอย่างปลอดภัย",
    caption:
      "เทียบเวลารวมของการรันทีละตัว vs Semaphore(5) ที่รอดจาก 429 และเก็บผลครบทั้ง 20 รายการ",
    alt: "แผนภาพเปรียบเทียบความเร็ว batch pipeline ด้วย asyncio และ Semaphore",
  },
  requiresApiKey: false,
  tools: ["asyncio", "httpx", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "เปลี่ยนท่อดึงข้อมูล Batch ที่ช้าให้รองรับปริมาณงานจริง",
      body: "ในโปรเจกต์ AI จริง เราต้องดึงเอกสาร ยิง {{llm}} สรุปข้อความ หรือสร้างชุดข้อมูลประเมินครั้งละหลายสิบถึงหลายร้อยรายการ หากยังรันทีละคำขอจะเสียเวลานานเกินรับไหว",
      lessonNote:
        "วันนี้เรานำความรู้ D17–D19 และ D14 มารวมร่างเป็น batch pipeline 20 คำขอที่เร็วขึ้น ~5 เท่าโดยไม่ชนเพดาน {{rate-limit}}",
    },
    {
      node: 2,
      heading: "รับมือความไม่เสถียรของ Model API ควบคู่กับความเร็ว",
      body: "API ของโมเดลไม่ได้ตอบ `200 OK` ทุกครั้ง — บางคำขอเจอ `429` หรือ `503` ชั่วคราว (ต้อง retry) ขณะที่บางคำขอเจอ `400` ถาวร (ห้าม retry ซ้ำให้เสียเงินและเวลา)",
      lessonNote:
        "การผสม `Semaphore(5)` + async {{exponential-backoff}} + `gather(..., return_exceptions=True)` ทำให้ทั้งเร็ว ทนทาน และแยก error รายชิ้นได้ครบ",
    },
    {
      node: 3,
      heading: "พิสูจน์ Speedup และความปลอดภัยด้วยเกณฑ์ทดสอบเชิงกำหนด",
      body: "คำว่า \"เร็วขึ้นและปลอดภัย\" ในงานวิศวกรรมต้องวัดเป็นตัวเลขได้จริง ไม่ใช่แค่เดาด้วยสายตา",
      lessonNote:
        "ชุดเทสต์ {{pytest}} วันนี้จะตรวจทั้งอัตราเร่งความเร็ว (`>= 4x`), เพดาน `peak_in_flight <= 5`, การ retry เฉพาะสถานะชั่วคราว และการแยก error ถาวร",
    },
    {
      node: 5,
      heading: "เก็บรายงานประสิทธิภาพและรายการพังเข้า Monitoring",
      body: "การบันทึกจำนวน retry, เวลาที่ใช้จริง (`elapsed_sec`) และรายการที่ล้มเหลว ช่วยให้ทีมตั้งค่า `max_concurrency` ได้เหมาะกับโควต้าของ production",
      lessonNote:
        "รูปแบบ `BatchReport` ที่ออกแบบวันนี้จะถูกนำไปต่อยอดโดยตรงใน CLI เครื่องมือจริงของ Block B06 และ Mini-Project สิ้นสุด Phase 1 (Day 29–32)",
    },
  ],

  objectives: [
    "**ดึงความรู้เดิมแบบผสม (Interleaved Recall)** จาก D17 (`asyncio` Event Loop), D18 (`Semaphore` + `gather`), D19 (`SSE` + cancellation) และ D14 ({{exponential-backoff}})",
    "**แปลงท่อ batch 20 คำขอ** จากแบบ sequential ช้าทีละตัวเป็นแบบ concurrent ที่คุมเพดานด้วย `asyncio.Semaphore(5)` และแชร์ `httpx.AsyncClient` ใบเดียว",
    "**ผสาน Retry เฉพาะความผิดพลาดชั่วคราว (`429`/`503`) กับ Fault Isolation** แล้วพิสูจน์ใน {{pytest}} ว่าเร็วขึ้นอย่างน้อย 4–5 เท่าโดยไม่ทะลุเพดาน concurrency",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D17 (Event Loop), D18 (`gather` + `Semaphore`), D19 (Async Generators & SSE) และ D14 (Exponential Backoff)",
    "มี Python 3.11+ และ `uv` พร้อม `httpx`, `pytest`, `ruff` บนเครื่อง",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — จำลองเซิร์ฟเวอร์ด้วย `httpx.MockTransport` 100%",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์งานทบทวน Day 20 ด้วย {{uv}} และติดตั้ง {{httpx}} พร้อม `pytest` และ `ruff` เพื่อรันแล็บเร่งความเร็ว batch pipeline 20 คำขอ",
    commands: `uv init ai-day20-review && cd ai-day20-review
uv add httpx
uv add --dev pytest ruff

# ยืนยันสภาพแวดล้อมพร้อมทำงาน
uv run python -c "import asyncio, httpx; print('Ready:', httpx.__version__)"`,
    steps: [
      ["init", "สร้างหรือเข้าโฟลเดอร์โปรเจกต์ทบทวน `ai-day20-review`"],
      ["deps", "ติดตั้ง `httpx` และ dev tools (`pytest`, `ruff`)"],
      ["verify", "รันคำสั่งเช็ก `asyncio` และ `httpx` สำเร็จ"],
    ],
    note: "รอบทบทวน Day 20 ใช้เวลา 30 นาที: ทำควิซ Interleaved Recall ก่อน 10 นาที จากนั้นลงมืออัปเกรด `batch_pipeline.py` ให้เร็วขึ้น 5x ใน 15 นาที และจดจุดที่พลาดเข้า Error Log 5 นาที",
  },

  concepts: [
    {
      id: "review-b05-synthesis",
      title: "1 · ร้อยต่อจิ๊กซอว์ B05 (+ D14): สูตรลับ Async Pipeline ระดับ Production",
      paragraphs: [
        "ตลอด Block B05 เราสะสมชิ้นส่วนสำคัญ 3 ชิ้น และวันนี้เรานำมาประกอบร่วมกับความรู้ {{exponential-backoff}} จาก Day 14 เพื่อสร้างท่อ batch ที่พร้อมใช้งานจริงในงาน AI",
        "หัวใจของวันทบทวนไม่ใช่การจำ syntax แยกส่วน แต่คือการมองเห็นว่า **แต่ละชิ้นปิดจุดอ่อนของอีกชิ้นอย่างไร**: Event Loop ทำให้รอพร้อมกันได้, `Semaphore(5)` กันไม่ให้ยิงเกินเพดาน, async retry กันความสะดุดชั่วคราว, และ `gather(..., return_exceptions=True)` กันไม่ให้ของเสีย 1 ชิ้นล้มทั้ง batch",
      ],
      analogy:
        "เหมือนขบวนรถขนส่ง 20 เที่ยวบนถนน 5 เลน (`Semaphore(5)`) — ปล่อยรถวิ่งพร้อมกันทีละ 5 คันไม่ให้ติดคอขวด (429), ถ้าคันไหนเจอด่านตรวจชั่วคราวก็จอดรอข้างทางแล้วค่อยออกใหม่ (async backoff), และถ้าคันหนึ่งยางแตกถาวร คันอื่นอีก 19 คันก็ยังส่งของถึงปลายทางครบ",
      bullets: [
        "**D17 (Event Loop & Non-blocking)**: ใช้ `await asyncio.sleep(...)` เสมอ — ห้ามใส่ `time.sleep` ตอนรอ backoff เด็ดขาด",
        "**D18 (Shared `AsyncClient` + `Semaphore(5)` + `gather`)**: แชร์ connection pool ใบเดียว, คุม peak concurrency, และแยก error รายชิ้น",
        "**D19 (Streaming & Cancellation)**: ไม่กลืน `CancelledError` และปิดทรัพยากรด้วย `async with` / `aclosing`",
        "**D14 (Exponential Backoff)**: Retry เฉพาะ transient error (`429`, `503`) ไม่ retry `400`/`404` ที่ผิดถาวร",
      ],
      whyTitle: "Why this matters — ทักษะที่ออกข้อสอบสัมภาษณ์ AI Engineer บ่อยที่สุด",
      whyParagraphs: [
        "โจทย์ยอดนิยมในการสัมภาษณ์และงานจริงสัปดาห์แรกคือ: \"สคริปต์เรียก LLM 20–500 รายการนี้ช้ามาก ช่วยทำให้เร็วขึ้นโดยไม่โดน rate limit และไม่พังทั้งชุด\"",
        "เมื่อคุณเข้าใจความสัมพันธ์ของ 4 ชิ้นส่วนนี้ คุณจะตอบและเขียนโค้ดได้อย่างมั่นใจตั้งแต่โครงสร้าง จนถึงการเขียน {{pytest}} พิสูจน์ speedup",
      ],
    },
    {
      id: "math-of-bounded-speedup",
      title: "2 · คำนวณความเร็วที่คาดหวัง: ทำไม `Semaphore(5)` กับ 20 คำขอจึงเร็วขึ้น ~5 เท่า",
      paragraphs: [
        "สมมติแต่ละคำขอใช้เวลารอเครือข่าย `0.10s` และมีทั้งหมด `20` คำขอ หากยิงแบบเรียงลำดับทีละตัว เวลารวมคือ `20 × 0.10s = 2.00s`",
        "เมื่อเปลี่ยนมาใช้ `asyncio.Semaphore(5)` งาน 20 ชิ้นจะถูกจัดวิ่งเป็น **4 ระลอก ระลอกละ 5 คำขอพร้อมกัน** (`20 ÷ 5 = 4`) เวลารวมจึงลดเหลือประมาณ `4 × 0.10s = 0.40s` หรือ **เร็วขึ้นเกือบ 5 เท่าตัว** โดยที่จำนวนคำขอค้างพร้อมกันไม่เคยเกิน 5 แม้แต่วินาทีเดียว",
      ],
      analogy:
        "เหมือนมีลูกค้า 20 คนที่แต่ละคนใช้เวลาจ่ายเงิน 1 นาที — เปิด 1 ช่องใช้ 20 นาที แต่เปิด 5 ช่อง (`Semaphore(5)`) ใช้แค่ 4 นาที โดยที่พื้นที่หน้าเคาน์เตอร์ยังเป็นระเบียบไม่แออัด",
      code: {
        language: "python",
        filename: "speedup_math.py",
        code: `# คณิตศาสตร์ง่าย ๆ สำหรับประเมิน Latency ของ Bounded Batch:
#   sequential_time ≈ N * avg_latency
#   bounded_time    ≈ ceil(N / max_concurrency) * avg_latency
#
# ตัวอย่าง N = 20, avg_latency = 0.10s, max_concurrency = 5:
#   sequential_time ≈ 20 * 0.10s = 2.00s
#   bounded_time    ≈ (20 / 5) * 0.10s = 0.40s  --> Speedup ≈ 5.0x!`,
        caption:
          "ในทางปฏิบัติค่า speedup จริงจะอยู่ราว 4.3x–4.9x จาก overhead เล็กน้อยของ Event Loop และ retry ของรายการที่สะดุด",
      },
      whyTitle: "Why this matters — ทำไมเพิ่ม Concurrency เป็น 20 ไม่ได้ดีเสมอไป",
      whyParagraphs: [
        "ถ้าเซิร์ฟเวอร์ปลายทางรับได้แค่ 5 คำขอพร้อมกัน การเพิ่ม `Semaphore` เป็น 20 จะทำให้คำขอที่ 6–20 โดนดีดกลับเป็น `429` แล้วต้องวนรอ backoff ใหม่ ส่งผลให้เวลารวม **ช้ากว่า** และเปลืองโควต้ามากกว่า `Semaphore(5)`",
        "วิศวกร AI ที่ดีจึงตั้ง `max_concurrency` ให้พอดีกับเพดานของปลายทาง แล้ววัดจริงด้วย benchmark test เสมอ",
      ],
    },
    {
      id: "safe-retry-and-isolation",
      title: "3 · ปล่อย Semaphore ระหว่างรอ Backoff และไม่ Retry ความผิดพลาดถาวร",
      paragraphs: [
        "รายละเอียดระดับมืออาชีพเวลาผสาน `Semaphore` กับ {{exponential-backoff}} คือ **อย่าถือสิทธิ์ `async with sem:` ค้างไว้ระหว่าง `await asyncio.sleep(delay)`**! หากคำขอ A เจอ `503` แล้วต้องพักรอ 0.2s ควรออกจาก `async with sem:` ก่อนค่อย `await asyncio.sleep(...)` เพื่อให้คำขอ B ที่รอคิวอยู่ใช้ช่องนั้นยิงงานต่อไปได้ทันที",
        "นอกจากนี้ต้องแยกประเภทความผิดพลาดให้ขาด: สถานะชั่วคราวอย่าง `429` หรือ `503` ให้ลองใหม่ได้ตาม `max_retries` ส่วนสถานะถาวรอย่าง `400 Bad Request` หรือ `404 Not Found` ให้ล้มเหลวทันที (ไม่เสียเวลารอ retry) แล้วแยกเก็บเข้า `failed` ผ่าน `gather(..., return_exceptions=True)`",
      ],
      analogy:
        "เหมือนลูกค้าที่บัตรเครดิตขัดข้องชั่วคราวต้องโทรหาธนาคาร 1 นาที — ควรถอยออกจากหน้าเคาน์เตอร์ (`exit async with sem`) ไปยืนรอข้าง ๆ ให้ลูกค้าคนถัดไปจ่ายเงินก่อน แล้วค่อยกลับมาต่อคิวใหม่เมื่อพร้อม",
      code: {
        language: "python",
        filename: "retry_release_slot.py",
        code: `import asyncio
import httpx

RETRYABLE_STATUSES = {429, 503}


async def fetch_with_retry(
    client: httpx.AsyncClient,
    url: str,
    sem: asyncio.Semaphore,
    *,
    max_retries: int = 2,
    base_delay: float = 0.02,
) -> dict[str, object]:
    for attempt in range(max_retries + 1):
        # ถือสิทธิ์ Semaphore เฉพาะช่วงที่ยิง HTTP request จริงเท่านั้น
        async with sem:
            resp = await client.get(url)

        if resp.status_code in RETRYABLE_STATUSES and attempt < max_retries:
            # ปล่อยสิทธิ์ Semaphore แล้วค่อยรอ backoff แบบ non-blocking!
            await asyncio.sleep(base_delay * (2**attempt))
            continue

        resp.raise_for_status()
        return resp.json()

    raise RuntimeError("unreachable")`,
        caption:
          "โครงสร้างนี้ทั้งคุม `peak_in_flight <= n`, ไม่กั๊กช่องตอนรอ backoff และไม่ block Event Loop",
      },
      whyTitle: "Why this matters — หลีกเลี่ยง Head-of-Line Blocking ใน Batch",
      whyParagraphs: [
        "หากมีคำขอ 5 ชิ้นที่โดน `429` พร้อมกันแล้วทั้งหมดถือ `Semaphore(5)` ค้างไว้ระหว่างรอ backoff 2 วินาที ท่อ batch ทั้งระบบจะหยุดนิ่งสนิททั้งที่ยังมีรายการอื่นพร้อมทำงาน",
        "การถือ `sem` เฉพาะตอนส่งคำขอจริงและปล่อยทันทีเมื่อต้อง `await asyncio.sleep` ช่วยให้ throughput นิ่งและลด tail latency ได้มาก",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Safe 5x Batch Pipeline กับฝั่ง Node.js/TS",
      body: [
        "รูปแบบที่ประกอบขึ้นวันนี้เหมือนกับการรวม `p-limit(5)`, `Promise.allSettled` และ `p-retry` ใน Node.js โดยทั้งหมดใน Python ใช้แค่ standard library `asyncio` คู่กับ `httpx`:",
      ],
      table: [
        ["`sem = asyncio.Semaphore(5)` ครอบเฉพาะ `client.get`", "`limit(() => fetch(url))` แยกออกจาก `sleep(backoff)`"],
        ["`await asyncio.sleep(base * 2**attempt)`", "`await new Promise(r => setTimeout(r, base * 2**attempt))`"],
        ["`asyncio.gather(..., return_exceptions=True)`", "`Promise.allSettled(tasks)`"],
        ["`httpx.MockTransport` ใน `pytest`", "`msw` / `nock` / `undici.MockAgent` ใน Vitest/Jest"],
      ],
    },
    student: {
      title: "First-Year Note — เช็กความแตกต่างระหว่าง Bug ค้าง vs Bug ช้า",
      body: [
        "เวลาวัดความเร็ว batch แล้วไม่ได้ 4–5 เท่าตามที่คำนวณไว้ ให้เช็ก 3 จุดนี้เรียงตามลำดับ: (1) เผลอเขียน `await` ใน `for` loop แทน `gather` หรือเปล่า? (2) เผลอใส่ `time.sleep` แทน `await asyncio.sleep` ตรงไหนไหม? (3) เผลอถือ `async with sem:` ค้างไว้ตอนรอ retry หรือไม่?",
        "ทั้ง 3 จุดนี้จะไม่ทำให้โค้ดโยน error เลย — มันจะรัน \"ผ่าน\" แต่ช้าผิดปกติ นั่นคือเหตุผลที่เราต้องเขียน assertion เช็ก `elapsed` และ `speedup` ไว้ใน `pytest` ด้วยเสมอ",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองไล่ดูการเปรียบเทียบท่อ batch 20 คำขอจริงบน `httpx.MockTransport` ที่ตั้งเงื่อนไขเหมือน production: เพดาน concurrency = 5 (เกินคืน `429`), รายการ `item-07` เจอ `503` ชั่วคราว 1 ครั้งแล้วผ่านในรอบ retry, และรายการ `item-13` คืน `400` ถาวร",
    steps: [
      {
        title: "1 · วัดความเร็ว Baseline แบบ Sequential (20 คำขอทีละตัว)",
        explain:
          "รันทีละรายการด้วย `for` + `await` แม้จะรอดจาก `429` แน่นอน แต่ใช้เวลาราว `1.0s` (ที่ `0.05s/คำขอ`) ซึ่งช้าเกินไปเมื่อขยายเป็น 200 หรือ 2,000 รายการ",
        code: {
          language: "python",
          filename: "worked_d020_step1.py",
          code: `import asyncio
import time
import httpx


def make_production_like_transport(delay: float = 0.05, max_allowed: int = 5):
    stats = {"in_flight": 0, "peak": 0, "status_429": 0, "calls": 0}
    flaky_seen: set[str] = set()

    async def handler(request: httpx.Request) -> httpx.Response:
        stats["calls"] += 1
        stats["in_flight"] += 1
        stats["peak"] = max(stats["peak"], stats["in_flight"])
        try:
            if stats["in_flight"] > max_allowed:
                stats["status_429"] += 1
                return httpx.Response(429, json={"error": "concurrency cap exceeded"})
            await asyncio.sleep(delay)
            item_id = request.url.path.rsplit("/", 1)[-1]
            if item_id == "item-07" and item_id not in flaky_seen:
                flaky_seen.add(item_id)
                return httpx.Response(503, json={"error": "temporary overload"})
            if item_id == "item-13":
                return httpx.Response(400, json={"error": "invalid payload"})
            return httpx.Response(200, json={"id": item_id, "ok": True})
        finally:
            stats["in_flight"] -= 1

    return httpx.MockTransport(handler), stats


async def run_seq() -> None:
    transport, stats = make_production_like_transport(delay=0.05)
    ids = [f"item-{i:02d}" for i in range(20)]
    t0 = time.perf_counter()
    ok = 0
    async with httpx.AsyncClient(transport=transport) as client:
        for item_id in ids:
            resp = await client.get(f"https://api.local/work/{item_id}")
            if resp.status_code == 200:
                ok += 1
    print(f"Sequential: ok={ok}/20 elapsed={time.perf_counter() - t0:.2f}s peak={stats['peak']}")


asyncio.run(run_seq())`,
        },
        output: `Sequential: ok=18/20 elapsed=1.02s peak=1`,
      },
      {
        title: "2 · อัปเกรดเป็น `Semaphore(5)` + Async Retry (ปล่อยช่องระหว่าง Backoff)",
        explain:
          "รัน 20 คำขอด้วย `Semaphore(5)` และ retry เฉพาะ `429`/`503` (ปล่อย `sem` ก่อน `await asyncio.sleep`) — `item-07` กลับมาสำเร็จในรอบที่ 2 ส่วน `item-13` (400) ล้มเหลวทันทีโดยไม่เสียเวลา retry",
        code: {
          language: "python",
          filename: "worked_d020_step2.py",
          code: `import asyncio
import time
import httpx
from worked_d020_step1 import make_production_like_transport

RETRYABLE = {429, 503}


async def process_one(
    client: httpx.AsyncClient,
    item_id: str,
    sem: asyncio.Semaphore,
    *,
    max_retries: int = 2,
    base_delay: float = 0.01,
) -> dict[str, object]:
    for attempt in range(max_retries + 1):
        async with sem:
            resp = await client.get(f"https://api.local/work/{item_id}")
        if resp.status_code in RETRYABLE and attempt < max_retries:
            await asyncio.sleep(base_delay * (2**attempt))
            continue
        resp.raise_for_status()
        return resp.json()
    raise RuntimeError("unreachable")


async def run_fast() -> None:
    transport, stats = make_production_like_transport(delay=0.05)
    ids = [f"item-{i:02d}" for i in range(20)]
    sem = asyncio.Semaphore(5)

    t0 = time.perf_counter()
    async with httpx.AsyncClient(transport=transport) as client:
        raw = await asyncio.gather(
            *(process_one(client, i, sem) for i in ids),
            return_exceptions=True,
        )
    elapsed = time.perf_counter() - t0
    ok = [r for r in raw if not isinstance(r, BaseException)]
    errs = [(i, type(r).__name__) for i, r in zip(ids, raw, strict=True) if isinstance(r, Exception)]
    print(f"Fast(5): ok={len(ok)}/20 errs={errs} elapsed={elapsed:.2f}s stats={stats}")


asyncio.run(run_fast())`,
        },
        output: `Fast(5): ok=19/20 errs=[('item-13', 'HTTPStatusError')] elapsed=0.22s stats={'in_flight': 0, 'peak': 5, 'status_429': 0, 'calls': 21}`,
      },
      {
        title: "3 · ตรวจสอบตัวเลข Speedup และ Integrity ครบทุกมิติ",
        explain:
          "เทียบผลลัพธ์ของ Step 1 vs Step 2: เวลารวมลดจาก `1.02s` เหลือ `0.22s` (~4.6x speedup!), `peak` อยู่ที่ `5` เป๊ะ, `status_429 == 0`, และ `calls == 21` (20 คำขอ + 1 retry ของ `item-07` โดยไม่ retry `item-13` ที่เป็น 400)",
        code: {
          language: "python",
          filename: "worked_d020_step3.py",
          code: `# สรุปตัวชี้วัดที่ได้จากการรันจริง:
# - Sequential: 1.02s (18/20 เพราะไม่มี retry)
# - Bounded Async Semaphore(5) + Retry: 0.22s (19/20, แยก item-13 ออกเป็น error)
# - Speedup: 1.02 / 0.22 ≈ 4.64x
# - Peak concurrency: 5 (<= 5 cap), HTTP 429 triggered: 0
# - Total HTTP calls: 21 (retry เฉพาะ 503 ของ item-07 ไม่ retry 400 ของ item-13)`,
        },
        output: `# ผ่านเกณฑ์ทั้งความเร็ว (~5x), ความปลอดภัย (0 rate-limit) และความถูกต้องของ retry policy`,
      },
    ],
    gotcha:
      "กับดักร้ายแรงในวันทบทวน: เผลอใช้ `time.sleep(base_delay * 2**attempt)` แทน `await asyncio.sleep(...)` ตอนรอ retry — แม้จะมี `Semaphore(5)` แต่ทันทีที่ 1 คำขอเจอ `503` ทั้ง 5 ช่องจะค้างรอพร้อมกันจนความเร็วตกฮวบ!",
  },

  practice: {
    intro:
      "โจทย์ทบทวน + Mini-Integration (15 นาที): คุณได้รับโค้ด `batch_pipeline.py` ที่มี `run_sequential_batch` ซึ่งช้าทีละตัว — ภารกิจของคุณคือสร้าง `run_fast_batch` เพื่อเร่งความเร็วชุดงาน 20 คำขอให้ไวขึ้น **4–5 เท่าอย่างปลอดภัย** ด้วย `Semaphore(5)`, async retry (`429`/`503`) และการแยก error รายชิ้น",
    requirements: [
      "ประกาศ dataclass `ItemFailure(item_id: str, reason: str)` และ `BatchReport(succeeded: list[dict[str, object]], failed: list[ItemFailure], elapsed_sec: float)`",
      "สร้าง `async def fetch_item_with_retry(client: httpx.AsyncClient, item_id: str, sem: asyncio.Semaphore, *, max_retries: int = 2, base_delay: float = 0.02, base_url: str = 'https://api.local') -> dict[str, object]` ที่ครอบเฉพาะ `client.get(f'{base_url}/items/{item_id}')` ด้วย `async with sem:`, retry เฉพาะ HTTP `429` และ `503` ด้วย `await asyncio.sleep(base_delay * (2 ** attempt))` **หลังออกจาก `async with sem:`**, และไม่ retry สถานะอื่น (เช่น `400`/`404`)",
      "สร้าง `async def run_fast_batch(client: httpx.AsyncClient, item_ids: list[str], *, max_concurrency: int = 5, max_retries: int = 2, base_delay: float = 0.02, base_url: str = 'https://api.local') -> BatchReport` ที่ตรวจ `max_concurrency >= 1`, แชร์ `Semaphore(max_concurrency)` ใบเดียว, และรันด้วย `asyncio.gather(..., return_exceptions=True)`",
      "แยก `succeeded` และ `failed` โดยรักษาลำดับตาม `item_ids`, re-raise `BaseException` ที่ไม่ใช่ `Exception` (เช่น `CancelledError`), และบันทึก `elapsed_sec` ด้วย `time.perf_counter()`",
      "ต้องไม่ใช้ `time.sleep` ในโค้ด async และผ่านเกณฑ์ speedup `>= 4.0x` บน 20 คำขอใน `pytest` โดย `peak_in_flight <= 5` และ `status_429 == 0`",
    ],
    starter: {
      language: "python",
      filename: "batch_pipeline.py",
      code: `import asyncio
from dataclasses import dataclass
import time
import httpx

RETRYABLE_STATUSES = {429, 503}


@dataclass(frozen=True)
class ItemFailure:
    item_id: str
    reason: str


@dataclass(frozen=True)
class BatchReport:
    succeeded: list[dict[str, object]]
    failed: list[ItemFailure]
    elapsed_sec: float


async def run_sequential_batch(
    client: httpx.AsyncClient,
    item_ids: list[str],
    *,
    base_url: str = "https://api.local",
) -> BatchReport:
    """Baseline ช้าแบบยิงทีละคำขอ (ให้ไว้เทียบความเร็ว)"""
    t0 = time.perf_counter()
    succeeded: list[dict[str, object]] = []
    failed: list[ItemFailure] = []
    for item_id in item_ids:
        try:
            resp = await client.get(f"{base_url}/items/{item_id}")
            resp.raise_for_status()
            succeeded.append(resp.json())
        except Exception as exc:
            failed.append(ItemFailure(item_id=item_id, reason=str(exc)))
    return BatchReport(
        succeeded=succeeded,
        failed=failed,
        elapsed_sec=time.perf_counter() - t0,
    )


async def fetch_item_with_retry(
    client: httpx.AsyncClient,
    item_id: str,
    sem: asyncio.Semaphore,
    *,
    max_retries: int = 2,
    base_delay: float = 0.02,
    base_url: str = "https://api.local",
) -> dict[str, object]:
    # TODO: ครอบเฉพาะ client.get ด้วย async with sem:
    # ถ้า status อยู่ใน RETRYABLE_STATUSES และยังมีสิทธิ์ retry ให้รอแบบ async หลังออกจาก sem
    raise NotImplementedError


async def run_fast_batch(
    client: httpx.AsyncClient,
    item_ids: list[str],
    *,
    max_concurrency: int = 5,
    max_retries: int = 2,
    base_delay: float = 0.02,
    base_url: str = "https://api.local",
) -> BatchReport:
    # TODO: ตรวจ max_concurrency >= 1, แชร์ Semaphore ใบเดียว, ใช้ gather(return_exceptions=True)
    # แยก succeeded / failed โดยรักษาลำดับเดิม และจับเวลาด้วย time.perf_counter()
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_batch_pipeline.py",
      code: `import asyncio
import httpx
import pytest
from batch_pipeline import BatchReport, run_fast_batch, run_sequential_batch


def make_batch_transport(
    *,
    delay: float = 0.08,
    max_allowed: int = 5,
    transient_once: set[str] | None = None,
    permanent_bad: set[str] | None = None,
):
    stats = {"in_flight": 0, "peak": 0, "status_429": 0, "calls_by_id": {}}
    seen_transient: set[str] = set()
    transient_set = transient_once or set()
    bad_set = permanent_bad or set()

    async def handler(request: httpx.Request) -> httpx.Response:
        item_id = request.url.path.rsplit("/", 1)[-1]
        stats["calls_by_id"][item_id] = stats["calls_by_id"].get(item_id, 0) + 1
        stats["in_flight"] += 1
        stats["peak"] = max(stats["peak"], stats["in_flight"])
        try:
            if stats["in_flight"] > max_allowed:
                stats["status_429"] += 1
                return httpx.Response(429, json={"error": "too many concurrent calls"})
            await asyncio.sleep(delay)
            if item_id in transient_set and item_id not in seen_transient:
                seen_transient.add(item_id)
                return httpx.Response(503, json={"error": "try again"})
            if item_id in bad_set:
                return httpx.Response(400, json={"error": "bad request"})
            return httpx.Response(200, json={"id": item_id, "status": "ok"})
        finally:
            stats["in_flight"] -= 1

    return httpx.MockTransport(handler), stats


def test_20_call_batch_achieves_safe_5x_speedup():
    ids = [f"doc-{i:02d}" for i in range(20)]

    async def run() -> tuple[BatchReport, BatchReport, dict[str, object]]:
        seq_transport, _ = make_batch_transport(delay=0.08, max_allowed=5)
        async with httpx.AsyncClient(transport=seq_transport) as seq_client:
            seq_report = await run_sequential_batch(seq_client, ids)

        fast_transport, fast_stats = make_batch_transport(delay=0.08, max_allowed=5)
        async with httpx.AsyncClient(transport=fast_transport) as fast_client:
            fast_report = await run_fast_batch(fast_client, ids, max_concurrency=5)
        return seq_report, fast_report, fast_stats

    seq_report, fast_report, stats = asyncio.run(run())
    assert len(seq_report.succeeded) == 20
    assert len(fast_report.succeeded) == 20
    assert [x["id"] for x in fast_report.succeeded] == ids
    assert fast_report.failed == []
    assert stats["peak"] <= 5
    assert stats["status_429"] == 0
    speedup = seq_report.elapsed_sec / fast_report.elapsed_sec
    assert speedup >= 4.0, f"Expected >= 4.0x speedup, got {speedup:.2f}x"


def test_retries_transient_503_and_isolates_permanent_400():
    ids = [f"doc-{i:02d}" for i in range(20)]

    async def run() -> tuple[BatchReport, dict[str, object]]:
        transport, stats = make_batch_transport(
            delay=0.03,
            max_allowed=5,
            transient_once={"doc-04", "doc-11"},
            permanent_bad={"doc-09"},
        )
        async with httpx.AsyncClient(transport=transport) as client:
            report = await run_fast_batch(
                client,
                ids,
                max_concurrency=5,
                max_retries=2,
                base_delay=0.01,
            )
        return report, stats

    report, stats = asyncio.run(run())
    assert len(report.succeeded) == 19
    assert [f.item_id for f in report.failed] == ["doc-09"]
    assert stats["peak"] <= 5
    assert stats["status_429"] == 0
    # transient 503 ถูก retry 1 ครั้ง (= 2 calls), permanent 400 ห้าม retry (= 1 call)
    assert stats["calls_by_id"]["doc-04"] == 2
    assert stats["calls_by_id"]["doc-11"] == 2
    assert stats["calls_by_id"]["doc-09"] == 1


def test_empty_and_invalid_concurrency():
    async def run() -> None:
        transport, _ = make_batch_transport(delay=0.01, max_allowed=5)
        async with httpx.AsyncClient(transport=transport) as client:
            empty = await run_fast_batch(client, [], max_concurrency=5)
            assert empty.succeeded == []
            assert empty.failed == []
            with pytest.raises(ValueError):
                await run_fast_batch(client, ["doc-01"], max_concurrency=0)

    asyncio.run(run())
`,
    },
    selfCheck: [
      "ชุดงาน 20 คำขอทำ speedup ได้ `>= 4.0x` (โดยทั่วไป ~4.6x–5.0x) เมื่อเทียบกับ `run_sequential_batch`",
      "ค่า `peak_in_flight <= 5` และ `status_429 == 0` ตลอดการรัน",
      "`doc-04` และ `doc-11` ที่เจอ `503` ชั่วคราวถูก retry แล้วกลับมาสำเร็จ (เรียก 2 ครั้ง) ส่วน `doc-09` ที่เจอ `400` ถูกแยกเข้า `failed` โดยไม่ retry ซ้ำ (เรียก 1 ครั้ง)",
      "ลำดับใน `succeeded` ตรงตาม `item_ids` เดิม และรองรับ `item_ids=[]` กับ `max_concurrency=0` ได้ถูกต้อง",
      "ผ่านทั้ง `uv run pytest -W error -q` และ `uv run ruff check .`",
    ],
    acceptance:
      "ผ่านเทสต์ทั้ง 3 ฟังก์ชันด้วย `uv run pytest -W error -q` (ยืนยัน `speedup >= 4.0x` และ `peak <= 5`) และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `fetch_item_with_retry` ให้วน `for attempt in range(max_retries + 1):` แล้ววาง `async with sem: resp = await client.get(...)` แค่ 2 บรรทัดนั้น จากนั้นค่อยเช็ก `resp.status_code in RETRYABLE_STATUSES` และ `await asyncio.sleep(...)` นอก `async with sem:`",
      },
      {
        body: "ใน `run_fast_batch` จับเวลาด้วย `t0 = time.perf_counter()` ก่อนรัน `gather(..., return_exceptions=True)` และจับคู่ด้วย `zip(item_ids, raw_results, strict=True)` เพื่อรักษาลำดับเดิม",
      },
      {
        body: "โครงของ `fetch_item_with_retry` พร้อมแล้ว เติมลูปแยก `succeeded` / `failed` ใน `run_fast_batch` แล้วรัน `uv run pytest -W error -q`",
        code: {
          language: "python",
          filename: "hint-d020-l3.py",
          code: `async def fetch_item_with_retry(
    client: httpx.AsyncClient,
    item_id: str,
    sem: asyncio.Semaphore,
    *,
    max_retries: int = 2,
    base_delay: float = 0.02,
    base_url: str = "https://api.local",
) -> dict[str, object]:
    for attempt in range(max_retries + 1):
        async with sem:
            resp = await client.get(f"{base_url}/items/{item_id}")
        if resp.status_code in RETRYABLE_STATUSES and attempt < max_retries:
            await asyncio.sleep(base_delay * (2**attempt))
            continue
        resp.raise_for_status()
        return resp.json()
    raise RuntimeError("unreachable")


async def run_fast_batch(
    client: httpx.AsyncClient,
    item_ids: list[str],
    *,
    max_concurrency: int = 5,
    max_retries: int = 2,
    base_delay: float = 0.02,
    base_url: str = "https://api.local",
) -> BatchReport:
    if max_concurrency < 1:
        raise ValueError("max_concurrency must be >= 1")
    t0 = time.perf_counter()
    if not item_ids:
        return BatchReport(succeeded=[], failed=[], elapsed_sec=0.0)

    sem = asyncio.Semaphore(max_concurrency)
    raw = await asyncio.gather(
        *(
            fetch_item_with_retry(
                client,
                item_id,
                sem,
                max_retries=max_retries,
                base_delay=base_delay,
                base_url=base_url,
            )
            for item_id in item_ids
        ),
        return_exceptions=True,
    )
    # TODO: แยก succeeded / failed (อย่าลืม re-raise BaseException ที่ไม่ใช่ Exception)
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -W error -v
uv run ruff check .`,
      caption: "ใช้ `-v` เพื่อดูผลผ่านของแต่ละเทสต์รวมถึงการวัด speedup บนเครื่องของคุณ",
    },
  },

  mistakes: [
    {
      title: "ใช้ `time.sleep(...)` สำหรับ backoff ในฟังก์ชัน `async def`",
      symptom: "เมื่อคำขอหนึ่งเจอ `503` ทุก coroutine ที่เหลือถูกแช่แข็งพร้อมกัน ทำให้ speedup ตกต่ำกว่าที่คำนวณไว้",
      fix: "ใช้ `await asyncio.sleep(base_delay * (2 ** attempt))` เสมอในโค้ด `asyncio`",
    },
    {
      title: "ถือ `async with sem:` ค้างไว้ตลอดช่วง `await asyncio.sleep(...)` ตอน retry",
      symptom: "ช่อง concurrency ถูกกั๊กไว้เฉย ๆ ระหว่างรอ backoff ส่งผลให้คำขออื่นที่พร้อมทำงานต้องรอคิวนานเกินจำเป็น",
      fix: "ครอบ `async with sem:` เฉพาะตอนเรียก `await client.get(...)` แล้วออกจากบล็อกก่อนค่อย `await asyncio.sleep(...)`",
    },
    {
      title: "Retry ทุก HTTP error รวมทั้ง `400 Bad Request` หรือ `404 Not Found`",
      symptom: "เสียเวลาและยิงคำขอซ้ำโดยเปล่าประโยชน์กับข้อมูลที่ผิดตั้งแต่ต้นทาง และเทสต์ตรวจ `calls_by_id['doc-09'] == 1` ไม่ผ่าน",
      fix: "Retry เฉพาะความผิดพลาดชั่วคราว (`429`, `503` หรือ network timeout) ส่วน `4xx` ถาวรให้แยกเข้า `failed` ทันที",
    },
    {
      title: "เพิ่ม `max_concurrency` เป็น 20 เพื่อให้ไวขึ้นโดยไม่ดูเพดานปลายทาง",
      symptom: "ชน HTTP `429` เป็นแผงและต้องวน retry จนช้ากว่าและสิ้นเปลืองกว่า `Semaphore(5)`",
      fix: "ตั้ง `max_concurrency` ให้สอดคล้องกับเพดานของปลายทางและเขียนเทสต์ตรวจ `stats['status_429'] == 0` ไว้เสมอ",
    },
  ],

  quiz: {
    intro:
      "Interleaved Recall Quiz (4 ข้อ จาก D14 และ D17–D19) — ลองตอบจากความจำก่อนเช็กเฉลย ข้อที่พลาดจะถูกเพิ่มเข้าคิวทบทวนอัตโนมัติ",
    questions: [
      mc(
        "d020-q1",
        "[ทบทวน D17 + D14] ใน batch pipeline แบบ `asyncio` หากคำขอหนึ่งเจอ `503` แล้วโค้ดเรียก `time.sleep(0.5)` เพื่อรอ backoff จะเกิดอะไรขึ้น?",
        [
          ["เฉพาะคำขอนั้นที่พัก 0.5 วินาที ส่วนอีก 4 คำขอใน `Semaphore(5)` วิ่งต่อไปตามปกติ", "ผิด — `time.sleep` หยุด OS thread ทั้งเส้น ไม่ได้คืนสิทธิ์ให้ Event Loop"],
          ["Event Loop ทั้งระบบหยุดค้าง 0.5 วินาที ทำให้คำขออื่นอีก 4 คำขอหยุดตามไปด้วย", "ถูก — ต้องใช้ `await asyncio.sleep(0.5)` เสมอในโค้ด async"],
          ["`asyncio` จะแปลง `time.sleep` เป็น `asyncio.sleep` ให้อัตโนมัติ", "Python ไม่แปลง `time.sleep` ให้อัตโนมัติ"],
          ["เกิด `SyntaxError` ทันทีตอน import ไฟล์", "ไม่ผิดไวยากรณ์ แต่สร้างบั๊กประสิทธิภาพร้ายแรงตอนรัน"],
        ],
        "B",
        "Event Loop มี thread เดียว การเรียก `time.sleep` ใน `async def` จะแช่แข็งทุก coroutine ที่กำลังรันอยู่ทั้งหมด — ต้องใช้ `await asyncio.sleep` เสมอ",
        "ทำไมห้ามใช้ `time.sleep` ทำ retry backoff ใน `asyncio` pipeline?",
        "เพราะ `time.sleep` บล็อก Event Loop thread เดียวทั้งหมด ทำให้ทุก task ที่รันพร้อมกันค้างตาม ต้องใช้ `await asyncio.sleep`",
      ),
      mc(
        "d020-q2",
        "[ทบทวน D18] เรามี 20 คำขอที่แต่ละคำขอใช้เวลา 0.10s และ API ปลายทางรับพร้อมกันได้สูงสุด 5 คำขอ (เกินคืน `429`) หากมี 1 รายการคืน `400` ถาวร การออกแบบใดเหมาะสมที่สุด?",
        [
          ["ใช้ `asyncio.TaskGroup()` โดยไม่มี `Semaphore`", "ผิดสองจุด: ไม่คุมเพดานจนชน 429 และ `TaskGroup` จะยกเลิกอีก 19 คำขอเมื่อเจอ 400"],
          ["แชร์ `httpx.AsyncClient` + `asyncio.Semaphore(5)` + `asyncio.gather(..., return_exceptions=True)`", "ถูก — ได้ความเร็ว ~5 เท่า, ไม่ชน 429, และแยก 400 ออกโดยเก็บอีก 19 รายการครบ"],
          ["รัน `await client.get(...)` ทีละตัวใน `for` loop", "ปลอดภัยจาก 429 แต่ช้า 2.00s ไม่ได้ speedup 5 เท่า"],
          ["สร้าง `Semaphore(5)` ใหม่ข้างในฟังก์ชัน `fetch_one`", "การสร้าง `Semaphore` ใน worker ทำให้ทุก task ได้คนละใบและไม่จำกัด concurrency เลย"],
        ],
        "B",
        "สูตรมาตรฐานสำหรับ resilient batch คือ: 1 shared `AsyncClient` + 1 shared `Semaphore(cap)` + `gather(..., return_exceptions=True)`",
        "องค์ประกอบ 3 อย่างของ async batch fetcher ที่เร็ว ปลอดภัยจาก 429 และทนต่อ error บางส่วนคืออะไร?",
        "1) แชร์ `httpx.AsyncClient` ใบเดียว 2) แชร์ `asyncio.Semaphore(n)` ใบเดียว 3) ใช้ `asyncio.gather(..., return_exceptions=True)`",
      ),
      mc(
        "d020-q3",
        "[ทบทวน D19] เมื่อสร้าง Async Generator อ่านสตรีม {{sse}} ด้วย `httpx.AsyncClient.stream(...)` ข้อใดเป็นแนวปฏิบัติที่ **ถูกต้อง** เมื่อผู้ใช้กดหยุดกลางทาง?",
        [
          ["ใช้ `await client.get()` จะได้ไม่ต้องกังวลเรื่องปิดสตรีม", "`client.get()` รอโหลดทั้งคำตอบก่อน ทำให้เสีย TTFT"],
          ["ครอบผู้เรียกด้วย `async with contextlib.aclosing(stream):` และ re-raise `asyncio.CancelledError` หลัง cleanup ใน `finally`", "ถูก — รับประกันว่า HTTP connection ปิดทันทีและสัญญาณยกเลิกไม่ถูกกลืนหาย"],
          ["จับ `except asyncio.CancelledError: return` เพื่อปิดสตรีมแบบเงียบ ๆ", "ห้ามกลืน `CancelledError` เพราะทำให้ระบบไม่รู้ว่า task ถูกยกเลิก"],
          ["เรียก `.strip()` กับทุกบรรทัด `data:` เพื่อให้สะอาด", "`.strip()` จะลบช่องว่างจริงที่นำหน้า token ออกจนคำติดกัน"],
        ],
        "B",
        "การใช้ `contextlib.aclosing` คู่กับ `try / finally` และส่งต่อ `CancelledError` ทำให้ทั้ง streaming UX และความสะอาดของทรัพยากรครบสมบูรณ์",
        "วิธีปิด SSE async generator อย่างสะอาดเมื่อหยุดอ่านกลางทางหรือถูกยกเลิกคืออะไร?",
        "ครอบด้วย `contextlib.aclosing(stream)` และใน generator วาง cleanup ใน `finally` พร้อม re-raise `asyncio.CancelledError` เสมอ",
      ),
      mc(
        "d020-q4",
        "[ทบทวน D14 + D18] เหตุใดเราจึงควรออกจากบล็อก `async with sem:` **ก่อน** เรียก `await asyncio.sleep(backoff)` เมื่อคำขอเจอ `503`?",
        [
          ["เพราะ Python ไม่อนุญาตให้เรียก `asyncio.sleep` ภายใน `async with sem:`", "Python อนุญาตให้เรียกได้ ไม่เกิด error แต่ทำให้เสียประสิทธิภาพ"],
          ["เพื่อคืนสิทธิ์ concurrency ให้คำขออื่นในคิวทำงานต่อได้ทันที แทนที่จะกั๊กช่องไว้เฉย ๆ ระหว่างรอ backoff", "ถูก — ช่วยป้องกัน head-of-line blocking และคง throughput ของ batch ไว้สูงสุด"],
          ["เพื่อให้คำขอที่เจอ `400` ถูก retry ด้วยอัตโนมัติ", "ไม่ควร retry `400` และไม่เกี่ยวกับการปล่อย semaphore"],
          ["เพราะ `Semaphore` จะหมดอายุถ้าถือนานเกิน 0.01 วินาที", "`Semaphore` ไม่มีเวลาหมดอายุอัตโนมัติ"],
        ],
        "B",
        "สิทธิ์ของ `Semaphore` ควรครอบเฉพาะทรัพยากรที่จำกัดจริง ๆ (การยิง HTTP request ออกไปที่เซิร์ฟเวอร์) ไม่ควรถือค้างไว้ระหว่างการรอ sleep",
        "ทำไมควรปล่อย `Semaphore` ก่อนเรียก `await asyncio.sleep(backoff)` ในลูป retry?",
        "เพื่อไม่ให้กั๊กช่อง concurrency ไว้เฉย ๆ ระหว่างรอ backoff ทำให้ coroutine อื่นที่รอคิวใช้ช่องนั้นส่งคำขอต่อได้ทันที",
      ),
    ],
  },

  takeaways: [
    "ท่อ batch 20 คำขอที่แชร์ `httpx.AsyncClient` + `asyncio.Semaphore(5)` ลดเวลาจาก 20 ช่วงเหลือ 4 ระลอก (~4–5x speedup) โดยไม่ชน {{rate-limit}} 429",
    "ถือ `async with sem:` เฉพาะตอนส่ง HTTP request แล้วปล่อยก่อนรอ `await asyncio.sleep(...)` เพื่อไม่กั๊กช่อง concurrency ระหว่าง backoff",
    "Retry เฉพาะความผิดพลาดชั่วคราว (`429`/`503`) และแยกความผิดพลาดถาวร (`400`/`404`) ด้วย `asyncio.gather(..., return_exceptions=True)`",
    "จบบล็อก B05 อย่างมั่นคง: วันพรุ่งนี้ (Day 21) เราจะเข้าสู่ Block B06 เพื่อจัดโครงสร้างโปรเจกต์ Git, Packaging และ CLI Tooling ด้วย Typer",
  ],

  reviewCards: [
    rc(
      "d020-rc-1",
      "ถ้ามี 20 คำขอ (คำขอละ 0.10s) รันด้วย `asyncio.Semaphore(5)` เวลารวมเชิงทฤษฎีคือเท่าไรและเร็วขึ้นกี่เท่า?",
      "วิ่งเป็น 20 / 5 = 4 ระลอก × 0.10s = ~0.40s เร็วขึ้น ~5 เท่าเมื่อเทียบกับ sequential (2.00s)",
    ),
    rc(
      "d020-rc-2",
      "ในการรวม `Semaphore` กับ async retry ควรวาง `await asyncio.sleep(backoff)` ไว้ข้างในหรือข้างนอก `async with sem:` เพราะเหตุใด?",
      "ไว้ข้างนอก `async with sem:` เพื่อคืนสิทธิ์ให้ coroutine อื่นใช้ช่องยิง API ต่อได้ทันทีระหว่างที่คำขอนี้กำลังรอ backoff",
    ),
    rc(
      "d020-rc-3",
      "ระหว่าง HTTP `503`/`429` กับ `400`/`404` ใน batch pipeline ควรจัดการต่างกันอย่างไร?",
      "`503`/`429` เป็นความผิดพลาดชั่วคราวให้ retry ด้วย async exponential backoff ส่วน `400`/`404` เป็นความผิดพลาดถาวรห้าม retry และให้แยกเก็บในรายการ `failed`",
    ),
  ],

  sources: [
    {
      label: "Python 3 Official Docs — asyncio Synchronization & Tasks",
      href: "https://docs.python.org/3/library/asyncio-sync.html",
    },
    {
      label: "HTTPX Documentation — Async Support & MockTransport",
      href: "https://www.python-httpx.org/async/",
    },
    {
      label: "Python 3 Official Docs — contextlib.aclosing",
      href: "https://docs.python.org/3/library/contextlib.html#contextlib.aclosing",
    },
    {
      label: "MDN Web Docs — HTTP 429 Too Many Requests & 503 Service Unavailable",
      href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
    },
  ],

  glossary: [
    "asyncio",
    "httpx",
    "semaphore",
    "rate-limit",
    "exponential-backoff",
    "sse",
    "pytest",
    "mocking",
  ],
});
