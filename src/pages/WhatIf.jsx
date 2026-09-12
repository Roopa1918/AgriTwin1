// AgriTwin — What-If Weather Change Simulator (PRD Section 19)
// "See what could happen if the weather changes."

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { CloudRain, Sun, Flame, Droplets, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function WhatIf() {
  const { liveWeather } = useTelemetry();
  const [selectedScenario, setSelectedScenario] = useState('hotDry');

  const scenarios = {
    normal: {
      id: 'normal',
      title: 'Normal Weather',
      icon: '⛅',
      tempDelta: '0°C',
      rainDelta: 'Normal',
      soilWaterEffect: 'Stable',
      waterNeedEffect: 'Normal',
      cropEffect: 'Good / Healthy',
      finding: 'Standard weather conditions. No unusual water stress expected.',
      alertType: 'good'
    },
    hotter: {
      id: 'hotter',
      title: 'Hotter Weather',
      icon: '☀️',
      tempDelta: '+2°C',
      rainDelta: 'Normal',
      soilWaterEffect: 'Slightly Faster Drying',
      waterNeedEffect: 'Medium-High',
      cropEffect: 'May need more frequent checks',
      finding: 'Warm days will increase evaporation. You may need to water a day earlier.',
      alertType: 'warning'
    },
    hotDry: {
      id: 'hotDry',
      title: 'Hot & Dry',
      icon: '🔥',
      tempDelta: '+3°C',
      rainDelta: '-20%',
      soilWaterEffect: 'Decreases Faster',
      waterNeedEffect: 'High',
      cropEffect: 'Stress may increase',
      finding: 'Water need may increase. Soil water may decrease faster, causing crop stress if not watered.',
      alertType: 'danger'
    },
    heavyRain: {
      id: 'heavyRain',
      title: 'Heavy Rain',
      icon: '⛈️',
      tempDelta: '-2°C',
      rainDelta: '+35 mm',
      soilWaterEffect: 'Recharged / High',
      waterNeedEffect: 'None (No watering needed)',
      cropEffect: 'Plenty of water',
      finding: 'Heavy rainfall will recharge soil water. Turn off watering to prevent waterlogging.',
      alertType: 'info'
    }
  };

  const current = scenarios[selectedScenario] || scenarios.hotDry;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>☁ What-If Weather Changes</h1>
          <p style={{ fontSize: '1.05rem', color: '#f1f5f9' }}>
            "See what could happen if the weather changes."
          </p>
        </div>

        <span style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem',
          color: '#fbbf24',
          fontWeight: 700
        }}>
          DEMONSTRATION SCENARIO — NOT A WEATHER FORECAST
        </span>
      </div>

      {/* Large Scenario Buttons (PRD Section 19) */}
      <div>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '14px' }}>
          Choose a Weather Condition to Try:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {Object.values(scenarios).map(sc => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface-card)',
                  border: `2px solid ${isSelected ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? 'var(--glow-emerald)' : 'none'
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>{sc.icon}</span>
                <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{sc.title}</strong>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Result Box (PRD Section 19) */}
      <div className="glass-card" style={{ padding: '28px', border: '2px solid var(--emerald-400)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span style={{ fontSize: '2rem' }}>{current.icon}</span>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              WHAT COULD HAPPEN
            </span>
            <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>
              Scenario: {current.title}
            </h2>
          </div>
        </div>

        {/* Changes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '22px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Temperature Shift</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {current.tempDelta}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rain Amount</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-water)', marginTop: '4px' }}>
              {current.rainDelta}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Soil Water Effect</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {current.soilWaterEffect}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Water Need</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: current.waterNeedEffect.includes('High') ? '#ef4444' : '#34d399', marginTop: '4px' }}>
              {current.waterNeedEffect}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Crop Condition</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {current.cropEffect}
            </div>
          </div>
        </div>

        {/* Farmer Advice */}
        <div style={{
          background: current.alertType === 'danger' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
          borderLeft: `4px solid ${current.alertType === 'danger' ? '#ef4444' : '#10b981'}`,
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          fontSize: '1rem',
          color: '#f8fafc',
          lineHeight: 1.5
        }}>
          <strong>Advice for Farmer: </strong>
          "{current.finding}"
        </div>
      </div>
    </div>
  );
}
