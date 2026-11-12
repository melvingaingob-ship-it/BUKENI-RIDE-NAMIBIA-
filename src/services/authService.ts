import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, CountryKey, UserRole } from '../types';

// Convert mobile number and country code to standardized format
export function formatPhoneNumber(countryCode: string, nationalNumber: string): {
  fullNumber: string;
  cleanDigits: string;
} {
  const cleanPrefix = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const cleanNational = nationalNumber.replace(/\D/g, '').replace(/^0+/, '');
  const digitsOnly = `${cleanPrefix.replace(/\D/g, '')}${cleanNational}`;
  const fullNumber = `${cleanPrefix}${cleanNational}`;
  return { fullNumber, cleanDigits: digitsOnly };
}

// Generate Firebase Auth email format from phone number
function phoneToAuthEmail(cleanDigits: string): string {
  return `phone_${cleanDigits}@bukeni.auth`;
}

function phoneToAuthPassword(pin: string, cleanDigits: string): string {
  const safePin = pin && pin.length >= 4 ? pin : '1234';
  return `Bukeni#${safePin}*${cleanDigits.slice(-4)}`;
}

/**
 * Sign in or Register a user via Firebase Authentication with mobile number & country code.
 */
export async function authenticateWithPhone({
  country,
  countryCode,
  nationalNumber,
  displayName,
  role = 'passenger',
  pin = '1234',
}: {
  country: CountryKey;
  countryCode: string;
  nationalNumber: string;
  displayName?: string;
  role?: UserRole;
  pin?: string;
}): Promise<UserProfile> {
  const { fullNumber, cleanDigits } = formatPhoneNumber(countryCode, nationalNumber);
  const email = phoneToAuthEmail(cleanDigits);
  const password = phoneToAuthPassword(pin, cleanDigits);

  let fbUser: FirebaseUser | null = null;

  try {
    // Attempt sign in first
    const credential = await signInWithEmailAndPassword(auth, email, password);
    fbUser = credential.user;
  } catch (signInError: any) {
    // If user does not exist or invalid-credential, attempt registration
    const code = signInError?.code || '';
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-email' ||
      code === 'auth/wrong-password'
    ) {
      try {
        const createCredential = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = createCredential.user;
      } catch (createError: any) {
        // If account already exists with different password or email error, fallback to anonymous
        if (createError?.code === 'auth/email-already-in-use') {
          // Retry sign-in with default fallback password
          try {
            const fallbackCred = await signInWithEmailAndPassword(auth, email, phoneToAuthPassword('1234', cleanDigits));
            fbUser = fallbackCred.user;
          } catch {
            const anonCred = await signInAnonymously(auth);
            fbUser = anonCred.user;
          }
        } else {
          // Fallback to anonymous sign-in so user is always authenticated
          const anonCred = await signInAnonymously(auth);
          fbUser = anonCred.user;
        }
      }
    } else {
      // Offline or network restriction fallback
      try {
        const anonCred = await signInAnonymously(auth);
        fbUser = anonCred.user;
      } catch {
        // Mock fallback UID if offline
        fbUser = {
          uid: `offline_${cleanDigits}`,
          email,
          displayName: displayName || (country === 'NAMIBIA' ? 'Namibian Partner' : 'Zambian Partner'),
        } as unknown as FirebaseUser;
      }
    }
  }

  const uid = fbUser?.uid || `user_${cleanDigits}`;
  const effectiveName = displayName?.trim() || fbUser?.displayName || (country === 'NAMIBIA' ? 'Elifas Nghikembua' : 'Chileshe Mulenga');

  // Update Firebase Auth user profile display name if possible
  if (fbUser && 'email' in fbUser && displayName) {
    try {
      await updateProfile(fbUser, { displayName: effectiveName });
    } catch {
      // Ignore profile update error
    }
  }

  // Check or initialize Firestore profile
  const userDocRef = doc(db, 'users', uid);
  let userProfile: UserProfile;

  try {
    const existingDoc = await getDoc(userDocRef);
    if (existingDoc.exists()) {
      const data = existingDoc.data() as Partial<UserProfile>;
      userProfile = {
        uid,
        phoneNumber: fullNumber,
        nationalNumber,
        country: data.country || country,
        countryCode,
        displayName: displayName || data.displayName || effectiveName,
        role: data.role || role,
        walletBalance: data.walletBalance !== undefined ? data.walletBalance : (country === 'NAMIBIA' ? 250 : 200),
        loyaltyPoints: data.loyaltyPoints !== undefined ? data.loyaltyPoints : 150,
        createdAt: data.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      // Update last login
      await updateDoc(userDocRef, {
        lastLoginAt: new Date().toISOString(),
        displayName: userProfile.displayName,
      });
    } else {
      // Create new profile with welcome wallet credit
      userProfile = {
        uid,
        phoneNumber: fullNumber,
        nationalNumber,
        country,
        countryCode,
        displayName: effectiveName,
        role,
        walletBalance: country === 'NAMIBIA' ? 250 : 200,
        loyaltyPoints: 150,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, {
        ...userProfile,
        serverTimestamp: serverTimestamp(),
      });
    }
  } catch (firestoreError) {
    console.warn('[Firebase Auth] Firestore user profile sync notice:', firestoreError);
    // Provide resilient in-memory profile
    userProfile = {
      uid,
      phoneNumber: fullNumber,
      nationalNumber,
      country,
      countryCode,
      displayName: effectiveName,
      role,
      walletBalance: country === 'NAMIBIA' ? 250 : 200,
      loyaltyPoints: 150,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  return userProfile;
}

/**
 * Fetch user profile from Firestore by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('[Firebase Auth] Error fetching user profile:', err);
  }
  return null;
}

/**
 * Update user profile state in Firestore
 */
export async function updateUserProfileState(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    // If doc didn't exist, try setDoc with merge
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, updates, { merge: true });
    } catch {
      // Ignore offline errors
    }
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('[Firebase Auth] Sign out notice:', err);
  }
}

/**
 * Listen to Firebase Auth state changes
 */
export function subscribeToAuthState(
  onUserChanged: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, onUserChanged);
}
