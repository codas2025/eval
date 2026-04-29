import { useState } from "react";
import type { Cohort } from "../types";

export function CohortHeader({ cohort }: { cohort: Cohort }) {
  const d = cohort.endpointDist;
  const range = cohort.endpointRange
    ? `${cohort.endpointRange[0]}–${cohort.endpointRange[1]}`
    : "continuous";
  const cutoff =
    d.pct_above_cutoff != null
      ? ` (${(d.pct_above_cutoff * 100).toFixed(1)}% above clinical cutoff${
          cohort.endpointCutoff ? ` of ${cohort.endpointCutoff}` : ""
        })`
      : "";
  const [showCols, setShowCols] = useState(false);
  const totalCols = cohort.availableColumns.reduce(
    (acc, d) => acc + (d.nFeatures ?? d.examples?.length ?? 0),
    0,
  );

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-ink-700">
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-ink-900">
          Cohort: {cohort.name} (N = {cohort.n.toLocaleString()})
        </div>
        {cohort.sourceUrl && (
          <a
            className="shrink-0 text-xs font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900"
            href={cohort.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source paper ↗
          </a>
        )}
      </div>

      <p className="mt-1">{cohort.populationDescriptor}</p>
      <p className="mt-2">
        <b>Endpoint:</b> {cohort.endpointLabel} ({range}); n ={" "}
        {d.n.toLocaleString()}, mean = {d.mean.toFixed(2)}, SD ={" "}
        {d.sd.toFixed(2)}, median = {d.median}, IQR = [{d.p25}, {d.p75}]
        {cutoff}.
      </p>
      <p className="mt-1">
        <b>Available demographic covariates</b> (cohort-level ML model only —
        not adjusted in the per-feature ρ): {cohort.covariates.join(", ")}.
      </p>

      <div className="mt-3">
        <button
          type="button"
          className="text-xs font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900"
          onClick={() => setShowCols((v) => !v)}
        >
          {showCols ? "▾" : "▸"} Available feature domains in this cohort{" "}
          <span className="text-ink-500">
            ({cohort.availableColumns.length} domains
            {totalCols ? `, ~${totalCols.toLocaleString()} features` : ""})
          </span>
        </button>
        {showCols && (
          <div className="mt-2 overflow-hidden rounded-md border border-stone-200 bg-white">
            <table className="w-full text-xs">
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
                    <td className="px-3 py-2 text-ink-700">{d.nFeatures ?? d.examples?.length ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-700">
                      {d.examples ? d.examples.join("; ") : <span className="text-ink-300">—</span>}
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
