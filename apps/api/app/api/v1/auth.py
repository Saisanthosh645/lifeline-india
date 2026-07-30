from __future__ import annotations

import logging
import os

from fastapi import APIRouter, Depends, HTTPException, status

try:
    from firebase_admin import auth as firebase_auth
    from firebase_admin import credentials, initialize_app
except ImportError:  # pragma: no cover - optional runtime dependency
    firebase_auth = None
    credentials = None
    initialize_app = None

from app.core.deps import get_auth_service
from app.schemas.auth import (
    AuthResponse,
    FirebaseGoogleLoginRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    OTPVerifyRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.utils.auth import get_current_user, get_current_user_id

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


try:
    if initialize_app is not None:
        if not os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON") and not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            initialize_app()
        else:
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if service_account_path:
                initialize_app(credentials.Certificate(service_account_path))
            else:
                initialize_app(credentials.ApplicationDefault())
except Exception as exc:  # pragma: no cover - runtime config dependent
    logger.warning("Firebase Admin SDK initialization skipped: %s", exc)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    try:
        user, access_token, refresh_token = await service.register(
            payload.email,
            payload.password,
            payload.full_name,
        )
    except ValueError as exc:
        if str(exc) == "Email already registered":
            raise HTTPException(status_code=409, detail="Email already registered") from exc
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(
            {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
            }
        ),
    )


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    payload: OTPVerifyRequest,
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    try:
        await service.verify_email(payload.email, payload.code)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return MessageResponse(message="Email verified")


@router.post("/resend-otp", response_model=MessageResponse)
async def resend_otp(
    payload: ForgotPasswordRequest,
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    try:
        await service.resend_otp(payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return MessageResponse(message="OTP sent")


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    try:
        user, access_token, refresh_token = await service.login(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(
            {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
            }
        ),
    )


@router.post("/firebase/google", response_model=AuthResponse)
async def firebase_google_login(
    payload: FirebaseGoogleLoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    if firebase_auth is None:
        raise HTTPException(status_code=500, detail="Firebase Admin SDK is not available")

    try:
        decoded_token = firebase_auth.verify_id_token(payload.id_token)
    except Exception as exc:  # pragma: no cover - runtime config dependent
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token") from exc

    uid = str(decoded_token.get("uid") or "")
    email = (decoded_token.get("email") or "").strip().lower()
    full_name = (decoded_token.get("name") or email.split("@", 1)[0] or "Google User").strip()
    picture = decoded_token.get("picture")
    email_verified = bool(decoded_token.get("email_verified"))

    if not uid or not email:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token")

    try:
        user, access_token, refresh_token = await service.firebase_google_login(
            email=email,
            full_name=full_name,
            firebase_uid=uid,
            email_verified=email_verified,
            picture=picture,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(
            {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
            }
        ),
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh(
    payload: RefreshRequest,
    service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    try:
        user, access_token, refresh_token = await service.refresh(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(
            {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
            }
        ),
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    payload: LogoutRequest,
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    try:
        await service.logout(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return MessageResponse(message="Logged out")


@router.post("/logout-all", response_model=MessageResponse)
async def logout_all(
    user_id: str = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    await service.logout_all(user_id)
    return MessageResponse(message="Logged out from all devices")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    try:
        await service.forgot_password(payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return MessageResponse(message="If the account exists, a reset email was sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    try:
        await service.reset_password(payload.token, payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return MessageResponse(message="Password reset")


@router.get("/me", response_model=UserResponse)
async def me(user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(
        {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
        }
    )
