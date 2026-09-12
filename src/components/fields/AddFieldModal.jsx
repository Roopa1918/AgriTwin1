// AgriTwin — Interactive Field Selection & Creation Wizard (PRD Section 5 & 26)
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFields, CROP_OPTIONS } from '../../context/FieldsContext';
import { MapPin, Navigation, X, CheckCircle2, Layers, Crop, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function AddFieldModal({ isOpen, onClose }) {
  const { addField } = useFields();
  const [step, setStep] = useState(1); // 1: Map selection, 2: Name & Crop, 3: Success

  // Form State
  const [fieldName, setFieldName] = useState('My New Field');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [customCrop, setCustomCrop] = useState('');
  const [fieldArea, setFieldArea] = useState('2.5 Acres');
  const [selectedCoords, setSelectedCoords] = useState({ lat: 11.0168, lng: 76.9558 });
  const [drawnBoundary, setDrawnBoundary] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);

  // Initialize Leaflet Map when step 1 is visible
  useEffect(() => {
    if (!isOpen || step !== 1 || !mapContainerRef.current) return;

    // Destroy prior map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [selectedCoords.lat, selectedCoords.lng],
      zoom: 15,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Initial marker
    const markerIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background: #10b981; border: 3px solid #fff; border-radius: 50%; width: 26px; height: 26px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const marker = L.marker([selectedCoords.lat, selectedCoords.lng], { icon: markerIcon }).addTo(map);
    markerRef.current = marker;

    // Handle map clicks to place field or draw boundary
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lng });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }

      // Add to boundary points
      setDrawnBoundary(prev => {
        const nextPts = [...prev, [lat, lng]];
        if (polygonRef.current) {
          map.removeLayer(polygonRef.current);
        }
        if (nextPts.length >= 3) {
          polygonRef.current = L.polygon(nextPts, {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.3
          }).addTo(map);
        }
        return nextPts;
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, step]);

  // Use My Location Feature (PRD Section 27)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          }
        }
      },
      (err) => {
        setLocationLoading(false);
        alert('Could not access your location. You can tap anywhere on the map to choose your field.');
      }
    );
  };

  const handleFinish = () => {
    const finalCrop = selectedCrop === 'Other' && customCrop.trim() ? customCrop.trim() : selectedCrop;
    addField({
      name: fieldName,
      crop: finalCrop,
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      area: fieldArea,
      boundary: drawnBoundary.length >= 3 ? drawnBoundary : null
    });
    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 15, 10, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#0c1e17',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--emerald-400)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Step {step} of 3
            </span>
            <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>
              {step === 1 && 'Where is your field? 🌾'}
              {step === 2 && 'Name your field & crop 🌱'}
              {step === 3 && 'Your field is ready! 🎉'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Interactive Map Selection */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Tap anywhere on the map to place your agricultural field. You can tap multiple times to outline your field boundary.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                <Navigation size={14} color="var(--emerald-400)" />
                <span>{locationLoading ? 'Finding location...' : 'Use My Current Location'}</span>
              </button>

              {drawnBoundary.length > 0 && (
                <button 
                  onClick={() => setDrawnBoundary([])}
                  className="btn btn-secondary btn-sm"
                >
                  Reset Boundary Points ({drawnBoundary.length})
                </button>
              )}
            </div>

            {/* Map Container */}
            <div 
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '340px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>Selected Coordinates: <strong>{selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E</strong></span>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Continue: Name Field</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Name & Crop Selection */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>
                What should we call this field?
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. Tomato Field, North Rice Plot"
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>
                What crop are you growing?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {CROP_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrop(c.id)}
                    style={{
                      background: selectedCrop === c.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${selectedCrop === c.id ? 'var(--emerald-400)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 8px',
                      color: selectedCrop === c.id ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {selectedCrop === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter crop name..."
                  value={customCrop}
                  onChange={(e) => setCustomCrop(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(5, 13, 10, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    color: '#fff',
                    marginTop: '8px',
                    fontSize: '0.88rem'
                  }}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>
                Estimated Field Area
              </label>
              <input
                type="text"
                value={fieldArea}
                onChange={(e) => setFieldArea(e.target.value)}
                placeholder="e.g. 2.5 Acres or 1.0 Hectare"
                style={{
                  width: '100%',
                  background: 'rgba(5, 13, 10, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ArrowLeft size={16} /> Back to Map
              </button>
              <button 
                onClick={handleFinish}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                <span>Create Digital Twin</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Ready & Success Confirmation */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={36} color="var(--emerald-400)" />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>
              {fieldName} is now being monitored! 🌱
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', lineHeight: 1.5 }}>
              AgriTwin has created a 4-zone Digital Twin for your field. Real live weather is now streaming for your location.
            </p>

            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem', marginTop: '10px' }}
            >
              Start Monitoring Field
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
