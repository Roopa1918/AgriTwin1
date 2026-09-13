// AgriTwin — Weather Page (PRD Section 7, 8, 17)
// Displays Real Live Weather from Open-Meteo for the selected field's GPS location.

import React from 'react';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import { Thermometer, Wind, CloudRain, Sun, RefreshCw, MapPin, Calendar, Clock } from 'lucide-react';

export default function WeatherPage() {
  const { activeField } = useFields();
  const { liveWeather, weatherLoading } = useTelemetry();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>🌤 Field Weather Forecast</h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              🟢 LIVE WEATHER
            </span>
          </div>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <MapPin size={15} color="var(--emerald-400)" />
            <span>Weather for <strong>{activeField?.name}</strong> ({activeField?.latitude?.toFixed(3)}°N, {activeField?.longitude?.toFixed(3)}°E)</span>
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Updated {liveWeather.lastUpdated}
        </div>
      </div>

      {/* "Now" Current Weather Big Cards (PRD Section 17) */}
      <div className="weather-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px' }}>
        {/* Current Condition Card */}
        <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 22px)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: 'clamp(2.2rem, 6vw, 3rem)' }}>{liveWeather.conditionIcon}</span>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Condition</span>
            <div style={{ fontSize: 'clamp(1.15rem, 4vw, 1.4rem)', fontWeight: 800, color: '#fff' }}>{liveWeather.condition}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)' }}>🟢 LIVE WEATHER</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="metric-card" style={{ padding: 'clamp(14px, 3.5vw, 22px)' }}>
          <span className="metric-card-label">Field Temperature</span>
          <div className="metric-card-value-row">
            <span className="metric-card-value" style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2.2rem)' }}>
              {liveWeather.temperature}°
            </span>
            <span className="metric-card-unit">C</span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.7rem' }}>🟢 LIVE</span>
          </div>
        </div>

        {/* Air Moisture */}
        <div className="metric-card" style={{ padding: 'clamp(14px, 3.5vw, 22px)' }}>
          <span className="metric-card-label">Air Moisture</span>
          <div className="metric-card-value-row">
            <span className="metric-card-value" style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2.2rem)' }}>
              {liveWeather.humidity}
            </span>
            <span className="metric-card-unit">%</span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.7rem' }}>🟢 LIVE</span>
          </div>
        </div>

        {/* Rain */}
        <div className="metric-card" style={{ padding: 'clamp(14px, 3.5vw, 22px)' }}>
          <span className="metric-card-label">Precipitation</span>
          <div className="metric-card-value-row">
            <span className="metric-card-value" style={{ color: 'var(--color-water)', fontSize: 'clamp(1.5rem, 5.5vw, 2.2rem)' }}>
              {liveWeather.rainfall}
            </span>
            <span className="metric-card-unit">mm</span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.7rem' }}>🟢 LIVE</span>
          </div>
        </div>

        {/* Wind */}
        <div className="metric-card" style={{ padding: 'clamp(14px, 3.5vw, 22px)' }}>
          <span className="metric-card-label">Wind Speed</span>
          <div className="metric-card-value-row">
            <span className="metric-card-value" style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2.2rem)' }}>
              {liveWeather.windSpeed}
            </span>
            <span className="metric-card-unit">km/h</span>
          </div>
          <div className="metric-card-footer">
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.7rem' }}>🟢 LIVE</span>
          </div>
        </div>
      </div>

      {/* Today's Hourly Forecast (PRD Section 17) */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="glass-card-header">
          <div className="glass-card-title">
            <Clock size={18} color="var(--emerald-400)" />
            <span>Today's Weather Timeline</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Next 8 Hours</span>
        </div>

        <div style={{
          display: 'flex',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          gap: '12px',
          paddingBottom: '8px'
        }}>
          {liveWeather.hourly.map((h, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 10px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                minWidth: '94px',
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>{h.time}</span>
              <span style={{ fontSize: '1.7rem' }}>{h.icon}</span>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{h.temp}°C</strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>💧 {h.humidity}%</span>
              {h.rain > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--color-water)' }}>🌧 {h.rain}mm</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Next 5 Days Forecast Cards (PRD Section 17) */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="glass-card-title">
            <Calendar size={18} color="var(--emerald-400)" />
            <span>Next 5 Days Farming Forecast</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Daily Weather Prediction</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '12px' }}>
          {liveWeather.daily.map((d, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1rem', color: '#fff' }}>{d.day}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{d.date}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <span style={{ fontSize: '2rem' }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    {d.maxTemp}° / <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{d.minTemp}°</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.label}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: d.rain > 0 ? 'var(--color-water)' : 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                {d.rain > 0 ? `🌧 Rain: ${d.rain} mm expected` : '☀️ No significant rain'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
