// AgriTwin — Dedicated Fullscreen 3D Digital Twin Centerpiece Page (PRD Section 12 & 13)
import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import DigitalTwin3D from '../components/3d/DigitalTwin3D';
import ZoneDetailDrawer from '../components/3d/ZoneDetailDrawer';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { Layers, Droplets, RotateCcw, Eye, ShieldCheck, Activity, Info, AlertTriangle, Sparkles } from 'lucide-react';

export default function DigitalTwinPage() {
  const { 
    zones, 
    selectedZoneId, 
    setSelectedZoneId, 
    triggerLowMoisture, 
    triggerIrrigation, 
    resetDemo,
    setIsPresentationMode 
  } = useTelemetry();

  const [activeLayer, setActiveLayer] = useState('all'); // 'all', 'moisture', 'health'

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Cyber-Physical 3D Agricultural Digital Twin</h1>
          <p>
            Interactive Three.js virtual model of your agricultural field. Rotatable, zoomable terrain 
            responding in real-time to simulated IoT soil moisture probes and environmental sensors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsPresentationMode(true)} className="btn btn-primary btn-sm">
            <Sparkles size={15} /> Presenter HUD
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-surface-card)',
        padding: '14px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Zone Selection:</span>
          {zones.map(z => (
            <button
              key={z.id}
              onClick={() => setSelectedZoneId(z.id)}
              className={`btn btn-sm ${selectedZoneId === z.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '5px 10px' }}
            >
              {z.shortName} ({z.moisture?.toFixed(1)}%)
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={triggerLowMoisture}
            className="btn btn-danger btn-sm"
            title="Demonstrate drought decline on Zone 2"
          >
            <AlertTriangle size={14} /> Decline Zone 2
          </button>
          <button 
            onClick={() => triggerIrrigation('zone2')}
            className="btn btn-water btn-sm"
            title="Trigger animated water mist over Zone 2"
          >
            <Droplets size={14} /> Simulate Virtual Irrigation
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div style={{ position: 'relative', width: '100%' }}>
        <DigitalTwin3D height={640} onSelectZone={(zId) => setSelectedZoneId(zId)} />

        {/* Selected Zone Side Drawer */}
        {selectedZoneId && (
          <ZoneDetailDrawer zoneId={selectedZoneId} onClose={() => setSelectedZoneId(null)} />
        )}
      </div>

      {/* Legend & Guide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Optimal Soil Moisture (&gt; 40%)</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Plant root zone possesses adequate available water content. Healthy green foliage, normal transpiration.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span>Moderate Depletion (25% – 40%)</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Approaching management allowable depletion (MAD). Amber warning state requiring irrigation scheduling.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span>Critical Stress (&lt; 25%)</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Permanent wilting danger threshold. Zone turns crimson on 3D twin, automated alert and high irrigation advisory fire.
          </p>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
