import { useMemo } from "react";
import type { Session } from "../types";
import { CARDS } from "../data/cards";
import { GLOBAL_FEEDBACK_PROMPTS, RUBRIC } from "../data/rubric";
import { isCardComplete } from "./Progress";

export function Submit({
  session,
  onUpdateGlobalFeedback,
  onFinish,
  onResume,
  onReset,
}: {
  session: Session;
  onUpdateGlobalFeedback: (id: string, value: string) => void;
  onFinish: () => void;
  onResume: (cardId: string) => void;
  onReset: () => void;
}) {
  const order = session.cardOrder.length
    ? session.cardOrder
    : CARDS.map((c) => c.id);

  const summary = useMemo(() => {
    const incomplete: string[] = [];
    for (const id of order) {
      if (!isCardComplete(session, id)) incomplete.push(id);
    }
    return { incomplete };
  }, [order, session]);

  const allDone = summary.incomplete.length === 0;

  function exportJSON() {
    const payload = {
      ...session,
      finishedAt: new Date().toISOString(),
      meta: {
        rubric: RUBRIC.map(({ id, letter, prompt, scaleType }) => ({
          id, letter, prompt, scaleType,
        })),
        cards: CARDS.map(({ id, cohortId, evidenceTier, title, rho }) => ({
          id, cohortId, evidenceTier, title, rho,
        })),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `codas-eval-${session.reviewer?.reviewerId ?? "anon"}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onFinish();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1>Review and submit</h1>
      <p className="mt-2 text-sm text-ink-500">
        Reviewer {session.reviewer?.reviewerId} · Specialty{" "}
        {session.reviewer?.specialty} ·{" "}
        {summary.incomplete.length === 0
          ? "All cards completed"
          : `${summary.incomplete.length} card${summary.incomplete.length === 1 ? "" : "s"} still incomplete`}
      </p>

      {summary.incomplete.length > 0 && (
        <section className="mt-6 card border-rose-200 bg-rose-50 p-5">
          <h2 className="text-rose-700">Incomplete cards</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {summary.incomplete.map((id) => {
              const card = CARDS.find((c) => c.id === id)!;
              return (
                <li key={id}>
                  <button
                    className="text-left text-rose-700 underline-offset-2 hover:underline"
                    onClick={() => onResume(id)}
                  >
                    {id} — {card.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2>Global feedback (optional)</h2>
        <p className="mt-2 text-xs text-ink-500">
          Any of these may be left blank.
        </p>
        <div className="mt-4 space-y-4">
          {GLOBAL_FEEDBACK_PROMPTS.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="text-sm font-medium text-ink-900">{p.prompt}</div>
              <textarea
                className="textarea mt-2"
                rows={3}
                value={session.globalFeedback[p.id] ?? ""}
                onChange={(e) => onUpdateGlobalFeedback(p.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 card p-5 bg-stone-50">
        <h2>Submit</h2>
        <p className="mt-2 text-sm">
          Clicking <b>Export JSON</b> will download a single file containing
          your reviewer metadata, all card responses, and global feedback.
          Please email this file to the study coordinator.
        </p>
        <p className="mt-2 text-xs text-ink-500">
          Your responses also remain in this browser's localStorage so you can
          re-export later if needed. Use <b>Reset</b> only after the
          coordinator confirms receipt.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="btn btn-primary"
            onClick={exportJSON}
            disabled={!allDone}
            title={allDone ? "" : "Complete all required items before export"}
          >
            Export JSON
          </button>
          <button className="btn btn-secondary" onClick={() => onResume(order[0])}>
            ← Back to first card
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (confirm("Reset and discard all responses? This cannot be undone.")) {
                onReset();
              }
            }}
          >
            Reset session
          </button>
        </div>
      </section>
    </div>
  );
}
