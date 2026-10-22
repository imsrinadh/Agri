import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  User,
  LogOut,
  Settings,
  ShieldAlert,
  BarChart3,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const ROUTE_TITLES = {
  '/dashboard': { title: 'Agricultural Risk Overview', section: 'Main Hub' },
  '/risk-analysis': { title: 'Agricultural Risk Analysis', section: 'Analysis' },
  '/disease-detection': { title: 'Crop Disease Detection', section: 'Analysis' },
  '/regions': { title: 'Regional Agricultural Risk', section: 'Analysis' },
  '/insights': { title: 'Agricultural Insights', section: 'Insights' },
  '/recommendations': { title: 'Recommended Actions', section: 'Insights' },
  '/profile': { title: 'Farm Producer Profile', section: 'Account' },
  '/settings': { title: 'Platform Settings', section: 'Account' },
};

export default function AppHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const routeInfo = ROUTE_TITLES[location.pathname] || {
    title: 'AgriRisk Platform',
    section: 'Intelligence',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      style={{
        height: 68,
        background: '#FAF7F2',
        borderBottom: '1px solid var(--beige)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 1px 4px rgba(45, 80, 22, 0.03)',
      }}
    >
      {/* Left: Mobile Toggle & Page Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onToggleSidebar}
          className="header-mobile-toggle"
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--beige)',
            borderRadius: 8,
            padding: '7px 9px',
            color: 'var(--forest-green)',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={19} />
        </button>

        <div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--muted-green)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {routeInfo.section}
          </div>
          <h2
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              fontSize: '1.08rem',
              color: 'var(--forest-green)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {routeInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Field Actions & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Quick Tool Links */}
        <div className="header-quick-links" style={{ display: 'flex', gap: 8 }}>
          <Link
            to="/disease-detection"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              borderRadius: 8,
              background: 'var(--pale-green)',
              color: 'var(--forest-green)',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
              border: '1px solid rgba(45, 80, 22, 0.15)',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldAlert size={14} color="var(--forest-green)" />
            Scan Leaf
          </Link>
          <Link
            to="/risk-analysis"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              borderRadius: 8,
              background: 'var(--forest-green)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 6px rgba(45, 80, 22, 0.18)',
            }}
          >
            <BarChart3 size={14} color="#A8C97F" />
            Analyze Risk
          </Link>
        </div>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              border: '1px solid var(--beige)',
              borderRadius: 99,
              padding: '4px 10px 4px 4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--forest-green)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AG'}
            </div>
            <div className="header-user-name" style={{ textAlign: 'left', marginRight: 4 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--forest-green)', lineHeight: 1.1 }}>
                {user?.name || 'Demo Account (Development)'}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-medium)" />
          </button>

          {/* Menu Dropdown */}
          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 60 }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: 220,
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid var(--beige)',
                  boxShadow: '0 10px 30px rgba(45, 80, 22, 0.12)',
                  padding: '8px 0',
                  zIndex: 70,
                  animation: 'slideInDown 0.18s ease',
                }}
              >
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--beige)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest-green)' }}>
                    {user?.name || 'Demo Account (Development)'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-light)', marginTop: 2 }}>
                    {user?.email || 'farmer@agririsk.in'}
                  </div>
                </div>

                <div style={{ padding: '6px 0' }}>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.84rem',
                      color: 'var(--text-dark)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--warm-cream)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <User size={15} color="var(--text-medium)" /> Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.84rem',
                      color: 'var(--text-dark)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--warm-cream)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Settings size={15} color="var(--text-medium)" /> Settings
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.84rem',
                      color: 'var(--text-dark)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--warm-cream)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <ExternalLink size={15} color="var(--text-medium)" /> Public Home
                  </Link>
                </div>

                <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 6 }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'none',
                      border: 'none',
                      fontSize: '0.84rem',
                      color: '#C0392B',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF5F5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <LogOut size={15} color="#C0392B" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .header-mobile-toggle {
            display: flex !important;
          }
        }
        @media (max-width: 860px) {
          .header-quick-links { display: none !important; }
        }
        @media (max-width: 600px) {
          .header-weather-chip { display: none !important; }
          .header-user-name { display: none !important; }
        }
      `}</style>
    </header>
  );
}
