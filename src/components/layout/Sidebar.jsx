// AgriTwin — Persistent Sidebar Navigation (PRD Section 4 & 47)
import React from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Cpu, 
  Terminal, 
  Layers, 
  CloudSun, 
  BarChart3, 
  Flame, 
  TrendingUp, 
  Droplets, 
  HeartHandshake, 
  Bell, 
  FileText, 
  Workflow, 
  Sliders, 
  PlaySquare, 
  Settings, 
  LogOut, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Sidebar({ currentTab, setTab, isOpen, setIsOpen }) {
  const { logout, user } = useAuth();
  const { criticalAlertsCount, activeAlerts, setIsPresentationMode } = useTelemetry();

  const mainNavItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'digital-twin', label: 'Digital Twin (3D)', icon: Box, highlight: true },
    { id: 'field-location', label: 'Field Location & Map', icon: MapPin },
    { id: 'live-sensors', label: 'Live Sensors', icon: Cpu },
    { id: 'raw-data', label: 'Raw Sensor Data', icon: Terminal },
    { id: 'soil-monitoring', label: 'Soil Monitoring', icon: Layers },
    { id: 'weather', label: 'Weather & Climate', icon: CloudSun },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'climate-sim', label: 'Climate Simulation', icon: Flame },
    { id: 'prediction', label: 'Prediction', icon: TrendingUp },
    { id: 'irrigation', label: 'Irrigation Intelligence', icon: Droplets },
    { id: 'crop-health', label: 'Crop Health', icon: HeartHandshake },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: Bell, 
      badge: activeAlerts.length > 0 ? activeAlerts.length : null, 
      badgeType: criticalAlertsCount > 0 ? 'critical' : 'info' 
    },
    { id: 'report', label: 'Field Report', icon: FileText },
    { id: 'how-it-works', label: 'How It Works', icon: Workflow }
  ];

  const secondaryNavItems = [
    { id: 'presentation-simulator', label: 'Presentation Simulator', icon: Sliders },
    { id: 'settings', label: 'Field & Thresholds', icon: Settings }
  ];

  const handleNavClick = (tabId) => {
    setTab(tabId);
    if (window.innerWidth <= 1024 && setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header / Logo */}
      <div className="sidebar-header">
        <img src="/favicon.svg" alt="AgriTwin Logo" className="sidebar-logo" />
        <div>
          <div className="sidebar-title">
            <span>AgriTwin</span>
          </div>
          <div className="sidebar-tagline">Digital Twin Platform</div>
        </div>
      </div>

      {/* Presentation Mode Quick Button */}
      <div style={{ padding: '12px 14px 4px' }}>
        <button 
          onClick={() => setIsPresentationMode(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            padding: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={16} color="var(--emerald-400)" />
          <span>Launch Presenter HUD</span>
        </button>
      </div>

      {/* Main Core Navigation */}
      <div className="sidebar-nav-group">
        <span className="sidebar-section-label">Field Twin & Sensors</span>
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <Icon size={18} color={isActive ? 'var(--emerald-400)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badgeType}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Control & Configuration Navigation */}
      <div className="sidebar-nav-group" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
        <span className="sidebar-section-label">Demo Control & System</span>
        {secondaryNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <Icon size={18} color={isActive ? 'var(--emerald-400)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
              {user?.displayName || 'Academic Presenter'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>
              ● Demo Mode Active
            </span>
          </div>
          <button 
            onClick={logout} 
            title="Log out"
            style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: 'var(--radius-sm)', 
              color: '#fca5a5', 
              cursor: 'pointer', 
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
