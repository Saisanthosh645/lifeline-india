export type Role = "citizen" | "hospital_admin" | "blood_bank_admin" | "ambulance_driver" | "super_admin";

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
