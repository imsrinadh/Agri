import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer style={{ background: 'var(--forest-green)', color: '#fff' }}>
      {/* Main Footer */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}
          className="footer-grid">
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={19} color="#A8C97F" />
              </div>
              <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>AgriRisk</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 320, marginBottom: 16 }}>
              AgriRisk combines agricultural, environmental, and market data to identify potential risks early and support smarter agricultural decisions across India.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 20 }}>
              "Predict Risks. Protect Agriculture."
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link to="/" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Home</Link></li>
              <li><Link to="/about" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>About Us</Link></li>
              {isAuthenticated ? (
                <li><Link to="/dashboard" style={{ fontSize: '0.88rem', color: '#A8C97F', fontWeight: 700, textDecoration: 'none' }}>Go to Platform</Link></li>
              ) : (
                <>
                  <li><Link to="/login" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Login</Link></li>
                  <li><Link to="/signup" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Sign Up</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Intelligence Capabilities */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
              Capabilities
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)' }}>
              <li>Weather Risk Modeling</li>
              <li>Soil Nutrient Deficits</li>
              <li>Crop Disease Detection</li>
              <li>Pest Vector Prediction</li>
              <li>Mandi Market Trends</li>
              <li>Agronomic Mitigation</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} AgriRisk. Built for precision agricultural risk management.
          </p>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
            Serving Indian agriculture across 28 states
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </footer>
  );
}
