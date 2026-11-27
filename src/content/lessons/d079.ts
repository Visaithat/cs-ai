import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D079 — Phase 3 / Block B20
 * Handling Long Contexts, Prompt Caching & Model Routing (Small vs Frontier)
 */
export const d079: Lesson = defineLesson({
  day: 79,
  titleTh: "จัดการ Long Context, Prompt Caching (Prefix คงที่) และ Model Routing (เล็ก vs ใหญ่)",
  tagline: "30 นาที · ทดสอบ Prefix Cache Hit และ Model Router บนเครื่องได้ 100% ด้วย mock client · ลดค่า API กว่า 60% โดยไม่เสียคุณภาพ",
  icon: "git-branch",
  visual: {
    id: "prompt-cache-routing",
    title: "Prompt Caching (Prefix คงที่) + Model Routing (Small 80% / Frontier 20%)",
    caption: "กดสลับเทียบการเรียกโมเดลใหญ่ทุกรอบกับการจัดวาง Static Prefix + Router เพื่อลดค่า API กว่า 60%",
    alt: "แผนภาพ Prompt Caching และ Model Routing ระหว่างโมเดลเล็กและใหญ่",
  },
  requiresApiKey: true,
  apiKeyNote: "ทดสอบและรันลูป repair/routing/cache บนเครื่องได้ 100% ด้วย mock client",
  tools: ["Official SDK", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "จัดวางลำดับบริบทให้พ้นจุดบอด Lost in the Middle",
      body: "ในเอกสารยาว ๆ {{llm}} มักโฟกัสข้อมูลที่อยู่ต้นและท้ายบริบทได้แม่นกว่าข้อมูลที่ฝังอยู่ตรงกลาง การจัดโครงสร้าง {{context-engineering}} ที่ดีจึงสำคัญไม่แพ้ขนาด Context Window",
      lessonNote: "วันนี้เราจะวางคำสั่งหลัก + กฎสกัดไว้ส่วนหัว และวางเอกสารเป้าหมาย + คำถามผู้ใช้ไว้ส่วนท้ายสุด",
    },
    {
      node: 2,
      heading: "ทำ Prompt Caching ให้ Hit จริงด้วย Static Prefix ที่ไม่เปลี่ยนแปลง",
      body: "{{prompt-caching}} ฝั่งผู้ให้บริการจะนำ KV Cache ของ prefix ที่ตรงกันเป๊ะมาใช้ซ้ำ ช่วยลดค่า input token ลง 50%–90% และลด {{ttft}} ลงอย่างมาก — แต่แค่เผลอใส่ `timestamp` ไว้บนสุด cache ก็ miss 100%",
      lessonNote: "เราจะสร้าง prompt builder ที่แยก Static Prefix ออกจาก Dynamic Query อย่างเด็ดขาดและตรวจด้วย unit test",
    },
    {
      node: 4,
      heading: "Model Routing: ให้โมเดลเล็กจัดการ 80% และส่งต่อโมเดลใหญ่เฉพาะ 20% ที่ยาก",
      body: "การยิงโมเดล Frontier แพงสุดใส่ทุกใบแจ้งหนี้และทุกทิกเก็ตคือการเผาเงินโดยใช่เหตุ ระบบ Router ที่ดีจะส่งงานชัดเจนให้โมเดลเล็กเร็วถูกก่อน แล้วค่อย escalate เคสยาวหรือความมั่นใจต่ำไปโมเดลใหญ่",
      lessonNote: "เราจะเขียน Tiered Router ที่วัดทั้งต้นทุนผสม ({{expected-value}}) และสัดส่วนการ escalate ด้วย {{mocking|mock client}}",
    },
    {
      node: 5,
      heading: "เฝ้าระวัง Cache Hit Rate และ Escalation Rate ใน Production",
      body: "หากมีใครแก้ prompt ให้แทรก `request_id` ใน system message หรือโมเดลเล็ก escalate พุ่งจาก 20% เป็น 85% บิลค่า API จะบวมทันทีโดยที่ฟีเจอร์ยังดูทำงานปกติ",
      lessonNote: "ตัวชี้วัด `cache_hit_rate` และ `escalation_rate` วันนี้คือ metric มาตรฐานบน Cost Dashboard ใน Phase 5",
    },
  ],

  objectives: [
    "**อธิบายและป้องกัน** ปรากฏการณ์ Lost in the Middle เมื่อต้องประมวลผลเอกสารยาวใน {{llm}}",
    "**ออกแบบ** โครงสร้าง prompt แบบ **Immutable Static Prefix First / Dynamic Query Last** เพื่อให้ได้ {{prompt-caching}} hit rate สูงและลด {{ttft}}",
    "**สร้าง** Tiered Model Router (Small 80% / Frontier 20%) พร้อมคำนวณต้นทุนผสมแบบ {{expected-value}} เพื่อลดค่า API กว่า 60% โดยไม่ลดความแม่นยำ",
  ],

  prerequisites: [
    "ต้นทุน `O(n²)` ช่วง Prefill และ {{ttft}} ของ Transformer (Day 65 & Day 75)",
    "{{context-engineering}} และ {{few-shot}} พื้นฐาน (Day 74)",
    "แนวคิด {{caching}} และ {{expected-value}} (Day 27 & Day 39)",
    "ทดสอบและรันตัวจำลอง prefix cache และ router บนเครื่องได้ 100% ด้วย mock client",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์โปรเจกต์ด้วย {{uv}} สำหรับทดลองสร้าง Cache-Friendly Prompt Builder และ Tiered Model Router พร้อมชุดเทสต์ออฟไลน์",
    commands: `uv init ai-day79 && cd ai-day79
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('Day 79 Ready | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day79` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันเช็กสภาพแวดล้อมพร้อมทำแบบฝึกหัดออฟไลน์ 100%"],
    ],
    note: "หลักการ Static Prefix First ของ {{prompt-caching}} ใช้ได้เหมือนกันทั้งกับ OpenAI (automatic prefix caching ≥ 1,024 tokens), Anthropic (`cache_control: {\"type\": \"ephemeral\"}`), และ Gemini Context Caching",
  },

  concepts: [
    {
      id: "lost-in-the-middle",
      title: "1 · จัดการ Long Context และปรากฏการณ์ Lost in the Middle",
      paragraphs: [
        "แม้โมเดลยุคใหม่จะโฆษณาว่ารับบริบทได้ 128k–1M tokens แต่งานวิจัย *Lost in the Middle* (Liu et al.) และผลทดสอบใน production ชี้ชัดว่าความแม่นยำในการดึงข้อเท็จจริงจากบริบทยาวมีลักษณะเป็น **รูปตัวยู (U-Shaped Curve)**: โมเดลจำข้อมูลที่อยู่ **ตอนต้นสุด** และ **ตอนท้ายสุด** ได้แม่นที่สุด แต่มักมองข้ามรายละเอียดสำคัญที่ถูกฝังอยู่ตรงกลาง",
        "นอกจากเรื่องความแม่นยำแล้ว ทุก token ที่ยัดเข้าไปยังทำให้ช่วง Prefill โตแบบ `O(n²)` (Day 65) ส่งผลให้ {{ttft}} ช้าลงและค่า API สูงขึ้นตามจำนวน token ที่ส่งเข้าไป",
        "แนวทาง {{context-engineering}} ที่ดีสำหรับเอกสารยาวจึงมี 3 หลัก: (1) ตัดข้อมูลขยะ (HTML tag, footer ซ้ำ, log ยาว) ออกก่อนส่ง, (2) วางกฎสกัดและคำสั่งสำคัญไว้ **ต้น prompt**, และ (3) วางเอกสารเป้าหมายหรือคำถามเฉพาะของรอบนั้นไว้ **ท้ายสุด** ใกล้ตำแหน่งที่โมเดลกำลังจะสร้างคำตอบ",
      ],
      analogy: "เหมือนอ่านรายงานหนา 50 หน้าก่อนเข้าประชุม 5 นาที — คุณจะจำหน้าแรก (บทสรุปผู้บริหาร) กับหน้าสุดท้าย (ข้อเสนอที่ต้องอนุมัติ) ได้แม่นที่สุด แต่รายละเอียดเล็ก ๆ ในหน้า 27 มักตกหล่น",
      bullets: [
        "**ต้น Prompt**: บทบาท, กฎสกัด, คำนิยามฟิลด์, และตัวอย่าง {{few-shot}}",
        "**กลาง Prompt**: เอกสารอ้างอิงเสริมที่จัดเรียงตามความเกี่ยวข้อง (สำคัญกว่าอยู่ขอบนอก)",
        "**ท้าย Prompt**: ข้อความใบแจ้งหนี้/ทิกเก็ตของคำขอปัจจุบัน + ย้ำคำสั่งสั้น ๆ ก่อนให้โมเดลตอบ",
      ],
      whyTitle: "Why this matters — โครงสร้างที่แก้ Lost in the Middle ยังเอื้อต่อ Prompt Caching ด้วย",
      whyParagraphs: [
        "ข้อดีที่ลงตัวมากคือ ลำดับ *\"กฎคงที่ไว้บน + ข้อมูลเปลี่ยนตามคำขอไว้ล่าง\"* นอกจากจะช่วยให้โมเดลจำกฎและเอกสารเป้าหมายได้แม่นขึ้นแล้ว ยังตรงกับเงื่อนไขของ **Prompt Caching** แบบพอดีเป๊ะ",
        "คุณจึงได้ประโยชน์ 2 ต่อพร้อมกัน: ความแม่นยำดีขึ้นและค่า API ถูกลง",
      ],
    },
    {
      id: "prompt-caching-prefix",
      title: "2 · Prompt Caching: กฎเหล็ก \"Immutable Static Prefix First\"",
      paragraphs: [
        "เวลาคุณส่ง System Prompt + คู่มือบัญชี + ตัวอย่าง {{few-shot}} ยาว 3,000 tokens ซ้ำ ๆ ในทุกคำขอของใบแจ้งหนี้ 10,000 ใบ หากไม่มี {{prompt-caching}} โมเดลต้องคำนวณ Prefill (KV Cache) ของ 3,000 tokens เดิมซ้ำใหม่ถึง 10,000 ครั้ง",
        "**{{prompt-caching}}** อนุญาตให้ผู้ให้บริการเก็บ KV Cache ของส่วนหัว (Prefix) ที่ตรงกันเป๊ะทุก token ไว้ชั่วคราว (เช่น 5–60 นาที) เมื่อคำขอถัดไปส่ง prefix เดิมเข้ามา ระบบจะดึง KV Cache มาใช้ต่อทันที ส่งผลให้ค่า cached input tokens ลดลง **50%–90%** และลด {{ttft}} ลงหลายเท่าตัว",
        "ข้อควรระวังอันดับ 1 ที่ทำทีมพังกันบ่อยที่สุดคือ **Prefix Cache Busting**: แค่คุณเผลอใส่ `f\"วันนี้วันที่ {datetime.now()}\"` หรือ `request_id` หรือชื่อลูกค้าไว้ในบรรทัดแรกของ System Prompt เพียงตัวอักษรเดียว KV Cache ตั้งแต่จุดนั้นลงไปจะ **ไม่ตรงกันเลย (0% Cache Hit)**! ทุกอย่างที่เปลี่ยนตามคำขอต้องถูกย้ายไปอยู่ท้ายสุดใน `user` message เสมอ",
      ],
      analogy: "เหมือนการพิมพ์ใบปลิว 10,000 แผ่นที่ข้อความ 90% เหมือนกัน ต่างกันแค่ชื่อผู้รับ — ถ้าวางชื่อผู้รับไว้บรรทัดแรกสุด แม่พิมพ์เปลี่ยนทุกแผ่นต้องตั้งแท่นใหม่ทุกรอบ แต่ถ้าวางเนื้อหาคงที่ไว้ส่วนบนแล้วค่อยเติมชื่อผู้รับท้ายสุด คุณใช้แม่พิมพ์เดิมซ้ำได้ครบทั้ง 10,000 แผ่น",
      code: {
        language: "python",
        filename: "prompt_cache_layout.py",
        code: `# ❌ BAD: ใส่ timestamp และ request_id ไว้บนสุด -> Cache Miss 100%!
def build_bad_messages(policy_text: str, user_doc: str, req_id: str, now_iso: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": f"[{now_iso} | {req_id}]\\n{policy_text}"},
        {"role": "user", "content": user_doc},
    ]


# ✅ GOOD: Static Prefix คงที่ 100% อยู่บนสุด, Dynamic Metadata + Query อยู่ท้ายสุด
def build_cacheable_messages(
    system_rules: str,
    policy_text: str,
    user_doc: str,
    *,
    req_id: str,
    now_iso: str,
) -> list[dict[str, str]]:
    static_prefix = f"{system_rules.strip()}\\n\\n--- REFERENCE POLICY ---\\n{policy_text.strip()}"
    dynamic_suffix = f"request_id: {req_id}\\ntimestamp: {now_iso}\\n\\n--- DOCUMENT ---\\n{user_doc.strip()}"
    return [
        {"role": "system", "content": static_prefix},
        {"role": "user", "content": dynamic_suffix},
    ]`,
        caption: "แยก Static Prefix (เหมือนกันทุก request) กับ Dynamic Suffix (เปลี่ยนทุก request) ออกจากกันอย่างเด็ดขาดเพื่อให้ได้ Cache Hit สูงสุด",
      },
      whyTitle: "Why this matters — แก้ตำแหน่งข้อความแค่ 2 บรรทัด ลดบิลค่า AI ได้ครึ่งหนึ่ง",
      whyParagraphs: [
        "ผู้ให้บริการรายใหญ่ส่วนมากเปิด Prompt Caching ให้อัตโนมัติ (หรือเปิดด้วย flag เดียว) เมื่อ prefix ยาวเกินเกณฑ์ขั้นต่ำ (เช่น 1,024 tokens) และตรงกันแบบ exact match",
        "เพียงจัดลำดับ prompt ให้ถูกต้องและล็อกด้วย unit test ว่า `system` message ไม่เปลี่ยนตาม `request_id` หรือ `timestamp` คุณจะได้ส่วนลดค่า input ทันทีโดยไม่ต้องเปลี่ยนโมเดลเลย",
      ],
    },
    {
      id: "tiered-model-routing",
      title: "3 · Model Routing (Small 80% vs Frontier 20%): คุ้มต้นทุนโดยไม่ทิ้งคุณภาพ",
      paragraphs: [
        "ในงานสกัดเอกสารหรือคัดแยกทิกเก็ตจริง ประมาณ **75%–85%** ของข้อมูลเป็นเคสตรงไปตรงมา (ใบเสร็จมาตรฐาน, คำถามสั้นชัดเจน) ที่โมเดลขนาดเล็กและเร็ว (เช่น `gpt-4o-mini`, `claude-haiku`, `gemini-flash`) ทำได้แม่นยำเท่าโมเดล Frontier แต่ราคาถูกกว่า **10×–20×** และเร็วกว่าหลายเท่า",
        "มีเพียง **15%–25%** เท่านั้นที่เป็นเคสซับซ้อนจริง เช่น เอกสารยาวหลายหน้า, ภาษาพูดไทยกำกวมปนสแลง, หรือเคสที่โมเดลเล็กประเมินความมั่นใจต่ำ (`confidence < 0.80`) หรือไม่ผ่าน Pydantic validation",
        "กลยุทธ์ **Tiered Model Routing (Cascade / Router)** จึงส่งคำขอเข้าโมเดลเล็กเป็นค่าเริ่มต้น (ยกเว้นเอกสารยาวเกินเกณฑ์ที่ส่งตรงไป Frontier เลย) และ **Escalate** ไปยังโมเดล Frontier เฉพาะเมื่อ (1) เอกสารยาว/ซับซ้อนเกินเกณฑ์, (2) โมเดลเล็กคืน `confidence < threshold`, หรือ (3) โมเดลเล็ก validate ไม่ผ่าน — คำนวณต้นทุนรวมด้วยสูตร {{expected-value}}: `0.80 × Cost_small + 0.20 × Cost_frontier` ซึ่งช่วยลดค่า API ลงได้ **60%–75%**",
      ],
      analogy: "เหมือนระบบคัดกรองห้องฉุกเฉิน (Triage): พยาบาลด่านแรก (Small Model) ดูแลเคสทั่วไป 80% ได้เร็วและแม่นยำ แล้วส่งต่อแพทย์เฉพาะทาง (Frontier Model) เฉพาะเคสซับซ้อน 20% — ผู้ป่วยได้คิวเร็วขึ้นและโรงพยาบาลคุมงบได้",
      bullets: [
        "**Pre-Route (Heuristic)**: ถ้าเอกสารยาวเกิน `2,000` ตัวอักษรหรือมีหลายตารางซ้อน ส่งตรงไป Frontier ทันที (ไม่ต้องเสียเวลาลองโมเดลเล็ก)",
        "**Post-Route (Confidence / Validation Cascade)**: ลองโมเดลเล็กก่อน หาก `confidence < 0.80` หรือเกิด `ValidationError` ค่อย escalate ไป Frontier",
        "**เฝ้าดู Escalation Rate**: ถ้าระบบ escalate เกิน 35–40% แสดงว่า threshold เข้มไปหรือ prompt ของโมเดลเล็กยังอธิบายไม่ชัดพอ",
      ],
      whyTitle: "Why this matters — นี่คือวิธีขยายระบบ AI จาก Prototype สู่หลักแสนคำขอต่อเดือน",
      whyParagraphs: [
        "Prototype ที่ยิง Frontier Model ทุกรอบอาจเสียแค่หลักร้อยบาทต่อเดือน แต่พอขึ้น production เจอ 500,000 เอกสารต่อเดือน บิลจะพุ่งเป็นหลักแสนบาทจนโปรเจกต์ถูกสั่งพัก",
        "การรวม **Prompt Caching + 80/20 Model Routing** ทำให้ unit economics ของระบบ AI คุ้มค่าทางธุรกิจและตอบสนองผู้ใช้ได้เร็วขึ้นพร้อมกัน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Prompt Caching ≈ CDN Cache Key + Model Routing ≈ Fast-Path Worker",
      body: [
        "นักพัฒนาเว็บทุกคนรู้ว่าถ้าเผลอใส่ `?ts=Date.now()` ลงใน URL ของรูปภาพหรือ API response CDN จะ **Cache Miss 100%** ทันที — การใส่ `timestamp` หรือ `request_id` ไว้บนสุดของ System Prompt คือบั๊กเดียวกันเป๊ะในโลก LLM",
        "ส่วน Model Routing ก็เหมือนการแยก Fast-Path (Edge/Cache/Lightweight Service) ออกจาก Heavy-Path (GPU/Batch Worker) เพื่อให้ 80% ของทราฟฟิกจบเร็วและถูก ส่วน 20% ที่ซับซ้อนค่อยส่งไปเครื่องแรง",
      ],
      table: [
        ["Immutable Static Prefix", "Stable Cache Key (ไม่มี nonce/timestamp ในหัว key)"],
        ["Prefix Cache Busting", "ใส่ `?t=Date.now()` ใน URL ทำให้ CDN miss ทุกรอบ"],
        ["Small Model (80%)", "Fast-path / Edge worker ต้นทุนต่ำและ latency ต่ำ"],
        ["Frontier Escalation (20%)", "Heavy compute fallback สำหรับเคสซับซ้อน"],
      ],
    },
    student: {
      title: "First-Year Note — เชื่อม KV Cache (D65) กับ Expected Value (D39) เข้าด้วยกัน",
      body: [
        "จำต้นทุน `O(n²)` ช่วง Prefill จาก Day 65 ได้ไหม? **Prompt Caching** ก็คือการเซฟผลคำนวณ K และ V ของข้อความส่วนหัวเก็บไว้ในหน่วยความจำเซิร์ฟเวอร์ เพื่อไม่ต้องคำนวณ `Q @ K.T` ของส่วนหัวซ้ำอีกในคำขอถัดไป",
        "ส่วนต้นทุนของ Model Routing ใช้สูตร **{{expected-value}}** จาก Day 39 ตรง ๆ: ถ้าโมเดลเล็กต้นทุน `$0.001`/ครั้ง และโมเดลใหญ่ `$0.015`/ครั้ง การใช้ 80/20 จะมีต้นทุนเฉลี่ย `(0.8 × 0.001) + (0.2 × 0.015) = $0.0038` ถูกกว่าใช้โมเดลใหญ่ล้วน (`$0.015`) ถึง **74.7%**!",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ระบบสกัดทิกเก็ตและใบแจ้งหนี้ไทยรับงาน 1,000 คำขอต่อวัน เราจะเทียบ Prompt ที่ทำ Cache Miss vs Cache Hit, เขียน Model Router (Small 80% / Frontier 20%), และคำนวณเงินที่ประหยัดได้จริง",
    steps: [
      {
        title: "1 · พิสูจน์ Prefix Cache Hit vs Cache Busting ด้วย Hash ของ System Message",
        explain: "สร้างตัวสร้าง prompt แบบ Static Prefix First แล้วเช็กว่าเมื่อส่ง 2 คำขอต่าง `request_id` และ `timestamp` ส่วน `system` message ยังเหมือนกัน 100% (Cache Hit)",
        code: {
          language: "python",
          filename: "worked_day79.py",
          code: `import hashlib

STATIC_RUBRIC = (
    "คุณคือผู้เชี่ยวชาญสกัดข้อมูลใบแจ้งหนี้ไทย คืนผลเป็น Strict JSON เท่านั้น\\n"
    "กฎสำคัญ: 1) แปลงปี พ.ศ. เป็น ค.ศ. เสมอ 2) หากไม่พบเลขที่เอกสารให้คืน null "
    "3) ตรวจยอด subtotal + vat_amount == total_amount ทุกครั้ง\\n"
) * 4  # จำลองคู่มือและตัวอย่าง few-shot ขนาดยาว


def build_cacheable_messages(rubric: str, doc: str, req_id: str, ts: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": rubric.strip()},
        {"role": "user", "content": f"request_id={req_id} | timestamp={ts}\\n\\n{doc.strip()}"},
    ]


def prefix_hash(messages: list[dict[str, str]]) -> str:
    return hashlib.sha256(messages[0]["content"].encode("utf-8")).hexdigest()[:12]


m1 = build_cacheable_messages(STATIC_RUBRIC, "ใบแจ้งหนี้ INV-01 ยอด 1,070 บาท", "REQ-1", "2026-05-10T09:00:00Z")
m2 = build_cacheable_messages(STATIC_RUBRIC, "ใบแจ้งหนี้ INV-02 ยอด 5,350 บาท", "REQ-2", "2026-05-10T09:01:00Z")

print("Prefix hash req1:", prefix_hash(m1))
print("Prefix hash req2:", prefix_hash(m2))
print("Prefix Cache Hit?:", m1[0]["content"] == m2[0]["content"])`,
        },
        output: `Prefix hash req1: 7c3a9f10b4e2
Prefix hash req2: 7c3a9f10b4e2
Prefix Cache Hit?: True`,
      },
      {
        title: "2 · เขียน Tiered Model Router (Small-First + Confidence/Length Escalation)",
        explain: "ถ้าเอกสารยาวเกิน `long_doc_chars` ส่งตรงไป `frontier_fn`; มิฉะนั้นลอง `small_fn` ก่อน และ escalate ไป `frontier_fn` เมื่อ `confidence < 0.80` หรือเกิดข้อผิดพลาด",
        code: {
          language: "python",
          filename: "worked_day79.py",
          code: `from collections.abc import Callable


def route_extraction(
    doc_text: str,
    *,
    small_fn: Callable[[str], dict],
    frontier_fn: Callable[[str], dict],
    confidence_threshold: float = 0.80,
    long_doc_chars: int = 2000,
) -> dict:
    if len(doc_text) > long_doc_chars:
        return {"tier": "frontier", "escalated": True, "reason": "long_context", "result": frontier_fn(doc_text)}

    try:
        small_res = small_fn(doc_text)
    except ValueError:
        return {"tier": "frontier", "escalated": True, "reason": "small_error", "result": frontier_fn(doc_text)}

    if float(small_res.get("confidence", 0.0)) < confidence_threshold:
        return {"tier": "frontier", "escalated": True, "reason": "low_confidence", "result": frontier_fn(doc_text)}

    return {"tier": "small", "escalated": False, "reason": "small_ok", "result": small_res}


small_mock = lambda text: {"category": "billing", "confidence": 0.92 if "INV" in text else 0.55}
frontier_mock = lambda text: {"category": "billing", "confidence": 0.98}

print("Clear doc:", route_extraction("ใบแจ้งหนี้ INV-09 ยอด 500 บาท", small_fn=small_mock, frontier_fn=frontier_mock))
print("Ambiguous:", route_extraction("ขอคุยเรื่องยอดแปลก ๆ หน่อย", small_fn=small_mock, frontier_fn=frontier_mock))`,
        },
        output: `Clear doc: {'tier': 'small', 'escalated': False, 'reason': 'small_ok', 'result': {'category': 'billing', 'confidence': 0.92}}
Ambiguous: {'tier': 'frontier', 'escalated': True, 'reason': 'low_confidence', 'result': {'category': 'billing', 'confidence': 0.98}}`,
      },
      {
        title: "3 · เทียบต้นทุน 1,000 คำขอ: All-Frontier vs Prompt Caching + 80/20 Routing",
        explain: "คำนวณต้นทุนรวมต่อ 1,000 เอกสารเมื่อยิง Frontier ล้วน เทียบกับการใช้ 80% Small + 20% Frontier พร้อม Prompt Cache Hit 85% (ลดราคา input ที่ cache hit ลง 50%)",
        code: {
          language: "python",
          filename: "worked_day79.py",
          code: `def estimate_cost(
    n_reqs: int,
    small_share: float,
    small_cost: float,
    frontier_cost: float,
    cache_hit_rate: float = 0.0,
    cache_discount: float = 0.50,
) -> float:
    base_per_req = small_share * small_cost + (1.0 - small_share) * frontier_cost
    effective_multiplier = 1.0 - (cache_hit_rate * cache_discount)
    return round(n_reqs * base_per_req * effective_multiplier, 4)


all_frontier = estimate_cost(1000, small_share=0.0, small_cost=0.001, frontier_cost=0.015, cache_hit_rate=0.0)
routed_cached = estimate_cost(1000, small_share=0.8, small_cost=0.001, frontier_cost=0.015, cache_hit_rate=0.85)
savings_pct = (1.0 - routed_cached / all_frontier) * 100.0

print(f"All-Frontier (no cache): USD {all_frontier:.2f}")
print(f"80/20 Routing + Cache  : USD {routed_cached:.2f} (ประหยัด {savings_pct:.1f}%)")`,
        },
        output: `All-Frontier (no cache): USD 15.00
80/20 Routing + Cache  : USD 2.18 (ประหยัด 85.4%)`,
      },
    ],
    gotcha: "ข้อควรระวังเรื่องต้นทุนจริงของ Cascade Routing: เมื่อโมเดลเล็กถูกเรียกก่อนแล้วค่อย escalate ไปโมเดลใหญ่ เคสที่ escalate 20% จะจ่ายทั้งค่าโมเดลเล็ก + ค่าโมเดลใหญ่ (`small_cost + frontier_cost`) แต่เพราะ `small_cost` ถูกกว่ามาก (เช่น `$0.001` vs `$0.015`) ต้นทุนรวมก็ยังลดลงกว่า 70% อยู่ดี!",
  },

  practice: {
    intro: "สร้างโมดูล `exercise_day79.py` ที่รวมตัวจัดโครงสร้าง Prompt แบบ Cache-Friendly, ตัวตรวจ Prefix Cache Hit, Tiered Model Router (Small vs Frontier), และเครื่องคำนวณต้นทุนผสมที่รันเทสต์ออฟไลน์ได้ 100%",
    requirements: [
      "`build_cacheable_messages(system_rules: str, rubric: str, reference_docs: list[str], *, user_query: str, request_id: str, timestamp_iso: str) -> list[dict[str, str]]`: รวมส่วนคงที่ทั้งหมด (`system_rules`, `rubric`, และ `reference_docs` เรียงตามลำดับเดิม) ไว้ในข้อความ `role=\"system\"` แรกเพียงข้อความเดียว โดย **ห้าม** มี `request_id`, `timestamp_iso` หรือ `user_query` ปนใน `system` message และวางข้อมูล dynamic ทั้งหมดไว้ในข้อความ `role=\"user\"` ท้ายสุด",
      "`check_prefix_cache_hit(prev_messages: list[dict[str, str]], curr_messages: list[dict[str, str]], *, min_prefix_chars: int = 200) -> bool`: คืน `True` เมื่อข้อความแรกของทั้งคู่เป็น `role=\"system\"`, มี `content` ตรงกันทุกตัวอักษร, และความยาว `>= min_prefix_chars`",
      "`route_and_extract(doc_text: str, *, small_fn: Callable[[str], dict], frontier_fn: Callable[[str], dict], confidence_threshold: float = 0.80, long_doc_chars: int = 2000) -> dict`: หาก `len(doc_text) > long_doc_chars` ให้ส่งตรงไป `frontier_fn` (`reason=\"long_context\"`); มิฉะนั้นเรียก `small_fn` ก่อน หากโยน `ValueError` ให้ escalate (`reason=\"small_error\"`), หาก `confidence < confidence_threshold` ให้ escalate (`reason=\"low_confidence\"`), มิฉะนั้นคืนผลจาก `small_fn` (`reason=\"small_ok\"`) ในรูปแบบ `{\"model_tier\": ..., \"escalated\": bool, \"reason\": str, \"result\": dict}`",
      "`estimate_blended_cost_usd(total_requests: int, small_share: float, *, small_cost_per_req: float, frontier_cost_per_req: float, cache_hit_rate: float = 0.0, cached_input_discount: float = 0.5) -> float`: ตรวจสอบช่วงค่าทั้งหมด (`total_requests > 0`, `0 <= small_share <= 1`, ราคา `>= 0`, `0 <= cache_hit_rate <= 1`, `0 <= cached_input_discount <= 0.9` — ไม่งั้น `raise ValueError`) แล้วคืนต้นทุนรวมปัดทศนิยม 4 ตำแหน่ง",
    ],
    starter: {
      language: "python",
      filename: "exercise_day79.py",
      code: `from collections.abc import Callable


def build_cacheable_messages(
    system_rules: str,
    rubric: str,
    reference_docs: list[str],
    *,
    user_query: str,
    request_id: str,
    timestamp_iso: str,
) -> list[dict[str, str]]:
    """จัดเรียง Static Prefix ไว้ใน system message แรก และ Dynamic Query ไว้ใน user message ท้ายสุด."""
    # TODO: implement
    raise NotImplementedError


def check_prefix_cache_hit(
    prev_messages: list[dict[str, str]],
    curr_messages: list[dict[str, str]],
    *,
    min_prefix_chars: int = 200,
) -> bool:
    """ตรวจว่า static system prefix ตรงกันทุกตัวอักษรและยาวถึงเกณฑ์ขั้นต่ำหรือไม่."""
    # TODO: implement
    raise NotImplementedError


def route_and_extract(
    doc_text: str,
    *,
    small_fn: Callable[[str], dict],
    frontier_fn: Callable[[str], dict],
    confidence_threshold: float = 0.80,
    long_doc_chars: int = 2000,
) -> dict:
    """ทำ Tiered Model Routing ระหว่าง Small Model กับ Frontier Model."""
    # TODO: implement
    raise NotImplementedError


def estimate_blended_cost_usd(
    total_requests: int,
    small_share: float,
    *,
    small_cost_per_req: float,
    frontier_cost_per_req: float,
    cache_hit_rate: float = 0.0,
    cached_input_discount: float = 0.5,
) -> float:
    """คำนวณต้นทุนผสมแบบ Expected Value พร้อมส่วนลดจาก Prompt Caching."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day79.py",
      code: `import pytest
from exercise_day79 import (
    build_cacheable_messages,
    check_prefix_cache_hit,
    estimate_blended_cost_usd,
    route_and_extract,
)


def test_cacheable_messages_yield_prefix_hit():
    rules = "สกัดข้อมูลใบแจ้งหนี้ภาษาไทยตาม Strict JSON Schema เท่านั้น ห้ามแต่งข้อมูล"
    rubric = "แปลงปี พ.ศ. เป็น ค.ศ. เสมอ และตรวจ subtotal + vat_amount == total_amount"
    refs = ["ตัวอย่าง 1: ใบกำกับภาษี VAT 7% ของบริษัทไทย", "ตัวอย่าง 2: กรณีไม่มีเลขใบแจ้งหนี้ให้คืน null"]

    m1 = build_cacheable_messages(
        rules, rubric, refs, user_query="ใบแจ้งหนี้ A", request_id="REQ-1", timestamp_iso="2026-05-10T09:00:00Z"
    )
    m2 = build_cacheable_messages(
        rules, rubric, refs, user_query="ใบแจ้งหนี้ B", request_id="REQ-2", timestamp_iso="2026-05-10T09:05:00Z"
    )
    assert m1[0]["role"] == "system"
    assert m1[1]["role"] == "user"
    assert "REQ-1" not in m1[0]["content"]
    assert "2026-05-10" not in m1[0]["content"]
    assert "REQ-1" in m1[1]["content"]
    assert check_prefix_cache_hit(m1, m2, min_prefix_chars=100) is True
    assert check_prefix_cache_hit(m1, m2, min_prefix_chars=5000) is False


def test_router_paths():
    small_calls = 0

    def small_fn(text: str) -> dict:
        nonlocal small_calls
        small_calls += 1
        if "BAD" in text:
            raise ValueError("invalid schema")
        return {"ok": True, "confidence": 0.91 if "CLEAR" in text else 0.50}

    def frontier_fn(text: str) -> dict:
        return {"ok": True, "confidence": 0.99, "via": "frontier"}

    r_small = route_and_extract("CLEAR invoice", small_fn=small_fn, frontier_fn=frontier_fn)
    assert r_small["model_tier"] == "small" and r_small["escalated"] is False and r_small["reason"] == "small_ok"

    r_low = route_and_extract("ambiguous note", small_fn=small_fn, frontier_fn=frontier_fn)
    assert r_low["model_tier"] == "frontier" and r_low["escalated"] is True and r_low["reason"] == "low_confidence"

    r_err = route_and_extract("BAD json doc", small_fn=small_fn, frontier_fn=frontier_fn)
    assert r_err["model_tier"] == "frontier" and r_err["escalated"] is True and r_err["reason"] == "small_error"

    before = small_calls
    r_long = route_and_extract("ก" * 2500, small_fn=small_fn, frontier_fn=frontier_fn, long_doc_chars=2000)
    assert r_long["model_tier"] == "frontier" and r_long["reason"] == "long_context"
    assert small_calls == before  # เอกสารยาวต้องส่งตรงไป frontier โดยไม่เรียก small


def test_blended_cost_savings_and_validation():
    baseline = estimate_blended_cost_usd(
        1000, small_share=0.0, small_cost_per_req=0.001, frontier_cost_per_req=0.015, cache_hit_rate=0.0
    )
    optimized = estimate_blended_cost_usd(
        1000, small_share=0.8, small_cost_per_req=0.001, frontier_cost_per_req=0.015, cache_hit_rate=0.8
    )
    assert baseline == 15.0
    assert optimized < baseline * 0.40  # ลดต้นทุนเกิน 60%

    with pytest.raises(ValueError):
        estimate_blended_cost_usd(0, 0.8, small_cost_per_req=0.001, frontier_cost_per_req=0.015)
    with pytest.raises(ValueError):
        estimate_blended_cost_usd(100, 1.2, small_cost_per_req=0.001, frontier_cost_per_req=0.015)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทุก test cases ในเวลา < 1 วินาทีโดยไม่ต้องใช้ API key",
      "ตรวจว่า `system` message ไม่มี `request_id` หรือ `timestamp_iso` ปะปน เพื่อให้ `check_prefix_cache_hit` คืน `True`",
      "ตรวจว่าเอกสารยาวเกิน `long_doc_chars` ข้าม `small_fn` ไปยัง `frontier_fn` โดยตรง (`small_calls` ไม่เพิ่ม)",
      "ตรวจว่า 80/20 Routing + Prompt Caching ลดต้นทุนรวมได้มากกว่า 60% เมื่อเทียบกับ All-Frontier",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day79.py` ด้วย `uv run pytest -q` และไม่มี warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `build_cacheable_messages` ประกอบ `static_parts = [system_rules.strip(), rubric.strip(), *reference_docs]` แล้วเชื่อมด้วย `\"\\n\\n\"` เพื่อใส่ใน `system` message ส่วน `request_id`, `timestamp_iso`, `user_query` ให้รวมไว้ใน `user` message",
      },
      {
        body: "ใน `check_prefix_cache_hit` เช็กว่าทั้ง `prev_messages` และ `curr_messages` ไม่ว่าง, ข้อความ index `0` มี `role == \"system\"`, ค่า `content` เท่ากันเป๊ะ, และ `len(content) >= min_prefix_chars`",
      },
      {
        body: "โครงของ `route_and_extract` และสูตรใน `estimate_blended_cost_usd` — เติมการ validate input และ 2 ฟังก์ชันแรกให้ครบ",
        code: {
          language: "python",
          filename: "hint_day79.py",
          code: `def route_and_extract(
    doc_text: str,
    *,
    small_fn,
    frontier_fn,
    confidence_threshold: float = 0.80,
    long_doc_chars: int = 2000,
) -> dict:
    if len(doc_text) > long_doc_chars:
        return {"model_tier": "frontier", "escalated": True, "reason": "long_context", "result": frontier_fn(doc_text)}
    try:
        small_res = small_fn(doc_text)
    except ValueError:
        return {"model_tier": "frontier", "escalated": True, "reason": "small_error", "result": frontier_fn(doc_text)}
    if float(small_res.get("confidence", 0.0)) < confidence_threshold:
        return {"model_tier": "frontier", "escalated": True, "reason": "low_confidence", "result": frontier_fn(doc_text)}
    return {"model_tier": "small", "escalated": False, "reason": "small_ok", "result": small_res}


def estimate_blended_cost_usd(
    total_requests: int,
    small_share: float,
    *,
    small_cost_per_req: float,
    frontier_cost_per_req: float,
    cache_hit_rate: float = 0.0,
    cached_input_discount: float = 0.5,
) -> float:
    if (
        total_requests <= 0
        or not (0.0 <= small_share <= 1.0)
        or small_cost_per_req < 0
        or frontier_cost_per_req < 0
        or not (0.0 <= cache_hit_rate <= 1.0)
        or not (0.0 <= cached_input_discount <= 0.9)
    ):
        raise ValueError("Invalid cost parameters")
    base = small_share * small_cost_per_req + (1.0 - small_share) * frontier_cost_per_req
    return round(total_requests * base * (1.0 - cache_hit_rate * cached_input_discount), 4)`,
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
      title: "ใส่ `datetime.now()` หรือ `user_id` ไว้บรรทัดแรกของ System Prompt",
      symptom: "เปิดใช้ Prompt Caching แล้วแต่ยอด `cached_tokens` ในหน้า dashboard เป็น `0` ตลอดเวลา",
      fix: "ย้ายข้อมูลที่เปลี่ยนตามคำขอทุกชนิด (`timestamp`, `request_id`, `user_name`) ไปไว้ใน `user` message ท้ายสุด เพื่อให้ Static Prefix ตรงกัน 100%",
    },
    {
      title: "วางคำสั่งสำคัญหรือเอกสารที่เกี่ยวข้องที่สุดไว้ตรงกลางบริบทยาว 30k tokens",
      symptom: "โมเดลตอบพลาดเงื่อนไขสำคัญทั้งที่เขียนบอกไว้แล้วใน prompt (ปรากฏการณ์ Lost in the Middle)",
      fix: "วางคำสั่งและกฎหลักไว้ต้น prompt และวางเอกสารเป้าหมายหรือคำถามผู้ใช้ไว้ท้ายสุด พร้อมตัดเนื้อหาที่ไม่เกี่ยวข้องออกก่อนส่ง",
    },
    {
      title: "ยิง Frontier Model ใส่ทุก request เพื่อ \"กันพลาด\"",
      symptom: "บิลค่า API สูงเกินงบ 5×–10× และ latency ช้าลง ทั้งที่ 80% ของเคสเป็นคำถามง่าย ๆ",
      fix: "ใช้ Tiered Model Routing ให้โมเดลเล็กจัดการเคสชัดเจน 80% และ escalate เฉพาะเคสยาวหรือความมั่นใจต่ำ 20%",
    },
    {
      title: "ตั้ง `confidence_threshold` สูงเกินไป (เช่น `0.99`) โดยไม่ดู Escalation Rate",
      symptom: "มี Router ในโค้ดจริงแต่ 95% ของทราฟฟิกถูก escalate ไป Frontier หมด ทำให้จ่ายแพงกว่าเดิมเพราะเสียค่าโมเดลเล็กฟรีเพิ่มด้วย",
      fix: "วัดและเฝ้าดู `escalation_rate` บนชุดทดสอบจริง ปรับ threshold ให้สมดุล (มักอยู่ช่วง `0.75–0.85`) และตั้ง alert หากพุ่งเกินเป้า",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d079-q1",
        "ปรากฏการณ์ *Lost in the Middle* ใน Long Context ส่งผลต่อการออกแบบ prompt อย่างไร?",
        [
          ["โมเดลจะอ่านเฉพาะข้อความตรงกลาง prompt เท่านั้น", "ตรงกันข้าม — โมเดลมักพลาดรายละเอียดที่ฝังอยู่ตรงกลางบริบทยาว"],
          ["โมเดลโฟกัสข้อมูลที่อยู่ตอนต้นและตอนท้ายบริบทได้แม่นกว่าตรงกลาง จึงควรวางกฎหลักไว้ต้น prompt และวางเอกสารเป้าหมาย/คำถามไว้ท้ายสุด", "ถูก — สอดคล้องกับ U-shaped attention curve และยังเอื้อต่อ Prompt Caching ด้วย"],
          ["โมเดลไม่รองรับ prompt ที่ยาวเกิน 1,000 tokens", "โมเดลยุคใหม่รับได้หลายหมื่นถึงหลักแสน tokens แต่คุณภาพการดึงข้อมูลตรงกลางจะดรอปลง"],
          ["ต้องสลับลำดับเอกสารแบบสุ่มทุกครั้งเพื่อให้โมเดลตื่นตัว", "การสุ่มลำดับนอกจากไม่ช่วยแล้วยังทำลาย Prompt Caching ทิ้งอีกด้วย"],
        ],
        "B",
        "LLM มีแนวโน้มเก็บรายละเอียดช่วงต้นและช่วงท้ายของบริบทได้ดีกว่าช่วงกลาง การวางคำสั่งหลักไว้บนสุดและเอกสารเป้าหมายไว้ล่างสุดจึงช่วยเพิ่มความแม่นยำ",
        "ปรากฏการณ์ Lost in the Middle คืออะไร และควรวางข้อมูลสำคัญตำแหน่งใดใน prompt?",
        "โมเดลมีแนวโน้มพลาดรายละเอียดที่ฝังอยู่ตรงกลางบริบทยาว — ควรวางคำสั่ง/กฎหลักไว้ตอนต้น และวางเอกสารเป้าหมาย/คำถามไว้ตอนท้ายสุด",
      ),
      mc(
        "d079-q2",
        "โค้ดใดต่อไปนี้ทำให้ **Prompt Caching พลาด (Cache Miss 100%)** แม้คู่มืออ้างอิงยาว 4,000 tokens จะเหมือนเดิมทุกคำขอ?",
        [
          ["วางคู่มืออ้างอิงและตัวอย่าง few-shot ไว้ใน `system` message แล้ววางคำถามลูกค้าใน `user` message", "นี่คือโครงสร้างที่ถูกต้องและให้ Cache Hit สูงสุด"],
          ["แทรก `f\"Current time: {datetime.now().isoformat()}\"` ไว้บรรทัดแรกของ `system` message", "ถูก — เพราะ Prompt Caching ตรวจ exact match ตั้งแต่ token แรก การเปลี่ยนข้อความบนสุดเพียงจุดเดียวทำให้ cache miss ทั้งหมด"],
          ["ตั้ง `temperature=0.0` ในทุกคำขอ", "`temperature` ไม่มีผลทำให้ input prefix cache miss"],
          ["ส่ง `request_id` ไว้ใน `user` message ท้ายสุดหลังเอกสารคงที่", "ถูกต้องแล้ว — ข้อมูล dynamic ท้ายสุดไม่กระทบ static prefix ด้านหน้า"],
        ],
        "B",
        "Prompt Caching อาศัยการจับคู่ prefix ตั้งแต่ token แรกแบบเป๊ะ ๆ การวางค่าที่เปลี่ยนตลอดเวลาอย่าง timestamp หรือ request_id ไว้ต้น prompt จะทำให้ KV cache ใช้ซ้ำไม่ได้เลย",
        "เหตุใดการใส่ `datetime.now()` หรือ `request_id` ไว้บนสุดของ System Prompt จึงทำลาย Prompt Caching?",
        "เพราะ Prompt Caching จับคู่ prefix แบบ exact match ตั้งแต่ token แรก — เมื่อ token แรก ๆ เปลี่ยนทุกคำขอ KV cache ของส่วนที่เหลือทั้งหมดจะ miss ทันที",
      ),
      mc(
        "d079-q3",
        "ในระบบ Tiered Model Routing (Small 80% / Frontier 20%) เงื่อนไขใดเหมาะที่สุดในการ **Escalate** ไปยัง Frontier Model?",
        [
          ["สุ่ม escalate 20% ของคำขอโดยไม่ดูเนื้อหา", "ไม่ฉลาด — อาจส่งเคสง่ายไปโมเดลใหญ่และปล่อยเคสยากไว้กับโมเดลเล็ก"],
          ["Escalate เฉพาะเมื่อเอกสารยาว/ซับซ้อนเกินเกณฑ์, โมเดลเล็กคืน `confidence` ต่ำกว่า threshold, หรือโมเดลเล็ก validate ไม่ผ่าน", "ถูก — ใช้สัญญาณความยากและความไม่แน่นอนจริง ทำให้ประหยัดงบได้มากโดยไม่เสียคุณภาพ"],
          ["ใช้โมเดลใหญ่ทุกคำขอในวันจันทร์–ศุกร์ และใช้โมเดลเล็กเฉพาะวันเสาร์–อาทิตย์", "ความยากของเอกสารไม่ได้ขึ้นกับวันในสัปดาห์"],
          ["ส่งเฉพาะคำขอที่ภาษาอังกฤษไปโมเดลใหญ่ และภาษาไทยทั้งหมดไปโมเดลเล็ก", "ไม่สมเหตุสมผล — ภาษาไทยที่ซับซ้อนหรือกำกวมอาจต้องการโมเดลใหญ่เช่นกัน"],
        ],
        "B",
        "Routing ที่มีประสิทธิภาพใช้สัญญาณจริง เช่น ความยาวเอกสาร, ค่าความมั่นใจจากโมเดลเล็ก, และผล Pydantic validation เพื่อ escalate เฉพาะเคสที่จำเป็น",
        "สัญญาณหลัก 3 อย่างที่ใช้ตัดสินใจ Escalate จาก Small Model ไป Frontier Model คืออะไร?",
        "1) เอกสารยาว/ซับซ้อนเกินเกณฑ์ (pre-route), 2) โมเดลเล็กคืน `confidence < threshold`, และ 3) โมเดลเล็กไม่ผ่าน Pydantic validation",
      ),
      mc(
        "d079-q4",
        "หากโมเดลเล็กต้นทุน `$0.001`/คำขอ และโมเดลใหญ่ `$0.015`/คำขอ เมื่อใช้ 80/20 Routing (ยังไม่คิดส่วนลด cache) ต้นทุนเฉลี่ยต่อ 1,000 คำขอจะลดจาก `$15.00` เหลือประมาณเท่าไร?",
        [
          ["`$14.20` (ลดเพียง 5%)", "คำนวณผิด — 80% ของคำขอจ่ายเพียง `$0.001` ไม่ใช่ `$0.015`"],
          ["`$3.80` (ลดลง ~74.7%)", "ถูก — `(0.8 × 0.001 + 0.2 × 0.015) × 1,000 = $0.80 + $3.00 = $3.80` และยิ่งลดลงอีกเมื่อรวม Prompt Caching"],
          ["`$0.80` (ไม่คิดค่าโมเดลใหญ่เลย)", "ลืมบวกต้นทุนของ 20% ที่ส่งไปโมเดลใหญ่ (`200 × $0.015 = $3.00`)"],
          ["`$16.00` (แพงขึ้นกว่าเดิม)", "ไม่จริง — แม้รวมค่าเรียกโมเดลเล็กก่อน escalate 200 เคส (`+$0.20`) ก็ยังแค่ `$4.00` เท่านั้น"],
        ],
        "B",
        "จากสูตร Expected Value: `(0.8 × 0.001 + 0.2 × 0.015) × 1,000 = $3.80` ประหยัดกว่า `$15.00` ถึง 74.7% และเมื่อรวม Prompt Caching ต้นทุนจะลดลงได้อีก",
        "คำนวณต้นทุนผสมของ 80/20 Routing ด้วยสูตร Expected Value อย่างไร?",
        "`blended_cost = total_reqs * (0.8 * small_cost + 0.2 * frontier_cost)` (และคูณ `1 - cache_hit_rate * cache_discount` เมื่อมี Prompt Caching)",
      ),
    ],
  },

  takeaways: [
    "ป้องกัน **Lost in the Middle** ด้วยการตัดข้อมูลขยะออก วางกฎหลัก/rubric ไว้ต้น prompt และวางเอกสารเป้าหมายหรือคำถามผู้ใช้ไว้ท้ายสุด",
    "ออกแบบ {{prompt-caching}} ให้ hit จริงด้วยกฎ **Immutable Static Prefix First**: ห้ามใส่ `timestamp`, `request_id` หรือข้อมูลรายบุคคลไว้ใน `system` message ด้านบน",
    "ใช้ **Tiered Model Routing (Small 80% / Frontier 20%)** โดย escalate เฉพาะเคสยาว, `confidence < threshold`, หรือ validate ไม่ผ่าน เพื่อลดค่า API กว่า 60%",
    "ติดตามทั้ง `cache_hit_rate` และ `escalation_rate` เสมอ เพื่อให้มั่นใจว่าการประหยัดต้นทุนเกิดขึ้นจริงใน production",
  ],

  reviewCards: [
    rc(
      "d079-rc-1",
      "กฎเหล็กของการจัดโครงสร้าง prompt เพื่อให้ได้ Prompt Caching hit rate สูงคืออะไร?",
      "วาง **Static Prefix ที่คงที่ 100%** (system rules, rubric, few-shot, reference docs) ไว้ด้านบนสุด และย้ายข้อมูล dynamic (`timestamp`, `request_id`, user query) ทั้งหมดไว้ท้ายสุด",
    ),
    rc(
      "d079-rc-2",
      "ปรากฏการณ์ Lost in the Middle คืออะไร และส่งผลต่อการจัดวางบริบทอย่างไร?",
      "LLM ดึงข้อมูลจากต้นและท้ายบริบทยาวได้แม่นกว่าช่วงตรงกลาง — จึงควรวางคำสั่งหลักไว้ตอนต้นและเอกสารเป้าหมายไว้ตอนท้ายสุด",
    ),
    rc(
      "d079-rc-3",
      "ทำไม Tiered Model Routing (Small 80% / Frontier 20%) ถึงลดต้นทุนได้เกิน 60% โดยไม่ลดคุณภาพ?",
      "เพราะงานส่วนใหญ่ ~80% เป็นเคสตรงไปตรงมาที่โมเดลเล็กถูกกว่า 10–20× ทำได้แม่นเท่ากัน ส่วนอีก ~20% ที่ยาว กำกวม หรือ confidence ต่ำ ค่อย escalate ไปโมเดลใหญ่",
    ),
  ],

  sources: [
    { label: "OpenAI API Docs — Prompt Caching", href: "https://platform.openai.com/docs/guides/prompt-caching" },
    { label: "Anthropic Docs — Prompt Caching", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching" },
    { label: "Paper — Lost in the Middle: How Language Models Use Long Contexts", href: "https://arxiv.org/abs/2307.03172" },
    { label: "OpenAI Docs — Latency & Cost Optimization", href: "https://platform.openai.com/docs/guides/latency-optimization" },
  ],

  glossary: ["prompt-caching", "context-engineering", "ttft", "caching", "few-shot", "expected-value", "llm", "mocking"],
});
