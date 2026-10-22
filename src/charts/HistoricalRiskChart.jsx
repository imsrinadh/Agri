import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../utils/riskUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--beige)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6, fontSize: '0.85rem' }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-medium)' }}>{p.name}:</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function HistoricalRiskChart({ data = [], height = 300 }) {
  const bars = [
    { key: 'avg',     name: 'Average',    color: CHART_COLORS.avg },
    { key: 'weather', name: 'Weather',    color: CHART_COLORS.weather },
    { key: 'soil',    name: 'Soil',       color: CHART_COLORS.soil },
    { key: 'pest',    name: 'Pest',       color: CHART_COLORS.pest },
    { key: 'market',  name: 'Market',     color: CHART_COLORS.market },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={10}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168,201,127,0.1)' }} />
        <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 10 }} iconType="square" iconSize={8} />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={[4, 4, 0, 0]} animationDuration={1200} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
