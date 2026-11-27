import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D081 — Phase 3 / Block B21
 * Multimodal Inputs (Vision/PDF-to-Image for Thai receipts & tables)
 */
export const d081: Lesson = defineLesson({
  day: 81,
  titleTh: "สกัดใบเสร็จ สลิปโอนเงิน และตาราง PDF ไทยด้วย Multimodal Vision LLM",
  tagline: "30 นาที · รองรับทั้ง Vision API จริงและโหมด mock บนเครื่อง · ย่อภาพคุมต้นทุน token และตรวจยอดใบเสร็จด้วย Pydantic v2",
  icon: "image",
  visual: {
    id: "multimodal-batch-flow",
    title: "Multimodal Vision (สลิป/ใบเสร็จไทย) & Batch API (ลดต้นทุน 50%)",
    caption: "สลับดูท่อสกัดภาพใบเสร็จไทยแบบควบคุมความละเอียด/ต้นทุน image tokens กับคิว Batch API แบบออฟไลน์",
    alt: "แผนภาพ Multimodal Vision pipeline และ Batch API",
  },
  requiresApiKey: true,
  apiKeyNote: "รันการแปลงภาพ, resize และตรวจสคีมาใบเสร็จไทยบนเครื่องได้ 100% พร้อม mock Vision client",
  tools: ["Official SDK", "Pillow", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "เอกสารการเงินไทยพังง่ายเมื่อสกัดด้วย Plain Text PDF Parser",
      body: "สลิปโอนเงิน ใบเสร็จความร้อน และตาราง PDF ที่มีเส้นกรอบหรือเซลล์ผสานมักเกิดสระลอย คอลัมน์สลับ หรือไม่มีชั้นข้อความ (scanned image) การแปลงหน้าเอกสารเป็นภาพแล้วส่งให้โมเดล {{multimodal}} อ่านพร้อมบริบทเชิงพื้นที่ช่วยแก้จุดบอดนี้ได้โดยตรง",
      lessonNote: "วันนี้เราสร้างท่อเตรียมภาพด้วย Pillow (แก้ทิศทาง EXIF, ย่อด้านยาว, แปลง JPEG + Base64 Data URI) ก่อนส่งเข้า Vision LLM",
    },
    {
      node: 2,
      heading: "ควบคุมความละเอียดภาพเพื่อคุมต้นทุน Vision Image Tokens",
      body: "Vision {{llm}} คิดค่าบริการตามจำนวนตารางย่อย (512×512 tiles) ของภาพ หากส่งรูปถ่ายมือถือขนาด 4000×3000 px โดยไม่ย่อ จะเสีย token และเวลาโหลดเพิ่มขึ้นหลายเท่าโดยไม่ได้ความแม่นยำเพิ่ม",
      lessonNote: "เราจะคำนวณจำนวน image tiles ตามสูตร `detail=\"low\"` vs `detail=\"high\"` เพื่อเลือกความละเอียดที่คมพออ่านเลขไทยได้แต่ไม่เปลืองงบ",
    },
    {
      node: 3,
      heading: "ซ้อน Pydantic Strict Schema + Cross-Field Check ตรวจยอดใบเสร็จ",
      body: "แม้โมเดล Vision จะมองเห็นตัวเลขในภาพได้ดี แต่ยังอาจอ่านเลข `6` เป็น `8` หรือข้ามบรรทัดส่วนลด การผูก {{structured-output}} เข้ากับ `@model_validator` ช่วยจับยอดรวมไม่ตรงได้แบบ {{fail-fast}}",
      lessonNote: "เราจะใช้ {{pydantic}} v2 ตรวจผลรวม `items` กับ `grand_total` และทดสอบทั้งเคสผ่านและเคสยอดเพี้ยนผ่าน {{mocking}} ใน `pytest`",
    },
    {
      node: 4,
      heading: "เชื่อมภาพเอกสารจริงเข้าสู่ระบบบัญชีและการเบิกจ่าย",
      body: "เมื่อรวมท่อ Image Preprocessing + Vision Extraction + Pydantic Validation เข้าด้วยกัน แอปสามารถรับรูปสลิปหรือหน้า PDF จากผู้ใช้แล้วคืน object ที่พร้อมบันทึกลงฐานข้อมูลหรือส่งต่อให้เจ้าหน้าที่ตรวจเมื่อยอดไม่ตรง",
      lessonNote: "รูปแบบ payload ภาพจากวันนี้จะต่อยอดเข้าสู่ Batch API (Day 82) เพื่อสกัดใบเสร็จย้อนหลังนับพันใบในราคาครึ่งเดียว",
    },
  ],

  objectives: [
    "**อธิบาย** สาเหตุที่สลิปโอนเงิน ใบเสร็จความร้อน และตาราง PDF ไทยพังเมื่อใช้ text extraction ธรรมดา และเลือกใช้ {{multimodal}} Vision pipeline ได้อย่างเหมาะสม",
    "**เขียนโค้ด** Image Preprocessing ด้วย Pillow (`exif_transpose`, คงอัตราส่วนภาพโดยคุมด้านยาวสูงสุด, แปลง RGB/JPEG เป็น Base64 Data URI) พร้อมคำนวณต้นทุน Vision tiles",
    "**ผสาน** Vision payload เข้ากับ {{pydantic}} Strict {{schema}} (`extra=\"forbid\"`, nullable fields) และ cross-field validator ตรวจยอดรวมใบเสร็จ พร้อมทดสอบด้วย mock Vision client ใน `pytest`",
  ],

  prerequisites: [
    "{{pydantic}} v2 Strict JSON Schema และ `@model_validator` (Day 77)",
    "การเรียก Official LLM SDK และแยกชั้น HTTP เพื่อทำ {{mocking}} (Days 73 & 77)",
    "Python พื้นฐาน, `io.BytesIO`, `base64` และ `pytest`",
    "รันการประมวลผลภาพและ `pytest` บนเครื่องได้ 100% โดยไม่ต้องใช้ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ด้วย `uv` พร้อมติดตั้ง `pillow` (จัดการภาพ), `pydantic` และ `openai` SDK — ทุกตัวอย่างและ `pytest` ทดสอบได้ครบ 100% บนเครื่องแบบออฟไลน์",
    commands: `uv init ai-day81 && cd ai-day81
uv add pillow pydantic openai
uv add --dev pytest ruff
uv run python -c "from PIL import Image; import pydantic; print('Pillow + Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโฟลเดอร์โปรเจกต์ `ai-day81` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pillow`, `pydantic`, `openai` และ `pytest` สำเร็จ"],
      ["verify", "รันคำสั่งนำเข้า `PIL.Image` และ `pydantic` ผ่านโดยไม่มี error"],
    ],
    note: "หากต้องการแปลงไฟล์ PDF หลายหน้าเป็นภาพบนเครื่องในงานจริง สามารถเพิ่ม `pymupdf` (`uv add pymupdf`) เพื่อเรนเดอร์หน้า PDF ที่ 150–200 DPI เป็น PNG/JPEG ก่อนส่งเข้าท่อของวันนี้",
  },

  concepts: [
    {
      id: "why-thai-docs-need-vision",
      title: "1 · ทำไมใบเสร็จ สลิป และตาราง PDF ไทยจึงพังกับ Text Extraction ธรรมดา",
      paragraphs: [
        "หลายคนเริ่มต้นงานสกัดเอกสารด้วยไลบรารีอ่านข้อความ PDF ตรง ๆ เช่น `pypdf` แล้วพบผลลัพธ์สุดปวดหัวกับเอกสารไทย: **สระบน/วรรณยุกต์หลุดตำแหน่ง** จากฟอนต์เก่า, ตัวเลขในคอลัมน์ราคาไหลไปปนกับชื่อสินค้าเพราะไม่มีเส้นตารางในข้อความดิบ, และหนักที่สุดคือเอกสารสแกนหรือรูปถ่ายสลิปโอนเงินจากมือถือซึ่งไม่มี text layer อยู่เลย",
        "โมเดล **{{multimodal}} Vision {{llm}}** อ่านพิกเซลของภาพโดยตรงผ่าน Vision Encoder จึงเห็น **โครงสร้างเชิงพื้นที่ (2D layout)** ทั้งเส้นตาราง คอลัมน์ซ้าย-ขวา โลโก้ธนาคาร ตัวหนาของยอดสุทธิ และสระวรรณยุกต์ไทยครบถ้วนในรอบเดียว โดยไม่ต้องต่อท่อ OCR + Heuristic Parser หลายชั้นให้เปราะบาง",
        "หลักเลือกเครื่องมือง่าย ๆ คือ: ถ้า PDF มีข้อความสะอาดเป็นย่อหน้าเดี่ยวให้ใช้ text extraction (ถูกและเร็วกว่ามาก) แต่ถ้าเป็นสลิป ใบเสร็จ บิลที่มีตารางซับซ้อน หรือภาพสแกน ให้เรนเดอร์เป็นภาพที่ 150–200 DPI แล้วส่งเข้า Vision LLM",
      ],
      analogy: "การอ่านตาราง PDF ด้วย text parser เหมือนเอากรรไกรตัดใบเสร็จเป็นเส้นกระดาษแล้วเทรวมกันในถุง — ตัวอักษรยังอยู่ครบแต่ไม่รู้ว่าเลขไหนคู่กับรายการไหน ส่วน Vision LLM คือการมองใบเสร็จทั้งแผ่นด้วยตาเปล่า",
      bullets: [
        "**สลิปโอนเงิน / ใบเสร็จความร้อน**: เป็นภาพถ่าย (JPEG/PNG) อาจเอียง มืด หรือมี EXIF orientation ผิดทิศ",
        "**ตาราง PDF ที่มีเซลล์ผสาน (Merged Cells)**: text parser มักอ่านข้ามคอลัมน์ ทำให้ราคาและจำนวนหน่วยสลับแถว",
        "**เอกสารไทยฟอนต์ฝังไม่สมบูรณ์**: การ copy-paste ข้อความได้ตัวอักษรเพี้ยน แต่เมื่อเรนเดอร์เป็นภาพสายตาและ Vision model อ่านได้ชัดเจน 100%",
      ],
      whyTitle: "Why this matters — แก้ความผิดพลาดที่ต้นน้ำก่อนข้อมูลไหลเข้าโมเดล",
      whyParagraphs: [
        "กฎทองของงาน AI คือ Garbage In, Garbage Out — ต่อให้เขียน prompt ดีแค่ไหน ถ้าข้อความที่ส่งให้โมเดลมีคอลัมน์ราคาสลับบรรทัด โมเดลก็สกัดเลขผิดอยู่ดี",
        "การใช้ PDF-to-Image + Vision LLM สำหรับเอกสารที่มี layout ซับซ้อนช่วยลดงานเขียน regex เฉพาะเจ้าและรองรับฟอร์มใบเสร็จจากร้านค้าหลายร้อยรูปแบบได้ด้วยโค้ดชุดเดียว",
      ],
    },
    {
      id: "image-preprocess-token-cost",
      title: "2 · ย่อภาพ แก้ทิศ EXIF และคำนวณต้นทุน Vision Image Tokens",
      paragraphs: [
        "การโยนรูปถ่ายมือถือความละเอียดเต็ม (เช่น `4032×3024` px, ไฟล์ 6 MB) เข้าระบบ Vision API เป็นกับดักที่ทำให้ทั้งช้าและเปลืองงบ เพราะไฟล์ที่แปลงเป็น Base64 จะบวมขึ้นอีก ~33% และระบบ Vision API จะแบ่งภาพโหมด `detail=\"high\"` ออกเป็น **ตารางย่อย (tiles) ขนาด 512×512 px** โดยคิดต้นทุนตามจำนวน tiles (เช่น `85` base tokens + `170` tokens ต่อ 1 tile ในรูปแบบมาตรฐานของ OpenAI)",
        "ก่อนส่งภาพทุกครั้งควรทำ Preprocessing 4 ขั้นด้วย Pillow: (1) เรียก `ImageOps.exif_transpose(img)` เพื่อหมุนภาพถ่ายมือถือให้ตั้งตรงจริง ๆ (ใบเสร็จตะแคงทำให้อ่านเลขเพี้ยนหนัก), (2) ย่อภาพโดยคงอัตราส่วนให้ด้านยาวสุดไม่เกิน `max_side` (ปกติ `1024–1536` px คมเกินพอสำหรับใบเสร็จ A4/สลิป), (3) แปลงเป็น `RGB` แล้วบีบเป็น JPEG คุณภาพ `82–85`, และ (4) เข้ารหัสเป็น `data:image/jpeg;base64,...`",
      ],
      analogy: "เหมือนส่งรูปใบเสร็จให้ฝ่ายบัญชีทางแชต — แทนที่จะส่งไฟล์ RAW 25 MB จากกล้องใหญ่ เราย่อให้ภาพตั้งตรง คมชัดพออ่านตัวเลขทุกตัวได้ ในขนาดไฟล์แค่ 150 KB ซึ่งโหลดเร็วและจ่ายค่าส่งถูกกว่าหลายเท่า",
      code: {
        language: "python",
        filename: "vision_preprocess.py",
        code: `import base64
import io
import math
from PIL import Image, ImageOps


def estimate_vision_tokens(width: int, height: int, detail: str = "high") -> int:
    if detail == "low":
        return 85
    # จำลองกฎมาตรฐาน: ย่อลงในกรอบ 2048x2048 แล้วให้ด้านสั้นสุด <= 768 ก่อนนับ tile 512x512
    w, h = float(width), float(height)
    if max(w, h) > 2048:
        scale = 2048.0 / max(w, h)
        w, h = w * scale, h * scale
    if min(w, h) > 768:
        scale = 768.0 / min(w, h)
        w, h = w * scale, h * scale
    tiles = math.ceil(w / 512) * math.ceil(h / 512)
    return 85 + 170 * tiles


def image_to_jpeg_data_uri(img: Image.Image, max_side: int = 1280, quality: int = 85) -> str:
    fixed = ImageOps.exif_transpose(img).convert("RGB")
    fixed.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    fixed.save(buf, format="JPEG", quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"`,
        caption: "`ImageOps.exif_transpose` ป้องกันภาพใบเสร็จหมุน 90° จากกล้องมือถือ และ `thumbnail` คงอัตราส่วนเดิมไม่ให้ตัวหนังสือบิดเบี้ยว",
      },
      whyTitle: "Why this matters — เลือก `detail=\"low\"` vs `detail=\"high\"` ให้ตรงงาน",
      whyParagraphs: [
        "งานจัดประเภทภาพหยาบ ๆ (เช่น แยกว่าภาพนี้เป็น *\"สลิปโอนเงิน\"* หรือ *\"รูปสินค้าชำรุด\"*) ใช้ `detail=\"low\"` (85 tokens คงที่) ประหยัดกว่าเกือบ 10 เท่า แต่ถ้าต้องอ่านตัวเลขบรรทัดเล็ก ๆ บนใบกำกับภาษีไทย ต้องใช้ `detail=\"high\"` คู่กับการย่อ `max_side` ที่เหมาะสม (1024–1536 px)",
        "การวัดและคุมขนาดภาพตั้งแต่ฝั่งแอปช่วยคุมทั้ง Latency ของการอัปโหลดและบิลค่า API ใน production ได้อย่างแม่นยำ",
      ],
    },
    {
      id: "vision-plus-pydantic-guard",
      title: "3 · ผูก Vision LLM กับ Strict Pydantic Schema และกฎตรวจยอดใบเสร็จ",
      paragraphs: [
        "โมเดล Vision ก็ยังเป็น {{llm}} ที่อาจเกิด {{hallucination}} หรืออ่านเลขเบลอผิดหลัก (เช่น อ่าน `1,250.00` เป็น `1,280.00`) เราจึงต้องนำเทคนิค {{structured-output}} จาก Day 77 มาประกบเข้ากับ Multimodal input เสมอ",
        "สำหรับใบเสร็จและสลิปไทย ควรออกแบบ {{basemodel}} ให้มี: (1) `ConfigDict(extra=\"forbid\")`, (2) ฟิลด์ที่อาจไม่มีหรือภาพเบลอเป็น `| None` (เช่น `tax_id: str | None`, `receipt_no: str | None`) เพื่อไม่ให้โมเดลเดามั่ว, และ (3) `@model_validator(mode=\"after\")` ที่เช็กความสอดคล้องของตัวเลข เช่น `sum(item.line_total) - discount + vat == grand_total` ภายใน tolerance `0.05` บาท",
        "เมื่อยอดรวมไม่ตรง ระบบจะ {{fail-fast}} ด้วย {{validation-error}} เพื่อให้เราส่งซ่อม (retry ด้วยภาพที่ชัดขึ้น/โมเดลใหญ่ขึ้น) หรือส่งต่อให้เจ้าหน้าที่ตรวจสอบ แทนที่จะปล่อยตัวเลขเพี้ยนลงระบบบัญชี",
      ],
      analogy: "Vision LLM คือพนักงานคีย์ข้อมูลที่อ่านบิลได้เร็วมาก แต่ Pydantic `@model_validator` คือระบบเครื่องคิดเลขตรวจยอดอัตโนมัติที่ร้องเตือนทันทีถ้าผลบวกรายการไม่ตรงกับยอดท้ายบิล",
      bullets: [
        "**ข้อความสั่ง + ภาพใน User Message เดียว**: ส่ง `content` เป็น list ที่มีทั้ง `{\"type\": \"text\", ...}` และ `{\"type\": \"image_url\", \"image_url\": {\"url\": data_uri, \"detail\": \"high\"}}`",
        "**ตั้ง `temperature=0.0`**: ลดความสุ่มในการอ่านตัวเลขและชื่อร้านค้า",
        "**แยกชั้น Vision Call กับ Validation**: ส่ง `mock_json` หรือ fake client ใน `pytest` เพื่อทดสอบทั้งสคีมาและกฎตรวจยอดโดยไม่ต้องยิง API จริง",
      ],
      whyTitle: "Why this matters — ยอดใบเสร็จมีสัญญาณ Self-Check อยู่ในตัวมันเอง",
      whyParagraphs: [
        "ใบเสร็จและใบกำกับภาษีมีข้อได้เปรียบพิเศษคือมีสมการคณิตศาสตร์ซ่อนอยู่ (`รายการย่อย + VAT - ส่วนลด = ยอดสุทธิ`) หาก Vision model อ่านตัวเลขผิดแม้แต่หลักเดียว โอกาสสูงมากที่สมการจะไม่ลงตัวและถูกจับได้ทันที",
        "นี่คือเหตุผลที่งาน OCR/Document AI ยุคใหม่ไม่เคยเชื่อข้อความที่อ่านได้ตรง ๆ แต่ใช้ Pydantic cross-field validator เป็นตาข่ายนิรภัยชั้นสุดท้ายเสมอ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Vision Payload ≈ `<img src=\"data:...\">` + Sharp Image Resize",
      body: [
        "ในงานเว็บก่อนอัปโหลดรูปโปรไฟล์หรือสลิปไปเก็บ คุณมักใช้ `sharp` หรือ `<canvas>` ย่อขนาดภาพ หมุนตาม EXIF และบีบ JPEG ก่อนส่ง API — การเตรียมภาพให้ Vision LLM ใช้หลักเดียวกันเป๊ะ ต่างแค่ปลายทางส่งเป็น Data URI ใน JSON array `messages[].content`",
        "ส่วนการตรวจยอดใบเสร็จด้วย Pydantic `@model_validator` เทียบได้กับ `zod.superRefine()` ที่รันหลังรับ response จาก upstream service ก่อนบันทึกลง Postgres",
      ],
      table: [
        ["`ImageOps.exif_transpose()` + `thumbnail()`", "`sharp(buf).rotate().resize({ width: 1280 })`"],
        ["`data:image/jpeg;base64,...` ใน `image_url`", "Inline Data URI แบบเดียวกับ `<img src=\"...\">`"],
        ["`detail: \"low\" | \"high\"`", "เลือกขนาด thumbnail vs high-res image เพื่อคุม bandwidth/cost"],
        ["`@model_validator` เช็กผลรวมใบเสร็จ", "`z.object(...).superRefine(...)` เช็ก business invariant"],
      ],
    },
    student: {
      title: "First-Year Note — Base64 Data URI คืออะไร ทำไมส่งรูปใน JSON ได้",
      body: [
        "ปกติ JSON เก็บได้เฉพาะข้อความ ตัวเลข ลิสต์ และ object ไม่สามารถวางข้อมูลไบนารี (bytes ของรูปภาพ) ลงไปตรง ๆ ได้ เราจึงใช้การเข้ารหัส **Base64** แปลง bytes ของไฟล์ JPEG ให้เป็นตัวอักษร ASCII ล้วน แล้วแปะหัว `data:image/jpeg;base64,` ไว้ด้านหน้า",
        "ฝั่ง Vision API จะถอดรหัส Base64 กลับเป็นภาพแล้วส่งเข้าโครงข่ายประสาทเทียม — แต่จำไว้ว่า Base64 ทำให้ขนาดข้อมูลใหญ่ขึ้นราว 33% การย่อขนาดภาพก่อนเข้ารหัสจึงสำคัญมากทั้งเรื่องความเร็วและต้นทุน",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: สร้างท่อสกัดใบเสร็จร้านกาแฟ/ออฟฟิศไทย เริ่มจากสร้างภาพใบเสร็จจำลองในหน่วยความจำด้วย Pillow → ย่อและแปลงเป็น Base64 Data URI + คำนวณ image tokens → สร้าง multimodal payload → ตรวจผลลัพธ์จาก mock Vision client ด้วย Pydantic",
    steps: [
      {
        title: "1 · เตรียมภาพด้วย Pillow และวัดการลดขนาดไฟล์ + Vision Tokens",
        explain: "จำลองรูปใบเสร็จความละเอียดสูง `3000×4000` px แล้วย่อด้านยาวไม่เกิน `1024` px จะเห็นว่าขนาด Base64 และจำนวน image tokens ลดลงอย่างชัดเจน",
        code: {
          language: "python",
          filename: "worked_day81.py",
          code: `import base64
import io
import math
from PIL import Image, ImageOps


def estimate_vision_tokens(width: int, height: int, detail: str = "high") -> int:
    if detail == "low":
        return 85
    w, h = float(width), float(height)
    if max(w, h) > 2048:
        s = 2048.0 / max(w, h)
        w, h = w * s, h * s
    if min(w, h) > 768:
        s = 768.0 / min(w, h)
        w, h = w * s, h * s
    return 85 + 170 * math.ceil(w / 512) * math.ceil(h / 512)


def preprocess_receipt_image(img: Image.Image, max_side: int = 1024) -> tuple[str, tuple[int, int]]:
    fixed = ImageOps.exif_transpose(img).convert("RGB")
    fixed.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    fixed.save(buf, format="JPEG", quality=85, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}", fixed.size


raw_photo = Image.new("RGB", (3000, 4000), color=(250, 250, 245))
data_uri, new_size = preprocess_receipt_image(raw_photo, max_side=1024)
print(f"Original: (3000, 4000) -> high tokens={estimate_vision_tokens(3000, 4000)}")
print(f"Resized : {new_size} -> high tokens={estimate_vision_tokens(*new_size)}, low tokens={estimate_vision_tokens(*new_size, 'low')}")
print(f"Data URI prefix: {data_uri[:32]}... (chars={len(data_uri)})")`,
        },
        output: `Original: (3000, 4000) -> high tokens=765
Resized : (768, 1024) -> high tokens=765, low tokens=85
Data URI prefix: data:image/jpeg;base64,/9j/4AAQSk... (chars=8642)`,
      },
      {
        title: "2 · ประกอบ Multimodal Message Payload พร้อม Strict Receipt Schema",
        explain: "นิยาม `ThaiReceipt` ที่มี `ConfigDict(extra=\"forbid\")`, ช่อง `| None` สำหรับเลขผู้เสียภาษีที่อาจไม่มีในบิล และ `@model_validator` เช็ก `sum(items) + vat - discount == grand_total`",
        code: {
          language: "python",
          filename: "worked_day81.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReceiptItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    qty: int = Field(ge=1)
    line_total: float = Field(ge=0.0)


class ThaiReceipt(BaseModel):
    model_config = ConfigDict(extra="forbid")

    merchant_name: str = Field(min_length=1)
    tax_id: str | None = Field(default=None, description="เลขผู้เสียภาษี 13 หลัก หรือ null หากไม่พบ")
    currency: Literal["THB"] = "THB"
    items: list[ReceiptItem] = Field(min_length=1)
    discount: float = Field(default=0.0, ge=0.0)
    vat_amount: float = Field(default=0.0, ge=0.0)
    grand_total: float = Field(ge=0.0)

    @model_validator(mode="after")
    def verify_receipt_total(self) -> "ThaiReceipt":
        items_sum = sum(item.line_total for item in self.items)
        expected = round(items_sum - self.discount + self.vat_amount, 2)
        if abs(expected - self.grand_total) > 0.05:
            raise ValueError(f"ยอดรวมใบเสร็จไม่ตรง: expected {expected:.2f}, got {self.grand_total:.2f}")
        return self


def build_vision_messages(data_uri: str, detail: Literal["low", "high"] = "high") -> list[dict]:
    return [
        {"role": "system", "content": "สกัดข้อมูลใบเสร็จไทยเป็น JSON ตามสคีมา หากไม่เห็นเลขผู้เสียภาษีให้ใส่ null ห้ามเดา"},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "กรุณาสกัดชื่อร้าน รายการสินค้า ส่วนลด VAT และยอดรวมสุทธิจากภาพใบเสร็จนี้"},
                {"type": "image_url", "image_url": {"url": data_uri, "detail": detail}},
            ],
        },
    ]


msgs = build_vision_messages(data_uri, detail="high")
print("User content parts:", [p["type"] for p in msgs[1]["content"]])`,
        },
        output: `User content parts: ['text', 'image_url']`,
      },
      {
        title: "3 · ทดสอบการสกัดด้วย Mock Vision Client (ทั้งเคสปกติและเคสอ่านเลขเพี้ยน)",
        explain: "ส่ง JSON จำลองจาก Vision model เข้า `ThaiReceipt.model_validate_json()` เพื่อยืนยันว่าเคสถูกต้องผ่านฉลุย และเคสที่อ่านยอดสุทธิเพี้ยนถูกดักทันที",
        code: {
          language: "python",
          filename: "worked_day81.py",
          code: `from pydantic import ValidationError

mock_ok = """{
  "merchant_name": "ร้านกาแฟสายไหม สาขาอโศก",
  "tax_id": null,
  "currency": "THB",
  "items": [
    {"name": "อเมริกาโน่เย็น", "qty": 2, "line_total": 140.0},
    {"name": "ครัวซองต์เนยสด", "qty": 1, "line_total": 85.0}
  ],
  "discount": 15.0,
  "vat_amount": 14.7,
  "grand_total": 224.7
}"""

receipt = ThaiReceipt.model_validate_json(mock_ok)
print("OK:", receipt.merchant_name, "| total:", receipt.grand_total, "| tax_id:", receipt.tax_id)

mock_misread = mock_ok.replace("224.7", "284.7")
try:
    ThaiReceipt.model_validate_json(mock_misread)
except ValidationError as exc:
    print("CAUGHT MISREAD:", exc.errors()[0]["msg"])`,
        },
        output: `OK: ร้านกาแฟสายไหม สาขาอโศก | total: 224.7 | tax_id: None
CAUGHT MISREAD: Value error, ยอดรวมใบเสร็จไม่ตรง: expected 224.70, got 284.70`,
      },
    ],
    gotcha: "อย่าลืมว่าภาพ JPEG หลายภาพที่ถ่ายจาก iPhone/Android เก็บความกว้าง-ยาวเป็นแนวนอนแต่แปะ EXIF Orientation tag หมุน 90° ไว้ — ถ้าไม่เรียก `ImageOps.exif_transpose(img)` ก่อนบันทึกเป็น JPEG ใหม่ tag EXIF จะหายไปและภาพใบเสร็จจะถูกส่งให้ Vision LLM ในสภาพนอนตะแคง!",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day81.py` สำหรับท่อสกัดใบเสร็จ/สลิปไทยด้วย Multimodal Vision: ย่อภาพคุมขนาด, คำนวณ Vision tokens, สร้าง multimodal payload และตรวจความถูกต้องยอดรวมใบเสร็จด้วย Pydantic v2",
    requirements: [
      "สร้างฟังก์ชัน `prepare_image_data_uri(img: Image.Image, *, max_side: int = 1280, quality: int = 85) -> tuple[str, tuple[int, int]]`: ตรวจ `max_side > 0` และ `1 <= quality <= 95` (raise `ValueError` ถ้าไม่ผ่าน), เรียก `ImageOps.exif_transpose(img).convert(\"RGB\")`, ย่อด้วย `thumbnail((max_side, max_side))`, บีบเป็น JPEG และคืน `(f\"data:image/jpeg;base64,{b64}\", (new_w, new_h))`",
      "สร้างฟังก์ชัน `estimate_image_tokens(width: int, height: int, *, detail: Literal[\"low\", \"high\"] = \"high\") -> int`: ตรวจ `width > 0` และ `height > 0`, หาก `detail == \"low\"` คืน `85`, หาก `detail == \"high\"` ย่อจำลองลงในกรอบ 2048×2048 แล้วให้ด้านสั้นสุด `<= 768` ก่อนคำนวณ `85 + 170 * ceil(w/512) * ceil(h/512)`",
      "สร้าง `ReceiptLineItem(BaseModel)` และ `ThaiReceiptExtraction(BaseModel)` ที่ตั้ง `ConfigDict(extra=\"forbid\")` ทั้งคู่ โดยมีฟิลด์ `merchant_name: str`, `tax_id: str | None = None`, `items: list[ReceiptLineItem] = Field(min_length=1)`, `discount_thb: float = Field(default=0.0, ge=0.0)`, `vat_thb: float = Field(default=0.0, ge=0.0)`, `grand_total_thb: float = Field(ge=0.0)` และ `@model_validator(mode=\"after\")` ตรวจว่า `abs((sum(items.line_total) - discount_thb + vat_thb) - grand_total_thb) <= 0.05`",
      "สร้างฟังก์ชัน `build_receipt_vision_request(data_uri: str, *, detail: Literal[\"low\", \"high\"] = \"high\") -> dict` ที่ตรวจว่า `data_uri.startswith(\"data:image/\")` และคืน payload `{\"messages\": [...], \"temperature\": 0.0}` พร้อมบล็อก `image_url` ที่มี `url` และ `detail`",
      "สร้างฟังก์ชัน `extract_receipt(data_uri: str, *, vision_fn: Callable[[dict], str], detail: Literal[\"low\", \"high\"] = \"high\") -> ThaiReceiptExtraction` ที่เรียก `build_receipt_vision_request` → ส่งให้ `vision_fn(req)` → parse ด้วย `ThaiReceiptExtraction.model_validate_json(...)`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day81.py",
      code: `import base64
import io
import math
from collections.abc import Callable
from typing import Literal
from PIL import Image, ImageOps
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReceiptLineItem(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid") และฟิลด์ name (str, min_length=1), qty (int, ge=1), line_total (float, ge=0.0)
    pass


class ThaiReceiptExtraction(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid"), ฟิลด์ใบเสร็จ และ @model_validator ตรวจยอดรวม (tolerance 0.05)
    pass


def prepare_image_data_uri(
    img: Image.Image,
    *,
    max_side: int = 1280,
    quality: int = 85,
) -> tuple[str, tuple[int, int]]:
    """แก้ EXIF, ย่อภาพไม่เกิน max_side และแปลงเป็น JPEG Base64 Data URI."""
    # TODO: implement
    raise NotImplementedError


def estimate_image_tokens(
    width: int,
    height: int,
    *,
    detail: Literal["low", "high"] = "high",
) -> int:
    """ประมาณจำนวน image tokens สำหรับ Vision API."""
    # TODO: implement
    raise NotImplementedError


def build_receipt_vision_request(
    data_uri: str,
    *,
    detail: Literal["low", "high"] = "high",
) -> dict:
    """สร้าง request payload ที่มี text instruction + image_url data URI."""
    # TODO: implement
    raise NotImplementedError


def extract_receipt(
    data_uri: str,
    *,
    vision_fn: Callable[[dict], str],
    detail: Literal["low", "high"] = "high",
) -> ThaiReceiptExtraction:
    """เรียก vision_fn (จริงหรือ mock) และตรวจสคีมาใบเสร็จด้วย Pydantic."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day81.py",
      code: `import json
import pytest
from PIL import Image
from pydantic import ValidationError
from exercise_day81 import (
    ThaiReceiptExtraction,
    build_receipt_vision_request,
    estimate_image_tokens,
    extract_receipt,
    prepare_image_data_uri,
)


def test_prepare_image_resizes_and_encodes():
    img = Image.new("RGBA", (2400, 1200), color=(255, 255, 255, 255))
    uri, size = prepare_image_data_uri(img, max_side=1000, quality=80)
    assert uri.startswith("data:image/jpeg;base64,")
    assert max(size) == 1000
    assert size == (1000, 500)
    with pytest.raises(ValueError):
        prepare_image_data_uri(img, max_side=0)


def test_estimate_image_tokens_low_and_high():
    assert estimate_image_tokens(3000, 2000, detail="low") == 85
    assert estimate_image_tokens(512, 512, detail="high") == 255
    assert estimate_image_tokens(1024, 1024, detail="high") == 765
    with pytest.raises(ValueError):
        estimate_image_tokens(0, 512)


def test_extract_receipt_with_mock_vision_fn():
    img = Image.new("RGB", (600, 800), color=(245, 245, 245))
    uri, _ = prepare_image_data_uri(img, max_side=800)

    captured: dict = {}

    def fake_vision(req: dict) -> str:
        captured["req"] = req
        return json.dumps({
            "merchant_name": "บจก. สยามออฟฟิศ ซัพพลาย",
            "tax_id": None,
            "items": [
                {"name": "กระดาษ A4", "qty": 2, "line_total": 240.0},
                {"name": "ปากกาไวท์บอร์ด", "qty": 1, "line_total": 60.0},
            ],
            "discount_thb": 20.0,
            "vat_thb": 19.6,
            "grand_total_thb": 299.6,
        })

    result = extract_receipt(uri, vision_fn=fake_vision, detail="high")
    assert isinstance(result, ThaiReceiptExtraction)
    assert result.grand_total_thb == pytest.approx(299.6)
    assert result.tax_id is None
    assert captured["req"]["temperature"] == 0.0


def test_extract_receipt_rejects_mismatched_total_and_bad_uri():
    with pytest.raises(ValueError):
        build_receipt_vision_request("http://not-a-data-uri.example/a.jpg")

    bad_json = json.dumps({
        "merchant_name": "ร้านทดสอบ",
        "tax_id": "0105551234567",
        "items": [{"name": "กาแฟ", "qty": 1, "line_total": 100.0}],
        "discount_thb": 0.0,
        "vat_thb": 7.0,
        "grand_total_thb": 199.0,
    })
    with pytest.raises(ValidationError):
        extract_receipt("data:image/jpeg;base64,AAAA", vision_fn=lambda _: bad_json)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases โดยไม่ต้องใช้ API key",
      "ตรวจสอบว่าภาพ `RGBA` (PNG พื้นหลังโปร่งใส) ถูกแปลงเป็น `RGB` ก่อนบันทึกเป็น JPEG ได้โดยไม่ติด `OSError`",
      "ตรวจสอบว่า `estimate_image_tokens(1024, 1024, detail=\"high\")` คืน `765` (85 + 170 × 4 tiles) และ `detail=\"low\"` คืน `85`",
      "ตรวจสอบว่าใบเสร็จที่ `sum(items) - discount + vat != grand_total` ถูกจับด้วย `ValidationError` ทันที",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day81.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "JPEG ไม่รองรับ alpha channel (`RGBA`) จึงต้องเรียก `.convert(\"RGB\")` หลัง `ImageOps.exif_transpose(img)` เสมอ และใช้ `fixed.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)` เพื่อย่อแบบรักษาสัดส่วน",
      },
      {
        body: "ใน `estimate_image_tokens` สำหรับ `detail=\"high\"` ให้ย่อจำลองด้วย float สองขั้น: ขั้นแรกถ้า `max(w, h) > 2048` ให้คูณ `2048 / max(w, h)`, ขั้นสองถ้า `min(w, h) > 768` ให้คูณ `768 / min(w, h)` แล้วค่อยหา `math.ceil(w / 512) * math.ceil(h / 512)`",
      },
      {
        body: "ตัวอย่างโครง `prepare_image_data_uri` และ `ThaiReceiptExtraction` — เติม `estimate_image_tokens`, `build_receipt_vision_request` และ `extract_receipt` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day81.py",
          code: `class ReceiptLineItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1)
    qty: int = Field(ge=1)
    line_total: float = Field(ge=0.0)


class ThaiReceiptExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    merchant_name: str = Field(min_length=1)
    tax_id: str | None = None
    items: list[ReceiptLineItem] = Field(min_length=1)
    discount_thb: float = Field(default=0.0, ge=0.0)
    vat_thb: float = Field(default=0.0, ge=0.0)
    grand_total_thb: float = Field(ge=0.0)

    @model_validator(mode="after")
    def check_total(self) -> "ThaiReceiptExtraction":
        expected = round(sum(i.line_total for i in self.items) - self.discount_thb + self.vat_thb, 2)
        if abs(expected - self.grand_total_thb) > 0.05:
            raise ValueError(f"Expected {expected:.2f}, got {self.grand_total_thb:.2f}")
        return self`,
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
      title: "ส่งรูปถ่ายมือถือความละเอียดเต็ม (4000×3000 px) โดยไม่ย่อและไม่แก้ EXIF",
      symptom: "API ช้าหลายวินาที, ขนาด Base64 ใหญ่หลาย MB และใบเสร็จบางใบส่งไปในสภาพตะแคงจนอ่านตัวเลขผิดหมด",
      fix: "เรียก `ImageOps.exif_transpose(img).convert(\"RGB\")` และย่อด้วย `thumbnail((1280, 1280))` ก่อนบีบเป็น JPEG คุณภาพ 82–85 ทุกครั้ง",
    },
    {
      title: "ใช้ `detail=\"low\"` กับใบกำกับภาษีที่มีตารางและตัวอักษรขนาดเล็ก",
      symptom: "ประหยัด token จริง แต่โมเดลมองไม่เห็นทศนิยม เลขผู้เสียภาษี 13 หลัก หรืออ่านชื่อสินค้าไทยเพี้ยนหนัก",
      fix: "ใช้ `detail=\"low\"` เฉพาะงานคัดแยกประเภทเอกสารหยาบ ๆ ส่วนงานสกัดตัวเลขและตารางให้ใช้ `detail=\"high\"` เสมอ",
    },
    {
      title: "ลืมแปลงภาพ PNG ที่มีช่องโปร่งใส (`RGBA`) เป็น `RGB` ก่อนบันทึก JPEG",
      symptom: "ระบบพังตอนรันจริงด้วย `OSError: cannot write mode RGBA as JPEG` เมื่อลูกค้าอัปโหลดสกรีนช็อตสลิปที่เป็น PNG",
      fix: "เรียก `.convert(\"RGB\")` (หรือวางบนพื้นขาวก่อนแปลง) ทุกครั้งก่อน `save(..., format=\"JPEG\")`",
    },
    {
      title: "เชื่อตัวเลขที่ Vision LLM อ่านได้โดยไม่ตรวจผลบวกข้ามฟิลด์",
      symptom: "ใบเสร็จเบลอทำให้โมเดลอ่าน `180.00` เป็น `100.00` แต่ JSON ผ่านสคีมาทุกช่องและไหลลงระบบบัญชีผิดยอด",
      fix: "ซ้อน `@model_validator(mode=\"after\")` ตรวจสมการ `sum(items) - discount + vat == grand_total` แล้วส่งเคสที่ไม่ตรงเข้าคิวตรวจทาน",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d081-q1",
        "เหตุใดการแปลงหน้า PDF ตารางไทยหรือสลิปโอนเงินเป็นภาพแล้วส่งให้ Multimodal Vision LLM จึงมักได้ผลดีกว่า `pypdf` text extraction ธรรมดา?",
        [
          ["เพราะ Vision LLM ใช้จำนวน token น้อยกว่าข้อความดิบเสมอ", "ไม่จริง — ภาพโหมด `detail=\"high\"` มักใช้ token มากกว่าข้อความสะอาด แต่ได้ความถูกต้องของโครงสร้างตารางและภาพสแกน"],
          ["เพราะ Vision LLM มองเห็นโครงสร้าง 2 มิติ (เส้นตาราง คอลัมน์ ตำแหน่งสระวรรณยุกต์) และอ่านภาพสแกนที่ไม่มี text layer ได้โดยตรง", "ถูก — ช่วยแก้ปัญหาสระลอย คอลัมน์ไหลสลับ และไฟล์ภาพ/สแกนที่ไม่มีชั้นข้อความ"],
          ["เพราะ `pypdf` ไม่รองรับภาษาไทยเลยในทุกกรณี", "PDF ที่สร้างจากฟอนต์ Unicode มาตรฐานและเป็นย่อหน้าเดี่ยวยังสกัดข้อความได้ปกติ ปัญหาหลักคือตารางซับซ้อน ฟอนต์เก่า และภาพสแกน"],
          ["เพราะ Vision LLM ไม่ต้องใช้ Pydantic Schema ในการตรวจผลลัพธ์", "ยังคงต้องใช้ Pydantic Schema และ cross-field validator เหมือนเดิม"],
        ],
        "B",
        "Multimodal Vision LLM รักษาบริบทเชิงพื้นที่ของตารางและอ่านภาพสแกน/สลิปได้โดยตรง จึงเหนือกว่า plain text extraction สำหรับใบเสร็จและตารางที่ซับซ้อน",
        "เมื่อไรควรใช้ PDF-to-Image + Vision LLM แทน Plain Text PDF Extraction?",
        "เมื่อเอกสารเป็นภาพถ่าย/สแกน (สลิป ใบเสร็จ) มีตารางเส้นกรอบ/เซลล์ผสาน หรือฟอนต์ไทยเก่าที่ text parser ดึงแล้วสระและคอลัมน์พัง",
      ),
      mc(
        "d081-q2",
        "ทำไมท่อเตรียมภาพใบเสร็จด้วย Pillow จึงควรเรียก `ImageOps.exif_transpose(img)` ก่อนบันทึกเป็น JPEG ใหม่?",
        [
          ["เพื่อเพิ่มความละเอียดของภาพให้เป็น 4K อัตโนมัติ", "ไม่เกี่ยวกัน — `exif_transpose` ไม่ได้ upscale ภาพ"],
          ["เพื่อหมุนพิกเซลภาพให้ตั้งตรงตาม EXIF Orientation tag ของกล้องมือถือ ป้องกันภาพใบเสร็จถูกส่งไปในสภาพตะแคงเมื่อ metadata หายตอนบันทึกใหม่", "ถูก — กล้องมือถือมักเก็บภาพแนวนอนแล้วแปะ EXIF tag หมุนไว้ หากบันทึกใหม่โดยไม่ transpose ภาพจะเอียง 90°"],
          ["เพื่อลบข้อมูลส่วนบุคคลตามกฎหมาย PDPA ออกจากภาพอัตโนมัติ", "ไม่ได้เบลอหรือลบข้อมูลบนภาพ ต้องทำ redaction แยกต่างหาก"],
          ["เพื่อแปลงรูปแบบไฟล์จาก PNG เป็น Base64 ในคำสั่งเดียว", "`exif_transpose` คืน `PIL.Image` ที่หมุนพิกเซลถูกต้องแล้ว ไม่ได้แปลงเป็น Base64"],
        ],
        "B",
        "ภาพถ่ายจากสมาร์ตโฟนมักอาศัย EXIF Orientation ในการแสดงผลให้ตั้งตรง การเรียก `ImageOps.exif_transpose()` จะหมุนพิกเซลจริงก่อนเซฟเป็น JPEG",
        "หน้าที่ของ `ImageOps.exif_transpose(img)` ในท่อ Vision Preprocessing คืออะไร?",
        "หมุนพิกเซลภาพให้ตั้งตรงตาม EXIF Orientation จริง ๆ ก่อนบันทึก JPEG ใหม่ เพื่อไม่ให้ใบเสร็จตะแคงตอนส่งให้ Vision LLM",
      ),
      mc(
        "d081-q3",
        "ในระบบที่ต้องคัดแยกภาพ 10,000 ภาพว่าเป็น *\"สลิปโอนเงิน\"* หรือ *\"ไม่ใช่สลิป\"* ก่อน แล้วค่อยสกัดตัวเลขเฉพาะภาพที่เป็นสลิป ควรตั้งค่า `detail` อย่างไรจึงคุ้มค่าที่สุด?",
        [
          ["ใช้ `detail=\"high\"` ทั้งสองขั้นเพื่อความปลอดภัยสูงสุด", "สิ้นเปลืองโดยไม่จำเป็นในขั้นคัดแยกหยาบ ๆ ที่มองภาพย่อก็รู้แล้วว่าเป็นสลิปหรือไม่"],
          ["ใช้ `detail=\"low\"` (85 tokens คงที่) ในขั้นคัดแยกประเภทภาพ แล้วค่อยใช้ `detail=\"high\"` เฉพาะภาพที่ต้องอ่านตัวเลขและตารางละเอียด", "ถูก — เทคนิค 2-stage routing นี้ช่วยลดค่า image tokens มหาศาลโดยไม่เสียความแม่นยำในการสกัดเลข"],
          ["ใช้ `detail=\"low\"` ทั้งสองขั้นเพราะอ่านตัวเลขเล็ก ๆ ได้เท่ากัน", "`detail=\"low\"` ย่อภาพเหลือระดับ 512×512 ทำให้เลขเล็กและทศนิยมบนใบเสร็จเบลอจนอ่านผิด"],
          ["ไม่ต้องระบุ `detail` และส่งภาพขนาด 8000×6000 px ตรง ๆ", "ทำให้เสีย bandwidth และเวลาอัปโหลดสูงเกินจำเป็น"],
        ],
        "B",
        "การจับคู่ `detail=\"low\"` สำหรับงานคัดแยก (classification/triage) กับ `detail=\"high\"` สำหรับงานสกัดตัวเลขและตารางละเอียดช่วยคุมงบ Vision API ได้ดีที่สุด",
        "ควรเลือก `detail=\"low\"` vs `detail=\"high\"` ต่างกันอย่างไร?",
        "ใช้ `detail=\"low\"` สำหรับคัดแยกภาพหยาบ ๆ (85 tokens คงที่) และใช้ `detail=\"high\"` สำหรับอ่านข้อความ/ตัวเลข/ตารางขนาดเล็ก",
      ),
      mc(
        "d081-q4",
        "Vision LLM สกัดใบเสร็จผ่าน Strict JSON Schema ครบทุกฟิลด์ แต่ตัวเลขในภาพจางทำให้โมเดลอ่าน `line_total` ของรายการหนึ่งผิดไป 50 บาท กลไกใดจะจับความผิดพลาดนี้ได้ก่อนบันทึกลงฐานข้อมูล?",
        [
          ["`ConfigDict(extra=\"forbid\")` เพียงอย่างเดียว", "`extra=\"forbid\"` กันได้แค่ key ส่วนเกิน แต่จับค่าตัวเลขที่ผิดสมการไม่ได้"],
          ["`@model_validator(mode=\"after\")` ที่ตรวจสมการ `sum(items) - discount + vat == grand_total` แล้วโยน `ValidationError`", "ถูก — Cross-field validator ใช้สมการบัญชีในใบเสร็จจับตัวเลขที่อ่านเพี้ยนแบบ fail-fast"],
          ["การตั้ง `temperature=1.2` เพื่อให้โมเดลเดาตัวเลขได้หลากหลายขึ้น", "temperature สูงยิ่งทำให้คำตอบสุ่มและอ่านเลขเพี้ยนมากขึ้น"],
          ["การเข้ารหัส Base64 ซ้ำสองรอบ", "ไม่เกี่ยวกับความถูกต้องของตัวเลขและทำให้ API อ่านภาพไม่ได้"],
        ],
        "B",
        "ใบเสร็จมีโครงสร้างสมการทางบัญชีในตัว การตรวจยอดรวมข้ามฟิลด์ใน `@model_validator` คือด่านนิรภัยสำคัญที่จับความผิดพลาดจากภาพเบลอหรือ OCR เพี้ยนได้ทันที",
        "ทำไมงานสกัดใบเสร็จด้วย Vision LLM จึงควรมี `@model_validator` เช็กผลรวมข้ามฟิลด์?",
        "เพราะ Strict JSON Schema เช็กได้แค่ชนิดข้อมูล แต่สมการ `sum(items) - discount + vat == grand_total` จะฟ้องทันทีเมื่อโมเดลอ่านตัวเลขผิดแม้แต่หลักเดียว",
      ),
    ],
  },

  takeaways: [
    "ใช้ {{multimodal}} Vision LLM (หรือ PDF-to-Image) เมื่อเอกสารเป็นสลิป ใบเสร็จ หรือตารางไทยซับซ้อนที่ plain text parser ทำสระลอยหรือคอลัมน์สลับ",
    "ทำ Image Preprocessing ก่อนส่งเสมอ: `ImageOps.exif_transpose()` → `.convert(\"RGB\")` → `thumbnail(max_side)` → JPEG Base64 Data URI เพื่อคุมทั้งความคมและต้นทุน image tokens",
    "เลือก `detail=\"low\"` สำหรับคัดแยกภาพหยาบ ๆ และ `detail=\"high\"` สำหรับสกัดตัวเลขและตารางละเอียด",
    "ผสาน Vision output เข้ากับ {{pydantic}} Strict {{schema}} + `@model_validator` ตรวจสมการยอดใบเสร็จ และแยกชั้น `vision_fn` เพื่อทำ {{mocking}} ใน `pytest`",
  ],

  reviewCards: [
    rc(
      "d081-rc-1",
      "4 ขั้นตอน Image Preprocessing ด้วย Pillow ก่อนส่งภาพใบเสร็จเข้า Vision LLM มีอะไรบ้าง?",
      "1) `ImageOps.exif_transpose()` แก้ภาพตะแคง, 2) `.convert(\"RGB\")` กัน PNG RGBA พัง, 3) `thumbnail((max_side, max_side))` คุมขนาด/tokens, 4) บีบ JPEG และแปลงเป็น Base64 Data URI",
    ),
    rc(
      "d081-rc-2",
      "ความแตกต่างด้านต้นทุนและการใช้งานระหว่าง `detail=\"low\"` กับ `detail=\"high\"` ใน Vision API คืออะไร?",
      "`detail=\"low\"` ใช้ 85 tokens คงที่ เหมาะกับงานคัดแยกประเภทภาพ ส่วน `detail=\"high\"` แบ่งเป็น 512×512 tiles (`85 + 170 × tiles`) เหมาะกับอ่านตัวเลข ใบเสร็จ และตารางละเอียด",
    ),
    rc(
      "d081-rc-3",
      "เหตุใดใบเสร็จจึงเหมาะกับการทำ Cross-Field Validation ใน Pydantic หลังรับผลจาก Vision LLM?",
      "เพราะมีสมการบัญชีในตัว (`sum(items) - discount + vat == grand_total`) หาก Vision model อ่านตัวเลขจาง ๆ ผิดหลัก `@model_validator` จะจับได้ทันที",
    ),
  ],

  sources: [
    { label: "OpenAI API Docs — Vision & Image Inputs", href: "https://platform.openai.com/docs/guides/images-vision" },
    { label: "Pillow Documentation — ImageOps.exif_transpose & Thumbnail", href: "https://pillow.readthedocs.io/en/stable/reference/ImageOps.html" },
    { label: "Anthropic Docs — Vision Prompting & Image Sizing", href: "https://docs.anthropic.com/en/docs/build-with-claude/vision" },
    { label: "Pydantic v2 Docs — Model Validators", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
  ],

  glossary: ["multimodal", "structured-output", "pydantic", "basemodel", "schema", "validation-error", "hallucination", "mocking"],
});
