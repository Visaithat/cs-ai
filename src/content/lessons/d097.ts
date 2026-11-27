import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D097 — Phase 4 / Block B25
 * Vector Indexing with pgvector (HNSW, Metadata Filtering)
 */
export const d097: Lesson = defineLesson({
  day: 97,
  titleTh: "สร้างดัชนีเวกเตอร์บน PostgreSQL ด้วย pgvector (HNSW และการกรอง Metadata)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · จัดเก็บ embeddings คู่กับข้อมูลธุรกิจใน Postgres เดียว พร้อมจูน HNSW และกันกับดัก Post-Filtering",
  icon: "database",
  visual: {
    id: "vector-index-hnsw",
    title: "Vector Indexing: pgvector HNSW + SQL Filter vs Qdrant Hybrid Collection",
    caption: "กดสลับดูโครงสร้างกราฟ HNSW หลายชั้นและการกรอง metadata (`tenant_id`, `category`) ให้เร็วและแม่น",
    alt: "แผนภาพ Vector Indexing ด้วย pgvector HNSW และ Qdrant",
  },
  requiresApiKey: false,
  tools: ["PostgreSQL", "pgvector", "psycopg", "NumPy", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "เก็บ Embeddings คู่กับ Metadata ธุรกิจในฐานข้อมูลเดียว",
      body: "เอกสารหลังทำ {{chunking}} ไม่ได้มีแค่ข้อความและ {{embedding}} เท่านั้น แต่มี `tenant_id`, `category`, `updated_at` และสิทธิ์เข้าถึงที่ต้องอัปเดตพร้อมข้อมูลหลักแบบ ACID transaction",
      lessonNote: "`pgvector` ให้คุณเก็บคอลัมน์ `vector(384)` หรือ `halfvec(384)` ไว้ในตาราง PostgreSQL เดียวกับข้อมูลแอป โดยไม่ต้องดูแลฐานข้อมูลเพิ่มอีกตัวตั้งแต่ day one",
    },
    {
      node: 2,
      heading: "ค้นหาความหมายด้วยดัชนี HNSW แทนการสแกนทั้งตาราง",
      body: "การคำนวณ {{cosine-similarity}} เทียบทุกแถว (Exact Scan) ทำงานเร็วแค่หลักหมื่นแถว แต่พอคลังเอกสารโตเป็นแสนหรือล้านชิ้น latency จะพุ่งสูงจนระบบ {{rag}} ตอบช้า",
      lessonNote: "วันนี้เราสร้างดัชนี {{hnsw}} ด้วย operator `<=>` (`vector_cosine_ops`) และเข้าใจวิธีจูน `m`, `ef_construction` และ `hnsw.ef_search`",
    },
    {
      node: 4,
      heading: "กรอง Metadata (`tenant_id`, `category`) อย่างถูกต้องและไม่คืนผลว่าง",
      body: "ในแอป Multi-Tenant จริง เราต้องกรองสิทธิ์ ({{acl}}) และหมวดเอกสารร่วมกับการค้นหาเวกเตอร์เสมอ แต่การกรองหลังดัชนี (post-filtering) อาจทำให้ได้ผลน้อยกว่า {{top-k}}",
      lessonNote: "คุณจะได้เห็นปัญหา post-filtering starvation และวิธีแก้ด้วย `hnsw.iterative_scan` ใน `pgvector` 0.8+ คู่กับ B-tree / Partial Index",
    },
    {
      node: 5,
      heading: "คุมต้นทุนหน่วยความจำและวัดแผนคิวรีด้วย EXPLAIN ANALYZE",
      body: "ขนาดดัชนี HNSW กิน RAM มาก หากไม่วางแผนชนิดข้อมูล (`halfvec`) หรือไม่ตรวจว่าคิวรีวิ่งผ่าน Index Scan จริง ฐานข้อมูลอาจแอบตกกลับไปทำ Sequential Scan จน CPU พุ่ง",
      lessonNote: "ใช้ `EXPLAIN (ANALYZE, BUFFERS)` ตรวจยืนยันการใช้งานดัชนีและคุม `hnsw.ef_search` ให้สมดุลระหว่าง Recall กับ P95 latency",
    },
  ],

  objectives: [
    "**ออกแบบสคีมา `pgvector`** (`vector(384)` vs `halfvec(384)`) และเขียน SQL ค้นหา {{cosine-similarity}} ด้วยตัวดำเนินการ `<=>` คู่กับ `vector_cosine_ops` อย่างถูกต้อง",
    "**อธิบายความต่างและจูนพารามิเตอร์** ของ {{hnsw}} (`m`, `ef_construction`, `hnsw.ef_search`) เทียบกับ IVFFlat และ Exact Sequential Scan",
    "**วินิจฉัยและแก้ปัญหา Post-Filtering Starvation** เมื่อค้นหาเวกเตอร์ร่วมกับ `WHERE tenant_id = ...` ด้วย `hnsw.iterative_scan` และดัชนีเสริมใน PostgreSQL",
  ],

  prerequisites: [
    "เข้าใจ Dense {{embedding}} และ {{cosine-similarity}} (แนะนำ Day 38, Day 69)",
    "เข้าใจการแบ่งเอกสารเป็นชิ้นด้วย {{chunking}} พร้อม metadata (แนะนำ Day 95)",
    "เขียนคำสั่ง SQL พื้นฐาน (`CREATE TABLE`, `WHERE`, `ORDER BY`, `LIMIT`) และ Parameterized Query ได้ (แนะนำ Day 26)",
    "ไม่ต้องใช้ API key หรือ Docker — แบบฝึกหัดรันทดสอบด้วย Python + `pytest` บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์ฝึกปฏิบัติ Day 97 ด้วย `uv` (แบบฝึกหัดและ `pytest` ใช้ `numpy` + `pytest` บนเครื่องได้ทันทีโดยไม่ต้องเปิด Docker และมีคำสั่ง Docker `pgvector/pgvector:pg17` แนบไว้เผื่ออยากลองรัน PostgreSQL จริง)",
    commands: `uv init ai-day97 && cd ai-day97
uv add numpy
uv add --dev pytest ruff
# ตัวเลือกเสริม: หากต้องการเปิด Postgres + pgvector 0.8 บนเครื่องด้วย Docker
# docker run --name pgvec -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d pgvector/pgvector:pg17`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day97` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `numpy`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รัน `uv run python -c \"import numpy; print(numpy.__version__)\"` ผ่านเรียบร้อย"],
    ],
    note: "ตัวอย่าง SQL ในบทนี้ใช้ได้จริงบน PostgreSQL 16/17 + `pgvector >= 0.8.0` ส่วนแบบฝึกหัดท้ายบทจำลองพฤติกรรมคิวรีและ post-filtering แบบ 100% ออฟไลน์ด้วย Python และ NumPy",
  },

  concepts: [
    {
      id: "pgvector-types-and-cosine",
      title: "1 · เก็บ Embeddings ใน PostgreSQL: `vector` vs `halfvec` และตัวดำเนินการ `<=>`",
      paragraphs: [
        "สำหรับทีมส่วนใหญ่ที่ข้อมูลยังต่ำกว่า 5–10 ล้านเวกเตอร์ การเปิดส่วนขยาย `CREATE EXTENSION vector;` บน PostgreSQL ที่มีอยู่แล้วคือจุดเริ่มต้นที่คุ้มค่าที่สุดสำหรับระบบ {{rag}} เพราะคุณได้ ACID transactions, การทำ `JOIN` กับตารางสิทธิ์ผู้ใช้, การ backup ชุดเดียว และไม่ต้องซิงก์ข้อมูลข้ามฐานข้อมูลสองตัวให้ปวดหัว",
        "ชนิดข้อมูลหลักคือ `vector(d)` ซึ่งเก็บค่าทศนิยม 32-bit (`float32`, 4 bytes/มิติ) เช่น `vector(384)` ใช้ 1,536 bytes ต่อแถว และใน `pgvector >= 0.7` มี **`halfvec(d)`** ที่เก็บแบบ 16-bit (`float16`, 2 bytes/มิติ) ซึ่งเป็นรูปแบบ {{quantization}} ที่ลดขนาดดัชนีใน RAM ลงเกือบครึ่งและรองรับได้ถึง 4,000 มิติ โดยความแม่นยำในการค้นหาแทบไม่ตก",
        "จุดที่มือใหม่สับสนบ่อยคือตัวดำเนินการระยะห่างของ `pgvector`: **`<=>`** คือ **Cosine Distance** (`1 - cosine_similarity`) ที่มีค่าอยู่ในช่วง `[0, 2]` — ค่ายิ่งน้อยยิ่งเหมือน! ดังนั้นใน SQL เราจึงเรียงจากน้อยไปมาก (`ORDER BY embedding <=> $1 LIMIT 5`) และถ้าอยากโชว์คะแนนความเหมือนให้ใช้ `1 - (embedding <=> $1) AS similarity`",
      ],
      analogy:
        "เหมือนการติดแท็กพิกัด GPS (`vector`) ไว้ในคอลัมน์หนึ่งของแฟ้มทะเบียนลูกค้าที่มีอยู่แล้ว แทนที่จะต้องเช่าโกดังใหม่แยกต่างหาก แล้ววัดระยะใกล้-ไกล (`<=>`) ตรงนั้นเลย",
      code: {
        language: "sql",
        filename: "schema_pgvector.sql",
        code: `CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
    chunk_id    TEXT PRIMARY KEY,
    tenant_id   TEXT NOT NULL,
    category    TEXT NOT NULL,
    content     TEXT NOT NULL,
    -- ใช้ halfvec(384) เพื่อลดพื้นที่ RAM ของดัชนีลง ~50% (หรือ vector(384) สำหรับ float32)
    embedding   halfvec(384) NOT NULL
);

-- สร้างดัชนี HNSW สำหรับ Cosine Distance (<=>)
CREATE INDEX idx_chunks_emb_hnsw
ON document_chunks
USING hnsw (embedding halfvec_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ดัชนีเสริมสำหรับ metadata filtering
CREATE INDEX idx_chunks_tenant_cat ON document_chunks (tenant_id, category);`,
        caption: "ต้องจับคู่ operator class ให้ตรงกับ operator ที่ใช้ค้นหา: `halfvec_cosine_ops` / `vector_cosine_ops` ใช้คู่กับ `<=>` เสมอ",
      },
      whyTitle: "Why this matters — operator class ไม่ตรง ดัชนีก็ไม่ถูกเรียกใช้",
      whyParagraphs: [
        "ใน PostgreSQL หากคุณสร้างดัชนีด้วย `vector_l2_ops` (สำหรับระยะ Euclidean `<->`) แต่ตอนคิวรีกลับเขียน `ORDER BY embedding <=> $1` ตัว query planner จะ **เมินดัชนี HNSW** แล้วกลับไปสแกนทั้งตาราง (Sequential Scan) แบบเงียบ ๆ",
        "นอกจากนี้ การลดขนาดจาก `vector` เป็น `halfvec` ช่วยให้ดัชนี HNSW ทั้งก้อนยังคงอยู่ใน RAM ของฐานข้อมูลได้นานขึ้น ซึ่งเป็นหัวใจสำคัญของความเร็วใน `pgvector`",
      ],
    },
    {
      id: "hnsw-vs-ivfflat-vs-exact",
      title: "2 · HNSW ทำงานอย่างไร: `m`, `ef_construction`, `hnsw.ef_search` เทียบกับ IVFFlat และ Exact Scan",
      paragraphs: [
        "ถ้าไม่มีดัชนี (Exact Sequential Scan) PostgreSQL ต้องคำนวณ `<=>` กับทุกแถวในตาราง ทำให้ได้ Recall 100% แต่อัตราความเร็วตกเป็นเส้นตรง $O(N)$ — สำหรับคลังเล็กกว่า ~10,000 chunks มักเร็วพออยู่แล้ว แต่เมื่อคลังโตขึ้นเราจำเป็นต้องใช้ **Approximate Nearest Neighbor (ANN)** Index อย่าง **{{hnsw}}** (Hierarchical Navigable Small World)",
        "HNSW สร้างกราฟเชื่อมเพื่อนบ้านแบบ **หลายชั้น (Multi-layer graph)**: ชั้นบนสุดมีจุดน้อยและเชื่อมระยะไกลเพื่อกระโดดเข้าใกล้ย่านคำตอบอย่างรวดเร็ว แล้วค่อย ๆ ไต่ลงชั้นล่างที่จุดหนาแน่นขึ้นเพื่อเก็บเพื่อนบ้านที่ใกล้ที่สุด มีพารามิเตอร์หลัก 3 ตัว: **`m`** (จำนวนเส้นเชื่อมต่อโหนดตอนสร้าง, ค่าเริ่มต้น `16`), **`ef_construction`** (ความกว้างของการค้นหาตอนสร้างกราฟ, ค่าเริ่มต้น `64`, ยิ่งสูงกราฟยิ่งแม่นแต่สร้างช้าลง) และ **`hnsw.ef_search`** (ความกว้างของการเดินกราฟตอนคิวรี, ค่าเริ่มต้น `40`, ปรับได้ทันทีต่อคำสั่งด้วย `SET LOCAL`)",
        "เทียบกับ **IVFFlat** ที่แบ่งพื้นที่เป็นกลุ่ม (clusters) และต้องมีข้อมูลอยู่ก่อนถึงจะเทรน centroids ได้ (`lists`), HNSW สร้างบนตารางว่างได้ทันที ไม่ต้อง rebuild บ่อยเมื่อมีการ insert ข้อมูลเรื่อย ๆ และให้สัดส่วน Speed-Recall ที่ดีกว่า แต่แลกด้วยการใช้ RAM มากกว่าและเวลา build นานกว่า",
      ],
      analogy:
        "HNSW เหมือนระบบขนส่งหลายระดับ: ชั้นบนสุดคือเครื่องบินข้ามจังหวัด ชั้นกลางคือรถไฟฟ้าข้ามเขต และชั้นล่างสุดคือมอเตอร์ไซค์เข้าซอย — คุณไม่ต้องเดินเช็กทุกบ้านในประเทศ (Exact Scan) ก็ถึงหน้าบ้านเป้าหมายได้ภายในไม่กี่ก้าว",
      bullets: [
        "**Exact Scan (ไม่มี index)**: Recall 100%, ใช้ได้สบายเมื่อข้อมูล `< 10k` แถว หรือหลังกรอง `WHERE` แล้วเหลือแค่ไม่กี่พันแถว",
        "**HNSW (`m=16, ef_construction=64`)**: ค่าเริ่มต้นแนะนำสำหรับ Production ใน `pgvector` รองรับ streaming insert และปรับ `SET LOCAL hnsw.ef_search = 100;` เพิ่มความแม่นตอนคิวรีได้ทันที",
        "**IVFFlat**: ใช้ RAM น้อยกว่าและ build เร็วกว่า แต่ต้องมีข้อมูลก่อนสร้างและ Recall ตกง่ายเมื่อข้อมูลใหม่มี distribution เปลี่ยน",
      ],
      whyTitle: "Why this matters — ปรับสมดุล Recall vs Latency ได้โดยไม่ต้องสร้างดัชนีใหม่",
      whyParagraphs: [
        "เพราะ `hnsw.ef_search` ปรับได้ระดับ transaction (`BEGIN; SET LOCAL hnsw.ef_search = 100; SELECT ...; COMMIT;`) คุณจึงเลือกเร่งความแม่นสำหรับคิวรีสำคัญหรือคิวรีที่มีเงื่อนไขกรองหนัก ๆ ได้ทันทีโดยไม่ต้อง `REINDEX` ทั้งตาราง",
        "จำกฎง่าย ๆ ว่าค่า `hnsw.ef_search` ต้องมีค่ามากกว่าหรือเท่ากับ `LIMIT` (`top_k`) เสมอ มิฉะนั้นดัชนีจะคืนผลไม่ครบตามจำนวนที่ขอ",
      ],
    },
    {
      id: "metadata-filtering-and-iterative-scan",
      title: "3 · กับดัก Post-Filtering และทางแก้ด้วย `hnsw.iterative_scan` ใน pgvector 0.8+",
      paragraphs: [
        "ในระบบ {{rag}} จริง เราแทบไม่เคยค้นหาทั้งตารางโดยไม่มีเงื่อนไข แต่จะพ่วง `WHERE tenant_id = 'acme' AND category = 'policy'` เพื่อกันข้อมูลข้ามลูกค้า ({{acl}}) เสมอ — ปัญหาคลาสสิกของ HNSW แบบดั้งเดิมคือ **Post-Filtering**: ดัชนี HNSW เดินกราฟหยิบเพื่อนบ้านที่ใกล้ที่สุดมาแค่ `ef_search` ชิ้น (เช่น 40 ชิ้น) จาก **ทุก tenant รวมกัน** แล้วค่อยมาตัดแถวที่ไม่ใช่ `tenant_id = 'acme'` ทิ้งทีหลัง!",
        "ลองนึกภาพว่า `tenant_id = 'acme'` มีสัดส่วนเพียง 2% ของตารางทั้งหมด จาก 40 ชิ้นที่ HNSW หยิบมาอาจเหลือของ `acme` แค่ 0 หรือ 1 ชิ้น ทั้งที่คุณขอ `LIMIT 5` และในฐานข้อมูลมีเอกสารของ `acme` อยู่ตั้งหลายพันชิ้น — อาการนี้เรียกว่า **Post-Filtering Starvation** (คืนผลไม่ครบ {{top-k}} ทั้งที่มีข้อมูลอยู่จริง)",
        "ตั้งแต่ **`pgvector 0.8.0`** เป็นต้นมา มีฟีเจอร์ **`hnsw.iterative_scan`** (`strict_order` หรือ `relaxed_order`) ที่สั่งให้ HNSW เดินสแกนกราฟต่อไปเรื่อย ๆ เป็นรอบจนกว่าจะเก็บแถวที่ผ่าน `WHERE` ครบตาม `LIMIT` (หรือถึงเพดาน `hnsw.max_scan_tuples`) และถ้า tenant ใดมีเอกสารน้อยมากจริง ๆ การมี B-tree index บน `tenant_id` (หรือ Partial HNSW Index / Partitioning ตาม `tenant_id`) จะช่วยให้ PostgreSQL เลือกแผนที่เร็วและแม่นที่สุด",
      ],
      analogy:
        "Post-filtering เหมือนหลับตาหยิบหนังสือที่ใกล้ตัวที่สุด 40 เล่มจากห้องสมุดรวมทุกคณะ แล้วค่อยมาคัดเอาเฉพาะหนังสือคณะบัญชี — ถ้าคณะบัญชีมีแค่ 2% ของห้องสมุด คุณอาจได้กลับมามือเปล่า ส่วน Iterative Scan คือหยิบเพิ่มไปเรื่อย ๆ จนกว่าจะได้หนังสือคณะบัญชีครบ 5 เล่ม",
      code: {
        language: "sql",
        filename: "query_iterative_scan.sql",
        code: `BEGIN;
-- เปิด iterative scan เพื่อแก้ปัญหาคืนผลไม่ครบเมื่อ WHERE กรองแคบ (pgvector >= 0.8)
SET LOCAL hnsw.ef_search = 80;
SET LOCAL hnsw.iterative_scan = strict_order;
SET LOCAL hnsw.max_scan_tuples = 20000;

SELECT
    chunk_id,
    content,
    1 - (embedding <=> $1::halfvec) AS similarity
FROM document_chunks
WHERE tenant_id = $2
  AND category = $3
ORDER BY embedding <=> $1::halfvec
LIMIT 5;
COMMIT;`,
        caption: "ใช้ `SET LOCAL` ภายใน transaction เพื่อไม่ให้การตั้งค่าไปกระทบ session อื่นใน connection pool",
      },
      whyTitle: "Why this matters — บั๊กคืนผลว่างในระบบ Multi-Tenant ที่ตรวจไม่เจอตอนข้อมูลน้อย",
      whyParagraphs: [
        "ตอนทดสอบบนเครื่องคุณอาจมีแค่ 1 tenant กับเอกสาร 50 ชิ้น จึงไม่เคยเห็นอาการ Post-Filtering Starvation เลย แต่พอขึ้น Production ที่มี 50 ลูกค้าในตารางเดียวกัน ลูกค้ารายเล็กจะเริ่มเจอคำตอบว่า \"ไม่พบเอกสาร\" ทั้งที่เอกสารวางอยู่ในฐานข้อมูลชัด ๆ",
        "การเข้าใจ `hnsw.iterative_scan` และวิธีวางโครงสร้าง index ตั้งแต่ต้นช่วยให้ระบบ `pgvector` ของคุณรองรับลูกค้าหลายรายได้อย่างเสถียรและปลอดภัย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — pgvector ในสายตาคนเขียน PostgreSQL / Prisma / Drizzle",
      body: [
        "ถ้าคุณคุ้นเคยกับการทำ Index และ Query Tuning บน PostgreSQL ในเว็บแอปอยู่แล้ว `pgvector` แค่เพิ่มชนิดคอลัมน์และชนิดดัชนีใหม่เข้าไปในฐานข้อมูลเดิมของคุณ:",
      ],
      table: [
        ["`vector(384)` / `halfvec(384)`", "คอลัมน์เก็บ array ตัวเลขเหมือน `JSONB` แต่เก็บแบบ binary แน่นและคำนวณใน C"],
        ["`ORDER BY emb <=> $1 LIMIT 5`", "เหมือน `ORDER BY created_at DESC LIMIT 5` แต่เรียงตามระยะห่างความหมาย"],
        ["`USING hnsw (emb vector_cosine_ops)`", "เหมือน `USING btree` หรือ `USING gin` สำหรับ JSONB/Full-Text"],
        ["`SET LOCAL hnsw.iterative_scan`", "Query hint ระดับ transaction สำหรับงานที่มี `WHERE tenant_id = ?` แคบ ๆ"],
      ],
    },
    student: {
      title: "First-Year Note — ระยะทาง (Distance) กับความเหมือน (Similarity) ต่างกันอย่างไร",
      body: [
        "ในบท Day 38 เราเรียนว่า **Cosine Similarity** มีค่าใกล้ `1.0` เมื่อเวกเตอร์สองอันชี้ไปทางเดียวกัน (ความหมายเหมือนกัน) และ `0.0` เมื่อตั้งฉากกัน",
        "แต่ใน `pgvector` ตัวดำเนินการ `<=>` คำนวณ **Cosine Distance = `1 - Cosine Similarity`** เพื่อให้นิยามเหมือน \"ระยะทาง\" (ยิ่งใกล้ยิ่งน้อย, เหมือนกันเป๊ะคือ `0.0`) ดังนั้นตอน `ORDER BY` จึงต้องเรียงจาก **น้อยไปมาก (`ASC`)** ซึ่งเป็นค่าเริ่มต้นของ SQL เสมอ ห้ามใส่ `DESC` เด็ดขาดไม่อย่างนั้นจะได้เอกสารที่ความหมายตรงข้ามที่สุดมาแทน!",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีตารางจำลอง `document_chunks` 200 แถวที่มีหลาย `tenant_id` โดย `tenant_id = 'acme'` มีเพียง 5% ของข้อมูลทั้งหมด (10 แถว) ลองจำลองด้วย Python + NumPy เพื่อเปรียบเทียบผลระหว่าง **Naive Post-Filtering** กับ **Iterative Scan** และสร้าง SQL ที่ปลอดภัยสำหรับ `pgvector`",
    steps: [
      {
        title: "1 · คำนวณ Cosine Distance (`<=>`) ใน NumPy ให้ตรงนิยาม pgvector",
        explain:
          "เมื่อเวกเตอร์ถูกทำ L2-normalize แล้ว Cosine Similarity คือผลคูณจุด (`dot`) และ Cosine Distance (`<=>`) คือ `1.0 - similarity` ซึ่งเรียงจากน้อยไปมาก",
        code: {
          language: "python",
          filename: "worked_pgvector.py",
          code: `import numpy as np

def normalize(v: np.ndarray) -> np.ndarray:
    norm = float(np.linalg.norm(v))
    return v / norm if norm > 0 else v

def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    """นิยามเดียวกับตัวดำเนินการ <=> ใน pgvector"""
    return float(1.0 - np.dot(normalize(a), normalize(b)))

q = np.array([1.0, 0.2, 0.0], dtype=np.float32)
near_doc = np.array([0.98, 0.25, 0.0], dtype=np.float32)
far_doc = np.array([-0.5, 0.8, 0.3], dtype=np.float32)

print(f"near <=> dist={cosine_distance(q, near_doc):.4f} (sim={1 - cosine_distance(q, near_doc):.4f})")
print(f"far  <=> dist={cosine_distance(q, far_doc):.4f} (sim={1 - cosine_distance(q, far_doc):.4f})")`,
        },
        output: `near <=> dist=0.0014 (sim=0.9986)
far  <=> dist=1.3368 (sim=-0.3368)`,
      },
      {
        title: "2 · จำลองอาการ Post-Filtering Starvation vs Iterative Scan",
        explain:
          "สมมติ HNSW รอบแรกหยิบ candidate ที่ใกล้ที่สุดมาแค่ `ef_search = 10` แถวจากทุก tenant แล้วค่อยกรอง `tenant_id == 'acme'` เทียบกับ Iterative Scan ที่ขยายหน้าต่างการสแกนต่อไปจนได้ครบ `top_k = 3` แถว",
        code: {
          language: "python",
          filename: "worked_pgvector.py",
          code: `rows = [
    # 10 แถวใกล้สุดเป็นของ tenant อื่นหมด ยกเว้นแถวที่ 9
    {"id": f"other-{i}", "tenant": "beta", "dist": 0.05 + i * 0.01} for i in range(9)
] + [
    {"id": "acme-1", "tenant": "acme", "dist": 0.14},
    {"id": "acme-2", "tenant": "acme", "dist": 0.22},
    {"id": "acme-3", "tenant": "acme", "dist": 0.29},
]
rows.sort(key=lambda r: r["dist"])

ef_search, top_k = 10, 3

# 1) Naive Post-Filtering: ตัดแค่ ef_search แรกแล้วค่อยกรอง tenant
naive_hits = [r["id"] for r in rows[:ef_search] if r["tenant"] == "acme"][:top_k]

# 2) Iterative Scan: สแกนต่อเนื่องจนกว่าจะได้ครบ top_k
iter_hits = []
for r in rows:
    if r["tenant"] == "acme":
        iter_hits.append(r["id"])
        if len(iter_hits) == top_k:
            break

print("Naive post-filter (ef=10):", naive_hits, f"-> ได้แค่ {len(naive_hits)}/{top_k}")
print("Iterative scan           :", iter_hits, f"-> ครบ {len(iter_hits)}/{top_k}")`,
        },
        output: `Naive post-filter (ef=10): ['acme-1'] -> ได้แค่ 1/3
Iterative scan           : ['acme-1', 'acme-2', 'acme-3'] -> ครบ 3/3`,
      },
      {
        title: "3 · สร้าง Parameterized SQL ที่ปลอดภัยสำหรับ pgvector 0.8+",
        explain:
          "ใช้ placeholder (`%s`) สำหรับเวกเตอร์และเงื่อนไข metadata เพื่อกัน SQL Injection พร้อมตั้งค่า `SET LOCAL hnsw.ef_search` และ `SET LOCAL hnsw.iterative_scan`",
        code: {
          language: "python",
          filename: "worked_pgvector.py",
          code: `def build_pgvector_sql(
    *,
    ef_search: int = 80,
    iterative_scan: str = "strict_order",
    include_category: bool = False,
) -> str:
    where_clauses = ["tenant_id = %s"]
    if include_category:
        where_clauses.append("category = %s")
    where_sql = " AND ".join(where_clauses)
    return (
        f"SET LOCAL hnsw.ef_search = {ef_search};\\n"
        f"SET LOCAL hnsw.iterative_scan = {iterative_scan};\\n"
        "SELECT chunk_id, content, 1 - (embedding <=> %s::halfvec) AS similarity\\n"
        "FROM document_chunks\\n"
        f"WHERE {where_sql}\\n"
        "ORDER BY embedding <=> %s::halfvec\\n"
        "LIMIT %s;"
    )

print(build_pgvector_sql(ef_search=100, include_category=True))`,
        },
        output: `SET LOCAL hnsw.ef_search = 100;
SET LOCAL hnsw.iterative_scan = strict_order;
SELECT chunk_id, content, 1 - (embedding <=> %s::halfvec) AS similarity
FROM document_chunks
WHERE tenant_id = %s AND category = %s
ORDER BY embedding <=> %s::halfvec
LIMIT %s;`,
      },
    ],
    gotcha:
      "จุดสังเกต: ใน `pgvector` ห้ามเขียน `ORDER BY 1 - (embedding <=> $1) DESC` ถ้าอยากให้ใช้ดัชนี HNSW! ตัว planner ของ PostgreSQL จับคู่ดัชนีได้เฉพาะนิพจน์ `ORDER BY embedding <=> $1` (เรียงจากน้อยไปมาก) โดยตรงเท่านั้น ส่วน `1 - (embedding <=> $1)` ให้ใส่ไว้เฉพาะในรายการ `SELECT` เพื่อแสดงคะแนนความเหมือน",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างโมดูลจำลอง `PgVectorStore` และตัวสร้างคิวรี `build_search_sql` เพื่อเข้าใจทั้งไวยากรณ์ SQL ที่ถูกต้องของ `pgvector` (HNSW + `iterative_scan`) และพิสูจน์ความต่างระหว่าง Naive Post-Filtering กับ Iterative Scan บนข้อมูล Multi-Tenant",
    requirements: [
      "ฟังก์ชัน `build_search_sql(table: str, *, vector_type: str = \"halfvec\", ef_search: int = 64, iterative_scan: str = \"strict_order\", filter_columns: list[str] | None = None) -> str` ต้อง validate ว่า `table` และชื่อคอลัมน์ใน `filter_columns` เป็น identifier ที่ปลอดภัย (`isidentifier()`), `vector_type` ต้องเป็น `\"vector\"` หรือ `\"halfvec\"`, `ef_search > 0`, และ `iterative_scan` ต้องเป็น `\"off\"`, `\"strict_order\"` หรือ `\"relaxed_order\"` (ถ้าผิดโยน `ValueError`)",
      "SQL ที่คืนจาก `build_search_sql` ต้องมี `SET LOCAL hnsw.ef_search = ...`, `SET LOCAL hnsw.iterative_scan = ...`, ใช้ `1 - (embedding <=> %s::{vector_type}) AS similarity`, มี `WHERE` เมื่อมี `filter_columns` (ใช้ `%s` placeholder เท่านั้น), และเรียงด้วย `ORDER BY embedding <=> %s::{vector_type}` ตามด้วย `LIMIT %s`",
      "คลาส `InMemoryPgVectorTable` เก็บแถว `(chunk_id, tenant_id, category, embedding: np.ndarray)` โดยมีเมธอด `insert(...)` และ `search(query_vec, *, top_k, tenant_id=None, category=None, ef_search=10, iterative_scan=True) -> list[tuple[str, float]]` คืนลิสต์ `(chunk_id, similarity)` เรียงจาก similarity มาก→น้อย (tie-break ด้วย `chunk_id` น้อย→มาก)",
      "ใน `search(...)`: เมื่อ `iterative_scan=False` ให้จำลอง Naive Post-Filtering (จัดอันดับ cosine distance ทั้งตาราง ตัดมาแค่ `ef_search` แถวแรก แล้วค่อยกรอง `tenant_id`/`category` และตัด `top_k`) ส่วนเมื่อ `iterative_scan=True` ให้สแกนเรียงตาม distance ต่อไปเรื่อย ๆ จนได้แถวที่ผ่าน filter ครบ `top_k`",
      "หาก `top_k <= 0` หรือ `ef_search <= 0` ให้โยน `ValueError` ทันที (fail-fast)",
    ],
    starter: {
      language: "python",
      filename: "exercise_day097.py",
      code: `from __future__ import annotations
from dataclasses import dataclass
import numpy as np


def build_search_sql(
    table: str,
    *,
    vector_type: str = "halfvec",
    ef_search: int = 64,
    iterative_scan: str = "strict_order",
    filter_columns: list[str] | None = None,
) -> str:
    """สร้าง parameterized SQL สำหรับ pgvector HNSW search พร้อม iterative_scan."""
    # TODO: 1) validate table, vector_type, ef_search, iterative_scan, filter_columns
    # TODO: 2) ประกอบคำสั่ง SET LOCAL + SELECT ... ORDER BY embedding <=> %s::<type> LIMIT %s
    raise NotImplementedError


@dataclass(frozen=True)
class ChunkRow:
    chunk_id: str
    tenant_id: str
    category: str
    embedding: np.ndarray


class InMemoryPgVectorTable:
    def __init__(self) -> None:
        self._rows: list[ChunkRow] = []

    def insert(
        self,
        chunk_id: str,
        tenant_id: str,
        category: str,
        embedding: list[float] | np.ndarray,
    ) -> None:
        vec = np.asarray(embedding, dtype=np.float32)
        self._rows.append(ChunkRow(chunk_id, tenant_id, category, vec))

    def search(
        self,
        query_vec: list[float] | np.ndarray,
        *,
        top_k: int = 3,
        tenant_id: str | None = None,
        category: str | None = None,
        ef_search: int = 10,
        iterative_scan: bool = True,
    ) -> list[tuple[str, float]]:
        """จำลองการค้นหา pgvector <=> แบบ Naive Post-Filtering vs Iterative Scan."""
        # TODO: 1) validate top_k > 0 และ ef_search > 0
        # TODO: 2) คำนวณ cosine distance = 1 - cosine_similarity สำหรับทุกแถว แล้วเรียง (distance, chunk_id)
        # TODO: 3) ถ้า iterative_scan=False ตัด candidates[:ef_search] ก่อนแล้วค่อยกรอง
        #          ถ้า iterative_scan=True กรองไปเรื่อย ๆ จนครบ top_k
        # TODO: 4) คืน [(chunk_id, similarity), ...]
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day097.py",
      code: `import pytest
from exercise_day097 import InMemoryPgVectorTable, build_search_sql


def test_build_search_sql_valid_with_filters():
    sql = build_search_sql(
        "document_chunks",
        vector_type="halfvec",
        ef_search=100,
        iterative_scan="strict_order",
        filter_columns=["tenant_id", "category"],
    )
    assert "SET LOCAL hnsw.ef_search = 100;" in sql
    assert "SET LOCAL hnsw.iterative_scan = strict_order;" in sql
    assert "1 - (embedding <=> %s::halfvec) AS similarity" in sql
    assert "WHERE tenant_id = %s AND category = %s" in sql
    assert "ORDER BY embedding <=> %s::halfvec" in sql
    assert "LIMIT %s" in sql


def test_build_search_sql_rejects_unsafe_inputs():
    with pytest.raises(ValueError):
        build_search_sql("chunks; DROP TABLE users")
    with pytest.raises(ValueError):
        build_search_sql("document_chunks", vector_type="float8")
    with pytest.raises(ValueError):
        build_search_sql("document_chunks", iterative_scan="always")
    with pytest.raises(ValueError):
        build_search_sql("document_chunks", ef_search=0)


def test_post_filtering_starvation_vs_iterative_scan():
    table = InMemoryPgVectorTable()
    # ใส่ 6 แถวของ tenant 'beta' ที่ใกล้ query [1.0, 0.0] มากที่สุด
    for i in range(6):
        table.insert(f"beta-{i}", "beta", "faq", [1.0, 0.01 * i])
    # ใส่ 3 แถวของ tenant 'acme' ที่ไกลกว่าเล็กน้อย (อยู่อันดับ 7, 8, 9 รวมทั้งตาราง)
    table.insert("acme-1", "acme", "policy", [0.95, 0.30])
    table.insert("acme-2", "acme", "policy", [0.90, 0.43])
    table.insert("acme-3", "acme", "policy", [0.85, 0.52])

    # Naive post-filtering ด้วย ef_search=5 หยิบแต่ beta-0..beta-4 จึงได้ 0 แถวของ acme!
    naive = table.search([1.0, 0.0], top_k=3, tenant_id="acme", ef_search=5, iterative_scan=False)
    assert naive == []

    # Iterative scan เดินต่อจนเก็บ acme ได้ครบทั้ง 3 แถว เรียงความเหมือนมาก->น้อย
    iterative = table.search([1.0, 0.0], top_k=3, tenant_id="acme", ef_search=5, iterative_scan=True)
    assert [cid for cid, _ in iterative] == ["acme-1", "acme-2", "acme-3"]
    assert iterative[0][1] > iterative[1][1] > iterative[2][1]


def test_category_filter_and_validation():
    table = InMemoryPgVectorTable()
    table.insert("c1", "acme", "faq", [1.0, 0.0])
    table.insert("c2", "acme", "policy", [0.9, 0.1])

    hits = table.search([1.0, 0.0], top_k=2, tenant_id="acme", category="policy")
    assert [cid for cid, _ in hits] == ["c2"]

    with pytest.raises(ValueError):
        table.search([1.0, 0.0], top_k=0)
`,
    },
    selfCheck: [
      "`build_search_sql` ปฏิเสธชื่อตารางหรือคอลัมน์ที่ไม่ผ่าน `isidentifier()` เพื่อป้องกัน SQL Injection",
      "SQL ใช้ `ORDER BY embedding <=> %s::<type>` (ไม่เอา `1 - (...) DESC` ไปใส่ใน `ORDER BY`)",
      "กรณี `iterative_scan=False` และ `ef_search=5` คืนลิสต์ว่างเมื่อ 5 แถวแรกเป็นของ tenant อื่นทั้งหมด",
      "กรณี `iterative_scan=True` คืน `['acme-1', 'acme-2', 'acme-3']` ครบทั้ง 3 แถวพร้อมคะแนน similarity เรียงจากมากไปน้อย",
      "รัน `uv run pytest -q` ผ่านครบทั้ง 4 เทสต์ และ `uv run ruff check .` ไม่มีคำเตือน",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `build_search_sql` ให้ตรวจ `table.isidentifier()`, ตรวจ `vector_type in {\"vector\", \"halfvec\"}`, ตรวจ `iterative_scan in {\"off\", \"strict_order\", \"relaxed_order\"}` และตรวจทุกชื่อใน `filter_columns` ด้วย `col.isidentifier()` ก่อนประกอบสตริง",
      },
      {
        body: "ใน `InMemoryPgVectorTable.search` ให้สร้าง helper `_cosine_sim(a, b)` โดยหารด้วย `np.linalg.norm(a) * np.linalg.norm(b)` (กันหารศูนย์), คำนวณ `dist = 1.0 - sim`, เรียง `(dist, row.chunk_id)` แล้วค่อยแยกว่าจะ slice `[:ef_search]` ก่อนกรอง (`iterative_scan=False`) หรือกรองไปเรื่อย ๆ จนครบ `top_k` (`iterative_scan=True`)",
      },
      {
        body: "โครงหลักของ `InMemoryPgVectorTable.search` — เหลือเติมส่วนตรวจสอบพารามิเตอร์และ `build_search_sql` ให้สมบูรณ์",
        code: {
          language: "python",
          filename: "hint_day097.py",
          code: `def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


# ภายใน InMemoryPgVectorTable.search:
q = np.asarray(query_vec, dtype=np.float32)
scored = []
for row in self._rows:
    sim = _cosine_sim(q, row.embedding)
    scored.append((1.0 - sim, row.chunk_id, sim, row))
scored.sort(key=lambda item: (item[0], item[1]))

pool = scored if iterative_scan else scored[:ef_search]
results: list[tuple[str, float]] = []
for _dist, chunk_id, sim, row in pool:
    if tenant_id is not None and row.tenant_id != tenant_id:
        continue
    if category is not None and row.category != category:
        continue
    results.append((chunk_id, sim))
    if len(results) == top_k:
        break
return results`,
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
      title: "สร้างดัชนีด้วย vector_l2_ops แต่คิวรีด้วย <=> (Cosine Distance)",
      symptom: "คิวรีทำงานถูกต้องแต่ช้าผิดปกติ และ `EXPLAIN ANALYZE` แสดง `Seq Scan` แทนที่จะเป็น `Index Scan using idx_...`",
      fix: "จับคู่ operator class ให้ตรงกันเสมอ: `<=>` ใช้ `vector_cosine_ops` / `halfvec_cosine_ops`, `<->` ใช้ `vector_l2_ops`, `<#>` ใช้ `vector_ip_ops`",
    },
    {
      title: "เขียน ORDER BY 1 - (embedding <=> $1) DESC แทน ORDER BY embedding <=> $1",
      symptom: "PostgreSQL ใช้ดัชนี HNSW ไม่ได้เพราะเห็นนิพจน์ `1 - (...)` ไม่ตรงกับคีย์ดัชนี จึงตกกลับไปสแกนทั้งตาราง",
      fix: "ใส่ `ORDER BY embedding <=> $1` (เรียงจากน้อยไปมาก) เสมอ แล้วค่อยคำนวณ `1 - (embedding <=> $1) AS similarity` ในส่วน `SELECT`",
    },
    {
      title: "ละเลย Post-Filtering Starvation ในระบบ Multi-Tenant",
      symptom: "ลูกค้ารายเล็กที่มีเอกสารน้อยในตารางรวมได้รับผลค้นหาแค่ 0–1 ชิ้นทั้งที่ขอ `LIMIT 5` และมีเอกสารตรงประเด็นอยู่ในฐานข้อมูล",
      fix: "เปิด `SET LOCAL hnsw.iterative_scan = strict_order;` ใน `pgvector >= 0.8` ร่วมกับการสร้าง B-tree index บน `tenant_id` หรือพิจารณา Partitioning",
    },
    {
      title: "ใช้ SET hnsw.ef_search โดยไม่ใส่ LOCAL บน Connection Pool",
      symptom: "ค่า `ef_search` ที่ตั้งไว้สูงมากเพื่อคิวรีเดียวไปค้างอยู่บน connection นั้นและทำให้คิวรีอื่น ๆ ของทั้งระบบช้าลงตามไปด้วย",
      fix: "ใช้ `SET LOCAL hnsw.ef_search = ...` ภายใน transaction (`BEGIN ... COMMIT`) เสมอเพื่อให้ค่าคืนกลับอัตโนมัติเมื่อจบงาน",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d097-q1",
        "ใน `pgvector` หากต้องการค้นหาเอกสารที่มี **Cosine Similarity สูงที่สุด** 5 ชิ้นโดยให้ PostgreSQL ใช้ดัชนี `hnsw (embedding halfvec_cosine_ops)` ได้จริง ควรเขียนส่วน `ORDER BY` อย่างไร?",
        [
          ["`ORDER BY embedding <=> $1 DESC LIMIT 5`", "`<=>` คือ Cosine Distance (ยิ่งน้อยยิ่งเหมือน) การใส่ `DESC` จะได้เอกสารที่ความหมายห่างไกลที่สุดแทน"],
          ["`ORDER BY 1 - (embedding <=> $1) DESC LIMIT 5`", "การครอบด้วย `1 - (...)` ทำให้ query planner จับคู่ดัชนี HNSW ไม่ได้และอาจตกไปทำ Seq Scan"],
          [
            "`ORDER BY embedding <=> $1 LIMIT 5`",
            "ถูก — `<=>` คืน Cosine Distance (ค่าน้อย = ใกล้สุด) และตรงกับ `halfvec_cosine_ops` จึงวิ่งผ่าน HNSW Index Scan ได้โดยตรง",
          ],
          ["`ORDER BY embedding <-> $1 LIMIT 5`", "`<->` คือ Euclidean (L2) Distance ซึ่งไม่ตรงกับ operator class `halfvec_cosine_ops`"],
        ],
        "C",
        "ตัวดำเนินการ `<=>` ใน `pgvector` คือ Cosine Distance (`1 - cosine_similarity`) จึงต้องเรียงจากน้อยไปมาก (`ASC`) โดยตรงใน `ORDER BY` เพื่อให้ planner ใช้ดัชนี HNSW ได้",
        "ใน pgvector ควรเขียน ORDER BY อย่างไรเพื่อให้ค้นหา Cosine Similarity สูงสุดและใช้ดัชนี HNSW ได้?",
        "เขียน `ORDER BY embedding <=> $1 LIMIT k` (เรียง ASC ตาม Cosine Distance) คู่กับดัชนี `vector_cosine_ops` / `halfvec_cosine_ops` และค่อยคำนวณ `1 - (embedding <=> $1)` ใน SELECT",
      ),
      mc(
        "d097-q2",
        "พารามิเตอร์ใดของดัชนี HNSW ใน `pgvector` ที่สามารถปรับเพิ่มความแม่นยำ (Recall) **ณ เวลาคิวรี** ได้ทันทีโดยไม่ต้องสร้างดัชนีใหม่?",
        [
          ["`m`", "`m` กำหนดจำนวนเส้นเชื่อมต่อโหนดตอน `CREATE INDEX` ต้องสร้างดัชนีใหม่หากเปลี่ยน"],
          ["`ef_construction`", "`ef_construction` ใช้เฉพาะตอนสร้างกราฟดัชนี ไม่ได้ปรับตอนคิวรี"],
          [
            "`hnsw.ef_search` (ผ่าน `SET LOCAL hnsw.ef_search = ...`)",
            "ถูก — `hnsw.ef_search` คุมขนาดรายการผู้สมัครตอนเดินกราฟ ปรับเพิ่ม-ลดต่อ transaction ได้ทันทีโดยไม่ต้อง REINDEX",
          ],
          ["`lists`", "`lists` เป็นพารามิเตอร์ของดัชนี IVFFlat ไม่ใช่ HNSW"],
        ],
        "C",
        "`m` และ `ef_construction` เป็น build-time parameters ส่วน `hnsw.ef_search` เป็น query-time parameter ที่ปรับสมดุลระหว่าง Recall กับ latency ได้ทันที",
        "พารามิเตอร์ HNSW ตัวไหนเป็น build-time และตัวไหนปรับได้ตอน query-time?",
        "`m` และ `ef_construction` เป็น build-time (ตอน CREATE INDEX) ส่วน `hnsw.ef_search` ปรับได้ตอน query-time ด้วย `SET LOCAL`",
      ),
      mc(
        "d097-q3",
        "เหตุใดคิวรี `pgvector` ที่มี `WHERE tenant_id = 'small_client' LIMIT 5` จึงอาจคืนผลมาแค่ 0–1 แถวเมื่อใช้ HNSW แบบปกติโดยไม่เปิด `iterative_scan`?",
        [
          ["เพราะ `pgvector` ไม่รองรับเงื่อนไข `WHERE` ร่วมกับเวกเตอร์", "PostgreSQL รองรับ `WHERE` ตามปกติ แต่เกิดลำดับการกรองแบบ post-filtering"],
          [
            "เพราะ HNSW เดินกราฟดึงมาแค่ `ef_search` แถวจากทุก tenant รวมกันแล้วค่อยกรอง `tenant_id` ทีหลัง (Post-Filtering Starvation)",
            "ถูก — เมื่อ `small_client` มีสัดส่วนน้อยในตาราง แถวที่ HNSW หยิบมาชุดแรกอาจเป็นของ tenant อื่นเกือบหมด ทำให้เหลือผลน้อยกว่า LIMIT",
          ],
          ["เพราะ `halfvec` ลบแถวของลูกค้ารายเล็กออกอัตโนมัติ", "`halfvec` แค่ลดความละเอียดทศนิยมจาก float32 เป็น float16 ไม่ได้ลบแถวข้อมูล"],
          ["เพราะ `LIMIT 5` ทำงานก่อน `ORDER BY`", "ใน SQL `ORDER BY` ทำงานก่อน `LIMIT` เสมอ"],
        ],
        "B",
        "Post-Filtering Starvation เกิดเมื่อดัชนี ANN ดึงผู้สมัครตามระยะเวกเตอร์มาก่อนแล้วค่อยคัดด้วย `WHERE` ทีหลัง — แก้ได้ใน `pgvector 0.8+` ด้วย `SET LOCAL hnsw.iterative_scan = strict_order;`",
        "Post-Filtering Starvation ใน pgvector คืออะไร และแก้ได้อย่างไรใน pgvector 0.8+?",
        "คืออาการที่ HNSW ดึงผู้สมัครมาแค่ `ef_search` แถวแล้วค่อยกรอง `WHERE` จนเหลือผลน้อยกว่า `LIMIT` แก้ด้วย `SET LOCAL hnsw.iterative_scan = strict_order` (หรือ `relaxed_order`)",
      ),
      mc(
        "d097-q4",
        "การใช้ชนิดข้อมูล `halfvec(384)` แทน `vector(384)` ใน `pgvector` มีประโยชน์หลักอย่างไร?",
        [
          ["ทำให้ค้นหาคำตรงตัวแบบ BM25 ได้โดยไม่ต้องตัดคำภาษาไทย", "`halfvec` ยังเก็บ dense embedding เหมือนเดิม ไม่ใช่ดัชนีคำตรงตัวแบบ BM25"],
          [
            "ลดขนาดพื้นที่เก็บข้อมูลและ RAM ของดัชนี HNSW ลงเกือบครึ่งหนึ่ง (float16 แทน float32) โดยแทบไม่เสียความแม่นยำ",
            "ถูก — `halfvec` ใช้ 2 bytes ต่อมิติแทน 4 bytes ช่วยให้ดัชนีอยู่ใน RAM ได้มากขึ้นและรองรับมิติสูงขึ้นถึง 4,000 มิติ",
          ],
          ["ทำให้ได้ Recall 100% เสมอโดยไม่ต้องตั้งค่า `ef_search`", "Recall ยังขึ้นกับพารามิเตอร์กราฟ HNSW (`m`, `ef_construction`, `ef_search`)"],
          ["ทำให้ไม่ต้องทำ L2 normalization หรือใช้โมเดล embedding", "ยังต้องสร้างเวกเตอร์จากโมเดล embedding ตามปกติ"],
        ],
        "B",
        "`halfvec` เป็น float16 scalar quantization ในตัวของ `pgvector >= 0.7` ช่วยประหยัด RAM ของดัชนี HNSW ลง ~50% ซึ่งเป็นคอขวดสำคัญที่สุดเมื่อคลังเอกสารขยายตัว",
        "ทำไม Production RAG บน pgvector จึงนิยมใช้ `halfvec` แทน `vector`?",
        "ลดขนาดพื้นที่จัดเก็บและ RAM ของดัชนี HNSW ลงเกือบ 50% (2 bytes vs 4 bytes ต่อมิติ) โดยความแม่นยำการค้นคืนแทบไม่ลดลง",
      ),
    ],
  },

  takeaways: [
    "**`pgvector`** เป็นจุดเริ่มต้นที่ดีเยี่ยมสำหรับ RAG ต่ำกว่า 5–10M เวกเตอร์ เพราะได้ ACID transaction, SQL `JOIN` และ metadata ในฐานข้อมูลเดียว",
    "จับคู่ตัวดำเนินการให้เป๊ะเสมอ: ใช้ **`ORDER BY embedding <=> $1 LIMIT k`** คู่กับดัชนี **`vector_cosine_ops` / `halfvec_cosine_ops`** (ห้ามใส่ `1 - (...) DESC` ใน `ORDER BY`)",
    "ดัชนี **HNSW** ปรับสมดุลได้ผ่าน `m`, `ef_construction` (ตอนสร้าง) และ **`SET LOCAL hnsw.ef_search`** (ตอนคิวรี) และควรใช้ **`halfvec`** เพื่อลด RAM ลงครึ่งหนึ่ง",
    "เมื่อกรอง metadata แคบ ๆ อย่าง `tenant_id` ต้องเปิด **`hnsw.iterative_scan`** (`pgvector 0.8+`) เพื่อป้องกัน Post-Filtering Starvation",
  ],

  reviewCards: [
    rc(
      "d097-rc-1",
      "ตัวดำเนินการ `<=>` ใน pgvector คำนวณอะไร และต้องเรียง ASC หรือ DESC เพื่อให้ได้เอกสารที่เหมือนที่สุด?",
      "`<=>` คือ Cosine Distance (= 1 - Cosine Similarity) ยิ่งน้อยยิ่งเหมือน จึงต้องเรียง ASC (`ORDER BY embedding <=> $1 LIMIT k`) และจับคู่กับ `vector_cosine_ops` / `halfvec_cosine_ops`",
    ),
    rc(
      "d097-rc-2",
      "อธิบายความต่างระหว่าง `m`, `ef_construction` และ `hnsw.ef_search` ในดัชนี HNSW",
      "`m` (เส้นเชื่อมต่อโหนด) และ `ef_construction` (ความกว้างการค้นตอนสร้าง) เป็น build-time params ส่วน `hnsw.ef_search` เป็น query-time param ที่ปรับต่อ transaction ด้วย `SET LOCAL` ได้ทันที",
    ),
    rc(
      "d097-rc-3",
      "Post-Filtering Starvation คืออะไร และวิธีแก้ใน pgvector 0.8+ ทำอย่างไร?",
      "คืออาการที่ HNSW ดึงแค่ `ef_search` แถวจากทั้งตารางแล้วค่อยกรอง `WHERE` จนคืนผลไม่ครบ `LIMIT` แก้ด้วย `SET LOCAL hnsw.iterative_scan = strict_order;` ร่วมกับ B-tree index บนคอลัมน์ filter",
    ),
  ],

  sources: [
    { label: "pgvector Official Repository — HNSW, halfvec & Iterative Scans", href: "https://github.com/pgvector/pgvector" },
    { label: "PostgreSQL Documentation — EXPLAIN & Index Scans", href: "https://www.postgresql.org/docs/current/using-explain.html" },
    { label: "Supabase / Postgres Guide — HNSW Indexes with pgvector", href: "https://supabase.com/docs/guides/ai/vector-indexes/hnsw-indexes" },
  ],

  glossary: ["hnsw", "embedding", "cosine-similarity", "rag", "chunking", "top-k", "acl", "quantization"],
});
