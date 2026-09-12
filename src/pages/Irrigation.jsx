// AgriTwin — Irrigation Intelligence & Virtual Irrigation Page (PRD Section 30, 31, 32)
import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import StatusPill from '../components/common/StatusPill';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { Droplets, CheckCircle2, AlertTriangle, Play, RotateCcw, Clock, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function Irrigation({ setTab }) {
  const { zones, recommendations, triggerIrrigation, currentTemp, currentRainfall } = useTelemetry();
  const [successMessage, setSuccessMessage] = useState(null);

  const z2 = zones.find(z => z.id === 'zone2') || zones[1];
  const isZ2Irrigating = z2?.irrigationActive;

  const handleSimulateIrrigation = (zoneId = 'zone2') => {
    triggerIrrigation(zoneId);
    setSuccessMessage('Virtual irrigation initiated over Zone 2. Micro-sprinklers active in 3D Digital Twin.');
    setTimeout(() => {
      setSuccessMessage('Virtual irrigation completed. Soil moisture restored to ~38% VWC. Alert resolved.');
    }, 4000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Irrigation Intelligence & Decision Support</h1>
          <p>
            Automated prescription algorithms synthesizing multi-zone soil moisture gradients, 
            crop water stress indices, and weather demand to optimize precision water delivery.
          </p>
        </div>

        <button 
          onClick={() => handleSimulateIrrigation('zone2')}
          disabled={isZ2Irrigating}
          className="btn btn-water"
        >
          <Droplets size={16} />
          <span>{isZ2Irrigating ? 'Irrigation Cycle Active (Mist Spraying)...' : 'SIMULATE IRRIGATION (ZONE 2)'}</span>
        </button>
      </div>

      {/* Interactive Virtual Irrigation Confirmation Notice (PRD Section 31) */}
      {successMessage && (
        <div style={{
          background: 'rgba(2, 132, 199, 0.15)',
          border: '1px solid rgba(2, 132, 199, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          color: '#bae6fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'pulse-glow 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Droplets size={20} color="#38bdf8" />
            <div>
              <strong>Presentation Simulation Event: </strong>
              <span>{successMessage}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(2, 132, 199, 0.3)', padding: '3px 8px', borderRadius: '4px' }}>
            DEMO ONLY
          </span>
        </div>
      )}

      {/* Mandatory Safety Notice */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        fontSize: '0.8rem',
        color: '#fde68a'
      }}>
        <strong>Safety Constraint Notice: </strong>
        This simulation operates exclusively inside the digital environment and does NOT actuate physical campus valves or pumps.
      </div>

      {/* Irrigation Intelligence Table (PRD Section 30) */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>
            Zone Prescription & Allocation Schedule
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time advisory computed every telemetry cycle by recommendation engine
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(10, 20, 15, 0.9)', color: 'var(--emerald-400)', borderBottom: '1px solid var(--border-subtle)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '14px 20px' }}>Zone</th>
                <th style={{ padding: '14px 16px' }}>Current Moisture</th>
                <th style={{ padding: '14px 16px' }}>Moisture Trend</th>
                <th style={{ padding: '14px 16px' }}>Rainfall</th>
                <th style={{ padding: '14px 16px' }}>Thermal State</th>
                <th style={{ padding: '14px 16px' }}>Irrigation Priority</th>
                <th style={{ padding: '14px 20px' }}>Recommendation & Action</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => {
                const rec = recommendations.find(r => r.zoneId === zone.id);
                const isTarget = zone.id === 'zone2';
                const isLow = zone.moisture < 25.0;

                return (
                  <tr 
                    key={zone.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: isLow ? 'rgba(239, 68, 68, 0.08)' : isTarget ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{zone.shortName}</span>
                        {isTarget && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: '4px' }}>
                            DEMO
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>{zone.area}</span>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <strong style={{ fontSize: '1.1rem', color: isLow ? '#f87171' : '#fff' }}>
                        {zone.moisture?.toFixed(1)}%
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>VWC</span>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isLow ? '#f87171' : 'var(--emerald-400)',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}>
                        {isLow ? '↓ Decreasing' : '→ Stable'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 16px', color: 'var(--text-muted)' }}>
                      {parseFloat(currentRainfall) > 0 ? `${currentRainfall} mm` : 'No rain'}
                    </td>

                    <td style={{ padding: '16px 16px', color: 'var(--text-muted)' }}>
                      {parseFloat(currentTemp) > 34 ? 'Elevated Heat' : 'Normal'}
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <StatusPill status={rec?.priority || (isLow ? 'HIGH' : 'LOW')} />
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.86rem', marginBottom: '2px' }}>
                        {rec?.recommendation || (isLow ? 'Irrigation may be required.' : 'No irrigation recommended')}
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>
                        {rec?.reason}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Water Management & Conservation Metrics (PRD Section 32) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="glass-card">
          <span className="metric-card-label">Estimated Water Savings</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '6px' }}>
            32.4%
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Compared against conventional scheduled calendar flood irrigation.
          </p>
        </div>

        <div className="glass-card">
          <span className="metric-card-label">Application Method</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            Micro-Sprinkler & Drip
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Direct root-zone deposition minimizes atmospheric drift and evaporative loss.
          </p>
        </div>

        <div className="glass-card">
          <span className="metric-card-label">Management Allowable Depletion</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', marginTop: '6px' }}>
            45% MAD Trigger
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ensures soil water tension does not reach permanent wilting point (-15 bar).
          </p>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
