/**
 * Production Firebase authentication provider.
 * All operations run live against the Firebase Authentication SDK.
 */

import {
  firebaseSignup,
  firebaseLogin,
  firebaseGoogleLogin,
  firebaseForgotPassword,
  firebaseConfirmPasswordReset,
  firebaseLogout,
  FirebaseUserSession
} from "./firebase-auth";

export type DemoUser = FirebaseUserSession;

/**
 * Returns currently persisted user from local storage session.
 */
export function getCurrentUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("lifeline_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Creates user in Firebase and sends email verification.
 */
export async function demoSignup(fullName: string, email: string, password: string): Promise<DemoUser> {
  const user = await firebaseSignup(fullName, email, password);
  localStorage.setItem("lifeline_user", JSON.stringify(user));
  return user;
}

/**
 * Authenticates user credentials directly on Firebase.
 */
export async function demoLogin(email: string, password: string): Promise<DemoUser> {
  const user = await firebaseLogin(email, password);
  localStorage.setItem("lifeline_user", JSON.stringify(user));
  return user;
}

/**
 * Authenticates user via Google popup directly on Firebase.
 */
export async function demoGoogleLogin(): Promise<DemoUser> {
  const user = await firebaseGoogleLogin();
  localStorage.setItem("lifeline_user", JSON.stringify(user));
  return user;
}

/**
 * Sends a real password reset request to Firebase.
 */
export async function demoForgotPassword(email: string): Promise<void> {
  await firebaseForgotPassword(email);
}

/**
 * Resets a user's password using the oobCode provided by Firebase email action.
 */
export async function demoResetPassword(token: string, newPassword: string): Promise<void> {
  await firebaseConfirmPasswordReset(token, newPassword);
}

/**
 * Logs out the current session on Firebase.
 */
export async function demoLogout(): Promise<void> {
  await firebaseLogout();
  localStorage.removeItem("lifeline_user");
}

export async function demoLogoutAll(): Promise<void> {
  await demoLogout();
}

/**
 * Updates profile details.
 */
export function demoUpdateProfile(data: { full_name?: string; phone?: string }): DemoUser {
  const user = getCurrentUser();
  if (!user) throw new Error("Not logged in");
  
  if (data.full_name) user.full_name = data.full_name;
  if (data.phone !== undefined) user.phone = data.phone;
  
  localStorage.setItem("lifeline_user", JSON.stringify(user));
  return user;
}
