import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertTriangle, Sprout, Sparkles, Key, Cpu } from 'lucide-react';
import Button from './Button';
import CameraCaptureModal from './CameraCaptureModal';

export default function DiseaseUpload({
  onAnalyze,
  loading = false,
  selectedImage,
  setSelectedImage,
  selectedCrop = 'auto',
  setSelectedCrop,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [apiKeyStored, setApiKeyStored] = useState(false);
  const fileInputRef = useRef(null);

  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const isGeminiActive = apiKeyStored || Boolean(envKey && envKey.trim());

  useEffect(() => {
    const stored = localStorage.getItem('agririsk_gemini_api_key');
    if (stored) {
      setApiKeyStored(true);
      setGeminiKeyInput(stored);
    } else if (envKey) {
      setGeminiKeyInput(envKey);
    }
  }, [envKey]);

  const handleSaveApiKey = () => {
    if (geminiKeyInput.trim()) {
      localStorage.setItem('agririsk_gemini_api_key', geminiKeyInput.trim());
      setApiKeyStored(true);
      setShowKeyModal(false);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('agririsk_gemini_api_key');
    setGeminiKeyInput('');
    setApiKeyStored(false);
    setShowKeyModal(false);
  };

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please upload a valid image file (JPG, JPEG, PNG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage({
        file,
        previewUrl: e.target.result,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedImage(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCamera = () => {
    setError('');
    setIsCameraOpen(true);
  };

  const handleCameraCapture = (captured) => {
    setError('');
    setSelectedImage(captured);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '28px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--beige)' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: 'none' }}
      />

      {/* Live Interactive In-Browser Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* AI Engine Status & Configuration Bar */}
      <div style={{
        marginBottom: 16,
        background: isGeminiActive ? '#F0FDF4' : '#F8FAFC',
        padding: '10px 14px',
        borderRadius: 12,
        border: `1px solid ${isGeminiActive ? '#BBF7D0' : 'var(--beige)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isGeminiActive ? (
            <Sparkles size={16} color="#166534" />
          ) : (
            <Cpu size={16} color="var(--forest-green)" />
          )}
          <span style={{ fontSize: '0.82rem', color: isGeminiActive ? '#166534' : 'var(--text-dark)' }}>
            <strong>Active AI Model:</strong>{' '}
            {isGeminiActive
              ? 'Google Gemini 3.6 Flash Universal Vision Intelligence (State-of-the-Art Open-World Pathologist)'
              : 'PyTorch ResNet-50 Deep CNN (38-Class PlantVillage + Local Staples)'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowKeyModal(!showKeyModal)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.78rem',
            color: 'var(--forest-green)',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Key size={13} /> {isGeminiActive ? 'API Key Active (Click to View/Edit)' : 'Configure Gemini Key (Optional)'}
        </button>
      </div>

      {showKeyModal && (
        <div style={{
          marginBottom: 16,
          background: '#FFFFFF',
          padding: '14px 16px',
          borderRadius: 12,
          border: '1.5px solid var(--forest-green)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--forest-green)' }}>
              ⚡ Google Gemini Vision API Key (For Any Plant in the World)
            </label>
            <button
              type="button"
              onClick={() => setShowKeyModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X size={15} />
            </button>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-medium)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
            Get a 100% free Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest-green)', fontWeight: 700 }}>Google AI Studio</a> (1,500 free scans/day) to identify over 300,000+ plant, weed, flower, and crop species worldwide. Leave blank to run offline on local PyTorch ResNet-50.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--beige)',
                fontSize: '0.82rem'
              }}
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              style={{
                background: 'var(--forest-green)',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Save Key
            </button>
            {apiKeyStored && (
              <button
                type="button"
                onClick={handleClearApiKey}
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: '1px solid #FCA5A5',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Host Crop Context Selection Bar */}
      <div style={{ marginBottom: 20, background: 'var(--warm-cream)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--beige)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--forest-green)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sprout size={16} /> Host Crop Context (Select Leaf Crop or Auto-Detect)
          </label>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>
            Calibrates vision model prior
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'auto', label: '🌿 Auto-Detect (Any Plant)' },
            { id: 'rice', label: '🌾 Rice / Paddy' },
            { id: 'wheat', label: '🌾 Wheat' },
            { id: 'cotton', label: '🪴 Cotton' },
            { id: 'sugarcane', label: '🎋 Sugarcane' },
            { id: 'mango', label: '🥭 Mango' },
            { id: 'corn', label: '🌽 Corn (Maize)' },
            { id: 'potato', label: '🥔 Potato' },
            { id: 'tomato', label: '🍅 Tomato' },
            { id: 'pepper', label: '🫑 Pepper (Bell) / Chili' },
            { id: 'apple', label: '🍎 Apple' },
            { id: 'grape', label: '🍇 Grape' },
            { id: 'citrus', label: '🍊 Citrus / Orange' },
            { id: 'banana', label: '🍌 Banana' },
            { id: 'strawberry', label: '🍓 Strawberry' },
            { id: 'soybean', label: '🫘 Soybean' },
            { id: 'other', label: '🌱 Other Foliage / Open-World' },
          ].map((c) => {
            const isActive = (selectedCrop || 'auto') === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedCrop?.(c.id); }}
                style={{
                  background: isActive ? 'var(--forest-green)' : '#fff',
                  color: isActive ? '#fff' : 'var(--text-dark)',
                  border: `1.5px solid ${isActive ? 'var(--forest-green)' : 'var(--beige)'}`,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(45,80,22,0.25)' : 'none'
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{
          background: '#FFF3CD', border: '1px solid #FFC107',
          borderRadius: 8, padding: '10px 14px', marginBottom: 18,
          display: 'flex', gap: 8, alignItems: 'center'
        }}>
          <AlertTriangle size={15} color="#856404" />
          <span style={{ fontSize: '0.84rem', color: '#856404' }}>{error}</span>
        </div>
      )}

      {!selectedImage ? (
        /* Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--forest-green)' : 'var(--beige)'}`,
            borderRadius: 14,
            padding: '48px 24px',
            textAlign: 'center',
            background: dragActive ? 'var(--pale-green)' : 'var(--warm-cream)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onClick={triggerFileInput}
        >
          <div style={{
            width: 58, height: 58, borderRadius: 14,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 2px 8px rgba(45,80,22,0.1)'
          }}>
            <Upload size={26} color="var(--forest-green)" />
          </div>

          <h3 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '1.15rem', fontWeight: 800,
            color: 'var(--forest-green)', marginBottom: 6
          }}>
            Drag & Drop Leaf or Crop Image
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-medium)', marginBottom: 20 }}>
            Supports JPG, JPEG, or PNG crop photos (up to 10MB)
          </p>

          <div
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="primary"
              size="sm"
              icon={ImageIcon}
              iconPosition="left"
              onClick={triggerFileInput}
            >
              Choose Image
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Camera}
              iconPosition="left"
              onClick={triggerCamera}
            >
              Take Photo
            </Button>
          </div>
        </div>
      ) : (
        /* Preview Area */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} color="var(--olive-green)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--forest-green)' }}>
                {selectedImage.name}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                ({selectedImage.size})
              </span>
            </div>
            <button
              onClick={handleRemove}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-light)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.8rem', padding: '4px 8px', borderRadius: 6
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#DC3545'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}
            >
              <X size={14} /> Remove
            </button>
          </div>

          {/* Image Container with Scanning Effect when loading */}
          <div style={{
            position: 'relative',
            width: '100%', maxHeight: 380,
            borderRadius: 12, overflow: 'hidden',
            background: 'var(--warm-cream)',
            border: '1px solid var(--beige)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20
          }}>
            <img
              src={selectedImage.previewUrl}
              alt="Crop upload preview"
              style={{
                width: '100%', height: 'auto', maxHeight: 380,
                objectFit: 'contain',
                display: 'block',
                opacity: loading ? 0.75 : 1,
                transition: 'opacity 0.3s ease'
              }}
            />

            {/* Subtle natural scanning animation line */}
            {loading && <div className="scan-animation" />}

            {loading && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(35, 62, 23, 0.65)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                backdropFilter: 'blur(2px)'
              }}>
                <Sprout size={36} color="#A8C97F" style={{ animation: 'pulse-gentle 1.5s infinite', marginBottom: 10 }} />
                <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.01em' }}>
                  Analyzing Crop Image…
                </span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                  Evaluating leaf pigmentation and pathogen lesion patterns
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons: [ Analyze Disease ], [ Take Another Photo ], [ Change Image ], [ Remove ] */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="md"
              icon={Sprout}
              iconPosition="left"
              disabled={loading}
              onClick={() => onAnalyze(selectedImage, selectedCrop)}
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {loading ? 'Analyzing Crop Image…' : 'Analyze Disease'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={Camera}
              iconPosition="left"
              disabled={loading}
              onClick={triggerCamera}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Take Photo
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={RefreshCw}
              iconPosition="left"
              disabled={loading}
              onClick={triggerFileInput}
              style={{ justifyContent: 'center' }}
            >
              Choose File
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={X}
              iconPosition="left"
              disabled={loading}
              onClick={handleRemove}
              style={{ justifyContent: 'center' }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

