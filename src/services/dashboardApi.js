import { api } from './api';

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : null);

export const getDashboardData = async () => {
  const data = await api.get('/dashboard');
  const ro = data.risk_overview || {};

  return {
    overallRisk: {
      score: ro.overall_score ?? null,
      level: capitalize(ro.overall_level),
      dataStatus: ro.data_status || 'UNAVAILABLE',
      message: ro.message || null,
      modelStatus: ro.model_status || null,
      modelLimitations: ro.model_limitations || [],
      updatedAt: ro.updated_at || null,
    },
    categories: [
      { id: 'weather',    label: 'Weather Risk',    score: ro.weather,    icon: 'cloud-rain',   color: '#4A7C2F', desc: 'Precipitation & temperature variance' },
      { id: 'soil',       label: 'Soil Risk',       score: ro.soil,       icon: 'layers',       color: '#8B6914', desc: 'NPK & pH nutrient balance' },
      { id: 'pest',       label: 'Pest Risk',       score: ro.pest,       icon: 'bug',          color: '#913D00', desc: 'Humidity & vector incidence' },
      { id: 'disease',    label: 'Disease Risk',    score: ro.disease,    icon: 'shield-alert', color: '#B04A26', desc: 'Foliar spore risk index' },
      { id: 'market',     label: 'Market Risk',     score: ro.market,     icon: 'trending-up',  color: '#6B9E3F', desc: 'Mandi pricing volatility band' },
      { id: 'production', label: 'Production Risk', score: ro.production, icon: 'sprout',       color: '#2D5016', desc: 'Yield potential vs benchmark' },
    ],
    user: data.user,
    recentRiskPredictions: data.recent_risk_predictions || [],
    recentDiseaseAnalyses: data.recent_disease_analyses || [],
    recommendations: data.recommendations || [],
    dataStatus: data.data_status || 'UNAVAILABLE',
    modelStatus: data.model_status || null,
  };
};

const getSharedInsights = async (timePeriod = '1y') => {
  return await api.get(`/insights?time_period=${timePeriod}`, { cacheTtlMs: 120000 });
};

export const getRiskTrend = async () => {
  const insights = await getSharedInsights('1y');
  if (insights.risk_trend && insights.risk_trend.length > 0) {
    return insights.risk_trend.map(pt => ({
      month: pt.date.includes('-') ? (pt.date.split('-')[1] ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(pt.date.split('-')[1],10)-1] : pt.date) : pt.date,
      date: pt.date,
      weather: pt.weather || pt.score,
      soil: pt.soil || pt.score,
      pest: pt.pest || pt.score,
      disease: pt.disease || pt.score,
      market: pt.market || pt.score,
      production: pt.production || pt.score,
      overall: pt.score,
    }));
  }
  return [];
};

export const getRegionalRisk = async () => {
  const insights = await getSharedInsights('1y');
  if (insights.regional_trends && insights.regional_trends.length > 0) {
    return insights.regional_trends.map(r => ({
      region: r.region,
      score: r.risk_score,
      level: capitalize(r.level || 'Moderate'),
    }));
  }
  return [];
};

export const getCropRisk = async () => {
  const insights = await getSharedInsights('1y');
  if (insights.crop_comparison && insights.crop_comparison.length > 0) {
    return insights.crop_comparison.map(c => ({
      crop: c.crop,
      weather: c.weather || c.risk_score,
      soil: c.soil || c.risk_score,
      pest: c.pest || c.risk_score,
      disease: c.disease || c.risk_score,
      market: c.market || c.risk_score,
      overall: c.risk_score,
    }));
  }
  return [];
};
