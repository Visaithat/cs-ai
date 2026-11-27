/**
 * Lightweight client-safe lesson catalog & metadata (~18 KB vs ~8 MB for all 180 full lesson bodies).
 * Used by SiteHeader, Dashboard, and Bookshelf so initial page load & hydration stay instant on GitHub Pages.
 */
import { buildLibrary, KIND_LABEL, lessonIdForDay, parseLessonId, type DayKind, type LibraryEntry } from "./library";
import { PHASES, TOTAL_DAYS } from "./schedule";
import type { LessonIconId } from "./types";

export interface LessonMeta {
  id: string;
  day: number;
  titleTh: string;
  icon: LessonIconId;
  setupSteps: number;
  exampleSteps: number;
  quizQuestions: number;
}

export const LESSON_META: Record<string, LessonMeta> = {
  "d001": {
    "id": "d001",
    "day": 1,
    "titleTh": "ตั้งค่า Python สมัยใหม่ด้วย uv และออกแบบ payload ที่ปลอดภัยด้วย Pydantic v2",
    "icon": "shield-check",
    "setupSteps": 3,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d002": {
    "id": "d002",
    "day": 2,
    "titleTh": "จัดการข้อมูลด้วย Python Collections, Comprehensions และ Type Hints สมัยใหม่",
    "icon": "list-filter",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d003": {
    "id": "d003",
    "day": 3,
    "titleTh": "ออกแบบ Nested Pydantic Models, @model_validator และ JSON Serialization",
    "icon": "braces",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d004": {
    "id": "d004",
    "day": 4,
    "titleTh": "ทบทวนรอบแรก: สร้าง Thai Support Ticket Parser ที่ตรวจ schema ครบชุด",
    "icon": "git-branch",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d005": {
    "id": "d005",
    "day": 5,
    "titleTh": "จัดการไฟล์ด้วย pathlib และสตรีมชุดข้อมูล JSONL ทีละบรรทัด",
    "icon": "folder-open",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d006": {
    "id": "d006",
    "day": 6,
    "titleTh": "จัดการ Error ด้วย Custom Exception และ Structured Logging (structlog)",
    "icon": "scroll-text",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d007": {
    "id": "d007",
    "day": 7,
    "titleTh": "จัดการคอนฟิกและ Secret แบบ Fail-Fast ด้วย pydantic-settings & .env",
    "icon": "key-round",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d008": {
    "id": "d008",
    "day": 8,
    "titleTh": "ทบทวน B02: รีแฟกเตอร์สคริปต์ดิบด้วย Config, JSONL Stream และ Structured Logs",
    "icon": "git-branch",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d009": {
    "id": "d009",
    "day": 9,
    "titleTh": "พื้นฐาน Unit Testing ด้วย pytest, Fixtures และ tmp_path",
    "icon": "flask-conical",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d010": {
    "id": "d010",
    "day": 10,
    "titleTh": "เทสต์หลายเคสด้วย @pytest.mark.parametrize และจำลอง API ด้วย Mocking",
    "icon": "test-tubes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d011": {
    "id": "d011",
    "day": 11,
    "titleTh": "สร้างด่านตรวจคุณภาพโค้ดอัตโนมัติด้วย Ruff และ pre-commit",
    "icon": "badge-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d012": {
    "id": "d012",
    "day": 12,
    "titleTh": "ทบทวน B03: สร้างชุดทดสอบ 90% Coverage ให้ Thai Ticket Parser",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d013": {
    "id": "d013",
    "day": 13,
    "titleTh": "สร้าง HTTP Client ที่ไว้ใจได้ด้วย httpx: Granular Timeouts และแยก Status Code",
    "icon": "globe",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d014": {
    "id": "d014",
    "day": 14,
    "titleTh": "Retry อย่างฉลาดด้วย Exponential Backoff, Jitter และ tenacity",
    "icon": "refresh-cw",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d015": {
    "id": "d015",
    "day": 15,
    "titleTh": "ป้องกันระบบพังซ้ำซ้อน: Rate Pacing, Idempotency Key และ Circuit Breaker",
    "icon": "gauge",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d016": {
    "id": "d016",
    "day": 16,
    "titleTh": "ทบทวน B04: ไล่ล่าและแก้บั๊ก Flaky API Client ภายใต้ Rate Limit & Timeout",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d017": {
    "id": "d017",
    "day": 17,
    "titleTh": "เข้าใจ asyncio อย่างทะลุปรุโปร่ง: Event Loop, Coroutine และ await",
    "icon": "cpu",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d018": {
    "id": "d018",
    "day": 18,
    "titleTh": "ยิงคำขอพร้อมกันอย่างปลอดภัยด้วย asyncio.gather และ Semaphore",
    "icon": "layers",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d019": {
    "id": "d019",
    "day": 19,
    "titleTh": "Async Generators และ Streaming Responses: พื้นฐาน SSE สำหรับงาน AI",
    "icon": "zap",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d020": {
    "id": "d020",
    "day": 20,
    "titleTh": "ทบทวน B05: เร่งความเร็ว Batch 20 คำขอให้ไวขึ้น 5 เท่าอย่างปลอดภัย",
    "icon": "cpu",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d021": {
    "id": "d021",
    "day": 21,
    "titleTh": "Git Workflow สำหรับทีม AI: แตก Branch, ทำ PR เล็ก และ .gitignore กันคีย์–ดาต้าหลุด",
    "icon": "git-branch",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d022": {
    "id": "d022",
    "day": 22,
    "titleTh": "จัดโครงสร้างแพ็กเกจ Python แบบ src/ Layout และ pyproject.toml",
    "icon": "package",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d023": {
    "id": "d023",
    "day": 23,
    "titleTh": "สร้าง CLI ระดับโปรดักชันด้วย Typer: Type Hints, Progress และ Exit Codes",
    "icon": "rocket",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d024": {
    "id": "d024",
    "day": 24,
    "titleTh": "ทบทวน B06: แพ็กเกจ Ticket Processor เป็น CLI ที่ติดตั้งและทดสอบได้",
    "icon": "package",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d025": {
    "id": "d025",
    "day": 25,
    "titleTh": "SQL สำหรับวิศวกร AI: JOIN, GROUP BY และ Window Functions",
    "icon": "database",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d026": {
    "id": "d026",
    "day": 26,
    "titleTh": "SQL ที่ปลอดภัยสำหรับ Production: Parameterized Queries, Transactions และ Migrations",
    "icon": "lock",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d027": {
    "id": "d027",
    "day": 27,
    "titleTh": "รูปแบบการทำ Caching ลดค่า LLM API และ Latency: In-memory LRU vs SQLite Cache",
    "icon": "hard-drive",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d028": {
    "id": "d028",
    "day": 28,
    "titleTh": "ทบทวน B07: ติดตั้ง Persistent SQLite Cache ให้ Ticket CLI และวัด Hit Rate",
    "icon": "hard-drive",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d029": {
    "id": "d029",
    "day": 29,
    "titleTh": "ออกแบบสเปกและสถาปัตยกรรม Phase 1 Mini-Project: Resilient Async Data Fetcher CLI",
    "icon": "file-text",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d030": {
    "id": "d030",
    "day": 30,
    "titleTh": "สร้างท่อ Async Ingestion & Validation พร้อม Semaphore และไฟล์ Quarantine",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d031": {
    "id": "d031",
    "day": 31,
    "titleTh": "เสริมเกราะ Production: tenacity Retry, SQLite Cache และชุดเทสต์ pytest แบบ Offline",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d032": {
    "id": "d032",
    "day": 32,
    "titleTh": "Checkpoint Phase 1: เดโมผลงาน, Code Review Checklist และควิซประมวลผล B01–B08",
    "icon": "award",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d033": {
    "id": "d033",
    "day": 33,
    "titleTh": "จัดการข้อมูลตารางความเร็วสูงด้วย Polars (Expressions & Lazy Mode)",
    "icon": "table",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d034": {
    "id": "d034",
    "day": 34,
    "titleTh": "ทำความสะอาดข้อมูลไทยสกปรก: Nulls, Duplicates, UTF-8 และวันที่ พ.ศ.",
    "icon": "filter",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d035": {
    "id": "d035",
    "day": 35,
    "titleTh": "วิเคราะห์ข้อมูลระดับล้านแถวบนเครื่องด้วย DuckDB + Parquet",
    "icon": "database",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d036": {
    "id": "d036",
    "day": 36,
    "titleTh": "ทบทวน B09: ล้างข้อมูล E-Commerce ไทย 100,000 แถวและวิเคราะห์ด้วย Polars + DuckDB",
    "icon": "table",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d037": {
    "id": "d037",
    "day": 37,
    "titleTh": "เวกเตอร์, Dot Product และ Norms — สัญชาตญาณ NumPy สำหรับระบบ AI",
    "icon": "sigma",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d038": {
    "id": "d038",
    "day": 38,
    "titleTh": "Cosine Similarity vs Euclidean Distance — ทำไมระบบ Embeddings จึงวัดที่มุม",
    "icon": "compass",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d039": {
    "id": "d039",
    "day": 39,
    "titleTh": "ความน่าจะเป็น การแจกแจง และ Expected Value สำหรับการตัดสินใจในระบบ AI",
    "icon": "scale",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d040": {
    "id": "d040",
    "day": 40,
    "titleTh": "ทบทวน Block B10: สร้าง Mini Cosine Similarity Search Engine ด้วย NumPy",
    "icon": "compass",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d041": {
    "id": "d041",
    "day": 41,
    "titleTh": "เลือกใช้ Classical ML หรือ LLM: ตารางตัดสินใจด้านต้นทุน Latency และโครงสร้างข้อมูล",
    "icon": "scale",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d042": {
    "id": "d042",
    "day": 42,
    "titleTh": "การแบ่งชุดข้อมูล Train / Val / Test และการป้องกัน Data Leakage",
    "icon": "split",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d043": {
    "id": "d043",
    "day": 43,
    "titleTh": "สร้าง Baseline Classifier ด้วย scikit-learn (Pipeline & ColumnTransformer)",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d044": {
    "id": "d044",
    "day": 44,
    "titleTh": "ทบทวน B11: จับและแก้บั๊ก Data Leakage ที่หลอกให้คะแนนสูงเกินจริง",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d045": {
    "id": "d045",
    "day": 45,
    "titleTh": "วัดผลโมเดลจำแนกประเภทเมื่อข้อมูลไม่สมดุล (Precision, Recall, F1 & PR-AUC)",
    "icon": "sliders-horizontal",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d046": {
    "id": "d046",
    "day": 46,
    "titleTh": "วัดผลโมเดลทำนายตัวเลข (MAE vs RMSE) และวิเคราะห์ความคลาดเคลื่อนรายกลุ่ม",
    "icon": "trending-up",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d047": {
    "id": "d047",
    "day": 47,
    "titleTh": "เทรนโมเดลข้อมูลตารางระดับโปรดักชันด้วย LightGBM (Gradient Boosting)",
    "icon": "git-merge",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d048": {
    "id": "d048",
    "day": 48,
    "titleTh": "ทบทวน B12: หา Threshold ที่ลดต้นทุนธุรกิจต่ำสุด (FP vs FN Cost Matrix)",
    "icon": "sliders-horizontal",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d049": {
    "id": "d049",
    "day": 49,
    "titleTh": "สกัดฟีเจอร์ข้อความด้วย TF-IDF และการตัดคำภาษาไทยด้วย PyThaiNLP (newmm)",
    "icon": "scissors",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d050": {
    "id": "d050",
    "day": 50,
    "titleTh": "สร้างตัวจำแนกข้อความภาษาไทยความเร็วสูง (TF-IDF + Logistic Regression)",
    "icon": "zap",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d051": {
    "id": "d051",
    "day": 51,
    "titleTh": "ทำ Cross-Validation และจูน Hyperparameters โดยไม่ Overfit และไม่เกิด Leakage",
    "icon": "layers",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d052": {
    "id": "d052",
    "day": 52,
    "titleTh": "ทบทวน B13: วัดผลเทียบจริง Thai PyThaiNLP TF-IDF กับ Whitespace Split บน 5-Fold CV",
    "icon": "scissors",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d053": {
    "id": "d053",
    "day": 53,
    "titleTh": "บันทึกและส่งออกโมเดล (joblib / ONNX), การคุมเวอร์ชัน และ Data Cards",
    "icon": "package",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d054": {
    "id": "d054",
    "day": 54,
    "titleTh": "ตรวจจับ Feature Drift และเฝ้าระวังโมเดล ML ใน Production",
    "icon": "activity",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d055": {
    "id": "d055",
    "day": 55,
    "titleTh": "ออกแบบ Phase 2 Mini-Project: Thai Ticket Priority ML Pipeline (<10ms)",
    "icon": "file-text",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d056": {
    "id": "d056",
    "day": 56,
    "titleTh": "ทบทวน B14: เทรนและประเมิน End-to-End Thai Ticket Priority ML Pipeline",
    "icon": "git-merge",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d057": {
    "id": "d057",
    "day": 57,
    "titleTh": "ผ่าตัดข้อผิดพลาดบนทิกเก็ตภาษาไทยที่โมเดลทายผิด (Error Analysis)",
    "icon": "bar-chart-3",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d058": {
    "id": "d058",
    "day": 58,
    "titleTh": "Export โมเดลและวัด Inference Latency (<10ms) อย่างมืออาชีพ",
    "icon": "timer",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d059": {
    "id": "d059",
    "day": 59,
    "titleTh": "เขียนชุดเทสต์ ML ที่ทำซ้ำได้: Seed Determinism, Behavioral Tests และ Quality Gate",
    "icon": "flask-conical",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d060": {
    "id": "d060",
    "day": 60,
    "titleTh": "Checkpoint Phase 2: เดโมระบบ, บันทึกวิเคราะห์ ML vs LLM และควิซรวม B09–B15",
    "icon": "award",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d061": {
    "id": "d061",
    "day": 61,
    "titleTh": "พื้นฐาน PyTorch: Tensors, Autograd และ Gradient Descent",
    "icon": "brain",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d062": {
    "id": "d062",
    "day": 62,
    "titleTh": "สร้างและเทรนโครงข่ายประสาท 2 ชั้นด้วย nn.Module และ PyTorch Training Loop",
    "icon": "cpu",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d063": {
    "id": "d063",
    "day": 63,
    "titleTh": "Loss Functions, Softmax, Temperature และการคุม Overfitting ใน PyTorch",
    "icon": "sliders-horizontal",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d064": {
    "id": "d064",
    "day": 64,
    "titleTh": "ทบทวน B16: ดีบัก Exploding & Vanishing Loss ใน PyTorch Neural Net",
    "icon": "wrench",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d065": {
    "id": "d065",
    "day": 65,
    "titleTh": "เข้าใจสถาปัตยกรรม Transformer: Self-Attention, ตำแหน่งคำ และต้นทุน O(n²)",
    "icon": "sparkles",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d066": {
    "id": "d066",
    "day": 66,
    "titleTh": "เจาะลึก BPE Tokenizer: ทำไมภาษาไทยกิน token มากกว่าอังกฤษ 1.5–3 เท่า",
    "icon": "coins",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d067": {
    "id": "d067",
    "day": 67,
    "titleTh": "จาก Base Model สู่ผู้ช่วยที่คุยรู้เรื่อง: Pre-training, SFT และ RLHF/DPO",
    "icon": "sparkles",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d068": {
    "id": "d068",
    "day": 68,
    "titleTh": "ทบทวน B17: วัดต้นทุน Token ไทย vs อังกฤษข้าม Tokenizer และวางงบ 10,000 ทิกเก็ต",
    "icon": "coins",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d069": {
    "id": "d069",
    "day": 69,
    "titleTh": "แปลงข้อความไทย-อังกฤษเป็น Dense Embeddings ด้วย Sentence-Transformers",
    "icon": "radar",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d070": {
    "id": "d070",
    "day": 70,
    "titleTh": "สร้าง Semantic Search บนประโยคไทย พร้อมเกณฑ์ Threshold และจุดบอดรหัสเฉพาะ",
    "icon": "compass",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d071": {
    "id": "d071",
    "day": 71,
    "titleTh": "เกณฑ์เลือก Embedding Model: มิติ (RAM), Context Limit ภาษาไทย และต้นทุน",
    "icon": "scale",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d072": {
    "id": "d072",
    "day": 72,
    "titleTh": "ทบทวน Block B18: เทียบ 2 โมเดล Multilingual Embeddings บนโจทย์ไทยปนอังกฤษ",
    "icon": "git-compare",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d073": {
    "id": "d073",
    "day": 73,
    "titleTh": "เรียกใช้ Production LLM API: แยก Roles, ตั้ง Sampling Params และหุ้ม SDK ให้เทสต์ได้",
    "icon": "message-square",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d074": {
    "id": "d074",
    "day": 74,
    "titleTh": "พื้นฐาน Context Engineering: เขียนให้ชัด, กั้นขอบเขตด้วย Delimiters และวาง Few-Shot",
    "icon": "layers",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d075": {
    "id": "d075",
    "day": 75,
    "titleTh": "Streaming UX ด้วย SSE: ลดเวลาคำแรก (TTFT), จัดการ UTF-8 ไทย และยกเลิกอย่างสะอาด",
    "icon": "zap",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d076": {
    "id": "d076",
    "day": 76,
    "titleTh": "ทบทวน B19: สร้าง Streaming CLI Chat พร้อมตัวนับ Token, TTFT และต้นทุน",
    "icon": "rocket",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d077": {
    "id": "d077",
    "day": 77,
    "titleTh": "บังคับผลลัพธ์ LLM ให้ตรงรูปเป๊ะด้วย Pydantic v2 และ Strict JSON Schema",
    "icon": "braces",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d078": {
    "id": "d078",
    "day": 78,
    "titleTh": "ลูปซ่อมผลลัพธ์ด้วย Error Feedback (Validation-Repair Loop) และ Deterministic Fallback",
    "icon": "refresh-cw",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d079": {
    "id": "d079",
    "day": 79,
    "titleTh": "จัดการ Long Context, Prompt Caching (Prefix คงที่) และ Model Routing (เล็ก vs ใหญ่)",
    "icon": "git-branch",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d080": {
    "id": "d080",
    "day": 80,
    "titleTh": "ทบทวน B20: สร้างตัวสกัดใบแจ้งหนี้/ทิกเก็ตไทยที่ผ่าน Schema 99%+ พร้อม Repair Loop และ Routing",
    "icon": "braces",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d081": {
    "id": "d081",
    "day": 81,
    "titleTh": "สกัดใบเสร็จ สลิปโอนเงิน และตาราง PDF ไทยด้วย Multimodal Vision LLM",
    "icon": "image",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d082": {
    "id": "d082",
    "day": 82,
    "titleTh": "ลดต้นทุน LLM ลง 50% ด้วย Batch API และการประมวลผลออฟไลน์แบบ Idempotent",
    "icon": "boxes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d083": {
    "id": "d083",
    "day": 83,
    "titleTh": "รันโมเดล Open-Weights บนเครื่องด้วย Ollama และเข้าใจ Quantization (GGUF)",
    "icon": "hard-drive",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d084": {
    "id": "d084",
    "day": 84,
    "titleTh": "ทบทวน Block B21: Benchmark เทียบ Cloud API vs Local Ollama บนงานสกัดเอกสารไทย",
    "icon": "git-compare",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d085": {
    "id": "d085",
    "day": 85,
    "titleTh": "กรอบตัดสินใจเลือกวิธีปรับแต่ง LLM: Prompt Engineering vs RAG vs Fine-Tuning",
    "icon": "scale",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d086": {
    "id": "d086",
    "day": 86,
    "titleTh": "เข้าใจ LoRA / QLoRA แบบเห็นภาพ และกฎเหล็กคุณภาพข้อมูลสำหรับ Fine-Tuning",
    "icon": "brain",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d087": {
    "id": "d087",
    "day": 87,
    "titleTh": "ออกแบบพิมพ์เขียว Phase 3 Mini-Project: ระบบคัดแยกและสกัดเอกสารไทยแบบ Type-Safe",
    "icon": "file-text",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d088": {
    "id": "d088",
    "day": 88,
    "titleTh": "ทบทวน B22: ประกอบ Extraction Pipeline พร้อม SQLite Cache, Model Routing และ Repair Loop",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d089": {
    "id": "d089",
    "day": 89,
    "titleTh": "รับมือ Edge Cases ภาษาไทย: คำสแลง พิมพ์ผิด อีโมจิ และไทยปนอังกฤษ",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d090": {
    "id": "d090",
    "day": 90,
    "titleTh": "วัดผลจริง 3 แกน: Field Accuracy, P50/P95 Latency และต้นทุนต่อ 1,000 เอกสาร",
    "icon": "bar-chart-3",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d091": {
    "id": "d091",
    "day": 91,
    "titleTh": "แยก Prompt Templates เป็นไฟล์มีเวอร์ชัน (YAML/TXT) พร้อม Hash ตรวจสอบย้อนหลัง",
    "icon": "file-code",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d092": {
    "id": "d092",
    "day": 92,
    "titleTh": "Checkpoint Phase 3: เดโมระบบเทียบ ML Baseline vs LLM Extractor และควิซรวม B16–B23",
    "icon": "award",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d093": {
    "id": "d093",
    "day": 93,
    "titleTh": "สถาปัตยกรรม Naive RAG และ 4 จุดตายที่ทำให้พังในงานจริงขององค์กรไทย",
    "icon": "search",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d094": {
    "id": "d094",
    "day": 94,
    "titleTh": "Document Ingestion & Parsing: แปลง Markdown, HTML และ Thai PDF สุดรกให้สะอาดพร้อมทำ RAG",
    "icon": "file-text",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d095": {
    "id": "d095",
    "day": 95,
    "titleTh": "กลยุทธ์ Chunking ภาษาไทย: Structural, Token-Aware, Context Breadcrumb และ Overlap",
    "icon": "scissors",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d096": {
    "id": "d096",
    "day": 96,
    "titleTh": "ทบทวน B24: ตรวจสอบ Bad Chunks และซ่อมตาราง/หัวข้อที่ถูกตัดขาดในเอกสาร FAQ ภาษาไทย",
    "icon": "wrench",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d097": {
    "id": "d097",
    "day": 97,
    "titleTh": "สร้างดัชนีเวกเตอร์บน PostgreSQL ด้วย pgvector (HNSW และการกรอง Metadata)",
    "icon": "database",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d098": {
    "id": "d098",
    "day": 98,
    "titleTh": "ใช้ Dedicated Vector Store ด้วย Qdrant (Hybrid Collections และ Payload Filter)",
    "icon": "server",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d099": {
    "id": "d099",
    "day": 99,
    "titleTh": "ค้นหาคำตรงตัวภาษาไทยด้วย PyThaiNLP และ BM25 (rank_bm25)",
    "icon": "search",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d100": {
    "id": "d100",
    "day": 100,
    "titleTh": "ทบทวน B25 (Day 100!): เทียบผลจริง Thai BM25 กับ Dense Vector บนชุดคำถามไทย",
    "icon": "git-compare",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d101": {
    "id": "d101",
    "day": 101,
    "titleTh": "ผสานผลค้นหาไทย-อังกฤษด้วย Hybrid Search และ Reciprocal Rank Fusion (RRF)",
    "icon": "layers",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d102": {
    "id": "d102",
    "day": 102,
    "titleTh": "จัดอันดับรอบสองด้วย Cross-Encoder Reranking (bge-reranker / Rerank API)",
    "icon": "sparkles",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d103": {
    "id": "d103",
    "day": 103,
    "titleTh": "แปลงคำถามให้ค้นเจอด้วย Query Transformation (Rewriting, HyDE, Multi-Query + Latency Guard)",
    "icon": "route",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d104": {
    "id": "d104",
    "day": 104,
    "titleTh": "ทบทวน B26: วัด Recall@5 และ MRR Gain — Dense vs Hybrid RRF vs +Rerank",
    "icon": "bar-chart-3",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d105": {
    "id": "d105",
    "day": 105,
    "titleTh": "Grounded Generation และการอ้างอิงแหล่งที่มาแบบ Inline Citations ([doc_id#chunk])",
    "icon": "book-marked",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d106": {
    "id": "d106",
    "day": 106,
    "titleTh": "Context Faithfulness, การปฏิเสธเมื่อหลักฐานไม่พอ (Abstention) และการป้องกัน Indirect Prompt Injection",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d107": {
    "id": "d107",
    "day": 107,
    "titleTh": "Multi-Tenant ACL และการกรองสิทธิ์ระดับ Metadata ในระบบ RAG",
    "icon": "lock",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d108": {
    "id": "d108",
    "day": 108,
    "titleTh": "ทบทวน B27: เสริมเกราะ RAG Pipeline ป้องกัน Indirect Prompt Injection, ข้าม Tenant และคำตอบไร้หลักฐาน",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d109": {
    "id": "d109",
    "day": 109,
    "titleTh": "Native Tool / Function Calling ด้วย Strict Pydantic Schemas",
    "icon": "wrench",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d110": {
    "id": "d110",
    "day": 110,
    "titleTh": "การออกแบบ Safe Tools: Idempotency, Timeouts, Least Privilege และการแยก Read vs Write",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d111": {
    "id": "d111",
    "day": 111,
    "titleTh": "Anthropic's 5 Workflow Patterns: Chaining, Routing, Parallelization, Orchestrator-Workers และ Evaluator-Optimizer",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d112": {
    "id": "d112",
    "day": 112,
    "titleTh": "ทบทวน B28: สร้างผู้ช่วยตรวจสอบออเดอร์และนโยบายด้วย Routing + Safe Tools + Evaluator-Optimizer",
    "icon": "layers",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d113": {
    "id": "d113",
    "day": 113,
    "titleTh": "สถาปัตยกรรม Model Context Protocol (MCP): แยก Host, Client และ Server อย่างปลอดภัย",
    "icon": "plug",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d114": {
    "id": "d114",
    "day": 114,
    "titleTh": "สร้าง Local MCP Server ด้วย Python: ประกาศ Tools, Resources และรักษาความสะอาด stdout",
    "icon": "server",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d115": {
    "id": "d115",
    "day": 115,
    "titleTh": "เชื่อมต่อแอป AI เข้ากับ MCP Server อย่างปลอดภัย: Allowlist, Timeout และ Schema Adapter",
    "icon": "plug",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d116": {
    "id": "d116",
    "day": 116,
    "titleTh": "ทบทวน B29: เปิด SQLite Order & Thai Knowledge Lookup ผ่าน MCP อย่างปลอดภัย",
    "icon": "database",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d117": {
    "id": "d117",
    "day": 117,
    "titleTh": "ควบคุมลูปเอเจนต์ด้วย LangGraph: State, Nodes, Conditional Edges และ Step Budget",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d118": {
    "id": "d118",
    "day": 118,
    "titleTh": "Guarded Execution ใน LangGraph: คุม Max Steps, Tool Budget และตรวจจับลูปซ้ำ",
    "icon": "shield-alert",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d119": {
    "id": "d119",
    "day": 119,
    "titleTh": "Persistent Memory & Human-in-the-Loop (HITL) Approval Checkpoints",
    "icon": "user-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d120": {
    "id": "d120",
    "day": 120,
    "titleTh": "ทบทวน B30: ดีบักบั๊กลูปเรียก Tool ไม่รู้จบใน LangGraph พร้อมติด Guardrails และ HITL Gate",
    "icon": "git-branch",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d121": {
    "id": "d121",
    "day": 121,
    "titleTh": "Phase 4 Mini-Project: เชื่อม Thai Hybrid RAG + MCP Tool + Guarded LangGraph",
    "icon": "rocket",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d122": {
    "id": "d122",
    "day": 122,
    "titleTh": "Citation Verification Gate และการจัดการ Fallback เมื่อหลักฐานหรือ Tool ล้มเหลว",
    "icon": "badge-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d123": {
    "id": "d123",
    "day": 123,
    "titleTh": "Integration Tests บน 15 คำถามลูกค้าภาษาไทยเสมือนจริง",
    "icon": "test-tubes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d124": {
    "id": "d124",
    "day": 124,
    "titleTh": "Checkpoint Phase 4: สาธิตระบบ Thai Knowledge RAG + Controlled Agent และตรวจสถาปัตยกรรม",
    "icon": "award",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d125": {
    "id": "d125",
    "day": 125,
    "titleTh": "เปิด Phase 5 ด้วย Eval-Driven Development และ Golden Dataset ภาษาไทย",
    "icon": "database",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d126": {
    "id": "d126",
    "day": 126,
    "titleTh": "Deterministic Evals สำหรับ Schema, Tool Selection และ Retrieval",
    "icon": "flask-conical",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d127": {
    "id": "d127",
    "day": 127,
    "titleTh": "LLM-as-a-Judge: เขียน Rubric และวัด Position กับ Verbosity Bias",
    "icon": "scale",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d128": {
    "id": "d128",
    "day": 128,
    "titleTh": "ทบทวน B32 และ Calibrate LLM Judge กับป้ายที่คุณให้เอง",
    "icon": "scale",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d129": {
    "id": "d129",
    "day": 129,
    "titleTh": "ประเมินระบบ RAG ด้วย RAG Triad และ Ragas (Faithfulness, Context Precision/Recall)",
    "icon": "triangle",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d130": {
    "id": "d130",
    "day": 130,
    "titleTh": "ทดสอบ Prompt และ Model ย้อนหลังด้วย Promptfoo",
    "icon": "test-tubes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d131": {
    "id": "d131",
    "day": 131,
    "titleTh": "ตั้ง Automated Eval Gate ใน GitHub Actions CI",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d132": {
    "id": "d132",
    "day": 132,
    "titleTh": "ทบทวน B33 · ทำ Prompt พังแล้วให้ CI Eval Gate จับให้ได้",
    "icon": "test-tubes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d133": {
    "id": "d133",
    "day": 133,
    "titleTh": "มองเห็นระบบ RAG ด้วย OpenTelemetry และ GenAI Semantic Conventions",
    "icon": "activity",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d134": {
    "id": "d134",
    "day": 134,
    "titleTh": "ตามงาน LLM และ RAG จากต้นจนจบด้วย Langfuse",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d135": {
    "id": "d135",
    "day": 135,
    "titleTh": "อ่าน Dashboard ต้นทุน, Latency (P50/P95) และ Token พร้อมตั้ง Alert",
    "icon": "bar-chart-3",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d136": {
    "id": "d136",
    "day": 136,
    "titleTh": "ทบทวน B34 · วินิจฉัยคอขวดของ P95 จาก Trace Waterfall",
    "icon": "activity",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d137": {
    "id": "d137",
    "day": 137,
    "titleTh": "สร้าง AI API ระดับ Production ด้วย FastAPI (Async Lifespan และ Dependency Injection)",
    "icon": "zap",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d138": {
    "id": "d138",
    "day": 138,
    "titleTh": "สตรีมคำตอบด้วย SSE พร้อม Timeout และ Fallback",
    "icon": "zap",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d139": {
    "id": "d139",
    "day": 139,
    "titleTh": "ทำงานนำเข้าเอกสารเบื้องหลังด้วย Job Queue",
    "icon": "zap",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d140": {
    "id": "d140",
    "day": 140,
    "titleTh": "ทบทวน B35 · ทดสอบโหลด FastAPI SSE ด้วยผู้ใช้พร้อมกัน",
    "icon": "gauge",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d141": {
    "id": "d141",
    "day": 141,
    "titleTh": "แพ็ก FastAPI ลง Production Docker Image ด้วย uv",
    "icon": "package",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d142": {
    "id": "d142",
    "day": 142,
    "titleTh": "ประกอบ Local Stack ด้วย Docker Compose",
    "icon": "boxes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d143": {
    "id": "d143",
    "day": 143,
    "titleTh": "ขึ้น Cloud Run หรือ Fly.io พร้อม Secrets และ Health Checks",
    "icon": "rocket",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d144": {
    "id": "d144",
    "day": 144,
    "titleTh": "ทบทวน B36 · Deploy Staging API และตรวจ /healthz กับ Trace Delivery",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d145": {
    "id": "d145",
    "day": 145,
    "titleTh": "คุ้มไหมถ้าโฮสต์ LLM เองด้วย vLLM",
    "icon": "cpu",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d146": {
    "id": "d146",
    "day": 146,
    "titleTh": "ลดงานซ้ำด้วย Semantic Cache, Prompt Compression และ Model Tiering",
    "icon": "layers",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d147": {
    "id": "d147",
    "day": 147,
    "titleTh": "วาง Capacity และคำนวณงบบาทต่อผู้ใช้ต่อเดือน",
    "icon": "gauge",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d148": {
    "id": "d148",
    "day": 148,
    "titleTh": "ทบทวน B37: ลดต้นทุนบริการ AI ให้ได้ 40% โดยไม่ให้คะแนน Eval ตก",
    "icon": "scale",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d149": {
    "id": "d149",
    "day": 149,
    "titleTh": "เดินสำรวจ OWASP Top 10 บนระบบ Thai Knowledge RAG และ Agent",
    "icon": "shield-alert",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d150": {
    "id": "d150",
    "day": 150,
    "titleTh": "สร้าง Input และ Output Guardrails พร้อม Least-Privilege Tool Sandbox",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d151": {
    "id": "d151",
    "day": 151,
    "titleTh": "วิศวกรรม PDPA สำหรับระบบ AI ไทย: ตรวจจับและปกปิดข้อมูลส่วนบุคคลพร้อม Audit Log",
    "icon": "lock",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d152": {
    "id": "d152",
    "day": 152,
    "titleTh": "ทบทวน B38 ด้วยชุดทดสอบ Guardrails และ Defense in Depth ของ Thai Knowledge RAG",
    "icon": "test-tubes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d153": {
    "id": "d153",
    "day": 153,
    "titleTh": "มินิโปรเจกต์ Phase 5: ต่อ Guardrails, PII Masking และ Langfuse เข้ากับ FastAPI",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d154": {
    "id": "d154",
    "day": 154,
    "titleTh": "รัน Promptfoo Eval Suite ครบชุด ทั้งความปลอดภัยและคุณภาพคำตอบ",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d155": {
    "id": "d155",
    "day": 155,
    "titleTh": "เขียน Incident Runbook รับมือเหตุฉุกเฉิน: Provider ล่ม, ต้นทุนพุ่ง และ Prompt Injection",
    "icon": "shield-alert",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d156": {
    "id": "d156",
    "day": 156,
    "titleTh": "Checkpoint Phase 5: ตรวจรับความพร้อม Production (Readiness Audit) และปิด Milestone v0.5.0",
    "icon": "award",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d157": {
    "id": "d157",
    "day": 157,
    "titleTh": "วางกรอบปัญหา เขียน User Stories และจัดทำเอกสารสถาปัตยกรรม (ADR)",
    "icon": "file-text",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d158": {
    "id": "d158",
    "day": 158,
    "titleTh": "วางโครงสร้าง Repo มาตรฐาน Production ด้วย uv, Ruff, pytest และ Docker Compose",
    "icon": "package",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d159": {
    "id": "d159",
    "day": 159,
    "titleTh": "เตรียมชุดคลังความรู้องค์กรไทย/สองภาษา (20+ เอกสาร, ตาราง และ FAQ)",
    "icon": "book-marked",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d160": {
    "id": "d160",
    "day": 160,
    "titleTh": "Milestone 1: ตรวจรับสถาปัตยกรรม โครงสร้าง Repo และคลังข้อมูลสองภาษา",
    "icon": "badge-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d161": {
    "id": "d161",
    "day": 161,
    "titleTh": "สร้าง Ingestion Pipeline และ Token-Aware Chunking สำหรับเอกสารสองภาษา",
    "icon": "scissors",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d162": {
    "id": "d162",
    "day": 162,
    "titleTh": "สร้างระบบค้นหา Hybrid: PyThaiNLP BM25 + Dense Vector (pgvector/Qdrant)",
    "icon": "search",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d163": {
    "id": "d163",
    "day": 163,
    "titleTh": "เพิ่ม Cross-Encoder Reranker และระบบกรองสิทธิ์ Metadata/ACL (Pre-Filtering)",
    "icon": "filter",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d164": {
    "id": "d164",
    "day": 164,
    "titleTh": "Milestone 2: วัดผล Retrieval Benchmark ให้ Recall@5 >= 0.85",
    "icon": "bar-chart-3",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d165": {
    "id": "d165",
    "day": 165,
    "titleTh": "สร้างชั้นตอบคำถามแบบอ้างอิงหลักฐานพร้อม Strict Citations และ Abstention",
    "icon": "shield-check",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d166": {
    "id": "d166",
    "day": 166,
    "titleTh": "สร้าง MCP Server สำหรับค้นหา Order/Ticket (Read-Only + Safe Write Gate)",
    "icon": "plug",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d167": {
    "id": "d167",
    "day": 167,
    "titleTh": "เชื่อม LangGraph Router แยกเส้นทาง FAQ RAG, Tool Lookup และ HITL Escalation",
    "icon": "route",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d168": {
    "id": "d168",
    "day": 168,
    "titleTh": "Milestone 3: ทดสอบและสาธิต Core Flow ครบวงจร (RAG + MCP + LangGraph + HITL)",
    "icon": "workflow",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d169": {
    "id": "d169",
    "day": 169,
    "titleTh": "สร้างชุดทดสอบ Golden Eval Dataset 40 เคส (Thai, Code-Switch, Unanswerable, Attack)",
    "icon": "test-tubes",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d170": {
    "id": "d170",
    "day": 170,
    "titleTh": "รัน Ragas + Promptfoo Evals และซ่อม Top 3 Failure Modes ของระบบ Capstone",
    "icon": "flask-conical",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d171": {
    "id": "d171",
    "day": 171,
    "titleTh": "เชื่อมต่อ Langfuse Traces และระบบวัดผล Cost / Latency Telemetry",
    "icon": "activity",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d172": {
    "id": "d172",
    "day": 172,
    "titleTh": "Milestone 4: สรุป Eval Report 40 เคสที่ผ่าน Quality Gates ครบทุกมิติ",
    "icon": "bar-chart-3",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d173": {
    "id": "d173",
    "day": 173,
    "titleTh": "เพิ่ม PDPA PII Redaction Middleware และเกราะป้องกัน OWASP Injection",
    "icon": "lock",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d174": {
    "id": "d174",
    "day": 174,
    "titleTh": "ห่อระบบเป็น FastAPI SSE Streaming พร้อม Web Chat UI และ Swagger Demo",
    "icon": "zap",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d175": {
    "id": "d175",
    "day": 175,
    "titleTh": "ทำ Container ด้วย Docker และ Deploy ขึ้น Staging Cloud พร้อม GitHub Actions CI",
    "icon": "server",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d176": {
    "id": "d176",
    "day": 176,
    "titleTh": "Milestone 5: ทดสอบ Staging URL จริงและผ่านด่าน Red-Team Security",
    "icon": "shield-alert",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d177": {
    "id": "d177",
    "day": 177,
    "titleTh": "ทดสอบ Load & Failure (ตั้ง Timeout, Circuit Breaker และ Fallback เมื่อ LLM ล่ม)",
    "icon": "gauge",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d178": {
    "id": "d178",
    "day": 178,
    "titleTh": "ขัดเกลา README.md, แผนภาพสถาปัตยกรรม และตาราง Eval/Cost Metrics ระดับมืออาชีพ",
    "icon": "file-text",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d179": {
    "id": "d179",
    "day": 179,
    "titleTh": "อัดวิดีโอ Technical Demo 3 นาที และเตรียมตอบคำถามสัมภาษณ์ Junior AI Engineer",
    "icon": "rocket",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  },
  "d180": {
    "id": "d180",
    "day": 180,
    "titleTh": "Final Defense: ตรวจเกณฑ์ Capstone Rubric 4 เสาหลัก และเตรียมรับมือสัมภาษณ์งาน",
    "icon": "award",
    "setupSteps": 1,
    "exampleSteps": 3,
    "quizQuestions": 4
  }
} as Record<string, LessonMeta>;

export const LESSON_IDS: string[] = Object.keys(LESSON_META);
export const LIBRARY: LibraryEntry[] = buildLibrary(new Set(LESSON_IDS));

export function getLessonMeta(id: string): LessonMeta | undefined {
  return LESSON_META[id];
}

export function getLibraryEntry(day: number): LibraryEntry | undefined {
  return LIBRARY[day - 1];
}

export const DAILY_LOOP = [
  { id: "warmup", label: "Retrieval warm-up", minutes: "0–5", hint: "ทวนคิวทบทวน / เช็กเครื่อง" },
  { id: "concept", label: "Concept + worked example", minutes: "5–13", hint: "อ่านและลองตัวอย่าง" },
  { id: "exercise", label: "Interactive exercise", minutes: "13–25", hint: "เขียนโค้ด รันเทสต์ ขอ hint ได้ 3 ระดับ" },
  { id: "quiz", label: "Micro-quiz + error log", minutes: "25–30", hint: "ตอบ 4 ข้อ ข้อพลาดเข้าคิวทบทวน" },
] as const;

export const REVIEW_LOOP = [
  { id: "recall", label: "Interleaved recall quiz", minutes: "0–10", hint: "คำถามจาก 3 วันที่ผ่านมา + 1–2 ข้อจากรอบก่อนหน้า" },
  { id: "lab", label: "Mini-integration / debugging lab", minutes: "10–25", hint: "นำโค้ด 3 วันมาต่อกันหรือหาบั๊กจริง" },
  { id: "log", label: "Error log & spaced-queue update", minutes: "25–30", hint: "บันทึกข้อผิดพลาดเพื่อทวนอีก 8 และ 16 วัน" },
] as const;

export { KIND_LABEL, PHASES, TOTAL_DAYS, lessonIdForDay, parseLessonId };
export type { DayKind, LibraryEntry };
