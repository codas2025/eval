import { CARDS } from "../data/cards";
import { COHORTS } from "../data/cohorts";
import type { Session } from "../types";

interface WelcomeProps {
  onStart: () => void;
  resumable: boolean;
  resumableSession?: Session;
  onResume?: () => void;
  onResetAndStart?: () => void;
}

export function Welcome({
  onStart,
  resumable,
  resumableSession,
  onResume,
  onResetAndStart,
}: WelcomeProps) {
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
        Clinical-validation panel for the CoDaS biomarker discovery pipeline.
      </p>

      {resumable && resumableSession?.reviewer && (
        <section className="mt-6 card border-emerald-200 bg-emerald-50 p-5">
          <div className="text-sm font-semibold text-emerald-900">
            Welcome back{resumableSession.reviewer.name ? `, ${resumableSession.reviewer.name}` : ""}.
          </div>
          <div className="mt-1 text-xs text-emerald-700">
            We saved your progress on this device. You can pick up where you
            left off, or reset and start a fresh session.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={onResume}>
              Resume my session →
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (
                  confirm(
                    "Discard your saved progress on this device and start a new session?",
                  )
                ) {
                  onResetAndStart?.();
                }
              }}
            >
              Start fresh
            </button>
          </div>
        </section>
      )}

      <section className="mt-8 card p-6">
        <h2>About the source datasets</h2>
        <p className="mt-2 text-sm">
          CoDaS surfaced biomarker candidates by analysing three independent
          cohorts. Each card you'll review is anchored to one of these. The
          links below point to the published descriptions of each dataset.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-1">
          {Object.values(COHORTS).map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-ink-900">
                  {c.name} <span className="font-normal text-ink-500">— N = {c.n.toLocaleString()}, endpoint {c.endpointLabel}</span>
                </div>
                {c.sourceUrl && (
                  <a
                    className="shrink-0 text-xs font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900"
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source paper ↗
                  </a>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-700">
                {c.sourceDescription}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 card p-6">
        <h2>What this evaluation is</h2>
        <p className="mt-2 text-sm">
          You will review a set of biomarker candidates surfaced by the CoDaS
          pipeline across the three cohorts above and rate each one along
          seven dimensions: validity confidence, effect-size meaningfulness,
          literature support, practical measurability, added value over
          existing biomarkers, likelihood of influencing patient advice, and
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
            probe — see the methodology note in the final summary).
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
          Your responses are stored in your browser's localStorage as you go,
          and submitted to the secure study database when you click Submit at
          the end. You can also export a JSON copy at any time.
        </p>
      </section>

      {!resumable && (
        <div className="mt-8 flex items-center justify-end gap-3">
          <button className="btn btn-primary" onClick={onStart}>
            Begin
          </button>
        </div>
      )}
    </div>
  );
}
