/**
 * Auth & Healthcare API client – thin wrapper around the singleton axios instance.
 */
import { api } from "@/lib/api";
import type {
  AuthResponse, SecuritySettingsResponse, UserPublic, MessageResponse,
  MedicalProfile, EmergencyContact, InsuranceInfo, HealthRecord,
  SOSRequest, AmbulanceRequest,
  Hospital, HospitalList, BloodBank, BloodBankList, BloodStock,
  BloodRequest, BloodRequestList, Donor,
  Notification, NotificationList,
} from "@/lib/api";

export const authClient = {
  // ── Auth ──────────────────────────────────────────────────────────────
  signup: (payload: { full_name: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>("/auth/signup", payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  requestOtp: () =>
    api.post<MessageResponse>("/auth/resend-otp").then((r) => r.data),

  verifyOtp: (otp: string) =>
    api.post<AuthResponse>("/auth/verify-email", { otp }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<MessageResponse>("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (payload: { token: string; new_password: string }) =>
    api.post<MessageResponse>("/auth/reset-password", payload).then((r) => r.data),

  profile: () =>
    api.get<UserPublic>("/profile/me").then((r) => r.data),

  updateProfile: (payload: { full_name?: string; phone?: string }) =>
    api.patch<UserPublic>("/profile/me", payload).then((r) => r.data),

  security: () =>
    api.get<SecuritySettingsResponse>("/profile/security").then((r) => r.data),

  updateSecurity: (payload: { login_alerts_enabled?: boolean; trusted_device_mode?: boolean }) =>
    api.patch<SecuritySettingsResponse>("/profile/security", payload).then((r) => r.data),

  logoutAll: () =>
    api.post<MessageResponse>("/auth/logout-all").then((r) => r.data),

  // ── Medical Profile ───────────────────────────────────────────────────
  getMedicalProfile: () =>
    api.get<MedicalProfile>("/profile/medical").then((r) => r.data),

  updateMedicalProfile: (payload: Partial<MedicalProfile>) =>
    api.patch<MedicalProfile>("/profile/medical", payload).then((r) => r.data),

  // ── Emergency Contacts ────────────────────────────────────────────────
  getEmergencyContacts: () =>
    api.get<EmergencyContact[]>("/profile/emergency-contacts").then((r) => r.data),

  createEmergencyContact: (payload: { name: string; relationship: string; phone: string; email?: string; is_primary?: boolean }) =>
    api.post<EmergencyContact>("/profile/emergency-contacts", payload).then((r) => r.data),

  updateEmergencyContact: (id: string, payload: Partial<EmergencyContact>) =>
    api.patch<EmergencyContact>(`/profile/emergency-contacts/${id}`, payload).then((r) => r.data),

  deleteEmergencyContact: (id: string) =>
    api.delete(`/profile/emergency-contacts/${id}`).then(() => undefined),

  // ── Insurance ─────────────────────────────────────────────────────────
  getInsurance: () =>
    api.get<InsuranceInfo[]>("/profile/insurance").then((r) => r.data),

  createInsurance: (payload: { provider: string; policy_number: string; coverage_type: string; group_number?: string }) =>
    api.post<InsuranceInfo>("/profile/insurance", payload).then((r) => r.data),

  updateInsurance: (id: string, payload: Partial<InsuranceInfo>) =>
    api.patch<InsuranceInfo>(`/profile/insurance/${id}`, payload).then((r) => r.data),

  deleteInsurance: (id: string) =>
    api.delete(`/profile/insurance/${id}`).then(() => undefined),

  // ── Health Records ────────────────────────────────────────────────────
  getHealthRecords: (page = 1, pageSize = 20) =>
    api.get<HealthRecord[]>("/profile/health-records", { params: { page, page_size: pageSize } }).then((r) => r.data),

  createHealthRecord: (payload: { record_type: string; title: string; description?: string; file_url?: string; record_date?: string; provider_name?: string }) =>
    api.post<HealthRecord>("/profile/health-records", payload).then((r) => r.data),

  deleteHealthRecord: (id: string) =>
    api.delete(`/profile/health-records/${id}`).then(() => undefined),

  // ── SOS ────────────────────────────────────────────────────────────────
  createSOS: (payload: { latitude?: number; longitude?: number; location_name?: string; description?: string }) =>
    api.post<SOSRequest>("/sos", payload).then((r) => r.data),

  getSOSRequests: (page = 1, pageSize = 20) =>
    api.get<{ items: SOSRequest[]; total: number; page: number; page_size: number }>("/sos", { params: { page, page_size: pageSize } }).then((r) => r.data),

  getSOSRequest: (id: string) =>
    api.get<SOSRequest>(`/sos/${id}`).then((r) => r.data),

  updateSOSStatus: (id: string, payload: { status: string; cancellation_reason?: string }) =>
    api.patch<SOSRequest>(`/sos/${id}/status`, payload).then((r) => r.data),

  // ── Ambulance ─────────────────────────────────────────────────────────
  getAvailableAmbulances: () =>
    api.get<AmbulanceRequest[]>("/sos/ambulances/available").then((r) => r.data),

  requestAmbulance: (payload: { pickup_latitude: number; pickup_longitude: number; pickup_address?: string; destination_hospital_id?: string; patient_name?: string; patient_condition?: string }) =>
    api.post<AmbulanceRequest>("/sos/ambulance-requests", payload).then((r) => r.data),

  getAmbulanceRequests: (page = 1, pageSize = 20) =>
    api.get<{ items: AmbulanceRequest[]; total: number; page: number; page_size: number }>("/sos/ambulance-requests", { params: { page, page_size: pageSize } }).then((r) => r.data),

  cancelAmbulanceRequest: (id: string, reason?: string) =>
    api.post<AmbulanceRequest>(`/sos/ambulance-requests/${id}/cancel`, { reason }).then((r) => r.data),

  // ── Hospitals ────────────────────────────────────────────────────────
  getHospitals: (params?: { page?: number; page_size?: number; search?: string; city?: string; hospital_type?: string; has_emergency?: boolean; sort_by?: string; sort_order?: string }) =>
    api.get<HospitalList>("/hospitals", { params }).then((r) => r.data),

  getHospital: (id: string) =>
    api.get<Hospital>(`/hospitals/${id}`).then((r) => r.data),

  // ── Blood Banks ──────────────────────────────────────────────────────
  getBloodBanks: (params?: { page?: number; page_size?: number; search?: string; city?: string; blood_group?: string }) =>
    api.get<BloodBankList>("/blood-banks", { params }).then((r) => r.data),

  getBloodBank: (id: string) =>
    api.get<BloodBank>(`/blood-banks/${id}`).then((r) => r.data),

  getBloodStock: (bankId: string) =>
    api.get<BloodStock[]>(`/blood-banks/${bankId}/stock`).then((r) => r.data),

  requestBlood: (payload: { blood_bank_id: string; blood_group: string; units_required?: number; patient_name: string; hospital_name: string; reason?: string; urgency?: string }) =>
    api.post<BloodRequest>("/blood-banks/requests", payload).then((r) => r.data),

  getBloodRequests: (page = 1, pageSize = 20) =>
    api.get<BloodRequestList>("/blood-banks/requests", { params: { page, page_size: pageSize } }).then((r) => r.data),

  // ── Donors ─────────────────────────────────────────────────────────────
  registerDonor: (payload: { blood_group: string; medical_notes?: string; preferred_blood_bank_id?: string }) =>
    api.post<Donor>("/donors/register", payload).then((r) => r.data),

  getDonorProfile: () =>
    api.get<Donor>("/donors/me").then((r) => r.data),

  getDonors: (params?: { blood_group?: string; page?: number; page_size?: number }) =>
    api.get<Donor[]>("/donors", { params }).then((r) => r.data),

  // ── Notifications ──────────────────────────────────────────────────────
  getNotifications: (params?: { page?: number; page_size?: number; unread_only?: boolean }) =>
    api.get<NotificationList>("/notifications", { params }).then((r) => r.data),

  markNotificationRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllNotificationsRead: () =>
    api.post<{ message: string; affected_count: number }>("/notifications/read-all").then((r) => r.data),
};