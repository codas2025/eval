// Firebase initialisation and submission helpers.
//
// Backed by the project's Realtime Database. The web client config below is
// intentionally checked in. Per Firebase's documentation, web apiKey /
// projectId / etc. are bundled into every published build and are visible in
// DevTools regardless. Security is enforced by Realtime Database rules.
//
// Two checkpoints write to RTDB:
//   logProfileStart()  : called when a reviewer submits the profile form.
//                        Creates an email-keyed in_progress record so the
//                        coordinator sees who started.
//   submitToFirestore(): called on final Submit. Updates the same record to
//                        status=completed with all responses.
// Both use set() against an email-derived key so resumes overwrite the same
// node rather than creating duplicates.

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  serverTimestamp,
  type Database,
} from "firebase/database";
import type { ReviewerMeta, Session } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyBIorDH--HXJolxqx0NdF8MWO0wmO0_a4A",
  authDomain: "ivory-plane-406700.firebaseapp.com",
  databaseURL: "https://ivory-plane-406700-default-rtdb.firebaseio.com",
  projectId: "ivory-plane-406700",
  storageBucket: "ivory-plane-406700.firebasestorage.app",
  messagingSenderId: "360125182471",
  appId: "1:360125182471:web:3632af1a1b8c947a6530a2",
  measurementId: "G-DPD0YFJS7Z",
};

const RTDB_PATH = "codas_eval_clinical_validation";

export const FIREBASE_CONFIGURED = true;

let app: FirebaseApp | null = null;
let db: Database | null = null;

function ensure(): Database {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return db!;
}

/** Stable, short, RTDB-safe key derived from the reviewer's email. djb2 hash
 *  in base36. Same email always maps to the same key, so resumes update the
 *  same node instead of creating a duplicate. */
function emailToKey(email: string): string {
  let h = 5381;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) + h) + email.charCodeAt(i);
  }
  return "r" + (h >>> 0).toString(36);
}

export interface SubmissionResult {
  ok: boolean;
  documentId?: string;
  error?: string;
}

/** Returns only the responses where the reviewer has made an explicit
 *  change (touched=true). Cards still showing the pure pre-fill default are
 *  excluded so the cloud record reflects actual annotations only. */
function touchedResponses(session: Session): Session["responses"] {
  const out: Session["responses"] = {};
  for (const [k, v] of Object.entries(session.responses)) {
    if (v && v.touched === true) out[k] = v;
  }
  return out;
}

/** Auto-save: writes the current session state to RTDB under the email-keyed
 *  node, with status='in_progress'. Called from a debounced effect on every
 *  state change, and explicitly when the reviewer clicks Save and exit.
 *  Only touched cards are written so the database reflects real annotations,
 *  not pre-filled defaults. */
export async function logProgress(session: Session): Promise<SubmissionResult> {
  try {
    if (!session.reviewer) return { ok: false, error: "no reviewer" };
    const database = ensure();
    const key = emailToKey(session.reviewer.email.toLowerCase());
    const path = `${RTDB_PATH}/${key}`;
    const filtered = touchedResponses(session);
    const payload = {
      schemaVersion: session.schemaVersion,
      status: "in_progress",
      reviewer: session.reviewer,
      cardOrder: session.cardOrder,
      responses: filtered,
      cardsTouchedCount: Object.keys(filtered).length,
      globalFeedback: session.globalFeedback,
      lastUpdate: serverTimestamp(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };
    console.log("[firebase] progress write to", path, "touched cards:", Object.keys(filtered).length);
    await set(ref(database, path), payload);
    console.log("[firebase] progress OK:", key);
    return { ok: true, documentId: key };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("[firebase] progress FAILED:", err);
    return { ok: false, error: err };
  }
}

/** Called from the profile form after the reviewer fills it in. Writes an
 *  in_progress checkpoint so the coordinator sees who started. */
export async function logProfileStart(reviewer: ReviewerMeta): Promise<SubmissionResult> {
  try {
    const database = ensure();
    const key = emailToKey(reviewer.email.toLowerCase());
    const path = `${RTDB_PATH}/${key}`;
    const payload = {
      schemaVersion: "1",
      status: "profile_completed",
      reviewer,
      startedAt: reviewer.startedAt,
      lastUpdate: serverTimestamp(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };
    console.log("[firebase] profile checkpoint write to", path);
    await set(ref(database, path), payload);
    console.log("[firebase] profile checkpoint OK:", key);
    return { ok: true, documentId: key };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("[firebase] profile checkpoint FAILED:", err);
    return { ok: false, error: err };
  }
}

/** Called on final Submit. Updates the email-keyed record with the full
 *  session payload and status=completed. Like logProgress, only touched
 *  cards are written; cards left at pure defaults are not represented. */
export async function submitToFirestore(session: Session): Promise<SubmissionResult> {
  try {
    if (!session.reviewer) return { ok: false, error: "no reviewer in session" };
    const database = ensure();
    const key = emailToKey(session.reviewer.email.toLowerCase());
    const path = `${RTDB_PATH}/${key}`;
    const filtered = touchedResponses(session);
    const payload = {
      schemaVersion: session.schemaVersion,
      status: "completed",
      reviewer: session.reviewer,
      cardOrder: session.cardOrder,
      responses: filtered,
      cardsTouchedCount: Object.keys(filtered).length,
      globalFeedback: session.globalFeedback,
      submittedAt: serverTimestamp(),
      clientFinishedAt: session.finishedAt ?? new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };
    console.log("[firebase] final submission write to", path, "touched cards:", Object.keys(filtered).length);
    await set(ref(database, path), payload);
    console.log("[firebase] final submission OK:", key);
    return { ok: true, documentId: key };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("[firebase] final submission FAILED:", err);
    return { ok: false, error: err };
  }
}
