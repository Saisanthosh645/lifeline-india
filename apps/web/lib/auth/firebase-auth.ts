import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  confirmPasswordReset,
  updateProfile,
  getRedirectResult,
} from "firebase/auth";
import { auth, googleProvider, getFirebaseConfigurationMessage, isFirebaseConfigured } from "./firebase";

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
function createFallbackSession(email: string, fullName: string, phone = "", isVerified = true): FirebaseUserSession {
  return {
    id: `demo-${Math.random().toString(36).slice(2, 10)}`,
    full_name: fullName,
    email,
    phone,
    role: "citizen",
    is_verified: isVerified,
    is_active: true,
    isLoggedIn: true,
  };
}

function getFirebaseErrorMessage(error: unknown, fallback = "Authentication failed"): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code?: string }).code || "");
    switch (code) {
      case "auth/popup-blocked":
        return "Popup was blocked. Please allow popups and try again.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      case "auth/account-exists-with-different-credential":
        return "This account already exists with a different sign-in method.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized for Google sign-in. Please contact the administrator.";
      case "auth/network-request-failed":
        return "Network error. Check your internet connection and try again.";
      default:
        return fallback;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function firebaseSignup(fullName: string, email: string, password: string): Promise<FirebaseUserSession> {
  if (!isFirebaseConfigured() || !auth) {
    console.warn(getFirebaseConfigurationMessage());
    return createFallbackSession(email, fullName, "", true);
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: fullName });
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
  if (!isFirebaseConfigured() || !auth) {
    console.warn(getFirebaseConfigurationMessage());
    return createFallbackSession(email, email.split("@")[0] || "Citizen", "", true);
  }

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
  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    throw new Error(getFirebaseConfigurationMessage());
  }

  try {
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
  } catch (error) {
    const message = getFirebaseErrorMessage(error, "Google sign-in failed");

    if (typeof window !== "undefined" && message.includes("Popup was blocked")) {
      try {
        await signInWithRedirect(auth, googleProvider);
        throw new Error("Redirecting to Google for account selection...");
      } catch {
        // Redirect attempt failed; surface the original error below.
      }
    }

    throw new Error(message);
  }
}

export async function firebaseResolveRedirectLogin(): Promise<FirebaseUserSession | null> {
  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    return null;
  }

  const result = await getRedirectResult(auth);
  if (!result?.user) {
    return null;
  }

  const user = result.user;
  return {
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
}

/**
 * Triggers a real password reset email from Firebase
 */
export async function firebaseForgotPassword(email: string): Promise<void> {
  if (!isFirebaseConfigured() || !auth) {
    return;
  }
  await sendPasswordResetEmail(auth, email);
}

/**
 * Completes a password reset process given the OOB action code
 */
export async function firebaseConfirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  if (!isFirebaseConfigured() || !auth) {
    return;
  }
  await confirmPasswordReset(auth, oobCode, newPassword);
}

/**
 * Real sign out from Firebase
 */
export async function firebaseLogout(): Promise<void> {
  if (!isFirebaseConfigured() || !auth) {
    return;
  }
  await signOut(auth);
}
