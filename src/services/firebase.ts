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

// CRITICAL: The app will break without providing firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // A document not found or permission check still confirms network reachability
    return true;
  }
}

// Automatically test connection on boot
testFirestoreConnection().catch((err) => {
  console.warn('Initial Firestore ping note:', err?.message || err);
});

// Authentication helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
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

// Agent sync helpers
export async function syncAgentToFirestore(agent: AgentProfile): Promise<void> {
  const docPath = `agents/${agent.affiliateCode}`;
  try {
    await setDoc(doc(db, 'agents', agent.affiliateCode), {
      ...agent,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
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
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
  }
}

// Application sync helpers
export async function saveApplicationToFirestore(application: AccreditationApplication): Promise<void> {
  const docPath = `applications/${application.id}`;
  try {
    await setDoc(doc(db, 'applications', application.id), {
      ...application,
      syncedAt: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
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
    await setDoc(doc(db, 'notifications', notif.id), {
      ...notif,
      createdAtIso: notif.timestamp || new Date().toISOString(),
      timestamp: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

// Audit log sync helpers
export async function addAuditLogToFirestore(log: AuditLog): Promise<void> {
  const docPath = `auditLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'auditLogs', log.id), {
      ...log,
      timestamp: Timestamp.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }
}
