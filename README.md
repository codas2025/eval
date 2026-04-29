# Clinical Validation

A web-based annotation interface that lets a panel of clinicians review the
biomarker candidates surfaced by the CoDaS multi-agent biomarker discovery
pipeline. Used to capture clinician judgements on validity, effect-size
meaningfulness, literature support, practical measurability, added value over
existing biomarkers, likelihood of influencing patient advice, and confidence
to act on the results in real-world practice.

The interface walks each clinician through a fixed set of biomarker candidates
plus a calibration probe. For each candidate the clinician sees a one-page
result card and rates it along seven dimensions on a 5-point Likert scale plus
open-ended fields. Card order is randomised per reviewer (deterministic by
email hash, so the same person sees the same order across visits).

Live: **https://codas2025.github.io/eval/**

## Reviewer metadata captured

The opening form collects: full name, email, institution, expertise / primary
specialty, years of expertise, self-rated familiarity with wearable / digital
phenotyping data, outcome instruments routinely used, and any conflicts of
interest. All fields except familiarity / outcomes / conflicts are required.

## Response capture

Submitted sessions are pushed to a Firebase Realtime Database (RTDB) path
`clinical-eval-responses/{auto-id}`. Each record holds the reviewer
metadata, the per-card responses, the global feedback, the session schema
version, the server-side submission timestamp, and the user agent. A JSON
copy can be downloaded as a backup.

## Running locally

```bash
npm install
npm run dev                       # http://localhost:5173
```

## Building for static hosting

```bash
npm run build
# → dist/  (deploy to Vercel, Netlify, GitHub Pages, S3, etc.)
```

For GitHub Pages deployment under `https://<owner>.github.io/eval/`, build
with the path-prefixed base:

```bash
VITE_BASE='/eval/' npm run build
```

A GitHub Actions workflow at `.github/workflows/deploy.yml` performs this
build automatically on every push to `main` and publishes to GitHub Pages.

### Firebase config

The Firebase web config lives in `src/firebase.ts` as plain values. Per
[Firebase's own documentation](https://firebase.google.com/docs/projects/api-keys),
the web `apiKey` and the rest of the web config are **not secrets**; they are
bundled into every deployed build of the client and visible to anyone who
inspects the page. Security for writes is enforced by the Firestore rules
below, plus Anonymous auth.

Pointing the app at a different Firebase project is a one-line change in
`src/firebase.ts`. No GitHub Actions secrets are involved.

## Firebase setup

The Realtime Database for the configured project should already be set up
from prior studies. If a write fails, check the RTDB rules; for an
append-only response collection, a minimal permissive rule is:

```json
{
  "rules": {
    "clinical-eval-responses": {
      ".read": false,
      ".write": true
    }
  }
}
```

Reads are restricted to the Firebase Console / Admin SDK / authenticated
coordinator. Writes are allowed without auth.

## Repo layout

```
.
├── index.html, vite.config.ts, tsconfig*.json,
│   tailwind.config.js, postcss.config.js, package.json
└── src/
    ├── main.tsx, App.tsx, index.css, types.ts, firebase.ts
    ├── data/
    │   ├── cohorts.ts        # cohort summaries shown in the header
    │   ├── cards.ts          # result cards with verified ρ + IQR translation
    │   └── rubric.ts         # 7-dimension rubric + global feedback prompts
    ├── hooks/
    │   └── useSession.ts     # localStorage persistence + per-reviewer card RNG
    └── components/
        ├── Welcome.tsx, ReviewerForm.tsx
        ├── CardView.tsx, CohortHeader.tsx
        ├── RubricForm.tsx, Progress.tsx, Submit.tsx
```

## Calibration probe

A rejected positive control is included as a calibration probe. Half the panel
sees the rejection annotation; the other half sees the card without it. Arm
assignment is deterministic by email hash so the coordinator can reproduce
arm membership for analysis.

## Privacy

Clinicians see only derived statistics: cohort-level distributions, published
effect sizes, and operational definitions. No row-level participant data is
exposed. Card-order randomisation and calibration-arm assignment are
deterministic on email but client-side only (the seed is never sent to the
server). Reviewer metadata (name, email, institution) is stored alongside
the responses; rules above prevent third parties from reading it.
