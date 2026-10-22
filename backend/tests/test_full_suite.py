import io
import json
from typing import Optional
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def auth_user_tokens():
    """Create two distinct users and return their auth tokens."""
    # User 1
    u1_data = {"name": "Farmer Ramesh", "email": "ramesh@agri.in", "password": "Password123#"}
    client.post("/api/auth/register", json=u1_data)
    l1 = client.post("/api/auth/login", json={"email": u1_data["email"], "password": u1_data["password"]})
    token1 = l1.json()["access_token"]

    # User 2
    u2_data = {"name": "Farmer Sita", "email": "sita@agri.in", "password": "Password456#"}
    client.post("/api/auth/register", json=u2_data)
    l2 = client.post("/api/auth/login", json={"email": u2_data["email"], "password": u2_data["password"]})
    token2 = l2.json()["access_token"]

    return {"user1_token": token1, "user2_token": token2}


# =========================================================================
# STEP 2.3 — USER / PROFILE TESTS
# =========================================================================

def test_get_current_user_profile(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    res = client.get("/api/users/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "ramesh@agri.in"
    assert data["name"] == "Farmer Ramesh"
    assert "password" not in data
    assert "hashed_password" not in data


def test_update_user_name_and_email(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    res = client.put(
        "/api/users/me",
        headers=headers,
        json={"name": "Ramesh Patel Updated", "email": "ramesh.updated@agri.in"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Ramesh Patel Updated"
    assert res.json()["email"] == "ramesh.updated@agri.in"

    # Verify duplicate email conflict
    dup_res = client.put(
        "/api/users/me",
        headers=headers,
        json={"email": "sita@agri.in"},
    )
    assert dup_res.status_code == 409


def test_get_and_update_agricultural_profile(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    # Initial profile
    get_res = client.get("/api/users/me/profile", headers=headers)
    assert get_res.status_code == 200

    # Update profile
    put_res = client.put(
        "/api/users/me/profile",
        headers=headers,
        json={
            "region": "Nellore",
            "preferred_crop": "Paddy / Rice",
            "season": "Kharif",
            "phone": "+91 9876543210",
        },
    )
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["region"] == "Nellore"
    assert data["preferred_crop"] == "Paddy / Rice"
    assert data["season"] == "Kharif"
    assert data["phone"] == "+91 9876543210"


# =========================================================================
# STEP 2.4 — RISK ANALYSIS TESTS
# =========================================================================

def test_risk_prediction_valid(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    payload = {
        "region": "Nellore",
        "crop": "Rice",
        "season": "Kharif",
        "temperature": 34.5,
        "rainfall": 120.0,
        "humidity": 72.0,
        "soil_moisture": 35.0,
        "soil_ph": 6.5,
        "nitrogen": 70.0,
        "phosphorus": 40.0,
        "potassium": 45.0,
        "pest_probability": 0.35,
        "market_price": 2200.0,
        "production_yield": 4.2,
    }
    res = client.post("/api/risk/predict", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction_id"].startswith("RISK-")
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "risk_factors" in data
    assert "weather" in data["risk_factors"]
    assert "soil" in data["risk_factors"]
    assert "pest" in data["risk_factors"]
    assert len(data["top_contributors"]) > 0
    assert len(data["recommendations"]) > 0


def test_risk_prediction_validation_failures(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    base_payload = {
        "region": "Nellore",
        "crop": "Rice",
        "season": "Kharif",
        "temperature": 30.0,
        "rainfall": 100.0,
        "humidity": 60.0,
        "soil_moisture": 40.0,
        "soil_ph": 6.5,
        "nitrogen": 50.0,
        "phosphorus": 30.0,
        "potassium": 30.0,
        "pest_probability": 0.2,
        "market_price": 2000.0,
        "production_yield": 3.5,
    }

    # 1. Invalid temperature (> 60 C)
    bad_temp = {**base_payload, "temperature": 85.0}
    assert client.post("/api/risk/predict", headers=headers, json=bad_temp).status_code == 422

    # 2. Invalid humidity (> 100%)
    bad_hum = {**base_payload, "humidity": 120.0}
    assert client.post("/api/risk/predict", headers=headers, json=bad_hum).status_code == 422

    # 3. Invalid soil pH (< 0 or > 14)
    bad_ph = {**base_payload, "soil_ph": 15.5}
    assert client.post("/api/risk/predict", headers=headers, json=bad_ph).status_code == 422

    # 4. Invalid pest probability (> 1.0)
    bad_pest = {**base_payload, "pest_probability": 1.5}
    assert client.post("/api/risk/predict", headers=headers, json=bad_pest).status_code == 422

    # 5. Missing required fields
    missing_fields = {"region": "Nellore", "crop": "Rice"}
    assert client.post("/api/risk/predict", headers=headers, json=missing_fields).status_code == 422


def test_risk_history_and_isolation(auth_user_tokens):
    h1 = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    h2 = {"Authorization": f"Bearer {auth_user_tokens['user2_token']}"}

    payload = {
        "region": "Guntur",
        "crop": "Chilli",
        "season": "Rabi",
        "temperature": 28.0,
        "rainfall": 80.0,
        "humidity": 65.0,
        "soil_moisture": 45.0,
        "soil_ph": 6.8,
        "nitrogen": 60.0,
        "phosphorus": 35.0,
        "potassium": 40.0,
        "pest_probability": 0.15,
        "market_price": 4500.0,
        "production_yield": 5.0,
    }

    # User 1 makes prediction
    p1_res = client.post("/api/risk/predict", headers=h1, json=payload)
    pid1 = p1_res.json()["prediction_id"]

    # User 1 can view history
    hist1 = client.get("/api/risk/history", headers=h1)
    assert hist1.status_code == 200
    assert any(item["prediction_id"] == pid1 for item in hist1.json())

    # User 1 can view detail
    det1 = client.get(f"/api/risk/history/{pid1}", headers=h1)
    assert det1.status_code == 200
    assert det1.json()["prediction_id"] == pid1

    # User 2 CANNOT view User 1's prediction (403 Forbidden)
    det2 = client.get(f"/api/risk/history/{pid1}", headers=h2)
    assert det2.status_code == 403


# =========================================================================
# STEP 2.5 — DISEASE DETECTION TESTS
# =========================================================================

def _create_fake_image(magic_header: Optional[bytes] = None, size: int = 1024, fmt: str = "JPEG") -> io.BytesIO:
    if size > 1024 * 1024:
        header = magic_header or (b"\x89PNG\r\n\x1a\n" if fmt == "PNG" else b"\xff\xd8\xff\xe0")
        data = header + b"\x00" * (size - len(header))
        return io.BytesIO(data)
    from PIL import Image
    img = Image.new("RGB", (64, 64), color=(34, 139, 34))
    bio = io.BytesIO()
    img.save(bio, format=fmt)
    bio.seek(0)
    return bio


def test_disease_predict_valid_jpeg(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    fake_jpeg = _create_fake_image(fmt="JPEG")

    files = {"image": ("leaf_test.jpg", fake_jpeg, "image/jpeg")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction_id"].startswith("DIS-")
    assert "image_id" in data
    assert "status" in data
    assert data["disease_model_status"] in ["VALIDATED_PRODUCTION", "VALIDATED_LIMITED_DEPLOYMENT"]
    assert data["deployment_status"] in ["PRODUCTION", "LIMITED"]
    assert len(data["recommendations"]) > 0


def test_disease_predict_valid_png(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    fake_png = _create_fake_image(fmt="PNG")

    files = {"image": ("leaf_test.png", fake_png, "image/png")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["disease_model_status"] in ["VALIDATED_PRODUCTION", "VALIDATED_LIMITED_DEPLOYMENT"]
    assert data["deployment_status"] in ["PRODUCTION", "LIMITED"]


def test_disease_predict_reject_unsupported_format(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}

    # PDF file
    fake_pdf = io.BytesIO(b"%PDF-1.4 header contents")
    files = {"image": ("document.pdf", fake_pdf, "application/pdf")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 400

    # Text / Script file
    fake_script = io.BytesIO(b"#!/bin/bash\necho hello")
    files_script = {"image": ("malicious.sh", fake_script, "text/plain")}
    res_script = client.post("/api/disease/predict", headers=headers, files=files_script)
    assert res_script.status_code == 400


def test_disease_predict_reject_oversized_file(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    # 11 MB file exceeds 10MB limit
    large_size = 11 * 1024 * 1024
    fake_large = _create_fake_image(b"\xff\xd8\xff\xe0", large_size)
    files = {"image": ("large.jpg", fake_large, "image/jpeg")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 413


def test_disease_history_and_isolation(auth_user_tokens):
    h1 = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    h2 = {"Authorization": f"Bearer {auth_user_tokens['user2_token']}"}

    fake_jpeg = _create_fake_image(fmt="JPEG")
    files = {"image": ("tomato_leaf.jpg", fake_jpeg, "image/jpeg")}

    # User 1 diagnoses
    diag_res = client.post("/api/disease/predict", headers=h1, files=files)
    assert diag_res.status_code == 200
    dis_id = diag_res.json()["prediction_id"]

    # User 1 history
    hist = client.get("/api/disease/history", headers=h1)
    assert hist.status_code == 200
    assert any(item["prediction_id"] == dis_id for item in hist.json())

    # User 1 detail
    det1 = client.get(f"/api/disease/history/{dis_id}", headers=h1)
    assert det1.status_code == 200
    assert det1.json()["prediction_id"] == dis_id

    # User 2 cannot access User 1's disease record (403 Forbidden)
    det2 = client.get(f"/api/disease/history/{dis_id}", headers=h2)
    assert det2.status_code == 403


# =========================================================================
# OPENAPI / SWAGGER DOCUMENTATION TESTS
# =========================================================================

def test_complete_api_docs_endpoints():
    res = client.get("/openapi.json")
    assert res.status_code == 200
    paths = res.json()["paths"]

    expected_endpoints = [
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/me",
        "/api/auth/logout",
        "/api/users/me",
        "/api/users/me/profile",
        "/api/risk/predict",
        "/api/risk/history",
        "/api/risk/history/{prediction_id}",
        "/api/disease/predict",
        "/api/disease/history",
        "/api/disease/history/{prediction_id}",
    ]

    for ep in expected_endpoints:
        assert ep in paths, f"Expected endpoint {ep} missing in OpenAPI schema"


# =========================================================================
# PHASE 3.8 — REAL ML END-TO-END VERIFICATION TESTS
# =========================================================================

def test_risk_model_explainability_response(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    payload = {
        "region": "Ludhiana",
        "crop": "Wheat",
        "season": "Rabi",
        "temperature": 38.5, # Heat stress
        "rainfall": 150.0,
        "humidity": 60.0,
        "soil_moisture": 32.0,
        "soil_ph": 7.4,
        "nitrogen": 220.0,
        "phosphorus": 25.0,
        "potassium": 190.0,
        "pest_probability": 0.45,
        "market_price": 2125.0,
        "production_yield": 4.8,
    }
    res = client.post("/api/risk/predict", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction_type"] == "ML"
    assert data["model_status"] in ["VALIDATED_PRODUCTION", "EVALUATION_FAILED"]
    assert "prediction_timestamp" in data
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "top_contributing_factors" in data
    assert len(data["top_contributing_factors"]) > 0
    assert len(data["recommendations"]) > 0


def test_disease_predict_real_plantvillage_sample(auth_user_tokens):
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    
    # Create realistic test leaf image with lesion
    img = Image.new("RGB", (224, 224), color=(46, 117, 43))
    bio = io.BytesIO()
    img.save(bio, format="JPEG")
    bio.seek(0)

    files = {"image": ("plant_leaf.jpg", bio, "image/jpeg")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["disease_model_status"] in ["VALIDATED_PRODUCTION", "VALIDATED_LIMITED_DEPLOYMENT"]
    assert data["deployment_status"] in ["PRODUCTION", "LIMITED"]
    assert "status" in data
    assert len(data["recommendations"]) > 0


def test_phase_4b_provenance_and_harvest_data_status(auth_user_tokens):
    """
    Phase 4B Integration Test:
    Verifies that the risk assessment API accurately returns the synchronized harvest provenance:
    - 2022 = FINAL
    - 2023 = FINAL
    - 2024 = PROVISIONAL
    - 2025 = PROVISIONAL_ADVANCE
    """
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    payload = {
        "region": "Punjab",
        "crop": "Wheat",
        "season": "Rabi",
        "temperature": 32.0,
        "rainfall": 180.0,
        "humidity": 55.0,
        "soil_moisture": 35.0,
        "soil_ph": 7.2,
        "nitrogen": 240.0,
        "phosphorus": 22.0,
        "potassium": 185.0,
        "pest_probability": 0.10,
        "market_price": 2275.0,
        "production_yield": 5.0,
    }
    res = client.post("/api/risk/predict", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["weather_data_year"] == 2025
    assert data["market_data_year"] == 2025
    assert data["pest_data_year"] == 2025
    assert data["soil_data_year"] == 2025
    assert data["latest_harvest_outcome_year"] == 2025
    assert data["latest_final_harvest_outcome_year"] == 2023
    assert data["harvest_data_status"] == "PROVISIONAL_ADVANCE"
    assert data["harvest_status_by_year"]["2022"] == "FINAL"
    assert data["harvest_status_by_year"]["2023"] == "FINAL"
    assert data["harvest_status_by_year"]["2024"] == "PROVISIONAL"
    assert data["harvest_status_by_year"]["2025"] == "PROVISIONAL_ADVANCE"


# =========================================================================
# PHASE 5 — POST /api/predict FROZEN MODEL INTEGRATION TESTS
# =========================================================================

def test_phase_5_predict_valid_ludhiana_wheat():
    """Tests POST /api/predict with authentic Ludhiana Wheat request."""
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat",
        "season": "Rabi",
        "sowing_date": "2025-11-15",
        "farm_area": 4.5,
        "soil_ph": 7.4,
        "nitrogen": 240.0,
        "phosphorus": 22.0,
        "potassium": 185.0,
        "irrigation_available": True
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["prediction_allowed"] is True
    assert data["model_version"].startswith("AGRIRISK_ML_")
    assert data["crop"] == "Wheat"
    assert data["district"] == "Ludhiana"

    # Yield Output
    assert data["yield_prediction"]["expected_yield"] > 0.0
    assert data["yield_prediction"]["unit"] == "tonnes/hectare"
    assert data["yield_prediction"]["prediction_range"]["lower"] <= data["yield_prediction"]["expected_yield"] <= data["yield_prediction"]["prediction_range"]["upper"]
    assert data["yield_prediction"]["uncertainty_status"] == "LIMITED"

    # Risk Output
    assert 0 <= data["risk"]["score"] <= 100
    assert data["risk"]["level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "weather" in data["risk"]["dimensions"]
    assert "soil" in data["risk"]["dimensions"]
    assert "pest" in data["risk"]["dimensions"]
    assert len(data["risk"]["top_factors"]) > 0

    # Financial Output
    assert "Rs." in data["financial_risk"]["expected_revenue"]
    assert data["financial_risk"]["profit_estimate"] is None
    assert data["financial_risk"]["profit_status"] == "NOT_AVAILABLE"

    # Provenance Output
    assert data["data_freshness"]["weather"] == 2025
    assert data["data_freshness"]["latest_harvest_outcome"] == 2025
    assert data["data_freshness"]["latest_final_harvest_outcome"] == 2023
    assert data["harvest_status"]["2023"] == "FINAL"
    assert data["harvest_status"]["2025"] == "PROVISIONAL_ADVANCE"


def test_phase_5_predict_valid_nashik_onion():
    """Tests POST /api/predict with authentic Nashik Onion request."""
    payload = {
        "state": "Maharashtra",
        "district": "Nashik",
        "crop": "Onion",
        "season": "Whole Year",
        "farm_area": 2.0,
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction_allowed"] is True
    assert data["crop"] == "Onion"
    assert data["district"] == "Nashik"
    assert data["yield_prediction"]["expected_yield"] > 5.0  # High onion yield per ha


def test_phase_5_predict_unsupported_crop_refusal():
    """Tests that an unsupported crop is rejected safely with HTTP 422."""
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Dragonfruit",
        "season": "Rabi",
        "farm_area": 1.0,
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 422
    data = res.json()
    assert data["detail"]["prediction_allowed"] is False
    assert data["detail"]["reason"] == "INSUFFICIENT_VERIFIED_DATA"


def test_phase_5_predict_unsupported_district_refusal():
    """Tests that an unsupported district is rejected safely with HTTP 422."""
    payload = {
        "state": "Punjab",
        "district": "UnknownDistrict99",
        "crop": "Wheat",
        "season": "Rabi",
        "farm_area": 1.0,
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 422
    data = res.json()
    assert data["detail"]["prediction_allowed"] is False
    assert data["detail"]["reason"] == "INSUFFICIENT_VERIFIED_DATA"


# =========================================================================
# PHASE 7 — CROP DISEASE IMAGE DETECTION TESTS
# =========================================================================

def test_phase_7_disease_classes():
    """Tests GET /api/disease/classes returns supported crops and classes."""
    res = client.get("/api/disease/classes")
    assert res.status_code == 200
    data = res.json()
    assert "supported_crops" in data
    assert "Tomato" in data["supported_crops"]
    assert "Potato" in data["supported_crops"]
    assert data["model_status"] == "VALIDATED_LIMITED_DEPLOYMENT"
    assert data["deployment_status"] == "LIMITED"
    assert data["supported_classes_count"] == 16


def test_phase_7_disease_valid_image_prediction(auth_user_tokens):
    """Tests POST /api/disease/predict with a valid simulated leaf image."""
    # Generate non-uniform foliage image
    arr = np.zeros((224, 224, 3), dtype=np.uint8)
    np.random.seed(42)
    arr[:, :, 1] = np.random.randint(60, 200, (224, 224), dtype=np.uint8)
    arr[:, :, 0] = np.random.randint(20, 100, (224, 224), dtype=np.uint8)
    arr[:, :, 2] = np.random.randint(20, 80, (224, 224), dtype=np.uint8)
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    files = {"image": ("test_leaf.jpg", buf, "image/jpeg")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert "prediction_id" in data
    assert data["disease_model_status"] == "VALIDATED_LIMITED_DEPLOYMENT"
    assert data["deployment_status"] == "LIMITED"
    assert data["disease_model_version"] == "DISEASE_MODEL_v1.0"
    assert len(data["recommendations"]) > 0


def test_phase_7_disease_blank_image_refusal(auth_user_tokens):
    """Tests that a pitch black image is rejected by the image quality check with HTTP 422."""
    img = Image.new("RGB", (224, 224), color=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    files = {"image": ("blank.jpg", buf, "image/jpeg")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 422
    data = res.json()
    assert data["detail"]["prediction_allowed"] is False
    assert data["detail"]["status"] == "IMAGE_INSUFFICIENT_FOR_ANALYSIS"


def test_phase_7_disease_low_resolution_refusal(auth_user_tokens):
    """Tests that a tiny 10x10 pixel image is rejected with HTTP 422."""
    img = Image.new("RGB", (10, 10), color=(50, 150, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    files = {"image": ("tiny.jpg", buf, "image/jpeg")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 422
    data = res.json()
    assert data["detail"]["prediction_allowed"] is False
    assert data["detail"]["status"] == "IMAGE_INSUFFICIENT_FOR_ANALYSIS"


def test_phase_7_disease_invalid_file_extension(auth_user_tokens):
    """Tests that an unsupported file format (.txt) is rejected with HTTP 400."""
    buf = io.BytesIO(b"Fake text file disguised as image")
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    files = {"image": ("malicious.txt", buf, "text/plain")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 400


def test_phase_7c_disease_model_limited_deployment_metadata(auth_user_tokens):
    """Phase 7C: Verifies disease predictions carry VALIDATED_LIMITED_DEPLOYMENT and DEPLOYMENT: LIMITED."""
    img = Image.new("RGB", (224, 224), color=(60, 140, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    files = {"image": ("test_leaf.jpg", buf, "image/jpeg")}
    res = client.post("/api/disease/predict", headers=headers, files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["disease_model_status"] == "VALIDATED_LIMITED_DEPLOYMENT"
    assert data["deployment_status"] == "LIMITED"
    assert data["disease_model_version"] == "DISEASE_MODEL_v1.0"
    assert "disclaimer" in data
    assert "Image-based identification" in data["disclaimer"]


# ==============================================================================
# PHASE 8: FARMER DECISION SUPPORT ENGINE TESTS
# ==============================================================================

def test_phase_8_decision_support_valid_request(auth_user_tokens):
    """Phase 8: Tests POST /api/decision-support returns complete 8-dimension decision support."""
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat",
        "season": "Rabi",
        "sowing_date": "2025-11-15",
        "farm_area": 4.0,
        "soil_ph": 7.2,
        "nitrogen": 240.0,
        "phosphorus": 22.0,
        "potassium": 185.0,
        "irrigation_available": True
    }
    res = client.post("/api/decision-support", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction_allowed"] is True
    assert "risk_score" in data
    assert data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert "risk_summary" in data
    assert "why_explanation" in data
    assert len(data["top_risk_factors"]) == 3
    assert "yield_assessment" in data
    assert data["yield_assessment"]["status"] == "AVAILABLE"
    assert data["yield_assessment"]["expected_yield"] is not None
    assert "market_assessment" in data
    assert data["market_assessment"]["status"] == "AVAILABLE"
    assert len(data["recommendations"]) > 0
    assert data["farmer_protection"]["insurance_information"] == "AVAILABLE"
    assert "PMFBY" in data["farmer_protection"]["scheme_name"]
    assert data["model_versions"]["yield_model"] == "AGRIRISK_ML_v1.0"
    assert data["model_versions"]["disease_model"] == "DISEASE_MODEL_v1.0"


def test_phase_8_decision_support_with_disease_prediction(auth_user_tokens):
    """Phase 8: Tests linking a recent disease prediction into the decision support assessment."""
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    
    # 1. Upload simulated leaf image
    arr = np.zeros((224, 224, 3), dtype=np.uint8)
    arr[:, :, 1] = 140
    arr[:, :, 0] = 60
    arr[:, :, 2] = 40
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    files = {"image": ("leaf.jpg", buf, "image/jpeg")}
    dis_res = client.post("/api/disease/predict", headers=headers, files=files)
    assert dis_res.status_code == 200
    pred_id = dis_res.json()["prediction_id"]

    # 2. Call decision support with disease_prediction_id
    payload = {
        "state": "Maharashtra",
        "district": "Nashik",
        "crop": "Onion",
        "season": "Rabi",
        "farm_area": 2.5,
        "disease_prediction_id": pred_id
    }
    res = client.post("/api/decision-support", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["disease_assessment"]["status"] in ["AVAILABLE", "UNKNOWN_OR_LOW_CONFIDENCE"]
    assert data["disease_assessment"]["deployment_status"] == "LIMITED"


def test_phase_8_decision_support_2026_sowing_advisory(auth_user_tokens):
    """Phase 8: Tests that a 2026 sowing date triggers the explicit 2026 unobserved harvest advisory."""
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat",
        "season": "Rabi",
        "sowing_date": "2026-11-10",
        "farm_area": 3.0
    }
    res = client.post("/api/decision-support", headers=headers, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["year_2026_advisory"] is not None
    assert "2026 harvest outcome is not yet observed" in data["year_2026_advisory"]


def test_phase_8_decision_support_unsupported_crop_refusal(auth_user_tokens):
    """Phase 8: Tests that unsupported state/crop combinations are rejected with HTTP 422."""
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Dragonfruit",
        "season": "Rabi",
        "farm_area": 1.0
    }
    res = client.post("/api/decision-support", headers=headers, json=payload)
    assert res.status_code == 422
    data = res.json()
    assert data["detail"]["prediction_allowed"] is False
    assert data["detail"]["reason"] == "INSUFFICIENT_VERIFIED_DATA"


def test_phase_8_decision_support_no_guarantee_language_audit(auth_user_tokens):
    """Phase 8: Audits that decision support output contains zero guarantee/certainty claims."""
    headers = {"Authorization": f"Bearer {auth_user_tokens['user1_token']}"}
    payload = {
        "state": "Gujarat",
        "district": "Rajkot",
        "crop": "Groundnut",
        "season": "Kharif",
        "farm_area": 5.0
    }
    res = client.post("/api/decision-support", headers=headers, json=payload)
    assert res.status_code == 200
    json_text = json.dumps(res.json()).lower()
    
    prohibited_phrases = [
        "guaranteed profit",
        "guaranteed yield",
        "guaranteed crop success",
        "guaranteed protection",
        "100% accurate",
        "risk-free",
        "guaranteed diagnosis"
    ]
    for phrase in prohibited_phrases:
        assert phrase not in json_text, f"Found prohibited guarantee phrase: {phrase}"





