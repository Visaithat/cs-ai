import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/** Day 133 · Phase 5 · Block B34 */
export const d133: Lesson = defineLesson({
  day: 133,
  titleTh: "มองเห็นระบบ RAG ด้วย OpenTelemetry และ GenAI Semantic Conventions",
  tagline: "30 นาที · ตามคำขอภาษาไทยจาก log ไปถึง trace และตรวจ token ที่ span ของโมเดล",
  icon: "activity",
  visual: {
    id: "otel-genai-spans",
    title: "OpenTelemetry Trace และ GenAI Spans",
    caption: "เริ่มจาก rag.answer แล้วตาม parent ID ไปที่ rag.retrieve และ chat เปรียบเทียบ attribute ของการค้นคืนกับการเรียกโมเดล",
    alt: "ต้นไม้ของ trace หนึ่งคำขอ มี root span ของระบบ RAG และ child spans ของ retrieval และ LLM ที่ใช้ trace ID ร่วมกัน",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ fake LLM กับ InMemorySpanExporter บนเครื่องทั้งหมด ไม่ต้องตั้ง API key หรือ Collector",
  tools: ["Python 3.12","uv","OpenTelemetry Python SDK","structlog","Pydantic v2","pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "จากผล CI สู่คำขอจริง",
      body: "CI ของ B33 ตรวจเคสที่เรารู้คำตอบล่วงหน้า แต่หลังปล่อย v0.4.0 ผู้ใช้ถามเรื่องค่าเดินทางเป็นภาษาไทยแล้วรายงานว่าหน้าค้าง คะแนน eval ไม่บอกว่าคำขอนั้นติดตรงไหน",
      lessonNote: "ใช้หลักฐานจากคำขอเดียวก่อนตั้งสมมติฐานเกี่ยวกับ retrieval หรือโมเดล",
    },
    {
      node: 4,
      heading: "แบ่งงานให้เห็นขอบเขต",
      body: "Thai Knowledge RAG มีขั้นรับคำขอ ดึงหลักฐาน และเรียกโมเดล เราครอบกลุ่มงานไว้ใน root span แล้วให้แต่ละขั้นมีเวลาเริ่มและจบของตัวเอง",
      lessonNote: "ให้ชื่อ span คงที่เพื่อเทียบข้ามคำขอและ release",
    },
    {
      node: 5,
      heading: "เชื่อมสัญญาณด้วย trace ID",
      body: "ใช้ {{structlog}} บันทึกเหตุการณ์แบบมีฟิลด์ แล้วแนบ trace ID จาก context ของ {{otel}} เวลาค้นเจอ log จึงย้อนกลับไปเปิด timeline ของคำขอเดียวกันได้",
      lessonNote: "Token เป็น attribute ของ generation ส่วน dashboard จะรวมข้อมูลหลายคำขอใน D135",
    },
    {
      node: 6,
      heading: "พกข้อมูลพอวิเคราะห์",
      body: "เก็บชื่อรุ่นโมเดล จำนวน token และจำนวนเอกสาร ข้อมูลเหล่านี้พอตั้งคำถามแรก เช่น คำขอนี้ส่ง context ใหญ่ไปหรือไม่",
      lessonNote: "ปลาย Phase 5 เราจะรวมวิธีวัดนี้ใน Evaluated & Guarded AI Microservice v0.5.0",
    },
  ],

  objectives: [
    "จำแนก logs, metrics และ traces จากคำถามที่ทีมต้องตอบใน production",
    "สร้าง root และ child spans ด้วย OpenTelemetry Python SDK และยืนยัน parent ID จาก exporter",
    "ติด GenAI attributes และเชื่อม structured log กับ trace โดยคงข้อมูลดิบไว้ในแอป",
  ],

  prerequisites: [
    "D6 · Error Handling และ structlog สำหรับ structured logs",
    "D73 และ D75 · เรียก LLM API และรู้จัก token usage กับ TTFT",
    "D121–D124 · โครง Thai Knowledge RAG และ D129–D132 · eval gate ใน CI",
  ],

  setup: {
    intro: "สร้างแลบ Python แยกเพื่อวัดเส้นทางคำถามนโยบายเบิกค่าเดินทางด้วยข้อมูลสังเคราะห์",
    commands: `uv init --python 3.12 b34-d133
cd b34-d133
uv add opentelemetry-sdk structlog pydantic
uv add --dev pytest
uv run python --version`,
    steps: [
      ["python", "ตรวจว่า Python เป็นรุ่น 3.12"],
      ["deps", "ติดตั้ง opentelemetry-sdk, structlog, pydantic และ pytest สำเร็จ"],
      ["files", "เตรียม rag_telemetry.py และ test_rag_telemetry.py ตามขั้นตอนของบทเรียน"],
    ],
    note: "รันตัวอย่างสามขั้นก่อน แล้วแทนไฟล์ด้วย starter เพื่อเติม error.type ในแบบฝึกหัดใหม่ ทุกครั้งที่รันจะสร้าง provider แยก จึงตรวจข้อมูลในหน่วยความจำซ้ำได้",
  },

  concepts: [
    {
      id: "three-signals",
      title: "1 · Logs, Metrics และ Traces ตอบคำถามคนละระดับ",
      paragraphs: [
        "ถ้าทีมถามว่าเกิดอะไรขึ้นตอนจบคำขอ ให้หา log event เช่น rag_answered พร้อม route และ trace ID ถ้าถามว่าทั้งชั่วโมงมีคำขอช้าแค่ไหน ให้ดู histogram และจำนวนคำขอ ถ้าถามว่าคำขอหนึ่งรอ retrieval หรือโมเดล ให้เปิด trace ของคำขอนั้น",
        "Trace ID เป็นคีย์สำหรับเชื่อม log กับ trace ส่วน span ID ชี้ operation ที่กำลังทำงานอยู่ตอน emit event ใช้ฟิลด์ชื่อคงที่กับ structured logging และบันทึกเลข ID เป็น hex แบบเติมศูนย์ให้ครบ 32 และ 16 หลักตามลำดับ",
        "การเก็บ logs, metrics และ traces อาจใช้ backend คนละตัว ตกลงชื่อ service และ environment ให้เหมือนกัน เพื่อเลือกชุดข้อมูลเดียวกันตอนสืบเหตุ",
      ],
      analogy: "เหมือนดูรายการพัสดุทีละเหตุการณ์ ดูสถิติเวลาส่งทั้งวัน แล้วเปิดแผนการเดินทางของกล่องตัวอย่างเพื่อดูว่าค้างที่ศูนย์ไหน",
      bullets: [
        "Log event มีรายละเอียดเฉพาะจังหวะ เช่น retrieval ได้หลักฐานกี่ชิ้น โดยใช้ route จากรายการค่าที่ระบบกำหนด",
        "Metric ใช้ label จำนวนจำกัด เช่น route และสถานะ ผลรวมที่แบ่งตาม trace ID จะสร้าง series ใหม่ทุกคำขอ",
        "Trace ใช้ ID รายคำขอและเก็บเวลาของส่วนย่อย จึงเชื่อมไปยัง log ได้แม้ service ทำงานพร้อมกันหลายคำขอ",
      ],
      code: {
        language: "python",
        filename: "correlate_log.py",
        code: `from opentelemetry import trace
from structlog import get_logger

context = trace.get_current_span().get_span_context()
fields = {"route": "expense-policy", "retrieval_hits": 1}
if context.is_valid:
    fields["trace_id"] = f"{context.trace_id:032x}"
    fields["span_id"] = f"{context.span_id:016x}"
get_logger().info("rag_retrieval_finished", **fields)`,
        caption: "เรียกโค้ดนี้ใน span ที่ active เพื่อให้ log มี context หรือรันเดี่ยวเพื่อเห็น event ที่ยังไม่มี ID",
      },
      whyTitle: "ค้นให้เจอก่อนอ่านรายละเอียด",
      whyParagraphs: [
        "Alert จาก metrics ช่วยเลือกช่วงเวลาได้เร็ว หลังจากนั้น trace ตัวอย่างช่วยระบุช่วงที่ควรวัดละเอียดขึ้น",
        "ถ้า trace ถูก sampling ทิ้ง log อาจมี ID โดยไม่มี trace ใน backend ตรวจอัตรา sampling และสถานะ exporter ก่อนสรุปว่าขั้นนั้นหายไป",
      ],
    },
    {
      id: "span-tree",
      title: "2 · Trace, Span และ Context Propagation",
      paragraphs: [
        "Span คือหนึ่งช่วงงานที่มีเวลาเริ่มและจบ ชื่อ ค่าประกอบ และสถานะ เมื่อเปิด child ด้วย start_as_current_span ภายใน context manager ของ root ตัว SDK จะบันทึก parent span ID และใช้ trace ID เดียวกันให้อัตโนมัติ",
        "Context manager จบ span เมื่อออกจากบล็อก และบันทึก exception ที่หลุดออกไปตามค่าเริ่มต้น ตัว exporter แบบ in-memory รับเฉพาะ span ที่จบแล้ว จึงมักเห็น child มาก่อน root ในลำดับที่ export",
        "ถ้า retrieval แยก process ต้อง inject context ไปกับ request แล้ว extract กลับมาที่ปลายทาง ใช้ W3C Trace Context ผ่าน propagator และให้ transport/instrumentation รับหน้าที่นี้เมื่อเชื่อมระบบจริง",
      ],
      analogy: "เหมือน Chrome DevTools แสดงว่า request อยู่ช่วงใดของการโหลดหน้า ใน distributed trace เรามีหลักฐาน parent-child ข้าม service ด้วย",
      bullets: [
        "TracerProvider เป็นเจ้าของ resource และ processor ส่วน tracer แทนชื่อโมดูลที่สร้าง span",
        "SimpleSpanProcessor ส่ง span ให้ exporter ตอนจบ เหมาะกับแลบขนาดเล็ก ใน service จริงมักใช้ BatchSpanProcessor เพื่อลดงานใน request path",
        "ชื่อ span ควรอธิบายงาน เช่น rag.retrieve ใช้ ID เพื่อหาคำขอ แทนการเอาคำถามมาเป็นชื่อ",
      ],
      code: {
        language: "python",
        filename: "propagate.py",
        code: `from opentelemetry import context, propagate
from opentelemetry.sdk.trace import TracerProvider

provider = TracerProvider()
tracer = provider.get_tracer("neural_path.propagation")
carrier: dict[str, str] = {}

with tracer.start_as_current_span("caller") as caller:
    propagate.inject(carrier)
    caller_context = caller.get_span_context()

received = propagate.extract(carrier, context=context.Context())
with tracer.start_as_current_span("receiver", context=received) as receiver:
    assert receiver.parent.span_id == caller_context.span_id
    assert receiver.get_span_context().trace_id == caller_context.trace_id

provider.shutdown()`,
        caption: "ส่ง context ผ่าน dict แทน HTTP header เพื่อดูการเชื่อม parent ข้ามขอบเขตการทำงาน",
      },
      whyTitle: "ตรวจโครงต้นไม้ด้วย IDs",
      whyParagraphs: [
        "การตั้งชื่อเหมือนกันบอกได้แค่ว่า operation ทำงานชนิดเดียวกัน parent ID จึงเป็นหลักฐานสำหรับเชื่อมลำดับ",
        "เมื่ออ่านเวลารวม ใช้ระยะ root เป็นเวลาของ request และใช้เวลา child เพื่อหาองค์ประกอบ ถ้า child ซ้อนเวลา การบวกจะนับบางช่วงซ้ำ",
      ],
    },
    {
      id: "semconv-genai",
      title: "3 · GenAI Semantic Conventions และข้อมูลที่ควรเก็บ",
      paragraphs: [
        "Semantic Conventions คือข้อตกลงเรื่องชื่อและชนิดของข้อมูล ตัวอย่างเรียกแชตใช้ gen_ai.operation.name เป็น chat, gen_ai.provider.name ระบุ provider และ gen_ai.request.model ระบุรุ่นที่ขอ SDK ของผู้ให้บริการอาจคืน gen_ai.response.model เป็นรุ่นที่ตอบจริง ซึ่งอาจละเอียดกว่าชื่อ alias ที่ส่งไป",
        "Token usage ใช้ gen_ai.usage.input_tokens และ gen_ai.usage.output_tokens เป็นจำนวนเต็มจาก provider ถ้านับไม่ได้ให้ละ attribute ไว้ การเติมศูนย์จะทำให้แยกเหตุการณ์ที่ไม่มีค่าออกจากค่าศูนย์จริงไม่ได้",
        "GenAI conventions ยังมีส่วนที่สถานะ Development ชุดเดิมบางรุ่นใช้ gen_ai.system ตรวจชุด convention ของ instrumentation ก่อนสร้าง dashboard ส่วนฟิลด์อย่าง app.retrieval.hit_count เป็นข้อตกลงของแอปเอง",
      ],
      analogy: "เหมือน API contract ระหว่างคนส่ง telemetry กับคนอ่านแดชบอร์ด ฝั่งหนึ่งเปลี่ยนชื่อโดยไม่มีการย้ายข้อมูล อีกฝั่งอาจแสดงเป็นกราฟว่าง",
      bullets: [
        "ใช้ gen_ai.provider.name และ gen_ai.operation.name ตอนเริ่ม span เพราะ sampler อาจตัดสินใจก่อนจบงาน",
        "Prompt, messages และ output อาจมีข้อมูลบุคคลหรือข้อมูลภายใน ออกแบบให้บันทึกเฉพาะ metadata ที่อนุญาตเป็นค่าเริ่มต้น",
        "จาก D66 ภาษาไทยและอังกฤษอาจใช้ token ต่างกันแม้ความยาวใกล้กัน จึงใช้ usage ที่รายงานจริงสำหรับต้นทุนใน D135",
      ],
      code: {
        language: "python",
        filename: "usage_attributes.py",
        code: `from pydantic import BaseModel, Field


class Usage(BaseModel):
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)

    def attributes(self) -> dict[str, int]:
        return {
            "gen_ai.usage.input_tokens": self.input_tokens,
            "gen_ai.usage.output_tokens": self.output_tokens,
        }


usage = Usage(input_tokens=420, output_tokens=38)
print(usage.attributes())`,
        caption: "ตรวจชนิดและค่าของ usage ก่อนแปลงเป็น span attributes",
      },
      whyTitle: "เทียบรุ่นโมเดลและต้นทุนได้เมื่อฟิลด์สม่ำเสมอ",
      whyParagraphs: [
        "การแยกรุ่นที่ขอและรุ่นที่ตอบช่วยตรวจ alias ที่เปลี่ยนหลัง release โดยมีหลักฐานจากคำขอจริง",
        "ข้อมูลด้านเวลาหรือ token อาจเพียงพอสำหรับหาสาเหตุเบื้องต้น เลือกเฉพาะข้อมูลที่จำเป็นก่อนส่งออก backend",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — จาก Console และ Network ไปถึง APM",
      body: [
        "ใน Chrome DevTools ให้คลิก request แล้วอ่าน Timing ในแอปหลาย service ใช้ APM อย่าง Sentry หรือ Datadog ไล่ต่อจาก API ไปยัง retriever และ model provider",
      ],
      table: [
        ["Structured log","Console event ที่มี fields สำหรับค้น"],
        ["Latency histogram","กราฟเวลาโหลดของหลายคำขอ"],
        ["Root span","ช่วงเวลา request ขาเข้าที่ backend"],
        ["Child span","งานภายใน เช่น เรียกฐานข้อมูลหรือ model API"],
      ],
    },
    student: {
      title: "First-Year Note — มอง span เป็น interval บนแกนเวลา",
      body: [
        "ถ้า root เริ่มที่ศูนย์และจบที่ 400 มิลลิวินาที ความยาวคือ 400 มิลลิวินาที หาก child สองงานรันพร้อมกันช่วง 100 ถึง 200 มิลลิวินาที ทั้งคู่กินเวลาบนนาฬิกาช่วงเดียวกัน",
        "ฝึกเขียน parent ID ไว้ข้างชื่อเพื่อแยกโครงสร้างต้นไม้ออกจากการเรียงตามเวลาจบ",
      ],
    },
  },

  workedExample: {
    intro: "ทีมระบบ Thai Knowledge RAG ต้องการดูว่าคำถามเรื่องใบเสร็จเดินผ่านขั้นใดและใช้ token เท่าไร ใช้ fake LLM คืนคำตอบจาก doc ID สังเคราะห์เดียว ให้ต่อโค้ด Python จากทั้งสามขั้นเรียงลงในไฟล์ rag_telemetry.py แล้วรันด้วย uv run python rag_telemetry.py ครับ",
    steps: [
      {
        title: "1 · ประกอบ provider และ schema",
        explain: "สร้าง provider แบบแยกต่อการทดลอง ต่อ SimpleSpanProcessor กับ in-memory exporter แล้วคืน tracer สำหรับ instrument ฟังก์ชัน ในงานจริง provider อยู่ระดับ process และเปิดครั้งเดียว",
        code: {
          language: "python",
          filename: "rag_telemetry.py",
          code: `from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter,
)
from opentelemetry.trace import SpanKind
from pydantic import BaseModel, Field
from structlog import get_logger


class Usage(BaseModel):
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)


def make_tracer():
    exporter = InMemorySpanExporter()
    provider = TracerProvider(
        resource=Resource.create({"service.name": "thai-knowledge-rag"})
    )
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    return provider, provider.get_tracer("neural_path.b34"), exporter`,
        },
      },
      {
        title: "2 · ครอบ retrieval และ generation",
        explain: "เริ่ม chat span ก่อนเรียก fake LLM เพื่อให้เวลาครอบการโทรทั้งหมด ตั้ง usage หลังได้ผลและออกจาก child ก่อน log ใน root ข้อความคำตอบอยู่ในแอป ส่วน span เก็บเฉพาะ route, จำนวนเอกสาร และ model usage",
        code: {
          language: "python",
          filename: "rag_telemetry.py",
          code: `def fake_llm(doc_ids: list[str]) -> tuple[str, Usage]:
    if not doc_ids:
        raise RuntimeError("missing evidence")
    return (
        f"ยื่นใบเสร็จภายใน 30 วัน [{doc_ids[0]}]",
        Usage(input_tokens=420, output_tokens=38),
    )


def answer_question(tracer, *, has_evidence: bool = True) -> str:
    with tracer.start_as_current_span(
        "rag.answer", attributes={"app.route": "expense-policy"}
    ) as root:
        with tracer.start_as_current_span("rag.retrieve") as retrieve:
            doc_ids = ["expense#03"] if has_evidence else []
            retrieve.set_attribute("app.retrieval.hit_count", len(doc_ids))

        with tracer.start_as_current_span(
            "chat mock-thai-mini",
            kind=SpanKind.CLIENT,
            attributes={
                "gen_ai.operation.name": "chat",
                "gen_ai.provider.name": "neural-path.mock",
                "gen_ai.request.model": "mock-thai-mini",
            },
        ) as generation:
            answer, usage = fake_llm(doc_ids)
            generation.set_attribute(
                "gen_ai.response.model", "mock-thai-mini-2026"
            )
            generation.set_attribute(
                "gen_ai.usage.input_tokens", usage.input_tokens
            )
            generation.set_attribute(
                "gen_ai.usage.output_tokens", usage.output_tokens
            )

        context = root.get_span_context()
        get_logger().info(
            "rag_answered",
            trace_id=f"{context.trace_id:032x}",
            span_id=f"{context.span_id:016x}",
            route="expense-policy",
        )
        return answer`,
        },
      },
      {
        title: "3 · เปิดหลักฐานจาก exporter",
        explain: "วาง root ไว้ก่อน แล้วเรียง children ด้วย start_time เพื่ออ่านชื่อและ usage แม้หลาย span ได้ timestamp เดียวกัน ทดสอบว่าการจบ context ส่ง span ออกมาครบ ตัวเลข 420 และ 38 เป็น fixture บรรทัด log แรกมี timestamp และ ID ที่ต่างทุกครั้ง",
        code: {
          language: "python",
          filename: "rag_telemetry.py",
          code: `def main() -> None:
    provider, tracer, exporter = make_tracer()
    try:
        answer = answer_question(tracer)
        print(answer)

        # Show the root first, even when wall-clock timestamps tie.
        spans = sorted(
            exporter.get_finished_spans(),
            key=lambda span: (span.parent is not None, span.start_time),
        )
        for span in spans:
            role = "root" if span.parent is None else "child"
            print(role, span.name)
            if "gen_ai.usage.input_tokens" in span.attributes:
                print(
                    "usage",
                    span.attributes["gen_ai.usage.input_tokens"],
                    span.attributes["gen_ai.usage.output_tokens"],
                )
    finally:
        provider.shutdown()


if __name__ == "__main__":
    main()`,
        },
        output: `ยื่นใบเสร็จภายใน 30 วัน [expense#03]
root rag.answer
child rag.retrieve
child chat mock-thai-mini
usage 420 38`,
      },
    ],
    gotcha: "Output ด้านบนตัดบรรทัด rag_answered ที่ timestamp และ ID สุ่มออก ไฟล์ทดสอบใช้ provider ใหม่ต่อเคสและปิดใน fixture เพื่อป้องกัน span จากเคสก่อนปนกัน",
  },

  practice: {
    intro: "เติม instrumentation สำหรับคำขอที่สำเร็จและแบบที่ไม่มีหลักฐาน ในแลบนี้ fake LLM โยน RuntimeError เพื่อให้ตรวจ span error ได้จริง",
    requirements: [
      "สร้าง root span และ child สองตัว ใช้ชื่อ rag.answer, rag.retrieve และ chat mock-thai-mini ตามตัวอย่าง",
      "บันทึก usage เมื่อ fake LLM ตอบสำเร็จ และ log ด้วย trace ID 32 หลักจาก root",
      "มีกรณีไม่มีหลักฐาน จับ RuntimeError ในขอบเขต child chat ตั้ง error.type แล้วโยนต่อให้ SDK บันทึกสถานะ ERROR",
      "ข้อมูลคำถามและข้อความตอบต้องไม่อยู่ใน attributes",
    ],
    starter: {
      language: "python",
      filename: "rag_telemetry.py",
      code: `from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter,
)
from opentelemetry.trace import SpanKind
from pydantic import BaseModel, Field
from structlog import get_logger


class Usage(BaseModel):
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)


def make_tracer():
    exporter = InMemorySpanExporter()
    provider = TracerProvider(
        resource=Resource.create({"service.name": "thai-knowledge-rag"})
    )
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    return provider, provider.get_tracer("neural_path.b34"), exporter

def fake_llm(doc_ids: list[str]) -> tuple[str, Usage]:
    if not doc_ids:
        raise RuntimeError("missing evidence")
    return (
        f"ยื่นใบเสร็จภายใน 30 วัน [{doc_ids[0]}]",
        Usage(input_tokens=420, output_tokens=38),
    )


def answer_question(tracer, *, has_evidence: bool = True) -> str:
    # TODO: root -> retrieve and gen AI chat spans.
    # TODO: record usage or error.type; correlate the success log.
    raise NotImplementedError("instrument the RAG request")`,
    },
    verification: {
      language: "python",
      filename: "test_rag_telemetry.py",
      code: `import pytest
from opentelemetry.trace import StatusCode
from pydantic import ValidationError
from structlog.testing import capture_logs

from rag_telemetry import Usage, answer_question, make_tracer


@pytest.fixture
def telemetry():
    provider, tracer, exporter = make_tracer()
    try:
        yield tracer, exporter
    finally:
        provider.shutdown()


def test_span_tree_and_usage(telemetry):
    tracer, exporter = telemetry
    assert "[expense#03]" in answer_question(tracer)
    spans = {span.name: span for span in exporter.get_finished_spans()}
    assert set(spans) == {"rag.answer", "rag.retrieve", "chat mock-thai-mini"}
    root = spans["rag.answer"]
    assert root.parent is None
    for name in ("rag.retrieve", "chat mock-thai-mini"):
        child = spans[name]
        assert child.parent.span_id == root.context.span_id
        assert child.context.trace_id == root.context.trace_id
    chat = spans["chat mock-thai-mini"]
    assert chat.attributes["gen_ai.operation.name"] == "chat"
    assert chat.attributes["gen_ai.usage.input_tokens"] == 420
    assert chat.attributes["gen_ai.usage.output_tokens"] == 38
    assert "gen_ai.input.messages" not in chat.attributes
    assert "gen_ai.output.messages" not in chat.attributes


def test_log_points_to_root(telemetry):
    tracer, exporter = telemetry
    with capture_logs() as logs:
        answer_question(tracer)
    root = next(s for s in exporter.get_finished_spans() if s.parent is None)
    assert logs[0]["event"] == "rag_answered"
    assert logs[0]["trace_id"] == f"{root.context.trace_id:032x}"
    assert logs[0]["span_id"] == f"{root.context.span_id:016x}"


def test_error_keeps_trace_without_fake_usage(telemetry):
    tracer, exporter = telemetry
    with pytest.raises(RuntimeError, match="missing evidence"):
        answer_question(tracer, has_evidence=False)
    spans = {span.name: span for span in exporter.get_finished_spans()}
    assert len(spans) == 3
    chat = spans["chat mock-thai-mini"]
    assert chat.status.status_code is StatusCode.ERROR
    assert chat.attributes["error.type"] == "RuntimeError"
    assert "gen_ai.usage.input_tokens" not in chat.attributes
    assert spans["rag.retrieve"].attributes["app.retrieval.hit_count"] == 0


def test_usage_rejects_negative_counts():
    with pytest.raises(ValidationError):
        Usage(input_tokens=-1, output_tokens=38)`,
    },
    selfCheck: [
      "เห็น spans สามรายการหลังออกจาก root",
      "Trace ID ใน log ตรงกับ root ที่ exporter เก็บ",
      "เคส error มีสถานะ ERROR และไม่มี usage ที่แต่งขึ้น",
    ],
    acceptance: "pytest ผ่านทั้งสี่เคส ตรวจได้ทั้งโครง trace, log correlation, error และ schema ของ usage",
    hints: [
      { body: "ตรวจจาก context manager ก่อน เอา retrieval และ chat วางไว้ระดับเยื้องเดียวกันใต้ root แล้วใช้ trace ID จาก root ตอน log" },
      { body: "จับ RuntimeError ภายในบล็อก chat เพื่อ set_attribute แล้ว raise ต่อ จากนั้นตั้ง usage หลังจาก fake_llm คืนค่าเท่านั้น" },
      {
        body: "เฉลยเต็มรวมชุดทดสอบ แยกสองส่วนตามชื่อไฟล์ rag_telemetry.py และ test_rag_telemetry.py ก่อนรัน pytest",
        code: {
          language: "python",
          filename: "rag_telemetry.py / test_rag_telemetry.py",
          code: `# rag_telemetry.py
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter,
)
from opentelemetry.trace import SpanKind
from pydantic import BaseModel, Field
from structlog import get_logger


class Usage(BaseModel):
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)


def make_tracer():
    exporter = InMemorySpanExporter()
    provider = TracerProvider(
        resource=Resource.create({"service.name": "thai-knowledge-rag"})
    )
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    return provider, provider.get_tracer("neural_path.b34"), exporter


def fake_llm(doc_ids: list[str]) -> tuple[str, Usage]:
    if not doc_ids:
        raise RuntimeError("missing evidence")
    return (
        f"ยื่นใบเสร็จภายใน 30 วัน [{doc_ids[0]}]",
        Usage(input_tokens=420, output_tokens=38),
    )


def answer_question(tracer, *, has_evidence: bool = True) -> str:
    with tracer.start_as_current_span(
        "rag.answer", attributes={"app.route": "expense-policy"}
    ) as root:
        with tracer.start_as_current_span("rag.retrieve") as retrieve:
            doc_ids = ["expense#03"] if has_evidence else []
            retrieve.set_attribute("app.retrieval.hit_count", len(doc_ids))

        with tracer.start_as_current_span(
            "chat mock-thai-mini",
            kind=SpanKind.CLIENT,
            attributes={
                "gen_ai.operation.name": "chat",
                "gen_ai.provider.name": "neural-path.mock",
                "gen_ai.request.model": "mock-thai-mini",
            },
        ) as generation:
            try:
                answer, usage = fake_llm(doc_ids)
            except RuntimeError as exc:
                generation.set_attribute("error.type", type(exc).__name__)
                raise
            generation.set_attribute(
                "gen_ai.response.model", "mock-thai-mini-2026"
            )
            generation.set_attribute(
                "gen_ai.usage.input_tokens", usage.input_tokens
            )
            generation.set_attribute(
                "gen_ai.usage.output_tokens", usage.output_tokens
            )

        context = root.get_span_context()
        get_logger().info(
            "rag_answered",
            trace_id=f"{context.trace_id:032x}",
            span_id=f"{context.span_id:016x}",
            route="expense-policy",
        )
        return answer


def main() -> None:
    provider, tracer, exporter = make_tracer()
    try:
        answer = answer_question(tracer)
        print(answer)

        # Show the root first, even when wall-clock timestamps tie.
        spans = sorted(
            exporter.get_finished_spans(),
            key=lambda span: (span.parent is not None, span.start_time),
        )
        for span in spans:
            role = "root" if span.parent is None else "child"
            print(role, span.name)
            if "gen_ai.usage.input_tokens" in span.attributes:
                print(
                    "usage",
                    span.attributes["gen_ai.usage.input_tokens"],
                    span.attributes["gen_ai.usage.output_tokens"],
                )
    finally:
        provider.shutdown()


if __name__ == "__main__":
    main()

# test_rag_telemetry.py — copy the block below into its own file

import pytest
from opentelemetry.trace import StatusCode
from pydantic import ValidationError
from structlog.testing import capture_logs

from rag_telemetry import Usage, answer_question, make_tracer


@pytest.fixture
def telemetry():
    provider, tracer, exporter = make_tracer()
    try:
        yield tracer, exporter
    finally:
        provider.shutdown()


def test_span_tree_and_usage(telemetry):
    tracer, exporter = telemetry
    assert "[expense#03]" in answer_question(tracer)
    spans = {span.name: span for span in exporter.get_finished_spans()}
    assert set(spans) == {"rag.answer", "rag.retrieve", "chat mock-thai-mini"}
    root = spans["rag.answer"]
    assert root.parent is None
    for name in ("rag.retrieve", "chat mock-thai-mini"):
        child = spans[name]
        assert child.parent.span_id == root.context.span_id
        assert child.context.trace_id == root.context.trace_id
    chat = spans["chat mock-thai-mini"]
    assert chat.attributes["gen_ai.operation.name"] == "chat"
    assert chat.attributes["gen_ai.usage.input_tokens"] == 420
    assert chat.attributes["gen_ai.usage.output_tokens"] == 38
    assert "gen_ai.input.messages" not in chat.attributes
    assert "gen_ai.output.messages" not in chat.attributes


def test_log_points_to_root(telemetry):
    tracer, exporter = telemetry
    with capture_logs() as logs:
        answer_question(tracer)
    root = next(s for s in exporter.get_finished_spans() if s.parent is None)
    assert logs[0]["event"] == "rag_answered"
    assert logs[0]["trace_id"] == f"{root.context.trace_id:032x}"
    assert logs[0]["span_id"] == f"{root.context.span_id:016x}"


def test_error_keeps_trace_without_fake_usage(telemetry):
    tracer, exporter = telemetry
    with pytest.raises(RuntimeError, match="missing evidence"):
        answer_question(tracer, has_evidence=False)
    spans = {span.name: span for span in exporter.get_finished_spans()}
    assert len(spans) == 3
    chat = spans["chat mock-thai-mini"]
    assert chat.status.status_code is StatusCode.ERROR
    assert chat.attributes["error.type"] == "RuntimeError"
    assert "gen_ai.usage.input_tokens" not in chat.attributes
    assert spans["rag.retrieve"].attributes["app.retrieval.hit_count"] == 0


def test_usage_rejects_negative_counts():
    with pytest.raises(ValidationError):
        Usage(input_tokens=-1, output_tokens=38)`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run python rag_telemetry.py
uv run pytest -q`,
    },
  },

  mistakes: [
    {
      title: "สร้าง root ใหม่ในแต่ละฟังก์ชัน",
      symptom: "สามแถวมี trace ID คนละค่าและ UI แยกเป็นคนละคำขอ",
      fix: "ส่งต่อ context ของ root แล้วสร้าง child ในขอบเขตที่ active",
    },
    {
      title: "ใช้คำถามเป็นชื่อ span",
      symptom: "ชื่อจำนวนมากค้นยากและอาจเผยข้อความภายใน",
      fix: "ใช้ชื่อ operation คงที่และเก็บเฉพาะ metadata ที่จำเป็น",
    },
    {
      title: "อ่าน exporter ก่อนออกจาก context",
      symptom: "ยังไม่พบ root เพราะยังไม่มี end_time",
      fix: "อ่านหลังออกจาก root และเรียงด้วย start_time",
    },
    {
      title: "ใส่ 0 เมื่อ provider ไม่ส่ง usage",
      symptom: "dashboard ประเมินต้นทุนต่ำโดยดูเหมือนข้อมูลครบ",
      fix: "ละค่าที่ไม่ทราบไว้และนับ coverage แยก",
    },
  ],

  quiz: {
    intro: "เลือกสัญญาณและฟิลด์ที่ช่วยตรวจคำขอ RAG ที่มีปัญหาให้ตรงกับหลักฐาน",
    questions: [
      mc(
        "d133-q1",
        "จะตรวจว่าคำขอหนึ่งติด retrieval หรือโมเดล ควรเปิดอะไร?",
        [
          ["Histogram รายชั่วโมง","ช่วยเลือกช่วงเวลา แต่ไม่มี timeline ต่อคำขอ"],
          ["Trace ของคำขอนั้น","มี spans แยก operation พร้อมเวลาและ parent"],
          ["ยอดจำนวน log","บอกความถี่การเขียน log"],
          ["ยอด token รวมรายวัน","บอกการใช้โมเดลทั้งวัน"],
        ],
        "B",
        "ใช้ trace ID จาก log เพื่อเปิด timeline ของคำขอแล้วเทียบ child spans",
        "Trace ต่างจาก histogram อย่างไร?",
        "Trace แสดงแต่ละ operation ของคำขอหนึ่ง Histogram สรุปการกระจายของหลายคำขอ",
      ),
      mc(
        "d133-q2",
        "จะยืนยันอย่างไรว่า chat เป็นลูกของ rag.answer?",
        [
          ["ชื่อ span มีคำว่า rag เหมือนกัน","ชื่อใช้จัดกลุ่มงาน"],
          ["Output token ตรงกัน","Usage ใช้ตรวจปริมาณงาน"],
          ["เวลาเริ่มใกล้กัน","คำขอต่างรายการอาจเริ่มใกล้กัน"],
          ["Trace ID เดียวกันและ parent span ID ตรงกับ span ID ของ root","ทั้งสองเงื่อนไขยืนยันตำแหน่งในต้นไม้"],
        ],
        "D",
        "Trace ID บอกสมาชิกในต้นไม้และ parent span ID บอกตัวแม่โดยตรง",
        "Parent span ID ชี้ไปที่ค่าใด?",
        "Span ID ของ span แม่โดยตรง",
      ),
      mc(
        "d133-q3",
        "ฟิลด์ปัจจุบันสำหรับรุ่นที่ provider ตอบจริงคืออะไร?",
        [
          ["gen_ai.response.model","บันทึกโมเดลจริงใน response"],
          ["gen_ai.request.model","บันทึกรุ่นที่ส่งไปใน request"],
          ["service.name","ระบุ service ที่สร้าง telemetry"],
          ["gen_ai.usage.input_tokens","จำนวน token ขาเข้า"],
        ],
        "A",
        "Request model อาจเป็น alias ส่วน response model ระบุรุ่นที่ทำงานจริงเมื่อ provider ส่งมา",
        "ขอ alias แล้ว provider คืนรุ่นย่อย ควรเก็บอะไร?",
        "แยก request model กับ response model",
      ),
      mc(
        "d133-q4",
        "หาก provider ไม่ส่งจำนวน token ให้ทำอย่างไร?",
        [
          ["ตั้งเป็น 0","จะปนกับศูนย์จริง"],
          ["นับตัวอักษรแทนทันที","ตัวอักษรกับ token เป็นคนละหน่วย"],
          ["ละ attribute และติดตาม coverage","รักษาความต่างระหว่างไม่ทราบกับศูนย์"],
          ["ตั้งเป็น string ว่า unknown","usage field กำหนดเป็นจำนวนเต็ม"],
        ],
        "C",
        "การไม่มีค่าเป็นข้อมูลสำคัญของความครอบคลุม dashboard และช่วยกันประเมินบิลต่ำผิดจริง",
        "Token ที่ไม่ทราบควร encode อย่างไร?",
        "เว้น usage attribute แล้วรายงาน coverage แยก",
      ),
    ],
  },

  takeaways: [
    "ใช้ metrics หาอาการระดับระบบ ใช้ trace หา operation และใช้ log อ่านเหตุการณ์ที่มี context",
    "Parent ID กับ trace ID มีหน้าที่ต่างกัน ตรวจทั้งคู่",
    "ติดเฉพาะ GenAI fields ที่จำเป็นและมีแหล่งที่มา โดยเฉพาะ usage กับรุ่นของโมเดล",
    "D134 จะเปิดเส้นทางเดียวกันใน Langfuse พร้อม prompt version และคะแนนคุณภาพ",
  ],

  reviewCards: [
    rc(
      "d133-rc1",
      "Trace ID และ span ID ยาวเท่าไรเวลาแสดงเป็น hex?",
      "Trace ID 32 หลัก และ span ID 16 หลัก",
    ),
    rc(
      "d133-rc2",
      "SimpleSpanProcessor ส่งข้อมูลเมื่อไร?",
      "เมื่อ span จบ และในแลบส่งให้ in-memory exporter",
    ),
    rc(
      "d133-rc3",
      "จะป้องกัน trace ใหญ่และมีข้อมูลละเอียดเกินไปได้อย่างไร?",
      "ใช้ชื่อ span คงที่ และเก็บเฉพาะ metadata ที่อนุญาต",
    ),
  ],

  sources: [
    {
      label: "OpenTelemetry · Signals",
      href: "https://opentelemetry.io/docs/concepts/signals/",
    },
    {
      label: "OpenTelemetry · Python Instrumentation",
      href: "https://opentelemetry.io/docs/languages/python/instrumentation/",
    },
    {
      label: "OpenTelemetry GenAI · Semantic Conventions",
      href: "https://github.com/open-telemetry/semantic-conventions-genai",
    },
    {
      label: "OpenTelemetry · GenAI Attribute Registry",
      href: "https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/",
    },
  ],

  glossary: [
    "otel",
    "structlog",
    "rag",
    "llm",
    "ttft",
  ],
});
