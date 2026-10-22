import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Map, CloudRain, Layers, Bug, TrendingUp,
  ShieldCheck, Leaf, CheckCircle2, ChevronRight,
  ShieldAlert, Sprout, BarChart3, ArrowDown
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import CropGrowthTimeline from '../components/CropGrowthTimeline';
import { useCountUp } from '../hooks/useCountUp';
import { useAuth } from '../auth/AuthContext';

// ---------- 7 Core Capabilities ----------
const CAPABILITIES = [
  {
    icon: CloudRain,
    title: 'Weather Risk',
    desc: 'Forecast extreme precipitation, heat stress, frost events, and rainfall deficits before crop damage occurs.'
  },
  {
    icon: Layers,
    title: 'Soil Risk',
    desc: 'Evaluate soil moisture reserves, N-P-K nutrient deficiencies, and pH chemical balances across field zones.'
  },
  {
    icon: Bug,
    title: 'Pest Risk',
    desc: 'Predict vector outbreaks, pest population surges, and locust swarms calibrated to meteorological humidity.'
  },
  {
    icon: ShieldAlert,
    title: 'Crop Disease Detection',
    desc: 'Identify foliar fungal and bacterial plant pathogens from leaf photos with actionable agronomic protocols.'
  },
  {
    icon: TrendingUp,
    title: 'Market Risk',
    desc: 'Track mandi wholesale commodity prices, volatility shifts, and regional market trends to optimize sale timing.'
  },
  {
    icon: Sprout,
    title: 'Production Risk',
    desc: 'Estimate harvest yield projections and identify early biological stress indicators across growth stages.'
  },
  {
    icon: ShieldCheck,
    title: 'Risk Mitigation',
    desc: 'Receive prioritized agronomic recommendations to protect crop investments and prevent financial loss.'
  },
];

// ---------- Platform Capability Metrics (Truthful Capabilities) ----------
const STATS = [
  { value: 6,   suffix: ' Dimensions', label: 'Multi-factor Risk Analysis', icon: BarChart3 },
  { value: 22,  suffix: ' Districts',  label: 'Regional Risk Mapping',      icon: Map },
  { value: 10,  suffix: '+ Protocols', label: 'Data-driven Recommendations', icon: ShieldCheck },
  { value: 14,  suffix: ' Indicators', label: 'Agronomic Metrics Evaluated', icon: Leaf },
];

function StatItem({ value, suffix, label, icon: Icon, started }) {
  const raw = useCountUp(value, 1600, started);

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{
        width: 50, height: 50, borderRadius: 14,
        background: 'var(--pale-green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
        boxShadow: '0 2px 6px rgba(45,80,22,0.1)'
      }}>
        <Icon size={22} color="var(--forest-green)" />
      </div>
      <div style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: '1.75rem', fontWeight: 800,
        color: 'var(--forest-green)', lineHeight: 1,
      }}>
        {raw}{suffix}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 6, fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

// ---------- Platform Pillars (Replaces Fake Testimonials) ----------
const PILLARS = [
  {
    title: "Multi-Factor Agronomic Model",
    desc: "Simultaneous evaluation of weather variability, soil chemistry, pest vector probabilities, and crop physiology.",
    tag: "Analytical Core"
  },
  {
    title: "Leaf Diagnostic Interface",
    desc: "Standardized image upload gateway for foliar pathology classification and recommended bio-fungicide sprays.",
    tag: "Plant Health"
  },
  {
    title: "Prescriptive Mitigation Actions",
    desc: "Actionable field advisories ranked by priority to safeguard crop yields and hedge mandi commodity revenue.",
    tag: "Decision Support"
  },
];

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); }
    }, { threshold: 0.25 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLearnMore = () => {
    document.getElementById('what-is-agririsk')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <MainLayout>
      {/* ============ HERO (Two-Column, Approved Natural Background Kept Intact) ============ */}
      <section className="hero-section" style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '80px',
        paddingBottom: '40px',
      }}>
        {/* Approved Natural Background - Optimized for instant load */}
        <div className="hero-bg" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1280&q=75&auto=format')`,
          background: `
            url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1280&q=75&auto=format') center 30% / cover no-repeat,
            linear-gradient(135deg, #1C3A0C 0%, #2D5016 40%, #4A7C2F 100%)
          `,
        }} />
        <div className="hero-overlay" style={{
          background: 'linear-gradient(105deg, rgba(20,40,10,0.82) 0%, rgba(25,48,14,0.68) 55%, rgba(30,55,15,0.2) 80%, transparent 100%)'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          padding: '0 28px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '55% 45%',
            alignItems: 'center',
            minHeight: '62vh'
          }} className="hero-two-column">
            {/* Left Column: Heading, Required Text, CTAs */}
            <div style={{ maxWidth: 660, paddingTop: '20px', paddingBottom: '20px' }}>
              <h1 className="animate-fadeInLeft" style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 'clamp(2.7rem, 4.8vw, 3.8rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.1,
                marginBottom: '24px',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                textTransform: 'uppercase'
              }}>
                PREDICT RISKS.<br />
                <span style={{ color: '#A8C97F' }}>PROTECT AGRICULTURE.</span>
              </h1>

              <p className="animate-fadeInLeft delay-200" style={{
                fontSize: '1.08rem',
                color: 'rgba(255, 255, 255, 0.92)',
                lineHeight: 1.68,
                marginBottom: '32px',
                maxWidth: 580,
                fontWeight: 500,
                textShadow: '0 1px 4px rgba(0,0,0,0.4)'
              }}>
                AgriRisk combines agricultural, environmental and market datasets with predictive analytics to identify potential risks and support smarter agricultural decisions.
              </p>

              {/* Primary & Secondary Hero CTAs */}
              <div className="animate-fadeInLeft delay-300" style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <button
                  onClick={handleGetStarted}
                  className="btn-primary"
                  style={{
                    fontSize: '1rem',
                    padding: '14px 28px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Get Started <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleLearnMore}
                  className="btn-secondary"
                  style={{
                    fontSize: '1rem',
                    padding: '14px 26px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Learn More <ArrowDown size={15} />
                </button>
              </div>

              {/* Truthful Platform Capabilities */}
              <div className="animate-fadeIn delay-400" style={{
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {['Multi-factor Risk Analysis', 'Image-based Disease Module', 'Regional Risk Mapping', 'Data-driven Recommendations'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} color="#A8C97F" />
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Natural Open Space Tag */}
            <div className="hero-right-space hide-mobile" style={{
              minHeight: '300px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              paddingBottom: '20px'
            }}>
              <div style={{
                background: 'rgba(28, 43, 14, 0.65)',
                border: '1px solid rgba(168, 201, 127, 0.3)',
                backdropFilter: 'blur(8px)',
                borderRadius: 10,
                padding: '8px 16px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Leaf size={14} color="#A8C97F" />
                Agricultural Intelligence Development Architecture
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHAT IS AGRIRISK & WHY RISK INTELLIGENCE ============ */}
      <section id="what-is-agririsk" style={{ background: '#FFFFFF', padding: '68px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'center' }} className="two-col">
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Agricultural Risk Platform
              </div>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '2rem', color: 'var(--forest-green)', marginBottom: 16, lineHeight: 1.25, fontWeight: 800 }}>
                What is AgriRisk?
              </h2>
              <p style={{ color: 'var(--text-medium)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: 16 }}>
                AgriRisk is an agricultural decision-support platform designed to help farmers, agronomists, and agricultural planners identify compounding risks throughout the crop production cycle.
              </p>
              <p style={{ color: 'var(--text-medium)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: 20 }}>
                By evaluating weather variability, soil chemistry parameters, foliar disease symptoms, and mandi price fluctuations, AgriRisk provides structured risk assessments and prioritized field mitigation actions.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/about" className="btn-outline" style={{ fontSize: '0.88rem', padding: '9px 20px', textDecoration: 'none' }}>
                  Read Our Mission <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Why Agricultural Risk Intelligence */}
            <div style={{ background: 'var(--warm-cream)', borderRadius: 16, padding: '32px', border: '1px solid var(--beige)' }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--forest-green)', marginBottom: 12 }}>
                Why Agricultural Risk Intelligence?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', lineHeight: 1.65, marginBottom: 16 }}>
                Traditional farm management often responds reactively after crop damage has occurred. Structured agricultural risk intelligence enables proactive planning:
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Assess multi-factor weather and moisture vulnerabilities',
                  'Detect foliar pathogen risks with structured action plans',
                  'Monitor district-level agricultural risk indices',
                  'Formulate prioritized agronomic mitigation steps',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                    <CheckCircle2 size={16} color="var(--olive-green)" style={{ flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ KEY CAPABILITIES (All 7 Domains) ============ */}
      <section style={{ background: 'var(--warm-cream)', padding: '68px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Core Analytical Dimensions
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.9rem', color: 'var(--forest-green)', fontWeight: 800, marginBottom: 10 }}>
              Key Platform Capabilities
            </h2>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.94rem', maxWidth: 620, margin: '0 auto' }}>
              Multi-dimensional analysis covering critical agricultural risk domains.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="card"
                  style={{
                    padding: '24px',
                    border: '1px solid var(--beige)',
                    background: '#FFFFFF',
                    borderRadius: 14,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'var(--pale-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Icon size={20} color="var(--forest-green)" />
                  </div>
                  <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest-green)', marginBottom: 8 }}>
                    {cap.title}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', lineHeight: 1.6, margin: 0 }}>
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW AGRIRISK WORKS (Pipeline) ============ */}
      <section style={{ background: '#FFFFFF', padding: '68px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Architecture Pipeline
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.9rem', color: 'var(--forest-green)', fontWeight: 800, marginBottom: 10 }}>
              How AgriRisk Works
            </h2>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.94rem', maxWidth: 600, margin: '0 auto' }}>
              From multi-parameter observation intake to actionable field mitigation protocols.
            </p>
          </div>

          {/* 5-Step Process Pipeline */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            alignItems: 'stretch'
          }} className="how-it-works-grid">
            {[
              { step: '01', title: 'INPUTS', desc: 'Agronomic observations, soil metrics, weather inputs & leaf photos' },
              { step: '02', title: 'ANALYSIS', desc: 'Metric normalization, baseline checks, and factor correlation' },
              { step: '03', title: 'EVALUATION', desc: 'Multi-factor risk engine and diagnostic image processing' },
              { step: '04', title: 'RISK SCORE', desc: 'Synthesized 0–100 risk score and category severity breakdown' },
              { step: '05', title: 'ADVISORY', desc: 'Prioritized agronomic actions to mitigate crop and market threats' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: 'var(--warm-cream)',
                  borderRadius: 14,
                  padding: '22px 16px',
                  border: '1px solid var(--beige)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--forest-green)', color: '#FFFFFF',
                    fontWeight: 800, fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    {item.step}
                  </div>
                  <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '0.92rem', color: 'var(--forest-green)', marginBottom: 8, letterSpacing: '0.04em' }}>
                    {item.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)', lineHeight: 1.5, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PLATFORM METRICS + CROP LIFECYCLE ============ */}
      <section style={{ background: 'var(--warm-cream)', padding: '68px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.6fr',
            gap: 48,
            alignItems: 'center'
          }} className="stats-grid">
            {/* Stats */}
            <div ref={statsRef}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {STATS.map((stat) => (
                  <StatItem key={stat.label} {...stat} started={statsVisible} />
                ))}
              </div>
            </div>

            {/* Crop Lifecycle Timeline */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--muted-green)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 6
                }}>
                  Growth Stage Monitoring
                </div>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.75rem', color: 'var(--forest-green)', fontWeight: 800, marginBottom: 8 }}>
                  Growing with Intelligence
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-medium)', marginBottom: 20, lineHeight: 1.6 }}>
                  Risk evaluation calibrated across every stage of the crop growth lifecycle:
                </p>
              </div>

              {/* Crop Growth Timeline Component */}
              <CropGrowthTimeline />
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLATFORM ARCHITECTURE PILLARS (Honest Overview) ============ */}
      <section style={{ background: '#FFFFFF', padding: '68px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              System Design
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.85rem', color: 'var(--forest-green)', fontWeight: 800 }}>
              Agricultural Intelligence Architecture
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="testimonials-grid">
            {PILLARS.map((p) => (
              <div key={p.title} className="card" style={{ border: '1px solid var(--beige)', padding: 26, borderRadius: 14, background: 'var(--warm-cream)' }}>
                <div style={{ display: 'inline-block', background: 'var(--pale-green)', color: 'var(--forest-green)', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                  {p.tag}
                </div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest-green)', marginBottom: 8 }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-medium)', lineHeight: 1.6, margin: 0 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section style={{ background: 'var(--forest-green)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: '#fff', fontWeight: 800, marginBottom: 12 }}>
            Start Evaluating Agricultural Risks Today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.98rem', marginBottom: 28, lineHeight: 1.65 }}>
            Access our multi-parameter risk calculation, regional risk indices, and plant leaf health diagnostics.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              background: '#fff', color: 'var(--forest-green)',
              padding: '13px 30px', borderRadius: 8,
              fontWeight: 700, fontSize: '0.95rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" style={{
              background: 'transparent', color: '#fff',
              padding: '13px 26px', borderRadius: 8,
              fontWeight: 600, fontSize: '0.95rem',
              border: '1.5px solid rgba(255,255,255,0.5)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}>
              Sign In to Platform
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hero-two-column { grid-template-columns: 1fr !important; }
          .how-it-works-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </MainLayout>
  );
}
