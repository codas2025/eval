import { useCallback, useEffect, useState } from "react";
import type {
  CardResponse,
  ReviewerMeta,
  Session,
} from "../types";
import { CARDS } from "../data/cards";
import { logProgress } from "../firebase";

const STORAGE_PREFIX = "codas-eval-session-";
const SCHEMA_VERSION = "3";

// Visual defaults for the Likert rubric items. Reviewers see "3" pre-checked
// for each Likert question; the literature item has no default and must be
// explicitly chosen.
export const DEFAULT_RATINGS: Record<string, number> = {
  validity: 3,
  meaningfulness: 3,
  novelty: 3,
  measurability: 3,
  added_value: 3,
  advice_influence: 3,
  real_world_action: 3,
};

// Mulberry32 PRNG seeded from the reviewer's email for deterministic
// per-reviewer card ordering.
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

// Pre-fills the visual defaults so the radios show "3" without forcing the
// reviewer to click. CRITICAL: touched=false marks this as a pure pre-fill;
// the card is NOT considered "done" until the reviewer makes any explicit
// change (which flips touched to true via updateResponse).
function emptyResponse(cardId: string): CardResponse {
  return {
    cardId,
    ratings: { ...DEFAULT_RATINGS },
    justifications: {},
    followUps: {},
    touched: false,
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

  // Debounced cloud auto-save: 1.5 s after the last change, push current
  // session state to RTDB. logProgress() filters out untouched cards so the
  // cloud only shows actual annotations.
  useEffect(() => {
    if (!reviewerId || !session.reviewer) return;
    const t = setTimeout(() => {
      void logProgress(session);
    }, 1500);
    return () => clearTimeout(t);
  }, [reviewerId, session]);

  const startSession = useCallback(
    (reviewer: ReviewerMeta) => {
      const seed = hashSeed(reviewer.email.toLowerCase());
      const order = shuffle(
        CARDS.map((c) => c.id),
        seed,
      );
      // Pre-fill every card with its visual defaults so the rubric radios
      // show "3" pre-checked. touched=false marks them as pure pre-fills;
      // they will only count as completed after the reviewer makes a change.
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
          // ANY explicit update from the form flips touched to true. Pure
          // pre-filled cards keep touched=false until the reviewer engages.
          touched: true,
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
