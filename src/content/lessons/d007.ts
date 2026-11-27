import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D007 — Phase 1 / Block B02
 * Environment Config with pydantic-settings & .env Hygiene.
 */
export const d007: Lesson = defineLesson({
  day: 7,
  titleTh: "จัดการคอนฟิกและ Secret แบบ Fail-Fast ด้วย pydantic-settings & .env",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · โหลด .env + OS Env Vars แบบมีชนิดข้อมูลชัดเจน ซ่อน API Key ด้วย SecretStr",
  icon: "key-round",
  visual: {
    id: "env-settings",
    title: "Fail-Fast Startup Config ด้วย pydantic-settings & SecretStr",
    caption: "กดสลับดูการโหลด .env + OS Env Vars ที่ตรวจครบตั้งแต่สตาร์ตและซ่อน API Key อัตโนมัติ",
    alt: "แผนภาพการโหลดและตรวจสอบคอนฟิกด้วย pydantic-settings และ SecretStr",
  },
  requiresApiKey: false,
  tools: ["pydantic-settings", "Pydantic v2", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 0,
      heading: "แยกโค้ดออกจากค่าคอนฟิกและความลับของแต่ละสภาพแวดล้อม",
      body: "โค้ดตัวเดียวกันต้องรันได้ทั้งบนเครื่องนักพัฒนา (local), Staging และ Production โดยเปลี่ยนเพียงชื่อโมเดล URL ฐานข้อมูล และ API key ผ่านตัวแปรสภาพแวดล้อม ({{env-config}})",
      lessonNote: "วันนี้เราวางมาตรฐาน 12-Factor Config ด้วย `pydantic-settings` และสุขอนามัยไฟล์ `.env`",
    },
    {
      node: 2,
      heading: "คุมพารามิเตอร์โมเดลและ API Key อย่างปลอดภัยก่อนยิง LLM",
      body: "เมื่อเชื่อมต่อผู้ให้บริการ {{llm}} หรือ Local Ollama ใน Phase 3 แอปต้องมี `model_name`, `timeout_seconds`, `max_retries` และ `api_key` ที่ตรวจชนิดและขอบเขตครบถ้วน",
      lessonNote: "`BaseSettings` แปลงค่าสตริงจาก env เป็น `int`/`float`/`Path` ให้อัตโนมัติและซ่อน key ด้วย `SecretStr`",
    },
    {
      node: 4,
      heading: "ล้มเหลวทันทีตั้งแต่สตาร์ต (Fail-Fast) ไม่ใช่พังกลางดึกตอนผู้ใช้กดส่ง",
      body: "การใช้ `os.getenv(\"API_KEY\")` กระจายตามไฟล์ต่าง ๆ มักทำให้แอปสตาร์ตขึ้นได้ทั้งที่ลืมตั้งค่า แล้วไปพังเป็น `NoneType` เมื่อลูกค้าคนแรกเรียกใช้งาน",
      lessonNote: "การตรวจคอนฟิกครบทุกฟิลด์ตั้งแต่บรรทัดแรกของการสตาร์ตทำให้ปัญหาถูกจับตั้งแต่ตอน deploy",
    },
    {
      node: 5,
      heading: "ป้องกัน Secret รั่วลง Log, Traceback และ Git Repository",
      body: "สาเหตุอันดับต้น ๆ ของบิลค่า API พุ่งหรือข้อมูลรั่วคือการเผลอ commit `.env` ขึ้น GitHub หรือพิมพ์ออบเจกต์คอนฟิกลงใน {{structlog}}",
      lessonNote: "`SecretStr` จะพิมพ์เป็น `**********` เสมอ และ `.env.example` คู่กับ `.gitignore` ช่วยป้องกันความลับหลุดเข้า Git",
    },
  ],

  objectives: [
    "**สร้างคลาสคอนฟิกที่มี Type-Safe** ด้วย `BaseSettings` และ `SettingsConfigDict(env_file=\".env\")` เพื่อให้แอปตรวจค่าครบแบบ {{fail-fast}} ตั้งแต่สตาร์ต",
    "**ปกป้องความลับ** ด้วย `SecretStr` (ซ่อนค่าอัตโนมัติใน `repr`/`str`/log และดึงค่าจริงเฉพาะจุดที่จำเป็นผ่าน `.get_secret_value()`)",
    "**จัดระเบียบ `.env` อย่างถูกหลักความปลอดภัย**: แยก `.env` (ใส่ใน `.gitignore`) ออกจาก `.env.example` (commit ให้ทีม) และเข้าใจลำดับความสำคัญระหว่าง OS Env Vars กับไฟล์ `.env`",
  ],

  prerequisites: [
    "สร้าง {{pydantic}} `BaseModel`, `Field` และ `Path` จาก Block B01 และ Day 5 ได้แล้ว",
    "เข้าใจพื้นฐานของไฟล์ `.gitignore` และตัวแปรใน terminal",
    "มี {{uv}}, `pytest` และ `ruff` บนเครื่อง — ใช้ค่า API key จำลองทดสอบบนเครื่องได้ 100%",
  ],

  setup: {
    intro:
      "สร้างโปรเจกต์สำหรับ Day 7 ด้วย {{uv}} แล้วติดตั้ง `pydantic-settings` (ซึ่งจะดึง `pydantic` และ `python-dotenv` ให้พร้อมใช้งานร่วมกัน)",
    commands: `uv init ai-day7-config && cd ai-day7-config
uv add pydantic-settings
uv add --dev pytest ruff

# ตรวจว่า pydantic-settings พร้อมใช้งาน
uv run python -c "import pydantic_settings; print('pydantic-settings:', pydantic_settings.__version__)"`,
    steps: [
      ["init", "สร้างโปรเจกต์ `ai-day7-config` ด้วย `uv init`"],
      ["deps", "ติดตั้ง `pydantic-settings` และ `--dev pytest ruff`"],
      ["verify", "ตรวจเวอร์ชัน `pydantic-settings` ด้วย `uv run python` สำเร็จ"],
    ],
    note: "เราทดสอบการโหลด `.env` และ OS env vars ด้วย `tmp_path` และ `monkeypatch` ของ pytest จึงไม่ต้องตั้งค่า API key จริงบนเครื่องของคุณ",
  },

  concepts: [
    {
      id: "basesettings-fail-fast",
      title: "1 · Fail-Fast Config ด้วย `BaseSettings` และลำดับความสำคัญของค่า",
      paragraphs: [
        "การใช้ `os.getenv(\"TIMEOUT\", \"30\")` มีจุดอ่อน 3 ข้อ: ค่าที่ได้เป็น `str` เสมอต้องมานั่งแปลงเอง, ถ้าลืมตั้งค่าที่จำเป็นอาจได้ `None` ไปพังกลางทางตอนรันจริง, และไม่รู้ว่าโปรเจกต์ทั้งก้อนต้องใช้ตัวแปรอะไรบ้าง",
        "`BaseSettings` จาก `pydantic-settings` รวมทุกอย่างไว้ในคลาสเดียว: อ่านค่าจาก OS Environment Variables และไฟล์ `.env`, ทำ {{coercion}} แปลงชนิดเป็น `int`/`float`/`bool`/`Path`, ตรวจขอบเขตด้วย `Field(ge=..., le=...)` และโยน {{validation-error}} ทันทีที่สตาร์ตหากขาดค่าที่จำเป็น โดยยึดลำดับความสำคัญชัดเจน: **อาร์กิวเมนต์ตอนสร้าง > OS Env Var > ไฟล์ `.env` > ค่า Default ในคลาส**",
      ],
      analogy:
        "เหมือนเช็กลิสต์ก่อนเครื่องบินขึ้นบิน (Pre-flight Check) — ตรวจระดับน้ำมันและอุปกรณ์ทุกตัวให้ครบตั้งแต่ยังอยู่บนรันเวย์ แทนที่จะบินขึ้นไปแล้วค่อยรู้ว่าลืมเติมน้ำมันกลางอากาศ",
      code: {
        language: "python",
        filename: "settings_demo.py",
        code: `from pathlib import Path
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="AI_APP_",
        extra="ignore",
    )

    api_key: SecretStr
    model_name: str = "gpt-4o-mini"
    timeout_seconds: float = Field(default=15.0, ge=1.0, le=120.0)
    max_retries: int = Field(default=3, ge=0, le=5)
    data_dir: Path = Path("data")`,
        caption: "เมื่อตั้ง `env_prefix=\"AI_APP_\"` ตัวแปรใน `.env` จะชื่อ `AI_APP_API_KEY`, `AI_APP_TIMEOUT_SECONDS` ช่วยป้องกันชื่อชนกับตัวแปรระบบอื่น",
      },
      whyTitle: "Why this matters — ทำไม OS Env Var ต้องชนะไฟล์ `.env` เสมอ",
      whyParagraphs: [
        "บนเครื่องนักพัฒนาเราเก็บค่าทดลองไว้ใน `.env` เพื่อความสะดวก แต่เมื่อนำโค้ดขึ้น Docker หรือ Cloud Run ใน Phase 5 ค่า production จริงจะถูกฉีดผ่าน OS Environment Variables ของแพลตฟอร์ม",
        "เพราะ OS Env Var มีลำดับความสำคัญสูงกว่า `.env` คุณจึงเปลี่ยนค่าใน staging/production ได้ทันทีโดยไม่ต้องแก้โค้ดหรือแก้ไฟล์ `.env`",
      ],
    },
    {
      id: "secretstr-masking",
      title: "2 · ป้องกัน API Key รั่วไหลลง Log ด้วย `SecretStr`",
      paragraphs: [
        "ถ้าประกาศ `api_key: str` ธรรมดา ทุกครั้งที่คุณเผลอ `print(settings)`, บันทึกลง {{structlog}} หรือเกิด traceback ที่แสดงตัวแปร local ค่า API key จริงจะโผล่ออกมาเต็ม ๆ",
        "ชนิดข้อมูล `SecretStr` ของ {{pydantic}} ห่อความลับไว้ข้างใน: เมื่อเรียก `str(settings.api_key)` หรือ `repr(settings)` มันจะแสดงเป็น `**********` เสมอ และเมื่อถึงจุดขอบสุดที่ต้องส่ง header ให้ HTTP client ค่อยแกะค่าจริงด้วย `settings.api_key.get_secret_value()` อย่างจงใจ",
      ],
      analogy:
        "`SecretStr` เหมือนซองเอกสารปิดผนึกที่หน้าซองเขียนแค่คำว่า \"ความลับ (**********)\" — ใครถือซองเดินผ่านกล้องวงจรปิด (log) ก็ไม่เห็นเนื้อหาข้างใน จนกว่าผู้มีสิทธิ์ปลายทางจะเปิดผนึกด้วย `.get_secret_value()`",
      code: {
        language: "python",
        filename: "secretstr_demo.py",
        code: `from pydantic import SecretStr

key = SecretStr("sk-demo-not-a-real-key-9999")

print("str :", str(key))
print("repr:", repr(key))

# แกะค่าจริงเฉพาะจุดที่ส่งเข้า Authorization header เท่านั้น
headers = {"Authorization": f"Bearer {key.get_secret_value()}"}
print("header len:", len(headers["Authorization"]))`,
        caption: "ระวังอย่าเขียน `f\"Bearer {settings.api_key}\"` โดยลืม `.get_secret_value()` เพราะจะได้ `Bearer **********` และยิง API ไม่ผ่าน!",
      },
      whyTitle: "Why this matters — บรรทัดเดียวที่ช่วยป้องกัน Secret Leak ทั้งโปรเจกต์",
      whyParagraphs: [
        "บ่อยครั้งที่นักพัฒนาสั่ง log ค่าคอนฟิกตอนแอปสตาร์ตเพื่อเช็กว่าโหลดถูก environment หรือไม่ เช่น `log.info(\"startup_config\", config=settings.model_dump())`",
        "เมื่อใช้ `SecretStr` แม้แต่ใน `model_dump()` ค่าของ `api_key` ก็ยังคงเป็นออบเจกต์ `SecretStr('**********')` ไม่หลุดออกมาเป็น plain text โดยไม่ตั้งใจ",
      ],
    },
    {
      id: "dotenv-hygiene",
      title: "3 · สุขอนามัยไฟล์ `.env` vs `.env.example` และ `.gitignore`",
      paragraphs: [
        "กฎเหล็กของทุกทีมวิศวกรรม: **ไฟล์ `.env` ที่มีค่าจริงห้ามถูก commit เข้า Git เด็ดขาด** ต้องเพิ่ม `.env` และ `.env.*` ลงใน `.gitignore` ตั้งแต่นาทีแรกที่ตั้ง repo (ยกเว้น `.env.example`)",
        "ในทางกลับกัน ให้สร้างและ commit ไฟล์ `.env.example` ที่มีชื่อตัวแปรครบทุกตัวพร้อมค่าสมมติ (placeholder) เพื่อเป็นเอกสารให้เพื่อนร่วมทีมรู้ทันทีว่าต้องตั้งค่าอะไรบ้าง และใช้ factory function `load_settings()` แทนการสร้าง global `settings = AppSettings()` ตอน import เพื่อให้เขียน `pytest` สลับค่าคอนฟิกได้สะดวก",
      ],
      analogy:
        "`.env.example` เหมือนแบบฟอร์มใบสมัครเปล่าที่แจกให้ทุกคนดูว่าต้องกรอกช่องไหนบ้าง ส่วน `.env` คือใบสมัครที่กรอกเลขบัตรประชาชนและรหัสผ่านจริงแล้ว — ต้องเก็บไว้กับตัว ห้ามถ่ายเอกสารแปะบอร์ดสาธารณะ",
      bullets: [
        "**`.gitignore`**: ใส่ `.env` และ `.env.local` ตั้งแต่ commit แรกของโปรเจกต์",
        "**`.env.example`**: commit เข้า Git พร้อมค่าตัวอย่าง เช่น `AI_APP_API_KEY=replace-me-local-only`",
        "**อย่า instantiate `AppSettings()` ตอน import โมดูล**: ให้เรียกผ่านฟังก์ชัน `load_settings()` เพื่อไม่ให้ `pytest` พังตอน import เมื่อยังไม่ได้ตั้ง env var",
      ],
      code: {
        language: "text",
        filename: ".env.example",
        code: `# คัดลอกไฟล์นี้เป็น .env แล้วใส่ค่าของคุณ (ห้าม commit .env เข้า Git)
AI_APP_API_KEY=replace-with-your-key
AI_APP_MODEL_NAME=gpt-4o-mini
AI_APP_TIMEOUT_SECONDS=15
AI_APP_MAX_RETRIES=3
AI_APP_DATA_DIR=data`,
        caption: "ตัวอย่างไฟล์ `.env.example` ที่ปลอดภัยสำหรับการ commit เข้า Git เพื่อให้ทีมเริ่มรันโปรเจกต์ได้ใน 1 นาที",
      },
      whyTitle: "Why this matters — ลบ `.env` ใน commit ถัดไปไม่ช่วยอะไร!",
      whyParagraphs: [
        "ประวัติ Git เก็บทุก commit ย้อนหลังตลอดไป หากเผลอ push API key ขึ้น repository สาธารณะ บอตสแกนจะเก็บคีย์ไปใช้ภายในไม่กี่วินาที ต่อให้ลบไฟล์ออกใน commit ถัดไปก็สายเกินแก้ — ต้อง revoke คีย์นั้นทิ้งทันที",
        "การแยก `.env` ออกจาก Git ตั้งแต่ Day 7 และตรวจซ้ำด้วย pre-commit hook (Day 11) จะทำให้ความปลอดภัยกลายเป็นนิสัยอัตโนมัติ",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ pydantic-settings กับ dotenv + Zod",
      body: [
        "ในฝั่ง Node.js/Next.js คุณมักใช้ `dotenv` คู่กับ `zod` (หรือ `@t3-oss/env-nextjs`) เพื่อ validate `process.env` ตอนสตาร์ต ใน Python `pydantic-settings` ทำหน้าที่ทั้งสองอย่างรวมในคลาสเดียว:",
      ],
      table: [
        ["`class AppSettings(BaseSettings):`", "`const envSchema = z.object({ ... })`"],
        ["`SettingsConfigDict(env_file=\".env\")`", "`dotenv.config()` + `envSchema.parse(process.env)`"],
        ["`timeout_seconds: float = Field(ge=1)`", "`TIMEOUT_SECONDS: z.coerce.number().min(1)`"],
        ["`api_key: SecretStr`", "ไม่มี built-in ใน Zod — ต้อง mask เองตอน log"],
        ["`monkeypatch.setenv(...)` ใน pytest", "กำหนด `process.env.KEY = ...` ใน Vitest/Jest"],
      ],
    },
    student: {
      title: "First-Year Note — Environment Variable คืออะไร และต่างจากตัวแปร Python อย่างไร?",
      body: [
        "ตัวแปรในโค้ด Python มีชีวิตอยู่เฉพาะตอนสคริปต์รันและถูกเขียนฝังไว้ในไฟล์ `.py` ส่วน **Environment Variable** คือคู่ `KEY=VALUE` ที่ระบบปฏิบัติการ (Windows PowerShell, macOS/Linux Terminal หรือ Docker) ส่งเข้ามาให้โปรแกรมตอนเริ่มทำงาน",
        "การเก็บความลับและค่าตั้งค่าไว้ใน Environment Variable (หรือไฟล์ `.env` เฉพาะบนเครื่องเรา) จึงทำให้แชร์โค้ด `.py` กับคนทั้งโลกได้โดยไม่แชร์รหัสผ่านไปด้วย",
      ],
    },
  },

  workedExample: {
    intro:
      "มาดูการทำงานจริงของ `pydantic-settings` ตั้งแต่การโหลดไฟล์ `.env`, การให้ OS Env Var ทับค่าใน `.env`, การ fail-fast เมื่อขาดค่าจำเป็น ไปจนถึงการซ่อนความลับใน summary",
    steps: [
      {
        title: "1 · นิยาม `PipelineSettings` พร้อม `env_prefix` และ `SecretStr`",
        explain:
          "ใช้ `SettingsConfigDict` กำหนด prefix `AI_APP_` และ `extra=\"ignore\"` เพื่อไม่ให้ตัวแปรระบบอื่นใน `.env` ทำให้แอปพัง",
        code: {
          language: "python",
          filename: "worked_d007.py",
          code: `from pathlib import Path
from pydantic import Field, SecretStr, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class PipelineSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AI_APP_",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_key: SecretStr
    model_name: str = "local-mock"
    timeout_seconds: float = Field(default=10.0, ge=1.0, le=60.0)
    max_retries: int = Field(default=3, ge=0, le=5)
    data_dir: Path = Path("data")`,
        },
        output: `# ประกาศคลาสคอนฟิกพร้อมกฎตรวจสอบชนิดและขอบเขตครบถ้วน`,
      },
      {
        title: "2 · โหลดจาก `.env` และทดสอบ Fail-Fast เมื่อค่าผิดกฎ",
        explain:
          "ส่ง `_env_file=env_path` เพื่อชี้ไฟล์ `.env` เฉพาะตอนทดสอบ และดูว่าเมื่อ `max_retries=99` (เกินขอบเขต `le=5`) จะโยน `ValidationError` ทันที",
        code: {
          language: "python",
          filename: "worked_d007.py",
          code: `import os

env_path = Path("demo_d007.env")
env_path.write_text(
    "AI_APP_API_KEY=sk-local-demo-7788\\n"
    "AI_APP_TIMEOUT_SECONDS=25.5\\n"
    "AI_APP_MODEL_NAME=thai-classifier-v1\\n",
    encoding="utf-8",
)

# 1) โหลดจากไฟล์ .env
cfg = PipelineSettings(_env_file=env_path)
print("Loaded:", cfg.model_name, cfg.timeout_seconds, "key=", cfg.api_key)

# 2) OS Env Var ชนะไฟล์ .env เสมอ
os.environ["AI_APP_MODEL_NAME"] = "prod-override-v2"
cfg_override = PipelineSettings(_env_file=env_path)
print("Override:", cfg_override.model_name)

# 3) Fail-fast เมื่อค่าอยู่นอกขอบเขต
os.environ["AI_APP_MAX_RETRIES"] = "99"
try:
    PipelineSettings(_env_file=env_path)
except ValidationError as err:
    print("Fail-fast caught:", err.errors()[0]["loc"], err.errors()[0]["msg"])
finally:
    os.environ.pop("AI_APP_MODEL_NAME", None)
    os.environ.pop("AI_APP_MAX_RETRIES", None)
    env_path.unlink(missing_ok=True)`,
        },
        output: `Loaded: thai-classifier-v1 25.5 key= **********
Override: prod-override-v2
Fail-fast caught: ('max_retries',) Input should be less than or equal to 5`,
      },
      {
        title: "3 · สร้าง Safe Summary สำหรับ Log และแกะ Secret เฉพาะตอนสร้าง Header",
        explain:
          "พิมพ์สรุปคอนฟิกอย่างปลอดภัยโดยไม่ให้ `api_key` ดิบหลุดออกมา และสร้างฟังก์ชัน `build_auth_header` เป็นจุดเดียวที่เรียก `.get_secret_value()`",
        code: {
          language: "python",
          filename: "worked_d007.py",
          code: `def safe_summary(settings: PipelineSettings) -> dict[str, object]:
    return {
        "model_name": settings.model_name,
        "timeout_seconds": settings.timeout_seconds,
        "max_retries": settings.max_retries,
        "data_dir": str(settings.data_dir),
        "api_key": str(settings.api_key),  # ได้ "**********" เสมอ
    }


def build_auth_header(settings: PipelineSettings) -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.api_key.get_secret_value()}"}


sample = PipelineSettings(api_key=SecretStr("sk-secret-5555"))
print("Safe log:", safe_summary(sample))
print("Auth header prefix:", build_auth_header(sample)["Authorization"][:16] + "...")`,
        },
        output: `Safe log: {'model_name': 'local-mock', 'timeout_seconds': 10.0, 'max_retries': 3, 'data_dir': 'data', 'api_key': '**********'}
Auth header prefix: Bearer sk-secret...`,
      },
    ],
    gotcha:
      "ห้ามเขียน `settings = PipelineSettings()` ไว้ที่ระดับ top-level ของไฟล์ `config.py`! เพราะทันทีที่ `pytest` สั่ง `import config` โดยยังไม่ได้ตั้ง `AI_APP_API_KEY` การ import จะพังก่อนที่ fixture หรือ `monkeypatch` ของเทสต์จะมีโอกาสทำงาน — ให้ห่อไว้ในฟังก์ชัน `load_settings(...)` แทน",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `app_config.py` ที่ใช้ `pydantic-settings` โหลดคอนฟิกแบบ fail-fast, รองรับทั้งไฟล์ `.env` และ OS env vars, ป้องกัน secret รั่วด้วย `SecretStr` และทดสอบได้สะอาดด้วย `monkeypatch` + `tmp_path`",
    requirements: [
      "สร้าง `PipelineSettings(BaseSettings)` ที่ตั้ง `model_config = SettingsConfigDict(env_prefix=\"AI_APP_\", env_file_encoding=\"utf-8\", extra=\"ignore\")`",
      "กำหนดฟิลด์: `api_key: SecretStr` (บังคับต้องมี), `model_name: str = \"local-mock\"`, `timeout_seconds: float = Field(default=15.0, ge=1.0, le=60.0)`, `max_retries: int = Field(default=3, ge=0, le=5)`, และ `data_dir: Path = Path(\"data\")`",
      "สร้าง `load_settings(env_file: Path | None = None) -> PipelineSettings` ที่โหลดจาก `env_file` (เมื่อส่งเข้ามา) หรือจาก OS env vars โดยไม่ instantiate ที่ระดับ module import",
      "สร้าง `safe_config_summary(settings: PipelineSettings) -> dict[str, object]` ที่คืน dict ของฟิลด์ทั้งหมดโดยแปลง `data_dir` เป็น `str` และให้ `api_key` เป็นค่าที่ถูก mask (`str(settings.api_key)` หรือ `\"**********\"`) ห้ามมีค่า secret จริง",
      "สร้าง `build_auth_headers(settings: PipelineSettings) -> dict[str, str]` ที่คืน `{\"Authorization\": f\"Bearer {settings.api_key.get_secret_value()}\"}`",
    ],
    starter: {
      language: "python",
      filename: "app_config.py",
      code: `from pathlib import Path
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class PipelineSettings(BaseSettings):
    # TODO: กำหนด model_config และฟิลด์ api_key, model_name, timeout_seconds, max_retries, data_dir
    pass


def load_settings(env_file: Path | None = None) -> PipelineSettings:
    # TODO: คืน PipelineSettings โดยส่ง _env_file=env_file เมื่อมีการระบุไฟล์
    raise NotImplementedError


def safe_config_summary(settings: PipelineSettings) -> dict[str, object]:
    # TODO: คืน dict สรุปคอนฟิกที่ปลอดภัยสำหรับ log (ไม่เปิดเผย api_key จริง)
    raise NotImplementedError


def build_auth_headers(settings: PipelineSettings) -> dict[str, str]:
    # TODO: แกะ SecretStr ด้วย .get_secret_value() เฉพาะในจุดสร้าง Authorization header
    raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_app_config.py",
      code: `from pathlib import Path
import pytest
from pydantic import ValidationError
from app_config import (
    PipelineSettings,
    build_auth_headers,
    load_settings,
    safe_config_summary,
)


def test_load_from_dotenv_and_os_override(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("AI_APP_API_KEY", raising=False)
    monkeypatch.delenv("AI_APP_MODEL_NAME", raising=False)
    monkeypatch.delenv("AI_APP_TIMEOUT_SECONDS", raising=False)
    monkeypatch.delenv("AI_APP_MAX_RETRIES", raising=False)

    env_file = tmp_path / ".env"
    env_file.write_text(
        "AI_APP_API_KEY=sk-test-secret-8899\\n"
        "AI_APP_MODEL_NAME=model-from-file\\n"
        "AI_APP_TIMEOUT_SECONDS=22.5\\n"
        "AI_APP_MAX_RETRIES=4\\n"
        "AI_APP_DATA_DIR=datasets/th\\n"
        "UNRELATED_VAR=ignored\\n",
        encoding="utf-8",
    )

    cfg = load_settings(env_file=env_file)
    assert isinstance(cfg, PipelineSettings)
    assert cfg.model_name == "model-from-file"
    assert cfg.timeout_seconds == 22.5
    assert cfg.max_retries == 4
    assert cfg.data_dir == Path("datasets/th")

    # OS env var ต้องมีลำดับความสำคัญเหนือ .env
    monkeypatch.setenv("AI_APP_MODEL_NAME", "model-from-os")
    cfg2 = load_settings(env_file=env_file)
    assert cfg2.model_name == "model-from-os"


def test_fail_fast_when_missing_key_or_out_of_bounds(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("AI_APP_API_KEY", raising=False)
    empty_env = tmp_path / ".env"
    empty_env.write_text("", encoding="utf-8")

    with pytest.raises(ValidationError):
        load_settings(env_file=empty_env)

    monkeypatch.setenv("AI_APP_API_KEY", "sk-valid-1234")
    monkeypatch.setenv("AI_APP_MAX_RETRIES", "10")
    with pytest.raises(ValidationError):
        load_settings(env_file=empty_env)


def test_secret_is_masked_in_summary_and_unwrapped_only_in_headers(
    monkeypatch: pytest.MonkeyPatch,
):
    raw_key = "sk-top-secret-4242"
    monkeypatch.setenv("AI_APP_API_KEY", raw_key)
    cfg = load_settings()

    summary = safe_config_summary(cfg)
    assert summary["api_key"] == "**********"
    assert raw_key not in str(summary)
    assert raw_key not in repr(cfg)

    headers = build_auth_headers(cfg)
    assert headers == {"Authorization": f"Bearer {raw_key}"}
`,
    },
    selfCheck: [
      "import `app_config` ได้โดยไม่พังแม้ยังไม่ได้ตั้ง `AI_APP_API_KEY` ในระบบ",
      "OS env var (`monkeypatch.setenv`) ทับค่าในไฟล์ `.env` ได้ถูกต้อง และตัวแปรที่ไม่เกี่ยวข้อง (`UNRELATED_VAR`) ถูกข้ามอย่างปลอดภัย",
      "เมื่อขาด `AI_APP_API_KEY` หรือ `AI_APP_MAX_RETRIES=10` ฟังก์ชัน `load_settings()` โยน `ValidationError` ทันที",
      "`safe_config_summary` และ `repr(cfg)` ไม่มีค่า secret จริงหลุดออกมา ส่วน `build_auth_headers` คืน `Bearer <secret>` ถูกต้อง",
      "รัน `uv run pytest -q` ผ่านครบ 3 ข้อ และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้งหมดด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `load_settings(env_file: Path | None = None)` ให้เช็ก `if env_file is not None: return PipelineSettings(_env_file=env_file)` มิฉะนั้น `return PipelineSettings()`",
      },
      {
        body: "อย่าลืมกำหนด `extra=\"ignore\"` ใน `SettingsConfigDict` เพื่อไม่ให้ตัวแปรอื่น ๆ ในไฟล์ `.env` อย่าง `UNRELATED_VAR` ทำให้เกิด `ValidationError`",
      },
      {
        body: "โครงของ `PipelineSettings` และ `load_settings` พร้อมแล้ว — เหลือเติม `safe_config_summary` และ `build_auth_headers`",
        code: {
          language: "python",
          filename: "hint-d007-l3.py",
          code: `from pathlib import Path
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class PipelineSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AI_APP_",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_key: SecretStr
    model_name: str = "local-mock"
    timeout_seconds: float = Field(default=15.0, ge=1.0, le=60.0)
    max_retries: int = Field(default=3, ge=0, le=5)
    data_dir: Path = Path("data")


def load_settings(env_file: Path | None = None) -> PipelineSettings:
    if env_file is not None:
        return PipelineSettings(_env_file=env_file)
    return PipelineSettings()`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -v
uv run ruff check .`,
      caption: "`monkeypatch` ของ pytest จะคืนค่า environment variables กลับสภาพเดิมให้อัตโนมัติหลังจบแต่ละเทสต์",
    },
  },

  mistakes: [
    {
      title: "เผลอ commit ไฟล์ `.env` ขึ้น Git",
      symptom: "API key จริงฝังอยู่ในประวัติ Git ตลอดไป แม้จะลบไฟล์ใน commit ถัดมาก็ยังเปิดดูจาก `git log` ได้",
      fix: "เพิ่ม `.env` ลงใน `.gitignore` ตั้งแต่วันแรก และ commit เฉพาะ `.env.example` ที่มีค่า placeholder (หากหลุดไปแล้วต้อง revoke คีย์ทันที)",
    },
    {
      title: "สร้าง `settings = PipelineSettings()` ไว้ที่ระดับบนสุดของไฟล์ (import time)",
      symptom: "รัน `pytest` หรือ CI แล้วพังตั้งแต่ตอน `import` เพราะยังไม่ได้ตั้ง env var หรือตั้ง `monkeypatch` ไม่ทัน",
      fix: "ห่อการสร้างไว้ในฟังก์ชัน `load_settings()` หรือ dependency injection เพื่อโหลดเมื่อเริ่มรันจริงหรือในเทสต์",
    },
    {
      title: "ลืมเรียก `.get_secret_value()` ตอนส่ง `SecretStr` ให้ HTTP Client",
      symptom: "เซิร์ฟเวอร์ตอบ `401 Unauthorized` เพราะ header ที่ส่งออกไปคือ `Authorization: Bearer **********`",
      fix: "เรียก `settings.api_key.get_secret_value()` เฉพาะบรรทัดที่สร้าง header หรือ client credentials",
    },
    {
      title: "ใช้ `os.getenv(\"MAX_RETRIES\", 3)` แล้วเอาไปเปรียบเทียบกับตัวเลข",
      symptom: "เมื่อตั้ง env เป็น `\"3\"` จะได้ชนิด `str` ไม่ใช่ `int` ทำให้เกิด `TypeError` ตอนเปรียบเทียบใน runtime",
      fix: "ใช้ `BaseSettings` ของ `pydantic-settings` ซึ่งแปลงชนิดข้อมูล ({{coercion}}) และตรวจขอบเขตให้ครบตั้งแต่สตาร์ต",
    },
  ],

  quiz: {
    intro: "4 ข้อ ตรวจความเข้าใจ `pydantic-settings`, ลำดับความสำคัญ env, `SecretStr` และ `.env` hygiene",
    questions: [
      mc(
        "d007-q1",
        "หากในไฟล์ `.env` ตั้ง `AI_APP_MODEL_NAME=gpt-4o-mini` แต่ใน OS Environment Variable ตั้ง `AI_APP_MODEL_NAME=prod-model` ไว้ด้วย `PipelineSettings` จะเลือกค่าใด?",
        [
          ["เลือก `prod-model` เพราะ OS Environment Variable มีลำดับความสำคัญสูงกว่าไฟล์ `.env`", "ถูก — ช่วยให้ override ค่าใน staging/production ผ่าน Docker หรือ Cloud ได้โดยไม่ต้องแก้ไฟล์"],
          ["เลือก `gpt-4o-mini` เพราะไฟล์ `.env` ถูกอ่านทีหลังสุด", "ผิดลำดับ — `pydantic-settings` ให้ OS env var ชนะ `.env` เสมอ"],
          ["โยน `ValidationError` เพราะชื่อซ้ำกัน", "ไม่ error — `pydantic-settings` มีลำดับความสำคัญ (precedence) ชัดเจน"],
          ["ต่อสตริงสองค่าเข้าด้วยกันเป็น `gpt-4o-mini,prod-model`", "ไม่ต่อสตริง — ค่าที่มีลำดับสูงกว่าจะทับค่าที่ต่ำกว่า"],
        ],
        "A",
        "ลำดับความสำคัญของ `pydantic-settings` คือ: init kwargs > OS env vars > `.env` file > field defaults",
        "ระหว่าง OS Environment Variable กับไฟล์ `.env` ใน `pydantic-settings` ค่าไหนมีลำดับความสำคัญสูงกว่า?",
        "OS Environment Variable มีลำดับความสำคัญสูงกว่าไฟล์ `.env` เสมอ",
      ),
      mc(
        "d007-q2",
        "เมื่อกำหนด `api_key: SecretStr` ใน `BaseSettings` หากคุณเขียน `headers = {\"Authorization\": f\"Bearer {settings.api_key}\"}` จะเกิดอะไรขึ้น?",
        [
          ["ส่ง API key จริงออกไปอย่างถูกต้องเพราะ f-string แกะ `SecretStr` ให้อัตโนมัติ", "ไม่แกะให้อัตโนมัติ — เพื่อป้องกันไม่ให้เผลอหลุดลง log หรือ f-string"],
          ["เกิด `TypeError` เพราะ `SecretStr` ใช้ใน f-string ไม่ได้", "ไม่เกิด TypeError แต่ `str(SecretStr)` จะคืน `**********`"],
          ["Header ที่ได้คือ `Bearer **********` ทำให้เรียก API ไม่ผ่าน — ต้องใช้ `.get_secret_value()`", "ถูก — ต้องแกะอย่างตั้งใจด้วย `settings.api_key.get_secret_value()` เฉพาะจุดที่ส่งให้ client"],
          ["Pydantic จะเข้ารหัส header ด้วย SHA-256 ให้", "`SecretStr` แค่ mask การแสดงผล ไม่ได้แฮชค่า"],
        ],
        "C",
        "`SecretStr` ป้องกันการรั่วไหลโดยคืน `**********` เสมอเมื่อแปลงเป็นสตริง ต้องเรียก `.get_secret_value()` เฉพาะจุดที่จำเป็นจริง ๆ",
        "จะดึงข้อความความลับจริงออกจากฟิลด์ชนิด `SecretStr` ใน Pydantic ได้อย่างไร?",
        "เรียกเมธอด `.get_secret_value()` เฉพาะจุดขอบระบบที่จำเป็นต้องใช้งานจริง",
      ),
      mc(
        "d007-q3",
        "ข้อใดคือแนวปฏิบัติเรื่องไฟล์ `.env` ที่ถูกต้องที่สุดสำหรับทีมพัฒนา AI?",
        [
          ["Commit ทั้ง `.env` และ `.env.example` เพื่อให้เพื่อนรันได้ทันที", "อันตรายมาก — ห้าม commit `.env` ที่มี secret จริงขึ้น Git"],
          ["ใส่ `.env` ใน `.gitignore` และ commit `.env.example` ที่มีชื่อตัวแปรครบพร้อมค่า placeholder", "ถูก — ปลอดภัยต่อ secret และยังเป็นเอกสารให้ทีมตั้งค่าเครื่องตัวเองได้ทันที"],
          ["เขียน API key ไว้ใน `config.py` เป็นค่า default แทนการใช้ `.env`", "ห้าม hardcode secret ในซอร์สโค้ดเด็ดขาด"],
          ["ลบ `.env` ออกใน commit ถัดไปถ้าเผลอ push ขึ้น GitHub แล้วก็ถือว่าปลอดภัย", "ไม่ปลอดภัย — ประวัติ Git ยังเก็บ commit เก่าไว้ ต้อง revoke key ทันที"],
        ],
        "B",
        "แยกความลับไว้ใน `.env` (ignored by Git) และแชร์โครงสร้างตัวแปรผ่าน `.env.example` คือมาตรฐาน 12-Factor และ security hygiene",
        "ไฟล์ใดควรอยู่ใน `.gitignore` และไฟล์ใดควร commit เข้า Git เพื่อให้ทีมรู้ชื่อตัวแปร env ทั้งหมด?",
        "ใส่ `.env` ใน `.gitignore` และ commit `.env.example` (มีเฉพาะชื่อตัวแปรกับค่าสมมติ) เข้า Git",
      ),
      mc(
        "d007-q4",
        "เหตุใดจึงไม่ควรเขียน `settings = PipelineSettings()` ไว้ที่ระดับบนสุดของโมดูล (รันทันทีตอน `import`)?",
        [
          ["เพราะ `BaseSettings` ไม่อนุญาตให้สร้างออบเจกต์ในระดับโมดูล", "Python อนุญาต แต่สร้างปัญหาหนักตอนเขียน unit test"],
          ["เพราะจะทำให้ `SecretStr` ไม่ยอมซ่อนค่าความลับ", "`SecretStr` ซ่อนค่าเหมือนเดิมไม่ว่าจะสร้างที่ไหน"],
          ["เพราะทำให้ไฟล์ `.env` ถูกเขียนทับเป็นไฟล์ว่าง", "การอ่าน `.env` ไม่เคยเขียนทับไฟล์"],
          ["เพราะการ `import` โมดูลใน `pytest` หรือ CI จะพังทันทีหากยังไม่ได้ตั้ง env var ทำให้ใช้ `monkeypatch` สลับคอนฟิกในเทสต์ได้ยาก", "ถูก — การใช้ฟังก์ชัน `load_settings()` ทำให้ควบคุมจังหวะโหลดคอนฟิกในเทสต์และแอปได้สะอาด"],
        ],
        "D",
        "การโหลดคอนฟิกผ่านฟังก์ชัน `load_settings()` (หรือ lifespan/dependency injection ใน FastAPI) ทำให้โค้ดทดสอบง่ายและไม่ผูกกับสภาพแวดล้อมตอน import",
        "ทำไมควรห่อการสร้าง `BaseSettings()` ไว้ในฟังก์ชัน `load_settings()` แทนการประกาศเป็นตัวแปร global ตอน import?",
        "เพื่อให้ import โมดูลใน `pytest` ได้โดยไม่พัง และสามารถใช้ `monkeypatch` สลับค่า env var ในแต่ละเทสต์ได้อย่างอิสระ",
      ),
    ],
  },

  takeaways: [
    "ใช้ `BaseSettings` ของ `pydantic-settings` แทน `os.getenv` กระจัดกระจาย เพื่อตรวจชนิด ขอบเขต และค่าที่จำเป็นแบบ {{fail-fast}} ตั้งแต่สตาร์ต",
    "จำลำดับความสำคัญ: init args > OS Env Vars > `.env` > defaults — ทำให้เปลี่ยนคอนฟิกบน Docker/Cloud ได้โดยไม่แก้โค้ด",
    "เก็บ API key และรหัสผ่านใน `SecretStr` เพื่อซ่อนอัตโนมัติใน log/repr และเรียก `.get_secret_value()` เฉพาะจุดขอบระบบ",
    "ใส่ `.env` ใน `.gitignore`, commit เฉพาะ `.env.example` และโหลดคอนฟิกผ่าน `load_settings()` เพื่อให้เขียนเทสต์ด้วย `monkeypatch` ได้สะอาด",
  ],

  reviewCards: [
    rc(
      "d007-rc-1",
      "ประโยชน์หลักของ `BaseSettings` (`pydantic-settings`) เหนือการใช้ `os.getenv()` ตรง ๆ คืออะไร?",
      "รวมคอนฟิกไว้ที่เดียว แปลงชนิดข้อมูล (coercion) และตรวจขอบเขตแบบ fail-fast ตั้งแต่สตาร์ต พร้อมรองรับลำดับ OS env var > `.env` > default",
    ),
    rc(
      "d007-rc-2",
      "ชนิด `SecretStr` ช่วยป้องกันความลับรั่วไหลอย่างไร และต้องระวังอะไรเวลาเอาไปใช้งานจริง?",
      "`str()`/`repr()`/`model_dump()` จะแสดงเป็น `**********` อัตโนมัติ แต่เวลาส่งเข้า HTTP header ต้องเรียก `.get_secret_value()` อย่าใส่ใน f-string ตรง ๆ",
    ),
    rc(
      "d007-rc-3",
      "ถ้าเผลอ commit ไฟล์ `.env` ที่มี API key จริงขึ้น GitHub ไปแล้ว ต้องทำอย่างไร?",
      "ต้อง **revoke/rotate API key นั้นทันที** (แค่ลบไฟล์ใน commit ใหม่ไม่พอเพราะประวัติ Git ยังเห็นได้) แล้วจึงเพิ่ม `.env` เข้า `.gitignore`",
    ),
  ],

  sources: [
    { label: "Pydantic Settings Official Docs — Settings Management", href: "https://docs.pydantic.dev/latest/concepts/pydantic_settings/" },
    { label: "Pydantic v2 Docs — Secret Types (`SecretStr`)", href: "https://docs.pydantic.dev/latest/api/types/#pydantic.types.SecretStr" },
    { label: "The Twelve-Factor App — III. Config", href: "https://12factor.net/config" },
    { label: "pytest Official Docs — Monkeypatching Environment Variables", href: "https://docs.pytest.org/en/stable/how-to/monkeypatch.html" },
  ],

  glossary: [
    "env-config",
    "pydantic",
    "fail-fast",
    "validation-error",
    "coercion",
    "pathlib",
    "structlog",
    "pytest",
  ],
});
