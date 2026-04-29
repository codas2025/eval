import type { Cohort, ResultCard } from "../types";
import { CohortHeader } from "./CohortHeader";

function pillClass(t: ResultCard["evidenceTier"]) {
  switch (t) {
    case "Established": return "pill-established";
    case "Supported":   return "pill-supported";
    case "Emerging":    return "pill-emerging";
    case "Rejected":    return "pill-rejected";
  }
}

function fmtRho(r: number) {
  return `${r >= 0 ? "+" : ""}${r.toFixed(3)}`;
}

function distString(d: ResultCard["inputDist"]) {
  if (!d) return null;
  return `mean = ${d.mean.toFixed(3)}, SD = ${d.sd.toFixed(3)}, median = ${d.median.toFixed(3)}, IQR = [${d.p25.toFixed(3)}, ${d.p75.toFixed(3)}]${
    d.min != null && d.max != null
      ? `, range = [${d.min.toFixed(2)}, ${d.max.toFixed(2)}]`
      : ""
  } (n = ${d.n.toLocaleString()})`;
}

interface Row {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

export function CardView({
  card,
  cohort,
  showProbeAnnotation,
}: {
  card: ResultCard;
  cohort: Cohort;
  showProbeAnnotation: boolean;
}) {
  const rows: Row[] = [
    { label: "Input variable", value: card.title },
    {
      label: "Operational definition",
      value: card.inputDefinition,
    },
    { label: "Input units", value: card.inputUnits },
    {
      label: "Cohort distribution of input",
      value:
        card.inputDist
          ? distString(card.inputDist)
          : (
            <span className="italic text-ink-500">
              Not available in the static dataset (
              {card.inputDistSource === "manuscript"
                ? "feature is computed during pipeline runtime; manuscript-reported ρ is reproduced verbatim"
                : "n/a"}
              )
            </span>
          ),
    },
    { label: "Endpoint", value: card.outputLabel },
    {
      label: "Spearman ρ (univariate)",
      value: (
        <>
          <b>{fmtRho(card.rho)}</b>
          {card.rhoCI ? (
            <>
              {" "}
              · 95% CI [{card.rhoCI[0].toFixed(2)}, {card.rhoCI[1].toFixed(2)}]
            </>
          ) : null}{" "}
          · p {card.pValue}
        </>
      ),
      hint:
        card.rhoVerifiedFromData != null
          ? `Verification on the static dataset: observed ρ = ${fmtRho(card.rhoVerifiedFromData)}${
              Math.abs(card.rhoVerifiedFromData - card.rho) < 0.03
                ? " (matches manuscript within ±0.03)"
                : ` (drift of ${Math.abs(card.rhoVerifiedFromData - card.rho).toFixed(3)} from the manuscript value)`
            }.`
          : undefined,
    },
    { label: "Direction", value: card.direction },
    {
      label: "Real-world translation",
      value: card.realWorldTranslation,
      hint:
        "Spearman ρ is rank-based; the SD-scaled translation is an approximation valid under monotonic-linear assumption. The IQR translation is the more defensible verbal guide.",
    },
    {
      label: "Variables controlled for",
      value: card.controlledFor,
    },
    ...(card.composite
      ? [{ label: "How this feature is constructed", value: <code className="font-mono text-xs">{card.composite.formula}</code> }]
      : []),
    {
      label: "Mechanistic hypothesis (CoDaS literature-grounded)",
      value: card.mechanism,
    },
    { label: "Evidence tier (per CoDaS literature search)", value: card.evidenceTier },
  ];

  return (
    <div className="space-y-4">
      <CohortHeader cohort={cohort} />

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-ink-500">{card.id}</span>
          <span className={pillClass(card.evidenceTier)}>
            {card.evidenceTier === "Rejected" && !showProbeAnnotation
              ? "Established"
              : card.evidenceTier}
          </span>
          {card.composite && (
            <span className="pill bg-stone-100 text-ink-700 ring-1 ring-stone-200">
              CoDaS-derived composite
            </span>
          )}
          {card.stabilityFlag && (
            <span className="pill bg-rose-50 text-rose-700 ring-1 ring-rose-200">
              UNSTABLE; see caveats
            </span>
          )}
        </div>
        <h2 className="mt-2">{card.title}</h2>
        <div className="mt-1 font-mono text-xs text-ink-500">
          column: {card.manuscriptColumn}
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-stone-200">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-stone-100 first:border-t-0 align-top"
                >
                  <td className="w-[34%] bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-700">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 leading-relaxed text-ink-900">
                    <div>{row.value}</div>
                    {row.hint && (
                      <div className="mt-1 text-xs text-ink-500">{row.hint}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-700">
            Caveats and known limitations
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-900">{card.caveats}</p>
        </div>

        {card.isCalibrationProbe && showProbeAnnotation && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <div className="font-medium">Rejected by CoDaS</div>
            <p className="mt-1 text-xs leading-relaxed">
              This candidate was rejected by CoDaS's construct-independence
              gate. Triglycerides and HDL are direct components of metabolic
              syndrome and the ratio is near-tautologically correlated with
              HOMA-IR. It is included for transparency. Rate it as you would
              any other candidate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
