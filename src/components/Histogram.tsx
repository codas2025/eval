import { useState } from "react";
import type { Histogram as HistogramData } from "../types";

/** Tiny inline histogram. No axis labels (we already show numeric mean / SD /
 *  median / IQR alongside). Hovering a bar reveals a small popover with the
 *  bin range, count, and percentage. The dashed red line marks the clinical
 *  cut-off when one is supplied. */
export function Histogram({
  data,
  width = 320,
  height = 48,
  cutoff,
  unit,
  highlightIQR,
}: {
  data: HistogramData;
  width?: number;
  height?: number;
  cutoff?: number;
  unit?: string;
  highlightIQR?: [number, number];
}) {
  const { edges, counts, n } = data;
  const [hovered, setHovered] = useState<number | null>(null);

  if (!edges.length || !counts.length) return null;

  const x0 = edges[0];
  const xN = edges[edges.length - 1];
  const span = xN - x0 || 1;
  const maxCount = Math.max(...counts, 1);

  // No axis labels means we can use almost the full canvas for the bars.
  const padL = 2;
  const padR = 2;
  const padT = 2;
  const padB = 2;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const xPx = (x: number) => padL + ((x - x0) / span) * innerW;
  const yPx = (c: number) => padT + innerH - (c / maxCount) * innerH;

  const iqrShade =
    highlightIQR && highlightIQR.length === 2 && highlightIQR[1] > highlightIQR[0]
      ? { x0: xPx(highlightIQR[0]), x1: xPx(highlightIQR[1]) }
      : null;

  const fmtEdge = (v: number) => v.toFixed(v % 1 === 0 ? 0 : 2);

  return (
    <div className="relative inline-block">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`Histogram of ${unit ?? "the endpoint"} (n = ${n.toLocaleString()})`}
        className="block max-w-full"
        onMouseLeave={() => setHovered(null)}
      >
        <rect
          x={padL}
          y={padT}
          width={innerW}
          height={innerH}
          fill="#fafaf9"
          stroke="#e7e5e4"
          strokeWidth={1}
        />
        {iqrShade && (
          <rect
            x={iqrShade.x0}
            y={padT}
            width={Math.max(1, iqrShade.x1 - iqrShade.x0)}
            height={innerH}
            fill="#bae6fd"
            opacity={0.35}
          />
        )}
        {counts.map((c, i) => {
          const xLeft = xPx(edges[i]);
          const xRight = xPx(edges[i + 1]);
          const w = Math.max(1, xRight - xLeft - 1);
          const y = yPx(c);
          const h = padT + innerH - y;
          const isHover = hovered === i;
          return (
            <rect
              key={i}
              x={xLeft}
              y={y}
              width={w}
              height={h}
              fill={isHover ? "#0ea5e9" : "#0c4a6e"}
              opacity={isHover ? 1 : 0.78}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((cur) => (cur === i ? null : cur))}
              style={{ cursor: "default" }}
            />
          );
        })}
        {cutoff != null && cutoff > x0 && cutoff < xN && (
          <line
            x1={xPx(cutoff)}
            x2={xPx(cutoff)}
            y1={padT}
            y2={padT + innerH}
            stroke="#dc2626"
            strokeWidth={1.25}
            strokeDasharray="3 2"
          />
        )}
      </svg>

      {hovered != null && (() => {
        const c = counts[hovered];
        const pct = (c / n) * 100;
        const xCenter = (xPx(edges[hovered]) + xPx(edges[hovered + 1])) / 2;
        const leftPct = (xCenter / width) * 100;
        const includesCutoff =
          cutoff != null &&
          cutoff >= edges[hovered] &&
          cutoff < edges[hovered + 1];
        return (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md bg-ink-900 px-2 py-1.5 text-[11px] leading-snug text-white shadow-lg"
            style={{ left: `${leftPct}%`, top: 0, whiteSpace: "nowrap" }}
            role="tooltip"
          >
            <div className="font-semibold">
              {fmtEdge(edges[hovered])} to {fmtEdge(edges[hovered + 1])}
              {unit ? ` ${unit}` : ""}
            </div>
            <div>
              {c.toLocaleString()} of {n.toLocaleString()} participants
              {" "}
              ({pct.toFixed(1)}%)
            </div>
            {includesCutoff && (
              <div className="mt-0.5 text-rose-300">
                Contains the clinical cut-off ({cutoff})
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
