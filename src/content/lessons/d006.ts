import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D006 — Phase 1 / Block B02
 * Error Handling, Custom Exceptions & Logging (structlog).
 */
export const d006: Lesson = defineLesson({
  day: 6,
  titleTh: "จัดการ Error ด้วย Custom Exception และ Structured Logging (structlog)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · แยก Retryable vs Fatal error ชัดเจน และแทน print() ด้วย JSON log ที่สืบค้นได้",
  icon: "scroll-text",
  visual: {
    id: "structlog-flow",
    title: "Structured Logging (structlog) & Custom Exception Hierarchy",
    caption: "กดสลับดูความต่างระหว่าง print() กับ JSON log ที่มี request_id และแยก Retryable vs Fatal error",
    alt: "แผนภาพโครงสร้าง structlog และลำดับชั้น custom exception",
  },
  requiresApiKey: false,
  tools: ["structlog", "Python 3.12", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "แยกความผิดพลาดของข้อมูลต้นทางออกจากระบบล่มชั่วคราว",
      body: "ในท่อรับข้อมูล AI ความผิดพลาดไม่ได้เหมือนกันหมด: ข้อมูลลูกค้าฟิลด์ไม่ครบ (`InvalidPayloadError`) ลองใหม่กี่ครั้งก็ยังผิด แต่ฐานข้อมูลหรือ API หน่วงชั่วคราว (`RetryableError`) สามารถลองใหม่ได้",
      lessonNote: "วันนี้เราออกแบบลำดับชั้น {{custom-exception}} เพื่อให้โค้ดปลายทางตัดสินใจได้แม่นยำว่าควร retry หรือหยุดทันที",
    },
    {
      node: 2,
      heading: "วางรากฐานให้ระบบ Retry และ Fallback ของ LLM API",
      body: "เมื่อเข้าสู่ Block B04 (`tenacity`) และ Phase 3 (เรียก {{llm}} API) ตัวจัดการ retry จะรู้ได้อย่างไรว่าควรยิงซ้ำเมื่อเจอ HTTP 429 แต่ไม่ควรยิงซ้ำเมื่อ API key ผิด?",
      lessonNote: "คำตอบคือแยกประเภท exception ตั้งแต่ต้นทาง ทำให้ policy การ retry ชัดเจนและไม่ผลาญโควต้าโดยเปล่าประโยชน์",
    },
    {
      node: 4,
      heading: "แนบ `request_id` ไปกับทุกขั้นตอนของคำขอในแอป AI",
      body: "เมื่อผู้ใช้ 50 คนแชทเข้ามาพร้อมกัน ข้อความจาก `print()` จะปนกันมั่วจนไล่ไม่ได้ว่าบรรทัดไหนเป็นของใคร",
      lessonNote: "เราใช้ {{structlog}} ผูก `request_id` เข้ากับ logger เพื่อเชื่อมทุกเหตุการณ์ของคำขอเดียวกันเข้าด้วยกัน",
    },
    {
      node: 5,
      heading: "สร้าง Log ที่ค้นหา แจ้งเตือน และปลอดภัยตาม PDPA",
      body: "ระบบ Monitoring ยุคใหม่ (เช่น Cloud Logging, Datadog, {{otel}}) อ่าน log รูปแบบ JSON ที่มีคีย์คงที่เพื่อสร้างกราฟ error rate และ alert โดยห้ามมีรหัสผ่านหรือข้อมูลส่วนบุคคลรั่วไหล",
      lessonNote: "คุณจะได้ฝึกเขียน JSON log แบบ key-value ที่กรองข้อมูลอ่อนไหว ({{pdpa}}) ออกก่อนบันทึก",
    },
  ],

  objectives: [
    "**ออกแบบลำดับชั้น** {{custom-exception}} (`AppError` → `RetryableError`, `InvalidPayloadError`) พร้อมรักษาต้นเหตุเดิมด้วย `raise ... from err`",
    "**อธิบายอันตราย** ของ bare `except:` และการกลืน exception เงียบ ๆ พร้อมเขียนบล็อก `try/except` ที่จับเฉพาะความผิดพลาดที่จัดการได้จริง",
    "**ตั้งค่าและใช้งาน** {{structlog}} เพื่อบันทึกเหตุการณ์แบบ key-value/JSON ผูก `request_id` ด้วย `.bind()` และหลีกเลี่ยงการบันทึกความลับหรือข้อมูลส่วนบุคคลลง log",
  ],

  prerequisites: [
    "เข้าใจ `try / except / raise` และ class inheritance พื้นฐานใน Python",
    "มี {{uv}}, `pytest` และ `ruff` พร้อมใช้งานบนเครื่อง",
    "ไม่ต้องใช้ API key หรือบริการ cloud — ทดสอบ JSON log ใน terminal และ `pytest` ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ใหม่สำหรับ Day 6 ด้วย {{uv}} แล้วติดตั้ง `structlog` พร้อม `pytest` และ `ruff` สำหรับตรวจสอบและเขียนเทสต์ log",
    commands: `uv init ai-day6-logging && cd ai-day6-logging
uv add structlog
uv add --dev pytest ruff

# ตรวจว่า structlog พร้อมใช้งาน
uv run python -c "import structlog; print('structlog:', structlog.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day6-logging` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `structlog` และ `--dev pytest ruff`"],
      ["verify", "ตรวจเวอร์ชัน `structlog` ด้วย `uv run python` สำเร็จ"],
    ],
    note: "`structlog` มีโมดูล `structlog.testing.capture_logs()` ในตัว ทำให้คุณเขียน `pytest` ตรวจ event และฟิลด์ใน log ได้ง่ายมาก",
  },

  concepts: [
    {
      id: "custom-exception-hierarchy",
      title: "1 · ออกแบบ Custom Exception Hierarchy: แยก Retryable vs Fatal",
      paragraphs: [
        "ถ้าโค้ดทุกส่วนโยนแค่ `Exception(\"error\")` หรือ `ValueError(\"bad\")` ฝั่งผู้เรียกจะไม่มีทางรู้ว่าข้อผิดพลาดนั้นเกิดจาก **ข้อมูลผิดรูป** (ลองใหม่ก็ยังพัง) หรือเกิดจาก **เครือข่าย/โควต้าเต็มชั่วคราว** (รอสักครู่แล้วลองใหม่ได้)",
        "แนวทางมาตรฐานในระบบ production คือสร้างคลาสฐานของแอปหนึ่งตัว เช่น `AppError(Exception)` แล้วแตกแขนงตาม **การตัดสินใจที่ผู้เรียกต้องทำ**: เช่น `RetryableError(AppError)` (timeout, rate limit 429) และ `InvalidPayloadError(AppError)` (ข้อมูลไม่ผ่าน {{schema}}) เมื่อห่อ error จากไลบรารีภายนอกให้ใช้ `raise RetryableError(...) from err` เพื่อเก็บ traceback ต้นฉบับไว้ครบถ้วน",
      ],
      analogy:
        "เหมือนป้ายคัดแยกอาการผู้ป่วยที่ห้องฉุกเฉิน — ถ้าทุกเคสแปะป้ายว่า \"ป่วย\" เหมือนกันหมด หมอจะจัดลำดับรักษาไม่ได้ แต่ถ้าแยกชัดเจนว่า \"รอคิวได้\" กับ \"ต้องส่งคืนเอกสาร\" ทีมทำงานต่อได้ทันที",
      code: {
        language: "python",
        filename: "exceptions.py",
        code: `class AppError(Exception):
    """ฐานของความผิดพลาดทั้งหมดที่แอปเราควบคุมและเข้าใจได้"""


class RetryableError(AppError):
    """ความผิดพลาดชั่วคราว เช่น API timeout หรือ rate limit — ควร retry"""

    def __init__(self, message: str, retry_after_s: float = 1.0) -> None:
        super().__init__(message)
        self.retry_after_s = retry_after_s


class InvalidPayloadError(AppError):
    """ข้อมูลเข้าไม่ผ่านสัญญา — ห้าม retry เพราะลองใหม่ก็ยังผิด"""


def parse_priority(raw: dict) -> int:
    try:
        score = int(raw["priority"])
    except (KeyError, TypeError, ValueError) as err:
        # ใช้ 'from err' เพื่อรักษาต้นเหตุเดิมใน traceback
        raise InvalidPayloadError("ฟิลด์ priority ต้องเป็นจำนวนเต็ม") from err
    if not 1 <= score <= 5:
        raise InvalidPayloadError(f"priority={score} อยู่นอกช่วง 1..5")
    return score`,
        caption: "การแตกคลาสย่อยจาก `AppError` ทำให้ผู้เรียกสามารถเลือกจับเฉพาะ `RetryableError` เพื่อสั่ง retry และปล่อย `InvalidPayloadError` ส่งกลับหาผู้ใช้ทันที",
      },
      whyTitle: "Why this matters — เชื่อมตรงไปยัง Retry Policy ใน Day 14",
      whyParagraphs: [
        "ทีม AI มือใหม่มักตั้ง retry กับ `Exception` ทุกชนิด ผลคือพอส่ง prompt ที่ผิดรูปแบบหรือ API key ผิด ระบบยังยิงซ้ำอีก 5 รอบ เสียทั้งเวลาและอาจโดนผู้ให้บริการบล็อก",
        "เมื่อแยก `RetryableError` ออกจาก `InvalidPayloadError` ตั้งแต่ระดับโครงสร้างโค้ด กฎการ retry จึงชัดเจนและปลอดภัยโดยอัตโนมัติ",
      ],
    },
    {
      id: "why-bare-except-is-dangerous",
      title: "2 · ทำไม Bare `except:` และการกลืน Error จึงเป็นหายนะเงียบ",
      paragraphs: [
        "การเขียน `except:` เปล่า ๆ (ไม่ระบุชนิด) ใน Python จะจับทุกอย่างที่สืบทอดจาก `BaseException` รวมถึง `KeyboardInterrupt` (กด Ctrl+C หยุดโปรแกรมไม่ได้!) และ `SystemExit` ส่วนการเขียน `except Exception: pass` โดยไม่ log จะซ่อนบั๊กอย่าง `KeyError` หรือ `TypeError` ให้ไหลต่อเป็นข้อมูลขยะ",
        "หลักการ {{fail-fast}} ที่ถูกต้องคือ: **จับเฉพาะชนิด exception ที่คุณรู้วิธีจัดการจริง** หากจัดการไม่ได้ให้ log บริบทที่จำเป็นแล้วปล่อยต่อ (`raise`) หรือแปลงเป็น `AppError` ที่สื่อความหมายด้วย `from err`",
      ],
      analogy:
        "Bare `except: pass` เหมือนเอาเทปดำปิดไฟเตือนเครื่องยนต์บนหน้าปัดรถ — รถยังวิ่งต่อได้อีก 5 กิโลเมตร แต่พอพังจริงเครื่องยนต์เสียหายทั้งลูกและไม่มีใครรู้ว่าเริ่มพังตรงไหน",
      bullets: [
        "**ห้ามใช้ bare `except:`** — แม้แต่ linter อย่าง {{ruff}} (กฎ `E722`) ก็จะฟ้อง error ทันที",
        "**ห้ามกลืน error เงียบ ๆ (`pass`)** — อย่างน้อยต้องบันทึก log ระดับ `warning` หรือ `error` พร้อมบริบท",
        "**แยกขอบเขต `try` ให้แคบ** — ใส่ใน `try` เฉพาะบรรทัดที่อาจเกิด error นั้นจริง ๆ เพื่อไม่ให้เผลอจับบั๊กจากบรรทัดอื่น",
      ],
      whyTitle: "Why this matters — ดีบักงาน AI ที่ล้มเหลวตอนตี 2 ได้ใน 2 นาที",
      whyParagraphs: [
        "ในระบบ RAG หรือ Agent ขั้นตอนหนึ่งพังแล้วถูกกลืนเงียบ ๆ มักแสดงอาการเป็นคำตอบมั่ว ({{hallucination}}) แทนที่จะแจ้ง error — ทำให้ทีมเสียเวลาหลายชั่วโมงจูน prompt ทั้งที่จริง ๆ แค่ไฟล์ดัชนีหาย",
        "การปล่อยให้บั๊กที่ไม่คาดคิดฟ้องออกมาชัด ๆ และดักเฉพาะ error ที่ตั้งใจจัดการ คือกฎเหล็กของวิศวกรซอฟต์แวร์",
      ],
    },
    {
      id: "structlog-and-safe-context",
      title: "3 · แทนที่ `print()` ด้วย `structlog` แบบ JSON + ผูก `request_id`",
      paragraphs: [
        "`print(f\"Ticket {tid} failed: {err}\")` อ่านได้ตอนรันเล่นบนเครื่องคนเดียว แต่เมื่อแอปขึ้น production แล้วมี log วันละแสนบรรทัด คุณไม่สามารถสั่งคิวรีหาว่า \"มี `error_kind=retryable` กี่ครั้งในชั่วโมงที่ผ่านมา\" จากประโยคข้อความอิสระได้ง่าย ๆ",
        "{{structlog}} เปลี่ยน log ทุกบรรทัดให้เป็น **เหตุการณ์ + คู่ key-value** เช่น `log.warning(\"ticket_rejected\", ticket_id=\"TKT-101\", reason=\"invalid_channel\")` และส่งออกเป็น JSON ที่มี `timestamp` และ `level` ครบ พร้อมเมธอด `.bind(request_id=...)` ที่แปะรหัสคำขอลงในทุก log ต่อไปโดยอัตโนมัติ — โดยมีกฎความปลอดภัยสำคัญคือ **ห้ามใส่ API key, token หรือข้อมูลส่วนบุคคล ({{pdpa}}) ดิบลงใน log**",
      ],
      analogy:
        "`print()` เหมือนจดบันทึกปัญหาลงสมุดโน้ตด้วยลายมืออิสระ ส่วน `structlog` เหมือนกรอกแบบฟอร์มตารางที่มีคอลัมน์ `timestamp`, `level`, `request_id`, `event` ชัดเจน ทำให้เครื่องมือค้นหาและสร้างกราฟได้ทันที",
      code: {
        language: "python",
        filename: "structlog_demo.py",
        code: `import structlog


def configure_json_logging() -> None:
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.add_log_level,
            structlog.processors.JSONRenderer(ensure_ascii=False),
        ],
    )


configure_json_logging()
base_log = structlog.get_logger("ticket_service")

# ผูก request_id เข้ากับ logger ของคำขอนี้
req_log = base_log.bind(request_id="req-9f2a")
req_log.info("ticket_received", ticket_id="TKT-101", channel="line")
req_log.warning("ticket_retry_scheduled", ticket_id="TKT-101", retry_after_s=2.0)`,
        caption: "ส่ง `ensure_ascii=False` ให้ `JSONRenderer` เพื่อให้ข้อความภาษาไทยใน JSON log อ่านได้ตรง ๆ ไม่ถูกแปลงเป็น `\\u0e...`",
      },
      whyTitle: "Why this matters — เชื่อมต่อสู่งาน Observability ใน Phase 5",
      whyParagraphs: [
        "โครงสร้าง log แบบ JSON ที่มี `request_id`, `event` และฟิลด์ตัวเลข (`latency_ms`, `retry_after_s`) พร้อมส่งตรงเข้าเครื่องมือรวม log (Grafana Loki, Datadog, CloudWatch) และต่อยอดเข้า {{otel}} / {{langfuse}} ใน Phase 5 ได้ทันที",
        "นอกจากนี้การแยกข้อความ event คงที่ (`\"ticket_rejected\"`) ออกจากตัวแปร (`ticket_id=...`) ช่วยให้ระบบจัดกลุ่ม error ซ้ำได้อย่างแม่นยำ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ structlog & Custom Exceptions กับ Node.js/TS",
      body: [
        "ถ้าคุณเคยใช้ `pino` หรือ `winston` ใน Node.js และสร้างคลาส `extends Error` ใน TypeScript แนวคิดของ `structlog` จะคุ้นเคยทันที:",
      ],
      table: [
        ["`class AppError(Exception):`", "`class AppError extends Error {}`"],
        ["`raise RetryableError(...) from err`", "`throw new RetryableError(msg, { cause: err })`"],
        ["`req_log = log.bind(request_id=rid)`", "`const reqLog = logger.child({ requestId: rid })` (`pino`)"],
        ["`log.error(\"api_failed\", status=503)`", "`logger.error({ status: 503 }, \"api_failed\")`"],
        ["`structlog.testing.capture_logs()`", "Spy/mock logger stream ใน Jest/Vitest"],
      ],
    },
    student: {
      title: "First-Year Note — `raise NewError(...) from err` ต่างจาก `raise NewError(...)` อย่างไร?",
      body: [
        "เมื่อคุณจับ error ตัวหนึ่ง (เช่น `KeyError`) แล้วอยากโยน error ที่สื่อความหมายดีกว่า (เช่น `InvalidPayloadError`) การใส่ `from err` ต่อท้ายจะบอก Python ให้เก็บสายโซ่สาเหตุเดิมไว้ใน `__cause__`",
        "เวลาโปรแกรมพิมพ์ traceback ออกมา คุณจะเห็นทั้งสองชั้น: \"เกิด `KeyError` ตรงบรรทัดนี้ → ซึ่งเป็นต้นเหตุโดยตรงของ `InvalidPayloadError`\" ทำให้สืบหาบั๊กง่ายกว่าการโยนใหม่แบบตัดขาดจากต้นเหตุเดิมมาก",
      ],
    },
  },

  workedExample: {
    intro:
      "ลองรวมทั้ง 3 แนวคิดเข้าด้วยกันในฟังก์ชันประมวลผลทิกเก็ตจำลอง: แยก `RetryableError` กับ `InvalidPayloadError`, ผูก `request_id` ด้วย `structlog`, และซ่อนเบอร์โทรลูกค้าก่อนลง log",
    steps: [
      {
        title: "1 · ตั้งค่า `structlog` ให้ส่งออก JSON ภาษาไทยและประกาศ Custom Exceptions",
        explain:
          "กำหนดโครงสร้าง processor พื้นฐาน (ISO timestamp + log level + JSON) และสร้างคลาส error แยกตามพฤติกรรมการรับมือ",
        code: {
          language: "python",
          filename: "worked_d006.py",
          code: `import structlog


class AppError(Exception):
    """Base application exception."""


class RetryableError(AppError):
    """Transient error safe to retry."""


class InvalidPayloadError(AppError):
    """Client/data contract violation — do not retry."""


structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(ensure_ascii=False),
    ]
)`,
        },
        output: `# ตั้งค่า structlog และประกาศลำดับชั้น exception สำเร็จ`,
      },
      {
        title: "2 · เขียนฟังก์ชันตรวจ Payload และซ่อนข้อมูลอ่อนไหวก่อน Log",
        explain:
          "สร้างตัวช่วย `mask_phone` เพื่อไม่ให้เบอร์โทรลูกค้าหลุดลง log และโยน `InvalidPayloadError` หรือ `RetryableError` อย่างชัดเจน",
        code: {
          language: "python",
          filename: "worked_d006.py",
          code: `def mask_phone(phone: str | None) -> str:
    if not phone or len(phone) < 4:
        return "***"
    return f"***-{phone[-4:]}"


def process_ticket(payload: dict, request_id: str) -> str:
    log = structlog.get_logger("tickets").bind(request_id=request_id)

    ticket_id = payload.get("ticket_id")
    if not isinstance(ticket_id, str) or not ticket_id.startswith("TKT-"):
        raise InvalidPayloadError("ticket_id ไม่ถูกต้อง")

    if payload.get("simulate_upstream_503"):
        raise RetryableError("บริการปลายทางไม่พร้อมใช้งานชั่วคราว")

    log.info(
        "ticket_processed",
        ticket_id=ticket_id,
        phone_masked=mask_phone(payload.get("phone")),
    )
    return ticket_id`,
        },
        output: `# ฟังก์ชันพร้อมแยกประเภท error และ mask เบอร์โทรก่อน log`,
      },
      {
        title: "3 · เรียกใช้งานและดักจับ Error แยกตามประเภทพร้อม JSON Log",
        explain:
          "ผู้เรียกจับ `RetryableError` และ `InvalidPayloadError` แยกกันอย่างเฉพาะเจาะจง ทำให้ log แสดงฟิลด์ `retryable=True/False` ชัดเจน",
        code: {
          language: "python",
          filename: "worked_d006.py",
          code: `def handle_request(payload: dict, request_id: str) -> str:
    log = structlog.get_logger("handler").bind(request_id=request_id)
    try:
        return process_ticket(payload, request_id=request_id)
    except RetryableError as err:
        log.warning("request_failed", retryable=True, error=str(err))
        return "queued_for_retry"
    except InvalidPayloadError as err:
        log.error("request_rejected", retryable=False, error=str(err))
        return "rejected"


print("R1 ->", handle_request({"ticket_id": "TKT-101", "phone": "0812345678"}, "req-001"))
print("R2 ->", handle_request({"ticket_id": "TKT-102", "simulate_upstream_503": True}, "req-002"))
print("R3 ->", handle_request({"ticket_id": "BAD-99"}, "req-003"))`,
        },
        output: `{"ticket_id": "TKT-101", "phone_masked": "***-5678", "request_id": "req-001", "event": "ticket_processed", "timestamp": "2026-11-22T15:05:00Z", "level": "info"}
R1 -> TKT-101
{"retryable": true, "error": "บริการปลายทางไม่พร้อมใช้งานชั่วคราว", "request_id": "req-002", "event": "request_failed", "timestamp": "2026-11-22T15:05:00Z", "level": "warning"}
R2 -> queued_for_retry
{"retryable": false, "error": "ticket_id ไม่ถูกต้อง", "request_id": "req-003", "event": "request_rejected", "timestamp": "2026-11-22T15:05:00Z", "level": "error"}
R3 -> rejected`,
      },
    ],
    gotcha:
      "หลีกเลี่ยงการส่ง f-string ที่ฝังค่าตัวแปรเข้าไปเป็นชื่อ `event` เช่น `log.error(f\"Ticket {tid} failed\")` เพราะจะทำให้ระบบ monitoring มองเห็นเป็น event ใหม่นับหมื่นชื่อ — ให้ใช้ชื่อ event คงที่ (`\"ticket_failed\"`) แล้วส่ง `ticket_id=tid` เป็น keyword argument แทน!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `ticket_logger.py` ที่มีลำดับชั้น Custom Exceptions ชัดเจน, แยก `RetryableError` กับ `InvalidPayloadError`, บันทึก structured logs ด้วย `structlog` พร้อม `request_id` และซ่อนข้อมูลอ่อนไหวก่อนลง log",
    requirements: [
      "สร้างลำดับชั้น exception: `AppError(Exception)`, `InvalidPayloadError(AppError)` และ `RetryableError(AppError)` (ให้ `RetryableError` รับ `retry_after_s: float = 1.0` เก็บเป็น attribute)",
      "สร้างตัวช่วย `redact_secret(value: str) -> str` ที่คืน `\"***\"` หากสตริงยาวน้อยกว่า 4 ตัวอักษร มิฉะนั้นคืน `f\"***{value[-4:]}\"` (คงไว้เฉพาะ 4 ตัวท้าย)",
      "สร้าง `validate_and_dispatch(payload: dict) -> str` ที่ตรวจว่า `payload[\"ticket_id\"]` เป็น `str` ขึ้นต้นด้วย `\"TKT-\"` (มิฉะนั้นโยน `InvalidPayloadError`), ตรวจว่า `payload.get(\"upstream_status\")` ถ้าเป็น `429` หรือ `503` ให้โยน `RetryableError(\"upstream busy\", retry_after_s=2.0)` และถ้าผ่านคืน `ticket_id`",
      "สร้าง `handle_ticket(payload: dict, request_id: str) -> dict[str, object]` ที่สร้าง logger ด้วย `structlog.get_logger(\"ticket_pipeline\").bind(request_id=request_id)` เรียก `validate_and_dispatch` และ: (1) กรณีสำเร็จ log ระดับ `info` ชื่อ event `\"ticket_ok\"` พร้อม `ticket_id` และ `api_token_redacted` (ถ้ามี `api_token` ใน payload ห้าม log ค่าดิบเด็ดขาด!) คืน `{\"status\": \"ok\", \"ticket_id\": ...}`; (2) จับ `RetryableError` log ระดับ `warning` ชื่อ `\"ticket_retryable_error\"` พร้อม `retryable=True`, `retry_after_s`, `error` คืน `{\"status\": \"retry\", \"retry_after_s\": ...}`; (3) จับ `InvalidPayloadError` log ระดับ `error` ชื่อ `\"ticket_invalid_payload\"` พร้อม `retryable=False`, `error` คืน `{\"status\": \"rejected\", \"error\": ...}`",
      "ห้ามใช้ bare `except:` และห้ามใช้ `print()` ใน `ticket_logger.py`",
    ],
    starter: {
      language: "python",
      filename: "ticket_logger.py",
      code: `import structlog


class AppError(Exception):
    """Base exception for ticket pipeline."""


class InvalidPayloadError(AppError):
    """Raised when input payload violates contract."""


class RetryableError(AppError):
    """Raised on transient upstream failures."""

    def __init__(self, message: str, retry_after_s: float = 1.0) -> None:
        super().__init__(message)
        self.retry_after_s = retry_after_s


def redact_secret(value: str) -> str:
    # TODO: คืน "***" ถ้ายาว < 4 มิฉะนั้นคืน "***" + 4 ตัวท้าย
    raise NotImplementedError


def validate_and_dispatch(payload: dict) -> str:
    # TODO: ตรวจ ticket_id และ upstream_status (429 / 503) แล้วโยน custom exception ให้ถูกชนิด
    raise NotImplementedError


def handle_ticket(payload: dict, request_id: str) -> dict[str, object]:
    # TODO: bind request_id กับ structlog, แยกจับ RetryableError vs InvalidPayloadError และห้าม log secret ดิบ
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_ticket_logger.py",
      code: `import pytest
from structlog.testing import capture_logs
from ticket_logger import (
    AppError,
    InvalidPayloadError,
    RetryableError,
    handle_ticket,
    redact_secret,
    validate_and_dispatch,
)


def test_exception_hierarchy_and_redact():
    assert issubclass(InvalidPayloadError, AppError)
    assert issubclass(RetryableError, AppError)
    assert redact_secret("abc") == "***"
    assert redact_secret("sk-secret-9988") == "***9988"


def test_handle_ticket_success_logs_structured_and_redacts_token():
    raw_secret = "sk-live-secret-4321"
    with capture_logs() as cap:
        res = handle_ticket(
            {"ticket_id": "TKT-501", "api_token": raw_secret},
            request_id="req-ok-1",
        )

    assert res == {"status": "ok", "ticket_id": "TKT-501"}
    assert len(cap) == 1
    entry = cap[0]
    assert entry["log_level"] == "info"
    assert entry["event"] == "ticket_ok"
    assert entry["request_id"] == "req-ok-1"
    assert entry["ticket_id"] == "TKT-501"
    assert entry["api_token_redacted"] == "***4321"
    assert raw_secret not in str(entry)


def test_handle_ticket_retryable_error():
    with capture_logs() as cap:
        res = handle_ticket(
            {"ticket_id": "TKT-502", "upstream_status": 429},
            request_id="req-retry-2",
        )

    assert res == {"status": "retry", "retry_after_s": 2.0}
    assert len(cap) == 1
    entry = cap[0]
    assert entry["log_level"] == "warning"
    assert entry["event"] == "ticket_retryable_error"
    assert entry["request_id"] == "req-retry-2"
    assert entry["retryable"] is True
    assert entry["retry_after_s"] == 2.0


def test_handle_ticket_invalid_payload():
    with pytest.raises(InvalidPayloadError):
        validate_and_dispatch({"ticket_id": "BAD-1"})

    with capture_logs() as cap:
        res = handle_ticket({"ticket_id": "BAD-1"}, request_id="req-bad-3")

    assert res["status"] == "rejected"
    assert len(cap) == 1
    entry = cap[0]
    assert entry["log_level"] == "error"
    assert entry["event"] == "ticket_invalid_payload"
    assert entry["request_id"] == "req-bad-3"
    assert entry["retryable"] is False
`,
    },
    selfCheck: [
      "`InvalidPayloadError` และ `RetryableError` สืบทอดจาก `AppError` ทั้งคู่ และ `RetryableError` เก็บ `retry_after_s` ได้",
      "เมื่อใช้ `capture_logs()` ทุก log event มี `request_id` ผูกติดมาด้วยโดยอัตโนมัติ",
      "ค่า `api_token` ดิบ (`sk-live-secret-4321`) ไม่ปรากฏใน log เลย มีเฉพาะค่าที่ redact แล้ว (`***4321`)",
      "ไม่มี bare `except:` หรือ `print()` ในโค้ด",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์ และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 4 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `validate_and_dispatch` เช็ก `ticket_id = payload.get(\"ticket_id\")` ด้วย `isinstance(ticket_id, str) and ticket_id.startswith(\"TKT-\")` ก่อน แล้วค่อยเช็ก `payload.get(\"upstream_status\") in {429, 503}`",
      },
      {
        body: "ใน `handle_ticket` สร้าง `log = structlog.get_logger(\"ticket_pipeline\").bind(request_id=request_id)` แล้ววาง `try: ticket_id = validate_and_dispatch(payload)` ตามด้วย `except RetryableError as err:` และ `except InvalidPayloadError as err:`",
      },
      {
        body: "โครงของ `redact_secret` และ `validate_and_dispatch` พร้อมแล้ว — เหลือเติมการ log และคืนค่า dict ใน `handle_ticket` ให้ตรงสเปก",
        code: {
          language: "python",
          filename: "hint-d006-l3.py",
          code: `import structlog


def redact_secret(value: str) -> str:
    if len(value) < 4:
        return "***"
    return f"***{value[-4:]}"


def validate_and_dispatch(payload: dict) -> str:
    ticket_id = payload.get("ticket_id")
    if not isinstance(ticket_id, str) or not ticket_id.startswith("TKT-"):
        raise InvalidPayloadError("ticket_id must start with 'TKT-'")
    if payload.get("upstream_status") in {429, 503}:
        raise RetryableError("upstream busy", retry_after_s=2.0)
    return ticket_id


def handle_ticket(payload: dict, request_id: str) -> dict[str, object]:
    log = structlog.get_logger("ticket_pipeline").bind(request_id=request_id)
    # TODO: try validate_and_dispatch(payload) -> log.info("ticket_ok", ...)
    # except RetryableError / except InvalidPayloadError
    raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "`structlog.testing.capture_logs()` ดัก event ที่ log ไว้เป็น list ของ dict ทำให้ assert ฟิลด์ต่าง ๆ ได้แม่นยำ",
    },
  },

  mistakes: [
    {
      title: "ใช้ bare `except:` หรือ `except Exception: pass`",
      symptom: "โปรแกรมซ่อนบั๊กจริง (เช่น `KeyError`, `AttributeError`) หรือกด Ctrl+C หยุดสคริปต์ไม่ได้เพราะจับ `KeyboardInterrupt` ไปด้วย",
      fix: "จับเฉพาะ exception ที่ตั้งใจจัดการ เช่น `except RetryableError:` หรือ `except InvalidPayloadError:` และ log บริบททุกครั้ง",
    },
    {
      title: "ใส่ f-string ที่มีค่าตัวแปรลงในชื่อ event ของ `structlog`",
      symptom: "ได้ log เช่น `{\"event\": \"Ticket TKT-101 failed\"}` ซึ่งค้นหาตามคีย์ `ticket_id` หรือนับจำนวนเหตุการณ์ซ้ำในระบบ log ไม่ได้",
      fix: "ใช้ชื่อ event แบบคงที่ (`\"ticket_failed\"`) แล้วส่งข้อมูลแปรผันเป็น keyword arguments เช่น `ticket_id=\"TKT-101\"`",
    },
    {
      title: "โยน custom exception ใหม่โดยไม่ใส่ `from err`",
      symptom: "เวลาเกิดปัญหาใน production เห็นแต่ข้อความปลายทาง แต่ traceback ต้นเหตุเดิมหายไปหมด",
      fix: "ใช้ `raise InvalidPayloadError(\"...\") from err` เสมอเมื่อแปลง exception หนึ่งไปเป็นอีกชนิดหนึ่ง",
    },
    {
      title: "Log ทั้ง `payload` ดิบที่มี API key หรือข้อมูล PDPA",
      symptom: "เบอร์โทร เลขบัตรประชาชน หรือ secret token ถูกเก็บค้างอยู่ในไฟล์ log และระบบ monitoring ของทีม",
      fix: "เลือก log เฉพาะฟิลด์ที่จำเป็น (`ticket_id`, `channel`, `latency_ms`) และ redact/mask ฟิลด์อ่อนไหวก่อนส่งเข้า logger",
    },
  ],

  quiz: {
    intro: "4 ข้อ ทดสอบความเข้าใจ Custom Exception Hierarchy, Exception Chaining และ `structlog`",
    questions: [
      mc(
        "d006-q1",
        "เหตุใดการใช้ `except:` (bare except) โดยไม่ระบุชนิดจึงอันตรายกว่าการระบุชนิด exception ชัดเจน?",
        [
          ["เพราะ bare `except:` ทำงานช้ากว่าการระบุชนิด 100 เท่า", "ปัญหาหลักไม่ใช่ความเร็ว แต่คือการจับ exception ที่ไม่ควรถูกกลืน"],
          ["เพราะ bare `except:` จับได้เฉพาะ `ValueError` เท่านั้น", "ตรงข้าม — bare `except:` จับทุกอย่างใต้ `BaseException`"],
          ["เพราะ bare `except:` จับ `BaseException` ทั้งหมดรวมถึง `KeyboardInterrupt` และ `SystemExit` รวมถึงซ่อนบั๊กที่ไม่คาดคิด", "ถูก — ทำให้หยุดโปรแกรมด้วย Ctrl+C ไม่ได้และกลืนความผิดพลาดที่ควรรีบแก้"],
          ["เพราะ Python 3.12 ลบ bare `except:` ออกไปแล้ว", "Python 3.12 ยังรองรับในเชิงไวยากรณ์ แต่ linter (Ruff `E722`) และมาตรฐานทีมห้ามใช้"],
        ],
        "C",
        "Bare `except:` จับทั้ง `KeyboardInterrupt` และบั๊กโปรแกรมที่ควรฟ้องออกมาทันที จึงควรระบุชนิด exception ที่ตั้งใจรับมือเสมอ",
        "ทำไมจึงไม่ควรเขียน bare `except:` ในโค้ด Python production?",
        "เพราะมันจับทุก `BaseException` รวมถึง `KeyboardInterrupt` / `SystemExit` และกลืนบั๊กที่ไม่คาดคิดเงียบ ๆ",
      ),
      mc(
        "d006-q2",
        "เมื่อระบบ AI ได้รับข้อมูลที่มีฟิลด์ `ticket_id` ผิดรูปแบบ ควรโยน exception กลุ่มใดในลำดับชั้น `AppError`?",
        [
          ["`InvalidPayloadError(AppError)` เพื่อบอกผู้เรียกชัดเจนว่าข้อมูลผิดสัญญาและ **ไม่ควร retry**", "ถูก — การแยก `InvalidPayloadError` จาก `RetryableError` ทำให้ระบบไม่ยิงซ้ำอย่างไร้ประโยชน์"],
          ["`RetryableError(AppError)` เพื่อให้ระบบลองยิงซ้ำอีก 5 ครั้งเผื่อผ่าน", "ข้อมูลผิดรูปยิงซ้ำกี่ครั้งก็ยังผิด — ไม่ควร retry"],
          ["`KeyboardInterrupt` เพื่อให้โปรแกรมปิดตัวทันที", "`KeyboardInterrupt` สงวนไว้สำหรับการกดหยุดโดยผู้ใช้"],
          ["ไม่ต้องโยนอะไร คืน `None` เงียบ ๆ", "การคืน `None` เงียบ ๆ ทำลายหลัก fail-fast และสร้างบั๊กปลายทาง"],
        ],
        "A",
        "หลักการออกแบบ Custom Exception คือจัดกลุ่มตามการตัดสินใจของฝั่งผู้เรียก: `RetryableError` → ลองใหม่ได้, `InvalidPayloadError` → ปฏิเสธทันที",
        "ความต่างเชิงปฏิบัติระหว่าง `RetryableError` กับ `InvalidPayloadError` คืออะไร?",
        "`RetryableError` เป็นปัญหาชั่วคราวที่ควร retry (เช่น 429/503/timeout) ส่วน `InvalidPayloadError` คือข้อมูลผิดสัญญาที่ต้องปฏิเสธทันที ห้าม retry",
      ),
      mc(
        "d006-q3",
        "คำสั่ง `log.error(...)` แบบใดใช้พลังของ `structlog` ได้ถูกต้องและสืบค้นในระบบ log ได้ดีที่สุด?",
        [
          ["`print(f\"ERROR {request_id} ticket={ticket_id} status={status}\")`", "`print()` ไม่มี log level, timestamp หรือโครงสร้าง JSON มาตรฐาน"],
          ["`log.error(f\"Ticket {ticket_id} failed with status {status}\")`", "การฝังตัวแปรในชื่อ event ทำให้จัดกลุ่มและคิวรีตามฟิลด์ `status` หรือ `ticket_id` ไม่ได้"],
          ["`log.error(\"ticket_failed\", payload=full_raw_payload_with_api_key)`", "เสี่ยงรั่วไหล secret และข้อมูลส่วนบุคคล (PDPA) ลงระบบ log"],
          ["`log.error(\"ticket_failed\", ticket_id=ticket_id, status=status, retryable=False)`", "ถูก — ชื่อ event คงที่ ตัวแปรแยกเป็นคีย์ชัดเจน และไม่รั่วไหล secret"],
        ],
        "D",
        "Structured logging ที่ดีต้องมีชื่อ event คงที่ ส่งบริบทเป็น key-value ชัดเจน และหลีกเลี่ยงการบันทึกความลับหรือ PII",
        "ทำไมใน `structlog` จึงควรส่ง `ticket_id=tid` เป็น keyword argument แทนการเขียน f-string ในชื่อ event?",
        "เพื่อให้ชื่อ event คงที่สำหรับจัดกลุ่ม alert และให้เครื่องมือ log คิวรีหรือกรองตามฟิลด์ `ticket_id` ได้โดยตรง",
      ),
      mc(
        "d006-q4",
        "ประโยค `raise InvalidPayloadError(\"bad priority\") from err` มีประโยชน์สำคัญอย่างไร?",
        [
          ["ช่วยให้ Python ข้ามการพิมพ์ traceback ไปเลย", "ตรงข้าม — มันช่วยเก็บ traceback ต้นฉบับไว้อย่างครบถ้วน"],
          ["เชื่อมสาเหตุเดิม (`err`) เข้ากับ custom exception ใหม่ ทำให้เห็นทั้งข้อความระดับธุรกิจและต้นตอทางเทคนิค", "ถูก — Exception chaining (`from err`) เป็นมาตรฐานสำคัญของการดีบักใน production"],
          ["ทำให้ `InvalidPayloadError` กลายเป็น warning ที่ไม่หยุดโปรแกรม", "`raise` ยังคงหยุด flow ตามปกติ"],
          ["สั่งให้ `structlog` บันทึก log ให้อัตโนมัติโดยไม่ต้องเรียก logger", "`raise ... from` เป็นกลไกของภาษา Python ไม่ได้เรียก logger เอง"],
        ],
        "B",
        "`raise CustomError(...) from err` รักษา `__cause__` ไว้ครบถ้วน เพื่อให้ทั้งโค้ดจับประเภท error ได้แม่นและคนดีบักเห็นต้นเหตุเดิม",
        "การเติม `from err` ท้ายคำสั่ง `raise CustomError(...)` มีไว้เพื่ออะไร?",
        "เพื่อเชื่อม exception ต้นเหตุเดิมเข้ากับ custom exception ใหม่ (exception chaining) ไม่ให้ร่องรอยต้นตอหายไปจาก traceback",
      ),
    ],
  },

  takeaways: [
    "สร้างลำดับชั้น {{custom-exception}} (`AppError` → `RetryableError`, `InvalidPayloadError`) เพื่อแยกปัญหาที่ลองใหม่ได้ออกจากข้อมูลผิดสัญญา",
    "หลีกเลี่ยง bare `except:` และ `except Exception: pass` เสมอ — จับเฉพาะ error ที่จัดการได้และเชื่อมต้นเหตุด้วย `raise ... from err`",
    "ใช้ {{structlog}} ส่งออก JSON log ที่มีชื่อ event คงที่ + key-value ชัดเจน และใช้ `.bind(request_id=...)` ติดตามทุกขั้นของคำขอ",
    "ซ่อนหรือตัดข้อมูลอ่อนไหว (API key, เบอร์โทร, ข้อมูล {{pdpa}}) ออกก่อนบันทึก log และทดสอบ log ได้ด้วย `structlog.testing.capture_logs()`",
  ],

  reviewCards: [
    rc(
      "d006-rc-1",
      "เหตุใดจึงควรแยก `RetryableError` ออกจาก `InvalidPayloadError` ภายใต้คลาสฐาน `AppError`?",
      "เพื่อให้ผู้เรียกหรือตัวจัดการ retry รู้ชัดเจนว่า error ใดลองใหม่ได้ (timeout/429/503) และ error ใดควรปฏิเสธทันที (ข้อมูลผิดสัญญา)",
    ),
    rc(
      "d006-rc-2",
      "ใน `structlog` เมธอด `.bind(request_id=\"req-1\")` ทำหน้าที่อะไร?",
      "สร้าง logger ย่อยที่แนบคีย์ `request_id=\"req-1\"` ลงในทุก log event ที่เรียกผ่าน logger นั้นโดยอัตโนมัติ",
    ),
    rc(
      "d006-rc-3",
      "จะเขียน unit test ด้วย `pytest` เพื่อตรวจสอบว่าฟังก์ชันบันทึก log ที่มีคีย์และระดับถูกต้องด้วย `structlog` ได้อย่างไร?",
      "ใช้ context manager `with structlog.testing.capture_logs() as cap:` แล้วตรวจสอบ dict ของแต่ละ event ใน `cap`",
    ),
  ],

  sources: [
    { label: "structlog Official Docs — Getting Started", href: "https://www.structlog.org/en/stable/getting-started.html" },
    { label: "structlog Official Docs — Testing (`capture_logs`)", href: "https://www.structlog.org/en/stable/testing.html" },
    { label: "Python 3 Official Docs — Errors and Exceptions (Exception Chaining)", href: "https://docs.python.org/3/tutorial/errors.html#exception-chaining" },
    { label: "Python 3 Official Docs — Built-in Exceptions Hierarchy", href: "https://docs.python.org/3/library/exceptions.html#exception-hierarchy" },
  ],

  glossary: [
    "structlog",
    "custom-exception",
    "fail-fast",
    "payload",
    "pdpa",
    "pytest",
    "ruff",
  ],
});
