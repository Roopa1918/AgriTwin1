// AgriTwin — Application Header with Field Status, Sync Indicator & Demo Controls
import React from 'react';
import { Menu, Wifi, Sparkles, Sliders, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useSettings } from '../../context/SettingsContext';
import { DemoBadge } from '../common/DemoBadge';

export default function Header({ toggleSidebar, openQuickControls }) {
  const { isSyncWarning, simulationState, setIsPresentationMode, resetDemo } = useTelemetry();
  const { fieldConfig } = useSettings();

  return (
    <header className="app-header">
      {/* Left: Mobile Toggle & Field Overview */}
      <div className="header-field-info">
        <button 
          onClick={toggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', mdDisplay: 'none', padding: '8px' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="field-title-badge">
          <div className="field-name">
            <span>{fieldConfig.name}</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: 'var(--emerald-400)', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              4 ZONES
            </span>
          </div>
          <div className="field-crop">
            <span>Crop: <strong>{fieldConfig.crop}</strong></span>
            <span>&bull;</span>
            <span>{fieldConfig.area}</span>
          </div>
        </div>
      </div>

      {/* Right: Telemetry Sync Status, Demo Badge & Presentation Trigger */}
      <div className="header-actions">
        {/* Real-Time Sync Status (PRD Section 35) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isSyncWarning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${isSyncWarning ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem'
        }}>
          {isSyncWarning ? (
            <>
              <AlertCircle size={15} color="#ef4444" />
              <span style={{ color: '#fca5a5', fontWeight: 600 }}>● SYNC WARNING</span>
            </>
          ) : (
            <>
              <span className="pulse-dot" style={{ background: '#10b981' }} />
              <span style={{ color: 'var(--emerald-300)', fontWeight: 600 }}>● DIGITAL TWIN SYNCHRONIZED</span>
            </>
          )}
        </div>

        {/* Demo Mode Badge */}
        <DemoBadge />

        {/* Quick Demo Controller Modal Trigger */}
        <button 
          onClick={openQuickControls}
          className="btn btn-secondary btn-sm"
          title="Open quick simulator trigger drawer"
        >
          <Sliders size={15} />
          <span>Demo Controls</span>
        </button>

        {/* Fullscreen Presentation Mode */}
        <button 
          onClick={() => setIsPresentationMode(true)}
          className="btn btn-primary btn-sm"
          title="Launch full-screen presentation mode"
        >
          <Sparkles size={15} />
          <span>Presentation Mode</span>
        </button>
      </div>
    </header>
  );
}
