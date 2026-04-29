import type { Session } from "../types";
import { CARDS } from "../data/cards";
import { RUBRIC } from "../data/rubric";

export function isCardComplete(session: Session, cardId: string): boolean {
  return missingForCard(session, cardId).length === 0;
}

export function missingForCard(session: Session, cardId: string): string[] {
  const r = session.responses[cardId];
  const out: string[] = [];
  let qN = 0;
  for (const item of RUBRIC) {
    qN += 1;
    if (!item.required) continue;
    if (!r) {
      out.push(`Question ${qN} (${item.prompt.slice(0, 40)}…)`);
      continue;
    }
    const rating = r.ratings[item.id];
    if (rating === undefined || rating === "") {
      out.push(`Question ${qN}: rating`);
    }
    if (item.justificationRequired) {
      const j = (r.justifications[item.id] ?? "").trim();
      if (j === "") out.push(`Question ${qN}: justification`);
    }
    if (item.followUpRequired) {
      const f = (r.followUps[item.id] ?? "").trim();
      if (f === "") out.push(`Question ${qN}: follow-up`);
    }
  }
  return out;
}

export function ProgressBar({ session }: { session: Session }) {
  const order = session.cardOrder.length ? session.cardOrder : CARDS.map((c) => c.id);
  const total = order.length;
  const done = order.filter((id) => isCardComplete(session, id)).length;
  return (
    <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3 text-xs">
        <div className="font-mono text-ink-500">
          {session.reviewer?.name ?? "Anonymous"}
          {session.reviewer?.institution ? ` · ${session.reviewer.institution}` : ""}
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
