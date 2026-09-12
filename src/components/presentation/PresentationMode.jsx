// AgriTwin — Fullscreen Presentation Mode HUD (PRD Section 60 & 61)
// Tailored for projector/screen sharing demonstrations with 9-step story stepper,
// prominent 3D Digital Twin, live KPI cards, and automated decision-support banner.

import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useSettings } from '../../context/SettingsContext';
import DigitalTwin3D from '../3d/DigitalTwin3D';
import { DemoBadge } from '../common/DemoBadge';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  RotateCcw, 
  Droplets, 
  AlertTriangle, 
  Thermometer, 
  Layers, 
  Zap, 
  CheckCircle2,
  Tv
} from 'lucide-react';

export default function PresentationMode() {
  const {
    isPresentationMode,
    setIsPresentationMode,
    currentEventIndex,
    currentPresentationEvent,
    presentationEvents,
    nextPresentationEvent,
    prevPresentationEvent,
    jumpToPresentationEvent,
    zones,
    currentTemp,
    currentHumidity,
    currentRainfall,
    recommendations,
    activeAlerts,
    triggerIrrigation
  } = useTelemetry();

  const { fieldConfig } = useSettings();

  if (!isPresentationMode) return null;

  const z2 = zones.find(z => z.id === 'zone2') || zones[1];
  const z2Rec = recommendations.find(r => r.zoneId === 'zone2') || recommendations[0];
  const z2Moisture = z2?.moisture ?? 41.8;
  const isZ2Critical = z2Moisture < 25.0;

  return (
    <div className="presentation-fullscreen-modal">
      {/* Top HUD Header */}
      <header className="presenter-hud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/favicon.svg" alt="Logo" style={{ width: '32px', height: '32px' }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>AgriTwin Presentation Mode</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>
                {fieldConfig.name} &bull; {fieldConfig.crop}
              </span>
            </div>
          </div>
          <DemoBadge />
        </div>

        {/* Top Active Irrigation Recommendation Alert if high */}
        {z2Rec && z2Rec.priority === 'HIGH' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            animation: 'pulse-glow 2s infinite'
          }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span><strong>ADVISORY:</strong> {z2Rec.recommendation}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setIsPresentationMode(false)}
            className="btn btn-secondary btn-sm"
          >
            <X size={16} /> Exit Presenter HUD
          </button>
        </div>
      </header>

      {/* Main Presentation Stage: 3D Twin with Large Overlay KPIs */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Fullscreen 3D Digital Twin Canvas */}
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <DigitalTwin3D height={window.innerHeight - 170} />

          {/* Left HUD Panel: High-Visibility Telemetry Overlays */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '280px',
            zIndex: 10
          }}>
            {/* Zone 2 Focus Card */}
            <div style={{
              background: isZ2Critical ? 'rgba(30, 10, 14, 0.9)' : 'rgba(10, 24, 18, 0.9)',
              border: `1px solid ${isZ2Critical ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-medium)'}`,
              backdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              boxShadow: isZ2Critical ? 'var(--glow-critical)' : 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Demo Focus: Zone 2
                </span>
                <span className={`status-pill ${isZ2Critical ? 'critical' : z2Moisture < 40 ? 'moderate' : 'good'}`}>
                  {isZ2Critical ? 'CRITICAL LOW' : z2Moisture < 40 ? 'MODERATE' : 'OPTIMAL'}
                </span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {z2Moisture.toFixed(1)}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>%</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                Sensor: <strong>SM-Z02</strong> &bull; Decagon 10HS
              </div>
            </div>

            {/* Quick Microclimate Gauges */}
            <div style={{
              background: 'rgba(10, 24, 18, 0.9)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Temperature</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{currentTemp}°C</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Humidity</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{currentHumidity}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Precipitation</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-water)' }}>{currentRainfall} mm</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Alerts</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: activeAlerts.length > 0 ? '#ef4444' : 'var(--emerald-400)' }}>
                  {activeAlerts.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Presenter Stepper Controller (Events 1 to 9) */}
      <footer className="presenter-stepper-bar">
        {/* Navigation Step Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={prevPresentationEvent}
            disabled={currentEventIndex === 0}
            className="btn btn-secondary btn-sm"
            style={{ opacity: currentEventIndex === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} /> Prev Event
          </button>

          <div style={{ display: 'flex', gap: '5px' }}>
            {presentationEvents.map((ev, idx) => (
              <button
                key={ev.id}
                onClick={() => jumpToPresentationEvent(idx)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: idx === currentEventIndex ? '2px solid var(--emerald-400)' : '1px solid rgba(255,255,255,0.1)',
                  background: idx === currentEventIndex ? 'var(--emerald-500)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title={ev.title}
              >
                {ev.id}
              </button>
            ))}
          </div>

          <button 
            onClick={nextPresentationEvent}
            disabled={currentEventIndex === presentationEvents.length - 1}
            className="btn btn-primary btn-sm"
            style={{ opacity: currentEventIndex === presentationEvents.length - 1 ? 0.4 : 1 }}
          >
            Next Event <ChevronRight size={16} />
          </button>
        </div>

        {/* Current Event Context & Talking Points for Presenter */}
        <div className="presenter-event-info">
          <div className="presenter-event-title">
            <span>EVENT {currentPresentationEvent.id} OF 9:</span>
            <span style={{ color: 'var(--emerald-400)' }}>{currentPresentationEvent.title}</span>
          </div>
          <p className="presenter-event-desc">
            {currentPresentationEvent.shortDesc} &bull; <strong style={{ color: '#fff' }}>Talking Point:</strong> {currentPresentationEvent.hint}
          </p>
        </div>

        {/* Quick Action Button for Presenter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => triggerIrrigation('zone2')}
            className="btn btn-water btn-sm"
          >
            <Droplets size={14} /> Simulate Virtual Irrigation
          </button>
        </div>
      </footer>
    </div>
  );
}
