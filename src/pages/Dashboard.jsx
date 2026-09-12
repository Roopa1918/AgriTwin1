// AgriTwin — Main Dashboard Page (PRD Section 11 & 48)
import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useSettings } from '../context/SettingsContext';
import DigitalTwin3D from '../components/3d/DigitalTwin3D';
import ZoneDetailDrawer from '../components/3d/ZoneDetailDrawer';
import MetricCard from '../components/common/MetricCard';
import StatusPill from '../components/common/StatusPill';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  CloudRain, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Layers, 
  Zap, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function Dashboard({ setTab }) {
  const {
    zones,
    avgSoilMoisture,
    avgCropHealth,
    currentTemp,
    currentHumidity,
    currentRainfall,
    activeAlerts,
    criticalAlertsCount,
    selectedZoneId,
    setSelectedZoneId,
    selectedZone,
    recommendations,
    triggerLowMoisture,
    triggerIrrigation,
    resetDemo,
    setIsPresentationMode
  } = useTelemetry();

  const { fieldConfig } = useSettings();

  // Find most critical recommendation
  const primaryRec = recommendations.find(r => r.priority === 'HIGH') || recommendations[0];
  const z2 = zones.find(z => z.id === 'zone2') || zones[1];

  return (
    <div className="page-container">
      {/* Page Title & Field Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Campus Agricultural Field Dashboard</h1>
          <p>
            Real-time cyber-physical synchronization between simulated field IoT sensors, 
            3D canopy telemetry, and automated irrigation decision support.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setTab('digital-twin')} className="btn btn-secondary btn-sm">
            <Layers size={15} /> 3D Twin View
          </button>
          <button onClick={() => setIsPresentationMode(true)} className="btn btn-primary btn-sm">
            <Sparkles size={15} /> Presenter HUD
          </button>
        </div>
      </div>

      {/* Primary 8 KPI Cards (PRD Section 11) */}
      <div className="kpi-grid">
        <MetricCard
          title="Avg Soil Moisture"
          value={avgSoilMoisture}
          unit="%"
          icon={Droplets}
          status={parseFloat(avgSoilMoisture) < 25 ? 'critical' : parseFloat(avgSoilMoisture) < 40 ? 'moderate' : 'good'}
          trend={parseFloat(avgSoilMoisture) < 35 ? 'down' : 'stable'}
          trendText="4-Zone Mean VWC"
          onClick={() => setTab('soil-monitoring')}
        />

        <MetricCard
          title="Ambient Temperature"
          value={currentTemp}
          unit="°C"
          icon={Thermometer}
          status={parseFloat(currentTemp) > 34 ? 'moderate' : 'good'}
          trend="stable"
          trendText="Field Mast Sensor"
          onClick={() => setTab('weather')}
        />

        <MetricCard
          title="Relative Humidity"
          value={currentHumidity}
          unit="%"
          icon={Wind}
          status="good"
          trend="stable"
          trendText="SHT35 Weather Sensor"
          onClick={() => setTab('weather')}
        />

        <MetricCard
          title="Precipitation"
          value={currentRainfall}
          unit="mm"
          icon={CloudRain}
          status="good"
          trend="stable"
          trendText="Davis AeroCone Rain Gauge"
          onClick={() => setTab('weather')}
        />

        <MetricCard
          title="Crop Health Index"
          value={`${avgCropHealth}%`}
          unit=""
          icon={ShieldCheck}
          status={avgCropHealth < 70 ? 'critical' : avgCropHealth < 85 ? 'moderate' : 'good'}
          trend="stable"
          trendText="Demonstration Health Score"
          onClick={() => setTab('crop-health')}
        />

        <MetricCard
          title="Zone 2 Moisture"
          value={`${z2?.moisture?.toFixed(1) ?? '41.8'}`}
          unit="%"
          icon={Activity}
          status={z2?.moisture < 25 ? 'critical' : z2?.moisture < 40 ? 'moderate' : 'good'}
          trend={z2?.moisture < 35 ? 'down' : 'stable'}
          trendText="Demo Target Sensor SM-Z02"
          onClick={() => setSelectedZoneId('zone2')}
        />

        <MetricCard
          title="Active Alerts"
          value={activeAlerts.length}
          unit=""
          icon={AlertTriangle}
          status={criticalAlertsCount > 0 ? 'critical' : activeAlerts.length > 0 ? 'moderate' : 'good'}
          trend={activeAlerts.length > 0 ? 'up' : 'stable'}
          trendText={`${criticalAlertsCount} Critical Threshold Breaches`}
          onClick={() => setTab('alerts')}
        />

        <MetricCard
          title="Digital Twin State"
          value="Online"
          unit=""
          icon={Zap}
          status="good"
          trend="stable"
          trendText="Synchronized (0ms latency)"
          onClick={() => setTab('digital-twin')}
        />
      </div>

      {/* Main Centerpiece: 3D Digital Twin with Quick Actions */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div className="glass-card-header" style={{ marginBottom: '14px' }}>
          <div>
            <div className="glass-card-title">
              <Layers size={18} color="var(--emerald-400)" />
              <span>Campus Field 3D Digital Twin</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Interactive Three.js agricultural model showing Zone 1–4 vegetation health, probe beacons, and irrigation mist
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setTab('digital-twin')} 
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={14} /> Fullscreen Twin
            </button>
          </div>
        </div>

        {/* 3D Canvas Preview */}
        <div style={{ position: 'relative' }}>
          <DigitalTwin3D height={460} onSelectZone={(zId) => setSelectedZoneId(zId)} />
          {selectedZoneId && (
            <ZoneDetailDrawer zoneId={selectedZoneId} onClose={() => setSelectedZoneId(null)} />
          )}
        </div>
      </div>

      {/* 4-Zone Status Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--emerald-400)" />
          <span>Agricultural Zone Telemetry Breakdown</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {zones.map(zone => {
            const isTarget = zone.id === 'zone2';
            return (
              <div 
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                style={{
                  background: zone.id === selectedZoneId ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-card)',
                  border: `1px solid ${zone.id === selectedZoneId ? 'var(--emerald-400)' : zone.status === 'LOW' ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isTarget && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '0.68rem',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    DEMO FOCUS
                  </span>
                )}
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {zone.shortName || zone.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                  Probe: {zone.sensorId} &bull; Area: {zone.area}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                      {zone.moisture?.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Soil Moisture</span>
                  </div>
                  <StatusPill status={zone.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Crop Health:</span>
                    <span style={{ color: '#fff', marginLeft: '6px', fontWeight: 600 }}>{zone.health}%</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Water Stress:</span>
                    <span style={{ color: zone.waterStress === 'High' ? '#f87171' : '#fff', marginLeft: '6px', fontWeight: 600 }}>
                      {zone.waterStress}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Support Advisory & Presenter Quick Trigger Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Automated Recommendation Card (PRD Section 22) */}
        <div className="glass-card" style={{ borderColor: primaryRec?.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color={primaryRec?.priority === 'HIGH' ? '#ef4444' : 'var(--emerald-400)'} />
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Automated Irrigation Decision Support</h3>
            </div>
            {primaryRec && <StatusPill status={primaryRec.priority} label={`Priority: ${primaryRec.priority}`} />}
          </div>

          {primaryRec ? (
            <div>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                "{primaryRec.recommendation}"
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                {primaryRec.reason}
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--emerald-300)', marginBottom: '14px' }}>
                <strong>Recommended Agronomic Action: </strong>{primaryRec.actionableAdvice}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => triggerIrrigation('zone2')} className="btn btn-water btn-sm">
                  <Droplets size={14} /> Execute Virtual Irrigation
                </button>
                <button onClick={() => setTab('irrigation')} className="btn btn-secondary btn-sm">
                  Full Irrigation Table <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No immediate irrigation recommendation under current conditions.</p>
          )}
        </div>

        {/* Presenter Fast Demo Actions */}
        <div className="glass-card">
          <div className="glass-card-header" style={{ marginBottom: '14px' }}>
            <div className="glass-card-title">
              <Sparkles size={18} color="var(--emerald-400)" />
              <span>Presenter Quick Demonstration Triggers</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Step through the PRD demonstration sequence right from the dashboard without navigating away:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <button 
              onClick={triggerLowMoisture}
              className="btn btn-danger btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <AlertTriangle size={15} /> 1. Trigger Low Moisture
            </button>
            <button 
              onClick={() => setTab('climate-sim')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Layers size={15} /> 2. Hot & Dry Climate
            </button>
            <button 
              onClick={() => triggerIrrigation('zone2')}
              className="btn btn-water btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Droplets size={15} /> 3. Simulate Irrigation
            </button>
            <button 
              onClick={resetDemo}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <RotateCcw size={15} /> 4. Reset Demo Baseline
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Each trigger immediately updates the 3D model, sensor streams, active alerts, and analytics.
          </div>
        </div>
      </div>

      {/* Academic Prototype Disclaimer */}
      <DisclaimerAlert />
    </div>
  );
}
