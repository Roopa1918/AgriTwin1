// AgriTwin — Comprehensive Field Audit & Agronomic Report (PRD Section 37)
import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useSettings } from '../context/SettingsContext';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { FileText, Printer, Download, CheckCircle2, AlertTriangle, ShieldCheck, Droplets, Thermometer, Wind } from 'lucide-react';

export default function FieldReport() {
  const { 
    zones, 
    sensors, 
    activeAlerts, 
    recommendations, 
    avgSoilMoisture, 
    avgCropHealth, 
    currentTemp, 
    currentHumidity, 
    currentRainfall,
    simulationState 
  } = useTelemetry();

  const { fieldConfig, thresholds } = useSettings();
  const [reportGeneratedDate] = useState(new Date().toLocaleString());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      {/* Header & Print Action */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Agronomic Digital Twin Field Audit Report</h1>
          <p>
            Consolidated intelligence summary documenting microclimate parameters, root-zone depletion, 
            active alerts, automated prescriptions, and cyber-physical synchronization.
          </p>
        </div>

        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} /> GENERATE & PRINT REPORT (PDF)
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-card" style={{ padding: '36px', background: '#0a1611' }}>
        {/* Report Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-medium)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <img src="/favicon.svg" alt="Logo" style={{ width: '36px', height: '36px' }} />
              <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>AgriTwin Field Telemetry Report</h2>
            </div>
            <p style={{ color: 'var(--emerald-400)', fontSize: '0.85rem', fontWeight: 600 }}>
              {fieldConfig.institution} &bull; Digital Twin Prototype
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div><strong>Report Generated:</strong> {reportGeneratedDate}</div>
            <div><strong>Field ID:</strong> {fieldConfig.id}</div>
            <div><strong>Simulation Status:</strong> <span style={{ color: 'var(--emerald-400)' }}>Online / Synchronized</span></div>
          </div>
        </div>

        {/* Section 1: Field Profile & Agronomic Specifications */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '14px' }}>
            1. Field Specifications & Geographic Metadata
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.86rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Field Name:</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{fieldConfig.name}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Coordinates:</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{fieldConfig.latitude}° N, {fieldConfig.longitude}° E</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Cultivated Crop:</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{fieldConfig.crop} ({fieldConfig.cropVariety})</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Total Area:</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{fieldConfig.area} ({fieldConfig.numberOfZones} Zones)</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Sowing Date & Stage:</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{fieldConfig.sowingDate} ({fieldConfig.growthStage})</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Soil Classification:</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{fieldConfig.soilType}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Current Aggregate Conditions */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '14px' }}>
            2. Field Microclimate & Current Observations
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Soil Moisture</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{avgSoilMoisture}%</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ambient Temperature</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{currentTemp} °C</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Relative Humidity</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{currentHumidity} %</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Demonstration Health</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)' }}>{avgCropHealth}%</div>
            </div>
          </div>
        </div>

        {/* Section 3: Zone Telemetry Matrix */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '14px' }}>
            3. Management Zones Telemetry & Status
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '8px 4px' }}>Zone</th>
                <th style={{ padding: '8px 4px' }}>Probe</th>
                <th style={{ padding: '8px 4px' }}>Moisture</th>
                <th style={{ padding: '8px 4px' }}>Status</th>
                <th style={{ padding: '8px 4px' }}>Health</th>
                <th style={{ padding: '8px 4px' }}>Water Stress</th>
                <th style={{ padding: '8px 4px' }}>Advisory Priority</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => {
                const rec = recommendations.find(r => r.zoneId === z.id);
                return (
                  <tr key={z.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600, color: '#fff' }}>{z.name}</td>
                    <td style={{ padding: '10px 4px', color: 'var(--emerald-400)' }}>{z.sensorId}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700, color: z.moisture < 25 ? '#f87171' : '#fff' }}>
                      {z.moisture?.toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px 4px' }}>{z.status}</td>
                    <td style={{ padding: '10px 4px' }}>{z.health}%</td>
                    <td style={{ padding: '10px 4px', color: z.waterStress === 'High' ? '#f87171' : 'inherit' }}>
                      {z.waterStress}
                    </td>
                    <td style={{ padding: '10px 4px', fontWeight: 700, color: rec?.priority === 'HIGH' ? '#f87171' : 'var(--emerald-400)' }}>
                      {rec?.priority || 'LOW'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 4: Automated Prescriptions & Alerts */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '14px' }}>
            4. Automated Decision Support & Active Alerts
          </h3>
          {recommendations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recommendations.map(r => (
                <div key={r.zoneId} style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${r.priority === 'HIGH' ? '#ef4444' : 'var(--emerald-400)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#fff' }}>{r.zoneName || r.zoneId} &bull; Priority: {r.priority}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{r.timestamp}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{r.recommendation}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '2px' }}>{r.reason}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active recommendations.</p>
          )}
        </div>

        {/* Report Footer / Signature Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <div>
            AgriTwin System Operator: <strong>{fieldConfig.institution}</strong><br />
            Prototype Simulator Build: v1.0.0-Academic
          </div>
          <div style={{ textAlign: 'right' }}>
            Verified By: <span style={{ textDecoration: 'underline' }}>Academic Evaluation Board</span>
          </div>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
