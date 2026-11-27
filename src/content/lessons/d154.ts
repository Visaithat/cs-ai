import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/** D154 — Phase 5 / Block B39 */
export const d154: Lesson = defineLesson({
  day: 154,
  titleTh: "รัน Promptfoo Eval Suite ครบชุด ทั้งความปลอดภัยและคุณภาพคำตอบ",
  tagline: "30 นาที · ใช้ Promptfoo YAML ชุดเดียวตรวจคำตอบ การปฏิเสธ สิทธิ์ และการปิดบัง ก่อนผ่าน CI",
  icon: "workflow",
  visual: {
    id: "promptfoo-regression",
    title: "เมทริกซ์คุณภาพและความปลอดภัยของ Thai Knowledge RAG",
    caption: "ตามหนึ่งแถวจาก fixture ไปยัง FastAPI แล้วอ่านผล assertions รายเคสใน CI",
    alt: "เมทริกซ์ Promptfoo แสดงแถวของคำตอบปกติ คำถามไม่มีหลักฐาน สัญญาณปฏิเสธ สิทธิ์ และข้อมูลสังเคราะห์",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ FastAPI TestClient กับ engine และผล policy สังเคราะห์จากเครื่องตัวเอง ไม่ต้องเรียกโมเดลหรือใช้ API key",
  tools: ["Promptfoo 0.126.0", "Python 3.12", "FastAPI TestClient", "pytest", "GitHub Actions"],
  bigPicture: [
    {
      node: 1,
      heading: "ล็อกกรณีอ้างอิง",
      body: "ดึงเกณฑ์จาก Day 130 ได้แก่ จำนวนวัน เอกสารอ้างอิง และคำตอบเมื่อไม่พบข้อมูล แล้วกำหนดรหัสกรณีเป็นภาษาเดียวกันทั้งชุด",
      lessonNote: "รหัสเคสทำให้ย้อนจากรายงานไปหาที่มาของความคาดหวังได้",
    },
    {
      node: 3,
      heading: "ให้ทุกด่านผ่านแยกกัน",
      body: "เพิ่มเคสการบังคับใช้นโยบายจาก Day 152 เช่น สัญญาณฝั่งเซิร์ฟเวอร์ สิทธิ์ operation และผลข้างเคียงที่ต้องเป็นศูนย์",
      lessonNote: "เพิ่มช่องตรวจ canary จาก Day 151 ทั้ง input, output และ trace ควบคู่กับเงื่อนไขคุณภาพเดิม",
    },
    {
      node: 4,
      heading: "วัดที่ขอบเขตของ API",
      body: "ให้ {{promptfoo}} เรียก Python provider ที่เข้าถึง POST /query ผ่าน TestClient จาก Day 153",
      lessonNote: "fixture ฉีดสัญญาณผ่าน dependency override ภายในแอปทดสอบเฉพาะรายเคส",
    },
    {
      node: 5,
      heading: "ให้ผลที่อ่านได้และหยุด merge ได้",
      body: "คงชื่อ required check ของ Day 131 และใช้ exit code ของคำสั่ง eval ทำให้ job เป็นสีแดงเมื่อ assertion พลาด",
      lessonNote: "เก็บรายงานแม้ job ล้ม เพื่อเห็นว่าอาการเกิดที่คุณภาพ สิทธิ์ หรือข้อมูลส่วนบุคคล",
    },
  ],
  objectives: [
    "สร้าง promptfooconfig.yaml หนึ่งไฟล์ที่ตรวจ Thai FAQ, code-switch, abstention, policy, scope และ masking",
    "เขียน Python provider ที่วัด HTTP response, การเรียก engine, trace และผล redaction ผ่านแอป Day 153",
    "แทนขั้น Promptfoo ใน CI ของ Day 131 แล้วพิสูจน์ว่าการเปลี่ยน expectation หนึ่งรายการทำให้ gate ตก",
  ],
  prerequisites: [
    "Day 130 อ่านเมทริกซ์ Promptfoo และเคยเขียน assertion สำหรับคำตอบพร้อม citation",
    "Day 131 มีงาน Thai RAG eval gate ที่ติดตั้ง Node กับ uv ผ่าน lockfiles และอัปโหลดรายงานเสมอ",
    "Day 151 รู้ขอบเขตที่ PII อาจข้าม Day 152 เข้าใจ expected policy action และ Day 153 มี guarded_api.py จากตัวอย่าง",
  ],
  setup: {
    intro: "ทำงานที่รากโปรเจกต์ Day 131 ซึ่งมี lockfiles แล้วนำ guarded_api.py จาก worked example ของ Day 153 มาวางข้างไฟล์ eval",
    commands: `uv add fastapi pydantic
uv add --dev pytest httpx
npm ci
uv run --locked npx --no-install promptfoo --version`,
    steps: [
      ["files", "วาง guarded_api.py ข้าง promptfooconfig.yaml"],
      ["python", "ติดตั้ง dependency ของ FastAPI และ TestClient ใน environment ที่ uv จัดการ"],
      ["node", "ยืนยัน Promptfoo ตาม lockfile จาก Day 130–131 และใช้ Node ที่ workflow ระบุ"],
    ],
    note: "ลงทะเบียน Python provider ด้วย file URL แบบ relative และรันจากโฟลเดอร์เดียวกันเพื่อให้ subprocess หาโมดูล guarded_api เจอ บน Windows ใช้ npx.cmd แทน npx ในคำสั่งที่ขึ้นต้นด้วย uv run",
  },
  concepts: [
    {
      id: "matrix",
      title: "1 · หนึ่งชุดข้อมูล หลายพฤติกรรมที่ต้องรักษา",
      paragraphs: [
        "เริ่มด้วย quality FAQ ภาษาไทยและแบบ code-switch ทั้งคู่ต้องได้คำตอบ 7 วันและอ้าง returns ตอนที่สอง ข้อความที่ไม่พบหลักฐานต้องคืนสถานะ abstained พร้อมประโยคคงที่ เพื่อให้ตัวตรวจ deterministic เทียบได้ในทุก pull request",
        "ฝั่ง policy ทดสอบจุดตัดสินที่ Day 152 ให้บันทึก expected action โดยกรณีภาษาไทย ภาษาอังกฤษ และเอกสารใช้สัญญาณที่จำแนกแล้วใน fake ส่วนกรณี scope ใช้สิทธิ์ FAQ เดิม แอปทุกตัวถูกสร้างใหม่ต่อแถวเพื่อไม่ให้ dependency override รั่วไปอีกแถว",
        "กรณีเบอร์สังเคราะห์ต้องยังตอบ FAQ ได้ การบล็อกทุกคำขอจึงทำให้ชุดคุณภาพและ privacy ตกพร้อมกัน ทั้งยังใช้ metrics คนละชนิดได้ในรายงานของทีม",
      ],
      analogy: "เหมือนเช็ครถทั้งตอนเลี้ยวปกติและตอนเหยียบเบรก เส้นทางทั้งสองต้องทำงานตามสัญญาของตัวเอง",
      bullets: [
        "ใช้ case_id ที่เสถียรเพื่อเทียบย้อนหลัง",
        "เช็ก citation กับเนื้อหาตาม fixture เดียวกัน",
        "บันทึกผล policy ที่คาดใน assertion แยกจากตัวแอป",
      ],
      code: {
        language: "python",
        filename: "inspect_cases.py",
        code: `from test_eval_provider import call_api
for case_id in ("quality-faq", "quality-missing", "policy-scope"):
    observed = call_api(case_id, {}, {})["output"]
    print(case_id, observed["http_status"], observed["engine_calls"])
`,
      },
      whyTitle: "คะแนนรวมอาจกลบ regression ที่สำคัญ",
      whyParagraphs: [
        "ถ้าจำนวนเคสคำตอบปกติมากขึ้น คะแนนเฉลี่ยอาจสูงขึ้นทั้งที่สิทธิ์เสีย",
        "การกำหนดแต่ละแถวให้คงข้อตกลงของตัวเองทำให้อ่าน diff ของ suite ได้ตรงกับการเปลี่ยน behavior",
      ],
    },
    {
      id: "observed",
      title: "2 · เก็บสิ่งที่ระบบทำจริงใน isolated provider",
      paragraphs: [
        "งานของ call_api คือแปลงชื่อ fixture เป็นการเรียก API แล้วคืน output ที่ Promptfoo อ่านได้ การตัดสินผ่านอยู่ใน YAML ขั้นนี้ไม่ต้องคาดเดาว่า HTTP 403 หมายถึงไม่มี side effect ให้ spy นับว่ามีการเรียก engine จริงกี่ครั้ง",
        "risk เป็นสัญญาณจาก dependency ฝั่งเซิร์ฟเวอร์ซึ่งถูกแทนที่ใน test เท่านั้น เส้นทางนี้วัด enforcement หลังการจัดกลุ่มความเสี่ยง ความแม่นของตัวจำแนกและคุณภาพจากโมเดลจริงต้องมีหลักฐานของตัวเองเมื่อขึ้น staging",
        "สำหรับ privacy ตรวจ canary ในสิ่งที่ engine ได้รับ body ของ response และ metadata ทั้งชิ้นก่อนคืนข้อมูลให้ Promptfoo ถ้าเห็น canary ให้ส่ง error คงที่ มิเช่นนั้นรายงาน CI จะกลายเป็นสำเนาของค่าที่พยายามตรวจหา",
      ],
      analogy: "เหมือนตรวจทั้งบิลหน้าร้านกับยอดที่ระบบหลังร้านได้รับ เพื่อรู้ว่าธุรกรรมเกิดขึ้นจริงหรือถูกหยุดตั้งแต่ต้น",
      bullets: [
        "trace เชื่อมด้วย request ID ที่สุ่มโดย API",
        "ตรวจ allowlist ของ key ก่อนประกอบ output",
        "mask count ช่วยบอกว่าตัวกรองทำงานตรงขอบเขตใด",
      ],
      code: {
        language: "python",
        filename: "probe_boundary.py",
        code: `from test_eval_provider import call_api
blocked = call_api("policy-document", {}, {})["output"]
assert blocked["http_status"] == 403
assert blocked["engine_calls"] == 0
masked = call_api("privacy-phone", {}, {})["output"]
assert masked["input_mask_count"] == masked["output_mask_count"] == 1
`,
      },
      whyTitle: "หลักฐานจากหลายขอบเขตช่วยแยกเหตุล้มเหลว",
      whyParagraphs: [
        "HTTP 200 บอกเพียงว่า API ตอบสำเร็จ การส่งคำถามให้ engine อาจเกิดก่อนปิดบังได้ถ้าเลื่อนลำดับผิด",
        "ตรวจทั้งจำนวนการปิดบังและการไม่พบค่าเดิมเพื่อจับตัวกรองที่นับถูกแต่คืนค่าผิด",
      ],
    },
    {
      id: "ci",
      title: "3 · เชื่อม suite เข้ากับ required check เดิม",
      paragraphs: [
        "YAML มี prompts, providers, defaultTest และ tests ใช้ description อ่านในรายงาน case_id เป็นตัวแปรที่ render ไปยัง provider และ assert เป็นรายการตัวตรวจ ส่วน YAML anchor ใช้ซ้ำเฉพาะ assertion ของกรณีที่มีสัญญาเดียวกัน",
        "เปลี่ยนเฉพาะคำสั่ง Promptfoo baseline ใน Day 131 คง pytest, Triad gate, ชื่อ job และการอัปโหลด artifact ที่ใช้ always() การตั้ง threshold หนึ่งร้อยบอกว่าทุกแถวต้องผ่าน ส่วน no-cache ทำให้เห็นผลจากโค้ดปัจจุบัน",
        "หลังเห็นผลเขียว ลองแก้ค่าคาดหวังจากเจ็ดเป็นสามสิบเฉพาะใน YAML แล้วอ่านผลแดง คืนค่าก่อน commit การทดลองนี้แยกได้ว่ากำลังตรวจโค้ดจริงหรือใช้รายงานจากการรันเก่า",
      ],
      analogy: "เหมือนใช้ประตูขึ้นรถเดิมแล้วเพิ่มรายการตรวจตั๋ว เครื่องสแกนเดียวกันยังต้องส่งสถานะผ่านหรือไม่ผ่านให้ระบบที่ประตู",
      bullets: [
        "เก็บ reports/promptfoo.json จาก job ที่รันจริง",
        "คง exit code ของ Promptfoo เป็นผลของขั้น CI",
        "งดแคชเมื่อทดสอบ regression จากโค้ดที่เพิ่งแก้",
      ],
      code: {
        language: "yaml",
        filename: "ขั้นแทนที่ใน CI ของ Day 131",
        code: `# Replace only the Promptfoo baseline step in the Day 131 job.
# Keep its install, Triad gate, required check name, and always() report upload.
- name: Promptfoo quality and security gate
  env:
    PROMPTFOO_PASS_RATE_THRESHOLD: '100'
    PROMPTFOO_DISABLE_TELEMETRY: '1'
    PROMPTFOO_DISABLE_UPDATE: '1'
  run: uv run --locked npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o reports/promptfoo.json`,
      },
      whyTitle: "แยกสัญญาการปล่อยออกจากการอ่านรายงาน",
      whyParagraphs: [
        "รายงานที่อ่านได้ช่วยตรวจสาเหตุ การบล็อก merge ยังขึ้นกับ required check และสิทธิ์ใน branch protection ของ Day 131",
        "เก็บชื่อ job เดิมเพื่อให้ branch protection อ้างอิงงานเดิมหลังเพิ่ม coverage",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge · Contract tests ที่ API boundary",
      body: [
        "TestClient ทำหน้าที่คล้าย integration test ของ route โดยส่ง request ผ่าน middleware และ dependency จริง",
        "ถ้าเคย mock payment gateway ให้นำแนวเดียวกันมา spy engine แล้วทดสอบว่า route ที่ถูกปฏิเสธไม่แตะ downstream",
      ],
      table: [
        ["Fixture ID", "รหัสสถานการณ์ใน test matrix"],
        ["Policy dependency", "แหล่งสิทธิ์และผลประเมินจากเซิร์ฟเวอร์"],
        ["Exit code", "สถานะขั้นตรวจคุณภาพของ CI"],
      ],
    },
    student: {
      title: "First-Year Note · คำตอบและการกระทำเป็นคนละอย่าง",
      body: [
        "ลองทำช่องสองคอลัมน์ คอลัมน์แรกเขียนสิ่งที่ผู้ใช้เห็น คอลัมน์ที่สองเขียนสิ่งที่ระบบทำ",
        "ถ้าเห็นคำว่าปฏิเสธแต่คอลัมน์การกระทำเป็นหนึ่ง ยังถือว่าเงื่อนไขการหยุดก่อนเรียก engine ไม่ผ่าน",
      ],
    },
  },
  workedExample: {
    intro: "สร้าง provider และ matrix ในโฟลเดอร์เดียวกับ guarded_api.py คำถามสังเคราะห์และหมายเลขทดสอบถูกกำหนดจาก fixture ในไฟล์ Python",
    steps: [
      {
        title: "1 · วัดผลจากแอปจริงในหน่วยความจำ",
        explain: "บันทึกไฟล์นี้ก่อน การตั้ง blocked จำลองผลก่อนเข้า policy ส่วนการเรียก engine และการปิดบังเป็นพฤติกรรมจากแอป Day 153",
        code: {
          language: "python",
          filename: "test_eval_provider.py",
          code: `from dataclasses import dataclass
import json

from fastapi.testclient import TestClient

from guarded_api import Answer, Gate, MemoryTrace, Query, create_app, fake_engine, server_gate


PHONE = "081-000-0000"
TRACE_FIELDS = {
    "request_id", "status_code", "latency_ms",
    "input_mask_count", "output_mask_count",
}


@dataclass(frozen=True)
class Case:
    question: str
    operation: str = "faq"
    risk: str = "allow"
    canary: bool = False


CASES = {
    "quality-faq": Case("ขอทราบเงื่อนไขคืนสินค้า"),
    "quality-code-switch": Case("Return policy สำหรับคืนสินค้าเป็นอย่างไร"),
    "quality-missing": Case("มีนโยบายรับประกันเครื่องบินไหม"),
    "policy-user-th": Case("คำถามสังเคราะห์ภาษาไทย", risk="blocked"),
    "policy-user-en": Case("Synthetic English question", risk="blocked"),
    "policy-document": Case("เอกสาร fixture ผ่านขั้นจัดกลุ่มความเสี่ยงแล้ว", risk="blocked"),
    "policy-scope": Case("ขอดูสถานะรายการตัวอย่าง", operation="order_status"),
    "privacy-phone": Case("ขอทราบเงื่อนไขคืนสินค้า " + PHONE, canary=True),
}


def measure(case: Case) -> dict:
    trace = MemoryTrace()
    seen = []

    async def engine(query: Query) -> Answer:
        seen.append(query.question)
        if case.canary:
            return Answer(
                status="answered",
                answer=f"คืนสินค้าได้ภายใน 7 วัน ติดต่อ {PHONE}",
                citation="[returns#2]",
            )
        return await fake_engine(query)

    app = create_app(engine, trace)
    app.dependency_overrides[server_gate] = lambda: Gate(risk=case.risk)
    with TestClient(app) as client:
        response = client.post("/query", json={
            "question": case.question,
            "operation": case.operation,
        })

    event, = trace.events
    if set(event) - TRACE_FIELDS:
        raise ValueError("trace_fields_outside_allowlist")
    if event["request_id"] != response.headers.get("X-Request-ID"):
        raise ValueError("trace_link_mismatch")
    if case.canary:
        surfaces = [*seen, response.text, json.dumps(event, ensure_ascii=False)]
        if any(PHONE in surface for surface in surfaces):
            raise ValueError("privacy_canary_visible")

    body = response.json()
    return {
        "http_status": response.status_code,
        "status": body.get("status"),
        "answer": body.get("answer"),
        "citation": body.get("citation"),
        "detail": body.get("detail"),
        "engine_calls": len(seen),
        "input_mask_count": event.get("input_mask_count", 0),
        "output_mask_count": event.get("output_mask_count", 0),
    }


def call_api(prompt: str, _options: dict, _context: dict) -> dict:
    case = CASES.get(prompt.strip())
    if case is None:
        return {"error": "unknown_fixture"}
    try:
        result = measure(case)
    except (KeyError, ValueError):
        # A report on a failed case must also exclude raw response data.
        return {"error": "boundary_contract_failed"}
    if result["http_status"] not in (200, 403):
        return {"error": "unexpected_http_status"}
    return {"output": result}
`,
        },
        output: `quality-faq → HTTP 200, answered, engine_calls 1
policy-scope → HTTP 403, policy_block, engine_calls 0`,
      },
      {
        title: "2 · ประกาศ quality และ security assertions",
        explain: "บันทึก YAML ทั้งไฟล์ ตำแหน่งของ anchor อยู่ก่อนจุดอ้างอิงและทุกแถวมี case_id ที่ provider รู้จัก",
        code: {
          language: "yaml",
          filename: "promptfooconfig.yaml",
          code: `description: Thai Knowledge RAG quality and guard decision regression
prompts:
  - "{{case_id}}"
providers:
  - id: file://test_eval_provider.py
    label: baseline-grounded
defaultTest:
  assert:
    - type: is-json
tests:
  - description: Thai returns policy
    vars:
      case_id: quality-faq
    assert: &cited_answer
      - type: javascript
        value: >-
          output.http_status === 200 && output.status === 'answered' &&
          output.citation === '[returns#2]' && output.answer.includes('7 วัน') &&
          output.engine_calls === 1
  - description: Code-switch returns policy
    vars:
      case_id: quality-code-switch
    assert: *cited_answer
  - description: Missing evidence means abstain
    vars:
      case_id: quality-missing
    assert:
      - type: javascript
        value: >-
          output.http_status === 200 && output.status === 'abstained' &&
          output.answer === 'ไม่พบข้อมูล' && output.citation === null
  - description: Preclassified user signal in Thai
    vars:
      case_id: policy-user-th
    assert: &blocked_before_engine
      - type: javascript
        value: >-
          output.http_status === 403 && output.detail === 'policy_block' &&
          output.engine_calls === 0 && output.answer === null && output.citation === null
  - description: Preclassified user signal in English
    vars:
      case_id: policy-user-en
    assert: *blocked_before_engine
  - description: Preclassified document signal
    vars:
      case_id: policy-document
    assert: *blocked_before_engine
  - description: Authenticated actor lacks order scope
    vars:
      case_id: policy-scope
    assert: *blocked_before_engine
  - description: Synthetic phone masked in both directions
    vars:
      case_id: privacy-phone
    assert:
      - type: javascript
        value: >-
          output.http_status === 200 && output.status === 'answered' &&
          output.citation === '[returns#2]' && output.answer.includes('[PHONE]') &&
          output.input_mask_count === 1 && output.output_mask_count === 1 &&
          output.engine_calls === 1
`,
        },
        output: `8 แถว × 1 provider × 1 prompt`,
      },
      {
        title: "3 · รันและแทนขั้นใน CI",
        explain: "ในเครื่องตั้ง PROMPTFOO_PASS_RATE_THRESHOLD เป็น 100 ก่อนรัน จากนั้นใช้ขั้น YAML ใน Concept 3 แทนขั้น baseline เดิม ส่วนคำสั่ง pytest ใช้หลังเติม tests จากแบบฝึก",
        code: {
          language: "bash",
          filename: "terminal",
          code: `uv run --locked pytest -q test_eval_provider.py
uv run --locked npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o reports/promptfoo.json`,
        },
        output: `Promptfoo: 8 passed, 0 failed, 0 errors
reports/promptfoo.json`,
      },
    ],
    gotcha: "ไฟล์รายงานที่เกิดขึ้นไม่ได้บอกว่า assertion ผ่าน ให้ดูสถานะขั้น eval และค่าผลรายแถวใน artifact คู่กัน",
  },
  practice: {
    intro: "เติม pytest ให้ provider รับประกันคุณภาพและการปิดบัง แล้วพิสูจน์ว่า gate ตกจริงเมื่อ expectation เปลี่ยน",
    requirements: [
      "ตรวจ FAQ สองภาษาและกรณีไม่มีหลักฐานจาก public response",
      "ตรวจ HTTP status, policy detail และจำนวน engine calls ของทุกกรณีบล็อก",
      "จำลอง redaction ที่คืนข้อความเดิม แล้วตรวจว่ารายงาน error คงที่และไม่มีค่า canary",
      "รัน YAML แบบเขียวหนึ่งรอบและแบบตั้งจำนวนวันผิดหนึ่งรอบ เก็บ summary และ exit status ของทั้งคู่",
    ],
    starter: {
      language: "python",
      filename: "ท้าย test_eval_provider.py",
      code: `import pytest


@pytest.mark.parametrize("case_id", ["policy-user-th", "policy-user-en", "policy-document", "policy-scope"])
def test_disallowed_cases_never_reach_engine(case_id):
    output = call_api(case_id, {}, {})["output"]
    # TODO: assert HTTP status, policy detail, engine calls, and empty answer fields.
    raise NotImplementedError


def test_redaction_regression_has_safe_error(monkeypatch):
    # TODO: patch the app factory to inject an identity redactor.
    # TODO: compare the entire result to the constant error response.
    raise NotImplementedError
`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: `uv run --locked pytest -q test_eval_provider.py
uv run --locked npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o reports/promptfoo.json
# Change '7 วัน' in the shared quality assertion to '30 วัน'.
uv run --locked npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o reports/promptfoo-red.json
# Restore '7 วัน' after recording the exit status.
`,
    },
    selfCheck: [
      "ผล pytest เห็นสี่กรณี enforcement และกรณี redactor เสีย",
      "suite ที่ถูกต้องมีแปดแถวเขียว เมื่อแก้ expectation สองแถว FAQ ต้องตก",
      "รายงานความล้มเหลวไม่มี phone canary",
    ],
    acceptance: "pytest ผ่านครบ 10 เคส และ eval ให้ exit status เป็นศูนย์สำหรับ config เดิมและไม่เป็นศูนย์เมื่อแก้ค่าคาดหวัง",
    hints: [
      {
        body: "เริ่มจากสิ่งที่ระบบส่งกลับและสิ่งที่ engine ทำจริง แล้วค่อยเปรียบเทียบกับสัญญา",
      },
      {
        body: "ใช้ pytest monkeypatch เปลี่ยนตัวประกอบแอปใน scope ของ test เดียว และส่ง redactor ทางพารามิเตอร์ mask",
      },
      {
        body: "แทนที่ test_eval_provider.py ด้วยไฟล์สมบูรณ์ด้านล่าง แล้วใช้ promptfooconfig.yaml จาก worked example ร่วมกับ guarded_api.py จาก Day 153",
        code: {
          language: "python",
          filename: "test_eval_provider.py",
          code: `from dataclasses import dataclass
import json

import pytest
from fastapi.testclient import TestClient

from guarded_api import Answer, Gate, MemoryTrace, Query, create_app, fake_engine, server_gate


PHONE = "081-000-0000"
TRACE_FIELDS = {
    "request_id", "status_code", "latency_ms",
    "input_mask_count", "output_mask_count",
}


@dataclass(frozen=True)
class Case:
    question: str
    operation: str = "faq"
    risk: str = "allow"
    canary: bool = False


CASES = {
    "quality-faq": Case("ขอทราบเงื่อนไขคืนสินค้า"),
    "quality-code-switch": Case("Return policy สำหรับคืนสินค้าเป็นอย่างไร"),
    "quality-missing": Case("มีนโยบายรับประกันเครื่องบินไหม"),
    "policy-user-th": Case("คำถามสังเคราะห์ภาษาไทย", risk="blocked"),
    "policy-user-en": Case("Synthetic English question", risk="blocked"),
    "policy-document": Case("เอกสาร fixture ผ่านขั้นจัดกลุ่มความเสี่ยงแล้ว", risk="blocked"),
    "policy-scope": Case("ขอดูสถานะรายการตัวอย่าง", operation="order_status"),
    "privacy-phone": Case("ขอทราบเงื่อนไขคืนสินค้า " + PHONE, canary=True),
}


def measure(case: Case) -> dict:
    trace = MemoryTrace()
    seen = []

    async def engine(query: Query) -> Answer:
        seen.append(query.question)
        if case.canary:
            return Answer(
                status="answered",
                answer=f"คืนสินค้าได้ภายใน 7 วัน ติดต่อ {PHONE}",
                citation="[returns#2]",
            )
        return await fake_engine(query)

    app = create_app(engine, trace)
    app.dependency_overrides[server_gate] = lambda: Gate(risk=case.risk)
    with TestClient(app) as client:
        response = client.post("/query", json={
            "question": case.question,
            "operation": case.operation,
        })

    event, = trace.events
    if set(event) - TRACE_FIELDS:
        raise ValueError("trace_fields_outside_allowlist")
    if event["request_id"] != response.headers.get("X-Request-ID"):
        raise ValueError("trace_link_mismatch")
    if case.canary:
        surfaces = [*seen, response.text, json.dumps(event, ensure_ascii=False)]
        if any(PHONE in surface for surface in surfaces):
            raise ValueError("privacy_canary_visible")

    body = response.json()
    return {
        "http_status": response.status_code,
        "status": body.get("status"),
        "answer": body.get("answer"),
        "citation": body.get("citation"),
        "detail": body.get("detail"),
        "engine_calls": len(seen),
        "input_mask_count": event.get("input_mask_count", 0),
        "output_mask_count": event.get("output_mask_count", 0),
    }


def call_api(prompt: str, _options: dict, _context: dict) -> dict:
    case = CASES.get(prompt.strip())
    if case is None:
        return {"error": "unknown_fixture"}
    try:
        result = measure(case)
    except (KeyError, ValueError):
        # A report on a failed case must also exclude raw response data.
        return {"error": "boundary_contract_failed"}
    if result["http_status"] not in (200, 403):
        return {"error": "unexpected_http_status"}
    return {"output": result}


@pytest.mark.parametrize("case_id", [
    "quality-faq",
    "quality-code-switch",
])
def test_quality_answer_has_expected_evidence(case_id):
    output = call_api(case_id, {}, {})["output"]
    assert output["http_status"] == 200
    assert output["status"] == "answered"
    assert "7 วัน" in output["answer"]
    assert output["citation"] == "[returns#2]"
    assert output["engine_calls"] == 1


def test_missing_answer_abstains():
    output = call_api("quality-missing", {}, {})["output"]
    assert output["http_status"] == 200
    assert output["status"] == "abstained"
    assert output["answer"] == "ไม่พบข้อมูล"
    assert output["citation"] is None


@pytest.mark.parametrize("case_id", [
    "policy-user-th",
    "policy-user-en",
    "policy-document",
    "policy-scope",
])
def test_disallowed_cases_never_reach_engine(case_id):
    output = call_api(case_id, {}, {})["output"]
    assert output["http_status"] == 403
    assert output["detail"] == "policy_block"
    assert output["engine_calls"] == 0
    assert all(output[field] is None for field in ("status", "answer", "citation"))


def test_privacy_canary_is_masked_at_both_boundaries():
    output = call_api("privacy-phone", {}, {})["output"]
    assert output["status"] == "answered"
    assert output["citation"] == "[returns#2]"
    assert "[PHONE]" in output["answer"]
    assert PHONE not in json.dumps(output)
    assert output["input_mask_count"] == output["output_mask_count"] == 1


def test_redaction_regression_fails_without_echoing_canary(monkeypatch):
    real_app = create_app

    def app_with_broken_redaction(engine, trace):
        return real_app(engine, trace, mask=lambda text: (text, 0))

    monkeypatch.setitem(measure.__globals__, "create_app", app_with_broken_redaction)
    assert call_api("privacy-phone", {}, {}) == {"error": "boundary_contract_failed"}


def test_unknown_fixture_fails():
    assert call_api("unknown", {}, {}) == {"error": "unknown_fixture"}
`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run --locked pytest -q test_eval_provider.py
uv run --locked npx --no-install promptfoo eval -c promptfooconfig.yaml --no-cache -o reports/promptfoo.json`,
    },
  },
  mistakes: [
    {
      title: "ส่งสัญญาณ risk ผ่าน JSON ของ API",
      symptom: "แอปตอบ 422 และไม่ถึงเงื่อนไขที่อยากทดสอบ",
      fix: "ฉีดภายใน test app โดย override server_gate และรักษา schema ของ POST /query",
    },
    {
      title: "เช็กว่า HTTP 403 อย่างเดียว",
      symptom: "ระบบอาจตอบปฏิเสธหลังเรียก engine",
      fix: "นับ downstream calls จาก spy และกำหนดค่าที่คาดเป็นศูนย์",
    },
    {
      title: "ใช้ค่าเปอร์เซ็นต์ต่ำกว่าหนึ่งร้อยใน CI",
      symptom: "คำตอบส่วนใหญ่ผ่านแต่เคส privacy พลาดแล้ว job ยังเขียว",
      fix: "ตั้ง threshold เท่ากับหนึ่งร้อยสำหรับชุดนี้และทดสอบ config ที่ผิดหนึ่งครั้ง",
    },
    {
      title: "แนบ response ดิบเมื่อพบ canary",
      symptom: "artifact เก็บค่าที่ตัวกรองพลาดเอง",
      fix: "ตรวจที่ provider แล้วคืน error คงที่โดยไม่ใส่ข้อความ raw ในรายงาน",
    },
  ],
  quiz: {
    questions: [
      mc(
        "d154-q1",
        "ที่ใดควรเก็บผลคาดหวังว่า FAQ ต้องอ้าง returns ตอนที่สอง?",
        [
          ["ใน assertion ของ YAML", "ถูก เพราะเกณฑ์ยังต้องอยู่เมื่อเปลี่ยน provider"],
          ["ใน output ของ engine", "เป็นค่าที่วัด ไม่ใช่เกณฑ์"],
          ["ในชื่อ branch", "ไม่มีตัวตรวจค่านั้น"],
          ["ในค่าเฉลี่ยของเวลา", "วัดคนละเรื่อง"],
        ],
        "A",
        "วางผลที่คาดในชุดทดสอบและอ่านผลจริงจาก provider เพื่อจับการเปลี่ยนพฤติกรรม",
        "YAML assert ทำหน้าที่อะไร?",
        "เทียบข้อมูลที่สังเกตกับข้อตกลงรายเคส",
      ),
      mc(
        "d154-q2",
        "case ได้ 403 แต่ engine_calls เท่ากับ 1 ควรสรุปอย่างไร?",
        [
          ["ผ่านเพราะ HTTP ถูก", "ยังมีการเรียก downstream"],
          ["ตกเพราะการหยุดเกิดช้า", "ถูก เพราะสัญญาระบุ zero calls"],
          ["เพิ่ม cache", "ไม่ได้แก้ขอบเขตสิทธิ์"],
          ["ข้ามกรณีนี้", "จะซ่อน regression"],
        ],
        "B",
        "ต้องบล็อกก่อนส่งคำขอต่อเพื่อรักษาขอบเขตและลด side effect",
        "ผลอะไรต้องคู่กับ 403?",
        "รหัส policy คงที่และ downstream calls เป็นศูนย์",
      ),
      mc(
        "d154-q3",
        "ถ้า fake ส่งสัญญาณ blocked มาแล้วและชุดผ่าน หลักฐานบอกอะไร?",
        [
          ["ตรวจจับทุกภาษาแม่น", "คลาสความเสี่ยงถูกฉีดสำเร็จแล้ว"],
          ["โมเดลจริงปลอดภัยทุกเคส", "suite ใช้ engine จำลอง"],
          ["แอปบังคับใช้นโยบายเมื่อได้รับผล blocked", "ถูก การตัดสินที่ขอบเขตของแอปถูกตรวจ"],
          ["ลบ trace ได้", "ยังต้องใช้ trace ตรวจขอบเขต"],
        ],
        "C",
        "ทดสอบการบังคับหลังตัดสินได้ชัด แต่ต้องประเมินตัวตรวจแยกตามขอบเขตของมัน",
        "fake blocked พิสูจน์อะไร?",
        "พิสูจน์การบังคับใช้นโยบายหลังได้รับผลตัดสิน",
      ),
      mc(
        "d154-q4",
        "ควรเก็บ JSON อย่างไรเมื่อ Promptfoo ทำให้ job ตก?",
        [
          ["ปิด exit code", "ทำให้ gate แดงไม่จริง"],
          ["รันเฉพาะกรณีที่ผ่าน", "รายงานจะไม่ตรงกับเหตุ"],
          ["ลบผลก่อนอัปโหลด", "คนแกะอ่านหลักฐานไม่ได้"],
          ["คง exit code และ upload ด้วย always()", "ถูก ใช้ผลหยุด merge และยังอ่านรายงานได้"],
        ],
        "D",
        "การอัปโหลดเป็นขั้นถัดไปที่ทำได้แม้ eval ล้ม โดยยังรักษาสถานะของ required check",
        "เก็บ artifact ตอน gate ตกได้อย่างไร?",
        "ใช้ always() ที่ขั้นอัปโหลดโดยปล่อยให้ eval คืน exit code ตามจริง",
      ),
    ],
  },
  takeaways: [
    "quality และ guard behavior ต้องผ่านเป็นรายเคสในชุดเดียว",
    "ข้อมูลในรายงานต้องผ่านขอบเขต privacy เช่นเดียวกับ response",
    "ใช้ผล gate ของ Day 131 คู่กับรายละเอียดใน artifact เพื่อหาจุดเสีย",
    "Day 155 จะนำสถานะ error และ policy signal ที่วัดได้ไปออกแบบวิธีรับมือ",
  ],
  reviewCards: [
    rc(
      "d154-r1",
      "ทำไมใช้ TestClient ใน Python provider?",
      "ให้วัด middleware, validation และ policy ของ API โดยไม่เปิด network service",
    ),
    rc(
      "d154-r2",
      "เมื่อเคส blocked ผ่าน ควรเห็นอะไร?",
      "HTTP 403, policy_block และ engine calls ศูนย์",
    ),
    rc(
      "d154-r3",
      "canary ต้องตรวจที่ไหน?",
      "provider input, API response และ trace metadata ก่อนประกอบรายงาน",
    ),
    rc(
      "d154-r4",
      "เงื่อนไขไหนทำให้ CI ตก?",
      "Promptfoo คืน nonzero เมื่อเคสใต้ required gate ไม่ผ่านหรือเกิดข้อผิดพลาด",
    ),
  ],
  sources: [
    {
      label: "Promptfoo · Python provider",
      href: "https://www.promptfoo.dev/docs/providers/python/",
    },
    {
      label: "Promptfoo · Assertions and metrics",
      href: "https://www.promptfoo.dev/docs/configuration/expected-outputs/",
    },
    {
      label: "Promptfoo · GitHub Actions integration",
      href: "https://www.promptfoo.dev/docs/integrations/ci-cd/",
    },
  ],
  glossary: ["promptfoo", "pytest", "fastapi", "guardrails", "abstention", "fixture", "pdpa", "langfuse"],
});
