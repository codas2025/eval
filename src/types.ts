export type EvidenceTier = "Established" | "Supported" | "Emerging" | "Rejected";

export interface Distribution {
  n: number;
  mean: number;
  sd: number;
  median: number;
  p25: number;
  p75: number;
  min?: number;
  max?: number;
  pct_above_cutoff?: number;
}

export interface Cohort {
  id: "dwb_hourly" | "globem" | "wearme";
  name: string;
  populationDescriptor: string;
  n: number;
  endpointLabel: string;
  endpointRange: [number, number] | null;
  endpointDist: Distribution;
  endpointCutoff?: number;
  covariates: string[];
  notes?: string;
}

export interface ResultCard {
  id: string;
  cohortId: Cohort["id"];
  evidenceTier: EvidenceTier;
  title: string;
  manuscriptColumn: string;
  inputDefinition: string;
  inputUnits: string;
  inputDist: Distribution | null;
  inputDistSource: "data" | "manuscript" | "n/a";
  outputLabel: string;
  rho: number;
  rhoCI?: [number, number];
  rhoVerifiedFromData?: number;
  rhoMatchesManuscript?: boolean;
  pValue: string;
  direction: string;
  realWorldTranslation: string;
  controlledFor: string;
  mechanism: string;
  caveats: string;
  composite?: { formula: string };
  stabilityFlag?: string;
  isCalibrationProbe?: boolean;
}

export type LikertChoice = 1 | 2 | 3 | 4 | 5;

export interface RubricItem {
  id: string;
  letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  required: boolean;
  prompt: string;
  scaleType: "likert5" | "literature5" | "freetext";
  anchors?: { value: number; label: string }[];
  literatureChoices?: { value: string; label: string }[];
  justificationRequired?: boolean;
  followUpPrompt?: string;
  followUpRequired?: boolean;
}

export interface ReviewerMeta {
  reviewerId: string;
  specialty: string;
  yearsPracticing: string;
  wearableFamiliarity: number;
  outcomesUsed: string[];
  conflicts: string;
  startedAt: string;
}

export interface CardResponse {
  cardId: string;
  startedAt?: string;
  completedAt?: string;
  ratings: Record<string, number | string>;
  justifications: Record<string, string>;
  followUps: Record<string, string>;
}

export interface Session {
  schemaVersion: string;
  reviewer: ReviewerMeta | null;
  cardOrder: string[];
  responses: Record<string, CardResponse>;
  globalFeedback: Record<string, string>;
  finishedAt?: string;
}
