import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Loader2, BarChart3,
  ShieldCheck, Sprout, Info, DollarSign, AlertCircle, ArrowRight,
  MapPin, Crosshair, RefreshCw, Layers, CloudRain, Thermometer,
  Bug, TrendingUp, Check, HelpCircle, Activity, Calendar, Compass
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Button from '../components/Button';
import DecisionSupportSection from '../components/DecisionSupportSection';
import { predictUnifiedRisk } from '../services/riskApi';
import { getDecisionSupport } from '../services/decisionSupportApi';
import { CROPS, SEASONS, REGIONS, STATE_DISTRICTS } from '../data/constants';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Marker Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to center map on coordinate change
function LocationMapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

const INITIAL_FORM = {
  state: '',
  district: '',
  crop: '',
  season: '',
  sowing_date: '',
  farm_area: '',
  soil_ph: '',
  nitrogen: '',
  irrigation_available: false,
};

export default function RiskAnalysis() {
  const [form, setForm]               = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusState, setStatusState] = useState('INITIAL'); // INITIAL | LOADING | SUCCESS | INSUFFICIENT_DATA | VALIDATION_ERROR | API_ERROR | NETWORK_ERROR
  const [result, setResult]           = useState(null);
  const [decisionSupport, setDecisionSupport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFormula, setShowFormula] = useState(false);

  // GPS Location Detection State
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [gpsError, setGpsError]       = useState('');
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [confirmedLocationBadge, setConfirmedLocationBadge] = useState('');

  const districtsForState = form.state ? (STATE_DISTRICTS[form.state] || []) : [];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setForm(prev => ({
      ...prev,
      state: newState,
      district: '',
    }));
    setConfirmedLocationBadge('');
    setFieldErrors(prev => ({ ...prev, state: false, district: false }));
  };

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setFieldErrors(prev => ({ ...prev, [key]: false }));
  };

  // GPS Detection Workflow
  const handleUseMyLocation = () => {
    setGpsError('');
    setDetectedLocation(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please select your State and District manually.');
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (!res.ok) {
            throw new Error('Reverse geocoding service unavailable');
          }

          const data = await res.json();
          const addr = data.address || {};

          const rawState = addr.state || '';
          const rawDistrict = addr.state_district || addr.county || addr.district || addr.city || '';
          const locality = addr.suburb || addr.village || addr.town || addr.municipality || addr.city || '';

          // Match against supported Indian agricultural states & districts
          let matchedState = '';
          let matchedDistrict = '';

          for (const s of REGIONS) {
            if (rawState.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rawState.toLowerCase())) {
              matchedState = s;
              break;
            }
          }

          if (matchedState && STATE_DISTRICTS[matchedState]) {
            const districtList = STATE_DISTRICTS[matchedState];
            for (const d of districtList) {
              if (rawDistrict.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(rawDistrict.toLowerCase())) {
                matchedDistrict = d;
                break;
              }
            }
            // If exact district not matched, fallback to first supported district in matched state if needed
            if (!matchedDistrict && districtList.length > 0) {
              matchedDistrict = districtList[0];
            }
          }

          const isSupported = Boolean(matchedState && matchedDistrict);

          setDetectedLocation({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            rawState,
            rawDistrict,
            locality,
            matchedState,
            matchedDistrict,
            isSupported,
          });
        } catch (err) {
          console.error('Reverse geocode failed:', err);
          setGpsError('Unable to reverse-geocode coordinates. Please select your State and District manually.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        switch (err.code) {
          case 1:
            setGpsError('Location permission was denied. Please select your State and District manually.');
            break;
          case 2:
            setGpsError('GPS position is unavailable. Please select your State and District manually.');
            break;
          case 3:
            setGpsError('Location request timed out. Please select your State and District manually.');
            break;
          default:
            setGpsError('Unable to detect your location. Select your location manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmLocation = () => {
    if (detectedLocation && detectedLocation.matchedState && detectedLocation.matchedDistrict) {
      setForm(prev => ({
        ...prev,
        state: detectedLocation.matchedState,
        district: detectedLocation.matchedDistrict,
      }));
      setConfirmedLocationBadge(`${detectedLocation.matchedDistrict}, ${detectedLocation.matchedState}`);
      setDetectedLocation(null);
      setGpsError('');
      setFieldErrors(prev => ({ ...prev, state: false, district: false }));
    }
  };

  const handleChangeLocation = () => {
    setDetectedLocation(null);
    setConfirmedLocationBadge('');
    setForm(prev => ({ ...prev, state: '', district: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Required Field Validation
    const errors = {};
    if (!form.state) errors.state = true;
    if (!form.district) errors.district = true;
    if (!form.crop) errors.crop = true;
    if (!form.season) errors.season = true;
    if (!form.sowing_date) errors.sowing_date = true;

    // 2. Farm Area Validation (> 0 numeric)
    const areaVal = parseFloat(form.farm_area);
    if (!form.farm_area || isNaN(areaVal) || areaVal <= 0) {
      errors.farm_area = true;
    }

    // 3. Optional Soil pH Validation (0 to 14 if provided)
    if (form.soil_ph !== '' && form.soil_ph !== null && form.soil_ph !== undefined) {
      const ph = parseFloat(form.soil_ph);
      if (isNaN(ph) || ph < 0 || ph > 14) {
        errors.soil_ph = true;
      }
    }

    // 4. Optional Available Nitrogen Validation (>= 0 if provided)
    if (form.nitrogen !== '' && form.nitrogen !== null && form.nitrogen !== undefined) {
      const n = parseFloat(form.nitrogen);
      if (isNaN(n) || n < 0) {
        errors.nitrogen = true;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatusState('VALIDATION_ERROR');
      if (errors.soil_ph) {
        setErrorMessage('Soil pH must be a valid number between 0 and 14.');
      } else if (errors.nitrogen) {
        setErrorMessage('Available Nitrogen must be a valid non-negative number in kg/ha.');
      } else if (errors.farm_area) {
        setErrorMessage('Please enter a valid farm area in hectares greater than 0.');
      } else {
        setErrorMessage('Please complete all required farm details before running the analysis.');
      }
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    setStatusState('LOADING');

    try {
      const payload = {
        state: form.state,
        district: form.district,
        crop: form.crop,
        season: form.season,
        sowing_date: form.sowing_date,
        farm_area: parseFloat(form.farm_area),
        soil_ph: form.soil_ph !== '' ? parseFloat(form.soil_ph) : null,
        nitrogen: form.nitrogen !== '' ? parseFloat(form.nitrogen) : null,
        irrigation_available: Boolean(form.irrigation_available),
      };

      const [res, dsRes] = await Promise.all([
        predictUnifiedRisk(payload),
        getDecisionSupport(payload).catch(() => null)
      ]);

      if (res && res.prediction_allowed) {
        setResult(res);
        setDecisionSupport(dsRes);
        setStatusState('SUCCESS');
        setTimeout(() => {
          document.getElementById('risk-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setStatusState('INSUFFICIENT_DATA');
        setErrorMessage(res?.detail?.detail || res?.reason || 'Insufficient verified agricultural data for this location/crop.');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('422') || msg.includes('INSUFFICIENT_VERIFIED_DATA')) {
        setStatusState('INSUFFICIENT_DATA');
        setErrorMessage(msg);
      } else {
        setStatusState('API_ERROR');
        setErrorMessage('Unable to complete the agricultural risk analysis. Please check your details and try again.');
      }
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setDecisionSupport(null);
    setStatusState('INITIAL');
    setErrorMessage('');
    setFieldErrors({});
    setDetectedLocation(null);
    setConfirmedLocationBadge('');
    setGpsError('');
  };

  const is2026Sowing = form.sowing_date?.startsWith('2026');

  const getRiskBadgeStyles = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW':
        return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', border: 'border-[#86EFAC]' };
      case 'MODERATE':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' };
      case 'HIGH':
        return { bg: 'bg-[#FFEDD5]', text: 'text-[#9A3412]', border: 'border-[#FDBA74]' };
      case 'CRITICAL':
      default:
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-6 px-4 sm:px-6 lg:px-8 text-[#1C2B0E]">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Card with High Contrast & Clear Hierarchy */}
        <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4E5] text-[#244211] text-xs font-extrabold tracking-wide uppercase border border-[#C6DCB8] mb-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5016]" />
                AGRIRISK ML v1.0 • REAL DATA ENGINE
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A330B] tracking-tight">
                Agricultural Risk & Yield Analysis
              </h1>
              <p className="text-[#3E522D] text-sm sm:text-base mt-1 max-w-2xl font-medium">
                Enter your farm details to estimate agricultural risk and expected yield using the verified AgriRisk model.
              </p>
            </div>

            {/* Compact Data Provenance Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-[#2D5016] font-bold">
                Weather — Verified 2025
              </span>
              <span className="bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-[#2D5016] font-bold">
                Market — Verified 2025
              </span>
              <span className="bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-[#2D5016] font-bold">
                Harvest Outcomes — 2012–2025
              </span>
            </div>
          </div>
        </div>

        {/* Sowing 2026 Notice */}
        {is2026Sowing && (
          <div className="bg-[#FEF9EE] border border-[#F5D89A] rounded-xl p-3.5 flex items-center gap-3 text-[#7C5310] text-xs sm:text-sm font-medium shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0" />
            <span>
              <strong>Operational Notice:</strong> Historical verified outcomes available through 2025. 2026 results are predictions, not observed harvest outcomes.
            </span>
          </div>
        )}

        {/* 5-Step Workflow Progress Indicator */}
        <div className="bg-white border border-[#E2DBD0] rounded-xl p-2 sm:p-3 shadow-sm overflow-x-auto">
          <div className="flex sm:grid sm:grid-cols-5 gap-2 min-w-max sm:min-w-0">
            {/* Step 1 */}
            <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition ${
              statusState === 'INITIAL' || statusState === 'VALIDATION_ERROR'
                ? 'bg-[#2D5016] text-white border-[#2D5016] shadow-sm'
                : 'bg-[#F7F5F0] text-[#1C2B0E] border-[#E2DBD0]'
            }`}>
              <div className={`w-6 h-6 rounded-full font-black flex items-center justify-center text-xs shrink-0 ${
                statusState === 'INITIAL' || statusState === 'VALIDATION_ERROR' ? 'bg-white text-[#2D5016]' : 'bg-[#2D5016] text-white'
              }`}>1</div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Step 1</div>
                <div className="text-xs font-extrabold truncate">Farm Location</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition ${
              form.state && form.district && statusState === 'INITIAL'
                ? 'bg-[#EBF4E5] text-[#244211] border-[#BBD7A8]'
                : 'bg-[#F7F5F0] text-[#1C2B0E] border-[#E2DBD0]'
            }`}>
              <div className="w-6 h-6 rounded-full font-black flex items-center justify-center text-xs shrink-0 bg-[#2D5016] text-white">2</div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Step 2</div>
                <div className="text-xs font-extrabold truncate">Farm Details</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition ${
              statusState === 'LOADING'
                ? 'bg-[#2D5016] text-white border-[#2D5016] shadow-sm'
                : 'bg-[#F7F5F0] text-[#1C2B0E] border-[#E2DBD0]'
            }`}>
              <div className={`w-6 h-6 rounded-full font-black flex items-center justify-center text-xs shrink-0 ${
                statusState === 'LOADING' ? 'bg-white text-[#2D5016]' : 'bg-[#D4E9B8] text-[#2D5016]'
              }`}>3</div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Step 3</div>
                <div className="text-xs font-extrabold truncate">Risk Prediction</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition ${
              statusState === 'SUCCESS'
                ? 'bg-[#2D5016] text-white border-[#2D5016] shadow-sm'
                : 'bg-[#F7F5F0] text-[#1C2B0E] border-[#E2DBD0]'
            }`}>
              <div className={`w-6 h-6 rounded-full font-black flex items-center justify-center text-xs shrink-0 ${
                statusState === 'SUCCESS' ? 'bg-white text-[#2D5016]' : 'bg-[#D4E9B8] text-[#2D5016]'
              }`}>4</div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Step 4</div>
                <div className="text-xs font-extrabold truncate">Results</div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-2.5 rounded-lg border flex items-center gap-2.5 bg-[#F7F5F0] text-[#1C2B0E] border-[#E2DBD0]">
              <div className="w-6 h-6 rounded-full font-black flex items-center justify-center text-xs shrink-0 bg-[#D4E9B8] text-[#2D5016]">5</div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">Step 5</div>
                <div className="text-xs font-extrabold truncate">Protection Info</div>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Location Detection Modal / Card */}
        {detectedLocation && (
          <div className="bg-white border-2 border-[#2D5016] rounded-2xl p-6 shadow-md space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E2DBD0] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2D5016]" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1C2B0E]">
                  LOCATION DETECTED (GPS)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                ✓ Location Detected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Detected Details */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-semibold">State:</span>
                    <strong className="text-[#1C2B0E]">{detectedLocation.matchedState || detectedLocation.rawState || 'Unspecified'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-semibold">District:</span>
                    <strong className="text-[#1C2B0E]">{detectedLocation.matchedDistrict || detectedLocation.rawDistrict || 'Unspecified'}</strong>
                  </div>
                  {detectedLocation.locality && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B] font-semibold">Locality:</span>
                      <span className="text-[#1C2B0E] font-medium">{detectedLocation.locality}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#E2DBD0] pt-2">
                    <span className="text-[#64748B] font-semibold">GPS Accuracy:</span>
                    <span className="text-[#2D5016] font-bold">±{detectedLocation.accuracy} meters</span>
                  </div>
                </div>

                {!detectedLocation.isSupported && (
                  <div className="bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-xl text-xs text-[#991B1B]">
                    <strong>Unsupported Region:</strong> Your detected location is currently outside the supported agricultural prediction region. Please select a supported location manually.
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmLocation}
                    disabled={!detectedLocation.isSupported}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 ${
                      detectedLocation.isSupported
                        ? 'bg-[#2D5016] hover:bg-[#1E360F] text-white shadow-sm cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    Confirm Location
                  </button>

                  <button
                    type="button"
                    onClick={handleChangeLocation}
                    className="bg-white hover:bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer"
                  >
                    Change Location
                  </button>
                </div>
              </div>

              {/* Compact Interactive Leaflet GPS Confirmation Map */}
              <div className="h-52 rounded-xl overflow-hidden border border-[#E2DBD0] relative shadow-inner">
                <MapContainer
                  center={[detectedLocation.latitude, detectedLocation.longitude]}
                  zoom={12}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <LocationMapController center={[detectedLocation.latitude, detectedLocation.longitude]} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[detectedLocation.latitude, detectedLocation.longitude]}>
                    <Popup>
                      <div className="p-1 text-xs">
                        <strong>{detectedLocation.matchedDistrict || detectedLocation.rawDistrict}</strong>
                        <div className="text-[11px] text-gray-600">
                          {detectedLocation.matchedState || detectedLocation.rawState}<br />
                          Accuracy: ±{detectedLocation.accuracy}m
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* GPS Error Notification */}
        {gpsError && (
          <div className="bg-[#FEF2F2] border border-[#F87171] rounded-xl p-3.5 flex items-center justify-between gap-3 text-[#991B1B] text-xs sm:text-sm font-semibold shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
              <span>{gpsError}</span>
            </div>
            <button
              onClick={() => setGpsError('')}
              className="text-[#991B1B] hover:text-[#7F1D1D] font-bold text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Farm Details Input Form Card */}
        <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2DBD0]">
            <div>
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-[#2D5016]">
                FARM DETAILS & FIELD PARAMETERS
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5D3B] font-medium mt-0.5">
                Complete your farm information to run the agricultural risk & yield prediction.
              </p>
            </div>

            {/* Use My Location GPS Button */}
            <div className="flex items-center gap-3">
              {confirmedLocationBadge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4E5] text-[#244211] text-xs font-extrabold border border-[#C6DCB8]">
                  <CheckCircle2 size={14} className="text-[#16A34A]" />
                  {confirmedLocationBadge}
                </span>
              )}

              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={gpsLoading}
                className="bg-[#F4F1EA] hover:bg-[#EAE4D6] text-[#2D5016] border border-[#DDD5C7] px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="Detect state and district via browser GPS"
              >
                {gpsLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#2D5016]" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair size={14} className="text-[#2D5016]" />
                    <span>📍 Use My Location</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* GROUP 1: LOCATION */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#2D5016] mb-3 flex items-center gap-1.5">
                <MapPin size={15} /> 1. Farm Location
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* State */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    State / Region <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={handleStateChange}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.state ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none`}
                  >
                    <option value="">Select State</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    District <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.district}
                    disabled={!form.state}
                    onChange={e => handleChange('district', e.target.value)}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.district ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none ${
                      !form.state ? 'bg-[#F1F3F0] opacity-70 cursor-not-allowed text-[#64748B]' : ''
                    }`}
                  >
                    <option value="">{form.state ? 'Select District' : 'Select State First'}</option>
                    {districtsForState.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* GROUP 2: CROP INFORMATION */}
            <div className="pt-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#2D5016] mb-3 flex items-center gap-1.5">
                <Sprout size={15} /> 2. Crop Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Crop */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    Crop Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.crop}
                    onChange={e => handleChange('crop', e.target.value)}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.crop ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none`}
                  >
                    <option value="">Select Crop</option>
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Season */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    Season <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.season}
                    onChange={e => handleChange('season', e.target.value)}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.season ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none`}
                  >
                    <option value="">Select Season</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Farm Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    Farm Area (Hectares) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    value={form.farm_area}
                    onChange={e => handleChange('farm_area', e.target.value)}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.farm_area ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm placeholder-[#64748B] focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none`}
                    placeholder="e.g. 4.0"
                  />
                </div>

                {/* Sowing Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    Sowing Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.sowing_date}
                    onChange={e => handleChange('sowing_date', e.target.value)}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.sowing_date ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none`}
                  />
                </div>
              </div>
            </div>

            {/* GROUP 3: SOIL & FARM CONDITIONS */}
            <div className="pt-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#2D5016] mb-3 flex items-center gap-1.5">
                <Layers size={15} /> 3. Soil & Farm Conditions
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Soil pH */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    Soil pH <span className="text-[#64748B] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={form.soil_ph}
                    onChange={e => handleChange('soil_ph', e.target.value)}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.soil_ph ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm placeholder-[#64748B] focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none`}
                    placeholder="Optional (e.g. 6.5)"
                  />
                </div>

                {/* Available Nitrogen */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C2B0E] mb-1.5">
                    Available Nitrogen <span className="text-[#64748B] font-normal lowercase">(kg/ha, optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={form.nitrogen}
                    onChange={e => handleChange('nitrogen', e.target.value)}
                    className={`w-full bg-[#FAFAF8] border ${
                      fieldErrors.nitrogen ? 'border-red-500 ring-2 ring-red-200' : 'border-[#CBD5E1]'
                    } rounded-xl px-3.5 py-2.5 text-[#1C2B0E] font-medium text-sm placeholder-[#64748B] focus:bg-white focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/20 transition outline-none`}
                    placeholder="Optional (e.g. 240)"
                  />
                </div>

                {/* Irrigation Toggle */}
                <div className="flex items-center pt-2 md:pt-6">
                  <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#CBD5E1] bg-[#FAFAF8]">
                    <input
                      type="checkbox"
                      id="irrigation"
                      checked={form.irrigation_available}
                      onChange={e => handleChange('irrigation_available', e.target.checked)}
                      className="w-5 h-5 rounded border-[#94A3B8] text-[#2D5016] focus:ring-[#2D5016] cursor-pointer"
                    />
                    <label htmlFor="irrigation" className="text-xs sm:text-sm font-bold text-[#1C2B0E] select-none cursor-pointer">
                      Irrigation Facility Available
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="bg-[#FEE2E2] border border-[#F87171] rounded-xl p-3.5 flex items-center gap-3 text-[#991B1B] text-xs sm:text-sm font-semibold shadow-sm">
                <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit & Reset Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={statusState === 'LOADING'}
                className="bg-[#2D5016] hover:bg-[#1E360F] text-white px-7 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
              >
                {statusState === 'LOADING' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Analyzing Farm Data...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 text-white" />
                    <span>Predict Risk & Yield</span>
                    <ArrowRight className="w-4 h-4 text-[#D4E9B8]" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleReset}
                className="bg-white hover:bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-5 py-3 rounded-xl font-semibold text-sm transition cursor-pointer"
              >
                Reset Form
              </button>
            </div>

          </form>
        </div>

        {/* Compact Empty State before prediction */}
        {statusState === 'INITIAL' && !result && (
          <div className="bg-white border border-dashed border-[#CBD5E1] rounded-2xl p-6 sm:p-7 text-center shadow-sm">
            <Sprout className="w-9 h-9 text-[#2D5016] mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-[#1C2B0E] uppercase tracking-wide">Ready for Agricultural Analysis</h3>
            <p className="text-[#4A5D3B] text-xs sm:text-sm max-w-lg mx-auto mt-1 font-medium">
              Enter your farm details above and click "Predict Risk & Yield Outcome" to view your risk score, expected yield, and key risk factors.
            </p>
          </div>
        )}

        {/* Professional Result Dashboard View */}
        {statusState === 'SUCCESS' && result && (
          <div id="risk-results" className="space-y-6 animate-fadeIn">

            {/* Executive Plain-English Risk Interpretation Banner */}
            <div className="bg-white border-2 border-[#2D5016]/30 rounded-2xl p-5 sm:p-6 shadow-sm bg-gradient-to-r from-white via-[#F9FBF7] to-[#F2F7EE]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2DBD0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5016] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Compass className="w-6 h-6 text-[#D4E9B8]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#2D5016]">
                      EXECUTIVE RISK INTERPRETATION • WHAT THIS MEANS FOR YOUR FARM
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      {result.risk_explanation?.summary || `Farm Risk Assessment: ${result.risk.score}/100 (${result.risk.level} Risk)`}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const badge = getRiskBadgeStyles(result.risk.level);
                    return (
                      <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide border shadow-2xs ${badge.bg} ${badge.text} ${badge.border}`}>
                        {result.risk.level} RISK LEVEL
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs sm:text-sm text-[#2D3B1F] leading-relaxed font-medium">
                  {result.risk_explanation?.score_meaning || `Your farm in ${result.district} is subject to ${result.risk.level.toLowerCase()} environmental hazard conditions.`}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <div className="inline-flex items-center gap-1.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] px-3 py-1.5 rounded-lg font-bold">
                    <AlertTriangle size={14} className="text-[#DC2626]" />
                    <span>Primary Hazard Driver: <strong>{result.risk_explanation?.primary_driver || result.risk.top_factors[0] || 'Agro-climatic variation'}</strong></span>
                  </div>
                  {result.risk_explanation?.secondary_driver && (
                    <div className="inline-flex items-center gap-1.5 bg-[#FEF9EE] border border-[#F5D89A] text-[#7C5310] px-3 py-1.5 rounded-lg font-bold">
                      <AlertCircle size={14} className="text-[#B45309]" />
                      <span>Secondary Factor: <strong>{result.risk_explanation.secondary_driver}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Key Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* OUTPUT B: Agricultural Condition Risk */}
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D5016]">
                    AGRICULTURAL RISK ASSESSMENT
                  </span>
                  {(() => {
                    const badge = getRiskBadgeStyles(result.risk.level);
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {result.risk.level} RISK
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-black text-[#1C2B0E]">{result.risk.score}</span>
                  <span className="text-[#64748B] text-base sm:text-lg font-bold">/ 100</span>
                </div>
                <p className="text-xs text-[#526642] mb-4 font-medium">
                  Composite condition hazard index (Weather 35%, Soil 20%, Pest 15%, Stability 20%, Market 10%).
                </p>

                {/* 5 Dimensions Breakdown */}
                <div className="space-y-3 pt-3 border-t border-[#E2DBD0]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1C2B0E] font-semibold">Weather Risk (35%)</span>
                    <span className="font-bold text-[#1C2B0E]">{result.risk.dimensions.weather} / 100</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                    <div className="bg-[#0284C7] h-2 rounded-full" style={{ width: `${result.risk.dimensions.weather}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1C2B0E] font-semibold">Soil Health Risk (20%)</span>
                    <span className="font-bold text-[#1C2B0E]">{result.risk.dimensions.soil} / 100</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                    <div className="bg-[#D97706] h-2 rounded-full" style={{ width: `${result.risk.dimensions.soil}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1C2B0E] font-semibold">Pest Pressure Risk (15%)</span>
                    <span className="font-bold text-[#1C2B0E]">{result.risk.dimensions.pest} / 100</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                    <div className="bg-[#DC2626] h-2 rounded-full" style={{ width: `${result.risk.dimensions.pest}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1C2B0E] font-semibold">Yield Stability Risk (20%)</span>
                    <span className="font-bold text-[#1C2B0E]">{result.risk.dimensions.yield_stability} / 100</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                    <div className="bg-[#7C3AED] h-2 rounded-full" style={{ width: `${result.risk.dimensions.yield_stability}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1C2B0E] font-semibold">APMC Market Risk (10%)</span>
                    <span className="font-bold text-[#1C2B0E]">{result.risk.dimensions.market} / 100</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                    <div className="bg-[#16A34A] h-2 rounded-full" style={{ width: `${result.risk.dimensions.market}%` }}></div>
                  </div>
                </div>

                {/* Calculation Transparency Formula Toggle */}
                <div className="pt-4 mt-3 border-t border-[#E2DBD0]">
                  <button
                    type="button"
                    onClick={() => setShowFormula(prev => !prev)}
                    className="w-full flex items-center justify-between text-xs font-bold text-[#2D5016] hover:text-[#1A330B] py-1 cursor-pointer transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-[#2D5016]" />
                      How was this {result.risk.score}/100 score calculated?
                    </span>
                    <span className="text-[11px] underline font-semibold">{showFormula ? 'Hide Formula' : 'View Formula'}</span>
                  </button>

                  {showFormula && (
                    <div className="mt-2.5 p-3.5 bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl text-xs space-y-2 text-[#3E522D] animate-fadeIn">
                      <div className="font-extrabold text-[#1C2B0E]">
                        Weighted Hazard Formula:
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-[#DDD5C7] text-[#1C2B0E]">
                        Score = (Weather × 35%) + (Soil × 20%) + (Pest × 15%) + (Stability × 20%) + (Market × 10%)
                      </div>
                      <div className="text-[11px] text-[#4A5D3B] space-y-1">
                        <div>• Weather: {result.risk.dimensions.weather} × 0.35 = <strong>{(result.risk.dimensions.weather * 0.35).toFixed(1)}</strong></div>
                        <div>• Soil: {result.risk.dimensions.soil} × 0.20 = <strong>{(result.risk.dimensions.soil * 0.20).toFixed(1)}</strong></div>
                        <div>• Pest & Disease: {result.risk.dimensions.pest} × 0.15 = <strong>{(result.risk.dimensions.pest * 0.15).toFixed(1)}</strong></div>
                        <div>• Yield Stability: {result.risk.dimensions.yield_stability} × 0.20 = <strong>{(result.risk.dimensions.yield_stability * 0.20).toFixed(1)}</strong></div>
                        <div>• Mandi Economics: {result.risk.dimensions.market} × 0.10 = <strong>{(result.risk.dimensions.market * 0.10).toFixed(1)}</strong></div>
                        <div className="pt-1.5 border-t border-[#DDD5C7] font-bold text-[#1C2B0E]">
                          Total Calculated Composite = {result.risk.score} / 100 ({result.risk.level} Tier)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* OUTPUT A: Expected Yield & Prediction Range */}
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D5016]">
                    EXPECTED YIELD
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF4E5] text-[#244211] border border-[#C6DCB8]">
                    {result.crop} • {result.district}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-black text-[#2D5016]">{result.yield_prediction.expected_yield}</span>
                  <span className="text-[#4A5D3B] text-base sm:text-lg font-bold">tonnes / hectare</span>
                </div>

                <div className="bg-[#F7F9F5] border border-[#DCE8D5] rounded-xl p-3.5 my-4">
                  <span className="text-xs text-[#4A5D3B] font-bold block mb-1">Expected Prediction Range:</span>
                  <span className="text-base sm:text-lg font-black text-[#1C2B0E]">
                    {result.yield_prediction.prediction_range.lower} – {result.yield_prediction.prediction_range.upper} tonnes/hectare
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#7C5310] mt-2 font-medium">
                    <Info className="w-4 h-4 shrink-0 text-[#B45309]" />
                    <span>Prediction uncertainty: <strong>{result.yield_prediction.uncertainty_status || 'LIMITED'}</strong></span>
                  </div>
                </div>

                {/* Top Contributing Factors */}
                <div className="mt-4 pt-3 border-t border-[#E2DBD0]">
                  <span className="text-xs font-bold text-[#1C2B0E] uppercase tracking-wider block mb-2">
                    Key Risk Factors:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#2D3B1F]">
                    {result.risk.top_factors.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#2D5016] font-black">•</span>
                        <span className="font-semibold">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Real Field & Environmental Telemetry Card */}
            {result.field_telemetry && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EBF4E5] text-[#244211] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      <ShieldCheck size={12} className="text-[#2D5016]" />
                      VERIFIED DISTRICT TELEMETRY
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      Local Field Realities & Observational Data ({result.district}, {result.state})
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Actual agricultural readings from NASA POWER, Soil Health Card Portal, ICAR NCIPM, and Agmarknet Mandis used to compute your farm's risk.
                    </p>
                  </div>

                  <span className="text-xs bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-xl text-[#2D5016] font-bold self-start sm:self-center">
                    Verified Lineage 2025
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Weather Telemetry */}
                  <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-4 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#0284C7] font-bold text-xs">
                        <CloudRain size={16} />
                        <span>NASA POWER CLIMATE</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        result.field_telemetry.weather.rainfall_status.includes('OPTIMAL')
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}>
                        {result.field_telemetry.weather.rainfall_status}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-[#2D3B1F]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Seasonal Rain:</span>
                        <strong>{result.field_telemetry.weather.seasonal_rainfall_mm} mm</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Crop Optimal Range:</span>
                        <span className="font-semibold text-[#1C2B0E]">{result.field_telemetry.weather.optimal_rainfall_range}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Temp (Min–Max):</span>
                        <strong>{result.field_telemetry.weather.min_temperature_celsius}°C – {result.field_telemetry.weather.max_temperature_celsius}°C</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Avg Humidity:</span>
                        <strong>{result.field_telemetry.weather.humidity_pct}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Soil Chemistry Telemetry */}
                  <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-4 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs">
                        <Layers size={16} />
                        <span>SOIL HEALTH CARD</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EBF4E5] text-[#244211]">
                        pH {result.field_telemetry.soil.ph_status}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-[#2D3B1F]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Reaction (pH):</span>
                        <strong>{result.field_telemetry.soil.ph}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Available Nitrogen (N):</span>
                        <strong>{result.field_telemetry.soil.nitrogen_kg_ha} kg/ha ({result.field_telemetry.soil.nitrogen_status})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Phosphorus (P):</span>
                        <strong>{result.field_telemetry.soil.phosphorus_kg_ha} kg/ha</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Potassium (K):</span>
                        <strong>{result.field_telemetry.soil.potassium_kg_ha} kg/ha</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Organic Carbon:</span>
                        <strong>{result.field_telemetry.soil.organic_carbon_pct}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Pest & Disease Telemetry */}
                  <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-4 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#DC2626] font-bold text-xs">
                        <Bug size={16} />
                        <span>ICAR NCIPM PEST STATUS</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        result.field_telemetry.pest.etl_exceeded
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : 'bg-[#DCFCE7] text-[#166534]'
                      }`}>
                        {result.field_telemetry.pest.status}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-[#2D3B1F]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Target Vector:</span>
                        <strong className="text-right">{result.field_telemetry.pest.pest_name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Severity Level:</span>
                        <strong>{result.field_telemetry.pest.severity_score} / 3</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Economic Threshold:</span>
                        <strong className={result.field_telemetry.pest.etl_exceeded ? 'text-red-700' : 'text-emerald-700'}>
                          {result.field_telemetry.pest.etl_exceeded ? 'EXCEEDED (Action Required)' : 'Below Action Threshold'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Market Price Telemetry */}
                  <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-4 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#16A34A] font-bold text-xs">
                        <DollarSign size={16} />
                        <span>AGMARKNET APMC MANDI</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EBF4E5] text-[#244211]">
                        Spot Wholesale
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-[#2D3B1F]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Modal Price:</span>
                        <strong className="text-[#2D5016] text-sm">₹{result.field_telemetry.market.modal_price_rs_per_quintal.toLocaleString()} / q</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Wholesale Range:</span>
                        <span>₹{result.field_telemetry.market.min_price_rs_per_quintal.toLocaleString()} – ₹{result.field_telemetry.market.max_price_rs_per_quintal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Price Volatility:</span>
                        <strong>{result.field_telemetry.market.volatility_pct}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* District Production Baseline */}
                  <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-4 rounded-xl space-y-2.5 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#7C3AED] font-bold text-xs">
                        <BarChart3 size={16} />
                        <span>DES APY DISTRICT CROP BASELINE</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#6B21A8]">
                        14-Year Benchmark
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#2D3B1F]">
                      <div>
                        <span className="text-[#64748B] block text-[11px]">Historical Mean Yield:</span>
                        <strong className="text-base text-[#1C2B0E]">{result.field_telemetry.baseline.historical_yield_tonnes_ha} t/ha</strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[11px]">Historical Variability:</span>
                        <strong className="text-base text-[#1C2B0E]">±{result.field_telemetry.baseline.historical_yield_std} t/ha</strong>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[11px]">10-Year Momentum:</span>
                        <strong className="text-base text-[#1C2B0E]">{result.field_telemetry.baseline.momentum_pct}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actionable Agronomic Guidance & Priority Checklist */}
            {result.actionable_guidance && result.actionable_guidance.length > 0 && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EBF4E5] text-[#244211] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      <CheckCircle2 size={12} className="text-[#2D5016]" />
                      DECISION INTELLIGENCE
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      Actionable Risk Mitigation & Agronomic Guide
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Concrete operational steps tailored to your farm's detected risk factors, crop biology, and local market dynamics.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {result.actionable_guidance.map((item, idx) => (
                    <div key={idx} className="bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl p-4 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D5016]">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          item.urgency === 'HIGH'
                            ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]'
                            : item.urgency === 'MEDIUM'
                            ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                            : 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                        }`}>
                          {item.urgency} PRIORITY
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#1C2B0E]">
                        {item.action}
                      </h4>

                      <p className="text-xs text-[#64748B] font-medium pt-1 border-t border-[#E2DBD0]">
                        <strong>Rationale:</strong> {item.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Revenue Scenarios Card */}
            <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-[#2D5016]" />
                <h3 className="text-base sm:text-lg font-extrabold text-[#1C2B0E]">Financial Revenue Scenarios</h3>
              </div>
              <p className="text-xs text-[#4A5D3B] mb-5 font-medium">
                Estimated gross crop revenue ranges derived by propagating yield prediction intervals through APMC mandi spot wholesale prices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-4 rounded-xl">
                  <span className="text-xs text-[#64748B] font-bold block uppercase tracking-wider">Conservative Scenario</span>
                  <span className="text-lg sm:text-xl font-extrabold text-[#1C2B0E] mt-1 block">
                    {result.financial_risk.conservative_revenue}
                  </span>
                </div>
                <div className="bg-[#EBF4E5] border border-[#BBD7A8] p-4 rounded-xl shadow-xs">
                  <span className="text-xs text-[#244211] font-extrabold block uppercase tracking-wider">Expected Scenario</span>
                  <span className="text-xl sm:text-2xl font-black text-[#1A330B] mt-1 block">
                    {result.financial_risk.expected_revenue}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] border border-[#E2DBD0] p-4 rounded-xl">
                  <span className="text-xs text-[#64748B] font-bold block uppercase tracking-wider">Optimistic Scenario</span>
                  <span className="text-lg sm:text-xl font-extrabold text-[#1C2B0E] mt-1 block">
                    {result.financial_risk.optimistic_revenue}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-[#F7F9F5] border border-[#DCE8D5] text-xs text-[#4A5D3B] font-medium">
                <strong>Cultivation Cost Note:</strong> Profit estimate unavailable because verified cultivation-cost data is not available. Gross revenues represent market output value before farm expense deductions.
              </div>
            </div>

            {/* Provenance & Data Freshness Badges */}
            <div className="bg-white border border-[#E2DBD0] rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-[#1C2B0E] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2D5016]" />
                    Verified Data Provenance & Lineage
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#3E522D]">
                    <span className="bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E2DBD0]">
                      2022 Census: <strong>{result.harvest_status['2022']}</strong>
                    </span>
                    <span className="bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E2DBD0]">
                      2023 Census: <strong>{result.harvest_status['2023']}</strong>
                    </span>
                    <span className="bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E2DBD0]">
                      2024 Estimates: <strong>{result.harvest_status['2024']}</strong>
                    </span>
                    <span className="bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E2DBD0]">
                      2025 Advance: <strong>{result.harvest_status['2025']}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-[#64748B]">
                  <span>Model Engine: <strong className="text-[#1C2B0E]">{result.model_version}</strong></span>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">Ridge Regressor (alpha=10.0)</div>
                </div>
              </div>
            </div>

            {/* Decision Support Section */}
            {decisionSupport && (
              <div className="mt-6">
                <DecisionSupportSection data={decisionSupport} onReassess={handleReset} />
              </div>
            )}

            {/* Step 5 Gateway: Farmer Protection Guidance Card */}
            <div className="bg-[#FEF9EE] border border-[#F5D89A] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-[#B45309]" />
                  <h4 className="text-sm font-extrabold text-[#7C5310] uppercase tracking-wider">
                    Step 5: Farmer Protection & Safety Net
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#92400E] font-medium max-w-xl">
                  Understand your rights under PMFBY & RWBCIS government schemes, eligibility criteria, and step-by-step official application and claim processes.
                </p>
              </div>
              <Link
                to="/farmer-protection"
                className="bg-[#B45309] hover:bg-[#92400E] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm shrink-0 no-underline"
              >
                <span>View Protection Schemes</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Scientific Disclaimer */}
            <div className="text-center text-xs text-[#64748B] font-medium px-4 py-2">
              "The AgriRisk prediction is an ML-based decision-support estimate. It is not a guarantee of crop yield, income or profit."
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
