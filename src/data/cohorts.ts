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
    sourceDescription:
      "DWB (Digital Wellbeing): a large-scale Fitbit + smartphone passive-sensing cohort capturing hourly multimodal behavioral and physiological telemetry alongside validated psychiatric questionnaires.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/38743938/",
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
      pct_above_cutoff: 0.32,
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
    availableColumns: [
      {
        domain: "Sleep architecture",
        nFeatures: 26,
        examples: [
          "main sleep duration mean / SD / CV",
          "bedtime / wake hour mean / SD",
          "REM percent",
          "deep sleep minutes",
          "WASO long-wakes count",
          "polyphasic sleep percentage",
        ],
      },
      {
        domain: "Circadian rhythm",
        nFeatures: 12,
        examples: [
          "steps cosinor amplitude / acrophase / mesor",
          "intradaily variability",
          "interdaily stability",
          "L5 / M10 means",
          "relative amplitude",
        ],
      },
      {
        domain: "Smartphone app usage",
        nFeatures: 15,
        examples: [
          "social / hedonic / productivity app totals",
          "hedonic-to-productivity ratio",
          "late-night doomscrolling",
          "app diversity entropy",
          "social app proportion",
        ],
      },
      {
        domain: "Nocturnal activity",
        nFeatures: 7,
        examples: [
          "nocturnal unlocks mean",
          "night-to-day unlock ratio",
          "nocturnal screen time",
          "nocturnal social-app minutes",
          "% nights with phone use",
        ],
      },
      {
        domain: "Pre-sleep digital use",
        nFeatures: 9,
        examples: [
          "presleep 1h unlocks / screen time / social-app minutes",
          "weekday vs weekend deltas",
        ],
      },
      {
        domain: "Phone usage",
        nFeatures: 12,
        examples: [
          "daily screen time mean / SD / CV",
          "phone first / last use hour",
          "phone active span hours",
          "unlocks total",
        ],
      },
      {
        domain: "Steps / activity",
        nFeatures: 12,
        examples: [
          "daily steps mean / SD / CV / trend",
          "steps hourly mean / SD / median",
          "steps peak hour",
          "% zero-step hours",
        ],
      },
      {
        domain: "Physical activity (accelerometer-derived)",
        nFeatures: 4,
        examples: [
          "sedentariness ratio",
          "active movement ratio",
          "in-vehicle ratio",
          "activity type entropy",
        ],
      },
      {
        domain: "Location",
        nFeatures: 3,
        examples: [
          "home confinement index",
          "work proportion",
          "location entropy",
        ],
      },
      {
        domain: "Weekend / weekday deltas",
        nFeatures: 9,
        examples: [
          "steps / unlocks / screen-time weekend deltas",
        ],
      },
      {
        domain: "Demographics",
        examples: [
          "age",
          "gender",
          "education",
          "lives alone",
          "is married",
          "has disability",
          "Hispanic ethnicity",
          "financial hardship",
        ],
      },
      {
        domain: "Personality (Big Five) and sleep PROMIS",
        nFeatures: 23,
      },
    ],
    notes:
      "Endpoint reported per the manuscript convention (PHQ-8). The verified Spearman ρ matches the manuscript values for all six DWB candidates within ±0.012 (see verification panel on each card).",
  },

  globem: {
    id: "globem",
    name: "GLOBEM",
    populationDescriptor:
      "Mobile-sensing longitudinal cohort across 4 annual waves (2018-2021): 8,225 wave-observations from 704 unique young-adult participants (mean age 19.2 ± 1.4 yrs; 58.8% female, 40.2% male; 57.4% Asian, 36.4% White). Multi-platform (78.6% iOS, 21.4% Android). Substantial feature-level missingness (~54.6%). Mean monitoring duration per wave 70.2 ± 9.7 days. RAPIDS-computed feature set (5,508 features).",
    sourceDescription:
      "GLOBEM: a multi-year longitudinal mobile-sensing dataset for behavioral phenotyping, with RAPIDS-pipeline features and weekly clinical screeners.",
    sourceUrl: "https://the-globem.github.io/",
    n: 704,
    endpointLabel: "PHQ-4 depression / anxiety screen",
    endpointRange: [0, 12],
    endpointDist: {
      n: 5347,
      mean: 2.95,
      sd: 2.84,
      median: 2,
      p25: 1,
      p75: 4,
      pct_above_cutoff: 0.229,
    },
    covariates: ["age", "gender", "platform"],
    availableColumns: [
      { domain: "Location (RAPIDS)", nFeatures: 1107, examples: ["GPS entropy", "home / work dwell", "circadian movement", "significant locations", "distance from home"] },
      { domain: "Screen / app usage (RAPIDS)", nFeatures: 1134, examples: ["unlock counts / duration by time-of-day", "app usage patterns", "screen interaction frequency"] },
      { domain: "Sleep (RAPIDS)", nFeatures: 918, examples: ["sleep duration", "efficiency", "onset / wake times", "fragmentation", "circadian misalignment"] },
      { domain: "Bluetooth proximity (RAPIDS)", nFeatures: 891, examples: ["contact frequency", "interaction diversity", "social-network structure"] },
      { domain: "Phone calls / SMS (RAPIDS)", nFeatures: 783, examples: ["incoming / outgoing call counts and duration by time-of-day", "SMS frequency"] },
      { domain: "Step / activity (RAPIDS)", nFeatures: 594, examples: ["step counts by time window", "peak activity periods", "activity consistency"] },
      { domain: "WiFi (RAPIDS)", nFeatures: 81, examples: ["AP scan counts", "connectivity timing"] },
      { domain: "Demographics", examples: ["age", "gender", "platform (iOS / Android)", "ethnicity (one-hot)"] },
    ],
    notes:
      "For the discovery ρ, the analysis collapses to one wave per participant to remove within-subject correlation. Cohort-level CV AUC = 0.535 (near-chance, reflects the analytical floor; clinicians should be aware).",
  },

  wearme: {
    id: "wearme",
    name: "WEAR-ME",
    populationDescriptor:
      "Cardiometabolic risk-stratification cohort: 1,078 adult participants (from an original 1,165; 87 excluded for incomplete wearable feature coverage) recruited remotely across the US via Google Health Studies. Mean age 46.9 ± 12.5 yrs; 54.4% female, 43.6% male; mean BMI 29.2 ± 6.7 kg/m². Wore Fitbit / Pixel Watch capturing high-resolution heart rate, HRV, steps, sleep, and active-zone minutes. All participants underwent fasting laboratory tests (≥8 fasting hours) early morning. Outcome labels: 276 IR / 802 Non-IR; 38 diabetic / 147 prediabetic / 893 normoglycemic.",
    sourceDescription:
      "WEAR-ME: a cardiometabolic cohort pairing consumer-grade wearable telemetry (Fitbit / Pixel Watch) with fasting clinical laboratory panels for biomarker discovery on insulin resistance and related endpoints.",
    sourceUrl: "https://www.nature.com/articles/s41586-026-10179-2",
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
      pct_above_cutoff: 0.256,
    },
    endpointCutoff: 2.5,
    covariates: ["age", "sex", "BMI"],
    availableColumns: [
      { domain: "Wearable biometrics (Fitbit / Pixel Watch)", nFeatures: 12, examples: ["resting HR mean / median / SD", "HRV mean / median / SD", "steps mean / median / SD", "sleep duration mean / median / SD", "active-zone-minutes (weekly)"] },
      { domain: "Lipid panel", nFeatures: 6, examples: ["total cholesterol", "HDL", "LDL", "triglycerides", "non-HDL", "cholesterol/HDL ratio"] },
      { domain: "Hepatic", nFeatures: 8, examples: ["AST", "ALT", "ALP", "GGT", "total bilirubin", "albumin", "globulin", "albumin/globulin ratio"] },
      { domain: "Renal / chemistry", nFeatures: 8, examples: ["BUN", "creatinine", "eGFR", "sodium", "potassium", "chloride", "calcium", "CO2"] },
      { domain: "Inflammation", nFeatures: 1, examples: ["C-reactive protein (CRP)"] },
      { domain: "Hematology (CBC)", nFeatures: 16, examples: ["WBC", "RBC", "hemoglobin", "hematocrit", "MCV", "MCH", "MCHC", "RDW", "platelets", "MPV", "neutrophils", "lymphocytes", "monocytes", "eosinophils", "basophils"] },
      { domain: "Endocrine", nFeatures: 1, examples: ["total testosterone"] },
      { domain: "Demographics", examples: ["age", "sex", "BMI"] },
    ],
    notes:
      "HOMA-IR computed from fasting insulin and fasting glucose (both excluded from CoDaS candidate pool by the raw-variable-exclusion gate). Two clinical components of metabolic syndrome (TG, HDL) were also excluded from candidacy by construction; HDL still surfaces in Table 3 because it is not a direct mathematical component of HOMA-IR. The TG/HDL ratio is included as a rejected calibration probe (WME-PC).",
  },
};
