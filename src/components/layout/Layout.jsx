// AgriTwin — Main Application Shell Layout
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { DemoBanner } from '../common/DemoBadge';
import DemoSimulatorModal from '../presentation/DemoSimulatorModal';
import PresentationMode from '../presentation/PresentationMode';

export default function Layout({ children, currentTab, setTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoControlsOpen, setDemoControlsOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Persistent Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Demo Banner */}
        <DemoBanner />

        {/* Top Application Header */}
        <Header 
          toggleSidebar={() => setSidebarOpen(prev => !prev)}
          openQuickControls={() => setDemoControlsOpen(true)}
        />

        {/* Page Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Quick Demo Simulator Drawer / Modal */}
      <DemoSimulatorModal 
        isOpen={demoControlsOpen} 
        onClose={() => setDemoControlsOpen(false)} 
      />

      {/* Fullscreen Presentation HUD */}
      <PresentationMode />
    </div>
  );
}
