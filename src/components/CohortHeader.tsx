import { useState } from "react";
import type { Cohort } from "../types";
import { PaperLink } from "./icons";

export function CohortHeader({ cohort }: { cohort: Cohort }) {
  const d = cohort.endpointDist;
  const range = cohort.endpointRange
    ? `${cohort.endpointRange[0]} to ${cohort.endpointRange[1]}`
    : "continuous";
  const cutoffNote =
    d.pct_above_cutoff != null
      ? `${(d.pct_above_cutoff * 100).toFixed(1)}% above cutoff${
          cohort.endpointCutoff ? ` (>${cohort.endpointCutoff})` : ""
        }`
      : "";

  const [showCols, setShowCols] = useState(false);
  const totalCols = cohort.availableColumns.reduce(
    (acc, d) => acc + (d.nFeatures ?? d.examples?.length ?? 0),
    0,
  );

  const summary: { k: string; v: React.ReactNode }[] = [
    { k: "Cohort", v: <span className="font-semibold">{cohort.name}</span> },
    { k: "N", v: cohort.n.toLocaleString() },
    { k: "Endpoint", v: `${cohort.endpointLabel} (${range})` },
    {
      k: "Endpoint distribution",
      v: `n = ${d.n.toLocaleString()}, mean ${d.mean.toFixed(2)}, SD ${d.sd.toFixed(2)}, median ${d.median}, IQR [${d.p25}, ${d.p75}]${cutoffNote ? `, ${cutoffNote}` : ""}`,
    },
    { k: "Demographic covariates", v: cohort.covariates.join(", ") },
    { k: "Population", v: cohort.populationDescriptor },
  ];

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-ink-900">{cohort.name}</div>
        {cohort.sourceUrl && <PaperLink url={cohort.sourceUrl} />}
      </div>

      <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
        <table className="w-full">
          <tbody>
            {summary.map((row) => (
              <tr key={row.k} className="border-t border-stone-100 align-top first:border-t-0">
                <td className="w-[28%] bg-stone-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-700">
                  {row.k}
                </td>
                <td className="px-3 py-1.5 text-ink-900">{row.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <button
          type="button"
          className="text-xs font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900"
          onClick={() => setShowCols((v) => !v)}
        >
          {showCols ? "▾" : "▸"} Available feature domains{" "}
          <span className="text-ink-500">
            ({cohort.availableColumns.length} domains
            {totalCols ? `, ~${totalCols.toLocaleString()} features` : ""})
          </span>
        </button>
        {showCols && (
          <div className="mt-2 overflow-hidden rounded-md border border-stone-200 bg-white">
            <table className="w-full">
              <thead className="bg-stone-100">
                <tr className="text-left text-ink-700">
                  <th className="px-3 py-2 font-medium">Domain</th>
                  <th className="px-3 py-2 font-medium">Count</th>
                  <th className="px-3 py-2 font-medium">Examples</th>
                </tr>
              </thead>
              <tbody>
                {cohort.availableColumns.map((d) => (
                  <tr key={d.domain} className="border-t border-stone-100 align-top">
                    <td className="px-3 py-2 font-medium text-ink-900">{d.domain}</td>
                    <td className="px-3 py-2 text-ink-700">{d.nFeatures ?? d.examples?.length ?? ""}</td>
                    <td className="px-3 py-2 text-ink-700">
                      {d.examples ? d.examples.join("; ") : <span className="text-ink-300">&nbsp;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cohort.notes && (
        <p className="mt-3 text-ink-500 italic">Note: {cohort.notes}</p>
      )}
    </div>
  );
}
