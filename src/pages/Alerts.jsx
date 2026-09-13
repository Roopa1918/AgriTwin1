// AgriTwin — Unified Real-Time Alerts Hub
// Supports Categories (All, Animal 🐾, Pest 🦗, Plant 🌱, Water 💧, Weather ⛈️)
// and Lifecycle Statuses (New, Seen/Acknowledged, Resolved).

import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import DisclaimerAlert from '../components/common/DisclaimerAlert';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Check, 
  Filter,
  ShieldAlert,
  Flame,
  Droplets,
  CloudRain,
  Eye,
  Radio
} from 'lucide-react';

export default function Alerts({ onNavigateToAnimal, onNavigateToPlant, onNavigateTo3D }) {
  const { alerts: telemetryAlerts, resolveAlert } = useTelemetry();

  // Category Tab: 'ALL' | 'ANIMAL' | 'PEST' | 'PLANT' | 'WATER' | 'WEATHER'
  const [activeCategory, setActiveCategory] = useState('ALL');
  // Status Filter: 'ALL' | 'NEW' | 'SEEN' | 'RESOLVED'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Specialized unified alerts list combining telemetry with vision-based alerts
  const [unifiedAlerts, setUnifiedAlerts] = useState([
    {
      id: 'alert-animal-1',
      category: 'ANIMAL',
      severity: 'CRITICAL',
      status: 'NEW', // NEW | SEEN | RESOLVED
      title: '🚨 Cattle Intrusion Detected',
      message: 'Domestic cow detected breaching perimeter fence in Zone 3 (South-West Boundary).',
      zoneName: 'Zone 3 (Perimeter Cam #3)',
      timestamp: '2 mins ago',
      action: 'Trigger ultrasonic deterrent or dispatch perimeter guard',
      confidence: 94
    },
    {
      id: 'alert-pest-1',
      category: 'PEST',
      severity: 'WARNING',
      status: 'NEW',
      title: '🔥 Pest Hotspot Clustered in Row 2',
      message: 'Adjacent plants (P-R02-C03, P-R02-C04, P-R02-C05) exhibiting tobacco caterpillar chewing damage.',
      zoneName: 'Zone 1 (Plot B)',
      timestamp: '25 mins ago',
      action: 'Install pheromone traps; apply NSKE 5% bio-spray',
      confidence: 86
    },
    {
      id: 'alert-plant-1',
      category: 'PLANT',
      severity: 'WARNING',
      status: 'SEEN',
      title: '🌱 Localized Canopy Chlorosis',
      message: 'Plant P-R05-C02 chlorophyll reflectance drop indicates micro-nutrient deficiency or early Cercospora.',
      zoneName: 'Zone 4',
      timestamp: '2 hours ago',
      action: 'Inspect leaf undersides and verify foliar zinc/nitrogen availability',
      confidence: 81
    },
    {
      id: 'alert-water-1',
      category: 'WATER',
      severity: 'CRITICAL',
      status: 'NEW',
      title: '💧 Critical Root-Zone Depletion',
      message: 'Zone 2 moisture dropped to 18.4% — below minimum plant wilting point threshold.',
      zoneName: 'Zone 2 (North-East)',
      timestamp: '4 hours ago',
      action: 'Dispatch 18mm virtual irrigation cycle immediately'
    },
    {
      id: 'alert-weather-1',
      category: 'WEATHER',
      severity: 'INFO',
      status: 'RESOLVED',
      title: '⛈️ Heatwave & Evaporation Advisory',
      message: 'Ambient temperature reached 34.8°C with peak VPD of 2.6 kPa.',
      zoneName: 'Field Weather Station',
      timestamp: 'Yesterday, 02:15 PM',
      action: 'Adjust evening water budget for elevated ET0'
    }
  ]);

  // Handle Mark Seen
  const handleMarkSeen = (id) => {
    setUnifiedAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'SEEN' } : a));
  };

  // Handle Mark Resolved
  const handleMarkResolved = (id) => {
    setUnifiedAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
    // Also resolve in telemetry context if matching
    if (resolveAlert) resolveAlert(id);
  };

  // Filter alerts based on active category and status
  const filteredAlerts = unifiedAlerts.filter(a => {
    if (activeCategory !== 'ALL' && a.category !== activeCategory) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'ANIMAL':
        return { label: '🐾 Animal Alert', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
      case 'PEST':
        return { label: '🦗 Pest Damage', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
      case 'PLANT':
        return { label: '🌱 Plant Health', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
      case 'WATER':
        return { label: '💧 Water Deficit', bg: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc' };
      case 'WEATHER':
        return { label: '⛈️ Weather Stress', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' };
      default:
        return { label: 'General', bg: 'rgba(255, 255, 255, 0.1)', color: '#fff' };
    }
  };

  const getStatusChip = (st) => {
    switch (st) {
      case 'NEW':
        return { label: 'NEW', bg: '#ef4444', color: '#fff' };
      case 'SEEN':
        return { label: 'SEEN', bg: '#f59e0b', color: '#000' };
      case 'RESOLVED':
        return { label: 'RESOLVED', bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399' };
      default:
        return { label: st, bg: 'rgba(255,255,255,0.1)', color: '#fff' };
    }
  };

  const counts = {
    new: unifiedAlerts.filter(a => a.status === 'NEW').length,
    animal: unifiedAlerts.filter(a => a.category === 'ANIMAL' && a.status !== 'RESOLVED').length,
    pest: unifiedAlerts.filter(a => a.category === 'PEST' && a.status !== 'RESOLVED').length,
    water: unifiedAlerts.filter(a => a.category === 'WATER' && a.status !== 'RESOLVED').length
  };

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header-text">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🔔</span> Real-Time Alerts & Anomaly Feed
          </h1>
          <p>
            Unified threat monitoring: Animal boundary breaches, pest chewing symptoms, crop water deficit, and heat advisories.
          </p>
        </div>

        {/* Status Count Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '6px 14px', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 800 }}>
            🚨 {counts.new} New Unread
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '6px 14px', borderRadius: 'var(--radius-md)', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>
            🐾 {counts.animal} Animal
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '6px 14px', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.82rem', fontWeight: 700 }}>
            🦗 {counts.pest} Pest Clusters
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'ANIMAL', label: '🐾 Animal Alerts' },
          { id: 'PEST', label: '🦗 Pest Damage' },
          { id: 'PLANT', label: '🌱 Plant Health' },
          { id: 'WATER', label: '💧 Water Deficit' },
          { id: 'WEATHER', label: '⛈️ Weather Stress' }
        ].map(tab => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--emerald-500)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#000' : '#fff',
                fontWeight: isActive ? 800 : 500,
                border: isActive ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* LIFECYCLE STATUS FILTER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-surface-card)',
        padding: '10px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status Filter:</span>
          {['ALL', 'NEW', 'SEEN', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Showing {filteredAlerts.length} of {unifiedAlerts.length} total events
        </div>
      </div>

      {/* ALERTS FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
            <CheckCircle2 size={38} color="var(--emerald-400)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '4px' }}>No Alerts Matching Filter</h3>
            <p style={{ fontSize: '0.84rem' }}>
              Field parameters and perimeter security operating nominally under selected category.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const catBadge = getCategoryBadge(alert.category);
            const statusBadge = getStatusChip(alert.status);

            return (
              <div
                key={alert.id}
                className="glass-card"
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '18px',
                  flexWrap: 'wrap',
                  borderLeft: `4px solid ${isCritical ? '#ef4444' : alert.severity === 'WARNING' ? '#f59e0b' : '#38bdf8'}`,
                  opacity: alert.status === 'RESOLVED' ? 0.6 : 1,
                  background: alert.status === 'NEW' && isCritical ? 'rgba(35, 10, 14, 0.7)' : 'var(--bg-surface-card)'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                  <div style={{ marginTop: '2px' }}>
                    {alert.category === 'ANIMAL' ? (
                      <ShieldAlert size={22} color="#ef4444" />
                    ) : alert.category === 'PEST' ? (
                      <Flame size={22} color="#f59e0b" />
                    ) : alert.category === 'WATER' ? (
                      <Droplets size={22} color="#38bdf8" />
                    ) : (
                      <AlertCircle size={22} color="#10b981" />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {/* Status Tag */}
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: statusBadge.bg,
                        color: statusBadge.color
                      }}>
                        {statusBadge.label}
                      </span>

                      {/* Category Badge */}
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: catBadge.bg,
                        color: catBadge.color
                      }}>
                        {catBadge.label}
                      </span>

                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                        {alert.zoneName}
                      </span>

                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        &bull; {alert.timestamp}
                      </span>

                      {alert.confidence && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)', background: 'rgba(16,185,129,0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                          AI Conf: {alert.confidence}%
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                      {alert.title}
                    </h3>

                    <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '8px', lineHeight: 1.4 }}>
                      {alert.message}
                    </p>

                    {alert.action && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--emerald-300)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>Action: </strong>
                        <span>{alert.action}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {alert.category === 'ANIMAL' && onNavigateToAnimal && (
                    <button
                      onClick={onNavigateToAnimal}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={13} />
                      <span>View Cam</span>
                    </button>
                  )}

                  {alert.category === 'PEST' && onNavigateToPlant && (
                    <button
                      onClick={onNavigateToPlant}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={13} />
                      <span>View Plant Grid</span>
                    </button>
                  )}

                  {alert.status === 'NEW' && (
                    <button
                      onClick={() => handleMarkSeen(alert.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem' }}
                    >
                      Mark Seen
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleMarkResolved(alert.id)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Check size={14} />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <DisclaimerAlert />
    </div>
  );
}
