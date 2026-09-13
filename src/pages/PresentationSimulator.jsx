// AgriTwin — Dedicated Presentation Simulator & Demo Engine Page (PRD Section 33 & 34)
import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  AlertTriangle, 
  FastForward, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Flame
} from 'lucide-react';

export default function PresentationSimulator({ setTab }) {
  const {
    simulationState,
    setScenario,
    setSpeed,
    toggleRunning,
    triggerLowMoisture,
    triggerTempRise,
    triggerRainfall,
    triggerSensorFailure,
    triggerIrrigation,
    resetDemo,
    zones,
    recommendations,
    activeAlerts,
    currentEventIndex,
    presentationEvents,
    jumpToPresentationEvent,
    setIsPresentationMode
  } = useTelemetry();

  const z2 = zones.find(z => z.id === 'zone2') || zones[1];
  const z2Rec = recommendations.find(r => r.zoneId === 'zone2');
  const z2Moisture = z2?.moisture ?? 41.8;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Presentation Simulator & Demo Control Center</h1>
          <p>
            Dedicated control board designed for the presenter to trigger specific agro-climatic scenarios, 
            inject physical anomalies, and step through the 9-event presentation narrative.
          </p>
        </div>

        <button onClick={() => setIsPresentationMode(true)} className="btn btn-primary">
          <Sparkles size={16} /> Open Fullscreen Presenter HUD
        </button>
      </div>

      {/* Target Zone 2 Live Monitor Card */}
      <div className="glass-card" style={{
        borderColor: z2Moisture < 25 ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)',
        background: z2Moisture < 25 ? 'rgba(30, 10, 14, 0.8)' : 'var(--bg-surface-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Live Telemetry Subject: Zone 2 (North-East Plot)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: z2Moisture < 25 ? '#f87171' : '#fff', fontFamily: 'var(--font-heading)' }}>
                {z2Moisture.toFixed(1)}%
              </span>
              <span className={`status-pill ${z2?.status?.toLowerCase() ?? 'good'}`}>
                {z2?.status ?? 'GOOD'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Probe: <strong>SM-Z02</strong> &bull; Irrigation Status: {z2?.irrigationActive ? '● SPRINKLERS ACTIVE' : 'Idle'}
            </div>
          </div>

          <div style={{ minWidth: 'min(100%, 320px)', maxWidth: '480px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active Decision Advisory</span>
            <p style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 600, marginTop: '4px' }}>
              "{z2Rec?.recommendation || 'No immediate irrigation required.'}"
            </p>
            <div style={{ fontSize: '0.74rem', color: 'var(--emerald-400)', marginTop: '4px' }}>
              Priority: {z2Rec?.priority || 'LOW'}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Engine Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
        {/* Scenario & Speed Selectors */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#fff' }}>
            Telemetry Engine Settings
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Simulation Engine State
            </label>
            <button 
              onClick={toggleRunning}
              className={`btn btn-sm ${simulationState.isRunning ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {simulationState.isRunning ? <Pause size={15} /> : <Play size={15} />}
              <span>{simulationState.isRunning ? 'Pause Telemetry Ticks' : 'Resume Telemetry Engine'}</span>
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Telemetry Frequency Speed
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'slow', label: 'Slow (6s)' },
                { id: 'normal', label: 'Normal (3s)' },
                { id: 'fast', label: 'Fast (1s)' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSpeed(s.id)}
                  className={`btn btn-sm ${simulationState.speed === s.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Atmospheric Environment Preset
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { id: 'normal', label: 'Normal Baseline' },
                { id: 'dry', label: 'Dry Field' },
                { id: 'hot', label: 'Elevated Heat' },
                { id: 'hotDry', label: 'Hot & Dry Heatwave' }
              ].map(sc => (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id)}
                  className={`btn btn-sm ${simulationState.scenario === sc.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Instant Triggers */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#fff' }}>
            Immediate Demonstration Event Triggers (PRD Section 33)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Inject instantaneous state mutations to demonstrate real-time frontend listener response:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={triggerLowMoisture} className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
              <AlertTriangle size={16} />
              <span>TRIGGER LOW MOISTURE (Zone 2 gradual decay to 24%)</span>
            </button>

            <button onClick={() => triggerTempRise(4.5)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Thermometer size={16} color="#f59e0b" />
              <span>TRIGGER TEMPERATURE RISE (+4.5°C Heatwave)</span>
            </button>

            <button onClick={() => triggerRainfall(14.0)} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <CloudRain size={16} color="var(--color-water)" />
              <span>TRIGGER RAINFALL (14 mm precipitation recharge)</span>
            </button>

            <button onClick={() => triggerSensorFailure('SM-Z02')} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <AlertTriangle size={16} color="#f87171" />
              <span>TRIGGER SENSOR FAILURE (Toggle SM-Z02 Offline)</span>
            </button>

            <button onClick={() => triggerIrrigation('zone2')} className="btn btn-water" style={{ justifyContent: 'flex-start' }}>
              <Droplets size={16} />
              <span>SIMULATE IRRIGATION (Activate spray & recover Zone 2 to 38%)</span>
            </button>

            <button onClick={resetDemo} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <RotateCcw size={16} />
              <span>RESET DEMO (Restore pristine baseline)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complete 9-Event Narrative Walkthrough Sequencer (PRD Section 34 & 61) */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="glass-card-title">
            <Sparkles size={18} color="var(--emerald-400)" />
            <span>Recommended Presentation Story Walkthrough (Events 1–9)</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Follow this chronological script during your presentation
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {presentationEvents.map((ev, idx) => {
            const isCurrent = idx === currentEventIndex;
            return (
              <div
                key={ev.id}
                style={{
                  background: isCurrent ? 'rgba(16, 185, 129, 0.14)' : 'rgba(0,0,0,0.25)',
                  border: `1px solid ${isCurrent ? 'var(--emerald-400)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--emerald-500)' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}>
                    {ev.id}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isCurrent ? '#fff' : 'var(--text-muted)' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {ev.shortDesc} &bull; <strong style={{ color: isCurrent ? 'var(--emerald-300)' : 'var(--text-muted)' }}>Presenter Talking Point:</strong> {ev.hint}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => jumpToPresentationEvent(idx)}
                  className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flexShrink: 0, fontSize: '0.78rem' }}
                >
                  {isCurrent ? 'Active Event' : 'Jump to Step'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
