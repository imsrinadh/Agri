import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudRain, Layers, Bug,
  TrendingUp, Sprout, ShieldAlert, RefreshCw,
  Calendar, ShieldCheck,
  CheckCircle2, ChevronRight, Leaf, BarChart3, AlertCircle,
  MapPin, ArrowRight
} from 'lucide-react';
import RiskCard from '../components/RiskCard';
import RiskTrendChart from '../charts/RiskTrendChart';
import RegionalDistributionChart from '../charts/RegionalDistributionChart';
import CropRiskComparisonChart from '../charts/CropRiskComparisonChart';
import {
  getDashboardData, getRiskTrend, getRegionalRisk,
  getCropRisk
} from '../services/dashboardApi';
import { getDiseaseHistory } from '../services/diseaseApi';
import { getRecommendations } from '../services/recommendationApi';
import { getRiskColor, getRiskBarColor } from '../utils/riskUtils';
import { useAuth } from '../auth/AuthContext';

const CATEGORY_ICONS = {
  weather: CloudRain,
  soil: Layers,
  pest: Bug,
  disease: ShieldAlert,
  market: TrendingUp,
  production: Sprout,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard]       = useState(null);
  const [trendData, setTrendData]       = useState([]);
  const [regionalData, setRegional]     = useState([]);
  const [cropData, setCropData]         = useState([]);
  const [recentDiseases, setRecentDiseases] = useState([]);
  const [topRecs, setTopRecs]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [lastUpdated, setLastUpdated]   = useState(new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [dash, trend, reg, crop, diseases, recs] = await Promise.all([
        getDashboardData(),
        getRiskTrend(),
        getRegionalRisk(),
        getCropRisk(),
        getDiseaseHistory(),
        getRecommendations({ priority: 'High' })
      ]);
      setDashboard(dash);
      setTrendData(trend || []);
      setRegional(reg || []);
      setCropData(crop || []);
      setRecentDiseases(diseases?.slice(0, 3) || []);
      setTopRecs(recs?.slice(0, 3) || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load agricultural risk data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid var(--pale-green)',
            borderTop: '3px solid var(--forest-green)',
            margin: '0 auto 14px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--text-medium)', fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>
            Syncing field signals & agronomic risk metrics...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: '#FFF3CD', border: '1px solid #FFC107',
          borderRadius: 16, padding: '36px 24px', boxShadow: 'var(--shadow-sm)'
        }}>
          <AlertCircle size={44} color="#856404" style={{ marginBottom: 12 }} />
          <h2 style={{ fontFamily: 'Manrope, sans-serif', color: '#856404', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Risk Data Unavailable
          </h2>
          <p style={{ color: '#856404', fontSize: '0.92rem', marginBottom: 20 }}>
            {error || 'Unable to connect to the AgriRisk intelligence backend.'}
          </p>
          <button onClick={load} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { bg, text } = getRiskColor(dashboard?.overallRisk?.level || 'Moderate');
  const gaugeColor = getRiskBarColor(dashboard?.overallRisk?.score || 0);
  const recentPredictions = dashboard.recentRiskPredictions || [];

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Top Greeting & Overview Header */}
      <div style={{
        background: '#FAF7F2',
        padding: '28px 28px',
        borderBottom: '1px solid var(--beige)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--pale-green)', padding: '4px 12px', borderRadius: 99, marginBottom: 8 }}>
              <Leaf size={14} color="var(--forest-green)" />
              <span style={{ fontSize: '0.74rem', color: 'var(--forest-green)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {getGreeting()}, {user?.name || dashboard?.user?.name || 'Farmer'}
              </span>
            </div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)', color: 'var(--forest-green)', fontWeight: 800, lineHeight: 1.2 }}>
              Agricultural Risk Overview
            </h1>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.94rem', marginTop: 4, maxWidth: 680, lineHeight: 1.55 }}>
              Central agricultural intelligence hub tracking field risk indices, crop pathology, and regional risk indicators.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-medium)', fontSize: '0.8rem', background: '#FFFFFF', padding: '7px 14px', borderRadius: 8, border: '1px solid var(--beige)' }}>
              <Calendar size={14} color="var(--forest-green)" />
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={load}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--forest-green)',
                borderRadius: 8, padding: '8px 16px',
                color: '#fff', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
                boxShadow: '0 2px 6px rgba(45,80,22,0.2)',
                transition: 'all 0.15s ease',
                border: 'none'
              }}
            >
              <RefreshCw size={13} /> Refresh Signals
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>

        {/* 5 Prominent Actionable Platform Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}>
          {/* Card 1: Risk Analysis */}
          <Link
            to="/risk-analysis"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--beige)',
              borderRadius: 14,
              padding: '18px 20px',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="hover:border-[#2D5016] hover:shadow-md"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={18} color="#2D5016" />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2D5016', background: '#EBF4E5', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  CORE ML
                </span>
              </div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C2B0E', marginBottom: 4 }}>
                Analyze Risk
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#4A5D3B', lineHeight: 1.4, margin: 0 }}>
                Predict condition risk & expected yield with AGRIRISK_ML_v1.0.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2D5016', fontSize: '0.78rem', fontWeight: 700, marginTop: 14 }}>
              Open Predictor <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 2: Disease Detection */}
          <Link
            to="/disease-detection"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--beige)',
              borderRadius: 14,
              padding: '18px 20px',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="hover:border-[#2D5016] hover:shadow-md"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={18} color="#DC2626" />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  VISION AI
                </span>
              </div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C2B0E', marginBottom: 4 }}>
                Detect Disease
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#4A5D3B', lineHeight: 1.4, margin: 0 }}>
                Instant computer vision diagnostics for leaf pathologies.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2D5016', fontSize: '0.78rem', fontWeight: 700, marginTop: 14 }}>
              Scan Leaf <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 3: Regional Risk */}
          <Link
            to="/regions"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--beige)',
              borderRadius: 14,
              padding: '18px 20px',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="hover:border-[#2D5016] hover:shadow-md"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#0284C7" />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284C7', background: '#E0F2FE', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  GEOSPATIAL
                </span>
              </div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C2B0E', marginBottom: 4 }}>
                Regional Risk
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#4A5D3B', lineHeight: 1.4, margin: 0 }}>
                District-level vulnerability map & regional risk distribution.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2D5016', fontSize: '0.78rem', fontWeight: 700, marginTop: 14 }}>
              Explore Map <ArrowRight size={13} />
            </div>
          </Link>

          {/* Card 4: Farmer Protection */}
          <Link
            to="/farmer-protection"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--beige)',
              borderRadius: 14,
              padding: '18px 20px',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="hover:border-[#2D5016] hover:shadow-md"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF9EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color="#D97706" />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#D97706', background: '#FEF9EE', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  SAFETY NET
                </span>
              </div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1C2B0E', marginBottom: 4 }}>
                Farmer Protection
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#4A5D3B', lineHeight: 1.4, margin: 0 }}>
                Official government schemes, PMFBY insurance & DBT support.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2D5016', fontSize: '0.78rem', fontWeight: 700, marginTop: 14 }}>
              View Schemes <ArrowRight size={13} />
            </div>
          </Link>
        </div>

        {/* Overall Risk Score Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '24px 28px',
          marginBottom: 24, boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
          borderLeft: `6px solid ${gaugeColor}`,
          border: '1px solid var(--beige)',
          borderLeftWidth: 6,
        }}>
          {/* Circular Score Visual */}
          <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
            <svg width="84" height="84" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="#F0F0EC" strokeWidth="8"/>
              <circle
                cx="44" cy="44" r="36"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 36}
                strokeDashoffset={2 * Math.PI * 36 * (1 - (dashboard?.overallRisk?.score || 0) / 100)}
                transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--forest-green)' }}>
                {dashboard?.overallRisk?.score}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--forest-green)', marginBottom: 4 }}>
              Preliminary Risk Assessment Score
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: bg, color: text, padding: '4px 14px', borderRadius: 99, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                {dashboard?.overallRisk?.level?.toUpperCase()} RISK
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-medium)', fontWeight: 500 }}>
                {dashboard?.overallRisk?.trend}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to="/risk-analysis"
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.84rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Analyze Field Risk <ChevronRight size={14} />
            </Link>
            <Link
              to="/disease-detection"
              className="btn-disease"
              style={{ padding: '9px 18px', fontSize: '0.84rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Detect Crop Disease
            </Link>
          </div>
        </div>

        {/* 6 Clean Risk Cards: Weather, Soil, Pest, Disease, Market, Production */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 14,
          marginBottom: 24
        }} className="cards-grid">
          {dashboard?.categories?.map(cat => (
            <RiskCard
              key={cat.id}
              label={cat.label}
              score={cat.score}
              level={cat.score >= 75 ? 'Critical' : cat.score >= 50 ? 'High' : cat.score >= 25 ? 'Moderate' : 'Low'}
              desc={cat.desc}
              icon={CATEGORY_ICONS[cat.id]}
            />
          ))}
        </div>

        {/* Charts: Risk Trend, Regional Risk Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }} className="charts-row">
          <div className="chart-card" style={{ border: '1px solid var(--beige)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: 'var(--forest-green)', fontSize: '0.98rem', margin: 0 }}>
                Risk Trend (Development Trajectory)
              </h3>
              <Link to="/insights" style={{ fontSize: '0.78rem', color: 'var(--olive-green)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Insights <ChevronRight size={13} />
              </Link>
            </div>
            {trendData.length > 0 ? (
              <RiskTrendChart data={trendData} height={260} />
            ) : (
              <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.86rem' }}>
                No trend trajectory data available.
              </div>
            )}
          </div>

          <div className="chart-card" style={{ border: '1px solid var(--beige)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: 'var(--forest-green)', fontSize: '0.98rem', margin: 0 }}>
                Regional Risk Distribution
              </h3>
              <Link to="/regions" style={{ fontSize: '0.78rem', color: 'var(--olive-green)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Map <ChevronRight size={13} />
              </Link>
            </div>
            {regionalData.length > 0 ? (
              <RegionalDistributionChart data={regionalData} height={260} />
            ) : (
              <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.86rem' }}>
                No regional data available.
              </div>
            )}
          </div>
        </div>

        {/* Crop Risk Comparison Full Row */}
        <div className="chart-card" style={{ border: '1px solid var(--beige)', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: 'var(--forest-green)', marginBottom: 16, fontSize: '0.98rem' }}>
            Crop Risk Multi-Factor Comparison
          </h3>
          {cropData.length > 0 ? (
            <CropRiskComparisonChart data={cropData} height={260} />
          ) : (
            <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.86rem' }}>
              No crop comparison data available.
            </div>
          )}
        </div>

        {/* Bottom Hub Section: Recent Risk Predictions, Recent Disease Analyses, Recommended Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }} className="hub-bottom-grid">
          {/* 1. Recent Risk Predictions */}
          <div className="card" style={{ border: '1px solid var(--beige)', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} color="var(--forest-green)" />
                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest-green)', margin: 0 }}>
                  Recent Risk Predictions
                </h4>
              </div>
              <Link to="/risk-analysis" style={{ fontSize: '0.76rem', color: 'var(--olive-green)', fontWeight: 700, textDecoration: 'none' }}>
                New Run
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentPredictions.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', padding: '16px 0', textAlign: 'center' }}>
                  No recent risk predictions found.
                </div>
              ) : (
                recentPredictions.map((p) => {
                  const { bg: pBg, text: pText } = getRiskColor(p.risk_level);
                  return (
                    <div key={p.prediction_id} style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--warm-cream)',
                      border: '1px solid var(--beige)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)' }}>{p.crop} ({p.region})</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>{p.created_at?.split('T')[0] || 'Recent'}</div>
                      </div>
                      <span style={{ background: pBg, color: pText, padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>
                        {p.risk_score} / 100
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Recent Disease Analyses */}
          <div className="card" style={{ border: '1px solid var(--beige)', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color="var(--forest-green)" />
                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest-green)', margin: 0 }}>
                  Recent Disease Analyses
                </h4>
              </div>
              <Link to="/disease-detection" style={{ fontSize: '0.76rem', color: 'var(--olive-green)', fontWeight: 700, textDecoration: 'none' }}>
                Scan Leaf
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentDiseases.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', padding: '16px 0', textAlign: 'center' }}>
                  No recent disease scans found.
                </div>
              ) : (
                recentDiseases.map((d) => (
                  <div key={d.id} style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--warm-cream)',
                    border: '1px solid var(--beige)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    {d.imageUrl && (
                      <img src={d.imageUrl} alt={d.crop} style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.crop} — {d.disease}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
                        Confidence: {d.confidence}% • {d.severity} Severity
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Recommended Actions */}
          <div className="card" style={{ border: '1px solid var(--beige)', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="var(--forest-green)" />
                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest-green)', margin: 0 }}>
                  Recommended Actions
                </h4>
              </div>
              <Link to="/recommendations" style={{ fontSize: '0.76rem', color: 'var(--olive-green)', fontWeight: 700, textDecoration: 'none' }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topRecs.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', padding: '16px 0', textAlign: 'center' }}>
                  No active recommendations at this time.
                </div>
              ) : (
                topRecs.map((rec) => (
                  <div key={rec.id} style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: '#F0F7EC',
                    border: '1px solid #D4E9B8',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8
                  }}>
                    <CheckCircle2 size={14} color="var(--forest-green)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--forest-green)' }}>
                        {rec.category}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: 1.4 }}>
                        {rec.risk || rec.title}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1200px) {
          .cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .hub-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px)  {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .charts-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px)  {
          .cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
