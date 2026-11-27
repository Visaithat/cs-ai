"use client";

import { useId, useState, type CSSProperties } from "react";

interface VisualProps {
  reduced?: boolean;
}

const ACTIVE_BTN_STYLE: CSSProperties = {
  borderColor: "var(--brand)",
  background: "var(--brand-soft)",
  color: "var(--brand-ink)",
};

/* ============================================================================
 * 1. McpServerClientVisual (mcp-server-client)
 *    Local FastMCP Server (@mcp.tool vs @mcp.resource + stderr hygiene)
 *    and Safe Client Sandbox (allowlist + timeout + path boundary)
 * ========================================================================== */

type McpViewMode = "server" | "client";

const MCP_CAPTIONS: Record<McpViewMode, string> = {
  server:
    "ฝั่ง Local MCP Server (FastMCP): แยก @mcp.tool() สำหรับการค้นหา/ลงมือทำที่มี Pydantic Schema ออกจาก @mcp.resource('kb://...') สำหรับเอกสารอ่านอย่างเดียว โดยส่งข้อความ JSON-RPC ออกทาง stdout และบังคับส่ง log ทุกบรรทัดไปที่ sys.stderr เพื่อไม่ให้ช่องสื่อสารพัง",
  client:
    "ฝั่ง Safe MCP Client Sandbox: แอป AI ไม่เปิดใช้ทุก Tool แบบเหมารวม แต่ผ่านด่าน Tool Allowlist, บังคับ Timeout (เช่น 5 วินาที), ล็อกขอบเขตโฟลเดอร์ (Path Sandbox) และซ่อน env ลับของโฮสต์ก่อนสปอว์น subprocess",
};

export function McpServerClientVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<McpViewMode>("server");
  const isServer = mode === "server";

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowBrandId = `${uid}-mcp-brand`;
  const arrowSuccessId = `${uid}-mcp-success`;
  const arrowWarningId = `${uid}-mcp-warning`;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="สลับมุมมองระหว่าง Local MCP Server กับ Safe MCP Client Sandbox"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={isServer}
          onClick={() => setMode("server")}
          className={isServer ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isServer ? ACTIVE_BTN_STYLE : undefined}
        >
          1 · Local FastMCP Server (stdio hygiene)
        </button>
        <button
          type="button"
          aria-pressed={!isServer}
          onClick={() => setMode("client")}
          className={!isServer ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isServer ? ACTIVE_BTN_STYLE : undefined}
        >
          2 · Safe Client Sandbox (Allowlist + Timeout)
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 260"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isServer
              ? "แผนภาพ Local FastMCP Server แยก @mcp.tool กับ @mcp.resource และแยก stdout สำหรับ JSON-RPC ออกจาก stderr สำหรับ log"
              : "แผนภาพ Safe MCP Client Sandbox ที่มี Tool Allowlist, Timeout 5s และ Path Boundary"
          }
        >
          <defs>
            <marker id={arrowBrandId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={arrowWarningId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
          </defs>

          {/* Left Box: AI Host / Client */}
          <rect x="16" y="24" width="186" height="212" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="109" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--brand-ink)">
            AI App + MCP Client
          </text>
          <rect x="28" y="62" width="162" height="48" rx="8" fill="var(--brand-soft)" stroke="var(--brand)" />
          <text x="109" y="82" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            {isServer ? "JSON-RPC 2.0 Host" : "Tool Allowlist Gate"}
          </text>
          <text x="109" y="99" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            {isServer ? "อ่านเฉพาะ stdout ล้วน" : "อนุญาตเฉพาะ tool ที่ระบุ"}
          </text>

          <rect x="28" y="122" width="162" height="48" rx="8" fill="var(--surface-2)" stroke="var(--line)" />
          <text x="109" y="142" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
            {isServer ? "discover: tools/list" : "timeout = 5.0s"}
          </text>
          <text x="109" y="159" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            {isServer ? "ดึง JSON Schema อัตโนมัติ" : "ตัดการเชื่อมต่อเมื่อค้าง"}
          </text>

          <rect x="28" y="182" width="162" height="40" rx="8" fill="var(--success-soft)" stroke="var(--success)" />
          <text x="109" y="206" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            {isServer ? "✓ Zero print() pollution" : "✓ Minimal Env + Sandbox"}
          </text>

          {/* Center Transport Pipes */}
          <line
            x1="204"
            y1="95"
            x2="330"
            y2="95"
            stroke="var(--success)"
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={`url(#${arrowSuccessId})`}
            className={flowClass}
          />
          <rect x="218" y="68" width="102" height="20" rx="10" fill="var(--success-soft)" stroke="var(--success)" />
          <text x="269" y="82" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            stdin / stdout
          </text>

          <line
            x1="334"
            y1="175"
            x2="208"
            y2="175"
            stroke="var(--warning)"
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "5 5"}
            markerEnd={`url(#${arrowWarningId})`}
            className={flowClass}
          />
          <rect x="218" y="183" width="102" height="20" rx="10" fill="var(--surface)" stroke="var(--warning)" />
          <text x="269" y="197" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--warning)">
            sys.stderr logs
          </text>

          {/* Right Box: FastMCP Server Process */}
          <rect
            x="336"
            y="24"
            width="328"
            height="212"
            rx="12"
            fill="var(--surface)"
            stroke="var(--success)"
            strokeWidth="1.5"
            className={txClass}
          />
          <text x="352" y="48" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
            FastMCP(&quot;thai-support-kb&quot;)
          </text>
          <text x="648" y="48" textAnchor="end" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            {isServer ? "SERVER PROCESS" : "SANDBOXED"}
          </text>

          {/* Tool Card */}
          <rect x="350" y="62" width="300" height="52" rx="9" fill="var(--brand-soft)" stroke="var(--brand)" />
          <text x="362" y="82" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            @mcp.tool() def lookup_ticket(ticket_id: str)
          </text>
          <text x="362" y="101" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            ตรวจพารามิเตอร์ด้วย Pydantic · คืนข้อมูลจาก SQLite แบบ Parameterized
          </text>

          {/* Resource Card */}
          <rect x="350" y="122" width="300" height="52" rx="9" fill="var(--cyan-soft)" stroke="var(--cyan)" />
          <text x="362" y="142" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--cyan)">
            @mcp.resource(&quot;kb://policies/&#123;slug&#125;&quot;)
          </text>
          <text x="362" y="161" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            Read-only · ตรวจ Path.resolve().is_relative_to(KB_ROOT) กัน traversal
          </text>

          {/* Hygiene Footer */}
          <rect x="350" y="182" width="300" height="40" rx="9" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="362" y="206" fontSize="10.5" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--fg)">
            logging.StreamHandler(sys.stderr) · ห้าม print() ออก stdout
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {MCP_CAPTIONS[mode]}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. LanggraphGuardrailsVisual (langgraph-guardrails)
 *    Unbounded Infinite Loop vs Guarded LangGraph (max_steps, budget, cycle hash)
 * ========================================================================== */

type GuardrailMode = "guarded" | "unbounded";

const GUARDRAIL_CAPTIONS: Record<GuardrailMode, string> = {
  guarded:
    "Guarded Execution: ทุกครั้งที่วนผ่านโหนด Tool ระบบจะอัปเดต step_count (+1), ตรวจงบ tool_budget และเช็กรอยนิ้วมือ (tool_name, args_hash) หากพบการเรียกซ้ำเดิมหรือครบเพดาน ระบบจะตัดเข้าโหนด Fallback สรุปคำตอบอย่างปลอดภัยทันที",
  unbounded:
    "Unbounded Loop (อันตราย): เมื่อ Tool คืนค่าว่างหรือ error เดิมซ้ำ ๆ โดยไม่มีตัวนับรอบและไม่มีตัวจับ args_hash ซ้ำ โมเดลจะวนเรียก Tool เดิมไม่รู้จบจนโควตา API หมดและคำขอค้าง (Timeout)",
};

export function LanggraphGuardrailsVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<GuardrailMode>("guarded");
  const isGuarded = mode === "guarded";

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const arrowSuccessId = `${uid}-lg-success`;
  const arrowDangerId = `${uid}-lg-danger`;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เปรียบเทียบ Guarded LangGraph Loop กับ Unbounded Loop"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={isGuarded}
          onClick={() => setMode("guarded")}
          className={isGuarded ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isGuarded ? ACTIVE_BTN_STYLE : undefined}
        >
          ✓ Guarded Loop (max_steps + cycle hash)
        </button>
        <button
          type="button"
          aria-pressed={!isGuarded}
          onClick={() => setMode("unbounded")}
          className={!isGuarded ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isGuarded ? ACTIVE_BTN_STYLE : undefined}
        >
          ✕ Unbounded Loop (วนซ้ำไม่รู้จบ)
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 250"
          className="w-full h-auto block"
          role="img"
          aria-label={
            isGuarded
              ? "แผนภาพ Guarded LangGraph ที่มีด่านตรวจ max_steps=4, tool_budget และ cycle hash ก่อนตัดเข้า Fallback"
              : "แผนภาพ Unbounded Agent Loop ที่วนเรียก Tool ซ้ำไม่รู้จบ"
          }
        >
          <defs>
            <marker id={arrowSuccessId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={arrowDangerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--danger)" />
            </marker>
          </defs>

          {/* State HUD Bar */}
          <rect x="16" y="12" width="648" height="32" rx="10" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="32" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            AgentState:
          </text>
          <text x="115" y="32" fontSize="11" fontFamily="var(--font-mono)" fill="var(--fg)">
            {isGuarded
              ? "step_count=3/4 · budget=2/3 calls · seen_hashes={'lookup:ORD-99'}"
              : "step_count=∞ (ไม่นับ) · budget=NONE · seen_hashes=NONE"}
          </text>

          {/* Node 1: Plan / Decide */}
          <rect x="24" y="82" width="150" height="86" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="99" y="112" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            agent_node
          </text>
          <text x="99" y="132" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            เลือกเรียก Tool
          </text>
          <text x="99" y="150" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
            lookup(&quot;ORD-99&quot;)
          </text>

          {/* Node 2: Guardrail Gate */}
          <rect
            x="228"
            y="68"
            width="206"
            height="114"
            rx="12"
            fill={isGuarded ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isGuarded ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.75"
            className={txClass}
          />
          <text
            x="331"
            y="95"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={isGuarded ? "var(--success)" : "var(--danger)"}
          >
            {isGuarded ? "guardrail_router" : "✕ NO GUARDRAIL"}
          </text>
          <text x="331" y="118" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            {isGuarded ? "1) steps >= max_steps (4)?" : "ไม่เช็กจำนวนรอบ"}
          </text>
          <text x="331" y="137" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--fg)">
            {isGuarded ? "2) hash in seen_calls?" : "ไม่เช็ก args ซ้ำเดิม"}
          </text>
          <text
            x="331"
            y="160"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={isGuarded ? "var(--success)" : "var(--danger)"}
          >
            {isGuarded ? "พบเรียกซ้ำ → ตัดเข้า Fallback!" : "ปล่อยวนเรียก Tool ซ้ำไปเรื่อยๆ"}
          </text>

          {/* Arrow Agent -> Gate */}
          <line
            x1="174"
            y1="125"
            x2="224"
            y2="125"
            stroke={isGuarded ? "var(--success)" : "var(--danger)"}
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            markerEnd={isGuarded ? `url(#${arrowSuccessId})` : `url(#${arrowDangerId})`}
            className={flowClass}
          />

          {/* Right Outcome: Safe Fallback vs Infinite Cycle */}
          {isGuarded ? (
            <g className={txClass}>
              <line
                x1="434"
                y1="125"
                x2="486"
                y2="125"
                stroke="var(--success)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowSuccessId})`}
                className={flowClass}
              />
              <rect x="492" y="76" width="166" height="98" rx="12" fill="var(--surface)" stroke="var(--success)" strokeWidth="1.75" />
              <text x="575" y="104" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
                fallback_end → END
              </text>
              <text x="575" y="126" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
                หยุดลูปทันที · คืนคำตอบสุภาพ
              </text>
              <text x="575" y="146" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
                stop_reason=&quot;duplicate_call&quot;
              </text>
            </g>
          ) : (
            <g className={txClass}>
              <rect x="492" y="76" width="166" height="98" rx="12" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.75" />
              <text x="575" y="104" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--danger)">
                tool_node (วนซ้ำ ∞)
              </text>
              <text x="575" y="126" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
                เรียก ORD-99 รอบที่ 15, 16...
              </text>
              <text x="575" y="146" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)" fill="var(--danger)">
                ✕ เผา Token &amp; ค้างจน Timeout
              </text>
              <path
                d="M 575 174 C 575 224, 99 224, 99 172"
                fill="none"
                stroke="var(--danger)"
                strokeWidth="2.25"
                strokeDasharray={reduced ? undefined : "6 6"}
                markerEnd={`url(#${arrowDangerId})`}
                className={flowClass}
              />
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
        {GUARDRAIL_CAPTIONS[mode]}
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. HitlCheckpointVisual (hitl-checkpoint)
 *    LangGraph Checkpointer + interrupt_before write tool (Approve vs Reject)
 * ========================================================================== */

type HitlDecision = "paused" | "approved" | "rejected";

const HITL_CAPTIONS: Record<HitlDecision, string> = {
  paused:
    "1 · Interrupt & Persist: เมื่อกราฟจะเข้าโหนด write_refund (ยอด 4,500 ฿) ระบบสั่ง interrupt_before บันทึก State ลง SQLite Checkpointer ตาม thread_id='th-108' แล้วหยุดรอผู้ดูแลโดยไม่รันคำสั่งโอนเงินจริง",
  approved:
    "2 · Human Approved: หัวหน้าทีมกดอนุมัติ ระบบโหลด State เดิมจาก thread_id='th-108' ขึ้นมาทำงานต่อจากจุดที่ค้างไว้ รันโหนด write_refund สำเร็จและบันทึกผู้ผู้อนุมัติลง Audit Log",
  rejected:
    "3 · Human Rejected: หัวหน้าทีมกดปฏิเสธพร้อมระบุเหตุผล กราฟข้ามการเรียก write_refund ทันทีและเดินไปโหนดแจ้งผลลูกค้าอย่างปลอดภัย โดยไม่มีการเปลี่ยนแปลงข้อมูลในฐานข้อมูล",
};

export function HitlCheckpointVisual({ reduced = false }: VisualProps) {
  const [decision, setDecision] = useState<HitlDecision>("paused");
  const txClass = reduced ? undefined : "transition-all duration-300";

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="จำลองสถานะ Human-in-the-Loop Checkpoint"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={decision === "paused"}
          onClick={() => setDecision("paused")}
          className={decision === "paused" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={decision === "paused" ? ACTIVE_BTN_STYLE : undefined}
        >
          1 · Paused at Checkpoint (รอคนอนุมัติ)
        </button>
        <button
          type="button"
          aria-pressed={decision === "approved"}
          onClick={() => setDecision("approved")}
          className={decision === "approved" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={decision === "approved" ? ACTIVE_BTN_STYLE : undefined}
        >
          2 · Resume: Approved ✓
        </button>
        <button
          type="button"
          aria-pressed={decision === "rejected"}
          onClick={() => setDecision("rejected")}
          className={decision === "rejected" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={decision === "rejected" ? ACTIVE_BTN_STYLE : undefined}
        >
          3 · Resume: Rejected ✕
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 245"
          className="w-full h-auto block"
          role="img"
          aria-label={`แผนภาพ LangGraph Human-in-the-Loop Checkpoint สถานะ ${decision}`}
        >
          {/* Thread Header */}
          <rect x="16" y="12" width="648" height="30" rx="9" fill="var(--surface)" stroke="var(--line)" />
          <text x="28" y="31" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            thread_id=&quot;th-108&quot; · SQLite Checkpointer
          </text>
          <text x="650" y="31" textAnchor="end" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
            action: issue_refund(4500 THB)
          </text>

          {/* Stage 1: Draft Proposal */}
          <rect x="20" y="68" width="180" height="106" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="110" y="96" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            propose_action
          </text>
          <text x="110" y="118" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            อ่านนโยบาย + เตรียมคำขอคืนเงิน
          </text>
          <text x="110" y="142" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
            status=&quot;pending_approval&quot;
          </text>

          {/* Stage 2: Checkpointer Interrupt Gate */}
          <rect
            x="240"
            y="60"
            width="200"
            height="122"
            rx="12"
            fill={
              decision === "paused"
                ? "var(--warning-soft)"
                : decision === "approved"
                  ? "var(--success-soft)"
                  : "var(--danger-soft)"
            }
            stroke={
              decision === "paused"
                ? "var(--warning)"
                : decision === "approved"
                  ? "var(--success)"
                  : "var(--danger)"
            }
            strokeWidth="1.75"
            className={txClass}
          />
          <text
            x="340"
            y="88"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={
              decision === "paused"
                ? "var(--warning)"
                : decision === "approved"
                  ? "var(--success)"
                  : "var(--danger)"
            }
          >
            interrupt_before
          </text>
          <text x="340" y="112" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--fg)">
            {decision === "paused"
              ? "⏸ เซฟ State ลงดิสก์ รอคนกด"
              : decision === "approved"
                ? "✓ อนุมัติโดย reviewer_01"
                : "✕ ปฏิเสธโดย reviewer_01"}
          </text>
          <text x="340" y="136" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
            checkpoint_id=&quot;ckpt-042&quot;
          </text>

          {/* Stage 3: Final Outcome */}
          <rect
            x="480"
            y="68"
            width="180"
            height="106"
            rx="12"
            fill="var(--surface)"
            stroke={
              decision === "paused"
                ? "var(--line)"
                : decision === "approved"
                  ? "var(--success)"
                  : "var(--danger)"
            }
            strokeWidth="1.5"
            className={txClass}
          />
          <text
            x="570"
            y="96"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={
              decision === "paused"
                ? "var(--muted)"
                : decision === "approved"
                  ? "var(--success)"
                  : "var(--danger)"
            }
          >
            {decision === "paused"
              ? "execute_refund (รอ)"
              : decision === "approved"
                ? "✓ execute_refund"
                : "✕ cancel_and_notify"}
          </text>
          <text x="570" y="120" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            {decision === "paused"
              ? "ยังไม่แตะฐานข้อมูลจริง"
              : decision === "approved"
                ? "โอนคืน 4,500 ฿ + บันทึก Audit"
                : "ข้ามการโอนเงิน + แจ้งเหตุผล"}
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {HITL_CAPTIONS[decision]}
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. Phase4RagAgentArchVisual (phase4-rag-agent-arch)
 *    End-to-End Phase 4 Architecture: ACL + Hybrid RAG (BM25+Dense+RRF+Rerank)
 *    + MCP Tool Server + Guarded LangGraph + Citation Verifier
 * ========================================================================== */

type Phase4RoutePath = "rag" | "mcp" | "abstain";

const PHASE4_ARCH_CAPTIONS: Record<Phase4RoutePath, string> = {
  rag: "เส้นทางที่ 1 · Policy Hybrid RAG: คำถามนโยบายผ่านด่าน Pre-Retrieval Tenant ACL → ค้นคู่ขนาน PyThaiNLP BM25 + Dense Vector → รวมอันดับด้วย RRF + Cross-Encoder Reranker → สร้างคำตอบพร้อมตรวจย้อนกลับ [doc_id#chunk] ทุกข้อ",
  mcp: "เส้นทางที่ 2 · Controlled MCP Tool + HITL: คำถามเช็กสถานะพัสดุหรือขอคืนเงินถูกส่งเข้าโหนด MCP Client (Allowlist + Timeout) โดยมี Guardrail คุมจำนวนก้าวและมีจุดพัก HITL Checkpoint ก่อนทำงานเขียนที่มีความเสี่ยงสูง",
  abstain:
    "เส้นทางที่ 3 · Safe Abstention & Fallback: เมื่อคะแนนหลัง Rerank ต่ำกว่าเกณฑ์ หรือ Citation Verifier พบการอ้างอิงที่ไม่มีอยู่จริงใน Chunk ที่ได้รับอนุญาต ระบบจะตัดเข้าโหมดปฏิเสธอย่างสุภาพโดยไม่เดาคำตอบ",
};

export function Phase4RagAgentArchVisual({ reduced = false }: VisualProps) {
  const [route, setRoute] = useState<Phase4RoutePath>("rag");
  const txClass = reduced ? undefined : "transition-all duration-300";

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="เลือกเส้นทางการทำงานของสถาปัตยกรรม Phase 4 Thai Hybrid RAG & Controlled Agent"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          aria-pressed={route === "rag"}
          onClick={() => setRoute("rag")}
          className={route === "rag" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={route === "rag" ? ACTIVE_BTN_STYLE : undefined}
        >
          1 · Hybrid RAG + Citation Verifier
        </button>
        <button
          type="button"
          aria-pressed={route === "mcp"}
          onClick={() => setRoute("mcp")}
          className={route === "mcp" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={route === "mcp" ? ACTIVE_BTN_STYLE : undefined}
        >
          2 · MCP Tool + LangGraph Guardrails
        </button>
        <button
          type="button"
          aria-pressed={route === "abstain"}
          onClick={() => setRoute("abstain")}
          className={route === "abstain" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={route === "abstain" ? ACTIVE_BTN_STYLE : undefined}
        >
          3 · Safe Abstention Fallback
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 265"
          className="w-full h-auto block"
          role="img"
          aria-label={`แผนภาพสถาปัตยกรรม Phase 4 Thai Knowledge RAG และ Controlled Agent เส้นทาง ${route}`}
        >
          {/* Left: Entry + Router */}
          <rect x="16" y="70" width="144" height="124" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="88" y="96" textAnchor="middle" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            LangGraph Router
          </text>
          <text x="88" y="118" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            JWT tenant_id=&quot;A&quot;
          </text>
          <text x="88" y="138" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted)">
            max_steps=4 · budget=3
          </text>
          <rect x="28" y="152" width="120" height="24" rx="7" fill="var(--brand-soft)" />
          <text x="88" y="168" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            route: {route.toUpperCase()}
          </text>

          {/* Middle Top Lane: Hybrid RAG + ACL */}
          <rect
            x="196"
            y="18"
            width="256"
            height="104"
            rx="12"
            fill={route === "rag" ? "var(--success-soft)" : "var(--surface)"}
            stroke={route === "rag" ? "var(--success)" : "var(--line)"}
            strokeWidth={route === "rag" ? "1.75" : "1.25"}
            className={txClass}
          />
          <text x="210" y="42" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
            Thai Hybrid RAG (ACL tenant=&apos;A&apos;)
          </text>
          <text x="210" y="64" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            PyThaiNLP BM25 + Dense Vector → RRF
          </text>
          <text x="210" y="84" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            Cross-Encoder Reranker (score &gt;= 0.45)
          </text>
          <text x="210" y="106" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--success)">
            ✓ คืน Chunks เฉพาะของ Tenant A
          </text>

          {/* Middle Bottom Lane: MCP Server + HITL */}
          <rect
            x="196"
            y="142"
            width="256"
            height="104"
            rx="12"
            fill={route === "mcp" ? "var(--brand-soft)" : "var(--surface)"}
            stroke={route === "mcp" ? "var(--brand)" : "var(--line)"}
            strokeWidth={route === "mcp" ? "1.75" : "1.25"}
            className={txClass}
          />
          <text x="210" y="166" fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--fg)">
            FastMCP Tool Server + HITL
          </text>
          <text x="210" y="188" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            @mcp.tool() lookup_order / issue_refund
          </text>
          <text x="210" y="208" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--muted)">
            Idempotency Key + Cycle Hash Detection
          </text>
          <text x="210" y="230" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--brand-ink)">
            ✓ interrupt_before write actions
          </text>

          {/* Right: Citation Verifier & Final Response */}
          <rect
            x="484"
            y="48"
            width="180"
            height="168"
            rx="12"
            fill="var(--surface)"
            stroke={route === "abstain" ? "var(--warning)" : "var(--success)"}
            strokeWidth="1.75"
            className={txClass}
          />
          <text
            x="574"
            y="78"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={route === "abstain" ? "var(--warning)" : "var(--success)"}
          >
            Citation &amp; Output Gate
          </text>
          <text x="574" y="106" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--fg)">
            {route === "rag"
              ? "ตรวจ [doc_id#chunk] ครบทุกข้อ"
              : route === "mcp"
                ? "รวมผล Tool + อ้างอิงแหล่งข้อมูล"
                : "คะแนนต่ำ / อ้างอิงไม่ผ่านเกณฑ์"}
          </text>
          <rect
            x="498"
            y="126"
            width="152"
            height="68"
            rx="9"
            fill={route === "abstain" ? "var(--warning-soft)" : "var(--success-soft)"}
          />
          <text
            x="574"
            y="152"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            fill={route === "abstain" ? "var(--warning)" : "var(--success)"}
          >
            {route === "abstain" ? "✓ Safe Abstention" : "✓ Verified Thai Answer"}
          </text>
          <text x="574" y="174" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--fg)">
            {route === "abstain" ? "ไม่เดาคำตอบ · แนะติดต่อทีม" : "Faithfulness = 1.0"}
          </text>
        </svg>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-hair px-3.5 py-2.5 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--fg)" }}
      >
        {PHASE4_ARCH_CAPTIONS[route]}
      </div>
    </div>
  );
}
