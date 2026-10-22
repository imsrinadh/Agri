from typing import List, Optional
from pydantic import BaseModel, Field


class DiseaseRecommendation(BaseModel):
    """
    Actionable agricultural recommendation for disease treatment or prevention.
    """
    title: str
    description: str


class TopPredictionItem(BaseModel):
    crop: str
    disease: str
    probability: float
    is_top: bool = False
    is_healthy: bool = False


class DiseasePredictionResponse(BaseModel):
    """
    Response model for crop disease detection assessment with transparent AI engine attribution.
    """
    prediction_allowed: bool = Field(True, description="Whether disease prediction is allowed / accepted")
    prediction_id: str
    image_id: str
    image_url: Optional[str] = None
    crop: Optional[str] = None
    scientific_name: Optional[str] = None
    plant_family: Optional[str] = None
    disease: Optional[str] = None
    pathogen: Optional[str] = None
    symptoms: Optional[str] = None
    causes: Optional[str] = None
    possibleCauses: Optional[str] = None
    architecture: Optional[str] = "ResNet-50 Deep CNN Super Model"
    api_engine_used: Optional[str] = Field(None, description="Exact API or local deep learning model powering the diagnosis")
    engine_type: Optional[str] = Field("LOCAL_CNN", description="UNIVERSAL_API or LOCAL_CNN")
    is_plant: bool = Field(True, description="Whether the uploaded photograph is validated as botanical plant foliage")
    rejection_reason: Optional[str] = None
    super_model: bool = True
    confidence: float = 0.0
    model_confidence: Optional[float] = None
    confidence_pct: Optional[float] = None
    severity: Optional[str] = "UNKNOWN"
    status: str = Field("SUCCESS", description="SUCCESS, DISEASE_DETECTED, HEALTHY, UNKNOWN_OR_LOW_CONFIDENCE, INVALID_IMAGE_NON_FOLIAGE")
    disease_model_status: str = "VALIDATED_PRODUCTION"
    disease_model_version: str = "DISEASE_MODEL_v2.0"
    model_status: str = "VALIDATED_PRODUCTION"
    model_version: str = "DISEASE_MODEL_v2.0"
    deployment_status: str = "PRODUCTION"
    data_status: str = "REAL_PLANTVILLAGE_BENCHMARK"
    message: str = "AI-assisted disease identification."
    disclaimer: str = "Image-based identification is a decision-support result and may require confirmation by an agricultural extension specialist."
    data_sources: List[str] = Field(default_factory=list)
    ai_prediction: bool = True
    prediction_timestamp: Optional[str] = None
    recommendations: List[str] = Field(default_factory=list)
    top_predictions: List[TopPredictionItem] = Field(default_factory=list)
    created_at: str


class DiseaseHistoryItem(BaseModel):
    """
    Summarized crop disease analysis entry for user history.
    """
    prediction_id: str
    crop: Optional[str] = None
    scientific_name: Optional[str] = None
    disease: Optional[str] = None
    pathogen: Optional[str] = None
    confidence: float
    severity: Optional[str] = None
    status: str
    api_engine_used: Optional[str] = None
    image_url: Optional[str] = None
    created_at: str

