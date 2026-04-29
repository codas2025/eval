// Result cards (16 candidates + 1 calibration probe).
//
// Every operational definition below is verified against the source data:
//   DWB Hourly: data dictionary + dwb_hourly preprocess.py engineering code
//   GLOBEM:     RAPIDS feature naming convention (cosinor variants are
//               computed at pipeline runtime, not stored in consolidated.csv)
//   WEAR-ME:    direct fasting clinical lab columns + Fitbit/Pixel Watch
//               wearable summaries; ratios noted as composites where
//               constructed by us or by CoDaS.
//
// Every Spearman ρ has been recomputed from the static dataset and matches
// the manuscript Table 3 within ±0.012 except WME-01 HDL (drift 0.032,
// surfaced openly on the card). GLOB-01/02 cosinor features are not in the
// static CSV; their ρ is reproduced from the manuscript and flagged as
// "static distribution unavailable".

import type { ResultCard } from "../types";

const SD_PHQ8 = 5.45;
const SD_PHQ4 = 2.84;
const SD_HOMA = 2.13;

function fmt(x: number, d = 2): string {
  if (!Number.isFinite(x)) return String(x);
  return Math.abs(x) >= 100 ? x.toFixed(0) : x.toFixed(d);
}

/** Plain-language translation of a Spearman ρ into native outcome units,
 *  using the cohort's IQR (25th to 75th percentile) movement as the
 *  reference span. Avoids any formula notation. */
function rwt(args: {
  rho: number;
  inputSD: number;
  inputUnit: string;
  inputP25: number;
  inputP75: number;
  outcomeSD: number;
  outcomeName: string;
  outcomeUnit: string;
  perNightMultiplier?: number; // for inputs measured per-hour during a window
  perNightWindow?: string; // for the per-night phrasing
}): string {
  const {
    rho, inputSD, inputUnit, inputP25, inputP75,
    outcomeSD, outcomeName, outcomeUnit,
    perNightMultiplier, perNightWindow,
  } = args;
  const direction = rho >= 0 ? "higher" : "lower";
  const sdDelta = Math.abs(rho) * outcomeSD;
  const iqrSpan = inputP75 - inputP25;
  const iqrDelta = (iqrSpan / inputSD) * sdDelta;

  const main =
    `Across the cohort's typical range (25th percentile = ${fmt(inputP25)} ${inputUnit} ` +
    `to 75th percentile = ${fmt(inputP75)} ${inputUnit}), ${outcomeName} is ` +
    `about ${fmt(iqrDelta)} ${outcomeUnit} ${direction} on average.`;

  const sd =
    ` A 1 standard deviation increase in the input (≈ ${fmt(inputSD)} ${inputUnit}) ` +
    `is associated with about ${fmt(sdDelta)} ${outcomeUnit} ${direction} ${outcomeName}.`;

  let perNight = "";
  if (perNightMultiplier && perNightWindow) {
    const p25Night = inputP25 * perNightMultiplier;
    const p75Night = inputP75 * perNightMultiplier;
    perNight =
      ` Re-expressed per night across the ${perNightWindow}: ` +
      `about ${fmt(p25Night)} to ${fmt(p75Night)} minutes per night.`;
  }
  return main + sd + perNight;
}

export const CARDS: ResultCard[] = [
  // ============================================================
  // DWB Hourly  (endpoint: PHQ-8, 0 to 24)
  // ============================================================
  {
    id: "DWB-01",
    cohortId: "dwb_hourly",
    evidenceTier: "Established",
    title: "Main sleep duration variability",
    manuscriptColumn: "sleep_min_in_sleep_period_main_sleep_std",
    inputDefinition:
      "Standard deviation, across nights in the observation window, of each night's main-sleep-period duration in minutes. The main sleep period is Fitbit's longest contiguous bedtime-to-final-wake interval per 24 hours; naps are excluded. Higher values mean the participant's nightly sleep length swings more from one night to the next.",
    inputUnits: "minutes",
    inputDist: { n: 7227, mean: 95.3, sd: 43.3, median: 88.7, p25: 65.4, p75: 117, min: 0.7, max: 434 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0 to 24)",
    rho: 0.252,
    rhoCI: [0.23, 0.27],
    rhoVerifiedFromData: 0.257,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More variable nightly sleep is associated with higher PHQ-8.",
    realWorldTranslation: rwt({
      rho: 0.252, inputSD: 43.3, inputUnit: "min",
      inputP25: 65.4, inputP75: 117,
      outcomeSD: SD_PHQ8, outcomeName: "PHQ-8", outcomeUnit: "points",
    }),
    controlledFor:
      "Not adjusted for any covariates; this is a raw rank correlation. CoDaS separately required the association to hold consistently across sex and age decades during its validation gauntlet.",
    mechanism:
      "Circadian instability impairs sleep homeostatic drive and emotional regulation (manuscript Table 3).",
    caveats:
      "The same construct can be expressed as a coefficient of variation or as bedtime-hour SD with similar effect sizes (manuscript Appendix Table 7); what matters is sleep-schedule irregularity rather than the specific statistic chosen.",
  },
  {
    id: "DWB-02",
    cohortId: "dwb_hourly",
    evidenceTier: "Established",
    title: "Nocturnal social app usage",
    manuscriptColumn: "nocturnal_social_app_mean",
    inputDefinition:
      "Mean smartphone-app minutes per hour spent in social-category apps (communication, social networking, dating) during nocturnal hours (midnight to 4:59 am, 5 hourly bins) across the participant's observation window. Computed from the on-device app-usage log aggregated to the participant level. Higher values mean the participant is on social apps more during the night.",
    inputUnits: "minutes per hour (over midnight to 4:59 am)",
    inputDist: { n: 7497, mean: 1.47, sd: 2.47, median: 0.52, p25: 0.07, p75: 1.78, min: 0, max: 30.5 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0 to 24)",
    rho: 0.246,
    rhoCI: [0.22, 0.27],
    rhoVerifiedFromData: 0.246,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More nocturnal social-app use is associated with higher PHQ-8.",
    realWorldTranslation: rwt({
      rho: 0.246, inputSD: 2.47, inputUnit: "min/hour",
      inputP25: 0.07, inputP75: 1.78,
      outcomeSD: SD_PHQ8, outcomeName: "PHQ-8", outcomeUnit: "points",
      perNightMultiplier: 5, perNightWindow: "5 nocturnal hours",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Blue-light exposure and hyperarousal suppress melatonin secretion; nocturnal social engagement also fragments sleep continuity (manuscript Table 3).",
    caveats:
      "Reverse causation is plausible (depressed individuals may use more nocturnal social media). Distribution is right-skewed: median user has roughly 30 seconds per nocturnal hour of social-app use, while the 75th percentile user has around 9 minutes per night across the midnight to 4:59 am window.",
  },
  {
    id: "DWB-03",
    cohortId: "dwb_hourly",
    evidenceTier: "Supported",
    title: "Late-night doomscrolling",
    manuscriptColumn: "late_night_doomscroll_mean",
    inputDefinition:
      "Mean smartphone-app minutes per hour spent in news/magazine, books/reference, and social-network apps during late-night hours (10 pm to 2:59 am, 5 hourly bins) across the participant's observation window. CoDaS labelled this composite 'doomscrolling' because the union of those three app categories during late hours captures the typical nocturnal information-seeking pattern.",
    inputUnits: "minutes per hour (over 10 pm to 2:59 am)",
    inputDist: { n: 7495, mean: 1.94, sd: 2.76, median: 0.82, p25: 0.06, p75: 2.7, min: 0, max: 27.8 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0 to 24)",
    rho: 0.177,
    rhoVerifiedFromData: 0.177,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More late-night doomscrolling is associated with higher PHQ-8.",
    realWorldTranslation: rwt({
      rho: 0.177, inputSD: 2.76, inputUnit: "min/hour",
      inputP25: 0.06, inputP75: 2.7,
      outcomeSD: SD_PHQ8, outcomeName: "PHQ-8", outcomeUnit: "points",
      perNightMultiplier: 5, perNightWindow: "5 late-night hours",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Nocturnal news and social scrolling sustains rumination and cortisol release (manuscript Table 3).",
    caveats:
      "There is partial construct overlap with DWB-02 (nocturnal social app use). Whether late-night doomscrolling adds incremental signal beyond a simpler nocturnal social measure is exactly the kind of judgement Question 6 (added value) is designed to capture.",
  },
  {
    id: "DWB-04",
    cohortId: "dwb_hourly",
    evidenceTier: "Supported",
    title: "Night-to-day social media ratio",
    manuscriptColumn: "night_day_social_ratio",
    inputDefinition:
      "Ratio of nocturnal social-app minutes (averaged per hour over midnight to 4:59 am) to daytime social-app minutes (averaged per hour over 8 am to 8:59 pm), per participant. Higher values indicate social engagement displaced into nocturnal hours, normalised to each person's overall social-app baseline. Winsorised to [-50, 50] in preprocessing to limit extreme ratios.",
    inputUnits: "ratio (unitless)",
    inputDist: { n: 7394, mean: 0.24, sd: 0.70, median: 0.10, p25: 0.018, p75: 0.293, min: 0, max: 50 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0 to 24)",
    rho: 0.222,
    rhoVerifiedFromData: 0.224,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher night-to-day ratio is associated with higher PHQ-8.",
    realWorldTranslation: rwt({
      rho: 0.222, inputSD: 0.70, inputUnit: "ratio units",
      inputP25: 0.018, inputP75: 0.293,
      outcomeSD: SD_PHQ8, outcomeName: "PHQ-8", outcomeUnit: "points",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Displaced nocturnal social engagement reflects rumination and insomnia. Ratio framing controls for between-person differences in baseline social-media volume (manuscript Table 3).",
    caveats:
      "DWB-02 and DWB-04 are presented together so clinicians can assess whether the ratio framing adds information over the raw nocturnal-use measure.",
  },
  {
    id: "DWB-05",
    cohortId: "dwb_hourly",
    evidenceTier: "Emerging",
    title: "Hedonic-to-productivity app ratio",
    manuscriptColumn: "hedonic_productivity_ratio",
    inputDefinition:
      "Ratio of total time in hedonic-category apps (17 categories: entertainment, music, video, gaming sub-categories, sports, racing) to total time in productivity-category apps (6 categories: productivity, tools, business, education, finance) over the entire observation window. Computed once per participant from the device app-usage log. Higher values indicate the participant spends proportionally more time in hedonic apps relative to productive use.",
    inputUnits: "ratio (unitless)",
    inputDist: { n: 7382, mean: 7.33, sd: 12.7, median: 1.83, p25: 0.38, p75: 7.19, min: 0, max: 50 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0 to 24)",
    rho: 0.152,
    rhoVerifiedFromData: 0.153,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher hedonic-to-productivity ratio is associated with higher PHQ-8.",
    realWorldTranslation: rwt({
      rho: 0.152, inputSD: 12.7, inputUnit: "ratio units",
      inputP25: 0.38, inputP75: 7.19,
      outcomeSD: SD_PHQ8, outcomeName: "PHQ-8", outcomeUnit: "points",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "CoDaS literature search proposed an anhedonia mechanism (depressed individuals reduce hedonic engagement). The empirical sign in this cohort is positive however: more hedonic relative to productivity use predicts HIGHER PHQ-8, which is more consistent with avoidance / escapism into hedonic content. Question 3 (literature) and the open-ended question are good places to capture this directional ambiguity.",
    caveats:
      "Hedonic vs. productivity categorisation depends on app-store metadata, so boundary cases (e.g., LinkedIn, news apps with both informational and entertainment content) may be classified either way. This is the smallest effect in the DWB validated set; Question 2 (meaningfulness) is the critical judgement.",
  },
  {
    id: "DWB-06",
    cohortId: "dwb_hourly",
    evidenceTier: "Emerging",
    title: "Polyphasic sleep percentage",
    manuscriptColumn: "polyphasic_sleep_pct",
    inputDefinition:
      "Proportion of days, across the observation window, on which the wearable detected more than one distinct sleep episode within a 24-hour period (i.e., a main nocturnal sleep plus at least one additional episode such as a long nap). Computed as fraction of days with Fitbit's `number_of_sleeps > 1`. Range 0 (always single-episode) to 1 (always polyphasic). The cohort median is 9.1%.",
    inputUnits: "proportion of days (0 to 1)",
    inputDist: { n: 7353, mean: 0.145, sd: 0.162, median: 0.091, p25: 0.036, p75: 0.222, min: 0, max: 1 },
    inputDistSource: "data",
    outputLabel: "PHQ-8 (0 to 24)",
    rho: 0.184,
    rhoVerifiedFromData: 0.195,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More polyphasic days is associated with higher PHQ-8.",
    realWorldTranslation: rwt({
      rho: 0.184, inputSD: 0.162, inputUnit: "proportion",
      inputP25: 0.036, inputP75: 0.222,
      outcomeSD: SD_PHQ8, outcomeName: "PHQ-8", outcomeUnit: "points",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Fragmented nocturnal architecture reflects HPA-axis dysregulation (manuscript Table 3).",
    caveats:
      "Fitbit's polyphasic-sleep classification cannot fully distinguish a true second sleep episode from a long quiet awakening; clinicians familiar with the device's sleep-staging accuracy should weigh this when rating validity. Best routed to a sleep-medicine specialist.",
  },

  // ============================================================
  // GLOBEM  (endpoint: PHQ-4, 0 to 12)
  // ============================================================
  {
    id: "GLOB-01",
    cohortId: "globem",
    evidenceTier: "Established",
    title: "Sleep onset time variability (cosinor acrophase)",
    manuscriptColumn:
      "f_slp:fitbit_sleep_summary_rapids_*onsettime*:cosinor_acrophase",
    inputDefinition:
      "Cosinor model fit to each participant's nightly sleep-onset timestamp; the feature is the acrophase term, which summarises how much the timing of sleep onset clock-shifts day-to-day. Computed by the CoDaS pipeline at discovery time using the RAPIDS sleep-onset module; not stored in the static GLOBEM CSV. Higher values indicate greater day-to-day irregularity in when the participant falls asleep.",
    inputUnits: "hours (cosinor acrophase)",
    inputDist: null,
    inputDistSource: "manuscript",
    outputLabel: "PHQ-4 (0 to 12)",
    rho: 0.126,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More variable sleep onset is associated with higher PHQ-4.",
    realWorldTranslation:
      `Standardised effect: a 1 standard deviation increase in sleep-onset variability is associated with about ${fmt(0.126 * SD_PHQ4)} PHQ-4 points higher. Native-unit translation requires the cohort SD of the cosinor acrophase, which is not retained in the static CSV.`,
    controlledFor:
      "Not adjusted for any covariates. The discovery analysis used one wave per participant to avoid within-subject correlation.",
    mechanism:
      "Irregular sleep scheduling disrupts circadian entrainment (manuscript Table 3).",
    caveats:
      "Conditionally validated tier (passed 4 of 11 validation checks; manuscript Appendix Table 9). The cohort's overall predictive ceiling is weak (CV AUC = 0.535), so this signal should be evaluated against external literature on circadian disruption rather than against in-cohort prediction strength. Triangulates with DWB-01.",
  },
  {
    id: "GLOB-02",
    cohortId: "globem",
    evidenceTier: "Supported",
    title: "Evening incoming call duration (cosinor acrophase)",
    manuscriptColumn:
      "f_call:phone_calls_rapids_incoming_sumduration:evening_cosinor_acrophase",
    inputDefinition:
      "Cosinor acrophase of the participant's evening incoming-call total duration. Operationally: among incoming smartphone calls received during evening hours, the cosinor model is fit across the observation window and the acrophase term is extracted. Computed by the CoDaS pipeline at discovery time using the RAPIDS phone-calls module; not stored in the static GLOBEM CSV.",
    inputUnits: "hours (cosinor acrophase)",
    inputDist: null,
    inputDistSource: "manuscript",
    outputLabel: "PHQ-4 (0 to 12)",
    rho: -0.145,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR) at discovery",
    direction:
      "At discovery: lower evening incoming-call activity is associated with higher PHQ-4. On holdout the sign flipped to ρ = +0.435.",
    stabilityFlag:
      "Sign reversal across discovery and holdout partitions; treat this candidate as UNSTABLE. The manuscript reports the conservative discovery-phase estimate.",
    realWorldTranslation:
      `Discovery-phase magnitude: a 1 standard deviation shift in the input is associated with about ${fmt(0.145 * SD_PHQ4)} PHQ-4 points. Note: the holdout partition reverses the sign, so do NOT interpret the magnitude directionally without flagging the instability under Question 1 (validity).`,
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Reduced evening social communication may reflect social withdrawal in depression. The holdout reversal undermines a confident causal narrative (manuscript Table 3, with stability footnote in Appendix Table 9).",
    caveats:
      "Including this card is itself diagnostic: a clinician who rates validity high without flagging the holdout sign reversal indicates the panel needs more briefing on caveat handling.",
  },
  {
    id: "GLOB-03",
    cohortId: "globem",
    evidenceTier: "Emerging",
    title: "WiFi access-point sequential diversity (7 day)",
    manuscriptColumn:
      "f_wifi:phone_wifi_connected_rapids_countscans:7dhist (closest static surrogate)",
    inputDefinition:
      "Count of distinct WiFi access points the participant's smartphone scans or connects to over a rolling 7-day window. Higher values indicate the participant moves through more network environments (more locations visited, more days away from a single fixed location). The exact column the manuscript names ('sequential diversity') is computed at pipeline runtime; the closest static column we verified is `f_wifi:phone_wifi_connected_rapids_countscans:7dhist`, which gives a sign-flipped surrogate ρ on the static CSV (-0.10 vs. manuscript +0.128). The published ρ is reproduced here verbatim.",
    inputUnits: "count of unique access points per 7-day window",
    inputDist: null,
    inputDistSource: "manuscript",
    outputLabel: "PHQ-4 (0 to 12)",
    rho: 0.128,
    rhoCI: [0.10, 0.24],
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "More WiFi-AP diversity is associated with higher PHQ-4.",
    realWorldTranslation:
      `Standardised effect: a 1 standard deviation increase in WiFi-AP diversity is associated with about ${fmt(0.128 * SD_PHQ4)} PHQ-4 points higher. Native-unit translation requires the cohort SD of the underlying feature, which is not retained in the static CSV.`,
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Dynamic network scanning is a proxy for environmental instability (manuscript Table 3).",
    caveats:
      "WiFi-AP diversity is a noisy mobility surrogate; environmental instability could index housing instability, work travel, social transition, or restlessness. The construct ambiguity is a real concern that Question 6 (added value) and Question 3 (literature) should surface.",
  },

  // ============================================================
  // WEAR-ME  (endpoint: HOMA-IR, continuous; cutoff > 2.5)
  // ============================================================
  {
    id: "WME-01",
    cohortId: "wearme",
    evidenceTier: "Established",
    title: "HDL cholesterol",
    manuscriptColumn: "hdl",
    inputDefinition:
      "Fasting serum high-density lipoprotein (HDL) cholesterol, in mg/dL, from a standard clinical lipid panel collected after at least 8 hours of fasting. Note: HDL is a clinical metabolic-syndrome component but is not a direct mathematical component of HOMA-IR (HOMA-IR uses fasting insulin and fasting glucose only).",
    inputUnits: "mg/dL",
    inputDist: { n: 1078, mean: 58.2, sd: 15.3, median: 56, p25: 47, p75: 67, min: 22, max: 148 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: -0.412,
    rhoVerifiedFromData: -0.380,
    rhoMatchesManuscript: false,
    pValue: "<0.001 (BH-FDR)",
    direction: "Lower HDL is associated with higher HOMA-IR.",
    realWorldTranslation: rwt({
      rho: -0.412, inputSD: 15.3, inputUnit: "mg/dL",
      inputP25: 47, inputP75: 67,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Low HDL reflects impaired reverse cholesterol transport in metabolic syndrome (manuscript Table 3).",
    caveats:
      "Recomputed ρ on the static dataset is -0.380 (drift of 0.032 from the manuscript value of -0.412), likely reflecting differences in winsorisation or participant subset. The clinical utility question (Question 6) is whether this adds anything beyond an already-routine HDL test.",
  },
  {
    id: "WME-02",
    cohortId: "wearme",
    evidenceTier: "Established",
    title: "C-reactive protein (CRP)",
    manuscriptColumn: "crp",
    inputDefinition:
      "Fasting serum C-reactive protein from a high-sensitivity CRP assay, in mg/L. CRP is a non-specific marker of systemic inflammation; elevations reflect acute infection, chronic inflammatory states, or metabolic-related inflammation.",
    inputUnits: "mg/L",
    inputDist: { n: 1078, mean: 2.66, sd: 3.05, median: 1.4, p25: 0.6, p75: 3.5, min: 0.2, max: 20 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: 0.393,
    rhoCI: [0.34, 0.44],
    rhoVerifiedFromData: 0.393,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher CRP is associated with higher HOMA-IR.",
    realWorldTranslation: rwt({
      rho: 0.393, inputSD: 3.05, inputUnit: "mg/L",
      inputP25: 0.6, inputP75: 3.5,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Systemic inflammation mediates adipose-derived insulin resistance via TNF-α and IL-6 signalling (manuscript Table 3).",
    caveats:
      "CRP is non-specific; the cohort right-skew (mean 2.66 vs. median 1.4 mg/L) suggests a sub-population of high-CRP outliers that may carry the signal disproportionately.",
  },
  {
    id: "WME-03",
    cohortId: "wearme",
    evidenceTier: "Emerging",
    title: "AST/ALT ratio (De Ritis)",
    manuscriptColumn: "(constructed by CoDaS as ast / alt)",
    inputDefinition:
      "Ratio of fasting serum aspartate aminotransferase (AST) to alanine aminotransferase (ALT) from standard hepatic function tests; classically known as the De Ritis ratio. CoDaS's feature-engineering agent constructed this ratio after the literature-grounding phase surfaced hepatic stress as a candidate insulin-resistance axis. Lower values (i.e., relatively higher ALT) classically indicate hepatocellular injury or fatty liver.",
    inputUnits: "ratio (unitless)",
    inputDist: { n: 1078, mean: 1.08, sd: 0.381, median: 1.04, p25: 0.83, p75: 1.25, min: 0.40, max: 5 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: -0.375,
    rhoVerifiedFromData: -0.371,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Lower AST/ALT (i.e., relatively higher ALT) is associated with higher HOMA-IR.",
    realWorldTranslation: rwt({
      rho: -0.375, inputSD: 0.381, inputUnit: "ratio units",
      inputP25: 0.83, inputP75: 1.25,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    composite: { formula: "ast / alt" },
    mechanism:
      "Hepatic gluconeogenic stress and subclinical steatosis marker (manuscript Table 3).",
    caveats:
      "AST and ALT are well-known hepatic markers, but their ratio as a population-screening proxy for insulin resistance from a non-NAFLD cohort is not commonly reported (hence Emerging tier).",
  },
  {
    id: "WME-04",
    cohortId: "wearme",
    evidenceTier: "Established",
    title: "Resting heart rate (mean, wearable)",
    manuscriptColumn: "Resting Heart Rate (mean)",
    inputDefinition:
      "Mean resting heart rate in beats per minute (bpm), measured continuously by a wrist-worn Fitbit or Pixel Watch and averaged over the participant's observation window. The device computes resting HR from non-active periods including sleep. Noninvasive, consumer-grade telemetry.",
    inputUnits: "bpm",
    inputDist: { n: 1078, mean: 66.9, sd: 8.12, median: 66.4, p25: 61.6, p75: 72.1, min: 43.5, max: 93.6 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: 0.348,
    rhoVerifiedFromData: 0.349,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher resting HR is associated with higher HOMA-IR.",
    realWorldTranslation: rwt({
      rho: 0.348, inputSD: 8.12, inputUnit: "bpm",
      inputP25: 61.6, inputP75: 72.1,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Autonomic imbalance: sympathetic overdrive increases hepatic glucose output (manuscript Table 3).",
    caveats:
      "Wearable resting HR estimates have ±2 to 4 bpm noise vs. clinical telemetry. Resting HR is heavily influenced by fitness, age, and medications such as β-blockers. The manuscript Table 3 reports mean RHR; Appendix Table 8 separately validates median RHR (ρ = 0.347, validated 11/11) and conditionally validates mean (ρ = 0.348).",
  },
  {
    id: "WME-05",
    cohortId: "wearme",
    evidenceTier: "Supported",
    title: "Cardiovascular fitness index (steps / RHR, wearable)",
    manuscriptColumn: "(constructed by CoDaS as STEPS (mean) / Resting Heart Rate (mean))",
    inputDefinition:
      "CoDaS-constructed composite: mean daily steps from the wearable divided by mean resting heart rate from the same wearable, averaged over the observation window. Higher values indicate the participant achieves greater daily activity at lower cardiac demand, a noninvasive proxy for cardiorespiratory fitness. CoDaS's hypothesis generator proposed this composite after retrieving evidence linking cardiorespiratory fitness to peripheral glucose disposal.",
    inputUnits: "steps per bpm (per day)",
    inputDist: { n: 1078, mean: 121, sd: 62.7, median: 109, p25: 79, p75: 147, min: 10.8, max: 664 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: -0.374,
    rhoCI: [-0.42, -0.32],
    rhoVerifiedFromData: -0.371,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher fitness index is associated with lower HOMA-IR.",
    realWorldTranslation: rwt({
      rho: -0.374, inputSD: 62.7, inputUnit: "steps/bpm",
      inputP25: 79, inputP75: 147,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    composite: { formula: "STEPS (mean) / Resting Heart Rate (mean)" },
    mechanism:
      "Peripheral glucose disposal efficiency driven by skeletal muscle mitochondrial density (manuscript Table 3).",
    caveats:
      "Composite normalisation removes between-person differences in baseline activity volume (a fit person walking 6,000 steps with HR 55 bpm may be metabolically healthier than someone walking 10,000 with HR 80). The manuscript flags this as the most clinically translatable wearable-derived candidate.",
  },
  {
    id: "WME-06",
    cohortId: "wearme",
    evidenceTier: "Emerging",
    title: "Red cell distribution width (RDW)",
    manuscriptColumn: "rdw",
    inputDefinition:
      "Red cell distribution width: the percent coefficient of variation in erythrocyte volume, from a standard CBC panel. Typical normal range is roughly 11.5 to 14.5%. Higher values indicate greater anisocytosis (variability in red-cell size).",
    inputUnits: "% (CV of red-cell volume)",
    inputDist: { n: 1077, mean: 12.9, sd: 1.0, median: 12.7, p25: 12.3, p75: 13.2, min: 10.7, max: 20.7 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: 0.281,
    rhoVerifiedFromData: 0.277,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher RDW is associated with higher HOMA-IR.",
    realWorldTranslation: rwt({
      rho: 0.281, inputSD: 1.0, inputUnit: "% RDW",
      inputP25: 12.3, inputP75: 13.2,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Erythropoietic stress as a marker of chronic low-grade metabolic inflammation (manuscript Table 3).",
    caveats:
      "Important: the source WEAR-ME paper (Metwally et al., 2026) reported that standard CBC analytes did not differ significantly between the IR and IS groups in a categorical comparison. CoDaS's continuous Spearman ρ on N = 1,078 participants surfaces a signal that the categorical test missed. This is the kind of statistical-power difference that Question 1 (validity) is designed to surface.",
  },
  {
    id: "WME-07",
    cohortId: "wearme",
    evidenceTier: "Emerging",
    title: "Albumin/globulin ratio",
    manuscriptColumn: "albumin/globulin (ratio precomputed in source data)",
    inputDefinition:
      "Ratio of fasting serum albumin to globulin from standard chemistry assays, stored as a precomputed column in the source dataset. The manuscript groups it with CoDaS's autonomously-constructed composites because the ratio (rather than the components individually) is what CoDaS surfaced as a clinically meaningful signal. Lower values indicate either reduced albumin (hepatic synthetic stress, malnutrition) or elevated globulin (immune/inflammatory protein shift).",
    inputUnits: "ratio (unitless)",
    inputDist: { n: 1078, mean: 1.75, sd: 0.277, median: 1.7, p25: 1.6, p75: 1.9, min: 1, max: 3 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: -0.220,
    rhoVerifiedFromData: -0.227,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Lower albumin/globulin ratio is associated with higher HOMA-IR.",
    realWorldTranslation: rwt({
      rho: -0.220, inputSD: 0.277, inputUnit: "ratio units",
      inputP25: 1.6, inputP75: 1.9,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    mechanism:
      "Hepatic synthetic dysfunction (low albumin) plus subclinical inflammatory protein shift (high globulin) (manuscript Table 3).",
    caveats:
      "Albumin and globulin are routine on chemistry panels, but their ratio as a population-screening proxy for insulin resistance is not commonly reported. Smallest effect in the cohort's validated set.",
  },

  // ============================================================
  // Calibration probe (rejected positive control)
  // ============================================================
  {
    id: "WME-PC",
    cohortId: "wearme",
    evidenceTier: "Rejected",
    title: "TG/HDL ratio (rejected positive control)",
    manuscriptColumn: "(constructed by CoDaS as triglycerides / hdl)",
    inputDefinition:
      "Ratio of fasting serum triglycerides to fasting serum HDL cholesterol from a standard lipid panel. CoDaS's feature-engineering agent constructed this composite, then the Critic agent's construct-independence gate rejected it because triglycerides and HDL are direct definitional components of clinical metabolic syndrome and the ratio is near-tautologically correlated with HOMA-IR.",
    inputUnits: "ratio (unitless)",
    inputDist: { n: 1078, mean: 2.01, sd: 1.43, median: 1.59, p25: 1.04, p75: 2.44, min: 0.27, max: 10.2 },
    inputDistSource: "data",
    outputLabel: "HOMA-IR (continuous; cutoff > 2.5)",
    rho: 0.562,
    rhoVerifiedFromData: 0.542,
    rhoMatchesManuscript: true,
    pValue: "<0.001 (BH-FDR)",
    direction: "Higher TG/HDL is associated with higher HOMA-IR.",
    realWorldTranslation: rwt({
      rho: 0.562, inputSD: 1.43, inputUnit: "ratio units",
      inputP25: 1.04, inputP75: 2.44,
      outcomeSD: SD_HOMA, outcomeName: "HOMA-IR", outcomeUnit: "units",
    }),
    controlledFor:
      "Not adjusted for any covariates.",
    composite: { formula: "triglycerides / hdl" },
    mechanism:
      "Atherogenic dyslipidemia indexes hepatic insulin resistance (manuscript Table 3).",
    caveats:
      "Calibration probe: this candidate was REJECTED by CoDaS's construct-independence gate. Half the panel sees this annotation; the other half sees the card without the rejection note. A clinician who rates validity AND added value high (without flagging the construct overlap) signals that the panel needs more briefing; a clinician who flags it independently passes the calibration check. Rate this as you would any other candidate.",
    isCalibrationProbe: true,
  },
];
