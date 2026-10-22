import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def auth_header():
    """Create a user and return authorization header."""
    u_data = {"name": "Regional Analyst", "email": "analyst@agri.in", "password": "Password123#"}
    client.post("/api/auth/register", json=u_data)
    login_res = client.post("/api/auth/login", json={"email": u_data["email"], "password": u_data["password"]})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# =========================================================================
# STEP 2.6 — REGIONAL RISK TESTS
# =========================================================================

def test_get_all_regions(auth_header):
    # Public optional auth endpoint allows guest browsing
    unauth = client.get("/api/regions")
    assert unauth.status_code == 200

    # Authenticated
    res = client.get("/api/regions", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 15
    first = data[0]
    assert "region_id" in first
    assert "region_name" in first
    assert "state" in first
    assert "current_risk_score" in first
    assert "current_risk_level" in first


def test_filter_regions(auth_header):
    # 1. Filter by state
    res_state = client.get("/api/regions?state=Andhra Pradesh", headers=auth_header)
    assert res_state.status_code == 200
    for r in res_state.json():
        assert "Andhra Pradesh" in r["state"]

    # 2. Filter by crop
    res_crop = client.get("/api/regions?crop=Cotton", headers=auth_header)
    assert res_crop.status_code == 200
    assert len(res_crop.json()) > 0
    for r in res_crop.json():
        assert any("cotton" in c.lower() for c in r["major_crops"])

    # 3. Filter by risk level
    res_level = client.get("/api/regions?risk_level=HIGH", headers=auth_header)
    assert res_level.status_code == 200
    for r in res_level.json():
        assert r["current_risk_level"] == "HIGH"

    # 4. Combined filter
    res_comb = client.get("/api/regions?state=Andhra Pradesh&crop=Rice", headers=auth_header)
    assert res_comb.status_code == 200
    assert len(res_comb.json()) > 0


def test_get_region_details_and_risk(auth_header):
    # Valid region detail
    res = client.get("/api/regions/AP-NLR", headers=auth_header)
    assert res.status_code == 200
    assert res.json()["region_name"] == "Nellore"

    # Regional risk breakdown
    res_risk = client.get("/api/regions/AP-NLR/risk", headers=auth_header)
    assert res_risk.status_code == 200
    risk_data = res_risk.json()
    assert risk_data["region_id"] == "AP-NLR"
    assert "risk_factors" in risk_data
    assert "weather" in risk_data["risk_factors"]
    assert len(risk_data["top_contributors"]) > 0
    assert len(risk_data["recommendations"]) > 0

    # Invalid region ID
    res_invalid = client.get("/api/regions/INVALID-XYZ", headers=auth_header)
    assert res_invalid.status_code == 404


def test_get_regional_risk_summary(auth_header):
    res = client.get("/api/regions/risk/summary", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert data["total_regions"] >= 15
    assert "low_risk" in data
    assert "moderate_risk" in data
    assert "high_risk" in data
    assert "critical_risk" in data
    assert "average_risk_score" in data


# =========================================================================
# STEP 2.7 — DASHBOARD TESTS
# =========================================================================

def test_dashboard_endpoint(auth_header):
    # Unauthenticated
    unauth = client.get("/api/dashboard")
    assert unauth.status_code == 401

    # Authenticated
    res = client.get("/api/dashboard", headers=auth_header)
    assert res.status_code == 200
    data = res.json()

    # User section
    assert "user" in data
    assert data["user"]["name"] == "Regional Analyst"

    # Risk overview
    assert "risk_overview" in data
    assert 0 <= data["risk_overview"]["overall_score"] <= 100
    assert data["risk_overview"]["overall_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "weather" in data["risk_overview"]
    assert "pest" in data["risk_overview"]

    # Trajectory & regional summary
    assert "risk_trend" in data
    assert len(data["risk_trend"]) > 0
    assert "regional_summary" in data
    assert "low" in data["regional_summary"]

    # Recent history & recommendations
    assert "recent_risk_predictions" in data
    assert "recent_disease_analyses" in data
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0


# =========================================================================
# STEP 2.8 — INSIGHTS TESTS
# =========================================================================

def test_insights_endpoint(auth_header):
    # Unauthenticated
    unauth = client.get("/api/insights")
    assert unauth.status_code == 401

    # Default (30d)
    res_def = client.get("/api/insights", headers=auth_header)
    assert res_def.status_code == 200
    data_def = res_def.json()
    assert data_def["time_period"] == "30d"
    assert len(data_def["risk_trend"]) > 0
    assert len(data_def["crop_comparison"]) > 0
    assert len(data_def["regional_trends"]) > 0
    assert len(data_def["market_trends"]) > 0
    assert len(data_def["production_trends"]) > 0

    # 7d, 90d, 1y filters
    for period in ["7d", "90d", "1y"]:
        r = client.get(f"/api/insights?time_period={period}", headers=auth_header)
        assert r.status_code == 200
        assert r.json()["time_period"] == period

    # Crop & Region filters
    r_filter = client.get("/api/insights?crop=Rice&region=Nellore&time_period=30d", headers=auth_header)
    assert r_filter.status_code == 200
    assert r_filter.json()["crop"] == "Rice"
    assert r_filter.json()["region"] == "Nellore"


def test_complete_swagger_routes():
    res = client.get("/openapi.json")
    assert res.status_code == 200
    paths = res.json()["paths"]

    required_endpoints = [
        "/api/regions",
        "/api/regions/risk/summary",
        "/api/regions/{region_id}",
        "/api/regions/{region_id}/risk",
        "/api/dashboard",
        "/api/insights",
    ]

    for ep in required_endpoints:
        assert ep in paths, f"OpenAPI missing route: {ep}"
