import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D088 — Phase 3 / Block B22 (Review Day)
 * Review: Quiz + Implement extraction pipeline with routing & cache
 */
export const d088: Lesson = defineLesson({
  day: 88,
  titleTh: "ทบทวน B22: ประกอบ Extraction Pipeline พร้อม SQLite Cache, Model Routing และ Repair Loop",
  tagline: "30 นาที · รอบทบทวน D85–D87 + D27/D78/D79 · รันบนเครื่องคุณ 100% ด้วย mocked providers และ SQLite ใน pytest",
  icon: "workflow",
  visual: {
    id: "phase3-extractor-arch",
    title: "ทบทวน B22: สร้าง Extraction Pipeline พร้อม Model Routing & SQLite Cache",
    caption: "ต่อท่อ Cache Lookup → Small Model → Confidence/Schema Check → Frontier Escalation → Repair Loop ครบในโมดูลเดียว",
    alt: "แผนภาพ Extraction Pipeline พร้อม Model Routing และ Cache",
  },
  requiresApiKey: false,
  tools: ["Pydantic v2", "SDK", "Ollama", "SQLite", "pytest"],

  bigPicture: [
    {
      node: 1,
      heading: "เปลี่ยนพิมพ์เขียว Day 87 เป็นท่อสกัดข้อมูลที่รันจริงพร้อม Versioned SQLite Cache",
      body: "รวมความรู้ {{sqlite}} {{caching}} (D27) เข้ากับ Versioned SHA-256 Cache Key (D87) เพื่อให้เอกสารซ้ำถูกตอบกลับใน `< 1 ms` ด้วยต้นทุน `$0` และล้างผลเก่าอัตโนมัติเมื่ออัปเกรด {{prompt-versioning}}",
      lessonNote: "วันนี้เราเขียนคลาส `SQLiteExtractionCache` ด้วย `sqlite3` มาตรฐานและทดสอบด้วย `tmp_path` ใน {{pytest}}",
    },
    {
      node: 2,
      heading: "ประสาน Small-First Routing (D79) กับ Bounded Validation-Repair Loop (D78)",
      body: "เมื่อเกิด Cache Miss ระบบส่งเอกสารให้ Small/Local Model ก่อนพร้อมซ่อม {{validation-error}} ได้สูงสุด `max_retries` รอบ หากความมั่นใจต่ำกว่าเกณฑ์หรือซ่อมไม่ผ่านจึง escalate ไปยัง Frontier Model",
      lessonNote: "แยกชั้น Cache → Small + Repair → Frontier Escalation → Safe Fallback ให้ตรวจสอบเส้นทางได้ทุกเคสด้วย {{mocking}}",
    },
    {
      node: 3,
      heading: "ทบทวนแบบผสมผสาน (Interleaved Recall) D85–D87 + D27/D78/D79 ผ่านชุดทดสอบออฟไลน์",
      body: "ยืนยันด้วย {{pytest}} ทั้ง 5 พฤติกรรมสำคัญ: Cache Hit ไม่เรียก LLM, เปลี่ยน `prompt_version` แล้ว Cache Miss, ซ่อมผ่านที่ Small Model, Escalate เมื่อความมั่นใจต่ำ, และไม่แคชผลลัพธ์ที่ตก Fallback",
      lessonNote: "ทั้งหมดรันผ่านบนเครื่องในไม่ถึง 1 วินาทีโดยไม่ต้องใช้ API key และพร้อมต่อยอดสู่ Block B23",
    },
    {
      node: 5,
      heading: "เก็บตัวชี้วัด Cache Hit Rate, Escalation Rate และ Fallback Rate ครบใน Pipeline",
      body: "ตัวเลข telemetry ของทุกคำขอ (`source`, `model_tier`, `attempts`, `needs_human_review`) ช่วยให้ทีมมองเห็นทั้งต้นทุนและจุดที่ควรปรับ prompt หรือพิจารณา {{lora}} ในอนาคต",
      lessonNote: "ปิดท้าย Block B22 ด้วย Extraction Pipeline แกนกลางของ Phase 3 Mini-Project ที่พร้อมรับมือ Edge Cases ใน Day 89",
    },
  ],

  objectives: [
    "**ดึงความรู้แบบผสมผสาน (Interleaved Recall)** ครบทั้ง D85 (Prompt/RAG/Fine-Tune Ladder), D86 (LoRA/QLoRA & Data Hygiene), D87 (Milestone #3 Schemas & Versioned Cache Key), และ D27/D78/D79 (SQLite Cache, Repair Loop & Tiered Routing)",
    "**ลงมือเขียน** Extraction Pipeline ที่ต่อท่อ **Versioned SQLite Cache → Small Model + Repair Loop → Confidence/Schema Gate → Frontier Escalation → Safe Fallback** ครบในโมดูลเดียว",
    "**พิสูจน์ความถูกต้อง** ด้วย {{pytest}} + {{mocking}} (และ {{fixture}} `tmp_path`) ว่า Cache Hit ไม่ยิง LLM, การเปลี่ยน `prompt_version` ล้างผลเก่า, และผลลัพธ์ที่ตก Fallback จะไม่ทำให้ Cache ปนเปื้อน (no cache poisoning)",
  ],

  prerequisites: [
    "ทบทวน D85 (Prompt vs RAG vs Fine-Tune), D86 (LoRA/QLoRA), และ D87 (Phase 3 Mini-Project Schemas & Cache Key)",
    "ทบทวน D27 (Persistent {{sqlite}} {{caching}}), D78 (Validation-Repair Loop), และ D79 (Model Routing)",
    "มี `uv`, `pydantic`, `pytest` และ `ruff` พร้อมรันออฟไลน์ 100% บนเครื่อง",
  ],

  setup: {
    intro: "เตรียมโฟลเดอร์รอบทบทวน Block B22 ด้วย {{uv}} โดยใช้ `sqlite3` ใน Python Standard Library คู่กับ `pydantic` และ `pytest`",
    commands: `uv init ai-day88-review && cd ai-day88-review
uv add pydantic
uv add --dev pytest ruff
uv run python -c "import sqlite3, pydantic; print('B22 Review Ready | SQLite:', sqlite3.sqlite_version, '| Pydantic:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day88-review` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic`, `pytest` และ `ruff` สำเร็จ"],
      ["verify", "รันเช็กเวอร์ชัน SQLite และ Pydantic สำเร็จ พร้อมลุยควิซ 10 นาที + สร้าง Pipeline 15 นาที"],
    ],
    note: "จัดเวลา Review Day 30 นาที: 10 นาทีทำ Interleaved Recall Quiz (D85–D87 + D27/D78/D79) → 15 นาทีลงมือประกอบ Extraction Pipeline พร้อม SQLite Cache & Routing → 5 นาทีสรุป Error Log ก่อนเข้าสู่ Block B23 (Edge Cases, Eval & Demo)",
  },

  concepts: [
    {
      id: "pipeline-control-flow",
      title: "1 · ลำดับการทำงาน 5 ขั้นของ Extraction Pipeline (Cache → Route → Repair → Write → Fallback)",
      paragraphs: [
        "เมื่อรวมทุกจิ๊กซอว์จาก D27, D78, D79 และ D87 เข้าด้วยกัน เส้นทางชีวิตของเอกสารไทย 1 ฉบับใน Extraction Pipeline มีลำดับที่ชัดเจนและตรวจสอบได้ทุกจุด:",
        "**ขั้น 1 — Normalize & Cache Lookup (D27 + D87)**: ล้าง `\\u200b`/ช่องว่างซ้ำ สร้าง SHA-256 Key จาก `(prompt_version, schema_version, policy_version, norm_text)` แล้วค้นหาใน {{sqlite}} — หากพบ (**Cache Hit**) พาร์สกลับเป็น Pydantic object แล้วคืนผลทันที (`attempts=0`, `$0` cost)",
        "**ขั้น 2 — Small/Local Model + Bounded Repair (D78 + D79)**: หาก Cache Miss ส่งให้โมเดลเล็ก/Ollama ก่อนพร้อมซ่อม {{validation-error}} ได้สูงสุด `max_retries` รอบ หากผ่านและ `confidence >= threshold` บันทึกลง SQLite Cache แล้วคืนผล",
        "**ขั้น 3 & 4 — Frontier Escalation → Cache Write or Safe Fallback**: หากโมเดลเล็กซ่อมไม่ผ่านหรือ `confidence < threshold` ให้ escalate ไป Frontier Model (ซ่อมได้สูงสุด 1 รอบ) — หากผ่านให้บันทึกลง cache แล้วคืนผล; แต่หากยังไม่ผ่านอีกให้คืน **Safe Fallback (`needs_human_review=True`) โดยห้ามบันทึกลง cache เด็ดขาด**",
      ],
      analogy: "เหมือนฝ่ายบริการลูกค้าที่มีสมุดบันทึกคำตอบที่ตรวจสอบแล้ว (SQLite Cache): ถ้าเคยตรวจเอกสารชุดนี้ในกฎเวอร์ชันเดียวกันแล้วตอบได้ทันทีไม่ต้องเปิดเคสใหม่; ถ้าเป็นเคสใหม่ให้พนักงานด่านหน้า (Small) ลองแก้ก่อน 2 รอบ; ถ้ายากเกินให้ส่งหัวหน้า (Frontier); และถ้าเอกสารอ่านไม่ออกจริง ๆ ให้ส่งเข้ากล่องรอคนตรวจ (Fallback) โดยไม่จดความผิดพลาดนั้นลงสมุดบันทึก",
      bullets: [
        "**Cache Hit**: `source=\"cache\"`, `attempts=0`, เรียก `small_llm` 0 ครั้ง และ `frontier_llm` 0 ครั้ง",
        "**Idempotent Write ({{idempotency}})**: ใช้ `INSERT OR REPLACE` ด้วย parameterized SQL query (`?`) ป้องกัน SQL injection และรองรับการเขียนซ้ำอย่างปลอดภัย",
        "**Zero Cache Poisoning**: บันทึกลง SQLite เฉพาะเมื่อ `ExtractedDoc.model_validate_json(...)` ผ่านสมบูรณ์เท่านั้น",
      ],
      whyTitle: "Why this matters — แกนกลางของ Milestone #3 ที่พร้อมรับมือโลกจริง",
      whyParagraphs: [
        "โครงสร้างนี้แก้ปัญหา 3 อย่างพร้อมกัน: คุมต้นทุน (Cache + Small-First), คุมความถูกต้อง (Pydantic + Repair Loop + Frontier Escalation), และคุมความเสถียร (0% crash ด้วย Deterministic Fallback)",
        "และเพราะเราฉีด `small_llm` กับ `frontier_llm` เข้ามาเป็น callable argument เราจึงทดสอบทุกกิ่งก้านของ pipeline ด้วย {{mocking}} ได้ 100% โดยไม่เสียค่า API เลย",
      ],
    },
    {
      id: "sqlite-cache-hygiene",
      title: "2 · SQLite Cache Design ที่สะอาด ปลอดภัย และทดสอบง่ายใน pytest",
      paragraphs: [
        "จาก Day 27 เราใช้ `sqlite3` ใน Python Standard Library เป็น Disk Cache แบบไม่ต้องลงเซิร์ฟเวอร์เสริม โครงสร้างตารางที่เหมาะกับ Extraction Pipeline คือ `extraction_cache(cache_key TEXT PRIMARY KEY, doc_type TEXT NOT NULL, payload_json TEXT NOT NULL, model_tier TEXT NOT NULL, prompt_version TEXT NOT NULL, created_at TEXT NOT NULL)`",
        "แนวปฏิบัติสำคัญ 3 ข้อที่ห้ามลืม: (1) ใช้ **Parameterized Queries** (`WHERE cache_key = ?`) เสมอเพื่อความปลอดภัย, (2) เรียก `model_validate_json(payload_json)` ตอนอ่านกลับจาก cache ด้วย เพื่อให้มั่นใจว่าข้อมูลที่เก็บไว้ยังตรงกับ {{data-contract}} ปัจจุบัน (หากไม่ตรงให้ถือเป็น Cache Miss), และ (3) ใน `pytest` ใช้ {{fixture}} `tmp_path / \"cache.db\"` (หรือ `\":memory:\"`) เพื่อไม่ให้เทสต์แต่ละข้อรบกวนไฟล์ฐานข้อมูลกัน",
      ],
      analogy: "เหมือนตู้ล็อกเกอร์ฝากของที่มีหมายเลขรหัสเฉพาะรุ่น (Versioned Key) และมีเจ้าหน้าที่สแกนตรวจสภาพของก่อนคืนให้ทุกครั้ง — ถึงแม้เปิดมาแล้วเจอของผิดสเปก ระบบก็ถือว่าไม่มีของในตู้แล้วผลิตใหม่ให้ทันที",
      code: {
        language: "python",
        filename: "sqlite_cache_snippet.py",
        code: `import sqlite3
from datetime import datetime, timezone


class SimpleSQLiteCache:
    def __init__(self, db_path: str = ":memory:") -> None:
        self._conn = sqlite3.connect(db_path)
        self._conn.execute(
            """
            CREATE TABLE IF NOT EXISTS extraction_cache (
                cache_key TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                model_tier TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        self._conn.commit()

    def get(self, key: str) -> tuple[str, str] | None:
        row = self._conn.execute(
            "SELECT payload_json, model_tier FROM extraction_cache WHERE cache_key = ?",
            (key,),
        ).fetchone()
        return (row[0], row[1]) if row else None

    def set(self, key: str, payload_json: str, model_tier: str) -> None:
        now = datetime.now(timezone.utc).isoformat()
        self._conn.execute(
            "INSERT OR REPLACE INTO extraction_cache (cache_key, payload_json, model_tier, created_at) VALUES (?, ?, ?, ?)",
            (key, payload_json, model_tier, now),
        )
        self._conn.commit()`,
        caption: "Persistent Cache แบบเบาบางด้วย `sqlite3` มาตรฐาน ใช้ Parameterized Queries 100% และรองรับทั้งไฟล์จริงกับ `:memory:`",
      },
      whyTitle: "Why this matters — แค่มี Local SQLite Cache ก็ประหยัดเวลาและเงินตอนพัฒนาและรัน Batch มหาศาล",
      whyParagraphs: [
        "ระหว่างพัฒนาและรัน eval ซ้ำ ๆ บนชุดข้อมูล 100 เอกสาร การมี SQLite Cache ที่ผูกกับ `prompt_version` ช่วยให้เอกสารที่เคยประมวลผลแล้วไม่ต้องเสียเวลาและเงินยิง API ซ้ำ",
        "และเมื่อเปลี่ยนไปใช้ PostgreSQL/Redis ในอนาคต แค่คง interface `get(key)` / `set(key, payload, tier)` เดิมไว้ โค้ดส่วน Pipeline ก็ไม่ต้องแก้แม้แต่บรรทัดเดียว",
      ],
    },
    {
      id: "interleaved-recall-b22",
      title: "3 · ทบทวนเชื่อมโยง B22 + B07/B20: รู้ว่าเมื่อไรจบที่ Pipeline และเมื่อไรค่อย Fine-Tune",
      paragraphs: [
        "ก่อนจบ Block B22 ลองเชื่อมภาพใหญ่ของ 6 วันที่เราทบทวนวันนี้เข้าด้วยกัน: หาก Extraction Pipeline ของคุณทำ `cache_hit_rate` ดี, ผ่าน schema ≥ 99% ด้วย Repair Loop (D78), และคุมต้นทุนได้ด้วย Small-First Routing (D79) + SQLite Cache (D27) — ตามหลัก **Escalation Ladder (D85)** คุณ *ยังไม่ต้องรีบทำ Fine-Tuning* เลย!",
        "แต่เมื่อไรที่คุณเริ่มเก็บ Log จาก Pipeline นี้ไปหลายเดือน แล้วพบว่า (1) Frontier Escalation Rate สูงค้างเกิน 40% เพราะ Small Model อ่านศัพท์เฉพาะไทยไม่เข้าใจแม้จะปรับ prompt เต็มที่แล้ว หรือ (2) ทราฟฟิกพุ่งแตะหลักล้านเอกสาร/เดือนจนอยากย่อโมเดล Frontier ลง 8B — ข้อมูลที่ผ่าน validation ในตาราง `extraction_cache` ของคุณนี่แหละที่จะกลายเป็น **วัตถุดิบชุดข้อมูล SFT** ให้คุณเอาไปรัน SFT Auditor (D86) เพื่อฝึก {{lora}}/QLoRA ต่อไปได้อย่างเป็นระบบ!",
      ],
      analogy: "เหมือนร้านอาหารที่จดสูตรและออร์เดอร์ขายดีทุกจานลงสมุดอย่างเป็นระเบียบตั้งแต่เปิดร้าน: ช่วงแรกทำเสิร์ฟสดตามออร์เดอร์ก็พอ แต่พอโตจนจะเปิดแฟรนไชส์ สมุดบันทึกที่สะอาดนั้นคือตำรากลางพร้อมสอนเชฟสาขาใหม่ได้ทันที",
      bullets: [
        "**D85 Link**: วัดผล Pipeline นี้บน Golden Dataset ก่อนเสมอ เพื่อรู้ว่า Prompt + Routing เพียงพอหรือถึงทางตันแล้ว",
        "**D86 Link**: ผลสกัดที่ผ่านการยืนยันจาก Frontier Model + Human Review คือต้นทุนชุดข้อมูล SFT คุณภาพสูง (Data Flywheel)",
        "**D87 → D88 Link**: Schema + Versioned Cache Key ที่ออกแบบใน Day 87 ถูกประกอบเป็นโค้ดที่รันและเทสต์ได้จริงในวันนี้",
      ],
      whyTitle: "Why this matters — Data Flywheel คือความได้เปรียบระยะยาวของวิศวกร AI",
      whyParagraphs: [
        "ระบบที่เก็บ Cache + Telemetry + Verified Outputs อย่างมีโครงสร้างตั้งแต่วันแรก ไม่ใช่แค่ประหยัดค่า API ในวันนี้ แต่กำลังสะสมชุดข้อมูลสะอาดสำหรับการประเมินผล (Phase 5) และการ Fine-Tune ในอนาคตโดยอัตโนมัติ",
        "นี่คือเหตุผลที่ทุกบทเรียนใน Block B22 เชื่อมต่อกันเป็นวงจรเดียว",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Extraction Pipeline ≈ Read-Through Cache + Tiered Fallback Service",
      body: [
        "แพตเทิร์นของวันนี้คือ **Read-Through Cache + Tiered Compute + Circuit-Safe Fallback** ที่คุ้นเคยในระบบ Backend: อ่าน Cache ก่อน → ถ้า miss เรียก Fast Worker พร้อม bounded retry → ถ้ายังไม่ได้ตาม SLA เรียก Heavy Worker → เขียนลง Cache เฉพาะเมื่อผลลัพธ์ผ่าน DTO validation → ถ้าพังทั้งหมดส่งลง DLQ (`needs_human_review=True`)",
        "การทดสอบด้วย `tmp_path` ของ `pytest` ทำให้คุณเทสต์ SQLite ไฟล์จริงบนดิสก์ได้ครบโดยไม่ต้อง mock database เลย!",
      ],
      table: [
        ["`SQLiteExtractionCache.get/set`", "Read-Through Cache Layer (Redis / SQLite)"],
        ["Versioned SHA-256 Cache Key", "Schema/Prompt-Salted Cache Key"],
        ["Small + Repair → Frontier Escalation", "Fast Worker + Auto-Fix → Heavy Worker Escalation"],
        ["Skip Cache Write on `fallback`", "Negative-Cache Avoidance / Anti-Cache-Poisoning"],
      ],
    },
    student: {
      title: "First-Year Note — เช็กความพร้อมก่อนเข้าสัปดาห์สุดท้ายของ Phase 3 (Block B23)",
      body: [
        "ในแบบฝึกหัดวันนี้คุณจะได้ประกอบของจริงที่เชื่อมตั้งแต่ **SQLite (Phase 1)**, **Pydantic Strict Validation + Repair + Routing (Phase 3)** ไปจนถึง **Versioned Cache Key (Day 87)** ในไฟล์เดียว",
        "ลองรัน `pytest` แล้วสังเกตตัวนับ `small_calls` และ `frontier_calls` ในเคส Cache Hit — การเห็นตัวเลขการเรียก LLM เป็น `0` บนเอกสารซ้ำแต่กลับมาเรียกใหม่ทันทีเมื่อเปลี่ยน `prompt_version` จะทำให้คุณเข้าใจสถาปัตยกรรม Caching อย่างแท้จริง",
      ],
    },
  },

  workedExample: {
    intro: "สถานการณ์: ประกอบ `ExtractionPipeline` สำหรับเอกสารธุรกิจไทยที่ผสาน `SQLiteExtractionCache` + Small/Frontier Routing + Bounded Repair Loop แล้วรันทดสอบทั้งเคสปกติ, เคสซ้ำ (Cache Hit), เคสเปลี่ยนเวอร์ชัน prompt, และเคสเสียหาย",
    steps: [
      {
        title: "1 · นิยาม Schema, Versioned Cache Key และ SQLiteExtractionCache",
        explain: "สร้างตาราง `extraction_cache` ด้วย parameterized SQL และบังคับให้ Cache Key ผูกกับ `prompt_version` และ `schema_version`",
        code: {
          language: "python",
          filename: "worked_day88.py",
          code: `from datetime import datetime, timezone
import hashlib
import re
import sqlite3
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class ExtractedDoc(BaseModel):
    model_config = ConfigDict(extra="forbid")

    doc_type: Literal["receipt", "support_ticket", "tax_invoice_request"]
    summary_th: str = Field(min_length=4, max_length=160)
    total_thb: float | None = Field(default=None, ge=0.0)
    confidence: float = Field(ge=0.0, le=1.0)
    needs_human_review: bool = False


def build_cache_key(doc_text: str, *, prompt_version: str, schema_version: str) -> str:
    norm = re.sub(r"\\s+", " ", doc_text.replace("\\u200b", "").replace("\\ufeff", "")).strip()
    return hashlib.sha256(f"{prompt_version}|{schema_version}|{norm}".encode("utf-8")).hexdigest()


class SQLiteExtractionCache:
    def __init__(self, db_path: str = ":memory:") -> None:
        self._conn = sqlite3.connect(db_path)
        self._conn.execute(
            """
            CREATE TABLE IF NOT EXISTS extraction_cache (
                cache_key TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                model_tier TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        self._conn.commit()

    def get(self, key: str) -> tuple[ExtractedDoc, str] | None:
        row = self._conn.execute(
            "SELECT payload_json, model_tier FROM extraction_cache WHERE cache_key = ?",
            (key,),
        ).fetchone()
        if row is None:
            return None
        try:
            return ExtractedDoc.model_validate_json(row[0]), str(row[1])
        except ValidationError:
            return None

    def set(self, key: str, doc: ExtractedDoc, model_tier: str) -> None:
        now = datetime.now(timezone.utc).isoformat()
        self._conn.execute(
            "INSERT OR REPLACE INTO extraction_cache (cache_key, payload_json, model_tier, created_at) VALUES (?, ?, ?, ?)",
            (key, doc.model_dump_json(), model_tier, now),
        )
        self._conn.commit()`,
        },
        output: `Defined ExtractedDoc, build_cache_key, and SQLiteExtractionCache.`,
      },
      {
        title: "2 · ประกอบ Pipeline: Cache → Small + Repair → Frontier Escalation → Safe Fallback",
        explain: "เขียน helper `_run_tier` สำหรับ repair loop แล้วต่อท่อให้ครบทั้ง 5 ขั้น โดยบันทึกผลลง SQLite เฉพาะเมื่อได้ `ExtractedDoc` ที่ผ่าน validation แล้วเท่านั้น",
        code: {
          language: "python",
          filename: "worked_day88.py",
          code: `from collections.abc import Callable


class PipelineOutcome(BaseModel):
    status: Literal["cached", "ok", "repaired", "fallback"]
    model_tier: Literal["small", "frontier", "none"]
    cache_hit: bool
    attempts: int
    record: ExtractedDoc | None
    needs_human_review: bool
    errors: list[str]


def _run_tier(
    doc_text: str,
    llm_fn: Callable[[list[dict[str, str]]], str],
    *,
    system_prompt: str,
    max_retries: int,
) -> tuple[ExtractedDoc | None, int, list[str]]:
    msgs = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": doc_text},
    ]
    errs: list[str] = []
    for attempt in range(1, max_retries + 2):
        raw = llm_fn(msgs)
        try:
            return ExtractedDoc.model_validate_json(raw), attempt, errs
        except ValidationError as exc:
            msg = "; ".join(f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors())
            errs.append(msg)
            msgs.append({"role": "assistant", "content": raw})
            msgs.append({"role": "user", "content": f"แก้จุดผิดต่อไปนี้แล้วคืน JSON เท่านั้น: {msg}"})
    return None, max_retries + 1, errs


def run_pipeline(
    doc_text: str,
    *,
    cache: SQLiteExtractionCache,
    small_llm: Callable[[list[dict[str, str]]], str],
    frontier_llm: Callable[[list[dict[str, str]]], str],
    prompt_version: str = "v1",
    schema_version: str = "s1",
    max_retries: int = 1,
    confidence_threshold: float = 0.80,
) -> PipelineOutcome:
    key = build_cache_key(doc_text, prompt_version=prompt_version, schema_version=schema_version)
    cached = cache.get(key)
    if cached is not None:
        rec, tier = cached
        return PipelineOutcome(
            status="cached", model_tier=tier, cache_hit=True, attempts=0,
            record=rec, needs_human_review=rec.needs_human_review, errors=[],
        )

    sys_prompt = f"[{prompt_version}/{schema_version}] สกัดเอกสารไทยเป็น Strict JSON"
    s_rec, s_tries, s_errs = _run_tier(doc_text, small_llm, system_prompt=sys_prompt, max_retries=max_retries)
    if s_rec is not None and s_rec.confidence >= confidence_threshold:
        cache.set(key, s_rec, "small")
        return PipelineOutcome(
            status="ok" if s_tries == 1 else "repaired", model_tier="small", cache_hit=False,
            attempts=s_tries, record=s_rec, needs_human_review=s_rec.needs_human_review, errors=s_errs,
        )

    f_rec, f_tries, f_errs = _run_tier(doc_text, frontier_llm, system_prompt=sys_prompt, max_retries=1)
    all_errs = s_errs + (["low_confidence_escalated"] if s_rec is not None else []) + f_errs
    if f_rec is not None:
        cache.set(key, f_rec, "frontier")
        return PipelineOutcome(
            status="repaired", model_tier="frontier", cache_hit=False,
            attempts=s_tries + f_tries, record=f_rec, needs_human_review=f_rec.needs_human_review, errors=all_errs,
        )

    return PipelineOutcome(
        status="fallback", model_tier="none", cache_hit=False,
        attempts=s_tries + f_tries, record=None, needs_human_review=True, errors=all_errs,
    )`,
        },
        output: `Composed run_pipeline with SQLite cache, small-first repair, frontier escalation, and safe fallback.`,
      },
      {
        title: "3 · ทดสอบการรันจริงกับ Mock Providers: Cache Hit, Version Bump และ Fallback",
        explain: "ส่งใบเสร็จเดิม 2 ครั้ง (ครั้งที่ 2 ต้อง Cache Hit ด้วย `calls=0`), ลองเปลี่ยน `prompt_version` เป็น `v2` (ต้อง Cache Miss), และส่งเอกสารเสียหาย (ต้องไม่ถูกแคช)",
        code: {
          language: "python",
          filename: "worked_day88.py",
          code: `import json

calls = {"small": 0, "frontier": 0}


def mock_small(msgs: list[dict[str, str]]) -> str:
    calls["small"] += 1
    doc = msgs[1]["content"]
    if "CORRUPT" in doc:
        return "broken text"
    if "AMBIGUOUS" in doc:
        return json.dumps({"doc_type": "support_ticket", "summary_th": "ลูกค้าสอบถามเรื่องยอด", "total_thb": None, "confidence": 0.55, "needs_human_review": False})
    return json.dumps({"doc_type": "receipt", "summary_th": "ใบเสร็จร้านกาแฟ", "total_thb": 120.0, "confidence": 0.94, "needs_human_review": False})


def mock_frontier(msgs: list[dict[str, str]]) -> str:
    calls["frontier"] += 1
    if "CORRUPT" in msgs[1]["content"]:
        return "still broken"
    return json.dumps({"doc_type": "support_ticket", "summary_th": "แจ้งปัญหาหักเงินซ้ำ", "total_thb": 500.0, "confidence": 0.97, "needs_human_review": False})


cache = SQLiteExtractionCache(":memory:")
r1 = run_pipeline("ใบเสร็จ ร้านกาแฟ 120 บาท", cache=cache, small_llm=mock_small, frontier_llm=mock_frontier, prompt_version="v1")
r2 = run_pipeline("ใบเสร็จ\\u200b  ร้านกาแฟ 120 บาท", cache=cache, small_llm=mock_small, frontier_llm=mock_frontier, prompt_version="v1")
r3 = run_pipeline("ใบเสร็จ ร้านกาแฟ 120 บาท", cache=cache, small_llm=mock_small, frontier_llm=mock_frontier, prompt_version="v2")
r4 = run_pipeline("CORRUPT scan", cache=cache, small_llm=mock_small, frontier_llm=mock_frontier, prompt_version="v1")

print("r1:", r1.status, r1.model_tier, "| r2 (dup):", r2.status, "cache_hit=", r2.cache_hit)
print("r3 (v2 bump):", r3.status, "cache_hit=", r3.cache_hit, "| r4 (corrupt):", r4.status, "review=", r4.needs_human_review)
print("Total provider calls:", calls)`,
        },
        output: `r1: ok small | r2 (dup): cached cache_hit= True
r3 (v2 bump): ok cache_hit= False | r4 (corrupt): fallback review= True
Total provider calls: {'small': 4, 'frontier': 2}`,
      },
    ],
    gotcha: "สังเกตตัวเลข `small: 4, frontier: 2` ในตัวอย่างที่ 3: เอกสาร `r1` ยิง small 1 ครั้ง, `r2` ชน cache (`0` ครั้ง!), `r3` เปลี่ยน `prompt_version` เป็น `v2` เลยยิง small 1 ครั้ง, และ `r4` (`CORRUPT`) ลอง small 2 ครั้ง (`1 + max_retries=1`) + frontier 2 ครั้ง (`1 + 1`) แล้วตก fallback อย่างปลอดภัยโดยไม่ทำให้ cache เก็บขยะ!",
  },

  practice: {
    intro: "ประกอบ Extraction Pipeline ฉบับสมบูรณ์ของ Block B22 ใน `exercise_day88.py` ที่เชื่อม Versioned SQLite Cache, Small-First Model Routing, Bounded Validation-Repair Loop, Frontier Escalation, และ Batch Telemetry แล้วพิสูจน์ทุกกรณีด้วย `pytest`",
    requirements: [
      "สร้าง `ExtractedDoc(BaseModel)` (`ConfigDict(extra=\"forbid\")`) มีฟิลด์: `doc_type: Literal[\"receipt\", \"support_ticket\", \"tax_invoice_request\"]`, `summary_th: str` (4..160 ตัวอักษรหลัง strip), `total_thb: float | None = Field(default=None, ge=0.0)`, `confidence: float` (`0.0..1.0`), `needs_human_review: bool = False` พร้อม `@model_validator` บังคับว่าหาก `total_thb is not None and total_thb >= 50000.0` ต้องมี `needs_human_review is True`",
      "สร้าง `build_cache_key(doc_text: str, *, prompt_version: str, schema_version: str) -> str` (ล้าง `\\u200b`, `\\ufeff`, ยุบช่องว่างซ้ำ, ตรวจไม่ว่างไม่งั้น `raise ValueError`, คืน SHA-256 hex) และ `SQLiteExtractionCache(db_path: str = \":memory:\")` ที่มีเมธอด `get(key) -> tuple[ExtractedDoc, str] | None`, `set(key, doc, model_tier) -> None`, `count() -> int`, และ `close() -> None` โดยใช้ parameterized SQL queries",
      "สร้าง `PipelineOutcome(BaseModel)` และ `run_extraction_pipeline(doc_text: str, *, cache: SQLiteExtractionCache, small_llm, frontier_llm, prompt_version: str = \"v1\", schema_version: str = \"s1\", max_retries: int = 1, confidence_threshold: float = 0.80) -> PipelineOutcome`: (1) ค้นหา cache ก่อน หาก hit คืน `status=\"cached\"`, `cache_hit=True`, `attempts=0`, (2) ลอง `small_llm` พร้อม repair loop สูงสุด `max_retries` รอบ หากผ่านและ `confidence >= confidence_threshold` เขียนลง cache แล้วคืนผล (`ok` หรือ `repaired`), (3) มิฉะนั้น escalate ไป `frontier_llm` (ซ่อมได้ 1 รอบ) หากผ่านเขียนลง cache แล้วคืน `status=\"repaired\"`, `model_tier=\"frontier\"`, (4) หากพังทั้งคู่คืน `status=\"fallback\"`, `model_tier=\"none\"`, `record=None`, `needs_human_review=True` โดย **ห้าม** เขียนลง cache",
      "สร้าง `summarize_pipeline_runs(outcomes: list[PipelineOutcome]) -> dict[str, float]` ที่ตรวจ `outcomes` ไม่ว่าง (ไม่งั้น `raise ValueError`) และคืน `total`, `cache_hit_rate`, `valid_rate` (รวม `cached + ok + repaired`), `frontier_rate` (นับเฉพาะ non-cached ที่เรียก `frontier`), และ `fallback_rate` ปัดทศนิยม 4 ตำแหน่ง",
    ],
    starter: {
      language: "python",
      filename: "exercise_day88.py",
      code: `from collections.abc import Callable
from datetime import datetime, timezone
import hashlib
import re
import sqlite3
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class ExtractedDoc(BaseModel):
    # TODO: ConfigDict(extra="forbid"), fields, summary_th strip/len validator, high-value HITL validator
    pass


class PipelineOutcome(BaseModel):
    status: Literal["cached", "ok", "repaired", "fallback"]
    model_tier: Literal["small", "frontier", "none"]
    cache_hit: bool
    attempts: int
    record: ExtractedDoc | None
    needs_human_review: bool
    errors: list[str]


def build_cache_key(doc_text: str, *, prompt_version: str, schema_version: str) -> str:
    """สร้าง Versioned SHA-256 Cache Key หลัง normalize ข้อความไทย."""
    # TODO: implement
    raise NotImplementedError


class SQLiteExtractionCache:
    """Persistent SQLite cache สำหรับเก็บผลสกัดที่ผ่าน Pydantic validation แล้วเท่านั้น."""

    def __init__(self, db_path: str = ":memory:") -> None:
        # TODO: connect + CREATE TABLE IF NOT EXISTS
        raise NotImplementedError

    def get(self, key: str) -> tuple[ExtractedDoc, str] | None:
        # TODO: parameterized SELECT + model_validate_json
        raise NotImplementedError

    def set(self, key: str, doc: ExtractedDoc, model_tier: str) -> None:
        # TODO: parameterized INSERT OR REPLACE
        raise NotImplementedError

    def count(self) -> int:
        # TODO: return total cached rows
        raise NotImplementedError

    def close(self) -> None:
        # TODO: close connection
        raise NotImplementedError


def run_extraction_pipeline(
    doc_text: str,
    *,
    cache: SQLiteExtractionCache,
    small_llm: Callable[[list[dict[str, str]]], str],
    frontier_llm: Callable[[list[dict[str, str]]], str],
    prompt_version: str = "v1",
    schema_version: str = "s1",
    max_retries: int = 1,
    confidence_threshold: float = 0.80,
) -> PipelineOutcome:
    """รัน Extraction Pipeline ครบวงจร: Cache -> Small + Repair -> Frontier Escalation -> Safe Fallback."""
    # TODO: implement
    raise NotImplementedError


def summarize_pipeline_runs(outcomes: list[PipelineOutcome]) -> dict[str, float]:
    """สรุปตัวชี้วัด cache_hit_rate, valid_rate, frontier_rate และ fallback_rate."""
    # TODO: implement
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_day88.py",
      code: `import json
import pytest
from exercise_day88 import (
    SQLiteExtractionCache,
    run_extraction_pipeline,
    summarize_pipeline_runs,
)


def _doc(
    doc_type: str = "receipt",
    summary: str = "ใบเสร็จร้านกาแฟไทย",
    total: float | None = 120.0,
    conf: float = 0.94,
    review: bool = False,
) -> str:
    return json.dumps({
        "doc_type": doc_type,
        "summary_th": summary,
        "total_thb": total,
        "confidence": conf,
        "needs_human_review": review,
    })


def test_sqlite_cache_hit_and_prompt_version_invalidation(tmp_path):
    db_file = str(tmp_path / "cache.db")
    cache = SQLiteExtractionCache(db_file)
    calls = {"small": 0, "frontier": 0}

    def small_fn(msgs):
        calls["small"] += 1
        return _doc()

    def frontier_fn(msgs):
        calls["frontier"] += 1
        return _doc(conf=0.99)

    r1 = run_extraction_pipeline("ใบเสร็จ  กาแฟ 120 บาท", cache=cache, small_llm=small_fn, frontier_llm=frontier_fn, prompt_version="v1")
    r2 = run_extraction_pipeline("ใบเสร็จ\\u200b กาแฟ 120 บาท", cache=cache, small_llm=small_fn, frontier_llm=frontier_fn, prompt_version="v1")
    r3 = run_extraction_pipeline("ใบเสร็จ กาแฟ 120 บาท", cache=cache, small_llm=small_fn, frontier_llm=frontier_fn, prompt_version="v2")

    assert r1.status == "ok" and r1.cache_hit is False and r1.attempts == 1
    assert r2.status == "cached" and r2.cache_hit is True and r2.attempts == 0
    assert r3.status == "ok" and r3.cache_hit is False
    assert calls == {"small": 2, "frontier": 0}
    assert cache.count() == 2
    cache.close()


def test_small_repair_and_frontier_escalation_and_no_cache_poisoning(tmp_path):
    cache = SQLiteExtractionCache(str(tmp_path / "pipeline.db"))
    calls = {"small": 0, "frontier": 0}

    def small_fn(msgs):
        calls["small"] += 1
        doc = msgs[1]["content"]
        if "CORRUPT" in doc:
            return "not json"
        if "HIGH_VAL" in doc and len(msgs) == 2:
            # พลาดรอบแรก (ลืม needs_human_review=True) -> ซ่อมผ่านรอบ 2
            return _doc(total=60000.0, review=False)
        if "HIGH_VAL" in doc:
            return _doc(total=60000.0, review=True)
        if "LOW_CONF" in doc:
            return _doc(doc_type="support_ticket", summary="ข้อความกำกวม", total=None, conf=0.50)
        return _doc()

    def frontier_fn(msgs):
        calls["frontier"] += 1
        doc = msgs[1]["content"]
        if "CORRUPT" in doc:
            return "still broken"
        return _doc(doc_type="support_ticket", summary="แจ้งปัญหาการชำระเงิน", total=None, conf=0.97)

    o_repaired = run_extraction_pipeline("HIGH_VAL receipt", cache=cache, small_llm=small_fn, frontier_llm=frontier_fn)
    assert o_repaired.status == "repaired" and o_repaired.model_tier == "small" and o_repaired.attempts == 2
    assert o_repaired.needs_human_review is True

    o_frontier = run_extraction_pipeline("LOW_CONF ticket", cache=cache, small_llm=small_fn, frontier_llm=frontier_fn)
    assert o_frontier.status == "repaired" and o_frontier.model_tier == "frontier"

    # เรียก LOW_CONF ซ้ำ -> ต้องได้ cache hit โดยไม่ยิง frontier ซ้ำ
    before_f = calls["frontier"]
    o_frontier_cached = run_extraction_pipeline("LOW_CONF ticket", cache=cache, small_llm=small_fn, frontier_llm=frontier_fn)
    assert o_frontier_cached.status == "cached" and o_frontier_cached.cache_hit is True
    assert calls["frontier"] == before_f

    # CORRUPT -> fallback และห้ามบันทึกลง cache
    count_before_corrupt = cache.count()
    o_fb = run_extraction_pipeline("CORRUPT scan", cache=cache, small_llm=small_fn, frontier_llm=frontier_fn)
    assert o_fb.status == "fallback" and o_fb.record is None and o_fb.needs_human_review is True
    assert cache.count() == count_before_corrupt

    summary = summarize_pipeline_runs([o_repaired, o_frontier, o_frontier_cached, o_fb])
    assert summary["total"] == 4.0
    assert summary["cache_hit_rate"] == pytest.approx(0.25)
    assert summary["valid_rate"] == pytest.approx(0.75)
    assert summary["frontier_rate"] == pytest.approx(0.25)
    assert summary["fallback_rate"] == pytest.approx(0.25)
    cache.close()


def test_validation_guards():
    with pytest.raises(ValueError):
        summarize_pipeline_runs([])
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` แล้วผ่านครบทั้ง 3 test functions ด้วย SQLite จริงใน `tmp_path` ในเวลา < 1 วินาที",
      "ตรวจว่าเอกสารซ้ำ (แม้ติด `\\u200b` และช่องว่างซ้ำ) ได้ `status=\"cached\"` และไม่เพิ่มตัวนับ `small`/`frontier`",
      "ตรวจว่าการเปลี่ยน `prompt_version` จาก `v1` เป็น `v2` ทำให้เกิด Cache Miss และสกัดใหม่อย่างถูกต้อง",
      "ตรวจว่าเคส `HIGH_VAL` ซ่อมผ่านที่ Small Model ในรอบที่ 2 และเคส `CORRUPT` ตก `fallback` โดยไม่เพิ่มจำนวนแถวใน SQLite Cache",
      "รัน `uv run ruff check .` แล้วไม่มี lint warning",
    ],
    acceptance: "ผ่านทุกเทสต์ใน `test_day88.py` ด้วย `uv run pytest -q` และผ่าน `uv run ruff check .`",
    hints: [
      {
        body: "ใน `SQLiteExtractionCache.get(key)` อย่าลืมครอบ `ExtractedDoc.model_validate_json(row[0])` ด้วย `try / except ValidationError` เพื่อคืน `None` หากข้อมูลใน cache เสียหายหรือไม่ตรงกับ schema รุ่นปัจจุบัน",
      },
      {
        body: "ใน `summarize_pipeline_runs` ระวังนิยามของ `frontier_rate`: ให้นับเฉพาะคำขอที่ `not o.cache_hit and o.model_tier == \"frontier\"` (ไม่นับคำขอที่ตอบจาก cache) เพื่อสะท้อนต้นทุนการเรียก Frontier API จริง",
      },
      {
        body: "โครงของ `summarize_pipeline_runs` และ `SQLiteExtractionCache` พร้อมแล้ว — เติม `ExtractedDoc`, `build_cache_key`, และ `run_extraction_pipeline` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_day88.py",
          code: `def summarize_pipeline_runs(outcomes: list[PipelineOutcome]) -> dict[str, float]:
    if not outcomes:
        raise ValueError("outcomes must not be empty")
    n = len(outcomes)
    cache_hits = sum(o.cache_hit for o in outcomes)
    valid = sum(o.status in {"cached", "ok", "repaired"} for o in outcomes)
    frontier_live = sum((not o.cache_hit) and o.model_tier == "frontier" for o in outcomes)
    fallbacks = sum(o.status == "fallback" for o in outcomes)
    return {
        "total": float(n),
        "cache_hit_rate": round(cache_hits / n, 4),
        "valid_rate": round(valid / n, 4),
        "frontier_rate": round(frontier_live / n, 4),
        "fallback_rate": round(fallbacks / n, 4),
    }`,
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
      title: "เขียนผลลัพธ์ `fallback` หรือ JSON พังลง SQLite Cache (Cache Poisoning)",
      symptom: "เอกสารที่เคยพังตอน API สะดุดถูกจำค่าพังไว้ในฐานข้อมูลตลอดไป แม้ส่งมารันใหม่วันรุ่งขึ้นก็ยังคืน fallback เดิม",
      fix: "เรียก `cache.set(...)` เฉพาะเมื่อ `ExtractedDoc.model_validate_json(...)` ผ่านสมบูรณ์แล้วเท่านั้น",
    },
    {
      title: "ต่อสตริง SQL ตรง ๆ (`f\"WHERE cache_key = '{key}'\"`) แทน Parameterized Query",
      symptom: "เสี่ยง SQL Injection และพังทันทีเมื่อมีอักขระพิเศษอย่าง `'` หลุดเข้ามา",
      fix: "ใช้ `?` placeholder ของ `sqlite3` (`execute(\"... WHERE cache_key = ?\", (key,))`) ทุกครั้งตามหลัก Day 26–27",
    },
    {
      title: "ลืมตรวจสอบ ValidationError ตอนอ่าน JSON กลับจาก SQLite Cache",
      symptom: "พอเพิ่มฟิลด์ใหม่ใน Pydantic Model แล้วเปิดใช้ฐานข้อมูล cache เก่า แอปแครชด้วย `ValidationError` แทนที่จะสกัดใหม่",
      fix: "รวม `schema_version` ไว้ใน Cache Key และครอบ `model_validate_json` ตอนอ่าน cache ด้วย `try/except ValidationError` ให้ตกเป็น Cache Miss อย่างนุ่มนวล",
    },
    {
      title: "ใช้ไฟล์ `cache.db` ตัวเดียวกันในทุกฟังก์ชันของ `pytest`",
      symptom: "เทสต์ข้อแรกผ่าน แต่เทสต์ข้อที่สองชน Cache Hit ที่ค้างจากข้อแรกจน assert จำนวนการเรียก mock provider พัง",
      fix: "ใช้ `pytest` {{fixture}} `tmp_path / \"test.db\"` หรือ `\":memory:\"` แยกฐานข้อมูลให้แต่ละ test case เป็นอิสระ 100%",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d088-q1",
        "(Interleaved Recall · D85) ทีมของคุณสร้าง Extraction Pipeline พร้อม SQLite Cache และ Model Routing เสร็จในวันนี้ ผลทดสอบได้ Accuracy 94%, Schema Valid 99.5%, ต้นทุน `$0.70/1k docs` และมีปริมาณ 40,000 เอกสาร/เดือน — ก้าวถัดไปที่เหมาะสมที่สุดคืออะไร?",
        [
          ["รีบทำ Full Fine-Tune โมเดล 70B ทันทีเพื่อให้ทันสมัย", "ขัดกับ Escalation Ladder และไม่คุ้ม TCO ที่ปริมาณ 40k docs/เดือน"],
          ["หยุดที่ Pipeline นี้แล้วเดินหน้าจัดการ Edge Cases และทำ Eval Report (Block B23) เพราะผ่าน SLA ทุกข้อและคุ้มต้นทุนแล้ว ไม่จำเป็นต้อง Fine-Tune", "ถูก — ตามกรอบ D85 เราจะ Fine-Tune เฉพาะเมื่อ Prompt+Pipeline ถึงทางตันหรือมีปริมาณสูงมากจนคุ้มจุดคุ้มทุนเท่านั้น"],
          ["ปิด SQLite Cache ทิ้งเพื่อให้โมเดลได้ฝึกทำงานหนักขึ้น", "การปิด cache ทำให้ต้นทุนและ latency แย่ลงโดยไม่ได้ประโยชน์ใด ๆ"],
          ["เปลี่ยนไปยิง Frontier Model 100% ทุกเอกสาร", "เพิ่มค่า API หลายเท่าทั้งที่ Small-First Routing ทำได้ถึงเป้าแล้ว"],
        ],
        "B",
        "เมื่อ Prompt + Routing + Cache ผ่านเกณฑ์ SLA ทั้งความแม่นยำ ความเร็ว และต้นทุนแล้ว ไม่จำเป็นต้องเพิ่มความซับซ้อนและต้นทุนคงที่ของการ Fine-Tuning",
        "เมื่อ Pipeline แบบ Prompt + Routing + Cache ผ่านทุก SLA แล้ว ควร Fine-Tune ต่อหรือไม่?",
        "ไม่ควร — ยึดหลัก Escalation Ladder (D85): Fine-Tune เฉพาะเมื่อ Eval พิสูจน์ว่าถึงทางตันหรือปริมาณสูงจน Distillation คืนทุนชัดเจน",
      ),
      mc(
        "d088-q2",
        "(Interleaved Recall · D86) หากในอนาคตคุณนำผลสกัดจากตาราง `extraction_cache` จำนวน 800 แถวไปเตรียมทำ QLoRA บน GPU 16 GB ข้อใดต้องทำก่อนเริ่มเทรน?",
        [
          ["โยนไฟล์ JSONL เข้าเทรนทันทีโดยไม่ต้องแบ่ง validation split", "ห้ามทำ — จะไม่มีทางวัดได้ว่าโมเดล overfit หรือแม่นขึ้นจริง"],
          ["รัน SFT Auditor ตรวจ Pydantic schema ทุกแถว, ล้าง `\\u200b`/ช่องว่างซ้ำ, ลบแถวซ้ำ, และแยก train/val ให้ปลอด data leakage", "ถูก — ความสะอาดของข้อมูลและการกัน leakage เป็นปัจจัยชี้ขาดคุณภาพของ LoRA/QLoRA"],
          ["เปลี่ยนน้ำหนักฐานเป็น FP64 เพื่อให้ละเอียดขึ้น", "FP64 กิน VRAM มหาศาลและรันบน GPU 16 GB ไม่ได้ — QLoRA ใช้ 4-bit NF4 base + 16-bit adapters"],
          ["ตั้งค่าเริ่มต้นเมทริกซ์ `A = 0` และ `B = 0` ทั้งคู่", "หากตั้งศูนย์ทั้งคู่ gradient จะติดศูนย์และเมทริกซ์จะไม่เรียนรู้ ต้องสุ่ม `A` และตั้ง `B = 0`"],
        ],
        "B",
        "คุณภาพชุดข้อมูล SFT (schema consistency, Thai whitespace hygiene, deduplication, leak-free split) คือด่านบังคับก่อนเทรน LoRA/QLoRA เสมอ",
        "ทำไมการนำข้อมูลจาก `extraction_cache` ไปทำชุดเทรน QLoRA จึงยังต้องผ่าน SFT Auditor ก่อน?",
        "เพื่อลบแถวซ้ำหลัง normalize ภาษาไทย ตรวจความสอดคล้องของ label/schema และแยก train/val ให้ปลอด data leakage",
      ),
      mc(
        "d088-q3",
        "(Interleaved Recall · D27 + D87) ใน Extraction Pipeline วันนี้ เมื่อทีมปรับปรุงคำสั่งสกัดเอกสารและเปลี่ยน `prompt_version` จาก `\"v1\"` เป็น `\"v2\"` จะเกิดอะไรขึ้นกับเอกสารใบเสร็จเดิมที่เคยอยู่ใน SQLite Cache?",
        [
          ["ระบบจะคืนผลลัพธ์เดิมจาก `v1` ต่อไปจนกว่าจะลบไฟล์ `.db` ทิ้ง", "ไม่จริง — นั่นคือบั๊กที่เกิดเฉพาะตอนลืมใส่ `prompt_version` ลงใน Cache Key"],
          ["Cache Key (SHA-256) เปลี่ยนไป ทำให้เกิด Cache Miss อัตโนมัติ ระบบจะสกัดใหม่ด้วย `v2` แล้วบันทึกผลลัพธ์ใหม่ลงตาราง", "ถูก — Versioned Cache Key ช่วยทำ zero-downtime invalidation ได้อย่างสะอาด"],
          ["SQLite จะโยน `OperationalError` เพราะเวอร์ชันไม่ตรงกัน", "ตารางเก็บ `cache_key` เป็น primary key string ธรรมดา ไม่เกิด error ใด ๆ"],
          ["ระบบจะข้าม Small Model แล้วบังคับยิง Frontier Model เสมอ", "เส้นทาง routing ยังทำงานตามปกติ (ลอง Small Model ก่อน)"],
        ],
        "B",
        "เพราะ `prompt_version` เป็นส่วนหนึ่งของอินพุตก่อนแฮช SHA-256 การเปลี่ยนเวอร์ชันจึงสร้างคีย์ใหม่และสั่งสกัดใหม่อัตโนมัติโดยไม่ชนผลเก่า",
        "การเปลี่ยน `prompt_version` ส่งผลต่อ `SQLiteExtractionCache` อย่างไร?",
        "ทำให้ SHA-256 Cache Key เปลี่ยน เกิด Cache Miss อัตโนมัติ เพื่อให้เอกสารเดิมถูกสกัดใหม่ด้วย prompt รุ่นล่าสุด",
      ),
      mc(
        "d088-q4",
        "(Interleaved Recall · D78 + D79) เอกสารทิกเก็ตลูกค้าใบหนึ่งทำให้ Small Model ตอบ `confidence = 0.52` (ต่ำกว่าเกณฑ์ `0.80`) แม้จะผ่าน Pydantic Schema ครบทุกฟิลด์แล้ว Pipeline ควรทำอย่างไรต่อไป?",
        [
          ["บันทึกลง SQLite Cache ทันทีเพราะผ่าน Pydantic Schema แล้ว", "อันตราย — คำตอบที่โมเดลเล็กไม่มั่นใจอาจจัดหมวดหมู่ผิด และถ้าแคชไว้ความผิดนั้นจะถูกเสิร์ฟซ้ำ"],
          ["Escalate ไปยัง Frontier Model เพื่อให้ช่วยสกัดใหม่ และหาก Frontier ผ่านการตรวจสอบค่อยบันทึกลง SQLite Cache", "ถูก — Confidence Gate ช่วยดึงเคสกำกวม 15%–20% ไปให้โมเดลใหญ่จัดการแล้วแคชผลที่เชื่อถือได้ไว้ใช้ซ้ำ"],
          ["โยน `RuntimeError` เพื่อหยุดการทำงานทั้ง batch", "ห้ามทำให้ batch ล่ม — Pipeline ต้องจัดการผ่าน escalation และ safe fallback"],
          ["ลด `confidence_threshold` ลงเหลือ `0.10` เพื่อให้ทุกอย่างผ่านง่ายขึ้น", "การลด threshold โดยไม่มีผล eval รองรับจะทำให้เคสผิดพลาดหลุดเข้า production"],
        ],
        "B",
        "การผ่าน Schema ไม่ได้แปลว่าคำตอบมั่นใจหรือถูกต้อง — เมื่อ `confidence < threshold` ต้อง escalate ไป Frontier Model และบันทึกผลจาก Frontier ลง cache เฉพาะเมื่อผ่าน validation แล้ว",
        "เมื่อ Small Model ผ่าน Schema แต่ `confidence < threshold` Pipeline ควรทำอะไร?",
        "ไม่แคชผลของ Small Model แต่ escalate ไปยัง Frontier Model หากผ่านการตรวจสอบจึงบันทึกผลของ Frontier ลง SQLite Cache",
      ),
    ],
  },

  takeaways: [
    "ต่อท่อ **5 ชั้นครบวงจร**: Normalize & Versioned SHA-256 Key → {{sqlite}} Cache Lookup → Small Model ({{structured-output}}) + Bounded Repair Loop → Frontier Escalation → Safe Fallback ({{hitl}})",
    "ป้องกัน **Cache Poisoning** ด้วยกฎเหล็ก: บันทึกลง SQLite เฉพาะผลลัพธ์ที่ผ่าน {{pydantic}} validation สมบูรณ์แล้ว และผูก key กับ `prompt_version` + `schema_version` เสมอ",
    "ทดสอบทั้ง SQLite ไฟล์จริง (ผ่าน `pytest` `tmp_path`) และ provider behavior (ผ่าน {{mocking}}) ให้จบในเวลา < 1 วินาทีบนเครื่องโดยไม่เสียค่า API",
    "พร้อมเข้าสู่บล็อกสุดท้ายของ Phase 3 (**Block B23: Days 89–92**) เพื่อเพิ่มการรับมือ Edge Cases ภาษาไทย วัดผล Accuracy/Latency/Cost และขึ้น Demo เทียบ ML Baseline!",
  ],

  reviewCards: [
    rc(
      "d088-rc-1",
      "ลำดับการประมวลผล 4 ด่านของ Extraction Pipeline จากต้นทุนต่ำสุดไปสูงสุดคืออะไร?",
      "1) Versioned SQLite Cache (`$0`, `<2ms`) → 2) Small/Local Model + Bounded Repair → 3) Frontier Escalation → 4) Deterministic Safe Fallback (`needs_human_review=True`)",
    ),
    rc(
      "d088-rc-2",
      "เหตุใดตอนอ่าน JSON กลับจาก SQLite Cache จึงควรเรียก `model_validate_json()` ครอบด้วย `try/except ValidationError`?",
      "เพื่อกันแอปแครชหากข้อมูลเก่าใน cache เสียหายหรือไม่ตรงกับ Pydantic schema รุ่นใหม่ โดยให้ตกเป็น Cache Miss แล้วสกัดใหม่อย่างปลอดภัย",
    ),
    rc(
      "d088-rc-3",
      "ทำไมจึงควรใช้ `pytest` fixture `tmp_path` แทนไฟล์ `cache.db` คงที่ตอนเขียนเทสต์ SQLite Cache?",
      "เพื่อให้แต่ละ test case มีไฟล์ SQLite แยกอิสระไม่ชนข้อมูลค้างจากเทสต์ก่อนหน้า ทำให้ผลทดสอบทำซ้ำได้ (reproducible) 100%",
    ),
  ],

  sources: [
    { label: "Python Docs — sqlite3 Parameterized Queries & Connection Management", href: "https://docs.python.org/3/library/sqlite3.html" },
    { label: "pytest Docs — Temporary Directories and Files (tmp_path fixture)", href: "https://docs.pytest.org/en/stable/how-to/tmp_path.html" },
    { label: "Pydantic v2 Docs — Serialization (model_dump_json & model_validate_json)", href: "https://docs.pydantic.dev/latest/concepts/serialization/" },
    { label: "Ollama Docs — Structured Outputs & Local Model API", href: "https://ollama.com/blog/structured-outputs" },
  ],

  glossary: ["sqlite", "caching", "pydantic", "validation-error", "structured-output", "mocking", "prompt-versioning", "hitl"],
});
