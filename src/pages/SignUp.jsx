import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function AuthBg({ children }) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center 30%',
        filter: 'brightness(0.45) saturate(0.8)', zIndex: 0,
      }} />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,40,10,0.55)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 480 }}>{children}</div>
    </div>
  );
}

export default function SignUp() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const { signup }            = useAuth();
  const navigate              = useNavigate();

  const validate = () => {
    if (!form.name || !form.email || !form.password) return 'Please fill in all required fields.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    try {
      await signup(form);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Account created successfully! Please sign in to access the AgriRisk platform.',
          },
        });
      }, 1400);
    } catch (e) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = pwStrength();
  const strengthColors = ['#DC3545', '#FD7E14', '#FFC107', '#28A745'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <AuthBg>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <Leaf size={22} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>AgriRisk</span>
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: 18, padding: '32px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--beige)' }}>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--forest-green)', marginBottom: 4 }}>
          Create Your Account
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.83rem', marginBottom: 22 }}>
          Join 10,000+ farmers protecting their harvest with AgriRisk
        </p>

        {error && (
          <div style={{ background: '#FFF3CD', border: '1px solid #FFC107', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8 }}>
            <AlertCircle size={14} color="#856404" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: '0.8rem', color: '#856404' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: '#D4EDDA', border: '1px solid #28A745', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8 }}>
            <CheckCircle2 size={14} color="#1A5C2B" />
            <span style={{ fontSize: '0.8rem', color: '#1A5C2B', fontWeight: 600 }}>Account created! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
            {/* Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="form-input" type="text" placeholder="Ramesh Patel"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ paddingLeft: 38 }} />
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="form-label">Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="form-input" type="email" placeholder="you@email.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ paddingLeft: 38 }} />
              </div>
            </div>
            {/* Phone */}
            <div>
              <label className="form-label">Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="form-input" type="tel" placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={{ paddingLeft: 38 }} />
              </div>
            </div>
            {/* Password */}
            <div>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingLeft: 38, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? strengthColors[strength - 1] : '#E8DCC8', transition: 'background 0.3s ease' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: strengthColors[strength - 1], marginTop: 3, fontWeight: 600 }}>
                    {strengthLabels[strength - 1]}
                  </div>
                </div>
              )}
            </div>
            {/* Confirm */}
            <div>
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="form-input" type="password" placeholder="••••••••"
                  value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  style={{ paddingLeft: 38, borderColor: form.confirm && form.confirm !== form.password ? '#DC3545' : undefined }} />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: '0.72rem', color: '#DC3545', marginTop: 4 }}>Passwords don't match</p>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '16px 0 18px', lineHeight: 1.5 }}>
            By creating an account you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--olive-green)', fontWeight: 600 }}>Terms of Service</Link>{' '}and{' '}
            <Link to="/privacy" style={{ color: 'var(--olive-green)', fontWeight: 600 }}>Privacy Policy</Link>.
          </p>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }} disabled={loading || success}>
            {loading ? 'Creating Account...' : 'Create Account'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-light)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--forest-green)', fontWeight: 700 }}>Sign In</Link>
        </p>
      </div>
    </AuthBg>
  );
}
