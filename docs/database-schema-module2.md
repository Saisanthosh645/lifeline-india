# Module 2 Database Schema - Authentication and Identity

## Roles

`roles`
- `id` UUID PK
- `name` VARCHAR(50) UNIQUE NOT NULL
- `description` VARCHAR(250)
- `created_at`, `updated_at`, `deleted_at`

Seeded values:
- `citizen`
- `hospital_admin`
- `blood_bank_admin`
- `ambulance_driver`
- `super_admin`

## Users

`users`
- `id` UUID PK
- `full_name` VARCHAR(100) NOT NULL
- `email` VARCHAR(255) UNIQUE NOT NULL
- `phone` VARCHAR(20) UNIQUE NULL
- `password_hash` VARCHAR(255) NOT NULL
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `is_verified` BOOLEAN NOT NULL DEFAULT FALSE
- `role_id` UUID FK -> roles.id NOT NULL
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- `ix_users_email`
- `ix_users_phone`

## Refresh Sessions

`refresh_sessions`
- `id` UUID PK
- `user_id` UUID FK -> users.id NOT NULL
- `jti` VARCHAR(120) UNIQUE NOT NULL
- `expires_at` TIMESTAMPTZ NOT NULL
- `revoked_at` TIMESTAMPTZ NULL
- `ip_address` VARCHAR(64) NULL
- `user_agent` VARCHAR(255) NULL
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- `ix_refresh_sessions_user_id`
- `ix_refresh_sessions_jti`
- `ix_refresh_sessions_expires_at`

## Email OTP Verification

`email_otp_verifications`
- `id` UUID PK
- `user_id` UUID FK -> users.id NOT NULL
- `otp_hash` VARCHAR(255) NOT NULL
- `expires_at` TIMESTAMPTZ NOT NULL
- `consumed_at` TIMESTAMPTZ NULL
- `attempts` INTEGER NOT NULL DEFAULT 0
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- `ix_email_otp_user_id`
- `ix_email_otp_expires_at`

## Password Reset Tokens

`password_reset_tokens`
- `id` UUID PK
- `user_id` UUID FK -> users.id NOT NULL
- `token_hash` VARCHAR(255) UNIQUE NOT NULL
- `expires_at` TIMESTAMPTZ NOT NULL
- `consumed_at` TIMESTAMPTZ NULL
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- `ix_password_reset_tokens_user_id`
- `ix_password_reset_tokens_token_hash`

## Authentication Audit Logs

`auth_audit_logs`
- `id` UUID PK
- `user_id` UUID FK -> users.id NULL
- `event_type` VARCHAR(80) NOT NULL
- `status` VARCHAR(30) NOT NULL
- `ip_address` VARCHAR(64) NULL
- `user_agent` VARCHAR(255) NULL
- `metadata_json` TEXT NULL
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- `ix_auth_audit_logs_user_id`
- `ix_auth_audit_logs_event_type`
- `ix_auth_audit_logs_created_at`

## Design Notes

- Soft deletes retained for forensic and compliance workflows.
- High-frequency token validation uses Redis as primary lookup with SQL shadow table for audit and recovery.
- OTP and reset tokens are always stored hashed, never plain text.
- Audit logs are append-only in application logic.
