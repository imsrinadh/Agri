import { useState, useEffect, useMemo, memo } from 'react';
import {
  TrendingUp, BarChart3, Map, Clock, ShoppingCart, Sprout,
  Leaf, Info, AlertCircle, ShieldCheck, Database, Filter,
  Search, HelpCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import RiskTrendChart from '../charts/RiskTrendChart';
import CropRiskComparisonChart from '../charts/CropRiskComparisonChart';
import RegionalDistributionChart from '../charts/RegionalDistributionChart';
import HistoricalRiskChart from '../charts/HistoricalRiskChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getInsights } from '../services/api';
import { CROPS, REGIONS, SEASONS } from '../data/constants';
import { CHART_COLORS } from '../utils/riskUtils';

const TABS = [
  { id: 'risk',       label: 'Risk Trends',       icon: TrendingUp },
  { id: 'crop',       label: 'Crop Comparison',   icon: BarChart3 },
  { id: 'regional',   label: 'Regional Trends',    icon: Map },
  { id: 'historical', label: 'Historical Risk',    icon: Clock },
  { id: 'market',     label: 'Market Trends',      icon: ShoppingCart },
  { id: 'production', label: 'Production Trends',  icon: Sprout },
  { id: 'records',    label: 'Data Inspector',     icon: Database },
];

const CustomTooltip = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E2DBD0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1C2B0E', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: '0.78rem', color: '#556947' }}>{p.name}:</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1C2B0E' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

export default function Insights() {
  const [activeTab, setActiveTab]       = useState('risk');
  const [timePeriod, setTimePeriod]     = useState('1y');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');

  // Dual Crop Comparison state for crop tab
  const [compareCrops, setCompareCrops] = useState({ crop1: 'Rice', crop2: 'Wheat' });

  // Data states
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Raw Data Search Filter
  const [rawSearch, setRawSearch]       = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        time_period: timePeriod,
        crop: selectedCrop || undefined,
        region: selectedRegion || undefined,
        season: selectedSeason || undefined,
      };
      const res = await getInsights(filters);
      setInsightsData(res);
    } catch (err) {
      console.error('Failed to load insights:', err);
      setError('Unable to load agricultural analytics. Please check your filters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timePeriod, selectedCrop, selectedRegion, selectedSeason]);

  const trendData   = useMemo(() => insightsData?.risk_trend || [], [insightsData]);
  const cropData    = useMemo(() => insightsData?.crop_comparison || [], [insightsData]);
  const regionalData= useMemo(() => insightsData?.regional_trends || [], [insightsData]);
  const marketData  = useMemo(() => insightsData?.market_trends || [], [insightsData]);
  const prodData    = useMemo(() => insightsData?.production_trends || [], [insightsData]);
  const mspBenchmarks = useMemo(() => insightsData?.mandi_msp_benchmarks || [], [insightsData]);
  const macroStats  = useMemo(() => insightsData?.macro_stats || {
    total_verified_records: 392,
    districts_covered: 22,
    states_covered: 12,
    historical_years: '2012–2026',
    national_baseline_yield: 3.38,
  }, [insightsData]);
  const tabInsights = useMemo(() => insightsData?.tab_insights || {}, [insightsData]);
  const currentTabInsight = useMemo(() => tabInsights[activeTab] || null, [tabInsights, activeTab]);
  const rawRecords  = useMemo(() => insightsData?.raw_records || [], [insightsData]);

  const filteredRawRecords = useMemo(() => rawRecords.filter(r => {
    if (!rawSearch) return true;
    const q = rawSearch.toLowerCase();
    return (
      r.district?.toLowerCase().includes(q) ||
      r.state?.toLowerCase().includes(q) ||
      r.crop?.toLowerCase().includes(q) ||
      String(r.year).includes(q) ||
      r.risk_level?.toLowerCase().includes(q)
    );
  }), [rawRecords, rawSearch]);



  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-16 text-[#1C2B0E]">
      {/* Header Section */}
      <div className="bg-white border-b border-[#E2DBD0] px-4 sm:px-8 py-7 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4E5] text-[#244211] text-xs font-extrabold uppercase tracking-wide border border-[#C6DCB8] mb-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5016]" />
                OFFICIAL AGRICULTURAL DATA • 2012–2026
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A330B] tracking-tight">
                Market & Agricultural Insights
              </h1>
              <p className="text-sm text-[#4A5D3B] mt-1 max-w-3xl font-medium leading-relaxed">
                Clear, transparent data on crop risk levels, wholesale mandi prices, government MSP benchmarks, and district crop yields across India.
              </p>
            </div>

            {/* Data Lineage Badge */}
            <div className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl p-3.5 text-xs space-y-1 self-start md:self-center">
              <div className="font-extrabold text-[#1C2B0E] flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#16A34A]" />
                Official Data Sources
              </div>
              <div className="text-[#556947] text-[11px] leading-tight">
                • Agmarknet APMC Mandis (Wholesale Rates)<br />
                • CCEA Statutory Minimum Support Prices (MSP)<br />
                • Ministry of Agriculture DES Harvest Records
              </div>
            </div>
          </div>

          {/* Macro Summary Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#E2DBD0]">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2DBD0]">
              <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">Total Records</span>
              <strong className="text-lg font-black text-[#1C2B0E]">{macroStats.total_verified_records}</strong>
              <span className="text-[10px] text-[#2D5016] block font-semibold">Verified Harvests</span>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2DBD0]">
              <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">Districts Covered</span>
              <strong className="text-lg font-black text-[#1C2B0E]">{macroStats.districts_covered}</strong>
              <span className="text-[10px] text-[#2D5016] block font-semibold">Major Farming Belts</span>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2DBD0]">
              <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">States Covered</span>
              <strong className="text-lg font-black text-[#1C2B0E]">{macroStats.states_covered}</strong>
              <span className="text-[10px] text-[#2D5016] block font-semibold">12 Key States</span>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2DBD0]">
              <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">Time Range</span>
              <strong className="text-lg font-black text-[#1C2B0E]">{macroStats.historical_years}</strong>
              <span className="text-[10px] text-[#2D5016] block font-semibold">14-Year Trajectory</span>
            </div>

            <div className="bg-[#EBF4E5] p-3 rounded-xl border border-[#C6DCB8] col-span-2 sm:col-span-1">
              <span className="text-[11px] font-extrabold text-[#244211] block uppercase tracking-wider">National Average Yield</span>
              <strong className="text-lg font-black text-[#1A330B]">{macroStats.national_baseline_yield} t/ha</strong>
              <span className="text-[10px] text-[#244211] block font-semibold">Tonnes per Hectare</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">

        {/* Tab Selection Bar */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 border border-[#E2DBD0] shadow-xs overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer ${
                activeTab === id
                  ? 'bg-[#2D5016] text-white shadow-sm'
                  : 'text-[#4A5D3B] hover:bg-[#F4F1EA] hover:text-[#1C2B0E]'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* CLARITY GUIDE: How to read and use these insights */}
        <div className="bg-gradient-to-r from-[#F0FDF4] via-[#FAFDF7] to-[#FEF9EE] border border-[#BBF7D0] rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 border-b border-[#DCFCE7] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
                ✓
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#15803D] m-0">
                Quick Understanding Guide: How to Read & Act on These Insights
              </h2>
            </div>
            <span className="text-[11px] font-extrabold text-[#166534] bg-white px-2.5 py-0.5 rounded-full border border-[#86EFAC] self-start md:self-auto">
              Simple Summary
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <div className="font-extrabold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block"></span>
                <span>1. Risk Scores (0 to 100)</span>
              </div>
              <div className="text-[#475569] text-[11px] leading-relaxed space-y-1">
                <div>• <strong className="text-[#16A34A]">0–35 (Low / Safe):</strong> Excellent conditions. Normal cultivation.</div>
                <div>• <strong className="text-[#D97706]">36–60 (Medium):</strong> Watch for moisture or pest stress.</div>
                <div>• <strong className="text-[#DC2626]">61–100 (High / Severe):</strong> High risk of crop damage. Take preventive action.</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <div className="font-extrabold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block"></span>
                <span>2. Mandi Rates vs Govt MSP</span>
              </div>
              <div className="text-[#475569] text-[11px] leading-relaxed space-y-1">
                <div>• <strong>Mandi Price:</strong> Current wholesale auction price in APMC market.</div>
                <div>• <strong>Govt MSP:</strong> Central Government guaranteed minimum floor price.</div>
                <div>• <strong>Action Rule:</strong> If Mandi &gt; MSP, sell in Mandi. If Mandi &lt; MSP, sell at FCI/Govt centers!</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <div className="font-extrabold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] inline-block"></span>
                <span>3. Yields & Resilient Crops</span>
              </div>
              <div className="text-[#475569] text-[11px] leading-relaxed space-y-1">
                <div>• <strong>Most Stable:</strong> Wheat & Maize show the lowest weather damage over 14 years.</div>
                <div>• <strong>High Return / Sensitive:</strong> Cotton, Onion & Chilli yield high profits but need pest monitoring.</div>
                <div>• <strong>Tonnes/Ha:</strong> Higher number means higher productivity per acre.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Global Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2DBD0] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2D5016]">
            <Filter size={15} />
            <span>Interactive Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Crop Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-bold">Crop:</span>
              <select
                value={selectedCrop}
                onChange={e => setSelectedCrop(e.target.value)}
                className="bg-[#FAF8F5] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 font-medium text-xs text-[#1C2B0E] outline-none focus:border-[#2D5016]"
              >
                <option value="">All Verified Crops</option>
                {['Cotton', 'Groundnut', 'Maize', 'Mustard', 'Onion', 'Rice', 'Soybean', 'Wheat'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Region / District Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-bold">Region:</span>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="bg-[#FAF8F5] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 font-medium text-xs text-[#1C2B0E] outline-none focus:border-[#2D5016]"
              >
                <option value="">All 22 Districts</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Season Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-bold">Season:</span>
              <select
                value={selectedSeason}
                onChange={e => setSelectedSeason(e.target.value)}
                className="bg-[#FAF8F5] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 font-medium text-xs text-[#1C2B0E] outline-none focus:border-[#2D5016]"
              >
                <option value="">All Seasons</option>
                {SEASONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedCrop || selectedRegion || selectedSeason) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCrop('');
                  setSelectedRegion('');
                  setSelectedSeason('');
                }}
                className="text-[#991B1B] hover:text-[#7F1D1D] font-bold text-xs underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Educational Agronomic Takeaway Banner for Current Tab */}
        {currentTabInsight && (
          <div className="bg-white border-l-4 border-[#2D5016] rounded-2xl p-5 sm:p-6 shadow-sm space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-[#1A330B] flex items-center gap-2">
                <Info size={18} className="text-[#2D5016]" />
                {currentTabInsight.title}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D5016] bg-[#EBF4E5] px-2.5 py-0.5 rounded-full border border-[#C6DCB8]">
                Agronomic Intelligence
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#2D3B1F] font-semibold leading-relaxed">
              <strong>Key Finding:</strong> {currentTabInsight.takeaway}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-[#4A5D3B] border-t border-[#E2DBD0]">
              <div>
                <span className="font-bold text-[#1C2B0E]">Agronomic Context: </span>
                {currentTabInsight.agronomic_context}
              </div>
              <div>
                <span className="font-bold text-[#1C2B0E]">Indicator Explained: </span>
                {currentTabInsight.indicator_explained}
              </div>
            </div>
          </div>
        )}

        {/* Content Panels */}
        {loading ? (
          <div className="bg-white border border-[#E2DBD0] rounded-2xl p-16 text-center shadow-sm">
            <div className="w-8 h-8 border-3 border-[#2D5016] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-bold text-[#2D5016]">Analyzing verified agricultural panel datasets...</p>
          </div>
        ) : error ? (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl p-8 text-center shadow-sm">
            <AlertCircle size={36} className="text-[#DC2626] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#991B1B]">{error}</h4>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">

            {/* TAB 1: RISK TRENDS */}
            {activeTab === 'risk' && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      Decadal Agricultural Hazard Trajectory (2012–2026)
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Composite condition hazard index tracking historical weather shocks, soil depletion, and pest cycles.
                    </p>
                  </div>
                  <span className="text-xs bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-[#2D5016] font-bold self-start sm:self-center">
                    Annual Multi-Hazard Index
                  </span>
                </div>

                {/* Plain-English Clarity Note */}
                <div className="bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl p-3 text-xs text-[#4A5D3B] flex items-start gap-2.5">
                  <span className="text-base leading-none">💡</span>
                  <div>
                    <strong className="text-[#1C2B0E]">How to read this graph:</strong> The line shows the composite agricultural hazard score (0 = safest, 100 = critical danger) per year. Lower lines mean calm, safe farming conditions; upward spikes (like the 2014–15 drought) show seasons where weather shocks or pest outbreaks damaged crops.
                  </div>
                </div>

                {trendData.length > 0 ? (
                  <RiskTrendChart data={trendData} height={380} />
                ) : (
                  <div className="p-12 text-center text-xs text-[#64748B]">No risk trend observations match your filter.</div>
                )}
              </div>
            )}

            {/* TAB 2: CROP COMPARISON */}
            {activeTab === 'crop' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1A330B]">
                      Commercial Crop Risk Radar (All Crops)
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Comparing Weather, Soil, Pest, and Market hazard dimensions across 8 major commercial crops.
                    </p>
                  </div>

                  {/* Plain-English Clarity Note */}
                  <div className="bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl p-3 text-xs text-[#4A5D3B] flex items-start gap-2.5">
                    <span className="text-base leading-none">💡</span>
                    <div>
                      <strong className="text-[#1C2B0E]">How to read this chart:</strong> Compares the 4 risk pillars (Weather, Soil, Pest, Market) across crops. Shorter bars = safer crop to grow; taller bars = higher vulnerability needing insurance or protection.
                    </div>
                  </div>

                  {cropData.length > 0 ? (
                    <CropRiskComparisonChart data={cropData} height={350} />
                  ) : (
                    <div className="p-12 text-center text-xs text-[#64748B]">No crop comparison data available.</div>
                  )}
                </div>

                <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-[#1A330B]">
                        Direct Crop vs Crop Comparison
                      </h3>
                      <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                        Select two crops to compare their hazard footprints side-by-side.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={compareCrops.crop1}
                        onChange={e => setCompareCrops(prev => ({ ...prev, crop1: e.target.value }))}
                        className="bg-[#FAF8F5] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1C2B0E]"
                      >
                        {['Rice', 'Wheat', 'Cotton', 'Maize', 'Soybean', 'Groundnut', 'Mustard', 'Onion'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="text-xs font-bold text-[#64748B]">vs</span>
                      <select
                        value={compareCrops.crop2}
                        onChange={e => setCompareCrops(prev => ({ ...prev, crop2: e.target.value }))}
                        className="bg-[#FAF8F5] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1C2B0E]"
                      >
                        {['Rice', 'Wheat', 'Cotton', 'Maize', 'Soybean', 'Groundnut', 'Mustard', 'Onion'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {cropData.length > 0 ? (
                    <CropRiskComparisonChart
                      data={cropData}
                      height={350}
                      selectedCrops={[compareCrops.crop1, compareCrops.crop2]}
                    />
                  ) : (
                    <div className="p-12 text-center text-xs text-[#64748B]">No comparison data available.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: REGIONAL TRENDS */}
            {activeTab === 'regional' && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      District Risk Levels Across 22 Farming Regions
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Which districts face the highest crop hazard? Ranked by composite weather, soil and pest risk.
                    </p>
                  </div>
                  <span className="text-xs bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-[#2D5016] font-bold self-start sm:self-center">
                    22 Districts Ranked
                  </span>
                </div>

                {/* Plain-English Clarity Note */}
                <div className="bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl p-3 text-xs text-[#4A5D3B] flex items-start gap-2.5">
                  <span className="text-base leading-none">💡</span>
                  <div>
                    <strong className="text-[#1C2B0E]">How to read this chart:</strong> Bars show each district's average risk level. Longer bar = that district is more hazard-prone and farmers there should consider PMFBY crop insurance. Shorter bar = safer, more stable farming zone.
                  </div>
                </div>

                {regionalData.length > 0 ? (
                  <RegionalDistributionChart data={regionalData} height={380} />
                ) : (
                  <div className="p-12 text-center text-xs text-[#64748B]">No regional trend data available.</div>
                )}
              </div>
            )}

            {/* TAB 4: HISTORICAL RISK */}
            {activeTab === 'historical' && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      Year-by-Year Risk Factors: Weather, Soil, Pest & Market (2012–2026)
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      What caused crop risk each year? This breakdown shows which factor (weather, soil, pest, or market) was the biggest threat.
                    </p>
                  </div>
                  <span className="text-xs bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-[#2D5016] font-bold self-start sm:self-center">
                    4 Hazard Dimensions
                  </span>
                </div>

                {trendData.length > 0 ? (
                  <>
                    <HistoricalRiskChart
                      data={trendData.map(pt => ({
                        year: pt.date,
                        avg: pt.score,
                        weather: pt.weather,
                        soil: pt.soil,
                        pest: pt.pest,
                        market: pt.market,
                      }))}
                      height={380}
                    />

                    {/* Decadal Agro-Climatic Crisis & Shock Timeline */}
                    <div className="pt-6 border-t border-[#E2DBD0] space-y-3">
                      <h4 className="text-sm font-extrabold text-[#1A330B] flex items-center gap-2">
                        <Clock size={16} className="text-[#2D5016]" />
                        Key Historical Agro-Climatic Shocks & Recovery Milestones
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { years: '2014–2015', label: 'Severe Back-to-Back Drought', score: 'Score 76 (Critical)', desc: '14% & 12% monsoon rainfall deficits caused acute kharif moisture stress across Maharashtra, AP, and Karnataka.', color: '#DC2626', bg: '#FEF2F2' },
                          { years: '2016–2021', label: 'Good Monsoon & Record Harvests', score: 'Score 28–34 (Low)', desc: 'Consistent normal monsoons and canal irrigation expansion restored groundwater table and stabilized grain yields.', color: '#16A34A', bg: '#F0FDF4' },
                          { years: '2022', label: 'Unseasonal March Heat Spike', score: 'Score 54 (Moderate)', desc: 'Early onset of scorching temperatures during wheat grain filling shriveled kernels in Punjab, Haryana, and UP.', color: '#D97706', bg: '#FFFBEB' },
                          { years: '2023', label: 'El Niño & Cyclone Biparjoy', score: 'Score 48 (Moderate)', desc: 'Delayed monsoon onset followed by erratic torrential bursts in western India impacted cotton and groundnut.', color: '#B45309', bg: '#FEF3C7' },
                          { years: '2024–2026', label: 'La Niña Setup & Resilient Production', score: 'Score 29–32 (Low/Mod)', desc: 'Favorable soil moisture regimes, record central procurement at MSP, and widespread micro-irrigation adoption.', color: '#15803D', bg: '#DCFCE7' },
                        ].map((evt, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-[#E2DBD0]" style={{ background: evt.bg }}>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[11px] font-extrabold text-[#1C2B0E]">{evt.years}</span>
                              <span className="text-[10px] font-black" style={{ color: evt.color }}>{evt.score}</span>
                            </div>
                            <strong className="text-xs text-[#1A330B] block mb-1">{evt.label}</strong>
                            <p className="text-[11px] text-[#4A5D3B] leading-relaxed">{evt.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-xs text-[#64748B]">No historical pattern data available.</div>
                )}
              </div>
            )}

            {/* TAB 5: MARKET TRENDS */}
            {activeTab === 'market' && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      Crop Wholesale Prices at APMC Mandis (₹ per quintal)
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Actual wholesale market auction prices from registered APMC mandis for Rice, Wheat, Cotton, Maize and more — sourced from Agmarknet.
                    </p>
                  </div>
                  <span className="text-xs bg-[#F4F1EA] border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-[#2D5016] font-bold self-start sm:self-center">
                    Agmarknet Official Data
                  </span>
                </div>

                {/* Plain-English Clarity Note */}
                <div className="bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl p-3 text-xs text-[#4A5D3B] flex items-start gap-2.5">
                  <span className="text-base leading-none">💡</span>
                  <div>
                    <strong className="text-[#1C2B0E]">How to use this:</strong> Each line shows how the wholesale price of one crop has changed over time. If your crop's price is rising → good time to sell. If falling → consider holding stock or selling to government (FCI/NAFED) at guaranteed MSP floor price.
                  </div>
                </div>

                {marketData.length > 0 ? (
                  <div className="space-y-6">
                    {/* Chart 1: Grain Staples — Rice, Wheat, Maize (₹1,200–₹2,600/q) */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></div>
                        <h4 className="text-sm font-extrabold text-[#1A330B]">Food Grain Staples — Rice, Wheat & Maize (₹/quintal)</h4>
                        <span className="text-[10px] bg-[#EBF4E5] text-[#244211] px-2 py-0.5 rounded font-bold ml-auto">Scale: ₹1,000–₹2,800</span>
                      </div>
                      <ResponsiveContainer width="100%" height={270}>
                        <LineChart data={marketData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[1000, 2800]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} iconType="circle" iconSize={8} />
                          <Line type="monotone" dataKey="rice" name="Rice ₹/q" stroke="#0284C7" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
                          <Line type="monotone" dataKey="wheat" name="Wheat ₹/q" stroke="#D97706" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
                          <Line type="monotone" dataKey="maize" name="Maize ₹/q" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Chart 2: Cash Crops & Oilseeds — Cotton, Groundnut, Soybean, Mustard, Onion (₹2,000–₹8,000/q) */}
                    <div className="border-t border-[#E2DBD0] pt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></div>
                        <h4 className="text-sm font-extrabold text-[#1A330B]">Cash Crops & Oilseeds — Cotton, Groundnut, Mustard, Soybean & Onion (₹/quintal)</h4>
                        <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded font-bold ml-auto">Scale: ₹2,000–₹8,000</span>
                      </div>
                      <ResponsiveContainer width="100%" height={270}>
                        <LineChart data={marketData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[2000, 8000]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} iconType="circle" iconSize={8} />
                          <Line type="monotone" dataKey="cotton" name="Cotton ₹/q" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                          <Line type="monotone" dataKey="groundnut" name="Groundnut ₹/q" stroke="#B45309" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                          <Line type="monotone" dataKey="mustard" name="Mustard ₹/q" stroke="#CA8A04" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                          <Line type="monotone" dataKey="soybean" name="Soybean ₹/q" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                          <Line type="monotone" dataKey="onion" name="Onion ₹/q" stroke="#DB2777" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-[10px] text-[#64748B] mt-2 italic">* Onion shown as dashed — prices highly seasonal/volatile (June–Oct spike, Jan–Mar crash)</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-[#64748B]">No mandi price data available.</div>
                )}


                {/* Official Government MSP Benchmarks vs APMC Mandi Rates */}
                {mspBenchmarks.length > 0 && (
                  <div className="pt-6 border-t border-[#E2DBD0] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-[#1A330B] flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#16A34A]" />
                          Official Government MSP vs APMC Mandi Spot Rates (2024–2026)
                        </h4>
                        <p className="text-xs text-[#556947] mt-0.5">
                          Approved by Cabinet Committee on Economic Affairs (CCEA) • Mandi modal rates from Agmarknet
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-2.5 py-1 rounded-full self-start sm:self-center">
                        CACP Statutory Benchmark
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-[#E2DBD0] rounded-xl shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF8F5] border-b border-[#E2DBD0] text-[#4A5D3B] font-extrabold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3.5">Crop & Commercial Variety</th>
                            <th className="py-2.5 px-3.5">Key APMC Mandis</th>
                            <th className="py-2.5 px-3.5 text-right">Govt MSP (₹/q)</th>
                            <th className="py-2.5 px-3.5 text-right">Modal Price (₹/q)</th>
                            <th className="py-2.5 px-3.5 text-center">Spread (+/- MSP)</th>
                            <th className="py-2.5 px-3.5">Procurement Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2DBD0] text-[#1C2B0E]">
                          {mspBenchmarks.map((b, idx) => (
                            <tr key={idx} className="hover:bg-[#FAF8F5] transition">
                              <td className="py-2.5 px-3.5 font-bold">
                                {b.crop}
                                <span className="block text-[10px] text-[#64748B] font-normal">{b.variety}</span>
                              </td>
                              <td className="py-2.5 px-3.5 text-[#4A5D3B] text-[11px] font-medium max-w-xs">
                                {b.major_mandi}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-extrabold text-[#1A330B]">
                                ₹{b.msp_current?.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-black text-[#15803D]">
                                ₹{b.mandi_modal_price?.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3.5 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                                  +₹{b.spread_rs}/q
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 text-[11px] text-[#4A5D3B] font-medium">
                                {b.procurement_status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: PRODUCTION TRENDS */}
            {activeTab === 'production' && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      Crop Yield per Hectare: 14-Year Official Production Records (2012–2026)
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Ministry of Agriculture DES APY Census. Higher t/ha = more output per acre of land.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] px-2.5 py-1 rounded-md font-bold">2012–2023: FINAL</span>
                    <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] px-2.5 py-1 rounded-md font-bold">2024–2025: PROVISIONAL</span>
                    <span className="bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] px-2.5 py-1 rounded-md font-bold">2026: ADVANCE EST.</span>
                  </div>
                </div>

                {/* Clarity note */}
                <div className="bg-[#FAF8F5] border border-[#E2DBD0] rounded-xl p-3 text-xs text-[#4A5D3B] flex items-start gap-2.5">
                  <span className="text-base leading-none">💡</span>
                  <div>
                    <strong className="text-[#1C2B0E]">Why two charts?</strong> Grain crops (Rice 3–5 t/ha, Wheat 4–5 t/ha) and Oilseeds (Cotton 0.5–0.7, Mustard 1.4–1.7) have very different yield scales. Showing them on one chart makes lower-yield crops look flat. We separate them so you can clearly see the real improvement in each group.
                  </div>
                </div>

                {prodData.length > 0 ? (
                  <div className="space-y-6">
                    {/* Chart 1: Food Grain Crops - Rice, Wheat, Maize (3–5 t/ha range) */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></div>
                        <h4 className="text-sm font-extrabold text-[#1A330B]">Food Grains: Rice, Wheat & Maize (Tonnes/Ha)</h4>
                        <span className="text-[10px] bg-[#EBF4E5] text-[#244211] px-2 py-0.5 rounded font-bold ml-auto">Scale: 2.5 – 5.5 t/ha</span>
                      </div>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={prodData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[2.5, 5.5]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}t`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} iconType="circle" iconSize={8} />
                          <Line type="monotone" dataKey="rice" name="Rice (t/ha)" stroke="#0284C7" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
                          <Line type="monotone" dataKey="wheat" name="Wheat (t/ha)" stroke="#D97706" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
                          <Line type="monotone" dataKey="maize" name="Maize (t/ha)" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Chart 2: Oilseeds & Cash Crops - Cotton, Soybean, Groundnut, Mustard (0.5–2.5 t/ha range) */}
                    <div className="border-t border-[#E2DBD0] pt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></div>
                        <h4 className="text-sm font-extrabold text-[#1A330B]">Oilseeds & Cash Crops: Cotton, Soybean, Groundnut, Mustard (Tonnes/Ha)</h4>
                        <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded font-bold ml-auto">Scale: 0.3 – 2.8 t/ha</span>
                      </div>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={prodData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0.3, 2.8]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}t`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} iconType="circle" iconSize={8} />
                          <Line type="monotone" dataKey="cotton" name="Cotton (t/ha)" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                          <Line type="monotone" dataKey="soybean" name="Soybean (t/ha)" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                          <Line type="monotone" dataKey="groundnut" name="Groundnut (t/ha)" stroke="#B45309" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                          <Line type="monotone" dataKey="mustard" name="Mustard (t/ha)" stroke="#CA8A04" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={900} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Key Takeaways Grid */}
                    <div className="border-t border-[#E2DBD0] pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { crop: '🌾 Wheat', trend: '3.75 → 4.22 t/ha', change: '+12.5%', color: '#D97706', bg: '#FFFBEB' },
                        { crop: '🌾 Rice', trend: '3.42 → 3.75 t/ha', change: '+9.6%', color: '#0284C7', bg: '#EFF6FF' },
                        { crop: '🌽 Maize', trend: '3.30 → 3.72 t/ha', change: '+12.7%', color: '#7C3AED', bg: '#F5F3FF' },
                        { crop: '🟤 Soybean', trend: '1.72 → 2.02 t/ha', change: '+17.4%', color: '#059669', bg: '#F0FDF4' },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl border" style={{ background: item.bg, borderColor: item.color + '33' }}>
                          <div className="text-xs font-extrabold text-[#1C2B0E] mb-0.5">{item.crop}</div>
                          <div className="text-[11px] text-[#475569] font-medium">{item.trend}</div>
                          <div className="text-xs font-black mt-1" style={{ color: item.color }}>{item.change} (2012–2026)</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-[#64748B]">No production trend observations available.</div>
                )}
              </div>
            )}


            {/* TAB 7: RAW VERIFIED DATA INSPECTOR */}
            {activeTab === 'records' && (
              <div className="bg-white border border-[#E2DBD0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EBF4E5] text-[#244211] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      <Database size={12} className="text-[#2D5016]" />
                      AUDITABLE EMPIRICAL DATASET
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A330B]">
                      Verified Agricultural Panel Observations
                    </h3>
                    <p className="text-xs text-[#4A5D3B] font-medium mt-0.5">
                      Examine authentic district-level panel records combining harvest outcomes, NASA climate metrics, and APMC wholesale prices.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search district, crop, state..."
                      value={rawSearch}
                      onChange={e => setRawSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#CBD5E1] rounded-xl text-xs outline-none focus:border-[#2D5016]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#E2DBD0] rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E2DBD0] text-[#1C2B0E] font-extrabold">
                        <th className="p-3">Year</th>
                        <th className="p-3">State</th>
                        <th className="p-3">District</th>
                        <th className="p-3">Crop</th>
                        <th className="p-3">Season</th>
                        <th className="p-3">Yield (t/ha)</th>
                        <th className="p-3">Rainfall (mm)</th>
                        <th className="p-3">Avg Temp (°C)</th>
                        <th className="p-3">Mandi (₹/q)</th>
                        <th className="p-3">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DBD0] font-medium text-[#2D3B1F]">
                      {filteredRawRecords.length > 0 ? (
                        filteredRawRecords.map((r, idx) => (
                          <tr key={idx} className="hover:bg-[#F9F8F5] transition">
                            <td className="p-3 font-bold">{r.year}</td>
                            <td className="p-3">{r.state}</td>
                            <td className="p-3 font-bold text-[#1C2B0E]">{r.district}</td>
                            <td className="p-3">{r.crop}</td>
                            <td className="p-3">{r.season}</td>
                            <td className="p-3 font-bold text-[#2D5016]">{r.yield_tonnes_ha}</td>
                            <td className="p-3">{r.rainfall_mm}</td>
                            <td className="p-3">{r.temperature_c}°</td>
                            <td className="p-3 font-bold">₹{r.modal_price_rs_q?.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                r.risk_level === 'LOW'
                                  ? 'bg-[#DCFCE7] text-[#166534]'
                                  : r.risk_level === 'MODERATE'
                                  ? 'bg-[#FEF3C7] text-[#92400E]'
                                  : 'bg-[#FEE2E2] text-[#991B1B]'
                              }`}>
                                {r.risk_level}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-xs text-[#64748B]">
                            No matching verified records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-[#64748B] flex items-center justify-between pt-1">
                  <span>Showing {filteredRawRecords.length} of {rawRecords.length} records in panel subset.</span>
                  <span className="font-semibold text-[#2D5016]">Full panel repository contains 392 records (2012–2025).</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
