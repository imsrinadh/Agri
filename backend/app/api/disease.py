from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Header, status, HTTPException
from app.core.security import get_current_user, get_optional_current_user
from app.schemas.disease import (
    DiseasePredictionResponse,
    DiseaseHistoryItem,
)
from app.services.disease_service import disease_service

router = APIRouter(prefix="/disease", tags=["Disease Detection"])


@router.get(
    "/classes",
    summary="Get Supported Crop Disease Classes",
    description="Returns the list of officially supported crop species and disease/healthy diagnostic classes.",
    status_code=status.HTTP_200_OK,
)
def get_supported_disease_classes() -> Dict[str, Any]:
    """
    Returns supported crops, diseases, and model diagnostic classes.
    """
    return disease_service.get_supported_classes()


@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Crop Leaf Image for Disease",
    description="Upload a leaf photograph (JPEG/PNG/WEBP, max 10MB) for foliar pathogen screening.",
)
async def predict_crop_disease(
    image: UploadFile = File(..., description="Crop leaf image file (JPEG, PNG, or WEBP)"),
    crop: Optional[str] = Form(None, description="Optional crop hint"),
    x_gemini_api_key: Optional[str] = Header(None, alias="x-gemini-api-key", description="Optional Gemini Vision API key for Universal Any-Plant AI"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user["id"] if current_user else "anonymous_farmer"
    return await disease_service.predict_disease_from_upload(
        user_id=user_id,
        file=image,
        crop_hint=crop,
        api_key=x_gemini_api_key,
    )


@router.get(
    "/history",
    response_model=List[DiseaseHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get Disease Analysis History",
    description="Retrieve list of past crop disease diagnoses performed by the authenticated user.",
)
async def get_disease_history(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> List[Dict[str, Any]]:
    user_id = current_user["id"] if current_user else "anonymous_farmer"
    return disease_service.get_user_history(user_id)


@router.get(
    "/history/{prediction_id}",
    response_model=DiseasePredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Disease Prediction Detail",
    description="Retrieve full diagnostic details and treatment recommendations for a specific disease analysis.",
)
async def get_disease_detail(
    prediction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return disease_service.get_prediction_detail(
        user_id=current_user["id"],
        prediction_id=prediction_id,
    )


@router.delete(
    "/history/{prediction_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Disease History Record",
    description="Remove a specific disease scan from user history.",
)
async def delete_disease_record(
    prediction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return disease_service.delete_user_record(
        user_id=current_user["id"],
        prediction_id=prediction_id,
    )


@router.delete(
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Clear All Disease History",
    description="Remove all disease analysis records for the authenticated user.",
)
async def clear_disease_history(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    return disease_service.clear_user_history(
        user_id=current_user["id"],
    )

