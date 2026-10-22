import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Sliders, Shield, Globe, CheckCircle2, Save, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    weatherAlerts: true,
    pestRiskThreshold: 'Moderate (40%+)',
    diseaseNotification: true,
    mandiPriceAlerts: true,
    units: 'Metric (°C, mm, kg/ha, quintal)',
    language: 'English (Indian Agriculture standard)',
    autoSyncSignals: true,
    emailDigest: 'Weekly Summary',
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        background: '#FAF7F2',
        padding: '28px 28px',
        borderBottom: '1px solid var(--beige)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--pale-green)', padding: '4px 12px', borderRadius: 99, marginBottom: 10 }}>
            <SettingsIcon size={14} color="var(--forest-green)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--forest-green)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Platform Preferences
            </span>
          </div>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)', color: 'var(--forest-green)', fontWeight: 800 }}>
            Platform Settings & Alerts
          </h1>
          <p style={{ color: 'var(--text-medium)', marginTop: 4, maxWidth: 680, fontSize: '0.94rem', lineHeight: 1.55 }}>
            Configure alert sensitivities, meteorological thresholds, notification rules, and agricultural measurement units.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div className="card" style={{ border: '1px solid var(--beige)', padding: '32px 28px' }}>
          {saved && (
            <div style={{
              background: '#D4EDDA', border: '1px solid #28A745',
              borderRadius: 10, padding: '12px 16px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.86rem', color: '#1A5C2B', fontWeight: 600
            }}>
              <CheckCircle2 size={16} /> Platform preferences saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Notification & Alert Preferences */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--beige)' }}>
                <Bell size={18} color="var(--forest-green)" />
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest-green)', margin: 0 }}>
                  Field Surveillance & Alert Preferences
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  {
                    title: 'Severe Weather Early Warning',
                    desc: 'Notify when IMD radar forecasts unseasonal heavy rainfall, hail, or heatwaves within 72 hours',
                    key: 'weatherAlerts',
                  },
                  {
                    title: 'Regional Pathogen & Pest Alerts',
                    desc: 'Receive alerts when nearby districts report active stem borer, blight, or rust outbreaks',
                    key: 'diseaseNotification',
                  },
                  {
                    title: 'Wholesale Mandi Price Spikes & Dips',
                    desc: 'Daily price change notifications for selected crops in your state mandis',
                    key: 'mandiPriceAlerts',
                  },
                  {
                    title: 'Automatic Field Signal Synchronization',
                    desc: 'Automatically sync satellite soil moisture and vegetation indices in the background',
                    key: 'autoSyncSignals',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: 'var(--warm-cream)',
                      borderRadius: 10,
                      border: '1px solid var(--beige)',
                      gap: 16
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--forest-green)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-medium)', marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                      style={{ width: 20, height: 20, accentColor: 'var(--forest-green)', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Thresholds & Agronomic Configurations */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--beige)' }}>
                <Sliders size={18} color="var(--forest-green)" />
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest-green)', margin: 0 }}>
                  Sensitivity & Measurement Calibration
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                <div>
                  <label className="form-label">Pest & Disease Sensitivity Threshold</label>
                  <select
                    className="form-select"
                    value={settings.pestRiskThreshold}
                    onChange={(e) => setSettings({ ...settings, pestRiskThreshold: e.target.value })}
                  >
                    <option value="Low (20%+)">Early Warning (20%+ vector probability)</option>
                    <option value="Moderate (40%+)">Standard Advisory (40%+ vector probability)</option>
                    <option value="High (60%+)">Critical Outbreaks Only (60%+ vector probability)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Agronomic Measurement Units</label>
                  <select
                    className="form-select"
                    value={settings.units}
                    onChange={(e) => setSettings({ ...settings, units: e.target.value })}
                  >
                    <option value="Metric (°C, mm, kg/ha, quintal)">Metric (°C, mm, kg/ha, quintal)</option>
                    <option value="Imperial (°F, in, lbs/acre, bushel)">Imperial (°F, in, lbs/acre, bushel)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Platform Language</label>
                  <select
                    className="form-select"
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  >
                    <option value="English (Indian Agriculture standard)">English (Indian Agriculture standard)</option>
                    <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                    <option value="Punjabi (ਪੰਜਾਬੀ)">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                    <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
                    <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Email Digest Schedule</label>
                  <select
                    className="form-select"
                    value={settings.emailDigest}
                    onChange={(e) => setSettings({ ...settings, emailDigest: e.target.value })}
                  >
                    <option value="Daily Early Morning Brief">Daily Early Morning Brief (6:00 AM)</option>
                    <option value="Weekly Summary">Weekly Summary (Every Monday)</option>
                    <option value="Alerts Only">Critical Alerts Only</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--beige)' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '11px 26px', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Save size={16} /> Save All Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
