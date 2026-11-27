import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D089 — Phase 3 / Block B23
 * Add Edge-Case Handling (Slang, Typos, Mixed Thai-English)
 */
export const d089: Lesson = defineLesson({
  day: 89,
  titleTh: "รับมือ Edge Cases ภาษาไทย: คำสแลง พิมพ์ผิด อีโมจิ และไทยปนอังกฤษ",
  tagline:
    "30 นาที · รันบนเครื่องได้ 100% ด้วยโหมด mock / Ollama · สร้าง pre-normalizer ภาษาไทย ผสาน Few-Shot และ fallback ที่ปลอดภัย",
  icon: "shield-check",
  visual: {
    id: "phase3-extractor-arch",
    title: "รับมือ Edge Cases ภาษาไทย: คำสแลง พิมพ์ผิด อีโมจิ และไทยปนอังกฤษ",
    caption:
      "ดูการทำ pre-normalization (สระซ้อน/เลขไทย/zero-width) คู่กับ Few-Shot และ fallback ที่ปลอดภัย",
    alt: "แผนภาพการจัดการ edge cases ของข้อความภาษาไทย",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องได้ 100% ด้วยโหมด mock / local Ollama ไม่ต้องใช้ API key",
  tools: ["Pydantic v2", "Python unicodedata/re", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อความลูกค้าไทยจริงไม่เคยสะอาดเหมือนในตัวอย่างทดสอบ",
      body: "ข้อความจาก LINE OA, แชตหน้าเว็บ หรืออีเมลเต็มไปด้วยอักขระล่องหน (Zero-Width Space), เลขไทย (`๑,๒๕๐`), คำพิมพ์ลากเสียง (`ด่วนนนน`), สแลง (`คับ/คร้าบ/งับ`) และไทยปนอังกฤษ (`โอนเงินไม่เข้า order #INV-2026`)",
      lessonNote:
        "วันนี้เราสร้างด่าน **Deterministic Pre-Normalizer** ล้างสัญญาณรบกวนระดับตัวอักษรโดยไม่ทำลายรหัสอ้างอิงภาษาอังกฤษ",
    },
    {
      node: 2,
      heading: "แบ่งงานให้ถูกชั้นระหว่างโค้ด Python กับ LLM + Few-Shot",
      body: "กฎตายตัว (เช่น แปลงเลขไทย, ลบ zero-width, ดักข้อความว่าง/อีโมจิล้วน) ควรจบใน Python ด้วยเวลา <1ms ส่วนความหมายแฝง คำสแลง และการพิมพ์ผิด ให้ใช้ {{few-shot}} ใน {{context-engineering}} ช่วยนำทาง {{llm}}",
      lessonNote:
        "เราจะออกแบบชุดตัวอย่าง Few-Shot 3–4 เคสที่เจาะจง edge cases ภาษาไทยจริง แทนการเขียน regex ดักทุกคำสแลง",
    },
    {
      node: 3,
      heading: "ทดสอบ Edge Cases ด้วย Parametrized Tests ให้ครบก่อนขึ้นระบบจริง",
      body: "จุดพังส่วนใหญ่ใน production เกิดจากเคสขอบที่ไม่เคยอยู่ใน test suite เช่น ข้อความมีแต่อีโมจิ `😭😭😭` หรือเลขใบแจ้งหนี้ที่มีเลขซ้ำอย่าง `INV-2000` ถูก regex ยุบจนเพี้ยน",
      lessonNote:
        "แบบฝึกหัดวันนี้ใช้ `pytest` + {{parametrize}} ตรวจครบทั้งเคสสระซ้อน เลขไทย รหัส SKU และข้อความอีโมจิล้วน",
    },
    {
      node: 4,
      heading: "ป้องกัน Hallucination ด้วย Safe `needs_review` Fallback",
      body: "เมื่อข้อความไม่มีข้อมูลเพียงพอ (เช่น พิมพ์แค่ `???` หรือ `🙏`) หรือโมเดลมีความมั่นใจต่ำ ระบบต้องไม่เดาค่าใส่ {{structured-output}} แต่ส่งต่อเข้าคิว `needs_review=True` อย่างปลอดภัย",
      lessonNote:
        "การดักเคสไร้สัญญาณก่อนยิงโมเดลช่วยทั้งลด {{hallucination}} เป็นศูนย์และประหยัดค่า API ทันที",
    },
  ],

  objectives: [
    "**เขียน** ฟังก์ชัน pre-normalization ภาษาไทยแบบ deterministic (Unicode NFC, ลบ Zero-Width, แปลงเลขไทย `๐–๙` เป็น `0–9`, ยุบอักขระไทยซ้ำโดยไม่แตะรหัสอังกฤษ/ตัวเลข)",
    "**ออกแบบ** การแบ่งหน้าที่ระหว่าง Python pre-cleaner กับตัวอย่าง {{few-shot}} สำหรับคำสแลง พิมพ์ผิด และไทยปนอังกฤษ (code-switching)",
    "**สร้าง** ด่าน short-circuit และ `needs_review` fallback ที่ป้องกัน {{hallucination}} เมื่อเจอข้อความว่าง อีโมจิล้วน หรือความมั่นใจต่ำ พร้อมทดสอบด้วย `pytest`",
  ],

  prerequisites: [
    "{{pydantic}} v2 (`BaseModel`, `Literal`, `Field`) และ {{structured-output}} (Days 77–78)",
    "{{context-engineering}} และ {{few-shot}} Prompting (Day 74)",
    "พื้นฐาน Python `re`, `unicodedata` และ `pytest` ({{parametrize}})",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์ทำงานสำหรับ Day 89 (หรือต่อยอดจากโปรเจกต์ Thai Document Extractor ของคุณใน Day 87–88) โดยใช้เฉพาะ `pydantic`, `pytest` และ `ruff`",
    commands: `uv init ai-day89 && cd ai-day89
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import unicodedata, pydantic; print('Ready:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day89` หรือเปิดโฟลเดอร์ extractor เดิม"],
      ["deps", "ติดตั้ง `pydantic`, `pytest`, `ruff` ผ่าน `uv` สำเร็จ"],
      ["verify", "รันเช็ก `unicodedata` และ `pydantic` โดยไม่มี error"],
    ],
    note: "ตัวอย่างและแบบฝึกหัดวันนี้ใช้มาตรฐาน Python (`unicodedata`, `re`) คู่กับ `pydantic` เพื่อให้รันเร็วบนทุกเครื่องโดยไม่ต้องโหลดน้ำหนักโมเดลใหญ่ — หากโปรเจกต์จริงใช้ `pythainlp.util.normalize` อยู่แล้วสามารถเสียบเพิ่มในขั้น pre-clean ได้ทันที",
  },

  concepts: [
    {
      id: "thai-text-noise-normalization",
      title: "1 · สัญญาณรบกวนในข้อความไทยจริง: สระซ้อน, เลขไทย, Zero-Width และรหัสอังกฤษ",
      paragraphs: [
        "ข้อความจากผู้ใช้ไทยในชีวิตจริงมักซ่อนปัญหาที่ตาเปล่ามองไม่เห็น เช่น อักขระ **Zero-Width Space** (`\\u200b`, `\\ufeff`) ที่แอปแชตหรือเบราว์เซอร์แทรกมาตอนก๊อปปี้ข้อความ ทำให้คำว่า `โอน\\u200bเงิน` แตกเป็น token ประหลาด หรือสระอำ/วรรณยุกต์ที่เก็บแบบไม่เป็นมาตรฐาน (เช่น `เ` + `เ` แทน `แ` หรือลำดับวรรณยุกต์สลับที่)",
        "อีกปัญหาที่พบบ่อยคือ **เลขไทย** (`๑,๒๕๐ บาท`) และ **การพิมพ์ลากเสียง** (`ด่วนนนนนน`, `คร้าบบบบ`) หากส่งดิบเข้าไป ตัวเลขอาจถูกแยก token แปลก ๆ และทำให้ downstream validation พลาด ทางแก้คือทำ **Deterministic Pre-Normalization** ด้วย Unicode NFC + ลบ zero-width + แปลงเลขไทยเป็นเลขอารบิก (`0–9`) + ยุบตัวอักษรไทยที่ซ้ำติดกันตั้งแต่ 3 ตัวขึ้นไปให้เหลือ 2 ตัว",
        "ข้อควรระวังระดับวิศวกรรม: **ห้ามใช้ regex ยุบตัวอักษรซ้ำแบบเหมาทั้งสตริง** (เช่น `(.)\\1{2,}`) เพราะจะไปทำลายตัวเลขยอดเงิน `10000` ให้เหลือ `100` และทำลายรหัสอ้างอิงอย่าง `INV-2000`! ต้องจำกัดขอบเขตการยุบเฉพาะช่วงตัวอักษรไทย `[ก-ฮะ-์]` เท่านั้น",
      ],
      analogy:
        "เหมือนการเช็ดเลนส์แว่นตาก่อนอ่านลายมือลูกค้า: เราไม่ได้เปลี่ยนความหมายของข้อความ แต่ล้างฝุ่น (zero-width) และปรับเลขไทยให้เป็นมาตรฐานเดียวกัน โดยไม่เผลอลบเลขใบเสร็จของลูกค้าทิ้ง",
      code: {
        language: "python",
        filename: "thai_normalize.py",
        code: `import re
import unicodedata

_THAI_DIGITS = str.maketrans("๐๑๒๓๔๕๖๗๘๙", "0123456789")
_ZW_RE = re.compile(r"[\\u200b\\u200c\\u200d\\ufeff]")
_THAI_REPEAT_RE = re.compile(r"([ก-ฮะ-์])\\1{2,}")
_MULTI_SPACE_RE = re.compile(r"\\s+")


def normalize_thai_text(raw: str) -> str:
    text = unicodedata.normalize("NFC", raw)
    text = _ZW_RE.sub("", text)
    text = text.replace("เเ", "แ")  # แก้พิมพ์ เ สองตัวติดกันแทน แ
    text = text.translate(_THAI_DIGITS)
    text = _THAI_REPEAT_RE.sub(r"\\1\\1", text)
    return _MULTI_SPACE_RE.sub(" ", text).strip()`,
        caption:
          "Pre-normalizer ที่ปลอดภัยต่อรหัสภาษาอังกฤษและตัวเลขยอดเงิน (เช่น `INV-2000` และ `10000` ไม่ถูกยุบ)",
      },
      whyTitle: "Why this matters — แก้ที่ต้นน้ำครั้งเดียว ประหยัดทั้ง Token และ Bug",
      whyParagraphs: [
        "การล้างอักขระล่องหนและแปลงเลขไทยในชั้น Python ใช้เวลาเพียงหลักไมโครวินาที (`<0.05ms`) แต่ช่วยลดความเพี้ยนของ {{bpe-tokenizer}} และทำให้กฎตรวจสอบยอดเงิน/รหัสอ้างอิงในชั้น {{pydantic}} ทำงานสม่ำเสมอ 100%",
        "แนวคิดนี้สอดคล้องกับเครื่องมือ `pythainlp.util.normalize` ใน {{pythainlp}} ที่คุณเคยใช้ใน Phase 2 เพียงแต่ในงาน LLM Extractor เราต้องระวังไม่ลบเครื่องหมาย `#`, `-`, `.` หรือภาษาอังกฤษที่อยู่ในรหัสออเดอร์ออก",
      ],
    },
    {
      id: "deterministic-vs-fewshot-boundary",
      title: "2 · แบ่งหน้าที่ให้ชัด: กฎตายตัวใน Python vs Targeted Few-Shot ใน Prompt",
      paragraphs: [
        "เมื่อเจอคำสแลงไทย (`คับ/คร้าบ/งับ/จ้า`), คำพิมพ์ผิด (`โอนเงืน/ใบเส็ด/ยกเลืก`), หรือประโยคไทยปนอังกฤษ (`โอนเงินไม่เข้า order #INV-2026 ยอด 1,250 บ.`) มือใหม่มักเผลอเขียนพจนานุกรม `replace()` ยาวเป็นร้อยบรรทัดใน Python ซึ่งดูแลยากและมักแก้คำถูกให้กลายเป็นคำผิด",
        "หลักการที่ยั่งยืนกว่าคือ **แยกงานตามธรรมชาติของปัญหา**: ให้ Python จัดการเรื่อง encoding/formatting ที่เป็นกฎตายตัว 100% ส่วนการตีความสแลง พิมพ์ผิด และ code-switching ให้เป็นหน้าที่ของ {{llm}} โดยเสริมด้วย **Targeted {{few-shot}} Examples** เพียง 3–5 ตัวอย่างที่สะท้อนเคสยากจริงจาก Error Analysis",
      ],
      analogy:
        "เหมือนร้านรับซักรีดที่แยกขั้นตอน: เครื่องจักรทำหน้าที่มาตรฐานอย่างการชั่งน้ำหนักและปั่นแห้ง (Python rules) ส่วนคราบแปลก ๆ ที่มีบริบทเฉพาะตัวให้ช่างผู้เชี่ยวชาญดูตัวอย่างเทียบก่อนลงมือ (LLM + Few-Shot)",
      bullets: [
        "**ให้ Python ทำ (Deterministic)**: NFC, ลบ Zero-Width, แปลง `เเ→แ`, แปลงเลขไทย `๐–๙`, trim ช่องว่าง, ดักข้อความว่าง/อีโมจิล้วน",
        "**ให้ LLM + Few-Shot ทำ (Semantic)**: ตีความคำสแลง (`คับ/คร้าบ`), คำสะกดผิด (`โอนเงืน`, `ใบเส็ด`), ไทยปนอังกฤษ (`refund order #INV-2026`), และแยกแยะระดับความเร่งด่วน",
        "**เก็บตัวอย่าง Few-Shot ให้กระชับ**: เลือกเคสที่ครอบคลุมหมวดปัญหาที่พลาดบ่อย (1 เคสต่อรูปแบบความผิดพลาด) เพื่อไม่ให้บวม token cost",
      ],
      whyTitle: "Why this matters — พจนานุกรม Regex แก้สแลงไม่มีวันตามภาษาแชตทัน",
      whyParagraphs: [
        "คำสแลงและคำพิมพ์ผิดในภาษาไทยเปลี่ยนไปทุกเดือน การพยายามสะกดดักทุกคำในโค้ดจะสร้างหนี้ทางเทคนิค (tech debt) มหาศาลและพังง่ายเมื่อเจอคำใหม่",
        "ในทางกลับกัน LLM เข้าใจบริบทภาษาไทยและอังกฤษปนกันได้ดีมากอยู่แล้ว เพียงแค่เราใส่ตัวอย่าง Few-Shot ที่แสดงรูปแบบ {{structured-output}} ที่ต้องการ (รวมถึงตอนที่ต้องตอบ `null` และ `needs_review: true`) ความแม่นยำบนเคสสกปรกจะพุ่งขึ้นทันที",
      ],
    },
    {
      id: "safe-fallback-needs-review",
      title: "3 · ด่าน Short-Circuit และ Safe `needs_review` Fallback เมื่อสัญญาณไม่พอ",
      paragraphs: [
        "ข้อความลูกค้าจำนวนไม่น้อยในระบบแชตจริงคือข้อความที่ **ไม่มีเนื้อหาสำหรับสกัดเลย** เช่น อีโมจิล้วน (`😭😭😭`, `🙏🙏`), เครื่องหมายล้วน (`???`, `...`), หรือข้อความสั้นเกินไป (`คับ`, `ฮัลโหล`) หากเราส่งข้อความเหล่านี้เข้า LLM พร้อม Strict Schema โมเดลจะถูกบังคับให้เลือกหมวดหมู่ใดหมวดหมู่หนึ่ง ซึ่งนำไปสู่การเดามั่ว ({{hallucination}})",
        "ทางออกระดับ production คือสร้างด่าน **2 ชั้น**: (1) **Pre-LLM Short-Circuit** — หลัง normalize แล้ว หากไม่มีตัวอักษรไทยหรืออังกฤษที่มีความหมายอย่างน้อย `min_alnum_chars` (เช่น 3 ตัวอักษร) ให้คืนผลลัพธ์ `category=\"other\"`, `needs_review=True`, `review_reason=\"insufficient_signal\"` ทันทีโดย **ไม่เรียก LLM เลย**, และ (2) **Post-LLM Confidence Gate** — หากโมเดลสกัดกลับมาได้แต่ `confidence < 0.70` หรือไม่พบข้อมูลหลัก ให้บังคับ `needs_review=True` เสมอ",
      ],
      analogy:
        "เหมือนเจ้าหน้าที่คัดกรองเอกสารที่ไปรษณีย์: ถ้าซองจดหมายว่างเปล่าหรือมีแค่สติกเกอร์แปะอยู่ เขาจะตีตรา \"รอตรวจสอบเพิ่มเติม\" ทันที ไม่ส่งต่อไปให้ฝ่ายบัญชีเดาตัวเลขเอาเอง",
      bullets: [
        "**Short-Circuit ก่อนยิง API**: ประหยัดค่า LLM `100%` สำหรับสแปม/อีโมจิล้วน และรับประกัน 0% hallucination",
        "**Nullable Fields + Explicit Reason**: คืน `order_id=None`, `amount_thb=None` และระบุ `review_reason` ชัดเจนเพื่อให้ทีม Ops คัดกรองต่อง่าย",
        "**Low-Confidence Escalation**: ผูกกฎ `if confidence < threshold: needs_review = True` ไว้ในโค้ด Python ({{validation}}) ไม่ปล่อยให้โมเดลตัดสินใจเองฝ่ายเดียว",
      ],
      whyTitle: "Why this matters — ระบบที่รู้จักบอกว่า \"ไม่แน่ใจ\" น่าเชื่อถือกว่าเสมอ",
      whyParagraphs: [
        "ในงานองค์กร การเดาผิดแบบเงียบ ๆ (เช่น ส่งเคสโอนเงินพลาดไปหมวดทั่วไปแล้วปิดงาน) สร้างความเสียหายมากกว่าการส่งเคสกำกวม 5% เข้าคิว `needs_review` หลายเท่า",
        "รูปแบบ safe fallback นี้จะเชื่อมต่อโดยตรงกับตัวชี้วัด Review Rate และ Accuracy ใน Day 90 รวมถึงแนวคิด Abstention และ Human-in-the-Loop ใน Phase 4",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Pre-Normalization คือ Input Sanitization Middleware ของงาน AI",
      body: [
        "ในเว็บแอป Node.js / FastAPI คุณไม่เคยเอา `req.body.text` ยัดลงฐานข้อมูลตรง ๆ โดยไม่ `trim()`, ตรวจความยาว และ sanitize อักขระแปลกปลอม — ในระบบ LLM Extractor ชั้น `normalize_thai_text()` + `short_circuit_check()` ก็ทำหน้าที่เป็น middleware ด่านหน้าตัวเดียวกัน",
        "ต่างกันเพียงว่าถ้าข้อมูลไม่พอแทนที่จะตอบ HTTP 400 ให้ลูกค้า แอป AI มักคืน typed fallback object ที่มี `needs_review=True` เพื่อส่งต่อให้เจ้าหน้าที่หรือถามข้อมูลเพิ่มอย่างนุ่มนวล",
      ],
      table: [
        ["`normalize_thai_text(raw)`", "Zod `.trim().transform()` / Express input sanitizer"],
        ["Pre-LLM Short-Circuit (`empty/emoji`)", "Early return guard clause ก่อน query DB หนัก ๆ"],
        ["Targeted Few-Shot Examples", "Rule config / mapping examples สำหรับเคสคลุมเครือ"],
        ["`needs_review=True` Fallback", "Dead-letter queue / manual moderation state"],
      ],
    },
    student: {
      title: "First-Year Note — อักขระ Zero-Width คืออะไร ทำไมมองไม่เห็นแต่ทำให้โค้ดพัง?",
      body: [
        "ภาษาไทยไม่มีช่องว่างระหว่างคำ โปรแกรมแชตและเว็บเบราว์เซอร์จึงแอบแทรกอักขระพิเศษที่ชื่อ **Zero-Width Space (`\\u200b`)** ไว้ระหว่างคำเพื่อช่วยตัดบรรทัด เวลาพิมพ์ออกหน้าจอเราจะมองไม่เห็นเลย แต่ใน Python `len(\"โอน\\u200bเงิน\")` จะยาวกว่า `len(\"โอนเงิน\")` อยู่ 1 ตัวอักษร!",
        "เมื่อเราเช็ก `\"โอนเงิน\" in text` หรือส่งข้อความเข้า tokenizer อักขระล่องหนนี้จึงทำให้โค้ดจับคู่พลาดได้ง่าย การล้าง `\\u200b` และแปลงเลขไทยเป็นเลขอารบิกก่อนทุกครั้งคือวิธีป้องกันที่สะอาดและได้ผลทันที",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ระบบรับข้อความแจ้งปัญหาภาษาไทยจากแชตจริงที่มีทั้งเลขไทย อักขระ zero-width คำพิมพ์ลากเสียง สแลง ไทยปนอังกฤษ และข้อความอีโมจิล้วน — เราจะสร้าง pipeline 3 ขั้นที่จัดการครบทุกเคสแบบรันออฟไลน์ได้ 100%",
    steps: [
      {
        title: "1 · เขียนและทดสอบ Pre-Normalizer ภาษาไทยบนข้อความสกปรกจริง",
        explain:
          "ล้าง zero-width, แก้ `เเ→แ`, แปลงเลขไทย `๐–๙` เป็น `0–9` และยุบเฉพาะตัวอักษรไทยซ้ำ 3+ ตัว โดยตรวจให้แน่ใจว่า `order #INV-2000` และ `10000` ยังอยู่ครบ",
        code: {
          language: "python",
          filename: "worked_d089.py",
          code: `import re
import unicodedata

THAI_DIGITS = str.maketrans("๐๑๒๓๔๕๖๗๘๙", "0123456789")
ZW_RE = re.compile(r"[\\u200b\\u200c\\u200d\\ufeff]")
THAI_REPEAT_RE = re.compile(r"([ก-ฮะ-์])\\1{2,}")
SPACE_RE = re.compile(r"\\s+")


def normalize_thai_input(raw: str) -> str:
    text = unicodedata.normalize("NFC", raw)
    text = ZW_RE.sub("", text)
    text = text.replace("เเ", "แ")
    text = text.translate(THAI_DIGITS)
    text = THAI_REPEAT_RE.sub(r"\\1\\1", text)
    return SPACE_RE.sub(" ", text).strip()


samples = [
    "คับพี่ โอน\\u200bเงืนไม่เข้า order #INV-2000 ยอด ๑,๒๕๐ บ. ด่วนนนนน 😭",
    "เเจ้งยกเลืกบิล ยอด ๑๐๐๐๐ บาท คร้าบบบบบ",
    "   😭😭😭 ???   ",
]
for s in samples:
    print("IN :", repr(s))
    print("OUT:", repr(normalize_thai_input(s)))`,
        },
        output: `IN : 'คับพี่ โอน\\u200bเงืนไม่เข้า order #INV-2000 ยอด ๑,๒๕๐ บ. ด่วนนนนน 😭'
OUT: 'คับพี่ โอนเงืนไม่เข้า order #INV-2000 ยอด 1,250 บ. ด่วนน 😭'
IN : 'เเจ้งยกเลืกบิล ยอด ๑๐๐๐๐ บาท คร้าบบบบบ'
OUT: 'แจ้งยกเลืกบิล ยอด 10000 บาท คร้าบบ'
IN : '   😭😭😭 ???   '
OUT: '😭😭😭 ???'`,
      },
      {
        title: "2 · เพิ่มด่าน Short-Circuit สำหรับข้อความว่าง/อีโมจิล้วนก่อนเรียก LLM",
        explain:
          "นับเฉพาะตัวอักษรที่มีความหมาย (ไทย `[ก-ฮ]` หรือ อังกฤษ/ตัวเลข `[A-Za-z0-9]`) หากน้อยกว่า 3 ตัว ให้คืน `TicketExtraction` แบบ `needs_review=True` ทันทีโดยไม่เสียค่าเรียกโมเดล",
        code: {
          language: "python",
          filename: "worked_d089.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

MEANINGFUL_RE = re.compile(r"[ก-ฮA-Za-z0-9]")


class TicketExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: Literal["billing", "shipping", "technical", "other"]
    order_ref: str | None = None
    amount_thb: float | None = Field(default=None, ge=0.0)
    confidence: float = Field(ge=0.0, le=1.0)
    needs_review: bool = False
    review_reason: str | None = None


def short_circuit_if_low_signal(normalized: str, min_chars: int = 3) -> TicketExtraction | None:
    meaningful_count = len(MEANINGFUL_RE.findall(normalized))
    if meaningful_count < min_chars:
        return TicketExtraction(
            category="other",
            order_ref=None,
            amount_thb=None,
            confidence=0.0,
            needs_review=True,
            review_reason="empty_or_emoji_only",
        )
    return None


for text in ["😭😭😭 ???", "คับ", "โอนเงินไม่เข้า order #INV-2000"]:
    res = short_circuit_if_low_signal(text)
    print(f"{text!r:34s} ->", "SHORT-CIRCUIT:" + res.review_reason if res else "SEND TO LLM")`,
        },
        output: `'😭😭😭 ???'                         -> SHORT-CIRCUIT:empty_or_emoji_only
'คับ'                              -> SHORT-CIRCUIT:empty_or_emoji_only
'โอนเงินไม่เข้า order #INV-2000'    -> SEND TO LLM`,
      },
      {
        title: "3 · รวม Pre-Cleaner + Targeted Few-Shot + Low-Confidence Escalation",
        explain:
          "สร้างฟังก์ชัน `extract_with_edge_guards` ที่เรียก pre-cleaner, เช็ก short-circuit, ส่งเข้า mock/LLM พร้อม few-shot examples และบังคับ `needs_review=True` เมื่อความมั่นใจต่ำกว่า `0.70`",
        code: {
          language: "python",
          filename: "worked_d089.py",
          code: `FEW_SHOT_EXAMPLES = [
    (
        "คับพี่ โอนเงืนไม่เข้า order #INV-2026 ยอด 1,250 บ.",
        '{"category":"billing","order_ref":"INV-2026","amount_thb":1250.0,"confidence":0.95,"needs_review":false,"review_reason":null}',
    ),
    (
        "ของยังไม่มาเลยงับ track ไม่ขึ้น",
        '{"category":"shipping","order_ref":null,"amount_thb":null,"confidence":0.88,"needs_review":false,"review_reason":null}',
    ),
]


def apply_confidence_guard(result: TicketExtraction, min_conf: float = 0.70) -> TicketExtraction:
    if result.confidence < min_conf and not result.needs_review:
        return result.model_copy(
            update={"needs_review": True, "review_reason": "low_confidence"}
        )
    return result


raw_llm_json = '{"category":"billing","order_ref":"INV-2026","amount_thb":1250.0,"confidence":0.62,"needs_review":false,"review_reason":null}'
parsed = apply_confidence_guard(TicketExtraction.model_validate_json(raw_llm_json))
print("Guarded result:", parsed.model_dump())`,
        },
        output: `Guarded result: {'category': 'billing', 'order_ref': 'INV-2026', 'amount_thb': 1250.0, 'confidence': 0.62, 'needs_review': True, 'review_reason': 'low_confidence'}`,
      },
    ],
    gotcha:
      "จุดพลาดยอดฮิต: หลายคนใช้ `re.sub(r'(.)\\1{2,}', r'\\1\\1', text)` เพื่อยุบคำลากเสียงอย่าง `ด่วนนนน` แต่ลืมว่ามันจะยุบ `10000` เป็น `100` และยุบ `INV-2000` เป็น `INV-200` ทันที! ต้องจำกัดชุดอักขระที่ยุบไว้เฉพาะตัวอักษรไทย `[ก-ฮะ-์]` เท่านั้น",
  },

  practice: {
    intro:
      "สร้างโมดูล `edge_case_handler.py` สำหรับรับมือข้อความภาษาไทยสกปรกในโลกจริง (สระซ้อน เลขไทย zero-width สแลง ไทยปนอังกฤษ อีโมจิล้วน) พร้อมด่าน `needs_review` ที่ทดสอบได้ 100% ออฟไลน์ด้วย `pytest`",
    requirements: [
      "สร้าง `EdgeExtractionResult(BaseModel)` ที่ตั้ง `ConfigDict(extra=\"forbid\")` มีฟิลด์: `category: Literal[\"billing\", \"shipping\", \"technical\", \"other\"]`, `order_ref: str | None = None`, `amount_thb: float | None = Field(default=None, ge=0.0)`, `confidence: float = Field(ge=0.0, le=1.0)`, `needs_review: bool = False`, `review_reason: str | None = None`, `normalized_text: str`",
      "สร้าง `normalize_thai_input(raw: str) -> str`: ทำ Unicode NFC, ลบ zero-width (`\\u200b`, `\\u200c`, `\\u200d`, `\\ufeff`), แก้ `เเ` เป็น `แ`, แปลงเลขไทย `๐–๙` เป็น `0–9`, ยุบอักขระไทย `[ก-ฮะ-์]` ที่ซ้ำ 3+ ตัวให้เหลือ 2 ตัว (ห้ามแตะตัวเลขและตัวอักษรอังกฤษ), และยุบช่องว่างซ้ำพร้อม `strip()`",
      "สร้าง `has_sufficient_signal(normalized: str, min_chars: int = 3) -> bool`: คืน `True` เมื่อมีอักขระไทย `[ก-ฮ]` หรือ `[A-Za-z0-9]` รวมกันอย่างน้อย `min_chars` ตัว",
      "สร้าง `process_thai_ticket(raw: str, llm_fn: Callable[[str], str], min_confidence: float = 0.70) -> EdgeExtractionResult`: ทำ normalize ก่อน ถ้า `not has_sufficient_signal(...)` ให้คืน fallback ทันที (`category=\"other\"`, `confidence=0.0`, `needs_review=True`, `review_reason=\"insufficient_signal\"`) โดย **ไม่เรียก `llm_fn`**; หากเรียก `llm_fn(normalized)` ให้ parse JSON แล้วบังคับ `needs_review=True, review_reason=\"low_confidence\"` เมื่อ `confidence < min_confidence` (และหาก `llm_fn` คืน JSON พัง/ValidationError ให้จับแล้วคืน safe fallback `review_reason=\"invalid_model_output\"`)",
    ],
    starter: {
      language: "python",
      filename: "edge_case_handler.py",
      code: `from collections.abc import Callable
import re
import unicodedata
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class EdgeExtractionResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: Literal["billing", "shipping", "technical", "other"]
    order_ref: str | None = None
    amount_thb: float | None = Field(default=None, ge=0.0)
    confidence: float = Field(ge=0.0, le=1.0)
    needs_review: bool = False
    review_reason: str | None = None
    normalized_text: str


def normalize_thai_input(raw: str) -> str:
    """ล้าง zero-width, เเ->แ, แปลงเลขไทย และยุบอักขระไทยซ้ำโดยไม่แตะเลข/อังกฤษ"""
    # TODO: implement Thai deterministic pre-normalizer
    raise NotImplementedError


def has_sufficient_signal(normalized: str, min_chars: int = 3) -> bool:
    """ตรวจว่ามีตัวอักษรไทยหรืออังกฤษ/ตัวเลขอย่างน้อย min_chars ตัว"""
    # TODO: count meaningful chars
    raise NotImplementedError


def process_thai_ticket(
    raw: str,
    llm_fn: Callable[[str], str],
    min_confidence: float = 0.70,
) -> EdgeExtractionResult:
    """Normalize -> Short-circuit -> Call llm_fn -> Validate & apply safe fallback"""
    # TODO: wire full guarded extraction pipeline
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_edge_case_handler.py",
      code: `import json
import pytest
from edge_case_handler import (
    has_sufficient_signal,
    normalize_thai_input,
    process_thai_ticket,
)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("โอน\\u200bเงิน ยอด ๑,๒๕๐ บาท", "โอนเงิน ยอด 1,250 บาท"),
        ("เเจ้งปัญหา order #INV-2000 ยอด ๑๐๐๐๐ ด่วนนนน", "แจ้งปัญหา order #INV-2000 ยอด 10000 ด่วนน"),
        ("  คร้าบบบบบ   ช่วยเช็กหน่อย  ", "คร้าบบ ช่วยเช็กหน่อย"),
    ],
)
def test_normalize_thai_input_preserves_codes_and_numbers(raw: str, expected: str):
    assert normalize_thai_input(raw) == expected


@pytest.mark.parametrize("raw", ["", "   ", "😭😭😭", "??? 🙏🙏", "คับ"])
def test_short_circuit_skips_llm_on_low_signal(raw: str):
    called = False

    def should_not_be_called(_: str) -> str:
        nonlocal called
        called = True
        return "{}"

    res = process_thai_ticket(raw, llm_fn=should_not_be_called)
    assert called is False
    assert has_sufficient_signal(res.normalized_text) is False
    assert res.category == "other"
    assert res.needs_review is True
    assert res.review_reason == "insufficient_signal"


def test_code_switching_slang_and_low_confidence_guard():
    seen_input: list[str] = []

    def mock_llm(text: str) -> str:
        seen_input.append(text)
        return json.dumps({
            "category": "billing",
            "order_ref": "INV-2026",
            "amount_thb": 1250.0,
            "confidence": 0.65,
            "needs_review": False,
            "review_reason": None,
            "normalized_text": text,
        })

    res = process_thai_ticket(
        "คับพี่ โอน\\u200bเงืนไม่เข้า order #INV-2026 ยอด ๑,๒๕๐ บ.",
        llm_fn=mock_llm,
        min_confidence=0.70,
    )
    assert len(seen_input) == 1
    assert "1,250" in seen_input[0]
    assert "\\u200b" not in seen_input[0]
    assert res.order_ref == "INV-2026"
    assert res.needs_review is True
    assert res.review_reason == "low_confidence"


def test_invalid_model_output_falls_back_safely():
    res = process_thai_ticket(
        "ขอใบกำกับภาษี order #INV-99",
        llm_fn=lambda _: "NOT VALID JSON",
    )
    assert res.category == "other"
    assert res.needs_review is True
    assert res.review_reason == "invalid_model_output"
`,
    },
    selfCheck: [
      "`normalize_thai_input` ลบ `\\u200b`, แก้ `เเ→แ`, แปลงเลขไทย `๑๐๐๐๐` เป็น `10000` และไม่ยุบเลข `000` ใน `INV-2000`",
      "ข้อความว่าง อีโมจิล้วน หรือคำสั้น `คับ` ถูก short-circuit โดยไม่เรียก `llm_fn` เลย (`called is False`)",
      "ผลลัพธ์ที่ `confidence < 0.70` ถูกบังคับ `needs_review=True` พร้อม `review_reason=\"low_confidence\"`",
      "หาก `llm_fn` คืน JSON พัง ระบบไม่ crash แต่คืน safe fallback `review_reason=\"invalid_model_output\"`",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance:
      "ผ่านทุกเทสต์ใน `test_edge_case_handler.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .` โดยไม่มี warning",
    hints: [
      {
        body: "ใช้ `str.maketrans(\"๐๑๒๓๔๕๖๗๘๙\", \"0123456789\")` สำหรับแปลงเลขไทย และใช้ regex `r\"([ก-ฮะ-์])\\1{2,}\"` เพื่อยุบเฉพาะตัวอักษรไทยที่ซ้ำ 3 ตัวขึ้นไปโดยไม่แตะตัวเลขหรือตัวอักษรอังกฤษ",
      },
      {
        body: "ใน `process_thai_ticket` อย่าลืมเติม `normalized_text` กลับเข้าผลลัพธ์ (หรือใช้ `model_validate_json` และจับ `ValidationError` / `ValueError` แล้วคืน fallback ที่ตั้ง `review_reason=\"invalid_model_output\"`)",
      },
      {
        body: "โครงของ `normalize_thai_input` และ `has_sufficient_signal` พร้อมแล้ว — เหลือเติม `process_thai_ticket`:",
        code: {
          language: "python",
          filename: "hint_day89.py",
          code: `THAI_DIGITS = str.maketrans("๐๑๒๓๔๕๖๗๘๙", "0123456789")
ZW_RE = re.compile(r"[\\u200b\\u200c\\u200d\\ufeff]")
THAI_REPEAT_RE = re.compile(r"([ก-ฮะ-์])\\1{2,}")
SPACE_RE = re.compile(r"\\s+")
MEANINGFUL_RE = re.compile(r"[ก-ฮA-Za-z0-9]")


def normalize_thai_input(raw: str) -> str:
    text = unicodedata.normalize("NFC", raw)
    text = ZW_RE.sub("", text)
    text = text.replace("เเ", "แ")
    text = text.translate(THAI_DIGITS)
    text = THAI_REPEAT_RE.sub(r"\\1\\1", text)
    return SPACE_RE.sub(" ", text).strip()


def has_sufficient_signal(normalized: str, min_chars: int = 3) -> bool:
    return len(MEANINGFUL_RE.findall(normalized)) >= min_chars`,
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
      title: "ยุบตัวอักษรซ้ำด้วย `(.)\\1{2,}` แบบเหมาทั้งสตริง",
      symptom: "ข้อความ `โอนเงิน 10000 บาท order #INV-2000` ถูกแก้เป็น `100 บาท order #INV-200` ทำตัวเลขบัญชีและรหัสออเดอร์พังเงียบ ๆ",
      fix: "จำกัด regex การยุบเฉพาะตัวอักษรไทย `r\"([ก-ฮะ-์])\\1{2,}\"` เท่านั้น ห้ามแตะตัวเลขหรือตัวอักษรภาษาอังกฤษ",
    },
    {
      title: "ส่งข้อความว่างหรืออีโมจิล้วนเข้า LLM โดยไม่คัดกรองก่อน",
      symptom: "ลูกค้าพิมพ์แค่ `😭😭😭` แต่ LLM ที่ถูกบังคับด้วย Strict Schema กลับเดา `category=\"billing\"` และสร้างสรุปมั่วขึ้นมาเอง",
      fix: "วางด่าน `has_sufficient_signal()` short-circuit ก่อนเรียก LLM ให้ส่งไป `needs_review=True` ด้วยต้นทุน `$0`",
    },
    {
      title: "พยายามเขียน Regex แก้คำสแลงและคำพิมพ์ผิดภาษาไทยทุกคำใน Python",
      symptom: "ไฟล์ regex บวมเป็นหลายร้อยบรรทัด ดูแลไม่ไหว และเผลอแก้คำปกติให้ผิดความหมายเมื่อเจอคำใหม่",
      fix: "ใช้ Python ทำเฉพาะ normalization ที่เป็นกฎตายตัว แล้วใช้ Targeted {{few-shot}} Examples 3–5 เคสให้ LLM จัดการสแลงและคำพิมพ์ผิด",
    },
    {
      title: "ลบอักขระที่ไม่ใช่ภาษาไทยออกทั้งหมดตอน pre-clean",
      symptom: "รหัส `order #INV-2026`, `SKU-99A`, อีเมล และสกุลเงิน `THB/USD` หายไปหมดก่อนถึงโมเดล",
      fix: "เก็บรักษาตัวอักษรอังกฤษ ตัวเลข และเครื่องหมายรหัส (`#`, `-`, `.`, `,`, `/`) ไว้ครบ ลบเฉพาะอักขระควบคุม/zero-width ที่เป็นขยะจริง ๆ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d089-q1",
        "หากคุณต้องการยุบคำพิมพ์ลากเสียงภาษาไทย (เช่น `ด่วนนนนน`, `คร้าบบบบ`) โดยไม่ทำให้รหัส `INV-2000` หรือยอดเงิน `10000` เสียหาย ข้อใดคือวิธีที่ถูกต้อง?",
        [
          ["ใช้ `re.sub(r'(.)\\1{2,}', r'\\1', text)` กับทั้งข้อความ", "อันตราย — จะยุบ `10000` เป็น `10` และ `INV-2000` เป็น `INV-20` ทันที"],
          ["จำกัด regex การยุบเฉพาะช่วงตัวอักษรไทย `r'([ก-ฮะ-์])\\1{2,}'` ให้เหลือ 2 ตัว แล้วปล่อยตัวเลขและภาษาอังกฤษไว้ตามเดิม", "ถูก — ลดเสียงลากภาษาไทยได้สะอาดโดยไม่แตะตัวเลขยอดเงินหรือรหัส SKU"],
          ["ลบตัวเลขและภาษาอังกฤษออกจากข้อความทั้งหมดก่อนส่งเข้า LLM", "ผิดมหันต์ — จะทำให้เลขใบแจ้งหนี้และยอดเงินหายหมด"],
          ["ไม่ต้องทำอะไรเลย และตั้ง `temperature=1.5` ให้โมเดลเดาเอง", "temperature สูงยิ่งทำให้ผลลัพธ์ไม่นิ่ง ไม่เกี่ยวกับการล้างสัญญาณรบกวน"],
        ],
        "B",
        "การทำ pre-normalization ในข้อความไทยปนอังกฤษต้องระวังไม่กระทบตัวเลขและรหัสภาษาอังกฤษ จึงควรจำกัดการยุบตัวอักษรซ้ำไว้เฉพาะช่วงตัวอักษรไทยเท่านั้น",
        "ทำไมห้ามใช้ `(.)\\1{2,}` ยุบอักขระซ้ำกับข้อความไทยที่มีรหัสออเดอร์หรือยอดเงิน?",
        "เพราะจะไปยุบเลข `0` ซ้ำในยอดเงิน (เช่น `10000` → `100`) และรหัสอย่าง `INV-2000` — ต้องจำกัดเฉพาะช่วงตัวอักษรไทย `[ก-ฮะ-์]`",
      ),
      mc(
        "d089-q2",
        "ข้อใดคือการแบ่งหน้าที่ระหว่าง **Python Pre-Cleaner** กับ **LLM + Few-Shot** ที่เหมาะสมที่สุดสำหรับงานสกัดเอกสารไทย?",
        [
          ["ให้ Python แก้สแลงทุกคำด้วย dictionary 500 คำ ส่วน LLM ทำแค่แปลงเลขไทย", "สลับบทบาทกัน — แปลงเลขไทยเป็นกฎตายตัวที่ Python ทำได้ 100% ส่วนสแลงควรมอบให้ LLM"],
          ["ส่งข้อความดิบทั้งหมดเข้า LLM โดยไม่ทำ normalization เลย", "ปล่อยให้ zero-width, เลขไทย และอีโมจิล้วนไปเพิ่มต้นทุนและโอกาส hallucination โดยไม่จำเป็น"],
          ["ให้ Python ทำกฎตายตัว (NFC, ลบ zero-width, แปลงเลขไทย, short-circuit อีโมจิล้วน) และให้ LLM + Few-Shot ตีความสแลง พิมพ์ผิด และไทยปนอังกฤษ", "ถูก — ได้ทั้งความเร็ว ความแน่นอนในระดับตัวอักษร และความยืดหยุ่นทางภาษาในระดับความหมาย"],
          ["ให้ Python ใช้ regex สกัดทุกฟิลด์เองโดยไม่ต้องใช้ LLM", "เมื่อเจอสแลง พิมพ์ผิด หรือรูปประโยคหลากหลาย regex จะพังง่ายมาก"],
        ],
        "C",
        "แบ่งงานตามธรรมชาติของปัญหา: กฎตายตัวทำใน Python (`<1ms`, ฟรี, 100% แน่นอน) ส่วนความหมายแฝง สแลง พิมพ์ผิด และ code-switching ใช้ LLM + Few-Shot",
        "ควรแบ่งงานระหว่าง Python pre-cleaner กับ LLM + Few-Shot อย่างไรในข้อความไทยจริง?",
        "Python ทำ deterministic cleaning (NFC, ลบ zero-width, เลขไทย, short-circuit อีโมจิล้วน) ส่วน LLM + Few-Shot ตีความสแลง พิมพ์ผิด และไทยปนอังกฤษ",
      ),
      mc(
        "d089-q3",
        "ลูกค้าส่งข้อความมาเพียง `😭😭😭 ???` เข้าสู่ระบบสกัดทิกเก็ตที่ใช้ Strict Schema วิธีรับมือที่ปลอดภัยและคุ้มค่าที่สุดคือข้อใด?",
        [
          ["ส่งเข้า Frontier LLM เพื่อเดาว่าลูกค้าน่าจะร้องเรียนเรื่องการจ่ายเงิน", "เสี่ยงเกิด hallucination สูงมากและเสียค่า API โดยเปล่าประโยชน์"],
          ["ทำ Pre-LLM Short-Circuit ตรวจพบสัญญาณไม่พอแล้วคืน `category=\"other\", needs_review=True, review_reason=\"insufficient_signal\"` โดยไม่เรียก LLM", "ถูก — ประหยัดค่า API 100% และตัดโอกาสที่โมเดลจะแต่งข้อมูลมั่ว"],
          ["โยน `RuntimeError` ให้ระบบล่มเพื่อแจ้งเตือนนักพัฒนา", "ข้อความจากผู้ใช้ไม่ควรทำให้ service ล่ม ควรคืน fallback ที่ปลอดภัย"],
          ["เติมคำว่า `ขอคืนเงิน` ต่อท้ายให้โมเดลวิเคราะห์ง่ายขึ้น", "ห้ามแต่งเนื้อหาแทนผู้ใช้เด็ดขาด"],
        ],
        "B",
        "ข้อความว่างหรืออีโมจิล้วนไม่มีข้อมูลให้สกัด การดัก short-circuit ก่อนยิง LLM แล้วส่งเข้าคิว `needs_review` ช่วยทั้งลดต้นทุนและป้องกัน hallucination",
        "เมื่อเจอข้อความว่างหรืออีโมจิล้วน ระบบ extractor ควรทำอย่างไร?",
        "Short-circuit ก่อนเรียก LLM แล้วคืน safe fallback (`category='other'`, `needs_review=True`, `review_reason='insufficient_signal'`)",
      ),
      mc(
        "d089-q4",
        "เหตุใดอักขระ Zero-Width Space (`\\u200b`) ที่ติดมากับข้อความภาษาไทยจาก LINE หรือเว็บเบราว์เซอร์จึงสร้างปัญหาให้ระบบ AI?",
        [
          ["ทำให้ Python ไม่สามารถอ่านไฟล์ UTF-8 ได้", "UTF-8 อ่าน `\\u200b` ได้ตามปกติ แต่มันซ่อนตัวอยู่ในสตริงโดยมองไม่เห็น"],
          ["ทำลายขอบเขตคำ ทำให้การจับคู่สตริงพลาดและทำให้ tokenizer แตกคำไทยเดิมออกเป็น token ส่วนเกิน", "ถูก — คำที่ตาเปล่าดูเหมือนกันอาจไม่เท่ากันในระดับไบต์และกิน token มากขึ้นโดยใช่เหตุ"],
          ["ทำให้ GPU หยุดทำงานทันที", "ไม่ทำให้ GPU พัง แต่ทำให้คุณภาพการตัดคำและ token efficiency แย่ลง"],
          ["ทำให้เลขไทยกลายเป็นเลขติดลบ", "ไม่เกี่ยวกับเครื่องหมายลบของตัวเลข"],
        ],
        "B",
        "`\\u200b` มองไม่เห็นด้วยตาเปล่าแต่แทรกอยู่กลางคำไทย ทำให้การเทียบสตริง, regex และ BPE tokenizer แตกคำผิดรูป จึงควรลบออกในขั้น pre-normalization เสมอ",
        "ทำไมต้องลบอักขระ Zero-Width (`\\u200b`, `\\ufeff`) ออกจากข้อความไทยก่อนส่งเข้า pipeline?",
        "เพราะมองไม่เห็นแต่แทรกกลางคำ ทำให้การจับคู่สตริงพลาดและทำให้ tokenizer แตกคำไทยเป็น token ส่วนเกิน",
      ),
    ],
  },

  takeaways: [
    "ทำ **Deterministic Pre-Normalization** (Unicode NFC, ลบ Zero-Width, แก้ `เเ→แ`, แปลงเลขไทย `๐–๙`, ยุบเฉพาะตัวอักษรไทยซ้ำ) ก่อนส่งข้อความเข้า LLM เสมอ",
    "ระวังอย่าให้ regex ยุบตัวเลขยอดเงินหรือรหัสอังกฤษอย่าง `INV-2000` / `10000` — ล็อกขอบเขตไว้เฉพาะ `[ก-ฮะ-์]`",
    "แบ่งงานให้ชัด: กฎตายตัวจบใน Python, สแลง/พิมพ์ผิด/ไทยปนอังกฤษใช้ Targeted {{few-shot}} 3–5 เคส",
    "วางด่าน Short-Circuit สำหรับข้อความว่าง/อีโมจิล้วน และ Confidence Gate สำหรับเคสกำกวมเพื่อส่งเข้า `needs_review=True` อย่างปลอดภัย",
  ],

  reviewCards: [
    rc(
      "d089-rc-1",
      "ขั้นตอน Deterministic Pre-Normalization 5 อย่างที่ควรทำกับข้อความไทยก่อนส่งเข้า LLM คืออะไร?",
      "1) Unicode NFC, 2) ลบ Zero-Width (`\\u200b`..`\\ufeff`), 3) แก้ `เเ→แ`, 4) แปลงเลขไทย `๐–๙` เป็น `0–9`, 5) ยุบเฉพาะอักขระไทย `[ก-ฮะ-์]` ซ้ำ 3+ ตัว (ไม่แตะเลข/รหัสอังกฤษ)",
    ),
    rc(
      "d089-rc-2",
      "ทำไมจึงไม่ควรส่งข้อความที่มีแต่อีโมจิหรือสั้นเกินไปเข้า LLM ที่ใช้ Strict Schema?",
      "เพราะไม่มีข้อมูลให้สกัด และ Strict Schema จะบีบให้โมเดลเดาหมวดหมู่/เนื้อหามั่ว (hallucinate) แถมเสียค่า API ฟรี — ควร short-circuit ไป `needs_review=True` ทันที",
    ),
    rc(
      "d089-rc-3",
      "เมื่อไหร่ควรใช้โค้ด Python จัดการ edge case และเมื่อไหร่ควรใช้ Few-Shot ใน Prompt?",
      "กฎตายตัวระดับอักขระ/format ใช้ Python; ส่วนความหมายแฝง สแลง พิมพ์ผิด และไทยปนอังกฤษ ใช้ Targeted Few-Shot ใน Prompt",
    ),
  ],

  sources: [
    { label: "Python Docs — unicodedata (Unicode Normalization)", href: "https://docs.python.org/3/library/unicodedata.html" },
    { label: "Unicode Standard Annex #15 — Normalization Forms", href: "https://unicode.org/reports/tr15/" },
    { label: "PyThaiNLP Docs — Text Normalization Utilities", href: "https://pythainlp.github.io/docs/5.0/api/util.html" },
    { label: "Pydantic v2 Docs — Validation & Error Handling", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
  ],

  glossary: [
    "pydantic",
    "structured-output",
    "few-shot",
    "hallucination",
    "context-engineering",
    "validation",
    "parametrize",
    "pythainlp",
  ],
});
