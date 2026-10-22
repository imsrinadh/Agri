import React from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ShieldAlert,
  MapPin,
  TrendingUp,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  X,
  Sprout,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const NAV_SECTIONS = [
  {
    heading: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    heading: 'ANALYSIS & ML',
    items: [
      { to: '/risk-analysis', label: 'Risk Analysis', icon: BarChart3 },
      { to: '/disease-detection', label: 'Disease Detection', icon: ShieldAlert },
    ],
  },
  {
    heading: 'REGIONAL INTELLIGENCE',
    items: [
      { to: '/regions', label: 'Regional Risk', icon: MapPin },
    ],
  },
  {
    heading: 'PROTECTION & SCHEMES',
    items: [
      { to: '/farmer-protection', label: 'Farmer Protection', icon: ShieldCheck },
    ],
  },
  {
    heading: 'INSIGHTS & ACTION',
    items: [
      { to: '/insights', label: 'Insights', icon: TrendingUp },
      { to: '/recommendations', label: 'Recommendations', icon: ShieldCheck },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AppSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(28, 43, 14, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 40,
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: 256,
          background: '#233E17',
          color: '#F5F0E8',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(232, 220, 200, 0.12)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.25s ease-in-out',
          boxShadow: '2px 0 16px rgba(28, 43, 14, 0.15)',
        }}
        className={`app-sidebar ${mobileOpen ? 'mobile-open' : 'mobile-closed'}`}
      >
        {/* Brand Header: 🌱 AgriRisk */}
        <div
          style={{
            height: 72,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(232, 220, 200, 0.12)',
            background: 'rgba(0, 0, 0, 0.12)',
          }}
        >
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ fontSize: '1.4rem' }}>🌱</span>
            <div>
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.01em',
                  color: '#FFFFFF',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                AgriRisk
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#A8C97F',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                Field Intelligence Platform
              </span>
            </div>
          </Link>

          {/* Close button ONLY on mobile */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: 6,
              color: '#FFFFFF',
              padding: 6,
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Season & Agro Zone Tag */}
        <div style={{ padding: '14px 16px 6px' }}>
          <div
            style={{
              background: 'rgba(53, 94, 34, 0.5)',
              border: '1px solid rgba(168, 201, 127, 0.2)',
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sprout size={15} color="#A8C97F" />
            <div style={{ fontSize: '0.74rem', color: '#E8F2DD', fontWeight: 600 }}>
              Live Season: Kharif / Rabi
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.heading}>
              <div
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: 'rgba(232, 220, 200, 0.65)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px 6px',
                }}
              >
                {section.heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        borderRadius: 8,
                        color: isActive ? '#FFFFFF' : 'rgba(245, 240, 232, 0.82)',
                        background: isActive ? '#355E22' : 'transparent',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.86rem',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        borderLeft: isActive ? '3px solid #A8C97F' : '3px solid transparent',
                        boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'rgba(245, 240, 232, 0.82)';
                        }
                      }}
                    >
                      <Icon
                        size={17}
                        color={isActive ? '#A8C97F' : 'rgba(232, 220, 200, 0.7)'}
                      />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div style={{ paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                color: '#FFE2E2',
                background: 'rgba(220, 53, 69, 0.15)',
                fontWeight: 600,
                fontSize: '0.86rem',
                border: '1px solid rgba(220, 53, 69, 0.25)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.28)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.15)';
                e.currentTarget.style.color = '#FFE2E2';
              }}
            >
              <LogOut size={17} color="#FFE2E2" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* User Card Bottom Strip */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(232, 220, 200, 0.12)',
            background: 'rgba(0, 0, 0, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#A8C97F',
                color: '#1C3310',
                fontWeight: 800,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AG'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Demo Account (Development)'}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'rgba(232, 220, 200, 0.65)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email || 'farmer@agririsk.in'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .app-sidebar.mobile-closed {
            transform: translateX(-100%);
          }
          .app-sidebar.mobile-open {
            transform: translateX(0);
          }
          .sidebar-close-btn {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          .app-sidebar {
            transform: translateX(0) !important;
          }
          .sidebar-backdrop {
            display: none !important;
          }
          .sidebar-close-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
