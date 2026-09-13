// AgriTwin — Add Field Modal Wizard
// Supports Search Location, Use My Live Location, Map Boundary Drawing, and Area Calculation.

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFields, CROP_OPTIONS } from '../../context/FieldsContext';
import { useAuth } from '../../context/AuthContext';
import { searchLocations, reverseGeocode, calculatePolygonAcres } from '../../services/geocodingService';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Layers, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function AddFieldModal({ isOpen, onClose }) {
  const { addField } = useFields();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Map & Boundary, 2: Name & Crop, 3: Success

  // Search & Map State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [activeLayer, setActiveLayer] = useState('satellite');

  const [fieldCenter, setFieldCenter] = useState({ lat: 12.5234, lng: 76.8971 });
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [villageName, setVillageName] = useState('Selected Field Location');

  // Form State
  const [fieldName, setFieldName] = useState('My Rice Field');
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [customCrop, setCustomCrop] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery, fieldCenter, 20);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Leaflet Map Init
  useEffect(() => {
    if (!isOpen || step !== 1 || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [fieldCenter.lat, fieldCenter.lng],
      zoom: 15,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    applyTileLayer(map, activeLayer);
    updateMarker(map, fieldCenter.lat, fieldCenter.lng);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setFieldCenter({ lat, lng });

      setBoundaryPoints((prev) => {
        const nextPts = [...prev, [lat, lng]];
        renderPolygon(map, nextPts);
        setCalculatedArea(calculatePolygonAcres(nextPts));
        return nextPts;
      });

      reverseGeocode(lat, lng).then(name => setVillageName(name));
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, step]);

  const applyTileLayer = (map, type) => {
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (type === 'satellite') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      }).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);
    }
  };

  const updateMarker = (map, lat, lng) => {
    if (markerLayerRef.current) map.removeLayer(markerLayerRef.current);
    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background: #10b981; border: 3px solid #fff; border-radius: 50%; width: 24px; height: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    markerLayerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
  };

  const renderPolygon = (map, points) => {
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    if (points.length >= 3) {
      polygonLayerRef.current = L.polygon(points, {
        color: '#10b981',
        weight: 3,
        fillColor: '#10b981',
        fillOpacity: 0.35,
        dashArray: '4, 4'
      }).addTo(map);
    }
  };

  const handleSelectSearchResult = (res) => {
    setSearchQuery(res.name);
    setSearchResults([]);
    setVillageName(res.name);
    setFieldCenter({ lat: res.lat, lng: res.lng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([res.lat, res.lng], 16);
      updateMarker(mapInstanceRef.current, res.lat, res.lng);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFieldCenter({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16);
          updateMarker(mapInstanceRef.current, latitude, longitude);
        }
        reverseGeocode(latitude, longitude).then(name => setVillageName(name));
      },
      (err) => {
        setLocationLoading(false);
        setLocationError("We couldn't access your location. You can search for your field instead.");
      }
    );
  };

  const handleFinish = () => {
    const finalCrop = selectedCrop === 'Other' && customCrop.trim() ? customCrop.trim() : selectedCrop;
    const finalArea = calculatedArea > 0 ? `${calculatedArea} Acres` : '2.0 Acres';

    let poly = boundaryPoints;
    if (poly.length < 3) {
      const lat = fieldCenter.lat;
      const lng = fieldCenter.lng;
      poly = [
        [lat + 0.0012, lng - 0.0012],
        [lat + 0.0012, lng + 0.0012],
        [lat - 0.0012, lng + 0.0012],
        [lat - 0.0012, lng - 0.0012]
      ];
    }

    addField({
      userId: user?.uid || 'user-default',
      name: fieldName.trim() || 'My Farm Field',
      crop: finalCrop,
      latitude: fieldCenter.lat,
      longitude: fieldCenter.lng,
      area: finalArea,
      boundary: poly,
      village: villageName
    });

    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(4, 12, 8, 0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#091c14',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--emerald-400)', fontWeight: 700 }}>
              Step {step} of 3
            </span>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800 }}>
              {step === 1 && '🌾 Select Your Field'}
              {step === 2 && 'Tell us about your field 🌱'}
              {step === 3 && 'Field Created Successfully! 🎉'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Search & Boundary Selection */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Search Bar & Live Location Controls */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} color="var(--emerald-400)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔎 Search location (Village, Town, PIN)..."
                  style={{
                    width: '100%',
                    background: 'rgba(5, 14, 10, 0.85)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px 10px 36px',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <button
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="btn btn-secondary btn-sm"
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Navigation size={14} color="var(--emerald-400)" />
                <span>{locationLoading ? 'Finding...' : '📍 Use Live Location'}</span>
              </button>
            </div>

            {/* Search Loading Indicator */}
            {isSearching && (
              <div style={{
                background: '#0c2219',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                textAlign: 'center',
                color: 'var(--emerald-400)',
                fontSize: '0.84rem'
              }}>
                🔍 Searching places, landmarks & PIN codes...
              </div>
            )}

            {/* Rich Search Suggestions */}
            {!isSearching && searchResults.length > 0 && (
              <div style={{
                background: '#0c2219',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '8px'
              }}>
                {searchResults.map(s => (
                  <div
                    key={s.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{s.name}</strong>
                        {s.type && (
                          <span style={{ fontSize: '0.66rem', color: '#60a5fa', background: 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: '8px' }}>
                            {s.type}
                          </span>
                        )}
                        {s.distance && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--amber-400)', background: 'rgba(245,158,11,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                            📍 {s.distance}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {s.displayName}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectSearchResult(s)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '5px 10px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}

            {locationError && (
              <div style={{ color: '#fca5a5', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> {locationError}
              </div>
            )}

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '320px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {boundaryPoints.length >= 3 
                  ? `✓ ${boundaryPoints.length} points selected (${calculatedArea} acres)` 
                  : 'Tap points on the map to draw your field boundary'}
              </span>

              {boundaryPoints.length > 0 && (
                <button
                  onClick={() => {
                    setBoundaryPoints([]);
                    setCalculatedArea(0);
                    if (mapInstanceRef.current && polygonLayerRef.current) {
                      mapInstanceRef.current.removeLayer(polygonLayerRef.current);
                      polygonLayerRef.current = null;
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={13} />
                  <span>Redraw</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            >
              <span>✓ Use This Field & Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Name & Crop */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
                What should we call this field?
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. My Rice Field, East Maize Plot"
                style={{
                  width: '100%',
                  background: 'rgba(5, 14, 10, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '11px 14px',
                  color: '#fff',
                  fontSize: '0.94rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', color: '#fff', fontWeight: 700, marginBottom: '8px' }}>
                What crop are you growing?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {CROP_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrop(c.id)}
                    style={{
                      background: selectedCrop === c.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${selectedCrop === c.id ? 'var(--emerald-400)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '9px 8px',
                      color: selectedCrop === c.id ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
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
                    background: 'rgba(5, 14, 10, 0.85)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#fff',
                    marginTop: '8px',
                    fontSize: '0.9rem'
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back to Map
              </button>
              <button onClick={handleFinish} className="btn btn-primary" style={{ flex: 2, fontWeight: 700 }}>
                <span>🌱 Create My Field</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={34} color="var(--emerald-400)" />
            </div>

            <h3 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800 }}>
              {fieldName} is now active! 🌱
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '440px', lineHeight: 1.5 }}>
              Your digital twin has been generated. Live weather for {villageName} is now connected.
            </p>

            <button onClick={onClose} className="btn btn-primary" style={{ padding: '11px 28px', fontSize: '0.95rem', fontWeight: 700, marginTop: '8px' }}>
              Open Field Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
