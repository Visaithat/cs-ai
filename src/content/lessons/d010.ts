import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D010 — Phase 1 / Block B03
 * Parametrized Tests & Mocking External Calls.
 */
export const d010: Lesson = defineLesson({
  day: 10,
  titleTh: "เทสต์หลายเคสด้วย @pytest.mark.parametrize และจำลอง API ด้วย Mocking",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% ไม่ต้องใช้ API key · ขยายเคสขอบภาษาไทยด้วยตาราง parametrize และจำลอง timeout/429/500 แบบฟรีและนิ่ง 100%",
  icon: "test-tubes",
  visual: {
    id: "mock-parametrize",
    title: "@pytest.mark.parametrize + Mocking — เทสต์เร็ว ฟรี และคุมผล 100%",
    caption: "กดสลับดูตาราง parametrize กับการแทนที่การยิง API จริงด้วย monkeypatch / mock",
    alt: "แผนภาพการทดสอบแบบ parametrize และการทำ mocking แทนการเรียก API ภายนอก",
  },
  requiresApiKey: false,
  tools: ["pytest", "uv", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ตรวจจับ Edge Cases ของข้อความภาษาไทยแบบครบตาราง",
      body: "ข้อความลูกค้าในโลกจริงมีทั้งภาษาไทยล้วน, คำทับศัพท์ปนอังกฤษ (code-switching), เลขไทย, อีโมจิ และช่องว่างประหลาด การเขียนฟังก์ชันเทสต์ซ้ำ 10 รอบทำให้ดูแลยากและมักหลงลืมเคสสำคัญ",
      lessonNote: "วันนี้เราใช้ {{parametrize|@pytest.mark.parametrize}} ขยายอินพุตเป็นตารางเคสทดสอบที่เพิ่มเคสใหม่ได้ใน 1 บรรทัด",
    },
    {
      node: 2,
      heading: "ทดสอบโค้ดที่เรียก LLM API โดยไม่เสียเงินและไม่พึ่งอินเทอร์เน็ต",
      body: "หาก unit test ยิงไปยัง {{llm}} API จริงทุกครั้งที่รัน `pytest` ชุดเทสต์จะช้า เสียค่า token และพังสุ่มเมื่อเครือข่ายสะดุดหรือคำตอบของโมเดลเปลี่ยนไป",
      lessonNote: "{{mocking}} ด้วย `monkeypatch` และ Fake/Stub Client ทำให้เราควบคุมผลลัพธ์ได้ 100% ในระดับมิลลิวินาทีด้วยต้นทุน 0 บาท",
    },
    {
      node: 4,
      heading: "จำลองความล้มเหลวของระบบปลายทาง (Timeout, 429, 500)",
      body: "ใน production เซิร์ฟเวอร์ API ย่อมมีช่วงล่ม (500), ติด {{rate-limit}} (429) หรือตอบช้าจน timeout คุณไม่สามารถรอให้ API จริงล่มเพื่อทดสอบโค้ดรับมือ error ได้",
      lessonNote: "การจำลอง error response แบบสั่งได้เปิดทางตรงสู่การทดสอบ retry และ circuit breaker ใน Block B04",
    },
  ],

  objectives: [
    "**เขียนตารางเคสทดสอบ** ด้วย `@pytest.mark.parametrize` (รวมถึง `pytest.param(..., id=...)`) เพื่อครอบคลุม edge cases ภาษาไทยโดยไม่คัดลอกโค้ดซ้ำ",
    "**แยกแยะและเลือกใช้** ระหว่าง `monkeypatch` กับ Fake/Stub Client (Dependency Injection) เพื่อแทนที่การเรียก API ภายนอกใน unit test",
    "**จำลองสถานการณ์ความล้มเหลว** เช่น `TimeoutError`, HTTP `429` ({{rate-limit}}) และ HTTP `500` แบบออฟไลน์เพื่อให้ชุดเทสต์รันเร็ว ฟรี และให้ผลคงที่ 100%",
  ],

  prerequisites: [
    "เขียน unit test พื้นฐานด้วย `pytest`, `pytest.raises` และ `@pytest.fixture` ได้แล้ว (จาก D9)",
    "เข้าใจ {{custom-exception}} และ {{type-hint}} ของฟังก์ชันและ `Protocol` เบื้องต้น",
    "มี `uv` พร้อม `pytest` และ `ruff` บนเครื่อง — รันออฟไลน์ได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "ตั้งโฟลเดอร์ฝึกปฏิบัติ Day 10 ด้วย {{uv}} โดยใช้เฉพาะ {{pytest}} และ {{ruff}} — วันนี้เราจะจำลองการเรียก API ทั้งหมดบนเครื่องโดยไม่ต้องต่ออินเทอร์เน็ต",
    commands: `uv init ai-day10-mocking && cd ai-day10-mocking
uv add --dev pytest ruff

# ตรวจเวอร์ชันเครื่องมือ
uv run pytest --version`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day10-mocking` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pytest` และ `ruff` ในกลุ่ม `--dev`"],
      ["verify", "ยืนยันว่า `uv run pytest --version` ทำงานได้ปกติ"],
    ],
    note: "แนวคิด Fake Client และ `monkeypatch` ในวันนี้จะถูกนำไปใช้คู่กับ `httpx.MockTransport` ใน Block B04 และใช้ทดสอบ LLM wrapper ใน Phase 3",
  },

  concepts: [
    {
      id: "pytest-parametrize-matrices",
      title: "1 · ขยายเคสทดสอบอย่างเป็นระบบด้วย @pytest.mark.parametrize",
      paragraphs: [
        "ปัญหาของการเขียน `for case in cases: assert ...` ไว้ในเทสต์เดียวคือ **เมื่อเคสที่ 2 พัง ลูปจะหยุดทันที** ทำให้คุณไม่รู้ว่าเคสที่ 3 ถึง 10 ผ่านหรือพังด้วยหรือไม่ และรายงานของ `pytest` จะบอกเพียงว่า 1 เทสต์ล้มเหลวโดยไม่แยกชื่อเคสให้",
        "{{parametrize|@pytest.mark.parametrize}} แก้ปัญหานี้ด้วยการสร้างเคสย่อยแยกอิสระให้แต่ละแถวในตาราง: `pytest` จะรันครบทุกแถวแม้บางแถวจะพัง และแสดงผลแยกรายเคสอย่างชัดเจน นอกจากนี้การใส่ `ids=[...]` หรือ `pytest.param(..., id=\"thai-code-switch\")` ยังช่วยให้คุณสั่งรันเฉพาะเคสที่สนใจด้วย `pytest -k thai-code-switch` ได้ทันที",
      ],
      analogy:
        "เหมือนตารางตรวจสุขภาพที่มีช่องแยกทีละรายการ (ความดัน, น้ำตาล, ไขมัน) — หากค่าน้ำตาลเกินเกณฑ์ หมอก็ยังตรวจไขมันต่อจนครบ ไม่ใช่หยุดตรวจทั้งใบตั้งแต่บรรทัดแรก",
      code: {
        language: "python",
        filename: "test_priority_matrix.py",
        code: `import pytest


def detect_priority(message: str) -> str:
    text = message.lower()
    if any(k in text for k in ("ด่วน", "urgent", "โอนซ้ำ", "เข้าไม่ได้")):
        return "high"
    if any(k in text for k in ("ใบกำกับภาษี", "refund", "คืนเงิน")):
        return "medium"
    return "normal"


@pytest.mark.parametrize(
    ("message", "expected"),
    [
        pytest.param("โอนเงินซ้ำ 2 รอบครับ ช่วยดูด่วน", "high", id="thai-urgent"),
        pytest.param("URGENT: login เข้าไม่ได้เลย", "high", id="code-switch-urgent"),
        pytest.param("ขอใบกำกับภาษีเดือนนี้หน่อยครับ", "medium", id="thai-tax-invoice"),
        pytest.param("สอบถามเวลาทำการวันเสาร์", "normal", id="general-inquiry"),
        pytest.param("   ", "normal", id="whitespace-fallback"),
    ],
)
def test_detect_priority_matrix(message: str, expected: str) -> None:
    assert detect_priority(message) == expected`,
        caption: "แต่ละ `pytest.param` จะกลายเป็น 1 test item อิสระพร้อมชื่อ `id` ที่อ่านง่ายในรายงานของ `pytest -v`",
      },
      whyTitle: "Why this matters — เก็บ Regression Case ทุกครั้งที่เจอบั๊กจากผู้ใช้จริง",
      whyParagraphs: [
        "ในระบบ AI ภาษาไทย คุณจะเจอข้อความแปลกใหม่จากลูกค้าเสมอ เช่น พิมพ์ปนภาษาอังกฤษ, ไม่มีเว้นวรรค หรือมีคำย่อ เมื่อแก้บั๊กแล้วให้เพิ่ม 1 แถว `pytest.param(...)` ลงตารางทันที",
        "ตารางนี้จะค่อย ๆ เติบโตเป็นชุดตรวจ regression ที่รันจบในไม่กี่มิลลิวินาที และเป็นรากฐานทางความคิดของ Golden Dataset ใน Phase 5",
      ],
    },
    {
      id: "monkeypatch-and-fakes",
      title: "2 · Mocking ด้วย monkeypatch vs Fake/Stub Client (Dependency Injection)",
      paragraphs: [
        "{{mocking}} คือการแทนที่ส่วนประกอบภายนอกที่ช้า เสียเงิน หรือควบคุมไม่ได้ (เช่น {{httpx}} ที่ยิงข้ามเน็ต, นาฬิกาของระบบ, ตัวแปร environment หรือ {{llm}} SDK) ด้วยตัวแทนจำลองในระหว่างรันเทสต์ เพื่อให้ unit test ทดสอบเฉพาะ \"ตรรกะของเรา\" เท่านั้น",
        "ในโลก Python มี 2 ท่าหลักที่ใช้คู่กัน: (1) **Dependency Injection + Fake/Stub Client** — ออกแบบฟังก์ชันให้รับ `client` เป็นพารามิเตอร์ตาม `Protocol` แล้วส่ง `FakeClient` ที่เขียนเองง่าย ๆ เข้าไปในเทสต์ (โค้ดสะอาด อ่านง่าย ไม่ผูกกับรายละเอียดภายใน) และ (2) **`monkeypatch`** — built-in fixture ของ `pytest` สำหรับสลับฟังก์ชันหรือ env var ชั่วคราวในโมดูลที่แก้ลายเซ็นไม่ได้ โดย `pytest` จะคืนค่าเดิมให้อัตโนมัติหลังจบเทสต์",
      ],
      analogy:
        "เหมือนนักบินฝึกหัดซ้อมรับมือเครื่องยนต์ดับในห้อง Flight Simulator — แผงหน้าปัดและขั้นตอนตัดสินใจของนักบินเป็นของจริง 100% แต่เครื่องยนต์และสภาพอากาศถูกจำลองขึ้นเพื่อให้ซ้อมได้อย่างปลอดภัยและฟรี",
      bullets: [
        "**Fake / Stub via Injection (แนะนำเป็นอันดับแรก)** — ส่ง `FakeLLMClient(reply=...)` เข้าไปทาง argument โค้ดไม่ต้องพึ่ง path string ของโมดูลและไม่เปราะบางตอนรีแฟกเตอร์",
        "**`monkeypatch.setattr(module, 'fn', fake_fn)`** — ใช้เมื่อต้องสลับฟังก์ชันในโมดูลหรือ environment variable (`monkeypatch.setenv`) ชั่วคราวโดยคืนค่าเดิมอัตโนมัติ",
        "**กฎทองของ Mocking** — จง mock เฉพาะ **ขอบเขตภายนอก (boundary)** เช่น HTTP call หรือ clock อย่า mock ตรรกะภายในของตัวเองจนเทสต์ไม่ได้ตรวจโค้ดจริง",
      ],
      code: {
        language: "python",
        filename: "fake_vs_monkeypatch.py",
        code: `from typing import Protocol


class ClassifierClient(Protocol):
    def classify(self, text: str) -> dict[str, object]: ...


def route_ticket(text: str, client: ClassifierClient) -> str:
    response = client.classify(text)
    label = str(response.get("label", "general"))
    confidence = float(response.get("confidence", 0.0))
    if confidence < 0.7:
        return "human_review"
    return label


class StubClassifier:
    """Fake/Stub ขนาดกะทัดรัด คุมผลลัพธ์ได้ 100% และเก็บประวัติการเรียกได้"""

    def __init__(self, payload: dict[str, object]) -> None:
        self.payload = payload
        self.calls: list[str] = []

    def classify(self, text: str) -> dict[str, object]:
        self.calls.append(text)
        return self.payload`,
        caption: "การรับ `client: ClassifierClient` ผ่าน Dependency Injection ทำให้เขียนเทสต์ด้วย `StubClassifier` ได้ตรงไปตรงมาโดยไม่ต้องแฮ็กโครงสร้างภายใน",
      },
      whyTitle: "Why this matters — ทำไม Over-mocking ถึงอันตราย",
      whyParagraphs: [
        "มือใหม่มักใช้ `unittest.mock.patch` แทนที่ทุกฟังก์ชันย่อยข้างในและเช็กแค่ `assert_called_once()` ผลคือพอเปลี่ยนชื่อฟังก์ชันภายในเทสต์พังทั้งที่พฤติกรรมยังถูก หรือแย่กว่านั้นคือเทสต์ผ่านทั้งที่โค้ดจริงพังเพราะไม่ได้รันของจริงเลย",
        "การ mock เฉพาะ I/O boundary ด้วย Stub/Fake หรือ `monkeypatch` ช่วยให้คุณทดสอบผลลัพธ์จริง (behavior) ไม่ใช่รายละเอียดการเขียนโค้ด (implementation details)",
      ],
    },
    {
      id: "simulating-failure-paths",
      title: "3 · จำลอง Timeout, HTTP 429 และ HTTP 500 เพื่อทดสอบความทนทาน",
      paragraphs: [
        "เส้นทางที่เกิดอุบัติเหตุบ่อยที่สุดในแอป AI ไม่ใช่ตอน API ตอบกลับ `200 OK` แต่คือตอน API ช้าเกินกำหนด (`TimeoutError`), ติดโควตา {{rate-limit}} (`429 Too Many Requests`) หรือเซิร์ฟเวอร์ปลายทางล่มชั่วคราว (`500` / `503`)",
        "เมื่อเราสร้าง Fake Client ที่รับพารามิเตอร์ `error: Exception | None` หรือสถานะ HTTP จำลอง เราสามารถจับคู่กับ `@pytest.mark.parametrize` เพื่อทดสอบทุกโหมดความล้มเหลวในครั้งเดียว — ตรวจให้มั่นใจว่าโค้ดของเราแปลง error ดิบเป็น {{custom-exception}} ที่สื่อความหมาย หรือตกกลับไปใช้ fallback อย่างปลอดภัย ({{fail-fast}} / graceful degradation)",
      ],
      analogy:
        "เหมือนการซ้อมดับเพลิงในตึก — เราไม่ต้องรอให้ไฟไหม้จริงถึงจะรู้ว่าทางหนีไฟเปิดออกไหม แค่กดสัญญาณจำลองก็ตรวจได้ครบทุกชั้น",
      code: {
        language: "python",
        filename: "test_failure_modes.py",
        code: `import pytest


class UpstreamServiceError(RuntimeError):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code


class RateLimitedError(UpstreamServiceError):
    """โยนเมื่อ API ตอบกลับ 429"""


def call_with_error_mapping(fetch_fn, prompt: str) -> str:
    try:
        status, body = fetch_fn(prompt)
    except TimeoutError as exc:
        raise UpstreamServiceError(504, "API ตอบสนองช้าเกินกำหนด") from exc

    if status == 429:
        raise RateLimitedError(429, "เกินโควตาการเรียก API (rate limit)")
    if status >= 500:
        raise UpstreamServiceError(status, f"เซิร์ฟเวอร์ปลายทางขัดข้อง ({status})")
    return body


@pytest.mark.parametrize(
    ("status", "expected_exc"),
    [
        pytest.param(429, RateLimitedError, id="http-429-rate-limit"),
        pytest.param(500, UpstreamServiceError, id="http-500-server-error"),
        pytest.param(503, UpstreamServiceError, id="http-503-unavailable"),
    ],
)
def test_error_mapping_for_http_failures(
    status: int,
    expected_exc: type[Exception],
) -> None:
    def fake_fetch(_prompt: str) -> tuple[int, str]:
        return status, "error"

    with pytest.raises(expected_exc):
        call_with_error_mapping(fake_fetch, "สรุปทิกเก็ตนี้")`,
        caption: "รวมพลัง `parametrize` + fake function เพื่อไล่ตรวจทุก status code ที่พังได้โดยไม่ต้องยิงเครือข่ายจริง",
      },
      whyTitle: "Why this matters — ปูทางสู่ Resilient Client ใน Block B04",
      whyParagraphs: [
        "ในสัปดาห์หน้า (D13–D16) คุณจะสร้าง HTTP client ที่มี timeout, exponential backoff retry และ circuit breaker — ทั้งหมดนั้นแทบจะทดสอบไม่ได้เลยถ้าไม่รู้จักการจำลอง `429`, `500` และ `TimeoutError`",
        "เมื่อจำลองความล้มเหลวได้ในระดับมิลลิวินาที คุณจะมั่นใจได้จริงว่าโค้ด fallback ทำงานถูกต้องก่อนส่งถึงมือลูกค้า",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ pytest parametrize & monkeypatch กับ Vitest / Jest",
      body: [
        "นักพัฒนาเว็บจะคุ้นเคยกับ `test.each` และ `vi.spyOn` — ในฝั่ง Python `pytest` ทำหน้าที่เดียวกันด้วยไวยากรณ์ที่กระชับมาก:",
      ],
      table: [
        ["`@pytest.mark.parametrize(('a', 'b'), [...])`", "`test.each([...])('case %s', (a, b) => ...)`"],
        ["`pytest.param(x, y, id='thai-case')`", "ตั้งชื่อเคสใน template string ของ `test.each`"],
        ["`monkeypatch.setattr(mod, 'fn', fake)`", "`vi.spyOn(mod, 'fn').mockImplementation(fake)`"],
        ["`monkeypatch.setenv('API_KEY', 'test')`", "`vi.stubEnv('API_KEY', 'test')`"],
        ["`StubClient` ที่ตรง `Protocol` (DI)", "ส่ง mock object ที่ implement TypeScript `interface`"],
      ],
    },
    student: {
      title: "First-Year Note — Stub vs Mock vs Fake ต่างกันอย่างไรแบบเข้าใจง่าย",
      body: [
        "ในตำราทดสอบซอฟต์แวร์มักเรียกของจำลองรวม ๆ ว่า **Test Doubles** ซึ่ง 3 คำที่เจอบ่อยคือ: **Stub** (คืนค่าที่ตั้งไว้ล่วงหน้า เช่น คืน `{\"label\": \"billing\"}` เสมอ), **Fake** (จำลองการทำงานอย่างง่าย เช่น ใช้ `dict` ใน RAM แทนฐานข้อมูลจริง) และ **Mock** (บันทึกและตรวจว่าถูกเรียกด้วย argument อะไร กี่ครั้ง)",
        "ไม่ต้องเครียดกับการจำคำศัพท์เป๊ะ ๆ — หลักคิดสำคัญมีแค่ข้อเดียวคือ: **ตัดการพึ่งพาเครือข่ายและ API จริงออกใน unit test เพื่อให้เทสต์เร็ว ฟรี และให้ผลเดิมทุกครั้ง**",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีฟังก์ชัน `summarize_ticket_with_fallback` ที่เรียกบริการสรุปข้อความภายนอก หากบริการตอบช้า (`TimeoutError`), ติด `429` หรือล่ม (`500`) ระบบต้องไม่แครชแต่คืนข้อความ fallback จากต้นฉบับภาษาไทยแทน ลองดูวิธีทดสอบทั้ง `monkeypatch`, Fake Client และ `parametrize`",
    steps: [
      {
        title: "1 · เขียนบริการเป้าหมายที่รองรับการฉีด Client และอ่าน Env Config",
        explain:
          "รับ `client` ที่ตรงกับ `SummarizerClient` Protocol เพื่อทดสอบง่าย และอ่าน `FALLBACK_PREFIX` จาก environment variable เพื่อแสดงการใช้ `monkeypatch.setenv` ในขั้นถัดไป",
        code: {
          language: "python",
          filename: "ticket_summarizer.py",
          code: `import os
from typing import Protocol


class ApiStatusError(RuntimeError):
    def __init__(self, status_code: int) -> None:
        super().__init__(f"Upstream HTTP {status_code}")
        self.status_code = status_code


class SummarizerClient(Protocol):
    def summarize(self, text: str) -> str: ...


def summarize_ticket_with_fallback(
    message_th: str,
    client: SummarizerClient,
) -> dict[str, object]:
    cleaned = " ".join(message_th.split())
    if not cleaned:
        raise ValueError("ข้อความห้ามว่าง")

    try:
        summary = client.summarize(cleaned)
        return {"summary": summary, "used_fallback": False, "reason": None}
    except TimeoutError:
        reason = "timeout"
    except ApiStatusError as exc:
        reason = f"http_{exc.status_code}"

    prefix = os.getenv("FALLBACK_PREFIX", "[สรุปอัตโนมัติไม่พร้อมใช้งาน]")
    snippet = cleaned[:40]
    return {"summary": f"{prefix} {snippet}", "used_fallback": True, "reason": reason}`,
        },
        output: `# สร้าง ticket_summarizer.py ที่มีทั้ง happy path และ fallback สำหรับ timeout / HTTP error`,
      },
      {
        title: "2 · สร้าง Fake Client ที่จำลองได้ทั้งคำตอบปกติและ Error",
        explain:
          "สร้าง `FakeSummarizer` ที่กำหนดได้ว่าจะคืนข้อความสรุป หรือโยน `TimeoutError` / `ApiStatusError(429)` / `ApiStatusError(500)` พร้อมนับจำนวนครั้งที่ถูกเรียก",
        code: {
          language: "python",
          filename: "test_ticket_summarizer.py",
          code: `import pytest
from ticket_summarizer import ApiStatusError, summarize_ticket_with_fallback


class FakeSummarizer:
    def __init__(self, reply: str = "", error: Exception | None = None) -> None:
        self.reply = reply
        self.error = error
        self.seen_inputs: list[str] = []

    def summarize(self, text: str) -> str:
        self.seen_inputs.append(text)
        if self.error is not None:
            raise self.error
        return self.reply


def test_summarize_happy_path() -> None:
    fake = FakeSummarizer(reply="ลูกค้าขอตรวจสอบยอดโอนซ้ำ")
    result = summarize_ticket_with_fallback("  โอนเงินซ้ำ   2 รอบครับ ", fake)

    assert result == {
        "summary": "ลูกค้าขอตรวจสอบยอดโอนซ้ำ",
        "used_fallback": False,
        "reason": None,
    }
    assert fake.seen_inputs == ["โอนเงินซ้ำ 2 รอบครับ"]`,
        },
        output: `# สังเกตว่าเราเช็กได้ด้วยว่า fake.seen_inputs ได้รับข้อความที่ทำความสะอาดแล้วจริง`,
      },
      {
        title: "3 · ผสาน @pytest.mark.parametrize กับ monkeypatch.setenv",
        explain:
          "ใช้ `parametrize` ทดสอบ Timeout, 429 และ 500 ในฟังก์ชันเดียว และใช้ `monkeypatch.setenv` ทดสอบการปรับ `FALLBACK_PREFIX` โดยไม่กระทบ environment ของเครื่องจริง",
        code: {
          language: "python",
          filename: "test_ticket_summarizer.py",
          code: `@pytest.mark.parametrize(
    ("error", "expected_reason"),
    [
        pytest.param(TimeoutError("slow"), "timeout", id="timeout"),
        pytest.param(ApiStatusError(429), "http_429", id="rate-limit-429"),
        pytest.param(ApiStatusError(500), "http_500", id="server-500"),
    ],
)
def test_summarize_falls_back_on_upstream_failures(
    error: Exception,
    expected_reason: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("FALLBACK_PREFIX", "[FALLBACK]")
    fake = FakeSummarizer(error=error)

    result = summarize_ticket_with_fallback("แอปเด้งออกตอนอัปโหลดสลิป", fake)

    assert result["used_fallback"] is True
    assert result["reason"] == expected_reason
    assert result["summary"] == "[FALLBACK] แอปเด้งออกตอนอัปโหลดสลิป"`,
        },
        output: `$ uv run pytest -v
collected 4 items

test_ticket_summarizer.py::test_summarize_happy_path PASSED                         [ 25%]
test_ticket_summarizer.py::test_summarize_falls_back_on_upstream_failures[timeout] PASSED [ 50%]
test_ticket_summarizer.py::test_summarize_falls_back_on_upstream_failures[rate-limit-429] PASSED [ 75%]
test_ticket_summarizer.py::test_summarize_falls_back_on_upstream_failures[server-500] PASSED [100%]

============================== 4 passed in 0.03s ==============================`,
      },
    ],
    gotcha:
      "จุดที่พลาดบ่อยเมื่อใช้ `monkeypatch.setattr`: ต้อง patch ใน **โมดูลที่เรียกใช้งาน (where it is looked up)** ไม่ใช่โมดูลต้นทางที่นิยาม — เช่น ถ้า `service.py` เขียน `from provider import call_api` คุณต้อง patch `monkeypatch.setattr(service, 'call_api', fake)` ไม่ใช่ `provider.call_api`!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `ticket_router.py` ที่มีฟังก์ชันจัดหมวดหมู่ทิกเก็ตภาษาไทยแบบ rule-based และฟังก์ชันเรียก classifier client ภายนอก พร้อมชุดเทสต์ที่ใช้ทั้ง `@pytest.mark.parametrize`, Fake Client และ `monkeypatch`",
    requirements: [
      "ใน `ticket_router.py` สร้าง `UpstreamError(RuntimeError)` ที่มีแอตทริบิวต์ `status_code: int` และสร้าง `Protocol` ชื่อ `TagClient` ที่มีเมธอด `predict_tag(self, text: str) -> str`",
      "สร้าง `classify_channel_priority(channel: str, message_th: str) -> str` ตามกฎ: ถ้าข้อความมีคำว่า `\"ด่วน\"`, `\"urgent\"` หรือ `\"โอนซ้ำ\"` (ไม่สนตัวพิมพ์เล็ก-ใหญ่) คืน `\"p1\"`; ถ้า `channel == \"line\"` และมีคำว่า `\"ใบกำกับภาษี\"` หรือ `\"คืนเงิน\"` คืน `\"p2\"`; นอกนั้นคืน `\"p3\"`",
      "สร้าง `enrich_ticket_tag(message_th: str, client: TagClient) -> dict[str, object]` ที่อ่านค่า `DEFAULT_FALLBACK_TAG` จาก env (ค่าเริ่มต้น `\"needs_review\"`) — ถ้า `client.predict_tag(...)` สำเร็จคืน `{\"tag\": tag, \"source\": \"model\", \"error\": None}` แต่ถ้าเกิด `TimeoutError` หรือ `UpstreamError` (เช่น 429, 500) ให้คืน `{\"tag\": fallback_tag, \"source\": \"fallback\", \"error\": ...}` (`\"timeout\"` หรือ `f\"http_{exc.status_code}\"`)",
      "ใน `test_ticket_router.py` ใช้ `@pytest.mark.parametrize` ทดสอบ `classify_channel_priority` อย่างน้อย 5 เคส (ใส่ `id` ทุกเคส) และทดสอบความล้มเหลวของ `enrich_ticket_tag` (timeout, 429, 500) ร่วมกับ `monkeypatch.setenv`",
      "รัน `uv run pytest -v` ผ่านครบทุกข้อแบบออฟไลน์และ `uv run ruff check .` ไม่มี warning",
    ],
    starter: {
      language: "python",
      filename: "ticket_router.py",
      code: `import os
from typing import Protocol


class UpstreamError(RuntimeError):
    def __init__(self, status_code: int, detail: str = "") -> None:
        super().__init__(detail or f"HTTP {status_code}")
        self.status_code = status_code


class TagClient(Protocol):
    def predict_tag(self, text: str) -> str: ...


def classify_channel_priority(channel: str, message_th: str) -> str:
    # TODO: คืน "p1", "p2" หรือ "p3" ตามเงื่อนไขช่องทางและคำสำคัญ
    raise NotImplementedError


def enrich_ticket_tag(message_th: str, client: TagClient) -> dict[str, object]:
    # TODO: เรียก client.predict_tag และจับ TimeoutError / UpstreamError เป็น fallback โดยอ่าน DEFAULT_FALLBACK_TAG จาก env
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_router.py",
      code: `import pytest
from ticket_router import UpstreamError, classify_channel_priority, enrich_ticket_tag


class FakeTagClient:
    def __init__(self, tag: str = "general", error: Exception | None = None) -> None:
        self.tag = tag
        self.error = error
        self.calls: list[str] = []

    def predict_tag(self, text: str) -> str:
        self.calls.append(text)
        if self.error is not None:
            raise self.error
        return self.tag


@pytest.mark.parametrize(
    ("channel", "message_th", "expected"),
    [
        pytest.param("email", "โอนซ้ำสองรอบ ช่วยเช็กด่วน", "p1", id="thai-duplicate-transfer"),
        pytest.param("web", "URGENT cannot access dashboard", "p1", id="english-urgent"),
        pytest.param("line", "ขอใบกำกับภาษีเดือนมกราคมครับ", "p2", id="line-tax-invoice"),
        pytest.param("email", "ขอใบกำกับภาษีเดือนมกราคมครับ", "p3", id="email-not-p2"),
        pytest.param("line", "สอบถามโปรโมชันรายปี", "p3", id="line-general"),
    ],
)
def test_classify_channel_priority(
    channel: str,
    message_th: str,
    expected: str,
) -> None:
    assert classify_channel_priority(channel, message_th) == expected


def test_enrich_ticket_tag_model_success() -> None:
    fake = FakeTagClient(tag="billing")
    result = enrich_ticket_tag("  ขอใบเสร็จรับเงิน  ", fake)

    assert result == {"tag": "billing", "source": "model", "error": None}
    assert fake.calls == ["ขอใบเสร็จรับเงิน"]


@pytest.mark.parametrize(
    ("error", "expected_error"),
    [
        pytest.param(TimeoutError("read timed out"), "timeout", id="timeout"),
        pytest.param(UpstreamError(429, "too many requests"), "http_429", id="rate-limit-429"),
        pytest.param(UpstreamError(500, "internal error"), "http_500", id="server-500"),
    ],
)
def test_enrich_ticket_tag_fallbacks_cleanly(
    error: Exception,
    expected_error: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("DEFAULT_FALLBACK_TAG", "triage_queue")
    fake = FakeTagClient(error=error)

    result = enrich_ticket_tag("ชำระเงินไม่สำเร็จครับ", fake)

    assert result == {
        "tag": "triage_queue",
        "source": "fallback",
        "error": expected_error,
    }
`,
    },
    selfCheck: [
      "ตาราง `@pytest.mark.parametrize` ของ `classify_channel_priority` แสดงชื่อเคสภาษาไทย/อังกฤษทีละข้อเมื่อรัน `pytest -v`",
      "`enrich_ticket_tag` ตัดช่องว่างหัวท้ายของ `message_th` ก่อนส่งให้ `client.predict_tag(...)`",
      "เมื่อ `FakeTagClient` โยน `TimeoutError`, `UpstreamError(429)` หรือ `UpstreamError(500)` ระบบคืน fallback พร้อมเหตุผลถูกต้องโดยไม่แครช",
      "`monkeypatch.setenv` เปลี่ยน `DEFAULT_FALLBACK_TAG` เฉพาะในเทสต์นั้นและไม่ค้างในระบบหลังจบเทสต์",
      "รัน `uv run pytest -v` ผ่านครบ 9 เคสใน < 0.2 วินาที โดยไม่ต้องต่อเน็ต และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านครบ 9 test items ด้วย `uv run pytest -v` แบบออฟไลน์ และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `classify_channel_priority` ให้แปลงทั้ง `channel` และ `message_th` เป็น `.strip().lower()` ก่อนเช็กคำสำคัญ เพื่อให้ `\"URGENT\"` กับ `\"urgent\"` และ `\"LINE\"` กับ `\"line\"` ตรงกันเสมอ",
      },
      {
        body: "ใน `enrich_ticket_tag` ให้ทำความสะอาดข้อความด้วย `cleaned = message_th.strip()` แล้วส่ง `cleaned` เข้า `client.predict_tag(cleaned)` เพื่อตรวจ `fake.calls` ได้ตรงตามคาด",
      },
      {
        body: "โครงของ `classify_channel_priority` พร้อมแล้ว — เติมบล็อก `try / except` ใน `enrich_ticket_tag` ให้จับทั้ง `TimeoutError` และ `UpstreamError` แล้วรัน `uv run pytest -v`",
        code: {
          language: "python",
          filename: "hint-d010-l3.py",
          code: `import os
from typing import Protocol


class UpstreamError(RuntimeError):
    def __init__(self, status_code: int, detail: str = "") -> None:
        super().__init__(detail or f"HTTP {status_code}")
        self.status_code = status_code


class TagClient(Protocol):
    def predict_tag(self, text: str) -> str: ...


def classify_channel_priority(channel: str, message_th: str) -> str:
    text = message_th.lower()
    if any(kw in text for kw in ("ด่วน", "urgent", "โอนซ้ำ")):
        return "p1"
    if channel.strip().lower() == "line" and any(
        kw in text for kw in ("ใบกำกับภาษี", "คืนเงิน")
    ):
        return "p2"
    return "p3"


def enrich_ticket_tag(message_th: str, client: TagClient) -> dict[str, object]:
    # TODO: strip message_th, เรียก client.predict_tag(cleaned), จับ TimeoutError / UpstreamError คืน fallback
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# รันครบทุกเคสพร้อมดูชื่อ pytest.param id
uv run pytest -v
# ลองกรองรันเฉพาะเคส 429
uv run pytest -k "429" -v
uv run ruff check .`,
      caption: "การตั้ง `id` ใน `pytest.param` ทำให้คุณกรองรันเฉพาะเคสที่พังด้วย `-k` ได้อย่างรวดเร็ว",
    },
  },

  mistakes: [
    {
      title: "ใช้ `for` loop แทน `@pytest.mark.parametrize` เพื่อทดสอบหลายเคส",
      symptom: "พอเคสแรกพัง เคสที่เหลือไม่ถูกรันเลย และรายงานไม่บอกว่าข้อมูลแถวไหนที่ล้มเหลว",
      fix: "ย้ายตารางเคสขึ้นไปไว้ใน `@pytest.mark.parametrize(..., [pytest.param(..., id=...)])` เพื่อให้ `pytest` รันและรายงานผลแยกรายเคส",
    },
    {
      title: "Patch ผิดตำแหน่งเมื่อใช้ `monkeypatch.setattr`",
      symptom: "เทสต์ยังไปเรียกฟังก์ชันจริง (หรือยิงเน็ตจริง) ทั้งที่เขียน `monkeypatch.setattr` ไว้แล้ว",
      fix: "จำกฎ \"patch where it is used, not where it is defined\" — หรือออกแบบฟังก์ชันให้รับ client ผ่าน Dependency Injection เพื่อเลี่ยงปัญหา path เลย",
    },
    {
      title: "แก้ไข `os.environ['KEY'] = 'val'` ตรง ๆ ในเทสต์แทน `monkeypatch.setenv`",
      symptom: "ค่า env รั่วไหลไปกระทบเทสต์ถัดไป ทำให้เทสต์ที่ทดสอบค่า default พังอย่างลึกลับ",
      fix: "ใช้ `monkeypatch.setenv(...)` และ `monkeypatch.delenv(..., raising=False)` เสมอ เพื่อให้ `pytest` คืนค่า environment เดิมอัตโนมัติ",
    },
    {
      title: "ปล่อยให้ unit test ยิง LLM / HTTP API จริงใน CI",
      symptom: "CI ช้า เสียค่า API ทุกครั้งที่ push โค้ด และ build แดงสุ่มเมื่อเจอ rate limit",
      fix: "Mock ทุกการเชื่อมต่อภายนอกใน unit test ด้วย Fake/Stub Client หรือ `monkeypatch` แล้วแยก integration test ที่ยิงของจริงไว้อีก marker ต่างหาก",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อทบทวน `@pytest.mark.parametrize`, `monkeypatch` และกลยุทธ์ Mocking",
    questions: [
      mc(
        "d010-q1",
        "ข้อได้เปรียบสำคัญของ `@pytest.mark.parametrize` เหนือการเขียน `for` loop ภายในฟังก์ชันเทสต์เดียวคืออะไร?",
        [
          ["ทำให้โค้ด Python รันแบบ multi-threading อัตโนมัติ", "`parametrize` ไม่ได้สั่งรันแบบ multi-threading เอง แต่แยกแต่ละแถวเป็น test item อิสระ"],
          ["แต่ละแถวถูกรันและรายงานผลเป็น test item อิสระ — หากแถวหนึ่งพัง แถวที่เหลือยังคงรันจนครบ", "ถูก — ช่วยให้เห็นภาพรวมทั้งหมดทันทีและกรองรันเฉพาะเคสด้วย `-k` ได้"],
          ["ไม่ต้องเขียนคำสั่ง `assert` ในฟังก์ชันเทสต์", "ยังต้องเขียน `assert` ตามปกติ"],
          ["ใช้ได้เฉพาะกับข้อมูลชนิด `int` เท่านั้น", "ใช้ได้กับข้อมูลทุกชนิดรวมถึง `str` ภาษาไทย, `dict` และคลาส exception"],
        ],
        "B",
        "`@pytest.mark.parametrize` แปลงแต่ละแถวเป็น test item แยกอิสระ ทำให้เมื่อมีเคสพัง คุณยังเห็นผลของทุกเคสที่เหลือครบถ้วน",
        "ทำไมควรใช้ `@pytest.mark.parametrize` แทน `for` loop ในฟังก์ชันเทสต์?",
        "เพราะแต่ละแถวจะรันแยกอิสระ (แถวหนึ่งพังแถวอื่นยังรันต่อ) รายงานชื่อเคสชัดเจน และเลือกกรองรันเฉพาะเคสด้วย `-k` ได้",
      ),
      mc(
        "d010-q2",
        "หาก `app.py` เขียน `from provider import fetch_reply` แล้วคุณต้องการใช้ `monkeypatch.setattr` แทนที่ `fetch_reply` ในระหว่างเทสต์ ข้อใดถูกต้อง?",
        [
          ["`monkeypatch.setattr(provider, 'fetch_reply', fake_fn)`", "ผิด — `app.py` ผูกชื่อ `fetch_reply` ไว้ใน namespace ของตัวเองแล้ว การแก้ที่ `provider` จะไม่เปลี่ยน reference ใน `app`"],
          ["`monkeypatch.setattr(app, 'fetch_reply', fake_fn)`", "ถูก — ต้อง patch ในโมดูลที่เรียกใช้งาน (where it is looked up)"],
          ["`os.environ['fetch_reply'] = fake_fn`", "`os.environ` เก็บได้เฉพาะ string ไม่สามารถแทนที่ฟังก์ชัน Python ได้"],
          ["ไม่ต้อง patch เพราะ `pytest` แทนที่ฟังก์ชันเครือข่ายให้อัตโนมัติ", "`pytest` ไม่แทนที่ฟังก์ชันให้อัตโนมัติ คุณต้อง mock หรือฉีด fake เอง"],
        ],
        "B",
        "กฎของ `monkeypatch.setattr` คือ patch ที่จุดอ้างอิงของโมดูลผู้เรียกใช้ (`app`) หรือที่ดีกว่าคือออกแบบให้รับ dependency ผ่านพารามิเตอร์",
        "ถ้า `app.py` ทำ `from provider import fetch_reply` ต้องใช้ `monkeypatch.setattr` ที่โมดูลใด?",
        "ต้อง patch ที่ `app` (`monkeypatch.setattr(app, 'fetch_reply', fake_fn)`) เพราะ `app` อ้างอิงชื่อนั้นใน namespace ของตัวเองแล้ว",
      ),
      mc(
        "d010-q3",
        "เหตุใดจึงควรใช้ `monkeypatch.setenv('DEFAULT_FALLBACK_TAG', 'triage')` แทน `os.environ['DEFAULT_FALLBACK_TAG'] = 'triage'` ใน unit test?",
        [
          ["เพราะ `os.environ` แก้ค่าไม่ได้ใน Python 3.12", "`os.environ` แก้ค่าได้ แต่จะไม่ถูกคืนค่าเดิมเมื่อเทสต์จบ"],
          ["เพราะ `monkeypatch.setenv` จะคืนค่า environment variable กลับสู่สภาพเดิมอัตโนมัติหลังเทสต์จบ (แม้เทสต์ fail)", "ถูก — ช่วยรักษา test isolation ไม่ให้ค่า env รั่วไหลไปกระทบเทสต์อื่น"],
          ["เพราะ `monkeypatch.setenv` เขียนค่าลงไฟล์ `.env` ถาวรให้ด้วย", "ไม่ได้แตะไฟล์ `.env` เลย — ทำงานในหน่วยความจำเฉพาะระหว่างเทสต์เท่านั้น"],
          ["เพราะ `os.environ` ไม่รองรับข้อความภาษาอังกฤษ", "`os.environ` รองรับ string ตามปกติ ปัญหาคือเรื่อง state leakage"],
        ],
        "B",
        "`monkeypatch` รับประกันการ undo การเปลี่ยนแปลงทุกอย่าง (ทั้ง `setattr` และ `setenv`) ทันทีที่ฟังก์ชันเทสต์นั้นสิ้นสุดลง",
        "ทำไมควรใช้ `monkeypatch.setenv` แทนการแก้ `os.environ` ตรง ๆ ใน `pytest`?",
        "เพราะ `monkeypatch` จะคืนค่า environment เดิมให้อัตโนมัติหลังจบเทสต์ แม้เทสต์จะ fail จึงไม่เกิด state leakage ข้ามเทสต์",
      ),
      mc(
        "d010-q4",
        "ทีมต้องการทดสอบว่าฟังก์ชันเรียก LLM ของเรารับมือกับ `TimeoutError`, HTTP `429` และ HTTP `500` ได้อย่างถูกต้องใน CI ข้อใดคือแนวทางที่ดีที่สุด?",
        [
          ["ยิง API จริงรัว ๆ 1,000 ครั้งจนกว่าผู้ให้บริการจะส่ง 429 กลับมา", "สิ้นเปลืองค่าใช้จ่าย เสี่ยงโดนแบนบัญชี และทำให้ CI ช้าและพังสุ่ม"],
          ["สร้าง Fake/Stub Client ที่โยน `TimeoutError` / `UpstreamError(429)` / `UpstreamError(500)` แล้วรันผ่าน `@pytest.mark.parametrize`", "ถูก — รันจบในไม่กี่มิลลิวินาที ต้นทุน 0 บาท และคุมผลได้ 100%"],
          ["ข้ามการทดสอบ error path แล้วค่อยไปดู log ใน production", "ปล่อยให้ผู้ใช้จริงเป็นคนเจอบั๊ก fallback เป็นความเสี่ยงสูงมาก"],
          ["ใช้ `time.sleep(30)` ในเทสต์เพื่อจำลอง timeout จริง", "ทำให้ชุดเทสต์ช้ามากโดยไม่จำเป็น แค่ให้ fake โยน `TimeoutError` ทันทีก็พอ"],
        ],
        "B",
        "Fake/Stub Client ที่สั่งให้โยน exception หรือคืน status code ผิดพลาดทันที ทำให้เราทดสอบความทนทานของระบบได้ครบทุกกรณีอย่างรวดเร็วและฟรี",
        "จะทดสอบการรับมือ timeout, HTTP 429 และ HTTP 500 ใน unit test อย่างไรให้เร็วและฟรี?",
        "ฉีด Fake/Stub Client ที่โยน `TimeoutError` หรือ HTTP error ที่กำหนดไว้ แล้วจับคู่กับ `@pytest.mark.parametrize` รันแบบออฟไลน์",
      ),
    ],
  },

  takeaways: [
    "`@pytest.mark.parametrize` พร้อม `pytest.param(..., id=...)` ช่วยทดสอบเคสขอบภาษาไทยเป็นตารางได้ครบทุกแถวโดยไม่หยุดกลางคัน",
    "เลือก **Dependency Injection + Fake/Stub Client** เป็นท่าหลักในการแทนที่บริการภายนอก เพราะอ่านง่ายและไม่เปราะบางตอนรีแฟกเตอร์",
    "ใช้ `monkeypatch.setattr` และ `monkeypatch.setenv` เมื่อต้องการสลับค่าชั่วคราว โดย `pytest` จะคืนค่าเดิมให้เองหลังจบเทสต์",
    "จำลอง `TimeoutError`, HTTP `429` และ HTTP `500` แบบออฟไลน์เพื่อให้ชุดเทสต์รันเร็ว ฟรี และรับประกันว่าโค้ด fallback ทำงานจริง",
  ],

  reviewCards: [
    rc(
      "d010-rc-1",
      "การใส่ `pytest.param(..., id='...')` ใน `@pytest.mark.parametrize` มีประโยชน์อย่างไร?",
      "ตั้งชื่อเคสย่อยให้อ่านง่ายในผลรัน `pytest -v` และช่วยให้กรองรันเฉพาะเคสที่ต้องการด้วย `pytest -k <id>` ได้ทันที",
    ),
    rc(
      "d010-rc-2",
      "กฎ \"patch where it is used, not where it is defined\" ของ `monkeypatch.setattr` หมายความว่าอย่างไร?",
      "ต้อง patch ชื่อฟังก์ชันในโมดูลที่ import ไปใช้งาน (`app.fn`) ไม่ใช่โมดูลต้นทาง (`provider.fn`) เพราะโมดูลผู้เรียกผูก reference ไว้ใน namespace ของตัวเองแล้ว",
    ),
    rc(
      "d010-rc-3",
      "ทำไมจึงควร mock เฉพาะขอบเขตภายนอก (I/O boundary) แทนที่จะ mock ฟังก์ชันภายในทุกตัว?",
      "เพื่อทดสอบพฤติกรรมจริงของโค้ดเรา (ลดโอกาสเทสต์ผ่านปลอม) และทำให้รีแฟกเตอร์โครงสร้างภายในได้โดยเทสต์ไม่พังโดยไม่จำเป็น",
    ),
  ],

  sources: [
    { label: "pytest Official Docs — Parametrizing fixtures and test functions", href: "https://docs.pytest.org/en/stable/how-to/parametrize.html" },
    { label: "pytest Official Docs — How to monkeypatch/mock modules and environments", href: "https://docs.pytest.org/en/stable/how-to/monkeypatch.html" },
    { label: "Python 3 Official Docs — typing.Protocol (Structural Subtyping)", href: "https://docs.python.org/3/library/typing.html#typing.Protocol" },
  ],

  glossary: [
    "pytest",
    "parametrize",
    "mocking",
    "fixture",
    "rate-limit",
    "custom-exception",
    "llm",
    "ruff",
  ],
});
