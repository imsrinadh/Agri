import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function AuthBg({ children }) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Approved Natural Background */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center 30%',
        filter: 'brightness(0.45) saturate(0.8)',
        zIndex: 0,
      }} />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,40,10,0.55)', zIndex: 1 }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440 }}>
        {children}
      </div>
    </div>
  );
}

export default function Login() {
  const [form, setForm]       = useState({ email: 'farmer@agririsk.in', password: 'password123' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const location              = useLocation();

  // Message passed from ProtectedRoute redirect or CTA buttons
  const incomingMessage = location.state?.message;
  const redirectTarget = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      setSuccess(true);
      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBg>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--forest-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <Leaf size={22} color="#A8C97F" />
          </div>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>AgriRisk</span>
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: 6, fontWeight: 500 }}>
          Agricultural Intelligence & Risk Management Platform
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '36px 32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid var(--beige)',
      }}>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.45rem', color: 'var(--forest-green)', marginBottom: 4 }}>
          Access Platform
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: 22 }}>
          Sign in with your credentials to access protected tools
        </p>

        {/* Incoming auth requirement notification banner */}
        {incomingMessage && !error && !success && (
          <div style={{
            background: '#F0F7EC',
            border: '1px solid #D4E9B8',
            borderRadius: 10,
            padding: '11px 14px',
            marginBottom: 18,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}>
            <ShieldCheck size={16} color="var(--forest-green)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--forest-green)', fontWeight: 600, lineHeight: 1.4 }}>
              {incomingMessage}
            </span>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FFF3CD',
            border: '1px solid #FFC107',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 18,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}>
            <AlertCircle size={14} color="#856404" />
            <span style={{ fontSize: '0.82rem', color: '#856404' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: '#D4EDDA',
            border: '1px solid #28A745',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 18,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}>
            <CheckCircle2 size={14} color="#1A5C2B" />
            <span style={{ fontSize: '0.82rem', color: '#1A5C2B', fontWeight: 600 }}>
              Authentication successful! Loading AgriRisk workspace...
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-input"
                type="email"
                placeholder="farmer@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ paddingLeft: 40 }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-light)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingLeft: 40, paddingRight: 44 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute',
                  right: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-light)',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 22 }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--olive-green)', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}
            disabled={loading || success}
          >
            {loading ? 'Authenticating...' : 'Sign In to AgriRisk'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: '0.85rem', color: 'var(--text-light)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--forest-green)', fontWeight: 700 }}>
            Create Account
          </Link>
        </p>

        {/* Quick Demo Credentials Info */}
        <div style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--beige)',
          fontSize: '0.74rem',
          color: 'var(--text-light)',
          textAlign: 'center',
        }}>
          Demo Access Pre-filled: <strong>farmer@agririsk.in</strong>
        </div>
      </div>
    </AuthBg>
  );
}
