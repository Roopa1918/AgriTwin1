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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Current Condition Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '3rem' }}>{liveWeather.conditionIcon}</span>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Condition</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{liveWeather.condition}</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>🟢 LIVE WEATHER</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Field Temperature</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
            {liveWeather.temperature}°C
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>🟢 LIVE WEATHER</span>
        </div>

        {/* Air Moisture */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Air Moisture</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
            {liveWeather.humidity}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>🟢 LIVE WEATHER</span>
        </div>

        {/* Rain */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Precipitation</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-water)', margin: '4px 0' }}>
            {liveWeather.rainfall} mm
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>🟢 LIVE WEATHER</span>
        </div>

        {/* Wind */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Wind Speed</span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
            {liveWeather.windSpeed} km/h
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>🟢 LIVE WEATHER</span>
        </div>
      </div>

      {/* Today's Hourly Forecast (PRD Section 17) */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="glass-card-title">
            <Clock size={18} color="var(--emerald-400)" />
            <span>Today's Weather Timeline</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Next 8 Hours</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
          {liveWeather.hourly.map((h, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 10px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>{h.time}</span>
              <span style={{ fontSize: '1.8rem' }}>{h.icon}</span>
              <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{h.temp}°C</strong>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
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
