# LIFELINE INDIA Architecture

## Repository Layout

- `apps/web` - Next.js 15 frontend, App Router, TypeScript, Tailwind, Framer Motion, feature-driven UI modules.
- `apps/api` - FastAPI service, SQLAlchemy models, JWT auth, rate limiting, redis integration points.
- `infra/nginx` - edge reverse-proxy, TLS and request routing (to be expanded in Module 2).
- `.github/workflows` - CI checks for frontend and backend.
- `docs` - module blueprints, DB schema notes, API contracts.

## Module Delivery Strategy

### Module 1 - Foundation + Premium Landing + Auth Baseline (implemented)

#### Folder Structure

- `apps/web/app` - route entries and global styles.
- `apps/web/components/landing` - hero and landing section modules.
- `apps/web/components/shared` - auth modal, theme toggle.
- `apps/web/lib` - API client and app providers.
- `apps/api/app/api/v1` - versioned REST routes.
- `apps/api/app/models` - relational entities.
- `apps/api/app/schemas` - pydantic DTOs.
- `apps/api/app/core` - settings + security utilities.
- `apps/api/app/db` - DB engine and session handling.

#### API Contracts

- `POST /api/v1/auth/signup`
  - Creates citizen account and returns JWT access/refresh tokens.
- `POST /api/v1/auth/login`
  - Returns user profile and token pair.
- `POST /api/v1/auth/refresh`
  - Stubbed for Module 2 hardening.
- `GET /health`
  - Service health probe with rate limiting.

#### Database Baseline

- `roles`
  - id UUID PK, name unique, description, timestamps, soft delete.
- `users`
  - id UUID PK, full_name, email unique/indexed, phone unique/indexed, password_hash,
    is_active, is_verified, role_id FK roles.id, timestamps, soft delete.

#### Component Hierarchy

- `app/page.tsx`
  - `Hero`
  - `LandingSections`
  - Restricted-action cards
  - `AuthModal`
  - `ThemeToggle`

### Module 2 - Auth Hardening + Guest Browse APIs + Hospital Catalog

- OAuth login (Google ID token validation)
- OTP-based email verification workflow
- Password reset via signed, one-time token
- Refresh-token validation + Redis-backed session lifecycle
- Role-based authorization layer for:
  - citizen
  - hospital_admin
  - blood_bank_admin
  - ambulance_driver
  - super_admin
- Protected route strategy for web app and API dependencies
- Profile management and account security settings
- Authentication audit logging and suspicious activity traceability

#### Module 2 - Folder Structure

- `apps/api/app/api/v1/auth.py`
  - signup/login/refresh/logout/google oauth/email OTP/password reset/session revoke endpoints.
- `apps/api/app/api/v1/profile.py`
  - user profile and security settings APIs.
- `apps/api/app/api/v1/admin.py`
  - role-scoped protected example endpoints.
- `apps/api/app/core/security.py`
  - JWT creation/validation, password hashing, token IDs (`jti`), role claims.
- `apps/api/app/core/redis_client.py`
  - redis session store and token revocation checks.
- `apps/api/app/models/auth.py`
  - refresh sessions, OTPs, password reset tokens, auth audit logs.
- `apps/api/app/services/auth_service.py`
  - core identity orchestration and audit event writes.
- `apps/web/components/auth/*`
  - login, signup, forgot password, reset password, OTP verify UI flows.
- `apps/web/lib/auth/*`
  - auth API client, token store, protected-route helper.
- `apps/web/middleware.ts`
  - route guard for authenticated pages.

#### Module 2 - API Contracts

- `POST /api/v1/auth/signup`
  - create account in `citizen` role and issue tokens.
- `POST /api/v1/auth/login`
  - authenticate credentials and issue fresh token pair.
- `POST /api/v1/auth/oauth/google`
  - validate Google ID token and upsert user.
- `POST /api/v1/auth/verify-email/request-otp`
  - issue OTP and expiry for email verification.
- `POST /api/v1/auth/verify-email/confirm-otp`
  - verify OTP and mark account as verified.
- `POST /api/v1/auth/password/forgot`
  - generate password reset token and return delivery acknowledgement.
- `POST /api/v1/auth/password/reset`
  - validate token and set a new password.
- `POST /api/v1/auth/refresh`
  - rotate refresh session and issue new access/refresh pair.
- `POST /api/v1/auth/logout`
  - revoke current refresh session.
- `POST /api/v1/auth/logout-all`
  - revoke all active refresh sessions for user.
- `GET /api/v1/profile/me`
  - current user profile.
- `PATCH /api/v1/profile/me`
  - profile update.
- `GET /api/v1/profile/security`
  - account security settings and session state summary.
- `PATCH /api/v1/profile/security`
  - account security settings update.

#### Module 2 - Database Schema Additions

- `refresh_sessions`
  - server-managed refresh token sessions in Redis + SQL audit shadow.
  - columns: id UUID PK, user_id FK, jti unique index, expires_at, revoked_at, ip_address, user_agent.
- `email_otp_verifications`
  - one-time OTP verification records.
  - columns: id UUID PK, user_id FK, otp_hash, expires_at, consumed_at, attempts.
- `password_reset_tokens`
  - one-time reset token hashes with expiry.
  - columns: id UUID PK, user_id FK, token_hash unique index, expires_at, consumed_at.
- `auth_audit_logs`
  - immutable authentication activity trail.
  - columns: id UUID PK, user_id FK nullable, event_type, status, ip_address, user_agent, metadata JSON.

#### Module 2 - Component Hierarchy

- `app/auth/page.tsx`
  - `AuthShell`
  - `LoginForm`
  - `SignupForm`
  - `ForgotPasswordForm`
  - `ResetPasswordForm`
  - `EmailOtpForm`
- `app/profile/page.tsx` (protected)
  - `ProfileHeaderCard`
  - `ProfileDetailsForm`
  - `SecuritySettingsPanel`
  - `SessionManagementPanel`

### Module 3 - User Dashboard + Medical Profile + Notifications

- Dashboard shell and analytics cards
- Medical profile CRUD
- Reports, insurance, emergency contacts
- Notification center (unread badge and realtime updates)

### Module 4 - SOS Orchestration + Live Tracking + Ambulance Module

- SOS trigger APIs and websocket broadcasts
- Ambulance assignment state machine
- ETA tracking, live coordinates, event timeline
- Siren + heartbeat UX orchestration in web app

### Module 5 - Blood Network + Donor Ops + Admin Panels

- Blood inventory reservation workflows
- Donor registration/matching
- Admin and hospital-admin analytics and permissions

### Module 6 - PWA + Voice SOS + Disaster Mode + Production Security

- PWA and offline queueing
- Voice-triggered SOS integration
- Advanced security headers and CSRF model
- Nginx hardening and deployment runbooks
