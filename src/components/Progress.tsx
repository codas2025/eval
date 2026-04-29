import type { Session } from "../types";
import { CARDS } from "../data/cards";
import { RUBRIC } from "../data/rubric";

const REQUIRED_RUBRIC_IDS = RUBRIC.filter((r) => r.required).map((r) => r.id);

export function isCardComplete(session: Session, cardId: string): boolean {
  const r = session.responses[cardId];
  if (!r) return false;
  for (const id of REQUIRED_RUBRIC_IDS) {
    if (r.ratings[id] === undefined || r.ratings[id] === "") return false;
    const item = RUBRIC.find((it) => it.id === id);
    if (item?.justificationRequired && (r.justifications[id] ?? "").trim() === "") return false;
    if (item?.followUpRequired && (r.followUps[id] ?? "").trim() === "") return false;
  }
  return true;
}

export function ProgressBar({ session }: { session: Session }) {
  const order = session.cardOrder.length ? session.cardOrder : CARDS.map((c) => c.id);
  const total = order.length;
  const done = order.filter((id) => isCardComplete(session, id)).length;
  return (
    <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3 text-xs">
        <div className="font-mono text-ink-500">
          Reviewer {session.reviewer?.reviewerId ?? "—"}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-ink-500">
            {done} / {total} complete
          </div>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-ink-900 transition-all"
              style={{ width: `${(done / Math.max(1, total)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
