// AgriTwin — Field Location & GIS Map Page (PRD Section 9 & 10)
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useSettings } from '../context/SettingsContext';
import { useTelemetry } from '../context/TelemetryContext';
import { MapPin, Box, Layers, Calendar, Crop, Maximize, Compass } from 'lucide-react';
import DisclaimerAlert from '../components/common/DisclaimerAlert';

export default function FieldLocation({ setTab }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { fieldConfig } = useSettings();
  const { zones } = useTelemetry();

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const center = [fieldConfig.latitude, fieldConfig.longitude];
    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 17,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Field Boundary Polygon
    const polygon = L.polygon(fieldConfig.boundaryPolygon, {
      color: '#10b981',
      weight: 3,
      fillColor: '#10b981',
      fillOpacity: 0.2
    }).addTo(map);

    polygon.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #065f46; font-size: 14px;">${fieldConfig.name}</strong><br/>
        <span style="font-size: 12px; color: #4b5563;">Area: ${fieldConfig.area} &bull; Crop: ${fieldConfig.crop}</span><br/>
        <span style="font-size: 12px; color: #059669; font-weight: 600;">4 Management Zones Defined</span>
      </div>
    `);

    // Custom Sensor Station Marker
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background: #064e3b;
          border: 2px solid #34d399;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.7);
        ">
          <div style="width: 8px; height: 8px; background: #38bdf8; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(center, { icon: customIcon }).addTo(map);
    marker.bindPopup(`<strong>${fieldConfig.name}</strong><br/>Central Agro-Meteorological Weather Mast`).openPopup();

    // Markers for each zone
    zones.forEach(z => {
      if (z.latLng) {
        const zoneMarker = L.circleMarker(z.latLng, {
          radius: 8,
          fillColor: z.status === 'LOW' ? '#ef4444' : z.status === 'MODERATE' ? '#f59e0b' : '#10b981',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);

        zoneMarker.bindPopup(`
          <strong>${z.name}</strong><br/>
          Moisture: ${z.moisture?.toFixed(1)}%<br/>
          Probe: ${z.sensorId}
        `);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [fieldConfig, zones]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Field Location & Geospatial Map</h1>
          <p>
            Georeferenced farm parcel mapping with polygon boundaries, soil management zones, 
            and GPS telemetry coordinates.
          </p>
        </div>

        <button onClick={() => setTab('digital-twin')} className="btn btn-primary">
          <Box size={16} /> OPEN DIGITAL TWIN
        </button>
      </div>

      {/* Field Metadata Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="metric-card">
          <span className="metric-card-label">Field Name</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            {fieldConfig.name}
          </div>
          <div className="metric-card-footer">
            <span>{fieldConfig.institution}</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">GPS Coordinates</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {fieldConfig.latitude}° N, {fieldConfig.longitude}° E
          </div>
          <div className="metric-card-footer">
            <span>WGS84 Geodetic Datum</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Total Field Area</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            {fieldConfig.area}
          </div>
          <div className="metric-card-footer">
            <span>{fieldConfig.numberOfZones} Subdivided Management Zones</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Cultivated Crop</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald-400)', marginTop: '6px' }}>
            {fieldConfig.crop}
          </div>
          <div className="metric-card-footer">
            <span>Variety: {fieldConfig.cropVariety}</span>
          </div>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div className="glass-card-header">
          <div className="glass-card-title">
            <Compass size={18} color="var(--emerald-400)" />
            <span>OpenStreetMap & Leaflet Geospatial GIS Viewer</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Configurable agricultural plot &bull; Real-time probe status overlay
          </div>
        </div>

        <div 
          ref={mapContainerRef} 
          style={{ 
            width: '100%', 
            height: '480px', 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden', 
            border: '1px solid var(--border-medium)',
            zIndex: 1
          }} 
        />
      </div>

      {/* Detailed Field Attributes Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff' }}>Agronomic Field Specifications</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '0.86rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Sowing Date & Growth Stage</span>
            <strong style={{ color: '#fff' }}>{fieldConfig.sowingDate} ({fieldConfig.growthStage})</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Soil Physical Classification</span>
            <strong style={{ color: '#fff' }}>{fieldConfig.soilType}</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Irrigation Delivery System</span>
            <strong style={{ color: '#fff' }}>{fieldConfig.irrigationType}</strong>
          </div>
        </div>
      </div>

      <DisclaimerAlert />
    </div>
  );
}
