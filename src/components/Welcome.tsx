import { CARDS } from "../data/cards";
import { COHORTS } from "../data/cohorts";
import type { Session } from "../types";
import { PaperLink } from "./icons";
import { isCardComplete } from "./Progress";

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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Clinical Validation</h1>
      <p className="mt-2 text-sm text-ink-500">
        Clinician panel review of biomarker candidates surfaced by the CoDaS pipeline.
      </p>

      {resumable && resumableSession?.reviewer && (() => {
        const order = resumableSession.cardOrder;
        const total = order.length;
        const completedCount = order.filter((id) =>
          isCardComplete(resumableSession, id),
        ).length;
        const nextIdx = order.findIndex(
          (id) => !isCardComplete(resumableSession, id),
        );
        const nextCard =
          nextIdx >= 0 ? CARDS.find((c) => c.id === order[nextIdx]) : null;
        return (
          <section className="mt-6 card border-sky-200 bg-sky-50 p-5">
            <div className="text-sm font-semibold text-sky-900">
              Welcome back
              {resumableSession.reviewer.name
                ? `, ${resumableSession.reviewer.name}`
                : ""}
              .
            </div>
            <div className="mt-1 text-xs text-sky-800">
              {completedCount === total ? (
                <>All {total} cards complete. Submit when ready.</>
              ) : (
                <>
                  <b>{completedCount}</b> of <b>{total}</b> cards complete.
                  {nextCard && (
                    <>
                      {" "}You'll resume on card <b>{nextIdx + 1}</b>:{" "}
                      <span className="font-mono">{nextCard.id}</span>{" "}
                      <i>{nextCard.title}</i>.
                    </>
                  )}
                </>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={onResume}>
                Resume my session
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (
                    confirm(
                      "Discard your in-progress session and start a new one?",
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
        );
      })()}

      <section className="mt-8 card p-6">
        <h2>Studies</h2>
        <p className="mt-2 text-sm">
          The biomarker candidates were surfaced by analysing three independent
          studies. Each result card below tells you which study the candidate
          comes from and what its endpoint is. The internal handle is shown in
          black with a plain-language description underneath in grey, so you
          can use whichever feels natural.
        </p>
        <div className="mt-4 overflow-hidden rounded-md border border-stone-200">
          <table className="w-full text-sm">
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "26%" }} />
              <col />
              <col style={{ width: "7%" }} />
            </colgroup>
            <thead className="bg-stone-100 text-left text-xs text-ink-700">
              <tr>
                <th className="px-3 py-2 font-medium">Study</th>
                <th className="px-3 py-2 font-medium">N</th>
                <th className="px-3 py-2 font-medium">Endpoint</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">Paper</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(COHORTS).map((c) => (
                <tr key={c.id} className="border-t border-stone-100 align-top">
                  <td className="px-3 py-2 text-ink-900">
                    <div className="font-semibold">{c.name}</div>
                    {c.displayName ? (
                      <div className="text-[11px] text-ink-500">
                        {c.displayName}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-ink-700">{c.n.toLocaleString()}</td>
                  <td className="px-3 py-2 text-ink-700">
                    <div>{c.endpointLabel}</div>
                    {c.endpointUnit && (
                      <div className="text-[11px] text-ink-500">
                        units: {c.endpointUnit}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs leading-relaxed text-ink-700">
                    {c.sourceDescription}
                  </td>
                  <td className="px-3 py-2">
                    {c.sourceUrl && <PaperLink url={c.sourceUrl} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 card p-6">
        <h2>Tasks</h2>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li>
            Rate <b>{CARDS.length}</b> result cards across{" "}
            {Object.keys(COHORTS).length} studies ({counts.dwb_hourly ?? 0}{" "}
            {COHORTS.dwb_hourly.name}, {counts.globem ?? 0}{" "}
            {COHORTS.globem.name}, {counts.wearme ?? 0}{" "}
            {COHORTS.wearme.name}). The Studies table above gives the
            plain-language description for each handle.
          </li>
          <li>
            For each card, answer 8 rating questions plus an optional open ended question.
          </li>
          <li>
            About 5 to 8 minutes per card. Total ≈ 90 to 120 minutes. Saved automatically; you can leave and resume.
          </li>
        </ul>
      </section>

      <section className="mt-6 card p-6">
        <h2>Quick reference</h2>
        <p className="mt-2 text-sm text-ink-700">
          Terms used on the result cards. Hover the underlined ones inside each
          card for a brief reminder.
        </p>
        <div className="mt-3 overflow-hidden rounded-md border border-stone-200">
          <table className="w-full text-xs">
            <tbody className="text-ink-900">
              <tr className="border-t border-stone-100 first:border-t-0 align-top">
                <td className="w-[28%] bg-stone-50 px-3 py-2 font-semibold">PHQ-8</td>
                <td className="px-3 py-2">8-item self-report depression severity score, integer 0 to 24. ≥10 = moderate or worse depression.</td>
              </tr>
              <tr className="border-t border-stone-100 align-top">
                <td className="bg-stone-50 px-3 py-2 font-semibold">PHQ-4</td>
                <td className="px-3 py-2">4-item brief depression / anxiety screener, integer 0 to 12. ≥6 = clinically relevant distress.</td>
              </tr>
              <tr className="border-t border-stone-100 align-top">
                <td className="bg-stone-50 px-3 py-2 font-semibold">HOMA-IR</td>
                <td className="px-3 py-2">Homeostatic Model Assessment of Insulin Resistance. Continuous unitless index = (fasting insulin µU/mL × fasting glucose mg/dL) / 405. ~1.0 in healthy adults; ≥2.5 used here as the insulin-resistance cut-off.</td>
              </tr>
              <tr className="border-t border-stone-100 align-top">
                <td className="bg-stone-50 px-3 py-2 font-semibold">Spearman ρ</td>
                <td className="px-3 py-2">A rank-based correlation. Range −1 to +1. A &nbsp;&rho;&nbsp; near 0 means no monotonic association; ±0.10 small; ±0.30 moderate; ±0.50 large.</td>
              </tr>
              <tr className="border-t border-stone-100 align-top">
                <td className="bg-stone-50 px-3 py-2 font-semibold">IQR</td>
                <td className="px-3 py-2">Interquartile range = the 25th to 75th percentile of the distribution. Half of the participants fall inside this band.</td>
              </tr>
              <tr className="border-t border-stone-100 align-top">
                <td className="bg-stone-50 px-3 py-2 font-semibold">BH-FDR</td>
                <td className="px-3 py-2">Benjamini-Hochberg false-discovery-rate correction for multiple testing. p {"<"} 0.001 (BH-FDR) means the result remains significant after correcting for the dozens of candidates evaluated.</td>
              </tr>
              <tr className="border-t border-stone-100 align-top">
                <td className="bg-stone-50 px-3 py-2 font-semibold">Evidence tier</td>
                <td className="px-3 py-2">CoDaS-assigned label: <i>Established</i> (validates known associations) · <i>Supported</i> (known axis, novel operationalisation) · <i>Emerging</i> (limited prior literature) · <i>Rejected</i> (failed CoDaS construct-independence check).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 card p-6">
        <h2>Privacy</h2>
        <p className="mt-2 text-sm">
          You see only derived statistics: cohort distributions, published effect sizes, and operational definitions. No row level participant data is exposed.
        </p>
      </section>

      {!resumable && (
        <div className="mt-8 flex justify-end">
          <button className="btn btn-primary" onClick={onStart}>
            Begin
          </button>
        </div>
      )}
    </div>
  );
}
