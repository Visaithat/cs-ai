import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D085 — Phase 3 / Block B22
 * When to Fine-Tune vs Prompt vs RAG (Decision Framework)
 */
export const d085: Lesson = defineLesson({
  day: 85,
  titleTh: "กรอบตัดสินใจเลือกวิธีปรับแต่ง LLM: Prompt Engineering vs RAG vs Fine-Tuning",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · สร้าง Decision Engine และคำนวณจุดคุ้มทุนของ Fine-Tuning ด้วย Pydantic v2",
  icon: "scale",
  visual: {
    id: "finetune-vs-rag-lora",
    title: "Decision Framework: Prompt vs RAG vs Fine-Tune & กลไก LoRA Adapter",
    caption: "สลับดูผังตัดสินใจเลือกวิธีแก้ปัญหา (ข้อมูลใหม่ใช้ RAG, สไตล์/โครงสร้างคงที่ใช้ Fine-Tune) กับหลักการทำงานของ LoRA",
    alt: "แผนภาพผังตัดสินใจ Prompt vs RAG vs Fine-Tune และโครงสร้าง LoRA",
  },
  requiresApiKey: false,
  tools: ["Pydantic v2", "SDK", "Ollama", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "วินิจฉัยต้นตอปัญหาให้ถูกก่อนเลือกเครื่องมือ",
      body: "ข้อผิดพลาดที่แพงที่สุดในโปรเจกต์ {{llm}} คือรีบไปทำ Fine-Tuning ตั้งแต่สัปดาห์แรก ทั้งที่ปัญหาจริงเกิดจากคำสั่งไม่ชัด (แก้ด้วย {{context-engineering}}) หรือโมเดลไม่มีข้อมูลล่าสุดขององค์กร (แก้ด้วย {{rag}})",
      lessonNote: "วันนี้เราวาง Escalation Ladder 3 ขั้น: Prompt → RAG → Fine-Tune พร้อมเมทริกซ์แยก \"ความรู้\" ออกจาก \"พฤติกรรม\"",
    },
    {
      node: 2,
      heading: "เลือกวิธีปรับโมเดลที่คุ้มเวลาและคุ้มต้นทุนที่สุด",
      body: "{{rag}} เติมข้อเท็จจริงที่อัปเดตได้ทันทีและอ้างอิงแหล่งที่มาได้ ส่วน Fine-Tuning ({{lora}}) ปรับน้ำหนักภายในโมเดลเพื่อล็อกสไตล์ น้ำเสียง โครงสร้าง หรือย่อขนาดโมเดลให้ถูกลงและเร็วขึ้น",
      lessonNote: "เราจะเขียน Decision Engine เชิงกฎด้วย {{pydantic}} v2 ที่ให้คำแนะนำชัดเจนพร้อมเหตุผลประกอบ",
    },
    {
      node: 3,
      heading: "ห้ามข้ามไป Fine-Tune จนกว่า Eval บน Golden Dataset จะชี้ว่าถึงทางตันแล้ว",
      body: "หากยังไม่เคยวัดผล baseline บน {{golden-dataset}} เราจะไม่รู้เลยว่า Fine-Tuning ช่วยให้แม่นยำขึ้นจริง หรือแค่เสียเงินเทรนทับปัญหาที่แก้ได้ใน 10 นาทีด้วย {{few-shot}}",
      lessonNote: "แบบฝึกหัดวันนี้บังคับเช็กเงื่อนไข `eval_baseline_done` ก่อนอนุญาตให้แนะนำ Fine-Tuning",
    },
    {
      node: 5,
      heading: "เทียบต้นทุนรวมระยะยาว (TCO) ก่อนผูกมัดกับโมเดลที่เทรนเอง",
      body: "โมเดลที่ Fine-Tune เองมีต้นทุนแฝงทั้งการดูแลชุดข้อมูล การเทรนซ้ำเมื่อฐานโมเดลรุ่นใหม่ออก และการโฮสต์ (เช่น {{vllm}} หรือ dedicated endpoint) จึงต้องคำนวณจุดคุ้มทุนด้วย {{expected-value}} เสมอ",
      lessonNote: "เราจะเขียนฟังก์ชันคำนวณจุดคุ้มทุน (Break-Even Months) เทียบ Prompt ยาวกับ Fine-Tuned Small Model",
    },
  ],

  objectives: [
    "**จำแนก** ปัญหาของระบบ {{llm}} ออกเป็น *ปัญหาด้านความรู้ (Knowledge)* กับ *ปัญหาด้านพฤติกรรม/รูปแบบ (Behavior & Style)* เพื่อเลือกใช้ {{context-engineering}}, {{rag}} หรือ Fine-Tuning ได้ตรงจุด",
    "**ประยุกต์ใช้** Escalation Ladder (Prompt → RAG → Fine-Tune) และเงื่อนไข Eval Plateau ก่อนตัดสินใจลงทุนทำ Fine-Tuning",
    "**เขียนโค้ด** Decision Engine ด้วย {{pydantic}} v2 และคำนวณจุดคุ้มทุนรายเดือน (Break-Even Analysis) ระหว่าง Prompting กับ Fine-Tuning บนเครื่องได้ 100%",
  ],

  prerequisites: [
    "{{context-engineering}}, {{few-shot}} และ {{structured-output}} (Days 74 & 77)",
    "{{prompt-caching}}, Model Routing และ Local Ollama พื้นฐาน (Days 79 & 83)",
    "แนวคิด {{expected-value}} และ {{pydantic}} v2 + `pytest`",
    "รันได้ 100% บนเครื่องคุณ ไม่ต้องใช้ GPU หรือ API key",
  ],

  setup: {
    intro: "สร้างโปรเจกต์ด้วย {{uv}} เพื่อทดลองสร้างกรอบตัดสินใจ Prompt vs RAG vs Fine-Tune และจำลองจุดคุ้มทุนด้วย Pydantic v2 บนเครื่อง",
    commands: `uv init ai-day85 && cd ai-day85
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import pydantic; print('Day 85 Ready | Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day85` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งตรวจสภาพแวดล้อมผ่านโดยไม่ต้องใช้ API key"],
    ],
    note: "เนื้อหาวันนี้เป็นสะพานเชื่อมจาก Core LLM (Block B19–B21) ไปสู่กลไก LoRA/QLoRA (Day 86) และการวางพิมพ์เขียว Phase 3 Mini-Project (Day 87)",
  },

  concepts: [
    {
      id: "escalation-ladder",
      title: "1 · บันได 3 ขั้น (Escalation Ladder): Prompt → RAG → Fine-Tune",
      paragraphs: [
        "ทีมวิศวกร AI ที่ทำงานเร็วและไม่ผลาญงบจะไม่เริ่มต้นโปรเจกต์ด้วยการ Fine-Tune โมเดล แต่จะไต่ **Escalation Ladder** จากคันโยกที่ถูกที่สุดและปรับแก้เร็วที่สุดก่อนเสมอ:",
        "**ขั้นที่ 1 — {{context-engineering}} + {{few-shot}} + {{structured-output}}**: ใช้เวลาหลักชั่วโมง ไม่มีต้นทุนเทรน เปลี่ยนกฎได้ทันทีที่แก้ไฟล์ prompt เหมาะกับงานสกัดเอกสาร คัดแยกหมวดหมู่ และสรุปความส่วนใหญ่ถึง 70%–80%",
        "**ขั้นที่ 2 — {{rag}} (Retrieval-Augmented Generation)**: เพิ่มเมื่อโมเดลขาดข้อเท็จจริงภายในองค์กร นโยบายที่เปลี่ยนทุกเดือน หรือคลังเอกสารนับหมื่นหน้า ใช้เวลาสร้างหลักวัน และอัปเดตความรู้ได้ทันทีแค่ re-index เอกสาร",
        "**ขั้นที่ 3 — Fine-Tuning ({{lora}} / SFT)**: ใช้เป็นทางเลือกสุดท้าย *เฉพาะเมื่อ* ผลวัดบน {{golden-dataset}} พิสูจน์แล้วว่า Prompt + RAG ถึงทางตัน (plateau) หรือต้องการอัดความรู้เชิงสไตล์/รูปแบบจากโมเดลใหญ่ลงโมเดลเล็ก (Distillation) เพื่อลด latency และต้นทุนในปริมาณคำขอสูงมาก",
      ],
      analogy: "เหมือนการเตรียมพนักงานใหม่เข้าทีม: ขั้น 1 คือเขียนคู่มือเช็กลิสต์ให้ชัด (Prompt), ขั้น 2 คือเปิดสิทธิ์เข้าฐานข้อมูลบริษัทให้ค้นหาได้ตลอดเวลา (RAG), ส่วนขั้น 3 คือส่งไปเรียนหลักสูตรเฉพาะทาง 3 เดือน (Fine-Tune) — คงไม่มีใครส่งพนักงานไปเรียน 3 เดือนเพียงเพราะลืมให้รหัสเข้า Wiki บริษัท",
      bullets: [
        "**Iteration Speed**: Prompt แก้ได้ใน 5 นาที · RAG อัปเดตเอกสารในไม่กี่นาที · Fine-Tune ใช้เวลาเตรียมข้อมูล + เทรน + ประเมินผลหลายวัน",
        "**Reversibility**: Prompt & RAG ย้อนกลับได้ทันที · Fine-Tune ผูกกับ checkpoint เวอร์ชันหนึ่งและต้องเทรนใหม่เมื่อเปลี่ยนฐานโมเดล",
        "**กฎเหล็ก**: ห้ามข้ามไปขั้นที่ 3 ถ้ายังไม่มีตัวเลข Baseline Eval จากขั้นที่ 1–2",
      ],
      whyTitle: "Why this matters — กันโปรเจกต์เสียเวลา 2 เดือนกับปัญหาที่แก้ได้ใน 2 ชั่วโมง",
      whyParagraphs: [
        "ในองค์กรจริง มักมีคำขอว่า \"อยาก Fine-Tune LLM ให้รู้จักสินค้าทั้งหมดของบริษัท\" ทั้งที่ราคาสินค้าและโปรโมชันเปลี่ยนทุกสัปดาห์ — การ Fine-Tune ข้อเท็จจริงที่เปลี่ยนบ่อยจะทำให้โมเดลจำข้อมูลเก่าและเกิด {{hallucination}} ทันทีที่โปรโมชันหมดอายุ",
        "การไต่ Escalation Ladder ช่วยให้คุณส่งมอบเวอร์ชันแรกที่วัดผลได้ในสัปดาห์แรก และเก็บงบ Fine-Tuning ไว้ใช้ในจุดที่สร้างความได้เปรียบจริงเท่านั้น",
      ],
    },
    {
      id: "knowledge-vs-behavior",
      title: "2 · เมทริกซ์แยก \"ความรู้ (Knowledge)\" ออกจาก \"พฤติกรรม (Behavior)\"",
      paragraphs: [
        "วิธีตัดสินใจที่แม่นที่สุดคือถามคำถามเดียวก่อนเสมอ: **โมเดลพลาดเพราะ *ไม่รู้ข้อเท็จจริง* หรือพลาดเพราะ *ทำพฤติกรรม/รูปแบบไม่ตรงใจ*?**",
        "หากเป็นเรื่อง **ความรู้ (Knowledge)** — เช่น นโยบายเคลมสินค้าไทยปีล่าสุด, สิทธิ์การเข้าถึงเอกสารแยกตามแผนก ({{acl}}), หรือคำตอบที่ต้องมีหลักฐานอ้างอิงตรวจย้อนได้ ({{groundedness}}) — คำตอบคือ **{{rag}}** เพราะเราสลับเอกสารในฐานข้อมูลได้แบบเรียลไทม์และบังคับอ้างอิง `[doc_id]` ได้ชัดเจน",
        "หากเป็นเรื่อง **พฤติกรรม (Behavior & Efficiency)** — เช่น ต้องเขียนสำนวนกฎหมายหรือแพทย์ภาษาไทยเฉพาะทางที่อธิบายด้วยคำสั่งยาว ๆ แล้วยังเพี้ยน, ต้องย่อโมเดล Frontier ลงโมเดล 7B/8B เพื่อรันบนเครื่องหรือลด latency ต่ำกว่า 300ms, หรือต้องตัด system prompt ยาว 4,000 tokens ออกให้หมดเพราะยิงเดือนละหลายล้านครั้ง — นี่คือพื้นที่ที่ **Fine-Tuning** ชนะขาด และในงานระดับองค์กรจำนวนมาก เรายังใช้ **RAG + Fine-Tune คู่กัน** ได้ด้วย (RAG ดึงข้อเท็จจริงล่าสุด + Fine-Tuned Model ตอบตามสไตล์และรูปแบบที่แม่นยำ)",
      ],
      analogy: "RAG เหมือน \"การสอบแบบเปิดหนังสือ (Open-Book Exam)\" ที่ข้อมูลสดใหม่และอ้างอิงเลขหน้าได้ตลอด ส่วน Fine-Tuning เหมือน \"การฝึกทักษะกล้ามเนื้อ\" เช่น การเขียนสำนวนทางการแพทย์หรือการแปลศัพท์เฉพาะให้คล่องเป็นธรรมชาติโดยไม่ต้องเปิดพจนานุกรมทุกคำ",
      code: {
        language: "python",
        filename: "decision_matrix.py",
        code: `from typing import Literal


def quick_triage(
    *,
    needs_fresh_facts: bool,
    needs_citations: bool,
    prompt_rag_plateaued: bool,
    needs_strict_style_or_distillation: bool,
) -> Literal["prompt_engineering", "rag", "fine_tune", "rag_plus_finetune"]:
    wants_rag = needs_fresh_facts or needs_citations
    wants_ft = prompt_rag_plateaued and needs_strict_style_or_distillation

    if wants_rag and wants_ft:
        return "rag_plus_finetune"
    if wants_rag:
        return "rag"
    if wants_ft:
        return "fine_tune"
    return "prompt_engineering"


print("FAQ นโยบายเปลี่ยนทุกเดือน:", quick_triage(
    needs_fresh_facts=True, needs_citations=True,
    prompt_rag_plateaued=False, needs_strict_style_or_distillation=False,
))
print("ย่อ Frontier -> 8B สกัดเอกสารเฉพาะทาง:", quick_triage(
    needs_fresh_facts=False, needs_citations=False,
    prompt_rag_plateaued=True, needs_strict_style_or_distillation=True,
))`,
        caption: "แยกแกน Knowledge (RAG) กับแกน Behavior/Distillation (Fine-Tune) ออกจากกัน — สองวิธีนี้ไม่ได้หักล้างกันแต่ทำงานเสริมกันได้",
      },
      whyTitle: "Why this matters — RAG ไม่ได้ทดแทน Fine-Tune และ Fine-Tune ก็ไม่ได้ทดแทน RAG",
      whyParagraphs: [
        "Fine-Tuning ไม่สามารถลบความลับของลูกค้า A ออกจากน้ำหนักโมเดลตอนลูกค้า B ถามได้ จึงทำ {{acl}} แยกสิทธิ์ผู้ใช้ไม่ได้เหมือน RAG และไม่สามารถรับประกัน {{groundedness}} ได้เมื่อข้อมูลเปลี่ยน",
        "ในทางกลับกัน RAG ไม่ได้ช่วยให้โมเดลขนาด 3B เลียนแบบรูปแบบ JSON ซับซ้อนหรือสำนวนเฉพาะทางได้ดีขึ้นเท่ากับการเทรนด้วยตัวอย่างคุณภาพสูง การแยก 2 แกนนี้ให้ขาดทำให้คุณออกแบบสถาปัตยกรรมได้อย่างมืออาชีพ",
      ],
    },
    {
      id: "finetune-economics-breakeven",
      title: "3 · เศรษฐศาสตร์ของ Fine-Tuning: เมื่อไรถึงคุ้มจุดคุ้มทุน (Break-Even)",
      paragraphs: [
        "แม้ผลทดสอบจะยืนยันว่า Fine-Tuned Small Model ให้คุณภาพเท่ากับ Frontier Model + Prompt ยาว 3,000 tokens แต่ในโลกธุรกิจเราต้องคำนวณ **Total Cost of Ownership (TCO)** ด้วยเสมอ ไม่ใช่ดูแค่ราคาต่อ 1M tokens",
        "ต้นทุนของ Fine-Tuning ประกอบด้วย 3 ก้อน: (1) **ค่าเตรียมและทำความสะอาดข้อมูล** (วิศวกร + ผู้เชี่ยวชาญโดเมนตรวจสอบ 500–2,000 ตัวอย่าง — มักแพงกว่าค่า GPU หลายเท่า), (2) **ค่าเทรนและรัน Eval** ต่อรอบ, และ (3) **ค่าโฮสต์รายเดือนคงที่** หากต้องเปิด GPU เครื่องเอง (เช่น {{vllm}} บนคลาวด์)",
        "หากทราฟฟิกของคุณมีเพียง 10,000 คำขอ/เดือน การใช้ Frontier/Small API + {{prompt-caching}} มักถูกกว่ามาก แต่เมื่อทราฟฟิกแตะ 500,000–5,000,000 คำขอ/เดือน ส่วนต่างต้นทุนต่อคำขอที่ลดลงจะคืนทุนค่าเตรียมข้อมูลได้ภายในไม่กี่เดือน",
      ],
      analogy: "เหมือนการซื้อเครื่องชงกาแฟเอสเปรสโซราคา 60,000 บาทไว้ที่ออฟฟิศ: ถ้ากินกันวันละ 2 แก้ว ซื้อร้านข้างล่างถูกกว่าเยอะ แต่ถ้าพนักงาน 200 คนดื่มกันวันละ 300 แก้ว เครื่องชงเองจะคืนทุนภายในไม่กี่เดือน",
      bullets: [
        "**ปริมาณน้อย (< 50k req/เดือน)**: Prompting + {{prompt-caching}} + Model Routing มักคุ้มกว่าเกือบทุกกรณี",
        "**ปริมาณสูง + Latency เข้มงวด (< 300ms)**: Distillation จาก Frontier ลงโมเดล 7B/8B ด้วย {{lora}} เริ่มคุ้มทุนชัดเจน",
        "**สูตรจุดคุ้มทุน**: `breakeven_months = upfront_cost / monthly_net_savings` (ต้องหักค่าโฮสต์รายเดือนที่เพิ่มขึ้นออกด้วย)",
      ],
      whyTitle: "Why this matters — วิศวกร AI ระดับ Senior ตัดสินใจด้วยตัวเลข ไม่ใช่ความตื่นเต้น",
      whyParagraphs: [
        "ผู้บริหารและ Tech Lead จะถามเสมอว่า \"ถ้าลงทุนเทรนโมเดลเอง กี่เดือนคืนทุน และเสี่ยงอะไรบ้างถ้าเดือนหน้ามีโมเดลฐานรุ่นใหม่ออกมา?\"",
        "การทำ Break-Even Model ง่าย ๆ เป็นโค้ด Python ช่วยให้ข้อเสนอเชิงสถาปัตยกรรมของคุณน่าเชื่อถือและตรวจสอบได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Prompt vs RAG vs Fine-Tune ≈ Config vs Database vs Custom Compiler",
      body: [
        "ในงานพัฒนาเว็บ คุณไม่คอมไพล์ราคาสินค้าลงไปใน binary โค้ด (Hard-code) แต่เก็บไว้ในฐานข้อมูลแล้ว query มาใช้ — การทำ Fine-Tune เพื่อยัดข้อมูลสินค้าที่เปลี่ยนทุกวันก็เหมือนการ hard-code ข้อมูลลง binary แล้วต้อง rebuild แอปทุกครั้งที่เปลี่ยนราคา!",
        "มอง Prompt เป็น **Runtime Config / Feature Flag**, มอง RAG เป็น **Database / Search Query**, และมอง Fine-Tuning เป็น **การสร้าง Optimized Custom Service หรือ Compiled Binary** เมื่อระบบสเกลใหญ่จนคุ้มค่าบำรุงรักษา",
      ],
      table: [
        ["Prompt / Context Engineering", "Runtime Config / Template (แก้เร็ว ไม่ต้อง deploy ใหม่)"],
        ["RAG (Retrieval + Citations)", "Database / Search Index Query (ข้อมูลสด อัปเดตเรียลไทม์ + ACL)"],
        ["Fine-Tuning (LoRA / SFT)", "Custom Compiled Service (สร้างยากกว่า แต่เร็วและถูกเมื่อสเกลสูง)"],
        ["Golden Dataset Eval Plateau", "Load Test / Profiling Report ก่อนตัดสินใจ Rewrite ระบบ"],
      ],
    },
    student: {
      title: "First-Year Note — อย่าเพิ่งหลงเชื่อคำว่า \"Fine-Tune ให้ฉลาดขึ้น\"",
      body: [
        "เวลานักศึกษาได้ยินคำว่า Fine-Tuning มักเข้าใจผิดว่ามันคือปุ่มวิเศษที่ทำให้โมเดลฉลาดขึ้นทุกเรื่อง แต่ในความเป็นจริง Fine-Tuning เก่งเรื่อง **ปรับรูปแบบการตอบและถ่ายทอดทักษะเฉพาะทาง** มากกว่าการยัดความจำใหม่",
        "จำกฎง่าย ๆ 3 บรรทัดนี้ไว้สอบและสัมภาษณ์งาน: **อยากเปลี่ยนพฤติกรรม/ลดขนาดโมเดล → Fine-Tune**, **อยากเติมข้อมูลใหม่/อ้างอิงแหล่งที่มาได้ → RAG**, และ **เริ่มจาก Prompt + Eval เสมอ**!",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ทีมผลิตภัณฑ์ไทยเสนอโปรเจกต์ AI มา 3 โจทย์ เราจะเขียน Decision Engine ด้วย Pydantic v2 เพื่อจัดหมวดกลยุทธ์ที่เหมาะสมและคำนวณจุดคุ้มทุนของ Fine-Tuning",
    steps: [
      {
        title: "1 · นิยาม Schema สำหรับโปรไฟล์โจทย์และคำแนะนำเชิงสถาปัตยกรรม",
        explain: "เก็บสัญญาณสำคัญ 6 อย่าง: ความถี่การเปลี่ยนของข้อมูล, ความจำเป็นต้องอ้างอิงแหล่งที่มา, ความจำเป็นต้องปรับสไตล์/ลดขนาดโมเดล, การทำ Baseline Eval แล้วหรือยัง, และปริมาณคำขอรายเดือน",
        code: {
          language: "python",
          filename: "worked_day85.py",
          code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class UseCaseSpec(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    knowledge_changes: Literal["static", "monthly", "daily"]
    requires_citations_or_acl: bool
    needs_specialized_style_or_distillation: bool
    eval_baseline_done: bool
    prompt_rag_plateaued: bool
    monthly_requests: int = Field(gt=0)


class StrategyRecommendation(BaseModel):
    strategy: Literal["eval_first", "prompt_engineering", "rag", "fine_tune", "rag_plus_finetune"]
    reasons: list[str]`,
        },
        output: `Defined UseCaseSpec and StrategyRecommendation Pydantic models.`,
      },
      {
        title: "2 · เขียนฟังก์ชันตัดสินใจตาม Escalation Ladder",
        explain: "หากยังไม่ทำ Baseline Eval และกำลังพิจารณา Fine-Tune ให้สั่ง `eval_first` ก่อนเสมอ มิฉะนั้นแยกแกน RAG (ความรู้สด/อ้างอิง) และแกน Fine-Tune (สไตล์/distillation ที่พิสูจน์ว่า plateau แล้ว)",
        code: {
          language: "python",
          filename: "worked_day85.py",
          code: `def decide_strategy(spec: UseCaseSpec) -> StrategyRecommendation:
    reasons: list[str] = []
    needs_rag = spec.knowledge_changes != "static" or spec.requires_citations_or_acl

    if not spec.eval_baseline_done:
        reasons.append("ยังไม่มี Golden Dataset Baseline — ต้องเริ่มจาก Prompt/Context + Eval ก่อนเสมอ")
        if needs_rag:
            reasons.append("มีข้อมูลที่เปลี่ยนบ่อยหรือต้องอ้างอิง/ACL จึงควรวางแผนเพิ่ม RAG หลังมี Baseline")
        return StrategyRecommendation(strategy="eval_first", reasons=reasons)

    can_ft = spec.needs_specialized_style_or_distillation and spec.prompt_rag_plateaued

    if needs_rag and can_ft:
        reasons.append("ต้องใช้ข้อมูลสด/อ้างอิง (RAG) ร่วมกับสไตล์หรือการย่อโมเดลที่ Prompt ถึงทางตันแล้ว (Fine-Tune)")
        return StrategyRecommendation(strategy="rag_plus_finetune", reasons=reasons)
    if needs_rag:
        reasons.append("ปัญหาหลักคือข้อมูลอัปเดต/สิทธิ์การเข้าถึง/การอ้างอิง — ใช้ RAG แทนการฝังความรู้ลงน้ำหนักโมเดล")
        return StrategyRecommendation(strategy="rag", reasons=reasons)
    if can_ft:
        reasons.append("Baseline Eval ยืนยันว่า Prompt ถึงทางตัน และงานเน้นรูปแบบเฉพาะหรือ Distillation")
        return StrategyRecommendation(strategy="fine_tune", reasons=reasons)

    reasons.append("งานยังไม่ติดข้อจำกัดความรู้สดหรือ Eval Plateau — ปรับด้วย Prompt Engineering + Few-Shot คุ้มที่สุด")
    return StrategyRecommendation(strategy="prompt_engineering", reasons=reasons)


cases = [
    UseCaseSpec(
        name="บอทตอบโปรโมชันรายวัน",
        knowledge_changes="daily",
        requires_citations_or_acl=True,
        needs_specialized_style_or_distillation=False,
        eval_baseline_done=True,
        prompt_rag_plateaued=False,
        monthly_requests=80_000,
    ),
    UseCaseSpec(
        name="ย่อ Frontier -> 8B สกัดใบเสร็จ 2M ใบ/เดือน",
        knowledge_changes="static",
        requires_citations_or_acl=False,
        needs_specialized_style_or_distillation=True,
        eval_baseline_done=True,
        prompt_rag_plateaued=True,
        monthly_requests=2_000_000,
    ),
]
for c in cases:
    rec = decide_strategy(c)
    print(f"{c.name} -> {rec.strategy} | {rec.reasons[0]}")`,
        },
        output: `บอทตอบโปรโมชันรายวัน -> rag | ปัญหาหลักคือข้อมูลอัปเดต/สิทธิ์การเข้าถึง/การอ้างอิง — ใช้ RAG แทนการฝังความรู้ลงน้ำหนักโมเดล
ย่อ Frontier -> 8B สกัดใบเสร็จ 2M ใบ/เดือน -> fine_tune | Baseline Eval ยืนยันว่า Prompt ถึงทางตัน และงานเน้นรูปแบบเฉพาะหรือ Distillation`,
      },
      {
        title: "3 · คำนวณจุดคุ้มทุนรายเดือน (Break-Even Analysis)",
        explain: "เทียบต้นทุน Prompting API (เช่น `$0.004`/คำขอ) กับ Fine-Tuned Small Model (`$0.0006`/คำขอ + ค่าโฮสต์ `$400`/เดือน + ค่าเตรียมข้อมูลและเทรนเริ่มต้น `$3,000`)",
        code: {
          language: "python",
          filename: "worked_day85.py",
          code: `def breakeven_months(
    *,
    monthly_requests: int,
    prompt_cost_per_req: float,
    ft_cost_per_req: float,
    ft_fixed_monthly_hosting: float,
    ft_upfront_cost: float,
) -> float | None:
    monthly_prompt = monthly_requests * prompt_cost_per_req
    monthly_ft = monthly_requests * ft_cost_per_req + ft_fixed_monthly_hosting
    monthly_savings = monthly_prompt - monthly_ft
    if monthly_savings <= 0:
        return None  # ไม่คุ้มทุนในระดับทราฟฟิกนี้
    return round(ft_upfront_cost / monthly_savings, 2)


for vol in [50_000, 300_000, 1_000_000]:
    m = breakeven_months(
        monthly_requests=vol,
        prompt_cost_per_req=0.004,
        ft_cost_per_req=0.0006,
        ft_fixed_monthly_hosting=400.0,
        ft_upfront_cost=3000.0,
    )
    print(f"Volume {vol:>9,}/mo -> Break-even: {m if m is not None else 'Never (Prompt cheaper)'} months")`,
        },
        output: `Volume    50,000/mo -> Break-even: Never (Prompt cheaper) months
Volume   300,000/mo -> Break-even: 4.84 months
Volume 1,000,000/mo -> Break-even: 1.0 months`,
      },
    ],
    gotcha: "จุดพลาดที่พบบ่อยในการคิดจุดคุ้มทุน: ลืมบวก **ค่าแรงทำความสะอาดข้อมูล (Data Curation)** และ **ค่าโฮสต์ GPU รายเดือน** เข้าไปในฝั่ง Fine-Tuning — ต่อให้ค่า GPU ตอนเทรนแค่ `$20` แต่ค่าแรงทีมตรวจข้อมูล 1,000 แถวและค่าเช่าเซิร์ฟเวอร์อาจสูงกว่าหลายสิบเท่า",
  },

  practice: {
    intro: "สร้างโมดูลตัดสินใจทางสถาปัตยกรรม `exercise_day85.py` สำหรับเลือก Prompt vs RAG vs Fine-Tune และคำนวณจุดคุ้มทุนรายเดือน พร้อมตรวจสอบทุกกรณีด้วย `pytest` บนเครื่อง",
    requirements: [
      "สร้าง `UseCaseProfile(BaseModel)` ตั้ง `ConfigDict(extra=\"forbid\")` มีฟิลด์: `knowledge_freshness: Literal[\"static\", \"periodic\", \"realtime\"]`, `requires_citations: bool`, `requires_acl: bool`, `needs_domain_style_or_distillation: bool`, `eval_baseline_done: bool`, `prompt_rag_plateaued: bool`, `latency_sla_ms: int = Field(gt=0)`, `monthly_requests: int = Field(gt=0)`",
      "สร้าง `AdaptationDecision(BaseModel)` มีฟิลด์: `strategy: Literal[\"eval_first\", \"prompt_engineering\", \"rag\", \"fine_tune\", \"rag_plus_finetune\"]`, `needs_rag: bool`, `justified_for_finetune: bool`, `rationale: list[str]` (ต้องมีอย่างน้อย 1 ข้อความ)",
      "สร้างฟังก์ชัน `recommend_strategy(profile: UseCaseProfile) -> AdaptationDecision`: (1) `needs_rag` เป็น `True` เมื่อ `knowledge_freshness != \"static\"` หรือ `requires_citations` หรือ `requires_acl`, (2) หาก `eval_baseline_done` เป็น `False` ต้องคืน `strategy=\"eval_first\"` และ `justified_for_finetune=False` เสมอ, (3) `justified_for_finetune` เป็น `True` เมื่อ `eval_baseline_done and prompt_rag_plateaued and (needs_domain_style_or_distillation or latency_sla_ms <= 300)`, (4) เลือก `rag_plus_finetune`, `rag`, `fine_tune` หรือ `prompt_engineering` ตามค่า `needs_rag` และ `justified_for_finetune`",
      "สร้างฟังก์ชัน `compute_finetune_breakeven_months(monthly_requests: int, prompt_cost_per_req: float, ft_cost_per_req: float, ft_monthly_hosting: float, ft_upfront_cost: float) -> float | None` ที่ validate ว่า `monthly_requests > 0` และต้นทุนทุกตัว `>= 0` (ไม่งั้น `raise ValueError`), คืน `None` หากประหยัดสุทธิต่อเดือน `<= 0`, มิฉะนั้นคืนจำนวนเดือนคืนทุนปัดทศนิยม 2 ตำแหน่ง",
    ],
    starter: {
      language: "python",
      filename: "exercise_day85.py",
      code: `from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class UseCaseProfile(BaseModel):
    # TODO: ตั้ง ConfigDict(extra="forbid") และประกาศฟิลด์ให้ครบ
    pass


class AdaptationDecision(BaseModel):
    strategy: Literal["eval_first", "prompt_engineering", "rag", "fine_tune", "rag_plus_finetune"]
    needs_rag: bool
    justified_for_finetune: bool
    rationale: list[str] = Field(min_length=1)


def recommend_strategy(profile: UseCaseProfile) -> AdaptationDecision:
    """ตัดสินใจเลือก Prompt / RAG / Fine-Tune ตาม Escalation Ladder."""
    # TODO: implement
    raise NotImplementedError


def compute_finetune_breakeven_months(
    monthly_requests: int,
    prompt_cost_per_req: float,
    ft_cost_per_req: float,
    ft_monthly_hosting: float,
    ft_upfront_cost: float,
) -> float | None:
    """คำนวณจำนวนเดือนคืนทุนของ Fine-Tuning (คืน None หากไม่คุ้มทุน)."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day85.py",
      code: `import pytest
from exercise_day85 import (
    UseCaseProfile,
    compute_finetune_breakeven_months,
    recommend_strategy,
)


def test_blocks_finetune_when_no_baseline_eval():
    p = UseCaseProfile(
        knowledge_freshness="static",
        requires_citations=False,
        requires_acl=False,
        needs_domain_style_or_distillation=True,
        eval_baseline_done=False,
        prompt_rag_plateaued=True,
        latency_sla_ms=250,
        monthly_requests=500_000,
    )
    res = recommend_strategy(p)
    assert res.strategy == "eval_first"
    assert res.justified_for_finetune is False


def test_rag_for_fresh_facts_and_acl():
    p = UseCaseProfile(
        knowledge_freshness="realtime",
        requires_citations=True,
        requires_acl=True,
        needs_domain_style_or_distillation=False,
        eval_baseline_done=True,
        prompt_rag_plateaued=False,
        latency_sla_ms=1500,
        monthly_requests=50_000,
    )
    res = recommend_strategy(p)
    assert res.strategy == "rag"
    assert res.needs_rag is True
    assert res.justified_for_finetune is False


def test_finetune_and_hybrid_cases():
    ft_only = UseCaseProfile(
        knowledge_freshness="static",
        requires_citations=False,
        requires_acl=False,
        needs_domain_style_or_distillation=True,
        eval_baseline_done=True,
        prompt_rag_plateaued=True,
        latency_sla_ms=800,
        monthly_requests=1_000_000,
    )
    assert recommend_strategy(ft_only).strategy == "fine_tune"

    hybrid = ft_only.model_copy(update={"knowledge_freshness": "periodic", "requires_citations": True})
    res_h = recommend_strategy(hybrid)
    assert res_h.strategy == "rag_plus_finetune"
    assert res_h.needs_rag is True and res_h.justified_for_finetune is True


def test_breakeven_calculation_and_validation():
    assert compute_finetune_breakeven_months(50_000, 0.004, 0.0006, 400.0, 3000.0) is None
    assert compute_finetune_breakeven_months(1_000_000, 0.004, 0.0006, 400.0, 3000.0) == 1.0
    assert compute_finetune_breakeven_months(300_000, 0.004, 0.0006, 400.0, 3000.0) == 4.84
    with pytest.raises(ValueError):
        compute_finetune_breakeven_months(0, 0.004, 0.001, 100.0, 1000.0)
    with pytest.raises(ValueError):
        compute_finetune_breakeven_months(1000, -0.01, 0.001, 100.0, 1000.0)
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 4 test cases บนเครื่องโดยไม่ต้องใช้ API key",
      "ตรวจสอบว่าหาก `eval_baseline_done=False` ฟังก์ชันต้องคืน `strategy=\"eval_first\"` เสมอ แม้ผู้ใช้จะอยาก Fine-Tune",
      "ตรวจสอบว่าเคสที่ต้องการข้อมูลอัปเดต/อ้างอิงพร้อมสไตล์เฉพาะทางที่ plateau แล้วคืน `rag_plus_finetune`",
      "ตรวจสอบว่า `compute_finetune_breakeven_months` คืน `None` เมื่อทราฟฟิกต่ำเกินกว่าจะคุ้มค่าโฮสต์รายเดือน",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day85.py` ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "เริ่มจากการคำนวณ boolean 2 ตัวก่อน: `needs_rag` และ `justified_for_finetune` แต่ต้องเช็กเงื่อนไข `if not profile.eval_baseline_done:` ตัดจบก่อนทุกอย่าง",
      },
      {
        body: "ใน `compute_finetune_breakeven_months` คำนวณ `monthly_savings = (monthly_requests * prompt_cost_per_req) - (monthly_requests * ft_cost_per_req + ft_monthly_hosting)` ถ้า `<= 0` คืน `None` มิฉะนั้นคืน `round(ft_upfront_cost / monthly_savings, 2)`",
      },
      {
        body: "โครงของ `recommend_strategy` เกือบครบแล้ว — เหลือเติม `UseCaseProfile` และ `compute_finetune_breakeven_months`",
        code: {
          language: "python",
          filename: "hint_day85.py",
          code: `def recommend_strategy(profile: UseCaseProfile) -> AdaptationDecision:
    needs_rag = (
        profile.knowledge_freshness != "static"
        or profile.requires_citations
        or profile.requires_acl
    )
    if not profile.eval_baseline_done:
        return AdaptationDecision(
            strategy="eval_first",
            needs_rag=needs_rag,
            justified_for_finetune=False,
            rationale=["ต้องสร้าง Golden Dataset และวัด Baseline Eval ก่อนตัดสินใจ Fine-Tune"],
        )

    justified_ft = profile.prompt_rag_plateaued and (
        profile.needs_domain_style_or_distillation or profile.latency_sla_ms <= 300
    )
    if needs_rag and justified_ft:
        strategy = "rag_plus_finetune"
    elif needs_rag:
        strategy = "rag"
    elif justified_ft:
        strategy = "fine_tune"
    else:
        strategy = "prompt_engineering"

    return AdaptationDecision(
        strategy=strategy,
        needs_rag=needs_rag,
        justified_for_finetune=justified_ft,
        rationale=[f"Selected {strategy} (needs_rag={needs_rag}, justified_ft={justified_ft})"],
    )`,
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
      title: "ใช้ Fine-Tuning เพื่ออัปเดตข้อเท็จจริงหรือข้อมูลสินค้าที่เปลี่ยนบ่อย",
      symptom: "เทรนโมเดลด้วยรายการราคาสินค้าปี 2026 พอเดือนถัดไปเปลี่ยนโปรโมชัน โมเดลยังตอบราคาเก่าและแต่งข้อมูลผสม ({{hallucination}})",
      fix: "ข้อมูลที่เปลี่ยนได้หรือต้องอ้างอิงแหล่งที่มาต้องใช้ {{rag}} เสมอ เพื่อให้แก้เอกสารในฐานข้อมูลแล้วคำตอบอัปเดตทันที",
    },
    {
      title: "กระโดดไป Fine-Tune ตั้งแต่ยังไม่มี Golden Dataset Baseline",
      symptom: "เสียเวลาเทรน 2 สัปดาห์แล้วไม่รู้ด้วยซ้ำว่าโมเดลใหม่ดีขึ้นกว่าเดิมกี่เปอร์เซ็นต์ หรือจริง ๆ แล้วแค่เพิ่มตัวอย่าง {{few-shot}} 3 ข้อก็ผ่านแล้ว",
      fix: "สร้าง {{golden-dataset}} 30–50 เคสแล้ววัด Baseline ของ Prompt + Schema ก่อนเสมอ ข้ามไป Fine-Tune เฉพาะเมื่อผล eval ชนเพดานจริง",
    },
    {
      title: "คิดแค่ค่า GPU ตอนเทรน แต่ลืมค่าเตรียมข้อมูลและค่าโฮสต์รายเดือน",
      symptom: "ค่าเทรนบนคลาวด์แค่ `$15` แต่ต้องเปิด GPU โฮสต์ 24/7 เดือนละ `$500` ทั้งที่ทราฟฟิกจริงยิง API เดือนละ `$60`",
      fix: "คำนวณ Break-Even TCO ที่รวมค่าเตรียมข้อมูล ค่าประเมินผล และค่าโฮสต์รายเดือนเทียบกับ Prompt Caching + Model Routing ก่อนตัดสินใจ",
    },
    {
      title: "คิดว่าต้องเลือกระหว่าง RAG กับ Fine-Tuning อย่างใดอย่างหนึ่งเท่านั้น",
      symptom: "ทีมโต้เถียงกันไม่จบเพราะระบบต้องการทั้งข้อมูลนโยบายสดใหม่และรูปแบบการตอบเฉพาะทางที่แม่นยำ",
      fix: "แยกบทบาทให้ชัด: ใช้ RAG ดึงบริบทข้อเท็จจริงที่สดใหม่และตรวจสิทธิ์ได้ แล้วใช้ Fine-Tuned Model ปรับสไตล์/โครงสร้างการตอบหากจำเป็น",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d085-q1",
        "บริษัทอีคอมเมิร์ซไทยต้องการบอทตอบคำถามนโยบายคืนสินค้า โปรโมชันรายสัปดาห์ และต้องแนบเลขที่เอกสารอ้างอิงพร้อมแยกสิทธิ์ระหว่างลูกค้าทั่วไปกับ VIP ควรเลือกวิธีใด?",
        [
          ["Fine-Tune โมเดลใหม่ทุกวันศุกร์เมื่อมีโปรโมชันใหม่", "ช้า แพง เปราะบาง และไม่สามารถบังคับสิทธิ์ ACL หรือการอ้างอิงเอกสารได้น่าเชื่อถือ"],
          ["ใช้ {{rag}} ร่วมกับ {{context-engineering}} และ Metadata/ACL Filtering", "ถูก — ข้อมูลที่เปลี่ยนบ่อย ต้องอ้างอิงแหล่งที่มา และต้องแยกสิทธิ์ผู้ใช้ เป็นงานของ RAG โดยตรง"],
          ["ยัดเอกสารทั้งหมด 500 หน้าลง System Prompt ทุกคำขอ", "ค่า API และ TTFT พุ่งสูงแบบ O(n²) และเกิด Lost in the Middle"],
          ["ลด `temperature` เป็น 0.0 อย่างเดียวโดยไม่ต้องป้อนเอกสาร", "temperature ต่ำไม่ได้เติมความรู้ใหม่ให้โมเดล"],
        ],
        "B",
        "ข้อเท็จจริงที่เปลี่ยนแปลงบ่อย การอ้างอิงแหล่งที่มา (groundedness) และการควบคุมสิทธิ์ (ACL) ต้องแก้ด้วย RAG ไม่ใช่การฝังข้อมูลลงน้ำหนักโมเดล",
        "เหตุใดข้อมูลที่เปลี่ยนบ่อยและต้องมี ACL/อ้างอิงจึงควรใช้ RAG แทน Fine-Tuning?",
        "เพราะ RAG อัปเดตเอกสารได้ทันทีแบบเรียลไทม์ กรองสิทธิ์ตาม metadata ได้ และให้หลักฐานอ้างอิงที่ตรวจย้อนได้ ต่างจากน้ำหนักโมเดลที่ล้าสมัยง่ายและแยกสิทธิ์ไม่ได้",
      ),
      mc(
        "d085-q2",
        "สถานการณ์ใดต่อไปนี้มีเหตุผลรองรับการทำ **Fine-Tuning** มากที่สุด?",
        [
          ["เพิ่งเริ่มโปรเจกต์วันแรก ยังไม่ได้ลองเขียน Prompt หรือสร้างชุดประเมินผลเลย", "ผิดกฎ Escalation Ladder — ต้องวัด Baseline ด้วย Prompt + Golden Dataset ก่อนเสมอ"],
          ["Prompt + Few-Shot ยาว 4,000 tokens ทำงานได้ดีบน Frontier Model แต่ระบบมีทราฟฟิก 3 ล้านครั้ง/เดือน และต้องการย่อความรู้เชิงรูปแบบลงโมเดล 8B เพื่อลด latency < 250ms และลดต้นทุน", "ถูก — นี่คือ Model Distillation เพื่อลด latency และต้นทุนในปริมาณสูงหลังพิสูจน์คุณภาพจาก Baseline แล้ว"],
          ["โมเดลตอบราคาหุ้นวันนี้ผิดเพราะข้อมูลเทรนเก่ากว่าปัจจุบัน", "ข้อมูลเรียลไทม์ต้องดึงผ่าน Tool Calling หรือ RAG ไม่ใช่ Fine-Tuning"],
          ["JSON ที่โมเดลตอบมี markdown fence ครอบอยู่", "แก้ได้ใน 5 นาทีด้วย Strict Structured Outputs (Constrained Decoding) ไม่ต้องเสียเวลา Fine-Tune"],
        ],
        "B",
        "Fine-Tuning คุ้มค่าที่สุดเมื่อใช้ถ่ายทอดรูปแบบ/สไตล์เฉพาะทางหรือทำ Distillation ลงโมเดลขนาดเล็กเพื่อลด latency และต้นทุนที่สเกลสูง หลังมี Baseline Eval ยืนยันแล้ว",
        "งานแบบใดที่ Fine-Tuning สร้างคุณค่าได้ชัดเจนกว่า Prompting และ RAG?",
        "การล็อกสไตล์/ภาษาเฉพาะทางที่ Prompt ถึงทางตันแล้ว หรือการทำ Model Distillation จากโมเดลใหญ่ลงโมเดลเล็กเพื่อลด latency และต้นทุนในทราฟฟิกระดับสูง",
      ),
      mc(
        "d085-q3",
        "เหตุใดกฎเหล็กของ Escalation Ladder จึงห้ามข้ามไปทำ Fine-Tuning หาก `eval_baseline_done == False`?",
        [
          ["เพราะไลบรารี PyTorch จะโยน SyntaxError หากไม่มีไฟล์ eval", "ไม่เกี่ยวกัน — PyTorch ไม่ได้ตรวจไฟล์ eval เป็นเรื่องของวินัยวิศวกรรม"],
          ["เพราะหากไม่มีตัวเลข Baseline บน Golden Dataset จะไม่สามารถวัดได้เลยว่า Fine-Tuning ดีขึ้นจริง คุ้มทุนหรือไม่ หรือแก้ได้ง่ายกว่าด้วย Prompt/RAG", "ถูก — หากไม่วัดจุดเริ่มต้น เรากำลังเดาสุ่มและเสี่ยงผลาญเวลาและงบโดยไม่รู้ว่าโมเดลดีขึ้นหรือแย่ลง"],
          ["เพราะ Fine-Tuning ต้องใช้ API key ของ OpenAI เท่านั้น", "ไม่จริง — สามารถทำ LoRA/QLoRA บนโมเดล open-weights ได้"],
          ["เพราะโมเดลที่ Fine-Tune แล้วไม่สามารถใช้ร่วมกับ JSON Schema ได้", "ไม่จริง — ยังใช้ Structured Outputs ร่วมกันได้ตามปกติ"],
        ],
        "B",
        "Eval-Driven Engineering ต้องมี Baseline บน Golden Dataset ก่อนเสมอ เพื่อให้ทุกการลงทุนด้านข้อมูลและ GPU พิสูจน์ผลลัพธ์เชิงตัวเลขได้",
        "ทำไมต้องมี Baseline Eval บน Golden Dataset ก่อนตัดสินใจ Fine-Tune?",
        "เพื่อพิสูจน์ว่า Prompt/RAG ถึงทางตันจริง และมีตัวเลขเปรียบเทียบว่าการลงทุน Fine-Tune เพิ่มคุณภาพหรือลดต้นทุนได้จริงหรือไม่",
      ),
      mc(
        "d085-q4",
        "ทีมของคุณใช้ Prompt API ต้นทุน `$0.004`/คำขอ หากเปลี่ยนไปโฮสต์ Fine-Tuned 8B Model เองจะมีต้นทุน `$0.0006`/คำขอ + ค่าเช่า GPU คงที่ `$400`/เดือน + ค่าเตรียมข้อมูลเริ่มต้น `$3,000` เมื่อมีทราฟฟิก **50,000 คำขอ/เดือน** ควรตัดสินใจอย่างไร?",
        [
          ["รีบ Fine-Tune ทันทีเพราะราคาต่อคำขอถูกกว่า 6 เท่า", "กับดัก! 50,000 × $0.004 = $200/เดือน ในขณะที่แค่ค่าเช่า GPU คงที่ก็ $400/เดือนแล้ว ขาดทุนทุกเดือน"],
          ["ใช้ Prompt API ต่อไป เพราะค่าใช้จ่ายรายเดือนเพียง `$200` ถูกกว่าแค่ค่าโฮสต์ GPU คงที่ `$400`/เดือนเสียอีก (ไม่มีวันคืนทุนที่ปริมาณนี้)", "ถูก — ที่ 50k req/เดือน Prompt API จ่าย $200/เดือน ส่วน Fine-Tune จ่าย $30 + $400 = $430/เดือน ไม่คุ้มทุน"],
          ["เทรนโมเดล 70B แทนเพื่อเพิ่มความแม่นยำ", "ยิ่งเพิ่มค่าโฮสต์ GPU ให้ขาดทุนหนักกว่าเดิม"],
          ["ตัดการทำ Evaluation ออกเพื่อประหยัดงบ", "ไม่ช่วยแก้ต้นทุนโฮสต์และยิ่งเพิ่มความเสี่ยงใน production"],
        ],
        "B",
        "ต้องเทียบ Total Cost of Ownership (ค่าต่อคำขอ + ค่าโฮสต์คงที่ + ค่าเตรียมข้อมูล) เสมอ — ที่ปริมาณต่ำ Fixed Hosting Cost ทำให้ Fine-Tuning แพงกว่า API",
        "เหตุใดราคาต่อ token ที่ถูกกว่าของ Fine-Tuned Model จึงอาจแพงกว่า API ในภาพรวม?",
        "เพราะต้องรวมค่าโฮสต์ GPU คงที่รายเดือน ค่าเตรียมข้อมูล และค่าดูแลรักษา — หากปริมาณคำขอไม่มากพอ ต้นทุนคงที่จะสูงกว่าค่า API รวมทั้งเดือน",
      ),
    ],
  },

  takeaways: [
    "ไต่ **Escalation Ladder** เสมอ: เริ่มจาก {{context-engineering}} + {{few-shot}} + {{structured-output}} → เพิ่ม {{rag}} เมื่อขาดความรู้สด → ใช้ Fine-Tuning ({{lora}}) เฉพาะเมื่อ Eval บน {{golden-dataset}} ชนเพดานหรือต้องการ Distillation",
    "แยกโจทย์ให้ขาด: **ข้อมูลเปลี่ยนบ่อย / ต้องอ้างอิง ({{groundedness}}) / แยกสิทธิ์ ({{acl}}) → RAG** · **สไตล์เฉพาะทาง / ย่อโมเดลลด latency & ต้นทุน → Fine-Tune** (และใช้คู่กันได้)",
    "ประเมินจุดคุ้มทุน (Break-Even TCO) รวมค่าเตรียมข้อมูลและค่าโฮสต์คงที่เสมอ — ทราฟฟิกต่ำมักคุ้มกว่าด้วย {{prompt-caching}} + Model Routing",
    "บทพรุ่งนี้ (Day 86) เราจะเจาะลึกกลไกเบื้องหลัง **LoRA / QLoRA** และเหตุผลที่ข้อมูลสะอาด 500 แถวชนะข้อมูลมั่ว 50,000 แถว",
  ],

  reviewCards: [
    rc(
      "d085-rc-1",
      "Escalation Ladder 3 ขั้นสำหรับการปรับปรุงระบบ LLM คืออะไร และมีเงื่อนไขก่อนขึ้นขั้นที่ 3 อย่างไร?",
      "1) Context/Prompt Engineering + Few-Shot → 2) RAG → 3) Fine-Tuning — ห้ามขึ้นขั้นที่ 3 จนกว่าจะมี Baseline Eval บน Golden Dataset พิสูจน์ว่าขั้น 1–2 ถึงทางตันแล้ว",
    ),
    rc(
      "d085-rc-2",
      "แยกความแตกต่างหลักระหว่างปัญหาที่ควรแก้ด้วย RAG กับปัญหาที่ควรแก้ด้วย Fine-Tuning",
      "RAG แก้ปัญหา *ความรู้* (ข้อมูลอัปเดตบ่อย, ต้องอ้างอิงแหล่งที่มา, แยกสิทธิ์ ACL) ส่วน Fine-Tuning แก้ปัญหา *พฤติกรรม/ประสิทธิภาพ* (สไตล์เฉพาะทาง, รูปแบบคงที่, การย่อโมเดลเพื่อลด latency/cost)",
    ),
    rc(
      "d085-rc-3",
      "ต้นทุน 3 ก้อนที่ต้องรวมในการคำนวณ Break-Even ของ Fine-Tuning คืออะไร?",
      "1) ค่าเตรียม/ทำความสะอาดข้อมูลและรัน Eval (Upfront), 2) ค่าโฮสต์ GPU คงที่รายเดือน (Fixed Hosting), และ 3) ค่าประมวลผลต่อคำขอ (Variable Cost)",
    ),
  ],

  sources: [
    { label: "OpenAI Docs — Fine-Tuning Best Practices & When to Use It", href: "https://platform.openai.com/docs/guides/fine-tuning" },
    { label: "Anthropic Docs — Building Effective Agents & Prompt Engineering", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
    { label: "Google Cloud Architecture — RAG vs Fine-Tuning Guide", href: "https://cloud.google.com/use-cases/retrieval-augmented-generation" },
    { label: "Pydantic v2 Documentation — Models & Validation", href: "https://docs.pydantic.dev/latest/concepts/models/" },
  ],

  glossary: ["context-engineering", "rag", "lora", "few-shot", "golden-dataset", "hallucination", "groundedness", "expected-value"],
});
