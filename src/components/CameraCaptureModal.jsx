import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Sparkles, Check, SwitchCamera } from 'lucide-react';
import Button from './Button';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [error, setError] = useState('');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Stop camera tracks helper
  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start video stream
  const startCamera = useCallback(async (mode) => {
    setError('');
    // Stop any existing tracks before starting a new stream
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Live camera access is not supported by your current browser. Please use the "Choose Image" option.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera permissions in your browser bar and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device was detected on your computer or phone.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is currently in use by another application or tab.');
      } else {
        // Fallback with generic video constraint
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch(() => {});
          }
        } catch {
          setError('Unable to access camera. Please check your camera permissions.');
        }
      }
    }
  }, [stream]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopTracks();
      setError('');
    }
    return () => {
      stopTracks();
    };
  }, [isOpen]);

  // Attach video stream if ref becomes available
  useEffect(() => {
    if (stream && videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Toggle front/back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current frame from video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setIsCapturing(true);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // Mirror if using front camera
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    // Convert to Blob and File
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `leaf_scan_${timestamp}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);

        stopTracks();
        setIsCapturing(false);

        onCapture({
          file,
          previewUrl,
          name: filename,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        });
        onClose();
      } else {
        setIsCapturing(false);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleClose = () => {
    stopTracks();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(12, 22, 8, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <div
        style={{
          background: '#1C2B14',
          borderRadius: 20,
          width: '100%',
          maxWidth: 680,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(168, 201, 127, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--forest-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={16} color="#A8C97F" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', color: '#fff', fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                Live Leaf Camera
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)' }}>
                Position the leaf inside the frame and take a photo
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close camera"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Window */}
        <div
          style={{
            position: 'relative',
            background: '#0a1006',
            minHeight: 380,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {error ? (
            <div style={{ padding: '36px 24px', textAlign: 'center', maxWidth: 460 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <AlertCircle size={26} color="#ef4444" />
              </div>
              <h4 style={{ color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>
                Camera Access Needed
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: 20 }}>
                {error}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Button variant="primary" size="sm" onClick={() => startCamera(facingMode)} icon={RefreshCw}>
                  Try Again
                </Button>
                <Button variant="outline" size="sm" onClick={handleClose} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Use File Upload
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: 460,
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />

              {/* Viewfinder Target Frame Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 24,
                  border: '2px dashed rgba(168, 201, 127, 0.65)',
                  borderRadius: 16,
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 12,
                }}
              >
                {/* Corner Accents */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: 20, height: 20, borderTop: '3px solid #A8C97F', borderLeft: '3px solid #A8C97F', borderRadius: '4px 0 0 0' }} />
                  <div style={{ width: 20, height: 20, borderTop: '3px solid #A8C97F', borderRight: '3px solid #A8C97F', borderRadius: '0 4px 0 0' }} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      background: 'rgba(20, 36, 12, 0.85)',
                      color: '#A8C97F',
                      padding: '4px 14px',
                      borderRadius: 99,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      border: '1px solid rgba(168, 201, 127, 0.4)',
                    }}
                  >
                    Align Leaf Within Frame
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: 20, height: 20, borderBottom: '3px solid #A8C97F', borderLeft: '3px solid #A8C97F', borderRadius: '0 0 0 4px' }} />
                  <div style={{ width: 20, height: 20, borderBottom: '3px solid #A8C97F', borderRight: '3px solid #A8C97F', borderRadius: '0 0 4px 0' }} />
                </div>
              </div>

              {/* Shutter Flash Animation */}
              {isCapturing && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#fff',
                    animation: 'flash 0.3s ease-out forwards',
                  }}
                />
              )}
            </>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Footer Shutter Controls */}
        {!error && (
          <div
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Switch Camera Button */}
            {hasMultipleCameras ? (
              <button
                type="button"
                onClick={handleToggleCamera}
                title="Switch Camera"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  padding: '9px 14px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <SwitchCamera size={16} color="#A8C97F" />
                Flip
              </button>
            ) : (
              <div style={{ width: 70 }} />
            )}

            {/* Main Shutter Button */}
            <button
              type="button"
              onClick={handleCapturePhoto}
              disabled={!stream || isCapturing}
              aria-label="Capture Leaf Photograph"
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4A7C2F, #2D5016)',
                border: '4px solid #FFFFFF',
                boxShadow: '0 0 0 3px rgba(168, 201, 127, 0.8), 0 6px 20px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#A8C97F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={24} color="#1C2B14" />
              </div>
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 12px',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes flash { from { opacity: 0.9; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}
