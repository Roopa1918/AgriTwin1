// AgriTwin — Soil Moisture & Agronomic Monitoring Page (PRD Section 21)
import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useSettings } from '../context/SettingsContext';
import TelemetryChart from '../components/charts/TelemetryChart';
import StatusPill from '../components/common/StatusPill';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { Layers, Droplets, ArrowDown, Activity, Sliders, ShieldCheck, Thermometer } from 'lucide-react';

export default function SoilMonitoring({ setTab }) {
  const { zones, historyData, setSelectedZoneId } = useTelemetry();
  const { thresholds } = useSettings();

  // Multi-zone moisture comparison chart datasets
  const moistureDatasets = [
    {
      label: 'Zone 1 (NW)',
      data: historyData.zone1,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.3,
      pointRadius: 2
    },
    {
      label: 'Zone 2 (NE - Demo)',
      data: historyData.zone2,
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.1)',
      borderWidth: 2.5,
      tension: 0.3,
      pointRadius: 3
    },
    {
      label: 'Zone 3 (SW)',
      data: historyData.zone3,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.3,
      pointRadius: 2
    },
    {
      label: 'Zone 4 (SE)',
      data: historyData.zone4,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      tension: 0.3,
      pointRadius: 2
    }
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Soil Moisture & Subsurface Telemetry</h1>
          <p>
            Zone-wise volumetric water content (VWC), dielectric permittivity observations, 
            and root-zone profile dynamics.
          </p>
        </div>
      </div>

      {/* Configurable Demo Thresholds Notice (PRD Section 21) */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24', marginBottom: '2px' }}>
            Configurable Demonstration Thresholds Active
          </div>
          <p style={{ fontSize: '0.8rem', color: '#fde68a' }}>
            Above 40%: <strong>GOOD</strong> &bull; 25%–40%: <strong>MODERATE</strong> &bull; Below 25%: <strong>LOW / CRITICAL</strong>.
            (Configured demo thresholds for academic presentation, not universal agronomic standards).
          </p>
        </div>
        <button onClick={() => setTab('settings')} className="btn btn-secondary btn-sm">
          <Sliders size={14} /> Adjust Thresholds
        </button>
      </div>

      {/* Zone-Wise Status Cards (PRD Section 21) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        {zones.map(zone => {
          const isCritical = zone.moisture < thresholds.moisture.moderate;
          const isModerate = zone.moisture >= thresholds.moisture.moderate && zone.moisture < thresholds.moisture.good;

          return (
            <div 
              key={zone.id}
              className={`metric-card ${isCritical ? 'critical' : ''}`}
              style={{ padding: '22px' }}
            >
              <div className="metric-card-top">
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  {zone.name}
                </span>
                <StatusPill status={zone.status} />
              </div>

              <div style={{ margin: '12px 0' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Volumetric Water Content
                </span>
                <div className="metric-card-value-row">
                  <span className="metric-card-value" style={{ color: isCritical ? '#f87171' : isModerate ? '#fbbf24' : '#fff' }}>
                    {zone.moisture?.toFixed(1)}
                  </span>
                  <span className="metric-card-unit">%</span>
                </div>
              </div>

              {/* Moisture Progress Bar Gauge */}
              <div style={{ background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px' }}>
                <div 
                  style={{
                    width: `${Math.min(100, (zone.moisture / 60) * 100)}%`,
                    height: '100%',
                    background: isCritical ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease, background 0.4s ease'
                  }}
                />
              </div>

              <div className="metric-card-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <span>Probe: {zone.sensorId}</span>
                <span style={{ color: zone.waterStress === 'High' ? '#f87171' : 'var(--emerald-400)' }}>
                  Stress: {zone.waterStress}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Zone Moisture Comparative Time-Series Chart */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="glass-card-title">
            <Activity size={18} color="var(--emerald-400)" />
            <span>4-Zone Soil Moisture Dynamic Comparison (Time-Series)</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Observing Zone 2 decline relative to stable plots
          </span>
        </div>

        <TelemetryChart 
          labels={historyData.timestamps}
          datasets={moistureDatasets}
          yAxisLabel="%"
          min={15}
          max={60}
          height={320}
        />
      </div>

      {/* Simulated Depth Horizon Analysis */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff' }}>
          Soil Stratification & Depth Moisture Profile
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--emerald-400)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Topsoil Horizon (0 – 15 cm)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
              {(parseFloat(zones[1]?.moisture ?? 40) * 0.92).toFixed(1)}% VWC
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>High diurnal evaporation; direct microclimate exposure.</p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #38bdf8' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Effective Root-Zone (15 – 45 cm)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
              {zones[1]?.moisture?.toFixed(1) ?? '41.8'}% VWC
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Primary maize root water absorption layer; critical irrigation determinant.</p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #a855f7' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subsoil Buffer (45 – 90 cm)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
              {(parseFloat(zones[1]?.moisture ?? 40) * 1.12).toFixed(1)}% VWC
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Deep hydraulic recharge zone; buffers transient surface evaporation.</p>
          </div>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
