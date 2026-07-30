import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// ---------------------------------------------------------------------------
// Singleton axios instance – the ONLY http client in the entire application.
// Every request must flow through this instance.
// ---------------------------------------------------------------------------

// NEXT_PUBLIC_API_BASE_URL is inlined at build time by Next.js's DefinePlugin.
// We must reference it as a direct property access so webpack replaces it.
// Bracket notation (process.env["..."]) would bypass the replacement.
const BASE_URL: string =
  process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 12_000,
  withCredentials: false, // we manage tokens manually via Authorization header
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function exchangeGoogleAuthSession(idToken: string): Promise<GoogleAuthResponse> {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = typeof payload?.detail === "string" ? payload.detail : "Google authentication failed";
    throw new Error(detail);
  }

  return payload as GoogleAuthResponse;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Role =
  | "citizen"
  | "hospital_admin"
  | "blood_bank_admin"
  | "ambulance_driver"
  | "super_admin";

export type UserPublic = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: Role;
  is_verified: boolean;
  is_active: boolean;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthResponse = {
  user: UserPublic;
  tokens: TokenPair;
};

export type SecuritySettingsResponse = {
  login_alerts_enabled: boolean;
  trusted_device_mode: boolean;
  active_session_count: number;
};

export type MessageResponse = {
  message: string;
};

export type GoogleAuthResponse = {
  ok: boolean;
  user: UserPublic;
};

// ── Healthcare Types ────────────────────────────────────────────────────

export type MedicalProfile = {
  id: string;
  user_id: string;
  blood_group: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  allergies: string | null;
  chronic_diseases: string | null;
  medications: string | null;
  organ_donor: boolean;
  profile_picture_url: string | null;
  emergency_notes: string | null;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  is_primary: boolean;
};

export type InsuranceInfo = {
  id: string;
  user_id: string;
  provider: string;
  policy_number: string;
  group_number: string | null;
  coverage_type: string;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
};

export type HealthRecord = {
  id: string;
  user_id: string;
  record_type: string;
  title: string;
  description: string | null;
  file_url: string | null;
  record_date: string | null;
  provider_name: string | null;
  is_shared: boolean;
};

export type SOSRequest = {
  id: string;
  user_id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  description: string | null;
  ambulance_id: string | null;
  created_at: string;
  resolved_at: string | null;
  cancellation_reason: string | null;
};

export type AmbulanceRequest = {
  id: string;
  user_id: string;
  ambulance_id: string | null;
  sos_request_id: string | null;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string | null;
  destination_hospital_id: string | null;
  status: string;
  patient_name: string | null;
  patient_condition: string | null;
  estimated_arrival_minutes: number | null;
  created_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
};

export type Hospital = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  emergency_phone: string | null;
  email: string | null;
  hospital_type: string;
  has_emergency: boolean;
  has_ambulance_service: boolean;
  has_blood_bank: boolean;
  is_active: boolean;
  rating: number | null;
  total_beds: number;
  available_beds: number;
  icu_beds: number;
  available_icu_beds: number;
};

export type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export type HospitalList = PaginatedList<Hospital>;

export type BloodBank = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
};

export type BloodBankList = PaginatedList<BloodBank>;

export type BloodStock = {
  id: string;
  blood_bank_id: string;
  blood_group: string;
  units_available: number;
  units_reserved: number;
  is_available: boolean;
};

export type BloodRequest = {
  id: string;
  user_id: string;
  blood_bank_id: string;
  blood_group: string;
  units_required: number;
  patient_name: string;
  hospital_name: string;
  reason: string | null;
  status: string;
  request_ticket: string | null;
  urgency: string;
  created_at: string;
};

export type BloodRequestList = PaginatedList<BloodRequest>;

export type Donor = {
  id: string;
  user_id: string;
  blood_group: string;
  last_donation_date: string | null;
  total_donations: number;
  is_available: boolean;
  medical_notes: string | null;
};

export type Notification = {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  reference_type: string | null;
  reference_id: string | null;
  action_url: string | null;
};

export type NotificationList = PaginatedList<Notification> & {
  unread_count: number;
};

// ---------------------------------------------------------------------------
// Token storage helpers (singleton – reads from localStorage)
// ---------------------------------------------------------------------------

const ACCESS_KEY = "lifeline_access_token";
const REFRESH_KEY = "lifeline_refresh_token";
const USER_KEY = "lifeline_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  // Primary: localStorage. Fallback: cookie (for middleware sync on page load).
  return localStorage.getItem(ACCESS_KEY) ?? readCookie(ACCESS_COOKIE);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  // Primary: localStorage. Fallback: cookie.
  return localStorage.getItem(REFRESH_KEY) ?? readCookie(REFRESH_COOKIE);
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  // Keep cookie in sync so middleware always sees the current token.
  writeCookie(ACCESS_COOKIE, access, 86400);
  writeCookie(REFRESH_COOKIE, refresh, 2592000);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(REFRESH_COOKIE);
}

export function getCurrentUser(): UserPublic | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserPublic) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserPublic): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ---------------------------------------------------------------------------
// Auth session helpers (cookies for middleware)
// ---------------------------------------------------------------------------

const ACCESS_COOKIE = "ll_access_token";
const REFRESH_COOKIE = "ll_refresh_token";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
  path = "/"
): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${Math.max(0, Math.floor(maxAgeSeconds))}; path=${path}; samesite=lax`;
}

function deleteCookie(name: string, path = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=${path}; samesite=lax`;
}

export function saveAuthSession(payload: AuthResponse): void {
  const access = payload.tokens.access_token;
  const refresh = payload.tokens.refresh_token;

  setTokens(access, refresh);
  setCurrentUser(payload.user);
  // setTokens() already writes cookies, but keep this explicit for clarity.
}

export function clearAuthSession(): void {
  clearTokens();
  // clearTokens() already deletes cookies, but keep for safety.
}

// ---------------------------------------------------------------------------
// Request interceptor – attach Authorization header automatically
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor – automatic token refresh on 401
// ---------------------------------------------------------------------------

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and if we haven't already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request while refresh is in progress
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ access_token: string; refresh_token: string; token_type: string }>(
        `${BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      );

      setTokens(data.access_token, data.refresh_token);

      // Update cookie for middleware
      writeCookie(ACCESS_COOKIE, data.access_token, 86400);
      writeCookie(REFRESH_COOKIE, data.refresh_token, 2592000);

      processQueue(null, data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);