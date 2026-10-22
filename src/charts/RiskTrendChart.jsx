import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { CHART_COLORS } from '../utils/riskUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--beige)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6, fontSize: '0.85rem' }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-medium)' }}>{p.name}:</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function RiskTrendChart({ data = [], height = 300 }) {
  const lines = [
    { key: 'weather',    name: 'Weather',    color: CHART_COLORS.weather },
    { key: 'soil',       name: 'Soil',       color: CHART_COLORS.soil },
    { key: 'pest',       name: 'Pest',       color: CHART_COLORS.pest },
    { key: 'market',     name: 'Market',     color: CHART_COLORS.market },
    { key: 'production', name: 'Production', color: CHART_COLORS.production },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {lines.map(l => (
            <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={l.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={l.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.78rem', paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
        {lines.map(l => (
          <Area
            key={l.key} type="monotone"
            dataKey={l.key} name={l.name}
            stroke={l.color} strokeWidth={2}
            fill={`url(#grad-${l.key})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            animationDuration={1200}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
