import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, ArrowLeft, CheckCircle2, AlertCircle, SendHorizonal } from 'lucide-react';
import { forgotPassword } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return; }
    setError(''); setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center 30%',
        filter: 'brightness(0.45) saturate(0.8)', zIndex: 0,
      }} />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,40,10,0.55)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={22} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>AgriRisk</span>
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: '36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          {!sent ? (
            <>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--pale-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Mail size={24} color="var(--olive-green)" />
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--forest-green)', marginBottom: 6 }}>
                Forgot Password?
              </h2>
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.6 }}>
                Enter your registered email address. We'll send you a secure link to reset your password.
              </p>

              {error && (
                <div style={{ background: '#FFF3CD', border: '1px solid #FFC107', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8 }}>
                  <AlertCircle size={14} color="#856404" />
                  <span style={{ fontSize: '0.8rem', color: '#856404' }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 22 }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="form-input" type="email" placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      style={{ paddingLeft: 38 }} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={loading}>
                  {loading ? 'Sending...' : <><SendHorizonal size={15} /> Send Reset Link</>}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D4EDDA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} color="#1A5C2B" />
              </div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--forest-green)', marginBottom: 10 }}>
                Email Sent!
              </h3>
              <p style={{ color: 'var(--text-medium)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 24 }}>
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 20 }}>
                Didn't receive the email?{' '}
                <button onClick={() => setSent(false)} style={{ color: 'var(--olive-green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                  Resend
                </button>
              </p>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--beige)', marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--forest-green)', fontWeight: 600 }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
