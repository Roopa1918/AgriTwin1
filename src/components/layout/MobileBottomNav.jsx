// AgriTwin — Mobile Bottom Navigation Bar & Slide-Up More Menu
// Adheres strictly to PRD Section 2:
// - Fixed Bottom Navigation: 🏠 Home, 🌾 Fields, 💧 Water, 🌤 Weather, ☰ More
// - Slide-up "More" Drawer with quick access to all secondary/technical pages
// - Touch-friendly: Minimum 44px touch targets
// - Visible only on mobile/tablet viewports (< 1024px)

import React, { useState } from 'react';
import {
  Home,
  MapPin,
  Droplets,
  CloudSun,
  Menu,
  X,
  Layers,
  Leaf,
  ShieldAlert,
  Camera,
  Bell,
  BarChart2,
  CloudRain,
  Sparkles,
  HelpCircle,
  Terminal,
  Sliders,
  Plus,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFields } from '../../context/FieldsContext';

export default function MobileBottomNav({
  currentTab,
  setTab,
  onOpenAddField,
  isMoreOpen,
  setIsMoreOpen
}) {
  const { logout } = useAuth();
  const { activeField } = useFields();

  // Internal state if parent doesn't control `isMoreOpen`
  const [internalMoreOpen, setInternalMoreOpen] = useState(false);
  const moreOpen = isMoreOpen !== undefined ? isMoreOpen : internalMoreOpen;
  const setMoreOpen = setIsMoreOpen !== undefined ? setIsMoreOpen : setInternalMoreOpen;

  const handleTabClick = (tabId) => {
    setMoreOpen(false);
    setTab(tabId);
  };

  // Secondary pages grouped for the "More" slide-up drawer
  const moreSections = [
    {
      title: 'Field Twin & Health',
      items: [
        { id: 'field-monitor', label: '3D Field Twin', icon: Layers, desc: 'Interactive 3D model with soil water' },
        { id: 'plant-health', label: 'Plant Check', icon: Leaf, desc: 'Plant health grid & leaf diagnosis' },
        { id: 'animal-alerts', label: 'Animal Alert', icon: ShieldAlert, desc: 'Perimeter animal entry detection' },
        { id: 'alerts', label: 'Farm Alerts', icon: Bell, desc: 'Warnings, water deficits & notifications' },
        { id: 'field-camera', label: 'Field Camera', icon: Camera, desc: 'View field camera snapshots' }
      ]
    },
    {
      title: 'Insights & Simulation',
      items: [
        { id: 'field-history', label: 'Field History', icon: BarChart2, desc: 'Past soil water, temp & rain records' },
        { id: 'what-if', label: 'Try Weather Changes', icon: CloudRain, desc: 'Simulate rain, heatwaves & dry spells' },
        { id: 'what-may-happen', label: 'What May Happen', icon: Sparkles, desc: 'Next 48h agronomic predictions' },
        { id: 'reports', label: 'Farm Reports', icon: HelpCircle, desc: 'Download field summary reports' }
      ]
    },
    {
      title: 'Tools & Configuration',
      items: [
        { id: 'raw-sensors', label: 'Field Data (IoT)', icon: Terminal, desc: 'Raw sensor readings & telemetry' },
        { id: 'demo-controls', label: 'Demo Mode', icon: Sliders, desc: 'Simulate dry conditions, pests & alerts' },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, desc: 'Field & sensor thresholds' },
        { id: 'how-it-works', label: 'Help & Guide', icon: HelpCircle, desc: 'How AgriTwin works' }
      ]
    }
  ];

  // Check if active tab is one of the secondary pages inside "More"
  const isSecondaryActive = [
    'field-monitor', 'plant-health', 'animal-alerts', 'field-camera',
    'alerts', 'field-history', 'what-if', 'what-may-happen', 'reports',
    'raw-sensors', 'demo-controls', 'settings', 'how-it-works'
  ].includes(currentTab);

  return (
    <>
      {/* ====================================================================
          1. FIXED BOTTOM NAVIGATION BAR (< 1024px)
          ==================================================================== */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          className={`mobile-nav-btn ${currentTab === 'home' && !moreOpen ? 'active' : ''}`}
          aria-label="Home Dashboard"
        >
          <Home size={21} />
          <span className="mobile-nav-label">Home</span>
        </button>

        {/* Tab 2: My Fields */}
        <button
          type="button"
          onClick={() => handleTabClick('my-fields')}
          className={`mobile-nav-btn ${currentTab === 'my-fields' && !moreOpen ? 'active' : ''}`}
          aria-label="My Fields"
        >
          <MapPin size={21} />
          <span className="mobile-nav-label">Fields</span>
        </button>

        {/* Tab 3: Water */}
        <button
          type="button"
          onClick={() => handleTabClick('water')}
          className={`mobile-nav-btn ${currentTab === 'water' && !moreOpen ? 'active' : ''}`}
          aria-label="Water Monitoring"
        >
          <Droplets size={21} />
          <span className="mobile-nav-label">Water</span>
        </button>

        {/* Tab 4: Weather */}
        <button
          type="button"
          onClick={() => handleTabClick('weather')}
          className={`mobile-nav-btn ${currentTab === 'weather' && !moreOpen ? 'active' : ''}`}
          aria-label="Live Weather"
        >
          <CloudSun size={21} />
          <span className="mobile-nav-label">Weather</span>
        </button>

        {/* Tab 5: More (Slide-Up Menu Trigger) */}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className={`mobile-nav-btn ${moreOpen || isSecondaryActive ? 'active' : ''}`}
          aria-label="More Features"
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Menu size={21} />
            {isSecondaryActive && !moreOpen && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -3,
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--emerald-400)',
                  boxShadow: '0 0 6px var(--emerald-400)'
                }}
              />
            )}
          </div>
          <span className="mobile-nav-label">More</span>
        </button>
      </nav>

      {/* ====================================================================
          2. SLIDE-UP "MORE" DRAWER SHEET
          ==================================================================== */}
      {moreOpen && (
        <div
          className="mobile-more-overlay"
          onClick={() => setMoreOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="All Farm Pages"
        >
          <div
            className="mobile-more-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Pull Handle & Header */}
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-handle" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{activeField?.cropIcon || '🌾'}</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                      All AgriTwin Features
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--emerald-400)' }}>
                      Active: {activeField?.name || 'My Field'} ({activeField?.crop || 'Crop'})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="mobile-drawer-close"
                  aria-label="Close Menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Quick Action: Add Field */}
            <div style={{ padding: '0 16px 12px' }}>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  if (onOpenAddField) onOpenAddField();
                }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 700
                }}
              >
                <Plus size={18} />
                <span>+ Add New Field on Map</span>
              </button>
            </div>

            {/* Categorized Menu Items */}
            <div className="mobile-drawer-body">
              {moreSections.map((sec, sIdx) => (
                <div key={sIdx} className="mobile-drawer-section">
                  <div className="mobile-drawer-section-title">
                    {sec.title}
                  </div>
                  <div className="mobile-drawer-items">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTabClick(item.id)}
                          className={`mobile-drawer-item ${isActive ? 'active' : ''}`}
                        >
                          <div className="mobile-drawer-item-icon">
                            <Icon size={18} />
                          </div>
                          <div className="mobile-drawer-item-text">
                            <div className="mobile-drawer-item-label">{item.label}</div>
                            <div className="mobile-drawer-item-desc">{item.desc}</div>
                          </div>
                          <ChevronRight size={16} className="mobile-drawer-item-arrow" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Logout Option */}
              <div style={{ padding: '16px 4px 10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    if (logout) logout();
                  }}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 700
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out of AgriTwin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
