import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D013 — Phase 1 / Block B04
 * HTTP Clients with httpx, Timeouts & Status Codes.
 */
export const d013: Lesson = defineLesson({
  day: 13,
  titleTh: "สร้าง HTTP Client ที่ไว้ใจได้ด้วย httpx: Granular Timeouts และแยก Status Code",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · จัดการ connection pooling, ตั้ง timeout แยกช่วง และแยก error 4xx vs 429/5xx อย่างมืออาชีพ",
  icon: "globe",
  visual: {
    id: "httpx-timeout",
    title: "วงจร HTTP Client — Granular Timeouts & การแยก Status Code",
    caption: "คลิกดูช่วง connect/read timeout และการตัดสินใจเมื่อเจอ 200, 400, 401, 429 และ 503",
    alt: "แผนภาพ httpx timeouts และการแยกจัดการ HTTP status codes",
  },
  requiresApiKey: false,
  tools: ["httpx", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ดึงข้อมูลจากบริการภายนอกอย่างไม่ค้างตลอดกาล",
      body: "ระบบ AI แทบทุกตัวต้องเรียก API ภายนอก ไม่ว่าจะเป็นระบบ CRM, ฐานข้อมูลเอกสาร หรือ webhook ลูกค้า หากไม่ตั้ง timeout ที่ชัดเจน แค่ปลายทางค้าง 1 เส้นก็ทำให้ worker หยุดทำงานทั้งกระบวนการได้",
      lessonNote: "วันนี้เราใช้ {{httpx}} ตั้ง `httpx.Timeout` แยกช่วง `connect`/`read`/`write`/`pool` และจัดการ connection pool ผ่าน context manager",
    },
    {
      node: 2,
      heading: "ชั้นสื่อสารใต้ผิวของทุก LLM และ Embedding SDK",
      body: "Official SDK ของผู้ให้บริการ {{llm}} สมัยใหม่ใน Python ล้วนใช้ {{httpx}} เป็นเครื่องยนต์ส่ง HTTP ข้างใต้ทั้งสิ้น การเข้าใจ timeout และ status code ช่วยให้คุณคุมพฤติกรรมของโมเดลได้จริงในงาน production",
      lessonNote: "เราแยกความต่างระหว่าง **4xx (บั๊กฝั่งเรา → fail fast)** กับ **429/5xx (ปัญหาชั่วคราว → ส่งต่อให้ระบบ retry ใน Day 14)**",
    },
    {
      node: 3,
      heading: "ทดสอบทุกสถานะ HTTP แบบ 100% ออฟไลน์และทำซ้ำได้",
      body: "เราไม่ควรยิง API จริงเพื่อลุ้นให้เกิด 429 หรือ 503 ระหว่างรันเทสต์ เพราะทั้งช้า เสียเงิน และผลไม่นิ่ง",
      lessonNote: "ใช้ `httpx.MockTransport` จำลอง 200, 400, 401, 429, 503 และ timeout ใน {{pytest}} ได้ทันทีโดยไม่ต้องต่ออินเทอร์เน็ต",
    },
    {
      node: 5,
      heading: "เปลี่ยนรหัสสถานะ HTTP เป็นสัญญาณที่ทีม Monitor อ่านรู้เรื่อง",
      body: "การจับ `Exception` เหมารวมทำให้แดชบอร์ดแยกไม่ออกว่า API key หมดอายุ (401), โควตาเต็ม (429) หรือเซิร์ฟเวอร์ปลายทางล่ม (503)",
      lessonNote: "เราสร้างลำดับชั้น {{custom-exception}} (`ClientAPIError` vs `TransientAPIError`) เพื่อให้ระบบแจ้งเตือนและ retry ตัดสินใจได้แม่นยำ",
    },
  ],

  objectives: [
    "**ใช้งาน** `httpx.Client` ผ่าน context manager (`with httpx.Client(...) as client:`) เพื่อรีใช้ TCP/TLS connection pool และปิด socket อย่างสะอาด",
    "**กำหนด** `httpx.Timeout` แบบละเอียด (`connect`, `read`, `write`, `pool`) ให้เหมาะกับธรรมชาติของ AI API ที่เชื่อมต่อเร็วแต่อ่านคำตอบช้า",
    "**จำแนกและทดสอบ** HTTP status codes ออกเป็น 2xx (สำเร็จ), 4xx (ผิดพลาดถาวร → {{fail-fast}}) และ 429/5xx (ผิดพลาดชั่วคราว → retryable) โดยจำลองทุกเคสด้วย `httpx.MockTransport`",
  ],

  prerequisites: [
    "เข้าใจการสร้าง {{custom-exception}} (Day 6) และพื้นฐานการเขียนเทสต์ด้วย {{pytest}} + {{mocking}} (Day 9–10)",
    "มี `uv` และ Python 3.11+ ติดตั้งบนเครื่องแล้ว",
    "ไม่ต้องใช้ API key หรืออินเทอร์เน็ต — จำลองทุก HTTP response บนเครื่อง 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่สำหรับ Block B04 แล้วติดตั้ง {{httpx}} พร้อม `pytest` และ `ruff` ผ่าน `uv` เพื่อเริ่มฝึกสร้าง HTTP Client แบบออฟไลน์",
    commands: `uv init ai-day13-httpx && cd ai-day13-httpx
uv add httpx
uv add --dev pytest ruff

# ตรวจเวอร์ชัน httpx
uv run python -c "import httpx; print('httpx:', httpx.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day13-httpx` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `httpx` และ dev tools (`pytest`, `ruff`)"],
      ["verify", "รันเช็กเวอร์ชัน `httpx` ผ่าน `uv run python` สำเร็จ"],
    ],
    note: "บทนี้ใช้ `httpx.MockTransport` จำลองเซิร์ฟเวอร์ทั้งหมดบนหน่วยความจำ คุณจึงทดสอบ timeout, 429 และ 503 ได้เร็วระดับมิลลิวินาทีโดยไม่ยิงเน็ตจริง",
  },

  concepts: [
    {
      id: "httpx-client-pooling",
      title: "1 · `httpx.Client` + Connection Pooling vs `httpx.get()` แบบใช้แล้วทิ้ง",
      paragraphs: [
        "มือใหม่หลายคนเรียก `httpx.get(url)` ซ้ำในลูป 100 ครั้ง ซึ่งทุกครั้งจะเปิด TCP handshake + TLS handshake ใหม่หมดแล้วปิดทิ้ง ทำให้ช้ากว่าที่ควรและเปลืองพอร์ตของระบบปฏิบัติการ",
        "แนวทางมาตรฐานคือสร้าง `httpx.Client(base_url=..., headers=..., timeout=...)` ไว้ในบล็อก `with` เพื่อ **รีใช้การเชื่อมต่อ (HTTP keep-alive / connection pooling)** ตั้งค่า header และ `base_url` รวมไว้ที่เดียว และรับประกันว่า socket ทั้งหมดถูกปิดเรียบร้อยเมื่อจบงาน",
      ],
      analogy:
        "การเรียก `httpx.get()` ในลูปเหมือนวางสายโทรศัพท์แล้วกดโทรหาคอลเซ็นเตอร์ใหม่ทุกประโยค ส่วน `with httpx.Client()` คือถือสายเดิมไว้คุยต่อเนื่องจนจบธุระแล้วค่อยวางสายทีเดียว",
      bullets: [
        "**`base_url`** — ไม่ต้องต่อสตริง URL ซ้ำในทุกฟังก์ชัน เรียกแค่ `client.post(\"/v1/classify\", ...)`",
        "**`headers`** — แนบ `Authorization`, `User-Agent` หรือ `Accept` ไว้ระดับ client เดียวกัน",
        "**Context Manager (`with`)** — ปิด connection pool อัตโนมัติแม้โค้ดข้างในจะโยน exception",
      ],
      code: {
        language: "python",
        filename: "client_pool.py",
        code: `import httpx

timeout = httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)

with httpx.Client(
    base_url="https://api.example.test",
    headers={"Accept": "application/json"},
    timeout=timeout,
) as client:
    # ทุก request ในบล็อกนี้ใช้ connection pool และ timeout ชุดเดียวกัน
    print("Base URL:", client.base_url)
    print("Timeout:", client.timeout)`,
        caption: "กำหนด `base_url`, `headers` และ `timeout` ไว้ที่ `httpx.Client` ครั้งเดียวแล้วใช้ร่วมกันทั้งเซสชัน",
      },
      whyTitle: "Why this matters — เตรียมพร้อมก่อนก้าวสู่ `httpx.AsyncClient` ใน Block B05",
      whyParagraphs: [
        "จุดแข็งของ {{httpx}} เหนือ `requests` คือ API ของ `httpx.Client` (sync) และ `httpx.AsyncClient` (async) เหมือนกันแทบทุกบรรทัด และรองรับ HTTP/2 รวมถึงการตั้ง timeout แยกช่วงตั้งแต่แกะกล่อง",
        "เมื่อคุณย้ายไปเขียนโค้ด concurrent ใน Day 18 หรือใช้ใน FastAPI lifespan ใน Day 137 รูปแบบการจัดการ client lifecycle จะเหมือนเดิมทุกประการ",
      ],
    },
    {
      id: "granular-timeouts",
      title: "2 · ตั้ง Granular Timeout 4 ช่วง — กฎเหล็กห้ามปล่อย `timeout=None`",
      paragraphs: [
        "ใน `requests` ค่าเริ่มต้นคือ **ไม่มี timeout เลย** (รอได้ตลอดกาล!) ส่วนใน {{httpx}} ค่าเริ่มต้นคือ 5 วินาทีทุกช่วง ซึ่งสำหรับงานเรียก {{llm}} มัก **สั้นเกินไปสำหรับการรอคำตอบ (read)** แต่ก็ **ยาวเกินไปสำหรับการเชื่อมเซิร์ฟเวอร์ (connect)**",
        "`httpx.Timeout(connect=3.0, read=20.0, write=5.0, pool=5.0)` ช่วยให้คุณแยกคุมเวลา 4 จังหวะได้แม่นยำ: ถ้าเซิร์ฟเวอร์ปลายทางล่มจนต่อไม่ติด ให้ตัดจบเร็วใน 3 วินาที (`connect`) แต่ถ้าต่อติดแล้วโมเดลกำลังคิดคำตอบ ให้รออ่านได้นานขึ้น (`read`)",
      ],
      analogy:
        "เหมือนสั่งอาหารเดลิเวอรี — ถ้ากดสั่งแล้วร้านไม่รับออเดอร์ภายใน 3 นาที (`connect`) ควรยกเลิกทันทีไม่ต้องรอ แต่ถ้าร้านกดรับแล้วก็ยอมรอทำอาหาร 20 นาที (`read`) ได้",
      bullets: [
        "**`connect`** — เวลารอเปิด TCP/TLS connection ไปยังปลายทาง (ตั้งสั้น เช่น 2–5 วินาที)",
        "**`read`** — เวลารอรับข้อมูลชิ้นถัดไปจากเซิร์ฟเวอร์ (งาน LLM อาจตั้ง 15–60 วินาที)",
        "**`write`** — เวลารอส่ง request body ออกไป (สำคัญเมื่ออัปโหลดไฟล์หรือ {{payload}} ขนาดใหญ่)",
        "**`pool`** — เวลารอคิวขอ connection ว่างจาก pool เมื่อมีงานยิงพร้อมกันเยอะ",
      ],
      whyTitle: "Why this matters — การค้างเงียบอันตรายกว่า Error ทันที",
      whyParagraphs: [
        "ในระบบ production ถ้า worker 4 ตัวค้างรอ socket ที่ปลายทางตายเงียบไปโดยไม่มี timeout แอปทั้งหมดจะรับผู้ใช้ใหม่ไม่ได้เลย ทั้งที่ CPU อยู่ที่ 0%",
        "การตั้ง granular timeout เปลี่ยนอาการ \"ค้างไม่รู้จบ\" ให้กลายเป็น `httpx.TimeoutException` ที่ชัดเจน จับได้ และตัดสินใจ retry หรือคืน fallback ได้ทันที",
      ],
    },
    {
      id: "status-code-classification",
      title: "3 · จำแนก Status Code: 2xx สำเร็จ vs 4xx Fail-Fast vs 429/5xx Retryable",
      paragraphs: [
        "ความผิดพลาดยอดฮิตของมือใหม่คือโยนทุก error ลงตะกร้าเดียว หรือสั่ง retry ทุกครั้งที่ `status_code != 200` — ลองคิดดูว่าถ้าคุณส่ง JSON ผิดรูปแบบ (`400 Bad Request`) หรือ API key ผิด (`401 Unauthorized`) ต่อให้ลองยิงซ้ำอีก 100 รอบก็ไม่มีวันผ่าน มีแต่จะเปลืองโควตาและโดนแบน",
        "วิศวกร AI จึงแบ่งผลลัพธ์ HTTP ออกเป็น 3 กลุ่มชัดเจน และแปลงเป็น {{custom-exception}} แยกชนิด: **2xx** ผ่าน, **4xx ยกเว้น 408/429** ให้ {{fail-fast}} ด้วย `ClientAPIError`, ส่วน **408, 429 ({{rate-limit}}), 5xx และ `httpx.TransportError`** ให้โยน `TransientAPIError` เพื่อให้ชั้น retry (Day 14) รับช่วงต่อ",
      ],
      analogy:
        "เหมือนเคาะประตูห้องประชุม: ถ้าป้ายบอกว่า \"คุณไม่มีสิทธิ์เข้า\" (`401/403`) ต้องหยุดทันทีแล้วไปตรวจบัตร (fail fast) แต่ถ้าป้ายบอกว่า \"ห้องเต็มชั่วคราว รอ 5 นาที\" (`429/503`) ค่อยกลับมาเคาะใหม่",
      code: {
        language: "python",
        filename: "status_classifier.py",
        code: `import httpx


class APIError(Exception):
    """Base error สำหรับ HTTP API client"""


class ClientAPIError(APIError):
    """4xx (ยกเว้น 408/429) — บั๊กฝั่งผู้เรียก ห้าม retry"""

    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(f"Client error {status_code}: {message}")
        self.status_code = status_code


class TransientAPIError(APIError):
    """408 / 429 / 5xx / timeout — ปัญหาชั่วคราว สามารถ retry ได้"""

    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.retry_after = retry_after


def classify_response(response: httpx.Response) -> dict:
    code = response.status_code
    if 200 <= code < 300:
        return response.json()
    if code in (408, 429) or code >= 500:
        raw_after = response.headers.get("Retry-After")
        retry_after = float(raw_after) if raw_after and raw_after.isdigit() else None
        raise TransientAPIError(
            f"Transient HTTP {code}", status_code=code, retry_after=retry_after
        )
    raise ClientAPIError(code, response.text[:200])`,
        caption: "แยก `ClientAPIError` (ห้าม retry) ออกจาก `TransientAPIError` (ลองใหม่ได้ พร้อมเก็บค่า `Retry-After` ถ้ามี)",
      },
      whyTitle: "Why this matters — ปูรากฐานให้ `tenacity` และ Circuit Breaker",
      whyParagraphs: [
        "เมื่อคุณแยกชนิด exception ชัดตั้งแต่วันนี้ ใน Day 14 คุณแค่สั่งให้ `tenacity` retry เฉพาะ `TransientAPIError` เพียงบรรทัดเดียว ก็มั่นใจได้ว่าจะไม่เผลอ retry ใส่ 400 หรือ 401",
        "เช่นเดียวกันใน Day 15 Circuit Breaker จะนับเฉพาะ `TransientAPIError` เป็นความล้มเหลวของเซิร์ฟเวอร์ ไม่ตัดวงจรเพราะผู้ใช้กรอกข้อมูลผิด (400)",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ `httpx` กับ `fetch` / `axios` ใน JS/TS",
      body: [
        "ถ้าคุณคุ้นเคยกับ `axios.create(...)` หรือ `fetch` + `AbortSignal.timeout(...)` แนวคิดของ `httpx.Client` จะตรงกันมาก แถม `httpx` แยก timeout ย่อยให้ละเอียดกว่า:",
      ],
      table: [
        ["`httpx.Client(base_url=..., headers=...)`", "`axios.create({ baseURL, headers })`"],
        ["`httpx.Timeout(connect=3, read=15, write=5, pool=5)`", "`AbortSignal.timeout(15_000)` (คุมรวมทุกช่วง)"],
        ["`response.raise_for_status()`", "เช็ก `if (!res.ok) throw new Error(...)` ใน `fetch`"],
        ["`httpx.MockTransport(handler)`", "`msw` (Mock Service Worker) หรือ custom `fetch` stub"],
      ],
    },
    student: {
      title: "First-Year Note — จำกลุ่มรหัส HTTP Status Code ให้แม่นใน 30 วินาที",
      body: [
        "ไม่ต้องจำเลข HTTP ทั้งหมดทุกตัว ให้จำเพียงกลุ่มหลักที่ใช้จริงทุกวันในงาน AI:",
        "**2xx (`200 OK`, `201 Created`)** = สำเร็จ, **4xx (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`)** = ฝั่งเราส่งคำขอหรือสิทธิ์ผิด (แก้โค้ด/คีย์ ไม่ใช่กดยิงซ้ำ), **429 Too Many Requests** = ยิงถี่เกินโควตา (ชะลอแล้วยิงใหม่ได้), **5xx (`500`, `502`, `503`, `504`)** = ฝั่งเซิร์ฟเวอร์ปลายทางมีปัญหาชั่วคราว (ลองใหม่ได้)",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองสร้างตัวเรียก API จัดหมวดหมู่ทิกเก็ตขนาดเล็กด้วย `httpx.Client` ที่ตั้ง granular timeout แยก status code เป็น custom exceptions และทดสอบครบทุกเคสแบบ 100% ออฟไลน์ด้วย `httpx.MockTransport`",
    steps: [
      {
        title: "1 · นิยาม Custom Exceptions และ Granular Timeout",
        explain:
          "แยก `ClientAPIError` (fail fast) ออกจาก `TransientAPIError` (retryable) พร้อมฟังก์ชันช่วยอ่าน header `Retry-After` อย่างปลอดภัย",
        code: {
          language: "python",
          filename: "worked_d013.py",
          code: `import httpx

DEFAULT_TIMEOUT = httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)


class APIError(Exception):
    pass


class ClientAPIError(APIError):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(f"HTTP {status_code}: {detail}")
        self.status_code = status_code


class TransientAPIError(APIError):
    def __init__(
        self,
        detail: str,
        status_code: int | None = None,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.retry_after = retry_after


def parse_retry_after(value: str | None) -> float | None:
    if value is None:
        return None
    try:
        seconds = float(value.strip())
        return seconds if seconds >= 0 else None
    except ValueError:
        return None`,
        },
        output: `# ประกาศ exception hierarchy และตัวแปลง Retry-After เรียบร้อย`,
      },
      {
        title: "2 · ห่อ `httpx.Client` เป็น Wrapper ที่จับ Timeout และแยก Status Code",
        explain:
          "เปิด `httpx.Client` ที่รองรับการฉีด `transport` เพื่อใช้ของจริงตอนรันและฉีด `MockTransport` ตอนเทสต์ โดยจับ `httpx.TimeoutException` และ `httpx.NetworkError` แปลงเป็น `TransientAPIError`",
        code: {
          language: "python",
          filename: "worked_d013.py",
          code: `class ClassifierClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: httpx.Timeout = DEFAULT_TIMEOUT,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self._client = httpx.Client(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=timeout,
            transport=transport,
        )

    def __enter__(self) -> "ClassifierClient":
        return self

    def __exit__(self, *args: object) -> None:
        self._client.close()

    def classify(self, text: str) -> dict:
        try:
            resp = self._client.post("/v1/classify", json={"text": text})
        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            raise TransientAPIError(f"Network/timeout failure: {exc}") from exc

        if 200 <= resp.status_code < 300:
            return resp.json()
        if resp.status_code in (408, 429) or resp.status_code >= 500:
            raise TransientAPIError(
                f"Transient HTTP {resp.status_code}",
                status_code=resp.status_code,
                retry_after=parse_retry_after(resp.headers.get("Retry-After")),
            )
        raise ClientAPIError(resp.status_code, resp.text[:200])`,
        },
        output: `# ClassifierClient พร้อมใช้งานผ่าน with-statement และรองรับ MockTransport`,
      },
      {
        title: "3 · จำลอง 200, 401, 429 และ ReadTimeout ด้วย `httpx.MockTransport`",
        explain:
          "เขียน handler จำลองหลายสถานการณ์ตามข้อความที่ส่งเข้าไป แล้วตรวจสอบว่าแต่ละเคสคืนค่าหรือโยน exception ชนิดที่ถูกต้อง",
        code: {
          language: "python",
          filename: "worked_d013.py",
          code: `def mock_handler(request: httpx.Request) -> httpx.Response:
    if request.headers.get("Authorization") != "Bearer valid-key":
        return httpx.Response(401, json={"error": "invalid_key"})
    body = request.read().decode("utf-8")
    if "quota" in body:
        return httpx.Response(429, headers={"Retry-After": "4"}, json={"error": "rate_limit"})
    if "slow" in body:
        raise httpx.ReadTimeout("Model took too long", request=request)
    return httpx.Response(200, json={"label": "billing", "confidence": 0.94})


transport = httpx.MockTransport(mock_handler)

with ClassifierClient("https://api.example.test", "valid-key", transport=transport) as cli:
    print("200 OK ->", cli.classify("ขอใบกำกับภาษี"))
    for case in ["quota hit", "slow request"]:
        try:
            cli.classify(case)
        except TransientAPIError as err:
            print(f"Transient ({case}) -> {err} | retry_after={err.retry_after}")

with ClassifierClient("https://api.example.test", "wrong-key", transport=transport) as bad_cli:
    try:
        bad_cli.classify("สวัสดี")
    except ClientAPIError as err:
        print(f"Fail-fast -> {err} | status={err.status_code}")`,
        },
        output: `200 OK -> {'label': 'billing', 'confidence': 0.94}
Transient (quota hit) -> Transient HTTP 429 | retry_after=4.0
Transient (slow request) -> Network/timeout failure: Model took too long | retry_after=None
Fail-fast -> HTTP 401: {"error": "invalid_key"} | status=401`,
      },
    ],
    gotcha:
      "ข้อควรระวังของ `httpx.Response.raise_for_status()`: มันโยน `httpx.HTTPStatusError` ชนิดเดียวให้ทั้ง 400, 401, 429 และ 503 — ถ้าคุณใช้ `raise_for_status()` ตรง ๆ โดยไม่แยก status code ชั้น retry จะแยกไม่ออกว่าอันไหนควรลองใหม่และอันไหนควร fail fast!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `ticket_api_client.py` สำหรับส่งทิกเก็ตภาษาไทยไปวิเคราะห์ผ่าน `httpx.Client` โดยกำหนด granular timeout แยก `ClientAPIError` vs `TransientAPIError` และรองรับการทดสอบแบบออฟไลน์ผ่าน `httpx.MockTransport`",
    requirements: [
      "ประกาศ `DEFAULT_TIMEOUT = httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)`",
      "สร้าง custom exceptions: `APIError(Exception)`, `ClientAPIError(APIError)` (เก็บ `status_code: int`) และ `TransientAPIError(APIError)` (เก็บ `status_code: int | None = None` และ `retry_after: float | None = None`)",
      "สร้างคลาส `TicketAPIClient` ที่ใช้ `httpx.Client` เป็น context manager (`__enter__`, `__exit__`), รับ `base_url`, `api_key`, `timeout=DEFAULT_TIMEOUT`, `transport=None` และแนบ header `Authorization: Bearer <api_key>`",
      "สร้างเมธอด `analyze_ticket(self, ticket_id: str, text: str) -> dict` ที่ส่ง `POST /v1/tickets/analyze` พร้อม JSON `{\"ticket_id\": ticket_id, \"text\": text}`",
      "คืน `resp.json()` เมื่อเป็น 2xx; โยน `TransientAPIError` เมื่อเจอ 408, 429 (พร้อมแปลง `Retry-After` เป็น `float | None`), 5xx หรือ `httpx.TimeoutException` / `httpx.NetworkError`; โยน `ClientAPIError` เมื่อเจอ 4xx อื่น ๆ และโยน `ClientAPIError` เช่นกันเมื่อ 2xx แต่ body ไม่ใช่ JSON ที่ถูกต้อง (`ValueError`)",
    ],
    starter: {
      language: "python",
      filename: "ticket_api_client.py",
      code: `import httpx

DEFAULT_TIMEOUT = httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)


class APIError(Exception):
    """Base exception สำหรับ TicketAPIClient"""


class ClientAPIError(APIError):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(f"HTTP {status_code}: {message}")
        self.status_code = status_code


class TransientAPIError(APIError):
    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.retry_after = retry_after


class TicketAPIClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: httpx.Timeout = DEFAULT_TIMEOUT,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        # TODO: สร้าง self._client = httpx.Client(...) พร้อม Authorization header และ timeout
        raise NotImplementedError

    def __enter__(self) -> "TicketAPIClient":
        return self

    def __exit__(self, *args: object) -> None:
        # TODO: ปิด connection pool ของ self._client
        raise NotImplementedError

    def analyze_ticket(self, ticket_id: str, text: str) -> dict:
        # TODO: ยิง POST /v1/tickets/analyze, จับ timeout/network error และแยก status code
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_api_client.py",
      code: `import json
import httpx
import pytest
from ticket_api_client import (
    ClientAPIError,
    DEFAULT_TIMEOUT,
    TicketAPIClient,
    TransientAPIError,
)


def test_default_timeout_is_granular():
    assert DEFAULT_TIMEOUT.connect == 3.0
    assert DEFAULT_TIMEOUT.read == 15.0
    assert DEFAULT_TIMEOUT.write == 5.0
    assert DEFAULT_TIMEOUT.pool == 5.0


def test_analyze_ticket_success_and_headers():
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["auth"] = request.headers.get("Authorization")
        seen["path"] = request.url.path
        seen["payload"] = json.loads(request.content.decode("utf-8"))
        return httpx.Response(200, json={"ticket_id": "TKT-001", "intent": "billing"})

    with TicketAPIClient(
        "https://api.example.test",
        api_key="secret-123",
        transport=httpx.MockTransport(handler),
    ) as client:
        data = client.analyze_ticket("TKT-001", "ขอใบเสร็จย้อนหลัง")

    assert data == {"ticket_id": "TKT-001", "intent": "billing"}
    assert seen["auth"] == "Bearer secret-123"
    assert seen["path"] == "/v1/tickets/analyze"
    assert seen["payload"] == {"ticket_id": "TKT-001", "text": "ขอใบเสร็จย้อนหลัง"}


@pytest.mark.parametrize("status_code", [400, 401, 403, 404, 422])
def test_permanent_4xx_raises_client_error(status_code: int):
    transport = httpx.MockTransport(
        lambda _req: httpx.Response(status_code, json={"error": "bad request"})
    )
    with TicketAPIClient("https://api.example.test", "k", transport=transport) as client:
        with pytest.raises(ClientAPIError) as exc_info:
            client.analyze_ticket("TKT-002", "ข้อความ")
    assert exc_info.value.status_code == status_code


def test_rate_limit_429_extracts_retry_after():
    transport = httpx.MockTransport(
        lambda _req: httpx.Response(429, headers={"Retry-After": "2.5"}, text="slow down")
    )
    with TicketAPIClient("https://api.example.test", "k", transport=transport) as client:
        with pytest.raises(TransientAPIError) as exc_info:
            client.analyze_ticket("TKT-003", "ข้อความ")
    assert exc_info.value.status_code == 429
    assert exc_info.value.retry_after == 2.5


@pytest.mark.parametrize(
    "exc_factory",
    [
        lambda req: httpx.ReadTimeout("read timed out", request=req),
        lambda req: httpx.ConnectTimeout("connect timed out", request=req),
        lambda req: httpx.ConnectError("dns failed", request=req),
    ],
)
def test_timeout_and_network_errors_are_transient(exc_factory):
    def handler(req: httpx.Request) -> httpx.Response:
        raise exc_factory(req)

    with TicketAPIClient(
        "https://api.example.test", "k", transport=httpx.MockTransport(handler)
    ) as client:
        with pytest.raises(TransientAPIError) as exc_info:
            client.analyze_ticket("TKT-004", "ข้อความ")
    assert exc_info.value.status_code is None


def test_503_and_invalid_json_body():
    t_503 = httpx.MockTransport(lambda _req: httpx.Response(503, text="upstream down"))
    with TicketAPIClient("https://api.example.test", "k", transport=t_503) as client:
        with pytest.raises(TransientAPIError) as exc_info:
            client.analyze_ticket("TKT-005", "ข้อความ")
    assert exc_info.value.status_code == 503

    t_bad_json = httpx.MockTransport(lambda _req: httpx.Response(200, text="<html>oops</html>"))
    with TicketAPIClient("https://api.example.test", "k", transport=t_bad_json) as client:
        with pytest.raises(ClientAPIError):
            client.analyze_ticket("TKT-006", "ข้อความ")
`,
    },
    selfCheck: [
      "`DEFAULT_TIMEOUT` กำหนดครบทั้ง `connect=3.0`, `read=15.0`, `write=5.0`, `pool=5.0`",
      "`TicketAPIClient` ปิด `self._client` ใน `__exit__` เพื่อไม่ให้เกิด resource/socket leak",
      "400/401/403/404/422 โยน `ClientAPIError` ส่วน 408/429/5xx และ `TimeoutException`/`NetworkError` โยน `TransientAPIError`",
      "429 ที่มี header `Retry-After: 2.5` ดึงค่า `retry_after == 2.5` ได้ถูกต้อง (และถ้า header ไม่ใช่ตัวเลขให้คืน `None` ไม่พัง)",
      "รัน `uv run pytest -q` ผ่านครบทุกข้อและ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านเทสต์ทุกกรณีใน `test_ticket_api_client.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `__init__` สร้าง `self._client = httpx.Client(base_url=base_url, headers={\"Authorization\": f\"Bearer {api_key}\"}, timeout=timeout, transport=transport)` และปิดใน `__exit__` ด้วย `self._client.close()`",
      },
      {
        body: "ครอบ `self._client.post(...)` ด้วย `try / except (httpx.TimeoutException, httpx.NetworkError) as exc:` แล้วโยน `TransientAPIError(...) from exc` — จากนั้นค่อยเช็ก `resp.status_code` ตามลำดับ 2xx → 408/429/5xx → 4xx อื่น ๆ",
      },
      {
        body: "โครงสร้างของ `analyze_ticket` เหลือเพียงเติมการเช็ก `resp.status_code` และ parse `Retry-After` ด้วย `try / except ValueError`",
        code: {
          language: "python",
          filename: "hint-d013-l3.py",
          code: `def _parse_retry_after(raw: str | None) -> float | None:
    if raw is None:
        return None
    try:
        val = float(raw.strip())
        return val if val >= 0 else None
    except ValueError:
        return None


def analyze_ticket(self, ticket_id: str, text: str) -> dict:
    try:
        resp = self._client.post(
            "/v1/tickets/analyze",
            json={"ticket_id": ticket_id, "text": text},
        )
    except (httpx.TimeoutException, httpx.NetworkError) as exc:
        raise TransientAPIError(f"Transport failure: {exc}") from exc

    if 200 <= resp.status_code < 300:
        try:
            return resp.json()
        except ValueError as exc:
            raise ClientAPIError(resp.status_code, "Invalid JSON response") from exc
    # TODO: แยก 408/429/>=500 เป็น TransientAPIError และที่เหลือเป็น ClientAPIError
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "เทสต์ทั้งหมดรันในหน่วยความจำผ่าน `httpx.MockTransport` ใช้เวลาไม่ถึง 0.2 วินาที",
    },
  },

  mistakes: [
    {
      title: "ปล่อย `timeout=None` หรือใช้ `httpx.get()` ในลูปโดยไม่สร้าง `Client`",
      symptom: "โปรแกรมค้างเงียบเมื่อเซิร์ฟเวอร์ปลายทางไม่ตอบ หรือช้ากว่าปกติหลายเท่าเพราะเปิด TCP/TLS handshake ใหม่ทุก request",
      fix: "ใช้ `with httpx.Client(timeout=httpx.Timeout(connect=3.0, read=15.0, write=5.0, pool=5.0)) as client:` เสมอ",
    },
    {
      title: "เหมารวมทุก error ด้วย `response.raise_for_status()` โดยไม่แยก 4xx กับ 429/5xx",
      symptom: "ระบบ retry หลงไปยิงซ้ำใส่ 400 Bad Request หรือ 401 Invalid API Key จนเปลืองโควตาและหน่วงผู้ใช้โดยเปล่าประโยชน์",
      fix: "แยก custom exception ชัดเจน: 4xx (ยกเว้น 408/429) โยน `ClientAPIError` เพื่อ fail fast; 408/429/5xx/timeout โยน `TransientAPIError`",
    },
    {
      title: "เรียก `float(response.headers['Retry-After'])` โดยไม่กันกรณีเป็น HTTP-date",
      symptom: "บางเซิร์ฟเวอร์ส่ง `Retry-After: Wed, 21 Oct 2026 07:28:00 GMT` ทำให้โปรแกรมพังด้วย `ValueError` แทนที่จะจัดการ 429 ได้",
      fix: "แปลงใน `try / except ValueError` และคืน `None` เพื่อ fallback ไปใช้ exponential backoff แทน",
    },
    {
      title: "ไม่ปิด `httpx.Client` เมื่อสร้างเก็บไว้ในคลาส",
      symptom: "เมื่อใช้งานนาน ๆ เกิด `ResourceWarning: unclosed socket` หรือไฟล์เดสคริปเตอร์เต็ม",
      fix: "ทำ `__enter__`/`__exit__` หรือเรียก `client.close()` ใน `finally` เสมอ",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อเช็กความเข้าใจเรื่อง `httpx.Client`, Granular Timeouts และการแยก HTTP Status Codes",
    questions: [
      mc(
        "d013-q1",
        "เหตุใดเราจึงควรใช้ `with httpx.Client(...) as client:` แทนการเรียก `httpx.post(url)` ซ้ำ ๆ 50 ครั้งในลูป?",
        [
          ["เพราะ `httpx.post()` ไม่รองรับการส่ง JSON", "`httpx.post()` ส่ง JSON ได้ แต่จะสร้างและปิด connection ใหม่ทุกครั้ง"],
          ["เพราะ `httpx.Client` รีใช้ TCP/TLS connection pool แชร์ config เดียวกัน และปิด socket อัตโนมัติเมื่อออกจากบล็อก", "ถูก — ช่วยลด latency จาก TLS handshake ซ้ำซ้อนและป้องกัน socket leak"],
          ["เพราะ `httpx.Client` จะรีทรายทุก error ให้อัตโนมัติ 5 ครั้ง", "`httpx.Client` ไม่ได้ retry 429/5xx ให้อัตโนมัติ ต้องวางกลยุทธ์ retry เอง (Day 14)"],
          ["เพราะ `httpx.post()` ใช้ได้เฉพาะในฟังก์ชัน `async def`", "`httpx.post()` เป็นแบบ sync ปกติ"],
        ],
        "B",
        "`httpx.Client` จัดการ HTTP keep-alive connection pooling, default headers/base_url/timeout และปิดทรัพยากรอย่างปลอดภัยผ่าน context manager",
        "ข้อดีหลักของการใช้ `with httpx.Client(...) as client:` แทน `httpx.get/post` ในลูปคืออะไร?",
        "รีใช้ TCP/TLS connection pool ลดความหน่วง handshake แชร์ base_url/headers/timeout และปิด socket อัตโนมัติ",
      ),
      mc(
        "d013-q2",
        "สำหรับบริการเรียก {{llm}} ที่เชื่อมต่อเซิร์ฟเวอร์เร็วแต่ต้องรอโมเดลสร้างคำตอบนานถึง 15 วินาที การตั้ง `httpx.Timeout` ข้อใดเหมาะสมที่สุด?",
        [
          ["`httpx.Timeout(None)` เพื่อไม่ให้ตัดการเชื่อมต่อเลย", "อันตรายมาก — หากเครือข่ายค้างเงียบ worker จะค้างตลอดกาล"],
          ["`httpx.Timeout(connect=3.0, read=20.0, write=5.0, pool=5.0)`", "ถูก — ตัดจบเร็วถ้าต่อเซิร์ฟเวอร์ไม่ติด (3s) แต่ให้เวลารอโมเดลตอบกลับเพียงพอ (20s)"],
          ["`httpx.Timeout(connect=30.0, read=1.0, write=5.0, pool=5.0)`", "สลับกัน — `read=1.0` จะทำให้ LLM API เกือบทุกตัว timeout ทันที"],
          ["`httpx.Timeout(0.5)` เท่ากันทุกช่วง", "0.5 วินาทีสั้นเกินไปสำหรับการรอคำตอบจาก LLM"],
        ],
        "B",
        "Granular timeout ช่วยแยกความเสี่ยง: `connect` สั้นเพื่อรู้เร็วว่าปลายทางล่ม ส่วน `read` ยาวพอให้โมเดลประมวลผลคำตอบได้ทัน",
        "ทำไมงานเรียก LLM API จึงนิยมตั้ง `connect` timeout สั้นกว่า `read` timeout?",
        "ถ้าปลายทางล่มควรรู้เร็วภายในไม่กี่วินาที (`connect` สั้น) แต่เมื่อเชื่อมต่อสำเร็จแล้วโมเดลต้องใช้เวลาสร้างคำตอบนานกว่า (`read` ยาว)",
      ),
      mc(
        "d013-q3",
        "API ปลายทางตอบกลับด้วยสถานะ `401 Unauthorized` และ `400 Bad Request` ระบบ Client ควรตัดสินใจอย่างไร?",
        [
          ["ลองยิงซ้ำทันทีอีก 5 ครั้งเผื่อผ่าน", "ผิด — 400/401 เป็นข้อผิดพลาดถาวรฝั่งผู้เรียก ลองซ้ำก็ยังพังเหมือนเดิม"],
          ["โยน `ClientAPIError` เพื่อ **fail fast** ทันทีโดยไม่ retry", "ถูก — คีย์ผิดหรือ payload ผิดต้องรีบแจ้งผู้พัฒนา/ผู้เรียก ไม่ใช่ยิงซ้ำให้เปลืองโควตา"],
          ["แปลงเป็น dict ว่าง `{}` แล้วทำงานต่อเงียบ ๆ", "การกลืน error เงียบทำให้บั๊กถูกซ่อนและเกิดข้อมูลผิดพลาดในปลายทาง"],
          ["รอ `Retry-After` 60 วินาทีแล้วยิงใหม่", "`Retry-After` ใช้กับ 429/503 ไม่ใช่ 400/401"],
        ],
        "B",
        "รหัส 4xx (ยกเว้น 408 Request Timeout และ 429 Too Many Requests) บอกว่าคำขอฝั่งเราผิดพลาด จึงต้อง fail fast และไม่ควร retry",
        "HTTP status code กลุ่มใดควร fail fast และกลุ่มใดเป็น transient error ที่ retry ได้?",
        "Fail fast: 4xx อื่น ๆ (400, 401, 403, 404, 422); Retryable (transient): 408, 429, 5xx และ timeout/network errors",
      ),
      mc(
        "d013-q4",
        "ข้อใดคือวิธีทดสอบการรับมือ `429 Too Many Requests` และ `httpx.ReadTimeout` ใน {{pytest}} ที่เร็วและเสถียรที่สุด?",
        [
          ["ยิง API จริงรัว ๆ 1,000 ครั้งจนกว่าผู้ให้บริการจะส่ง 429 กลับมา", "ช้า เสียเงิน อาจโดนแบนบัญชี และผลไม่แน่นอน"],
          ["ฉีด `httpx.MockTransport(handler)` เข้าไปใน `httpx.Client(transport=...)` เพื่อจำลอง 429 และโยน `httpx.ReadTimeout` โดยตรง", "ถูก — รันบนเครื่องได้ 100% ออฟไลน์ เร็วระดับมิลลิวินาที และทดสอบเส้นทางโค้ดจริงของ `httpx` ครบถ้วน"],
          ["ข้ามการเขียนเทสต์ error แล้วค่อยไปลุ้นใน production", "ปัญหา 429/timeout เกิดขึ้นจริงเสมอในระบบ AI — ต้องทดสอบก่อน deploy"],
          ["ใช้ `time.sleep(20)` ในเทสต์เพื่อรอ timeout จริง", "ทำให้ชุดเทสต์ช้าโดยไม่จำเป็น ทั้งที่ `MockTransport` โยน `ReadTimeout` ได้ทันที"],
        ],
        "B",
        "`httpx.MockTransport` เป็นเครื่องมือในตัวของ `httpx` ที่ให้คุณทดสอบ header, JSON body, status code และ transport exceptions ได้ครบโดยไม่ต้องพึ่งเครือข่ายจริง",
        "`httpx.MockTransport` มีประโยชน์อย่างไรในการทดสอบ API Client?",
        "ช่วยจำลอง HTTP response (200/401/429/503) และ network/timeout exceptions แบบออฟไลน์ เร็ว และทำซ้ำได้ 100%",
      ),
    ],
  },

  takeaways: [
    "สร้าง `httpx.Client` ผ่าน context manager (`with`) เพื่อรีใช้ TCP/TLS connection pool และปิด socket อย่างปลอดภัย",
    "กำหนด `httpx.Timeout(connect=..., read=..., write=..., pool=...)` แบบชัดเจนเสมอ — ห้ามปล่อยรอไม่มีกำหนด",
    "แยก status code เป็น custom exceptions: **4xx (ยกเว้น 408/429) → `ClientAPIError` (fail fast)** ส่วน **408/429/5xx/timeout → `TransientAPIError` (retryable)**",
    "ใช้ `httpx.MockTransport` จำลองทุกเคสทั้ง 200, 401, 429, 503 และ `ReadTimeout` ใน `pytest` แบบออฟไลน์ 100%",
  ],

  reviewCards: [
    rc(
      "d013-rc-1",
      "พารามิเตอร์ 4 ช่วงของ `httpx.Timeout` คืออะไร และสำหรับ LLM API ช่วงไหนควรสั้น ช่วงไหนควรยาว?",
      "`connect`, `read`, `write`, `pool` — ควรตั้ง `connect` สั้น (เช่น 3s) เพื่อรู้เร็วว่าปลายทางล่ม และตั้ง `read` ยาวกว่า (เช่น 15–30s) ให้โมเดลสร้างคำตอบทัน",
    ),
    rc(
      "d013-rc-2",
      "ทำไมจึงไม่ควรใช้ `response.raise_for_status()` แล้วสั่ง retry ทุก `HTTPStatusError`?",
      "เพราะ `HTTPStatusError` เหมารวมทั้ง 400/401 (ผิดถาวร ห้าม retry) กับ 429/503 (ชั่วคราว retry ได้) ไว้ด้วยกัน ควรแยกเป็น `ClientAPIError` vs `TransientAPIError`",
    ),
    rc(
      "d013-rc-3",
      "จะทดสอบการรับมือ `429` และ `ReadTimeout` ของ `httpx.Client` โดยไม่ต่ออินเทอร์เน็ตได้อย่างไร?",
      "ฉีด `httpx.MockTransport(handler)` ผ่านพารามิเตอร์ `transport=` ของ `httpx.Client` แล้วคืน `httpx.Response(429, ...)` หรือ `raise httpx.ReadTimeout(...)` ใน handler",
    ),
  ],

  sources: [
    { label: "HTTPX Documentation — Advanced Usage (Client & Connection Pooling)", href: "https://www.python-httpx.org/advanced/clients/" },
    { label: "HTTPX Documentation — Timeouts", href: "https://www.python-httpx.org/advanced/timeouts/" },
    { label: "HTTPX Documentation — MockTransport", href: "https://www.python-httpx.org/advanced/transports/#mock-transports" },
    { label: "MDN Web Docs — HTTP Response Status Codes", href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
  ],

  glossary: [
    "httpx",
    "fail-fast",
    "custom-exception",
    "rate-limit",
    "mocking",
    "payload",
    "llm",
    "pytest",
  ],
});
