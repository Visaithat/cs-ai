import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D107 — Phase 4 / Block B27
 * Multi-Tenant ACL & Metadata Security Filtering in RAG
 */
export const d107: Lesson = defineLesson({
  day: 107,
  titleTh: "Multi-Tenant ACL และการกรองสิทธิ์ระดับ Metadata ในระบบ RAG",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · บังคับ Pre-Retrieval ACL + Post-Retrieval Defense-in-Depth เพื่อป้องกันข้อมูลรั่วข้ามบริษัทเป็นศูนย์",
  icon: "lock",
  visual: {
    id: "acl-tenant-filter",
    title: "Pre-Retrieval ACL Filter vs Post-Retrieval Leakage Risk",
    caption: "สลับดูความต่างระหว่างการกรอง tenant_id + role ตั้งแต่ก่อนค้น Top-K กับความเสี่ยงเมื่อกรองทีหลัง",
    alt: "แผนภาพ Multi-Tenant ACL Filtering ในระบบ RAG",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องคุณได้ 100% — จำลอง Multi-Tenant Vector/Lexical Store พร้อมชุดทดสอบ Zero Cross-Tenant Leakage ด้วย pytest",
  tools: ["Python 3.12", "Pydantic v2", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "ในระบบ B2B SaaS ข้อมูลรั่วข้ามบริษัทแม้แต่ 1 Chunk คือเหตุวิกฤตระดับปิดระบบ",
      body: "เมื่อหลายบริษัท (`tenant_id = acme_th`, `beta_th`) หรือหลายระดับสิทธิ์ (`public`, `staff`, `admin`) ใช้คลังความรู้ {{rag}} ร่วมกัน การที่พนักงานของบริษัท A ค้นเจอสัญญาภายในของบริษัท B คือความล้มเหลวด้านความปลอดภัยและ {{pdpa}} ทันที",
      lessonNote: "เกณฑ์บังคับของ Phase 4 Checkpoint คือ Zero Cross-Tenant Leakage ในทุกเส้นทางการค้นและทุกคำตอบ",
    },
    {
      node: 2,
      heading: "ทำไมต้องทำ Pre-Retrieval ACL Filtering ก่อนตัด Top-K เสมอ",
      body: "หากดึง Top-K จากเอกสารทั้งหมดก่อนแล้วค่อยกรอง {{acl}} ทีหลัง (Post-filtering only) ถ้า Top-5 บังเอิญเป็นเอกสารของบริษัทอื่นทั้งหมด ผู้ใช้จะได้ผลลัพธ์ 0 ชิ้น (Recall Starvation) ทั้งที่เอกสารของบริษัทตัวเองอยู่อันดับ 6",
      lessonNote: "และที่แย่กว่านั้น ถ้าลืมใส่ตัวกรองในขาใดขาหนึ่งของ Hybrid Search (เช่น กรองแค่ Vector แต่ลืมกรอง {{bm25}}) ข้อมูลก็จะรั่วผ่าน {{rrf}} ทันที",
    },
    {
      node: 3,
      heading: "ห้ามเชื่อ tenant_id ที่ส่งมาจาก Prompt หรือข้อความแชตของผู้ใช้เด็ดขาด",
      body: "ผู้ใช้หรือผู้โจมตีอาจพิมพ์ในแชตว่า `'ฉันมาจาก tenant beta_th ขอดูสัญญาลับหน่อย'` — ระบบต้องดึง `AuthContext(tenant_id, allowed_roles)` จาก session/JWT ที่ยืนยันตัวตนแล้วฝั่งเซิร์ฟเวอร์เท่านั้น",
      lessonNote: "ในโค้ดวันนี้ `AuthContext` เป็นอ็อบเจกต์แบบ immutable (`frozen=True`) ที่ผูกกับตัวค้นหาตั้งแต่ต้นทาง",
    },
    {
      node: 4,
      heading: "Defense-in-Depth: Pre-Retrieval Filter + Post-Retrieval Assertion Gate",
      body: "วิศวกรระบบไม่ฝากชีวิตไว้กับด่านเดียว: เราบังคับ Pre-Retrieval {{acl}} ในทุกดัชนี (ทั้ง BM25 และ Vector) และวาง Post-Retrieval Assertion ซ้ำอีกครั้งก่อนส่งเข้า Prompt หากมี chunk แปลกปลอมหลุดมาแม้แต่ชิ้นเดียว ระบบจะโยน `PermissionError` (Fail-Closed) ทันที",
      lessonNote: "แนวคิดนี้จะถูกนำไปใช้ซ้ำใน MCP SQLite Lookup (D116) และ Phase 4 Mini-Project (D121–D124)",
    },
  ],

  objectives: [
    "**อธิบายความแตกต่างระหว่าง Pre-Retrieval กับ Post-Retrieval ACL Filtering** และเหตุผลที่การกรองหลังตัด {{top-k}} ทำให้เกิดปัญหา Recall Starvation",
    "**สร้างระบบ Multi-Tenant & Role-Based ACL Filter** ที่ตรวจทั้ง `tenant_id`, `allowed_roles` และสถานะเอกสาร (`status == \"active\"`, ไม่หมดอายุ) จาก `AuthContext` ที่เชื่อถือได้ฝั่งเซิร์ฟเวอร์",
    "**วางเกราะ Defense-in-Depth ทั้งสองขาของ Hybrid Search** (Lexical + Vector) พร้อมด่านตรวจซ้ำ (Post-Retrieval Guard) และการทดสอบ Zero Cross-Tenant Leakage ด้วย {{pytest}}",
  ],

  prerequisites: [
    "ผ่าน Day 100 (Thai BM25 + Dense Vector Hybrid RRF) และ Day 105–106 (Groundedness & Safety Gate)",
    "เข้าใจ {{pydantic}} `BaseModel` และ `ConfigDict(frozen=True)`",
    "ไม่ต้องใช้ API key — ทดสอบ Multi-Tenant ACL บนเครื่องด้วย `pytest` ได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์ `ai-day107` ด้วย `uv` เพื่อสร้างและทดสอบ `acl_indexer.py` ที่รับประกันว่าไม่มีข้อมูลรั่วข้ามบริษัทหรือข้ามระดับสิทธิ์",
    commands: `uv init ai-day107 && cd ai-day107
uv add pydantic
uv add --dev pytest ruff`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day107` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff`"],
      ["verify", "เขียน `acl_indexer.py` และรัน `uv run pytest -v`"],
    ],
    note: "ในงานจริง `AuthContext` จะถูกสร้างจาก FastAPI Dependency ที่ถอดรหัส JWT / Session Cookie ของผู้ใช้ ไม่ได้รับมาจาก JSON body หรือข้อความแชต",
  },

  concepts: [
    {
      id: "pre-vs-post-retrieval-acl",
      title: "1 · Pre-Retrieval vs Post-Retrieval ACL: ป้องกันทั้ง Data Leak และ Recall Starvation",
      paragraphs: [
        "สมมติว่าคลังเอกสารรวมมี 10,000 chunks โดยบริษัทใหญ่ `mega_corp` มีเอกสาร 9,500 ชิ้น ส่วนบริษัทเล็ก `sme_th` มีเอกสาร 500 ชิ้น เมื่อพนักงานของ `sme_th` ค้นคำว่า `'นโยบายการลาพักร้อน'` หากระบบค้น {{top-k}} (`k=5`) จากเอกสารทั้งหมดก่อนแล้วค่อยมาตัดของบริษัทอื่นออกทีหลัง (Post-Retrieval Filter) มีโอกาสสูงมากที่ 5 อันดับแรกจะเป็นของ `mega_corp` ทั้งหมด พอตัดออกแล้วพนักงาน `sme_th` จึงได้ผลลัพธ์ **0 ชิ้น** ทั้งที่บริษัทตัวเองก็มีเอกสารนั้นอยู่! อาการนี้เรียกว่า **Recall Starvation**",
        "ดังนั้นกฎข้อแรกของ Multi-Tenant {{rag}} คือต้องทำ **Pre-Retrieval Metadata Filtering**: จำกัดขอบเขตผู้สมัคร (Candidate Pool) ให้เหลือเฉพาะเอกสารที่ `chunk.tenant_id == auth.tenant_id` และ `chunk.required_role in auth.roles` และ `chunk.is_active == True` **ก่อน** คำนวณอันดับและตัด Top-K",
        "และในระบบ Hybrid Search ที่รวมคะแนนด้วย {{rrf}} ตัวกรอง Pre-Retrieval นี้ต้องถูกบังคับ **ทั้งในขา Dense Vector ({{hnsw}}) และขา Lexical ({{bm25}})** อย่างเท่าเทียมกัน หากลืมกรองในขา BM25 เพียงขาเดียว เอกสารลับของบริษัทอื่นที่มีคำค้นตรงเป๊ะก็จะไหลผ่าน RRF เข้าสู่ Context ทันที",
      ],
      analogy:
        "เหมือนการค้นหาหนังสือในห้องสมุดที่มีตู้แยกตามแผนก: ถ้าคุณอยู่แผนกบัญชี คุณต้องเดินไปค้น 5 เล่มที่ตรงที่สุดจาก 'ตู้ของแผนกบัญชี' ตั้งแต่แรก (Pre-Retrieval) ไม่ใช่ให้บรรณารักษ์หยิบ 5 เล่มแรกจากทั้งตึกมาให้ แล้วพอดูหน้าปกเห็นเป็นของแผนกวิศวกรรมทั้งหมดก็ริบคืนจนคุณไม่ได้หนังสือสักเล่ม (Recall Starvation)",
      bullets: [
        "**Pre-Retrieval Filter**: กรอง `tenant_id`, `role` และ `is_active` ก่อนจัดอันดับและตัด Top-K เสมอ",
        "**Both Hybrid Legs**: บังคับ predicate เดียวกันทั้งฝั่ง BM25 และฝั่ง Vector Search",
        "**No Silent Fallback**: หาก `auth.tenant_id` ว่างหรือไม่ได้ระบุ ต้องโยน `ValueError` ทันที ห้าม fallback ไปดึงเอกสารทั้งหมด",
      ],
      whyTitle: "Why this matters — ลืมกรอง BM25 เพียงขาเดียวคือช่องโหว่ที่พบบ่อยที่สุดใน Hybrid RAG",
      whyParagraphs: [
        "หลายทีมตั้ง metadata filter ใน Qdrant/pgvector เรียบร้อย แต่ตอนทำ in-memory BM25 สำหรับภาษาไทยกลับสร้างดัชนีรวมทุกบริษัทไว้ในก้อนเดียวโดยไม่แยก `tenant_id` ทำให้รหัสออเดอร์หรือชื่อลูกค้าของบริษัทอื่นรั่วผ่านฝั่ง BM25 ได้ทันที",
      ],
    },
    {
      id: "server-bound-auth-context",
      title: "2 · Server-Bound AuthContext: ห้ามรับ tenant_id จาก Prompt หรือ Tool Arguments ของ LLM",
      paragraphs: [
        "ข้อผิดพลาดร้ายแรงอันดับสองคือการออกแบบฟังก์ชันค้นหาให้โมเดล {{llm}} เป็นคนส่ง `tenant_id` เข้ามาผ่าน Tool Calling เช่น `search_kb(query, tenant_id)` หรือพยายามอ่าน `tenant_id` จากข้อความที่ผู้ใช้พิมพ์",
        "ทำไมวิธีนี้ถึงอันตราย? เพราะถ้าผู้ใช้หรือ {{prompt-injection}} สั่งให้โมเดลเรียก `search_kb(query=\"สัญญาลับ\", tenant_id=\"competitor_th\")` โมเดลก็จะส่งพารามิเตอร์นั้นไปดึงข้อมูลของคู่แข่งออกมาให้จริง ๆ!",
        "สถาปัตยกรรมที่ถูกต้องคือ **Server-Bound AuthContext**: ตัวแปร `auth = AuthContext(tenant_id=..., roles=...)` ต้องถูกสร้างจากชั้น Authentication ของเซิร์ฟเวอร์ (เช่น JWT token หรือ session middleware) และถูกฉีด (inject) เข้าไปในฟังก์ชันค้นหาโดยตรงฝั่ง Python โดยไม่เปิดให้ LLM แก้ไขหรือส่งค่าทับได้เด็ดขาด",
      ],
      analogy:
        "เหมือนคีย์การ์ดโรงแรมที่ล็อกเลขชั้นไว้ในชิปตั้งแต่เคาน์เตอร์เช็กอิน: เวลาแขกขึ้นลิฟต์ แขกแตะคีย์การ์ดแล้วกดเลือกได้เฉพาะห้องในชั้นของตัวเอง ไม่ใช่ให้แขกตะโกนบอกลิฟต์ปากเปล่าว่า 'วันนี้ฉันพักชั้นเพนต์เฮาส์ เปิดให้หน่อย'",
      code: {
        language: "python",
        filename: "auth_context.py",
        code: `from pydantic import BaseModel, ConfigDict, field_validator


class AuthContext(BaseModel):
    """บริบทสิทธิ์ที่สร้างจากระบบยืนยันตัวตนฝั่งเซิร์ฟเวอร์เท่านั้น (Immutable)"""
    model_config = ConfigDict(frozen=True)

    tenant_id: str
    allowed_roles: frozenset[str]

    @field_validator("tenant_id")
    @classmethod
    def validate_tenant_not_empty(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("tenant_id must not be empty")
        return cleaned`,
        caption: "`ConfigDict(frozen=True)` และ validator ป้องกันไม่ให้ `tenant_id` ว่างหรือถูกแก้ไขกลางทาง",
      },
      whyTitle: "Why this matters — Security Boundary ต้องอยู่ในโค้ดDeterministic ไม่ใช่อยู่ในการตัดสินใจของ LLM",
      whyParagraphs: [
        "LLM เป็นโมเดลความน่าจะเป็น (probabilistic) จึงไม่เหมาะทำหน้าที่เป็นยามเฝ้าประตูสิทธิ์การเข้าถึงข้อมูล การผูก `AuthContext` ที่ระดับโค้ด Python รับประกันความปลอดภัยแบบ 100% ไม่ว่าโมเดลจะถูกหลอกอย่างไร",
      ],
    },
    {
      id: "post-retrieval-defense-in-depth",
      title: "3 · Post-Retrieval Assertion Gate: เข็มขัดนิรภัยเส้นที่สองก่อนประกอบ Prompt",
      paragraphs: [
        "แม้เราจะเขียน Pre-Retrieval Filter ไว้แล้ว แต่ในระบบขนาดใหญ่ที่มีการต่อหลายดัชนี มีโอกาสที่นักพัฒนาคนอื่นจะเพิ่มแหล่งข้อมูลที่ 3 (เช่น Cache หรือ FAQ เสริม) โดยลืมใส่ตัวกรอง `tenant_id`",
        "เพื่อป้องกันความผิดพลาดของมนุษย์ เราจึงวาง **Post-Retrieval Assertion Gate** (`assert_acl_compliance`) เป็นด่านสุดท้ายก่อนนำ chunks ไปประกอบเป็น Prompt: วนตรวจทุก chunk ที่ได้มาจากทุกแหล่งว่า `chunk.tenant_id == auth.tenant_id` และ `chunk.access_role in auth.allowed_roles` และ `chunk.is_active`",
        "หากพบแม้แต่ 1 chunk ที่ละเมิดสิทธิ์ ด่านนี้จะไม่แค่ลบออกเงียบ ๆ แต่จะโยน `PermissionError` ทันที (Fail-Fast / Fail-Closed) พร้อมระบุรหัส chunk ที่รั่วออกมา เพื่อให้ระบบหยุดทำงานและแจ้งเตือนทีมวิศวกรให้แก้ไขบั๊กที่ตัวค้นหาต้นทางทันที",
      ],
      analogy:
        "Pre-Retrieval Filter เหมือนระบบคัดแยกกระเป๋าเดินทางอัตโนมัติที่ส่งกระเป๋าไปตามสายพานของแต่ละเที่ยวบิน ส่วน Post-Retrieval Assertion เหมือนเจ้าหน้าที่สแกนบาร์โค้ดหน้าประตูเครื่องบินอีกครั้ง ถ้าเจอกระเป๋าผิดลำแม้แต่ใบเดียวต้องเบรกและตรวจสายพานทันที",
      bullets: [
        "**Pre-Filter (Efficiency & Recall)**: คัดเฉพาะเอกสารที่มีสิทธิ์ก่อนตัด Top-K",
        "**Post-Assertion (Zero-Trust Guarantee)**: ยืนยันซ้ำก่อนเข้า Prompt หากพบ cross-tenant chunk ให้ `raise PermissionError` ทันที",
        "**Lifecycle Guard**: กรองเอกสารที่ถูกยกเลิก (`is_active=False`) ออกพร้อมกันเพื่อไม่ให้นโยบายเก่าที่ยกเลิกแล้วหลุดไปตอบลูกค้า",
      ],
      whyTitle: "Why this matters — ในการทดสอบ CI การโยน PermissionError ช่วยจับบั๊กตัวกรองได้ตั้งแต่วันที่เขียนโค้ด",
      whyParagraphs: [
        "ถ้าด่านหลังบ้านแค่กรองทิ้งเงียบ ๆ บั๊กในดัชนีค้นหาอาจซ่อนอยู่นานหลายเดือนโดยไม่มีใครรู้ การสั่ง `raise PermissionError` เมื่อพบสิ่งที่ไม่ควรหลุดมาจาก Pre-Filter ทำให้เทสต์ใน CI แดงทันทีที่ใครเผลอเขียน query ผิด",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Multi-Tenant RAG ACL กับ Row-Level Security (RLS) ใน SaaS",
      body: [
        "หลักการแยกข้อมูลผู้เช่าใน RAG เหมือนกับการทำ Multi-Tenant Database Security ในเว็บแอปทุกประการ:",
      ],
      table: [
        ["`AuthContext(tenant_id, allowed_roles)`", "`req.user` จาก Verified JWT Middleware (ห้ามอ่านจาก `req.body`)"],
        ["Pre-Retrieval Metadata Filter", "`WHERE tenant_id = $1 AND role = ANY($2)` ก่อน `LIMIT k`"],
        ["Post-Filtering Only (Anti-pattern)", "`SELECT * LIMIT 5` จากทุกบริษัท แล้วค่อย `.filter()` ใน JS จนได้ `[]`"],
        ["Post-Retrieval Assertion Gate", "PostgreSQL Row-Level Security (RLS) policy / Response Schema Guard"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไมใช้ `frozenset` สำหรับเก็บ `allowed_roles`",
      body: [
        "`set` ปกติใน Python สามารถถูก `.add(\"admin\")` แก้ไขกลางทางได้ แต่ `frozenset` เป็นเซตที่ไม่สามารถแก้ไขหลังสร้างเสร็จ (immutable) และค้นหาสมาชิก (`role in auth.allowed_roles`) ได้เร็วระดับ $O(1)$",
        "เมื่อใช้คู่กับ `ConfigDict(frozen=True)` ของ Pydantic จึงมั่นใจได้ว่าไม่มีฟังก์ชันไหนเผลอเพิ่มสิทธิ์แอดมินให้ `AuthContext` ระหว่างทาง",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีคลังเอกสารที่เก็บ chunks ของ 2 บริษัท (`acme_th` และ `beta_th`) และหลายระดับสิทธิ์ (`public`, `staff`, `admin`) เราจะสร้าง `retrieve_with_acl` ที่ทำ Pre-Retrieval Filter ก่อนตัด Top-K พร้อมด่านตรวจซ้ำ `assert_acl_compliance`",
    steps: [
      {
        title: "1 · นิยามโมเดล AuthContext และ DocumentChunk พร้อม Metadata ด้านสิทธิ์",
        explain:
          "ทุก `DocumentChunk` ต้องระบุ `tenant_id`, `access_role` และ `is_active` อย่างชัดเจนตั้งแต่ขั้นตอน Ingestion",
        code: {
          language: "python",
          filename: "worked_acl_rag.py",
          code: `from pydantic import BaseModel, ConfigDict, field_validator


class AuthContext(BaseModel):
    model_config = ConfigDict(frozen=True)

    tenant_id: str
    allowed_roles: frozenset[str]

    @field_validator("tenant_id")
    @classmethod
    def check_tenant(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("tenant_id must not be empty")
        return v.strip()


class DocumentChunk(BaseModel):
    chunk_id: str
    tenant_id: str
    access_role: str
    is_active: bool = True
    text: str
    score: float`,
        },
      },
      {
        title: "2 · เขียน Pre-Retrieval ACL Filter และ Post-Retrieval Assertion Gate",
        explain:
          "กรองเฉพาะเอกสารที่ตรงกับ `auth.tenant_id`, อยู่ใน `auth.allowed_roles` และ `is_active=True` ก่อนเรียงคะแนนและตัด `top_k` จากนั้นตรวจซ้ำด้วย `assert_acl_compliance`",
        code: {
          language: "python",
          filename: "worked_acl_rag.py",
          code: `def assert_acl_compliance(
    chunks: list[DocumentChunk],
    auth: AuthContext,
) -> None:
    """Defense-in-Depth: โยน PermissionError ทันทีหากมี chunk ละเมิด ACL หลุดมา"""
    for chunk in chunks:
        if chunk.tenant_id != auth.tenant_id:
            raise PermissionError(f"Cross-tenant leak detected: {chunk.chunk_id}")
        if chunk.access_role not in auth.allowed_roles:
            raise PermissionError(f"Unauthorized role leak detected: {chunk.chunk_id}")
        if not chunk.is_active:
            raise PermissionError(f"Inactive document leak detected: {chunk.chunk_id}")


def retrieve_with_acl(
    corpus: list[DocumentChunk],
    auth: AuthContext,
    top_k: int = 3,
) -> list[DocumentChunk]:
    """กรอง ACL ตั้งแต่ก่อนจัดอันดับและตัด top_k เพื่อป้องกันทั้ง Data Leak และ Recall Starvation"""
    candidates = [
        c
        for c in corpus
        if c.tenant_id == auth.tenant_id
        and c.access_role in auth.allowed_roles
        and c.is_active
    ]
    ranked = sorted(candidates, key=lambda c: c.score, reverse=True)[:top_k]
    assert_acl_compliance(ranked, auth)
    return ranked`,
        },
      },
      {
        title: "3 · ทดสอบป้องกัน Recall Starvation และ Cross-Tenant Leak",
        explain:
          "แม้เอกสารของ `beta_th` หรือเอกสาร `admin` จะมีคะแนนสูงกว่า แต่ผู้ใช้ระดับ `public` ของ `acme_th` ก็ยังได้รับเอกสารของตัวเองครบโดยไม่มีข้อมูลรั่ว",
        code: {
          language: "python",
          filename: "worked_acl_rag.py",
          code: `corpus = [
    DocumentChunk(chunk_id="beta#c1", tenant_id="beta_th", access_role="public", text="สัญญาบริษัท Beta", score=0.99),
    DocumentChunk(chunk_id="acme-admin#c1", tenant_id="acme_th", access_role="admin", text="แผนเงินเดือนผู้บริหาร Acme", score=0.96),
    DocumentChunk(chunk_id="acme-old#c1", tenant_id="acme_th", access_role="public", is_active=False, text="โปรโมชันปี 2022 ที่ยกเลิกแล้ว", score=0.94),
    DocumentChunk(chunk_id="acme-pub#c1", tenant_id="acme_th", access_role="public", text="นโยบายคืนสินค้า Acme 14 วัน", score=0.81),
    DocumentChunk(chunk_id="acme-pub#c2", tenant_id="acme_th", access_role="public", text="ค่าจัดส่งคืนสินค้า Acme 50 บาท", score=0.76),
]

acme_customer = AuthContext(tenant_id="acme_th", allowed_roles=frozenset({"public"}))
results = retrieve_with_acl(corpus, acme_customer, top_k=2)

print("Returned IDs:", [r.chunk_id for r in results])
print("Tenants:", {r.tenant_id for r in results})`,
        },
        output: `Returned IDs: ['acme-pub#c1', 'acme-pub#c2']
Tenants: {'acme_th'}`,
      },
    ],
    gotcha:
      "สังเกตว่าใน `corpus` ตัวอย่างข้างต้น 3 อันดับแรกที่ได้คะแนนสูงสุด (`0.99`, `0.96`, `0.94`) ล้วนเป็นเอกสารที่ผู้ใช้ไม่มีสิทธิ์ดู! ถ้าเราทำ Post-Filtering หลังตัด `top_k=2` ผู้ใช้จะได้ผลลัพธ์ `[]` ทันที แต่พอทำ Pre-Retrieval Filter ผู้ใช้ได้ `acme-pub#c1` และ `acme-pub#c2` ครบถ้วน",
  },

  practice: {
    intro:
      "ภารกิจ 15 นาที: สร้างโมดูล `acl_indexer.py` ที่ทำ Pre-Retrieval ACL Filtering บนระบบ Hybrid Search (Lexical + Vector RRF) พร้อมด่าน `assert_acl_compliance` และชุดทดสอบ `test_acl_indexer.py`",
    requirements: [
      "สร้าง `AuthContext(tenant_id: str, allowed_roles: frozenset[str])` แบบ `frozen=True` ที่โยน `ValueError` เมื่อ `tenant_id` ว่างหรือ `allowed_roles` ว่างเปล่า",
      "เขียน `assert_acl_compliance(chunks: list[DocumentChunk], auth: AuthContext) -> None` ที่โยน `PermissionError` ทันทีเมื่อพบ chunk ที่ `tenant_id` ไม่ตรง, `access_role` ไม่อยู่ใน `allowed_roles`, หรือ `is_active == False`",
      "เขียน `hybrid_retrieve_with_acl(corpus: list[DocumentChunk], auth: AuthContext, top_k: int = 3, rrf_k: int = 60) -> list[DocumentChunk]` ที่กรอง ACL ก่อนจัดอันดับทั้งขา `lexical_score` และขา `vector_score` แล้วรวมอันดับด้วย RRF: $\\sum \\frac{1}{k + \\text{rank}}$",
      "เรียก `assert_acl_compliance` กับผลลัพธ์สุดท้ายก่อนส่งคืนเสมอ",
      "เขียน `test_acl_indexer.py` ทดสอบครบทั้งการแยก tenant, การกั้น role (`admin` vs `public`), การตัดเอกสาร `is_active=False`, การไม่เกิด Recall Starvation และการโยน `PermissionError` เมื่อมี chunk ละเมิดสิทธิ์หลุดเข้า `assert_acl_compliance`",
    ],
    starter: {
      language: "python",
      filename: "acl_indexer.py",
      code: `from pydantic import BaseModel, ConfigDict, field_validator


class AuthContext(BaseModel):
    model_config = ConfigDict(frozen=True)

    tenant_id: str
    allowed_roles: frozenset[str]

    @field_validator("tenant_id")
    @classmethod
    def check_tenant(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("tenant_id must not be empty")
        return v.strip()

    @field_validator("allowed_roles")
    @classmethod
    def check_roles(cls, v: frozenset[str]) -> frozenset[str]:
        if not v:
            raise ValueError("allowed_roles must not be empty")
        return v


class DocumentChunk(BaseModel):
    chunk_id: str
    tenant_id: str
    access_role: str
    is_active: bool = True
    text: str
    lexical_score: float
    vector_score: float


def assert_acl_compliance(chunks: list[DocumentChunk], auth: AuthContext) -> None:
    """โยน PermissionError ทันทีหากพบ chunk ที่ละเมิด tenant_id, access_role หรือ is_active"""
    # TODO: ตรวจทุก chunk ใน chunks
    raise NotImplementedError


def hybrid_retrieve_with_acl(
    corpus: list[DocumentChunk],
    auth: AuthContext,
    top_k: int = 3,
    rrf_k: int = 60,
) -> list[DocumentChunk]:
    """กรอง Pre-Retrieval ACL แล้วคำนวณ RRF จากอันดับ lexical_score และ vector_score"""
    # TODO:
    # 1. คัดเฉพาะ chunks ใน corpus ที่ผ่าน ACL (tenant_id, access_role, is_active)
    # 2. จัดอันดับฝั่ง lexical_score (มากไปน้อย, rank เริ่มที่ 1) และฝั่ง vector_score (มากไปน้อย, rank เริ่มที่ 1)
    # 3. คำนวณคะแนน RRF = 1/(rrf_k + lex_rank) + 1/(rrf_k + vec_rank)
    # 4. เรียงตามคะแนน RRF มากไปน้อย ตัด [:top_k] แล้วเรียก assert_acl_compliance ก่อนคืนค่า
    raise NotImplementedError`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
    },
    selfCheck: [
      "การกรอง ACL เกิดขึ้น **ก่อน** นำไปจัดอันดับ `lexical_score` และ `vector_score` ใช่หรือไม่?",
      "ถ้าส่ง `AuthContext(tenant_id=\"   \", allowed_roles=frozenset({\"public\"}))` เข้ามา โมเดลโยน `ValueError` ทันทีใช่หรือไม่?",
      "`assert_acl_compliance` โยน `PermissionError` ทั้งกรณีข้าม tenant, ข้าม role และเอกสาร `is_active=False` ใช่หรือไม่?",
    ],
    acceptance:
      "`pytest` ผ่านครบทุกกรณี (zero cross-tenant leak, role isolation, inactive filtering, RRF fusion without recall starvation, post-retrieval assertion error) และ `ruff check` มี 0 errors",
    hints: [
      {
        body: "หลังจากกรอง `allowed_chunks` แล้ว ให้สร้าง dict เก็บอันดับ เช่น `lex_ranks = {c.chunk_id: idx + 1 for idx, c in enumerate(sorted(allowed_chunks, key=lambda x: x.lexical_score, reverse=True))}` และทำแบบเดียวกันสำหรับ `vec_ranks`",
      },
      {
        body: "คะแนน RRF ของแต่ละ chunk คือ `1.0 / (rrf_k + lex_ranks[c.chunk_id]) + 1.0 / (rrf_k + vec_ranks[c.chunk_id])`",
      },
      {
        body: "เฉลยชุดทดสอบ `test_acl_indexer.py`:",
        code: {
          language: "python",
          filename: "test_acl_indexer.py",
          code: `import pytest
from acl_indexer import (
    AuthContext,
    DocumentChunk,
    assert_acl_compliance,
    hybrid_retrieve_with_acl,
)

CORPUS = [
    DocumentChunk(
        chunk_id="beta#c1",
        tenant_id="beta_th",
        access_role="public",
        text="ข้อมูลบริษัท Beta",
        lexical_score=0.99,
        vector_score=0.99,
    ),
    DocumentChunk(
        chunk_id="acme-secret#c1",
        tenant_id="acme_th",
        access_role="admin",
        text="เอกสารลับผู้บริหาร Acme",
        lexical_score=0.95,
        vector_score=0.95,
    ),
    DocumentChunk(
        chunk_id="acme-deprecated#c1",
        tenant_id="acme_th",
        access_role="public",
        is_active=False,
        text="นโยบายเก่าที่ยกเลิกแล้ว",
        lexical_score=0.92,
        vector_score=0.92,
    ),
    DocumentChunk(
        chunk_id="acme-pub#c1",
        tenant_id="acme_th",
        access_role="public",
        text="คืนเงินภายใน 14 วัน",
        lexical_score=0.85,
        vector_score=0.70,
    ),
    DocumentChunk(
        chunk_id="acme-pub#c2",
        tenant_id="acme_th",
        access_role="public",
        text="ติดต่อฝ่ายบริการลูกค้า 24 ชั่วโมง",
        lexical_score=0.72,
        vector_score=0.88,
    ),
]


def test_auth_context_rejects_empty_tenant_or_roles() -> None:
    with pytest.raises(ValueError):
        AuthContext(tenant_id="  ", allowed_roles=frozenset({"public"}))
    with pytest.raises(ValueError):
        AuthContext(tenant_id="acme_th", allowed_roles=frozenset())


def test_hybrid_retrieve_isolates_tenant_role_and_active_status() -> None:
    auth = AuthContext(tenant_id="acme_th", allowed_roles=frozenset({"public"}))
    results = hybrid_retrieve_with_acl(CORPUS, auth, top_k=2)
    assert [r.chunk_id for r in results] == ["acme-pub#c1", "acme-pub#c2"]


def test_admin_can_access_admin_and_public_within_own_tenant() -> None:
    auth = AuthContext(tenant_id="acme_th", allowed_roles=frozenset({"public", "admin"}))
    results = hybrid_retrieve_with_acl(CORPUS, auth, top_k=3)
    ids = [r.chunk_id for r in results]
    assert "acme-secret#c1" in ids
    assert "beta#c1" not in ids
    assert "acme-deprecated#c1" not in ids


def test_assert_acl_compliance_raises_on_violation() -> None:
    auth = AuthContext(tenant_id="acme_th", allowed_roles=frozenset({"public"}))
    with pytest.raises(PermissionError):
        assert_acl_compliance([CORPUS[0]], auth)
    with pytest.raises(PermissionError):
        assert_acl_compliance([CORPUS[1]], auth)
    with pytest.raises(PermissionError):
        assert_acl_compliance([CORPUS[2]], auth)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v`,
    },
  },

  mistakes: [
    {
      title: "ดึง Top-K จากเอกสารทุกบริษัทรวมกันก่อน แล้วค่อยกรอง `tenant_id` ออกทีหลัง (Post-Filtering Only)",
      symptom:
        "ผู้เช่ารายเล็กที่ได้คะแนนเป็นอันดับ 6–10 ได้ผลลัพธ์ว่างเปล่า `[]` เสมอ (Recall Starvation) ทั้งที่มีเอกสารของตัวเองอยู่ในระบบ",
      fix: "ทำ Pre-Retrieval Metadata Filtering จำกัดเฉพาะเอกสารของผู้เช่าและสิทธิ์ที่อนุญาตก่อนจัดอันดับและตัด Top-K เสมอ",
    },
    {
      title: "กรอง `tenant_id` เฉพาะฝั่ง Vector DB แต่ลืมกรองฝั่ง In-Memory BM25",
      symptom:
        "เมื่อผู้ใช้พิมพ์รหัสใบแจ้งหนี้หรือชื่อเฉพาะที่ตรงกับเอกสารของบริษัทอื่น ฝั่ง BM25 ดึงเอกสารนั้นขึ้นมาแล้วไหลผ่าน RRF เข้าสู่คำตอบ",
      fix: "บังคับ Pre-Retrieval ACL Predicate เดียวกันทั้งขา Lexical (BM25) และขา Dense Vector พร้อมตั้ง `assert_acl_compliance` ดักซ้ำหลังรวมผล",
    },
    {
      title: "ให้ LLM ส่ง `tenant_id` เข้ามาเป็นพารามิเตอร์ของ Tool หรือแกะ `tenant_id` จากข้อความที่ผู้ใช้พิมพ์",
      symptom:
        "ผู้โจมตีทำ Prompt Injection สั่งให้โมเดลเปลี่ยน `tenant_id` เป็นชื่อบริษัทคู่แข่งแล้วดึงเอกสารลับออกมาได้",
      fix: "ผูก `AuthContext` จากชั้น Authentication ของเซิร์ฟเวอร์ (Verified Session/JWT) เท่านั้น ห้ามรับจาก LLM หรือข้อความแชตเด็ดขาด",
    },
    {
      title: "เมื่อ `tenant_id` เป็นค่าว่าง (`\"\"` หรือ `None`) แล้วโค้ดข้ามเงื่อนไข `WHERE` ไปดึงเอกสารทั้งหมด",
      symptom:
        "เกิดบั๊กในหน้าเว็บที่ส่ง `tenant_id=\"\"` มา แล้วระบบเปิดเผยเอกสารของทุกบริษัทในฐานข้อมูล",
      fix: "ใช้ Pydantic validator บังคับ Fail-Fast (`raise ValueError`) ทันทีที่ `tenant_id` หรือ `allowed_roles` ว่างเปล่า",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d107-q1",
        "ปัญหา 'Recall Starvation' จากการทำ Post-Retrieval ACL Filtering เพียงอย่างเดียวคืออะไร?",
        [
          ["ฐานข้อมูลใช้พื้นที่ดิสก์เพิ่มขึ้น 10 เท่า", "Post-filtering ไม่ได้เพิ่มพื้นที่ดิสก์"],
          ["ระบบดึง Top-K จากเอกสารทุกบริษัทรวมกันก่อน ซึ่งหาก Top-K ทั้งหมดเป็นของบริษัทอื่นแล้วถูกตัดออกทีหลัง ผู้ใช้จะได้ผลลัพธ์ 0 ชิ้นทั้งที่มีเอกสารของบริษัทตัวเองอยู่อันดับถัดไป", "ถูกต้อง — ต้องกรอง ACL ก่อนจัดอันดับและตัด Top-K เสมอ (Pre-Retrieval Filter)"],
          ["โมเดล LLM ลืมวิธีสะกดภาษาไทย", "ไม่เกี่ยวข้องกับความสามารถด้านภาษาของโมเดล"],
          ["คะแนน Cosine Similarity กลายเป็นค่าติดลบทั้งหมด", "ไม่ได้เปลี่ยนค่า Cosine Similarity"],
        ],
        "B",
        "การตัด Top-K ก่อนกรองสิทธิ์ทำให้เอกสารที่ไม่มีสิทธิ์แย่งที่นั่ง Top-K ไปหมดจนผู้เช่ารายย่อยไม่ได้เอกสารของตัวเองกลับมาเลย",
        "ทำไมต้องทำ Pre-Retrieval ACL Filtering ก่อนตัด Top-K?",
        "เพื่อป้องกันไม่ให้เอกสารของบริษัทอื่นแย่งโควตา Top-K ไปหมดจนเกิด Recall Starvation",
      ),
      mc(
        "d107-q2",
        "ในระบบ Hybrid RAG (BM25 + Dense Vector + RRF) เราควรวางตัวกรอง `tenant_id` และ `access_role` ไว้ที่จุดใด?",
        [
          ["วางเฉพาะที่ Dense Vector DB เพราะ Vector DB มีความแม่นยำสูงกว่า", "อันตราย — เอกสารของบริษัทอื่นจะรั่วผ่านขา BM25 เข้าสู่ RRF ได้"],
          ["วางเฉพาะที่ BM25 เพราะ BM25 ค้นคำตรงตัว", "อันตราย — เอกสารของบริษัทอื่นจะรั่วผ่านขา Vector เข้าสู่ RRF ได้"],
          ["วาง Pre-Retrieval Filter ทั้งขา BM25 และขา Dense Vector ก่อนคำนวณ RRF และตรวจซ้ำด้วย Post-Retrieval Assertion หลังรวมผล", "ถูกต้อง — Defense-in-Depth ต้องครอบคลุมทุกขาของการค้นคืนและตรวจซ้ำก่อนเข้า Prompt"],
          ["ให้ LLM เป็นคนเลือกเองหลังอ่านเอกสารทุกบริษัทเสร็จแล้ว", "อันตรายที่สุด — ข้อมูลรั่วเข้า Context ของ LLM ไปแล้ว"],
        ],
        "C",
        "ในระบบ Hybrid Search ข้อมูลสามารถรั่วจากขาใดขาหนึ่งก็ได้ จึงต้องกรองตั้งแต่ต้นทางทั้งสองขาและมี assertion ดักท้ายเสมอ",
        "ควรวาง ACL Filter อย่างไรในสถาปัตยกรรม Hybrid RRF?",
        "กรอง Pre-Retrieval ทั้งขา BM25 และขา Vector ก่อนรวม RRF พร้อมตรวจ Post-Retrieval Assertion ซ้ำก่อนสร้าง Prompt",
      ),
      mc(
        "d107-q3",
        "ทำไมค่า `tenant_id` และ `allowed_roles` จึงห้ามรับมาจาก Tool Arguments ที่ LLM สร้างขึ้น หรือจากข้อความแชตของผู้ใช้?",
        [
          ["เพราะ LLM และข้อความแชตสามารถถูก Prompt Injection หลอกให้ส่ง `tenant_id` ของบริษัทอื่นเพื่อขโมยข้อมูลข้ามบริษัทได้", "ถูกต้อง — สิทธิ์การเข้าถึงต้องมาจาก Server-Bound AuthContext (เช่น JWT/Session ที่ยืนยันตัวตนแล้ว) เท่านั้น"],
          ["เพราะ JSON ไม่รองรับฟิลด์ชื่อ `tenant_id`", "JSON รองรับชื่อฟิลด์ใดก็ได้"],
          ["เพราะภาษาไทยไม่สามารถใช้คู่กับ `tenant_id` ภาษาอังกฤษได้", "ใช้ร่วมกันได้ตามปกติ"],
          ["เพราะจะทำให้ `pytest` รันช้าลง 5 นาที", "ไม่เกี่ยวข้องกับความเร็วของ pytest"],
        ],
        "A",
        "ขอบเขตสิทธิ์ (Security Boundary) ต้องถูกบังคับด้วยโค้ดฝั่งเซิร์ฟเวอร์จาก session ที่ยืนยันตัวตนแล้ว ไม่ใช่จากพารามิเตอร์ที่โมเดลสร้าง",
        "ค่า `tenant_id` สำหรับกรอง RAG ต้องมาจากแหล่งใดเท่านั้น?",
        "มาจาก Server-Bound AuthContext (เช่น Verified JWT/Session) ฝั่งเซิร์ฟเวอร์ ห้ามรับจาก LLM หรือข้อความแชต",
      ),
      mc(
        "d107-q4",
        "เหตุใดฟังก์ชัน `assert_acl_compliance` (Post-Retrieval Gate) จึงควร `raise PermissionError` ทันทีที่พบ chunk แปลกปลอม แทนที่จะลบ chunk นั้นทิ้งเงียบ ๆ?",
        [
          ["เพื่อให้โค้ดสั้นลง 1 บรรทัด", "เหตุผลหลักไม่ใช่เรื่องความยาวโค้ด"],
          ["เพราะหากมี chunk แปลกปลอมหลุดมาถึงด่านหลัง แปลว่า Pre-Retrieval Filter ของดัชนีใดดัชนีหนึ่งมีบั๊ก การโยน Error ทันที (Fail-Closed) ช่วยหยุดการรั่วไหลและทำให้ CI/Alert จับบั๊กต้นทางได้ทันที", "ถูกต้อง — ถ้าลบเงียบ ๆ บั๊กในตัวค้นหาต้นทางจะซ่อนตัวอยู่โดยไม่มีใครรู้"],
          ["เพื่อให้ผู้ใช้เห็น Stack Trace ของเซิร์ฟเวอร์", "ฝั่ง API จะจับ exception แล้วคืนข้อความปลอดภัยพร้อมยิง alert ภายใน"],
          ["เพราะ Python ไม่มีคำสั่งลบสมาชิกออกจาก list", "Python มี list filtering ตามปกติ"],
        ],
        "B",
        "เมื่อมี Pre-Retrieval Filter อยู่แล้ว การหลุดมาถึง Post-Retrieval Assertion คือสัญญาณของบั๊กในระบบค้นหา จึงต้อง Fail-Fast เพื่อให้แก้ไขทันที",
        "ทำไม Post-Retrieval ACL Assertion จึงควรโยน `PermissionError` แทนการกรองทิ้งเงียบ ๆ?",
        "เพื่อ Fail-Closed และแจ้งเตือนทันทีว่า Pre-Retrieval Filter ของดัชนีต้นทางมีบั๊ก",
      ),
    ],
  },

  takeaways: [
    "**Pre-Retrieval ACL Filtering** (`tenant_id`, `access_role`, `is_active`) ต้องทำก่อนจัดอันดับและตัด Top-K เสมอ เพื่อป้องกันทั้ง **Data Leak** และ **Recall Starvation**",
    "ในระบบ **Hybrid Search ({{bm25}} + {{hnsw}} + {{rrf}})** ต้องบังคับ ACL Filter ทั้งสองขาอย่างเท่าเทียมกัน",
    "**Server-Bound `AuthContext`**: ดึงสิทธิ์จากระบบยืนยันตัวตนฝั่งเซิร์ฟเวอร์เท่านั้น ห้ามให้ LLM หรือผู้ใช้ส่ง `tenant_id` ผ่าน prompt/tool arguments",
    "**Post-Retrieval Assertion (`assert_acl_compliance`)** คือเข็มขัดนิรภัยเส้นที่สองที่โยน `PermissionError` ทันทีหากมี chunk แปลกปลอมหลุดมา",
  ],

  reviewCards: [
    rc(
      "d107-rc1",
      "ทำไมการกรอง `tenant_id` หลังตัด Top-K (Post-filtering only) จึงทำให้เกิด Recall Starvation?",
      "เพราะเอกสารของผู้เช่ารายอื่นอาจติดอันดับ 1..K ทั้งหมด พอถูกตัดออกทีหลัง ผู้ใช้จึงได้ผลลัพธ์ 0 ชิ้น ทั้งที่มีเอกสารของตัวเองอยู่ในอันดับ K+1",
    ),
    rc(
      "d107-rc2",
      "ทำไมห้ามให้ LLM เป็นคนส่งพารามิเตอร์ `tenant_id` เข้าฟังก์ชันค้นหา?",
      "เพราะผู้โจมตีสามารถใช้ Prompt Injection สั่งให้ LLM เปลี่ยน `tenant_id` เป็นชื่อบริษัทอื่นเพื่อดึงข้อมูลข้ามผู้เช่าได้",
    ),
    rc(
      "d107-rc3",
      "ในระบบ Hybrid RRF ถ้ากรอง `tenant_id` เฉพาะใน Vector DB แต่ลืมกรองใน BM25 จะเกิดอะไรขึ้น?",
      "เอกสารของบริษัทอื่นที่มีคำค้นตรงตัวจะถูกดึงขึ้นมาจากขา BM25 แล้วถูกรวมคะแนนผ่าน RRF เข้าสู่ Context ของ LLM ทันที",
    ),
    rc(
      "d107-rc4",
      "นอกจาก `tenant_id` และ `access_role` แล้ว ทำไมควรกรอง `is_active == True` ในชั้น Pre-Retrieval ด้วย?",
      "เพื่อป้องกันไม่ให้นโยบายเก่าหรือโปรโมชันที่ยกเลิกแล้วถูกดึงกลับมาตอบลูกค้า (Stale Document Prevention)",
    ),
  ],

  sources: [
    {
      label: "OWASP Top 10 for LLM Applications — LLM08: Vector and Embedding Weaknesses (Multi-Tenant Leakage)",
      href: "https://genai.owasp.org/llmrisk/llm08-2025-vector-and-embedding-weaknesses/",
    },
    {
      label: "Qdrant Documentation — Multitenancy & Pre-Filtering Payload Indexes",
      href: "https://qdrant.tech/documentation/guides/multiple-partitions/",
    },
    {
      label: "Pydantic v2 Documentation — Frozen Models & Field Validators",
      href: "https://docs.pydantic.dev/latest/concepts/models/#faux-immutability",
    },
  ],

  glossary: ["acl", "rag", "rrf", "bm25", "hnsw", "pdpa", "fail-fast"],
});
