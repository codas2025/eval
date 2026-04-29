# CoDaS Clinician Evaluation

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
reviewer-ID hash, so reloads preserve the same order).

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
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

## Repo layout

```
.
├── index.html, vite.config.ts, tsconfig*.json,
│   tailwind.config.js, postcss.config.js, package.json
└── src/
    ├── main.tsx, App.tsx, index.css, types.ts
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

## Response capture

Responses are stored in the browser's `localStorage` keyed by reviewer ID and
exported as a single JSON file at submit time. There is no backend; the
clinician emails the JSON file to the study coordinator for ingestion. To add
a backend later, replace the `exportJSON` handler in
`src/components/Submit.tsx` with a `fetch()` to a response-collection endpoint.

## Calibration probe

A rejected positive control is included as a calibration probe. Half the panel
sees the rejection annotation; the other half sees the card without it. Arm
assignment is deterministic by reviewer-ID hash so the coordinator can
reproduce arm membership for analysis.

## Privacy

Clinicians see only derived statistics: cohort-level distributions, published
effect sizes, and operational definitions. No row-level participant data is
exposed. Card-order randomisation is per-reviewer, deterministic, and stored
client-side only.
