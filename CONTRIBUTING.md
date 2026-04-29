# Contributing

This is an internal panel-review artefact. The expected change cadence is low —
the interface should mostly stay frozen during the panel review window so
ratings stay comparable across reviewers.

## Where data lives

- **Cohort summaries:** `src/data/cohorts.ts` — static snapshot of cohort-
  level summary statistics shown in the cohort header.
- **Result cards:** `src/data/cards.ts` — input/output definitions, verified
  Spearman ρ values, IQR-based real-world translations, mechanistic
  hypotheses, and caveats. Numerical fields are kept in sync with the
  team's internal data extraction; mechanism / caveats prose is curated.
- **Rubric:** `src/data/rubric.ts` — Likert items A–G plus open-ended H, plus
  global feedback prompts.

## Style

- Tone: precise, neutral, clinical. Cards must say what is and isn't
  controlled for. Errors of omission can mislead the panel.
- Numerical claims must come from the team's verified data extraction, not
  from manuscript prose alone.
- If the manuscript and the recomputed data disagree by > 0.03 in ρ, surface
  the discrepancy openly on the card.

## QA before fielding

- `npm run lint` — TypeScript type check.
- `npm run build` — production build sanity.
- Manually walk every card in `npm run dev` and confirm:
  - Cohort header populates correctly per cohort.
  - Verification ρ matches the static data file.
  - The calibration probe arm flips correctly between two reviewer IDs.
  - Resume-from-localStorage works after a reload.
