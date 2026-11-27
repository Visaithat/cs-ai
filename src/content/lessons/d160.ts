import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D160 — Phase 6 / Block B40 (Milestone 1)
 * Milestone 1: Architecture & Corpus Sign-off
 */
export const d160: Lesson = defineLesson({
  day: 160,
  titleTh: "Milestone 1: ตรวจรับสถาปัตยกรรม โครงสร้าง Repo และคลังข้อมูลสองภาษา",
  tagline: "30 นาที · Milestone 1 Sign-off · รวมด่านตรวจ ADR, Repo Scaffold, Corpus ≥ 20 ฉบับ และ PDPA PII Check ก่อนสร้าง RAG",
  icon: "badge-check",
  visual: {
    id: "capstone-scaffold-corpus",
    title: "B40 ขั้นที่ 3 — Milestone 1 Gate & Sign-off",
    caption: "รวมผลตรวจ ADR-001, Repo Scaffold (Ruff/pytest/Compose) และความสะอาดคลังข้อมูล 20+ ฉบับ ก่อนอนุมัติเข้า Block B41",
    alt: "แผนภาพขั้นตอน B40 แสดงส่วน D160 Milestone 1 Gate ที่ตรวจรับ ADR-001, ความสะอาด UTF-8/Schema และผล pytest/ruff 0 error",
  },
  requiresApiKey: false,
  tools: ["pytest", "Ruff", "Pydantic", "PDPA Regex Gate", "Milestone Report"],

  bigPicture: [
    {
      node: 0,
      heading: "ทวนความสอดคล้องของโจทย์และ ADR-001 ก่อนลงมือสร้างระบบจริง",
      body: "จุดตัดสำคัญที่สุดของโปรเจกต์คือรอยต่อระหว่างการออกแบบ (B40) กับการสร้างระบบค้นหา (B41) — หากสถาปัตยกรรมหรือสิทธิ์เครื่องมือยังคลุมเครือ การรีบเขียนโค้ดจะเสียเวลาแก้ซ้ำ",
      lessonNote: "Milestone 1 บังคับให้เราตรวจว่า `docs/ADR-001.md` มี User Stories ครบ 3 เส้นทาง, Non-Goals ชัดเจน, และล็อก SLA ครบแล้ว",
    },
    {
      node: 1,
      heading: "รับรองความสะอาดและความปลอดภัย (PDPA) ของคลังเอกสาร",
      body: "หากมีเลขบัตรประชาชนไทย 13 หลักหรือเบอร์มือถือจริงหลุดเข้าไปในคลังความรู้ตั้งแต่ Day 160 ข้อมูลนั้นจะถูกทำดัชนีและถูกดึงไปตอบผู้ใช้ทุกคนในสัปดาห์หน้า",
      lessonNote: "วันนี้เราเพิ่มตัวสแกน {{pdpa}} PII Hygiene Gate ตรวจไฟล์คลัง 20+ ฉบับคู่กับ {{schema}} และ {{acl}} ก่อนเซ็นรับรองข้อมูล",
    },
    {
      node: 3,
      heading: "เปลี่ยนการ 'เช็กด้วยตา' ให้เป็น Milestone 1 Automated Gate",
      body: "การเปิดโฟลเดอร์ดูด้วยตาเปล่ามักพลาดรายละเอียดเล็ก ๆ อย่าง `uv.lock` ไม่อัปเดต, `ruff` มี warning, หรือเอกสารขาดหมวด `table`",
      lessonNote: "คุณจะได้รวมตัวตรวจจาก D157, D158, และ D159 เข้าเป็นฟังก์ชัน Gate เดียวที่คืน `SIGNED_OFF` หรือ `BLOCKED` พร้อมรายการสิ่งที่ต้องซ่อม",
    },
    {
      node: 6,
      heading: "ส่งมอบหลักฐาน Sign-off เข้าสู่ Block B41 (Hybrid RAG)",
      body: "เมื่อ Milestone 1 ผ่าน 100% ทีมและผู้ตรวจจะมั่นใจได้ว่าฐานข้อมูล, โครงสร้าง repo, และ `corpus_manifest.jsonl` พร้อมรับ pipeline การตัดคำและสร้าง index ในวันพรุ่งนี้",
      lessonNote: "เราจะบันทึกผล Sign-off เก็บเป็นหลักฐานใน `docs/milestone-1-signoff.json` ก่อนเริ่มสร้าง Ingestion Pipeline ใน Day 161",
    },
  ],

  objectives: [
    "**บูรณาการด่านตรวจทั้ง 3 ส่วน** ของ Block B40 (ADR-001 + Repo Scaffold + 20+ Bilingual Corpus) เข้าด้วยกันเป็น Milestone 1 Automated Gate",
    "**เขียนตัวสแกน PDPA Hygiene** ตรวจจับเลขบัตรประชาชนไทย 13 หลักและเบอร์โทรศัพท์มือถือที่ยังไม่ถูก mask ออกจากคลังความรู้ก่อนเข้าสู่ขั้นตอน indexing",
    "**ออกรายงาน Sign-off** แบบ {{pydantic}} (`SIGNED_OFF` / `BLOCKED`) ที่ระบุสาเหตุชัดเจนเมื่อยังไม่ผ่าน เพื่อตัดสินใจ Go/No-Go เข้าสู่ Block B41",
  ],

  prerequisites: [
    "ผ่านบทเรียนและแบบฝึกหัด Day 157 (ADR), Day 158 (Repo Scaffold), และ Day 159 (Thai/Bilingual Corpus)",
    "มีโฟลเดอร์ `thai-enterprise-assistant/` ที่มีไฟล์ `docs/ADR-001.md`, `pyproject.toml`, `docker-compose.yml` และคลังเอกสาร",
    "ใช้งาน `uv run pytest` และ `uv run ruff check .` บนเครื่องได้คล่อง",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro: "เตรียมรันการตรวจสอบรวมของ Block B40 ในโปรเจกต์ `thai-enterprise-assistant/` เพื่อเช็กว่าสภาพแวดล้อมและไฟล์งานพร้อมสำหรับ Milestone 1",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
uv run ruff check .
uv run pytest -q
ls -la docs/ data/corpus/processed/`,
    steps: [
      ["lint", "รัน `uv run ruff check .` ผ่าน 0 errors บนซอร์สโค้ดที่มีอยู่"],
      ["tests", "รัน `uv run pytest -q` ของ D157–D159 ผ่านทั้งหมด"],
      ["signoff", "พร้อมเขียนสคริปต์ Milestone 1 Gate และออกรายงาน Sign-off"],
    ],
    note: "Milestone 1 คือจุดทบทวนแบบ Interleaved ของทั้งสัปดาห์ B40 — ใช้เวลาทวนข้อผิดพลาดที่เคยเจอใน D157–D159 ให้เรียบร้อยก่อนก้าวสู่ B41",
  },

  concepts: [
    {
      id: "milestone-gate-discipline",
      title: "1 · ทำไมต้องมี Milestone 1 Gate ก่อนเขียน Hybrid RAG?",
      paragraphs: [
        "ในวงจรพัฒนาซอฟต์แวร์ AI ความผิดพลาดที่แก้แพงที่สุดคือ **ความผิดพลาดเชิงฐานราก** (เช่น ลืม {{acl}} ใน metadata, ใช้ข้อความไทยที่เต็มไปด้วย `\\u200b`, หรือยังไม่ได้ตกลง Non-Goals ใน {{adr}}) เพราะพอคุณสร้าง pipeline ตัด chunk, ยิง embedding, และผูก LangGraph ทับลงไปแล้ว การรื้อฐานจะกระทบโค้ดทุกชั้น",
        "แนวคิดของ **Milestone Gate** คือการตั้งจุดตรวจที่มีเกณฑ์เป็นกลางแบบ `Pass / Blocked`: ทุกองค์ประกอบของ B40 ต้องผ่านพร้อมกันในคำสั่งเดียว ไม่ใช่แค่ *\"เหมือนจะครบแล้ว\"* หากมีแม้แต่ 1 blocker Gate จะปฏิเสธแบบ {{fail-fast}} และพิมพ์รายการที่ต้องแก้ไขออกมาทันที",
      ],
      analogy: "เหมือนการตรวจฐานรากและเสาเข็มก่อนขึ้นโครงหลังคา — วิศวกรโยธาจะไม่ยอมให้ก่อผนังจนกว่าจะเซ็นใบรับรองความแข็งแรงของฐานรากครบทุกจุด",
      bullets: [
        "**Pillar 1 (D157)**: มี `ADR-001` ที่ครบ User Stories 3 เส้นทาง, Alternatives >= 2 และล็อก SLA (`Recall@5 >= 0.85`, PDPA = True)",
        "**Pillar 2 (D158)**: Repo Scaffold ครบ (`uv.lock`, `pyproject.toml` มี Ruff/pytest, `docker-compose.yml` มี healthcheck, `.env.example` ไร้ secret)",
        "**Pillar 3 (D159)**: คลังความรู้ ≥ 20 ฉบับ ครบ 4 หมวด (`policy`, `faq`, `table`, `runbook`), ผ่าน Unicode NFC และมี `acl_roles`",
        "**Pillar 4 (D160)**: ผ่าน PDPA PII Hygiene Scan — ไม่มีข้อมูลส่วนบุคคลดิบปะปนในคลังความรู้สาธารณะ",
      ],
      whyTitle: "Why this matters — ลดความเสี่ยงพังสะสมใน Milestone 2–5",
      whyParagraphs: [
        "ผู้เรียนที่ข้ามการเช็กพื้นฐานใน B40 มักไปติดปัญหาใน D164 (Milestone 2) เมื่อ `Recall@5` ไม่ถึง 0.85 แล้วไล่แก้โค้ด search อยู่นาน ทั้งที่ต้นเหตุจริงคือตารางใน corpus เละตั้งแต่ D159",
        "Milestone 1 Gate ช่วยให้คุณปิดความเสี่ยงเหล่านี้ตั้งแต่ต้นด้วยต้นทุนเวลาเพียงไม่กี่นาที",
      ],
    },
    {
      id: "pdpa-corpus-hygiene",
      title: "2 · PDPA PII Hygiene Check ในคลังเอกสาร (ป้องกัน Leak ก่อน Index)",
      paragraphs: [
        "กฎทองของ {{pdpa}} ในระบบ RAG องค์กรคือ **ข้อมูลส่วนบุคคลที่ไม่จำเป็นต้องเผยแพร่ ห้ามหลุดเข้าไปในคลังความรู้รวม (Shared Knowledge Base)** ตั้งแต่แรก — โดยเฉพาะเลขบัตรประชาชนไทย 13 หลัก (ทั้งรูปแบบติดกัน `1100700123456` และแบบมีขีด `1-1007-00123-45-6`) หรือเบอร์โทรศัพท์มือถือไทย (`08x-xxx-xxxx`, `06x`, `09x`)",
        "แม้ใน Phase 5 (B38) และ Phase 6 (D173) เราจะมี PDPA Redaction Middleware คอยปิดบัง PII ตอนรับ-ส่ง API ก็ตาม แต่แนวคิด **Defense in Depth** กำหนดให้เราสแกนคลังเอกสารตั้งแต่ Milestone 1 ด้วย — หากเผลอมีไฟล์ตัวอย่างที่มี PII ดิบหลุดเข้ามา Gate ต้องจับได้ทันทีและบังคับให้ลบหรือแทนที่ด้วย `[REDACTED]` / ข้อมูลสมมติชัดเจน (เช่น `02-000-0000`)",
      ],
      analogy: "เหมือนการตรวจคัดกรองสัมภาระก่อนเอาของเข้าคลังสินค้า — แค่มีกล้องวงจรปิดตอนส่งของออกยังไม่พอ ต้องไม่ให้วัตถุอันตรายถูกจัดเก็บขึ้นชั้นวางตั้งแต่แรกด้วย",
      code: {
        language: "python",
        filename: "pdpa_hygiene.py",
        code: `import re

THAI_ID_RE = re.compile(r"(?<!\\d)(?:\\d{13}|\\d-\\d{4}-\\d{5}-\\d{2}-\\d)(?!\\d)")
THAI_MOBILE_RE = re.compile(r"(?<!\\d)0[689]\\d-?\\d{3}-?\\d{4}(?!\\d)")


def scan_pii_leaks(text: str) -> list[str]:
    findings: list[str] = []
    if THAI_ID_RE.search(text):
        findings.append("thai_national_id")
    if THAI_MOBILE_RE.search(text):
        findings.append("thai_mobile_phone")
    return findings


print("Clean doc:", scan_pii_leaks("ติดต่อศูนย์บริการ 02-000-0000 หรืออ้างอิง INV-2026-009"))
print("Dirty doc:", scan_pii_leaks("ลูกค้าคุณสมชาย 1-1007-00123-45-6 โทร 081-234-5678"))`,
        caption: "แยก pattern เบอร์ติดต่อองค์กรจำลอง (02-000-0000) และเลขเอกสาร (INV-2026-009) ออกจากเลขบัตรประชาชนและเบอร์มือถือจริง",
      },
      whyTitle: "Why this matters — หลักฐานความใส่ใจเรื่อง PDPA ที่จับต้องได้",
      whyParagraphs: [
        "เวลาองค์กรไทยประเมินผู้สมัคร AI Engineer คำถามแรก ๆ มักเป็น *\"คุณป้องกันข้อมูลลูกค้าหลุดเข้า Vector DB ได้อย่างไร?\"*",
        "การมี PDPA Hygiene Scan ตั้งแต่ขั้นเตรียม Corpus + Middleware ขั้น API แสดงให้เห็นว่าคุณออกแบบความปลอดภัยแบบครบวงจร ไม่ใช่แค่แปะสติกเกอร์ตอนท้าย",
      ],
    },
    {
      id: "signoff-artifact-and-handoff",
      title: "3 · ออกเอกสาร Sign-off และส่งมอบสัญญาข้อมูลให้ Block B41",
      paragraphs: [
        "ผลลัพธ์ของ Milestone 1 ไม่ควรเป็นแค่คำว่า *\"ผ่านแล้ว\"* ใน terminal ที่เลื่อนหายไป แต่ควรสร้างไฟล์หลักฐานที่ตรวจสอบย้อนกลับได้ ({{reproducibility}}) โดยใช้ {{pydantic}} {{schema}} สรุปสถานะทั้ง 4 ด้าน, จำนวนเอกสาร, แฮชรวมของ manifest, และ timestamp",
        "นอกจากนี้ สัญญาข้อมูลจาก Milestone 1 (`corpus_manifest.jsonl`) จะถูกส่งต่อให้ **Day 161 (Token-Aware Chunking)** โดยตรง: Day 161 จะคาดหวังว่าทุกแถวมี `doc_id`, `acl_roles`, `has_table`, `content_sha256` และข้อความไทยที่เป็น NFC สะอาดแล้ว",
      ],
      analogy: "เหมือนใบส่งมอบงานระหว่างทีมวางผัง-จัดซื้อกับทีมก่อสร้าง — ระบุครบว่าแบบแปลนอนุมัติแล้ว, พื้นที่พร้อม, วัสดุครบ 20+ รายการ, ตรวจความปลอดภัยผ่าน และพร้อมเริ่มเทคอนกรีตในวันรุ่งขึ้น",
      code: {
        language: "json",
        filename: "docs/milestone-1-signoff.json (example)",
        code: `{
  "milestone": "M1_ARCHITECTURE_AND_CORPUS",
  "status": "SIGNED_OFF",
  "checks": {
    "adr_001_valid": true,
    "scaffold_valid": true,
    "corpus_docs": 22,
    "categories_covered": ["policy", "faq", "table", "runbook"],
    "pii_findings_count": 0
  },
  "blockers": [],
  "handoff_target": "B41_D161_INGESTION_AND_CHUNKING"
}`,
        caption: "Sign-off Artifact แบบโครงสร้างชัดเจน ใช้เก็บเป็นหลักฐานใน repo และตรวจซ้ำใน GitHub Actions ได้",
      },
      whyTitle: "Why this matters — พร้อมเดินหน้าสร้าง Hybrid RAG อย่างมั่นใจ",
      whyParagraphs: [
        "เมื่อ Milestone 1 ขึ้น `SIGNED_OFF` คุณมีครบทั้งพิมพ์เขียวสถาปัตยกรรม, โครงสร้าง repo ที่รัน `pytest` + `ruff` ได้ทันที, และคลังความรู้ไทย/อังกฤษ 20+ ฉบับ",
        "ใน Day 161–164 (Block B41) คุณจะต่อท่อ Token-Aware Chunking, PyThaiNLP BM25 + Vector RRF และ Cross-Encoder Reranker ลงบนฐานที่มั่นคงนี้ได้ทันที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Sprint 0 / Definition of Ready สู่ Milestone 1 Gate",
      body: [
        "ในทีม Web Product ก่อนเริ่ม Sprint 1 คุณมักมี **Definition of Ready (DoR)** เพื่อยืนยันว่า Figma/Spec ครบ, Repo & CI บูตได้, และ Seed DB พร้อม — Milestone 1 ก็คือ Definition of Ready ของระบบ AI",
      ],
      table: [
        ["ADR-001 + SLA Contract (D157)", "Product Spec + API Contract + Non-functional SLA"],
        ["Repo Scaffold + Compose (D158)", "Starter Repo + ESLint + Vitest + Local Postgres"],
        ["20+ Corpus + ACL (D159)", "Validated Seed Data + RBAC Fixtures"],
        ["Milestone 1 Sign-off (D160)", "Sprint 0 Readiness Gate ก่อนเริ่ม Feature Sprint"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม Milestone Day ต้องตรวจซ้ำของเดิมทั้งหมด",
      body: [
        "เวลาทำโปรเจกต์หลายวันติดกัน เรามักจำได้ว่า *\"วันก่อนฉันแก้ไฟล์นี้ไปแล้ว\"* แต่ไม่ทันสังเกตว่าเมื่อวานไปแก้ config อีกตัวแล้วทำให้ของวันก่อนพังโดยไม่รู้ตัว",
        "Milestone Gate จึงรวบการตรวจของ D157, D158 และ D159 มารันพร้อมกันในชุดเดียว เพื่อยืนยันว่าทุกชิ้นยังทำงานร่วมกันได้ 100% ก่อนขยับไปบทใหม่",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองสร้างและรัน **Milestone 1 Readiness Gate** ที่รวมผลตรวจจาก ADR, Scaffold, Corpus Coverage และ PDPA PII Scanner เพื่อตัดสินใจว่าพร้อม `SIGNED_OFF` หรือยัง `BLOCKED` กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · สร้างตัวสแกน PDPA PII สำหรับเอกสารในคลังความรู้",
        explain:
          "ตรวจจับเลขบัตรประชาชน 13 หลักและเบอร์มือถือไทยที่ยังไม่ถูก mask แต่ไม่พลาดจับเลขรหัสใบแจ้งหนี้อย่าง `INV-2026-009` หรือเบอร์องค์กร `02-000-0000`",
        code: {
          language: "python",
          filename: "worked_milestone1.py",
          code: `import re

THAI_ID_RE = re.compile(r"(?<!\\d)(?:\\d{13}|\\d-\\d{4}-\\d{5}-\\d{2}-\\d)(?!\\d)")
THAI_MOBILE_RE = re.compile(r"(?<!\\d)0[689]\\d-?\\d{3}-?\\d{4}(?!\\d)")


def scan_corpus_pii(docs: list[dict]) -> list[str]:
    leaks: list[str] = []
    for doc in docs:
        text = f"{doc.get('title', '')}\\n{doc.get('body', '')}"
        if THAI_ID_RE.search(text):
            leaks.append(f"{doc['doc_id']}:thai_national_id")
        if THAI_MOBILE_RE.search(text):
            leaks.append(f"{doc['doc_id']}:thai_mobile_phone")
    return leaks


sample = [
    {"doc_id": "faq-01", "title": "ติดต่อเรา", "body": "โทร 02-000-0000 อ้างอิง INV-2026-009"},
    {"doc_id": "bad-01", "title": "ตัวอย่างหลุด", "body": "ติดต่อพนักงาน 089-123-4567 เลขบัตร 1100700123456"},
]
print("PII leaks:", scan_corpus_pii(sample))`,
        },
        output: `PII leaks: ['bad-01:thai_national_id', 'bad-01:thai_mobile_phone']`,
      },
      {
        title: "2 · นิยาม Milestone1Report และรวมผลตรวจทั้ง 4 เสา",
        explain:
          "รวมสัญญาณจาก `adr_ok`, `scaffold_ok`, ความครบถ้วนของเอกสาร (≥ 20 ฉบับและครบ 4 หมวด), และผลสแกน PII เพื่อสร้างลิสต์ `blockers` ที่ชัดเจน",
        code: {
          language: "python",
          filename: "worked_milestone1.py",
          code: `from typing import Literal
from pydantic import BaseModel

REQUIRED_CATS = {"policy", "faq", "table", "runbook"}


class Milestone1Report(BaseModel):
    adr_ok: bool
    scaffold_ok: bool
    corpus_count: int
    missing_categories: list[str]
    pii_findings: list[str]
    blockers: list[str]
    status: Literal["SIGNED_OFF", "BLOCKED"]


def run_m1_gate(adr_ok: bool, scaffold_ok: bool, docs: list[dict], min_docs: int = 20) -> Milestone1Report:
    blockers: list[str] = []
    if not adr_ok:
        blockers.append("ADR-001 validation failed")
    if not scaffold_ok:
        blockers.append("Repo scaffold audit failed")
    if len(docs) < min_docs:
        blockers.append(f"Corpus needs >= {min_docs} docs (got {len(docs)})")
    present_cats = {d.get("category") for d in docs}
    missing_cats = sorted(REQUIRED_CATS - present_cats)
    if missing_cats:
        blockers.append(f"Missing corpus categories: {', '.join(missing_cats)}")
    pii = scan_corpus_pii(docs)
    if pii:
        blockers.append(f"PII detected in corpus: {', '.join(pii)}")
    status: Literal["SIGNED_OFF", "BLOCKED"] = "SIGNED_OFF" if not blockers else "BLOCKED"
    return Milestone1Report(
        adr_ok=adr_ok,
        scaffold_ok=scaffold_ok,
        corpus_count=len(docs),
        missing_categories=missing_cats,
        pii_findings=pii,
        blockers=blockers,
        status=status,
    )`,
        },
      },
      {
        title: "3 · ทดสอบตัดสินใจ Go / No-Go ระหว่างชุดที่ยังไม่พร้อมกับชุดที่ผ่าน Sign-off",
        explain:
          "รัน Gate เทียบระหว่างชุดข้อมูลที่ยังขาดหมวด `runbook` และมี PII หลุด กับชุดที่แก้ไขครบ 20 ฉบับและสะอาดแล้ว",
        code: {
          language: "python",
          filename: "worked_milestone1.py",
          code: `bad_docs = [{"doc_id": f"d{i}", "category": "policy", "title": "t", "body": "0891234567" if i == 0 else "ok"} for i in range(18)]
print("Run 1:", run_m1_gate(True, True, bad_docs).model_dump(include={"status", "blockers"}))

cats = ["policy", "faq", "table", "runbook"]
good_docs = [{"doc_id": f"d{i:02d}", "category": cats[i % 4], "title": "Doc", "body": "สะอาดปลอดภัย"} for i in range(20)]
print("Run 2:", run_m1_gate(True, True, good_docs).model_dump(include={"status", "corpus_count", "blockers"}))`,
        },
        output: `Run 1: {'status': 'BLOCKED', 'blockers': ['Corpus needs >= 20 docs (got 18)', 'Missing corpus categories: faq, runbook, table', 'PII detected in corpus: d0:thai_mobile_phone']}
Run 2: {'status': 'SIGNED_OFF', 'corpus_count': 20, 'blockers': []}`,
      },
    ],
    gotcha:
      "จุดสังเกต: ระวัง regex ตรวจเลข 13 หลักพลาดไปจับรหัสตัวเลขยาว ๆ ที่ไม่ใช่บัตรประชาชนในตารางเทคนิค เช่น timestamps หรือ UUID — ใน production จึงควรใช้ boundary `(?<!\\d)...(?!\\d)` และอาจเสริม checksum 13 หลักของกรมการปกครองเพื่อลด false positive",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/milestone1_gate.py` เพื่อใช้เป็นสคริปต์ตรวจรับ Milestone 1 (Architecture + Repo Scaffold + 20+ Thai/Bilingual Corpus + PDPA PII Hygiene) ให้ผ่านอัตโนมัติก่อนก้าวเข้าสู่ Block B41",
    requirements: [
      "`scan_pii_leaks(text: str) -> list[str]` — ตรวจจับเลขบัตรประชาชนไทย 13 หลัก (`\\d{13}` หรือ `\\d-\\d{4}-\\d{5}-\\d{2}-\\d` ที่มี word/digit boundary) คืน `\"thai_national_id\"` และเบอร์มือถือไทย (`0[689]\\d-?\\d{3}-?\\d{4}`) คืน `\"thai_mobile_phone\"` (ไม่ซ้ำกันในรายการผลลัพธ์)",
      "`Milestone1Report(BaseModel)` — ประกอบด้วย `adr_ok: bool`, `scaffold_ok: bool`, `corpus_count: int`, `missing_categories: list[str]`, `duplicate_doc_ids: list[str]`, `pii_findings: list[str]`, `blockers: list[str]`, และ `status: Literal[\"SIGNED_OFF\", \"BLOCKED\"]`",
      "`evaluate_milestone1(adr_ok: bool, scaffold_ok: bool, docs: list[dict], min_docs: int = 20) -> Milestone1Report` — ตรวจครบทุกเงื่อนไข: `adr_ok`, `scaffold_ok`, `len(docs) >= min_docs`, หมวดหมู่ครบ `{\"policy\", \"faq\", \"table\", \"runbook\"}`, ไม่มี `doc_id` ซ้ำกัน, และไม่มี PII leak ใน `title` หรือ `body` ของเอกสารใดเลย",
      "หากไม่พบ blocker ใด ๆ ให้ตั้ง `status = \"SIGNED_OFF\"` มิฉะนั้นตั้ง `status = \"BLOCKED\"` พร้อมบรรยาย `blockers` ให้ชัดเจน",
    ],
    starter: {
      language: "python",
      filename: "src/milestone1_gate.py",
      code: `import re
from collections import Counter
from typing import Literal
from pydantic import BaseModel

REQUIRED_CATEGORIES = {"policy", "faq", "table", "runbook"}
THAI_ID_RE = re.compile(r"(?<!\\d)(?:\\d{13}|\\d-\\d{4}-\\d{5}-\\d{2}-\\d)(?!\\d)")
THAI_MOBILE_RE = re.compile(r"(?<!\\d)0[689]\\d-?\\d{3}-?\\d{4}(?!\\d)")


def scan_pii_leaks(text: str) -> list[str]:
    # TODO: คืน list ของประเภท PII ที่พบ ("thai_national_id", "thai_mobile_phone")
    raise NotImplementedError


class Milestone1Report(BaseModel):
    adr_ok: bool
    scaffold_ok: bool
    corpus_count: int
    missing_categories: list[str]
    duplicate_doc_ids: list[str]
    pii_findings: list[str]
    blockers: list[str]
    status: Literal["SIGNED_OFF", "BLOCKED"]


def evaluate_milestone1(
    adr_ok: bool,
    scaffold_ok: bool,
    docs: list[dict],
    min_docs: int = 20,
) -> Milestone1Report:
    # TODO: ตรวจ ADR, scaffold, min_docs, categories, duplicate doc_id และ PII leaks
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_milestone1_gate.py",
      code: `from src.milestone1_gate import evaluate_milestone1, scan_pii_leaks


def _clean_corpus(n: int = 20) -> list[dict]:
    cats = ["policy", "faq", "table", "runbook"]
    return [
        {
            "doc_id": f"doc-{i:02d}",
            "category": cats[i % 4],
            "title": f"เอกสารองค์กรฉบับที่ {i + 1}",
            "body": "ข้อมูลนโยบายองค์กรสำหรับทดสอบระบบค้นหา ติดต่อ 02-000-0000 รหัส INV-2026-009",
        }
        for i in range(n)
    ]


def test_signed_off_when_all_pillars_pass():
    report = evaluate_milestone1(adr_ok=True, scaffold_ok=True, docs=_clean_corpus(20), min_docs=20)
    assert report.status == "SIGNED_OFF"
    assert report.blockers == []
    assert report.pii_findings == []
    assert report.duplicate_doc_ids == []


def test_blocked_on_pii_leak_and_duplicate_id():
    docs = _clean_corpus(20)
    docs[3]["doc_id"] = docs[0]["doc_id"]
    docs[5]["body"] = "โทรติดต่อ 081-234-5678 และบัตร 1-1007-00123-45-6"
    report = evaluate_milestone1(adr_ok=True, scaffold_ok=True, docs=docs, min_docs=20)
    assert report.status == "BLOCKED"
    assert report.duplicate_doc_ids == ["doc-00"]
    assert "doc-05:thai_national_id" in report.pii_findings
    assert "doc-05:thai_mobile_phone" in report.pii_findings


def test_blocked_when_adr_or_scaffold_fails():
    report = evaluate_milestone1(adr_ok=False, scaffold_ok=False, docs=_clean_corpus(20), min_docs=20)
    assert report.status == "BLOCKED"
    assert len(report.blockers) >= 2


def test_blocked_when_corpus_short_or_missing_table():
    docs = [d for d in _clean_corpus(20) if d["category"] != "table"]
    report = evaluate_milestone1(adr_ok=True, scaffold_ok=True, docs=docs, min_docs=20)
    assert report.status == "BLOCKED"
    assert report.missing_categories == ["table"]


def test_scan_pii_leaks_ignores_office_phone_and_invoice_id():
    assert scan_pii_leaks("สำนักงานใหญ่ 02-000-0000 อ้างอิง INV-2026-009") == []
    assert scan_pii_leaks("มือถือ 0921112222") == ["thai_mobile_phone"]
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q` ทั้ง repo (`test_capstone_adr.py`, `test_scaffold_validator.py`, `test_corpus_prep.py`, `test_milestone1_gate.py`) แล้วผ่าน 100%",
      "รัน `uv run ruff check .` แล้วได้ 0 lint errors",
      "ลองรัน `evaluate_milestone1` กับ `corpus_manifest.jsonl` จริงของคุณและบันทึกผลลง `docs/milestone-1-signoff.json`",
      "ทบทวน {{golden-dataset}} plan ในหัว: เตรียม 4 slice หลัก (`thai_faq`, `code_switch`, `exact_id`, `table_policy`) ที่จะใช้ใน Block B41",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_milestone1_gate.py`, ชุดเทสต์รวมทั้ง B40 ผ่านหมด และ `uv run ruff check .` คืน 0 error",
    hints: [
      {
        body: "ใน `scan_pii_leaks` ให้เช็ก `THAI_ID_RE.search(text)` และ `THAI_MOBILE_RE.search(text)` แยกกัน แล้ว append เฉพาะชื่อประเภทเพื่อให้ได้ list ไม่ซ้ำ จากนั้นใน `evaluate_milestone1` วนลูปเก็บ `f\"{doc['doc_id']}:{kind}\"` ลงใน `pii_findings`",
      },
      {
        body: "ตรวจ `doc_id` ซ้ำด้วย `Counter(d.get(\"doc_id\", \"\") for d in docs)` และคัด `sorted([k for k, v in counts.items() if v > 1])` ใส่ `duplicate_doc_ids`",
      },
      {
        body: "โครงร่างของ `evaluate_milestone1` — เติม `scan_pii_leaks` และการตรวจ `adr_ok` / `scaffold_ok` / `min_docs` ให้ครบ",
        code: {
          language: "python",
          filename: "hint_level3.py",
          code: `def evaluate_milestone1(
    adr_ok: bool,
    scaffold_ok: bool,
    docs: list[dict],
    min_docs: int = 20,
) -> Milestone1Report:
    blockers: list[str] = []
    if not adr_ok:
        blockers.append("ADR-001 not approved")
    if not scaffold_ok:
        blockers.append("Repo scaffold incomplete")
    if len(docs) < min_docs:
        blockers.append(f"Corpus count {len(docs)} < {min_docs}")

    counts = Counter(d.get("doc_id", "") for d in docs)
    dups = sorted(k for k, v in counts.items() if v > 1)
    if dups:
        blockers.append(f"Duplicate doc_ids: {', '.join(dups)}")

    missing_cats = sorted(REQUIRED_CATEGORIES - {d.get("category") for d in docs})
    if missing_cats:
        blockers.append(f"Missing categories: {', '.join(missing_cats)}")

    pii_findings: list[str] = []
    for d in docs:
        combined = f"{d.get('title', '')}\\n{d.get('body', '')}"
        for kind in scan_pii_leaks(combined):
            pii_findings.append(f"{d.get('doc_id', 'unknown')}:{kind}")
    if pii_findings:
        blockers.append(f"PII leaks found: {', '.join(pii_findings)}")

    status: Literal["SIGNED_OFF", "BLOCKED"] = "SIGNED_OFF" if not blockers else "BLOCKED"
    return Milestone1Report(
        adr_ok=adr_ok,
        scaffold_ok=scaffold_ok,
        corpus_count=len(docs),
        missing_categories=missing_cats,
        duplicate_doc_ids=dups,
        pii_findings=pii_findings,
        blockers=blockers,
        status=status,
    )`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
      caption: "รันชุดทดสอบรวมทั้งหมดของ Block B40 เพื่อยืนยัน Milestone 1 Sign-off",
    },
  },

  mistakes: [
    {
      title: "เซ็นผ่าน Milestone 1 ทั้งที่ยังไม่ได้เช็ก PII ในคลังเอกสาร",
      symptom: "คลังความรู้มีตัวอย่างจริงที่มีเลขบัตรประชาชนหรือเบอร์มือถือพนักงานติดมาด้วย พอเอาไปทำ RAG index ข้อมูลก็ถูกดึงขึ้นมาโชว์ในคำตอบ",
      fix: "ใส่ `scan_pii_leaks` เป็นเงื่อนไขบังคับใน Milestone 1 Gate และแทนที่ข้อมูลจริงทั้งหมดด้วยข้อมูลสมมติหรือ `[REDACTED]`",
    },
    {
      title: "เช็กแต่ละไฟล์แยกกันแต่ไม่เคยรัน `pytest` + `ruff` พร้อมกันทั้งโปรเจกต์",
      symptom: "แก้โมดูลวันก่อนแล้วเกิด import cycle หรือ lint error โดยไม่รู้ตัวจนกระทั่งขึ้นสัปดาห์ที่ 2",
      fix: "รัน `uv run ruff check . && uv run pytest -q` แบบรวมทั้ง repo ในจุดตรวจ Milestone ทุกครั้ง",
    },
    {
      title: "ปล่อยให้คลังเอกสารขาดหมวด `table` หรือ `runbook` แล้วคิดว่าจะมาเติมทีหลัง",
      symptom: "เมื่อเริ่มเขียน Ingestion (D161) และ Benchmark (D164) ไม่มีข้อมูลตารางและรหัสเอกสารให้ทดสอบจนต้องย้อนกลับมาปั้นข้อมูลใหม่",
      fix: "ล็อกความครบถ้วนของ 4 หมวดหมู่ (`policy`, `faq`, `table`, `runbook`) ใน Milestone 1 Gate ก่อนเดินหน้าเข้า Block B41",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d160-q1",
        "เหตุใด Milestone 1 Gate จึงต้องสแกนหาข้อมูล {{pdpa}} (เลขบัตรประชาชน/เบอร์มือถือ) ในคลังเอกสาร *ก่อน* เข้าสู่ Day 161 (Ingestion & Indexing)?",
        [
          ["เพราะ `PyThaiNLP` ไม่สามารถตัดคำตัวเลข 13 หลักได้", "ไม่จริง — PyThaiNLP จัดการตัวเลขได้ แต่ปัญหาคือเรื่องความปลอดภัยข้อมูลส่วนบุคคล"],
          ["เพื่อป้องกันไม่ให้ PII ดิบถูกฝังลงใน Vector DB และดัชนีค้นหาตั้งแต่ต้นทาง ตามหลัก Defense in Depth", "ถูก — เมื่อเอกสารที่มี PII ถูก index แล้ว ข้อมูลอาจรั่วผ่านการค้นหาได้ การสแกนก่อน index จึงตัดไฟแต่ต้นลม"],
          ["เพราะ `pgvector` ห้ามเก็บตัวเลขที่มีขีดคั่น (`-`)", "ไม่จริง — `pgvector` เก็บข้อความ UTF-8 ที่มีขีดคั่นได้ตามปกติ"],
          ["เพื่อลดขนาดของ `uv.lock` ลง 50%", "PII scan ในคลังเอกสารไม่เกี่ยวกับ `uv.lock`"],
        ],
        "B",
        "PDPA Hygiene Gate ที่ต้นทางช่วยป้องกันไม่ให้ข้อมูลส่วนบุคคลที่ไม่พึงเปิดเผยถูกนำไปสร้าง chunk และ vector index ร่วมกับคลังความรู้สาธารณะ",
        "ทำไมต้องมี PDPA PII Hygiene Check ในขั้นตอน Milestone 1 ก่อนเริ่ม Ingestion?",
        "เพื่อป้องกันไม่ให้เลขบัตรประชาชนหรือเบอร์มือถือดิบถูก index เข้า Vector DB ตั้งแต่ต้นทาง ทำงานเสริมกับ redaction middleware ในชั้น API",
      ),
      mc(
        "d160-q2",
        "หากรัน `evaluate_milestone1` แล้วพบว่า `corpus_count = 22`, `adr_ok = True`, `scaffold_ok = True` แต่ `missing_categories = [\"table\"]` ผล `status` ควรเป็นอย่างไรและเพราะเหตุใด?",
        [
          ["`SIGNED_OFF` เพราะจำนวนเอกสารเกิน 20 ฉบับแล้ว", "ผิด — จำนวนรวมที่มากพอไม่ได้ทดแทนการขาดประเภทข้อมูลสำคัญอย่างตาราง"],
          ["`BLOCKED` เพราะยังไม่มีเอกสารประเภท `table` สำหรับทดสอบการ chunk และ Benchmark ตารางใน Block B41", "ถูก — Milestone Gate ต้องตรวจครบทั้งปริมาณและความหลากหลายของประเภทเอกสาร"],
          ["`SIGNED_OFF` แต่ให้ลบการตรวจ `table` ออกจาก Benchmark ใน Day 164", "ห้ามลดมาตรฐาน benchmark เพื่อหลบช่องโหว่ — ต้องเติมข้อมูลให้ครบ"],
          ["ให้ระบบ LLM สร้างตารางปลอมขึ้นมาเองตอนตอบคำถาม", "นั่นคืออาการหลอน (Hallucination) ซึ่งขัดกับหลัก Groundedness ของ Capstone"],
        ],
        "B",
        "คลังเอกสารที่ขาดหมวด `table` จะทำให้ Block B41 ไม่ได้ฝึกการรักษาหัวตารางตอน chunking และทำให้ `table_policy` slice ใน Milestone 2 ว่างเปล่า",
        "ถ้ามีเอกสาร 22 ฉบับแต่ขาดหมวด `table` Milestone 1 Gate ควรตัดสินใจอย่างไร?",
        "ต้องคืน `BLOCKED` และให้เพิ่มเอกสารตาราง (เช่น ตารางค่าธรรมเนียม/SLA) ก่อนเข้าสู่ Block B41 เพื่อไม่ให้ขาดการทดสอบส่วนตาราง",
      ),
      mc(
        "d160-q3",
        "ข้อใดคือหลักฐานส่งมอบ (Deliverables) ของ Block B40 ที่ต้องพร้อมสมบูรณ์เมื่อจบ Milestone 1?",
        [
          ["โมเดล Fine-tuned LoRA และกราฟ Loss บน GPU Cluster", "Fine-tuning ไม่ใช่เป้าหมายของ B40 และ Capstone ใช้ Hybrid RAG + Guardrails เป็นแกนหลัก"],
          ["`ADR-001` พร้อม SLA Contract, Repo Scaffold (`uv.lock`, `Ruff`, `pytest`, `docker-compose.yml`), และคลังความรู้ ≥ 20 ฉบับที่สะอาดและมี ACL", "ถูก — ทั้ง 3 ชิ้นนี้คือฐานรากที่ Block B41 (Hybrid RAG) จะต่อยอดตั้งแต่วันที่ 161"],
          ["หน้าเว็บ React Chat UI ที่เชื่อม Production Cloud แล้ว", "หน้า Chat UI และ Staging Deploy อยู่ใน Block B44 (D174–D175)"],
          ["รายงาน Load Test 1,000 concurrent users", "Load & Failure Testing อยู่ใน Block B45 (D177)"],
        ],
        "B",
        "Block B40 ปู 3 เสาหลัก: การตัดสินใจสถาปัตยกรรม (ADR-001), โครงสร้างวิศวกรรม (Repo Scaffold), และคลังความรู้สองภาษา 20+ ฉบับ",
        "3 เสาหลักที่ต้องเซ็นรับรองใน Milestone 1 (จบ Block B40) คืออะไรบ้าง?",
        "1) ADR-001 + User Stories + SLA Contract, 2) Repo Scaffold (uv, Ruff, pytest, Docker Compose), และ 3) คลังความรู้ไทย/สองภาษา ≥ 20 ฉบับที่ล้าง UTF-8, มี ACL และไร้ PII",
      ),
      mc(
        "d160-q4",
        "รูปแบบของ `THAI_MOBILE_RE` ที่ใส่ boundary `(?<!\\d)0[689]\\d-?\\d{3}-?\\d{4}(?!\\d)` มีข้อดีอย่างไรเมื่อเทียบกับการตรวจแค่ `0[689]\\d{8}` แบบไม่มี boundary?",
        [
          ["ช่วยให้จับเบอร์มือถือที่มีขีดคั่น (`081-234-5678`) ได้ด้วย และไม่เผลอจับตัวเลขที่อยู่กลางรหัสยาว ๆ เช่น เลขบัญชีหรือรหัสอ้างอิง 14 หลัก", "ถูก — lookaround boundary ลด false positive และ `-?` รองรับทั้งแบบมีขีดและไม่มีขีด"],
          ["ทำให้ regex ทำงานข้ามไฟล์ PDF ที่เป็นรูปภาพโดยไม่ต้อง OCR", "Regex ทำงานเฉพาะบนข้อความ text ไม่ได้ทำ OCR บนรูปภาพ"],
          ["ทำให้ระบบไม่จำเป็นต้องใช้ PDPA Redaction Middleware ใน FastAPI", "PII scan ในคลังเอกสารใช้คัดกรอง corpus ส่วน FastAPI middleware ใช้คัดกรอง input/output จากผู้ใช้จริง ต้องมีทั้งคู่"],
          ["ช่วยแปลเบอร์โทรศัพท์ภาษาไทยเป็นภาษาอังกฤษอัตโนมัติ", "Regex ใช้ตรวจจับ pattern ไม่ได้แปลภาษา"],
        ],
        "A",
        "การใช้ `(?<!\\d)...(?!\\d)` ป้องกันการจับเลข 10 หลักที่บังเอิญเป็นส่วนหนึ่งของรหัสยาวกว่านั้น และ `-?` ครอบคลุมรูปแบบการเขียนเบอร์มือถือไทยที่พบบ่อย",
        "เหตุใด regex ตรวจจับเบอร์มือถือหรือเลขบัตรประชาชนใน `scan_pii_leaks` จึงควรใส่ digit lookaround boundary (`(?<!\\d)...(?!\\d)`)?",
        "เพื่อป้องกัน false positive จากการไปจับชุดตัวเลขที่บังเอิญซ่อนอยู่กลางรหัสยาวกว่านั้น (เช่น เลขที่บัญชีหรือ timestamp)",
      ),
    ],
  },

  takeaways: [
    "Milestone 1 Gate ตรวจรับ 3 เสาหลักของ B40 พร้อมกัน: `ADR-001` (D157) + Repo Scaffold (`uv`, {{ruff}}, {{pytest}}, Compose) (D158) + คลังเอกสาร ≥ 20 ฉบับ (D159)",
    "เพิ่ม **PDPA PII Hygiene Scan** เพื่อสกัดเลขบัตรประชาชน 13 หลักและเบอร์มือถือดิบออกจากคลังความรู้ *ก่อน* นำเข้าสู่ขั้นตอน indexing",
    "บังคับใช้ {{fail-fast}} Gate ที่คืน `SIGNED_OFF` หรือ `BLOCKED` พร้อม `blockers` ที่ชัดเจน และเก็บบันทึกผลเป็น Sign-off Artifact",
    "เมื่อ Milestone 1 ผ่าน 100% เราพร้อมส่งต่อ `corpus_manifest.jsonl` เข้าสู่ Block B41 (Hybrid Ingestion, PyThaiNLP BM25 & Reranker)",
  ],

  reviewCards: [
    rc(
      "d160-rc-1",
      "4 เงื่อนไขหลักที่ Milestone 1 Gate ใช้ตัดสินระหว่าง `SIGNED_OFF` กับ `BLOCKED` คืออะไร?",
      "1) ADR-001 & SLA ผ่าน, 2) Repo Scaffold + Ruff/pytest/Compose ผ่าน, 3) คลัง ≥ 20 ฉบับครบ 4 หมวดและไม่ซ้ำ doc_id, 4) ผลสแกน PDPA PII = 0 leaks",
    ),
    rc(
      "d160-rc-2",
      "ทำไมต้องสแกน PII ในคลังเอกสารตั้งแต่ Milestone 1 ทั้งที่ใน FastAPI มี PDPA Redaction Middleware อยู่แล้ว?",
      "ตามหลัก Defense in Depth: ข้อมูลส่วนบุคคลที่ไม่ควรเผยแพร่ไม่ควรถูกนำไป chunk และฝังลง Vector DB ตั้งแต่แรก ไม่ใช่รอไปปิดบังแค่ตอนตอบ",
    ),
    rc(
      "d160-rc-3",
      "ไฟล์ `corpus_manifest.jsonl` ที่ผ่าน Milestone 1 แล้วจะถูกนำไปใช้ต่ออย่างไรใน Day 161?",
      "ใช้เป็นอินพุตตรงของ Ingestion Pipeline โดยอาศัยข้อความที่ normalize NFC แล้ว, `acl_roles` สำหรับ metadata filtering, และ `content_sha256` เพื่อทำ idempotent re-ingest",
    ),
  ],

  sources: [
    { label: "OWASP LLM Top 10 — Sensitive Information Disclosure (LLM02)", href: "https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/" },
    { label: "Pydantic v2 Documentation — Models & Validation", href: "https://docs.pydantic.dev/latest/" },
    { label: "pytest Documentation — Writing & Organizing Tests", href: "https://docs.pytest.org/en/stable/" },
    { label: "Ruff Documentation — Fast Python Linter & Formatter", href: "https://docs.astral.sh/ruff/" },
  ],

  glossary: ["adr", "reproducibility", "fail-fast", "pydantic", "schema", "pdpa", "acl", "pytest", "ruff", "golden-dataset"],
});
