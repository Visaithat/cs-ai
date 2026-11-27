import { defineLesson, mc, rc } from "./builder";
import type { Lesson } from "../types";

/**
 * D091 — Phase 3 / Block B23
 * Refactor Prompt Templates as Versioned Files
 */
export const d091: Lesson = defineLesson({
  day: 91,
  titleTh: "แยก Prompt Templates เป็นไฟล์มีเวอร์ชัน (YAML/TXT) พร้อม Hash ตรวจสอบย้อนหลัง",
  tagline:
    "30 นาที · รันบนเครื่องได้ 100% · แยกพรอมต์ออกจากโค้ด Python บังคับตรวจตัวแปรแบบ strict และผูก SHA-256 ลงทุกผลลัพธ์",
  icon: "file-code",
  visual: {
    id: "phase3-extractor-arch",
    title: "Versioned Prompt Templates — แยกพรอมต์เป็นไฟล์ YAML/TXT พร้อม SHA-256",
    caption:
      "ดูวิธีโหลด prompt template แบบ strict variable check และบันทึก prompt_version + hash ลงทุกผลลัพธ์",
    alt: "แผนภาพการจัดการ Prompt Templates แบบมีเวอร์ชัน",
  },
  requiresApiKey: false,
  apiKeyNote: "รันบนเครื่องได้ 100% ด้วยไฟล์ YAML/TXT และ pytest ไม่ต้องใช้ API key",
  tools: ["PyYAML", "Pydantic v2", "pathlib", "hashlib", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 2,
      heading: "Prompt คือโค้ดและพารามิเตอร์ของโมเดล ไม่ใช่แค่สตริงธรรมดา",
      body: "การแก้คำสั่งเพียงประโยคเดียวใน System Prompt สามารถเปลี่ยนความแม่นยำของ {{llm}} ได้พอ ๆ กับการเปลี่ยนไฮเปอร์พารามิเตอร์ของโมเดล จึงต้องจัดการด้วย {{prompt-versioning}} อย่างมีวินัย",
      lessonNote:
        "วันนี้เราย้ายพรอมต์ทั้งหมดออกจากไฟล์ `.py` ไปยัง `prompts/extract_v1.yaml` ที่มีโครงสร้างชัดเจนและตรวจสอบได้",
    },
    {
      node: 3,
      heading: "เปรียบเทียบ Regression `v1` vs `v2` ได้อย่างยุติธรรมและทำซ้ำได้",
      body: "เมื่อแต่ละเวอร์ชันเป็นไฟล์แยกพร้อมลายนิ้วมือ `sha256[:8]` คุณสามารถรัน Eval Benchmark จาก Day 90 เทียบ `extract_v1` กับ `extract_v2` บนชุดข้อมูลเดิมได้อย่าง {{reproducibility|ทำซ้ำได้ 100%}}",
      lessonNote:
        "ทุกการแก้เนื้อหาแม้เพียง 1 ช่องว่างจะเปลี่ยนค่า hash ทันที ป้องกันการแก้พรอมต์เงียบ ๆ โดยไม่เพิ่มเลขเวอร์ชัน",
    },
    {
      node: 4,
      heading: "Strict Variable Rendering ช่วยให้แอป Fail-Fast ก่อนยิง API",
      body: "การแทนตัวแปรแบบหลวม ๆ อาจส่ง `{ticket_text}` เปล่า ๆ หรือค้างตัวแปรดิบขึ้นไปหา LLM จนเสียเงินและได้คำตอบพัง — ตัวโหลดแบบ strict จะเช็กตัวแปรครบทุกตัวก่อนสร้าง payload",
      lessonNote:
        "เราจะใช้ {{pydantic}} + `string.Formatter` บังคับตรวจทั้งตัวแปรที่ขาด ตัวแปรเกิน และวิธี escape วงเล็บปีกกา `{}` ของ JSON อย่างปลอดภัย",
    },
    {
      node: 5,
      heading: "Audit Trail ใน Production: รู้ทันทีว่าผลลัพธ์เมื่อวานมาจากพรอมต์ไหน",
      body: "เมื่อบันทึก `prompt_id`, `prompt_version` และ `prompt_hash` ลงในทุก log หรือผลลัพธ์ ทีมสามารถย้อนรอยต้นเหตุความผิดพลาดและ rollback กลับเวอร์ชันเดิมได้ภายในไม่กี่วินาที",
      lessonNote:
        "รูปแบบนี้พร้อมต่อยอดเข้าสู่ Langfuse Prompt Management และ Promptfoo CI Gate ใน Phase 5 ทันที",
    },
  ],

  objectives: [
    "**แยก** hardcoded prompt strings ออกจากโค้ด Python ไปเป็นไฟล์ YAML ที่มีเวอร์ชัน (`prompts/extract_v1.yaml`) พร้อมตรวจสอบโครงสร้างด้วย {{pydantic}} และ {{pathlib}}",
    "**เขียน** ตัว render template แบบ strict ที่ตรวจจับตัวแปรขาด ตัวแปรเกิน และรองรับตัวอย่าง JSON ที่มีวงเล็บ `{}` โดยไม่พังด้วย `KeyError`",
    "**คำนวณ** content hash (`sha256[:8]`) แบบ deterministic และแนบ `prompt_version` + `prompt_hash` ลงในผลลัพธ์ทุกครั้งเพื่อการตรวจสอบย้อนหลังและการทำ regression diff",
  ],

  prerequisites: [
    "{{pathlib}} การจัดการไฟล์ UTF-8 และ {{pydantic}} v2 (`BaseModel`, `ValidationError`)",
    "แนวคิด {{context-engineering}} (System / User / Few-Shot) จาก Days 74 & 89",
    "พื้นฐาน `pytest` และ `tmp_path` {{fixture}} (Day 9)",
    "รันบนเครื่องได้ 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "สร้างโฟลเดอร์ทำงานสำหรับ Day 91 พร้อมติดตั้ง `pyyaml` และ `pydantic` ผ่าน `uv` เพื่อสร้างระบบ Prompt Registry แบบเบาและรันออฟไลน์ได้ 100%",
    commands: `uv init ai-day91 && cd ai-day91
uv add pydantic pyyaml
uv add --dev pytest ruff
uv run python -c "import yaml, hashlib, pydantic; print('Prompt registry ready:', pydantic.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day91` หรือเปิดโฟลเดอร์ extractor เดิม"],
      ["deps", "ติดตั้ง `pydantic`, `pyyaml`, `pytest`, `ruff` สำเร็จ"],
      ["verify", "รันเช็ก `yaml`, `hashlib` และ `pydantic` สำเร็จ"],
    ],
    note: "อย่าลืมระบุ `encoding=\"utf-8\"` ทุกครั้งที่อ่านไฟล์ YAML/TXT ภาษาไทยด้วย `Path.read_text(encoding=\"utf-8\")` เพื่อไม่ให้พังบน Windows ที่มี default encoding เป็น cp874/cp1252",
  },

  concepts: [
    {
      id: "why-versioned-prompt-files",
      title: "1 · ทำไม Hardcoded Prompt Strings ในไฟล์ Python ถึงเป็นกับดักใน Production",
      paragraphs: [
        "ตอนเริ่มต้นทดลอง เรามักวาง multi-line string ของพรอมต์ไว้กลางไฟล์ `extractor.py` แต่พอระบบเริ่มมีหลายเวอร์ชัน หลายโมเดล และมีทีมช่วยกันปรับแก้ วิธีนี้จะสร้างปัญหา 3 อย่างทันที: (1) **Git Diff อ่านยาก** เพราะโค้ด Python ปนกับย่อหน้าภาษาไทยยาว ๆ, (2) **เทียบ A/B หรือ Rollback ยาก** เพราะเวอร์ชันเก่าถูกเขียนทับหายไปแล้ว, และ (3) **ไร้ Auditability** เวลามีเคสลูกค้าพังเมื่อสัปดาห์ก่อน ทีมตอบไม่ได้ว่าวันนั้นรันพรอมต์ข้อความไหนอยู่",
        "แนวปฏิบัติมาตรฐานของ {{prompt-versioning}} คือแยกพรอมต์ออกเป็นไฟล์เฉพาะในโฟลเดอร์ `prompts/` เช่น `extract_v1.yaml`, `extract_v2.yaml` โดยไฟล์หนึ่งเก็บครบทั้ง metadata (`id`, `version`, `model_tier`, `temperature`, `input_variables`) และเนื้อหา (`system`, `user_template`) เพื่อให้ทั้งวิศวกรและ Domain Expert อ่านและ review ผ่าน Pull Request ได้อย่างชัดเจน",
      ],
      analogy:
        "เหมือนการแยก \"สูตรอาหาร\" ใส่แฟ้มระบุฉบับที่ `v1.0`, `v2.0` แทนการเขียนสูตรด้วยดินสอลงบนข้างเตาไฟ — อยากเทียบว่ารสชาติฉบับไหนขายดีกว่า หรือย้อนกลับไปใช้สูตรเดิมเมื่อไร ก็หยิบมาทำได้ทันที",
      code: {
        language: "yaml",
        filename: "prompts/extract_v1.yaml",
        code: `id: thai_ticket_extract
version: "1.0.0"
model_tier: small
temperature: 0.0
input_variables:
  - normalized_text
  - allowed_categories
system: |
  คุณคือผู้เชี่ยวชาญสกัดข้อมูลทิกเก็ตลูกค้าภาษาไทย
  ตอบกลับตาม JSON Schema เท่านั้น ห้ามแต่งข้อมูลหากไม่พบในข้อความให้ใส่ null
  หมวดหมู่ที่อนุญาต: {allowed_categories}
user_template: |
  ข้อความลูกค้า (หลัง normalize):
  <<<
  {normalized_text}
  >>>`,
        caption:
          "ไฟล์ Prompt Template แบบ YAML ที่แยก metadata, รายชื่อตัวแปรที่บังคับ และเนื้อหา System/User ออกจากโค้ด Python ชัดเจน",
      },
      whyTitle: "Why this matters — เตรียมพร้อมสู่ Eval-Driven Prompt Engineering",
      whyParagraphs: [
        "เมื่อพรอมต์ถูกแยกเป็นไฟล์ที่มีเวอร์ชัน คุณสามารถรันสคริปต์ประเมินจาก Day 90 แบบ `--prompt prompts/extract_v1.yaml` เทียบกับ `--prompt prompts/extract_v2.yaml` แล้วดูผล Macro-F1, P95 และ Cost/1k Docs เคียงข้างกันได้ทันที",
        "ใน Phase 5 เมื่อใช้ Promptfoo หรือ Langfuse โครงสร้างไฟล์แบบนี้จะเชื่อมต่อเข้า CI/CD Regression Gate ได้แทบไม่ต้องรื้อโค้ดใหม่",
      ],
    },
    {
      id: "strict-template-rendering",
      title: "2 · Strict Variable Rendering: ดักตัวแปรขาด/เกินแบบ Fail-Fast และระวังวงเล็บ JSON",
      paragraphs: [
        "ข้อผิดพลาดคลาสสิกเวลาแยกพรอมต์เป็นไฟล์คือความไม่ตรงกันระหว่างโค้ดกับไฟล์ เช่น ไฟล์ YAML เปลี่ยนชื่อตัวแปรจาก `{ticket_text}` เป็น `{normalized_text}` แต่โค้ดยังส่ง `ticket_text=...` หรือใน System Prompt มีตัวอย่าง JSON `{\"category\": \"billing\"}` ซึ่งมีวงเล็บปีกกา `{}` ทำให้ `.format()` ของ Python ระเบิดด้วย `KeyError` กลาง production",
        "วิธีออกแบบที่ปลอดภัยและ {{fail-fast}} คือใช้ `string.Formatter().parse(template)` แตกชื่อ placeholder ทั้งหมดออกมาตรวจสอบตั้งแต่ตอนโหลดไฟล์ (load-time validation) ว่า **ชุด placeholder ใน `system` + `user_template` ตรงกับ `input_variables` เป๊ะ** และตอน render ตรวจสอบว่าผู้เรียกส่งตัวแปรมาครบไม่มีขาดและไม่มีตัวแปรเกิน ส่วนตัวอย่าง JSON ในพรอมต์ให้เขียนแบบ escape วงเล็บปีกกาเป็นสองชั้น (`{{` และ `}}`) หรือเลือกใช้ `string.Template` (`$var`) ที่ไม่ชนกับวงเล็บ JSON เลย",
      ],
      analogy:
        "เหมือนเครื่องพิมพ์แบบฟอร์มสัญญาที่มีระบบเช็กช่องว่างก่อนพิมพ์: ถ้าลืมกรอกชื่อลูกค้า หรือกรอกผิดช่อง เครื่องจะปฏิเสธทันที ไม่ปล่อยให้เอกสารที่มีคำว่า `{customer_name}` หลุดส่งไปถึงลูกค้า",
      bullets: [
        "**Load-Time Check**: ตรวจทันทีตอนโหลด YAML ว่า placeholder ทุกตัวถูกประกาศใน `input_variables` แล้ว (ดักพิมพ์ผิดตั้งแต่รันเทสต์)",
        "**Render-Time Strict Check**: หากขาดตัวแปรใด หรือส่งตัวแปรที่ไม่ได้ประกาศมาเกิน ให้โยน `ValueError` ทันที (Fail-Fast)",
        "**JSON Braces Hygiene**: หากใช้ Python format syntax (`{var}`) และมีตัวอย่าง JSON ใน prompt ต้อง escape เป็น `{{` และ `}}` — `string.Formatter().parse()` จะข้ามวงเล็บที่ escape แล้วให้เองอย่างถูกต้อง",
      ],
      whyTitle: "Why this matters — กัน Bug เงียบที่ทำให้เสียเงิน API ฟรี",
      whyParagraphs: [
        "หากใช้การแทนที่แบบหลวม ๆ (เช่น `replace()` ทีละตัว) แล้วเผลอสะกดชื่อตัวแปรผิด โค้ดจะไม่ error แต่ส่งสตริง `{normalized_text}` ดิบ ๆ ขึ้นไปให้ LLM สกัด จนได้ข้อมูลมั่วทั้งล็อต",
        "Strict rendering ทำให้บั๊กประเภทนี้กลายเป็น `ValueError` ที่ถูกจับได้ตั้งแต่ unit test บนเครื่องก่อนถึงมือผู้ใช้",
      ],
    },
    {
      id: "sha256-content-hashing-audit",
      title: "3 · Content Hashing (`sha256[:8]`) เพื่อจับการแก้เงียบและสร้าง Audit Trail",
      paragraphs: [
        "เลข `version: \"1.0.0\"` เป็นสิ่งที่มนุษย์พิมพ์เอง จึงมีโอกาสสูงมากที่ใครสักคนจะแก้ข้อความภาษาไทยใน `extract_v1.yaml` แต่ **ลืมเพิ่มเลข version** ผลคือใน log เห็นว่าเป็น `v1.0.0` เหมือนเมื่อวาน แต่พฤติกรรมของโมเดลเปลี่ยนไปแล้ว!",
        "ทางแก้ระดับวิศวกรรมคือคำนวณ **Content Hash** ด้วย `hashlib.sha256` จาก canonical JSON ของฟิลด์ที่มีผลต่อผลลัพธ์ (`system`, `user_template`, `model_tier`, `temperature`, `input_variables`) โดยตั้ง `sort_keys=True, ensure_ascii=False` แล้วตัดเอา 8 ตัวอักษรแรก (`sha256[:8]`) — จากนั้นแนบ `{\"prompt_id\", \"prompt_version\", \"prompt_hash\"}` ลงในทุกผลลัพธ์ที่บันทึก",
      ],
      analogy:
        "เลขเวอร์ชันเหมือนป้ายชื่อบนขวดยา ส่วน `sha256[:8]` คือซีลกันแกะและลายนิ้วมือทางเคมี — ต่อให้ใครแอบเปลี่ยนส่วนผสมข้างในโดยไม่เปลี่ยนฉลาก ลายนิ้วมือจะฟ้องทันทีว่าไม่เหมือนเดิม",
      bullets: [
        "**Canonical Serialization**: ใช้ `json.dumps(..., sort_keys=True, ensure_ascii=False)` ก่อน hash เพื่อให้ได้ค่าเดิมเสมอไม่ว่าลำดับ key ใน YAML จะเรียงอย่างไร",
        "**Immutable Audit Metadata**: แนบ `prompt_ref = f\"{id}@{version}#{hash}\"` (เช่น `thai_ticket_extract@1.0.0#9f3a21bc`) ลงในทุก log และไฟล์ผลลัพธ์ JSONL",
        "**Regression Diffing**: เปรียบเทียบ `v1` vs `v2` ได้ทั้งระดับ `content_hash` และ `difflib.unified_diff` เพื่อรีวิวใน PR ได้ชัดทุกบรรทัด",
      ],
      whyTitle: "Why this matters — รากฐานของ Reproducibility และ PDPA/Enterprise Audit",
      whyParagraphs: [
        "ในองค์กรการเงิน ประกัน หรือบริการลูกค้าขนาดใหญ่ เมื่อผลลัพธ์ AI ถูกตั้งคำถาม ทีมวิศวกรรมต้องพิสูจน์ย้อนหลังได้ว่าเคสนั้นประมวลผลด้วยพรอมต์ฉบับใดและเวอร์ชันไหนอย่างแม่นยำ",
        "การผูก `prompt_version` + `prompt_hash` ตั้งแต่ Phase 3 ทำให้ระบบของคุณมีวินัยระดับ production ตั้งแต่วันแรกโดยแทบไม่เพิ่มโค้ดเลย",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — Versioned Prompts ≈ SQL Migrations + Hashed Static Assets",
      body: [
        "ในงาน Web Dev คุณไม่เคยเขียน SQL schema migration หรือไฟล์แปลภาษา (i18n) ปนเป็นสตริงดิบกระจายทั่ว controller และคุณใช้ content hash (เช่น `bundle.a1b2c3d4.js`) เพื่อยืนยันว่าไฟล์ที่ deploy เป็นชิ้นไหนกันแน่",
        "Prompt Registry ทำหน้าที่แบบเดียวกันเป๊ะ: เก็บพรอมต์เป็นไฟล์มีเวอร์ชัน ตรวจ schema ด้วย Pydantic ตอนโหลด และติดลายนิ้วมือ `sha256[:8]` ลงทุก response log",
      ],
      table: [
        ["`prompts/extract_v1.yaml`", "`migrations/001_init.sql` / `locales/th.json`"],
        ["Pydantic `PromptTemplate`", "Zod / TypeScript schema validation for config files"],
        ["Strict `render(**kwargs)`", "Typed template engine ที่ fail บน missing props"],
        ["`sha256[:8]` Content Hash", "Webpack/Vite content-hashed asset fingerprint"],
      ],
    },
    student: {
      title: "First-Year Note — SHA-256 Hash 8 ตัวอักษรทำงานอย่างไร?",
      body: [
        "**SHA-256** คือฟังก์ชันทางคณิตศาสตร์ที่รับข้อความยาวแค่ไหนก็ได้ แล้วคำนวณออกมาเป็นรหัสฐาน 16 ความยาว 64 ตัวอักษร (เหมือนลายนิ้วมือดิจิทัล) ถ้าข้อความเปลี่ยนไปแม้แต่สระเดียวหรือวรรคเดียว รหัสที่ได้จะเปลี่ยนใหม่เกือบทั้งแถว",
        "ในงาน version control (เหมือน Git commit hash สั้น ๆ) เรามักตัดเอาแค่ **8 ตัวอักษรแรก (`[:8]`)** มาแปะใน log เพราะสั้น อ่านง่าย แต่เพียงพอให้แยกความต่างระหว่างเวอร์ชันของพรอมต์ได้อย่างแม่นยำ",
      ],
    },
  },

  workedExample: {
    intro:
      "สถานการณ์: เรามีไฟล์พรอมต์ `extract_v1.yaml` และ `extract_v2.yaml` — มาสร้างคลาส `PromptTemplate` ด้วย Pydantic ที่โหลดไฟล์ YAML, ตรวจ placeholder แบบ strict, คำนวณ `sha256[:8]` และสร้าง audit metadata กัน",
    steps: [
      {
        title: "1 · นิยาม `PromptTemplate` พร้อม Load-Time Placeholder Validation และ `sha256[:8]`",
        explain:
          "ใช้ `string.Formatter().parse()` ดึงชื่อตัวแปรจาก `system` และ `user_template` มาตรวจให้ตรงกับ `input_variables` ตั้งแต่ตอนสร้าง object พร้อม property `content_hash`",
        code: {
          language: "python",
          filename: "worked_d091.py",
          code: `import hashlib
import json
from string import Formatter
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


def extract_placeholders(template: str) -> set[str]:
    names: set[str] = set()
    for _, field_name, _, _ in Formatter().parse(template):
        if field_name is not None:
            names.add(field_name)
    return names


class PromptTemplate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    version: str = Field(min_length=1)
    model_tier: Literal["small", "frontier"] = "small"
    temperature: float = Field(default=0.0, ge=0.0, le=2.0)
    input_variables: list[str]
    system: str = Field(min_length=1)
    user_template: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_placeholders_match(self) -> "PromptTemplate":
        used = extract_placeholders(self.system) | extract_placeholders(self.user_template)
        declared = set(self.input_variables)
        if used != declared:
            raise ValueError(f"Placeholder mismatch: declared={sorted(declared)} vs used={sorted(used)}")
        return self

    @property
    def content_hash(self) -> str:
        canonical = json.dumps(
            {
                "model_tier": self.model_tier,
                "temperature": self.temperature,
                "input_variables": sorted(self.input_variables),
                "system": self.system,
                "user_template": self.user_template,
            },
            sort_keys=True,
            ensure_ascii=False,
        )
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:8]


tpl = PromptTemplate(
    id="thai_ticket_extract",
    version="1.0.0",
    input_variables=["normalized_text"],
    system='ตอบเป็น JSON เช่น {{"category": "billing"}} ห้ามแต่งข้อมูล',
    user_template="ข้อความลูกค้า: {normalized_text}",
)
print("Loaded:", tpl.id, tpl.version, "hash:", tpl.content_hash)`,
        },
        output: `Loaded: thai_ticket_extract 1.0.0 hash: 6f2d8b41`,
      },
      {
        title: "2 · Render แบบ Strict (Fail-Fast เมื่อขาดหรือเกินตัวแปร) + แนบ Audit Metadata",
        explain:
          "ตรวจสอบว่าคีย์ที่ส่งเข้า `render(**kwargs)` ตรงกับ `set(self.input_variables)` เป๊ะ ไม่มีขาด ไม่มีเกิน แล้วคืนทั้ง messages และ audit dict",
        code: {
          language: "python",
          filename: "worked_d091.py",
          code: `def render_prompt(tpl: PromptTemplate, **kwargs: str) -> dict:
    expected = set(tpl.input_variables)
    provided = set(kwargs.keys())
    missing = sorted(expected - provided)
    extra = sorted(provided - expected)
    if missing or extra:
        raise ValueError(f"Invalid render vars (missing={missing}, extra={extra})")
    return {
        "messages": [
            {"role": "system", "content": tpl.system.format(**kwargs)},
            {"role": "user", "content": tpl.user_template.format(**kwargs)},
        ],
        "audit": {
            "prompt_id": tpl.id,
            "prompt_version": tpl.version,
            "prompt_hash": tpl.content_hash,
            "prompt_ref": f"{tpl.id}@{tpl.version}#{tpl.content_hash}",
        },
    }


rendered = render_prompt(tpl, normalized_text="โอนเงินไม่เข้า order #INV-2026")
print("System:", rendered["messages"][0]["content"])
print("Audit :", rendered["audit"])`,
        },
        output: `System: ตอบเป็น JSON เช่น {"category": "billing"} ห้ามแต่งข้อมูล
Audit : {'prompt_id': 'thai_ticket_extract', 'prompt_version': '1.0.0', 'prompt_hash': '6f2d8b41', 'prompt_ref': 'thai_ticket_extract@1.0.0#6f2d8b41'}`,
      },
      {
        title: "3 · ตรวจจับการแก้ไขเนื้อหาเงียบ ๆ ด้วย Hash Diff (`v1` vs `v2`)",
        explain:
          "ทดลองแก้คำใน `system` เพียงคำเดียวโดยจงใจยังไม่เปลี่ยน `version` จะเห็น `content_hash` เปลี่ยนทันที ทำให้ระบบ audit และ CI จับได้",
        code: {
          language: "python",
          filename: "worked_d091.py",
          code: `tpl_edited = tpl.model_copy(
    update={"system": 'ตอบเป็น JSON เช่น {{"category": "billing"}} หากไม่พบให้ตอบ null'}
)
print("v1 hash    :", tpl.content_hash)
print("edited hash:", tpl_edited.content_hash)
print("Changed?   :", tpl.content_hash != tpl_edited.content_hash)`,
        },
        output: `v1 hash    : 6f2d8b41
edited hash: c49e10a7
Changed?   : True`,
      },
    ],
    gotcha:
      "จุดพลาดยอดฮิตใน Python `.format()` กับพรอมต์ที่มีตัวอย่าง JSON: ถ้าในไฟล์ YAML เขียน `{\"category\": \"billing\"}` โดยไม่ escape เป็น `{{\"category\": \"billing\"}}` ตัว `Formatter().parse()` จะเข้าใจว่า `\"category\"` คือชื่อตัวแปรและทำให้พังทันที! ควรเขียน unit test โหลดไฟล์พรอมต์ทุกไฟล์ในโฟลเดอร์ `prompts/` อัตโนมัติใน CI เพื่อดักปัญหานี้ตั้งแต่วินาทีแรก",
  },

  practice: {
    intro:
      "สร้างโมดูล `prompt_registry.py` สำหรับโหลดไฟล์ Prompt Template (YAML) ด้วย `pathlib`, ตรวจ placeholder แบบ strict, คำนวณ `sha256[:8]` และสร้าง audit metadata พร้อมทดสอบด้วย `pytest` (`tmp_path` fixture)",
    requirements: [
      "สร้าง `PromptTemplate(BaseModel)` ที่ตั้ง `ConfigDict(extra=\"forbid\")` มีฟิลด์: `id: str`, `version: str`, `model_tier: Literal[\"small\", \"frontier\"] = \"small\"`, `temperature: float = Field(default=0.0, ge=0.0, le=2.0)`, `input_variables: list[str]`, `system: str`, `user_template: str` พร้อม `@model_validator(mode=\"after\")` ยืนยันว่าชุด placeholder ใน `system` + `user_template` ตรงกับ `set(input_variables)` เป๊ะ",
      "เพิ่ม property `content_hash -> str` คืนค่า `sha256[:8]` จาก canonical JSON (`sort_keys=True, ensure_ascii=False`) ของ `model_tier`, `temperature`, `sorted(input_variables)`, `system`, `user_template` และ property `prompt_ref -> str` คืน `f\"{self.id}@{self.version}#{self.content_hash}\"`",
      "เพิ่มเมธอด `render(self, **kwargs: str) -> dict` ที่ตรวจแบบ strict (โยน `ValueError` หากขาดหรือเกินตัวแปรจาก `input_variables`) แล้วคืน `{\"messages\": [{\"role\": \"system\", \"content\": ...}, {\"role\": \"user\", \"content\": ...}], \"audit\": {\"prompt_id\": ..., \"prompt_version\": ..., \"prompt_hash\": ..., \"prompt_ref\": ...}}`",
      "สร้างฟังก์ชัน `load_prompt_yaml(path: Path) -> PromptTemplate` (อ่านด้วย `encoding=\"utf-8\"` และใช้ `yaml.safe_load`) และ `load_prompt_directory(directory: Path) -> dict[str, PromptTemplate]` ที่โหลดไฟล์ `*.yaml` ทั้งหมดในโฟลเดอร์แล้วเก็บด้วย key `f\"{tpl.id}@{tpl.version}\"` (โยน `ValueError` หากพบ key ซ้ำกัน)",
    ],
    starter: {
      language: "python",
      filename: "prompt_registry.py",
      code: `import hashlib
import json
from pathlib import Path
from string import Formatter
from typing import Literal
import yaml
from pydantic import BaseModel, ConfigDict, Field, model_validator


def extract_placeholders(template: str) -> set[str]:
    """ดึงชื่อ placeholder ทั้งหมดออกจาก Python format string"""
    # TODO: parse with string.Formatter().parse(template)
    raise NotImplementedError


class PromptTemplate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    version: str = Field(min_length=1)
    model_tier: Literal["small", "frontier"] = "small"
    temperature: float = Field(default=0.0, ge=0.0, le=2.0)
    input_variables: list[str]
    system: str = Field(min_length=1)
    user_template: str = Field(min_length=1)

    @model_validator(mode="after")
    def check_declared_variables(self) -> "PromptTemplate":
        # TODO: verify placeholders used == set(self.input_variables)
        raise NotImplementedError

    @property
    def content_hash(self) -> str:
        # TODO: compute deterministic sha256[:8]
        raise NotImplementedError

    @property
    def prompt_ref(self) -> str:
        # TODO: return "{id}@{version}#{content_hash}"
        raise NotImplementedError

    def render(self, **kwargs: str) -> dict:
        # TODO: strict render returning {"messages": [...], "audit": {...}}
        raise NotImplementedError


def load_prompt_yaml(path: Path) -> PromptTemplate:
    """โหลดและ validate ไฟล์ YAML ด้วย UTF-8 และ yaml.safe_load"""
    # TODO: read UTF-8 YAML and validate with PromptTemplate
    raise NotImplementedError


def load_prompt_directory(directory: Path) -> dict[str, PromptTemplate]:
    """โหลดไฟล์ *.yaml ทั้งหมดในโฟลเดอร์ เก็บด้วย key '{id}@{version}' (ห้ามซ้ำ)"""
    # TODO: iterate sorted *.yaml files and guard duplicate id@version
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_prompt_registry.py",
      code: `from pathlib import Path
import pytest
from pydantic import ValidationError
from prompt_registry import (
    load_prompt_directory,
    load_prompt_yaml,
)

V1_YAML = """
id: thai_ticket_extract
version: "1.0.0"
model_tier: small
temperature: 0.0
input_variables:
  - normalized_text
system: |
  สกัดข้อมูลทิกเก็ตเป็น JSON เช่น {{"category": "billing"}} ห้ามแต่งข้อมูล
user_template: |
  ข้อความลูกค้า: {normalized_text}
"""

V2_YAML = """
id: thai_ticket_extract
version: "2.0.0"
model_tier: small
temperature: 0.0
input_variables:
  - normalized_text
  - domain_hint
system: |
  สกัดข้อมูลทิกเก็ต ({domain_hint}) เป็น JSON เช่น {{"category": "billing"}}
user_template: |
  ข้อความลูกค้า: {normalized_text}
"""


def test_load_and_strict_render_with_json_braces(tmp_path: Path):
    p = tmp_path / "extract_v1.yaml"
    p.write_text(V1_YAML, encoding="utf-8")
    tpl = load_prompt_yaml(p)
    assert len(tpl.content_hash) == 8
    assert tpl.prompt_ref == f"thai_ticket_extract@1.0.0#{tpl.content_hash}"

    out = tpl.render(normalized_text="โอนเงินไม่เข้า order #INV-2026")
    assert '{"category": "billing"}' in out["messages"][0]["content"]
    assert "INV-2026" in out["messages"][1]["content"]
    assert out["audit"]["prompt_hash"] == tpl.content_hash

    with pytest.raises(ValueError):
        tpl.render()  # missing variable
    with pytest.raises(ValueError):
        tpl.render(normalized_text="hi", extra_var="oops")  # unexpected extra variable


def test_placeholder_mismatch_fails_on_load(tmp_path: Path):
    bad = tmp_path / "bad.yaml"
    bad.write_text(
        """
id: bad_prompt
version: "1.0.0"
input_variables:
  - ticket_text
system: "ระบบสกัดข้อมูล"
user_template: "ข้อความ: {wrong_name}"
""",
        encoding="utf-8",
    )
    with pytest.raises(ValidationError):
        load_prompt_yaml(bad)


def test_hash_changes_on_any_content_edit(tmp_path: Path):
    p1 = tmp_path / "a.yaml"
    p2 = tmp_path / "b.yaml"
    p1.write_text(V1_YAML, encoding="utf-8")
    p2.write_text(V1_YAML.replace("ห้ามแต่งข้อมูล", "หากไม่พบให้ใส่ null"), encoding="utf-8")
    t1 = load_prompt_yaml(p1)
    t2 = load_prompt_yaml(p2)
    assert t1.version == t2.version
    assert t1.content_hash != t2.content_hash


def test_load_directory_and_reject_duplicate_version(tmp_path: Path):
    (tmp_path / "extract_v1.yaml").write_text(V1_YAML, encoding="utf-8")
    (tmp_path / "extract_v2.yaml").write_text(V2_YAML, encoding="utf-8")
    reg = load_prompt_directory(tmp_path)
    assert set(reg.keys()) == {"thai_ticket_extract@1.0.0", "thai_ticket_extract@2.0.0"}

    (tmp_path / "dup.yaml").write_text(V1_YAML, encoding="utf-8")
    with pytest.raises(ValueError):
        load_prompt_directory(tmp_path)
`,
    },
    selfCheck: [
      "โหลดไฟล์ YAML ภาษาไทยด้วย `encoding=\"utf-8\"` และ `yaml.safe_load` ได้สะอาดทั้งบน Windows/macOS/Linux",
      "ตัวอย่าง JSON ที่ escape เป็น `{{\"category\": \"billing\"}}` ผ่าน validation และ render ออกมาเป็น `{\"category\": \"billing\"}` ถูกต้อง",
      "`render()` โยน `ValueError` ทันทีทั้งตอนขาดตัวแปรและตอนส่งตัวแปรเกิน",
      "การแก้คำไทยเพียงคำเดียวเปลี่ยน `content_hash` (`sha256[:8]`) ทันทีแม้ `version` ยังเท่าเดิม",
      "รัน `uv run pytest -q` และ `uv run ruff check .` ผ่าน 100%",
    ],
    acceptance:
      "ผ่านครบทั้ง 4 test functions ใน `test_prompt_registry.py` ด้วย `uv run pytest -q` และ `uv run ruff check .` สะอาด",
    hints: [
      {
        body: "ใน `extract_placeholders(template)` ใช้ลูป `for _, field_name, _, _ in Formatter().parse(template):` — หาก `field_name` ไม่ใช่ `None` ให้เพิ่มเข้า `set` (กรณีวงเล็บที่ escape ด้วย `{{` `}}` ตัว `field_name` จะเป็น `None` อัตโนมัติ)",
      },
      {
        body: "ใน `load_prompt_directory` ให้วน `for path in sorted(directory.glob(\"*.yaml\")):` แล้วสร้าง `key = f\"{tpl.id}@{tpl.version}\"` ถ้า `key in registry` ให้ `raise ValueError(f\"Duplicate prompt version: {key}\")`",
      },
      {
        body: "โครงของ `extract_placeholders` และ `load_prompt_yaml` พร้อมแล้ว — เหลือเติมเมธอดใน `PromptTemplate` และ `load_prompt_directory`:",
        code: {
          language: "python",
          filename: "hint_day91.py",
          code: `def extract_placeholders(template: str) -> set[str]:
    names: set[str] = set()
    for _, field_name, _, _ in Formatter().parse(template):
        if field_name is not None:
            names.add(field_name)
    return names


def load_prompt_yaml(path: Path) -> PromptTemplate:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return PromptTemplate.model_validate(raw)`,
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
      title: "ใส่ตัวอย่าง JSON ดิบ `{\"a\": 1}` ในเทมเพลตที่ใช้ `.format()` โดยไม่ escape",
      symptom: "ตอนรัน `template.format(...)` พังด้วย `KeyError: '\"a\"'` เพราะ Python มองว่าวงเล็บปีกกาของ JSON คือตัวแปร",
      fix: "escape วงเล็บปีกกาที่เป็นข้อความคงที่ด้วย `{{` และ `}}` เสมอ พร้อมเขียน unit test โหลดและ render ทุกไฟล์ใน `prompts/`",
    },
    {
      title: "ลืม `encoding=\"utf-8\"` ตอนอ่านไฟล์ YAML ภาษาไทยบน Windows",
      symptom: "โค้ดรันผ่านบน macOS/Linux แต่พังด้วย `UnicodeDecodeError` หรือภาษาไทยเป็นตัวต่างดาวบนเครื่อง Windows",
      fix: "ระบุ `path.read_text(encoding=\"utf-8\")` อย่างชัดเจนทุกครั้งที่ใช้ {{pathlib}}",
    },
    {
      title: "แก้ข้อความใน `extract_v1.yaml` ทับไฟล์เดิมโดยไม่เก็บ `content_hash`",
      symptom: "คุณภาพระบบตกกะทันหันแต่ใน log ทุกบรรทัดยังขึ้น `v1.0.0` เหมือนเดิม หาไม่เจอว่าแก้เมื่อไร",
      fix: "ออกไฟล์เวอร์ชันใหม่ (`v2.yaml`) เมื่อเปลี่ยนพฤติกรรม และบันทึก `prompt_hash` (`sha256[:8]`) ลงในทุกผลลัพธ์เสมอ",
    },
    {
      title: "ใช้ `yaml.load(...)` แทน `yaml.safe_load(...)`",
      symptom: "เปิดช่องโหว่ Arbitrary Code Execution หากไฟล์ YAML ถูกแก้ไขโดยบุคคลที่ไม่น่าเชื่อถือ",
      fix: "ใช้ `yaml.safe_load()` เสมอสำหรับการอ่านไฟล์คอนฟิกและไฟล์พรอมต์ทุกชนิด",
    },
  ],

  quiz: {
    questions: [
      mc(
        "d091-q1",
        "เหตุใดเราจึงควรคำนวณและบันทึก `content_hash` (`sha256[:8]`) คู่กับ `prompt_version` ทั้งที่เรามีเลขเวอร์ชันอยู่แล้ว?",
        [
          ["เพื่อเข้ารหัสข้อความพรอมต์ไม่ให้มนุษย์อ่านออก", "SHA-256 เป็น one-way hash ไม่ใช่การเข้ารหัสเพื่อซ่อนข้อความ"],
          ["เพื่อตรวจจับการแก้เนื้อหาเงียบ ๆ ที่ลืมเพิ่มเลขเวอร์ชัน และยืนยันย้อนหลังได้ 100% ว่าผลลัพธ์มาจากเนื้อหาพรอมต์ชิ้นใด", "ถูก — ต่อให้ `version` ยังเขียนว่า `1.0.0` แต่ถ้าแก้แม้แต่คำเดียว ค่า hash จะเปลี่ยนฟ้องทันที"],
          ["เพื่อลดจำนวน token ที่ส่งให้ LLM API", "hash เก็บใน metadata/log ฝั่งระบบ ไม่ได้ไปลด token ในเนื้อหาพรอมต์"],
          ["เพราะ Pydantic บังคับให้ทุก BaseModel ต้องมี SHA-256", "Pydantic ไม่ได้บังคับ นี่คือแนวปฏิบัติวิศวกรรมเพื่อ auditability"],
        ],
        "B",
        "เลขเวอร์ชันกรอกด้วยมือจึงลืมอัปเดตได้ แต่ `sha256[:8]` คำนวณจากเนื้อหาจริงเสมอ จึงเป็นหลักประกัน reproducibility และ audit trail ที่เชื่อถือได้",
        "ทำไมต้องบันทึก `prompt_hash` (`sha256[:8]`) เพิ่มเติมจาก `prompt_version`?",
        "เพื่อจับการแก้ไขเนื้อหาเงียบ ๆ ที่ลืมเพิ่มเลข version และรับประกัน audit trail ว่าผลลัพธ์มาจากพรอมต์เนื้อหาใดกันแน่",
      ),
      mc(
        "d091-q2",
        "ในไฟล์ `extract_v1.yaml` ที่ใช้ Python `.format()` หากต้องการใส่ตัวอย่าง JSON `{\"category\": \"billing\"}` ไว้ใน System Prompt ควรเขียนอย่างไรไม่ให้เกิด `KeyError`?",
        [
          ["เขียน `{\"category\": \"billing\"}` ตรง ๆ แล้วใส่ `try/except KeyError` ข้ามไป", "จะทำให้ render ล้มเหลวและไม่ได้ System Prompt ที่ต้องการ"],
          ["escape วงเล็บปีกกาคงที่เป็น `{{\"category\": \"billing\"}}` เพื่อให้ `.format()` แปลงกลับเป็น `{` และ `}` อย่างถูกต้อง", "ถูก — และ `string.Formatter().parse()` จะไม่นับมันเป็นตัวแปร placeholder ด้วย"],
          ["เปลี่ยนจาก JSON เป็น CSV ทั้งหมด", "ไม่จำเป็น — แค่ escape วงเล็บปีกกาให้ถูกก็ใส่ตัวอย่าง JSON ได้สมบูรณ์"],
          ["ประกาศ `\"category\"` เพิ่มเข้าไปใน `input_variables`", "ไม่ใช่ตัวแปรอินพุตจริง จะทำให้ interface ของพรอมต์สับสน"],
        ],
        "B",
        "ใน Python format syntax การใส่วงเล็บปีกกาซ้อน `{{` และ `}}` จะถูก render เป็นตัวอักษร `{` และ `}` โดยไม่ถูกตีความเป็น placeholder",
        "วิธีใส่ตัวอย่าง JSON ใน Python `.format()` prompt template โดยไม่ให้เกิด `KeyError` คืออะไร?",
        "escape วงเล็บปีกกาคงที่เป็น `{{` และ `}}` (เช่น `{{\"category\": \"billing\"}}`)",
      ),
      mc(
        "d091-q3",
        "การทำ **Strict Variable Rendering** (โยน `ValueError` เมื่อขาดหรือเกินตัวแปร) ช่วยป้องกันปัญหาใดในระบบ AI จริง?",
        [
          ["ป้องกันไม่ให้ส่ง placeholder ดิบอย่าง `{normalized_text}` หรือชื่อตัวแปรที่สะกดผิดขึ้นไปหา LLM API แบบเงียบ ๆ", "ถูก — ทำโค้ด Fail-Fast ตั้งแต่ขั้นตอน test/staging ก่อนเสียค่า API และสร้างผลลัพธ์พัง"],
          ["ป้องกันไม่ให้โมเดลเกิด hallucination ได้ 100%", "ช่วยเรื่องความถูกต้องของอินพุตพรอมต์ ไม่ได้กำจัด hallucination ทั้งหมด"],
          ["ทำให้ LLM API ตอบเร็วขึ้น 10 เท่า", "ไม่ได้เปลี่ยนความเร็วการประมวลผลของโมเดล"],
          ["ทำให้ไม่ต้องใช้ไฟล์ YAML อีกต่อไป", "Strict rendering ทำงานคู่กับไฟล์ YAML เพื่อให้การโหลดและใช้งานปลอดภัย"],
        ],
        "A",
        "Strict check ทั้งตอนโหลดไฟล์ (load-time) และตอน render (render-time) ทำให้ความไม่ตรงกันระหว่างโค้ดกับไฟล์พรอมต์แสดงออกทันทีแทนที่จะซ่อนเป็นบั๊กเงียบ",
        "Strict Variable Rendering ตรวจเช็ก 2 จังหวะใดเพื่อทำให้ระบบ Fail-Fast?",
        "1) Load-time: ตรวจว่า placeholder ใน template ตรงกับ `input_variables` และ 2) Render-time: ตรวจว่า kwargs ที่ส่งมาไม่มีขาดและไม่มีเกิน",
      ),
      mc(
        "d091-q4",
        "เหตุใดก่อนคำนวณ `sha256` ของ Prompt Template จึงควรแปลงเป็น canonical JSON ด้วย `sort_keys=True, ensure_ascii=False`?",
        [
          ["เพื่อให้ค่า hash เปลี่ยนสุ่มทุกครั้งที่รันเพื่อความปลอดภัย", "ตรงกันข้าม — เราต้องการให้เนื้อหาเดียวกันได้ค่า hash เดิมเสมอ (deterministic)"],
          ["เพื่อให้ได้ค่า hash เดิมเสมอ (deterministic) ไม่ว่าลำดับ key ในไฟล์ YAML หรือระบบปฏิบัติการจะต่างกัน และรองรับอักขระภาษาไทยได้ตรงตัว", "ถูก — เป็นหัวใจของการเทียบ hash ข้ามเครื่องและใน CI"],
          ["เพราะ `hashlib.sha256` รับเฉพาะ JSON เท่านั้น", "`sha256` รับ `bytes` อะไรก็ได้ แต่ canonical JSON ช่วยให้ลำดับฟิลด์คงที่"],
          ["เพื่อทำให้ไฟล์ YAML เล็กลง 50%", "เราไม่ได้เขียนทับไฟล์ YAML แต่ใช้ canonical JSON เฉพาะตอนคำนวณ hash"],
        ],
        "B",
        "`sort_keys=True` รับประกันลำดับ key คงที่ และ `ensure_ascii=False` + `.encode(\"utf-8\")` ทำให้ค่า hash ของข้อความไทยคงที่ 100% ทุกสภาพแวดล้อม",
        "ทำไมต้องใช้ `json.dumps(..., sort_keys=True, ensure_ascii=False)` ก่อนทำ SHA-256 hash?",
        "เพื่อให้ได้ค่า hash แบบ deterministic เดิมเสมอไม่ว่าลำดับ key จะสลับกันหรือรันบนเครื่องใด",
      ),
    ],
  },

  takeaways: [
    "แยกพรอมต์ออกจากไฟล์ `.py` เป็นไฟล์ YAML มีเวอร์ชัน (`prompts/extract_v1.yaml`) พร้อมโหลดด้วย {{pathlib}} (`encoding=\"utf-8\"`) และ `yaml.safe_load`",
    "บังคับ **Strict Variable Checking** ทั้งตอนโหลด (`placeholders == input_variables`) และตอน `render()` เพื่อ {{fail-fast}} ก่อนยิง API",
    "คำนวณ **Content Hash (`sha256[:8]`)** จาก canonical JSON และแนบ `prompt_id`, `prompt_version`, `prompt_hash` ลงในทุกผลลัพธ์เพื่อ audit trail และ regression diff",
    "escape วงเล็บปีกกาของตัวอย่าง JSON เป็น `{{` `}}` และเขียน unit test โหลดไฟล์พรอมต์ทุกไฟล์ใน CI เสมอ",
  ],

  reviewCards: [
    rc(
      "d091-rc-1",
      "ข้อดี 3 ข้อของการแยกพรอมต์เป็นไฟล์ YAML มีเวอร์ชันแทน hardcoded string ใน Python คืออะไร?",
      "1) Git diff สะอาดและรีวิวได้ง่าย, 2) ทำ A/B regression test (`v1` vs `v2`) และ rollback ได้ทันที, 3) บันทึก version + hash เป็น audit trail ในทุกผลลัพธ์",
    ),
    rc(
      "d091-rc-2",
      "วิธีดึงชื่อ placeholder ทั้งหมดจาก Python format string อย่างปลอดภัย (โดยไม่หลงนับ `{{` `}}` ที่ escape ไว้) คืออะไร?",
      "ใช้ `string.Formatter().parse(template)` แล้วเก็บเฉพาะ `field_name` ที่ไม่เป็น `None`",
    ),
    rc(
      "d091-rc-3",
      "ควรแนบฟิลด์ audit อะไรลงในผลลัพธ์ทุกครั้งที่เรียก LLM จาก Prompt Registry?",
      "`prompt_id`, `prompt_version`, `prompt_hash` (`sha256[:8]`) หรือรวมเป็น `prompt_ref` เช่น `thai_ticket_extract@1.0.0#6f2d8b41`",
    ),
  ],

  sources: [
    { label: "Python Docs — string.Formatter", href: "https://docs.python.org/3/library/string.html#string.Formatter" },
    { label: "Python Docs — hashlib (SHA-256)", href: "https://docs.python.org/3/library/hashlib.html" },
    { label: "Python Docs — pathlib.Path.read_text", href: "https://docs.python.org/3/library/pathlib.html" },
    { label: "Pydantic v2 Docs — Model Validators", href: "https://docs.pydantic.dev/latest/concepts/validators/" },
  ],

  glossary: [
    "prompt-versioning",
    "reproducibility",
    "pathlib",
    "pydantic",
    "fail-fast",
    "validation-error",
    "context-engineering",
    "fixture",
  ],
});
