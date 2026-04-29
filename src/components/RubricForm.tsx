import type { CardResponse, RubricItem } from "../types";
import { RUBRIC } from "../data/rubric";

interface Props {
  response: CardResponse;
  onChange: (partial: Partial<CardResponse>) => void;
}

export function RubricForm({ response, onChange }: Props) {
  return (
    <div className="space-y-4">
      {RUBRIC.map((item) => (
        <RubricRow key={item.id} item={item} response={response} onChange={onChange} />
      ))}
    </div>
  );
}

function RubricRow({
  item,
  response,
  onChange,
}: {
  item: RubricItem;
  response: CardResponse;
  onChange: (partial: Partial<CardResponse>) => void;
}) {
  const value = response.ratings[item.id];
  const justification = response.justifications[item.id] ?? "";
  const followUp = response.followUps[item.id] ?? "";

  const setRating = (v: number | string) =>
    onChange({ ratings: { [item.id]: v } });
  const setJustification = (v: string) =>
    onChange({ justifications: { [item.id]: v } });
  const setFollowUp = (v: string) =>
    onChange({ followUps: { [item.id]: v } });

  return (
    <div className="card p-5">
      <div className="text-xs font-mono text-ink-500">Item {item.letter}</div>
      <div className="mt-1 text-sm font-medium text-ink-900">
        {item.required && <span className="mr-1 text-rose-600">▲</span>}
        {item.prompt}
      </div>

      {item.scaleType === "likert5" && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {item.anchors!.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setRating(a.value)}
              className={`rounded-md border px-3 py-2 text-left text-xs leading-tight transition ${
                value === a.value
                  ? "border-ink-700 bg-ink-900 text-white"
                  : "border-stone-200 bg-white text-ink-900 hover:bg-stone-50"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {item.scaleType === "literature5" && (
        <div className="mt-3 space-y-2">
          {item.literatureChoices!.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setRating(c.value)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-xs leading-tight transition ${
                value === c.value
                  ? "border-ink-700 bg-ink-900 text-white"
                  : "border-stone-200 bg-white text-ink-900 hover:bg-stone-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {item.scaleType === "freetext" && (
        <textarea
          className="textarea mt-3"
          rows={4}
          value={justification}
          placeholder="Optional — leave blank if you have nothing to add"
          onChange={(e) => setJustification(e.target.value)}
        />
      )}

      {item.scaleType !== "freetext" && item.justificationRequired && (
        <div className="mt-3">
          <label className="label">
            Brief justification {item.justificationRequired ? "(required)" : ""}
          </label>
          <textarea
            className="textarea"
            rows={2}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
          />
        </div>
      )}

      {item.scaleType !== "freetext" && item.followUpPrompt && (
        <div className="mt-3">
          <label className="label">
            {item.followUpPrompt} {item.followUpRequired ? "(required)" : "(optional)"}
          </label>
          <textarea
            className="textarea"
            rows={2}
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
