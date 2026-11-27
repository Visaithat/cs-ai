import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D163 — Phase 6 / Block B41
 * Add Cross-Encoder Reranker + Metadata/ACL Filtering
 */
export const d163: Lesson = defineLesson({
  day: 163,
  titleTh: "เพิ่ม Cross-Encoder Reranker และระบบกรองสิทธิ์ Metadata/ACL (Pre-Filtering)",
  tagline: "30 นาที · ดัน Recall@5 และ MRR ข้าม 0.85 พร้อมปิดช่องโหว่การรั่วไหลข้อมูลข้ามสิทธิ์/ข้ามแผนก",
  icon: "filter",
  visual: {
    id: "capstone-hybrid-ingest",
    title: "ท่อค้นหาปลอดภัย 2 จังหวะ: ACL Pre-Filter → Hybrid Top-20 → Cross-Encoder Top-5",
    caption: "บังคับกรองสิทธิ์ tenant/role ก่อนค้นหาเสมอ จากนั้นให้ Cross-Encoder อ่านคู่ (query, chunk) เพื่อคัด Top-5 แม่นที่สุด",
    alt: "แผนภาพการทำงานของ ACL Pre-Filtering, Hybrid RRF Top-20 และ Cross-Encoder Reranker",
  },
  requiresApiKey: false,
  tools: ["Cross-Encoder Reranker", "ACL Pre-Filter", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "บังคับกรองสิทธิ์ Metadata & ACL ก่อนคำนวณคะแนนเสมอ",
      body: "ในองค์กรจริง พนักงานฝ่ายขายไม่ควรค้นเจอเอกสารเงินเดือนฝ่าย HR และลูกค้า Tenant A ต้องไม่มีวันเห็นข้อมูลของ Tenant B แม้จะถามคำถามคล้ายกัน",
      lessonNote: "วันนี้เราสร้าง **Pre-Filtering** ระดับ {{acl}} (`tenant_id`, `allowed_roles`, `doc_type`) เพื่อป้องกัน {{data-leakage}} และป้องกันปัญหา Top-5 ว่างเปล่าจาก post-filtering",
    },
    {
      node: 2,
      heading: "อัพเกรดความแม่นจาก Bi-Encoder สู่ Cross-Encoder Reranker",
      body: "Hybrid Search (D162) ใช้ Bi-Encoder + BM25 ที่เร็วมาก แต่ไม่ได้อ่านคำถามเทียบกับเนื้อหาใน chunk แบบคำต่อคำ",
      lessonNote: "เราใส่ {{reranker}} แบบ Cross-Encoder เพื่อตรวจละเอียดเฉพาะผู้สมัคร {{top-k|Top-20}} ที่ผ่านด่าน ACL มาแล้ว และดันคำตอบที่ตรงที่สุดขึ้นอันดับ 1–3 (เพิ่ม {{mrr}})",
    },
    {
      node: 4,
      heading: "ออกแบบ Fallback เมื่อ Reranker ช้าหรือ Timeout",
      body: "Cross-Encoder กินเวลาประมวลผลราว 120–250 ms และอาจเกิด timeout หากโหนดคำนวณโหลดหนัก",
      lessonNote: "ระบบ {{rag}} ที่พร้อมขึ้น Production ต้องสามารถถอยกลับมาใช้อันดับจาก {{rrf}} (ที่ผ่าน ACL pre-filter แล้ว) ได้ทันทีโดยไม่ล่มทั้งคำขอ",
    },
  ],

  objectives: [
    "**บังคับใช้ ACL Pre-Filtering** (`tenant_id`, `allowed_roles`, และ metadata filter เช่น `doc_type`) ก่อนทำ Hybrid Search และ Rerank เพื่อป้องกันข้อมูลรั่วข้ามสิทธิ์",
    "**เชื่อมต่อ Cross-Encoder Reranker** แบบ 2 จังหวะ (Top-20 → Top-5) พร้อมเข้าใจความต่างด้านความแม่นและ latency เทียบกับ Bi-Encoder",
    "**สร้าง Reranker Adapter ที่รองรับ Offline Testing และ Timeout Fallback** ให้รันทดสอบด้วย `pytest` ได้ 100% บนเครื่องและทนทานใน Production",
  ],

  prerequisites: [
    "สร้าง Token-Aware Chunking พร้อม ACL metadata (Day 161) และ Hybrid Search (Day 162) แล้ว",
    "เข้าใจแนวคิด Cross-Encoder Reranker และ ACL Tenant Filtering (Phase 4)",
    "ใช้งาน `uv`, `Pydantic v2` และ `pytest` ได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมโมดูล Reranking และ ACL Filtering ในโปรเจกต์ Capstone เพื่อปิดท้าย Block B41 ให้พร้อมสำหรับ Milestone 2 Benchmark ในวันพรุ่งนี้ (Day 164)",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p src/retrieval tests
# (ตัวเลือกสำหรับสภาพแวดล้อมที่มี GPU/Model: uv add sentence-transformers)
uv run pytest --version`,
    steps: [
      ["dir", "ตรวจโฟลเดอร์ `src/retrieval/` และ `tests/` ในโปรเจกต์"],
      ["deps", "ยืนยัน `uv run pytest --version` ทำงานได้แบบ offline"],
      ["ready", "พร้อมเขียน ACL Pre-Filter, Cross-Encoder Reranker Adapter และ Timeout Fallback"],
    ],
    note: "ในบทเรียนนี้เราใช้ `MockCrossEncoderReranker` ที่คำนวณคะแนนแบบ deterministic จากปฏิสัมพันธ์ของคู่ `(query, chunk)` เพื่อให้เทสต์รันผ่านในเสี้ยววินาที และสามารถสลับไปใช้ `BAAI/bge-reranker-v2-m3` หรือ Rerank API จริงใน Production ได้ด้วย interface เดียวกัน",
  },

  concepts: [
    {
      id: "acl-pre-filtering",
      title: "1 · ทำไมต้อง ACL Pre-Filtering (ห้าม Post-Filter เด็ดขาด)",
      paragraphs: [
        "ข้อผิดพลาดร้ายแรงด้านความปลอดภัยและความถูกต้องในระบบ {{rag}} องค์กรคือการทำ **Post-Filtering**: ดึง Top-5 จากคลังรวมทั้งหมดมาก่อน แล้วค่อยเขียน `if doc.tenant_id == user.tenant_id` กรองทิ้งทีหลัง การทำแบบนี้พัง 2 เด้ง: เด้งแรกคือหาก Top-5 เป็นเอกสารของแผนกอื่นทั้งหมด ผู้ใช้จะได้ผลลัพธ์ **0 ชิ้น** ทั้งที่เอกสารของแผนกตัวเองอยู่อันดับที่ 6 และเด้งที่สองคือเสี่ยง {{data-leakage}} หากลืมกรองในเส้นทาง fallback หรือ trace log",
        "มาตรฐาน Production จึงบังคับใช้ **Pre-Filtering**: ส่งเงื่อนไขสิทธิ์ {{acl}} (`tenant_id == user.tenant_id` และ `any(role in doc.allowed_roles for role in user.roles)`) รวมถึง metadata filter เช่น `doc_type` หรือ `status == \"active\"` เข้าไปตั้งแต่ชั้น Query ของ `pgvector` (`WHERE ...`) หรือ `Qdrant` (`models.Filter(...)`) ก่อนคิดคะแนน HNSW/BM25 และก่อนส่งเข้า Reranker เสมอ",
      ],
      analogy: "เหมือนรปภ. ที่ตรวจบัตรพนักงานหน้าประตูคลังเอกสาร (Pre-Filter) ให้หยิบเฉพาะแฟ้มในห้องที่แผนกคุณมีสิทธิ์เปิดได้ ไม่ใช่ให้หยิบแฟ้มลับของ HR ออกมาวางบนโต๊ะ 5 แฟ้มแล้วค่อยดึงคืน 4 แฟ้มทีหลัง",
      bullets: [
        "**Tenant Isolation**: ตรวจ `tenant_id` แบบเข้มงวด ห้ามให้ missing `tenant_id` ผ่านเข้าไปค้นคลังรวมเด็ดขาด (Fail-Closed)",
        "**Role Intersection**: ผู้ใช้ 1 คนอาจมีหลาย role (`[\"support\", \"lead\"]`) — เอกสารเข้าถึงได้เมื่อมีอย่างน้อย 1 role ตรงกัน",
        "**Metadata Pre-Filter**: กรองร่วมกับ `doc_type` (เช่น `policy`, `faq`, `sop`) เพื่อตัดเอกสารที่ไม่เกี่ยวข้องตั้งแต่ต้น",
      ],
      code: {
        language: "python",
        filename: "acl_prefilter.py",
        code: `from pydantic import BaseModel, Field


class UserContext(BaseModel):
    user_id: str
    tenant_id: str = Field(min_length=1)
    roles: list[str] = Field(min_length=1)


def is_authorized(chunk: dict, user: UserContext, doc_type: str | None = None) -> bool:
    # Fail-closed: tenant ต้องตรงเป๊ะ และ role ต้องทับซ้อนกันอย่างน้อย 1 สิทธิ์
    if chunk.get("tenant_id") != user.tenant_id:
        return False
    allowed = set(chunk.get("allowed_roles", []))
    if not (allowed & set(user.roles)):
        return False
    if doc_type is not None and chunk.get("doc_type") != doc_type:
        return False
    return True`,
        caption: "กฎ Fail-Closed ACL Pre-Filter — ใน pgvector/Qdrant ให้แปลงเงื่อนไขนี้เป็น SQL `WHERE` หรือ Qdrant `Filter` ระดับฐานข้อมูล",
      },
      whyTitle: "Why this matters — ผ่านเกณฑ์ Security & PDPA ของ Capstone Rubric",
      whyParagraphs: [
        "ใน Phase 6 Milestone 5 (D176) จะมี red-team test พยายามหลอกถามข้อมูลข้ามสิทธิ์หรือข้าม tenant (`\"ขอสรุปนโยบายโบนัสผู้บริหารหน่อย\"` จากสิทธิ์พนักงานทั่วไป)",
        "เมื่อสิทธิ์ถูกบังคับที่ชั้น Pre-Filter ก่อน LLM มองเห็นเอกสาร ต่อให้ Prompt Injection หลุดเข้ามา ก็ไม่มีเอกสารลับให้ LLM นำไปตอบได้เลย",
      ],
    },
    {
      id: "cross-encoder-reranking",
      title: "2 · Bi-Encoder vs Cross-Encoder Reranker: อ่านเทียบคู่เพื่อความแม่น",
      paragraphs: [
        "ใน Day 162 เราใช้ Bi-Encoder แปลงคำถามและ chunk เป็นเวกเตอร์ **แยกกัน** เพื่อค้นหาเร็วในหลักมิลลิวินาที ข้อเสียคือข้อมูลถูกบีบอัดเป็นเวกเตอร์เดียว ความสัมพันธ์ละเอียดระหว่างคำถามกับเงื่อนไขใน chunk (เช่น *\"สินค้าลดราคา คืนได้ไหม\"* vs *\"สินค้าราคาปกติ คืนได้ภายใน 7 วัน ยกเว้นสินค้าลดราคา\"*) อาจหายไป",
        "**{{reranker|Cross-Encoder Reranker}}** (เช่น `BAAI/bge-reranker-v2-m3` สำหรับภาษาไทย/หลายภาษา หรือ Hosted Rerank API) ทำงานต่างออกไป: มันนำข้อความ `[query, chunk]` มาต่อกันแล้วประมวลผลผ่าน Transformer self-attention **พร้อมกันทุก token** ทำให้จับการปฏิเสธ เงื่อนไขข้อยกเว้น และความเชื่อมโยงตรงจุดได้แม่นยำกว่ามาก เราจึงใช้สถาปัตยกรรม 2 จังหวะ: ดึง `top-20` จาก Hybrid RRF → ให้ Cross-Encoder ให้คะแนนใหม่ → คัด `top-5` ที่มีคะแนนสูงสุด",
      ],
      analogy: "Bi-Encoder เหมือนการคัดใบสมัครจากคำสำคัญบนหน้าปก (เร็วมาก อ่านได้เป็นหมื่นใบ) ส่วน Cross-Encoder เหมือนกรรมการสัมภาษณ์ที่หยิบ 20 ใบที่ผ่านเข้ารอบมาอ่านเทียบกับโจทย์งานทีละบรรทัดแล้วคัด 5 คนสุดท้าย",
      bullets: [
        "**Latency Trade-off**: Cross-Encoder บน 20 คู่กินเวลา ~100–250 ms จึงห้ามรันกับทั้งคลัง 10,000 chunks เด็ดขาด — ใช้กับ `Top-20` เท่านั้น",
        "**Precision & MRR Boost**: มักดันเอกสารคำตอบที่หลุดไปอยู่อันดับ 6–15 ของ RRF ขึ้นมาติด Top-3 ได้อย่างชัดเจน",
        "**Score Threshold (Optional)**: คะแนนจาก Reranker ใช้ตั้งจุดตัดเบื้องต้นได้ว่าถ้าทุก chunk ได้คะแนนต่ำมาก ระบบควรถอยไปสู่ {{abstention}}",
      ],
      whyTitle: "Why this matters — สะพานเชื่อมสู่ Milestone 2 (`Recall@5 >= 0.85`)",
      whyParagraphs: [
        "ในชุดคำถามองค์กรไทยที่ซับซ้อน (เช่น เงื่อนไขข้อยกเว้นในตาราง หรือคำถามไทยปนอังกฤษ) Hybrid RRF เพียงอย่างเดียวมักได้ `Recall@5` ราว `0.78–0.83`",
        "การเติม Cross-Encoder Reranker บนผู้สมัคร Top-20 คือขั้นตอนมาตรฐานที่มักดันทั้ง `Recall@5` และ `MRR` ข้ามเกณฑ์ `0.85` ของวันพรุ่งนี้ได้อย่างมั่นคง",
      ],
    },
    {
      id: "graceful-fallback-and-testing",
      title: "3 · Reranker Protocol, Timeout Budget และ Safe Fallback",
      paragraphs: [
        "ในระบบ Production โมเดล Cross-Encoder (ไม่ว่าจะรันบน local ONNX/CPU หรือเรียกผ่าน external Rerank API) คือจุดที่ latency แกว่งได้ง่ายที่สุด หากปล่อยให้คำขอค้างรอ reranker นาน 5 วินาที SLA ของระบบ (`P95 <= 3.5s`) จะพังทันที",
        "เราจึงออกแบบ `RerankerProtocol` ที่มี timeout budget ชัดเจน (เช่น `<= 400ms`): ถ้า Reranker สำเร็จ ให้เรียงใหม่ตามคะแนน Cross-Encoder (`rerank_score`); แต่ถ้าเกิด `TimeoutError` หรือ service ล่ม ให้บันทึก warning log แล้ว **fallback กลับไปใช้อันดับ Top-5 จาก Hybrid RRF (ที่ผ่าน ACL Pre-Filter แล้ว)** ทันที เพื่อรักษาความพร้อมใช้งานของระบบโดยไม่กระทบความปลอดภัย",
      ],
      analogy: "เหมือนสายพานคัดผลไม้ที่มีกล้อง AI ตรวจละเอียดตรงปลายทาง — ถ้ากล้องขัดข้องชั่วคราว สายพานยังส่งผลไม้ชุดที่ผ่านการคัดขนาดเบื้องต้นแล้วต่อไปได้ แทนที่จะสั่งหยุดโรงงานทั้งหมด",
      code: {
        language: "python",
        filename: "reranker_fallback.py",
        code: `from typing import Protocol


class RerankerProtocol(Protocol):
    def score(self, query: str, texts: list[str]) -> list[float]: ...


def rerank_with_fallback(
    query: str,
    candidates: list[dict],
    reranker: RerankerProtocol,
    top_n: int = 5,
) -> tuple[list[dict], bool]:
    """คืน (top_n_chunks, used_reranker) — ถ้า reranker ล้มเหลวให้ใช้ลำดับ RRF เดิม"""
    if not candidates:
        return [], False
    try:
        scores = reranker.score(query, [c["text"] for c in candidates])
        if len(scores) != len(candidates):
            raise ValueError("reranker score count mismatch")
        ranked = sorted(
            zip(candidates, scores, strict=True),
            key=lambda pair: (-pair[1], pair[0]["chunk_id"]),
        )
        return [c for c, _ in ranked[:top_n]], True
    except (TimeoutError, RuntimeError, ValueError):
        return candidates[:top_n], False`,
        caption: "Fallback Pattern ที่ปลอดภัย: แม้ Reranker จะ Timeout แต่อันดับสำรองก็ยังเป็นข้อมูลที่ผ่าน ACL Pre-Filter มาแล้ว",
      },
      whyTitle: "Why this matters — ทดสอบได้เร็ว 100% บนเครื่องและทนทานใน Production",
      whyParagraphs: [
        "การใช้ `Protocol` แยกอินเทอร์เฟซของ Reranker ทำให้ทีมเขียน unit test ทั้ง happy path และ timeout fallback ได้โดยไม่ต้องโหลดโมเดลขนาดหลายร้อย MB ทุกครั้งที่รัน `pytest`",
        "แนวคิดเดียวกันนี้จะถูกนำไปทดสอบจริงในการซ้อม load & failure test ช่วงสัปดาห์สุดท้าย (Block B45) ด้วย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก RBAC Middleware + Secondary Sort สู่ ACL Rerank",
      body: [
        "ใน Web Backend คุณไม่ดึงข้อมูลทุก user จาก SQL มาทั้งตารางแล้วค่อย `.filter()` ใน JavaScript/Python เพราะช้าและเสี่ยงข้อมูลหลุด — คุณใส่ `WHERE tenant_id = ?` ตั้งแต่ใน SQL Query แล้วค่อยจัดเรียงผลลัพธ์อย่างละเอียดก่อนส่ง JSON",
      ],
      table: [
        ["ACL Pre-Filter (`tenant_id`, `roles`)", "SQL `WHERE tenant_id = $1 AND role = ANY($2)`"],
        ["Hybrid RRF (`candidate_k=20`)", "Query ดึงผู้สมัคร Top-20 ที่ผ่านสิทธิ์แล้ว"],
        ["Cross-Encoder Reranker", "Secondary Scoring Function จัดอันดับ 20 ชิ้นสุดท้าย"],
        ["Timeout Fallback to RRF", "Graceful Degradation เมื่อ Downstream Microservice ช้า"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมแค่เช็กสิทธิ์หลัง LLM ตอบเสร็จถึงสายเกินไป",
      body: [
        "บางคนคิดว่าถ้า LLM ตอบข้อมูลลับออกมาค่อยตรวจลบทีหลังก็ได้ แต่ความจริงคือ **ถ้าเอกสารลับถูกส่งเข้า Prompt ไปแล้ว** โมเดลอาจเอาตัวเลขหรือข้อเท็จจริงจากเอกสารลับมาปนในประโยคสรุปโดยไม่อ้างชื่อไฟล์ ทำให้ตรวจจับทีหลังยากมาก",
        "การทำ **ACL Pre-Filter ก่อนการค้นหา** จึงเป็นการปิดประตูไม่ให้ข้อมูลข้ามสิทธิ์เข้าไปใกล้โมเดลตั้งแต่แรก ปลอดภัยกว่า 100%",
      ],
    },
  },

  workedExample: {
    intro:
      "มาสร้างท่อค้นหา 2 จังหวะแบบเต็ม: เริ่มจาก ACL Pre-Filter ที่กันเอกสาร HR/ข้าม Tenant ออกก่อน → จำลอง Hybrid Candidate Top-20 → ใช้ Cross-Encoder Reranker จัดอันดับใหม่ และทดสอบจังหวะ Timeout Fallback กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · สร้างโครงสร้างข้อมูล UserContext และ ACL Pre-Filter",
        explain:
          "กำหนดข้อมูลสิทธิ์ผู้ใช้ (`tenant_id`, `roles`) และกรองคลังเอกสารจำลองก่อนเข้าขั้นตอนจัดอันดับใด ๆ",
        code: {
          language: "python",
          filename: "worked_rerank_acl.py",
          code: `from pydantic import BaseModel, Field


class UserContext(BaseModel):
    user_id: str
    tenant_id: str = Field(min_length=1)
    roles: list[str] = Field(min_length=1)


def prefilter_chunks(chunks: list[dict], user: UserContext, doc_type: str | None = None) -> list[dict]:
    user_roles = set(user.roles)
    return [
        c for c in chunks
        if c["tenant_id"] == user.tenant_id
        and (set(c["allowed_roles"]) & user_roles)
        and (doc_type is None or c.get("doc_type") == doc_type)
    ]`,
        },
      },
      {
        title: "2 · จำลอง Cross-Encoder Reranker และทดสอบจังหวะจัดอันดับใหม่",
        explain:
          "ให้ Reranker อ่านคำถาม `\"สินค้าลดราคาคืนได้ไหม\"` เทียบกับ chunk 2 ชิ้น: ชิ้นที่พูดถึงเงื่อนไขสินค้าลดราคาโดยตรงจะได้คะแนนสูงกว่าชิ้นที่พูดถึงนโยบายคืนสินค้าทั่วไป",
        code: {
          language: "python",
          filename: "worked_rerank_acl.py",
          code: `class HeuristicMockReranker:
    def score(self, query: str, texts: list[str]) -> list[float]:
        # จำลอง Cross-Encoder ที่ให้คะแนนสูงเมื่อพบคู่เงื่อนไขและคำสำคัญพร้อมกัน
        q_words = [w for w in ("สินค้าลดราคา", "คืน", "7 วัน", "ยกเว้น") if w in query]
        scores: list[float] = []
        for text in texts:
            hits = sum(1 for w in q_words if w in text)
            bonus = 0.5 if ("ยกเว้น" in text and "สินค้าลดราคา" in text) else 0.0
            scores.append(round(hits / max(1, len(q_words)) + bonus, 3))
        return scores


corpus = [
    {"chunk_id": "hr-sal", "tenant_id": "acme", "allowed_roles": ["hr"], "doc_type": "hr", "text": "ตารางโบนัสและเงินเดือนผู้บริหาร"},
    {"chunk_id": "other-t", "tenant_id": "beta", "allowed_roles": ["support"], "doc_type": "policy", "text": "สินค้าลดราคาของ Beta คืนได้"},
    {"chunk_id": "pol-gen", "tenant_id": "acme", "allowed_roles": ["support"], "doc_type": "policy", "text": "นโยบายการคืนสินค้าภายใน 7 วัน"},
    {"chunk_id": "pol-exc", "tenant_id": "acme", "allowed_roles": ["support"], "doc_type": "policy", "text": "สินค้าลดราคา ยกเว้นไม่รับคืนทุกกรณี"},
]

user = UserContext(user_id="u-01", tenant_id="acme", roles=["support"])
authorized = prefilter_chunks(corpus, user, doc_type="policy")
reranker = HeuristicMockReranker()
scores = reranker.score("สินค้าลดราคาคืนได้ไหม", [c["text"] for c in authorized])
ranked = sorted(zip(authorized, scores), key=lambda x: -x[1])
print("Authorized:", [c["chunk_id"] for c in authorized])
print("Reranked  :", [(c["chunk_id"], s) for c, s in ranked])`,
        },
        output: `Authorized: ['pol-gen', 'pol-exc']
Reranked  : [('pol-exc', 1.5), ('pol-gen', 0.5)]`,
      },
      {
        title: "3 · ทดสอบ Fallback เมื่อ Reranker เกิด TimeoutError",
        explain:
          "จำลองเหตุการณ์ที่ Reranker API ช้าเกินงบแล้วโยน `TimeoutError` — ระบบต้องคืนผลจาก `authorized` (ลำดับ RRF เดิม) โดยไม่ล่ม และไม่หลุดเอกสาร `hr-sal` หรือ `other-t` ออกมาเด็ดขาด",
        code: {
          language: "python",
          filename: "worked_rerank_acl.py",
          code: `class FailingReranker:
    def score(self, query: str, texts: list[str]) -> list[float]:
        raise TimeoutError("reranker exceeded 400ms budget")


try:
    FailingReranker().score("สินค้าลดราคาคืนได้ไหม", [c["text"] for c in authorized])
    final_ids, reranked_flag = [], True
except TimeoutError:
    final_ids, reranked_flag = [c["chunk_id"] for c in authorized[:5]], False

print(f"fallback_used={not reranked_flag} | safe_ids={final_ids}")`,
        },
        output: `fallback_used=True | safe_ids=['pol-gen', 'pol-exc']`,
      },
    ],
    gotcha:
      "จุดสังเกต: ลำดับการทำงานต้องเป็น **Pre-Filter ACL → Hybrid Search (`candidate_k=20`) → Rerank → Top-5** เสมอ อย่าทำกลับกันเป็น Hybrid Search ก่อนแล้วค่อย Filter ตอนท้าย มิฉะนั้นเมื่อผู้ใช้ไม่มีสิทธิ์ใน 20 อันดับแรก ผลลัพธ์จะว่างเปล่าทั้งที่ยังมีเอกสารที่เข้าถึงได้อยู่ในคลัง",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/rerank_acl.py` สำหรับจัดการสิทธิ์ `UserContext` / `SearchFilter` (Pre-Filtering) ร่วมกับ `CrossEncoderReranker` และกลไก Timeout Fallback ให้พร้อมเชื่อมต่อเข้ากับ Hybrid Search ของ Block B41",
    requirements: [
      "`UserContext(BaseModel)` — `user_id: str`, `tenant_id: str` (ไม่ว่าง), `roles: list[str]` (อย่างน้อย 1 role)",
      "`SearchFilter(BaseModel)` — `doc_type: str | None = None`, `lang: str | None = None`, `only_active: bool = True`",
      "`prefilter_chunks(chunks: list[dict], user: UserContext, flt: SearchFilter | None = None) -> list[dict]` — คืนเฉพาะ chunk ที่ `tenant_id` ตรงกับ `user.tenant_id`, มี role ทับซ้อนกับ `user.roles` อย่างน้อย 1 ตัว, และตรงกับ `SearchFilter` (`only_active` ตรวจว่า `chunk.get(\"active\", True)` เป็น `True`)",
      "`Reranker` (Protocol ที่มีเมธอด `score(self, query: str, texts: list[str]) -> list[float]`) และ `LexicalCrossReranker` ที่คำนวณคะแนนแบบ deterministic (ให้คะแนนสัดส่วนการพบคำ/bigram จาก `query` ใน `text`) พร้อมคืนผลลัพธ์เป็น `SearchResult(BaseModel)` (`items: list[dict]`, `reranked: bool`, `fallback_reason: str | None`)",
      "`retrieve_and_rerank(query: str, chunks: list[dict], user: UserContext, retriever_fn: Callable[[str, list[dict], int], list[dict]], reranker: Reranker, flt: SearchFilter | None = None, candidate_k: int = 20, top_n: int = 5) -> SearchResult` — ต้องเรียก `prefilter_chunks` **ก่อน** ส่งเข้า `retriever_fn` และหาก `reranker.score` โยน `TimeoutError` หรือ `RuntimeError` ให้ fallback ใช้อันดับจาก `retriever_fn` พร้อมตั้ง `reranked=False` และระบุ `fallback_reason`",
    ],
    starter: {
      language: "python",
      filename: "src/rerank_acl.py",
      code: `from typing import Callable, Protocol
from pydantic import BaseModel, Field


class UserContext(BaseModel):
    user_id: str
    tenant_id: str = Field(min_length=1)
    roles: list[str] = Field(min_length=1)


class SearchFilter(BaseModel):
    doc_type: str | None = None
    lang: str | None = None
    only_active: bool = True


class SearchResult(BaseModel):
    items: list[dict]
    reranked: bool
    fallback_reason: str | None = None


class Reranker(Protocol):
    def score(self, query: str, texts: list[str]) -> list[float]: ...


def prefilter_chunks(
    chunks: list[dict],
    user: UserContext,
    flt: SearchFilter | None = None,
) -> list[dict]:
    # TODO: enforce tenant, role intersection, and optional metadata filters
    raise NotImplementedError


class LexicalCrossReranker:
    def score(self, query: str, texts: list[str]) -> list[float]:
        # TODO: deterministic cross-scoring between query terms and each candidate text
        raise NotImplementedError


def retrieve_and_rerank(
    query: str,
    chunks: list[dict],
    user: UserContext,
    retriever_fn: Callable[[str, list[dict], int], list[dict]],
    reranker: Reranker,
    flt: SearchFilter | None = None,
    candidate_k: int = 20,
    top_n: int = 5,
) -> SearchResult:
    # TODO: prefilter -> retrieve(candidate_k) -> rerank(top_n) with Timeout/Runtime fallback
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_rerank_acl.py",
      code: `from src.rerank_acl import (
    LexicalCrossReranker,
    SearchFilter,
    UserContext,
    prefilter_chunks,
    retrieve_and_rerank,
)


def _sample_chunks() -> list[dict]:
    return [
        {"chunk_id": "hr-1", "tenant_id": "acme", "allowed_roles": ["hr"], "doc_type": "hr", "lang": "th", "active": True, "text": "ฐานเงินเดือนฝ่ายบริหาร"},
        {"chunk_id": "beta-1", "tenant_id": "beta", "allowed_roles": ["support"], "doc_type": "policy", "lang": "th", "active": True, "text": "คืนสินค้าลดราคาได้ภายใน 30 วัน"},
        {"chunk_id": "old-1", "tenant_id": "acme", "allowed_roles": ["support"], "doc_type": "policy", "lang": "th", "active": False, "text": "นโยบายเก่าปี 2022"},
        {"chunk_id": "pol-1", "tenant_id": "acme", "allowed_roles": ["support", "sales"], "doc_type": "policy", "lang": "th", "active": True, "text": "นโยบายคืนสินค้าทั่วไปภายใน 7 วัน"},
        {"chunk_id": "pol-2", "tenant_id": "acme", "allowed_roles": ["support"], "doc_type": "policy", "lang": "th", "active": True, "text": "ยกเว้นสินค้าลดราคาไม่รับคืน"},
    ]


def test_prefilter_enforces_tenant_role_and_active_flag():
    user = UserContext(user_id="u1", tenant_id="acme", roles=["support"])
    allowed = prefilter_chunks(_sample_chunks(), user, SearchFilter(doc_type="policy", only_active=True))
    assert [c["chunk_id"] for c in allowed] == ["pol-1", "pol-2"]


def test_retrieve_and_rerank_prefilters_before_retriever_call():
    seen_by_retriever: list[str] = []

    def mock_retriever(q: str, pool: list[dict], k: int) -> list[dict]:
        seen_by_retriever.extend(c["chunk_id"] for c in pool)
        return pool[:k]

    user = UserContext(user_id="u1", tenant_id="acme", roles=["support"])
    res = retrieve_and_rerank(
        query="สินค้าลดราคา ไม่รับคืน",
        chunks=_sample_chunks(),
        user=user,
        retriever_fn=mock_retriever,
        reranker=LexicalCrossReranker(),
        flt=SearchFilter(doc_type="policy"),
        candidate_k=20,
        top_n=2,
    )
    assert "hr-1" not in seen_by_retriever and "beta-1" not in seen_by_retriever
    assert res.reranked is True
    assert res.items[0]["chunk_id"] == "pol-2"


def test_rerank_timeout_falls_back_gracefully_to_retriever_order():
    class SlowReranker:
        def score(self, query: str, texts: list[str]) -> list[float]:
            raise TimeoutError("reranker timed out")

    user = UserContext(user_id="u1", tenant_id="acme", roles=["support"])
    res = retrieve_and_rerank(
        query="คืนสินค้า",
        chunks=_sample_chunks(),
        user=user,
        retriever_fn=lambda q, pool, k: pool[:k],
        reranker=SlowReranker(),
        flt=SearchFilter(doc_type="policy"),
        top_n=2,
    )
    assert res.reranked is False
    assert res.fallback_reason is not None
    assert [c["chunk_id"] for c in res.items] == ["pol-1", "pol-2"]


def test_empty_authorized_pool_returns_empty_without_calling_reranker():
    class ShouldNotRun:
        def score(self, query: str, texts: list[str]) -> list[float]:
            raise AssertionError("reranker should not be called on empty pool")

    user = UserContext(user_id="u9", tenant_id="gamma", roles=["guest"])
    res = retrieve_and_rerank(
        query="คืนสินค้า",
        chunks=_sample_chunks(),
        user=user,
        retriever_fn=lambda q, pool, k: pool[:k],
        reranker=ShouldNotRun(),
    )
    assert res.items == []
    assert res.reranked is False
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_rerank_acl.py` แล้วผ่านครบทุก test cases",
      "ตรวจว่า `mock_retriever` ไม่เคยเห็นเอกสารของ `hr` หรือ `beta` เพราะถูก `prefilter_chunks` กรองทิ้งตั้งแต่แรก",
      "ทดสอบจำลอง `TimeoutError` จาก Reranker และยืนยันว่าระบบคืนอันดับ RRF ที่ปลอดภัยพร้อม `reranked=False`",
      "รัน `uv run ruff check .` แล้วไม่มี lint error",
    ],
    acceptance: "ผ่านทุก test cases ด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `retrieve_and_rerank` ให้เรียก `pool = prefilter_chunks(chunks, user, flt)` เป็นบรรทัดแรกสุด ถ้า `pool` ว่างให้คืน `SearchResult(items=[], reranked=False, fallback_reason=\"no_authorized_chunks\")` ทันทีโดยไม่ต้องเรียก `reranker`",
      },
      {
        body: "ใน `LexicalCrossReranker.score` ให้แยกคำใน `query` ด้วย `query.lower().split()` แล้วนับสัดส่วนคำที่ปรากฏใน `text.lower()` (และเพิ่มโบนัสเล็กน้อยถ้ามีคำซ้ำตรงกันหลายคำ) เพื่อให้ผลลัพธ์ deterministic",
      },
      {
        body: "โครงของ `retrieve_and_rerank` ที่ครอบคลุมทั้ง Pre-Filter, Empty Pool Early Return และ Timeout Fallback",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def retrieve_and_rerank(
    query: str,
    chunks: list[dict],
    user: UserContext,
    retriever_fn: Callable[[str, list[dict], int], list[dict]],
    reranker: Reranker,
    flt: SearchFilter | None = None,
    candidate_k: int = 20,
    top_n: int = 5,
) -> SearchResult:
    authorized_pool = prefilter_chunks(chunks, user, flt)
    if not authorized_pool:
        return SearchResult(items=[], reranked=False, fallback_reason="empty_authorized_pool")

    candidates = retriever_fn(query, authorized_pool, candidate_k)
    if not candidates:
        return SearchResult(items=[], reranked=False, fallback_reason="empty_candidates")

    try:
        scores = reranker.score(query, [c["text"] for c in candidates])
        ranked = sorted(
            zip(candidates, scores, strict=True),
            key=lambda pair: (-pair[1], pair[0]["chunk_id"]),
        )
        return SearchResult(items=[c for c, _ in ranked[:top_n]], reranked=True)
    except (TimeoutError, RuntimeError) as exc:
        return SearchResult(
            items=candidates[:top_n],
            reranked=False,
            fallback_reason=str(exc) or exc.__class__.__name__,
        )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_rerank_acl.py
uv run ruff check .`,
      caption: "ตรวจสอบ ACL Pre-Filtering, Reranking และ Fallback บนเครื่องของคุณ",
    },
  },

  mistakes: [
    {
      title: "ทำ ACL Post-Filtering หลังดึง Top-5 หรือ Top-20 มาแล้ว",
      symptom: "ผู้ใช้ไม่มีผลลัพธ์เลย (`0 chunks`) เพราะเอกสาร Top-5 ของคลังรวมเป็นของแผนกอื่นหมด หรือแย่กว่านั้นคือเผลอส่งข้อมูลข้าม tenant ใน path อื่น",
      fix: "ทำ **Pre-Filtering** (`WHERE tenant_id = ... AND allowed_roles && ...`) ในชั้น Vector/BM25 DB ก่อนคิดคะแนนเสมอ",
    },
    {
      title: "ส่งเอกสารทั้งคลัง (10,000 chunks) เข้า Cross-Encoder Reranker",
      symptom: "API ค้างนานหลายสิบวินาทีจน timeout เพราะ Cross-Encoder ต้องรัน Transformer inference แยกทีละคู่ `(query, chunk)`",
      fix: "ใช้ Bi-Encoder + BM25 RRF คัดหยาบลงมาเหลือ `candidate_k = 20` ก่อน แล้วค่อยใช้ Cross-Encoder คัดละเอียดเหลือ Top-5",
    },
    {
      title: "ไม่ทำ Fallback เมื่อ Reranker เกิด Timeout หรือ Error",
      symptom: "เมื่อ Reranker service ช้าหรือล่ม ผู้ช่วย AI ล่มทั้งคำขอ (HTTP 500) ทั้งที่ Hybrid RRF หาเอกสารเจอแล้ว",
      fix: "ครอบการเรียก {{reranker}} ด้วย timeout + try/except เพื่อถอยกลับไปใช้ลำดับ {{rrf}} ที่ผ่าน {{acl}} แล้วอย่างปลอดภัย",
    },
    {
      title: "ลืมฟิลด์ `active` / `effective_date` ใน Metadata Filter",
      symptom: "ระบบตอบคำถามจากนโยบายเก่าปี 2022 ที่ถูกยกเลิกไปแล้วแทนที่จะอ้างอิงฉบับล่าสุดปี 2026",
      fix: "เพิ่ม `only_active=True` (หรือช่วงวันที่มีผลบังคับใช้) ลงใน `SearchFilter` ของ Pre-Filter ทุกคำขอ",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d163-q1",
        "ทำไมการทำ **ACL Pre-Filtering** จึงดีกว่า **Post-Filtering** ทั้งในแง่ความปลอดภัยและความครบถ้วนของผลลัพธ์?",
        [
          ["เพราะ Pre-Filtering กรองสิทธิ์ตั้งแต่ใน Query ก่อนจัดอันดับ จึงไม่เสี่ยงรั่วข้อมูลข้าม tenant และไม่เกิดปัญหา Top-5 ว่างเปล่าเพราะโดนกรองทิ้งหลังค้นหา", "ถูก — Pre-Filtering รับประกันว่าผลที่เข้า RRF และ Rerank มีเฉพาะเอกสารที่ผู้ใช้มีสิทธิ์จริงเท่านั้น"],
          ["เพราะ Post-Filtering ใช้กับ Cross-Encoder ไม่ได้ในภาษา Python", "เขียนโค้ด Post-Filtering ใน Python ได้ แต่มีข้อบกพร่องเชิงสถาปัตยกรรมเรื่อง recall หล่นและความเสี่ยง data leakage"],
          ["เพราะ Pre-Filtering ช่วยให้ไม่ต้องทำ Embedding เอกสารใหม่", "ไม่เกี่ยวกับการสร้าง Embedding — แต่เกี่ยวข้องกับขั้นตอน Query Time"],
          ["เพราะ Pre-Filtering ทำให้ LLM ไม่ต้องใช้ System Prompt", "ยังคงต้องใช้ System Prompt และ Guardrails ตามปกติ"],
        ],
        "A",
        "Pre-Filtering ที่ชั้น Vector/BM25 DB ป้องกันทั้งการดึงข้อมูลข้ามสิทธิ์มาสิ้นเปลืองโควตา Top-k และการหลุดข้อมูลเข้า pipeline หรือ trace log",
        "ACL Pre-Filtering ต่างจาก Post-Filtering อย่างไร และทำไมจึงเป็นมาตรฐานของ Enterprise RAG?",
        "Pre-Filtering กรอง `tenant_id`/`allowed_roles` ก่อนคำนวณคะแนน Vector/BM25 จึงไม่เสียโควตา Top-k ให้เอกสารที่ไม่มีสิทธิ์และป้องกัน data leakage ก่อนถึง Reranker/LLM",
      ),
      mc(
        "d163-q2",
        "ความแตกต่างหลักระหว่าง **Bi-Encoder** (ที่ใช้วันที่ 162) กับ **Cross-Encoder Reranker** (วันนี้) คืออะไร?",
        [
          ["Bi-Encoder แปลง query และ chunk เป็นเวกเตอร์แยกกันเพื่อค้นหาเร็วมาก ส่วน Cross-Encoder อ่านคู่ `(query, chunk)` พร้อมกันจึงแม่นกว่าแต่ช้ากว่า", "ถูก — นี่คือเหตุผลที่เราใช้ 2 จังหวะ: Bi-Encoder/BM25 คัด Top-20 แล้วให้ Cross-Encoder คัด Top-5"],
          ["Cross-Encoder ใช้สร้าง index ล่วงหน้าได้เหมือน HNSW จึงเร็วกว่า Bi-Encoder", "ตรงข้าม — Cross-Encoder ไม่สามารถคำนวณเวกเตอร์แยกเก็บล่วงหน้าได้ เพราะต้องอ่าน query คู่กับ chunk ณ เวลานั้น"],
          ["Bi-Encoder รองรับภาษาไทย ส่วน Cross-Encoder อ่านได้เฉพาะภาษาอังกฤษ", "Cross-Encoder รุ่น multilingual (เช่น `bge-reranker-v2-m3`) รองรับภาษาไทยได้ดีมาก"],
          ["Cross-Encoder ใช้แทนฐานข้อมูล PostgreSQL/Qdrant ได้โดยตรง", "Reranker ไม่ใช่ฐานข้อมูลจัดเก็บเอกสาร"],
        ],
        "A",
        "Bi-Encoder เหมาะกับการค้นหาทั้งคลังอย่างรวดเร็วผ่าน ANN/HNSW ส่วน Cross-Encoder เหมาะกับการจัดอันดับละเอียดใน candidate กลุ่มเล็ก (Top-20)",
        "อธิบายความต่างและบทบาทของ Bi-Encoder เทียบกับ Cross-Encoder Reranker ในระบบค้นหา 2 จังหวะ",
        "Bi-Encoder แปลง query กับ chunk แยกกัน (เร็วมาก เหมาะดึง Top-20 จากทั้งคลัง); Cross-Encoder อ่านคู่ (query, chunk) พร้อมกัน (แม่นกว่ามาก เหมาะจัดอันดับ Top-20 เหลือ Top-5)",
      ),
      mc(
        "d163-q3",
        "หาก Cross-Encoder Reranker เกิด `TimeoutError` ใน Production วิธีรับมือใดปลอดภัยและเสถียรที่สุด?",
        [
          ["ปิด ACL Pre-Filter แล้วลองค้นใหม่อีกรอบ", "ห้ามปิด ACL เด็ดขาด — นั่นคือช่องโหว่ความปลอดภัยร้ายแรง"],
          ["ถอยกลับไปใช้ผลการจัดอันดับ Top-5 จาก Hybrid RRF ที่ผ่าน ACL Pre-Filter แล้ว พร้อมบันทึก log", "ถูก — ผู้ใช้ยังได้คำตอบที่ปลอดภัยและตรงประเด็นโดยระบบไม่ล่ม"],
          ["ส่งเอกสารทุกชิ้นในฐานข้อมูลเข้า Prompt ของ LLM แทน", "ทำ Context Overflow และเปิดช่องข้อมูลรั่วไหล"],
          ["ให้ LLM ตอบจากความจำล้วน ๆ โดยไม่บอกผู้ใช้", "เพิ่มความเสี่ยงอาการหลอน (Hallucination) และละเมิด Groundedness"],
        ],
        "B",
        "เพราะ Hybrid RRF ให้ลำดับที่ดีระดับหนึ่งอยู่แล้วและผ่าน ACL Pre-Filter มาเรียบร้อย การ fallback มาใช้อันดับ RRF จึงช่วยรักษา uptime และ SLA latency ได้อย่างปลอดภัย",
        "หาก Reranker เกิด Timeout ใน Production ระบบควร Fallback อย่างไร?",
        "บันทึก log แล้วถอยกลับมาใช้ผล Top-5 จาก Hybrid RRF ที่ผ่าน ACL Pre-Filter แล้วทันที เพื่อให้ระบบตอบกลับได้ภายใน SLA โดยไม่ละเมิดสิทธิ์ผู้ใช้",
      ),
      mc(
        "d163-q4",
        "พนักงานแผนก Sales ส่งคำถามว่า *\"ขอดูโครงสร้างเงินเดือนและโบนัสผู้บริหาร\"* (ซึ่งมีแท็ก `allowed_roles=[\"hr\"]`) ถ้าระบบของเราทำ ACL Pre-Filtering ถูกต้อง จะเกิดอะไรขึ้น?",
        [
          ["ระบบดึงเอกสารเงินเดือนเข้า LLM แล้วเขียนคำเตือนใน System Prompt ว่าห้ามตอบ", "เสี่ยงถูก Prompt Injection หลอกให้เปิดเผยข้อมูลที่อยู่ใน Context"],
          ["ชั้น Pre-Filter ตัดเอกสาร `hr` ออกตั้งแต่ก่อนค้นหา ทำให้ `authorized_pool` ว่าง และระบบตอบปฏิเสธอย่างปลอดภัย", "ถูก — ข้อมูลลับไม่เคยเข้าใกล้ขั้นตอน Rerank หรือ Prompt ของ LLM เลย"],
          ["Reranker จะให้คะแนนเอกสารเงินเดือนสูงขึ้นเพราะตรงคำค้น", "Reranker ไม่มีสิทธิ์เห็นเอกสารนั้นด้วยซ้ำ เพราะถูก Pre-Filter ตัดออกก่อนแล้ว"],
          ["ระบบสร้างข้อมูลเงินเดือนสมมติขึ้นมาตอบแทน", "ผิดหลัก Abstention และ Groundedness"],
        ],
        "B",
        "การป้องกันที่ชั้นข้อมูล (ACL Pre-Filter) ทำให้ข้อมูลที่ไม่มีสิทธิ์ไม่เข้าสู่ Context ของ LLM เลย นี่คือหลัก Defense-in-Depth ที่แข็งแรงกว่าการห้ามใน Prompt",
        "ทำไมการบังคับ ACL Pre-Filter ก่อน LLM จึงป้องกันการรั่วไหลข้อมูลได้ดีกว่าการสั่งห้ามใน System Prompt?",
        "เพราะเอกสารที่ไม่มีสิทธิ์ถูกตัดออกตั้งแต่ชั้นฐานข้อมูล/Retrieval จึงไม่เคยถูกส่งเข้าไปอยู่ใน Prompt ของ LLM ทำให้แม้ถูก Prompt Injection ก็ไม่มีข้อมูลลับให้รั่วออกมา",
      ),
    ],
  },

  takeaways: [
    "บังคับใช้ **ACL Pre-Filtering** (`tenant_id`, `allowed_roles`, `doc_type`, `active`) ก่อนทำ Hybrid Search และ Reranking เสมอ เพื่อกัน {{data-leakage}} และปัญหาผลลัพธ์ว่าง",
    "ใช้สถาปัตยกรรม 2 จังหวะ: Hybrid {{rrf}} (`Top-20`) → Cross-Encoder {{reranker}} (`Top-5`) เพื่อดันทั้ง `Recall@5` และ {{mrr}}",
    "ออกแบบ `Reranker` ผ่าน Protocol ที่ทดสอบแบบ offline ได้ และมี **Timeout Fallback** กลับไปยังลำดับ RRF อย่างปลอดภัย",
    "จบ Block B41 คุณมี **Hybrid Retrieval Module** ครบชุด พร้อมเข้าสู่ Milestone 2 Benchmark (`Recall@5 >= 0.85`) ใน Day 164",
  ],

  reviewCards: [
    rc(
      "d163-rc-1",
      "ลำดับการไหลของข้อมูลที่ถูกต้องในท่อค้นหาปลอดภัย 2 จังหวะคืออะไร?",
      "ACL & Metadata Pre-Filter (`tenant_id`, `allowed_roles`, `active`) → Hybrid Search (BM25 + Dense RRF `Top-20`) → Cross-Encoder Reranker (`Top-5`) — และมี Timeout Fallback กลับไปใช้ลำดับ RRF",
    ),
    rc(
      "d163-rc-2",
      "เหตุใดไม่ควรนำ Cross-Encoder Reranker ไปรันกับเอกสารทั้งคลัง?",
      "เพราะ Cross-Encoder ต้องประมวลผลคู่ `(query, chunk)` ผ่าน Transformer ทีละคู่ ซึ่งช้าเกินไปสำหรับการค้นทั้งคลัง จึงต้องให้ Hybrid Bi-Encoder/BM25 คัดเหลือ Top-20 ก่อน",
    ),
    rc(
      "d163-rc-3",
      "การทำ Post-Filtering (กรองสิทธิ์หลังดึง Top-5) ก่อให้เกิดปัญหาอะไร 2 ข้อ?",
      "1) Recall ตก/ได้ผลลัพธ์ 0 ชิ้นหาก Top-5 เป็นเอกสารที่ผู้ใช้ไม่มีสิทธิ์ทั้งหมด และ 2) เสี่ยง Data Leakage หากข้อมูลข้ามสิทธิ์หลุดเข้าไปใน trace log หรือ fallback path",
    ),
  ],

  sources: [
    { label: "Sentence-Transformers — Retrieve & Re-Rank (Cross-Encoders)", href: "https://www.sbert.net/examples/applications/retrieve_rerank/README.html" },
    { label: "BAAI/bge-reranker-v2-m3 — Multilingual Cross-Encoder", href: "https://huggingface.co/BAAI/bge-reranker-v2-m3" },
    { label: "Qdrant Documentation — Payload Filtering", href: "https://qdrant.tech/documentation/concepts/filtering/" },
    { label: "OWASP Top 10 for LLM Applications — Sensitive Information Disclosure", href: "https://genai.owasp.org/llm-top-10/" },
  ],

  glossary: ["reranker", "acl", "top-k", "rrf", "bm25", "mrr", "pdpa", "data-leakage", "rag", "abstention"],
});
