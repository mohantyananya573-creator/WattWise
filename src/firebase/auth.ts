import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebaseConfig';
import { mockAuth } from './mockFallback';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export async function registerUser(email: string, password: string, fullName: string): Promise<AuthUser> {
  if (!isFirebaseConfigured || !auth) {
    return mockAuth.register(email, password, fullName);
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName: fullName,
    });
  }

  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: fullName,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  if (!isFirebaseConfigured || !auth) {
    return mockAuth.login(email, password);
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName,
  };
}

export async function logoutUser(): Promise<void> {
  if (!isFirebaseConfigured || !auth) {
    return mockAuth.logout();
  }

  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured || !auth) {
    return mockAuth.resetPassword(email);
  }

  await sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    return mockAuth.onAuthStateChanged(callback);
  }

  return onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      });
    } else {
      callback(null);
    }
  });
}
