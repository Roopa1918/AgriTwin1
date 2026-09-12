// AgriTwin — Climate Scenario Simulator Page (PRD Section 25 & 26)
import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { CLIMATE_SCENARIOS, calculateScenarioImpact } from '../services/climateSimulator';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import StatusPill from '../components/common/StatusPill';
import { Flame, Thermometer, CloudRain, Wind, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function ClimateSimulation({ setTab }) {
  const { currentTemp, currentHumidity, currentRainfall, avgSoilMoisture, setScenario } = useTelemetry();
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('hotDry');

  const currentTelemetry = {
    temperature: parseFloat(currentTemp),
    rainfall: parseFloat(currentRainfall),
    moisture: parseFloat(avgSoilMoisture)
  };

  const impact = calculateScenarioImpact(selectedScenarioKey, currentTelemetry);

  const applyScenarioToField = () => {
    setScenario(selectedScenarioKey);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Climate Scenario Simulator</h1>
          <p>
            Demonstrates how agricultural Digital Twin technology models climate change resilience. 
            Simulate elevated temperatures and precipitation shifts to assess projected water stress.
          </p>
        </div>
      </div>

      {/* Mandatory PRD Disclaimer Banner */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 20px',
        color: '#fca5a5',
        fontSize: '0.84rem',
        lineHeight: 1.5
      }}>
        <strong>Academic Modeling Notice: </strong>
        These are hypothetical demonstration scenarios for academic presentation. 
        Outputs represent sensitivity test results, not actual regional meteorological forecasts.
      </div>

      {/* Scenario Selection Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#fff' }}>
          Select Hypothetical Climate Stress Scenario
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {Object.values(CLIMATE_SCENARIOS).map(sc => {
            const isSelected = selectedScenarioKey === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenarioKey(sc.id)}
                style={{
                  background: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-surface-card)',
                  border: `2px solid ${isSelected ? '#f97316' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#f97316',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}>
                    ACTIVE MODEL
                  </span>
                )}
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {sc.name}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px', minHeight: '38px' }}>
                  {sc.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Temperature:</span>
                    <strong style={{ color: sc.tempDelta > 0 ? '#f97316' : 'var(--emerald-400)' }}>
                      {sc.tempDelta > 0 ? `+${sc.tempDelta}°C` : '0°C (Normal)'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Precipitation:</span>
                    <strong style={{ color: sc.rainDeltaPercent < 0 ? '#ef4444' : 'var(--emerald-400)' }}>
                      {sc.rainDeltaPercent !== 0 ? `${sc.rainDeltaPercent}%` : 'Normal'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Atmospheric Humidity:</span>
                    <strong style={{ color: sc.humidityDeltaPercent < 0 ? '#f59e0b' : 'var(--emerald-400)' }}>
                      {sc.humidityDeltaPercent !== 0 ? `${sc.humidityDeltaPercent}%` : 'Normal'}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Climate Impact Result Box (PRD Section 26) */}
      <div className="glass-card" style={{ borderColor: impact.waterStress === 'HIGH' || impact.waterStress === 'CRITICAL / SEVERE' ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-medium)', background: 'rgba(20, 10, 12, 0.7)' }}>
        <div className="glass-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={20} color="#f97316" />
            <div>
              <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 700, letterSpacing: '0.06em' }}>
                SIMULATED SCENARIO RESULT (PRD SECTION 26)
              </span>
              <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>
                Climate Scenario: {impact.scenario.name}
              </h2>
            </div>
          </div>

          <button onClick={applyScenarioToField} className="btn btn-primary btn-sm">
            <Sparkles size={14} /> Inject Scenario into Live Simulator
          </button>
        </div>

        {/* Impact Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '20px 0' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ambient Temperature Shift</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>
              {currentTemp}°C &rarr; {impact.simulatedTemp}°C
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Thermal evaporative spike</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rainfall Frequency</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: impact.scenario.rainDeltaPercent < 0 ? '#ef4444' : 'var(--emerald-400)', marginTop: '4px' }}>
              {impact.scenario.rainDeltaPercent < 0 ? `${impact.scenario.rainDeltaPercent}% Deficit` : 'Baseline'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Reduced recharge window</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Projected Soil Moisture</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
              {impact.expectedMoisture}% VWC
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Accelerated root-zone depletion</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Crop Water Stress Level</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: impact.waterStress === 'HIGH' ? '#ef4444' : '#fbbf24', marginTop: '4px' }}>
              {impact.waterStress}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Stomatal closure risk</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Irrigation Priority</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
              {impact.irrigationPriority}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Automated advisory trigger</span>
          </div>
        </div>

        {/* Narrative Agronomic Conclusion */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          borderLeft: '4px solid #ef4444',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.92rem',
          color: '#fee2e2',
          lineHeight: 1.5
        }}>
          <strong>Decision Support Finding: </strong>
          "{impact.impactSummary}"
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
