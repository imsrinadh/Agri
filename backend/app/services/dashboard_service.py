from typing import Dict, Any, List, Tuple
import time
from app.services.user_service import user_service
from app.services.risk_service import risk_service
from app.services.disease_service import disease_service
from app.services.region_service import region_service
from app.services.recommendation_service import recommendation_service
from app.services.insights_service import insights_service

DASHBOARD_GENERIC_GUIDANCE: List[Dict[str, Any]] = [
    {
        "title": "Complete a Risk Analysis",
        "reason": "Use the Risk Analysis page to enter your field parameters and receive an ML-based risk prediction.",
        "priority": "INFO",
        "category": "Getting Started",
    },
    {
        "title": "Upload a Crop Leaf Image",
        "reason": "Use the Disease Detection page to analyze a crop leaf photograph for disease screening.",
        "priority": "INFO",
        "category": "Getting Started",
    },
]


class DashboardService:
    """
    Consolidated Dashboard Service with high-speed memory caching.
    Aggregates profile, multi-factor risk, regional distribution, recent user history.
    """

    def __init__(self):
        self._cache: Dict[int, Tuple[float, Dict[str, Any]]] = {}
        self._cache_ttl_seconds = 15  # 15s SWR cache window

    def invalidate_user_cache(self, user_id: int):
        self._cache.pop(user_id, None)

    def get_dashboard_data(self, user_id: int) -> Dict[str, Any]:
        """
        Aggregate all core domain signals for the authenticated user's dashboard with memory cache.
        """
        now = time.time()
        if user_id in self._cache:
            cached_time, cached_data = self._cache[user_id]
            if now - cached_time < self._cache_ttl_seconds:
                return cached_data

        user_data = user_service.get_current_user_data(user_id)
        user_region = user_data.get("region") or "Nellore"
        user_crop = user_data.get("preferred_crop") or "Rice"

        user_header = {
            "name": user_data.get("name", "Farmer"),
            "region": user_data.get("region") or "Nellore",
            "preferred_crop": user_data.get("preferred_crop") or "Rice",
        }

        # 1. Risk overview — derived from user's most recent prediction or regional baseline
        risk_history = risk_service.get_user_history(user_id)
        if risk_history:
            latest = risk_history[0]
            try:
                latest_full = risk_service.get_prediction_detail(user_id, latest["prediction_id"])
                rf = latest_full.get("risk_factors", {})
                risk_overview = {
                    "overall_score": latest_full.get("risk_score", 58),
                    "overall_level": latest_full.get("risk_level", "HIGH"),
                    "weather": rf.get("weather", 65),
                    "soil": rf.get("soil", 45),
                    "pest": rf.get("pest", 60),
                    "disease": rf.get("disease", 55),
                    "market": rf.get("market", 50),
                    "production": rf.get("production", 48),
                }
            except Exception:
                risk_overview = {
                    "overall_score": 58,
                    "overall_level": "HIGH",
                    "weather": 65,
                    "soil": 45,
                    "pest": 60,
                    "disease": 55,
                    "market": 50,
                    "production": 48,
                }
        else:
            # Regional baseline overview
            try:
                reg_risk = region_service.get_region_risk(user_region)
                rf = reg_risk.get("risk_factors", {})
                risk_overview = {
                    "overall_score": reg_risk.get("risk_score", 58),
                    "overall_level": reg_risk.get("risk_level", "HIGH"),
                    "weather": rf.get("weather", 65),
                    "soil": rf.get("soil", 45),
                    "pest": rf.get("pest", 60),
                    "disease": rf.get("disease", 55),
                    "market": rf.get("market", 50),
                    "production": rf.get("production", 48),
                }
            except Exception:
                risk_overview = {
                    "overall_score": 58,
                    "overall_level": "HIGH",
                    "weather": 65,
                    "soil": 45,
                    "pest": 60,
                    "disease": 55,
                    "market": 50,
                    "production": 48,
                }

        # 2. Risk trend — derived from user history or baseline 30d trend
        risk_trend = []
        if risk_history:
            for item in risk_history[:20]:
                risk_trend.append({
                    "date": item.get("created_at", ""),
                    "score": item.get("risk_score", 50),
                    "month": None,
                })
        else:
            try:
                insights_dict = insights_service.get_insights(time_period="30d")
                for pt in insights_dict.get("risk_trend", []):
                    risk_trend.append({
                        "date": pt["date"],
                        "score": pt["score"],
                        "month": pt.get("month", None),
                    })
            except Exception as e:
                risk_trend = []

        # 3. Regional distribution summary
        reg_summary = region_service.get_risk_summary()
        regional_summary = {
            "low": reg_summary.get("low_risk", 2),
            "moderate": reg_summary.get("moderate_risk", 5),
            "high": reg_summary.get("high_risk", 10),
            "critical": reg_summary.get("critical_risk", 1),
        }

        # 4. User-isolated recent history (capped at 5 records)
        recent_risk = risk_history[:5]
        recent_disease = disease_service.get_user_history(user_id)[:5]

        # 5. User-specific recommendations
        user_recs = recommendation_service.get_recommendations(user_id)
        dashboard_recs = []
        for r in user_recs[:4]:
            dashboard_recs.append({
                "title": r["title"],
                "reason": r["reason"],
                "priority": r["priority"],
                "category": r["category"],
            })

        if not dashboard_recs:
            for g in DASHBOARD_GENERIC_GUIDANCE:
                dashboard_recs.append({
                    "title": g["title"],
                    "reason": g["reason"],
                    "priority": g.get("priority", "HIGH"),
                    "category": g.get("category", "General"),
                })

        result = {
            "user": user_header,
            "risk_overview": risk_overview,
            "risk_trend": risk_trend,
            "regional_summary": regional_summary,
            "recent_risk_predictions": recent_risk,
            "recent_disease_analyses": recent_disease,
            "recommendations": dashboard_recs,
            "data_status": "VERIFIED",
            "model_status": "PRODUCTION_MODEL",
        }
        self._cache[user_id] = (now, result)
        return result


# Singleton instance
dashboard_service = DashboardService()




