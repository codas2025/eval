// Rubric definitions — 7-dimension Likert + open-ended fields used by the
// clinician panel review.

import type { RubricItem } from "../types";

const L5 = (labels: [string, string, string, string, string]) =>
  labels.map((l, i) => ({ value: i + 1, label: `${i + 1} — ${l}` }));

export const RUBRIC: RubricItem[] = [
  {
    id: "validity",
    letter: "A",
    required: true,
    prompt:
      "Validity confidence — based on the reported effect size, sample size, and validation evidence on this card, how confident are you that this association reflects a real (non-spurious) signal rather than an artifact of analysis?",
    scaleType: "likert5",
    anchors: L5([
      "Very low (likely spurious)",
      "Low",
      "Neutral / unsure",
      "High",
      "Very high (clearly real)",
    ]),
    justificationRequired: true,
    followUpPrompt:
      "Most plausible alternative explanation, if any (confounding, reverse causation, measurement artifact)",
    followUpRequired: false,
  },
  {
    id: "meaningfulness",
    letter: "B",
    required: true,
    prompt:
      "Effect-size meaningfulness — given the real-world translation stated on the card (a 1-SD shift in input → some Δ change in outcome), how clinically meaningful is the magnitude of this association?",
    scaleType: "likert5",
    anchors: L5([
      "Negligible",
      "Small / probably not meaningful",
      "Modest",
      "Meaningful",
      "Large / clearly meaningful",
    ]),
    justificationRequired: true,
  },
  {
    id: "literature",
    letter: "C",
    required: true,
    prompt:
      "Literature support — to the best of your knowledge, does the existing peer-reviewed literature support, contradict, or remain silent on this specific feature–endpoint association?",
    scaleType: "literature5",
    literatureChoices: [
      { value: "strong_support", label: "Strongly supported (multiple high-quality studies converge)" },
      { value: "support", label: "Supported (some studies converge)" },
      { value: "mixed", label: "Mixed / inconsistent" },
      { value: "contradicted", label: "Contradicted" },
      { value: "unaware", label: "Not aware of any literature on this specific association" },
    ],
    followUpPrompt:
      "Citation(s) you would use to support or contest the claim (free text, optional)",
  },
  {
    id: "novelty",
    letter: "D",
    required: true,
    prompt:
      "Novelty — within your specialty, how novel is this specific feature–endpoint association as a clinical signal? (Established existing markers should rate low; genuinely new constructs should rate high.)",
    scaleType: "likert5",
    anchors: [
      { value: 1, label: "1 — Already standard practice" },
      { value: 2, label: "2 — Well-recognised" },
      { value: 3, label: "3 — Discussed but not mainstream" },
      { value: 4, label: "4 — Emerging" },
      { value: 5, label: "5 — Genuinely novel" },
    ],
  },
  {
    id: "measurability",
    letter: "E",
    required: true,
    prompt:
      "Practical measurability of the input — how feasible is it to measure the input variable in routine clinical practice today?",
    scaleType: "likert5",
    anchors: L5([
      "Not feasible (research-only)",
      "Difficult (specialised equipment / consent burden)",
      "Feasible with effort",
      "Easy with current tools",
      "Trivially measurable",
    ]),
    followUpPrompt:
      "If currently infeasible, what would have to change to make it feasible?",
  },
  {
    id: "added_value",
    letter: "F",
    required: true,
    prompt:
      "Added value over existing biomarkers — compared with the biomarkers and clinical signals you already use to assess this outcome, does this candidate add value (incremental information, lower cost, lower invasiveness, earlier detection)?",
    scaleType: "likert5",
    anchors: L5([
      "No added value (redundant or worse)",
      "Marginal",
      "Comparable",
      "Likely incremental",
      "Clear advantage",
    ]),
    justificationRequired: true,
    followUpPrompt:
      "Which existing biomarker(s) does this most directly compete with or complement?",
    followUpRequired: true,
  },
  {
    id: "advice_influence",
    letter: "G",
    required: true,
    prompt:
      "Likelihood to influence patient advice or treatment — in the next 1–2 years, if a result like this were available for one of your patients, how likely would it be to change the advice you give them or the treatment plan you propose?",
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
  },
  {
    id: "real_world_action",
    letter: "H",
    required: true,
    prompt:
      "Confidence to act in a real-world setting — how confident would you be acting on this result clinically (e.g., recommending a behavioural change, ordering a follow-up test) for an individual patient at the population-typical effect size shown here?",
    scaleType: "likert5",
    anchors: L5([
      "Not confident",
      "Slightly",
      "Moderately",
      "Quite",
      "Very confident",
    ]),
    followUpPrompt:
      "What additional evidence (study type, sample, follow-up) would push you from your current rating to a 5?",
  },
  {
    id: "open_concerns",
    letter: "I",
    required: false,
    prompt:
      "Additional concerns, alternative interpretations, scope conditions, or potential harms if this biomarker were deployed",
    scaleType: "freetext",
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
    prompt:
      "Any candidates that should have been combined or split?",
  },
  {
    id: "outcome_appropriateness",
    prompt:
      "Outcomes (PHQ-8, PHQ-4, HOMA-IR) — were these the right targets for the questions clinicians actually face? Suggest alternatives if not.",
  },
  {
    id: "overall_comments",
    prompt: "General comments on the biomarker portfolio as a whole.",
  },
];
