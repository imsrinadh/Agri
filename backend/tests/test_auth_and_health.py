import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_root_endpoint():
    """Verify GET / returns welcome message, running status, and version."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to AgriRisk API"
    assert data["status"] == "running"
    assert data["version"] == "1.0.0"


def test_health_check_endpoint():
    """Verify GET /api/health returns healthy status and service name."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AgriRisk Backend"


def test_cors_headers():
    """Verify CORS headers respond properly to allowed origins."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
    }
    response = client.options("/api/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_full_authentication_flow():
    """
    Test end-to-end authentication lifecycle:
    1. Register new user
    2. Reject duplicate email registration
    3. Login with correct credentials -> receive JWT
    4. Login with incorrect credentials -> 401
    5. Access /api/auth/me without token -> 401
    6. Access /api/auth/me with valid Bearer token -> 200 with user profile
    7. Access /api/auth/me with invalid/malformed token -> 401
    8. Logout -> 200
    """
    test_email = "test.farmer@agririsk.in"
    test_password = "SecureFarmerPass#2026"
    test_name = "Ramesh Patel"

    # 1. Register new user
    reg_response = client.post(
        "/api/auth/register",
        json={"name": test_name, "email": test_email, "password": test_password},
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["email"] == test_email
    assert reg_data["name"] == test_name
    assert "id" in reg_data
    assert "password" not in reg_data
    assert "hashed_password" not in reg_data

    # 2. Attempt duplicate registration
    dup_response = client.post(
        "/api/auth/register",
        json={"name": test_name, "email": test_email, "password": test_password},
    )
    assert dup_response.status_code == 409

    # 3. Login with correct credentials
    login_response = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["token_type"].lower() == "bearer"
    assert login_data["user"]["email"] == test_email
    assert "password" not in login_data["user"]
    token = login_data["access_token"]

    # 4. Login with incorrect credentials (wrong password)
    bad_login = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": "wrong_password"},
    )
    assert bad_login.status_code == 401

    # 4b. Login with non-existent email
    bad_email_login = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@agririsk.in", "password": test_password},
    )
    assert bad_email_login.status_code == 401

    # 5. Access /api/auth/me without token
    unauth_response = client.get("/api/auth/me")
    assert unauth_response.status_code == 401

    # 6. Access /api/auth/me with valid Bearer token
    auth_headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/auth/me", headers=auth_headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == test_email
    assert me_data["name"] == test_name
    assert "password" not in me_data
    assert "hashed_password" not in me_data

    # 7. Access /api/auth/me with invalid token
    invalid_headers = {"Authorization": "Bearer invalid.fake.token"}
    invalid_response = client.get("/api/auth/me", headers=invalid_headers)
    assert invalid_response.status_code == 401

    # 8. Logout
    logout_response = client.post("/api/auth/logout", headers=auth_headers)
    assert logout_response.status_code == 200
    assert logout_response.json() == {"message": "Logout successful"}


def test_input_validation():
    """Verify validation for malformed inputs (invalid email, too short password, etc.)"""
    # Invalid email
    res1 = client.post(
        "/api/auth/register",
        json={"name": "Bad Email", "email": "not-an-email", "password": "password123"},
    )
    assert res1.status_code == 422

    # Password too short (< 6 chars)
    res2 = client.post(
        "/api/auth/register",
        json={"name": "Short Pass", "email": "valid@email.com", "password": "123"},
    )
    assert res2.status_code == 422


def test_openapi_documentation():
    """Verify OpenAPI JSON and documentation endpoints."""
    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    schema = openapi_res.json()
    paths = schema.get("paths", {})

    assert "/" in paths
    assert "/api/health" in paths
    assert "/api/auth/register" in paths
    assert "/api/auth/login" in paths
    assert "/api/auth/me" in paths
    assert "/api/auth/logout" in paths

    docs_res = client.get("/docs")
    assert docs_res.status_code == 200

    redoc_res = client.get("/redoc")
    assert redoc_res.status_code == 200
