import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "StrongPass123!",
            "full_name": "Test User",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "user@example.com"
    assert "access_token" in body
    assert "refresh_token" in body


@pytest.mark.asyncio
async def test_duplicate_email(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "StrongPass123!",
            "full_name": "Test User",
        },
    )
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "StrongPass123!",
            "full_name": "Another User",
        },
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_invalid_registration(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "bad", "password": "123", "full_name": ""},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "StrongPass123!",
            "full_name": "Login User",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "StrongPass123!"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_invalid_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalid@example.com",
            "password": "StrongPass123!",
            "full_name": "Invalid User",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "invalid@example.com", "password": "wrong-pass"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rotation(client):
    register = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh@example.com",
            "password": "StrongPass123!",
            "full_name": "Refresh User",
        },
    )
    refresh = register.json()["refresh_token"]
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh},
    )
    assert response.status_code == 200
    assert response.json()["refresh_token"] != refresh


@pytest.mark.asyncio
async def test_refresh_reuse_rejected(client):
    register = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "reuse@example.com",
            "password": "StrongPass123!",
            "full_name": "Reuse User",
        },
    )
    refresh = register.json()["refresh_token"]
    first = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    second = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert first.status_code == 200
    assert second.status_code == 401


@pytest.mark.asyncio
async def test_logout(client):
    register = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "logout@example.com",
            "password": "StrongPass123!",
            "full_name": "Logout User",
        },
    )
    refresh = register.json()["refresh_token"]
    response = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh})
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_protected_endpoint(client):
    register = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "protected@example.com",
            "password": "StrongPass123!",
            "full_name": "Protected User",
        },
    )
    access = register.json()["access_token"]
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_rbac_denied(client):
    register = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "rbac@example.com",
            "password": "StrongPass123!",
            "full_name": "RBAC User",
        },
    )
    access = register.json()["access_token"]
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert response.status_code == 200
