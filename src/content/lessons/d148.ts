import type { Lesson } from "../types";
import { defineLesson, mc, rc } from "./builder";

const sharedModels = `from decimal import Decimal
from hashlib import blake2b
from math import isfinite, sqrt

from pydantic import BaseModel, ConfigDict, Field


D = Decimal
DIMENSIONS = 128
MILLION = D("1000000")
USERS = 10_000
REQUESTS_PER_USER = 54
MONTHLY_REQUESTS = USERS * REQUESTS_PER_USER
TOKENS_PER_CHUNK = 500
OUTPUT_TOKENS = 250
LOOKUP_THB = D("0.012")
USER_CAP_THB = D("12.00")
TARGET_SAVING = D("0.40")


class TokenRate(BaseModel):
    model_config = ConfigDict(frozen=True)
    input_per_million: Decimal = Field(ge=0)
    output_per_million: Decimal = Field(ge=0)


class Scope(BaseModel):
    model_config = ConfigDict(frozen=True)
    tenant: str
    grants: frozenset[str]
    acl_revision: str
    content_revision: str


class CacheEntry(BaseModel):
    model_config = ConfigDict(frozen=True)
    vector: tuple[float, ...]
    answer: str
    expires_at: float


class ServicePolicy(BaseModel):
    model_config = ConfigDict(frozen=True)
    name: str
    use_cache: bool = True
    cache_threshold: float = Field(default=0.85, ge=0.0, le=1.0)
    cache_ttl_s: float = Field(default=60.0, gt=0.0)
    tenant_scoped_cache: bool = True
    use_tiering: bool = True
    use_trimming: bool = True
    lookup_thb: Decimal = Field(default=LOOKUP_THB, ge=0)


class EvalCase(BaseModel):
    model_config = ConfigDict(frozen=True)
    case_id: str
    scope: Scope
    query: str
    intent: str
    high_risk: bool
    chunks: list[tuple[str, str]]
    now: float
    expected_answer: str


class CaseResult(BaseModel):
    model_config = ConfigDict(frozen=True)
    case_id: str
    lane: str
    input_tokens: int
    output_tokens: int
    unit_cost_thb: Decimal
    answer: str
    passed: bool


class OptimizationReport(BaseModel):
    model_config = ConfigDict(frozen=True)
    policy_name: str
    lane_counts: dict[str, int]
    thb_per_request: Decimal
    thb_per_month: Decimal
    thb_per_user: Decimal
    saving_ratio: Decimal
    eval_passed: int
    eval_total: int
    failed_case_ids: list[str]
    accepted: bool
    rejection_reasons: list[str]


STRONG_RATE = TokenRate(input_per_million=D("120"), output_per_million=D("480"))
CHEAP_RATE = TokenRate(input_per_million=D("80"), output_per_million=D("400"))


def embed(text: str) -> tuple[float, ...]:
    counts = [0] * DIMENSIONS
    for word in text.casefold().split():
        digest = blake2b(word.encode("utf-8"), digest_size=8).digest()
        bucket = int.from_bytes(digest, "big") % DIMENSIONS
        counts[bucket] += 1
    norm = sqrt(sum(c * c for c in counts))
    if norm == 0:
        raise ValueError("query must contain a token")
    return tuple(c / norm for c in counts)


def cosine(left: tuple[float, ...], right: tuple[float, ...]) -> float:
    score = sum(a * b for a, b in zip(left, right, strict=True))
    return min(1.0, max(0.0, score))


class SemanticCache:
    def __init__(self, threshold: float = 0.85, ttl_s: float = 60.0) -> None:
        if not 0.0 <= threshold <= 1.0:
            raise ValueError("threshold must be between zero and one")
        if not isfinite(ttl_s) or ttl_s <= 0:
            raise ValueError("TTL must be finite and positive")
        self.threshold = threshold
        self.ttl_s = ttl_s
        self.buckets: dict[Scope, list[CacheEntry]] = {}

    def put(self, scope: Scope, text: str, answer: str, now: float) -> None:
        entry = CacheEntry(
            vector=embed(text),
            answer=answer,
            expires_at=now + self.ttl_s,
        )
        self.buckets.setdefault(scope, []).append(entry)

    def get(self, scope: Scope, text: str, now: float) -> str | None:
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
`;

const goldenDataset = `CAMPUS_A = Scope(tenant="campus-a", grants=frozenset({"faq"}), acl_revision="acl-1", content_revision="kb-1")
CAMPUS_B = Scope(tenant="campus-b", grants=frozenset({"faq"}), acl_revision="acl-1", content_revision="kb-1")
STAFF_A = Scope(tenant="campus-a", grants=frozenset({"faq", "staff"}), acl_revision="acl-1", content_revision="kb-1")


def mock_generate(tier: str, query: str, chunks: list[tuple[str, str]]) -> str:
    source_id, fact = chunks[0]
    if tier == "cheap" and source_id.startswith(("fin-", "acad-", "staff-")):
        return f"โปรดติดต่อเจ้าหน้าที่ [{source_id}]"
    return f"{fact} [{source_id}]"


def _case(cid: str, scope: Scope, query: str, intent: str, high_risk: bool, src: str, fact: str, note: tuple[str, str], now: float) -> EvalCase:
    return EvalCase(
        case_id=cid, scope=scope, query=query, intent=intent, high_risk=high_risk,
        chunks=[(src, fact), (src, fact), note], now=now, expected_answer=f"{fact} [{src}]",
    )


GOLDEN_CASES = [
    _case("reg-hours-cold", CAMPUS_A, "ทะเบียน เปิด เวลา ปกติ", "reviewed_faq", False, "reg-1", "เปิด 08:30", ("reg-note", "นำบัตรนักศึกษามาด้วย"), 10),
    _case("reg-hours-paraphrase", CAMPUS_A, "ทะเบียน เปิด เวลา ปกติ ครับ", "reviewed_faq", False, "reg-1", "เปิด 08:30", ("reg-note", "นำบัตรนักศึกษามาด้วย"), 15),
    _case("lib-hours-cold", CAMPUS_A, "ห้องสมุด ปิด เวลา ปกติ", "reviewed_faq", False, "lib-1", "ปิด 20:00", ("lib-note", "คืนหนังสือก่อนปิด 15 นาที"), 20),
    _case("lib-hours-paraphrase", CAMPUS_A, "ห้องสมุด ปิด เวลา ปกติ ครับ", "reviewed_faq", False, "lib-1", "ปิด 20:00", ("lib-note", "คืนหนังสือก่อนปิด 15 นาที"), 25),
    _case("holiday-hours", CAMPUS_A, "ทะเบียน เปิด เวลา วันหยุด", "reviewed_faq", False, "reg-2", "วันหยุด ปิดทำการ", ("reg-note", "เปิดบริการวันจันทร์"), 30),
    _case("campus-b-hours", CAMPUS_B, "ทะเบียน เปิด เวลา ปกติ", "reviewed_faq", False, "reg-b1", "เปิด 09:00", ("reg-bnote", "อาคารอำนวยการชั้น 1"), 35),
    _case("high-risk-waiver", CAMPUS_A, "ทะเบียน เปิด เวลา ปกติ", "reviewed_faq", True, "fin-1", "ยื่นคำร้องผ่อนผัน", ("fin-note", "แนบเอกสารรับรอง"), 40),
    _case("withdraw-policy", CAMPUS_A, "เงื่อนไข ถอน วิชา ติด W", "academic_policy", False, "acad-1", "ถอนได้ถึงสัปดาห์ที่ 12", ("acad-note", "ต้องให้อาจารย์ที่ปรึกษาอนุมัติ"), 45),
    _case("tuition-dispute", CAMPUS_A, "ยอด ค่าเทอม ซ้ำ ใน ระบบ", "billing_dispute", True, "fin-2", "ส่งคำร้องตรวจยอดการเงิน", ("fin-note", "แนบสลิปการโอน"), 50),
    _case("staff-grade-i", STAFF_A, "ขั้นตอน อนุมัติ เกรด I", "staff_procedure", False, "staff-1", "เสนอหัวหน้าภาควิชาอนุมัติ", ("staff-note", "เก็บแบบฟอร์มไว้ที่คณะ"), 55),
]

BASELINE_POLICY = ServicePolicy(name="baseline", use_cache=False, use_tiering=False, use_trimming=False, lookup_thb=D("0"))
SAFE_OPTIMIZED_POLICY = ServicePolicy(name="safe-optimized", cache_threshold=0.85)
LOW_THRESHOLD_POLICY = ServicePolicy(name="low-threshold-0.70", cache_threshold=0.70)
UNSCOPED_CACHE_POLICY = ServicePolicy(name="unscoped-cache", tenant_scoped_cache=False)
STRICT_CACHE_POLICY = ServicePolicy(name="strict-0.95", cache_threshold=0.95)
`;

const solutionImpl = `def compress_context(chunks: list[tuple[str, str]]) -> list[tuple[str, str]]:
    return list(dict.fromkeys(chunks))


def route(intent: str, *, high_risk: bool, use_tiering: bool = True) -> str:
    if use_tiering and intent == "reviewed_faq" and not high_risk:
        return "cheap"
    return "strong"


def token_cost(input_tokens: int, output_tokens: int, rate: TokenRate) -> Decimal:
    in_cost = D(input_tokens) * rate.input_per_million
    out_cost = D(output_tokens) * rate.output_per_million
    return (in_cost + out_cost) / MILLION


def run_case(case: EvalCase, policy: ServicePolicy, cache: SemanticCache) -> CaseResult:
    tier = route(case.intent, high_risk=case.high_risk, use_tiering=policy.use_tiering)
    cache_scope = (
        case.scope
        if policy.tenant_scoped_cache
        else Scope(
            tenant="global",
            grants=frozenset(),
            acl_revision="shared",
            content_revision="shared",
        )
    )
    if policy.use_cache and tier == "cheap":
        cached = cache.get(cache_scope, case.query, case.now)
        if cached is not None:
            return CaseResult(
                case_id=case.case_id,
                lane="cache",
                input_tokens=0,
                output_tokens=0,
                unit_cost_thb=policy.lookup_thb,
                answer=cached,
                passed=(cached == case.expected_answer),
            )

    effective_chunks = compress_context(case.chunks) if policy.use_trimming else case.chunks
    answer = mock_generate(tier, case.query, effective_chunks)
    in_tokens = len(effective_chunks) * TOKENS_PER_CHUNK
    rate = CHEAP_RATE if tier == "cheap" else STRONG_RATE
    lookup = policy.lookup_thb if policy.use_cache else D("0")
    cost = lookup + token_cost(in_tokens, OUTPUT_TOKENS, rate)
    if policy.use_cache and tier == "cheap":
        cache.put(cache_scope, case.query, answer, case.now)
    return CaseResult(
        case_id=case.case_id,
        lane=tier,
        input_tokens=in_tokens,
        output_tokens=OUTPUT_TOKENS,
        unit_cost_thb=cost,
        answer=answer,
        passed=(answer == case.expected_answer),
    )


def evaluate_policy(
    cases: list[EvalCase],
    policy: ServicePolicy,
    *,
    baseline_monthly_thb: Decimal | None = None,
    baseline_pass_count: int | None = None,
    min_saving: Decimal = TARGET_SAVING,
    user_cap: Decimal = USER_CAP_THB,
) -> tuple[OptimizationReport, list[CaseResult]]:
    if not cases:
        raise ValueError("golden dataset must not be empty")

    cache = SemanticCache(threshold=policy.cache_threshold, ttl_s=policy.cache_ttl_s)
    results = [run_case(case, policy, cache) for case in cases]
    counts = {
        lane: sum(1 for r in results if r.lane == lane)
        for lane in ("cache", "cheap", "strong")
    }
    per_request = sum((r.unit_cost_thb for r in results), D("0")) / D(len(results))
    monthly = per_request * MONTHLY_REQUESTS
    per_user = monthly / USERS
    passed = sum(1 for r in results if r.passed)
    failed_ids = [r.case_id for r in results if not r.passed]
    saving = (
        D("0")
        if baseline_monthly_thb is None
        else (baseline_monthly_thb - monthly) / baseline_monthly_thb
    )

    reasons: list[str] = []
    if baseline_pass_count is not None and passed < baseline_pass_count:
        reasons.append("eval_drop")
    elif baseline_pass_count is None and failed_ids:
        reasons.append("eval_failed")
    if baseline_monthly_thb is not None and saving < min_saving:
        reasons.append("saving_below_target")
    if per_user > user_cap:
        reasons.append("over_user_cap")

    report = OptimizationReport(
        policy_name=policy.name,
        lane_counts=counts,
        thb_per_request=per_request,
        thb_per_month=monthly,
        thb_per_user=per_user,
        saving_ratio=saving,
        eval_passed=passed,
        eval_total=len(results),
        failed_case_ids=failed_ids,
        accepted=(len(reasons) == 0),
        rejection_reasons=reasons,
    )
    return report, results
`;

const practiceTests = `import pytest


def test_baseline_matches_d147_numbers_and_passes_all_eval_cases():
    base, results = evaluate_policy(GOLDEN_CASES, BASELINE_POLICY)
    assert base.lane_counts == {"cache": 0, "cheap": 0, "strong": 10}
    assert base.thb_per_request == D("0.30")
    assert base.thb_per_month == D("162000")
    assert base.thb_per_user == D("16.20")
    assert base.eval_passed == 10
    assert base.failed_case_ids == []
    assert all(r.input_tokens == 1500 and r.output_tokens == 250 for r in results)


def test_safe_optimization_cuts_cost_by_40_percent_with_zero_eval_drop():
    base, _ = evaluate_policy(GOLDEN_CASES, BASELINE_POLICY)
    opt, results = evaluate_policy(
        GOLDEN_CASES,
        SAFE_OPTIMIZED_POLICY,
        baseline_monthly_thb=base.thb_per_month,
        baseline_pass_count=base.eval_passed,
    )
    assert opt.lane_counts == {"cache": 2, "cheap": 4, "strong": 4}
    assert opt.thb_per_request == D("0.18")
    assert opt.thb_per_month == D("97200")
    assert opt.thb_per_user == D("9.72")
    assert opt.saving_ratio == D("0.4")
    assert opt.eval_passed == 10
    assert opt.accepted is True
    assert opt.rejection_reasons == []
    by_id = {r.case_id: r for r in results}
    assert by_id["reg-hours-paraphrase"].lane == "cache"
    assert by_id["holiday-hours"].lane == "cheap"
    assert by_id["campus-b-hours"].lane == "cheap"
    assert by_id["high-risk-waiver"].lane == "strong"


def test_low_threshold_saves_more_but_is_rejected_for_false_hit_eval_drop():
    base, _ = evaluate_policy(GOLDEN_CASES, BASELINE_POLICY)
    risky, results = evaluate_policy(
        GOLDEN_CASES,
        LOW_THRESHOLD_POLICY,
        baseline_monthly_thb=base.thb_per_month,
        baseline_pass_count=base.eval_passed,
    )
    assert risky.thb_per_month == D("87480")
    assert risky.saving_ratio == D("0.46")
    assert risky.eval_passed == 9
    assert risky.failed_case_ids == ["holiday-hours"]
    assert risky.accepted is False
    assert "eval_drop" in risky.rejection_reasons
    holiday = next(r for r in results if r.case_id == "holiday-hours")
    assert holiday.lane == "cache"
    assert holiday.answer == "เปิด 08:30 [reg-1]"


def test_unscoped_cache_leaks_across_tenants_and_fails_eval():
    base, _ = evaluate_policy(GOLDEN_CASES, BASELINE_POLICY)
    leaky, _ = evaluate_policy(
        GOLDEN_CASES,
        UNSCOPED_CACHE_POLICY,
        baseline_monthly_thb=base.thb_per_month,
        baseline_pass_count=base.eval_passed,
    )
    assert leaky.accepted is False
    assert leaky.failed_case_ids == ["campus-b-hours"]
    assert "eval_drop" in leaky.rejection_reasons


def test_strict_threshold_keeps_eval_but_fails_40_percent_cost_target():
    base, _ = evaluate_policy(GOLDEN_CASES, BASELINE_POLICY)
    strict, _ = evaluate_policy(
        GOLDEN_CASES,
        STRICT_CACHE_POLICY,
        baseline_monthly_thb=base.thb_per_month,
        baseline_pass_count=base.eval_passed,
    )
    assert strict.eval_passed == 10
    assert strict.thb_per_month == D("116640")
    assert strict.saving_ratio == D("0.28")
    assert strict.accepted is False
    assert "saving_below_target" in strict.rejection_reasons


def test_compression_keeps_distinct_sources_and_rejects_empty_eval():
    chunks = [("reg-1", "เปิด 08:30"), ("reg-2", "เปิด 08:30"), ("reg-1", "เปิด 08:30")]
    assert compress_context(chunks) == [("reg-1", "เปิด 08:30"), ("reg-2", "เปิด 08:30")]
    with pytest.raises(ValueError, match="empty"):
        evaluate_policy([], SAFE_OPTIMIZED_POLICY)
`;

export const d148: Lesson = defineLesson({
  day: 148,
  titleTh: "ทบทวน B37: ลดต้นทุนบริการ AI ให้ได้ 40% โดยไม่ให้คะแนน Eval ตก",
  tagline: "30 นาที · รวบเศรษฐศาสตร์ D145–D147 ปรับบริการจำลองด้วย Semantic Cache, Tiering และ Trimming พร้อมตรวจ Golden Eval รายเคส",
  icon: "scale",
  visual: {
    id: "semantic-cache-tiering",
    title: "ลดต้นทุน 40% พร้อมด่านตรวจ Golden Eval รายเคส",
    caption: "วาง tenant-scoped semantic cache, prompt trimming และ model tiering หน้า generator แล้วปล่อยผ่านเฉพาะแผนที่คะแนน eval ไม่ตก",
    alt: "แผนภาพเส้นทางคำขอที่ผ่านการตรวจสิทธิ์และ semantic cache ก่อนเข้าชั้นตัดบริบทซ้ำ เลือกรุ่นโมเดล และตรวจคุณภาพรายเคส",
  },
  requiresApiKey: false,
  apiKeyNote: "ใช้ตัวเลขราคาสมมติเป็น THB, mock generator และ Golden Dataset 10 เคส รันออฟไลน์บนเครื่องได้ 100%",
  tools: ["Python 3.12", "uv", "Pydantic v2", "pytest", "Decimal"],

  bigPicture: [
    {
      node: 0,
      heading: "ทบทวนโจทย์เศรษฐศาสตร์ทั้งบล็อก B37 (D145–D147)",
      body: "ตลอดสามวันที่ผ่านมาเราไล่ตั้งแต่จุดคุ้มทุน {{vllm}} กับ {{quantization}} (D145), การลดงานซ้ำด้วย {{caching}} + tiering (D146), จนถึง capacity planning (`2.5` peak RPS × `2.4 s` = `6` in-flight) และงบ `16.20 → 9.72` บาทต่อผู้ใช้ต่อเดือน (D147)",
      lessonNote: "วันนี้เราจะรวบสมมติฐานราคาและสัดส่วนชุดเดิมมารันบนบริการจำลองจริงเพื่อพิสูจน์ทั้งตัวเลขงบและคุณภาพ",
    },
    {
      node: 4,
      heading: "เปิดสามคันโยกลดต้นทุนพร้อมเคารพสิทธิ์",
      body: "ประกอบ tenant-scoped semantic cache (`threshold=0.85`), ตัด chunk ซ้ำจาก `1,500 → 1,000` input tokens โดยไม่ทำลาย citation และส่งเฉพาะ low-risk FAQ ไป `cheap` เพื่อลดค่าใช้จ่ายจาก `162,000` เหลือ `97,200` บาท/เดือน (`-40%`)",
      lessonNote: "คิดค่า lookup overhead `0.012` บาทต่อทุกคำขอเสมอเพื่อไม่ให้ตัวเลขประหยัดหลอกตา",
    },
    {
      node: 3,
      heading: "ยืนยันด้วย Golden-Dataset Eval รายเคส (D125–D132)",
      body: "แผนลดต้นทุนจะผ่าน Gate ได้ก็ต่อเมื่อคะแนนบน {{golden-dataset}} ไม่ลดลงเลยแม้แต่ข้อเดียว หากลด `threshold` เหลือ `0.70` จนเกิด false hit บนเคสวันหยุด แม้ประหยัดได้ `46%` ก็ต้องตีตกทันที",
      lessonNote: "แยกการตัดสินใจออกเป็นสองเงื่อนไขที่ต้องผ่านพร้อมกัน: `saving >= 40%` และ `eval_drop == 0`",
    },
    {
      node: 5,
      heading: "สะพานสู่บล็อก B38 ความปลอดภัยและ OWASP (D149)",
      body: "เคส `campus-b` ในวันนี้ชี้ให้เห็นว่าการลืม tenant scope ใน cache key สร้างการรั่วไหลข้ามผู้เช่าได้ทันที พรุ่งนี้ (D149) เราจะขยายมุมมองความปลอดภัยสู่ OWASP Top 10 ทั้ง {{prompt-injection}} (`LLM01`), Sensitive Info (`LLM02`) และ Excessive Agency (`LLM06`)",
      lessonNote: "บันทึกผล Cost + Eval Gate ของวันนี้เป็นหลักฐานสำคัญสำหรับรายงานระบบ v0.5.0 ใน D156",
    },
  ],
  objectives: [
    "เชื่อมโยงสมมติฐานราคาและโหลดของ D145–D147 เพื่อคำนวณงบ baseline (`162,000` บาท/เดือน) เทียบแผน optimized (`97,200` บาท/เดือน, ประหยัด `40%`)",
    "ประกอบ tenant-scoped semantic cache, context deduplication และ fail-closed model tiering บน mock AI service เดียวกัน",
    "รัน {{golden-dataset}} eval รายเคสเพื่อยืนยันว่าคุณภาพไม่ตก (`10/10`) และปฏิเสธแผนลดต้นทุนที่ทำให้เกิด false hit หรือข้อมูลรั่วข้าม tenant",
  ],
  prerequisites: [
    "D125–D132 เคยสร้าง {{golden-dataset}} และรัน automated eval gate จับ regression รายเคส",
    "D145 เคยคำนวณต้นทุน API (`0.30` บาท/คำขอ) เทียบจุดคุ้มทุน GPU (`72,000` บาท/เดือน, `240,000` คำขอ)",
    "D146 เคยเขียน {{caching}} แบบ tenant/ACL scope, context dedup และ router แยก `cheap`/`strong`",
    "D147 เคยวาง capacity (`2.5` peak RPS, `6` in-flight) และงบ `9.72` บาท/ผู้ใช้/เดือน (ใต้เพดาน `12.00` บาท)",
  ],

  setup: {
    intro: "วันทบทวน B37 ใช้สมมติฐานราคาและจำนวนคำขอชุดเดียวกับ D146–D147 (`10,000` active users × `54` คำขอ = `540,000` คำขอ/เดือน) คัดลอกตัวอย่าง 3 ขั้นลงไฟล์ `cost_eval_gate_demo.py` แล้วรันตรวจผล",
    commands: "uv run --python 3.12 --with pydantic --with pytest python cost_eval_gate_demo.py",
    steps: [
      ["recap", "ทบทวนตัวเลขสมมติฐานจาก D145–D147 และทำ Micro-Quiz 4 ข้อ (10 นาที)"],
      ["demo", "รัน `cost_eval_gate_demo.py` เปรียบเทียบ baseline, safe-optimized (`0.85`) และแผนที่ถูกตีตก (`0.70`)"],
      ["practice", "เติม TODO ใน `cost_eval_gate.py` แล้วรัน `pytest` ให้ผ่านครบ 6 เคส (15 นาที)"],
    ],
    note: "ราคาบาทต่อล้าน token (`120/480` สำหรับ strong, `80/400` สำหรับ cheap), lookup overhead `0.012` บาท และงบ `12.00` บาท/ผู้ใช้ เป็น illustrative assumptions สำหรับแล็บเพื่อฝึกวิธีคำนวณและตั้ง eval gate",
  },

  concepts: [
    {
      id: "b37-recap-economics",
      title: "1 · สรุปภาพรวม B37 (D145–D147): โฮสต์เอง vs ลดงานในแอป vs วางงบ",
      paragraphs: [
        "ก่อนลงมือปรับโค้ด มาทบทวนสามมุมมองเศรษฐศาสตร์ของบล็อก B37 ให้เห็นภาพเดียวกัน: ใน **D145** เราเปรียบเทียบค่า API แบบ strong (`1,500` input / `250` output ที่ราคาสมมติ `120` และ `480` บาทต่อล้าน token = `0.30` บาท/คำขอ) กับค่าเช่า GPU (`100` บาท/ชม. × `720` ชม. = `72,000` บาท/เดือน/replica) ได้จุดเท่าทุน `240,000` คำขอต่อเดือน โดยต้องผ่านเพดาน SLO (`p95 TTFT` และ error ศูนย์) ด้วย",
        "ใน **D146** เราลงมาแก้ที่ชั้นแอปพลิเคชันด้วย 3 คันโยกที่ลดได้ทั้งค่า API และโหลด GPU คือ semantic {{caching}} ที่ผูกขอบเขต {{acl}} + tenant, การตัดบริบทซ้ำโดยรักษา citation (`compress_context`) และ model tiering แบบ fail-closed",
        "ใน **D147** เรานำทราฟฟิก `10,000` active users × `54` คำขอ/เดือน (`540,000` คำขอ/เดือน) มาแยกคำนวณสองสาย: สาย capacity ใช้ Little’s Law (`2.5` peak RPS × `2.4 s` = `6.0` in-flight) และสายงบประมาณที่ลดจาก `162,000` เหลือ `97,200` บาท/เดือน (`16.20 → 9.72` บาท/ผู้ใช้/เดือน, ประหยัด `40%`)",
      ],
      analogy: "D145 คือตัดสินใจว่าจะเช่ารถเหมาเดือนหรือจ่ายรายเที่ยว D146 คือจัดเส้นทางและแชร์รถเพื่อลดจำนวนเที่ยวเปล่า ส่วน D147 คือคำนวณทั้งคิวรถชั่วโมงเร่งด่วนและงบเดินทางรายหัวต่อเดือน",
      code: {
        language: "python",
        filename: "b37_recap_check.py",
        code: `from decimal import Decimal as D

monthly_requests = 10_000 * 54
baseline_unit = D(1500 * 120 + 250 * 480) / 1_000_000   # 0.30 THB
trimmed_strong = D(1000 * 120 + 250 * 480) / 1_000_000  # 0.24 THB
trimmed_cheap = D(1000 * 80 + 250 * 400) / 1_000_000    # 0.18 THB

opt_unit = D("0.012") + D("0.2") * 0 + D("0.4") * trimmed_cheap + D("0.4") * trimmed_strong
saving = (baseline_unit - opt_unit) / baseline_unit
print(f"baseline={baseline_unit * monthly_requests:,.0f} THB | opt={opt_unit * monthly_requests:,.0f} THB | save={saving:.0%}")
# baseline=162,000 THB | opt=97,200 THB | save=40%`,
      },
      whyTitle: "ทำไมต้องใช้สมมติฐานชุดเดียวกันตลอดบล็อก",
      whyParagraphs: [
        "ถ้า D146 ใช้ราคาชุดหนึ่งแล้ว D148 เปลี่ยนราคาหรือจำนวนคำขอใหม่ ทีมจะบอกไม่ได้ว่าตัวเลขที่ลดลงมาจากเทคนิค optimization หรือมาจากสมมติฐานที่เปลี่ยน",
        "สังเกตว่าแม้ยอด `540,000` คำขอจะเกินจุดเท่าทุน GPU 1 replica (`240,000` คำขอ) แต่การลดงานซ้ำในชั้นแอปยังคุ้มค่าเสมอ เพราะช่วยลดทั้งบิล API และลดจำนวน GPU replica ที่ต้องเปิดช่วง peak `2.5` RPS",
      ],
    },
    {
      id: "three-levers-combined",
      title: "2 · รวมสามคันโยกบน Mock Service: Cache + Trimming + Tiering",
      paragraphs: [
        "ในบริการจำลองวันนี้ ทุกคำขอใน Baseline ส่ง 3 chunks (`500` token/chunk = `1,500` input tokens) เข้าโมเดล `strong` โดยไม่มี cache จึงมีต้นทุน `0.30` บาทต่อคำขอทุกเคส",
        "เมื่อเปิดโหมด `safe-optimized`: (1) เราตรวจ `route(intent, high_risk)` ก่อน — เฉพาะ `reviewed_faq` ที่ `high_risk=False` เท่านั้นที่เข้าช่อง `cheap` และมีสิทธิ์อ่านเขียน cache; (2) ค้นใน `SemanticCache` ภายใต้ `Scope(tenant, grants, acl_revision, content_revision)` ที่ `threshold=0.85` เพื่อให้ paraphrase อย่าง `'ทะเบียน เปิด เวลา ปกติ ครับ'` (`cosine ≈ 0.894`) เกิด hit โดยไม่ต้องเรียกโมเดล; และ (3) เคสที่ miss จะผ่าน `compress_context` ตัด chunk ซ้ำ `3 → 2` ชิ้น (`1,500 → 1,000` input tokens) โดยคง citation เดิมไว้ครบ",
        "บนชุดทดสอบ 10 เคสที่สะท้อนทราฟฟิกจริงของแล็บ ผลลัพธ์จะแบ่งเส้นทางออกเป็น `2` cache hits (`20%`), `4` cheap (`40%`) และ `4` strong (`40%`) พอดีกับสัดส่วนของ D147 รวมค่า lookup `0.012` บาททุกคำขอแล้วได้เฉลี่ย `0.18` บาท/คำขอ (`97,200` บาท/เดือน)",
      ],
      analogy: "เหมือนศูนย์บริการที่มีบอร์ด FAQ แยกตามวิทยาเขตอยู่หน้าประตู (cache) แฟ้มสรุปที่ถอดหน้าซ้ำออกแล้ว (trimming) และเคาน์เตอร์คัดแยกเคสทั่วไปกับเคสการเงิน (tiering)",
      code: {
        language: "python",
        filename: "three_levers_similarity.py",
        code: `from hashlib import blake2b
from math import sqrt

def quick_cos(a: str, b: str) -> float:
    def vec(text: str) -> dict[int, int]:
        counts: dict[int, int] = {}
        for w in text.casefold().split():
            bucket = int.from_bytes(blake2b(w.encode(), digest_size=8).digest(), "big") % 128
            counts[bucket] = counts.get(bucket, 0) + 1
        return counts
    va, vb = vec(a), vec(b)
    dot = sum(va[k] * vb.get(k, 0) for k in va)
    return dot / (sqrt(sum(v * v for v in va.values())) * sqrt(sum(v * v for v in vb.values())))

base = "ทะเบียน เปิด เวลา ปกติ"
print(f"paraphrase: {quick_cos(base, base + ' ครับ'):.3f}")
print(f"near-miss:  {quick_cos(base, 'ทะเบียน เปิด เวลา วันหยุด'):.3f}")
# paraphrase: 0.894
# near-miss:  0.750`,
      },
      whyTitle: "เคส high-risk ต้องข้าม cache แม้ข้อความเหมือนเดิม 100%",
      whyParagraphs: [
        "ในชุดทดสอบมีเคส `high-risk-waiver` ที่ข้อความตรงกับคำถามเวลาทำการแต่ติดธง `high_risk=True` ระบบต้องส่งตรงไป `strong` และไม่แตะ cache เพราะเงื่อนไขความเสี่ยงเปลี่ยนความหมายของคำตอบที่ต้องการ",
        "เปรียบเทียบกับ {{prompt-caching}} ใน D79 ที่ reuse ได้เฉพาะ prefix คงที่ ส่วน semantic cache reuse คำตอบทั้งชิ้นจึงต้องเข้มงวดเรื่อง eligibility และ {{acl}} มากกว่า",
      ],
    },
    {
      id: "golden-eval-gate-rejection",
      title: "3 · Golden-Dataset Eval Gate: ทำไมแผนประหยัด 46% ถึงถูกปฏิเสธ",
      paragraphs: [
        "ข้อผิดพลาดคลาสสิกของการลดต้นทุน AI คือดูเฉพาะกราฟค่าใช้จ่ายแล้วดีใจโดยไม่รัน {{golden-dataset}} ซ้ำรายเคส (D125–D132) ในแล็บนี้เราทดสอบแผน `low-threshold-0.70` ที่ลด threshold จาก `0.85` เหลือ `0.70` เพื่อเร่ง hit rate",
        "ผลลัพธ์ดูน่าดึงดูดมากบนหน้าบิล: hit rate พุ่งจาก `20% → 30%`, ค่าใช้จ่ายลดจาก `162,000` เหลือ `87,480` บาท/เดือน (`8.75` บาท/ผู้ใช้) ประหยัดถึง **`46%`** เกินเป้า `40%` ไปอีก 6 จุด",
        "แต่เมื่อรัน eval ทีละข้อ Gate จับได้ทันทีว่าเคส `holiday-hours` (`'ทะเบียน เปิด เวลา วันหยุด'`) ซึ่งมี {{cosine-similarity}} กับ `'ทะเบียน เปิด เวลา ปกติ'` เท่ากับ `0.750 >= 0.70` เกิด **false hit** และตอบผิดเป็น `'เปิด 08:30 [reg-1]'` แทน `'วันหยุด ปิดทำการ [reg-2]'` คะแนนตกจาก `10/10` เหลือ `9/10` จึงถูก Gate ตีตกด้วยเหตุผล `eval_drop`",
      ],
      analogy: "เหมือนลดต้นทุนร้านยาด้วยการหยิบขวดที่ชื่อคล้ายกันเกิน 70% มาจ่ายแทน แม้ประหยัดเวลาและค่ายาได้เกือบครึ่ง แต่จ่ายผิดแม้แต่เคสเดียวก็ต้องระงับทันที",
      bullets: [
        "**`safe-optimized` (`threshold=0.85`)**: `97,200` บาท/เดือน (`-40%`), `9.72` บาท/ผู้ใช้, Eval `10/10` → **ACCEPTED**",
        "**`low-threshold-0.70`**: `87,480` บาท/เดือน (`-46%`), Eval `9/10` (false hit `holiday-hours`) → **REJECTED (`eval_drop`)**",
        "**`unscoped-cache`**: `87,480` บาท/เดือน (`-46%`), Eval `9/10` (`campus-b` ได้คำตอบของ `campus-a`) → **REJECTED (`eval_drop`)**",
        "**`strict-0.95`**: `116,640` บาท/เดือน (`-28%`), Eval `10/10` (ไม่ถึงเป้า `40%`) → **REJECTED (`saving_below_target`)**",
      ],
      whyTitle: "รายงานรายเคสสำคัญกว่าตัวเลขเฉลี่ย",
      whyParagraphs: [
        "การคืน `failed_case_ids` และ `CaseResult` ทีละข้อทำให้ทีมเห็นทันทีว่าปัญหาเกิดที่ `holiday-hours` (threshold ต่ำเกินไป) หรือ `campus-b-hours` (ลืม tenant scope) แทนที่จะเห็นแค่คำว่า 'accuracy 90%' แล้วเดาไม่ถูก",
        "ใน CI จริง (D131–D132) คุณสามารถนำ `report.accepted` ไปกำหนด exit code ของ GitHub Actions เพื่อให้ PR ที่ลดต้นทุนแต่ทำ eval ตก merge ไม่ได้โดยอัตโนมัติ",
      ],
    },
    {
      id: "bridge-to-b38-owasp",
      title: "4 · ก้าวต่อไปสู่ Block B38 (D149): เมื่อ Optimization ชนขอบเขต Security",
      paragraphs: [
        "สังเกตเคส `unscoped-cache` ในวันนี้ให้ดี: เพียงแค่ลืมใส่ `tenant` ใน cache key คำถามเดียวกันจาก `campus-b` ก็หยิบคำตอบของ `campus-a` ออกมาใช้ทันที นี่คือตัวอย่างจริงของ **OWASP LLM02 (Sensitive Information Disclosure)** ที่เกิดจากชั้น optimization ไม่ใช่จากตัวโมเดล",
        "ในบทถัดไป (**Day 149 · บล็อก B38**) เราจะเดินสำรวจความเสี่ยง 3 หมวดหลักของ **OWASP Top 10 for LLM Applications 2025** บนระบบ Thai Knowledge RAG + Agent ของเรา: `LLM01` ({{prompt-injection}} ที่แอบฝังมากับเอกสาร RAG), `LLM02` (ข้อมูลอ่อนไหวรั่วทางบริบท, cache หรือ trace), และ `LLM06` (Excessive Agency เมื่อ agent เรียก MCP tool เกินสิทธิ์)",
      ],
      analogy: "B37 สอนให้เรารู้วิธีขับรถให้ประหยัดน้ำมันโดยไม่เสียความเร็ว ส่วน B38 คือการติดเข็มขัดนิรภัย ระบบล็อกประตู และตรวจคนแปลกหน้าก่อนเปิดรถให้ผู้โดยสารขึ้นจริง",
      whyTitle: "Cost Optimization กับ Security ต้องออกแบบคู่กัน",
      whyParagraphs: [
        "ทุกชั้นที่เพิ่มเข้ามาเพื่อลดต้นทุน (semantic cache, prompt compression, smaller router model) ล้วนเพิ่มพื้นผิวความเสี่ยง (attack surface) ใหม่ การตรวจสิทธิ์ตั้งแต่ก่อน lookup และผูกเทสต์ความปลอดภัยเข้ากับ eval gate ทำให้เรารักษาทั้งงบและขอบเขตความปลอดภัยได้พร้อมกัน",
      ],
    },
  ],

  bridges: {
    web: {
      title: "Web Dev Bridge · Cost + Eval Gate ≈ Performance Budget + Regression Suite ใน CI",
      body: [
        "ฝั่ง Web/Backend คุณคุ้นเคยกับการทำ caching (Redis/CDN) เพื่อลดโหลด DB แล้วต้องระวัง cache key collision กับข้อมูลข้าม user ฉันใด AI service ก็มีกฎเดียวกันแต่เพิ่มมิติของ 'ความคล้ายเชิงความหมาย' เข้ามาด้วย",
      ],
      table: [
        ["Redis key ขาด `tenant_id`", "Unscoped semantic cache → `campus-b` เห็นคำตอบของ `campus-a` (OWASP LLM02)"],
        ["TTL / fuzzy match หลวมเกินไป", "`threshold=0.70` → คำถามวันหยุดได้คำตอบวันปกติ (false hit)"],
        ["Bundle/API budget in CI", "Cost Gate: `saving >= 40%` และ `thb_per_user <= 12.00`"],
        ["E2E regression suite", "Golden Eval Gate: `eval_passed >= baseline_pass_count` (0% drop)"],
      ],
    },
    student: {
      title: "First-Year Note · ทำไมต้องตรวจสองเงื่อนไขพร้อมกัน (AND Logic)",
      body: [
        "การยอมรับแผนใหม่ใช้เงื่อนไข `ประหยัด >= 40% AND งบต่อคน <= 12 บาท AND คะแนน eval ไม่ตก` — ถ้าผ่านแค่งบแต่คุณภาพตก (เช่น แผน `0.70` ที่ประหยัด `46%` แต่พลาด 1 ข้อ) ผลรวมยังเป็น `False`",
        "สังเกตวิธีคิดค่าเฉลี่ยต่อคำขอในโค้ด: เรานำต้นทุนจริงของทั้ง 10 เคสมารวมกันแล้วหารด้วย `10` ด้วย `Decimal` ก่อนคูณ `540,000` เพื่อไม่ให้เกิดความคลาดเคลื่อนของทศนิยมแบบ float",
      ],
    },
  },

  workedExample: {
    intro: "คัดลอกทั้ง 3 ขั้นต่อกันเป็นไฟล์เดียว `cost_eval_gate_demo.py` แล้วรันเปรียบเทียบแผน Baseline, แผน Safe Optimized (`0.85`) และแผน Low Threshold (`0.70`) ที่ถูก Golden Eval Gate ปฏิเสธ",
    steps: [
      {
        title: "1 · นิยาม Schema, ราคาสมมติจาก D147 และ SemanticCache จาก D146",
        explain: "ใช้ `Decimal` กับราคาต่อล้าน token ชุดเดียวกับ D147 (`120/480` และ `80/400`) และใช้ `Scope` แบบ frozen Pydantic model เป็นคีย์ของ cache",
        code: {
          language: "python",
          filename: "cost_eval_gate_demo.py",
          code: `${sharedModels}

print(f"Workload: {USERS:,} users x {REQUESTS_PER_USER} req = {MONTHLY_REQUESTS:,} req/month")
print(f"Cosine paraphrase={cosine(embed('ทะเบียน เปิด เวลา ปกติ'), embed('ทะเบียน เปิด เวลา ปกติ ครับ')):.3f}")
print(f"Cosine holiday={cosine(embed('ทะเบียน เปิด เวลา ปกติ'), embed('ทะเบียน เปิด เวลา วันหยุด')):.3f}")`,
        },
        output: `Workload: 10,000 users x 54 req = 540,000 req/month
Cosine paraphrase=0.894
Cosine holiday=0.750`,
      },
      {
        title: "2 · ประกอบ Golden Dataset 10 เคส และฟังก์ชันรันบริการพร้อม Eval Gate",
        explain: "ชุดทดสอบ 10 เคสครอบคลุม paraphrase (`2`), near-miss วันหยุด (`1`), ต่าง tenant (`1`), high-risk (`1`) และงานซับซ้อนที่ต้องใช้ `strong` (`3`) พร้อมฟังก์ชัน `evaluate_policy` ที่คำนวณทั้งงบและคะแนนรายเคส",
        code: {
          language: "python",
          filename: "cost_eval_gate_demo.py",
          code: `${goldenDataset}

${solutionImpl}

base_report, _ = evaluate_policy(GOLDEN_CASES, BASELINE_POLICY)
print(
    f"BASELINE: {base_report.thb_per_request:.2f} THB/req | "
    f"{base_report.thb_per_month:,.0f} THB/mo | "
    f"{base_report.thb_per_user:.2f} THB/user | "
    f"eval={base_report.eval_passed}/{base_report.eval_total}"
)`,
        },
        output: `BASELINE: 0.30 THB/req | 162,000 THB/mo | 16.20 THB/user | eval=10/10`,
      },
      {
        title: "3 · เปรียบเทียบแผน Safe Optimized (ผ่าน) กับแผน Low Threshold 0.70 (ถูกตีตก)",
        explain: "แผน `0.85` ลดต้นทุนได้พอดี `40%` เหลือ `97,200` บาท/เดือน (`9.72` บาท/ผู้ใช้) โดยคะแนนยัง `10/10` ส่วนแผน `0.70` ประหยัดได้ถึง `46%` แต่พลาดเคส `holiday-hours` จึงถูก Gate ตีตก",
        code: {
          language: "python",
          filename: "cost_eval_gate_demo.py",
          code: `for policy in (SAFE_OPTIMIZED_POLICY, LOW_THRESHOLD_POLICY, UNSCOPED_CACHE_POLICY):
    report, results = evaluate_policy(
        GOLDEN_CASES,
        policy,
        baseline_monthly_thb=base_report.thb_per_month,
        baseline_pass_count=base_report.eval_passed,
    )
    print(
        f"{report.policy_name}: {report.thb_per_month:,.0f} THB/mo "
        f"({report.thb_per_user:.2f} THB/user, save={report.saving_ratio:.0%}) | "
        f"eval={report.eval_passed}/{report.eval_total} | "
        f"accepted={report.accepted} | reasons={report.rejection_reasons} | "
        f"failed={report.failed_case_ids}"
    )`,
        },
        output: `safe-optimized: 97,200 THB/mo (9.72 THB/user, save=40%) | eval=10/10 | accepted=True | reasons=[] | failed=[]
low-threshold-0.70: 87,480 THB/mo (8.75 THB/user, save=46%) | eval=9/10 | accepted=False | reasons=['eval_drop'] | failed=['holiday-hours']
unscoped-cache: 87,480 THB/mo (8.75 THB/user, save=46%) | eval=9/10 | accepted=False | reasons=['eval_drop'] | failed=['campus-b-hours']`,
      },
    ],
    gotcha: "สังเกตว่า `low-threshold-0.70` และ `unscoped-cache` แสดงค่าใช้จ่ายรายเดือนเท่ากัน (`87,480` บาท/เดือน, ประหยัด `46%`) แต่พังคนละเคส (`holiday-hours` vs `campus-b-hours`) นี่คือเหตุผลที่เราต้องเก็บ `failed_case_ids` รายเคสเสมอ",
  },

  practice: {
    intro: "ภารกิจวันทบทวน B37 (15 นาที): เติม 5 ฟังก์ชันใน `cost_eval_gate.py` เพื่อประกอบ semantic cache (tenant-scoped), context trimming และ model tiering เข้ากับตัวคำนวณงบและ Golden Eval Gate แล้วรัน `pytest` ให้ผ่านครบ 6 เคส",
    requirements: [
      "`compress_context` ตัดเฉพาะ chunk ที่ `(source_id, text)` ซ้ำกันโดยคงลำดับแรกและรักษาต่าง `source_id` ไว้ครบ",
      "`route` คืน `cheap` เฉพาะเมื่อ `use_tiering=True`, `intent == 'reviewed_faq'` และ `high_risk=False` นอกนั้นคืน `strong` เสมอ",
      "`run_case` ใช้ `SemanticCache` ภายใต้ขอบเขตตาม `policy.tenant_scoped_cache` เฉพาะช่อง `cheap` คิด `lookup_thb` เมื่อเปิด cache และใช้ `token_cost` ด้วย `Decimal`",
      "`evaluate_policy` โยน `ValueError` เมื่อ `cases` ว่าง คำนวณต้นทุนต่อคำขอ/ต่อเดือน/ต่อผู้ใช้และ `saving_ratio` พร้อมปฏิเสธแผนเมื่อเกิด `eval_drop`, `saving_below_target` หรือ `over_user_cap`",
    ],
    starter: {
      language: "python",
      filename: "cost_eval_gate.py",
      code: `${sharedModels}

${goldenDataset}


def compress_context(chunks: list[tuple[str, str]]) -> list[tuple[str, str]]:
    # TODO: deduplicate (source_id, text) chunks while keeping original order
    raise NotImplementedError


def route(intent: str, *, high_risk: bool, use_tiering: bool = True) -> str:
    # TODO: allow 'cheap' only for low-risk reviewed_faq when tiering is enabled
    raise NotImplementedError


def token_cost(input_tokens: int, output_tokens: int, rate: TokenRate) -> Decimal:
    # TODO: price input and output tokens separately in Decimal THB
    raise NotImplementedError


def run_case(case: EvalCase, policy: ServicePolicy, cache: SemanticCache) -> CaseResult:
    # TODO: route, check tenant-scoped cache for eligible lane, trim context, generate, and price
    raise NotImplementedError


def evaluate_policy(
    cases: list[EvalCase],
    policy: ServicePolicy,
    *,
    baseline_monthly_thb: Decimal | None = None,
    baseline_pass_count: int | None = None,
    min_saving: Decimal = TARGET_SAVING,
    user_cap: Decimal = USER_CAP_THB,
) -> tuple[OptimizationReport, list[CaseResult]]:
    # TODO: reject empty dataset, run all cases, compute cost/saving and gate decision
    raise NotImplementedError`,
    },
    verification: {
      language: "python",
      filename: "test_cost_eval_gate.py",
      code: `from cost_eval_gate import (
    BASELINE_POLICY,
    D,
    GOLDEN_CASES,
    LOW_THRESHOLD_POLICY,
    SAFE_OPTIMIZED_POLICY,
    STRICT_CACHE_POLICY,
    UNSCOPED_CACHE_POLICY,
    compress_context,
    evaluate_policy,
)

${practiceTests}`,
    },
    selfCheck: [
      "แผน baseline ได้ `0.30` บาท/คำขอ, `162,000` บาท/เดือน, `16.20` บาท/ผู้ใช้ และผ่าน `10/10` เคส",
      "แผน `safe-optimized` ได้สัดส่วน `cache=2, cheap=4, strong=4`, `97,200` บาท/เดือน (`9.72` บาท/ผู้ใช้, `-40%`) และ `accepted=True`",
      "แผน `low-threshold-0.70` และ `unscoped-cache` ประหยัดได้ `46%` แต่ถูกปฏิเสธด้วย `eval_drop` บนเคส `holiday-hours` และ `campus-b-hours` ตามลำดับ",
    ],
    acceptance: "pytest ผ่านครบ 6 เคส ครอบคลุม baseline, safe optimization (-40% & 0 drop), low-threshold false hit rejection, cross-tenant leak rejection, strict-threshold saving check และ empty eval guard",
    hints: [
      {
        body: "แยกขอบเขต `cache_scope` ตามธง `policy.tenant_scoped_cache` และให้เฉพาะคำขอที่ได้ `tier == 'cheap'` เท่านั้นที่อ่านและเขียน cache",
      },
      {
        body: "คำนวณ `per_request` ด้วย `sum((r.unit_cost_thb for r in results), D('0')) / D(len(results))` และอย่าลืมบวก `policy.lookup_thb` ให้ทั้งเคส hit และเคส miss เมื่อ `policy.use_cache=True`",
      },
      {
        body: "เฉลยสมบูรณ์รวม implementation และ pytest ทั้ง 6 เคสในไฟล์เดียว คัดลอกเป็น `cost_eval_gate_solution.py` แล้วรัน pytest ได้ทันที",
        code: {
          language: "python",
          filename: "cost_eval_gate_solution.py",
          code: `${sharedModels}

${goldenDataset}

${solutionImpl}

${practiceTests}`,
        },
      },
    ],
    localRun: {
      language: "bash",
      filename: "terminal",
      code: `uv run --python 3.12 --with pytest --with pydantic pytest -q test_cost_eval_gate.py
uv run --python 3.12 --with pytest --with pydantic pytest -q cost_eval_gate_solution.py`,
    },
  },

  mistakes: [
    {
      title: "รับแผนลดต้นทุนจาก % saving อย่างเดียวโดยไม่รัน Golden Eval",
      symptom: "ลด `threshold` เหลือ `0.70` แล้วบิลลดถึง `46%` แต่ผู้ใช้ที่ถามเวลาทำการวันหยุดได้เวลาวันปกติกลับไป",
      fix: "ผูก cost gate เข้ากับ golden eval gate รายเคสเสมอ และตีตกทันทีหากมีแม้แต่ 1 เคสที่ regression",
    },
    {
      title: "ลืมใส่ tenant และ ACL revision ใน cache key",
      symptom: "คำถามจาก `campus-b` ไปหยิบคำตอบของ `campus-a` เพราะข้อความคำถามเหมือนกัน 100%",
      fix: "ใช้ `Scope(tenant, grants, acl_revision, content_revision)` แยก bucket ก่อนคำนวณความคล้าย และเพิ่มเคสต่าง tenant ลงใน Golden Dataset",
    },
    {
      title: "ลืมบวกค่า cache lookup overhead ในฝั่ง miss",
      symptom: "ประเมินงบต่ำกว่าจริงเพราะคิดต้นทุนเฉพาะค่า model token โดยลืมค่า embedding/vector lookup ของคำขอที่เข้า service",
      fix: "บวก `lookup_thb` (`0.012` บาท/คำขอในแล็บนี้) ให้ทุกคำขอเมื่อเปิดใช้ semantic cache เพื่อเปรียบเทียบกับ baseline บนฐานเดียวกัน",
    },
    {
      title: "เอาคำถาม high-risk เข้า cache ก่อนตรวจ route",
      symptom: "คำขอผ่อนผันค่าปรับที่มีถ้อยคำใกล้กับ FAQ เวลาทำการได้คำตอบจาก cache แทนที่จะไปโมเดล `strong`",
      fix: "รัน `route(intent, high_risk)` ก่อนเสมอ และให้สิทธิ์อ่านเขียน cache เฉพาะกลุ่ม `cheap` ที่ผ่าน policy เท่านั้น",
    },
  ],

  quiz: {
    intro: "ทบทวนครบทั้งบล็อก B37 (D145–D148) 4 ข้อ — ลองคำนวณและตรวจเหตุผลก่อนดูเฉลยนะครับ",
    questions: [
      mc(
        "d148-q1",
        "(ทบทวน D145) บริการมีต้นทุน API `0.30` บาท/คำขอ และค่า GPU 1 replica เปิดทั้งเดือน `72,000` บาท แต่ benchmark แถว `overloaded` ได้ `2.3` RPS, `p95 TTFT 920 ms` (เพดาน `500 ms`), `12 errors` ข้อใดถูกต้อง?",
        [
          ["เลือกแถว `overloaded` เพราะ RPS สูงสุดและคุ้มทุนที่ `240,000` คำขอ", "แถวนี้ผิดทั้งเพดาน p95 และมี error จึงใช้รับปาก capacity ไม่ได้"],
          ["จุดเท่าทุนคือ `240,000` คำขอ/เดือน แต่ต้องตัดแถว `overloaded` ออกเพราะไม่ผ่าน SLO", "ถูกต้อง — ต้องดูจุดคุ้มทุนควบคู่กับแถวที่ผ่านทั้ง peak RPS, p95 TTFT และ error ศูนย์"],
          ["จุดเท่าทุนคือ `24,000` คำขอ/เดือน", "72,000 / 0.30 = 240,000 ไม่ใช่ 24,000"],
          ["โฮสต์เองคุ้มเสมอตั้งแต่คำขอแรก", "GPU มีค่าคงที่รายเดือน ถ้ายอดต่ำกว่าจุดเท่าทุน API จะถูกกว่า"],
        ],
        "B",
        "จุดเท่าทุนคำนวณจาก `72,000 / 0.30 = 240,000` คำขอต่อเดือน และทุกแถว benchmark ที่จะนำมาวาง capacity ต้องผ่าน SLO และมี `errors == 0`",
        "ทำไมห้ามเลือกแถว benchmark ที่ throughput สูงสุดทันที?",
        "เพราะแถวนั้นอาจมี p95 TTFT เกิน SLO หรือเกิด error ระหว่างโหลดสูง",
      ),
      mc(
        "d148-q2",
        "(ทบทวน D147) ภายใต้สมมติฐาน `10,000` active users × `54` คำขอ/เดือน (`540,000` คำขอ), peak `2.5` RPS, เวลาเฉลี่ย `2.4` วินาที และแผน optimized `0.18` บาท/คำขอ ตัวเลข capacity และงบต่อผู้ใช้คือข้อใด?",
        [
          ["`6.0` in-flight และ `9.72` บาท/ผู้ใช้/เดือน", "ถูกต้อง — `2.5 × 2.4 = 6.0` (Little’s Law) และ `0.18 × 54 = 9.72` บาท/ผู้ใช้"],
          ["`6.0` in-flight และ `16.20` บาท/ผู้ใช้/เดือน", "`16.20` บาท/ผู้ใช้คือแผน baseline (`0.30` บาท/คำขอ) ยังไม่ได้ optimize"],
          ["`4.9` in-flight และ `9.72` บาท/ผู้ใช้/เดือน", "Little’s Law ใช้คูณ (`λ × W`) ไม่ใช่บวก"],
          ["`12.0` in-flight และ `12.00` บาท/ผู้ใช้/เดือน", "`12.00` คือเพดานงบต่อผู้ใช้ ไม่ใช่ต้นทุนที่คำนวณได้ของแผนนี้"],
        ],
        "A",
        "Little’s Law ให้ `L = 2.5 × 2.4 = 6.0` คำขอค้างเฉลี่ยช่วงพีก และงบรายเดือน `97,200 / 10,000 = 9.72` บาท/ผู้ใช้ ซึ่งต่ำกว่าเพดาน `12.00` บาทและประหยัด `40%` จาก `16.20` บาท",
        "สูตร Little’s Law ใช้ตัวแปรอะไรคูณกัน?",
        "L = λ × W คืออัตราคำขอต่อวินาทีคูณเวลาเฉลี่ยในขอบเขตเดียวกัน",
      ),
      mc(
        "d148-q3",
        "(D148 Eval Gate) แผน `low-threshold-0.70` ลดค่าใช้จ่ายได้ `46%` (`87,480` บาท/เดือน) แต่ทำให้เคส `holiday-hours` (`cosine = 0.750`) เกิด false hit คะแนน eval ตกจาก `10/10` เหลือ `9/10` ควรตัดสินใจอย่างไร?",
        [
          ["ยอมรับแผนทันทีเพราะประหยัดเกินเป้า `40%` ไปแล้ว", "ห้ามแลกการลดต้นทุนกับ regression บน Golden Dataset"],
          ["ยอมรับไปก่อนแล้วค่อยลบเคส `holiday-hours` ออกจากชุดทดสอบ", "การลบเคสที่พังทำให้ eval สูญเสียความน่าเชื่อถือ"],
          ["ปฏิเสธแผนนี้ (`accepted=False`, `eval_drop`) และคง `threshold=0.85` ที่ประหยัด `40%` โดย eval ยัง `10/10`", "ถูกต้อง — เป้าหมายคือลดต้นทุนให้ถึงเกณฑ์โดยไม่ลดคุณภาพ"],
          ["ปิด prompt trimming แล้วคง `threshold=0.70` ไว้", "การปิด trimming ไม่ได้แก้ false hit ที่เกิดจาก threshold ต่ำเกินไป"],
        ],
        "C",
        "แผนที่ลดต้นทุนได้มากกว่าแต่ทำให้คะแนน Golden Eval ตกต้องถูกปฏิเสธโดยอัตโนมัติ แผน `threshold=0.85` ผ่านทั้งเป้า `40%` และคุณภาพ `10/10`",
        "False hit ใน semantic cache ต่างจาก cache miss อย่างไร?",
        "Cache miss แค่เสียเวลาเรียกโมเดลเพิ่ม แต่ false hit ส่งคำตอบผิดกลับให้ผู้ใช้ทันที",
      ),
      mc(
        "d148-q4",
        "(เชื่อมสู่ B38 · D149) การลืมใส่ `tenant` ใน semantic cache key จน `campus-b` ได้รับคำตอบจากเอกสารของ `campus-a` ตรงกับความเสี่ยง OWASP Top 10 for LLM Apps หมวดใดมากที่สุด?",
        [
          ["LLM06 Excessive Agency", "LLM06 เน้นอำนาจการเรียกเครื่องมือและ side effect ของ agent"],
          ["LLM01 Prompt Injection", "เคสนี้ไม่ได้มีคำสั่งแทรกหลอกโมเดล แต่เกิดจากการเปิดเผยข้อมูลข้ามสิทธิ์"],
          ["LLM10 Unbounded Consumption", "เคสนี้ไม่ได้เกิดจากการยิงโหลดจนทรัพยากรหมด"],
          ["LLM02 Sensitive Information Disclosure", "ถูกต้อง — การแชร์คำตอบข้าม tenant ทำให้ข้อมูลของอีกผู้เช่ารั่วไหลออกนอกขอบเขตสิทธิ์"],
        ],
        "D",
        "OWASP LLM02 ครอบคลุมการเปิดเผยข้อมูลอ่อนไหวข้ามขอบเขตสิทธิ์ในทุกปลายทาง ทั้งบริบท RAG, semantic cache และ trace ซึ่งเราจะลงลึกใน Day 149",
        "ทำไม cache key ของระบบ Multi-Tenant RAG จึงต้องมีทั้ง `tenant`, `grants` และ `revision`?",
        "เพื่อป้องกันการแชร์คำตอบข้ามผู้เช่า ข้ามบทบาท และป้องกันการใช้คำตอบเก่าหลังอัปเดตสิทธิ์หรือเอกสาร",
      ),
    ],
  },

  takeaways: [
    "เศรษฐศาสตร์ B37 ต้องดูครบทั้ง 3 ชั้น: โครงสร้างพื้นฐาน (D145), การลดงานซ้ำในแอป (D146) และ capacity/งบต่อผู้ใช้ (D147)",
    "ภายใต้สมมติฐานแล็บ การรวม tenant-scoped cache (`0.85`), context dedup (`1,500 → 1,000` input) และ tiering ลดงบจาก `162,000` เหลือ `97,200` บาท/เดือน (`-40%`, `9.72` บาท/ผู้ใช้) โดย Golden Eval ยัง `10/10`",
    "แผนที่ประหยัดกว่า (`46%` ที่ `threshold=0.70` หรือ unscoped cache) ต้องถูกตีตกทันทีเมื่อทำให้เกิด false hit หรือข้อมูลรั่วข้าม tenant",
    "เตรียมพร้อมเข้าสู่ Block B38 (Day 149): นำแนวคิดขอบเขตสิทธิ์จาก cache ขยายสู่การตรวจ OWASP Top 10 (`LLM01`, `LLM02`, `LLM06`), Guardrails และ Thai PDPA",
  ],
  reviewCards: [
    rc(
      "d148-r1",
      "เงื่อนไขผ่าน Cost + Eval Gate ใน D148 มีอะไรบ้าง?",
      "ต้องผ่านพร้อมกันทั้ง 3 ข้อ: ประหยัด >= 40% จาก baseline, งบต่อผู้ใช้ <= 12.00 บาท และคะแนน Golden Eval ไม่ตกจาก baseline",
    ),
    rc(
      "d148-r2",
      "ทำไมแผน `threshold=0.70` ที่ประหยัด 46% ถึงถูกปฏิเสธ?",
      "เพราะคำถามวันหยุด (`cosine=0.750`) เกิด false hit ไปหยิบคำตอบเวลาทำการปกติ ทำให้คะแนน eval ตกจาก 10/10 เหลือ 9/10",
    ),
    rc(
      "d148-r3",
      "ในแผน `safe-optimized` สัดส่วน 20% hit / 40% cheap / 40% strong + lookup 0.012 บาท ได้ต้นทุนต่อคำขอเท่าไร?",
      "0.012 + (0.2×0) + (0.4×0.18) + (0.4×0.24) = 0.18 บาท/คำขอ (97,200 บาท/เดือน หรือ 9.72 บาท/ผู้ใช้)",
    ),
    rc(
      "d148-r4",
      "การลืม tenant scope ใน cache key เชื่อมกับความเสี่ยง OWASP หมวดใดใน D149?",
      "LLM02 (Sensitive Information Disclosure) เพราะผู้ใช้ต่าง tenant ได้รับคำตอบที่มาจากข้อมูลนอกสิทธิ์ของตน",
    ),
  ],
  sources: [
    {
      label: "OpenAI API · Prompt caching & latency/cost optimization",
      href: "https://developers.openai.com/api/docs/guides/prompt-caching",
    },
    {
      label: "vLLM Documentation · Performance & Benchmarking",
      href: "https://docs.vllm.ai/en/stable/benchmarking/cli/",
    },
    {
      label: "Python · decimal — Fixed-point and floating-point arithmetic",
      href: "https://docs.python.org/3/library/decimal.html",
    },
    {
      label: "OWASP Top 10 for LLM Applications 2025",
      href: "https://genai.owasp.org/llm-top-10/",
    },
  ],
  glossary: [
    "vllm",
    "quantization",
    "prompt-caching",
    "caching",
    "embedding",
    "cosine-similarity",
    "golden-dataset",
    "acl",
    "prompt-injection",
  ],
});
