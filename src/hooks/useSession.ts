import { useCallback, useEffect, useState } from "react";
import type {
  CardResponse,
  ReviewerMeta,
  Session,
} from "../types";
import { CARDS } from "../data/cards";

const STORAGE_PREFIX = "codas-eval-session-";
const SCHEMA_VERSION = "1";

// Mulberry32 PRNG seeded from the reviewer ID for deterministic per-reviewer
// card ordering.
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptySession(): Session {
  return {
    schemaVersion: SCHEMA_VERSION,
    reviewer: null,
    cardOrder: [],
    responses: {},
    globalFeedback: {},
  };
}

// Default Likert ratings to 3 ("Neutral") so reviewers start with a low-
// cognitive-load baseline and explicitly move the slider when they disagree.
// The literature item has no default — they must explicitly pick.
function emptyResponse(cardId: string): CardResponse {
  return {
    cardId,
    ratings: {
      validity: 3,
      meaningfulness: 3,
      novelty: 3,
      measurability: 3,
      added_value: 3,
      advice_influence: 3,
      real_world_action: 3,
    },
    justifications: {},
    followUps: {},
  };
}

export function useSession() {
  const [reviewerId, setReviewerId] = useState<string | null>(() => {
    return localStorage.getItem("codas-eval-current-reviewer");
  });

  const [session, setSession] = useState<Session>(() => {
    if (!reviewerId) return emptySession();
    const raw = localStorage.getItem(STORAGE_PREFIX + reviewerId);
    if (!raw) return emptySession();
    try {
      const parsed = JSON.parse(raw) as Session;
      if (parsed.schemaVersion !== SCHEMA_VERSION) return emptySession();
      return parsed;
    } catch {
      return emptySession();
    }
  });

  // persist on every change
  useEffect(() => {
    if (!reviewerId) return;
    localStorage.setItem(STORAGE_PREFIX + reviewerId, JSON.stringify(session));
  }, [reviewerId, session]);

  const startSession = useCallback(
    (reviewer: ReviewerMeta) => {
      // Use email (lowercased) as the deterministic seed so the same person
      // always sees the same card order and calibration-arm assignment, even
      // if their auto-generated reviewerId differs across visits.
      const seed = hashSeed(reviewer.email.toLowerCase());
      const order = shuffle(
        CARDS.map((c) => c.id),
        seed,
      );
      const responses: Record<string, CardResponse> = {};
      for (const id of order) responses[id] = emptyResponse(id);
      const next: Session = {
        schemaVersion: SCHEMA_VERSION,
        reviewer,
        cardOrder: order,
        responses,
        globalFeedback: {},
      };
      setReviewerId(reviewer.reviewerId);
      localStorage.setItem("codas-eval-current-reviewer", reviewer.reviewerId);
      setSession(next);
    },
    [],
  );

  const updateResponse = useCallback(
    (cardId: string, partial: Partial<CardResponse>) => {
      setSession((prev) => {
        const cur = prev.responses[cardId] ?? emptyResponse(cardId);
        const next: CardResponse = {
          ...cur,
          ...partial,
          ratings: { ...cur.ratings, ...(partial.ratings ?? {}) },
          justifications: { ...cur.justifications, ...(partial.justifications ?? {}) },
          followUps: { ...cur.followUps, ...(partial.followUps ?? {}) },
        };
        return {
          ...prev,
          responses: { ...prev.responses, [cardId]: next },
        };
      });
    },
    [],
  );

  const updateGlobalFeedback = useCallback(
    (id: string, value: string) => {
      setSession((prev) => ({
        ...prev,
        globalFeedback: { ...prev.globalFeedback, [id]: value },
      }));
    },
    [],
  );

  const finishSession = useCallback(() => {
    setSession((prev) => ({ ...prev, finishedAt: new Date().toISOString() }));
  }, []);

  const resetSession = useCallback(() => {
    if (reviewerId) {
      localStorage.removeItem(STORAGE_PREFIX + reviewerId);
    }
    localStorage.removeItem("codas-eval-current-reviewer");
    setReviewerId(null);
    setSession(emptySession());
  }, [reviewerId]);

  return {
    reviewerId,
    session,
    startSession,
    updateResponse,
    updateGlobalFeedback,
    finishSession,
    resetSession,
  };
}
