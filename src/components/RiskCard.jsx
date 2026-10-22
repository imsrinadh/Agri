import { getRiskColor } from '../utils/riskUtils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function RiskCard({ label, score, level, desc, icon: Icon, trend, compact = false }) {
  const { bg, text, bar } = getRiskColor(level);

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? '#DC3545' : trend < 0 ? '#28A745' : '#6B9E3F';

  return (
    <div className="card" style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: compact ? 10 : 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${bar}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icon && <Icon size={22} color={bar} />}
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendIcon size={14} color={trendColor} />
            <span style={{ fontSize: '0.78rem', color: trendColor, fontWeight: 600 }}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>

      <div style={{ fontWeight: 700, fontSize: '1.8rem', color: 'var(--forest-green)', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
        {score}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 2, marginBottom: 8 }}>out of 100</div>

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-medium)', marginBottom: 8 }}>{label}</div>

      {desc && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 10 }}>{desc}</div>
      )}

      {/* Mini progress bar */}
      <div className="risk-bar-track" style={{ height: 5 }}>
        <div style={{ height: '100%', width: `${score}%`, background: bar, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>

      <div style={{ marginTop: 8 }}>
        <span className="risk-badge" style={{ background: bg, color: text }}>
          {level}
        </span>
      </div>
    </div>
  );
}
