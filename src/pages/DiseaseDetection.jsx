import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, Leaf, Sprout } from 'lucide-react';
import DiseaseUpload from '../components/DiseaseUpload';
import DiseaseResult from '../components/DiseaseResult';
import DiseaseHistory from '../components/DiseaseHistory';
import { analyzeDisease, getDiseaseHistory, deleteDiseaseRecord, clearDiseaseHistory } from '../services/diseaseApi';

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getDiseaseHistory().then(setHistory);
  }, []);

  const handleAnalyze = async (imgObj, cropChoice = selectedCrop) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeDisease(imgObj.file || imgObj.previewUrl, cropChoice);
      setResult(res);

      // Add to recent history
      const newHistoryItem = {
        id: res.prediction_id || `dh-${Date.now()}`,
        crop: res.crop,
        scientific_name: res.scientific_name,
        disease: res.detectedDisease,
        pathogen: res.pathogen,
        confidence: res.confidence,
        severity: res.severity,
        status: res.diseaseStatus,
        api_engine_used: res.api_engine_used,
        date: new Date().toISOString().split('T')[0],
        imageUrl: imgObj.previewUrl,
        symptoms: res.symptoms,
        causes: res.possibleCauses,
        recommendedActions: res.recommendedActions,
        preventionTips: res.preventionTips
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      // Scroll to result view
      setTimeout(() => {
        document.getElementById('disease-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
  };

  const handleRemoveHistory = async (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    try {
      await deleteDiseaseRecord(id);
    } catch (err) {
      console.warn('Error removing history record:', err);
    }
  };

  const handleClearHistory = async () => {
    setHistory([]);
    try {
      await clearDiseaseHistory();
    } catch (err) {
      console.warn('Error clearing history:', err);
    }
  };

  const handleSelectHistory = (item) => {
    setSelectedImage({
      previewUrl: item.imageUrl,
      name: `${item.crop} scan (${item.date})`,
      size: 'Cached analysis',
    });
    setResult({
      crop: item.crop,
      scientific_name: item.scientific_name,
      detectedDisease: item.disease,
      pathogen: item.pathogen,
      confidence: item.confidence,
      severity: item.severity,
      diseaseStatus: item.status,
      api_engine_used: item.api_engine_used,
      symptoms: item.symptoms,
      causes: item.causes,
      possibleCauses: item.causes,
      recommendedActions: item.recommendedActions,
      preventionTips: item.preventionTips,
      analyzedAt: item.date,
      isAiPrediction: true,
    });
    setTimeout(() => {
      document.getElementById('disease-result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Natural Agricultural Header */}
      <div style={{
        background: '#FAF7F2',
        padding: '28px 28px',
        borderBottom: '1px solid var(--beige)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--pale-green)', padding: '4px 12px', borderRadius: 99, marginBottom: 10 }}>
            <Leaf size={14} color="var(--forest-green)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--forest-green)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Plant Health & Crop Diagnostics
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)',
            color: 'var(--forest-green)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 6
          }}>
            Crop Leaf Disease Identification
          </h1>

          <p style={{
            color: 'var(--text-medium)',
            fontSize: '0.94rem',
            maxWidth: 720,
            lineHeight: 1.6
          }}>
            Upload or photograph a leaf to identify potential fungal, bacterial, or pest symptoms. Receive pathology insights, severity grading, and field treatment protocols.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.1fr' : '1fr', gap: 28 }} className="disease-page-grid">
          {/* Left / Top: Upload Box */}
          <div>
            <DiseaseUpload
              onAnalyze={handleAnalyze}
              loading={loading}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              selectedCrop={selectedCrop}
              setSelectedCrop={setSelectedCrop}
            />

            {/* Natural Field Guide Tips */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '20px',
              marginTop: '20px',
              border: '1px solid var(--beige)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Sprout size={16} color="var(--forest-green)" />
                <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--forest-green)', margin: 0 }}>
                  Field Photo Guidelines
                </h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.83rem', color: 'var(--text-medium)', lineHeight: 1.65 }}>
                <li>Capture clear, focused photos under natural daylight without harsh shadows.</li>
                <li>Center the affected leaf surface or lesion spots within the frame.</li>
                <li>Include both upper and lower leaf surfaces if discoloration is present.</li>
                <li>Avoid blurry shots or extreme direct flashlight glare.</li>
              </ul>
            </div>
          </div>

          {/* Right: Results Section */}
          {result && (
            <div id="disease-result-section">
              <DiseaseResult result={result} onReset={handleReset} />
            </div>
          )}
        </div>

        {/* History Section with Remove & Clear Options */}
        <DiseaseHistory
          history={history}
          onSelect={handleSelectHistory}
          onRemove={handleRemoveHistory}
          onClearAll={handleClearHistory}
        />
      </div>

      <style>{`
        @media (max-width: 960px) {
          .disease-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
