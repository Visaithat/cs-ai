import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/** Day 128 · Phase 5 / Block B32 Review */
const casesCode = String.raw`from argparse import ArgumentParser
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError


Label = Literal["pass", "fail"]


@dataclass(frozen=True)
class AnswerCase:
    case_id: str
    query: str
    evidence: str
    answer: str


REFUND = "[refund#1] แจ้งคืนได้ภายใน 7 วันนับจากวันที่รับสินค้า"
PICKUP = "[pickup#1] จุดรับสินค้าเปิดตามปกติ 10:00–18:00"
SHIPPING = "[shipping#1] จัดส่งมาตรฐานฟรีเมื่อยอดถึง 500 บาท"

CASES = (
    AnswerCase("C01", "คืนของได้กี่วัน เริ่มนับเมื่อไร", REFUND,
               "แจ้งคืนใน 7 วันนับจากวันรับสินค้า [refund#1]"),
    AnswerCase("C02", "Standard shipping ฟรีเมื่อไร", SHIPPING,
               "จัดส่งมาตรฐานฟรีเมื่อยอดตั้งแต่ 500 บาท"),
    AnswerCase("C03", "ต้องแจ้งคืนภายในกี่วัน เริ่มนับจากอะไร", REFUND,
               "7 วันนับจากวันรับของ"),
    AnswerCase("C04", "เปิดรับของช่วงไหนตามปกติ", PICKUP,
               "จุดรับสินค้าเปิด 10:00–18:00 ตามเวลาปกติ"),
    AnswerCase("C05", "ยอด 500 บาทส่งมาตรฐานฟรีไหม", SHIPPING,
               "ฟรีค่ะ ยอด 500 บาทถึงเกณฑ์ส่งมาตรฐานฟรี"),
    AnswerCase("C06", "สงกรานต์จุดรับของเปิดไหม", PICKUP,
               "ไม่พบเวลาเปิดช่วงสงกรานต์ในข้อมูลที่มี"),
    AnswerCase("C07", "Standard shipping ฟรีเมื่อไร", SHIPPING,
               "ส่งมาตรฐานฟรีทุกยอด"),
    AnswerCase("C08", "ต้องแจ้งคืนภายในกี่วัน เริ่มนับจากอะไร", REFUND,
               "แจ้งคืนได้ภายใน 7 วันนับจากวันจ่ายเงิน "
               "แนะนำให้ดูวันที่บนใบเสร็จและติดต่อฝ่ายบริการ [refund#1]"),
    AnswerCase("C09", "สงกรานต์จุดรับของเปิดไหม", PICKUP,
               "เปิดตามเวลาปกติ 10:00–18:00 ในวันสงกรานต์ "
               "คุณจึงไปรับของในช่วงนี้ได้ [pickup#1]"),
    AnswerCase("C10", "คืนของได้กี่วัน เริ่มนับเมื่อไร", REFUND,
               "แจ้งคืนได้ภายใน 14 วันนับจากวันที่รับสินค้า"),
)


class LabelRow(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    case_id: str = Field(pattern=r"^C[0-9]{2}$")
    label: Label


def show_cases(cases: tuple[AnswerCase, ...]) -> None:
    for case in cases:
        print(case.case_id, case.query, case.evidence, case.answer, sep=" | ")


def load_labels(path: Path) -> list[LabelRow]:
    rows = []
    with path.open(encoding="utf-8") as source:
        for number, line in enumerate(source, start=1):
            try:
                rows.append(LabelRow.model_validate_json(line))
            except ValidationError as error:
                raise ValueError(f"{path.name}:{number}: invalid label row") from error
    return rows`;

const reportCode = String.raw`@dataclass(frozen=True)
class Calibration:
    tp: int
    fn: int
    fp: int
    tn: int
    agreement: float
    chance: float
    kappa: float | None
    disagreements: tuple[tuple[str, Label, Label], ...]


def index_labels(rows: list[LabelRow], expected: set[str], side: str) -> dict[str, Label]:
    indexed: dict[str, Label] = {}
    for row in rows:
        if row.case_id in indexed:
            raise ValueError(f"{side}: duplicate ID {row.case_id}")
        indexed[row.case_id] = row.label

    missing = expected - indexed.keys()
    extra = indexed.keys() - expected
    if missing or extra:
        raise ValueError(f"{side}: missing={sorted(missing)} extra={sorted(extra)}")
    return indexed


def calibrate(
    case_ids: tuple[str, ...], human: list[LabelRow], judge: list[LabelRow]
) -> Calibration:
    expected = set(case_ids)
    n = len(case_ids)
    if n == 0 or len(expected) != n:
        raise ValueError("expected nonempty unique case IDs")
    human_by_id = index_labels(human, expected, "human")
    judge_by_id = index_labels(judge, expected, "judge")

    tp = fn = fp = tn = 0
    disagreements = []
    for case_id in case_ids:
        human_label, judge_label = human_by_id[case_id], judge_by_id[case_id]
        if human_label != judge_label:
            disagreements.append((case_id, human_label, judge_label))
        match (human_label, judge_label):
            case ("pass", "pass"):
                tp += 1
            case ("pass", "fail"):
                fn += 1
            case ("fail", "pass"):
                fp += 1
            case ("fail", "fail"):
                tn += 1

    agreement = (tp + tn) / n
    # Products of row and column totals divided by n squared.
    chance_pairs = (tp + fn) * (tp + fp) + (fp + tn) * (fn + tn)
    chance = chance_pairs / (n * n)
    kappa = None if chance_pairs == n * n else (agreement - chance) / (1 - chance)
    return Calibration(tp, fn, fp, tn, agreement, chance, kappa, tuple(disagreements))`;

const runnerCode = String.raw`CASE_IDS = tuple(case.case_id for case in CASES)
REFERENCE_PASS = {"C01", "C02", "C03", "C04", "C05", "C06"}
FAKE_JUDGE_PASS = {"C01", "C02", "C04", "C05", "C06", "C08", "C09"}


def fixture_labels(case_ids: tuple[str, ...], passing: set[str]) -> list[LabelRow]:
    return [
        LabelRow(case_id=case_id, label="pass" if case_id in passing else "fail")
        for case_id in case_ids
    ]


def print_report(result: Calibration) -> None:
    n = result.tp + result.fn + result.fp + result.tn
    kappa = "undefined" if result.kappa is None else f"{result.kappa:.3f}"
    print(f"n={n}; agreement={result.agreement:.1%}; p_e={result.chance:.3f}; kappa={kappa}")
    print("                judge pass  judge fail")
    print(f"human pass      {result.tp:10d}  {result.fn:10d}")
    print(f"human fail      {result.fp:10d}  {result.tn:10d}")
    for case_id, human, judge in result.disagreements:
        print(f"{case_id} human={human} judge={judge}")


def main() -> None:
    cli = ArgumentParser()
    mode = cli.add_mutually_exclusive_group()
    mode.add_argument("--show-cases", action="store_true")
    mode.add_argument("--labels", type=Path)
    args = cli.parse_args()
    if args.show_cases:
        show_cases(CASES)
        return

    human = load_labels(args.labels) if args.labels else fixture_labels(CASE_IDS, REFERENCE_PASS)
    # Fixed mock verdicts; this function never sees the human label file.
    judge = fixture_labels(CASE_IDS, FAKE_JUDGE_PASS)
    print("rubric=grounding-v1; judge=fake-v1")
    print_report(calibrate(CASE_IDS, human, judge))


if __name__ == "__main__":
    main()`;

const verify = "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest -q test_calibration.py";
const runExample = "uv run --no-project --python 3.12 --with 'pydantic>=2,<3' python worked_calibration.py";

export const d128: Lesson = defineLesson({
  day: 128,
  titleTh: "ทบทวน B32 และ Calibrate LLM Judge กับป้ายที่คุณให้เอง",
  tagline: "30 นาที · อ่าน Agreement, Cohen’s Kappa และ Confusion Matrix จากคำตัดสิน 10 คู่",
  icon: "scale",
  visual: {
    id: "llm-judge-bias",
    title: "จาก Bias Probe สู่ Human–Judge Calibration",
    caption: "แผนภาพใช้การเลือก A/B จาก Day 127 เพื่อสาธิตอคติ ส่วนแลบวันนี้เทียบป้าย pass/fail รายคำตอบกับคน",
    alt: "แผนภาพเปรียบเทียบผลตัดสินจากลำดับคู่คำตอบกับเกณฑ์มนุษย์เพื่อดูความเอนเอียงและความสอดคล้อง",
  },
  requiresApiKey: false,
  apiKeyNote: "ข้อมูลนโยบายและผล Judge เป็น fixture สมมติ รันและติดป้ายด้วยตัวเองได้ทั้งหมดบนเครื่อง",
  tools: ["Python 3.12", "uv", "Pydantic v2", "pytest", "JSONL"],
  bigPicture: [
    {
      node: 1,
      heading: "ยึดคำถามและหลักฐานชุดเดียวกัน",
      body: "Day 125 สร้าง {{golden-dataset}} แยก dev กับ holdout ตามกลุ่ม intent วันนี้ยืมตัวอย่างนโยบายคืนสินค้า ค่าส่ง และเวลารับของมาสร้างคำตอบสิบชิ้นสำหรับวัดผู้ตัดสิน",
      lessonNote: "อ่านคำถาม หลักฐาน และคำตอบเดียวกับที่ Judge เห็น แล้วให้ป้าย pass/fail พร้อมจดเหตุผลก่อนเปิดผล Judge",
    },
    {
      node: 3,
      heading: "เลือกเครื่องมือตรวจให้ตรงกับชนิดความผิดพลาด",
      body: "Day 126 ตรวจ schema, route, tool และอันดับเอกสารโดยตรง ส่วน Day 127 ใช้ {{llm-as-a-judge}} อ่านเนื้อหาและใช้การสลับ A/B กับคู่ควบคุมความยาวแยกอคติ",
      lessonNote: "วันนี้กำหนดหนึ่งหน่วยเป็นหนึ่งคำตอบที่ติดป้ายผ่านหรือไม่ผ่าน งานนี้ต่างจากการเลือกผู้ชนะของคู่ และไม่มีการแปลง tie เป็น fail",
    },
    {
      node: 5,
      heading: "อ่านทั้งความตรงและทิศทางที่พลาด",
      body: "Agreement บอกว่าตรงกันกี่คู่ ส่วน Cohen’s kappa เทียบความตรงนั้นกับค่าคาดหมายจากสัดส่วนป้ายของแต่ละฝ่าย Confusion matrix บอกว่าผิดไปทางรับคำตอบผิดหรือปฏิเสธคำตอบถูก",
      lessonNote: "ใช้ Judge เป็นตัวช่วยคัดกรองใน Thai Knowledge RAG + Agent ได้เมื่อรู้ว่าเคสแบบใดควรให้คนตรวจซ้ำ",
    },
    {
      node: 6,
      heading: "เก็บเคสที่เห็นต่างก่อนวัดระบบรอบถัดไป",
      body: "บันทึก case ID เวอร์ชัน rubric และ Judge พร้อมผลเพื่อหาที่มาของ false pass ก่อนปรับบน dev แล้วตรวจซ้ำด้วย holdout คนละกลุ่ม",
      lessonNote: "Day 129 จะใช้ RAG Triad และ {{ragas}} แยก Faithfulness จาก Context Precision และ Context Recall ก่อนนำผลไปประกอบงานตรวจรับ Evaluated & Guarded AI Microservice v0.5.0 ที่ Day 156",
    },
  ],
  objectives: [
    "ทบทวนสิ่งที่ตรวจได้จาก golden cases, deterministic checks และ bias probes แล้วเลือกเครื่องมือให้ตรงกับ failure",
    "ติดป้าย pass/fail โดยใช้หลักฐานเดียวกับ Judge และคำนวณ agreement, Cohen’s kappa กับ confusion matrix จากคู่ ID ที่ครบ",
    "เปิดเคสที่เห็นต่างเพื่อเสนอการแก้ rubric และบันทึกขอบเขตของผลก่อนใช้ metric ใน Day 129",
  ],
  prerequisites: [
    "Day 125: เขียน golden label และแยก dev/holdout ระดับ intent",
    "Day 126: ใช้ case ID จับคู่ผล ตรวจ schema และแยก Recall@k ออกจาก MRR",
    "Day 127: ใช้ rubric, สลับตำแหน่ง และตรวจ verbosity bias",
  ],
  setup: {
    intro: "เริ่มจากควิซตามตาราง Review แล้วสร้างโฟลเดอร์แลบว่าง ใช้ Python 3.12 กับ uv และคัดลอกโค้ด Worked Example ทั้งสามส่วนลง worked_calibration.py ตามลำดับ",
    commands: `uv python install 3.12
uv run --no-project --python 3.12 --with 'pydantic>=2,<3' --with pytest pytest --version`,
    steps: [
      ["python", "ติดตั้ง Python 3.12 และตรวจว่า uv รัน pytest ได้"],
      ["source", "เปิดตัวอย่าง worked_calibration.py แล้วเลื่อนผ่านชุดป้ายอ้างอิงโดยยังไม่อ่านผล"],
      ["labels", "เตรียม my_labels.jsonl แบบ UTF-8 สำหรับเก็บป้ายของคุณ เปิดผลเทียบหลังให้ครบสิบเคส"],
    ],
    note: "เริ่มจากคำสั่ง --show-cases ใน Local Run และให้ป้ายก่อนอ่านผล Worked Example ด้านล่าง หากเทอร์มินัล Windows แสดงภาษาไทยผิด ให้เปิด Python UTF-8 mode ด้วยตัวเลือก -X utf8 ก่อนชื่อไฟล์",
  },
  concepts: [
    {
      id: "blind-labels",
      title: "1 · ให้ป้ายรายคำตอบก่อนดูผล Judge",
      paragraphs: [
        "ใช้ rubric grounding-v1 ให้ pass เมื่อคำตอบตอบครบสิ่งที่ถามและข้อเท็จจริงสำคัญทุกข้อมีหลักฐานรองรับ ถ้าเอกสารขาดข้อมูลเฉพาะที่ถาม การแจ้งข้อจำกัดอย่างตรงไปตรงมาให้ pass เช่น คำถามเรื่องประกันต่างประเทศที่เอกสารกล่าวถึงเฉพาะการซื้อในประเทศ",
        "ให้ fail เมื่อมีตัวเลขผิด วันเริ่มนับผิด ให้ข้อมูลไม่ครบ หรือขยายข้อความทั่วไปไปตอบกรณีพิเศษโดยไม่มีหลักฐาน ความยาวและการใส่ป้าย citation อย่างเดียวไม่เพิ่มคะแนน วันนี้ประเมินสาระของคำตอบ ส่วนรูปแบบ citation ตรวจด้วยกติกาแยกได้",
      ],
      analogy: "เหมือนตรวจข้อสอบด้วยเกณฑ์เดียวกันสองรอบ โดยปิดคะแนนอีกคนไว้จนตรวจเสร็จ",
      bullets: [
        "ใช้ case ID ของคำตอบแต่ละฉบับ แม้คำถามเดียวกัน เช่น C06 และ C09 จะใช้หลักฐานเดียวกัน",
        "จดเหตุผลอ้างประโยคจาก evidence ไว้ข้าง ๆ ไฟล์ป้ายเพื่อกลับมาอ่านตอนผลเห็นต่าง",
        "บันทึก corpus version, rubric version และ Judge version เมื่อใช้ข้อมูลจากระบบจริง",
      ],
      code: {
        language: "json",
        filename: "my_labels.jsonl",
        caption: "ตัวอย่างรูปแบบสองบรรทัดจากเคสสมมติ คนละชุดกับ C01–C10",
        code: `{"case_id":"C91","label":"pass"}
{"case_id":"C92","label":"fail"}`,
      },
      whyTitle: "ป้ายที่เป็นอิสระช่วยตรวจว่า rubric ตรงกันแค่ไหน",
      whyParagraphs: [
        "ถ้าคนเห็น Judge ก่อนอาจปรับคำตอบตามโดยไม่รู้ตัว เมื่อการตีความคลุมเครือ ให้บันทึกเหตุผลและทบทวน rubric บน dev จากนั้นตรวจด้วยกลุ่มใหม่ที่ยังไม่ใช้แก้ rubric",
      ],
    },
    {
      id: "matrix",
      title: "2 · Confusion matrix บอกทิศทางของความคลาดเคลื่อน",
      paragraphs: [
        "วาง human เป็นแถวและ Judge เป็นคอลัมน์ เรียง pass ก่อน fail ทั้งสองแกน มุมซ้ายบนคือ TP มุมขวาบนคือ FN มุมซ้ายล่างคือ FP และมุมขวาล่างคือ TN ชื่อ positive หมายถึงป้าย pass",
        "ตัวอย่างมีห้า TP หนึ่ง FN สอง FP และสอง TN รวมสิบคู่ ช่องทแยงตรงกันเจ็ดคู่จึงได้ agreement 70% ส่วน FP คือ Judge อนุมัติคำตอบที่คนตี fail สำหรับเรื่องวันคืนสินค้า ความผิดแบบนี้อาจทำให้ผู้ใช้เข้าใจเส้นตายผิด",
      ],
      analogy: "เหมือนดูสี่ช่องของรายงาน moderation เทียบผู้ตรวจรุ่นทดลองกับผลที่ทีมบันทึก",
      code: {
        language: "python",
        filename: "read_matrix.py",
        code: `tp, fn, fp, tn = 5, 1, 2, 2
n = tp + fn + fp + tn
print(f"agreement={(tp + tn) / n:.0%}; false passes={fp}")
assert (tp + fn, fp + tn) == (6, 4)  # human totals
assert (tp + fp, fn + tn) == (7, 3)  # judge totals`,
      },
      whyTitle: "คะแนนรวมเดียวกันอาจมีต้นทุนต่างกัน",
      whyParagraphs: [
        "ถ้าสลับ FN กับ FP จำนวนที่ตรงยังเท่าเดิม แต่ฝ่ายดูแลระบบต้องเลือกว่าให้คนตรวจคำตอบที่ Judge ผ่านหรือที่ Judge ปัดตกมากขึ้น เก็บรายชื่อเคสควบคู่กับจำนวนเพื่อให้แก้ rubric ได้ตรงจุด",
      ],
    },
    {
      id: "kappa",
      title: "3 · Cohen’s kappa ใช้สัดส่วนป้ายของแต่ละฝ่าย",
      paragraphs: [
        "p_o คือ observed agreement เท่ากับ 0.70 ส่วน p_e คือค่าคาดหมายภายใต้การให้ป้ายอย่างอิสระตามสัดส่วนของแต่ละฝ่าย คนให้ pass 6 ใน 10 และ Judge ให้ pass 7 ใน 10 จึงได้ p_e จากผลคูณ 0.6 × 0.7 บวก 0.4 × 0.3 เท่ากับ 0.54",
        "Cohen’s kappa ใช้ (p_o − p_e) / (1 − p_e) ได้ประมาณ 0.348 ในชุดนี้ ค่า 1 คือความตรงสมบูรณ์เมื่อคำนวณได้ ค่า 0 คือความตรงเท่ากับค่าคาดหมายจาก marginal rates และค่าติดลบคือความตรงต่ำกว่าค่านั้น",
      ],
      analogy: "เหมือนเทียบคะแนนที่ได้กับคะแนนฐานของงานที่มีบางตัวเลือกถูกเลือกบ่อย แล้วดูว่าขยับเข้าใกล้เพดานไปเท่าไร",
      bullets: [
        "ถ้าทั้งสองฝ่ายให้ pass ทุกเคส จะได้ agreement 100% และ p_e เท่ากับ 1 ทำให้ kappa คำนวณไม่ได้",
        "ถ้าคนให้ pass 9 ใน 10 และ Judge ให้ pass ทุกเคส จะได้ agreement 90% แต่ kappa เป็น 0",
        "อ่านจำนวนตัวอย่างและการกระจายป้ายคู่กับ kappa ชุดเล็กหรือกลุ่มสำนวนคล้ายกันสะท้อนเพียงขอบเขตที่เอามาทดสอบ",
      ],
      code: {
        language: "python",
        filename: "compute_kappa.py",
        code: `for tp, fn, fp, tn in [(5, 1, 2, 2), (9, 0, 1, 0), (10, 0, 0, 0)]:
    n = tp + fn + fp + tn
    observed = (tp + tn) / n
    expected = ((tp + fn) * (tp + fp) + (fp + tn) * (fn + tn)) / n**2
    kappa = (observed - expected) / (1 - expected) if expected < 1 else None
    print(f"{observed:.0%}", "undefined" if kappa is None else f"{kappa:.3f}")`,
      },
      whyTitle: "Agreement สูงอาจยังแยกเคสเสี่ยงไม่ได้",
      whyParagraphs: [
        "ถ้า Judge อนุมัติทุกเคส ระบบจะดูแม่นในชุดที่คำตอบถูกเป็นส่วนใหญ่ แต่จะรับคำตอบผิดทั้งหมดในชุดนั้น ใช้ matrix ยืนยันอาการและเพิ่มตัวอย่าง fail ที่มาจากกลุ่มงานจริงก่อนตัดสินใจเรื่อง release",
      ],
    },
    {
      id: "calibration-loop",
      title: "4 · ส่งเคสเห็นต่างกลับไปปรับ rubric บน dev",
      paragraphs: [
        "หลังติดป้ายครบ ให้เปิดรายงานแล้วอ่านเหตุผลของเคสที่เห็นต่าง ถ้าเจอคำตอบที่อธิบายเงื่อนไขถูกแต่ขาดเอกสารที่ต้องยื่น ให้ชี้ว่าคำถามขอข้อมูลสองส่วนและหลักฐานส่วนที่สองอยู่ตรงไหน",
        "ปรับ rubric ทีละข้อแล้วเก็บผลก่อนและหลังบนเคส dev เดิม เช่น ให้ตรวจวันเริ่มนับแยกจากจำนวนวัน และแยกเวลาปกติออกจากเวลาวันหยุด จากนั้นวัดบน holdout ใหม่ที่แยก intent เพื่อดูว่าผู้ตัดสินใช้เกณฑ์ได้กับภาษาและกรณีอื่นหรือยัง",
      ],
      analogy: "เหมือน triage bug report ตามความเสียหาย แล้วเขียน regression case ให้แต่ละ failure ที่แก้",
      code: {
        language: "python",
        filename: "prioritize_disagreements.py",
        code: `disagreements = [
    ("C91", "pass", "fail"),
    ("C92", "fail", "pass"),
    ("C93", "fail", "pass"),
]
false_passes = [
    case_id for case_id, human, judge in disagreements
    if human == "fail" and judge == "pass"
]
assert false_passes == ["C92", "C93"]`,
      },
      whyTitle: "การปรับ rubric ต้องมีรอบวัดแยก",
      whyParagraphs: [
        "ตัวอย่างสิบเคสใช้สอนวิธีคำนวณและวิเคราะห์ความผิดพลาด เกณฑ์รับ v0.5.0 ต้องมาจากข้อมูลที่แทนพฤติกรรมระบบจริงและแยกจากชุดที่ใช้ปรับ การวัด Day 129 จะเพิ่มข้อมูลว่าเหตุผิดมาจาก retrieval หรือข้อความที่สร้าง",
      ],
    },
  ],
  bridges: {
    web: {
      title: "Web Dev Bridge — จัด Calibration Report เหมือน regression run",
      body: [
        "จับคู่ผลด้วย case ID แบบเดียวกับการ join ผลจาก CI สองงาน เก็บรายชื่อ unmatched และ reject รอบที่ input ไม่ครบก่อนสร้างกราฟ",
        "ในรายงาน release ให้เปิดหลักฐานของ FP ได้ และใช้ version ของ rubric กับ Judge คู่กันเพื่อเทียบการเปลี่ยนแปลงข้ามรอบ",
      ],
      table: [
        ["Stable join key", "case ID ของคำตอบ"],
        ["Schema contract", "LabelRow มีป้าย pass หรือ fail เท่านั้น"],
        ["Regression triage", "FP อาจปล่อยคำตอบผิด ส่วน FN เพิ่มงานตรวจซ้ำ"],
        ["Audit metadata", "ชุดข้อมูล, rubric, Judge และ run ID"],
      ],
    },
    student: {
      title: "First-Year Note — ทำช่องสี่ช่องก่อนใช้สูตร",
      body: [
        "วาดตารางแล้วอ่านคำตัดสินของคนกับ Judge ทีละคู่ ถ้าคนให้ fail และ Judge ให้ pass ให้ขีดเพิ่มในแถว fail คอลัมน์ pass",
        "รวมแถวเพื่อหาป้ายของคน รวมคอลัมน์เพื่อหาป้ายของ Judge แล้วเช็กว่าทั้งสองยอดรวมเท่ากับจำนวนคู่ก่อนคำนวณ",
      ],
    },
  },
  workedExample: {
    intro: "ตรวจคำตอบสิบชิ้นของ Thai Knowledge RAG + Agent ด้วยหลักฐานสมมติชุดเดียวกัน ผล Judge ในแลบตั้งไว้ล่วงหน้าเพื่อให้ตรวจเลขได้ด้วยมือ แล้วคุณจะลองแทนป้ายอ้างอิงด้วยป้ายของตัวเอง",
    steps: [
      {
        title: "1 · นิยามเคสและอ่านไฟล์ป้าย",
        explain: "คัดลอกโค้ดส่วนแรกลง worked_calibration.py แยก object ที่ใช้แสดงโจทย์จาก LabelRow ที่ใช้ parse JSONL ห้ามใช้ช่องว่างในไฟล์แทนป้ายที่ยังไม่ได้ให้",
        code: { language: "python", filename: "worked_calibration.py", code: casesCode },
      },
      {
        title: "2 · จับคู่ด้วย ID และนับช่อง",
        explain: "ต่อโค้ดส่วนนี้ลงไฟล์เดิม ตรวจ missing, extra และ duplicate ทั้งสองฝั่งก่อนนับ ใช้จำนวนเต็มเช็กกรณีที่ p_e เท่ากับหนึ่งก่อนหาร เก็บสาม field ต่อ disagreement เพื่อกลับไปหา evidence",
        code: { language: "python", filename: "worked_calibration.py", code: reportCode },
      },
      {
        title: "3 · ให้ป้ายของคุณก่อน แล้วเปิดรายงาน",
        explain: "ต่อส่วนสุดท้าย รันคำสั่งในแบบฝึกที่ลงท้ายด้วย --show-cases ก่อน แล้วให้ป้าย C01 ถึง C10 ลง my_labels.jsonl พอรันพร้อม --labels my_labels.jsonl โปรแกรมจะใช้ป้ายของคุณแทนป้ายอ้างอิง ตัวเลขด้านล่างมาจากการรันโดยไม่มีอาร์กิวเมนต์ ซึ่งใช้ป้ายอ้างอิง",
        code: { language: "python", filename: "worked_calibration.py", code: runnerCode },
        output: `rubric=grounding-v1; judge=fake-v1
n=10; agreement=70.0%; p_e=0.540; kappa=0.348
                judge pass  judge fail
human pass               5           1
human fail               2           2
C03 human=pass judge=fail
C08 human=fail judge=pass
C09 human=fail judge=pass`,
      },
    ],
    gotcha: "ป้ายของคุณอาจให้ตัวเลขต่างจากผลอ้างอิง ให้ตรวจว่าจับคู่ครบและสูตรถูก แล้วกลับไปเทียบเหตุผลกับ evidence ทีละเคส ความต่างที่ยังอธิบายไม่ได้ควรถูกบันทึกไว้ทบทวน rubric",
  },
  practice: {
    intro: "ใช้ 15 นาทีติดป้ายให้ครบสิบข้อ เขียน scorer จาก template แล้วเลือกหนึ่ง disagreement มาอธิบายด้วยหลักฐานหนึ่งประโยค",
    requirements: [
      "รัน --show-cases และเขียน C01 ถึง C10 เป็น UTF-8 JSONL ทีละบรรทัด โดยให้ป้ายก่อนเปิดผล Judge",
      "เติม calibrate ใน test_calibration.py โดยใช้ LabelRow, Calibration และ index_labels จาก Worked Example แล้วรายงานทั้งสี่ช่อง, agreement, p_e, kappa และ disagreement IDs",
      "ตรวจว่าลำดับแถวไม่กระทบผล เคสหาย ซ้ำ หรือเกินต้องแจ้งข้อผิดพลาด และกรณีป้ายเดียวเหมือนกันตลอดต้องคืน kappa เป็น None",
      "เปิดรายงานด้วย --labels my_labels.jsonl แล้วเขียนสาเหตุของ FP หรือ FN หนึ่งเคส พร้อมเกณฑ์ที่อยากเพิ่มในการทดลอง dev รอบหน้า",
    ],
    starter: {
      language: "python",
      filename: "test_calibration.py",
      code: `import pytest

from worked_calibration import (
    CASE_IDS, FAKE_JUDGE_PASS, REFERENCE_PASS,
    Calibration, LabelRow, fixture_labels, index_labels,
)


def calibrate(
    case_ids: tuple[str, ...], human: list[LabelRow], judge: list[LabelRow]
) -> Calibration:
    # TODO: validate the ID universe and index each side.
    # TODO: count TP, FN, FP, TN and retain mismatches.
    # TODO: compute observed agreement, chance agreement and kappa.
    raise NotImplementedError


def test_fixture_report() -> None:
    human = fixture_labels(CASE_IDS, REFERENCE_PASS)
    judge = fixture_labels(CASE_IDS, FAKE_JUDGE_PASS)
    result = calibrate(CASE_IDS, human, judge[::-1])
    assert (result.tp, result.fn, result.fp, result.tn) == (5, 1, 2, 2)
    assert result.agreement == pytest.approx(0.7)
    assert result.kappa == pytest.approx(8 / 23)`,
    },
    verification: {
      language: "bash",
      filename: "terminal",
      code: verify,
    },
    selfCheck: [
      "ยอดรวมของ matrix เท่ากับจำนวน ID ที่ควรมี และ agreement เท่ากับผลรวมแนวทแยงหารด้วยจำนวนคู่",
      "ผลอ้างอิงได้ agreement 70.0%, p_e 0.540 และ kappa 0.348 ส่วนป้ายของคุณมีเหตุผลรองรับแม้คะแนนต่างกัน",
      "อธิบายได้ว่าทำไม C08 จึงเป็น false pass ในผลอ้างอิง และทำไมแถว invalid ต้องแก้ก่อนสรุปผล",
    ],
    acceptance: "pytest ผ่าน รายงานอ่านได้ทั้งแกนคนและ Judge และมีบันทึกอธิบาย disagreement จากป้ายของคุณอย่างน้อยหนึ่งเคส ถ้าตรงทุกเคสให้เลือกหนึ่งเคสที่ตัดสินยากแล้วอธิบายเกณฑ์",
    hints: [
      {
        body: "เขียนแถวเป็นป้ายคนและคอลัมน์เป็นป้าย Judge ก่อน ชี้ให้ได้ว่า false pass คือช่องใด แล้วทำให้ผลรวมทุกช่องเท่าจำนวน ID ที่กรอก",
      },
      {
        body: "ใช้ index_labels สองครั้งกับชุด ID เดียวกัน แล้วคูณยอดรวม pass ของสองฝั่งและยอดรวม fail ของสองฝั่ง บวกกันและหารด้วย n ยกกำลังสองเพื่อหา p_e",
      },
      {
        body: "วางเฉลยลง test_calibration.py ได้ทั้งไฟล์ โค้ดมี schema, scorer, fixture และเทสต์ครบ ส่วนป้ายของคุณให้รันผ่าน worked_calibration.py ตามขั้นตอน Local Run",
        code: {
          language: "python",
          filename: "test_calibration.py",
          code: [casesCode, reportCode, runnerCode.split("\n\nif __name__")[0], String.raw`import pytest


def test_fixture_report() -> None:
    human = fixture_labels(CASE_IDS, REFERENCE_PASS)
    judge = fixture_labels(CASE_IDS, FAKE_JUDGE_PASS)
    result = calibrate(CASE_IDS, human, judge[::-1])
    assert (result.tp, result.fn, result.fp, result.tn) == (5, 1, 2, 2)
    assert result.agreement == pytest.approx(0.7)
    assert result.chance == pytest.approx(0.54)
    assert result.kappa == pytest.approx(8 / 23)
    assert result.disagreements == (
        ("C03", "pass", "fail"),
        ("C08", "fail", "pass"),
        ("C09", "fail", "pass"),
    )


def test_majority_only_judge() -> None:
    human = fixture_labels(CASE_IDS, set(CASE_IDS[:-1]))
    judge = fixture_labels(CASE_IDS, set(CASE_IDS))
    result = calibrate(CASE_IDS, human, judge)
    assert result.fp == 1
    assert result.agreement == pytest.approx(0.9)
    assert result.kappa == pytest.approx(0.0)


@pytest.mark.parametrize("passing", [set(), set(CASE_IDS)])
def test_single_shared_label(passing: set[str]) -> None:
    rows = fixture_labels(CASE_IDS, passing)
    result = calibrate(CASE_IDS, rows, rows)
    assert result.agreement == result.chance == 1
    assert result.kappa is None


@pytest.mark.parametrize("side", ["human", "judge"])
@pytest.mark.parametrize("kind", ["missing", "duplicate", "extra"])
def test_incomplete_join(side, kind) -> None:
    rows = fixture_labels(CASE_IDS, REFERENCE_PASS)
    if kind == "missing":
        broken = rows[:-1]
    elif kind == "duplicate":
        broken = rows + rows[:1]
    else:
        broken = rows + [LabelRow(case_id="C99", label="fail")]
    human, judge = (broken, rows) if side == "human" else (rows, broken)
    with pytest.raises(ValueError, match=f"{side}:.*{kind}"):
        calibrate(CASE_IDS, human, judge)


def test_load_labels_reports_line(tmp_path: Path) -> None:
    path = tmp_path / "my_labels.jsonl"
    path.write_text('{"case_id":"C01","label":"pass"}\n'
                    '{"case_id":"C02","label":"review"}\n', encoding="utf-8")
    with pytest.raises(ValueError, match="my_labels.jsonl:2: invalid label row"):
        load_labels(path)


@pytest.mark.parametrize("case_ids", [(), ("C01", "C01")])
def test_invalid_case_universe(case_ids: tuple[str, ...]) -> None:
    with pytest.raises(ValueError, match="nonempty unique"):
        calibrate(case_ids, [], [])`].join("\n\n\n"),
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: [
        runExample + " --show-cases",
        "# ให้ป้ายครบสิบเคสใน my_labels.jsonl ก่อนรันบรรทัดถัดไป",
        runExample + " --labels my_labels.jsonl",
        verify,
      ].join("\n"),
    },
  },
  mistakes: [
    {
      title: "เปิดผล Judge ก่อนให้ป้ายคน",
      symptom: "เหตุผลของคนเริ่มตามข้อความของ Judge และ agreement สูงขึ้นโดยไม่รู้ว่าเกิดจากเกณฑ์ตรงกันเองหรือเปล่า",
      fix: "ใช้ --show-cases ให้ป้ายครบทุกข้อพร้อมเหตุผล แล้วค่อยโหลดไฟล์ป้ายเข้าโหมดรายงาน",
    },
    {
      title: "จับคู่ผลตามลำดับบรรทัด",
      symptom: "คะแนนเปลี่ยนเมื่อ worker ส่ง verdict กลับมาคนละลำดับ หรือเคสหายแต่รายงานยังสรุปได้",
      fix: "จับคู่ด้วย case ID และให้ตัวตรวจแจ้ง missing, extra หรือ duplicate ทั้งสองฝั่งก่อนคำนวณ",
    },
    {
      title: "สลับแถวกับคอลัมน์ตอนหา FP",
      symptom: "ทีมเปิดตรวจคำตอบถูกที่ถูกปฏิเสธ ทั้งที่ตั้งใจดูคำตอบผิดที่ Judge อนุมัติ",
      fix: "พิมพ์ชื่อแกน human เป็นแถว Judge เป็นคอลัมน์ แล้วอ่าน false pass จากแถว human fail คอลัมน์ judge pass",
    },
    {
      title: "ใช้ค่าหนึ่งค่าตัดสินความพร้อม",
      symptom: "ชุดที่คำตอบส่วนใหญ่ผ่านให้ agreement สูง แม้ Judge อนุมัติทุกคำตอบ หรือระบบตีความ kappa ที่คำนวณไม่ได้เป็นศูนย์",
      fix: "แสดงจำนวนคู่ ยอดแต่ละช่อง p_e และ kappa ควบคู่กัน เก็บ undefined แยก แล้วทดสอบ holdout ที่มีเคสผ่านและไม่ผ่าน",
    },
  ],
  quiz: {
    intro: "เริ่มช่วง Recall ด้วยควิซสี่ข้อจาก Day 125–127 และการอ่าน agreement ลองอธิบายเหตุผลก่อนกดตรวจคำตอบ",
    questions: [
      mc(
        "d128-q-1",
        "คุณมีสี่สำนวนของคำถามนโยบายคืนสินค้าและกำลังแบ่งชุดจูน Judge ควรแบ่งอย่างไร?",
        [
          ["กระจายสี่แถวไปทั้งสองฝั่ง", "สำนวนใกล้กันจะข้าม split"],
          ["เก็บสี่สำนวนทั้งกลุ่มไว้ฝั่งเดียว", "intent เดียวกันจะไม่ซ้ำข้ามชุด"],
          ["ให้ Judge เลือก split จาก verdict", "เลือกชุดตามผลที่ต้องการวัด"],
          ["ใช้ holdout เพื่อแก้แต่ละข้อแล้ววัดซ้ำ", "ชุดเดิมกลายเป็นข้อมูลใช้จูน"],
        ],
        "B",
        "Day 125 แบ่งระดับ intent เพื่อให้ผลหลังจูนสะท้อนกลุ่มที่ยังไม่ได้ใช้แก้ระบบ",
        "แบ่งสำนวนที่ใช้นโยบายเดียวกันอย่างไร?",
        "กำหนดกลุ่มก่อน และให้สำนวนของ intent เดียวกันอยู่ใน split เดียว",
      ),
      mc(
        "d128-q-2",
        "response อ่านได้และค้นเจอ refund#1 แต่ตอบคืนได้ 14 วันแทน 7 วัน ควรเพิ่มการตรวจอะไร?",
        [
          ["schema ตัวเดิม", "ชนิดของ answer ยังเป็นข้อความ"],
          ["เพียงขยาย k ให้ใหญ่ขึ้น", "หลักฐานชิ้นที่ต้องการอยู่ในผลค้นแล้ว"],
          ["ตรวจ claim เรื่องจำนวนวันเทียบกับหลักฐาน", "จับข้อความที่ขัดกับ evidence โดยตรง"],
          ["ให้คะแนนสูงตามอันดับแรก", "อันดับไม่ได้บอกว่าเนื้อหาคำตอบถูก"],
        ],
        "C",
        "Day 126 ตรวจรูปร่างและอันดับได้ ส่วน rubric ที่อ่าน claim ช่วยตรวจว่าโมเดลใช้หลักฐานถูกต้องหรือไม่",
        "ถ้า Recall ผ่านแต่ claim ขัดหลักฐาน ให้ตรวจอะไร?",
        "ตรวจ groundedness หรือ rule รายข้อเท็จจริงเมื่อเขียนกติกาตรง ๆ ได้",
      ),
      mc(
        "d128-q-3",
        "หลังสลับ A/B แล้ว Judge ยังเลือกคำตอบยาวฉบับเดิมที่ให้วันเริ่มนับผิด อธิบายผลอย่างไร?",
        [
          ["ถือว่าผ่านเพราะเลือก ID เดิม", "ความสม่ำเสมอไม่รับประกันความถูกต้อง"],
          ["แปลงคำตัดสินเป็น tie", "ผู้ตัดสินเลือกฉบับเดียวกันจริง"],
          ["สรุปว่า schema พัง", "สามารถ map verdict กลับเป็น ID ได้"],
          ["ในคู่นี้ผลคงที่ต่อการสลับตำแหน่ง แต่ขัดเกณฑ์ ให้ตรวจด้วยคู่ควบคุมความยาว", "แยกผลด้านตำแหน่งออกจากผลตามสาระ"],
        ],
        "D",
        "Day 127 ใช้การสลับทดสอบความไวต่อตำแหน่ง และใช้คู่ที่คุมข้อเท็จจริงเพื่อตรวจว่าความยาวชนะ rubric หรือเปล่า",
        "ใครชนะเหมือนเดิมสองรอบบอกอะไร?",
        "ผลคงที่เมื่อสลับในคู่นั้น และยังต้องตรวจความถูกต้องกับเกณฑ์",
      ),
      mc(
        "d128-q-4",
        "คนให้ pass 9 จาก 10 และ Judge ให้ pass ทุกข้อ ผลสรุปคืออะไร?",
        [
          ["agreement 90%, kappa 0 และมี false pass หนึ่งข้อ", "p_o เท่ากับ p_e และ Judge รับทุกเคส"],
          ["agreement 100%, kappa 1", "อีกหนึ่งข้อคนให้ fail"],
          ["agreement 90%, kappa undefined", "p_e เท่ากับ 0.9 จึงยังหารได้"],
          ["agreement 10%, มี false fail หนึ่งข้อ", "ป้ายที่ไม่ตรงเป็น Judge pass และ human fail"],
        ],
        "A",
        "Judge ให้ pass ด้วยสัดส่วน 1 คนให้ pass ด้วยสัดส่วน 0.9 จึงคาดว่าตรง 0.9 ภายใต้ marginal rates พอ observed agreement ตรงกับค่านี้ kappa จึงเป็น 0",
        "ตีความ 90% agreement และ kappa 0 อย่างไร?",
        "ความตรงที่เห็นเท่ากับค่าฐานจากสัดส่วนป้าย ต้องเปิด matrix และดูตัวอย่างที่พลาด",
      ),
    ],
  },
  takeaways: [
    "Day 125 ตรึงเคสและหลักฐาน Day 126 ตรวจด้วยกฎ Day 127 ใช้ rubric และ bias probes",
    "ป้ายคนที่ให้ก่อนเห็น Judge และ case ID ที่ตรวจครบ ทำให้คู่ comparison ตรวจสอบซ้ำได้",
    "อ่าน agreement และ kappa พร้อม matrix, จำนวนคู่ และเคสเห็นต่างก่อนปรับ rubric บน dev",
    "Day 129 ใช้ {{ragas}} อ่าน Faithfulness, Context Precision และ Context Recall เพื่อแยกปัญหา retrieval กับ generation",
  ],
  reviewCards: [
    rc(
      "d128-rc-1",
      "Agreement กับ kappa ใช้อะไรต่างกัน?",
      "Agreement คือสัดส่วนที่ตรง Kappa ปรับด้วยความตรงที่คาดจาก marginal rates ของแต่ละฝ่าย",
    ),
    rc(
      "d128-rc-2",
      "ถ้า human เป็นแถวและ Judge เป็นคอลัมน์ false pass อยู่ตรงไหน?",
      "แถว human fail คอลัมน์ judge pass",
    ),
    rc(
      "d128-rc-3",
      "ทำไม agreement 100% ยังให้ kappa undefined ได้?",
      "เมื่อทั้งสองฝ่ายใช้ป้ายเดียวกันตลอด p_e เท่ากับ 1 ตัวหารจึงเป็นศูนย์",
    ),
    rc(
      "d128-rc-4",
      "นำข้อเห็นต่างกลับไปพัฒนา rubric อย่างไร?",
      "อ่าน evidence และเหตุผลของทั้งสองฝ่าย ปรับเกณฑ์บน dev แล้วตรวจซ้ำกับ holdout คนละกลุ่ม",
    ),
  ],
  sources: [
    {
      label: "Cohen (1960) — A Coefficient of Agreement for Nominal Scales",
      href: "https://doi.org/10.1177/001316446002000104",
    },
    {
      label: "scikit-learn — Cohen’s kappa",
      href: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html",
    },
    {
      label: "scikit-learn — Confusion matrix",
      href: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html",
    },
    {
      label: "Ragas — Evaluation metrics",
      href: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/",
    },
  ],
  glossary: ["golden-dataset", "llm-as-a-judge", "groundedness", "rag", "ragas", "pydantic", "pytest", "jsonl", "mrr", "fixture"],
});
