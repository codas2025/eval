import type { CardResponse, RubricItem } from "../types";
import { RUBRIC } from "../data/rubric";

interface Props {
  response: CardResponse;
  onChange: (partial: Partial<CardResponse>) => void;
}

export function RubricForm({ response, onChange }: Props) {
  let qN = 0;
  return (
    <div className="space-y-3">
      {RUBRIC.map((item, idx) => {
        qN += 1;
        return (
          <RubricRow
            key={item.id}
            item={item}
            index={idx}
            label={`Question ${qN}`}
            response={response}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
}

function Required() {
  return <span className="ml-1 text-rose-600" aria-label="required">*</span>;
}

function RubricRow({
  item,
  index,
  label,
  response,
  onChange,
}: {
  item: RubricItem;
  index: number;
  label: string;
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
      <div className="text-xs font-mono text-ink-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink-900">
        {item.prompt}
        {item.required && <Required />}
      </div>

      {item.scaleType === "likert5" && (
        <fieldset className="mt-3">
          <legend className="sr-only">Likert scale 1 to 5</legend>
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {item.anchors!.map((a) => {
              const id = `${item.id}-${a.value}`;
              const checked = value === a.value;
              return (
                <label
                  key={a.value}
                  htmlFor={id}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border px-2 py-2 text-center transition ${
                    checked
                      ? "border-sky-400 bg-sky-50 text-sky-900 ring-1 ring-sky-300"
                      : "border-stone-200 bg-white hover:bg-stone-50"
                  }`}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`q-${item.id}-${index}`}
                    className="h-4 w-4 accent-sky-500"
                    checked={checked}
                    onChange={() => setRating(a.value)}
                  />
                  <span className="text-xs font-semibold">{a.value}</span>
                  <span className="text-[10px] leading-tight">{a.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {item.scaleType === "literature5" && (
        <fieldset className="mt-3">
          <legend className="sr-only">Literature support choices</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {item.literatureChoices!.map((c) => {
              const id = `${item.id}-${c.value}`;
              const checked = value === c.value;
              return (
                <label
                  key={c.value}
                  htmlFor={id}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border px-3 py-3 text-center transition ${
                    checked
                      ? "border-sky-400 bg-sky-50 text-sky-900 ring-1 ring-sky-300"
                      : "border-stone-200 bg-white hover:bg-stone-50"
                  }`}
                >
                  <input
                    id={id}
                    type="radio"
                    name={`q-${item.id}-${index}`}
                    className="h-4 w-4 accent-sky-500"
                    checked={checked}
                    onChange={() => setRating(c.value)}
                  />
                  <span className="text-xs font-medium leading-tight">{c.label}</span>
                  {c.hint && (
                    <span className={`text-[10px] leading-tight ${checked ? "text-sky-700" : "text-ink-500"}`}>
                      {c.hint}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {item.scaleType === "freetext" && (
        <textarea
          className="textarea mt-3"
          rows={3}
          value={justification}
          placeholder={item.freetextPlaceholder ?? "Optional"}
          onChange={(e) => setJustification(e.target.value)}
        />
      )}

      {item.scaleType !== "freetext" && item.justificationRequired && (
        <div className="mt-3">
          <label className="label">
            Brief justification
            <Required />
          </label>
          <textarea
            className="textarea"
            rows={2}
            value={justification}
            placeholder={item.justificationPlaceholder ?? ""}
            onChange={(e) => setJustification(e.target.value)}
          />
        </div>
      )}

      {item.scaleType !== "freetext" && item.followUpPrompt && (
        <div className="mt-3">
          <label className="label">
            {item.followUpPrompt}
            {item.followUpRequired ? <Required /> : null}
          </label>
          <textarea
            className="textarea"
            rows={2}
            value={followUp}
            placeholder={item.followUpPlaceholder ?? ""}
            onChange={(e) => setFollowUp(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
