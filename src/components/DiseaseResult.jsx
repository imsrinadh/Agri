import React from 'react';
import {
  CheckCircle2, Info,
  Sprout, Activity, Stethoscope,
  ShieldCheck, HelpCircle, AlertTriangle,
  BarChart3, Cpu, AlertCircle, Sparkles
} from 'lucide-react';
import Button from './Button';

export default function DiseaseResult({ result, onReset }) {
  if (!result) return null;

  const {
    crop,
    scientific_name,
    plant_family,
    detectedDisease,
    pathogen,
    symptoms,
    causes,
    possibleCauses,
    topPredictions = [],
    architecture = 'ResNet-50 Deep CNN Super Model',
    api_engine_used,
    engine_type = 'LOCAL_CNN',
    is_plant = true,
    rejection_reason,
    confidence,
    confidenceDisplay,
    severity = 'MODERATE',
    diseaseStatus = 'Disease Detected',
    recommendations = [],
    message,
    disclaimer,
    modelVersion = 'UNIVERSAL_DISEASE_v2.0',
    modelStatus = 'VALIDATED_PRODUCTION',
    deploymentStatus = 'PRODUCTION',
    prediction_allowed = true
  } = result;

  const isHealthy = diseaseStatus.toLowerCase().includes('healthy');
  const isNonPlant = is_plant === false || diseaseStatus.toLowerCase().includes('non-foliar');
  const isUncertain = !prediction_allowed || diseaseStatus.toLowerCase().includes('uncertain') || diseaseStatus.toLowerCase().includes('uncataloged');

  const badgeColor = isNonPlant
    ? { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }
    : isHealthy
    ? { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' }
    : isUncertain
    ? { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }
    : { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };

  const effectiveCauses = causes || possibleCauses;
  const isGeminiEngine = engine_type === 'UNIVERSAL_API' || (api_engine_used && api_engine_used.toLowerCase().includes('gemini'));

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '28px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--beige)',
      animation: 'fadeInUp 0.4s ease'
    }}>
      {/* Top Model & API Transparency Disclosure Banner */}
      <div style={{
        background: isGeminiEngine ? '#F0FDF4' : isNonPlant ? '#FEF2F2' : '#FAF5FF',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${isGeminiEngine ? '#BBF7D0' : isNonPlant ? '#FECACA' : '#E9D5FF'}`,
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isGeminiEngine ? (
            <Sparkles size={16} color="#166534" />
          ) : (
            <Cpu size={16} color="#6B21A8" />
          )}
          <span style={{ fontSize: '0.8rem', color: isGeminiEngine ? '#166534' : isNonPlant ? '#991B1B' : '#581C87' }}>
            <strong>AI Engine Powering This Result:</strong> {api_engine_used || (isGeminiEngine ? 'Google Gemini Vision API' : 'PyTorch ResNet-50 CNN')}
          </span>
        </div>
        <span style={{
          background: isGeminiEngine ? '#DCFCE7' : isNonPlant ? '#FEE2E2' : '#F3E8FF',
          color: isGeminiEngine ? '#15803D' : isNonPlant ? '#991B1B' : '#6B21A8',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 4,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          border: `1px solid ${isGeminiEngine ? '#86EFAC' : isNonPlant ? '#FCA5A5' : '#D8B4FE'}`
        }}>
          {isGeminiEngine ? 'Universal Any-Plant AI' : isNonPlant ? 'Foliage Gate Rejected' : '38-Class Benchmark'}
        </span>
      </div>

      {/* Main Status Heading Card */}
      <div style={{
        paddingBottom: 20,
        marginBottom: 20,
        borderBottom: '1px solid var(--beige)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <Sprout size={16} color="var(--forest-green)" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Host Crop / Plant: <strong style={{ color: 'var(--forest-green)' }}>{crop}</strong>
          </span>
          {scientific_name && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-medium)', fontStyle: 'italic' }}>
              ({scientific_name}{plant_family ? ` • Family: ${plant_family}` : ''})
            </span>
          )}
        </div>

        <h2 style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 800,
          fontSize: '1.5rem',
          color: isNonPlant ? '#991B1B' : isUncertain ? '#92400E' : isHealthy ? 'var(--forest-green)' : '#991B1B',
          lineHeight: 1.3,
          marginTop: 4,
          marginBottom: 4
        }}>
          {detectedDisease}
        </h2>

        {pathogen && pathogen !== 'None' && (
          <div style={{ fontSize: '0.86rem', color: '#4A5D3B', fontStyle: 'italic', marginBottom: 8 }}>
            Pathogen: <strong>{pathogen}</strong>
          </div>
        )}

        <p style={{ fontSize: '0.86rem', color: 'var(--text-light)', margin: '4px 0 12px 0', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={{
            background: badgeColor.bg,
            color: badgeColor.text,
            border: `1px solid ${badgeColor.border}`,
            fontSize: '0.76rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 6,
            textTransform: 'uppercase'
          }}>
            Status: {diseaseStatus}
          </span>
          {!isNonPlant && !isUncertain && (
            <>
              <span style={{
                background: '#F3F4F6',
                color: '#374151',
                border: '1px solid #E5E7EB',
                fontSize: '0.76rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 6
              }}>
                Diagnostic Confidence: <strong>{confidenceDisplay || `${confidence}%`}</strong>
              </span>
              <span style={{
                background: severity === 'CRITICAL' ? '#FEF2F2' : severity === 'HIGH' ? '#FFFBEB' : '#F3F4F6',
                color: severity === 'CRITICAL' ? '#DC2626' : severity === 'HIGH' ? '#D97706' : '#374151',
                border: '1px solid #E5E7EB',
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6
              }}>
                Severity: <strong>{severity}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Top-3 Probability Distribution Meter */}
      {topPredictions && topPredictions.length > 0 && (
        <div style={{
          marginBottom: 22,
          background: '#FAF7F2',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid var(--beige)'
        }}>
          <h4 style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--forest-green)',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}>
            <BarChart3 size={15} color="var(--olive-green)" />
            CNN Multi-Class Probability Distribution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topPredictions.map((pred, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: pred.is_top ? 700 : 500, color: pred.is_top ? 'var(--forest-green)' : 'var(--text-medium)' }}>
                    {pred.crop} — {pred.disease}
                  </span>
                  <span style={{ fontWeight: 700, color: pred.is_top ? 'var(--forest-green)' : 'var(--text-light)' }}>
                    {pred.probability}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 7, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pred.probability}%`,
                    height: '100%',
                    background: pred.is_top ? 'linear-gradient(90deg, #2D5016, #4A7A28)' : '#9CA3AF',
                    borderRadius: 4,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms and Disease Causes */}
      {(symptoms || effectiveCauses) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: symptoms && effectiveCauses ? '1fr 1fr' : '1fr',
          gap: 14,
          marginBottom: 22
        }}>
          {symptoms && (
            <div style={{ background: '#FAF7F2', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--beige)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--forest-green)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stethoscope size={14} color="var(--olive-green)" /> Foliar Symptoms
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-medium)', margin: 0, lineHeight: 1.5 }}>
                {symptoms}
              </p>
            </div>
          )}
          {effectiveCauses && (
            <div style={{ background: '#FAF7F2', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--beige)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--forest-green)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} color="var(--olive-green)" /> Environmental Triggers
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-medium)', margin: 0, lineHeight: 1.5 }}>
                {effectiveCauses}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommended Actions */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{
          fontSize: '0.88rem',
          fontWeight: 700,
          color: 'var(--forest-green)',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Activity size={16} color="var(--olive-green)" />
          Recommended Next Steps
        </h4>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.6 }}>
          {recommendations.map((rec, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Decision-Support Scientific Disclaimer */}
      <div style={{
        background: '#F9FAFB',
        borderRadius: 10,
        padding: '12px 16px',
        border: '1px solid #E5E7EB',
        fontSize: '0.78rem',
        color: '#6B7280',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'start',
        gap: 8
      }}>
        <Info size={16} color="#9CA3AF" style={{ marginTop: 2, flexShrink: 0 }} />
        <span>
          <strong>Decision Support Notice:</strong> {disclaimer || "Diagnostic result generated by AgriRisk MobileNetV3 CNN. Always consult local agricultural extension specialists for critical field interventions."}
        </span>
      </div>

      {onReset && (
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Button variant="outline" onClick={onReset}>
            Analyze Another Image
          </Button>
        </div>
      )}
    </div>
  );
}
