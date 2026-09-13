// AgriTwin — Agronomic Analytics & Historical Telemetry Page (PRD Section 27)
import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import TelemetryChart from '../components/charts/TelemetryChart';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { BarChart3, Clock, Calendar, Download, TrendingUp, Layers, Droplets } from 'lucide-react';

export default function Analytics() {
  const { historyData, zones } = useTelemetry();
  const [timeFilter, setTimeFilter] = useState('1h'); // '1h', '6h', '24h', '7d'

  // Time-filter mock multiplier for historical curves
  const getHistoricalMultiplier = () => {
    switch (timeFilter) {
      case '7d': return 1.1;
      case '24h': return 1.05;
      case '6h': return 1.02;
      default: return 1.0;
    }
  };

  const mult = getHistoricalMultiplier();

  // 1. Soil Moisture vs Time
  const soilMoistureDatasets = [
    {
      label: 'Zone 1 VWC (%)',
      data: historyData.zone1.map(v => v * mult),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      fill: true,
      tension: 0.3
    },
    {
      label: 'Zone 2 VWC (%) - Demo Focus',
      data: historyData.zone2.map(v => v * mult),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      fill: true,
      borderWidth: 2.5,
      tension: 0.3
    }
  ];

  // 2. Temperature vs Time
  const tempDatasets = [
    {
      label: 'Ambient Temperature (°C)',
      data: historyData.temperature.map(v => v * mult),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      fill: true,
      tension: 0.3
    }
  ];

  // 3. Humidity vs Time
  const humDatasets = [
    {
      label: 'Relative Humidity (%)',
      data: historyData.humidity.map(v => v * mult),
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      fill: true,
      tension: 0.3
    }
  ];

  // 4. Rainfall & Irrigation Events
  const rainDatasets = [
    {
      label: 'Precipitation Events (mm)',
      data: historyData.rainfall.map(v => v * mult),
      borderColor: '#0284c7',
      backgroundColor: 'rgba(2, 132, 199, 0.3)',
      fill: true,
      tension: 0.2
    }
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Agronomic Analytics & Historical Telemetry</h1>
          <p>
            Longitudinal trend telemetry and multivariate environmental correlation analysis 
            for the active agricultural field.
          </p>
        </div>

        {/* Time Window Selector (PRD Section 27) */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: '1h', label: 'Last 1 Hour' },
            { id: '6h', label: 'Last 6 Hours' },
            { id: '24h', label: 'Last 24 Hours' },
            { id: '7d', label: 'Last 7 Days' }
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeFilter(tf.id)}
              className={`btn btn-sm ${timeFilter === tf.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                background: timeFilter === tf.id ? 'var(--emerald-500)' : 'transparent',
                color: timeFilter === tf.id ? '#fff' : 'var(--text-muted)'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 4 Key Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        {/* Chart 1: Soil Moisture */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Droplets size={17} color="var(--emerald-400)" />
              <span>Soil Moisture Dynamics ({timeFilter})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Volumetric Water Content %</span>
          </div>
          <TelemetryChart 
            labels={historyData.timestamps}
            datasets={soilMoistureDatasets}
            yAxisLabel="%"
            min={15}
            max={55}
            height={240}
          />
        </div>

        {/* Chart 2: Ambient Temperature */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <TrendingUp size={17} color="#f59e0b" />
              <span>Thermal Profile ({timeFilter})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Air Temperature °C</span>
          </div>
          <TelemetryChart 
            labels={historyData.timestamps}
            datasets={tempDatasets}
            yAxisLabel="°C"
            min={20}
            max={40}
            height={240}
          />
        </div>

        {/* Chart 3: Atmospheric Humidity */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <TrendingUp size={17} color="#38bdf8" />
              <span>Vapor Pressure & Relative Humidity ({timeFilter})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Relative Humidity %</span>
          </div>
          <TelemetryChart 
            labels={historyData.timestamps}
            datasets={humDatasets}
            yAxisLabel="%"
            min={30}
            max={95}
            height={240}
          />
        </div>

        {/* Chart 4: Rainfall & Hydration */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Droplets size={17} color="#0284c7" />
              <span>Precipitation & Infiltration Events ({timeFilter})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Precipitation Depth mm</span>
          </div>
          <TelemetryChart 
            labels={historyData.timestamps}
            datasets={rainDatasets}
            yAxisLabel="mm"
            min={0}
            max={25}
            height={240}
          />
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#fff' }}>
          Historical Telemetry Aggregations ({timeFilter})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.86rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Min / Max Zone 2 VWC</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              24.2% / 42.4%
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Cumulative Rainfall</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-water)', marginTop: '4px' }}>
              {(parseFloat(historyData.rainfall.slice(-1)[0] || 0) * 1.8).toFixed(1)} mm
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Thermal Mean</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
              29.4 °C
            </div>
          </div>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
