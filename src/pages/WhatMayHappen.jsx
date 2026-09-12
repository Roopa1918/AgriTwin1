// AgriTwin — "What May Happen" Simple Forecast Page (PRD Section 20)
// Transparent trend forecasting in simple words without technical AI buzzwords.

import React from 'react';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import { Sparkles, TrendingDown, Droplets, ArrowRight, ShieldCheck } from 'lucide-react';

export default function WhatMayHappen({ setTab }) {
  const { activeField } = useFields();
  const { zones, z2Water, waterZone2, isIrrigatingZone2 } = useTelemetry();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>🔮 What May Happen</h1>
          <p>
            Simple outlook based on recent field trends to help you plan watering ahead of time.
          </p>
        </div>

        <div style={{
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem',
          color: '#7dd3fc',
          fontWeight: 600
        }}>
          Based on recent simulated trends &bull; Demonstration outlook
        </div>
      </div>

      {/* Main Focus: Zone 2 Trend Analysis in Simple Language (PRD Section 20) */}
      <div className="glass-card" style={{ padding: '28px', border: '2px solid rgba(239, 68, 68, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <TrendingDown size={24} color="#ef4444" />
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Zone 2 Outlook</h2>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>
            "Soil water is going down."
          </div>
          <p style={{ fontSize: '1.05rem', color: '#f1f5f9', lineHeight: 1.5 }}>
            "If this continues, Zone 2 may need water soon. Natural drying is occurring faster than other zones."
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Soil Water</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: z2Water < 25 ? '#f87171' : '#fff' }}>
              {z2Water?.toFixed(1)}%
            </div>
          </div>

          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Need</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>
              Within next few hours
            </div>
          </div>

          <button onClick={waterZone2} className="btn btn-water" style={{ marginLeft: 'auto' }}>
            <Droplets size={16} />
            <span>{isIrrigatingZone2 ? 'Watering Active...' : 'Water Zone 2 Now'}</span>
          </button>
        </div>
      </div>

      {/* Other Zones Summary */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px' }}>
          Outlook for Other Zones
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Zone 1 (North-West)</strong>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Soil water is steady at 41%. No watering needed today.</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Zone 3 (South-West)</strong>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Soil water is moderate at 38%. Should stay okay for another day.</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Zone 4 (South-East)</strong>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Well hydrated at 43%. Crop condition is healthy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
