// AgriTwin — Field Monitor Digital Twin Page (PRD Section 12 & 13)
// Interactive 3D canopy & 2D GIS boundary view dynamically rendered for the active field.

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFields } from '../context/FieldsContext';
import { useTelemetry } from '../context/TelemetryContext';
import DynamicDigitalTwin from '../components/3d/DynamicDigitalTwin';
import { Layers, Droplets, MapPin, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

export default function FieldMonitor() {
  const { activeField } = useFields();
  const { zones, waterZone2, isIrrigatingZone2 } = useTelemetry();
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize 2D Leaflet Map when 2D view is toggled
  useEffect(() => {
    if (viewMode !== '2d' || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = activeField?.latitude || 11.0168;
    const lon = activeField?.longitude || 76.9558;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 16,
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: false,
      trackResize: true
    });
    mapInstanceRef.current = map;

    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Draw field boundary polygon
    if (activeField?.boundary && activeField.boundary.length >= 3) {
      L.polygon(activeField.boundary, {
        color: '#10b981',
        weight: 3,
        fillColor: '#10b981',
        fillOpacity: 0.25
      }).addTo(map).bindPopup(`<strong>${activeField.name}</strong><br/>Crop: ${activeField.crop}`);
    } else {
      L.circle([lat, lon], {
        radius: 70,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2
      }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, activeField]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Field Monitor & Digital Twin</h1>
          <p>
            Virtual Cyber-Physical model of <strong>{activeField?.name}</strong>. 
            Visualizes 4 field management zones, soil water status, and animated watering sprinklers.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setViewMode('3d')}
            className={`btn btn-sm ${viewMode === '3d' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', background: viewMode === '3d' ? 'var(--emerald-500)' : 'transparent', color: viewMode === '3d' ? '#fff' : 'var(--text-muted)' }}
          >
            3D Field Twin
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`btn btn-sm ${viewMode === '2d' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', background: viewMode === '2d' ? 'var(--emerald-500)' : 'transparent', color: viewMode === '2d' ? '#fff' : 'var(--text-muted)' }}
          >
            2D Map Boundary
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === '3d' ? (
        <DynamicDigitalTwin height={580} />
      ) : (
        <div className="glass-card" style={{ padding: '16px' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '540px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      )}

      {/* 4-Zone Status Cards with Text Labels (PRD Section 12) */}
      <div>
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '14px' }}>
          Field Zones Condition (Divided into 4 Plots)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {zones.map(z => {
            const isLow = z.soilWater < 25;
            const isWatch = z.soilWater >= 25 && z.soilWater < 40;

            return (
              <div 
                key={z.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  border: `2px solid ${isLow ? '#ef4444' : isWatch ? '#f59e0b' : '#10b981'}`,
                  background: isLow ? 'rgba(30, 10, 14, 0.7)' : 'var(--bg-surface-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{z.name}</h4>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: isLow ? 'rgba(239, 68, 68, 0.2)' : isWatch ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isLow ? '#f87171' : isWatch ? '#fbbf24' : '#34d399'
                  }}>
                    {isLow ? '🔴 Needs Water' : isWatch ? '🟡 Watch' : '🟢 Good'}
                  </span>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                  {z.soilWater?.toFixed(1)}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Soil Water Content</span>

                {isLow && (
                  <button 
                    onClick={waterZone2}
                    className="btn btn-water btn-sm"
                    style={{ width: '100%', marginTop: '14px' }}
                  >
                    <Droplets size={14} />
                    <span>{isIrrigatingZone2 ? 'Sprinklers Active...' : 'Water This Zone'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
