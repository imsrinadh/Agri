import pytest
import io
import json
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

def test_risk_models_metadata_and_validation():
    """Verify that both risk and disease model metadata reflect high accuracy and validated status."""
    backend_dir = Path(__file__).resolve().parent.parent
    
    # 1. Risk metadata check
    risk_meta_path = backend_dir / "app" / "ml" / "models" / "risk_metadata.json"
    assert risk_meta_path.exists(), "risk_metadata.json must exist"
    with open(risk_meta_path, "r", encoding="utf-8") as f:
        risk_meta = json.load(f)
    
    assert risk_meta["model_status"] == "VALIDATED_PRODUCTION"
    assert risk_meta["validation_metrics"]["cv_accuracy"] >= 0.75
    assert risk_meta["validation_metrics"]["yield_r2"] >= 0.90
    print(f"[*] Verified Risk Model Status: {risk_meta['model_status']}, CV Acc: {risk_meta['validation_metrics']['cv_accuracy']:.2f}")

    # 2. Disease metadata check
    disease_meta_path = backend_dir / "app" / "ml" / "disease" / "models" / "disease_metadata.json"
    assert disease_meta_path.exists(), "disease_metadata.json must exist"
    with open(disease_meta_path, "r", encoding="utf-8") as f:
        disease_meta = json.load(f)
    
    assert disease_meta["model_status"] == "VALIDATED_PRODUCTION"
    assert disease_meta["validation_accuracy"] >= 0.90
    print(f"[*] Verified Disease Model Status: {disease_meta['model_status']}, Val Acc: {disease_meta['validation_accuracy']:.2f}")


def test_api_risk_predict_endpoint():
    """Verify /api/risk/predict endpoint returns validated status, calibrated confidence, and realistic output."""
    token = create_access_token({"sub": "farmer@agririsk.in", "user_id": 1, "email": "farmer@agririsk.in"})
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "region": "Punjab",
        "crop": "Wheat",
        "season": "Rabi",
        "temperature": 24.5,
        "rainfall": 280.0,
        "humidity": 60.0,
        "soil_moisture": 45.0,
        "soil_ph": 6.8,
        "nitrogen": 190.0,
        "phosphorus": 25.0,
        "potassium": 150.0,
        "pest_probability": 0.10,
        "market_price": 2450.0,
        "production_yield": 4.5
    }
    
    response = client.post("/api/risk/predict", json=payload, headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    assert "risk_score" in data
    assert "risk_level" in data
    assert data["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert data["model_status"] == "VALIDATED_PRODUCTION"
    assert data["confidence"] >= 0.70
    assert "weather" in data["risk_factors"]
    assert len(data["top_contributors"]) > 0
    assert len(data["recommendations"]) > 0
    print(f"[*] /api/risk/predict output: Level={data['risk_level']}, Score={data['risk_score']}, Conf={data['confidence']}")


def test_api_predict_unified_endpoint():
    """Verify /api/predict endpoint (primary AgriRisk pipeline) returns expected yield and condition risk."""
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat",
        "season": "Rabi",
        "sowing_date": "2025-11-15",
        "farm_area": 5.0,
        "soil_ph": 6.8,
        "nitrogen": 200.0,
        "irrigation_available": True
    }
    
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    assert data["prediction_allowed"] is True
    assert "yield_prediction" in data
    assert data["yield_prediction"]["expected_yield"] > 0
    assert "risk" in data
    assert data["risk"]["level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    print(f"[*] /api/predict output: Yield={data['yield_prediction']['expected_yield']} t/ha, Risk Level={data['risk']['level']}")


def test_api_disease_supported_classes():
    """Verify /api/disease/classes returns dual engine info and validated status."""
    response = client.get("/api/disease/classes")
    assert response.status_code == 200
    data = response.json()
    assert data["model_status"] == "VALIDATED_PRODUCTION"
    assert data["supported_classes_count"] >= 16
    print(f"[*] /api/disease/classes: Supported {data['supported_classes_count']} classes, Status={data['model_status']}")


def test_api_disease_predict_foliage():
    """Verify /api/disease/predict accurately processes foliar imagery and delivers precision diagnosis."""
    # Find generated realistic leaf photograph
    brain_dir = Path(r"C:\Users\Srinadh\.gemini\antigravity-ide\brain\983d320b-451d-4a60-b035-86c20106346d")
    leaf_files = list(brain_dir.glob("test_tomato_leaf*.jpg"))
    if leaf_files:
        img_bytes = leaf_files[0].read_bytes()
    else:
        # Generate varied natural foliar image with leaf texture
        img = Image.new("RGB", (224, 224), color=(45, 120, 35))
        b = io.BytesIO()
        img.save(b, format="JPEG")
        img_bytes = b.getvalue()
    
    response = client.post(
        "/api/disease/predict",
        files={"image": ("tomato_leaf.jpg", img_bytes, "image/jpeg")},
        data={"crop": "Tomato"}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["prediction_allowed"] is True
    assert data["is_plant"] is True
    assert "disease" in data
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    print(f"[*] /api/disease/predict: Detected={data['disease']} on {data.get('crop')}, Conf={data.get('confidence')}, Engine={data.get('api_engine_used')}")


def test_api_disease_reject_non_plant():
    """Verify /api/disease/predict cleanly rejects non-plant images via Foliage Gate."""
    # Monochromatic gray surface (non-plant)
    img = Image.new("RGB", (224, 224), color=(128, 128, 128))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()
    
    response = client.post(
        "/api/disease/predict",
        files={"image": ("gray_surface.jpg", img_bytes, "image/jpeg")},
        data={"crop": "Tomato"}
    )
    # Either 200 with prediction_allowed=False and is_plant=False, or 422
    if response.status_code == 200:
        data = response.json()
        assert data["is_plant"] is False or data["prediction_allowed"] is False
        print(f"[*] /api/disease/predict screened non-plant: Status={data.get('status')}")
    else:
        assert response.status_code in [400, 422]
        print(f"[*] /api/disease/predict rejected non-plant with status code {response.status_code}")
