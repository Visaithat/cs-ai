# Research Brief: 180-Day Practical AI Engineer Curriculum (Thai Edition)

> **เอกสารฉบับนี้** สรุปผลการวิจัยด้านหลักสูตร วิศวกรรมการเรียนรู้ (Learning Science) และแนวทางเลือกใช้เครื่องมือ (Production Toolchain) สำหรับโครงการ **CS&AI** เพื่อสร้างหลักสูตร **AI Engineer 180 วัน (วันละ 30 นาที = 90 ชั่วโมง)** สำหรับนักพัฒนาเว็บ/แอปชาวไทยระดับ Junior (~1 ปี) และนักศึกษาปี 1

---

## 1. Executive Summary & Positioning

ตลาดงาน **AI Engineer** ในปี 2025–2026 เปลี่ยนจุดเน้นจากการเทรน Foundation Model จากศูนย์ (งานของ ML Researcher) มาสู่ **การออกแบบ สร้าง ประเมิน และนำระบบ AI ขึ้น Production อย่างปลอดภัยและคุ้มทุน** ทักษะหลักที่แยก AI Engineer ตัวจริงออกจากคนที่แค่เรียก API เป็น คือ:

1. **Modern Python & Async Systems** — Type safety (`Pydantic v2`), `asyncio`, structured error handling และ reproducible environment (`uv`)
2. **Data & Classical ML Judgment** — รู้ว่าเมื่อไรควรใช้ SQL/Classical ML (`scikit-learn`/`LightGBM`) แทน LLM เพื่อลด latency และต้นทุน
3. **Context Engineering & Hybrid RAG** — Document parsing, chunking, Hybrid Search (BM25 + Dense Vector + Rerank) ที่รองรับภาษาไทยจริง
4. **Controlled Tooling & Agents** — Function calling, state machine/graph orchestration และมาตรฐาน `MCP` (Model Context Protocol)
5. **Systematic Evals & Observability** — Golden datasets, deterministic checks + LLM-as-a-Judge, tracing latency/token/cost
6. **Production Deployment & AI Security** — FastAPI, containerization, OWASP LLM Top 10 และการคุ้มครองข้อมูลตาม **PDPA**

**ขอบเขตเวลา 90 ชั่วโมง (180 วัน × 30 นาที/วัน)** ถูกออกแบบให้เน้น *High-leverage engineering skills* ที่ลงมือเขียนโค้ดและทดสอบได้จริงทุกวัน หลีกเลี่ยงทฤษฎีที่ยังไม่จำเป็นต่อหน้างานแรก (เช่น การเขียน CUDA kernel หรือ pre-training LLM ขนาดใหญ่)

---

## 2. Target Learner Personas & Bridging Strategy

| มิติ | Persona A: Thai Junior Web/App Dev (~1 ปี) | Persona B: First-Year CS/IT Student |
| :--- | :--- | :--- |
| **จุดแข็งเดิม** | คล่อง JS/TS หรือ Backend พื้นฐาน, Git, REST API, JSON, SQL, Docker เบื้องต้น | มีเวลาสม่ำเสมอ, พื้นฐาน Programming 101, คณิตศาสตร์ ม.ปลาย/ปี 1 (Matrix, Probability) |
| **ช่องว่างหลัก** | ไม่คล่อง Python ecosystem (`uv`, `venv`, `pytest`), ไม่ชิน Data/ML workflow, ยังไม่เข้าใจ Evals และ Vector Search | ยังขาด Production workflow (Git branching, env vars, API error handling, testing, deployment) |
| **ความเสี่ยงเลิกเรียน** | ล้าหลังเลิกงาน มีเวลาจำกัด 30–45 นาที/วัน หาก setup ซับซ้อนจะหลุดเร็ว | ติดความซับซ้อนของเครื่องมือ หรือติดด่านต้องผูกบัตรเครดิตเพื่อใช้ Paid LLM API ตั้งแต่วันแรก |

### แนวทางการปรับพื้นฐานร่วมกัน (Dual-Track Bridging)
- **Zero-Credit-Card Start (Days 1–48)**: ช่วง 7 สัปดาห์แรกทั้งหมดรันได้ 100% บนเครื่อง/CPU หรือ Free tier (Python, Data, Classical ML, Local Embeddings) เพื่อลด friction ของนักศึกษาปี 1
- **Mental Model Anchors**: ทุกบทใน Phase 1 ใส่กล่องเปรียบเทียบสั้น ๆ สำหรับ Web Dev (เช่น `uv` ≈ `pnpm`/`bun`, `Pydantic` ≈ `Zod`, `FastAPI` ≈ `Express`/`Hono` + OpenAPI) และกล่องพื้นฐานเสริมสำหรับนักศึกษาปี 1 (เช่น HTTP status code, `.env` secrets)
- **ภาษาที่ใช้**: อธิบายแนวคิดเป็น **ภาษาไทยที่กระชับ ชัดเจน** โดย **คงศัพท์เทคนิคภาษาอังกฤษ** (เช่น `tokenization`, `chunking`, `precision/recall`, `structured output`, `hallucination`, `rate limit`) เพื่อให้นำไปค้น Docs และสื่อสารในทีมจริงได้ทันที

---

## 3. Pedagogy & 30-Minute Daily Micro-Learning Architecture

หลักสูตรอ้างอิงหลักฐานจาก Cognitive Science 3 ประการหลัก:
1. **Retrieval Practice (Active Recall)** — การดึงความรู้มาใช้ผ่านแบบฝึกหัดและควิซสั้นช่วยจำได้ดีกว่าการอ่านซ้ำหรือดูวิดีโอ (Dunlosky et al., 2013)
2. **Spaced Repetition (Distributed Practice)** — การทบทวนแบบเว้นระยะช่วยลด forgetting curve และสร้างความจำระยะยาว (Brown, Roediger & McDaniel, 2014)
3. **Interleaving** — การสลับโจทย์ต่างประเภทในวันทบทวนช่วยให้ผู้เรียนแยกแยะได้ว่า *ควรเลือกเครื่องมือหรือรูปแบบไหน* กับปัญหาตรงหน้า (Rohrer & Pashler, 2010; Sana & Yan, 2022)

### โครงสร้างมาตรฐานต่อวัน (30 นาที)

| ช่วงเวลา | องค์ประกอบ | เป้าหมายเชิงการเรียนรู้ |
| :--- | :--- | :--- |
| **0–5 นาที** | **Retrieval Warmup** | คำถามทบทวน 2 ข้อจากบทก่อนหน้า (Day N-1 และ Day N-4) โดยยังไม่เปิดเฉลย |
| **5–13 นาที** | **Core Concept + Worked Example** | อธิบายแนวคิดหลักไม่เกิน 2–3 ประเด็น พร้อมตัวอย่างโค้ดสั้นที่รันได้จริง |
| **13–25 นาที** | **Interactive Coding Exercise** | เขียนโค้ดแก้โจทย์จำลองงานจริง พร้อม Automated Test และ **3-Level Hints** |
| **25–30 นาที** | **Micro-Quiz + Error Log** | ควิซ 3–5 ข้อเพื่อเช็กความเข้าใจ + บันทึกจุดผิดพลาดเข้า Spaced Review Queue |

### รอบการทบทวนทุก 4 วัน (4-Day Micro-Sprint Cadence)
180 วันถูกแบ่งเป็น **45 รอบ ๆ ละ 4 วัน** (3 วันเรียนรู้ใหม่ + 1 วันทบทวน/เชื่อมโยง = ทุก 3–4 วันพอดี):
- **Days 1–3 ของรอบ**: เรียนรู้แนวคิดและทำ Interactive Exercise รายวัน
- **Day 4 ของรอบ (Review & Interleaving Day)**:
  - `0–10 นาที`: Interleaved Recall Quiz ครอบคลุม 3 วันที่ผ่านมา + 1 ข้อดึงจาก 2 สัปดาห์ก่อน
  - `10–25 นาที`: Mini-Integration / Bug-Hunt Lab (นำโค้ด 3 วันมาร้อยต่อกันหรือแก้บั๊กจริง)
  - `25–30 นาที`: Self-Check & Confidence Tagging เพื่อส่งข้อที่ยังไม่แม่นกลับเข้าคิวทบทวน
- **Phase Checkpoints** (Days 32, 60, 92, 124, 156, 180): ส่ง Mini-Project Artifact เข้า Portfolio

### ระบบคำใบ้ 3 ระดับ (3-Level Progressive Hints)
ออกแบบเพื่อป้องกันทั้งการติดตันจนท้อและการกดดูเฉลยเร็วเกินไป:
- **Level 1 (Conceptual Nudge)**: ชี้ทิศทางแนวคิดหรือสาเหตุของปัญหา ไม่บอกชื่อฟังก์ชันหรือโค้ด
- **Level 2 (API / Structural Clue)**: บอกชื่อ class/method หรือโครงสร้างโค้ดที่ต้องใช้
- **Level 3 (Concrete Walkthrough)**: ให้โครงโค้ดเกือบสมบูรณ์หรือบรรทัดสำคัญพร้อมคำอธิบาย (เว้นจุดตัดสินใจสุดท้ายให้ผู้เรียนพิมพ์เอง)

---

## 4. Practical Toolchain Guidance by Real Job Need

> **หลักการเลือกเครื่องมือ**: ไม่สอนเครื่องมือทุกตัวในตลาด แต่กำหนด **Primary Default 1 ตัวต่อโจทย์งานจริง** พร้อมทางเลือกที่พบบ่อยและ **เกณฑ์ตัดสินใจ (Selection Criteria)** เพื่อฝึกทักษะวิศวกรในการเลือก stack อย่างมีเหตุผล

| งานจริง (Job Need) | Primary Default ในหลักสูตร | ทางเลือกที่ควรรู้จัก | เกณฑ์การเลือก (Selection Criteria) | ข้อควรระวัง / เมื่อไรไม่ควรใช้ |
| :--- | :--- | :--- | :--- | :--- |
| **1. Python & Engineering** | `Python 3.12`, `uv`, `Ruff`, `pytest`, `Pydantic v2`, `httpx` | `Poetry`, `pip-tools`, `mypy`/`pyright` | ใช้ **`uv`** แทน `pip`+`venv` เพราะเร็ว มี lockfile (`uv.lock`) และจัดการ Python version ในตัวเดียว; ใช้ **`Pydantic v2`** เป็นมาตรฐาน schema ทั้ง API, LLM output และ config | หลีกเลี่ยงการสอน `conda` เป็นค่าเริ่มต้นสำหรับ web/LLM app เพราะหนักและสร้าง Docker image ใหญ่ (ใช้ conda เมื่อติด dependency เชิงวิทยาศาสตร์/CUDA ซับซ้อนเท่านั้น) |
| **2. Data Processing & Storage** | `Polars` (หรือ `pandas` เมื่อไลบรารี ML ต้องการ), `DuckDB`, `PostgreSQL` | `SQLite`, `BigQuery` | ข้อมูลในไฟล์ CSV/Parquet ขนาดเล็ก–กลาง (<10 GB) ใช้ **`DuckDB` + `Polars`** (เร็ว ประหยัด RAM ใช้ SQL ได้ทันที); ข้อมูล Production multi-user ใช้ **`PostgreSQL`** | อย่ารีบตั้ง Spark/Airflow สำหรับข้อมูลไม่กี่ร้อย MB — เพิ่มความซับซ้อนโดยไม่จำเป็น |
| **3. Classical ML & Deep Learning** | `scikit-learn`, `LightGBM`, `PyTorch`, `Sentence-Transformers` | `XGBoost`, `CatBoost`, `ONNX Runtime` | ข้อมูลแบบตาราง (Tabular: churn, fraud, pricing, forecast) → **`LightGBM`/`scikit-learn`** ชนะ LLM ทั้งความแม่นยำ Latency และต้นทุน; งาน embedding/fine-tuning/vision → **`PyTorch`** | อย่าใช้ LLM แทน Classical ML ในงานจัดหมวดหมู่/ทำนายตัวเลขปริมาณสูงที่มีข้อมูลตารางชัดเจน |
| **4. LLM, RAG & Agents** | Official SDK (`openai` / `anthropic` / `google-genai`) + `Pydantic`, `PyThaiNLP`, `pgvector` หรือ `Qdrant`, `LangGraph`, `MCP` | `Pydantic AI`, `LlamaIndex`, `Cohere Rerank`, `bge-reranker` | **Rule of Thumb**: เริ่มจาก Direct SDK + workflow code ธรรมดาก่อน; ใช้ **`pgvector`** ถ้าทีมมี Postgres อยู่แล้ว (<5–10M vectors), ใช้ **`Qdrant`** เมื่อต้องการ filtering/hybrid search เฉพาะทางและสเกลสูง; ใช้ **`LangGraph`** เมื่อต้องมี stateful multi-step loop/human-in-the-loop; ใช้ **`MCP`** เพื่อเชื่อม tool/data source แบบมาตรฐาน | หลีกเลี่ยง Framework ที่ซ่อน prompt/HTTP request (over-abstraction) จน debug latency และ prompt drift ไม่ได้; อย่าสร้าง autonomous agent ถ้า deterministic workflow 2–3 ขั้นตอนแก้โจทย์ได้ |
| **5. Evaluation (Evals)** | `pytest` + Golden Dataset (`JSONL`), `Promptfoo`, `Ragas` | `DeepEval`, `Braintrust`, `LangSmith Evals` | ใช้ **Deterministic assertions** ก่อนเสมอ (JSON schema valid, citation exists, recall@k, latency budget) แล้วค่อยใช้ **LLM-as-a-Judge** (ผ่าน `Promptfoo` หรือ `Ragas`) วัด Faithfulness / Answer Relevance และผูกเข้า CI | อย่าปล่อยระบบ RAG/Agent ขึ้น Production ด้วยการ "ลองพิมพ์ถามเอง 5 ข้อแล้วดูโอเค" (vibe-check) และอย่าพึ่ง LLM-as-a-Judge โดยไม่ calibrate กับ human labels |
| **6. Deployment & Serving** | `FastAPI` + `Uvicorn`, `Docker`, Cloud PaaS (`Cloud Run` / `Fly.io`), `Ollama` (local dev) | `vLLM`, `SGLang`, `Kubernetes` | บริการ API หลักใช้ **`FastAPI`** (async + SSE streaming + Pydantic native); เลือก **Hosted LLM API** เป็นค่าเริ่มต้นเพื่อลดภาระ GPU ops; พิจารณา **Self-host (`vLLM`)** เมื่อมีปริมาณ request สูงคงที่, ติดข้อกำหนด Data Residency/PDPA เข้มงวด, หรือใช้ fine-tuned model เฉพาะ | อย่าเช่า GPU ตลอด 24 ชม. สำหรับ prototype หรือระบบ traffic ต่ำ เพราะต้นทุน idle สูงกว่า pay-per-token API หลายเท่า |
| **7. Observability & Cost Control** | `OpenTelemetry` (GenAI SemConv), `Langfuse` (OSS), `structlog` | `Arize Phoenix`, `LangSmith`, `Helicone` | ต้องมองเห็น **End-to-End Trace** (user query → retrieved chunks → rerank scores → prompt version → token count → cost → latency); **`Langfuse`** เหมาะกับทีมไทยเพราะ open-source self-host ได้ คุมข้อมูลให้อยู่ในองค์กรได้ | อย่าเก็บ raw PII ของลูกค้าลง trace logs โดยไม่ redact/mask ก่อน |
| **8. Security, Privacy & Governance** | `OWASP LLM Top 10` checklist, `Pydantic` + Regex/NER PII redaction, Least-privilege tools | `Microsoft Presidio`, `NeMo Guardrails`, `Llama Guard` | ป้องกัน **Prompt Injection (LLM01)** ด้วยการแยก system instructions กับ untrusted data และจำกัดสิทธิ์ tool (read-only / allowlist / human approval สำหรับ write action); ทำ **PII Masking** ก่อนส่งออก external API เพื่อให้สอดคล้องกับ **PDPA** | อย่าเชื่อว่า System Prompt อย่างเดียวจะกัน Prompt Injection ได้ 100% — ความปลอดภัยต้องอยู่ที่ขอบเขตสิทธิ์ (authorization) และ validation ชั้นโค้ด |

---

## 5. Thai-Specific AI Engineering Gaps (บริบทที่ต้องเน้นเป็นพิเศษ)

หลักสูตร AI Engineer ต่างประเทศแทบไม่กล่าวถึงปัญหาที่นักพัฒนาไทยเจอบ่อยในงานจริง หลักสูตรนี้จึงแทรกโจทย์ภาษาไทยในทุก Phase สำคัญ:

1. **No Word Boundaries (ภาษาไทยไม่เว้นวรรคระหว่างคำ)**:
   - การทำ Keyword/Lexical Search (BM25) ด้วย whitespace split จะพังทันทีกับภาษาไทย
   - **แนวทางปฏิบัติ**: ใช้ `PyThaiNLP` (`word_tokenize(..., engine="newmm")`) ตัดคำทั้งฝั่ง indexing และ query ก่อนส่งเข้า BM25 แล้วจึงรวมคะแนนกับ Dense Vector Search ด้วย Reciprocal Rank Fusion (RRF)
2. **Token Inflation & Context Cost**:
   - ข้อความภาษาไทยมักถูกแบ่งเป็นจำนวน token มากกว่าภาษาอังกฤษ ~1.5x–3x ในหลาย BPE tokenizer ทำให้ชน context limit เร็วขึ้นและค่า API สูงกว่าที่ประเมินจากจำนวนตัวอักษร
   - **แนวทางปฏิบัติ**: สอนการวัด token จริงด้วย tokenizer และตั้ง `max_tokens` / chunk size เป็นจำนวน token (ไม่ใช่จำนวนตัวอักษร)
3. **Code-Switching (ไทยปนอังกฤษ & ศัพท์เฉพาะองค์กร)**:
   - ผู้ใช้ไทยมักถามแบบปนภาษา เช่น *"ขอเช็ก status order #INV-2026-009 ที่ค้างชำระหน่อย"* → ต้องเลือก Multilingual Embedding + Hybrid Search เพื่อให้จับทั้งความหมายภาษาไทยและรหัสเอกสารแม่นยำ
4. **PDPA Compliance (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)**:
   - สอนการสร้าง middleware ตรวจจับและ mask ข้อมูลอ่อนไหวของไทย (เลขบัตรประชาชน 13 หลักพร้อม checksum, เบอร์โทรศัพท์ไทย, อีเมล) ก่อนส่งไป external LLM API และก่อนบันทึกลง observability trace

---

## 6. Curated Primary Sources & References

### Learning Science & Curriculum Design
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). *Improving students' learning with effective learning techniques*. Psychological Science in the Public Interest, 14(1), 4–58.
- Brown, P. C., Roediger, H. L., & McDaniel, M. A. (2014). *Make It Stick: The Science of Successful Learning*. Harvard University Press.
- Rohrer, D., & Pashler, H. (2010). *Recent instruction on learning and memory*. Psychological Science in the Public Interest, 11(2), 40–72.
- Sana, F., & Yan, V. X. (2022). *Interleaved retrieval practice promotes science learning*. Psychological Science, 33(5), 782–788.

### Official Tooling, Architecture & Security Documentation
- **Python & Packaging**: [Python 3 Official Docs](https://docs.python.org/3/) · [uv Documentation (Astral)](https://docs.astral.sh/uv/) · [Ruff Documentation](https://docs.astral.sh/ruff/) · [Pydantic v2 Docs](https://docs.pydantic.dev/latest/) · [pytest Docs](https://docs.pytest.org/)
- **Data & ML**: [Polars User Guide](https://docs.pola.rs/) · [DuckDB Docs](https://duckdb.org/docs/) · [scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html) · [PyTorch Docs](https://pytorch.org/docs/stable/)
- **Thai NLP & Retrieval**: [PyThaiNLP Documentation](https://pythainlp.github.io/docs/) · [pgvector](https://github.com/pgvector/pgvector) · [Qdrant Documentation](https://qdrant.tech/documentation/)
- **LLM Engineering & Agents**: [Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) · [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) · [LangChain / LangGraph Docs](https://docs.langchain.com/) · [Pydantic AI Docs](https://pydantic.dev/docs/ai)
- **Evals, Deployment, Observability & Security**: [FastAPI Docs](https://fastapi.tiangolo.com/) · [Promptfoo Docs](https://www.promptfoo.dev/docs) · [Ragas Docs](https://docs.ragas.io/) · [Langfuse Docs](https://langfuse.com/docs) · [OpenTelemetry GenAI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions-genai) · [vLLM Docs](https://docs.vllm.ai/) · [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
