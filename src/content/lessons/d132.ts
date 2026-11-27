import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const mutatePrompt = `import argparse
from pathlib import Path


GOOD = "เมื่อไม่มีหลักฐาน ให้ตอบว่าไม่พบข้อมูล"
BAD = "เมื่อไม่มีหลักฐาน ให้ลองตอบจากความจำ"


def change_prompt(path: Path, stage: str) -> None:
    before, after = (GOOD, BAD) if stage == "break" else (BAD, GOOD)
    # Preserve the file's line endings and the rest of the prompt.
    raw = path.read_bytes()
    lines = raw.splitlines(keepends=True)
    old = before.encode("utf-8")
    new = after.encode("utf-8")

    matches = [i for i, line in enumerate(lines) if line.rstrip(b"\\r\\n") == old]
    if len(matches) != 1:
        raise ValueError(f"expected one policy line for stage {stage}")
    if any(line.rstrip(b"\\r\\n") == new for line in lines):
        raise ValueError("replacement policy already exists")

    index = matches[0]
    lines[index] = new + lines[index][len(old):]
    path.write_bytes(b"".join(lines))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=("break", "fix"))
    args = parser.parse_args()
    change_prompt(Path("rag_prompt.txt"), args.stage)
    print(f"prompt stage: {args.stage}")
`;

const readReport = `import argparse
import json
from pathlib import Path


BASELINE = "baseline-grounded"
SUPPORTED = {
    "return-window": {
        "status": "answered",
        "answer": "คืนสินค้าได้ภายใน 7 วัน",
        "citations": ["[returns#window]"],
    },
    "warranty-screen": {
        "status": "answered",
        "answer": "ประกันไม่ครอบคลุมจอแตกจากการตกหล่น",
        "citations": ["[warranty#damage]"],
    },
}
UNKNOWN = ("member-discount-unknown", "return-shipping-unknown")
ABSTAIN = {"status": "abstained", "answer": "ไม่พบข้อมูล", "citations": []}
GUESS = {"status": "answered", "answer": "เปลี่ยนฟรีทุกกรณี", "citations": []}


def read_results(path: Path) -> dict:
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = payload["results"]["results"]
    indexed = {}

    for row in rows:
        case_id = row["testCase"]["description"]
        if row["provider"]["label"] != BASELINE:
            raise ValueError(f"unexpected provider for {case_id}")
        if case_id in indexed:
            raise ValueError(f"duplicate case: {case_id}")
        indexed[case_id] = row

    expected_ids = set(SUPPORTED) | set(UNKNOWN)
    if indexed.keys() != expected_ids:
        missing = sorted(expected_ids - indexed.keys())
        extra = sorted(indexed.keys() - expected_ids)
        raise ValueError(f"case mismatch: missing={missing}, extra={extra}")
    return indexed


`;

const verifyStage = `def inspect_stage(path: Path, stage: str) -> list[str]:
    if stage not in {"red", "green"}:
        raise ValueError(f"unknown stage: {stage}")
    rows = read_results(path)
    lines = []

    for case_id in (*SUPPORTED, *UNKNOWN):
        row = rows[case_id]
        should_pass = case_id in SUPPORTED or stage == "green"
        response = row.get("response") or {}
        if response.get("error") or not isinstance(response.get("output"), str):
            raise ValueError(f"provider did not return output for {case_id}")
        if row.get("success") is not should_pass:
            raise ValueError(f"unexpected assertion result for {case_id}")

        expected = SUPPORTED.get(case_id, ABSTAIN if should_pass else GUESS)
        actual = json.loads(response["output"])
        if actual != expected:
            raise ValueError(f"unexpected response for {case_id}")

        result = "PASS" if should_pass else "FAIL"
        lines.append(f'{case_id}: {result} | {actual["status"]}')

    return lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=("red", "green"))
    parser.add_argument("report", type=Path)
    args = parser.parse_args()

    try:
        lines = inspect_stage(args.report, args.stage)
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
        parser.exit(1, f"unexpected report: {exc}\\n")

    print("\\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
`;

const tests = `import json

import pytest

from mutate_prompt import BAD, GOOD, change_prompt
from review_report import ABSTAIN, BASELINE, GUESS, SUPPORTED, UNKNOWN, inspect_stage


def write_report(tmp_path, stage, alter=lambda rows: None):
    expected = {**SUPPORTED}
    expected.update({case_id: ABSTAIN if stage == "green" else GUESS for case_id in UNKNOWN})
    rows = [
        {
            "testCase": {"description": case_id},
            "provider": {"label": BASELINE},
            "success": case_id in SUPPORTED or stage == "green",
            "response": {"output": json.dumps(reply, ensure_ascii=False)},
        }
        for case_id, reply in expected.items()
    ]
    alter(rows)
    path = tmp_path / "promptfoo.json"
    path.write_text(json.dumps({"results": {"results": rows}}), encoding="utf-8")
    return path


def test_mutation_changes_only_policy_line_and_restores_bytes(tmp_path):
    path = tmp_path / "rag_prompt.txt"
    original = f"ตอบคำถามภาษาไทยโดยยึดหลักฐานของร้าน\\r\\n{GOOD}\\r\\nคำถาม: fixture\\r\\n"
    path.write_bytes(original.encode("utf-8"))

    change_prompt(path, "break")
    assert path.read_bytes() == original.replace(GOOD, BAD).encode("utf-8")

    change_prompt(path, "fix")
    assert path.read_bytes() == original.encode("utf-8")


@pytest.mark.parametrize("content", ["คำถามเท่านั้น", f"{GOOD}\\n{GOOD}\\n"])
def test_mutation_rejects_ambiguous_or_missing_policy(tmp_path, content):
    path = tmp_path / "rag_prompt.txt"
    path.write_text(content, encoding="utf-8")
    original = path.read_bytes()
    with pytest.raises(ValueError, match="expected one policy line"):
        change_prompt(path, "break")
    assert path.read_bytes() == original


def test_red_only_flags_both_unknown_cases(tmp_path):
    path = write_report(tmp_path, "red")
    assert inspect_stage(path, "red") == [
        "return-window: PASS | answered",
        "warranty-screen: PASS | answered",
        "member-discount-unknown: FAIL | answered",
        "return-shipping-unknown: FAIL | answered",
    ]


def test_green_passes_with_abstention_for_both_unknown_cases(tmp_path):
    path = write_report(tmp_path, "green")
    assert inspect_stage(path, "green")[-2:] == [
        "member-discount-unknown: PASS | abstained",
        "return-shipping-unknown: PASS | abstained",
    ]


def test_green_report_does_not_count_as_red_evidence(tmp_path):
    path = write_report(tmp_path, "green")
    with pytest.raises(ValueError, match="unexpected assertion result"):
        inspect_stage(path, "red")


def test_missing_case_is_rejected(tmp_path):
    path = write_report(tmp_path, "red", lambda rows: rows.pop())
    with pytest.raises(ValueError, match="case mismatch"):
        inspect_stage(path, "red")


def test_duplicate_case_is_rejected(tmp_path):
    path = write_report(tmp_path, "red", lambda rows: rows.append(rows[0]))
    with pytest.raises(ValueError, match="duplicate case"):
        inspect_stage(path, "red")


def test_other_provider_is_rejected(tmp_path):
    def alter(rows):
        rows[0]["provider"]["label"] = "candidate-eager"

    path = write_report(tmp_path, "red", alter)
    with pytest.raises(ValueError, match="unexpected provider"):
        inspect_stage(path, "red")


def test_provider_error_does_not_count_as_caught_regression(tmp_path):
    def alter(rows):
        rows[-1]["response"] = {"error": "fixture or environment error"}

    path = write_report(tmp_path, "red", alter)
    with pytest.raises(ValueError, match="provider did not return output"):
        inspect_stage(path, "red")


def test_green_requires_citations_even_if_report_claims_pass(tmp_path):
    def alter(rows):
        reply = {**SUPPORTED["return-window"], "citations": []}
        rows[0]["response"]["output"] = json.dumps(reply)

    path = write_report(tmp_path, "green", alter)
    with pytest.raises(ValueError, match="unexpected response"):
        inspect_stage(path, "green")
`;

const baselineEval = "uv run --locked npx --no-install promptfoo eval -c promptfooconfig.yaml --filter-providers '^baseline-grounded$' --no-cache";
const triadEval = "uv run --locked python triad_ci.py triad_fixture.json --report";

export const d132: Lesson = defineLesson({
  day: 132,
  titleTh: "ทบทวน B33 · ทำ Prompt พังแล้วให้ CI Eval Gate จับให้ได้",
  tagline: "30 นาที · ทำให้ด่านแดงจากพฤติกรรมจริง ซ่อม prompt แล้วพิสูจน์ว่ากลับมาเขียว",
  icon: "test-tubes",
  visual: {
    id: "ci-eval-gate",
    title: "CI Eval Gate · จาก PR ไปถึงรายงานรายเคส",
    caption: "ไล่จาก deterministic checks ไปถึง Promptfoo แล้วหาว่าด่านใดเห็นผลของ prompt ที่เพิ่งเปลี่ยน",
    alt: "ลำดับด่านตรวจบน pull request และเส้นทางไปยังรายงานเมื่อการตรวจล้มเหลว",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ไฟล์คะแนนจำลองและ Python fake ของ D130 ตรวจครบในเครื่องได้ ส่วน GitHub Actions ใช้ repo แล็บเมื่อต้องการดู check บน pull request",
  tools: ["Promptfoo", "GitHub Actions", "Python 3.12", "uv", "pytest"],
  bigPicture: [
    {
      node: 1,
      heading: "ตรึงหลักฐานและเงื่อนไขของแต่ละเคส",
      body: "นำ {{golden-dataset}} ขนาดเล็กจาก D130 มาใช้ทั้งสี่แถว คืนสินค้าเจ็ดวัน ประกันจอแตก ส่วนลดสมาชิก และค่าส่งคืนสินค้า",
      lessonNote: "สองแถวแรกมีข้อความหลักฐานและ citation ส่วนสองแถวหลังมีค่าทั้งคู่เป็นสตริงว่างเพื่อทดสอบ {{abstention}}",
    },
    {
      node: 2,
      heading: "เปลี่ยนคำสั่งของ prompt เพียงบรรทัดเดียว",
      body: "ให้ fake grounded พบคำสั่งที่ชวนตอบจากความจำแทนกติกาไม่พบข้อมูล ดู diff โดยใช้หลัก {{prompt-versioning}} จาก D91",
      lessonNote: "ตรึง provider, fixture และ assertions จึงตามได้ว่าคำตอบเดาของสองเคสเกิดจากการเปลี่ยนคำสั่งตรงไหน",
    },
    {
      node: 3,
      heading: "ดูด่านที่อ่านคำตอบจาก prompt จริง",
      body: "D129 ให้กรอบ {{ragas}} สำหรับวินิจฉัย ส่วน {{promptfoo}} ของ D130 ตรวจคำตอบข้ามเคส และ D131 ส่ง exit code จากด่านไปที่ runner",
      lessonNote: "คะแนน Triad แบบ mock ผ่านได้ทั้งสองรอบ ขณะที่ Promptfoo อ่านไฟล์ prompt จาก checkout ปัจจุบันและจับ regression ได้",
    },
    {
      node: 6,
      heading: "ซ่อมและเก็บหลักฐานจากสองรอบ",
      body: "คืนบรรทัด abstention แล้วรัน checks เดิม จด commit, case ID, ผลจริง และผลที่คาดใน Error Log",
      lessonNote: "B34 (D133) จะต่อยอดด้วย {{otel}} และ `structlog` เพื่อเดินตามคำขอจริงผ่าน root span `rag.answer` ไปยัง `rag.retrieve` และ `chat` พร้อมจำนวน token ในบริการที่ deploy แล้ว",
    },
  ],
  objectives: [
    "ทวนความต่างระหว่างคะแนน RAG Triad, assertion รายเคส และสถานะของ CI job โดยอ้างตัวอย่างเดียวกัน",
    "ทำการทดลอง **red → fix → green** ด้วย prompt, provider และชุดเทสต์จาก D130–D131 พร้อมเก็บ exit code และรายงาน",
    "อ่านผลรายเคสเพื่อแยกพฤติกรรมที่ผิดจาก provider error และระบุสิ่งที่ต้องวัดเพิ่มด้วย trace ใน B34",
  ],
  prerequisites: [
    "D124 มีโครง Thai Knowledge RAG/Agent และรู้เส้นทางถามตอบในบริการจากเฟส 4",
    "D129 แยก Faithfulness, Context Recall และ Context Precision ได้",
    "D130 ใช้เฉลยที่เพิ่ม return-shipping-unknown แล้ว ให้ baseline ผ่านครบสี่แถว",
    "D131 มี triad_ci.py, triad_fixture.json, tests, lockfiles และ workflow ที่รันกับ repo แล็บได้",
  ],

  setup: {
    intro: "เปิด root ของ thai-rag-eval จาก D131 ใน Bash หรือ Git Bash เริ่มจาก prompt ที่ผ่านชุดตรวจ เก็บรายงานแต่ละรอบใน reports และใช้ branch ทดลองสำหรับการเปิด PR",
    commands: `uv sync --locked
npm ci
mkdir -p reports
uv run --locked pytest -q
git status --short`,
    steps: [
      ["fixture", "เช็กว่า config มี return-window, warranty-screen, member-discount-unknown และ return-shipping-unknown"],
      ["workflow", "ถ้าจะทดลองผ่าน GitHub ให้ repo แล็บมี workflow ของ D131 และ base branch main ตาม trigger"],
      ["prompt", "บันทึก prompt ที่ผ่านเป็น commit ตั้งต้น แล้วสร้าง branch ทดลองก่อนแก้หนึ่งบรรทัด"],
    ],
    note: "ในขั้น worked example ใช้ไฟล์จาก Concept 1 และ 2 หากใช้ PowerShell ให้เปลี่ยน npx เป็น npx.cmd และอ่านรหัสออกจาก $LASTEXITCODE ทันทีหลังคำสั่ง",
  },

  concepts: [
    {
      id: "prompt-mutation",
      title: "1 · เปลี่ยนคำสั่งทีละบรรทัดในแล็บ",
      paragraphs: [
        "D130 ใช้ prompt เดียวเปรียบเทียบ baseline-grounded กับ candidate-eager วันนี้ตรึง baseline-grounded แล้วเปลี่ยน prompt เพียงบรรทัดเดียวเพื่อแยกสาเหตุ",
        "ใน fake ของ D130 เคสที่มีหลักฐานคืนข้อความและ citation ตรง ๆ เคสไร้หลักฐานจะงดตอบเมื่อพบบรรทัดคำสั่งเดิมก่อนหัวข้อคำถาม ถ้าลบบรรทัดนั้นหรือแทนด้วยคำสั่งใหม่ fake จะเดินเข้าทางตอบเดา",
        "โค้ดด้านล่างแทนบรรทัดเต็มหนึ่งครั้ง รักษาตัวคั่นบรรทัดเดิม แล้วแทนกลับด้วยคำสั่ง fix ก่อนทวนผล ใส่ไว้ในแล็บข้างไฟล์เดิม",
      ],
      analogy: "เหมือนสลับ feature flag ตัวเดียวแล้วรัน checkout test กับตะกร้าและ assertion เดิม",
      code: { language: "python", filename: "mutate_prompt.py", code: mutatePrompt },
      whyTitle: "อ่าน diff เพื่อยืนยันสิ่งที่เปลี่ยน",
      whyParagraphs: [
        "ดู git diff ก่อนรัน gate ถ้าไฟล์ fixtures หรือ provider เปลี่ยนไปด้วย ผลแดงจะอธิบายจาก prompt อย่างเดียวไม่ได้ เก็บรายงานแยกรอบและใช้คำสั่งที่ปิด cache",
        "พฤติกรรมของ fake ทำตามกติกาที่เขียนใน Python การเดาซ้ำได้ในแล็บช่วยพิสูจน์สายงานประเมิน ส่วนการทดสอบ prompt บนโมเดลจริงใช้ชุด regression ที่เป็นตัวแทนงานจริงเพิ่มเติม",
      ],
    },
    {
      id: "per-case-evidence",
      title: "2 · ใช้รายงานรายเคสยืนยันความหมายของสีแดง",
      paragraphs: [
        "กลับไปที่ D129 ถ้าหลักฐานที่ควรอยู่ในคลังไม่ถูกเรียกมา ให้ตรวจ Context Recall ถ้าชิ้นที่เกี่ยวข้องอยู่ท้ายลำดับ ให้ตรวจ Context Precision ถ้าคำตอบอ้างเกินหลักฐาน ให้ตรวจ Faithfulness",
        "ในแล็บวันนี้สองเคสนอกขอบเขตไม่มีหลักฐานตาม fixture ตั้งแต่ต้น อาการ regression คือ fake ตอบทั้งที่ควรงด ไม่ต้องจูน retrieval เพื่อพยายามหาเอกสารที่ fixture กำหนดว่าไม่มี",
        "อ่าน report JSON ของ Promptfoo จาก results.results จับคู่ testCase.description กับ provider.label แล้วดู success, response และเหตุผลของ assertion แยกจากรหัสออกของคำสั่ง",
      ],
      analogy: "เหมือนอ่านผลตรวจหน้า checkout จากทั้งชื่อ test และ response body เพื่อให้รู้ว่าแดงเพราะยอดผิดหรือเพราะหน้าโหลดไม่ได้",
      code: {
        language: "python",
        filename: "peek_report.py",
        code: `import json
import sys
from pathlib import Path


report = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
for row in report["results"]["results"]:
    result = "PASS" if row["success"] else "FAIL"
    case_id = row["testCase"]["description"]
    provider = row["provider"]["label"]
    reason = (row.get("gradingResult") or {}).get("reason", "")
    print(f"{case_id} | {provider} | {result} | {reason}")`,
      },
      whyTitle: "ความผิดพลาดที่เราตั้งใจให้เกิดต้องมี output ให้ตรวจ",
      whyParagraphs: [
        "ถ้า provider error ให้แก้การตั้งค่าหรือ fixture ก่อน คาดว่ารอบแดงจะเห็นคำตอบผิดเป็น JSON สำหรับส่วนลดและค่าส่ง ขณะที่ข้อคืนสินค้าและประกันยังส่ง citation ตรงเดิม",
        "รอบเขียวต้องผ่านสี่เคสและคำตอบที่ขาดหลักฐานต้องคืน status abstained, answer ไม่พบข้อมูล และ citations ว่างทั้งสองแถว",
      ],
    },
    {
      id: "ci-and-observation",
      title: "3 · แยก check ที่บล็อก PR ออกจากข้อมูลที่ใช้สืบเหตุ",
      paragraphs: [
        "Workflow D131 รัน deterministic tests ก่อน แล้วอ่านคะแนน mock ของ Triad และจึงรัน Promptfoo baseline รอบแดงที่ตั้งใจไว้จะผ่านสองขั้นแรกและหยุดที่ขั้นสุดท้าย",
        "Promptfoo คืน exit 100 เมื่อชุดนี้มี assertion ตก Runner จึงบันทึก job เป็น failure ขั้น upload ใช้ always() เพื่อยังเก็บรายงานได้ ถ้าสาขาตั้งให้ Thai RAG eval gate เป็น required check ผลแดงจะบล็อก merge",
        "หลัง deploy gate อธิบายเฉพาะการรันกับ fixtures ที่เลือก สำหรับคำขอจริง B34 (D133) จะใช้ {{otel}} เก็บ trace ID ที่เชื่อมกับ `structlog` และแยก child spans อย่าง `rag.retrieve` กับ `chat` เพื่อดูจำนวนเอกสารที่ค้นคืน ระยะเวลา และ token usage ภายใต้ขอบเขตข้อมูลที่ทีมอนุญาต",
      ],
      analogy: "รายงาน eval เหมือนใบตรวจตอนส่งงาน ส่วน trace เหมือนลำดับเหตุการณ์ที่เปิดดูได้เมื่อผู้ใช้แจ้งปัญหาจากการใช้งานจริง",
      code: {
        language: "bash",
        filename: "terminal",
        code: `status=0
${baselineEval} -o reports/promptfoo.json || status=$?
printf 'Promptfoo exit %s\\n' "$status"
test "$status" -eq 0`,
      },
      whyTitle: "จดผลของ run ให้ผูกกับ commit ที่ถูกต้อง",
      whyParagraphs: [
        "บน GitHub เปิด job ของ commit ล่าสุดแล้วอ่านชื่อ step ที่แดง ต่อด้วย artifact ของ run เดียวกัน ถ้ารันใหม่หลัง push อย่าใช้ artifact ของรอบก่อนเป็นหลักฐานว่ารอบใหม่ผ่าน",
        "คำสั่งด้านบนเหมาะสำหรับตรวจว่ารอบปกติต้องผ่าน ในบททดลองใช้การตรวจ exit 100 เฉพาะคำสั่ง local รอบแดง Workflow D131 ส่ง exit จาก Promptfoo ตรงไปที่ runner",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · เหมือนทดสอบ policy ของ API ที่ทุก client ใช้ร่วมกัน",
      body: [
        "ถ้า endpoint คืน status 200 และ JSON ถูก schema แต่คิดค่าส่งผิด ลูกค้าก็ยังเสียประโยชน์ ใน RAG ให้ตรวจ response shape และเงื่อนไขธุรกิจระดับเคสเหมือนกัน",
        "ใช้ commit และชื่อ check ตามหาผลได้เหมือน CI ของเว็บ พอปัญหามาจาก production ให้ตาม request ID เข้า trace เพื่อดูว่าเวลาหายช่วงไหนและขั้นไหนเลือกข้อมูลผิด",
      ],
      table: [
        ["Mutation test ในแล็บ", "ตัดคำสั่งงดตอบหนึ่งบรรทัดแล้วดูว่า suite แดง"],
        ["API contract", "ตรวจ status, answer และ citations ของคำถามที่ไร้หลักฐาน"],
        ["Required check", "ใช้สถานะ Thai RAG eval gate เพื่ออนุญาตให้ merge"],
        ["Distributed trace", "ตามคำขอจริงผ่าน retrieval และ generation ใน B34"],
      ],
    },
    student: {
      title: "First-Year Note · พิสูจน์ว่าข้อสอบตรวจอาการผิดได้",
      body: [
        "ลองแก้คำตอบที่ถูกให้ผิดหนึ่งข้อ แล้วส่งข้อสอบชุดเดิม ถ้าเครื่องตรวจยังให้คะแนนเต็มต้องกลับมาดูเงื่อนไขของเครื่องตรวจ",
        "ในการทดลองนี้เราเห็นทั้งสีแดงและสาเหตุที่เจาะจง คือไม่มีหลักฐานแต่ได้คำตอบว่าเปลี่ยนฟรี จากนั้นคืนกติกาเดิมแล้วดูเครื่องตรวจกับคำตอบชุดใหม่อีกครั้ง",
      ],
    },
  },

  workedExample: {
    intro: "ใช้เฉลยสี่เคสของ D130 และด่านของ D131 ใน repo แล็บเดิม คัดลอก mutate_prompt.py และ peek_report.py จาก Concepts แล้วรันสามขั้นใน Bash",
    steps: [
      {
        title: "1 · เก็บผลก่อนเปลี่ยน prompt",
        explain: "สร้างรายงาน Triad และ Promptfoo แยกกัน กดดูรายชื่อทั้งสี่เคสก่อนเริ่ม ถ้าคำสั่งนี้ fail ให้ใช้รายงานซ่อม baseline ก่อนทำการทดลอง",
        code: {
          language: "bash",
          filename: "terminal",
          code: `mkdir -p reports
uv run --locked pytest -q &&
${triadEval} reports/triad-before.json &&
${baselineEval} -o reports/before.json &&
uv run --locked python peek_report.py reports/before.json`,
        },
        output: `Triad: passed = true
Promptfoo: 4 passed, 0 failed, 0 errors · exit 0
return-window, warranty-screen, member-discount-unknown, return-shipping-unknown: PASS`,
      },
      {
        title: "2 · ทำให้แดงและหาหลักฐานว่าด่านจับถูกอาการ",
        explain: "เปลี่ยนเฉพาะบรรทัดงดตอบแล้วเปิด diff คำสั่ง local บันทึก exit เพื่อยืนยัน 100 สำหรับการทดลอง หากมี repo บน GitHub ให้ commit เฉพาะ prompt ที่แก้บน branch ทดลองและเปิด PR เข้า main ดูขั้น Promptfoo baseline gate ที่แดงแล้วดาวน์โหลด artifact ของ commit นี้",
        code: {
          language: "bash",
          filename: "terminal",
          code: `uv run --locked python mutate_prompt.py break &&
git diff -- rag_prompt.txt &&
uv run --locked pytest -q &&
${triadEval} reports/triad-red.json || exit $?

status=0
${baselineEval} -o reports/red.json || status=$?
printf 'Promptfoo exit %s\\n' "$status"
test "$status" -eq 100 &&
uv run --locked python peek_report.py reports/red.json`,
        },
        output: `Triad: passed = true
Promptfoo: 2 passed, 2 failed, 0 errors · exit 100
return-window: PASS
warranty-screen: PASS
member-discount-unknown: FAIL · got answered with เปลี่ยนฟรีทุกกรณี
return-shipping-unknown: FAIL · got answered with เปลี่ยนฟรีทุกกรณี`,
      },
      {
        title: "3 · ซ่อม prompt แล้วรันชุดเดิมให้กลับเขียว",
        explain: "คืนคำสั่งงดตอบและบันทึกผลใหม่คนละไฟล์ ถ้าทำรอบแดงผ่าน GitHub ให้ push commit ที่ซ่อมไปที่ branch เดิม แล้วเปิด job ของ commit ใหม่พร้อม artifact ถ้าตั้ง required check ให้ดูว่าข้อกำหนดของ check นี้กลับมาผ่าน",
        code: {
          language: "bash",
          filename: "terminal",
          code: `uv run --locked python mutate_prompt.py fix &&
uv run --locked pytest -q &&
${triadEval} reports/triad-green.json &&
${baselineEval} -o reports/green.json &&
uv run --locked python peek_report.py reports/green.json`,
        },
        output: `Triad: passed = true
Promptfoo: 4 passed, 0 failed, 0 errors · exit 0
member-discount-unknown: PASS · abstained
return-shipping-unknown: PASS · abstained`,
      },
    ],
    gotcha: "ตัวอย่างย่อ output ให้เห็นผลสำคัญ ถ้าใช้ PR ให้ดู Check และ artifact ของ commit เดียวกัน อย่าเพิ่ม continue-on-error ให้ step ใน workflow เพื่อทำให้การทดลองดูเขียว",
  },

  practice: {
    intro: "ทำการทดลองซ้ำ แล้วเขียนตัวตรวจหลักฐานจาก reports/red.json และ reports/green.json เพื่อให้เพื่อนร่วมทีมทวนผลได้โดยไม่ต้องอ่านข้อความทั้งไฟล์",
    requirements: [
      "เขียน read_results ให้เลือกเฉพาะรายงานจาก baseline-grounded และตรวจว่ามีครบสี่ case ID แบบไม่ซ้ำ",
      "เขียน inspect_stage ให้ตรวจทั้งสถานะ assertion และอ็อบเจ็กต์ที่ provider ส่งจริง แยก error ที่ไม่มี output ออกจาก regression",
      "รอบแดงต้องตกเฉพาะสองเคสที่ไม่มีหลักฐาน และรอบเขียวต้องผ่านทั้งสี่พร้อม citations ที่ถูกต้อง",
      "บันทึกผลทั้งสองรอบใน Error Log พร้อม exit code ชื่อ step ที่จับได้ และสิ่งที่อยากเห็นใน trace เมื่อเกิดเคสคล้ายกันในระบบจริง",
    ],
    starter: {
      language: "python",
      filename: "review_report.py",
      code: `${readReport.slice(0, readReport.indexOf("def read_results"))}def read_results(path: Path) -> dict:
    # TODO: อ่าน results.results แล้วเช็ก label และ case IDs ทั้งสี่
    raise NotImplementedError


def inspect_stage(path: Path, stage: str) -> list[str]:
    # TODO: เช็ก success และ response.output ตาม stage และ fixture
    raise NotImplementedError


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=("red", "green"))
    parser.add_argument("report", type=Path)
    args = parser.parse_args()
    print("\\n".join(inspect_stage(args.report, args.stage)))`,
    },
    verification: { language: "python", filename: "test_review_report.py", code: tests },
    selfCheck: [
      "ทุก report มาจาก baseline-grounded และมีสี่เคสเดิมครบ",
      "pytest ผ่านทั้งเคสรายงานปกติและกรณีขาด output หรือ case ID",
      "รอบแดงได้ exit 100 จาก Promptfoo และรายงานชี้สองเคสที่แต่งคำตอบ รอบเขียวได้ exit 0 และทั้งสองเคสงดตอบ",
      "เก็บ exit code ต้นทางแยกจาก exit ของ review_report.py ซึ่งจะผ่านเมื่อยืนยันหลักฐานของ stage นั้นได้",
    ],
    acceptance: "เทสต์ D132 ผ่าน 11 ข้อ ตัวตรวจอ่านรายงานจริงทั้งสองรอบ และ Error Log อธิบายอาการ ผลจาก gate และสิ่งที่ซ่อมได้",
    hints: [
      {
        body: "คิดเป็นคู่ของผลรันกับผลที่คาดสำหรับแต่ละเคส เช่น คำถามส่วนลดในรอบแดงต้องได้ JSON ที่ตอบผิดจริงและ assertion ต้องตก",
      },
      {
        body: "สร้าง dict โดยใช้ testCase.description เป็น key ตรวจ label และรายการซ้ำก่อนเขียนลง dict แล้วใช้ json.loads กับ response.output เพื่อเทียบ status, answer, citations",
      },
      {
        body: "เฉลยแยกเป็นสามไฟล์ ให้ใช้ fixture, provider และ workflow จาก D130–D131 แล้วเรียก worked example เพื่อสร้างรายงานทั้งสองรอบก่อนตรวจจริง",
        code: {
          language: "text",
          filename: "d132-solution.txt",
          code: `=== mutate_prompt.py ===
${mutatePrompt}
=== review_report.py ===
${readReport}${verifyStage}
=== test_review_report.py ===
${tests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run --locked pytest -q test_review_report.py
uv run --locked python review_report.py red reports/red.json
uv run --locked python review_report.py green reports/green.json`,
    },
  },

  mistakes: [
    {
      title: "ให้ candidate-eager เข้าด่านเดียวกับ baseline",
      symptom: "รอบก่อนแก้ prompt แดงอยู่แล้วเพราะคอลัมน์ candidate ตั้งใจให้เดา",
      fix: "กรอง provider label ให้ตรง baseline-grounded และตรวจรายงานว่ามีสี่แถวก่อนเริ่ม",
    },
    {
      title: "ใช้ไฟล์ Triad mock ตัดสินว่า prompt ที่เพิ่งแก้ดีขึ้น",
      symptom: "ค่าเฉลี่ยเหมือนเดิมทั้งสองรอบ จึงสรุปว่าคำตอบไม่เปลี่ยน",
      fix: "อ่าน output ของ Promptfoo ซึ่งรัน prompt ปัจจุบัน ส่วนคะแนน mock ใช้ยืนยันตรรกะของด่านที่ประมวลผลไฟล์คะแนน",
    },
    {
      title: "นับ error ใน environment เป็นผลการทดลองแดง",
      symptom: "เห็น exit ที่ไม่ใช่ศูนย์ แต่ไม่มี JSON หรือไม่พบคำตอบของสองเคส",
      fix: "ตรวจ exit 100 พร้อมรายงานที่มี output และมีเฉพาะ assertion ของเคสที่คาดตก",
    },
    {
      title: "แก้ assertion หรือเกณฑ์เพื่อให้รอบหลังเขียว",
      symptom: "ไฟล์ prompt ยังชวนเดา แต่ suite ผ่านหลังลบคำถาม unknown",
      fix: "คืนบรรทัดกติกาใน prompt และรัน suite เดิม แล้วเทียบรายงานคนละไฟล์ของแต่ละรอบ",
    },
  ],

  quiz: {
    intro: "ใช้ 10 นาทีแรกทวนคำถามเหล่านี้ก่อนทำแล็บ จากนั้นใช้ 15 นาทีทดลองและ 5 นาทีเขียน Error Log",
    questions: [
      mc(
        "d132-cause",
        "D129 รายงาน Context Recall สูงและ Precision สูง แต่ Faithfulness ตก ควรเปิดอะไรเป็นหลักฐานแรก",
        [
          ["คำตอบพร้อม retrieved contexts ของเคสที่ตก", "เทียบข้อกล่าวอ้างทีละข้อกับบริบทเพื่อหาส่วนเกิน"],
          ["ค่า timeout ของ uploader", "ค่า timeout เกี่ยวกับการเก็บไฟล์หลังรัน"],
          ["เพิ่ม top_k ทันที", "Recall สูงอยู่แล้ว ควรทำความเข้าใจคำตอบที่ขาดหลักฐานก่อน"],
          ["เปลี่ยนชื่อ status check", "ชื่อ check ไม่เปลี่ยนพฤติกรรม generation"],
        ],
        "A",
        "Faithfulness ถามว่าคำตอบมีหลักฐานใน retrieved contexts หรือไม่ เปิดทั้งคู่ก่อนตัดสินใจแก้ prompt",
        "Recall และ Precision สูง แต่ Faithfulness ตก ควรเปิดข้อมูลอะไร",
        "เปิดคำตอบคู่กับ retrieved contexts แล้วหาคำกล่าวอ้างที่ไม่มีหลักฐาน",
      ),
      mc(
        "d132-red",
        "เมื่อแทนบรรทัดงดตอบใน prompt เดิม ข้อใดเป็นหลักฐานว่าด่านจับ regression ตามที่ตั้งใจ",
        [
          ["ทุกเคสขึ้น ERROR และไม่มี response", "ต้องซ่อมการรันก่อน เพราะยังไม่ได้ตรวจพฤติกรรมคำตอบ"],
          ["Promptfoo exit 100 สองเคสมีหลักฐานผ่านและสองเคส unknown คืนคำตอบเดาแล้วตก", "ตรงกับผลของคำสั่งที่เปลี่ยนและสัญญาที่เทสต์ตรวจ"],
          ["ผ่านหมดแต่ report เขียนไม่สำเร็จ", "เป็นปัญหาเก็บรายงาน ยังไม่ได้เห็น assertion ตก"],
          ["เปลี่ยน threshold Triad แล้วเห็นชื่อ warranty-screen", "เป็นการทดลองขอบเขตของคะแนน mock"],
        ],
        "B",
        "รอบแดงต้องมีคำตอบจริงและ assertion ตกในเคสที่คาด พร้อมรหัสออกจาก CLI ที่บ่งชี้ความล้มเหลว",
        "จะแยก prompt regression ออกจาก provider error อย่างไร",
        "เปิด output รายเคสและตรวจว่า assertion ตกหลัง provider คืนคำตอบ",
      ),
      mc(
        "d132-check",
        "ขั้น upload artifact ผ่านหลัง Promptfoo step ตก การ merge จะถูกบล็อกเมื่อใด",
        [
          ["ทุกครั้งที่มี JSON ถูกอัปโหลด", "artifact เองไม่มีผลตัดสิน merge"],
          ["เมื่อตั้ง concurrency ให้ยกเลิกงานเก่า", "concurrency ควบคุมจำนวนงานที่กำลังรัน"],
          ["เมื่อสาขากำหนดให้ check ของ job นี้ต้องผ่าน", "branch rule ใช้ผล failure ของ job แม้ขั้นอัปโหลดจะสำเร็จ"],
          ["เมื่อ pytest พิมพ์ชื่อเทสต์ครบ", "จำนวนชื่อใน log ไม่ได้กำหนดกฎของ branch"],
        ],
        "C",
        "Status ของ job มาจากผลของ steps ส่วน branch rule ใช้ check นั้นบล็อก merge เมื่อกำหนดให้ต้องผ่าน",
        "เก็บ artifact ได้เมื่อ job แดง แล้วอะไรบล็อก merge",
        "Branch rule ที่กำหนดให้ status check ของ job ต้องผ่าน",
      ),
      mc(
        "d132-trace",
        "รอบ CI เขียวครบ ต่อมาผู้ใช้รายงานว่าคำถามจริงใช้เวลานานมาก ควรดูอะไรใน B34",
        [
          ["เปิด report เดิมแล้วหาค่าพยากรณ์ P95 ของ production", "report เดิมบันทึกการรันในแล็บ"],
          ["ลดเกณฑ์ Faithfulness", "คะแนนความซื่อสัตย์ไม่อธิบายเวลาของแต่ละขั้น"],
          ["ลบเคสที่ตอบช้าออกจาก fixture ทันที", "จะเสียหลักฐานก่อนรู้ต้นเหตุ"],
          ["ตาม trace ของคำขอและเทียบเวลาของ retrieval span กับ generation span", "เห็นว่าคำขอใช้เวลาที่ขั้นไหนและนำไปตรวจต่อได้"],
        ],
        "D",
        "ผล CI ครอบคลุมชุดทดสอบ ส่วน trace ผูกเหตุการณ์และเวลาของคำขอจริงตั้งแต่ต้นจนจบ",
        "ถ้าคำขอจริงช้า เปิดข้อมูลอะไรเพื่อหาขั้นที่ใช้เวลา",
        "เปิด trace แล้วไล่ span ของ retrieval, generation และส่วนอื่นที่เกี่ยวข้อง",
      ),
    ],
  },

  takeaways: [
    "ใช้ RAG Triad ของ D129 วินิจฉัยชั้นที่เสีย แล้วใช้ผลรายเคสจาก D130 ตรวจว่า output ยังตรงสัญญา",
    "Workflow D131 รับ exit code ส่งสถานะที่ PR และเก็บรายงานเพื่อให้ย้อนดูเคสที่ตกได้",
    "หลักฐานการซ่อมคือ prompt diff เล็ก ๆ และผลแดงกับเขียวที่รัน fixture เดิมโดยใช้ baseline ตัวเดียว",
    "B34 จะตามคำขอจริงด้วย OpenTelemetry เพื่อขยาย Thai Knowledge RAG/Agent ไปสู่ Evaluated & Guarded AI Microservice v0.5.0 ใน D156",
  ],
  reviewCards: [
    rc("d132-recap-triad", "Context Recall, Context Precision และ Faithfulness ชี้ไปส่วนใด", "ความครบของการค้น การจัดอันดับ และความซื่อสัตย์ของคำตอบต่อหลักฐานตามลำดับ"),
    rc("d132-recap-mutation", "ทำไมสองเคสที่มีหลักฐานยังผ่านเมื่อเอาคำสั่ง abstention ออก", "fake ของ D130 คืนหลักฐานและ citation ก่อนเข้าทางตัดสินใจเมื่อไม่มีหลักฐาน"),
    rc("d132-recap-evidence", "รอบแดงควรจดอะไรคู่กับ exit code", "ชื่อ commit, check หรือ step, case IDs ที่ตก, actual output และผลที่คาด"),
    rc("d132-recap-otel", "รอบถัดไป trace เพิ่มหลักฐานชนิดใดให้ทีม", "ลำดับเหตุการณ์และเวลาแยกแต่ละ span จากคำขอจริงในระบบที่ทำงานอยู่"),
  ],
  sources: [
    { label: "Promptfoo · Assertions and metrics", href: "https://www.promptfoo.dev/docs/configuration/expected-outputs/" },
    { label: "Promptfoo · Command line", href: "https://www.promptfoo.dev/docs/usage/command-line/" },
    { label: "GitHub Docs · Workflow syntax", href: "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax" },
    { label: "OpenTelemetry · Traces", href: "https://opentelemetry.io/docs/concepts/signals/traces/" },
  ],
  glossary: ["rag", "ragas", "promptfoo", "pytest", "golden-dataset", "prompt-versioning", "abstention", "groundedness", "otel"],
});
