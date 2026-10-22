import React, { useState, useEffect } from 'react';
import { User, MapPin, Sprout, ShieldCheck, Calendar, CheckCircle2, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getUserProfile, updateUserProfile, updateUserDetails } from '../services/userApi';

export default function Profile() {
  const { user, updateUserState } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || 'Demo Account (Development)',
    email: user?.email || 'farmer@agririsk.in',
    phone: '+91 98765 43210',
    region: 'Punjab (North-West Agro-Zone)',
    district: 'Ludhiana',
    preferredCrop: 'Wheat & Rice Rotational',
    farmSize: '12.5 Hectares',
    soilType: 'Alluvial Loam (pH 6.8)',
    irrigationType: 'Canal & Tube Well Sourced',
    memberSince: 'March 2024',
    kvkCenter: 'KVK Ludhiana Central',
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await getUserProfile();
        setProfile(prev => ({
          ...prev,
          name: user?.name || prev.name,
          email: user?.email || prev.email,
          region: p.region || prev.region,
          preferredCrop: p.preferred_crop || prev.preferredCrop,
          phone: p.phone || prev.phone,
        }));
      } catch (err) {
        console.error('Failed to load profile from backend:', err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Update basic user details
      if (profile.name !== user?.name) {
        await updateUserDetails({ name: profile.name });
      }

      // 2. Update agricultural profile
      await updateUserProfile({
        region: profile.region,
        preferred_crop: profile.preferredCrop,
        season: 'Kharif',
        phone: profile.phone,
      });

      updateUserState({ name: profile.name, region: profile.region, preferred_crop: profile.preferredCrop });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        background: '#FAF7F2',
        padding: '28px 28px',
        borderBottom: '1px solid var(--beige)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--pale-green)', padding: '4px 12px', borderRadius: 99, marginBottom: 10 }}>
            <User size={14} color="var(--forest-green)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--forest-green)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Account & Farm Profile
            </span>
          </div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)', color: 'var(--forest-green)', fontWeight: 800 }}>
            Farm Producer Profile
          </h1>
          <p style={{ color: 'var(--text-medium)', marginTop: 4, maxWidth: 680, fontSize: '0.94rem', lineHeight: 1.55 }}>
            Manage your personal credentials, farm characteristics, soil classifications, and preferred cropping cycles.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: 28 }} className="profile-grid">
          {/* Left Summary Card */}
          <div>
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px', border: '1px solid var(--beige)', marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #A8C97F 0%, #355E22 100%)',
                color: '#FFFFFF', fontWeight: 800, fontSize: '1.6rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', boxShadow: '0 4px 14px rgba(45,80,22,0.25)'
              }}>
                {(profile.name || 'FD').slice(0, 2).toUpperCase()}
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--forest-green)', marginBottom: 4 }}>
                {profile.name}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-light)', marginBottom: 16 }}>
                {profile.email}
              </p>
              <div style={{ display: 'inline-block', background: 'var(--pale-green)', color: 'var(--forest-green)', padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
                Verified Agricultural Producer
              </div>

              <div style={{ borderTop: '1px solid var(--beige)', marginTop: 20, paddingTop: 16, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-medium)', marginBottom: 10 }}>
                  <MapPin size={15} color="var(--olive-green)" />
                  <span>{profile.region}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-medium)', marginBottom: 10 }}>
                  <Sprout size={15} color="var(--olive-green)" />
                  <span>{profile.preferredCrop}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-medium)' }}>
                  <Calendar size={15} color="var(--olive-green)" />
                  <span>Member Since: {profile.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Farm Verification Badge Card */}
            <div className="card" style={{ background: '#F0F7EC', border: '1px solid #D4E9B8', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={18} color="var(--forest-green)" />
                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '0.92rem', color: 'var(--forest-green)', margin: 0 }}>
                  Field Surveillance Linked
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.5, margin: 0 }}>
                Your agricultural profile parameters calibrate localized baseline calculations for soil, crop rotation, and seasonal weather patterns.
              </p>
            </div>
          </div>

          {/* Right Edit Form */}
          <div>
            <div className="card" style={{ border: '1px solid var(--beige)', padding: '32px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--beige)' }}>
                <div>
                  <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--forest-green)', margin: 0 }}>
                    Edit Profile & Farm Parameters
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', margin: '4px 0 0' }}>
                    Update your field details to calibrate localized risk models
                  </p>
                </div>
              </div>

              {error && (
                <div style={{
                  background: '#FFF3CD', border: '1px solid #FFC107',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: '0.86rem', color: '#856404'
                }}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {saved && (
                <div style={{
                  background: '#D4EDDA', border: '1px solid #28A745',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: '0.86rem', color: '#1A5C2B', fontWeight: 600
                }}>
                  <CheckCircle2 size={16} /> Profile parameters updated successfully!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.9rem', color: 'var(--olive-green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  Personal Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px', marginBottom: 24 }}>
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      value={profile.email}
                      disabled
                      style={{ background: 'var(--warm-cream)', opacity: 0.8 }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input
                      className="form-input"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Affiliated KVK Center</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.kvkCenter}
                      onChange={(e) => setProfile({ ...profile, kvkCenter: e.target.value })}
                    />
                  </div>
                </div>

                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.9rem', color: 'var(--olive-green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  Farm Characteristics
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px', marginBottom: 28 }}>
                  <div>
                    <label className="form-label">State / Agro-Zone</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.region}
                      onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">District / Tehsil</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.district}
                      onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Total Land Holding</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.farmSize}
                      onChange={(e) => setProfile({ ...profile, farmSize: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Primary Crop Rotation</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.preferredCrop}
                      onChange={(e) => setProfile({ ...profile, preferredCrop: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Soil Classification</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.soilType}
                      onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Irrigation System</label>
                    <input
                      className="form-input"
                      type="text"
                      value={profile.irrigationType}
                      onChange={(e) => setProfile({ ...profile, irrigationType: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ padding: '11px 24px', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
