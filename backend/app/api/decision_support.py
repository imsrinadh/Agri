"""
AgriRisk Phase 8: Farmer Decision Support API Router (POST /api/decision-support).
Provides comprehensive rule-based agricultural decision support combining:
- Frozen AGRIRISK_ML_v1.0 yield & 5-dimensional condition risks
- Validated DISEASE_MODEL_v1.0 foliar diagnostics (Limited Deployment)
- Verified APMC Mandi commodity market indicators
- Prioritized actionable farmer recommendations
- Official PMFBY crop insurance protection pathways
"""
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.decision_support import DecisionSupportRequest, DecisionSupportResponse
from app.services.decision_support_service import decision_support_service
from app.core.security import security_bearer, decode_access_token

router = APIRouter(prefix="/api/decision-support", tags=["Farmer Decision Support Engine"])
logger = logging.getLogger("agririsk.decision_support")


@router.post(
    "",
    response_model=DecisionSupportResponse,
    summary="Generate Farmer Decision Support Assessment",
    status_code=status.HTTP_200_OK,
)
def get_farmer_decision_support(
    request: DecisionSupportRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
):
    """
    Combines yield, multi-hazard risk, disease analysis, market indicators,
    and official crop insurance pathways into a unified decision-support assessment.
    """
    logger.info(f"Decision support requested: State={request.state}, District={request.district}, Crop={request.crop}")
    user_id = "anonymous"
    if credentials and credentials.credentials:
        try:
            payload = decode_access_token(credentials.credentials)
            user_id = payload.get("user_id", "anonymous")
        except Exception:
            user_id = "anonymous"

    try:
        response = decision_support_service.generate_decision_support(request=request, user_id=user_id)
        return response
    except ValueError as e:
        logger.warning(f"Decision support data refusal: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "prediction_allowed": False,
                "reason": "INSUFFICIENT_VERIFIED_DATA",
                "message": str(e),
                "required_action": "Please verify that the requested state, district, and crop have recorded historical agricultural census data."
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error in decision support engine: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating agricultural decision support. Please try again later."
        )
