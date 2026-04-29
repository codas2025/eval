// Rubric definitions: 7 Likert items, 1 categorical literature item, 1 free
// text. Required items must be answered before a card counts as complete.

import type { RubricItem } from "../types";

const L5 = (labels: [string, string, string, string, string]) =>
  labels.map((l, i) => ({ value: i + 1, label: l }));

export const RUBRIC: RubricItem[] = [
  {
    id: "validity",
    letter: "A",
    required: true,
    prompt:
      "How confident are you that this association reflects a real (non-spurious) signal?",
    scaleType: "likert5",
    anchors: L5([
      "Likely spurious",
      "Doubtful",
      "Unsure",
      "Likely real",
      "Clearly real",
    ]),
    justificationRequired: true,
    justificationPlaceholder:
      "e.g., why you trust or doubt this signal in 1 to 2 sentences",
    followUpPrompt:
      "Most plausible alternative explanation, if any (confounding, reverse causation, measurement artifact)",
    followUpRequired: false,
    followUpPlaceholder:
      "e.g., depressed patients sleep more variably, not the reverse",
  },
  {
    id: "meaningfulness",
    letter: "B",
    required: true,
    prompt:
      "Given the real-world translation on the card, how clinically meaningful is this magnitude?",
    scaleType: "likert5",
    anchors: L5(["Negligible", "Small", "Modest", "Meaningful", "Large"]),
    justificationRequired: true,
    justificationPlaceholder:
      "e.g., compared with a 1 PHQ-8 point change from a known intervention",
  },
  {
    id: "literature",
    letter: "C",
    required: true,
    prompt:
      "What does existing peer-reviewed literature say about this specific feature to endpoint association?",
    scaleType: "literature5",
    literatureChoices: [
      { value: "strong_support", label: "Strongly supported", hint: "multiple high-quality studies" },
      { value: "support", label: "Supported", hint: "some studies converge" },
      { value: "mixed", label: "Mixed or inconsistent" },
      { value: "contradicted", label: "Contradicted" },
      { value: "novel", label: "Appears genuinely novel", hint: "no prior literature on this specific association" },
      { value: "outside_reading", label: "Outside my reading area", hint: "I cannot say" },
    ],
    followUpPrompt:
      "Citation(s) you would use to support or contest the claim (optional)",
    followUpPlaceholder: "e.g., Author et al. 2024",
  },
  {
    id: "novelty",
    letter: "D",
    required: true,
    prompt:
      "Within your specialty, how novel is this association as a clinical signal?",
    scaleType: "likert5",
    anchors: L5(["Standard", "Recognised", "Discussed", "Emerging", "Novel"]),
  },
  {
    id: "measurability",
    letter: "E",
    required: true,
    prompt:
      "How feasible is it to measure the input variable in routine clinical practice today?",
    scaleType: "likert5",
    anchors: L5(["Not feasible", "Difficult", "With effort", "Easy", "Trivial"]),
    followUpPrompt:
      "If currently infeasible, what would need to change?",
    followUpPlaceholder:
      "e.g., a clinical-grade wearable, or a validated cutoff",
  },
  {
    id: "added_value",
    letter: "F",
    required: true,
    prompt:
      "Compared with the biomarkers and signals you already use for this outcome, does this candidate add value?",
    scaleType: "likert5",
    anchors: L5(["None", "Marginal", "Comparable", "Incremental", "Clear advantage"]),
    justificationRequired: true,
    justificationPlaceholder:
      "e.g., what new information this gives over your current workflow",
    followUpPrompt:
      "Which existing biomarker(s) does this most directly compete with or complement?",
    followUpRequired: true,
    followUpPlaceholder: "e.g., HDL, fasting glucose, sleep history",
  },
  {
    id: "advice_influence",
    letter: "G",
    required: true,
    prompt:
      "If a result like this were available for one of your patients in the next 1 to 2 years, how likely would it change the advice you give?",
    scaleType: "likert5",
    anchors: L5([
      "Very unlikely",
      "Unlikely",
      "Possibly",
      "Likely",
      "Very likely",
    ]),
    followUpPrompt:
      "If 'Likely' or 'Very likely', the most likely scenario in your practice",
    followUpPlaceholder:
      "e.g., screening high-risk patients during routine visits",
  },
  {
    id: "real_world_action",
    letter: "H",
    required: true,
    prompt:
      "How confident would you be acting on this result for an individual patient at the population-typical effect size shown?",
    scaleType: "likert5",
    anchors: L5(["Not", "Slightly", "Moderately", "Quite", "Very"]),
    followUpPrompt:
      "What additional evidence (study type, sample, follow-up) would push you to a 5?",
    followUpPlaceholder:
      "e.g., a multi-site prospective trial with N at least 1,000",
  },
  {
    id: "open_concerns",
    letter: "I",
    required: false,
    prompt:
      "Additional concerns, alternative interpretations, scope conditions, or potential harms if deployed (optional)",
    scaleType: "freetext",
    freetextPlaceholder:
      "e.g., scope conditions, alternative interpretations, potential harms if deployed",
  },
];

export const GLOBAL_FEEDBACK_PROMPTS = [
  {
    id: "context_sufficiency",
    prompt:
      "Did the contextualisation on the result cards give you enough to evaluate? What was missing?",
  },
  {
    id: "combine_split",
    prompt: "Any candidates that should have been combined or split?",
  },
  {
    id: "outcome_appropriateness",
    prompt:
      "Were PHQ-8, PHQ-4, and HOMA-IR the right targets for the questions clinicians actually face?",
  },
  {
    id: "overall_comments",
    prompt: "General comments on the biomarker portfolio as a whole.",
  },
];
