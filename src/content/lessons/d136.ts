import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const fixtureCode = `from dataclasses import dataclass


@dataclass(frozen=True)
class Span:
    name: str
    parent: str | None
    start_ms: int
    end_ms: int

    @property
    def duration_ms(self) -> int:
        return self.end_ms - self.start_ms


@dataclass(frozen=True)
class Trace:
    trace_id: str
    minute: int
    route: str
    spans: tuple[Span, ...]
    prompt_version: int = 3
    response_model: str = "mock-thai-mini-2026"
    input_tokens: int = 420
    output_tokens: int = 38
    citation_present: float = 1.0

    @property
    def root(self) -> Span:
        return next(span for span in self.spans if span.parent is None)

    @property
    def duration_ms(self) -> int:
        return self.root.duration_ms


def fake_trace(
    minute: int, sequence: int, duration_ms: int, route: str = "expense-policy"
) -> Trace:
    # The 300 ms requests have a shorter generation. The paired tail
    # comparisons all use 260 ms and vary only the retrieval wait.
    generation_ms = 240 if duration_ms == 300 else 260
    retrieve_end = duration_ms - 30 - generation_ms
    search_start = retrieve_end - 10
    return Trace(f"m{minute}-{sequence:02d}", minute, route, (
        Span("rag.answer", None, 0, duration_ms),
        Span("rag.retrieve", "rag.answer", 10, retrieve_end),
        Span("pool.acquire", "rag.retrieve", 10, search_start),
        Span("vector.search", "rag.retrieve", search_start, retrieve_end),
        Span("policy.check", "rag.answer", 10, 20),
        Span("rag.generate", "rag.answer", retrieve_end, duration_ms - 30),
    ))


def traffic() -> list[Trace]:
    tail_by_minute = {10: (450, 900), 11: (1600, 1900), 12: (1650, 1800)}
    traces = [
        fake_trace(minute, i, duration)
        for minute, tail in tail_by_minute.items()
        for i, duration in enumerate([300] * 18 + list(tail), start=1)
    ]
    # A different route shares the alert minute, but belongs to another chart.
    return traces + [fake_trace(12, 21, 2400, "leave-policy")]


def window(traces: list[Trace], minute: int, route: str) -> list[Trace]:
    return [trace for trace in traces if trace.minute == minute and trace.route == route]`;

const timingCode = `def children(trace: Trace, parent: str) -> list[Span]:
    return [span for span in trace.spans if span.parent == parent]


def covered_ms(spans: list[Span]) -> int:
    # Merge overlapping intervals on the same time axis.
    total = 0
    covered_until = 0
    for span in sorted(spans, key=lambda row: row.start_ms):
        total += max(0, span.end_ms - max(span.start_ms, covered_until))
        covered_until = max(covered_until, span.end_ms)
    return total


def unattributed_ms(trace: Trace) -> int:
    direct = children(trace, trace.root.name)
    return trace.duration_ms - covered_ms(direct)


def print_waterfall(trace: Trace) -> None:
    def visit(span: Span, depth: int) -> None:
        print(
            f"{'  ' * depth}{span.name} "
            f"[{span.start_ms}, {span.end_ms}) {span.duration_ms}ms"
        )
        for child in children(trace, span.name):
            visit(child, depth + 1)

    print(f"trace={trace.trace_id}")
    visit(trace.root, 0)`;

const demoCode = `def main() -> None:
    traces = traffic()
    baseline = window(traces, 10, "expense-policy")
    incident = window(traces, 12, "expense-policy")
    # D135 already told us the two P95 values. In practice, compute them.
    typical = next(trace for trace in baseline if trace.duration_ms == 450)
    slow = next(trace for trace in incident if trace.duration_ms == 1650)
    for trace in (typical, slow):
        print_waterfall(trace)
        print("unattributed", unattributed_ms(trace))


if __name__ == "__main__":
    main()`;

const reportCode = `def main() -> None:
    traces = traffic()
    route = "expense-policy"
    baseline = window(traces, 10, route)
    incident = window(traces, 12, route)
    print(
        f"{route} minute=12 n={len(incident)} "
        f"p50={percentile_trace(incident, 50).duration_ms}ms "
        f"p95={percentile_trace(incident, 95).duration_ms}ms"
    )
    print("tail", ", ".join(trace.trace_id for trace in tail_traces(incident)))

    # Compare the same rank across windows, then inspect a second tail trace.
    reference = percentile_trace(baseline, 95)
    for trace in tail_traces(incident):
        print_waterfall(trace)
        print("root deltas", stage_deltas(reference, trace, "rag.answer"))
        print("retrieval deltas", stage_deltas(reference, trace, "rag.retrieve"))
        print("unattributed", unattributed_ms(trace))


if __name__ == "__main__":
    main()`;

const testCode = `from dataclasses import replace

import pytest

from rag_tail_review import (
    Span, covered_ms, fake_trace, percentile_trace, stage_deltas,
    tail_traces, traffic, unattributed_ms, window,
)


def test_rank_and_selection_match_the_dashboard():
    traces = traffic()
    baseline = window(traces, 10, "expense-policy")
    incident = window(traces, 12, "expense-policy")
    assert len(incident) == 20
    for trace in traces:
        by_name = {span.name: span for span in trace.spans}
        for span in trace.spans:
            assert span.start_ms <= span.end_ms
            if span.parent is not None:
                parent = by_name[span.parent]
                assert parent.start_ms <= span.start_ms <= span.end_ms <= parent.end_ms
    assert percentile_trace(incident, 50).duration_ms == 300
    assert percentile_trace(baseline, 95).duration_ms == 450
    assert percentile_trace(incident, 95).trace_id == "m12-19"
    assert [t.trace_id for t in tail_traces(incident)] == ["m12-19", "m12-20"]


def test_ties_share_cutoff_and_use_trace_id_order():
    traces = [fake_trace(12, i, 450) for i in (3, 1, 2)]
    assert percentile_trace(traces, 50).trace_id == "m12-02"
    assert [t.trace_id for t in tail_traces(traces)] == ["m12-01", "m12-02", "m12-03"]


@pytest.mark.parametrize("traces, percent", [([], 95), (traffic(), 0), (traffic(), 101)])
def test_percentile_rejects_missing_data_or_invalid_percent(traces, percent):
    with pytest.raises(ValueError):
        percentile_trace(traces, percent)


def test_overlapping_and_disjoint_intervals():
    spans = [
        Span("c", "root", 30, 40),
        Span("b", "root", 7, 18),
        Span("a", "root", 5, 15),
        Span("nested", "a", 6, 9),
    ]
    assert covered_ms(spans) == 23
    assert covered_ms([]) == 0
    assert unattributed_ms(fake_trace(10, 19, 450)) == 40


def test_retrieval_delta_repeats_across_the_incident_tail():
    traces = traffic()
    baseline = percentile_trace(window(traces, 10, "expense-policy"), 95)
    for slow, delta in zip(tail_traces(window(traces, 12, "expense-policy")), (1200, 1350)):
        assert stage_deltas(baseline, slow, "rag.answer") == [
            ("rag.retrieve", delta), ("policy.check", 0), ("rag.generate", 0)
        ]
        assert stage_deltas(baseline, slow, "rag.retrieve") == [
            ("pool.acquire", delta), ("vector.search", 0)
        ]
        assert unattributed_ms(slow) == 40
        assert (slow.prompt_version, slow.response_model) == (
            baseline.prompt_version, baseline.response_model
        )
        assert (slow.input_tokens, slow.output_tokens) == (420, 38)
        assert slow.citation_present == baseline.citation_present == 1.0


def test_stage_deltas_require_matching_stages():
    baseline = fake_trace(10, 19, 450)
    incomplete = fake_trace(12, 19, 1650)
    incomplete = replace(incomplete, spans=incomplete.spans[:-1])
    with pytest.raises(ValueError, match="stages"):
        stage_deltas(baseline, incomplete, "rag.answer")
    with pytest.raises(ValueError, match="stages"):
        stage_deltas(baseline, incomplete, "missing-parent")`;

export const d136: Lesson = defineLesson({
  day: 136,
  titleTh: "ทบทวน B34 · วินิจฉัยคอขวดของ P95 จาก Trace Waterfall",
  tagline: "30 นาที · จาก alert ของคำขอเบิกค่าเดินทางไปถึงช่วงรอ connection ใน retriever",
  icon: "activity",
  visual: {
    id: "langfuse-trace-waterfall",
    title: "เทียบ Trace ปกติกับ Trace ช้าบนแกนเวลา",
    caption: "สลับ Trace แล้วเทียบ Vector search กับ LLM generation ทั้งตำแหน่งเริ่มและความยาว ตัวเลขในกราฟเป็นชุดสาธิต ส่วนแลบใช้ชุดข้อมูล D135 และแยกเวลารอ connection ออกมา",
    alt: "Waterfall สลับระหว่าง trace ปกติและ trace ช้าเพื่อเปรียบเทียบแถบ Embedding, Vector search, Rerank, LLM generation และ Guardrail",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้เวลาจำลองและ trace ของคำขอสังเคราะห์ใน Python จึงรันได้โดยไม่เข้า Langfuse หรือเรียกโมเดล",
  tools: ["Python 3.12", "uv", "pytest", "OpenTelemetry", "Langfuse"],

  bigPicture: [
    {
      node: 0,
      heading: "ผู้ใช้บางคนรอนานขึ้นทั้งที่คำตอบเหมือนเดิม",
      body: "คำถามของระบบ Thai Knowledge {{rag}} ยังเป็นเรื่องกำหนดยื่นใบเสร็จ เบื้องหลังเลือกเอกสาร expense#03 และตอบภายใน 30 วันเหมือนเดิม แต่กราฟ P95 ของ route expense-policy ขึ้นต่อเนื่องสองนาที",
      lessonNote: "เริ่มด้วยการยืนยันขอบเขตของ alert และตำแหน่งของ P95 ในหน้าต่างที่มีคำขอ 20 รายการ",
    },
    {
      node: 5,
      heading: "ใช้ Metrics หาเหตุการณ์ แล้วตาม ID ไปยังเทรซ",
      body: "ด่านของ D135 แจ้งนาที 12 ให้เปิด trace จากช่วงนั้น โดยดู P50, P95 และจำนวนตัวอย่างคู่กัน ใช้ trace ID จาก structured log ของ D133 เมื่อต้องตรวจเหตุการณ์ที่สัมพันธ์กับคำขอ",
      lessonNote: "เทียบเวลา root ของหลายคำขอ แล้วเลือกตัวอย่างที่อยู่บนหรือเหนือ cutoff เพื่อไม่ต้องเดาจากคำขอเดียว",
    },
    {
      node: 3,
      heading: "ตรวจรุ่นโมเดล โทเค็น และสัญญาณคุณภาพ",
      body: "จาก D134 เปิด generation ใน {{langfuse}} เพื่อตรวจ prompt version และรุ่นโมเดล จากนั้นดู usage ของ D133 และคะแนน citation_present ที่ผูกกับ trace คะแนนนี้ตรวจการมีป้ายอ้างอิงใน fixture",
      lessonNote: "ข้อมูลคงที่เหล่านี้ช่วยจับคู่เทรซสำหรับการเปรียบเทียบ และ regression eval ของ D129 ช่วยตรวจว่าผลปรับยังอิงหลักฐาน",
    },
    {
      node: 4,
      heading: "นำผลวินิจฉัยไปกำหนดขอบเขตของบริการ",
      body: "ใน D137 จะห่อ service ด้วย {{fastapi}} ใช้ lifespan จัดการ client และ connection pool แล้วฉีด service ผ่าน Depends ขั้นจับเวลา pool.acquire ที่เพิ่มวันนี้ช่วยประเมินการรอหลังห่อเป็น API",
      lessonNote: "จาก Thai Knowledge RAG และ Controlled Agent ของ D124 ไปสู่ Evaluated & Guarded AI Microservice v0.5.0 ที่ D156",
    },
  ],

  objectives: [
    "คำนวณ P95 แบบ nearest rank จาก root durations ของ route และนาทีที่ตรงกับ alert พร้อมเลือก trace ที่อยู่บนหรือเหนือ cutoff",
    "เทียบ waterfall สองหน้าต่างด้วย parent, เวลาเริ่ม, เวลาจบ และ delta ของแต่ละช่วง โดยนับช่วงที่ทับกันเพียงครั้งเดียวเมื่อวัด coverage",
    "เขียนข้อสรุปจากหลักฐานหลาย trace และระบุการวัดที่จะช่วยทดสอบสมมติฐานเรื่อง pool wait ก่อนขยายเป็น FastAPI service",
  ],

  prerequisites: [
    "D133 · OpenTelemetry span context, log correlation และ GenAI usage attributes",
    "D134 · อ่าน Langfuse observations, prompt version และ trace score",
    "D135 · P50/P95 แบบ nearest rank, usage coverage และ alert สองหน้าต่างต่อเนื่อง",
    "D124 และ D129 · มีชุดคำถามตรวจผลด้าน retrieval และความสอดคล้องกับหลักฐานไว้เทียบหลังแก้",
  ],

  setup: {
    intro: "สร้างแลบในโฟลเดอร์ใหม่ ใช้ fixture ที่กำหนด offset เป็นมิลลิวินาที ทำให้เทียบผลเทอร์มินัลกับบทเรียนได้ทีละบรรทัด",
    commands: `uv init --python 3.12 b34-d136
cd b34-d136
uv add --dev pytest
uv run python --version`,
    steps: [
      ["recall", "ใช้ 10 นาทีแรกทำ quiz โดยลองหาตำแหน่งของ P95 เองก่อนเปิดคำอธิบาย"],
      ["replay", "ต่อโค้ดตัวอย่างเป็น rag_tail_review.py แล้วรันเพื่อดูเทรซคู่แรก"],
      ["verify", "แทนไฟล์ด้วย starter ใช้ test_rag_tail_review.py ตรวจการเลือก trace และคำนวณ delta"],
    ],
    note: "แบ่งเวลาที่เหลือทำแลบ 15 นาที และอีก 5 นาทีจด incident note สรุปสิ่งที่วัดได้กับสิ่งที่ต้องทดสอบต่อ",
  },

  concepts: [
    {
      id: "select-alert-cohort",
      title: "1 · จาก Alert ไปถึงคำขอที่อยู่ตรง P95",
      paragraphs: [
        "D135 วัดเวลาของ root ที่ route expense-policy หน้าต่างนาที 10, 11 และ 12 แต่ละช่วงมี 20 คำขอ P50 เท่ากับ 300 ms ทุกช่วง ส่วน P95 เท่ากับ 450, 1600 และ 1650 ms ตามลำดับ Alert ออกนาที 12 เพราะนาที 11 และ 12 ต่างเกิน 1200 ms และมีจำนวนตัวอย่างถึงเกณฑ์",
        "Nearest rank ปัด 95 คูณจำนวนคำขอหาร 100 ขึ้นเป็นลำดับแบบเริ่มที่หนึ่ง ยี่สิบคำขอได้ลำดับ 19 ในแลบเรานำระยะ root นี้มาเลือกเทรซบน cutoff และเหนือ cutoff หากหลายรายการใช้เวลาเท่ากันให้เก็บทุกเทรซที่เท่ากับ cutoff ไว้ใน tail",
        "ใน production ใช้ metrics ที่ครอบคลุม request ตามขอบเขตคำนวณ cutoff ต่อให้เปิด trace เพียงบางส่วน หากตัวอย่าง sampled หายไปตรง cutoff ให้รายงานเทรซที่มีอยู่และตรวจ sampling/exporter ก่อนสรุปว่า tail ทั้งหมดเกิดจากสาเหตุเดียวกัน",
      ],
      analogy: "เหมือนใช้เลขคิวจากช่วงที่คลินิกรอนานเพื่อขอดูบันทึกผู้ป่วยที่มาถึงตามช่วงนั้น",
      code: {
        language: "python",
        filename: "rank_position.py",
        code: `durations = sorted([300] * 18 + [1800, 1650])
rank = (95 * len(durations) + 99) // 100
cutoff = durations[rank - 1]
print(rank, cutoff, [ms for ms in durations if ms >= cutoff])
# 19 1650 [1650, 1800]`,
        caption: "Duration ทั้งชุดมาจาก root ของ route เดียวกัน P95 อยู่ที่ลำดับ 19 ส่วนค่า 1800 ms เป็นตัวอย่างอีกคำขอใน tail",
      },
      whyTitle: "เลือกกลุ่มเทียบก่อนเปิด Timeline",
      whyParagraphs: [
        "คำขอช้าที่สุดจากทุก route อาจเป็น leave-policy ซึ่งมี retriever อีกชุด ในแลบมีแถวของ route นี้ในนาที 12 เพื่อให้ลองกรองออกก่อนคำนวณ",
        "ใช้ baseline จาก route เดียวกัน เทียบที่ rank เดียวกัน แล้วตรวจอีกเทรซใน tail เพื่อป้องกันการสรุปจากเหตุการณ์เดียว",
      ],
    },
    {
      id: "read-waterfall-delta",
      title: "2 · อ่านตำแหน่งเริ่มและระยะเวลา แล้วตาม parent ลงทีละชั้น",
      paragraphs: [
        "Root จับเวลาตั้งแต่เข้า rag.answer จนคืนคำตอบ ส่วนลูกตรงของมันคือ rag.retrieve, policy.check และ rag.generate ใน fixture การค้นกับตรวจสิทธิ์ทับกันช่วงแรก และ generation เริ่มหลังงานที่ต้องรอทั้งสองเสร็จ",
        "ที่ baseline generation เริ่มที่ 160 ms และจบที่ 420 ms ที่ incident เริ่มที่ 1360 ms และจบที่ 1620 ms ตำแหน่งเริ่มเลื่อนไป 1200 ms แต่ระยะเวลายังคง 260 ms เมื่อเทียบกับ rag.retrieve ที่ยาวขึ้น 1200 ms จึงเปิดลูกของ retriever ต่อ",
        "ลูกของ retriever แสดง pool.acquire ยาวจาก 140 เป็น 1340 ms ขณะที่ vector.search ยัง 10 ms ช่วงรอได้ connection อธิบาย delta ของคู่นี้ทั้งหมด ส่วนจำนวน connection ที่ไม่พอหรือมี client ตัวใดถือ connection นานยังเป็นสมมติฐานที่ต้องวัดต่อ",
      ],
      analogy: "เหมือนอ่าน waterfall ของหน้าเว็บว่าไทม์ไลน์ของไฟล์เลื่อนไปเพราะรอ dependency ก่อนเริ่มดาวน์โหลด",
      code: {
        language: "python",
        filename: "offset_demo.py",
        code: `baseline = (160, 420)
incident = (1360, 1620)
start_shift = incident[0] - baseline[0]
duration_change = (incident[1] - incident[0]) - (baseline[1] - baseline[0])
print("start shift", start_shift, "duration change", duration_change)
# start shift 1200 duration change 0`,
        caption: "เวลาเริ่มเลื่อนและระยะเวลาที่เปลี่ยนตอบคำถามต่างกัน",
      },
      whyTitle: "แยกเวลาที่วัดได้จากเหตุที่ต้องทดลอง",
      whyParagraphs: [
        "Parent-child คือโครงสร้างของเทรซ การบอกว่างานใดขวาง response ต้องมีข้อมูลการรอของแอปด้วย ใน fixture เรารู้จากการออกแบบว่า generation ต้องรอ retrieval",
        "หาผลรวมความยาวของช่วงที่ลูกตรงครอบคลุมเพียงครั้งเดียว ส่วนต่างจาก root คือเวลาที่ไม่มีลูกตรงใดครอบคลุม ซึ่งอาจอยู่ก่อนหรือหลังงานที่วัดไว้",
      ],
    },
    {
      id: "test-the-hypothesis",
      title: "3 · ใช้ข้อมูล GenAI ควบคุมตัวแปร แล้วออกแบบการตรวจซ้ำ",
      paragraphs: [
        "ใช้ lookup ด้วย trace ID ตาม D133 แล้วเปิด generation ตาม D134 เคสในแลบใช้ prompt version 3, response model mock-thai-mini-2026, โทเค็นเข้า 420 และออก 38 เหมือนกัน D135 กำหนดราคาเดียวกันด้วยชื่อ mock-thai-mini ในตารางสมมติ ยอด known cost จึงคงที่ที่ 0.00286 USD ต่อ 20 คำขอ และคิดราคาได้ครบ 20 จาก 20",
        "ถ้าเจอการรอ pool.acquire ในหลาย tail traces ให้เก็บ histogram ของเวลาขอ connection, จำนวน connection ใช้อยู่ และเวลา server ของ vector search แล้วทดลองกับ workload เดิมพร้อมปรับตัวแปรเดียว เช่น reuse HTTP client ผ่าน lifespan",
        "วัด P95, จำนวนคำขอ, error rate และคุณภาพก่อนหลัง ใช้ชุด eval เดิมตรวจความถูกต้องของข้ออ้างจาก expense#03 เพราะ citation_present ตรวจเพียงว่ามีป้ายอ้างอิงอยู่ในคำตอบ",
      ],
      analogy: "เหมือนทดสอบคิวจุดรับรถด้วยจำนวนลูกค้าเดิม แล้วตรวจทั้งเวลารอและความถูกต้องของรายการที่ส่งมอบ",
      code: {
        language: "python",
        filename: "control_check.py",
        code: `from rag_tail_review import fake_trace

baseline = fake_trace(10, 19, 450)
incident = fake_trace(12, 19, 1650)
for trace in (baseline, incident):
    print(trace.prompt_version, trace.response_model,
          trace.input_tokens, trace.output_tokens, trace.citation_present)`,
        caption: "รันหลังประกอบไฟล์ตัวอย่างเพื่อยืนยัน metadata ที่ fixture กำหนดเหมือนกัน",
      },
      whyTitle: "วัดทั้งการฟื้นตัวและความถูกต้อง",
      whyParagraphs: [
        "ถ้าทำให้คำขอล้มเหลวเร็วขึ้น P95 อาจดูดีขึ้น ให้เทียบ error rate และตรวจผลลัพธ์ด้วย",
        "D137 ใช้ lifespan เปิดและปิด client และ Depends รับ service การสลับ fake ในเทสต์ช่วยเก็บเงื่อนไขเดิมไว้ขณะปรับวิธีจัดการทรัพยากร",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · จาก Network Waterfall ไปถึง Span ใน API",
      body: [
        "DevTools แยกเวลา queued หรือ waiting ของ HTTP request ส่วนเทรซของแอปเปิดให้เห็นว่าขั้นค้นข้อมูลแยกเป็นเวลาขอ connection กับเวลาค้นบน server",
        "ใน D137 ใช้ POST /v1/query เป็นขอบเขต HTTP แล้วให้ rag.answer เป็นงานภายใน หากต้องวัดประสบการณ์ทั้งเส้นทาง ให้ใช้เวลา HTTP request เป็น metric และยังเก็บระยะของ rag.answer สำหรับแยกเวลาใน service",
      ],
      table: [
        ["Network request bar", "ระยะ root ของขอบเขตคำขอที่วัด"],
        ["Queued หรือ Stalled", "สมมติฐานเรื่องเวลารอก่อนงานเริ่ม ตรวจด้วย span เฉพาะ"],
        ["Request complete", "HTTP response กลับถึง client ตามขอบเขตที่เครื่องมือวัด"],
      ],
    },
    student: {
      title: "First-Year Note · อ่านช่วงเวลาเหมือนช่วงบนเส้นจำนวน",
      body: [
        "ช่วง 10 ถึง 160 ยาว 150 และช่วง 10 ถึง 20 อยู่ข้างในทั้งหมด เมื่อนับว่าลูกทั้งสองครอบคลุมเวลากี่มิลลิวินาที ใช้ 150 เพราะช่วงที่ซ้อนกันถูกนับไปแล้ว",
        "จากนั้นช่วง 160 ถึง 420 ต่อกันพอดี จึงได้ช่วงครอบคลุม 10 ถึง 420 ยาว 410 จาก root 450 เหลือช่วงก่อนเริ่ม 10 และหลังจบ 30 รวม 40 ms",
      ],
    },
  },

  workedExample: {
    intro: "คำถามคือ ต้องยื่นใบเสร็จค่าเดินทางภายในกี่วัน คำตอบจาก expense#03 คือ 30 วัน ให้ต่อโค้ดทั้งสามขั้นลงใน rag_tail_review.py เพื่อสืบว่าทำไมคำขอแบบเดียวกันรอนานขึ้นในนาทีที่ alert ดัง",
    steps: [
      {
        title: "1 · สร้าง Trace Fixture ที่วัดได้ซ้ำ",
        explain: "ฝังผล D135 ลงในสามหน้าต่าง สร้างหนึ่ง trace ต่อคำขอและให้ parent ของ pool.acquire กับ vector.search เป็น rag.retrieve ทุกช่วงเวลาเป็น offset จาก root ชื่อ span ใน fixture ไม่ซ้ำภายในเทรซ จึงใช้ชื่อแทน span ID สำหรับฝึกอ่านได้",
        code: { language: "python", filename: "rag_tail_review.py", code: fixtureCode },
      },
      {
        title: "2 · วาดต้นไม้และรวมช่วงเวลาแบบไม่นับซ้ำ",
        explain: "เดินจาก root ตาม parent เพื่อเยื้องแถว เรียงช่วงของลูกตรงตามเวลาเริ่ม แล้วสะสมเฉพาะส่วนที่ยังไม่ถูกครอบคลุม policy.check ทับ rag.retrieve จึงไม่เพิ่ม coverage ส่วน pool.acquire กับ vector.search อยู่ในชั้นลูกของ retriever",
        code: { language: "python", filename: "rag_tail_review.py", code: timingCode },
      },
      {
        title: "3 · เปิดเทรซที่ตำแหน่ง P95 ของสองหน้าต่าง",
        explain: "ใช้ค่า 450 และ 1650 ms ที่ทราบจาก D135 หา m10-19 และ m12-19 เทียบทีละระดับ จะเห็นว่าการค้นเริ่มเวลาเดิมและใช้เวลาขอ connection เพิ่ม 1200 ms การ forward เวลานี้ไปยัง generation ทำให้เริ่มช้าลงเท่ากัน",
        code: { language: "python", filename: "rag_tail_review.py", code: demoCode },
        output: `trace=m10-19
rag.answer [0, 450) 450ms
  rag.retrieve [10, 160) 150ms
    pool.acquire [10, 150) 140ms
    vector.search [150, 160) 10ms
  policy.check [10, 20) 10ms
  rag.generate [160, 420) 260ms
unattributed 40
trace=m12-19
rag.answer [0, 1650) 1650ms
  rag.retrieve [10, 1360) 1350ms
    pool.acquire [10, 1350) 1340ms
    vector.search [1350, 1360) 10ms
  policy.check [10, 20) 10ms
  rag.generate [1360, 1620) 260ms
unattributed 40`,
      },
    ],
    gotcha: "Fixture วัดช่วงรอ connection โดยตรง ในระบบจริงแถว retrieval กว้างอย่างเดียวระบุเวลารอ pool ไม่ได้ ต้องเพิ่ม span แยกแล้วตรวจความสอดคล้องจากหลายคำขอ",
  },

  practice: {
    intro: "สร้างรายงาน incident แบบสั้นในเทอร์มินัล ใช้ rank คำนวณจากทุก request ในหน้าต่าง แล้วเทียบ baseline กับ tail สองตัวอย่างโดยไม่ hard-code trace ID หรือค่าจากแดชบอร์ด",
    requirements: [
      "เขียน percentile_trace ให้รับเทรซจากหน้าต่างเดียว เรียงด้วย duration และ trace ID จากนั้นคืนแถวตาม nearest rank ปฏิเสธลิสต์ว่างหรือ percent นอก 1 ถึง 100",
      "เขียน tail_traces ให้คืนทุกเทรซที่ duration ตั้งแต่ P95 ขึ้นไป รวมกรณีค่าเท่ากัน และเรียงผลให้คงที่ด้วย duration กับ trace ID",
      "เขียน stage_deltas ให้เทียบเฉพาะลูกตรงของ parent ชื่อเดียวกันในสองเทรซ คงลำดับของ baseline และ raise ValueError หากชุดชื่อไม่ตรงกันหรือไม่มี stages",
      "ใช้ fixture ที่ให้มา กรอง route และ minute ก่อนคำนวณ เขียน incident note ระบุช่วงที่เพิ่มในสอง tail traces, สมมติฐานที่ยังต้องตรวจ และตัวชี้วัดก่อนหลัง",
    ],
    starter: {
      language: "python",
      filename: "rag_tail_review.py",
      code: `${fixtureCode}


${timingCode}


def percentile_trace(traces: list[Trace], percent: int) -> Trace:
    # TODO: validate, sort by duration then ID, and use nearest rank.
    raise NotImplementedError


def tail_traces(traces: list[Trace]) -> list[Trace]:
    # TODO: include all durations at or above the P95 cutoff.
    raise NotImplementedError


def stage_deltas(
    baseline: Trace, incident: Trace, parent: str
) -> list[tuple[str, int]]:
    # TODO: compare direct children with matching stage names.
    raise NotImplementedError


${reportCode}`,
    },
    verification: { language: "python", filename: "test_rag_tail_review.py", code: testCode },
    selfCheck: [
      "บรรทัดแรกมี minute=12, n=20, p50=300ms และ p95=1650ms เลือก tail m12-19 กับ m12-20 โดยไม่ได้เอา leave-policy มาปน",
      "rag.retrieve เพิ่ม 1200 และ 1350 ms ตามลำดับ ตรงกับ delta ของ pool.acquire และ rag.generate กับ vector.search มี delta เป็นศูนย์ทั้งสองเทรซ",
      "รายงาน unattributed 40 ms เท่าเดิมแม้ policy.check วางซ้อนบน retrieval",
      "เขียนสรุปให้คนอ่านรู้ว่าพบรอ connection ที่จุดใด และต้องวัด pool utilization, เวลาขอ connection และ error rate เพื่อทดสอบว่า pool อิ่มจริงหรือไม่",
    ],
    acceptance: "pytest ผ่าน 8 เคส และรายงานแยกช่วงรอ connection ออกจากเวลาค้น พร้อม incident note ระบุหลักฐานและการตรวจซ้ำ",
    hints: [
      { body: "หา P95 จาก duration ของ root ใน route และนาทีของ alert ใช้ค่า cutoff ที่ได้เพื่อเลือกทั้งรายการที่เท่ากับ cutoff และรายการที่ช้ากว่า" },
      { body: "ใช้ children เดิมสองครั้งเพื่อสร้าง dict ของ name ไป duration แยกตาม baseline กับ incident คำนวณ incident ลบ baseline ในลำดับคีย์ของ baseline แล้วเรียกซ้ำที่ parent rag.retrieve" },
      {
        body: "คัดลอกส่วนแรกเป็น rag_tail_review.py และส่วนหลังเป็น test_rag_tail_review.py รายงานที่ได้ควรระบุว่า m12-19 และ m12-20 รอ connection เพิ่ม 1200 และ 1350 ms เมื่อเทียบกับ m10-19 ตามลำดับ ส่วน vector.search และ generation ใช้เวลาเดิม ขั้นต่อไปคือวัด pool utilization แล้วทดสอบการใช้ client ซ้ำกับโหลดเดิมพร้อมตรวจ P95, error rate และ eval",
        code: {
          language: "python",
          filename: "rag_tail_review.py + test_rag_tail_review.py",
          code: `# rag_tail_review.py
${fixtureCode}


${timingCode}


def percentile_trace(traces: list[Trace], percent: int) -> Trace:
    if not traces or not 1 <= percent <= 100:
        raise ValueError("expected traces and a percentile from 1 to 100")
    ordered = sorted(traces, key=lambda trace: (trace.duration_ms, trace.trace_id))
    rank = (percent * len(ordered) + 99) // 100
    return ordered[rank - 1]


def tail_traces(traces: list[Trace]) -> list[Trace]:
    cutoff = percentile_trace(traces, 95).duration_ms
    return sorted(
        (trace for trace in traces if trace.duration_ms >= cutoff),
        key=lambda trace: (trace.duration_ms, trace.trace_id),
    )


def stage_deltas(
    baseline: Trace, incident: Trace, parent: str
) -> list[tuple[str, int]]:
    before = {span.name: span.duration_ms for span in children(baseline, parent)}
    after = {span.name: span.duration_ms for span in children(incident, parent)}
    if not before or before.keys() != after.keys():
        raise ValueError("expected matching stages")
    return [(name, after[name] - duration) for name, duration in before.items()]


${reportCode}

# test_rag_tail_review.py — copy the block below into its own file
${testCode}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run python rag_tail_review.py
uv run pytest -q`,
    },
  },

  mistakes: [
    {
      title: "ใช้ trace ที่ช้าที่สุดรวมทุก route แทน cutoff ของ alert",
      symptom: "ได้ trace 2400 ms ของ leave-policy และทีมแก้คนละเส้นทาง",
      fix: "กรอง route และ window ก่อนหา nearest rank เก็บจำนวนตัวอย่างไว้ในรายงาน และตรวจเทรซบนหรือเหนือ cutoff ของชุดนั้น",
    },
    {
      title: "อ่านว่า generation ช้าเพราะแถบอยู่เยื้องไปทางขวา",
      symptom: "ถูกเสนอให้เปลี่ยนโมเดลทั้งที่ระยะโมเดลยัง 260 ms",
      fix: "ลบเวลาเริ่มจากเวลาจบเพื่อเทียบ duration แล้วตาม parent และ dependency ที่ทำให้แถบเริ่มช้า",
    },
    {
      title: "บวก parent ลูก และช่วงขนานทีละแถว",
      symptom: "เวลารวมที่คำนวณเกินระยะ root และหาเวลานอกสแปนไม่ได้",
      fix: "ใช้ root เป็นเวลาคำขอ รวมช่วงทับกันของลูกตรงก่อนวัด coverage แล้วค่อยซูมเข้า parent หนึ่งตัวเพื่ออ่านลูกของมัน",
    },
    {
      title: "สรุปว่าการเพิ่มขนาด pool จะแก้ทุกเคสทันที",
      symptom: "มีตัวอย่าง pool.acquire ยาว แต่ไม่มีข้อมูลจำนวน connection ใช้อยู่หรือผลทดลองภายใต้โหลดเดิม",
      fix: "บันทึก pool wait และ utilization เทียบหลาย tail traces แล้วทดสอบการเปลี่ยนตัวแปรเดียวพร้อม P95, error rate และ eval เดิม",
    },
  ],

  quiz: {
    intro: "ทวน D133–D135 ก่อนลงมือ ลองเขียนเหตุผลสั้น ๆ ว่าจะใช้ข้อมูลอะไรตรวจคำตอบของแต่ละข้อ",
    questions: [
      mc(
        "d136-q1",
        "Alert ดังนาที 12 สำหรับ expense-policy มี 20 คำขอเรียงแล้ว สองตัวท้ายคือ 1650 กับ 1800 ms ควรเปิดตัวอย่างไหน?",
        [
          ["เฉพาะตัวที่ 20", "เห็นค่าสูงสุด แต่พลาดคำขอตรง cutoff"],
          ["ตัวที่ 19 และ 20 ในหน้าต่างเดียวกัน", "ลำดับ 19 ตรง P95 และตัวที่ 20 ช่วยตรวจว่าช่วงรอเกิดซ้ำหรือไม่"],
          ["ตัวที่ 10 และ 11 เท่านั้น", "ได้กลุ่มกลาง แต่ยังไม่เห็นอาการใน tail"],
          ["ทุกคำขอที่นานที่สุดของทุก route", "ปนภาระงานและเส้นทางอื่นที่ alert นี้ไม่ได้วัด"],
        ],
        "B",
        "Nearest rank ของ P95 เมื่อ n เท่ากับ 20 คือ 19 ใช้เทรซตรง cutoff กับเทรซช้ากว่าแล้วเทียบกับ baseline ที่ตรงกัน",
        "เริ่มจาก trace ไหนหลัง P95 alert?",
        "กรองนาทีและ route ของ alert แล้วเปิดตัวอย่างที่อยู่บนหรือเหนือ cutoff",
      ),
      mc(
        "d136-q2",
        "Structured log rag_answered อ้างถึง root และต้องการเปิด generation ของคำขอเดียวกัน ควรเชื่อมด้วยอะไร?",
        [
          ["prompt version เพียงอย่างเดียว", "หลายคำขอใช้ prompt version เดียวกันได้"],
          ["ชื่อ rag.generate แบบเต็ม", "ชื่อ span บอกงาน แต่ถูกใช้ซ้ำข้ามคำขอ"],
          ["trace ID แล้วหา generation ในต้นไม้ของเทรซ", "trace ID รวมงานของคำขอเดียวกัน และ parent เชื่อมตำแหน่งภายใน"],
          ["span ID ของ root เป็น ID ของ generation", "สแปนแต่ละช่วงมี span ID ของตัวเอง"],
        ],
        "C",
        "D133 ใช้ trace ID เชื่อม log ไปถึงเทรซ แล้วใช้ชื่อ span และ parent ID จากเทรซเพื่อชี้แถว generation",
        "Trace ID กับ span ID ใช้ต่างกันอย่างไร?",
        "Trace ID เชื่อมทั้งเทรซ ส่วน span ID ชี้งานย่อยหนึ่งช่วง",
      ),
      mc(
        "d136-q3",
        "Generation เลื่อนเวลาเริ่มจาก 160 เป็น 1360 ms แต่ยาว 260 ms เหมือนเดิม ขณะที่ pool.acquire ยาวขึ้น 1200 ms เห็นอะไร?",
        [
          ["ในสองเทรซนี้เวลาเพิ่มอยู่ในขั้นขอ connection", "เท่ากับ delta ของ retrieval และระยะการโทรโมเดลคงเดิม"],
          ["โมเดลช้าลง 1200 ms", "นั่นคือผลต่างเวลาเริ่ม ไม่ใช่ผลต่างของ duration"],
          ["ต้องบวก pool.acquire ซ้ำกับ rag.retrieve", "ช่วง acquire อยู่ภายใน retriever จึงจะนับเวลาซ้ำ"],
          ["สรุปได้ทันทีว่า pool เล็กเกินไป", "ยังต้องวัดจำนวน connection ใช้อยู่และทดสอบภายใต้โหลดเดิม"],
        ],
        "A",
        "เปรียบเทียบ start offset และ duration แยกกัน ใน fixture generation จะเริ่มหลัง retrieval เสร็จ",
        "แถบขยับไปทางขวาหมายถึงอะไร?",
        "เริ่มช้าลงจากจุดอ้างอิง ต้องดูความยาวแถบจึงรู้ว่าขั้นนั้นใช้เวลามากขึ้นหรือไม่",
      ),
      mc(
        "d136-q4",
        "หลังทดลอง reuse client ใน FastAPI ควรเก็บหลักฐานอะไรเพื่อดูว่าการแก้มีผล?",
        [
          ["คะแนน citation_present อย่างเดียว", "คะแนนนี้วัดการมีป้ายอ้างอิงและไม่บอก latency"],
          ["ค่าขาออก token อย่างเดียว", "จำนวน token คงที่ได้แม้เวลารอเปลี่ยน"],
          ["เวลาเร็วที่สุดหนึ่งคำขอ", "ไม่สะท้อนผู้ใช้ช่วงท้ายหรือสัดส่วนคำขอล้มเหลว"],
          ["Pool wait, P95, ปริมาณคำขอ, error rate และ eval เดิม", "ตรวจทั้งเวลาของขั้นที่สงสัย ผลต่อผู้ใช้ และคุณภาพคำตอบ"],
        ],
        "D",
        "เทียบ workload และรุ่นที่สอดคล้องกัน เก็บสัญญาณระบบและคุณภาพไว้คู่กันเพื่อแยกผลปรับออกจากการเปลี่ยน traffic",
        "สัญญาณอะไรช่วยยืนยันการฟื้นตัวของ tail?",
        "Pool wait และ P95 ลดลงในโหลดที่เทียบกันได้ โดยตรวจ error rate และ eval ควบคู่",
      ),
    ],
  },

  takeaways: [
    "ใช้ metrics ระบุขอบเขตของ alert และหา cutoff จาก root durations ก่อนเลือก trace มาอ่าน",
    "ตาม trace ID จาก log แล้วเทียบช่วงที่อยู่บนเส้นทางรอจริง แยกระยะของ span ออกจากตำแหน่งที่เริ่มบนแกนเวลา",
    "ในแลบ pool.acquire อธิบายเวลาที่เพิ่มในสอง tail traces ได้ ส่วนสภาพของ pool ต้องตรวจจาก utilization และผลทดลอง",
    "D137 จะจัด lifecycle ของ AsyncClient และส่ง service ผ่าน Depends เพื่อให้ทดสอบการใช้ทรัพยากรซ้ำได้",
  ],
  reviewCards: [
    rc("d136-r1", "P95 แบบ nearest rank ของ 20 รายการคือ index ใด?", "ลำดับ 19 แบบเริ่มหนึ่ง หรือ index 18 แบบเริ่มศูนย์"),
    rc("d136-r2", "ทำไม root 450 ms จึงมีเวลา unattributed 40 ms?", "ลูกตรงครอบคลุมช่วง 10 ถึง 420 รวม 410 ms โดยนับ policy.check ที่ทับอยู่เพียงครั้งเดียว"),
    rc("d136-r3", "Model span เริ่มช้าลงแต่ duration เท่าเดิม ควรเปิดอะไรต่อ?", "ดู dependency ก่อนหน้าและวัดช่วงรอของมัน ในแลบเปิด rag.retrieve และลูก pool.acquire"),
    rc("d136-r4", "จะพิสูจน์ว่าการแก้ pool ช่วยผู้ใช้จริงอย่างไร?", "วัด pool wait และ P95 ก่อนหลังบน workload เดียวกัน ตรวจ error rate และผล eval คู่กัน"),
  ],
  sources: [
    { label: "OpenTelemetry · Traces, Spans & Context", href: "https://opentelemetry.io/docs/concepts/signals/traces/" },
    { label: "Langfuse · Core Concepts", href: "https://langfuse.com/docs/observability/data-model" },
    { label: "Prometheus · Histograms and Summaries", href: "https://prometheus.io/docs/practices/histograms/" },
    { label: "FastAPI · Lifespan Events", href: "https://fastapi.tiangolo.com/advanced/events/" },
  ],
  glossary: ["otel", "langfuse", "rag", "ttft", "fastapi"],
});
