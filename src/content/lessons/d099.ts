import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D099 — Phase 4 / Block B25
 * Thai Lexical Search with PyThaiNLP + BM25 (rank_bm25)
 */
export const d099: Lesson = defineLesson({
  day: 99,
  titleTh: "ค้นหาคำตรงตัวภาษาไทยด้วย PyThaiNLP และ BM25 (rank_bm25)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · พลังลับของ Thai RAG: ใช้ Tokenizer ชุดเดียวทั้งตอน Index & Query เพื่อจับรหัสเอกสารและศัพท์เฉพาะแม่น 100%",
  icon: "search",
  visual: {
    id: "thai-bm25-index",
    title: "Thai Lexical Search (PyThaiNLP newmm + BM25) vs Dense Vector",
    caption: "เลือกคำถามรหัสสินค้าหรือคำพ้องความหมายเพื่อดูความต่างระหว่าง BM25 กับ Dense Vector บนภาษาไทย",
    alt: "แผนภาพเปรียบเทียบ Thai BM25 กับ Dense Vector",
  },
  requiresApiKey: false,
  tools: ["PyThaiNLP", "rank_bm25", "Python 3.12", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ภาษาไทยไม่มีช่องว่างคั่นคำ และเต็มไปด้วยรหัสเอกสารเฉพาะ",
      body: "ไลบรารีค้นหาคำอย่าง {{bm25}} ของโลกตะวันตกตัดคำด้วยช่องว่าง (`text.split()`), ซึ่งพังทันทีเมื่อเจอประโยคไทยติดกันยาว ๆ อย่าง `\"ขอเช็กสถานะคืนเงินคำสั่งซื้อ #INV-2026-009\"`",
      lessonNote: "วันนี้เราสร้าง Thai Tokenizer มาตรฐานด้วย {{pythainlp}} (`newmm`) + custom dictionary ที่ **รักษาโค้ด/รหัสเอกสารไม่ให้แตกกระจาย**",
    },
    {
      node: 2,
      heading: "BM25 เหนือกว่า TF-IDF ธรรมดาด้วย TF Saturation และ Length Normalization",
      body: "เมื่อค้นหาเอกสารยาวสั้นไม่เท่ากัน การนับความถี่คำแบบตรง ๆ ทำให้เอกสารที่ยัดคำซ้ำ ๆ หรือเอกสารยาวเกินจริงชนะอย่างไม่ยุติธรรม",
      lessonNote: "เข้าใจกลไกของ `k1` (อิ่มตัวความถี่คำ) และ `b` (ปรับสมดุลความยาวเอกสาร) ใน `BM25Okapi` ของ `rank_bm25`",
    },
    {
      node: 3,
      heading: "อุดจุดบอดที่ใหญ่ที่สุดของ Dense Embedding ในระบบ RAG ภาษาไทย",
      body: "Dense {{embedding}} เก่งความหมายแต่แยก `#INV-2026-009` กับ `#INV-2026-019` หรือ `SKU-8821` กับ `SKU-8829` ได้ไม่คม",
      lessonNote: "Thai BM25 คือครึ่งแรกของ Hybrid Search ที่เราจะนำไปเทียบกับ Dense Vector ใน Day 100 และผสานด้วย {{rrf}} ใน Day 101",
    },
    {
      node: 4,
      heading: "กฎเหล็ก Indexing–Query Parity: Tokenizer ต้องเหมือนกัน 100%",
      body: "บั๊กที่แอบเงียบที่สุดในระบบค้นหาคือใช้ tokenizer แบบหนึ่งตอนสร้างดัชนี (เช่น ไม่ใส่ custom dict หรือไม่ทำ lowercase) แต่ใช้อีกแบบตอนรับคำถามจากผู้ใช้",
      lessonNote: "คุณจะได้สร้างฟังก์ชัน `tokenize_thai_bm25` ตัวเดียวจบและเขียนเทสต์ใน {{pytest}} เพื่อล็อกความสอดคล้องของทั้งสองฝั่ง",
    },
  ],

  objectives: [
    "**สร้าง Thai BM25 Tokenizer** ด้วย {{pythainlp}} (`newmm` + `dict_trie`) ที่ทั้งตัดคำไทยได้แม่น, ทำ lowercase อังกฤษ และ **คงสภาพรหัสเอกสาร/สินค้า** (`INV-2026-009`, `SKU-8821`, `PDPA-39`) ไว้เป็นโทเค็นเดียวทั้งตอน index และตอน query",
    "**อธิบายสูตรและสัญชาตญาณของ {{bm25}}** — โดยเฉพาะบทบาทของพารามิเตอร์ `k1` (TF saturation), `b` (length normalization) และ IDF ที่ทำให้ BM25 แม่นกว่าการนับคำธรรมดา",
    "**สร้างดัชนีค้นคืน `ThaiBM25Index`** ด้วย `rank_bm25.BM25Okapi` ที่คัดกรองผลคะแนน `<= 0`, จัดอันดับแบบ deterministic และจับคู่รหัสเฉพาะได้แม่น 100%",
  ],

  prerequisites: [
    "เคยใช้งาน {{pythainlp}} `word_tokenize(..., engine=\"newmm\")` และ `dict_trie` จาก Day 49",
    "เข้าใจแนวคิด {{tfidf}} (Term Frequency & Inverse Document Frequency) จาก Day 49",
    "เขียน Regular Expressions พื้นฐาน (`re`) และรัน `pytest` ได้",
    "ไม่ต้องใช้ API key — รันบน CPU ของเครื่องคุณได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ Day 99 ด้วย `uv` และติดตั้ง `pythainlp` กับ `rank-bm25` ซึ่งเป็นสองแพ็กเกจเบา ๆ ที่รันบน CPU ได้เร็วมากและใช้จริงในท่อ Thai Hybrid RAG",
    commands: `uv init ai-day99 && cd ai-day99
uv add pythainlp rank-bm25
uv add --dev pytest ruff
uv run python -c "from pythainlp.tokenize import word_tokenize; from rank_bm25 import BM25Okapi; print(word_tokenize('ขอคืนเงินใบแจ้งหนี้', engine='newmm'))"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day99` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pythainlp`, `rank-bm25`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งทดสอบแล้วเห็นลิสต์คำภาษาไทยที่ถูกตัดอย่างถูกต้อง"],
    ],
    note: "`rank-bm25` เป็นไลบรารี Pure Python ขนาดเล็กที่ทำงานกับลิสต์ของโทเค็น (`list[list[str]]`) โดยตรง จึงเหมาะมากสำหรับดัชนีระดับหมื่นเอกสารและการทำ prototyping/testing ก่อนนำไปผสานใน Qdrant/PostgreSQL",
  },

  concepts: [
    {
      id: "thai-tokenizer-parity-and-code-preservation",
      title: "1 · พลังลับของ Thai RAG: ตัดคำด้วย PyThaiNLP + รักษารหัสเฉพาะให้เหมือนเป๊ะทั้ง Index และ Query",
      paragraphs: [
        "ถ้าคุณโยนข้อความไทยอย่าง `\"นโยบายคืนเงินสำหรับรหัสสินค้า SKU-8821 และใบแจ้งหนี้ INV-2026-009\"` เข้าไปใน `text.split()` ผลลัพธ์จะได้ก้อนยาวอย่าง `\"นโยบายคืนเงินสำหรับรหัสสินค้า\"` ทำให้เวลาลูกค้าถามว่า `\"ขอคืนเงิน SKU-8821\"` ดัชนีจะหาคำว่า `\"คืนเงิน\"` ไม่เจอเลย! ในทางกลับกัน หากโยนทั้งประโยคเข้า `word_tokenize(..., engine=\"newmm\")` ตรง ๆ รหัสอย่าง `INV-2026-009` มักถูกหั่นเป็น `['INV', '-', '2026', '-', '009']` ทำให้เอกสาร `INV-2026-019` ที่แชร์ `INV` และ `2026` พลอยได้คะแนนสูงตามไปด้วย",
        "สูตรวิศวกรรมสำหรับ **Thai BM25 Tokenizer** ที่มีคุณภาพจึงมี 4 ขั้นตอนสั้น ๆ: (1) ดึงและ **ปกป้องรหัสเฉพาะ** ที่มีขีด/ตัวเลข/ตัวอักษรปนกันด้วย regex (เช่น `INV-2026-009`, `SKU-8821`, `PDPA-39`) เก็บไว้เป็นโทเค็นเดี่ยวแบบ lowercase (`\"inv-2026-009\"`), (2) ตัดข้อความที่เหลือด้วย {{pythainlp}} `newmm` ร่วมกับ **`custom_dict`** (`dict_trie`) สำหรับศัพท์เฉพาะองค์กร (เช่น `พร้อมเพย์`, `ใบกำกับภาษี`, `คืนเงิน`), (3) แปลงภาษาอังกฤษเป็น lowercase และตัดเครื่องหมายวรรคตอน/ช่องว่างทิ้ง, และ (4) **เรียกใช้ฟังก์ชัน tokenizer ตัวเดียวกันเป๊ะทั้งตอน Indexing และตอน Querying**",
        "การทำเช่นนี้ทำให้ทั้งคำไทย (`\"คืนเงิน\"`, `\"พร้อมเพย์\"`) และรหัสเฉพาะ (`\"inv-2026-009\"`) ถูกเก็บเป็นโทเค็นที่คมชัดไม่แตกกระจาย ส่งผลให้ BM25 ชนะขาดในคำถามที่มีเลขที่เอกสารหรือรหัสสินค้า",
      ],
      analogy:
        "เหมือนการทำดัชนีท้ายเล่มหนังสือภาษาไทย: ถ้าไม่ตัดคำ หนังสือทั้งหน้าจะกลายเป็นคำเดียวจนเปิดหาไม่เจอ แต่ถ้าเผลอหั่นเลขรหัสสินค้า `SKU-8821` ออกจากกันเป็น `SKU` กับ `8821` คนที่หารหัสเฉพาะก็จะเจอของผิดรุ่นแทน",
      code: {
        language: "python",
        filename: "thai_tokenizer.py",
        code: `import re
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie

# จับรหัสเอกสาร/สินค้า เช่น INV-2026-009, SKU-8821, PDPA-39
CODE_RE = re.compile(r"[A-Za-z]{2,}(?:-[A-Za-z0-9]+)+")
PUNCT_RE = re.compile(r"^[\\W_]+$", re.UNICODE)

CUSTOM_WORDS = {"พร้อมเพย์", "ใบกำกับภาษี", "ค้างชำระ", "คืนเงิน"}
TRIE = dict_trie(set(thai_words()) | CUSTOM_WORDS)

def tokenize_thai_bm25(text: str) -> list[str]:
    codes = [m.group(0).lower() for m in CODE_RE.finditer(text)]
    rest = CODE_RE.sub(" ", text)
    raw_tokens = word_tokenize(rest, engine="newmm", custom_dict=TRIE, keep_whitespace=False)
    cleaned = [
        tok.strip().lower()
        for tok in raw_tokens
        if tok.strip() and not PUNCT_RE.match(tok.strip())
    ]
    return codes + cleaned

print(tokenize_thai_bm25("ขอเช็กยอดค้างชำระ #INV-2026-009 ผ่านพร้อมเพย์"))`,
        caption: "แยกเก็บ `inv-2026-009` เป็นโทเค็นเดี่ยว ก่อนส่งข้อความที่เหลือให้ `newmm` + `dict_trie` ตัดคำไทย",
      },
      whyTitle: "Why this matters — แก้ทั้งคำไทยติดกันและรหัสสินค้าถูกหั่นใน 15 บรรทัด",
      whyParagraphs: [
        "ความผิดพลาดที่พบบ่อยที่สุดใน Thai BM25 คือการปล่อยให้ tokenizer หั่น `INV-2026-009` เป็นชิ้นย่อย หรือใช้ `custom_dict` ตอนสร้างดัชนีแต่ลืมส่ง `custom_dict` ตอนรับคำถาม ทำให้โทเค็นสองฝั่งไม่ตรงกันจนคะแนนกลายเป็น 0",
        "การรวมทุกอย่างไว้ในฟังก์ชัน `tokenize_thai_bm25` เดียวแล้วบังคับให้ทั้ง `add_documents` และ `search` เรียกใช้ฟังก์ชันนี้เท่านั้นช่วยปิดบั๊ก Index–Query Mismatch ได้อย่างเด็ดขาด",
      ],
    },
    {
      id: "bm25-intuition-k1-b",
      title: "2 · สัญชาตญาณเบื้องหลัง BM25: TF Saturation (`k1`), Length Normalization (`b`) และ IDF",
      paragraphs: [
        "ใน Day 49 เราใช้ {{tfidf}} ซึ่งให้คะแนนเพิ่มตามความถี่ของคำ (`TF`) คูณความหายากของคำ (`IDF`) — แต่ในงานค้นหาเอกสารจริง TF-IDF มีจุดอ่อนสองข้อ: (1) ถ้าเอกสารชิ้นหนึ่งแปะคำว่า `\"คืนเงิน\"` ซ้ำ 50 ครั้ง คะแนนจะพุ่งสูงเกินจริง ทั้งที่เอกสารที่อธิบายชัดเจนโดยใช้คำนี้แค่ 3 ครั้งอาจดีกว่ามาก, และ (2) เอกสารที่ยาว 20 หน้ามีโอกาสติดคำค้นมากกว่าเอกสารสั้น 1 ย่อหน้าโดยธรรมชาติ",
        "**{{bm25}} (Best Matching 25)** แก้ทั้งสองปัญหาด้วยพารามิเตอร์มาตรฐาน 2 ตัวใน `BM25Okapi`: **`k1`** (ค่าเริ่มต้น `1.5`) ควบคุม **TF Saturation** — การปรากฏของคำครั้งแรก ๆ ดันคะแนนขึ้นแรงมาก แต่พอเกิน 3–5 ครั้งกราฟจะเริ่มอิ่มตัวและแบนราบลง (ไม่ยอมให้ spam คำชนะ), และ **`b`** (ค่าเริ่มต้น `0.75`, ช่วง `[0, 1]`) ควบคุม **Document Length Normalization** — เอกสารที่ยาวกว่าค่าเฉลี่ยของคลัง (`avgdl`) จะถูกหารลดคะแนนลง ส่วนเอกสารที่สั้นกระชับและตรงประเด็นจะได้แต้มต่อ",
        "ส่วนองค์ประกอบที่สามคือ **IDF (Inverse Document Frequency)**: คำที่โผล่ในเกือบทุกเอกสาร (เช่น `\"บริษัท\"`, `\"ลูกค้า\"`) จะได้น้ำหนักต่ำมาก ขณะที่คำหายากอย่าง `\"inv-2026-009\"` หรือ `\"มาตรา 39\"` จะได้คะแนน IDF สูงลิ่ว ทำให้เอกสารที่มีรหัสนั้นพุ่งขึ้นอันดับ 1 ทันที",
      ],
      analogy:
        "`k1` เหมือนการกินข้าว: จานแรกกับจานสองช่วยให้อิ่มขึ้นมาก (คะแนนเพิ่มแรง) แต่จานที่สิบแทบไม่เพิ่มความพึงพอใจแล้ว (อิ่มตัว) ส่วน `b` เหมือนการเทียบความเข้มข้นของกาแฟ: ใส่ผงกาแฟ 1 ช้อนในแก้วเล็กเข้มกว่าใส่ 1 ช้อนในถังน้ำใหญ่",
      bullets: [
        "**`k1 = 1.5` (มาตรฐาน 1.2–2.0)**: ถ้า `k1 = 0` จะนับแค่มีหรือไม่มีคำนั้น (binary); ยิ่ง `k1` สูงยิ่งยอมให้คำซ้ำดันคะแนนได้มากขึ้น",
        "**`b = 0.75` (มาตรฐาน 0.5–0.8)**: ถ้า `b = 0` จะไม่สนใจความยาวเอกสารเลย; ถ้า `b = 1` จะลงโทษเอกสารยาวเต็มที่",
        "**คะแนน BM25 ไม่มีขอบบนคงที่**: ค่าคะแนนอาจเป็น `0.0`, `3.2` หรือ `18.5` ขึ้นกับจำนวนคำค้นและขนาดคลัง — นี่คือเหตุผลที่เราห้ามเอาคะแนน BM25 ไปบวกตรง ๆ กับ Cosine Similarity (และต้องใช้ {{rrf}} ใน Day 101)",
      ],
      whyTitle: "Why this matters — รู้ว่าเมื่อไร BM25 คืน 0 และทำไมต้องกรองผลคะแนน 0 ออก",
      whyParagraphs: [
        "ใน `rank_bm25.BM25Okapi` เมธอด `get_scores(query_tokens)` จะคืนอาเรย์คะแนนสำหรับ **ทุกเอกสารในคลัง** แม้เอกสารนั้นจะไม่มีคำค้นแม้แต่คำเดียว (ได้คะแนน `0.0`) — ถ้าคุณเผลอหยิบ `top_k` โดยไม่กรอง `score > 0` ระบบจะส่งเอกสารมั่ว ๆ ที่ได้คะแนน `0.0` เข้าไปให้ LLM จนเกิด hallucination",
        "หมายเหตุสำคัญอีกข้อ: บนคลังขนาดจิ๋วมาก (เช่น 2–3 เอกสาร) ถ้าคำหนึ่งปรากฏในมากกว่าครึ่งของเอกสารทั้งหมด สูตร IDF มาตรฐานอาจให้ค่าใกล้ศูนย์หรือติดลบได้ (`rank_bm25` มีพารามิเตอร์ `epsilon = 0.25` ไว้ประคอง floor ของ IDF) ดังนั้นการทดสอบ BM25 ควรใช้คลังอย่างน้อย 5–10 เอกสารที่เป็นตัวแทนจริง",
      ],
    },
    {
      id: "when-bm25-crushes-dense",
      title: "3 · สนามที่ BM25 ชนะ Dense Vector ขาดลอย vs สนามที่ BM25 แพ้",
      paragraphs: [
        "การรู้จักทั้ง **จุดแข็ง** และ **จุดอ่อน** ของ BM25 คือสิ่งที่ทำให้คุณออกแบบระบบ {{rag}} ได้ดีกว่าค่าเฉลี่ย: BM25 ชนะ Dense Vector ขาดลอยเมื่อคำถามมี **Exact Identifiers** เช่น เลขใบแจ้งหนี้ (`INV-2026-009`), รหัสสินค้า (`SKU-8821`), เลขมาตรา (`PDPA-39`), รหัส error (`ERR_429_QUOTA`) หรือชื่อเฉพาะรุ่นสินค้าที่โมเดล embedding ไม่เคยเห็นตอนเทรน",
        "แต่ในทางกลับกัน BM25 จะ **แพ้สนิท (คืนคะแนน 0)** เมื่อผู้ใช้ถามด้วย **คำพ้องความหมายหรือภาษาพูด** ที่ไม่มีตัวอักษรตรงกับเอกสาร เช่น เอกสารเขียนว่า *\"นโยบายการขอรับเงินคืนสำหรับการยกเลิกคำสั่งซื้อ\"* แต่ลูกค้าพิมพ์ว่า *\"ซื้อผิดรุ่นอยากได้ตังค์กลับต้องทำไง\"* — กรณีนี้ไม่มีคำไหนตรงตัวกันเลย Dense {{embedding}} จึงเป็นพระเอกแทน",
        "ความจริงข้อนี้เองที่ปูทางตรงไปยัง **Day 100** (สร้างชุดทดสอบวัดเทียบ BM25 vs Dense แยกตามประเภทคำถาม) และ **Day 101** (รวมสองโลกเข้าด้วยกันด้วย Hybrid {{rrf}})",
      ],
      analogy:
        "BM25 คือเครื่องสแกนบาร์โค้ดที่อ่านรหัสสินค้าแม่น 100% ไม่มีวันจำสลับรุ่น แต่ถ้าลูกค้าเดินมาอธิบายลักษณะสินค้าด้วยภาษาพูดโดยไม่มีบาร์โค้ด เครื่องสแกนจะอ่านไม่ได้เลย ต้องอาศัยพนักงานที่เข้าใจความหมาย (Dense Vector) ช่วยแทน",
      bullets: [
        "**BM25 ชนะขาด**: รหัสคำสั่งซื้อ (`INV-2026-009`), รหัสสินค้า (`SKU-8821`), เลขมาตรา/ข้อบังคับ, รหัส Error โค้ด, ชื่อแบรนด์หรือศัพท์ใหม่ (OOV)",
        "**Dense Vector ชนะขาด**: คำพ้องความหมาย (`ค้างชำระ` ↔ `ยอดค้างจ่าย`), ภาษาพูดไทย (`อยากได้ตังค์คืน`), คำถามไทยหาเอกสารอังกฤษ",
        "**BM25 เร็วและเบามาก**: ไม่ต้องใช้ GPU, ไม่เสียค่า embedding API, รันบน CPU ได้ในไม่กี่มิลลิวินาที",
      ],
      whyTitle: "Why this matters — หยุดโทษ LLM เมื่อ Retriever หารหัสเอกสารไม่เจอ",
      whyParagraphs: [
        "ในองค์กรไทย (ธนาคาร, อีคอมเมิร์ซ, ฝ่ายกฎหมาย, ฝ่ายไอที) คำถามกว่า 30–50% มีเลขรหัสเอกสารหรือชื่อฟีเจอร์เฉพาะปนอยู่ด้วยเสมอ",
        "การเพิ่ม Thai BM25 (`PyThaiNLP` + `rank_bm25`) ใช้ทรัพยากรน้อยมากแต่ช่วยปิดช่องโหว่การค้นหารหัสเฉพาะได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เปรียบเทียบ Thai BM25 กับ Full-Text Search ในเว็บแอป",
      body: [
        "ถ้าคุณเคยทำช่องค้นหาด้วย PostgreSQL `tsvector` / Elasticsearch Analyzer นี่คือการเทียบส่วนประกอบแบบหนึ่งต่อหนึ่งสำหรับภาษาไทย:",
      ],
      table: [
        ["`tokenize_thai_bm25` (`newmm` + regex)", "Elasticsearch Thai Analyzer + Custom Token Filter"],
        ["`dict_trie(custom_words)`", "Custom dictionary / userdict ใน Search Engine"],
        ["`BM25Okapi(corpus_tokens)`", "Inverted Index + BM25 scoring (ค่าเริ่มต้นของ Elasticsearch/OpenSearch)"],
        ["Index–Query Tokenizer Parity", "การใช้ Analyzer ชุดเดียวกันทั้งตอน index และตอน search"],
      ],
    },
    student: {
      title: "First-Year Note — Inverted Index และเหตุผลที่ BM25 เร็วมาก",
      body: [
        "แนวคิดของระบบค้นหาคำตรงตัวคือ **ดัชนีกลับหัว (Inverted Index)** ซึ่งเก็บแผนที่ `คำ -> [รายการเอกสารที่มีคำนั้น]` แทนที่จะอ่านทุกตัวอักษรของทุกเอกสารใหม่ทุกครั้ง เหมือนดัชนีท้ายตำราเรียนที่บอกทันทีว่าคำว่า `\"BM25\"` อยู่ที่หน้า 12, 45 และ 99",
        "ใน `rank_bm25` เราส่งเอกสารที่ตัดคำแล้วเป็นลิสต์ซ้อนลิสต์ (`list[list[str]]`) เข้า `BM25Okapi(tokenized_corpus)` ตอนสร้างอ็อบเจกต์ มันจะคำนวณความยาวเฉลี่ย `avgdl` และค่า `IDF` ของทุกคำเตรียมไว้ล่วงหน้า ทำให้ตอน `get_scores(query_tokens)` คำนวณเสร็จแทบจะทันที",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีคลังเอกสารไทยปนอังกฤษขนาดเล็ก 5 ชิ้นที่มีทั้งใบแจ้งหนี้รหัสคล้ายกัน (`INV-2026-009` vs `INV-2026-019`) และคู่มือนโยบาย ลองดูความต่างระหว่างการตัดคำแบบธรรมดากับ `tokenize_thai_bm25` + `BM25Okapi`",
    steps: [
      {
        title: "1 · เทียบการตัดคำ: `str.split()` vs `PyThaiNLP newmm` + ปกป้องรหัส",
        explain:
          "สังเกตว่า `str.split()` ได้คำติดกันทั้งพืด ส่วน `tokenize_thai_bm25` แยกคำไทยพร้อมคง `inv-2026-009` ไว้เป็นโทเค็นเดี่ยวอย่างครบถ้วน",
        code: {
          language: "python",
          filename: "worked_thai_bm25.py",
          code: `import re
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie

CODE_RE = re.compile(r"[A-Za-z]{2,}(?:-[A-Za-z0-9]+)+")
PUNCT_RE = re.compile(r"^[\\W_]+$", re.UNICODE)
TRIE = dict_trie(set(thai_words()) | {"พร้อมเพย์", "ใบกำกับภาษี", "ค้างชำระ", "คืนเงิน"})

def tokenize_thai_bm25(text: str) -> list[str]:
    codes = [m.group(0).lower() for m in CODE_RE.finditer(text)]
    rest = CODE_RE.sub(" ", text)
    raw = word_tokenize(rest, engine="newmm", custom_dict=TRIE, keep_whitespace=False)
    return codes + [t.strip().lower() for t in raw if t.strip() and not PUNCT_RE.match(t.strip())]

sample = "ใบแจ้งหนี้ #INV-2026-009 ค้างชำระผ่านพร้อมเพย์"
print("str.split()       :", sample.split())
print("tokenize_thai_bm25:", tokenize_thai_bm25(sample))`,
        },
        output: `str.split()       : ['ใบแจ้งหนี้', '#INV-2026-009', 'ค้างชำระผ่านพร้อมเพย์']
tokenize_thai_bm25: ['inv-2026-009', 'ใบแจ้งหนี้', 'ค้างชำระ', 'ผ่าน', 'พร้อมเพย์']`,
      },
      {
        title: "2 · สร้างดัชนี BM25Okapi และค้นหารหัสเฉพาะ #INV-2026-009",
        explain:
          "ใช้ `tokenize_thai_bm25` ตัวเดียวกันกับทั้ง 5 เอกสารและคำถาม — สังเกตว่า `doc_inv_009` ชนะ `doc_inv_019` ขาดลอยเพราะโทเค็น `inv-2026-009` ไม่ถูกหั่นแตก",
        code: {
          language: "python",
          filename: "worked_thai_bm25.py",
          code: `from rank_bm25 import BM25Okapi

docs = [
    ("doc_inv_009", "ใบแจ้งหนี้ INV-2026-009 ยอดค้างชำระ 1,490 บาท ชำระผ่านพร้อมเพย์"),
    ("doc_inv_019", "ใบแจ้งหนี้ INV-2026-019 ยอดค้างชำระ 2,990 บาท ชำระผ่านบัตรเครดิต"),
    ("doc_refund",  "นโยบายคืนเงินภายใน 7 วัน สำหรับสินค้าที่ยังไม่แกะซีล"),
    ("doc_tax",     "วิธีขอใบกำกับภาษีเต็มรูปแบบสำหรับลูกค้าองค์กร"),
    ("doc_pdpa",    "แนวทางคุ้มครองข้อมูลส่วนบุคคลตาม PDPA-39 สำหรับฝ่ายบริการลูกค้า"),
]

tokenized_corpus = [tokenize_thai_bm25(text) for _, text in docs]
bm25 = BM25Okapi(tokenized_corpus)

q_tokens = tokenize_thai_bm25("ขอเช็กสถานะ #INV-2026-009 ค้างชำระ")
scores = bm25.get_scores(q_tokens)
ranked = sorted(
    [(docs[i][0], float(scores[i])) for i in range(len(docs)) if scores[i] > 0],
    key=lambda x: (-x[1], x[0]),
)
for doc_id, score in ranked:
    print(f"{doc_id:<14} score={score:.4f}")`,
        },
        output: `doc_inv_009    score=1.4218
doc_inv_019    score=0.3365`,
      },
      {
        title: "3 · สังเกตจุดอ่อนของ BM25 เมื่อเจอคำถามภาษาพูดที่ไม่มีคำตรงตัว",
        explain:
          "เมื่อผู้ใช้ถามว่า *\"ซื้อผิดอยากได้ตังค์กลับ\"* ซึ่งไม่ตรงกับคำว่า `คืนเงิน` ใน `doc_refund` คะแนน BM25 ของทุกเอกสารจะเป็น 0 และคืนลิสต์ว่าง — นี่คือเหตุผลที่ต้องใช้คู่กับ Dense Vector ใน Day 100–101",
        code: {
          language: "python",
          filename: "worked_thai_bm25.py",
          code: `paraphrase_tokens = tokenize_thai_bm25("ซื้อผิดอยากได้ตังค์กลับ")
p_scores = bm25.get_scores(paraphrase_tokens)
hits = [(docs[i][0], float(p_scores[i])) for i in range(len(docs)) if p_scores[i] > 0]
print("Paraphrase tokens:", paraphrase_tokens)
print("BM25 hits        :", hits)`,
        },
        output: `Paraphrase tokens: ['ซื้อ', 'ผิด', 'อยากได้', 'ตังค์', 'กลับ']
BM25 hits        : []`,
      },
    ],
    gotcha:
      "จุดสังเกต: อย่าลืมกรอง `score > 0` ก่อนคืนผลลัพธ์จาก `BM25Okapi.get_scores(...)` เสมอ! ถ้าไม่กรอง ในขั้นตอนที่ 3 ด้านบนระบบจะหยิบ 3 เอกสารแรกที่ได้ `score = 0.0` ส่งเข้าไปเป็นบริบทของ LLM ซึ่งทำให้คำตอบมั่วทันที",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้าง `ThaiBM25Tokenizer` และคลาส `ThaiBM25Index` ด้วย `PyThaiNLP` + `rank_bm25` ที่รักษารหัสสินค้า/ใบแจ้งหนี้, รองรับ custom dictionary และคัดกรองผลคะแนน `<= 0` พร้อม tie-break อย่างคงเส้นคงวา",
    requirements: [
      "สร้างฟังก์ชัน `tokenize_thai_bm25(text: str, custom_words: set[str] | None = None, stopwords: set[str] | None = None) -> list[str]` ที่ (1) สกัดรหัสเอกสารตาม pattern `[A-Za-z]{2,}(?:-[A-Za-z0-9]+)+` เป็น lowercase token เดี่ยว, (2) ตัดข้อความที่เหลือด้วย `word_tokenize(..., engine=\"newmm\", custom_dict=..., keep_whitespace=False)`, และ (3) ทำ lowercase ตัดเครื่องหมายวรรคตอนล้วน และตัดคำใน `stopwords` (หากกำหนด)",
      "สร้างคลาส `ThaiBM25Index(docs: list[tuple[str, str]], *, custom_words: set[str] | None = None, stopwords: set[str] | None = None, k1: float = 1.5, b: float = 0.75)` ที่ใช้ `tokenize_thai_bm25` ชุดเดียวกันสร้าง `BM25Okapi` (ถ้า `docs` ว่างให้โยน `ValueError`)",
      "เมธอด `search(query: str, *, top_k: int = 5) -> list[tuple[str, float]]` ใช้ `tokenize_thai_bm25` ด้วย `custom_words` และ `stopwords` ชุดเดียวกับตอน index, กรองเฉพาะเอกสารที่ `score > 0`, เรียงคะแนนจากมากไปน้อย (tie-break ด้วย `doc_id` น้อย→มาก) และคืนไม่เกิน `top_k` ชิ้น (ถ้า `top_k <= 0` โยน `ValueError`)",
      "เมธอด `explain_tokens(text: str) -> list[str]` คืนผลโทเค็นที่ใช้จริงในดัชนี เพื่อให้ผู้พัฒนาตรวจสอบ/ดีบักได้ง่ายว่าคำถามและเอกสารถูกตัดคำตรงกันหรือไม่",
    ],
    starter: {
      language: "python",
      filename: "exercise_day099.py",
      code: `from __future__ import annotations
import re
from pythainlp.corpus.common import thai_words
from pythainlp.tokenize import word_tokenize
from pythainlp.util import dict_trie
from rank_bm25 import BM25Okapi

CODE_RE = re.compile(r"[A-Za-z]{2,}(?:-[A-Za-z0-9]+)+")
PUNCT_RE = re.compile(r"^[\\W_]+$", re.UNICODE)


def tokenize_thai_bm25(
    text: str,
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
) -> list[str]:
    """ตัดคำภาษาไทยสำหรับ BM25 โดยรักษารหัสเอกสารและรองรับ custom_words / stopwords."""
    # TODO: 1) ดึงรหัสตาม CODE_RE เป็น lowercase และแทนที่ด้วยช่องว่างในข้อความเดิม
    # TODO: 2) สร้าง dict_trie รวม thai_words() กับ custom_words (ถ้ามี) แล้วตัดคำด้วย newmm
    # TODO: 3) กรองช่องว่าง, PUNCT_RE และ stopwords (lowercase) แล้วคืน codes + cleaned
    raise NotImplementedError


class ThaiBM25Index:
    def __init__(
        self,
        docs: list[tuple[str, str]],
        *,
        custom_words: set[str] | None = None,
        stopwords: set[str] | None = None,
        k1: float = 1.5,
        b: float = 0.75,
    ) -> None:
        # TODO: 1) ตรวจว่า docs ไม่ว่าง (ถ้าว่าง raise ValueError)
        # TODO: 2) เก็บ doc_ids, custom_words, stopwords และสร้าง BM25Okapi(..., k1=k1, b=b)
        raise NotImplementedError

    def explain_tokens(self, text: str) -> list[str]:
        # TODO: คืนลิสต์โทเค็นจาก tokenize_thai_bm25 โดยใช้ config เดียวกับตอนสร้าง index
        raise NotImplementedError

    def search(self, query: str, *, top_k: int = 5) -> list[tuple[str, float]]:
        # TODO: validate top_k > 0, ตัดคำ query ด้วย explain_tokens, คัดเฉพาะ score > 0, เรียง (-score, doc_id)[:top_k]
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day099.py",
      code: `import pytest
from exercise_day099 import ThaiBM25Index, tokenize_thai_bm25

SAMPLE_DOCS = [
    ("doc_inv_009", "ใบแจ้งหนี้ INV-2026-009 ยอดค้างชำระ 1,490 บาท ชำระผ่านพร้อมเพย์"),
    ("doc_inv_019", "ใบแจ้งหนี้ INV-2026-019 ยอดค้างชำระ 2,990 บาท ชำระผ่านบัตรเครดิต"),
    ("doc_sku_8821", "คู่มือรับประกันสินค้า SKU-8821 หูฟังไร้สายรับประกัน 1 ปีเต็ม"),
    ("doc_refund", "นโยบายคืนเงินภายใน 7 วัน สำหรับคำสั่งซื้อที่ยังไม่เปิดใช้งาน"),
    ("doc_tax", "ขั้นตอนขอใบกำกับภาษีเต็มรูปแบบสำหรับลูกค้าองค์กร"),
    ("doc_pdpa", "ข้อกำหนด PDPA-39 เรื่องสิทธิขอลบข้อมูลส่วนบุคคลของลูกค้า"),
]


def test_tokenizer_preserves_codes_and_custom_words():
    tokens = tokenize_thai_bm25(
        "เช็ก #INV-2026-009 จ่ายพร้อมเพย์และขอใบกำกับภาษี",
        custom_words={"พร้อมเพย์", "ใบกำกับภาษี"},
        stopwords={"และ"},
    )
    assert "inv-2026-009" in tokens
    assert "พร้อมเพย์" in tokens
    assert "ใบกำกับภาษี" in tokens
    assert "และ" not in tokens


def test_exact_code_retrieval_beats_similar_code():
    index = ThaiBM25Index(SAMPLE_DOCS, custom_words={"พร้อมเพย์", "ค้างชำระ"})
    hits = index.search("สถานะใบแจ้งหนี้ #INV-2026-009", top_k=3)
    assert hits[0][0] == "doc_inv_009"
    assert hits[0][1] > 0

    sku_hits = index.search("รับประกัน SKU-8821 กี่ปี", top_k=2)
    assert sku_hits[0][0] == "doc_sku_8821"


def test_zero_score_documents_are_filtered_out():
    index = ThaiBM25Index(SAMPLE_DOCS)
    hits = index.search("สภาพอากาศเชียงใหม่พรุ่งนี้", top_k=5)
    assert hits == []


def test_index_query_parity_and_validation():
    index = ThaiBM25Index(SAMPLE_DOCS, custom_words={"พร้อมเพย์"}, stopwords={"ขอ"})
    assert "พร้อมเพย์" in index.explain_tokens("จ่ายผ่านพร้อมเพย์")
    assert "ขอ" not in index.explain_tokens("ขอใบกำกับภาษี")

    with pytest.raises(ValueError):
        ThaiBM25Index([])
    with pytest.raises(ValueError):
        index.search("คืนเงิน", top_k=0)
`,
    },
    selfCheck: [
      "`tokenize_thai_bm25` คงสภาพรหัส `inv-2026-009` และ `sku-8821` ไว้เป็นโทเค็นเดี่ยวโดยไม่แตกที่เครื่องหมายขีด",
      "`custom_words` ทำให้คำเฉพาะอย่าง `\"พร้อมเพย์\"` และ `\"ใบกำกับภาษี\"` ถูกตัดเป็นคำเดี่ยวทั้งตอน index และตอน query",
      "คำถามที่ไม่ตรงคำใดเลยในคลังคืนลิสต์ว่าง `[]` (ไม่ปล่อยเอกสารคะแนน `0.0` หลุดออกมา)",
      "ค้นหา `#INV-2026-009` ได้ `doc_inv_009` เป็นอันดับ 1 เหนือ `doc_inv_019`",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์ และ `uv run ruff check .` ผ่านสะอาด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `tokenize_thai_bm25` ให้ใช้ `stop_set = {w.lower() for w in (stopwords or set())}` และสร้าง trie ด้วย `dict_trie(set(thai_words()) | (custom_words or set()))` (เคล็ดลับความเร็ว: ใน `ThaiBM25Index.__init__` สามารถสร้าง `dict_trie` เก็บไว้เป็นแอตทริบิวต์ครั้งเดียวเพื่อไม่ต้องสร้างใหม่ทุกครั้งที่ค้นหา)",
      },
      {
        body: "ใน `ThaiBM25Index.search` หลังจากได้ `scores = self._bm25.get_scores(q_tokens)` ให้กรองเฉพาะ `score > 0.0` แล้วเรียงด้วย `key=lambda item: (-item[1], item[0])` และตัด `[:top_k]` — กรณี `q_tokens` ว่างสามารถคืน `[]` ได้ทันที",
      },
      {
        body: "โครงหลักของ `tokenize_thai_bm25` และ `ThaiBM25Index` — เหลือเติมการจัดการ `stopwords` และการตรวจสอบ `ValueError`",
        code: {
          language: "python",
          filename: "hint_day099.py",
          code: `def tokenize_thai_bm25(
    text: str,
    custom_words: set[str] | None = None,
    stopwords: set[str] | None = None,
) -> list[str]:
    codes = [m.group(0).lower() for m in CODE_RE.finditer(text)]
    rest = CODE_RE.sub(" ", text)
    vocab = set(thai_words()) | (custom_words or set())
    trie = dict_trie(vocab)
    stop_set = {w.lower() for w in (stopwords or set())}
    raw = word_tokenize(rest, engine="newmm", custom_dict=trie, keep_whitespace=False)
    cleaned = [
        tok.strip().lower()
        for tok in raw
        if tok.strip()
        and not PUNCT_RE.match(tok.strip())
        and tok.strip().lower() not in stop_set
    ]
    return [c for c in codes if c not in stop_set] + cleaned`,
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
      title: "ใช้ Tokenizer คนละชุดระหว่างตอน Index กับตอน Query",
      symptom: "สร้างดัชนีด้วย `custom_dict` ที่มีคำว่า `\"ใบกำกับภาษี\"` แต่ตอน query ดันใช้ `word_tokenize` ธรรมดาที่ตัดเป็น `['ใบ', 'กำกับ', 'ภาษี']` ทำให้ค้นไม่เจอเลย",
      fix: "ห่อ tokenizer ไว้เป็นฟังก์ชันเดียวและบังคับให้ทั้งตอนสร้างดัชนีและตอนค้นหาเรียกใช้ผ่าน config ชุดเดียวกัน (Index–Query Parity)",
    },
    {
      title: "ปล่อยให้ newmm หั่นรหัสเอกสาร (INV-2026-009) ออกเป็นชิ้นย่อย",
      symptom: "ค้นหา `INV-2026-009` แต่ได้ `INV-2026-019` หรือเอกสารปี `2026` อื่น ๆ ขึ้นมาแย่งอันดับเพราะคำว่า `INV` กับ `2026` ซ้ำกัน",
      fix: "สกัดรหัสที่มีขีด/ตัวเลขด้วย regex ก่อนส่งข้อความส่วนที่เหลือไปตัดคำไทยด้วย `newmm`",
    },
    {
      title: "ไม่กรองเอกสารที่ score <= 0 ออกจากผลลัพธ์ของ rank_bm25",
      symptom: "เมื่อลูกค้าถามคำถามนอกเรื่องที่ไม่มีคำใดตรงกับคลัง ระบบยังคืน 5 เอกสารแรกที่ได้คะแนน `0.0` ส่งให้ LLM จนโมเดลตอบมั่ว",
      fix: "คัดกรองเฉพาะเอกสารที่ `score > 0.0` เสมอก่อนเรียงอันดับและตัด `top_k`",
    },
    {
      title: "ใช้ str.split() กับข้อความภาษาไทยแล้วคิดว่า BM25 ใช้ไม่ได้ผล",
      symptom: "คำถามภาษาไทยเกือบทั้งหมดได้คะแนน 0 เพราะข้อความไทยไม่มีช่องว่างคั่นระหว่างคำ",
      fix: "ภาษาไทยต้องผ่านการตัดคำด้วย {{pythainlp}} (`newmm`) ก่อนส่งเข้า BM25 เสมอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d099-q1",
        "เหตุใดจึงควรใช้ Regex สกัดรหัสเอกสารอย่าง `INV-2026-009` หรือ `SKU-8821` ออกมาก่อนส่งข้อความให้ `PyThaiNLP newmm` ตัดคำสำหรับ BM25?",
        [
          ["เพราะ `PyThaiNLP` ไม่สามารถรับตัวอักษรภาษาอังกฤษได้และจะ crash ทันที", "`PyThaiNLP` รับภาษาอังกฤษได้ แต่จะหั่นเครื่องหมาย `-` และตัวเลขแยกออกจากกัน"],
          [
            "เพื่อคงรหัสเฉพาะไว้เป็นโทเค็นเดี่ยว (`inv-2026-009`) ไม่ให้ถูกหั่นเป็นชิ้นย่อยจนไปชนกับรหัสอื่นที่คล้ายกันอย่าง `INV-2026-019`",
            "ถูก — เมื่อรหัสเป็นโทเค็นเดี่ยว ค่า IDF จะสูงมากและจับคู่เอกสารตรงรหัสได้แม่น 100%",
          ],
          ["เพื่อให้ BM25 แปลรหัสสินค้าเป็นเวกเตอร์ 384 มิติ", "BM25 เป็นตัวค้นหาเชิงคำ (lexical) ไม่ได้สร้าง dense vector 384 มิติ"],
          ["เพื่อลดขนาดเอกสารลงครึ่งหนึ่งก่อนทำ chunking", "จุดประสงค์คือความแม่นยำของโทเค็นรหัสเฉพาะ ไม่ใช่การย่อเอกสาร"],
        ],
        "B",
        "การปกป้องรหัสเฉพาะไม่ให้ถูกหั่นที่เครื่องหมายขีดทำให้ BM25 แยก `inv-2026-009` ออกจาก `inv-2026-019` ได้อย่างเด็ดขาด",
        "ทำไมควรปกป้องรหัสเอกสาร (`INV-2026-009`) ด้วย regex ก่อนส่งเข้า `PyThaiNLP newmm` สำหรับ BM25?",
        "เพื่อไม่ให้ `newmm` หั่นรหัสออกเป็น `['INV', '-', '2026', '-', '009']` ซึ่งจะไปซ้ำกับรหัสอื่นที่แชร์ปี/prefix เดียวกัน",
      ),
      mc(
        "d099-q2",
        "ในสูตร `BM25Okapi` พารามิเตอร์ `k1` และ `b` ทำหน้าที่ควบคุมอะไรตามลำดับ?",
        [
          ["`k1` คุมจำนวนผลลัพธ์ top-k, `b` คุมขนาด batch", "ไม่ใช่ — `k1` และ `b` เป็นพารามิเตอร์ในสูตรให้คะแนน BM25"],
          [
            "`k1` คุมความอิ่มตัวของความถี่คำ (TF saturation), `b` คุมระดับการปรับสมดุลความยาวเอกสาร (length normalization)",
            "ถูก — `k1` กันไม่ให้เอกสารที่ยัดคำซ้ำชนะเกินจริง ส่วน `b` กันไม่ให้เอกสารที่ยาวมากได้เปรียบเอกสารที่สั้นกระชับ",
          ],
          ["`k1` คุมจำนวนชั้นของกราฟ HNSW, `b` คุมจำนวนบิต quantization", "นั่นเป็นแนวคิดของ HNSW / Quantization ใน Vector Index ไม่ใช่ BM25"],
          ["`k1` คุมจำนวนคำไทยต่อประโยค, `b` คุมสัดส่วนภาษาอังกฤษ", "BM25 ไม่ได้ขึ้นกับภาษา แต่ทำงานบนโทเค็นที่ตัดคำมาแล้ว"],
        ],
        "B",
        "ค่ามาตรฐาน `k1 = 1.5` และ `b = 0.75` เป็นหัวใจที่ทำให้ BM25 ชนะการนับ TF-IDF แบบดั้งเดิมบนเอกสารที่มีความยาวต่างกันมาก",
        "อธิบายบทบาทของพารามิเตอร์ `k1` และ `b` ใน BM25",
        "`k1` (ค่าเริ่มต้น ~1.5) คุม TF saturation ไม่ให้คำซ้ำดันคะแนนไม่จำกัด ส่วน `b` (ค่าเริ่มต้น ~0.75) คุมการปรับคะแนนตามความยาวเอกสารเทียบกับความยาวเฉลี่ย",
      ),
      mc(
        "d099-q3",
        "ข้อใดคือปัญหาที่จะเกิดขึ้นหากตอน Index ใส่ `custom_dict={\"ใบกำกับภาษี\"}` แต่ตอน Query ลืมใส่ `custom_dict` ชุดนี้?",
        [
          ["BM25 จะค้นเจอแม่นกว่าเดิมเพราะได้คำย่อยเพิ่ม", "ตรงกันข้าม — คำในดัชนีคือ `\"ใบกำกับภาษี\"` แต่คำใน query กลายเป็น `['ใบ', 'กำกับ', 'ภาษี']` จึงไม่ตรงกันเลย"],
          [
            "เกิด Index–Query Mismatch ทำให้คำค้น `\"ใบกำกับภาษี\"` ไม่ตรงกับโทเค็นในดัชนีและได้คะแนน 0",
            "ถูก — กฎเหล็กของ Lexical Search คือฝั่ง Index และฝั่ง Query ต้องใช้ Tokenizer + Dictionary ชุดเดียวกัน 100%",
          ],
          ["`rank_bm25` จะโยน `TypeError` ทันทีตอนรัน `get_scores`", "`rank_bm25` ไม่รู้ว่า tokenizer สองฝั่งต่างกัน มันจะคืนคะแนน `0.0` แบบเงียบ ๆ ซึ่งอันตรายมาก"],
          ["ทำให้ดัชนีเปลี่ยนไปใช้ Cosine Similarity อัตโนมัติ", "BM25 ไม่มีโหมดสลับไปใช้ Cosine Similarity อัตโนมัติ"],
        ],
        "B",
        "Index–Query Mismatch เป็น silent bug ที่ไม่โยน exception แต่ทำให้ Recall ตกฮวบ — แก้ได้ด้วยการห่อ tokenizer ไว้ในเมธอดเดียวของคลาส Index",
        "Index–Query Parity ในระบบ Thai BM25 หมายถึงอะไร และทำไมจึงสำคัญ?",
        "หมายถึงการบังคับใช้ tokenizer, custom dictionary, lowercase และ stopwords ชุดเดียวกัน 100% ทั้งตอนสร้างดัชนีและตอนรับคำถาม เพื่อไม่ให้โทเค็นไม่ตรงกันจนได้คะแนน 0 แบบเงียบ ๆ",
      ),
      mc(
        "d099-q4",
        "เหตุใดหลังจากเรียก `bm25.get_scores(query_tokens)` ใน `rank_bm25` จึงต้องกรองเงื่อนไข `score > 0` ก่อนคืนผล `top_k`?",
        [
          ["เพราะ `rank_bm25` คืนคะแนนของทุกเอกสารในคลัง รวมถึงเอกสารที่ไม่ตรงคำใดเลยซึ่งได้ `0.0`", "ถูก — หากไม่กรอง `score > 0` เอกสารที่ไม่เกี่ยวข้องเลยจะหลุดติด top-k เข้าไปเป็นบริบทของ LLM"],
          ["เพราะคะแนนที่เท่ากับ 0 หมายถึงเอกสารนั้นตรงกับคำถามที่สุด", "ใน BM25 คะแนนยิ่งมากยิ่งเกี่ยวข้อง (`0.0` คือไม่มีคำตรงกันเลย)"],
          ["เพราะ Python ไม่สามารถเรียงตัวเลขที่มี `0.0` ได้", "Python เรียง `0.0` ได้ปกติ แต่เราไม่ต้องการส่งเอกสารที่ไม่เกี่ยวข้องเข้าไปใน prompt"],
          ["เพราะ `get_scores` คืนเฉพาะเอกสารที่คะแนนติดลบเท่านั้น", "เอกสารที่มีคำตรงกันปกติจะได้คะแนนบวก ยกเว้นคำที่โผล่บ่อยผิดปกติในคลังจิ๋ว"],
        ],
        "A",
        "การตัดผลที่ `score <= 0` ทิ้งเป็นด่านกันขยะ (noise) ขั้นแรกของ Lexical Retriever ก่อนส่งเข้าสู่ขั้นผสานผลหรือส่งให้ LLM",
        "ทำไมต้องกรอง `score > 0` หลังเรียก `BM25Okapi.get_scores(...)`?",
        "เพราะ `get_scores` คืนคะแนนทุกเอกสารในคลัง รวมถึงเอกสารที่ไม่ตรงคำค้นเลย (`0.0`) ซึ่งจะกลายเป็นบริบทขยะถ้าหลุดเข้า top-k",
      ),
    ],
  },

  takeaways: [
    "ภาษาไทยต้องผ่าน **{{pythainlp}} `newmm` + `dict_trie`** และ **Regex ปกป้องรหัสเฉพาะ (`INV-2026-009`, `SKU-8821`)** ก่อนเข้า {{bm25}} เสมอ",
    "บังคับใช้ **Tokenizer ชุดเดียวกัน 100%** ทั้งตอน Indexing และตอน Querying (Index–Query Parity) เพื่อกันบั๊กเงียบที่ทำให้คะแนนเป็น 0",
    "**`BM25Okapi`** เหนือกว่าการนับคำธรรมดาด้วย **TF Saturation (`k1 ≈ 1.5`)**, **Length Normalization (`b ≈ 0.75`)** และน้ำหนักความหายาก (IDF)",
    "กรอง **`score > 0`** เสมอก่อนคืนผล `top_k` — BM25 ชนะขาดในรหัสเฉพาะ แต่ต้องการ Dense Vector มาช่วยในคำพ้องความหมาย (เตรียมพบกันใน Day 100–101!)",
  ],

  reviewCards: [
    rc(
      "d099-rc-1",
      "4 ขั้นตอนสำคัญของ Thai BM25 Tokenizer ที่ดีสำหรับเอกสารองค์กรไทยคืออะไร?",
      "1) สกัดรหัสเฉพาะ (INV-2026-009, SKU-8821) ด้วย regex เป็นโทเค็นเดี่ยว, 2) ตัดคำไทยด้วย PyThaiNLP `newmm` + `dict_trie`, 3) lowercase และตัดวรรคตอน/stopwords, 4) ใช้ฟังก์ชันเดียวกัน 100% ทั้งตอน index และ query",
    ),
    rc(
      "d099-rc-2",
      "พารามิเตอร์ `k1` และ `b` ใน BM25 ควบคุมอะไร?",
      "`k1` (~1.5) คุม TF saturation (คำซ้ำหลายครั้งคะแนนจะค่อย ๆ อิ่มตัว) ส่วน `b` (~0.75) คุม length normalization (ลดความได้เปรียบของเอกสารที่ยาวเกินค่าเฉลี่ย)",
    ),
    rc(
      "d099-rc-3",
      "คำถามประเภทใดที่ Thai BM25 ชนะ Dense Vector ขาดลอย และประเภทใดที่ BM25 พลาด?",
      "BM25 ชนะขาดในรหัสเอกสาร/สินค้า/มาตรา/error code แบบตรงตัว แต่พลาด (คืนคะแนน 0) เมื่อผู้ใช้ถามด้วยคำพ้องความหมายหรือภาษาพูดที่ไม่มีคำตรงตัวกับเอกสาร",
    ),
  ],

  sources: [
    { label: "PyThaiNLP Documentation — Word Tokenization (newmm & custom_dict)", href: "https://pythainlp.github.io/docs/" },
    { label: "rank_bm25 Official Repository — BM25Okapi Implementation", href: "https://github.com/dorianbrown/rank_bm25" },
    { label: "Robertson & Zaragoza — The Probabilistic Relevance Framework: BM25 and Beyond", href: "https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf" },
  ],

  glossary: ["pythainlp", "bm25", "tfidf", "rag", "embedding", "rrf", "pytest"],
});
