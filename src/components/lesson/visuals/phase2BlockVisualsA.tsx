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

/* ========================================================================== */
/* 1. DirtyDataCleanVisual (dirty-data-clean)                                 */
/* ========================================================================== */

type CleanMode = "raw" | "clean";

interface OrderRow {
  id: string;
  rawOrderId: string;
  cleanOrderId: string;
  rawDate: string;
  cleanDate: string;
  rawProvince: string;
  cleanProvince: string;
  rawAmount: string;
  cleanAmount: string;
  issueCol: "date" | "province" | "amount" | "duplicate";
  rawTag: string;
  cleanTag: string;
  isDuplicate?: boolean;
}

const ORDER_ROWS: OrderRow[] = [
  {
    id: "r1",
    rawOrderId: "ORD-101",
    cleanOrderId: "ORD-101",
    rawDate: "2569-05-01",
    cleanDate: "2026-05-01",
    rawProvince: "เชียงใหม่",
    cleanProvince: "เชียงใหม่",
    rawAmount: "890",
    cleanAmount: "890.0",
    issueCol: "date",
    rawTag: "ปี พ.ศ. (+543)",
    cleanTag: "ISO Date (-543)",
  },
  {
    id: "r2",
    rawOrderId: "ORD-102",
    cleanOrderId: "ORD-102",
    rawDate: "2026-05-01",
    cleanDate: "2026-05-01",
    rawProvince: '"  กทม.  "',
    cleanProvince: "กทม.",
    rawAmount: "450",
    cleanAmount: "450.0",
    issueCol: "province",
    rawTag: "เว้นวรรคเกิน",
    cleanTag: "strip_chars()",
  },
  {
    id: "r3",
    rawOrderId: "ORD-103",
    cleanOrderId: "ORD-103",
    rawDate: "2026-05-02",
    cleanDate: "2026-05-02",
    rawProvince: "ภูเก็ต",
    cleanProvince: "ภูเก็ต",
    rawAmount: "null",
    cleanAmount: "670.0",
    issueCol: "amount",
    rawTag: "ค่าว่าง NULL",
    cleanTag: "fill_null(med)",
  },
  {
    id: "r4",
    rawOrderId: "ORD-102",
    cleanOrderId: "ORD-102",
    rawDate: "2026-05-01",
    cleanDate: "2026-05-01",
    rawProvince: '"  กทม.  "',
    cleanProvince: "กทม.",
    rawAmount: "450",
    cleanAmount: "450.0",
    issueCol: "duplicate",
    rawTag: "ซ้ำ ORD-102",
    cleanTag: "unique() ตัดออก",
    isDuplicate: true,
  },
];

export function DirtyDataCleanVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<CleanMode>("raw");
  const isClean = mode === "clean";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const arrowId = `${uid}-clean-arrow`;

  const captionText = isClean
    ? "หลังล้างด้วย Polars (Clean Parquet): แปลงปี พ.ศ. 2569-05-01 เป็น ISO 2026-05-01, ตัดช่องว่าง UTF-8 ของ กทม., เติมค่า null ด้วยค่ามัธยฐาน 670.0 และตัดออเดอร์ซ้ำ ORD-102 เหลือ 3 แถวพร้อมเทรน"
    : 'ข้อมูลดิบสกปรก (Raw CSV): พบปัญหา 4 จุดใน 4 แถว ทั้งวันที่ปี พ.ศ. "2569-05-01", ช่องว่างเกินรอบ "  กทม.  ", ค่า null ในยอดเงิน และรหัสออเดอร์ ORD-102 ซ้ำกัน';

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับดูข้อมูลดิบกับข้อมูลหลังล้างด้วย Polars" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isClean}
          className={!isClean ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isClean ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("raw")}
        >
          ข้อมูลดิบสกปรก (Raw CSV)
        </button>
        <button
          type="button"
          aria-pressed={isClean}
          className={isClean ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isClean ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("clean")}
        >
          หลังล้างด้วย Polars (Clean Parquet)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบข้อมูลอีคอมเมิร์ซไทยก่อนและหลังล้างด้วย Polars"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isClean ? "var(--success)" : "var(--warning)"} />
            </marker>
          </defs>

          {/* Top 3-stage pipeline header */}
          <rect
            x="16"
            y="12"
            width="178"
            height="36"
            rx="10"
            fill={!isClean ? "var(--danger-soft)" : "var(--surface)"}
            stroke={!isClean ? "var(--danger)" : "var(--line)"}
            strokeWidth={!isClean ? "1.75" : "1.25"}
            className={txClass}
          />
          <text
            x="105"
            y="34"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={!isClean ? "var(--danger)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            orders_raw.csv
          </text>

          <line
            x1="196"
            y1="30"
            x2="244"
            y2="30"
            stroke={isClean ? "var(--brand)" : "var(--warning)"}
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={flowClass}
            markerEnd={`url(#${arrowId})`}
          />

          <rect
            x="248"
            y="12"
            width="184"
            height="36"
            rx="10"
            fill={isClean ? "var(--brand-soft)" : "var(--surface)"}
            stroke={isClean ? "var(--brand)" : "var(--line)"}
            strokeWidth="1.5"
            className={txClass}
          />
          <text
            x="340"
            y="34"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={isClean ? "var(--brand-ink)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            Polars Clean Pipeline
          </text>

          <line
            x1="434"
            y1="30"
            x2="482"
            y2="30"
            stroke={isClean ? "var(--success)" : "var(--hair)"}
            strokeWidth="2.25"
            strokeDasharray={reduced ? undefined : "6 6"}
            className={isClean ? flowClass : undefined}
            markerEnd={isClean ? `url(#${arrowId})` : undefined}
          />

          <rect
            x="486"
            y="12"
            width="178"
            height="36"
            rx="10"
            fill={isClean ? "var(--success-soft)" : "var(--surface)"}
            stroke={isClean ? "var(--success)" : "var(--hair)"}
            strokeWidth={isClean ? "1.75" : "1.25"}
            className={txClass}
          />
          <text
            x="575"
            y="34"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={isClean ? "var(--success)" : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            clean.parquet
          </text>

          {/* Main data table container */}
          <rect x="16" y="58" width="648" height="168" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Column header strip */}
          <rect x="24" y="65" width="632" height="24" rx="6" fill="var(--surface-2)" />
          <text x="36" y="81" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            order_id
          </text>
          <text x="140" y="81" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            order_date
          </text>
          <text x="274" y="81" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            province
          </text>
          <text x="398" y="81" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-mono)">
            amount_thb
          </text>
          <text x="512" y="81" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-sans)">
            {isClean ? "คำสั่ง Polars ที่แก้แล้ว" : "ปัญหาที่ตรวจพบ"}
          </text>

          {/* 4 E-commerce rows */}
          {ORDER_ROWS.map((row, idx) => {
            const y = 95 + idx * 31;
            const dropped = isClean && Boolean(row.isDuplicate);

            const isIdIssue = row.issueCol === "duplicate";
            const isDateIssue = row.issueCol === "date";
            const isProvIssue = row.issueCol === "province";
            const isAmtIssue = row.issueCol === "amount";

            const hlFill = (match: boolean) => {
              if (!match) return "transparent";
              if (isClean) return row.isDuplicate ? "var(--surface-2)" : "var(--success-soft)";
              return row.issueCol === "province" ? "var(--warning-soft)" : "var(--danger-soft)";
            };
            const hlStroke = (match: boolean) => {
              if (!match) return "none";
              if (isClean) return row.isDuplicate ? "var(--line)" : "var(--success)";
              return row.issueCol === "province" ? "var(--warning)" : "var(--danger)";
            };
            const cellColor = (match: boolean) => {
              if (dropped) return "var(--muted)";
              if (!match) return "var(--fg)";
              if (isClean) return "var(--success)";
              return row.issueCol === "province" ? "var(--warning)" : "var(--danger)";
            };

            const badgeFill = dropped
              ? "var(--surface-2)"
              : isClean
                ? "var(--success-soft)"
                : row.issueCol === "province"
                  ? "var(--warning-soft)"
                  : "var(--danger-soft)";
            const badgeText = dropped
              ? "var(--muted)"
              : isClean
                ? "var(--success)"
                : row.issueCol === "province"
                  ? "var(--warning)"
                  : "var(--danger)";

            return (
              <g key={row.id} opacity={dropped ? 0.52 : 1} className={txClass}>
                {/* Row separator */}
                <rect
                  x="24"
                  y={y}
                  width="632"
                  height="26"
                  rx="6"
                  fill={dropped ? "var(--surface-2)" : "var(--surface)"}
                  stroke={dropped ? "var(--hair)" : "var(--hair)"}
                  strokeDasharray={dropped ? "4 3" : undefined}
                />

                {/* order_id cell */}
                <rect
                  x="28"
                  y={y + 3}
                  width="98"
                  height="20"
                  rx="4"
                  fill={hlFill(isIdIssue)}
                  stroke={hlStroke(isIdIssue)}
                  className={txClass}
                />
                <text
                  x="36"
                  y={y + 17}
                  fontSize="11.5"
                  fontWeight={isIdIssue ? "700" : "600"}
                  fill={cellColor(isIdIssue)}
                  fontFamily="var(--font-mono)"
                >
                  {isClean ? row.cleanOrderId : row.rawOrderId}
                </text>

                {/* order_date cell */}
                <rect
                  x="134"
                  y={y + 3}
                  width="126"
                  height="20"
                  rx="4"
                  fill={hlFill(isDateIssue)}
                  stroke={hlStroke(isDateIssue)}
                  className={txClass}
                />
                <text
                  x="140"
                  y={y + 17}
                  fontSize="11.5"
                  fontWeight={isDateIssue ? "700" : "500"}
                  fill={cellColor(isDateIssue)}
                  fontFamily="var(--font-mono)"
                >
                  {isClean ? row.cleanDate : row.rawDate}
                </text>

                {/* province cell */}
                <rect
                  x="268"
                  y={y + 3}
                  width="118"
                  height="20"
                  rx="4"
                  fill={hlFill(isProvIssue)}
                  stroke={hlStroke(isProvIssue)}
                  className={txClass}
                />
                <text
                  x="274"
                  y={y + 17}
                  fontSize="11.5"
                  fontWeight={isProvIssue ? "700" : "500"}
                  fill={cellColor(isProvIssue)}
                  fontFamily="var(--font-sans)"
                >
                  {isClean ? row.cleanProvince : row.rawProvince}
                </text>

                {/* amount_thb cell */}
                <rect
                  x="392"
                  y={y + 3}
                  width="106"
                  height="20"
                  rx="4"
                  fill={hlFill(isAmtIssue)}
                  stroke={hlStroke(isAmtIssue)}
                  className={txClass}
                />
                <text
                  x="398"
                  y={y + 17}
                  fontSize="11.5"
                  fontWeight={isAmtIssue ? "700" : "500"}
                  fill={cellColor(isAmtIssue)}
                  fontFamily="var(--font-mono)"
                >
                  {isClean ? row.cleanAmount : row.rawAmount}
                </text>

                {/* Strikethrough line when duplicate row is dropped */}
                {dropped && <line x1="34" y1={y + 13} x2="492" y2={y + 13} stroke="var(--muted)" strokeWidth="1.25" />}

                {/* Status / Polars rule badge */}
                <rect x="506" y={y + 3} width="144" height="20" rx="5" fill={badgeFill} className={txClass} />
                <text
                  x="578"
                  y={y + 17}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={badgeText}
                  fontFamily={isClean ? "var(--font-mono)" : "var(--font-sans)"}
                >
                  {isClean ? row.cleanTag : row.rawTag}
                </text>
              </g>
            );
          })}

          {/* Bottom summary strip */}
          <rect
            x="16"
            y="234"
            width="648"
            height="34"
            rx="10"
            fill={isClean ? "var(--success-soft)" : "var(--danger-soft)"}
            stroke={isClean ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="30"
            y="255"
            fontSize="12"
            fontWeight="700"
            fill={isClean ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-sans)"
          >
            {isClean
              ? "สะอาดพร้อมเทรน: ISO Date · Trim UTF-8 · Impute Median (670.0) · Deduplicate"
              : "เสี่ยงเทรนเพี้ยน: พบ 4 ปัญหา (ปี พ.ศ. · เว้นวรรคเกิน · ค่า null · แถวซ้ำ)"}
          </text>
          <text
            x="650"
            y="255"
            textAnchor="end"
            fontSize="12"
            fontWeight="700"
            fill={isClean ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isClean ? "3 valid rows" : "4 raw rows"}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 2. DuckdbParquetVisual (duckdb-parquet)                                    */
/* ========================================================================== */

type ScanEngineMode = "csv" | "parquet";

interface ColumnStrip {
  name: string;
  sizeMb: string;
  needed: boolean;
}

const TABLE_COLUMNS: ColumnStrip[] = [
  { name: "order_id", sizeMb: "22 MB", needed: false },
  { name: "province", sizeMb: "6 MB", needed: true },
  { name: "user_id", sizeMb: "24 MB", needed: false },
  { name: "amount", sizeMb: "8 MB", needed: true },
  { name: "note_txt", sizeMb: "54 MB", needed: false },
  { name: "raw_json", sizeMb: "66 MB", needed: false },
];

export function DuckdbParquetVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [mode, setMode] = useState<ScanEngineMode>("parquet");
  const isParquet = mode === "parquet";
  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const arrowId = `${uid}-duck-arrow`;

  const captionText = isParquet
    ? "DuckDB + Parquet (Columnar Storage): ทำ Projection Pruning ข้าม 4 คอลัมน์ที่ไม่เกี่ยวข้อง อ่านจริงเฉพาะ province (6 MB) และ amount (8 MB) รวมเพียง 14 MB เร็วขึ้น ~12× (0.18s vs 2.20s)"
    : "CSV Scan (Row-oriented): ต้องอ่านข้อมูลทุกคอลัมน์ทีละบรรทัดตั้งแต่ต้นจนจบไฟล์ (180 MB) แม้คำสั่ง SQL จะใช้แค่ 2 คอลัมน์ ทำให้เสียเวลา Disk I/O ถึง 92% ไปกับข้อมูลที่ต้องทิ้ง";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="สลับวิธีอ่านข้อมูล CSV Scan กับ DuckDB Parquet" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!isParquet}
          className={!isParquet ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={!isParquet ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("csv")}
        >
          CSV Scan (อ่านครบทุกคอลัมน์ 180 MB)
        </button>
        <button
          type="button"
          aria-pressed={isParquet}
          className={isParquet ? "btn btn-sm" : "btn btn-sm btn-quiet"}
          style={isParquet ? ACTIVE_BTN_STYLE : undefined}
          onClick={() => setMode("parquet")}
        >
          DuckDB + Parquet (อ่านเฉพาะ 2 คอลัมน์ 14 MB)
        </button>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเปรียบเทียบการสแกนไฟล์ CSV ทั้งหมดกับ Projection Pruning ของ DuckDB บน Parquet"
        >
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isParquet ? "var(--success)" : "var(--danger)"} />
            </marker>
          </defs>

          {/* SQL Query Bar */}
          <rect x="16" y="12" width="648" height="34" rx="10" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="33" fontSize="11.5" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-mono)">
            SELECT province, SUM(amount) FROM orders GROUP BY province;
          </text>
          <rect x="524" y="18" width="130" height="22" rx="6" fill="var(--brand-soft)" />
          <text x="589" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-sans)">
            ใช้จริง 2 / 6 คอลัมน์
          </text>

          {/* Left: Vertical Column Strips Panel */}
          <rect x="16" y="56" width="416" height="156" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="76" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            {isParquet
              ? "Parquet Columnar Layout · Projection Pruning"
              : "CSV Row-oriented Layout · Full Table Scan"}
          </text>

          {TABLE_COLUMNS.map((col, idx) => {
            const x = 35 + idx * 64;
            const active = isParquet ? col.needed : true;
            const isWaste = !isParquet && !col.needed;

            const fill = col.needed
              ? isParquet
                ? "var(--success-soft)"
                : "var(--warning-soft)"
              : isWaste
                ? "var(--danger-soft)"
                : "var(--surface-2)";
            const stroke = col.needed
              ? isParquet
                ? "var(--success)"
                : "var(--warning)"
              : isWaste
                ? "var(--danger)"
                : "var(--hair)";
            const blockFill = col.needed
              ? isParquet
                ? "var(--success)"
                : "var(--warning)"
              : isWaste
                ? "var(--danger)"
                : "var(--line)";
            const labelColor = col.needed
              ? isParquet
                ? "var(--success)"
                : "var(--warning)"
              : isWaste
                ? "var(--danger)"
                : "var(--muted)";

            return (
              <g key={col.name} opacity={active ? 1 : 0.45} className={txClass}>
                {/* Column strip container */}
                <rect
                  x={x}
                  y="86"
                  width="56"
                  height="114"
                  rx="8"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={col.needed ? "1.75" : "1.25"}
                  strokeDasharray={!active ? "4 3" : undefined}
                  className={txClass}
                />

                {/* Status pill */}
                <text
                  x={x + 28}
                  y="101"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill={labelColor}
                  fontFamily="var(--font-mono)"
                >
                  {isParquet ? (col.needed ? "READ" : "SKIP") : col.needed ? "READ" : "WASTE"}
                </text>

                {/* Column name */}
                <text
                  x={x + 28}
                  y="116"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="var(--fg)"
                  fontFamily="var(--font-mono)"
                >
                  {col.name}
                </text>

                {/* Vertical stacked mini blocks representing column chunks */}
                {[0, 1, 2, 3].map((blk) => (
                  <rect
                    key={blk}
                    x={x + 10}
                    y={124 + blk * 13}
                    width="36"
                    height="9"
                    rx="2.5"
                    fill={blockFill}
                    opacity={active ? 0.85 : 0.35}
                    className={txClass}
                  />
                ))}

                {/* Animated vertical scan ray on active Parquet columns */}
                {isParquet && col.needed && (
                  <line
                    x1={x + 28}
                    y1="122"
                    x2={x + 28}
                    y2="178"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    strokeDasharray={reduced ? undefined : "4 4"}
                    className={flowClass}
                  />
                )}

                {/* Column size footer */}
                <text
                  x={x + 28}
                  y="193"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={labelColor}
                  fontFamily="var(--font-mono)"
                >
                  {col.sizeMb}
                </text>
              </g>
            );
          })}

          {/* Horizontal row-scan flow lines in CSV mode */}
          {!isParquet && (
            <>
              <line
                x1="34"
                y1="136"
                x2="414"
                y2="136"
                stroke="var(--danger)"
                strokeWidth="1.75"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
              />
              <line
                x1="34"
                y1="162"
                x2="414"
                y2="162"
                stroke="var(--danger)"
                strokeWidth="1.75"
                strokeDasharray={reduced ? undefined : "6 6"}
                className={flowClass}
              />
            </>
          )}

          {/* Flow connector arrows from storage to engine */}
          {isParquet ? (
            <line
              x1="434"
              y1="134"
              x2="470"
              y2="134"
              stroke="var(--success)"
              strokeWidth="2.75"
              strokeDasharray={reduced ? undefined : "6 6"}
              className={flowClass}
              markerEnd={`url(#${arrowId})`}
            />
          ) : (
            <>
              {[106, 134, 162].map((cy) => (
                <line
                  key={cy}
                  x1="434"
                  y1={cy}
                  x2="470"
                  y2={cy}
                  stroke="var(--danger)"
                  strokeWidth="2.25"
                  strokeDasharray={reduced ? undefined : "6 6"}
                  className={flowClass}
                  markerEnd={`url(#${arrowId})`}
                />
              ))}
            </>
          )}

          {/* Right: DuckDB / CSV Engine Metrics Card */}
          <rect
            x="474"
            y="56"
            width="190"
            height="156"
            rx="12"
            fill="var(--surface)"
            stroke={isParquet ? "var(--success)" : "var(--danger)"}
            strokeWidth="1.5"
            className={txClass}
          />
          <rect
            x="486"
            y="68"
            width="166"
            height="26"
            rx="7"
            fill={isParquet ? "var(--success-soft)" : "var(--danger-soft)"}
            className={txClass}
          />
          <text
            x="569"
            y="85"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={isParquet ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isParquet ? "DuckDB + Parquet" : "Full CSV Reader"}
          </text>

          <text x="490" y="114" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            Disk I/O ที่อ่านจริง
          </text>
          <text
            x="648"
            y="115"
            textAnchor="end"
            fontSize="14"
            fontWeight="700"
            fill={isParquet ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isParquet ? "14 MB" : "180 MB"}
          </text>

          <line x1="490" y1="126" x2="648" y2="126" stroke="var(--hair)" />

          <text x="490" y="146" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            เวลาประมวลผล
          </text>
          <text
            x="648"
            y="147"
            textAnchor="end"
            fontSize="14"
            fontWeight="700"
            fill={isParquet ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isParquet ? "0.18 s" : "2.20 s"}
          </text>

          {/* Speed boost badge */}
          <rect
            x="486"
            y="166"
            width="166"
            height="32"
            rx="8"
            fill={isParquet ? "var(--cyan-soft)" : "var(--warning-soft)"}
            stroke={isParquet ? "var(--cyan)" : "var(--warning)"}
            strokeWidth="1.25"
            className={txClass}
          />
          <text
            x="569"
            y="186"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fill={isParquet ? "var(--cyan)" : "var(--warning)"}
            fontFamily="var(--font-sans)"
          >
            {isParquet ? "เร็วขึ้น ~12× · ลด I/O 92%" : "ช้ากว่า 12× · อ่านทิ้ง 92%"}
          </text>

          {/* Bottom Animated I/O Bar */}
          <rect x="16" y="222" width="648" height="46" rx="10" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="249" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ปริมาณข้อมูลที่ต้องอ่าน (Disk I/O)
          </text>
          <rect x="234" y="238" width="268" height="14" rx="7" fill="var(--surface-2)" stroke="var(--hair)" />
          <rect
            x="234"
            y="238"
            width={isParquet ? 22 : 268}
            height="14"
            rx="7"
            fill={isParquet ? "var(--success)" : "var(--danger)"}
            className={txClass}
          />
          <text
            x="650"
            y="249"
            textAnchor="end"
            fontSize="12"
            fontWeight="700"
            fill={isParquet ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {isParquet ? "14 / 180 MB (8%)" : "180 / 180 MB (100%)"}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 3. VectorDotNormVisual (vector-dot-norm)                                   */
/* ========================================================================== */

type VectorPresetId = "same" | "orthogonal" | "opposite";

interface VectorPreset {
  id: VectorPresetId;
  btnLabel: string;
  bx: number;
  by: number;
  angleLabel: string;
  statusLabel: string;
  accent: string;
  soft: string;
  caption: string;
}

const VEC_AX = 4;
const VEC_AY = 3;

const VECTOR_PRESETS: VectorPreset[] = [
  {
    id: "same",
    btnLabel: "ชี้ทิศเดียวกัน (Dot สูง)",
    bx: 3,
    by: 4,
    angleLabel: "16.3°",
    statusLabel: "ชี้ทิศเดียวกัน · ความหมายใกล้กันมาก",
    accent: "var(--success)",
    soft: "var(--success-soft)",
    caption:
      "ชี้ทิศเดียวกัน: a = (4, 3) และ b = (3, 4) มี L2 Norm เท่ากันคือ 5.00 ได้ Dot Product a · b = +24 และ Normalized Cosine = +0.96 แสดงว่าเวกเตอร์ทั้งสองชี้ไปทางเดียวกันมาก",
  },
  {
    id: "orthogonal",
    btnLabel: "ตั้งฉากกัน (Dot = 0)",
    bx: -3,
    by: 4,
    angleLabel: "90.0°",
    statusLabel: "ตั้งฉากกัน · ไม่มีองค์ประกอบร่วม",
    accent: "var(--warning)",
    soft: "var(--warning-soft)",
    caption:
      "ตั้งฉากกัน (Orthogonal): a = (4, 3) และ b = (-3, 4) มี Dot Product a · b = (4)(-3) + (3)(4) = 0 ทำให้ Normalized Cosine = 0.00 แปลว่าสองมิติหรือแนวคิดนี้เป็นอิสระต่อกัน",
  },
  {
    id: "opposite",
    btnLabel: "ทิศตรงข้าม (Dot ติดลบ)",
    bx: -4,
    by: -3,
    angleLabel: "180.0°",
    statusLabel: "ทิศตรงข้ามกัน · ความหมายขัดแย้ง",
    accent: "var(--danger)",
    soft: "var(--danger-soft)",
    caption:
      "ทิศตรงข้าม: a = (4, 3) และ b = (-4, -3) ให้ Dot Product a · b = -25 และ Normalized Cosine = -1.00 แสดงว่าเวกเตอร์ทั้งสองชี้สวนทางกันแบบสมบูรณ์",
  },
];

export function VectorDotNormVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [presetId, setPresetId] = useState<VectorPresetId>("same");
  const preset = VECTOR_PRESETS.find((p) => p.id === presetId) ?? VECTOR_PRESETS[0];

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerA = `${uid}-vdot-a`;
  const markerB = `${uid}-vdot-b`;

  const normA = Math.hypot(VEC_AX, VEC_AY);
  const normB = Math.hypot(preset.bx, preset.by);
  const dot = VEC_AX * preset.bx + VEC_AY * preset.by;
  const cosine = dot / (normA * normB);

  // 2D coordinate plane on the left card
  const ox = 176;
  const oy = 144;
  const scale = 23;

  const axSvg = ox + VEC_AX * scale;
  const aySvg = oy - VEC_AY * scale;
  const bxSvg = ox + preset.bx * scale;
  const bySvg = oy - preset.by * scale;

  // Projection of b onto line of a
  const projFactor = dot / (normA * normA);
  const projXSvg = ox + VEC_AX * projFactor * scale;
  const projYSvg = oy - VEC_AY * projFactor * scale;

  // Bipolar cosine gauge geometry (center = 0)
  const gaugeX = 374;
  const gaugeW = 266;
  const gaugeMid = gaugeX + gaugeW / 2;
  const halfW = gaugeW / 2;
  const fillW = Math.max(4, Math.abs(cosine) * halfW);
  const fillX = cosine >= 0 ? gaugeMid : gaugeMid - fillW;

  const dotFormula = `(${VEC_AX})(${preset.bx}) + (${VEC_AY})(${preset.by}) = ${VEC_AX * preset.bx} ${VEC_AY * preset.by >= 0 ? "+" : "−"} ${Math.abs(VEC_AY * preset.by)}`;

  const bLabelX =
    preset.id === "same" ? bxSvg - 12 : preset.id === "orthogonal" ? bxSvg - 6 : bxSvg + 14;
  const bLabelY =
    preset.id === "same" ? bySvg - 12 : preset.id === "orthogonal" ? bySvg - 12 : bySvg + 18;
  const bLabelAnchor = preset.id === "opposite" ? "start" : "end";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกรูปแบบทิศทางของเวกเตอร์ a และ b" className="flex flex-wrap gap-2">
        {VECTOR_PRESETS.map((item) => {
          const active = item.id === preset.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setPresetId(item.id)}
            >
              {item.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพระนาบ 2 มิติแสดงเวกเตอร์ a และ b ค่า L2 Norm ผลคูณจุด Dot Product และ Unit Cosine"
        >
          <defs>
            <marker id={markerA} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerB} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cyan)" />
            </marker>
          </defs>

          {/* Left: 2D Vector Plane */}
          <rect x="16" y="14" width="320" height="252" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Subtle reference circle (r = 5 units) */}
          <circle
            cx={ox}
            cy={oy}
            r={5 * scale}
            fill="none"
            stroke="var(--hair)"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          {/* Axes */}
          <line x1="30" y1={oy} x2="322" y2={oy} stroke="var(--line)" strokeWidth="1.25" />
          <line x1={ox} y1="26" x2={ox} y2="254" stroke="var(--line)" strokeWidth="1.25" />
          <text x="314" y={oy - 6} textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            x
          </text>
          <text x={ox + 8} y="38" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            y
          </text>

          {/* Angle badge top-left of plane */}
          <rect x="26" y="24" width="76" height="22" rx="6" fill={preset.soft} className={txClass} />
          <text x="64" y="39" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={preset.accent} fontFamily="var(--font-mono)">
            θ = {preset.angleLabel}
          </text>

          {/* Projection dashed flow line from tip of b onto direction of a */}
          {preset.id === "same" && (
            <>
              <line
                x1={ox}
                y1={oy}
                x2={projXSvg}
                y2={projYSvg}
                stroke="var(--success)"
                strokeWidth="5"
                opacity="0.28"
                strokeLinecap="round"
                className={txClass}
              />
              <line
                x1={bxSvg}
                y1={bySvg}
                x2={projXSvg}
                y2={projYSvg}
                stroke="var(--success)"
                strokeWidth="1.75"
                strokeDasharray={reduced ? "4 4" : "5 5"}
                className={flowClass}
              />
            </>
          )}

          {preset.id === "orthogonal" && (
            <path
              d={`M ${ox + 12} ${oy - 9} L ${ox + 3} ${oy - 21} L ${ox - 9} ${oy - 12}`}
              fill="none"
              stroke="var(--warning)"
              strokeWidth="2"
            />
          )}

          {preset.id === "opposite" && (
            <line
              x1={axSvg}
              y1={aySvg}
              x2={bxSvg}
              y2={bySvg}
              stroke="var(--danger)"
              strokeWidth="1.75"
              strokeDasharray={reduced ? "4 4" : "6 6"}
              className={flowClass}
            />
          )}

          {/* Vector a */}
          <line
            x1={ox}
            y1={oy}
            x2={axSvg}
            y2={aySvg}
            stroke="var(--brand)"
            strokeWidth="3"
            markerEnd={`url(#${markerA})`}
            className={txClass}
          />
          <text
            x={axSvg - 4}
            y={aySvg + 18}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="var(--brand-ink)"
            fontFamily="var(--font-mono)"
          >
            a ({VEC_AX}, {VEC_AY})
          </text>

          {/* Vector b */}
          <line
            x1={ox}
            y1={oy}
            x2={bxSvg}
            y2={bySvg}
            stroke="var(--cyan)"
            strokeWidth="3"
            markerEnd={`url(#${markerB})`}
            className={txClass}
          />
          <text
            x={bLabelX}
            y={bLabelY}
            textAnchor={bLabelAnchor}
            fontSize="12"
            fontWeight="700"
            fill="var(--cyan)"
            fontFamily="var(--font-mono)"
            className={txClass}
          >
            b ({preset.bx}, {preset.by})
          </text>

          {/* Origin dot */}
          <circle cx={ox} cy={oy} r="4" fill="var(--fg)" />
          <text x={ox + 7} y={oy + 15} fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
            (0,0)
          </text>

          {/* Right: Live Math Breakdown Panel */}
          <rect x="348" y="14" width="316" height="252" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Row 1: L2 Norms ||a|| and ||b|| */}
          <rect x="360" y="26" width="142" height="54" rx="9" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.25" />
          <text x="372" y="45" fontSize="11" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            L2 Norm ||a||
          </text>
          <text x="372" y="67" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            √(4²+3²) = {normA.toFixed(2)}
          </text>

          <rect x="510" y="26" width="142" height="54" rx="9" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeWidth="1.25" />
          <text x="522" y="45" fontSize="11" fontWeight="700" fill="var(--cyan)" fontFamily="var(--font-mono)">
            L2 Norm ||b||
          </text>
          <text x="522" y="67" fontSize="12.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            √(x²+y²) = {normB.toFixed(2)}
          </text>

          {/* Row 2: Dot Product a · b */}
          <rect x="360" y="90" width="292" height="64" rx="9" fill="var(--surface-2)" stroke="var(--line)" />
          <text x="374" y="111" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ผลคูณจุด Dot Product (a · b)
          </text>
          <text
            x="640"
            y="113"
            textAnchor="end"
            fontSize="16"
            fontWeight="700"
            fill={preset.accent}
            fontFamily="var(--font-mono)"
          >
            {dot > 0 ? `+${dot}` : `${dot}`}
          </text>
          <text x="374" y="138" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-mono)">
            {dotFormula}
          </text>

          {/* Row 3: Normalized Unit Cosine Score */}
          <rect
            x="360"
            y="164"
            width="292"
            height="90"
            rx="9"
            fill={preset.soft}
            stroke={preset.accent}
            strokeWidth="1.5"
            className={txClass}
          />
          <text x="374" y="185" fontSize="11.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            cos θ = (a·b) / (||a||·||b||)
          </text>
          <text
            x="640"
            y="186"
            textAnchor="end"
            fontSize="15"
            fontWeight="700"
            fill={preset.accent}
            fontFamily="var(--font-mono)"
          >
            {cosine > 0 ? `+${cosine.toFixed(2)}` : cosine.toFixed(2)}
          </text>

          {/* Bipolar gauge (-1 to +1) */}
          <rect x={gaugeX} y="198" width={gaugeW} height="12" rx="6" fill="var(--surface)" stroke="var(--hair)" />
          <rect x={fillX} y="198" width={fillW} height="12" rx="6" fill={preset.accent} className={txClass} />
          <line x1={gaugeMid} y1="194" x2={gaugeMid} y2="214" stroke="var(--fg)" strokeWidth="1.5" />
          <text x={gaugeX} y="224" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            -1.0
          </text>
          <text x={gaugeMid} y="224" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            0.0
          </text>
          <text x={gaugeX + gaugeW} y="224" textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            +1.0
          </text>

          <text
            x="506"
            y="244"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fill={preset.accent}
            fontFamily="var(--font-sans)"
          >
            {preset.statusLabel}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {preset.caption}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 4. ProbExpectedValueVisual (prob-expected-value)                           */
/* ========================================================================== */

type CostPreset = "10x" | "2x";

const GAIN_VALUE = 10;

export function ProbExpectedValueVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [confidence, setConfidence] = useState(85);
  const [costPreset, setCostPreset] = useState<CostPreset>("10x");

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerAuto = `${uid}-ev-auto`;
  const markerEsc = `${uid}-ev-esc`;
  const markerIn = `${uid}-ev-in`;

  const p = confidence / 100;
  const cost = costPreset === "10x" ? 100 : 20;
  const expectedGain = p * GAIN_VALUE;
  const expectedLoss = (1 - p) * cost;
  const ev = expectedGain - expectedLoss;
  const isAuto = ev > 0;

  // Break-even confidence where EV = 0: p = cost / (gain + cost)
  const breakEvenP = cost / (GAIN_VALUE + cost);
  const breakEvenPct = breakEvenP * 100;

  // Bottom threshold scale (50% to 98%)
  const scaleMin = 50;
  const scaleMax = 98;
  const trackX = 48;
  const trackW = 584;
  const toTrackX = (pct: number) => trackX + ((pct - scaleMin) / (scaleMax - scaleMin)) * trackW;

  const breakEvenX = toTrackX(breakEvenPct);
  const currentX = toTrackX(confidence);

  // Stacked p bar in left card
  const probBarW = 180;
  const pFillW = Math.round(probBarW * p);

  const captionText = `ที่ความมั่นใจ p = ${confidence}% และต้นทุนความผิดพลาด ${costPreset} (gain = +${GAIN_VALUE}, cost = −${cost}) จะได้ EV = ${p.toFixed(2)}×${GAIN_VALUE} − ${(1 - p).toFixed(2)}×${cost} = ${ev >= 0 ? "+" : ""}${ev.toFixed(2)} → ระบบจึงเลือก ${
    isAuto ? "Auto-Reply (EV > 0)" : "Escalate to Human (EV ≤ 0)"
  } (จุดคุ้มทุนอยู่ที่ ${breakEvenPct.toFixed(1)}%)`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="เลือกอัตราความเสียหายเมื่อตอบผิด" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={costPreset === "10x"}
            className={costPreset === "10x" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={costPreset === "10x" ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setCostPreset("10x")}
          >
            ตอบผิดเสียหาย 10x
          </button>
          <button
            type="button"
            aria-pressed={costPreset === "2x"}
            className={costPreset === "2x" ? "btn btn-sm" : "btn btn-sm btn-quiet"}
            style={costPreset === "2x" ? ACTIVE_BTN_STYLE : undefined}
            onClick={() => setCostPreset("2x")}
          >
            ตอบผิดเสียหาย 2x
          </button>
        </div>

        <label className="flex min-w-[230px] flex-1 flex-col gap-1 text-sm sm:max-w-xs">
          <span className="flex items-center justify-between font-medium">
            <span>ความมั่นใจโมเดล (p)</span>
            <span className="mono-label text-brand-ink tabular-nums">{confidence}%</span>
          </span>
          <input
            type="range"
            min={50}
            max={98}
            step={1}
            value={confidence}
            aria-label="ความมั่นใจโมเดลตั้งแต่ 50 ถึง 98 เปอร์เซ็นต์"
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="h-6 w-full cursor-pointer accent-[color:var(--brand)]"
          />
        </label>
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพคำนวณค่าคาดหวัง Expected Value เพื่อตัดสินใจ Auto-Reply หรือ Escalate to Human"
        >
          <defs>
            <marker id={markerIn} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--brand)" />
            </marker>
            <marker id={markerAuto} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={markerEsc} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--warning)" />
            </marker>
          </defs>

          {/* Left Card: Probability & Payoff Breakdown */}
          <rect x="16" y="16" width="210" height="170" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="38" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            โอกาสถูก vs ผิด (p)
          </text>
          <text x="212" y="39" textAnchor="end" fontSize="14" fontWeight="700" fill="var(--brand-ink)" fontFamily="var(--font-mono)">
            {confidence}%
          </text>

          {/* Split probability bar */}
          <rect x="30" y="50" width={probBarW} height="14" rx="7" fill="var(--danger)" />
          <rect x="30" y="50" width={pFillW} height="14" rx="7" fill="var(--success)" className={txClass} />

          {/* Expected Gain row */}
          <rect x="30" y="76" width="180" height="36" rx="8" fill="var(--success-soft)" />
          <text x="38" y="92" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            p × gain = {p.toFixed(2)}×(+{GAIN_VALUE})
          </text>
          <text x="38" y="106" fontSize="12" fontWeight="700" fill="var(--success)" fontFamily="var(--font-mono)">
            +{expectedGain.toFixed(2)}
          </text>

          {/* Expected Loss row */}
          <rect x="30" y="120" width="180" height="36" rx="8" fill="var(--danger-soft)" />
          <text x="38" y="136" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            (1−p)×cost = {(1 - p).toFixed(2)}×(−{cost})
          </text>
          <text x="38" y="150" fontSize="12" fontWeight="700" fill="var(--danger)" fontFamily="var(--font-mono)">
            −{expectedLoss.toFixed(2)}
          </text>

          <text x="121" y="175" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            Break-even p* = {breakEvenPct.toFixed(1)}%
          </text>

          {/* Input flow arrow -> Center EV Gate */}
          <line
            x1="228"
            y1="101"
            x2="254"
            y2="101"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeDasharray={reduced ? undefined : "5 5"}
            className={flowClass}
            markerEnd={`url(#${markerIn})`}
          />

          {/* Center Card: EV Computation Gate */}
          <rect
            x="258"
            y="34"
            width="162"
            height="134"
            rx="12"
            fill={isAuto ? "var(--success-soft)" : "var(--warning-soft)"}
            stroke={isAuto ? "var(--success)" : "var(--warning)"}
            strokeWidth="1.75"
            className={txClass}
          />
          <text x="339" y="57" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            Expected Value
          </text>
          <text x="339" y="75" textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
            p·gain − (1−p)·cost
          </text>
          <text
            x="339"
            y="114"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fill={isAuto ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {ev >= 0 ? `+${ev.toFixed(2)}` : ev.toFixed(2)}
          </text>
          <rect x="274" y="130" width="130" height="24" rx="6" fill="var(--surface)" />
          <text
            x="339"
            y="146"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fill={isAuto ? "var(--success)" : "var(--warning)"}
            fontFamily="var(--font-mono)"
          >
            {isAuto ? "EV > 0 (คุ้มเสี่ยง)" : "EV ≤ 0 (ไม่คุ้มเสี่ยง)"}
          </text>

          {/* Branching flow paths from Center to Right Outcomes */}
          <path
            d="M 420 82 C 436 82, 438 55, 454 55"
            fill="none"
            stroke={isAuto ? "var(--success)" : "var(--hair)"}
            strokeWidth={isAuto ? "2.75" : "1.5"}
            strokeDasharray={isAuto ? (reduced ? undefined : "6 6") : "4 4"}
            className={isAuto ? flowClass : undefined}
            markerEnd={isAuto ? `url(#${markerAuto})` : undefined}
          />
          <path
            d="M 420 120 C 436 120, 438 147, 454 147"
            fill="none"
            stroke={!isAuto ? "var(--warning)" : "var(--hair)"}
            strokeWidth={!isAuto ? "2.75" : "1.5"}
            strokeDasharray={!isAuto ? (reduced ? undefined : "6 6") : "4 4"}
            className={!isAuto ? flowClass : undefined}
            markerEnd={!isAuto ? `url(#${markerEsc})` : undefined}
          />

          {/* Top-Right Outcome: Auto-Reply (EV > 0) */}
          <g opacity={isAuto ? 1 : 0.45} className={txClass}>
            <rect
              x="458"
              y="16"
              width="206"
              height="78"
              rx="12"
              fill={isAuto ? "var(--success-soft)" : "var(--surface)"}
              stroke={isAuto ? "var(--success)" : "var(--hair)"}
              strokeWidth={isAuto ? "2" : "1.25"}
              className={txClass}
            />
            <text x="472" y="40" fontSize="12.5" fontWeight="700" fill={isAuto ? "var(--success)" : "var(--muted)"} fontFamily="var(--font-mono)">
              Auto-Reply (EV &gt; 0)
            </text>
            <text x="472" y="59" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
              ส่งคำตอบอัตโนมัติทันที
            </text>
            <rect x="472" y="68" width="76" height="18" rx="5" fill="var(--surface)" />
            <text x="510" y="81" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={isAuto ? "var(--success)" : "var(--muted)"} fontFamily="var(--font-mono)">
              {isAuto ? "SELECTED" : "STANDBY"}
            </text>
          </g>

          {/* Bottom-Right Outcome: Escalate to Human (EV <= 0) */}
          <g opacity={!isAuto ? 1 : 0.45} className={txClass}>
            <rect
              x="458"
              y="108"
              width="206"
              height="78"
              rx="12"
              fill={!isAuto ? "var(--warning-soft)" : "var(--surface)"}
              stroke={!isAuto ? "var(--warning)" : "var(--hair)"}
              strokeWidth={!isAuto ? "2" : "1.25"}
              className={txClass}
            />
            <text x="472" y="132" fontSize="12" fontWeight="700" fill={!isAuto ? "var(--warning)" : "var(--muted)"} fontFamily="var(--font-mono)">
              Escalate to Human (EV ≤ 0)
            </text>
            <text x="472" y="151" fontSize="11.5" fill="var(--fg)" fontFamily="var(--font-sans)">
              ส่งต่อเจ้าหน้าที่ตรวจสอบก่อน
            </text>
            <rect x="472" y="160" width="76" height="18" rx="5" fill="var(--surface)" />
            <text x="510" y="173" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={!isAuto ? "var(--warning)" : "var(--muted)"} fontFamily="var(--font-mono)">
              {!isAuto ? "SELECTED" : "STANDBY"}
            </text>
          </g>

          {/* Bottom Threshold Spectrum (50% to 98%) */}
          <rect x="16" y="198" width="648" height="68" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="218" fontSize="11.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            เส้นแบ่งการตัดสินใจตามความมั่นใจ (Decision Threshold)
          </text>
          <text x="650" y="218" textAnchor="end" fontSize="11.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--font-mono)">
            จุดตัด p* = {breakEvenPct.toFixed(1)}%
          </text>

          {/* Escalate zone (left of break-even) */}
          <rect
            x={trackX}
            y="230"
            width={Math.max(4, breakEvenX - trackX)}
            height="12"
            rx="6"
            fill="var(--warning-soft)"
            stroke="var(--warning)"
            className={txClass}
          />
          {/* Auto-Reply zone (right of break-even) */}
          <rect
            x={breakEvenX}
            y="230"
            width={Math.max(4, trackX + trackW - breakEvenX)}
            height="12"
            rx="6"
            fill="var(--success-soft)"
            stroke="var(--success)"
            className={txClass}
          />

          {/* Break-even vertical divider */}
          <line
            x1={breakEvenX}
            y1="224"
            x2={breakEvenX}
            y2="248"
            stroke="var(--fg)"
            strokeWidth="2"
            strokeDasharray="3 2"
            className={txClass}
          />

          {/* Current confidence marker */}
          <circle
            cx={currentX}
            cy="236"
            r="7.5"
            fill={isAuto ? "var(--success)" : "var(--warning)"}
            stroke="var(--surface)"
            strokeWidth="2.5"
            className={txClass}
          />

          {/* Scale ticks */}
          <text x={trackX} y="259" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
            50%
          </text>
          <text x={breakEvenX} y="259" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            p* {breakEvenPct.toFixed(1)}%
          </text>
          <text x={trackX + trackW} y="259" textAnchor="end" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
            98%
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {captionText}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* 5. MlVsLlmMatrixVisual (ml-vs-llm-matrix)                                  */
/* ========================================================================== */

type MatrixScenarioId = "ticket" | "email" | "churn" | "hybrid";

interface MatrixScenario {
  id: MatrixScenarioId;
  btnLabel: string;
  dataTag: string;
  badgeText: string;
  badgeColor: string;
  badgeSoft: string;
  mlTraffic: string;
  llmTraffic: string;
  mlActive: boolean;
  llmActive: boolean;
  recLabel: string;
  recLatencyMs: number;
  recLatencyText: string;
  recCostUsd: number;
  recCostText: string;
  altLabel: string;
  altLatencyText: string;
  altCostText: string;
  altDisabled?: boolean;
  takeaway: string;
  savingsPill: string;
  caption: string;
}

const MATRIX_SCENARIOS: MatrixScenario[] = [
  {
    id: "ticket",
    btnLabel: "จัดระดับทิกเก็ต 100k/วัน",
    dataTag: "ข้อความสั้น · คลาสคงที่ (4 หมวด)",
    badgeText: "แนะนำ: Classic ML",
    badgeColor: "var(--success)",
    badgeSoft: "var(--success-soft)",
    mlTraffic: "100% ML",
    llmTraffic: "0%",
    mlActive: true,
    llmActive: false,
    recLabel: "Classic ML",
    recLatencyMs: 4,
    recLatencyText: "4ms",
    recCostUsd: 0.05,
    recCostText: "$0.05",
    altLabel: "LLM ล้วน",
    altLatencyText: "850ms",
    altCostText: "$45.00",
    takeaway: "งานจำแนกปริมาณสูง 100k/วัน: Classic ML เร็วกว่า 212× และประหยัดกว่า 900×",
    savingsPill: "ประหยัด 99.9%",
    caption:
      "จัดระดับทิกเก็ต 100k/วัน: เหมาะกับ Classic ML (TF-IDF + Linear/LightGBM) ที่ตอบใน 4ms และต้นทุนเพียง $0.05 ต่อ 100k คำขอ เทียบกับ LLM ล้วนที่ช้า 850ms และแพงถึง $45",
  },
  {
    id: "email",
    btnLabel: "สรุปอีเมลยาวไม่เป็นโครงสร้าง",
    dataTag: "เอกสารอิสระ · ต้องสร้างภาษาธรรมชาติ",
    badgeText: "แนะนำ: LLM API",
    badgeColor: "var(--brand-ink)",
    badgeSoft: "var(--brand-soft)",
    mlTraffic: "N/A",
    llmTraffic: "100% LLM",
    mlActive: false,
    llmActive: true,
    recLabel: "LLM API",
    recLatencyMs: 850,
    recLatencyText: "850ms",
    recCostUsd: 45,
    recCostText: "$45.00",
    altLabel: "Classic ML",
    altLatencyText: "ไม่รองรับ",
    altCostText: "สรุปไม่ได้",
    altDisabled: true,
    takeaway: "งานสรุปและเรียบเรียงข้อความอิสระ: ต้องใช้ LLM แม้ต้นทุนสูงและหน่วง 850ms",
    savingsPill: "Generative Only",
    caption:
      "สรุปอีเมลยาวไม่เป็นโครงสร้าง: Classic ML ไม่สามารถสร้างข้อความสรุปเชิงภาษาได้อย่างยืดหยุ่น จึงจำเป็นต้องใช้ LLM API (850ms, $45/100k) และคุมต้นทุนด้วยการจำกัดบริบทแทน",
  },
  {
    id: "churn",
    btnLabel: "ทำนาย Churn ลูกค้าจากตาราง",
    dataTag: "Tabular Features · ตัวเลข + พฤติกรรม",
    badgeText: "แนะนำ: LightGBM (ML)",
    badgeColor: "var(--success)",
    badgeSoft: "var(--success-soft)",
    mlTraffic: "100% GBDT",
    llmTraffic: "0%",
    mlActive: true,
    llmActive: false,
    recLabel: "LightGBM",
    recLatencyMs: 4,
    recLatencyText: "4ms",
    recCostUsd: 0.05,
    recCostText: "$0.05",
    altLabel: "LLM ล้วน",
    altLatencyText: "850ms",
    altCostText: "$45.00",
    takeaway: "ข้อมูลตารางตัวเลข: Tree-based ML แม่นยำกว่า LLM พร้อมความเร็วระดับ 4ms",
    savingsPill: "เร็วกว่า 212×",
    caption:
      "ทำนาย Churn ลูกค้าจากตาราง: โมเดลตารางอย่าง LightGBM เรียนรู้ความสัมพันธ์ของตัวเลขได้แม่นกว่า LLM มาก ด้วยเวลาเพียง 4ms และต้นทุน $0.05 ต่อ 100k คำขอ",
  },
  {
    id: "hybrid",
    btnLabel: "Hybrid Route: ML 80% + LLM 20%",
    dataTag: "ML คัดกรองเคสง่าย · ส่งเคสกำกวมให้ LLM",
    badgeText: "แนะนำ: Hybrid Router",
    badgeColor: "var(--cyan)",
    badgeSoft: "var(--cyan-soft)",
    mlTraffic: "80% เคสง่าย",
    llmTraffic: "20% กำกวม",
    mlActive: true,
    llmActive: true,
    recLabel: "Hybrid 80/20",
    recLatencyMs: 173,
    recLatencyText: "~173ms",
    recCostUsd: 9.04,
    recCostText: "$9.04",
    altLabel: "LLM ล้วน",
    altLatencyText: "850ms",
    altCostText: "$45.00",
    takeaway: "สถาปัตยกรรมจริงในโปรดักชัน: ให้ ML จบงานง่าย 80% (4ms) และส่งเคสยาก 20% ให้ LLM",
    savingsPill: "ลดต้นทุน 80%",
    caption:
      "Hybrid Route (ML 80% + LLM 20%): ใช้ Classic ML จัดการ 80% ที่มั่นใจสูงใน 4ms และส่งต่อเฉพาะ 20% ที่ซับซ้อนไป LLM ทำให้ Latency เฉลี่ยเหลือ ~173ms และต้นทุนลดจาก $45 เหลือ $9.04 ต่อ 100k คำขอ",
  },
];

export function MlVsLlmMatrixVisual({ reduced = false }: VisualProps) {
  const uid = useId();
  const [scenarioId, setScenarioId] = useState<MatrixScenarioId>("ticket");
  const sc = MATRIX_SCENARIOS.find((item) => item.id === scenarioId) ?? MATRIX_SCENARIOS[0];

  const flowClass = reduced ? undefined : "svg-flow-line";
  const txClass = reduced ? undefined : "transition-all duration-300";
  const markerMl = `${uid}-mx-ml`;
  const markerLlm = `${uid}-mx-llm`;

  const maxBarW = 204;
  const recLatW = Math.max(12, Math.round((sc.recLatencyMs / 850) * maxBarW));
  const recCostW = Math.max(10, Math.round((sc.recCostUsd / 45) * maxBarW));
  const altLatW = sc.altDisabled ? 0 : maxBarW;
  const altCostW = sc.altDisabled ? 0 : maxBarW;

  const recBarColor =
    sc.id === "hybrid" ? "var(--cyan)" : sc.id === "email" ? "var(--brand)" : "var(--success)";

  return (
    <div className="space-y-3">
      <div role="group" aria-label="เลือกสถานการณ์เปรียบเทียบ Classic ML กับ LLM" className="flex flex-wrap gap-2">
        {MATRIX_SCENARIOS.map((item) => {
          const active = item.id === sc.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={active ? "btn btn-sm" : "btn btn-sm btn-quiet"}
              style={active ? ACTIVE_BTN_STYLE : undefined}
              onClick={() => setScenarioId(item.id)}
            >
              {item.btnLabel}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-hair p-2 sm:p-3" style={{ background: "var(--surface-2)" }}>
        <svg
          viewBox="0 0 680 280"
          className="w-full h-auto block"
          role="img"
          aria-label="แผนภาพเมทริกซ์ตัดสินใจเลือกใช้ Classic ML เทียบกับ LLM ตาม Latency และต้นทุนต่อ 100k คำขอ"
        >
          <defs>
            <marker id={markerMl} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--success)" />
            </marker>
            <marker id={markerLlm} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill={sc.id === "hybrid" ? "var(--cyan)" : "var(--brand)"} />
            </marker>
          </defs>

          {/* Top Scenario & Recommendation Header */}
          <rect x="16" y="12" width="648" height="46" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="32" fontSize="13" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            {sc.btnLabel}
          </text>
          <text x="30" y="49" fontSize="11.5" fill="var(--muted)" fontFamily="var(--font-sans)">
            {sc.dataTag}
          </text>

          {/* Recommendation Badge */}
          <rect
            x="458"
            y="21"
            width="194"
            height="28"
            rx="8"
            fill={sc.badgeSoft}
            stroke={sc.badgeColor}
            strokeWidth="1.5"
            className={txClass}
          />
          <text
            x="555"
            y="39"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={sc.badgeColor}
            fontFamily="var(--font-sans)"
          >
            {sc.badgeText}
          </text>

          {/* Middle Left: Traffic Routing Architecture */}
          <rect x="16" y="68" width="242" height="146" rx="12" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="88" fontSize="11.5" fontWeight="700" fill="var(--muted)" fontFamily="var(--font-sans)">
            เส้นทางคำขอ (Traffic Route)
          </text>

          {/* Input Node */}
          <rect x="26" y="122" width="66" height="44" rx="9" fill="var(--surface-2)" stroke="var(--line)" />
          <text x="59" y="141" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-mono)">
            100k
          </text>
          <text x="59" y="156" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-sans)">
            คำขอ/วัน
          </text>

          {/* Path to Classic ML */}
          <path
            d="M 92 136 C 114 136, 114 114, 140 114"
            fill="none"
            stroke={sc.mlActive ? "var(--success)" : "var(--hair)"}
            strokeWidth={sc.mlActive ? "2.5" : "1.5"}
            strokeDasharray={sc.mlActive ? (reduced ? undefined : "5 5") : "3 3"}
            className={sc.mlActive ? flowClass : undefined}
            markerEnd={sc.mlActive ? `url(#${markerMl})` : undefined}
          />
          <text x="116" y="106" textAnchor="middle" fontSize="10" fontWeight="700" fill={sc.mlActive ? "var(--success)" : "var(--muted)"} fontFamily="var(--font-mono)">
            {sc.mlTraffic}
          </text>

          {/* Path to LLM API */}
          <path
            d="M 92 152 C 114 152, 114 176, 140 176"
            fill="none"
            stroke={sc.llmActive ? (sc.id === "hybrid" ? "var(--cyan)" : "var(--brand)") : "var(--hair)"}
            strokeWidth={sc.llmActive ? "2.5" : "1.5"}
            strokeDasharray={sc.llmActive ? (reduced ? undefined : "5 5") : "3 3"}
            className={sc.llmActive ? flowClass : undefined}
            markerEnd={sc.llmActive ? `url(#${markerLlm})` : undefined}
          />
          <text
            x="116"
            y="196"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={sc.llmActive ? (sc.id === "hybrid" ? "var(--cyan)" : "var(--brand-ink)") : "var(--muted)"}
            fontFamily="var(--font-mono)"
          >
            {sc.llmTraffic}
          </text>

          {/* Classic ML Node */}
          <g opacity={sc.mlActive ? 1 : 0.45} className={txClass}>
            <rect
              x="144"
              y="95"
              width="102"
              height="40"
              rx="8"
              fill={sc.mlActive ? "var(--success-soft)" : "var(--surface-2)"}
              stroke={sc.mlActive ? "var(--success)" : "var(--hair)"}
              strokeWidth={sc.mlActive ? "1.75" : "1.25"}
              className={txClass}
            />
            <text x="195" y="113" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={sc.mlActive ? "var(--success)" : "var(--muted)"} fontFamily="var(--font-mono)">
              Classic ML
            </text>
            <text x="195" y="128" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
              4ms · $0.05
            </text>
          </g>

          {/* LLM API Node */}
          <g opacity={sc.llmActive ? 1 : 0.45} className={txClass}>
            <rect
              x="144"
              y="156"
              width="102"
              height="40"
              rx="8"
              fill={sc.llmActive ? (sc.id === "hybrid" ? "var(--cyan-soft)" : "var(--brand-soft)") : "var(--surface-2)"}
              stroke={sc.llmActive ? (sc.id === "hybrid" ? "var(--cyan)" : "var(--brand)") : "var(--hair)"}
              strokeWidth={sc.llmActive ? "1.75" : "1.25"}
              className={txClass}
            />
            <text
              x="195"
              y="174"
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill={sc.llmActive ? (sc.id === "hybrid" ? "var(--cyan)" : "var(--brand-ink)") : "var(--muted)"}
              fontFamily="var(--font-mono)"
            >
              LLM API
            </text>
            <text x="195" y="189" textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
              850ms · $45
            </text>
          </g>

          {/* Middle Right: Animated Latency & Cost Bars */}
          <rect x="270" y="68" width="394" height="146" rx="12" fill="var(--surface)" stroke="var(--line)" />

          {/* Section 1: Latency Bar (4ms vs 850ms) */}
          <text x="284" y="89" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            Latency ต่อคำขอ (4ms vs 850ms)
          </text>

          {/* Recommended Latency Row */}
          <text x="284" y="109" fontSize="11" fontWeight="700" fill={recBarColor} fontFamily="var(--font-mono)">
            {sc.recLabel}
          </text>
          <rect x="378" y="99" width={maxBarW} height="12" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
          <rect x="378" y="99" width={recLatW} height="12" rx="6" fill={recBarColor} className={txClass} />
          <text x="652" y="109" textAnchor="end" fontSize="11.5" fontWeight="700" fill={recBarColor} fontFamily="var(--font-mono)">
            {sc.recLatencyText}
          </text>

          {/* Alternative Latency Row */}
          <text x="284" y="128" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            {sc.altLabel}
          </text>
          <rect x="378" y="118" width={maxBarW} height="12" rx="6" fill="var(--surface-2)" stroke="var(--hair)" strokeDasharray={sc.altDisabled ? "4 3" : undefined} />
          {!sc.altDisabled && (
            <rect x="378" y="118" width={altLatW} height="12" rx="6" fill="var(--danger)" opacity="0.7" className={txClass} />
          )}
          <text x="652" y="128" textAnchor="end" fontSize="11.5" fontWeight="600" fill={sc.altDisabled ? "var(--muted)" : "var(--danger)"} fontFamily="var(--font-mono)">
            {sc.altLatencyText}
          </text>

          <line x1="284" y1="141" x2="652" y2="141" stroke="var(--hair)" />

          {/* Section 2: Cost / 100k Bar ($0.05 vs $45) */}
          <text x="284" y="160" fontSize="12" fontWeight="700" fill="var(--fg)" fontFamily="var(--font-sans)">
            ต้นทุนต่อ 100k คำขอ ($0.05 vs $45)
          </text>

          {/* Recommended Cost Row */}
          <text x="284" y="180" fontSize="11" fontWeight="700" fill={recBarColor} fontFamily="var(--font-mono)">
            {sc.recLabel}
          </text>
          <rect x="378" y="170" width={maxBarW} height="12" rx="6" fill="var(--surface-2)" stroke="var(--hair)" />
          <rect x="378" y="170" width={recCostW} height="12" rx="6" fill={recBarColor} className={txClass} />
          <text x="652" y="180" textAnchor="end" fontSize="11.5" fontWeight="700" fill={recBarColor} fontFamily="var(--font-mono)">
            {sc.recCostText}
          </text>

          {/* Alternative Cost Row */}
          <text x="284" y="199" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
            {sc.altLabel}
          </text>
          <rect x="378" y="189" width={maxBarW} height="12" rx="6" fill="var(--surface-2)" stroke="var(--hair)" strokeDasharray={sc.altDisabled ? "4 3" : undefined} />
          {!sc.altDisabled && (
            <rect x="378" y="189" width={altCostW} height="12" rx="6" fill="var(--warning)" opacity="0.8" className={txClass} />
          )}
          <text x="652" y="199" textAnchor="end" fontSize="11.5" fontWeight="600" fill={sc.altDisabled ? "var(--muted)" : "var(--warning)"} fontFamily="var(--font-mono)">
            {sc.altCostText}
          </text>

          {/* Bottom Engineering Takeaway Strip */}
          <rect x="16" y="224" width="648" height="42" rx="10" fill="var(--surface)" stroke="var(--line)" />
          <text x="30" y="249" fontSize="12" fontWeight="600" fill="var(--fg)" fontFamily="var(--font-sans)">
            {sc.takeaway}
          </text>
          <rect x="546" y="233" width="106" height="24" rx="6" fill={sc.badgeSoft} className={txClass} />
          <text x="599" y="249" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={sc.badgeColor} fontFamily="var(--font-mono)">
            {sc.savingsPill}
          </text>
        </svg>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {sc.caption}
      </p>
    </div>
  );
}
