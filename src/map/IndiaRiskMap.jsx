import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, RotateCcw, Layers, Thermometer, Droplets, CloudRain, Wind, Key, Check, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map View Controller with smooth animation
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 6, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
}

const getStoredGoogleKey = () => {
  try {
    return localStorage.getItem('agririsk_google_maps_key') ||
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      '';
  } catch {
    return '';
  }
};

const getTileLayers = (googleKey) => ({
  esriSatellite: {
    label: '🛰️ High-Res Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  cartoVoyager: {
    label: '🗺️ Clean Terrain',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  googleHybrid: {
    label: '🌐 Google Satellite',
    url: googleKey
      ? `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${googleKey}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: googleKey ? '&copy; Google Maps' : '&copy; High-Res Satellite (Esri)',
  },
  osm: {
    label: '🌐 OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
});

export default function IndiaRiskMap({ stateData = {}, onStateSelect, selectedState }) {
  const [googleKey, setGoogleKey] = useState(getStoredGoogleKey);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(googleKey);
  const [activeLayer, setActiveLayer] = useState('esriSatellite');

  const tileLayers = getTileLayers(googleKey);

  const defaultCenter = [22.3511, 78.6677]; // Geographic Center of India
  const selectedEntry = selectedState ? stateData[selectedState] : null;
  const currentCenter = selectedEntry?.latitude && selectedEntry?.longitude
    ? [selectedEntry.latitude, selectedEntry.longitude]
    : defaultCenter;
  const currentZoom = selectedState ? 6 : 5;

  const getRiskPinColor = (score) => {
    if (score >= 75) return '#DC2626'; // Critical
    if (score >= 55) return '#EA580C'; // High
    if (score >= 35) return '#D97706'; // Moderate
    return '#16A34A'; // Low
  };

  const createCustomMarker = (name, d, isSelected) => {
    const score = d?.score ?? 30;
    const bg = getRiskPinColor(score);
    const temp = d?.telemetry?.temperature ? `${Math.round(d.telemetry.temperature)}°` : '';
    const isSelectedBorder = isSelected ? 'border: 2px solid #1C2B0E; box-shadow: 0 0 0 3px rgba(45,80,22,0.4), 0 8px 16px rgba(0,0,0,0.35); transform: scale(1.12);' : 'border: 1.5px solid #FFFFFF; box-shadow: 0 3px 8px rgba(0,0,0,0.25);';

    return L.divIcon({
      className: 'custom-region-div-icon',
      html: `
        <div style="
          background: #FFFFFF;
          border-radius: 20px;
          padding: 2px 4px 2px 3px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          ${isSelectedBorder}
        ">
          <span style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${bg};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 9px;
            font-weight: 800;
            flex-shrink: 0;
          ">
            ${score}
          </span>
          <span style="
            font-size: 11px;
            font-weight: 700;
            color: #1F2937;
            padding-right: 2px;
          ">
            ${name}
          </span>
          ${temp ? `
            <span style="
              background: #F3F4F6;
              color: #374151;
              font-size: 9.5px;
              font-weight: 700;
              padding: 1px 5px;
              border-radius: 10px;
            ">${temp}</span>
          ` : ''}
        </div>
      `,
      iconSize: [110, 26],
      iconAnchor: [55, 13],
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Map Controls Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 800, color: 'var(--forest-green)' }}>
          <MapPin size={15} color="var(--forest-green)" />
          <span>Interactive Agro-Meteorological Map</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Layer switcher */}
          <div style={{
            display: 'inline-flex',
            background: '#F3F4F6',
            padding: 2,
            borderRadius: 8,
            border: '1px solid var(--beige)',
          }}>
            {Object.entries(tileLayers).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeLayer === key ? '#FFFFFF' : 'transparent',
                  color: activeLayer === key ? 'var(--forest-green)' : 'var(--text-medium)',
                  boxShadow: activeLayer === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Layers size={11} /> {cfg.label}
              </button>
            ))}
          </div>

          {/* Google Maps Key Button */}
          <button
            onClick={() => {
              setTempKeyInput(googleKey);
              setShowKeyModal(true);
            }}
            title={googleKey ? 'Google Maps API Key configured' : 'Configure optional Google Maps API Key'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 9px',
              borderRadius: 8,
              border: googleKey ? '1px solid #86EFAC' : '1px solid var(--beige)',
              background: googleKey ? '#F0FDF4' : '#FFFFFF',
              color: googleKey ? '#15803D' : 'var(--text-dark)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Key size={11} color={googleKey ? '#16A34A' : 'var(--text-medium)'} />
            <span>{googleKey ? 'Google Key ✓' : 'Google Key'}</span>
          </button>

          {/* Reset view button */}
          <button
            onClick={() => onStateSelect && onStateSelect(null)}
            title="Reset to All-India View"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 8,
              border: '1px solid var(--beige)',
              background: '#FFFFFF',
              color: 'var(--text-dark)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Optional Google Key Modal */}
      {showKeyModal && (
        <div style={{
          position: 'absolute',
          top: 45,
          right: 10,
          zIndex: 1000,
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '16px 18px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: '1.5px solid var(--beige)',
          width: 320,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.82rem', color: 'var(--forest-green)' }}>
              <Key size={14} color="var(--forest-green)" />
              <span>Google Maps API Key</span>
            </div>
            <button
              onClick={() => setShowKeyModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 0 }}
            >
              <X size={15} />
            </button>
          </div>

          <p style={{ fontSize: '0.73rem', color: 'var(--text-medium)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Enter your Google Maps API key to stream authentic Google Satellite layers directly without watermark. Default is free high-resolution Esri satellite.
          </p>

          <input
            type="password"
            placeholder="AIzaSy..."
            value={tempKeyInput}
            onChange={(e) => setTempKeyInput(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '7px 10px',
              borderRadius: 7,
              border: '1px solid var(--beige)',
              fontSize: '0.78rem',
              marginBottom: 10,
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {googleKey && (
              <button
                onClick={() => {
                  localStorage.removeItem('agririsk_google_maps_key');
                  setGoogleKey('');
                  setTempKeyInput('');
                  setShowKeyModal(false);
                }}
                style={{
                  background: '#FEE2E2',
                  color: '#B91C1C',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Remove Key
              </button>
            )}
            <button
              onClick={() => {
                const cleaned = tempKeyInput.trim();
                if (cleaned) {
                  localStorage.setItem('agririsk_google_maps_key', cleaned);
                  setGoogleKey(cleaned);
                  setActiveLayer('googleHybrid');
                } else {
                  localStorage.removeItem('agririsk_google_maps_key');
                  setGoogleKey('');
                }
                setShowKeyModal(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--forest-green)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Check size={12} /> Save Key
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Map Frame */}
      <div style={{
        height: 520,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1.5px solid var(--beige)',
        position: 'relative',
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <MapContainer
          center={currentCenter}
          zoom={currentZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapViewController center={currentCenter} zoom={currentZoom} />
          <TileLayer
            key={activeLayer + (activeLayer === 'googleHybrid' ? googleKey : '')}
            attribution={tileLayers[activeLayer]?.attribution || ''}
            url={tileLayers[activeLayer]?.url || tileLayers.esriSatellite.url}
          />

          {Object.entries(stateData).map(([name, d]) => {
            if (!d.latitude || !d.longitude) return null;
            const isSelected = selectedState === name;
            const icon = createCustomMarker(name, d, isSelected);

            return (
              <Marker
                key={name}
                position={[d.latitude, d.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onStateSelect && onStateSelect(name),
                }}
              >
                <Popup>
                  <div style={{ padding: '6px 4px', minWidth: 175 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <strong style={{ fontSize: '0.94rem', color: '#1C2B0E' }}>{name}</strong>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 999,
                        background: getRiskPinColor(d.score),
                        color: '#FFFFFF',
                      }}>
                        {d.level} RISK
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#4B5563', marginBottom: 8 }}>
                      Risk Index: <strong style={{ color: '#1C2B0E' }}>{d.score}/100</strong> • Crop: <strong>{d.majorCrop || 'Mixed'}</strong>
                    </div>

                    {d.telemetry && (
                      <div style={{
                        background: '#F9FAFB',
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: '0.74rem',
                        color: '#374151',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 6,
                        marginBottom: 8,
                        border: '1px solid #E5E7EB',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Thermometer size={12} color="#EF4444" /> {d.telemetry.temperature}°C
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Droplets size={12} color="#3B82F6" /> {d.telemetry.humidity}% RH
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CloudRain size={12} color="#0284C7" /> {d.telemetry.precipitation_mm} mm
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Wind size={12} color="#6B7280" /> {d.telemetry.wind_speed_kmh} km/h
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => onStateSelect && onStateSelect(name)}
                      style={{
                        width: '100%',
                        background: 'var(--forest-green)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                      }}
                    >
                      Inspect State Intelligence →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Clean Modern Risk Scale Legend */}
      <div style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        marginTop: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: '#FAF7F2',
        padding: '7px 14px',
        borderRadius: 8,
        border: '1px solid var(--beige)',
      }}>
        {[
          { label: 'Low Risk (<35)', color: '#16A34A' },
          { label: 'Moderate Caution (35–54)', color: '#D97706' },
          { label: 'High Alert (55–74)', color: '#EA580C' },
          { label: 'Critical Threat (≥75)', color: '#DC2626' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dark)', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
