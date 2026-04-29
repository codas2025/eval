import type { Cohort } from "../types";

export function CohortHeader({ cohort }: { cohort: Cohort }) {
  const d = cohort.endpointDist;
  const range = cohort.endpointRange
    ? `${cohort.endpointRange[0]}–${cohort.endpointRange[1]}`
    : "continuous";
  const cutoff =
    d.pct_above_cutoff != null
      ? ` (${(d.pct_above_cutoff * 100).toFixed(1)}% above clinical cutoff${cohort.endpointCutoff ? ` of ${cohort.endpointCutoff}` : ""})`
      : "";
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-ink-700">
      <div className="font-semibold text-ink-900">
        Cohort: {cohort.name} (N = {cohort.n.toLocaleString()})
      </div>
      <p className="mt-1">{cohort.populationDescriptor}</p>
      <p className="mt-2">
        <b>Endpoint:</b> {cohort.endpointLabel} ({range}); n = {d.n.toLocaleString()},
        mean = {d.mean.toFixed(2)}, SD = {d.sd.toFixed(2)}, median = {d.median},
        IQR = [{d.p25}, {d.p75}]{cutoff}.
      </p>
      <p className="mt-1">
        <b>Available demographic covariates</b> (cohort-level ML model only — not
        adjusted in the per-feature ρ): {cohort.covariates.join(", ")}.
      </p>
      {cohort.notes && (
        <p className="mt-2 text-ink-500 italic">Note: {cohort.notes}</p>
      )}
    </div>
  );
}
