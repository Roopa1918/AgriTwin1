// AgriTwin — Main Application Shell
// Strictly adheres to PRD Sections 1, 6, 16, 17, 25, 26:
// - First Screen: Always Login
// - After Login: If 0 fields, opens "🌾 Select Your Field"
// - Header: Displays Active Field, location, acreage, and prominent "Change Field" button.
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FieldsProvider, useFields } from './context/FieldsContext';
import { TelemetryProvider } from './context/TelemetryContext';

import SimpleNavbar from './components/layout/SimpleNavbar';
import AddFieldModal from './components/fields/AddFieldModal';

// Pages
import Login from './pages/Login';
import SelectFieldPage from './pages/SelectFieldPage';
import HomeDashboard from './pages/HomeDashboard';
import MyFields from './pages/MyFields';
import FieldMonitor from './pages/FieldMonitor';
import WeatherPage from './pages/WeatherPage';
import WaterPage from './pages/WaterPage';
import FieldHistory from './pages/FieldHistory';
import WhatIf from './pages/WhatIf';
import WhatMayHappen from './pages/WhatMayHappen';
import Reports from './pages/Reports';
import RawSensorData from './pages/RawSensorData';
import DemoControls from './pages/DemoControls';
import PlantHealthPage from './pages/PlantHealthPage';
import AnimalAlertsPage from './pages/AnimalAlertsPage';
import FieldCameraPage from './pages/FieldCameraPage';
import Alerts from './pages/Alerts';

import MobileBottomNav from './components/layout/MobileBottomNav';
import { Plus, MapPin, Sparkles, LogOut, ChevronDown, Bell, Menu } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, logout, isDemo } = useAuth();
  const { activeField, fields, setActiveFieldId, loadDemoField } = useFields();
  const [currentTab, setTab] = useState('home');
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isSelectingField, setIsSelectingField] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Requirement 1: When user opens AgriTwin, first screen must always be Login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Requirement 6 & 25: For a new user (or user with 0 fields), show "Select Your Field"
  if (fields.length === 0 || isSelectingField) {
    return (
      <SelectFieldPage
        onCancel={fields.length > 0 ? () => setIsSelectingField(false) : null}
        onFieldCreated={(newField) => {
          setIsSelectingField(false);
          setTab('home');
        }}
      />
    );
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'home':
        return <HomeDashboard setTab={setTab} />;
      case 'my-fields':
        return <MyFields setTab={setTab} onOpenAddField={() => setIsSelectingField(true)} />;
      case 'field-monitor':
        return <FieldMonitor />;
      case 'plant-health':
        return <PlantHealthPage onNavigateToAlerts={() => setTab('alerts')} />;
      case 'animal-alerts':
        return <AnimalAlertsPage onNavigateTo3D={() => setTab('field-monitor')} />;
      case 'field-camera':
        return <FieldCameraPage onNavigateToAnimalAlerts={() => setTab('animal-alerts')} />;
      case 'alerts':
        return (
          <Alerts
            onNavigateToAnimal={() => setTab('animal-alerts')}
            onNavigateToPlant={() => setTab('plant-health')}
            onNavigateTo3D={() => setTab('field-monitor')}
          />
        );
      case 'weather':
        return <WeatherPage />;
      case 'water':
        return <WaterPage />;
      case 'field-history':
        return <FieldHistory />;
      case 'what-if':
        return <WhatIf />;
      case 'what-may-happen':
        return <WhatMayHappen setTab={setTab} />;
      case 'reports':
        return <Reports />;
      case 'raw-sensors':
        return <RawSensorData />;
      case 'demo-controls':
        return <DemoControls setTab={setTab} />;
      default:
        return <HomeDashboard setTab={setTab} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Farmer Navigation Sidebar (Desktop >= 1024px) */}
      <SimpleNavbar
        currentTab={currentTab}
        setTab={setTab}
        onOpenAddField={() => setIsSelectingField(true)}
      />

      {/* Main App Content Wrapper */}
      <div className="main-wrapper">
        {/* ================================================================
            DESKTOP HEADER (>= 1024px) — Preserved Desktop Design
            ================================================================ */}
        <header className="app-header header-desktop">
          {/* Active Field Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.9rem' }}>{activeField?.cropIcon || '🌾'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {activeField?.name}
                </h2>
                <span style={{
                  fontSize: '0.74rem',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--emerald-300)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontWeight: 700
                }}>
                  {activeField?.area}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <MapPin size={12} color="var(--emerald-400)" />
                <span>{activeField?.village || `${activeField?.latitude?.toFixed(2)}°N, ${activeField?.longitude?.toFixed(2)}°E`}</span>
                <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>&bull;</span>
                <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>Active Digital Twin</span>
              </div>
            </div>

            {/* Change Field Button */}
            <button
              onClick={() => setTab('my-fields')}
              className="btn btn-secondary btn-sm"
              style={{
                marginLeft: '6px',
                padding: '5px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderColor: 'rgba(52, 211, 153, 0.4)'
              }}
            >
              <span>Change Field</span>
            </button>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsSelectingField(true)}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} color="var(--emerald-400)" />
              <span>+ Add Field on Map</span>
            </button>

            <button
              onClick={() => setTab('demo-controls')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>Demo Mode</span>
            </button>
          </div>
        </header>

        {/* ================================================================
            MOBILE COMPACT HEADER (< 1024px) — PRD Section 3
            ================================================================ */}
        <header className="app-header header-mobile">
          <div className="mobile-header-brand">
            <span className="mobile-header-logo">🌱</span>
            <span className="mobile-header-title">AgriTwin</span>
            <button
              type="button"
              onClick={() => setTab('my-fields')}
              className="mobile-header-field-chip"
              title="Click to change field"
            >
              <span>{activeField?.cropIcon || '🌾'}</span>
              <span className="mobile-field-chip-name">{activeField?.name || 'My Field'}</span>
            </button>
          </div>

          <div className="mobile-header-actions">
            {/* Quick Alerts Bell Shortcut */}
            <button
              type="button"
              onClick={() => setTab('alerts')}
              className="mobile-header-icon-btn"
              aria-label="View Alerts"
            >
              <Bell size={20} />
              <span className="mobile-alert-dot" />
            </button>

            {/* Menu Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="mobile-header-icon-btn"
              aria-label="Open Farm Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Page View */}
        <main className="main-content-scroll">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <MobileBottomNav
        currentTab={currentTab}
        setTab={setTab}
        onOpenAddField={() => setIsSelectingField(true)}
        isMoreOpen={isMoreOpen}
        setIsMoreOpen={setIsMoreOpen}
      />

      {/* Modal Wizard for Field Creation */}
      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FieldsProvider>
        <TelemetryProvider>
          <AppContent />
        </TelemetryProvider>
      </FieldsProvider>
    </AuthProvider>
  );
}
