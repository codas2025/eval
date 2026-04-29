// Firebase initialisation and submission helper.
//
// Uses Firebase Realtime Database (RTDB), matching the databaseURL in the
// project config below. No sign-in required — writes go directly to RTDB
// using the project's existing rules.

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  serverTimestamp,
  type Database,
} from "firebase/database";
import type { Session } from "./types";

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

const RTDB_PATH = "clinical-eval-responses";

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

export interface SubmissionResult {
  ok: boolean;
  documentId?: string;
  error?: string;
}

export async function submitToFirestore(session: Session): Promise<SubmissionResult> {
  try {
    const database = ensure();
    const refNode = await push(ref(database, RTDB_PATH), {
      schemaVersion: session.schemaVersion,
      reviewer: session.reviewer,
      cardOrder: session.cardOrder,
      responses: session.responses,
      globalFeedback: session.globalFeedback,
      submittedAt: serverTimestamp(),
      clientFinishedAt: session.finishedAt ?? new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    return { ok: true, documentId: refNode.key ?? "(unknown)" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
