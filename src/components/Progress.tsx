import type { Session } from "../types";
import { CARDS } from "../data/cards";
import { RUBRIC } from "../data/rubric";
import { DEFAULT_RATINGS } from "../hooks/useSession";

export function isCardComplete(session: Session, cardId: string): boolean {
  return missingForCard(session, cardId).length === 0;
}

export function missingForCard(session: Session, cardId: string): string[] {
  const r = session.responses[cardId];
  const out: string[] = [];

  // The card is not "done" until the reviewer has explicitly engaged
  // (touched=true). Surface this prominently AND continue to enumerate the
  // required items so the reviewer can see exactly what is still needed.
  if (!r || r.touched !== true) {
    out.push(
      "No changes registered yet on this card. Make at least one rating change, justification, or follow-up entry below.",
    );
  }

  // Always enumerate required items. Use defaults for ratings if no response
  // object exists yet so Likert items don't appear as missing (they have
  // visual defaults of 3); literature has no default so it always shows up.
  const ratings = r?.ratings ?? DEFAULT_RATINGS;
  const justifs = r?.justifications ?? {};
  const followUps = r?.followUps ?? {};

  let qN = 0;
  for (const item of RUBRIC) {
    qN += 1;
    if (!item.required) continue;
    const rating = ratings[item.id];
    if (rating === undefined || rating === "") {
      out.push(`Question ${qN}: rating`);
    }
    if (item.justificationRequired) {
      const j = (justifs[item.id] ?? "").trim();
      if (j === "") out.push(`Question ${qN}: justification`);
    }
    if (item.followUpRequired) {
      const f = (followUps[item.id] ?? "").trim();
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
