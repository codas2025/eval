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

export function CardView({
  card,
  cohort,
  showProbeAnnotation,
}: {
  card: ResultCard;
  cohort: Cohort;
  showProbeAnnotation: boolean;
}) {
  const d = card.inputDist;
  return (
    <div className="space-y-4">
      <CohortHeader cohort={cohort} />

      <div className="card p-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ink-500">{card.id}</span>
          <span className={pillClass(card.evidenceTier)}>
            {card.evidenceTier === "Rejected" && !showProbeAnnotation
              ? "Established"  // hide rejection annotation for one of the calibration arms
              : card.evidenceTier}
          </span>
          {card.composite && (
            <span className="pill bg-stone-100 text-ink-700 ring-1 ring-stone-200">
              CoDaS-derived composite
            </span>
          )}
          {card.stabilityFlag && (
            <span className="pill bg-rose-50 text-rose-700 ring-1 ring-rose-200">
              UNSTABLE — see caveats
            </span>
          )}
        </div>
        <h2 className="mt-2">{card.title}</h2>
        <div className="mt-1 font-mono text-xs text-ink-500">
          column: {card.manuscriptColumn}
        </div>

        <Section title="Input variable">
          <p>{card.inputDefinition}</p>
          <p className="mt-2 text-xs text-ink-500">
            <b>Units:</b> {card.inputUnits}.
          </p>
          {d ? (
            <p className="mt-1 text-xs text-ink-500">
              <b>Cohort distribution (from data):</b> n = {d.n.toLocaleString()},
              mean = {d.mean.toFixed(3)}, SD = {d.sd.toFixed(3)}, median ={" "}
              {d.median.toFixed(3)}, IQR = [{d.p25.toFixed(3)},{" "}
              {d.p75.toFixed(3)}]
              {d.min != null && d.max != null
                ? `, range = [${d.min.toFixed(2)}, ${d.max.toFixed(2)}]`
                : ""}
              .
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-500 italic">
              Cohort distribution not available in the static dataset (
              {card.inputDistSource === "manuscript"
                ? "feature is computed during pipeline runtime; manuscript-reported ρ is reproduced verbatim"
                : "n/a"}
              ).
            </p>
          )}
        </Section>

        <Section title="Output variable (endpoint)">
          <p>{card.outputLabel}</p>
        </Section>

        <Section title="Reported association (univariate)">
          <p>
            Spearman ρ ={" "}
            <b>
              {card.rho >= 0 ? "+" : ""}
              {card.rho.toFixed(3)}
            </b>
            {card.rhoCI && (
              <>
                {" "}, 95% CI [{card.rhoCI[0].toFixed(2)}, {card.rhoCI[1].toFixed(2)}]
              </>
            )}
            ; p {card.pValue}.
          </p>
          <p className="mt-1 text-sm">{card.direction}</p>
          {card.rhoVerifiedFromData != null && (
            <p className="mt-1 text-xs text-ink-500">
              <b>Verification</b> (recomputed on the static dataset): observed ρ
              = {card.rhoVerifiedFromData >= 0 ? "+" : ""}
              {card.rhoVerifiedFromData.toFixed(3)} —{" "}
              {Math.abs(card.rhoVerifiedFromData - card.rho) < 0.03
                ? "matches manuscript within ±0.03"
                : `drift of ${Math.abs(card.rhoVerifiedFromData - card.rho).toFixed(3)} from manuscript value`}
              .
            </p>
          )}
        </Section>

        <Section title="Real-world translation">
          <p>{card.realWorldTranslation}</p>
          <p className="mt-1 text-xs text-ink-500">
            Spearman ρ is rank-based; the SD-scaled translation is an
            approximation valid under monotonic-linear assumption. Use the IQR
            translation as the more defensible verbal guide.
          </p>
        </Section>

        <Section title="Variables controlled for / not controlled for">
          <p>{card.controlledFor}</p>
        </Section>

        {card.composite && (
          <Section title="How CoDaS constructed this feature">
            <p className="font-mono text-xs">{card.composite.formula}</p>
          </Section>
        )}

        <Section title="Mechanistic hypothesis (CoDaS literature-grounded)">
          <p>{card.mechanism}</p>
        </Section>

        <Section title="Caveats and known limitations">
          <p>{card.caveats}</p>
        </Section>

        {card.isCalibrationProbe && showProbeAnnotation && (
          <Section title="⚠ Calibration probe (study methodology)">
            <p className="text-rose-700">
              This row was REJECTED by CoDaS's construct-independence gate.
              Triglycerides and HDL are direct definitional components of
              metabolic syndrome and the ratio exhibits a near-tautological
              correlation with HOMA-IR. It is shown here to demonstrate the
              pipeline's leakage-detection. Please rate it as you would any
              other candidate.
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-700">
        {title}
      </h3>
      <div className="mt-1 text-sm leading-relaxed text-ink-900">
        {children}
      </div>
    </div>
  );
}
