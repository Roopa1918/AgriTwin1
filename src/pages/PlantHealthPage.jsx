// AgriTwin — Plant-Level Health & Pest Monitoring Page
// Features: 6x6 Field Grid, Plant Detail Drawer, AI Leaf Image Scanner with Presets,
// Algorithmic Pest Hotspots, and Actionable Farmer Recommendations.

import React, { useState, useEffect } from 'react';
import FieldGrid2D from '../components/plants/FieldGrid2D';
import { 
  analyzePlantImage, 
  findPestHotspots, 
  SAMPLE_AI_PRESETS 
} from '../services/visionService';
import { useFields } from '../context/FieldsContext';
import { 
  Leaf, 
  Camera, 
  Upload, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Info, 
  X,
  ExternalLink,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function PlantHealthPage({ onNavigateToAlerts }) {
  const { currentField } = useFields();

  // Initialize a standard 6x6 plant grid (36 plants)
  const [plants, setPlants] = useState(() => {
    const initial = [];
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= 6; c++) {
        const id = `P-R${String(r).padStart(2, '0')}-C${String(c).padStart(2, '0')}`;
        // Seed some initial realistic distribution
        let status = 'healthy';
        let healthScore = Math.floor(88 + Math.random() * 10);
        let symptoms = [];
        let diagnosis = 'Healthy canopy foliage';
        let confidence = 94;

        // Cluster in row 2 cols 3, 4, 5 (needs attention / watch)
        if (r === 2 && (c === 3 || c === 4 || c === 5)) {
          status = c === 4 ? 'attention' : 'watch';
          healthScore = c === 4 ? 42 : 68;
          symptoms = c === 4 
            ? ['Leaf margin chewing: 38%', 'Visible caterpillar frass'] 
            : ['Early leaf perforation: 12%'];
          diagnosis = c === 4 
            ? 'Possible Spodoptera litura (Tobacco caterpillar) chewing damage'
            : 'Early localized pest feeding signs';
          confidence = c === 4 ? 86 : 78;
        } else if (r === 5 && c === 2) {
          status = 'watch';
          healthScore = 72;
          symptoms = ['Small circular leaf spots: 15%'];
          diagnosis = 'Suspected Cercospora leaf spot';
          confidence = 81;
        }

        initial.push({
          id,
          row: r,
          col: c,
          status,
          healthScore,
          symptoms,
          diagnosis,
          confidence,
          lastScanned: '2026-09-13 11:30 AM',
          imagePreview: null
        });
      }
    }
    return initial;
  });

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [hotspots, setHotspots] = useState([]);

  // Scanner Modal State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [selectedPresetKey, setSelectedPresetKey] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Re-calculate hotspots whenever plants change
  useEffect(() => {
    const detected = findPestHotspots(plants);
    setHotspots(detected);
    if (!selectedPlant && plants.length > 0) {
      // Default select the first attention plant or first plant
      const problemPlant = plants.find(p => p.status === 'attention') || plants[0];
      setSelectedPlant(problemPlant);
    }
  }, [plants]);

  // KPI Calculations
  const totalPlants = plants.length;
  const healthyCount = plants.filter(p => p.status === 'healthy').length;
  const watchCount = plants.filter(p => p.status === 'watch').length;
  const attentionCount = plants.filter(p => p.status === 'attention').length;
  const healthyPct = Math.round((healthyCount / totalPlants) * 100);

  // Handle Plant Selection
  const handleSelectPlant = (plant) => {
    setSelectedPlant(plant);
  };

  // Open Scan Modal for target plant
  const handleOpenScanner = (plant = null) => {
    if (plant) setSelectedPlant(plant);
    setScanResult(null);
    setSelectedPresetKey('chewed');
    setScanPreviewUrl(SAMPLE_AI_PRESETS.chewed.url);
    setIsScanModalOpen(true);
  };

  // Handle Preset Selection in Scanner Modal
  const handleSelectPreset = (key) => {
    setSelectedPresetKey(key);
    setScanPreviewUrl(SAMPLE_AI_PRESETS[key].url);
    setScanResult(null);
  };

  // Handle File Upload in Scanner Modal
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScanPreviewUrl(event.target.result);
        setSelectedPresetKey(null);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Execute Vision Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const targetKey = selectedPresetKey || 'chewed';
      const result = await analyzePlantImage(scanPreviewUrl, targetKey);
      setScanResult(result);

      // Update plant in state
      if (selectedPlant) {
        setPlants(prev => prev.map(p => {
          if (p.id === selectedPlant.id) {
            const updated = {
              ...p,
              status: result.status,
              healthScore: result.healthScore,
              symptoms: result.symptoms,
              diagnosis: result.diagnosis,
              confidence: result.confidence,
              lastScanned: 'Just now',
              imagePreview: scanPreviewUrl
            };
            setSelectedPlant(updated);
            return updated;
          }
          return p;
        }));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 1-Click presentation demo: trigger pest hotspot in Row 4
  const handleDemoPestOutbreak = () => {
    setPlants(prev => prev.map(p => {
      if (p.row === 4 && (p.col === 2 || p.col === 3 || p.col === 4)) {
        return {
          ...p,
          status: 'attention',
          healthScore: 38,
          symptoms: ['Heavy leaf skeletonization: 52%', 'Larvae cluster identified'],
          diagnosis: 'Severe Spodoptera litura outbreak',
          confidence: 91,
          lastScanned: 'Just now'
        };
      }
      return p;
    }));
  };

  // Reset grid to mostly healthy
  const handleResetGrid = () => {
    setPlants(prev => prev.map(p => ({
      ...p,
      status: 'healthy',
      healthScore: Math.floor(88 + Math.random() * 10),
      symptoms: [],
      diagnosis: 'Healthy canopy foliage',
      confidence: 95,
      lastScanned: 'Just now'
    })));
  };

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header-text">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🌱</span> Plant-Level Health & Pest Monitoring
          </h1>
          <p>
            Micro-grid resolution crop health monitoring. Track individual plant condition, detect leaf chewing symptoms, and isolate pest cluster hotspots.
          </p>
        </div>

        {/* Quick Demo Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenScanner(selectedPlant)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Camera size={15} />
            <span>📷 Scan Leaf Imagery</span>
          </button>

          <button
            onClick={handleDemoPestOutbreak}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
            title="Simulate pest clustering for evaluation"
          >
            <Flame size={15} color="#ef4444" />
            <span>Simulate Pest Outbreak</span>
          </button>

          <button
            onClick={handleResetGrid}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Reset field plants to healthy"
          >
            <RotateCcw size={15} />
            <span>Reset Grid</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <span className="metric-card-label">Total Monitored Plants</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value">{totalPlants}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>6×6 Matrix</span>
          </div>
          <div className="metric-card-footer">
            <span>Crop: {currentField?.crop || 'Rice'}</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Healthy Plants</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: 'var(--emerald-400)' }}>
              {healthyCount}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--emerald-400)', fontWeight: 700 }}>
              ({healthyPct}%)
            </span>
          </div>
          <div className="metric-card-footer">
            <span>Optimal vegetative canopy</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Watch List</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: '#fbbf24' }}>
              {watchCount}
            </span>
          </div>
          <div className="metric-card-footer">
            <span>Mild leaf yellowing or spotting</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Needs Attention</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: '#f87171' }}>
              {attentionCount}
            </span>
          </div>
          <div className="metric-card-footer">
            <span>Chewing holes or active symptoms</span>
          </div>
        </div>

        <div className="metric-card" style={{ borderColor: hotspots.length > 0 ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)' }}>
          <span className="metric-card-label">Pest Hotspot Clusters</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: hotspots.length > 0 ? '#ef4444' : 'var(--emerald-400)' }}>
              {hotspots.length}
            </span>
          </div>
          <div className="metric-card-footer">
            <span>{hotspots.length > 0 ? 'Spatial cluster identified' : 'No clusters detected'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Grid (Left) + Detail Drawer (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: 2D Interactive Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <FieldGrid2D
            plants={plants}
            selectedPlant={selectedPlant}
            onSelectPlant={handleSelectPlant}
            hotspots={hotspots}
            rowsCount={6}
            colsCount={6}
          />

          {/* Hotspot Cluster Details Card */}
          {hotspots.length > 0 && (
            <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Flame size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                  Pest Hotspot Cluster Analysis
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                The spatial clustering algorithm identified adjacent plants with elevated chewing and fungal stress. Early containment prevents field-wide spread.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hotspots.map(h => (
                  <div
                    key={h.id}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#fca5a5', fontSize: '0.88rem' }}>{h.name}</strong>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Affected Plant IDs: {h.plantIds.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const target = plants.find(p => p.id === h.plantIds[0]);
                        if (target) setSelectedPlant(target);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
                    >
                      Inspect First Plant
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Selected Plant Detail Drawer */}
        {selectedPlant && (
          <div className="glass-card" style={{ padding: '22px', position: 'sticky', top: '20px' }}>
            {/* Plant Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--emerald-400)', fontWeight: 800, letterSpacing: '0.5px' }}>
                  Row {selectedPlant.row} &bull; Column {selectedPlant.col}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span>🌿</span> {selectedPlant.id}
                </h2>
              </div>

              {/* Status Badge */}
              <div style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: selectedPlant.status === 'healthy' 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : selectedPlant.status === 'watch' 
                    ? 'rgba(245, 158, 11, 0.2)' 
                    : 'rgba(239, 68, 68, 0.25)',
                color: selectedPlant.status === 'healthy' 
                  ? '#34d399' 
                  : selectedPlant.status === 'watch' 
                    ? '#fbbf24' 
                    : '#f87171',
                border: selectedPlant.status === 'healthy' 
                  ? '1px solid rgba(16, 185, 129, 0.4)' 
                  : selectedPlant.status === 'watch' 
                    ? '1px solid rgba(245, 158, 11, 0.4)' 
                    : '1px solid rgba(239, 68, 68, 0.5)'
              }}>
                {selectedPlant.status === 'attention' ? 'Needs Attention' : selectedPlant.status}
              </div>
            </div>

            {/* Health Score Meter */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Vegetative Vitality Score</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  {selectedPlant.healthScore !== null ? `${selectedPlant.healthScore}/100` : 'Unrated'}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${selectedPlant.healthScore || 0}%`,
                  height: '100%',
                  background: selectedPlant.healthScore > 80 
                    ? 'var(--emerald-400)' 
                    : selectedPlant.healthScore > 60 
                      ? '#f59e0b' 
                      : '#ef4444',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* Scanned Image Preview if available */}
            {selectedPlant.imagePreview && (
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Latest Scanned Imagery
                </span>
                <div style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-medium)',
                  height: '140px',
                  position: 'relative'
                }}>
                  <img
                    src={selectedPlant.imagePreview}
                    alt={selectedPlant.id}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    color: '#fff'
                  }}>
                    Scanned: {selectedPlant.lastScanned}
                  </div>
                </div>
              </div>
            )}

            {/* AI Diagnosis & Symptoms */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Probabilistic AI Diagnosis
              </span>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', lineHeight: 1.4 }}>
                  {selectedPlant.diagnosis}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--emerald-400)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {selectedPlant.confidence}% Confidence
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Last Checked: {selectedPlant.lastScanned}
                  </span>
                </div>

                {/* Symptoms List */}
                {selectedPlant.symptoms && selectedPlant.symptoms.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Detected Symptoms:
                    </span>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.8rem', color: '#fca5a5' }}>
                      {selectedPlant.symptoms.map((sym, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>{sym}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Farmer-Friendly Actionable Recommendations */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Farmer-Friendly Guidance
              </span>
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '0.82rem',
                color: 'var(--text-dim)',
                lineHeight: 1.5
              }}>
                {selectedPlant.status === 'attention' ? (
                  <>
                    <strong style={{ color: '#34d399', display: 'block', marginBottom: '4px' }}>Recommended Steps:</strong>
                    1. Inspect underside of nearby leaves for caterpillar egg masses.<br />
                    2. Install yellow sticky traps & pheromone traps at crop canopy height.<br />
                    3. Consider biological Neem Seed Kernel Extract (NSKE 5%) spray in evening hours.
                  </>
                ) : selectedPlant.status === 'watch' ? (
                  <>
                    <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '4px' }}>Recommended Steps:</strong>
                    1. Monitor moisture levels in surrounding root zone.<br />
                    2. Re-scan plant in 48 hours to assess symptom progression.<br />
                    3. Avoid excess urea application which encourages succulent leaf tissue.
                  </>
                ) : (
                  <>
                    <strong style={{ color: '#34d399', display: 'block', marginBottom: '4px' }}>Status Healthy:</strong>
                    Canopy density and chlorosis indices are optimal. Maintain routine drip/furrow schedule.
                  </>
                )}
              </div>
            </div>

            {/* Crucial Safety Warning Box */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontSize: '0.74rem',
              color: '#fca5a5',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <ShieldAlert size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Safety Notice:</strong> AI-assisted diagnosis. Verify with your local agricultural extension officer before chemical treatment. Never spray synthetic chemicals without confirming the target pest species.
              </div>
            </div>

            {/* Scan Imagery for this Plant Button */}
            <button
              onClick={() => handleOpenScanner(selectedPlant)}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px'
              }}
            >
              <Camera size={18} />
              <span>Scan / Upload Leaf for {selectedPlant.id}</span>
            </button>
          </div>
        )}
      </div>

      {/* Mandatory Bottom AI Disclaimer */}
      <div style={{
        marginTop: '32px',
        padding: '14px 20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={18} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
        <div>
          <strong>AI Transparency Notice:</strong> AI-assisted plant monitoring. Detection accuracy depends on image quality, lighting, camera angle and crop type. This tool serves as decision-support for smallholders and agronomists.
        </div>
      </div>

      {/* SCANNER MODAL */}
      {isScanModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.9)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--emerald-400)', fontWeight: 800 }}>
                  Computer Vision Diagnostic
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  📷 Scan Plant Leaf {selectedPlant ? `(${selectedPlant.id})` : ''}
                </h3>
              </div>
              <button
                onClick={() => setIsScanModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Evaluation AI Test Presets */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                🧪 Instant 1-Click Evaluation Presets
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {Object.entries(SAMPLE_AI_PRESETS).filter(([k]) => ['healthy', 'chewed', 'spot', 'chlorosis'].includes(k)).map(([key, item]) => {
                  const isChosen = selectedPresetKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: isChosen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                        border: isChosen ? '2px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem' }}>
                        {key === 'healthy' ? '🌿' : key === 'chewed' ? '🍂' : key === 'spot' ? '🟡' : '⚠️'}
                      </span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Upload Alternative */}
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="leaf-upload-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed var(--border-medium)',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Upload size={16} color="var(--emerald-400)" />
                <span>Or Upload Your Own Leaf Photo</span>
                <input
                  id="leaf-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Image Preview Box */}
            {scanPreviewUrl && (
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
                height: '200px',
                position: 'relative',
                background: '#030805',
                marginBottom: '18px'
              }}>
                <img
                  src={scanPreviewUrl}
                  alt="Leaf to analyze"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isAnalyzing && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    color: 'var(--emerald-400)'
                  }}>
                    <span className="search-spinner" style={{
                      width: '28px',
                      height: '28px',
                      border: '3px solid rgba(52, 211, 153, 0.2)',
                      borderTopColor: 'var(--emerald-400)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Analyzing canopy texture & pest signs...</span>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Result Display */}
            {scanResult && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{scanResult.diagnosis}</strong>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--emerald-400)',
                    background: 'rgba(16,185,129,0.2)',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {scanResult.confidence}% AI Confidence
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Assigned Status: <strong style={{ color: scanResult.status === 'attention' ? '#f87171' : scanResult.status === 'watch' ? '#fbbf24' : '#34d399' }}>{scanResult.status.toUpperCase()}</strong> (Health: {scanResult.healthScore}%)
                </div>
                {scanResult.symptoms && scanResult.symptoms.length > 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#fca5a5' }}>
                    Symptoms: {scanResult.symptoms.join(' • ')}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !scanPreviewUrl}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={16} />
                <span>{isAnalyzing ? 'Processing AI Model...' : 'Run Vision Diagnostic'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
