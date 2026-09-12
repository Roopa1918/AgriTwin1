// AgriTwin — Automated Alert System & Log (PRD Section 23)
import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Check, Filter } from 'lucide-react';

export default function Alerts() {
  const { alerts, activeAlerts, criticalAlertsCount, resolveAlert } = useTelemetry();
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL', 'CRITICAL', 'WARNING', 'INFO'
  const [showResolved, setShowResolved] = useState(false);

  const filteredAlerts = alerts.filter(a => {
    if (!showResolved && a.resolved) return false;
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'CRITICAL': return <AlertTriangle size={18} color="#ef4444" />;
      case 'WARNING': return <AlertCircle size={18} color="#f59e0b" />;
      case 'INFO':
      default: return <Info size={18} color="#38bdf8" />;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Automated Telemetry Alerts & Anomaly Monitor</h1>
          <p>
            Real-time rule engine detecting threshold breaches, rapid root-zone depletion rates, 
            excessive ambient heat, and sensor wireless link interruptions.
          </p>
        </div>

        {/* Severity Summary Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 700 }}>
            {criticalAlertsCount} Critical
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 14px', borderRadius: 'var(--radius-md)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
            {activeAlerts.filter(a => a.severity === 'WARNING').length} Warnings
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 14px', borderRadius: 'var(--radius-md)', color: '#7dd3fc', fontSize: '0.8rem', fontWeight: 700 }}>
            {activeAlerts.filter(a => a.severity === 'INFO').length} Info
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-surface-card)',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`btn btn-sm ${filterSeverity === sev ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {sev}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input 
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          />
          <span>Include Resolved Past Alerts</span>
        </label>
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
            <CheckCircle2 size={36} color="var(--emerald-400)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '4px' }}>No Active Alerts Matching Criteria</h3>
            <p style={{ fontSize: '0.84rem' }}>
              All soil moisture parameters, weather sensors, and gateways operating within nominal limits.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderLeft: `4px solid ${isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8'}`,
                  opacity: alert.resolved ? 0.6 : 1,
                  background: alert.resolved ? 'rgba(10, 20, 15, 0.4)' : isCritical ? 'rgba(30, 10, 14, 0.7)' : 'var(--bg-surface-card)'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px' }}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isCritical ? 'rgba(239, 68, 68, 0.2)' : isWarning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                        color: isCritical ? '#fca5a5' : isWarning ? '#fbbf24' : '#7dd3fc'
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        {alert.zoneName || 'Campus Field'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        &bull; {alert.timestamp}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.92rem', color: isCritical ? '#fee2e2' : '#f1f5f9', fontWeight: 500, marginBottom: '6px' }}>
                      {alert.message}
                    </p>

                    {alert.recommendedAction && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--emerald-300)' }}>
                        <strong>Action: </strong>{alert.recommendedAction}
                      </span>
                    )}

                    {alert.resolved && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        ✓ Resolved at {alert.resolvedAt || 'earlier'}
                      </div>
                    )}
                  </div>
                </div>

                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    <Check size={14} /> Mark Resolved
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <DisclaimerAlert />
    </div>
  );
}
