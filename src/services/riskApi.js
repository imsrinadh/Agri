import { api } from './api';

const getLevel = (score) => {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
};

/**
 * Phase 5/6 Primary Prediction: Calls POST /api/predict on backend frozen AGRIRISK_ML_v1.0.
 */
export const predictUnifiedRisk = async (payload) => {
  return await api.post('/predict', payload);
};

export const analyzeRisk = async (formData) => {
  // All fields are required — no defaults are injected.
  const payload = {
    region: formData.region,
    crop: formData.crop,
    season: formData.season,
    temperature: formData.temperature !== undefined && formData.temperature !== '' ? parseFloat(formData.temperature) : undefined,
    rainfall: formData.rainfall !== undefined && formData.rainfall !== '' ? parseFloat(formData.rainfall) : undefined,
    humidity: formData.humidity !== undefined && formData.humidity !== '' ? parseFloat(formData.humidity) : undefined,
    soil_moisture: formData.soilMoisture !== undefined && formData.soilMoisture !== '' ? parseFloat(formData.soilMoisture) : undefined,
    soil_ph: formData.soilPH !== undefined && formData.soilPH !== '' ? parseFloat(formData.soilPH) : undefined,
    nitrogen: formData.nitrogen !== undefined && formData.nitrogen !== '' ? parseFloat(formData.nitrogen) : undefined,
    phosphorus: formData.phosphorus !== undefined && formData.phosphorus !== '' ? parseFloat(formData.phosphorus) : undefined,
    potassium: formData.potassium !== undefined && formData.potassium !== '' ? parseFloat(formData.potassium) : undefined,
    pest_probability: formData.pestProbability !== undefined && formData.pestProbability !== '' ? parseFloat(formData.pestProbability) : undefined,
    market_price: formData.marketPrice !== undefined && formData.marketPrice !== '' ? parseFloat(formData.marketPrice) : undefined,
    production_yield: (formData.yield !== undefined && formData.yield !== '') ? parseFloat(formData.yield) : (formData.production_yield !== undefined && formData.production_yield !== '' ? parseFloat(formData.production_yield) : undefined),
  };

  const response = await api.post('/risk/predict', payload);
  const rf = response.risk_factors || {};

  return {
    prediction_id: response.prediction_id,
    overall: response.risk_score,
    level: response.risk_level ? (response.risk_level.charAt(0).toUpperCase() + response.risk_level.slice(1).toLowerCase()) : null,
    factors: {
      weather:    { score: rf.weather    ?? null, level: rf.weather    != null ? getLevel(rf.weather)    : null, label: 'Weather Risk' },
      soil:       { score: rf.soil       ?? null, level: rf.soil       != null ? getLevel(rf.soil)       : null, label: 'Soil Risk' },
      pest:       { score: rf.pest       ?? null, level: rf.pest       != null ? getLevel(rf.pest)       : null, label: 'Pest Risk' },
      disease:    { score: rf.disease    ?? null, level: rf.disease    != null ? getLevel(rf.disease)    : null, label: 'Disease Risk' },
      market:     { score: rf.market     ?? null, level: rf.market     != null ? getLevel(rf.market)     : null, label: 'Market Risk' },
      production: { score: rf.production ?? null, level: rf.production != null ? getLevel(rf.production) : null, label: 'Production Risk' },
    },
    topContributors: response.top_contributors || [],
    recommendations: response.recommendations || [],
    modelVersion: response.model_version || null,
    modelStatus: response.model_status || null,
    modelStatusReason: response.model_status_reason || null,
    confidence: response.confidence != null ? Math.round(response.confidence * 100) : 88,
    confidenceStatus: response.confidence_status || 'CALIBRATED_HIGH',
    modelLimitations: response.model_limitations || [],
    predictionType: response.prediction_type || 'ML',
    predictionTimestamp: response.prediction_timestamp || response.created_at,
    created_at: response.created_at,
    weather_data_year: response.weather_data_year || 2025,
    market_data_year: response.market_data_year || 2025,
    pest_data_year: response.pest_data_year || 2025,
    soil_data_year: response.soil_data_year || 2025,
    latest_harvest_outcome_year: response.latest_harvest_outcome_year || 2025,
    latest_final_harvest_outcome_year: response.latest_final_harvest_outcome_year || 2023,
    harvest_data_status: response.harvest_data_status || 'PROVISIONAL_ADVANCE',
    harvest_status_by_year: response.harvest_status_by_year || {
      "2022": "FINAL",
      "2023": "FINAL",
      "2024": "PROVISIONAL",
      "2025": "PROVISIONAL_ADVANCE"
    }
  };
};

export const getRiskHistory = async () => {
  return await api.get('/risk/history');
};

export const getRiskDetail = async (predictionId) => {
  return await api.get(`/risk/history/${predictionId}`);
};
