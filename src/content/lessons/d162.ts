import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D162 — Phase 6 / Block B41
 * Implement PyThaiNLP BM25 + pgvector/Qdrant Hybrid Search
 */
export const d162: Lesson = defineLesson({
  day: 162,
  titleTh: "สร้างระบบค้นหา Hybrid: PyThaiNLP BM25 + Dense Vector (pgvector/Qdrant)",
  tagline: "30 นาที · ผสานการตัดคำไทยแม่นยำกับเวกเตอร์ความหมาย ด้วย Reciprocal Rank Fusion (RRF)",
  icon: "search",
  visual: {
    id: "capstone-hybrid-ingest",
    title: "สถาปัตยกรรม Hybrid Search: PyThaiNLP BM25 + Dense HNSW → RRF Fusion",
    caption: "จับทั้งคำไทย/รหัสเฉพาะด้วย BM25 และความหมายข้ามภาษาด้วย Dense Vector แล้วรวมอันดับด้วย RRF",
    alt: "แผนภาพการทำงานร่วมกันของ PyThaiNLP BM25, Dense Vector Search และ RRF ใน Capstone",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP (newmm)", "BM25", "pgvector / Qdrant", "RRF", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ข้อมูลภาษาไทยต้องตัดคำก่อนทำ Lexical Index เสมอ",
      body: "ภาษาไทยไม่มีช่องว่างระหว่างคำ หากใช้ tokenizer แบบเว้นวรรคของฐานข้อมูลตะวันตก ทั้งประโยคจะกลายเป็นคำเดียวจนค้นหา {{bm25}} ไม่เจอ",
      lessonNote: "วันนี้เราใช้ {{pythainlp}} (`newmm` + custom dictionary) ร่วมกับตัวป้องกันรหัสเฉพาะ เพื่อสร้างดัชนี BM25 ที่เข้าใจทั้งภาษาไทยและรหัส `INV-2026-009`",
    },
    {
      node: 2,
      heading: "ผสานความแม่นยำเชิงรหัส (BM25) กับความเข้าใจเชิงความหมาย (Dense)",
      body: "Dense {{embedding}} เก่งเรื่องคำพ้องความหมายและคำถามไทยปนอังกฤษ แต่แพ้รหัสเฉพาะ ส่วน BM25 เก่งเรื่องคำตรงตัวแต่ไม่เข้าใจคำพ้อง",
      lessonNote: "ในระบบ {{rag}} ของ Capstone เราดึงผู้สมัคร {{top-k}} (`k=20`) จากทั้งสองฝั่งพร้อมกันบน {{hnsw}} และ BM25 เพื่อไม่ให้หลุดคำตอบสำคัญ",
    },
    {
      node: 4,
      heading: "รวมอันดับสองโลกด้วย Reciprocal Rank Fusion (RRF)",
      body: "คะแนนดิบของ BM25 (ไม่มีเพดานตายตัว) กับ {{cosine-similarity}} (`0..1`) เอามาบวกกันตรง ๆ ไม่ได้เพราะสเกลคนละแบบ",
      lessonNote: "สูตร {{rrf}} ใช้แค่อันดับ (`1 / (60 + rank)`) ทำให้รวมผลจาก pgvector/Qdrant และ BM25 ได้เสถียรโดยไม่ต้องปรับจูนสเกล",
    },
  ],

  objectives: [
    "**ออกแบบ Bilingual Tokenizer** ที่ใช้ {{pythainlp}} (`newmm`) ตัดคำไทยร่วมกับการป้องกันไม่ให้รหัสเอกสาร/SKU/แบบฟอร์มถูกหั่นแตก",
    "**สร้าง Hybrid Retriever** ที่คำนวณคะแนน {{bm25}} คู่กับ Dense {{cosine-similarity}} (จำลองรูปแบบของ `pgvector` / `Qdrant`) และดึง candidate `top_k=20`",
    "**รวมอันดับด้วย {{rrf|Reciprocal Rank Fusion}}** อย่าง deterministic เพื่อส่งต่อให้ชั้น Cross-Encoder Reranker ใน Day 163",
  ],

  prerequisites: [
    "สร้าง Ingestion Pipeline และ `ChunkRecord` เสร็จแล้วจาก Day 161",
    "เข้าใจพื้นฐาน Vector Index HNSW, Thai BM25 และ RRF (Phase 4)",
    "ใช้งาน `uv`, `Pydantic v2` และ `pytest` ได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมโมดูล Hybrid Retrieval ในโปรเจกต์ Capstone ของคุณ — โค้ดแบบฝึกหัดรันแบบ offline 100% และออกแบบ interface ให้สลับไปต่อ `pythainlp` / `pgvector` / `Qdrant` จริงได้ทันที",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p src/retrieval tests
# (ตัวเลือกสำหรับสภาพแวดล้อมที่มีอินเทอร์เน็ต: uv add pythainlp rank-bm25 qdrant-client)
uv run pytest --version`,
    steps: [
      ["dir", "สร้างโฟลเดอร์ `src/retrieval/` สำหรับแยกโค้ด tokenizer, BM25 และ hybrid searcher"],
      ["deps", "พร้อมใช้งานสภาพแวดล้อม `uv` + `pytest` แบบ offline"],
      ["ready", "พร้อมเขียน Bilingual Tokenizer, BM25 Index และ RRF Fusion"],
    ],
    note: "ชุดเทสต์วันนี้ไม่บังคับดาวน์โหลดพจนานุกรมหรือรันฐานข้อมูลจริง เพื่อให้รันบนเครื่องและ CI ได้ใน < 1 วินาที โดยเราจะวาง Adapter pattern ให้เสียบ `PyThaiNLP` และ `Qdrant/pgvector` จริงได้ง่าย",
  },

  concepts: [
    {
      id: "pythainlp-bilingual-tokenizer",
      title: "1 · ตัดคำไทย-อังกฤษสำหรับ BM25 โดยไม่ทำลายรหัสเฉพาะ",
      paragraphs: [
        "ความท้าทายอันดับหนึ่งของการทำ {{bm25}} ในองค์กรไทยคือ **ข้อความผสมสองภาษาและรหัสเฉพาะ** เช่น `\"ขอเช็กสถานะใบแจ้งหนี้ INV-2026-009 และแบบฟอร์ม ภ.พ.20\"` ถ้าใช้ `.split()` ภาษาไทยจะติดกันเป็นก้อนยาว แต่ถ้าโยนทุกอย่างเข้าตัวตัดคำทั่วไป รหัส `INV-2026-009` อาจถูกหั่นเป็น `INV`, `-`, `2026`, `-`, `009` จนไปชนกับใบแจ้งหนี้อื่นในปี 2026 เต็มไปหมด",
        "แนวทาง Production คือ **Entity-Protected Bilingual Tokenization**: ใช้ Regular Expression จับรหัสที่มีโครงสร้างเฉพาะ (`INV-2026-009`, `SKU-440`, `ภ.พ.20`) ออกมาเก็บเป็น token เต็มก่อน แปลงภาษาอังกฤษเป็นตัวพิมพ์เล็ก (`lowercase`), แล้วส่งเฉพาะช่วงข้อความภาษาไทยเข้า {{pythainlp}} `word_tokenize(segment, engine=\"newmm\", custom_dict=...)` พร้อมตัด stopwords/เครื่องหมายวรรคตอนที่ไม่จำเป็นออกทั้งฝั่ง **indexing** และฝั่ง **query** ให้เหมือนกันเป๊ะ",
      ],
      analogy: "เหมือนการหั่นผักใส่กล่องเตรียมปรุง — เราหั่นผักกาด (ข้อความไทยต่อเนื่อง) เป็นชิ้นพอดีคำ แต่ต้องไม่หั่นรหัสป้ายราคาหรือรหัส SKU ที่ติดมากับซองขาดเป็นชิ้นเล็กชิ้นน้อย",
      bullets: [
        "**Symmetry Rule**: ฝั่งสร้างดัชนี (Ingest) และฝั่งค้นหา (Query) ต้องใช้ tokenizer ตัวเดียวกันเสมอ",
        "**Custom Domain Dictionary**: เพิ่มคำศัพท์องค์กร (เช่น `ใบกำกับภาษี`, `ค่าธรรมเนียม`, `คืนสินค้า`) ลง `custom_dict` ของ `newmm` เพื่อลดการตัดคำผิด",
        "**Keep Exact Codes Intact**: รหัสอย่าง `INV-2026-009` หรือ `B2B-PRO` ควรถูกเก็บเป็น 1 token เต็ม (lowercase) เพื่อความแม่นยำ 100% ใน BM25",
      ],
      code: {
        language: "python",
        filename: "bilingual_tokenizer.py",
        code: `import re
from typing import Callable

# จับรหัสเอกสาร/แบบฟอร์มไทย-อังกฤษก่อน แล้วค่อยจับช่วงข้อความไทยหรือคำอังกฤษ
_PROTECTED_OR_UNIT = re.compile(
    r"[A-Za-z]{2,}-\d+(?:-\d+)*"   # เช่น INV-2026-009, SKU-440
    r"|ภ\.พ\.\d+"                   # เช่น ภ.พ.20
    r"|[\u0e00-\u0e7f]+"            # ช่วงอักษรไทยต่อเนื่อง
    r"|[A-Za-z0-9_]+"               # คำอังกฤษหรือตัวเลข
)


def tokenize_bilingual(
    text: str,
    thai_segmenter: Callable[[str], list[str]] | None = None,
) -> list[str]:
    tokens: list[str] = []
    for match in _PROTECTED_OR_UNIT.finditer(text):
        piece = match.group(0)
        if "\u0e00" <= piece[0] <= "\u0e7f" and not piece.startswith("ภ.พ."):
            if thai_segmenter is not None:
                tokens.extend(t for t in thai_segmenter(piece) if t.strip())
            else:
                # Fallback / mock segmenter: แยกคำด้วยช่องว่างหรือตัดย่อยเมื่อไม่มี PyThaiNLP
                tokens.append(piece)
        else:
            tokens.append(piece.lower())
    return tokens`,
        caption: "ตัวอย่างการใช้ Regex ปกป้องรหัสเอกสารก่อนส่งช่วงข้อความไทยเข้า `PyThaiNLP` `newmm`",
      },
      whyTitle: "Why this matters — แก้จุดบอด `exact_id` ของ Dense Vector",
      whyParagraphs: [
        "Embedding model มองเห็นความต่างระหว่าง `INV-2026-008` กับ `INV-2026-009` น้อยมาก เพราะความหมายเชิงภาษาแทบเหมือนกันเป๊ะ",
        "เมื่อเก็บ `inv-2026-009` เป็น exact token ใน BM25 คะแนน IDF ของรหัสเฉพาะนี้จะสูงมาก และดันเอกสารเป้าหมายขึ้นอันดับ 1 ทันที",
      ],
    },
    {
      id: "bm25-and-vector-stores",
      title: "2 · BM25 Scoring จับคู่กับ pgvector / Qdrant Dense Search",
      paragraphs: [
        "สูตร {{bm25}} (Okapi BM25) ให้คะแนนตาม **TF** (คำค้นปรากฏในเอกสารบ่อยแค่ไหน แต่มี saturation ไม่ให้คำซ้ำชนะขาด), **IDF** (คำนั้นหายากแค่ไหนในทั้งคลัง เช่น `inv-2026-009` หายากกว่าคำว่า `บริษัท` มาก), และ **Document Length Normalization** (ไม่ให้เอกสารยาวได้เปรียบเกินจริง ด้วยพารามิเตอร์มาตรฐาน `k1=1.5`, `b=0.75`)",
        "ฝั่ง Dense Vector Search เราเก็บเวกเตอร์ใน **pgvector** (PostgreSQL + `HNSW` index) หรือ **Qdrant** (Collection + Sparse/Dense Named Vectors) เพื่อค้นหาผ่าน {{hnsw}} ด้วย {{cosine-similarity}} จุดสำคัญคือในสถาปัตยกรรม Capstone ที่บันทึกไว้ใน {{adr}}: ถ้าใช้ PostgreSQL อยู่แล้ว `pgvector` ลดจำนวน service ที่ต้องดูแล (1 DB สำหรับทั้งข้อมูลธุรกิจ + vector) ส่วน `Qdrant` เด่นเรื่อง native hybrid query และ payload filtering ความเร็วสูง",
      ],
      analogy: "BM25 เหมือนดัชนีท้ายหนังสือที่ชี้หน้าที่มีคำหรือรหัสตรงเป๊ะ ส่วน pgvector/Qdrant เหมือนแผนที่ความคิดที่วางหัวข้อคล้ายกันไว้ใกล้กัน แม้ใช้คำเรียกคนละคำ",
      bullets: [
        "**BM25 (`k1=1.5, b=0.75`)**: ชนะขาดในคำถามที่มีชื่อเฉพาะ, รหัส, ตัวเลข, ศัพท์กฎหมาย/ภาษีไทย",
        "**Dense Vector (`HNSW`)**: ชนะขาดในคำถามเชิงความหมาย, การถามอ้อม, และคำถามไทยปนอังกฤษ (เช่น *\"SLA คืนเงินกี่วัน\"* ↔ *\"ระยะเวลาดำเนินการคืนยอด\"*)",
        "**pgvector vs Qdrant**: ทั้งคู่ทำ Hybrid ได้ — pgvector ใช้ CTE รวมตาราง `tsvector`/BM25 กับ `<=>` cosine distance; Qdrant ใช้ `prefetch` 2 แขนแล้ว `FusionQuery(Fusion.RRF)` ในคำสั่งเดียว",
      ],
      whyTitle: "Why this matters — เข้าใจ Trade-off ของ DB ที่เลือกใน ADR",
      whyParagraphs: [
        "ในการออกแบบจริง คุณต้องเลือก backend ให้เหมาะกับข้อจำกัดทีม: ถ้าระบบมี Postgres อยู่แล้ว (เช่นเก็บ order/ticket และ ACL) การใช้ `pgvector` ช่วยให้ join สิทธิ์หรือรหัสลูกค้าแบบ transactional ได้ทันที",
        "แต่ถ้าต้องสเกล vector หลักหลายล้านชิ้นหรือใช้ Qdrant Sparse+Dense built-in `Fusion.RRF` การแยก Qdrant ออกมาก็ช่วยลดภาระ CPU ของฐานข้อมูลหลัก",
      ],
    },
    {
      id: "rrf-hybrid-fusion",
      title: "3 · รวมผลด้วย Reciprocal Rank Fusion (RRF) และดึง Candidate Pool เผื่อ Rerank",
      paragraphs: [
        "เมื่อได้อันดับจากฝั่ง Dense (`top-20`) และฝั่ง BM25 (`top-20`) คำถามสำคัญคือจะรวมสองรายการนี้อย่างไร หากเอาคะแนนดิบมาบวกกัน (`0.82 + 14.5`) คะแนน BM25 ที่มีค่าได้ตั้งแต่ 0 ถึงหลักสิบจะกลบ Cosine Similarity (`0..1`) จนมิด และเมื่อคลังเอกสารโตขึ้น ช่วงคะแนน BM25 ก็เปลี่ยนไปเรื่อย ๆ",
        "เราจึงใช้ **{{rrf|Reciprocal Rank Fusion (RRF)}}** ที่คิดคะแนนจาก **อันดับ (rank)** เท่านั้น: `rrf_score(d) = Σ w_i / (k + rank_i(d))` โดยนิยมใช้ `k = 60` เอกสารที่ติดอันดับต้น ๆ ทั้งใน Dense และ BM25 จะได้รับคะแนนรวมสูงสุด และเอกสารที่ติดอันดับ 1 ของฝั่งใดฝั่งหนึ่งก็ยังไต่ขึ้นมาสูงพอที่จะผ่านเข้าสู่รอบ {{reranker}} ได้",
      ],
      analogy: "เหมือนกรรมการ 2 คนให้คะแนนคนละสเกล (คนหนึ่งให้ 0–1 เต็ม, อีกคนให้ 0–100) แทนที่จะเอาคะแนนดิบมาบวกกัน เราเปลี่ยนเป็นจัดอันดับที่ 1, 2, 3 ก่อนแล้วค่อยให้แต้มตามอันดับอย่างยุติธรรม",
      code: {
        language: "python",
        filename: "rrf_fusion.py",
        code: `def reciprocal_rank_fusion(
    ranked_lists: list[list[str]],
    k: int = 60,
    weights: list[float] | None = None,
) -> list[tuple[str, float]]:
    if weights is None:
        weights = [1.0] * len(ranked_lists)
    scores: dict[str, float] = {}
    for w, doc_ids in zip(weights, ranked_lists, strict=True):
        for rank, doc_id in enumerate(doc_ids, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + w / (k + rank)
    return sorted(scores.items(), key=lambda item: (-item[1], item[0]))`,
        caption: "RRF แบบปรับน้ำหนักได้ (`weights`) พร้อม tie-break ตาม `doc_id` เพื่อให้ผลลัพธ์ deterministic ทุกครั้ง",
      },
      whyTitle: "Why this matters — เตรียม Candidate Pool คุณภาพสูงให้ Day 163",
      whyParagraphs: [
        "อย่าตัด Hybrid Search ลงมาเหลือแค่ 5 ชิ้นตั้งแต่ตรงนี้ ถ้าคุณจะส่งต่อให้ Cross-Encoder Reranker ใน Day 163 ให้ตั้ง `candidate_k = 20` เพื่อให้ Reranker มีตัวเลือกเพียงพอ",
        "ค่า `k = 60` ในสูตร RRF ช่วยลดอิทธิพลของอันดับ 1 ที่กระโดดโดดเดี่ยว และให้รางวัลกับเอกสารที่สอดคล้องกันทั้งความหมายและคำสำคัญ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก SQL `LIKE` + ElasticSearch สู่ Hybrid RAG",
      body: [
        "ในเว็บแอปทั่วไป คุณอาจคุ้นกับ Search bar ที่ใช้ SQL `ILIKE` หรือ Full-Text Search (เช่น Postgres `tsvector` / Elasticsearch) ซึ่งเก่งเวลาผู้ใช้พิมพ์คำตรงตัว แต่พังทันทีเมื่อผู้ใช้พิมพ์ภาษาคนทั่วไปที่ไม่ได้ใช้คำศัพท์เดียวกับเอกสาร",
      ],
      table: [
        ["PyThaiNLP + BM25", "Full-Text Search (Postgres `tsvector` / Elastic) สำหรับภาษาไทย"],
        ["pgvector / Qdrant (Dense)", "Semantic Search จับความหมายแม้ใช้คนละคำ"],
        ["Reciprocal Rank Fusion (RRF)", "ตัวรวมผลจัดอันดับจาก 2 search engines โดยไม่ต้อง normalize สเกล"],
        ["`candidate_k = 20`", "หน้า Pagination ชุดแรกก่อนส่งให้ Reranker คัดเหลือ Top-5"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Dense Vector อย่างเดียวถึงไม่พอ",
      body: [
        "หลายคนเข้าใจผิดว่า Embedding โมเดลใหม่ ๆ ฉลาดพอที่จะแทนที่ Keyword Search ได้ทั้งหมด แต่ในงานจริงคำถามที่มีรหัส เช่น `\"เงื่อนไขแบบฟอร์ม ภ.พ.20\"` หรือ `\"บิล INV-2026-009\"` ตัว embedding จะเห็นทุกเลขใบแจ้งหนี้คล้ายกันหมด",
        "การใช้ BM25 คู่กับ Dense Search จึงไม่ใช่เรื่องล้าสมัย แต่เป็นมาตรฐานอุตสาหกรรมที่ช่วยให้ระบบค้นหาทั้ง 'เข้าใจความหมาย' และ 'จำรหัสแม่นเป๊ะ'",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองสร้าง BM25 Index ภาษาไทยด้วยตัวเองจากศูนย์ (ไม่พึ่งไลบรารีภายนอก) คู่กับ Dense Cosine Search และรวมผลด้วย RRF เพื่อดูว่า Hybrid Search แก้โจทย์คำถามรหัสเฉพาะและคำถามความหมายได้อย่างไร กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · สร้าง Bilingual Tokenizer และ Okapi BM25 Index แบบเบา",
        explain:
          "ใช้ dictionary คำศัพท์ไทยขนาดเล็กจำลองการทำงานของ `PyThaiNLP newmm` คู่กับการป้องกันรหัสอย่าง `INV-2026-009` จากนั้นคำนวณคะแนน Okapi BM25 (`k1=1.5, b=0.75`)",
        code: {
          language: "python",
          filename: "worked_hybrid.py",
          code: `import math
import re
from collections import Counter

THAI_DICT = ["คืนสินค้า", "นโยบาย", "ใบแจ้งหนี้", "ค่าธรรมเนียม", "ขยายเวลา", "ชำระเงิน", "โอนเงิน", "ด่วน"]
_UNIT_RE = re.compile(r"[A-Za-z]{2,}-\\d+(?:-\\d+)*|[\\u0e00-\\u0e7f]+|[A-Za-z0-9_]+")


def segment_thai_mock(text: str) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(text):
        matched = next((w for w in sorted(THAI_DICT, key=len, reverse=True) if text.startswith(w, i)), None)
        if matched:
            out.append(matched)
            i += len(matched)
        else:
            i += 1
    return out


def tokenize(text: str) -> list[str]:
    tokens: list[str] = []
    for m in _UNIT_RE.finditer(text):
        part = m.group(0)
        if "\\u0e00" <= part[0] <= "\\u0e7f":
            tokens.extend(segment_thai_mock(part))
        else:
            tokens.append(part.lower())
    return tokens`,
        },
      },
      {
        title: "2 · คำนวณ BM25 Score และ Cosine Similarity ของแต่ละ Chunk",
        explain:
          "นิยามคลาส `MiniBM25` และฟังก์ชัน `cosine_similarity` เพื่อจำลองผลลัพธ์ของ pgvector/Qdrant แล้วเปรียบเทียบอันดับที่ได้จากแต่ละฝั่ง",
        code: {
          language: "python",
          filename: "worked_hybrid.py",
          code: `class MiniBM25:
    def __init__(self, docs: dict[str, str], k1: float = 1.5, b: float = 0.75) -> None:
        self.k1, self.b = k1, b
        self.doc_tokens = {doc_id: tokenize(txt) for doc_id, txt in docs.items()}
        self.n_docs = len(docs)
        self.avg_len = sum(len(t) for t in self.doc_tokens.values()) / max(1, self.n_docs)
        df: Counter[str] = Counter()
        for toks in self.doc_tokens.values():
            for term in set(toks):
                df[term] += 1
        self.idf = {t: math.log((self.n_docs - freq + 0.5) / (freq + 0.5) + 1.0) for t, freq in df.items()}

    def search(self, query: str) -> list[str]:
        q_terms = tokenize(query)
        scores: dict[str, float] = {}
        for doc_id, toks in self.doc_tokens.items():
            tf = Counter(toks)
            dl = len(toks) or 1
            s = 0.0
            for term in q_terms:
                if term not in tf:
                    continue
                f = tf[term]
                denom = f + self.k1 * (1 - self.b + self.b * dl / self.avg_len)
                s += self.idf.get(term, 0.0) * (f * (self.k1 + 1)) / denom
            if s > 0:
                scores[doc_id] = s
        return [d for d, _ in sorted(scores.items(), key=lambda x: (-x[1], x[0]))]`,
        },
      },
      {
        title: "3 · ทดสอบรวมอันดับ Dense + BM25 ด้วย RRF บนคำถามที่มีรหัสใบแจ้งหนี้",
        explain:
          "สมมติคำถาม `\"สถานะใบแจ้งหนี้ INV-2026-009\"` ซึ่ง Dense Vector จำสับสนกับใบแจ้งหนี้ทั่วไป แต่ BM25 จับ `inv-2026-009` ได้แม่น และ RRF ดันกลับขึ้นมาอันดับ 1",
        code: {
          language: "python",
          filename: "worked_hybrid.py",
          code: `corpus = {
    "doc-policy-pay": "นโยบายชำระเงินและขยายเวลาใบแจ้งหนี้ทั่วไป",
    "doc-inv-008": "ใบแจ้งหนี้ INV-2026-008 ชำระเงินแล้ว",
    "doc-inv-009": "ใบแจ้งหนี้ INV-2026-009 รอตรวจสอบค่าธรรมเนียมโอนเงิน",
}
bm25 = MiniBM25(corpus)
bm25_rank = bm25.search("สถานะใบแจ้งหนี้ INV-2026-009")
# สมมติ Dense Vector ให้คะแนนเชิงความหมายคล้ายกันหมดจน inv-009 ตกไปอยู่อันดับ 3
dense_rank = ["doc-policy-pay", "doc-inv-008", "doc-inv-009"]

rrf_scores: dict[str, float] = {}
for lst in (dense_rank, bm25_rank):
    for r, doc_id in enumerate(lst, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + 1.0 / (60 + r)

fused = sorted(rrf_scores.items(), key=lambda x: (-x[1], x[0]))
print("BM25 rank :", bm25_rank)
print("Dense rank:", dense_rank)
print("RRF fused :", [d for d, _ in fused])`,
        },
        output: `BM25 rank : ['doc-inv-009', 'doc-inv-008', 'doc-policy-pay']
Dense rank: ['doc-policy-pay', 'doc-inv-008', 'doc-inv-009']
RRF fused : ['doc-inv-008', 'doc-inv-009', 'doc-policy-pay']`,
      },
    ],
    gotcha:
      "จุดสังเกตในผลลัพธ์ด้านบน: เมื่อ `dense` และ `bm25` น้ำหนักเท่ากัน (1.0 vs 1.0) เอกสารที่อยู่อันดับ 2 ทั้งคู่ (`doc-inv-008`) อาจได้คะแนน RRF เท่ากับอันดับ 1+3 (`doc-inv-009`)! ใน Day 163 เราจึงต้องใช้ **Cross-Encoder Reranker** อ่านเนื้อหาจริงของ Top-20 เพื่อตัดสินชี้ขาดว่า `doc-inv-009` ตรงกับคำถามมากกว่าอย่างแท้จริง",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/hybrid_search.py` ที่รวม Bilingual Tokenizer (ปกป้องรหัสเอกสาร + segment ภาษาไทย), Okapi BM25 Index, Dense Cosine Search และ Reciprocal Rank Fusion (RRF) แบบพร้อมเสียบเข้ากับระบบ Capstone",
    requirements: [
      "`tokenize_bilingual(text: str, thai_segmenter: Callable[[str], list[str]] | None = None) -> list[str]` — ต้องรักษารหัสอย่าง `INV-2026-009` หรือ `SKU-440` เป็น token เดียว (lowercase), แปลงคำอังกฤษเป็น lowercase และส่งช่วงภาษาไทยเข้า `thai_segmenter` (ถ้าไม่ส่งมา ให้ fallback เป็นการเก็บช่วงภาษาไทยหรือใช้พจนานุกรมพื้นฐาน)",
      "`BM25Retriever` — รับ `docs: list[dict]` (`{\"chunk_id\": str, \"text\": str}`) และ `tokenizer` สร้างดัชนี Okapi BM25 (`k1=1.5, b=0.75`), มีเมธอด `search(query: str, top_k: int = 20) -> list[str]` คืน `chunk_id` เรียงจากคะแนนสูงสุด (tie-break ด้วย `chunk_id` ascending)",
      "`DenseRetriever` — รับ `vectors: dict[str, list[float]]`, มีเมธอด `search(query_vector: list[float], top_k: int = 20) -> list[str]` คำนวณ cosine similarity (ถ้า norm เป็น 0 ให้คืนคะแนน `0.0`) และเรียงจากสูงไปต่ำ",
      "`rrf_fuse(dense_ids: list[str], bm25_ids: list[str], k: int = 60, top_n: int = 20, dense_weight: float = 1.0, bm25_weight: float = 1.0) -> list[str]` — รวมอันดับด้วยสูตร `w / (k + rank)` และ tie-break ด้วย `chunk_id` ascending",
      "`HybridSearcher` — รวม `BM25Retriever` และ `DenseRetriever` มีเมธอด `search(query: str, query_vector: list[float], candidate_k: int = 20, top_n: int = 5) -> list[str]`",
    ],
    starter: {
      language: "python",
      filename: "src/hybrid_search.py",
      code: `import math
import re
from collections import Counter
from typing import Callable


def tokenize_bilingual(
    text: str,
    thai_segmenter: Callable[[str], list[str]] | None = None,
) -> list[str]:
    # TODO: protect exact codes (INV-2026-009), lowercase EN, segment TH runs
    raise NotImplementedError


class BM25Retriever:
    def __init__(
        self,
        docs: list[dict[str, str]],
        tokenizer: Callable[[str], list[str]] = tokenize_bilingual,
        k1: float = 1.5,
        b: float = 0.75,
    ) -> None:
        # TODO: compute doc frequencies, IDF, avg_len
        raise NotImplementedError

    def search(self, query: str, top_k: int = 20) -> list[str]:
        # TODO: score documents and return top_k chunk_ids
        raise NotImplementedError


class DenseRetriever:
    def __init__(self, vectors: dict[str, list[float]]) -> None:
        self.vectors = vectors

    def search(self, query_vector: list[float], top_k: int = 20) -> list[str]:
        # TODO: cosine similarity search sorted descending, tie-break chunk_id ascending
        raise NotImplementedError


def rrf_fuse(
    dense_ids: list[str],
    bm25_ids: list[str],
    k: int = 60,
    top_n: int = 20,
    dense_weight: float = 1.0,
    bm25_weight: float = 1.0,
) -> list[str]:
    # TODO: fuse two ranked lists with weighted RRF
    raise NotImplementedError


class HybridSearcher:
    def __init__(self, bm25: BM25Retriever, dense: DenseRetriever) -> None:
        self.bm25 = bm25
        self.dense = dense

    def search(
        self,
        query: str,
        query_vector: list[float],
        candidate_k: int = 20,
        top_n: int = 5,
    ) -> list[str]:
        # TODO: query both retrievers with candidate_k and fuse to top_n
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_hybrid_search.py",
      code: `from src.hybrid_search import BM25Retriever, DenseRetriever, HybridSearcher, rrf_fuse, tokenize_bilingual


def _mock_thai_seg(segment: str) -> list[str]:
    vocab = ["ใบแจ้งหนี้", "คืนสินค้า", "ค่าธรรมเนียม", "ตรวจสอบ", "สถานะ"]
    found: list[str] = []
    i = 0
    while i < len(segment):
        hit = next((w for w in sorted(vocab, key=len, reverse=True) if segment.startswith(w, i)), None)
        if hit:
            found.append(hit)
            i += len(hit)
        else:
            i += 1
    return found or [segment]


def test_tokenize_bilingual_preserves_exact_codes_and_segments_thai():
    toks = tokenize_bilingual("ตรวจสอบใบแจ้งหนี้ INV-2026-009 และ SLA", thai_segmenter=_mock_thai_seg)
    assert "inv-2026-009" in toks
    assert "sla" in toks
    assert "ใบแจ้งหนี้" in toks


def test_bm25_ranks_exact_invoice_id_first():
    docs = [
        {"chunk_id": "c1", "text": "นโยบายการคืนสินค้าและใบแจ้งหนี้ทั่วไป"},
        {"chunk_id": "c2", "text": "ใบแจ้งหนี้ INV-2026-008 ปิดยอดแล้ว"},
        {"chunk_id": "c3", "text": "ใบแจ้งหนี้ INV-2026-009 รอชำระค่าธรรมเนียม"},
    ]
    bm25 = BM25Retriever(docs, tokenizer=lambda t: tokenize_bilingual(t, _mock_thai_seg))
    ranked = bm25.search("สถานะใบแจ้งหนี้ INV-2026-009", top_k=3)
    assert ranked[0] == "c3"


def test_dense_handles_zero_vector_gracefully():
    dense = DenseRetriever({"c1": [1.0, 0.0], "c2": [0.0, 1.0]})
    assert dense.search([0.0, 1.0], top_k=2) == ["c2", "c1"]
    assert dense.search([0.0, 0.0], top_k=2) == ["c1", "c2"]


def test_rrf_fuse_promotes_consensus_and_respects_weights():
    fused = rrf_fuse(["c1", "c2", "c3"], ["c3", "c2", "c4"], k=60, top_n=3)
    assert fused[0] == "c2"
    weighted = rrf_fuse(["c1", "c2"], ["c2", "c1"], k=60, top_n=2, dense_weight=0.5, bm25_weight=2.0)
    assert weighted[0] == "c2"


def test_hybrid_searcher_combines_bm25_and_dense():
    docs = [
        {"chunk_id": "c1", "text": "นโยบายคืนสินค้า"},
        {"chunk_id": "c2", "text": "ใบแจ้งหนี้ INV-2026-009 ค่าธรรมเนียม"},
        {"chunk_id": "c3", "text": "คู่มือเชื่อมต่อ API"},
    ]
    bm25 = BM25Retriever(docs, tokenizer=lambda t: tokenize_bilingual(t, _mock_thai_seg))
    dense = DenseRetriever({"c1": [0.9, 0.1], "c2": [0.85, 0.5], "c3": [0.1, 0.9]})
    searcher = HybridSearcher(bm25, dense)
    top = searcher.search("INV-2026-009", [0.9, 0.4], candidate_k=3, top_n=2)
    assert top[0] == "c2"
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_hybrid_search.py` แล้วผ่านครบ 5 test cases",
      "ทดสอบป้อนรหัสเอกสาร `INV-2026-009` และยืนยันว่า `tokenize_bilingual` ไม่หั่นเครื่องหมาย `-` จนรหัสแตก",
      "ตรวจสอบว่า `DenseRetriever` ไม่ crash ด้วย `ZeroDivisionError` เมื่อเจอ zero-norm vector",
      "รัน `uv run ruff check .` แล้วผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ด้วย `uv run pytest -q` และไม่มี lint warning จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `tokenize_bilingual` ให้วาง pattern ของรหัสเฉพาะ (`[A-Za-z]{2,}-\\d+(?:-\\d+)*`) ไว้หน้าสุดใน `re.compile(...)` เพราะ regex engine จะจับจากซ้ายไปขวาตามลำดับทางเลือกแรกที่ตรง",
      },
      {
        body: "ใน `DenseRetriever.search` ให้คำนวณ `norm_a = math.sqrt(sum(x*x for x in a))` และ `norm_b = math.sqrt(sum(y*y for y in b))` ถ้าตัวใดเป็น `0.0` ให้คืน cosine `0.0` แล้ว sort ด้วย `(-score, chunk_id)`",
      },
      {
        body: "โครงของ `BM25Retriever.search` และ `rrf_fuse` — ตรวจสอบเงื่อนไขกรณี `q_terms` ว่าง หรือเอกสารไม่มีคำที่ตรงเลย",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def rrf_fuse(
    dense_ids: list[str],
    bm25_ids: list[str],
    k: int = 60,
    top_n: int = 20,
    dense_weight: float = 1.0,
    bm25_weight: float = 1.0,
) -> list[str]:
    scores: dict[str, float] = {}
    for rank, cid in enumerate(dense_ids, start=1):
        scores[cid] = scores.get(cid, 0.0) + dense_weight / (k + rank)
    for rank, cid in enumerate(bm25_ids, start=1):
        scores[cid] = scores.get(cid, 0.0) + bm25_weight / (k + rank)
    ranked = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [cid for cid, _ in ranked[:top_n]]`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_hybrid_search.py
uv run ruff check .`,
      caption: "รันชุดทดสอบ Hybrid Search แบบ offline 100%",
    },
  },

  mistakes: [
    {
      title: "ใช้ `str.split()` ทำ BM25 กับข้อความภาษาไทย",
      symptom: "ค้นหาคำว่า `'ค่าธรรมเนียม'` ไม่เจอเลยทั้งที่มีอยู่ในประโยค `'ตรวจสอบค่าธรรมเนียมโอนเงิน'`",
      fix: "ใช้ {{pythainlp}} (`word_tokenize(..., engine=\"newmm\")`) ตัดคำทั้งฝั่ง indexing และฝั่ง query ให้เหมือนกัน",
    },
    {
      title: "ปล่อยให้ Tokenizer หั่นรหัสเอกสารอย่าง `INV-2026-009` แตกเป็นชิ้นย่อย",
      symptom: "การค้นหา `INV-2026-009` ดึงเอกสารที่มี `2026` หรือ `009` จากหน้าอื่นปนเข้ามาเต็มไปหมด",
      fix: "ใช้ Regex ปกป้องรหัสเฉพาะ/เลขแบบฟอร์มออกมาก่อนส่งช่วงข้อความไทยเข้า word segmenter",
    },
    {
      title: "บวกคะแนน BM25 ดิบเข้ากับ Cosine Similarity ตรง ๆ",
      symptom: "คะแนน BM25 ที่พุ่งถึง `12.4` กลบความแตกต่างของ Cosine Similarity (`0.65` vs `0.89`) จนเหมือนไม่ได้ใช้ Dense Search",
      fix: "รวมอันดับด้วย {{rrf}} (`1 / (k + rank)`) แทนการบวกคะแนนดิบคนละสเกล",
    },
    {
      title: "ลืมแยก `candidate_k` (20) ออกจาก `final_top_k` (5)",
      symptom: "ดึงมาจากแต่ละฝั่งแค่ 5 ชิ้น ทำให้เอกสารที่ติดอันดับ 6 ใน BM25 และอันดับ 6 ใน Dense ไม่มีโอกาสถูกฟิวชันหรือ rerank",
      fix: "ดึง `candidate_k = 20` จากทั้ง Dense และ BM25 เข้ารวมด้วย RRF ก่อนคัดส่งต่อ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d162-q1",
        "เหตุใดระบบค้นหา BM25 บนเอกสารองค์กรไทยจึงควรใช้ Regex จับรหัส `INV-2026-009` ก่อนส่งข้อความเข้า `PyThaiNLP newmm`?",
        [
          ["เพราะ `PyThaiNLP` ไม่รับข้อความที่มีตัวเลขปนอยู่เลยและจะโยน exception", "ไม่จริง — PyThaiNLP รับตัวเลขได้ แต่บาง engine อาจแยกเครื่องหมาย `-` และตัวเลขออกจากกัน"],
          ["เพื่อรักษารหัส `inv-2026-009` ไว้เป็น 1 token เต็ม ไม่ให้แตกเป็น `inv`, `2026`, `009` จนไปชนกับเอกสารอื่น", "ถูก — รหัสที่คงสภาพเป็น token เดียวจะให้ค่า IDF สูงและจับคู่ใบแจ้งหนี้ได้ตรงเป๊ะ"],
          ["เพื่อทำให้ขนาดเวกเตอร์ใน pgvector ลดลงครึ่งหนึ่ง", "Tokenizer ของ BM25 ไม่ได้เปลี่ยนมิติของ Dense Vector ใน pgvector"],
          ["เพื่อข้ามขั้นตอน Unicode normalization", "ยังต้องทำ NFC normalization เหมือนเดิม"],
        ],
        "B",
        "การปกป้องรหัสที่มีโครงสร้างเฉพาะไว้เป็น token เดียวช่วยให้ BM25 จับคู่รหัสเอกสารได้แม่นยำโดยไม่ปนกับเลขปีหรือเลขลำดับในเอกสารอื่น",
        "ทำไมควรใช้ Regex ปกป้องรหัสเฉพาะ (เช่น `INV-2026-009`) ก่อนตัดคำภาษาไทยใน BM25?",
        "เพื่อป้องกันไม่ให้ตัวตัดคำหั่นรหัสออกเป็น `inv`, `2026`, `009` ทำให้รหัสทั้งชุดยังคงเป็น 1 token ที่มีค่า IDF สูงและค้นเจอแม่นยำ",
      ),
      mc(
        "d162-q2",
        "ในสมการ RRF `score(d) = Σ 1 / (k + rank_i(d))` เอกสาร A อยู่อันดับ 1 ใน BM25 และไม่ติด Dense ส่วนเอกสาร B อยู่อันดับ 2 ทั้ง BM25 และ Dense (กำหนด `k = 60`) เอกสารใดได้คะแนน RRF สูงกว่า?",
        [
          ["เอกสาร A ได้สูงกว่าเพราะติดอันดับ 1", "`1 / 61 ≈ 0.0164` เท่านั้น เพราะได้คะแนนจากฝั่งเดียว"],
          ["เอกสาร B ได้สูงกว่าเพราะติดอันดับต้น ๆ ทั้งสองฝั่ง (`2 / 62 ≈ 0.0323` > `1 / 61 ≈ 0.0164`)", "ถูก — RRF ให้รางวัลสูงกับเอกสารที่มีฉันทามติ (consensus) จากทั้ง Lexical และ Semantic Search"],
          ["เท่ากันเพราะ RRF ไม่สนใจอันดับที่ 2", "RRF คิดคะแนนจากทุกอันดับที่ปรากฏในรายการ"],
          ["คำนวณไม่ได้เพราะยังไม่ได้ normalize คะแนน BM25", "จุดเด่นของ RRF คือไม่ต้องใช้คะแนนดิบ ใช้แค่อันดับ (rank)"],
        ],
        "B",
        "เอกสาร B มี `1/(60+2) + 1/(60+2) = 0.0323` ซึ่งสูงกว่าเอกสาร A ที่ติดแค่ฝั่งเดียว (`1/(60+1) = 0.0164`) — นี่คือกลไกที่ดันเอกสารที่ตรงทั้งคำและบริบทขึ้นด้านบน",
        "เมื่อเทียบเอกสารที่ติดอันดับ 1 แค่ฝั่งเดียว กับเอกสารที่ติดอันดับ 2 ทั้ง Dense และ BM25 (k=60) ใครได้คะแนน RRF สูงกว่า?",
        "เอกสารที่ติดอันดับ 2 ทั้งสองฝั่ง (`2/62 ≈ 0.0323`) ได้คะแนนสูงกว่าเอกสารที่ติดอันดับ 1 ฝั่งเดียว (`1/61 ≈ 0.0164`) เพราะมีฉันทามติจากทั้งสองวิธี",
      ),
      mc(
        "d162-q3",
        "เหตุใดฝั่ง Ingestion และฝั่ง Query ในระบบ BM25 ต้องใช้ Tokenizer ชุดเดียวกัน (Symmetry)?",
        [
          ["เพื่อความเร็วในการคอมไพล์ไฟล์ Python", "ไม่เกี่ยวกับความเร็วการคอมไพล์ Python"],
          ["ถ้าฝั่งหนึ่งตัดคำว่า `'ใบกำกับภาษี'` เป็นคำเดียว แต่อีกฝั่งตัดเป็น 3 คำย่อย คำค้นจะไม่ตรงกับดัชนีใน BM25 เลย", "ถูก — token string ต้องตรงกัน 100% จึงจะนับ term frequency และ IDF เจอ"],
          ["เพราะ HNSW index บังคับให้ใช้ BM25 tokenizer ด้วย", "HNSW ใช้กับ Dense Vector ไม่ได้ใช้ BM25 tokenizer"],
          ["เพื่อลดขนาดไฟล์ `uv.lock`", "ไม่เกี่ยวกับไฟล์ lockfile"],
        ],
        "B",
        "BM25 ทำงานด้วยการจับคู่ token string แบบตรงตัว (exact token lookup) ดังนั้นกฎการตัดคำ, lowercase และ domain dictionary ต้องเหมือนกันทั้งตอนสร้างดัชนีและตอนค้นหา",
        "ทำไมฝั่งสร้างดัชนี (Index) และฝั่งค้นหา (Query) ใน BM25 ต้องใช้ Tokenizer เหมือนกันทุกประการ?",
        "เพราะ BM25 จับคู่ token แบบตรงตัว หากฝั่งหนึ่งตัดคำหรือแปลง case ต่างจากอีกฝั่ง คำค้นจะหาไม่เจอใน inverted index",
      ),
      mc(
        "d162-q4",
        "ในการเลือกระหว่าง **pgvector** กับ **Qdrant** สำหรับโปรเจกต์ Capstone ข้อใดสรุปความต่างเชิงสถาปัตยกรรมได้ถูกต้องที่สุด?",
        [
          ["pgvector รองรับเฉพาะ SQL แบบ exact match ไม่รองรับ HNSW", "ไม่จริง — pgvector มี HNSW index และ cosine distance (`<=>`) ในตัว"],
          ["Qdrant เก็บได้เฉพาะ Dense Vector ไม่รองรับ Sparse/Hybrid หรือ Payload Filter", "ไม่จริง — Qdrant รองรับทั้ง Sparse+Dense Hybrid, Fusion RRF และ Payload Filter ในตัว"],
          ["pgvector เหมาะเมื่ออยากรวมเวกเตอร์กับตารางธุรกิจ/ACL ไว้ใน PostgreSQL ก้อนเดียว ส่วน Qdrant เด่นเรื่อง native hybrid query และแยกโหลด vector ออกจาก DB หลัก", "ถูก — ทั้งคู่ทำงาน Hybrid ได้ดี การเลือกขึ้นอยู่กับ topology และความซับซ้อนในการดูแลระบบ"],
          ["ทั้งสองตัวแทนที่การใช้ PyThaiNLP ตัดคำภาษาไทยได้โดยอัตโนมัติ", "ทั้ง pgvector และ Qdrant ไม่ได้ติด PyThaiNLP ตัดคำไทยมาให้เป็นค่าเริ่มต้น ต้องตัดคำไทยในชั้นแอปพลิเคชัน"],
        ],
        "C",
        "ทั้ง pgvector และ Qdrant เป็นตัวเลือกหลักที่เหมาะสมใน Production โดย pgvector ลดจำนวน service เมื่อใช้ Postgres อยู่แล้ว ส่วน Qdrant โดดเด่นเมื่อต้องการ vector engine เฉพาะทางที่มี native sparse+dense fusion",
        "ข้อพิจารณาหลักในการเลือก pgvector เทียบกับ Qdrant ในระบบ Capstone คืออะไร?",
        "pgvector รวม vector และข้อมูลธุรกิจ/ACL ไว้ใน PostgreSQL เดียว ลด service ที่ต้องดูแล; Qdrant แยก vector engine เฉพาะทางที่มี native sparse+dense hybrid query และ payload filtering ความเร็วสูง",
      ),
    ],
  },

  takeaways: [
    "ใช้ {{pythainlp}} (`newmm` + domain dict) ตัดคำไทยทั้งฝั่ง Index และ Query พร้อม Regex ป้องกันรหัสเฉพาะ (`INV-2026-009`, `ภ.พ.20`)",
    "ผสาน {{bm25}} (แม่นคำ/รหัส) เข้ากับ Dense {{hnsw}} บน `pgvector` หรือ `Qdrant` (แม่นความหมาย/คำถามสองภาษา)",
    "รวมอันดับสองฝั่งด้วย {{rrf}} (`1 / (k + rank)`) เพื่อหลีกเลี่ยงปัญหาสเกลคะแนนไม่เท่ากัน",
    "ดึง `candidate_k = 20` จาก Hybrid Search เพื่อเตรียมชุดผู้สมัครคุณภาพสูงส่งให้ Cross-Encoder Reranker ใน Day 163",
  ],

  reviewCards: [
    rc(
      "d162-rc-1",
      "Bilingual Tokenizer สำหรับ BM25 ภาษาไทยปนอังกฤษควรมีขั้นตอนอะไรบ้าง?",
      "1) Regex ปกป้องรหัสเฉพาะ (INV-2026-009, ภ.พ.20), 2) lowercase คำอังกฤษ, 3) ส่งช่วงอักษรไทยเข้า PyThaiNLP newmm + custom_dict และใช้ฟังก์ชันเดียวกันทั้งฝั่ง ingest และ query",
    ),
    rc(
      "d162-rc-2",
      "ทำไม Hybrid Search ต้องใช้ RRF แทนการบวกคะแนน BM25 กับ Cosine Similarity ตรง ๆ?",
      "เพราะ Cosine Similarity มีค่า 0..1 ส่วน BM25 ไม่มีขอบบนตายตัว (อาจสูงเป็นสิบ) การใช้ RRF (`1/(k+rank)`) อิงเฉพาะอันดับจึงเสถียรโดยไม่ต้องปรับจูนสเกล",
    ),
    rc(
      "d162-rc-3",
      "เหตุใดเราจึงดึง Candidate Pool (`top_k=20`) จาก Hybrid Search แทนที่จะดึงแค่ 5 ชิ้นทันที?",
      "เพื่อให้มีโอกาสจับคำตอบไว้ครบก่อนส่งเข้า Cross-Encoder Reranker คัดละเอียดเหลือ Top-5 ในขั้นถัดไป ช่วยเพิ่มทั้ง Recall@5 และ MRR",
    ),
  ],

  sources: [
    { label: "PyThaiNLP Documentation — word_tokenize & newmm", href: "https://pythainlp.github.io/docs/" },
    { label: "Qdrant Documentation — Hybrid & Multi-Stage Queries", href: "https://qdrant.tech/documentation/concepts/hybrid-queries/" },
    { label: "pgvector — HNSW & Hybrid Search with Postgres", href: "https://github.com/pgvector/pgvector" },
    { label: "Cormack et al. — Reciprocal Rank Fusion (RRF)", href: "https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf" },
  ],

  glossary: ["pythainlp", "bm25", "embedding", "cosine-similarity", "hnsw", "rrf", "top-k", "rag", "reranker", "adr"],
});
