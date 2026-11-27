import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D103 — Phase 4 / Block B26
 * Query Transformation (Rewriting, HyDE, Multi-Query with Latency Guard)
 */
export const d103: Lesson = defineLesson({
  day: 103,
  titleTh: "แปลงคำถามให้ค้นเจอด้วย Query Transformation (Rewriting, HyDE, Multi-Query + Latency Guard)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · แก้คำถามกำกวม/ต่อเนื่องด้วย Rewrite, Multi-Query และ HyDE โดยคุม P95 Latency ไม่ให้พุ่ง",
  icon: "route",
  visual: {
    id: "reranker-query-transform",
    title: "Query Transformation — Rewriting, Multi-Query & HyDE พร้อม Latency Budget",
    caption: "ดูวิธีแปลงคำถามกำกวมหรือต่อเนื่องเป็นคำค้นที่คมขึ้น โดยคุมจำนวนคำค้นและ timeout ไม่ให้ P95 พุ่ง",
    alt: "แผนภาพ Query Rewriting, HyDE และ Multi-Query พร้อม latency guard",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% ด้วย mock/deterministic rewriter (เชื่อมต่อ LLM API จริงได้ตามสัญญาเดียวกัน)",
  tools: ["Python 3.12", "Qdrant / pgvector", "Reranker", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "คำถามผู้ใช้จริงมักสั้น กำกวม หรืออ้างอิงบทสนทนาก่อนหน้า",
      body: "ผู้ใช้แชตจริงไม่ค่อยพิมพ์คำถามสมบูรณ์แบบในรอบเดียว แต่มักถามต่อว่า `\"แล้วถ้าแกะกล่องแล้ว มันคืนได้ไหม\"` ซึ่งหากส่งไปค้นตรง ๆ ทั้ง {{bm25}} และ Vector Search จะหลงทางทันที",
      lessonNote: "วันนี้เราแก้ปัญหาที่ต้นน้ำก่อนถึง Retriever ด้วยชั้น **Query Transformation**",
    },
    {
      node: 1,
      heading: "ลดช่องว่างทางภาษาระหว่างคำถามสั้นกับเอกสารทางการ",
      body: "ลูกค้าพิมพ์ภาษาพูดไทยสั้น ๆ แต่เอกสารองค์กรเขียนเป็นระเบียบทางการหรือศัพท์ภาษาอังกฤษ การขยายมุมมองคำค้นช่วยดึงเอกสารที่ใช่เข้าสู่ Stage 1 ได้มากขึ้น",
      lessonNote: "เราเชื่อม **Conversational Rewriting**, **Multi-Query + {{rrf}}** และ **{{hyde}}** เข้ากับท่อ Hybrid {{rag}}",
    },
    {
      node: 2,
      heading: "ใช้ LLM ช่วยแปลงคำค้นอย่างมีขอบเขต",
      body: "โมเดล {{llm}} ขนาดเล็กที่เร็วสามารถแก้สรรพนาม สร้างคำค้นหลายมุม หรือร่างคำตอบสมมติได้ดี แต่ต้องไม่ปล่อยให้มันแต่งรหัสเอกสารหรือแปลงคำถามที่ชัดอยู่แล้ว",
      lessonNote: "เราจะแยกให้ขาดว่าคำถามแบบไหนควร Rewrite, แบบไหนเหมาะกับ HyDE และแบบไหนควร **ข้าม (Bypass)**",
    },
    {
      node: 4,
      heading: "ใส่ Latency Guard เพื่อไม่ให้ TTFT พุ่งจนผู้ใช้รอไม่ไหว",
      body: "การเรียก LLM แปลงคำถามก่อนค้นหาเพิ่มเวลาตรง ๆ เข้า {{ttft}} และ P95 latency ของแอป หากไม่คุมจำนวนคำค้นและงบเวลา แอปจะช้าลง 2–3 เท่า",
      lessonNote: "แบบฝึกหัดวันนี้สร้างท่อ Query Transformation พร้อม Bypass Gate, Fan-Out Cap และ Timeout Fallback ครบชุด",
    },
  ],

  objectives: [
    "**แก้ปัญหาคำถามต่อเนื่อง (Follow-up Query)** ด้วย Conversational Query Rewriting เพื่อแทนที่สรรพนามลอย (เช่น `\"มัน\"`, `\"อันเมื่อกี้\"`) ให้เป็นคำค้นที่จบในตัว",
    "**เลือกใช้และอธิบายข้อจำกัด** ของ **Multi-Query + {{rrf}}** กับ **{{hyde}}** (Hypothetical Document Embeddings) ได้ตรงตามประเภทคำถาม",
    "**สร้าง Latency Guard** ที่มี Bypass Gate (ข้ามการแปลงเมื่อคำถามชัดหรือมีรหัสเอกสาร), จำกัดจำนวน `max_queries` และ Fallback กลับไปใช้คำถามเดิมเมื่อเกินงบเวลา",
  ],

  prerequisites: [
    "เข้าใจ Hybrid Search และ {{rrf}} (แนะนำ Day 101)",
    "เข้าใจ 2-Stage Retrieval และ {{reranker}} (แนะนำ Day 102)",
    "เขียน Regex พื้นฐาน (`re.search`), ฟังก์ชัน `Callable` และรัน `pytest` ได้",
    "ไม่ต้องใช้ API key — ใช้ mock/deterministic rewriter บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "บทเรียนนี้ใช้ Python standard library (`re`, `time`, `dataclasses`) และ `pytest` เพื่อสร้างและทดสอบท่อ Query Transformation พร้อม Latency Guard แบบ deterministic 100%",
    commands: `uv init ai-day103 && cd ai-day103
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day103` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pytest` และ `ruff` สำเร็จ"],
      ["ready", "รัน `uv run python --version` แล้วเห็น Python 3.11+"],
    ],
    note: "โครงสร้างฟังก์ชัน `rewriter` และ `multi_query_fn` ออกแบบเป็น `Callable` คุณจึงเสียบโมเดล LLM จริง (เช่น small fast model) เข้าไปแทน mock ได้ทันทีในโปรเจกต์จริง",
  },

  concepts: [
    {
      id: "conversational-rewriting",
      title: "1 · Conversational Query Rewriting: แก้สรรพนามลอยให้เป็นคำถามจบในตัว",
      paragraphs: [
        "ในแอปแชตหลายรอบ (Multi-turn Chat) ผู้ใช้มักถามต่อจากบริบทเดิม เช่น รอบแรกถามว่า `\"นโยบายคืนเงินสินค้าอิเล็กทรอนิกส์เป็นยังไง\"` แล้วรอบสองถามสั้น ๆ ว่า `\"แล้วถ้าแกะกล่องแล้ว มันคืนได้ไหม\"` หากเราส่งข้อความรอบสองไปค้นใน Qdrant หรือ {{bm25}} โดยตรง Retriever จะไม่รู้เลยว่า `\"มัน\"` หมายถึงสินค้าอิเล็กทรอนิกส์",
        "**Conversational Query Rewriting** แก้ปัญหานี้ด้วยการส่งประวัติแชตล่าสุด (ปกติเก็บเพียง 2–4 รอบล่าสุดเพื่อคุมโทเคน) คู่กับคำถามใหม่ให้โมเดล {{llm}} ขนาดเล็กเขียนเรียบเรียงเป็น **Standalone Query** เช่น `\"นโยบายคืนเงินสินค้าอิเล็กทรอนิกส์กรณีแกะกล่องแล้ว\"` แล้วจึงนำคำถามที่สมบูรณ์นี้ไปค้นหา",
        "ข้อสำคัญคือ Rewriter ต้อง **ไม่ตอบคำถามเอง** และต้อง **คงรหัสเฉพาะเดิมไว้ครบ** (ห้ามแก้หรือลบเลขใบแจ้งหนี้/ชื่อรุ่นสินค้า) หน้าที่เดียวของมันคือถอดบริบทจากประวัติแชตให้เป็นคำค้นที่คมขึ้น",
      ],
      analogy:
        "เหมือนบรรณารักษ์ที่ได้ยินคุณถามต่อว่า *\"แล้วเล่มเมื่อกี้มีภาคต่อไหม\"* — บรรณารักษ์จะแปลงในหัวก่อนว่าคุณหมายถึง *\"หนังสือ Python วิศวกรรม AI ภาคต่อ\"* แล้วค่อยพิมพ์คำเต็มนั้นลงช่องค้นหาห้องสมุด",
      bullets: [
        "**ใช้เมื่อไร**: มีประวัติแชตก่อนหน้า (`history`) และคำถามมีสรรพนามหรือคำอ้างอิง (`\"มัน\"`, `\"อันนี้\"`, `\"อันเมื่อกี้\"`, `\"เรื่องนี้\"`, `\"แล้วถ้า...\"`)",
        "**หน้าต่างประวัติที่เหมาะสม**: ส่งเพียง 2–4 รอบล่าสุด (Sliding Window) เพื่อไม่ให้หัวข้อเก่าเมื่อ 10 นาทีก่อนมาปน",
        "**ข้อควรระวัง**: ห้ามรัน Rewriter กับคำถามรอบแรกที่ชัดเจนอยู่แล้ว เพราะเสียเวลาเปล่าและอาจทำให้คำถามเพี้ยน",
      ],
      whyTitle: "Why this matters — แก้อาการ 'แชตรอบแรกตอบดี รอบสองหลุดประเด็น'",
      whyParagraphs: [
        "ปัญหาที่เจอบ่อยมากเมื่อนำ {{rag}} ไปทำแชตบอตคือการทดสอบคำถามเดี่ยวผ่านหมด แต่พอผู้ใช้จริงคุยต่อเนื่อง 2–3 ประโยค ระบบกลับดึงเอกสารผิดเรื่องทันที",
        "Conversational Rewriting ที่ดีเพียง 1 ขั้นช่วยกู้ Recall ของบทสนทนาต่อเนื่องกลับมาได้ทันทีโดยไม่ต้องเปลี่ยนดัชนีเอกสารเลย",
      ],
    },
    {
      id: "multi-query-and-hyde",
      title: "2 · Multi-Query Fan-Out + RRF และ HyDE (Hypothetical Document Embeddings)",
      paragraphs: [
        "บางครั้งคำถามไม่ได้กำกวมเพราะสรรพนาม แต่กำกวมเพราะ **ภาษาพูดของผู้ใช้ไม่ตรงกับภาษาเอกสาร** เช่น ผู้ใช้ถามว่า `\"อยากปิดบัญชีแล้วเอาเงินคืนทำไง\"` ขณะที่เอกสารทางการใช้คำว่า `\"การยกเลิกสมาชิก\"` และ `\"refund policy\"` เทคนิค **Multi-Query** จะขยายคำถาม 1 ประโยคออกเป็นคำค้น 2–3 มุมมองที่เสริมกัน แล้วส่งไปค้นพร้อมกันก่อนผสานและตัดซ้ำด้วย {{rrf}} (Day 101)",
        "อีกเทคนิคหนึ่งคือ **{{hyde}} (Hypothetical Document Embeddings)**: แทนที่จะนำคำถามสั้น ๆ ไปสร้าง {{embedding}} ตรง ๆ เราให้โมเดล {{llm}} ลองร่าง *ย่อหน้าคำตอบสมมติ* ในสไตล์เอกสารทางการ (แม้รายละเอียดอาจไม่ถูก 100%) แล้วนำเวกเตอร์ของย่อหน้าสมมตินั้นไปค้นเอกสารจริงใน Vector Store เหตุผลคือเวกเตอร์ของ \"เอกสารกับเอกสาร\" มักอยู่ใกล้กันในปริภูมิเวกเตอร์มากกว่า \"คำถามสั้นกับเอกสาร\"",
        "อย่างไรก็ตาม **ห้ามใช้ HyDE กับคำถามที่มีรหัสเฉพาะหรือตัวเลขเป๊ะ ๆ** (เช่น `#INV-2026-009` หรือ `มาตรา 26 PDPA`) เพราะโมเดลจะเดารหัสหรือเนื้อหาสมมติมั่วขึ้นมาจนดึงเวกเตอร์หลุดออกนอกเป้าหมาย — สำหรับเคสที่มีรหัสเฉพาะ Hybrid BM25 + Dense ตรง ๆ ชนะขาดและเร็วกว่ามาก",
      ],
      analogy:
        "Multi-Query เหมือนส่งผู้ช่วย 3 คนไปค้นเอกสารคนละคำสำคัญแล้วเอาผลมารวมกัน ส่วน HyDE เหมือนลองร่าง 'หน้าตาคำตอบในจินตนาการ' ขึ้นมา 1 ย่อหน้า แล้วเอาไปทาบหาเอกสารจริงที่เขียนด้วยสำนวนคล้ายกัน",
      code: {
        language: "python",
        filename: "multi_query_rrf.py",
        code: `def fuse_multi_query_results(
    ranked_lists: list[list[str]],
    k: int = 60,
    top_k: int = 5,
) -> list[str]:
    """ผสานผลค้นหาจากหลายคำค้น (Multi-Query) ด้วย RRF และกัน doc ซ้ำ"""
    scores: dict[str, float] = {}
    for docs in ranked_lists:
        seen: set[str] = set()
        for rank, doc_id in enumerate(docs, start=1):
            if doc_id in seen:
                continue
            seen.add(doc_id)
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    ordered = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [doc_id for doc_id, _ in ordered[:top_k]]`,
        caption: "RRF จาก Day 101 นำกลับมาใช้ผสานผลจาก Multi-Query fan-out ได้โดยตรงโดยไม่ต้องคิดสูตรรวมคะแนนใหม่",
      },
      whyTitle: "Why this matters — เลือกเครื่องมือให้ตรงอาการ ไม่ใช่เปิดทุกเทคนิคพร้อมกัน",
      whyParagraphs: [
        "มือใหม่จำนวนมากเปิดทั้ง Rewrite + HyDE + Multi-Query 5 คำค้น + Reranker พร้อมกันทุกคำถาม ส่งผลให้ค่า API พุ่งและเวลาตอบช้าเกิน 3 วินาที ทั้งที่ 70% ของคำถามไม่ต้องการมัน",
        "วิศวกร AI ที่ดีใช้ **Conditional Routing**: คำถามชัดมีรหัส → ข้าม, คำถามต่อเนื่อง → Rewrite, คำถามกว้าง/ภาษาพูด → Multi-Query (2–3 คำ) หรือ HyDE เฉพาะกรณี",
      ],
    },
    {
      id: "latency-guard",
      title: "3 · Latency Guard: Bypass Gate, Fan-Out Cap และ Timeout Fallback",
      paragraphs: [
        "ทุกเทคนิคในตระกูล Query Transformation ทำงานอยู่ **บนเส้นทางวิกฤต (Critical Path)** ก่อนที่ระบบจะเริ่มค้นหาเอกสารด้วยซ้ำ หากขั้นตอนนี้ใช้เวลา `600 ms` นั่นแปลว่า {{ttft}} ของผู้ใช้ทุกคนจะช้าลง `600 ms` ทันที",
        "เราจึงต้องวาง **Latency Guard 3 ชั้น** ครอบชั้นแปลงคำถามเสมอ: (1) **Bypass Gate** ตรวจด้วยกฎเร็วระดับไมโครวินาที (`regex` / คำอ้างอิง) — ถ้าพบเลขเอกสารเฉพาะอย่าง `#INV-2026-009` หรือเป็นคำถามเดี่ยวที่ชัดเจน ให้ข้าม LLM Rewriter (`0 ms` overhead), (2) **Fan-Out Cap** จำกัด Multi-Query ไม่เกิน `max_queries = 3` และกันคำค้นซ้ำก่อนยิงเข้าดัชนี และ (3) **Timeout Budget Fallback** ตั้งงบเวลารวม (เช่น `timeout_ms = 200–300 ms`) หาก Rewriter หรือ Multi-Query ช้าเกินงบหรือ error ให้ตกกลับไปใช้ `[original_query]` ทันที",
        "แนวคิดนี้ทำให้ Query Transformation เป็นตัวช่วยที่ **เพิ่ม Recall เฉพาะตอนที่จำเป็น** โดยไม่ทำลาย P95 latency ของระบบ {{rag}}",
      ],
      analogy:
        "เหมือนระบบนำทาง GPS: ถ้าทางข้างหน้าตรงและโล่งอยู่แล้วก็ไม่ต้องเสียเวลาคำนวณทางลัดใหม่ (Bypass) และถ้าเซิร์ฟเวอร์หาทางลัดตอบช้าเกิน 0.2 วินาทีก็ให้ขับตามทางหลักทันที (Fallback)",
      bullets: [
        "**Bypass Gate (`< 0.1 ms`)**: เจอรหัสเอกสาร (`#INV-...`, `SKU-...`) หรือคำถามเดี่ยวชัดเจน → ข้าม LLM ทันที",
        "**Fan-Out Cap (`max_queries <= 3`)**: ยิ่งขยายคำค้นเยอะ ยิ่งเพิ่มโหลด Qdrant/BM25 และเสี่ยงดึงเอกสารนอกเรื่อง",
        "**Timeout Fallback**: หากแปลงคำถามช้าเกิน `timeout_ms` หรือ API error → ใช้ `[original_query]` แล้วบันทึก metric `used_fallback=True`",
      ],
      whyTitle: "Why this matters — Recall เพิ่ม 5% แต่ P95 พุ่ง 2 วินาที มักไม่คุ้มใน Production",
      whyParagraphs: [
        "ผู้ใช้แอปแชตสังเกตเห็นความหน่วงเกิน 1.5–2 วินาทีได้ทันที การคุมงบเวลาให้ชั้น Query Transformation จึงสำคัญพอ ๆ กับตัวคุณภาพคำค้น",
        "เมื่อวัดผลควบคู่กันทั้ง **Recall@5** และ **Latency Overhead** คุณจะรู้ทันทีว่าควรเปิด Bypass Gate เข้มแค่ไหน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Query Transformation เทียบกับ Search Middleware ในเว็บแอป",
      body: [
        "ถ้าคุณเคยทำ Search API ที่มี Query Normalization, Synonym Expansion และ Timeout Middleware โครงสร้าง Query Transformation ใน AI คือภาพสะท้อนเดียวกัน:",
      ],
      table: [
        ["Conversational Rewriting", "แนบ context จาก session มาเติมคำค้นที่ขาดให้ครบ"],
        ["Multi-Query Fan-Out + RRF", "แตก synonym queries แล้ว `Promise.all` มารวมผลและ dedup"],
        ["Bypass Gate (exact ID)", "Fast-path router: เจอ order ID ยิงตรงเข้า index ไม่ผ่าน LLM"],
        ["Latency Guard (`timeout_ms`)", "`AbortController` timeout + fallback ไปใช้ raw query string"],
      ],
    },
    student: {
      title: "First-Year Note — แนวคิด Budget Time และ Deduplication แบบรักษาลำดับ",
      body: [
        "เวลาคุมงบเวลาข้าม 2 ขั้นตอน (เช่น Rewrite แล้วค่อย Multi-Query) เราเก็บเวลาเริ่มต้น `start = time.perf_counter()` ไว้ครั้งเดียว แล้วคำนวณเวลาที่เหลือ `remaining_ms = timeout_ms - elapsed_ms` ก่อนเริ่มขั้นที่สอง ถ้าเวลาหมดแล้วก็ข้ามขั้นที่สองทันที",
        "สำหรับการตัดคำค้นซ้ำโดยยังคงลำดับเดิม (ให้คำถามหลักอยู่ตัวแรกเสมอ) ใน Python สามารถใช้ `dict.fromkeys(queries)` หรือ `seen: set[str]` แล้วตัดความยาวด้วย `[:max_queries]` ได้อย่างสะอาดและอ่านง่าย",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: ระบบผู้ช่วยลูกค้าต้องรับคำถาม 2 แบบติดกัน — แบบแรกมีรหัสใบแจ้งหนี้ชัด (`#INV-2026-009`) และแบบสองเป็นคำถามต่อเนื่องที่มีคำว่า `\"มัน\"` ลองดูทีละขั้นว่า Bypass Gate, Rewriting และ Multi-Query + RRF ทำงานร่วมกันอย่างไร",
    steps: [
      {
        title: "1 · สร้าง Bypass Gate แยกคำถามรหัสเฉพาะกับคำถามต่อเนื่อง",
        explain:
          "ใช้ regex ตรวจจับรหัสเอกสาร (`#INV-...`, `SKU-...`, `ORD-...`) เพื่อส่งเข้า fast-path ทันที และตรวจคำสรรพนามอ้างอิงเฉพาะเมื่อมีประวัติแชต (`history`)",
        code: {
          language: "python",
          filename: "worked_query_transform.py",
          code: `import re

EXACT_ID_RE = re.compile(r"(#?INV-\d{4}-\d+|SKU-\d+|ORD-\d+)", re.IGNORECASE)
PRONOUNS = ("มัน", "อันนี้", "อันนั้น", "อันเมื่อกี้", "เรื่องนี้", "ตัวนี้", "it", "that", "this")


def decide_strategy(query: str, history: list[str]) -> str:
    if EXACT_ID_RE.search(query):
        return "bypass_exact_id"
    lowered = query.lower()
    if history and any(p in lowered for p in PRONOUNS):
        return "rewrite_and_expand"
    return "expand_only"


print("Q1:", decide_strategy("เช็กสถานะ #INV-2026-009 หน่อย", []))
print("Q2:", decide_strategy("แล้วถ้าแกะกล่องแล้ว มันคืนได้ไหม", ["นโยบายคืนเงินหูฟังบลูทูธ"]))
print("Q3:", decide_strategy("อยากยกเลิกสมาชิกแล้วขอเงินคืน", []))`,
        },
        output: `Q1: bypass_exact_id
Q2: rewrite_and_expand
Q3: expand_only`,
      },
      {
        title: "2 · แปลงคำถามต่อเนื่อง + ขยายเป็น Multi-Query (ไม่เกิน 3 คำค้น)",
        explain:
          "สำหรับ Q2 เราเขียนใหม่ให้จบในตัวก่อน แล้วขยายคำค้นเสริมเป็นภาษาทางการ/อังกฤษ ตัดคำซ้ำโดยเก็บคำค้นหลักไว้ตัวแรก และจำกัดไม่เกิน `max_queries = 3`",
        code: {
          language: "python",
          filename: "worked_query_transform.py",
          code: `def mock_rewrite(query: str, history: list[str]) -> str:
    topic = history[-1]
    return f"{topic} — {query.replace('มัน', 'สินค้า')}"


def mock_multi_query(query: str) -> list[str]:
    return [
        query,
        "นโยบายคืนเงินกรณีแกะกล่องสินค้าอิเล็กทรอนิกส์",
        "opened box return refund policy electronics",
        "คำค้นส่วนเกินที่ควรถูกตัดออก",
    ]


rewritten = mock_rewrite("แล้วถ้าแกะกล่องแล้ว มันคืนได้ไหม", ["นโยบายคืนเงินหูฟังบลูทูธ"])
expanded = list(dict.fromkeys([rewritten, *mock_multi_query(rewritten)]))[:3]

for i, q in enumerate(expanded, start=1):
    print(f"Query #{i}: {q}")`,
        },
        output: `Query #1: นโยบายคืนเงินหูฟังบลูทูธ — แล้วถ้าแกะกล่องแล้ว สินค้าคืนได้ไหม
Query #2: นโยบายคืนเงินกรณีแกะกล่องสินค้าอิเล็กทรอนิกส์
Query #3: opened box return refund policy electronics`,
      },
      {
        title: "3 · ยิง Retriever ทุกคำค้นแล้วรวมผลด้วย RRF",
        explain:
          "แต่ละคำค้นอาจได้เอกสารที่ตรงมุมต่างกัน เช่น คำค้นทางการเจอ `doc_opened_box_policy` เป็นอันดับ 1 ส่วนคำค้นภาษาอังกฤษเจอทั้ง `doc_opened_box_policy` และ `doc_refund_faq` — RRF จึงดันเอกสารที่ตรงทั้งหลายมุมขึ้นอันดับ 1",
        code: {
          language: "python",
          filename: "worked_query_transform.py",
          code: `MOCK_INDEX = {
    expanded[0]: ["doc_headphone_spec", "doc_opened_box_policy"],
    expanded[1]: ["doc_opened_box_policy", "doc_refund_faq"],
    expanded[2]: ["doc_opened_box_policy", "doc_refund_faq", "doc_warranty"],
}

scores: dict[str, float] = {}
for q in expanded:
    for rank, doc_id in enumerate(MOCK_INDEX[q], start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (60 + rank)

fused = sorted(scores.items(), key=lambda x: (-x[1], x[0]))
for idx, (doc_id, score) in enumerate(fused[:3], start=1):
    print(f"RRF #{idx} {doc_id:<24} score={score:.4f}")`,
        },
        output: `RRF #1 doc_opened_box_policy    score=0.0489
RRF #2 doc_refund_faq           score=0.0323
RRF #3 doc_headphone_spec       score=0.0164`,
      },
    ],
    gotcha:
      "จุดสังเกต: คำว่า `\"it\"` ในภาษาอังกฤษถ้าเช็กแบบ substring (`\"it\" in lowered`) อาจไปตรงกับคำว่า `\"credit\"` หรือ `\"limit\"` โดยไม่ตั้งใจ ในโค้ดจริงสำหรับคำภาษาอังกฤษควรตรวจด้วยขอบคำ (`\\bit\\b`) ส่วนคำภาษาไทยอย่าง `\"มัน\"` หรือ `\"อันเมื่อกี้\"` ใช้ substring หรือตรวจร่วมกับประวัติแชตได้",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างฟังก์ชัน `transform_and_retrieve` ที่รวม **Bypass Gate**, **Conversational Rewriting**, **Multi-Query Fan-Out + RRF** และ **Latency Guard** ไว้ในท่อเดียว พร้อมทดสอบทุกเงื่อนไขแบบ offline ด้วย `pytest`",
    requirements: [
      "ตรวจพารามิเตอร์: หาก `max_queries <= 0`, `timeout_ms <= 0`, `rrf_k <= 0` หรือ `top_k <= 0` ให้โยน `ValueError`",
      "**Bypass Gate (Exact ID)**: หาก `query` มีรหัสเอกสารตรงตาม pattern `(#?INV-\\d{4}-\\d+|SKU-\\d+|ORD-\\d+)` (ไม่สนตัวพิมพ์เล็ก-ใหญ่) ให้ข้ามทั้ง `rewriter` และ `multi_query_fn` (ไม่เรียกเลย!), ตั้ง `strategy=\"bypass\"`, ใช้ `executed_queries=[query]` แล้วค้นคืนทันที",
      "**Conversational Rewriting**: หากไม่ถูก bypass และ `history` ไม่ว่าง พร้อมกับ `query` มีคำอ้างอิง (`\"มัน\"`, `\"อันนี้\"`, `\"อันนั้น\"`, `\"อันเมื่อกี้\"`, `\"เรื่องนี้\"`, `\"ตัวนี้\"`, หรือคำอังกฤษ `it`/`that`/`this` แบบเต็มคำ) ให้เรียก `rewriter(query, history)` ภายใต้จับเวลา — หากเกิด exception, ได้สตริงว่าง หรือใช้เวลาเกิน `timeout_ms` ให้ตั้ง `used_fallback=True` และใช้ `query` เดิมต่อ",
      "**Multi-Query Fan-Out**: หากไม่ถูก bypass, มี `multi_query_fn` (ไม่ใช่ `None`) และยังเหลือเวลาในงบ `timeout_ms` ให้เรียก `multi_query_fn(active_query)` แล้วรวม `[active_query, *extras]` แบบตัดซ้ำรักษาลำดับและจำกัดไม่เกิน `max_queries` — หากเกิด exception หรือเวลารวมเกิน `timeout_ms` ให้ตั้ง `used_fallback=True` และใช้เพียง `[active_query]`",
      "**RRF Retrieval**: เรียก `retriever(q)` สำหรับทุกคำค้นใน `executed_queries` ผสานผลด้วย RRF (`1 / (rrf_k + rank)`, กัน `doc_id` ซ้ำภายในแต่ละลิสต์, เรียง `(-score, doc_id)`) แล้วคืน `TransformResult` ที่มี `docs[:top_k]`",
    ],
    starter: {
      language: "python",
      filename: "exercise_day103.py",
      code: `from __future__ import annotations

from dataclasses import dataclass
import re
import time
from typing import Callable

EXACT_ID_RE = re.compile(r"(#?INV-\d{4}-\d+|SKU-\d+|ORD-\d+)", re.IGNORECASE)
THAI_REFS = ("มัน", "อันนี้", "อันนั้น", "อันเมื่อกี้", "เรื่องนี้", "ตัวนี้")
EN_REF_RE = re.compile(r"\b(it|that|this)\b", re.IGNORECASE)


@dataclass(frozen=True)
class TransformResult:
    strategy: str  # "bypass" | "rewrite" | "multi_query" | "direct"
    executed_queries: list[str]
    docs: list[str]
    used_fallback: bool
    transform_ms: float


RewriterFn = Callable[[str, list[str]], str]
MultiQueryFn = Callable[[str], list[str]]
RetrieverFn = Callable[[str], list[str]]


def transform_and_retrieve(
    query: str,
    history: list[str],
    retriever: RetrieverFn,
    *,
    rewriter: RewriterFn | None = None,
    multi_query_fn: MultiQueryFn | None = None,
    max_queries: int = 3,
    timeout_ms: float = 200.0,
    rrf_k: int = 60,
    top_k: int = 5,
) -> TransformResult:
    """แปลงคำถามด้วย Bypass Gate + Rewrite + Multi-Query ภายใต้ Latency Guard แล้วรวมผลด้วย RRF"""
    # TODO: 1) validate arguments
    # TODO: 2) ตรวจ Exact ID bypass -> ข้าม rewriter และ multi_query_fn
    # TODO: 3) ตรวจ conversational pronoun + history -> เรียก rewriter พร้อม latency/error fallback
    # TODO: 4) เรียก multi_query_fn เมื่อยังเหลืองบเวลา -> dedup และจำกัด max_queries
    # TODO: 5) เรียก retriever(q) ทุกคำค้นแล้วรวมผลด้วย RRF คืน top_k
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day103.py",
      code: `import time
import pytest
from exercise_day103 import transform_and_retrieve


def test_exact_id_bypasses_rewrite_and_multi_query():
    llm_calls = 0

    def rewriter(q: str, _h: list[str]) -> str:
        nonlocal llm_calls
        llm_calls += 1
        return f"rewritten {q}"

    def multi_query(q: str) -> list[str]:
        nonlocal llm_calls
        llm_calls += 1
        return [q, "extra query"]

    def retriever(q: str) -> list[str]:
        return ["doc_inv_009", "doc_overdue"] if "INV-2026-009" in q else []

    res = transform_and_retrieve(
        "เช็ก #INV-2026-009 มันค้างจ่ายไหม",
        history=["รายการใบแจ้งหนี้เดือนนี้"],
        retriever=retriever,
        rewriter=rewriter,
        multi_query_fn=multi_query,
    )
    assert res.strategy == "bypass"
    assert llm_calls == 0
    assert res.executed_queries == ["เช็ก #INV-2026-009 มันค้างจ่ายไหม"]
    assert res.docs[0] == "doc_inv_009"
    assert res.used_fallback is False


def test_conversational_pronoun_triggers_rewrite_with_history():
    def rewriter(_q: str, history: list[str]) -> str:
        return f"{history[-1]} แกะกล่องแล้วคืนเงินได้ไหม"

    def retriever(q: str) -> list[str]:
        if "หูฟัง" in q and "แกะกล่อง" in q:
            return ["doc_opened_box", "doc_refund"]
        return ["doc_generic"]

    res = transform_and_retrieve(
        "แล้วถ้าแกะกล่องแล้ว มันคืนได้ไหม",
        history=["นโยบายคืนเงินหูฟัง"],
        retriever=retriever,
        rewriter=rewriter,
    )
    assert res.strategy == "rewrite"
    assert res.used_fallback is False
    assert "หูฟัง" in res.executed_queries[0]
    assert res.docs == ["doc_opened_box", "doc_refund"]


def test_multi_query_caps_fanout_and_fuses_with_rrf():
    def multi_query(q: str) -> list[str]:
        return [q, "นโยบายยกเลิกสมาชิก", "cancel subscription refund", "ignored_4th_query"]

    index = {
        "อยากปิดบัญชีขอเงินคืน": ["doc_a", "doc_policy"],
        "นโยบายยกเลิกสมาชิก": ["doc_policy", "doc_b"],
        "cancel subscription refund": ["doc_policy", "doc_b", "doc_c"],
    }

    res = transform_and_retrieve(
        "อยากปิดบัญชีขอเงินคืน",
        history=[],
        retriever=lambda q: index.get(q, []),
        multi_query_fn=multi_query,
        max_queries=3,
        top_k=2,
    )
    assert res.strategy == "multi_query"
    assert len(res.executed_queries) == 3
    assert "ignored_4th_query" not in res.executed_queries
    assert res.docs == ["doc_policy", "doc_b"]


def test_rewriter_error_falls_back_to_original_query():
    def broken_rewriter(_q: str, _h: list[str]) -> str:
        raise RuntimeError("LLM timeout")

    res = transform_and_retrieve(
        "อันเมื่อกี้คิดค่าส่งไหม",
        history=["สินค้าหูฟัง"],
        retriever=lambda _q: ["doc_shipping"],
        rewriter=broken_rewriter,
    )
    assert res.used_fallback is True
    assert res.executed_queries == ["อันเมื่อกี้คิดค่าส่งไหม"]
    assert res.docs == ["doc_shipping"]


def test_latency_guard_falls_back_when_transform_exceeds_budget():
    def slow_multi_query(q: str) -> list[str]:
        time.sleep(0.03)
        return [q, "extra_1", "extra_2"]

    res = transform_and_retrieve(
        "ขอรายละเอียดค่าธรรมเนียม",
        history=[],
        retriever=lambda _q: ["doc_fee"],
        multi_query_fn=slow_multi_query,
        timeout_ms=10.0,
    )
    assert res.used_fallback is True
    assert res.executed_queries == ["ขอรายละเอียดค่าธรรมเนียม"]
    assert res.transform_ms >= 10.0

    with pytest.raises(ValueError):
        transform_and_retrieve("q", [], lambda _: [], max_queries=0)
`,
    },
    selfCheck: [
      "คำถามที่มี `#INV-2026-009` เข้า Bypass Gate โดยไม่เรียก `rewriter` หรือ `multi_query_fn` แม้ `history` จะไม่ว่าง",
      "คำถามต่อเนื่องที่มี `\"มัน\"` พร้อม `history` เรียก `rewriter` เพื่อสร้างคำถามจบในตัว",
      "Multi-Query ตัดคำค้นซ้ำ รักษาคำค้นหลักไว้ตัวแรก และจำกัดไม่เกิน `max_queries`",
      "เมื่อ `rewriter` หรือ `multi_query_fn` โยน error หรือใช้เวลารวมเกิน `timeout_ms` ระบบสลับกลับใช้คำถามเดิมอย่างปลอดภัย (`used_fallback=True`)",
      "รัน `uv run pytest -q` ผ่านครบ 5 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "เขียนฟังก์ชันช่วยเล็ก ๆ `_needs_rewrite(query: str, history: list[str]) -> bool` ที่คืน `bool(history) and (any(ref in query for ref in THAI_REFS) or bool(EN_REF_RE.search(query)))` และ `_rrf_fuse(lists, k, top_k)` แยกออกมาให้โค้ดหลักสะอาด",
      },
      {
        body: "จับเวลาเริ่มต้นของชั้น transform ด้วย `t0 = time.perf_counter()` และคำนวณ `elapsed_ms = lambda: (time.perf_counter() - t0) * 1000.0` ก่อนเข้าขั้น Multi-Query ให้ตรวจ `if multi_query_fn is not None and elapsed_ms() <= timeout_ms:` และหลังเรียกเสร็จตรวจซ้ำอีกครั้งว่า `elapsed_ms() > timeout_ms` หรือไม่",
      },
      {
        body: "โครงหลักของ `transform_and_retrieve` เกือบครบแล้ว — เหลือเติมการเรียก `multi_query_fn` และฟังก์ชัน `_rrf_fuse` ด้านล่าง",
        code: {
          language: "python",
          filename: "hint_day103.py",
          code: `def _rrf_fuse(ranked_lists: list[list[str]], k: int, top_k: int) -> list[str]:
    scores: dict[str, float] = {}
    for docs in ranked_lists:
        seen: set[str] = set()
        for rank, doc_id in enumerate(docs, start=1):
            if doc_id in seen:
                continue
            seen.add(doc_id)
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return [doc_id for doc_id, _ in sorted(scores.items(), key=lambda x: (-x[1], x[0]))[:top_k]]


# ใน transform_and_retrieve:
# 1) ถ้า EXACT_ID_RE.search(query):
#    return TransformResult("bypass", [query], _rrf_fuse([retriever(query)], rrf_k, top_k), False, 0.0)
# 2) active_query = query; used_fallback = False; did_rewrite = False
#    ถ้า rewriter ไม่ใช่ None และ _needs_rewrite(query, history):
#        try เรียก rewriter -> ถ้า elapsed > timeout_ms หรือว่าง -> used_fallback = True
#        else active_query = rewritten; did_rewrite = True
# 3) ถัดไปเรียก multi_query_fn ถ้าไม่ None และ elapsed <= timeout_ms -> dedup ด้วย dict.fromkeys และ [:max_queries]`,
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
      title: "ใช้ HyDE กับคำถามที่มีรหัสสินค้าหรือเลขใบแจ้งหนี้",
      symptom: "LLM แต่งเลขใบแจ้งหนี้หรือรายละเอียดปลอมขึ้นมาในเอกสารสมมติ ทำให้เวกเตอร์เบี่ยงเบนและค้นเอกสารตัวจริงไม่เจอ",
      fix: "ใส่ Bypass Gate ตรวจจับรหัสเฉพาะ (`#INV-...`, `SKU-...`) ให้วิ่งตรงเข้า Hybrid Search (BM25 + Dense) โดยไม่ผ่าน {{hyde}} หรือ Rewriter",
    },
    {
      title: "รัน LLM Rewrite กับทุกคำถามโดยไม่เช็กว่าจำเป็นไหม",
      symptom: "เวลาตอบ ({{ttft}}) ช้าลง 400–800 ms ทุกคำขอ และค่าโทเคน LLM พุ่งขึ้นทั้งที่คำถามรอบแรกชัดเจนอยู่แล้ว",
      fix: "เรียก Rewriter เฉพาะเมื่อมีประวัติแชต (`history`) และพบคำอ้างอิง/ความกำกวม หรือใช้โมเดลขนาดเล็กความหน่วงต่ำพร้อม `timeout_ms`",
    },
    {
      title: "ขยาย Multi-Query มากเกินไป (เช่น 8–10 คำค้น) โดยไม่จำกัด",
      symptom: "ฐานข้อมูลเวกเตอร์รับโหลดพุ่ง 10 เท่า และเอกสารที่เกี่ยวข้องน้อยถูกดึงปะปนเข้ามามากจนทำให้ Precision ตก",
      fix: "จำกัด `max_queries` ไว้ที่ 2–3 คำค้น ตัดคำค้นซ้ำก่อนยิง และผสานผลด้วย {{rrf}} ตามด้วย {{reranker}}",
    },
    {
      title: "แนบประวัติแชตทั้งห้อง (20+ รอบ) เข้าไปใน Rewriter Prompt",
      symptom: "คำถามใหม่ถูกปนเปื้อนด้วยหัวข้อเก่าจาก 15 นาทีก่อน ทำให้คำค้นที่เขียนใหม่หลงไปดึงเอกสารผิดเรื่อง",
      fix: "ส่งเฉพาะหน้าต่างประวัติสั้น ๆ (2–4 รอบล่าสุด) และสั่งใน prompt ให้คงคำถามเดิมไว้หากไม่เกี่ยวกับบทสนทนาก่อนหน้า",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d103-q1",
        "เหตุใดจึง **ไม่ควร** ใช้เทคนิค HyDE (Hypothetical Document Embeddings) กับคำถามว่า `\"เช็กยอดค้างจ่ายของ #INV-2026-009\"`?",
        [
          ["เพราะ HyDE ไม่รองรับข้อความภาษาไทย", "HyDE ใช้ได้กับภาษาไทย แต่ไม่เหมาะกับรหัสเอกสารเฉพาะตัว"],
          [
            "เพราะโมเดลอาจแต่งข้อมูลสมมติหรือรหัสผิดเพี้ยนจนเวกเตอร์เบี่ยงเบน และรหัสตรงตัวควรค้นด้วย BM25/Hybrid ตรง ๆ โดยไม่เสียเวลาเรียก LLM",
            "ถูก — รหัสเฉพาะควรเข้า Bypass Gate ไปยัง Hybrid Search (BM25 + Dense) ทันทีทั้งแม่นกว่าและเร็วกว่า",
          ],
          ["เพราะ HyDE ใช้ได้เฉพาะกับฐานข้อมูล SQLite เท่านั้น", "HyDE เป็นเทคนิคฝั่ง query embedding ใช้กับ Vector Store ใดก็ได้"],
          ["เพราะ HyDE จะลบเอกสารต้นฉบับออกจากฐานข้อมูล", "HyDE ไม่ได้แก้ไขเอกสารในฐานข้อมูล"],
        ],
        "B",
        "HyDE เหมาะกับคำถามเชิงแนวคิดที่ภาษาพูดต่างจากเอกสารทางการ แต่ไม่เหมาะกับคำถามที่มีรหัสเฉพาะซึ่ง BM25 จับได้แม่นยำกว่าและไม่ต้องเสี่ยงโมเดลแต่งตัวเลข",
        "คำถามแบบใดที่ควรข้าม HyDE และใช้ Hybrid Search ตรง ๆ?",
        "คำถามที่มีรหัสเฉพาะ/เลขเอกสาร/ชื่อรุ่น (เช่น #INV-2026-009) เพราะ HyDE เสี่ยงแต่งข้อมูลผิดเพี้ยนและเพิ่ม latency โดยไม่จำเป็น",
      ),
      mc(
        "d103-q2",
        "ผู้ใช้ถามในรอบที่ 2 ว่า `\"แล้วถ้าจ่ายช้ากว่ากำหนด มันมีค่าปรับเท่าไร\"` หลังจากรอบแรกถามเรื่อง `\"สินเชื่อรถยนต์\"` เทคนิคใดแก้ปัญหานี้ได้ตรงจุดที่สุด?",
        [
          [
            "Conversational Query Rewriting โดยส่งประวัติรอบล่าสุดคู่กับคำถามใหม่เพื่อให้ได้ Standalone Query ที่ระบุคำว่า `สินเชื่อรถยนต์`",
            "ถูก — การแก้สรรพนามลอย ('มัน') เป็นคำค้นที่สมบูรณ์ช่วยให้ทั้ง BM25 และ Dense Search ค้นตรงโดเมนทันที",
          ],
          ["ลดค่า `k` ของ RRF จาก 60 เหลือ 5", "การปรับ k ไม่ได้ช่วยให้ Retriever รู้ว่า 'มัน' หมายถึงสินเชื่อรถยนต์"],
          ["เพิ่มขนาด chunk เป็น 4,000 tokens", "ขนาด chunk ไม่ได้แก้ปัญหาคำค้นที่ขาดบริบทจากบทสนทนาก่อนหน้า"],
          ["ปิด BM25 แล้วใช้ Dense Vector อย่างเดียว", "Dense Vector เองก็ไม่สามารถเดาได้ว่า 'มัน' หมายถึงอะไรหากไม่เห็นประวัติแชต"],
        ],
        "A",
        "คำถามต่อเนื่องที่มีสรรพนามลอยต้องผ่าน Conversational Query Rewriting ก่อนส่งเข้า Retriever เพื่อเติมบริบทจากประวัติแชตล่าสุด",
        "ปัญหาของคำถามต่อเนื่องที่มีสรรพนามอย่าง 'มัน' หรือ 'อันเมื่อกี้' แก้ด้วยเทคนิคใด?",
        "Conversational Query Rewriting — แนบประวัติแชต 2–4 รอบล่าสุดให้ LLM เรียบเรียงเป็น Standalone Query ก่อนค้นหา",
      ),
      mc(
        "d103-q3",
        "เมื่อใช้ Multi-Query ขยายคำถาม 1 ประโยคออกเป็น 3 คำค้น และได้รายการเอกสารกลับมา 3 ลิสต์ วิธีรวมผลและตัดเอกสารซ้ำที่เสถียรที่สุดคือข้อใด?",
        [
          ["เอาผลของคำค้นที่ 3 มาใช้เพียงอย่างเดียวแล้วทิ้งอีก 2 ลิสต์", "จะเสียประโยชน์ของการขยายหลายมุมมอง"],
          ["นำคะแนนดิบจากทั้ง 3 ลิสต์มาคูณกันทั้งหมด", "เอกสารที่ติดแค่ 2 ลิสต์จะได้คะแนนเป็น 0 และสเกลคะแนนอาจไม่เสถียร"],
          [
            "ผสานทั้ง 3 ลิสต์ด้วย Reciprocal Rank Fusion (RRF) พร้อมกัน `doc_id` ซ้ำในแต่ละลิสต์ แล้วส่งต่อ Top-20 ให้ Reranker",
            "ถูก — RRF ดันเอกสารที่โผล่ซ้ำจากหลายมุมคำค้นขึ้นด้านบนโดยไม่ต้อง normalize คะแนนดิบ",
          ],
          ["สุ่มเลือกเอกสารจากแต่ละลิสต์มาอย่างละ 2 ชิ้น", "การสุ่มทำให้ผลไม่เสถียรและไม่คำนึงถึงอันดับความเกี่ยวข้อง"],
        ],
        "C",
        "RRF คือตัวผสานมาตรฐานสำหรับ Multi-Query Retrieval เพราะจัดการได้ทั้งการรวมหลายลิสต์ การให้รางวัลเอกสารที่ตรงหลายมุม และการตัดซ้ำอย่าง deterministic",
        "ผลลัพธ์จาก Multi-Query หลายคำค้นควรนำมารวมและตัดซ้ำด้วยวิธีใด?",
        "ใช้ Reciprocal Rank Fusion (RRF) พร้อมกัน doc_id ซ้ำในแต่ละลิสต์ เพื่อดันเอกสารที่ติดอันดับจากหลายมุมคำค้นขึ้นบนสุด",
      ),
      mc(
        "d103-q4",
        "ข้อใดคือองค์ประกอบสำคัญของ **Latency Guard** สำหรับชั้น Query Transformation ในระบบ Production?",
        [
          ["สั่งให้ LLM ขยายคำค้นอย่างน้อย 10 คำเสมอเพื่อ Recall สูงสุด", "การขยาย 10 คำทำให้โหลดฐานข้อมูลและ latency พุ่งเกินรับไหว"],
          [
            "มี Bypass Gate ข้ามคำถามที่ชัด/มีรหัส, จำกัดจำนวน `max_queries` (2–3 คำ) และมี `timeout_ms` เพื่อ Fallback กลับคำถามเดิมเมื่อช้าหรือ error",
            "ถูก — คุมทั้งค่าเฉลี่ย (skip เมื่อไม่จำเป็น), โหลดสูงสุด (fan-out cap) และ P95 tail latency (timeout fallback)",
          ],
          ["รอจนกว่า LLM Rewriter จะตอบกลับมาเสมอโดยไม่ตั้ง timeout เพื่อไม่ให้เสียคุณภาพ", "หาก LLM เกิดหน่วง ระบบแชตทั้งระบบจะค้างตามทันที"],
          ["ใช้โมเดล Reasoning ขนาดใหญ่ที่สุดในการเขียนคำถามใหม่ทุกครั้ง", "โมเดลขนาดใหญ่เพิ่ม TTFT มหาศาล งาน Rewrite ควรใช้โมเดลเล็กที่เร็วหรือกฎ Bypass ก่อน"],
        ],
        "B",
        "Latency Guard ปกป้องทั้ง TTFT และ Availability ด้วย 3 กลไก: ข้ามเมื่อไม่จำเป็น (Bypass), จำกัดจำนวนคำค้น (Fan-Out Cap) และ Fallback กลับคำถามเดิมเมื่อเกินงบเวลา",
        "Latency Guard สำหรับ Query Transformation ประกอบด้วยกลไกหลัก 3 อย่างอะไรบ้าง?",
        "1) Bypass Gate ข้ามคำถามที่ชัด/มีรหัส, 2) Fan-Out Cap จำกัด max_queries (2–3), และ 3) Timeout Fallback กลับไปใช้คำถามเดิมเมื่อช้าหรือ error",
      ),
    ],
  },

  takeaways: [
    "**Conversational Rewriting** แปลงคำถามที่มีสรรพนามลอย (`\"มัน\"`, `\"อันเมื่อกี้\"`) ร่วมกับประวัติ 2–4 รอบล่าสุดให้เป็น Standalone Query ก่อนค้น",
    "**Multi-Query + {{rrf}}** ช่วยเชื่อมช่องว่างภาษาพูดกับภาษาเอกสาร ส่วน **{{hyde}}** ใช้ได้ดีกับคำถามเชิงแนวคิด (แต่ห้ามใช้กับรหัสเฉพาะ)",
    "ทุก Query Transformation อยู่บน Critical Path ของ {{ttft}} จึงต้องมี **Latency Guard**: Bypass Gate, `max_queries <= 3` และ Timeout Fallback",
    "ใน Day 104 เราจะนำทุกชิ้นส่วนของ Block B26 มาทำ Benchmark วัด **Recall@5, MRR และ Latency Overhead** ด้วยตัวเลขจริง",
  ],

  reviewCards: [
    rc(
      "d103-rc-1",
      "แยกความแตกต่างการใช้งานของ Query Rewriting, Multi-Query และ HyDE",
      "Rewriting ใช้แก้คำถามต่อเนื่องที่มีสรรพนามลอยด้วยประวัติแชต; Multi-Query ขยายคำถามกว้างเป็น 2–3 มุมแล้วรวมด้วย RRF; HyDE ให้ LLM ร่างคำตอบสมมติเพื่อนำเวกเตอร์ไปค้นเอกสารแนวคิดที่สไตล์ภาษาต่างกัน",
    ),
    rc(
      "d103-rc-2",
      "ทำไมจึงควรใส่ Bypass Gate เมื่อพบคำถามที่มีรหัสเฉพาะอย่าง `#INV-2026-009`?",
      "เพื่อลด latency เป็น 0 ms และป้องกันไม่ให้ LLM Rewriter หรือ HyDE แก้ไข/แต่งรหัสเฉพาะจนทำให้ BM25 และ Vector Search ค้นพลาด",
    ),
    rc(
      "d103-rc-3",
      "หากขั้นตอน Query Transformation ช้าเกินงบ `timeout_ms` หรือ API error ระบบควรทำอย่างไร?",
      "Fallback กลับไปใช้คำถามต้นฉบับ ([original_query]) ยิงเข้า Retriever ทันที พร้อมบันทึก flag used_fallback=True เพื่อไม่ให้ P95 latency พุ่งหรือระบบล่ม",
    ),
  ],

  sources: [
    { label: "Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE Paper — arXiv)", href: "https://arxiv.org/abs/2212.10496" },
    { label: "LangChain Conceptual Guide — Query Analysis & Transformation", href: "https://python.langchain.com/docs/concepts/retrieval/" },
    { label: "Qdrant Documentation — Hybrid Search & Multi-Stage Queries", href: "https://qdrant.tech/documentation/concepts/hybrid-queries/" },
    { label: "Python 3 Official Docs — Regular Expression Operations (re)", href: "https://docs.python.org/3/library/re.html" },
  ],

  glossary: ["hyde", "rrf", "reranker", "rag", "embedding", "bm25", "ttft", "llm"],
});
