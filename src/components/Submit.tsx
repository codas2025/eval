import { useMemo, useState } from "react";
import type { Session } from "../types";
import { CARDS } from "../data/cards";
import { GLOBAL_FEEDBACK_PROMPTS, RUBRIC } from "../data/rubric";
import { isCardComplete } from "./Progress";
import { FIREBASE_CONFIGURED, submitToFirestore } from "../firebase";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; documentId: string; firestore: boolean }
  | { kind: "error"; message: string };

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
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  function buildPayload() {
    return {
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
  }

  function downloadJSON(documentId?: string) {
    const payload = { ...buildPayload(), firestoreDocumentId: documentId ?? null };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const slug = (session.reviewer?.email ?? "anon")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.href = url;
    a.download = `codas-eval-${slug}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function submitAll() {
    setState({ kind: "submitting" });
    const finished: Session = { ...session, finishedAt: new Date().toISOString() };
    if (FIREBASE_CONFIGURED) {
      const r = await submitToFirestore(finished);
      if (r.ok && r.documentId) {
        onFinish();
        setState({ kind: "success", documentId: r.documentId, firestore: true });
        return;
      }
      // fall back to JSON-only on failure
      onFinish();
      setState({
        kind: "error",
        message:
          (r.error ?? "Unknown Firestore error") +
          ". Please use the JSON export below and email it to the coordinator.",
      });
      return;
    }
    // Firebase not configured; JSON-only path.
    onFinish();
    setState({ kind: "success", documentId: "(local only)", firestore: false });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1>Review and submit</h1>
      <p className="mt-2 text-sm text-ink-500">
        {session.reviewer?.name} · {session.reviewer?.institution} ·{" "}
        {session.reviewer?.expertise} ·{" "}
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
                    {id}: {card.title}
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
          Clicking <b>Submit</b> writes your responses to the secure study
          database{FIREBASE_CONFIGURED ? "" : " (currently disabled in this build; see README)"}.
          You can also download a JSON copy at any time.
        </p>

        {state.kind === "submitting" && (
          <div className="mt-3 rounded-md bg-stone-100 p-3 text-sm">
            Submitting…
          </div>
        )}
        {state.kind === "success" && state.firestore && (
          <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <div className="font-medium text-emerald-800">
              Submission received.
            </div>
            <div className="mt-1 text-xs text-emerald-700">
              Reference: <code className="font-mono">{state.documentId}</code>.
              Thank you for participating. You may close this tab.
            </div>
          </div>
        )}
        {state.kind === "success" && !state.firestore && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
            <div className="font-medium text-amber-800">
              Database submission is not enabled in this build.
            </div>
            <div className="mt-1 text-xs text-amber-700">
              Please download the JSON copy below and email it to the study
              coordinator.
            </div>
          </div>
        )}
        {state.kind === "error" && (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm">
            <div className="font-medium text-rose-800">Submission failed.</div>
            <div className="mt-1 text-xs text-rose-700 break-words">{state.message}</div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="btn btn-primary"
            onClick={submitAll}
            disabled={!allDone || state.kind === "submitting"}
            title={allDone ? "" : "Complete all required items before submitting"}
          >
            {state.kind === "success" ? "Submitted ✓" : "Submit"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              downloadJSON(state.kind === "success" ? state.documentId : undefined)
            }
            disabled={!allDone}
          >
            Download JSON copy
          </button>
          <button className="btn btn-secondary" onClick={() => onResume(order[0])}>
            ← Back to first card
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (
                confirm(
                  "Reset and discard all responses on this device? This will not delete an already-submitted record on the server.",
                )
              ) {
                onReset();
              }
            }}
          >
            Reset session
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          Your responses also remain in this browser's localStorage so you can
          re-submit or re-download later if needed.
        </p>
      </section>
    </div>
  );
}
