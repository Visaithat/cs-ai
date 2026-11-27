import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D066 — Phase 3 / Block B17
 * Tokenizers & BPE Deep Dive (Why Thai uses 1.5x–3x more tokens)
 */
export const d066: Lesson = defineLesson({
  day: 66,
  titleTh: "เจาะลึก BPE Tokenizer: ทำไมภาษาไทยกิน token มากกว่าอังกฤษ 1.5–3 เท่า",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · วัด token ภาษาไทยจริงด้วย tiktoken และตั้งงบบริบทเป็น token",
  icon: "coins",
  visual: {
    id: "bpe-tokens",
    title: "Token Inflation — ประโยคความหมายเดียวกัน ภาษาไทยกิน token มากกว่ากี่เท่า",
    caption: "เลือกตัวอย่างประโยคเพื่อเปรียบเทียบจำนวน BPE tokens และต้นทุนบริบทระหว่างอังกฤษกับไทย",
    alt: "แผนภาพเปรียบเทียบการแบ่ง BPE token ของข้อความภาษาอังกฤษและภาษาไทย",
  },
  requiresApiKey: false,
  tools: ["tiktoken", "Python", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อความดิบถูกแปลงเป็นรหัสตัวเลข (Token IDs) ก่อนเข้าโมเดล",
      body: "{{llm}} ไม่เคยเห็นตัวอักษรโดยตรง แต่เห็นลำดับของตัวเลขที่ถูกตัดด้วย {{bpe-tokenizer}} — ถ้าภาษาไทยถูกซอยเป็นชิ้นเล็กเกินไป ต้นทุนทุกอย่างในระบบจะบานตั้งแต่ขั้นเตรียมข้อมูล",
      lessonNote: "วันนี้เราวัดจำนวน token จริงของข้อความภาษาไทยเทียบกับอังกฤษด้วย `tiktoken` และดูชิ้นส่วน UTF-8 byte ด้านใน",
    },
    {
      node: 2,
      heading: "Token Inflation กระทบ Context Window และความเร็วของ Transformer",
      body: "เมื่อภาษาไทยใช้ token มากกว่าอังกฤษ 1.5x–3x ประโยคความหมายเดียวกันจะชนขีดจำกัดบริบทของ {{transformer}} เร็วกว่า และเพิ่มภาระการคำนวณแบบ O(n²)",
      lessonNote: "เราจะเปรียบเทียบ `cl100k_base` กับ `o200k_base` เพื่อเห็นว่าการเลือกตระกูลโมเดลและ tokenizer ช่วยลดต้นทุนภาษาไทยได้จริง",
    },
    {
      node: 4,
      heading: "ตั้งงบ max_tokens และ RAG Chunk Size เป็นจำนวน Token เสมอ",
      body: "แอปที่ตั้ง `chunk_size=1000` ตัวอักษรหรือใช้สูตร `len(text) / 4` จะประเมินภาษาไทยพลาดจนคำตอบถูกตัดกลางประโยคหรือเกินลิมิตของโมเดล {{embedding}}",
      lessonNote: "แบบฝึกหัดวันนี้สร้างฟังก์ชัน `chunk_by_tokens()` และตัวคำนวณต้นทุน USD ที่ใช้ต่อได้จริงในระบบ {{rag}}",
    },
    {
      node: 5,
      heading: "ติดตามต้นทุนต่อ 1,000 คำขอจากจำนวน Token จริง",
      body: "ค่าบริการ LLM API คิดตาม input/output tokens แยกกัน การวัด token ก่อนส่งช่วยคุมงบและแจ้งเตือนเมื่อข้อความไทยยาวผิดปกติ",
      lessonNote: "บันทึกอัตราส่วน Thai-to-English token inflation ไว้เป็นฐานสำหรับประเมินงบประมาณใน Phase 5",
    },
  ],

  objectives: [
    "**อธิบาย** กลไก Byte-Pair Encoding ({{bpe-tokenizer}}) และเหตุผลทางเทคนิคที่ภาษาไทยเกิด Token Inflation 1.5x–3x (UTF-8 3 bytes/ตัวอักษร + สัดส่วนคลังคำ)",
    "**วัดและตรวจสอบ** จำนวน token และชิ้นส่วน byte จริงของข้อความไทย–อังกฤษด้วย `tiktoken` เปรียบเทียบระหว่าง `cl100k_base` กับ `o200k_base`",
    "**ออกแบบ** ฟังก์ชันแบ่งข้อความ ({{chunking}}) และคำนวณต้นทุนตามจำนวน **token จริง** แทนการกะจากจำนวนตัวอักษร",
  ],

  prerequisites: [
    "Python พื้นฐาน: string, bytes, list slicing",
    "รู้จักแนวคิด Context Window และต้นทุน O(n²) จาก Day 65",
    "เข้าใจความต่างของการตัดคำไทยด้วย {{pythainlp}} จาก Day 49",
    "รันได้ 100% บนเครื่องคุณ ไม่ต้องใช้ API key",
  ],

  setup: {
    intro: "ติดตั้ง `tiktoken` (ไลบรารี BPE tokenizer ความเร็วสูงที่เขียนแกนด้วย Rust) เพื่อวัดจำนวน token จริงบนข้อความภาษาไทย",
    commands: `uv init ai-day66 && cd ai-day66
uv add tiktoken
uv add --dev pytest ruff
uv run python -c "import tiktoken; enc = tiktoken.get_encoding('o200k_base'); print(len(enc.encode('สวัสดีครับ')))"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day66` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `tiktoken` และ `pytest` สำเร็จ"],
      ["verify", "รันโค้ดทดสอบ `tiktoken.get_encoding('o200k_base')` แล้วเห็นจำนวน token"],
    ],
    note: "ครั้งแรกที่เรียก `get_encoding(...)` ไลบรารี `tiktoken` จะดาวน์โหลดไฟล์ vocab ขนาดเล็กไม่กี่ MB มาเก็บแคชไว้บนเครื่อง หลังจากนั้นจะรันออฟไลน์ได้ 100%",
  },

  concepts: [
    {
      id: "bpe-mechanism",
      title: "1 · BPE Tokenizer ทำงานอย่างไร (Subword Merging และ Byte Fallback)",
      paragraphs: [
        "ก่อนส่งข้อความเข้า {{transformer}} โมเดลต้องหั่นสตริงเป็นชิ้นเล็ก ๆ เรียกว่า **tokens** แล้วแปลงเป็นรหัสจำนวนเต็ม หากหั่นทีละตัวอักษร sequence จะยาวเกินไปและคำนวณช้า แต่ถ้าใช้พจนานุกรมคำศัพท์ทั้งคำ ก็จะพังทันทีเมื่อเจอคำสะกดผิด รหัสสินค้าอย่าง `INV-2026-009` หรือคำไทยที่ไม่เว้นวรรค",
        "ทางสายกลางที่ {{llm}} ยุคใหม่เกือบทั้งหมดใช้คือ **Byte-Pair Encoding ({{bpe-tokenizer}})** ซึ่งเริ่มจากระดับ **UTF-8 bytes** (256 ค่าพื้นฐาน) แล้วไล่รวมคู่ชิ้นส่วนที่เจอบ่อยที่สุดในชุดข้อมูลเทรนซ้ำ ๆ ไปเรื่อย ๆ จนได้คลังคำ (vocabulary) ตามขนาดที่ตั้งไว้ เช่น 100,000 หรือ 200,000 tokens",
        "ข้อดีของ Byte-level BPE คือ **ไม่มีวันเกิดคำที่ไม่รู้จัก (`<UNK>`)** เพราะต่อให้เจออีโมจิหรือตัวอักษรหายาก ก็ยังมี **Byte Fallback** แตกย่อยลงเป็น UTF-8 bytes ทีละไบต์ได้เสมอ — แต่ตรงนี้เองที่เป็นต้นตอของปัญหาต้นทุนในภาษาไทย",
      ],
      analogy: "เหมือนชุดตัวต่อเลโก้: คำภาษาอังกฤษที่พบบ่อยถูกหล่อติดกันเป็นชิ้นใหญ่สำเร็จรูป (1 token) แต่คำภาษาไทยที่พบน้อยในชุดฝึกต้องมาต่อจากปุ่มเลโก้ชิ้นจิ๋วทีละ 2–3 ปุ่ม ทำให้ใช้จำนวนชิ้นมากกว่าหลายเท่า",
      bullets: [
        "**Subword**: คำยาวภาษาอังกฤษอย่าง `unbelievable` ถูกแบ่งเป็นชิ้นย่อยที่มีความหมาย เช่น `un` + `believ` + `able`",
        "**Byte Fallback**: ถ้าชิ้นส่วนภาษาไทยไม่อยู่ในคลัง merge rule จะถูกแตกเป็นระดับ byte (`0xE0`, `0xB8`, ...) ซึ่ง 1 ตัวอักษรไทยอาจกิน 1–3 tokens",
        "**คนละงานกับ PyThaiNLP**: {{pythainlp}} ตัดคำเพื่อให้มนุษย์หรือ BM25 ค้นหาได้ตรงความหมาย ส่วน BPE ตัดเพื่อบีบอัดข้อมูลสถิติเข้าโครงข่ายประสาท",
      ],
      whyTitle: "Why this matters — รู้จัก Tokenizer ก่อนเลือกโมเดลภาษาไทย",
      whyParagraphs: [
        "สองโมเดลที่คิดราคาต่อ 1 ล้าน tokens เท่ากัน อาจมีค่าใช้จ่ายจริงบนงานภาษาไทยต่างกันเกือบ 2 เท่า ถ้าโมเดลหนึ่งมี vocab ภาษาไทยแน่นกว่าและแตกคำน้อยกว่า",
        "AI Engineer ที่ทำงานในไทยจึงไม่ดูแค่ตารางราคา `$/1M tokens` แต่ต้องวัด **ต้นทุนต่อ 1,000 ข้อความภาษาไทยจริง** เสมอ",
      ],
    },
    {
      id: "thai-token-inflation",
      title: "2 · ทำไมภาษาไทยจึงเกิด Token Inflation 1.5x–3x",
      paragraphs: [
        "เมื่อแปลประโยคเดียวกันระหว่างภาษาอังกฤษกับภาษาไทย ข้อความภาษาไทยมักใช้จำนวน token มากกว่า **1.5 ถึง 3 เท่า** ด้วย 2 สาเหตุหลักที่ซ้อนทับกัน: (1) สัดส่วนข้อมูลภาษาไทยในชุดเทรน tokenizer มีน้อยกว่าภาษาอังกฤษมาก ทำให้มีกฎการรวมคำ (merge rules) น้อยกว่า และ (2) การเข้ารหัส **UTF-8** ใช้อักษรละ **1 byte** สำหรับอังกฤษ (`a` = `0x61`) แต่อักษรไทยแต่ละตัว (รวมสระและวรรณยุกต์) ใช้ถึง **3 bytes** (เช่น `ก` = `b'\\xe0\\xb8\\x81'`)",
        "ตัวอย่างที่เห็นได้ชัดคือการเปรียบเทียบ `cl100k_base` (vocab ~100k ของยุค GPT-4 รุ่นแรก) กับ `o200k_base` (vocab ~200k ของยุค GPT-4o ขึ้นไป) — รุ่นหลังเพิ่มคำย่อยภาษาที่ไม่ใช่อังกฤษเข้ามามากขึ้นจนลดจำนวน token ภาษาไทยลงเกือบครึ่ง แต่เมื่อเทียบกับประโยคภาษาอังกฤษความหมายเดียวกัน ภาษาไทยก็ยังใช้ token มากกว่าอยู่ดี",
      ],
      analogy: "เหมือนส่งพัสดุภาษาอังกฤษ 1 กล่องใหญ่เทียบกับภาษาไทยที่ถูกบังคับให้ห่อแยกเป็น 2–3 กล่องเล็กในความหมายเดียวกัน — ทั้งเปลืองพื้นที่ในรถ (context window) และเสียค่าส่งมากกว่า (API cost)",
      code: {
        language: "python",
        filename: "compare_thai_en.py",
        code: `import tiktoken

en = "Please check invoice INV-2026-009 for duplicate tax charges."
th = "กรุณาตรวจสอบใบแจ้งหนี้ INV-2026-009 เรื่องการเรียกเก็บภาษีซ้ำซ้อน"

for name in ("cl100k_base", "o200k_base"):
    enc = tiktoken.get_encoding(name)
    en_n = len(enc.encode(en))
    th_n = len(enc.encode(th))
    print(f"{name:12s} | EN={en_n:2d} tokens | TH={th_n:2d} tokens | Ratio={th_n / en_n:.2f}x")`,
        caption: "ประโยคความหมายเดียวกัน: `cl100k_base` กิน token ไทยมากกว่าอังกฤษกว่า 3 เท่า ขณะที่ `o200k_base` ลดลงอย่างชัดเจนแต่ยังสูงกว่าอังกฤษ",
      },
      whyTitle: "Why this matters — ผลกระทบลูกโซ่ในงานจริงของทีมไทย",
      whyParagraphs: [
        "Token Inflation ไม่ได้ทำให้แพงขึ้นอย่างเดียว แต่ทำให้ **ความเร็วในการตอบ (latency) ช้าลง** ด้วย เพราะ LLM สร้างคำตอบทีละ 1 token — หากคำตอบภาษาไทยยาวกว่าอังกฤษ 2 เท่า เวลาสตรีมคำตอบจนจบก็ยาวขึ้นราว 2 เท่าเช่นกัน",
        "นอกจากนี้ในการทำ Code-Switching ไทยปนอังกฤษและ JSON เช่น key ชื่อภาษาอังกฤษ (`\"category\"`, `\"summary_th\"`) จะกิน token น้อยกว่าการใช้ key ภาษาไทยอย่างเห็นได้ชัด — เราจึงควรตั้งชื่อ JSON key เป็นภาษาอังกฤษเสมอ",
      ],
    },
    {
      id: "token-aware-budgeting",
      title: "3 · ตั้งงบ Context, Cost และ Chunk Size เป็น Token ไม่ใช่ตัวอักษร",
      paragraphs: [
        "บทความต่างประเทศมักแนะนำกฎจำง่ายว่า *\"1 token ≈ 4 ตัวอักษร\"* — กฎนี้ **พังทันทีกับภาษาไทย** เพราะใน `cl100k_base` ข้อความไทย 100 ตัวอักษรอาจกลายเป็น 90–140 tokens (เกือบ 1:1 หรือมากกว่า 1 token ต่อตัวอักษรด้วยซ้ำ!)",
        "หากคุณตั้งขนาด {{chunking}} ของระบบ {{rag}} ด้วยจำนวนตัวอักษร เช่น `chunk_size=1500 chars` ชิ้นเอกสารไทยอาจพุ่งเกินขีดจำกัด `512` tokens ของโมเดล {{embedding}} ทำให้ข้อความส่วนท้ายถูกตัดทิ้งเงียบ ๆ โดยไม่รู้ตัว และหากตั้ง `max_tokens` ต่ำเกินไป โมเดลจะตอบภาษาไทยไม่จบประโยคและคืน JSON ไม่ครบปิดปีกกา",
      ],
      analogy: "เหมือนคำนวณน้ำหนักกระเป๋าขึ้นเครื่องด้วยการนับ 'จำนวนเสื้อ' แทนการชั่ง 'กิโลกรัม' — เสื้อยืดกับเสื้อกันหนาวจำนวนเท่ากันแต่น้ำหนักต่างกันลิบลับ",
      bullets: [
        "**วัดก่อนส่ง**: เขียนฟังก์ชัน `count_tokens(text, encoding)` ไว้ใน utility กลางของโปรเจกต์",
        "**Chunk ด้วย Token**: ตัดเอกสารตามจำนวน token พร้อม overlap (เช่น 300 tokens, overlap 40 tokens) แทน `len(text)`",
        "**เผื่อ Output Budget**: ตั้ง `max_tokens` สำหรับคำตอบภาษาไทยให้มากกว่าอังกฤษ 1.5x–2x เพื่อกัน JSON ขาดกลางคัน",
      ],
      whyTitle: "Why this matters — เชื่อมตรงไปสู่ Phase 4 (RAG) และ Phase 5 (Cost Control)",
      whyParagraphs: [
        "ใน Phase 4 เราจะสร้าง Token-Aware Chunker สำหรับเอกสารองค์กรภาษาไทย การคุมขนาด chunk เป็น token ช่วยให้ทุกชิ้นพอดีกับบริบทของทั้ง {{embedding}} model และ {{llm}} โดยไม่เสียเนื้อหาสำคัญ",
        "ส่วนใน Phase 5 เมื่อต้องคำนวณงบประมาณต่อผู้ใช้ต่อเดือน ตัวเลข `input_tokens` และ `output_tokens` จริงบนชุดคำถามภาษาไทยคือข้อมูลที่ผู้บริหารใช้ตัดสินใจเลือกโมเดล",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — `.length` ใน JS/Python ไม่เท่ากับ Bytes และไม่เท่ากับ Tokens",
      body: [
        "นักพัฒนาเว็บมักเคยเจอปัญหา UTF-16 `.length` ใน JS กับ UTF-8 byte length ใน SQL/HTTP Header มาแล้ว — ในโลก AI มีอีกหน่วยวัดเพิ่มขึ้นมาคือ **Token Count** ซึ่งขึ้นกับตาราง vocab ของแต่ละโมเดล",
        "อย่าใช้ `text.slice(0, 1000)` เพื่อจำกัดขนาด prompt แต่ให้ encode เป็น token IDs, slice ตาม `max_tokens`, แล้วค่อย decode กลับ (หรือใช้ API count tokens ของผู้ให้บริการ)",
      ],
      table: [
        ["`len(text)` (Python)", "`text.length` (จำนวนตัวอักษร/code points)"],
        ["`len(text.encode('utf-8'))`", "`Buffer.byteLength(text, 'utf8')` (ไทย = 3 bytes/ตัว)"],
        ["`len(enc.encode(text))`", "หน่วยคิดเงินและขีดจำกัด Context Window ของ LLM"],
        ["Token-aware truncation", "Payload size guard ที่ตัดตรงขอบ token ไม่ทำ UTF-8 พัง"],
      ],
    },
    student: {
      title: "First-Year Note — UTF-8 3 Bytes กับความต่างระหว่าง PyThaiNLP และ BPE",
      body: [
        "ลองรัน `len('ก'.encode('utf-8'))` ใน Python จะได้ `3` ขณะที่ `len('a'.encode('utf-8'))` ได้ `1` — เพราะอักษรไทยอยู่ในช่วง Unicode ที่ UTF-8 ต้องใช้ 3 bytes ต่อ 1 ตัวอักษร เมื่อ BPE tokenizer ไม่รู้จักคำไทยนั้นจึงต้องแตกออกเป็นชิ้น byte ย่อย ๆ",
        "จำแยกให้ชัด: `PyThaiNLP` (Day 49) ใช้ตัดคำไทยสำหรับงานค้นหาคีย์เวิร์ด (BM25/TF-IDF) ส่วน `tiktoken` (BPE) คือเครื่องมือวัดจำนวน token แบบที่ LLM ใช้จริง",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ทีมต้องการประเมินต้นทุนและวางแผนตัดข้อความภาษาไทยก่อนส่งเข้า LLM — เราจะใช้ `tiktoken` วัดอัตราส่วน Token Inflation, แกะดูชิ้นส่วน byte ด้านใน, และสร้างตัวตัดข้อความตามงบ token",
    steps: [
      {
        title: "1 · เปรียบเทียบจำนวน Token ไทย vs อังกฤษ บน 2 Tokenizers",
        explain: "เทียบประโยคแจ้งปัญหาลูกค้าความหมายเดียวกันระหว่าง `cl100k_base` กับ `o200k_base` พร้อมดูอัตราส่วน `chars / token`",
        code: {
          language: "python",
          filename: "worked_day66.py",
          code: `import tiktoken

pairs = [
    (
        "Check order #INV-2026-009 status and refund policy.",
        "ตรวจสอบสถานะคำสั่งซื้อ #INV-2026-009 และนโยบายคืนเงิน",
    ),
    (
        "The mobile app freezes during QR payment.",
        "แอปมือถือค้างระหว่างการชำระเงินด้วยคิวอาร์โค้ด",
    ),
]

for enc_name in ("cl100k_base", "o200k_base"):
    enc = tiktoken.get_encoding(enc_name)
    print(f"=== {enc_name} ===")
    for en, th in pairs:
        en_toks = len(enc.encode(en))
        th_toks = len(enc.encode(th))
        print(
            f"EN: {en_toks:2d} toks ({len(en)/en_toks:.1f} ch/tok) | "
            f"TH: {th_toks:2d} toks ({len(th)/th_toks:.1f} ch/tok) | "
            f"Inflation: {th_toks/en_toks:.2f}x"
        )`,
        },
        output: `=== cl100k_base ===
EN: 12 toks (4.3 ch/tok) | TH: 38 toks (1.4 ch/tok) | Inflation: 3.17x
EN:  9 toks (4.6 ch/tok) | TH: 34 toks (1.4 ch/tok) | Inflation: 3.78x
=== o200k_base ===
EN: 12 toks (4.3 ch/tok) | TH: 20 toks (2.7 ch/tok) | Inflation: 1.67x
EN:  9 toks (4.6 ch/tok) | TH: 15 toks (3.1 ch/tok) | Inflation: 1.67x`,
      },
      {
        title: "2 · แกะดูชิ้นส่วน Subword และ UTF-8 Byte Fallback ด้านใน",
        explain: "ใช้ `decode_single_token_bytes` เพื่อดูว่าแต่ละ token ID เก็บข้อความไทยเต็มคำหรือถูกฉีกเป็น byte ย่อย (ซึ่งจะแสดงผลเป็น escape bytes เมื่อไม่ใช่ UTF-8 เต็มตัว)",
        code: {
          language: "python",
          filename: "worked_day66.py",
          code: `sample = "ใบกำกับภาษีซ้ำซ้อน"
for enc_name in ("cl100k_base", "o200k_base"):
    enc = tiktoken.get_encoding(enc_name)
    ids = enc.encode(sample)
    pieces = [enc.decode_single_token_bytes(tid) for tid in ids]
    print(f"{enc_name:12s} ({len(ids):2d} tokens): {pieces[:6]} ...")`,
        },
        output: `cl100k_base  (18 tokens): [b'\\xe0\\xb9', b'\\x83', b'\\xe0\\xb8', b'\\x9a', b'\\xe0\\xb8', b'\\x81'] ...
o200k_base   ( 6 tokens): [b'\\xe0\\xb9\\x83\\xe0\\xb8\\x9a', b'\\xe0\\xb8\\x81\\xe0\\xb8\\xb3', b'\\xe0\\xb8\\x81\\xe0\\xb8\\xb1\\xe0\\xb8\\x9a', ...] ...`,
      },
      {
        title: "3 · ตัดข้อความตามงบ Token อย่างปลอดภัย (Token-Aware Truncation)",
        explain: "เมื่อ slice ด้วย token IDs แล้ว decode กลับด้วย `enc.decode(...)` จะได้ข้อความที่ไม่เกิน `max_tokens` แน่นอน (และรองรับกรณีปลายทางติด byte split ด้วย `decode_bytes` + `errors='ignore'`)",
        code: {
          language: "python",
          filename: "worked_day66.py",
          code: `def truncate_to_tokens(text: str, max_tokens: int, encoding_name: str = "o200k_base") -> str:
    enc = tiktoken.get_encoding(encoding_name)
    token_ids = enc.encode(text)
    if len(token_ids) <= max_tokens:
        return text
    raw_bytes = enc.decode_bytes(token_ids[:max_tokens])
    return raw_bytes.decode("utf-8", errors="ignore")


long_th = "ลูกค้าแจ้งปัญหาใบกำกับภาษีซ้ำซ้อนสำหรับคำสั่งซื้อ INV-2026-009 และต้องการขอใบลดหนี้ภายในวันนี้"
short_th = truncate_to_tokens(long_th, max_tokens=10)
enc = tiktoken.get_encoding("o200k_base")
print("Original tokens:", len(enc.encode(long_th)))
print("Truncated tokens:", len(enc.encode(short_th)), "->", short_th)`,
        },
        output: `Original tokens: 29
Truncated tokens: 10 -> ลูกค้าแจ้งปัญหาใบกำกับภาษีซ้ำซ้อนสำหรับคำสั่งซื้อ`,
      },
    ],
    gotcha: "สังเกตในขั้นที่ 2: ใน `cl100k_base` อักษรไทย 1 ตัวสามารถถูกแยกเป็นหลาย token ที่ไม่ใช่ UTF-8 สมบูรณ์ในตัวเอง หากคุณตัด slice token IDs ตรงกลางอักษรแล้วเรียก `enc.decode(...)` อาจได้อักขระแทนที่ `U+FFFD` (replacement char) — การใช้ `enc.decode_bytes(...).decode('utf-8', errors='ignore')` ช่วยป้องกันอักขระเสียที่ปลายสตริงได้",
  },

  practice: {
    intro: "สร้างชุดเครื่องมือวัดและจัดการ token สำหรับระบบ AI ภาษาไทยใน `exercise_day66.py` เพื่อใช้เปรียบเทียบ Token Inflation, แบ่ง chunk ตามจำนวน token, และประมาณการค่า API",
    requirements: [
      "`count_tokens(text: str, encoding_name: str = \"o200k_base\") -> int` นับจำนวน token จริงด้วย `tiktoken`",
      "`compare_thai_english(th_text: str, en_text: str, encoding_name: str = \"o200k_base\") -> dict[str, float | int]` คืน dict ที่มี keys `th_tokens`, `en_tokens`, `inflation_ratio` (ปัดเศษ 2 ตำแหน่งด้วย `round(..., 2)`) และ raise `ValueError` หาก `en_text` มี 0 tokens",
      "`chunk_by_tokens(text: str, max_tokens: int, overlap: int = 0, encoding_name: str = \"o200k_base\") -> list[str]` แบ่งข้อความเป็นชิ้นที่แต่ละชิ้นยาวไม่เกิน `max_tokens` tokens โดยเลื่อนหน้าต่างทีละ `max_tokens - overlap` (raise `ValueError` ถ้า `max_tokens <= 0` หรือ `overlap < 0` หรือ `overlap >= max_tokens`)",
      "`estimate_cost_usd(input_tokens: int, output_tokens: int, input_per_1m: float, output_per_1m: float) -> float` คำนวณค่าใช้จ่ายรวมเป็น USD (raise `ValueError` ถ้าค่าใดติดลบ)",
    ],
    starter: {
      language: "python",
      filename: "exercise_day66.py",
      code: `import tiktoken


def count_tokens(text: str, encoding_name: str = "o200k_base") -> int:
    # TODO: ใช้ tiktoken.get_encoding(encoding_name) นับจำนวน token
    raise NotImplementedError


def compare_thai_english(
    th_text: str,
    en_text: str,
    encoding_name: str = "o200k_base",
) -> dict[str, float | int]:
    # TODO: คืน {"th_tokens": ..., "en_tokens": ..., "inflation_ratio": ...}
    raise NotImplementedError


def chunk_by_tokens(
    text: str,
    max_tokens: int,
    overlap: int = 0,
    encoding_name: str = "o200k_base",
) -> list[str]:
    # TODO: แบ่ง token IDs ด้วย sliding window (step = max_tokens - overlap) แล้ว decode กลับเป็น UTF-8
    raise NotImplementedError


def estimate_cost_usd(
    input_tokens: int,
    output_tokens: int,
    input_per_1m: float,
    output_per_1m: float,
) -> float:
    # TODO: คำนวณต้นทุนรวม (USD)
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day66.py",
      code: `import pytest
from exercise_day66 import (
    chunk_by_tokens,
    compare_thai_english,
    count_tokens,
    estimate_cost_usd,
)


def test_thai_inflation_higher_in_cl100k_than_o200k():
    en = "Please issue a corrected tax invoice for order 2026."
    th = "กรุณาออกใบกำกับภาษีฉบับแก้ไขสำหรับคำสั่งซื้อปี 2026"
    rep_old = compare_thai_english(th, en, encoding_name="cl100k_base")
    rep_new = compare_thai_english(th, en, encoding_name="o200k_base")
    assert rep_old["th_tokens"] > rep_new["th_tokens"]
    assert rep_old["inflation_ratio"] > rep_new["inflation_ratio"]
    assert rep_new["inflation_ratio"] >= 1.0


def test_compare_rejects_empty_english():
    with pytest.raises(ValueError):
        compare_thai_english("สวัสดี", "")


def test_chunk_by_tokens_respects_budget_and_overlap():
    text = "นโยบายการคืนสินค้าและออกใบกำกับภาษี " * 12
    chunks = chunk_by_tokens(text, max_tokens=20, overlap=5, encoding_name="o200k_base")
    assert len(chunks) >= 3
    for chunk in chunks:
        assert count_tokens(chunk, "o200k_base") <= 20
        assert "\\ufffd" not in chunk


def test_chunk_validates_params():
    with pytest.raises(ValueError):
        chunk_by_tokens("ทดสอบ", max_tokens=10, overlap=10)
    with pytest.raises(ValueError):
        chunk_by_tokens("ทดสอบ", max_tokens=0, overlap=0)


def test_estimate_cost_usd():
    cost = estimate_cost_usd(
        input_tokens=500_000,
        output_tokens=100_000,
        input_per_1m=0.40,
        output_per_1m=1.60,
    )
    assert cost == pytest.approx(0.36)
    with pytest.raises(ValueError):
        estimate_cost_usd(-1, 100, 0.4, 1.6)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 5 test cases",
      "สังเกตว่า `cl100k_base` ให้จำนวน `th_tokens` สูงกว่า `o200k_base` อย่างชัดเจนบนประโยคไทยเดียวกัน",
      "ตรวจว่าทุก chunk ที่ได้จาก `chunk_by_tokens` มีจำนวน token `<= max_tokens` และไม่มีอักขระเสีย (`U+FFFD`)",
      "ลองคำนวณต้นทุนสำหรับข้อความไทย 1,000 คำขอเทียบกับอังกฤษเพื่อเห็นส่วนต่างค่า API จริง",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day66.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `chunk_by_tokens` ให้ encode ข้อความทั้งก้อนเป็น `token_ids` ก่อน แล้ววนลูป `for start in range(0, len(token_ids), step):` โดย `step = max_tokens - overlap` และหยุดเมื่อครอบคลุมปลายสตริงแล้ว",
      },
      {
        body: "เพื่อป้องกันอักขระเสีย `U+FFFD` เวลาตัดโดนรอยต่อ byte ให้แปลง `enc.decode_bytes(window).decode('utf-8', errors='ignore')` และอย่าลืมคืน `[]` ถ้า `text` ว่างเปล่า (`not token_ids`)",
      },
      {
        body: "โครงของ `chunk_by_tokens` เกือบสมบูรณ์แล้ว — เติม `compare_thai_english` และ `estimate_cost_usd` ให้ครบแล้วรัน `pytest`",
        code: {
          language: "python",
          filename: "hint_day66.py",
          code: `import tiktoken


def count_tokens(text: str, encoding_name: str = "o200k_base") -> int:
    return len(tiktoken.get_encoding(encoding_name).encode(text))


def chunk_by_tokens(
    text: str,
    max_tokens: int,
    overlap: int = 0,
    encoding_name: str = "o200k_base",
) -> list[str]:
    if max_tokens <= 0 or overlap < 0 or overlap >= max_tokens:
        raise ValueError("Invalid max_tokens or overlap")
    enc = tiktoken.get_encoding(encoding_name)
    token_ids = enc.encode(text)
    if not token_ids:
        return []
    step = max_tokens - overlap
    chunks: list[str] = []
    for start in range(0, len(token_ids), step):
        window = token_ids[start : start + max_tokens]
        decoded = enc.decode_bytes(window).decode("utf-8", errors="ignore")
        if decoded:
            chunks.append(decoded)
        if start + max_tokens >= len(token_ids):
            break
    return chunks`,
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
      title: "ใช้สูตร 1 token ≈ 4 ตัวอักษร กับข้อความภาษาไทย",
      symptom: "กะขนาดเอกสารไทย 4,000 ตัวอักษรว่าเป็น 1,000 tokens แต่พอส่งจริงกลายเป็น 2,500–4,500 tokens จนชน limit หรือค่า API บานเกินงบ",
      fix: "วัดด้วย tokenizer จริง (`tiktoken` หรือ token-counting API ของผู้ให้บริการ) บนตัวอย่างข้อมูลภาษาไทยของระบบคุณเสมอ",
    },
    {
      title: "จำสับสนระหว่างคำตัดของ PyThaiNLP กับ Token ของ LLM",
      symptom: "นับคำไทยด้วย `pythainlp.word_tokenize` ได้ 10 คำ แล้วคิดว่า LLM จะคิดเงินแค่ 10 tokens",
      fix: "แยกให้ชัด: {{pythainlp}} ใช้สำหรับ Lexical Search (BM25/TF-IDF) ส่วนการคิดเงินและ context limit ของ LLM ต้องนับด้วย {{bpe-tokenizer}} ของโมเดลนั้น",
    },
    {
      title: "ตั้งชื่อ JSON Keys เป็นภาษาไทยใน Structured Output",
      symptom: "ออกแบบ schema ให้โมเดลตอบ `{\"หมวดหมู่\": ..., \"ความมั่นใจ\": ...}` ทำให้เปลือง output tokens เพิ่มขึ้นทุก request โดยไม่จำเป็น",
      fix: "ใช้ชื่อ field/key เป็นภาษาอังกฤษสั้นกระชับ (เช่น `category`, `confidence`, `summary_th`) แล้วให้เฉพาะค่าเนื้อหาเป็นภาษาไทย",
    },
    {
      title: "ตัดสตริงดิบด้วย bytes หรือ slice token โดยไม่จัดการ UTF-8 ที่ขาดครึ่ง",
      symptom: "ปลายข้อความหลังตัดมีอักขระเสีย (`U+FFFD`) โผล่มา หรือเกิด `UnicodeDecodeError` เมื่อส่งต่อไปยังส่วนอื่นของระบบ",
      fix: "ใช้ `enc.decode_bytes(token_ids[:limit]).decode('utf-8', errors='ignore')` หรือตัดที่ขอบประโยค/ย่อหน้าหลังเช็กจำนวน token",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d066-q1",
        "ข้อใดอธิบายสาเหตุหลักที่ข้อความภาษาไทยมักกิน token มากกว่าภาษาอังกฤษ 1.5x–3x ในหลาย BPE Tokenizer ได้ถูกต้องที่สุด?",
        [
          ["ภาษาไทยมีวรรณยุกต์ที่ LLM ไม่รองรับจึงต้องส่งซ้ำ 2 รอบ", "ไม่จริง — LLM รองรับ Unicode/UTF-8 เต็มรูปแบบ ไม่ได้ส่งซ้ำ 2 รอบ"],
          ["อักษรไทย 1 ตัวใช้ 3 bytes ใน UTF-8 และมีสัดส่วนข้อมูลในชุดเทรน tokenizer น้อยกว่าอังกฤษ ทำให้เกิด merge น้อยและตกไปใช้ชิ้นส่วน byte ย่อยบ่อยกว่า", "ถูก — สองปัจจัยนี้รวมกันทำให้ข้อความไทยความหมายเดียวกันแตกเป็นจำนวน token มากกว่าอังกฤษอย่างชัดเจน"],
          ["ภาษาไทยไม่มีเครื่องหมายจุดจบประโยค (period) จึงทำให้ tokenizer นับผิด", "การไม่มีจุดจบประโยคไม่เกี่ยวกับอัตราส่วน byte และความถี่ subword ของ BPE"],
          ["`tiktoken` บวกค่าธรรมเนียมพิเศษให้ภาษาในเอเชีย", "ไม่จริง — BPE เป็นอัลกอริทึมเชิงสถิติล้วน ๆ ขึ้นกับความถี่ในข้อมูลฝึกและ UTF-8 encoding"],
        ],
        "B",
        "Token Inflation ในภาษาไทยเกิดจาก UTF-8 (3 bytes ต่ออักษรไทย เทียบกับ 1 byte ใน ASCII) รวมกับสัดส่วนภาษาไทยที่น้อยกว่าในชุดสร้าง merge rules ของ BPE",
        "ทำไมภาษาไทยจึงใช้จำนวน BPE tokens มากกว่าอังกฤษ 1.5x–3x?",
        "เพราะอักษรไทยใช้ 3 bytes/ตัวใน UTF-8 และมี merge rules ใน vocab น้อยกว่าอังกฤษ จึงมักถูกแตกเป็นชิ้นย่อยหรือ byte fallback มากกว่า",
      ),
      mc(
        "d066-q2",
        "ระบบ RAG ภาษาไทยของคุณใช้โมเดล Embedding ที่จำกัดความยาวสูงสุด `512 tokens` หากตั้งขนาด chunk เป็น `1,500 ตัวอักษร` โดยกะเอาจากสูตร `1 token ≈ 4 chars` จะเสี่ยงเกิดปัญหาใด?",
        [
          ["chunk จะสั้นเกินไปจนเหลือแค่ 1 ประโยค", "ตรงกันข้าม — ภาษาไทย 1,500 ตัวอักษรอาจยาวเกิน 512 tokens ได้ง่ายมาก"],
          ["chunk ภาษาไทยอาจยาวเกิน 512 tokens ทำให้เนื้อหาส่วนท้ายถูกตัดทิ้งเงียบ ๆ ก่อนสร้าง embedding", "ถูก — ข้อมูลสำคัญท้าย chunk จะหายไปจาก vector index ทำให้ค้นหาไม่เจอ (recall ตก)"],
          ["PyTorch จะขยาย context limit ของโมเดล embedding ให้เองอัตโนมัติ", "ไม่ได้ — โมเดล embedding จะ truncate ส่วนเกินหรือโยน error"],
          ["ไม่เกิดปัญหาอะไรเพราะ embedding ไม่ใช้ tokenizer", "โมเดล Dense Embedding ใช้ tokenizer แปลงข้อความเป็น token IDs เช่นเดียวกับ LLM"],
        ],
        "B",
        "ภาษาไทย 1,500 ตัวอักษรอาจกลายเป็น 600–1,500+ tokens ขึ้นกับ tokenizer ซึ่งเกินลิมิต 512 tokens และทำให้ท้าย chunk ถูกตัดทิ้ง — จึงต้องตั้งขนาด chunk เป็นจำนวน token เสมอ",
        "ทำไมห้ามตั้ง RAG chunk size ของเอกสารไทยเป็นจำนวนตัวอักษรโดยใช้สูตร `1 token ≈ 4 chars`?",
        "เพราะภาษาไทยมี token inflation สูงกว่าอังกฤษมาก chunk อาจทะลุลิมิต token ของ embedding model จนเนื้อหาท้าย chunk ถูกตัดทิ้งเงียบ ๆ",
      ),
      mc(
        "d066-q3",
        "เมื่อเทียบ `cl100k_base` กับ `o200k_base` บนข้อความภาษาไทยประโยคเดียวกัน ข้อใดถูกต้อง?",
        [
          ["ทั้งสองตัวให้จำนวน token เท่ากันเป๊ะเพราะเป็นของค่ายเดียวกัน", "ไม่เท่า — `o200k_base` มี vocab ใหญ่ขึ้น 2 เท่าและเพิ่ม subword ภาษาไทย/non-English มากกว่ามาก"],
          ["`o200k_base` มักใช้จำนวน token น้อยกว่า `cl100k_base` อย่างชัดเจนบนภาษาไทย เพราะคลังคำใหญ่ขึ้นและรวมคำไทยเป็นชิ้นใหญ่ขึ้นได้มากกว่า", "ถูก — ลดจำนวน token บนภาษาไทยได้เกือบครึ่งในหลายประโยค ทำให้เร็วขึ้นและประหยัดบริบทขึ้น"],
          ["`cl100k_base` ตัดภาษาไทยได้ดีกว่าเสมอเพราะ vocab เล็กกว่าจึงโฟกัสภาษาไทยมากกว่า", "กลับกัน — vocab เล็กกว่ายิ่งมีพื้นที่ให้ภาษาที่ไม่ใช่อังกฤษน้อยกว่า"],
          ["`o200k_base` ใช้ `PyThaiNLP` เป็นตัวตัดคำภายใน", "ไม่ใช่ — `o200k_base` ยังเป็น Byte-level BPE ไม่ได้ใช้พจนานุกรม PyThaiNLP"],
        ],
        "B",
        "คลังคำขนาด 200k ของ `o200k_base` เก็บ subword ภาษาไทยได้มากขึ้น ลดการตกไปเป็น UTF-8 byte fallback ลงมากเมื่อเทียบกับ `cl100k_base`",
        "`o200k_base` ต่างจาก `cl100k_base` อย่างไรเมื่อเจอกับข้อความภาษาไทย?",
        "`o200k_base` มี vocab ใหญ่กว่า (200k) และมี subword ภาษาไทยมากกว่า ทำให้ลดจำนวน token ไทยลงเกือบครึ่งเมื่อเทียบกับ `cl100k_base`",
      ),
      mc(
        "d066-q4",
        "ข้อใดคือความแตกต่างที่ถูกต้องระหว่าง `PyThaiNLP` (`newmm`) กับ `BPE Tokenizer` (`tiktoken`)?",
        [
          ["เหมือนกันทุกอย่าง แค่เขียนคนละภาษาโปรแกรม", "คนละวัตถุประสงค์และคนละอัลกอริทึมโดยสิ้นเชิง"],
          ["`PyThaiNLP` ตัดคำตามพจนานุกรมภาษาไทยเพื่องานค้นหาคำ (BM25/TF-IDF) ส่วน `BPE` ตัดเป็น subword/bytes ตามสถิติเพื่อป้อนเข้า Transformer และคิดค่า API", "ถูก — AI Engineer ไทยต้องใช้ทั้งคู่ให้ถูกงาน: PyThaiNLP ใน lexical search และ BPE ในการวัดบริบท/ต้นทุน LLM"],
          ["`PyThaiNLP` ใช้คิดเงิน OpenAI API ส่วน `tiktoken` ใช้สร้าง TF-IDF", "สลับกัน — OpenAI API คิดเงินตาม BPE tokens (`tiktoken`)"],
          ["เมื่อมี `BPE Tokenizer` แล้วไม่จำเป็นต้องใช้ `PyThaiNLP` ในระบบ Hybrid RAG อีกต่อไป", "ไม่จริง — ในระบบ BM25 ภาษาไทยยังต้องใช้ `PyThaiNLP` ตัดคำให้ตรงความหมายเพื่อจับ keyword ให้แม่น (Phase 4)"],
        ],
        "B",
        "สองเครื่องมือนี้แก้คนละโจทย์: `PyThaiNLP` ทำให้คำไทยแยกขอบเขตถูกสำหรับการค้นหาเชิงคำ (BM25) ขณะที่ `BPE` คือวิธีที่ LLM แปลงข้อความเป็นอินพุตและคิดต้นทุน",
        "แยกบทบาทของ `PyThaiNLP` กับ `BPE Tokenizer` ในระบบ AI ภาษาไทยอย่างไร?",
        "`PyThaiNLP` ตัดคำเพื่อ lexical search (BM25/TF-IDF) ส่วน `BPE Tokenizer` ตัด subword/bytes สำหรับป้อนเข้า LLM, คุม context window และคำนวณต้นทุน",
      ),
    ],
  },

  takeaways: [
    "Byte-level {{bpe-tokenizer}} ไม่เคยเจอคำไม่รู้จักเพราะมี UTF-8 byte fallback แต่ทำให้อักษรไทย (3 bytes/ตัว) เกิด Token Inflation 1.5x–3x เมื่อเทียบกับอังกฤษ",
    "อย่าใช้กฎ `1 token ≈ 4 chars` กับภาษาไทย — ให้วัดด้วย tokenizer จริง (`tiktoken` หรือ API ของโมเดลที่ใช้) เสมอ",
    "การตั้ง {{chunking}} และ `max_tokens` เป็นจำนวน **token** ช่วยกันปัญหาท้าย chunk โดนตัดใน {{rag}} และกันคำตอบ JSON ภาษาไทยขาดกลางประโยค",
    "ใช้ชื่อ JSON key เป็นภาษาอังกฤษและเปรียบเทียบต้นทุนต่อ 1,000 ข้อความไทยจริง (ไม่ใช่แค่ราคาต่อ 1M tokens) ก่อนเลือกโมเดลขึ้น production",
  ],

  reviewCards: [
    rc(
      "d066-rc-1",
      "สองสาเหตุหลักที่ภาษาไทยเกิด Token Inflation 1.5x–3x ใน BPE Tokenizer คืออะไร?",
      "1) อักษรไทย 1 ตัวใช้ 3 bytes ใน UTF-8 (อังกฤษ 1 byte) และ 2) ข้อมูลภาษาไทยในชุดเทรน tokenizer น้อยกว่าอังกฤษ ทำให้ merge rules น้อยและตกไปเป็น byte fallback บ่อย",
    ),
    rc(
      "d066-rc-2",
      "วิธีตัดข้อความภาษาไทยตาม `max_tokens` ไม่ให้เกิดอักขระเสีย (`U+FFFD`) ทำอย่างไร?",
      "Encode เป็น token IDs → slice `[:max_tokens]` → แปลงเป็น bytes ด้วย `decode_bytes()` → `decode('utf-8', errors='ignore')`",
    ),
    rc(
      "d066-rc-3",
      "เวลาประเมินความคุ้มค่าของ 2 โมเดลสำหรับแอปภาษาไทย ทำไมดูแค่ราคา `$/1M tokens` ไม่พอ?",
      "เพราะโมเดลที่มี vocab ภาษาไทยดีกว่าอาจใช้ token น้อยกว่าเกือบ 2 เท่าบนข้อความเดียวกัน — ต้องเทียบต้นทุนต่อ 1,000 ข้อความภาษาไทยจริง",
    ),
  ],

  sources: [
    { label: "tiktoken Official Repository (OpenAI BPE Tokenizer)", href: "https://github.com/openai/tiktoken" },
    { label: "Hugging Face Transformers — Summary of Tokenizers (BPE)", href: "https://huggingface.co/docs/transformers/tokenizer_summary" },
    { label: "Python Official Docs — Unicode & UTF-8 HOWTO", href: "https://docs.python.org/3/howto/unicode.html" },
    { label: "PyThaiNLP Official Documentation", href: "https://pythainlp.github.io/docs/" },
  ],

  glossary: ["bpe-tokenizer", "transformer", "llm", "chunking", "context-engineering", "pythainlp", "rag", "embedding"],
});
