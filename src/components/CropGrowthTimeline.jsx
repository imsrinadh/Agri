// Crop growth timeline with animated SVG crops
export default function CropGrowthTimeline() {
  const stages = [
    {
      label: 'Sowing',
      description: 'Seeds planted',
      svg: (
        <svg width="40" height="55" viewBox="0 0 40 55" fill="none">
          {/* Soil mound */}
          <ellipse cx="20" cy="48" rx="16" ry="5" fill="#C4A44A" opacity="0.5"/>
          {/* Small seed sprout */}
          <circle cx="20" cy="40" r="4" fill="#8B6914" opacity="0.7"/>
          <path d="M20 36 Q22 30 26 28" stroke="#6B9E3F" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <ellipse cx="27" cy="27" rx="5" ry="3" fill="#A8C97F" transform="rotate(-30 27 27)"/>
        </svg>
      )
    },
    {
      label: 'Germination',
      description: 'First sprouts',
      svg: (
        <svg width="40" height="65" viewBox="0 0 40 65" fill="none">
          <ellipse cx="20" cy="58" rx="16" ry="5" fill="#C4A44A" opacity="0.5"/>
          {/* Stem */}
          <path d="M20 56 L20 35" stroke="#4A7C2F" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Two leaves */}
          <path d="M20 48 Q10 42 8 35" stroke="#6B9E3F" strokeWidth="1.5" fill="none"/>
          <ellipse cx="12" cy="40" rx="7" ry="4" fill="#A8C97F" transform="rotate(-30 12 40)"/>
          <path d="M20 44 Q30 38 32 31" stroke="#6B9E3F" strokeWidth="1.5" fill="none"/>
          <ellipse cx="28" cy="36" rx="7" ry="4" fill="#A8C97F" transform="rotate(30 28 36)"/>
          {/* Top bud */}
          <ellipse cx="20" cy="33" rx="3" ry="4" fill="#6B9E3F"/>
        </svg>
      )
    },
    {
      label: 'Growth',
      description: 'Rapid growth phase',
      svg: (
        <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
          <ellipse cx="20" cy="73" rx="16" ry="5" fill="#C4A44A" opacity="0.5"/>
          {/* Main stem */}
          <path d="M20 71 L20 18" stroke="#4A7C2F" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Multiple leaves */}
          <path d="M20 62 Q8 54 5 44" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="10" cy="51" rx="9" ry="5" fill="#6B9E3F" transform="rotate(-35 10 51)"/>
          <path d="M20 55 Q32 47 35 37" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="30" cy="44" rx="9" ry="5" fill="#6B9E3F" transform="rotate(35 30 44)"/>
          <path d="M20 42 Q10 34 7 24" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="12" cy="32" rx="7" ry="4" fill="#A8C97F" transform="rotate(-30 12 32)"/>
          <path d="M20 38 Q30 30 33 20" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="28" cy="27" rx="7" ry="4" fill="#A8C97F" transform="rotate(30 28 27)"/>
          <ellipse cx="20" cy="16" rx="4" ry="5" fill="#4A7C2F"/>
        </svg>
      )
    },
    {
      label: 'Flowering',
      description: 'In bloom',
      svg: (
        <svg width="44" height="90" viewBox="0 0 44 90" fill="none">
          <ellipse cx="22" cy="83" rx="18" ry="5" fill="#C4A44A" opacity="0.5"/>
          <path d="M22 81 L22 20" stroke="#4A7C2F" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Leaves */}
          <path d="M22 68 Q8 58 4 46" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="11" cy="55" rx="10" ry="5" fill="#6B9E3F" transform="rotate(-35 11 55)"/>
          <path d="M22 60 Q36 50 40 38" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="33" cy="48" rx="10" ry="5" fill="#6B9E3F" transform="rotate(35 33 48)"/>
          <path d="M22 45 Q10 36 7 26" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="12" cy="34" rx="7" ry="4" fill="#A8C97F" transform="rotate(-30 12 34)"/>
          {/* Flower */}
          <circle cx="22" cy="12" r="8" fill="#FFF3CD" stroke="#C4A44A" strokeWidth="1.5"/>
          <circle cx="22" cy="12" r="4" fill="#C4A44A"/>
          {[0,60,120,180,240,300].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const px = 22 + 8 * Math.cos(rad);
            const py = 12 + 8 * Math.sin(rad);
            return <ellipse key={angle} cx={px} cy={py} rx="4" ry="2.5" fill="#FFE08A" transform={`rotate(${angle} ${px} ${py})`}/>;
          })}
        </svg>
      )
    },
    {
      label: 'Harvest',
      description: 'Ready to harvest',
      svg: (
        <svg width="48" height="95" viewBox="0 0 48 95" fill="none">
          <ellipse cx="24" cy="88" rx="20" ry="5" fill="#C4A44A" opacity="0.5"/>
          {/* Stalk */}
          <path d="M24 86 L24 20" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
          {/* Heavy leaves drooping */}
          <path d="M24 72 Q8 62 3 50" stroke="#5A8C38" strokeWidth="2" fill="none"/>
          <ellipse cx="11" cy="59" rx="12" ry="6" fill="#6B9E3F" transform="rotate(-35 11 59)"/>
          <path d="M24 62 Q40 52 45 40" stroke="#5A8C38" strokeWidth="2" fill="none"/>
          <ellipse cx="36" cy="50" rx="12" ry="6" fill="#6B9E3F" transform="rotate(35 36 50)"/>
          <path d="M24 48 Q10 40 6 28" stroke="#5A8C38" strokeWidth="1.5" fill="none"/>
          <ellipse cx="13" cy="37" rx="9" ry="5" fill="#A8C97F" transform="rotate(-30 13 37)"/>
          {/* Wheat/grain head */}
          <ellipse cx="24" cy="14" rx="6" ry="10" fill="#C4A44A"/>
          {/* Grain kernels */}
          {[-3,0,3].map((x,i) => (
            <ellipse key={i} cx={24+x} cy={14+i*3-3} rx="2.5" ry="1.5" fill="#E8C97A"/>
          ))}
          <path d="M18 10 Q15 5 12 3" stroke="#C4A44A" strokeWidth="1" fill="none"/>
          <path d="M30 10 Q33 5 36 3" stroke="#C4A44A" strokeWidth="1" fill="none"/>
          <path d="M24 8 Q24 2 24 0" stroke="#C4A44A" strokeWidth="1" fill="none"/>
        </svg>
      )
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        gap: 0, position: 'relative',
      }}>
        {stages.map((stage, i) => (
          <div key={stage.label} style={{ display: 'flex', alignItems: 'flex-end', flex: 1 }}>
            {/* Stage */}
            <div className="crop-stage" style={{ flex: 1 }}>
              <div className="crop-icon-wrap">
                {stage.svg}
              </div>
              {/* Dot and label */}
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--olive-green)', flexShrink: 0,
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--forest-green)' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 2 }}>
                  {stage.description}
                </div>
              </div>
            </div>
            {/* Connector line */}
            {i < stages.length - 1 && (
              <div style={{
                width: 24, height: 2,
                background: 'var(--pale-green)',
                marginBottom: 56, flexShrink: 0,
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
