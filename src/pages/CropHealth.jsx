// AgriTwin — Crop Health & Vegetation Index Dashboard (PRD Section 29)
import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import StatusPill from '../components/common/StatusPill';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { HeartHandshake, ShieldCheck, AlertTriangle, Activity, Sun, Droplets, Leaf } from 'lucide-react';

export default function CropHealth({ setTab }) {
  const { zones, avgCropHealth } = useTelemetry();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Crop Health & Canopy Vegetation Index</h1>
          <p>
            Synthesized demonstration vegetation vitality metrics reflecting root-zone hydration, 
            thermal equilibrium, and simulated chlorophyll reflectance.
          </p>
        </div>

        {/* Mandatory Transparency Pill */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem',
          color: '#7dd3fc',
          fontWeight: 600
        }}>
          Demonstration Health Index &bull; Academic Prototype
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="kpi-grid">
        <div className="metric-card">
          <span className="metric-card-label">Mean Field Health Index</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: avgCropHealth < 75 ? '#f59e0b' : 'var(--emerald-400)' }}>
              {avgCropHealth}%
            </span>
          </div>
          <div className="metric-card-footer">
            <span>Aggregated across 4 zones</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Crop Phenological Stage</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            V6 Vegetative
          </div>
          <div className="metric-card-footer">
            <span>Maize (Hybrid Ganga-5)</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Canopy Water Deficit</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: zones.some(z => z.moisture < 25) ? '#ef4444' : '#fff', marginTop: '6px' }}>
            {zones.some(z => z.moisture < 25) ? 'Zone 2 Stressed' : 'Minimal Stress'}
          </div>
          <div className="metric-card-footer">
            <span>Stomatal conduct. normal in 3/4 zones</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Simulated NDVI Proxy</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald-400)', marginTop: '6px' }}>
            0.74 NDVI
          </div>
          <div className="metric-card-footer">
            <span>Near-infrared reflectance model</span>
          </div>
        </div>
      </div>

      {/* 4-Zone Crop Health Breakdown (PRD Section 29) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {zones.map(zone => {
          const isCritical = zone.health < 70;
          const isModerate = zone.health >= 70 && zone.health < 85;

          return (
            <div 
              key={zone.id}
              className={`glass-card ${isCritical ? 'critical' : ''}`}
              style={{
                borderColor: isCritical ? 'rgba(239, 68, 68, 0.45)' : 'var(--border-subtle)',
                background: isCritical ? 'rgba(30, 10, 14, 0.7)' : 'var(--bg-surface-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>{zone.name}</h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Area: {zone.area}</span>
                </div>
                <StatusPill status={zone.status} />
              </div>

              {/* Health Score Big Number & Bar */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: isCritical ? '#f87171' : isModerate ? '#fbbf24' : 'var(--emerald-400)', fontFamily: 'var(--font-heading)' }}>
                  {zone.health}%
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Health Score</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '16px' }}>
                <div 
                  style={{
                    width: `${zone.health}%`,
                    height: '100%',
                    background: isCritical ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              {/* Stress Factor Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Soil Water Availability:</span>
                  <strong style={{ color: zone.moisture < 25 ? '#f87171' : '#fff' }}>{zone.moisture?.toFixed(1)}% VWC</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Leaf Rolling / Wilting Risk:</span>
                  <strong style={{ color: isCritical ? '#f87171' : 'var(--emerald-400)' }}>
                    {isCritical ? 'ELEVATED' : 'MINIMAL'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Chlorophyll Synthesis:</span>
                  <strong style={{ color: '#fff' }}>{isCritical ? 'Restricted' : 'Optimal'}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DisclaimerAlert message="Crop-health scores are generated as a demonstration health index combining simulated soil moisture, thermal demand, and atmospheric humidity. This is an academic prototype and is not a scientifically certified agronomic yield model." />
    </div>
  );
}
