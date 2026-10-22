import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getRiskBarColor } from '../utils/riskUtils';

const LEVEL_LABEL = {
  LOW: 'Low Risk',
  MODERATE: 'Moderate Risk',
  HIGH: 'High Risk',
  CRITICAL: 'Critical Risk',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload || {};
  return (
    <div style={{ background: '#fff', border: '1px solid #E2DBD0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: 180 }}>
      <p style={{ fontWeight: 800, color: '#1C2B0E', marginBottom: 4, fontSize: '0.85rem' }}>{label}</p>
      {entry.state && <p style={{ fontSize: '0.75rem', color: '#556947', marginBottom: 3 }}>{entry.state}</p>}
      <p style={{ fontSize: '0.8rem', color: '#475569' }}>
        Risk Score: <strong style={{ color: payload[0]?.fill || '#1C2B0E' }}>{payload[0]?.value} / 100</strong>
      </p>
      {entry.level && (
        <p style={{ fontSize: '0.75rem', color: '#556947', marginTop: 2 }}>
          Level: <strong>{LEVEL_LABEL[entry.level] || entry.level}</strong>
        </p>
      )}
      {entry.avg_yield && (
        <p style={{ fontSize: '0.75rem', color: '#556947', marginTop: 2 }}>
          Avg Yield: <strong>{entry.avg_yield} t/ha</strong>
        </p>
      )}
    </div>
  );
};

export default function RegionalDistributionChart({ data = [], height = 300 }) {
  // Normalise field name: backend returns risk_score, fallback uses risk_score too
  const normalised = data.map(d => ({
    ...d,
    score: d.risk_score ?? d.score ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={normalised} margin={{ top: 10, right: 10, left: -20, bottom: 40 }} barSize={22}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
        <XAxis
          dataKey="region"
          tick={{ fontSize: 10, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168,201,127,0.10)' }} />
        <Bar dataKey="score" name="Risk Score" radius={[5, 5, 0, 0]} animationDuration={1000}>
          {normalised.map((entry, index) => (
            <Cell key={`${entry.region}-${index}`} fill={getRiskBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
