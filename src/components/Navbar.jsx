import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// Public Navbar contains ONLY Home and About Us
const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : 'transparent'}`}
      style={{
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--forest-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(45,80,22,0.25)',
              }}
            >
              <Leaf size={19} color="#A8C97F" />
            </div>
            <span
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 800,
                fontSize: '1.25rem',
                color: scrolled ? 'var(--forest-green)' : '#FFFFFF',
                letterSpacing: '-0.02em',
                textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              AgriRisk
            </span>
          </Link>

          {/* Desktop Nav Links (ONLY Home, About Us) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hide-mobile">
            {PUBLIC_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{
                  color: scrolled ? 'var(--text-dark)' : 'rgba(255,255,255,0.95)',
                  textShadow: scrolled ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                }}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hide-mobile">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    background: 'var(--forest-green)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(45,80,22,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                >
                  <LayoutDashboard size={15} color="#A8C97F" />
                  Go to Platform
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: scrolled ? 'var(--forest-green)' : '#FFFFFF',
                    border: `1.5px solid ${scrolled ? 'var(--forest-green)' : 'rgba(255,255,255,0.6)'}`,
                    background: scrolled ? 'transparent' : 'rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: scrolled ? 'var(--forest-green)' : '#FFFFFF',
                    border: `1.5px solid ${scrolled ? 'var(--forest-green)' : 'rgba(255,255,255,0.6)'}`,
                    background: scrolled ? 'transparent' : 'rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    background: 'var(--forest-green)',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(45,80,22,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                >
                  <User size={15} />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="show-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: 'none',
              color: scrolled ? 'var(--forest-green)' : '#fff',
              padding: 8,
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              marginBottom: 14,
              padding: '12px 0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              border: '1px solid var(--beige)',
              animation: 'slideInDown 0.25s ease',
            }}
          >
            {PUBLIC_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '11px 20px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--forest-green)' : 'var(--text-dark)',
                  borderLeft: isActive ? '3px solid var(--forest-green)' : '3px solid transparent',
                  background: isActive ? 'var(--warm-cream)' : 'transparent',
                  fontSize: '0.94rem',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                })}
              >
                {link.label}
              </NavLink>
            ))}

            <div style={{ display: 'flex', gap: 10, padding: '12px 20px 6px' }}>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem', padding: '9px 14px' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Platform Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-outline"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem', padding: '9px 14px' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-outline"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem', padding: '9px 14px' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.88rem', padding: '9px 14px' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 1081px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
