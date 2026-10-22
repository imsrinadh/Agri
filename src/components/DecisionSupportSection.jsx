import React from 'react';
import {
  ShieldAlert, CloudRain, Layers, Bug, TrendingUp,
  Sprout, ShieldCheck, AlertTriangle, Info, CheckCircle2,
  HelpCircle, ExternalLink, Activity, ArrowRight
} from 'lucide-react';
import Button from './Button';

export default function DecisionSupportSection({ data, onReassess }) {
  if (!data) return null;

  const {
    risk_score,
    risk_level,
    risk_summary,
    why_explanation,
    top_risk_factors = [],
    risk_dimensions = {},
    yield_assessment = {},
    disease_assessment = {},
    market_assessment = {},
    recommendations = [],
    farmer_protection = {},
    data_freshness = {},
    harvest_data_status,
    year_2026_advisory,
    decision_support_disclaimer
  } = data;

  const getBadgeStyle = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'MODERATE':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'HIGH':
        return { bg: '#FED7AA', text: '#C2410C', border: '#FDBA74' };
      case 'CRITICAL':
      default:
        return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'IMMEDIATE_ATTENTION':
        return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: 'Immediate Attention' };
      case 'MONITOR':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', label: 'Monitor Closely' };
      case 'CONSIDER':
        return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', label: 'Consider Action' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', label: 'General Guidance' };
    }
  };

  const mainBadge = getBadgeStyle(risk_level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
      
      {/* 1. TOP RISK ASSESSMENT BANNER */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 28px',
        border: `1px solid ${mainBadge.border}`,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{
                background: mainBadge.bg,
                color: mainBadge.text,
                border: `1px solid ${mainBadge.border}`,
                padding: '4px 10px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase'
              }}>
                {risk_level} Risk • Score: {risk_score}/100
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>
                Data Status: {harvest_data_status || 'PROVISIONAL'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--forest-green)', margin: '4px 0 8px 0' }}>
              Farmer Decision Support Assessment
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
              {risk_summary}
            </p>
          </div>
          {onReassess && (
            <Button variant="outline" size="sm" onClick={onReassess}>
              Reassess Farm
            </Button>
          )}
        </div>

        {/* Why this result? */}
        <div style={{
          marginTop: 18,
          padding: '12px 16px',
          background: '#F9FAFB',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
          fontSize: '0.84rem',
          color: '#374151',
          lineHeight: 1.5
        }}>
          <strong>Why this rating?</strong> {why_explanation}
        </div>
      </div>

      {/* 2. GRID: EXPECTED YIELD & KEY RISK FACTORS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        
        {/* Expected Yield Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--beige)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sprout size={18} color="var(--forest-green)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-green)', margin: 0 }}>
              Expected Yield & Range
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest-green)' }}>
              {yield_assessment.expected_yield != null ? yield_assessment.expected_yield : '—'}
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-light)', fontWeight: 600 }}>
              {yield_assessment.unit || 'tonnes/hectare'}
            </span>
          </div>

          <div style={{
            background: '#F8FAF5',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 12,
            fontSize: '0.82rem',
            color: '#4B5563'
          }}>
            <div>
              <strong>Calibrated Prediction Range:</strong>{' '}
              {yield_assessment.prediction_range_lower != null
                ? `${yield_assessment.prediction_range_lower} – ${yield_assessment.prediction_range_upper} t/ha`
                : 'Limited'}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>Uncertainty Status:</strong> {yield_assessment.uncertainty_status || 'LIMITED'}
            </div>
          </div>

          <div style={{ fontSize: '0.76rem', color: '#6B7280', fontStyle: 'italic' }}>
            Model: AGRIRISK_ML_v1.0 (Ridge α=10.0, 2012–2023 ground truth)
          </div>
        </div>

        {/* Top 3 Risk Factors Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--beige)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <ShieldAlert size={18} color="#C2410C" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-green)', margin: 0 }}>
              Top Contributing Risk Factors
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top_risk_factors.map((f, i) => {
              const b = getBadgeStyle(f.level);
              return (
                <div key={i} style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1F2937' }}>
                      {f.factor}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                      {f.impact_summary}
                    </div>
                  </div>
                  <span style={{
                    background: b.bg,
                    color: b.text,
                    border: `1px solid ${b.border}`,
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}>
                    {f.score}/100
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. GRID: DISEASE SCAN & MARKET OUTLOOK */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        
        {/* Disease Analysis Integration */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--beige)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={18} color="var(--forest-green)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-green)', margin: 0 }}>
              Crop Foliar Pathology
            </h3>
          </div>

          {disease_assessment.status === 'AVAILABLE' ? (
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-green)', marginBottom: 6 }}>
                {disease_assessment.disease_detected}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: '0.74rem', background: '#F3F4F6', padding: '3px 8px', borderRadius: 4 }}>
                  Confidence: <strong>{disease_assessment.model_confidence ? `${Math.round(disease_assessment.model_confidence * 100)}%` : '—'}</strong>
                </span>
                <span style={{ fontSize: '0.74rem', background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: 4 }}>
                  Deployment: Limited
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
                {disease_assessment.disclaimer}
              </p>
            </div>
          ) : (
            <div style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, fontSize: '0.82rem', color: '#6B7280' }}>
              {disease_assessment.disclaimer || 'No recent leaf image uploaded for automated foliar screening.'}
            </div>
          )}
        </div>

        {/* Market Outlook & Revenue Scenarios */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--beige)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={18} color="var(--forest-green)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--forest-green)', margin: 0 }}>
              Verified Mandi Market Outlook
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--forest-green)' }}>
                ₹{market_assessment.modal_price_rs_per_quintal || '—'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}> / quintal</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>
              Year: {market_assessment.data_year || '2025'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, background: '#F9FAFB', padding: '6px 10px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Conservative</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{market_assessment.conservative_revenue || '—'}</div>
            </div>
            <div style={{ flex: 1, background: '#F0FDF4', padding: '6px 10px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#166534' }}>Expected</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>{market_assessment.expected_revenue || '—'}</div>
            </div>
            <div style={{ flex: 1, background: '#F9FAFB', padding: '6px 10px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Optimistic</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{market_assessment.optimistic_revenue || '—'}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#9CA3AF', fontStyle: 'italic' }}>
            * Net profit estimate unavailable without verified variable input expenses.
          </div>
        </div>

      </div>

      {/* 4. PRIORITIZED ACTIONABLE RECOMMENDATIONS */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid var(--beige)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={18} color="var(--forest-green)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--forest-green)', margin: 0 }}>
            What You Should Consider (Ranked Action Plan)
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recommendations.map((rec, i) => {
            const p = getPriorityStyle(rec.priority);
            return (
              <div key={i} style={{
                padding: '14px 16px',
                borderRadius: 10,
                border: `1px solid ${p.border}`,
                background: '#FAFAFA',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start'
              }}>
                <span style={{
                  background: p.bg,
                  color: p.text,
                  border: `1px solid ${p.border}`,
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  marginTop: 2
                }}>
                  {p.label}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--forest-green)', marginBottom: 2 }}>
                    {rec.action}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.5 }}>
                    {rec.guidance}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. FARMER PROTECTION & PMFBY PATHWAYS */}
      <div style={{
        background: '#F0FDF4',
        borderRadius: 16,
        padding: '20px 24px',
        border: '1px solid #BBF7D0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ShieldCheck size={18} color="#16A34A" />
          <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#166534', margin: 0 }}>
            Farmer Protection & Official Crop Insurance Pathways
          </h4>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#166534', margin: '0 0 12px 0', lineHeight: 1.5 }}>
          {farmer_protection.coverage_type || 'Comprehensive yield loss and localized calamity risk coverage under PMFBY.'}
          <br />
          <strong>Claim Window:</strong> {farmer_protection.claim_reporting_window}
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href={farmer_protection.official_portal_url || "https://pmfby.gov.in"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#16A34A',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Visit PMFBY Portal <ExternalLink size={13} />
          </a>
          <span style={{ fontSize: '0.78rem', color: '#166534' }}>
            Toll-Free Helpline: <strong>{farmer_protection.toll_free_helpline}</strong>
          </span>
        </div>
      </div>

      {/* 6. 2026 ADVISORY & DATA FRESHNESS NOTICE */}
      {year_2026_advisory && (
        <div style={{
          background: '#FEF3C7',
          borderRadius: 10,
          padding: '12px 16px',
          border: '1px solid #FDE68A',
          fontSize: '0.8rem',
          color: '#92400E',
          display: 'flex',
          gap: 8,
          alignItems: 'start'
        }}>
          <AlertTriangle size={16} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{year_2026_advisory}</span>
        </div>
      )}

      {/* 7. MANDATORY DECISION SUPPORT DISCLAIMER */}
      <div style={{
        background: '#F9FAFB',
        borderRadius: 10,
        padding: '12px 16px',
        border: '1px solid #E5E7EB',
        fontSize: '0.78rem',
        color: '#6B7280',
        lineHeight: 1.5,
        display: 'flex',
        gap: 8,
        alignItems: 'start'
      }}>
        <Info size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />
        <span>{decision_support_disclaimer}</span>
      </div>

    </div>
  );
}
