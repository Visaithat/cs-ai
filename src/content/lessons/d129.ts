import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D129 — Phase 5 / Block B33
 * RAG Triad Evaluation with Ragas (Faithfulness, Context Precision/Recall)
 */
export const d129: Lesson = defineLesson({
  day: 129,
  titleTh: "ประเมินระบบ RAG ด้วย RAG Triad และ Ragas (Faithfulness, Context Precision/Recall)",
  tagline: "30 นาที · แยกอาการป่วยของ Retrieval ออกจาก Generation ก่อนจูนระบบแบบสุ่มเดา",
  icon: "triangle",
  visual: {
    id: "rag-triad",
    title: "RAG Triad — แยกอาการป่วยของ Retrieval ออกจาก Generation",
    caption: "คลิกแต่ละด้านของสามเหลี่ยมเพื่อดูว่าคะแนนตกตรงไหนต้องแก้ที่ Chunking หรือแก้ที่ Prompt",
    alt: "แผนภาพสามเหลี่ยม RAG Triad แสดง Faithfulness, Context Precision และ Context Recall",
  },
  requiresApiKey: true,
  apiKeyNote: "เข้าใจโครงสร้าง metric และรันตัวอย่าง mock scoring บนเครื่องได้โดยไม่ต้องใช้ API key",
  tools: ["Ragas", "Pydantic v2", "pytest", "Golden Dataset"],

  bigPicture: [
    {
      node: 1,
      heading: "เอกสารและ chunk ที่ดึงมาเป็นวัตถุดิบตั้งต้น",
      body: "คุณภาพของคำตอบในระบบ {{rag}} ขึ้นอยู่กับเอกสารที่ถูกดึงมาใส่ prompt ถ้าข้อมูลสำคัญหายไปตั้งแต่ขั้น {{chunking}} หรือการค้นหา โมเดลที่ฉลาดแค่ไหนก็ตอบถูกไม่ได้",
      lessonNote: "**Context Recall** และ **Context Precision** วัดคุณภาพฝั่ง Retrieval โดยเฉพาะ เพื่อบอกว่าวัตถุดิบที่ส่งให้โมเดลครบและสะอาดพอหรือไม่",
    },
    {
      node: 2,
      heading: "โมเดลสังเคราะห์คำตอบจากบริบทที่ได้รับ",
      body: "แม้ดึงเอกสารมาครบทุกชิ้น {{llm}} ก็ยังอาจเติมข้อมูลจากความจำเดิมหรือตีความเกินเอกสารจนเกิด {{hallucination}}",
      lessonNote: "**Faithfulness** วัดเฉพาะความซื่อสัตย์ระหว่างคำตอบกับ context ที่ได้รับ ทำให้รู้ว่าอาการตอบมั่วเกิดจากตัวโมเดล/prompt ไม่ใช่ฐานข้อมูล",
    },
    {
      node: 3,
      heading: "วัดผลสามแกนอย่างเป็นระบบบน Golden Dataset",
      body: "การลองพิมพ์ถามเอง 3–5 ข้อแล้วรู้สึกว่า \"ดูโอเค\" (vibe-check) มองไม่เห็น regression เมื่อปรับ chunk size หรือเปลี่ยนโมเดล",
      lessonNote: "วันนี้เราวัด 3 แกนของ {{ragas}} บน {{golden-dataset}} พร้อมตั้งเกณฑ์ CI Eval Gate ที่บล็อกการเปลี่ยนแปลงที่ทำคะแนนตก",
    },
    {
      node: 6,
      heading: "แปลงคะแนนที่ตกเป็นการแก้ไขที่ตรงจุด",
      body: "เมื่อรู้ว่าคะแนนแกนไหนตก ทีมจะไม่ต้องเสียเวลาแก้ prompt ทั้งวันทั้งที่จริง ๆ แล้วระบบดึงเอกสารผิดหน้า",
      lessonNote: "คะแนน RAG Triad ไหลย้อนกลับเป็นโจทย์ซ่อมระบบ: Recall ต่ำ → แก้ retrieval, Precision ต่ำ → เพิ่ม {{reranker}}, Faithfulness ต่ำ → แก้ prompt & {{groundedness}}",
    },
  ],

  objectives: [
    "**อธิบายและแยกแยะ** ความหมายของ 3 แกนใน RAG Triad ได้แก่ **Faithfulness**, **Context Precision** และ **Context Recall** ได้อย่างแม่นยำ",
    "**วินิจฉัยสาเหตุ** ของคำตอบ RAG ที่ผิดพลาดได้จากรูปแบบคะแนน ว่าควรแก้ฝั่ง Retrieval (chunking/hybrid/rerank) หรือฝั่ง Generation (prompt/citation/abstention)",
    "**สร้างสคริปต์ประเมินและ CI Eval Gate** ด้วยโครงสร้างข้อมูลแบบ `Ragas` ที่คำนวณคะแนน แจ้งเตือนจุดอ่อน และรันทดสอบได้ทั้งโหมด offline mock และโหมด {{llm-as-a-judge}}",
  ],

  prerequisites: [
    "เข้าใจสถาปัตยกรรม Hybrid RAG, Chunking และ Grounded Citations (Phase 4)",
    "รู้จักโครงสร้าง Golden Dataset และตัววัด Retrieval พื้นฐานอย่าง Recall@k / MRR (D125–D126)",
    "เข้าใจแนวคิด LLM-as-a-Judge และการคุมอคติเบื้องต้น (D127)",
    "ใช้งาน `uv`, `Pydantic v2` และ `pytest` บนเครื่องได้",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ขนาดเล็กสำหรับรันชุดประเมิน RAG Triad บนเครื่อง — ส่วนตัวอย่าง offline และแบบฝึกหัดใช้แค่ `pydantic` กับ `pytest` (ส่วน `ragas` ติดตั้งเสริมได้เมื่อพร้อมเชื่อม API จริง)",
    commands: `uv init rag-triad-lab && cd rag-triad-lab
uv add pydantic
uv add --dev pytest ruff
# (ทางเลือกเมื่อต้องการรัน LLM-as-a-Judge จริงด้วย Ragas)
# uv add ragas langchain-openai`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `rag-triad-lab` ด้วย `uv init` และเห็น `pyproject.toml`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รัน `uv run pytest --version` แล้วเห็นเลขเวอร์ชัน"],
    ],
    note: "ตัวอย่างและแบบฝึกหัดในบทนี้ออกแบบให้รันบนเครื่องได้ 100% โดยไม่เสียค่า API ด้วย mock judgement เพื่อให้เข้าใจสูตรและตรรกะการวินิจฉัยก่อนต่อเข้า Ragas API จริง",
  },

  concepts: [
    {
      id: "rag-triad-anatomy",
      title: "1 · สามเหลี่ยม RAG Triad — แยกโรค Retrieval ออกจาก Generation",
      paragraphs: [
        "เมื่อระบบ {{rag}} ตอบลูกค้าผิด เช่น แจ้งเงื่อนไขคืนสินค้าคลาดเคลื่อน ความผิดพลาดมักซ่อนอยู่ได้ถึง 3 จุด: (1) ระบบค้นหาดึงเอกสารไม่ครบ, (2) ระบบดึงเอกสารขยะปนมาเต็มไปหมดจนกลบเนื้อหาสำคัญ, หรือ (3) ดึงเอกสารมาถูกแล้วแต่ {{llm}} เติมเรื่องเองนอกเหนือจากเอกสาร",
        "{{ragas}} จัดระเบียบการวินิจฉัยนี้เป็น **RAG Triad** 3 แกนที่วัดคนละคู่ความสัมพันธ์ ทำให้เราแยกอาการป่วยได้ทันทีโดยไม่ต้องเดา:",
      ],
      analogy: "เหมือนตรวจว่าทำไมนักเรียนสอบเปิดหนังสือ (open-book exam) ตก: **Context Recall** คือเปิดเจอหน้าที่เฉลยอยู่ไหม, **Context Precision** คือบนโต๊ะมีแต่หน้าที่เกี่ยวข้องหรือกองหนังสือรกเต็มโต๊ะ, และ **Faithfulness** คือเขียนคำตอบตามหนังสือจริงหรือแต่งเรื่องเพิ่มเอง",
      bullets: [
        "**Context Recall** *(Reference ↔ Retrieved Contexts)* — ข้อเท็จจริงสำคัญในคำตอบเฉลย (`reference`) ถูกดึงมาอยู่ใน chunks ครบกี่ส่วน? ถ้าต่ำแสดงว่า **Retrieval พลาด** (ต้องแก้ {{chunking}}, เพิ่ม Hybrid BM25+Vector หรือเพิ่ม `top_k`)",
        "**Context Precision** *(Query ↔ Retrieved Contexts + Rank)* — chunks ที่เกี่ยวข้องจริงถูกจัดไว้อันดับต้น ๆ แค่ไหน? คำนวณแบบถ่วงน้ำหนักตามอันดับ (คล้าย Average Precision) ถ้า Recall สูงแต่ Precision ต่ำ แสดงว่า **ดึงมาครบแต่รก** (ควรเพิ่ม {{reranker}} หรือกรอง metadata)",
        "**Faithfulness** *(Response ↔ Retrieved Contexts)* — คำกล่าวอ้าง (claims) ในคำตอบมีหลักฐานรองรับใน context ที่ดึงมากี่เปอร์เซ็นต์? ถ้า Recall/Precision สูงแต่ Faithfulness ต่ำ แสดงว่า **Generation หลอน** (ต้องขันน็อต prompt ให้บังคับ {{groundedness}} และลด `temperature`)",
      ],
      whyTitle: "Why this matters — แก้ผิดฝั่งเสียเวลาเป็นสัปดาห์",
      whyParagraphs: [
        "ความผิดพลาดอันดับหนึ่งของทีมที่ทำ RAG คือเห็นคำตอบผิดแล้วรีบไปแก้ system prompt หรือเปลี่ยนไปใช้โมเดลที่แพงขึ้น ทั้งที่จริงแล้ว `Context Recall = 0.30` เพราะตารางเงื่อนไขถูกตัดขาดตอนทำ chunking โมเดลรุ่นใหม่ที่แพงกว่า 5 เท่าก็ยังตอบไม่ได้อยู่ดี",
        "ในทางกลับกัน ถ้า `Context Recall = 1.0` แต่ `Faithfulness = 0.50` การไปลงทุนจูน Vector Database เพิ่มจะไม่ช่วยอะไรเลย ต้องกลับมาคุม prompt, ใส่ inline citation และสอนให้โมเดลตอบว่า \"ไม่พบข้อมูล\" เมื่อหลักฐานไม่พอ",
      ],
    },
    {
      id: "ragas-sample-and-math",
      title: "2 · โครงสร้าง Evaluation Sample ของ Ragas และสูตรคำนวณเบื้องหลัง",
      paragraphs: [
        "ใน `Ragas` รุ่นใหม่ (v0.2+) เคสทดสอบแต่ละข้อแทนด้วยอ็อบเจกต์ `SingleTurnSample` ที่เก็บ 4 ฟิลด์หลัก: `user_input` (คำถาม), `retrieved_contexts` (รายการข้อความ chunk ที่ดึงมาตามลำดับ), `response` (คำตอบจากระบบเรา) และ `reference` (คำตอบเฉลยจาก {{golden-dataset}})",
        "เบื้องหลังการทำงาน `Ragas` ใช้ {{llm-as-a-judge}} แตกคำตอบเป็นข้อเท็จจริงย่อย (atomic claims) แล้วตรวจทีละข้อว่ามีหลักฐานรองรับหรือไม่ ก่อนรวมเป็นตัวเลขช่วง `0.0–1.0` ซึ่งข้อดีคือเราสามารถทดสอบตรรกะการรวมคะแนนและการวินิจฉัยแบบ deterministic ได้ก่อนจะจ่ายค่า API ให้ Judge",
      ],
      analogy: "เหมือนแยก \"ผู้ช่วยอ่านข้อสอบ\" (LLM Judge ที่ติ๊กว่าแต่ละประโยคตรงหนังสือไหม) ออกจาก \"เครื่องคิดเลขรวมคะแนน\" (สูตรคณิตศาสตร์ที่สรุปเป็นเกรดและใบวินิจฉัย)",
      code: {
        language: "python",
        filename: "ragas_concept.py",
        code: `# โครงสร้าง SingleTurnSample ของ Ragas (ใช้เมื่อเชื่อม API จริง)
# from ragas import EvaluationDataset, evaluate
# from ragas.dataset_schema import SingleTurnSample
# from ragas.metrics import Faithfulness, LLMContextPrecisionWithReference, LLMContextRecall

# ตัวอย่างสูตร Context Precision@K แบบถ่วงน้ำหนักตามอันดับ:
def context_precision_at_k(relevance_flags: list[bool]) -> float:
    """relevance_flags เรียงจาก chunk อันดับ 1 -> อันดับ K"""
    total_relevant = sum(relevance_flags)
    if total_relevant == 0:
        return 0.0
    hits = 0
    weighted_sum = 0.0
    for rank, is_rel in enumerate(relevance_flags, start=1):
        if is_rel:
            hits += 1
            weighted_sum += hits / rank
    return round(weighted_sum / total_relevant, 4)

# chunk ที่ใช่มาอยู่อันดับ 1 และ 3 -> (1/1 + 2/3) / 2 = 0.8333
print("Top-ranked:", context_precision_at_k([True, False, True]))
# chunk ที่ใช่ตกไปอยู่อันดับ 3 ที่เดียว -> (1/3) / 1 = 0.3333
print("Bottom-ranked:", context_precision_at_k([False, False, True]))`,
        caption: "Context Precision ลงโทษหนักเมื่อ chunk ที่ถูกต้องตกไปอยู่ท้ายรายการ เพราะโมเดลมีแนวโน้มหลุดโฟกัสกับข้อมูลที่จมอยู่กลาง/ท้าย context",
      },
      whyTitle: "Why this matters — รู้สูตรเบื้องหลังจึงไม่โดนตัวเลขหลอก",
      whyParagraphs: [
        "หลายคนสับสนระหว่าง `Context Precision` กับสัดส่วน chunk ที่เกี่ยวข้องธรรมดา (`hits / K`) แต่สูตรของ Ragas ใช้ **Average Precision** ที่ให้น้ำหนักกับอันดับต้น ๆ สูงกว่ามาก สอดคล้องกับ {{mrr|Recall@k / MRR}} ที่เรียนใน D126",
        "นอกจากนี้เคสขอบ (edge case) อย่างคำตอบที่บอกว่า \"ไม่พบข้อมูล\" จนไม่มี claim หรือเคสที่ไม่มี chunk ที่เกี่ยวข้องเลย (`total_relevant == 0`) ต้องกำหนดพฤติกรรมให้ชัดเพื่อไม่ให้หารด้วยศูนย์จน eval pipeline พังกลาง CI",
      ],
    },
    {
      id: "ci-eval-gates",
      title: "3 · เปลี่ยนคะแนน RAG Triad เป็น CI Eval Gate",
      paragraphs: [
        "การรัน Ragas แค่ครั้งเดียวตอนทำเดโมยังไม่เรียกว่า Eval-Driven Development ในงานจริงทีมจะผูกเกณฑ์ขั้นต่ำ (Eval Gate) เข้ากับทุก Pull Request ที่แก้ chunking, embedding, reranker หรือ prompt template",
        "หลักปฏิบัติที่ประหยัดและเร็วคือจัดลำดับการตรวจแบบ **2 ชั้น (Two-Tier Gate)**: ชั้นแรกใช้ deterministic evals ที่ฟรีและรันจบในไม่กี่วินาที (`pytest`, JSON schema, citation format, Recall@5/MRR) ถ้าผ่านจึงค่อยรันชั้นสองด้วย `Ragas` และ {{promptfoo}} บน {{golden-dataset}} เพื่อตรวจ Faithfulness และ Context Precision/Recall",
      ],
      analogy: "เหมือนด่านตรวจคุณภาพโรงงาน: ชั่งน้ำหนักกับวัดขนาดทุกชิ้นด้วยเครื่องอัตโนมัติก่อน (เร็วและฟรี) แล้วค่อยส่งตัวอย่างเข้าห้องแล็บตรวจสารเคมี (ช้ากว่าแต่ละเอียด)",
      bullets: [
        "**ตั้งเกณฑ์แยกตามแกน** — อย่ารวม 3 ตัววัดเป็นค่าเฉลี่ยเดียว เพราะ `Faithfulness = 1.0` กับ `Context Recall = 0.4` เฉลี่ยได้ `0.70` ซึ่งกลบปัญหาที่ระบบหาเอกสารไม่เจอ",
        "**คุมต้นทุนและเสถียรภาพ** — ปักหมุดรุ่นของ Judge model + `temperature=0` และเก็บคะแนนเป็นไฟล์ JSON artifact ทุกรอบเพื่อดูแนวโน้ม (trend) ข้าม commit",
        "**Calibrate กับคนเสมอ** — สุ่มอ่าน 10–15 เคสภาษาไทยที่ Judge ให้คะแนนต่ำและสูงเทียบกับความเห็นทีม (D128) เพื่อจับกรณีที่ Judge ตีความศัพท์เฉพาะองค์กรผิด",
      ],
      whyTitle: "Why this matters — ป้องกัน Silent Regression ใน Production",
      whyParagraphs: [
        "ในระบบ AI การแก้ prompt เพียง 1 ประโยคเพื่อซ่อมเคสลูกค้า A อาจทำให้เคสลูกค้า B–F ตอบหลอนโดยไม่มี syntax error หรือ HTTP 500 โผล่ให้เห็นเลย",
        "CI Eval Gate ที่ตรวจแยกทั้ง 3 แกน (และจะต่อเข้า GitHub Actions ใน D131) ทำให้เรากล้าปรับปรุงระบบ RAG ได้เร็วขึ้นโดยไม่กลัวพังของเดิม",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — RAG Triad ≈ Lighthouse / Core Web Vitals ของระบบ AI",
      body: [
        "ในงานเว็บคุณไม่ได้ดูแค่ \"เว็บโหลดขึ้นไหม\" แต่แยกวัด LCP, CLS, INP เพื่อรู้ว่าช้าที่รูปภาพ, layout shift หรือ JavaScript — RAG Triad ทำหน้าที่แบบเดียวกันสำหรับระบบค้นคืนและตอบคำถาม:",
      ],
      table: [
        ["Context Recall", "API / DB ดึงข้อมูลครบทุก record ที่หน้าจอต้องใช้ไหม"],
        ["Context Precision", "Payload มีข้อมูลขยะติดมาเยอะไหม / เรียงลำดับดีไหม"],
        ["Faithfulness", "UI แสดงตัวเลขตรงกับข้อมูลจาก API จริงไหม (ไม่เมคเอง)"],
        ["Ragas CI Eval Gate", "Lighthouse CI / Playwright visual regression check ใน PR"],
      ],
    },
    student: {
      title: "First-Year Note — Precision vs Recall ที่เคยเรียนใน Phase 2 กลับมาในร่างใหม่",
      body: [
        "ถ้าจำเรื่อง Precision (ความแม่น: ที่หยิบมาถูกกี่ส่วน) กับ Recall (ความครบ: ของถูกทั้งหมดหยิบมาได้กี่ส่วน) จาก D45 ได้ — คุณเข้าใจ 2 ใน 3 ของ RAG Triad แล้ว!",
        "ส่วน **Faithfulness** คือมิติใหม่เฉพาะงาน LLM: ต่อให้ดึงเอกสารมาครบและแม่น 100% โมเดลภาษาก็ยังแต่งคำตอบเกินเอกสารได้ เราจึงต้องมีตัววัดที่ 3 มาเฝ้าเฉพาะฝั่งการเขียนคำตอบ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ทีมดูแลระบบ RAG ตอบคำถามนโยบายบริษัทภาษาไทย พบว่าลูกค้าบ่นว่าคำตอบไม่ตรงนโยบาย เราจะรันตัวประเมิน RAG Triad แบบ offline mock เพื่อแยกอาการป่วยของ 2 เคสจริงและเช็กผ่าน CI Eval Gate",
    steps: [
      {
        title: "1 · นิยาม Schema และสูตรคำนวณ RAG Triad",
        explain:
          "ใช้ `Pydantic` กำหนดโครงสร้างผลตรวจระดับ claim/fact (ซึ่งในโหมด production ได้มาจาก LLM Judge ของ Ragas) แล้วคำนวณคะแนนทั้ง 3 แกนอย่างปลอดภัยต่อกรณีหารด้วยศูนย์",
        code: {
          language: "python",
          filename: "worked_rag_triad.py",
          code: `from typing import Literal
from pydantic import BaseModel, Field


class EvalCaseInput(BaseModel):
    case_id: str
    user_input: str
    # ผลตรวจจาก judge (หรือ human label): แต่ละ claim ในคำตอบมีหลักฐานใน context หรือไม่
    claim_supported: list[bool]
    # แต่ละ fact สำคัญในคำตอบเฉลย (reference) ปรากฏใน retrieved contexts หรือไม่
    reference_fact_covered: list[bool]
    # แต่ละ chunk ที่ดึงมา (เรียงอันดับ 1..K) เกี่ยวข้องกับคำถามหรือไม่
    chunk_relevant: list[bool]


class TriadReport(BaseModel):
    case_id: str
    faithfulness: float = Field(ge=0.0, le=1.0)
    context_recall: float = Field(ge=0.0, le=1.0)
    context_precision: float = Field(ge=0.0, le=1.0)
    primary_issue: Literal[
        "healthy",
        "retrieval_recall",
        "retrieval_precision",
        "generation_faithfulness",
    ]


def compute_context_precision(flags: list[bool]) -> float:
    total_rel = sum(flags)
    if total_rel == 0:
        return 0.0
    hits = 0
    score = 0.0
    for rank, rel in enumerate(flags, start=1):
        if rel:
            hits += 1
            score += hits / rank
    return round(score / total_rel, 4)


def score_case(case: EvalCaseInput) -> TriadReport:
    faithfulness = (
        round(sum(case.claim_supported) / len(case.claim_supported), 4)
        if case.claim_supported
        else 1.0
    )
    recall = (
        round(sum(case.reference_fact_covered) / len(case.reference_fact_covered), 4)
        if case.reference_fact_covered
        else 1.0
    )
    precision = compute_context_precision(case.chunk_relevant)

    # วินิจฉัยตามลำดับต้นน้ำ -> ปลายน้ำ (แก้ retrieval ก่อน generation เสมอ)
    if recall < 0.80:
        issue = "retrieval_recall"
    elif precision < 0.75:
        issue = "retrieval_precision"
    elif faithfulness < 0.85:
        issue = "generation_faithfulness"
    else:
        issue = "healthy"

    return TriadReport(
        case_id=case.case_id,
        faithfulness=faithfulness,
        context_recall=recall,
        context_precision=precision,
        primary_issue=issue,
    )`,
        },
        output: `# นิยามคลาสและฟังก์ชันพร้อมใช้งาน (ยังไม่มีผลลัพธ์จนกว่าจะรันขั้นที่ 2)`,
      },
      {
        title: "2 · วินิจฉัยเคสจริง 2 แบบ (Retrieval พัง vs Generation หลอน)",
        explain:
          "สังเกตว่าทั้งสองเคสลูกค้าได้คำตอบที่ \"ไม่สมบูรณ์\" เหมือนกัน แต่เมื่อส่องด้วย RAG Triad เราเห็นทันทีว่าเคส C01 ขาดเอกสารส่วนลด (แก้ chunking/retrieval) ส่วนเคส C02 ดึงครบแล้วแต่โมเดลแต่งตัวเลขเพิ่มเอง (แก้ prompt)",
        code: {
          language: "python",
          filename: "worked_rag_triad.py",
          code: `cases = [
    EvalCaseInput(
        case_id="C01-return-window",
        user_input="คืนสินค้าแกะกล่องแล้วได้ภายในกี่วัน และต้องเสียค่าส่งไหม?",
        # โมเดลตอบตรงตาม chunk ที่ได้มา (ไม่มั่ว) แต่ดึงมาได้แค่ 1 จาก 2 เงื่อนไข
        claim_supported=[True, True],
        reference_fact_covered=[True, False],
        chunk_relevant=[True, False, False],
    ),
    EvalCaseInput(
        case_id="C02-warranty-claim",
        user_input="ประกันสินค้าอิเล็กทรอนิกส์ครอบคลุมจอแตกไหม?",
        # ดึงเอกสารครบและอยู่อันดับบน แต่โมเดลแถมข้อความว่า "เปลี่ยนฟรี 1 ครั้ง" ทั้งที่ไม่มีในเอกสาร
        claim_supported=[True, False],
        reference_fact_covered=[True, True],
        chunk_relevant=[True, True, False],
    ),
]

reports = [score_case(c) for c in cases]
for r in reports:
    print(
        f"{r.case_id}: F={r.faithfulness:.2f} | "
        f"Rec={r.context_recall:.2f} | Prec={r.context_precision:.2f} "
        f"-> issue={r.primary_issue}"
    )`,
        },
        output: `C01-return-window: F=1.00 | Rec=0.50 | Prec=1.00 -> issue=retrieval_recall
C02-warranty-claim: F=0.50 | Rec=1.00 | Prec=1.00 -> issue=generation_faithfulness`,
      },
      {
        title: "3 · รวมคะแนนระดับชุดข้อมูลและตรวจผ่าน CI Eval Gate",
        explain:
          "คำนวณค่าเฉลี่ยแยกทีละแกนแล้วเทียบกับเกณฑ์ผ่านของทีม หากแกนใดแกนหนึ่งต่ำกว่า threshold ให้รายงานชัดเจนว่าต้องซ่อมแกนไหนก่อน merge PR",
        code: {
          language: "python",
          filename: "worked_rag_triad.py",
          code: `THRESHOLDS = {
    "faithfulness": 0.85,
    "context_recall": 0.80,
    "context_precision": 0.75,
}

averages = {
    "faithfulness": round(sum(r.faithfulness for r in reports) / len(reports), 4),
    "context_recall": round(sum(r.context_recall for r in reports) / len(reports), 4),
    "context_precision": round(sum(r.context_precision for r in reports) / len(reports), 4),
}

failed_metrics = [
    f"{k}={averages[k]:.2f} < {v:.2f}"
    for k, v in THRESHOLDS.items()
    if averages[k] < v
]
print("AVERAGES:", averages)
print("GATE STATUS:", "PASS" if not failed_metrics else f"FAIL ({', '.join(failed_metrics)})")`,
        },
        output: `AVERAGES: {'faithfulness': 0.75, 'context_recall': 0.75, 'context_precision': 1.0}
GATE STATUS: FAIL (faithfulness=0.75 < 0.85, context_recall=0.75 < 0.80)`,
      },
    ],
    gotcha:
      "จุดสังเกตสำคัญ: ในเคส C01 แม้ `Context Precision = 1.00` (เพราะ chunk ที่ดึงมาอันดับ 1 เกี่ยวข้องจริง) แต่ `Context Recall = 0.50` (ยังขาดอีกครึ่งของคำตอบ) — หากดูแค่ Precision ตัวเดียวจะหลงคิดว่า Retrieval ดีแล้ว ทั้งที่ข้อมูลหายไปครึ่งหนึ่ง!",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูล `rag_triad_gate.py` เพื่อคำนวณคะแนน RAG Triad, วินิจฉัยสาเหตุหลักของแต่ละเคส และตัดสินผล CI Eval Gate สำหรับชุดทดสอบภาษาไทย",
    requirements: [
      "สร้าง Pydantic model `TriadSample` ที่มี `case_id: str`, `claim_supported: list[bool]`, `reference_fact_covered: list[bool]`, `chunk_relevant: list[bool]`",
      "สร้าง `compute_triad_scores(sample: TriadSample) -> dict[str, float]` คืน dict ที่มีคีย์ `faithfulness`, `context_recall`, `context_precision` ปัดทศนิยม 4 ตำแหน่ง (กำหนดให้ list ว่างของ `claim_supported` หรือ `reference_fact_covered` คืน `1.0` ส่วน `chunk_relevant` ที่ไม่มี `True` เลยคืน `0.0`)",
      "สร้าง `diagnose_rag_failure(scores: dict[str, float]) -> str` คืนค่าตามลำดับต้นน้ำ→ปลายน้ำ: ถ้า `context_recall < 0.80` คืน `\"retrieval_recall\"`, ถัดมาถ้า `context_precision < 0.75` คืน `\"retrieval_precision\"`, ถัดมาถ้า `faithfulness < 0.85` คืน `\"generation_faithfulness\"`, นอกนั้นคืน `\"healthy\"`",
      "สร้าง `run_eval_gate(samples: list[TriadSample], thresholds: dict[str, float]) -> dict` คืน `{\"passed\": bool, \"averages\": {...}, \"failed_metrics\": [...], \"diagnoses\": {case_id: issue}}` โดยถ้า `samples` ว่างให้โยน `ValueError`",
    ],
    starter: {
      language: "python",
      filename: "rag_triad_gate.py",
      code: `from pydantic import BaseModel


class TriadSample(BaseModel):
    case_id: str
    claim_supported: list[bool]
    reference_fact_covered: list[bool]
    chunk_relevant: list[bool]


def compute_triad_scores(sample: TriadSample) -> dict[str, float]:
    # TODO: คำนวณ faithfulness, context_recall และ weighted context_precision (ปัด 4 ตำแหน่ง)
    raise NotImplementedError


def diagnose_rag_failure(scores: dict[str, float]) -> str:
    # TODO: คืน "retrieval_recall" | "retrieval_precision" | "generation_faithfulness" | "healthy"
    raise NotImplementedError


def run_eval_gate(
    samples: list[TriadSample],
    thresholds: dict[str, float],
) -> dict:
    # TODO: คำนวณค่าเฉลี่ยแต่ละแกน เทียบกับ thresholds และสรุปผล gate
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_rag_triad_gate.py",
      code: `import pytest
from rag_triad_gate import (
    TriadSample,
    compute_triad_scores,
    diagnose_rag_failure,
    run_eval_gate,
)


def test_weighted_context_precision_and_scores():
    sample = TriadSample(
        case_id="Q1",
        claim_supported=[True, True, False],
        reference_fact_covered=[True, True],
        chunk_relevant=[True, False, True],
    )
    scores = compute_triad_scores(sample)
    assert scores["faithfulness"] == pytest.approx(0.6667, abs=1e-4)
    assert scores["context_recall"] == 1.0
    # (1/1 + 2/3) / 2 = 0.8333
    assert scores["context_precision"] == pytest.approx(0.8333, abs=1e-4)
    assert diagnose_rag_failure(scores) == "generation_faithfulness"


def test_diagnosis_prioritizes_retrieval_before_generation():
    scores = {"faithfulness": 0.4, "context_recall": 0.5, "context_precision": 0.3}
    assert diagnose_rag_failure(scores) == "retrieval_recall"

    noisy = {"faithfulness": 0.9, "context_recall": 0.9, "context_precision": 0.5}
    assert diagnose_rag_failure(noisy) == "retrieval_precision"


def test_zero_relevant_chunks_edge_case():
    sample = TriadSample(
        case_id="Q-empty",
        claim_supported=[],
        reference_fact_covered=[False],
        chunk_relevant=[False, False],
    )
    scores = compute_triad_scores(sample)
    assert scores["faithfulness"] == 1.0
    assert scores["context_recall"] == 0.0
    assert scores["context_precision"] == 0.0


def test_eval_gate_pass_and_fail():
    thresholds = {
        "faithfulness": 0.85,
        "context_recall": 0.80,
        "context_precision": 0.75,
    }
    good = [
        TriadSample(
            case_id="G1",
            claim_supported=[True, True],
            reference_fact_covered=[True, True],
            chunk_relevant=[True, True, False],
        )
    ]
    res_pass = run_eval_gate(good, thresholds)
    assert res_pass["passed"] is True
    assert res_pass["failed_metrics"] == []
    assert res_pass["diagnoses"] == {"G1": "healthy"}

    bad = good + [
        TriadSample(
            case_id="B1",
            claim_supported=[False, False],
            reference_fact_covered=[True, True],
            chunk_relevant=[True, False],
        )
    ]
    res_fail = run_eval_gate(bad, thresholds)
    assert res_fail["passed"] is False
    assert "faithfulness" in res_fail["failed_metrics"]
    assert res_fail["diagnoses"]["B1"] == "generation_faithfulness"


def test_eval_gate_rejects_empty_samples():
    with pytest.raises(ValueError):
        run_eval_gate([], {"faithfulness": 0.85})
`,
    },
    selfCheck: [
      "`compute_triad_scores` คำนวณ `context_precision` แบบถ่วงน้ำหนักตามอันดับ `(hits / rank)` ไม่ใช่แค่ `sum(flags) / len(flags)`",
      "เคส `chunk_relevant=[False, False]` คืน `0.0` โดยไม่เกิด `ZeroDivisionError`",
      "`diagnose_rag_failure` เช็ก `context_recall` → `context_precision` → `faithfulness` ตามลำดับต้นน้ำไปปลายน้ำ",
      "`run_eval_gate` โยน `ValueError` เมื่อ `samples` ว่าง และแยกเช็กทุก metric ไม่เอา 3 แกนมาเฉลี่ยรวมกัน",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่านครบทั้งหมด",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `test_rag_triad_gate.py` ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "สำหรับ `context_precision` ให้วนลูปพร้อมเลขอันดับที่เริ่มจาก `1` (`enumerate(sample.chunk_relevant, start=1)`) นับจำนวน `hits` สะสม และบวก `hits / rank` เฉพาะตำแหน่งที่ `is_rel` เป็น `True` แล้วค่อยหารด้วยจำนวน `True` ทั้งหมด",
      },
      {
        body: "ใน `run_eval_gate` ให้ตรวจ `if not samples: raise ValueError(...)` ก่อน จากนั้นรวบรวมคะแนนของแต่ละเคสด้วย `compute_triad_scores(s)` เพื่อหาค่าเฉลี่ยของทั้ง 3 คีย์ (`faithfulness`, `context_recall`, `context_precision`) และเก็บ `diagnoses[s.case_id] = diagnose_rag_failure(sc)`",
      },
      {
        body: "โครงของ `compute_triad_scores` และ `diagnose_rag_failure` พร้อมแล้ว — เติมตรรกะรวมค่าเฉลี่ยและเช็ก `thresholds` ใน `run_eval_gate` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def compute_triad_scores(sample: TriadSample) -> dict[str, float]:
    faithfulness = (
        round(sum(sample.claim_supported) / len(sample.claim_supported), 4)
        if sample.claim_supported
        else 1.0
    )
    recall = (
        round(sum(sample.reference_fact_covered) / len(sample.reference_fact_covered), 4)
        if sample.reference_fact_covered
        else 1.0
    )
    total_rel = sum(sample.chunk_relevant)
    if total_rel == 0:
        precision = 0.0
    else:
        hits = 0
        weighted = 0.0
        for rank, is_rel in enumerate(sample.chunk_relevant, start=1):
            if is_rel:
                hits += 1
                weighted += hits / rank
        precision = round(weighted / total_rel, 4)
    return {
        "faithfulness": faithfulness,
        "context_recall": recall,
        "context_precision": precision,
    }


def diagnose_rag_failure(scores: dict[str, float]) -> str:
    if scores["context_recall"] < 0.80:
        return "retrieval_recall"
    if scores["context_precision"] < 0.75:
        return "retrieval_precision"
    if scores["faithfulness"] < 0.85:
        return "generation_faithfulness"
    return "healthy"`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `# วาง rag_triad_gate.py และ test_rag_triad_gate.py ในโฟลเดอร์ rag-triad-lab/
uv run pytest -q
uv run ruff check .`,
      caption: "รันเทสต์บนเครื่องได้ทันทีโดยไม่ต้องตั้งค่า API key",
    },
  },

  mistakes: [
    {
      title: "แก้ Prompt วนไปทั้งที่ Context Recall ต่ำ",
      symptom: "ปรับ system prompt ซ้ำหลายรอบหรือเปลี่ยนไปใช้โมเดลใหญ่ขึ้น แต่คำตอบยังขาดข้อเท็จจริงสำคัญเหมือนเดิม",
      fix: "เช็ก `Context Recall` ก่อนเสมอ ถ้าต่ำกว่าเกณฑ์ให้ตรวจสอบ chunk ที่ดึงมาจริง ๆ — มักแก้ได้ที่การตัด chunk, เพิ่ม PyThaiNLP BM25 Hybrid Search หรือเพิ่ม `top_k`",
    },
    {
      title: "ยุบคะแนน 3 แกนเป็นค่าเฉลี่ยตัวเดียวใน CI",
      symptom: "ค่าเฉลี่ยรวมดูสวย (เช่น 0.82) เลยปล่อยผ่านขึ้น production ทั้งที่ `Faithfulness` ตกเหลือ 0.55 และลูกค้าเจออาการหลอน",
      fix: "ตั้ง threshold แยกทีละแกน (`faithfulness`, `context_recall`, `context_precision`) และให้ CI ล้มทันทีเมื่อแกนใดแกนหนึ่งต่ำกว่าเกณฑ์",
    },
    {
      title: "เชื่อคะแนน LLM-as-a-Judge โดยไม่เปิดดูตัวอย่างภาษาไทยจริง",
      symptom: "Judge ให้ Faithfulness ต่ำผิดปกติกับคำตอบภาษาไทยที่ถูกต้อง เพราะใช้คำพ้องความหมายหรือตัวย่อองค์กรต่างจากเอกสารต้นฉบับ",
      fix: "สุ่มตรวจ 10–15 เคสเทียบกับ human labels ทุกครั้งที่สร้างหรือปรับชุด eval และเขียนคำอธิบาย/reference ใน Golden Dataset ให้ชัดเจน",
    },
    {
      title: "วัดแค่คำถามที่ตอบได้ ลืมเคส Abstention (นอกขอบเขต)",
      symptom: "คะแนน RAG Triad บนคำถามทั่วไปสูงลิ่ว แต่พอผู้ใช้ถามเรื่องที่ไม่มีในฐานความรู้ โมเดลกลับแต่งคำตอบเอง",
      fix: "ใส่เคส unanswerable อย่างน้อย 15–20% ใน Golden Dataset และตรวจร่วมกับ deterministic rule ว่าเมื่อไม่มีเอกสารรองรับ ระบบต้องปฏิเสธการเดา",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d129-q1",
        "ผลประเมิน Ragas บนชุดทดสอบภาษาไทยได้ `Context Recall = 0.92`, `Context Precision = 0.88`, แต่ `Faithfulness = 0.54` คุณควรลงมือแก้ที่จุดใดก่อนเป็นอันดับแรก?",
        [
          ["เพิ่มขนาด `top_k` จาก 5 เป็น 20 เพื่อดึงเอกสารมากขึ้น", "Context Recall สูงถึง 0.92 อยู่แล้ว แสดงว่าดึงเอกสารครบแล้ว การเพิ่ม `top_k` จะยิ่งเพิ่ม noise และต้นทุนโดยไม่แก้อาการหลอน"],
          ["เปลี่ยน Vector Database จาก pgvector เป็น Qdrant", "ปัญหาไม่ได้อยู่ที่การจัดเก็บหรือความเร็วการค้นหา เพราะฝั่ง Retrieval ทำคะแนนได้ดีทั้ง Recall และ Precision"],
          ["ปรับ Generation Prompt ให้บังคับตอบเฉพาะจากเอกสาร ใส่ inline citation และลด temperature", "ถูก — คะแนนฝั่ง Retrieval ดีแล้ว แต่ Faithfulness ต่ำแปลว่าโมเดลแต่งข้อมูลเกิน context ที่ได้รับ ต้องแก้ฝั่ง Generation"],
          ["ลดขนาด chunk size ลงครึ่งหนึ่งทันที", "การรื้อ chunking โดยที่ Recall/Precision สูงอยู่แล้วเสี่ยงทำให้บริบทขาดและคะแนน Retrieval ตกลงโดยไม่จำเป็น"],
        ],
        "C",
        "เมื่อ Context Recall และ Context Precision สูง แต่ Faithfulness ต่ำ แสดงว่า Retrieval ส่งเอกสารที่ถูกต้องและสะอาดให้แล้ว ปัญหาอยู่ที่ชั้น Generation ที่ตอบเกินหลักฐาน",
        "ถ้า Context Recall=0.92, Precision=0.88 แต่ Faithfulness=0.54 ต้องแก้ฝั่งไหน?",
        "แก้ฝั่ง Generation (prompt บังคับอ้างอิงหลักฐาน, inline citations, abstention, ลด temperature) เพราะ Retrieval ดึงข้อมูลมาครบและแม่นแล้ว",
      ),
      mc(
        "d129-q2",
        "ระบบดึงมา 3 chunks โดยมีผลความเกี่ยวข้องตามอันดับคือ `[False, False, True]` เทียบกับ `[True, False, False]` ข้อใดอธิบายคะแนน **Context Precision** ได้ถูกต้อง?",
        [
          ["ทั้งสองกรณีได้คะแนนเท่ากันคือ `0.3333` เพราะมี chunk ที่ใช่ 1 จาก 3 ชิ้นเท่ากัน", "ผิด — นั่นคือสัดส่วนธรรมดา ไม่ใช่ Context Precision แบบถ่วงน้ำหนักตามอันดับของ Ragas"],
          ["`[True, False, False]` ได้ `1.00` สูงกว่า `[False, False, True]` ที่ได้ `0.3333` เพราะ chunk ที่ถูกต้องอยู่บนสุด", "ถูก — Context Precision ใช้อันดับถ่วงน้ำหนัก (`hits / rank`) จึงให้รางวัลสูงเมื่อเอกสารสำคัญถูกจัดไว้อันดับ 1 และลงโทษเมื่อจมอยู่ท้ายรายการ"],
          ["`[False, False, True]` ได้คะแนนสูงกว่าเพราะโมเดลจำข้อความท้ายสุดได้ดีกว่าเสมอ", "ผิด — สูตร Context Precision ให้ความสำคัญกับอันดับต้น ๆ สูงสุด เพื่อสะท้อนคุณภาพของ ranking/reranker"],
          ["คำนวณไม่ได้เพราะต้องใช้คำตอบของ LLM (`response`) มาคำนวณด้วย", "ผิด — Context Precision วัดความสัมพันธ์ระหว่าง Query กับ Retrieved Contexts (และ reference) ไม่ขึ้นกับคำตอบที่สร้าง"],
        ],
        "B",
        "Context Precision คำนวณแบบ Average Precision ตามอันดับ (`1/1 = 1.0` vs `1/3 = 0.3333`) เพื่อวัดว่าระบบจัดอันดับ (และ Reranker) ดันเอกสารที่เกี่ยวข้องขึ้นบนสุดได้ดีแค่ไหน",
        "ทำไม Context Precision ของ `[True, False, False]` จึงสูงกว่า `[False, False, True]`?",
        "เพราะใช้สูตรถ่วงน้ำหนักตามอันดับ (Average Precision): อันดับ 1 ได้ `1/1 = 1.0` ส่วนอันดับ 3 ได้ `1/3 = 0.3333`",
      ),
      mc(
        "d129-q3",
        "เหตุใดทีมจึงไม่ควรยุบคะแนน `Faithfulness`, `Context Precision` และ `Context Recall` เป็นค่าเฉลี่ยรวมตัวเดียวเพื่อทำ CI Eval Gate?",
        [
          ["เพราะทั้ง 3 ตัววัดมีหน่วยต่างกันและค่าเกิน 1.0 ได้", "ทั้ง 3 ตัววัดอยู่ในช่วง 0.0–1.0 เหมือนกัน แต่แทนความล้มเหลวคนละชั้นของระบบ"],
          ["เพราะคะแนนสูงของแกนหนึ่งสามารถกลบจุดพังร้ายแรงของอีกแกนได้ (เช่น Recall ตกหนักแต่ค่าเฉลี่ยยังผ่าน)", "ถูก — การแยกเกณฑ์ทีละแกนทำให้รู้ทันทีว่าระบบพังที่ Retrieval หรือ Generation และไม่ปล่อย regression หลุดขึ้น production"],
          ["เพราะ Ragas ไม่อนุญาตให้คำนวณค่าเฉลี่ยข้ามเคสในชุดทดสอบ", "Ragas และ CI สคริปต์คำนวณค่าเฉลี่ยรายแกนข้าม Golden Dataset ได้ตามปกติ"],
          ["เพราะ GitHub Actions รองรับการตรวจตัวเลขได้แค่ 1 ตัวแปร", "CI script สามารถตรวจเงื่อนไขกี่แกนก็ได้ใน Python/pytest"],
        ],
        "B",
        "ค่าเฉลี่ยรวมของ 3 แกนอาจปิดบังวิกฤตเฉพาะจุด เช่น Faithfulness เหลือ 0.55 ขณะที่ Recall/Precision อยู่ที่ 1.0 — CI Gate ที่ดีต้องเช็ก threshold แยกทุกแกน",
        "ทำไม CI Eval Gate ของ RAG ต้องตั้ง threshold แยกทีละแกนแทนค่าเฉลี่ยรวม?",
        "เพื่อไม่ให้คะแนนสูงของแกนหนึ่งกลบจุดพังของอีกแกน (เช่น Retrieval ดีแต่ Generation หลอน) และช่วยชี้จุดซ่อมได้ทันที",
      ),
      mc(
        "d129-q4",
        "ข้อใดคือชุดข้อมูลที่จำเป็นสำหรับการคำนวณ **Context Recall** ใน Ragas?",
        [
          ["แค่ `user_input` และ `response` ของโมเดล", "ไม่พอ — Context Recall ต้องรู้ว่าเอกสารที่ดึงมาครอบคลุมคำตอบเฉลยแค่ไหน จึงต้องมี `retrieved_contexts` และ `reference`"],
          ["`retrieved_contexts` เทียบกับคำตอบเฉลย (`reference` / ground truth) จาก Golden Dataset", "ถูก — Context Recall ตรวจว่าข้อเท็จจริงสำคัญใน `reference` ถูกดึงมาครบอยู่ใน `retrieved_contexts` หรือไม่"],
          ["จำนวน token ทั้งหมดและค่า TTFT ของการเรียก API", "นั่นคือข้อมูลด้าน performance/cost (observability) ไม่ใช่ Context Recall"],
          ["เฉพาะค่า cosine similarity ของ chunk อันดับที่ 1", "Cosine similarity สูงไม่ได้รับประกันว่าเนื้อหาใน chunk ครอบคลุมข้อเท็จจริงทั้งหมดของคำตอบเฉลย"],
        ],
        "B",
        "Context Recall วัดความครบถ้วนของเอกสารที่ดึงมาเทียบกับความจริงอ้างอิง (`reference`) จึงจำเป็นต้องมี Golden Dataset ที่มีคำตอบเฉลยคุณภาพดี",
        "Context Recall เปรียบเทียบข้อมูลคู่ไหน?",
        "เปรียบเทียบ `retrieved_contexts` กับ `reference` (คำตอบเฉลยใน Golden Dataset) เพื่อดูว่าดึงข้อเท็จจริงสำคัญมาครบหรือไม่",
      ),
    ],
  },

  takeaways: [
    "**RAG Triad แยกโรคได้ชัดเจน**: `Context Recall` ต่ำ → แก้การดึงข้อมูล/chunking, `Context Precision` ต่ำ → เพิ่ม reranker/กรอง noise, `Faithfulness` ต่ำ → แก้ prompt & grounded citations",
    "**Context Precision ถ่วงน้ำหนักตามอันดับ**: เอกสารที่ใช่อยู่อันดับ 1 มีค่ามากกว่าตกไปอยู่อันดับท้ายอย่างมาก",
    "**Eval Gate ต้องแยกเกณฑ์ทุกแกน** และวางไว้หลัง deterministic checks ที่เร็วและฟรี เพื่อจับ silent regression ก่อน merge ขึ้น production",
    "**Calibrate LLM Judge กับเคสภาษาไทยจริงเสมอ** อย่าเชื่อตัวเลขดิบโดยไม่เปิดอ่าน failure cases ด้วยตา",
  ],

  reviewCards: [
    rc(
      "d129-rc-1",
      "RAG Triad 3 แกนมีอะไรบ้าง และแต่ละแกนวัดความสัมพันธ์ระหว่างคู่ข้อมูลใด?",
      "1) Faithfulness (Response ↔ Retrieved Contexts), 2) Context Precision (Query ↔ Retrieved Contexts + อันดับ), 3) Context Recall (Reference ↔ Retrieved Contexts)",
    ),
    rc(
      "d129-rc-2",
      "ถ้า Context Recall = 0.90 แต่ Context Precision = 0.45 อาการของระบบ RAG คืออะไร และควรแก้ด้วยวิธีใด?",
      "ดึงข้อมูลมาครบแต่มี chunk ขยะปนอยู่บน ๆ เยอะเกินไป → แก้ด้วย Cross-Encoder Reranker, metadata filtering หรือลด noise ใน chunking",
    ),
    rc(
      "d129-rc-3",
      "เหตุใดเราจึงควรรัน Deterministic Evals (schema, Recall@k) ก่อน Ragas LLM-as-a-Judge ใน CI?",
      "Deterministic checks เร็ว ฟรี และคงที่ 100% จึงกรองบั๊กพื้นฐานออกได้ก่อนที่จะเสียเวลาและค่า API เรียก LLM Judge",
    ),
  ],

  sources: [
    { label: "Ragas Official Documentation — Metrics Overview (Faithfulness, Context Precision & Recall)", href: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/" },
    { label: "Ragas — Evaluation Dataset & SingleTurnSample Schema", href: "https://docs.ragas.io/en/stable/concepts/components/eval_dataset/" },
    { label: "Promptfoo Docs — Evaluating RAG Pipelines", href: "https://www.promptfoo.dev/docs/guides/evaluate-rag/" },
    { label: "Pydantic v2 Official Documentation — Models & Validation", href: "https://docs.pydantic.dev/latest/concepts/models/" },
  ],

  glossary: ["ragas", "rag", "groundedness", "chunking", "golden-dataset", "llm-as-a-judge", "mrr", "promptfoo"],
});
