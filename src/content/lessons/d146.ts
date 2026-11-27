import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const practiceTests = `from dataclasses import replace

import pytest


STAFF = Scope("campus-a", frozenset({"faq", "staff"}), "acl-1", "kb-1")
QUERY = "ทะเบียน เปิด เวลา"
PARAPHRASE = "ทะเบียน เปิด เวลา ครับ"


def test_similarity_and_threshold():
    assert cosine(embed(QUERY), embed(PARAPHRASE)) == pytest.approx(0.8660254)
    assert cosine(embed(QUERY), embed("โรงอาหาร เมนู")) < 0.85

    cache = SemanticCache(threshold=0.85)
    cache.put(STAFF, QUERY, "08:30", now=0)
    assert cache.get(STAFF, PARAPHRASE, now=1) == "08:30"
    assert cache.get(STAFF, "โรงอาหาร เมนู", now=1) is None

    strict = SemanticCache(threshold=0.90)
    strict.put(STAFF, QUERY, "08:30", now=0)
    assert strict.get(STAFF, PARAPHRASE, now=1) is None


def test_ttl_excludes_exact_expiry_and_prefers_fresh_tie():
    cache = SemanticCache(ttl_s=60)
    cache.put(STAFF, QUERY, "old", now=10)
    cache.put(STAFF, QUERY, "new", now=20)
    assert cache.get(STAFF, QUERY, now=69) == "new"
    assert cache.get(STAFF, QUERY, now=70) == "new"
    assert cache.get(STAFF, QUERY, now=80) is None
    assert STAFF not in cache.buckets


@pytest.mark.parametrize("other", [
    replace(STAFF, tenant="campus-b"),
    replace(STAFF, grants=frozenset({"faq"})),
    replace(STAFF, acl_revision="acl-2"),
    replace(STAFF, content_revision="kb-2"),
])
def test_scope_isolation(other):
    cache = SemanticCache()
    cache.put(STAFF, QUERY, "staff only", now=0)
    assert cache.get(other, QUERY, now=1) is None


def test_compression_preserves_citations_and_first_occurrence():
    a = ("reg-1", "เปิด 08:30")
    b = ("reg-2", "เปิด 08:30")
    c = ("reg-1", "วันศุกร์ปิดเร็ว")
    assert compress_context([a, b, a, c, b]) == [a, b, c]


def test_router_fails_closed_and_bypasses_similar_high_risk_query():
    assert route("unknown", high_risk=False) == "strong"
    assert route("reviewed_faq", high_risk=True) == "strong"

    calls = []

    def generate(tier, query, chunks):
        calls.append((tier, query, chunks))
        return f"response from {tier}"

    cache = SemanticCache()
    chunks = [("reg-1", "เปิด 08:30")] * 2
    first = answer_request(cache, STAFF, QUERY, "reviewed_faq", False, chunks, 0, generate)
    repeated = answer_request(cache, STAFF, PARAPHRASE, "reviewed_faq", False, chunks, 1, generate)
    risky = answer_request(cache, STAFF, PARAPHRASE, "reviewed_faq", True, chunks, 2, generate)
    assert (first[0], repeated[0], risky[0]) == ("cheap", "cache", "strong")
    assert calls == [
        ("cheap", QUERY, [("reg-1", "เปิด 08:30")]),
        ("strong", PARAPHRASE, [("reg-1", "เปิด 08:30")]),
    ]


def test_invalid_config_and_empty_query():
    with pytest.raises(ValueError):
        SemanticCache(threshold=1.1)
    with pytest.raises(ValueError):
        SemanticCache(ttl_s=0)
    with pytest.raises(ValueError):
        embed("   ")`;

const vectorHelpers = `from dataclasses import dataclass
from hashlib import blake2b
from math import isfinite, sqrt


DIMENSIONS = 128


def embed(text: str) -> tuple[float, ...]:
    counts = [0] * DIMENSIONS
    for word in text.casefold().split():
        digest = blake2b(word.encode("utf-8"), digest_size=8).digest()
        bucket = int.from_bytes(digest, "big") % DIMENSIONS
        counts[bucket] += 1
    norm = sqrt(sum(count * count for count in counts))
    if norm == 0:
        raise ValueError("query must contain a token")
    return tuple(count / norm for count in counts)


def cosine(left: tuple[float, ...], right: tuple[float, ...]) -> float:
    score = sum(a * b for a, b in zip(left, right, strict=True))
    return min(1.0, max(0.0, score))
`;

const cacheScaffold = `@dataclass(frozen=True)
class Scope:
    tenant: str
    grants: frozenset[str]
    acl_revision: str
    content_revision: str


@dataclass(frozen=True)
class Entry:
    vector: tuple[float, ...]
    answer: str
    expires_at: float


class SemanticCache:
    def __init__(self, threshold: float = 0.85, ttl_s: float = 60):
        if not 0 <= threshold <= 1:
            raise ValueError("threshold must be between zero and one")
        if not isfinite(ttl_s) or ttl_s <= 0:
            raise ValueError("TTL must be finite and positive")
        self.threshold = threshold
        self.ttl_s = ttl_s
        self.buckets: dict[Scope, list[Entry]] = {}

    def put(self, scope: Scope, text: str, answer: str, now: float) -> None:
        entry = Entry(embed(text), answer, now + self.ttl_s)
        self.buckets.setdefault(scope, []).append(entry)

`;

export const d146: Lesson = defineLesson({
  day: 146,
  titleTh: "ลดงานซ้ำด้วย Semantic Cache, Prompt Compression และ Model Tiering",
  tagline: "30 นาที · ตอบคำถามซ้ำด้วย cache ที่เคารพสิทธิ์ แล้วเลือกโมเดลตามความเสี่ยง",
  icon: "layers",
  visual: {
    id: "semantic-cache-tiering",
    title: "จากคำขอสู่ cache hit หรือเส้นทางโมเดล",
    caption: "สังเกตว่า cache hit ส่งคำตอบเดิมกลับได้ ส่วน miss จึงตัด context ซ้ำและเรียกโมเดลตามกลุ่มงาน",
    alt: "แผนภาพ semantic cache เปรียบเทียบความคล้ายก่อนส่งคำขอไปโมเดลราคาต่ำหรือโมเดลที่รับงานซับซ้อน",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ Python standard library และ mock generator ในเครื่องทั้งบท",
  tools: ["Python 3.12", "uv", "pytest"],

  bigPicture: [
    {
      node: 0,
      heading: "ลดคำขอที่ต้องสร้างคำตอบ",
      body: "Thai Knowledge RAG จ่ายค่า inference ซ้ำให้คำถามเรื่องเวลาทำการที่ใช้ถ้อยคำต่างกันเล็กน้อย",
      lessonNote: "เริ่มจากกลุ่ม FAQ ที่ทีมตรวจแล้วและไม่มีข้อมูลเฉพาะบุคคล",
    },
    {
      node: 4,
      heading: "จัดทางเดินของคำขอ",
      body: "บริการตรวจสิทธิ์และคุณสมบัติของงานก่อนค้น cache งานที่ไม่ผ่านเกณฑ์ reuse เดินตรงไปยังโมเดล",
      lessonNote: "วางชั้นนี้ไว้หน้าทางเรียก generator ใน microservice",
    },
    {
      node: 3,
      heading: "ทดสอบ false hit",
      body: "คำถามใกล้กันอาจระบุวัน สถานที่ หรือเงื่อนไขต่างกันจนต้องตอบคนละแบบ",
      lessonNote: "เพิ่ม near-miss ใน {{golden-dataset}} ของ D125 และใช้รายงานรายเคส",
    },
    {
      node: 5,
      heading: "วัดงานและความเสี่ยง",
      body: "เก็บจำนวน eligible, hit, miss และ bypass พร้อมอัตราคำตอบผิดจากตัวอย่างที่สุ่มตรวจ",
      lessonNote: "ใช้ตัวเลขเหล่านี้กับงบ D147 และหลักฐานสำหรับ v0.5.0 ใน D156",
    },
  ],
  objectives: [
    "สร้าง {{caching}} จาก {{embedding}} แบบ hashing และ {{cosine-similarity}} พร้อม threshold และ TTL",
    "จำกัด candidate ตาม tenant, effective {{acl}} และ revision ก่อนให้คะแนน",
    "ลด context ซ้ำโดยเก็บ citation และ route คำขอไป cheap หรือ strong ตามประเภทและความเสี่ยง",
  ],
  prerequisites: [
    "D79 (Phase 3) เคยใช้ {{prompt-caching}} แบบ prefix คงที่และเลือก tier ตามงาน",
    "D107 (Phase 4) เคยจำกัดเอกสารตาม tenant และ {{acl}} ฝั่งเซิร์ฟเวอร์",
    "D125–D126 เคยเก็บ expected output และรัน deterministic eval",
  ],

  setup: {
    intro: "ใช้คำถามสั้นที่คั่นคำด้วยช่องว่างเพื่อเห็นผล hashing ชัดเจน เตรียม Python 3.12 และ uv จากบทแรก ๆ",
    commands: "uv run --python 3.12 python semantic_service_demo.py",
    steps: [
      ["copy", "คัดลอกโค้ดตัวอย่างทั้งสามขั้นลงไฟล์เดียวตามลำดับ"],
      ["run", "รันตัวอย่างและเทียบค่ากับ output ที่อยู่ใต้แต่ละขั้น"],
      ["practice", "สร้างไฟล์จาก starter และไฟล์ pytest ในส่วนลองทำ"],
    ],
    note: "hashing ตัวอย่างใช้ token ตรงตัวและการนับจำนวน คำไทยจริงต้องใช้ tokenizer และ embedding ที่ทดสอบกับคำถามของบริการก่อนกำหนด threshold",
  },

  concepts: [
    {
      id: "prefix-vs-answer",
      title: "Prefix reuse และการใช้คำตอบซ้ำ",
      paragraphs: [
        "D79 ใช้ {{prompt-caching}} เพื่อให้ผู้ให้บริการใช้การคำนวณส่วนต้นที่ตรงกันซ้ำ คำขอยังผ่าน generation และมี output token ใหม่",
        "Semantic cache เก็บคำตอบจากงานที่เคยผ่านการสร้างแล้ว เมื่อ hit จะคืนคำตอบเดิมและข้าม generation ข้อแลกเปลี่ยนคือเราอาจนำข้อเท็จจริงคนละกรณีมาใช้ผิด",
        "ตัวอย่างใช้ BLAKE2b แมปคำลงช่องคงที่แล้วบวกจำนวน คำนวณ cosine ด้วย dot product หลัง normalize การชนกันมีได้แม้ใช้ hash คงที่",
      ],
      analogy: "เหมือนใช้ขั้นตอนเตรียมเอกสารซ้ำ เทียบกับหยิบเอกสารที่เสร็จแล้วส่งให้ผู้ขอคนใหม่",
      code: {
        language: "python",
        filename: "semantic_vectors.py",
        code: `${vectorHelpers}

print(round(cosine(embed("ทะเบียน เปิด เวลา"), embed("ทะเบียน เปิด เวลา ครับ")), 3))
# 0.866`,
      },
      whyTitle: "เลือก threshold จากคำถามจริง",
      whyParagraphs: [
        "คะแนนสูงหมายถึงเวกเตอร์คล้ายกัน ข้อความที่มีคำว่า วันนี้ และ พรุ่งนี้ อาจคล้ายแม้คำตอบต่างกัน",
        "สร้างคู่คำถามที่ควร reuse และคู่ near-miss แล้วดู accepted hit ที่ผิดแยกจาก hit rate อย่าคัดเกณฑ์จากตัวอย่างที่ใช้สอนเพียงคู่เดียว",
      ],
    },
    {
      id: "cache-scope-ttl",
      title: "ค้นในขอบเขตสิทธิ์ก่อนคิดคะแนน",
      paragraphs: [
        "ประกอบ scope จาก tenant และ effective grants ที่ middleware ยืนยันแล้ว ใช้ revision ของนโยบายและคลังความรู้เพื่อเลิกอ่านรายการย้อนหลังเมื่อข้อมูลเปลี่ยน",
        "เมื่อเอกสารหรือสิทธิ์เปลี่ยน ให้เปลี่ยน revision ที่ใช้กับคำขอถัดไปทันที TTL ช่วยจำกัดอายุข้อมูล แต่ช่องว่างก่อนหมดอายุยังยาวพอให้เห็นข้อมูลผิดได้",
        "ใช้เวลา monotonic ในโปรเซสจริง ตัวอย่างฉีด now เข้ามาเพื่อทดสอบที่ขอบเวลา หมดอายุเมื่อ now เท่ากับ expires_at",
      ],
      analogy: "เหมือนโต๊ะยืมหนังสือตรวจสิทธิ์เข้าห้องก่อนเปรียบเทียบชื่อเล่ม",
      code: {
        language: "python",
        filename: "semantic_scope.py",
        code: `from dataclasses import dataclass


@dataclass(frozen=True)
class Scope:
    tenant: str
    grants: frozenset[str]
    acl_revision: str
    content_revision: str


staff = Scope("campus-a", frozenset({"faq", "staff"}), "acl-1", "kb-1")
student = Scope("campus-a", frozenset({"faq"}), "acl-1", "kb-1")
print(staff == student)
print(70 < 10 + 60)
# False
# False`,
      },
      whyTitle: "เชื่อมกับ D107",
      whyParagraphs: [
        "รายการที่มีข้อมูลเฉพาะรายให้ bypass หรือรวม principal และข้อจำกัดทั้งหมดใน scope ตาม policy ที่ตรวจแล้ว",
        "ถ้าใช้ vector store ต้อง prefilter ที่ query ฝั่งเซิร์ฟเวอร์ และตรวจสิทธิ์ของ citation หากสิทธิ์ต้นทางมีการเปลี่ยนแปลง",
      ],
    },
    {
      id: "context-trimming",
      title: "ตัด context ซ้ำพร้อมคงหลักฐาน",
      paragraphs: [
        "แบบฝึกใช้การตัด chunk ที่ทั้ง source ID และข้อความตรงกัน คงลำดับครั้งแรกและไม่เปลี่ยนคำถาม",
        "คง system constraints, schema, citation และข้อความที่ตัดสินคำตอบ เช่น วันที่และข้อยกเว้น ส่วนการตัดละเอียดด้วยเครื่องมือ compression ต้องวัดเพิ่มด้วย eval",
        "ตัวเลข token ประหยัดจริงใช้ tokenizer หรือ usage จากผู้ให้บริการ คำไทยและภาษาอังกฤษตัดคำต่างกัน จำนวนอักขระจึงใช้แทนตรง ๆ ไม่ได้",
      ],
      analogy: "เหมือนถอดสำเนาเอกสารฉบับเดียวกันออก แต่เก็บหนังสือคนละฉบับที่มีข้อความตรงกันไว้ทั้งคู่",
      code: {
        language: "python",
        filename: "semantic_trim.py",
        code: `def compress_context(chunks: list[tuple[str, str]]) -> list[tuple[str, str]]:
    return list(dict.fromkeys(chunks))


print(compress_context([("A", "เปิด 08:30"), ("A", "เปิด 08:30"), ("B", "เปิด 08:30")]))
# [('A', 'เปิด 08:30'), ('B', 'เปิด 08:30')]`,
      },
      whyTitle: "ตรวจทั้งเนื้อหาและแหล่งอ้างอิง",
      whyParagraphs: [
        "ทดสอบว่าชื่อเอกสารยังตรงกับข้อความที่เก็บไว้ แล้ววัดอัตราที่คำตอบรองรับด้วยหลักฐานเหมือน D129",
        "เมื่อ prefix ที่เคย cache เปลี่ยน ให้ดู cached input token แยกจาก input token รวม",
      ],
    },
    {
      id: "tier-policy",
      title: "เส้นทาง cheap และ strong",
      paragraphs: [
        "ใช้ประเภทคำถามที่ฝั่งบริการจัดกลุ่มได้และระดับความเสี่ยงเป็นสัญญาณ เคส FAQ ที่ผ่านการตรวจใช้ cheap ส่วนประเภทไม่รู้จักหรือเสี่ยงสูงใช้ strong",
        "จำกัด cache lane ให้เป็น subset ของงานที่แชร์คำตอบได้ตาม policy ตัวอย่างให้สิทธิ์เฉพาะ reviewed_faq และไม่มี high-risk flag",
        "เมื่อต่อโมเดลจริงให้ตรวจ schema และอาจยกระดับเมื่อ cheap ตอบไม่ได้ ค่า retry และ escalation ต้องบันทึกเป็นต้นทุนจริง",
      ],
      analogy: "เหมือนส่งคำถามทั่วไปให้เคาน์เตอร์หน้า และส่งเรื่องที่มีผลเฉพาะรายให้เจ้าหน้าที่",
      code: {
        language: "python",
        filename: "semantic_router.py",
        code: `def route(intent: str, *, high_risk: bool) -> str:
    if intent == "reviewed_faq" and not high_risk:
        return "cheap"
    return "strong"


print(route("reviewed_faq", high_risk=False))
print(route("reviewed_faq", high_risk=True))
print(route("unknown", high_risk=False))
# cheap
# strong
# strong`,
      },
      whyTitle: "ดู mix หลังเปิด cache",
      whyParagraphs: [
        "เมื่อ hit ดึงงานง่ายออกจากคิว สัดส่วนของงานที่ไป strong ในกลุ่ม miss อาจสูงขึ้น",
        "เก็บ hit และ tier เป็นผลลัพธ์ที่ไม่ซ้ำกัน พร้อมเหตุผลที่ bypass เพื่อให้บัญชีต้นทุนรวมได้",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · จัด cache namespace จากข้อมูลที่ผ่าน auth",
      body: [
        "นึกถึง Vary ใน HTTP cache แล้วขยายไปถึง grants และ revision ของข้อมูล วิธีกำหนด namespace มีผลต่อผู้ใช้ที่แชร์ response ได้",
        "ถ้าเปลี่ยน prompt contract หรือรุ่น embedding ให้ version namespace และวัด score ใหม่ ลดการนำรายการคนละ schema มาเทียบ",
      ],
      table: [
        ["Scope","tenant + effective grants + ACL revision + content revision"],
        ["Hit","response เดิมพร้อม citation ที่ตรวจได้"],
        ["Miss / bypass","route ที่มองเห็นจาก trace แล้วค่อย generate"],
      ],
    },
    student: {
      title: "First-Year Note · normalize ก่อนคูณ",
      body: [
        "ถ้าเวกเตอร์มีองค์ประกอบขนาดเดียวกันสามช่องและอีกเวกเตอร์เพิ่มช่องที่สี่ dot product หลัง normalize คือ 3 หารด้วยรากของ 12 หรือราว 0.866",
        "ลองเปลี่ยนคำสุดท้ายเป็นคำที่ชน bucket เดิมเพื่อเห็นว่าคะแนนอาจขยับแม้จำนวนคำเท่าเดิม",
      ],
    },
  },

  workedExample: {
    intro: "คัดลอกทั้งสามขั้นเป็นไฟล์เดียว เริ่มด้วยแคชของเจ้าหน้าที่มหาวิทยาลัย A แล้วจำลองการถามซ้ำ การหมดอายุ และเส้นทางหลัง cache miss",
    steps: [
      {
        title: "สร้าง scope และเติมคำตอบที่ตรวจแล้ว",
        explain: "เวกเตอร์จากคำถามที่เพิ่มคำลงท้ายหนึ่งคำมีคะแนนประมาณ 0.866 จึงผ่าน threshold 0.85 ในชุดข้อมูลนี้",
        code: {
          language: "python",
          filename: "semantic_service_demo.py",
          code: `${vectorHelpers}

${cacheScaffold}    def get(self, scope: Scope, text: str, now: float) -> str | None:
        entries = self.buckets.get(scope, [])
        active = [entry for entry in entries if now < entry.expires_at]
        if not active:
            self.buckets.pop(scope, None)
            return None
        self.buckets[scope] = active

        query = embed(text)
        best = max(reversed(active), key=lambda entry: cosine(query, entry.vector))
        if cosine(query, best.vector) >= self.threshold:
            return best.answer
        return None


staff = Scope("campus-a", frozenset({"faq", "staff"}), "acl-1", "kb-1")
cache = SemanticCache(threshold=0.85, ttl_s=60)
query = "ทะเบียน เปิด เวลา"
variant = "ทะเบียน เปิด เวลา ครับ"
cache.put(staff, query, "เปิด 08:30", now=10)
print(f"similarity={cosine(embed(query), embed(variant)):.3f}")`,
        },
        output: "similarity=0.866",
      },
      {
        title: "ตรวจขอบเขตและเวลาหมดอายุ",
        explain: "คำถามเดิมในอีก tenant เป็น miss เช่นเดียวกับคำถามใน scope เดิมที่เวลาชนจุดหมดอายุ",
        code: {
          language: "python",
          filename: "semantic_service_demo.py",
          code: `other = Scope("campus-b", staff.grants, "acl-1", "kb-1")
print("within scope:", cache.get(staff, variant, now=30))
print("other tenant:", cache.get(other, variant, now=30))
print("at expiry:", cache.get(staff, variant, now=70))`,
        },
        output: "within scope: เปิด 08:30\nother tenant: None\nat expiry: None",
      },
      {
        title: "ตัด context ซ้ำและเรียกโมเดลจำลอง",
        explain: "หลัง expiry คำขอ FAQ เรียก cheap หนึ่งครั้ง จากนั้นคำถามที่คล้ายกัน hit ส่วนงานเสี่ยงถูกส่งไป strong โดยตรง",
        code: {
          language: "python",
          filename: "semantic_service_demo.py",
          code: `def compress_context(chunks: list[tuple[str, str]]) -> list[tuple[str, str]]:
    return list(dict.fromkeys(chunks))


def route(intent: str, *, high_risk: bool) -> str:
    if intent == "reviewed_faq" and not high_risk:
        return "cheap"
    return "strong"


def answer_request(cache, scope, text, intent, high_risk, chunks, now, generate):
    tier = route(intent, high_risk=high_risk)
    if tier == "cheap":
        answer = cache.get(scope, text, now)
        if answer is not None:
            return "cache", answer

    answer = generate(tier, text, compress_context(chunks))
    if tier == "cheap":
        cache.put(scope, text, answer, now)
    return tier, answer

def mock_generate(tier, text, chunks):
    return f"{tier} generated using {len(chunks)} source chunk(s)"


context = [("reg-1", "เปิด 08:30"), ("reg-1", "เปิด 08:30")]
for text, risk, now in [(query, False, 71), (variant, False, 72), (variant, True, 73)]:
    decision, answer = answer_request(
        cache, staff, text, "reviewed_faq", risk, context, now, mock_generate
    )
    print(decision, "=>", answer)`,
        },
        output: "cheap => cheap generated using 1 source chunk(s)\ncache => cheap generated using 1 source chunk(s)\nstrong => strong generated using 1 source chunk(s)",
      },
    ],
    gotcha: "mock แสดงเส้นทางและจำนวน chunk เท่านั้น ค่า threshold ตัวอย่างใช้กับ hashing ที่คั่นคำไว้แล้ว ตอนใช้จริงให้จำกัดขนาด cache และประเมินกับภาษาไทยและ near-miss ตามประเภทคำถาม",
  },

  practice: {
    intro: "เติม TODO สี่จุดเพื่อให้ service ตอบจาก cache ได้เมื่อขอบเขตและความคล้ายผ่านเกณฑ์ พร้อม fallback ไปยัง mock generator ที่ถูก tier",
    requirements: [
      "ข้าม candidate นอก scope ลบรายการหมดอายุใน scope ที่กำลังค้น และคืน None เมื่อไม่มี candidate ผ่านเกณฑ์",
      "เมื่อคะแนนเท่ากันเลือกตัวที่เพิ่มทีหลัง และใช้ threshold แบบรวมค่าขอบ",
      "ตัดเฉพาะ chunk ที่ source ID และข้อความซ้ำ รักษาลำดับครั้งแรก",
      "ให้ cheap และสิทธิ์อ่านเขียน cache เฉพาะ reviewed FAQ ที่ความเสี่ยงต่ำ ให้ strong สำหรับงานอื่น",
    ],
    starter: {
      language: "python",
      filename: "semantic_service.py",
      code: `${vectorHelpers}

${cacheScaffold}    def get(self, scope: Scope, text: str, now: float) -> str | None:
        # TODO: filter live rows in scope, find best match, apply threshold
        raise NotImplementedError

def compress_context(chunks: list[tuple[str, str]]) -> list[tuple[str, str]]:
    # TODO: deduplicate while keeping source IDs and order
    raise NotImplementedError

def route(intent: str, *, high_risk: bool) -> str:
    # TODO: allow the reviewed low-risk FAQ lane only
    raise NotImplementedError

def answer_request(cache, scope, text, intent, high_risk, chunks, now, generate):
    # TODO: route, reuse eligible hits, generate, and cache eligible misses
    raise NotImplementedError`,
    },
    verification: {
      language: "python",
      filename: "test_semantic_service.py",
      code: `from semantic_service import (
    SemanticCache,
    Scope,
    answer_request,
    compress_context,
    cosine,
    embed,
    route,
)


${practiceTests}`,
    },
    selfCheck: [
      "ตรวจว่า 0.85 ให้ hit แต่ 0.90 ให้ miss สำหรับคู่ที่ได้ 0.866",
      "ตรวจว่าเวลาที่เท่ากับ expires_at เป็น miss และ scope เปลี่ยนก็เป็น miss",
      "ตรวจจำนวนครั้งที่ mock ถูกเรียกเพื่อยืนยันว่า hit ข้าม generation จริง",
    ],
    acceptance: "pytest ผ่าน 9 เคส ครอบคลุม threshold, TTL, scope, chunk order, tier, cache bypass และ config ผิด",
    hints: [
      {
        body: "ตัดสินสิทธิ์ reuse ก่อนมองหาความคล้าย แล้วค่อยทำงานกับ bucket ที่อนุญาต",
      },
      {
        body: "ใช้ค่าที่ normalize แล้วคูณรายมิติ stably เลือก freshest tie ด้วย reversed และ max จากรายการที่ยังไม่หมดอายุ",
      },
      {
        body: "เฉลยรวม implementation กับ pytest ในไฟล์เดียว คัดลอกแล้วระบุชื่อไฟล์นี้ตอนรัน",
        code: {
          language: "python",
          filename: "semantic_service_solution.py",
          code: `${vectorHelpers}

${cacheScaffold}    def get(self, scope: Scope, text: str, now: float) -> str | None:
        entries = self.buckets.get(scope, [])
        active = [entry for entry in entries if now < entry.expires_at]
        if not active:
            self.buckets.pop(scope, None)
            return None
        self.buckets[scope] = active

        query = embed(text)
        best = max(reversed(active), key=lambda entry: cosine(query, entry.vector))
        if cosine(query, best.vector) >= self.threshold:
            return best.answer
        return None


def compress_context(chunks: list[tuple[str, str]]) -> list[tuple[str, str]]:
    return list(dict.fromkeys(chunks))


def route(intent: str, *, high_risk: bool) -> str:
    if intent == "reviewed_faq" and not high_risk:
        return "cheap"
    return "strong"


def answer_request(cache, scope, text, intent, high_risk, chunks, now, generate):
    tier = route(intent, high_risk=high_risk)
    if tier == "cheap":
        answer = cache.get(scope, text, now)
        if answer is not None:
            return "cache", answer

    answer = generate(tier, text, compress_context(chunks))
    if tier == "cheap":
        cache.put(scope, text, answer, now)
    return tier, answer


${practiceTests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: "uv run --python 3.12 --with pytest pytest -q test_semantic_service.py\nuv run --python 3.12 --with pytest pytest -q semantic_service_solution.py",
    },
  },

  mistakes: [
    {
      title: "เก็บ tenant อย่างเดียว",
      symptom: "ผู้ใช้บทบาทต่างกันหยิบคำตอบจากเอกสารที่สิทธิ์ต่างกัน",
      fix: "ใช้ effective grants จาก auth และ revision ฝั่งเซิร์ฟเวอร์ก่อน lookup",
    },
    {
      title: "ใช้ threshold เป็นคำรับรองคำตอบ",
      symptom: "เวกเตอร์ของคำถามวันนี้กับพรุ่งนี้ใกล้กันแต่คำตอบคลาดวัน",
      fix: "เพิ่ม near-miss และจำกัด reuse เฉพาะ FAQ ที่ผ่านการตรวจ",
    },
    {
      title: "ลบ chunk ตามข้อความอย่างเดียว",
      symptom: "citation ของคนละเอกสารหายแม้ข้อความคล้ายกัน",
      fix: "เก็บคู่ source ID กับข้อความ และตรวจ citation หลังตัด",
    },
    {
      title: "ส่ง fallback ทั้งหมดไป cheap",
      symptom: "งาน unknown และงานที่เสี่ยงสูงตอบไม่ครบหรืออาศัยข้อมูลผิด",
      fix: "ใช้ allowlist ของงานที่ทดสอบแล้วและบันทึก route แยกกลุ่ม",
    },
  ],
  quiz: {
    intro: "ลองตอบสี่ข้อแล้วเทียบว่าคำอธิบายของคุณเริ่มที่สิทธิ์ ความคล้าย หรือความเสี่ยง",
    questions: [
      mc(
        "d146-q1",
        "กรณีใดข้าม generation ได้?",
        [
          ["Prefix ตรงกัน","ยังต้องสร้างคำตอบใหม่"],
          ["Cache hit ที่ผ่าน scope และ TTL","คืนคำตอบเดิมได้"],
          ["ทุกงานที่ไป cheap","cheap ยังเป็น generation"],
          ["Prompt สั้นลง","ยังต้องเรียกโมเดล"],
        ],
        "B",
        "semantic hit คืนผลเดิม เมื่อผ่านเงื่อนไขของชั้นแอปแล้ว",
        "Prompt cache ใช้อะไรซ้ำ?",
        "การคำนวณ prompt prefix ที่เข้าเงื่อนไข",
      ),
      mc(
        "d146-q2",
        "บันทึกที่สร้างตอน 10 และ TTL 60 ใช้ตอน 70 ได้ไหม?",
        [
          ["ได้จนถึง 71","หมดอายุเมื่อถึง 70"],
          ["ได้ถ้าคะแนนสูง","คะแนนใช้หลังกรองเวลา"],
          ["ไม่ได้","เงื่อนไขคือ now < expires_at"],
          ["ขึ้นกับ tier","เวลาเป็นเกณฑ์แยก"],
        ],
        "C",
        "10 + 60 = 70 จึงไม่ผ่านเงื่อนไขที่เวลาพอดี",
        "ทำไมต้องมี revision กับ TTL?",
        "revision ปิด namespace เก่าทันทีที่สิทธิ์หรือข้อมูลเปลี่ยน",
      ),
      mc(
        "d146-q3",
        "ควรทำอย่างไรกับ chunk สองรายการที่ข้อความตรงกันแต่ source ID ต่างกัน?",
        [
          ["เก็บทั้งคู่","ยังชี้หลักฐานแต่ละฉบับได้"],
          ["เก็บฉบับล่าสุดเท่านั้น","โจทย์ไม่ได้ให้เกณฑ์แทนเอกสาร"],
          ["รวม source ID ใหม่","ทำให้ citation เดิมหาย"],
          ["ทิ้งทั้งคู่","เสียหลักฐาน"],
        ],
        "A",
        "compression ในแล็บ dedup คู่ source ID และข้อความ",
        "วัด token ที่ลดจริงจากอะไร?",
        "tokenizer ของรุ่นที่ใช้หรือ usage จาก provider",
      ),
      mc(
        "d146-q4",
        "งาน FAQ ที่มี high-risk flag ควรเดินทางไหน?",
        [
          ["คืน cache เมื่อ score เท่ากับ 1","งานเสี่ยงอยู่นอก eligibility"],
          ["cheap แล้วค่อยคิด","ละเลยเงื่อนไขเลือก tier"],
          ["ปิด TTL","เพิ่มความเสี่ยงเรื่องข้อมูลค้าง"],
          ["ข้าม cache ไป strong","เคารพ policy ของตัวอย่าง"],
        ],
        "D",
        "route เลือก cheap เฉพาะ reviewed FAQ ที่ไม่มี high-risk flag",
        "unknown intent ไป tier ใด?",
        "strong ตาม default ของแล็บ",
      ),
    ],
  },
  takeaways: [
    "D79 reuse prompt prefix ส่วนบทนี้ reuse คำตอบที่ผ่าน policy ได้ทั้งชิ้น",
    "กรองตาม tenant, ACL, revision และ TTL ก่อนใช้ cosine score",
    "ตัดเนื้อหาซ้ำที่อ้างแหล่งเดียวกันและเก็บ route metrics เพื่อคำนวณงบ D147",
  ],
  reviewCards: [
    rc(
      "d146-r1",
      "false hit คืออะไร?",
      "ผลเก่าผ่าน threshold แต่ตอบคำถามใหม่ผิด แม้ยังอยู่ในขอบเขตสิทธิ์",
    ),
    rc(
      "d146-r2",
      "ทำไมใช้ stable hash?",
      "ให้คำเดิมลง bucket เดิมข้ามโปรเซสสำหรับแบบฝึก deterministic",
    ),
    rc(
      "d146-r3",
      "ระวังอะไรเมื่อดู miss tier mix?",
      "hit ดูด FAQ ง่ายออกไปแล้ว จึงต้องบอกฐานของสัดส่วนว่าเป็นทุกคำขอหรือเฉพาะ miss",
    ),
  ],
  sources: [
    {
      label: "OpenAI API · Prompt caching",
      href: "https://developers.openai.com/api/docs/guides/prompt-caching",
    },
    {
      label: "Python · hashlib",
      href: "https://docs.python.org/3/library/hashlib.html",
    },
    {
      label: "Jiang et al. · LLMLingua",
      href: "https://arxiv.org/abs/2310.05736",
    },
  ],
  glossary: ["prompt-caching","caching","embedding","cosine-similarity","acl","golden-dataset"],
});
