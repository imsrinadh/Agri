import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RADAR_COLORS = ['#4A7C2F', '#8B6914', '#FD7E14', '#6B9E3F', '#2D5016', '#C4A44A'];

export default function CropRiskComparisonChart({ data = [], height = 300, selectedCrops = [] }) {
  // Transform data to radar format
  const categories = ['weather', 'soil', 'pest', 'market'];
  const catLabels  = { weather: 'Weather', soil: 'Soil', pest: 'Pest', market: 'Market' };

  const radarData = categories.map(cat => ({
    subject: catLabels[cat],
    ...Object.fromEntries(
      data
        .filter(d => !selectedCrops.length || selectedCrops.includes(d.crop))
        .map(d => [d.crop, d[cat]])
    ),
  }));

  const crops = data
    .filter(d => !selectedCrops.length || selectedCrops.includes(d.crop))
    .map(d => d.crop);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#E8DCC8" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-medium)', fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid var(--beige)', borderRadius: 10, fontSize: '0.8rem' }}
        />
        <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 10 }} iconType="circle" iconSize={8} />
        {crops.map((crop, i) => (
          <Radar
            key={crop} name={crop} dataKey={crop}
            stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
            fill={RADAR_COLORS[i % RADAR_COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
