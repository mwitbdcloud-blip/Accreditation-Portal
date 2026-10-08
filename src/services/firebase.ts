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
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AgentProfile,
  AccreditationApplication,
  NotificationItem,
  AuditLog,
  PositionAccessRequest,
  SystemSettings,
  PositionContractTemplate,
  StaffAccount,
} from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

/**
 * Resilient Firestore initialization for smooth production worldwide:
 * - Multi-tab IndexedDB cache persistence for offline resilience & fast cross-tab sync
 * - Graceful fallback to memory cache if private browsing (Firefox/Safari) blocks IndexedDB
 * - experimentalAutoDetectLongPolling ensures connectivity across corporate proxies & strict firewalls
 * - ignoreUndefinedProperties prevents runtime write errors from undefined object keys
 */
function createFirestoreInstance() {
  const isBrowser = typeof window !== 'undefined';
  try {
    return initializeFirestore(
      app,
      {
        ignoreUndefinedProperties: true,
        experimentalAutoDetectLongPolling: true,
        localCache: isBrowser
          ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
          : memoryLocalCache(),
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch (err) {
    console.warn('Firestore multi-tab cache unavailable (e.g. private window), using memory cache:', err);
    try {
      return initializeFirestore(
        app,
        {
          ignoreUndefinedProperties: true,
          experimentalAutoDetectLongPolling: true,
          localCache: memoryLocalCache(),
        },
        firebaseConfig.firestoreDatabaseId
      );
    } catch {
      return getFirestore(app, firebaseConfig.firestoreDatabaseId);
    }
  }
}

export const db = createFirestoreInstance();
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
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.message?.includes('unauthorized-domain')
    ) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      const unauthErr = new Error(
        `Firebase Unauthorized Domain: "${currentHost}" is not yet allowlisted in Firebase Console (Authentication > Settings > Authorized domains).`
      );
      (unauthErr as any).code = 'auth/unauthorized-domain';
      (unauthErr as any).domain = currentHost;
      throw unauthErr;
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

// ==========================================
// 1. Agent Firestore Sync Helpers
// ==========================================

export async function fetchAgentsFromFirestore(): Promise<AgentProfile[]> {
  const path = 'agents';
  try {
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    const results: AgentProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.affiliateCode) {
        results.push(data as AgentProfile);
      }
    });
    return results;
  } catch (err: any) {
    console.warn('Firestore fetchAgents offline or error, falling back:', err?.message || err);
    return [];
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
    console.warn(`Firestore get queued offline for ${docPath}:`, err?.message || err);
    return null;
  }
}

export async function saveAgentToFirestore(agent: AgentProfile): Promise<void> {
  const docPath = `agents/${agent.affiliateCode}`;
  try {
    const payload = cleanPayload({
      ...agent,
      syncedAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'agents', agent.affiliateCode), payload, { merge: true });
  } catch (err: any) {
    console.warn(`Firestore saveAgent queued offline for ${docPath}:`, err?.message || err);
  }
}

export const syncAgentToFirestore = saveAgentToFirestore;

export async function deleteAgentFromFirestore(affiliateCode: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'agents', affiliateCode));
  } catch (err: any) {
    console.warn(`Firestore deleteAgent error for ${affiliateCode}:`, err?.message || err);
  }
}

export async function deleteMultipleAgentsFromFirestore(codes: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    codes.forEach((code) => {
      batch.delete(doc(db, 'agents', code));
    });
    await batch.commit();
  } catch (err: any) {
    console.warn('Firestore batch delete agents error:', err?.message || err);
  }
}

export async function deleteAllAgentsFromFirestore(): Promise<void> {
  try {
    const q = query(collection(db, 'agents'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err: any) {
    console.warn('Firestore deleteAllAgents error:', err?.message || err);
  }
}

// ==========================================
// 2. Application Firestore Sync Helpers
// ==========================================

export async function fetchApplicationsFromFirestore(): Promise<AccreditationApplication[]> {
  const path = 'applications';
  try {
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    const results: AccreditationApplication[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.id) {
        results.push(data as AccreditationApplication);
      }
    });
    return results;
  } catch (err: any) {
    console.warn('Firestore fetchApplications offline or error:', err?.message || err);
    return [];
  }
}

export async function fetchApplicationFromFirestore(id: string): Promise<AccreditationApplication | null> {
  try {
    const snap = await getDoc(doc(db, 'applications', id));
    if (snap.exists()) {
      return snap.data() as AccreditationApplication;
    }
    return null;
  } catch (err: any) {
    console.warn(`Firestore fetchApplication error for ${id}:`, err?.message || err);
    return null;
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
    console.warn(`Firestore saveApplication error for ${docPath}:`, err?.message || err);
  }
}

export async function deleteApplicationFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'applications', id));
  } catch (err: any) {
    console.warn(`Firestore deleteApplication error for ${id}:`, err?.message || err);
  }
}

export async function deleteMultipleApplicationsFromFirestore(ids: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      batch.delete(doc(db, 'applications', id));
    });
    await batch.commit();
  } catch (err: any) {
    console.warn('Firestore batch delete applications error:', err?.message || err);
  }
}

export async function deleteAllApplicationsFromFirestore(): Promise<void> {
  try {
    const q = query(collection(db, 'applications'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err: any) {
    console.warn('Firestore deleteAllApplications error:', err?.message || err);
  }
}

// ==========================================
// 3. Position Requests Firestore Sync
// ==========================================

export async function fetchPositionRequestsFromFirestore(): Promise<PositionAccessRequest[]> {
  try {
    const q = query(collection(db, 'positionRequests'));
    const snap = await getDocs(q);
    const results: PositionAccessRequest[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.id) results.push(data as PositionAccessRequest);
    });
    return results;
  } catch (err: any) {
    console.warn('Firestore fetchPositionRequests error:', err?.message || err);
    return [];
  }
}

export async function savePositionRequestToFirestore(request: PositionAccessRequest): Promise<void> {
  try {
    const payload = cleanPayload({
      ...request,
      syncedAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'positionRequests', request.id), payload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore savePositionRequest error:', err?.message || err);
  }
}

export async function deletePositionRequestFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'positionRequests', id));
  } catch (err: any) {
    console.warn('Firestore deletePositionRequest error:', err?.message || err);
  }
}

// ==========================================
// 4. Position Contracts Firestore Sync
// ==========================================

export async function fetchPositionContractsFromFirestore(): Promise<PositionContractTemplate[]> {
  try {
    const q = query(collection(db, 'positionContracts'));
    const snap = await getDocs(q);
    const results: PositionContractTemplate[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.position) results.push(data as PositionContractTemplate);
    });
    return results;
  } catch (err: any) {
    console.warn('Firestore fetchPositionContracts error:', err?.message || err);
    return [];
  }
}

export async function savePositionContractToFirestore(contract: PositionContractTemplate): Promise<void> {
  try {
    const docId = contract.position.replace(/[\/\s]+/g, '_');
    const payload = cleanPayload({
      ...contract,
      updatedAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'positionContracts', docId), payload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore savePositionContract error:', err?.message || err);
  }
}

// ==========================================
// 5. Notifications Firestore Sync
// ==========================================

export async function fetchNotificationsFromFirestore(affiliateCode?: string): Promise<NotificationItem[]> {
  try {
    const q = query(collection(db, 'notifications'));
    const snap = await getDocs(q);
    const results: NotificationItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.id) {
        if (!affiliateCode || !data.affiliateCode || data.affiliateCode === affiliateCode) {
          results.push(data as NotificationItem);
        }
      }
    });
    return results;
  } catch (err: any) {
    console.warn('Firestore fetchNotifications error:', err?.message || err);
    return [];
  }
}

export async function addNotificationToFirestore(notif: NotificationItem): Promise<void> {
  const docPath = `notifications/${notif.id}`;
  try {
    const payload = cleanPayload({
      ...notif,
      createdAtIso: notif.timestamp || new Date().toISOString(),
      timestamp: Timestamp.now(),
    });
    await setDoc(doc(db, 'notifications', notif.id), payload, { merge: true });
  } catch (err: any) {
    console.warn(`Firestore addNotification error for ${docPath}:`, err?.message || err);
  }
}

export const saveNotificationToFirestore = addNotificationToFirestore;

export async function markNotificationReadInFirestore(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (err: any) {
    console.warn('Firestore markNotificationRead error:', err?.message || err);
  }
}

// ==========================================
// 6. Audit Logs Firestore Sync
// ==========================================

export async function fetchAuditLogsFromFirestore(): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, 'auditLogs'), limit(200));
    const snap = await getDocs(q);
    const results: AuditLog[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.id) results.push(data as AuditLog);
    });
    return results;
  } catch (err: any) {
    console.warn('Firestore fetchAuditLogs error:', err?.message || err);
    return [];
  }
}

export async function addAuditLogToFirestore(log: AuditLog): Promise<void> {
  const docPath = `auditLogs/${log.id}`;
  try {
    const payload = cleanPayload({
      ...log,
      timestamp: Timestamp.now(),
    });
    await setDoc(doc(db, 'auditLogs', log.id), payload);
  } catch (err: any) {
    console.warn(`Firestore addAuditLog error for ${docPath}:`, err?.message || err);
  }
}

// ==========================================
// 7. System Settings Firestore Sync
// ==========================================

export async function fetchSettingsFromFirestore(): Promise<SystemSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'systemSettings', 'default'));
    if (snap.exists()) {
      return snap.data() as SystemSettings;
    }
    return null;
  } catch (err: any) {
    console.warn('Firestore fetchSettings error:', err?.message || err);
    return null;
  }
}

export async function saveSettingsToFirestore(settings: SystemSettings): Promise<void> {
  try {
    const payload = cleanPayload({
      ...settings,
      updatedAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'systemSettings', 'default'), payload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore saveSettings error:', err?.message || err);
  }
}

// ==========================================
// 8. Auto-Seed Initial Data to Firestore
// Ensures systemSettings, positionContracts, and initial agents/applications
// are present in Firestore so any user opening the portal worldwide immediately has live data!
// ==========================================

export async function seedInitialDataToFirestoreIfEmpty(
  initialAgents: AgentProfile[],
  initialApplications: AccreditationApplication[] = [],
  initialSettings?: SystemSettings
): Promise<boolean> {
  try {
    let seededAny = false;

    // 1. Ensure systemSettings exists
    const settSnap = await getDoc(doc(db, 'systemSettings', 'default'));
    if (!settSnap.exists() && initialSettings) {
      await setDoc(doc(db, 'systemSettings', 'default'), cleanPayload(initialSettings));
      seededAny = true;
    }

    // 2. Ensure positionContracts exists
    const contractSnap = await getDocs(query(collection(db, 'positionContracts'), limit(1)));
    if (contractSnap.empty) {
      const defaultPositions = [
        'Marketing Associate',
        'Senior Marketing Associate',
        'Marketing Manager',
        'Marketing Director',
        'Marketing Partner',
      ];
      const batch = writeBatch(db);
      defaultPositions.forEach((pos) => {
        const docId = pos.replace(/[\/\s]+/g, '_');
        batch.set(doc(db, 'positionContracts', docId), cleanPayload({
          position: pos,
          title: `Special Affiliate Agreement (SAA) — ${pos}`,
          fileName: `${pos}.docx`,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSize: '145 KB',
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: 'BD Operations',
          notes: `Official active SAA template for ${pos}. Auto-provisioned for global accreditation.`,
          rawText: '',
        }));
      });
      await batch.commit();
      seededAny = true;
    }

    // 3. Ensure agents exist if collection is empty
    const agentSnap = await getDocs(query(collection(db, 'agents'), limit(1)));
    if (agentSnap.empty && initialAgents.length > 0) {
      for (let i = 0; i < initialAgents.length; i += 20) {
        const slice = initialAgents.slice(i, i + 20);
        const batch = writeBatch(db);
        slice.forEach((agent) => {
          batch.set(doc(db, 'agents', agent.affiliateCode), cleanPayload(agent));
        });
        await batch.commit();
      }
      seededAny = true;
    }

    // 4. Ensure applications exist if collection is empty
    if (initialApplications.length > 0) {
      const appSnap = await getDocs(query(collection(db, 'applications'), limit(1)));
      if (appSnap.empty) {
        const appBatch = writeBatch(db);
        initialApplications.forEach((app) => {
          appBatch.set(doc(db, 'applications', app.id), cleanPayload(app));
        });
        await appBatch.commit();
        seededAny = true;
      }
    }

    return seededAny;
  } catch (err: any) {
    console.warn('Could not seed Firestore (offline or rule constraint):', err?.message || err);
    return false;
  }
}

// ==========================================
// 9. Real-Time Subscriptions across devices and countries
// Ensures any updates made on one device instantly reflect everywhere
// ==========================================

export function subscribeToAgents(callback: (agents: AgentProfile[]) => void): () => void {
  try {
    const q = query(collection(db, 'agents'));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: AgentProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.affiliateCode) {
            results.push(data as AgentProfile);
          }
        });
        callback(results);
      },
      (error) => {
        console.warn('Real-time agents snapshot listener warning:', error.message);
      }
    );
  } catch {
    return () => {};
  }
}

export function subscribeToApplications(callback: (apps: AccreditationApplication[]) => void): () => void {
  try {
    const q = query(collection(db, 'applications'));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: AccreditationApplication[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id) {
            results.push(data as AccreditationApplication);
          }
        });
        callback(results);
      },
      (error) => {
        console.warn('Real-time applications snapshot listener warning:', error.message);
      }
    );
  } catch {
    return () => {};
  }
}

export function subscribeToSettings(callback: (settings: SystemSettings | null) => void): () => void {
  try {
    return onSnapshot(
      doc(db, 'systemSettings', 'default'),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as SystemSettings);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.warn('Real-time settings snapshot listener warning:', error.message);
      }
    );
  } catch {
    return () => {};
  }
}

export function subscribeToPositionContracts(
  callback: (templates: PositionContractTemplate[]) => void
): () => void {
  try {
    const q = query(collection(db, 'positionContracts'));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: PositionContractTemplate[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.position) {
            results.push(data as PositionContractTemplate);
          }
        });
        callback(results);
      },
      (error) => {
        console.warn('Real-time position contracts snapshot listener warning:', error.message);
      }
    );
  } catch {
    return () => {};
  }
}

// ==========================================
// 10. Multi-Device Agent & Staff Credential Lookup
// Finds registered user in Firestore when logging in from any new device or browser
// ==========================================

export async function findAgentByCredentialsInFirestore(identifier: string): Promise<AgentProfile | null> {
  const cleanId = (identifier || '').trim();
  if (!cleanId) return null;
  const upperCode = cleanId.toUpperCase();
  const lowerEmail = cleanId.toLowerCase();

  // Try direct affiliate code doc lookup first
  const docSnap = await getDoc(doc(db, 'agents', upperCode)).catch(() => null);
  if (docSnap && docSnap.exists()) {
    return docSnap.data() as AgentProfile;
  }

  // Try case-exact doc lookup
  const exactSnap = await getDoc(doc(db, 'agents', cleanId)).catch(() => null);
  if (exactSnap && exactSnap.exists()) {
    return exactSnap.data() as AgentProfile;
  }

  // Query by email
  try {
    const emailQuery = query(collection(db, 'agents'), where('email', '==', lowerEmail), limit(1));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      return emailSnap.docs[0].data() as AgentProfile;
    }
  } catch {
    // If composite query fails or rules restrict, scan documents safely
  }

  // Scan agents fallback (for case-insensitive matching across mobile keyboards)
  try {
    const allAgents = await fetchAgentsFromFirestore();
    const found = allAgents.find(
      (a) =>
        a.affiliateCode.toUpperCase() === upperCode ||
        a.email.toLowerCase() === lowerEmail ||
        (a.fullName && a.fullName.toLowerCase() === lowerEmail)
    );
    if (found) return found;
  } catch {}

  return null;
}

export async function findStaffByEmailInFirestore(email: string): Promise<StaffAccount | null> {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return null;

  try {
    const snap = await getDocs(collection(db, 'staff'));
    let matched: StaffAccount | null = null;
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.email && data.email.toLowerCase() === cleanEmail) {
        matched = data as StaffAccount;
      }
    });
    return matched;
  } catch {
    return null;
  }
}
