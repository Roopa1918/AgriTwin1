// AgriTwin — Farmer-First Home Dashboard
// Adheres strictly to PART 2 specifications:
// Answers: 1. How is my field? 2. Does it need water? 3. Weather? 4. Plants? 5. Animal entry?
// Simple farmer language, clear colors, and safe default fallbacks.

import React from 'react';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  MapPin, 
  Droplets, 
  Sun, 
  Wind, 
  CloudRain, 
  Leaf, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function HomeDashboard({ setTab }) {
  const { activeField } = useFields();
  const { 
    liveWeather, 
    zones, 
    avgSoilWater, 
    z2Water, 
    waterZone2,
    isIrrigatingZone2
  } = useTelemetry();

  // Safe Fallback Data
  const fieldName = activeField?.name || 'My Field';
  const cropName = activeField?.crop || 'Select Crop';
  const areaText = activeField?.area || '2.4 Acres';
  const locationText = activeField?.village || (activeField?.latitude ? `${activeField.latitude.toFixed(2)}°N, ${activeField.longitude.toFixed(2)}°E` : 'Location not selected');
  const cropIcon = activeField?.cropIcon || '🌾';

  // Overall Condition Calculation
  const isWaterLow = (z2Water ?? 35) < 25;
  const isWaterWatch = (z2Water ?? 35) >= 25 && (z2Water ?? 35) < 40;

  const conditionStatus = isWaterLow 
    ? 'Action Needed' 
    : isWaterWatch 
    ? 'Needs Attention' 
    : 'Good';

  const conditionColor = isWaterLow 
    ? '#ef4444' 
    : isWaterWatch 
    ? '#f59e0b' 
    : '#10b981';

  const conditionBg = isWaterLow 
    ? 'rgba(239, 68, 68, 0.12)' 
    : isWaterWatch 
    ? 'rgba(245, 158, 11, 0.12)' 
    : 'rgba(16, 185, 129, 0.12)';

  const conditionBorder = isWaterLow 
    ? '#ef4444' 
    : isWaterWatch 
    ? '#f59e0b' 
    : '#10b981';

  const conditionSummary = isWaterLow
    ? 'Soil water is low in some zones. Plant check suggested. Animal entry alert active.'
    : isWaterWatch
    ? 'Soil water is getting moderate. Plants are mostly healthy. Weather is suitable.'
    : 'Soil water is okay. Plants are mostly healthy. No animal entry detected.';

  return (
    <div className="page-container" style={{ gap: '18px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* ====================================================================
          1. TOP: 🌾 MY FIELD HEADER CARD
          ==================================================================== */}
      <div 
        className="glass-card" 
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1px solid var(--border-medium)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{cropIcon}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.45rem)', fontWeight: 800, color: '#fff', margin: 0 }}>
                {fieldName}
              </h2>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald-300)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                {cropName} &bull; {areaText}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
              <MapPin size={14} color="var(--emerald-400)" />
              <span>{locationText}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setTab('my-fields')}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 16px', fontWeight: 700, minHeight: '44px' }}
        >
          <span>Change Field</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ====================================================================
          2. MAIN STATUS CARD: "How is your field today?"
          ==================================================================== */}
      <div 
        style={{
          background: conditionBg,
          border: `2px solid ${conditionBorder}`,
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(18px, 4vw, 26px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>
            HOW IS YOUR FIELD TODAY?
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem' }}>
              {isWaterLow ? '🔴' : isWaterWatch ? '🟡' : '🟢'}
            </span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 900, color: '#fff', margin: 0 }}>
              Field Condition: <span style={{ color: conditionColor }}>{conditionStatus}</span>
            </h1>
          </div>
          <p style={{ fontSize: 'clamp(0.92rem, 3vw, 1.05rem)', color: '#f1f5f9', fontWeight: 500, margin: '8px 0 0', maxWidth: '640px' }}>
            {conditionSummary}
          </p>
        </div>

        {isWaterLow && (
          <button 
            onClick={waterZone2} 
            className="btn btn-water" 
            style={{ padding: '12px 22px', fontSize: '0.98rem', minHeight: '46px', fontWeight: 700 }}
          >
            <Droplets size={18} />
            <span>{isIrrigatingZone2 ? 'Watering Active...' : 'Water Field Now'}</span>
          </button>
        )}
      </div>

      {/* ====================================================================
          3. FOUR FARMER-FIRST ACTIONABLE CARDS (2x2 Grid)
          ==================================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '16px'
      }}>
        {/* CARD 1: 💧 WATER */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>💧</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>WATER</h3>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '8px' }}>
                Simulated Sensor Data
              </span>
            </div>

            <div style={{ margin: '12px 0' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Soil Water:</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, color: (avgSoilWater ?? 34) < 25 ? '#f87171' : '#fff' }}>
                  {avgSoilWater ?? '34'}%
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: (avgSoilWater ?? 34) < 25 ? '#f87171' : '#34d399' }}>
                  ({(avgSoilWater ?? 34) < 25 ? 'Low' : (avgSoilWater ?? 34) < 40 ? 'Moderate' : 'Good'})
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '6px 0 16px' }}>
              {(avgSoilWater ?? 34) < 25 
                ? 'Your field may need water soon. Natural drying is occurring in some parts.' 
                : 'Water is okay today. All field zones have sufficient moisture.'}
            </p>
          </div>

          <button 
            onClick={() => setTab('water')} 
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', minHeight: '44px', fontWeight: 700 }}
          >
            <Droplets size={16} color="var(--emerald-400)" />
            <span>View Water Details</span>
          </button>
        </div>

        {/* CARD 2: 🌤️ TODAY'S WEATHER */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🌤️</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>TODAY'S WEATHER</h3>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '8px' }}>
                🟢 Live Weather
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '12px 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Temperature</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {liveWeather?.temperature ?? 29}°C
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Rain Today</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                  {liveWeather?.rainfall ?? 0} mm
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Air Moisture</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {liveWeather?.humidity ?? 68}%
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Wind</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {liveWeather?.windSpeed ?? 12} km/h
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '6px 0 16px' }}>
              {(liveWeather?.rainfall ?? 0) > 5 
                ? 'Rain occurring today. May reduce irrigation requirements.' 
                : 'Weather looks suitable for the field.'}
            </p>
          </div>

          <button 
            onClick={() => setTab('weather')} 
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', minHeight: '44px', fontWeight: 700 }}
          >
            <Sun size={16} color="#f59e0b" />
            <span>View 5-Day Forecast</span>
          </button>
        </div>

        {/* CARD 3: 🌱 PLANTS */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🌱</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>PLANTS</h3>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '8px' }}>
                Demo plant data
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', margin: '14px 0', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Checked</span>
                <strong style={{ fontSize: '1.3rem', color: '#fff' }}>36</strong>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <span style={{ fontSize: '0.74rem', color: '#34d399', display: 'block' }}>Healthy</span>
                <strong style={{ fontSize: '1.3rem', color: '#34d399' }}>32</strong>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <span style={{ fontSize: '0.74rem', color: '#f87171', display: 'block' }}>Needs Checking</span>
                <strong style={{ fontSize: '1.3rem', color: '#f87171' }}>4</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '6px 0 16px' }}>
              Early leaf chew marks detected on a few sample plants. Simple pest traps recommended.
            </p>
          </div>

          <button 
            onClick={() => setTab('plant-health')} 
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', minHeight: '44px', fontWeight: 700 }}
          >
            <Leaf size={16} color="var(--emerald-400)" />
            <span>Check Plants</span>
          </button>
        </div>

        {/* CARD 4: 🐄 ANIMAL ALERT */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🐄</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>ANIMAL ALERT</h3>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '8px' }}>
                Demo detection
              </span>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              margin: '12px 0 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '0.92rem' }}>
                <ShieldAlert size={16} />
                <span>⚠ Animal detected in Zone 3</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fff', marginTop: '4px' }}>
                Animal: <strong>Cow</strong> &bull; Confidence: <strong>94%</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Detected 2 mins ago near South-West boundary
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '6px 0 16px' }}>
              Sound deterrent can be triggered to protect field borders from grazing damage.
            </p>
          </div>

          <button 
            onClick={() => setTab('animal-alerts')} 
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', minHeight: '44px', fontWeight: 700, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
          >
            <ShieldAlert size={16} color="#ef4444" />
            <span>View Alert Details</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          4. MORE ADVANCED TOOLS SHORTCUT BANNER
          ==================================================================== */}
      <div 
        onClick={() => setTab('field-monitor')}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginTop: '6px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--emerald-400)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px' }}>
            <Layers size={22} color="var(--emerald-400)" />
          </div>
          <div>
            <strong style={{ fontSize: '0.98rem', color: '#fff', display: 'block' }}>
              Want to see your farm in 3D?
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Open the interactive 3D Field View, past records, and weather simulators inside More.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-400)', fontWeight: 700, fontSize: '0.86rem' }}>
          <span>Open 3D View</span>
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
