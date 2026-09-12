// AgriTwin — Main Application Shell with Farmer-Friendly Navigation & Multi-Field Support
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FieldsProvider, useFields } from './context/FieldsContext';
import { TelemetryProvider } from './context/TelemetryContext';

import SimpleNavbar from './components/layout/SimpleNavbar';
import AddFieldModal from './components/fields/AddFieldModal';

// Pages
import Login from './pages/Login';
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

import { Menu, Plus, MapPin } from 'lucide-react';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { activeField, fields, setActiveFieldId } = useFields();
  const [currentTab, setTab] = useState('home');
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'home':
        return <HomeDashboard setTab={setTab} />;
      case 'my-fields':
        return <MyFields setTab={setTab} onOpenAddField={() => setIsAddFieldOpen(true)} />;
      case 'field-monitor':
        return <FieldMonitor />;
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
      {/* Farmer Navigation Sidebar */}
      <SimpleNavbar
        currentTab={currentTab}
        setTab={(tab) => { setTab(tab); setSidebarOpen(false); }}
        onOpenAddField={() => setIsAddFieldOpen(true)}
      />

      {/* Main App Content Wrapper */}
      <div className="main-wrapper">
        {/* Top Header with Active Field Quick Selector & Add Field Action */}
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Field Dropdown Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>{activeField?.cropIcon || '🌾'}</span>
              <div>
                <select
                  value={activeField?.id}
                  onChange={(e) => setActiveFieldId(e.target.value)}
                  style={{
                    background: '#091c14',
                    border: '1px solid var(--border-medium)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 12px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.crop})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.72rem', color: 'var(--emerald-400)', marginTop: '2px', marginLeft: '4px' }}>
                  Active Digital Twin
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsAddFieldOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={15} />
              <span>+ Add Field on Map</span>
            </button>
            <button
              onClick={() => setTab('demo-controls')}
              className="btn btn-primary btn-sm"
            >
              <span>Demo Mode</span>
            </button>
          </div>
        </header>

        {/* Page View */}
        <main style={{ flex: 1, paddingBottom: '36px' }}>
          {renderActiveTab()}
        </main>
      </div>

      {/* Interactive Map Field Creation Modal */}
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
