import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def auth_header():
    u_data = {"name": "Agronomy Lead", "email": "agronomy@agri.in", "password": "Password123#"}
    client.post("/api/auth/register", json=u_data)
    login_res = client.post("/api/auth/login", json={"email": u_data["email"], "password": u_data["password"]})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_recommendations_endpoints(auth_header):
    # 1. Unauthenticated -> 401
    assert client.get("/api/recommendations").status_code == 401

    # 2. Authenticated list
    res = client.get("/api/recommendations", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    first = data[0]
    assert "recommendation_id" in first
    assert "category" in first
    assert "priority" in first
    assert "action" in first
    assert "expected_benefit" in first

    # 3. Filter by priority
    res_prio = client.get("/api/recommendations?priority=HIGH", headers=auth_header)
    assert res_prio.status_code == 200
    for r in res_prio.json():
        assert r["priority"].upper() == "HIGH"

    # 4. Filter by category
    res_cat = client.get("/api/recommendations?category=Pest%20Management", headers=auth_header)
    assert res_cat.status_code == 200
    for r in res_cat.json():
        assert "pest" in r["category"].lower()

    # 5. Get detail by ID
    rec_id = first["recommendation_id"]
    res_det = client.get(f"/api/recommendations/{rec_id}", headers=auth_header)
    assert res_det.status_code == 200
    assert res_det.json()["recommendation_id"] == rec_id

    # 6. Generate recommendations with crop/district payload
    res_gen = client.post(
        "/api/recommendations/generate",
        headers=auth_header,
        json={"crop": "Cotton", "district": "Nagpur", "state": "Maharashtra", "season": "Kharif"}
    )
    assert res_gen.status_code == 200
    gen_body = res_gen.json()
    assert "recommendations" in gen_body
    assert "telemetry" in gen_body
    assert gen_body["telemetry"]["crop"] == "Cotton"
    assert gen_body["telemetry"]["district"] == "Nagpur"

    # 7. Agro-telemetry endpoint
    res_tel = client.get("/api/recommendations/telemetry?crop=Rice&district=Nellore&state=Andhra%20Pradesh&season=Kharif", headers=auth_header)
    assert res_tel.status_code == 200
    tel_data = res_tel.json()
    assert tel_data["crop"] == "Rice"
    assert "temperature_celsius" in tel_data
    assert "soil_ph" in tel_data
    assert "modal_mandi_price_rs_quintal" in tel_data

    # 8. Ask AI Agronomist
    res_ask = client.post(
        "/api/recommendations/ask",
        headers=auth_header,
        json={"question": "How to control yellow stem borer in paddy?", "crop": "Rice", "district": "Nellore", "state": "Andhra Pradesh"}
    )
    assert res_ask.status_code == 200
    ask_data = res_ask.json()
    assert "answer" in ask_data
    assert len(ask_data["action_items"]) > 0
    assert ask_data["confidence"] == "VERIFIED"
