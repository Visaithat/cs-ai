import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D076 — Phase 3 / Block B19 (Review Day)
 * Review: Quiz + Build streaming CLI chat with token/cost counter
 */
export const d076: Lesson = defineLesson({
  day: 76,
  titleTh: "ทบทวน B19: สร้าง Streaming CLI Chat พร้อมตัวนับ Token, TTFT และต้นทุน",
  tagline: "30 นาที · รอบทบทวน D73–D75 + D19/D23 · ประกอบ Streaming Chat CLI ที่แยก roles, วัด TTFT, นับต้นทุน USD/THB และเทสต์ครบด้วย mock stream",
  icon: "rocket",
  visual: {
    id: "streaming-ttft",
    title: "ทบทวน B19: สร้าง Streaming CLI Chat พร้อมตัวนับ Token, TTFT และต้นทุน",
    caption: "รวม System/User Roles + SSE Async Generator + Token/Cost Ledger ทดสอบครบด้วย mock stream บนเครื่อง",
    alt: "แผนภาพ Streaming CLI Chat พร้อมตัวนับ token และต้นทุน",
  },
  requiresApiKey: true,
  apiKeyNote: "รองรับทั้ง LLM API จริงและโหมด mock / local Ollama บนเครื่องเพื่อฝึกและรันเทสต์ฟรี",
  tools: ["Official LLM SDK", "httpx", "asyncio", "pytest"],

  bigPicture: [
    {
      node: 2,
      heading: "ร้อยต่อ Roles + Context + Streaming เข้าด้วยกันในหนึ่ง Session",
      body: "ตลอด Block B19 เราแยกเรียนแต่ละชิ้นส่วน (Roles/Sampling, {{context-engineering}}, และ {{sse}} Streaming) — วันนี้เราจะประกอบทั้งสามส่วนเข้ากับประวัติการคุยแบบหลายรอบ (multi-turn) ที่มีเพดานความยาวบริบท",
      lessonNote: "เราจะสร้าง `StreamingChatSession` ที่เก็บ `system` role แยกขาด, คุม sliding window ของประวัติแชต และส่งเข้า async stream backend",
    },
    {
      node: 3,
      heading: "พิสูจน์พฤติกรรม Multi-Turn, TTFT และ Cancellation ด้วย Mock Stream",
      body: "CLI ที่ต้องรอคนพิมพ์โต้ตอบหรือยิง API จริงตลอดเวลาไม่สามารถทำ regression test ใน CI ได้ การแยก `StreamBackend(Protocol)` ทำให้เราจำลองทั้งบทสนทนาหลายรอบและการกด Ctrl+C ใน {{pytest}}",
      lessonNote: "ชุดทดสอบวันนี้จะตรวจสอบความถูกต้องของประวัติการคุย, ตัวเลข {{ttft}}, ยอดสะสม token/ต้นทุน และการปิด stream เมื่อถูกยกเลิก",
    },
    {
      node: 4,
      heading: "สร้างประสบการณ์ CLI Chat ที่ตอบไวและหยุดกลางทางได้ไม่พัง",
      body: "ต่อยอดจากทักษะ Async Generator (Day 19) และ CLI Tooling ด้วย {{typer}} (Day 23) ให้ผู้ใช้เห็นคำตอบไหลทันที, เห็นสถานะ `TTFT` + ต้นทุนต่อรอบ และกด Ctrl+C เพื่อหยุดเฉพาะรอบปัจจุบันโดยไม่ทำลายประวัติรอบก่อน",
      lessonNote: "หลังจบแบบฝึกหัด คุณจะได้โค้ด CLI Chat ที่รันได้ทั้งกับ Mock Stream, Local Ollama และ Cloud API",
    },
    {
      node: 5,
      heading: "บันทึก Token & Cost Ledger สะสมตลอดเซสชัน",
      body: "ทุก turn ในแชตหลายรอบจะส่งประวัติเก่ากลับเข้าไปเป็น input tokens ซ้ำอีกครั้ง ทำให้ค่า `prompt_tokens` โตขึ้นเรื่อย ๆ การมี `CostLedger` แสดงทั้ง USD และ THB ทำให้เห็นต้นทุนจริงของแชตหลายรอบด้วยตาตัวเอง",
      lessonNote: "รูปแบบ `CostLedger` นี้คือต้นแบบของตัวติดตามต้นทุนก่อนเข้าสู่ Structured Outputs (Block B20) และ Prompt Caching (Day 79)",
    },
  ],

  objectives: [
    "**ทบทวนแบบผสม (Interleaved Recall)** แนวคิดจาก D73 (Roles/Sampling/Protocol), D74 (Delimiters/Few-Shot/Abstention), D75 (SSE/TTFT/UTF-8/Cancel) ร่วมกับ D19 (Async Generators) และ D23 (CLI UX)",
    "**สร้าง `StreamingChatSession`** ที่รองรับบทสนทนาหลายรอบพร้อม sliding-window history cap, แยก `system` role ชัดเจน, วัด {{ttft}} และสะสมจำนวน token + ต้นทุน USD/THB ผ่าน `CostLedger`",
    "**จัดการ Cancellation กลางรอบอย่างปลอดภัย** (ปิด stream ผ่าน `aclosing`, ไม่บันทึกคำตอบครึ่ง ๆ กลาง ๆ ลงประวัติที่เสียหาย และยังเก็บยอด ledger เดิมไว้ครบ) พร้อมพิสูจน์ใน `pytest` ด้วย {{asyncio}} และ {{mocking}} async stream",
  ],

  prerequisites: [
    "ผ่านหรือทบทวน D73 (LLM APIs), D74 (Context Engineering) และ D75 (Streaming SSE & Cancellation)",
    "พื้นฐาน Async Generators (Day 19) และ CLI Tooling ด้วย {{typer}} (Day 23)",
    "รันและเทสต์ทั้งหมดบนเครื่องได้ฟรี 100% ด้วย mock stream (และสลับต่อ Ollama/Cloud API ได้ทันที)",
  ],

  setup: {
    intro: "สร้างโฟลเดอร์งานทบทวน Day 76 ด้วย `uv` พร้อม `openai`, `httpx`, `typer` และ `pytest` เพื่อประกอบ Streaming CLI Chat พร้อมตัวนับต้นทุน",
    commands: `uv init ai-day76-review && cd ai-day76-review
uv add openai httpx typer
uv add --dev pytest ruff
uv run python -c "import asyncio, httpx, typer; print('B19 Review CLI ready!')"`,
    steps: [
      ["init", "สร้างโฟลเดอร์โปรเจกต์ `ai-day76-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `openai`, `httpx`, `typer`, `pytest` และ `ruff`"],
      ["verify", "ยืนยันว่าสภาพแวดล้อมพร้อมรันทั้ง CLI และ `pytest`"],
    ],
    note: "แผนเวลา 30 นาทีสำหรับวันทบทวน: ทำควิซ Interleaved Recall 10 นาที → สร้าง `streaming_chat.py` และรันเทสต์ 15 นาที → บันทึกจุดที่ยังพลาดเข้า Error Log 5 นาที",
  },

  concepts: [
    {
      id: "b19-synthesis-architecture",
      title: "1 · ร้อยต่อจิ๊กซอว์ B19 (+ D19 & D23): สถาปัตยกรรม Streaming Chat CLI",
      paragraphs: [
        "แอปแชต {{llm}} ที่ใช้งานได้จริงในระดับวิศวกรรมไม่ได้มีแค่ลูป `while True: input()` แต่ประกอบจาก 4 ชั้นที่ทำงานประสานกัน: (1) **Context & History Layer** (D73–D74) แยก `system` prompt ออกจากประวัติ `user`/`assistant` และตัดประวัติเก่าตาม sliding window, (2) **Stream Transport Protocol** (D73 + D19) หุ้ม `AsyncOpenAI` / local Ollama ไว้หลัง async iterator interface, (3) **Streaming & Cancellation Consumer** (D75) วัด {{ttft}} และปิด stream ด้วย `aclosing()`, และ (4) **CLI & Cost Ledger** (D23) แสดงผลลัพธ์ทีละ token พร้อมสรุปงบประมาณ",
        "เมื่อแยก 4 ชั้นนี้ออกจากกันชัดเจน คุณสามารถสลับหน้ากากจาก CLI (`typer`) ไปเป็น FastAPI SSE Endpoint ใน Phase 5 ได้โดยแทบไม่ต้องแก้แกนกลางของ `StreamingChatSession` เลย",
      ],
      analogy: "เหมือนห้องควบคุมรถไฟ: รางและเครื่องยนต์ (`StreamBackend`), ตารางเดินรถ (`History + System Rules`), มาตรวัดความเร็วและมิเตอร์น้ำมัน (`TTFT + CostLedger`), และคันโยกเบรกฉุกเฉิน (`aclosing + Cancellation`) แยกหน้าที่กันชัดแต่ทำงานประสานกันเป็นระบบเดียว",
      bullets: [
        "**D73**: แยก `system` role, ตั้ง {{temperature}} และ `max_tokens` ชัดเจน, หุ้ม SDK หลัง `Protocol`",
        "**D74**: คุมโครงสร้าง context และจำกัดประวัติ (`max_history_turns`) เพื่อไม่ให้บริบทบวมจนเสียคุณภาพ",
        "**D75 + D19**: อ่าน async {{sse}} stream, วัด `TTFT` ที่ delta แรกที่ไม่ว่าง และปิด stream ด้วย `aclosing`",
        "**D23**: แยก CLI I/O (`print(..., flush=True)`) ออกจาก core logic ผ่าน callback `on_delta` เพื่อเทสต์ง่าย",
      ],
      whyTitle: "Why this matters — แยก Core Session ออกจาก `input()` / `print()` ทำให้เทสต์ได้ 100%",
      whyParagraphs: [
        "มือใหม่มักเขียน `input()`, `print()`, `AsyncOpenAI` และสูตรคำนวณต้นทุนปนอยู่ในฟังก์ชัน `main()` เดียวกัน ผลคือไม่สามารถเขียน `pytest` ทดสอบพฤติกรรม multi-turn หรือการกด Ctrl+C ได้เลย",
        "เพียงรับ `on_delta: Callable[[str], None]` และฉีด `StreamBackend` เข้าไป คุณจะเทสต์ทุกฟีเจอร์ของ CLI Chat ได้อัตโนมัติในเวลาไม่ถึง 0.2 วินาที",
      ],
    },
    {
      id: "multi-turn-token-growth-and-ledger",
      title: "2 · ต้นทุนแชตหลายรอบ (Multi-Turn) และการเก็บ Usage ในโหมด Streaming",
      paragraphs: [
        "ความจริงที่ทำให้มือใหม่ตกใจเมื่อเปิดดูบิล API คือ **LLM ไม่มีหน่วยความจำในตัว (stateless)** ทุกครั้งที่คุณส่งคำถามรอบที่ 5 แอปต้องส่ง `system` + ประวัติรอบที่ 1–4 + คำถามรอบที่ 5 กลับไปใหม่ทั้งหมด นั่นหมายความว่า `prompt_tokens` สะสมตลอดการคุย 10 รอบจะโตแบบผลรวมเลขคณิต (คล้าย `O(k²)` ตามจำนวนรอบ!) หากไม่ตั้ง **Sliding Window** (เช่น เก็บแค่ 6 รอบล่าสุด)",
        "อีกจุดเฉพาะของโหมด Streaming ที่ต้องรู้คือ: ใน OpenAI-compatible SSE stream ปกติ chunk ระหว่างทางจะไม่มีข้อมูล `usage` — คุณต้องส่ง **`stream_options={\"include_usage\": True}`** เพื่อให้เซิร์ฟเวอร์แนบ final usage chunk (`prompt_tokens`, `completion_tokens`) มาก่อนจบ `[DONE]` แล้วนำมาบวกเข้า `CostLedger` เพื่อแสดงต้นทุนทั้ง USD และ THB อย่างแม่นยำ",
      ],
      analogy: "การคุยกับ LLM แบบไม่ตัดประวัติเหมือนการโทรคุยที่ทุกประโยคใหม่คุณต้องทวนบทสนทนาตั้งแต่ต้นสายซ้ำอีกรอบ — ยิ่งคุยนาน ค่าโทรต่อประโยคยิ่งแพงขึ้นเรื่อย ๆ จึงต้องตั้งเพดานเก็บเฉพาะไม่กี่รอบล่าสุด",
      code: {
        language: "python",
        filename: "cost_ledger.py",
        code: `from dataclasses import dataclass


@dataclass(frozen=True)
class ModelPricing:
    input_per_1m_usd: float = 0.15
    output_per_1m_usd: float = 0.60
    thb_per_usd: float = 35.0


class CostLedger:
    def __init__(self, pricing: ModelPricing) -> None:
        self.pricing = pricing
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.turns = 0

    def record(self, prompt_tokens: int, completion_tokens: int) -> float:
        if prompt_tokens < 0 or completion_tokens < 0:
            raise ValueError("token counts must be >= 0")
        self.prompt_tokens += prompt_tokens
        self.completion_tokens += completion_tokens
        self.turns += 1
        return self._calc_usd(prompt_tokens, completion_tokens)

    def _calc_usd(self, p: int, c: int) -> float:
        return (p * self.pricing.input_per_1m_usd + c * self.pricing.output_per_1m_usd) / 1_000_000

    @property
    def total_usd(self) -> float:
        return self._calc_usd(self.prompt_tokens, self.completion_tokens)

    @property
    def total_thb(self) -> float:
        return self.total_usd * self.pricing.thb_per_usd`,
        caption: "แยก `CostLedger` ออกมาเป็นคลาสเดี่ยวเพื่อคำนวณทั้งต้นทุนรายรอบและยอดสะสมตลอดเซสชันอย่างแม่นยำ",
      },
      whyTitle: "Why this matters — ปูทางสู่ Prompt Caching และ Context Budgeting",
      whyParagraphs: [
        "เมื่อคุณเห็นตัวเลข `prompt_tokens` ที่เพิ่มขึ้นทุกรอบด้วยตาตัวเอง คุณจะเข้าใจทันทีว่าเหตุใด `max_history_turns` และ {{prompt-caching}} (Day 79) จึงช่วยประหยัดค่า API ในแอปแชตได้ 50–80%",
        "การรายงานต้นทุนเป็นบาท (THB) ควบคู่กับ USD ยังช่วยให้ทีมธุรกิจในไทยประเมินงบประมาณต่อผู้ใช้ต่อเดือนได้ทันที",
      ],
    },
    {
      id: "atomic-turn-cancellation",
      title: "3 · รักษาความสะอาดของประวัติแชตเมื่อผู้ใช้กด Ctrl+C กลางรอบ",
      paragraphs: [
        "ลองคิดดูว่าจะเกิดอะไรขึ้นถ้าผู้ใช้พิมพ์คำถามรอบที่ 3 แล้วกด **Ctrl+C** ยกเลิกระหว่างที่โมเดลพึ่งพ่นออกมาได้ครึ่งประโยค: ถ้าคุณเผลอ `append` ข้อความ `user` ลงใน `self._history` ไว้ก่อนเริ่ม stream แต่ไม่ได้ `append` คำตอบ `assistant` ตอนโดน `CancelledError` ประวัติแชตจะเสียรูป (มี `user` สองอันติดกันโดยไม่มี `assistant` คั่น) ซึ่งบาง LLM API จะปฏิเสธด้วย HTTP 400!",
        "วิธีออกแบบที่ปลอดภัยคือ **Atomic Turn Commit**: ประกอบรายการ `request_messages` ชั่วคราวส่งเข้า backend โดย **ยังไม่แก้ไข `self._history` จนกว่า stream จะจบสมบูรณ์** — หากเกิด `CancelledError` กลางทาง `aclosing` จะปิด stream ทันที, ประวัติของรอบ 1–2 ยังสมบูรณ์ 100%, และผู้ใช้สามารถพิมพ์คำถามใหม่ต่อได้เลยโดยเซสชันไม่พัง",
      ],
      analogy: "เหมือน Transaction ในฐานข้อมูล: ถ้าโอนเงินสะดุดกลางทาง ระบบจะ rollback ไม่ทิ้งรายการครึ่ง ๆ กลาง ๆ ค้างไว้ในบัญชี เพื่อให้ทำรายการถัดไปได้อย่างปลอดภัย",
      whyTitle: "Why this matters — แอปที่รอดจาก Ctrl+C คือแอปที่ใช้งานได้จริง",
      whyParagraphs: [
        "ใน CLI หรือเว็บแชต ผู้ใช้กดยกเลิกกลางทางเป็นเรื่องปกติมาก การทำ Atomic Turn Commit ป้องกันทั้งประวัติแชตเพี้ยนและ HTTP 400 ในรอบถัดไป",
        "นอกจากนี้การแยก `try/except KeyboardInterrupt` ไว้เฉพาะชั้น CLI loop ยังช่วยให้พิมพ์สรุป `CostLedger` ก่อนออกจากโปรแกรมได้อย่างสุภาพ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Streaming CLI Session ≈ React `useChat` Hook + Token Telemetry",
      body: [
        "ถ้าคุณเคยสร้างหน้าแชตด้วย Vercel AI SDK (`useChat`) คุณจะคุ้นเคยกับโครงสร้างเดียวกันนี้: เก็บ array `messages` ที่มี sliding window, ส่งเข้า streaming transport, อัปเดต UI ผ่าน `onDelta` callback และมีปุ่ม `stop()` ที่ยกเลิก request โดยไม่ทำให้ state พัง",
        "ใน Python `StreamingChatSession` คือแกน state/transport เดียวกันที่นำมาเชื่อมกับ `typer` CLI ในวันนี้ และพร้อมต่อเข้ากับ FastAPI ใน Phase 5",
      ],
      table: [
        ["`StreamingChatSession` + `on_delta`", "`useChat()` state + streaming chunk handler"],
        ["Atomic Turn Commit on `CancelledError`", "Rollback optimistic message on `AbortError`"],
        ["`stream_options={'include_usage': True}`", "Final SSE usage frame before `[DONE]`"],
        ["`CostLedger` (USD / THB)", "Per-session token & billing telemetry store"],
      ],
    },
    student: {
      title: "First-Year Note — วิธีเช็กตัวเองในวันทบทวน (Review Day Strategy)",
      body: [
        "เป้าหมายของวันทบทวนไม่ใช่การจำโค้ดทุกบรรทัดได้เป๊ะ แต่คือการ **ประกอบชิ้นส่วนจากหลายบทเข้าด้วยกันได้โดยไม่สับสน**: ถ้าระหว่างทำโจทย์คุณติดตรง `aclosing` (D75) หรือ `Protocol` (D73) ให้เปิดกลับไปดูเฉพาะจุดนั้นแล้วจดสั้น ๆ ลง Error Log",
        "การดึงความรู้จาก D19, D23, D73–D75 มาใช้พร้อมกันในโจทย์เดียวคือเทคนิค **Interleaved Practice** ที่ช่วยให้จำได้แม่นและนำไปประยุกต์ในโปรเจกต์จริงได้ดีกว่าการอ่านทวนทีละบทแยกกัน",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ประกอบ `StreamingChatSession` ขนาดกะทัดรัดที่คุยโต้ตอบ 2 รอบผ่าน `MockStreamBackend` แสดงคำตอบแบบไหลทีละก้อน วัด `TTFT` รายรอบ และพิมพ์ใบสรุป `CostLedger` ทั้ง USD และ THB",
    steps: [
      {
        title: "1 · นิยาม `StreamEvent`, `StreamBackend(Protocol)` และ `MockStreamBackend`",
        explain: "ใช้ `StreamEvent` เพียงคลาสเดียวรองรับทั้ง content delta ระหว่างทางและ final usage chunk ตอนจบ stream (เหมือน `include_usage=True` ของ API จริง)",
        code: {
          language: "python",
          filename: "worked_day76.py",
          code: `import asyncio
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class StreamEvent:
    delta: str = ""
    prompt_tokens: int | None = None
    completion_tokens: int | None = None


class StreamBackend(Protocol):
    def stream_chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.2,
        max_tokens: int = 256,
    ) -> AsyncIterator[StreamEvent]: ...


class MockStreamBackend:
    def __init__(self, scripted_replies: list[list[str]], delay: float = 0.02) -> None:
        self._replies = list(scripted_replies)
        self._delay = delay
        self.received_history_lengths: list[int] = []

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.2,
        max_tokens: int = 256,
    ) -> AsyncIterator[StreamEvent]:
        self.received_history_lengths.append(len(messages))
        chunks = self._replies.pop(0)
        prompt_tokens = sum(max(1, len(m["content"]) // 2) for m in messages)
        completion_tokens = 0
        for piece in chunks:
            await asyncio.sleep(self._delay)
            completion_tokens += max(1, len(piece) // 2)
            yield StreamEvent(delta=piece)
        # Final usage event ก่อนจบ stream
        yield StreamEvent(prompt_tokens=prompt_tokens, completion_tokens=completion_tokens)`,
        },
        output: `# StreamBackend Protocol พร้อมใช้งานทั้งกับ MockStreamBackend และ OpenAI/Ollama adapter`,
      },
      {
        title: "2 · รันบทสนทนา 2 รอบพร้อม `TTFT`, Sliding Window และ `CostLedger`",
        explain: "สังเกตว่าในรอบที่ 2 จำนวน `messages` ที่ส่งเข้า backend เพิ่มจาก `2` (`system + user`) เป็น `4` (`system + user1 + assistant1 + user2`) และ `CostLedger` สะสมทั้ง token และต้นทุนให้อัตโนมัติ",
        code: {
          language: "python",
          filename: "worked_day76.py",
          code: `from contextlib import aclosing
import time
from cost_ledger import CostLedger, ModelPricing


async def run_demo() -> None:
    backend = MockStreamBackend(
        scripted_replies=[
            ["สวัสดีครับ ", "มีอะไรให้ช่วยไหมครับ"],
            ["ค่าจัดส่งฟรีเมื่อยอดเกิน ", "500 บาทครับ"],
        ]
    )
    ledger = CostLedger(ModelPricing(input_per_1m_usd=0.15, output_per_1m_usd=0.60, thb_per_usd=35.0))
    history: list[dict[str, str]] = []
    system_prompt = "คุณคือผู้ช่วยร้านค้าออนไลน์ภาษาไทย ตอบสั้นสุภาพ"

    for user_q in ["สวัสดี", "ส่งฟรีขั้นต่ำกี่บาท?"]:
        req_msgs = [{"role": "system", "content": system_prompt}, *history, {"role": "user", "content": user_q}]
        t0 = time.perf_counter()
        ttft: float | None = None
        parts: list[str] = []
        p_tok = c_tok = 0

        async with aclosing(backend.stream_chat(req_msgs)) as stream:
            async for ev in stream:
                if ev.delta:
                    if ttft is None:
                        ttft = time.perf_counter() - t0
                    parts.append(ev.delta)
                if ev.prompt_tokens is not None:
                    p_tok = ev.prompt_tokens
                if ev.completion_tokens is not None:
                    c_tok = ev.completion_tokens

        reply = "".join(parts)
        turn_usd = ledger.record(p_tok, c_tok)
        history.extend([{"role": "user", "content": user_q}, {"role": "assistant", "content": reply}])
        print(f"Q: {user_q} -> A: {reply} | TTFT={ttft:.3f}s | tok=({p_tok},{c_tok}) | \${turn_usd:.6f}")

    print(
        f"SESSION TOTAL | turns={ledger.turns} | msgs_sent={backend.received_history_lengths} "
        f"| tokens={ledger.prompt_tokens + ledger.completion_tokens} | THB={ledger.total_thb:.5f}"
    )


asyncio.run(run_demo())`,
        },
        output: `Q: สวัสดี -> A: สวัสดีครับ มีอะไรให้ช่วยไหมครับ | TTFT=0.022s | tok=(28,15) | $0.000013
Q: ส่งฟรีขั้นต่ำกี่บาท? -> A: ค่าจัดส่งฟรีเมื่อยอดเกิน 500 บาทครับ | TTFT=0.021s | tok=(54,18) | $0.000019
SESSION TOTAL | turns=2 | msgs_sent=[2, 4] | tokens=115 | THB=0.00112`,
      },
      {
        title: "3 · หุ้มด้วย CLI Entrypoint (`typer`) ที่รองรับ Ctrl+C อย่างสุภาพ",
        explain: "จับ `KeyboardInterrupt` ในลูป CLI เพื่อไม่ให้โปรแกรมพ่น traceback ยาว ๆ และพิมพ์สรุปต้นทุน `CostLedger` ก่อนปิดเสมอ",
        code: {
          language: "python",
          filename: "worked_day76_cli.py",
          code: `import typer

app = typer.Typer(add_completion=False)


@app.command()
def chat(model: str = typer.Option("mock", help="ชื่อโมเดล เช่น mock, llama3.2, gpt-4o-mini")) -> None:
    """ตัวอย่างโครง CLI (ต่อเข้ากับ StreamingChatSession ที่คุณจะสร้างในแบบฝึกหัด)"""
    typer.echo(f"เริ่มแชตกับโมเดล: {model} (พิมพ์ /quit เพื่อออก, Ctrl+C เพื่อหยุด)")
    # ในแบบฝึกหัด เราแยก StreamingChatSession ออกเป็นโมดูลที่เทสต์ได้ด้วย pytest
    typer.echo("Summary: 0 turns | 0 tokens | 0.00000 THB")


if __name__ == "__main__":
    app()`,
        },
        output: `เริ่มแชตกับโมเดล: mock (พิมพ์ /quit เพื่อออก, Ctrl+C เพื่อหยุด)
Summary: 0 turns | 0 tokens | 0.00000 THB`,
      },
    ],
    gotcha: "อย่าลืมส่ง `stream_options={\"include_usage\": True}` เวลาเรียก OpenAI streaming จริง! มิฉะนั้น `chunk.usage` จะเป็น `None` ในทุก chunk และตัวนับ `CostLedger` ของคุณจะแสดงเลขศูนย์ตลอดเซสชัน",
  },

  practice: {
    intro: "โจทย์ทบทวน + Mini-Integration (15 นาที): สร้าง `streaming_chat.py` ที่รวมความรู้ทั้ง Block B19 เป็นแกน Streaming CLI Chat พร้อม `ModelPricing`, `CostLedger`, `StreamingChatSession` (รองรับ sliding window, TTFT, token/cost tracking และ Atomic Turn Cancellation) แล้วพิสูจน์ครบทุกพฤติกรรมใน `pytest` ด้วย mock async stream",
    requirements: [
      "สร้าง dataclass `StreamEvent(delta: str = '', prompt_tokens: int | None = None, completion_tokens: int | None = None)`, `ModelPricing(input_per_1m_usd: float = 0.15, output_per_1m_usd: float = 0.60, thb_per_usd: float = 35.0)` และ `TurnMetrics(reply: str, ttft_sec: float | None, total_sec: float, prompt_tokens: int, completion_tokens: int, turn_cost_usd: float)`",
      "สร้างคลาส `CostLedger(pricing: ModelPricing)` ที่สะสม `prompt_tokens`, `completion_tokens`, `turns` ผ่าน `record(prompt_tokens, completion_tokens) -> float` (คืนต้นทุน USD ของรอบนั้น และปฏิเสธค่าติดลบด้วย `ValueError`) พร้อม properties `total_tokens`, `total_usd`, `total_thb`",
      "สร้าง `StreamBackend(Protocol)` ที่มีเมธอด `stream_chat(messages: list[dict[str, str]], *, temperature: float = 0.2, max_tokens: int = 256) -> AsyncIterator[StreamEvent]`",
      "สร้างคลาส `StreamingChatSession(backend: StreamBackend, system_prompt: str, pricing: ModelPricing | None = None, *, max_history_turns: int = 4, temperature: float = 0.2, max_tokens: int = 256)` ที่มี property `ledger`, `history` (สำเนาของประวัติ `user`/`assistant`) และเมธอด `async def ask(user_text: str, *, on_delta: Callable[[str], None] | None = None) -> TurnMetrics`",
      "`StreamingChatSession.ask` ต้อง: (1) ปฏิเสธ `user_text.strip() == ''` ด้วย `ValueError`, (2) ส่ง `[{'role': 'system', 'content': system_prompt}, *recent_history, {'role': 'user', 'content': clean_text}]` โดยจำกัดประวัติเดิมไม่เกิน `max_history_turns` รอบล่าสุด (`2 * max_history_turns` messages), (3) ครอบ stream ด้วย `aclosing`, วัด `ttft_sec` ที่ delta แรกที่ไม่ว่าง, เรียก `on_delta`, (4) ทำ Atomic Turn Commit (อัปเดต `history` และ `ledger` เฉพาะเมื่อรอบจบสมบูรณ์เท่านั้น — หากโดน `asyncio.CancelledError` ต้องปิด stream, ไม่ทำให้ `history`/`ledger` เพี้ยน และ re-raise `CancelledError`)",
    ],
    starter: {
      language: "python",
      filename: "streaming_chat.py",
      code: `import asyncio
from collections.abc import AsyncIterator, Callable
from contextlib import aclosing
from dataclasses import dataclass
import time
from typing import Protocol


@dataclass(frozen=True)
class StreamEvent:
    delta: str = ""
    prompt_tokens: int | None = None
    completion_tokens: int | None = None


@dataclass(frozen=True)
class ModelPricing:
    input_per_1m_usd: float = 0.15
    output_per_1m_usd: float = 0.60
    thb_per_usd: float = 35.0


@dataclass(frozen=True)
class TurnMetrics:
    reply: str
    ttft_sec: float | None
    total_sec: float
    prompt_tokens: int
    completion_tokens: int
    turn_cost_usd: float


class CostLedger:
    def __init__(self, pricing: ModelPricing) -> None:
        self.pricing = pricing
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.turns = 0

    def record(self, prompt_tokens: int, completion_tokens: int) -> float:
        # TODO: ตรวจไม่ติดลบ, สะสมยอด, เพิ่ม turns และคืนต้นทุน USD ของรอบนี้
        raise NotImplementedError

    @property
    def total_tokens(self) -> int:
        return self.prompt_tokens + self.completion_tokens

    @property
    def total_usd(self) -> float:
        # TODO: คำนวณต้นทุนรวม USD
        raise NotImplementedError

    @property
    def total_thb(self) -> float:
        return self.total_usd * self.pricing.thb_per_usd


class StreamBackend(Protocol):
    def stream_chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.2,
        max_tokens: int = 256,
    ) -> AsyncIterator[StreamEvent]: ...


class StreamingChatSession:
    def __init__(
        self,
        backend: StreamBackend,
        system_prompt: str,
        pricing: ModelPricing | None = None,
        *,
        max_history_turns: int = 4,
        temperature: float = 0.2,
        max_tokens: int = 256,
    ) -> None:
        if max_history_turns < 0:
            raise ValueError("max_history_turns must be >= 0")
        self._backend = backend
        self._system_prompt = system_prompt
        self._ledger = CostLedger(pricing or ModelPricing())
        self._max_history_turns = max_history_turns
        self._temperature = temperature
        self._max_tokens = max_tokens
        self._history: list[dict[str, str]] = []

    @property
    def ledger(self) -> CostLedger:
        return self._ledger

    @property
    def history(self) -> list[dict[str, str]]:
        return list(self._history)

    async def ask(
        self,
        user_text: str,
        *,
        on_delta: Callable[[str], None] | None = None,
    ) -> TurnMetrics:
        # TODO: ตรวจ user_text, ประกอบ messages พร้อม sliding window,
        # ใช้ aclosing(stream), วัด TTFT, และ commit history + ledger แบบ atomic
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_streaming_chat.py",
      code: `import asyncio
from collections.abc import AsyncIterator
import pytest
from streaming_chat import (
    ModelPricing,
    StreamEvent,
    StreamingChatSession,
)


class ScriptedBackend:
    def __init__(self, turns: list[tuple[list[str], int, int]], delay: float = 0.02) -> None:
        self._turns = list(turns)
        self._delay = delay
        self.sent_requests: list[list[dict[str, str]]] = []
        self.closed_count = 0

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.2,
        max_tokens: int = 256,
    ) -> AsyncIterator[StreamEvent]:
        self.sent_requests.append(list(messages))
        chunks, p_tok, c_tok = self._turns.pop(0)
        try:
            for piece in chunks:
                await asyncio.sleep(self._delay)
                yield StreamEvent(delta=piece)
            yield StreamEvent(prompt_tokens=p_tok, completion_tokens=c_tok)
        finally:
            self.closed_count += 1


def test_multi_turn_streaming_ttft_and_cost_ledger():
    backend = ScriptedBackend(
        turns=[
            (["สวัสดี", "ครับ"], 100, 40),
            (["ยอดคงเหลือ ", "500 บาท"], 180, 60),
        ],
        delay=0.03,
    )
    pricing = ModelPricing(input_per_1m_usd=1.0, output_per_1m_usd=2.0, thb_per_usd=35.0)
    session = StreamingChatSession(backend, system_prompt="ผู้ช่วยไทย", pricing=pricing)
    streamed: list[str] = []

    async def run() -> None:
        m1 = await session.ask("ทักทาย", on_delta=streamed.append)
        assert m1.reply == "สวัสดีครับ"
        assert m1.ttft_sec is not None and 0.02 <= m1.ttft_sec < m1.total_sec
        assert m1.turn_cost_usd == pytest.approx(0.00018)

        m2 = await session.ask("เช็กยอด", on_delta=streamed.append)
        assert m2.reply == "ยอดคงเหลือ 500 บาท"
        assert m2.turn_cost_usd == pytest.approx(0.00030)

    asyncio.run(run())
    assert streamed == ["สวัสดี", "ครับ", "ยอดคงเหลือ ", "500 บาท"]
    assert session.ledger.turns == 2
    assert session.ledger.prompt_tokens == 280
    assert session.ledger.completion_tokens == 100
    assert session.ledger.total_usd == pytest.approx(0.00048)
    assert session.ledger.total_thb == pytest.approx(0.00048 * 35.0)
    assert [m["role"] for m in backend.sent_requests[0]] == ["system", "user"]
    assert [m["role"] for m in backend.sent_requests[1]] == ["system", "user", "assistant", "user"]


def test_sliding_window_caps_history_turns():
    backend = ScriptedBackend(
        turns=[
            (["A1"], 10, 5),
            (["A2"], 20, 5),
            (["A3"], 30, 5),
        ],
        delay=0.005,
    )
    session = StreamingChatSession(backend, system_prompt="sys", max_history_turns=1)

    async def run() -> None:
        await session.ask("Q1")
        await session.ask("Q2")
        await session.ask("Q3")

    asyncio.run(run())
    # รอบที่ 3 ควรส่งเฉพาะ system + [Q2, A2] + Q3 (ไม่รวม Q1, A1)
    req3 = backend.sent_requests[2]
    assert [m["content"] for m in req3] == ["sys", "Q2", "A2", "Q3"]
    assert len(session.history) == 2


def test_cancellation_closes_stream_and_preserves_clean_state():
    backend = ScriptedBackend(
        turns=[
            (["รอบแรกจบ"], 50, 20),
            (["ช้า1", "ช้า2", "ช้า3", "ช้า4"], 90, 40),
        ],
        delay=0.04,
    )
    session = StreamingChatSession(backend, system_prompt="sys")

    async def run() -> None:
        await session.ask("คำถาม1")
        assert session.ledger.turns == 1
        assert len(session.history) == 2

        task = asyncio.create_task(session.ask("คำถาม2 ที่จะยกเลิก"))
        await asyncio.sleep(0.06)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task

        # ประวัติและ ledger ต้องยังคงสะอาดอยู่ที่รอบที่ 1 และ stream ถูกปิดครบทั้ง 2 รอบ
        assert session.ledger.turns == 1
        assert len(session.history) == 2
        assert backend.closed_count == 2

    asyncio.run(run())


def test_blank_user_text_rejected():
    backend = ScriptedBackend(turns=[])
    session = StreamingChatSession(backend, system_prompt="sys")
    with pytest.raises(ValueError):
        asyncio.run(session.ask("   "))
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases โดยไม่ต้องใช้ API key",
      "ยืนยันว่า `CostLedger` คำนวณ `total_usd` และ `total_thb` สะสมตรงเป๊ะทั้ง 2 รอบ",
      "ยืนยันว่า `max_history_turns=1` ตัดรอบเก่าสุดออกและส่งเฉพาะ `system + รอบล่าสุด + คำถามใหม่`",
      "ยืนยันว่าเมื่อ cancel กลางรอบที่ 2 `backend.closed_count == 2`, `history` ยังสะอาดที่ 2 messages และ `ledger.turns == 1`",
      "ผ่าน `uv run ruff check .` โดยไม่มี lint warning",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_streaming_chat.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `StreamingChatSession.ask` ให้ตัดประวัติก่อนส่งด้วย `kept = self._history[-(self._max_history_turns * 2):] if self._max_history_turns > 0 else []` แล้วสร้าง `req_messages = [{'role': 'system', 'content': self._system_prompt}, *kept, {'role': 'user', 'content': clean_text}]`",
      },
      {
        body: "อย่าแตะ `self._history` หรือ `self._ledger` ระหว่างลูป `async for ev in stream:` — รอให้หลุดออกจาก `async with aclosing(...)` อย่างปกติก่อนค่อย commit `self._history` (พร้อม trim ตาม `max_history_turns`) และเรียก `self._ledger.record(p_tok, c_tok)`",
      },
      {
        body: "โครงของ `StreamingChatSession.ask` พร้อมแล้ว — นำไปเชื่อมกับ `CostLedger` แล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_day76.py",
          code: `async def ask(
    self,
    user_text: str,
    *,
    on_delta: Callable[[str], None] | None = None,
) -> TurnMetrics:
    clean_text = user_text.strip()
    if not clean_text:
        raise ValueError("user_text must not be empty")

    kept = self._history[-(self._max_history_turns * 2) :] if self._max_history_turns > 0 else []
    req_messages = [
        {"role": "system", "content": self._system_prompt},
        *kept,
        {"role": "user", "content": clean_text},
    ]

    t0 = time.perf_counter()
    ttft: float | None = None
    parts: list[str] = []
    prompt_tokens = 0
    completion_tokens = 0

    stream = self._backend.stream_chat(
        req_messages,
        temperature=self._temperature,
        max_tokens=self._max_tokens,
    )
    async with aclosing(stream):
        async for ev in stream:
            if ev.delta:
                if ttft is None:
                    ttft = time.perf_counter() - t0
                parts.append(ev.delta)
                if on_delta is not None:
                    on_delta(ev.delta)
            if ev.prompt_tokens is not None:
                prompt_tokens = ev.prompt_tokens
            if ev.completion_tokens is not None:
                completion_tokens = ev.completion_tokens

    reply = "".join(parts)
    turn_cost_usd = self._ledger.record(prompt_tokens, completion_tokens)
    if self._max_history_turns > 0:
        self._history.extend([
            {"role": "user", "content": clean_text},
            {"role": "assistant", "content": reply},
        ])
        self._history = self._history[-(self._max_history_turns * 2) :]
    return TurnMetrics(
        reply=reply,
        ttft_sec=ttft,
        total_sec=time.perf_counter() - t0,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        turn_cost_usd=turn_cost_usd,
    )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
  },

  mistakes: [
    {
      title: "เพิ่ม `user` message ลงใน `self._history` ก่อนเริ่ม stream",
      symptom: "เมื่อผู้ใช้กด Ctrl+C ยกเลิกกลางรอบ ประวัติจะมี `user` ค้างอยู่โดยไม่มี `assistant` คู่กัน ทำให้รอบถัดไปเกิด `user` สองอันติดกัน",
      fix: "ทำ Atomic Turn Commit — อัปเดต `self._history` ทั้งคู่ (`user` + `assistant`) เฉพาะเมื่อ stream จบสมบูรณ์แล้วเท่านั้น",
    },
    {
      title: "ลืมจำกัดความยาวประวัติแชต (`max_history_turns`)",
      symptom: "คุยไป 20 รอบแล้วค่า `prompt_tokens` พุ่งสูงขึ้นทุกรอบ จนชนเพดาน context window หรือค่า API บานปลาย",
      fix: "ตัดประวัติเดิมด้วย sliding window (`max_history_turns * 2` messages) โดยยังคง `system` message ไว้หน้าสุดเสมอ",
    },
    {
      title: "ลืมส่ง `stream_options={'include_usage': True}` เมื่อต่อ OpenAI-compatible API จริง",
      symptom: "แชต stream ทำงานปกติแต่ตัวนับ `prompt_tokens` และ `completion_tokens` เป็น `0` ตลอดเซสชัน",
      fix: "เปิด `stream_options={'include_usage': True}` เพื่อรับ final usage event จาก API ก่อน `[DONE]`",
    },
    {
      title: "ลืม `flush=True` เวลาพิมพ์ token ทีละชิ้นใน CLI (`print(delta, end='', flush=True)`)",
      symptom: "ในเทอร์มินัลบางตัวข้อความถูกบัฟเฟอร์รอขึ้นบรรทัดใหม่จนดูเหมือนไม่ stream ทั้งที่รับ SSE มาแล้ว",
      fix: "ส่ง `flush=True` ทุกครั้งที่พิมพ์ delta ออก stdout เพื่อให้ตัวอักษรปรากฏทันทีที่ได้รับ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d076-q1",
        "ในการสนทนาหลายรอบ (Multi-Turn Chat) ที่ไม่ได้ตัดประวัติ เหตุใด `prompt_tokens` จึงเพิ่มขึ้นในทุกรอบใหม่ที่ผู้ใช้พิมพ์ถาม?",
        [
          ["เพราะโมเดลเพิ่มราคาต่อ token ขึ้นเรื่อย ๆ ตามจำนวนรอบ", "ราคาต่อ token เท่าเดิม แต่จำนวน token ที่ส่งเข้าไปเพิ่มขึ้นทุกครั้ง"],
          ["เพราะ LLM API เป็นแบบ stateless แอปต้องส่ง `system` และประวัติ `user`/`assistant` ก่อนหน้าทั้งหมดกลับไปซ้ำในทุกรอบ", "ถูก — จึงควรใช้ sliding window (`max_history_turns`) หรือสรุปประวัติเก่าเพื่อคุมต้นทุน"],
          ["เพราะโหมด SSE Streaming บังคับให้ส่งคำถามเดิมซ้ำ 2 ครั้ง", "ไม่จริง — SSE ไม่ได้ส่งคำถามซ้ำ เป็นธรรมชาติของ multi-turn context"],
          ["เพราะ Python `list.append` คัดลอกสตริงซ้ำเองอัตโนมัติ", "ไม่เกี่ยวกัน — เกิดจากการส่งประวัติทั้งหมดกลับเข้า context window ทุกรอบ"],
        ],
        "B",
        "LLM API เป็น stateless จึงต้องส่งประวัติแชตเดิมกลับไปใหม่ทุกรอบ ทำให้ `prompt_tokens` โตสะสมหากไม่ตั้ง sliding window",
        "ทำไม `prompt_tokens` ในแชตหลายรอบจึงโตขึ้นเรื่อย ๆ และป้องกันอย่างไร?",
        "เพราะ LLM เป็น stateless ต้องส่งประวัติเก่ากลับไปทุกครั้ง — ป้องกันด้วยการจำกัด `max_history_turns` (sliding window) หรือสรุปประวัติเก่า",
      ),
      mc(
        "d076-q2",
        "เหตุใด `StreamingChatSession.ask` จึงควรทำ Atomic Turn Commit (เพิ่ม `user` และ `assistant` ลงใน `history` หลัง stream จบสมบูรณ์เท่านั้น)?",
        [
          ["เพื่อให้ใช้หน่วยความจำ RAM น้อยลง 50%", "เป้าหมายหลักคือความถูกต้องของลำดับบทสนทนา ไม่ใช่การลด RAM"],
          ["เพื่อป้องกันประวัติแชตเสียรูป (มี `user` ค้างโดยไม่มี `assistant` คั่น) เมื่อผู้ใช้กดยกเลิก (Ctrl+C / `CancelledError`) กลางรอบ", "ถูก — ประวัติและ ledger รอบก่อนหน้าจะยังสมบูรณ์และพร้อมคุยรอบถัดไปได้ทันที"],
          ["เพราะ Python ไม่อนุญาตให้แก้ไข `list` ภายในฟังก์ชัน `async def`", "แก้ไขได้ปกติ แต่ไม่ควรแก้ก่อนมั่นใจว่ารอบนั้นจบสมบูรณ์"],
          ["เพื่อให้ `TTFT` เร็วขึ้น 3 เท่า", "ไม่ได้เปลี่ยนเวลา TTFT แต่รับประกันความเสถียรของ state"],
        ],
        "B",
        "Atomic Turn Commit ป้องกันประวัติแชตพังเมื่อเกิดการยกเลิกหรือ error กลาง stream",
        "ทำไมควรอัปเดต `history` และ `ledger` หลังจาก stream จบสมบูรณ์ (Atomic Turn Commit)?",
        "เพื่อไม่ให้ประวัติแชตค้างข้อความ `user` ไว้โดยไม่มีคำตอบ `assistant` เมื่อถูกยกเลิกกลางทาง (`CancelledError`) ทำให้รอบถัดไปทำงานต่อได้ไม่พัง",
      ),
      mc(
        "d076-q3",
        "(Interleaved Recall · D73–D75) คุณรวมโค้ดจาก B19 เข้าด้วยกันแล้วพบ 3 อาการพร้อมกัน: ตัวอักษรไทยขึ้น ``, ตัวนับต้นทุนเป็น `0`, และเมื่อกด Ctrl+C stream ไม่ยอมปิด — สาเหตุที่ตรงคู่กันมากที่สุดคือข้อใด?",
        [
          ["ลืม incremental UTF-8 decoder / ลืม `stream_options={'include_usage': True}` / ลืม `contextlib.aclosing` หรือกลืน `CancelledError`", "ถูกครบทั้ง 3 จุด — แต่ละอาการตรงกับบทเรียน D75 และ D76 เป๊ะ"],
          ["ตั้ง `temperature=0.0` / ใส่ XML delimiters / ใช้ `uv`", "ทั้งสามอย่างนี้เป็นแนวปฏิบัติที่ดี ไม่ใช่สาเหตุของอาการดังกล่าว"],
          ["ใช้ `MockStreamBackend` / ใช้ `Protocol` / ใช้ `time.perf_counter()`", "ทั้งสามอย่างนี้คือโครงสร้างที่ถูกต้องสำหรับการทดสอบและวัดเวลา"],
          ["ใส่ `max_tokens=256` / แยก `system` role / ใช้ `flush=True`", "ไม่ใช่อาการของทั้ง 3 ปัญหาเลย"],
        ],
        "A",
        "ทั้งสามอาการเป็นจุดพลาดยอดฮิตของ streaming LLM apps ที่เราแก้ด้วย incremental UTF-8 decoder, `include_usage=True` และ `aclosing`",
        "จับคู่อาการใน Streaming LLM App กับวิธีแก้: (1) อักษรไทยเป็น ``, (2) usage เป็น `0`, (3) cancel แล้ว stream ค้าง",
        "(1) ใช้ `codecs.getincrementaldecoder('utf-8')`, (2) เปิด `stream_options={'include_usage': True}`, (3) ครอบด้วย `contextlib.aclosing` และ re-raise `CancelledError`",
      ),
      mc(
        "d076-q4",
        "(Interleaved Recall · D23 & D73) ทำไมเราจึงออกแบบ `StreamingChatSession.ask` ให้รับ `on_delta` callback และฉีด `StreamBackend` แทนที่จะเรียก `print()` และ `AsyncOpenAI()` ตรง ๆ ข้างใน?",
        [
          ["เพราะ `print()` ใช้ไม่ได้ในฟังก์ชัน `async def`", "`print()` ใช้ได้ปกติ แต่ทำให้โค้ดผูกติดกับ stdout"],
          ["เพื่อแยก core logic ออกจาก CLI I/O และเครือข่าย ทำให้เขียน `pytest` ทดสอบ multi-turn, TTFT, ต้นทุน และ cancellation ได้เร็วและทำซ้ำได้ 100%", "ถูก — และยังนำคลาสเดียวกันไปใช้ซ้ำใน FastAPI SSE Endpoint ได้ในอนาคต"],
          ["เพราะ `typer` ห้ามใช้ฟังก์ชัน `print()`", "`typer` ไม่ได้ห้าม (และมี `typer.echo`) การแยก callback ทำเพื่อความสามารถในการทดสอบและนำกลับมาใช้ซ้ำ"],
          ["เพื่อหลีกเลี่ยงการส่ง `system` prompt ให้ API", "ไม่เกี่ยวกัน — `system` prompt ยังคงถูกส่งเป็น message แรกเสมอ"],
        ],
        "B",
        "การแยก transport (`StreamBackend`) และ UI output (`on_delta`) ออกจาก session logic ทำให้ทดสอบอัตโนมัติได้ครบและนำโค้ดไปต่อยอดเป็น Web API ได้ง่าย",
        "ทำไมควรแยก `on_delta` callback และ `StreamBackend` ออกจาก `StreamingChatSession`?",
        "เพื่อแยก logic หลักออกจาก CLI I/O และเครือข่าย ทำให้รัน `pytest` ด้วย mock stream ได้เร็ว/ฟรี และนำคลาสเดิมไปใช้ต่อใน FastAPI SSE ได้ทันที",
      ),
    ],
  },

  takeaways: [
    "แกนของ Streaming CLI Chat ระดับ production ประกอบด้วย 4 ชั้นที่แยกกันชัด: Context/History, `StreamBackend(Protocol)`, `aclosing` Streaming Consumer และ `CostLedger`",
    "จำกัดประวัติแชตด้วย sliding window (`max_history_turns`) และเปิด `include_usage=True` เพื่อคุมและวัดต้นทุน multi-turn ได้จริงทั้ง USD และ THB",
    "ใช้ Atomic Turn Commit เพื่อป้องกันประวัติแชตเสียหายเมื่อผู้ใช้กด Ctrl+C ยกเลิกกลางรอบ และปิด stream ด้วย `contextlib.aclosing` เสมอ",
    "แยก `on_delta` callback และ `StreamBackend` ออกจาก CLI ทำให้ทดสอบ multi-turn, {{ttft}}, ต้นทุน และ cancellation ได้ครบ 100% ใน `pytest`",
  ],

  reviewCards: [
    rc(
      "d076-rc-1",
      "ในการเรียก OpenAI-compatible Streaming API ต้องส่งตัวเลือกใดเพิ่มเพื่อให้ได้รับ `prompt_tokens` และ `completion_tokens` ตอนท้าย stream?",
      "ส่ง `stream_options={\"include_usage\": True}` เพื่อให้เซิร์ฟเวอร์แนบ usage event มาก่อนจบ `[DONE]`",
    ),
    rc(
      "d076-rc-2",
      "Atomic Turn Commit ใน multi-turn streaming chat คืออะไร และช่วยป้องกันบั๊กใด?",
      "คือการยังไม่เพิ่ม `user`/`assistant` ลงใน `history` หรือบันทึก `ledger` จนกว่า stream จะจบสมบูรณ์ ช่วยกันไม่ให้ประวัติเสียรูปเมื่อโดน Ctrl+C / `CancelledError` กลางรอบ",
    ),
    rc(
      "d076-rc-3",
      "เหตุใดแอปแชตหลายรอบจึงต้องตั้ง `max_history_turns` (sliding window)?",
      "เพราะ LLM API เป็น stateless ต้องส่งประวัติเก่ากลับไปซ้ำทุกรอบ หากไม่จำกัดจำนวนรอบ `prompt_tokens` และต้นทุนจะโตสะสมอย่างรวดเร็วและชน context limit",
    ),
  ],

  sources: [
    { label: "OpenAI API Docs — Streaming & Usage Options", href: "https://platform.openai.com/docs/api-reference/chat/create#chat-create-stream_options" },
    { label: "Typer Documentation — CLI Applications", href: "https://typer.tiangolo.com/" },
    { label: "Python Docs — asyncio Tasks & Cancellation", href: "https://docs.python.org/3/library/asyncio-task.html#task-cancellation" },
    { label: "Ollama Docs — OpenAI Streaming Compatibility", href: "https://github.com/ollama/ollama/blob/main/docs/openai.md" },
  ],

  glossary: ["sse", "ttft", "llm", "context-engineering", "temperature", "asyncio", "typer", "mocking"],
});
