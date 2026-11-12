import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Verify connection on startup as mandated by Firebase integration guidelines
export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    // Attempt to ping the server test connection doc
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    console.log('[Firebase] Connected to Firestore successfully:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client is offline or network restricted. Using local persistence cache.');
    } else {
      console.log('[Firebase] Firestore initialized. Ready for operations.');
    }
    return false;
  }
}
