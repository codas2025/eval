import { useState } from "react";
import type { ReviewerMeta } from "../types";

const SPECIALTIES = [
  "Internal Medicine",
  "Endocrinology",
  "Preventive Cardiology",
  "Geriatrics",
  "Family Medicine",
  "Psychiatry",
  "Behavioral Health",
  "Sleep Medicine",
  "Other",
];

const YEARS_OPTIONS = ["<5", "5–10", "11–20", ">20"];

export function ReviewerForm({
  onSubmit,
}: {
  onSubmit: (m: ReviewerMeta) => void;
}) {
  const [reviewerId, setReviewerId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [otherSpecialty, setOtherSpecialty] = useState("");
  const [years, setYears] = useState("");
  const [familiarity, setFamiliarity] = useState(3);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState("");

  const toggleOutcome = (id: string) =>
    setOutcomes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canSubmit =
    reviewerId.trim().length >= 3 &&
    (specialty !== "" && (specialty !== "Other" || otherSpecialty.trim() !== "")) &&
    years !== "";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1>Reviewer information</h1>
      <p className="mt-2 text-sm text-ink-500">
        Used only to characterise the panel composition; never linked to
        identifying information.
      </p>

      <div className="mt-6 card p-6 space-y-5">
        <div>
          <label className="label">Reviewer ID (assigned, not your name)</label>
          <input
            className="input"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
            placeholder="e.g., R-001 (the coordinator will provide this)"
          />
        </div>
        <div>
          <label className="label">Primary specialty</label>
          <select
            className="select"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">Select specialty…</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {specialty === "Other" && (
            <input
              className="input mt-2"
              value={otherSpecialty}
              onChange={(e) => setOtherSpecialty(e.target.value)}
              placeholder="Enter specialty"
            />
          )}
        </div>
        <div>
          <label className="label">Years in clinical practice (post-residency)</label>
          <div className="mt-1 flex gap-2 flex-wrap">
            {YEARS_OPTIONS.map((y) => (
              <button
                key={y}
                className={`btn btn-secondary ${years === y ? "ring-2 ring-ink-700" : ""}`}
                onClick={() => setYears(y)}
                type="button"
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">
            Familiarity with wearable / digital phenotyping data (1=none, 5=expert)
          </label>
          <div className="mt-1 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`btn btn-secondary ${familiarity === n ? "ring-2 ring-ink-700" : ""}`}
                type="button"
                onClick={() => setFamiliarity(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Outcome instruments you use routinely</label>
          <div className="mt-1 flex gap-2 flex-wrap">
            {["PHQ-8", "PHQ-4", "HOMA-IR", "none"].map((o) => (
              <button
                key={o}
                type="button"
                className={`btn btn-secondary ${outcomes.includes(o) ? "ring-2 ring-ink-700" : ""}`}
                onClick={() => toggleOutcome(o)}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Conflicts of interest (optional)</label>
          <textarea
            className="textarea"
            rows={3}
            value={conflicts}
            onChange={(e) => setConflicts(e.target.value)}
            placeholder="Any commercial or advisory ties to wearables / digital health products / outcome instruments under review"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="btn btn-primary"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              reviewerId: reviewerId.trim(),
              specialty: specialty === "Other" ? otherSpecialty.trim() : specialty,
              yearsPracticing: years,
              wearableFamiliarity: familiarity,
              outcomesUsed: outcomes,
              conflicts: conflicts.trim(),
              startedAt: new Date().toISOString(),
            })
          }
        >
          Begin reviewing →
        </button>
      </div>
    </div>
  );
}
