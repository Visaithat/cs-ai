import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

/**
 * D027 — Phase 1 / Block B07
 * Caching Patterns (In-memory LRU vs Disk/SQLite cache for API cost).
 */
export const d027: Lesson = defineLesson({
  day: 27,
  titleTh: "รูปแบบการทำ Caching ลดค่า LLM API และ Latency: In-memory LRU vs SQLite Cache",
  tagline: "30 นาที · รันบนเครื่องคุณ 100% · ไม่ต้องใช้ API key · สร้าง Deterministic SHA-256 Cache Key พร้อม TTL บน SQLite",
  icon: "hard-drive",
  visual: {
    id: "sql-cache-arch",
    title: "Caching Patterns — ประหยัดค่า LLM API & Latency ด้วย LRU vs SQLite",
    caption: "เทียบ Cache Hit (0ms, $0) กับ Cache Miss และวิธีสร้าง deterministic cache key ด้วย SHA-256 + TTL",
    alt: "แผนภาพการทำงานของ LRU และ SQLite cache สำหรับลดค่า API",
  },
  requiresApiKey: false,
  tools: ["SQLite", "Python 3.12", "hashlib", "pytest", "Ruff"],

  bigPicture: [
    {
      node: 2,
      heading: "ประหยัดค่าเรียก LLM API จากคำถามและเอกสารที่ซ้ำกัน",
      body: "ในการพัฒนาและใช้งานจริง ทีมมักยิงคำถามเดิมซ้ำ ๆ (เช่น FAQ ลูกค้า หรือชุดทิกเก็ตเดิมตอนดีบักโค้ด) หากไม่ทำ {{caching}} ทุกครั้งที่รันใหม่จะต้องจ่ายค่า {{llm}} และรอเครือข่ายใหม่ทั้งหมด",
      lessonNote: "วันนี้เราออกแบบ deterministic cache key ด้วย `SHA-256` ของ `(prompt, model, temperature, prompt_version)`",
    },
    {
      node: 3,
      heading: "เร่งความเร็วรอบการพัฒนาและทดสอบ Eval Suite",
      body: "เมื่อปรับโค้ดส่วนจัดรูปแบบผลลัพธ์แต่ไม่ได้แก้ prompt การอ่านคำตอบเดิมจากแคชช่วยให้รันทดสอบทั้งชุดจบในหลักมิลลิวินาทีด้วยต้นทุน $0",
      lessonNote: "ใช้ `prompt_version` เป็นส่วนหนึ่งของ key เพื่อแยกคำตอบของ prompt รุ่นเก่ากับรุ่นใหม่ออกจากกันโดยอัตโนมัติ",
    },
    {
      node: 4,
      heading: "เลือกชั้นของ Cache ให้ตรงกับลักษณะงาน (RAM vs Disk)",
      body: "แคชในหน่วยความจำ (`lru_cache`) เร็วระดับไมโครวินาทีแต่หายทันทีเมื่อจบโปรเซส ส่วนแคชบนดิสก์ ({{sqlite}}) อยู่รอดข้ามการรีสตาร์ตและแชร์ระหว่างการรัน CLI ได้",
      lessonNote: "เปรียบเทียบข้อดี–ข้อจำกัดของ `functools.lru_cache` กับ `SQLiteCache` ที่มี TTL",
    },
    {
      node: 5,
      heading: "วัด Cache Hit Rate และควบคุมอายุข้อมูลด้วย TTL",
      body: "แคชที่ไม่มีวันหมดอายุอาจเสิร์ฟข้อมูลล้าสมัย (stale data) และแคชที่ไม่มีตัวเลข hit/miss จะไม่รู้เลยว่าช่วยประหยัดเงินได้จริงแค่ไหน",
      lessonNote: "เก็บสถิติ `hits`, `misses`, `hit_rate` และทดสอบวันหมดอายุ TTL ได้ทันทีผ่าน dependency injection ของ `clock`",
    },
  ],

  objectives: [
    "**สร้าง** deterministic cache key ด้วย `hashlib.sha256` บน canonical JSON (`sort_keys=True`) ที่รวมข้อความที่ normalize แล้ว, `model`, {{temperature}} และ `prompt_version`",
    "**เปรียบเทียบ** และเลือกใช้งาน `functools.lru_cache` (in-memory) กับ persistent {{sqlite}} cache ได้ตรงตามลักษณะของแอปและ CLI",
    "**พัฒนา** ชั้น {{caching}} บน SQLite ที่รองรับ TTL expiration, parameterized upsert (`ON CONFLICT DO UPDATE`), สถิติ hit/miss และการทดสอบแบบ deterministic โดยไม่ต้อง `time.sleep`",
  ],

  prerequisites: [
    "ผ่าน Day 26 (SQLite parameterized queries `?`, transactions `with conn:` และ WAL mode)",
    "เข้าใจ `json.dumps`, type hints และพื้นฐานการเขียนเทสต์ด้วย {{pytest}}",
    "มี Python 3.11+ และ `uv` บนเครื่อง — ใช้ standard library (`hashlib`, `functools`, `sqlite3`) 100% ไม่ต้องใช้ API key",
  ],

  setup: {
    intro:
      "เครื่องมือทั้งหมดในบทนี้ (`functools.lru_cache`, `hashlib`, `json`, `sqlite3`, `time`) มากับ Python standard library ครบแล้ว ตั้งโปรเจกต์ `uv` พร้อม `pytest` และ `ruff` ได้เลย",
    commands: `uv init ai-day27-caching && cd ai-day27-caching
uv add --dev pytest ruff

# เช็ก standard library ที่ใช้สร้าง cache key
uv run python -c "import hashlib, functools, sqlite3; print('Ready!')"`,
    steps: [
      ["init", "สร้างโฟลเดอร์ `ai-day27-caching` ด้วย `uv init`"],
      ["dev", "เพิ่ม `pytest` และ `ruff` ผ่าน `uv add --dev`"],
      ["verify", "ยืนยันว่า `hashlib`, `functools` และ `sqlite3` พร้อมใช้งาน"],
    ],
    note: "แนวคิด Local Response Cache วันนี้ทำงานเสริมกันได้ดีกับ Provider-side {{prompt-caching}} ใน Phase 3 — ถ้า Hit ที่เครื่องเรา ต้นทุนเป็น $0 และไม่ต้องวิ่งออกเน็ตเลย",
  },

  concepts: [
    {
      id: "deterministic-cache-key",
      title: "1 · Deterministic Cache Key — ทำไมต้องใช้ SHA-256 ไม่ใช่ `hash()`",
      paragraphs: [
        "หัวใจของ {{caching}} ที่ถูกต้องคือ **Cache Key ต้องสะท้อนทุกปัจจัยที่มีผลต่อคำตอบ** สำหรับการเรียก {{llm}} ปัจจัยเหล่านั้นได้แก่ ข้อความ prompt ที่ normalize ช่องว่างแล้ว, ชื่อ `model`, ค่า {{temperature}} และ `prompt_version` — หากเปลี่ยนแค่ตัวเดียว Key ต้องเปลี่ยนทันทีเพื่อไม่ให้เสิร์ฟคำตอบผิดรุ่น",
        "ข้อห้ามสำคัญใน Python คือ **ห้ามใช้ฟังก์ชัน `hash(...)` ที่ติดมากับภาษาทำ persistent cache key** เพราะ Python สุ่มค่า salt ใหม่ทุกครั้งที่เปิดโปรเซส (`PYTHONHASHSEED`) ทำให้คำเดิมได้เลข hash ไม่ซ้ำกันข้ามรอบ! ให้แปลง payload เป็น canonical JSON ด้วย `json.dumps(data, sort_keys=True, ensure_ascii=False)` แล้วแฮชด้วย `hashlib.sha256(...).hexdigest()` เสมอ",
      ],
      analogy:
        "เหมือนรหัสบาร์โค้ดมาตรฐานของเมนูอาหารที่เข้ารหัสทั้งชื่อเมนู ระดับความเผ็ด (`temperature`) และสูตรเชฟ (`prompt_version`) — แค่เปลี่ยนสูตรเป็น v2 บาร์โค้ดก็เปลี่ยนทันที ไม่หยิบจานค้างจากสูตรเก่ามาเสิร์ฟ",
      code: {
        language: "python",
        filename: "cache_key.py",
        code: `import hashlib
import json


def make_cache_key(
    prompt: str,
    model: str,
    temperature: float = 0.0,
    prompt_version: str = "v1",
) -> str:
    # รวมช่องว่างซ้ำให้เป็นช่องว่างเดียว เพื่อให้คำถามเดียวกันได้ key เดียวกัน
    normalized_prompt = " ".join(prompt.split())
    payload = {
        "prompt": normalized_prompt,
        "model": model,
        "temperature": round(temperature, 4),
        "prompt_version": prompt_version,
    }
    canonical = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


k1 = make_cache_key("ขอใบกำกับภาษี   ครับ", "mini-v1", 0.0, "v1")
k2 = make_cache_key("ขอใบกำกับภาษี ครับ", "mini-v1", 0.0, "v1")
k3 = make_cache_key("ขอใบกำกับภาษี ครับ", "mini-v1", 0.0, "v2")
print("Same normalized prompt:", k1 == k2)  # True
print("Changed prompt_version:", k1 == k3)  # False`,
        caption: "การใช้ `sort_keys=True` รับประกันว่าลำดับคีย์ใน JSON จะเหมือนกันทุกครั้ง ได้ SHA-256 64 ตัวอักษรที่นิ่ง 100% ข้ามเครื่องและข้ามโปรเซส",
      },
      whyTitle: "Why this matters — เมื่อไหร่ควรและไม่ควร Cache คำตอบ LLM",
      whyParagraphs: [
        "งานจัดหมวดหมู่ทิกเก็ต ดึงข้อมูล JSON หรือสร้าง embedding ที่ใช้ `temperature = 0.0` มีความนิ่งสูง จึงเหมาะกับ exact-match response caching มาก สามารถลดค่า API ระหว่างพัฒนาและงานซ้ำใน production ได้ 40%–80%",
        "แต่สำหรับงานสร้างสรรค์ที่ตั้ง `temperature` สูงเพื่อให้ได้คำตอบหลากหลายทุกครั้ง หรือคำถามที่ผูกกับข้อมูลสดแบบวินาทีต่อวินาที (เช่น ราคาหุ้นตอนนี้) ไม่ควรแคชยาวหรือควรตั้ง TTL สั้นมาก",
      ],
    },
    {
      id: "lru-vs-sqlite-cache",
      title: "2 · In-memory `lru_cache` vs Disk/SQLite Cache",
      paragraphs: [
        "`functools.lru_cache(maxsize=256)` เป็น decorator ในตัวของ Python ที่เก็บผลลัพธ์ไว้ใน RAM โดยตัดรายการที่ไม่ได้ใช้นานที่สุดออก (Least Recently Used) เมื่อเต็มขนาด ข้อดีคือเร็วระดับไมโครวินาทีและเขียนแค่บรรทัดเดียว แต่มีข้อจำกัดใหญ่คือ **ข้อมูลหายเกลี้ยงทันทีที่โปรแกรมปิดตัว** และแชร์ข้ามโปรเซสไม่ได้",
        "สำหรับเครื่องมือ CLI, batch pipeline หรือบริการ local ที่รันหลายรอบ การเก็บแคชลง {{sqlite}} บนดิสก์ตอบโจทย์กว่ามาก: อ่านเร็วในระดับต่ำกว่า 1 มิลลิวินาที, อยู่รอดข้ามการรีสตาร์ต, เก็บได้หลายแสนรายการโดยไม่กิน RAM และรองรับ TTL กับการคิวรีสถิติด้วย SQL ได้ทันที",
      ],
      analogy:
        "`lru_cache` เหมือนกระดาษโพสต์อิตแปะข้างจอ (เหลือบตาเห็นทันที แต่ปิดคอมเก็บโต๊ะก็หายหมด) ส่วน SQLite Cache เหมือนตู้แฟ้มมีดัชนีในลิ้นชัก (พรุ่งนี้กลับมาเปิดเครื่องยังหยิบคำตอบเดิมมาใช้ได้ทันที)",
      bullets: [
        "**`functools.lru_cache`** — เหมาะกับฟังก์ชัน pure/deterministic ภายในโปรเซสเดียว (เช่น โหลด regex, แปลง config, คำนวณซ้ำในลูป)",
        "**Persistent SQLite Cache** — เหมาะกับคำตอบ LLM API, HTTP response, embeddings ที่ต้นทุนแพงและต้องอยู่รอดข้ามการรัน CLI",
        "**เสริมกับ {{prompt-caching}}** — Prompt caching ลดค่า input tokens บนฝั่งผู้ให้บริการ ส่วน SQLite response cache ตัดการยิงเครือข่ายเหลือ 0 ครั้ง ($0, ~1ms)",
      ],
      code: {
        language: "python",
        filename: "lru_demo.py",
        code: `from functools import lru_cache


@lru_cache(maxsize=128)
def normalize_category(raw: str) -> str:
    return raw.strip().lower().replace(" ", "_")


normalize_category("  Billing Issue ")
normalize_category("  Billing Issue ")
print(normalize_category.cache_info())
# CacheInfo(hits=1, misses=1, maxsize=128, currsize=1)`,
        caption: "`lru_cache` มี `.cache_info()` ให้ดู hits/misses และ `.cache_clear()` สำหรับล้างแคชในหน่วยความจำ แต่ไม่สามารถตั้ง TTL ในตัวได้",
      },
      whyTitle: "Why this matters — เลือกเครื่องมือให้เหมาะก่อนจะรีบติดตั้ง Redis",
      whyParagraphs: [
        "หลายทีมรีบตั้ง Redis Server ตั้งแต่ยังเป็นโปรโตไทป์หรือ CLI บนเครื่องเดียว ทำให้เพิ่มภาระดูแลระบบโดยไม่จำเป็น ทั้งที่ SQLite ในโหมด WAL ไฟล์เดียวรองรับงาน local caching และ single-node API ได้สบายมาก",
        "และเมื่อระบบขยายเป็นหลายเซิร์ฟเวอร์ใน Phase 5 คุณเพียงเปลี่ยน implementation ใต้ interface `get / set / get_or_compute` จาก SQLite เป็น Redis โดยไม่ต้องแก้โค้ดธุรกิจเลย",
      ],
    },
    {
      id: "ttl-and-invalidation",
      title: "3 · TTL Expiration และ Cache Invalidation อย่างปลอดภัย",
      paragraphs: [
        "ปัญหาคลาสสิกของแคชคือ \"เมื่อไหร่ควรทิ้งของเก่า?\" แนวทางมาตรฐานที่ใช้ร่วมกันได้ 2 ชั้นคือ: (1) **TTL (Time-To-Live)** บันทึกเวลาหมดอายุ `expires_at = now + ttl_seconds` ไว้ในตาราง SQLite แล้วเช็ก `expires_at > now` ทุกครั้งที่อ่าน และ (2) **Versioned Key** เปลี่ยนค่า `prompt_version` (เช่น `v1` → `v2`) เมื่อแก้ prompt เพื่อบังคับให้เกิด cache miss อย่างสะอาดโดยไม่ต้องลบฐานข้อมูล",
        "สำหรับการเขียนลง SQLite ใช้คำสั่ง `INSERT INTO ... VALUES (?, ?, ?, ?) ON CONFLICT(cache_key) DO UPDATE SET ...` (upsert) ผ่าน parameterized query เพื่ออัปเดตค่าเดิมที่หมดอายุแล้วได้ในคำสั่งเดียวอย่าง atomic",
      ],
      analogy:
        "เหมือนกล่องนมในตู้เย็นที่มีทั้ง 'วันหมดอายุ' (TTL) และ 'รหัสสูตรการผลิต' (`prompt_version`) — ถ้านมหมดอายุหรือโรงงานออกสูตรใหม่ เราจะเปิดกล่องใหม่แทนการดื่มกล่องเก่า",
      code: {
        language: "sql",
        filename: "cache_upsert.sql",
        code: `CREATE TABLE IF NOT EXISTS response_cache (
    cache_key TEXT PRIMARY KEY,
    response_text TEXT NOT NULL,
    created_at REAL NOT NULL,
    expires_at REAL NOT NULL
);

-- บันทึกหรือทับค่าเดิมเมื่อ key ชนกัน (Atomic Upsert)
INSERT INTO response_cache (cache_key, response_text, created_at, expires_at)
VALUES (?, ?, ?, ?)
ON CONFLICT(cache_key) DO UPDATE SET
    response_text = excluded.response_text,
    created_at = excluded.created_at,
    expires_at = excluded.expires_at;`,
        caption: "การเก็บ `expires_at` เป็น Unix timestamp (`REAL`) ทำให้เปรียบเทียบ `expires_at > ?` ได้ตรงและเร็วมากโดยไม่ต้องแปลง timezone",
      },
      whyTitle: "Why this matters — ทดสอบ TTL ใน pytest โดยไม่ต้องรอเวลาจริง",
      whyParagraphs: [
        "ถ้าโค้ดของคุณเรียก `time.time()` ฝังตายตัวข้างใน การทดสอบว่าแคชหมดอายุหลัง 3,600 วินาทีจะทำไม่ได้จริง (คงไม่มีใครอยากให้ unit test นอนรอ 1 ชั่วโมง!)",
        "แค่รับ `clock: Callable[[], float] = time.time` เข้ามาใน `__init__` ของคลาสแคช ในเทสต์คุณก็สามารถส่งนาฬิกาจำลองที่หมุนเวลาไปข้างหน้า +3,601 วินาทีได้ในเสี้ยววินาที",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge — เทียบ Python Caching กับ JS/TS & Redis",
      body: [
        "หากคุณเคยทำ caching ใน Node.js หรือ Backend Web ความเชื่อมโยงตรงกันเกือบทุกจุด:",
      ],
      table: [
        ["`@functools.lru_cache(maxsize=256)`", "ไลบรารี `lru-cache` หรือ `Map` ในหน่วยความจำ Node.js"],
        ["`SQLiteCache` + `expires_at` TTL", "Redis `SET key value EX 3600` (แต่ไม่ต้องรันเซิร์ฟเวอร์แยก)"],
        ["`hashlib.sha256(canonical_json)`", "`crypto.createHash('sha256').update(json).digest('hex')`"],
        ["`prompt_version` ใน Cache Key", "Cache busting prefix เช่น `v2:user:123` หรือ asset hash"],
      ],
    },
    student: {
      title: "First-Year Note — ทำไม `hash('hello')` ใน Python เปลี่ยนทุกครั้งที่รันใหม่?",
      body: [
        "ลองรัน `python -c \"print(hash('hello'))\"` สองครั้งติดกัน คุณจะได้ตัวเลขไม่เหมือนกัน! นี่ไม่ใช่บั๊ก แต่เป็นกลไกความปลอดภัยของ Python (Hash Randomization) เพื่อกันการโจมตี HashDoS บน dictionary",
        "ดังนั้น `hash()` ใช้ได้เฉพาะภายในโปรเซสเดียวกันเท่านั้น เมื่อใดก็ตามที่ต้องเก็บ key ลงไฟล์หรือฐานข้อมูลอย่าง SQLite ต้องใช้ cryptographic hash อย่าง `hashlib.sha256` เสมอ",
      ],
    },
  },

  workedExample: {
    intro:
      "สร้างคลาส `SQLiteResponseCache` ที่สมบูรณ์แบบในไม่กี่สิบบรรทัด แล้วทดสอบทั้ง Cache Miss → Cache Hit และ TTL Expiration ด้วยนาฬิกาจำลอง",
    steps: [
      {
        title: "1 · สร้างฟังก์ชัน `make_cache_key` ที่นิ่งข้ามโปรเซส",
        explain:
          "Normalize ช่องว่างใน prompt แล้วรวม `model`, `temperature`, `prompt_version` เข้า canonical JSON ก่อนส่งเข้า `hashlib.sha256`",
        code: {
          language: "python",
          filename: "worked_d027.py",
          code: `import hashlib
import json


def make_cache_key(
    prompt: str,
    model: str,
    temperature: float = 0.0,
    prompt_version: str = "v1",
) -> str:
    payload = {
        "prompt": " ".join(prompt.split()),
        "model": model,
        "temperature": round(temperature, 4),
        "prompt_version": prompt_version,
    }
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


key_a = make_cache_key("  ขอใบกำกับภาษี  ", "mini-v1")
key_b = make_cache_key("ขอใบกำกับภาษี", "mini-v1")
print("Key length:", len(key_a), "| Equal:", key_a == key_b)`,
        },
        output: `Key length: 64 | Equal: True`,
      },
      {
        title: "2 · สร้าง `SQLiteResponseCache` รองรับ WAL, TTL และ injectable `clock`",
        explain:
          "แยก `clock` เป็นพารามิเตอร์ (ค่าเริ่มต้นคือ `time.time`) และเก็บตัวนับ `hits` / `misses` เพื่อให้ตรวจสอบประสิทธิภาพแคชได้ทันที",
        code: {
          language: "python",
          filename: "worked_d027.py",
          code: `import sqlite3
import time
from collections.abc import Callable
from pathlib import Path


class SQLiteResponseCache:
    def __init__(
        self,
        db_path: Path,
        ttl_seconds: float = 3600.0,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._ttl = ttl_seconds
        self._clock = clock
        self.hits = 0
        self.misses = 0
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA journal_mode = WAL")
        with self._conn:
            self._conn.execute("""
                CREATE TABLE IF NOT EXISTS response_cache (
                    cache_key TEXT PRIMARY KEY,
                    response_text TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    expires_at REAL NOT NULL
                )
            """)

    def get(self, key: str) -> str | None:
        now = self._clock()
        row = self._conn.execute(
            "SELECT response_text, expires_at FROM response_cache WHERE cache_key = ?",
            (key,),
        ).fetchone()
        if row is None or row["expires_at"] <= now:
            self.misses += 1
            return None
        self.hits += 1
        return str(row["response_text"])

    def set(self, key: str, value: str, ttl_seconds: float | None = None) -> None:
        now = self._clock()
        ttl = self._ttl if ttl_seconds is None else ttl_seconds
        with self._conn:
            self._conn.execute(
                """
                INSERT INTO response_cache (cache_key, response_text, created_at, expires_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    response_text = excluded.response_text,
                    created_at = excluded.created_at,
                    expires_at = excluded.expires_at
                """,
                (key, value, now, now + ttl),
            )

    def close(self) -> None:
        self._conn.close()`,
        },
        output: `# นิยามคลาส SQLiteResponseCache สำเร็จ`,
      },
      {
        title: "3 · ทดสอบ Miss → Hit → หมดอายุ TTL ด้วยนาฬิกาจำลอง",
        explain:
          "รอบแรกเกิด miss จึงบันทึกคำตอบ รอบสองที่เวลา +10s ได้ hit ทันที รอบสามเมื่อหมุนเวลาไป +65s (เกิน TTL 60s) ระบบมองเป็น miss เพื่อไปดึงคำตอบสดใหม่",
        code: {
          language: "python",
          filename: "worked_d027.py",
          code: `import tempfile

now = [1000.0]
db_path = Path(tempfile.mkdtemp()) / "cache.db"
cache = SQLiteResponseCache(db_path, ttl_seconds=60.0, clock=lambda: now[0])

k = make_cache_key("โอนเงินแล้วแต่ยอดไม่ขึ้น", "mini-v1")
print("1st get:", cache.get(k))  # None (miss)
cache.set(k, '{"category": "billing"}')

now[0] = 1010.0
print("2nd get (+10s):", cache.get(k))  # Hit!

now[0] = 1065.0
print("3rd get (+65s):", cache.get(k))  # None (expired miss)
print(f"Stats -> hits={cache.hits}, misses={cache.misses}")
cache.close()`,
        },
        output: `1st get: None
2nd get (+10s): {"category": "billing"}
3rd get (+65s): None
Stats -> hits=1, misses=2`,
      },
    ],
    gotcha:
      "อย่าลืมเช็กเรื่อง **Negative Caching** (การเผลอแคชคำตอบตอน API error หรือ timeout): ควรเรียก `cache.set(...)` เฉพาะเมื่อคำตอบจาก API สำเร็จและผ่าน validation แล้วเท่านั้น มิฉะนั้นคุณจะเสิร์ฟ error เดิมซ้ำไปอีก 1 ชั่วโมงเต็ม!",
  },

  practice: {
    intro:
      "โจทย์ฝึกปฏิบัติ (12 นาที): สร้างโมดูล `response_cache.py` ที่มีฟังก์ชันสร้าง SHA-256 cache key และคลาส `SQLiteCache` พร้อม `get_or_compute`, `stats()` และ `clear_expired()`",
    requirements: [
      "สร้าง `make_cache_key(prompt: str, model: str, temperature: float = 0.0, prompt_version: str = 'v1') -> str` ที่ normalize ช่องว่างด้วย `' '.join(prompt.split())`, แปลงเป็น canonical JSON (`sort_keys=True, ensure_ascii=False`) และคืน SHA-256 hex digest ยาว 64 ตัวอักษร",
      "สร้างคลาส `SQLiteCache(db_path: Path, ttl_seconds: float = 3600.0, clock: Callable[[], float] = time.time)` ที่รองรับ context manager (`__enter__` / `__exit__`) และเมธอด `close()` พร้อมเปิด WAL mode และสร้างตาราง `response_cache`",
      "สร้างเมธอด `get(key: str) -> str | None` (คืน `None` เมื่อไม่พบหรือ `expires_at <= now` พร้อมนับ `hits`/`misses`) และ `set(key: str, value: str, ttl_seconds: float | None = None) -> None` (parameterized upsert)",
      "สร้างเมธอด `get_or_compute(key: str, compute: Callable[[], str], ttl_seconds: float | None = None) -> tuple[str, bool]` คืน `(value, from_cache)` — เรียก `compute()` เฉพาะตอน miss แล้วบันทึกลงแคช",
      "สร้างเมธอด `stats() -> dict[str, int | float]` คืน `{'hits': ..., 'misses': ..., 'hit_rate': ...}` (ถ้ายังไม่เคยเรียกให้ `hit_rate = 0.0`) และ `clear_expired() -> int` ลบแถวที่หมดอายุแล้วคืนจำนวนแถวที่ถูกลบ",
    ],
    starter: {
      language: "python",
      filename: "response_cache.py",
      code: `import hashlib
import json
import sqlite3
import time
from collections.abc import Callable
from pathlib import Path
from typing import Self


def make_cache_key(
    prompt: str,
    model: str,
    temperature: float = 0.0,
    prompt_version: str = "v1",
) -> str:
    # TODO: normalize prompt whitespace + canonical JSON + SHA-256 hex digest
    raise NotImplementedError


class SQLiteCache:
    def __init__(
        self,
        db_path: Path,
        ttl_seconds: float = 3600.0,
        clock: Callable[[], float] = time.time,
    ) -> None:
        # TODO: เปิด SQLite (WAL), สร้างตาราง response_cache, ตั้งค่า hits/misses
        raise NotImplementedError

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def close(self) -> None:
        raise NotImplementedError

    def get(self, key: str) -> str | None:
        # TODO: อ่านจาก response_cache และตรวจ expires_at > now
        raise NotImplementedError

    def set(
        self, key: str, value: str, ttl_seconds: float | None = None
    ) -> None:
        # TODO: parameterized upsert ด้วย ON CONFLICT(cache_key) DO UPDATE
        raise NotImplementedError

    def get_or_compute(
        self,
        key: str,
        compute: Callable[[], str],
        ttl_seconds: float | None = None,
    ) -> tuple[str, bool]:
        # TODO: คืน (value, True) เมื่อ hit; เรียก compute() + set() แล้วคืน (value, False) เมื่อ miss
        raise NotImplementedError

    def stats(self) -> dict[str, int | float]:
        # TODO: คืน hits, misses และ hit_rate (round 4 ตำแหน่ง)
        raise NotImplementedError

    def clear_expired(self) -> int:
        # TODO: ลบแถวที่ expires_at <= now และคืน cursor.rowcount
        raise NotImplementedError
`,
    },
    verification: {
      language: "python",
      filename: "test_response_cache.py",
      code: `from pathlib import Path
from response_cache import SQLiteCache, make_cache_key


def test_make_cache_key_is_deterministic_and_sensitive():
    k1 = make_cache_key("  ขอคืนเงิน   คำสั่งซื้อ 99  ", "mini-v1", 0.0, "v1")
    k2 = make_cache_key("ขอคืนเงิน คำสั่งซื้อ 99", "mini-v1", 0.0, "v1")
    k_diff_model = make_cache_key("ขอคืนเงิน คำสั่งซื้อ 99", "pro-v1", 0.0, "v1")
    k_diff_ver = make_cache_key("ขอคืนเงิน คำสั่งซื้อ 99", "mini-v1", 0.0, "v2")
    k_diff_temp = make_cache_key("ขอคืนเงิน คำสั่งซื้อ 99", "mini-v1", 0.7, "v1")

    assert len(k1) == 64
    assert k1 == k2
    assert len({k1, k_diff_model, k_diff_ver, k_diff_temp}) == 4


def test_sqlite_cache_persists_across_restarts(tmp_path: Path):
    db_file = tmp_path / "llm_cache.db"
    key = make_cache_key("ลืมรหัสผ่าน", "mini-v1")
    calls = 0

    def fake_llm() -> str:
        nonlocal calls
        calls += 1
        return '{"category": "account"}'

    # รอบที่ 1: miss -> เรียก fake_llm 1 ครั้ง
    with SQLiteCache(db_file, ttl_seconds=300.0) as cache1:
        val1, hit1 = cache1.get_or_compute(key, fake_llm)
        assert val1 == '{"category": "account"}'
        assert hit1 is False
        assert calls == 1

    # รอบที่ 2: เปิดอินสแตนซ์ใหม่ (จำลองการรีสตาร์ต CLI) -> ต้อง hit และ calls ยังเป็น 1!
    with SQLiteCache(db_file, ttl_seconds=300.0) as cache2:
        val2, hit2 = cache2.get_or_compute(key, fake_llm)
        assert val2 == '{"category": "account"}'
        assert hit2 is True
        assert calls == 1
        assert cache2.stats() == {"hits": 1, "misses": 0, "hit_rate": 1.0}


def test_ttl_expiration_and_clear_expired(tmp_path: Path):
    now = [5000.0]
    db_file = tmp_path / "ttl_cache.db"
    k_short = make_cache_key("คำถามอายุสั้น", "mini-v1")
    k_long = make_cache_key("คำถามอายุยาว", "mini-v1")

    with SQLiteCache(db_file, ttl_seconds=60.0, clock=lambda: now[0]) as cache:
        cache.set(k_short, "resp-short", ttl_seconds=30.0)
        cache.set(k_long, "resp-long", ttl_seconds=120.0)

        now[0] = 5020.0
        assert cache.get(k_short) == "resp-short"
        assert cache.get(k_long) == "resp-long"

        now[0] = 5035.0
        assert cache.get(k_short) is None  # หมดอายุแล้ว
        assert cache.get(k_long) == "resp-long"

        deleted = cache.clear_expired()
        assert deleted == 1
        stats = cache.stats()
        assert stats["hits"] == 3
        assert stats["misses"] == 1
        assert stats["hit_rate"] == 0.75
`,
    },
    selfCheck: [
      "`make_cache_key` คืน SHA-256 ยาว 64 ตัวอักษรที่เหมือนกันเมื่อต่างแค่ช่องว่าง และเปลี่ยนทันทีเมื่อเปลี่ยน `model`, `temperature` หรือ `prompt_version`",
      "เปิด `SQLiteCache` อินสแตนซ์ใหม่บนไฟล์ `.db` เดิมแล้วยังได้ cache hit (`calls == 1`)",
      "เมื่อหมุนนาฬิกาจำลองเกิน `ttl_seconds` เมธอด `get()` คืน `None` และนับเป็น miss",
      "`clear_expired()` ลบเฉพาะแถวที่หมดอายุและคืนจำนวนแถวที่ลบถูกต้อง",
      "ผ่าน `uv run pytest -q` ครบ 3 ข้อ และ `uv run ruff check .` ไม่มี warning",
    ],
    acceptance: "ผ่านเทสต์ทั้ง 3 ข้อด้วย `uv run pytest -q` และไม่มี lint error จาก `uv run ruff check .`",
    hints: [
      {
        body: "ใน `get_or_compute` ให้เรียก `cached = self.get(key)` ก่อน ถ้า `cached is not None` คืน `(cached, True)` ทันที มิฉะนั้นเรียก `value = compute()` → `self.set(key, value, ttl_seconds)` → คืน `(value, False)`",
      },
      {
        body: "ใน `clear_expired()` ใช้ `with self._conn: cur = self._conn.execute('DELETE FROM response_cache WHERE expires_at <= ?', (self._clock(),))` แล้วคืน `cur.rowcount`",
      },
      {
        body: "โครงหลักของ `make_cache_key` และ `SQLiteCache` เกือบครบแล้ว เหลือเติม `get_or_compute`, `stats` และ `clear_expired`",
        code: {
          language: "python",
          filename: "hint-d027-l3.py",
          code: `import hashlib
import json
import sqlite3
import time
from collections.abc import Callable
from pathlib import Path
from typing import Self


def make_cache_key(
    prompt: str,
    model: str,
    temperature: float = 0.0,
    prompt_version: str = "v1",
) -> str:
    payload = {
        "prompt": " ".join(prompt.split()),
        "model": model,
        "temperature": round(temperature, 4),
        "prompt_version": prompt_version,
    }
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class SQLiteCache:
    def __init__(
        self,
        db_path: Path,
        ttl_seconds: float = 3600.0,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._ttl = ttl_seconds
        self._clock = clock
        self.hits = 0
        self.misses = 0
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA journal_mode = WAL")
        with self._conn:
            self._conn.execute("""
                CREATE TABLE IF NOT EXISTS response_cache (
                    cache_key TEXT PRIMARY KEY,
                    response_text TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    expires_at REAL NOT NULL
                )
            """)

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def close(self) -> None:
        self._conn.close()

    def get(self, key: str) -> str | None:
        row = self._conn.execute(
            "SELECT response_text, expires_at FROM response_cache WHERE cache_key = ?",
            (key,),
        ).fetchone()
        if row is None or row["expires_at"] <= self._clock():
            self.misses += 1
            return None
        self.hits += 1
        return str(row["response_text"])

    def set(self, key: str, value: str, ttl_seconds: float | None = None) -> None:
        now = self._clock()
        ttl = self._ttl if ttl_seconds is None else ttl_seconds
        with self._conn:
            self._conn.execute(
                """
                INSERT INTO response_cache (cache_key, response_text, created_at, expires_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    response_text = excluded.response_text,
                    created_at = excluded.created_at,
                    expires_at = excluded.expires_at
                """,
                (key, value, now, now + ttl),
            )

    def get_or_compute(
        self, key: str, compute: Callable[[], str], ttl_seconds: float | None = None
    ) -> tuple[str, bool]:
        # TODO: ตรวจ self.get(key) ก่อน หาก miss ค่อยเรียก compute() แล้ว self.set(...)
        raise NotImplementedError

    def stats(self) -> dict[str, int | float]:
        # TODO: คำนวณ hit_rate = round(self.hits / total, 4) ถ้า total > 0 else 0.0
        raise NotImplementedError

    def clear_expired(self) -> int:
        # TODO: DELETE แถวที่ expires_at <= self._clock() แล้วคืน rowcount
        raise NotImplementedError`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run pytest -q
uv run ruff check .`,
      caption: "สังเกตว่าเทสต์ TTL รันจบในเสี้ยววินาทีเพราะเรา inject `clock` แทนการใช้ `time.sleep`",
    },
  },

  mistakes: [
    {
      title: "ใช้ฟังก์ชัน `hash(prompt)` ของ Python สร้าง Cache Key ลง SQLite",
      symptom: "รันโปรแกรมรอบใหม่แล้ว Cache Hit Rate เป็น 0% ตลอด ทั้งที่ prompt เดิมเป๊ะ",
      fix: "ใช้ `hashlib.sha256` บน canonical JSON (`json.dumps(..., sort_keys=True)`) ซึ่งให้ค่าเดิม 100% ทุกโปรเซสและทุกเครื่อง",
    },
    {
      title: "ลืมใส่ `model` หรือ `prompt_version` ลงใน Cache Key",
      symptom: "อัปเกรด system prompt เป็น v2 หรือเปลี่ยนโมเดลแล้ว แต่ระบบยังคืนคำตอบจาก prompt รุ่นเก่าที่ค้างอยู่ในแคช",
      fix: "รวม `model`, `temperature` และ `prompt_version` ไว้ใน payload ก่อนแฮชทุกครั้ง เพื่อให้การเปลี่ยนเวอร์ชัน invalidate แคชเก่าอัตโนมัติ",
    },
    {
      title: "แคชผลลัพธ์แม้ตอน LLM API error หรือคืนข้อความว่าง",
      symptom: "ผู้ใช้คนต่อ ๆ ไปได้ข้อความ error ซ้ำจากแคชจนกว่า TTL จะหมดอายุ (negative caching)",
      fix: "บันทึกผลลงแคชเฉพาะเมื่อเรียก API สำเร็จและผ่าน schema validation แล้วเท่านั้น",
    },
    {
      title: "ใช้ `time.sleep(61)` ใน `pytest` เพื่อทดสอบ TTL expiration",
      symptom: "ชุด unit test ช้ามากจนทีมไม่อยากรันเทสต์ก่อน commit",
      fix: "Inject พารามิเตอร์ `clock: Callable[[], float] = time.time` เข้าไปในคลาสแคช เพื่อหมุนเวลาจำลองในเทสต์ได้ทันที",
    },
  ],

  quiz: {
    intro: "4 ข้อ เพื่อตรวจความเข้าใจเรื่อง Deterministic Cache Key, LRU vs SQLite และ TTL Invalidation",
    questions: [
      mc(
        "d027-q1",
        "ทำไมจึง **ห้าม** ใช้ฟังก์ชัน `hash(prompt)` ที่มากับ Python เพื่อสร้าง Cache Key สำหรับเก็บลง SQLite?",
        [
          ["เพราะ `hash()` คืนค่าเป็น float ใช้เป็น PRIMARY KEY ไม่ได้", "`hash()` คืน `int` ไม่ใช่ `float`"],
          ["เพราะ Python สุ่ม hash seed ใหม่ทุกครั้งที่เปิดโปรเซส ทำให้ข้อความเดิมได้ค่า `hash()` ต่างกันเมื่อรันครั้งใหม่", "ถูก — เมื่อรัน CLI รอบสองจะหาของเก่าใน SQLite ไม่เจอ ต้องใช้ `hashlib.sha256` แทน"],
          ["เพราะ `hash()` ไม่รองรับภาษาไทย (UTF-8)", "`hash()` รองรับ Unicode/ภาษาไทยได้ แต่ไม่นิ่งข้ามโปรเซส"],
          ["เพราะ `hash()` ช้ากว่า `sha256` มาก", "`hash()` เร็วกว่า แต่ไม่ deterministic ข้ามโปรเซส"],
        ],
        "B",
        "Python เปิด Hash Randomization เป็นค่าเริ่มต้นเพื่อป้องกัน HashDoS ดังนั้น persistent cache key ต้องใช้ cryptographic hash อย่าง `hashlib.sha256` เสมอ",
        "ทำไม persistent cache key ใน Python ต้องใช้ `hashlib.sha256` แทน `hash()`?",
        "เพราะ `hash()` เปลี่ยนค่าทุกครั้งที่เริ่มโปรเซสใหม่ (`PYTHONHASHSEED`) ส่วน `sha256` คืนค่าคงที่ 100% ข้ามโปรเซสและข้ามเครื่อง",
      ),
      mc(
        "d027-q2",
        "คุณกำลังสร้าง CLI สำหรับจัดหมวดหมู่ทิกเก็ตด้วย LLM ที่ผู้ใช้จะรันคำสั่งจากเทอร์มินัลวันละหลายรอบ ควรเลือกแคชแบบใด?",
        [
          ["`@functools.lru_cache` อย่างเดียว เพราะเร็วที่สุด", "เมื่อ CLI รันจบโปรเซส แคชใน RAM จะหายเกลี้ยง รอบถัดไปต้องยิง API ใหม่หมด"],
          ["Persistent SQLite Cache บนดิสก์พร้อม TTL เพราะข้อมูลอยู่รอดข้ามการรัน CLI และอ่านได้ใน ~1ms", "ถูก — ช่วยให้การรันคำสั่งเดิมรอบสองมีต้นทุน API เป็น $0 โดยไม่ต้องตั้ง Redis server"],
          ["ไม่ต้องทำแคช เพราะ CLI รันแค่ทีละคำสั่ง", "CLI batch มักถูกรันซ้ำระหว่างพัฒนาหรือเมื่อมีทิกเก็ตซ้ำ การมีแคชประหยัดค่า API ได้มหาศาล"],
          ["เก็บลงตัวแปร `global dict` ในไฟล์ Python", "`global dict` อยู่ใน RAM และหายทันทีเมื่อจบโปรเซสเหมือน `lru_cache`"],
        ],
        "B",
        "`lru_cache` เหมาะกับการลดงานซ้ำภายในโปรเซสเดียวที่ยังเปิดอยู่ ส่วน CLI ที่เริ่มและจบโปรเซสทุกครั้งต้องการ persistent cache อย่าง SQLite",
        "เมื่อไหร่ควรเลือก SQLite Cache แทน `functools.lru_cache`?",
        "เมื่อต้องการให้แคชอยู่รอดข้ามการรีสตาร์ต/การรัน CLI หลายรอบ ต้องการกำหนด TTL หรือแชร์ข้อมูลขนาดใหญ่เกิน RAM",
      ),
      mc(
        "d027-q3",
        "ทีมแก้ไข System Prompt สำหรับจัดหมวดหมู่ทิกเก็ตจากรุ่นเดิมให้ละเอียดขึ้น แนวทางใดทำให้ได้ผลลัพธ์ใหม่สะอาดที่สุดโดยไม่ปนกับคำตอบเก่าใน SQLite Cache?",
        [
          ["ปล่อยไว้เหมือนเดิมแล้วรอให้แคชเก่าค่อย ๆ หมดอายุเองใน 7 วัน", "ช่วง 7 วันนั้นระบบจะเสิร์ฟคำตอบเก่าปนกับคำตอบใหม่ ทำให้วัดผลไม่ได้"],
          ["ขยับค่า `prompt_version` (เช่นจาก `v1` เป็น `v2`) ซึ่งเป็นส่วนหนึ่งของ SHA-256 Cache Key", "ถูก — ได้ key ใหม่ทันที 100% โดยไม่ต้องลบไฟล์ฐานข้อมูล และสามารถย้อนกลับไปเทียบกับ `v1` ได้ด้วย"],
          ["เปลี่ยนชื่อตาราง SQLite ใหม่ทุกสัปดาห์", "จัดการยากและทำให้โค้ด migration ซับซ้อนโดยไม่จำเป็น"],
          ["เพิ่ม `temperature` เป็น `2.0`", "การเพิ่ม temperature ทำให้คำตอบ LLM เพี้ยนและไม่นิ่ง ไม่ใช่การแก้ cache invalidation"],
        ],
        "B",
        "การฝัง `prompt_version` ไว้ใน cache key คือรูปแบบ Versioned Cache Invalidation ที่ปลอดภัย ย้อนกลับได้ และทำงานแบบอัตโนมัติ",
        "การใส่ `prompt_version` ไว้ใน SHA-256 cache key มีประโยชน์อย่างไร?",
        "เมื่อแก้ prompt แล้วขยับเลขเวอร์ชัน (v1 → v2) ระบบจะสร้าง key ใหม่และ miss แคชเก่าอัตโนมัติโดยไม่ต้องล้างฐานข้อมูล",
      ),
      mc(
        "d027-q4",
        "วิธีทดสอบการทำงานของ TTL expiration (เช่น 3,600 วินาที) ใน `pytest` ที่ดีที่สุดคือข้อใด?",
        [
          ["ตั้ง TTL เป็น 1 วินาทีแล้วใส่ `time.sleep(2)` ในเทสต์", "ทำให้ชุดเทสต์ช้าลงเรื่อย ๆ และอาจแกว่ง (flaky) บนเครื่อง CI ที่โหลดสูง"],
          ["รับพารามิเตอร์ `clock: Callable[[], float] = time.time` แล้วส่งนาฬิกาจำลองในเทสต์เพื่อเลื่อนเวลาได้ทันที", "ถูก — รันจบในไม่กี่มิลลิวินาที แม่นยำ 100% และทดสอบได้ทุกช่วงเวลา TTL"],
          ["ข้ามการทดสอบ TTL ไปก่อน ค่อยไปดูบน production", "บั๊ก TTL ที่พังอาจทำให้เสิร์ฟข้อมูลล้าสมัยหรือแคชไม่ติดเลยใน production"],
          ["เปลี่ยนเวลานาฬิกาของระบบปฏิบัติการ Windows/Linux ระหว่างรันเทสต์", "อันตรายมากและกระทบโปรแกรมอื่นรวมถึงใบรับรอง TLS บนเครื่อง"],
        ],
        "B",
        "Dependency injection ของฟังก์ชัน `clock` เป็นเทคนิคมาตรฐานในการทำให้โค้ดที่ขึ้นกับเวลาทดสอบได้อย่างรวดเร็วและ deterministic",
        "จะทดสอบ TTL ของแคชใน `pytest` ให้เร็วและไม่ flaky ได้อย่างไร?",
        "Inject พารามิเตอร์ `clock: Callable[[], float] = time.time` เข้าไปในคลาสแคช แล้วส่งฟังก์ชันคืนเวลาจำลองในเทสต์แทนการเรียก `time.sleep`",
      ),
    ],
  },

  takeaways: [
    "สร้าง deterministic cache key ด้วย `hashlib.sha256` บน canonical JSON (`sort_keys=True`) ที่รวม normalized prompt, `model`, `temperature` และ `prompt_version` — ห้ามใช้ `hash()` ของ Python",
    "`functools.lru_cache` เร็วใน RAM แต่หายเมื่อจบโปรเซส ส่วน **SQLite Cache** อยู่รอดข้ามการรัน CLI และรองรับ TTL โดยไม่ต้องตั้งเซิร์ฟเวอร์เพิ่ม",
    "ใช้ TTL (`expires_at`) คู่กับ `prompt_version` ใน key เพื่อทำ cache invalidation อย่างสะอาด และอย่าแคชคำตอบตอน API error",
    "Inject `clock: Callable[[], float] = time.time` เข้าไปในคลาสแคชเพื่อให้ทดสอบวันหมดอายุใน `pytest` ได้ทันทีโดยไม่ต้อง `time.sleep`",
  ],

  reviewCards: [
    rc(
      "d027-rc-1",
      "องค์ประกอบอย่างน้อย 4 อย่างที่ควรอยู่ใน payload ก่อนแฮชสร้าง LLM Response Cache Key คืออะไร?",
      "Normalized prompt, `model`, `temperature` และ `prompt_version` (แปลงเป็น JSON ด้วย `sort_keys=True` แล้วแฮชด้วย `hashlib.sha256`)",
    ),
    rc(
      "d027-rc-2",
      "เปรียบเทียบ `functools.lru_cache` กับ Persistent SQLite Cache ใน 1 ประโยค",
      "`lru_cache` อยู่ใน RAM เร็วมากแต่หายเมื่อจบโปรเซส ส่วน SQLite Cache อยู่บนดิสก์ข้ามการรีสตาร์ตได้ รองรับ TTL และเหมาะกับการลดค่า API ใน CLI/บริการจริง",
    ),
    rc(
      "d027-rc-3",
      "ทำไมจึงไม่ควรเรียก `cache.set(...)` เมื่อ LLM API เกิด error หรือคืนผลที่ validate ไม่ผ่าน?",
      "เพื่อป้องกัน Negative Caching ที่จะทำให้ระบบเสิร์ฟคำตอบพังเดิมซ้ำให้ผู้ใช้คนอื่นจนกว่า TTL จะหมดอายุ",
    ),
  ],

  sources: [
    { label: "Python 3 Official Docs — functools.lru_cache", href: "https://docs.python.org/3/library/functools.html#functools.lru_cache" },
    { label: "Python 3 Official Docs — hashlib (SHA-256)", href: "https://docs.python.org/3/library/hashlib.html" },
    { label: "SQLite Official Docs — UPSERT (ON CONFLICT DO UPDATE)", href: "https://www.sqlite.org/lang_upsert.html" },
    { label: "Python 3 Official Docs — PYTHONHASHSEED & Hash Randomization", href: "https://docs.python.org/3/using/cmdline.html#envvar-PYTHONHASHSEED" },
  ],

  glossary: [
    "caching",
    "sqlite",
    "llm",
    "temperature",
    "prompt-caching",
    "pytest",
    "ruff",
  ],
});
