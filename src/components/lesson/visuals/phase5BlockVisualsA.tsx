"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

interface VisualProps {
  reduced?: boolean;
}

const ACTIVE_BTN_STYLE: CSSProperties = {
  borderColor: "var(--brand)",
  background: "var(--brand-soft)",
  color: "var(--brand-ink)",
};

const panelClass = "rounded-xl border border-hair bg-surface2 p-3";
const tableClass = "w-full border-collapse text-left text-xs [&_td]:p-2 [&_th]:p-2";
const rowClass = "border-b border-hair";

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
      style={active ? ACTIVE_BTN_STYLE : undefined}
    >
      {children}
    </button>
  );
}

function Status({ pass, children }: { pass: boolean; children: ReactNode }) {
  return (
    <span
      className="rounded-md px-2 py-1 text-xs font-semibold"
      style={{
        color: pass ? "var(--success)" : "var(--danger)",
        background: pass ? "var(--success-soft)" : "var(--danger-soft)",
      }}
    >
      {pass ? "✓ " : "✕ "}{children}
    </span>
  );
}

function Diagram({ label, viewBox, children }: {
  label: string;
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-surface2 p-2 sm:p-3">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={label}
        className="block h-auto w-full"
        fontFamily="var(--font-sans)"
        fill="var(--fg)"
      >
        {children}
      </svg>
    </div>
  );
}

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

/* Golden dataset and deterministic evals (golden-dataset-evals) */

const GOLDEN_GROUPS = [
  {
    category: "นโยบาย",
    tool: "search_policy",
    queries: [
      ["คืนสินค้าได้กี่วัน", "return-window"], ["สินค้าชำรุดคืนได้ไหม", "damaged-return"],
      ["ขอคืนเงินเข้าบัตร", "refund-card"], ["เปลี่ยนไซซ์สินค้า", "exchange-size"],
      ["ค่าจัดส่งเมื่อคืนสินค้า", "return-shipping"], ["ยกเลิกหลังจัดส่ง", "late-cancel"],
      ["ประกันอุปกรณ์เสริม", "accessory-warranty"], ["สินค้าลดราคาคืนได้ไหม", "sale-return"],
      ["ซื้อเป็นของขวัญและไม่มีใบเสร็จ", "gift-return"], ["ส่งคืนจากต่างประเทศ", "intl-return"],
    ],
  },
  {
    category: "คำสั่งซื้อ",
    tool: "get_order",
    queries: [
      ["ติดตาม ORD-1001", "order-1001"], ["ดูยอด ORD-1002", "order-1002"],
      ["เลขพัสดุ ORD-1003", "order-1003"], ["วันส่ง ORD-1004", "order-1004"],
      ["ORD-1005 ชำระแล้วหรือยัง", "order-1005"], ["ORD-1006 ส่งแยกกี่กล่อง", "order-1006"],
      ["รายการที่ถูกยกเลิกใน ORD-1007", "order-1007"], ["ORD-1008 ผ่านด่านศุลกากรหรือยัง", "order-1008"],
      ["สถานะกล่องทดแทนของ ORD-1009", "order-1009"], ["ยอดคืนบางส่วนของ ORD-1010", "order-1010"],
    ],
  },
  {
    category: "สินค้า",
    tool: "search_catalog",
    queries: [
      ["ดูขนาด T-01", "sku-t01"], ["สต็อก T-02", "sku-t02"],
      ["สีของ T-03", "sku-t03"], ["ราคา T-04", "sku-t04"],
      ["T-05 ใช้กลางแจ้งได้ไหม", "sku-t05"], ["T-06 รองรับ 220 V หรือไม่", "sku-t06"],
      ["T-07 มีอะไหล่รุ่นใด", "sku-t07"], ["T-08 รองรับอุปกรณ์รุ่นเก่าหรือไม่", "sku-t08"],
      ["อุณหภูมิใช้งาน T-09", "sku-t09"], ["ขนาดติดตั้งเมื่อพับ T-10", "sku-t10"],
    ],
  },
  {
    category: "ใบแจ้งหนี้",
    tool: "get_invoice",
    queries: [
      ["เปิด INV-001", "inv-001"], ["ยอดก่อนภาษี INV-002", "inv-002"],
      ["วันครบกำหนด INV-003", "inv-003"], ["สกุลเงิน INV-004", "inv-004"],
      ["รายการส่วนลด INV-005", "inv-005"], ["ภาษีค่าจัดส่ง INV-006", "inv-006"],
      ["INV-007 มีใบลดหนี้ไหม", "inv-007"], ["ยอดคงเหลือหลังจ่ายบางส่วน INV-008", "inv-008"],
      ["เลขสาขาผู้ซื้อใน INV-009", "inv-009"], ["อัตราแลกเปลี่ยนใน INV-010", "inv-010"],
    ],
  },
] as const;

const GOLDEN_CASES = GOLDEN_GROUPS.flatMap((group, groupIndex) =>
  group.queries.map(([input, document], index) => ({
    id: `case-${String(groupIndex * group.queries.length + index + 1).padStart(2, "0")}`,
    input,
    category: group.category,
    difficulty: index < 4 ? "ง่าย" : index < 7 ? "กลาง" : "ยาก",
    expected: { tool: group.tool, relevant_docs: [document] },
  })),
);

type GoldenCase = (typeof GOLDEN_CASES)[number];

function evaluateGoldenCase(test: GoldenCase, candidate: boolean) {
  const document = test.expected.relevant_docs[0];
  const missedDocument = test.id === "case-10" || (candidate && test.difficulty === "ยาก");
  const topDocs = [`${document}-faq`, `${document}-guide`, `${document}-summary`];
  if (!missedDocument) topDocs[test.difficulty === "ง่าย" ? 0 : 1] = document;

  const tool = candidate && test.category === "ใบแจ้งหนี้" ? "get_order" : test.expected.tool;
  const actual = {
    tool,
    doc_ids: candidate && test.id === "case-38" ? topDocs.join(",") : topDocs,
  };
  const schemaValid = typeof actual.tool === "string" && Array.isArray(actual.doc_ids)
    && actual.doc_ids.every((id) => typeof id === "string");
  const rank = schemaValid ? topDocs.indexOf(document) + 1 : 0;

  return {
    actual,
    scores: {
      schema: Number(schemaValid),
      tool: Number(tool === test.expected.tool),
      recall: Number(rank > 0 && rank <= 3),
      mrr: rank > 0 ? 1 / rank : 0,
    },
  };
}

const GOLDEN_METRICS = [
  { key: "schema", name: "Schema valid", minimum: 1 },
  { key: "tool", name: "Tool selection", minimum: 0.95 },
  { key: "recall", name: "Recall@3", minimum: 0.9 },
  { key: "mrr", name: "MRR", minimum: 0.65 },
] as const;

export function GoldenDatasetEvalsVisual({ reduced = false }: VisualProps) {
  const [candidate, setCandidate] = useState(false);
  const [caseId, setCaseId] = useState("case-10");
  const selected = GOLDEN_CASES.find((test) => test.id === caseId) ?? GOLDEN_CASES[0];
  const evaluated = GOLDEN_CASES.map((test) => evaluateGoldenCase(test, candidate));
  const { actual, scores } = evaluateGoldenCase(selected, candidate);
  const metrics = GOLDEN_METRICS.map((metric) => ({
    ...metric,
    score: evaluated.reduce((sum, result) => sum + result.scores[metric.key], 0) / evaluated.length,
  }));
  const pass = metrics.every((metric) => metric.score >= metric.minimum);
  const steps = [
    [`${GOLDEN_CASES.length} JSONL cases`, "หมวดหมู่ + ความยาก"],
    ["Deterministic checks", "Schema · Tool · Rank"],
    ["Score table", "เฉลี่ยทุกเคส"],
    ["Threshold", pass ? "ผ่านทุกเกณฑ์" : "มีคะแนนต่ำกว่าเกณฑ์"],
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกรุ่นที่จะรันบน Golden Dataset">
        <Choice active={!candidate} onClick={() => setCandidate(false)}>Baseline</Choice>
        <Choice active={candidate} onClick={() => setCandidate(true)}>Candidate</Choice>
      </div>

      <Diagram label={`รัน ${GOLDEN_CASES.length} Golden Cases ตรวจผล คำนวณคะแนน และตัดสิน Threshold`} viewBox="0 0 432 166">
        {steps.map(([title, detail], index) => {
          const x = 8 + (index % 2) * 236;
          const y = 8 + Math.floor(index / 2) * 83;
          const tone = index === 3 ? (pass ? "success" : "danger") : "brand";

          return (
            <g key={title} transform={`translate(${x} ${y})`}>
              <rect width="180" height="58" rx="9" fill={`var(--${tone}-soft)`} stroke={`var(--${tone})`}
                className={reduced ? undefined : "transition-colors duration-300"} />
              <text x="90" y="24" textAnchor="middle" fontSize="15" fontWeight="700">{title}</text>
              <text x="90" y="44" textAnchor="middle" fontSize="12" fill="var(--muted)">{detail}</text>
            </g>
          );
        })}
        <g fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M 191 37 H 240 m -6 -4 6 4 -6 4" />
          <path d="M 334 69 V 78 H 98 V 87 m -4 -5 4 5 4 -5" />
          <path d="M 191 120 H 240 m -6 -4 6 4 -6 4" />
          <path d="M 334 152 V 159 H 4 V 37 H 7" strokeDasharray="3 3"
            className={reduced ? undefined : "svg-flow-line"} />
        </g>
      </Diagram>

      <div className={panelClass}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">ผลรวมจาก {evaluated.length} เคส</p>
          <span role="status"><Status pass={pass}>{pass ? "ผ่าน Gate" : "ไม่ผ่าน Gate"}</Status></span>
        </div>
        <table className={tableClass}>
          <thead className={rowClass}>
            <tr><th scope="col">Metric</th><th scope="col">คะแนน</th><th scope="col">ขั้นต่ำ</th><th scope="col">ผล</th></tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.key} className={rowClass}>
                <th scope="row">{metric.name}</th>
                <td>{percent(metric.score)}</td>
                <td>{percent(metric.minimum)}</td>
                <td><Status pass={metric.score >= metric.minimum}>{metric.score >= metric.minimum ? "ผ่าน" : "ตก"}</Status></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={panelClass}>
        <label className="block text-sm font-semibold">
          เปิด Golden Case
          <select
            className="mt-2 w-full rounded-md border border-hair bg-surface p-2 text-xs"
            value={caseId}
            onChange={(event) => setCaseId(event.target.value)}
          >
            {GOLDEN_GROUPS.map(({ category }) => (
              <optgroup key={category} label={category}>
                {GOLDEN_CASES.filter((test) => test.category === category).map((test) => (
                  <option key={test.id} value={test.id}>{test.id} · {test.input} ({test.difficulty})</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div aria-live="polite" className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-surface p-2">
            <p className="text-xs font-semibold">Expected · JSONL 1 บรรทัด</p>
            <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs">{JSON.stringify(selected)}</pre>
          </div>
          <div className="min-w-0 rounded-lg bg-surface p-2">
            <p className="text-xs font-semibold">Actual · ผลรันจริงในตัวอย่าง</p>
            <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs">{JSON.stringify(actual)}</pre>
          </div>
          <p className="text-xs text-muted sm:col-span-2">
            เคสนี้ · Schema {scores.schema ? "ผ่าน" : "ตก"} · Tool {scores.tool ? "ตรง" : "ผิด"} ·
            Recall@3 {percent(scores.recall)} · Reciprocal rank {scores.mrr.toFixed(2)}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted">
        ใช้ Recall@3 ตรวจว่าเอกสารอ้างอิงอยู่ในสามอันดับแรก และใช้ MRR เฉลี่ย 1 ÷ อันดับแรกที่ตรง
        (0 เมื่อผลค้นหาใช้ไม่ได้หรือไม่พบเอกสาร) แก้ระบบแล้วรัน JSONL ชุดเดิมอีกครั้งเพื่อเทียบคะแนน
      </p>
    </div>
  );
}

/* Pairwise judge and human calibration (llm-judge-bias) */

type AnswerId = "A" | "B";
type Verdict = AnswerId | "tie";

const JUDGE_ANSWERS = {
  A: { text: "คืนได้ภายใน 14 วันหลังรับสินค้า ตามข้อ 2", detail: "ตรงเอกสารอ้างอิง" },
  B: {
    text: "คืนได้ภายใน 30 วันหลังรับสินค้า สามารถส่งคืนผ่านขนส่งได้หลายช่องทาง และจะได้รับเงินคืนในรอบบิลถัดไป",
    detail: "ยาวกว่า แต่ระบุวันผิด",
  },
};

const JUDGE_CALIBRATION = [
  { human: "A", first: "A", longer: "B", evidence: 1.0 },
  { human: "B", first: "A", longer: "B", evidence: -1.0 },
  { human: "A", first: "B", longer: "A", evidence: 0.8 },
  { human: "B", first: "B", longer: "A", evidence: -0.9 },
  { human: "A", first: "A", longer: "B", evidence: 0.7 },
  { human: "B", first: "A", longer: "B", evidence: -0.5 },
  { human: "A", first: "B", longer: "B", evidence: -0.3 },
  { human: "B", first: "B", longer: "A", evidence: -0.4 },
] as const;

interface JudgeOptions {
  position: boolean;
  verbosity: boolean;
  rubric: boolean;
  average: boolean;
}

function judgeScore(
  evidence: number,
  first: AnswerId,
  longer: AnswerId,
  options: JudgeOptions,
) {
  const positionWeight = options.position ? (options.rubric ? 0.25 : 1.5) : 0;
  const verbosityWeight = options.verbosity && !options.rubric ? 0.65 : 0;
  return evidence + (first === "A" ? positionWeight : -positionWeight)
    + (longer === "A" ? verbosityWeight : -verbosityWeight);
}

function toVerdict(score: number): Verdict {
  if (Math.abs(score) < 0.001) return "tie";
  return score > 0 ? "A" : "B";
}

function otherAnswer(answer: AnswerId): AnswerId {
  return answer === "A" ? "B" : "A";
}

function pairwiseScore(evidence: number, first: AnswerId, longer: AnswerId, options: JudgeOptions) {
  const forward = judgeScore(evidence, first, longer, options);
  return options.average
    ? (forward + judgeScore(evidence, otherAnswer(first), longer, options)) / 2
    : forward;
}

function verdictLabel(verdict: Verdict) {
  return verdict === "tie" ? "เสมอ" : `${verdict} ชนะ`;
}

export function LlmJudgeBiasVisual({ reduced = false }: VisualProps) {
  const [first, setFirst] = useState<AnswerId>("A");
  const [options, setOptions] = useState<JudgeOptions>({
    position: true,
    verbosity: false,
    rubric: false,
    average: false,
  });
  const sampleEvidence = 0.5;
  const order = [first, otherAnswer(first)];
  const forward = judgeScore(sampleEvidence, first, "B", options);
  const reverse = judgeScore(sampleEvidence, otherAnswer(first), "B", options);
  const winner = toVerdict(pairwiseScore(sampleEvidence, first, "B", options));
  const calibration = JUDGE_CALIBRATION.map((sample) => ({
    human: sample.human,
    judge: toVerdict(pairwiseScore(sample.evidence, sample.first, sample.longer, options)),
  }));
  const count = calibration.length;
  const matches = calibration.filter(({ human, judge }) => human === judge).length;
  const observed = matches / count;
  const chance = (["A", "B", "tie"] as const).reduce((sum, label) => {
    const humanCount = calibration.filter(({ human }) => human === (label as Verdict)).length;
    const judgeCount = calibration.filter(({ judge }) => judge === label).length;
    return sum + (humanCount / count) * (judgeCount / count);
  }, 0);
  const kappa = (observed - chance) / (1 - chance);
  const controls = [
    { key: "position", label: "Position bias" },
    { key: "verbosity", label: "Verbosity bias" },
    { key: "rubric", label: "ใช้ Rubric" },
    { key: "average", label: "Swap-and-average" },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เปิดหรือปิด Bias และวิธีลด Bias">
        {controls.map(({ key, label }) => (
          <Choice key={key} active={options[key]}
            onClick={() => setOptions((current) => ({ ...current, [key]: !current[key] }))}>
            {label}
          </Choice>
        ))}
      </div>
      <div className={panelClass}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">ลูกค้าถามว่า “คืนสินค้าได้ภายในกี่วัน?”</p>
          <Choice active={first === "B"} onClick={() => setFirst(otherAnswer(first))}>สลับลำดับ A/B</Choice>
        </div>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {order.map((answer, index) => (
            <li key={answer} className="min-w-0 rounded-lg border border-hair bg-surface p-3">
              <p className="font-mono text-xs font-semibold">ตำแหน่ง {index + 1} · คำตอบ {answer}</p>
              <p className="mt-1 text-sm">{JUDGE_ANSWERS[answer].text}</p>
              <p className="mt-1 text-xs text-muted">{JUDGE_ANSWERS[answer].detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <Diagram label={`รอบ ${order.join(" → ")} ${verdictLabel(toVerdict(forward))} รอบกลับ ${verdictLabel(toVerdict(reverse))}`} viewBox="0 0 432 119">
        <rect x="144" y="12" width="144" height="24" rx="8" fill="var(--brand-soft)" stroke="var(--brand)" />
        <text x="216" y="28" textAnchor="middle" fontSize="12" fontWeight="700">LLM-as-a-judge</text>
        <path d="M216 37 V46 H111 V54 M216 46 H321 V54" fill="none" stroke="var(--line-strong)" />
        {[{ score: forward, label: order.join(" → ") }, { score: reverse, label: [...order].reverse().join(" → ") }].map(({ score, label }, index) => {
          const x = 15 + index * 210;
          const color = index === 0 || options.average ? "brand" : "line-strong";
          return (
            <g key={label} transform={`translate(${x} 55)`}>
              <rect width="192" height="52" rx="9" fill="var(--surface)" stroke={`var(--${color})`}
                className={reduced ? undefined : "transition-colors duration-300"} />
              <text x="96" y="20" textAnchor="middle" fontSize="13">{label}</text>
              <text x="96" y="39" textAnchor="middle" fontSize="13" fontWeight="700">
                {verdictLabel(toVerdict(score))} · Δ {score.toFixed(2)}
              </text>
            </g>
          );
        })}
      </Diagram>

      <div className={panelClass} aria-live="polite">
        <p className="text-sm font-semibold">
          {options.average ? "เฉลี่ย Δ ของสองลำดับ" : "ใช้ Δ จากลำดับที่เลือก"} · {verdictLabel(winner)}
        </p>
        <p className="mt-1 text-xs text-muted">
          Δ = คะแนน A − คะแนน B หลังจัดผลให้ตรงกับคำตอบเดิม
          {options.rubric ? " · Rubric ให้น้ำหนักกับความถูกต้องและหลักฐาน ตัดโบนัสความยาว" : " · เปิด Rubric เพื่อยึดความถูกต้องและหลักฐาน"}
        </p>
        <table className={`mt-2 ${tableClass}`}>
          <caption className="pb-1 text-left font-semibold">Calibration · ชุดตัวอย่างที่มนุษย์กำกับ {count} คู่</caption>
          <thead className={rowClass}>
            <tr><th scope="col">Human label</th><th scope="col">Judge A</th><th scope="col">Judge B</th><th scope="col">เสมอ</th></tr>
          </thead>
          <tbody>
            {(["A", "B"] as const).map((human) => (
              <tr key={human} className={rowClass}>
                <th scope="row">{human}</th>
                {(["A", "B", "tie"] as const).map((judge) => (
                  <td key={judge}>{calibration.filter((sample) => sample.human === human && sample.judge === judge).length}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs">
          Agreement <strong>{matches}/{count} ({percent(observed)})</strong> · Cohen’s κ <strong>{kappa.toFixed(2)}</strong>
          <span className="text-muted"> · หักความตรงกันที่คาดจากการสุ่มตามสัดส่วนป้าย ({percent(chance)})</span>
        </p>
      </div>
    </div>
  );
}

/* Promptfoo test matrix (promptfoo-regression) */

type PromptVersion = "v1" | "v2";

const PROMPTFOO_TESTS = [
  {
    id: "refund",
    name: "คืนสินค้า",
    input: "คืนสินค้าได้กี่วัน?",
    expectedText: "14 วัน",
    expectedRubric: "ระบุนโยบายคืนภายใน 14 วันและอ้างรหัสเอกสาร",
    validOutput: '{"answer":"คืนได้ภายใน 14 วัน","source":"RET-02"}',
  },
  {
    id: "tracking",
    name: "ติดตามพัสดุ",
    input: "จะติดตามพัสดุได้ที่ไหน?",
    expectedText: "ประวัติคำสั่งซื้อ",
    expectedRubric: "ชี้ทางไปหน้าประวัติคำสั่งซื้อและอ้างรหัสเอกสาร",
    validOutput: '{"answer":"เปิดประวัติคำสั่งซื้อ","source":"SHIP-01"}',
  },
  {
    id: "unknown",
    name: "ข้อมูลไม่พอ",
    input: "ของในกล่องที่ยังไม่เปิดเสียหรือไม่?",
    expectedText: "ไม่ทราบ",
    expectedRubric: "ยอมรับว่าไม่ทราบและไม่สร้างแหล่งอ้างอิง",
    validOutput: '{"answer":"ไม่ทราบจากข้อมูลที่มี","source":null}',
  },
] as const;

const PROMPTFOO_PROVIDERS = [
  { id: "openai", name: "OpenAI", latency: 295 },
  { id: "anthropic", name: "Anthropic", latency: 360 },
] as const;

const PROMPTFOO_PROMPTS = {
  v1: "ตอบเป็น JSON ด้วย answer และ source เสมอ อ้างเอกสารเมื่อพบหลักฐาน",
  v2: "ตอบเป็น JSON ด้วย answer และ source หากไม่พบหลักฐานให้ตอบปฏิเสธสั้น ๆ",
};

const PROMPTFOO_LATENCY_LIMIT = 600;
type PromptfooProvider = (typeof PROMPTFOO_PROVIDERS)[number];
type PromptfooTest = (typeof PROMPTFOO_TESTS)[number];

function getPromptfooResult(version: PromptVersion, provider: PromptfooProvider, test: PromptfooTest) {
  const bareReply = version === "v2" && provider.id === "anthropic" && test.id === "unknown";
  const output = bareReply ? "ไม่ทราบจากข้อมูลที่มี" : test.validOutput;
  const latency = provider.latency + test.input.length * 3 - (version === "v2" ? 20 : 0);
  let isJson = true;
  try {
    JSON.parse(output);
  } catch {
    isJson = false;
  }

  const asserts = [
    { name: "contains", pass: output.includes(test.expectedText), detail: `มีข้อความ “${test.expectedText}”` },
    { name: "is-json", pass: isJson, detail: "ผลลัพธ์ต้อง parse เป็น JSON ได้" },
    { name: "llm-rubric", pass: true, detail: `ผล Judge ที่บันทึกไว้ · ${test.expectedRubric}` },
    { name: "latency", pass: latency <= PROMPTFOO_LATENCY_LIMIT, detail: `${latency} ms / จำกัด ${PROMPTFOO_LATENCY_LIMIT} ms` },
  ];
  const passed = asserts.filter((assert) => assert.pass).length;

  return { output, asserts, passed, pass: passed === asserts.length };
}

export function PromptfooRegressionVisual({ reduced = false }: VisualProps) {
  const [version, setVersion] = useState<PromptVersion>("v1");
  const [provider, setProvider] = useState<PromptfooProvider>(PROMPTFOO_PROVIDERS[1]);
  const [test, setTest] = useState<PromptfooTest>(PROMPTFOO_TESTS[2]);
  const selected = getPromptfooResult(version, provider, test);
  const runs = PROMPTFOO_PROVIDERS.flatMap((item) =>
    PROMPTFOO_TESTS.map((sample) => getPromptfooResult(version, item, sample)),
  );
  const passed = runs.filter((run) => run.pass).length;
  const failures = runs.length - passed;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือก Prompt เวอร์ชันที่จะเทียบ">
        {(["v1", "v2"] as const).map((item) => (
          <Choice key={item} active={version === item} onClick={() => setVersion(item)}>Prompt {item}</Choice>
        ))}
      </div>
      <p className="rounded-lg border border-hair bg-surface2 p-3 text-xs" aria-live="polite">
        <strong>Prompt {version}</strong> · {PROMPTFOO_PROMPTS[version]}
      </p>

      <Diagram label={`Prompt ${version} ผ่าน ${passed} จาก ${runs.length} การทดสอบ`} viewBox="0 0 432 73">
        <text x="12" y="25" fontSize="14" fontWeight="700">Run summary</text>
        <text x="420" y="25" textAnchor="end" fontSize="13">ผ่าน {passed}/{runs.length} · ตก {failures}</text>
        {runs.map((run, index) => (
          <rect
            key={index}
            x={12 + index * 69}
            y="37"
            width="63"
            height="23"
            rx="5"
            fill={run.pass ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={run.pass ? "var(--success)" : "var(--danger)"}
            className={reduced ? undefined : "transition-colors duration-300"}
          />
        ))}
      </Diagram>

      <div className={panelClass}>
        <table className={`${tableClass} [&_td]:px-0.5 [&_th]:px-1`}>
          <caption className="pb-2 text-left font-semibold">Prompt {version} × Provider × Test case · เลือกช่องเพื่อดู Assert</caption>
          <thead className={rowClass}>
            <tr>
              <th scope="col">Provider</th>
              {PROMPTFOO_TESTS.map((sample) => <th key={sample.id} scope="col">{sample.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {PROMPTFOO_PROVIDERS.map((item) => (
              <tr key={item.id} className={rowClass}>
                <th scope="row">{item.name}</th>
                {PROMPTFOO_TESTS.map((sample) => {
                  const result = getPromptfooResult(version, item, sample);
                  const active = provider.id === item.id && test.id === sample.id;
                  return (
                    <td key={sample.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-label={`${item.name} · ${sample.name} · ผ่าน ${result.passed} จาก ${result.asserts.length} Assert`}
                        onClick={() => { setProvider(item); setTest(sample); }}
                        className={`btn btn-sm w-full px-1 font-mono ${reduced ? "" : "transition-colors duration-300"}`}
                        style={{
                          borderColor: active ? "var(--brand)" : "var(--line)",
                          background: result.pass ? "var(--success-soft)" : "var(--danger-soft)",
                          color: result.pass ? "var(--success)" : "var(--danger)",
                        }}
                      >
                        {result.pass ? "✓" : "✕"} {result.passed}/{result.asserts.length}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={panelClass} aria-live="polite">
        <p className="text-sm font-semibold">{provider.name} · {test.name}</p>
        <p className="mt-1 text-xs text-muted">Input · {test.input}</p>
        <pre className="my-2 whitespace-pre-wrap break-all rounded-lg bg-surface p-2 font-mono text-xs">{selected.output}</pre>
        <ul className="grid gap-2 sm:grid-cols-2">
          {selected.asserts.map((assert) => (
            <li key={assert.name} className="rounded-lg border border-hair bg-surface p-2">
              <Status pass={assert.pass}>{assert.name}</Status>
              <p className="mt-1 text-xs text-muted">{assert.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          {selected.pass
            ? "Assert ทุกข้อผ่านในช่องนี้ ผลทั้งชุดผ่านเมื่อทุกช่องผ่าน"
            : "Regression · ข้อความปฏิเสธตรง Rubric แต่ตัวอ่าน JSON ของแอปจะอ่านผลนี้ไม่ได้"}
        </p>
      </div>
    </div>
  );
}

/* Required evaluation check in GitHub Actions (ci-eval-gate) */

const CI_STAGES = [
  { id: "push", name: "PR push", detail: "GitHub Actions เริ่ม workflow เมื่อมี commit ใหม่ใน Pull Request" },
  { id: "install", name: "Install (uv)", detail: "uv sync --locked ติดตั้ง dependency ตาม lockfile ให้แต่ละ PR ใช้สภาพแวดล้อมเดียวกัน" },
  { id: "unit", name: "Unit tests", detail: "uv run pytest ตรวจ parser และตัวเรียก Tool ด้วย fixture · ผ่าน 24/24" },
  { id: "eval", name: "Eval suite", detail: "รัน Golden Dataset 40 เคสกับ Prompt ของ PR แล้วบันทึกผล Schema และ Tool selection" },
  { id: "gate", name: "Threshold gate", detail: "เปรียบเทียบทุก metric กับขั้นต่ำ ถ้าข้อใดตกให้ job จบด้วย exit code 1" },
  { id: "merge", name: "Merge", detail: "Branch protection กำหนดให้ eval-gate เป็น required status check" },
] as const;

type CiStage = (typeof CI_STAGES)[number];

export function CiEvalGateVisual({ reduced = false }: VisualProps) {
  const [broken, setBroken] = useState(false);
  const [stage, setStage] = useState<CiStage>(CI_STAGES[4]);
  const total = 40;
  const metrics = [
    { label: "Schema valid", passed: total, threshold: 1 },
    { label: "Tool selection", passed: broken ? 34 : 39, threshold: 0.95 },
  ].map((metric) => ({ ...metric, score: metric.passed / total }));
  const failure = metrics.find(({ score, threshold }) => score < threshold);
  const passed = !failure;
  const mergeStatus = passed ? "อนุญาต Merge" : "บล็อก Merge";
  const state = ["เริ่ม workflow", "ติดตั้งเสร็จ", "ผ่าน 24/24", `รันครบ ${total} เคส`, passed ? "exit 0" : "exit 1", mergeStatus];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Choice active={broken} onClick={() => setBroken(!broken)}>Break the prompt</Choice>
        <span role="status"><Status pass={passed}>{mergeStatus}</Status></span>
      </div>
      <Diagram label={`PR push → Install uv → Unit tests → Eval suite → Threshold gate → ${mergeStatus}`} viewBox="0 0 432 151">
        <g fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M 132 37 H 152 m -5 -4 5 4 -5 4 M 280 37 H 300 m -5 -4 5 4 -5 4" />
          <path d="M 364 65 V 84 m -4 -5 4 5 4 -5" strokeDasharray="3 3"
            className={reduced ? undefined : "svg-flow-line"} />
          <path d="M 300 115 H 280 m 5 -4 -5 4 5 4" />
          <path d="M 152 115 H 132 m 5 -4 -5 4 5 4" stroke={passed ? "var(--success)" : "var(--danger)"}
            strokeDasharray={passed ? undefined : "4 3"} />
        </g>
        {CI_STAGES.map((item, index) => {
          const x = 6 + 148 * (index < 3 ? index : 5 - index);
          const y = index < 3 ? 9 : 87;
          const tone = index >= 4 ? (passed ? "success" : "danger") : "brand";
          return (
            <g key={item.id} transform={`translate(${x} ${y})`}>
              <rect width="124" height="55" rx="9"
                fill={stage.id === item.id || index >= 4 ? `var(--${tone}-soft)` : "var(--surface)"}
                stroke={`var(--${tone})`}
                strokeWidth={stage.id === item.id ? 2.5 : 1}
                className={reduced ? undefined : "transition-colors duration-300"} />
              <text x="62" y="22" textAnchor="middle" fontSize="13" fontWeight="700">{item.name}</text>
              <text x="62" y="42" textAnchor="middle" fontSize="12" fill="var(--muted)">{state[index]}</text>
            </g>
          );
        })}
      </Diagram>

      <div className="flex flex-wrap gap-2" role="group" aria-label="ตรวจแต่ละขั้นใน GitHub Actions">
        {CI_STAGES.map((item) => (
          <Choice key={item.id} active={stage.id === item.id} onClick={() => setStage(item)}>{item.name}</Choice>
        ))}
      </div>
      <div className={panelClass} aria-live="polite">
        <p className="text-sm font-semibold">{stage.name}</p>
        <p className="mt-1 text-xs text-muted">{stage.detail}</p>
        <table className={`mt-2 ${tableClass}`}>
          <caption className="pb-1 text-left font-semibold">ผลของ eval-gate</caption>
          <thead className={rowClass}>
            <tr><th scope="col">Metric</th><th scope="col">ผลรัน</th><th scope="col">ขั้นต่ำ</th><th scope="col">ผล</th></tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.label} className={rowClass}>
                <th scope="row">{metric.label}</th>
                <td>{metric.passed}/{total} · {percent(metric.score)}</td>
                <td>{percent(metric.threshold)}</td>
                <td><Status pass={metric.score >= metric.threshold}>{metric.score >= metric.threshold ? "ผ่าน" : "ตก"}</Status></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">
          {failure
            ? `Prompt ที่แก้ทำให้เลือก Tool ผิด ${total - failure.passed} เคส · ${failure.label} ${percent(failure.score)} ต่ำกว่า ${percent(failure.threshold)} แม้ Unit tests ผ่าน`
            : "ทุก Metric ถึงขั้นต่ำ จึงผ่าน required check ของ Eval Gate"}
        </p>
      </div>
    </div>
  );
}

/* OpenTelemetry trace and span attributes (otel-genai-spans) */

const OTEL_SPANS = [
  {
    id: "http",
    label: "POST /chat",
    kind: "HTTP · Server",
    start: 0,
    duration: 1420,
    attributes: [
      ["http.request.method", "POST"],
      ["http.route", "/chat"],
      ["http.response.status_code", 200],
    ],
  },
  {
    id: "retrieve",
    label: "retrieve",
    kind: "RAG · Internal",
    start: 5,
    duration: 120,
    attributes: [
      ["app.retrieval.strategy", "hybrid"],
      ["app.retrieval.top_k", 20],
      ["app.retrieval.results", 20],
    ],
  },
  {
    id: "rerank",
    label: "rerank",
    kind: "RAG · Internal",
    start: 125,
    duration: 65,
    attributes: [
      ["app.rerank.model", "multilingual-reranker"],
      ["app.rerank.input_count", 20],
      ["app.rerank.output_count", 5],
    ],
  },
  {
    id: "chat",
    label: "gen_ai chat",
    kind: "GenAI · Client",
    start: 190,
    duration: 1140,
    attributes: [
      ["gen_ai.operation.name", "chat"],
      ["gen_ai.request.model", "gpt-4o-mini"],
      ["gen_ai.usage.input_tokens", 880],
      ["gen_ai.usage.output_tokens", 220],
    ],
  },
] as const;

const OTEL_SIGNALS = [
  { name: "Logs", tone: "cyan", detail: "เหตุการณ์รายบรรทัด เช่น JSON log ของ request นี้ พร้อม trace_id" },
  { name: "Metrics", tone: "warning", detail: "ตัวเลขรวมจากหลาย request เช่น P95 latency และจำนวน token" },
  { name: "Traces", tone: "brand", detail: "การเดินทางของ request เดียว แบ่งเป็น spans ที่บอกขั้นตอนและระยะเวลา" },
] as const;

type OtelSpan = (typeof OTEL_SPANS)[number];

export function OtelGenaiSpansVisual({ reduced = false }: VisualProps) {
  const [selected, setSelected] = useState<OtelSpan>(OTEL_SPANS[3]);
  const [signal, setSignal] = useState<(typeof OTEL_SIGNALS)[number]>(OTEL_SIGNALS[2]);

  return (
    <div className="space-y-3">
      <div className={panelClass}>
        <p className="mb-2 text-xs font-mono text-muted">trace_id · 4bf92f3577b34da6a3ce929d0e0e4736</p>
        <svg
          viewBox="0 0 432 216"
          role="group"
          aria-label="Trace tree เลือก Span เพื่อดู Attributes"
          className="block h-auto w-full"
          fontFamily="var(--font-sans)"
          fill="var(--fg)"
        >
          <path d="M 28 51 V 181 M 28 77 H 51 M 28 129 H 51 M 28 181 H 51"
            fill="none" stroke="var(--brand)" strokeWidth="1.5" />
          {OTEL_SPANS.map((span, index) => {
            const active = selected.id === span.id;
            const x = index === 0 ? 10 : 52;
            const width = 422 - x;
            return (
              <g
                key={span.id}
                transform={`translate(${x} ${8 + index * 52})`}
                role="button"
                tabIndex={0}
                aria-label={`${span.label} · ${span.duration} ms`}
                aria-pressed={active}
                className="group cursor-pointer outline-none"
                onClick={() => setSelected(span)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(span);
                  }
                }}
              >
                <rect width={width} height="43" rx="8"
                  fill={active ? "var(--brand-soft)" : "var(--surface)"}
                  stroke={active ? "var(--brand)" : "var(--line-strong)"}
                  strokeWidth={active ? 2 : 1}
                  className={`group-focus-visible:stroke-[var(--brand)] group-focus-visible:stroke-[3] ${reduced ? "" : "transition-colors duration-300"}`} />
                <text x="11" y="18" fontSize="14" fontWeight="700">{span.label}</text>
                <text x="11" y="34" fontSize="11" fill="var(--muted)">{span.kind}</text>
                <text x={width - 11} y="26" textAnchor="end" fontSize="12" fontFamily="var(--font-mono)">
                  {span.duration} ms
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={panelClass} aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">{selected.label} · Attributes</p>
          <span className="font-mono text-xs text-muted">
            +{selected.start} → +{selected.start + selected.duration} ms
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {selected.id === "http" ? "Root span ของ request" : "Parent span · POST /chat"}
        </p>
        <dl className="mt-2 grid gap-1 font-mono text-xs">
          {selected.attributes.map(([key, value]) => (
            <div key={key} className="flex flex-wrap justify-between gap-x-4 gap-y-1 rounded bg-surface p-2">
              <dt className="min-w-0 break-all text-muted">{key}</dt>
              <dd className="min-w-0 break-all">{value}</dd>
            </div>
          ))}
        </dl>
        {selected.id === "chat" && (
          <p className="mt-2 text-xs text-muted">บันทึกจำนวน Token จาก Provider เพื่อคิดต้นทุนและวิเคราะห์ latency ของการเรียกโมเดล</p>
        )}
      </div>

      <div className={panelClass}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="เปรียบเทียบสัญญาณ OpenTelemetry">
          {OTEL_SIGNALS.map((item) => (
            <Choice key={item.name} active={signal.name === item.name} onClick={() => setSignal(item)}>
              <span aria-hidden="true" className="mr-1" style={{ color: `var(--${item.tone})` }}>●</span>
              {item.name}
            </Choice>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted" aria-live="polite">{signal.name} · {signal.detail}</p>
      </div>
    </div>
  );
}

/* Langfuse span timing and scores (langfuse-trace-waterfall) */

const TRACE_STEPS = [
  { id: "embed", name: "Embedding", tone: "cyan", detail: "แปลงคำถามเป็นเวกเตอร์สำหรับค้นหา" },
  { id: "search", name: "Vector search", tone: "brand", detail: "รอฐานข้อมูลเวกเตอร์ส่งเอกสารที่ใกล้เคียงที่สุดกลับมา" },
  { id: "rerank", name: "Rerank", tone: "cyan", detail: "ให้คะแนนเอกสารใหม่และเลือกหลักฐานตามความเกี่ยวข้อง" },
  { id: "generation", name: "LLM generation", tone: "brand", detail: "รอ Token แรก แล้วสตรีม Token ที่เหลือกลับมา" },
  { id: "guardrail", name: "Guardrail", tone: "cyan", detail: "ตรวจคำตอบช่วงท้ายก่อนปิด request" },
] as const;

const WATERFALL_RUNS = {
  typical: { id: "rag-081", duration: [45, 85, 65, 855, 30], ttft: 200, groundedness: 0.96 },
  slow: { id: "rag-095", duration: [55, 2040, 90, 1060, 55], ttft: 280, groundedness: 0.94 },
} as const;

type TraceCase = keyof typeof WATERFALL_RUNS;
type TraceStepId = (typeof TRACE_STEPS)[number]["id"];
const LATENCY_BUDGET_MS = 2000;

export function LangfuseTraceWaterfallVisual({ reduced = false }: VisualProps) {
  const [trace, setTrace] = useState<TraceCase>("typical");
  const [selectedId, setSelectedId] = useState<TraceStepId>("generation");
  const run = WATERFALL_RUNS[trace];
  const spans = TRACE_STEPS.map((step, index) => ({
    ...step,
    start: run.duration.slice(0, index).reduce<number>((sum, duration) => sum + duration, 0),
    duration: run.duration[index],
  }));
  const selected = spans.find((span) => span.id === selectedId) ?? spans[0];
  const longest = spans.reduce((max, span) => span.duration > max.duration ? span : max);
  const total = run.duration.reduce<number>((sum, duration) => sum + duration, 0);
  const meetsBudget = total <= LATENCY_BUDGET_MS;
  const timelineX = 112;
  const timelineWidth = 244;
  const scale = timelineWidth / 3600;

  function chooseTrace(nextTrace: TraceCase) {
    setTrace(nextTrace);
    setSelectedId(nextTrace === "slow" ? "search" : "generation");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกตัวอย่าง Langfuse Trace">
        <Choice active={trace === "typical"} onClick={() => chooseTrace("typical")}>Trace ปกติ</Choice>
        <Choice active={trace === "slow"} onClick={() => chooseTrace("slow")}>P95 slow trace</Choice>
      </div>
      <Diagram label={`Waterfall ${run.id} รวม ${total} ms · ช่วงที่นานสุดคือ ${longest.name} ${longest.duration} ms`} viewBox="0 0 432 223">
        <text x="10" y="19" fontSize="13" fontWeight="700">Trace {run.id}</text>
        <text x="420" y="19" textAnchor="end" fontSize="13" fontFamily="var(--font-mono)">{total} ms</text>
        {[0, 900, 1800, 2700, 3600].map((time) => {
          const x = timelineX + time * scale;
          return (
            <g key={time}>
              <line x1={x} x2={x} y1="33" y2="190" stroke="var(--line-strong)" strokeDasharray="2 3" />
              <text x={x} y="210" textAnchor="middle" fontSize="10" fill="var(--muted)">{time}</text>
            </g>
          );
        })}
        <text x="420" y="210" textAnchor="end" fontSize="10" fill="var(--muted)">ms</text>
        {spans.map((span, index) => {
          const y = 32 + index * 32;
          const start = timelineX + span.start * scale;
          const bottleneck = trace === "slow" && longest.id === span.id;
          const tone = bottleneck ? "warning" : span.tone;
          return (
            <g key={span.id}>
              {selected.id === span.id && (
                <rect x="4" y={y} width="424" height="30" rx="6" fill={`var(--${tone}-soft)`} />
              )}
              <text x="10" y={y + 20} fontSize="12" fontWeight={selected.id === span.id ? "700" : undefined}>{span.name}</text>
              <rect x={start} y={y + 7} width={span.duration * scale} height="16" rx="2"
                fill={`var(--${tone})`}
                className={reduced ? undefined : "transition-all duration-300"} />
              {span.id === "generation" && (
                <rect x={start} y={y + 7} width={run.ttft * scale} height="16" rx="2" fill="var(--warning)"
                  className={reduced ? undefined : "transition-all duration-300"} />
              )}
              <text x="420" y={y + 20} textAnchor="end" fontSize="12" fontFamily="var(--font-mono)">{span.duration} ms</text>
            </g>
          );
        })}
      </Diagram>

      <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกช่วงใน Waterfall">
        {spans.map((span) => (
          <Choice key={span.id} active={selectedId === span.id} onClick={() => setSelectedId(span.id)}>{span.name}</Choice>
        ))}
      </div>
      <div className={panelClass} aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">{selected.name} · {selected.duration} ms</p>
          <span className="font-mono text-xs text-muted">+{selected.start} → +{selected.start + selected.duration} ms</span>
        </div>
        <p className="mt-1 text-xs text-muted">{selected.detail}</p>
        {selected.id === "generation" && (
          <p className="mt-1 text-xs text-muted">
            <span style={{ color: "var(--warning)" }}>■</span> TTFT ของ LLM {run.ttft} ms ·
            <span style={{ color: "var(--brand)" }}> ■</span> Streaming {selected.duration - run.ttft} ms ·
            ผู้ใช้เห็น Token แรกที่ +{selected.start + run.ttft} ms
          </p>
        )}
        {trace === "slow" && (
          <p className="mt-2 text-xs font-semibold" style={{ color: "var(--warning)" }}>
            คอขวดของ Trace นี้ · {longest.name} ใช้ {percent(longest.duration / total)} ของเวลารวม
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hair pt-2 text-xs">
          <strong>Trace scores</strong>
          <span className="rounded-md bg-surface px-2 py-1">Groundedness · {run.groundedness.toFixed(2)}</span>
          <Status pass={meetsBudget}>Latency budget ≤ {LATENCY_BUDGET_MS} ms · {meetsBudget ? "ผ่าน" : "ตก"}</Status>
        </div>
      </div>
    </div>
  );
}

/* Request latency, token usage and cost (latency-cost-dashboard) */

const LATENCY_SAMPLES = [300, 520, 680, 850, 1080, 1450, 2200, 2700, 3300, 3900] as const;
const DASHBOARD_WINDOWS = {
  normal: {
    counts: [8, 30, 22, 22, 13, 4, 1, 0, 0, 0],
    errorCount: 1,
    inputTokens: 88000,
    outputTokens: 22000,
  },
  spike: {
    counts: [4, 10, 18, 16, 14, 13, 10, 6, 6, 3],
    errorCount: 8,
    inputTokens: 155000,
    outputTokens: 45000,
  },
} as const;

const INPUT_THB_PER_1K = 0.035;
const OUTPUT_THB_PER_1K = 0.14;
const HISTOGRAM_BUCKET_MS = 400;
const HISTOGRAM_MAX_MS = 4000;
type DashboardWindow = keyof typeof DASHBOARD_WINDOWS;

function nearestRank(samples: readonly number[], quantile: number) {
  return samples[Math.ceil(samples.length * quantile) - 1];
}

export function LatencyCostDashboardVisual({ reduced = false }: VisualProps) {
  const [window, setWindow] = useState<DashboardWindow>("normal");
  const sample = DASHBOARD_WINDOWS[window];
  const latencies = LATENCY_SAMPLES.flatMap((latency, index) => Array<number>(sample.counts[index]).fill(latency));
  const requestCount = latencies.length;
  const p50 = nearestRank(latencies, 0.5);
  const p95 = nearestRank(latencies, 0.95);
  const avgInput = sample.inputTokens / requestCount;
  const avgOutput = sample.outputTokens / requestCount;
  const cost = (avgInput * INPUT_THB_PER_1K + avgOutput * OUTPUT_THB_PER_1K) / 1000;
  const errorRate = sample.errorCount / requestCount;
  const triggered = p95 > LATENCY_BUDGET_MS;
  const buckets = Array.from({ length: HISTOGRAM_MAX_MS / HISTOGRAM_BUCKET_MS }, (_, index) => {
    const start = index * HISTOGRAM_BUCKET_MS;
    return latencies.filter((latency) => latency >= start && latency < start + HISTOGRAM_BUCKET_MS).length;
  });
  const xFor = (ms: number) => 38 + ms * (380 / HISTOGRAM_MAX_MS);
  const yFor = (count: number) => 145 - count * 1.55;
  const tiles = [
    { label: "P50 latency", value: `${p50} ms`, detail: "Nearest rank · 50%" },
    { label: "P95 latency", value: `${p95} ms`, detail: `เกณฑ์ ≤ ${LATENCY_BUDGET_MS} ms` },
    { label: "Tokens / request", value: (avgInput + avgOutput).toLocaleString("en-US"), detail: `${avgInput} input + ${avgOutput} output` },
    { label: "Cost / request", value: `฿${cost.toFixed(4)}`, detail: "ค่าโมเดลเฉลี่ย (THB)" },
    { label: "Error rate", value: percent(errorRate), detail: `${sample.errorCount}/${requestCount} requests` },
  ];
  const markers = [
    { value: p50, label: "P50", tone: "cyan-ink", labelY: 31, anchor: "end", offset: -4 },
    { value: p95, label: "P95", tone: "brand-ink", labelY: 50, anchor: "start", offset: 4 },
    { value: LATENCY_BUDGET_MS, label: "Alert threshold", tone: triggered ? "danger" : "warning", labelY: 31, anchor: "start", offset: 4 },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกสถานการณ์โหลด">
          <Choice active={window === "normal"} onClick={() => setWindow("normal")}>โหลดปกติ</Choice>
          <Choice active={window === "spike"} onClick={() => setWindow("spike")}>Spike</Choice>
        </div>
        <span role="status">
          <Status pass={!triggered}>{triggered ? "Alert · P95 เกินเกณฑ์" : "P95 อยู่ในเกณฑ์"}</Status>
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={`สรุป ${requestCount} requests`}>
        {tiles.map(({ label, value, detail }) => (
          <div key={label} className={panelClass}>
            <dt className="text-xs font-semibold text-muted">{label}</dt>
            <dd className="mt-1 font-mono text-base font-semibold sm:text-lg"
              style={label === "P95 latency" && triggered ? { color: "var(--danger)" } : undefined}>
              {value}
            </dd>
            <dd className="mt-1 text-xs text-muted">{detail}</dd>
          </div>
        ))}
      </dl>

      <Diagram
        label={`Histogram ของ ${requestCount} requests · P50 ${p50} ms · P95 ${p95} ms · Alert threshold ${LATENCY_BUDGET_MS} ms`}
        viewBox="0 0 432 182"
      >
        <text x="8" y="15" fontSize="12" fontWeight="700">Latency histogram · จำนวน request</text>
        {[0, 20, 40, 60].map((count) => (
          <g key={count}>
            <line x1="38" x2="418" y1={yFor(count)} y2={yFor(count)} stroke="var(--line-strong)"
              strokeDasharray={count > 0 ? "2 3" : undefined} />
            <text x="30" y={yFor(count) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{count}</text>
          </g>
        ))}
        {buckets.map((count, index) => {
          const start = index * HISTOGRAM_BUCKET_MS;
          return (
            <rect
              key={start}
              x={xFor(start) + 2}
              y={yFor(count)}
              width={xFor(HISTOGRAM_BUCKET_MS) - xFor(0) - 4}
              height={yFor(0) - yFor(count)}
              rx="3"
              fill="var(--brand-soft)"
              stroke={count ? "var(--brand)" : "none"}
              className={reduced ? undefined : "transition-all duration-300"}
            >
              <title>{start}–{start + HISTOGRAM_BUCKET_MS - 1} ms · {count} requests</title>
            </rect>
          );
        })}
        {markers.map(({ label, value, tone, labelY, anchor, offset }) => (
          <g key={label} color={`var(--${tone})`}>
            <line x1={xFor(value)} x2={xFor(value)} y1={labelY - 9} y2="145"
              stroke="currentColor" strokeWidth="1.5" strokeDasharray={label === "Alert threshold" ? "4 3" : undefined}
              className={reduced ? undefined : "transition-all duration-300"} />
            <text x={xFor(value) + offset} y={labelY} textAnchor={anchor} fill="currentColor" fontSize="11" fontWeight="700">{label}</text>
          </g>
        ))}
        {[0, 1000, 2000, 3000, 4000].map((ms) => (
          <text key={ms} x={xFor(ms)} y="165" textAnchor="middle" fontSize="11" fill="var(--muted)">{ms / 1000} s</text>
        ))}
      </Diagram>

      <div className={panelClass} aria-live="polite">
        <p className="text-xs">
          <strong>{requestCount} requests</strong> · P95 คือ latency ที่อันดับ {Math.ceil(requestCount * 0.95)} เมื่อเรียงเวลาจากน้อยไปมาก
          {triggered && ` · เกินเกณฑ์ ${p95 - LATENCY_BUDGET_MS} ms`}
        </p>
        <p className="mt-1 text-xs text-muted">
          ต้นทุนเฉลี่ยจากเรตสมมติ ฿{INPUT_THB_PER_1K}/1K input tokens และ ฿{OUTPUT_THB_PER_1K}/1K output tokens
        </p>
      </div>
    </div>
  );
}

/* Async ingestion queue, concurrency and retries (ingestion-job-queue) */

type JobStatus = "queued" | "running" | "succeeded" | "failed" | "retry";

interface IngestionJob {
  id: string;
  file: string;
  key: string;
  status: JobStatus;
  attempts: number;
  worker: number | null;
}

const WORKER_COUNT = 2;
const UPLOAD_KEY = "ingest-policy-v3";
const INITIAL_JOBS: IngestionJob[] = [
  { id: "job-01", file: "faq.pdf", key: "ingest-faq", status: "queued", attempts: 0, worker: null },
  { id: "job-02", file: "catalog.pdf", key: "ingest-catalog", status: "queued", attempts: 0, worker: null },
];
const JOB_STATES = {
  queued: { tone: "brand", description: "รอ Worker ว่าง" },
  running: { tone: "cyan", description: "Worker กำลังอ่านเอกสารและสร้าง Embedding" },
  succeeded: { tone: "success", description: "เขียนข้อมูลลง Index สำเร็จ" },
  failed: { tone: "danger", description: "Embedding service timeout · ส่งงานเดิมเข้า Queue อีกครั้งได้" },
  retry: { tone: "warning", description: "รอ Worker รับงานกลับไปลองใหม่ด้วย job_id เดิม" },
} as const;

interface QueueState {
  jobs: IngestionJob[];
  lastPost: { id: string; duplicate: boolean } | null;
  selectedId: string;
}

function advanceQueue(jobs: IngestionJob[]) {
  const workers = Array.from({ length: WORKER_COUNT }, (_, index) => index + 1);
  const busyWorkers = jobs.filter((job) => job.status === "running").map((job) => job.worker);
  const available = workers.filter((worker) => !busyWorkers.includes(worker));
  return jobs.map((job): IngestionJob => {
    if (job.status === "running") {
      const failed = job.key === UPLOAD_KEY && job.attempts === 1;
      return { ...job, status: failed ? "failed" : "succeeded", worker: null };
    }
    if (job.status === "queued" || job.status === "retry") {
      const worker = available.shift();
      if (worker !== undefined) return { ...job, status: "running", attempts: job.attempts + 1, worker };
    }
    return job;
  });
}

export function IngestionJobQueueVisual({ reduced = false }: VisualProps) {
  const [queue, setQueue] = useState<QueueState>({
    jobs: INITIAL_JOBS,
    lastPost: null,
    selectedId: INITIAL_JOBS[0].id,
  });
  const { jobs, lastPost } = queue;
  const selected = jobs.find((job) => job.id === queue.selectedId) ?? jobs[0];
  const waiting = jobs.filter((job) => job.status === "queued" || job.status === "retry");
  const running = jobs.filter((job) => job.status === "running");
  const graph = [
    { name: "POST /ingest", detail: lastPost ? `202 · ${lastPost.id}` : "รับไฟล์ + Key" },
    { name: "Job queue", detail: `รอ ${waiting.length} งาน` },
    { name: "Workers", detail: `ทำงาน ${running.length}/${WORKER_COUNT}` },
    { name: "GET /jobs/{id}", detail: selected.status },
  ];

  function postUpload() {
    setQueue((current) => {
      const duplicate = current.jobs.find((job) => job.key === UPLOAD_KEY);
      if (duplicate) {
        return { ...current, selectedId: duplicate.id, lastPost: { id: duplicate.id, duplicate: true } };
      }
      const job: IngestionJob = {
        id: `job-${String(current.jobs.length + 1).padStart(2, "0")}`,
        file: "policy-v3.pdf",
        key: UPLOAD_KEY,
        status: "queued",
        attempts: 0,
        worker: null,
      };
      return { jobs: [...current.jobs, job], selectedId: job.id, lastPost: { id: job.id, duplicate: false } };
    });
  }

  function retrySelected() {
    setQueue((current) => ({
      ...current,
      jobs: current.jobs.map((job) =>
        job.id === selected.id && job.status === "failed" ? { ...job, status: "retry" } : job,
      ),
    }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="จำลองการส่งไฟล์และประมวลผลงาน">
        <button type="button" className="btn btn-sm" onClick={postUpload}>
          {lastPost ? "ส่งซ้ำด้วย Key เดิม" : "ส่ง policy-v3.pdf"}
        </button>
        <button type="button" className="btn btn-sm btn-quiet" disabled={!waiting.length && !running.length}
          onClick={() => setQueue((current) => ({ ...current, jobs: advanceQueue(current.jobs) }))}>
          เดิน Worker 1 รอบ
        </button>
        <button type="button" className="btn btn-sm btn-quiet" disabled={selected.status !== "failed"} onClick={retrySelected}>
          Retry {selected.id}
        </button>
        <button type="button" className="btn btn-sm btn-quiet"
          onClick={() => setQueue({ jobs: INITIAL_JOBS, lastPost: null, selectedId: INITIAL_JOBS[0].id })}>
          เริ่มใหม่
        </button>
      </div>

      <Diagram label={`POST /ingest → Queue รอ ${waiting.length} งาน → Workers ${running.length}/${WORKER_COUNT} · อ่านสถานะผ่าน GET /jobs/{id}`} viewBox="0 0 432 149">
        <g fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M 191 34 H 240 m -6 -4 6 4 -6 4 M 334 63 V 87 m -4 -5 4 5 4 -5" />
          <path d="M 240 118 H 191 m 6 -4 -6 4 6 4" strokeDasharray="3 3"
            className={reduced ? undefined : "svg-flow-line"} />
        </g>
        {graph.map(({ name, detail }, index) => {
          const x = index === 0 || index === 3 ? 8 : 244;
          const y = index < 2 ? 6 : 90;
          const tone = index === 3 ? JOB_STATES[selected.status].tone : "brand";
          return (
            <g key={name} transform={`translate(${x} ${y})`}>
              <rect width="180" height="55" rx="8" fill={`var(--${tone}-soft)`} stroke={`var(--${tone})`}
                className={reduced ? undefined : "transition-colors duration-300"} />
              <text x="90" y="22" textAnchor="middle" fontSize="14" fontWeight="700">{name}</text>
              <text x="90" y="41" textAnchor="middle" fontSize="12" fill="var(--muted)">{detail}</text>
            </g>
          );
        })}
      </Diagram>

      <div className={panelClass} aria-live="polite">
        <p className="text-xs font-semibold">POST /ingest · Idempotency-Key: <code className="font-mono">{UPLOAD_KEY}</code></p>
        {lastPost && (
          <>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-surface p-2 font-mono text-xs">{`202 Accepted  ${JSON.stringify({ job_id: lastPost.id })}`}</pre>
            <p className="mt-1 text-xs text-muted">
              {lastPost.duplicate ? "พบ Key เดิม จึงคืน job_id เดิมโดยไม่เพิ่มงาน" : "คืน job_id ทันที ที่เหลือให้ Worker ทำแบบเบื้องหลัง"}
            </p>
          </>
        )}
        <ul className="mt-2 grid gap-2 sm:grid-cols-2" aria-label="งานที่ Worker กำลังทำ">
          {Array.from({ length: WORKER_COUNT }, (_, index) => {
            const worker = index + 1;
            const job = running.find((item) => item.worker === worker);
            return (
              <li key={worker} className="rounded-md border border-hair bg-surface p-2 text-xs">
                <strong>Worker {worker}</strong> · {job ? job.id : "ว่าง"}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-muted">แต่ละรอบ Worker ที่ว่างจะรับงานรอ ส่วน Worker ที่กำลังทำงานจะจบรอบและคืนสล็อต</p>
      </div>

      <div className={panelClass}>
        <p className="text-sm font-semibold">ตรวจงานด้วย GET /jobs/{'{id}'}</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="เลือก job_id เพื่ออ่านสถานะ">
          {jobs.map((job) => (
            <Choice key={job.id} active={selected.id === job.id}
              onClick={() => setQueue((current) => ({ ...current, selectedId: job.id }))}>
              {job.id} · {job.status}
            </Choice>
          ))}
        </div>
        <div className="mt-2" aria-live="polite">
          <p className="font-mono text-xs">GET /jobs/{selected.id} · 200 OK</p>
          <pre className="mt-2 whitespace-pre-wrap break-all rounded-lg bg-surface p-2 font-mono text-xs">
            {JSON.stringify({ job_id: selected.id, file: selected.file, status: selected.status, attempts: selected.attempts })}
          </pre>
          <p className="mt-1 text-xs text-muted">
            <strong style={{ color: `var(--${JOB_STATES[selected.status].tone})` }}>{selected.status}</strong>
            {" · "}{JOB_STATES[selected.status].description}
          </p>
        </div>
      </div>
    </div>
  );
}
