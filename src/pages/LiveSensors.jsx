// AgriTwin — Live Sensor Network Dashboard (PRD Section 14 & 15)
import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { DemoBadge } from '../components/common/DemoBadge';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { 
  Cpu, 
  Droplets, 
  Thermometer, 
  Wind, 
  Sun, 
  CloudRain, 
  Activity, 
  Signal, 
  Battery, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Power
} from 'lucide-react';

export default function LiveSensors() {
  const { sensors, triggerSensorFailure, lastHeartbeat } = useTelemetry();
  const [secondsAgo, setSecondsAgo] = useState(1);
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'soil', 'weather'

  // Dynamic seconds-ago ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(1, Math.round((Date.now() - lastHeartbeat) / 1000));
      setSecondsAgo(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastHeartbeat]);

  const filteredSensors = sensors.filter(s => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  const getSensorIcon = (type) => {
    switch (type) {
      case 'Soil Moisture': return Droplets;
      case 'Weather': return Thermometer;
      case 'Soil': return Activity;
      default: return Cpu;
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Live Sensor Network Telemetry</h1>
          <p>
            Continuous real-time telemetry stream from active field IoT sensor nodes. 
            All values originate from the automated simulation pipeline without requiring manual entry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--emerald-300)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RefreshCw size={14} className="spin-icon" style={{ animation: 'spin 4s linear infinite' }} />
            <span>Streaming &bull; Last updated {secondsAgo} second{secondsAgo !== 1 ? 's' : ''} ago</span>
          </div>

          <DemoBadge />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        {[
          { id: 'all', label: `All Sensors (${sensors.length})` },
          { id: 'soil', label: 'Soil Moisture & Chemistry' },
          { id: 'weather', label: 'Agro-Meteorological Station' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`btn btn-sm ${filterCategory === tab.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sensors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
        {filteredSensors.map(sensor => {
          const Icon = getSensorIcon(sensor.type);
          const isOffline = sensor.status === 'Offline';
          const isWarning = sensor.sensorId === 'SM-Z02' && sensor.value < 25.0;

          return (
            <div 
              key={sensor.sensorId}
              className={`metric-card ${isOffline ? 'critical' : isWarning ? 'critical' : ''}`}
              style={{
                borderColor: isOffline ? 'rgba(239, 68, 68, 0.5)' : isWarning ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)',
                background: isOffline ? 'rgba(30, 12, 15, 0.85)' : 'var(--bg-surface-card)'
              }}
            >
              <div className="metric-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="metric-card-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{sensor.sensorId}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>{sensor.zoneName}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: isOffline ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: isOffline ? '#f87171' : 'var(--emerald-400)',
                    border: `1px solid ${isOffline ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}>
                    <span className="pulse-dot" style={{ background: isOffline ? '#ef4444' : '#10b981' }} />
                    {sensor.status}
                  </span>
                </div>
              </div>

              {/* Sensor Parameter & Big Value */}
              <div style={{ margin: '8px 0' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {sensor.parameter}
                </span>
                <div className="metric-card-value-row" style={{ marginTop: '2px' }}>
                  <span className="metric-card-value" style={{ color: isOffline ? '#64748b' : '#fff' }}>
                    {isOffline ? '---' : typeof sensor.value === 'number' ? sensor.value.toFixed(1) : sensor.value}
                  </span>
                  <span className="metric-card-unit">{sensor.unit}</span>
                </div>
              </div>

              {/* Hardware Diagnostic Footer */}
              <div className="metric-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Signal size={12} color="var(--emerald-400)" /> {sensor.rssi} dBm
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Battery size={12} color="var(--emerald-400)" /> {sensor.battery}%
                  </span>
                </div>

                {/* Simulated Fault Injection Trigger */}
                <button
                  onClick={() => triggerSensorFailure(sensor.sensorId)}
                  title={isOffline ? 'Restore Sensor Online' : 'Simulate Sensor Disconnect'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isOffline ? 'var(--emerald-400)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem'
                  }}
                >
                  <Power size={12} /> {isOffline ? 'Reconnect' : 'Simulate Fail'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DisclaimerAlert />
    </div>
  );
}
