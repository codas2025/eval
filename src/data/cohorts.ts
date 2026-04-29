// Cohort summary statistics shown on the Result Cards. Numbers are static
// snapshots; ρ values match the published manuscript Table 3 (verified
// independently). Update only via the team's internal extraction process.

import type { Cohort } from "../types";

export const COHORTS: Record<Cohort["id"], Cohort> = {
  dwb_hourly: {
    id: "dwb_hourly",
    name: "DWB Hourly",
    populationDescriptor:
      "Digital Wellbeing Hourly cohort: 7,497 unique adult participants (mean age 43.9 ± 12.7 yrs; 70.0% female, 26.5% male, 7.6% Hispanic) enrolled in a US-wide passive-sensing study with hourly multimodal smartphone telemetry (sleep architecture, step counts, resting heart rate, app usage). Mean monitoring duration 26.5 ± 4.7 days; 4.55M raw hourly observations aggregated to participant-level feature vectors. Conducted under approved institutional IRB.",
    n: 7497,
    endpointLabel: "PHQ-8 depression severity (per manuscript Table 3)",
    endpointRange: [0, 24],
    endpointDist: {
      n: 7497,
      mean: 7.18,
      sd: 5.45,
      median: 6,
      p25: 3,
      p75: 11,
      pct_above_cutoff: 0.32, // approx, % >= 10 — verify on display
    },
    covariates: [
      "gender",
      "education",
      "marital status",
      "disability status",
      "Hispanic ethnicity",
      "financial hardship",
      "lives alone",
    ],
    notes:
      "Endpoint reported per the manuscript convention (PHQ-8). The verified Spearman ρ matches the manuscript values for all six DWB candidates within ±0.012 (see verification panel on each card).",
  },
  globem: {
    id: "globem",
    name: "GLOBEM",
    populationDescriptor:
      "Mobile-sensing longitudinal cohort across 4 annual waves (2018-2021): 8,225 wave-observations from 704 unique young-adult participants (mean age 19.2 ± 1.4 yrs; 58.8% female, 40.2% male; 57.4% Asian, 36.4% White). Multi-platform (78.6% iOS, 21.4% Android). Substantial feature-level missingness (~54.6%). Mean monitoring duration per wave 70.2 ± 9.7 days. RAPIDS-computed feature set (5,508 features).",
    n: 704,
    endpointLabel: "PHQ-4 depression/anxiety screen",
    endpointRange: [0, 12],
    endpointDist: {
      n: 5347, // 65.0% coverage of the 8,225 observations
      mean: 2.95,
      sd: 2.84,
      median: 2,
      p25: 1,
      p75: 4,
      pct_above_cutoff: 0.229, // % > 2 (PHQ-4 depression-classification cutoff)
    },
    covariates: ["age", "gender", "platform"],
    notes:
      "For the discovery ρ, the analysis collapses to one wave per participant to remove within-subject correlation. Stats above are over all observations. Cohort-level CV AUC = 0.535 (near-chance, reflects the analytical floor — clinicians should be aware).",
  },
  wearme: {
    id: "wearme",
    name: "WEAR-ME",
    populationDescriptor:
      "Cardiometabolic risk-stratification cohort: 1,078 adult participants (from an original 1,165; 87 excluded for incomplete wearable feature coverage) recruited remotely across the US via Google Health Studies. Mean age 46.9 ± 12.5 yrs; 54.4% female, 43.6% male; mean BMI 29.2 ± 6.7 kg/m². Wore Fitbit / Pixel Watch capturing high-resolution heart rate, HRV, steps, sleep, and active-zone minutes. All participants underwent fasting laboratory tests (≥8 fasting hours) early morning. Outcome labels: 276 IR / 802 Non-IR; 38 diabetic / 147 prediabetic / 893 normoglycemic.",
    n: 1078,
    endpointLabel: "HOMA-IR (continuous insulin-resistance index)",
    endpointRange: null,
    endpointDist: {
      n: 1078,
      mean: 2.43,
      sd: 2.13,
      median: 1.8,
      p25: 1.12,
      p75: 2.93,
      pct_above_cutoff: 0.256, // % > 2.5 cutoff
    },
    endpointCutoff: 2.5,
    covariates: ["age", "sex", "BMI"],
    notes:
      "HOMA-IR computed from fasting insulin and fasting glucose (both excluded from CoDaS candidate pool by the raw-variable-exclusion gate). Two clinical components of metabolic syndrome (TG, HDL) were also excluded from candidacy by construction; HDL still surfaces in Table 3 because it is not a direct mathematical component of HOMA-IR. The TG/HDL ratio is included as a rejected calibration probe (WME-PC).",
  },
};
