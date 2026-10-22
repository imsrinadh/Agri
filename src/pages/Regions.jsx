import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Filter, AlertTriangle, CheckCircle2, Wheat, X,
  Radio, RefreshCw, Thermometer, Droplets, CloudRain,
  Wind, Sprout, Gauge, Search, ChevronRight, Calendar,
  ShieldAlert, ShieldCheck, Info, Compass, ArrowUpRight
} from 'lucide-react';
import IndiaRiskMap from '../map/IndiaRiskMap';
import { getRiskColor } from '../utils/riskUtils';
import { getStateRiskData } from '../services/api';
import { computeRealAgroRisk } from '../services/regionApi';

const CROP_ICONS = {
  rice: '🌾',
  cotton: '☁️',
  chilli: '🌶️',
  groundnut: '🥜',
  wheat: '🌾',
  soybean: '🫘',
  maize: '🌽',
  mustard: '🌼',
  onion: '🧅',
  tobacco: '🍃',
  sugarcane: '🎋',
  pulses: '🥣',
  tea: '🍵',
  coffee: '☕',
  rubber: '🌳',
  spices: '🌿',
  banana: '🍌',
  apple: '🍎',
  potato: '🥔',
  saffron: '🌸',
  ragi: '🌾',
  millets: '🌾',
};

const getCropIcon = (cropName) => (cropName ? (CROP_ICONS[cropName.toLowerCase()] || '🌱') : '🌱');

export default function Regions() {
  const [stateData, setStateData]       = useState({});
  const [selected, setSelected]         = useState('Andhra Pradesh');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [riskFilter, setRiskFilter]     = useState('ALL'); // ALL | LOW | MODERATE | HIGH | CRITICAL
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const loadData = async (forceFresh = false) => {
    if (forceFresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const d = await getStateRiskData({}, forceFresh);
      setStateData(d || {});
      const keys = Object.keys(d || {});
      if (keys.length > 0) {
        if (!selected || !d[selected]) {
          setSelected(d['Andhra Pradesh'] ? 'Andhra Pradesh' : keys[0]);
        }
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load regional data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const handleManualRefresh = () => {
    loadData(true);
  };

  const handleStateSelect = (name) => {
    setSelected(name === selected ? null : name);
    setSelectedCrop(null);
  };

  const selectedData = selected ? stateData[selected] : null;

  const availableCrops = selectedData?.crops?.length > 0
    ? selectedData.crops
    : (selectedData?.majorCrop ? [selectedData.majorCrop] : ['Rice']);

  const activeCrop = (selectedCrop && availableCrops.includes(selectedCrop))
    ? selectedCrop
    : (availableCrops[0] || 'Rice');

  // Compute or retrieve specific crop risk advisory
  const getCropAdvisory = (cropName) => {
    if (!selectedData) return null;
    if (selectedData.cropAdvisories && selectedData.cropAdvisories[cropName]) {
      return selectedData.cropAdvisories[cropName];
    }
    if (selectedData.telemetry) {
      const {
        temperature = 28,
        humidity = 65,
        precipitation_mm = 0,
        wind_speed_kmh = 8,
        soil_moisture = 25,
      } = selectedData.telemetry;
      return computeRealAgroRisk(temperature, humidity, precipitation_mm, wind_speed_kmh, soil_moisture, cropName);
    }
    return null;
  };

  const activeAdvisory = getCropAdvisory(activeCrop);
  const activeScore = activeAdvisory?.score ?? selectedData?.score ?? 35;
  const activeLevel = (activeAdvisory?.level || selectedData?.level || 'MODERATE').toUpperCase();
  const { bg: activeBg, text: activeText } = getRiskColor(activeLevel);

  const activeFactors = (activeAdvisory?.factors && activeAdvisory.factors.length > 0)
    ? activeAdvisory.factors
    : (selectedData?.factors || []);

  const activeActions = (activeAdvisory?.recommendations && activeAdvisory.recommendations.length > 0)
    ? activeAdvisory.recommendations
    : (selectedData?.actions || []);

  // Filter states for list
  const filteredStates = useMemo(() => {
    return Object.entries(stateData)
      .filter(([name, d]) => {
        const matchesSearch = !searchQuery.trim() ||
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.majorCrop && d.majorCrop.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (d.crops && d.crops.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesRisk = riskFilter === 'ALL' || d.level.toUpperCase() === riskFilter;

        return matchesSearch && matchesRisk;
      })
      .sort(([, a], [, b]) => b.score - a.score);
  }, [stateData, searchQuery, riskFilter]);

  const windVal = selectedData?.telemetry?.wind_speed_kmh ?? 0;
  const isSpraySafe = windVal < 15.0;

  return (
    <div style={{ minHeight: '100vh', background: '#FBF9F5', paddingBottom: 60 }}>
      {/* Top Banner / Header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--beige)',
        padding: '20px 28px',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#DCFCE7', border: '1px solid #86EFAC', padding: '4px 12px', borderRadius: 99, marginBottom: 8 }}>
              <span style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#16A34A',
                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.35)',
              }} className="live-pulse" />
              <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                LIVE WEATHER TELEMETRY • OPEN-METEO WMO GRID
              </span>
            </div>

            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', color: 'var(--forest-green)', fontWeight: 800, margin: 0 }}>
              Regional Agricultural Risk & Live Forecast
            </h1>
            <p style={{ color: 'var(--text-medium)', marginTop: 4, marginBottom: 0, maxWidth: 780, lineHeight: 1.5, fontSize: '0.90rem' }}>
              Real-time meteorological observations, physical crop stress indices, and 7-day agro-weather forecasts across Indian agricultural zones.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#F9FAFB',
              border: '1px solid var(--beige)',
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: '0.76rem',
              color: 'var(--text-medium)',
            }}>
              <Radio size={13} color="#16A34A" />
              <span>Synced at <strong>{lastSyncTime}</strong></span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'var(--forest-green)',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: 99,
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: (refreshing || loading) ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(45, 80, 22, 0.25)',
                transition: 'opacity 0.2s ease',
                opacity: (refreshing || loading) ? 0.7 : 1,
              }}
            >
              <RefreshCw size={13} className={refreshing ? 'spin-icon' : ''} />
              {refreshing ? 'Updating Live...' : 'Refresh Live Data'}
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ maxWidth: 1440, margin: '16px auto 0 auto', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#FAF7F2',
            border: '1.5px solid var(--beige)',
            borderRadius: 10,
            padding: '7px 14px',
            minWidth: 260,
            flex: '1 1 260px',
            maxWidth: 420,
          }}>
            <Search size={15} color="var(--text-medium)" />
            <input
              type="text"
              placeholder="Search state (e.g., Punjab, Andhra) or crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.82rem',
                color: 'var(--text-dark)',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-light)' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Risk Level Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-medium)', fontWeight: 700, marginRight: 4 }}>
              Filter by Threat:
            </span>
            {[
              { key: 'ALL', label: 'All Regions' },
              { key: 'LOW', label: '🟢 Low (<35)' },
              { key: 'MODERATE', label: '🟡 Moderate (35-54)' },
              { key: 'HIGH', label: '🟠 High (55-74)' },
              { key: 'CRITICAL', label: '🔴 Critical (≥75)' },
            ].map((p) => {
              const isActive = riskFilter === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setRiskFilter(p.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 99,
                    fontSize: '0.74rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    border: isActive ? '1.5px solid var(--forest-green)' : '1px solid var(--beige)',
                    background: isActive ? 'var(--forest-green)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : 'var(--text-dark)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.25fr)',
          gap: 24,
          alignItems: 'start',
        }} className="regions-dual-grid">

          {/* Left Column: Interactive Map + State Directory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Interactive Leaflet Map Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '18px 20px',
              border: '1.5px solid var(--beige)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {loading ? (
                <div style={{ height: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', gap: 10 }}>
                  <RefreshCw size={26} className="spin-icon" color="var(--forest-green)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Streaming live meteorological observations...</span>
                </div>
              ) : (
                <IndiaRiskMap
                  stateData={stateData}
                  onStateSelect={handleStateSelect}
                  selectedState={selected}
                />
              )}
            </div>

            {/* States Directory List */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid var(--beige)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--beige)',
                background: '#FAF7F2',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Compass size={14} color="var(--forest-green)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--forest-green)' }}>
                    Monitored Agricultural Regions ({filteredStates.length})
                  </span>
                </div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-medium)', fontWeight: 600 }}>
                  Click state to inspect
                </span>
              </div>

              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {filteredStates.length === 0 ? (
                  <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.84rem' }}>
                    No agricultural regions match your filter or search.
                  </div>
                ) : (
                  filteredStates.map(([name, d]) => {
                    const isSelected = selected === name;
                    const { bg: itemBg, text: itemText } = getRiskColor(d.level);
                    const temp = d.telemetry?.temperature ? `${d.telemetry.temperature}°C` : '';
                    const crop = d.majorCrop || (d.crops && d.crops[0]) || '';

                    return (
                      <button
                        key={name}
                        onClick={() => handleStateSelect(name)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '11px 18px',
                          background: isSelected ? 'var(--pale-green)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--beige)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#FAF7F2'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.1rem' }}>{getCropIcon(crop)}</span>
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 700, color: '#1F2937' }}>
                              {name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-medium)', marginTop: 1 }}>
                              {crop} {temp && `• ${temp}`} • {d.telemetry?.weather_condition || 'Clear'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            background: itemBg,
                            color: itemText,
                            padding: '2px 8px',
                            borderRadius: 99,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                          }}>
                            {d.score} • {d.level}
                          </span>
                          <ChevronRight size={14} color={isSelected ? 'var(--forest-green)' : '#D1D5DB'} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selected State Live Intelligence Hub */}
          <div>
            {selectedData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 1. Hero State Card */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1.5px solid var(--beige)',
                  padding: '22px 24px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--forest-green)', margin: 0 }}>
                          {selected}
                        </h2>
                        <span style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 99,
                          border: '1px solid #86EFAC',
                        }}>
                          LIVE TELEMETRY
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-medium)' }}>
                        Agricultural Station Coordinates: {selectedData.latitude?.toFixed(2)}°N, {selectedData.longitude?.toFixed(2)}°E
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: activeBg,
                        color: activeText,
                        padding: '4px 12px',
                        borderRadius: 99,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        transition: 'all 0.2s ease',
                      }}>
                        {activeLevel} RISK
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-green)' }}>
                        {activeScore}<span style={{ fontSize: '0.80rem', color: 'var(--text-light)', fontWeight: 600 }}>/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Gradient Risk Meter Needle */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-medium)', fontWeight: 700, marginBottom: 5 }}>
                      <span style={{ color: '#16A34A' }}>0 (SAFE)</span>
                      <span style={{ color: 'var(--forest-green)' }}>CURRENT INDEX: {activeScore}/100</span>
                      <span style={{ color: '#DC2626' }}>100 (CRITICAL)</span>
                    </div>
                    <div style={{ position: 'relative', height: 9, borderRadius: 99, background: 'linear-gradient(to right, #16A34A 0%, #16A34A 34%, #D97706 35%, #D97706 54%, #EA580C 55%, #EA580C 74%, #DC2626 75%, #DC2626 100%)' }}>
                      <div style={{
                        position: 'absolute',
                        left: `${Math.max(3, Math.min(97, activeScore))}%`,
                        top: -4,
                        transform: 'translateX(-50%)',
                        width: 17,
                        height: 17,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        border: '3px solid #1C2B0E',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.35)',
                      }} />
                    </div>
                  </div>

                  {/* Active Crop Selector Pills */}
                  <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 14 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--forest-green)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Wheat size={13} color="var(--forest-green)" />
                      SELECT PRIMARY CROP TO TAILOR ADVISORY:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {availableCrops.map((crop) => {
                        const isCropActive = crop.toLowerCase() === activeCrop.toLowerCase();
                        const cAdv = getCropAdvisory(crop);
                        const cScore = cAdv?.score ?? activeScore;
                        const { bg: cBg, text: cTx } = getRiskColor(cAdv?.level || 'MODERATE');

                        return (
                          <button
                            key={crop}
                            onClick={() => setSelectedCrop(crop)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 13px',
                              borderRadius: 20,
                              fontSize: '0.78rem',
                              fontWeight: isCropActive ? 800 : 600,
                              cursor: 'pointer',
                              border: isCropActive ? '1.5px solid var(--forest-green)' : '1px solid var(--beige)',
                              background: isCropActive ? 'var(--forest-green)' : '#FAF7F2',
                              color: isCropActive ? '#FFFFFF' : '#1F2937',
                              boxShadow: isCropActive ? '0 2px 6px rgba(45, 80, 22, 0.25)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{getCropIcon(crop)}</span>
                            <span>{crop}</span>
                            <span style={{
                              fontSize: '0.69rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: 99,
                              background: isCropActive ? 'rgba(255, 255, 255, 0.25)' : cBg,
                              color: isCropActive ? '#FFFFFF' : cTx,
                              marginLeft: 2,
                            }}>
                              {cScore}
                            </span>
                            {isCropActive && <span style={{ fontSize: '0.70rem' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Real-Time Live Weather Observations Grid (100% Real Open-Meteo Data) */}
                {selectedData.telemetry && (
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1.5px solid var(--beige)',
                    padding: '20px 24px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--forest-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Radio size={13} color="#16A34A" />
                        REAL-TIME METEOROLOGICAL OBSERVATIONS
                      </div>
                      <span style={{ fontSize: '0.70rem', color: 'var(--text-medium)' }}>
                        Station: Open-Meteo / IMD WMO Ground Grid
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 10,
                    }}>
                      {/* Temperature */}
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.70rem', color: '#991B1B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Thermometer size={14} color="#EF4444" /> Temperature
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', marginTop: 4 }}>
                          {selectedData.telemetry.temperature}°C
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#B91C1C', marginTop: 2 }}>
                          {selectedData.telemetry.weather_condition}
                        </div>
                      </div>

                      {/* Humidity */}
                      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.70rem', color: '#1E40AF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Droplets size={14} color="#3B82F6" /> Humidity
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                          {selectedData.telemetry.humidity}%
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#2563EB', marginTop: 2 }}>
                          {selectedData.telemetry.humidity >= 75 ? 'High Moisture' : 'Optimal Window'}
                        </div>
                      </div>

                      {/* Precipitation */}
                      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.70rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CloudRain size={14} color="#16A34A" /> Rainfall
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginTop: 4 }}>
                          {selectedData.telemetry.precipitation_mm} mm
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#15803D', marginTop: 2 }}>
                          {selectedData.telemetry.precipitation_mm > 0 ? 'Active Showers' : 'Dry Interval'}
                        </div>
                      </div>

                      {/* Wind Speed & Spray Window */}
                      <div style={{ background: isSpraySafe ? '#F0FDF4' : '#FFF7ED', border: isSpraySafe ? '1px solid #BBF7D0' : '1px solid #FED7AA', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.70rem', color: isSpraySafe ? '#166534' : '#9A3412', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Wind size={14} color={isSpraySafe ? '#16A34A' : '#EA580C'} /> Wind Speed
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isSpraySafe ? '#166534' : '#9A3412', marginTop: 4 }}>
                          {selectedData.telemetry.wind_speed_kmh} <span style={{ fontSize: '0.74rem' }}>km/h</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isSpraySafe ? '#15803D' : '#C2410C', marginTop: 2 }}>
                          {isSpraySafe ? '✓ Safe Spray Window' : '⚠️ Spray Drift Alert'}
                        </div>
                      </div>

                      {/* Soil Moisture */}
                      <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.70rem', color: '#6B21A8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Sprout size={14} color="#9333EA" /> Soil Moisture
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6B21A8', marginTop: 4 }}>
                          {selectedData.telemetry.soil_moisture}%
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#7E22CE', marginTop: 2 }}>
                          0–1cm Depth Sensor
                        </div>
                      </div>

                      {/* Surface Pressure */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.70rem', color: '#334155', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Gauge size={14} color="#64748B" /> Pressure
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155', marginTop: 4 }}>
                          {selectedData.telemetry.surface_pressure} <span style={{ fontSize: '0.74rem' }}>hPa</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 2 }}>
                          Atmospheric Field Bar
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Real 7-Day Agro-Weather Outlook (100% Real Forecast from Open-Meteo) */}
                {selectedData.forecast_7d?.length > 0 && (
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1.5px solid var(--beige)',
                    padding: '20px 24px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--forest-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="var(--forest-green)" />
                        7-DAY AGRO-METEOROLOGICAL OUTLOOK ({selected})
                      </div>
                      <span style={{ fontSize: '0.70rem', color: 'var(--text-medium)' }}>
                        Max/Min Temps & Rain Probability
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))',
                      gap: 8,
                    }}>
                      {selectedData.forecast_7d.map((fc, i) => {
                        const isRainy = fc.rain_prob_pct >= 40 || fc.precipitation_mm > 1.0;
                        return (
                          <div key={fc.date || i} style={{
                            background: isRainy ? '#F0F9FF' : '#FAF7F2',
                            border: isRainy ? '1.5px solid #BAE6FD' : '1px solid var(--beige)',
                            borderRadius: 10,
                            padding: '10px 8px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1F2937' }}>
                              {fc.day}
                            </span>
                            <span style={{ fontSize: '0.66rem', color: 'var(--text-light)' }}>
                              {fc.date.slice(5)}
                            </span>
                            <div style={{ fontSize: '1.2rem', margin: '2px 0' }}>
                              {isRainy ? '🌧️' : (fc.temp_max >= 34 ? '☀️' : '⛅')}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111827' }}>
                              {Math.round(fc.temp_max)}° <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-medium)' }}>/ {Math.round(fc.temp_min)}°</span>
                            </div>
                            {/* Rain Probability Bar */}
                            <div style={{ width: '100%', marginTop: 2 }}>
                              <div style={{ height: 4, borderRadius: 99, background: '#E5E7EB', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, fc.rain_prob_pct)}%`, background: isRainy ? '#0284C7' : '#9CA3AF', borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: '0.64rem', color: isRainy ? '#0284C7' : 'var(--text-light)', fontWeight: 700, marginTop: 2, display: 'block' }}>
                                {fc.rain_prob_pct}% rain
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Real Agronomic Stressors & Field Protection Advisories */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1.5px solid var(--beige)',
                  padding: '20px 24px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  {/* Contributing Stressors */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--forest-green)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} color="#EA580C" />
                      PHYSICAL STRESSORS DETECTED FOR {activeCrop.toUpperCase()}
                    </div>
                    {activeFactors?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeFactors.map((f, i) => (
                          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA580C', marginTop: 6, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.82rem', color: '#1F2937', lineHeight: 1.45 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.80rem', color: 'var(--text-light)' }}>Normal conditions within safe agronomic parameters.</div>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div style={{ borderTop: '1px solid var(--beige)', paddingTop: 16 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--forest-green)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} color="var(--forest-green)" />
                      ACTIONABLE AGRONOMIC & SPRAY ADVISORIES
                    </div>
                    {activeActions?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeActions.map((a, i) => (
                          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                            <CheckCircle2 size={14} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.82rem', color: '#1F2937', lineHeight: 1.45, fontWeight: 500 }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.80rem', color: 'var(--text-light)' }}>Maintain standard cultivation and planned irrigation scheduling.</div>
                    )}
                  </div>
                </div>

                {/* 5. Monitored Districts in this State */}
                {selectedData.districts?.length > 0 && (
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1.5px solid var(--beige)',
                    padding: '20px 24px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--forest-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="var(--forest-green)" />
                        MONITORED AGRICULTURAL DISTRICTS IN {selected.toUpperCase()} ({selectedData.districts.length})
                      </div>
                      <span style={{ fontSize: '0.70rem', color: 'var(--text-medium)' }}>Distinct Ground Coordinates</span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                      gap: 10,
                    }}>
                      {selectedData.districts.map((d) => {
                        const { bg: dBg, text: dTx } = getRiskColor(d.level);
                        return (
                          <div key={d.name} style={{
                            background: '#FAF7F2',
                            border: '1px solid var(--beige)',
                            borderRadius: 10,
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 800, color: '#1F2937', fontSize: '0.82rem' }}>{d.name}</span>
                              <span style={{
                                background: dBg,
                                color: dTx,
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: 99,
                              }}>
                                {d.score}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.70rem', color: 'var(--text-medium)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>{getCropIcon(d.major_crops?.[0])}</span>
                              <span>{d.major_crops?.[0] || 'Various'}</span>
                            </div>

                            <div style={{
                              borderTop: '1px dashed var(--beige)',
                              paddingTop: 4,
                              marginTop: 2,
                              fontSize: '0.68rem',
                              color: 'var(--text-medium)',
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}>
                              <span>🌡️ {d.temperature}°C</span>
                              <span>💧 {d.humidity}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid var(--beige)',
                padding: 48,
                textAlign: 'center',
              }}>
                <MapPin size={42} color="var(--forest-green)" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest-green)', marginBottom: 6 }}>
                  Select an Agricultural Region
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
                  Click any state marker on the map or select a region from the directory to inspect live weather observations and 7-day agro-forecasts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .live-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 980px) {
          .regions-dual-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
