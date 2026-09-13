// AgriTwin — Animal Intrusion Detection & Deterrent Page
// Features: 🚨 ANIMAL DETECTED real-time alert banners, camera snapshot with bounding box,
// zone localization, audible deterrent simulation, intrusion log, and 1-click evaluation triggers.

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Radio, 
  Camera, 
  RotateCcw, 
  Sparkles,
  Eye,
  AlertTriangle,
  Info
} from 'lucide-react';
import { SAMPLE_AI_PRESETS, detectAnimalIntrusion } from '../services/visionService';

export default function AnimalAlertsPage({ onNavigateTo3D }) {
  // Active Alert State
  const [activeAlert, setActiveAlert] = useState({
    id: 'alert-animal-1',
    species: 'Cow (Domestic Cattle)',
    zone: 'Zone 3 — South-West Boundary',
    zoneId: 'zone-3',
    confidence: 94,
    time: '2 mins ago',
    timestamp: '2026-09-13 11:42 AM',
    imageUrl: SAMPLE_AI_PRESETS.cow.url,
    status: 'ACTIVE', // ACTIVE | ACKNOWLEDGED | RESOLVED
    deterrentPlayed: false
  });

  // Historical Intrusion Logs
  const [intrusionLogs, setIntrusionLogs] = useState([
    {
      id: 'log-1',
      species: 'Cow (Domestic Cattle)',
      zone: 'Zone 3',
      time: '2026-09-13 11:42 AM',
      confidence: 94,
      status: 'ACTIVE',
      action: 'Awaiting farmer response'
    },
    {
      id: 'log-2',
      species: 'Wild Boar (Sus scrofa)',
      zone: 'Zone 1 (North Boundary)',
      time: '2026-09-12 08:15 PM',
      confidence: 89,
      status: 'RESOLVED',
      action: 'Ultrasonic acoustic deterrent triggered'
    },
    {
      id: 'log-3',
      species: 'Stray Goat',
      zone: 'Zone 4',
      time: '2026-09-11 04:30 PM',
      confidence: 91,
      status: 'RESOLVED',
      action: 'Worker dispatched / fenced restored'
    }
  ]);

  const [soundFeedback, setSoundFeedback] = useState(false);

  // Trigger Deterrent Acoustic Pulse
  const handleTriggerDeterrent = () => {
    setSoundFeedback(true);
    // Beep sound feedback via Web Audio API if supported
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio feedback not permitted');
    }

    setActiveAlert(prev => prev ? { ...prev, deterrentPlayed: true } : null);
    setTimeout(() => setSoundFeedback(false), 2500);
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = () => {
    if (activeAlert) {
      setActiveAlert(prev => ({ ...prev, status: 'ACKNOWLEDGED' }));
      setIntrusionLogs(prev => prev.map(l => l.id === activeAlert.id ? { ...l, status: 'ACKNOWLEDGED', action: 'Acknowledged by farmer' } : l));
    }
  };

  // Resolve alert
  const handleResolveAlert = () => {
    if (activeAlert) {
      setIntrusionLogs(prev => prev.map(l => l.id === activeAlert.id ? { ...l, status: 'RESOLVED', action: 'Perimeter cleared' } : l));
      setActiveAlert(null);
    }
  };

  // 1-Click Evaluation Demo: Trigger Cow
  const handleSimulateCow = () => {
    const res = detectAnimalIntrusion(SAMPLE_AI_PRESETS.cow.url, 'cow');
    const newAlert = {
      id: `alert-animal-${Date.now()}`,
      species: res.species,
      zone: `${res.zone} — South-West Boundary`,
      zoneId: 'zone-3',
      confidence: res.confidence,
      time: 'Just now',
      timestamp: '2026-09-13 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: res.imageUrl,
      status: 'ACTIVE',
      deterrentPlayed: false
    };
    setActiveAlert(newAlert);
    setIntrusionLogs(prev => [
      {
        id: newAlert.id,
        species: newAlert.species,
        zone: res.zone,
        time: newAlert.timestamp,
        confidence: newAlert.confidence,
        status: 'ACTIVE',
        action: 'Active perimeter alert'
      },
      ...prev
    ]);
  };

  // 1-Click Evaluation Demo: Trigger Wild Boar
  const handleSimulateBoar = () => {
    const res = detectAnimalIntrusion(SAMPLE_AI_PRESETS.wildboar.url, 'wildboar');
    const newAlert = {
      id: `alert-animal-${Date.now()}`,
      species: res.species,
      zone: `${res.zone} — North Ridge Boundary`,
      zoneId: 'zone-1',
      confidence: res.confidence,
      time: 'Just now',
      timestamp: '2026-09-13 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: res.imageUrl,
      status: 'ACTIVE',
      deterrentPlayed: false
    };
    setActiveAlert(newAlert);
    setIntrusionLogs(prev => [
      {
        id: newAlert.id,
        species: newAlert.species,
        zone: res.zone,
        time: newAlert.timestamp,
        confidence: newAlert.confidence,
        status: 'ACTIVE',
        action: 'Wild Boar night sensor alert'
      },
      ...prev
    ]);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header-text">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🐾</span> Animal Intrusion Detection & Deterrent
          </h1>
          <p>
            Edge vision boundary sentinel. Detects large fauna (cattle, wild boars, stray goats) before field trampling occurs.
          </p>
        </div>

        {/* 1-Click Demo Evaluation Triggers */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSimulateCow}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          >
            <span>🐄</span>
            <span>Demo Cow in Zone 3</span>
          </button>

          <button
            onClick={handleSimulateBoar}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
          >
            <span>🐗</span>
            <span>Demo Wild Boar in Zone 1</span>
          </button>

          {activeAlert && (
            <button
              onClick={handleResolveAlert}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={15} color="var(--emerald-400)" />
              <span>Mark All Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE HIGH-PRIORITY BANNER */}
      {activeAlert ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.15) 100%)',
          border: '2px solid #ef4444',
          borderRadius: 'var(--radius-xl)',
          padding: '22px',
          marginBottom: '26px',
          boxShadow: '0 16px 48px rgba(239, 68, 68, 0.25)',
          animation: activeAlert.status === 'ACTIVE' ? 'pulse 2s infinite' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                background: '#ef4444',
                color: '#fff',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
              }}>
                <ShieldAlert size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '1px'
                  }}>
                    🚨 ANIMAL DETECTED
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 600 }}>
                    {activeAlert.time}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginTop: '6px' }}>
                  {activeAlert.species}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={15} color="var(--emerald-400)" />
                    <strong style={{ color: '#fff' }}>{activeAlert.zone}</strong>
                  </span>
                  <span>&bull;</span>
                  <span>AI Confidence: <strong style={{ color: '#34d399' }}>{activeAlert.confidence}%</strong></span>
                  <span>&bull;</span>
                  <span>Status: <strong style={{ color: activeAlert.status === 'ACTIVE' ? '#f87171' : '#fbbf24' }}>{activeAlert.status}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handleTriggerDeterrent}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: soundFeedback ? '#f59e0b' : '#ef4444',
                  borderColor: soundFeedback ? '#f59e0b' : '#ef4444'
                }}
              >
                <Volume2 size={18} />
                <span>{soundFeedback ? '🔊 Deterrent Chime Playing...' : 'Trigger Sound Deterrent'}</span>
              </button>

              {activeAlert.status === 'ACTIVE' && (
                <button
                  onClick={handleAcknowledgeAlert}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Acknowledge</span>
                </button>
              )}

              <button
                onClick={handleResolveAlert}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Clear Alert</span>
              </button>

              {onNavigateTo3D && (
                <button
                  onClick={onNavigateTo3D}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--emerald-400)', color: 'var(--emerald-400)' }}
                >
                  <Eye size={16} />
                  <span>View in 3D Twin</span>
                </button>
              )}
            </div>
          </div>

          {/* Camera Frame Preview */}
          <div style={{
            marginTop: '18px',
            background: 'rgba(0,0,0,0.6)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            padding: '16px'
          }}>
            <div style={{ position: 'relative', height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img
                src={activeAlert.imageUrl}
                alt="Animal Detection Camera"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Synthetic AI Bounding Box */}
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '20%',
                width: '55%',
                height: '55%',
                border: '2px solid #ef4444',
                borderRadius: '4px',
                boxShadow: '0 0 12px rgba(239,68,68,0.8)'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-2px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '2px'
                }}>
                  {activeAlert.species} ({activeAlert.confidence}%)
                </span>
              </div>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'rgba(0,0,0,0.7)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                color: '#fff'
              }}>
                🎥 Perimeter Cam #3 &bull; Live IR Sensor Feed
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>
                Field Intrusion Analysis
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Vision detection algorithm flagged motion along the crop boundary fence. The animal is located within 5 meters of the young seedling plots.
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: 'var(--text-dim)'
              }}>
                <div>🔊 <strong>Automated Acoustic Deterrent:</strong> {activeAlert.deterrentPlayed ? 'Triggered' : 'Standby'}</div>
                <div style={{ marginTop: '4px' }}>📡 <strong>3D Twin Synchronization:</strong> Hazard marker placed in Zone 3</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          marginBottom: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(16,185,129,0.2)', padding: '12px', borderRadius: '50%' }}>
              <CheckCircle2 size={28} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                Perimeter Secure — No Active Intrusions
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                All boundary camera nodes reporting clear field edges. Next scheduled patrol sweep in 4 minutes.
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateCow}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Radio size={14} color="var(--emerald-400)" />
            <span>Simulate Intrusion Event</span>
          </button>
        </div>
      )}

      {/* Historical Intrusion Log Table */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📜</span> Intrusion Event History & Response Log
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Chronological audit trail of edge computer vision detections, species classification, and deterrent actions taken.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--emerald-400)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px' }}>Timestamp</th>
                <th style={{ padding: '10px' }}>Detected Species</th>
                <th style={{ padding: '10px' }}>Zone Location</th>
                <th style={{ padding: '10px' }}>Confidence</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {intrusionLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      <span>{log.time}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#fff' }}>
                    {log.species}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                    {log.zone}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--emerald-400)', fontWeight: 600 }}>
                    {log.confidence}%
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: log.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      color: log.status === 'ACTIVE' ? '#f87171' : '#34d399',
                      border: log.status === 'ACTIVE' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                    {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Disclaimer */}
      <div style={{
        marginTop: '26px',
        padding: '14px 20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={18} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
        <div>
          <strong>Sentinel AI Notice:</strong> Optical animal identification relies on outdoor camera contrast and IR night illuminators. Acoustic deterrents are frequency-tuned to safely dissuade wildlife without harm.
        </div>
      </div>
    </div>
  );
}
