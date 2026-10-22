import { api } from './api';

/**
 * Executes holistic Farmer Decision Support assessment.
 * Combines ML Yield Prediction (AGRIRISK_ML_v1.0), Multi-Hazard Risk Scoring,
 * Crop Pathology Diagnostics (DISEASE_MODEL_v1.0), and PMFBY Farmer Protection.
 */
export const getDecisionSupport = async (params) => {
  const payload = {
    state: params.state,
    district: params.district,
    crop: params.crop,
    season: params.season,
    sowing_date: params.sowing_date || null,
    farm_area: Number(params.farm_area) || 1.0,
    soil_ph: params.soil_ph != null ? Number(params.soil_ph) : null,
    nitrogen: params.nitrogen != null ? Number(params.nitrogen) : null,
    phosphorus: params.phosphorus != null ? Number(params.phosphorus) : null,
    potassium: params.potassium != null ? Number(params.potassium) : null,
    irrigation_available: params.irrigation_available ?? true,
    disease_prediction_id: params.disease_prediction_id || null,
  };

  return await api.post('/decision-support', payload);
};
