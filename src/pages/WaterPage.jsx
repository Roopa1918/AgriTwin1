// AgriTwin — Soil Water & Virtual Irrigation Page (PRD Section 14, 15, 21)
// Simple zone water bars, clear watering advice, and 1-click virtual watering action.

import React, { useState } from 'react';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import { Droplets, CheckCircle2, AlertTriangle, Play, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

export default function WaterPage() {
  const { activeField } = useFields();
  const { 
    zones, 
    simpleRecommendation, 
    waterZone2, 
    isIrrigatingZone2,
    z2Water 
  } = useTelemetry();

  const [notification, setNotification] = useState(null);

  const handleWaterClick = () => {
    waterZone2();
    setNotification('Watering Zone 2 initiated! Watch soil water increase from 24% to 38%...');
    setTimeout(() => {
      setNotification('Watering complete! Zone 2 soil water is restored to 38%. Status is now Good 🟢.');
    }, 4500);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>💧 Field Water & Soil Moisture</h1>
          <p>
            Monitor soil water availability across your 4 field zones. 
            Automated recommendations help you know when and where to water without wasting resources.
          </p>
        </div>

        <button 
          onClick={handleWaterClick}
          disabled={isIrrigatingZone2}
          className="btn btn-water"
        >
          <Droplets size={16} />
          <span>{isIrrigatingZone2 ? 'Watering Active (Mist Spraying)...' : 'Water Zone 2 (Virtual)'}</span>
        </button>
      </div>

      {/* Confirmation Notification */}
      {notification && (
        <div style={{
          background: 'rgba(2, 132, 199, 0.18)',
          border: '1px solid rgba(2, 132, 199, 0.45)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          color: '#bae6fd',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Droplets size={20} color="#38bdf8" />
          <div style={{ flex: 1 }}>
            <strong>Virtual Demonstration: </strong>
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Simple Recommendation Card (PRD Section 15) */}
      <div style={{
        background: simpleRecommendation.title.includes('WATER NEEDED') ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
        border: `2px solid ${simpleRecommendation.title.includes('WATER NEEDED') ? '#ef4444' : '#10b981'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: simpleRecommendation.title.includes('WATER NEEDED') ? '#f87171' : 'var(--emerald-400)', letterSpacing: '0.04em' }}>
            {simpleRecommendation.title}
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
            {simpleRecommendation.text}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            {simpleRecommendation.reason}
          </p>
        </div>

        {z2Water < 25 && (
          <button onClick={handleWaterClick} className="btn btn-water">
            <Droplets size={16} />
            <span>Water Zone 2 Now</span>
          </button>
        )}
      </div>

      {/* 4-Zone Soil Water Bars (PRD Section 14) */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px' }}>
          Soil Water in Each Zone
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {zones.map((z, idx) => {
            const isLow = z.soilWater < 25;
            const isWatch = z.soilWater >= 25 && z.soilWater < 40;

            return (
              <div 
                key={z.id}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${isLow ? 'rgba(239, 68, 68, 0.4)' : isWatch ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{z.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Soil Water Sensor: {z.sensorId}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                      {z.soilWater?.toFixed(1)}%
                    </span>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isLow ? 'rgba(239, 68, 68, 0.25)' : isWatch ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                      color: isLow ? '#f87171' : isWatch ? '#fbbf24' : '#34d399'
                    }}>
                      {isLow ? '🔴 Needs Water' : isWatch ? '🟡 Watch' : '🟢 Good'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: 'rgba(255,255,255,0.08)', height: '14px', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      width: `${Math.min(100, (z.soilWater / 60) * 100)}%`,
                      height: '100%',
                      background: isLow ? '#ef4444' : isWatch ? '#f59e0b' : '#10b981',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>

                {isLow && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#f87171' }}>
                      ⚠️ Soil water is below the safe 25% threshold for {activeField?.crop || 'crops'}.
                    </span>
                    <button onClick={handleWaterClick} className="btn btn-water btn-sm" style={{ minHeight: '40px' }}>
                      Water Zone 2
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        fontSize: '0.82rem',
        color: '#bae6fd'
      }}>
        <strong>Virtual Demonstration Notice: </strong>
        Watering triggers in this prototype are virtual demonstrations. The system does not control physical pumps or irrigation equipment.
      </div>
    </div>
  );
}
