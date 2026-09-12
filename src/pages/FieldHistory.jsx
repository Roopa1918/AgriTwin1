// AgriTwin — Field History Page (PRD Section 18)
// Simple, readable graphs for Soil Water, Field Temperature, and Rain.

import React, { useState } from 'react';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import TelemetryChart from '../components/charts/TelemetryChart';
import { BarChart2, Calendar, Droplets, Thermometer, CloudRain } from 'lucide-react';

export default function FieldHistory() {
  const { activeField } = useFields();
  const { historyBuffer } = useTelemetry();
  const [timeRange, setTimeRange] = useState('Today'); // 'Today', '7 Days', '30 Days'

  // Datasets
  const soilWaterDatasets = [
    {
      label: 'Zone 1 Soil Water (%)',
      data: historyBuffer.zone1,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.3
    },
    {
      label: 'Zone 2 Soil Water (%)',
      data: historyBuffer.zone2,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2.5,
      tension: 0.3
    }
  ];

  const tempDatasets = [
    {
      label: 'Field Temperature (°C)',
      data: historyBuffer.temperatures,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      fill: true,
      tension: 0.3
    }
  ];

  const rainDatasets = [
    {
      label: 'Rain (mm)',
      data: historyBuffer.rainfall,
      borderColor: '#0284c7',
      backgroundColor: 'rgba(2, 132, 199, 0.35)',
      fill: true,
      tension: 0.2
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>📊 Field History</h1>
          <p>
            Review past soil water levels, field temperature, and rainfall records for <strong>{activeField?.name}</strong>.
          </p>
        </div>

        {/* Time Window Buttons (PRD Section 18) */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {['Today', '7 Days', '30 Days'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`btn btn-sm ${timeRange === r ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: 'none',
                background: timeRange === r ? 'var(--emerald-500)' : 'transparent',
                color: timeRange === r ? '#fff' : 'var(--text-muted)'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Simple Graphs (PRD Section 18) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Graph 1: Soil Water */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Droplets size={18} color="var(--emerald-400)" />
              <span>Soil Water Over {timeRange}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Percent Moisture (% VWC)</span>
          </div>
          <TelemetryChart 
            labels={historyBuffer.times}
            datasets={soilWaterDatasets}
            yAxisLabel="%"
            min={15}
            max={55}
            height={260}
          />
        </div>

        {/* Graph 2: Field Temperature */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Thermometer size={18} color="#f59e0b" />
              <span>Field Temperature Over {timeRange}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Degrees Celsius (°C)</span>
          </div>
          <TelemetryChart 
            labels={historyBuffer.times}
            datasets={tempDatasets}
            yAxisLabel="°C"
            min={18}
            max={38}
            height={240}
          />
        </div>

        {/* Graph 3: Rain */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <CloudRain size={18} color="var(--color-water)" />
              <span>Rain Recorded Over {timeRange}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Millimeters (mm)</span>
          </div>
          <TelemetryChart 
            labels={historyBuffer.times}
            datasets={rainDatasets}
            yAxisLabel="mm"
            min={0}
            max={15}
            height={220}
          />
        </div>
      </div>
    </div>
  );
}
