from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import OTPCode, RefreshToken, User


class AuthRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _coerce_uuid(self, value: str | uuid.UUID) -> uuid.UUID:
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create_user(self, *, email: str, full_name: str, hashed_password: str) -> User:
        user = User(email=email, full_name=full_name, hashed_password=hashed_password)
        self.session.add(user)
        await self.session.flush()
        return user

    async def get_user_by_id(self, user_id: str | uuid.UUID) -> User | None:
        result = await self.session.execute(select(User).where(User.id == self._coerce_uuid(user_id)))
        return result.scalar_one_or_none()

    async def create_refresh_token(
        self,
        *,
        user_id: str | uuid.UUID,
        token_hash: str,
        expires_at: datetime,
    ) -> RefreshToken:
        token = RefreshToken(
            user_id=self._coerce_uuid(user_id),
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.session.add(token)
        await self.session.flush()
        return token

    async def get_refresh_token_by_hash(self, token_hash: str) -> RefreshToken | None:
        result = await self.session.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, refresh_token: RefreshToken) -> None:
        refresh_token.revoked_at = datetime.now(timezone.utc)
        await self.session.flush()

    async def revoke_all_user_tokens(self, user_id: str | uuid.UUID) -> None:
        result = await self.session.execute(
            select(RefreshToken).where(RefreshToken.user_id == self._coerce_uuid(user_id))
        )
        tokens = result.scalars().all()
        for token in tokens:
            token.revoked_at = datetime.now(timezone.utc)
        await self.session.flush()

    async def create_otp(
        self,
        *,
        user_id: str | uuid.UUID,
        code_hash: str,
        expires_at: datetime,
        purpose: str = "email_verification",
    ) -> OTPCode:
        otp = OTPCode(
            user_id=self._coerce_uuid(user_id),
            code_hash=code_hash,
            expires_at=expires_at,
        )
        otp.purpose = purpose
        self.session.add(otp)
        await self.session.flush()
        return otp

    async def get_latest_otp(self, user_id: str | uuid.UUID) -> OTPCode | None:
        result = await self.session.execute(
            select(OTPCode)
            .where(OTPCode.user_id == self._coerce_uuid(user_id))
            .order_by(OTPCode.created_at.desc())
        )
        return result.scalar_one_or_none()

    async def get_latest_otp_for_purpose(self, purpose: str) -> OTPCode | None:
        result = await self.session.execute(
            select(OTPCode)
            .where(OTPCode.purpose == purpose)
            .order_by(OTPCode.created_at.desc())
        )
        return result.scalar_one_or_none()

    async def update_otp_attempts(self, otp: OTPCode) -> None:
        otp.attempt_count += 1
        await self.session.flush()

    async def delete_otp(self, otp: OTPCode) -> None:
        await self.session.delete(otp)
        await self.session.flush()

    async def update_user_verification(self, user: User) -> None:
        user.is_verified = True
        await self.session.flush()

    async def update_password(self, user: User, hashed_password: str) -> None:
        user.hashed_password = hashed_password
        await self.session.flush()
