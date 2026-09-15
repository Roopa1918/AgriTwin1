// AgriTwin — Raw IoT Sensor Data Stream Terminal (PRD Section 16)
import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { DemoBadge } from '../components/common/DemoBadge';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { Terminal, Play, Pause, Download, Trash2, Filter, Radio } from 'lucide-react';

export default function RawData() {
  const { rawReadings, simulationState, toggleRunning } = useTelemetry();
  const [filterSensor, setFilterSensor] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReadings = rawReadings.filter(r => {
    if (filterSensor !== 'ALL' && r.sensorId !== filterSensor) return false;
    if (
      searchTerm &&
      !(r?.parameter || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(r?.sensorId || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = 'Timestamp,SensorID,Zone,Parameter,Value,Unit,Status\n';
    const rows = filteredReadings.map(r => 
      `"${r.timestamp}","${r.sensorId}","${r.zoneId || 'field'}","${r.parameter}","${r.value}","${r.unit}","${r.status}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agritwin_telemetry_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>RAW SENSOR DATA</h1>
            {/* Animated Pulsing LIVE Indicator (PRD Section 16) */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.06em'
            }}>
              <span className="pulse-dot" style={{ background: '#ef4444' }} />
              LIVE TELEMETRY STREAM
            </span>
          </div>
          <p>
            Incoming sensor readings serialized from simulated field nodes directly into the Firebase data pipeline.
            Demonstrates data transmission layer for presentation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={toggleRunning}
            className={`btn btn-sm ${simulationState.isRunning ? 'btn-secondary' : 'btn-primary'}`}
          >
            {simulationState.isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{simulationState.isRunning ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button onClick={exportCSV} className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV
          </button>
          
          <DemoBadge />
        </div>
      </div>

      {/* Terminal Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-surface-card)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sensor ID:</span>
          <select 
            value={filterSensor}
            onChange={(e) => setFilterSensor(e.target.value)}
            style={{
              background: '#091510',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <option value="ALL">All Sensors (All Types)</option>
            <option value="SM-Z01">SM-Z01 (Zone 1 Moisture)</option>
            <option value="SM-Z02">SM-Z02 (Zone 2 Moisture - Focus)</option>
            <option value="SM-Z03">SM-Z03 (Zone 3 Moisture)</option>
            <option value="SM-Z04">SM-Z04 (Zone 4 Moisture)</option>
            <option value="TEMP-01">TEMP-01 (Air Temp)</option>
            <option value="HUM-01">HUM-01 (Humidity)</option>
            <option value="RAIN-01">RAIN-01 (Rainfall)</option>
            <option value="WIND-01">WIND-01 (Wind)</option>
            <option value="SOLAR-01">SOLAR-01 (Solar)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Buffer: {filteredReadings.length} Frames Cached
        </div>
      </div>

      {/* Real-Time Terminal View */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={14} /> /api/v1/sensors/stream &bull; protocol: websocket / pubsub
          </div>
        </div>

        <div className="terminal-body">
          {/* Header Row */}
          <div className="telemetry-row header">
            <span>Timestamp</span>
            <span>Sensor ID</span>
            <span>Zone</span>
            <span>Parameter</span>
            <span>Value</span>
            <span>Unit</span>
            <span>Status</span>
          </div>

          {/* Incoming Telemetry Rows */}
          {filteredReadings.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Awaiting incoming sensor frames from simulation engine...
            </div>
          ) : (
            filteredReadings.map((row, idx) => {
              const isTargetSensor = row.sensorId === 'SM-Z02';
              const isCriticalVal = isTargetSensor && parseFloat(row.value) < 25.0;

              return (
                <div 
                  key={row.id || idx} 
                  className="telemetry-row"
                  style={{
                    background: isCriticalVal ? 'rgba(239, 68, 68, 0.12)' : isTargetSensor ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                    color: isCriticalVal ? '#fca5a5' : '#e2e8f0'
                  }}
                >
                  <span style={{ color: '#94a3b8' }}>{row.timestamp}</span>
                  <strong style={{ color: isCriticalVal ? '#f87171' : isTargetSensor ? 'var(--emerald-400)' : '#38bdf8' }}>
                    {row.sensorId}
                  </strong>
                  <span style={{ color: '#cbd5e1' }}>{row.zoneId || 'field'}</span>
                  <span>{row.parameter}</span>
                  <strong style={{ color: isCriticalVal ? '#f87171' : '#fff' }}>
                    {typeof row.value === 'number' ? row.value.toFixed(1) : row.value}
                  </strong>
                  <span style={{ color: '#94a3b8' }}>{row.unit}</span>
                  <span style={{ color: row.status === 'OK' ? '#34d399' : '#f87171', fontWeight: 700 }}>
                    {row.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
