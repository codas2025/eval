// Firebase initialisation and submission helper.
//
// The Firebase web client config below is intentionally checked in: per
// Firebase's own documentation, the web apiKey/projectId/etc. are not
// secrets — they are bundled into the published JS and visible to every
// site visitor in DevTools regardless. Security for Firestore writes is
// enforced by Firestore rules (see README) and by Anonymous auth, which
// requires authenticated UIDs and validates document shape on every write.

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
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

const COLLECTION = "clinical-eval-responses";

export const FIREBASE_CONFIGURED = true;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function ensure(): { db: Firestore; auth: Auth } {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return { db: db!, auth: auth! };
}

export interface SubmissionResult {
  ok: boolean;
  documentId?: string;
  error?: string;
}

export async function submitToFirestore(session: Session): Promise<SubmissionResult> {
  try {
    const { db, auth } = ensure();
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    const ref = await addDoc(collection(db, COLLECTION), {
      schemaVersion: session.schemaVersion,
      reviewer: session.reviewer,
      cardOrder: session.cardOrder,
      responses: session.responses,
      globalFeedback: session.globalFeedback,
      submittedAt: serverTimestamp(),
      clientFinishedAt: session.finishedAt ?? new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      anonAuthUid: auth.currentUser?.uid ?? null,
    });
    return { ok: true, documentId: ref.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
