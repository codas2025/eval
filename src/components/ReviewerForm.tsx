import { useState } from "react";
import type { ReviewerMeta } from "../types";

const EXPERTISE_AREAS = [
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genReviewerId(): string {
  // short reproducible-looking ID from time + random for the doc-key fallback;
  // not used for identification, just for localStorage namespacing.
  const t = Date.now().toString(36).slice(-5);
  const r = Math.random().toString(36).slice(2, 7);
  return `R-${t}${r}`.toUpperCase();
}

export function ReviewerForm({
  onSubmit,
}: {
  onSubmit: (m: ReviewerMeta) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [expertise, setExpertise] = useState("");
  const [otherExpertise, setOtherExpertise] = useState("");
  const [years, setYears] = useState("");
  const [familiarity, setFamiliarity] = useState(3);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState("");

  const toggleOutcome = (id: string) =>
    setOutcomes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const emailOk = EMAIL_RE.test(email.trim());
  const expertiseOk = expertise !== "" && (expertise !== "Other" || otherExpertise.trim() !== "");
  const canSubmit =
    name.trim().length >= 2 &&
    emailOk &&
    institution.trim().length >= 2 &&
    expertiseOk &&
    years !== "";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1>Reviewer information</h1>
      <p className="mt-2 text-sm text-ink-500">
        Used to characterise the panel composition and to contact you with the
        submission receipt. Your details are stored alongside your responses;
        the study coordinator will treat them as confidential.
      </p>

      <div className="mt-6 card p-6 space-y-5">
        <div>
          <label className="label">Full name <span className="text-rose-600">*</span></label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Doe, MD"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="label">Email <span className="text-rose-600">*</span></label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@institution.org"
            autoComplete="email"
          />
          {email.length > 0 && !emailOk && (
            <div className="mt-1 text-xs text-rose-600">
              Please enter a valid email address.
            </div>
          )}
        </div>

        <div>
          <label className="label">Institution <span className="text-rose-600">*</span></label>
          <input
            className="input"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g., Massachusetts General Hospital"
            autoComplete="organization"
          />
        </div>

        <div>
          <label className="label">Expertise / primary specialty <span className="text-rose-600">*</span></label>
          <select
            className="select"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          >
            <option value="">Select expertise…</option>
            {EXPERTISE_AREAS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {expertise === "Other" && (
            <input
              className="input mt-2"
              value={otherExpertise}
              onChange={(e) => setOtherExpertise(e.target.value)}
              placeholder="Enter expertise area"
            />
          )}
        </div>

        <div>
          <label className="label">Years of expertise (post-residency) <span className="text-rose-600">*</span></label>
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
              name: name.trim(),
              email: email.trim().toLowerCase(),
              institution: institution.trim(),
              expertise: expertise === "Other" ? otherExpertise.trim() : expertise,
              yearsOfExpertise: years,
              wearableFamiliarity: familiarity,
              outcomesUsed: outcomes,
              conflicts: conflicts.trim(),
              reviewerId: genReviewerId(),
              startedAt: new Date().toISOString(),
            })
          }
        >
          Begin reviewing →
        </button>
      </div>
      <p className="mt-3 text-right text-xs text-ink-500">
        Required fields are marked <span className="text-rose-600">*</span>.
      </p>
    </div>
  );
}
