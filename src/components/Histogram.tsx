import type { Histogram as HistogramData } from "../types";

/** Tiny inline histogram. Designed to be visually unfussy: one column per bin,
 *  no axes, range labels and a single cut-off marker. Intent is to give the
 *  clinician a glance-level sense of distribution shape so the
 *  mean/median/IQR numbers feel concrete. */
export function Histogram({
  data,
  width = 320,
  height = 56,
  cutoff,
  unit,
  highlightIQR,
}: {
  data: HistogramData;
  width?: number;
  height?: number;
  /** Optional vertical line at this x-value (e.g. the clinical cut-off). */
  cutoff?: number;
  unit?: string;
  /** Optional [p25, p75] to softly shade the IQR band. */
  highlightIQR?: [number, number];
}) {
  const { edges, counts, n } = data;
  if (!edges.length || !counts.length) return null;

  const x0 = edges[0];
  const xN = edges[edges.length - 1];
  const span = xN - x0 || 1;
  const maxCount = Math.max(...counts, 1);

  const padL = 4;
  const padR = 4;
  const padT = 4;
  const padB = 14;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const xPx = (x: number) => padL + ((x - x0) / span) * innerW;
  const yPx = (c: number) => padT + innerH - (c / maxCount) * innerH;

  const iqrShade =
    highlightIQR && highlightIQR.length === 2 && highlightIQR[1] > highlightIQR[0]
      ? { x0: xPx(highlightIQR[0]), x1: xPx(highlightIQR[1]) }
      : null;

  return (
    <figure className="m-0 inline-flex flex-col">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`Histogram of ${unit ?? "the endpoint"} (n = ${n.toLocaleString()})`}
        className="block max-w-full"
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
          return (
            <rect
              key={i}
              x={xLeft}
              y={y}
              width={w}
              height={h}
              fill="#0c4a6e"
              opacity={0.75}
            >
              <title>
                {`${edges[i].toFixed(edges[i] % 1 === 0 ? 0 : 2)} to ${edges[i + 1].toFixed(edges[i + 1] % 1 === 0 ? 0 : 2)}: ${c.toLocaleString()} participants (${((c / n) * 100).toFixed(1)}%)`}
              </title>
            </rect>
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
          >
            <title>{`Clinical cut-off: ${cutoff}`}</title>
          </line>
        )}
        <text x={padL} y={height - 3} fontSize={9} fill="#78716c">
          {String(x0)}
        </text>
        <text
          x={width - padR}
          y={height - 3}
          fontSize={9}
          fill="#78716c"
          textAnchor="end"
        >
          {String(xN)}
        </text>
        {cutoff != null && cutoff > x0 && cutoff < xN && (
          <text
            x={xPx(cutoff)}
            y={height - 3}
            fontSize={9}
            fill="#dc2626"
            textAnchor="middle"
          >
            {`cut-off ${cutoff}`}
          </text>
        )}
      </svg>
      <figcaption className="mt-0.5 text-[10px] text-ink-500">
        Distribution across n = {n.toLocaleString()} participants
        {unit ? ` (${unit})` : ""}.
        {iqrShade ? " Shaded band = interquartile range (25th to 75th percentile)." : ""}
      </figcaption>
    </figure>
  );
}
