import { useEffect, useMemo, useState } from "react";
import { Welcome } from "./components/Welcome";
import { ReviewerForm } from "./components/ReviewerForm";
import { CardView } from "./components/CardView";
import { RubricForm } from "./components/RubricForm";
import { ProgressBar, isCardComplete, missingForCard } from "./components/Progress";
import { Submit } from "./components/Submit";
import { useSession, DEFAULT_RATINGS } from "./hooks/useSession";
import { CARDS } from "./data/cards";
import { COHORTS } from "./data/cohorts";
import { logProfileStart, logProgress } from "./firebase";

type Stage = "welcome" | "reviewer" | "cards" | "submit";

export default function App() {
  const {
    reviewerId,
    session,
    startSession,
    updateResponse,
    updateGlobalFeedback,
    finishSession,
    resetSession,
  } = useSession();

  const resumable = Boolean(reviewerId && session.reviewer);

  const [stage, setStage] = useState<Stage>("welcome");
  const [activeCardIdx, setActiveCardIdx] = useState(0);

  const order = session.cardOrder;
  const activeCard = useMemo(
    () => CARDS.find((c) => c.id === order[activeCardIdx]),
    [order, activeCardIdx],
  );
  const cohort = activeCard ? COHORTS[activeCard.cohortId] : null;

  // Calibration probe arm: half of panel sees the rejection annotation, the
  // other half does not. Keyed on email so the same person stays on the same
  // arm across sessions and devices.
  const showProbeAnnotation = useMemo(() => {
    if (!session.reviewer) return true;
    const key = session.reviewer.email.toLowerCase();
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = ((h << 5) - h + key.charCodeAt(i)) | 0;
    }
    return (h >>> 0) % 2 === 0;
  }, [session.reviewer]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeCardIdx, stage]);

  if (stage === "welcome") {
    return (
      <Welcome
        onStart={() => setStage("reviewer")}
        resumable={resumable}
        resumableSession={resumable ? session : undefined}
        onResume={() => {
          const nextIdx = order.findIndex((id) => !isCardComplete(session, id));
          setActiveCardIdx(nextIdx >= 0 ? nextIdx : 0);
          setStage("cards");
        }}
        onResetAndStart={() => {
          resetSession();
          setStage("reviewer");
          setActiveCardIdx(0);
        }}
      />
    );
  }
  if (stage === "reviewer") {
    return (
      <ReviewerForm
        onBack={() => setStage("welcome")}
        onSubmit={(meta) => {
          startSession(meta);
          // Fire-and-forget checkpoint so the coordinator can see this
          // reviewer started. Errors are logged to console but do not block
          // the reviewer from proceeding.
          void logProfileStart(meta);
          setStage("cards");
          setActiveCardIdx(0);
        }}
      />
    );
  }
  if (stage === "submit") {
    return (
      <>
        <ProgressBar session={session} />
        <Submit
          session={session}
          onUpdateGlobalFeedback={updateGlobalFeedback}
          onFinish={finishSession}
          onResume={(id) => {
            const idx = order.indexOf(id);
            if (idx >= 0) {
              setActiveCardIdx(idx);
              setStage("cards");
            }
          }}
          onReset={() => {
            resetSession();
            setStage("welcome");
            setActiveCardIdx(0);
          }}
        />
      </>
    );
  }

  if (!activeCard || !cohort) {
    return <Welcome onStart={() => setStage("reviewer")} resumable={false} />;
  }

  // Pre-filled by useSession.startSession with default ratings + touched=false.
  // The defaults render the radios with "3" pre-checked, but the card does
  // not count as completed until the reviewer makes any explicit change
  // (updateResponse flips touched to true).
  const response = session.responses[activeCard.id] ?? {
    cardId: activeCard.id,
    ratings: { ...DEFAULT_RATINGS },
    justifications: {},
    followUps: {},
    touched: false,
  };
  const missing = missingForCard(session, activeCard.id);
  const complete = missing.length === 0;
  const isLast = activeCardIdx === order.length - 1;

  return (
    <>
      <ProgressBar session={session} />
      <main className="mx-auto max-w-4xl px-6 py-6">
        <div className="flex items-center justify-between">
          <button
            className="btn btn-secondary"
            onClick={() => {
              // Immediate flush so the reviewer can confirm their progress
              // landed in the cloud before they leave the tab.
              void logProgress(session);
              setStage("welcome");
            }}
            type="button"
            title="Your progress is auto-saved to the secure database"
          >
            ← Save and exit
          </button>
          <div className="text-xs text-ink-500">
            Card {activeCardIdx + 1} of {order.length}
          </div>
        </div>

        <div className="mt-4">
          <CardView
            card={activeCard}
            cohort={cohort}
            showProbeAnnotation={showProbeAnnotation}
          />
        </div>

        <div className="mt-6">
          <h2 className="text-base font-semibold tracking-tight">Your evaluation</h2>
          <p className="mt-1 text-xs text-ink-500">
            Each Likert question defaults to <b>3 (neutral)</b>. Required items are marked
            <span className="mx-1 text-rose-600">*</span>and must be answered before the next card.
          </p>
          <div className="mt-3">
            <RubricForm
              response={response}
              onChange={(p) => updateResponse(activeCard.id, p)}
            />
          </div>
        </div>

        {!complete && (
          <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <div className="font-medium">
              {missing.length} required item{missing.length === 1 ? "" : "s"} not yet answered:
            </div>
            <ul className="mt-1 list-disc pl-5">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-2">
          <button
            className="btn btn-secondary"
            disabled={activeCardIdx === 0}
            onClick={() => setActiveCardIdx((i) => Math.max(0, i - 1))}
          >
            ← Previous
          </button>
          <div className="text-xs text-ink-500">
            {complete ? "✓ Card complete" : "Required items remain"}
          </div>
          {isLast ? (
            <button
              className="btn btn-primary"
              disabled={!complete}
              onClick={() => setStage("submit")}
              title={complete ? "" : "Answer required items first"}
            >
              Review & submit →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={!complete}
              onClick={() =>
                setActiveCardIdx((i) => Math.min(order.length - 1, i + 1))
              }
              title={complete ? "" : "Answer required items first"}
            >
              Next card →
            </button>
          )}
        </div>
      </main>
    </>
  );
}
