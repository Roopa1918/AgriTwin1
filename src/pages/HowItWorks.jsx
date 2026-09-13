// AgriTwin — Educational Architecture & System Workflow (PRD Section 36 & 43)
import React from 'react';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { 
  Workflow, 
  Cpu, 
  Radio, 
  Database, 
  Box, 
  BarChart3, 
  Zap, 
  Droplets, 
  ArrowDown, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Digital Twin Architecture & Cyber-Physical Pipeline</h1>
          <p>
            Educational reference explaining how the complete agricultural Digital Twin workflow 
            bridges physical field phenomena, IoT sensor ingestion, cloud synchronization, and automated decision support.
          </p>
        </div>
      </div>

      {/* Primary Educational Notice (PRD Section 36) */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        color: '#d1fae5',
        lineHeight: 1.5,
        fontSize: '0.9rem'
      }}>
        <strong>Academic Demonstration Architecture: </strong>
        Physical sensors are not currently installed on the selected field. The AgriTwin platform 
        uses an authentic, correlated sensor simulation engine to demonstrate the complete end-to-end 
        Digital Twin workflow. The data models and ingestion layer are engineered so that real ESP32 / IoT hardware 
        can be connected in the future without requiring major frontend changes.
      </div>

      {/* Side-by-Side Comparison: Current Prototype vs Future Hardware Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
        {/* Current Prototype Pipeline */}
        <div className="glass-card" style={{ borderColor: 'var(--emerald-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <span className="pulse-dot" style={{ background: '#10b981' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Current Prototype Pipeline</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--emerald-400)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Cpu size={16} color="var(--emerald-400)" /> 1. Physics-Correlated Sensor Simulator
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Generates gradual, correlated telemetry (SM-Z01..Z04, TEMP, HUM, RAIN, WIND, SOLAR, PH, EC) with gradual decay and event injection.
              </p>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--emerald-400)' }}><ArrowDown size={18} /></div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Database size={16} color="#38bdf8" /> 2. Firebase Cloud & Telemetry Bridge
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Firestore collections (<code style={{ color: 'var(--emerald-300)' }}>sensors</code>, <code style={{ color: 'var(--emerald-300)' }}>sensorReadings</code>, <code style={{ color: 'var(--emerald-300)' }}>zones</code>, <code style={{ color: 'var(--emerald-300)' }}>alerts</code>) synchronize via real-time WebSocket listeners.
              </p>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--emerald-400)' }}><ArrowDown size={18} /></div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #a855f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Box size={16} color="#a855f7" /> 3. Three.js 3D Digital Twin
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Procedural maize canopy dynamically updates color-coding (Green &rarr; Amber &rarr; Red), visualizes sensor beacons, and sprays animated sprinkler mist.
              </p>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--emerald-400)' }}><ArrowDown size={18} /></div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Zap size={16} color="#f59e0b" /> 4. Decision Support & Irrigation Prescriptions
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Rule engine detects moisture deficits, triggers alerts, and recommends micro-sprinkler execution for human verification.
              </p>
            </div>
          </div>
        </div>

        {/* Future Real Hardware Deployment (PRD Section 43) */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sparkles size={18} color="var(--color-water)" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Future Physical Hardware Integration</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Radio size={16} color="#0284c7" /> 1. Physical Probe Network in Soil
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Decagon 10HS soil moisture probes, Sensirion SHT35 ambient weather stations, and tipping bucket rain gauges installed physically in active field zones.
              </p>
            </div>

            <div style={{ textAlign: 'center', color: '#0284c7' }}><ArrowDown size={18} /></div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Cpu size={16} color="#0284c7" /> 2. ESP32 LoRa / Wi-Fi Gateways
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Solar-powered ESP32 microcontroller nodes sample analog/digital sensors every 15 minutes, format JSON telemetry payloads, and transmit via Wi-Fi or LoRaWAN.
              </p>
            </div>

            <div style={{ textAlign: 'center', color: '#0284c7' }}><ArrowDown size={18} /></div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Database size={16} color="#0284c7" /> 3. Direct Firebase REST / MQTT Ingestion
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                ESP32 posts directly to identical Firestore collections. Zero frontend changes required because telemetry schema is already standardized!
              </p>
            </div>

            <div style={{ textAlign: 'center', color: '#0284c7' }}><ArrowDown size={18} /></div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#fff' }}>
                <Droplets size={16} color="#0284c7" /> 4. Precision Solenoid Valve Actuation
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Irrigation recommendations can be confirmed by human farm managers to actuate physical 24V solenoid valves via relay boards.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
