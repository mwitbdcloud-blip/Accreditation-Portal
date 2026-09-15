/**
 * Firebase Client Configuration & Service Initializer
 *
 * This module configures Firebase Authentication, Firestore, and Storage.
 * When environment variables are set in production or AI Studio, it connects to live Firebase services.
 * In preview mode, it gracefully operates with the full-stack server backend.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'megaworld-ipa-portal.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'megaworld-ipa-portal',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'megaworld-ipa-portal.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '139025000629',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:139025000629:web:abcdef123456',
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);
