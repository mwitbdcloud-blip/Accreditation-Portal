import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AgentProfile, AccreditationApplication, NotificationItem, AuditLog } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Configure Firestore with experimentalForceLongPolling to prevent connection drops in iframes and proxies
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);

// Authentication Provider (Google Login configured)
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore on initial boot
 * CRITICAL CONSTRAINT from Firebase Skill
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const res = await Promise.race([
      getDoc(doc(db, 'test', 'connection')),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    return !!res;
  } catch (error: any) {
    // Graceful offline fallback - application operates via Express proxy & clientStorage
    return false;
  }
}

// Automatically test connection on boot without throwing
testFirestoreConnection().catch(() => {});

// Authentication helpers
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // If the user closed or cancelled the popup, handle gracefully without throwing
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      const blockedErr = new Error('Sign-in popup was blocked by your browser. Please allow popups for this site to sign in with Google.');
      (blockedErr as any).code = 'auth/popup-blocked';
      throw blockedErr;
    }
    console.warn('Google Sign-in failed:', error?.message || error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out failed:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Sanitize payload to remove any undefined fields before Firestore operations
function cleanPayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Timestamp) && !(value instanceof Date)) {
        result[key] = Array.isArray(value) ? value : cleanPayload(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Agent sync helpers
export async function syncAgentToFirestore(agent: AgentProfile): Promise<void> {
  const docPath = `agents/${agent.affiliateCode}`;
  try {
    const payload = cleanPayload({
      ...agent,
      updatedAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'agents', agent.affiliateCode), payload, { merge: true });
  } catch (err: any) {
    if (
      err?.code === 'unavailable' ||
      (err instanceof Error && (err.message.includes('unavailable') || err.message.includes('Could not reach')))
    ) {
      console.warn(`Firestore sync queued offline for ${docPath}`);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function fetchAgentFromFirestore(affiliateCode: string): Promise<AgentProfile | null> {
  const docPath = `agents/${affiliateCode}`;
  try {
    const snap = await getDoc(doc(db, 'agents', affiliateCode));
    if (snap.exists()) {
      return snap.data() as AgentProfile;
    }
    return null;
  } catch (err: any) {
    if (
      err?.code === 'unavailable' ||
      (err instanceof Error && (err.message.includes('unavailable') || err.message.includes('Could not reach')))
    ) {
      console.warn(`Firestore get queued offline for ${docPath}`);
      return null;
    }
    handleFirestoreError(err, OperationType.GET, docPath);
  }
}

// Application sync helpers
export async function saveAgentToFirestore(agent: AgentProfile): Promise<void> {
  const docPath = `agents/${agent.affiliateCode}`;
  try {
    const payload = cleanPayload({
      ...agent,
      syncedAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'agents', agent.affiliateCode), payload, { merge: true });
  } catch (err: any) {
    if (
      err?.code === 'unavailable' ||
      (err instanceof Error && (err.message.includes('unavailable') || err.message.includes('Could not reach')))
    ) {
      console.warn(`Firestore sync queued offline for ${docPath}`);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function saveApplicationToFirestore(application: AccreditationApplication): Promise<void> {
  const docPath = `applications/${application.id}`;
  try {
    const payload = cleanPayload({
      ...application,
      syncedAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'applications', application.id), payload, { merge: true });
  } catch (err: any) {
    if (
      err?.code === 'unavailable' ||
      (err instanceof Error && (err.message.includes('unavailable') || err.message.includes('Could not reach')))
    ) {
      console.warn(`Firestore sync queued offline for ${docPath}`);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function fetchApplicationsFromFirestore(): Promise<AccreditationApplication[]> {
  const path = 'applications';
  try {
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    const results: AccreditationApplication[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as AccreditationApplication);
    });
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// Notification sync helpers
export async function addNotificationToFirestore(notif: NotificationItem): Promise<void> {
  const docPath = `notifications/${notif.id}`;
  try {
    const payload = cleanPayload({
      ...notif,
      createdAtIso: notif.timestamp || new Date().toISOString(),
      timestamp: Timestamp.now(),
    });
    await setDoc(doc(db, 'notifications', notif.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

// Audit log sync helpers
export async function addAuditLogToFirestore(log: AuditLog): Promise<void> {
  const docPath = `auditLogs/${log.id}`;
  try {
    const payload = cleanPayload({
      ...log,
      timestamp: Timestamp.now(),
    });
    await setDoc(doc(db, 'auditLogs', log.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }
}
