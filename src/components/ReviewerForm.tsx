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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genReviewerId(): string {
  const t = Date.now().toString(36).slice(-5);
  const r = Math.random().toString(36).slice(2, 7);
  return `R-${t}${r}`.toUpperCase();
}

export function ReviewerForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (m: ReviewerMeta) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [expertise, setExpertise] = useState("");
  const [otherExpertise, setOtherExpertise] = useState("");
  const [yearsText, setYearsText] = useState("");
  const [familiarity, setFamiliarity] = useState(3);
  const [outcomes, setOutcomes] = useState("");
  const [conflicts, setConflicts] = useState("");

  const yearsValue = Number.parseInt(yearsText, 10);
  const yearsValid =
    yearsText.trim() !== "" &&
    Number.isFinite(yearsValue) &&
    yearsValue >= 0 &&
    yearsValue <= 70;

  const emailOk = EMAIL_RE.test(email.trim());
  const expertiseOk =
    expertise !== "" && (expertise !== "Other" || otherExpertise.trim() !== "");
  const canSubmit =
    name.trim().length >= 2 &&
    emailOk &&
    institution.trim().length >= 2 &&
    expertiseOk &&
    yearsValid;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <button
        className="btn btn-secondary mb-4"
        type="button"
        onClick={onBack}
      >
        ← Back
      </button>

      <h1>Profile</h1>

      <div className="mt-6 card p-6 space-y-5">
        <div>
          <label className="label">
            Full name <span className="text-rose-600">*</span>
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Doe, MD"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="label">
            Email <span className="text-rose-600">*</span>
          </label>
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
          <label className="label">
            Institution <span className="text-rose-600">*</span>
          </label>
          <input
            className="input"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g., Massachusetts General Hospital"
            autoComplete="organization"
          />
        </div>

        <div>
          <label className="label">
            Expertise / primary specialty <span className="text-rose-600">*</span>
          </label>
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
          <label className="label">
            Years of expertise (post-residency, integer){" "}
            <span className="text-rose-600">*</span>
          </label>
          <input
            className="input"
            type="number"
            min={0}
            max={70}
            step={1}
            inputMode="numeric"
            value={yearsText}
            onChange={(e) => setYearsText(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="e.g., 8"
          />
          {yearsText.length > 0 && !yearsValid && (
            <div className="mt-1 text-xs text-rose-600">
              Please enter an integer between 0 and 70.
            </div>
          )}
        </div>

        <fieldset>
          <legend className="label">
            Familiarity with wearable / digital phenotyping data
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-5">
            {[
              { v: 1, label: "1 — None" },
              { v: 2, label: "2 — A little" },
              { v: 3, label: "3 — Moderate" },
              { v: 4, label: "4 — Substantial" },
              { v: 5, label: "5 — Expert" },
            ].map((opt) => (
              <label
                key={opt.v}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  familiarity === opt.v
                    ? "border-ink-700 bg-ink-900 text-white"
                    : "border-stone-200 bg-white text-ink-900 hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="familiarity"
                  className="accent-current"
                  checked={familiarity === opt.v}
                  onChange={() => setFamiliarity(opt.v)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="label">
            Outcome measures or screening tools you use routinely (optional)
          </label>
          <textarea
            className="textarea"
            rows={2}
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            placeholder="Free text — e.g., depression screeners (PHQ-2/PHQ-9), HbA1c / fasting glucose, BP monitoring, sleep history, etc."
          />
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

      <div className="mt-6 flex items-center justify-between">
        <button className="btn btn-secondary" type="button" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              institution: institution.trim(),
              expertise:
                expertise === "Other" ? otherExpertise.trim() : expertise,
              yearsOfExpertise: yearsValue,
              wearableFamiliarity: familiarity,
              outcomesUsed: outcomes.trim(),
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
