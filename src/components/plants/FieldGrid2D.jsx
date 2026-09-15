// AgriTwin — Plant-Level Field Grid (2D Matrix Visualization)
// Features: Row/Col matrix, unique plant IDs (e.g., P-R01-C01), 4 condition states,
// interactive selection, and algorithmic pest hotspot clustering highlights.

import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle, Flame } from 'lucide-react';

export default function FieldGrid2D({
  plants = [],
  selectedPlant = null,
  onSelectPlant,
  hotspots = [],
  rowsCount = 6,
  colsCount = 6
}) {
  const [cellZoom, setCellZoom] = React.useState(1.0); // 0.8, 1.0, 1.25
  const [filterStatus, setFilterStatus] = React.useState('ALL'); // 'ALL' | 'healthy' | 'watch' | 'attention'

  // Determine if a specific plant belongs to any active hotspot cluster
  const isPlantInHotspot = (plantId) => {
    return (hotspots || []).some(h => Array.isArray(h?.plantIds) && h.plantIds.includes(plantId));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle2 size={12} color="#10b981" />,
          label: 'Healthy',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: 'rgba(16, 185, 129, 0.4)'
        };
      case 'watch':
        return {
          icon: <AlertTriangle size={12} color="#f59e0b" />,
          label: 'Watch',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: 'rgba(245, 158, 11, 0.4)'
        };
      case 'attention':
        return {
          icon: <AlertCircle size={12} color="#ef4444" />,
          label: 'Attention',
          bg: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.6)'
        };
      case 'not_scanned':
      default:
        return {
          icon: <HelpCircle size={12} color="var(--text-dim)" />,
          label: 'Unscanned',
          bg: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--text-dim)',
          border: 'rgba(255, 255, 255, 0.1)'
        };
    }
  };

  const colWidth = Math.round(84 * cellZoom);

  return (
    <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 20px)', borderRadius: 'var(--radius-lg)', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header with Legend & Zoom Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌱</span> Field Plant Matrix ({rowsCount} × {colsCount} Grid)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Click any plant cell to view diagnosis, scan leaf imagery, or record symptoms.
          </p>
        </div>

        {/* Zoom Controls (PRD Section 10) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>ZOOM:</span>
          <button
            type="button"
            onClick={() => setCellZoom(prev => Math.max(0.75, +(prev - 0.15).toFixed(2)))}
            className="btn btn-secondary btn-sm"
            style={{ minHeight: '34px', minWidth: '34px', padding: '0 8px', fontSize: '0.85rem' }}
            title="Zoom Out Matrix"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setCellZoom(1.0)}
            className="btn btn-secondary btn-sm"
            style={{ minHeight: '34px', padding: '0 8px', fontSize: '0.72rem' }}
            title="Reset Zoom"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => setCellZoom(prev => Math.min(1.4, +(prev + 0.15).toFixed(2)))}
            className="btn btn-secondary btn-sm"
            style={{ minHeight: '34px', minWidth: '34px', padding: '0 8px', fontSize: '0.85rem' }}
            title="Zoom In Matrix"
          >
            +
          </button>
        </div>
      </div>

      {/* Filter Pill Tabs: [All] [Healthy] [Watch] [Problem] (PRD Section 10) */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
        {[
          { id: 'ALL', label: 'All Plants' },
          { id: 'healthy', label: 'Healthy (🟢)' },
          { id: 'watch', label: 'Watch (🟡)' },
          { id: 'attention', label: 'Problem (🔴)' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: filterStatus === tab.id ? 'var(--emerald-500)' : 'rgba(255,255,255,0.04)',
              color: filterStatus === tab.id ? '#000' : 'var(--text-muted)',
              border: filterStatus === tab.id ? 'none' : '1px solid var(--border-subtle)',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '36px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Scroll Hint Notice */}
      <div style={{ fontSize: '0.72rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
        <span>👈 Swipe horizontally to explore full field grid 👉</span>
      </div>

      {/* Hotspots Callout Alert */}
      {hotspots && hotspots.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.16) 0%, rgba(245, 158, 11, 0.12) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(239,68,68,0.2)', padding: '6px', borderRadius: '50%' }}>
              <Flame size={18} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fca5a5' }}>
                🚨 {hotspots.length} Pest / Disease Cluster{hotspots.length > 1 ? 's' : ''} Detected
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {hotspots.map(h => `${h.name} (${h.plantIds.length} plants)`).join(' • ')}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
            Pulsating borders in grid
          </div>
        </div>
      )}

      {/* 2D Grid Layout Container — Only this container scrolls horizontally */}
      <div 
        className="plant-grid-scroll-box"
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          maxWidth: '100%',
          paddingBottom: '10px'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: `36px repeat(${colsCount}, minmax(${colWidth}px, 1fr))`,
          gap: '8px',
          minWidth: `${36 + colsCount * (colWidth + 8)}px`
        }}>
          {/* Header Row: Column numbers */}
          <div /> {/* Top-left empty corner */}
          {Array.from({ length: colsCount }).map((_, cIdx) => (
            <div
              key={`col-head-${cIdx}`}
              style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--emerald-400)',
                textTransform: 'uppercase',
                padding: '4px'
              }}
            >
              Col {cIdx + 1}
            </div>
          ))}

          {/* Grid Rows */}
          {Array.from({ length: rowsCount }).map((_, rIdx) => {
            const rowNum = rIdx + 1;
            return (
              <React.Fragment key={`row-frag-${rowNum}`}>
                {/* Row Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--emerald-400)',
                  textTransform: 'uppercase'
                }}>
                  R{rowNum}
                </div>

                {/* Columns in Row */}
                {Array.from({ length: colsCount }).map((_, cIdx) => {
                  const colNum = cIdx + 1;
                  const plantId = `P-R${String(rowNum).padStart(2, '0')}-C${String(colNum).padStart(2, '0')}`;
                  const plant = plants.find(p => p.id === plantId) || {
                    id: plantId,
                    row: rowNum,
                    col: colNum,
                    status: 'not_scanned',
                    healthScore: null
                  };

                  const isSelected = selectedPlant && selectedPlant.id === plant.id;
                  const inHotspot = isPlantInHotspot(plant.id);
                  const badge = getStatusBadge(plant.status);

                  return (
                    <div
                      key={plant.id}
                      onClick={() => onSelectPlant && onSelectPlant(plant)}
                      style={{
                        background: isSelected 
                          ? 'rgba(16, 185, 129, 0.22)' 
                          : inHotspot 
                            ? 'rgba(239, 68, 68, 0.12)' 
                            : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected
                          ? '2px solid var(--emerald-400)'
                          : inHotspot
                            ? '2px dashed rgba(239, 68, 68, 0.7)'
                            : `1px solid ${badge.border}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '84px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isSelected 
                          ? '0 0 16px rgba(16, 185, 129, 0.35)' 
                          : inHotspot 
                            ? '0 0 10px rgba(239, 68, 68, 0.25)' 
                            : 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Hotspot indicator pip */}
                      {inHotspot && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          boxShadow: '0 0 6px #ef4444'
                        }} />
                      )}

                      {/* Plant Visual Emoji */}
                      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                        {plant.status === 'attention' ? '🍂' : plant.status === 'watch' ? '🌾' : '🌿'}
                      </span>

                      {/* Plant ID */}
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        fontFamily: 'monospace'
                      }}>
                        {plant.id}
                      </span>

                      {/* Status / Health Score Tag */}
                      <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        background: badge.bg,
                        color: badge.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {plant.healthScore !== null && plant.healthScore !== undefined ? (
                          <span>{plant.healthScore}%</span>
                        ) : (
                          <span>{badge.label}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
