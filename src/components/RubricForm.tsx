import type { CardResponse, RubricItem } from "../types";
import { RUBRIC } from "../data/rubric";

interface Props {
  response: CardResponse;
  onChange: (partial: Partial<CardResponse>) => void;
}

export function RubricForm({ response, onChange }: Props) {
  return (
    <div className="space-y-4">
      {RUBRIC.map((item, idx) => (
        <RubricRow
          key={item.id}
          item={item}
          index={idx}
          response={response}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function RubricRow({
  item,
  index,
  response,
  onChange,
}: {
  item: RubricItem;
  index: number;
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

  // Question N is the rated questions (1-indexed). The free-text item is
  // labelled separately.
  const ratedItems = RUBRIC.filter((r) => r.scaleType !== "freetext");
  const ratedIdx = ratedItems.findIndex((r) => r.id === item.id);
  const label =
    item.scaleType === "freetext"
      ? `Question ${ratedItems.length + 1} — open-ended`
      : `Question ${ratedIdx + 1} of ${ratedItems.length}`;

  return (
    <div className="card p-5">
      <div className="text-xs font-mono text-ink-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink-900">
        {item.required && <span className="mr-1 text-rose-600">▲</span>}
        {item.prompt}
      </div>

      {item.scaleType === "likert5" && (
        <fieldset className="mt-3">
          <legend className="sr-only">Likert scale 1-5 for {label}</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {item.anchors!.map((a) => {
              const id = `${item.id}-${a.value}`;
              const checked = value === a.value;
              return (
                <label
                  key={a.value}
                  htmlFor={id}
                  className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-xs leading-tight transition ${
                    checked
                      ? "border-ink-700 bg-ink-900 text-white"
                      : "border-stone-200 bg-white text-ink-900 hover:bg-stone-50"
                  }`}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`q-${item.id}-${index}`}
                    className="mt-0.5 accent-current"
                    checked={checked}
                    onChange={() => setRating(a.value)}
                  />
                  <span>{a.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {item.scaleType === "literature5" && (
        <fieldset className="mt-3 space-y-2">
          <legend className="sr-only">Literature support choices for {label}</legend>
          {item.literatureChoices!.map((c) => {
            const id = `${item.id}-${c.value}`;
            const checked = value === c.value;
            return (
              <label
                key={c.value}
                htmlFor={id}
                className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-xs leading-tight transition ${
                  checked
                    ? "border-ink-700 bg-ink-900 text-white"
                    : "border-stone-200 bg-white text-ink-900 hover:bg-stone-50"
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={`q-${item.id}-${index}`}
                  className="mt-0.5 accent-current"
                  checked={checked}
                  onChange={() => setRating(c.value)}
                />
                <span>{c.label}</span>
              </label>
            );
          })}
        </fieldset>
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
