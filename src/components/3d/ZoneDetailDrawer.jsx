// AgriTwin — Zone Details Slide-Over Drawer
import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { X, Droplets, Thermometer, Wind, Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function ZoneDetailDrawer({ zoneId, onClose }) {
  const { zones, sensors, recommendations, triggerIrrigation } = useTelemetry();

  const zone = zones.find(z => z.id === zoneId) || zones[0];
  const rec = recommendations.find(r => r.zoneId === zoneId);
  const tempSensor = sensors.find(s => s.sensorId === 'TEMP-01');
  const humSensor = sensors.find(s => s.sensorId === 'HUM-01');

  if (!zone) return null;

  const isCritical = zone.status === 'LOW' || zone.moisture < 25.0;
  const isModerate = zone.status === 'MODERATE' || (zone.moisture >= 25 && zone.moisture < 40);

  return (
    <div className="zone-drawer">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Zone Telemetry Inspector</span>
          <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{zone.name || zone.shortName}</h3>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Primary Moisture Status Highlight */}
      <div style={{
        background: isCritical ? 'rgba(239, 68, 68, 0.15)' : isModerate ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.4)' : isModerate ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Soil Moisture (VWC)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {zone.moisture?.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span>
          </div>
        </div>
        <span className={`status-pill ${zone.status.toLowerCase()}`}>
          {zone.status}
        </span>
      </div>

      {/* Metrics List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.86rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={15} color="var(--emerald-400)" /> Ambient Temperature
          </span>
          <strong style={{ color: '#fff' }}>{tempSensor?.value?.toFixed(1) || 28.8} °C</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.86rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wind size={15} color="var(--color-water)" /> Relative Humidity
          </span>
          <strong style={{ color: '#fff' }}>{humSensor?.value?.toFixed(1) || 57.8} %</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.86rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} color="var(--emerald-300)" /> Soil pH / EC
          </span>
          <strong style={{ color: '#fff' }}>{zone.pH || 6.7} pH / {zone.ec || 1.2} dS/m</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.86rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="#34d399" /> Demonstration Crop Health
          </span>
          <strong style={{ color: '#fff' }}>{zone.health || 88}%</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.86rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Water Stress Assessment</span>
          <span className={`status-pill ${zone.waterStress === 'High' ? 'critical' : zone.waterStress === 'Moderate' ? 'moderate' : 'good'}`}>
            {zone.waterStress || 'Low'}
          </span>
        </div>
      </div>

      {/* Sensor Metadata */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Primary Probe:</span>
          <strong style={{ color: '#fff' }}>{zone.sensorId}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Sensor Type:</span>
          <span>Decagon 10HS Sim</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Last Streamed:</span>
          <span style={{ color: 'var(--emerald-400)' }}>Just now (Live)</span>
        </div>
      </div>

      {/* Decision Support Recommendation */}
      {rec && (
        <div style={{
          background: rec.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${rec.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: rec.priority === 'HIGH' ? '#f87171' : 'var(--emerald-400)', marginBottom: '4px' }}>
            <Zap size={14} /> Irrigation Advisory: {rec.priority}
          </div>
          <p style={{ color: '#fff', marginBottom: '6px' }}>{rec.recommendation}</p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>{rec.reason}</p>
        </div>
      )}

      {/* Action Trigger */}
      <button 
        onClick={() => triggerIrrigation(zone.id)}
        className="btn btn-water" 
        style={{ width: '100%', marginTop: 'auto' }}
      >
        <Droplets size={16} /> Simulate Virtual Irrigation
      </button>
    </div>
  );
}
