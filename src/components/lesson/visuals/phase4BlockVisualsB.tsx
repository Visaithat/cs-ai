"use client";

import { useId, useState, type CSSProperties, type KeyboardEvent } from "react";

interface VisualProps {
  reduced?: boolean;
}

const ACTIVE_BTN_STYLE: CSSProperties = {
  borderColor: "var(--brand)",
  background: "var(--brand-soft)",
  color: "var(--brand-ink)",
};

function handleSvgKeyDown(event: KeyboardEvent<SVGGElement>, onActivate: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

/* ============================================================================
 * 1. GroundedCitationsVisual (grounded-citations)
 *    Grounded Answer ([doc#chunk]) vs Safe Abstention (ไม่พบข้อมูล)
 * ========================================================================== */

type GroundedMode = "grounded" | "abstain";
type ClaimFocus = "all" | "c1" | "c2";

const GROUNDED_CAPTIONS: Record<GroundedMode, string> = {
  grounded:
    "โหมด Grounded Answer: คะแนนความเกี่ยวข้องสูงสุด 0.89 ผ่านเกณฑ์ (>= 0.45) ระบบจึงสร้างคำตอบโดยบังคับผูกทุกข้อกล่าวอ้างกลับไปยัง Chunk ต้นทาง [policy#c2] และ [faq#c5] (ลองคลิกที่การ์ดคำตอบเพื่อตรวจเส้นอ้างอิงทีละข้อ)",
  abstain:
    "โหมด Safe Abstention: คะแนนค้นหาสูงสุดเพียง 0.21 ต่ำกว่าเกณฑ์ 0.45 ประตู Abstain Gate จึงบล็อกคำตอบเดา (Hallucination) ทันที และตอบอย่างซื่อสัตย์ว่าไม่พบข้อมูลในเอกสารอ้างอิงพร้อมแนะช่องทางติดต่อเจ้าหน้าที่",
};

export function GroundedCitationsVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<GroundedMode>("grounded");
  const [focus, setFocus] = useState<ClaimFocus>("all");

  const isGrounded = mode === "grounded";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowSuccessId = `${uid}-gc-success`;
  const arrowCyanId = `${uid}-gc-cyan`;
  const arrowDangerId = `${uid}-gc-danger`;
  const arrowWarningId = `${uid}-gc-warning`;

  const c1Active = isGrounded && (focus === "all" || focus === "c1");
  const c2Active = isGrounded && (focus === "all" || focus === "c2");

  const toggleClaim = (target: "c1" | "c2") => {
    if (!isGrounded) return;
    setFocus((prev) => (prev === target ? "all" : target));
  };

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกโหมดการตอบแบบมีหลักฐานอ้างอิงหรือปฏิเสธอย่างปลอดภัย"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={isGrounded}
          onClick={() => {
            setMode("grounded");
            setFocus("all");
          }}
          className={isGrounded ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isGrounded ? ACTIVE_BTN_STYLE : undefined}
        >
          Grounded Answer ([doc#chunk])
        </button>
        <button
          type="button"
          aria-pressed={!isGrounded}
          onClick={() => {
            setMode("abstain");
            setFocus("all");
          }}
          className={!isGrounded ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isGrounded ? ACTIVE_BTN_STYLE : undefined}
        >
          Safe Abstention (ไม่พบข้อมูล)
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isGrounded
              ? "แผนภาพ Grounded Answer เชื่อมโยงคำอ้างอิง [policy#c2] และ [faq#c5] กลับไปยัง Chunk ต้นทาง"
              : "แผนภาพ Safe Abstention บล็อกการเดาเมื่อคะแนนค้นหาต่ำกว่าเกณฑ์ 0.45"
          }
        >
          <defs>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={arrowCyanId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id={arrowDangerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={arrowWarningId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
          </defs>

          {/* Top Bar: Query + Threshold Status */}
          <rect x="16" y="10" width="388" height="28" rx="14" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="28" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            Query:
          </text>
          <text x="78" y="28" fontSize="11.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
            {isGrounded ? "คืนเงินแพ็กเกจ Pro ได้ภายในกี่วัน?" : "มีส่วนลดลูกค้า VIP ปี 2027 ไหม?"}
          </text>

          <rect
            x="414"
            y="10"
            width="250"
            height="28"
            rx="14"
            fill={isGrounded ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isGrounded ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="539"
            y="28"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isGrounded ? "var(--success)" : "var(--danger)"}
          >
            {isGrounded ? "top_score 0.89 >= 0.45 ✓ PASS" : "top_score 0.21 < 0.45 ✕ BLOCK"}
          </text>

          {/* Left Panel: Retrieved Chunks */}
          <rect x="16" y="48" width="246" height="220" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
          <text x="28" y="68" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Retrieved Chunks
          </text>
          <text x="250" y="68" textAnchor="end" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
            min = 0.45
          </text>

          {/* Chunk Card 1 */}
          <g style={{ opacity: !isGrounded || c1Active ? 1 : 0.4 }} className={txClass}>
            <rect
              x="26"
              y="78"
              width="226"
              height="86"
              rx="10"
              fill={isGrounded ? "var(--success-soft)" : "var(--surface-2)"}
              stroke={isGrounded ? "var(--success)" : "var(--danger)"}
              strokeWidth={c1Active ? "1.75" : "1.25"}
              className={txClass}
            />
            <text
              x="36"
              y="96"
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={isGrounded ? "var(--success)" : "var(--muted)"}
            >
              {isGrounded ? "[policy#c2]" : "[promo#c1]"}
            </text>
            <text
              x="242"
              y="96"
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={isGrounded ? "var(--success)" : "var(--danger)"}
            >
              {isGrounded ? "0.89" : "0.21"}
            </text>
            <text x="36" y="116" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
              {isGrounded ? "คืนเงินเต็มจำนวนใน 14 วัน" : "โปรโมชันปี 2025 หมดเขตแล้ว"}
            </text>
            <text x="36" y="134" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
              {isGrounded ? "หากใช้ไม่เกิน 20% ของโควตา" : "(ไม่พบข้อมูลส่วนลด VIP 2027)"}
            </text>
            {/* Score Bar 1 */}
            <rect x="36" y="146" width="206" height="8" rx="4" fill="var(--surface)" stroke="var(--hair)" />
            <rect
              x="36"
              y="146"
              width={isGrounded ? 183 : 43}
              height="8"
              rx="4"
              fill={isGrounded ? "var(--success)" : "var(--danger)"}
              className={txClass}
            />
            {/* Threshold tick at 45% (36 + 93 = 129) */}
            <line x1="129" y1="143" x2="129" y2="157" stroke="var(--fg)" strokeWidth="1.5" />
          </g>

          {/* Chunk Card 2 */}
          <g style={{ opacity: !isGrounded || c2Active ? 1 : 0.4 }} className={txClass}>
            <rect
              x="26"
              y="174"
              width="226"
              height="84"
              rx="10"
              fill={isGrounded ? "var(--cyan-soft)" : "var(--surface-2)"}
              stroke={isGrounded ? "var(--cyan)" : "var(--line)"}
              strokeWidth={c2Active ? "1.75" : "1.25"}
              className={txClass}
            />
            <text
              x="36"
              y="192"
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={isGrounded ? "var(--cyan)" : "var(--muted)"}
            >
              {isGrounded ? "[faq#c5]" : "[faq#c9]"}
            </text>
            <text
              x="242"
              y="192"
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={isGrounded ? "var(--cyan)" : "var(--danger)"}
            >
              {isGrounded ? "0.76" : "0.14"}
            </text>
            <text x="36" y="212" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
              {isGrounded ? "คืนยอดเข้าบัตรเครดิตเดิม" : "วิธีอัปเกรดแพ็กเกจรายเดือน"}
            </text>
            <text x="36" y="230" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
              {isGrounded ? "ใช้เวลาดำเนินการ 7–14 วันทำการ" : "(เนื้อหาไม่เกี่ยวข้องกับคำถาม)"}
            </text>
            {/* Score Bar 2 */}
            <rect x="36" y="242" width="206" height="8" rx="4" fill="var(--surface)" stroke="var(--hair)" />
            <rect
              x="36"
              y="242"
              width={isGrounded ? 156 : 29}
              height="8"
              rx="4"
              fill={isGrounded ? "var(--cyan)" : "var(--danger)"}
              className={txClass}
            />
            <line x1="129" y1="239" x2="129" y2="253" stroke="var(--fg)" strokeWidth="1.5" />
          </g>

          {/* Center Gate: Citation Verifier vs Abstain Gate */}
          <rect
            x="298"
            y="84"
            width="84"
            height="148"
            rx="12"
            fill={isGrounded ? "var(--brand-soft)" : "var(--danger-soft)"}
            stroke={isGrounded ? "var(--brand)" : "var(--danger)"}
            strokeWidth="1.75"
            className={txClass}
          />
          <text
            x="340"
            y="112"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isGrounded ? "var(--brand-ink)" : "var(--danger)"}
          >
            {isGrounded ? "Citation" : "Abstain"}
          </text>
          <text
            x="340"
            y="129"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isGrounded ? "var(--brand-ink)" : "var(--danger)"}
          >
            {isGrounded ? "Verifier" : "Gate"}
          </text>
          <line x1="310" y1="142" x2="370" y2="142" stroke={isGrounded ? "var(--brand)" : "var(--danger)"} strokeOpacity="0.35" />
          <text
            x="340"
            y="162"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            fill="var(--fg)"
          >
            {isGrounded ? ">= 0.45" : "< 0.45"}
          </text>
          <rect
            x="306"
            y="174"
            width="68"
            height="24"
            rx="8"
            fill="var(--surface)"
            stroke={isGrounded ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.25"
          />
          <text
            x="340"
            y="190"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isGrounded ? "var(--success)" : "var(--danger)"}
          >
            {isGrounded ? "✓ 2/2 OK" : "✕ STOP"}
          </text>
          <text x="340" y="218" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--muted)">
            {isGrounded ? "ตรวจย้อนกลับ" : "กันตอบมั่ว"}
          </text>

          {/* Animated Citation Verification Links vs Abstain Flow */}
          {isGrounded ? (
            <g>
              {/* Claim 1 -> Gate -> Chunk 1 (reverse verification links) */}
              <g style={{ opacity: c1Active ? 1 : 0.25 }} className={txClass}>
                <line
                  x1="418"
                  y1="120"
                  x2="386"
                  y2="120"
                  stroke="var(--success)"
                  strokeWidth="2.25"
                  strokeDasharray={reduced ? undefined : "6 6"}
                  markerEnd={`url(#${arrowSuccessId})`}
                  className={c1Active ? flowClass : undefined}
                />
                <line
                  x1="298"
                  y1="120"
                  x2="266"
                  y2="120"
                  stroke="var(--success)"
                  strokeWidth="2.25"
                  strokeDasharray={reduced ? undefined : "6 6"}
                  markerEnd={`url(#${arrowSuccessId})`}
                  className={c1Active ? flowClass : undefined}
                />
              </g>

              {/* Claim 2 -> Gate -> Chunk 2 */}
              <g style={{ opacity: c2Active ? 1 : 0.25 }} className={txClass}>
                <line
                  x1="418"
                  y1="214"
                  x2="386"
                  y2="214"
                  stroke="var(--cyan)"
                  strokeWidth="2.25"
                  strokeDasharray={reduced ? undefined : "6 6"}
                  markerEnd={`url(#${arrowCyanId})`}
                  className={c2Active ? flowClass : undefined}
                />
                <line
                  x1="298"
                  y1="214"
                  x2="266"
                  y2="214"
                  stroke="var(--cyan)"
                  strokeWidth="2.25"
                  strokeDasharray={reduced ? undefined : "6 6"}
                  markerEnd={`url(#${arrowCyanId})`}
                  className={c2Active ? flowClass : undefined}
                />
              </g>
            </g>
          ) : (
            <g>
              {/* Low score chunk -> Blocked at Gate */}
              <line
                x1="262"
                y1="120"
                x2="294"
                y2="120"
                stroke="var(--danger)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowDangerId})`}
                className={flowClass}
              />
              {/* Blocked draft indicator */}
              <line x1="382" y1="116" x2="414" y2="116" stroke="var(--danger)" strokeWidth="1.75" strokeDasharray="3 4" />
              <circle cx="398" cy="116" r="9" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
              <text x="398" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)">
                ✕
              </text>
              {/* Gate -> Safe Abstention Fallback */}
              <line
                x1="382"
                y1="210"
                x2="414"
                y2="210"
                stroke="var(--warning)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowWarningId})`}
                className={flowClass}
              />
            </g>
          )}

          {/* Right Panel: LLM Output */}
          <rect
            x="418"
            y="48"
            width="246"
            height="220"
            rx="12"
            fill="var(--surface)"
            stroke={isGrounded ? "var(--brand)" : "var(--warning)"}
            strokeWidth="1.5"
            className={txClass}
          />
          <text
            x="430"
            y="68"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isGrounded ? "var(--brand-ink)" : "var(--warning)"}
          >
            {isGrounded ? "Grounded Answer" : "Safe Abstention"}
          </text>
          <text x="652" y="68" textAnchor="end" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            {isGrounded ? "คลิกข้อเพื่อตรวจ" : "ไม่เดาคำตอบ"}
          </text>

          {isGrounded ? (
            <g>
              {/* Claim 1 (clickable) */}
              <g
                role="button"
                tabIndex={0}
                aria-label="ตรวจแหล่งอ้างอิงของข้อกล่าวอ้างที่ 1 policy#c2"
                aria-pressed={focus === "c1"}
                onClick={() => toggleClaim("c1")}
                onKeyDown={(e) => handleSvgKeyDown(e, () => toggleClaim("c1"))}
                style={{ cursor: "pointer", opacity: c1Active ? 1 : 0.45 }}
                className={txClass}
              >
                <rect
                  x="428"
                  y="78"
                  width="226"
                  height="86"
                  rx="10"
                  fill={c1Active ? "var(--success-soft)" : "var(--surface-2)"}
                  stroke="var(--success)"
                  strokeWidth={focus === "c1" ? "2" : "1.25"}
                />
                <rect x="438" y="86" width="84" height="20" rx="6" fill="var(--surface)" stroke="var(--success)" />
                <text x="480" y="100" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                  [policy#c2]
                </text>
                <text x="644" y="100" textAnchor="end" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                  ← verified
                </text>
                <text x="438" y="124" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
                  ขอคืนเงินเต็มจำนวนใน 14 วัน
                </text>
                <text x="438" y="142" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
                  เงื่อนไข: ใช้ไม่เกิน 20% โควตา
                </text>
              </g>

              {/* Claim 2 (clickable) */}
              <g
                role="button"
                tabIndex={0}
                aria-label="ตรวจแหล่งอ้างอิงของข้อกล่าวอ้างที่ 2 faq#c5"
                aria-pressed={focus === "c2"}
                onClick={() => toggleClaim("c2")}
                onKeyDown={(e) => handleSvgKeyDown(e, () => toggleClaim("c2"))}
                style={{ cursor: "pointer", opacity: c2Active ? 1 : 0.45 }}
                className={txClass}
              >
                <rect
                  x="428"
                  y="174"
                  width="226"
                  height="84"
                  rx="10"
                  fill={c2Active ? "var(--cyan-soft)" : "var(--surface-2)"}
                  stroke="var(--cyan)"
                  strokeWidth={focus === "c2" ? "2" : "1.25"}
                />
                <rect x="438" y="182" width="72" height="20" rx="6" fill="var(--surface)" stroke="var(--cyan)" />
                <text x="474" y="196" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
                  [faq#c5]
                </text>
                <text x="644" y="196" textAnchor="end" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
                  ← verified
                </text>
                <text x="438" y="220" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
                  ระบบคืนยอดเข้าบัตรเครดิตเดิม
                </text>
                <text x="438" y="238" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
                  ใช้เวลาดำเนินการ 7–14 วันทำการ
                </text>
              </g>
            </g>
          ) : (
            <g className={txClass}>
              {/* Blocked Hallucination Draft */}
              <rect
                x="428"
                y="78"
                width="226"
                height="76"
                rx="10"
                fill="var(--danger-soft)"
                stroke="var(--danger)"
                strokeWidth="1.25"
                strokeDasharray="4 3"
              />
              <text x="438" y="96" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--danger)">
                ✕ บล็อกคำตอบเดา (Hallucination)
              </text>
              <text
                x="438"
                y="118"
                fontSize="11"
                fontFamily="var(--font-sans)"
                fill="var(--muted)"
                textDecoration="line-through"
              >
                &ldquo;ลูกค้า VIP ปี 2027 รับส่วนลด 30%&rdquo;
              </text>
              <text x="438" y="138" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--danger)">
                ไร้ Chunk ยืนยัน · ถูกตัดก่อนส่งผู้ใช้
              </text>

              {/* Safe Abstention Message */}
              <rect
                x="428"
                y="164"
                width="226"
                height="94"
                rx="10"
                fill="var(--warning-soft)"
                stroke="var(--warning)"
                strokeWidth="1.75"
              />
              <text x="438" y="183" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--warning)">
                ✓ ตอบปฏิเสธอย่างปลอดภัย
              </text>
              <text x="438" y="203" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
                &ldquo;ไม่พบข้อมูลส่วนลด VIP 2027
              </text>
              <text x="438" y="220" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
                ในเอกสารอ้างอิงปัจจุบัน&rdquo;
              </text>
              <rect x="438" y="231" width="174" height="19" rx="6" fill="var(--surface)" stroke="var(--warning)" />
              <text x="525" y="244" textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--warning)">
                Fallback → ติดต่อทีมซัพพอร์ต
              </text>
            </g>
          )}
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {GROUNDED_CAPTIONS[mode]}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. AclTenantFilterVisual (acl-tenant-filter)
 *    Unsafe Post-Filter vs Pre-Retrieval Tenant ACL Filter
 * ========================================================================== */

type AclMode = "post" | "pre";

const ACL_CAPTIONS: Record<AclMode, string> = {
  post:
    "Unsafe Post-Filter: ระบบค้นหาทั้ง Index ก่อนแล้วค่อยกรองทีหลัง ทำให้เอกสาร doc_B1 ของ tenant=B (คะแนน 0.93) ถูกดึงเข้ามาแย่งโควตา Top-K และเสี่ยงรั่วเข้า Context หรือ Log หากโค้ดกรองพลาด",
  pre:
    "Pre-Retrieval Tenant ACL Filter: แนบเงื่อนไข WHERE tenant_id = 'A' จาก JWT Token เข้าไปในระดับ Index Query โดยตรง ทำให้พาร์ทิชัน tenant=B ถูกล็อกและไม่มีวันถูกสแกนหรือคืนค่าให้ User A ได้ 100%",
};

export function AclTenantFilterVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<AclMode>("post");

  const isPost = mode === "post";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowBrandId = `${uid}-acl-brand`;
  const arrowDangerId = `${uid}-acl-danger`;
  const arrowSuccessId = `${uid}-acl-success`;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เปรียบเทียบ Post-Filter ที่เสี่ยงข้อมูลรั่ว กับ Pre-Retrieval Tenant ACL Filter"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={isPost}
          onClick={() => setMode("post")}
          className={isPost ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isPost ? ACTIVE_BTN_STYLE : undefined}
        >
          Unsafe Post-Filter (เสี่ยงรั่ว!)
        </button>
        <button
          type="button"
          aria-pressed={!isPost}
          onClick={() => setMode("pre")}
          className={!isPost ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isPost ? ACTIVE_BTN_STYLE : undefined}
        >
          Pre-Retrieval Tenant ACL Filter (ปลอดภัย 100%)
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isPost
              ? "แผนภาพ Unsafe Post-Filter แสดงเอกสาร tenant=B หลุดเข้าผลลัพธ์ของ User A"
              : "แผนภาพ Pre-Retrieval Tenant ACL Filter ล็อกพาร์ทิชัน tenant=B ตั้งแต่ใน Index Query"
          }
        >
          <defs>
            <marker id={arrowBrandId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowDangerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Top Bar: Identity + Security Status */}
          <rect x="16" y="10" width="256" height="28" rx="14" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.25" />
          <text x="144" y="28" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            JWT: User A · tenant=A
          </text>

          <rect
            x="284"
            y="10"
            width="380"
            height="28"
            rx="14"
            fill={isPost ? "var(--danger-soft)" : "var(--success-soft)"}
            stroke={isPost ? "var(--danger)" : "var(--success)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="474"
            y="28"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isPost ? "var(--danger)" : "var(--success)"}
          >
            {isPost ? "✕ LEAK RISK: tenant=B หลุดเข้า Top-K" : "✓ SAFE: WHERE tenant_id='A' ใน Index Query"}
          </text>

          {/* Left Stage: User A Request */}
          <rect x="16" y="92" width="128" height="120" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="80" y="114" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            User A
          </text>
          <rect x="36" y="122" width="88" height="20" rx="10" fill="var(--brand-soft)" />
          <text x="80" y="136" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            tenant=A
          </text>
          <text x="80" y="160" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
            &ldquo;สรุปยอดขาย Q4&rdquo;
          </text>
          <rect
            x="24"
            y="174"
            width="112"
            height="26"
            rx="7"
            fill={isPost ? "var(--surface-2)" : "var(--success-soft)"}
            stroke={isPost ? "var(--hair)" : "var(--success)"}
            className={txClass}
          />
          <text
            x="80"
            y="191"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isPost ? "var(--muted)" : "var(--success)"}
          >
            {isPost ? "filter: NONE" : "ACL: tenant='A'"}
          </text>

          {/* Flow Arrows: User A -> Shared Index */}
          <path
            d="M 144 136 C 162 136, 162 122, 180 122"
            fill="none"
            stroke={isPost ? "var(--brand)" : "var(--success)"}
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={isPost ? `url(#${arrowBrandId})` : `url(#${arrowSuccessId})`}
            className={flowClass}
          />
          {isPost ? (
            <path
              d="M 144 166 C 162 166, 162 214, 180 214"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="2.25"
              strokeDasharray={reduced ? undefined : "6 6"}
              markerEnd={`url(#${arrowDangerId})`}
              className={flowClass}
            />
          ) : (
            <g className={txClass}>
              <path
                d="M 144 166 C 156 166, 158 214, 166 214"
                fill="none"
                stroke="var(--line)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle cx="171" cy="214" r="9" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.25" />
              <text x="171" y="218" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--danger)">
                ✕
              </text>
            </g>
          )}

          {/* Center Stage: Shared Vector Index */}
          <rect x="184" y="48" width="268" height="220" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
          <text x="196" y="68" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            Shared Vector Index
          </text>
          <rect
            x="332"
            y="53"
            width="110"
            height="20"
            rx="10"
            fill={isPost ? "var(--danger-soft)" : "var(--success-soft)"}
            stroke={isPost ? "var(--danger)" : "var(--success)"}
            className={txClass}
          />
          <text
            x="387"
            y="67"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isPost ? "var(--danger)" : "var(--success)"}
          >
            {isPost ? "SCAN ALL" : "PRE-FILTERED"}
          </text>

          {/* Tenant A Partition */}
          <rect
            x="194"
            y="80"
            width="248"
            height="82"
            rx="10"
            fill="var(--brand-soft)"
            stroke={isPost ? "var(--brand)" : "var(--success)"}
            strokeWidth="1.5"
            className={txClass}
          />
          <text x="204" y="98" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            tenant=A · บริษัท Alpha
          </text>
          <text x="432" y="98" textAnchor="end" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            ✓ ALLOWED
          </text>

          <rect x="202" y="106" width="112" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" />
          <text x="210" y="123" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            doc_A1 (0.86)
          </text>
          <text x="210" y="141" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            ยอดขาย Q4 Alpha
          </text>

          <rect x="322" y="106" width="112" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" />
          <text x="330" y="123" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            doc_A2 (0.81)
          </text>
          <text x="330" y="141" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            สรุปรายได้ Alpha
          </text>

          {/* Tenant B Partition */}
          <g style={{ opacity: isPost ? 1 : 0.62 }} className={txClass}>
            <rect
              x="194"
              y="172"
              width="248"
              height="86"
              rx="10"
              fill={isPost ? "var(--danger-soft)" : "var(--surface-2)"}
              stroke={isPost ? "var(--danger)" : "var(--line)"}
              strokeWidth={isPost ? "1.75" : "1.25"}
              strokeDasharray={isPost ? undefined : "5 4"}
              className={txClass}
            />
            <text
              x="204"
              y="190"
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={isPost ? "var(--danger)" : "var(--muted)"}
            >
              tenant=B · บริษัท Beta
            </text>
            <text
              x="432"
              y="190"
              textAnchor="end"
              fontSize="10"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={isPost ? "var(--danger)" : "var(--success)"}
            >
              {isPost ? "⚠ EXPOSED!" : "BLOCKED"}
            </text>

            <rect
              x="202"
              y="198"
              width="112"
              height="50"
              rx="8"
              fill="var(--surface)"
              stroke={isPost ? "var(--danger)" : "var(--hair)"}
            />
            <text
              x="210"
              y="215"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={isPost ? "var(--danger)" : "var(--muted)"}
            >
              doc_B1 (0.93)
            </text>
            <text x="210" y="234" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
              ยอดขาย Q4 Beta
            </text>

            <rect x="322" y="198" width="112" height="50" rx="8" fill="var(--surface)" stroke="var(--hair)" />
            <text x="330" y="215" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--muted)">
              doc_B2 (0.72)
            </text>
            <text x="330" y="234" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
              งบลับผู้บริหาร
            </text>
          </g>

          {/* Pre-Filter Index Lock Banner over Tenant B */}
          {!isPost && (
            <g className={txClass}>
              <rect
                x="214"
                y="206"
                width="208"
                height="34"
                rx="8"
                fill="var(--surface)"
                stroke="var(--success)"
                strokeWidth="1.5"
              />
              <text x="318" y="221" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                LOCKED IN INDEX QUERY
              </text>
              <text x="318" y="235" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--fg)">
                ไม่ถูกสแกน · ไม่คืนค่าเด็ดขาด
              </text>
            </g>
          )}

          {/* Flow Arrows: Index -> Right Top-K */}
          {isPost ? (
            <g>
              {/* Tenant B leaks into Slot #1! */}
              <path
                d="M 452 216 C 470 216, 470 108, 488 108"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowDangerId})`}
                className={flowClass}
              />
              {/* Tenant A pushed down to Slot #2 */}
              <path
                d="M 452 126 C 470 126, 470 164, 488 164"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />
            </g>
          ) : (
            <g>
              {/* Both Top-K slots cleanly filled from Tenant A */}
              <path
                d="M 452 114 C 470 114, 470 108, 488 108"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowSuccessId})`}
                className={flowClass}
              />
              <path
                d="M 452 140 C 470 140, 470 164, 488 164"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowSuccessId})`}
                className={flowClass}
              />
            </g>
          )}

          {/* Right Stage: Top-2 Retrieved -> LLM Prompt */}
          <rect
            x="492"
            y="48"
            width="172"
            height="220"
            rx="12"
            fill="var(--surface)"
            stroke={isPost ? "var(--danger)" : "var(--success)"}
            strokeWidth="1.75"
            className={txClass}
          />
          <text
            x="504"
            y="68"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isPost ? "var(--danger)" : "var(--success)"}
          >
            {isPost ? "Top-2 (ก่อนกรอง)" : "Safe Top-2 Context"}
          </text>

          {/* Slot #1 */}
          <rect
            x="502"
            y="82"
            width="152"
            height="50"
            rx="9"
            fill={isPost ? "var(--danger-soft)" : "var(--success-soft)"}
            stroke={isPost ? "var(--danger)" : "var(--success)"}
            strokeWidth="1.5"
            className={txClass}
          />
          <text
            x="512"
            y="101"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isPost ? "var(--danger)" : "var(--success)"}
          >
            {isPost ? "#1 doc_B1 (0.93)" : "#1 doc_A1 (0.86)"}
          </text>
          <text x="512" y="120" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
            {isPost ? "✕ รั่วจาก tenant=B!" : "✓ tenant=A ถูกต้อง"}
          </text>

          {/* Slot #2 */}
          <rect
            x="502"
            y="140"
            width="152"
            height="50"
            rx="9"
            fill={isPost ? "var(--brand-soft)" : "var(--success-soft)"}
            stroke={isPost ? "var(--brand)" : "var(--success)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="512"
            y="159"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isPost ? "var(--brand-ink)" : "var(--success)"}
          >
            {isPost ? "#2 doc_A1 (0.86)" : "#2 doc_A2 (0.81)"}
          </text>
          <text x="512" y="178" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            {isPost ? "ถูก B แย่งโควตา Top-K" : "✓ tenant=A ครบโควตา"}
          </text>

          {/* Bottom Summary Box */}
          <rect
            x="502"
            y="200"
            width="152"
            height="58"
            rx="9"
            fill={isPost ? "var(--warning-soft)" : "var(--brand-soft)"}
            stroke={isPost ? "var(--warning)" : "var(--brand)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="512"
            y="219"
            fontSize="10.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isPost ? "var(--warning)" : "var(--brand-ink)"}
          >
            {isPost ? "⚠ ช่องโหว่ Post-Filter:" : "✓ Tenant Isolation:"}
          </text>
          <text x="512" y="236" fontSize="10" fontFamily="var(--font-sans)" fill="var(--fg)">
            {isPost ? "ข้อมูล B เข้า Memory/Log" : "LLM ไม่มีวันเห็นข้อมูล"}
          </text>
          <text x="512" y="250" fontSize="10" fontFamily="var(--font-sans)" fill="var(--fg)">
            {isPost ? "และผลลัพธ์ของ A หาย" : "ข้าม Tenant 100%"}
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {ACL_CAPTIONS[mode]}
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. ToolCallingSafetyVisual (tool-calling-safety)
 *    4-Step Stepper: LLM JSON -> Pydantic Validate -> Idempotent Execute -> Safe Result
 * ========================================================================== */

interface ToolSafetyStep {
  index: number;
  buttonLabel: string;
  inspectorTitle: string;
  codeLine1: string;
  codeLine2: string;
  codeLine3: string;
  guardTitle: string;
  guardLine1: string;
  guardLine2: string;
  caption: string;
}

const TOOL_SAFETY_STEPS: readonly ToolSafetyStep[] = [
  {
    index: 0,
    buttonLabel: "1. LLM JSON Request",
    inspectorTitle: "Step 1 · LLM ส่งได้แค่ JSON Request (ห้ามแตะ DB ตรง)",
    codeLine1: '{"tool": "create_refund",',
    codeLine2: ' "args": {"order_id": "ORD-8841",',
    codeLine3: '          "amount": 490}}',
    guardTitle: "แยกเขต Untrusted ชัดเจน",
    guardLine1: "LLM ไม่มีรหัสผ่าน DB และยิง SQL เองไม่ได้",
    guardLine2: "ทำได้แค่เสนอชื่อ Tool + JSON Arguments",
    caption:
      "ขั้นที่ 1 (LLM JSON Request): โมเดล LLM อยู่ในเขต Untrusted จึงไม่มีสิทธิ์เชื่อมต่อฐานข้อมูลโดยตรง ทำได้เพียงส่งคำขอรูปแบบ JSON เพื่อเรียกใช้ Tool ที่กำหนดไว้เท่านั้น",
  },
  {
    index: 1,
    buttonLabel: "2. Pydantic Validate",
    inspectorTitle: "Step 2 · ตรวจ Allowlist + ชนิดข้อมูลด้วย Pydantic Schema",
    codeLine1: "ALLOWLIST = {'get_order', 'create_refund'}",
    codeLine2: "order_id: constr(pattern=r'^ORD-\\d{4}$')",
    codeLine3: "amount:   conint(gt=0, le=5000)  # ✓ OK",
    guardTitle: "Allowlist Gate ฝั่ง Backend",
    guardLine1: "ปฏิเสธคำสั่งนอกบัญชี (เช่น run_sql) ทันที",
    guardLine2: "ตรวจรูปแบบ รหัส และเพดานวงเงินก่อนรัน",
    caption:
      "ขั้นที่ 2 (Pydantic Validate): Backend ตรวจชื่อ Tool เทียบกับ Allowlist และตรวจสอบชนิดข้อมูล/ช่วงตัวเลขด้วย Pydantic หากเจอคำสั่งนอกบัญชีหรือพารามิเตอร์ผิดปกติจะถูกบล็อกทันที",
  },
  {
    index: 2,
    buttonLabel: "3. Idempotent Execute",
    inspectorTitle: "Step 3 · รันคำสั่งแบบ Parameterized + Idempotency Key",
    codeLine1: "key = 'refund:ORD-8841:v1'  # unique",
    codeLine2: "tx  = db.refund_once(key, order_id, 490)",
    codeLine3: "# retry กี่รอบก็ไม่คืนเงินเบิ้ล!",
    guardTitle: "ปลอดภัยเมื่อเกิด Network Retry",
    guardLine1: "ใช้ Parameterized Query กัน SQL Injection",
    guardLine2: "Idempotency Key กันการตัด/คืนเงินซ้ำซ้อน",
    caption:
      "ขั้นที่ 3 (Idempotent Execute): Tool Executor ที่อยู่ในเขต Trusted ใช้ Parameterized Query พร้อมแนบ Idempotency Key ทำให้แม้ LLM หรือเครือข่ายจะ Retry คำขอเดิมซ้ำ ก็จะไม่เกิดการคืนเงินซ้ำซ้อน",
  },
  {
    index: 3,
    buttonLabel: "4. Safe Result / Error",
    inspectorTitle: "Step 4 · กรองผลลัพธ์ปลอดภัยคืนกลับให้ LLM สรุปคำตอบ",
    codeLine1: '{"ok": true, "refund_id": "RF-209",',
    codeLine2: ' "status": "queued", "eta": "7-14d"}',
    codeLine3: "# ซ่อน PII, DB Host และ Stack Trace",
    guardTitle: "Output Sanitization & Safe Errors",
    guardLine1: "คืนเฉพาะฟิลด์ที่จำเป็นต่อการตอบผู้ใช้",
    guardLine2: "หากพังส่งรหัส Error สั้นๆ ไม่ปล่อย Stack Trace",
    caption:
      "ขั้นที่ 4 (Safe Result / Error): Backend ตัดข้อมูลอ่อนไหว (PII) และ Stack Trace ออกทั้งหมด แล้วส่งเฉพาะ JSON ผลลัพธ์ที่ปลอดภัยกลับให้ LLM เรียบเรียงคำตอบให้ลูกค้า",
  },
];

export function ToolCallingSafetyVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [step, setStep] = useState<number>(0);

  const current = TOOL_SAFETY_STEPS[step];
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowBrandId = `${uid}-tc-brand`;
  const arrowCyanId = `${uid}-tc-cyan`;
  const arrowSuccessId = `${uid}-tc-success`;
  const arrowMutedId = `${uid}-tc-muted`;

  const nodeActive = (idx: number) => step === idx;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกขั้นตอนความปลอดภัยของ Tool Calling"
        className="flex flex-wrap items-center gap-2"
      >
        {TOOL_SAFETY_STEPS.map((item) => {
          const isSelected = step === item.index;
          return (
            <button
              key={item.index}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setStep(item.index)}
              className={isSelected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={isSelected ? ACTIVE_BTN_STYLE : undefined}
            >
              {item.buttonLabel}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={`แผนภาพความปลอดภัยของ Tool Calling ขั้นตอนที่ ${step + 1}: ${current.buttonLabel}`}
        >
          <defs>
            <marker id={arrowBrandId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowCyanId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={arrowMutedId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--line)" />
            </marker>
          </defs>

          {/* Top Security Zone Headers */}
          <rect x="16" y="10" width="140" height="22" rx="11" fill="var(--warning-soft)" stroke="var(--warning)" />
          <text x="86" y="25" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--warning)">
            UNTRUSTED (LLM)
          </text>

          <rect x="180" y="10" width="484" height="22" rx="11" fill="var(--success-soft)" stroke="var(--success)" />
          <text x="422" y="25" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            TRUSTED BACKEND · STRICT ALLOWLIST + PARAMETERIZED DB
          </text>

          {/* Vertical Trust Boundary Wall between Node 1 and Node 2 */}
          <line x1="168" y1="34" x2="168" y2="122" stroke="var(--danger)" strokeWidth="1.75" strokeDasharray="4 3" />

          {/* Stage 1: LLM Sandbox */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ขั้นตอนที่ 1: LLM JSON Request"
            onClick={() => setStep(0)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(0))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="16"
              y="42"
              width="136"
              height="70"
              rx="12"
              fill={nodeActive(0) ? "var(--brand-soft)" : "var(--surface)"}
              stroke={nodeActive(0) ? "var(--brand)" : "var(--line)"}
              strokeWidth={nodeActive(0) ? "2" : "1.25"}
              className={txClass}
            />
            <text
              x="84"
              y="63"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={nodeActive(0) ? "var(--brand-ink)" : "var(--fg)"}
            >
              1. LLM Sandbox
            </text>
            <text x="84" y="81" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
              JSON tool_call
            </text>
            <text x="84" y="99" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--warning)">
              ไม่มี DB Secret
            </text>
          </g>

          {/* Arrow 1 -> 2 */}
          <line
            x1="152"
            y1="77"
            x2="180"
            y2="77"
            stroke={step === 0 || step === 1 ? "var(--brand)" : "var(--line)"}
            strokeWidth={step === 0 || step === 1 ? "2.25" : "1.5"}
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={step === 0 || step === 1 ? `url(#${arrowBrandId})` : `url(#${arrowMutedId})`}
            className={step === 0 || step === 1 ? flowClass : txClass}
          />

          {/* Stage 2: Pydantic Validator */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ขั้นตอนที่ 2: Pydantic Validate"
            onClick={() => setStep(1)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(1))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="184"
              y="42"
              width="140"
              height="70"
              rx="12"
              fill={nodeActive(1) ? "var(--brand-soft)" : "var(--surface)"}
              stroke={nodeActive(1) ? "var(--brand)" : "var(--line)"}
              strokeWidth={nodeActive(1) ? "2" : "1.25"}
              className={txClass}
            />
            <text
              x="254"
              y="63"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={nodeActive(1) ? "var(--brand-ink)" : "var(--fg)"}
            >
              2. Pydantic Gate
            </text>
            <text x="254" y="81" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
              Allowlist + Types
            </text>
            <text x="254" y="99" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--success)">
              ตรวจสิทธิ์ &amp; วงเงิน
            </text>
          </g>

          {/* Arrow 2 -> 3 */}
          <line
            x1="324"
            y1="77"
            x2="352"
            y2="77"
            stroke={step === 1 || step === 2 ? "var(--cyan)" : "var(--line)"}
            strokeWidth={step === 1 || step === 2 ? "2.25" : "1.5"}
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={step === 1 || step === 2 ? `url(#${arrowCyanId})` : `url(#${arrowMutedId})`}
            className={step === 1 || step === 2 ? flowClass : txClass}
          />

          {/* Stage 3: Idempotent Executor */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ขั้นตอนที่ 3: Idempotent Execute"
            onClick={() => setStep(2)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(2))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="356"
              y="42"
              width="140"
              height="70"
              rx="12"
              fill={nodeActive(2) ? "var(--cyan-soft)" : "var(--surface)"}
              stroke={nodeActive(2) ? "var(--cyan)" : "var(--line)"}
              strokeWidth={nodeActive(2) ? "2" : "1.25"}
              className={txClass}
            />
            <text
              x="426"
              y="63"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={nodeActive(2) ? "var(--cyan)" : "var(--fg)"}
            >
              3. Tool Executor
            </text>
            <text x="426" y="81" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
              Idempotency Key
            </text>
            <text x="426" y="99" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--cyan)">
              รันซ้ำไม่คืนเงินเบิ้ล
            </text>
          </g>

          {/* Arrow 3 -> 4 */}
          <line
            x1="496"
            y1="77"
            x2="524"
            y2="77"
            stroke={step === 2 ? "var(--cyan)" : "var(--line)"}
            strokeWidth={step === 2 ? "2.25" : "1.5"}
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={step === 2 ? `url(#${arrowCyanId})` : `url(#${arrowMutedId})`}
            className={step === 2 ? flowClass : txClass}
          />

          {/* Stage 4: Real DB / Payment API */}
          <g
            role="button"
            tabIndex={0}
            aria-label="ขั้นตอนที่ 4: Safe Result หรือ Error จาก Real DB"
            onClick={() => setStep(3)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setStep(3))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="528"
              y="42"
              width="136"
              height="70"
              rx="12"
              fill={nodeActive(3) ? "var(--success-soft)" : "var(--surface)"}
              stroke={nodeActive(3) ? "var(--success)" : "var(--line)"}
              strokeWidth={nodeActive(3) ? "2" : "1.25"}
              className={txClass}
            />
            <text
              x="596"
              y="63"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={nodeActive(3) ? "var(--success)" : "var(--fg)"}
            >
              4. Real DB / API
            </text>
            <text x="596" y="81" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
              Isolated Store
            </text>
            <text x="596" y="99" textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--success)">
              Safe Result / Error
            </text>
          </g>

          {/* Return Path Lane (Step 4 Safe Return vs Direct SQL Blocked) */}
          <path
            d="M 596 112 L 596 135 L 84 135 L 84 116"
            fill="none"
            stroke={step === 3 ? "var(--success)" : "var(--line)"}
            strokeWidth={step === 3 ? "2.25" : "1.25"}
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={step === 3 ? `url(#${arrowSuccessId})` : `url(#${arrowMutedId})`}
            className={step === 3 ? flowClass : txClass}
          />
          <rect
            x="220"
            y="124"
            width="240"
            height="22"
            rx="11"
            fill={step === 3 ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={step === 3 ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="340"
            y="139"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={step === 3 ? "var(--success)" : "var(--danger)"}
          >
            {step === 3 ? "← Sanitized JSON (No PII / No Trace)" : "✕ ห้าม LLM เชื่อมต่อ DB ตรงโดยเด็ดขาด"}
          </text>

          {/* Bottom Inspector Panel: Live Step Detail */}
          <rect x="16" y="156" width="648" height="114" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
          <text x="28" y="175" fontSize="11.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
            {current.inspectorTitle}
          </text>
          <text x="652" y="175" textAnchor="end" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
            Step {step + 1}/4
          </text>

          {/* Left Sub-box: Payload / Code */}
          <rect x="28" y="185" width="352" height="74" rx="9" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="40" y="205" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
            {current.codeLine1}
          </text>
          <text x="40" y="225" fontSize="11" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            {current.codeLine2}
          </text>
          <text x="40" y="245" fontSize="11" fontFamily="var(--font-mono)" fill="var(--muted)">
            {current.codeLine3}
          </text>

          {/* Right Sub-box: Security Guardrail */}
          <rect
            x="392"
            y="185"
            width="260"
            height="74"
            rx="9"
            fill={step === 0 ? "var(--warning-soft)" : "var(--success-soft)"}
            stroke={step === 0 ? "var(--warning)" : "var(--success)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="404"
            y="205"
            fontSize="11.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={step === 0 ? "var(--warning)" : "var(--success)"}
          >
            {current.guardTitle}
          </text>
          <text x="404" y="226" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            • {current.guardLine1}
          </text>
          <text x="404" y="245" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            • {current.guardLine2}
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {current.caption}
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. AnthropicWorkflowsVisual (anthropic-workflows)
 *    3-Pattern Selector: 1. Routing, 2. Chaining + Gates, 3. Parallelization
 * ========================================================================== */

type WorkflowPatternId = "routing" | "chaining" | "parallel";
type RouteChoice = "faq" | "refund" | "tech";

interface WorkflowPatternMeta {
  id: WorkflowPatternId;
  buttonLabel: string;
  headerTitle: string;
  headerBadge: string;
  caption: string;
}

const WORKFLOW_PATTERNS: readonly WorkflowPatternMeta[] = [
  {
    id: "routing",
    buttonLabel: "1. Routing",
    headerTitle: "Pattern 1/3 · Routing (จำแนกงานแล้วแยกเส้นทาง)",
    headerBadge: "1 Classifier → N Specialists",
    caption:
      "Routing Workflow: ใช้โมเดลขนาดเล็กจำแนกเจตนาคำถามก่อน แล้วส่งต่อไปยัง Prompt หรือโมเดลเฉพาะทางแต่ละสาย ช่วยลดต้นทุนและเพิ่มความแม่นยำโดยไม่เอาทุกโจทย์มายำใน Prompt เดียว (คลิก Route A/B/C เพื่อเปลี่ยนเส้นทาง)",
  },
  {
    id: "chaining",
    buttonLabel: "2. Chaining + Gates",
    headerTitle: "Pattern 2/3 · Prompt Chaining + Programmatic Gate",
    headerBadge: "Step-by-Step + Code Check",
    caption:
      "Chaining + Gates: แตกงานซับซ้อนเป็นขั้นตอนย่อยที่เรียงต่อกัน และคั่นด้วย Programmatic Gate (โค้ดตรวจรูปแบบ/เงื่อนไขจริง) เพื่อหยุดหรือสั่งแก้ทันทีหากผลลัพธ์ขั้นแรกไม่ผ่านเกณฑ์ (คลิกที่ Code Gate เพื่อสลับ PASS/FAIL)",
  },
  {
    id: "parallel",
    buttonLabel: "3. Parallelization",
    headerTitle: "Pattern 3/3 · Parallelization (Sectioning / Voting)",
    headerBadge: "Concurrent → Aggregator",
    caption:
      "Parallelization Workflow: แตกงานอิสระ (เช่น ตรวจข้อเท็จจริง, ตรวจความปลอดภัย, สรุปเนื้อหา) ให้โมเดลรันพร้อมกันแบบ Concurrent แล้วรวมผลที่ Aggregator ลดเวลา Latency จากผลบวกเหลือเพียงงานที่ช้าที่สุดชิ้นเดียว",
  },
];

export function AnthropicWorkflowsVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [patternId, setPatternId] = useState<WorkflowPatternId>("routing");
  const [selectedRoute, setSelectedRoute] = useState<RouteChoice>("refund");
  const [gatePass, setGatePass] = useState<boolean>(true);

  const current =
    WORKFLOW_PATTERNS.find((item) => item.id === patternId) ?? WORKFLOW_PATTERNS[0];

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowBrandId = `${uid}-aw-brand`;
  const arrowCyanId = `${uid}-aw-cyan`;
  const arrowWarningId = `${uid}-aw-warning`;
  const arrowSuccessId = `${uid}-aw-success`;
  const arrowDangerId = `${uid}-aw-danger`;
  const arrowMutedId = `${uid}-aw-muted`;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกรูปแบบ Deterministic Workflow ของ Anthropic"
        className="flex flex-wrap items-center gap-2"
      >
        {WORKFLOW_PATTERNS.map((item) => {
          const isSelected = patternId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setPatternId(item.id)}
              className={isSelected ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={isSelected ? ACTIVE_BTN_STYLE : undefined}
            >
              {item.buttonLabel}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label={`แผนภาพ Anthropic Deterministic Workflow รูปแบบ ${current.buttonLabel}`}
        >
          <defs>
            <marker id={arrowBrandId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowCyanId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id={arrowWarningId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={arrowDangerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
            <marker id={arrowMutedId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--line)" />
            </marker>
          </defs>

          {/* Header Strip */}
          <text x="18" y="25" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
            {current.headerTitle}
          </text>
          <rect x="470" y="10" width="194" height="22" rx="11" fill="var(--brand-soft)" stroke="var(--brand)" />
          <text x="567" y="25" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            {current.headerBadge}
          </text>

          {/* Main Graph Surface */}
          <rect x="16" y="40" width="648" height="228" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />

          {/* ================= PATTERN 1: ROUTING ================= */}
          {patternId === "routing" && (
            <g className={txClass}>
              {/* Input Node */}
              <rect x="28" y="122" width="84" height="60" rx="12" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1.25" />
              <text x="70" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                Input
              </text>
              <text x="70" y="167" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--muted)">
                คำถามผู้ใช้
              </text>

              {/* Input -> Router */}
              <line
                x1="112"
                y1="152"
                x2="144"
                y2="152"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />

              {/* Classifier / Router Node */}
              <rect x="148" y="114" width="118" height="76" rx="12" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.75" />
              <text x="207" y="139" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
                LLM Router
              </text>
              <text x="207" y="157" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                จำแนกประเภท
              </text>
              <text x="207" y="176" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
                fast classifier
              </text>

              {/* Edges: Router -> 3 Specialists */}
              <path
                d="M 266 138 C 296 138, 296 84, 326 84"
                fill="none"
                stroke={selectedRoute === "faq" ? "var(--cyan)" : "var(--line)"}
                strokeWidth={selectedRoute === "faq" ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={selectedRoute === "faq" ? `url(#${arrowCyanId})` : `url(#${arrowMutedId})`}
                className={selectedRoute === "faq" ? flowClass : txClass}
              />
              <line
                x1="266"
                y1="152"
                x2="326"
                y2="152"
                stroke={selectedRoute === "refund" ? "var(--brand)" : "var(--line)"}
                strokeWidth={selectedRoute === "refund" ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={selectedRoute === "refund" ? `url(#${arrowBrandId})` : `url(#${arrowMutedId})`}
                className={selectedRoute === "refund" ? flowClass : txClass}
              />
              <path
                d="M 266 166 C 296 166, 296 220, 326 220"
                fill="none"
                stroke={selectedRoute === "tech" ? "var(--warning)" : "var(--line)"}
                strokeWidth={selectedRoute === "tech" ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={selectedRoute === "tech" ? `url(#${arrowWarningId})` : `url(#${arrowMutedId})`}
                className={selectedRoute === "tech" ? flowClass : txClass}
              />

              {/* Route A: FAQ (clickable) */}
              <g
                role="button"
                tabIndex={0}
                aria-label="เลือกเส้นทาง Route A: FAQ Specialist"
                aria-pressed={selectedRoute === "faq"}
                onClick={() => setSelectedRoute("faq")}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelectedRoute("faq"))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="330"
                  y="56"
                  width="178"
                  height="54"
                  rx="10"
                  fill={selectedRoute === "faq" ? "var(--cyan-soft)" : "var(--surface-2)"}
                  stroke={selectedRoute === "faq" ? "var(--cyan)" : "var(--line)"}
                  strokeWidth={selectedRoute === "faq" ? "1.75" : "1"}
                  className={txClass}
                />
                <text
                  x="419"
                  y="78"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill={selectedRoute === "faq" ? "var(--cyan)" : "var(--fg)"}
                >
                  Route A · FAQ + RAG
                </text>
                <text x="419" y="97" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
                  small model · low cost
                </text>
              </g>

              {/* Route B: Refund (clickable) */}
              <g
                role="button"
                tabIndex={0}
                aria-label="เลือกเส้นทาง Route B: Refund Specialist"
                aria-pressed={selectedRoute === "refund"}
                onClick={() => setSelectedRoute("refund")}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelectedRoute("refund"))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="330"
                  y="124"
                  width="178"
                  height="54"
                  rx="10"
                  fill={selectedRoute === "refund" ? "var(--brand-soft)" : "var(--surface-2)"}
                  stroke={selectedRoute === "refund" ? "var(--brand)" : "var(--line)"}
                  strokeWidth={selectedRoute === "refund" ? "1.75" : "1"}
                  className={txClass}
                />
                <text
                  x="419"
                  y="146"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill={selectedRoute === "refund" ? "var(--brand-ink)" : "var(--fg)"}
                >
                  Route B · Refund Tool
                </text>
                <text x="419" y="165" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
                  strict policy + schema
                </text>
              </g>

              {/* Route C: Tech Escalation (clickable) */}
              <g
                role="button"
                tabIndex={0}
                aria-label="เลือกเส้นทาง Route C: Deep Technical"
                aria-pressed={selectedRoute === "tech"}
                onClick={() => setSelectedRoute("tech")}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelectedRoute("tech"))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="330"
                  y="192"
                  width="178"
                  height="54"
                  rx="10"
                  fill={selectedRoute === "tech" ? "var(--warning-soft)" : "var(--surface-2)"}
                  stroke={selectedRoute === "tech" ? "var(--warning)" : "var(--line)"}
                  strokeWidth={selectedRoute === "tech" ? "1.75" : "1"}
                  className={txClass}
                />
                <text
                  x="419"
                  y="214"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill={selectedRoute === "tech" ? "var(--warning)" : "var(--fg)"}
                >
                  Route C · Deep Tech
                </text>
                <text x="419" y="233" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
                  reasoning model
                </text>
              </g>

              {/* Edges: Specialists -> Output */}
              <path
                d="M 508 84 C 534 84, 536 140, 560 140"
                fill="none"
                stroke={selectedRoute === "faq" ? "var(--success)" : "var(--line)"}
                strokeWidth={selectedRoute === "faq" ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={selectedRoute === "faq" ? `url(#${arrowSuccessId})` : `url(#${arrowMutedId})`}
                className={selectedRoute === "faq" ? flowClass : txClass}
              />
              <line
                x1="508"
                y1="152"
                x2="560"
                y2="152"
                stroke={selectedRoute === "refund" ? "var(--success)" : "var(--line)"}
                strokeWidth={selectedRoute === "refund" ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={selectedRoute === "refund" ? `url(#${arrowSuccessId})` : `url(#${arrowMutedId})`}
                className={selectedRoute === "refund" ? flowClass : txClass}
              />
              <path
                d="M 508 220 C 534 220, 536 164, 560 164"
                fill="none"
                stroke={selectedRoute === "tech" ? "var(--success)" : "var(--line)"}
                strokeWidth={selectedRoute === "tech" ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={selectedRoute === "tech" ? `url(#${arrowSuccessId})` : `url(#${arrowMutedId})`}
                className={selectedRoute === "tech" ? flowClass : txClass}
              />

              {/* Output Node */}
              <rect x="564" y="122" width="88" height="60" rx="12" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" />
              <text x="608" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
                Output
              </text>
              <text x="608" y="167" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                ตรงเฉพาะงาน
              </text>

              <text x="32" y="256" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
                * คลิก Route A / B / C เพื่อสลับดูเส้นทางที่ถูกเลือก
              </text>
            </g>
          )}

          {/* ================= PATTERN 2: CHAINING + GATES ================= */}
          {patternId === "chaining" && (
            <g className={txClass}>
              {/* Input Node */}
              <rect x="28" y="92" width="76" height="60" rx="12" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1.25" />
              <text x="66" y="118" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                Input
              </text>
              <text x="66" y="137" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--muted)">
                โจทย์ดิบ
              </text>

              {/* Input -> Step 1 */}
              <line
                x1="104"
                y1="122"
                x2="130"
                y2="122"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />

              {/* Step 1: Outline */}
              <rect x="134" y="88" width="112" height="68" rx="12" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.5" />
              <text x="190" y="112" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
                LLM Step 1
              </text>
              <text x="190" y="130" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                ร่างโครงสร้าง
              </text>
              <text x="190" y="147" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
                draft outline
              </text>

              {/* Step 1 -> Code Gate */}
              <line
                x1="246"
                y1="122"
                x2="274"
                y2="122"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />

              {/* Programmatic Gate (clickable PASS/FAIL toggle) */}
              <g
                role="button"
                tabIndex={0}
                aria-label="สลับผลตรวจของ Code Gate ระหว่าง PASS และ FAIL"
                aria-pressed={gatePass}
                onClick={() => setGatePass((prev) => !prev)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setGatePass((prev) => !prev))}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="278"
                  y="78"
                  width="124"
                  height="88"
                  rx="12"
                  fill={gatePass ? "var(--warning-soft)" : "var(--danger-soft)"}
                  stroke={gatePass ? "var(--warning)" : "var(--danger)"}
                  strokeWidth="1.75"
                  className={txClass}
                />
                <text
                  x="340"
                  y="101"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={gatePass ? "var(--warning)" : "var(--danger)"}
                >
                  Code Gate
                </text>
                <text x="340" y="119" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
                  ตรวจ JSON / หัวข้อ
                </text>
                <rect
                  x="294"
                  y="129"
                  width="92"
                  height="24"
                  rx="8"
                  fill="var(--surface)"
                  stroke={gatePass ? "var(--success)" : "var(--danger)"}
                />
                <text
                  x="340"
                  y="145"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={gatePass ? "var(--success)" : "var(--danger)"}
                >
                  {gatePass ? "✓ PASS" : "✕ FAIL"}
                </text>
              </g>

              {/* PASS Path: Gate -> Step 2 -> Output */}
              <line
                x1="402"
                y1="122"
                x2="446"
                y2="122"
                stroke={gatePass ? "var(--success)" : "var(--line)"}
                strokeWidth={gatePass ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={gatePass ? `url(#${arrowSuccessId})` : `url(#${arrowMutedId})`}
                className={gatePass ? flowClass : txClass}
              />
              <text
                x="424"
                y="113"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill={gatePass ? "var(--success)" : "var(--muted)"}
              >
                PASS
              </text>

              {/* Step 2: Polish */}
              <rect
                x="450"
                y="88"
                width="108"
                height="68"
                rx="12"
                fill={gatePass ? "var(--cyan-soft)" : "var(--surface-2)"}
                stroke={gatePass ? "var(--cyan)" : "var(--line)"}
                strokeWidth={gatePass ? "1.75" : "1"}
                className={txClass}
              />
              <text
                x="504"
                y="112"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                fill={gatePass ? "var(--cyan)" : "var(--muted)"}
              >
                LLM Step 2
              </text>
              <text x="504" y="130" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                เขียนฉบับสมบูรณ์
              </text>
              <text x="504" y="147" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
                polish prose
              </text>

              {/* Step 2 -> Output */}
              <line
                x1="558"
                y1="122"
                x2="582"
                y2="122"
                stroke={gatePass ? "var(--success)" : "var(--line)"}
                strokeWidth={gatePass ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={gatePass ? `url(#${arrowSuccessId})` : `url(#${arrowMutedId})`}
                className={gatePass ? flowClass : txClass}
              />

              {/* Output Node */}
              <rect
                x="586"
                y="92"
                width="68"
                height="60"
                rx="12"
                fill={gatePass ? "var(--success-soft)" : "var(--surface-2)"}
                stroke={gatePass ? "var(--success)" : "var(--line)"}
                strokeWidth={gatePass ? "1.5" : "1"}
                className={txClass}
              />
              <text
                x="620"
                y="118"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                fill={gatePass ? "var(--success)" : "var(--muted)"}
              >
                Output
              </text>
              <text x="620" y="137" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
                ผ่านเกณฑ์
              </text>

              {/* FAIL Path: Gate -> Fail/Exit Box -> Retry arc to Step 1 */}
              <line
                x1="340"
                y1="166"
                x2="340"
                y2="198"
                stroke={!gatePass ? "var(--danger)" : "var(--line)"}
                strokeWidth={!gatePass ? "2.5" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={!gatePass ? `url(#${arrowDangerId})` : `url(#${arrowMutedId})`}
                className={!gatePass ? flowClass : txClass}
              />
              <text
                x="350"
                y="186"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill={!gatePass ? "var(--danger)" : "var(--muted)"}
              >
                FAIL
              </text>

              <rect
                x="252"
                y="202"
                width="244"
                height="48"
                rx="10"
                fill={!gatePass ? "var(--danger-soft)" : "var(--surface-2)"}
                stroke={!gatePass ? "var(--danger)" : "var(--line)"}
                strokeWidth={!gatePass ? "1.5" : "1"}
                className={txClass}
              />
              <text
                x="374"
                y="222"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                fill={!gatePass ? "var(--danger)" : "var(--muted)"}
              >
                หยุด / สั่งแก้ Step 1 (ไม่ส่งต่อ Step 2)
              </text>
              <text x="374" y="240" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
                fail-fast · save tokens
              </text>

              {/* Retry curve back to Step 1 */}
              <path
                d="M 252 226 C 202 226, 190 202, 190 160"
                fill="none"
                stroke={!gatePass ? "var(--danger)" : "var(--line)"}
                strokeWidth={!gatePass ? "2" : "1.25"}
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={!gatePass ? `url(#${arrowDangerId})` : `url(#${arrowMutedId})`}
                className={!gatePass ? flowClass : txClass}
              />
              <text x="148" y="220" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill={!gatePass ? "var(--danger)" : "var(--muted)"}>
                retry &lt;= 1
              </text>

              <text x="32" y="256" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
                * คลิกกล่อง Code Gate เพื่อสลับดูเส้นทาง PASS / FAIL
              </text>
            </g>
          )}

          {/* ================= PATTERN 3: PARALLELIZATION ================= */}
          {patternId === "parallel" && (
            <g className={txClass}>
              {/* Input Node */}
              <rect x="28" y="114" width="94" height="68" rx="12" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1.25" />
              <text x="75" y="140" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--fg)">
                Input
              </text>
              <text x="75" y="158" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--muted)">
                เอกสารต้นฉบับ
              </text>
              <text x="75" y="174" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
                fan-out 3x
              </text>

              {/* Fan-out Animated Curves */}
              <path
                d="M 122 136 C 154 136, 154 82, 186 82"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />
              <line
                x1="122"
                y1="148"
                x2="186"
                y2="148"
                stroke="var(--cyan)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowCyanId})`}
                className={flowClass}
              />
              <path
                d="M 122 160 C 154 160, 154 214, 186 214"
                fill="none"
                stroke="var(--warning)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowWarningId})`}
                className={flowClass}
              />

              {/* Parallel Worker 1 */}
              <rect x="190" y="54" width="206" height="54" rx="10" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.5" />
              <text x="204" y="76" fontSize="11.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
                Worker 1 · ตรวจข้อเท็จจริง
              </text>
              <text x="204" y="96" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
                async fact-check · 0.9s
              </text>

              {/* Parallel Worker 2 */}
              <rect x="190" y="120" width="206" height="54" rx="10" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.5" />
              <text x="204" y="142" fontSize="11.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--cyan)">
                Worker 2 · ตรวจ Guardrail
              </text>
              <text x="204" y="162" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
                async policy vote · 0.7s
              </text>

              {/* Parallel Worker 3 */}
              <rect x="190" y="186" width="206" height="54" rx="10" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.5" />
              <text x="204" y="208" fontSize="11.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--warning)">
                Worker 3 · สรุปประเด็นหลัก
              </text>
              <text x="204" y="228" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
                async key points · 1.1s
              </text>

              {/* Fan-in Animated Curves */}
              <path
                d="M 396 82 C 426 82, 428 136, 456 136"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowBrandId})`}
                className={flowClass}
              />
              <line
                x1="396"
                y1="148"
                x2="456"
                y2="148"
                stroke="var(--cyan)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowCyanId})`}
                className={flowClass}
              />
              <path
                d="M 396 214 C 426 214, 428 160, 456 160"
                fill="none"
                stroke="var(--warning)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowWarningId})`}
                className={flowClass}
              />

              {/* Aggregator Node */}
              <rect x="460" y="106" width="106" height="84" rx="12" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.75" />
              <text x="513" y="132" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
                Aggregator
              </text>
              <text x="513" y="151" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="var(--fg)">
                รวมผล / โหวต
              </text>
              <text x="513" y="172" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
                merge + rank
              </text>

              {/* Aggregator -> Final */}
              <line
                x1="566"
                y1="148"
                x2="588"
                y2="148"
                stroke="var(--success)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowSuccessId})`}
                className={flowClass}
              />

              {/* Final Output */}
              <rect x="592" y="116" width="60" height="64" rx="12" fill="var(--surface-2)" stroke="var(--success)" strokeWidth="1.5" />
              <text x="622" y="143" textAnchor="middle" fontSize="11.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--success)">
                Final
              </text>
              <text x="622" y="163" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
                1.1s!
              </text>

              {/* Latency comparison note */}
              <text x="32" y="256" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--muted)">
                Latency: max(0.9, 0.7, 1.1) = 1.1s (แทนที่จะรอต่อคิว 2.7s)
              </text>
            </g>
          )}
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {current.caption}
      </div>
    </div>
  );
}
