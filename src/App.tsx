import { useEffect, useMemo, useState } from "react";
import { Welcome } from "./components/Welcome";
import { ReviewerForm } from "./components/ReviewerForm";
import { CardView } from "./components/CardView";
import { RubricForm } from "./components/RubricForm";
import { ProgressBar, isCardComplete } from "./components/Progress";
import { Submit } from "./components/Submit";
import { useSession } from "./hooks/useSession";
import { CARDS } from "./data/cards";
import { COHORTS } from "./data/cohorts";

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

  const [stage, setStage] = useState<Stage>(() => {
    if (!reviewerId) return "welcome";
    return "cards";
  });
  const [activeCardIdx, setActiveCardIdx] = useState(0);

  const order = session.cardOrder;
  const activeCard = useMemo(
    () => CARDS.find((c) => c.id === order[activeCardIdx]),
    [order, activeCardIdx],
  );
  const cohort = activeCard ? COHORTS[activeCard.cohortId] : null;

  // Calibration probe randomization: based on the reviewer's email hash, half
  // the panel sees the rejection annotation, the other half does not. Using
  // email keeps the arm stable for the same person across sessions.
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
    return <Welcome onStart={() => setStage("reviewer")} />;
  }
  if (stage === "reviewer") {
    return (
      <ReviewerForm
        onSubmit={(meta) => {
          startSession(meta);
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
    return <Welcome onStart={() => setStage("reviewer")} />;
  }

  const response = session.responses[activeCard.id] ?? {
    cardId: activeCard.id,
    ratings: {},
    justifications: {},
    followUps: {},
  };
  const complete = isCardComplete(session, activeCard.id);
  const isLast = activeCardIdx === order.length - 1;

  return (
    <>
      <ProgressBar session={session} />
      <main className="mx-auto max-w-4xl px-6 py-6">
        <div className="text-xs text-ink-500">
          Card {activeCardIdx + 1} of {order.length}
        </div>
        <CardView
          card={activeCard}
          cohort={cohort}
          showProbeAnnotation={showProbeAnnotation}
        />

        <div className="mt-6">
          <h2 className="text-base font-semibold tracking-tight">
            Your evaluation
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Items marked ▲ require a rating and a brief justification before
            the card counts as complete.
          </p>
          <div className="mt-3">
            <RubricForm
              response={response}
              onChange={(p) => updateResponse(activeCard.id, p)}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            className="btn btn-secondary"
            disabled={activeCardIdx === 0}
            onClick={() => setActiveCardIdx((i) => Math.max(0, i - 1))}
          >
            ← Previous
          </button>
          <div className="text-xs text-ink-500">
            {complete ? "✓ This card is complete" : "Required items remain"}
          </div>
          {isLast ? (
            <button
              className="btn btn-primary"
              onClick={() => setStage("submit")}
            >
              Review & submit →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() =>
                setActiveCardIdx((i) => Math.min(order.length - 1, i + 1))
              }
            >
              Next card →
            </button>
          )}
        </div>
      </main>
    </>
  );
}
