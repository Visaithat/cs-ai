import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D170 — Phase 6 / Block B43
 * Run Ragas + Promptfoo Evals & Fix Top 3 Failure Modes
 */
export const d170: Lesson = defineLesson({
  day: 170,
  titleTh: "รัน Ragas + Promptfoo Evals และซ่อม Top 3 Failure Modes ของระบบ Capstone",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · วัดผล 40 เคสด้วย RAG Triad (Ragas) + Promptfoo Assertions แล้วเจาะแก้จุดพังอันดับ 1–3 โดยไม่เกิด Regression",
  icon: "flask-conical",
  visual: {
    id: "capstone-eval-telemetry",
    title: "Eval-Driven Fix Loop — Ragas + Promptfoo จับ Top 3 Failure Modes",
    caption: "วัดคะแนนก่อนแก้ → จัดอันดับ 3 สาเหตุความล้มเหลวที่ใหญ่ที่สุด → แก้ที่ต้นตอแล้วรัน regression suite ซ้ำทุก slice",
    alt: "แผนภาพผลการประเมิน Ragas และ Promptfoo บน 40-Case Golden Set สำหรับคัดกรองและแก้ Top 3 Failure Modes",
  },
  requiresApiKey: false,
  apiKeyNote: "รัน Eval Runner และ Promptfoo assertions แบบ offline 100% ด้วย deterministic judge (สลับต่อ OpenAI/Ragas LLM Judge ได้ทันที)",
  tools: ["Ragas", "Promptfoo", "PyThaiNLP", "pytest"],

  bigPicture: [
    {
      node: 3,
      heading: "จับคู่ Ragas (RAG Triad) กับ Promptfoo (Regression & Guardrail Assertions)",
      body: "เครื่องมือเดียวตอบโจทย์ได้ไม่ครบทุกมิติ: {{ragas}} เก่งเรื่องวัดความสัมพันธ์ระหว่างคำถาม บริบท และคำตอบ (`Faithfulness`, `Context Recall`, `Context Precision`) ส่วน {{promptfoo}} เก่งเรื่องรันชุด regression tests ข้าม prompt version และตรวจกฎความปลอดภัย",
      lessonNote: "วันนี้เรานำ `golden_40.jsonl` จาก D169 มารันผ่าน {{ragas}} + {{promptfoo}} พร้อมกันบนท่อ `CoreFlowPipeline`",
    },
    {
      node: 6,
      heading: "จัดอันดับ Top 3 Failure Modes แทนการไล่แก้แบบสุ่ม",
      body: "หลังรัน 40 เคสครั้งแรก ระบบมักมีจุดตกหลายแห่ง การแก้ทุกอย่างพร้อมกันทำให้ไม่รู้ว่าวิธีไหนได้ผลจริง",
      lessonNote: "เรารวมกลุ่มสาเหตุความล้มเหลว (Failure Mode Clustering) แล้วเลือกซ่อม **Top 3 Failure Modes** ที่กินคะแนนรวมมากที่สุดก่อน",
    },
    {
      node: 2,
      heading: "แก้ให้ตรงชั้น: Retrieval, Prompt/Schema หรือ Abstention Threshold",
      body: "จุดพังส่วนใหญ่ของระบบสองภาษาแบ่งเป็น 3 ต้นตอชัดเจน: ค้นรหัส/คำผสมไม่เจอ (Retrieval), มั่นใจเกินเหตุไม่ยอม {{abstention}}, หรือ {{structured-output}} หลุด/อ้าง citation ผิด",
      lessonNote: "ทุกการแก้ไขจะผูก {{prompt-versioning}} ชัดเจนเพื่อให้เทียบผล Before vs After ได้แบบตัวเลขชนตัวเลข",
    },
    {
      node: 3,
      heading: "Non-Regression Check: แก้จุดหนึ่งต้องไม่ทำอีก Slice พัง",
      body: "ปัญหาคลาสสิกคือ พอตั้งเกณฑ์ให้ปฏิเสธคำถามยากขึ้น คะแนน `unanswerable` พุ่ง แต่ `thai_faq` ที่ควรตอบได้กลับโดนปฏิเสธไปด้วย (False Refusal)",
      lessonNote: "Eval Runner ของเราจะตรวจทั้งคะแนนที่เพิ่มขึ้นและจำนวนเคสที่เคยผ่านแล้วกลับมาตก (regressions == 0)",
    },
  ],

  objectives: [
    "**ผสานผลประเมิน {{ragas}} และ {{promptfoo}}** บนชุดทดสอบ 40 เคสเพื่อวัดทั้ง `Faithfulness`, `Context Recall`, `Schema Validity`, `Abstention` และ `Attack Defense`",
    "**จัดกลุ่มและจัดอันดับ Top 3 Failure Modes** จากผลรันจริง (เช่น Hybrid/Code-Switch Retrieval Miss, Over-Eager Answering และ Citation/Schema Mismatch) เพื่อวางแผนแก้ตรงจุด",
    "**ยืนยันผลการปรับปรุงแบบ Before vs After** ด้วยระบบตรวจจับ Regression (`0 regressions`) ก่อนเดินหน้าติด {{langfuse}} Telemetry ใน D171",
  ],

  prerequisites: [
    "สร้าง `40-Case Golden Eval Dataset` แล้วใน D169 (`evals/golden_40.jsonl`)",
    "เข้าใจ RAG Triad ของ {{ragas}} และแนวคิด Regression Testing ของ {{promptfoo}} (แนะนำ Day 129–130)",
    "ใช้งาน `uv`, `pytest` และโครงสร้าง `CoreFlowPipeline` จาก D168 ได้",
    "ไม่ต้องใช้ API key หรือบัตรเครดิต",
  ],

  setup: {
    intro:
      "เตรียมไฟล์ config ตัวอย่างของ Promptfoo (`evals/promptfooconfig.yaml`) และตัวรันประเมินผล `src/eval_runner.py` ในโปรเจกต์ `thai-enterprise-assistant/`",
    commands: `# ในโฟลเดอร์ thai-enterprise-assistant/
mkdir -p evals src tests
uv add pydantic pyyaml
uv add --dev pytest ruff
# (ทางเลือกเมื่อรัน Promptfoo/Ragas จริงกับ API)
# npx promptfoo@latest --version && uv add ragas`,
    steps: [
      ["deps", "ติดตั้ง `pydantic`, `pyyaml`, `pytest` และ `ruff` ในโปรเจกต์"],
      ["dataset", "ตรวจว่ามีชุดข้อมูล 40 เคสพร้อมสำหรับป้อนเข้า Eval Harness"],
      ["ready", "พร้อมเขียน `src/eval_runner.py` เพื่อหา Top 3 Failure Modes และวัด Before vs After"],
    ],
    note: "แบบฝึกหัดใช้ Deterministic Scoring Harness ที่จำลองคำนวณสูตร Ragas และ Promptfoo assertions แบบ offline 100% คุณจึงรันซ้ำใน CI ได้เร็วและฟรี แล้วค่อยเปิดโหมด {{llm-as-a-judge}} จริงเมื่อต้องการ",
  },

  concepts: [
    {
      id: "ragas-plus-promptfoo-stack",
      title: "1 · ผสาน Ragas + Promptfoo: วัดทั้งความซื่อสัตย์ของ RAG และพฤติกรรมของ App",
      paragraphs: [
        "ทำไมต้องใช้ทั้ง **{{ragas}}** และ **{{promptfoo}}** ร่วมกัน? เพราะในระบบ Capstone ของเราไม่ได้มีแค่ RAG อย่างเดียว แต่มีทั้ง Router, {{mcp}} Tool Lookup, {{hitl}} Write Gate และ {{guardrails}} ด้วย",
        "**{{ragas}}** รับผิดชอบมิติความสัมพันธ์ของข้อมูลใน `faq_rag`: `Context Recall` (ดึงเอกสารเฉลยมาได้ครบไหม), `Context Precision` (เอกสารเฉลยอยู่อันดับต้น ๆ ไหม) และ `Faithfulness` (ประโยคที่ตอบมีหลักฐานรองรับใน context ที่ดึงมาจริงกี่ส่วน — ต้อง `>= 0.85`)",
        "ส่วน **{{promptfoo}}** ทำหน้าที่เป็น Matrix Regression Runner ที่ส่งเคสทั้ง 40 ข้อเข้าตรวจกฎแบบผสม (Deterministic + Judge Assertions): ตรวจว่า {{schema}} JSON ผ่าน 100%, เส้นทาง `expected_route` ตรง, เคส `unanswerable` ปฏิเสธคำตอบได้จริง (`Abstention >= 0.90`), และเคส `attack` ไม่หลุด {{pdpa}} หรือยอมทำตามคำสั่งโจมตี (`>= 0.90`)",
      ],
      analogy:
        "Ragas เหมือนอาจารย์ตรวจเนื้อหาเรียงความว่าอ้างอิงหนังสือตรงไหมและค้นตำรามาครบไหม ส่วน Promptfoo เหมือนเครื่องตรวจมาตรฐานผลิตภัณฑ์ที่ทดสอบทั้งระบบพร้อมกัน ทั้งรูปแบบฟอร์ม ความปลอดภัย และความต่างระหว่างเวอร์ชัน v1 กับ v2",
      code: {
        language: "yaml",
        filename: "evals/promptfooconfig.yaml",
        code: `description: "Capstone B43 - Thai/Bilingual 40-Case Eval Suite"
prompts:
  - file://prompts/capstone_v1.txt
providers:
  - id: "exec:uv run python -m src.promptfoo_provider"
tests: file://golden_40.jsonl
defaultTest:
  assert:
    - type: is-json
    - type: javascript
      value: |
        const out = JSON.parse(output);
        return out.status === context.vars.expected_status
            && out.route === context.vars.expected_route;`,
        caption: "โครงสร้าง promptfooconfig.yaml ที่ดึง 40 เคสมาตรวจ status, route และ JSON schema อัตโนมัติ",
      },
      whyTitle: "Why this matters — ข้อสอบ 1 ชุดใช้วัดได้ครบทั้ง Quality และ Security",
      whyParagraphs: [
        "แทนที่จะเขียนสคริปต์แยกกระจัดกระจาย การต่อ `golden_40.jsonl` เข้ากับ Ragas (เฉพาะมิติ RAG) และ Promptfoo (ทุก route + safety) ทำให้ได้ภาพรวมเดียวที่สั่งรันได้ด้วยคำสั่งเดียวก่อน merge โค้ด",
        "เมื่อคุณแก้ prompt หรือเปลี่ยนโมเดล ไฟล์ `promptfooconfig.yaml` จะช่วยเทียบ `capstone-v1` กับ `capstone-v2` แบบ side-by-side ทันที",
      ],
    },
    {
      id: "top-3-failure-modes-anatomy",
      title: "2 · ผ่าตัด Top 3 Failure Modes ที่พบบ่อยที่สุดในระบบ Capstone",
      paragraphs: [
        "หลังรัน Eval รอบแรกบน 40 เคส อย่าเพิ่งเปิดแก้ทีละบรรทัดแบบตาบอด ให้จัดกลุ่มเคสที่ตกตาม **Failure Mode** แล้วนับความถี่ — โดยทั่วไปในระบบผู้ช่วยองค์กรสองภาษาจะพบ Top 3 Failure Modes เดิมซ้ำ ๆ ดังนี้:",
        "**Failure Mode #1 · Code-Switch & Exact-ID Retrieval Miss**: คำถามผสมไทย-อังกฤษหรือมีรหัสเฉพาะ (เช่น *\"SLA คืนเงิน INV-2026-009\"*) ทำให้ `Context Recall` ตก เพราะฝั่ง BM25 ไม่ได้ตัดคำไทยด้วย {{pythainlp}} ร่วมกับ rule คงรหัสอังกฤษ หรือน้ำหนัก Dense vs BM25 ใน {{rrf}} ยังเอียงข้างใดข้างหนึ่ง",
        "**Failure Mode #2 · Over-Eager Answering (Abstention Failure)**: ในเคส `unanswerable` โมเดลกลับตอบมั่วด้วยคะแนน similarity ก้ำกึ่ง (`0.38`) แทนที่จะปฏิเสธ ทางแก้คือจูน `min_score` threshold ใน D165 `GroundedGenerator` และเพิ่มคำสั่ง negative constraint + {{few-shot}} ตัวอย่างการปฏิเสธใน System Prompt",
        "**Failure Mode #3 · Citation / Schema Mismatch**: โมเดลตอบถูกในใจความ แต่ใส่เลข `[chunk_id]` ผิดรูปแบบหรือลืมใส่ฟิลด์ JSON จนถูก Citation Verifier ตีตก ทางแก้คือบังคับ {{structured-output}} + retry/repair 1 ครั้งเมื่อเจอ `ValidationError`",
      ],
      analogy:
        "เหมือนหมอห้องฉุกเฉินทำ Triage: แทนที่จะแปะพลาสเตอร์ทุกแผลเล็ก ๆ ทีละจุด ให้จัดลำดับอาการวิกฤต 3 อันดับแรกที่ทำให้คนไข้เสียเลือดมากที่สุด (ทางเดินหายใจ, เลือดออก, ความดัน) แล้วรักษาให้ตรงต้นตอ",
      bullets: [
        "**Mode 1 (`retrieval_miss`)**: `Context Recall < 0.85` → แก้ที่ {{pythainlp}} tokenization, table-aware {{chunking}}, หรือ {{rrf}} / {{reranker}}",
        "**Mode 2 (`false_answer_on_unanswerable`)**: ตอบทั้งที่ไม่มีหลักฐาน → ปรับ `min_score` gate และย้ำกติกา {{abstention}} ใน prompt",
        "**Mode 3 (`citation_or_schema_error`)**: อ้างอิงผิด chunk หรือ JSON พัง → เสริม `GroundedAnswer` schema + repair retry",
      ],
      whyTitle: "Why this matters — หลักฐานที่กรรมการสัมภาษณ์ชอบถามที่สุด",
      whyParagraphs: [
        "คำถามสัมภาษณ์ยอดฮิตสำหรับ AI Engineer คือ *\"ตอนทำ Eval แล้วคะแนนยังไม่ผ่าน คุณเจอ Failure Mode อะไรบ้าง และแก้อย่างไร?\"*",
        "การบันทึก Top 3 Failure Modes พร้อมตัวเลข Before → After (เช่น `Code-Switch Recall 0.60 -> 0.90`, `Abstention 0.70 -> 0.90`) คือคำตอบที่ทรงพลังที่สุด",
      ],
    },
    {
      id: "fix-without-regression",
      title: "3 · วงจร Fix & Non-Regression Gate: กันแก้จุดหนึ่งแล้วอีกจุดพัง",
      paragraphs: [
        "การจูนระบบ AI มี trade-off เสมอ เช่น ถ้าคุณตั้ง `min_score` จาก `0.35` เป็น `0.65` เพื่อแก้ Failure Mode #2 (`unanswerable`), คะแนนกลุ่ม `unanswerable` อาจพุ่งเป็น `1.00` ทันที แต่กลุ่ม `thai_faq` และ `code_switch` ที่คะแนนความเหมือนอยู่แถว `0.55` อาจถูกปฏิเสธไปด้วยจน `False Refusal` พุ่ง!",
        "จึงต้องรัน **Non-Regression Comparison** หลังทุกการแก้ไข โดยตรวจ 2 เงื่อนไขพร้อมกัน: (1) ค่าเฉลี่ยเป้าหมายของ failure mode ที่แก้ดีขึ้นจริง และ (2) จำนวน **Regressed Cases** (เคสที่เคย `passed=True` ใน run ก่อน แต่กลายเป็น `passed=False` ใน run ใหม่) ต้องเป็น `0` หรืออยู่ภายในงบที่ยอมรับได้ พร้อมติดป้าย {{prompt-versioning}} เก็บประวัติทุก run",
      ],
      analogy:
        "เหมือนการจูนเบรกรถยนต์: ตั้งเบรกให้หนึบขึ้นเพื่อหยุดฉุกเฉินเร็วขึ้น (แก้ Failure Mode) แต่ต้องลองวิ่งทางปกติด้วยว่าล้อไม่ล็อกจนรถวิ่งไม่ออก (Non-Regression Check)",
      code: {
        language: "python",
        filename: "regression_diff.py",
        code: `def diff_runs(before: dict[str, bool], after: dict[str, bool]) -> dict[str, list[str]]:
    fixed = [cid for cid, ok in after.items() if ok and not before.get(cid, False)]
    regressed = [cid for cid, ok in after.items() if not ok and before.get(cid, False)]
    return {"fixed": sorted(fixed), "regressed": sorted(regressed)}


before_run = {"CAP-001": True, "CAP-014": False, "CAP-025": False}
after_run = {"CAP-001": True, "CAP-014": True, "CAP-025": True}
print(diff_runs(before_run, after_run))`,
        caption: "แยกเคสที่ซ่อมสำเร็จ (fixed) ออกจากเคสที่เคยผ่านแล้วกลับมาพัง (regressed) ทุกครั้งหลังแก้ไข",
      },
      whyTitle: "Why this matters — คุมคุณภาพระหว่าง Sprint โดยไม่หลงทาง",
      whyParagraphs: [
        "เมื่อมี `diff_runs` คุณจะไม่เผลอ merge การแก้ prompt ที่ทำให้คะแนนรวมเท่าเดิมแต่แอบทำเคสสำคัญที่เคยผ่านพังไป 3 ข้อ",
        "ข้อมูล Before/After จาก D170 นี้จะถูกส่งต่อไปรวมใน Milestone 4 Eval Report (D172) และใช้ยืนยันคุณภาพบน CI ใน B44",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Regression Diff & Error Triage สำหรับระบบ Probabilistic",
      body: [
        "ในงาน Web Dev เมื่อแก้บั๊ก 1 จุด คุณรัน Jest/Pytest เพื่อเช็กว่า unit test เก่าไม่พัง (No Regressions) ใน AI Engineering เราใช้หลักเดียวกันแต่เพิ่มมิติคะแนนต่อเนื่อง (0.0–1.0) ของ Ragas:",
      ],
      table: [
        ["Ragas (`Faithfulness`, `Recall`)", "Quality Metrics เชิงต่อเนื่องบนคำตอบ RAG"],
        ["Promptfoo (`assert` Matrix)", "Automated E2E & Regression Test Runner"],
        ["Top 3 Failure Modes Triage", "Pareto 80/20 Bug Prioritization หลัง QA"],
        ["`regressed == []` Gate", "CI Regression Check ก่อน Merge PR"],
      ],
    },
    student: {
      title: "First-Year Note — อย่าเปลี่ยน 5 อย่างพร้อมกันในครั้งเดียว",
      body: [
        "เวลาเห็นผล Eval ตก มือใหม่มักแก้ Prompt, เปลี่ยน `chunk_size`, ปรับ `top_k`, และเปลี่ยนโมเดลพร้อมกันในรอบเดียว แล้วพอคะแนนเปลี่ยนก็ตอบไม่ได้ว่าตัวไหนช่วยหรือตัวไหนพัง",
        "หลักวิทยาศาสตร์และวิศวกรรมคือ **เปลี่ยนทีละ 1 ตัวแปร** (เช่น รอบแรกแก้ Hybrid RRF ก่อน → วัดผล → รอบสองแก้ Abstention threshold → วัดผล) เพื่อเก็บหลักฐานการทดลองที่ชัดเจน",
      ],
    },
  },

  workedExample: {
    intro:
      "มาลองรันฟังก์ชันประเมินแบบ Ragas + Promptfoo บนชุดผลรันจำลอง จัดอันดับ Top 3 Failure Modes แล้วเปรียบเทียบ Before vs After เพื่อตรวจ Non-Regression กด **ขั้นต่อไป** ทีละขั้น",
    steps: [
      {
        title: "1 · คำนวณ Faithfulness, Context Recall และตรวจ Promptfoo Assertions",
        explain:
          "รวมการตรวจเชิงคุณภาพ (Claims ที่มีหลักฐาน / Claims ทั้งหมด) เข้ากับการตรวจเชิงกฎ (`route`, `status`, `pii_leaked`) ต่อเคส",
        code: {
          language: "python",
          filename: "worked_eval_runner.py",
          code: `from collections import Counter


def score_case(case: dict) -> dict:
    recall = (
        len(set(case["retrieved_chunks"]) & set(case["expected_chunks"])) / len(case["expected_chunks"])
        if case["expected_chunks"]
        else 1.0
    )
    faithfulness = (
        case["supported_claims"] / case["total_claims"]
        if case["total_claims"] > 0
        else (1.0 if case["actual_status"] in {"escalated", "blocked"} else 0.0)
    )
    route_ok = case["actual_route"] == case["expected_route"]
    status_ok = case["actual_status"] == case["expected_status"]
    no_pii = not case["pii_leaked"]
    passed = route_ok and status_ok and no_pii and recall >= 0.85 and faithfulness >= 0.85

    failure_mode = None
    if not passed:
        if not no_pii:
            failure_mode = "pii_or_attack_leak"
        elif recall < 0.85:
            failure_mode = "retrieval_miss"
        elif not status_ok and case["expected_status"] == "escalated":
            failure_mode = "over_eager_answering"
        else:
            failure_mode = "schema_or_citation_mismatch"
    return {"case_id": case["case_id"], "passed": passed, "failure_mode": failure_mode, "recall": recall, "faithfulness": faithfulness}`,
        },
      },
      {
        title: "2 · จัดอันดับ Top 3 Failure Modes จาก Run แรก (Baseline v1)",
        explain:
          "รันบนเคสตัวอย่าง 6 ข้อที่จำลองจุดพังจริงทั้ง 3 แบบ (`retrieval_miss`, `over_eager_answering`, `schema_or_citation_mismatch`) เพื่อดูลำดับความรุนแรง",
        code: {
          language: "python",
          filename: "worked_eval_runner.py",
          code: `baseline_cases = [
    {"case_id": "CAP-001", "expected_route": "faq_rag", "actual_route": "faq_rag", "expected_status": "completed", "actual_status": "completed", "expected_chunks": ["pol-refund#2"], "retrieved_chunks": ["pol-refund#2"], "supported_claims": 2, "total_claims": 2, "pii_leaked": False},
    {"case_id": "CAP-014", "expected_route": "faq_rag", "actual_route": "faq_rag", "expected_status": "completed", "actual_status": "completed", "expected_chunks": ["inv-009#1"], "retrieved_chunks": ["faq-01#1"], "supported_claims": 1, "total_claims": 1, "pii_leaked": False},
    {"case_id": "CAP-015", "expected_route": "faq_rag", "actual_route": "faq_rag", "expected_status": "completed", "actual_status": "completed", "expected_chunks": ["fee#4"], "retrieved_chunks": ["fee#1"], "supported_claims": 1, "total_claims": 1, "pii_leaked": False},
    {"case_id": "CAP-024", "expected_route": "escalate", "actual_route": "faq_rag", "expected_status": "escalated", "actual_status": "completed", "expected_chunks": [], "retrieved_chunks": [], "supported_claims": 0, "total_claims": 2, "pii_leaked": False},
    {"case_id": "CAP-025", "expected_route": "escalate", "actual_route": "faq_rag", "expected_status": "escalated", "actual_status": "completed", "expected_chunks": [], "retrieved_chunks": [], "supported_claims": 0, "total_claims": 1, "pii_leaked": False},
    {"case_id": "CAP-006", "expected_route": "faq_rag", "actual_route": "faq_rag", "expected_status": "completed", "actual_status": "completed", "expected_chunks": ["pol-ship#1"], "retrieved_chunks": ["pol-ship#1"], "supported_claims": 1, "total_claims": 2, "pii_leaked": False},
]

scored_v1 = [score_case(c) for c in baseline_cases]
top3 = Counter(r["failure_mode"] for r in scored_v1 if r["failure_mode"]).most_common(3)
print("Pass rate v1:", f"{sum(r['passed'] for r in scored_v1)}/{len(scored_v1)}")
print("Top 3 Failure Modes:", top3)`,
        },
        output: `Pass rate v1: 1/6
Top 3 Failure Modes: [('retrieval_miss', 2), ('over_eager_answering', 2), ('schema_or_citation_mismatch', 1)]`,
      },
      {
        title: "3 · ซ่อม Top 3 Failure Modes แล้วเช็ก Before vs After (0 Regressions)",
        explain:
          "จำลองผลหลังเปิด PyThaiNLP Hybrid BM25 (แก้ `retrieval_miss`), ตั้ง `min_score=0.45` (แก้ `over_eager_answering`) และเพิ่ม Citation Verifier (แก้ `schema_or_citation_mismatch`)",
        code: {
          language: "python",
          filename: "worked_eval_runner.py",
          code: `fixed_cases = [
    {**c, "retrieved_chunks": list(c["expected_chunks"]), "actual_route": c["expected_route"], "actual_status": c["expected_status"], "supported_claims": c["total_claims"]}
    for c in baseline_cases
]
scored_v2 = [score_case(c) for c in fixed_cases]

v1_map = {r["case_id"]: r["passed"] for r in scored_v1}
v2_map = {r["case_id"]: r["passed"] for r in scored_v2}
regressed = [cid for cid, ok in v2_map.items() if not ok and v1_map[cid]]

print("Pass rate v2:", f"{sum(r['passed'] for r in scored_v2)}/{len(scored_v2)} | regressed:", regressed)`,
        },
        output: `Pass rate v2: 6/6 | regressed: []`,
      },
    ],
    gotcha:
      "จุดสังเกต: ในการคำนวณ `Faithfulness` สำหรับเคส `unanswerable` ที่ระบบปฏิเสธคำตอบอย่างถูกต้อง (`total_claims == 0` และ `actual_status == 'escalated'`) ห้ามให้ `0.0` เพราะการปฏิเสธเมื่อไม่มีหลักฐานถือว่าซื่อสัตย์ — แต่ถ้าไม่มีหลักฐานแล้วยังฝืนตอบ (`actual_status == 'completed'`) จึงค่อยให้ `0.0`",
  },

  practice: {
    intro:
      "สร้างโมดูล `src/eval_runner.py` สำหรับรันประเมินผลสไตล์ Ragas + Promptfoo บนชุดข้อมูล Golden Set, คัดกรอง Top 3 Failure Modes และเปรียบเทียบผล Before vs After แบบกัน Regression",
    requirements: [
      "สร้างโมเดล `EvalSampleResult(BaseModel)` ที่มี `case_id`, `slice`, `expected_route`, `actual_route`, `expected_status`, `actual_status`, `expected_chunks: list[str]`, `retrieved_chunks: list[str]`, `supported_claims: int`, `total_claims: int`, `schema_valid: bool`, `pii_leaked: bool = False`",
      "สร้างฟังก์ชัน `evaluate_sample(sample: EvalSampleResult) -> dict` คืน `case_id`, `slice`, `context_recall`, `faithfulness`, `passed: bool`, และ `failure_mode: str | None` (จำแนกเป็น `\"pii_or_attack_leak\"`, `\"schema_error\"`, `\"retrieval_miss\"`, `\"over_eager_answering\"`, `\"false_refusal\"`, หรือ `\"faithfulness_drop\"` ตามลำดับความสำคัญ)",
      "สร้างฟังก์ชัน `run_eval_suite(samples: list[EvalSampleResult]) -> dict` (โยน `ValueError` ถ้า `samples` ว่าง) คืน `total`, `pass_rate`, `avg_recall`, `avg_faithfulness`, `by_slice`, `top_failure_modes` (list ของ tuple `(mode, count)` สูงสุด 3 อันดับแรก), และ `case_passed_map: dict[str, bool]`",
      "สร้างฟังก์ชัน `compare_eval_runs(before_report: dict, after_report: dict) -> dict` คืน `pass_rate_delta`, `fixed_case_ids` (sorted), `regressed_case_ids` (sorted), และ `non_regression_passed: bool` (`len(regressed_case_ids) == 0` และ `pass_rate_delta >= 0.0`)",
    ],
    starter: {
      language: "python",
      filename: "src/eval_runner.py",
      code: `from __future__ import annotations

from collections import Counter, defaultdict
from pydantic import BaseModel, Field


class EvalSampleResult(BaseModel):
    case_id: str
    slice: str
    expected_route: str
    actual_route: str
    expected_status: str
    actual_status: str
    expected_chunks: list[str] = Field(default_factory=list)
    retrieved_chunks: list[str] = Field(default_factory=list)
    supported_claims: int = Field(ge=0)
    total_claims: int = Field(ge=0)
    schema_valid: bool = True
    pii_leaked: bool = False


def evaluate_sample(sample: EvalSampleResult) -> dict:
    # TODO: คำนวณ context_recall, faithfulness, passed, failure_mode
    raise NotImplementedError


def run_eval_suite(samples: list[EvalSampleResult]) -> dict:
    # TODO: สรุปคะแนนรวม, ราย slice, top 3 failure modes และ case_passed_map
    raise NotImplementedError


def compare_eval_runs(before_report: dict, after_report: dict) -> dict:
    # TODO: หา fixed_case_ids, regressed_case_ids และ non_regression_passed
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "tests/test_eval_runner.py",
      code: `import pytest
from src.eval_runner import (
    EvalSampleResult,
    compare_eval_runs,
    evaluate_sample,
    run_eval_suite,
)


def _sample(
    case_id: str,
    *,
    slice_name: str = "thai_faq",
    expected_route: str = "faq_rag",
    actual_route: str = "faq_rag",
    expected_status: str = "completed",
    actual_status: str = "completed",
    expected_chunks: list[str] | None = None,
    retrieved_chunks: list[str] | None = None,
    supported_claims: int = 2,
    total_claims: int = 2,
    schema_valid: bool = True,
    pii_leaked: bool = False,
) -> EvalSampleResult:
    return EvalSampleResult(
        case_id=case_id,
        slice=slice_name,
        expected_route=expected_route,
        actual_route=actual_route,
        expected_status=expected_status,
        actual_status=actual_status,
        expected_chunks=["pol#1"] if expected_chunks is None else expected_chunks,
        retrieved_chunks=["pol#1"] if retrieved_chunks is None else retrieved_chunks,
        supported_claims=supported_claims,
        total_claims=total_claims,
        schema_valid=schema_valid,
        pii_leaked=pii_leaked,
    )


def test_evaluate_sample_identifies_failure_modes():
    ok = evaluate_sample(_sample("CAP-001"))
    assert ok["passed"] is True
    assert ok["failure_mode"] is None

    leak = evaluate_sample(_sample("CAP-033", slice_name="attack", pii_leaked=True))
    assert leak["failure_mode"] == "pii_or_attack_leak"

    miss = evaluate_sample(_sample("CAP-014", slice_name="code_switch", retrieved_chunks=["other#1"]))
    assert miss["failure_mode"] == "retrieval_miss"

    eager = evaluate_sample(
        _sample(
            "CAP-024",
            slice_name="unanswerable",
            expected_route="escalate",
            actual_route="faq_rag",
            expected_status="escalated",
            actual_status="completed",
            expected_chunks=[],
            retrieved_chunks=[],
        )
    )
    assert eager["failure_mode"] == "over_eager_answering"


def test_false_refusal_and_schema_error_classification():
    refused = evaluate_sample(
        _sample(
            "CAP-002",
            expected_status="completed",
            actual_status="escalated",
            actual_route="escalate",
            supported_claims=0,
            total_claims=0,
        )
    )
    assert refused["passed"] is False
    assert refused["failure_mode"] == "false_refusal"

    bad_schema = evaluate_sample(_sample("CAP-003", schema_valid=False))
    assert bad_schema["passed"] is False
    assert bad_schema["failure_mode"] == "schema_error"


def test_run_eval_suite_ranks_top_3_failure_modes():
    samples = [
        _sample("CAP-001"),
        _sample("CAP-014", slice_name="code_switch", retrieved_chunks=["x#1"]),
        _sample("CAP-015", slice_name="code_switch", retrieved_chunks=["x#2"]),
        _sample("CAP-016", slice_name="code_switch", retrieved_chunks=["x#3"]),
        _sample("CAP-024", slice_name="unanswerable", expected_route="escalate", actual_route="faq_rag", expected_status="escalated", actual_status="completed", expected_chunks=[], retrieved_chunks=[]),
        _sample("CAP-025", slice_name="unanswerable", expected_route="escalate", actual_route="faq_rag", expected_status="escalated", actual_status="completed", expected_chunks=[], retrieved_chunks=[]),
        _sample("CAP-006", supported_claims=1, total_claims=2),
        _sample("CAP-007", schema_valid=False),
    ]
    report = run_eval_suite(samples)
    assert report["total"] == 8
    assert report["top_failure_modes"] == [
        ("retrieval_miss", 3),
        ("over_eager_answering", 2),
        ("faithfulness_drop", 1),
    ] or report["top_failure_modes"][:2] == [("retrieval_miss", 3), ("over_eager_answering", 2)]


def test_compare_eval_runs_detects_fixes_and_regressions():
    before = run_eval_suite([
        _sample("CAP-001"),
        _sample("CAP-014", retrieved_chunks=["x#1"]),
    ])
    after_good = run_eval_suite([
        _sample("CAP-001"),
        _sample("CAP-014"),
    ])
    diff_ok = compare_eval_runs(before, after_good)
    assert diff_ok["fixed_case_ids"] == ["CAP-014"]
    assert diff_ok["regressed_case_ids"] == []
    assert diff_ok["non_regression_passed"] is True

    after_regressed = run_eval_suite([
        _sample("CAP-001", actual_status="escalated", actual_route="escalate"),
        _sample("CAP-014"),
    ])
    diff_bad = compare_eval_runs(before, after_regressed)
    assert diff_bad["regressed_case_ids"] == ["CAP-001"]
    assert diff_bad["non_regression_passed"] is False


def test_empty_samples_raises():
    with pytest.raises(ValueError):
        run_eval_suite([])
`,
    },
    selfCheck: [
      "รัน `uv run pytest -q tests/test_eval_runner.py` แล้วผ่านครบทั้ง 5 test cases",
      "ลองทดสอบนำชุดเคสจริงจาก `evals/golden_40.jsonl` (D169) มารันผ่าน `run_eval_suite` และตรวจผล `top_failure_modes`",
      "ตรวจว่าเมื่อแก้ปัญหาใน slice หนึ่งแล้ว `compare_eval_runs` รายงาน `regressed_case_ids == []`",
      "รัน `uv run ruff check .` แล้วไม่พบ lint error",
    ],
    acceptance: "ผ่านทั้ง 5 test cases ใน `tests/test_eval_runner.py` และสามารถจัดอันดับ Top 3 Failure Modes พร้อมเทียบ Before/After Regression ได้ถูกต้อง",
    hints: [
      {
        body: "ใน `evaluate_sample` จัดลำดับเช็ก failure mode จากอันตรายสุดก่อน: `pii_leaked` → `not schema_valid` → `context_recall < 0.85` → `over_eager_answering` (`expected_status in {'escalated', 'blocked'}` แต่ `actual_status == 'completed'`) → `false_refusal` (`expected_status == 'completed'` แต่ `actual_status != 'completed'`) → `faithfulness < 0.85` หรือ route ไม่ตรง",
      },
      {
        body: "สำหรับเคส `unanswerable` / `attack` ที่ `expected_chunks == []` ให้ตั้ง `context_recall = 1.0` เพื่อไม่ให้ตัวหารเป็น 0 และเมื่อ `total_claims == 0` หาก `actual_status in {'escalated', 'blocked'}` ให้ `faithfulness = 1.0` (แต่ถ้า `actual_status == 'completed'` ให้ `0.0`)",
      },
      {
        body: "โครงสร้างของ `evaluate_sample` และ `compare_eval_runs` สำหรับตรวจสอบความครบถ้วน",
        code: {
          language: "python",
          filename: "hint_day170.py",
          code: `def evaluate_sample(sample: EvalSampleResult) -> dict:
    recall = (
        len(set(sample.retrieved_chunks) & set(sample.expected_chunks)) / len(sample.expected_chunks)
        if sample.expected_chunks
        else 1.0
    )
    if sample.total_claims > 0:
        faith = sample.supported_claims / sample.total_claims
    else:
        faith = 1.0 if sample.actual_status in {"escalated", "blocked"} else 0.0

    route_ok = sample.actual_route == sample.expected_route
    status_ok = sample.actual_status == sample.expected_status
    passed = (
        not sample.pii_leaked
        and sample.schema_valid
        and route_ok
        and status_ok
        and recall >= 0.85
        and faith >= 0.85
    )
    failure_mode = None
    if not passed:
        if sample.pii_leaked:
            failure_mode = "pii_or_attack_leak"
        elif not sample.schema_valid:
            failure_mode = "schema_error"
        elif recall < 0.85:
            failure_mode = "retrieval_miss"
        elif sample.expected_status in {"escalated", "blocked"} and sample.actual_status == "completed":
            failure_mode = "over_eager_answering"
        elif sample.expected_status == "completed" and sample.actual_status != "completed":
            failure_mode = "false_refusal"
        else:
            failure_mode = "faithfulness_drop"
    return {
        "case_id": sample.case_id,
        "slice": sample.slice,
        "context_recall": recall,
        "faithfulness": faith,
        "passed": passed,
        "failure_mode": failure_mode,
    }`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q tests/test_eval_runner.py
uv run ruff check .`,
      caption: "รันทดสอบ Ragas + Promptfoo Eval Runner และตัวตรวจ Regression",
    },
  },

  mistakes: [
    {
      title: "ดูแต่ค่าเฉลี่ยรวมหลังแก้ปัญหา โดยไม่ตรวจ Regressed Cases",
      symptom: "เพิ่ม `min_score` แล้ว `unanswerable` ผ่าน 100% คะแนนรวมขยับขึ้น 2% แต่เคส `thai_faq` ที่เคยตอบถูก 4 ข้อกลับโดนปฏิเสธหมด",
      fix: "ใช้ `compare_eval_runs` ตรวจ `regressed_case_ids` ทุกครั้งหลังแก้ระบบ เพื่อดูว่าไม่มีเคสเก่าที่เคยผ่านกลับมาพัง",
    },
    {
      title: "แก้ปัญหา Prompt Injection / Over-Eager ด้วยการเพิ่มข้อความใน Prompt ยาว 2 หน้า",
      symptom: "Prompt บวมขึ้นจนกิน token และโมเดลสับสนคำสั่งที่ขัดกันเอง ทำให้ `Faithfulness` ตก",
      fix: "แก้ให้ตรงชั้น: ใช้ Hybrid BM25+Rerank แก้ Retrieval Miss, ใช้ `min_score` + Verifier แก้ Over-Eager/Citations และใช้ Guardrail Regex/Classifier แก้ Attack",
    },
    {
      title: "ลืมบันทึก `prompt_version` คู่กับผลรัน Eval",
      symptom: "ผ่านไป 3 วันจำไม่ได้ว่าผล `0.90` เมื่อวันอังคารรันด้วย system prompt หรือ `top_k` ค่าไหน",
      fix: "ผูก {{prompt-versioning}} และ `corpus_version` เข้ากับ metadata ของผลประเมินทุกครั้ง",
    },
    {
      title: "รัน Promptfoo/Ragas กับ Judge ราคาแพงทุกครั้งระหว่างจูนโค้ด",
      symptom: "ผลาญงบ API ค่า Judge ไปหลายร้อยบาทระหว่างแก้โค้ดเบื้องต้นบน `dev`",
      fix: "รัน Deterministic/Offline Assertions (`schema`, `route`, `citation_in_chunks`, `recall`) ก่อนเป็นด่านแรก แล้วค่อยรัน {{llm-as-a-judge}} บน `holdout` เมื่อโค้ดนิ่ง",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d170-q1",
        "เมื่อรัน Ragas + Promptfoo บน Golden Set 40 ข้อ พบว่า `Context Recall` ของ slice `code_switch` ต่ำ (`0.60`) แต่ `Faithfulness` ของเคสที่ดึงเอกสารเจอสูงถึง `0.95` การแก้จุดพังนี้ควรทำที่ชั้นใด?",
        [
          ["ปรับ `temperature` ของ LLM ลงจาก `0.2` เป็น `0.0`", "LLM ไม่ได้หลอน (`Faithfulness = 0.95` สูงมากแล้ว) ปัญหาอยู่ที่การค้นหาเอกสารไม่เจอ"],
          ["แก้ฝั่ง Retrieval (เช่น เปิด PyThaiNLP BM25 + RRF สำหรับคำผสมไทย-อังกฤษ/รหัส หรือเพิ่ม Reranker)", "ถูก — `Context Recall` ต่ำแปลว่าเอกสารที่ถูกต้องไม่ติด Top-k ต้องแก้ที่ระบบค้นหา"],
          ["เพิ่มความยาว System Prompt อีก 500 คำ", "System Prompt ทำงานหลัง Retrieval ไม่ช่วยให้ค้นเอกสารเจอเพิ่มขึ้น"],
          ["ปิด Citation Verifier", "การปิดตัวตรวจทำให้ citation ปลอมหลุดได้ แต่ไม่ช่วยดึงเอกสารที่หายไปกลับมา"],
        ],
        "B",
        "`Context Recall` ต่ำคู่กับ `Faithfulness` สูงเป็นอาการคลาสสิกของปัญหาฝั่ง Retrieval — ระบบตอบซื่อสัตย์ดีเมื่อได้เอกสาร แต่ค้นเอกสารภาษาไทยผสมอังกฤษไม่เจอ",
        "ถ้า Context Recall ต่ำ (0.60) แต่ Faithfulness สูง (0.95) ควรแก้ที่ชั้นใดของ RAG?",
        "แก้ที่ชั้น Retrieval (PyThaiNLP BM25 + RRF, chunking, หรือ Cross-Encoder Reranker) ไม่ใช่แก้ที่ LLM prompt",
      ),
      mc(
        "d170-q2",
        "ผลพลอยได้อันตรายที่ต้องระวังที่สุดเมื่อเพิ่ม `min_score` threshold เพื่อแก้ปัญหา `over_eager_answering` ใน slice `unanswerable` คืออะไร?",
        [
          ["เกิด `false_refusal` กับเคส `thai_faq` หรือ `code_switch` ที่ควรตอบได้ แต่ถูกปัดตกเป็น `escalated`", "ถูก — threshold สูงเกินไปจะทำให้คำถามที่มีคำตอบจริงแต่คะแนนก้ำกึ่งโดนปฏิเสธไปด้วย (ต้องตรวจ `regressed_case_ids`)"],
          ["ฐานข้อมูล SQLite จะลบตาราง `orders` ทิ้ง", "`min_score` ใน RAG ไม่ได้สั่งลบตารางฐานข้อมูล"],
          ["ไฟล์ JSONL จะเปลี่ยนรูปแบบเป็น CSV เอง", "threshold ไม่มีผลต่อรูปแบบไฟล์"],
          ["จำนวน token ของ System Prompt จะเพิ่มขึ้น 10 เท่า", "threshold เป็นตัวเลขเปรียบเทียบคะแนน ไม่ได้เพิ่ม token ใน prompt"],
        ],
        "A",
        "การเพิ่ม threshold มี trade-off ระหว่างการลด False Answer กับการเพิ่ม False Refusal จึงต้องตรวจ Non-Regression ข้ามทุก slice เสมอ",
        "เมื่อปรับ `min_score` สูงขึ้นเพื่อแก้ Over-Eager Answering ต้องตรวจความเสี่ยงใดใน Non-Regression Check?",
        "ตรวจ False Refusal (`regressed_case_ids` ใน slice `thai_faq` และ `code_switch`) ว่าคำถามที่ควรตอบได้ไม่ถูกปฏิเสธไปด้วย",
      ),
      mc(
        "d170-q3",
        "เหตุใดเราจึงใช้ทั้ง **Ragas** และ **Promptfoo** ร่วมกันใน Capstone แทนที่จะใช้แค่ Ragas ตัวเดียว?",
        [
          ["เพราะ Ragas รันใน Python ไม่ได้", "Ragas เป็นไลบรารี Python แต่เน้นวัดคุณภาพข้อมูล RAG (Faithfulness, Recall, Precision)"],
          ["เพราะ Ragas ใช้วัดคุณภาพเชิงเนื้อหาของ RAG (Triad) ส่วน Promptfoo ใช้วัด regression matrix ข้ามเส้นทาง (Router, Schema, Guardrails, Abstention, Prompt Versions)", "ถูก — ทั้งสองเครื่องมือเสริมจุดแข็งซึ่งกันและกันครบทั้งสาย RAG และ Agent/Security"],
          ["เพราะ Promptfoo ใช้แทน FastAPI Server ใน Production ได้", "Promptfoo เป็นเครื่องมือ Eval/Testing ไม่ใช่ Web Server ใน Production"],
          ["เพราะ Ragas ไม่รองรับข้อความภาษาไทย", "Ragas รองรับภาษาไทยได้ผ่าน LLM Judge ที่อ่านภาษาไทยออก"],
        ],
        "B",
        "ระบบ Capstone มีทั้ง RAG และ Non-RAG routes (MCP Lookup, HITL, Attack Guardrails) จึงต้องใช้ Ragas คู่กับ Promptfoo เพื่อให้ครอบคลุมทุกพฤติกรรม",
        "บทบาทของ Ragas และ Promptfoo ต่างกันอย่างไรในการประเมิน Capstone?",
        "Ragas วัด RAG Triad (Faithfulness, Context Recall/Precision) ส่วน Promptfoo รัน regression assertions ข้าม prompt versions, schema, routing และ security guardrails",
      ),
      mc(
        "d170-q4",
        "ในการจัดอันดับ Top 3 Failure Modes หลังรัน 40 เคส วิธีใดคือแนวทางการปรับปรุงระบบที่ถูกต้องตามหลักวิศวกรรม?",
        [
          ["แก้ทุกไฟล์ (chunk size, prompt, model, threshold) พร้อมกันใน commit เดียวแล้วรัน eval รอบเดียว", "อันตราย — ถ้าคะแนนเปลี่ยนจะไม่รู้ว่าตัวแปรไหนช่วยหรือตัวไหนทำให้แย่ลง"],
          ["จัดอันดับ Failure Modes ที่พบบ่อย/ร้ายแรงสุด 3 อันดับแรก แล้วแก้ทีละจุดพร้อมติด prompt version และตรวจ Non-Regression Diff หลังแก้ทุกครั้ง", "ถูก — เปลี่ยนทีละตัวแปรและวัด Before vs After ช่วยยืนยันผลลัพธ์ที่แท้จริงและกัน regression"],
          ["ลบเคสที่สอบตกออกจาก `golden_40.jsonl` จนกว่าคะแนนจะถึง 0.90", "ห้ามโกงข้อสอบ — การลบเคสตกคือการซ่อนบั๊กไว้รอระเบิดใน Production"],
          ["เปลี่ยนไปใช้โมเดลที่แพงที่สุดทันทีโดยไม่ดูผล Error Analysis", "ถ้า Retrieval พลาด โมเดลที่แพงขึ้นก็ยังไม่เจอเอกสารอยู่ดี"],
        ],
        "B",
        "การแก้ทีละจุดตามลำดับ Top 3 Failure Modes และรัน Non-Regression Diff เป็นมาตรฐานของ Eval-Driven Development",
        "ขั้นตอนที่ถูกต้องหลังพบ Failure Modes จากการรัน Eval 40 เคสคืออะไร?",
        "จัดกลุ่มและเรียงลำดับ Top 3 Failure Modes → แก้ทีละต้นตอ → รัน Eval ซ้ำเพื่อวัด Before vs After และตรวจ `regressed_case_ids == []`",
      ),
    ],
  },

  takeaways: [
    "ใช้ {{ragas}} วัดคุณภาพ RAG Triad (`Faithfulness`, `Context Recall/Precision`) คู่กับ {{promptfoo}} สำหรับ regression, routing, {{schema}} และ {{guardrails}}",
    "ทำ Error Analysis จัดอันดับ **Top 3 Failure Modes** (`retrieval_miss`, `over_eager_answering`, `schema/citation`) เพื่อลงมือแก้จุดที่ให้ผลตอบแทนสูงสุดก่อน",
    "แก้ทีละตัวแปรพร้อม {{prompt-versioning}} และรัน Non-Regression Check (`regressed_case_ids == []`) เพื่อกันไม่ให้แก้ slice หนึ่งแล้วไปพังอีก slice",
    "ตัวเลข Before vs After ของวันนี้จะเป็นหลักฐานสำคัญทั้งใน Milestone 4 Eval Report (D172) และ Final Defense (D180)",
  ],

  reviewCards: [
    rc(
      "d170-rc-1",
      "Top 3 Failure Modes ที่พบบ่อยในระบบ Capstone สองภาษาคืออะไร และแต่ละแบบแก้ที่ชั้นไหน?",
      "1) Retrieval Miss (Code-Switch/Exact ID) → แก้ PyThaiNLP BM25/RRF/Reranker, 2) Over-Eager Answering → จูน min_score + Abstention prompt, 3) Schema/Citation Error → บังคับ Structured Output + Citation Verifier",
    ),
    rc(
      "d170-rc-2",
      "`compare_eval_runs(before, after)` ต้องตรวจอะไรเพื่อยืนยัน Non-Regression?",
      "ตรวจว่า pass_rate_delta >= 0 และ regressed_case_ids (เคสที่เคยผ่านใน before แต่กลับมาตกใน after) ต้องว่างเปล่า",
    ),
    rc(
      "d170-rc-3",
      "ทำไมเคส `unanswerable` ที่ระบบปฏิเสธถูกต้อง (`escalated`) จึงควรได้ `Faithfulness = 1.0` แม้ `total_claims == 0`?",
      "เพราะระบบไม่แต่งข้อเท็จจริงโดยไร้หลักฐาน ถือว่าซื่อสัตย์ต่อบริบท (ถ้า `total_claims == 0` แต่ status ดันเป็น `completed` จึงจะถือว่าตก)",
    ),
  ],

  sources: [
    { label: "Ragas Documentation — Faithfulness & Context Metrics", href: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/" },
    { label: "Promptfoo Documentation — Assertions & Regression", href: "https://www.promptfoo.dev/docs/configuration/expected-outputs/" },
    { label: "Hamel Husain — Your AI Product Needs Evals", href: "https://hamel.dev/blog/posts/evals/" },
    { label: "Anthropic — Evaluating AI Systems", href: "https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool" },
  ],

  glossary: ["ragas", "promptfoo", "groundedness", "abstention", "llm-as-a-judge", "structured-output", "prompt-versioning", "pythainlp", "reranker", "guardrails"],
});
