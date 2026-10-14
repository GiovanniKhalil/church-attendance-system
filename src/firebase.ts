import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with auto-detect long-polling for resilient connectivity across all networks and iframes
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Helper to formulate a guaranteed valid ASCII email for Firebase Authentication
export function formatSafeChurchEmail(input: string): string {
  const clean = input.trim().toLowerCase()
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()); // Convert Arabic digits
  
  if (clean.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return clean;
  }
  
  const asciiSafe = clean.replace(/[^a-z0-9_.]/g, '');
  if (asciiSafe.length >= 3) {
    return `${asciiSafe}@church.org`;
  }
  
  // Safe hex encoding for Arabic or unicode usernames
  const bytes = new TextEncoder().encode(clean);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
  return `user_${hex || 'servant'}@church.org`;
}

// Helper to ensure password satisfies Firebase Auth 6-char minimum
export function formatSafeFirebasePass(rawPass: string): string {
  const clean = rawPass.trim();
  if (clean.length >= 6) return clean;
  return `${clean}_church`;
}

// Helper for Email & Password Sign In with auto-provisioning
export async function loginWithFirebaseAuth(emailOrUsername: string, pass: string): Promise<FirebaseUser> {
  const email = formatSafeChurchEmail(emailOrUsername);
  const securePass = formatSafeFirebasePass(pass);

  try {
    const cred = await signInWithEmailAndPassword(auth, email, securePass);
    return cred.user;
  } catch (err: any) {
    // If account doesn't exist in Firebase Auth yet, auto-provision it with provided password
    if (
      err.code === 'auth/user-not-found' || 
      err.code === 'auth/invalid-credential' || 
      err.code === 'auth/invalid-login-credentials'
    ) {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, email, securePass);
        return newCred.user;
      } catch (createErr: any) {
        // If already in use, password might be different, but user exists
        if (createErr.code === 'auth/email-already-in-use') {
          try {
            const retryCred = await signInWithEmailAndPassword(auth, email, securePass);
            return retryCred.user;
          } catch {
            // Handled by higher layer
          }
        }
        throw new Error('اسم المستخدم أو كلمة السر غير صحيحة');
      }
    } else if (err.code === 'auth/wrong-password') {
      throw new Error('كلمة السر غير صحيحة');
    } else {
      throw new Error(err.message || 'فشل تسجيل الدخول');
    }
  }
}

// Helper to update current authenticated user's password
export async function updateFirebaseUserPassword(newPass: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('لا يوجد مستخدم مسجل الدخول حالياً');
  }
  await updatePassword(auth.currentUser, newPass);
}

// Helper for Sign Out
export async function logoutFirebaseAuth(): Promise<void> {
  await signOut(auth);
}

// Operation types for logging and error reporting
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Error: ', JSON.stringify(errInfo));
}

// Connection status helper
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
      return false;
    }
    return true;
  }
}
