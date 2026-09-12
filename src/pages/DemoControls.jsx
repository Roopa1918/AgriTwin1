// AgriTwin — Presentation & Demo Controls Page (PRD Section 36 & 37)
// Dedicated control center for college presentations and technical demonstrations.

import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useFields } from '../context/FieldsContext';
import { Sliders, Play, Pause, RotateCcw, Droplets, Thermometer, CloudRain, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DemoControls({ setTab }) {
  const { activeField } = useFields();
  const {
    simulationSpeed,
    setSimulationSpeed,
    isEngineRunning,
    setIsEngineRunning,
    triggerLowMoisture,
    waterZone2,
    resetDemo,
    z2Water,
    isIrrigatingZone2
  } = useTelemetry();

  const demoSteps = [
    { step: 1, title: 'Login & Open App', desc: 'Farmer logs in; 1-click Demo Mode available.' },
    { step: 2, title: 'Select Field on Map', desc: 'User chooses agricultural plot anywhere on interactive Leaflet map.' },
    { step: 3, title: 'Name Field & Crop', desc: 'Farmer names it "Demo Farm" and picks "Tomato" or custom crop.' },
    { step: 4, title: 'Live Weather Streams', desc: 'Real Open-Meteo weather arrives for field coordinates (Live Temp, Humidity, Rain).' },
    { step: 5, title: 'Open Field Monitor (3D)', desc: '3D canopy generates with 4 dynamic zones based on field location.' },
    { step: 6, title: 'Zone 2 Soil Water Drops', desc: '42% → 39% → 36% → 33% → 30% → 27% → 24%.' },
    { step: 7, title: 'Zone 2 Turns Red', desc: 'Status shifts from 🟢 Good → 🟡 Watch → 🔴 Needs Water.' },
    { step: 8, title: 'Automated Alert & Advice', desc: '"Zone 2 may need water soon. Soil water is going down and little rain is expected."' },
    { step: 9, title: 'What-If Weather Testing', desc: 'Farmer tests "Hot & Dry" scenario (+3°C, -20% Rain) to observe increased stress.' },
    { step: 10, title: 'Virtual Irrigation', desc: 'Farmer clicks "Water Zone 2". Sprinkler mist activates in 3D twin.' },
    { step: 11, title: 'Soil Water Recharges', desc: 'Zone 2 soil water rises: 24% → 30% → 35% → 38%.' },
    { step: 12, title: 'Status Becomes Good 🟢', desc: 'Alert clears and status restores to 🟢 Good.' },
    { step: 13, title: 'Field History Trend', desc: 'View time-series trend line showing moisture drop and recharge.' },
    { step: 14, title: 'Summary Report', desc: 'Generate and print complete farmer field summary.' }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>🎮 Presentation Demo Controls</h1>
            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
              DEMO MODE
            </span>
          </div>
          <p>
            Quick controls for college presentations to demonstrate the full Digital Twin story.
          </p>
        </div>

        <button onClick={resetDemo} className="btn btn-secondary">
          <RotateCcw size={15} /> Reset Demo Baseline
        </button>
      </div>

      {/* Target Zone 2 Status */}
      <div className="glass-card" style={{ padding: '20px', background: z2Water < 25 ? 'rgba(30, 10, 14, 0.75)' : 'var(--bg-surface-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Active Field: {activeField?.name} &bull; Zone 2 Target
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: z2Water < 25 ? '#f87171' : '#fff' }}>
              Zone 2 Soil Water: {z2Water?.toFixed(1)}%
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={triggerLowMoisture} className="btn btn-danger">
              <AlertTriangle size={15} /> Trigger Low Soil Water (24%)
            </button>
            <button onClick={waterZone2} className="btn btn-water">
              <Droplets size={15} /> {isIrrigatingZone2 ? 'Watering Active...' : 'Water Zone 2'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Engine Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '12px' }}>
            Simulation Speed
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { id: 'slow', label: 'Slow (6s)' },
              { id: 'normal', label: 'Normal (3s)' },
              { id: 'fast', label: 'Fast (1s)' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSimulationSpeed(s.id)}
                className={`btn btn-sm ${simulationSpeed === s.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '12px' }}>
            Engine State
          </h3>
          <button
            onClick={() => setIsEngineRunning(prev => !prev)}
            className={`btn ${isEngineRunning ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%' }}
          >
            {isEngineRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isEngineRunning ? 'Pause Soil Simulation' : 'Resume Soil Simulation'}</span>
          </button>
        </div>
      </div>

      {/* 14-Step Presentation Script (PRD Section 37) */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--emerald-400)" />
          <span>Recommended Presentation Demonstration Scenario (Steps 1–14)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {demoSteps.map(s => (
            <div
              key={s.step}
              style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--emerald-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
                flexShrink: 0
              }}>
                {s.step}
              </span>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{s.title}</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
