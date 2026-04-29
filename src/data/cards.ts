// Result cards (16 candidates + 1 calibration probe). Per-feature distributions
// are static snapshots from the CoDaS source data; all ρ verified against the
// published manuscript Table 3 (drift ≤ 0.03 except HDL: 0.032).

import type { ResultCard } from "../types";

// helpers used in real-world-translation prose
const fmt = (x: number, d = 2) =>
  Math.abs(x) >= 100 ? x.toFixed(0) : x.toFixed(d);

// outcome SDs (used to derive 1-SD-input → outcome-units translations)
const SD_PHQ8 = 5.45; // dwb_hourly phq_score, computed from data
const SD_PHQ4 = 2.84; // globem target_phq4
const SD_HOMA = 2.13; // wearme True_HOMA_IR

function rwt(rho: number, inputSD: number, inputUnit: string,
             outputSD: number, outputUnit: string,
             inputP25: number | null, inputP75: number | null): string {
  const sign = rho >= 0 ? "increase" : "decrease";
  const absDelta = Math.abs(rho) * outputSD;
  const main =
    `A 1-SD increase in the input (≈ ${fmt(inputSD)} ${inputUnit}) is ` +
    `associated with an approximate ${sign} of ${fmt(absDelta)} ${outputUnit} ` +
    `(=|ρ|·SD_outcome).`;
  if (inputP25 != null && inputP75 != null) {
    const iqrDelta = inputP75 - inputP25;
    const outDelta = (iqrDelta / inputSD) * absDelta;
    return `${main} Moving from the cohort 25th percentile (${fmt(inputP25)} ` +
           `${inputUnit}) to the 75th percentile (${fmt(inputP75)} ` +
           `${inputUnit}) is associated with about ` +
           `${fmt(outDelta)} ${outputUnit} of ${rho >= 0 ? "increase" : "decrease"} ` +
           `in the outcome (rank-monotonic approximation).`;
  }
  return main;
}

export const CARDS: ResultCard[] = [
  // ============================================================
  // DWB Hourly
  // ============================================================
  {
    id: "DWB-01",
    cohortId: "dwb_hourly",
    evidenceTier: "Established",
    title: "Main sleep duration variability",
    manuscriptColumn: "sleep_min_in_sleep_period_main_sleep_std",
    inputDefinition:
      "Standard deviation, in minutes, of nightly main-sleep duration across the participant's observation window. Main sleep excludes naps and brief awakenings; the underlying sleep-stage segmentation is from the wrist-worn Fitbit / Pixel Watch device. Higher values indicate more night-to-night variability in sleep duration.",
    inputUnits: "minutes",
    inputDist: { n: 7227, mean: 95.3, sd: 43.3, median: 88.7, p25: 65.4, p75: 117, min: 0.7, max: 434 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0-24)",
    rho: 0.252,
    rhoCI: [0.23, 0.27],
    rhoVerifiedFromData: 0.257,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More variable nightly sleep → higher PHQ-8.",
    realWorldTranslation: rwt(0.252, 43.3, "min", SD_PHQ8, "PHQ-8 points", 65.4, 117),
    controlledFor: "None in this estimate (univariate Spearman). Subgroup consistency required across biological sex and age decade in CoDaS's 11-check battery.",
    mechanism:
      "Circadian instability impairs sleep homeostatic drive and emotional regulation.",
    caveats:
      "Operationalization (SD vs. CV vs. IQR) is somewhat interchangeable; Appendix Table 7 shows main-sleep-duration CV (ρ=0.244) and bedtime-hour SD (ρ=0.229) carry similar signal; the underlying construct is sleep-schedule irregularity, not a particular statistic. Independently triangulated by sleep onset time variability in GLOBEM (GLOB-01).",
  },
  {
    id: "DWB-02",
    cohortId: "dwb_hourly",
    evidenceTier: "Established",
    title: "Nocturnal social app usage (mean)",
    manuscriptColumn: "nocturnal_social_app_mean",
    inputDefinition:
      "Mean time per day, in minutes, spent in social-category smartphone applications during nocturnal hours (operational nocturnal window per the DWB README: midnight-05:00 local). Computed from app-usage telemetry aggregated to the participant level.",
    inputUnits: "minutes/day",
    inputDist: { n: 7497, mean: 1.47, sd: 2.47, median: 0.52, p25: 0.07, p75: 1.78, min: 0, max: 30.5 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0-24)",
    rho: 0.246,
    rhoCI: [0.22, 0.27],
    rhoVerifiedFromData: 0.246,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More nocturnal social-app use → higher PHQ-8.",
    realWorldTranslation: rwt(0.246, 2.47, "min/day", SD_PHQ8, "PHQ-8 points", 0.07, 1.78),
    controlledFor: "None in this estimate (univariate).",
    mechanism:
      "Blue-light exposure and hyperarousal suppress melatonin secretion; nocturnal social engagement also fragments sleep continuity.",
    caveats:
      "Reverse causation is plausible (depressed individuals may use more nocturnal social media). Univariate correlation cannot adjudicate directionality; the manuscript discussion explicitly flags this in §5.1. Distribution is right-skewed (mean ≫ median): the median user has ~30s/day of nocturnal social app use; the 75th-percentile user ~1.8 min/day.",
  },
  {
    id: "DWB-03",
    cohortId: "dwb_hourly",
    evidenceTier: "Supported",
    title: "Late-night doomscrolling (composite)",
    manuscriptColumn: "late_night_doomscroll_mean",
    inputDefinition:
      "CoDaS-engineered composite: aggregated time spent in news / social applications during late-night hours, mean across observation window. Underlying definition (per the DWB preprocessing pipeline): late-night news/social content engagement; finer continuity criteria are documented in the dwb_hourly preprocess.py.",
    inputUnits: "minutes/night (averaged)",
    inputDist: { n: 7495, mean: 1.94, sd: 2.76, median: 0.82, p25: 0.06, p75: 2.7, min: 0, max: 27.8 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0-24)",
    rho: 0.177,
    rhoVerifiedFromData: 0.177,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More late-night doomscrolling → higher PHQ-8.",
    realWorldTranslation: rwt(0.177, 2.76, "min/night", SD_PHQ8, "PHQ-8 points", 0.06, 2.7),
    controlledFor: "None in this estimate.",
    mechanism:
      "Nocturnal news / social scrolling sustains rumination and cortisol release.",
    caveats:
      "Construct overlap with DWB-02 (nocturnal social app use) is partial; clinicians may want to know whether late-night doomscrolling adds incremental signal beyond a simpler nocturnal-social measure. Rubric item E (added value) is the right place to capture that judgment.",
  },
  {
    id: "DWB-04",
    cohortId: "dwb_hourly",
    evidenceTier: "Supported",
    title: "Night-to-day social media ratio",
    manuscriptColumn: "night_day_social_ratio",
    inputDefinition:
      "CoDaS-engineered composite: ratio of nocturnal to daytime social-app use computed per participant (nocturnal social minutes / daytime social minutes). Higher values indicate social engagement displaced into nocturnal hours, normalised to each person's overall social-app baseline. Winsorised to [-50, 50] in preprocessing.",
    inputUnits: "unitless ratio",
    inputDist: { n: 7394, mean: 0.24, sd: 0.70, median: 0.10, p25: 0.018, p75: 0.293, min: 0, max: 50 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0-24)",
    rho: 0.222,
    rhoVerifiedFromData: 0.224,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher night-to-day ratio → higher PHQ-8.",
    realWorldTranslation: rwt(0.222, 0.70, "ratio units", SD_PHQ8, "PHQ-8 points", 0.018, 0.293),
    controlledFor: "None in this estimate.",
    mechanism:
      "Displaced nocturnal social engagement reflects rumination and insomnia; ratio framing controls for between-person differences in baseline social-media volume.",
    caveats:
      "The ratio framing partially neutralises the confound of overall social-media use; this is one of CoDaS's deliberately-chosen advantages over raw nocturnal use (DWB-02). Both DWB-02 and DWB-04 are presented so clinicians can assess incremental information.",
  },
  {
    id: "DWB-05",
    cohortId: "dwb_hourly",
    evidenceTier: "Emerging",
    title: "Hedonic-to-productivity app ratio",
    manuscriptColumn: "hedonic_productivity_ratio",
    inputDefinition:
      "CoDaS-engineered composite: ratio of time in hedonic-category apps (entertainment, gaming, social) to time in productivity apps (calendar, email, office, task managers). App-category mapping derived from RAPIDS / Google Play category metadata. Winsorised to [-50, 50] in preprocessing.",
    inputUnits: "unitless ratio",
    inputDist: { n: 7382, mean: 7.33, sd: 12.7, median: 1.83, p25: 0.38, p75: 7.19, min: 0, max: 50 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0-24)",
    rho: 0.152,
    rhoVerifiedFromData: 0.153,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher hedonic-to-productivity ratio → higher PHQ-8.",
    realWorldTranslation: rwt(0.152, 12.7, "ratio units", SD_PHQ8, "PHQ-8 points", 0.38, 7.19),
    controlledFor: "None in this estimate.",
    mechanism:
      "Two competing mechanisms are plausible. The CoDaS-generated narrative posits anhedonia (depressed individuals would have a LOWER hedonic-to-productivity ratio); but the observed sign is positive (higher ratio → higher PHQ-8), which is more consistent with avoidance / escapism into hedonic content. Clinicians should weigh these interpretations under rubric item C (literature).",
    caveats:
      "Hedonic / productivity app categorization is itself a soft mapping; boundary cases (e.g., LinkedIn) may go either way. Construct validity for this composite is the key open question. Smallest effect in the DWB validated set; the meaningfulness item (B) is critical.",
  },
  {
    id: "DWB-06",
    cohortId: "dwb_hourly",
    evidenceTier: "Emerging",
    title: "Polyphasic sleep percentage",
    manuscriptColumn: "polyphasic_sleep_pct",
    inputDefinition:
      "Percentage of nights, across the participant's observation window, on which the wearable detects a polyphasic sleep pattern (≥2 distinct sleep episodes separated by a wake interval, vs. a single consolidated nocturnal sleep). Derived from Fitbit / Pixel Watch sleep-stage segmentation. Reported as a proportion (0-1) rather than 0-100 percent.",
    inputUnits: "proportion of nights (0-1)",
    inputDist: { n: 7353, mean: 0.145, sd: 0.162, median: 0.091, p25: 0.036, p75: 0.222, min: 0, max: 1 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0-24)",
    rho: 0.184,
    rhoVerifiedFromData: 0.195,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher polyphasic-sleep percentage → higher PHQ-8.",
    realWorldTranslation: rwt(0.184, 0.162, "proportion", SD_PHQ8, "PHQ-8 points", 0.036, 0.222),
    controlledFor: "None in this estimate.",
    mechanism:
      "Fragmented nocturnal architecture reflects HPA-axis dysregulation.",
    caveats:
      "Fitbit / Pixel Watch sleep-staging accuracy is imperfect; polyphasic classifications include genuine multi-episode sleep but also short nighttime awakenings the device classifies as wake. Specialty note: this is a sleep-medicine feature; route to a sleep-medicine clinician where possible.",
  },

  // ============================================================
  // GLOBEM
  // ============================================================
  {
    id: "GLOB-01",
    cohortId: "globem",
    evidenceTier: "Established",
    title: "Sleep onset time variability (cosinor acrophase)",
    manuscriptColumn:
      "f_slp:fitbit_sleep_summary_rapids_*onsettime*:cosinor_acrophase",
    inputDefinition:
      "Cosinor-fit circadian acrophase of nightly sleep-onset time across the observation window; i.e., a measure of how much the participant's nightly sleep-onset clock-shifts day-to-day. Higher values indicate greater day-to-day irregularity. The cosinor feature is computed during the CoDaS pipeline run from RAPIDS-canonical sleep-onset timestamps and is not present as a static column in the consolidated CSV.",
    inputUnits: "hours (acrophase)",
    inputDist: null,
    inputDistSource: "manuscript",
    outputLabel: "PHQ-4 (0-12)",
    rho: 0.126,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More variable sleep onset → higher PHQ-4.",
    realWorldTranslation:
      "A 1-SD increase in sleep-onset variability is associated with approximately " +
      `${fmt(0.126 * SD_PHQ4)} PHQ-4 points (=|ρ|·SD_outcome with SD_outcome=${SD_PHQ4}).` +
      " Cohort-level distribution for the cosinor feature is not retained in the static CSV; the verified ρ here is reproduced directly from the manuscript / Appendix Table 9.",
    controlledFor:
      "None in this estimate. One wave per participant for the discovery ρ to remove within-subject correlation.",
    mechanism: "Irregular sleep scheduling disrupts circadian entrainment.",
    caveats:
      "Conditionally-validated tier (passed 4/11 checks). Cohort floor (CV AUC = 0.535) makes overall predictive ceiling weak; this association should be evaluated against literature on circadian disruption rather than against cohort-level prediction performance. Triangulates with DWB-01.",
  },
  {
    id: "GLOB-02",
    cohortId: "globem",
    evidenceTier: "Supported",
    title: "Evening incoming call duration (cosinor acrophase)",
    manuscriptColumn:
      "f_call:phone_calls_rapids_incoming_sumduration:evening_cosinor_acrophase",
    inputDefinition:
      "Cosinor-fit circadian acrophase summary of evening incoming-call total duration. Operationally: among incoming smartphone calls received during evening hours, the cosinor-acrophase summary of their durations across the observation window. RAPIDS-canonical name shown above; cosinor variant is generated during pipeline run, not present as a static column.",
    inputUnits: "hours (acrophase)",
    inputDist: null,
    inputDistSource: "manuscript",
    outputLabel: "PHQ-4 (0-12)",
    rho: -0.145,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR) at discovery",
    direction:
      "Lower evening incoming-call activity → higher PHQ-4 (DISCOVERY phase). Holdout-confirmation ρ = +0.435; sign reversed.",
    stabilityFlag:
      "Sign reversal across discovery and holdout partitions. Manuscript reports the conservative discovery-phase estimate; recommend treating as UNSTABLE.",
    realWorldTranslation:
      "Discovery-phase magnitude ≈ |ρ|·SD_outcome = " +
      `${fmt(0.145 * SD_PHQ4)} PHQ-4 points per 1-SD shift. ` +
      "However, the sign reverses between discovery and holdout; clinicians should rate the validity item (A) with full knowledge of this instability.",
    controlledFor: "None in this estimate.",
    mechanism:
      "Reduced evening social communication reflects social withdrawal; but the holdout reversal undermines the simple interpretation.",
    caveats:
      "Including this card is itself diagnostic: clinicians who rate validity high without flagging the sign reversal indicate the panel needs additional briefing on caveats handling.",
  },
  {
    id: "GLOB-03",
    cohortId: "globem",
    evidenceTier: "Emerging",
    title: "WiFi AP sequential diversity (7-day)",
    manuscriptColumn: "f_wifi:phone_wifi_connected_rapids_countscans:7dhist (closest static surrogate)",
    inputDefinition:
      "Number of distinct WiFi access-point connections / scans observed per participant across a 7-day rolling window. Higher values indicate greater day-to-day environmental change (more locations visited or network environments traversed). Manuscript names a 'sequential diversity' variant; the closest static surrogate column we verified is the RAPIDS countscans:7dhist column.",
    inputUnits: "count of unique APs / 7-day window",
    inputDist: null,
    inputDistSource: "manuscript",
    outputLabel: "PHQ-4 (0-12)",
    rho: 0.128,
    rhoCI: [0.10, 0.24],
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More WiFi-AP diversity → higher PHQ-4.",
    realWorldTranslation:
      "1-SD increase in WiFi-AP diversity is associated with approximately " +
      `${fmt(0.128 * SD_PHQ4)} PHQ-4 points (=|ρ|·SD_outcome).`,
    controlledFor: "None in this estimate.",
    mechanism: "Dynamic network scanning as proxy for environmental instability.",
    caveats:
      "This is a proxy-of-a-proxy; WiFi AP scans are a noisy mobility surrogate, and environmental instability is itself one of several psychological constructs the metric could index (housing instability, social transition, restlessness, work travel). Rubric items C (literature) and E (added value) will likely surface concerns.",
  },

  // ============================================================
  // WEAR-ME
  // ============================================================
  {
    id: "WME-01",
    cohortId: "wearme",
    evidenceTier: "Established",
    title: "HDL cholesterol",
    manuscriptColumn: "hdl",
    inputDefinition:
      "Fasting serum HDL cholesterol from a standard clinical lipid-panel assay (≥8h fasting). Measured in mg/dL. Note: HDL is a clinical metabolic-syndrome component but is NOT a direct mathematical component of HOMA-IR (which uses fasting glucose and insulin only).",
    inputUnits: "mg/dL",
    inputDist: { n: 1078, mean: 58.2, sd: 15.3, median: 56, p25: 47, p75: 67, min: 22, max: 148 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: -0.412,
    rhoVerifiedFromData: -0.380,
    rhoMatchesManuscript: false,
    pValue: "<0.001 (BH-FDR)",
    direction: "Lower HDL → higher HOMA-IR.",
    realWorldTranslation: rwt(-0.412, 15.3, "mg/dL", SD_HOMA, "HOMA-IR units", 47, 67),
    controlledFor: "None in this estimate.",
    mechanism:
      "Low HDL reflects impaired reverse cholesterol transport in metabolic syndrome.",
    caveats:
      "Verified ρ on the static dataset is −0.380 (slight drift of 0.032 from the manuscript's −0.412; likely reflects differences in winsorisation or participant subset between discovery and the static CSV). Construct overlap with metabolic syndrome is the key clinical-utility question (rubric item E): clinicians may rate validity high but added value low, given how routinely HDL is already used.",
  },
  {
    id: "WME-02",
    cohortId: "wearme",
    evidenceTier: "Established",
    title: "C-reactive protein (CRP)",
    manuscriptColumn: "crp",
    inputDefinition:
      "Fasting serum C-reactive protein from a high-sensitivity CRP assay. A non-specific systemic inflammatory marker.",
    inputUnits: "mg/L",
    inputDist: { n: 1078, mean: 2.66, sd: 3.05, median: 1.4, p25: 0.6, p75: 3.5, min: 0.2, max: 20 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: 0.393,
    rhoCI: [0.34, 0.44],
    rhoVerifiedFromData: 0.393,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher CRP → higher HOMA-IR.",
    realWorldTranslation: rwt(0.393, 3.05, "mg/L", SD_HOMA, "HOMA-IR units", 0.6, 3.5),
    controlledFor: "None in this estimate.",
    mechanism:
      "Systemic inflammation mediates adipose-derived insulin resistance via TNF-α / IL-6.",
    caveats:
      "CRP is a non-specific inflammatory marker; elevations can reflect any acute or chronic inflammatory state. Cohort right-skew (mean 2.66 vs median 1.4) is consistent with a sub-population of high-CRP outliers. Active-infection / autoimmune-flare exclusion criteria from the source WEAR-ME study (Metwally et al., 2026) should be confirmed before clinical translation.",
  },
  {
    id: "WME-03",
    cohortId: "wearme",
    evidenceTier: "Emerging",
    title: "Derived AST/ALT ratio (De Ritis)",
    manuscriptColumn: "(derived: ast / alt)",
    inputDefinition:
      "Ratio of fasting serum aspartate aminotransferase (AST) to alanine aminotransferase (ALT); the De Ritis ratio. Both assays are standard hepatic liver-function tests; the ratio is a well-known hepatic indicator. CoDaS feature-engineering agents constructed this composite after the literature-grounding phase surfaced hepatic stress as a candidate insulin-resistance axis.",
    inputUnits: "unitless ratio",
    inputDist: { n: 1078, mean: 1.08, sd: 0.381, median: 1.04, p25: 0.83, p75: 1.25, min: 0.40, max: 5 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: -0.375,
    rhoVerifiedFromData: -0.371,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Lower AST/ALT ratio (i.e., relatively higher ALT) → higher HOMA-IR.",
    realWorldTranslation: rwt(-0.375, 0.381, "ratio units", SD_HOMA, "HOMA-IR units", 0.83, 1.25),
    controlledFor: "None in this estimate.",
    mechanism:
      "Hepatic gluconeogenic stress and subclinical steatosis marker. Low De Ritis (high ALT relative to AST) is classically associated with hepatocellular injury and fatty liver, both of which precede / co-occur with insulin resistance.",
    composite: { formula: "ast / alt" },
    caveats:
      "While the De Ritis ratio is an established hepatic marker, its specific operationalization as a composite biomarker for insulin resistance from a population-screening cohort is not commonly reported; hence Emerging tier. Clinicians may have strong literature priors here.",
  },
  {
    id: "WME-04",
    cohortId: "wearme",
    evidenceTier: "Established",
    title: "Resting heart rate (mean); wearable",
    manuscriptColumn: "Resting Heart Rate (mean)",
    inputDefinition:
      "Mean resting heart rate (bpm) measured by wrist-worn Fitbit / Pixel Watch over the observation window. The wearable's resting-HR estimate uses non-active periods including sleep. Noninvasive, consumer-grade telemetry.",
    inputUnits: "bpm",
    inputDist: { n: 1078, mean: 66.9, sd: 8.12, median: 66.4, p25: 61.6, p75: 72.1, min: 43.5, max: 93.6 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: 0.348,
    rhoVerifiedFromData: 0.349,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher resting HR → higher HOMA-IR.",
    realWorldTranslation: rwt(0.348, 8.12, "bpm", SD_HOMA, "HOMA-IR units", 61.6, 72.1),
    controlledFor: "None in this estimate.",
    mechanism:
      "Autonomic imbalance: sympathetic overdrive increases hepatic glucose output.",
    caveats:
      "Wearable resting-HR estimates have ±2-4 bpm noise vs. clinical telemetry. RHR is heavily influenced by fitness, age, and medications (β-blockers); cohort exclusion criteria for β-blocker users should be confirmed. NOTE: Appendix Table 8 lists median RHR (ρ=0.347, validated 11/11) and mean RHR (ρ=0.348, conditionally validated). The manuscript Table 3 reports the mean.",
  },
  {
    id: "WME-05",
    cohortId: "wearme",
    evidenceTier: "Supported",
    title: "Cardiovascular fitness index (steps / RHR); wearable",
    manuscriptColumn: "(derived: STEPS (mean) / Resting Heart Rate (mean))",
    inputDefinition:
      "CoDaS-engineered composite: daily steps divided by resting heart rate, both measured from the wrist-worn wearable, averaged over the observation window. Higher values indicate greater daily activity at lower resting cardiac demand; a noninvasive proxy for cardiorespiratory fitness. Construction rationale: the CoDaS hypothesis-generator retrieved evidence linking cardiorespiratory fitness to peripheral glucose disposal.",
    inputUnits: "steps / bpm (per day)",
    inputDist: { n: 1078, mean: 121, sd: 62.7, median: 109, p25: 79, p75: 147, min: 10.8, max: 664 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: -0.374,
    rhoCI: [-0.42, -0.32],
    rhoVerifiedFromData: -0.371,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher fitness index → lower HOMA-IR.",
    realWorldTranslation: rwt(-0.374, 62.7, "steps/bpm", SD_HOMA, "HOMA-IR units", 79, 147),
    controlledFor: "None in this estimate.",
    mechanism:
      "Peripheral glucose disposal efficiency driven by skeletal-muscle mitochondrial density.",
    composite: { formula: "STEPS (mean) / Resting Heart Rate (mean)" },
    caveats:
      "The composite is intentionally normalized; it controls for between-person differences in baseline step counts (a fit person walking 6,000 steps with HR 55 may be metabolically healthier than someone walking 10,000 with HR 80). The manuscript highlights this as the most clinically translatable wearable-derived candidate from WEAR-ME. ANCHOR for Mattia's real-world translational-relevance criterion.",
  },
  {
    id: "WME-06",
    cohortId: "wearme",
    evidenceTier: "Emerging",
    title: "Red cell distribution width (RDW)",
    manuscriptColumn: "rdw",
    inputDefinition:
      "Red cell distribution width; the % coefficient of variation in erythrocyte volume; from a standard CBC panel (typical normal range ~11.5-14.5%).",
    inputUnits: "%",
    inputDist: { n: 1077, mean: 12.9, sd: 1.0, median: 12.7, p25: 12.3, p75: 13.2, min: 10.7, max: 20.7 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: 0.281,
    rhoVerifiedFromData: 0.277,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher RDW → higher HOMA-IR.",
    realWorldTranslation: rwt(0.281, 1.0, "% RDW", SD_HOMA, "HOMA-IR units", 12.3, 13.2),
    controlledFor: "None in this estimate.",
    mechanism:
      "Erythropoietic stress as a marker of chronic low-grade metabolic inflammation.",
    caveats:
      "IMPORTANT: the source WEAR-ME paper (Metwally et al., 2026) reported that standard CBC analytes 'did not differ significantly in their effect size between the IR and IS groups' in a categorical group-comparison analysis. CoDaS's continuous Spearman ρ on N=1,078 surfaces a signal that the categorical test missed. This discrepancy is a feature, not a bug; but clinicians should be told about it explicitly so they can decide whether the continuous association is clinically meaningful or an artifact of statistical power. The narrow IQR (12.3-13.2%) means absolute movements look small in native units even though the standardized effect is moderate.",
  },
  {
    id: "WME-07",
    cohortId: "wearme",
    evidenceTier: "Emerging",
    title: "Albumin/globulin ratio",
    manuscriptColumn: "albumin/globulin",
    inputDefinition:
      "Ratio of fasting serum albumin to globulin (both standard chemistry assays). The ratio is a long-standing clinical chemistry summary often reported on routine labs. CoDaS treats it as an autonomously-constructed composite for the purposes of feature provenance.",
    inputUnits: "unitless ratio",
    inputDist: { n: 1078, mean: 1.75, sd: 0.277, median: 1.7, p25: 1.6, p75: 1.9, min: 1, max: 3 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: -0.220,
    rhoVerifiedFromData: -0.227,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Lower albumin/globulin → higher HOMA-IR.",
    realWorldTranslation: rwt(-0.220, 0.277, "ratio units", SD_HOMA, "HOMA-IR units", 1.6, 1.9),
    controlledFor: "None in this estimate.",
    mechanism:
      "Hepatic synthetic dysfunction (low albumin) and subclinical inflammatory protein shift (high globulin).",
    caveats:
      "Underlying components are well-known clinical markers, but the ratio as a population-screening proxy for insulin resistance is not commonly reported. Smallest effect in the cohort's validated set; rubric item B (effect-size meaningfulness) is the critical judgment.",
  },

  // ============================================================
  // Calibration probe (rejected positive control)
  // ============================================================
  {
    id: "WME-PC",
    cohortId: "wearme",
    evidenceTier: "Rejected",
    title: "Derived TG/HDL ratio (REJECTED; calibration probe)",
    manuscriptColumn: "(derived: triglycerides / hdl)",
    inputDefinition:
      "Ratio of fasting serum triglycerides to fasting serum HDL cholesterol. CoDaS feature-engineering agent constructed this composite; the Critic agent's construct-independence gate rejected it because both components are direct, definitional components of metabolic syndrome and exhibit near-tautological correlation with HOMA-IR.",
    inputUnits: "unitless ratio",
    inputDist: { n: 1078, mean: 2.01, sd: 1.43, median: 1.59, p25: 1.04, p75: 2.44, min: 0.27, max: 10.2 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR",
    rho: 0.562,
    rhoVerifiedFromData: 0.542,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher TG/HDL → higher HOMA-IR.",
    realWorldTranslation: rwt(0.562, 1.43, "ratio units", SD_HOMA, "HOMA-IR units", 1.04, 2.44),
    controlledFor: "None in this estimate.",
    mechanism: "Atherogenic dyslipidemia indexes hepatic insulin resistance.",
    composite: { formula: "triglycerides / hdl" },
    caveats:
      "Rejected by CoDaS's construct-independence gate; included as a calibration probe. Half the panel sees this card without the rejection annotation; clinicians who rate validity high AND added value high (without flagging the construct overlap) signal that the panel needs more briefing. Clinicians who flag it pass calibration. The other half sees it explicitly labelled as rejected so we can compare arms.",
    isCalibrationProbe: true,
  },
];
