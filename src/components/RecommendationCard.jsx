import React from 'react';
import { getPriorityStyle } from '../utils/riskUtils';
import {
  CloudRain, Layers, Bug, Droplets, TrendingDown,
  Sprout, Leaf, CloudLightning, ShieldCheck, ShieldAlert, CheckCircle2,
  FlaskConical, Landmark, Clock
} from 'lucide-react';

const ICON_MAP = {
  'cloud-rain': CloudRain,
  'layers': Layers,
  'bug': Bug,
  'droplets': Droplets,
  'trending-down': TrendingDown,
  'sprout': Sprout,
  'leaf': Leaf,
  'cloud-lightning': CloudLightning,
  'shield-alert': ShieldAlert,
};

const CATEGORY_COLORS = {
  'Weather Protection': '#4A7C2F',
  'Soil Management':    '#8B6914',
  'Pest Management':    '#C05621',
  'Disease Management': '#B04A26',
  'Water Management':   '#0077B6',
  'Market Planning':    '#6B9E3F',
  'Production Management': '#2D5016',
};

export default function RecommendationCard({ recommendation }) {
  const {
    category, priority, risk, reason, action, benefit, icon,
    dosage, chemical_active, organic_alternative, spray_timing, scheme_support
  } = recommendation;
  const { bg, text, dot } = getPriorityStyle(priority);
  const Icon = ICON_MAP[icon] || Leaf;
  const catColor = CATEGORY_COLORS[category] || '#4A7C2F';

  return (
    <div className="card" style={{
      borderLeft: `5px solid ${catColor}`,
      border: '1px solid var(--beige)',
      borderLeftWidth: 5,
      padding: '22px',
      borderRadius: 14,
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 14
    }}>
      <div>
        {/* Top bar: Category + Priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: `${catColor}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={catColor} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: catColor }}>
              {category}
            </span>
          </div>

          <span style={{
            background: bg, color: text,
            padding: '3px 10px', borderRadius: 99,
            fontSize: '0.72rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
            {priority} Priority
          </span>
        </div>

        {/* Risk Title */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Risk Factor & Field Indicator
          </div>
          <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-dark)', marginTop: 2, lineHeight: 1.35 }}>
            {risk}
          </h4>
        </div>

        {/* Reason */}
        <div style={{ background: 'var(--warm-cream)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, border: '1px solid var(--beige)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
            Agronomic Rationale & Diagnosis
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', lineHeight: 1.55, margin: 0 }}>
            {reason}
          </p>
        </div>

        {/* Recommended Action */}
        <div style={{ background: '#F0F7EC', borderRadius: 8, padding: '12px 14px', border: '1px solid #D4E9B8' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={13} color="var(--olive-green)" /> Recommended Scientific Protocol
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-dark)', lineHeight: 1.55, fontWeight: 600, margin: 0 }}>
            {action}
          </p>
        </div>

        {/* Scientific Chemical / Fertilizer Dosage */}
        {dosage && (
          <div style={{ marginTop: 10, background: '#F8FAFC', borderRadius: 8, padding: '10px 14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FlaskConical size={13} color="#0284C7" /> Precision Scientific Dosage
            </div>
            <div style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 600 }}>
              {dosage}
            </div>
            {spray_timing && (
              <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <Clock size={12} color="#64748B" /> <strong>Timing:</strong> {spray_timing}
              </div>
            )}
          </div>
        )}

        {/* Biological / Organic Alternative */}
        {organic_alternative && (
          <div style={{ marginTop: 8, background: '#F0FDF4', borderRadius: 8, padding: '10px 14px', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sprout size={13} color="#16A34A" /> Organic / Biological Protocol
            </div>
            <div style={{ fontSize: '0.81rem', color: '#14532D', fontWeight: 500 }}>
              {organic_alternative}
            </div>
          </div>
        )}

        {/* Government Scheme Support */}
        {scheme_support && (
          <div style={{ marginTop: 8, background: '#FEF3C7', borderRadius: 8, padding: '9px 13px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Landmark size={15} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.76rem', color: '#92400E', lineHeight: 1.45 }}>
              <strong style={{ color: '#78350F' }}>Government Scheme & Subsidy:</strong> {scheme_support}
            </div>
          </div>
        )}
      </div>

      {/* Expected Benefit Footer */}
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--beige)', display: 'flex', alignItems: 'center', gap: 7 }}>
        <ShieldCheck size={16} color="var(--forest-green)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--forest-green)', fontWeight: 600 }}>
          <strong>Expected Yield Benefit:</strong> {benefit}
        </span>
      </div>
    </div>
  );
}
