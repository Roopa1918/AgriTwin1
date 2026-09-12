// AgriTwin — Presentation Simulator & Demo Controls Modal / Drawer (PRD Section 33)
import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { X, Play, Pause, RotateCcw, Droplets, Thermometer, CloudRain, AlertTriangle, FastForward, Sliders } from 'lucide-react';

export default function DemoSimulatorModal({ isOpen, onClose }) {
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
    resetDemo
  } = useTelemetry();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#091510',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <Sliders size={20} color="var(--emerald-400)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Presentation Simulator Controls</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Trigger simulated agricultural events in real time</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Engine Heartbeat & Speed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Simulation Heartbeat</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <button 
                onClick={toggleRunning} 
                className={`btn btn-sm ${simulationState.isRunning ? 'btn-secondary' : 'btn-primary'}`}
                style={{ flex: 1 }}
              >
                {simulationState.isRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{simulationState.isRunning ? 'Pause Engine' : 'Resume Engine'}</span>
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Telemetry Cycle Speed</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {['slow', 'normal', 'fast'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`btn btn-sm ${simulationState.speed === s ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Climate Scenarios */}
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Predefined Climate Scenarios
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { id: 'normal', label: 'Normal' },
              { id: 'dry', label: 'Dry' },
              { id: 'hot', label: 'Hot' },
              { id: 'hotDry', label: 'Hot & Dry' }
            ].map(sc => (
              <button
                key={sc.id}
                onClick={() => setScenario(sc.id)}
                className={`btn btn-sm ${simulationState.scenario === sc.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Presentation Triggers (PRD Section 33) */}
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Manual Demo Event Triggers (Immediate Action)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              onClick={() => { triggerLowMoisture(); onClose(); }}
              className="btn btn-danger btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <AlertTriangle size={15} />
              <span>Trigger Low Moisture (Z2)</span>
            </button>

            <button 
              onClick={() => { triggerTempRise(4.5); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Thermometer size={15} color="#f59e0b" />
              <span>Trigger Temperature Rise</span>
            </button>

            <button 
              onClick={() => { triggerRainfall(14.0); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <CloudRain size={15} color="var(--color-water)" />
              <span>Trigger Rainfall Event</span>
            </button>

            <button 
              onClick={() => { triggerSensorFailure('SM-Z02'); onClose(); }}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <AlertTriangle size={15} color="#f87171" />
              <span>Trigger Sensor Failure</span>
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button 
              onClick={() => { triggerIrrigation('zone2'); onClose(); }}
              className="btn btn-water"
              style={{ width: '100%', marginBottom: '8px' }}
            >
              <Droplets size={16} />
              <span>Simulate Virtual Irrigation (Recover Zone 2)</span>
            </button>

            <button 
              onClick={() => { resetDemo(); onClose(); }}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <RotateCcw size={15} />
              <span>Reset Entire Demonstration Baseline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
