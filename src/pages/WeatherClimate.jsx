// AgriTwin — Weather & Microclimate Page (PRD Section 24)
import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import MetricCard from '../components/common/MetricCard';
import TelemetryChart from '../components/charts/TelemetryChart';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { 
  CloudSun, 
  Thermometer, 
  Wind, 
  CloudRain, 
  Sun, 
  Gauge, 
  ArrowRight,
  Flame
} from 'lucide-react';

export default function WeatherClimate({ setTab }) {
  const { 
    currentTemp, 
    currentHumidity, 
    currentRainfall, 
    currentWind, 
    currentSolar,
    historyData 
  } = useTelemetry();

  // Simulated FAO-56 Penman-Monteith Reference Evapotranspiration (ET0)
  const tempNum = parseFloat(currentTemp);
  const humNum = parseFloat(currentHumidity);
  const et0 = Math.max(1.8, (tempNum * 0.18 - humNum * 0.02 + 1.2)).toFixed(2);

  const weatherDatasets = [
    {
      label: 'Temperature (°C)',
      data: historyData.temperature,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      yAxisID: 'y',
      tension: 0.3
    },
    {
      label: 'Humidity (%)',
      data: historyData.humidity,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      yAxisID: 'y1',
      tension: 0.3
    }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Agro-Meteorological Weather & Microclimate</h1>
          <p>
            Field mast weather station telemetry tracking ambient temperature, vapor pressure deficit, 
            precipitation, and reference evapotranspiration (ET0).
          </p>
        </div>

        <button onClick={() => setTab('climate-sim')} className="btn btn-primary btn-sm">
          <Flame size={15} /> Climate Scenario Simulator <ArrowRight size={14} />
        </button>
      </div>

      {/* Distinction Banner (PRD Section 24) */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          <div>
            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>CURRENT SIMULATED CONDITIONS (REAL-TIME FIELD TELEMETRY)</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Distinct from hypothetical Climate Scenarios. Reflects live simulated readings at the campus weather mast.
            </p>
          </div>
        </div>

        <button onClick={() => setTab('climate-sim')} className="btn btn-secondary btn-sm">
          Explore Simulated Scenarios (Warmer / Hot & Dry)
        </button>
      </div>

      {/* Weather Telemetry Cards Grid */}
      <div className="kpi-grid">
        <MetricCard
          title="Air Temperature"
          value={currentTemp}
          unit="°C"
          icon={Thermometer}
          status={parseFloat(currentTemp) > 34 ? 'moderate' : 'good'}
          trend="stable"
          trendText="Sensirion SHT35 Sim"
        />

        <MetricCard
          title="Relative Humidity"
          value={currentHumidity}
          unit="%"
          icon={Wind}
          status="good"
          trend="stable"
          trendText="Atmospheric Moisture"
        />

        <MetricCard
          title="Precipitation"
          value={currentRainfall}
          unit="mm"
          icon={CloudRain}
          status="good"
          trend="stable"
          trendText="Davis AeroCone Gauge"
        />

        <MetricCard
          title="Wind Velocity"
          value={currentWind}
          unit="km/h"
          icon={Wind}
          status="good"
          trend="stable"
          trendText="Ultrasonic Anemometer"
        />

        <MetricCard
          title="Solar Irradiance"
          value={currentSolar}
          unit="W/m²"
          icon={Sun}
          status="good"
          trend="stable"
          trendText="Apogee Pyranometer"
        />

        <MetricCard
          title="Reference ET0"
          value={et0}
          unit="mm/day"
          icon={Gauge}
          status="good"
          trend="stable"
          trendText="Penman-Monteith Model"
        />
      </div>

      {/* Microclimate Time-Series Chart */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="glass-card-title">
            <CloudSun size={18} color="var(--emerald-400)" />
            <span>Temperature & Humidity Inverse Dynamic Coupling</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time correlation observed at the campus mast
          </span>
        </div>

        <TelemetryChart 
          labels={historyData.timestamps}
          datasets={weatherDatasets}
          yAxisLabel="val"
          height={300}
        />
      </div>

      <DisclaimerAlert />
    </div>
  );
}
