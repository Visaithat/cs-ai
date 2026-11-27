"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";

interface VisualProps {
  reduced?: boolean;
}

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "cyan";

const TONES: Record<Tone, { fill: string; stroke: string; text: string }> = {
  neutral: { fill: "var(--surface)", stroke: "var(--line)", text: "var(--fg)" },
  brand: { fill: "var(--brand-soft)", stroke: "var(--brand)", text: "var(--brand-ink)" },
  success: { fill: "var(--success-soft)", stroke: "var(--success)", text: "var(--fg)" },
  warning: { fill: "var(--warning-soft)", stroke: "var(--warning)", text: "var(--fg)" },
  danger: { fill: "var(--danger-soft)", stroke: "var(--danger)", text: "var(--fg)" },
  cyan: { fill: "var(--cyan-soft)", stroke: "var(--cyan)", text: "var(--fg)" },
};

const ACTIVE_BTN_STYLE: CSSProperties = {
  borderColor: "var(--brand)",
  background: "var(--brand-soft)",
  color: "var(--brand-ink)",
};

function Choice<T extends string | number>({ label, items, value, onChange }: {
  label: string;
  items: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
          className={value === item.id ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={value === item.id ? ACTIVE_BTN_STYLE : undefined}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Diagram({ width, height, label, children, interactive = false }: {
  width: number;
  height: number;
  label: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role={interactive ? "group" : "img"} aria-label={label}>
        {children}
      </svg>
    </div>
  );
}

function SvgLabel({ x, y, children, size = 14, muted = false, bold = false, center = false, mono = false }: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  muted?: boolean;
  bold?: boolean;
  center?: boolean;
  mono?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={bold ? 700 : undefined}
      textAnchor={center ? "middle" : undefined}
      fontFamily={mono ? "var(--font-mono)" : "var(--font-sans)"}
      fill={muted ? "var(--muted)" : "var(--fg)"}
    >
      {children}
    </text>
  );
}

function Node({ x, y, width, title, detail, tone = "neutral", reduced, onSelect, selected, height = 52 }: {
  x: number;
  y: number;
  width: number;
  title: string;
  detail?: string;
  tone?: Tone;
  reduced: boolean;
  onSelect?: () => void;
  selected?: boolean;
  height?: number;
}) {
  const color = TONES[tone];
  return (
    <g
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? [title, detail].filter(Boolean).join(" · ") : undefined}
      aria-pressed={onSelect ? selected : undefined}
      onClick={onSelect}
      onKeyDown={onSelect ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      } : undefined}
      className={onSelect ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" : undefined}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="10"
        fill={color.fill}
        stroke={color.stroke}
        strokeWidth={selected ? 2.5 : 1.25}
        className={reduced ? undefined : "transition-colors duration-300"}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + (detail ? -4 : 5)}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--font-sans)"
        fill={color.text}
      >
        {title}
      </text>
      {detail && <SvgLabel x={x + width / 2} y={y + height / 2 + 15} size={12} muted center>{detail}</SvgLabel>}
    </g>
  );
}

function Flow({ points, tone = "brand", reduced, animated = false }: {
  points: readonly (readonly [number, number])[];
  tone?: Tone;
  reduced: boolean;
  animated?: boolean;
}) {
  const id = useId();
  const color = TONES[tone].stroke;
  return (
    <>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray={animated && !reduced ? "6 6" : undefined}
        markerEnd={`url(#${id})`}
        className={animated && !reduced ? "svg-flow-line" : undefined}
      />
    </>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p aria-live="polite" className="text-sm leading-relaxed text-muted">{children}</p>;
}

function RangeControl({ label, min, max, step = 1, value, display, onChange }: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="min-w-0 rounded-lg border border-hair bg-surface p-3">
      <label htmlFor={id} className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm font-medium">
        {label}
        <span className="font-mono text-brand-ink">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        className="mt-2 block w-full accent-brand"
      />
    </div>
  );
}

/* DockerMultistageVisual (docker-multistage) */

const DOCKER_MODES = [
  { id: "single", label: "Single-stage · COPY โค้ดก่อน" },
  { id: "multi", label: "Multi-stage · แยก deps ก่อน" },
] as const;

const IMAGE_PARTS = [
  { label: "Python", mb: 120, tone: "brand" },
  { label: ".venv", mb: 100, tone: "cyan" },
  { label: "App", mb: 10, tone: "success" },
  { label: "เครื่องมือ build", mb: 390, tone: "warning" },
] as const;

const SINGLE_LAYERS = [
  { title: "uv + Python + build tools", detail: "เครื่องมือ build อยู่ใน image สุดท้าย", rebuild: false },
  { title: "COPY app + lockfiles", detail: "คัดลอกซอร์สก่อนติดตั้ง deps", rebuild: true },
  { title: "uv sync --frozen", detail: "สร้าง .venv หลัง COPY app", rebuild: true },
  { title: "USER non-root · HEALTHCHECK", detail: "ตั้งค่า runtime ใน stage เดิม", rebuild: true },
];

const BUILDER_LAYERS = [
  { title: "FROM uv:…-python3.12-bookworm-slim", detail: "Python และ uv ใน builder stage" },
  { title: "COPY pyproject.toml + uv.lock", detail: "ใช้สองไฟล์นี้เป็น cache key ของ deps" },
  { title: "uv sync --frozen --no-install-project", detail: "สร้าง .venv โดยแยกจากซอร์สแอป" },
];

const RUNTIME_LAYERS = [
  { title: "FROM python:3.12-slim-bookworm", detail: "Python และ distro ตรงกับ builder", rebuild: false },
  { title: "COPY --from=builder .venv", detail: "คง path /app/.venv เดิม", rebuild: false },
  { title: "COPY app", detail: "เพิ่มเฉพาะซอร์สแอป", rebuild: true },
  { title: "USER non-root · HEALTHCHECK", detail: "รันด้วย .venv และ probe /healthz", rebuild: true },
];

function DockerLayer({ y, layer, changed, reduced }: {
  y: number;
  layer: { title: string; detail: string; rebuild?: boolean };
  changed: boolean;
  reduced: boolean;
}) {
  return (
    <>
      <Node
        x={12}
        y={y}
        width={302}
        title={layer.title}
        detail={layer.detail}
        tone={changed ? (layer.rebuild ? "warning" : "success") : "neutral"}
        reduced={reduced}
      />
      <SvgLabel x={364} y={y + 31} size={13} bold center>
        {changed ? (layer.rebuild ? "สร้างใหม่" : "ใช้ cache") : "พร้อม"}
      </SvgLabel>
    </>
  );
}

export function DockerMultistageVisual({ reduced = false }: VisualProps) {
  const [mode, setMode] = useState<"single" | "multi">("multi");
  const [changed, setChanged] = useState(false);
  const multi = mode === "multi";
  const parts: readonly (typeof IMAGE_PARTS)[number][] = multi ? IMAGE_PARTS.slice(0, 3) : IMAGE_PARTS;
  const total = parts.reduce((sum, part) => sum + part.mb, 0);
  const barY = multi ? 500 : 305;

  return (
    <div className="space-y-3">
      <Choice label="เลือกวิธี build Docker image" items={DOCKER_MODES} value={mode} onChange={setMode} />
      <button
        type="button"
        aria-pressed={changed}
        className={changed ? "btn btn-sm" : "btn btn-sm btn-quiet"}
        style={changed ? ACTIVE_BTN_STYLE : undefined}
        onClick={() => setChanged((previous) => !previous)}
      >
        จำลองแก้เฉพาะซอร์สแอป
      </button>
      <Diagram width={420} height={barY + (multi ? 108 : 128)} label={`Docker ${mode} image ขนาดตัวอย่าง ${total} MB`}>
        <SvgLabel x={12} y={20} bold>{multi ? "Builder stage" : "Build และ runtime ใน stage เดียว"}</SvgLabel>
        <SvgLabel x={364} y={20} size={12} muted center>Build รอบถัดไป</SvgLabel>
        {(multi ? BUILDER_LAYERS : SINGLE_LAYERS).map((layer, index) => (
          <DockerLayer key={layer.title} y={32 + index * 62} layer={layer} changed={changed} reduced={reduced} />
        ))}
        {multi && (
          <>
            <Flow points={[[163, 209], [163, 242]]} reduced={reduced} tone="cyan" />
            <SvgLabel x={174} y={232} muted size={12}>ส่งต่อเฉพาะ .venv</SvgLabel>
            <SvgLabel x={12} y={258} bold>Runtime stage</SvgLabel>
            {RUNTIME_LAYERS.map((layer, index) => (
              <DockerLayer key={layer.title} y={270 + index * 56} layer={layer} changed={changed} reduced={reduced} />
            ))}
          </>
        )}
        <SvgLabel x={12} y={barY + 20} bold>Image สุดท้าย (ตัวอย่าง) · {total} MB</SvgLabel>
        <rect x="12" y={barY + 30} width="396" height="18" rx="4" fill="var(--surface)" stroke="var(--line)" />
        {parts.map((part, index) => {
          const before = parts.slice(0, index).reduce((sum, item) => sum + item.mb, 0);
          return (
            <rect
              key={part.label}
              x={12 + before * 396 / 620}
              y={barY + 30}
              width={part.mb * 396 / 620}
              height="18"
              rx="2"
              fill={TONES[part.tone].stroke}
            />
          );
        })}
        <SvgLabel x={12} y={barY + 72} size={13}>Python 120 MB · .venv 100 MB · App 10 MB</SvgLabel>
        {!multi && <SvgLabel x={12} y={barY + 92} size={13}>เครื่องมือ build 390 MB</SvgLabel>}
        <SvgLabel x={12} y={barY + (multi ? 94 : 114)} size={12} muted>สเกลเดียวกัน · 0–620 MB</SvgLabel>
      </Diagram>
      <Caption>
        {multi
          ? "ในตัวอย่าง Multi-stage ขนาดลดจาก 620 เป็น 230 MB (ประมาณ 63%) เมื่อแยกเครื่องมือ build ออก และแยก COPY lockfiles ก่อนซอร์สเพื่อเก็บ cache ของ .venv"
          : "Single-stage แบบ COPY โค้ดก่อนจะรัน uv sync ใหม่เมื่อซอร์สเปลี่ยน Single-stage ที่จัดลำดับ COPY ให้แยก deps ก็ใช้ cache ได้เช่นกัน"}
        {changed && (multi ? " รอบนี้สร้าง COPY app และประมวลผลคำสั่งถัดไปใหม่" : " รอบนี้สร้างใหม่ตั้งแต่ COPY app เป็นต้นไป")}
      </Caption>
    </div>
  );
}

/* ComposeLocalStackVisual (compose-local-stack) */

const COMPOSE_SERVICES = [
  {
    id: "api", title: "api", port: "8000:8000", x: 12, y: 56, start: 2, ready: 3,
    networks: "app-net, trace-net", volume: "—", probe: "GET /readyz",
    env: ["DATABASE_URL → postgres:5432/app", "LANGFUSE_BASE_URL=http://langfuse:3000", "LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY"],
    dependency: "รอ postgres Healthy ส่วนการส่ง traces ทำภายหลังโดยแยกจาก readiness ของ API",
  },
  {
    id: "postgres", title: "Postgres + pgvector", port: "5432 ภายใน", x: 12, y: 198, start: 0, ready: 2,
    networks: "app-net", volume: "pgdata", probe: "pg_isready (ตรวจว่า Postgres รับการเชื่อมต่อได้)",
    env: ["POSTGRES_DB=app", "POSTGRES_USER=app", "POSTGRES_PASSWORD_FILE=/run/secrets/app_db_password"],
    dependency: "เปิด extension vector ผ่าน init หรือ migration ก่อนให้ API ใช้ตาราง embeddings",
  },
  {
    id: "langfuse", title: "Langfuse Web", port: "3000:3000", x: 220, y: 56, start: 3, ready: 4,
    networks: "trace-net", volume: "—", probe: "GET /api/public/health",
    env: ["NEXTAUTH_URL=http://localhost:3000", "DATABASE_URL → langfuse-db:5432/langfuse", "REDIS_HOST, CLICKHOUSE_URL, ตัวแปร S3"],
    dependency: "Web และ Worker รอ Postgres, ClickHouse, Redis และ object storage พร้อมใช้",
  },
  {
    id: "langfuse-db", title: "Langfuse DB", port: "5432 ภายใน", x: 220, y: 198, start: 0, ready: 2,
    networks: "trace-net", volume: "langfuse_pgdata", probe: "pg_isready",
    env: ["POSTGRES_DB=langfuse", "POSTGRES_USER=langfuse", "POSTGRES_PASSWORD_FILE=/run/secrets/trace_db_password"],
    dependency: "Postgres ตัวนี้เก็บ metadata ของ Langfuse แยกจากฐาน pgvector ของแอป",
  },
  {
    id: "storage", title: "Trace storage", port: "ClickHouse / Redis / S3", x: 220, y: 282, start: 0, ready: 3,
    networks: "trace-net", volume: "clickhouse_data, redis_data, object_data",
    probe: "ClickHouse /ping · Redis PING · object storage readiness",
    env: ["CLICKHOUSE_DB=default", "REDIS_AUTH จาก local secret", "MINIO_ROOT_USER, MINIO_ROOT_PASSWORD จาก local secrets"],
    dependency: "กล่องนี้รวมสามบริการที่ Compose ตรวจสุขภาพแยกกัน และเตรียม S3 bucket ก่อน ingestion",
  },
  {
    id: "worker", title: "Langfuse Worker", port: "3030 ภายใน", x: 220, y: 366, start: 3, ready: 4,
    networks: "trace-net", volume: "—", probe: "GET /api/health บน worker",
    env: ["PORT=3030", "DATABASE_URL → langfuse-db:5432/langfuse", "REDIS_HOST, CLICKHOUSE_URL, ตัวแปร S3"],
    dependency: "อ่านงานจากคิวและข้อมูลใน object storage แล้วนำ trace เข้า ClickHouse",
  },
] as const;

const COMPOSE_STEPS = [
  "เริ่ม Postgres ทั้งสองตัวและชุดจัดเก็บ traces พร้อมกัน",
  "ตรวจ health probes ของฐานข้อมูลและ trace storage",
  "Postgres พร้อมแล้ว เริ่ม API ขณะรอ trace storage",
  "API และ trace storage พร้อมแล้ว เริ่ม Langfuse Web และ Worker",
  "ทุกบริการพร้อม API ส่ง traces ไปยัง Langfuse Web ได้",
] as const;

function composeHealth(phase: number, service: (typeof COMPOSE_SERVICES)[number]) {
  if (phase < service.start) return { label: "รอ dependency", tone: "neutral" } as const;
  if (phase < service.ready) return { label: "กำลังเริ่ม", tone: "warning" } as const;
  return { label: "Healthy", tone: "success" } as const;
}

export function ComposeLocalStackVisual({ reduced = false }: VisualProps) {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<(typeof COMPOSE_SERVICES)[number]["id"]>("api");
  const last = COMPOSE_STEPS.length - 1;
  const service = COMPOSE_SERVICES.find((item) => item.id === active) ?? COMPOSE_SERVICES[0];
  const health = composeHealth(phase, service);
  const running = playing && !reduced && phase < last;

  useEffect(() => {
    if (!running) return;
    const timeout = window.setTimeout(() => {
      setPhase(phase + 1);
      if (phase + 1 === last) setPlaying(false);
    }, 850);
    return () => window.clearTimeout(timeout);
  }, [last, phase, running]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="ควบคุมการเริ่มบริการ Compose">
        {!reduced && (
          <button type="button" className="btn btn-sm" onClick={() => {
            if (phase === last) setPhase(0);
            setPlaying(!running);
          }}>
            {running ? "หยุดชั่วคราว" : phase === last ? "เล่นซ้ำ" : "เล่นลำดับเริ่มบริการ"}
          </button>
        )}
        <button
          type="button"
          className="btn btn-sm btn-quiet"
          disabled={phase === last}
          onClick={() => { setPlaying(false); setPhase(phase + 1); }}
        >
          ขั้นถัดไป
        </button>
        <button
          type="button"
          className="btn btn-sm btn-quiet"
          onClick={() => { setPlaying(false); setPhase(0); }}
        >
          เริ่มใหม่
        </button>
      </div>
      <Diagram width={420} height={448} label="แผนผัง Docker Compose เลือกบริการเพื่อดู health, ports, volumes และ environment" interactive>
        <rect x="4" y="26" width="200" height="252" rx="12" fill="none" stroke="var(--brand)" strokeDasharray="4 5" />
        <rect x="212" y="26" width="204" height="414" rx="12" fill="none" stroke="var(--cyan)" strokeDasharray="4 5" />
        <SvgLabel x={14} y={47} size={13} mono bold>app-net</SvgLabel>
        <SvgLabel x={222} y={47} size={13} mono bold>trace-net</SvgLabel>
        <Flow points={[[104, 198], [104, 124]]} tone={phase >= 2 ? "success" : "neutral"} reduced={reduced} animated={running && phase === 2} />
        <Flow points={[[196, 91], [220, 91]]} tone={phase === last ? "cyan" : "neutral"} reduced={reduced} animated={running && phase === last - 1} />
        <Flow points={[[312, 198], [312, 124]]} tone={phase >= 3 ? "success" : "neutral"} reduced={reduced} animated={running && phase === 3} />
        <Flow points={[[404, 316], [410, 316], [410, 110], [404, 110]]} tone={phase >= 3 ? "success" : "neutral"} reduced={reduced} />
        <Flow points={[[312, 350], [312, 366]]} tone={phase >= 3 ? "success" : "neutral"} reduced={reduced} />
        <Flow points={[[220, 232], [215, 232], [215, 400], [220, 400]]} tone={phase >= 3 ? "success" : "neutral"} reduced={reduced} />
        <SvgLabel x={105} y={157} size={12} bold center>depends_on</SvgLabel>
        <SvgLabel x={105} y={175} size={12} center>service_healthy</SvgLabel>
        <SvgLabel x={314} y={157} size={12} bold center>depends_on</SvgLabel>
        <SvgLabel x={314} y={175} size={12} center>service_healthy</SvgLabel>
        {COMPOSE_SERVICES.map((item) => {
          const state = composeHealth(phase, item);
          return (
            <Node
              key={item.id}
              x={item.x}
              y={item.y}
              width={184}
              height={68}
              title={item.title}
              detail={state.label}
              tone={state.tone}
              reduced={reduced}
              selected={item.id === active}
              onSelect={() => setActive(item.id)}
            />
          );
        })}
        <SvgLabel x={14} y={307} size={12} muted>api อยู่ทั้งสอง network</SvgLabel>
        <SvgLabel x={14} y={327} size={12} muted>host:container คือ port mapping</SvgLabel>
      </Diagram>
      <Caption>ขั้น {phase + 1}/{COMPOSE_STEPS.length} · {COMPOSE_STEPS[phase]}</Caption>
      <div className="rounded-xl border border-hair bg-surface p-3 text-sm" aria-live="polite">
        <p className="font-semibold">{service.title} · {health.label}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted">
          <dt>Healthcheck</dt><dd>{service.probe}</dd>
          <dt>Network</dt><dd>{service.networks}</dd>
          <dt>Port</dt><dd>{service.port}</dd>
          <dt>Volume</dt><dd className="break-words">{service.volume}</dd>
          <dt>Environment</dt>
          <dd className="min-w-0">
            <ul>{service.env.map((variable) => <li key={variable} className="break-words font-mono text-xs">{variable}</li>)}</ul>
          </dd>
        </dl>
        <p className="mt-2 text-muted">{service.dependency}</p>
      </div>
    </div>
  );
}

/* CloudDeployHealthVisual (cloud-deploy-health) */

const DEPLOY_STAGES = [
  { title: "Build", detail: "สร้าง OCI image", description: "Build image จาก Dockerfile แล้วติด tag ตาม commit" },
  { title: "Push registry", detail: "ตรึง image digest", description: "Push ไป registry แล้วใช้ digest เดียวกันสำหรับ candidate และ production" },
  { title: "Deploy candidate", detail: "เริ่มรัน · ยังไม่รับ traffic", description: "เริ่ม candidate แยกจาก traffic ปัจจุบัน และฉีด secrets ตอน runtime" },
  { title: "ตรวจ health", detail: "/healthz + /readyz", description: "ตรวจลิงก์ DB และ model endpoint ของ candidate ก่อนสลับ traffic" },
  { title: "Traffic shift", detail: "ขั้น promote", description: "สลับ traffic เมื่อ candidate พร้อม ตัวอย่างนี้สลับ 100% ในขั้นเดียว" },
];

const READINESS_CASES = [
  { id: "ready", label: "DB + Model พร้อม" },
  { id: "db", label: "DB ติดต่อไม่ได้" },
  { id: "model", label: "Model ติดต่อไม่ได้" },
] as const;

export function CloudDeployHealthVisual({ reduced = false }: VisualProps) {
  const [platform, setPlatform] = useState<"run" | "fly">("run");
  const [readiness, setReadiness] = useState<(typeof READINESS_CASES)[number]["id"]>("ready");
  const [stage, setStage] = useState(4);
  const checked = stage >= 3;
  const ready = readiness === "ready";
  const shifted = stage === 4 && ready;
  const candidate = platform === "run" ? "Revision ใหม่" : "Machine รุ่นใหม่";
  const old = platform === "run" ? "Revision เดิม" : "Machine รุ่นเดิม";
  const platformDetail = platform === "run"
    ? "Cloud Run · Deploy revision แบบ no traffic แล้วให้ pipeline ตรวจ /readyz ก่อน promote และตั้ง startup probe ให้ครอบคลุมความพร้อม"
    : "Fly.io · ใช้ candidate ผ่านกลยุทธ์ bluegreen และ service HTTP check ที่ /readyz เพื่อรอ Machine ใหม่ก่อนเปลี่ยนเส้นทาง";

  return (
    <div className="space-y-3">
      <Choice
        label="เลือกแพลตฟอร์ม deploy"
        items={[{ id: "run", label: "Cloud Run" }, { id: "fly", label: "Fly.io" }]}
        value={platform}
        onChange={setPlatform}
      />
      <Choice label="จำลองความพร้อมของ dependency" items={READINESS_CASES} value={readiness} onChange={setReadiness} />
      <div className="flex flex-wrap gap-2" role="group" aria-label="ควบคุมขั้นตอน deploy">
        <button type="button" className="btn btn-sm btn-quiet" onClick={() => setStage(0)}>เริ่ม deploy ใหม่</button>
        <button type="button" className="btn btn-sm" disabled={stage === 4} onClick={() => setStage(stage + 1)}>ขั้นถัดไป</button>
      </div>
      <Diagram width={420} height={448} label={`ขั้นตอน deploy และ health checks · ${old} ${shifted ? 0 : 100}% · ${candidate} ${shifted ? 100 : 0}%`}>
        {DEPLOY_STAGES.map((item, index) => {
          const y = 10 + index * 68;
          const failed = index >= 3 && !ready;
          return (
            <g key={item.title}>
              {index > 0 && (
                <Flow points={[[102, y - 16], [102, y]]} tone={index <= stage ? "brand" : "neutral"} reduced={reduced} />
              )}
              <Node
                x={6}
                y={y}
                width={192}
                title={item.title}
                detail={index === 4 && stage === 4 && !ready ? "ระงับการสลับ" : item.detail}
                tone={index > stage ? "neutral" : failed ? "danger" : index === stage ? "brand" : "success"}
                reduced={reduced}
              />
            </g>
          );
        })}
        <Flow points={[[236, 172], [198, 172]]} tone={stage >= 2 ? "cyan" : "neutral"} reduced={reduced} />
        <Node x={236} y={146} width={178} title={platform === "run" ? "Secret Manager" : "Fly Secrets"} detail="ฉีดตอน runtime" tone={stage >= 2 ? "cyan" : "neutral"} reduced={reduced} />
        <Flow points={[[198, 240], [218, 240], [218, 228], [236, 228]]} tone={checked ? "success" : "neutral"} reduced={reduced} />
        <Flow points={[[198, 240], [218, 240], [218, 290], [236, 290]]} tone={checked ? ready ? "success" : "danger" : "neutral"} reduced={reduced} />
        <Node x={236} y={202} width={178} title="/healthz" detail={checked ? "200 · process ยังตอบ" : "Liveness · รอตรวจ"} tone={checked ? "success" : "neutral"} reduced={reduced} />
        <Node x={236} y={264} width={178} title="/readyz" detail={checked ? ready ? "200 · DB + model พร้อม" : `503 · ${readiness === "db" ? "DB" : "model"} ล้มเหลว` : "Readiness · รอตรวจ"} tone={checked ? ready ? "success" : "danger" : "neutral"} reduced={reduced} />
        <Flow points={[[102, 334], [102, 364], [108, 364], [108, 382]]} reduced={reduced} tone={shifted ? "neutral" : "brand"} animated={!shifted} />
        <Flow points={[[102, 364], [311, 364], [311, 382]]} reduced={reduced} tone={shifted ? "success" : "neutral"} animated={shifted} />
        <Node x={6} y={382} width={195} title={old} detail={`${shifted ? 0 : 100}% traffic`} tone={shifted ? "neutral" : "brand"} reduced={reduced} />
        <Node x={213} y={382} width={201} title={candidate} detail={`${shifted ? 100 : 0}% traffic`} tone={shifted ? "success" : checked && !ready ? "danger" : "neutral"} reduced={reduced} />
      </Diagram>
      <Caption>
        ขั้น {stage + 1}/{DEPLOY_STAGES.length} · {stage === 4 && !ready
          ? "Readiness ไม่ผ่าน จึงคง traffic 100% ไว้ที่รุ่นเดิม แม้ process ยังตอบ /healthz ได้"
          : DEPLOY_STAGES[stage].description}
      </Caption>
      <p className="text-sm leading-relaxed text-muted">{platformDetail} เก็บ secrets ในบริการจัดการ secrets และส่งให้ container เมื่อเริ่มรัน เพื่อให้ OCI image ใช้ซ้ำได้โดยไม่มีค่าลับฝังอยู่</p>
    </div>
  );
}

/* VllmPagedAttentionVisual (vllm-paged-attention) */

const KV_BLOCK_SIZE = 4;
const KV_SLOTS = 8;

const BATCH_TICKS = [
  {
    requests: [{ id: "A", tokens: 5, pages: [0, 5] }, { id: "B", tokens: 3, pages: [2] }],
    event: "A และ B อยู่ใน batch · C รอคิว",
  },
  {
    requests: [{ id: "A", tokens: 7, pages: [0, 5] }, { id: "C", tokens: 2, pages: [2] }],
    event: "B จบ → C ใช้พื้นที่ที่ B คืน ขณะที่ A ยังทำงาน",
  },
  {
    requests: [{ id: "D", tokens: 4, pages: [0] }, { id: "C", tokens: 5, pages: [2, 6] }],
    event: "A จบ → D ใช้พื้นที่ที่ A คืน ขณะที่ C โตจาก 2 เป็น 5 tokens",
  },
] as const;

const PRECISIONS = [
  { id: 16, label: "FP16" },
  { id: 8, label: "INT8" },
  { id: 4, label: "INT4" },
] as const;

function KvPage({ index, owner, used, tone }: { index: number; owner?: string; used: number; tone: Tone }) {
  const x = 10 + (index % 4) * 102;
  const y = 154 + Math.floor(index / 4) * 76;
  return (
    <g>
      <rect x={x} y={y} width="94" height="64" rx="9" fill={TONES[tone].fill} stroke={TONES[tone].stroke} />
      <SvgLabel x={x + 47} y={y + 24} size={13} center mono>
        {owner ? `P${index} · ${owner}` : `P${index} · ว่าง`}
      </SvgLabel>
      {Array.from({ length: KV_BLOCK_SIZE }, (_, token) => (
        <rect
          key={token}
          x={x + 9 + token * 20}
          y={y + 36}
          width="16"
          height="15"
          rx="3"
          fill={token < used ? TONES[tone].stroke : owner ? "var(--warning-soft)" : "var(--surface-2)"}
          stroke={owner && token >= used ? "var(--warning)" : "var(--line)"}
        />
      ))}
    </g>
  );
}

export function VllmPagedAttentionVisual({ reduced = false }: VisualProps) {
  const [layout, setLayout] = useState<"paged" | "contiguous">("paged");
  const [tick, setTick] = useState(0);
  const [bits, setBits] = useState<16 | 8 | 4>(16);
  const paged = layout === "paged";
  const batch = BATCH_TICKS[tick];
  const requests = batch.requests.map<{ id: string; tokens: number; pages: readonly number[]; tone: Tone }>((request, index) => ({
    id: request.id,
    tokens: request.tokens,
    pages: paged ? request.pages : [index * 2, index * 2 + 1],
    tone: index === 0 ? "brand" : "cyan",
  }));
  const pages = Array.from({ length: KV_SLOTS }, (_, index) => {
    const request = requests.find((item) => item.pages.includes(index));
    const offset = request ? request.pages.indexOf(index) * KV_BLOCK_SIZE : 0;
    return {
      owner: request?.id,
      used: request ? Math.min(KV_BLOCK_SIZE, Math.max(0, request.tokens - offset)) : 0,
      tone: request?.tone ?? "neutral",
    } satisfies { owner?: string; used: number; tone: Tone };
  });
  const used = requests.reduce((sum, request) => sum + request.tokens, 0);
  const allocated = requests.reduce((sum, request) => sum + request.pages.length * KV_BLOCK_SIZE, 0);
  const waste = (allocated - used) / allocated * 100;
  const weightGb = 8 * bits / 8;

  return (
    <div className="space-y-3">
      <Choice
        label="เปรียบเทียบวิธีจอง GPU memory สำหรับ KV cache"
        items={[{ id: "paged", label: "PagedAttention" }, { id: "contiguous", label: "จองแบบ contiguous" }]}
        value={layout}
        onChange={setLayout}
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label="เลื่อน snapshot ของ continuous batching">
        <button type="button" className="btn btn-sm btn-quiet" disabled={tick === 0} onClick={() => setTick(tick - 1)}>รอบก่อน</button>
        <button type="button" className="btn btn-sm" onClick={() => setTick((tick + 1) % BATCH_TICKS.length)}>
          {tick === BATCH_TICKS.length - 1 ? "เริ่ม batch ใหม่" : "เดิน batch รอบถัดไป"}
        </button>
      </div>
      <Diagram width={420} height={358} label={`GPU KV cache · ใช้ ${used} จาก ${allocated} ช่องที่จอง · เสียพื้นที่ ${waste.toFixed(1)}%`}>
        <SvgLabel x={10} y={21} bold>รอบ {tick + 1}/{BATCH_TICKS.length} · Logical block → Physical page</SvgLabel>
        {requests.map((request, index) => {
          const x = 10 + index * 204;
          return (
            <g key={request.id}>
              <Node
                x={x}
                y={34}
                width={196}
                title={`Request ${request.id} · ${request.tokens} tokens`}
                detail={request.pages.map((page, block) => (
                  block * KV_BLOCK_SIZE < request.tokens ? `B${block} → P${page}` : `จอง P${page}`
                )).join("   ")}
                tone={request.tone}
                reduced={reduced}
              />
              <Flow points={[[x + 98, 86], [x + 98, 116]]} tone={request.tone} reduced={reduced} />
            </g>
          );
        })}
        <SvgLabel x={10} y={139} bold>GPU memory · 4 ช่อง token ต่อ page</SvgLabel>
        {pages.map((page, index) => <KvPage key={index} index={index} {...page} />)}
        <SvgLabel x={10} y={310} size={14} bold>ใช้ {used}/{allocated} ช่องที่จอง · เสียพื้นที่ {waste.toFixed(1)}%</SvgLabel>
        <SvgLabel x={10} y={333} size={13} muted>ช่องจองแต่ยังว่าง {allocated - used} · ยังไม่จอง {KV_SLOTS * KV_BLOCK_SIZE - allocated}</SvgLabel>
        <SvgLabel x={10} y={351} size={11} muted>สาธิต padding ภายในพื้นที่จอง โดยใช้ 4 tokens ต่อ block</SvgLabel>
      </Diagram>
      <Caption>
        {batch.event}. {paged
          ? "PagedAttention จอง block เมื่อจำเป็นและเก็บ block ของ request เดียวกันคนละตำแหน่งได้"
          : "ตัวอย่าง contiguous จอง 8 ช่องติดกันต่อ request ล่วงหน้า จึงรวมช่องที่ยังไม่ได้ใช้ไว้ในพื้นที่จองด้วย"}
      </Caption>
      <Choice label="เลือกความละเอียดของ model weights" items={PRECISIONS} value={bits} onChange={setBits} />
      <div className="rounded-lg border border-hair bg-surface p-3 text-sm" aria-live="polite">
        <p className="font-semibold">8B parameters · weights ≈ {weightGb} GB ({bits} bits/parameter)</p>
        <div className="my-2 h-2 rounded-full bg-surface2" aria-hidden="true">
          <div
            className={reduced ? "h-full rounded-full bg-brand" : "h-full rounded-full bg-brand transition-[width] duration-300"}
            style={{ width: `${bits / 16 * 100}%` }}
          />
        </div>
        <p className="text-muted">คิดแบบ 8 พันล้าน × ({bits} ÷ 8) bytes ไม่รวม KV cache, metadata และ runtime overhead</p>
      </div>
    </div>
  );
}

/* SemanticCacheTieringVisual (semantic-cache-tiering) */

const CACHE_CASES = [
  { id: "faq", label: "FAQ เดิม", query: "เปลี่ยนที่อยู่จัดส่งทางไหน", score: 97, equivalent: true, allowed: true, tier: "small", count: 360 },
  { id: "policy", label: "คำคล้าย แต่คนละเงื่อนไข", query: "เปลี่ยนที่อยู่หลังจัดส่งแล้วได้ไหม", score: 89, equivalent: false, allowed: true, tier: "small", count: 140 },
  { id: "acl", label: "Cache คนละสิทธิ์", query: "เงื่อนไขสัญญาของทีมอื่นคืออะไร", score: 98, equivalent: false, allowed: false, tier: "strong", count: 100 },
  { id: "complex", label: "คำถามซับซ้อน", query: "เทียบนโยบายหลายฉบับตามช่วงเวลา", score: 78, equivalent: false, allowed: true, tier: "strong", count: 400 },
] as const;

const CACHE_COST = { lookup: 0.002, small: 0.02, strong: 0.10 } as const;
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rate = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 });

function cacheOutcome(item: (typeof CACHE_CASES)[number], threshold: number) {
  if (item.allowed && item.score >= threshold) return item.equivalent ? "hit" : "false-hit";
  return item.tier;
}

export function SemanticCacheTieringVisual({ reduced = false }: VisualProps) {
  const [threshold, setThreshold] = useState(94);
  const [example, setExample] = useState<(typeof CACHE_CASES)[number]["id"]>("faq");
  const selected = CACHE_CASES.find((item) => item.id === example) ?? CACHE_CASES[0];
  const outcome = cacheOutcome(selected, threshold);
  const hit = outcome === "hit" || outcome === "false-hit";
  const stats = { hit: 0, "false-hit": 0, small: 0, strong: 0 };
  for (const item of CACHE_CASES) {
    stats[cacheOutcome(item, threshold)] += item.count;
  }
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  const cost = total * CACHE_COST.lookup + stats.small * CACHE_COST.small + stats.strong * CACHE_COST.strong;
  const hits = stats.hit + stats["false-hit"];
  const hitRate = hits / total * 100;
  const falseHitRate = hits ? `${decimal.format(stats["false-hit"] / hits * 100)}% ของ hits` : "ไม่มี hit";
  const selectedCost = CACHE_COST.lookup + (outcome === "small" || outcome === "strong" ? CACHE_COST[outcome] : 0);
  const result = {
    hit: "Hit · คืนคำตอบเดิม",
    "false-hit": "False hit · คืนคำตอบผิดบริบท",
    small: "Miss · ส่งไป Small model",
    strong: "Miss · ส่งไป Strong model",
  }[outcome];
  const hitTone = outcome === "false-hit" ? "danger" : "success";

  return (
    <div className="space-y-3">
      <Choice label="เลือกคำถามตัวอย่างสำหรับ semantic cache" items={CACHE_CASES} value={example} onChange={setExample} />
      <RangeControl
        label="Similarity threshold"
        min={80}
        max={98}
        value={threshold}
        display={(threshold / 100).toFixed(2)}
        onChange={setThreshold}
      />
      <Diagram width={420} height={334} label={`เส้นทางคำถาม ${selected.query} · ${result}`}>
        <SvgLabel x={10} y={21} size={15} bold>Request · {selected.query}</SvgLabel>
        <Node x={10} y={32} width={188} title="Normalize" detail="จัดรูปข้อความให้สม่ำเสมอ" tone="brand" reduced={reduced} />
        <Node x={222} y={32} width={188} title="Embed" detail="แปลงคำถามเป็น vector" tone="brand" reduced={reduced} />
        <Flow points={[[198, 58], [222, 58]]} reduced={reduced} />
        <Flow points={[[316, 84], [316, 104], [210, 104], [210, 117]]} reduced={reduced} />
        <Node
          x={62}
          y={117}
          width={296}
          title="Similarity lookup · tenant + ACL key"
          detail={selected.allowed ? `Cosine ${(selected.score / 100).toFixed(2)} · threshold ${(threshold / 100).toFixed(2)}` : "ตัด candidate คนละสิทธิ์ก่อนเทียบ score"}
          tone={selected.allowed ? "brand" : "warning"}
          reduced={reduced}
        />
        <Flow points={[[210, 169], [210, 185], [102, 185], [102, 202]]} tone={hit ? hitTone : "neutral"} reduced={reduced} />
        <Flow points={[[210, 185], [314, 185], [314, 202]]} tone={hit ? "neutral" : "brand"} reduced={reduced} />
        <Node x={10} y={202} width={184} title="คืน cached answer" detail={outcome === "false-hit" ? "False hit" : "Hit"} tone={hit ? hitTone : "neutral"} reduced={reduced} />
        <Node x={222} y={202} width={188} title="Tier router" detail="Miss → แบ่งตามความยาก" tone={hit ? "neutral" : "brand"} reduced={reduced} />
        <Flow points={[[316, 254], [316, 268], [102, 268], [102, 280]]} tone={outcome === "small" ? "cyan" : "neutral"} reduced={reduced} />
        <Flow points={[[316, 254], [316, 280]]} tone={outcome === "strong" ? "cyan" : "neutral"} reduced={reduced} />
        <Node x={10} y={280} width={184} height={46} title="Small model" tone={outcome === "small" ? "cyan" : "neutral"} reduced={reduced} />
        <Node x={222} y={280} width={188} height={46} title="Strong model" tone={outcome === "strong" ? "cyan" : "neutral"} reduced={reduced} />
      </Diagram>
      <Caption>
        {selected.query} · {result}. {selected.allowed
          ? "คะแนน cosine สูงขึ้นเมื่อคำถามคล้ายกัน แต่เงื่อนไขสำคัญอาจต่างกัน"
          : "รายการนอก tenant/ACL ถูกตัดออก แม้จะมี cosine สมมติ 0.98"}
      </Caption>
      <div className="rounded-xl border border-hair bg-surface p-3 text-sm" aria-live="polite">
        <p className="font-semibold">฿{money.format(cost)} ต่อ {decimal.format(total)} requests ตัวอย่าง</p>
        <p className="mt-1 text-muted">
          Hit rate {decimal.format(hitRate)}% · Hit ถูก {stats.hit} · False hit {stats["false-hit"]} ({falseHitRate}) · Small {stats.small} · Strong {stats.strong}
        </p>
        <p className="mt-1 text-muted">
          {selected.label} · ฿{selectedCost.toFixed(3)} / request
        </p>
        <p className="mt-1 text-muted">
          สมมติค่าค้น cache ฿0.002 ทุก request แล้วบวก ฿0.02 ต่อ Small miss หรือ ฿0.10 ต่อ Strong miss
        </p>
      </div>
    </div>
  );
}

/* CapacityCostCalcVisual (capacity-cost-calc) */

const CAPACITY_DEFAULTS = {
  users: 1000,
  requests: 20,
  input: 1000,
  output: 350,
  inputPrice: 35,
  outputPrice: 140,
  hit: 30,
  peak: 10,
};

const CAPACITY_CONTROLS: readonly {
  id: keyof typeof CAPACITY_DEFAULTS;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}[] = [
  { id: "users", label: "ผู้ใช้ที่ใช้งานต่อวัน", min: 100, max: 100000, step: 100, unit: " คน" },
  { id: "requests", label: "Requests ต่อคนต่อวัน", min: 1, max: 100, step: 1, unit: "" },
  { id: "input", label: "Input ต่อ cache miss", min: 100, max: 8000, step: 50, unit: " tokens" },
  { id: "output", label: "Output ต่อ cache miss", min: 50, max: 4000, step: 50, unit: " tokens" },
  { id: "inputPrice", label: "ราคา input / 1M tokens", min: 0, max: 500, step: 5, unit: " ฿" },
  { id: "outputPrice", label: "ราคา output / 1M tokens", min: 0, max: 2000, step: 5, unit: " ฿" },
  { id: "hit", label: "Cache hit rate", min: 0, max: 100, step: 1, unit: "%" },
  { id: "peak", label: "ตัวคูณ peak เทียบค่าเฉลี่ย", min: 1, max: 30, step: 1, unit: "×" },
];

const DAYS_PER_MONTH = 30;
const SECONDS_PER_DAY = 24 * 60 * 60;
const CACHE_LATENCY_SECONDS = 0.2;
const MODEL_LATENCY_SECONDS = 2;

export function CapacityCostCalcVisual({ reduced = false }: VisualProps) {
  const [settings, setSettings] = useState(CAPACITY_DEFAULTS);
  const dailyRequests = settings.users * settings.requests;
  const monthlyRequests = dailyRequests * DAYS_PER_MONTH;
  const hitFraction = settings.hit / 100;
  const missFraction = (100 - settings.hit) / 100;
  const inputCostPerMiss = settings.input * settings.inputPrice / 1_000_000;
  const outputCostPerMiss = settings.output * settings.outputPrice / 1_000_000;
  const uncachedMonthlyCost = monthlyRequests * (inputCostPerMiss + outputCostPerMiss);
  const monthlyCost = uncachedMonthlyCost * missFraction;
  const perUser = monthlyCost / settings.users;
  const peakRps = dailyRequests / SECONDS_PER_DAY * settings.peak;
  const peakModelRps = peakRps * missFraction;
  const averageW = hitFraction * CACHE_LATENCY_SECONDS + missFraction * MODEL_LATENCY_SECONDS;
  const concurrency = peakRps * averageW;
  const modelConcurrency = peakModelRps * MODEL_LATENCY_SECONDS;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="ปรับสมมติฐานปริมาณงานและราคา" className="grid gap-2 sm:grid-cols-2">
        {CAPACITY_CONTROLS.map((control) => (
          <RangeControl
            key={control.id}
            label={control.label}
            min={control.min}
            max={control.max}
            step={control.step}
            value={settings[control.id]}
            display={`${decimal.format(settings[control.id])}${control.unit}`}
            onChange={(value) => setSettings((previous) => ({ ...previous, [control.id]: value }))}
          />
        ))}
      </div>
      <Diagram width={420} height={260} label={`คำขอเดือนละ ${decimal.format(monthlyRequests)} รายการ · hit ${settings.hit}% · miss ${100 - settings.hit}%`}>
        <Node
          x={72}
          y={10}
          width={276}
          title={`${decimal.format(monthlyRequests)} requests / เดือน`}
          detail={`${decimal.format(dailyRequests)} ต่อวัน × ${DAYS_PER_MONTH} วัน`}
          tone="brand"
          reduced={reduced}
        />
        <Flow points={[[210, 62], [210, 84], [102, 84], [102, 102]]} tone={settings.hit > 0 ? "success" : "neutral"} reduced={reduced} />
        <Flow points={[[210, 84], [318, 84], [318, 102]]} tone={settings.hit < 100 ? "cyan" : "neutral"} reduced={reduced} />
        <Node x={10} y={102} width={184} title={`Cache hit · ${settings.hit}%`} detail={`เฉลี่ย ${CACHE_LATENCY_SECONDS} s / request`} tone={settings.hit > 0 ? "success" : "neutral"} reduced={reduced} />
        <Node x={226} y={102} width={184} title={`Cache miss · ${100 - settings.hit}%`} detail={`เฉลี่ย ${MODEL_LATENCY_SECONDS} s / request`} tone={settings.hit < 100 ? "cyan" : "neutral"} reduced={reduced} />
        <SvgLabel x={10} y={182} size={13} bold>ค่า token ต่อเดือน</SvgLabel>
        <rect x="10" y="195" width="400" height="18" rx="5" fill="var(--surface)" stroke="var(--line)" />
        <rect
          x="10"
          y="195"
          width={uncachedMonthlyCost ? missFraction * 400 : 0}
          height="18"
          rx="5"
          fill="var(--brand)"
          className={reduced ? undefined : "transition-[width] duration-300"}
        />
        <SvgLabel x={10} y={235} size={13} bold>฿{money.format(monthlyCost)} เมื่อใช้ cache</SvgLabel>
        <SvgLabel x={10} y={253} size={12} muted>เต็มแถบ = ฿{money.format(uncachedMonthlyCost)} เมื่อไม่มี cache</SvgLabel>
      </Diagram>
      <dl className="grid grid-cols-2 gap-2 rounded-xl border border-hair bg-surface p-3 text-sm" aria-live="polite">
        <div>
          <dt className="text-muted">ค่า token / คน / เดือน</dt>
          <dd className="font-semibold">฿{money.format(perUser)}</dd>
        </div>
        <div>
          <dt className="text-muted">Peak API RPS</dt>
          <dd className="font-semibold">{rate.format(peakRps)} req/s</dd>
        </div>
        <div>
          <dt className="text-muted">Peak API concurrency เฉลี่ย</dt>
          <dd className="font-semibold">{rate.format(concurrency)} requests</dd>
        </div>
        <div>
          <dt className="text-muted">Peak model concurrency เฉลี่ย</dt>
          <dd className="font-semibold">{rate.format(modelConcurrency)} requests</dd>
        </div>
      </dl>
      <Caption>
        Little’s Law · L = λ × W. ช่วง peak สมมติอัตราคงที่และสัดส่วน hit เดิม
        {" "}API ใช้ λ = {rate.format(peakRps)} req/s และ W เฉลี่ย = {rate.format(averageW)} s
        {" "}ฝั่ง model ใช้เฉพาะ miss {rate.format(peakModelRps)} req/s × {MODEL_LATENCY_SECONDS} s
      </Caption>
      <p className="text-sm leading-relaxed text-muted">
        ค่า token ต่อคนคิดจากผู้ใช้กลุ่มเดิมตลอดเดือน โดยคิดราคา input และ output แยกกันเฉพาะ cache miss
        {" "}งบรวมจริงยังมีค่า embedding, cache, โฮสติ้ง และบริการอื่น
      </p>
    </div>
  );
}

/* OwaspLlmTop10Visual (owasp-llm-top10) */

const OWASP_NODES = [
  { id: "input", title: "User input", detail: "ข้อความ / ไฟล์", x: 10, y: 55 },
  { id: "docs", title: "RAG docs", detail: "เอกสารต้นทาง", x: 216, y: 55 },
  { id: "build", title: "Build + models", detail: "artifact / dependency", x: 10, y: 135 },
  { id: "vector", title: "Vector DB", detail: "embedding + retrieval", x: 216, y: 135 },
  { id: "agent", title: "Agent + LLM", detail: "ตัดสินใจ / สร้างคำตอบ", x: 10, y: 215 },
  { id: "tools", title: "MCP tools", detail: "API + ขอบเขตสิทธิ์", x: 216, y: 215 },
  { id: "output", title: "Output", detail: "คำตอบ / downstream", x: 10, y: 295 },
] as const;

type OwaspNodeId = (typeof OWASP_NODES)[number]["id"];

const OWASP_RISKS: readonly {
  id: string;
  title: string;
  nodes: readonly OwaspNodeId[];
  impact: string;
  mitigation: string;
}[] = [
  {
    id: "LLM01", title: "Prompt Injection", nodes: ["input", "docs", "agent"],
    impact: "ข้อความจากผู้ใช้หรือเอกสารอาจชักนำโมเดลให้ทำงานนอกขอบเขต",
    mitigation: "แยกข้อมูลที่ไม่น่าเชื่อถือออกจากคำสั่งและตรวจ policy นอกโมเดลก่อนทำ action",
  },
  {
    id: "LLM02", title: "Sensitive Information Disclosure", nodes: ["docs", "agent", "output"],
    impact: "ข้อมูลลับจากบริบทหรือข้อมูลส่วนบุคคลอาจหลุดมากับคำตอบ",
    mitigation: "จำกัดข้อมูลที่ส่งให้โมเดลตามสิทธิ์ แล้วตรวจและปิดบัง PII ก่อนส่งออก",
  },
  {
    id: "LLM03", title: "Supply Chain", nodes: ["build", "tools"],
    impact: "โมเดล dependency หรือ MCP server จากภายนอกอาจถูกเปลี่ยนก่อนเข้า production",
    mitigation: "ตรวจที่มาและลายเซ็น ตรึงเวอร์ชันหรือ digest และสแกน dependencies ผ่าน CI",
  },
  {
    id: "LLM04", title: "Data and Model Poisoning", nodes: ["build", "docs", "vector"],
    impact: "ข้อมูลฝึกหรือเอกสารในดัชนีที่ถูกดัดแปลงทำให้ผลลัพธ์เบี่ยงเบน",
    mitigation: "บันทึก provenance ตรวจและอนุมัติแหล่งข้อมูลก่อนนำเข้า แล้วเก็บเวอร์ชันสำหรับ rollback",
  },
  {
    id: "LLM05", title: "Improper Output Handling", nodes: ["agent", "tools", "output"],
    impact: "ระบบปลายทางอาจนำข้อความหรือ arguments จากโมเดลไปใช้โดยไม่ตรวจ",
    mitigation: "ตรวจ structured output ด้วย schema ใช้ parameterized queries และ escape ให้ตรงกับหน้าที่แสดงผล",
  },
  {
    id: "LLM06", title: "Excessive Agency", nodes: ["agent", "tools"],
    impact: "Agent อาจเรียกเครื่องมือหรือแก้ไขข้อมูลเกินงานที่ได้รับอนุญาต",
    mitigation: "ให้สิทธิ์เท่าที่จำเป็น ตรวจสิทธิ์ที่ฝั่งเครื่องมือ และขออนุมัติก่อน action ที่มีผลกระทบ",
  },
  {
    id: "LLM07", title: "System Prompt Leakage", nodes: ["agent", "output"],
    impact: "คำสั่งระบบหรือรายละเอียดภายในอาจปรากฏในคำตอบ",
    mitigation: "เก็บ secrets และกฎ authorization นอก system prompt แล้วบังคับ policy ที่ backend",
  },
  {
    id: "LLM08", title: "Vector and Embedding Weaknesses", nodes: ["docs", "vector"],
    impact: "การค้น vector อาจคืนข้อมูลข้ามสิทธิ์หรือเอกสารจากแหล่งที่ไม่ผ่านการตรวจ",
    mitigation: "บังคับ tenant/ACL ที่ชั้น retrieval ก่อนส่ง context และตรวจ provenance ของเอกสาร",
  },
  {
    id: "LLM09", title: "Misinformation", nodes: ["agent", "output"],
    impact: "ผู้ใช้อาจเชื่อคำตอบที่ไม่มีหลักฐานเพราะโมเดลนำเสนออย่างมั่นใจ",
    mitigation: "ให้คำตอบยึดหลักฐานที่ตรวจได้ พร้อมอ้างอิงและงดสรุปเมื่อหลักฐานไม่พอ",
  },
  {
    id: "LLM10", title: "Unbounded Consumption", nodes: ["input", "agent", "tools"],
    impact: "คำขอหนักหรือรอบการใช้ tools จำนวนมากเพิ่ม latency และค่าใช้จ่าย",
    mitigation: "ตั้ง rate limit, timeout, token budget และเพดานจำนวน tool calls ต่อคำขอ",
  },
];

const OWASP_EDGES: readonly { from: OwaspNodeId; to: OwaspNodeId; points: readonly (readonly [number, number])[] }[] = [
  { from: "input", to: "agent", points: [[10, 81], [4, 81], [4, 241], [10, 241]] },
  { from: "docs", to: "vector", points: [[313, 107], [313, 135]] },
  { from: "build", to: "agent", points: [[107, 187], [107, 215]] },
  { from: "vector", to: "agent", points: [[313, 187], [313, 200], [177, 200], [177, 215]] },
  { from: "agent", to: "tools", points: [[204, 241], [216, 241]] },
  { from: "agent", to: "output", points: [[107, 267], [107, 295]] },
];

export function OwaspLlmTop10Visual({ reduced = false }: VisualProps) {
  const [riskId, setRiskId] = useState("LLM01");
  const risk = OWASP_RISKS.find((item) => item.id === riskId) ?? OWASP_RISKS[0];
  const affected = OWASP_NODES.filter((node) => risk.nodes.includes(node.id)).map((node) => node.title);

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกความเสี่ยงจาก OWASP Top 10 for LLM Applications 2025" className="grid gap-1.5 sm:grid-cols-2">
        {OWASP_RISKS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === riskId}
            onClick={() => setRiskId(item.id)}
            className={`btn btn-sm min-w-0 !justify-start !whitespace-normal text-left ${item.id === riskId ? "" : "btn-quiet"}`}
            style={item.id === riskId ? ACTIVE_BTN_STYLE : undefined}
          >
            <span className="shrink-0 font-mono">{item.id}</span> {item.title}
          </button>
        ))}
      </div>
      <Diagram width={420} height={358} label={`${risk.id} กระทบ ${affected.join(", ")}`}>
        <SvgLabel x={10} y={23} bold>OWASP LLM Top 10 · 2025</SvgLabel>
        <SvgLabel x={10} y={42} size={12} muted>{risk.id} · {risk.title}</SvgLabel>
        {OWASP_EDGES.map(({ from, to, points }) => (
          <Flow
            key={`${from}-${to}`}
            points={points}
            tone={risk.nodes.includes(from) && risk.nodes.includes(to) ? "danger" : "neutral"}
            reduced={reduced}
          />
        ))}
        {OWASP_NODES.map((node) => (
          <Node
            key={node.id}
            x={node.x}
            y={node.y}
            width={194}
            title={node.title}
            detail={node.detail}
            tone={risk.nodes.includes(node.id) ? "danger" : "neutral"}
            reduced={reduced}
          />
        ))}
        <rect x="222" y="306" width="14" height="14" rx="3" fill="var(--danger-soft)" stroke="var(--danger)" />
        <SvgLabel x={244} y={318} size={12}>จุดที่กระทบในระบบตัวอย่าง</SvgLabel>
      </Diagram>
      <div className="space-y-1 rounded-xl border border-hair bg-surface p-3 text-sm" aria-live="polite">
        <p className="font-semibold">{risk.id} · {risk.title}</p>
        <p className="text-muted">จุดที่กระทบ · {affected.join(" / ")}</p>
        <p className="text-muted">{risk.impact}</p>
        <p><span className="font-semibold">แนวป้องกันหลัก</span> · {risk.mitigation}</p>
      </div>
    </div>
  );
}

/* GuardrailSandboxVisual (guardrail-sandbox) */

const SANDBOX_LAYERS = [
  { id: "input", title: "Input guardrail", detail: "ตรวจ schema และ policy" },
  { id: "model", title: "LLM", detail: "ร่างคำตอบหรือเสนอ tool call" },
  { id: "output", title: "Output validator", detail: "ตรวจ schema และ PII ก่อนส่งต่อ" },
  { id: "scope", title: "Tool sandbox", detail: "ตรวจ allowlist, scope และ arguments" },
  { id: "approval", title: "Human approval · HITL", detail: "ให้ผู้มีสิทธิ์อนุมัติงานเขียน" },
  { id: "execute", title: "MCP executor", detail: "เรียกเครื่องมือด้วยสิทธิ์ที่ตรวจแล้ว" },
] as const;

const SANDBOX_CASES = [
  {
    id: "read",
    label: "ปกติ · อ่าน",
    request: "ขอดูสถานะรายการของฉัน",
    stop: null,
    description: "เครื่องมืออ่านข้อมูลอยู่ใน allowlist และ scope ครอบคลุมรายการของผู้ใช้ จึงอ่านได้โดยข้าม HITL",
  },
  {
    id: "write",
    label: "ปกติ · เขียน",
    request: "ขออัปเดตสถานะรายการของฉัน",
    stop: null,
    description: "เครื่องมือเขียนผ่านการตรวจสิทธิ์แล้ว ต้องให้ผู้อนุมัติตรวจรายการและผลกระทบก่อนเรียกใช้",
  },
  {
    id: "injection",
    label: "Prompt injection",
    request: "ข้อความพยายามเปลี่ยนกฎของระบบ",
    stop: "input",
    description: "Input guardrail ตรวจพบว่าข้อความตัวอย่างละเมิด policy จึงหยุดคำขอก่อนถึง LLM",
  },
  {
    id: "pii",
    label: "PII leak",
    request: "คำตอบที่ร่างมีข้อมูลส่วนบุคคล",
    stop: "output",
    description: "Output validator พบร่องรอย PII ในคำตอบที่ร่างไว้ จึงระงับคำตอบก่อนส่งออก",
  },
  {
    id: "scope",
    label: "Tool call เกินสิทธิ์",
    request: "โมเดลเสนอแก้รายการของผู้อื่น",
    stop: "scope",
    description: "ชื่อเครื่องมืออยู่ใน allowlist แต่ scope ของผู้ใช้ไม่ครอบคลุมรายการเป้าหมาย จึงหยุดก่อนขออนุมัติหรือเรียกเครื่องมือ",
  },
] as const;

type SandboxApproval = "pending" | "approved" | "denied";

export function GuardrailSandboxVisual({ reduced = false }: VisualProps) {
  const [caseId, setCaseId] = useState<(typeof SANDBOX_CASES)[number]["id"]>("read");
  const [approval, setApproval] = useState<SandboxApproval>("pending");
  const scenario = SANDBOX_CASES.find((item) => item.id === caseId) ?? SANDBOX_CASES[0];
  const writing = scenario.id === "write";
  const waiting = writing && approval === "pending";
  const blocked = Boolean(scenario.stop) || (writing && approval === "denied");
  const stop = scenario.stop ?? (writing && approval !== "approved" ? "approval" : "execute");
  const stopIndex = SANDBOX_LAYERS.findIndex((layer) => layer.id === stop);
  const auditTone = blocked ? "danger" : waiting ? "warning" : "success";
  const decision = blocked ? "บล็อก" : waiting ? "รออนุมัติ" : "อนุญาต";
  const status = `${decision} · ${SANDBOX_LAYERS[stopIndex].title}`;
  const firstY = 12;
  const step = 70;
  const nodeHeight = 52;
  const nodeX = 40;
  const nodeWidth = 330;
  const center = nodeX + nodeWidth / 2;
  const right = nodeX + nodeWidth;
  const auditY = firstY + SANDBOX_LAYERS.length * step;
  const exitY = firstY + stopIndex * step + nodeHeight / 2;

  return (
    <div className="space-y-3">
      <Choice
        label="เลือกคำขอเพื่อทดสอบ guardrails"
        items={SANDBOX_CASES}
        value={caseId}
        onChange={(id) => {
          setCaseId(id);
          setApproval("pending");
        }}
      />
      {writing && (
        <Choice
          label="จำลองผลการอนุมัติงานเขียน"
          items={[
            { id: "pending", label: "รอตรวจ" },
            { id: "approved", label: "อนุมัติ" },
            { id: "denied", label: "ปฏิเสธ" },
          ]}
          value={approval}
          onChange={setApproval}
        />
      )}
      <Diagram width={420} height={auditY + nodeHeight + 12} label={`${scenario.request} · ${status} · บันทึกใน audit log`}>
        {SANDBOX_LAYERS.map((layer, index) => {
          const y = firstY + index * step;
          const bypassed = scenario.id === "read" && layer.id === "approval";
          const followsBypass = scenario.id === "read" && layer.id === "execute";
          const reached = index <= stopIndex && !bypassed;
          const tone = !reached ? "neutral" : index === stopIndex ? auditTone : "success";
          const detail = bypassed ? "ข้ามสำหรับงานอ่าน"
            : !reached ? "ยังไม่ถึงด่านนี้"
            : tone === "danger" || tone === "warning" ? `${decision} · ${layer.detail}`
            : `ผ่าน · ${layer.detail}`;

          return (
            <g key={layer.id}>
              {index > 0 && !bypassed && (
                <Flow
                  points={followsBypass
                    ? [[nodeX, y - 2 * step + nodeHeight / 2], [16, y - 2 * step + nodeHeight / 2], [16, y + nodeHeight / 2], [nodeX, y + nodeHeight / 2]]
                    : [[center, y - step + nodeHeight], [center, y]]}
                  tone={reached ? "success" : "neutral"}
                  reduced={reduced}
                  animated={reached}
                />
              )}
              <Node
                x={nodeX}
                y={y}
                width={nodeWidth}
                title={layer.title}
                detail={detail}
                tone={tone}
                reduced={reduced}
                selected={index === stopIndex}
              />
            </g>
          );
        })}
        <Flow
          points={stop === "execute"
            ? [[center, exitY + nodeHeight / 2], [center, auditY]]
            : [[right, exitY], [402, exitY], [402, auditY + nodeHeight / 2], [right, auditY + nodeHeight / 2]]}
          tone={auditTone}
          reduced={reduced}
          animated
        />
        <Node x={nodeX} y={auditY} width={nodeWidth} title="Audit log" detail={`บันทึก request ID · ผล ${decision}`} tone={auditTone} reduced={reduced} />
      </Diagram>
      <div className="space-y-1 rounded-xl border border-hair bg-surface p-3 text-sm" aria-live="polite">
        <p className="font-semibold">{scenario.request} · {status}</p>
        <p className="text-muted">{scenario.description}</p>
        {writing && approval !== "pending" && (
          <p className="text-muted">{approval === "approved" ? "ผู้ตรวจอนุมัติแล้ว จึงเรียกเครื่องมือเขียน" : "ผู้ตรวจปฏิเสธ จึงยุติคำขอที่ด่าน HITL"}</p>
        )}
        <p className="text-muted">Audit log เก็บรหัสคำขอ ด่าน และผลการตัดสินใจ โดยใช้เฉพาะ metadata</p>
      </div>
    </div>
  );
}

/* Phase5ProdArchVisual (phase5-prod-arch) */

const PROD_CHECKS = {
  eval: {
    label: "Eval gate",
    evidence: "Promptfoo และ Ragas ผ่านเกณฑ์บนชุด regression เดียวกันก่อน promote image",
  },
  latency: {
    label: "P95 latency",
    evidence: "วัด P95 ตั้งแต่รับคำขอถึง SSE event สุดท้ายภายใต้โหลดเป้าหมาย และเทียบกับ SLO",
  },
  cost: {
    label: "Cost / user",
    evidence: "หารต้นทุนช่วงที่วัดด้วยจำนวนผู้ใช้ที่ใช้งานจริงในช่วงเดียวกัน รวม token, embeddings และค่าใช้บริการ",
  },
  pii: {
    label: "PII leaks",
    evidence: "ใช้ข้อมูลสังเคราะห์ตรวจว่า PII ไม่หลุดไปยัง model, SSE, cache หรือ traces",
  },
  injection: {
    label: "Injection block rate",
    evidence: "หารจำนวนเคส injection ที่ถูกหยุดก่อนส่งผลหรือเกิด tool side effect ด้วยจำนวนเคส injection ทั้งหมด และตรวจว่าเคสปกติยังผ่าน",
  },
};

const PROD_NODES = [
  { id: "client", title: "Client", detail: "ส่งคำถาม · รับ SSE", x: 18, y: 44, width: 194, checks: ["latency", "pii"] },
  { id: "api", title: "FastAPI · SSE", detail: "Auth · request ID · stream", x: 18, y: 116, width: 194, checks: ["latency", "pii"] },
  { id: "guard", title: "Guardrails + PDPA", detail: "ตรวจ policy · ปิดบัง PII", x: 18, y: 188, width: 194, checks: ["pii", "injection"] },
  { id: "agent", title: "LangGraph agent", detail: "จัดลำดับ retrieval และ tools", x: 18, y: 260, width: 194, checks: ["eval", "latency", "injection"] },
  { id: "rag", title: "Hybrid RAG", detail: "ค้น + อ้างอิง", x: 18, y: 332, width: 90, checks: ["eval", "pii"] },
  { id: "tools", title: "MCP tools", detail: "Scope + HITL", x: 122, y: 332, width: 90, checks: ["eval", "injection"] },
  { id: "cache", title: "Semantic cache", detail: "ใช้ซ้ำใน tenant / ACL เดียวกัน", x: 18, y: 408, width: 194, checks: ["latency", "cost", "pii"] },
  { id: "router", title: "LLM tier router", detail: "Miss → Small / Strong model", x: 18, y: 480, width: 194, checks: ["eval", "latency", "cost"] },
  { id: "trace", title: "Langfuse / OTel", detail: "Trace · latency · tokens", x: 244, y: 116, width: 166, checks: ["latency", "cost", "pii"] },
  { id: "alerts", title: "Incident runbook", detail: "Alerts · เจ้าของ · rollback", x: 244, y: 188, width: 166, checks: ["latency", "cost", "pii", "injection"] },
  { id: "ci", title: "Promptfoo / Ragas", detail: "CI eval gate", x: 244, y: 332, width: 166, checks: ["eval", "pii", "injection"] },
  { id: "deploy", title: "Docker / Cloud", detail: "/healthz · /readyz", x: 244, y: 408, width: 166, checks: ["eval", "latency"] },
] as const satisfies readonly {
  id: string;
  title: string;
  detail: string;
  x: number;
  y: number;
  width: number;
  checks: readonly (keyof typeof PROD_CHECKS)[];
}[];

type ProdNodeId = (typeof PROD_NODES)[number]["id"];

const PROD_EDGES: readonly {
  from: ProdNodeId;
  to: ProdNodeId;
  points: readonly (readonly [number, number])[];
  tone?: Tone;
}[] = [
  { from: "client", to: "api", points: [[103, 96], [103, 116]] },
  { from: "api", to: "client", points: [[127, 116], [127, 96]], tone: "success" },
  { from: "api", to: "guard", points: [[103, 168], [103, 188]] },
  { from: "guard", to: "api", points: [[127, 188], [127, 168]], tone: "success" },
  { from: "guard", to: "agent", points: [[115, 240], [115, 260]] },
  { from: "agent", to: "rag", points: [[63, 312], [63, 332]] },
  { from: "agent", to: "tools", points: [[167, 312], [167, 332]] },
  { from: "agent", to: "cache", points: [[115, 312], [115, 408]] },
  { from: "cache", to: "router", points: [[115, 460], [115, 480]] },
  { from: "cache", to: "guard", points: [[18, 426], [7, 426], [7, 214], [18, 214]], tone: "success" },
  { from: "router", to: "guard", points: [[18, 506], [7, 506], [7, 426]], tone: "success" },
  { from: "api", to: "trace", points: [[212, 136], [244, 136]], tone: "cyan" },
  { from: "trace", to: "alerts", points: [[327, 168], [327, 188]], tone: "cyan" },
  { from: "ci", to: "deploy", points: [[327, 384], [327, 408]], tone: "cyan" },
  { from: "deploy", to: "api", points: [[244, 434], [228, 434], [228, 154], [212, 154]], tone: "cyan" },
];

const PROD_NOTES: Record<ProdNodeId, string> = {
  client: "ตรวจว่าผู้ใช้ได้รับเฉพาะ SSE events ที่ผ่านการตรวจ และใช้ request ID เพื่อตามรอยข้อผิดพลาด",
  api: "ตรวจสิทธิ์ก่อนเรียก engine แล้วส่งเฉพาะข้อความที่ผ่าน output validation และ redaction เป็น SSE",
  guard: "ตรวจ input policy และปิดบัง PII ก่อนเข้า engine จากนั้นตรวจคำตอบและปิดบังซ้ำก่อนส่งออก",
  agent: "จัดเส้นทางระหว่างการค้นเอกสาร การเรียกเครื่องมือ และการสร้างคำตอบ โดยกำหนดเพดานรอบและ timeout",
  rag: "รวม keyword และ vector retrieval ภายใต้ ACL และตรวจว่า citations รองรับคำตอบ",
  tools: "ตรวจ allowlist, scope และ schema ที่ executor และขอ human approval สำหรับการเขียน",
  cache: "คืนคำตอบเดิมเมื่อ tenant, สิทธิ์, เวอร์ชัน และคะแนนความคล้ายผ่านเงื่อนไข แล้วส่งกลับไปตรวจ output",
  router: "เลือก model tier ตามความยากและงบเมื่อ cache miss ผลใหม่ที่ผ่านการตรวจสามารถเก็บกลับเข้า cache",
  trace: "เชื่อม spans ด้วย request ID และเก็บสถานะ เวลา token count และจำนวน redactions เป็น metadata",
  alerts: "ผูก alert กับผู้รับผิดชอบ เกณฑ์ตอบสนอง และขั้นตอนลดผลกระทบหรือ rollback ที่ซ้อมแล้ว",
  ci: "รัน regression, RAG quality และเคสด้านความปลอดภัยใน CI พร้อมเก็บผล eval ของแต่ละ release",
  deploy: "ตรวจ /healthz ว่า process ยังตอบ และตรวจ /readyz ว่าพร้อมรับ traffic ก่อนสลับไปยัง image ใหม่",
};

export function Phase5ProdArchVisual({ reduced = false }: VisualProps) {
  const [active, setActive] = useState<ProdNodeId>("guard");
  const selected = PROD_NODES.find((node) => node.id === active) ?? PROD_NODES[0];

  return (
    <div className="space-y-3">
      <Diagram width={420} height={544} label="สถาปัตยกรรม Phase 5 v0.5.0 เลือกส่วนประกอบเพื่อดูรายการตรวจความพร้อม" interactive>
        <SvgLabel x={18} y={25} size={14} bold>Phase 5 · v0.5.0</SvgLabel>
        <SvgLabel x={244} y={25} size={14} bold>ระบบดูแล production</SvgLabel>
        {PROD_EDGES.map(({ from, to, points, tone = "brand" }) => {
          const highlighted = from === active || to === active
            || (active === "router" && from === "cache" && to === "guard");
          return (
            <Flow
              key={`${from}-${to}`}
              points={points}
              tone={highlighted ? tone : "neutral"}
              reduced={reduced}
              animated={highlighted}
            />
          );
        })}
        {PROD_NODES.map((node) => (
          <Node
            key={node.id}
            x={node.x}
            y={node.y}
            width={node.width}
            title={node.title}
            detail={node.detail}
            tone={node.id === active ? "brand" : node.x > 212 ? "cyan" : "neutral"}
            reduced={reduced}
            selected={node.id === active}
            onSelect={() => setActive(node.id)}
          />
        ))}
      </Diagram>
      <div className="space-y-2 rounded-xl border border-hair bg-surface p-3 text-sm" aria-live="polite">
        <p className="font-semibold">{selected.title} · รายการตรวจความพร้อม</p>
        <p className="text-muted">{PROD_NOTES[selected.id]}</p>
        <ul className="list-disc space-y-1 pl-5">
          {selected.checks.map((check) => (
            <li key={check}>
              <span className="font-semibold">{PROD_CHECKS[check].label}</span>
              {" · "}{PROD_CHECKS[check].evidence}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
