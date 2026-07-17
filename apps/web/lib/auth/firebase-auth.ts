import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  confirmPasswordReset,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export type FirebaseUserSession = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  photoUrl?: string;
  isLoggedIn: boolean;
};

/**
 * Real production signup using Firebase Authentication
 * Triggers actual email verification from Firebase's server.
 */
export async function firebaseSignup(fullName: string, email: string, password: string): Promise<FirebaseUserSession> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update display name
  await updateProfile(user, { displayName: fullName });
  
  // Send actual email verification link from Firebase
  await sendEmailVerification(user);
  
  const sessionUser: FirebaseUserSession = {
    id: user.uid,
    full_name: fullName,
    email: user.email || email,
    phone: user.phoneNumber || "",
    role: "citizen",
    is_verified: user.emailVerified,
    is_active: true,
    isLoggedIn: true,
  };
  
  return sessionUser;
}

/**
 * Real production login using Firebase Authentication
 */
export async function firebaseLogin(email: string, password: string): Promise<FirebaseUserSession> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const sessionUser: FirebaseUserSession = {
    id: user.uid,
    full_name: user.displayName || user.email?.split("@")[0] || "Citizen",
    email: user.email || email,
    phone: user.phoneNumber || "",
    role: "citizen",
    is_verified: user.emailVerified,
    is_active: true,
    isLoggedIn: true,
  };
  
  return sessionUser;
}

/**
 * Google Sign-In using Firebase Auth Pop-up Provider
 */
export async function firebaseGoogleLogin(): Promise<FirebaseUserSession> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;
  
  const sessionUser: FirebaseUserSession = {
    id: user.uid,
    full_name: user.displayName || "Google User",
    email: user.email || "",
    phone: user.phoneNumber || "",
    role: "citizen",
    is_verified: user.emailVerified,
    is_active: true,
    photoUrl: user.photoURL || undefined,
    isLoggedIn: true,
  };
  
  return sessionUser;
}

/**
 * Triggers a real password reset email from Firebase
 */
export async function firebaseForgotPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Completes a password reset process given the OOB action code
 */
export async function firebaseConfirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  await confirmPasswordReset(auth, oobCode, newPassword);
}

/**
 * Real sign out from Firebase
 */
export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}
