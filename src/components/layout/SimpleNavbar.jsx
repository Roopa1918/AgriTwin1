// AgriTwin — Farmer-Friendly Main Navigation (PRD Section 4)
// Clean, simple navigation bar with icons and friendly text labels.

import React from 'react';
import { 
  Home, 
  MapPin, 
  Layers, 
  CloudSun, 
  Droplets, 
  BarChart2, 
  CloudRain, 
  HelpCircle, 
  Settings as SettingsIcon, 
  LogOut, 
  Sparkles,
  Terminal,
  Sliders,
  Leaf,
  ShieldAlert,
  Camera,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFields } from '../../context/FieldsContext';

export default function SimpleNavbar({ currentTab, setTab, onOpenAddField, onOpenDemo }) {
  const { logout, user } = useAuth();
  const { activeField } = useFields();

  const farmerNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-fields', label: 'My Fields', icon: MapPin },
    { id: 'field-monitor', label: '3D Field Twin', icon: Layers },
    { id: 'plant-health', label: 'Plant & Pest Health', icon: Leaf },
    { id: 'animal-alerts', label: 'Animal Intrusion', icon: ShieldAlert },
    { id: 'field-camera', label: 'Field Camera', icon: Camera },
    { id: 'alerts', label: 'Real-Time Alerts', icon: Bell },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'water', label: 'Water', icon: Droplets },
    { id: 'field-history', label: 'Field History', icon: BarChart2 },
    { id: 'what-if', label: 'What-If', icon: CloudRain },
    { id: 'what-may-happen', label: 'What May Happen', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: HelpCircle }
  ];

  const technicalNavItems = [
    { id: 'raw-sensors', label: 'Sensor Data', icon: Terminal },
    { id: 'demo-controls', label: 'Demo Controls', icon: Sliders }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <img src="/favicon.svg" alt="AgriTwin" className="sidebar-logo" />
        <div>
          <div className="sidebar-title">
            <span>AgriTwin</span>
          </div>
          <div className="sidebar-tagline">Smart Field Data</div>
        </div>
      </div>

      {/* Active Field Quick Indicator */}
      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>{activeField?.cropIcon || '🌱'}</span>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                {activeField?.name || 'My Farm'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>
                {activeField?.crop} &bull; {activeField?.area}
              </div>
            </div>
          </div>
          <button 
            onClick={onOpenAddField}
            title="Add another field"
            style={{
              background: 'var(--emerald-500)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '14px'
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Primary Farmer Navigation Items */}
      <div className="sidebar-nav-group">
        <span className="sidebar-section-label">FARM MENU</span>
        {farmerNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <Icon size={18} color={isActive ? 'var(--emerald-400)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Presentation & Technical Mode Section (PRD Section 40) */}
      <div className="sidebar-nav-group" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
        <span className="sidebar-section-label">DEMO / PRESENTATION</span>
        {technicalNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <Icon size={17} color={isActive ? 'var(--emerald-400)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User / Logout */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
              {user?.displayName || 'Farmer'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)' }}>
              🟢 Online
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
