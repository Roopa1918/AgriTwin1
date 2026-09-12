// AgriTwin — Simple Farmer Field Report (PRD Section 4 & 37)
import React from 'react';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import { FileText, Printer, MapPin, CheckCircle2, Droplets, Thermometer, Wind } from 'lucide-react';

export default function Reports() {
  const { activeField } = useFields();
  const { liveWeather, zones, simpleRecommendation, avgSoilWater } = useTelemetry();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>📄 Field Summary Report</h1>
          <p>
            A simple, printable report summarizing current weather, soil water status, 
            and watering recommendations for <strong>{activeField?.name}</strong>.
          </p>
        </div>

        <button onClick={() => window.print()} className="btn btn-primary">
          <Printer size={16} />
          <span>Print / Save Report</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="glass-card" style={{ padding: '36px', background: '#0a1a13' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-medium)', paddingBottom: '18px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.8rem' }}>🌱</span>
              <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>AgriTwin Field Report</h2>
            </div>
            <div style={{ color: 'var(--emerald-400)', fontSize: '1rem', fontWeight: 600 }}>
              {activeField?.name} &bull; {activeField?.crop} ({activeField?.area})
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>Status: Updated</div>
          </div>
        </div>

        {/* Live Weather Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '12px' }}>
            1. Live Weather for Field Coordinates
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field Temperature</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{liveWeather.temperature}°C</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Air Moisture</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{liveWeather.humidity}%</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rain Today</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-water)' }}>{liveWeather.rainfall} mm</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Condition</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{liveWeather.condition}</div>
            </div>
          </div>
        </div>

        {/* Soil Water Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '12px' }}>
            2. Soil Water Status (4 Zones)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {zones.map(z => (
              <div key={z.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: '#fff', display: 'block', fontSize: '0.9rem' }}>{z.name}</strong>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: z.soilWater < 25 ? '#f87171' : '#fff', margin: '4px 0' }}>
                  {z.soilWater?.toFixed(1)}%
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: z.soilWater < 25 ? '#f87171' : z.soilWater < 40 ? '#fbbf24' : '#34d399' }}>
                  {z.status === 'Needs Water' ? '🔴 Needs Water' : z.status === 'Watch' ? '🟡 Watch' : '🟢 Good'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Section */}
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--emerald-400)', marginBottom: '4px' }}>
            {simpleRecommendation.title}
          </h4>
          <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>
            "{simpleRecommendation.text}"
          </p>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {simpleRecommendation.reason}
          </p>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          AgriTwin Platform &bull; “Simple Farming Decisions from Smart Field Data”
        </div>
      </div>
    </div>
  );
}
