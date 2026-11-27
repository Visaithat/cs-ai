import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D098 — Phase 4 / Block B25
 * Dedicated Vector Store with Qdrant (Hybrid Collections, Payload Filter)
 */
export const d098: Lesson = defineLesson({
  day: 98,
  titleTh: "ใช้ Dedicated Vector Store ด้วย Qdrant (Hybrid Collections และ Payload Filter)",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% ด้วย Qdrant :memory: · เก็บ Dense + Sparse Vectors ในคอลเลกชันเดียวพร้อม Payload Index ที่กรองเร็ว",
  icon: "server",
  visual: {
    id: "vector-index-hnsw",
    title: "Qdrant Hybrid Collections — Dense + Sparse Vectors & Payload Indexing",
    caption: "ดูโครงสร้าง Point ใน Qdrant ที่เก็บทั้ง dense vector, sparse lexical weights และ payload index ในคอลเลกชันเดียว",
    alt: "แผนภาพโครงสร้าง Qdrant Hybrid Collection และ Payload Filter",
  },
  requiresApiKey: false,
  tools: ["Qdrant", "qdrant-client", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "จัดเก็บหลายมุมมองของเอกสารไว้ใน Point เดียว (Named + Sparse Vectors)",
      body: "เมื่อระบบ {{rag}} โตเกินระดับต้นแบบ เอกสารหนึ่งชิ้นมักต้องเก็บทั้ง Dense {{embedding}} (ความหมาย), Sparse Lexical Weights (คำตรงตัวแบบ {{bm25}}/SPLADE) และ metadata ({{payload}}) ที่ซับซ้อน",
      lessonNote: "Qdrant ออกแบบ Collection ให้รองรับ **Named Dense Vectors + Sparse Vectors + Structured Payload** ไว้ในหน่วยเดียวชื่อ `PointStruct`",
    },
    {
      node: 2,
      heading: "Filterable HNSW ที่ไม่ติดกับดัก Post-Filtering Starvation",
      body: "จุดแข็งหลักของ Dedicated Vector Store อย่าง Qdrant คือการสร้างกราฟ {{hnsw}} ที่รู้จัก Payload Index โดยตรง ทำให้กรอง `tenant_id`, ช่วงวันที่ (`datetime`) หรือสิทธิ์ ({{acl}}) ได้เร็วและคืนผลครบแม้เงื่อนไขแคบ",
      lessonNote: "วันนี้เราสร้าง **Payload Index** (`keyword`, `datetime`, `integer`) และทดสอบการกรองหลายเงื่อนไขใน Qdrant",
    },
    {
      node: 3,
      heading: "ทดสอบ Pipeline ค้นคืนด้วย `QdrantClient(\":memory:\")` แบบ Zero-Docker",
      body: "ปัญหาคลาสสิกของการใช้ฐานข้อมูลเฉพาะทางคือเขียน unit test ยากและรันใน CI ช้า เพราะต้องรอเปิด container ทุกครั้ง",
      lessonNote: "`qdrant-client` มีโหมดในหน่วยความจำ `QdrantClient(\":memory:\")` ที่จำลอง API ชุดเดียวกับเซิร์ฟเวอร์จริง ช่วยให้รัน {{pytest}} จบในไม่กี่ร้อยมิลลิวินาที",
    },
    {
      node: 4,
      heading: "รู้จังหวะตัดสินใจว่าเมื่อไรควรอยู่กับ pgvector และเมื่อไรควรขยับมา Qdrant",
      body: "วิศวกร AI ที่ดีไม่ย้ายฐานข้อมูลตามกระแส แต่ตัดสินใจจากสเกลข้อมูล ปริมาณ QPS ความซับซ้อนของการกรอง และความต้องการ Hybrid Search ในตัว",
      lessonNote: "หลังจบบทนี้คุณจะมีเกณฑ์เปรียบเทียบชัดเจนระหว่าง `pgvector` (D97) กับ `Qdrant` (D98) สำหรับงานจริงและ Capstone",
    },
  ],

  objectives: [
    "**ตัดสินใจเลือกสถาปัตยกรรม** ระหว่าง `pgvector` กับ `Qdrant` ได้อย่างมีเหตุผลตามจำนวนเวกเตอร์, QPS, ความซับซ้อนของ Payload Filter และความต้องการ Hybrid Sparse+Dense",
    "**สร้าง Hybrid Collection ใน Qdrant** ที่มีทั้ง **Named Dense Vector** และ **Sparse Vector** พร้อมกำหนด **Payload Index** (`keyword`, `datetime`, `is_tenant`) สำหรับ Multi-Tenant {{acl}}",
    "**เขียน Integration Test แบบ Zero-Docker** ด้วย `QdrantClient(\":memory:\")` และ `query_points(...)` เพื่อยืนยันความถูกต้องของการค้นคืนและการแยกสิทธิ์ลูกค้าใน {{pytest}}",
  ],

  prerequisites: [
    "เข้าใจ {{hnsw}}, Cosine Distance และปัญหา Post-Filtering จาก Day 97",
    "ใช้งาน `uv`, Python type hints และ {{pytest}} ได้คล่อง",
    "รู้จักโครงสร้าง JSON {{payload}} และฟิลด์ metadata ของเอกสาร RAG",
    "ไม่ต้องใช้ API key หรือ Docker — ใช้ `qdrant-client` โหมด `:memory:` บนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ Day 98 ด้วย `uv` แล้วติดตั้ง `qdrant-client` ซึ่งมาพร้อมโหมดในหน่วยความจำ (`QdrantClient(\":memory:\")`) ให้รันโค้ดและ `pytest` ได้ทันทีโดยไม่ต้องเปิด Docker",
    commands: `uv init ai-day98 && cd ai-day98
uv add qdrant-client
uv add --dev pytest ruff
uv run python -c "from qdrant_client import QdrantClient; c = QdrantClient(':memory:'); print('Qdrant in-memory ready!')"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day98` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `qdrant-client`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันคำสั่งเช็กแล้วเห็น `Qdrant in-memory ready!`"],
    ],
    note: "โค้ดที่เขียนกับ `QdrantClient(\":memory:\")` ใช้เมธอดเดียวกับตอนชี้ไปหาเซิร์ฟเวอร์จริง (`QdrantClient(url=\"http://localhost:6333\")`) แทบทุกบรรทัด จึงย้ายขึ้น Staging/Production ได้ทันที",
  },

  concepts: [
    {
      id: "pgvector-vs-qdrant-decision",
      title: "1 · เมื่อไรควรขยับจาก pgvector ไปใช้ Dedicated Vector Store อย่าง Qdrant",
      paragraphs: [
        "คำถามยอดฮิตในทีม AI คือ *\"มี PostgreSQL + `pgvector` อยู่แล้ว จำเป็นต้องเพิ่ม `Qdrant` อีกตัวไหม?\"* คำตอบเชิงวิศวกรรมคือ **อย่าเพิ่มระบบใหม่จนกว่าจะชนข้อจำกัดจริง** — สำหรับคลังเอกสารต่ำกว่า 5–10 ล้านเวกเตอร์ที่ต้องการ `JOIN` กับตารางธุรกิจและทำ ACID transaction ร่วมกัน `pgvector` ยังเรียบง่ายและดูแลถูกกว่ามาก",
        "แต่เมื่อระบบของคุณโตขึ้นจนเจอสัญญาณเหล่านี้ **Qdrant** (เขียนด้วย Rust) จะเริ่มคุ้มค่าอย่างชัดเจน: (1) เวกเตอร์เกิน ~5–10M ชิ้นหรือมี QPS สูงจนต้องแยก workload ออกจากฐานข้อมูล transactional หลัก, (2) ต้องการ **Filterable HNSW** ที่มีเงื่อนไขกรอง metadata ซับซ้อน (เช่น ช่วงเวลา + แท็กหลายค่า + แยก tenant) โดยคง latency ระดับมิลลิวินาที, (3) ต้องการเก็บ **Dense + Sparse Vectors** และทำ Hybrid {{rrf}} ภายในคิวรีเดียวจบ, หรือ (4) ต้องการ **Scalar / Binary Quantization** และ sharding/replication ในตัว",
        "ข้อดีที่ทำให้ Qdrant เป็นที่นิยมมากสำหรับนักพัฒนา Python คือมี API ที่สะอาดมาก ทำงานได้ทั้งแบบ `:memory:`, แบบไฟล์บนดิสก์ (`path=\"./qdrant_local\"`) และแบบ Docker/Cloud โดยเปลี่ยนแค่บรรทัดสร้าง client บรรทัดเดียว",
      ],
      analogy:
        "`pgvector` เหมือนรถกระบะอเนกประสงค์ที่ขนได้ทั้งคนและของในคันเดียวเหมาะกับ 80% ของงานเริ่มต้น ส่วน `Qdrant` เหมือนรถบรรทุกห้องเย็นเฉพาะทางที่ออกแบบมาเพื่อวิ่งส่งของปริมาณมหาศาลพร้อมระบบคัดแยกพัสดุในตัว",
      bullets: [
        "**เลือก `pgvector`**: เอกสาร `< 5M` chunks, ทีมเล็กอยากดูแล DB ตัวเดียว, ต้อง `JOIN` ตารางธุรกรรม/สิทธิ์แบบ real-time ACID",
        "**เลือก `Qdrant`**: เอกสาร `> 5–10M` chunks หรือ QPS สูง, ต้องการ Hybrid Dense+Sparse ในคิวรีเดียว, payload filter ซับซ้อน, หรืออยากแยกทรัพยากร RAM/CPU ของ Search ออกจาก Primary Postgres",
        "**หลักสถาปัตยกรรมที่ดี**: ห่อการเรียกค้นหาไว้หลัง interface (`Retriever` protocol) เพื่อให้สลับระหว่าง `pgvector` กับ `Qdrant` ได้โดยไม่ต้องรื้อโค้ดแอป",
      ],
      whyTitle: "Why this matters — หลีกเลี่ยงทั้ง Over-engineering และความช้าตอนสเกล",
      whyParagraphs: [
        "ทีมที่รีบเพิ่ม Dedicated Vector DB ตั้งแต่วันแรกที่มีเอกสารแค่ 500 ไฟล์มักเสียเวลาไปกับการซิงก์ข้อมูลให้ตรงกับ Postgres แต่ทีมที่ไม่รู้จัก Qdrant เลยก็อาจติดคอขวดเมื่อระบบขยายเป็นหลายล้านเอกสารและมีคิวรีพร้อมกันสูง",
        "การเข้าใจจุดแข็งของทั้งสองเครื่องมือทำให้คุณออกแบบสถาปัตยกรรมที่เหมาะกับขนาดงานจริงได้เสมอ",
      ],
    },
    {
      id: "hybrid-collections-named-vectors",
      title: "2 · โครงสร้าง Hybrid Collection: Named Dense Vectors + Sparse Vectors ใน Point เดียว",
      paragraphs: [
        "ใน Qdrant หนึ่งรายการเอกสาร (chunk) เรียกว่า **Point** ซึ่งประกอบด้วย 3 ส่วน: `id` (จำนวนเต็มหรือ UUID), `vector` (เก็บได้มากกว่าหนึ่งเวกเตอร์ในชื่อที่ต่างกัน), และ `payload` (JSON metadata เช่น `tenant_id`, `category`, `doc_id`, `updated_at`)",
        "ความสามารถเด่นมากของ Qdrant คือ **Named Vectors + Sparse Vectors**: คุณสามารถตั้งชื่อเวกเตอร์ความหมายว่า `\"dense\"` (เช่น 384 มิติ, Cosine) คู่กับเวกเตอร์คำศัพท์แบบกระจายว่า `\"lexical\"` (`SparseVector(indices=[...], values=[...])`) ไว้ใน Point เดียวกัน! ทำให้เอกสารหนึ่งชิ้นถูกค้นหาได้ทั้งจากความหมาย (Dense) และจากน้ำหนักคำตรงตัว (Sparse เช่น {{bm25}} / SPLADE) โดยไม่ต้องดูแลสองคอลเลกชันแยกกัน",
        "เมื่อค้นหาผ่าน API สมัยใหม่ **`client.query_points(...)`** คุณแค่ระบุ `using=\"dense\"` หรือ `using=\"lexical\"` (และใน Day 101 เราจะต่อยอดไปใช้ `prefetch` + `Fusion.RRF` เพื่อผสานทั้งสองฝั่งในคำสั่งเดียว)",
      ],
      analogy:
        "Point ใน Qdrant เหมือนบัตรสินค้าหนึ่งใบที่มีทั้ง 'รูปถ่ายสินค้า' (Dense vector สำหรับหาของหน้าตา/ความหมายคล้ายกัน), 'บาร์โค้ดรหัสคำ' (Sparse vector สำหรับหาคำตรงตัว) และ 'ป้ายราคา/หมวดหมู่/วันที่' (Payload) แปะรวมอยู่ในใบเดียวกัน",
      code: {
        language: "python",
        filename: "qdrant_hybrid_collection.py",
        code: `from qdrant_client import QdrantClient, models

client = QdrantClient(":memory:")

client.create_collection(
    collection_name="thai_kb",
    vectors_config={
        "dense": models.VectorParams(size=4, distance=models.Distance.COSINE),
    },
    sparse_vectors_config={
        "lexical": models.SparseVectorParams(),
    },
)

client.upsert(
    collection_name="thai_kb",
    points=[
        models.PointStruct(
            id=1,
            vector={
                "dense": [0.9, 0.1, 0.0, 0.0],
                "lexical": models.SparseVector(indices=[101, 205], values=[2.4, 1.1]),
            },
            payload={
                "doc_id": "INV-2026-009",
                "tenant_id": "acme",
                "category": "billing",
                "published_at": "2026-03-15T09:00:00Z",
            },
        )
    ],
)

hits = client.query_points(
    collection_name="thai_kb",
    query=[0.88, 0.12, 0.0, 0.0],
    using="dense",
    limit=3,
).points
print("Found:", [(p.id, p.payload["doc_id"], round(p.score, 4)) for p in hits])`,
        caption: "ใช้ `QdrantClient(\":memory:\")` สร้าง Hybrid Collection ที่มีทั้ง Named Dense และ Sparse Vector แล้วค้นหาด้วย `query_points`",
      },
      whyTitle: "Why this matters — ลดความซับซ้อนของการซิงก์ข้อมูลเมื่อเอกสารมีการแก้ไขหรือลบ",
      whyParagraphs: [
        "ถ้าเก็บ Dense ไว้ที่หนึ่งและเก็บ Lexical Index ไว้แยกอีกที่ ทุกครั้งที่เอกสารนโยบายถูกแก้ไขหรือลบคุณต้องอัปเดตทั้งสองระบบให้ตรงกัน มิฉะนั้นจะเกิดเอกสารผี (stale docs) โผล่มาในคำตอบ",
        "การเก็บทั้ง Dense, Sparse และ Payload ไว้ใน Point เดียวกันทำให้การ `upsert` หรือ `delete` เอกสารหนึ่งชิ้นจบแบบ atomic ในจุดเดียว",
      ],
    },
    {
      id: "payload-indexing-and-tenant-filter",
      title: "3 · Payload Index (`keyword`, `datetime`, `is_tenant`) และ Filterable HNSW",
      paragraphs: [
        "เวลาเราแนบ `query_filter=models.Filter(must=[...])` ให้กับ Qdrant ตัวเอนจินไม่ได้แค่สแกน HNSW แล้วค่อยมาตัดทิ้งแบบสุ่มสี่สุ่มห้า แต่จะใช้ **Filterable HNSW** ที่วางแผนตามสัดส่วนของข้อมูล (cardinality): ถ้าเงื่อนไขกรองแคบมากจะดึงจาก Payload Index แล้วเทียบเวกเตอร์ตรง ๆ แต่ถ้ากว้างพอจะเดินบนกราฟ HNSW โดยข้ามโหนดที่ไม่ผ่านเงื่อนไขไปเลย",
        "เพื่อให้การกรองทำงานได้เร็วระดับมิลลิวินาทีบน Qdrant Server จริง เราควรประกาศ **Payload Index** ไว้ล่วงหน้าด้วย `client.create_payload_index(...)` โดยเลือกชนิดข้อมูลให้ตรงงาน: **`KEYWORD`** สำหรับรหัส/หมวดหมู่/สิทธิ์ (`tenant_id`, `category`, `role`), **`DATETIME`** สำหรับกรองเอกสารไม่เก่ากว่าวันที่กำหนด และ **`INTEGER`/`FLOAT`** สำหรับช่วงราคาหรือปีเอกสาร",
        "สำหรับระบบ Multi-Tenant ที่ข้อมูลของลูกค้าแต่ละรายแยกขาดจากกัน Qdrant มีตัวเลือกพิเศษ **`models.KeywordIndexParams(type=\"keyword\", is_tenant=True)`** ซึ่งช่วยจัดวางข้อมูลของแต่ละ tenant ให้อยู่ใกล้กันบนดิสก์และสร้างซับกราฟ HNSW เฉพาะ tenant ทำให้ทั้งเร็วและปลอดภัยต่อการแยกสิทธิ์ ({{acl}})",
      ],
      analogy:
        "การตั้ง `is_tenant=True` เหมือนการแยกชั้นหนังสือตามชื่อบริษัทลูกค้าแต่ละเจ้าไว้คนละล็อก แทนที่จะเอาหนังสือทุกบริษัทมากองปนกันแล้วค่อยเดินหาทีละเล่ม",
      bullets: [
        "**`must` (AND)**: ทุกเงื่อนไขในลิสต์ต้องเป็นจริง (ใช้กับ `tenant_id` และสิทธิ์ {{acl}} เสมอ!)",
        "**`should` (OR)**: ตรงอย่างน้อยหนึ่งเงื่อนไข (เช่น `category` เป็น `billing` หรือ `refund`)",
        "**`must_not` (NOT)**: ตัดเอกสารที่ไม่ต้องการออก (เช่น `status == \"archived\"`)",
        "**`QdrantClient(\":memory:\")`**: เหมาะอย่างยิ่งสำหรับ unit test บนเครื่องและ CI เพราะไม่ต้องพึ่ง network หรือ Docker (หมายเหตุ: `create_payload_index` เป็น no-op ในโหมด `:memory:` แต่ทำงานจริงทันทีเมื่อต่อกับ Qdrant Server)",
      ],
      whyTitle: "Why this matters — ป้องกันข้อมูลรั่วข้ามบริษัทและคุม P95 Latency",
      whyParagraphs: [
        "การลืมใส่ `tenant_id` ไว้ใน `must` (หรือเผลอใส่ใน `should` แทน `must`) คือช่องโหว่ Multi-Tenant Data Leak ที่ร้ายแรงที่สุดอย่างหนึ่งในแอป RAG องค์กร",
        "การเขียน automated test บน `QdrantClient(\":memory:\")` เพื่อทดสอบเงื่อนไข `must` / `must_not` ทุกครั้งก่อน merge จึงเป็นนิสัยที่คุ้มค่ามาก",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Qdrant เทียบกับ Elasticsearch / Algolia / MongoDB",
      body: [
        "ถ้าคุณเคยใช้ Elasticsearch หรือ Algolia ในงานเว็บ Qdrant จะรู้สึกคุ้นมือมากเพราะมีแนวคิด Collection, Document Payload และ Structured Filter คล้ายกัน:",
      ],
      table: [
        ["Qdrant Collection", "Index ใน Elasticsearch / Table ใน Postgres"],
        ["Point (`id`, `vector`, `payload`)", "Document JSON ที่มีฟิลด์ vector ติดมาด้วย"],
        ["`Filter(must=[...], must_not=[...])`", "Elasticsearch `bool` query (`filter` / `must_not`)"],
        ["`create_payload_index(..., KEYWORD)`", "การสร้าง secondary index บนฟิลด์ JSON"],
        ["`QdrantClient(\":memory:\")`", "SQLite `:memory:` สำหรับรัน unit test เร็ว ๆ โดยไม่เปิด Docker"],
      ],
    },
    student: {
      title: "First-Year Note — Dense Vector vs Sparse Vector ต่างกันอย่างไร",
      body: [
        "**Dense Vector** (เวกเตอร์หนาแน่น) คือลิสต์ตัวเลขที่มีค่าเกือบทุกตำแหน่ง เช่น `[0.12, -0.45, 0.88, ...]` ยาว 384 ช่อง ใช้แทน \"ความหมายรวม\" ของประโยคจากโมเดล Embedding",
        "**Sparse Vector** (เวกเตอร์เบาบาง) มีมิติใหญ่ได้เป็นหมื่นเป็นแสนช่อง (เท่าจำนวนคำศัพท์ทั้งหมด) แต่ในเอกสารหนึ่งชิ้นมีคำปรากฏจริงแค่ไม่กี่สิบคำ จึงไม่เก็บเลขศูนย์ทั้งหมด แต่เก็บเฉพาะคู่ `(indices, values)` เช่น `indices=[101, 205], values=[2.4, 1.1]` เพื่อประหยัดพื้นที่และจับคู่คำตรงตัวได้แม่นเป๊ะ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เราจะใช้ `QdrantClient(\":memory:\")` สร้างคลังเอกสาร Multi-Tenant ที่มีทั้ง Named Dense Vector และ Sparse Vector พร้อมทดสอบการค้นหาแบบกรอง `tenant_id` และตัดเอกสาร `archived` ออกด้วย `Filter(must=..., must_not=...)`",
    steps: [
      {
        title: "1 · สร้าง Hybrid Collection และประกาศ Payload Index",
        explain:
          "กำหนดทั้ง `vectors_config` (ชื่อ `\"dense\"`) และ `sparse_vectors_config` (ชื่อ `\"lexical\"`) ในคอลเลกชันเดียว พร้อมประกาศ index บนฟิลด์ `tenant_id` (ตั้ง `is_tenant=True`) และ `year`",
        code: {
          language: "python",
          filename: "worked_qdrant.py",
          code: `from qdrant_client import QdrantClient, models

client = QdrantClient(":memory:")
COLLECTION = "enterprise_docs"

client.create_collection(
    collection_name=COLLECTION,
    vectors_config={"dense": models.VectorParams(size=3, distance=models.Distance.COSINE)},
    sparse_vectors_config={"lexical": models.SparseVectorParams()},
)

# ทำงานจริงเมื่อเชื่อม Qdrant Server (และเรียกได้ปลอดภัยใน :memory:)
client.create_payload_index(
    collection_name=COLLECTION,
    field_name="tenant_id",
    field_schema=models.KeywordIndexParams(type="keyword", is_tenant=True),
)
client.create_payload_index(
    collection_name=COLLECTION,
    field_name="year",
    field_schema=models.PayloadSchemaType.INTEGER,
)
print("Collection created:", client.collection_exists(COLLECTION))`,
        },
        output: `Collection created: True`,
      },
      {
        title: "2 · Upsert ข้อมูลเอกสารหลาย Tenant ที่มีทั้ง Dense และ Sparse Vector",
        explain:
          "ใส่เอกสาร 3 ชิ้นลงในคอลเลกชันเดียว โดยชิ้นที่ 2 เป็นของ tenant อื่น (`beta`) และชิ้นที่ 3 เป็นเอกสารเก่าที่ถูก `archived` แล้ว",
        code: {
          language: "python",
          filename: "worked_qdrant.py",
          code: `points = [
    models.PointStruct(
        id=1,
        vector={
            "dense": [0.95, 0.30, 0.0],
            "lexical": models.SparseVector(indices=[10, 42], values=[1.8, 2.5]),
        },
        payload={"doc_id": "POL-001", "tenant_id": "acme", "status": "active", "year": 2026},
    ),
    models.PointStruct(
        id=2,
        vector={
            "dense": [0.99, 0.10, 0.0],  # ใกล้ query มากที่สุดแต่เป็นของ tenant อื่น!
            "lexical": models.SparseVector(indices=[10, 99], values=[2.0, 1.0]),
        },
        payload={"doc_id": "BETA-999", "tenant_id": "beta", "status": "active", "year": 2026},
    ),
    models.PointStruct(
        id=3,
        vector={
            "dense": [0.98, 0.15, 0.0],  # ของ acme แต่ถูก archived แล้ว
            "lexical": models.SparseVector(indices=[10, 42], values=[1.5, 2.0]),
        },
        payload={"doc_id": "POL-OLD", "tenant_id": "acme", "status": "archived", "year": 2023},
    ),
]
client.upsert(collection_name=COLLECTION, points=points)
print("Total points:", client.count(COLLECTION).count)`,
        },
        output: `Total points: 3`,
      },
      {
        title: "3 · ค้นหาด้วย Dense และ Sparse ภายใต้ Payload Filter ที่บังคับสิทธิ์ tenant",
        explain:
          "ใช้ `Filter(must=[tenant_id == 'acme', year >= 2025], must_not=[status == 'archived'])` เพื่อรับประกันว่าไม่มีเอกสารของ `beta` หรือเอกสารเก่าหลุดเข้ามาทั้งในการค้นหาแบบ Dense และ Sparse",
        code: {
          language: "python",
          filename: "worked_qdrant.py",
          code: `acme_filter = models.Filter(
    must=[
        models.FieldCondition(key="tenant_id", match=models.MatchValue(value="acme")),
        models.FieldCondition(key="year", range=models.Range(gte=2025)),
    ],
    must_not=[
        models.FieldCondition(key="status", match=models.MatchValue(value="archived")),
    ],
)

dense_hits = client.query_points(
    collection_name=COLLECTION,
    query=[1.0, 0.0, 0.0],
    using="dense",
    query_filter=acme_filter,
    limit=5,
).points

sparse_hits = client.query_points(
    collection_name=COLLECTION,
    query=models.SparseVector(indices=[42], values=[1.0]),
    using="lexical",
    query_filter=acme_filter,
    limit=5,
).points

print("Dense hits :", [p.payload["doc_id"] for p in dense_hits])
print("Sparse hits:", [p.payload["doc_id"] for p in sparse_hits])`,
        },
        output: `Dense hits : ['POL-001']
Sparse hits: ['POL-001']`,
      },
    ],
    gotcha:
      "จุดสังเกต: ใน `qdrant-client` เวอร์ชันใหม่ เมธอดหลักในการค้นหาคือ `client.query_points(...)` (แทน `.search()` ที่ถูก deprecated แล้ว) และผลลัพธ์อยู่ในแอตทริบิวต์ `.points` — นอกจากนี้ห้ามลืมระบุ `using=\"dense\"` หรือ `using=\"lexical\"` เมื่อคอลเลกชันใช้ Named Vectors มิฉะนั้น Qdrant จะโยน error เพราะไม่รู้ว่าจะเทียบกับเวกเตอร์ชื่อไหน",
  },

  practice: {
    intro:
      "โจทย์ (12 นาที): สร้างคลาส `QdrantHybridStore` ที่ห่อ `QdrantClient(\":memory:\")` สำหรับจัดการคลังเอกสาร Multi-Tenant พร้อม Named Dense + Sparse Vectors และการกรอง Payload อย่างปลอดภัย",
    requirements: [
      "สร้าง `QdrantHybridStore(collection_name: str, dense_dim: int)` ที่เริ่มต้นด้วย `QdrantClient(\":memory:\")` และสร้าง Hybrid Collection ที่มี named vector `\"dense\"` (Cosine, ขนาด `dense_dim`) และ sparse vector `\"lexical\"` พร้อมประกาศ payload index สำหรับ `tenant_id` (`is_tenant=True`), `category` (`KEYWORD`) และ `year` (`INTEGER`)",
      "เมธอด `upsert_chunk(point_id: int, *, doc_id: str, tenant_id: str, category: str, year: int, status: str, dense: list[float], sparse_indices: list[int], sparse_values: list[float]) -> None` ต้อง validate ว่า `len(dense) == dense_dim` และ `len(sparse_indices) == len(sparse_values)` (ถ้าไม่ตรงโยน `ValueError`) แล้ว upsert ลง Qdrant",
      "เมธอด `search_dense(query_vec: list[float], *, tenant_id: str, limit: int = 5, category: str | None = None, min_year: int | None = None, include_archived: bool = False) -> list[tuple[str, float]]` คืน `[(doc_id, score), ...]` โดยบังคับกรอง `tenant_id` ใน `must` เสมอ และตัด `status == \"archived\"` ออกผ่าน `must_not` เมื่อ `include_archived=False`",
      "เมธอด `search_sparse(indices: list[int], values: list[float], *, tenant_id: str, limit: int = 5, category: str | None = None, min_year: int | None = None, include_archived: bool = False) -> list[tuple[str, float]]` ใช้ตัวกรองชุดเดียวกันเพื่อค้นหาบนเวกเตอร์ `\"lexical\"`",
      "ห้ามคืนเอกสารของ tenant อื่นหรือเอกสาร `archived` (เมื่อ `include_archived=False`) แม้ว่าเวกเตอร์ของเอกสารเหล่านั้นจะใกล้เคียงกับ query มากกว่าก็ตาม",
    ],
    starter: {
      language: "python",
      filename: "exercise_day098.py",
      code: `from __future__ import annotations
from qdrant_client import QdrantClient, models


class QdrantHybridStore:
    def __init__(self, collection_name: str = "kb_hybrid", dense_dim: int = 4) -> None:
        self.collection_name = collection_name
        self.dense_dim = dense_dim
        self.client = QdrantClient(":memory:")
        # TODO: 1) สร้าง collection ที่มี vectors_config={"dense": ...} และ sparse_vectors_config={"lexical": ...}
        # TODO: 2) สร้าง payload indexes สำหรับ tenant_id (is_tenant=True), category, year

    def _build_filter(
        self,
        *,
        tenant_id: str,
        category: str | None = None,
        min_year: int | None = None,
        include_archived: bool = False,
    ) -> models.Filter:
        # TODO: สร้าง models.Filter ที่มี must และ must_not ตามเงื่อนไข
        raise NotImplementedError

    def upsert_chunk(
        self,
        point_id: int,
        *,
        doc_id: str,
        tenant_id: str,
        category: str,
        year: int,
        status: str,
        dense: list[float],
        sparse_indices: list[int],
        sparse_values: list[float],
    ) -> None:
        # TODO: validate ความยาว dense และ sparse แล้ว upsert เป็น PointStruct
        raise NotImplementedError

    def search_dense(
        self,
        query_vec: list[float],
        *,
        tenant_id: str,
        limit: int = 5,
        category: str | None = None,
        min_year: int | None = None,
        include_archived: bool = False,
    ) -> list[tuple[str, float]]:
        # TODO: เรียก client.query_points(..., using="dense", query_filter=...)
        raise NotImplementedError

    def search_sparse(
        self,
        indices: list[int],
        values: list[float],
        *,
        tenant_id: str,
        limit: int = 5,
        category: str | None = None,
        min_year: int | None = None,
        include_archived: bool = False,
    ) -> list[tuple[str, float]]:
        # TODO: เรียก client.query_points(..., query=SparseVector(...), using="lexical", query_filter=...)
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day098.py",
      code: `import pytest
from exercise_day098 import QdrantHybridStore


def _seed_store() -> QdrantHybridStore:
    store = QdrantHybridStore(collection_name="test_kb", dense_dim=3)
    store.upsert_chunk(
        1,
        doc_id="ACME-2026-REFUND",
        tenant_id="acme",
        category="policy",
        year=2026,
        status="active",
        dense=[0.95, 0.20, 0.0],
        sparse_indices=[10, 20],
        sparse_values=[1.5, 2.5],
    )
    store.upsert_chunk(
        2,
        doc_id="ACME-2023-OLD",
        tenant_id="acme",
        category="policy",
        year=2023,
        status="archived",
        dense=[0.99, 0.05, 0.0],
        sparse_indices=[10, 20],
        sparse_values=[3.0, 3.0],
    )
    store.upsert_chunk(
        3,
        doc_id="BETA-2026-SECRET",
        tenant_id="beta",
        category="policy",
        year=2026,
        status="active",
        dense=[1.0, 0.0, 0.0],
        sparse_indices=[10, 20],
        sparse_values=[5.0, 5.0],
    )
    store.upsert_chunk(
        4,
        doc_id="ACME-2026-BILLING",
        tenant_id="acme",
        category="billing",
        year=2026,
        status="active",
        dense=[0.80, 0.60, 0.0],
        sparse_indices=[10, 99],
        sparse_values=[1.0, 4.0],
    )
    return store


def test_dense_search_enforces_tenant_and_archived_filter():
    store = _seed_store()
    hits = store.search_dense([1.0, 0.0, 0.0], tenant_id="acme", limit=5)
    doc_ids = [doc_id for doc_id, _ in hits]
    assert "BETA-2026-SECRET" not in doc_ids
    assert "ACME-2023-OLD" not in doc_ids
    assert doc_ids == ["ACME-2026-REFUND", "ACME-2026-BILLING"]


def test_category_and_min_year_filters():
    store = _seed_store()
    hits = store.search_dense(
        [1.0, 0.0, 0.0],
        tenant_id="acme",
        category="policy",
        min_year=2025,
        include_archived=True,
    )
    assert [doc_id for doc_id, _ in hits] == ["ACME-2026-REFUND"]


def test_sparse_search_with_tenant_isolation():
    store = _seed_store()
    hits = store.search_sparse([99], [1.0], tenant_id="acme", limit=5)
    assert [doc_id for doc_id, _ in hits] == ["ACME-2026-BILLING"]

    beta_hits = store.search_sparse([20], [1.0], tenant_id="beta", limit=5)
    assert [doc_id for doc_id, _ in beta_hits] == ["BETA-2026-SECRET"]


def test_upsert_validates_vector_lengths():
    store = QdrantHybridStore(dense_dim=3)
    with pytest.raises(ValueError):
        store.upsert_chunk(
            99,
            doc_id="BAD-DENSE",
            tenant_id="acme",
            category="faq",
            year=2026,
            status="active",
            dense=[1.0, 0.0],  # ผิดขนาด (2 != 3)
            sparse_indices=[1],
            sparse_values=[1.0],
        )
    with pytest.raises(ValueError):
        store.upsert_chunk(
            100,
            doc_id="BAD-SPARSE",
            tenant_id="acme",
            category="faq",
            year=2026,
            status="active",
            dense=[1.0, 0.0, 0.0],
            sparse_indices=[1, 2],
            sparse_values=[1.0],  # จำนวน indices != values
        )
`,
    },
    selfCheck: [
      "สร้าง Hybrid Collection ด้วยทั้ง `vectors_config={\"dense\": ...}` และ `sparse_vectors_config={\"lexical\": ...}`",
      "`search_dense` และ `search_sparse` แยกข้อมูล `beta` ออกจาก `acme` ได้ 100% ผ่าน `must` filter",
      "เอกสาร `status == \"archived\"` ถูกคัดออกเมื่อ `include_archived=False` และโผล่ได้เมื่อ `include_archived=True` (หากผ่านเงื่อนไขอื่น)",
      "`upsert_chunk` โยน `ValueError` ทันทีเมื่อขนาดเวกเตอร์ `dense` หรือ `sparse` ไม่ตรงสัญญา",
      "รัน `uv run pytest -q` ผ่านครบ 4 เทสต์โดยไม่ต้องเปิด Docker และ `uv run ruff check .` สะอาด",
    ],
    acceptance: "ผ่านทั้ง 4 test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `_build_filter` ให้เริ่มด้วย `must = [models.FieldCondition(key=\"tenant_id\", match=models.MatchValue(value=tenant_id))]` แล้วค่อย `append` เงื่อนไข `category` (`MatchValue`) และ `min_year` (`Range(gte=min_year)`) เมื่อค่าไม่เป็น `None` ส่วน `must_not` ให้ใส่เงื่อนไข `status == \"archived\"` เมื่อ `not include_archived`",
      },
      {
        body: "ใน `search_dense` และ `search_sparse` ให้ใช้ `self.client.query_points(collection_name=self.collection_name, query=..., using=..., query_filter=flt, limit=limit).points` แล้วดึง `[(str(p.payload[\"doc_id\"]), float(p.score)) for p in points if p.payload]`",
      },
      {
        body: "ตัวอย่าง `_build_filter` และ `upsert_chunk` — นำไปต่อเติม `search_dense` และ `search_sparse` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day098.py",
          code: `def _build_filter(
    self,
    *,
    tenant_id: str,
    category: str | None = None,
    min_year: int | None = None,
    include_archived: bool = False,
) -> models.Filter:
    must: list[models.Condition] = [
        models.FieldCondition(key="tenant_id", match=models.MatchValue(value=tenant_id))
    ]
    if category is not None:
        must.append(models.FieldCondition(key="category", match=models.MatchValue(value=category)))
    if min_year is not None:
        must.append(models.FieldCondition(key="year", range=models.Range(gte=min_year)))

    must_not: list[models.Condition] = []
    if not include_archived:
        must_not.append(models.FieldCondition(key="status", match=models.MatchValue(value="archived")))

    return models.Filter(must=must, must_not=must_not or None)`,
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
      title: "ลืมระบุพารามิเตอร์ using=\"dense\" เมื่อคอลเลกชันใช้ Named Vectors",
      symptom: "`qdrant-client` โยน error แจ้งว่าไม่พบ default vector name (`\"\"`) ทั้งที่ใส่ข้อมูลลงคอลเลกชันไปแล้ว",
      fix: "เมื่อกำหนด `vectors_config={\"dense\": ...}` ต้องส่ง `using=\"dense\"` (หรือ `using=\"lexical\"`) ทุกครั้งใน `query_points(...)`",
    },
    {
      title: "เผลอใส่ tenant_id ไว้ใน Filter(should=[...]) แทน must=[...]",
      symptom: "เมื่อมีเงื่อนไข `should` อื่น (เช่น `category == 'policy'`) เอกสารของ tenant อื่นที่มี `category == 'policy'` จะหลุดเข้ามาในคำตอบทันที!",
      fix: "เงื่อนไขความปลอดภัยและสิทธิ์เข้าถึง ({{acl}}) อย่าง `tenant_id` ต้องอยู่ใน `must=[...]` เสมอ และมี unit test ยืนยันการกันข้อมูลข้ามลูกค้า",
    },
    {
      title: "ไม่สร้าง Payload Index บน Qdrant Server จริงเพราะเห็นว่า :memory: รันเร็วอยู่แล้ว",
      symptom: "ตอนทดสอบบนเครื่องด้วย `:memory:` (100 แถว) เร็วมาก แต่พอขึ้น Production ที่มี 2 ล้าน points คิวรีที่มี `query_filter` กลับช้าลงเป็นวินาที",
      fix: "ประกาศ `create_payload_index(...)` สำหรับทุกฟิลด์ที่ใช้กรอง (`tenant_id` พร้อม `is_tenant=True`, `category`, `year`/`datetime`) ตั้งแต่ขั้นตอน bootstrap คอลเลกชัน",
    },
    {
      title: "สร้างคอลเลกชันแยกต่อ 1 ลูกค้า (1,000 tenants = 1,000 collections)",
      symptom: "Qdrant กิน RAM และ overhead ของไฟล์จัดการสูงเกินจำเป็นเมื่อจำนวนลูกค้าเพิ่มขึ้นเป็นหลักพัน",
      fix: "เก็บทุก tenant ในคอลเลกชันเดียวแล้วใช้ Payload Index แบบ `is_tenant=True` ตามคำแนะนำอย่างเป็นทางการของ Qdrant เว้นแต่มีข้อกำหนดแยกคลัสเตอร์ทางกฎหมาย",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d098-q1",
        "สถานการณ์ใดต่อไปนี้เป็นเหตุผลทางวิศวกรรมที่เหมาะสมที่สุดในการขยับจาก `pgvector` มาใช้ Dedicated Vector Store อย่าง `Qdrant`?",
        [
          ["เพิ่งเริ่มทำโปรเจกต์ที่มีเอกสาร PDF 200 ไฟล์และต้อง JOIN ตารางผู้ใช้ใน Postgres", "เคสนี้ `pgvector` เรียบง่ายและคุ้มกว่ามาก ยังไม่จำเป็นต้องเพิ่มฐานข้อมูลใหม่"],
          [
            "คลังเอกสารโตเกิน 5–10M เวกเตอร์ มี QPS สูง ต้องการ Hybrid Dense+Sparse ในคิวรีเดียว และมีการกรอง Payload ที่ซับซ้อน",
            "ถูก — นี่คือจุดที่สถาปัตยกรรมเฉพาะทางของ Qdrant (Filterable HNSW, Named/Sparse vectors, Quantization, Sharding) สร้างความต่างชัดเจน",
          ],
          ["ต้องการใช้ SQL JOIN ซับซ้อนข้าม 10 ตารางบัญชีพร้อม ACID transaction", "งาน relational JOIN + ACID เป็นจุดแข็งของ PostgreSQL ไม่ใช่ Dedicated Vector Store"],
          ["เพราะ `pgvector` ไม่รองรับ Cosine Similarity", "`pgvector` รองรับ Cosine Distance (`<=>`) และ HNSW อยู่แล้ว"],
        ],
        "B",
        "เลือกเครื่องมือตามสเกลและลักษณะงานจริง: `pgvector` คุ้มสุดสำหรับระบบเริ่มต้นถึงขนาดกลาง ส่วน `Qdrant` เด่นเมื่อสเกลใหญ่ QPS สูง หรือต้องการ Hybrid Sparse+Dense + Filterable HNSW เต็มรูปแบบ",
        "เมื่อไรควรยังอยู่กับ pgvector และเมื่อไรควรขยับไป Qdrant?",
        "อยู่กับ pgvector เมื่อเวกเตอร์ < 5–10M และต้องการ JOIN/ACID ใน Postgres เดียว; ขยับไป Qdrant เมื่อ > 5–10M, QPS สูง, กรอง payload ซับซ้อน หรือต้องการ Hybrid Dense+Sparse และ quantization ในตัว",
      ),
      mc(
        "d098-q2",
        "ข้อใดอธิบายประโยชน์ของ **Named Vectors + Sparse Vectors** ใน Qdrant Collection ได้ถูกต้องที่สุด?",
        [
          ["ช่วยให้เก็บทั้ง Dense embedding และ Sparse lexical weights ของเอกสารชิ้นเดียวกันไว้ใน Point เดียว ลดภาระการซิงก์และลบเอกสารข้ามระบบ", "ถูก — หนึ่ง Point ถือทั้งความหมาย (dense), น้ำหนักคำตรงตัว (sparse) และ metadata (payload) ทำ upsert/delete จบแบบ atomic"],
          ["ทำให้ไม่ต้องใช้โมเดล Embedding อีกต่อไป", "Named Dense Vector ยังคงเก็บเวกเตอร์ที่สร้างจากโมเดล Embedding"],
          ["บังคับให้ทุก Point ในคอลเลกชันต้องมีค่าเวกเตอร์เหมือนกันหมด", "แต่ละ Point เก็บเวกเตอร์เฉพาะของเอกสารชิ้นนั้น ๆ"],
          ["ใช้ได้เฉพาะบน Qdrant Cloud เท่านั้น รันใน `:memory:` ไม่ได้", "ใช้งานได้ครบทั้งใน `QdrantClient(\":memory:\")`, Docker self-host และ Qdrant Cloud"],
        ],
        "A",
        "Hybrid Collection ของ Qdrant เก็บได้หลายเวกเตอร์ต่อหนึ่ง Point ทำให้ต่อยอดสู่ Hybrid Search + RRF ได้สะอาดโดยไม่ต้องดูแลฐานข้อมูลแยกสองชุด",
        "ประโยชน์หลักของการเก็บ Named Dense + Sparse Vectors ไว้ใน Qdrant Collection เดียวคืออะไร?",
        "เก็บได้ทั้งความหมายและคำตรงตัวใน Point เดียวกัน ลดความเสี่ยงข้อมูลไม่ตรงกัน (sync drift) เมื่อมีการอัปเดตหรือลบเอกสาร และรองรับ Hybrid RRF ในคิวรีเดียว",
      ),
      mc(
        "d098-q3",
        "การตั้งค่า `models.KeywordIndexParams(type=\"keyword\", is_tenant=True)` บนฟิลด์ `tenant_id` ใน Qdrant ช่วยอะไร?",
        [
          ["เข้ารหัสข้อความใน payload ด้วยรหัสผ่านของลูกค้าอัตโนมัติ", "`is_tenant=True` เป็นการจัดโครงสร้างดัชนีและ storage layout ไม่ใช่ระบบ encryption"],
          [
            "ช่วยให้เก็บหลาย tenant ในคอลเลกชันเดียวได้อย่างมีประสิทธิภาพ โดยจัดวางข้อมูลและซับกราฟ HNSW แยกตาม tenant ให้กรองได้เร็วมาก",
            "ถูก — ช่วยให้ Multi-Tenant RAG ไม่ต้องแตกเป็นพันคอลเลกชัน แต่ยังกรองตาม `tenant_id` ได้เร็วและประหยัดทรัพยากร",
          ],
          ["บังคับลบข้อมูล tenant อื่นทันทีที่มีการคิวรี", "ไม่ได้ลบข้อมูล เพียงช่วย optimize การจัดเก็บและค้นหา"],
          ["ทำให้ไม่ต้องใส่ `tenant_id` ใน `query_filter` ตอนค้นหา", "ตอนค้นหายังต้องใส่ `tenant_id` ใน `Filter(must=[...])` ทุกครั้ง!"],
        ],
        "B",
        "`is_tenant=True` เป็นแนวทางแนะนำของ Qdrant สำหรับระบบ Multi-Tenant เพื่อรวมทุก tenant ไว้ในคอลเลกชันเดียวแต่ยังได้ความเร็วในการกรองใกล้เคียงคอลเลกชันแยก",
        "ทำไม Qdrant จึงแนะนำให้ใช้ Payload Index แบบ `is_tenant=True` แทนการสร้าง 1 Collection ต่อ 1 ลูกค้า?",
        "ลด overhead ของจำนวนคอลเลกชันจำนวนมาก ขณะที่จัดวางข้อมูลและซับกราฟ HNSW แยกตาม tenant ให้กรองได้เร็วและประหยัด RAM",
      ),
      mc(
        "d098-q4",
        "เหตุใด `QdrantClient(\":memory:\")` จึงมีประโยชน์อย่างมากใน workflow การพัฒนาและการรัน CI ของวิศวกร AI?",
        [
          ["เพราะรองรับข้อมูลระดับ 100 ล้านเวกเตอร์บนโน้ตบุ๊กได้เร็วกว่าเซิร์ฟเวอร์ Rust", "โหมด `:memory:` จำลองด้วย Python/NumPy สำหรับชุดข้อมูลขนาดเล็กเพื่อการทดสอบ ไม่ใช่สำหรับ 100M เวกเตอร์ใน Production"],
          [
            "ช่วยให้รัน unit / integration test ของการ upsert, payload filter และ hybrid search ใน `pytest` ได้ทันทีโดยไม่ต้องเปิด Docker",
            "ถูก — ใช้ API ชุดเดียวกับ Qdrant Server จึงเทสต์ลอจิก ACL และ filter ใน CI ได้เร็วและเสถียร",
          ],
          ["เพราะบันทึกข้อมูลลงฮาร์ดดิสก์ถาวรให้อัตโนมัติแม้ปิดเครื่อง", "โหมด `:memory:` เก็บใน RAM เท่านั้น (หากต้องการลงดิสก์ใช้ `QdrantClient(path=\"...\")`)"],
          ["เพราะสร้างโมเดล Embedding ภาษาไทยให้เองโดยไม่ต้องใช้ไลบรารีอื่น", "Qdrant เป็น Vector Store สำหรับจัดเก็บและค้นหาเวกเตอร์ที่ส่งเข้าไป"],
        ],
        "B",
        "การมี `QdrantClient(\":memory:\")` ทำให้การทดสอบลอจิกการกรองสิทธิ์ลูกค้า (`must`/`must_not`) และ Hybrid Collection รันได้ใน `pytest` ภายในไม่กี่ร้อยมิลลิวินาที",
        "ข้อดีและข้อจำกัดของ `QdrantClient(\":memory:\")` คืออะไร?",
        "ข้อดี: รันเทสต์ใน pytest/CI ได้ทันทีโดยไม่ต้องเปิด Docker ด้วย API เดียวกับเซิร์ฟเวอร์จริง; ข้อจำกัด: ใช้สำหรับเทสต์ข้อมูลขนาดเล็กและไม่เก็บข้อมูลถาวร",
      ),
    ],
  },

  takeaways: [
    "ขยับจาก `pgvector` มา **`Qdrant`** เมื่อระบบสเกลเกิน ~5–10M เวกเตอร์, QPS สูง, กรอง payload ซับซ้อน หรืออยากได้ Hybrid Dense+Sparse + Quantization ในตัว",
    "**Hybrid Collection** ของ Qdrant เก็บทั้ง **Named Dense Vector**, **Sparse Vector** และ **Payload** ไว้ใน `PointStruct` เดียว ทำให้ upsert/delete ครบจบในจุดเดียว",
    "ประกาศ **Payload Index** (`keyword` + `is_tenant=True`, `datetime`, `integer`) และใส่เงื่อนไขสิทธิ์ ({{acl}}) ไว้ใน **`Filter(must=[...])`** เสมอ",
    "ใช้ **`QdrantClient(\":memory:\")`** คู่กับ `client.query_points(...)` เพื่อเขียนเทสต์กรองสิทธิ์ใน `pytest` ได้แบบ Zero-Docker",
  ],

  reviewCards: [
    rc(
      "d098-rc-1",
      "โครงสร้างของ 1 Point ใน Qdrant Hybrid Collection ประกอบด้วยอะไรบ้าง?",
      "1) `id` (int/UUID), 2) `vector` (เก็บได้ทั้ง Named Dense Vector เช่น `\"dense\"` และ Sparse Vector เช่น `\"lexical\"`), และ 3) `payload` (JSON metadata สำหรับกรอง)",
    ),
    rc(
      "d098-rc-2",
      "ใน `models.Filter` ของ Qdrant ความต่างระหว่าง `must`, `should` และ `must_not` คืออะไร และควรใส่ `tenant_id` ไว้ที่ใด?",
      "`must` = AND (ต้องตรงทุกข้อ), `should` = OR (ตรงอย่างน้อย 1 ข้อ), `must_not` = NOT (ห้ามตรง) — ต้องใส่ `tenant_id` ไว้ใน `must` เสมอเพื่อกันข้อมูลรั่วข้ามลูกค้า",
    ),
    rc(
      "d098-rc-3",
      "เมธอดหลักในการค้นหาของ `qdrant-client` รุ่นใหม่คืออะไร และต้องไม่ลืมส่งพารามิเตอร์ใดเมื่อใช้ Named Vectors?",
      "ใช้ `client.query_points(..., using=\"dense\" | \"lexical\", query_filter=...)` และอ่านผลจาก `.points` — ห้ามลืมระบุ `using`",
    ),
  ],

  sources: [
    { label: "Qdrant Documentation — Collections & Named/Sparse Vectors", href: "https://qdrant.tech/documentation/concepts/collections/" },
    { label: "Qdrant Documentation — Filtering & Payload Indexing", href: "https://qdrant.tech/documentation/concepts/filtering/" },
    { label: "Qdrant Documentation — Multitenancy Best Practices (is_tenant)", href: "https://qdrant.tech/documentation/guides/multiple-partitions/" },
    { label: "qdrant-client Python SDK Reference", href: "https://python-client.qdrant.tech/" },
  ],

  glossary: ["hnsw", "embedding", "payload", "bm25", "rrf", "acl", "rag", "pytest"],
});
