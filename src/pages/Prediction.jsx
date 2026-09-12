// AgriTwin — Predictive Soil Moisture & Trend Forecasting Page (PRD Section 28)
import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { calculateMoisturePrediction } from '../services/predictionEngine';
import TelemetryChart from '../components/charts/TelemetryChart';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, AlertTriangle, ArrowRight, Activity, Droplets } from 'lucide-react';

export default function Prediction({ setTab }) {
  const { zones, historyData, triggerIrrigation } = useTelemetry();
  const z2 = zones.find(z => z.id === 'zone2') || zones[1];
  const z2Moisture = z2?.moisture ?? 24.2;

  // Run transparent linear regression trend on Zone 2 history
  const predictionResult = calculateMoisturePrediction(historyData.zone2, z2Moisture);

  // Chart datasets combining observed history and 6 forecasted steps
  const forecastLabels = predictionResult.forecast.map(f => f.stepHours);
  const forecastValues = predictionResult.forecast.map(f => f.predictedMoisture);

  const combinedLabels = [
    ...historyData.timestamps.slice(-6),
    ...forecastLabels
  ];

  const combinedDatasets = [
    {
      label: 'Observed Telemetry Buffer (% VWC)',
      data: [
        ...historyData.zone2.slice(-6),
        ...Array(forecastLabels.length).fill(null)
      ],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderWidth: 2.5,
      pointRadius: 4
    },
    {
      label: 'Extrapolated Linear Trend Projection (% VWC)',
      data: [
        ...Array(Math.max(0, historyData.zone2.slice(-6).length - 1)).fill(null),
        historyData.zone2.slice(-1)[0] ?? z2Moisture,
        ...forecastValues
      ],
      borderColor: '#f59e0b',
      borderDash: [6, 4],
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      pointRadius: 4,
      pointStyle: 'rectRot'
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Predictive Soil Moisture & Trend Extrapolation</h1>
          <p>
            Sliding-window regression model analyzing telemetry slopes to estimate root-zone drying rates 
            and predict time-to-critical wilting thresholds.
          </p>
        </div>

        {/* Mandatory PRD Transparency Label */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem',
          color: '#7dd3fc',
          fontWeight: 600
        }}>
          Demo prediction based on simulated sensor trends
        </div>
      </div>

      {/* Primary Prediction KPI Grid */}
      <div className="kpi-grid">
        <div className="metric-card">
          <span className="metric-card-label">Current Zone 2 Moisture</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: z2Moisture < 25 ? '#f87171' : '#fff' }}>
              {z2Moisture.toFixed(1)}
            </span>
            <span className="metric-card-unit">%</span>
          </div>
          <div className="metric-card-footer">
            <span>Decagon 10HS Probe SM-Z02</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Identified Telemetry Trend</span>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: predictionResult.trendDirection === 'DECLINING' ? '#f87171' : 'var(--emerald-400)',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {predictionResult.trendDirection === 'DECLINING' ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
            <span>{predictionResult.trendDirection}</span>
          </div>
          <div className="metric-card-footer">
            <span>Regression Slope: {predictionResult.slope} % / step</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Soil Drying Velocity</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: '#f59e0b' }}>
              {predictionResult.dryingRate}
            </span>
            <span className="metric-card-unit">%/hr</span>
          </div>
          <div className="metric-card-footer">
            <span>Driven by evapotranspiration</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Projected Hours to Critical Stress</span>
          <div className="metric-card-value-row" style={{ marginTop: '6px' }}>
            <span className="metric-card-value" style={{ color: z2Moisture < 25 ? '#ef4444' : '#fff', fontSize: '1.6rem' }}>
              {predictionResult.projectedStressHours ? `${predictionResult.projectedStressHours} hrs` : 'N/A'}
            </span>
          </div>
          <div className="metric-card-footer">
            <span>Threshold: 24.5% VWC</span>
          </div>
        </div>
      </div>

      {/* Trend Forecast Chart */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="glass-card-title">
            <Activity size={18} color="var(--emerald-400)" />
            <span>Telemetry History & Extrapolated Forward Trajectory (+6 Hours)</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Transparent linear extrapolation &bull; Not a black-box AI model
          </span>
        </div>

        <TelemetryChart 
          labels={combinedLabels}
          datasets={combinedDatasets}
          yAxisLabel="%"
          min={15}
          max={50}
          height={320}
        />
      </div>

      {/* Decision-Support Output (PRD Section 28) */}
      <div className="glass-card" style={{ background: 'rgba(16, 28, 22, 0.85)' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--emerald-400)" />
          <span>Predictive Agronomic Advisory</span>
        </h3>

        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          "{predictionResult.summaryText}"
        </p>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
          {predictionResult.advice}
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => triggerIrrigation('zone2')} className="btn btn-water">
            <Droplets size={16} /> Simulate Virtual Irrigation to Arrest Decline
          </button>
          <button onClick={() => setTab('irrigation')} className="btn btn-secondary">
            View Zone Irrigation Matrix <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
