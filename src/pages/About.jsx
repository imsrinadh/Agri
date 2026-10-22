import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, ArrowRight,
  ShieldCheck, Database, CheckCircle2,
  CloudRain, Layers, Eye, AlertTriangle
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

const DATASETS = [
  {
    icon: CloudRain,
    title: 'Meteorological Intelligence',
    desc: 'Weather analytics providing daily temperature, rainfall precipitation, relative humidity, and seasonal agro-climatic projections.'
  },
  {
    icon: Layers,
    title: 'Soil Chemistry Baselines',
    desc: 'State and district-level soil data incorporating moisture retention, pH balances, and available Nitrogen, Phosphorus, and Potassium (N-P-K) profiles.'
  },
  {
    icon: Eye,
    title: 'Computer Vision Pathology',
    desc: 'Deep learning pathology architectures trained on thousands of plant leaf images to classify fungal, bacterial, and pest lesion symptoms.'
  },
  {
    icon: Database,
    title: 'Wholesale Mandi Commodity Trends',
    desc: 'Agricultural economic mandi pricing tracking modal wholesale price volatility, seasonal trends, and state-level arrival volumes.'
  }
];

const CHALLENGES = [
  {
    title: 'Erratic Monsoon & Climate Volatility',
    desc: 'Unpredictable precipitation cycles and extreme heat stress drastically impact crop germination and flowering stages.'
  },
  {
    title: 'Delayed Pest & Disease Detection',
    desc: 'Pathogen infections are frequently diagnosed too late, leading to catastrophic crop damage and yield reduction.'
  },
  {
    title: 'Soil Nutrient Imbalances',
    desc: 'Over-application or deficiency of chemical fertilizers alters soil pH and deteriorates long-term harvest quality.'
  },
  {
    title: 'Market Volatility & Price Spikes',
    desc: 'Farmers often sell produce during market dips due to lack of transparent wholesale price trend forecasts.'
  }
];

export default function About() {
  return (
    <MainLayout>
      {/* Natural Header */}
      <div style={{ background: '#FAF7F2', padding: '48px 24px 36px', borderBottom: '1px solid var(--beige)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--pale-green)', padding: '4px 14px', borderRadius: 99, marginBottom: 14 }}>
            <Leaf size={14} color="var(--forest-green)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--forest-green)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              About AgriRisk
            </span>
          </div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', color: 'var(--forest-green)', fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
            Empowering Agriculture Through Predictive Intelligence
          </h1>
          <p style={{ color: 'var(--text-medium)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 720, margin: '0 auto' }}>
            AgriRisk bridges the critical data divide for Indian agriculture by converting multi-source environmental and economic signals into preventative agronomic action.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 70px' }}>
        {/* Objective & Challenges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'center', marginBottom: 64 }} className="two-col">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Our Core Mission
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.85rem', color: 'var(--forest-green)', marginBottom: 16, lineHeight: 1.25, fontWeight: 800 }}>
              Shifting from Reactive Damage to Predictive Prevention
            </h2>
            <p style={{ color: 'var(--text-medium)', lineHeight: 1.75, marginBottom: 16, fontSize: '0.96rem' }}>
              Every cropping season, agricultural producers face compounded environmental and market risks. Traditionally, these issues are addressed only after visible damage has occurred in the field.
            </p>
            <p style={{ color: 'var(--text-medium)', lineHeight: 1.75, fontSize: '0.96rem' }}>
              <strong>Our Objective:</strong> To equip farmers, FPOs, and agricultural advisors with data-driven early warning models, actionable mitigation steps, and disease diagnosis to safeguard crop yields and farmer livelihoods.
            </p>
          </div>

          {/* Key Capabilities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: '6 Factors', desc: 'Holistic Risk Scoring', bg: 'var(--warm-cream)' },
              { label: '38 Classes', desc: 'Foliar Pathology Models', bg: 'var(--warm-cream)' },
              { label: 'Pan-India', desc: 'Regional Surveillance', bg: 'var(--warm-cream)' },
              { label: '100% Honest', desc: 'Verified Datasets', bg: 'var(--warm-cream)' },
            ].map(s => (
              <div key={s.desc} className="card" style={{ textAlign: 'center', padding: 22, border: '1px solid var(--beige)', background: s.bg, borderRadius: 14 }}>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--forest-green)' }}>{s.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Agricultural Challenges */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.8rem', color: 'var(--forest-green)', marginBottom: 8, fontWeight: 800 }}>
              The Agricultural Challenges We Address
            </h2>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.92rem', maxWidth: 600, margin: '0 auto' }}>
              Critical bottlenecks faced by Indian farmers that AgriRisk actively mitigates.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="challenges-grid">
            {CHALLENGES.map((ch) => (
              <div key={ch.title} className="card" style={{ padding: '24px', border: '1px solid var(--beige)', borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AlertTriangle size={18} color="#FD7E14" />
                  <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--forest-green)', margin: 0 }}>
                    {ch.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-medium)', lineHeight: 1.6, margin: 0 }}>
                  {ch.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How Datasets and AI/ML Work Together */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.8rem', color: 'var(--forest-green)', marginBottom: 8, fontWeight: 800 }}>
              How Multiple Datasets & AI/ML Combine
            </h2>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.92rem', maxWidth: 640, margin: '0 auto' }}>
              Multi-source data fusion powers our predictive algorithms and pathology models.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="datasets-grid">
            {DATASETS.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.title} className="card" style={{ padding: '24px', border: '1px solid var(--beige)', borderRadius: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--pale-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon size={20} color="var(--forest-green)" />
                  </div>
                  <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem', color: 'var(--forest-green)', marginBottom: 8, fontWeight: 800 }}>
                    {d.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-medium)', lineHeight: 1.65, margin: 0 }}>
                    {d.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How Recommendations Help Users */}
        <div style={{ background: 'var(--warm-cream)', borderRadius: 16, padding: '36px 32px', border: '1px solid var(--beige)', marginBottom: 50 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'center' }} className="two-col">
            <div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--forest-green)', marginBottom: 12 }}>
                How AgriRisk Recommendations Help Users
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-medium)', lineHeight: 1.7, marginBottom: 16 }}>
                Every risk score and disease analysis is accompanied by prioritized, field-tested agronomic protocols. Farmers receive clear, step-by-step guidance on:
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 0 }}>
                {[
                  'Targeted bio-fungicide and pesticide dosage schedules',
                  'Optimal irrigation timing to avoid soil waterlogging and moisture deficit',
                  'Fertilizer balance adjustments for nitrogen and potassium',
                  'Market timing suggestions based on mandi price fluctuation patterns',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--olive-green)" style={{ flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '24px', border: '1px solid var(--beige)', boxShadow: 'var(--shadow-sm)' }}>
                <ShieldCheck size={36} color="var(--forest-green)" style={{ marginBottom: 12 }} />
                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--forest-green)', marginBottom: 6 }}>
                  Actionable Agronomy
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-medium)', lineHeight: 1.5, margin: 0 }}>
                  Translating complex meteorological and pathology calculations into plain-language guidance for practical field use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ background: 'var(--forest-green)', borderRadius: 16, padding: '40px 32px', textAlign: 'center', color: '#fff' }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.5rem', marginBottom: 10 }}>
            Join the Agricultural Intelligence Network
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', marginBottom: 24, maxWidth: 540, margin: '0 auto 24px' }}>
            Create an account or sign in to access the complete AgriRisk platform and field surveillance tools.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-secondary" style={{ textDecoration: 'none', background: '#FFFFFF', color: 'var(--forest-green)' }}>
              Create Free Account <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="btn-outline" style={{ textDecoration: 'none', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.5)' }}>
              Sign In to Platform
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .two-col { grid-template-columns: 1fr !important; }
          .challenges-grid { grid-template-columns: 1fr !important; }
          .datasets-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </MainLayout>
  );
}
