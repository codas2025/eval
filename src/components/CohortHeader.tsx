import { useState } from "react";
import type { Cohort } from "../types";
import { PaperLink } from "./icons";
import { Histogram } from "./Histogram";

const UNIT_HINT: Record<Cohort["id"], string> = {
  dwb_hourly: "Each participant has one PHQ-8 score, an integer between 0 and 24. Higher = more depressive symptoms.",
  globem: "Each wave-observation has one PHQ-4 score, an integer between 0 and 12. Higher = more depression / anxiety symptoms.",
  wearme: "Each participant has one HOMA-IR value (a unitless continuous index). Higher = more insulin-resistant. The clinical cut-off used here is 2.5.",
};

export function CohortHeader({ cohort }: { cohort: Cohort }) {
  const d = cohort.endpointDist;
  const unit = cohort.endpointUnit ?? "";
  const fmtUnit = unit ? ` ${unit}` : "";
  const range = cohort.endpointRange
    ? `${cohort.endpointRange[0]} to ${cohort.endpointRange[1]}${fmtUnit}`
    : `continuous${fmtUnit}`;
  const cutoffNote =
    d.pct_above_cutoff != null
      ? `${(d.pct_above_cutoff * 100).toFixed(1)}% above cut-off${
          cohort.endpointCutoff ? ` (>${cohort.endpointCutoff}${fmtUnit})` : ""
        }`
      : "";

  const [showCols, setShowCols] = useState(false);
  const totalCols = cohort.availableColumns.reduce(
    (acc, d) => acc + (d.nFeatures ?? d.examples?.length ?? 0),
    0,
  );

  const distNumbers = (
    <div>
      n = {d.n.toLocaleString()}, mean {d.mean.toFixed(2)}
      {fmtUnit}, SD {d.sd.toFixed(2)}, median {d.median}, IQR [
      {d.p25}, {d.p75}]
      {cutoffNote ? `, ${cutoffNote}` : ""}
      <div className="mt-1 text-[11px] text-ink-500">{UNIT_HINT[cohort.id]}</div>
      {cohort.endpointHistogram && (
        <div className="mt-2">
          <Histogram
            data={cohort.endpointHistogram}
            cutoff={cohort.endpointCutoff}
            unit={unit}
            highlightIQR={[d.p25, d.p75]}
          />
        </div>
      )}
    </div>
  );

  const summary: { k: string; v: React.ReactNode }[] = [
    {
      k: "Study",
      v: (
        <div>
          <div className="font-semibold">{cohort.name}</div>
          {cohort.displayName ? (
            <div className="text-ink-500">{cohort.displayName}</div>
          ) : null}
        </div>
      ),
    },
    { k: "Participants (N)", v: cohort.n.toLocaleString() },
    { k: "Endpoint", v: `${cohort.endpointLabel} (range ${range})` },
    ...(cohort.endpointTLDR
      ? [{ k: "What this endpoint means", v: cohort.endpointTLDR }]
      : []),
    { k: "Endpoint distribution", v: distNumbers },
    { k: "Demographic covariates", v: cohort.covariates.join(", ") },
    { k: "Population", v: cohort.populationDescriptor },
  ];

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink-900">{cohort.name}</div>
          {cohort.displayName ? (
            <div className="text-[11px] font-normal text-ink-500">
              {cohort.displayName}
            </div>
          ) : null}
        </div>
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
