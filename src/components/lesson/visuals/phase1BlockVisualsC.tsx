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

/* ========================================================================== */
/* 1. SemaphoreStreamVisual (semaphore-stream)                                */
/* ========================================================================== */

const SEMAPHORE_PRESETS: { value: number; label: string }[] = [
  { value: 1, label: "Semaphore(1) · ช้า" },
  { value: 5, label: "Semaphore(5) · ~5x" },
  { value: 10, label: "Semaphore(10) · เสี่ยง 429" },
];

export function SemaphoreStreamVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [limit, setLimit] = useState(5);
  const [sse, setSse] = useState(true);

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const isRateLimited = limit >= 8;
  const isCaution = limit >= 6 && limit <= 7;
  const isSweetSpot = limit === 5;

  // 20 async calls, ~0.5s each (10.0s sequential baseline)
  const waves = Math.ceil(20 / limit);
  const rawSeconds = waves * 0.5;
  const retryPenalty = isRateLimited ? (limit - 7) * 1.4 : 0;
  const totalSeconds = rawSeconds + retryPenalty;
  const speedup = 10 / totalSeconds;

  const gateStroke = isRateLimited
    ? "var(--danger)"
    : isCaution
      ? "var(--warning)"
      : isSweetSpot
        ? "var(--success)"
        : "var(--brand)";

  const gateBadgeFill = isRateLimited
    ? "var(--danger-soft)"
    : isCaution
      ? "var(--warning-soft)"
      : isSweetSpot
        ? "var(--success-soft)"
        : "var(--brand-soft)";

  const gateBadgeColor = isRateLimited
    ? "var(--danger)"
    : isCaution
      ? "var(--warning)"
      : isSweetSpot
        ? "var(--success)"
        : "var(--brand-ink)";

  const gateStatusLabel = isRateLimited
    ? "429 Rate Limit! โดนบล็อก"
    : isCaution
      ? "ใกล้เพดานโควตา RPM"
      : isSweetSpot
        ? "Sweet Spot · เร็ว ~5.0x"
        : limit === 1
          ? "ปลอดภัย · วิ่งทีละ 1 งาน"
          : `ปลอดภัย · เร็ว ${speedup.toFixed(1)}x`;

  const markerFlow = `${uid}-sem-flow`;
  const markerApi = `${uid}-sem-api`;
  const sliderId = `${uid}-sem-slider`;

  const captionText = isRateLimited
    ? `Semaphore(${limit}) เปิดงานพร้อมกันมากเกินไป: API ตอบกลับ HTTP 429 Rate Limit ต้องรอ Retry/Backoff ทำให้เวลารวมช้าลงเป็น ~${totalSeconds.toFixed(1)}s แทนที่จะเร็วขึ้น — ควรจำกัดไว้ที่ Semaphore(5) ${sse ? "ร่วมกับ SSE Streaming เพื่อให้ผู้ใช้เห็นคำแรกใน ~0.25s" : "และเปิด SSE เพื่อลดเวลารอหน้าจอว่าง"}`
    : isSweetSpot
      ? `Semaphore(5) คือจุดสมดุลสำหรับ 20 async calls: ลดเวลาจาก 10.0s เหลือ ~2.0s (เร็วขึ้น ~5.0x) โดยไม่ชนเพดาน 429 Rate Limit ${sse ? "และโหมด SSE ส่ง token ทีละชิ้น (TTFT ~0.25s)" : "ส่วนโหมด Batch JSON ต้องรอจนตอบครบทั้งก้อน (TTFB ~2.0s)"}`
      : `Semaphore(${limit}) รันงานพร้อมกัน ${limit} ช่องจาก 20 งาน (เหลือรอคิว ${20 - limit} งาน) ใช้เวลารวม ~${totalSeconds.toFixed(1)}s (${speedup.toFixed(1)}x) · ${sse ? "SSE Stream ส่งผลลัพธ์ทีละก้อนให้ผู้ใช้เห็นทันที" : "Batch JSON รอจนสร้างข้อความจบทั้งหมดก่อนส่งกลับ"}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="เลือกค่าตั้งต้น asyncio.Semaphore" className="flex flex-wrap gap-2">
          {SEMAPHORE_PRESETS.map((preset) => {
            const active = limit === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                aria-pressed={active}
                className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
                style={active ? ACTIVE_BTN_STYLE : undefined}
                onClick={() => setLimit(preset.value)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-pressed={sse}
          className={sse ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={
            sse
              ? { borderColor: "var(--cyan)", background: "var(--cyan-soft)", color: "var(--cyan)" }
              : undefined
          }
          onClick={() => setSse((prev) => !prev)}
        >
          {sse ? "SSE Stream: ON" : "SSE Stream: OFF (Batch)"}
        </button>
      </div>

      <label htmlFor={sliderId} className="flex flex-col gap-1 text-sm">
        <span className="flex items-center justify-between font-medium">
          <span>จำนวนคำขอพร้อมกัน (Concurrency Limit)</span>
          <span
            className="mono-label tabular-nums font-semibold"
            style={{ color: gateBadgeColor }}
          >
            Semaphore({limit}) · {isRateLimited ? "429 Risk!" : `~${speedup.toFixed(1)}x`}
          </span>
        </span>
        <input
          id={sliderId}
          type="range"
          min={1}
          max={10}
          step={1}
          value={limit}
          aria-label="ปรับค่า asyncio.Semaphore ตั้งแต่ 1 ถึง 10"
          onChange={(e) => setLimit(Number(e.target.value))}
          className="h-6 w-full cursor-pointer accent-[color:var(--brand)]"
        />
      </label>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 275"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพการควบคุม 20 Async API Calls ด้วย asyncio.Semaphore และโหมด SSE Streaming"
        >
          <defs>
            <marker id={markerFlow} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={gateStroke} />
            </marker>
            <marker id={markerApi} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={sse ? "var(--cyan)" : "var(--warning)"} />
            </marker>
          </defs>

          {/* Left Card: 20 Async Tasks Queue */}
          <g>
            <rect x="14" y="14" width="166" height="247" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <text x="97" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              20 Async Calls
            </text>
            <text x="97" y="51" textAnchor="middle" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
              asyncio.gather(*tasks)
            </text>

            {/* 4x5 grid of 20 tasks */}
            {Array.from({ length: 20 }, (_, idx) => {
              const col = idx % 4;
              const row = Math.floor(idx / 4);
              const x = 25 + col * 37;
              const y = 63 + row * 28;
              const inFlight = idx < limit;
              const hit429 = isRateLimited && idx >= 6 && idx < limit;
              const fill = hit429
                ? "var(--danger-soft)"
                : inFlight
                  ? "var(--brand-soft)"
                  : "var(--surface-2)";
              const stroke = hit429
                ? "var(--danger)"
                : inFlight
                  ? "var(--brand)"
                  : "var(--hair)";
              const textColor = hit429
                ? "var(--danger)"
                : inFlight
                  ? "var(--brand-ink)"
                  : "var(--muted)";

              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={y}
                    width="32"
                    height="22"
                    rx="5"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={inFlight ? "1.4" : "1"}
                    className={txClass}
                  />
                  <text
                    x={x + 16}
                    y={y + 15}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={inFlight ? "700" : "500"}
                    fill={textColor}
                    fontFamily="var(--font-mono)"
                  >
                    {hit429 ? "429" : `T${idx + 1}`}
                  </text>
                </g>
              );
            })}

            <line x1="26" y1="210" x2="168" y2="210" stroke="var(--hair)" />
            <text x="26" y="229" fontSize="11.5" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-sans)">
              กำลังยิง: {limit} งาน
            </text>
            <text x="26" y="247" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
              รอคิวใน Queue: {20 - limit} งาน
            </text>
          </g>

          {/* Animated Flow Lines: Queue -> Semaphore Gate */}
          {[96, 136, 176].map((yPos, idx) => (
            <path
              key={yPos}
              d={`M 181 ${yPos} C 198 ${yPos}, 200 136, 214 136`}
              fill="none"
              stroke={gateStroke}
              strokeWidth={idx === 1 ? "2.4" : "1.6"}
              strokeDasharray={reduced ? undefined : "6 6"}
              className={flowClass}
              markerEnd={idx === 1 ? `url(#${markerFlow})` : undefined}
            />
          ))}

          {/* Center Card: Semaphore Gate & 10 Slots */}
          <g>
            <rect
              x="218"
              y="14"
              width="212"
              height="247"
              rx="12"
              fill="var(--surface)"
              stroke={gateStroke}
              strokeWidth="2"
              className={txClass}
            />
            <text x="324" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              Semaphore({limit})
            </text>

            {/* Health status pill */}
            <rect
              x="234"
              y="44"
              width="180"
              height="23"
              rx="11.5"
              fill={gateBadgeFill}
              stroke={gateStroke}
              strokeWidth="1.2"
              className={txClass}
            />
            <text
              x="324"
              y="59.5"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill={gateBadgeColor}
              fontFamily="var(--font-sans)"
            >
              {gateStatusLabel}
            </text>

            {/* 10 Concurrency Slots (2 cols x 5 rows) */}
            {Array.from({ length: 10 }, (_, idx) => {
              const slotNum = idx + 1;
              const col = idx < 5 ? 0 : 1;
              const row = idx % 5;
              const x = 230 + col * 96;
              const y = 78 + row * 26;
              const open = slotNum <= limit;
              const overloaded = isRateLimited && slotNum >= 7 && open;
              const tight = isCaution && slotNum >= 6 && open;

              const fill = overloaded
                ? "var(--danger-soft)"
                : tight
                  ? "var(--warning-soft)"
                  : open
                    ? "var(--cyan-soft)"
                    : "var(--surface-2)";
              const stroke = overloaded
                ? "var(--danger)"
                : tight
                  ? "var(--warning)"
                  : open
                    ? "var(--cyan)"
                    : "var(--hair)";
              const labelColor = overloaded
                ? "var(--danger)"
                : tight
                  ? "var(--warning)"
                  : open
                    ? "var(--cyan)"
                    : "var(--muted)";

              return (
                <g key={slotNum}>
                  <rect
                    x={x}
                    y={y}
                    width="90"
                    height="21"
                    rx="5"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={open ? "1.3" : "1"}
                    className={txClass}
                  />
                  <text
                    x={x + 45}
                    y={y + 14.5}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={open ? "700" : "500"}
                    fill={labelColor}
                    fontFamily="var(--font-mono)"
                  >
                    {overloaded
                      ? `#${slotNum} · 429`
                      : tight
                        ? `#${slotNum} · tight`
                        : open
                          ? `#${slotNum} · RUN`
                          : `#${slotNum} · lock`}
                  </text>
                </g>
              );
            })}

            {/* Speed & Time Summary Footer */}
            <rect
              x="230"
              y="214"
              width="188"
              height="36"
              rx="8"
              fill={gateBadgeFill}
              stroke={gateStroke}
              strokeOpacity="0.5"
              className={txClass}
            />
            <text x="242" y="236" fontSize="12" fontWeight="700" fill={gateBadgeColor} fontFamily="var(--font-mono)">
              ~{totalSeconds.toFixed(1)}s
            </text>
            <text x="406" y="236" textAnchor="end" fontSize="11.5" fontWeight="600" fill={gateBadgeColor} fontFamily="var(--font-sans)">
              {isRateLimited ? "ติด Retry Penalty" : `เร็วขึ้น ${speedup.toFixed(1)}x`}
            </text>
          </g>

          {/* Animated Flow Lines: Semaphore -> API / Stream */}
          <line
            x1="431"
            y1={sse ? "126" : "136"}
            x2="463"
            y2={sse ? "126" : "136"}
            stroke={sse ? "var(--cyan)" : "var(--warning)"}
            strokeWidth="2.4"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${markerApi})`}
          />
          {sse ? (
            <line
              x1="431"
              y1="146"
              x2="463"
              y2="146"
              stroke="var(--cyan)"
              strokeWidth="1.8"
              strokeDasharray={reduced ? undefined : "4 6"}
              className={flowClass}
              markerEnd={`url(#${markerApi})`}
            />
          ) : null}

          {/* Right Card: API Quota + SSE vs Batch Output */}
          <g>
            <rect
              x="468"
              y="14"
              width="198"
              height="247"
              rx="12"
              fill="var(--surface)"
              stroke={isRateLimited ? "var(--danger)" : sse ? "var(--cyan)" : "var(--line)"}
              strokeWidth="1.75"
              className={txClass}
            />
            <text x="567" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              LLM API + Output
            </text>

            {/* API Quota Status Pill */}
            <rect
              x="480"
              y="44"
              width="174"
              height="23"
              rx="11.5"
              fill={isRateLimited ? "var(--danger-soft)" : "var(--success-soft)"}
              stroke={isRateLimited ? "var(--danger)" : "var(--success)"}
              strokeWidth="1.2"
              className={txClass}
            />
            <text
              x="567"
              y="59.5"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill={isRateLimited ? "var(--danger)" : "var(--success)"}
              fontFamily="var(--font-mono)"
            >
              {isRateLimited ? "HTTP 429 · Rate Limit" : "HTTP 200 · Quota OK"}
            </text>

            <line x1="482" y1="78" x2="652" y2="78" stroke="var(--hair)" />

            <text x="567" y="96" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={sse ? "var(--cyan)" : "var(--warning)"} fontFamily="var(--font-mono)">
              {sse ? "SSE: text/event-stream" : "Batch: application/json"}
            </text>

            {sse ? (
              <>
                {[
                  { y: 108, label: 'data: {"tok": "สรุป"}' },
                  { y: 138, label: 'data: {"tok": "ตั๋ว #1"}' },
                  { y: 168, label: "data: [DONE]" },
                ].map((chunk, idx) => (
                  <g key={chunk.label}>
                    <rect
                      x="482"
                      y={chunk.y}
                      width="170"
                      height="24"
                      rx="6"
                      fill={idx === 2 ? "var(--success-soft)" : "var(--cyan-soft)"}
                      stroke={idx === 2 ? "var(--success)" : "var(--cyan)"}
                      strokeWidth="1.2"
                      className={txClass}
                    />
                    <text
                      x="492"
                      y={chunk.y + 16}
                      fontSize="11"
                      fontWeight="600"
                      fill={idx === 2 ? "var(--success)" : "var(--cyan)"}
                      fontFamily="var(--font-mono)"
                    >
                      {chunk.label}
                    </text>
                  </g>
                ))}
                <rect x="482" y="206" width="170" height="42" rx="8" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeOpacity="0.6" />
                <text x="567" y="224" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                  TTFT ~0.25s
                </text>
                <text x="567" y="241" textAnchor="middle" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  เห็นคำแรกทันทีแบบไหลต่อเนื่อง
                </text>
              </>
            ) : (
              <>
                <rect x="482" y="108" width="170" height="84" rx="8" fill="var(--surface-2)" stroke="var(--line)" strokeDasharray="4 4" />
                <text x="567" y="132" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-sans)">
                  กำลังรอคำตอบครบ 100%...
                </text>
                <rect x="496" y="144" width="142" height="10" rx="5" fill="var(--surface)" stroke="var(--hair)" />
                <rect x="496" y="144" width="112" height="10" rx="5" fill="var(--warning)" className={txClass} />
                <text x="567" y="176" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {"{\"text\": \"...full json\"}"}
                </text>

                <rect x="482" y="206" width="170" height="42" rx="8" fill="var(--warning-soft)" stroke="var(--warning)" strokeOpacity="0.6" />
                <text x="567" y="224" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
                  TTFB ~2.0s
                </text>
                <text x="567" y="241" textAnchor="middle" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ผู้ใช้ต้องรอจนจบทั้งก้อน
                </text>
              </>
            )}
          </g>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 2. GitPackageCliVisual (git-package-cli)                                   */
/* ========================================================================== */

type DevWorkflowTab = "git" | "layout" | "cli";

const WORKFLOW_TABS: { id: DevWorkflowTab; label: string }[] = [
  { id: "git", label: "Git & .gitignore" },
  { id: "layout", label: "src/ Package Layout" },
  { id: "cli", label: "Typer CLI Runner" },
];

export function GitPackageCliVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [tab, setTab] = useState<DevWorkflowTab>("git");

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const markerBrand = `${uid}-git-brand`;
  const markerOk = `${uid}-git-ok`;

  const captionText =
    tab === "git"
      ? "Git & .gitignore: แตก Feature Branch (feat/llm-client) เพื่อเปิด PR เข้า main อย่างปลอดภัย พร้อมตั้ง .gitignore บล็อกไฟล์ความลับ (.env) และฐานข้อมูลท้องถิ่น (data/*.db) ไม่ให้หลุดขึ้น GitHub"
      : tab === "layout"
        ? "src/ Package Layout: แยกโค้ดจริงไว้ใต้ src/ticket_ai/ เพื่อบังคับให้ pytest ทดสอบผ่านแพ็กเกจที่ติดตั้งจริง (uv pip install -e .) ป้องกันบั๊ก import ผ่านเฉพาะในเครื่องตัวเอง"
        : "Typer CLI Runner: แปลง Python Type Hints (Path, int, bool) เป็นคำสั่ง CLI ที่มี --help อัตโนมัติ ตรวจสอบอาร์กิวเมนต์ผิดชนิดก่อนรันจริง และคืน Exit Code มาตรฐาน";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกแท็บ Git, โครงสร้าง src/ และ Typer CLI" className="flex flex-wrap gap-2">
        {WORKFLOW_TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 275"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพ Git Branching กับ .gitignore, โครงสร้าง src/ Package Layout และ Typer CLI Runner"
        >
          <defs>
            <marker id={markerBrand} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerOk} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {tab === "git" && (
            <g>
              {/* Top Panel: Feature Branch & PR Merge */}
              <rect x="14" y="12" width="652" height="104" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
              <text x="28" y="34" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                main
              </text>
              <text x="28" y="88" fontSize="12" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                feat/cli
              </text>

              {/* Main branch rail */}
              <line x1="112" y1="30" x2="624" y2="30" stroke="var(--brand)" strokeWidth="2.5" />

              {/* Feature branch fork & merge curve */}
              <path
                d="M 218 30 C 246 30, 250 84, 286 84 L 468 84 C 504 84, 512 30, 540 30"
                fill="none"
                stroke="var(--cyan)"
                strokeWidth="2.5"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
              />

              {/* Commits on main */}
              {[
                { cx: 128, label: "init" },
                { cx: 218, label: "base" },
                { cx: 540, label: "PR #12" },
                { cx: 620, label: "v0.1" },
              ].map((c) => (
                <g key={c.label}>
                  <circle cx={c.cx} cy="30" r="8" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="2.2" />
                  <text x={c.cx} y="53" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                    {c.label}
                  </text>
                </g>
              ))}

              {/* Commits on feature branch */}
              {[
                { cx: 318, label: "add httpx" },
                { cx: 432, label: "add tests" },
              ].map((c) => (
                <g key={c.label}>
                  <circle cx={c.cx} cy="84" r="8" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="2.2" />
                  <text x={c.cx} y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-mono)">
                    {c.label}
                  </text>
                </g>
              ))}

              {/* Bottom Panel: .gitignore Security Gate */}
              {/* Left: Working Tree */}
              <rect x="14" y="128" width="224" height="134" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
              <text x="28" y="149" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
                Working Tree (ไฟล์ในเครื่อง)
              </text>
              {[
                { y: 160, name: "src/ticket_ai/cli.py", safe: true },
                { y: 185, name: "pyproject.toml", safe: true },
                { y: 210, name: ".env  (API_KEY=sk-...)", safe: false },
                { y: 235, name: "data/cache.db", safe: false },
              ].map((file) => (
                <g key={file.name}>
                  <rect
                    x="26"
                    y={file.y}
                    width="200"
                    height="20"
                    rx="5"
                    fill={file.safe ? "var(--success-soft)" : "var(--danger-soft)"}
                    stroke={file.safe ? "var(--success)" : "var(--danger)"}
                    strokeOpacity="0.6"
                  />
                  <text
                    x="34"
                    y={file.y + 14}
                    fontSize="11"
                    fontWeight="600"
                    fill={file.safe ? "var(--success)" : "var(--danger)"}
                    fontFamily="var(--font-mono)"
                  >
                    {file.name}
                  </text>
                </g>
              ))}

              {/* Flow lines: safe pass through, secrets blocked */}
              <line
                x1="238"
                y1="182"
                x2="282"
                y2="182"
                stroke="var(--success)"
                strokeWidth="2.2"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
              />
              <line
                x1="238"
                y1="232"
                x2="278"
                y2="232"
                stroke="var(--danger)"
                strokeWidth="2.2"
                strokeDasharray="4 4"
              />
              <circle cx="280" cy="232" r="7" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="1.8" />
              <text x="280" y="236" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
                ×
              </text>

              {/* Center: .gitignore Shield */}
              <rect x="286" y="138" width="114" height="114" rx="12" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.8" />
              <text x="343" y="160" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                .gitignore
              </text>
              <line x1="298" y1="168" x2="388" y2="168" stroke="var(--brand)" strokeOpacity="0.35" />
              <text x="343" y="187" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                .env
              </text>
              <text x="343" y="205" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                data/*.db
              </text>
              <text x="343" y="223" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                .venv/
              </text>
              <text x="343" y="241" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                __pycache__/
              </text>

              {/* Safe output arrow */}
              <line
                x1="401"
                y1="182"
                x2="438"
                y2="182"
                stroke="var(--success)"
                strokeWidth="2.4"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerOk})`}
              />

              {/* Right: Safe Git Commit / Remote */}
              <rect x="444" y="128" width="222" height="134" rx="12" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.75" />
              <text x="458" y="149" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-sans)">
                Git Commit (พร้อม Push)
              </text>
              <text x="458" y="173" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                ✓ src/ticket_ai/cli.py
              </text>
              <text x="458" y="194" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                ✓ pyproject.toml
              </text>
              <text x="458" y="215" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                ✓ .env.example (template)
              </text>
              <rect x="458" y="227" width="194" height="24" rx="6" fill="var(--surface)" stroke="var(--danger)" strokeOpacity="0.6" />
              <text x="555" y="243" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-sans)">
                บล็อก .env และ data/ สำเร็จ
              </text>
            </g>
          )}

          {tab === "layout" && (
            <g>
              {/* Left: Clean src/ Folder Tree */}
              <rect x="14" y="14" width="318" height="247" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.75" />
              <rect x="26" y="24" width="166" height="22" rx="6" fill="var(--brand-soft)" />
              <text x="36" y="39" fontSize="12" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                ticket-ai/  (src layout)
              </text>

              {[
                { y: 66, text: "├── pyproject.toml", note: "deps + scripts", color: "var(--fg)" },
                { y: 88, text: "├── .env.example", note: "safe keys", color: "var(--muted)" },
                { y: 110, text: "├── src/", note: "isolated root", color: "var(--brand-ink)" },
                { y: 132, text: "│   └── ticket_ai/", note: "package", color: "var(--brand-ink)" },
                { y: 154, text: "│       ├── config.py", note: "BaseSettings", color: "var(--cyan)" },
                { y: 176, text: "│       ├── client.py", note: "Async httpx", color: "var(--cyan)" },
                { y: 198, text: "│       ├── models.py", note: "Pydantic v2", color: "var(--cyan)" },
                { y: 220, text: "│       └── cli.py", note: "Typer app", color: "var(--cyan)" },
                { y: 242, text: "└── tests/test_cli.py", note: "pytest 90%", color: "var(--success)" },
              ].map((row) => (
                <g key={row.text}>
                  <text x="28" y={row.y} fontSize="11.5" fontWeight="600" fill={row.color} fontFamily="var(--font-mono)">
                    {row.text}
                  </text>
                  <text x="320" y={row.y} textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
                    {row.note}
                  </text>
                </g>
              ))}

              {/* Animated connector */}
              <line
                x1="333"
                y1="138"
                x2="365"
                y2="138"
                stroke="var(--brand)"
                strokeWidth="2.4"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerBrand})`}
              />

              {/* Right: 3 Benefits of src/ Layout */}
              <g>
                <rect x="372" y="14" width="294" height="75" rx="12" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.5" className={txClass} />
                <text x="386" y="37" fontSize="12.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-sans)">
                  1. กัน Import หลอกในโฟลเดอร์ root
                </text>
                <text x="386" y="57" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  บังคับทดสอบแพ็กเกจที่ติดตั้งจริงผ่าน
                </text>
                <text x="386" y="75" fontSize="11.5" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  uv pip install -e .
                </text>

                <rect x="372" y="100" width="294" height="75" rx="12" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.5" className={txClass} />
                <text x="386" y="123" fontSize="12.5" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-sans)">
                  2. แยกหน้าที่ชัดเจนตามโมดูล
                </text>
                <text x="386" y="143" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                  config · client · models · cli ไม่ปนกัน
                </text>
                <text x="386" y="161" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                  Mock และทดสอบแต่ละชั้นได้อิสระ
                </text>

                <rect x="372" y="186" width="294" height="75" rx="12" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.5" className={txClass} />
                <text x="386" y="209" fontSize="12.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-sans)">
                  3. ผูกคำสั่ง CLI ใน pyproject.toml
                </text>
                <text x="386" y="229" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                  [project.scripts]
                </text>
                <text x="386" y="247" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                  ticket-ai = &quot;ticket_ai.cli:app&quot;
                </text>
              </g>
            </g>
          )}

          {tab === "cli" && (
            <g>
              {/* Top Command Strip */}
              <rect x="14" y="14" width="652" height="58" rx="12" fill="var(--surface)" stroke="var(--brand)" strokeWidth="1.75" />
              <text x="28" y="38" fontSize="12.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                $ ticket-ai run
              </text>
              <rect x="150" y="22" width="112" height="22" rx="6" fill="var(--cyan-soft)" stroke="var(--cyan)" />
              <text x="206" y="37" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-mono)">
                tickets.jsonl
              </text>
              <rect x="270" y="22" width="102" height="22" rx="6" fill="var(--brand-soft)" stroke="var(--brand)" />
              <text x="321" y="37" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                --limit 5
              </text>
              <rect x="380" y="22" width="96" height="22" rx="6" fill="var(--success-soft)" stroke="var(--success)" />
              <text x="428" y="37" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                --use-cache
              </text>
              <text x="28" y="61" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                Typer สร้าง --help อัตโนมัติและตรวจ Type ของทุกอาร์กิวเมนต์ก่อนเข้าฟังก์ชัน
              </text>

              {/* Vertical flow from command bar to Stage 1 */}
              <line
                x1="112"
                y1="72"
                x2="112"
                y2="98"
                stroke="var(--brand)"
                strokeWidth="2.2"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerBrand})`}
              />

              {/* Stage 1: Typed Args */}
              <rect x="14" y="102" width="194" height="159" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
              <text x="28" y="125" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
                1. Typed Args
              </text>
              <line x1="28" y1="135" x2="194" y2="135" stroke="var(--hair)" />
              <text x="28" y="158" fontSize="11.5" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-mono)">
                file: Path
              </text>
              <text x="28" y="180" fontSize="11.5" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                limit: int = 5
              </text>
              <text x="28" y="202" fontSize="11.5" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                use_cache: bool
              </text>
              <rect x="26" y="218" width="170" height="30" rx="7" fill="var(--danger-soft)" stroke="var(--danger)" strokeOpacity="0.5" />
              <text x="111" y="237" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                --limit abc → Exit 2
              </text>

              {/* Arrow 1 -> 2 */}
              <line
                x1="209"
                y1="181"
                x2="239"
                y2="181"
                stroke="var(--brand)"
                strokeWidth="2.4"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerBrand})`}
              />

              {/* Stage 2: Typer + Settings */}
              <rect x="244" y="102" width="192" height="159" rx="12" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.75" />
              <text x="258" y="125" fontSize="12.5" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                2. @app.command()
              </text>
              <line x1="258" y1="135" x2="422" y2="135" stroke="var(--brand)" strokeOpacity="0.35" />
              <text x="258" y="158" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                • โหลด Settings() จาก .env
              </text>
              <text x="258" y="180" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                • รัน asyncio.run(pipeline())
              </text>
              <text x="258" y="202" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
                • แสดง Progress Bar สด
              </text>
              <rect x="256" y="218" width="168" height="30" rx="7" fill="var(--surface)" stroke="var(--brand)" strokeOpacity="0.5" />
              <text x="340" y="237" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                typer.Typer()
              </text>

              {/* Arrow 2 -> 3 */}
              <line
                x1="437"
                y1="181"
                x2="467"
                y2="181"
                stroke="var(--success)"
                strokeWidth="2.4"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerOk})`}
              />

              {/* Stage 3: Output & Exit Code */}
              <rect x="472" y="102" width="194" height="159" rx="12" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.75" />
              <text x="486" y="125" fontSize="12.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                3. CLI Summary
              </text>
              <line x1="486" y1="135" x2="652" y2="135" stroke="var(--success)" strokeOpacity="0.35" />
              <text x="486" y="158" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                valid: 18 · dlq: 2
              </text>
              <text x="486" y="180" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                cache_hit: 12 (60%)
              </text>
              <text x="486" y="202" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                cost: $0.004 · 1.8s
              </text>
              <rect x="484" y="218" width="170" height="30" rx="7" fill="var(--surface)" stroke="var(--success)" />
              <text x="569" y="237" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                Exit Code 0 · OK
              </text>
            </g>
          )}
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. SqlCacheArchVisual (sql-cache-arch)                                     */
/* ========================================================================== */

type CacheMode = "miss" | "hit";

export function SqlCacheArchVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<CacheMode>("hit");
  const [inspectSqli, setInspectSqli] = useState(false);

  const isHit = mode === "hit";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const markerBrand = `${uid}-sql-brand`;
  const markerWarn = `${uid}-sql-warn`;
  const markerCyan = `${uid}-sql-cyan`;
  const markerOk = `${uid}-sql-ok`;

  const captionText = inspectSqli
    ? "Parameterized Query (?): แม้ผู้โจมตีส่งข้อความอันตรายอย่าง \"' OR 1=1; DROP TABLE cache; --\" เข้ามา SQLite จะผูกค่าผ่าน placeholder ? เป็นข้อมูลข้อความธรรมดา ไม่นำไปรันเป็นคำสั่ง SQL จึงกัน SQL Injection ได้ 100%"
    : isHit
      ? "Cache Hit (0ms, $0): แปลง Prompt + Model เป็นคีย์ SHA-256 แล้วค้นเจอใน SQLite ทันที ไม่ต้องยิง HTTP ออกไปที่ LLM API ประหยัดทั้งเวลา (0ms) และค่า API ($0.00)"
      : "Cache Miss (Call API → Save SQLite): ยังไม่พบคีย์ SHA-256 ใน SQLite ระบบจึงเรียก LLM API (~820ms, $0.0012) แล้วบันทึกผลลัพธ์ลงตาราง cache ด้วย parameterized query (?) เพื่อใช้ซ้ำในรอบถัดไป";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="สลับโหมด Cache Miss และ Cache Hit" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!isHit}
            className={!isHit ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={!isHit ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("miss")}
          >
            Cache Miss (Call API → Save SQLite)
          </button>
          <button
            type="button"
            aria-pressed={isHit}
            className={isHit ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={isHit ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setMode("hit")}
          >
            Cache Hit (0ms, $0 via SHA-256 Key)
          </button>
        </div>

        <button
          type="button"
          aria-pressed={inspectSqli}
          className={inspectSqli ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={
            inspectSqli
              ? { borderColor: "var(--success)", background: "var(--success-soft)", color: "var(--success)" }
              : undefined
          }
          onClick={() => setInspectSqli((prev) => !prev)}
        >
          {inspectSqli ? "ทดสอบกัน SQLi (?): เปิด" : "ดูวิธีกัน SQLi (?)"}
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 275"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพสถาปัตยกรรม SQLite Cache แบบ SHA-256 Key และ Parameterized Query กัน SQL Injection"
        >
          <defs>
            <marker id={markerBrand} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerWarn} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
            <marker id={markerCyan} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
            <marker id={markerOk} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Left Card: Request + SHA-256 Hash */}
          <g>
            <rect x="14" y="18" width="166" height="156" rx="12" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
            <text x="97" y="39" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              Prompt Input
            </text>
            <line x1="26" y1="48" x2="168" y2="48" stroke="var(--hair)" />
            <text x="26" y="68" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-mono)">
              model: gpt-4o-mini
            </text>
            <text x="26" y="88" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
              &quot;สรุปตั๋ว #104&quot;
            </text>

            {/* SHA-256 Key box */}
            <rect x="24" y="106" width="146" height="54" rx="8" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.3" />
            <text x="97" y="125" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
              SHA-256 Key
            </text>
            <text x="97" y="146" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              9f86d081...e4b2
            </text>
          </g>

          {/* Lookup Flow: Input -> SQLite */}
          <line
            x1="181"
            y1="82"
            x2="215"
            y2="82"
            stroke="var(--brand)"
            strokeWidth="2.4"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${markerBrand})`}
          />
          <text x="198" y="72" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            GET
          </text>

          {/* Fast Hit Return Arrow: SQLite -> Input */}
          {isHit ? (
            <>
              <line
                x1="219"
                y1="126"
                x2="185"
                y2="126"
                stroke="var(--success)"
                strokeWidth="2.6"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerOk})`}
              />
              <text x="200" y="145" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                0ms
              </text>
            </>
          ) : null}

          {/* Center Card: SQLite Cache */}
          <g>
            <rect
              x="220"
              y="14"
              width="214"
              height="164"
              rx="12"
              fill="var(--surface)"
              stroke={isHit ? "var(--success)" : "var(--warning)"}
              strokeWidth="2"
              className={txClass}
            />
            <text x="327" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
              SQLite (cache.db)
            </text>

            <rect
              x="234"
              y="45"
              width="186"
              height="24"
              rx="12"
              fill={isHit ? "var(--success-soft)" : "var(--warning-soft)"}
              stroke={isHit ? "var(--success)" : "var(--warning)"}
              strokeWidth="1.2"
              className={txClass}
            />
            <text
              x="327"
              y="61"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill={isHit ? "var(--success)" : "var(--warning)"}
              fontFamily="var(--font-mono)"
            >
              {isHit ? "CACHE HIT · พบคีย์ทันที" : "CACHE MISS · ยังไม่มีคีย์"}
            </text>

            {/* Cache Table Rows */}
            <rect
              x="232"
              y="80"
              width="190"
              height="26"
              rx="6"
              fill={isHit ? "var(--success-soft)" : "var(--cyan-soft)"}
              stroke={isHit ? "var(--success)" : "var(--cyan)"}
              strokeWidth="1.2"
              className={txClass}
            />
            <text
              x="240"
              y="97"
              fontSize="11"
              fontWeight="600"
              fill={isHit ? "var(--success)" : "var(--cyan)"}
              fontFamily="var(--font-mono)"
            >
              {isHit ? "9f86d0.. | {\"ok\":true}" : "INSERT 9f86d0.. (new)"}
            </text>

            <rect x="232" y="111" width="190" height="22" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
            <text x="240" y="126" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
              3c91a4.. | {`{"cat":"bug"}`}
            </text>

            {/* Latency & Cost Badge */}
            <text x="236" y="160" fontSize="12" fontWeight="700" fill={isHit ? "var(--success)" : "var(--warning)"} fontFamily="var(--font-mono)">
              {isHit ? "Latency: ~0.4ms" : "Latency: ~820ms"}
            </text>
            <text x="420" y="160" textAnchor="end" fontSize="12" fontWeight="700" fill={isHit ? "var(--success)" : "var(--warning)"} fontFamily="var(--font-mono)">
              {isHit ? "$0.00" : "$0.0012"}
            </text>
          </g>

          {/* Center <-> Right API Flow */}
          {isHit ? (
            <>
              <line x1="435" y1="96" x2="473" y2="96" stroke="var(--hair)" strokeWidth="2" strokeDasharray="4 4" />
              <text x="454" y="86" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
                SKIP
              </text>
            </>
          ) : (
            <>
              <line
                x1="435"
                y1="68"
                x2="471"
                y2="68"
                stroke="var(--warning)"
                strokeWidth="2.4"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerWarn})`}
              />
              <text x="454" y="58" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--warning)" fontFamily="var(--font-mono)">
                API
              </text>

              <line
                x1="475"
                y1="124"
                x2="439"
                y2="124"
                stroke="var(--cyan)"
                strokeWidth="2.4"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
                markerEnd={`url(#${markerCyan})`}
              />
              <text x="455" y="142" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
                SAVE
              </text>
            </>
          )}

          {/* Right Card: External LLM API */}
          <g>
            <rect
              x="476"
              y="18"
              width="190"
              height="156"
              rx="12"
              fill={isHit ? "var(--surface)" : "var(--warning-soft)"}
              stroke={isHit ? "var(--hair)" : "var(--warning)"}
              strokeWidth={isHit ? "1.5" : "1.8"}
              className={txClass}
            />
            <text
              x="571"
              y="39"
              textAnchor="middle"
              fontSize="12.5"
              fontWeight="700"
              fill={isHit ? "var(--muted)" : "var(--warning)"}
              fontFamily="var(--font-mono)"
            >
              External LLM API
            </text>
            <line x1="488" y1="48" x2="654" y2="48" stroke={isHit ? "var(--hair)" : "var(--warning)"} strokeOpacity="0.4" />

            {isHit ? (
              <>
                <rect x="492" y="64" width="158" height="30" rx="8" fill="var(--success-soft)" stroke="var(--success)" />
                <text x="571" y="83" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
                  0 API Calls
                </text>
                <text x="571" y="118" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
                  ข้ามการเรียก Network
                </text>
                <text x="571" y="140" textAnchor="middle" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                  ประหยัดค่าโทเคน 100%
                </text>
              </>
            ) : (
              <>
                <text x="490" y="72" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
                  POST /v1/responses
                </text>
                <text x="490" y="96" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-mono)">
                  HTTP 200 · 420 tok
                </text>
                <text x="490" y="120" fontSize="11.5" fill="var(--warning)" fontWeight="600" fontFamily="var(--font-sans)">
                  รอ API ~820ms + เสียค่าใช้จ่าย
                </text>
                <rect x="490" y="134" width="162" height="26" rx="7" fill="var(--surface)" stroke="var(--cyan)" />
                <text x="571" y="151" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--cyan)" fontFamily="var(--font-sans)">
                  บันทึกลง SQLite ไว้ใช้รอบหน้า
                </text>
              </>
            )}
          </g>

          {/* Bottom Strip: Parameterized (?) Query SQL-Injection Safety Badge */}
          <g
            role="button"
            tabIndex={0}
            aria-label="สลับดูตัวอย่างการป้องกัน SQL Injection ด้วย Parameterized Query"
            aria-pressed={inspectSqli}
            onClick={() => setInspectSqli((prev) => !prev)}
            onKeyDown={(e) => handleSvgKeyDown(e, () => setInspectSqli((prev) => !prev))}
            style={{ cursor: "pointer" }}
          >
            <rect
              x="14"
              y="190"
              width="652"
              height="72"
              rx="12"
              fill="var(--surface)"
              stroke={inspectSqli ? "var(--success)" : "var(--line)"}
              strokeWidth={inspectSqli ? "1.8" : "1.5"}
              className={txClass}
            />

            {/* Parameterized (?) Safety Badge */}
            <rect x="26" y="202" width="174" height="48" rx="8" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="1.4" />
            <text x="113" y="222" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
              Parameterized (?)
            </text>
            <text x="113" y="240" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
              กัน SQL Injection 100%
            </text>

            {/* Query Code Box */}
            <rect x="212" y="202" width="442" height="48" rx="8" fill="var(--surface-2)" stroke="var(--hair)" />
            {inspectSqli ? (
              <>
                <text x="224" y="222" fontSize="11" fontWeight="600" fill="var(--danger)" fontFamily="var(--font-mono)">
                  {`✕ f"... WHERE key='{k}'"`}
                  {"  →  เสี่ยง DROP TABLE"}
                </text>
                <text x="224" y="241" fontSize="11" fontWeight="600" fill="var(--success)" fontFamily="var(--font-mono)">
                  {'✓ execute("... WHERE key = ?", (k,)) → ปลอดภัย'}
                </text>
              </>
            ) : (
              <>
                <text x="224" y="222" fontSize="11.5" fontWeight="600" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
                  {'cur.execute("SELECT val FROM cache WHERE key = ?", (sha,))'}
                </text>
                <text x="224" y="241" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
                  แยกค่าพารามิเตอร์ออกจาก SQL (คลิกแถบนี้เพื่อเทียบ SQLi)
                </text>
              </>
            )}
          </g>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 4. Phase1CapstoneArchVisual (phase1-capstone-arch)                         */
/* ========================================================================== */

interface CapstoneNode {
  id: number;
  btnLabel: string;
  line1: string;
  line2: string;
  blocks: string[];
  blockTag: string;
  fullTitle: string;
  roleDesc: string;
  contractCode: string;
  handoff: string;
  captionDetail: string;
  metricTitle: string;
  metricSub: string;
  tone: "brand" | "cyan" | "warning" | "success";
}

const ALL_PHASE1_BLOCKS = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08"] as const;

const CAPSTONE_NODES: CapstoneNode[] = [
  {
    id: 0,
    btnLabel: "1. CLI + Settings",
    line1: "Typer CLI",
    line2: "+ Settings",
    blocks: ["B02", "B06"],
    blockTag: "B02 · B06",
    fullTitle: "1. Typer CLI + pydantic-settings",
    roleDesc: "รับอาร์กิวเมนต์แบบ Typed และโหลดคีย์จาก .env",
    contractCode: "ticket-ai fetch input.jsonl --limit 5",
    handoff: "จุดเริ่มต้นใน src/ → ส่งคำขอไปชั้น SQLite Cache",
    captionDetail: "รับคำสั่งจากผู้ใช้ ตรวจชนิดอาร์กิวเมนต์อัตโนมัติด้วย Typer และโหลด API key/config ผ่าน pydantic-settings จาก .env โดยไม่ฮาร์ดโค้ดคีย์ในโค้ด",
    metricTitle: "Exit Code 0 / 2",
    metricSub: "แพ็กเกจติดตั้งได้จริง · .env ปลอดภัย",
    tone: "brand",
  },
  {
    id: 1,
    btnLabel: "2. SQLite Cache",
    line1: "SQLite",
    line2: "Cache (?)",
    blocks: ["B07"],
    blockTag: "B07",
    fullTitle: "2. Persistent SQLite Cache",
    roleDesc: "แฮชคำขอเป็น SHA-256 ค้นด้วย Parameterized (?)",
    contractCode: "SELECT payload FROM cache WHERE key = ?",
    handoff: "Hit → ข้าม API ทันที | Miss → ส่งชั้น Async HTTP",
    captionDetail: "แฮชคำขอเป็นคีย์ SHA-256 แล้วค้นหาใน SQLite ด้วย Parameterized Query (?) กัน SQL Injection ถ้า Hit จะคืนผลทันทีใน 0ms/$0 โดยข้ามการยิง API",
    metricTitle: "Hit: 0ms · $0",
    metricSub: "กัน SQLi · ประหยัดค่าโทเคนซ้ำ",
    tone: "cyan",
  },
  {
    id: 2,
    btnLabel: "3. Async + Retry",
    line1: "Async httpx",
    line2: "Sem + Retry",
    blocks: ["B04", "B05"],
    blockTag: "B04 · B05",
    fullTitle: "3. Async httpx + Semaphore + tenacity",
    roleDesc: "ยิงงานขนานพร้อม Timeout, Backoff และ Circuit Breaker",
    contractCode: "async with sem: await retry_fetch(client)",
    handoff: "รับ Cache Miss → เซฟ SQLite แล้วส่งตรวจ Schema",
    captionDetail: "ใช้ httpx.AsyncClient คู่กับ asyncio.Semaphore(5) เร่งความเร็ว ~5x อย่างปลอดภัย พร้อม Timeout และ tenacity Exponential Backoff + Jitter กู้คืนจาก 429/5xx",
    metricTitle: "~5x Faster · กัน 429",
    metricSub: "ไม่ค้างเงียบ · กู้คืน 5xx อัตโนมัติ",
    tone: "warning",
  },
  {
    id: 3,
    btnLabel: "4. Pydantic + DLQ",
    line1: "Pydantic v2",
    line2: "JSONL / DLQ",
    blocks: ["B01", "B02"],
    blockTag: "B01 · B02",
    fullTitle: "4. Pydantic v2 + JSONL / Quarantine",
    roleDesc: "ตรวจ Schema ทุกแถวและคัดแถวพังไป Quarantine",
    contractCode: "valid.jsonl (+18) | quarantine.jsonl (+2)",
    handoff: "สตรีมทีละบรรทัด → ส่งสถิติให้ structlog",
    captionDetail: "บังคับใช้ Data Contract ด้วย Pydantic v2 BaseModel เขียนแถวที่ผ่านลง valid.jsonl และแยกแถวที่เสียหายไป quarantine.jsonl เพื่อให้ทั้ง Pipeline ไม่ล่มกลางคัน",
    metricTitle: "100% Typed Data",
    metricSub: "พังเฉพาะแถวไม่ล่มทั้งงาน · ประหยัดแรม",
    tone: "brand",
  },
  {
    id: 4,
    btnLabel: "5. Logs + pytest",
    line1: "structlog",
    line2: "pytest 90%",
    blocks: ["B02", "B03", "B08"],
    blockTag: "B03 · B08",
    fullTitle: "5. structlog + pytest 90% (Milestone)",
    roleDesc: "บันทึก JSON Logs และทดสอบ Mock ครอบคลุม ≥ 90%",
    contractCode: "pytest --cov=ticket_ai --cov-fail-under=90",
    handoff: "คุมคุณภาพทุกชั้นครบทั้ง 8 บล็อกของ Phase 1",
    captionDetail: "บันทึก Structured JSON Logs ที่ไล่ย้อนรอยง่ายด้วย structlog พร้อมชุดทดสอบ pytest Fixtures/Mocks ครอบคลุมอย่างน้อย 90% และตรวจโค้ดด้วย Ruff ครบทั้ง 8 บล็อกใน Phase 1 Milestone",
    metricTitle: "Coverage ≥ 90%",
    metricSub: "JSON Trace ชัด · พร้อมขึ้น Phase 2",
    tone: "success",
  },
];

function getToneTokens(tone: CapstoneNode["tone"]) {
  switch (tone) {
    case "cyan":
      return { fill: "var(--cyan-soft)", stroke: "var(--cyan)", ink: "var(--cyan)" };
    case "warning":
      return { fill: "var(--warning-soft)", stroke: "var(--warning)", ink: "var(--warning)" };
    case "success":
      return { fill: "var(--success-soft)", stroke: "var(--success)", ink: "var(--success)" };
    default:
      return { fill: "var(--brand-soft)", stroke: "var(--brand)", ink: "var(--brand-ink)" };
  }
}

export function Phase1CapstoneArchVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [selected, setSelected] = useState(0);

  const current = CAPSTONE_NODES[selected];
  const currentTone = getToneTokens(current.tone);
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";

  const nodeCenters = [74, 207, 340, 473, 606];
  const activeCenterX = nodeCenters[selected];

  const markerMain = `${uid}-cap-main`;
  const markerHit = `${uid}-cap-hit`;

  const captionText = `${current.fullTitle} (${current.blocks.join(", ")}): ${current.captionDetail}`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกโหนดสถาปัตยกรรม Phase 1 Milestone" className="flex flex-wrap gap-2">
        {CAPSTONE_NODES.map((node) => {
          const active = node.id === selected;
          return (
            <button
              key={node.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setSelected(node.id)}
            >
              {node.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพสถาปัตยกรรม 5 โหนดของ Phase 1 Capstone ที่เชื่อมทั้ง 8 บล็อกเข้าด้วยกัน"
        >
          <defs>
            <marker id={markerMain} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerHit} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Cache Hit Bypass Arc (Node 2 -> Node 4 skipping Async API) */}
          <path
            d="M 207 34 Q 340 4 473 34"
            fill="none"
            stroke="var(--success)"
            strokeWidth={selected === 1 ? "2.2" : "1.5"}
            strokeDasharray={reduced ? undefined : "5 5"}
            className={flowClass}
            markerEnd={`url(#${markerHit})`}
          />
          <rect x="278" y="4" width="124" height="19" rx="9.5" fill="var(--success-soft)" stroke="var(--success)" strokeOpacity="0.6" />
          <text x="340" y="17" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
            Cache Hit → 0ms
          </text>

          {/* Connecting arrows between the 5 architecture nodes */}
          {[0, 1, 2, 3].map((idx) => {
            const x1 = 16 + idx * 133 + 116;
            const x2 = 16 + (idx + 1) * 133 - 3;
            const highlighted = idx === selected || idx + 1 === selected;
            return (
              <line
                key={idx}
                x1={x1}
                y1="76"
                x2={x2}
                y2="76"
                stroke={highlighted ? "var(--brand)" : "var(--line)"}
                strokeWidth={highlighted ? "2.4" : "1.8"}
                strokeDasharray={reduced ? undefined : "5 5"}
                className={flowClass}
                markerEnd={`url(#${markerMain})`}
              />
            );
          })}

          {/* 5 Clickable Architecture Nodes */}
          {CAPSTONE_NODES.map((node, idx) => {
            const x = 16 + idx * 133;
            const isActive = idx === selected;
            const tone = getToneTokens(node.tone);

            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`ดูรายละเอียด ${node.fullTitle}`}
                aria-pressed={isActive}
                onClick={() => setSelected(node.id)}
                onKeyDown={(e) => handleSvgKeyDown(e, () => setSelected(node.id))}
                style={{ cursor: "pointer" }}
              >
                {isActive && !reduced ? (
                  <rect
                    x={x - 3}
                    y="33"
                    width="122"
                    height="86"
                    rx="14"
                    fill="none"
                    stroke={tone.stroke}
                    strokeWidth="2"
                    className="svg-pulse"
                  />
                ) : null}

                <rect
                  x={x}
                  y="36"
                  width="116"
                  height="80"
                  rx="12"
                  fill={isActive ? tone.fill : "var(--surface)"}
                  stroke={isActive ? tone.stroke : "var(--line)"}
                  strokeWidth={isActive ? "2" : "1.5"}
                  className={txClass}
                />

                {/* Block mapping pill inside node */}
                <rect
                  x={x + 14}
                  y="44"
                  width="88"
                  height="17"
                  rx="8.5"
                  fill={isActive ? "var(--surface)" : tone.fill}
                  stroke={tone.stroke}
                  strokeOpacity="0.45"
                />
                <text
                  x={x + 58}
                  y="56"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={tone.ink}
                  fontFamily="var(--font-mono)"
                >
                  {node.blockTag}
                </text>

                <text
                  x={x + 58}
                  y="81"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill={isActive ? tone.ink : "var(--fg)"}
                  fontFamily="var(--font-mono)"
                >
                  {node.line1}
                </text>
                <text
                  x={x + 58}
                  y="101"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="600"
                  fill="var(--muted)"
                  fontFamily="var(--font-mono)"
                >
                  {node.line2}
                </text>
              </g>
            );
          })}

          {/* Drop Indicator from Active Node to Detail Card */}
          <line
            x1={activeCenterX}
            y1="116"
            x2={activeCenterX}
            y2="140"
            stroke={currentTone.stroke}
            strokeWidth="2"
            strokeDasharray={reduced ? undefined : "5 5"}
            className={flowClass}
          />
          <circle cx={activeCenterX} cy="142" r="4" fill={currentTone.stroke} className={txClass} />

          {/* Bottom Inspector Card + All 8 Phase 1 Block Map */}
          <rect
            x="16"
            y="144"
            width="648"
            height="124"
            rx="12"
            fill="var(--surface)"
            stroke={currentTone.stroke}
            strokeWidth="1.6"
            className={txClass}
          />

          {/* Header: Active node title + 8 Phase 1 block pills */}
          <text x="30" y="167" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            {current.fullTitle}
          </text>

          {/* 8 Phase 1 Block Badges (B01..B08) */}
          {ALL_PHASE1_BLOCKS.map((blockId, idx) => {
            const bx = 382 + idx * 34;
            const activeBlock = current.blocks.includes(blockId);
            return (
              <g key={blockId}>
                <rect
                  x={bx}
                  y="151"
                  width="30"
                  height="21"
                  rx="5"
                  fill={activeBlock ? currentTone.fill : "var(--surface-2)"}
                  stroke={activeBlock ? currentTone.stroke : "var(--hair)"}
                  strokeWidth={activeBlock ? "1.3" : "1"}
                  className={txClass}
                />
                <text
                  x={bx + 15}
                  y="165"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={activeBlock ? "700" : "500"}
                  fill={activeBlock ? currentTone.ink : "var(--muted)"}
                  fontFamily="var(--font-mono)"
                >
                  {blockId}
                </text>
              </g>
            );
          })}

          <line x1="30" y1="180" x2="650" y2="180" stroke="var(--hair)" />

          {/* Left side details */}
          <text x="30" y="200" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
            {current.roleDesc}
          </text>
          <rect x="30" y="210" width="388" height="24" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
          <text x="40" y="226" fontSize="11.5" fontWeight="600" fill={currentTone.ink} fontFamily="var(--font-mono)">
            {current.contractCode}
          </text>
          <text x="30" y="253" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            {current.handoff}
          </text>

          {/* Right side milestone guarantee badge */}
          <rect
            x="432"
            y="192"
            width="218"
            height="64"
            rx="10"
            fill={currentTone.fill}
            stroke={currentTone.stroke}
            strokeOpacity="0.6"
            className={txClass}
          />
          <text
            x="541"
            y="218"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill={currentTone.ink}
            fontFamily="var(--font-mono)"
          >
            {current.metricTitle}
          </text>
          <text
            x="541"
            y="240"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--fg)"
            fontFamily="var(--font-sans)"
          >
            {current.metricSub}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}
