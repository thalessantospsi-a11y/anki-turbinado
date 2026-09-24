function cleanData<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UserProfileSchema } from '@/types';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  await syncUserProfile(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserProfile(result.user);
  return result.user;
}

export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  await syncUserProfile(result.user, { displayName });
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return UserProfileSchema.parse(snap.data());
  } catch (error) {
    console.error('Erro ao recuperar perfil do usuário:', error);
    return null;
  }
}

export async function syncUserProfile(
  user: FirebaseUser,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  const nowIso = new Date().toISOString();

  if (!snap.exists()) {
    const initialProfile: UserProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: additionalData?.displayName || user.displayName || 'Estudante',
      photoURL: user.photoURL || undefined,
      targetExam: additionalData?.targetExam || '',
      targetRole: additionalData?.targetRole || '',
      goals: {
        dailyStudyMinutes: 60,
        dailyNewCards: 20,
        dailyMaxReviews: 100,
        dailyQuestions: 30,
      },
      fsrsParameters: {
        requestRetention: 0.9,
        maximumInterval: 36500,
        w: [],
        enableFuzz: true,
      },
      streak: {
        current: 0,
        best: 0,
        lastActiveDate: undefined,
      },
      xp: 0,
      level: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(userRef, cleanData(initialProfile));
    return initialProfile;
  }

  const existingData = snap.data();
  return UserProfileSchema.parse(existingData);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, cleanData({
    ...updates,
    updatedAt: new Date().toISOString(),
  }));
}

export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
