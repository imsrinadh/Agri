import React from 'react';
import { Clock, Calendar, Sprout, Trash2 } from 'lucide-react';

export default function DiseaseHistory({ history = [], onSelect, onRemove, onClearAll }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--beige)',
      marginTop: '28px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--beige)', paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--pale-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Clock size={16} color="var(--forest-green)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest-green)', margin: 0 }}>
              Recent Disease Analyses
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
              Historical diagnostic records and leaf scans across your monitored fields
            </span>
          </div>
        </div>

        {history && history.length > 0 && onClearAll && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to clear all recent disease analyses?')) {
                onClearAll();
              }
            }}
            title="Clear all recent scans"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEE2E2';
              e.currentTarget.style.borderColor = '#FCA5A5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FEF2F2';
              e.currentTarget.style.borderColor = '#FECACA';
            }}
          >
            <Trash2 size={13} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {!history || history.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--warm-cream)',
          borderRadius: 12,
          border: '1px solid var(--beige)'
        }}>
          <Sprout size={36} color="var(--olive-green)" style={{ marginBottom: 10 }} />
          <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '0.96rem', color: 'var(--forest-green)', margin: '0 0 4px 0' }}>
            No disease analyses found
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', margin: 0 }}>
            Upload or photograph a leaf specimen above to perform your first plant diagnostic assessment.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16
        }}>
          {history.map((item) => {
            const severityStyle = {
              Low: { bg: '#D4EDDA', text: '#1A5C2B' },
              Moderate: { bg: '#FFF3CD', text: '#856404' },
              High: { bg: '#FFE4CC', text: '#913D00' },
              Critical: { bg: '#F8D7DA', text: '#842029' },
            }[item.severity] || { bg: '#FFF3CD', text: '#856404' };

            return (
              <div
                key={item.id}
                onClick={() => onSelect && onSelect(item)}
                style={{
                  borderRadius: 12,
                  border: '1px solid var(--beige)',
                  background: '#FCFBF9',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: onSelect ? 'pointer' : 'default',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'relative', height: 130, width: '100%', overflow: 'hidden' }}>
                  <img
                    src={item.imageUrl}
                    alt={`${item.crop} - ${item.disease}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: severityStyle.bg, color: severityStyle.text,
                    padding: '2px 8px', borderRadius: 99,
                    fontSize: '0.7rem', fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {item.severity}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 8, left: 8,
                    background: 'rgba(28, 43, 14, 0.75)', color: '#fff',
                    padding: '2px 8px', borderRadius: 4,
                    fontSize: '0.72rem', fontWeight: 600,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {item.crop}
                  </div>
                </div>

                <div style={{ padding: '14px' }}>
                  <div style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700, fontSize: '0.92rem',
                    color: 'var(--forest-green)',
                    marginBottom: 6,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {item.disease}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-light)', marginBottom: onRemove ? 10 : 0 }}>
                    <span>Confidence: <strong style={{ color: 'var(--text-dark)' }}>{item.confidence}%</strong></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  {onRemove && (
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(item.id);
                        }}
                        title="Remove scan from history"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: '#FFF1F2',
                          color: '#E11D48',
                          border: '1px solid #FFE4E6',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FFE4E6';
                          e.currentTarget.style.borderColor = '#FDA4AF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFF1F2';
                          e.currentTarget.style.borderColor = '#FFE4E6';
                        }}
                      >
                        <Trash2 size={11} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
