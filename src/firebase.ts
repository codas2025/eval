// Firebase initialization and submission helper.
//
// Configuration is supplied at build time via Vite env vars (VITE_FIREBASE_*).
// The web client config (apiKey, authDomain, projectId, etc.) is not a secret
// — security is enforced by Firestore rules. The required rules for this app
// are documented in README.md.
//
// If env vars are missing the helpers degrade to a no-op so the JSON-export
// path still works. This keeps `npm run dev` usable for local UI work without
// any Firebase setup.

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

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

const COLLECTION = (env.VITE_FIREBASE_COLLECTION as string | undefined) ?? "clinical-eval-responses";

export const FIREBASE_CONFIGURED = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function ensure(): { db: Firestore; auth: Auth } | null {
  if (!FIREBASE_CONFIGURED) return null;
  if (!app) {
    app = initializeApp(firebaseConfig as Required<typeof firebaseConfig>);
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
  const handles = ensure();
  if (!handles) {
    return { ok: false, error: "firebase not configured" };
  }
  try {
    if (!handles.auth.currentUser) {
      await signInAnonymously(handles.auth);
    }
    const ref = await addDoc(collection(handles.db, COLLECTION), {
      schemaVersion: session.schemaVersion,
      reviewer: session.reviewer,
      cardOrder: session.cardOrder,
      responses: session.responses,
      globalFeedback: session.globalFeedback,
      submittedAt: serverTimestamp(),
      clientFinishedAt: session.finishedAt ?? new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      anonAuthUid: handles.auth.currentUser?.uid ?? null,
    });
    return { ok: true, documentId: ref.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
