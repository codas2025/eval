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

function Required() {
  return <span className="ml-1 text-rose-600" aria-label="required">*</span>;
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
      <button className="btn btn-secondary mb-4" type="button" onClick={onBack}>
        ← Back
      </button>

      <h1>Profile</h1>

      <div className="mt-6 card p-6 space-y-5">
        <div>
          <label className="label">
            Full name<Required />
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe, MD"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="label">
            Email<Required />
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
            Institution<Required />
          </label>
          <input
            className="input"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Massachusetts General Hospital"
            autoComplete="organization"
          />
        </div>

        <div>
          <label className="label">
            Primary specialty<Required />
          </label>
          <select
            className="select"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          >
            <option value="">Select…</option>
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
              placeholder="Enter specialty"
            />
          )}
        </div>

        <div>
          <label className="label">
            Years of expertise (post residency)<Required />
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
            placeholder="8"
          />
          {yearsText.length > 0 && !yearsValid && (
            <div className="mt-1 text-xs text-rose-600">
              Enter an integer between 0 and 70.
            </div>
          )}
        </div>

        <fieldset>
          <legend className="label">
            Familiarity with wearable / digital phenotyping data
          </legend>
          <div className="mt-2 grid grid-cols-5 gap-1 sm:gap-2">
            {[
              { v: 1, label: "None" },
              { v: 2, label: "A little" },
              { v: 3, label: "Moderate" },
              { v: 4, label: "Substantial" },
              { v: 5, label: "Expert" },
            ].map((opt) => {
              const id = `fam-${opt.v}`;
              const checked = familiarity === opt.v;
              return (
                <label
                  key={opt.v}
                  htmlFor={id}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border px-2 py-2 text-center transition ${
                    checked
                      ? "border-sky-400 bg-sky-50 text-sky-900"
                      : "border-stone-200 bg-white hover:bg-stone-50"
                  }`}
                >
                  <input
                    id={id}
                    type="radio"
                    name="familiarity"
                    className="sr-only"
                    checked={checked}
                    onChange={() => setFamiliarity(opt.v)}
                  />
                  <span className="text-xs font-semibold">{opt.v}</span>
                  <span className="text-[10px] leading-tight">{opt.label}</span>
                </label>
              );
            })}
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
            placeholder="e.g., depression screeners, HbA1c, BP, sleep history…"
          />
        </div>

        <div>
          <label className="label">Conflicts of interest (optional)</label>
          <textarea
            className="textarea"
            rows={3}
            value={conflicts}
            onChange={(e) => setConflicts(e.target.value)}
            placeholder="Commercial or advisory ties relevant to wearables, digital health, or the outcomes under review"
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
          Begin reviewing
        </button>
      </div>
      <p className="mt-3 text-right text-xs text-ink-500">
        Required fields are marked <span className="text-rose-600">*</span>.
      </p>
    </div>
  );
}
