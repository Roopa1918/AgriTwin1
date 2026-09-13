// AgriTwin — Farmer-First Home Dashboard (PRD Section 10, 11, 38)
// Displays 6 big simple cards, clear field status banner, 4-zone water summary, and today's weather.

import React from 'react';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  CloudRain, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Sun,
  Leaf,
  ShieldAlert,
  Camera,
  Flame
} from 'lucide-react';

export default function HomeDashboard({ setTab }) {
  const { activeField } = useFields();
  const { 
    liveWeather, 
    zones, 
    avgSoilWater, 
    z2Water, 
    fieldStatusText, 
    fieldStatusMessage, 
    fieldStatusBadge, 
    waterNeed, 
    cropCondition,
    simpleRecommendation,
    waterZone2,
    isIrrigatingZone2
  } = useTelemetry();

  return (
    <div className="page-container" style={{ gap: '22px' }}>
      {/* Friendly Greeting Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌱</span>
            <h1 style={{ fontSize: '2rem', color: '#fff' }}>Good Day, Farmer!</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-400)', marginTop: '4px', fontSize: '1rem', fontWeight: 600 }}>
            <MapPin size={18} />
            <span>{activeField?.name || 'My Field'} ({activeField?.crop})</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>&bull; {activeField?.area}</span>
          </div>
        </div>

        <button onClick={() => setTab('field-monitor')} className="btn btn-secondary">
          <span>View 3D Field Monitor</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Big Field Status Banner (PRD Section 11) */}
      <div 
        className="field-status-banner"
        style={{
          background: fieldStatusText === 'Needs Water' ? 'rgba(239, 68, 68, 0.16)' : fieldStatusText === 'Watch' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(16, 185, 129, 0.16)',
          border: `2px solid ${fieldStatusText === 'Needs Water' ? '#ef4444' : fieldStatusText === 'Watch' ? '#f59e0b' : '#10b981'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>
            YOUR FIELD STATUS
          </span>
          <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
            {fieldStatusBadge}
          </div>
          <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: '#f1f5f9', fontWeight: 500 }}>
            "{fieldStatusMessage}"
          </p>
        </div>

        {fieldStatusText === 'Needs Water' && (
          <button onClick={waterZone2} className="btn btn-water status-btn" style={{ padding: '12px 20px', fontSize: '0.96rem' }}>
            <Droplets size={18} />
            <span>{isIrrigatingZone2 ? 'Watering Active...' : 'Water Zone 2 Now'}</span>
          </button>
        )}
      </div>

      {/* 6 Large Primary Farmer Cards (PRD Section 10) — Exact 2-col on Mobile */}
      <div className="home-metrics-grid">
        {/* Card 1: Field Temperature */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Temperature</span>
            <div className="metric-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Thermometer size={18} />
            </div>
          </div>
          <div className="metric-card-value-row">
            <span className="metric-card-value">{liveWeather.temperature}°</span>
            <span className="metric-card-unit">C</span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.72rem' }}>🟢 LIVE</span>
          </div>
        </div>

        {/* Card 2: Air Moisture */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Air Moisture</span>
            <div className="metric-card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Wind size={18} />
            </div>
          </div>
          <div className="metric-card-value-row">
            <span className="metric-card-value">{liveWeather.humidity}</span>
            <span className="metric-card-unit">%</span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.72rem' }}>🟢 LIVE</span>
          </div>
        </div>

        {/* Card 3: Soil Water */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Soil Water</span>
            <div className="metric-card-icon">
              <Droplets size={18} />
            </div>
          </div>
          <div className="metric-card-value-row">
            <span className="metric-card-value" style={{ color: avgSoilWater < 25 ? '#f87171' : '#fff' }}>
              {avgSoilWater}%
            </span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.72rem' }}>🟡 SIMULATED</span>
          </div>
        </div>

        {/* Card 4: Rain */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Rain</span>
            <div className="metric-card-icon" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
              <CloudRain size={18} />
            </div>
          </div>
          <div className="metric-card-value-row">
            <span className="metric-card-value">{liveWeather.rainfall}</span>
            <span className="metric-card-unit">mm</span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.72rem' }}>🟢 LIVE</span>
          </div>
        </div>

        {/* Card 5: Crop Condition */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Crop Status</span>
            <div className="metric-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="metric-card-value-row">
            <span className="metric-card-value" style={{ fontSize: 'clamp(1.2rem, 4.5vw, 1.75rem)', color: cropCondition.status === 'Good' ? 'var(--emerald-400)' : '#f87171' }}>
              {cropCondition.status}
            </span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Score {cropCondition.healthScore}%</span>
          </div>
        </div>

        {/* Card 6: Water Need */}
        <div className="metric-card" style={{ borderColor: waterNeed.status.includes('Zone 2') ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)' }}>
          <div className="metric-card-top">
            <span className="metric-card-label">Water Need</span>
            <div className="metric-card-icon" style={{ background: waterNeed.status.includes('Zone 2') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.12)', color: waterNeed.status.includes('Zone 2') ? '#f87171' : 'var(--emerald-400)' }}>
              <Droplets size={18} />
            </div>
          </div>
          <div className="metric-card-value-row">
            <span className="metric-card-value" style={{ fontSize: 'clamp(1.05rem, 4.2vw, 1.45rem)', color: waterNeed.status.includes('Zone 2') ? '#fca5a5' : '#34d399' }}>
              {waterNeed.status}
            </span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.72rem' }}>AI IRRIGATION</span>
          </div>
        </div>
      </div>

      {/* ADVANCED FIELD SENTINEL ROW — Plant Grid, Animal Intrusion & Camera System */}
      <div className="sentinel-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
        {/* Plant Health & Pest Sentinel */}
        <div
          onClick={() => setTab('plant-health')}
          className="glass-card"
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 20, 14, 0.6) 100%)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '50%' }}>
              <Leaf size={20} color="var(--emerald-400)" />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald-400)', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
              6×6 MATRIX
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            Plant-Level Health & Pest Grid
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
            Track plant-by-plant condition, detect chewing holes, and isolate spatial pest clusters.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-400)', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>Open Plant Grid</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Animal Intrusion Sentinel */}
        <div
          onClick={() => setTab('animal-alerts')}
          className="glass-card"
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(20, 5, 8, 0.6) 100%)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '50%' }}>
              <ShieldAlert size={20} color="#ef4444" />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f87171', background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '10px' }}>
              🚨 1 ACTIVE ALERT
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            Animal Intrusion Sentinel
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
            Cattle and wild boar boundary breaches flagged with acoustic deterrent controls.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>Check Animal Alert</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Optical Camera Sentinel */}
        <div
          onClick={() => setTab('field-camera')}
          className="glass-card"
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(5, 14, 20, 0.6) 100%)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: '50%' }}>
              <Camera size={20} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7dd3fc', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
              IR OPTICAL
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            Field Optical Camera System
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
            Connect RTSP solar feeds, capture high-res snapshots, and execute edge AI diagnostics.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>Open Camera Stream</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* 4-Zone Water Summary & Today's Weather Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* 4-Zone Water Grid (PRD Section 14 & 38) */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Droplets size={18} color="var(--emerald-400)" />
              <span>Field Zones Soil Water</span>
            </div>
            <button onClick={() => setTab('water')} className="btn btn-secondary btn-sm">
              View Water Details <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {zones.map(z => {
              const isLow = z.soilWater < 25;
              const isWatch = z.soilWater >= 25 && z.soilWater < 40;

              return (
                <div key={z.id} style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{z.name}</strong>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: isLow ? '#f87171' : isWatch ? '#fbbf24' : '#34d399'
                    }}>
                      {isLow ? '🔴 Needs Water' : isWatch ? '🟡 Watch' : '🟢 Good'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, (z.soilWater / 60) * 100)}%`,
                        height: '100%',
                        background: isLow ? '#ef4444' : isWatch ? '#f59e0b' : '#10b981',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', minWidth: '45px', textAlign: 'right' }}>
                      {z.soilWater?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Weather Snapshot (PRD Section 17 & 38) */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Sun size={18} color="#f59e0b" />
              <span>Today's Live Weather for Field</span>
            </div>
            <button onClick={() => setTab('weather')} className="btn btn-secondary btn-sm">
              5-Day Forecast <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '12px 0 20px' }}>
            <span style={{ fontSize: '3.2rem' }}>{liveWeather.conditionIcon}</span>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {liveWeather.temperature}°C
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {liveWeather.condition} &bull; Wind {liveWeather.windSpeed} km/h
              </div>
            </div>
          </div>

          {/* Simple Alert Banner */}
          <div style={{
            background: simpleRecommendation.title.includes('WATER NEEDED') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${simpleRecommendation.title.includes('WATER NEEDED') ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginTop: 'auto'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: simpleRecommendation.title.includes('WATER NEEDED') ? '#f87171' : 'var(--emerald-400)', marginBottom: '4px' }}>
              {simpleRecommendation.title}
            </div>
            <p style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600 }}>
              {simpleRecommendation.text}
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '2px' }}>
              {simpleRecommendation.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
