import { CARDS } from "../data/cards";
import { COHORTS } from "../data/cohorts";

export function Welcome({ onStart }: { onStart: () => void }) {
  const counts = CARDS.reduce<Record<string, number>>((acc, c) => {
    acc[c.cohortId] = (acc[c.cohortId] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        CoDaS Clinician Evaluation
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Clinical-validation panel for the Nature Medicine submission of CoDaS:
        AI Co-Data-Scientist for Biomarker Discovery via Wearable Sensors.
      </p>

      <section className="mt-8 card p-6">
        <h2>What this evaluation is</h2>
        <p className="mt-2 text-sm">
          You will review a set of biomarker candidates surfaced by the CoDaS
          pipeline across three cohorts and rate each one along seven
          dimensions: validity confidence, effect-size meaningfulness,
          literature support, practical measurability, added value over
          existing biomarkers, likelihood to influence patient advice, and
          confidence to act on the result in real-world practice. Each card
          takes roughly 5–8 minutes; the full session is approximately 90–120
          minutes and can be saved and resumed in the same browser.
        </p>
      </section>

      <section className="mt-6 card p-6">
        <h2>What you will see</h2>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li>
            <b>{CARDS.length}</b> result cards in total —{" "}
            <b>{counts.dwb_hourly ?? 0}</b> from <i>{COHORTS.dwb_hourly.name}</i>
            , <b>{counts.globem ?? 0}</b> from <i>{COHORTS.globem.name}</i>,{" "}
            <b>{counts.wearme ?? 0}</b> from <i>{COHORTS.wearme.name}</i> (one
            of which is a rejected positive control included as a calibration
            probe — see methodology note in the final summary).
          </li>
          <li>
            Each card defines the input variable, the outcome, the reported
            Spearman ρ, a real-world translation in native outcome units, and
            any controlled or uncontrolled covariates.
          </li>
          <li>
            Card order is randomised per reviewer using your email address as
            the seed, so the same reviewer always sees the same order even
            across reloads or browsers.
          </li>
        </ul>
      </section>

      <section className="mt-6 card p-6">
        <h2>Privacy and consent</h2>
        <p className="mt-2 text-sm">
          You will see only derived statistics: cohort-level distributions,
          published effect sizes, and operational definitions. No row-level
          participant data is exposed. All three source studies have IRB
          approvals and consent texts that explicitly cover third-party
          expert annotation of derived results.
        </p>
        <p className="mt-2 text-sm">
          Your responses are stored in your browser's localStorage as you go.
          At the end you will be able to export them as a single JSON file to
          send back to the study coordinators.
        </p>
      </section>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button className="btn btn-primary" onClick={onStart}>
          Begin
        </button>
      </div>
    </div>
  );
}
