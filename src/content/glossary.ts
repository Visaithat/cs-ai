import type { GlossaryTerm } from "./types";

/**
 * Global glossary. A lesson lists the ids it uses in `lesson.glossary`;
 * inline `{{id}}` markup in any prose string opens the matching sheet.
 */
export const GLOSSARY: Record<string, GlossaryTerm> = {
  uv: {
    id: "uv",
    term: "uv",
    thai: "เครื่องมือจัดการ Python project",
    short: "ตัวจัดการ Python เร็ว ๆ: ติดตั้ง package, สร้าง .venv, ล็อกเวอร์ชัน และรันโค้ดในที่เดียว",
    plain:
      "uv เป็นเครื่องมือจาก Astral ที่รวมงานของ pip + venv + pip-tools + pyenv ไว้ด้วยกัน สร้างโปรเจกต์ด้วย `uv init`, เพิ่มไลบรารีด้วย `uv add` และรันด้วย `uv run` โดยมันจะสร้างและใช้ `.venv` ของโปรเจกต์ให้เอง ไม่แตะ system Python",
    analogy: "เหมือน pnpm/bun ของฝั่ง JavaScript: `pyproject.toml` ≈ package.json, `uv.lock` ≈ pnpm-lock.yaml, `.venv` ≈ node_modules",
    example: { language: "bash", code: "uv init ai-day1 && cd ai-day1\nuv add pydantic\nuv run python main.py" },
    related: [{ label: "D1 · Modern Python (uv)", lessonId: "d001" }, { label: "D22 · Packaging & src/ layout" }, { label: "D141 · Dockerfile สำหรับ uv" }],
  },
  venv: {
    id: "venv",
    term: "virtual environment (.venv)",
    thai: "สภาพแวดล้อมจำลองของแต่ละโปรเจกต์",
    short: "โฟลเดอร์ที่เก็บ Python และไลบรารีของโปรเจกต์หนึ่ง แยกจากโปรเจกต์อื่นและจากระบบ",
    plain:
      "ถ้าโปรเจกต์ A ต้องการ pydantic 1.x แต่โปรเจกต์ B ต้องการ 2.x ถ้าติดตั้งรวมกันจะชนกัน virtual environment คือ 'กล่องแยกไลบรารี' ของแต่ละโปรเจกต์ ทำให้แต่ละโปรเจกต์มีเวอร์ชันของตัวเองโดยไม่กระทบกัน",
    analogy: "เหมือนห้องครัวส่วนตัวของแต่ละโปรเจกต์ — วัตถุดิบ (ไลบรารี) ไม่ปนกัน",
    related: [{ label: "D1 · uv", lessonId: "d001" }, { label: "D21 · .gitignore สำหรับ data/keys" }],
  },
  lockfile: {
    id: "lockfile",
    term: "lockfile (uv.lock)",
    thai: "ไฟล์ล็อกเวอร์ชัน dependency",
    short: "บันทึกเวอร์ชันเป๊ะของทุก dependency (รวม transitive) เพื่อให้ทุกเครื่องติดตั้งชุดเดียวกัน",
    plain:
      "`pyproject.toml` บอกว่าต้องการอะไรโดยประมาณ (เช่น pydantic>=2.7) แต่ `uv.lock` บันทึกเวอร์ชันจริงที่ resolve แล้วของทุกแพ็กเกจ รวมถึงตัวที่ถูกดึงมาโดยอ้อม ทีมและ CI จึงได้ environment เหมือนกัน ลดปัญหา 'รันบนเครื่องฉันได้ แต่พังบน server'",
    analogy: "เหมือนใบเสร็จวัตถุดิบที่ระบุยี่ห้อและล็อตเป๊ะ ๆ ทำให้ทำสูตรเดิมซ้ำได้เหมือนเดิม",
    related: [{ label: "D1 · uv", lessonId: "d001" }, { label: "D141 · Dockerfile สำหรับ uv" }],
  },
  reproducibility: {
    id: "reproducibility",
    term: "reproducibility",
    thai: "ความสามารถทำซ้ำได้ผลเหมือนเดิม",
    short: "คนอื่น (หรือคุณในอีก 6 เดือน) รันโปรเจกต์แล้วได้ผลเหมือนเดิมบนเครื่องใหม่",
    plain:
      "งาน AI มีตัวแปรเยอะ: เวอร์ชัน Python, เวอร์ชันไลบรารี, ข้อมูล, seed ถ้าควบคุมไม่ได้จะไม่รู้ว่าผลลัพธ์เปลี่ยนเพราะโค้ดหรือเพราะ environment — lockfile คือก้าวแรกของ reproducibility",
    analogy: "เหมือนสูตรอาหารที่ระบุปริมาณชัด ใครทำตามก็ได้รสเดิม",
    related: [{ label: "D1 · uv.lock", lessonId: "d001" }, { label: "D125 · Golden dataset" }],
  },
  dependency: {
    id: "dependency",
    term: "dependency / transitive dependency",
    thai: "แพ็กเกจที่โปรเจกต์พึ่งพา (และที่มันพึ่งพาต่อ)",
    short: "ไลบรารีที่โค้ดเราต้องใช้ — transitive คือตัวที่ถูกดึงมาโดยอ้อมผ่านไลบรารีอื่น",
    plain:
      "เราเพิ่ม `pydantic` ตัวเดียว แต่ pydantic เองพึ่ง `pydantic-core`, `annotated-types` ฯลฯ ตัวเหล่านี้คือ transitive dependencies ซึ่งก็มีผลต่อพฤติกรรมของแอป จึงต้องถูกล็อกด้วย",
    analogy: "เหมือนสั่งเมนูเดียว แต่ครัวต้องใช้วัตถุดิบหลายอย่างเบื้องหลัง",
    related: [{ label: "D1 · uv.lock", lessonId: "d001" }],
  },
  pyproject: {
    id: "pyproject",
    term: "pyproject.toml",
    thai: "ไฟล์กำหนดโปรเจกต์ Python",
    short: "ไฟล์มาตรฐานที่ระบุชื่อโปรเจกต์ เวอร์ชัน Python และ dependency ที่ต้องการ",
    plain:
      "`uv init` สร้างไฟล์นี้ให้ และ `uv add` จะแก้ส่วน `dependencies` ให้อัตโนมัติ ควร commit เข้า Git ร่วมกับ `uv.lock` (แต่ไม่ commit `.venv`)",
    analogy: "≈ package.json ของฝั่ง Node.js",
    related: [{ label: "D1 · uv", lessonId: "d001" }, { label: "D22 · Packaging & pyproject" }],
  },
  pydantic: {
    id: "pydantic",
    term: "Pydantic v2",
    thai: "ไลบรารีตรวจสอบข้อมูลด้วย type hints",
    short: "นิยามโครงสร้างข้อมูลเป็นคลาส Python แล้วให้มันตรวจ/แปลงข้อมูลที่เข้ามาตอน runtime",
    plain:
      "Pydantic ให้เราเขียน schema เป็นคลาสที่สืบทอด `BaseModel` เมื่อส่งข้อมูลดิบ (dict/JSON) เข้าไป มันจะตรวจ type และกฎต่าง ๆ แปลงชนิดข้อมูลที่แปลงได้ และโยน `ValidationError` ที่บอกว่าผิดตรงไหน ใช้เป็นแกนใน FastAPI, structured outputs ของ LLM และ LangGraph",
    analogy: "≈ Zod ของฝั่ง TypeScript: schema + type อยู่ที่เดียว และตรวจจริงตอน runtime",
    example: {
      language: "python",
      code: 'class User(BaseModel):\n    id: int\n    name: str\n\nUser.model_validate({"id": "7", "name": "Mali"})  # id -> 7',
    },
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D3 · Validators & nested models" }, { label: "D77 · Structured outputs" }],
  },
  basemodel: {
    id: "basemodel",
    term: "BaseModel",
    thai: "คลาสแม่ของ schema ใน Pydantic",
    short: "คลาสที่เราสืบทอดเพื่อประกาศ field และกฎการตรวจสอบของข้อมูล",
    plain:
      "ทุก field ที่ประกาศด้วย type hint ในคลาสที่สืบทอด BaseModel จะกลายเป็นส่วนหนึ่งของสัญญาข้อมูล เรียก `Model.model_validate(dict)` เพื่อตรวจ และ `model.model_dump_json()` เพื่อแปลงกลับเป็น JSON",
    analogy: "เหมือนแบบฟอร์มเปล่าที่มีช่องและกติกากำกับ — ข้อมูลต้องกรอกตามฟอร์มถึงจะรับ",
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }],
  },
  schema: {
    id: "schema",
    term: "schema",
    thai: "แบบแผนโครงสร้างข้อมูล",
    short: "คำอธิบายว่าข้อมูลควรมี field อะไร ชนิดอะไร และอยู่ในช่วงค่าไหน",
    plain:
      "Schema คือ 'แผนผัง' ของข้อมูลที่เรายอมรับ เช่น ticket ต้องมี `ticket_id` เป็น string ยาวอย่างน้อย 4 และ `confidence` เป็นตัวเลข 0–1 ข้อมูลที่ไม่ตรงแผนผังจะถูกปฏิเสธตั้งแต่ขอบระบบ",
    analogy: "เหมือนแบบฟอร์มสมัครงานที่บอกว่าช่องไหนต้องกรอกอะไร",
    related: [{ label: "D1 · Data contract", lessonId: "d001" }, { label: "D77 · JSON Schema" }],
  },
  validation: {
    id: "validation",
    term: "validation",
    thai: "การตรวจสอบความถูกต้องของข้อมูล",
    short: "การเช็กว่าข้อมูลที่เข้ามาตรงตาม schema ก่อนนำไปใช้ต่อ",
    plain:
      "ใน AI system ข้อมูลที่เข้ามาไม่สะอาดเสมอ (ผู้ใช้พิมพ์ผิด, LLM ตอบ JSON เพี้ยน) validation ที่ขอบระบบทำให้บั๊กถูกจับเร็วและมีข้อความบอกตำแหน่งที่ผิด แทนที่จะระเบิดกลางทาง",
    analogy: "เหมือนด่านตรวจเอกสารก่อนเข้างาน — เอกสารไม่ครบไม่ให้เข้า",
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D78 · Validation-repair loop" }],
  },
  "validation-error": {
    id: "validation-error",
    term: "ValidationError",
    thai: "ข้อผิดพลาดจากการตรวจสอบ schema",
    short: "exception ของ Pydantic ที่รวมทุก field ที่ผิดพร้อมตำแหน่ง (loc) และข้อความ (msg)",
    plain:
      "เมื่อ `model_validate` เจอข้อมูลผิด มันจะโยน `ValidationError` ที่บอกครบทุกข้อผิดในครั้งเดียว: `err.errors()` ให้รายการ `{loc, msg, type}` และ `err.error_count()` ให้จำนวน เราจึงดักจับแล้วทำ retry หรือ fallback ได้อย่างปลอดภัย",
    analogy: "เหมือนใบตรวจการบ้านที่วงทุกข้อที่ผิดพร้อมเหตุผล ไม่ใช่แค่ 'ไม่ผ่าน'",
    example: {
      language: "python",
      code: 'try:\n    Model.model_validate(raw)\nexcept ValidationError as err:\n    for e in err.errors():\n        print(e["loc"], e["msg"])',
    },
    related: [{ label: "D1 · ValidationError", lessonId: "d001" }, { label: "D6 · Custom exceptions" }],
  },
  "type-hint": {
    id: "type-hint",
    term: "type hint",
    thai: "คำใบ้ชนิดข้อมูล",
    short: "การเขียน `name: str` เพื่อบอกชนิดที่คาดหวัง Python ไม่บังคับเอง แต่ Pydantic ใช้มันตรวจจริง",
    plain:
      "โดยปกติ Python ไม่บังคับ type hint ตอนรัน (เป็นเพียงเอกสาร/ให้ editor ช่วย) แต่ Pydantic อ่าน type hint ของคลาสแล้วนำมาสร้างกฎตรวจสอบจริงตอน runtime",
    analogy: "เหมือนป้ายบอกช่องกรอกข้อมูลที่ปกติไม่มีใครบังคับ — จนกว่า Pydantic จะมายืนเฝ้าช่อง",
    related: [{ label: "D2 · Type hints" }, { label: "D1 · Pydantic v2", lessonId: "d001" }],
  },
  literal: {
    id: "literal",
    term: "Literal",
    thai: "ชนิดข้อมูลที่จำกัดค่าเป็นชุดที่กำหนด",
    short: '`Literal["th","en","mixed"]` ยอมรับเฉพาะค่าที่ระบุเท่านั้น',
    plain:
      "ใช้เมื่อ field มีค่าได้เฉพาะไม่กี่แบบ เช่น category ของทิกเก็ต Pydantic จะปฏิเสธค่าอื่นด้วย `ValidationError` — เป็นเครื่องมือหลักในการบังคับ output ของ LLM ให้อยู่ในชุดที่โค้ดเรารองรับ",
    analogy: "เหมือน dropdown ที่เลือกได้เฉพาะตัวเลือกในรายการ ไม่ใช่ช่องพิมพ์อิสระ",
    example: { language: "python", code: 'category: Literal["billing", "technical", "general"]' },
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D77 · Structured outputs" }],
  },
  "field-validator": {
    id: "field-validator",
    term: "@field_validator",
    thai: "ตัวตรวจ/ทำความสะอาดข้อมูลที่เราเขียนเอง",
    short: "decorator สำหรับกฎเฉพาะที่ `Field(...)` ทำไม่ได้ เช่น strip, เช็ก prefix",
    plain:
      "เขียนเป็น `@field_validator(\"ชื่อ field\")` + `@classmethod` แล้วรับค่าเข้ามา ตรวจหรือแก้ แล้ว `return` ค่าที่ต้องการ (ถ้าไม่ valid ให้ `raise ValueError`) ใน mode `after` (ค่าเริ่มต้น) มันทำงานหลัง Field constraints ผ่านแล้ว — และอย่าลืม return ค่า!",
    analogy: "เหมือนเจ้าหน้าที่ตรวจเอกสารละเอียดคนที่สองหลังด่านตรวจพื้นฐาน",
    example: {
      language: "python",
      code: '@field_validator("query")\n@classmethod\ndef clean(cls, v: str) -> str:\n    cleaned = v.strip()\n    if len(cleaned) < 3:\n        raise ValueError("too short")\n    return cleaned',
    },
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D3 · Validators ลึกขึ้น" }],
  },
  coercion: {
    id: "coercion",
    term: "coercion (lax mode)",
    thai: "การแปลงชนิดข้อมูลอัตโนมัติ",
    short: 'Pydantic แปลง `"0.92"` เป็น `0.92` ให้เมื่อแปลงได้ — แต่ `"abc"` ยังผิดอยู่',
    plain:
      "โหมดปกติของ Pydantic (lax) ยอมแปลงชนิดที่ปลอดภัย เช่น string ตัวเลข → float เพื่อรองรับ JSON ที่ไม่เป๊ะ ถ้าต้องการเข้มงวดให้ตั้ง `strict=True` ที่ field หรือ model การรู้ว่าอะไรถูกแปลงช่วยให้ไม่งงเมื่อ type ในผลลัพธ์ต่างจากข้อมูลดิบ",
    analogy: "เหมือนพนักงานที่รับกระดาษเขียน '100' แล้วพิมพ์เป็นตัวเลข 100 ให้ แต่ไม่เดาถ้าเขียนว่า 'ร้อยกว่า ๆ'",
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D3 · Strict mode" }],
  },
  "data-contract": {
    id: "data-contract",
    term: "data contract",
    thai: "สัญญาข้อมูลระหว่างส่วนต่าง ๆ ของระบบ",
    short: "ข้อตกลงที่ตรวจได้ว่าข้อมูลที่ผ่านขอบแต่ละจุดต้องมีหน้าตาอย่างไร",
    plain:
      "แทนที่จะส่ง `dict` เปล่า ๆ ไปทั่วโค้ด เรากำหนดสัญญาไว้ที่ขอบระบบ (API input, ผลจาก LLM, ผลจาก tool) ส่วนที่อยู่ลึกกว่านั้นจึงเชื่อถือข้อมูลได้โดยไม่ต้องเช็กซ้ำ",
    analogy: "เหมือนข้อตกลงการส่งของ: ถ้ากล่องไม่ตรงสเปกก็ไม่รับตั้งแต่หน้าประตู",
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D109 · Tool calling" }],
  },
  "structured-output": {
    id: "structured-output",
    term: "structured output",
    thai: "ผลลัพธ์ของ LLM ที่มีโครงสร้างตาม schema",
    short: "ให้ LLM ตอบเป็น JSON ตาม schema ที่กำหนด แล้วตรวจด้วย Pydantic ก่อนใช้งาน",
    plain:
      "แทนที่จะอ่านข้อความอิสระ เราให้โมเดลตอบเป็น JSON (เช่น category + confidence) ซึ่งโค้ดเรานำไปใช้ต่อได้ตรง ๆ แต่ต้อง validate เสมอ เพราะโมเดลยังอาจตอบผิดรูปได้",
    analogy: "เหมือนให้พนักงานกรอกแบบฟอร์มแทนการเล่าให้ฟังปากเปล่า",
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D77 · Structured outputs" }, { label: "D78 · Validation-repair loop" }],
  },
  payload: {
    id: "payload",
    term: "payload",
    thai: "เนื้อข้อมูลที่ส่งเข้าหรือออกระบบ",
    short: "ข้อมูลหลักที่ถูกส่งใน request/response เช่น JSON body ของ API",
    plain:
      "ในงาน AI payload อาจเป็นคำถามของผู้ใช้พร้อมพารามิเตอร์ (`top_k`, `temperature`) หรือ JSON ที่โมเดลตอบกลับ ทุก payload ที่ข้ามขอบระบบควรผ่านการ validate",
    analogy: "เหมือนสิ่งของในกล่องพัสดุ (ไม่นับกล่องและป้ายที่อยู่)",
    related: [{ label: "D1 · Pydantic v2", lessonId: "d001" }, { label: "D13 · HTTP clients" }],
  },
  "fail-fast": {
    id: "fail-fast",
    term: "fail-fast",
    thai: "ล้มเร็วเมื่อข้อมูลผิด",
    short: "หยุดและรายงานปัญหาทันทีที่พบข้อมูลผิด แทนที่จะปล่อยไปพังไกลจุดเกิดเหตุ",
    plain:
      "ถ้าปล่อย `category = \"unknown\"` ไหลต่อไป อาจไปพังที่ระบบสร้างทิกเก็ตหรือทำให้ข้อมูลเสียเงียบ ๆ การโยน `ValidationError` ทันทีทำให้เรารู้จุดเกิดเหตุ และเลือก retry/fallback ได้อย่างตั้งใจ",
    analogy: "เหมือนสัญญาณเตือนควันที่ดังตั้งแต่เริ่มมีควัน ไม่ใช่ตอนไฟลามทั้งตึก",
    related: [{ label: "D1 · ValidationError", lessonId: "d001" }, { label: "D14 · Retry & backoff" }],
  },
  "top-k": {
    id: "top-k",
    term: "top_k",
    thai: "จำนวนผลลัพธ์ที่ดึงมาใช้",
    short: "ใน RAG คือจำนวน chunk ที่ค้นคืนมาใส่ prompt — มากไปทำให้ context ล้นและแพง",
    plain:
      "`top_k=5` หมายถึงดึงเอกสารที่เกี่ยวข้องที่สุด 5 ชิ้น ถ้ามีคนส่ง `top_k=10000` มา ระบบอาจกิน context window และค่า API มหาศาล จึงต้องมีขอบบนเสมอ",
    analogy: "เหมือนบอกบรรณารักษ์ว่าขอหนังสือที่เกี่ยวข้อง 'ไม่เกิน 5 เล่ม' ไม่ใช่ 'เอามาให้หมดห้องสมุด'",
    related: [{ label: "D1 · Input bounding", lessonId: "d001" }, { label: "D93 · Naive RAG" }],
  },
  temperature: {
    id: "temperature",
    term: "temperature",
    thai: "พารามิเตอร์ความสุ่มของการสร้างข้อความ",
    short: "ค่าต่ำ (≈0) ให้คำตอบนิ่งและคาดเดาได้ ค่าสูงให้ความหลากหลายแต่เสี่ยงเพี้ยน",
    plain:
      "ใช้ควบคุมการสุ่มเลือก token ถัดไป งานแยกประเภท/ดึงข้อมูลมักใช้ค่าต่ำ งานสร้างสรรค์ใช้สูงขึ้น เราจำกัดช่วง (เช่น 0.0–1.0) เพื่อกันค่าแปลก ๆ จากผู้ใช้หรือบั๊ก",
    analogy: "เหมือนปุ่มปรับความกล้าของนักเขียน: ต่ำ = เขียนตามสูตร, สูง = ลองเสี่ยงดู",
    related: [{ label: "D1 · Input bounding", lessonId: "d001" }, { label: "D73 · LLM API & sampling" }],
  },
  llm: {
    id: "llm",
    term: "LLM",
    thai: "โมเดลภาษาขนาดใหญ่",
    short: "โมเดลที่สร้างข้อความต่อจาก prompt — เป็นเครื่องมือที่เก่งแต่ output ไม่รับประกันความถูกต้อง",
    plain:
      "LLM (Large Language Model) ทำนายข้อความถัดไปจากบริบท จึงมีโอกาสตอบเกินจริงหรือผิดรูป (hallucination) วิศวกร AI ต้องออกแบบระบบรอบโมเดลให้ตรวจสอบได้ ไม่ใช่เชื่อ output ทุกอย่าง",
    analogy: "เหมือนเพื่อนร่วมงานที่เก่งมากแต่บางครั้งมั่นใจเกินจริง — ต้องมีขั้นตอนตรวจงาน",
    related: [{ label: "D73 · Calling LLM APIs" }, { label: "D77 · Structured outputs" }],
  },
  pytest: {
    id: "pytest",
    term: "pytest",
    thai: "เฟรมเวิร์กทดสอบของ Python",
    short: "เขียนฟังก์ชัน `test_*` ด้วย `assert` แล้วรัน `uv run pytest` เพื่อตรวจโค้ดอัตโนมัติ",
    plain:
      "pytest ค้นหาไฟล์ `test_*.py` รันฟังก์ชัน `test_*` และรายงานว่าข้อไหนผ่าน/ไม่ผ่านพร้อมรายละเอียด `pytest.raises(...)` ใช้ยืนยันว่าโค้ด 'ควร' โยน exception ในกรณีข้อมูลผิด",
    analogy: "เหมือนผู้ตรวจข้อสอบอัตโนมัติที่ตรวจทุกครั้งที่เรากด",
    example: { language: "bash", code: "uv run pytest -q" },
    related: [{ label: "D1 · Exercise tests", lessonId: "d001" }, { label: "D9 · pytest & fixtures" }],
  },
  ruff: {
    id: "ruff",
    term: "Ruff",
    thai: "linter/formatter ที่เร็วมากสำหรับ Python",
    short: "ตรวจโค้ดหาข้อผิดพลาด/สไตล์ เช่น import ที่ไม่ได้ใช้ ด้วยคำสั่ง `uv run ruff check .`",
    plain:
      "Ruff จับปัญหาก่อนรันโค้ด เช่น `F401` (import ที่ไม่ได้ใช้) หรือชื่อที่ยังไม่ได้ประกาศ ใน D001 เกณฑ์ผ่านรวมถึงไม่มี lint error จาก `ruff check`",
    analogy: "เหมือนโปรแกรมตรวจคำผิดสำหรับโค้ด",
    example: { language: "bash", code: "uv run ruff check ." },
    related: [{ label: "D1 · Exercise acceptance", lessonId: "d001" }, { label: "D11 · Ruff & pre-commit" }],
  },
  serialization: {
    id: "serialization",
    term: "serialization (model_dump_json)",
    thai: "การแปลงออบเจกต์เป็น JSON/ข้อความ",
    short: "`model.model_dump_json()` แปลง model ที่ตรวจแล้วเป็น JSON มาตรฐานพร้อมส่งต่อ",
    plain:
      "หลัง validate แล้ว เรามักส่งข้อมูลต่อเป็น JSON ให้ API/DB/ไฟล์ `model_dump_json()` ได้ JSON string ส่วน `model_dump()` ได้ dict — ข้อมูลที่ออกจากที่นี่เป็นข้อมูลที่ผ่านสัญญาแล้ว",
    analogy: "เหมือนปิดผนึกกล่องพัสดุหลังตรวจของครบแล้ว",
    example: { language: "python", code: 'print(result.model_dump_json())\n# {"ticket_id":"TKT-2026","category":"billing",...}' },
    related: [{ label: "D1 · Worked example", lessonId: "d001" }, { label: "D3 · JSON serialization" }],
  },
  hallucination: {
    id: "hallucination",
    term: "hallucination",
    thai: "การที่โมเดลสร้างข้อมูลที่ไม่จริงอย่างมั่นใจ",
    short: "LLM ตอบสิ่งที่ฟังดูสมเหตุสมผลแต่ไม่มีอยู่จริง หรือฝืนรูปแบบที่กำหนด",
    plain:
      "ใน structured output hallucination อาจเป็น category ที่ไม่มีใน schema หรือ confidence ที่เกิน 1.0 — ด่าน validation ช่วยจับกรณีรูปแบบผิดได้ แต่ไม่ใช่ทุกกรณีของความผิดเชิงเนื้อหา (ซึ่งต้องใช้ evals ใน Phase 5)",
    analogy: "เหมือนนักเรียนที่ตอบข้อสอบด้วยความมั่นใจทั้งที่ไม่รู้คำตอบ",
    related: [{ label: "D1 · Fail-fast", lessonId: "d001" }, { label: "D105 · Groundedness", lessonId: "d105" }, { label: "D125 · Evals", lessonId: "d125" }],
  },
  comprehension: {
    id: "comprehension",
    term: "comprehension",
    thai: "นิพจน์สร้างคอลเลกชันแบบกระชับ",
    short: "ไวยากรณ์สั้น ๆ สำหรับแปลงและกรอง list / dict / set ในบรรทัดเดียว",
    plain:
      "list/dict/set comprehension ช่วยแปลงข้อมูลดิบ เช่น กรองข้อความว่างหรือสร้าง lookup map ได้อ่านง่ายกว่าการเขียน for-loop เปล่า ๆ หลายบรรทัด (แต่ถ้าซับซ้อนเกิน 2 ชั้นควรแยกเป็นฟังก์ชัน)",
    analogy: "เหมือนสายพานคัดแยกของที่กรองและติดป้ายในขั้นตอนเดียว",
    example: { language: "python", code: 'clean = [q.strip() for q in queries if q.strip()]' },
    related: [{ label: "D2 · Collections & Type Hints", lessonId: "d002" }],
  },
  jsonl: {
    id: "jsonl",
    term: "JSONL (JSON Lines)",
    thai: "ไฟล์ JSON ทีละบรรทัด",
    short: "รูปแบบไฟล์ที่แต่ละบรรทัดคือ JSON 1 ก้อน อ่านแบบ streaming ทีละบรรทัดได้โดยไม่กิน RAM",
    plain:
      "ต่างจาก JSON array ขนาดใหญ่ที่ต้องโหลดทั้งไฟล์เข้าหน่วยความจำ JSONL ให้เราอ่านและเขียนข้อมูลชุดใหญ่ (เช่น dataset 100,000 ทิกเก็ต หรือ golden eval cases) ทีละบรรทัดอย่างปลอดภัย",
    analogy: "เหมือนสมุดลงเวลาที่เพิ่มบรรทัดใหม่ต่อท้ายได้เรื่อย ๆ ไม่ต้องรื้อทั้งเล่ม",
    related: [{ label: "D5 · File I/O & JSONL", lessonId: "d005" }, { label: "D125 · Golden Dataset", lessonId: "d125" }],
  },
  structlog: {
    id: "structlog",
    term: "structured logging (structlog)",
    thai: "ล็อกแบบมีโครงสร้างคีย์-ค่า",
    short: "บันทึก log เป็น JSON หรือ key=value แทนข้อความลอย ๆ เพื่อให้ค้นหาและทำ alert ได้",
    plain:
      "เมื่อแอป AI มีหลาย request พร้อมกัน การพิมพ์ข้อความธรรมดาด้วย `print()` ไล่ดูยากมาก structured logging แนบ `request_id`, `latency_ms`, `model` เป็นฟิลด์ชัด ๆ ค้นหาในระบบ monitoring ได้ทันที",
    analogy: "เหมือนตาราง Excel ที่มีคอลัมน์ชัดเจน เทียบกับการจดโน้ตยาวเป็นย่อหน้าเดียว",
    related: [{ label: "D6 · Error Handling & structlog", lessonId: "d006" }, { label: "D133 · Observability", lessonId: "d133" }],
  },
  "env-config": {
    id: "env-config",
    term: "pydantic-settings & .env",
    thai: "การตั้งค่าผ่านตัวแปรแวดล้อม",
    short: "แยกค่าคอนฟิกและ API key ออกจากโค้ด แล้วตรวจความครบถ้วนตอนสตาร์ตแอป",
    plain:
      "ห้าม hardcode secret ลงในโค้ดหรือ commit `.env` ขึ้น Git; `pydantic-settings` โหลดค่าจาก environment variables และตรวจสอบ type ให้ตั้งแต่แอปเริ่มทำงาน (fail-fast ถ้าขาด key)",
    analogy: "เหมือนกุญแจบ้านที่เก็บไว้ในกระเป๋า ไม่ได้สลักติดไว้บนป้ายหน้าบ้าน",
    related: [{ label: "D7 · Environment Config", lessonId: "d007" }, { label: "D143 · Secrets & Cloud Deploy", lessonId: "d143" }],
  },
  fixture: {
    id: "fixture",
    term: "pytest fixture",
    thai: "ตัวเตรียมสภาพแวดล้อมให้เทสต์",
    short: "ฟังก์ชัน `@pytest.fixture` ที่สร้างข้อมูลหรือ resource ตัวอย่างแล้วส่งให้เทสต์หลายข้อใช้ซ้ำ",
    plain:
      "แทนที่จะคัดลอกโค้ดสร้าง sample ticket หรือ temporary directory ในทุกเทสต์ fixture ช่วยเตรียมและเก็บกวาด (teardown) ให้อัตโนมัติ ทำให้เทสต์สั้นและแยกอิสระต่อกัน",
    analogy: "เหมือนผู้ช่วยจัดเตรียมอุปกรณ์ทดลองบนโต๊ะก่อนเริ่มแต่ละการทดลองแล้วเก็บให้สะอาด",
    related: [{ label: "D9 · pytest & Fixtures", lessonId: "d009" }],
  },
  mocking: {
    id: "mocking",
    term: "mocking",
    thai: "การจำลองการเรียกภายนอกในเทสต์",
    short: "แทนที่การยิง API จริงด้วยผลลัพธ์จำลอง เพื่อให้เทสต์เร็ว ฟรี และคุมผลได้ 100%",
    plain:
      "เทสต์ไม่ควรยิง LLM API จริงทุกครั้งเพราะช้า เสียเงิน และสุ่ม เราใช้ mock/monkeypatch จำลองทั้งกรณีสำเร็จ กรณี timeout และกรณี 429 rate limit",
    analogy: "เหมือนเครื่องจำลองการบินที่ฝึกนักบินรับมือพายุได้โดยไม่ต้องเอาเครื่องจริงไปเสี่ยง",
    related: [{ label: "D10 · Parametrized & Mocking", lessonId: "d010" }],
  },
  httpx: {
    id: "httpx",
    term: "httpx",
    thai: "HTTP client สมัยใหม่ของ Python",
    short: "ไลบรารีเรียก API ที่รองรับทั้ง sync และ async พร้อม timeout และ connection pooling",
    plain:
      "AI Engineer ใช้ `httpx` ทั้งแบบตรงและเบื้องหลัง SDK ของ OpenAI/Anthropic ต้องตั้ง `timeout` เสมอและใช้ `Client`/`AsyncClient` ซ้ำเพื่อไม่ให้สร้าง TCP connection ใหม่ทุกครั้ง",
    analogy: "เหมือนโทรศัพท์ออฟฟิศที่ต่อสายค้างไว้ให้โทรออกเร็วกว่ากดต่อใหม่ทุกรอบ",
    related: [{ label: "D13 · HTTP Clients with httpx", lessonId: "d013" }, { label: "D18 · Concurrent Requests", lessonId: "d018" }],
  },
  "exponential-backoff": {
    id: "exponential-backoff",
    term: "exponential backoff & jitter",
    thai: "การลองใหม่แบบเว้นระยะเพิ่มขึ้นพร้อมสุ่ม",
    short: "เพิ่มเวลารอทวีคูณ (1s → 2s → 4s) และสุ่มเศษเวลาเล็กน้อยเพื่อไม่ให้ทุกเครื่องยิงชนกันพร้อมกัน",
    plain:
      "เมื่อ LLM API ตอบ 429 หรือ 503 ถ้ารีทรายทันทีจะยิ่งซ้ำเติมเซิร์ฟเวอร์ การเว้นระยะแบบทวีคูณบวก jitter (เช่นด้วย `tenacity`) ช่วยให้ระบบฟื้นตัวได้โดยไม่เกิด thundering herd",
    analogy: "เหมือนคนหลายคนรอเข้าประตูแคบ ถ้าทุกคนถอยแล้วลองใหม่พร้อมกันจะชนอีก ต้องรอห่างขึ้นแบบสุ่มเล็กน้อย",
    related: [{ label: "D14 · Retry with tenacity", lessonId: "d014" }],
  },
  idempotency: {
    id: "idempotency",
    term: "idempotency",
    thai: "ทำซ้ำแล้วได้ผลเดิมไม่เบิ้ล",
    short: "คุณสมบัติที่เรียกคำสั่งเดิมซ้ำหลายครั้งได้ผลลัพธ์เท่ากับเรียกครั้งเดียว",
    plain:
      "เมื่อระบบ retry หลัง timeout เราอาจไม่รู้ว่าคำขอแรกสำเร็จไปแล้วหรือไม่ การใช้ idempotency key ป้องกันการสร้างทิกเก็ตซ้ำหรือตัดเงินลูกค้าเบิ้ล",
    analogy: "เหมือนปุ่มเรียกลิฟต์ กดย้ำ 5 ครั้งลิฟต์ก็มาแค่ครั้งเดียว",
    related: [{ label: "D15 · Rate Limiting & Idempotency", lessonId: "d015" }, { label: "D110 · Safe Tools", lessonId: "d110" }],
  },
  "circuit-breaker": {
    id: "circuit-breaker",
    term: "circuit breaker",
    thai: "เบรกเกอร์ตัดวงจรเมื่อปลายทางล่ม",
    short: "หยุดยิงไปยังบริการที่ล้มต่อเนื่องชั่วคราวแล้วคืน fallback ทันที เพื่อไม่ให้ระบบเรารอจนค้างตาม",
    plain:
      "ถ้า provider ภายนอกล่ม 100% การ retry ทุกคำขอจะทำให้คิวล้นและกิน thread/connection หมด circuit breaker เปิดวงจรชั่วคราว (open) แล้วค่อยลองส่งคำขอทดสอบ (half-open) เมื่อครบเวลา",
    analogy: "เหมือนเบรกเกอร์ไฟบ้านที่ตัดทันทีเมื่อไฟลัดวงจร เพื่อไม่ให้ไหม้ทั้งหลัง",
    related: [{ label: "D15 · Circuit Breaker", lessonId: "d015" }, { label: "D177 · Load & Failure Testing", lessonId: "d177" }],
  },
  asyncio: {
    id: "asyncio",
    term: "asyncio & event loop",
    thai: "การทำงานแบบไม่รอค้างสำหรับงาน I/O",
    short: "สลับไปทำงานอื่นระหว่างรอเครือข่าย/API ตอบกลับบน thread เดียวด้วย `async`/`await`",
    plain:
      "งาน AI ส่วนใหญ่เสียเวลารอ network (เรียก LLM, ค้น vector DB) `asyncio` ใช้ event loop จัดการหลาย coroutine พร้อมกันโดยไม่เสียเวลานั่งรอทีละตัว",
    analogy: "เหมือนเชฟคนเดียวที่ต้มน้ำไว้แล้วหันไปหั่นผักระหว่างรอน้ำเดือด แทนที่จะยืนจ้องหม้อ",
    related: [{ label: "D17 · asyncio Mental Model", lessonId: "d017" }, { label: "D18 · gather & Semaphore", lessonId: "d018" }],
  },
  semaphore: {
    id: "semaphore",
    term: "asyncio.Semaphore",
    thai: "ตัวจำกัดจำนวนงานพร้อมกัน",
    short: "จำกัด concurrency ไม่ให้ยิง API พร้อมกันมากเกินโควตาหรือจนติด 429",
    plain:
      "`asyncio.gather` เปล่า ๆ กับงาน 500 ชิ้นจะยิงพร้อมกันทั้งหมดจนโดน rate limit การครอบด้วย `asyncio.Semaphore(5)` บังคับให้วิ่งพร้อมกันไม่เกิน 5 งาน",
    analogy: "เหมือนบัตรคิวเข้าห้องสมุดที่มีแค่ 5 ใบ ใครออกแล้วคนถัดไปถึงเข้าได้",
    related: [{ label: "D18 · gather & Semaphore", lessonId: "d018" }],
  },
  sse: {
    id: "sse",
    term: "SSE (Server-Sent Events)",
    thai: "การส่งข้อมูลต่อเนื่องจากเซิร์ฟเวอร์ทีละชิ้น",
    short: "โปรโตคอล HTTP ที่ส่ง token จาก LLM กลับมาแสดงผลทีละคำแบบ streaming",
    plain:
      "แทนที่จะรอ LLM เขียนครบ 500 คำแล้วค่อยแสดงหน้าจอ SSE ส่งอีเวนต์ `data: ...` มาต่อเนื่อง ทำให้ผู้ใช้เห็นคำตอบทันทีและลดความรู้สึกว่าระบบช้า",
    analogy: "เหมือนอ่านข้อความแชตที่พิมพ์ไหลมาทีละประโยค แทนที่จะรอจดหมายส่งมาทั้งฉบับ",
    related: [{ label: "D19 · Async Generators & SSE", lessonId: "d019" }, { label: "D75 · Streaming UX & TTFT", lessonId: "d075" }, { label: "D138 · FastAPI SSE", lessonId: "d138" }],
  },
  typer: {
    id: "typer",
    term: "Typer",
    thai: "ไลบรารีสร้าง CLI จาก type hints",
    short: "สร้างคำสั่ง command-line พร้อม `--help` และการตรวจ argument อัตโนมัติจาก Python type hints",
    plain:
      "AI Engineer สร้าง CLI เยอะมาก เช่น ingest เอกสาร รัน eval หรือทดสอบ pipeline; Typer ใช้แนวคิดเดียวกับ FastAPI ทำให้อ่านโค้ดแล้วรู้ทันทีว่าคำสั่งรับพารามิเตอร์อะไรบ้าง",
    analogy: "เหมือนแปลงฟังก์ชัน Python ธรรมดาให้มีแผงปุ่มกดและคู่มือใช้งานในเทอร์มินัลทันที",
    related: [{ label: "D23 · CLI Tooling with Typer", lessonId: "d023" }],
  },
  sqlite: {
    id: "sqlite",
    term: "SQLite & parameterized query",
    thai: "ฐานข้อมูลไฟล์เดียวและคำสั่งแบบผูกพารามิเตอร์",
    short: "ฐานข้อมูล SQL ที่ไม่ต้องรันเซิร์ฟเวอร์แยก เหมาะกับ cache และ prototype พร้อมใช้ `?` กัน SQL injection",
    plain:
      "SQLite ติดมากับ Python ใช้เก็บ cache ผลลัพธ์ LLM metadata หรือบันทึก eval ได้ทันที กฎเหล็กคือส่งค่าผ่าน placeholder (`?`) เสมอ ห้ามต่อสตริง f-string เข้าคำสั่ง SQL",
    analogy: "เหมือนตู้เก็บแฟ้มในโต๊ะทำงานที่จัดดัชนีค้นหาเร็ว โดยไม่ต้องสร้างอาคารคลังเอกสารแยก",
    related: [{ label: "D26 · Parameterized Queries", lessonId: "d026" }, { label: "D27 · Caching Patterns", lessonId: "d027" }],
  },
  caching: {
    id: "caching",
    term: "caching (LRU / disk / semantic)",
    thai: "การเก็บผลลัพธ์ไว้ใช้ซ้ำ",
    short: "จำคำตอบของอินพุตเดิมเพื่อลด latency และประหยัดค่า LLM API",
    plain:
      "คำถามซ้ำ ๆ ในระบบซัพพอร์ตไม่จำเป็นต้องเสียเงินเรียก LLM ใหม่ทุกรอบ เราเริ่มจาก cache แบบตรงตัว (exact match ใน RAM/SQLite) แล้วต่อยอดเป็น semantic cache ใน Phase 5",
    analogy: "เหมือนจดคำตอบคำถามยอดฮิตไว้บนโพสต์อิตหน้าจอ ไม่ต้องเดินไปเปิดคู่มือทุกครั้ง",
    related: [{ label: "D27 · Caching Patterns", lessonId: "d027" }, { label: "D146 · Semantic Caching", lessonId: "d146" }],
  },
  polars: {
    id: "polars",
    term: "Polars",
    thai: "ไลบรารีจัดการตารางข้อมูลความเร็วสูง",
    short: "DataFrame สมัยใหม่เขียนด้วย Rust รองรับ expression ที่อ่านง่ายและ Lazy mode ประหยัด RAM",
    plain:
      "Polars ใช้ multi-threading อัตโนมัติและมี `LazyFrame` ที่จัดลำดับ query ให้เหมาะสมก่อนรันจริง เหมาะกับทำความสะอาดชุดข้อมูลข้อความและ log ขนาดใหญ่ก่อนเทรน ML หรือทำ RAG",
    analogy: "เหมือนวางแผนเส้นทางส่งของทั้งหมดให้สั้นที่สุดก่อนสตาร์ตรถ แทนที่จะขับตามใบสั่งทีละใบ",
    related: [{ label: "D33 · Tabular Data with Polars", lessonId: "d033" }],
  },
  duckdb: {
    id: "duckdb",
    term: "DuckDB",
    thai: "เอนจิน SQL วิเคราะห์ข้อมูลบนเครื่อง",
    short: "รัน SQL วิเคราะห์ไฟล์ CSV/Parquet ขนาดใหญ่ได้โดยตรงบนเครื่องโดยไม่ต้องตั้งคลังข้อมูล",
    plain:
      "DuckDB ออกแบบมาสำหรับงานวิเคราะห์แบบคอลัมน์ (OLAP) คิวรีไฟล์ Parquet หลายแสนแถวได้ในเสี้ยววินาที ใช้สำรวจ dataset ตรวจคุณภาพข้อมูล และสรุป log ของระบบ AI",
    analogy: "เหมือนแว่นขยายพลังสูงที่ส่องไฟล์ข้อมูลขนาดใหญ่ด้วยภาษา SQL ได้ทันทีบนโน้ตบุ๊ก",
    related: [{ label: "D35 · Local Analytics with DuckDB", lessonId: "d035" }],
  },
  "dot-product": {
    id: "dot-product",
    term: "dot product & vector norm",
    thai: "ผลคูณจุดและความยาวเวกเตอร์",
    short: "พื้นฐานการวัดความสอดคล้องของเวกเตอร์สองตัวใน NumPy, embeddings และ self-attention",
    plain:
      "ผลคูณจุด (`a @ b`) คูณสมาชิกตำแหน่งเดียวกันแล้วรวมกัน ถ้าเวกเตอร์ชี้ทิศเดียวกันค่าจะสูง ส่วน norm (`||a||`) คือความยาวของเวกเตอร์ เมื่อนำมาหารจะได้ความคล้ายที่ไม่อิงขนาด",
    analogy: "เหมือนวัดว่าคนสองคนเดินไปทิศทางเดียวกันแค่ไหน โดยไม่สนใจว่าใครก้าวขายาวกว่า",
    related: [{ label: "D37 · Vectors & Dot Product", lessonId: "d037" }],
  },
  "cosine-similarity": {
    id: "cosine-similarity",
    term: "cosine similarity",
    thai: "ความคล้ายเชิงมุมโคไซน์",
    short: "วัดมุมระหว่างเวกเตอร์ 2 ตัว (ค่าระหว่าง -1 ถึง 1) ใช้เปรียบเทียบความหมายของ text embeddings",
    plain:
      "เอกสารสั้นกับเอกสารยาวที่พูดเรื่องเดียวกันอาจมีขนาดเวกเตอร์ต่างกัน แต่ชี้ไปทิศทางใกล้กัน Cosine similarity ดูที่ทิศทาง (มุม) จึงเหมาะกับการค้นหาเชิงความหมายมากกว่า Euclidean distance ในหลายกรณี",
    analogy: "เหมือนเปรียบเทียบทิศเข็มทิศของเรือสองลำ ไม่สนว่าลำไหนแล่นไปไกลกว่ากัน",
    related: [{ label: "D38 · Cosine vs Euclidean", lessonId: "d038" }, { label: "D70 · Semantic Search", lessonId: "d070" }],
  },
  "data-leakage": {
    id: "data-leakage",
    term: "data leakage",
    thai: "ข้อมูลจากชุดทดสอบรั่วเข้าสู่การเทรน",
    short: "ข้อผิดพลาดร้ายแรงที่ทำให้คะแนนตอนทดสอบดูสูงเกินจริง แต่พังเมื่อใช้งานจริง",
    plain:
      "ตัวอย่างยอดฮิตคือทำ scaling, TF-IDF หรือคัดเลือกฟีเจอร์บนข้อมูลทั้งหมดก่อน split train/test ทำให้โมเดลแอบเห็นสถิติของชุด test ทางแก้คือแยก split ก่อนเสมอแล้วใส่ทุกขั้นตอนไว้ใน `Pipeline`",
    analogy: "เหมือนแอบเห็นข้อสอบจริงระหว่างติว คะแนนสอบซ้อมเต็มร้อยแต่พอเจอโจทย์ใหม่ทำไม่ได้",
    related: [{ label: "D42 · Preventing Data Leakage", lessonId: "d042" }, { label: "D44 · Leakage Debugging", lessonId: "d044" }],
  },
  "precision-recall": {
    id: "precision-recall",
    term: "Precision, Recall, F1 & PR-AUC",
    thai: "ตัวชี้วัดงานจำแนกประเภทเมื่อข้อมูลไม่สมดุล",
    short: "Accuracy หลอกตาได้เมื่อคลาสหายาก ต้องดู Precision (ทายแม่น) คู่ Recall (เก็บครบ)",
    plain:
      "Precision ตอบว่าในสิ่งที่ทายว่าใช่ ถูกจริงกี่เปอร์เซ็นต์ ส่วน Recall ตอบว่าในของจริงทั้งหมด เราจับมาได้กี่เปอร์เซ็นต์ การปรับ threshold คือการเลือกว่าธุรกิจรับ False Positive หรือ False Negative ได้มากกว่ากัน",
    analogy: "เหมือนเครื่องตรวจจับควัน: Recall สูงคือไม่พลาดไฟไหม้จริง แต่ถ้าไวเกินจะร้องเตือนตอนทอดไข่ (Precision ต่ำ)",
    related: [{ label: "D45 · Classification Metrics", lessonId: "d045" }, { label: "D48 · Threshold Tuning", lessonId: "d048" }],
  },
  lightgbm: {
    id: "lightgbm",
    term: "LightGBM",
    thai: "โมเดล Gradient Boosted Trees สำหรับข้อมูลตาราง",
    short: "โมเดลต้นไม้ตัดสินใจแบบ boosting ที่เร็ว แม่น และมักชนะ LLM ทั้งต้นทุนและความเร็วในงานตาราง",
    plain:
      "LightGBM สร้างต้นไม้ทีละต้นเพื่อแก้ความผิดพลาดของต้นก่อนหน้า ใช้ทำนาย churn, priority ทิกเก็ต หรือ fraud ด้วย latency ระดับมิลลิวินาทีและต้นทุนถูกกว่า LLM หลายร้อยเท่า",
    analogy: "เหมือนทีมผู้เชี่ยวชาญที่คนถัดไปโฟกัสแก้เฉพาะเคสที่คนก่อนหน้ายังทายพลาด",
    related: [{ label: "D47 · Gradient Boosting with LightGBM", lessonId: "d047" }],
  },
  tfidf: {
    id: "tfidf",
    term: "TF-IDF",
    thai: "น้ำหนักคำตามความถี่และความเฉพาะเจาะจง",
    short: "แปลงข้อความเป็นเวกเตอร์ตัวเลขโดยให้คะแนนสูงกับคำที่โผล่บ่อยในเอกสารนี้แต่ไม่ได้โผล่ทุกเอกสาร",
    plain:
      "คำทั่วไปอย่าง 'ครับ' หรือ 'ของ' โผล่แทบทุกทิกเก็ตจึงได้น้ำหนักต่ำ ส่วนคำเฉพาะอย่าง 'ใบกำกับภาษี' ได้น้ำหนักสูง เมื่อใช้คู่กับ `LogisticRegression` จะได้ baseline จัดหมวดข้อความที่เร็วมาก",
    analogy: "เหมือนไฮไลต์เฉพาะคำสำคัญที่แยกเอกสารนี้ออกจากกองเอกสารอื่น",
    related: [{ label: "D49 · TF-IDF & Thai Word Seg", lessonId: "d049" }, { label: "D50 · Fast Thai Text Classifier", lessonId: "d050" }],
  },
  pythainlp: {
    id: "pythainlp",
    term: "PyThaiNLP (newmm)",
    thai: "ไลบรารีประมวลผลภาษาไทยและการตัดคำ",
    short: "ภาษาไทยไม่เว้นวรรคระหว่างคำ จึงต้องใช้ `word_tokenize(..., engine='newmm')` ก่อนทำ TF-IDF หรือ BM25",
    plain:
      "ถ้าแบ่งคำด้วยช่องว่างแบบภาษาอังกฤษ ประโยคไทยทั้งประโยคจะกลายเป็นคำเดียว ทำให้ค้นหาและจัดหมวดพัง `PyThaiNLP` ตัดคำไทยได้เร็วและรองรับ custom dictionary สำหรับศัพท์องค์กร",
    analogy: "เหมือนใส่เครื่องหมายขีดคั่นคำในประโยคไทยที่เขียนติดกันยาว ๆ เพื่อให้ระบบค้นหาอ่านรู้เรื่อง",
    related: [{ label: "D49 · PyThaiNLP newmm", lessonId: "d049" }, { label: "D99 · Thai Lexical BM25", lessonId: "d099" }],
  },
  onnx: {
    id: "onnx",
    term: "ONNX & model serialization",
    thai: "รูปแบบส่งออกโมเดลมาตรฐาน",
    short: "บันทึกโมเดลเป็นไฟล์ที่รันได้เร็วและปลอดภัยกว่าการโหลด pickle เปล่า ๆ ใน production",
    plain:
      "`joblib` ใช้งานง่ายใน Python แต่ผูกกับเวอร์ชันไลบรารีและไม่ปลอดภัยหากรับไฟล์จากแหล่งไม่น่าเชื่อถือ ส่วน `ONNX` เป็นมาตรฐานเปิดที่รัน inference ได้เร็วและข้ามภาษาได้",
    analogy: "เหมือนส่งออกเอกสารเป็น PDF ที่เปิดได้เหมือนกันทุกเครื่องแทนไฟล์ต้นฉบับเฉพาะโปรแกรม",
    related: [{ label: "D53 · Serialization & Versioning", lessonId: "d053" }, { label: "D58 · Latency Benchmark", lessonId: "d058" }],
  },
  "feature-drift": {
    id: "feature-drift",
    term: "feature / data drift",
    thai: "การเปลี่ยนแปลงของลักษณะข้อมูลจริงเมื่อเวลาผ่านไป",
    short: "ข้อมูลใน production เริ่มต่างจากข้อมูลตอนเทรน ทำให้ความแม่นยำของโมเดลค่อย ๆ ตก",
    plain:
      "เช่น ช่วงโปรโมชันใหญ่มีศัพท์ใหม่หรือพฤติกรรมลูกค้าเปลี่ยน โมเดลที่เคยแม่น 92% อาจตกลงเงียบ ๆ จึงต้องเฝ้าดูการกระจายตัวของฟีเจอร์และผลลัพธ์อย่างต่อเนื่อง",
    analogy: "เหมือนแผนที่ถนนเก่าที่ไม่ได้อัปเดตเมื่อมีการสร้างทางด่วนสายใหม่",
    related: [{ label: "D54 · Feature Drift & Monitoring", lessonId: "d054" }],
  },
  tensor: {
    id: "tensor",
    term: "PyTorch Tensor",
    thai: "อาร์เรย์หลายมิติสำหรับ Deep Learning",
    short: "โครงสร้างข้อมูลตัวเลขคล้าย NumPy array ที่รองรับ GPU และบันทึกกราฟคำนวณเพื่อหาอนุพันธ์ได้",
    plain:
      "ทุกอย่างใน neural network — ภาพ, token ID, embedding, weight — ถูกแทนด้วย tensor การเช็ก `.shape` และ `.dtype` อยู่เสมอคือวิธีกันบั๊กอันดับหนึ่งเวลาเขียน PyTorch",
    analogy: "เหมือนตารางตัวเลขหลายชั้นที่ซ้อนกันได้และจดสูตรคำนวณย้อนกลับไว้ในตัว",
    related: [{ label: "D61 · Tensors & Autograd", lessonId: "d061" }],
  },
  autograd: {
    id: "autograd",
    term: "autograd & backpropagation",
    thai: "การคำนวณความชันอัตโนมัติ",
    short: "กลไกของ PyTorch ที่ไล่ย้อนกราฟคำนวณเพื่อหา gradient สำหรับปรับค่าน้ำหนักให้ loss ลดลง",
    plain:
      "เมื่อเรียก `loss.backward()` PyTorch จะคำนวณว่าพารามิเตอร์แต่ละตัวควรขยับทิศไหนเพื่อลดความผิดพลาด สิ่งสำคัญคือต้องเรียก `optimizer.zero_grad()` ทุกรอบไม่ให้ gradient สะสมทับกัน",
    analogy: "เหมือนเข็มทิศที่ชี้ทางลงเขาที่ชันที่สุดให้เราเดินลงไปหาจุดต่ำสุดของความผิดพลาด",
    related: [{ label: "D61 · Tensors & Autograd", lessonId: "d061" }, { label: "D62 · 2-Layer Neural Net", lessonId: "d062" }],
  },
  transformer: {
    id: "transformer",
    term: "Transformer & Self-Attention",
    thai: "สถาปัตยกรรมหลักของ LLM ยุคใหม่",
    short: "กลไกให้ทุก token มองเห็นและถ่วงน้ำหนักความสัมพันธ์กับ token อื่นในบริบทพร้อมกัน",
    plain:
      "Self-attention คำนวณความเกี่ยวข้องผ่าน Query, Key, Value ทำให้โมเดลเข้าใจว่าคำสรรพนามอ้างถึงใครแม้จะห่างกันหลายบรรทัด แต่ต้นทุนหน่วยความจำและเวลาจะโตตามความยาวบริบท",
    analogy: "เหมือนคนอ่านประโยคที่กวาดตาเชื่อมคำสำคัญทุกจุดเข้าด้วยกันพร้อมกัน ไม่ใช่จำได้แค่คำก่อนหน้า",
    related: [{ label: "D65 · Transformer Intuition", lessonId: "d065" }],
  },
  "bpe-tokenizer": {
    id: "bpe-tokenizer",
    term: "BPE tokenizer",
    thai: "ตัวแบ่งข้อความเป็น token ย่อย",
    short: "แปลงข้อความเป็นชิ้นส่วนคำ (subwords) เพื่อป้อนเข้าโมเดล — ภาษาไทยมักใช้ token มากกว่าอังกฤษ 1.5–3 เท่า",
    plain:
      "LLM ไม่ได้คิดเงินเป็นตัวอักษรแต่คิดเป็น token โมเดลที่เทรนบนภาษาอังกฤษเป็นหลักมักหั่นคำไทยเป็นชิ้นเล็กกว่า ทำให้ต้นทุนสูงขึ้นและบริบทเต็มเร็วกว่า จึงต้องวัด token ภาษาไทยจริงก่อนประเมินราคา",
    analogy: "เหมือนค่าส่งพัสดุที่คิดตามจำนวนชิ้น หากแพ็กภาษาไทยถูกแยกเป็นชิ้นเล็กกว่า ค่าส่งและพื้นที่กล่องจะเพิ่มตาม",
    related: [{ label: "D66 · Tokenizers & BPE", lessonId: "d066" }, { label: "D68 · Thai Token Benchmark", lessonId: "d068" }],
  },
  "rlhf-dpo": {
    id: "rlhf-dpo",
    term: "Pre-training, SFT & RLHF/DPO",
    thai: "สามขั้นการฝึก LLM ให้ทำตามคำสั่ง",
    short: "Pre-training สอนความรู้ภาษา, SFT สอนตอบตามคำสั่ง, RLHF/DPO ปรับสไตล์และความปลอดภัยตามความชอบมนุษย์",
    plain:
      "โมเดลที่เพิ่ง pre-train เสร็จจะแค่ต่อข้อความเก่งแต่ยังคุยเป็นแชตไม่เป็น ขั้น post-training (SFT + preference alignment อย่าง RLHF หรือ DPO) คือสิ่งที่ทำให้โมเดลตอบคำถาม ปฏิเสธคำขออันตราย และทำตาม format ได้",
    analogy: "เหมือนอ่านหนังสือทั้งห้องสมุด (Pre-training) → ฝึกทำข้อสอบและแบบฝึกหัด (SFT) → มีพี่เลี้ยงติชมมารยาทและคุณภาพคำตอบ (RLHF/DPO)",
    related: [{ label: "D67 · Pre-training vs SFT vs DPO", lessonId: "d067" }],
  },
  embedding: {
    id: "embedding",
    term: "dense text embedding",
    thai: "เวกเตอร์แทนความหมายของข้อความ",
    short: "แปลงประโยคหรือย่อหน้าเป็นเวกเตอร์ตัวเลขที่ข้อความความหมายใกล้กันจะอยู่ใกล้กันในพื้นที่เวกเตอร์",
    plain:
      "ช่วยให้ค้นหาเอกสารด้วยความหมายได้แม้คำที่ใช้ไม่ตรงกันเป๊ะ เช่น 'ขอใบเสร็จ' กับ 'ใบกำกับภาษี' แต่ถ้าเป็นรหัสสินค้าเป๊ะ ๆ หรือชื่อเฉพาะควรใช้ร่วมกับ BM25 (Hybrid Search)",
    analogy: "เหมือนพิกัด GPS ของความหมาย: เรื่องคล้ายกันจะปักหมุดอยู่ในย่านเดียวกัน",
    related: [{ label: "D69 · Dense Embeddings", lessonId: "d069" }, { label: "D71 · Choosing Embeddings", lessonId: "d071" }],
  },
  "context-engineering": {
    id: "context-engineering",
    term: "context engineering",
    thai: "วิศวกรรมการจัดบริบทให้โมเดล",
    short: "ออกแบบ system prompt, ข้อมูลอ้างอิง, ตัวอย่าง few-shot และโครงสร้างข้อความให้โมเดลทำงานแม่นที่สุด",
    plain:
      "ไม่ใช่แค่เขียนประโยคสั่งเก๋ ๆ แต่คือการจัดส่งข้อมูลที่จำเป็น ครบ กระชับ แยกขอบเขตด้วย delimiter ชัดเจน และตัดสิ่งรบกวนออกเพื่อลดความสับสนและต้นทุน token",
    analogy: "เหมือนจัดแฟ้มสรุปข้อมูลให้ผู้เชี่ยวชาญอ่านก่อนตัดสินใจ ยิ่งแฟ้มชัดและไม่รก ผลลัพธ์ยิ่งแม่น",
    related: [{ label: "D74 · Context Engineering", lessonId: "d074" }],
  },
  ttft: {
    id: "ttft",
    term: "TTFT (Time-to-First-Token)",
    thai: "เวลารอจนเห็น token แรก",
    short: "ระยะเวลาตั้งแต่ผู้ใช้กดส่งคำถามจนเห็นตัวอักษรแรกโผล่บนหน้าจอ",
    plain:
      "ในแอปแชต AI ความรู้สึกว่าเร็วหรือช้าขึ้นกับ TTFT มากกว่าระยะเวลารวมทั้งหมด การเปิด streaming (SSE) และใช้ prompt caching ช่วยลด TTFT ได้อย่างเห็นได้ชัด",
    analogy: "เหมือนเวลารอพนักงานมารับออเดอร์และเสิร์ฟน้ำดื่มแรก ก่อนอาหารจานหลักจะครบ",
    related: [{ label: "D75 · Streaming UX & TTFT", lessonId: "d075" }, { label: "D135 · Latency Dashboards", lessonId: "d135" }],
  },
  "prompt-caching": {
    id: "prompt-caching",
    term: "prompt caching & model routing",
    thai: "การแคชพรอมต์ส่วนหน้าและเลือกขนาดโมเดลให้เหมาะงาน",
    short: "วางส่วนคงที่ไว้ต้น prompt เพื่อลดค่า input token และส่งงานง่ายไปโมเดลเล็กก่อน",
    plain:
      "ระบบ production ลดต้นทุนได้ 40–70% ด้วยสองเทคนิคนี้: ให้ prefix ของ system prompt + เอกสารอ้างอิงคงที่เพื่อติด cache และ route งานง่ายไปโมเดลเล็ก เก็บโมเดลใหญ่ไว้เฉพาะเคสซับซ้อน",
    analogy: "เหมือนร้านถ่ายเอกสารที่วางต้นฉบับค้างไว้บนเครื่อง และงานคัดแยกง่าย ๆ ให้ผู้ช่วยทำก่อนส่งผู้เชี่ยวชาญ",
    related: [{ label: "D79 · Prompt Caching & Routing", lessonId: "d079" }, { label: "D146 · Cost Optimization", lessonId: "d146" }],
  },
  quantization: {
    id: "quantization",
    term: "quantization (GGUF / INT4 / FP8)",
    thai: "การลดความละเอียดตัวเลขของน้ำหนักโมเดล",
    short: "บีบอัดพารามิเตอร์จาก 16-bit ลงเหลือ 8-bit หรือ 4-bit เพื่อลดการใช้ VRAM และรันบนเครื่องได้",
    plain:
      "ช่วยให้รันโมเดล open-weights ขนาด 7B–8B บนโน้ตบุ๊กด้วย Ollama หรือเพิ่ม throughput บน GPU เซิร์ฟเวอร์ แลกกับคุณภาพที่อาจลดลงเล็กน้อยซึ่งต้องวัดด้วย eval ของงานเรา",
    analogy: "เหมือนบีบอัดรูปภาพ RAW เป็น JPEG คุณภาพสูง ใช้พื้นที่น้อยลงมากแต่ยังดูคมชัดเกือบเท่าเดิม",
    related: [{ label: "D83 · Local Models with Ollama", lessonId: "d083" }, { label: "D145 · Self-Hosted Economics", lessonId: "d145" }],
  },
  lora: {
    id: "lora",
    term: "LoRA / QLoRA",
    thai: "การปรับจูนโมเดลแบบประหยัดพารามิเตอร์",
    short: "แทรกเมทริกซ์ขนาดเล็ก (adapter) เข้าไปฝึกแทนการแก้พารามิเตอร์ทั้งหมดของโมเดล",
    plain:
      "การ fine-tune แนะนำเมื่อ prompt + RAG ไม่พอ (เช่น ต้องการสไตล์เฉพาะทางหรือลดขนาดโมเดล) แต่หัวใจที่ตัดสินผลลัพธ์จริงคือคุณภาพและความสะอาดของชุดข้อมูลฝึก ไม่ใช่แค่จำนวนแถว",
    analogy: "เหมือนติดเลนส์เสริมให้กล้องตัวเดิมแทนการรื้อประกอบกล้องใหม่ทั้งตัว",
    related: [{ label: "D85 · Fine-Tune vs Prompt vs RAG", lessonId: "d085" }, { label: "D86 · LoRA / QLoRA Intuition", lessonId: "d086" }],
  },
  rag: {
    id: "rag",
    term: "RAG (Retrieval-Augmented Generation)",
    thai: "การค้นหาเอกสารประกอบก่อนให้โมเดลตอบ",
    short: "ดึงข้อความที่เกี่ยวข้องจากคลังความรู้องค์กรมาใส่ใน prompt เพื่อให้ LLM ตอบอิงข้อเท็จจริงล่าสุด",
    plain:
      "ช่วยแก้ข้อจำกัดที่ LLM ไม่รู้ข้อมูลภายในองค์กรและลด hallucination แต่ Naive RAG ที่แค่หั่นเอกสารแล้วค้น vector อย่างเดียวมักพังใน production จึงต้องอัปเกรดเป็น Hybrid Search + Rerank + Citations",
    analogy: "เหมือนสอบแบบเปิดหนังสือ (open-book exam) ที่ต้องเปิดให้ถูกหน้าก่อนเขียนคำตอบ",
    related: [{ label: "D93 · Naive RAG & Failures", lessonId: "d093" }, { label: "D101 · Hybrid Search RRF", lessonId: "d101" }],
  },
  chunking: {
    id: "chunking",
    term: "chunking",
    thai: "การแบ่งเอกสารยาวเป็นชิ้นย่อย",
    short: "ตัดเอกสารตามโครงสร้างหัวข้อ/ตารางและขนาด token พร้อม overlap เพื่อไม่ให้บริบทขาดกลางประโยค",
    plain:
      "ถ้า chunk ใหญ่เกินไปจะดึงข้อมูลรกเข้า prompt ถ้าเล็กเกินไปจะขาดหัวข้อและบริบทสำคัญ เช่น ตารางราคาที่หัวตารางหายไป การตรวจคุณภาพ chunk ด้วยตาและตัววัดจึงสำคัญมาก",
    analogy: "เหมือนตัดบทความยาวเป็นบัตรความรู้ที่มีหัวข้อติดไปด้วยทุกใบ ไม่ใช่ฉีกครึ่งกลางประโยค",
    related: [{ label: "D95 · Chunking Strategies", lessonId: "d095" }, { label: "D96 · Fixing Bad Chunks", lessonId: "d096" }],
  },
  hnsw: {
    id: "hnsw",
    term: "HNSW (Vector Index)",
    thai: "ดัชนีค้นหาเวกเตอร์แบบกราฟหลายชั้น",
    short: "โครงสร้าง index ที่ทำให้ค้นหาเพื่อนบ้านใกล้สุด (ANN) ใน pgvector/Qdrant ได้เร็วโดยไม่ต้องสแกนทุกแถว",
    plain:
      "เมื่อมีเอกสารหลักแสนชิ้น การคำนวณ cosine similarity กับทุกแถวจะช้า HNSW สร้างกราฟทางลัดหลายระดับเพื่อกระโดดเข้าใกล้คำตอบอย่างรวดเร็ว แลกกับความคลาดเคลื่อนเล็กน้อยและ RAM ที่เพิ่มขึ้น",
    analogy: "เหมือนเดินทางข้ามประเทศด้วยเครื่องบิน (ชั้นบน) แล้วค่อยต่อรถไฟและเดินเข้าซอย (ชั้นล่าง)",
    related: [{ label: "D97 · pgvector & HNSW", lessonId: "d097" }, { label: "D98 · Qdrant Collections", lessonId: "d098" }],
  },
  bm25: {
    id: "bm25",
    term: "BM25 (Lexical Search)",
    thai: "การค้นหาแบบจับคู่คำตรงตัว",
    short: "อัลกอริทึมค้นหาข้อความมาตรฐานที่แม่นมากกับรหัสสินค้า ชื่อรุ่น และศัพท์เฉพาะ (ต้องตัดคำไทยก่อน)",
    plain:
      "Dense embedding เก่งเรื่องความหมายแต่พลาดบ่อยเมื่อผู้ใช้พิมพ์รหัสเป๊ะ ๆ อย่าง `INV-2026-08` หรือชื่อนโยบายเฉพาะ BM25 + `PyThaiNLP` เข้ามาอุดจุดอ่อนนี้ได้อย่างลงตัว",
    analogy: "เหมือนดัชนีคำท้ายหนังสือที่เปิดเจอคำเป๊ะ ๆ ได้ทันที",
    related: [{ label: "D99 · Thai Lexical BM25", lessonId: "d099" }, { label: "D101 · Hybrid Search RRF", lessonId: "d101" }],
  },
  rrf: {
    id: "rrf",
    term: "RRF (Reciprocal Rank Fusion)",
    thai: "การรวมอันดับผลค้นหาจากหลายแหล่ง",
    short: "ผสานผลลัพธ์จาก BM25 และ Vector Search ด้วยอันดับ (`1/(k + rank)`) โดยไม่ต้องปรับสเกลคะแนนให้ยุ่งยาก",
    plain:
      "คะแนน BM25 กับ cosine similarity อยู่คนละหน่วยกัน นำมาบวกกันตรง ๆ ไม่ได้ RRF ใช้แค่อันดับ (rank) ทำให้เอกสารที่ติดอันดับต้น ๆ ทั้งสองฝั่งพุ่งขึ้นบนสุดอย่างเสถียร",
    analogy: "เหมือนรวมผลโหวตจากกรรมการสองชุดโดยนับคะแนนตามลำดับที่ 1, 2, 3 แทนคะแนนดิบที่สเกลไม่เท่ากัน",
    related: [{ label: "D101 · Hybrid Search RRF", lessonId: "d101" }],
  },
  reranker: {
    id: "reranker",
    term: "Cross-Encoder Reranker",
    thai: "โมเดลจัดอันดับซ้ำแบบอ่านคู่คำถาม-เอกสาร",
    short: "หยิบ top-20 จาก Hybrid Search มาอ่านคู่กับคำถามโดยละเอียดเพื่อคัด top-5 ที่แม่นที่สุดส่งเข้า LLM",
    plain:
      "Bi-encoder (embedding) แปลงคำถามและเอกสารแยกกันจึงเร็วแต่หยาบกว่า Cross-encoder อ่านคำถามพร้อมเนื้อหาเอกสารทีละคู่ จึงคัดความเกี่ยวข้องได้คมขึ้นมากโดยเพิ่ม latency แค่เล็กน้อย",
    analogy: "เหมือน HR คัดใบสมัคร 20 ใบแรกอย่างรวดเร็ว แล้วค่อยนั่งอ่านเรซูเม่เทียบตำแหน่งอย่างละเอียดเพื่อเลือก 5 คนสุดท้าย",
    related: [{ label: "D102 · Cross-Encoder Reranking", lessonId: "d102" }],
  },
  groundedness: {
    id: "groundedness",
    term: "groundedness & citations",
    thai: "การตอบอิงหลักฐานพร้อมอ้างอิงแหล่งที่มา",
    short: "บังคับให้คำตอบทุกข้อเท็จจริงอ้างอิง `[doc_id#chunk]` จากเอกสารที่ดึงมา และกล้าตอบ 'ไม่พบข้อมูล' เมื่อไม่มีหลักฐาน",
    plain:
      "ระบบ RAG ระดับองค์กรต้องตรวจสอบได้ว่าคำตอบมาจากเอกสารชิ้นไหน ถ้าเอกสารไม่มีคำตอบหรือขัดแย้งกัน ระบบควรปฏิเสธการเดา (abstention) แทนการแต่งเรื่อง",
    analogy: "เหมือนนักข่าวที่อ้างอิงแหล่งข่าวทุกย่อหน้า และไม่เขียนข่าวจากข้อมูลที่ยังไม่ยืนยัน",
    related: [{ label: "D105 · Grounded Citations", lessonId: "d105" }, { label: "D106 · Abstention", lessonId: "d106" }],
  },
  acl: {
    id: "acl",
    term: "ACL (Access-Control Filtering)",
    thai: "การกรองสิทธิ์การเข้าถึงเอกสารระดับผู้เช่า/บทบาท",
    short: "กรองสิทธิ์ `tenant_id`/`role` ตั้งแต่ตอนค้นหาในฐานข้อมูล เพื่อไม่ให้เอกสารลับรั่วข้ามผู้ใช้",
    plain:
      "ห้ามดึงเอกสารทั้งหมดเข้า prompt แล้วค่อยสั่ง LLM ว่า 'อย่าบอกข้อมูลของแผนกอื่น' เพราะเสี่ยงหลุดจาก prompt injection ต้องบังคับ filter ที่ระดับ query ของ vector/BM25 index เสมอ",
    analogy: "เหมือนคีย์การ์ดที่เปิดได้เฉพาะชั้นที่ได้รับอนุญาตตั้งแต่หน้าลิฟต์ ไม่ใช่เข้าไปทุกห้องแล้วค่อยขอร้องไม่ให้มอง",
    related: [{ label: "D107 · Incremental Indexing & ACL", lessonId: "d107" }, { label: "D108 · Tenant ACL Lab", lessonId: "d108" }],
  },
  "tool-calling": {
    id: "tool-calling",
    term: "Tool / Function Calling",
    thai: "การให้โมเดลเรียกใช้เครื่องมือผ่าน schema",
    short: "LLM ส่ง JSON ระบุชื่อเครื่องมือและอาร์กิวเมนต์ ส่วนโค้ดฝั่งเราเป็นผู้ตรวจและรันจริง",
    plain:
      "โมเดลไม่ได้รันโค้ดเอง แต่ส่งคำขอเรียกฟังก์ชันตาม JSON Schema โค้ดฝั่งเราต้อง validate ด้วย Pydantic บังคับสิทธิ์ และคืน error ที่ชัดเจนเมื่อพารามิเตอร์ผิด",
    analogy: "เหมือนแพทย์สั่งใบสั่งยา (JSON) แล้วเภสัชกร (โค้ดเรา) ตรวจขนาดยาก่อนจ่ายจริง",
    related: [{ label: "D109 · Native Tool Calling", lessonId: "d109" }, { label: "D110 · Safe Tools", lessonId: "d110" }],
  },
  mcp: {
    id: "mcp",
    term: "MCP (Model Context Protocol)",
    thai: "โปรโตคอลมาตรฐานเชื่อมแอป AI กับเครื่องมือและข้อมูล",
    short: "มาตรฐานเปิดที่แยก Host, Client และ Server เพื่อให้หลายแอป AI ใช้ tool/resource ชุดเดียวกันได้",
    plain:
      "แทนที่จะเขียนโค้ดเชื่อมฐานข้อมูลหรือระบบทิกเก็ตใหม่ทุกครั้งที่เปลี่ยนแอป AI เราห่อเป็น MCP Server ที่ประกาศ Tools และ Resources ตามสเปกกลาง แล้วให้ MCP Client เรียกใช้ได้อย่างปลอดภัย",
    analogy: "เหมือนพอร์ต USB-C สำหรับระบบ AI: ทำหัวเชื่อมมาตรฐานเดียว เสียบใช้ได้กับหลายอุปกรณ์",
    related: [{ label: "D113 · MCP Architecture", lessonId: "d113" }, { label: "D114 · Build Local MCP Server", lessonId: "d114" }],
  },
  langgraph: {
    id: "langgraph",
    term: "LangGraph",
    thai: "เฟรมเวิร์กคุมเวิร์กโฟลว์และเอเจนต์แบบกราฟสถานะ",
    short: "นิยามการทำงานของ AI เป็น State, Nodes และ Edges เพื่อให้ควบคุมลูป ขีดจำกัด และจุดขออนุมัติได้ชัด",
    plain:
      "ต่างจาก agent loop อิสระที่เดาทางยาก LangGraph ให้เรากำหนดเส้นทาง routing, max steps, budget และ checkpoint สำหรับ Human-in-the-Loop ได้อย่างเป็นระบบ",
    analogy: "เหมือนผังรางรถไฟที่มีประแจสับรางและสัญญาณหยุดชัดเจน ไม่ปล่อยรถวิ่งสุ่มบนถนน",
    related: [{ label: "D117 · Controlled Agent Loops", lessonId: "d117" }, { label: "D118 · Guarded Execution", lessonId: "d118" }],
  },
  hitl: {
    id: "hitl",
    term: "Human-in-the-Loop (HITL)",
    thai: "จุดหยุดให้มนุษย์ตรวจสอบก่อนทำรายการสำคัญ",
    short: "หยุดรอการยืนยันจากคนก่อนทำงานที่มีผลกระทบสูง เช่น คืนเงิน ลบข้อมูล หรือส่งอีเมลลูกค้า",
    plain:
      "การอ่านข้อมูล (read-only) ปล่อยให้ AI ทำอัตโนมัติได้ แต่ write action ที่ย้อนกลับยากควรมี approval checkpoint เสมอ เพื่อลดความเสี่ยงจาก Excessive Agency",
    analogy: "เหมือนระบบโอนเงินที่ให้กดยืนยัน OTP ก่อนเงินออกจากบัญชีจริง",
    related: [{ label: "D119 · Memory & HITL Checkpoints", lessonId: "d119" }, { label: "D149 · OWASP Excessive Agency", lessonId: "d149" }],
  },
  "golden-dataset": {
    id: "golden-dataset",
    term: "Golden Evaluation Dataset",
    thai: "ชุดข้อสอบมาตรฐานของระบบ AI",
    short: "ชุดคำถามจริง 30–50 ข้อพร้อมคำตอบ/เอกสารอ้างอิงที่ใช้วัดผลทุกครั้งที่แก้ prompt หรือเปลี่ยนโมเดล",
    plain:
      "การดูผลแค่ 2–3 ตัวอย่างด้วยตา (vibe check) พลาด regression บ่อยมาก Golden dataset ควรครอบคลุมทั้งเคสปกติ ภาษาไทยปนอังกฤษ เคสที่ตอบไม่ได้ และเคสโจมตี",
    analogy: "เหมือนชุดข้อสอบมาตรฐานกลางที่ใช้วัดผลนักเรียนทุกรุ่นบนไม้บรรทัดเดียวกัน",
    related: [{ label: "D125 · Eval-Driven Development", lessonId: "d125" }, { label: "D169 · Capstone 40-Case Eval", lessonId: "d169" }],
  },
  mrr: {
    id: "mrr",
    term: "Recall@k & MRR",
    thai: "ตัววัดคุณภาพระบบค้นคืนเอกสาร",
    short: "Recall@k วัดว่าเอกสารที่ถูกต้องติดใน k อันดับแรกไหม; MRR วัดว่ามันอยู่อันดับสูงแค่ไหน",
    plain:
      "ถ้าเอกสารเฉลยอยู่อันดับ 1 จะได้ reciprocal rank = 1.0, อันดับ 2 ได้ 0.5, อันดับ 5 ได้ 0.2 ตัววัดเหล่านี้คำนวณได้แบบ deterministic รวดเร็วและฟรี ก่อนจะเสียเงินเรียก LLM judge",
    analogy: "เหมือนค้นของใน Google: Recall@5 คืออยู่หน้าแรกไหม ส่วน MRR คืออยู่บนสุดของหน้าแรกไหม",
    related: [{ label: "D126 · Deterministic Evals", lessonId: "d126" }, { label: "D164 · Retrieval Benchmark", lessonId: "d164" }],
  },
  "llm-as-a-judge": {
    id: "llm-as-a-judge",
    term: "LLM-as-a-Judge",
    thai: "การใช้ LLM ประเมินคุณภาพคำตอบตามเกณฑ์",
    short: "ให้โมเดลตรวจคำตอบตาม rubric ที่ชัดเจน พร้อมคุมอคติ เช่น position bias และ verbosity bias",
    plain:
      "เหมาะกับงานปลายเปิดที่ตรวจด้วย regex ไม่ได้ แต่ต้อง calibrate เทียบกับคะแนนที่มนุษย์ให้เสมอ (human agreement) และใช้ rubric แบบ binary/discrete ชัด ๆ แทนคะแนนลอย ๆ 1–10",
    analogy: "เหมือนผู้ช่วยตรวจเรียงความที่มีเฉลยและเกณฑ์ให้คะแนนละเอียด โดยอาจารย์สุ่มตรวจซ้ำเพื่อเทียบมาตรฐาน",
    related: [{ label: "D127 · LLM-as-a-Judge", lessonId: "d127" }, { label: "D128 · Judge Calibration", lessonId: "d128" }],
  },
  ragas: {
    id: "ragas",
    term: "Ragas (RAG Triad)",
    thai: "กรอบประเมินคุณภาพระบบ RAG",
    short: "วัด 3 แกนหลัก: Faithfulness (ตอบไม่เกินเอกสาร), Context Precision (ดึงมาไม่รก), Context Recall (ดึงครบ)",
    plain:
      "ช่วยแยกอาการป่วยของระบบ RAG ออกเป็น 2 ส่วนชัด ๆ: ถ้า Context Recall ต่ำให้แก้ที่ chunking/retrieval แต่ถ้าดึงมาถูกแล้วแต่ Faithfulness ต่ำให้แก้ที่ prompt/generation",
    analogy: "เหมือนแยกตรวจว่าการสอบตกเกิดจาก 'เปิดหนังสือผิดหน้า' หรือ 'เปิดถูกหน้าแต่อ่านแล้วเขียนมั่ว'",
    related: [{ label: "D129 · RAG Triad with Ragas", lessonId: "d129" }],
  },
  promptfoo: {
    id: "promptfoo",
    term: "Promptfoo",
    thai: "เครื่องมือทดสอบ regression และ red-team สำหรับ prompt/LLM",
    short: "รันชุดทดสอบ prompt และเปรียบเทียบโมเดลแบบอัตโนมัติใน CI พร้อมเกณฑ์ผ่าน/ไม่ผ่าน",
    plain:
      "นิยามเคสทดสอบและ assertions ในไฟล์ YAML แล้วสั่งรันใน GitHub Actions เพื่อกันไม่ให้การแก้ prompt เล็ก ๆ ทำให้เคสสำคัญพังหรือเปิดช่องโหว่ prompt injection",
    analogy: "เหมือนชุด regression test ของเว็บ แต่ใช้ตรวจคุณภาพและความปลอดภัยของ prompt แทนปุ่มหน้าเว็บ",
    related: [{ label: "D130 · Promptfoo Regression", lessonId: "d130" }, { label: "D131 · Eval Gates in CI", lessonId: "d131" }],
  },
  otel: {
    id: "otel",
    term: "OpenTelemetry GenAI SemConv",
    thai: "มาตรฐานเก็บ trace และ metric ของระบบ AI",
    short: "รูปแบบมาตรฐานเปิดสำหรับบันทึก trace, span, ชื่อโมเดล, token และ latency ข้ามเครื่องมือได้",
    plain:
      "การใช้ semantic conventions ของ OpenTelemetry ทำให้โค้ดเราไม่ผูกขาดกับผู้ให้บริการ monitoring เจ้าเดียว และเห็นภาพรวมตั้งแต่ HTTP request → retrieval → LLM call → tool call ใน trace เดียวกัน",
    analogy: "เหมือนปลั๊กไฟและกล่องดำเครื่องบินที่เป็นมาตรฐานกลาง เสียบอ่านข้อมูลได้กับหลายเครื่องมือ",
    related: [{ label: "D133 · OTel GenAI SemConv", lessonId: "d133" }],
  },
  langfuse: {
    id: "langfuse",
    term: "Langfuse",
    thai: "แพลตฟอร์ม Tracing & Observability สำหรับ LLM",
    short: "บันทึก trace, prompt version, token, ต้นทุน และคะแนน eval ของทุกคำขอแบบละเอียด",
    plain:
      "เมื่อผู้ใช้บ่นว่าระบบช้าหรือตอบเพี้ยน Langfuse ให้เราเปิดดู trace waterfall ว่าช้าที่ขั้นไหน (embedding, rerank หรือ LLM) และดึงเคสที่พังจริงกลับมาเติมใน golden dataset",
    analogy: "เหมือนกล้องวงจรปิดพร้อมนาฬิกาจับเวลาที่บันทึกทุกขั้นตอนในครัวตั้งแต่วัตถุดิบจนเสิร์ฟ",
    related: [{ label: "D134 · Langfuse Tracing", lessonId: "d134" }, { label: "D136 · Latency Waterfall", lessonId: "d136" }],
  },
  fastapi: {
    id: "fastapi",
    term: "FastAPI (Async Lifespan & DI)",
    thai: "เฟรมเวิร์กสร้าง AI Microservice API",
    short: "สร้าง REST/SSE API ด้วย Pydantic + async พร้อมโหลดโมเดล/connection ครั้งเดียวใน lifespan",
    plain:
      "ใช้ `lifespan` เพื่อเปิด HTTP client, DB pool หรือ embedding model ครั้งเดียวตอนสตาร์ต และใช้ Dependency Injection (`Depends`) เพื่อส่งต่อบริการและสลับเป็น mock ได้ง่ายตอนเทสต์",
    analogy: "เหมือนเปิดเตาและเตรียมเครื่องครัวครั้งเดียวตอนเปิดร้าน ไม่ใช่จุดเตาใหม่ทุกจานที่มีลูกค้าสั่ง",
    related: [{ label: "D137 · Production AI API", lessonId: "d137" }, { label: "D138 · FastAPI SSE", lessonId: "d138" }],
  },
  dockerfile: {
    id: "dockerfile",
    term: "Multi-stage Dockerfile (non-root)",
    thai: "สูตรสร้างคอนเทนเนอร์ที่เล็กและปลอดภัย",
    short: "แยกขั้นติดตั้ง dependency ออกจาก runtime image, ใช้ `uv.lock` และรันด้วย user ที่ไม่ใช่ root",
    plain:
      "Image ที่เล็กทำให้ deploy และ scale เร็ว ส่วนการรันแบบ non-root ลดความเสียหายหากเกิดช่องโหว่ และห้าม COPY ไฟล์ `.env` หรือ secret เข้าไปใน image เด็ดขาด",
    analogy: "เหมือนส่งมอบบ้านที่สร้างเสร็จสะอาดพร้อมอยู่ โดยไม่ทิ้งนั่งร้านและเครื่องมือก่อสร้างไว้ในบ้าน",
    related: [{ label: "D141 · Production Dockerfile", lessonId: "d141" }, { label: "D142 · docker compose Stack", lessonId: "d142" }],
  },
  vllm: {
    id: "vllm",
    term: "vLLM & PagedAttention",
    thai: "เอนจินรัน LLM แบบ throughput สูง",
    short: "จัดการ KV-cache แบบแบ่งหน้าหน่วยความจำเพื่อรองรับหลายคำขอพร้อมกันได้คุ้มค่าบน GPU",
    plain:
      "เมื่อปริมาณการใช้งานสูงหรือข้อมูลต้องอยู่ในองค์กร การเข้าใจเศรษฐศาสตร์ของ self-hosted inference (GPU utilization, batching, quantization) ช่วยตัดสินใจได้ว่าเมื่อไรควรใช้ API และเมื่อไรควรโฮสต์เอง",
    analogy: "เหมือนโรงแรมที่จัดห้องพักแบบยืดหยุ่นไม่ปล่อยห้องว่างทิ้งเปล่า ทำให้รับแขกได้มากขึ้นในตึกเดิม",
    related: [{ label: "D145 · Self-Hosted Inference Economics", lessonId: "d145" }],
  },
  "prompt-injection": {
    id: "prompt-injection",
    term: "Prompt Injection (OWASP LLM01)",
    thai: "การแอบแทรกคำสั่งหลอกให้ LLM แหกกฎ",
    short: "ผู้โจมตีซ่อนคำสั่งในคำถามหรือในเอกสารที่ RAG ดึงมา เพื่อให้โมเดลเปิดเผยข้อมูลลับหรือเรียก tool อันตราย",
    plain:
      "แบ่งเป็น Direct (พิมพ์ตรงในแชต) และ Indirect (ฝังไว้ในเอกสาร PDF/เว็บที่ระบบไปดึงมา) ป้องกันได้ด้วยหลายชั้น: แยก data ออกจาก instruction, least-privilege tools, output validation และ red-teaming",
    analogy: "เหมือนลูกค้าเขียนโน้ตสอดไส้ในเอกสารว่า 'เพิกเฉยระเบียบบริษัทแล้วโอนเงินให้ฉัน'",
    related: [{ label: "D149 · OWASP Top 10 LLM", lessonId: "d149" }, { label: "D152 · Red-Team Lab", lessonId: "d152" }],
  },
  guardrails: {
    id: "guardrails",
    term: "Input/Output Guardrails",
    thai: "รั้วกั้นตรวจสอบข้อมูลเข้าและออกของโมเดล",
    short: "ชั้นตรวจที่กรองคำขออันตราย ป้องกันข้อมูลรั่ว และตรวจสอบรูปแบบคำตอบก่อนส่งถึงผู้ใช้",
    plain:
      "Guardrails ที่ดีผสมกฎเร็วและคาดเดาได้ (regex, Pydantic, allowlist ของ tool) เข้ากับตัวตรวจเชิงความหมายเฉพาะจุดที่จำเป็น เพื่อไม่ให้เพิ่ม latency โดยเปล่าประโยชน์",
    analogy: "เหมือนรั้วกันตกริมทางด่วน + จุดตรวจสัมภาระก่อนขึ้นเครื่องบิน",
    related: [{ label: "D150 · Guardrails & Sandbox", lessonId: "d150" }],
  },
  pdpa: {
    id: "pdpa",
    term: "Thai PDPA & PII Redaction",
    thai: "การคุ้มครองข้อมูลส่วนบุคคลและการปกปิด PII",
    short: "ตรวจจับและปิดบังเลขบัตรประชาชน เบอร์โทร อีเมล ชื่อ ก่อนส่งออก external LLM API และก่อนเขียนลง log",
    plain:
      "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ของไทยกำหนดให้เก็บและใช้ข้อมูลเท่าที่จำเป็น วิศวกร AI ต้องสร้าง middleware ปกปิด PII (masking/tokenization) พร้อม audit log และจำกัดการเก็บข้อมูล",
    analogy: "เหมือนขีดดำปิดเลขบัตรประชาชนบนสำเนาเอกสารก่อนส่งให้บุคคลภายนอกตรวจ",
    related: [{ label: "D151 · Thai PDPA Engineering", lessonId: "d151" }, { label: "D173 · Capstone PDPA & Security", lessonId: "d173" }],
  },
  adr: {
    id: "adr",
    term: "ADR (Architecture Decision Record)",
    thai: "บันทึกการตัดสินใจเชิงสถาปัตยกรรม",
    short: "เอกสารสั้น 1 หน้าบันทึกว่าเลือกเทคโนโลยี/แนวทางนี้เพราะอะไร มีทางเลือกอื่นอะไร และยอมรับข้อแลกเปลี่ยนอะไร",
    plain:
      "ช่วยทั้งทีมในอนาคตและตอนสัมภาษณ์งานให้เข้าใจเหตุผลเบื้องหลังการเลือก เช่น ทำไมใช้ Hybrid BM25+pgvector แทน vector อย่างเดียว หรือทำไมใช้ model routing",
    analogy: "เหมือนบันทึกเหตุผลการตัดสินใจของสถาปนิกที่อธิบายว่าทำไมเลือกเสาเข็มแบบนี้สำหรับดินผืนนี้",
    related: [{ label: "D157 · Capstone Framing & ADR", lessonId: "d157" }],
  },
  pathlib: {
    id: "pathlib",
    term: "pathlib.Path",
    thai: "ออบเจกต์จัดการเส้นทางไฟล์ข้ามระบบปฏิบัติการ",
    short: "จัดการโฟลเดอร์และไฟล์ด้วย `/` อย่างปลอดภัยทั้ง Windows, macOS และ Linux แทนการต่อสตริง",
    plain:
      "`Path(\"data\") / \"tickets.jsonl\"` สร้างเส้นทางที่ถูกต้องทุก OS และมีเมธอด `.exists()`, `.mkdir(parents=True, exist_ok=True)`, `.open(encoding=\"utf-8\")` ในตัว ลดบั๊ก backslash บน Windows และปัญหาภาษาไทยเพี้ยน",
    analogy: "เหมือนใช้ GPS ระบุพิกัดแทนการบอกทางด้วยมือซ้าย-ขวาที่เปลี่ยนไปตามทิศที่ยืน",
    example: { language: "python", code: 'from pathlib import Path\np = Path("data") / "tickets.jsonl"\np.parent.mkdir(parents=True, exist_ok=True)' },
    related: [{ label: "D5 · File I/O & pathlib", lessonId: "d005" }],
  },
  "custom-exception": {
    id: "custom-exception",
    term: "custom exception hierarchy",
    thai: "ลำดับชั้นข้อผิดพลาดเฉพาะระบบ",
    short: "แยกประเภท error ที่ลองใหม่ได้ (Retryable) ออกจาก error ที่ผิดถาวร (Non-retryable) ด้วยคลาสย่อยของ Exception",
    plain:
      "ในระบบ AI การจับ `except Exception:` แบบเหมารวมทำให้แยกไม่ออกระหว่าง API timeout (ควร retry) กับ API key ผิดหรือ schema พัง (ควรหยุดทันที) การสร้าง base class และ subclass ทำให้โค้ดจัดการ error ได้แม่นยำ",
    analogy: "เหมือนห้องฉุกเฉินที่คัดแยกผู้ป่วยตามสีบัตร เพื่อส่งต่อการรักษาให้ถูกประเภททันที",
    related: [{ label: "D6 · Error Handling & structlog", lessonId: "d006" }, { label: "D14 · Retry & Backoff", lessonId: "d014" }],
  },
  parametrize: {
    id: "parametrize",
    term: "@pytest.mark.parametrize",
    thai: "การรันเทสต์เดียวด้วยชุดข้อมูลหลายกรณี",
    short: "ส่งตาราง `(input, expected)` เข้าฟังก์ชันเทสต์เดียว เพื่อตรวจหลาย edge case โดยไม่คัดลอกโค้ดซ้ำ",
    plain:
      "เหมาะมากสำหรับทดสอบข้อความไทยหลายแบบ (คำว่าง, อีโมจิ, ไทยปนอังกฤษ, ความยาวเกินขอบเขต) เพราะทุกกรณีแสดงผลแยกกันชัดเจนในรายงาน pytest",
    analogy: "เหมือนแม่พิมพ์ตรวจชิ้นงานหนึ่งตัวที่ป้อนชิ้นงานตัวอย่าง 10 แบบผ่านสายพานทีละชิ้น",
    related: [{ label: "D10 · Parametrized & Mocking", lessonId: "d010" }],
  },
  "pre-commit": {
    id: "pre-commit",
    term: "pre-commit hook",
    thai: "ตัวตรวจโค้ดอัตโนมัติก่อน commit",
    short: "สั่งรัน Ruff lint/format และตรวจไม่ให้หลุด secret อัตโนมัติทุกครั้งก่อน `git commit`",
    plain:
      "แทนที่จะรอให้ CI พังหลัง push โค้ดขึ้น GitHub pre-commit จะช่วยตรวจสไตล์โค้ด ฟอร์แมต และไฟล์ต้องห้ามตั้งแต่บนเครื่องของนักพัฒนา",
    analogy: "เหมือนกระจกเช็กความเรียบร้อยหน้าประตูบ้านก่อนก้าวออกไปเจอเพื่อนร่วมทีม",
    related: [{ label: "D11 · Ruff & pre-commit", lessonId: "d011" }, { label: "D21 · Git Workflow", lessonId: "d021" }],
  },
  "rate-limit": {
    id: "rate-limit",
    term: "rate limiting (429 / token bucket)",
    thai: "การจำกัดอัตราการยิงคำขอ",
    short: "คุมจำนวนคำขอต่อนาที (RPM) หรือ token ต่อนาที (TPM) เพื่อไม่ให้โดน HTTP 429 หรือทำระบบปลายทางล่ม",
    plain:
      "LLM API มีโควตาทั้ง RPM และ TPM ฝั่ง client ต้องอ่าน header `Retry-After` ใช้ semaphore หรือ token bucket ชะลอคำขออย่างสุภาพแทนการยิงรัวจนถูกบล็อก",
    analogy: "เหมือนป้ายจำกัดความเร็วและไฟแดงคุมปริมาณรถเข้าทางด่วนไม่ให้ติดขัดทั้งสาย",
    related: [{ label: "D15 · Rate Limiting & Circuit Breaker", lessonId: "d015" }, { label: "D18 · Semaphore", lessonId: "d018" }],
  },
  "sql-window": {
    id: "sql-window",
    term: "SQL window function",
    thai: "ฟังก์ชันคำนวณข้ามแถวโดยไม่ยุบแถว",
    short: "คำนวณอันดับ (`ROW_NUMBER`), ค่าสะสม หรือค่าเฉลี่ยเคลื่อนที่ต่อกลุ่มด้วย `OVER (PARTITION BY ... ORDER BY ...)`",
    plain:
      "ต่างจาก `GROUP BY` ที่ยุบหลายแถวเหลือแถวเดียว Window function เก็บทุกแถวไว้ครบพร้อมเพิ่มคอลัมน์สรุป เช่น หาทิกเก็ตล่าสุด 3 ใบของลูกค้าแต่ละคน หรือคำนวณต้นทุน LLM สะสมรายวัน",
    analogy: "เหมือนดูคะแนนสอบของตัวเองพร้อมเห็นอันดับในห้องบนบรรทัดเดียวกัน โดยไม่ต้องยุบรายชื่อเพื่อนทิ้ง",
    related: [{ label: "D25 · SQL Refresher", lessonId: "d025" }],
  },
  parquet: {
    id: "parquet",
    term: "Apache Parquet",
    thai: "รูปแบบไฟล์ตารางแบบคอลัมน์",
    short: "ไฟล์ข้อมูลแบบ columnar ที่บีบอัดเล็กกว่า CSV 5–10 เท่า เก็บ schema และอ่านเฉพาะคอลัมน์ที่ต้องการได้ทันที",
    plain:
      "CSV ต้องอ่านและแปลงสตริงทุกคอลัมน์ทุกแถวใหม่ทุกรอบ ส่วน Parquet เก็บข้อมูลแยกตามคอลัมน์พร้อมชนิดข้อมูลและสถิติ min/max ทำให้ Polars และ DuckDB ข้ามข้อมูลที่ไม่เกี่ยวได้ทันที",
    analogy: "เหมือนตู้ลิ้นชักที่แยกของตามประเภท เปิดหยิบเฉพาะลิ้นชักที่ต้องใช้ แทนการเทกองรวมกันบนพื้นแล้วรื้อหา",
    related: [{ label: "D35 · DuckDB over CSV/Parquet", lessonId: "d035" }],
  },
  "expected-value": {
    id: "expected-value",
    term: "expected value (EV)",
    thai: "ค่าคาดหวังทางความน่าจะเป็น",
    short: "ผลรวมของ (โอกาสเกิด × มูลค่า/ต้นทุนของผลลัพธ์) ใช้ตัดสินใจตั้ง threshold และ routing ในระบบ AI",
    plain:
      "ความแม่นยำ 90% ไม่ได้แปลว่าระบบคุ้มเสมอไป ถ้าความผิดพลาด 10% สร้างความเสียหายสูงมาก (เช่น โอนเงินผิดหรือพลาดทิกเก็ตด่วน) การคำนวณ Expected Value ช่วยเลือกจุดตัดที่เหมาะกับต้นทุนธุรกิจจริง",
    analogy: "เหมือนการเลือกว่าจะส่งอีเมลอัตโนมัติหรือให้คนตรวจ โดยชั่งระหว่างเวลาที่ประหยัดได้กับค่าเสียหายหากตอบผิด",
    related: [{ label: "D39 · Probability & Expected Value", lessonId: "d039" }, { label: "D48 · Threshold Tuning", lessonId: "d048" }],
  },
  "sklearn-pipeline": {
    id: "sklearn-pipeline",
    term: "scikit-learn Pipeline & ColumnTransformer",
    thai: "ท่อรวมการเตรียมข้อมูลและโมเดลเข้าด้วยกัน",
    short: "ห่อ imputation, scaling, one-hot/TF-IDF และ estimator ไว้ในออบเจกต์เดียวเพื่อกัน data leakage และ deploy ซ้ำได้เป๊ะ",
    plain:
      "เมื่อเรียก `pipeline.fit(X_train, y_train)` ทุกตัวแปลงจะเรียนรู้สถิติจากชุด train เท่านั้น และตอน predict/export ก็ใช้ลำดับขั้นตอนเดียวกันเป๊ะ ไม่ต้องเขียนโค้ด preprocess ซ้ำสองที่",
    analogy: "เหมือนเครื่องซักผ้าที่ตั้งโปรแกรมซัก-ล้าง-ปั่นไว้ครบในปุ่มเดียว ไม่ลืมขั้นตอนและไม่ปนผ้าซักแล้วกับผ้าสกปรก",
    related: [{ label: "D43 · Baseline Classifier Pipeline", lessonId: "d043" }],
  },
  "cross-validation": {
    id: "cross-validation",
    term: "K-Fold / Stratified Cross-Validation",
    thai: "การตรวจสอบไขว้แบบแบ่งกลุ่ม",
    short: "แบ่งชุด train เป็น K ส่วนแล้วสลับใช้เป็น validation ครบทุกส่วน เพื่อวัดความเสถียรโดยไม่แตะ test set",
    plain:
      "การวัดผลจาก split เดียวอาจโชคดีหรือโชคร้าย Stratified K-Fold รักษาสัดส่วนคลาสในทุก fold ทำให้จูน hyperparameter ได้น่าเชื่อถือและเห็นค่าเฉลี่ย ± ส่วนเบี่ยงเบนมาตรฐาน",
    analogy: "เหมือนสอบย่อย 5 ชุดจากบทเรียนต่างกันแล้วดูคะแนนเฉลี่ย แทนการตัดสินจากข้อสอบชุดเดียว",
    related: [{ label: "D51 · Cross-Validation & Tuning", lessonId: "d051" }],
  },
  "mae-rmse": {
    id: "mae-rmse",
    term: "MAE vs RMSE",
    thai: "ตัวชี้วัดความคลาดเคลื่อนงานทำนายตัวเลข",
    short: "MAE คือค่าเฉลี่ยความผิดพลาดตรง ๆ ส่วน RMSE ยกกำลังสองก่อนถอดรากจึงลงโทษความผิดพลาดก้อนใหญ่ (outlier) หนักกว่า",
    plain:
      "ถ้างานของคุณพลาดเกินขอบเขตแล้วเสียหายหนักมาก (เช่น ทำนายเวลา SLA หรือพยากรณ์โหลดเซิร์ฟเวอร์) ให้ดู RMSE คู่ MAE เพื่อตรวจจับ outlier ที่ MAE อาจกลบไว้",
    analogy: "เหมือนวัดเวลาส่งของช้า: MAE ดูเฉลี่ยว่าช้ากี่นาที ส่วน RMSE จะส่งเสียงเตือนทันทีถ้ามีสักออร์เดอร์ที่ช้าไป 3 ชั่วโมง",
    related: [{ label: "D46 · Regression Metrics", lessonId: "d046" }],
  },
  softmax: {
    id: "softmax",
    term: "Softmax & Cross-Entropy Loss",
    thai: "การแปลงคะแนนดิบเป็นความน่าจะเป็นและวัดความผิดพลาด",
    short: "Softmax แปลง logits เป็นความน่าจะเป็นรวมกันได้ 1.0 ส่วน Cross-Entropy ลงโทษหนักเมื่อโมเดลมั่นใจผิดทาง",
    plain:
      "ก่อนเลือกคำตอบหรือ token ถัดไป โครงข่ายประสาทส่งคะแนนดิบ (logits) ออกมา Softmax (พร้อมหารด้วย temperature) จะแปลงเป็นสัดส่วนโอกาส และ Cross-Entropy Loss ใช้ฝึกให้คลาสที่ถูกต้องมีความน่าจะเป็นสูงขึ้น",
    analogy: "เหมือนแปลงคะแนนโหวตดิบของแต่ละตัวเลือกให้เป็นเปอร์เซ็นต์รวม 100% แล้วปรับคะแนนครูฝึกเมื่อทายผิดแบบมั่นใจเกินเหตุ",
    related: [{ label: "D63 · Loss, Softmax & Temperature", lessonId: "d063" }],
  },
  "few-shot": {
    id: "few-shot",
    term: "Few-Shot Prompting & Delimiters",
    thai: "การให้ตัวอย่างนำทางและคั่นขอบเขตบริบท",
    short: "ใส่ตัวอย่าง input→output 2–4 คู่พร้อมคั่นข้อมูลด้วย XML/Markdown delimiters เพื่อคุมรูปแบบและลดการตีความผิด",
    plain:
      "แทนที่จะเขียนคำสั่งยาวหลายย่อหน้า การยกตัวอย่างเคสจริง (รวมเคสขอบเขตอย่างไทยปนอังกฤษหรือคำสแลง) และแยกคำสั่งออกจากข้อความลูกค้าด้วย `<document>...</document>` ช่วยเพิ่มความแม่นยำอย่างชัดเจน",
    analogy: "เหมือนแนบตัวอย่างใบงานที่กรอกเสร็จแล้ว 2 ใบ พร้อมขีดกรอบข้อความลูกค้าให้ชัดเจนก่อนให้ผู้ช่วยเริ่มทำ",
    related: [{ label: "D74 · Context Engineering", lessonId: "d074" }],
  },
  multimodal: {
    id: "multimodal",
    term: "Multimodal LLM (Vision / PDF-to-Image)",
    thai: "โมเดลที่รับอินพุตทั้งภาพและข้อความ",
    short: "ส่งภาพใบเสร็จ สลิปโอนเงิน หรือหน้า PDF ตารางไทยเข้าโมเดลเพื่อสกัดข้อมูลเป็น JSON โดยตรง",
    plain:
      "เอกสารไทยจำนวนมากเป็นสแกน ตารางซ้อน หรือรูปสลิปที่ OCR ธรรมดาอ่านโครงสร้างเพี้ยน การแปลงหน้า PDF เป็นภาพความละเอียดพอเหมาะแล้วสกัดด้วย Vision LLM + Pydantic schema ช่วยเก็บโครงสร้างตารางได้แม่นยำขึ้น",
    analogy: "เหมือนส่งรูปใบเสร็จให้พนักงานบัญชีดูด้วยตาโดยตรง แทนการคัดลอกข้อความที่บรรทัดแตกกระจาย",
    related: [{ label: "D81 · Multimodal Vision Inputs", lessonId: "d081" }],
  },
  "batch-api": {
    id: "batch-api",
    term: "Batch API (Async Offline Processing)",
    thai: "การส่งงานจำนวนมากแบบออฟไลน์ลดต้นทุน",
    short: "รวมคำขอหลายพันรายการเป็นไฟล์ JSONL ส่งประมวลผลแบบไม่เร่งด่วน (ภายใน 24 ชม.) เพื่อลดค่า API ~50%",
    plain:
      "งานที่ไม่ต้องตอบผู้ใช้ทันที เช่น จัดหมวดเอกสารย้อนหลัง สกัดข้อมูลใบเสร็จประจำวัน หรือรัน eval ชุดใหญ่ ควรใช้ Batch API เพื่อประหยัดงบครึ่งหนึ่งและไม่ต้องชน rate limit ของระบบหน้าบ้าน",
    analogy: "เหมือนส่งพัสดุแบบรวมตู้คอนเทนเนอร์รอบดึก ค่าขนส่งถูกกว่าส่งด่วนรายชิ้นครึ่งหนึ่ง",
    related: [{ label: "D82 · Batch APIs & Cost Reduction", lessonId: "d082" }],
  },
  "prompt-versioning": {
    id: "prompt-versioning",
    term: "Versioned Prompt Templates",
    thai: "การจัดการไฟล์พรอมต์แบบมีเวอร์ชัน",
    short: "แยก prompt ออกจากโค้ด Python เป็นไฟล์ template (`.txt`/`.yaml`) ที่มีเลขเวอร์ชันและ hash เพื่อตรวจย้อนหลังและ rollback ได้",
    plain:
      "การแก้สตริง prompt ตรง ๆ ในโค้ดทำให้ไม่รู้ว่าคะแนนความแม่นยำตกเพราะเปลี่ยนคำไหน การแยกไฟล์พร้อม metadata (`version`, `model`, `sha256`) ทำให้ทำ A/B test และผูกกับ trace/eval ได้ครบถ้วน",
    analogy: "เหมือนเก็บสูตรอาหารแยกเป็นเล่ม v1, v2, v3 แทนการขีดฆ่าแก้ทับลงบนกระดาษแผ่นเดียว",
    related: [{ label: "D91 · Versioned Prompt Templates", lessonId: "d091" }],
  },
  hyde: {
    id: "hyde",
    term: "Query Rewriting & HyDE",
    thai: "การเรียบเรียงคำถามใหม่และสร้างคำตอบสมมติเพื่อค้นหา",
    short: "ปรับคำถามสั้น/กำกวมของผู้ใช้ให้ชัดเจนขึ้นก่อนค้นหา (พร้อมจำกัด latency budget) เพื่อเพิ่ม Recall",
    plain:
      "คำถามแชตของลูกค้ามักสั้นหรืออ้างถึงรอบก่อนหน้า ('แล้วอันนั้นคืนเงินได้ไหม') Query Rewriting ช่วยเติมบริบทให้ครบ ส่วน HyDE สร้างย่อหน้าคำตอบสมมติเพื่อนำ embedding ไปค้นหาเอกสารจริงที่มีภาษาใกล้เคียงกัน",
    analogy: "เหมือนบรรณารักษ์ช่วยแปลงคำถามสั้น ๆ ของผู้อ่านให้เป็นคำค้นที่ชัดเจนก่อนเดินไปหาหนังสือบนชั้น",
    related: [{ label: "D103 · Query Transformation", lessonId: "d103" }],
  },
  abstention: {
    id: "abstention",
    term: "Abstention (Safe Refusal)",
    thai: "การงดตอบเมื่อหลักฐานไม่เพียงพอ",
    short: "ให้ระบบตอบ 'ไม่พบข้อมูลในเอกสารอ้างอิง' อย่างซื่อสัตย์แทนการแต่งเรื่องเมื่อคะแนนค้นคืนต่ำหรือเอกสารขัดแย้งกัน",
    plain:
      "ในงานองค์กร การตอบมั่วเสียหายกว่าการตอบว่าไม่รู้มาก เราใช้ทั้ง retrieval score threshold, การตรวจความขัดแย้ง/วันหมดอายุของเอกสาร และคำสั่งระบบที่ชัดเจนเพื่อบังคับให้ abstention ทำงานจริง",
    analogy: "เหมือนพนักงานคอลเซ็นเตอร์ที่แจ้งลูกค้าตรง ๆ ว่าจะขอตรวจสอบข้อมูลเพิ่มเติม แทนการเดาเงื่อนไขโปรโมชันผิด ๆ",
    related: [{ label: "D106 · Abstention & Stale Docs", lessonId: "d106" }],
  },
  "workflow-patterns": {
    id: "workflow-patterns",
    term: "Deterministic LLM Workflows (Routing / Chaining / Parallel)",
    thai: "รูปแบบเวิร์กโฟลว์ LLM ที่ควบคุมเส้นทางได้",
    short: "ประกอบการเรียก LLM ด้วยโค้ด Python ธรรมดา (Routing, Chaining, Parallelization) ก่อนจะกระโดดไปใช้ Autonomous Agent",
    plain:
      "ตามแนวทาง Building Effective Agents ของ Anthropic งาน AI ส่วนใหญ่แก้ได้เร็วกว่า ถูกกว่า และดีบักง่ายกว่าด้วย deterministic workflows แทนการปล่อยให้เอเจนต์คิดวนเองอย่างไร้ขอบเขต",
    analogy: "เหมือนสายการผลิตที่มีทางแยกชัดเจน งานไหนเข้าช่อง A งานไหนเข้าช่อง B ไม่ปล่อยให้ชิ้นงานเดาทางเอง",
    related: [{ label: "D111 · Anthropic Workflow Patterns", lessonId: "d111" }],
  },
  "mcp-resource": {
    id: "mcp-resource",
    term: "MCP Tools vs Resources",
    thai: "ความต่างระหว่าง Tool (ลงมือทำ) กับ Resource (ข้อมูลอ่านอย่างเดียว)",
    short: "ใน MCP: Tools คือฟังก์ชันที่โมเดลสั่งเรียกพร้อมพารามิเตอร์ ส่วน Resources คือข้อมูล/เอกสารแบบ read-only ที่ระบุด้วย URI",
    plain:
      "การแยก Resources (เช่น `kb://policies/refund`) ออกจาก Tools (เช่น `lookup_order(order_id)`) ช่วยคุมสิทธิ์ความปลอดภัยได้ชัดขึ้น ลดความเสี่ยงจากการให้สิทธิ์เขียนเกินจำเป็น",
    analogy: "เหมือนแยก 'แฟ้มเอกสารให้อ่านอย่างเดียว' ออกจาก 'ปุ่มกดสั่งงาน' บนโต๊ะทำงาน",
    related: [{ label: "D114 · Building a Local MCP Server", lessonId: "d114" }],
  },
  checkpointer: {
    id: "checkpointer",
    term: "LangGraph Checkpointer & Thread State",
    thai: "ตัวบันทึกสถานะกราฟสำหรับพักและทำต่อ",
    short: "บันทึก State ของกราฟลง SQLite/Postgres ตาม `thread_id` เพื่อให้จำบทสนทนาและหยุดรอมนุษย์อนุมัติ (HITL) แล้วทำต่อได้",
    plain:
      "เมื่อเอเจนต์จะทำ write action สำคัญ (เช่น ยกเลิกคำสั่งซื้อ) LangGraph สามารถ `interrupt` หยุดพักสถานะเก็บไว้ใน checkpointer แล้วค่อย resume ต่อเมื่อผู้ดูแลกดยืนยัน แม้เซิร์ฟเวอร์จะรีสตาร์ตระหว่างรอ",
    analogy: "เหมือนระบบเซฟเกมตรงจุด checkpoint ที่ปิดเครื่องไปแล้วกลับมาเล่นต่อจากจุดเดิมได้เป๊ะ",
    related: [{ label: "D119 · Memory & HITL Checkpoints", lessonId: "d119" }],
  },
};

export function getTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY[id];
}
