// AgriTwin — Field, Thresholds & Firebase Configuration Page (PRD Section 9, 21, 59)
import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { Settings as SettingsIcon, Sliders, MapPin, Database, Save, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const { 
    thresholds, 
    fieldConfig, 
    firebaseConfig, 
    updateThresholds, 
    updateFieldConfig, 
    updateFirebaseConfig,
    resetSettingsToDefault 
  } = useSettings();

  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [localField, setLocalField] = useState(fieldConfig);
  const [localFirebase, setLocalFirebase] = useState(firebaseConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateThresholds(localThresholds);
    updateFieldConfig(localField);
    updateFirebaseConfig(localFirebase);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    resetSettingsToDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Platform Settings & Agronomic Configuration</h1>
          <p>
            Configure demonstration threshold limits, field geospatial boundaries, 
            crop parameters, and optional live Firebase project credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-sm">
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>Configuration saved successfully to browser storage and active telemetry engine.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Configurable Demo Thresholds (PRD Section 21) */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Sliders size={18} color="var(--emerald-400)" />
              <span>Configurable Demonstration Thresholds</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Controls GOOD, MODERATE and LOW status classification across all screens
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Optimal Soil Moisture Threshold (GOOD &gt;)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.moisture.good}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    moisture: { ...localThresholds.moisture, good: parseFloat(e.target.value) }
                  })}
                  style={{
                    width: '100%',
                    background: 'rgba(5, 13, 10, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#fff',
                    fontFamily: 'inherit'
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Moderate Moisture Depletion (MODERATE &gt;)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.moisture.moderate}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    moisture: { ...localThresholds.moisture, moderate: parseFloat(e.target.value) }
                  })}
                  style={{
                    width: '100%',
                    background: 'rgba(5, 13, 10, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#fff',
                    fontFamily: 'inherit'
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Critical Low Moisture Threshold (CRITICAL &lt;)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.moisture.critical}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    moisture: { ...localThresholds.moisture, critical: parseFloat(e.target.value) }
                  })}
                  style={{
                    width: '100%',
                    background: 'rgba(5, 13, 10, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#fff',
                    fontFamily: 'inherit'
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Thermal Heatwave Warning Threshold (&gt;)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.temperature.warning}
                  onChange={(e) => setLocalThresholds({
                    ...localThresholds,
                    temperature: { ...localThresholds.temperature, warning: parseFloat(e.target.value) }
                  })}
                  style={{
                    width: '100%',
                    background: 'rgba(5, 13, 10, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#fff',
                    fontFamily: 'inherit'
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Campus Field Metadata & Geospatial Coordinates (PRD Section 9) */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <MapPin size={18} color="var(--emerald-400)" />
              <span>Campus Field Geographic & Agronomic Configuration</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Field Name
              </label>
              <input
                type="text"
                value={localField.name}
                onChange={(e) => setLocalField({ ...localField, name: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={localField.latitude}
                onChange={(e) => setLocalField({ ...localField, latitude: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={localField.longitude}
                onChange={(e) => setLocalField({ ...localField, longitude: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Cultivated Crop
              </label>
              <input
                type="text"
                value={localField.crop}
                onChange={(e) => setLocalField({ ...localField, crop: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Live Firebase Credentials Setup (PRD Section 59) */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Database size={18} color="#38bdf8" />
              <span>Firebase Cloud Backend Integration (Optional Live Service)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Dual-Engine: Works 100% out of the box in Local Pub/Sub mode or connected to Firebase
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Firebase Project ID
              </label>
              <input
                type="text"
                value={localFirebase.projectId}
                onChange={(e) => setLocalFirebase({ ...localFirebase, projectId: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
                placeholder="agritwin-campus-prod"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Firebase Web API Key
              </label>
              <input
                type="password"
                value={localFirebase.apiKey}
                onChange={(e) => setLocalFirebase({ ...localFirebase, apiKey: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
                placeholder="AIzaSy..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Auth Domain
              </label>
              <input
                type="text"
                value={localFirebase.authDomain}
                onChange={(e) => setLocalFirebase({ ...localFirebase, authDomain: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
                placeholder="agritwin.firebaseapp.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                App ID
              </label>
              <input
                type="text"
                value={localFirebase.appId}
                onChange={(e) => setLocalFirebase({ ...localFirebase, appId: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit'
                }}
                placeholder="1:123456789:web:abcdef"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          <Save size={16} /> Save and Apply All Settings
        </button>
      </form>

      <DisclaimerAlert />
    </div>
  );
}
